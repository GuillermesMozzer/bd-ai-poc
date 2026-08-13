import { BD_PLANT_SITES, getPlantById, type BdPlantSite } from './bdPlantSites';

export type FleetLane = 'inbound' | 'outbound' | 'transfer';
export type FleetStatus = 'on_time' | 'at_risk' | 'delayed' | 'customs';

export type CargoSkuLine = {
  sku: string;
  name: string;
  qty: number;
  uom: string;
  lot: string;
  imageUrl: string;
};

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
  /** Vehicle dossier */
  vehicle: {
    plate: string;
    makeModel: string;
    year: number;
    type: string;
    axles: number;
    gpsId: string;
    lastService: string;
    photoUrl: string;
  };
  /** Driver dossier */
  driverProfile: {
    name: string;
    license: string;
    licenseClass: string;
    experienceYears: number;
    rating: number;
    languages: string;
    photoUrl: string;
    email: string;
  };
  /** Cargo breakdown */
  cargoLines: CargoSkuLine[];
};

export type LiveTruck = FleetShipment & {
  lat: number;
  lng: number;
  progress: number;
  bearing: number;
  origin: BdPlantSite;
  destination: BdPlantSite;
};

const CORRIDORS: Array<
  Omit<FleetShipment, 'id' | 'trailer' | 'phase' | 'vehicle' | 'driverProfile' | 'cargoLines'> & { count: number }
> = [
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

const VEHICLE_MODELS = [
  { makeModel: 'Kenworth T680', type: 'Dry van 53′', axles: 5 },
  { makeModel: 'Freightliner Cascadia', type: 'Reefer 53′', axles: 5 },
  { makeModel: 'Volvo VNL 760', type: 'Dry van 48′', axles: 5 },
  { makeModel: 'International LT', type: 'Cross-border van', axles: 5 },
];

function cargoLinesFor(cargo: string, cases: number, seed: string): CargoSkuLine[] {
  const base = cargo.toLowerCase();
  const mk = (sku: string, name: string, share: number, lot: string): CargoSkuLine => ({
    sku,
    name,
    qty: Math.max(1, Math.round(cases * share)),
    uom: 'CS',
    lot,
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(sku + seed)}/320/220`,
  });

  if (base.includes('syringe')) {
    return [
      mk('BD-SYR-3ML', 'BD Syringe 3 mL Luer-Lok', 0.45, 'LOT-A-114'),
      mk('BD-NDL-25G', 'BD Needle 25G × 1″', 0.35, 'LOT-A-114'),
      mk('BD-CAP-STD', 'Safety tip caps (bulk)', 0.2, 'LOT-A-119'),
    ];
  }
  if (base.includes('infusion') || base.includes('alaris')) {
    return [
      mk('ALR-PUMP-8015', 'Alaris Pump Module 8015', 0.3, 'LOT-CF-220'),
      mk('CF-SET-IV', 'CareFusion IV set', 0.45, 'LOT-CF-221'),
      mk('CF-ACC-BRKT', 'Pump mounting bracket', 0.25, 'LOT-CF-218'),
    ];
  }
  if (base.includes('diabetes')) {
    return [
      mk('BD-PEN-NDL', 'BD Ultra-Fine Pen Needles', 0.5, 'LOT-DM-090'),
      mk('BD-LANCET', 'BD Microtainer Lancets', 0.3, 'LOT-DM-091'),
      mk('BD-GLU-KIT', 'Glucose control kit', 0.2, 'LOT-DM-088'),
    ];
  }
  if (base.includes('catheter')) {
    return [
      mk('BD-IVC-22G', 'BD IV Catheter 22G', 0.55, 'LOT-IV-310'),
      mk('BD-IVC-20G', 'BD IV Catheter 20G', 0.3, 'LOT-IV-311'),
      mk('BD-DRESS-KIT', 'Site dressing kit', 0.15, 'LOT-IV-300'),
    ];
  }
  return [
    mk('BD-COMP-GEN', cargo.split('·')[0]?.trim() || 'Medical components', 0.6, `LOT-${seed.slice(-3).toUpperCase()}`),
    mk('BD-PKG-SEC', 'Secondary packaging', 0.25, `LOT-${seed.slice(-3).toUpperCase()}B`),
    mk('BD-DOC-PACK', 'Shipping docs / CoC pack', 0.15, `LOT-${seed.slice(-3).toUpperCase()}C`),
  ];
}

function buildFleet(): FleetShipment[] {
  const fleet: FleetShipment[] = [];
  let n = 1;
  CORRIDORS.forEach((corridor, corridorIdx) => {
    for (let i = 0; i < corridor.count; i += 1) {
      const extra = CARRIERS_EXTRA[(corridorIdx + i) % CARRIERS_EXTRA.length];
      const useExtra = i % 2 === 1;
      const id = `TRK-${String(n).padStart(3, '0')}`;
      const trailer = `MX-${4200 + n}`;
      const driverName = useExtra ? extra.driver : corridor.driver;
      const cases = corridor.cases + i * 12;
      const vehicleModel = VEHICLE_MODELS[(n - 1) % VEHICLE_MODELS.length];
      fleet.push({
        id,
        trailer,
        lane: corridor.lane,
        status: i === 0 ? corridor.status : corridor.status === 'on_time' && i === 1 ? 'at_risk' : corridor.status,
        carrier: useExtra ? extra.carrier : corridor.carrier,
        driver: driverName,
        driverPhone: useExtra ? extra.driverPhone : corridor.driverPhone,
        carrierPhone: useExtra ? extra.carrierPhone : corridor.carrierPhone,
        cargo: corridor.cargo,
        cases,
        temperature: corridor.temperature,
        etaLabel: corridor.etaLabel,
        originId: corridor.originId,
        destinationId: corridor.destinationId,
        durationSec: corridor.durationSec + i * 35,
        phase: (corridorIdx * 0.17 + i * 0.29) % 1,
        vehicle: {
          plate: `BD-${String(1000 + n)}-MX`,
          makeModel: vehicleModel.makeModel,
          year: 2021 + (n % 4),
          type: vehicleModel.type,
          axles: vehicleModel.axles,
          gpsId: `GPS-${8800 + n}`,
          lastService: `2026-0${(n % 6) + 1}-12`,
          photoUrl: `https://picsum.photos/seed/truck-${id}/720/420`,
        },
        driverProfile: {
          name: driverName,
          license: `LIC-MX-${4400 + n}`,
          licenseClass: 'Federal B / Cross-border',
          experienceYears: 6 + (n % 12),
          rating: 4.4 + ((n % 5) * 0.1),
          languages: n % 2 === 0 ? 'ES · EN' : 'ES',
          photoUrl: `https://i.pravatar.cc/240?u=${encodeURIComponent(driverName + id)}`,
          email: `${driverName.toLowerCase().replace(/\s+/g, '.')}@carrier.bd-demo.com`,
        },
        cargoLines: cargoLinesFor(corridor.cargo, cases, id),
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
