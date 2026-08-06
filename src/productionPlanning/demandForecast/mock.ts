import type {
  ApprovalHistoryEvent,
  ForecastFiltersState,
  ForecastKpi,
  ForecastVersion,
} from './types';

export const forecastVersions: ForecastVersion[] = [
  // ── March Reforecast 2025 ────────────────────────────────────────────────────
  {
    id: 'FCT-2025-03-001',
    cycleId: 'CYCLE-2025-03',
    cycleLabel: 'March Reforecast 2025',
    versionType: 'Baseline',
    importedAt: '2025-03-03T09:10:00',
    sourceSystem: 'SAP IBP',
    importedBy: 'Maya Planner',
    approvedBy: 'Carlos Ops Manager',
    approvalStatus: 'Approved',
    approvalDate: '2025-03-05T14:22:00',
    changeReason: 'Initial baseline for Q1 reforecast cycle.',
    impactedMaterials: ['MAT-4421', 'MAT-0882', 'MAT-1134'],
    impactedWOs: ['WO-1800', 'WO-1801', 'WO-1802', 'WO-1803'],
    impactedLines: ['Line 1', 'Line 2'],
    notes: 'Approved without exceptions.',
    linkedMpsVersionIds: ['MPS-2025-03-001'],
  },
  {
    id: 'FCT-2025-03-002',
    cycleId: 'CYCLE-2025-03',
    cycleLabel: 'March Reforecast 2025',
    versionType: 'Revised',
    importedAt: '2025-03-10T11:30:00',
    sourceSystem: 'Excel – demand_mar25_rev1.xlsx',
    importedBy: 'Ana Forecast Analyst',
    approvedBy: 'Carlos Ops Manager',
    approvalStatus: 'Approved',
    approvalDate: '2025-03-11T10:05:00',
    changeReason: 'Demand peak for Line 3 moved from March to April based on updated customer PO.',
    impactedMaterials: ['MAT-4421', 'MAT-2291'],
    impactedWOs: ['WO-1810', 'WO-1811'],
    impactedLines: ['Line 3'],
    notes: null,
    linkedMpsVersionIds: ['MPS-2025-03-002'],
  },
  {
    id: 'FCT-2025-03-003',
    cycleId: 'CYCLE-2025-03',
    cycleLabel: 'March Reforecast 2025',
    versionType: 'Revised',
    importedAt: '2025-03-18T08:55:00',
    sourceSystem: 'SAP IBP',
    importedBy: 'Maya Planner',
    approvedBy: null,
    approvalStatus: 'Rejected',
    approvalDate: '2025-03-19T09:40:00',
    changeReason: 'Attempt to add SKU-449 volume — rejected due to capacity constraints on Line 2.',
    impactedMaterials: ['MAT-0449'],
    impactedWOs: ['WO-1820'],
    impactedLines: ['Line 2'],
    notes: 'Rejected by planning manager — capacity check failed.',
    linkedMpsVersionIds: [],
  },
  // ── June Forecast 2025 ───────────────────────────────────────────────────────
  {
    id: 'FCT-2025-06-001',
    cycleId: 'CYCLE-2025-06',
    cycleLabel: 'June Forecast 2025',
    versionType: 'Baseline',
    importedAt: '2025-06-02T08:14:00',
    sourceSystem: 'SAP IBP',
    importedBy: 'Maya Planner',
    approvedBy: 'Carlos Ops Manager',
    approvalStatus: 'Approved',
    approvalDate: '2025-06-04T13:10:00',
    changeReason: 'Initial baseline for June planning cycle.',
    impactedMaterials: ['MAT-4421', 'MAT-0882', 'MAT-1134', 'MAT-2291'],
    impactedWOs: ['WO-1830', 'WO-1831', 'WO-1832', 'WO-1833', 'WO-1834'],
    impactedLines: ['Line 1', 'Line 2', 'Line 3'],
    notes: null,
    linkedMpsVersionIds: ['MPS-2025-06-001'],
  },
  {
    id: 'FCT-2025-06-002',
    cycleId: 'CYCLE-2025-06',
    cycleLabel: 'June Forecast 2025',
    versionType: 'Revised',
    importedAt: '2025-06-09T10:05:00',
    sourceSystem: 'Excel – demand_jun25_rev1.xlsx',
    importedBy: 'Ana Forecast Analyst',
    approvedBy: 'Carlos Ops Manager',
    approvalStatus: 'Approved',
    approvalDate: '2025-06-10T16:00:00',
    changeReason: 'August peak volume increased +8% from commercial team update.',
    impactedMaterials: ['MAT-4421', 'MAT-1134'],
    impactedWOs: ['WO-1840', 'WO-1841', 'WO-1842'],
    impactedLines: ['Line 1', 'Line 2'],
    notes: 'Approved with note: sterilization capacity must be rechecked for August.',
    linkedMpsVersionIds: ['MPS-2025-06-001'],
  },
  {
    id: 'FCT-2025-06-003',
    cycleId: 'CYCLE-2025-06',
    cycleLabel: 'June Forecast 2025',
    versionType: 'Revised',
    importedAt: '2025-06-16T14:20:00',
    sourceSystem: 'SAP IBP',
    importedBy: 'Maya Planner',
    approvedBy: 'Carlos Ops Manager',
    approvalStatus: 'Approved',
    approvalDate: '2025-06-17T09:30:00',
    changeReason: 'SKU-449 volume reallocated from Line 2 to Line 3 following maintenance window.',
    impactedMaterials: ['MAT-0449', 'MAT-2291'],
    impactedWOs: ['WO-1850', 'WO-1851'],
    impactedLines: ['Line 2', 'Line 3'],
    notes: null,
    linkedMpsVersionIds: ['MPS-2025-06-002'],
  },
  {
    id: 'FCT-2025-06-004',
    cycleId: 'CYCLE-2025-06',
    cycleLabel: 'June Forecast 2025',
    versionType: 'Revised',
    importedAt: '2025-06-23T09:45:00',
    sourceSystem: 'Excel – demand_jun25_rev2.xlsx',
    importedBy: 'Ana Forecast Analyst',
    approvedBy: null,
    approvalStatus: 'Pending Approval',
    approvalDate: null,
    changeReason: 'September customer pull-in: +12K units SKU-221. Requires capacity confirmation.',
    impactedMaterials: ['MAT-4421', 'MAT-0882'],
    impactedWOs: ['WO-1860', 'WO-1861'],
    impactedLines: ['Line 1'],
    notes: 'Submitted to Carlos Ops Manager for approval.',
    linkedMpsVersionIds: ['MPS-2025-06-003'],
  },
  {
    id: 'FCT-2025-06-005',
    cycleId: 'CYCLE-2025-06',
    cycleLabel: 'June Forecast 2025',
    versionType: 'Revised',
    importedAt: '2025-06-25T16:10:00',
    sourceSystem: 'SAP IBP',
    importedBy: 'Maya Planner',
    approvedBy: null,
    approvalStatus: 'Draft',
    approvalDate: null,
    changeReason: 'Exploring SKU-330 demand smoothing — in progress, not yet submitted.',
    impactedMaterials: ['MAT-3301'],
    impactedWOs: [],
    impactedLines: ['Line 2'],
    notes: 'Working draft. Do not approve.',
    linkedMpsVersionIds: [],
  },
];

