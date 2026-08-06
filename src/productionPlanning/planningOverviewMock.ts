export type ProductionPlanningPageId =
  | 'planning-overview'
  | 'twelve-month-plan'
  | 'capacity-planning'
  | 'scenario-planning'
  | 'monthly-mps'
  | 'mrp'
  | 'scheduling-workspace'
  | 'work-orders'
  | 'create-orders'
  | 'priority-queue'
  | 'wo-readiness'
  | 'material-and-warehouse'
  | 'execution-feedback'
  | 'batch-release'
  | 'schedule-versions'
  | 'planning-lineage';

export type PlanningKpi = {
  label: string;
  value: string;
  tone: 'neutral' | 'good' | 'warning' | 'critical' | 'ai';
  helper: string;
};

export type PlanningStatusCard = {
  id: string;
  title: string;
  category: 'Status' | 'Risk';
  status: string;
  severity: 'On Track' | 'Watch' | 'High Risk';
  summary: string;
  metricLabel: string;
  metricValue: string;
  relatedPageId: ProductionPlanningPageId;
};

export type RecommendationStatus = 'pending' | 'accepted' | 'rejected';

export type PlanningRecommendation = {
  id: string;
  title: string;
  summary: string;
  impact: string;
  confidence: number;
  generatedAt: string;
  recommendationType: 'Re-sequence' | 'Escalate' | 'Hold' | 'Release';
  relatedPageId: ProductionPlanningPageId;
  rationale: string[];
  actions: string[];
  status: RecommendationStatus;
  rejectionReason?: string;
};

export type PlanningAuditEvent = {
  id: string;
  timestamp: string;
  action: string;
  item: string;
  actor: string;
  details: string;
};

export const planningOverviewBriefing = {
  title: 'AI Planning Briefing',
  label: 'AI-generated planning summary',
  summary:
    'AI-generated view of the current planning cycle shows the next two weeks are executable, but material constraints and sterilization timing are starting to erode schedule stability. Planner attention is needed on two WO groups before additional releases are approved.',
  bullets: [
    '12-month demand remains within annual capacity assumptions, but August and October now require line balancing.',
    'Monthly MPS is stable inside the frozen window, with two high-priority sequence changes recommended before release.',
    'WO readiness is strong overall, but shortage and batch release blockers are creating concentrated risk on customer-critical orders.',
  ],
};

export const planningOverviewKpis: PlanningKpi[] = [
  {label: 'Clear-to-Build WOs', value: '48', tone: 'good', helper: '8 more than last planning cycle'},
  {label: 'Needs Attention WOs', value: '11', tone: 'warning', helper: 'Driven by shortages and release holds'},
  {label: 'Released WOs', value: '34', tone: 'neutral', helper: 'Inside current weekly release target'},
  {label: 'Sent to Production WOs', value: '27', tone: 'neutral', helper: '3 staged for next shift dispatch'},
  {label: 'AI Recommendations Pending Approval', value: '4', tone: 'ai', helper: '2 high-impact decisions pending'},
  {label: 'Plan Stability Score', value: '84%', tone: 'warning', helper: 'Below 88% internal target'},
  {label: 'Average AI Confidence', value: '91%', tone: 'ai', helper: 'Based on current scenario fit'},
];

