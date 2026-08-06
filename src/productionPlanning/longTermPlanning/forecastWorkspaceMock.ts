export type ForecastHeader = {
  id?: string;
  versionId?: string;
  title: string;
  status: 'Draft';
  horizonMonths: number;
  periodLabel: string;
  siteLabel: string;
  productScopeLabel: string;
  lastRefreshLabel: string;
};

export type LinkedMpsType = 'Scenario' | 'Actual Evaluation';

export type LinkedMps = {
  id: string;
  type: LinkedMpsType;
  name: string;
  status: string;
  period: string;
  site: string;
  lastUpdated: string;
  owner: string;
};

export type ForecastKpi = {
  id: string;
  label: string;
  value: string;
  helper: string;
};

export type DemandCapacityMonth = {
  month: string;
  demandUnits: number;
  requiredCapacityHours: number;
  availableCapacityHours: number;
};

export type CommitmentMonth = {
  month: string;
  forecastDemand: number;
  proposedCommitment: number;
  mainGapReason: string;
  requiredDecision: string;
  commitmentReason: string;
  escalationRequired: boolean;
  plannerComment: string;
};

export type InventoryProjectionMonth = {
  month: string;
  openingInventory: number;
  projectedClosingInventory: number;
  minTarget: number;
  maxTarget: number;
  weeksCoverage: number;
};

export type InventoryFamily = {
  family: string;
  openingInventory: number;
  projectedEndingInventory: number;
  minTarget: number;
  maxTarget: number;
  weeksCoverage: number;
  risk: 'Low' | 'Medium' | 'High';
  recommendedAction: string;
};

export type ConstraintRecord = {
  id: string;
  domain: 'Material Constraints' | 'Quality Constraints' | 'Warehouse / Logistics Constraints' | 'Sterilization Constraints';
  constraint: string;
  impactedPeriod: string;
  impactedVolume: number;
  risk: 'Low' | 'Medium' | 'High';
  owner: string;
  dueDate: string;
  actionStatus: 'Open' | 'In Progress' | 'Mitigated';
  requiredAction: string;
  details: Record<string, string | number>;
};

export type ScenarioDefinition = {
  id: string;
  name: string;
  description: string;
  statusLabel: string;
  overview: string;
  mainDriver: string;
  tradeOff: string;
  keyAssumption: string;
  risk: string;
  expectedImpact: string;
  requiredDecision: string;
  assumptions: {
    overtimeHours: number;
    additionalShifts: number;
    demandShiftPct: number;
    capacityRecoveryFactor: number;
    inventoryTargetWeeks: number;
    buildAheadQuantity: number;
    materialDelayDays: number;
    qualityDelayDays: number;
    sterilizationCapacityFactor: number;
  };
};

export type ScenarioKpiRow = {
  kpi: string;
  baseline: string;
  capacityRecovery: string;
  demandSmoothing: string;
  constrainedCommitment: string;
  qualityDelay: string;
};

export type ApprovalAuditEvent = {
  timestamp: string;
  user: string;
  action: string;
  object: string;
  previousValue: string;
  newValue: string;
  reasonComment: string;
};

export const forecastHeader: ForecastHeader = {
  id: 'FCT-2026-05',
  versionId: 'FCT-2026-05-DRAFT',
  title: 'May-2026',
  status: 'Draft',
  horizonMonths: 12,
  periodLabel: 'Jun-2026 – May-2027',
  siteLabel: 'Tijuana',
  productScopeLabel: 'All Families',
  lastRefreshLabel: '24-May-2026 10:42',
};

