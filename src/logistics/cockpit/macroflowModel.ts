import type { AppScreen } from '../../navigation/navigationConfig';
import type { CtTone } from './cockpitTheme';
import { logisticsData } from '../data/logisticsMockData';

export type MacroflowId = 'IN01' | 'IN02' | 'WIP' | 'OB01' | 'OB02' | 'OB03';

export type AreaTowerId = 'receiving' | 'wip' | 'outbound';

export type MacroflowDef = {
  id: MacroflowId;
  label: string;
  processLabel: string;
  steps: string;
  area: AreaTowerId;
  kpiLabel: string;
  kpiValue: string | number;
  kpiUnit?: string;
  target: string;
  delta: string;
  deltaTone: CtTone;
  tone: CtTone;
  healthscore: number;
  utilization: number;
  secondaryLabel: string;
  secondaryValue: string | number;
  sparkline: number[];
  insight: string;
  screen: AppScreen;
};

export type CockpitKpi = {
  id: string;
  label: string;
  value: string | number;
  unit?: string;
  target: string;
  delta: string;
  tone: CtTone;
  sparkline: number[];
  macroflow: MacroflowId;
  insight: string;
  tableRows: { key: string; value: string; age?: string; owner?: string }[];
};

const d = logisticsData;
const k = d.executive_kpis;
const blockedWip = d.wip_lanes.filter((w) => w.status === 'blocked' || w.status === 'waiting').length;
const sterilAtRisk = d.sterilization_loads.filter((l) => l.sla_risk !== 'on_track').length;
const sterilInFlight = d.sterilization_loads.filter((l) =>
  ['in_transit_to_provider', 'sterilization_in_progress', 'received_by_provider'].includes(l.state),
).length;
const preSterilOpen = d.journey_heatmap.find((s) => s.step_id === 'pre_steril')?.open_count ?? 0;
const supplyOpen = d.journey_heatmap.find((s) => s.step_id === 'production_supply')?.open_count ?? 0;

const spark = (seed: number[]) => seed;

export const SITE_LABEL = 'El Paso';

export const globalAlert = {
  tone: 'danger' as CtTone,
  title: 'Site logistics risk',
  message: `${k.critical_exceptions} critical exceptions · QA hold ${k.qa_hold_count} · ${k.shipments_not_ready} shipments not ready · receiving at ${k.receiving_capacity_pct}%`,
};

