import { BD_PLANT_SITES, type BdPlantSite } from './bdPlantSites';
import {
  DEMAND_DUE_STATUSES,
  FLEET_LANES,
  PRODUCT_TYPES,
  TRANSPORT_MODES,
  demandDueStatusLabel,
  productTypeLabel,
  transportModeLabel,
  type DemandDueStatus,
  type ProductType,
  type TransportMode,
} from './fleetSimulation';

export type PlantDemandPriority = 'high' | 'medium' | 'low';
export type PlantDemandWorkflowStatus = 'open' | 'in_progress' | 'scheduled' | 'blocked';
export type PlantDemandKind = 'inbound' | 'outbound' | 'transfer' | 'replenishment' | 'expedite';

/** @deprecated Prefer PlantDemandWorkflowStatus — kept for call sites during rename. */
export type PlantDemandStatus = PlantDemandWorkflowStatus;

export type PlantDemand = {
  id: string;
  title: string;
  kind: PlantDemandKind;
  priority: PlantDemandPriority;
  status: PlantDemandWorkflowStatus;
  dueStatus: DemandDueStatus;
  mode: TransportMode;
  productType: ProductType;
  dueLabel: string;
  cases: number;
  skuCount: number;
  lanePartner: string;
  requester: string;
  description: string;
  notes: string;
};

export type PlantLogisticsContact = {
  name: string;
  role: string;
  photoUrl: string;
  phone: string;
  mobile: string;
  email: string;
  shift: string;
};

export type PlantProfile = {
  plantId: string;
  facadePhotoUrls: string[];
  interiorPhotoUrl: string;
  employees: number;
  floorSqm: number;
  docks: number;
  shifts: string;
  certifications: string[];
  timezone: string;
  plantManager: string;
  contact: PlantLogisticsContact;
  demands: PlantDemand[];
};

const CONTACT_NAMES = [
  'Sofia Ramirez',
  'James Ortiz',
  'Valeria Nunez',
  'Michael Chen',
  'Andrea Lopez',
  'Daniel Vargas',
  'Priya Patel',
  'Hector Salazar',
  'Laura Kim',
  'Ricardo Pena',
  'Emily Foster',
  'Marcos Duarte',
  'Ana Patricia Cruz',
  'Kevin Morales',
  'Natalia Gomez',
  'Chris Nguyen',
];

const DUE_LABELS: Record<DemandDueStatus, string> = {
  on_time: 'Due in 2 days',
  delayed: 'Delayed · +6h',
  nearing_due: 'Due today 18:00',
  at_risk: 'At risk · carrier slot',
  overdue: 'Overdue · 1 day',
};

