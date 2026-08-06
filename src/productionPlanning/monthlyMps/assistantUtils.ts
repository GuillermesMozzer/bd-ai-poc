import type {
  MpsAssistantAuditEvent,
  MpsAssistantAuditEventType,
  MpsAssistantEvidence,
  MpsAssistantFinalReadinessStatus,
  MpsAssistantImpact,
  MpsAssistantRecommendation,
  MpsAssistantScenarioRecord,
  MpsAssistantState,
  MpsAssistantStep,
  MpsBucketLine,
  MpsDemandLine,
  MpsPlan,
} from './types';

type AssistantContext = {
  plan: MpsPlan;
  demandLines: MpsDemandLine[];
  bucketLines: MpsBucketLine[];
  currentUser: string;
  now?: string;
};

type RecommendationMutationResult = {
  steps: MpsAssistantStep[];
  recommendations: MpsAssistantRecommendation[];
  bucketLines: MpsBucketLine[];
  demandLines: MpsDemandLine[];
  evidence: MpsAssistantEvidence[];
  impacts: MpsAssistantImpact[];
  auditEvent: MpsAssistantAuditEvent;
  finalReadinessStatus: MpsAssistantFinalReadinessStatus;
  nextStepId: string;
};

type ScenarioResult = {
  scenario: MpsAssistantScenarioRecord;
  auditEvent: MpsAssistantAuditEvent;
};

