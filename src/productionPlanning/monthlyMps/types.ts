export type MpsPlanStatus =
  | 'Draft'
  | 'Validated'
  | 'CapacityChecked'
  | 'Adjusted'
  | 'Released'
  | 'ReleasedWithWarnings'
  | 'Superseded';

export type BucketType = 'Week' | 'Day';

export type DemandSource =
  | 'GlobalForecast'
  | 'FirmOrder'
  | 'DistributionCenterEstimate'
  | 'ManualAdjustment'
  | 'Other';

export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export type RiskLevel = 'Low' | 'Medium' | 'High';

export type DemandLineStatus =
  | 'NotStarted'
  | 'PartiallyPlanned'
  | 'FullyPlanned'
  | 'OverPlanned'
  | 'RequiresDecision';

export type BucketStatus =
  | 'Feasible'
  | 'AtRisk'
  | 'Overloaded'
  | 'BelowLotSize'
  | 'AboveLotSize'
  | 'StockRisk'
  | 'MissingData'
  | 'RequiresDecision'
  | 'Released';

export type ExceptionSeverity = 'Info' | 'Warning' | 'Blocker';

export type ExceptionCategory =
  | 'Capacity'
  | 'Stock'
  | 'ProductRule'
  | 'MissingData'
  | 'FrozenPeriod'
  | 'MRPReadiness'
  | 'Planning';

export type ScenarioStatus = 'Draft' | 'Compared' | 'Applied' | 'Discarded';

export type MpsPlan = {
  id: string;
  name: string;
  site: string;
  planningPeriod: string;
  periodStartDate: string;
  periodEndDate: string;
  sourceLongTermPlanVersion: string;
  mpsVersion: string;
  status: MpsPlanStatus;
  frozenPeriodStartDate: string;
  frozenPeriodEndDate: string;
  isFrozenPeriod: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  releasedBy?: string;
  releasedAt?: string;
  releaseComment?: string;
  planDataTimestamp: string;
  notes?: string;
};

export type MpsDemandLine = {
  id: string;
  planId: string;
  productCode: string;
  productDescription: string;
  productFamily: string;
  uom: string;
  approvedMonthlyDemand: number;
  alreadyPlannedQuantity: number;
  remainingQuantityToPlan: number;
  demandSource: DemandSource;
  priority: Priority;
  riskLevel: RiskLevel;
  status: DemandLineStatus;
  plannerComment?: string;
};

export type MpsBucketLine = {
  id: string;
  planId: string;
  demandLineId: string;
  productCode: string;
  productDescription: string;
  productFamily: string;
  bucketType: BucketType;
  bucketLabel: string;
  bucketStartDate: string;
  bucketEndDate: string;
  plannedQuantity: number;
  assignedLineId?: string | null;
  requiredHours: number;
  availableHours: number;
  remainingCapacityHours: number;
  utilizationPercent: number;
  projectedOpeningStock: number;
  projectedDemandConsumption: number;
  projectedEndingStock: number;
  minStock: number;
  maxStock: number;
  targetStock: number;
  stockCoverageDays: number;
  status: BucketStatus;
  constraintReason?: string;
  plannerComment?: string;
  isEdited?: boolean;
  isFrozenPeriod?: boolean;
};

export type ProductionLineBucket = {
  bucketLabel: string;
  bucketStartDate: string;
  bucketEndDate: string;
  availableHours: number;
  plannedDowntimeHours: number;
  calendarNotes?: string;
};

export type ProductionLine = {
  id: string;
  name: string;
  area: string;
  active: boolean;
  bucketAvailableHours: ProductionLineBucket[];
};

export type ProductLineCapability = {
  productCode: string;
  lineId: string;
  productionRateUnitsPerHour: number | null;
  minLotSize: number;
  maxLotSize: number;
  preferredLotSize: number;
  active: boolean;
  changeoverFamily?: string;
  notes?: string;
};

export type ProductPlanningRule = {
  productCode: string;
  minLotSize: number;
  maxLotSize: number;
  preferredLotSize: number;
  eligibleLineIds: string[];
  preferredLineId?: string;
  stockMin: number;
  stockMax: number;
  stockTarget: number;
  shelfLifeDays?: number;
  campaignGroup?: string;
  changeoverFamily?: string;
  notes?: string;
};