export const linkedMpsForForecast: LinkedMps[] = [
  {
    id: 'MPS-2026-05-001',
    type: 'Scenario',
    name: 'Base Case',
    status: 'Approved',
    period: 'Jun-2026 - May-2027',
    site: 'Tijuana',
    lastUpdated: '23-May-2026 14:30',
    owner: 'J. Ramirez',
  },
  {
    id: 'MPS-2026-05-002',
    type: 'Scenario',
    name: 'Capacity Upside',
    status: 'Pending Approval',
    period: 'Jun-2026 - May-2027',
    site: 'Tijuana',
    lastUpdated: '22-May-2026 09:15',
    owner: 'A. Lopez',
  },
  {
    id: 'MPS-2026-05-003',
    type: 'Actual Evaluation',
    name: 'Actual vs Plan - Apr 2026',
    status: 'Draft',
    period: 'Apr-2026',
    site: 'Tijuana',
    lastUpdated: '21-May-2026 16:45',
    owner: 'M. Silva',
  },
];

export const forecastKpis: ForecastKpi[] = [
  {id: 'demand', label: 'Total Demand (12M)', value: '1,245,320 units', helper: '+6.4% vs Apr-2026'},
  {id: 'utilization', label: 'Capacity Utilization Avg.', value: '94%', helper: 'vs 100% available'},
  {id: 'coverage', label: 'Site Commitment Coverage', value: '98%', helper: '1,218,300 / 1,245,320 units'},
  {id: 'inventory', label: 'Inventory Weeks Coverage', value: '4.8 weeks', helper: 'Target: 4–8 weeks'},
  {id: 'risk', label: 'At Risk Months', value: '2', helper: 'Mar-2027, Apr-2027'},
  {id: 'confidence', label: 'Planning Confidence', value: 'High', helper: 'Based on current scenario'},
];

export const monthlyDemandCapacity: DemandCapacityMonth[] = [
  {month: 'Jun-2026', demandUnits: 101200, requiredCapacityHours: 123400, availableCapacityHours: 131200},
  {month: 'Jul-2026', demandUnits: 102600, requiredCapacityHours: 125100, availableCapacityHours: 129600},
  {month: 'Aug-2026', demandUnits: 103800, requiredCapacityHours: 127800, availableCapacityHours: 132400},
  {month: 'Sep-2026', demandUnits: 103800, requiredCapacityHours: 126400, availableCapacityHours: 128600},
  {month: 'Oct-2026', demandUnits: 105500, requiredCapacityHours: 129300, availableCapacityHours: 133200},
  {month: 'Nov-2026', demandUnits: 106900, requiredCapacityHours: 131000, availableCapacityHours: 134400},
  {month: 'Dec-2026', demandUnits: 107700, requiredCapacityHours: 132100, availableCapacityHours: 134000},
  {month: 'Jan-2027', demandUnits: 103600, requiredCapacityHours: 128400, availableCapacityHours: 129000},
  {month: 'Feb-2027', demandUnits: 101700, requiredCapacityHours: 126100, availableCapacityHours: 119500},
  {month: 'Mar-2027', demandUnits: 110600, requiredCapacityHours: 132800, availableCapacityHours: 110400},
  {month: 'Apr-2027', demandUnits: 111300, requiredCapacityHours: 134500, availableCapacityHours: 115400},
  {month: 'May-2027', demandUnits: 107000, requiredCapacityHours: 134000, availableCapacityHours: 132300},
];