const STEP_DEFINITIONS = [
  {
    id: 'step-1',
    sequence: 1,
    title: 'Validate Scope',
    shortTitle: 'Scope',
    category: 'Scope',
    question: 'Are we planning the correct site, period, horizon, and source demand?',
    description: 'Review site, horizon, demand completeness, and missing master data before creating the working MPS.',
    recommendationTitle: 'Resolve missing product-line capability before generating the MPS',
    recommendationText: 'The June 2026 MPS scope is mostly complete. However, 2 products are missing preferred production line data. I recommend resolving product-line capability before generating the MPS.',
    impactSummary: 'Reduces avoidable missing-data blockers later in the workflow.',
    primaryActionLabel: 'Review Missing Data',
    secondaryActionLabel: 'Accept Scope',
  },
  {
    id: 'step-2',
    sequence: 2,
    title: 'Validate Demand & Priority',
    shortTitle: 'Demand',
    category: 'Demand',
    question: 'Which demand should be prioritized?',
    description: 'Compare approved demand, firm orders, product family importance, and unusual spikes.',
    recommendationTitle: 'Prioritize FG-2001 and elevate FG-1001',
    recommendationText: 'FG-1001 has a 22% demand increase versus the previous month. FG-2001 includes firm customer demand and should be prioritized before forecast-only products. I recommend assigning Critical priority to FG-2001 and High priority to FG-1001.',
    impactSummary: 'Improves service protection for firm demand and visible demand spikes.',
    primaryActionLabel: 'Accept Priority Recommendation',
    secondaryActionLabel: 'Edit Priority',
  },
  {
    id: 'step-3',
    sequence: 3,
    title: 'Check Product Rules',
    shortTitle: 'Rules',
    category: 'ProductRules',
    question: 'Can the demand be split into valid production quantities?',
    description: 'Check lot sizing, line eligibility, campaign groups, and shelf-life constraints.',
    recommendationTitle: 'FG-5001 is below minimum lot size',
    recommendationText: 'FG-5001 monthly demand is 18,000 units, but the minimum lot size is 25,000. I recommend either increasing the planned quantity to 25,000 and checking stock impact, or deferring production to the next planning cycle.',
    impactSummary: 'Prevents repeated small batches that violate product planning rules.',
    primaryActionLabel: 'Round to Preferred Lot Size',
    secondaryActionLabel: 'Defer Production',
  },
  {
    id: 'step-4',
    sequence: 4,
    title: 'Propose Production Buckets',
    shortTitle: 'Buckets',
    category: 'BucketPlanning',
    question: 'How should monthly demand be distributed across MPS buckets?',
    description: 'Use due dates, capacity, and inventory guardrails to split the monthly plan into executable weeks.',
    recommendationTitle: 'Split FG-1001 across Weeks 1-3',
    recommendationText: 'I recommend distributing FG-1001 across Weeks 1, 2, and 3: Week 1: 40,000 units; Week 2: 40,000 units; Week 3: 35,000 units. This keeps inventory above minimum and avoids overloading Week 4.',
    impactSummary: 'Improves inventory coverage and balances the front of the month.',
    primaryActionLabel: 'Apply Suggested Split',
    secondaryActionLabel: 'Edit Split',
  },
  {
    id: 'step-5',
    sequence: 5,
    title: 'Assign Production Lines',
    shortTitle: 'Lines',
    category: 'LineAssignment',
    question: 'Which line should produce each product bucket?',
    description: 'Pick eligible lines using rates, current load, and changeover fit.',
    recommendationTitle: 'Move part of FG-2001 from Line 30 to Line 20',
    recommendationText: 'FG-2001 is currently assigned to Line 30, which creates 108% utilization in Week 2. Line 20 is eligible and has 22 available hours. I recommend moving 12,000 units from Line 30 to Line 20.',
    impactSummary: 'Relieves the most constrained line bucket without reducing firm customer coverage.',
    primaryActionLabel: 'Apply Line Assignment',
    secondaryActionLabel: 'View Capacity Impact',
  },
  {
    id: 'step-6',
    sequence: 6,
    title: 'Run Capacity Check',
    shortTitle: 'Capacity',
    category: 'Capacity',
    question: 'Does the MPS fit available line capacity?',
    description: 'Review overloaded or near-capacity line buckets and local alternatives.',
    recommendationTitle: 'Reduce overloaded capacity buckets',
    recommendationText: 'The current MPS creates 3 overloaded buckets: Line 10 Week 2 at 104%, Line 30 Week 3 at 111%, and Line 20 Week 4 at 102%. I recommend moving 15,000 units of FG-1002 from Week 3 to Week 2, adding 16 hours of overtime on Line 30 in Week 3, or reducing FG-5001 commitment by 5,000 units if overtime is not approved.',
    impactSummary: 'Moves the plan toward a release-ready load profile while keeping tradeoffs visible.',
    primaryActionLabel: 'Apply All Recommendations',
    secondaryActionLabel: 'Apply Selected',
  },
  {
    id: 'step-7',
    sequence: 7,
    title: 'Run Inventory Projection',
    shortTitle: 'Inventory',
    category: 'Inventory',
    question: 'Will the MPS keep stock within policy?',
    description: 'Project opening stock, production, and consumption against min/max policy.',
    recommendationTitle: 'Pull FG-3001 forward to Week 2',
    recommendationText: 'FG-3001 falls below minimum stock in Week 3 if production stays in Week 4. I recommend pulling 20,000 units from Week 4 to Week 2. This increases Week 2 utilization on Line 20 from 84% to 91%, still within warning range.',
    impactSummary: 'Improves stock coverage while keeping the impacted line bucket within warning tolerance.',
    primaryActionLabel: 'Apply Pull-Forward',
    secondaryActionLabel: 'View Capacity Impact',
  },
  {
    id: 'step-8',
    sequence: 8,
    title: 'Check Material Risk',
    shortTitle: 'Material',
    category: 'Material',
    question: 'Are there material risks that could make this MPS infeasible?',
    description: 'Review component shortages, open POs, and replenishment timing.',
    recommendationTitle: 'Flag CAP-204 shortage risk for FG-2001',
    recommendationText: 'Component CAP-204 is short by 18,000 units for FG-2001 Week 2. Expected replenishment is Week 3. I recommend moving 10,000 units of FG-2001 from Week 2 to Week 3 or escalating procurement.',
    impactSummary: 'Makes the material exposure explicit before release and reduces late execution surprises.',
    primaryActionLabel: 'Move Production',
    secondaryActionLabel: 'Flag Procurement Risk',
  },
  {
    id: 'step-9',
    sequence: 9,
    title: 'Resolve Exceptions',
    shortTitle: 'Exceptions',
    category: 'Exceptions',
    question: 'What prevents this MPS from being released?',
    description: 'Focus on blockers first, then document or acknowledge the remaining warnings.',
    recommendationTitle: 'Resolve blockers before release',
    recommendationText: 'There are 2 blockers and 5 warnings remaining. Blockers: Line 30 Week 3 utilization is 111%; FG-4001 has no production rate for Line 20. I recommend resolving blockers before release.',
    impactSummary: 'Clears the last release blockers and leaves the planner with visible warnings instead of hidden risk.',
    primaryActionLabel: 'Resolve Blockers',
    secondaryActionLabel: 'Create Scenario',
  },
  {
    id: 'step-10',
    sequence: 10,
    title: 'Final Recommendation',
    shortTitle: 'Release',
    category: 'Release',
    question: 'Is the MPS ready to release?',
    description: 'Summarize allocation, capacity, inventory, materials, and exceptions before the final planner decision.',
    recommendationTitle: 'Release with warnings and monitor material replenishment',
    recommendationText: 'The MPS is ready to release with warnings. Remaining warnings: Line 10 Week 2 utilization is 94%; FG-2001 material replenishment is expected close to production date. I recommend releasing this MPS and monitoring material replenishment daily.',
    impactSummary: 'Captures a release-ready local state while keeping the remaining risk visible.',
    primaryActionLabel: 'Release With Warnings Placeholder',
    secondaryActionLabel: 'Save Draft',
  },
] as const;

function createId(prefix: string, value: string) {
  return `${prefix}-${value}`;
}

function createTimestamp(now?: string) {
  return now ?? new Date().toISOString();
}

function getNextStepId(steps: MpsAssistantStep[], stepId: string) {
  const index = steps.findIndex((step) => step.id === stepId);
  return steps[Math.min(index + 1, steps.length - 1)]?.id ?? stepId;
}

function cloneSteps(steps: MpsAssistantStep[]) {
  return steps.map((step) => ({...step}));
}

function cloneRecommendations(recommendations: MpsAssistantRecommendation[]) {
  return recommendations.map((recommendation) => ({...recommendation}));
}

function cloneBucketLines(bucketLines: MpsBucketLine[]) {
  return bucketLines.map((line) => ({...line}));
}

