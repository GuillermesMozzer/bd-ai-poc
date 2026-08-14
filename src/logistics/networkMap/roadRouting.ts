import type { BdPlantSite } from './bdPlantSites';
import { maritimePath } from './maritimeRouting';

/** Leaflet order: [lat, lng] */
export type LatLngTuple = [number, number];

const roadCache = new Map<string, LatLngTuple[]>();
const inflight = new Map<string, Promise<LatLngTuple[]>>();

export function usesRoadNetwork(mode: string) {
  return mode === 'truck' || mode === 'van';
}

export function roadRouteKey(fromId: string, toId: string) {
  return `${fromId}>${toId}`;
}

export function getCachedRoadRoute(fromId: string, toId: string): LatLngTuple[] | undefined {
  return roadCache.get(roadRouteKey(fromId, toId));
}

function toLeaflet(coords: Array<[number, number]>): LatLngTuple[] {
  // OSRM GeoJSON is [lng, lat]
  return coords.map(([lng, lat]) => [lat, lng]);
}

function fallbackStraight(from: BdPlantSite, to: BdPlantSite): LatLngTuple[] {
  return [
    [from.lat, from.lng],
    [to.lat, to.lng],
  ];
}

/** Haversine distance in meters. */
export function haversineMeters(a: LatLngTuple, b: LatLngTuple) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function bearingDegrees(a: LatLngTuple, b: LatLngTuple) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(a[0]);
  const φ2 = toRad(b[0]);
  const Δλ = toRad(b[1] - a[1]);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

/**
 * Interpolate along a polyline by normalized progress t ∈ [0,1],
 * using cumulative distance so motion speed is even along the road.
 */
export function interpolatePolyline(points: LatLngTuple[], t: number): {
  lat: number;
  lng: number;
  bearing: number;
} {
  if (points.length === 0) return { lat: 0, lng: 0, bearing: 0 };
  if (points.length === 1) return { lat: points[0][0], lng: points[0][1], bearing: 0 };

  const clamped = Math.min(1, Math.max(0, t));
  const segLens: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i += 1) {
    const len = haversineMeters(points[i], points[i + 1]);
    segLens.push(len);
    total += len;
  }
  if (total <= 0) {
    const p = points[points.length - 1];
    return { lat: p[0], lng: p[1], bearing: 0 };
  }

  let remain = clamped * total;
  for (let i = 0; i < segLens.length; i += 1) {
    const len = segLens[i];
    if (remain <= len || i === segLens.length - 1) {
      const localT = len <= 0 ? 1 : Math.min(1, remain / len);
      const a = points[i];
      const b = points[i + 1];
      return {
        lat: a[0] + (b[0] - a[0]) * localT,
        lng: a[1] + (b[1] - a[1]) * localT,
        bearing: bearingDegrees(a, b),
      };
    }
    remain -= len;
  }

  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  return { lat: last[0], lng: last[1], bearing: bearingDegrees(prev, last) };
}

/** Great-circle path for air corridors (approx.). */
export function greatCirclePath(from: BdPlantSite, to: BdPlantSite, steps = 48): LatLngTuple[] {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const φ1 = toRad(from.lat);
  const λ1 = toRad(from.lng);
  const φ2 = toRad(to.lat);
  const λ2 = toRad(to.lng);

  const Δ = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2 - φ1) / 2) ** 2
    + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
  ));

  if (!Number.isFinite(Δ) || Δ < 1e-6) return fallbackStraight(from, to);

  const points: LatLngTuple[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const f = i / steps;
    const A = Math.sin((1 - f) * Δ) / Math.sin(Δ);
    const B = Math.sin(f * Δ) / Math.sin(Δ);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);
    points.push([toDeg(φ), toDeg(λ)]);
  }
  return points;
}

async function fetchOsrmDriving(from: BdPlantSite, to: BdPlantSite): Promise<LatLngTuple[]> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/`
    + `${from.lng},${from.lat};${to.lng},${to.lat}`
    + `?overview=full&geometries=geojson&alternatives=false`;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return fallbackStraight(from, to);
    const data = await res.json() as {
      code?: string;
      routes?: Array<{ geometry?: { coordinates?: Array<[number, number]> } }>;
    };
    const coords = data.routes?.[0]?.geometry?.coordinates;
    if (data.code !== 'Ok' || !coords || coords.length < 2) return fallbackStraight(from, to);
    return toLeaflet(coords);
  } catch {
    return fallbackStraight(from, to);
  } finally {
    window.clearTimeout(timer);
  }
}

export async function ensureRoadRoute(from: BdPlantSite, to: BdPlantSite): Promise<LatLngTuple[]> {
  const key = roadRouteKey(from.id, to.id);
  const cached = roadCache.get(key);
  if (cached) return cached;

  const pending = inflight.get(key);
  if (pending) return pending;

  const job = fetchOsrmDriving(from, to).then((path) => {
    roadCache.set(key, path);
    inflight.delete(key);
    return path;
  });
  inflight.set(key, job);
  return job;
}

export type RoutePair = { from: BdPlantSite; to: BdPlantSite };

/**
 * Preload driving routes for unique OD pairs (and reverse for ping-pong).
 * Throttled to avoid hammering the public OSRM demo.
 */
export async function preloadRoadRoutes(
  pairs: RoutePair[],
  onProgress?: (done: number, total: number) => void,
): Promise<void> {
  const unique = new Map<string, RoutePair>();
  pairs.forEach(({ from, to }) => {
    unique.set(roadRouteKey(from.id, to.id), { from, to });
    unique.set(roadRouteKey(to.id, from.id), { from: to, to: from });
  });

  const list = [...unique.values()];
  let done = 0;
  for (const pair of list) {
    // eslint-disable-next-line no-await-in-loop
    await ensureRoadRoute(pair.from, pair.to);
    done += 1;
    onProgress?.(done, list.length);
    // Gentle throttle for public OSRM
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => window.setTimeout(r, 120));
  }
}

export function pathForMode(
  mode: string,
  from: BdPlantSite,
  to: BdPlantSite,
): LatLngTuple[] {
  if (usesRoadNetwork(mode)) {
    return getCachedRoadRoute(from.id, to.id) ?? fallbackStraight(from, to);
  }
  if (mode === 'plane') return greatCirclePath(from, to);
  if (mode === 'ship') return maritimePath(from, to);
  // Train: land corridor (great-circle densified) — not maritime
  return greatCirclePath(from, to, 16);
}