export const macroflows: MacroflowDef[] = [
  {
    id: 'IN01',
    label: 'IN01 Receiving',
    processLabel: 'Raw material receiving & dock',
    steps: 'ST01–ST25',
    area: 'receiving',
    kpiLabel: 'Inbound today',
    kpiValue: k.inbound_today,
    target: '≤ 8 trucks',
    delta: '+1 vs yest.',
    deltaTone: 'warn',
    tone: k.dock_backlog > 0 ? 'warn' : 'ok',
    healthscore: 100 - k.dock_backlog * 12 - Math.max(0, k.receiving_capacity_pct - 75),
    utilization: k.receiving_capacity_pct,
    secondaryLabel: 'Dock backlog',
    secondaryValue: k.dock_backlog,
    sparkline: spark([3, 4, 5, 4, 6, 5, k.inbound_today]),
    insight: 'Staging projected over capacity after next inbound wave; prioritize QA release to free slots.',
    screen: 'logistics_control_tower',
  },
  {
    id: 'IN02',
    label: 'IN02 Prod. Supply',
    processLabel: 'Production supply & kanban',
    steps: 'ST26–ST43',
    area: 'wip',
    kpiLabel: 'Supply open',
    kpiValue: supplyOpen,
    target: '≤ 2 open',
    delta: '+2 at risk',
    deltaTone: 'warn',
    tone: supplyOpen > 3 ? 'warn' : 'ok',
    healthscore: Math.max(40, 100 - supplyOpen * 12),
    utilization: 72,
    secondaryLabel: 'QA holds feeding supply',
    secondaryValue: k.qa_hold_count,
    sparkline: spark([2, 3, 2, 4, 5, 3, supplyOpen]),
    insight: 'Supermarket short on Line 5; kanban SLA at risk until QA releases lot LOT-26-0709-B.',
    screen: 'job_readiness',
  },
  {
    id: 'WIP',
    label: 'WIP Floor',
    processLabel: 'Work-in-process visibility',
    steps: 'ST38–ST43',
    area: 'wip',
    kpiLabel: 'Blocked / waiting lines',
    kpiValue: blockedWip,
    target: '0 blocked',
    delta: 'Line 3 blocked',
    deltaTone: 'danger',
    tone: blockedWip > 1 ? 'danger' : blockedWip ? 'warn' : 'ok',
    healthscore: Math.max(35, 100 - blockedWip * 28),
    utilization: 68,
    secondaryLabel: 'Running lines',
    secondaryValue: d.wip_lanes.filter((w) => w.status === 'running').length,
    sparkline: spark([1, 1, 2, 1, 2, 3, blockedWip]),
    insight: 'Line 3 waiting labels; Line 5 supermarket short — escalate to warehouse TL.',
    screen: 'wip_control_tower',
  },
  {
    id: 'OB01',
    label: 'OB01 Pre-Steril',
    processLabel: 'Pre-sterilization load prep',
    steps: 'ST44–ST61',
    area: 'outbound',
    kpiLabel: 'Loads staging',
    kpiValue: preSterilOpen,
    target: 'On-plan ≤ 3',
    delta: 'Revail link check',
    deltaTone: 'ok',
    tone: preSterilOpen > 3 ? 'warn' : 'ok',
    healthscore: Math.max(50, 100 - preSterilOpen * 10),
    utilization: 61,
    secondaryLabel: 'Demand open',
    secondaryValue: preSterilOpen + 1,
    sparkline: spark([1, 2, 2, 3, 2, 2, preSterilOpen]),
    insight: 'Pre-steril queue stable; verify load number governance before next dispatch window.',
    screen: 'sterilization_tracker',
  },
  {
    id: 'OB02',
    label: 'OB02 Sterilization',
    processLabel: 'Provider / post-steril QA',
    steps: 'ST62–ST83',
    area: 'outbound',
    kpiLabel: 'In transit / at provider',
    kpiValue: sterilInFlight || k.loads_at_provider,
    target: 'SLA on track',
    delta: `${sterilAtRisk} at risk`,
    deltaTone: sterilAtRisk ? 'danger' : 'ok',
    tone: sterilAtRisk ? 'danger' : 'warn',
    healthscore: Math.max(30, 100 - sterilAtRisk * 22 - k.quarantine_aging_avg_days * 5),
    utilization: 84,
    secondaryLabel: 'Post-steril QA late',
    secondaryValue: d.journey_heatmap.find((s) => s.step_id === 'post_steril_qa')?.open_count ?? 0,
    sparkline: spark([2, 3, 3, 4, 4, 3, sterilInFlight || k.loads_at_provider]),
    insight: 'SL-2026-0708 past 7-day QA TAT — treat as late pending, not expected process.',
    screen: 'sterilization_tracker',
  },
  {
    id: 'OB03',
    label: 'OB03 Shipping',
    processLabel: 'FG fulfillment & customer ship',
    steps: 'ST86–ST108',
    area: 'outbound',
    kpiLabel: 'Shipments not ready',
    kpiValue: k.shipments_not_ready,
    target: '0 overdue pledge',
    delta: `${k.pledge_due_today} pledge today`,
    deltaTone: 'danger',
    tone: k.shipments_not_ready > 4 ? 'danger' : 'warn',
    healthscore: Math.max(28, 100 - k.shipments_not_ready * 8 - k.pledge_due_today * 10),
    utilization: 55,
    secondaryLabel: 'Open backorders',
    secondaryValue: k.open_backorders,
    sparkline: spark([4, 5, 5, 6, 7, 6, k.shipments_not_ready]),
    insight: 'Mayo pledge blocked on picking + hazmat docs; air-ship option if QA releases BO-0709-01.',
    screen: 'shipment_readiness',
  },
];

export const areaTowers: {
  id: AreaTowerId;
  title: string;
  subtitle: string;
  screen: AppScreen;
  macroflows: MacroflowId[];
  tone: CtTone;
  embedded?: boolean;
}[] = [
  {
    id: 'receiving',
    title: 'Inbound detail (IN01)',
    subtitle: 'Merged receiving layer · docks, staging, inspection',
    screen: 'logistics_control_tower',
    macroflows: ['IN01'],
    tone: 'warn',
    embedded: true,
  },
  {
    id: 'wip',
    title: 'WIP Control Tower',
    subtitle: 'IN02 + WIP · supply, lines, material readiness',
    screen: 'wip_control_tower',
    macroflows: ['IN02', 'WIP'],
    tone: 'danger',
  },
  {
    id: 'outbound',
    title: 'Sterilization / Outbound Control Tower',
    subtitle: 'OB01–OB03 · steril network & shipment readiness',
    screen: 'sterilization_outbound_control_tower',
    macroflows: ['OB01', 'OB02', 'OB03'],
    tone: 'danger',
  },
];