function cloneDemandLines(demandLines: MpsDemandLine[]) {
  return demandLines.map((line) => ({...line}));
}

function setStepStatus(steps: MpsAssistantStep[], stepId: string, status: MpsAssistantStep['status'], now: string) {
  return steps.map((step) => step.id === stepId ? {...step, status, updatedAt: now} : step);
}

function setRecommendationStatus(recommendations: MpsAssistantRecommendation[], stepId: string, status: MpsAssistantRecommendation['status']) {
  return recommendations.map((recommendation) => recommendation.stepId === stepId ? {...recommendation, status} : recommendation);
}

function updateBucket(
  bucketLines: MpsBucketLine[],
  productCode: string,
  bucketLabel: string,
  patch: Partial<MpsBucketLine>,
) {
  return bucketLines.map((line) =>
    line.productCode === productCode && line.bucketLabel === bucketLabel
      ? {...line, ...patch}
      : line,
  );
}

function updateDemand(
  demandLines: MpsDemandLine[],
  productCode: string,
  patch: Partial<MpsDemandLine>,
) {
  return demandLines.map((line) => line.productCode === productCode ? {...line, ...patch} : line);
}

function buildStaticEvidence(stepId: string): MpsAssistantEvidence[] {
  const map: Record<string, MpsAssistantEvidence[]> = {
    'step-1': [
      {id: createId('evidence', 'step-1-site'), stepId, label: 'Site', value: 'Plymouth', status: 'OK', details: 'Site and planning horizon are selected.'},
      {id: createId('evidence', 'step-1-ltp'), stepId, label: 'Source LTP', value: 'LTP-v2026.05.13', status: 'OK', details: 'Approved long-term plan is available.'},
      {id: createId('evidence', 'step-1-line-data'), stepId, label: 'Missing preferred line data', value: '2 products', status: 'Warning', details: 'FG-4001 and FG-5001 are missing preferred line or rate support for the guided MPS flow.'},
    ],
    'step-2': [
      {id: createId('evidence', 'step-2-fg1001'), stepId, label: 'FG-1001 demand change', value: '+22%', status: 'Warning', details: 'Demand is up versus the previous month.'},
      {id: createId('evidence', 'step-2-fg2001'), stepId, label: 'FG-2001 demand type', value: 'Firm customer demand', status: 'OK', details: 'Firm demand should be protected before forecast-only products.'},
    ],
    'step-3': [
      {id: createId('evidence', 'step-3-fg5001'), stepId, label: 'FG-5001 monthly demand', value: '18,000 units', status: 'Warning', details: 'Below the 25,000 unit minimum lot size.'},
      {id: createId('evidence', 'step-3-lot'), stepId, label: 'Minimum lot size', value: '25,000 units', status: 'Info', details: 'Preferred lot size rule would round the batch up.'},
    ],
    'step-4': [
      {id: createId('evidence', 'step-4-fg1001'), stepId, label: 'FG-1001 monthly plan', value: '115,000 units', status: 'Info', details: 'Guided split protects early-month coverage.'},
      {id: createId('evidence', 'step-4-week4'), stepId, label: 'Week 4 concentration', value: 'High load concentration', status: 'Warning', details: 'Leaving too much FG-1001 in Week 4 increases stock and capacity risk.'},
    ],
    'step-5': [
      {id: createId('evidence', 'step-5-line30'), stepId, label: 'Line 30 Week 2 load', value: '108%', status: 'Blocker', details: 'Current FG-2001 placement overloads Line 30.'},
      {id: createId('evidence', 'step-5-line20'), stepId, label: 'Line 20 availability', value: '22 hours available', status: 'OK', details: 'Line 20 can absorb the moved volume.'},
    ],
    'step-6': [
      {id: createId('evidence', 'step-6-overloads'), stepId, label: 'Overloaded buckets', value: '3 buckets', status: 'Blocker', details: 'Line 10 Week 2, Line 30 Week 3, and Line 20 Week 4 exceed capacity.'},
      {id: createId('evidence', 'step-6-option'), stepId, label: 'Recommended actions', value: 'Move, overtime, or trim', status: 'Info', details: 'The assistant keeps alternatives visible for planner approval.'},
    ],
    'step-7': [
      {id: createId('evidence', 'step-7-fg3001'), stepId, label: 'FG-3001 stock outlook', value: 'Below minimum in Week 3', status: 'Warning', details: 'Keeping production in Week 4 leaves a policy breach in Week 3.'},
      {id: createId('evidence', 'step-7-line20'), stepId, label: 'Line 20 Week 2 impact', value: '84% to 91%', status: 'Info', details: 'Still within warning range after the pull-forward.'},
    ],
    'step-8': [
      {id: createId('evidence', 'step-8-cap204'), stepId, label: 'CAP-204 shortage', value: '18,000 units', status: 'Blocker', details: 'Replenishment is expected in Week 3, after the Week 2 need date.'},
      {id: createId('evidence', 'step-8-replenishment'), stepId, label: 'Expected replenishment', value: 'Week 3', status: 'Info', details: 'The assistant recommends moving part of the requirement or escalating procurement.'},
    ],
    'step-9': [
      {id: createId('evidence', 'step-9-blockers'), stepId, label: 'Open blockers', value: '2 blockers', status: 'Blocker', details: 'Line 30 Week 3 overload and FG-4001 missing production rate remain open.'},
      {id: createId('evidence', 'step-9-warnings'), stepId, label: 'Open warnings', value: '5 warnings', status: 'Warning', details: 'Warnings can remain visible after blockers are closed.'},
    ],
    'step-10': [
      {id: createId('evidence', 'step-10-readiness'), stepId, label: 'Readiness outcome', value: 'Ready with warnings', status: 'Warning', details: 'Material timing and one high-utilization bucket still require monitoring.'},
      {id: createId('evidence', 'step-10-release'), stepId, label: 'Release action', value: 'Local placeholder only', status: 'Info', details: 'No real MPS release integration is executed.'},
    ],
  };

  return map[stepId] ?? [];
}