export const approvalHistoryMap: Record<string, ApprovalHistoryEvent[]> = {
  'FCT-2025-03-001': [
    {id: 'AH-301-1', versionId: 'FCT-2025-03-001', eventType: 'Imported', actor: 'Maya Planner', timestamp: '2025-03-03T09:10:00', comment: 'Imported from SAP IBP automated export.'},
    {id: 'AH-301-2', versionId: 'FCT-2025-03-001', eventType: 'Submitted', actor: 'Maya Planner', timestamp: '2025-03-03T09:25:00', comment: null},
    {id: 'AH-301-3', versionId: 'FCT-2025-03-001', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-03-05T14:22:00', comment: 'Baseline approved. Proceed with March reforecast cycle.'},
  ],
  'FCT-2025-03-002': [
    {id: 'AH-302-1', versionId: 'FCT-2025-03-002', eventType: 'Imported', actor: 'Ana Forecast Analyst', timestamp: '2025-03-10T11:30:00', comment: null},
    {id: 'AH-302-2', versionId: 'FCT-2025-03-002', eventType: 'Submitted', actor: 'Ana Forecast Analyst', timestamp: '2025-03-10T11:45:00', comment: 'Line 3 peak shift per updated customer PO.'},
    {id: 'AH-302-3', versionId: 'FCT-2025-03-002', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-03-11T10:05:00', comment: null},
  ],
  'FCT-2025-03-003': [
    {id: 'AH-303-1', versionId: 'FCT-2025-03-003', eventType: 'Imported', actor: 'Maya Planner', timestamp: '2025-03-18T08:55:00', comment: null},
    {id: 'AH-303-2', versionId: 'FCT-2025-03-003', eventType: 'Submitted', actor: 'Maya Planner', timestamp: '2025-03-18T09:10:00', comment: null},
    {id: 'AH-303-3', versionId: 'FCT-2025-03-003', eventType: 'Rejected', actor: 'Carlos Ops Manager', timestamp: '2025-03-19T09:40:00', comment: 'Line 2 capacity constraint prevents this revision. Re-evaluate with capacity plan first.'},
  ],
  'FCT-2025-06-001': [
    {id: 'AH-601-1', versionId: 'FCT-2025-06-001', eventType: 'Imported', actor: 'Maya Planner', timestamp: '2025-06-02T08:14:00', comment: 'Imported from SAP IBP automated export.'},
    {id: 'AH-601-2', versionId: 'FCT-2025-06-001', eventType: 'Submitted', actor: 'Maya Planner', timestamp: '2025-06-02T08:30:00', comment: null},
    {id: 'AH-601-3', versionId: 'FCT-2025-06-001', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-06-04T13:10:00', comment: 'Baseline approved. Proceed with planning cycle.'},
  ],
  'FCT-2025-06-002': [
    {id: 'AH-602-1', versionId: 'FCT-2025-06-002', eventType: 'Imported', actor: 'Ana Forecast Analyst', timestamp: '2025-06-09T10:05:00', comment: null},
    {id: 'AH-602-2', versionId: 'FCT-2025-06-002', eventType: 'Submitted', actor: 'Ana Forecast Analyst', timestamp: '2025-06-09T10:20:00', comment: 'August peak +8% per commercial team update.'},
    {id: 'AH-602-3', versionId: 'FCT-2025-06-002', eventType: 'Approved', actor: 'Carlos Ops Manager', timestamp: '2025-06-10T16:00:00', comment: 'Approved — sterilization team to validate August capacity.'},
  ],
  'FCT-2025-06-004': [
    {id: 'AH-604-1', versionId: 'FCT-2025-06-004', eventType: 'Imported', actor: 'Ana Forecast Analyst', timestamp: '2025-06-23T09:45:00', comment: null},
    {id: 'AH-604-2', versionId: 'FCT-2025-06-004', eventType: 'Submitted', actor: 'Ana Forecast Analyst', timestamp: '2025-06-23T10:00:00', comment: 'Requesting approval for September pull-in — +12K units SKU-221.'},
  ],
  'FCT-2025-06-005': [
    {id: 'AH-605-1', versionId: 'FCT-2025-06-005', eventType: 'Imported', actor: 'Maya Planner', timestamp: '2025-06-25T16:10:00', comment: 'Working draft for SKU-330 demand smoothing scenario.'},
  ],
};

export function getApprovalHistory(versionId: string): ApprovalHistoryEvent[] {
  return approvalHistoryMap[versionId] ?? [];
}

export function buildForecastKpis(versions: ForecastVersion[]): ForecastKpi[] {
  const activeVersion = [...versions]
    .filter((v) => v.approvalStatus === 'Approved' && v.versionType === 'Baseline')
    .sort((a, b) => b.importedAt.localeCompare(a.importedAt))[0] ?? null;
  const pendingCount = versions.filter((v) => v.approvalStatus === 'Pending Approval').length;
  const revisionsThisCycle = versions.filter((v) => v.cycleId === 'CYCLE-2025-06' && v.versionType === 'Revised').length;
  const linesImpacted = new Set(versions.flatMap((v) => v.impactedLines)).size;

  return [
    {
      key: 'active-version',
      label: 'Active Version',
      value: activeVersion?.id ?? '—',
      helperText: activeVersion ? activeVersion.cycleLabel : 'No active baseline',
      tone: activeVersion ? 'success' : 'neutral',
      icon: 'version',
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
      key: 'revisions-this-cycle',
      label: 'Revisions This Cycle',
      value: revisionsThisCycle,
      helperText: 'June Forecast 2025 revisions',
      tone: 'info',
      icon: 'revisions',
    },
    {
      key: 'lines-impacted',
      label: 'Lines Impacted',
      value: linesImpacted,
      helperText: 'Unique lines across all versions',
      tone: 'neutral',
      icon: 'lines',
    },
  ];
}

export const defaultForecastFilters: ForecastFiltersState = {
  cycleId: '',
  versionType: '',
  approvalStatus: '',
  dateFrom: '',
  dateTo: '',
  search: '',
};

export const forecastCycleOptions = [
  {id: 'CYCLE-2025-06', label: 'June Forecast 2025'},
  {id: 'CYCLE-2025-03', label: 'March Reforecast 2025'},
];
