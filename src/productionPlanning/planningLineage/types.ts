export type LineageNodeStatus =
  | 'approved'
  | 'warning'
  | 'critical'
  | 'simulation'
  | 'draft'
  | 'ready'
  | 'blocked'
  | 'released'
  | 'on-hold'
  | 'rejected'
  | 'not-applicable'
  | 'stale'
  | 'superseded';

export type LineageStageId =
  | 'demand'
  | 'mps'
  | 'mrp'
  | 'planned-order'
  | 'production-order'
  | 'schedule'
  | 'wo-release'
  | 'execution'
  | 'batch-produced'
  | 'material-lot-genealogy'
  | 'ipc-quality'
  | 'deviations'
  | 'sterilization'
  | 'dhr-documentation'
  | 'batch-release-decision'
  | 'final-disposition';

export type LineageStageConfig = {
  id: LineageStageId;
  label: string;
  shortLabel: string;
  widthPx: number;
};

export type LineageNode = {
  id: string;
  stageId: LineageStageId;
  label: string;
  sublabel?: string;
  quantity?: string;
  status: LineageNodeStatus;
  statusLabel?: string;
  metaLine1?: string;
  metaLine2?: string;
  metaLine3?: string;
  sourceSystem?: string;
  hasRiskIndicator?: boolean;
  hasAuditFlag?: boolean;
  isNotApplicable?: boolean;
  isSimulation?: boolean;
  isExpandable?: boolean;
  parentNodeId?: string;
  sharedAcrossChains?: boolean;
  linkedVersionId?: string;
  linkedPageId?: string;
};

export type LineageChain = {
  id: string;
  demandGroupId: string;
  label: string;
  isSimulation: boolean;
  nodeIdsByStage: Partial<Record<LineageStageId, string>>;
  nodes: LineageNode[];
};

export type LineageDemandGroup = {
  id: string;
  demandLabel: string;
  product: string;
  line: string;
  quantity: string;
  status: LineageNodeStatus;
  color: string;
  chains: LineageChain[];
};

export type LineageFilterState = {
  demandId: string;
  status: string;
  viewMode: 'flow' | 'timeline' | 'agentic';
  productCode: string;
  batchId: string;
  woNumber: string;
  line: string;
  qualityStatus: string;
  releaseStatus: string;
  sterilizationStatus: string;
  blockerType: string;
  dateFrom: string;
  dateTo: string;
  dataFreshness: string;
};

export type LineagePathStep = {
  stageId: LineageStageId;
  stageLabel: string;
  node: LineageNode | null;
};

export type AgentCardType =
  | 'demand-signal'
  | 'production'
  | 'material-warehouse'
  | 'quality'
  | 'maintenance'
  | 'shift-labor'
  | 'sterilization'
  | 'orchestrator';

export type AgentCardState =
  | 'Monitoring'
  | 'Analyzing'
  | 'Completed'
  | 'Warning'
  | 'Blocked'
  | 'Recommendation Ready';

export type AgentCardStatus = 'No Issue' | 'Warning' | 'At Risk' | 'Blocked' | 'Recommendation Ready';

export type AgentCard = {
  id: string;
  name: string;
  type: AgentCardType;
  state: AgentCardState;
  status: AgentCardStatus;
  insight: string[];
  confidence: number;
  lastUpdated: string;
  sparkline: number[];
  sourceSignals: string[];
  confidenceExplanation: string;
  impactedObjects: string[];
};

export type AgentConnection = {
  id: string;
  sourceAgentId: string;
  targetAgentId: string;
  status: 'active' | 'blocked' | 'resolved';
  label?: string;
};

export type AgenticRecommendation = {
  id: string;
  title: string;
  description: string;
  impactLevel: 'Low Impact' | 'Medium Impact' | 'High Impact';
  confidence: number;
  mainDriver: string;
  expectedImpact: {
    serviceLevelDelta: string;
    materialRiskDelta: string;
    capacityOverloadDaysDelta: string;
    changeoversDelta: string;
    sterilizationRiskDelta: string;
  };
  impactedObjects: {
    objectId: string;
    objectType: 'WO' | 'MPS' | 'MRP' | 'Schedule' | 'Demand';
    action: string;
  }[];
};

export type RiskItem = {
  id: string;
  title: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
};

export type AgentActivityItem = {
  id: string;
  timestamp: string;
  agentName: string;
  message: string;
};

export type ScenarioComparison = {
  id: string;
  scenarioName: string;
  serviceLevel: string;
  materialRisk: 'Low' | 'Medium' | 'High';
  capacityOverloadDays: number;
  status: 'Current' | 'Recommended' | 'Alternative';
};

export type AgenticViewState = {
  selectedDemandId: string;
  lastAnalysisAt: string;
  agents: AgentCard[];
  connections: AgentConnection[];
  recommendation: AgenticRecommendation;
  alternativeRecommendation: AgenticRecommendation;
  risks: RiskItem[];
  activity: AgentActivityItem[];
  scenarios: ScenarioComparison[];
  beforePlanId: string;
  afterPlanId: string;
};

export type AgenticAuditAction = 'Accepted' | 'Rejected';

export type AgenticAuditLogItem = {
  recommendationId: string;
  action: AgenticAuditAction;
  user: string;
  timestamp: string;
  reason: string;
  selectedDemandId: string;
  beforePlanId: string;
  afterPlanId: string;
};
