import { BD_PLANT_SITES, getPlantById, type BdPlantSite } from './bdPlantSites';

export type FleetLane = 'inbound' | 'outbound' | 'transfer';
export type FleetStatus = 'on_time' | 'at_risk' | 'delayed' | 'customs';

export type FleetShipment = {
  id: string;
  trailer: string;
  lane: FleetLane;
  status: FleetStatus;
  carrier: string;
  driver: string;
  driverPhone: string;
  carrierPhone: string;
  cargo: string;
  cases: number;
  temperature: string;
  etaLabel: string;
  originId: string;
  destinationId: string;
  /** Seconds for a full origin→destination hop (then loops). */
  durationSec: number;
  /** Stagger so trucks are not synchronized. */
  phase: number;
};

export type LiveTruck = FleetShipment & {
  lat: number;
  lng: number;
  progress: number;
  bearing: number;
  origin: BdPlantSite;
  destination: BdPlantSite;
};

const CORRIDORS: Array<Omit<FleetShipment, 'id' | 'trailer' | 'phase'> & { count: number }> = [
  {
    count: 3,
    lane: 'inbound',
    status: 'on_time',
    carrier: 'Transportes del Norte 4PL',
    driver: 'Carlos Mendoza',
    driverPhone: '+52 55 8120 4411',
    carrierPhone: '+52 55 8000 2200',
    cargo: 'Syringe barrels · LOT-A-114',
    cases: 420,
    temperature: 'Ambient',
    etaLabel: '2h 10m',
    originId: 'mx-cuautitlan',
    destinationId: 'mx-tepotzotlan',
    durationSec: 220,
  },
  {
    count: 2,
    lane: 'outbound',
    status: 'customs',
    carrier: 'BorderLink Logistics',
    driver: 'María Elena Ríos',
    driverPhone: '+1 915 555 0188',
    carrierPhone: '+1 915 555 0100',
    cargo: 'Infusion sets · CareFusion',
    cases: 180,
    temperature: 'Controlled 15–25°C',
    etaLabel: 'Customs hold',
    originId: 'mx-juarez',
    destinationId: 'us-elpaso',
    durationSec: 360,
  },
  {
    count: 2,
    lane: 'outbound',
    status: 'on_time',
    carrier: 'Pacific Medical Freight',
    driver: 'Diego Alvarez',
    driverPhone: '+52 664 555 2299',
    carrierPhone: '+52 664 555 2000',
    cargo: 'Alaris pump modules',
    cases: 96,
    temperature: 'Ambient',
    etaLabel: '4h 40m',
    originId: 'mx-tijuana-2',
    destinationId: 'mx-tijuana-1',
    durationSec: 180,
  },
  {
    count: 2,
    lane: 'transfer',
    status: 'at_risk',
    carrier: 'Sonora Express 3PL',
    driver: 'Luis Ortega',
    driverPhone: '+52 631 555 7733',
    carrierPhone: '+52 631 555 7700',
    cargo: 'Sterile components',
    cases: 240,
    temperature: 'Ambient',
    etaLabel: 'Risk · weather',
    originId: 'mx-nogales-norte',
    destinationId: 'mx-hermosillo',
    durationSec: 480,
  },
  {
    count: 2,
    lane: 'outbound',
    status: 'on_time',
    carrier: 'Golfo Farma Transport',
    driver: 'Ana Patricia Cruz',
    driverPhone: '+52 899 555 3310',
    carrierPhone: '+52 899 555 3300',
    cargo: 'Diabetes control kits',
    cases: 310,
    temperature: 'Ambient',
    etaLabel: '6h 05m',
    originId: 'mx-reynosa',
    destinationId: 'mx-slp',
    durationSec: 520,
  },
  {
    count: 2,
    lane: 'inbound',
    status: 'delayed',
    carrier: 'Midwest BD Shuttle',
    driver: 'James Porter',
    driverPhone: '+1 402 555 0192',
    carrierPhone: '+1 402 555 0101',
    cargo: 'Pharma systems · Columbus',
    cases: 150,
    temperature: 'Ambient',
    etaLabel: 'Delayed +1h',
    originId: 'us-columbus-pharma',
    destinationId: 'us-columbus-west',
    durationSec: 200,
  },
  {
    count: 2,
    lane: 'transfer',
    status: 'on_time',
    carrier: 'Desert Corridor 4PL',
    driver: 'Sofía Navarro',
    driverPhone: '+52 656 555 4488',
    carrierPhone: '+52 656 555 4400',
    cargo: 'IV catheter WIP',
    cases: 205,
    temperature: 'Ambient',
    etaLabel: '3h 25m',
    originId: 'us-sandy',
    destinationId: 'us-elpaso',
    durationSec: 640,
  },
  {
    count: 2,
    lane: 'inbound',
    status: 'on_time',
    carrier: 'Nogales Crossdock',
    driver: 'Héctor Salinas',
    driverPhone: '+52 631 555 1190',
    carrierPhone: '+52 631 555 1100',
    cargo: 'Sterile assembly lots',
    cases: 175,
    temperature: 'Ambient',
    etaLabel: '55m',
    originId: 'mx-nogales-sur',
    destinationId: 'mx-nogales-norte',
    durationSec: 160,
  },
];

