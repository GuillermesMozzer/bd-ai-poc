import type {
  BluAIRecommendation,
  ScenarioAssumption,
  ScenarioAuditEvent,
  ScenarioChange,
  ScenarioException,
  ScenarioImpactSummary,
  ScenarioListItem,
  ScenarioPlan,
  ScenarioPlanningBundle,
  SuggestedAction,
  TopImpactedProduct,
} from './types';
import {
  buildScenarioExceptions,
  buildSuggestedActions,
  calculateScenarioImpactSummary,
  calculateTopImpactedProducts,
  buildPeriodImpacts,
  buildPeriodSummaryRows,
  buildChartData,
  buildBaselineImpactRows,
} from './utils';

export const DEMO_SITE = 'Sandy (San Diego Site)';
export const DEMO_USER = 'Danilo Brooks';
export const CURRENT_USER = 'Maya Planner';

export const LT_PERIODS = [
  'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026',
  'Dec 2026', 'Jan 2027', 'Feb 2027', 'Mar 2027', 'Apr 2027', 'May 2027',
];

export const ST_PERIODS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];

export const PRODUCTS = [
  {code: 'FG-1001', desc: 'Standard Tube A', family: 'Tubes'},
  {code: 'FG-1002', desc: 'Standard Tube B', family: 'Tubes'},
  {code: 'FG-2001', desc: 'Additive Tube', family: 'Tubes'},
  {code: 'FG-3001', desc: 'Gel Product', family: 'Gels'},
  {code: 'FG-4001', desc: 'Specialty Pack', family: 'Specialty'},
  {code: 'FG-5001', desc: 'Low Volume Product', family: 'Specialty'},
];

export const LINES = ['Line 10', 'Line 20', 'Line 30'];

export const LT_BASELINE_PLANS = [
  {id: 'ltp-v2026.05.13', name: 'LTP-v2026.05.13 (Released)', version: 'v2026.05.13'},
  {id: 'ltp-v2026.04.01', name: 'LTP-v2026.04.01 (Superseded)', version: 'v2026.04.01'},
];

export const ST_BASELINE_PLANS = [
  {id: 'mps-2026-06-v1', name: 'June 2026 MPS (Draft)', version: 'MPS-2026-06-v1'},
  {id: 'mps-2026-05-v2', name: 'May 2026 MPS (Released)', version: 'MPS-2026-05-v2'},
];

export const LT_HORIZONS = [
  {id: '12m', label: '12 Months (Jun 2026 - May 2027)'},
  {id: '6m', label: '6 Months (Jun 2026 - Nov 2026)'},
];

export const ST_HORIZONS = [
  {id: '4w', label: '4 Weeks (Jun 2026)'},
  {id: '8w', label: '8 Weeks (Jun-Jul 2026)'},
];

const demoScenarioLT: ScenarioPlan = {
  id: 'scen-lt-001',
  name: 'July Demand Upside +20%',
  type: 'LongTerm',
  site: DEMO_SITE,
  baselinePlanId: 'ltp-v2026.05.13',
  baselinePlanName: 'LTP-v2026.05.13',
  baselinePlanVersion: 'v2026.05.13',
  horizonLabel: '12 Months (Jun 2026 - May 2027)',
  horizonStart: '2026-06-01',
  horizonEnd: '2027-05-31',
  status: 'Simulated',
  createdBy: DEMO_USER,
  createdAt: '10/31/2026 10:02 AM',
  updatedAt: '10/31/2026 10:15 AM',
  lastCalculatedAt: '10/31/2026 10:15 AM',
  description: 'Simulate the impact of a 20% demand upside in July combined with Line 10 downtime and reduced Line 20 capacity.',
};

