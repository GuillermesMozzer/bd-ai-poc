export type PlannerAiShift = 'day' | 'night';

export type PlannerAiSourceKind =
  | 'planner-card'
  | 'planning-queue'
  | 'follow-up-request'
  | 'follow-up-planning'
  | 'follow-up-scheduled'
  | 'follow-up-progress';

export type PlannerAiSeverity = 'critical' | 'high' | 'medium' | 'low';

export type PlannerAiPartsStatus = 'ready' | 'risk' | 'blocked' | 'unknown';

export type PlannerAiPartsEtaRisk = 'ready' | 'tight' | 'late';

export type PlannerAiFollowUpBacklogSummary = {
  openRequestCount: number;
  planningLaneCount: number;
  scheduledCount: number;
  inProgressCount: number;
  blockedByPartsCount: number;
  highlightItems: Array<{
    id: string;
    asset: string;
    workOrderLabel: string;
    laneLabel: string;
    priorityLabel: string;
    statusLabel: string;
    summary: string;
    tags: string[];
  }>;
};

export type PlannerAiFeasibilityStatus = 'pass' | 'warning' | 'blocker';

export type PlannerAiAgentContributor =
  | 'Safety'
  | 'Planner'
  | 'Reliability'
  | 'Spare Parts'
  | 'Labor'
  | 'Production'
  | 'Follow-Up';

export type PlannerAiCalendarCardInput = {
  id: string;
  workOrder: string;
  shift: PlannerAiShift;
  day: number;
  startHour: number;
  startMinute?: number;
  title: string;
  type: 'Preventive' | 'Corrective';
  priority: string;
  duration: string;
  assignee: {
    name: string;
    initials: string;
  };
  assigneeRole?: 'Technician' | 'Operator';
  due?: string;
  preventiveSchedule?: {
    kind: 'floating' | 'fixed';
    windowDays: number;
  };
  statusOverride?: 'Planning';
};

export type PlannerAiPlanningItemInput = {
  wo: string;
  asset: string;
  line: string;
  zone: string;
  duration: string;
  priority: string;
  suggestedTechnician: string;
  type: 'Preventive' | 'Corrective';
  tone?: string;
};

export type PlannerAiWorkItem = {
  id: string;
  sourceKind: PlannerAiSourceKind;
  asset: string;
  title: string;
  workOrderLabel: string;
  workType: 'Preventive' | 'Corrective' | 'Breakdown';
  priorityLabel: string;
  durationLabel: string;
  durationHours: number;
  statusLabel: string;
  summary: string;
  assigneeName?: string;
  line?: string;
  zone?: string;
  tags: string[];
  equipmentCriticality?: 'A' | 'B' | 'C';
};

export type PlannerAiFollowUpSnapshot = {
  requests: PlannerAiWorkItem[];
  planning: PlannerAiWorkItem[];
  scheduled: PlannerAiWorkItem[];
  inProgress: PlannerAiWorkItem[];
  blockedScheduled: PlannerAiWorkItem[];
};

export type PlannerAiRiskSignal = {
  id: string;
  asset: string;
  severity: PlannerAiSeverity;
  healthScore: number;
  daysToFailure: number;
  recommendation: string;
  area: string;
  trend: string;
  metric: string;
  currentReading: string;
  warningThreshold: string;
  criticalThreshold: string;
};

export type PlannerAiPartsReadiness = {
  asset: string;
  status: PlannerAiPartsStatus;
  summary: string;
  detail: string;
  matchedPartCode?: string;
  matchedPartName?: string;
  availableStock?: number;
  stockState?: 'in-stock' | 'low-stock' | 'out-of-stock';
  sourceLabel?: string;
};

export type PlannerAiImpactMetric = {
  id: string;
  label: string;
  before: number;
  after: number;
  unit: '%' | 'score' | 'count' | 'hours';
  direction: 'up' | 'down';
  deltaValue: number;
  deltaLabel: string;
  emphasis: 'positive' | 'negative' | 'neutral';
  summary: string;
};

export type PlannerAiConfidenceFactor = {
  label: string;
  value: number;
  summary: string;
};

export type PlannerAiSpecialistAgentId = Extract<
  PlannerAiAgentContributor,
  'Safety' | 'Reliability' | 'Spare Parts' | 'Labor' | 'Production'