export const commitmentByMonth: CommitmentMonth[] = [
  {month: 'Jun-2026', forecastDemand: 101200, proposedCommitment: 101200, mainGapReason: 'None', requiredDecision: 'No action', commitmentReason: 'Baseline aligned', escalationRequired: false, plannerComment: ''},
  {month: 'Jul-2026', forecastDemand: 102600, proposedCommitment: 102600, mainGapReason: 'None', requiredDecision: 'No action', commitmentReason: 'Baseline aligned', escalationRequired: false, plannerComment: ''},
  {month: 'Aug-2026', forecastDemand: 103800, proposedCommitment: 103800, mainGapReason: 'None', requiredDecision: 'No action', commitmentReason: 'Baseline aligned', escalationRequired: false, plannerComment: ''},
  {month: 'Sep-2026', forecastDemand: 103800, proposedCommitment: 103800, mainGapReason: 'None', requiredDecision: 'No action', commitmentReason: 'Baseline aligned', escalationRequired: false, plannerComment: ''},
  {month: 'Oct-2026', forecastDemand: 105500, proposedCommitment: 105500, mainGapReason: 'None', requiredDecision: 'No action', commitmentReason: 'Baseline aligned', escalationRequired: false, plannerComment: ''},
  {month: 'Nov-2026', forecastDemand: 106900, proposedCommitment: 106900, mainGapReason: 'None', requiredDecision: 'No action', commitmentReason: 'Baseline aligned', escalationRequired: false, plannerComment: ''},
  {month: 'Dec-2026', forecastDemand: 107700, proposedCommitment: 107700, mainGapReason: 'None', requiredDecision: 'No action', commitmentReason: 'Baseline aligned', escalationRequired: false, plannerComment: ''},
  {month: 'Jan-2027', forecastDemand: 103600, proposedCommitment: 103600, mainGapReason: 'None', requiredDecision: 'No action', commitmentReason: 'Build-ahead coverage', escalationRequired: false, plannerComment: ''},
  {month: 'Feb-2027', forecastDemand: 101700, proposedCommitment: 100100, mainGapReason: 'Recovery plan not yet approved', requiredDecision: 'Confirm overtime budget', commitmentReason: 'Pre-recovery cap', escalationRequired: true, plannerComment: 'Need finance sign-off for weekend overtime.'},
  {month: 'Mar-2027', forecastDemand: 120450, proposedCommitment: 110400, mainGapReason: 'Capacity overload', requiredDecision: 'Approve recovery capacity', commitmentReason: 'Line 10 bottleneck', escalationRequired: true, plannerComment: 'Overtime and outsourced sterilization under review.'},
  {month: 'Apr-2027', forecastDemand: 122300, proposedCommitment: 115330, mainGapReason: 'Material availability', requiredDecision: 'Confirm supplier recovery', commitmentReason: 'Polymer lot recovery pending', escalationRequired: true, plannerComment: 'Supplier ETA still provisional.'},
  {month: 'May-2027', forecastDemand: 107000, proposedCommitment: 107000, mainGapReason: 'None', requiredDecision: 'No action', commitmentReason: 'Baseline aligned', escalationRequired: false, plannerComment: ''},
];

export const inventoryProjection: InventoryProjectionMonth[] = [
  {month: 'Jun-2026', openingInventory: 55200, projectedClosingInventory: 53800, minTarget: 42000, maxTarget: 88000, weeksCoverage: 5.4},
  {month: 'Jul-2026', openingInventory: 53800, projectedClosingInventory: 52200, minTarget: 42000, maxTarget: 88000, weeksCoverage: 5.2},
  {month: 'Aug-2026', openingInventory: 52200, projectedClosingInventory: 50100, minTarget: 42000, maxTarget: 88000, weeksCoverage: 5.0},
  {month: 'Sep-2026', openingInventory: 50100, projectedClosingInventory: 48600, minTarget: 42000, maxTarget: 88000, weeksCoverage: 4.9},
  {month: 'Oct-2026', openingInventory: 48600, projectedClosingInventory: 47200, minTarget: 42000, maxTarget: 88000, weeksCoverage: 4.7},
  {month: 'Nov-2026', openingInventory: 47200, projectedClosingInventory: 46500, minTarget: 42000, maxTarget: 88000, weeksCoverage: 4.6},
  {month: 'Dec-2026', openingInventory: 46500, projectedClosingInventory: 45800, minTarget: 42000, maxTarget: 88000, weeksCoverage: 4.5},
  {month: 'Jan-2027', openingInventory: 45800, projectedClosingInventory: 45200, minTarget: 42000, maxTarget: 88000, weeksCoverage: 4.4},
  {month: 'Feb-2027', openingInventory: 45200, projectedClosingInventory: 43800, minTarget: 42000, maxTarget: 88000, weeksCoverage: 4.2},
  {month: 'Mar-2027', openingInventory: 43800, projectedClosingInventory: 38800, minTarget: 42000, maxTarget: 88000, weeksCoverage: 3.7},
  {month: 'Apr-2027', openingInventory: 38800, projectedClosingInventory: 37100, minTarget: 42000, maxTarget: 88000, weeksCoverage: 3.5},
  {month: 'May-2027', openingInventory: 37100, projectedClosingInventory: 41800, minTarget: 42000, maxTarget: 88000, weeksCoverage: 3.9},
];