const demoScenarioST: ScenarioPlan = {
  id: 'scen-st-001',
  name: 'June Short-Term Capacity Test',
  type: 'ShortTerm',
  site: DEMO_SITE,
  baselinePlanId: 'mps-2026-06-v1',
  baselinePlanName: 'June 2026 MPS',
  baselinePlanVersion: 'MPS-2026-06-v1',
  horizonLabel: '4 Weeks (Jun 2026)',
  horizonStart: '2026-06-01',
  horizonEnd: '2026-06-30',
  status: 'Draft',
  createdBy: DEMO_USER,
  createdAt: '10/31/2026 09:00 AM',
  updatedAt: '10/31/2026 09:00 AM',
  lastCalculatedAt: null,
  description: 'Short-term scenario for June 2026 capacity review.',
};

const demoChangesLT: ScenarioChange[] = [
  {
    id: 'chg-001',
    scenarioId: 'scen-lt-001',
    category: 'DemandChange',
    title: 'Demand Increase',
    description: 'Increase requested demand by 20%',
    active: true,
    severity: 'Warning',
    productFamily: 'All Products',
    startPeriod: 'Jul 2026',
    endPeriod: 'Dec 2026',
    valueType: 'Percentage',
    baselineValue: 0,
    scenarioValue: 20,
    deltaValue: 20,
    reason: 'Customer upside request',
  },
  {
    id: 'chg-002',
    scenarioId: 'scen-lt-001',
    category: 'CalendarEvent',
    title: 'Line Downtime',
    description: 'Line 10 unavailable',
    active: true,
    severity: 'Blocker',
    lineId: 'Line 10',
    startPeriod: 'Jul 06',
    endPeriod: 'Jul 10, 2026',
    valueType: 'Days',
    baselineValue: 0,
    scenarioValue: 5,
    deltaValue: -5,
    reason: 'Planned maintenance',
  },
  {
    id: 'chg-003',
    scenarioId: 'scen-lt-001',
    category: 'CapacityChange',
    title: 'Reduced Capacity',
    description: 'Line 20 capacity -15%',
    active: true,
    severity: 'Warning',
    lineId: 'Line 20',
    startPeriod: 'Aug 2026',
    endPeriod: 'Sep 2026',
    valueType: 'Percentage',
    baselineValue: 100,
    scenarioValue: 85,
    deltaValue: -15,
    reason: 'Capacity rebalancing',
  },
];

const demoChangesST: ScenarioChange[] = [
  {
    id: 'chg-st-001',
    scenarioId: 'scen-st-001',
    category: 'DemandChange',
    title: 'Week 3 Demand Spike',
    description: 'FG-1001 demand increased by 15% in Week 3',
    active: true,
    severity: 'Warning',
    productCode: 'FG-1001',
    startPeriod: 'Week 3',
    endPeriod: 'Week 3',
    valueType: 'Percentage',
    baselineValue: 0,
    scenarioValue: 15,
    deltaValue: 15,
    reason: 'Last minute customer order',
  },
];

export function buildDemoLTImpactSummary(): ScenarioImpactSummary {
  return {
    demandChangeUnits: 84000,
    demandChangePercent: 18.6,
    commitmentGapUnits: 38400,
    overloadedPeriods: 3,
    inventoryBelowMinCount: 2,
    mrpReadinessImpact: 'NotReady',
    overallSeverity: 'Blocker',
    capacityHoursDelta: -240,
    uncoveredDemandDelta: 38400,
    affectedProductsCount: 5,
    affectedLinesCount: 2,
  };
}

const demoAssumptions: ScenarioAssumption[] = [
  {id: 'a1', category: 'Demand', label: 'Demand Change Source', value: 'Manual adjustment — customer upside request', editable: false},
  {id: 'a2', category: 'Capacity', label: 'Capacity Basis', value: 'Baseline LTP-v2026.05.13 capacity profiles', editable: false},
  {id: 'a3', category: 'Capacity', label: 'OEE Assumption', value: '82% (same as baseline)', editable: true},
  {id: 'a4', category: 'Inventory', label: 'Inventory Policy', value: 'Min/Max from baseline; no policy change in scenario', editable: false},
  {id: 'a5', category: 'Material', label: 'Material Availability', value: 'Assumed available unless change specifies constraint', editable: false},
  {id: 'a6', category: 'Planning', label: 'Frozen Period Enforced', value: 'Yes — changes outside frozen period only', editable: true},
  {id: 'a7', category: 'Planning', label: 'Lot Size Treatment', value: 'Minimum lot sizes respected from product rules', editable: false},
  {id: 'a8', category: 'Planning', label: 'Calendar Basis', value: '5-day work week, 2 shifts, 8 hrs/shift', editable: true},
];