const WORKFLOW: PlantDemandWorkflowStatus[] = ['open', 'in_progress', 'scheduled', 'blocked'];
const PRIORITIES: PlantDemandPriority[] = ['high', 'medium', 'low'];
const KINDS: PlantDemandKind[] = ['inbound', 'outbound', 'transfer', 'replenishment', 'expedite'];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function demandTemplates(plant: BdPlantSite, idx: number): PlantDemand[] {
  const demands: PlantDemand[] = [];
  let n = 0;

  // Full combinatorial coverage rotated per plant so every mode / product / due status appears.
  TRANSPORT_MODES.forEach((mode, modeIdx) => {
    PRODUCT_TYPES.forEach((productType, ptIdx) => {
      DEMAND_DUE_STATUSES.forEach((dueStatus, dsIdx) => {
        // Keep ~10–14 demands per plant while still rotating through the matrix.
        if ((modeIdx + ptIdx * 2 + dsIdx + idx) % 4 !== 0 && n >= 10) return;
        if (n >= 14) return;

        const partner =
          BD_PLANT_SITES[(idx + modeIdx + dsIdx + 3) % BD_PLANT_SITES.length]?.shortName
          ?? 'Network hub';
        const kind = KINDS[(n + idx) % KINDS.length];
        const laneHint = FLEET_LANES[(n + modeIdx) % FLEET_LANES.length];
        const product = productTypeLabel(productType);
        const modeLabel = transportModeLabel(mode);

        demands.push({
          id: `DEM-${plant.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-${n + 1}`,
          title: `${modeLabel} · ${product} · ${kind.replace(/_/g, ' ')}`,
          kind,
          priority: PRIORITIES[(n + dsIdx) % PRIORITIES.length],
          status: WORKFLOW[(n + ptIdx) % WORKFLOW.length],
          dueStatus,
          mode,
          productType,
          dueLabel: DUE_LABELS[dueStatus],
          cases: 40 + ((n * 17 + idx * 11) % 420),
          skuCount: 1 + ((n + idx) % 6),
          lanePartner: partner,
          requester: n % 2 === 0 ? 'Planning · S&OP' : 'Customer Ops',
          description:
            `${demandDueStatusLabel(dueStatus)} ${laneHint} demand for ${product.toLowerCase()} `
            + `moving by ${modeLabel.toLowerCase()} between ${plant.shortName} and ${partner}.`,
          notes:
            `Preferred mode: ${modeLabel}. Product class: ${product}. `
            + 'ASN required 2h prior · Seal check on finished goods · Lot traceability on raw materials.',
        });
        n += 1;
      });
    });
  });

  const ensure = <K extends keyof PlantDemand>(
    key: K,
    values: Array<PlantDemand[K]>,
    build: (value: PlantDemand[K], i: number) => Omit<PlantDemand, 'id'> & { idSuffix: string },
  ) => {
    values.forEach((value, i) => {
      if (demands.some((d) => d[key] === value)) return;
      const row = build(value, i);
      const { idSuffix, ...rest } = row;
      demands.push({
        ...rest,
        id: `DEM-${plant.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-${idSuffix}`,
      });
    });
  };

  ensure('mode', TRANSPORT_MODES, (mode, i) => ({
    idSuffix: `M${i + 1}`,
    title: `${transportModeLabel(mode as TransportMode)} coverage · ${plant.shortName}`,
    kind: 'transfer',
    priority: 'medium',
    status: 'open',
    dueStatus: DEMAND_DUE_STATUSES[i % DEMAND_DUE_STATUSES.length],
    mode: mode as TransportMode,
    productType: PRODUCT_TYPES[i % PRODUCT_TYPES.length],
    dueLabel: DUE_LABELS[DEMAND_DUE_STATUSES[i % DEMAND_DUE_STATUSES.length]],
    cases: 120 + i * 20,
    skuCount: 3,
    lanePartner: BD_PLANT_SITES[(idx + i + 2) % BD_PLANT_SITES.length]?.shortName ?? 'Hub',
    requester: 'Network Balance',
    description: `Ensures ${transportModeLabel(mode as TransportMode)} capacity is represented for ${plant.shortName}.`,
    notes: 'Auto-generated coverage demand for filter demos.',
  }));

  ensure('productType', PRODUCT_TYPES, (productType, i) => ({
    idSuffix: `P${i + 1}`,
    title: `${productTypeLabel(productType as ProductType)} coverage`,
    kind: i === 0 ? 'replenishment' : 'outbound',
    priority: 'high',
    status: 'scheduled',
    dueStatus: 'on_time',
    mode: 'truck',
    productType: productType as ProductType,
    dueLabel: DUE_LABELS.on_time,
    cases: 200,
    skuCount: 4,
    lanePartner: BD_PLANT_SITES[(idx + 4) % BD_PLANT_SITES.length]?.shortName ?? 'Hub',
    requester: 'Warehouse Control',
    description: `Coverage demand for ${productTypeLabel(productType as ProductType).toLowerCase()} at ${plant.shortName}.`,
    notes: 'Auto-generated coverage demand for filter demos.',
  }));

  ensure('dueStatus', DEMAND_DUE_STATUSES, (dueStatus, i) => ({
    idSuffix: `D${i + 1}`,
    title: `${demandDueStatusLabel(dueStatus as DemandDueStatus)} demand`,
    kind: 'expedite',
    priority: dueStatus === 'overdue' || dueStatus === 'delayed' ? 'high' : 'medium',
    status: dueStatus === 'overdue' ? 'blocked' : 'in_progress',
    dueStatus: dueStatus as DemandDueStatus,
    mode: TRANSPORT_MODES[i % TRANSPORT_MODES.length],
    productType: PRODUCT_TYPES[i % PRODUCT_TYPES.length],
    dueLabel: DUE_LABELS[dueStatus as DemandDueStatus],
    cases: 80 + i * 15,
    skuCount: 2,
    lanePartner: BD_PLANT_SITES[(idx + 5) % BD_PLANT_SITES.length]?.shortName ?? 'Hub',
    requester: 'Quality Release',
    description: `Simulated ${demandDueStatusLabel(dueStatus as DemandDueStatus).toLowerCase()} demand for ${plant.shortName}.`,
    notes: 'Auto-generated coverage demand for filter demos.',
  }));

  return demands;
}

