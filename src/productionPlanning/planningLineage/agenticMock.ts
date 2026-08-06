import type {AgentCard, AgentConnection, AgenticRecommendation, AgenticViewState, RiskItem, ScenarioComparison} from './types';

const baseAgents: AgentCard[] = [
  {
    id: 'demand-signal',
    name: 'Demand Signal',
    type: 'demand-signal',
    state: 'Completed',
    status: 'No Issue',
    insight: ['Demand B-2026-05', '85,000,000 units', 'Product B | Line 1', 'Market: Americas'],
    confidence: 98,
    lastUpdated: '14:31:02',
    sparkline: [42, 45, 44, 48, 46, 53, 49, 55],
    sourceSignals: ['Forecast baseline FCT-2026-05', 'Customer allocation lock', 'MPS demand bucket'],
    confidenceExplanation: 'Demand signal is stable because forecast variance and allocation changes are low.',
    impactedObjects: ['Demand B', 'MPS-May-2026-B'],
  },
  {
    id: 'production',
    name: 'Production Agent',
    type: 'production',
    state: 'Analyzing',
    status: 'No Issue',
    insight: ['Line 1 available', 'Changeover required', 'Setup: 2.5h'],
    confidence: 92,
    lastUpdated: '14:31:18',
    sparkline: [38, 40, 42, 41, 45, 43, 50, 46],
    sourceSignals: ['Line 1 finite schedule', 'WO-B-001 routing', 'Changeover matrix'],
    confidenceExplanation: 'The agent found a feasible slot after applying setup time and crew calendars.',
    impactedObjects: ['WO-B-001', 'Line 1 schedule'],
  },
  {
    id: 'material',
    name: 'Material & Warehouse Agent',
    type: 'material-warehouse',
    state: 'Analyzing',
    status: 'No Issue',
    insight: ['All materials available', 'No shortages', 'Earliest supply OK', 'Staging available'],
    confidence: 93,
    lastUpdated: '14:31:30',
    sparkline: [46, 47, 50, 49, 55, 51, 58, 57],
    sourceSignals: ['Projected inventory', 'Warehouse staging capacity', 'Open POs'],
    confidenceExplanation: 'All constrained components remain above safety stock in the recommended sequence.',
    impactedObjects: ['RM-441', 'WH-STG-01'],
  },
  {
    id: 'quality',
    name: 'Quality Agent',
    type: 'quality',
    state: 'Analyzing',
    status: 'No Issue',
    insight: ['All batches releasable', 'No holds', 'No open deviations'],
    confidence: 97,
    lastUpdated: '14:31:43',
    sparkline: [50, 49, 53, 48, 55, 49, 52, 56],
    sourceSignals: ['IPC inspection status', 'Deviation register', 'QA hold queue'],
    confidenceExplanation: 'Quality history and open records do not add release risk for this path.',
    impactedObjects: ['IPC-B-001', 'DEV-B-001'],
  },
  {
    id: 'maintenance',
    name: 'Maintenance Agent',
    type: 'maintenance',
    state: 'Monitoring',
    status: 'No Issue',
    insight: ['No maintenance on Line 1', 'Next window:', 'May 24, 06:00 - 14:00'],
    confidence: 95,
    lastUpdated: '14:31:49',
    sparkline: [40, 43, 42, 47, 44, 48, 46, 49],
    sourceSignals: ['PM calendar', 'Open work requests', 'Line 1 maintenance windows'],
    confidenceExplanation: 'No maintenance outage overlaps the recommended production window.',
    impactedObjects: ['Line 1', 'MNT-WIN-0524'],
  },
  {
    id: 'labor',
    name: 'Shift & Labor Agent',
    type: 'shift-labor',
    state: 'Analyzing',
    status: 'No Issue',
    insight: ['Labor available', 'All shifts covered', 'No skill gaps'],
    confidence: 91,
    lastUpdated: '14:31:53',
    sparkline: [35, 39, 36, 44, 40, 43, 42, 46],
    sourceSignals: ['Shift roster', 'Qualification matrix', 'Absence forecast'],
    confidenceExplanation: 'Qualified operators are available across the revised run window.',
    impactedObjects: ['Shift A', 'Shift B'],
  },
  {
    id: 'sterilization',
    name: 'Sterilization Agent',
    type: 'sterilization',
    state: 'Analyzing',
    status: 'No Issue',
    insight: ['Sterilization capacity OK', 'Dwell time within limit', 'No backlog risk'],
    confidence: 89,
    lastUpdated: '14:31:58',
    sparkline: [32, 38, 34, 42, 36, 40, 39, 43],
    sourceSignals: ['EO chamber schedule', 'Dwell queue', 'Load release plan'],
    confidenceExplanation: 'The revised sequence keeps dwell and chamber capacity within control limits.',
    impactedObjects: ['ST-1124', 'STER-B-001'],
  },
  {
    id: 'orchestrator',
    name: 'Planning Orchestrator',
    type: 'orchestrator',
    state: 'Recommendation Ready',
    status: 'Recommendation Ready',
    insight: ['Best plan identified considering all constraints.', 'Re-sequence to optimize capacity and reduce delay risk.'],
    confidence: 87,
    lastUpdated: '14:32:12',
    sparkline: [45, 46, 48, 47, 51, 49, 52, 55],
    sourceSignals: ['Production Agent', 'Material & Warehouse Agent', 'Quality Agent', 'Sterilization Agent'],
    confidenceExplanation: 'Recommendation balances service level, capacity overload, material risk, and changeover count.',
    impactedObjects: ['WO-B-001', 'WO-D-001', 'MPS-May-2026-B'],
  },
];

