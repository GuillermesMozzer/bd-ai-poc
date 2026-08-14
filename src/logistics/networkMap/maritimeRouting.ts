import { seaRoute } from 'searoute-ts';
import type { BdPlantSite } from './bdPlantSites';
import type { LatLngTuple } from './roadRouting';

const maritimeCache = new Map<string, LatLngTuple[]>();

function cacheKey(fromId: string, toId: string) {
  return `${fromId}>${toId}`;
}

function greatCirclePair(from: BdPlantSite, to: BdPlantSite, steps = 24): LatLngTuple[] {
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
  if (!Number.isFinite(Δ) || Δ < 1e-6) {
    return [[from.lat, from.lng], [to.lat, to.lng]];
  }
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

function densifySegment(a: LatLngTuple, b: LatLngTuple, maxStepNm = 80): LatLngTuple[] {
  // Rough nm using haversine km / 1.852
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2
    + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const km = 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
  const nm = km / 1.852;
  const steps = Math.max(1, Math.ceil(nm / maxStepNm));
  if (steps <= 1) return [a, b];

  // Spherical interpolation between a and b
  const φ1 = toRad(a[0]);
  const λ1 = toRad(a[1]);
  const φ2 = toRad(b[0]);
  const λ2 = toRad(b[1]);
  const Δ = 2 * Math.asin(Math.sqrt(
    Math.sin((φ2 - φ1) / 2) ** 2
    + Math.cos(φ1) * Math.cos(φ2) * Math.sin((λ2 - λ1) / 2) ** 2,
  ));
  if (!Number.isFinite(Δ) || Δ < 1e-8) return [a, b];

  const out: LatLngTuple[] = [a];
  const toDeg = (r: number) => (r * 180) / Math.PI;
  for (let i = 1; i < steps; i += 1) {
    const f = i / steps;
    const A = Math.sin((1 - f) * Δ) / Math.sin(Δ);
    const B = Math.sin(f * Δ) / Math.sin(Δ);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    const φ = Math.atan2(z, Math.sqrt(x * x + y * y));
    const λ = Math.atan2(y, x);
    out.push([toDeg(φ), toDeg(λ)]);
  }
  out.push(b);
  return out;
}

function densifyMaritime(points: LatLngTuple[]): LatLngTuple[] {
  if (points.length < 2) return points;
  const out: LatLngTuple[] = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const seg = densifySegment(points[i], points[i + 1]);
    if (i === 0) out.push(...seg);
    else out.push(...seg.slice(1));
  }
  return out;
}

/**
 * Sea / coastal route that stays on the Eurostat maritime network
 * (oceans, seas, major straits/canals — not over landmasses).
 * Coordinates are Leaflet [lat, lng].
 */
export function maritimePath(from: BdPlantSite, to: BdPlantSite): LatLngTuple[] {
  const key = cacheKey(from.id, to.id);
  const cached = maritimeCache.get(key);
  if (cached) return cached;

  try {
    // searoute-ts expects GeoJSON [lng, lat]
    const feature = seaRoute([from.lng, from.lat], [to.lng, to.lat]);
    const coords = feature?.geometry?.coordinates as Array<[number, number]> | undefined;
    if (!coords || coords.length < 2) {
      const fallback = greatCirclePair(from, to, 32);
      maritimeCache.set(key, fallback);
      return fallback;
    }

    const leaflet: LatLngTuple[] = coords.map(([lng, lat]) => [lat, lng]);
    // Include true endpoints so animation starts/ends at plant markers
    const withEnds: LatLngTuple[] = [
      [from.lat, from.lng],
      ...leaflet,
      [to.lat, to.lng],
    ];
    const path = densifyMaritime(withEnds);
    maritimeCache.set(key, path);
    return path;
  } catch {
    const midLat = (from.lat + to.lat) / 2;
    const midLng = (from.lng + to.lng) / 2;
    const oceanBiasLng = Math.abs(from.lng - to.lng) > 40
      ? midLng
      : midLng + (Math.abs(midLng) < 30 ? (midLat >= 0 ? -25 : 25) : 0);
    const oceanBiasLat = Math.abs(midLat) < 15 ? midLat : Math.sign(midLat) * Math.min(Math.abs(midLat), 25);
    const via: BdPlantSite = {
      ...from,
      id: `${from.id}-sea-via`,
      lat: oceanBiasLat,
      lng: oceanBiasLng,
    };
    const fallback = [
      ...greatCirclePair(from, via, 20).slice(0, -1),
      ...greatCirclePair(via, to, 20),
    ];
    maritimeCache.set(key, fallback);
    return fallback;
  }
}
