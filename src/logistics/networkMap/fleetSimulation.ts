import { BD_PLANT_SITES, getPlantById, type BdPlantSite } from './bdPlantSites';
import {
  interpolatePolyline,
  pathForMode,
  usesRoadNetwork,
} from './roadRouting';

export type FleetLane = 'inbound' | 'outbound' | 'transfer';
export type FleetStatus = 'on_time' | 'at_risk' | 'delayed' | 'customs';
export type TransportMode = 'plane' | 'truck' | 'van' | 'ship' | 'train';
export type ProductType = 'raw_material' | 'finished_good';
export type DemandDueStatus = 'on_time' | 'delayed' | 'nearing_due' | 'at_risk' | 'overdue';

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
  mode: TransportMode;
  productType: ProductType;
  demandStatus: DemandDueStatus;
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
  /** Stagger so assets are not synchronized. */
  phase: number;
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
  cargoLines: CargoSkuLine[];
};

export type LiveTruck = FleetShipment & {
  lat: number;
  lng: number;
  progress: number;
  bearing: number;
  origin: BdPlantSite;
  destination: BdPlantSite;
  /** Active corridor geometry for map polyline ([lat, lng]). */
  path: Array<[number, number]>;
};

export const TRANSPORT_MODES: TransportMode[] = ['plane', 'truck', 'van', 'ship', 'train'];
export const PRODUCT_TYPES: ProductType[] = ['raw_material', 'finished_good'];
export const DEMAND_DUE_STATUSES: DemandDueStatus[] = [
  'on_time',
  'delayed',
  'nearing_due',
  'at_risk',
  'overdue',
];
export const FLEET_LANES: FleetLane[] = ['inbound', 'outbound', 'transfer'];

export function transportModeLabel(mode: TransportMode) {
  if (mode === 'plane') return 'Plane';
  if (mode === 'truck') return 'Truck';
  if (mode === 'van') return 'Van';
  if (mode === 'ship') return 'Ship';
  return 'Train';
}

export function productTypeLabel(type: ProductType) {
  return type === 'raw_material' ? 'Raw material' : 'Finished good';
}

export function demandDueStatusLabel(status: DemandDueStatus) {
  if (status === 'on_time') return 'On time';
  if (status === 'delayed') return 'Delayed';
  if (status === 'nearing_due') return 'Nearing due';
  if (status === 'at_risk') return 'At risk';
  return 'Overdue';
}

type CorridorSeed = {
  mode: TransportMode;
  lane: FleetLane;
  status: FleetStatus;
  productType: ProductType;
  demandStatus: DemandDueStatus;
  originId: string;
  destinationId: string;
  cargo: string;
  cases: number;
  temperature: string;
  etaLabel: string;
  durationSec: number;
  count: number;
  carrier: string;
  driver: string;
  driverPhone: string;
  carrierPhone: string;
};