export const planningOverviewStatusCards: PlanningStatusCard[] = [
  {
    id: 'twelve-month-status',
    title: 'Current 12-month plan status',
    category: 'Status',
    status: 'Balanced with seasonal watchpoints',
    severity: 'Watch',
    summary: 'Annual volume remains aligned to labor and line assumptions, but peak-month packaging capacity is tightening.',
    metricLabel: 'Constrained months',
    metricValue: '2',
    relatedPageId: 'twelve-month-plan',
  },
  {
    id: 'mps-status',
    title: 'Monthly MPS status',
    category: 'Status',
    status: 'Stable inside frozen horizon',
    severity: 'On Track',
    summary: 'The near-term plan is stable, with only two sequence decisions needed before the next release wave.',
    metricLabel: 'Frozen horizon adherence',
    metricValue: '93%',
    relatedPageId: 'monthly-mps',
  },
  {
    id: 'scheduling-status',
    title: 'Scheduling status',
    category: 'Status',
    status: 'Conflict resolution in progress',
    severity: 'Watch',
    summary: 'Three dispatch conflicts remain open around changeover windows and sterile line availability.',
    metricLabel: 'Open schedule conflicts',
    metricValue: '3',
    relatedPageId: 'scheduling-workspace',
  },
  {
    id: 'wo-readiness-status',
    title: 'Work order readiness summary',
    category: 'Status',
    status: 'Most WOs clear to build',
    severity: 'On Track',
    summary: 'Document, labor, and tooling checks are healthy, but a subset of orders still needs material confirmation.',
    metricLabel: 'Ready rate',
    metricValue: '81%',
    relatedPageId: 'work-orders',
  },
  {
    id: 'material-risk',
    title: 'Material shortage risks',
    category: 'Risk',
    status: 'Shortages impacting customer-priority WOs',
    severity: 'High Risk',
    summary: 'Resin lot M-447 and tray component K-882 are blocking builds scheduled in the next 72 hours.',
    metricLabel: 'At-risk WOs',
    metricValue: '5',
    relatedPageId: 'material-and-warehouse',
  },
  {
    id: 'execution-risk',
    title: 'Execution feedback risks',
    category: 'Risk',
    status: 'Repeat misses affecting realism',
    severity: 'Watch',
    summary: 'Recent missed starts on Line 3 are reducing confidence in current sequencing assumptions for recovery orders.',
    metricLabel: 'Missed starts',
    metricValue: '4',
    relatedPageId: 'execution-feedback',
  },
  {
    id: 'sterilization-risk',
    title: 'Sterilization risks',
    category: 'Risk',
    status: 'Capacity window almost saturated',
    severity: 'High Risk',
    summary: 'Friday sterilization capacity is nearly full, creating spillover risk for two sterile batches unless resequenced.',
    metricLabel: 'Capacity utilization',
    metricValue: '96%',
    relatedPageId: 'material-and-warehouse',
  },
  {
    id: 'batch-release-risk',
    title: 'Batch release risks',
    category: 'Risk',
    status: 'QA review queue needs prioritization',
    severity: 'Watch',
    summary: 'Three batches tied to shipment-critical orders are waiting on final review and could slow dispatch.',
    metricLabel: 'Pending critical batches',
    metricValue: '3',
    relatedPageId: 'work-orders',
  },
];