export const AVAILABLE_SCENARIOS: ScenarioListItem[] = [
  {
    id: 'scen-lt-001',
    name: 'July Demand Upside +20%',
    type: 'LongTerm',
    status: 'Simulated',
    createdBy: 'Maya Planner',
    updatedAt: '5/13/2026 10:15 AM',
    overallSeverity: 'Blocker',
    description: 'Simulate 20% demand upside in July combined with Line 10 downtime and Line 20 reduced capacity.',
    isBluAIRecommended: false,
  },
  {
    id: 'scen-lt-002',
    name: 'Balanced Capacity Reallocation',
    type: 'LongTerm',
    status: 'Simulated',
    createdBy: 'Danilo Brooks',
    updatedAt: '5/12/2026 3:45 PM',
    overallSeverity: 'Info',
    description: 'Reallocates Line 30 capacity to cover Line 10 downtime, fully absorbing demand upside with zero overloaded periods.',
    isBluAIRecommended: true,
  },
  {
    id: 'scen-lt-003',
    name: 'Phased Demand Acceptance',
    type: 'LongTerm',
    status: 'Draft',
    createdBy: 'Maya Planner',
    updatedAt: '5/12/2026 2:10 PM',
    overallSeverity: 'Warning',
    description: 'Accept 10% demand upside in July, defer remaining 10% to Q4 2026 to reduce capacity pressure.',
    isBluAIRecommended: false,
  },
  {
    id: 'scen-lt-004',
    name: 'Q3 Contingency Overtime',
    type: 'LongTerm',
    status: 'Draft',
    createdBy: 'Alex Chen',
    updatedAt: '5/11/2026 11:30 AM',
    overallSeverity: 'Warning',
    description: 'Emergency overtime plan for Q3 to prevent stockouts if the full demand upside materializes.',
    isBluAIRecommended: false,
  },
];

export const BLU_AI_RECOMMENDATION: BluAIRecommendation = {
  recommendedScenarioId: 'scen-lt-002',
  recommendedScenarioName: 'Balanced Capacity Reallocation',
  reasoning: 'After analyzing all 4 scenarios against your demand profile, capacity constraints, and inventory targets, the "Balanced Capacity Reallocation" scenario achieves the optimal balance: it fully covers the +20% demand upside by reallocating underutilized Line 30 capacity, eliminates all overloaded periods, and maintains MRP readiness at 100% — without requiring overtime commitments or demand deferral. This approach carries the lowest operational risk and highest service level preservation across the full 12-month horizon.',
  confidencePercent: 94,
  keyDataPoints: [
    {label: 'Overloaded Periods', value: '0 (vs 3 in baseline)', positive: true},
    {label: 'Demand Coverage', value: '100% (+20% fully absorbed)', positive: true},
    {label: 'MRP Readiness', value: 'Ready across all 12 periods', positive: true},
    {label: 'Inventory Below Min', value: '0 products at risk', positive: true},
    {label: 'Peak Utilization', value: '89% (within safe limit)', positive: true},
    {label: 'Operational Risk', value: 'Low — no overtime required', positive: true},
  ],
};

export const GOOD_RESULTS_SUMMARY: ScenarioImpactSummary = {
  demandChangeUnits: 84000,
  demandChangePercent: 18.6,
  commitmentGapUnits: 0,
  overloadedPeriods: 0,
  inventoryBelowMinCount: 0,
  mrpReadinessImpact: 'Ready',
  overallSeverity: 'Info',
  capacityHoursDelta: 480,
  uncoveredDemandDelta: 0,
  affectedProductsCount: 5,
  affectedLinesCount: 3,
};