/** Multi-modal corridor seeds covering plane / truck / van / ship / train. */
const CORRIDOR_SEEDS: CorridorSeed[] = [
  // Plane
  {
    mode: 'plane',
    lane: 'outbound',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'on_time',
    originId: 'us-franklin',
    destinationId: 'us-columbus-pharma',
    cargo: 'Pharma systems airfreight',
    cases: 64,
    temperature: 'Controlled 15–25°C',
    etaLabel: '3h 20m',
    durationSec: 280,
    count: 2,
    carrier: 'BD Air Logistics',
    driver: 'Captain Elena Brooks',
    driverPhone: '+1 201 555 0144',
    carrierPhone: '+1 201 555 0100',
  },
  {
    mode: 'plane',
    lane: 'inbound',
    status: 'at_risk',
    productType: 'raw_material',
    demandStatus: 'nearing_due',
    originId: 'us-sandy',
    destinationId: 'mx-tijuana-1',
    cargo: 'Catheter resin feedstock',
    cases: 88,
    temperature: 'Ambient',
    etaLabel: 'Slot risk',
    durationSec: 360,
    count: 1,
    carrier: 'SkyBridge Medical Air',
    driver: 'Captain Ryan Cole',
    driverPhone: '+1 801 555 0199',
    carrierPhone: '+1 801 555 0102',
  },
  {
    mode: 'plane',
    lane: 'transfer',
    status: 'delayed',
    productType: 'finished_good',
    demandStatus: 'delayed',
    originId: 'us-columbus-west',
    destinationId: 'us-elpaso',
    cargo: 'Syringe kits · air transfer',
    cases: 52,
    temperature: 'Ambient',
    etaLabel: 'Delayed +45m',
    durationSec: 400,
    count: 1,
    carrier: 'Midwest Air Cargo',
    driver: 'Captain Priya Patel',
    driverPhone: '+1 402 555 0177',
    carrierPhone: '+1 402 555 0101',
  },
  // Truck
  {
    mode: 'truck',
    lane: 'inbound',
    status: 'on_time',
    productType: 'raw_material',
    demandStatus: 'on_time',
    originId: 'mx-cuautitlan',
    destinationId: 'mx-tepotzotlan',
    cargo: 'Syringe barrels · LOT-A-114',
    cases: 420,
    temperature: 'Ambient',
    etaLabel: '2h 10m',
    durationSec: 220,
    count: 2,
    carrier: 'Northern Corridor 4PL',
    driver: 'Carlos Mendoza',
    driverPhone: '+52 55 8120 4411',
    carrierPhone: '+52 55 8000 2200',
  },
  {
    mode: 'truck',
    lane: 'outbound',
    status: 'customs',
    productType: 'finished_good',
    demandStatus: 'at_risk',
    originId: 'mx-juarez',
    destinationId: 'us-elpaso',
    cargo: 'Infusion sets · CareFusion',
    cases: 180,
    temperature: 'Controlled 15–25°C',
    etaLabel: 'Customs hold',
    durationSec: 360,
    count: 2,
    carrier: 'BorderLink Logistics',
    driver: 'Maria Elena Rios',
    driverPhone: '+1 915 555 0188',
    carrierPhone: '+1 915 555 0100',
  },
  {
    mode: 'truck',
    lane: 'outbound',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'on_time',
    originId: 'mx-reynosa',
    destinationId: 'mx-slp',
    cargo: 'Diabetes control kits',
    cases: 310,
    temperature: 'Ambient',
    etaLabel: '6h 05m',
    durationSec: 520,
    count: 2,
    carrier: 'Gulf Pharma Transport',
    driver: 'Ana Patricia Cruz',
    driverPhone: '+52 899 555 3310',
    carrierPhone: '+52 899 555 3300',
  },
  {
    mode: 'truck',
    lane: 'transfer',
    status: 'at_risk',
    productType: 'raw_material',
    demandStatus: 'overdue',
    originId: 'mx-nogales-norte',
    destinationId: 'mx-hermosillo',
    cargo: 'Sterile components',
    cases: 240,
    temperature: 'Ambient',
    etaLabel: 'Weather risk',
    durationSec: 480,
    count: 1,
    carrier: 'Sonora Express 3PL',
    driver: 'Luis Ortega',
    driverPhone: '+52 631 555 7733',
    carrierPhone: '+52 631 555 7700',
  },
  // Van
  {
    mode: 'van',
    lane: 'transfer',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'on_time',
    originId: 'mx-tijuana-2',
    destinationId: 'mx-tijuana-1',
    cargo: 'Alaris pump modules',
    cases: 36,
    temperature: 'Ambient',
    etaLabel: '55m',
    durationSec: 160,
    count: 2,
    carrier: 'Pacific Medical Freight',
    driver: 'Diego Alvarez',
    driverPhone: '+52 664 555 2299',
    carrierPhone: '+52 664 555 2000',
  },
  {
    mode: 'van',
    lane: 'inbound',
    status: 'delayed',
    productType: 'raw_material',
    demandStatus: 'delayed',
    originId: 'us-columbus-pharma',
    destinationId: 'us-columbus-west',
    cargo: 'Pharma line change parts',
    cases: 28,
    temperature: 'Ambient',
    etaLabel: 'Delayed +1h',
    durationSec: 200,
    count: 1,
    carrier: 'Midwest BD Shuttle',
    driver: 'James Porter',
    driverPhone: '+1 402 555 0192',
    carrierPhone: '+1 402 555 0101',
  },
  {
    mode: 'van',
    lane: 'outbound',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'nearing_due',
    originId: 'mx-nogales-sur',
    destinationId: 'mx-nogales-norte',
    cargo: 'Sterile assembly lots',
    cases: 44,
    temperature: 'Ambient',
    etaLabel: '1h 05m',
    durationSec: 150,
    count: 1,
    carrier: 'Nogales Crossdock',
    driver: 'Hector Salinas',
    driverPhone: '+52 631 555 1190',
    carrierPhone: '+52 631 555 1100',
  },
  // Ship — coastal / ocean corridors only (routed on maritime network)
  {
    mode: 'ship',
    lane: 'inbound',
    status: 'on_time',
    productType: 'raw_material',
    demandStatus: 'on_time',
    originId: 'uk-plymouth',
    destinationId: 'ma-casablanca',
    cargo: 'Bulk polymer resin · Atlantic',
    cases: 900,
    temperature: 'Ambient',
    etaLabel: '3d 6h',
    durationSec: 900,
    count: 1,
    carrier: 'Atlantic Medical Sealift',
    driver: 'Capt. Nora Vidal',
    driverPhone: '+212 522 555 0220',
    carrierPhone: '+212 522 555 0200',
  },
  {
    mode: 'ship',
    lane: 'outbound',
    status: 'customs',
    productType: 'finished_good',
    demandStatus: 'at_risk',
    originId: 'mx-tijuana-1',
    destinationId: 'au-sydney',
    cargo: 'Infusion finished goods · Pacific',
    cases: 640,
    temperature: 'Controlled 15–25°C',
    etaLabel: 'Port hold',
    durationSec: 1100,
    count: 1,
    carrier: 'Pacific Medical Sealine',
    driver: 'Capt. Owen Park',
    driverPhone: '+1 619 555 0166',
    carrierPhone: '+1 619 555 0108',
  },
  {
    mode: 'truck',
    lane: 'transfer',
    status: 'delayed',
    productType: 'raw_material',
    demandStatus: 'overdue',
    originId: 'mx-hermosillo',
    destinationId: 'mx-juarez',
    cargo: 'Diagnostics glass feedstock',
    cases: 520,
    temperature: 'Ambient',
    etaLabel: 'Delayed · highway',
    durationSec: 480,
    count: 1,
    carrier: 'Desert Corridor Freight',
    driver: 'Sofia Navarro',
    driverPhone: '+52 656 555 4488',
    carrierPhone: '+52 656 555 4400',
  },
  {
    mode: 'truck',
    lane: 'inbound',
    status: 'on_time',
    productType: 'raw_material',
    demandStatus: 'on_time',
    originId: 'mx-reynosa',
    destinationId: 'us-elpaso',
    cargo: 'Border feeder · resin drums',
    cases: 380,
    temperature: 'Ambient',
    etaLabel: '5h 40m',
    durationSec: 360,
    count: 1,
    carrier: 'Rio Grande Crossdock',
    driver: 'Hector Salinas',
    driverPhone: '+1 915 555 0221',
    carrierPhone: '+1 915 555 0201',
  },
  // Train
  {
    mode: 'train',
    lane: 'inbound',
    status: 'on_time',
    productType: 'raw_material',
    demandStatus: 'on_time',
    originId: 'mx-slp',
    destinationId: 'mx-tepotzotlan',
    cargo: 'Culture media bulk',
    cases: 780,
    temperature: 'Ambient',
    etaLabel: '9h 40m',
    durationSec: 700,
    count: 2,
    carrier: 'RailMed Intermodal',
    driver: 'Conductor Daniel Vargas',
    driverPhone: '+52 55 7000 1188',
    carrierPhone: '+52 55 7000 1100',
  },
  {
    mode: 'train',
    lane: 'outbound',
    status: 'at_risk',
    productType: 'finished_good',
    demandStatus: 'nearing_due',
    originId: 'us-canaan',
    destinationId: 'us-franklin',
    cargo: 'Syringes & needles · rail',
    cases: 560,
    temperature: 'Ambient',
    etaLabel: 'Yard congestion',
    durationSec: 640,
    count: 1,
    carrier: 'Northeast Medical Rail',
    driver: 'Conductor Emily Foster',
    driverPhone: '+1 860 555 0133',
    carrierPhone: '+1 860 555 0104',
  },
  {
    mode: 'train',
    lane: 'transfer',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'on_time',
    originId: 'us-sandy',
    destinationId: 'us-elpaso',
    cargo: 'IV catheter WIP · rail',
    cases: 410,
    temperature: 'Ambient',
    etaLabel: '11h',
    durationSec: 820,
    count: 1,
    carrier: 'Desert Corridor Rail',
    driver: 'Conductor Michael Chen',
    driverPhone: '+1 801 555 0180',
    carrierPhone: '+1 801 555 0111',
  },
  {
    mode: 'truck',
    lane: 'inbound',
    status: 'delayed',
    productType: 'finished_good',
    demandStatus: 'delayed',
    originId: 'mx-cuautitlan',
    destinationId: 'mx-slp',
    cargo: 'Finished syringe packs',
    cases: 260,
    temperature: 'Ambient',
    etaLabel: 'Delayed +2h',
    durationSec: 540,
    count: 1,
    carrier: 'Central Plateau Freight',
    driver: 'Paola Jimenez',
    driverPhone: '+52 444 555 2211',
    carrierPhone: '+52 444 555 2200',
  },
  // Americas — Canada / LatAm
  {
    mode: 'truck',
    lane: 'inbound',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'on_time',
    originId: 'us-franklin',
    destinationId: 'ca-mississauga',
    cargo: 'Finished goods · Canada DC',
    cases: 210,
    temperature: 'Ambient',
    etaLabel: '8h 20m',
    durationSec: 620,
    count: 1,
    carrier: 'Great Lakes Medical Freight',
    driver: 'Noah Berger',
    driverPhone: '+1 416 555 0190',
    carrierPhone: '+1 416 555 0105',
  },
  {
    mode: 'plane',
    lane: 'outbound',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'nearing_due',
    originId: 'us-columbus-west',
    destinationId: 'br-sao-paulo',
    cargo: 'Syringe kits · LatAm airlift',
    cases: 120,
    temperature: 'Ambient',
    etaLabel: '11h',
    durationSec: 780,
    count: 1,
    carrier: 'Americas Air Bridge',
    driver: 'Capt. Camila Rocha',
    driverPhone: '+55 11 5550 2200',
    carrierPhone: '+55 11 5550 2100',
  },
  {
    mode: 'ship',
    lane: 'transfer',
    status: 'at_risk',
    productType: 'raw_material',
    demandStatus: 'at_risk',
    originId: 'br-sao-paulo',
    destinationId: 'ar-buenos-aires',
    cargo: 'Polymer resin · South Cone',
    cases: 700,
    temperature: 'Ambient',
    etaLabel: 'Port congestion',
    durationSec: 960,
    count: 1,
    carrier: 'Atlantic Medical Sealift',
    driver: 'Capt. Diego Ferreyra',
    driverPhone: '+54 11 5550 3300',
    carrierPhone: '+54 11 5550 3200',
  },
  // Europe
  {
    mode: 'truck',
    lane: 'transfer',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'on_time',
    originId: 'ie-drogheda',
    destinationId: 'uk-plymouth',
    cargo: 'EU syringe packs',
    cases: 280,
    temperature: 'Ambient',
    etaLabel: '7h 10m',
    durationSec: 540,
    count: 1,
    carrier: 'Celtic Medical Road',
    driver: 'Aisling Byrne',
    driverPhone: '+353 41 555 0190',
    carrierPhone: '+353 41 555 0100',
  },
  {
    mode: 'train',
    lane: 'inbound',
    status: 'on_time',
    productType: 'raw_material',
    demandStatus: 'on_time',
    originId: 'de-heidelberg',
    destinationId: 'fr-grenoble',
    cargo: 'Diagnostics glass feedstock',
    cases: 460,
    temperature: 'Ambient',
    etaLabel: '9h',
    durationSec: 680,
    count: 1,
    carrier: 'Rhine-Alps RailMed',
    driver: 'Conductor Klaus Weber',
    driverPhone: '+49 6221 555 0188',
    carrierPhone: '+49 6221 555 0100',
  },
  {
    mode: 'van',
    lane: 'outbound',
    status: 'delayed',
    productType: 'finished_good',
    demandStatus: 'delayed',
    originId: 'es-madrid',
    destinationId: 'fr-grenoble',
    cargo: 'Pharma line spares',
    cases: 42,
    temperature: 'Ambient',
    etaLabel: 'Delayed +50m',
    durationSec: 420,
    count: 1,
    carrier: 'Iberia Express Medical',
    driver: 'Lucia Navarro',
    driverPhone: '+34 91 555 0177',
    carrierPhone: '+34 91 555 0102',
  },
  {
    mode: 'plane',
    lane: 'outbound',
    status: 'customs',
    productType: 'finished_good',
    demandStatus: 'at_risk',
    originId: 'ie-drogheda',
    destinationId: 'us-franklin',
    cargo: 'EU export airfreight',
    cases: 95,
    temperature: 'Controlled 15–25°C',
    etaLabel: 'Customs hold',
    durationSec: 720,
    count: 1,
    carrier: 'Transatlantic BD Air',
    driver: 'Capt. Owen Walsh',
    driverPhone: '+353 1 555 0144',
    carrierPhone: '+353 1 555 0100',
  },
  // Asia
  {
    mode: 'ship',
    lane: 'inbound',
    status: 'on_time',
    productType: 'raw_material',
    demandStatus: 'on_time',
    originId: 'cn-suzhou',
    destinationId: 'sg-singapore',
    cargo: 'Component feedstock · ASEAN',
    cases: 820,
    temperature: 'Ambient',
    etaLabel: '3d 4h',
    durationSec: 1100,
    count: 1,
    carrier: 'East Asia Feeder Line',
    driver: 'Capt. Wei Chen',
    driverPhone: '+86 512 555 0199',
    carrierPhone: '+86 512 555 0100',
  },
  {
    mode: 'plane',
    lane: 'transfer',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'nearing_due',
    originId: 'sg-singapore',
    destinationId: 'jp-tokyo',
    cargo: 'Finished infusion sets',
    cases: 110,
    temperature: 'Ambient',
    etaLabel: '7h 40m',
    durationSec: 560,
    count: 1,
    carrier: 'Asia Pacific AirMed',
    driver: 'Capt. Yuki Tanaka',
    driverPhone: '+65 6555 0188',
    carrierPhone: '+65 6555 0100',
  },
  {
    mode: 'truck',
    lane: 'outbound',
    status: 'at_risk',
    productType: 'finished_good',
    demandStatus: 'overdue',
    originId: 'in-chennai',
    destinationId: 'sg-singapore',
    cargo: 'India export packs',
    cases: 340,
    temperature: 'Ambient',
    etaLabel: 'Border delay',
    durationSec: 900,
    count: 1,
    carrier: 'Bay of Bengal Logistics',
    driver: 'Arjun Krishnan',
    driverPhone: '+91 44 5550 2211',
    carrierPhone: '+91 44 5550 2100',
  },
  // Africa
  {
    mode: 'plane',
    lane: 'inbound',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'on_time',
    originId: 'fr-grenoble',
    destinationId: 'ma-casablanca',
    cargo: 'Pharma systems · Maghreb',
    cases: 78,
    temperature: 'Controlled 15–25°C',
    etaLabel: '4h 15m',
    durationSec: 400,
    count: 1,
    carrier: 'Euro-Africa Air Bridge',
    driver: 'Capt. Amine Benali',
    driverPhone: '+212 522 555 0190',
    carrierPhone: '+212 522 555 0100',
  },
  {
    mode: 'ship',
    lane: 'outbound',
    status: 'delayed',
    productType: 'raw_material',
    demandStatus: 'delayed',
    originId: 'ma-casablanca',
    destinationId: 'sg-singapore',
    cargo: 'Bulk packaging stock · Cape / Suez lane',
    cases: 640,
    temperature: 'Ambient',
    etaLabel: 'Berth delay',
    durationSec: 1200,
    count: 1,
    carrier: 'Indian Ocean Sealine',
    driver: 'Capt. Thabo Nkosi',
    driverPhone: '+212 522 555 0180',
    carrierPhone: '+212 522 555 0100',
  },
  {
    mode: 'ship',
    lane: 'inbound',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'on_time',
    originId: 'sg-singapore',
    destinationId: 'jp-tokyo',
    cargo: 'ASEAN finished goods · East Asia feeder',
    cases: 410,
    temperature: 'Ambient',
    etaLabel: '5d 2h',
    durationSec: 1000,
    count: 1,
    carrier: 'East Asia Feeder Line',
    driver: 'Capt. Yuki Tanaka',
    driverPhone: '+65 6555 0191',
    carrierPhone: '+65 6555 0101',
  },
  // Oceania
  {
    mode: 'plane',
    lane: 'inbound',
    status: 'on_time',
    productType: 'finished_good',
    demandStatus: 'on_time',
    originId: 'sg-singapore',
    destinationId: 'au-sydney',
    cargo: 'ANZ finished goods airlift',
    cases: 88,
    temperature: 'Ambient',
    etaLabel: '8h 05m',
    durationSec: 640,
    count: 1,
    carrier: 'Pacific Rim AirMed',
    driver: 'Capt. Grace Nguyen',
    driverPhone: '+61 2 5550 0199',
    carrierPhone: '+61 2 5550 0100',
  },
  {
    mode: 'ship',
    lane: 'transfer',
    status: 'on_time',
    productType: 'raw_material',
    demandStatus: 'nearing_due',
    originId: 'au-sydney',
    destinationId: 'nz-auckland',
    cargo: 'Raw packaging · Tasman',
    cases: 390,
    temperature: 'Ambient',
    etaLabel: '2d 6h',
    durationSec: 880,
    count: 1,
    carrier: 'Tasman Medical Sealift',
    driver: 'Capt. Liam Parker',
    driverPhone: '+64 9 555 0177',
    carrierPhone: '+64 9 555 0100',
  },
];