export const initialPlanningRecommendations: PlanningRecommendation[] = [
  {
    id: 'REC-PP-201',
    title: 'Re-sequence WO-1842 ahead of WO-1837 on Line 2',
    summary: 'Move a customer-priority WO forward to protect a Friday shipment while sterilization capacity is still available.',
    impact: 'Protects one customer-critical shipment and reduces sterilization queue spillover by one load.',
    confidence: 94,
    generatedAt: '2026-05-13 09:15',
    recommendationType: 'Re-sequence',
    relatedPageId: 'scheduling-workspace',
    rationale: [
      'WO-1842 has all readiness checks complete and can start immediately.',
      'WO-1837 depends on material lot M-447, which remains short.',
      'The current sequence increases the risk of idle sterile capacity on Friday.',
    ],
    actions: ['Move WO-1842 to next dispatch slot', 'Hold WO-1837 until shortage clears', 'Notify scheduling and sterilization teams'],
    status: 'pending',
  },
  {
    id: 'REC-PP-202',
    title: 'Hold release of batch group BR-77 until QA review is rebalanced',
    summary: 'Pause additional release volume into batch review to prevent compounding the current QA queue.',
    impact: 'Prevents release congestion and protects on-time review of shipment-critical batches.',
    confidence: 89,
    generatedAt: '2026-05-13 09:18',
    recommendationType: 'Hold',
    relatedPageId: 'work-orders',
    rationale: [
      'Three critical batches are already in the queue and need prioritization.',
      'Adding BR-77 now would increase turnaround risk on nearer-term commitments.',
      'Current QA staffing is below standard for the afternoon window.',
    ],
    actions: ['Hold BR-77 release', 'Prioritize shipment-critical reviews', 'Reassess after next QA handoff'],
    status: 'pending',
  },
  {
    id: 'REC-PP-203',
    title: 'Escalate resin shortage M-447 to supplier recovery workflow',
    summary: 'Open a fast-track recovery action on a shortage already impacting builds inside 72 hours.',
    impact: 'Improves recovery odds for five at-risk WOs and helps avoid schedule churn.',
    confidence: 92,
    generatedAt: '2026-05-13 09:22',
    recommendationType: 'Escalate',
    relatedPageId: 'material-and-warehouse',
    rationale: [
      'The shortage has already moved from watchlist to active schedule blocker.',
      'Five WOs in the near-term horizon are tied to the same lot family.',
      'Supplier expedite lead time still supports partial recovery if escalated now.',
    ],
    actions: ['Trigger supplier expedite', 'Reconfirm substitute availability', 'Review affected WOs in warehouse staging'],
    status: 'pending',
  },
  {
    id: 'REC-PP-204',
    title: 'Release WO-1861 to production this cycle',
    summary: 'Approve release for a fully ready WO to strengthen plan stability and preserve line continuity.',
    impact: 'Adds one executable order into the dispatch pool without increasing risk exposure.',
    confidence: 88,
    generatedAt: '2026-05-13 09:27',
    recommendationType: 'Release',
    relatedPageId: 'work-orders',
    rationale: [
      'WO-1861 has cleared material, document, labor, and tooling checks.',
      'Its sequence improves line continuity between two longer changeover events.',
      'No downstream sterilization or batch release bottlenecks are expected for this order.',
    ],
    actions: ['Approve WO release', 'Send order to scheduling queue', 'Confirm production dispatch timing'],
    status: 'pending',
  },
];

export const initialPlanningAuditEvents: PlanningAuditEvent[] = [
  {
    id: 'AUD-PP-101',
    timestamp: '2026-05-13 08:40',
    action: 'AI briefing generated',
    item: 'Planning Overview',
    actor: 'BLU.AI Planner',
    details: 'Local mock briefing refreshed for current planning cycle.',
  },
  {
    id: 'AUD-PP-102',
    timestamp: '2026-05-13 08:52',
    action: 'Planner viewed risk cluster',
    item: 'Material shortage risks',
    actor: 'Maya Planner',
    details: 'Opened shortage summary for near-term WO impact review.',
  },
];

// ─── V2 Overview Types & Mock Data ────────────────────────────────────────────

export type WoPipelineStage = {
  stage: string;
  count: number;
  tone: 'neutral' | 'good' | 'warning' | 'critical';
  pageId?: ProductionPlanningPageId;
};

export type MaintenancePlanItem = {
  id: string;
  equipment: string;
  type: 'Preventive' | 'Corrective' | 'Predictive';
  scheduledDate: string;
  line: string;
  duration: string;
  status: 'Scheduled' | 'Overdue' | 'In Progress';
};

export type ShiftScheduleEntry = {
  shift: 'Morning' | 'Afternoon' | 'Night';
  date: string;
  lines: string[];
  headcount: number;
  plannedUnits: number;
  supervisor: string;
};

export type PlanDeviationItem = {
  id: string;
  area: 'Demand' | 'MPS' | 'Capacity' | 'Execution';
  metric: string;
  planned: string;
  actual: string;
  variance: string;
  variancePct: number;
  severity: 'low' | 'medium' | 'high';
  trend: 'improving' | 'stable' | 'worsening';
  note: string;
};

export type PlanVsActualKpi = {
  id: string;
  label: string;
  unit: string;
  planned: number;
  actual: number;
  plannedDisplay: string;
  actualDisplay: string;
  higherIsBetter: boolean;
};