export type MpsScenario = {
  id: string;
  planId: string;
  name: string;
  description?: string;
  createdBy: string;
  createdAt: string;
  assumptions?: string;
  status: ScenarioStatus;
  changedBucketLines: Array<{
    bucketLineId: string;
    plannedQuantity: number;
    assignedLineId?: string | null;
  }>;
};

export type MpsException = {
  id: string;
  severity: ExceptionSeverity;
  category: ExceptionCategory;
  productCode?: string;
  bucketLabel?: string;
  lineId?: string;
  reason: string;
  suggestedAction?: string;
};

export type AuditEvent = {
  id: string;
  entityType: string;
  entityId: string;
  eventType: string;
  previousValue?: string;
  newValue?: string;
  user: string;
  timestamp: string;
  reasonCode?: string;
  comment?: string;
  sourceScreen: string;
};

export type MpsPlanningFiltersState = {
  productFamily: string;
  search: string;
  productionLine: string;
  bucket: string;
  status: string;
  priority: string;
  riskLevel: string;
  onlyExceptions: boolean;
  onlyFrozen: boolean;
};

export type MpsBucketRowView = MpsBucketLine & {
  lineName: string;
};

export type MpsHealthSummary = {
  totalApprovedDemand: number;
  totalPlannedQuantity: number;
  remainingUnplanned: number;
  overplannedQuantity: number;
  avgUtilization: number;
  highestUtilizationPercent: number;
  highestUtilizationLabel: string;
  feasibleCount: number;
  atRiskCount: number;
  overloadedCount: number;
  stockRiskCount: number;
  missingDataCount: number;
  requiresDecisionCount: number;
  frozenPeriodEditsCount: number;
};

export type MrpReadinessCheck = {
  label: string;
  passed: boolean;
  detail?: string;
};

// ── MPS Versioning / Baseline Control ─────────────────────────────────────────

export type MpsApprovalStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';

export type MpsVersion = {
  id: string;
  planningCycle: string;
  cycleId: string;
  effectivePeriodStart: string;
  effectivePeriodEnd: string;
  sourceSystem: string;
  importedAt: string;
  importedBy: string;
  isApprovedBaseline: boolean;
  approvedBy: string | null;
  approvedAt: string | null;
  approvalStatus: MpsApprovalStatus;
  changeReason: string;
  previousValues: Record<string, unknown>;
  impactedWOs: string[];
  impactedMaterials: string[];
  impactedLines: string[];
  linkedForecastVersionIds: string[];
  linkedMrpVersionIds?: string[];
  notes: string | null;
};

export type MpsVersionAuditEventType =
  | 'Imported'
  | 'Submitted'
  | 'Approved'
  | 'Rejected'
  | 'SetAsBaseline'
  | 'Superseded';

export type MpsVersionAuditEvent = {
  id: string;
  versionId: string;
  eventType: MpsVersionAuditEventType;
  actor: string;
  timestamp: string;
  comment: string | null;
  previousValue?: string;
  newValue?: string;
};

export type MpsVersionKpi = {
  key: string;
  label: string;
  value: string | number;
  helperText: string;
  tone: 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  icon: 'baseline' | 'pending' | 'versions' | 'lines';
};

export type MpsVersionFiltersState = {
  cycleId: string;
  approvalStatus: string;
  isBaseline: string;
  dateFrom: string;
  dateTo: string;
  search: string;
};

export type MpsVersionCycleGroup = {
  cycleId: string;
  cycleLabel: string;
  versions: MpsVersion[];
};

export type MrpReadiness = {
  isReady: boolean;
  checks: MrpReadinessCheck[];
};

export type ValidationMessage = {
  id: string;
  severity: 'Warning' | 'Blocker';
  code: string;
  message: string;
  entityId?: string;
};

export type ValidationSummary = {
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
};