>;

export type PlannerAiAgentAssessmentStance = 'support' | 'warning' | 'block';

export type PlannerAiAgentAssessment = {
  agent: PlannerAiSpecialistAgentId;
  actionId: string;
  stance: PlannerAiAgentAssessmentStance;
  confidence: number;
  summary: string;
};

export type PlannerAiAgentFindingSeverity = 'info' | 'warning' | 'blocker';

export type PlannerAiAgentFinding = {
  id: string;
  agent: PlannerAiSpecialistAgentId;
  title: string;
  summary: string;
  severity: PlannerAiAgentFindingSeverity;
  asset?: string;
  sourceLabel?: string;
  relatedActionIds?: string[];
};

export type PlannerAiAgentEvaluation = {
  agent: PlannerAiSpecialistAgentId;
  title: string;
  summary: string;
  confidence: number;
  findings: PlannerAiAgentFinding[];
  actionAssessments: PlannerAiAgentAssessment[];
};

export type PlannerAiAgentConflict = {
  id: string;
  title: string;
  summary: string;
  severity: 'warning' | 'blocker';
  resolution: string;
  agents: PlannerAiAgentContributor[];
  actionId?: string;
  asset?: string;
};

export type PlannerAiOrchestrationSummary = {
  strategy: PlannerAiPlanStrategy;
  headline: string;
  summary: string;
  participatingAgents: PlannerAiSpecialistAgentId[];
  blockedActionCount: number;
  warningActionCount: number;
  conflictCount: number;
};

export type PlannerAiCoverageStatus = 'healthy' | 'thin' | 'critical';

export type PlannerAiCoverageCell = {
  id: string;
  zone: string;
  category: string;
  shift: PlannerAiShift;
  technicianCount: number;
  status: PlannerAiCoverageStatus;
  technicianNames: string[];
};

export type PlannerAiCoverageRecommendation = {
  id: string;
  title: string;
  summary: string;
  priority: 'high' | 'medium' | 'low';
  cellId?: string;
  actionType?: 'cross-train' | 'overtime' | 'contractor' | 'shift-swap';
};

export type PlannerAiCoverageSummary = {
  coverageScore: number;
  zones: string[];
  categories: string[];
  cells: PlannerAiCoverageCell[];
  constrainedZones: string[];
  recommendations: PlannerAiCoverageRecommendation[];
};

export type PlannerAiBundleConstraintType =
  | 'loto-zone'
  | 'crew'
  | 'parts-crib'
  | 'shared-downtime'
  | 'zone-line-day';

export type PlannerAiMaintenanceBundle = {
  id: string;
  name: string;
  summary: string;
  constraint: string;
  constraintType: PlannerAiBundleConstraintType;
  actionIds: string[];
  workOrderLabels: string[];
  line?: string;
  zone?: string;
  lotoZone?: string;
  crewLabel?: string;
  timeSaved: string;
  productionImpact: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskOfBundling: 'low' | 'medium' | 'high';
};

export type PlannerAiApprovalDecision = 'pending' | 'approved' | 'rejected' | 'auto-approved' | 'overridden';

export type PlannerAiApprovalStep = {
  id: string;
  role: string;
  status: PlannerAiApprovalDecision;
  summary: string;
  escalationLabel?: string;
  comment?: string;
  decidedAt?: string;
};

export type PlannerAiApprovalAction = {
  stepId: string;
  requestId: string;
  decision: PlannerAiApprovalDecision;
  comment?: string;
  decidedAt: string;
};

export type PlannerAiApprovalRequest = {
  id: string;
  title: string;
  summary: string;
  status: 'pending' | 'auto-approved';
  riskLevel: 'low' | 'medium' | 'high';
  relatedActionIds: string[];
  requiredBy: string;
  steps: PlannerAiApprovalStep[];
};

export type PlannerAiCascadeConflict = {
  id: string;
  horizon: PlannerAiAssistantHorizon;
  severity: 'info' | 'warning' | 'blocker';
  title: string;
  summary: string;
  resolution: string;
  relatedActionIds: string[];
};

export type PlannerAiCascadeMetricDelta = {
  id: string;
  label: string;
  beforeLabel: string;
  afterLabel: string;
  deltaLabel: string;
  emphasis: 'positive' | 'negative' | 'neutral';
};

