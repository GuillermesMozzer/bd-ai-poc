export type ViewMode = 'work-order' | 'operational-risk';

export type WoPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type WoReadiness = 'Blocked' | 'Warning' | 'Ready';
export type RiskSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type AiConfidence = 'High' | 'Medium' | 'Low';
export type ActionStatus =
  | 'New'
  | 'Assigned'
  | 'In Review'
  | 'Waiting Response'
  | 'Escalated'
  | 'Completed'
  | 'Resolved Pending Recheck'
  | 'Rejected';

export type FreshnessState = 'Fresh' | 'Watch' | 'Stale';

export type QuickAction = {
  id: string;
  label: string;
};

export type PreparedAction = {
  id: string;
  label: string;
  actionType: string;
  governed: boolean;
  owner: string;
  reasonCode: string;
  confirmationLabel: string;
  comment: string;
};

export type AiPriorityBriefing = {
  headline: string;
  summary: string;
  keySignals: string[];
  quickActions: QuickAction[];
  refreshLabel: string;
};

export type KpiCardData = {
  key: string;
  label: string;
  value: string | number;
  helperText: string;
  tone: 'danger' | 'warning' | 'info' | 'neutral' | 'success';
  icon: string;
};

export type AiActionCard = {
  id: string;
  rank: number;
  priority: WoPriority | RiskSeverity;
  title: string;
  relatedType: 'wo' | 'cluster';
  relatedId: string;
  relatedLabel: string;
  demandProtected: string;
  deadline: string;
  owner: string;
  confidence: AiConfidence;
  why: string;
  primaryAction: string;
  secondaryActions: string[];
  governed: boolean;
};

export type ReadinessCheck = {
  label: string;
  status: 'Ready' | 'Warning' | 'Blocked' | 'N/A';
  detail?: string;
};

export type EvidenceItem = {
  label: string;
  value: string;
};

export type ConversationEntry = {
  id: string;
  user: string;
  timestamp: string;
  text: string;
  type: 'comment' | 'action' | 'system' | 'ai';
};

export type WoQueueItem = {
  id: string;
  rank: number;
  priority: WoPriority;
  woId: string;
  product: string;
  batch: string;
  lineMachine: string;
  scheduledStart: string;
  timeToStart: string;
  readiness: WoReadiness;
  mainBlocker: string;
  whyRanked: string;
  demandAtRisk: string;
  operationalImpact: string;
  owner: string;
  actionStatus: ActionStatus;
  actionDue: string;
  aiRecommendation: string;
  aiConfidence: AiConfidence;
  nextAction: string;
  freshness: FreshnessState;
  overrideActive: boolean;
  recoverableToday: boolean;
  preparedActionId: string;
  recommendationId: string;
  priorityOverride?: PriorityOverrideRecord;
};

export type WoFilters = {
  priority: string;
  readiness: string;
  actionStatus: string;
  lineMachine: string;
  search: string;
  owner: string;
  blocker: string;
  demandImpact: string;
  aiConfidence: string;
  freshness: string;
  assignment: string;
  overrideActive: string;
  recoverableToday: string;
};

export type WoDetailData = {
  woId: string;
  product: string;
  batch: string;
  plannedQty: string;
  lineMachine: string;
  scheduledStart: string;
  scheduledEnd: string;
  timeToStart: string;
  actionStatus: ActionStatus;
  priorityReason: string;
  whyBlocked: string;
  demandImpact: string;
  operationalImpact: string;
  noActionImpact: string;
  suggestedReplacement: string;
  dataFreshness: string;
  readinessChecks: ReadinessCheck[];
  evidence: EvidenceItem[];
  preparedActions: PreparedAction[];
  eventTimeline: string[];
  suggestedQuestions: string[];
};

export type RiskClusterItem = {
  id: string;
  rank: number;
  severity: RiskSeverity;
  clusterName: string;
  affectedWos: number;
  demandAtRisk: string;
  linesImpacted: string;
  earliestStart: string;
  rootCause: string;
  aiRecommendation: string;
  owner: string;
  confidence: AiConfidence;
  actionStatus: ActionStatus;
  primaryAction: string;
  freshness: FreshnessState;
  preparedActionId: string;
  recommendationId: string;
  priorityOverride?: PriorityOverrideRecord;
};

export type RiskFilters = {
  severity: string;
  owner: string;
  actionStatus: string;
  lineMachine: string;
  blocker: string;
  demandImpact: string;
  aiConfidence: string;
  freshness: string;
  assignment: string;
  overrideActive: string;
  recoverableToday: string;
  search: string;
};

export type RelatedRisk = {
  id: string;
  title: string;
  severity: RiskSeverity;
};

export type RiskDetailData = {
  clusterName: string;
  severity: RiskSeverity;
  owner: string;
  actionStatus: ActionStatus;
  demandAtRisk: string;
  recoverableQty: string;
  linesImpacted: string;
  earliestRisk: string;
  rootCauseSummary: string;
  aiRecoveryPlan: string;
  noActionImpact: string;
  suggestedOwnerReason: string;
  affectedWos: string[];
  relatedRisks: RelatedRisk[];
  preparedActions: PreparedAction[];
  suggestedQuestions: string[];
  eventTimeline: string[];
};

export type DemandRiskRow = {
  id: string;
  family: string;
  demandRequired: string;
  readyQuantity: string;
  atRiskQuantity: string;
  recoverableQuantity: string;
  mainConstraint: string;
  affectedWos: string[];
  earliestRiskDate: string;
  aiRecoveryRecommendation: string;
  nextAction: string;
  owner: string;
  confidence: AiConfidence;
  preparedActionId: string;
  recommendationId: string;
};

export type DemandRiskDetail = {
  family: string;
  demandRequired: string;
  readyQuantity: string;
  atRiskQuantity: string;
  recoverableQuantity: string;
  constraints: string[];
  relatedWos: string[];
  aiRecoveryRecommendation: string;
  noActionImpact: string;
  demandProtectionActions: PreparedAction[];
  suggestedQuestions: string[];
};

export type LineImpactRow = {
  id: string;
  lineMachine: string;
  wosAtRisk: string;
  atRiskQuantity: string;
  lineHoursAtRisk: string;
  primaryConstraint: string;
  earliestImpact: string;
  aiRecommendation: string;
  nextAction: string;
};

export type AiInsight = {
  whyPriority: string;
  predictedImpact: string;
  recommendedAction: string;
  confidence: AiConfidence;
  dataFreshness: string;
  isStale: boolean;
  suggestedOwner?: string;
  deadline?: string;
  governed?: boolean;
  noActionImpact?: string;
  relatedObjects?: string[];
};

export type DecisionLogEntry = {
  id: string;
  user: string;
  timestamp: string;
  viewMode: ViewMode;
  selectedItemId: string;
  aiRecommendation: string;
  userDecision: 'accepted' | 'dismissed' | 'modified' | 'rejected' | 'ignored';
  comment?: string;
  resultingAction?: string;
};

export type PriorityOverrideRecord = {
  originalPriority: WoPriority | RiskSeverity;
  newPriority: WoPriority | RiskSeverity;
  user: string;
  timestamp: string;
  reason: string;
};

export type ActionPayload = {
  title: string;
  relatedLabel: string;
  owner: string;
  reasonCode: string;
  recommendationId: string;
  rationale: string;
  comment: string;
  confirmationLabel: string;
};
