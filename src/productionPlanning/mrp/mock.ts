import type {MrpVersion, MrpVersionAuditEvent, MrpVersionFiltersState, MrpVersionKpi} from './types';

export const mrpVersions: MrpVersion[] = [
  // ── March Reforecast 2025 ────────────────────────────────────────────────────
  {
    id: 'MRP-2025-03-001',
    planningCycle: 'March Reforecast 2025',
    cycleId: 'MRP-CYCLE-2025-03',
    parentMpsVersionId: 'MPS-2025-03-001',
    mrpType: 'Official',
    effectivePeriodStart: '2025-03-01',
    effectivePeriodEnd: '2025-03-31',
    generatedAt: '2025-03-06T10:00:00',
    generatedBy: 'Maya Planner',
    approvalStatus: 'Approved',
    approvedBy: 'Carlos Ops Manager',
    approvedAt: '2025-03-06T11:30:00',
    isApprovedBaseline: true,
    changeReason: 'Official MRP generated from approved March baseline MPS.',
    previousValues: {},
    impactedMaterials: ['MAT-4421', 'MAT-0882', 'MAT-1134'],
    impactedWOs: ['WO-1800', 'WO-1801', 'WO-1802'],
    impactedLines: ['Line 1', 'Line 2'],
    linkedForecastVersionIds: ['FCT-2025-03-001'],
    notes: 'Committed official MRP. Drives procurement and WO release for March.',
  },
  {
    id: 'MRP-2025-03-002',
    planningCycle: 'March Reforecast 2025',
    cycleId: 'MRP-CYCLE-2025-03',
    parentMpsVersionId: 'MPS-2025-03-001',
    mrpType: 'Simulation',
    effectivePeriodStart: '2025-03-01',
    effectivePeriodEnd: '2025-03-31',
    generatedAt: '2025-03-07T14:00:00',
    generatedBy: 'Ana Forecast Analyst',
    approvalStatus: 'Approved',
    approvedBy: 'Carlos Ops Manager',
    approvedAt: '2025-03-08T09:00:00',
    isApprovedBaseline: false,
    changeReason: 'Simulation to model Line 3 shift impact on material requirements.',
    previousValues: {line3Qty: 12000, line3QtyNew: 9500},
    impactedMaterials: ['MAT-4421', 'MAT-2291'],
    impactedWOs: ['WO-1810'],
    impactedLines: ['Line 3'],
    linkedForecastVersionIds: ['FCT-2025-03-001'],
    notes: 'Non-official simulation. For analysis only.',
  },
  // ── June Forecast 2025 ───────────────────────────────────────────────────────
  {
    id: 'MRP-2025-06-001',
    planningCycle: 'June Forecast 2025',
    cycleId: 'MRP-CYCLE-2025-06',
    parentMpsVersionId: 'MPS-2025-06-001',
    mrpType: 'Official',
    effectivePeriodStart: '2025-06-01',
    effectivePeriodEnd: '2025-08-31',
    generatedAt: '2025-06-05T10:00:00',
    generatedBy: 'Maya Planner',
    approvalStatus: 'Approved',
    approvedBy: 'Carlos Ops Manager',
    approvedAt: '2025-06-05T14:00:00',
    isApprovedBaseline: true,
    changeReason: 'Official MRP for June baseline. Covers Jun–Aug horizon.',
    previousValues: {},
    impactedMaterials: ['MAT-4421', 'MAT-0882', 'MAT-1134', 'MAT-2291'],
    impactedWOs: ['WO-1830', 'WO-1831', 'WO-1832', 'WO-1833'],
    impactedLines: ['Line 1', 'Line 2', 'Line 3'],
    linkedForecastVersionIds: ['FCT-2025-06-001', 'FCT-2025-06-002'],
    notes: 'Drives procurement for Jun–Aug. August buckets confirmed.',
  },
  {
    id: 'MRP-2025-06-002',
    planningCycle: 'June Forecast 2025',
    cycleId: 'MRP-CYCLE-2025-06',
    parentMpsVersionId: 'MPS-2025-06-001',
    mrpType: 'Simulation',
    effectivePeriodStart: '2025-06-01',
    effectivePeriodEnd: '2025-08-31',
    generatedAt: '2025-06-10T09:30:00',
    generatedBy: 'Ana Forecast Analyst',
    approvalStatus: 'Approved',
    approvedBy: 'Carlos Ops Manager',
    approvedAt: '2025-06-11T10:00:00',
    isApprovedBaseline: false,
    changeReason: 'Simulation of SKU-449 line reallocation from Line 2 to Line 3.',
    previousValues: {sku449Line: 'Line 2', sku449LineNew: 'Line 3'},
    impactedMaterials: ['MAT-0449', 'MAT-2291'],
    impactedWOs: ['WO-1850', 'WO-1851'],
    impactedLines: ['Line 2', 'Line 3'],
    linkedForecastVersionIds: ['FCT-2025-06-003'],
    notes: null,
  },
  {
    id: 'MRP-2025-06-003',
    planningCycle: 'June Forecast 2025',
    cycleId: 'MRP-CYCLE-2025-06',
    parentMpsVersionId: 'MPS-2025-06-002',
    mrpType: 'Simulation',
    effectivePeriodStart: '2025-06-01',
    effectivePeriodEnd: '2025-08-31',
    generatedAt: '2025-06-18T11:00:00',
    generatedBy: 'Maya Planner',
    approvalStatus: 'Pending Approval',
    approvedBy: null,
    approvedAt: null,
    isApprovedBaseline: false,
    changeReason: 'Simulation for post-maintenance line reallocation scenario.',
    previousValues: {},
    impactedMaterials: ['MAT-0449'],
    impactedWOs: ['WO-1852'],
    impactedLines: ['Line 3'],
    linkedForecastVersionIds: ['FCT-2025-06-003'],
    notes: 'Pending approval. Simulation only — parent MPS is non-baseline.',
  },
  {
    id: 'MRP-2025-06-004',
    planningCycle: 'June Forecast 2025',
    cycleId: 'MRP-CYCLE-2025-06',
    parentMpsVersionId: 'MPS-2025-06-003',
    mrpType: 'Simulation',
    effectivePeriodStart: '2025-06-01',
    effectivePeriodEnd: '2025-09-30',
    generatedAt: '2025-06-24T10:00:00',
    generatedBy: 'Ana Forecast Analyst',
    approvalStatus: 'Draft',
    approvedBy: null,
    approvedAt: null,
    isApprovedBaseline: false,
    changeReason: 'Simulation for September pull-in +12K units SKU-221.',
    previousValues: {sepPlannedQty: 0, sepPlannedQtyNew: 12000},
    impactedMaterials: ['MAT-4421', 'MAT-0882'],
    impactedWOs: [],
    impactedLines: ['Line 1'],
    linkedForecastVersionIds: ['FCT-2025-06-004'],
    notes: 'Working draft. Parent MPS pending approval.',
  },
];