export type LineCapacityMachine = {
  machineId: string;
  machineName: string;
  plannedPct: number;
  actualPct: number;
};

export type LineCapacityLine = {
  lineId: string;
  lineName: string;
  plannedPct: number;
  actualPct: number;
  machines: LineCapacityMachine[];
};

export type LineCapacityKpi = {
  id: 'line-capacity';
  label: string;
  sitePlannedPct: number;
  siteActualPct: number;
  lines: LineCapacityLine[];
};

export type WipKpi = {
  id: 'wip';
  label: string;
  warehouseMaxCapacity: number;
  targetStock: number;
  actualStock: number;
  plannedDisplay: string;
  actualDisplay: string;
  capacityDisplay: string;
};

export type AiAgentMessage = {
  id: string;
  role: 'agent' | 'user';
  text: string;
  timestamp: string;
  actionType?: 'info' | 'suggestion' | 'action';
};

export type AiAgentAction = {
  id: string;
  label: string;
  description: string;
  impact: string;
  requiresConfirmation: boolean;
};

export const woPipelineMock: WoPipelineStage[] = [
  {stage: 'Backlog', count: 72, tone: 'neutral', pageId: 'work-orders'},
  {stage: 'Queue', count: 41, tone: 'neutral', pageId: 'work-orders'},
  {stage: 'Ready to Start', count: 29, tone: 'warning', pageId: 'work-orders'},
  {stage: 'Clear-to-Build', count: 48, tone: 'good', pageId: 'work-orders'},
  {stage: 'Released', count: 34, tone: 'neutral', pageId: 'work-orders'},
  {stage: 'Sent to Production', count: 27, tone: 'neutral', pageId: 'scheduling-workspace'},
  {stage: 'In Progress', count: 19, tone: 'good', pageId: 'execution-feedback'},
];

export const maintenancePlanMock: MaintenancePlanItem[] = [
  {id: 'MNT-001', equipment: 'Line 2 — Fill & Seal Unit', type: 'Preventive', scheduledDate: 'May 27', line: 'Line 2', duration: '4h', status: 'Scheduled'},
  {id: 'MNT-002', equipment: 'Sterilizer A — Chamber Seal', type: 'Corrective', scheduledDate: 'May 28', line: 'Sterile', duration: '2h', status: 'Overdue'},
  {id: 'MNT-003', equipment: 'Line 3 — Conveyor Drive', type: 'Predictive', scheduledDate: 'May 30', line: 'Line 3', duration: '6h', status: 'Scheduled'},
];

export const shiftScheduleMock: ShiftScheduleEntry[] = [
  {shift: 'Morning', date: 'Today (May 26)', lines: ['Line 1', 'Line 2', 'Line 3'], headcount: 42, plannedUnits: 1840, supervisor: 'R. Santos'},
  {shift: 'Afternoon', date: 'Today (May 26)', lines: ['Line 1', 'Line 2'], headcount: 36, plannedUnits: 1520, supervisor: 'M. Oliveira'},
  {shift: 'Night', date: 'Today (May 26)', lines: ['Line 1'], headcount: 18, plannedUnits: 720, supervisor: 'T. Ferreira'},
  {shift: 'Morning', date: 'Tomorrow (May 27)', lines: ['Line 1', 'Line 2', 'Line 3'], headcount: 44, plannedUnits: 1920, supervisor: 'R. Santos'},
  {shift: 'Afternoon', date: 'Tomorrow (May 27)', lines: ['Line 2', 'Line 3'], headcount: 38, plannedUnits: 1600, supervisor: 'C. Lima'},
  {shift: 'Night', date: 'Tomorrow (May 27)', lines: ['Line 1', 'Line 2'], headcount: 24, plannedUnits: 960, supervisor: 'T. Ferreira'},
];