function buildProfile(plant: BdPlantSite, idx: number): PlantProfile {
  const h = hashStr(plant.id);
  const contactName = CONTACT_NAMES[idx % CONTACT_NAMES.length];
  const phonePrefix = plant.country === 'US' ? '+1' : '+52';
  const phoneBody = `${200 + (h % 700)} ${555 + (h % 40)} ${1000 + (h % 8000)}`;

  return {
    plantId: plant.id,
    facadePhotoUrls: [
      `https://picsum.photos/seed/facade-${plant.id}-a/800/480`,
      `https://picsum.photos/seed/facade-${plant.id}-b/800/480`,
      `https://picsum.photos/seed/facade-${plant.id}-c/800/480`,
    ],
    interiorPhotoUrl: `https://picsum.photos/seed/interior-${plant.id}/800/480`,
    employees: 180 + (h % 900),
    floorSqm: 12000 + (h % 80) * 500,
    docks: 4 + (h % 10),
    shifts: plant.kind === 'distribution' ? '24/7 · 3 shifts' : '2 shifts · Mon–Sat',
    certifications: plant.country === 'US'
      ? ['ISO 13485', 'FDA registered', 'cGMP']
      : ['ISO 13485', 'COFEPRIS', 'cGMP'],
    timezone: plant.country === 'US' ? 'US local' : 'America/Mexico_City',
    plantManager: CONTACT_NAMES[(idx + 5) % CONTACT_NAMES.length],
    contact: {
      name: contactName,
      role: 'Logistics & Deliveries Lead',
      photoUrl: `https://i.pravatar.cc/240?u=${encodeURIComponent(contactName + plant.id)}`,
      phone: `${phonePrefix} ${phoneBody}`,
      mobile: `${phonePrefix} ${phoneBody.replace(/(\d)$/, (d) => String((Number(d) + 3) % 10))}`,
      email: `${contactName.toLowerCase().replace(/\s+/g, '.')}@bd.com`,
      shift: 'Days · Ops desk',
    },
    demands: demandTemplates(plant, idx),
  };
}

const PROFILE_BY_ID: Record<string, PlantProfile> = Object.fromEntries(
  BD_PLANT_SITES.map((plant, idx) => [plant.id, buildProfile(plant, idx)]),
);

export function getPlantProfile(plantId: string): PlantProfile | undefined {
  return PROFILE_BY_ID[plantId];
}

export function plantKindLabel(kind: BdPlantSite['kind']) {
  if (kind === 'distribution') return 'Distribution center';
  if (kind === 'campus') return 'Campus / HQ';
  if (kind === 'pharma') return 'Pharmaceutical systems';
  return 'Manufacturing';
}