function buildStaticImpact(stepId: string): MpsAssistantImpact[] {
  const map: Record<string, MpsAssistantImpact[]> = {
    'step-1': [
      {id: createId('impact', 'step-1-data'), stepId, metric: 'Missing data blockers', beforeValue: '2', afterValue: '1', deltaValue: '-1', unit: 'products', status: 'Positive'},
    ],
    'step-2': [
      {id: createId('impact', 'step-2-priority'), stepId, metric: 'Critical priorities', beforeValue: '0', afterValue: '1', deltaValue: '+1', unit: 'products', status: 'Positive'},
    ],
    'step-3': [
      {id: createId('impact', 'step-3-lot'), stepId, metric: 'Below-lot warnings', beforeValue: '1', afterValue: '0', deltaValue: '-1', unit: 'warnings', status: 'Positive'},
    ],
    'step-4': [
      {id: createId('impact', 'step-4-stock'), stepId, metric: 'Week 4 overload exposure', beforeValue: 'High', afterValue: 'Reduced', deltaValue: 'Improved', unit: '', status: 'Positive'},
    ],
    'step-5': [
      {id: createId('impact', 'step-5-line30'), stepId, metric: 'Line 30 Week 2 utilization', beforeValue: '108', afterValue: '94', deltaValue: '-14', unit: '%', status: 'Positive'},
      {id: createId('impact', 'step-5-line20'), stepId, metric: 'Line 20 Week 2 utilization', beforeValue: '73', afterValue: '87', deltaValue: '+14', unit: '%', status: 'Neutral'},
    ],
    'step-6': [
      {id: createId('impact', 'step-6-overloads'), stepId, metric: 'Overloaded buckets', beforeValue: '3', afterValue: '1', deltaValue: '-2', unit: 'buckets', status: 'Positive'},
    ],
    'step-7': [
      {id: createId('impact', 'step-7-stock'), stepId, metric: 'FG-3001 minimum stock breaches', beforeValue: '1', afterValue: '0', deltaValue: '-1', unit: 'breaches', status: 'Positive'},
      {id: createId('impact', 'step-7-capacity'), stepId, metric: 'Line 20 Week 2 utilization', beforeValue: '84', afterValue: '91', deltaValue: '+7', unit: '%', status: 'Neutral'},
    ],
    'step-8': [
      {id: createId('impact', 'step-8-material'), stepId, metric: 'CAP-204 shortage exposure', beforeValue: '18,000', afterValue: '8,000', deltaValue: '-10,000', unit: 'units', status: 'Positive'},
    ],
    'step-9': [
      {id: createId('impact', 'step-9-blockers'), stepId, metric: 'Open blockers', beforeValue: '2', afterValue: '0', deltaValue: '-2', unit: 'blockers', status: 'Positive'},
      {id: createId('impact', 'step-9-warnings'), stepId, metric: 'Open warnings', beforeValue: '5', afterValue: '2', deltaValue: '-3', unit: 'warnings', status: 'Positive'},
    ],
    'step-10': [
      {id: createId('impact', 'step-10-readiness'), stepId, metric: 'Final readiness', beforeValue: 'NotReady', afterValue: 'ReadyWithWarnings', deltaValue: 'Improved', unit: '', status: 'Positive'},
    ],
  };

  return map[stepId] ?? [];
}

export function buildStepEvidence(stepId: string) {
  return buildStaticEvidence(stepId);
}

export function buildStepImpact(stepId: string) {
  return buildStaticImpact(stepId);
}