export const planDeviationsMock: PlanDeviationItem[] = [
  {id: 'DEV-001', area: 'Execution', metric: 'PPA (Production Plan Attainment)', planned: '96%', actual: '94%', variance: '-2%', variancePct: 2.1, severity: 'medium', trend: 'stable', note: 'Missed starts on Line 3 driving gap'},
  {id: 'DEV-002', area: 'MPS', metric: 'Frozen Horizon Adherence', planned: '98%', actual: '93%', variance: '-5%', variancePct: 5.1, severity: 'high', trend: 'worsening', note: '2 sequence changes inside freeze window'},
  {id: 'DEV-003', area: 'Capacity', metric: 'Line 3 OEE', planned: '85%', actual: '71%', variance: '-14%', variancePct: 16.5, severity: 'high', trend: 'worsening', note: 'Conveyor issues reducing throughput'},
  {id: 'DEV-004', area: 'Demand', metric: 'Demand Forecast Accuracy (3M)', planned: '92%', actual: '88%', variance: '-4%', variancePct: 4.3, severity: 'medium', trend: 'stable', note: 'August peak estimate under review'},
  {id: 'DEV-005', area: 'Capacity', metric: 'Sterilizer Utilization', planned: '80%', actual: '96%', variance: '+16%', variancePct: 20.0, severity: 'high', trend: 'worsening', note: 'Friday window nearly saturated'},
  {id: 'DEV-006', area: 'Execution', metric: 'WO Ready Rate', planned: '90%', actual: '81%', variance: '-9%', variancePct: 10.0, severity: 'medium', trend: 'improving', note: 'Material confirmations clearing gradually'},
];

export const initialAiAgentMessages: AiAgentMessage[] = [
  {id: 'MSG-001', role: 'agent', text: 'Good morning. I\'ve reviewed the planning cycle. The next two weeks are broadly executable, but sterilizer capacity and resin shortage M-447 need your decision before the next release wave.', timestamp: '08:40', actionType: 'info'},
  {id: 'MSG-002', role: 'agent', text: 'I recommend re-sequencing WO-1842 ahead of WO-1837 on Line 2. WO-1842 is fully ready and protects the Friday shipment commitment.', timestamp: '08:41', actionType: 'suggestion'},
  {id: 'MSG-003', role: 'user', text: 'What happens if we don\'t re-sequence?', timestamp: '08:43'},
  {id: 'MSG-004', role: 'agent', text: 'WO-1837 depends on lot M-447 which is short. If it runs first, Line 2 will likely idle waiting for material — an estimated 3–4h delay that spills into Friday sterilization capacity, putting the shipment at risk.', timestamp: '08:43', actionType: 'info'},
  {id: 'MSG-005', role: 'agent', text: 'I can trigger the re-sequence in the scheduling workspace and notify the line supervisor automatically. Say "execute" or click the action below.', timestamp: '08:44', actionType: 'action'},
];

export const aiAgentActionsMock: AiAgentAction[] = [
  {id: 'ACT-001', label: 'Release WO-1861 to production', description: 'Approve and send fully-ready WO-1861 to the scheduling dispatch queue', impact: 'Strengthens plan stability, no risk exposure added', requiresConfirmation: true},
  {id: 'ACT-002', label: 'Escalate shortage M-447', description: 'Open supplier fast-track recovery workflow for resin lot M-447', impact: 'Improves recovery odds for 5 at-risk WOs', requiresConfirmation: true},
  {id: 'ACT-003', label: 'Re-sequence Line 2 (WO-1842 first)', description: 'Move WO-1842 ahead of WO-1837 in the Line 2 dispatch order', impact: 'Protects Friday shipment, reduces sterilizer spillover', requiresConfirmation: true},
];

// ─── Plan vs Actual KPI Mock Data ────────────────────────────────────────────

export const finishedGoodsKpi: PlanVsActualKpi = {
  id: 'finished-goods',
  label: 'Finished Goods',
  unit: 'units',
  planned: 12400,
  actual: 11820,
  plannedDisplay: '12,400 units',
  actualDisplay: '11,820 units',
  higherIsBetter: true,
};