export const cockpitKpis: CockpitKpi[] = [
  {
    id: 'inbound_today',
    label: 'Inbound today',
    value: k.inbound_today,
    unit: 'trucks',
    target: 'Target ≤ 8',
    delta: '+1',
    tone: 'warn',
    sparkline: [3, 4, 5, 4, 6, 5, k.inbound_today],
    macroflow: 'IN01',
    insight: 'Five trucks expected; staging at 81% — projected 110% after unload without QA releases.',
    tableRows: d.critical_materials
      .filter((m) => m.step === 'Quality' || m.step === 'Receiving')
      .map((m) => ({
        key: m.lot,
        value: `${m.sku} · ${m.impact}`,
        age: `${m.aging_hours}h`,
        owner: d.users[m.owner] ?? m.owner,
      })),
  },
  {
    id: 'qa_hold',
    label: 'Materials on QA hold',
    value: k.qa_hold_count,
    unit: 'lots',
    target: 'SLA ≤ 2d inbound',
    delta: `${k.qa_release_lead_time_hours}h lead`,
    tone: 'warn',
    sparkline: [9, 10, 11, 12, 13, 12, k.qa_hold_count],
    macroflow: 'IN01',
    insight: 'Inbound QA TAT averaging 38h; one discrepancy lot blocks production order PO-100234.',
    tableRows: d.qa_inspections.slice(0, 5).map((i) => ({
      key: i.qa_inspection_id,
      value: `${i.lot} · ${i.qa_status}`,
      age: `${i.aging_days}d`,
      owner: d.users[i.owner_user_id] ?? i.owner_user_id,
    })),
  },
  {
    id: 'wip_blocked',
    label: 'WIP blocked / waiting',
    value: blockedWip,
    unit: 'lines',
    target: '0 blocked',
    delta: 'Labels + supermarket',
    tone: 'danger',
    sparkline: [1, 1, 2, 1, 2, 3, blockedWip],
    macroflow: 'WIP',
    insight: 'Two lines impacted by material readiness — escalate WIP CT exceptions.',
    tableRows: d.wip_lanes.map((w) => ({
      key: w.machine_id,
      value: `${w.name} · ${w.note}`,
      age: w.status,
      owner: w.job_id,
    })),
  },
  {
    id: 'steril_risk',
    label: 'Sterilization SLA risk',
    value: sterilAtRisk,
    unit: 'loads',
    target: '0 late',
    delta: `${k.loads_at_provider} at provider`,
    tone: sterilAtRisk ? 'danger' : 'ok',
    sparkline: [0, 1, 1, 2, 1, 2, sterilAtRisk],
    macroflow: 'OB02',
    insight: 'Provider + post-steril QA aging is the primary outbound bottleneck this shift.',
    tableRows: d.sterilization_loads.map((l) => ({
      key: l.sterilization_load_id,
      value: `${l.state} · ${l.product_family}`,
      age: l.sla_risk,
      owner: d.providers[l.provider_id]?.name ?? l.provider_id,
    })),
  },
  {
    id: 'ship_not_ready',
    label: 'Shipments not ready',
    value: k.shipments_not_ready,
    unit: 'orders',
    target: 'Pledge = 0 overdue',
    delta: `${k.open_backorders} BOs`,
    tone: 'danger',
    sparkline: [3, 4, 5, 5, 6, 6, k.shipments_not_ready],
    macroflow: 'OB03',
    insight: 'Pledge tier consumes overtime risk; prioritize hazmat docs and SAP delivery postings.',
    tableRows: d.outbound_shipments.slice(0, 5).map((s) => ({
      key: s.outbound_shipment_id,
      value: `${s.sales_order_id} · ${s.readiness_pct}% · ${s.priority_tier}`,
      age: s.due_date.slice(0, 10),
      owner: d.users[s.owner_user_id] ?? s.owner_user_id,
    })),
  },
  {
    id: 'exceptions',
    label: 'Open exceptions',
    value: d.exceptions.length,
    unit: 'active',
    target: 'Clear critical < 4h',
    delta: `${k.critical_exceptions} critical`,
    tone: 'danger',
    sparkline: [2, 3, 3, 4, 4, 4, d.exceptions.length],
    macroflow: 'WIP',
    insight: 'Exceptions span receiving, QA, steril, and shipping — use area towers for owned queues.',
    tableRows: d.exceptions.map((e) => ({
      key: e.exception_id,
      value: `${e.exception_type} · ${e.description}`,
      age: `${e.age_hours}h`,
      owner: d.users[e.owner_user_id] ?? e.owner_user_id,
    })),
  },
];

export const aiSiteSummary =
  'Highest risk this hour: post-sterilization QA aging and pledge shipments. Free receiving capacity by releasing inbound holds, then clear Line 3 label block before EOD. Sterilization loads at provider remain within dispatch cadence except SL-2026-0708.';

export { logisticsData };