export type ScenarioComparisonRow = {
  productCode: string;
  productDescription: string;
  bucketLabel: string;
  baselinePlannedQuantity: number;
  scenarioPlannedQuantity: number;
  baselineLineId?: string | null;
  scenarioLineId?: string | null;
  baselineUtilization: number;
  scenarioUtilization: number;
  baselineEndingStock: number;
  scenarioEndingStock: number;
  baselineStatus: BucketStatus;
  scenarioStatus: BucketStatus;
  deltaRemainingUnplanned: number;
  deltaRequiredHours: number;
};

export type MpsAssistantStepStatus =
  | 'Pending'
  | 'InProgress'
  | 'Complete'
  | 'Warning'
  | 'Blocked'
  | 'Skipped';

export type MpsAssistantStepCategory =
  | 'Scope'
  | 'Demand'
  | 'ProductRules'
  | 'BucketPlanning'
  | 'LineAssignment'
  | 'Capacity'
  | 'Inventory'
  | 'Material'
  | 'Exceptions'
  | 'Release';

export type MpsAssistantRecommendationAction =
  | 'ApplyRecommendation'
  | 'ApplySelected'
  | 'EditManually'
  | 'CreateScenario'
  | 'Explain'
  | 'Skip'
  | 'AcknowledgeRisk'
  | 'RequestDataFix';

export type MpsAssistantRecommendationSeverity = 'Info' | 'Warning' | 'Blocker';
export type MpsAssistantRecommendationConfidence = 'Low' | 'Medium' | 'High';
export type MpsAssistantRecommendationStatus = 'Proposed' | 'Approved' | 'Rejected' | 'Applied' | 'Edited' | 'Skipped' | 'Acknowledged';
export type MpsAssistantEvidenceStatus = 'OK' | 'Warning' | 'Blocker' | 'Info';
export type MpsAssistantImpactStatus = 'Positive' | 'Neutral' | 'Negative';
export type MpsAssistantFinalReadinessStatus = 'NotReady' | 'ReadyWithWarnings' | 'ReadyForRelease' | 'Blocked';

export type MpsAssistantStep = {
  id: string;
  sequence: number;
  title: string;
  shortTitle: string;
  description: string;
  question: string;
  status: MpsAssistantStepStatus;
  category: MpsAssistantStepCategory;
  recommendationTitle: string;
  recommendationText: string;
  evidence: string[];
  impactSummary: string;
  primaryActionLabel: string;
  secondaryActionLabel: string;
  updatedAt: string;
};

export type MpsAssistantRecommendation = {
  id: string;
  stepId: string;
  title: string;
  description: string;
  severity: MpsAssistantRecommendationSeverity;
  confidence: MpsAssistantRecommendationConfidence;
  affectedProducts: string[];
  affectedLines: string[];
  affectedBuckets: string[];
  beforeValue: string;
  afterValue: string;
  expectedImpact: string;
  canApply: boolean;
  requiresComment: boolean;
  status: MpsAssistantRecommendationStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
};

export type MpsAssistantEvidence = {
  id: string;
  stepId: string;
  label: string;
  value: string;
  status: MpsAssistantEvidenceStatus;
  details: string;
};

export type MpsAssistantImpact = {
  id: string;
  stepId: string;
  metric: string;
  beforeValue: string;
  afterValue: string;
  deltaValue: string;
  unit: string;
  status: MpsAssistantImpactStatus;
};

export type MpsPlanningLine = {
  id: string;
  productCode: string;
  productDescription: string;
  productFamily: string;
  bucketLabel: string;
  bucketStartDate: string;
  bucketEndDate: string;
  requestedQuantity: number;
  plannedQuantity: number;
  assignedLineId: string | null;
  assignedLineName: string;
  requiredHours: number;
  availableHours: number;
  utilizationPercent: number;
  openingStock: number;
  projectedEndingStock: number;
  minStock: number;
  maxStock: number;
  targetStock: number;
  materialRisk: string;
  priority: Priority;
  status: 'Feasible' | 'AtRisk' | 'Overloaded' | 'MissingData' | 'StockRisk' | 'MaterialRisk' | 'RequiresDecision';
  plannerComment?: string;
  isEditedByAssistant: boolean;
};