export const scrapRateKpi: PlanVsActualKpi = {
  id: 'scrap-rate',
  label: 'Scrap Rate',
  unit: '%',
  planned: 4,
  actual: 5.2,
  plannedDisplay: '4.0%',
  actualDisplay: '5.2%',
  higherIsBetter: false,
};

export const oeeKpi: PlanVsActualKpi = {
  id: 'oee',
  label: 'OEE',
  unit: '%',
  planned: 85,
  actual: 78,
  plannedDisplay: '85%',
  actualDisplay: '78%',
  higherIsBetter: true,
};

export const avgAgingKpi: PlanVsActualKpi = {
  id: 'avg-aging',
  label: 'Average Aging',
  unit: 'days',
  planned: 4.5,
  actual: 6.2,
  plannedDisplay: '4.5 days',
  actualDisplay: '6.2 days',
  higherIsBetter: false,
};

export const lineCapacityKpi: LineCapacityKpi = {
  id: 'line-capacity',
  label: 'Line Capacity',
  sitePlannedPct: 80,
  siteActualPct: 73,
  lines: [
    {
      lineId: 'line-1',
      lineName: 'Line 1',
      plannedPct: 82,
      actualPct: 79,
      machines: [
        {machineId: 'L1-M1', machineName: 'Fill & Seal Unit', plannedPct: 85, actualPct: 80},
        {machineId: 'L1-M2', machineName: 'Labeler A', plannedPct: 78, actualPct: 76},
      ],
    },
    {
      lineId: 'line-2',
      lineName: 'Line 2',
      plannedPct: 80,
      actualPct: 68,
      machines: [
        {machineId: 'L2-M1', machineName: 'Fill & Seal Unit', plannedPct: 80, actualPct: 62},
        {machineId: 'L2-M2', machineName: 'Conveyor Drive', plannedPct: 80, actualPct: 74},
      ],
    },
    {
      lineId: 'line-3',
      lineName: 'Line 3',
      plannedPct: 78,
      actualPct: 71,
      machines: [
        {machineId: 'L3-M1', machineName: 'Blister Packer', plannedPct: 78, actualPct: 71},
        {machineId: 'L3-M2', machineName: 'Case Erector', plannedPct: 78, actualPct: 73},
      ],
    },
  ],
};

export const wipKpi: WipKpi = {
  id: 'wip',
  label: 'WIP',
  warehouseMaxCapacity: 5000,
  targetStock: 2800,
  actualStock: 3740,
  plannedDisplay: '2,800 units (target)',
  actualDisplay: '3,740 units',
  capacityDisplay: '5,000 units max',
};

// ─── Timeline & Batch Plan vs Actual ─────────────────────────────────────────

export type DailyPlanActual = {
  date: string;
  dayLabel: string;
  dayOffset: -2 | -1 | 0 | 1 | 2;
  isFuture: boolean;
  finishedGoods: {planned: number; actual?: number};
  scrapRatePct: {planned: number; actual?: number};
  oee: {planned: number; actual?: number};
  avgAging: {planned: number; actual?: number};
  lineCapacityPct: {planned: number; actual?: number};
};

