import { BD_PLANT_SITES, getPlantById, type BdPlantSite } from '../networkMap/bdPlantSites';
import { CT_V2_SITE_WEIGHT, type CtV2SiteId } from './ctV2FilterModel';

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const TRUCK_STATUSES = ['expected', 'arrived', 'unloading', 'closed'] as const;
const WIP_STATUSES = ['Available', 'Staged', 'In Transit', 'Blocked', 'Quarantined', 'Under Quality Review'] as const;
const WIP_TYPES = [
  'Assembled pens',
  'Assembled catheters',
  'Syringe barrels',
  'Infusion sets',
  'Culture media',
  'Needle hubs',
  'FG semi-pack',
];
const AREAS = ['Assembly', 'Packaging', 'Quality', 'Supermarket', 'Shipping', 'Staging'];

export type SimulatedTruck = {
  truck_schedule_id: string;
  trailer_id: string;
  status: (typeof TRUCK_STATUSES)[number];
  priority_rank: number;
  unload_progress_pct: number;
  plantId: string;
  plantName: string;
  supplier: string;
  purchase_orders: Array<{ po_number: string }>;
};

export type SimulatedDock = {
  dock_id: string;
  dock_name: string;
  current_status: 'idle' | 'unloading' | 'blocked';
  availability_status: 'open' | 'occupied' | 'reserved' | 'blocked';
  responsible_team: string;
  blocked_reason?: string;
  plantName: string;
};

export type SimulatedWip = {
  wip_id: string;
  wip_type: string;
  site: string;
  plantId: string;
  lot: string;
  quantity: number;
  uom: string;
  status: (typeof WIP_STATUSES)[number];
  next_step: string;
  aging_location_hours: number;
  expected_dwell_hours: number;
  aging_created_hours: number;
  aging_status_hours: number;
  available_for_next: boolean;
  location: { display: string };
};

export type SimulatedException = {
  exception_id: string;
  wip_id: string;
  type: string;
  state: 'open' | 'assigned' | 'resolved';
  reason: string;
  age_hours: number;
  plantName: string;
};

export type SimulatedZone = {
  zone_id: string;
  label: string;
  area: string;
  plant: string;
  wip_count: number;
  blocked_count: number;
  aging_max_hours: number;
};

export type SimulatedTransfer = {
  transfer_id: string;
  from_site: string;
  to_site: string;
  wip_ids: string[];
  status: 'In Transit' | 'Arrived' | 'Scheduled';
  eta: string;
};

export type SimulatedOutboundUnit = {
  id: string;
  title: string;
  plantName: string;
  pallets: number;
  readiness_pct: number;
  sla: 'on_time' | 'at_risk' | 'late';
};

const SUPPLIERS = [
  'MedResin Polymers Inc.',
  'GlobalPack Solutions',
  'BD Intercompany — Franklin Lakes',
  'ChemSource International',
  'Pacific Medical Freight',
];

export function plantsForIds(ids: CtV2SiteId[]): BdPlantSite[] {
  return ids.map((id) => getPlantById(id)).filter(Boolean) as BdPlantSite[];
}

/** Cap row volume so tables stay readable when many plants are selected. */
function visiblePlantSlice(plants: BdPlantSite[], cap = 12): BdPlantSite[] {
  if (plants.length <= cap) return plants;
  return [...plants].sort((a, b) => (CT_V2_SITE_WEIGHT[b.id] ?? 0) - (CT_V2_SITE_WEIGHT[a.id] ?? 0)).slice(0, cap);
}