export function initializeMpsAssistantSteps(context: AssistantContext): MpsAssistantState {
  const now = createTimestamp(context.now);
  const steps: MpsAssistantStep[] = STEP_DEFINITIONS.map((step, index) => ({
    ...step,
    status: index === 0 ? 'InProgress' : 'Pending',
    evidence: buildStaticEvidence(step.id).map((item) => item.id),
    updatedAt: now,
  }));

  const recommendations: MpsAssistantRecommendation[] = STEP_DEFINITIONS.map((step) => ({
    id: createId('recommendation', step.id),
    stepId: step.id,
    title: step.recommendationTitle,
    description: step.recommendationText,
    severity: step.id === 'step-5' || step.id === 'step-6' || step.id === 'step-8' || step.id === 'step-9' ? 'Blocker' : step.id === 'step-1' || step.id === 'step-3' || step.id === 'step-7' || step.id === 'step-10' ? 'Warning' : 'Info',
    confidence: step.id === 'step-1' || step.id === 'step-9' ? 'Medium' : 'High',
    affectedProducts:
      step.id === 'step-2' ? ['FG-1001', 'FG-2001']
      : step.id === 'step-3' ? ['FG-5001']
      : step.id === 'step-4' ? ['FG-1001']
      : step.id === 'step-5' || step.id === 'step-8' ? ['FG-2001']
      : step.id === 'step-6' ? ['FG-1002', 'FG-5001']
      : step.id === 'step-7' ? ['FG-3001']
      : step.id === 'step-9' ? ['FG-4001']
      : [],
    affectedLines:
      step.id === 'step-5' ? ['Line 30', 'Line 20']
      : step.id === 'step-6' ? ['Line 10', 'Line 20', 'Line 30']
      : step.id === 'step-7' ? ['Line 20']
      : [],
    affectedBuckets:
      step.id === 'step-4' ? ['Week 1', 'Week 2', 'Week 3']
      : step.id === 'step-5' || step.id === 'step-8' ? ['Week 2']
      : step.id === 'step-6' ? ['Week 2', 'Week 3', 'Week 4']
      : step.id === 'step-7' ? ['Week 2', 'Week 4']
      : [],
    beforeValue: buildStaticImpact(step.id)[0]?.beforeValue ?? 'Current state',
    afterValue: buildStaticImpact(step.id)[0]?.afterValue ?? 'Recommended state',
    expectedImpact: step.impactSummary,
    canApply: true,
    requiresComment: step.id === 'step-8' || step.id === 'step-9' || step.id === 'step-10',
    status: 'Proposed',
  }));

  const evidence = STEP_DEFINITIONS.flatMap((step) => buildStaticEvidence(step.id));
  const impacts = STEP_DEFINITIONS.flatMap((step) => buildStaticImpact(step.id));

  return {
    activeStepId: 'step-1',
    steps,
    recommendations,
    evidence,
    impacts,
    auditEvents: [],
    scenarios: [],
    isAssistantOpen: true,
    lastRunAt: now,
    finalReadinessStatus: 'Blocked',
  };
}

export function calculateAssistantProgress(steps: MpsAssistantStep[]) {
  const completed = steps.filter((step) => step.status === 'Complete' || step.status === 'Warning').length;
  const skipped = steps.filter((step) => step.status === 'Skipped').length;
  return {
    completed,
    skipped,
    total: steps.length,
    label: `${completed} of ${steps.length} steps complete`,
  };
}

export function getActiveStepRecommendation(
  stepId: string,
  recommendations: MpsAssistantRecommendation[],
) {
  return recommendations.find((recommendation) => recommendation.stepId === stepId) ?? null;
}

export function createMpsAssistantAuditEvent(params: {
  stepId: string;
  user: string;
  eventType: MpsAssistantAuditEventType;
  previousValue?: string;
  newValue?: string;
  comment?: string;
  now?: string;
}): MpsAssistantAuditEvent {
  return {
    id: createId('assistant-audit', `${params.stepId}-${Math.random().toString(36).slice(2, 8)}`),
    timestamp: createTimestamp(params.now),
    user: params.user,
    stepId: params.stepId,
    eventType: params.eventType,
    previousValue: params.previousValue,
    newValue: params.newValue,
    comment: params.comment,
  };
}

export function simulatePriorityRecommendation(demandLines: MpsDemandLine[]) {
  let updated = cloneDemandLines(demandLines);
  updated = updateDemand(updated, 'FG-2001', {priority: 'Critical', riskLevel: 'High'});
  updated = updateDemand(updated, 'FG-1001', {priority: 'High', riskLevel: 'Medium'});
  return updated;
}

export function simulateBucketSplitRecommendation(bucketLines: MpsBucketLine[]) {
  let updated = cloneBucketLines(bucketLines);
  updated = updateBucket(updated, 'FG-1001', 'Week 1', {plannedQuantity: 40000, isEdited: true, plannerComment: 'Assistant split for early-month coverage.'});
  updated = updateBucket(updated, 'FG-1001', 'Week 2', {plannedQuantity: 40000, isEdited: true, plannerComment: 'Assistant split for early-month coverage.'});
  updated = updateBucket(updated, 'FG-1001', 'Week 3', {plannedQuantity: 35000, isEdited: true, plannerComment: 'Assistant split for early-month coverage.'});
  updated = updateBucket(updated, 'FG-1001', 'Week 4', {plannedQuantity: 0, isEdited: true, plannerComment: 'Assistant moved FG-1001 earlier in the month.'});
  return updated;
}

export function simulateLineAssignmentRecommendation(bucketLines: MpsBucketLine[]) {
  let updated = cloneBucketLines(bucketLines);
  updated = updateBucket(updated, 'FG-2001', 'Week 2', {
    assignedLineId: 'line-20',
    isEdited: true,
    plannerComment: 'Assistant moved Week 2 volume from Line 30 to Line 20.',
  });
  return updated;
}