export const planVsActualTimeline: DailyPlanActual[] = [
  {
    date: 'May 31',
    dayLabel: 'D-2',
    dayOffset: -2,
    isFuture: false,
    finishedGoods: {planned: 2400, actual: 2310},
    scrapRatePct: {planned: 4, actual: 3.6},
    oee: {planned: 85, actual: 83},
    avgAging: {planned: 4.5, actual: 4.8},
    lineCapacityPct: {planned: 80, actual: 77},
  },
  {
    date: 'Jun 1',
    dayLabel: 'D-1',
    dayOffset: -1,
    isFuture: false,
    finishedGoods: {planned: 2400, actual: 2180},
    scrapRatePct: {planned: 4, actual: 4.7},
    oee: {planned: 85, actual: 79},
    avgAging: {planned: 4.5, actual: 5.4},
    lineCapacityPct: {planned: 80, actual: 74},
  },
  {
    date: 'Jun 2',
    dayLabel: 'Today',
    dayOffset: 0,
    isFuture: false,
    finishedGoods: {planned: 2400, actual: 2280},
    scrapRatePct: {planned: 4, actual: 5.2},
    oee: {planned: 85, actual: 78},
    avgAging: {planned: 4.5, actual: 6.2},
    lineCapacityPct: {planned: 80, actual: 73},
  },
  {
    date: 'Jun 3',
    dayLabel: 'D+1',
    dayOffset: 1,
    isFuture: true,
    finishedGoods: {planned: 2400},
    scrapRatePct: {planned: 4},
    oee: {planned: 85},
    avgAging: {planned: 4.5},
    lineCapacityPct: {planned: 80},
  },
  {
    date: 'Jun 4',
    dayLabel: 'D+2',
    dayOffset: 2,
    isFuture: true,
    finishedGoods: {planned: 2400},
    scrapRatePct: {planned: 4},
    oee: {planned: 85},
    avgAging: {planned: 4.5},
    lineCapacityPct: {planned: 80},
  },
];

export type BatchPlanActual = {
  batchId: string;
  product: string;
  line: string;
  date: string;
  status: 'Completed' | 'In Progress' | 'Planned';
  finishedGoods: {planned: number; actual?: number};
  scrapRatePct: {planned: number; actual?: number};
  oee: {planned: number; actual?: number};
};

export const batchPlanActualMock: BatchPlanActual[] = [
  {batchId: 'BA-2241', product: 'Prod-A', line: 'Line 1', date: 'May 31', status: 'Completed', finishedGoods: {planned: 800, actual: 772}, scrapRatePct: {planned: 4, actual: 3.4}, oee: {planned: 85, actual: 84}},
  {batchId: 'BA-2242', product: 'Prod-B', line: 'Line 2', date: 'May 31', status: 'Completed', finishedGoods: {planned: 750, actual: 690}, scrapRatePct: {planned: 4, actual: 4.9}, oee: {planned: 85, actual: 80}},
  {batchId: 'BA-2243', product: 'Prod-C', line: 'Line 3', date: 'May 31', status: 'Completed', finishedGoods: {planned: 850, actual: 848}, scrapRatePct: {planned: 4, actual: 3.8}, oee: {planned: 85, actual: 83}},
  {batchId: 'BA-2244', product: 'Prod-A', line: 'Line 1', date: 'Jun 1',  status: 'Completed', finishedGoods: {planned: 800, actual: 741}, scrapRatePct: {planned: 4, actual: 5.1}, oee: {planned: 85, actual: 79}},
  {batchId: 'BA-2245', product: 'Prod-B', line: 'Line 2', date: 'Jun 1',  status: 'Completed', finishedGoods: {planned: 750, actual: 730}, scrapRatePct: {planned: 4, actual: 4.3}, oee: {planned: 85, actual: 78}},
  {batchId: 'BA-2246', product: 'Prod-C', line: 'Line 3', date: 'Jun 2',  status: 'In Progress', finishedGoods: {planned: 800, actual: 620}, scrapRatePct: {planned: 4, actual: 5.2}, oee: {planned: 85, actual: 78}},
  {batchId: 'BA-2247', product: 'Prod-A', line: 'Line 1', date: 'Jun 2',  status: 'In Progress', finishedGoods: {planned: 800, actual: 480}, scrapRatePct: {planned: 4, actual: 3.9}, oee: {planned: 85, actual: 81}},
  {batchId: 'BA-2248', product: 'Prod-B', line: 'Line 2', date: 'Jun 3',  status: 'Planned',     finishedGoods: {planned: 750},             scrapRatePct: {planned: 4},             oee: {planned: 85}},
];

// ─── Future Day WO Schedule (D+1 / D+2) ──────────────────────────────────────

export type WoScheduleItem = {
  woId: string;
  product: string;
  line: string;
  plannedStart: string;
  status: 'On Schedule' | 'Delayed' | 'Ahead';
  deltaHours?: number;
  reason?: string;
  materialReady: boolean;
};