export function simulateTrucks(siteIds: CtV2SiteId[]): SimulatedTruck[] {
  const plants = visiblePlantSlice(plantsForIds(siteIds), 10);
  const rows: SimulatedTruck[] = [];
  plants.forEach((plant, pi) => {
    const n = 1 + (hash(plant.id) % 2);
    for (let i = 0; i < n; i += 1) {
      const h = hash(`${plant.id}-trk-${i}`);
      const status = TRUCK_STATUSES[h % TRUCK_STATUSES.length];
      rows.push({
        truck_schedule_id: `TS-${plant.id}-${i + 1}`,
        trailer_id: `${plant.country}-${4000 + (h % 900)}-${plant.shortName.slice(0, 3).toUpperCase()}`,
        status,
        priority_rank: rows.length + 1,
        unload_progress_pct: status === 'unloading' ? 35 + (h % 50) : status === 'closed' ? 100 : h % 25,
        plantId: plant.id,
        plantName: plant.shortName,
        supplier: SUPPLIERS[(h + pi) % SUPPLIERS.length],
        purchase_orders: [{ po_number: `PO-${82000 + (h % 900)}` }],
      });
    }
  });
  return rows.sort((a, b) => a.priority_rank - b.priority_rank);
}

export function simulateDocks(siteIds: CtV2SiteId[]): SimulatedDock[] {
  const plants = visiblePlantSlice(plantsForIds(siteIds), 8);
  const statuses: SimulatedDock['current_status'][] = ['unloading', 'idle', 'blocked'];
  return plants.flatMap((plant, i) => {
    const h = hash(plant.id);
    const status = statuses[(h + i) % statuses.length];
    return [{
      dock_id: `DOCK-${plant.id}`,
      dock_name: `${plant.shortName} · Dock ${1 + (h % 4)}`,
      current_status: status,
      availability_status: status === 'blocked' ? 'blocked' : status === 'unloading' ? 'occupied' : 'open',
      responsible_team: i % 2 === 0 ? 'Receiving Team A' : 'Receiving Team B',
      blocked_reason: status === 'blocked' ? 'Yard congestion / equipment hold' : undefined,
      plantName: plant.shortName,
    }];
  });
}

export function simulateWip(siteIds: CtV2SiteId[]): SimulatedWip[] {
  const plants = visiblePlantSlice(plantsForIds(siteIds), 12);
  const rows: SimulatedWip[] = [];
  plants.forEach((plant) => {
    const n = 2 + (hash(plant.id) % 2);
    for (let i = 0; i < n; i += 1) {
      const h = hash(`${plant.id}-wip-${i}`);
      const status = WIP_STATUSES[h % WIP_STATUSES.length];
      const dwell = 8 + (h % 36);
      const aging = 4 + (h % 48);
      const area = AREAS[h % AREAS.length];
      rows.push({
        wip_id: `WIP-${plant.shortName.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase()}-${24000 + (h % 900)}`,
        wip_type: WIP_TYPES[h % WIP_TYPES.length],
        site: plant.shortName,
        plantId: plant.id,
        lot: `LOT-${plant.country}-${100 + (h % 80)}`,
        quantity: 80 + (h % 900),
        uom: 'EA',
        status,
        next_step: area,
        aging_location_hours: aging,
        expected_dwell_hours: dwell,
        aging_created_hours: aging + 6,
        aging_status_hours: Math.max(1, aging - 3),
        available_for_next: status === 'Available' || status === 'Staged',
        location: { display: `${plant.shortName} · ${area} · LINE-${1 + (h % 6)}` },
      });
    }
  });
  return rows;
}

export function simulateExceptions(siteIds: CtV2SiteId[]): SimulatedException[] {
  const wip = simulateWip(siteIds);
  return wip.slice(0, Math.min(8, wip.length)).map((row, i) => {
    const h = hash(row.wip_id);
    const types = ['exceeded_dwell', 'quality_hold', 'blocked', 'wrong_location', 'quantity_divergence'];
    const states: SimulatedException['state'][] = ['open', 'assigned', 'resolved'];
    return {
      exception_id: `EXC-${row.plantId.slice(0, 6)}-${i + 1}`,
      wip_id: row.wip_id,
      type: types[h % types.length],
      state: i > 5 ? 'resolved' : states[h % 2],
      reason: `${row.site}: ${row.wip_type} requires planner review`,
      age_hours: 2 + (h % 30),
      plantName: row.site,
    };
  });
}