export const inventoryByFamily: InventoryFamily[] = [
  {family: 'Family A', openingInventory: 18800, projectedEndingInventory: 16200, minTarget: 14000, maxTarget: 32000, weeksCoverage: 4.2, risk: 'Medium', recommendedAction: 'Build ahead before shutdown'},
  {family: 'Family B', openingInventory: 14200, projectedEndingInventory: 11900, minTarget: 11000, maxTarget: 26000, weeksCoverage: 3.9, risk: 'High', recommendedAction: 'Smooth demand into earlier period'},
  {family: 'Family C', openingInventory: 12900, projectedEndingInventory: 9800, minTarget: 9500, maxTarget: 22000, weeksCoverage: 3.6, risk: 'Medium', recommendedAction: 'Review safety stock assumption'},
  {family: 'Other', openingInventory: 9300, projectedEndingInventory: 7900, minTarget: 7500, maxTarget: 16000, weeksCoverage: 3.8, risk: 'Low', recommendedAction: 'Reduce overproduction'},
];

export const constraints: ConstraintRecord[] = [
  {
    id: 'mat-01',
    domain: 'Material Constraints',
    constraint: 'Polymer resin lot PR-882 shortage',
    impactedPeriod: 'Apr-2027',
    impactedVolume: 6970,
    risk: 'High',
    owner: 'Mateus Silva',
    dueDate: '2027-03-08',
    actionStatus: 'In Progress',
    requiredAction: 'Confirm supplier recovery and expedite inbound lot.',
    details: {
      criticalMaterial: 'Polymer resin PR-882',
      requiredQuantity: '84,000 kg',
      availableQuantity: '71,500 kg',
      shortageQuantity: '12,500 kg',
      expectedAvailabilityDate: '2027-03-05',
      impactedSkuFamily: 'Family B',
      impactedMonth: 'Apr-2027',
      riskLevel: 'High',
      mitigationAction: 'Expedite alternate supplier and rebalance build-ahead.',
    },
  },
  {
    id: 'qual-01',
    domain: 'Quality Constraints',
    constraint: 'Pending release on family C validation batch',
    impactedPeriod: 'Mar-2027',
    impactedVolume: 4200,
    risk: 'Medium',
    owner: 'Ana Costa',
    dueDate: '2027-02-26',
    actionStatus: 'Open',
    requiredAction: 'Secure deviation approval and release confidence check.',
    details: {
      productFamily: 'Family C',
      qualityStatus: 'Deviation review',
      holdDeviation: 'DV-2417',
      expectedReleaseDate: '2027-02-24',
      releaseConfidence: 'Medium',
      impactedVolume: '4,200 units',
      riskLevel: 'Medium',
      requiredAction: 'Prioritize QA board review.',
    },
  },
  {
    id: 'log-01',
    domain: 'Warehouse / Logistics Constraints',
    constraint: 'Cold-chain staging area near saturation',
    impactedPeriod: 'Mar-2027',
    impactedVolume: 9300,
    risk: 'Medium',
    owner: 'Rafaela Mendes',
    dueDate: '2027-02-28',
    actionStatus: 'Open',
    requiredAction: 'Advance outbound wave plan and confirm overflow zone.',
    details: {
      storageCapacityStatus: '92% utilized',
      stagingReadiness: 'Overflow zone pending',
      logisticsBlockers: 'Weekend outbound staffing gap',
      impactedMonth: 'Mar-2027',
      riskLevel: 'Medium',
      requiredAction: 'Confirm overflow pallet slots and carrier coverage.',
    },
  },
  {
    id: 'ster-01',
    domain: 'Sterilization Constraints',
    constraint: 'ETO chamber slot bottleneck',
    impactedPeriod: 'Mar-2027',
    impactedVolume: 5100,
    risk: 'High',
    owner: 'Joao Martins',
    dueDate: '2027-03-02',
    actionStatus: 'In Progress',
    requiredAction: 'Book external slot and compress dwell-time queue.',
    details: {
      slotAvailability: '3 slots short',
      backlog: '14 batches',
      dwellTimeRisk: 'High',
      impactedBatchFamily: 'Family A / Family B',
      expectedCompletion: '2027-03-04',
      riskLevel: 'High',
      requiredAction: 'Reserve external partner capacity.',
    },
  },
];