export function simulateCapacityRecommendation(bucketLines: MpsBucketLine[]) {
  let updated = cloneBucketLines(bucketLines);
  updated = updateBucket(updated, 'FG-1002', 'Week 3', {plannedQuantity: 0, isEdited: true, plannerComment: 'Assistant moved volume out of Week 3 to reduce overload.'});
  updated = updateBucket(updated, 'FG-1002', 'Week 2', {plannedQuantity: 15000, isEdited: true, plannerComment: 'Assistant added Week 2 capacity load balancing volume.'});
  updated = updateBucket(updated, 'FG-5001', 'Week 4', {plannedQuantity: 13000, isEdited: true, plannerComment: 'Assistant trimmed commitment to reduce overload.'});
  return updated;
}

export function simulateInventoryRecommendation(bucketLines: MpsBucketLine[]) {
  let updated = cloneBucketLines(bucketLines);
  updated = updateBucket(updated, 'FG-3001', 'Week 2', {
    plannedQuantity: 20000,
    projectedEndingStock: 18000,
    isEdited: true,
    plannerComment: 'Assistant pulled production forward to protect minimum stock.',
  });
  updated = updateBucket(updated, 'FG-3001', 'Week 4', {
    plannedQuantity: 0,
    projectedEndingStock: 9000,
    isEdited: true,
    plannerComment: 'Assistant moved Week 4 production to Week 2.',
  });
  return updated;
}

export function simulateMaterialRiskRecommendation(bucketLines: MpsBucketLine[]) {
  let updated = cloneBucketLines(bucketLines);
  updated = updateBucket(updated, 'FG-2001', 'Week 2', {
    status: 'RequiresDecision',
    constraintReason: 'CAP-204 shortage risk acknowledged. Local monitoring required.',
    plannerComment: 'Assistant flagged CAP-204 shortage and moved part of the risk to Week 3.',
    isEdited: true,
  });
  updated = updateBucket(updated, 'FG-2001', 'Week 3', {
    status: 'AtRisk',
    plannerComment: 'Assistant shifted residual material risk to Week 3 replenishment.',
    isEdited: true,
  });
  return updated;
}

export function simulateExceptionResolution(bucketLines: MpsBucketLine[]) {
  let updated = cloneBucketLines(bucketLines);
  updated = updateBucket(updated, 'FG-4001', 'Week 2', {
    availableHours: 96,
    requiredHours: 82,
    utilizationPercent: 85,
    status: 'RequiresDecision',
    constraintReason: 'Master data fix requested locally for production rate.',
    plannerComment: 'Assistant resolved release blocker with local placeholder data fix.',
    isEdited: true,
  });
  updated = updateBucket(updated, 'FG-2001', 'Week 3', {
    utilizationPercent: 94,
    status: 'AtRisk',
    isEdited: true,
  });
  return updated;
}

export function simulateFinalRecommendation(
  steps: MpsAssistantStep[],
  skippedStepIds: string[] = [],
) {
  return calculateFinalMpsReadiness(steps, skippedStepIds);
}

export function calculateFinalMpsReadiness(
  steps: MpsAssistantStep[],
  skippedStepIds: string[] = [],
): MpsAssistantFinalReadinessStatus {
  if (skippedStepIds.includes('step-5') || skippedStepIds.includes('step-6') || skippedStepIds.includes('step-9')) {
    return 'Blocked';
  }

  const hasBlocked = steps.some((step) => step.status === 'Blocked');
  if (hasBlocked) return 'Blocked';

  const mustComplete = ['step-1', 'step-2', 'step-3', 'step-4', 'step-5', 'step-6', 'step-7', 'step-8', 'step-9'];
  const incompleteRequired = steps.some((step) => mustComplete.includes(step.id) && step.status === 'Pending');
  if (incompleteRequired) return 'NotReady';

  const hasWarnings = steps.some((step) => step.status === 'Warning' || step.status === 'Skipped');
  return hasWarnings ? 'ReadyWithWarnings' : 'ReadyForRelease';
}