const recommendationB: AgenticRecommendation = {
  id: 'rec-demand-b-sequence',
  title: 'Re-sequence Demand B by moving WO-B-001 after WO-D-001.',
  description: 'This sequence avoids a capacity bottleneck on Line 1 and reduces risk of delay.',
  impactLevel: 'High Impact',
  confidence: 87,
  mainDriver: 'Capacity bottleneck on Line 1, May 19-20.',
  expectedImpact: {
    serviceLevelDelta: '+2.4%',
    materialRiskDelta: '-18%',
    capacityOverloadDaysDelta: '-1',
    changeoversDelta: '-1',
    sterilizationRiskDelta: '0%',
  },
  impactedObjects: [
    {objectId: 'WO-B-001', objectType: 'WO', action: 'Delay'},
    {objectId: 'WO-D-001', objectType: 'WO', action: 'Pull Forward'},
    {objectId: 'MPS-May-2026-B', objectType: 'MPS', action: 'Update'},
  ],
};

const alternativeB: AgenticRecommendation = {
  ...recommendationB,
  id: 'rec-demand-b-alt',
  title: 'Split WO-B-001 into two Line 1 windows with a protected sterilization handoff.',
  description: 'Alternative keeps Demand B closer to the original date, but requires one extra changeover and tighter shift coverage.',
  impactLevel: 'Medium Impact',
  confidence: 82,
  expectedImpact: {
    serviceLevelDelta: '+1.6%',
    materialRiskDelta: '-10%',
    capacityOverloadDaysDelta: '-1',
    changeoversDelta: '+1',
    sterilizationRiskDelta: '-4%',
  },
  impactedObjects: [
    {objectId: 'WO-B-001', objectType: 'WO', action: 'Split'},
    {objectId: 'ST-1124', objectType: 'Schedule', action: 'Reserve'},
    {objectId: 'MPS-May-2026-B', objectType: 'MPS', action: 'Update'},
  ],
};

const risksB: RiskItem[] = [
  {id: 'risk-b-1', title: 'Capacity overload on Line 1 on 19/May', severity: 'High'},
  {id: 'risk-b-2', title: 'Material shortage for RM-441', severity: 'High'},
  {id: 'risk-b-3', title: 'Sterilization dwell risk for ST-1124', severity: 'Medium'},
  {id: 'risk-b-4', title: 'Maintenance window on Line 2', severity: 'Low'},
];

const scenariosB: ScenarioComparison[] = [
  {id: 'current', scenarioName: 'Current Plan', serviceLevel: '92.1%', materialRisk: 'High', capacityOverloadDays: 4, status: 'Current'},
  {id: 'recommended', scenarioName: 'Recommended Plan (Agentic)', serviceLevel: '94.5%', materialRisk: 'Low', capacityOverloadDays: 3, status: 'Recommended'},
  {id: 'alt-1', scenarioName: 'Alternative 1 - Min Changeovers', serviceLevel: '92.8%', materialRisk: 'Medium', capacityOverloadDays: 4, status: 'Alternative'},
  {id: 'alt-2', scenarioName: 'Alternative 2 - Max Service', serviceLevel: '95.2%', materialRisk: 'Medium', capacityOverloadDays: 5, status: 'Alternative'},
];