export const scenarios: ScenarioDefinition[] = [
  {
    id: 'baseline',
    name: 'Baseline',
    description: 'Current demand and current capacity',
    statusLabel: 'Not feasible',
    overview: 'Shows the unadjusted reforecast against current site capability and source-system assumptions.',
    mainDriver: 'Current demand profile and current finite capacity',
    tradeOff: 'Protects source integrity but leaves peak overload unresolved.',
    keyAssumption: 'No incremental overtime or demand shaping is approved.',
    risk: 'High risk in Mar-2027 and Apr-2027 overload months.',
    expectedImpact: 'Coverage remains below target in constrained months.',
    requiredDecision: 'Choose whether to recover capacity or constrain commitment.',
    assumptions: {
      overtimeHours: 0,
      additionalShifts: 0,
      demandShiftPct: 0,
      capacityRecoveryFactor: 1,
      inventoryTargetWeeks: 4.8,
      buildAheadQuantity: 0,
      materialDelayDays: 0,
      qualityDelayDays: 0,
      sterilizationCapacityFactor: 1,
    },
  },
  {
    id: 'capacity-recovery',
    name: 'Capacity Recovery',
    description: 'Adds overtime / extra shifts in constrained months',
    statusLabel: 'Recommended',
    overview: 'Uses targeted recovery in Feb-Apr to close overload gaps while preserving demand coverage.',
    mainDriver: 'Focused overtime and temporary extra shifts on constrained lines',
    tradeOff: 'Improves coverage with moderate labor and cost pressure.',
    keyAssumption: 'Finance and operations approve recovery measures by February.',
    risk: 'Medium execution risk if labor availability slips.',
    expectedImpact: 'Restores feasible commitment coverage and lifts inventory floor.',
    requiredDecision: 'Approve recovery budget and labor plan.',
    assumptions: {
      overtimeHours: 480,
      additionalShifts: 2,
      demandShiftPct: 0,
      capacityRecoveryFactor: 1.12,
      inventoryTargetWeeks: 5.1,
      buildAheadQuantity: 2400,
      materialDelayDays: 0,
      qualityDelayDays: 0,
      sterilizationCapacityFactor: 1.08,
    },
  },
  {
    id: 'demand-smoothing',
    name: 'Demand Smoothing',
    description: 'Pulls production earlier to protect inventory',
    statusLabel: 'Feasible with risks',
    overview: 'Moves part of the late-quarter load into Jan-Feb and increases build-ahead to protect service.',
    mainDriver: 'Demand pull-forward and inventory buffering',
    tradeOff: 'Improves March feasibility but increases inventory exposure ahead of shutdown.',
    keyAssumption: 'Commercial team accepts pull-forward on selected families.',
    risk: 'Medium risk of excess inventory if demand normalizes late.',
    expectedImpact: 'Balances load earlier and reduces overload months to one.',
    requiredDecision: 'Approve commercial demand smoothing and inventory policy.',
    assumptions: {
      overtimeHours: 120,
      additionalShifts: 1,
      demandShiftPct: 7,
      capacityRecoveryFactor: 1.04,
      inventoryTargetWeeks: 5.4,
      buildAheadQuantity: 6200,
      materialDelayDays: 0,
      qualityDelayDays: 0,
      sterilizationCapacityFactor: 1.02,
    },
  },
  {
    id: 'constrained-commitment',
    name: 'Constrained Commitment',
    description: 'Commits only feasible demand',
    statusLabel: 'Low operational risk',
    overview: 'Limits the site promise to what current assets can reliably produce without recovery actions.',
    mainDriver: 'Commit only feasible demand coverage',
    tradeOff: 'Operationally stable, but service gap stays visible to stakeholders.',
    keyAssumption: 'Commercial and supply chain accept a constrained commitment baseline.',
    risk: 'Low operational risk with clear customer-service tradeoff.',
    expectedImpact: 'Reduces planner fire-fighting but lowers total coverage.',
    requiredDecision: 'Approve customer-facing constrained commitment plan.',
    assumptions: {
      overtimeHours: 0,
      additionalShifts: 0,
      demandShiftPct: 0,
      capacityRecoveryFactor: 1,
      inventoryTargetWeeks: 4.4,
      buildAheadQuantity: 0,
      materialDelayDays: 0,
      qualityDelayDays: 0,
      sterilizationCapacityFactor: 1,
    },
  },
  {
    id: 'quality-delay',
    name: 'Quality Delay',
    description: 'Stress test with delayed release assumptions',
    statusLabel: 'High risk',
    overview: 'Stress-tests the plan with delayed quality release and downstream sterilization constraints.',
    mainDriver: 'Delayed release assumptions and slower downstream capacity',
    tradeOff: 'Tests resilience but increases exposure across commitment and inventory.',
    keyAssumption: 'Quality release slips into the constrained quarter.',
    risk: 'High risk of stockout and late commitment.',
    expectedImpact: 'Triggers deeper inventory erosion and additional at-risk months.',
    requiredDecision: 'Decide whether contingency inventory or external support is required.',
    assumptions: {
      overtimeHours: 0,
      additionalShifts: 0,
      demandShiftPct: 0,
      capacityRecoveryFactor: 0.96,
      inventoryTargetWeeks: 4.2,
      buildAheadQuantity: 0,
      materialDelayDays: 9,
      qualityDelayDays: 12,
      sterilizationCapacityFactor: 0.92,
    },
  },
];