export const mrpCycleOptions = [
  {id: 'MRP-CYCLE-2025-06', label: 'June Forecast 2025'},
  {id: 'MRP-CYCLE-2025-03', label: 'March Reforecast 2025'},
];

export const defaultMrpVersionFilters: MrpVersionFiltersState = {
  cycleId: '',
  approvalStatus: '',
  mrpType: '',
  isBaseline: '',
  parentMpsVersionId: '',
  dateFrom: '',
  dateTo: '',
  search: '',
};

export const mrpAuditHistoryMap: Record<string, MrpVersionAuditEvent[]> = {
  'MRP-2025-03-001': [
    {id: 'MRPAH-301-1', versionId: 'MRP-2025-03-001', eventType: 'Generated', actor: 'Maya Planner', timestamp: '2025-03-06T10:00:00', comment: 'Official MRP generated from approved March baseline MPS.'},
    {id: 'MRPAH-301-2', versionId: 'MRP-2025-03-001', eventType: 'Submitted', actor: 'Maya Planner', timestamp: '2025-03-06T10:15:00', comment: null},
    {id: 'MRPAH-301-3', versionId: 'MRP-2025-03-001', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-03-06T11:30:00', comment: 'Approved. Procurement may proceed.'},
    {id: 'MRPAH-301-4', versionId: 'MRP-2025-03-001', eventType: 'SetAsBaseline', actor: 'Carlos Ops Manager', timestamp: '2025-03-06T11:35:00', comment: 'Set as committed MRP baseline for March.'},
  ],
  'MRP-2025-03-002': [
    {id: 'MRPAH-302-1', versionId: 'MRP-2025-03-002', eventType: 'Generated', actor: 'Ana Forecast Analyst', timestamp: '2025-03-07T14:00:00', comment: 'Simulation: Line 3 shift impact analysis.'},
    {id: 'MRPAH-302-2', versionId: 'MRP-2025-03-002', eventType: 'Submitted', actor: 'Ana Forecast Analyst', timestamp: '2025-03-07T14:10:00', comment: null},
    {id: 'MRPAH-302-3', versionId: 'MRP-2025-03-002', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-03-08T09:00:00', comment: 'Approved as simulation reference.'},
  ],
  'MRP-2025-06-001': [
    {id: 'MRPAH-601-1', versionId: 'MRP-2025-06-001', eventType: 'Generated', actor: 'Maya Planner', timestamp: '2025-06-05T10:00:00', comment: 'Official MRP generated from approved June baseline MPS.'},
    {id: 'MRPAH-601-2', versionId: 'MRP-2025-06-001', eventType: 'Submitted', actor: 'Maya Planner', timestamp: '2025-06-05T10:15:00', comment: null},
    {id: 'MRPAH-601-3', versionId: 'MRP-2025-06-001', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-06-05T14:00:00', comment: 'Approved. Procurement may proceed.'},
    {id: 'MRPAH-601-4', versionId: 'MRP-2025-06-001', eventType: 'SetAsBaseline', actor: 'Carlos Ops Manager', timestamp: '2025-06-05T14:05:00', comment: 'Set as committed MRP baseline for Jun–Aug.'},
  ],
  'MRP-2025-06-002': [
    {id: 'MRPAH-602-1', versionId: 'MRP-2025-06-002', eventType: 'Generated', actor: 'Ana Forecast Analyst', timestamp: '2025-06-10T09:30:00', comment: null},
    {id: 'MRPAH-602-2', versionId: 'MRP-2025-06-002', eventType: 'Submitted', actor: 'Ana Forecast Analyst', timestamp: '2025-06-10T09:45:00', comment: 'SKU-449 reallocation simulation.'},
    {id: 'MRPAH-602-3', versionId: 'MRP-2025-06-002', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-06-11T10:00:00', comment: null},
  ],
  'MRP-2025-06-003': [
    {id: 'MRPAH-603-1', versionId: 'MRP-2025-06-003', eventType: 'Generated', actor: 'Maya Planner', timestamp: '2025-06-18T11:00:00', comment: 'Post-maintenance scenario simulation.'},
    {id: 'MRPAH-603-2', versionId: 'MRP-2025-06-003', eventType: 'Submitted', actor: 'Maya Planner', timestamp: '2025-06-18T11:15:00', comment: null},
  ],
  'MRP-2025-06-004': [
    {id: 'MRPAH-604-1', versionId: 'MRP-2025-06-004', eventType: 'Generated', actor: 'Ana Forecast Analyst', timestamp: '2025-06-24T10:00:00', comment: 'Draft simulation for September pull-in.'},
  ],
};

export function getMrpAuditHistory(versionId: string): MrpVersionAuditEvent[] {
  return mrpAuditHistoryMap[versionId] ?? [];
}

export function buildMrpVersionKpis(versions: MrpVersion[]): MrpVersionKpi[] {
  const latestBaseline = [...versions]
    .filter((v) => v.isApprovedBaseline)
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt))[0] ?? null;
  const pendingCount = versions.filter((v) => v.approvalStatus === 'Pending Approval').length;
  const officialCount = versions.filter((v) => v.mrpType === 'Official').length;
  const simulationCount = versions.filter((v) => v.mrpType === 'Simulation').length;
  const mostRecentCycleId = mrpCycleOptions[0]?.id ?? '';
  const versionsThisCycle = versions.filter((v) => v.cycleId === mostRecentCycleId).length;

  return [
    {
      key: 'active-baseline',
      label: 'Active Baseline',
      value: latestBaseline?.id ?? '—',
      helperText: latestBaseline ? latestBaseline.planningCycle : 'No committed baseline',
      tone: latestBaseline ? 'success' : 'neutral',
      icon: 'baseline',
    },
    {
      key: 'pending-approval',
      label: 'Pending Approval',
      value: pendingCount,
      helperText: pendingCount > 0 ? 'Requires planner decision' : 'No versions pending',
      tone: pendingCount > 0 ? 'warning' : 'neutral',
      icon: 'pending',
    },
    {
      key: 'official-versions',
      label: 'Official MRPs',
      value: officialCount,
      helperText: `${simulationCount} simulation run${simulationCount !== 1 ? 's' : ''}`,
      tone: officialCount > 0 ? 'success' : 'neutral',
      icon: 'versions',
    },
    {
      key: 'versions-this-cycle',
      label: 'This Cycle',
      value: versionsThisCycle,
      helperText: mrpCycleOptions[0]?.label ?? '—',
      tone: 'info',
      icon: 'simulation',
    },
  ];
}