export type PlannerAiCascadeImpact = {
  horizon: PlannerAiAssistantHorizon;
  title: string;
  summary: string;
  badgeLabel: string;
  metricDeltas: PlannerAiCascadeMetricDelta[];
  conflictIds: string[];
  affectedWorkOrders: string[];
};

export type PlannerAiPlannerSnapshotAsset = {
  id: string;
  asset: string;
  line: string;
  zone: string;
  sourceKind: PlannerAiSourceKind;
  workOrderLabel: string;
  workType: 'Preventive' | 'Corrective' | 'Breakdown';
  priorityLabel: string;
  durationHours: number;
  assigneeName?: string;
  recommendedTechnician?: string;
  day?: number;
  shift?: PlannerAiShift;
  partsReadiness: PlannerAiPartsReadiness;
  riskSignal?: PlannerAiRiskSignal;
};

export type PlannerAiPlannerSnapshot = {
  id: string;
  generatedAt: string;
  cards: PlannerAiCalendarCardInput[];
  planningItems: PlannerAiPlanningItemInput[];
  followUpSnapshot: PlannerAiFollowUpSnapshot;
  followUpBacklogSummary: PlannerAiFollowUpBacklogSummary;
  riskSignals: PlannerAiRiskSignal[];
  partsReadiness: PlannerAiPartsReadiness[];
  assets: PlannerAiPlannerSnapshotAsset[];
  baseline: {
    riskScore: number;
    pmCompliance: number;
    plannedDowntimeHours: number;
    partsReadiness: number;
    openBacklog: number;
  };
  coverageSummary: PlannerAiCoverageSummary;
};

export type PlannerAiHorizonProjection = {
  horizon: PlannerAiAssistantHorizon;
  badgeLabel: string;
  conflictCount: number;
  hasBlocker: boolean;
};

export type PlannerAiCascadePreview = {
  id: string;
  generatedAt: string;
  strategyLabel: string;
  changeSource?: PlannerAiChangeSource;
  selectedActionIds: string[];
  impacts: PlannerAiCascadeImpact[];
  conflicts: PlannerAiCascadeConflict[];
  approvalRequests: PlannerAiApprovalRequest[];
  bundles: PlannerAiMaintenanceBundle[];
  coverageSummary: PlannerAiCoverageSummary;
  horizonProjections: PlannerAiHorizonProjection[];
  recommendedApplySummary: string;
};

export type PlannerAiChangeSource = 'ai-apply' | 'manual-dnd' | 'reschedule-modal' | 'copilot-drag';

export type PlannerAiUndoSnapshot = {
  cards: PlannerAiCalendarCardInput[];
  planningItems: PlannerAiPlanningItemInput[];
  capturedAt: string;
  changeLabel: string;
};

export type PlannerAiChangeIntent = {
  id: string;
  source: PlannerAiChangeSource;
  label: string;
  summary: string;
  strategyLabel: string;
  syntheticActions: PlannerAiPlanAction[];
  variantId?: string;
  selectedActionIds?: string[];
  manualCardMove?: {
    cardId: string;
    toDay: number;
    toShift: PlannerAiShift;
  };
  copilotSchedule?: {
    suggestionId: string;
    targetDay: number;
    targetShift: PlannerAiShift;
  };
};

export type PlannerAiFeasibilityItem = {
  id: string;
  label: string;
  status: PlannerAiFeasibilityStatus;
  detail: string;
  resolutionHint?: string;
  sourceLabel?: string;
  agentContributors?: PlannerAiAgentContributor[];
};

type PlannerAiPlanActionBase = {
  id: string;
  title: string;
  asset: string;
  workOrderLabel: string;
  sourceId: string;
  reason: string;
  impactSummary: string;
  priorityLabel: string;
  confidence: number;
  executionReadiness: PlannerAiFeasibilityStatus;
  agentContributors: PlannerAiAgentContributor[];
  primaryAgent?: PlannerAiSpecialistAgentId;
  agentAssessmentSummary?: string;
  agentAssessments?: PlannerAiAgentAssessment[];
  agentConflictIds?: string[];
  riskNote?: string;
  partsNote?: string;
  partsEtaLabel?: string;
  partsEtaRisk?: PlannerAiPartsEtaRisk;
};