export const approvalAuditEvents: ApprovalAuditEvent[] = [
  {
    timestamp: '24-May-2026 10:42',
    user: 'Maya Planner',
    action: 'Forecast opened',
    object: 'May-2026 Reforecast',
    previousValue: 'Apr-2026 baseline',
    newValue: 'May-2026 draft',
    reasonComment: 'Monthly reforecast workspace initialized.',
  },
  {
    timestamp: '24-May-2026 10:48',
    user: 'Maya Planner',
    action: 'Scenario generated',
    object: 'Capacity Recovery',
    previousValue: 'No active proposal',
    newValue: 'Recommended scenario',
    reasonComment: 'Auto-generated scenario from constraint set.',
  },
  {
    timestamp: '24-May-2026 10:54',
    user: 'Lucas Pereira',
    action: 'Constraint action created',
    object: 'ETO chamber slot bottleneck',
    previousValue: 'No mitigation action',
    newValue: 'External slot request opened',
    reasonComment: 'Escalated to sterilization partner.',
  },
  {
    timestamp: '24-May-2026 11:05',
    user: 'Maya Planner',
    action: 'Commitment edited',
    object: 'Mar-2027 commitment',
    previousValue: '108,800',
    newValue: '110,400',
    reasonComment: 'Aligned with proposed capacity recovery.',
  },
  {
    timestamp: '24-May-2026 11:12',
    user: 'Maya Planner',
    action: 'Scenario modified',
    object: 'Capacity Recovery',
    previousValue: '480 overtime hours',
    newValue: '520 overtime hours',
    reasonComment: 'Planner stress-tested higher recovery case.',
  },
];