function buildInitialAuditEvents(scenarioId: string): ScenarioAuditEvent[] {
  return [
    {
      id: 'ae-001', scenarioId, timestamp: '10/31/2026 10:02 AM', user: DEMO_USER,
      eventType: 'ScenarioLoaded', newValue: 'Scenario loaded from baseline LTP-v2026.05.13',
    },
    {
      id: 'ae-002', scenarioId, timestamp: '10/31/2026 10:04 AM', user: DEMO_USER,
      eventType: 'ChangeAdded', newValue: 'Demand Increase (+20%, Jul–Dec 2026)',
    },
    {
      id: 'ae-003', scenarioId, timestamp: '10/31/2026 10:06 AM', user: DEMO_USER,
      eventType: 'ChangeAdded', newValue: 'Line Downtime (Line 10, Jul 06–10)',
    },
    {
      id: 'ae-004', scenarioId, timestamp: '10/31/2026 10:08 AM', user: DEMO_USER,
      eventType: 'ChangeAdded', newValue: 'Reduced Capacity (Line 20 -15%, Aug–Sep 2026)',
    },
    {
      id: 'ae-005', scenarioId, timestamp: '10/31/2026 10:15 AM', user: DEMO_USER,
      eventType: 'ScenarioSimulated', newValue: 'Status → Simulated',
      comment: 'Initial simulation run with 3 active changes.',
    },
  ];
}

export function createLTDemoBundle(): ScenarioPlanningBundle {
  const scenario = demoScenarioLT;
  const changes = demoChangesLT;
  const impactRows = buildBaselineImpactRows(scenario.id, changes, LT_PERIODS, 'Month');
  const periodSummaryRows = buildPeriodSummaryRows(impactRows, LT_PERIODS, 'Month');
  const impactSummary = calculateScenarioImpactSummary(impactRows, periodSummaryRows);
  const periodImpacts = buildPeriodImpacts(impactRows, LT_PERIODS, 'Month');
  const exceptions = buildScenarioExceptions(scenario.id, impactRows, periodSummaryRows, 'Month');
  const suggestedActions = buildSuggestedActions(scenario.id, exceptions, impactRows);
  const topImpactedProducts = calculateTopImpactedProducts(impactRows);
  const auditEvents = buildInitialAuditEvents(scenario.id);
  const chartData = buildChartData(periodSummaryRows);

  return {
    scenario,
    changes,
    impactRows,
    periodSummaryRows,
    impactSummary,
    periodImpacts,
    exceptions,
    suggestedActions,
    topImpactedProducts,
    auditEvents,
    assumptions: demoAssumptions,
    chartData,
  };
}

export function createSTDemoBundle(): ScenarioPlanningBundle {
  const scenario = demoScenarioST;
  const changes = demoChangesST;
  const impactRows = buildBaselineImpactRows(scenario.id, changes, ST_PERIODS, 'Week');
  const periodSummaryRows = buildPeriodSummaryRows(impactRows, ST_PERIODS, 'Week');
  const impactSummary = calculateScenarioImpactSummary(impactRows, periodSummaryRows);
  const periodImpacts = buildPeriodImpacts(impactRows, ST_PERIODS, 'Week');
  const exceptions = buildScenarioExceptions(scenario.id, impactRows, periodSummaryRows, 'Week');
  const suggestedActions = buildSuggestedActions(scenario.id, exceptions, impactRows);
  const topImpactedProducts = calculateTopImpactedProducts(impactRows);
  const auditEvents = [
    {
      id: 'ae-st-001', scenarioId: scenario.id, timestamp: '10/31/2026 09:00 AM', user: DEMO_USER,
      eventType: 'ScenarioLoaded' as const, newValue: 'Scenario loaded from June 2026 MPS',
    },
  ];
  const chartData = buildChartData(periodSummaryRows);

  return {
    scenario,
    changes,
    impactRows,
    periodSummaryRows,
    impactSummary,
    periodImpacts,
    exceptions,
    suggestedActions,
    topImpactedProducts,
    auditEvents,
    assumptions: demoAssumptions,
    chartData,
  };
}