export type PlannerAiPlanAction =
  | (PlannerAiPlanActionBase & {
      kind: 'reschedule-card';
      recommendedDay: number;
      recommendedShift: PlannerAiShift;
      recommendedStartHour: number;
      technicianName?: string;
    })
  | (PlannerAiPlanActionBase & {
      kind: 'schedule-planning-item';
      recommendedDay: number;
      recommendedShift: PlannerAiShift;
      recommendedStartHour: number;
      technicianName?: string;
    })
  | (PlannerAiPlanActionBase & {
      kind: 'promote-follow-up-request';
      suggestedTechnician?: string;
      durationLabel: string;
      workType: 'Preventive' | 'Corrective';
      line: string;
      zone: string;
    });

export type PlannerAiPlanBlocker = {
  id: string;
  asset: string;
  status: Extract<PlannerAiPartsStatus, 'risk' | 'blocked'>;
  summary: string;
  detail: string;
  sourceLabel: string;
};

export type PlannerAiPlanRationale = {
  headline: string;
  summary: string;
  tradeoffs: string[];
  recommendedNextSteps: string[];
};

export type PlannerAiPlan = {
  id: string;
  label: string;
  generatedAt: string;
  generationDurationMs: number;
  generatorLabel: string;
  horizonLabel: string;
  confidence: number;
  confidenceFactors: PlannerAiConfidenceFactor[];
  impactMetrics: PlannerAiImpactMetric[];
  feasibilityChecklist: PlannerAiFeasibilityItem[];
  actions: PlannerAiPlanAction[];
  blockers: PlannerAiPlanBlocker[];
  narrative: string;
  rationale: PlannerAiPlanRationale;
  riskCallouts: PlannerAiRiskSignal[];
  partsReadiness: PlannerAiPartsReadiness[];
  bundles: PlannerAiMaintenanceBundle[];
  coverageSummary?: PlannerAiCoverageSummary;
  agentConflicts: PlannerAiAgentConflict[];
  agentEvaluations: PlannerAiAgentEvaluation[];
  orchestrationSummary: PlannerAiOrchestrationSummary;
};

export type PlannerAiPlanStrategy =
  | 'recommended'
  | 'min-downtime'
  | 'max-reliability'
  | 'production-sync';

export type PlannerAiLaborLoad = 'Low' | 'Medium' | 'High';

export type PlannerAiScheduleDeltaTone = 'add' | 'move' | 'defer' | 'note';

export type PlannerAiScheduleDeltaItem = {
  id: string;
  tone: PlannerAiScheduleDeltaTone;
  summary: string;
  detail: string;
};

export type PlannerAiAgentReasoning = {
  id: string;
  agent: PlannerAiAgentContributor;
  title: string;
  summary: string;
  confidence: number;
  stance?: 'supporting' | 'warning' | 'blocking';
  highlights?: string[];
};

export type PlannerAiLongTermMetric = {
  id: string;
  label: string;
  currentValue: string;
  projectedValue: string;
  deltaLabel: string;
  emphasis: 'positive' | 'negative' | 'neutral';
  summary: string;
};

export type PlannerAiTradeoffPoint = {
  variantId: string;
  label: string;
  riskScore: number;
  downtimeHours: number;
  laborLoad: PlannerAiLaborLoad;
};

export type PlannerAiVariantSummary = {
  riskScore: number;
  plannedDowntimeHours: number;
  pmCompliance: number;
  partsReadiness: number;
  openBacklog: number;
  laborLoad: PlannerAiLaborLoad;
  annualCostDelta: string;
};

export type PlannerAiPlanVariant = PlannerAiPlan & {
  strategy: PlannerAiPlanStrategy;
  strategyLabel: string;
  strategyDescription: string;
  summaryMetrics: PlannerAiVariantSummary;
  scheduleDelta: PlannerAiScheduleDeltaItem[];
  agentReasoning: PlannerAiAgentReasoning[];
  longTermMetrics: PlannerAiLongTermMetric[];
  tradeoffPoint: PlannerAiTradeoffPoint;
};

export type PlannerAiComparisonSession = {
  id: string;
  label: string;
  generatedAt: string;
  generationDurationMs: number;
  generatorLabel: string;
  horizonLabel: string;
  recommendedVariantId: string;
  variants: PlannerAiPlanVariant[];
};