export type MpsAssistantAuditEventType =
  | 'StepStarted'
  | 'RecommendationApplied'
  | 'RecommendationApproved'
  | 'RecommendationRejected'
  | 'AllRecommendationsApproved'
  | 'AllRecommendationsRejected'
  | 'RecommendationEdited'
  | 'RecommendationSkipped'
  | 'RiskAcknowledged'
  | 'DataFixRequested'
  | 'ScenarioCreated'
  | 'ExplanationViewed'
  | 'FinalRecommendationGenerated';

export type MpsAssistantAuditEvent = {
  id: string;
  timestamp: string;
  user: string;
  stepId: string;
  eventType: MpsAssistantAuditEventType;
  previousValue?: string;
  newValue?: string;
  comment?: string;
};

export type MpsAssistantScenarioRecord = {
  id: string;
  stepId: string;
  name: string;
  createdAt: string;
  sourceRecommendationId: string;
};

export type MpsAssistantState = {
  activeStepId: string;
  steps: MpsAssistantStep[];
  recommendations: MpsAssistantRecommendation[];
  evidence: MpsAssistantEvidence[];
  impacts: MpsAssistantImpact[];
  auditEvents: MpsAssistantAuditEvent[];
  scenarios: MpsAssistantScenarioRecord[];
  isAssistantOpen: boolean;
  lastRunAt: string;
  finalReadinessStatus: MpsAssistantFinalReadinessStatus;
};

export type WorkOrderProposalStatus =
  | 'PendingReview'
  | 'ApprovedForCreation'
  | 'Rejected'
  | 'NeedsReview'
  | 'Blocked';

export type WorkOrderProposalCapacityStatus =
  | 'Feasible'
  | 'AtRisk'
  | 'Overloaded'
  | 'MissingData';

export type WorkOrderProposalReadinessPreview =
  | 'Ready'
  | 'Warning'
  | 'Blocked'
  | 'NotChecked';

export type WorkOrderProposalMaterialRisk =
  | 'None'
  | 'Low'
  | 'Medium'
  | 'High';

export type WorkOrderProposalInventoryImpact =
  | 'Positive'
  | 'Neutral'
  | 'Negative';

export type WorkOrderProposalAiConfidence = 'Low' | 'Medium' | 'High';

export type WorkOrderProposal = {
  id: string;
  proposalNumber: string;
  sourceMpsId: string;
  sourceMpsBucketId: string;
  productCode: string;
  productDescription: string;
  productFamily: string;
  proposedQuantity: number;
  uom: string;
  proposedLineId: string;
  proposedLineName: string;
  plannedStartDateTime: string;
  plannedEndDateTime: string;
  durationHours: number;
  dueDate: string;
  priority: Priority;
  readinessPreview: WorkOrderProposalReadinessPreview;
  capacityStatus: WorkOrderProposalCapacityStatus;
  materialRisk: WorkOrderProposalMaterialRisk;
  inventoryImpact: WorkOrderProposalInventoryImpact;
  aiConfidence: WorkOrderProposalAiConfidence;
  aiReasoning: string;
  recommendationSummary: string;
  constraintNotes?: string;
  expectedImpact: string;
  status: WorkOrderProposalStatus;
  selected: boolean;
  approvedBy?: string;
  approvedAt?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  plannerComment?: string;
};

export type WorkOrderProposalAuditEventType =
  | 'ProposalGenerated'
  | 'ProposalApproved'
  | 'ProposalRejected'
  | 'ProposalsApprovedBatch'
  | 'ProposalsRejectedBatch'
  | 'ProposalCommentAdded';

export type WorkOrderProposalAuditEvent = {
  id: string;
  proposalId: string;
  timestamp: string;
  user: string;
  eventType: WorkOrderProposalAuditEventType;
  previousValue?: string;
  newValue?: string;
  comment?: string;
};

export type WorkOrderProposalKpis = {
  total: number;
  pendingReview: number;
  approvedForCreation: number;
  rejected: number;
  needsReview: number;
  blocked: number;
  totalQty: number;
  highCriticalCount: number;
};

export type WorkOrderProposalFiltersState = {
  status: string;
  product: string;
  line: string;
  priority: string;
  readinessPreview: string;
  capacityStatus: string;
  materialRisk: string;
  aiConfidence: string;
  showNeedsReview: boolean;
  showBlocked: boolean;
};