const MODE_VEHICLES: Record<TransportMode, Array<{ makeModel: string; type: string; axles: number }>> = {
  plane: [
    { makeModel: 'Boeing 737-800F', type: 'Freighter aircraft', axles: 0 },
    { makeModel: 'Airbus A330-200F', type: 'Widebody freighter', axles: 0 },
  ],
  truck: [
    { makeModel: 'Kenworth T680', type: 'Dry van 53′', axles: 5 },
    { makeModel: 'Freightliner Cascadia', type: 'Reefer 53′', axles: 5 },
    { makeModel: 'Volvo VNL 760', type: 'Cross-border van', axles: 5 },
  ],
  van: [
    { makeModel: 'Mercedes Sprinter 3500', type: 'Cargo van', axles: 2 },
    { makeModel: 'Ford Transit 350', type: 'High-roof van', axles: 2 },
  ],
  ship: [
    { makeModel: 'Feeder MV Horizon', type: 'Coastal freighter', axles: 0 },
    { makeModel: 'RoRo Medical Star', type: 'RoRo vessel', axles: 0 },
  ],
  train: [
    { makeModel: 'GE ES44AC', type: 'Intermodal block', axles: 0 },
    { makeModel: 'Siemens Charger', type: 'Unit train', axles: 0 },
  ],
};