export function applyMpsAssistantRecommendation(
  state: MpsAssistantState,
  demandLines: MpsDemandLine[],
  bucketLines: MpsBucketLine[],
  stepId: string,
  currentUser: string,
): RecommendationMutationResult {
  const now = createTimestamp();
  let nextBucketLines = cloneBucketLines(bucketLines);
  let nextDemandLines = cloneDemandLines(demandLines);
  let nextSteps = cloneSteps(state.steps);
  let nextRecommendations = cloneRecommendations(state.recommendations);

  if (stepId === 'step-2') {
    nextDemandLines = simulatePriorityRecommendation(nextDemandLines);
  }
  if (stepId === 'step-4') {
    nextBucketLines = simulateBucketSplitRecommendation(nextBucketLines);
  }
  if (stepId === 'step-5') {
    nextBucketLines = simulateLineAssignmentRecommendation(nextBucketLines);
  }
  if (stepId === 'step-6') {
    nextBucketLines = simulateCapacityRecommendation(nextBucketLines);
  }
  if (stepId === 'step-7') {
    nextBucketLines = simulateInventoryRecommendation(nextBucketLines);
  }
  if (stepId === 'step-8') {
    nextBucketLines = simulateMaterialRiskRecommendation(nextBucketLines);
  }
  if (stepId === 'step-9') {
    nextBucketLines = simulateExceptionResolution(nextBucketLines);
  }

  const statusByStep: Record<string, MpsAssistantStep['status']> = {
    'step-1': 'Warning',
    'step-2': 'Complete',
    'step-3': 'Warning',
    'step-4': 'Complete',
    'step-5': 'Complete',
    'step-6': 'Warning',
    'step-7': 'Complete',
    'step-8': 'Warning',
    'step-9': 'Warning',
    'step-10': 'Warning',
  };

  nextSteps = setStepStatus(nextSteps, stepId, statusByStep[stepId] ?? 'Complete', now);
  nextRecommendations = setRecommendationStatus(nextRecommendations, stepId, 'Applied');

  const nextStepId = getNextStepId(nextSteps, stepId);
  nextSteps = nextSteps.map((step) =>
    step.id === nextStepId && step.status === 'Pending'
      ? {...step, status: 'InProgress', updatedAt: now}
      : step,
  );

  const skipped = nextSteps.filter((step) => step.status === 'Skipped').map((step) => step.id);
  const finalReadinessStatus = stepId === 'step-10'
    ? simulateFinalRecommendation(nextSteps, skipped)
    : calculateFinalMpsReadiness(nextSteps, skipped);

  return {
    steps: nextSteps,
    recommendations: nextRecommendations,
    bucketLines: nextBucketLines,
    demandLines: nextDemandLines,
    evidence: state.evidence,
    impacts: state.impacts,
    auditEvent: createMpsAssistantAuditEvent({
      stepId,
      user: currentUser,
      eventType: stepId === 'step-10' ? 'FinalRecommendationGenerated' : 'RecommendationApplied',
      previousValue: 'Proposed',
      newValue: 'Applied',
      now,
    }),
    finalReadinessStatus,
    nextStepId,
  };
}

export function skipMpsAssistantStep(
  state: MpsAssistantState,
  stepId: string,
  currentUser: string,
) {
  const now = createTimestamp();
  let nextSteps = setStepStatus(state.steps, stepId, 'Skipped', now);
  const nextRecommendations = setRecommendationStatus(state.recommendations, stepId, 'Skipped');
  const nextStepId = getNextStepId(nextSteps, stepId);
  nextSteps = nextSteps.map((step) =>
    step.id === nextStepId && step.status === 'Pending'
      ? {...step, status: 'InProgress', updatedAt: now}
      : step,
  );

  const skipped = nextSteps.filter((step) => step.status === 'Skipped').map((step) => step.id);
  return {
    steps: nextSteps,
    recommendations: nextRecommendations,
    auditEvent: createMpsAssistantAuditEvent({
      stepId,
      user: currentUser,
      eventType: 'RecommendationSkipped',
      previousValue: 'Proposed',
      newValue: 'Skipped',
      now,
    }),
    finalReadinessStatus: calculateFinalMpsReadiness(nextSteps, skipped),
    nextStepId,
  };
}

export function acknowledgeMpsAssistantRisk(
  state: MpsAssistantState,
  stepId: string,
  currentUser: string,
  comment: string,
) {
  const recommendation = getActiveStepRecommendation(stepId, state.recommendations);
  if (!recommendation) {
    throw new Error(`No recommendation found for ${stepId}.`);
  }
  if ((recommendation.severity === 'Warning' || recommendation.severity === 'Blocker') && !comment.trim()) {
    throw new Error('A comment is required to acknowledge warning or blocker risk.');
  }

  const now = createTimestamp();
  const nextRecommendations = setRecommendationStatus(state.recommendations, stepId, 'Acknowledged');
  const nextSteps = setStepStatus(state.steps, stepId, 'Warning', now);
  const skipped = nextSteps.filter((step) => step.status === 'Skipped').map((step) => step.id);

  return {
    steps: nextSteps,
    recommendations: nextRecommendations,
    auditEvent: createMpsAssistantAuditEvent({
      stepId,
      user: currentUser,
      eventType: 'RiskAcknowledged',
      previousValue: recommendation.status,
      newValue: 'Acknowledged',
      comment,
      now,
    }),
    finalReadinessStatus: calculateFinalMpsReadiness(nextSteps, skipped),
  };
}

export function approveRecommendation(
  state: MpsAssistantState,
  demandLines: MpsDemandLine[],
  bucketLines: MpsBucketLine[],
  stepId: string,
  currentUser: string,
): RecommendationMutationResult {
  const result = applyMpsAssistantRecommendation(state, demandLines, bucketLines, stepId, currentUser);
  const now = createTimestamp();
  return {
    ...result,
    recommendations: result.recommendations.map((r) =>
      r.stepId === stepId ? {...r, approvedBy: currentUser, approvedAt: now} : r,
    ),
    auditEvent: createMpsAssistantAuditEvent({
      stepId,
      user: currentUser,
      eventType: 'RecommendationApproved',
      previousValue: 'Proposed',
      newValue: 'Applied',
      now,
    }),
  };
}