export type DayWoSchedule = {
  dayOffset: 1 | 2;
  summary: {onSchedule: number; delayed: number; ahead: number};
  wos: WoScheduleItem[];
};

export const futureWoScheduleMock: DayWoSchedule[] = [
  {
    dayOffset: 1,
    summary: {onSchedule: 8, delayed: 3, ahead: 2},
    wos: [
      {woId: 'WO-1848', product: 'Prod-A', line: 'Line 1', plannedStart: '06:00', status: 'On Schedule', materialReady: true},
      {woId: 'WO-1849', product: 'Prod-B', line: 'Line 2', plannedStart: '06:00', status: 'Delayed', deltaHours: 4, reason: 'Material shortage M-447', materialReady: false},
      {woId: 'WO-1850', product: 'Prod-C', line: 'Line 3', plannedStart: '08:00', status: 'Ahead', deltaHours: 2, reason: 'Early batch release', materialReady: true},
      {woId: 'WO-1851', product: 'Prod-A', line: 'Line 1', plannedStart: '14:00', status: 'Delayed', deltaHours: 6, reason: 'Changeover extension risk', materialReady: true},
      {woId: 'WO-1842', product: 'Prod-B', line: 'Line 2', plannedStart: '10:00', status: 'On Schedule', materialReady: true},
      {woId: 'WO-1852', product: 'Prod-C', line: 'Line 3', plannedStart: '14:00', status: 'Delayed', deltaHours: 3, reason: 'Sterilizer queue backlog', materialReady: true},
    ],
  },
  {
    dayOffset: 2,
    summary: {onSchedule: 7, delayed: 4, ahead: 1},
    wos: [
      {woId: 'WO-1853', product: 'Prod-A', line: 'Line 1', plannedStart: '06:00', status: 'On Schedule', materialReady: true},
      {woId: 'WO-1854', product: 'Prod-B', line: 'Line 2', plannedStart: '06:00', status: 'Delayed', deltaHours: 8, reason: 'M-447 lot clearance pending', materialReady: false},
      {woId: 'WO-1855', product: 'Prod-C', line: 'Line 3', plannedStart: '08:00', status: 'Delayed', deltaHours: 4, reason: 'Sterilizer spillover from D+1', materialReady: true},
      {woId: 'WO-1856', product: 'Prod-A', line: 'Line 2', plannedStart: '12:00', status: 'Ahead', deltaHours: 1, reason: 'Accelerated QA release', materialReady: true},
      {woId: 'WO-1857', product: 'Prod-B', line: 'Line 1', plannedStart: '14:00', status: 'On Schedule', materialReady: true},
      {woId: 'WO-1858', product: 'Prod-C', line: 'Line 3', plannedStart: '16:00', status: 'Delayed', deltaHours: 5, reason: 'Line 3 OEE recovery risk', materialReady: true},
      {woId: 'WO-1859', product: 'Prod-A', line: 'Line 1', plannedStart: '18:00', status: 'Delayed', deltaHours: 3, reason: 'Capacity overcommit risk', materialReady: false},
    ],
  },
];

// ─── Unplanned Maintenance (D-1) ──────────────────────────────────────────────

export type UnplannedMaintenanceEvent = {
  id: string;
  equipment: string;
  line: string;
  detectedAt: string;
  estimatedDuration: string;
  issue: string;
  impact: string;
  status: 'Active' | 'Under Assessment';
};

export const unplannedMaintenanceDm1Mock: UnplannedMaintenanceEvent[] = [
  {
    id: 'UPM-001',
    equipment: 'Line 2 — Conveyor Drive',
    line: 'Line 2',
    detectedAt: '11:42',
    estimatedDuration: '3h',
    issue: 'Vibration anomaly detected — bearing wear suspected',
    impact: 'WO-1845 and WO-1846 dispatch at risk',
    status: 'Under Assessment',
  },
];