function assetLabel(mode: TransportMode, n: number) {
  const prefix =
    mode === 'plane' ? 'AIR'
      : mode === 'ship' ? 'SEA'
        : mode === 'train' ? 'RAIL'
          : mode === 'van' ? 'VAN'
            : 'TRK';
  return `${prefix}-${String(n).padStart(3, '0')}`;
}

function unitLabel(mode: TransportMode, n: number) {
  if (mode === 'plane') return `FLT-${8800 + n}`;
  if (mode === 'ship') return `VSL-${4200 + n}`;
  if (mode === 'train') return `RKE-${3100 + n}`;
  if (mode === 'van') return `VN-${5100 + n}`;
  return `MX-${4200 + n}`;
}

function cargoLinesFor(cargo: string, cases: number, seed: string, productType: ProductType): CargoSkuLine[] {
  const base = cargo.toLowerCase();
  const mk = (sku: string, name: string, share: number, lot: string): CargoSkuLine => ({
    sku,
    name,
    qty: Math.max(1, Math.round(cases * share)),
    uom: productType === 'raw_material' ? 'KG' : 'CS',
    lot,
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(sku + seed)}/320/220`,
  });

  if (productType === 'raw_material') {
    if (base.includes('resin') || base.includes('polymer')) {
      return [
        mk('RAW-POL-440', 'Medical-grade polymer resin', 0.7, 'LOT-RM-440'),
        mk('RAW-ADD-12', 'Stabilizer additive', 0.3, 'LOT-RM-441'),
      ];
    }
    if (base.includes('glass') || base.includes('feedstock')) {
      return [
        mk('RAW-GLS-90', 'Borosilicate glass tubing', 0.65, 'LOT-RM-090'),
        mk('RAW-PKG-WRAP', 'Protective wrap stock', 0.35, 'LOT-RM-091'),
      ];
    }
    return [
      mk('RAW-COMP-GEN', cargo.split('·')[0]?.trim() || 'Raw components', 0.6, `LOT-RM-${seed.slice(-3).toUpperCase()}`),
      mk('RAW-PKG-SEC', 'Secondary packaging stock', 0.4, `LOT-RM-${seed.slice(-3).toUpperCase()}B`),
    ];
  }

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
    mk('BD-FG-GEN', cargo.split('·')[0]?.trim() || 'Finished goods', 0.6, `LOT-FG-${seed.slice(-3).toUpperCase()}`),
    mk('BD-PKG-SEC', 'Secondary packaging', 0.25, `LOT-FG-${seed.slice(-3).toUpperCase()}B`),
    mk('BD-DOC-PACK', 'Shipping docs / CoC pack', 0.15, `LOT-FG-${seed.slice(-3).toUpperCase()}C`),
  ];
}

function buildFleet(): FleetShipment[] {
  const fleet: FleetShipment[] = [];
  let n = 1;

  CORRIDOR_SEEDS.forEach((corridor, corridorIdx) => {
    for (let i = 0; i < corridor.count; i += 1) {
      const id = assetLabel(corridor.mode, n);
      const vehicleModel = MODE_VEHICLES[corridor.mode][(n - 1) % MODE_VEHICLES[corridor.mode].length];
      const driverName = corridor.driver;
      const cases = corridor.cases + i * 8;
      const status: FleetStatus =
        i === 0
          ? corridor.status
          : corridor.status === 'on_time' && i === 1
            ? 'at_risk'
            : corridor.status;
      const demandStatus: DemandDueStatus =
        i === 0
          ? corridor.demandStatus
          : DEMAND_DUE_STATUSES[(corridorIdx + i) % DEMAND_DUE_STATUSES.length];

      fleet.push({
        id,
        trailer: unitLabel(corridor.mode, n),
        lane: corridor.lane,
        status,
        mode: corridor.mode,
        productType: corridor.productType,
        demandStatus,
        carrier: corridor.carrier,
        driver: driverName,
        driverPhone: corridor.driverPhone,
        carrierPhone: corridor.carrierPhone,
        cargo: corridor.cargo,
        cases,
        temperature: corridor.temperature,
        etaLabel: corridor.etaLabel,
        originId: corridor.originId,
        destinationId: corridor.destinationId,
        durationSec: corridor.durationSec + i * 35,
        phase: (corridorIdx * 0.17 + i * 0.29) % 1,
        vehicle: {
          plate: `BD-${String(1000 + n)}-${corridor.mode.slice(0, 2).toUpperCase()}`,
          makeModel: vehicleModel.makeModel,
          year: 2020 + (n % 5),
          type: vehicleModel.type,
          axles: vehicleModel.axles,
          gpsId: `GPS-${8800 + n}`,
          lastService: `2026-0${(n % 6) + 1}-12`,
          photoUrl: `https://picsum.photos/seed/${corridor.mode}-${id}/720/420`,
        },
        driverProfile: {
          name: driverName,
          license: `LIC-${4400 + n}`,
          licenseClass:
            corridor.mode === 'plane' ? 'ATPL Freighter'
              : corridor.mode === 'ship' ? 'Master Mariner'
                : corridor.mode === 'train' ? 'Locomotive engineer'
                  : 'Commercial / cross-border',
          experienceYears: 6 + (n % 12),
          rating: 4.4 + ((n % 5) * 0.1),
          languages: n % 2 === 0 ? 'EN · ES' : 'EN',
          photoUrl: `https://i.pravatar.cc/240?u=${encodeURIComponent(driverName + id)}`,
          email: `${driverName.toLowerCase().replace(/[^a-z0-9]+/g, '.')}@carrier.bd-demo.com`,
        },
        cargoLines: cargoLinesFor(corridor.cargo, cases, id, corridor.productType),
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
  const going = elapsed < cycle;
  const raw = (elapsed % cycle) / cycle;
  const t = smoothstep(raw);
  const from = going ? origin : destination;
  const to = going ? destination : origin;

  const path = pathForMode(shipment.mode, from, to);
  const along = interpolatePolyline(path, t);

  return {
    ...shipment,
    lat: along.lat,
    lng: along.lng,
    progress: going ? t : 1 - t,
    bearing: along.bearing || bearingDegrees(from.lat, from.lng, to.lat, to.lng),
    origin: going ? origin : destination,
    destination: going ? destination : origin,
    path,
  };
}

/** Unique road OD pairs used by truck/van shipments (for OSRM preload). */
export function fleetRoadRoutePairs() {
  const pairs: Array<{ fromId: string; toId: string }> = [];
  const seen = new Set<string>();
  FLEET_SEED.forEach((s) => {
    if (!usesRoadNetwork(s.mode)) return;
    const key = `${s.originId}>${s.destinationId}`;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push({ fromId: s.originId, toId: s.destinationId });
  });
  return pairs;
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