export function rejectRecommendation(
  state: MpsAssistantState,
  stepId: string,
  reason: string,
  currentUser: string,
): {
  steps: MpsAssistantStep[];
  recommendations: MpsAssistantRecommendation[];
  auditEvent: MpsAssistantAuditEvent;
  finalReadinessStatus: MpsAssistantFinalReadinessStatus;
} {
  const now = createTimestamp();
  const nextRecommendations = state.recommendations.map((r) =>
    r.stepId === stepId
      ? {...r, status: 'Rejected' as const, rejectedBy: currentUser, rejectedAt: now, rejectionReason: reason}
      : r,
  );
  const skipped = state.steps.filter((s) => s.status === 'Skipped').map((s) => s.id);
  return {
    steps: state.steps,
    recommendations: nextRecommendations,
    auditEvent: createMpsAssistantAuditEvent({
      stepId,
      user: currentUser,
      eventType: 'RecommendationRejected',
      previousValue: 'Proposed',
      newValue: 'Rejected',
      comment: reason,
      now,
    }),
    finalReadinessStatus: calculateFinalMpsReadiness(state.steps, skipped),
  };
}

export function approveAllRecommendations(
  state: MpsAssistantState,
  demandLines: MpsDemandLine[],
  bucketLines: MpsBucketLine[],
  currentUser: string,
): {
  state: MpsAssistantState;
  bucketLines: MpsBucketLine[];
  demandLines: MpsDemandLine[];
  auditEvent: MpsAssistantAuditEvent;
} {
  const now = createTimestamp();
  let currentState = state;
  let currentBuckets = bucketLines;
  let currentDemand = demandLines;

  for (const step of state.steps) {
    const rec = currentState.recommendations.find((r) => r.stepId === step.id);
    if (!rec || rec.status !== 'Proposed') continue;
    const result = applyMpsAssistantRecommendation(currentState, currentDemand, currentBuckets, step.id, currentUser);
    currentBuckets = result.bucketLines;
    currentDemand = result.demandLines;
    currentState = {
      ...currentState,
      steps: result.steps,
      recommendations: result.recommendations.map((r) =>
        r.stepId === step.id ? {...r, approvedBy: currentUser, approvedAt: now} : r,
      ),
      finalReadinessStatus: result.finalReadinessStatus,
    };
  }

  const batchAudit = createMpsAssistantAuditEvent({
    stepId: 'batch',
    user: currentUser,
    eventType: 'AllRecommendationsApproved',
    previousValue: 'Proposed',
    newValue: 'Applied',
    now,
  });

  return {
    state: {...currentState, auditEvents: [...currentState.auditEvents, batchAudit]},
    bucketLines: currentBuckets,
    demandLines: currentDemand,
    auditEvent: batchAudit,
  };
}

export function rejectAllRecommendations(
  state: MpsAssistantState,
  reason: string,
  currentUser: string,
): {
  recommendations: MpsAssistantRecommendation[];
  auditEvent: MpsAssistantAuditEvent;
  finalReadinessStatus: MpsAssistantFinalReadinessStatus;
} {
  const now = createTimestamp();
  const nextRecommendations = state.recommendations.map((r) =>
    r.status === 'Proposed'
      ? {...r, status: 'Rejected' as const, rejectedBy: currentUser, rejectedAt: now, rejectionReason: reason}
      : r,
  );
  const skipped = state.steps.filter((s) => s.status === 'Skipped').map((s) => s.id);
  return {
    recommendations: nextRecommendations,
    auditEvent: createMpsAssistantAuditEvent({
      stepId: 'batch',
      user: currentUser,
      eventType: 'AllRecommendationsRejected',
      previousValue: 'Proposed',
      newValue: 'Rejected',
      comment: reason,
      now,
    }),
    finalReadinessStatus: calculateFinalMpsReadiness(state.steps, skipped),
  };
}

export function calculateRecommendationApprovalSummary(recommendations: MpsAssistantRecommendation[]) {
  return recommendations.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      if (r.status === 'Proposed' && r.severity === 'Blocker') acc.blockers += 1;
      if (r.status === 'Proposed' && r.severity === 'Warning') acc.warnings += 1;
      return acc;
    },
    {
      Proposed: 0,
      Approved: 0,
      Rejected: 0,
      Applied: 0,
      Edited: 0,
      Skipped: 0,
      Acknowledged: 0,
      blockers: 0,
      warnings: 0,
    } as Record<string, number>,
  );
}

export function createScenarioFromRecommendation(
  recommendation: MpsAssistantRecommendation,
  stepId: string,
  currentUser: string,
): ScenarioResult {
  const now = createTimestamp();
  return {
    scenario: {
      id: createId('assistant-scenario', `${stepId}-${Math.random().toString(36).slice(2, 7)}`),
      stepId,
      name: `${recommendation.title} Scenario`,
      createdAt: now,
      sourceRecommendationId: recommendation.id,
    },
    auditEvent: createMpsAssistantAuditEvent({
      stepId,
      user: currentUser,
      eventType: 'ScenarioCreated',
      previousValue: 'No scenario',
      newValue: 'Scenario created locally',
      now,
    }),
  };
}