const agentConnections: AgentConnection[] = [
  {id: 'demand-production', sourceAgentId: 'demand-signal', targetAgentId: 'production', status: 'active'},
  {id: 'production-material', sourceAgentId: 'production', targetAgentId: 'material', status: 'active'},
  {id: 'material-quality', sourceAgentId: 'material', targetAgentId: 'quality', status: 'active'},
  {id: 'quality-orchestrator', sourceAgentId: 'quality', targetAgentId: 'orchestrator', status: 'active'},
  {id: 'production-maintenance', sourceAgentId: 'production', targetAgentId: 'maintenance', status: 'active'},
  {id: 'production-labor', sourceAgentId: 'production', targetAgentId: 'labor', status: 'active'},
  {id: 'material-sterilization', sourceAgentId: 'material', targetAgentId: 'sterilization', status: 'active'},
  {id: 'maintenance-orchestrator', sourceAgentId: 'maintenance', targetAgentId: 'orchestrator', status: 'active'},
  {id: 'labor-orchestrator', sourceAgentId: 'labor', targetAgentId: 'orchestrator', status: 'active'},
  {id: 'sterilization-orchestrator', sourceAgentId: 'sterilization', targetAgentId: 'orchestrator', status: 'active'},
];

function makeState(
  demandId: string,
  options?: Partial<Pick<AgenticViewState, 'agents' | 'connections' | 'recommendation' | 'alternativeRecommendation' | 'risks' | 'scenarios' | 'lastAnalysisAt'>>
): AgenticViewState {
  const agents = options?.agents ?? baseAgents;
  const demandLabel = demandId.replace('demand-', 'Demand ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  return {
    selectedDemandId: demandId,
    lastAnalysisAt: options?.lastAnalysisAt ?? '02/06/2026 14:32',
    agents,
    connections: options?.connections ?? agentConnections,
    recommendation: options?.recommendation ?? recommendationB,
    alternativeRecommendation: options?.alternativeRecommendation ?? alternativeB,
    risks: options?.risks ?? risksB,
    activity: [
      {id: `${demandId}-a1`, timestamp: '14:32:12', agentName: 'Planning Orchestrator', message: `generated recommendation for ${demandLabel}`},
      {id: `${demandId}-a2`, timestamp: '14:31:58', agentName: 'Sterilization Agent', message: 'confirmed capacity is OK'},
      {id: `${demandId}-a3`, timestamp: '14:31:43', agentName: 'Quality Agent', message: 'confirmed all batches releasable'},
      {id: `${demandId}-a4`, timestamp: '14:31:30', agentName: 'Material Agent', message: 'confirmed no material shortages'},
      {id: `${demandId}-a5`, timestamp: '14:31:18', agentName: 'Production Agent', message: 'validated line availability'},
    ],
    scenarios: options?.scenarios ?? scenariosB,
    beforePlanId: `PLAN-${demandId.toUpperCase()}-CURRENT`,
    afterPlanId: `PLAN-${demandId.toUpperCase()}-AGENTIC`,
  };
}

function withAgentUpdates(updates: Partial<AgentCard>[]): AgentCard[] {
  return baseAgents.map((agent) => ({...agent, ...(updates.find((u) => u.id === agent.id) ?? {})}));
}