export type PlannerAiAssistantHorizon = 'weekly' | 'monthly' | 'quarterly' | 'annual';

export type PlannerAiAssistantRole = 'assistant' | 'planner' | 'system';

export type PlannerAiAssistantIntent =
  | 'risk-summary'
  | 'strategy-explainer'
  | 'monthly-focus'
  | 'quarterly-focus'
  | 'annual-focus'
  | 'what-if'
  | 'reschedule'
  | 'drag-to-schedule'
  | 'general';

export type PlannerAiAssistantMessage = {
  id: string;
  role: PlannerAiAssistantRole;
  content: string;
  timestampLabel: string;
  horizon: PlannerAiAssistantHorizon;
  intent?: PlannerAiAssistantIntent;
};

export type PlannerAiQuickPrompt = {
  id: string;
  label: string;
  question: string;
  intent: PlannerAiAssistantIntent;
};

export type PlannerAiInsightTone = 'info' | 'positive' | 'warning' | 'critical';

export type PlannerAiAssistantInsight = {
  id: string;
  title: string;
  summary: string;
  tone: PlannerAiInsightTone;
  metricLabel?: string;
  sourceLabel?: string;
  agentContributors?: PlannerAiAgentContributor[];
  linkedAsset?: string;
  linkedCardId?: string;
};

export type PlannerAiSuggestionAction =
  | 'open-reschedule'
  | 'drag-to-schedule'
  | 'review-plan'
  | 'review-compare';

export type PlannerAiCopilotSuggestion = {
  id: string;
  horizon: PlannerAiAssistantHorizon;
  tone: PlannerAiInsightTone;
  actionType: PlannerAiSuggestionAction;
  actionLabel: string;
  title: string;
  summary: string;
  reason: string;
  asset?: string;
  workOrderLabel?: string;
  targetCardId?: string;
  planningItemSourceId?: string;
  priorityLabel?: string;
  durationLabel?: string;
  workType?: 'Preventive' | 'Corrective';
  suggestedTechnician?: string;
  line?: string;
  zone?: string;
  recommendedDay?: number;
  recommendedShift?: PlannerAiShift;
  recommendedStartHour?: number;
  agentContributors?: PlannerAiAgentContributor[];
};

export type PlannerAiWhatIfScenarioKind =
  | 'move-pm-next-window'
  | 'defer-low-risk-pm'
  | 'bundle-shutdown-window';

export type PlannerAiWhatIfScenario = {
  id: string;
  label: string;
  description: string;
  kind: PlannerAiWhatIfScenarioKind;
};

export type PlannerAiWhatIfMetric = {
  id: string;
  label: string;
  beforeLabel: string;
  afterLabel: string;
  deltaLabel: string;
  emphasis: 'positive' | 'negative' | 'neutral';
};

export type PlannerAiWhatIfResult = {
  id: string;
  scenarioId?: string;
  title: string;
  summary: string;
  recommendation: string;
  generatedAt: string;
  metrics: PlannerAiWhatIfMetric[];
  blockers: string[];
  horizonImpacts?: PlannerAiCascadeImpact[];
  approvalRequests?: PlannerAiApprovalRequest[];
  coverageSummary?: PlannerAiCoverageSummary;
  agentCommentary?: Array<{
    agent: PlannerAiSpecialistAgentId;
    summary: string;
    stance: PlannerAiAgentAssessmentStance;
  }>;
};

export type PlannerAiCopilotProactiveContext = {
  hasBetterPlan: boolean;
  commandBarMessage: string;
  suggestedCta: 'analyze' | 'review' | 'copilot';
  recommendedStrategyLabel?: string;
  actionCount?: number;
  riskDelta?: number;
};

export type PlannerAiCopilotSnapshot = {
  horizon: PlannerAiAssistantHorizon;
  greeting: string;
  proactiveContext: PlannerAiCopilotProactiveContext;
  quickPrompts: PlannerAiQuickPrompt[];
  insights: PlannerAiAssistantInsight[];
  suggestions: PlannerAiCopilotSuggestion[];
  assistantReply?: PlannerAiAssistantMessage;
  whatIfScenarios: PlannerAiWhatIfScenario[];
};
