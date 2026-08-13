import { BD_PLANT_SITES, type BdPlantSite } from './bdPlantSites';

export type PlantDemandPriority = 'high' | 'medium' | 'low';
export type PlantDemandStatus = 'open' | 'in_progress' | 'scheduled' | 'blocked';
export type PlantDemandKind = 'inbound' | 'outbound' | 'transfer' | 'replenishment' | 'expedite';

export type PlantDemand = {
  id: string;
  title: string;
  kind: PlantDemandKind;
  priority: PlantDemandPriority;
  status: PlantDemandStatus;
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
  'Sofía Ramírez',
  'James Ortiz',
  'Valeria Núñez',
  'Michael Chen',
  'Andrea López',
  'Daniel Vargas',
  'Priya Patel',
  'Héctor Salazar',
  'Laura Kim',
  'Ricardo Peña',
  'Emily Foster',
  'Marcos Duarte',
  'Ana Patricia Cruz',
  'Kevin Morales',
  'Natalia Gómez',
  'Chris Nguyen',
];

function hashStr(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function demandTemplates(plant: BdPlantSite, idx: number): PlantDemand[] {
  const partner =
    BD_PLANT_SITES[(idx + 3) % BD_PLANT_SITES.length]?.shortName
    ?? 'Network hub';
  const partner2 =
    BD_PLANT_SITES[(idx + 7) % BD_PLANT_SITES.length]?.shortName
    ?? 'Sister plant';

  const base: Array<Omit<PlantDemand, 'id'>> = [
    {
      title: `Replenish ${plant.focus.split('&')[0]?.trim() || 'components'}`,
      kind: 'inbound',
      priority: 'high',
      status: 'in_progress',
      dueLabel: 'Today 18:00',
      cases: 240 + (idx % 5) * 40,
      skuCount: 4 + (idx % 3),
      lanePartner: partner,
      requester: 'Planning · S&OP',
      description: `Inbound replenishment to keep ${plant.shortName} lines running through the weekend.`,
      notes: 'Dock 3 reserved · Prefer ambient trailers · ASN required 2h prior.',
    },
    {
      title: `Outbound release · ${plant.city}`,
      kind: 'outbound',
      priority: idx % 2 === 0 ? 'high' : 'medium',
      status: 'scheduled',
      dueLabel: 'Tomorrow 09:30',
      cases: 160 + (idx % 4) * 28,
      skuCount: 3 + (idx % 4),
      lanePartner: partner2,
      requester: 'Customer Ops',
      description: `Finished-goods outbound from ${plant.shortName} to ${partner2}.`,
      notes: 'Quality hold cleared · Seal check mandatory · Temperature log if controlled.',
    },
    {
      title: 'Inter-plant transfer',
      kind: 'transfer',
      priority: 'medium',
      status: 'open',
      dueLabel: 'Fri 14:00',
      cases: 90 + (idx % 6) * 15,
      skuCount: 2 + (idx % 2),
      lanePartner: partner,
      requester: 'Network Balance',
      description: `Balance WIP / packaging materials between ${plant.shortName} and ${partner}.`,
      notes: 'Use transfer lane · No customs docs · Same-day turn preferred.',
    },
    {
      title: 'Expedite · short-dated lot',
      kind: 'expedite',
      priority: 'high',
      status: 'blocked',
      dueLabel: 'ASAP',
      cases: 48 + (idx % 3) * 12,
      skuCount: 1,
      lanePartner: partner2,
      requester: 'Quality Release',
      description: 'Expedite movement for a short-dated lot pending carrier confirmation.',
      notes: 'Waiting on carrier slot · Escalate if not confirmed in 90 minutes.',
    },
    {
      title: 'Cycle stock replenishment',
      kind: 'replenishment',
      priority: 'low',
      status: 'scheduled',
      dueLabel: 'Mon 11:00',
      cases: 120 + (idx % 5) * 20,
      skuCount: 5,
      lanePartner: partner,
      requester: 'Warehouse Control',
      description: `Standard weekly replenishment into ${plant.shortName} staging.`,
      notes: 'Can consolidate with inbound wave · Prefer morning docks.',
    },
  ];

  return base.map((d, i) => ({
    ...d,
    id: `DEM-${plant.id.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)}-${i + 1}`,
  }));
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