const CARRIERS_EXTRA = [
  { carrier: 'Atlas Lane MX', driver: 'Paola Jiménez', driverPhone: '+52 55 7000 1188', carrierPhone: '+52 55 7000 1100' },
  { carrier: 'Northstar Medical', driver: 'Ryan Cole', driverPhone: '+1 201 555 0177', carrierPhone: '+1 201 555 0102' },
];

function buildFleet(): FleetShipment[] {
  const fleet: FleetShipment[] = [];
  let n = 1;
  CORRIDORS.forEach((corridor, corridorIdx) => {
    for (let i = 0; i < corridor.count; i += 1) {
      const extra = CARRIERS_EXTRA[(corridorIdx + i) % CARRIERS_EXTRA.length];
      const useExtra = i % 2 === 1;
      fleet.push({
        id: `TRK-${String(n).padStart(3, '0')}`,
        trailer: `MX-${4200 + n}`,
        lane: corridor.lane,
        status: i === 0 ? corridor.status : corridor.status === 'on_time' && i === 1 ? 'at_risk' : corridor.status,
        carrier: useExtra ? extra.carrier : corridor.carrier,
        driver: useExtra ? extra.driver : corridor.driver,
        driverPhone: useExtra ? extra.driverPhone : corridor.driverPhone,
        carrierPhone: useExtra ? extra.carrierPhone : corridor.carrierPhone,
        cargo: corridor.cargo,
        cases: corridor.cases + i * 12,
        temperature: corridor.temperature,
        etaLabel: corridor.etaLabel,
        originId: corridor.originId,
        destinationId: corridor.destinationId,
        durationSec: corridor.durationSec + i * 35,
        phase: (corridorIdx * 0.17 + i * 0.29) % 1,
      });
      n += 1;
    }
  });
  return fleet;
}

export const FLEET_SEED = buildFleet();

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Ease in-out for smoother convoy motion. */
export function smoothstep(t: number) {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

export function bearingDegrees(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δλ = toRad(lng2 - lng1);
  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export function interpolateTruck(shipment: FleetShipment, nowMs: number): LiveTruck | null {
  const origin = getPlantById(shipment.originId);
  const destination = getPlantById(shipment.destinationId);
  if (!origin || !destination) return null;

  const cycle = shipment.durationSec * 1000;
  const elapsed = (nowMs + shipment.phase * cycle) % (cycle * 2);
  // Ping-pong: go then return
  const going = elapsed < cycle;
  const raw = (elapsed % cycle) / cycle;
  const t = smoothstep(raw);
  const from = going ? origin : destination;
  const to = going ? destination : origin;
  const lat = lerp(from.lat, to.lat, t);
  const lng = lerp(from.lng, to.lng, t);

  return {
    ...shipment,
    lat,
    lng,
    progress: going ? t : 1 - t,
    bearing: bearingDegrees(from.lat, from.lng, to.lat, to.lng),
    origin: going ? origin : destination,
    destination: going ? destination : origin,
  };
}

export function sampleLiveFleet(nowMs = Date.now()): LiveTruck[] {
  return FLEET_SEED.map((s) => interpolateTruck(s, nowMs)).filter(Boolean) as LiveTruck[];
}

export function fleetKpis(trucks: LiveTruck[]) {
  return {
    active: trucks.length,
    inbound: trucks.filter((t) => t.lane === 'inbound').length,
    outbound: trucks.filter((t) => t.lane === 'outbound').length,
    transfer: trucks.filter((t) => t.lane === 'transfer').length,
    atRisk: trucks.filter((t) => t.status === 'at_risk' || t.status === 'delayed' || t.status === 'customs').length,
    plants: BD_PLANT_SITES.length,
  };
}