export function simulateZones(siteIds: CtV2SiteId[]): SimulatedZone[] {
  const plants = visiblePlantSlice(plantsForIds(siteIds), 8);
  return plants.flatMap((plant) => {
    const h = hash(plant.id);
    return AREAS.slice(0, 3).map((area, i) => ({
      zone_id: `Z-${plant.id}-${i}`,
      label: area,
      area,
      plant: plant.shortName,
      wip_count: 1 + ((h + i) % 4),
      blocked_count: (h + i) % 4 === 0 ? 1 : 0,
      aging_max_hours: 6 + ((h + i * 7) % 40),
    }));
  });
}

export function simulateTransfers(siteIds: CtV2SiteId[]): SimulatedTransfer[] {
  const plants = plantsForIds(siteIds);
  if (plants.length < 2) {
    const fallback = BD_PLANT_SITES.filter((p) => p.id !== plants[0]?.id).slice(0, 2);
    const from = plants[0] ?? BD_PLANT_SITES[0];
    const to = fallback[0] ?? BD_PLANT_SITES[1];
    return [{
      transfer_id: `TR-${from.shortName.slice(0, 3).toUpperCase()}-${to.shortName.slice(0, 3).toUpperCase()}`,
      from_site: from.shortName,
      to_site: to.shortName,
      wip_ids: [`WIP-${from.shortName.slice(0, 3).toUpperCase()}-01`],
      status: 'In Transit',
      eta: new Date(Date.now() + 6 * 3600_000).toISOString(),
    }];
  }
  const pairs = Math.min(5, plants.length - 1);
  return Array.from({ length: pairs }, (_, i) => {
    const from = plants[i];
    const to = plants[(i + 1) % plants.length];
    const h = hash(`${from.id}-${to.id}`);
    const statuses: SimulatedTransfer['status'][] = ['In Transit', 'Arrived', 'Scheduled'];
    return {
      transfer_id: `TR-${from.shortName.replace(/\s/g, '').slice(0, 3).toUpperCase()}${i + 1}`,
      from_site: from.shortName,
      to_site: to.shortName,
      wip_ids: [`WIP-${from.shortName.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase()}-${24000 + (h % 90)}`],
      status: statuses[h % statuses.length],
      eta: new Date(Date.now() + (4 + (h % 20)) * 3600_000).toISOString(),
    };
  });
}

export function simulateOutboundUnits(siteIds: CtV2SiteId[]): SimulatedOutboundUnit[] {
  const plants = visiblePlantSlice(plantsForIds(siteIds), 8);
  return plants.map((plant) => {
    const h = hash(`${plant.id}-ob`);
    const sla = h % 5 === 0 ? 'late' : h % 3 === 0 ? 'at_risk' : 'on_time';
    return {
      id: `LOAD-${plant.shortName.replace(/[^A-Za-z]/g, '').slice(0, 4).toUpperCase()}-${h % 90}`,
      title: `${plant.shortName} steril / FG`,
      plantName: plant.shortName,
      pallets: 4 + (h % 12),
      readiness_pct: sla === 'late' ? 48 + (h % 12) : sla === 'at_risk' ? 72 + (h % 12) : 88 + (h % 10),
      sla,
    };
  });
}

export function simulateActions(siteIds: CtV2SiteId[]) {
  const wip = simulateWip(siteIds).slice(0, 8);
  const types = ['move', 'release', 'count', 'expedite'];
  const prios = ['critical', 'high', 'medium'] as const;
  return wip.map((row, i) => {
    const h = hash(row.wip_id);
    return {
      action_id: `ACT-${i + 1}-${row.plantId.slice(0, 4)}`,
      title: `${row.site}: ${types[h % types.length]} ${row.wip_type}`,
      wip_id: row.wip_id,
      action_type: types[h % types.length],
      priority: prios[h % prios.length],
      due_hint: h % 2 === 0 ? 'This shift' : 'Next 4h',
    };
  });
}
