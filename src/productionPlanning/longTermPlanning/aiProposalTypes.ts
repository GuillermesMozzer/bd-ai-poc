export type AiProposalStatus = 'Draft' | 'Accepted' | 'Rejected' | 'PartiallyAccepted' | 'SavedDraft';

export type AiIssueSeverity = 'Info' | 'Warning' | 'Blocker';

export type AiIssueStatus = 'Open' | 'Acknowledged' | 'Resolved';

export type ForecastIssueType =
  | 'MissingProductMasterData'
  | 'MissingProductLineCapability'
  | 'DemandSpike'
  | 'DemandDrop'
  | 'DuplicateForecastRow'
  | 'BlankMonthlyDemand'
  | 'ForecastAgeWarning'
  | 'DemandBelowMinimumLotSize';

export type DemandCapacityStatus = 'Feasible' | 'Warning' | 'Overloaded' | 'MissingData';

export type PlannerDecision = 'Pending' | 'Accepted' | 'Edited' | 'Rejected';

export type AiConfidence = 'Low' | 'Medium' | 'High';

export type AiReasoningCategory =
  | 'ForecastQuality'
  | 'Capacity'
  | 'Commitment'
  | 'ProductRules'
  | 'Scenario'
  | 'Risk';

export type LongTermRiskType =
  | 'CapacityOverload'
  | 'MissingProductionRate'
  | 'MaterialShortageRisk'
  | 'DemandSpike'
  | 'DuplicateForecastRow'
  | 'MinimumLotSizeIssue'
  | 'SupplierTestCapacityLoss'
  | 'MaintenanceCapacityLoss'
  | 'LaborConstraint';

export type LongTermRiskStatus = 'Open' | 'Acknowledged' | 'Resolved' | 'Deferred';

export type LongTermAiAuditEventType =
  | 'AiProposalGenerated'
  | 'RecommendationAccepted'
  | 'RecommendationRejected'
  | 'ProposalAccepted'
  | 'ProposalRejected'
  | 'ScenarioSelected'
  | 'RiskAcknowledged'
  | 'RiskResolved'
  | 'DraftSaved';

export type InventoryRisk = 'Low' | 'Medium' | 'High';
export type MaterialRisk = 'Low' | 'Medium' | 'High';

export type ForecastQualityIssue = {
  id: string;
  productCode: string;
  productDescription: string;
  month: string;
  issueType: ForecastIssueType;
  currentForecast: number | null;
  priorForecast: number | null;
  variancePercent: number | null;
  severity: AiIssueSeverity;
  aiRecommendation: string;
  status: AiIssueStatus;
};

export type DemandCapacityRow = {
  id: string;
  productCode: string;
  productDescription: string;
  month: string;
  forecastDemand: number;
  requiredHours: number | null;
  eligibleLine: string;
  availableHours: number;
  utilizationPercent: number | null;
  capacityStatus: DemandCapacityStatus;
  constraint: string | null;
  aiRecommendation: string;
};

export type CommitmentRecommendation = {
  id: string;
  productCode: string;
  productDescription: string;
  month: string;
  forecastDemand: number;
  recommendedCommitment: number;
  commitmentPercent: number;
  uncoveredDemand: number;
  primaryConstraint: string | null;
  confidence: AiConfidence;
  plannerDecision: PlannerDecision;
  rejectionReason?: string;
  aiReasoning: string;
  selected: boolean;
};

export type LongTermAiScenario = {
  id: string;
  name: string;
  description: string;
  demandCoveragePercent: number;
  requiredOvertimeHours: number;
  overloadedMonths: number;
  uncoveredDemand: number;
  inventoryRisk: InventoryRisk;
  materialRisk: MaterialRisk;
  aiRecommendation: string;
  selected: boolean;
};

export type LongTermAiReasoning = {
  id: string;
  title: string;
  category: AiReasoningCategory;
  severity: AiIssueSeverity;
  explanation: string;
  affectedProducts: string[];
  affectedMonths: string[];
};

export type LongTermRisk = {
  id: string;
  riskType: LongTermRiskType;
  severity: AiIssueSeverity;
  productCode: string;
  productDescription: string;
  month: string;
  impact: string;
  owner: string;
  recommendedAction: string;
  status: LongTermRiskStatus;
};

export type LongTermAiAuditEvent = {
  id: string;
  timestamp: string;
  user: string;
  eventType: LongTermAiAuditEventType;
  previousValue?: string;
  newValue?: string;
  comment?: string;
};

export type AiProposalSummary = {
  forecastRowsChecked: number;
  productsWithForecastIssues: number;
  capacityOverloadedMonths: number;
  recommendedCommitmentPercent: number;
  uncoveredDemandUnits: number;
  highRiskProducts: number;
  materialRiskItems: number;
  plannerActionsRequired: number;
};

export type LongTermPlanningAiProposal = {
  id: string;
  site: string;
  planningHorizonStart: string;
  planningHorizonEnd: string;
  sourceForecastVersion: string;
  generatedAt: string;
  generatedBy: string;
  confidencePercent: number;
  status: AiProposalStatus;
  summary: AiProposalSummary;
  forecastQualityIssues: ForecastQualityIssue[];
  demandCapacityRows: DemandCapacityRow[];
  commitmentRecommendations: CommitmentRecommendation[];
  scenarios: LongTermAiScenario[];
  reasoning: LongTermAiReasoning[];
  risks: LongTermRisk[];
  auditEvents: LongTermAiAuditEvent[];
};