export const AGENTIC_VIEW_BY_DEMAND: Record<string, AgenticViewState> = {
  'demand-a': makeState('demand-a', {
    recommendation: {
      ...recommendationB,
      id: 'rec-demand-a-release',
      title: 'Keep Demand A on the approved sequence and protect release windows.',
      description: 'Demand A is stable; the best action is to reserve quality release capacity for the six active work orders.',
      impactLevel: 'Medium Impact',
      confidence: 91,
      mainDriver: 'Shared release queue across WO-A-001 through WO-A-006.',
    },
    risks: [
      {id: 'risk-a-1', title: 'Quality release queue concentration on May 15', severity: 'Medium'},
      {id: 'risk-a-2', title: 'Batch B260513-A03 substitution audit check', severity: 'Medium'},
      {id: 'risk-a-3', title: 'Line 2 capacity buffer below target', severity: 'Low'},
    ],
  }),
  'demand-b': makeState('demand-b'),
  'demand-c': makeState('demand-c', {
    agents: withAgentUpdates([
      {id: 'production', status: 'At Risk', state: 'Warning', confidence: 84, insight: ['Line 3 feasible', 'Capacity overload risk', 'Setup: 3.0h']},
      {id: 'orchestrator', confidence: 83},
    ]),
    recommendation: {
      ...recommendationB,
      id: 'rec-demand-c-capacity',
      title: 'Move Demand C start by one shift to avoid Line 3 overload.',
      description: 'The shift move preserves service level while lowering the immediate overload risk.',
      impactLevel: 'High Impact',
      confidence: 83,
      mainDriver: 'Line 3 load exceeds target on May 21.',
    },
    risks: [
      {id: 'risk-c-1', title: 'Line 3 load exceeds available staffed hours', severity: 'High'},
      {id: 'risk-c-2', title: 'Changeover crew shared with Demand A', severity: 'Medium'},
      {id: 'risk-c-3', title: 'Sterilization dwell buffer below threshold', severity: 'Medium'},
    ],
  }),
  'demand-d': makeState('demand-d', {
    recommendation: {
      ...recommendationB,
      id: 'rec-demand-d-pull-forward',
      title: 'Pull WO-D-001 forward to release Line 1 capacity for Demand B.',
      description: 'Demand D is ready and can be moved forward without material or quality risk.',
      impactLevel: 'Medium Impact',
      confidence: 89,
      mainDriver: 'WO-D-001 has complete readiness and no sterilization dependency.',
    },
    risks: [
      {id: 'risk-d-1', title: 'Operator handoff after pull-forward window', severity: 'Low'},
      {id: 'risk-d-2', title: 'Documentation review capacity on May 17', severity: 'Low'},
    ],
  }),
  'demand-e': makeState('demand-e', {
    agents: withAgentUpdates([
      {id: 'material', status: 'Blocked', state: 'Blocked', confidence: 96, insight: ['RM-441 shortage', 'ETA not confirmed', 'Production release blocked']},
      {id: 'production', status: 'Blocked', state: 'Blocked', confidence: 88, insight: ['Line 4 slot reserved', 'Cannot release WO', 'Awaiting material clear']},
      {id: 'orchestrator', status: 'Blocked', state: 'Blocked', confidence: 78, insight: ['No feasible release until RM-441 is secured.', 'Expedite or substitute material before sequencing.']},
    ]),
    recommendation: {
      ...recommendationB,
      id: 'rec-demand-e-expedite',
      title: 'Expedite RM-441 and hold WO-E-001 until material readiness is restored.',
      description: 'Agent analysis cannot recommend release while the constrained raw material remains unavailable.',
      impactLevel: 'High Impact',
      confidence: 78,
      mainDriver: 'RM-441 shortage blocks WO release.',
      expectedImpact: {
        serviceLevelDelta: '+0.8%',
        materialRiskDelta: '-25%',
        capacityOverloadDaysDelta: '0',
        changeoversDelta: '0',
        sterilizationRiskDelta: '0%',
      },
      impactedObjects: [
        {objectId: 'RM-441', objectType: 'MRP', action: 'Expedite'},
        {objectId: 'WO-E-001', objectType: 'WO', action: 'Hold'},
        {objectId: 'MPS-May-2026-E', objectType: 'MPS', action: 'Update'},
      ],
    },
    risks: [
      {id: 'risk-e-1', title: 'RM-441 shortage has no confirmed ETA', severity: 'Critical'},
      {id: 'risk-e-2', title: 'WO-E-001 release is blocked', severity: 'High'},
      {id: 'risk-e-3', title: 'Downstream schedule dates are stale', severity: 'Medium'},
    ],
  }),
  'demand-f': makeState('demand-f', {
    agents: withAgentUpdates([
      {id: 'demand-signal', state: 'Monitoring', status: 'Warning', confidence: 76, insight: ['Draft demand', 'Pending MPS review', 'June bucket not locked']},
      {id: 'orchestrator', state: 'Warning', status: 'Warning', confidence: 74, insight: ['Recommendation pending final demand lock.', 'Create draft scenario for June capacity.']},
    ]),
    recommendation: {
      ...recommendationB,
      id: 'rec-demand-f-draft',
      title: 'Create a draft June scenario for Demand F before releasing downstream orders.',
      description: 'The demand is not locked yet, so the agent recommends scenario planning instead of release actions.',
      impactLevel: 'Low Impact',
      confidence: 74,
      mainDriver: 'MPS approval is pending for the June demand bucket.',
    },
    risks: [
      {id: 'risk-f-1', title: 'Demand signal is still draft', severity: 'Medium'},
      {id: 'risk-f-2', title: 'June capacity assumptions need approval', severity: 'Low'},
    ],
  }),
};

export const DEFAULT_AGENTIC_DEMAND_ID = 'demand-b';
