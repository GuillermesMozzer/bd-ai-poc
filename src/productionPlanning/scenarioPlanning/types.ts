export type ScenarioType = 'LongTerm' | 'ShortTerm';

export type ScenarioStatus = 'Draft' | 'Simulated' | 'Compared' | 'Applied' | 'Discarded';

export type ScenarioSeverity = 'Info' | 'Warning' | 'Blocker';

export type ScenarioChangeCategoryType =
  | 'DemandChange'
  | 'CapacityChange'
  | 'LineAssignmentChange'
  | 'InventoryPolicyChange'
  | 'ProductRuleChange'
  | 'MaterialConstraint'
  | 'CalendarEvent'
  | 'PriorityChange';

export type ScenarioValueType = 'Quantity' | 'Percentage' | 'Hours' | 'Days' | 'Line' | 'Text';

export type CapacityStatus = 'Feasible' | 'AtRisk' | 'Overloaded' | 'MissingData';

export type StockStatus = 'OK' | 'BelowMin' | 'AboveMax';

export type ReadinessStatus = 'Ready' | 'NotReady';

export type BucketType = 'Month' | 'Week' | 'Day';

export type EffortLevel = 'Low' | 'Medium' | 'High';

export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ScenarioAuditEventType =
  | 'ScenarioLoaded'
  | 'ScenarioTypeChanged'
  | 'ChangeAdded'
  | 'ChangeUpdated'
  | 'ChangeRemoved'
  | 'ScenarioSimulated'
  | 'ScenarioCompared'
  | 'ScenarioApplied'
  | 'ScenarioSaved'
  | 'ScenarioDiscarded'
  | 'ScenarioDuplicated';

export type ScenarioExceptionCategory =
  | 'Demand'
  | 'Capacity'
  | 'Inventory'
  | 'Material'
  | 'MRPReadiness'
  | 'FrozenPeriod'
  | 'Planning';

export type SuggestedActionCategoryType =
  | 'MoveDemand'
  | 'AddCapacity'
  | 'ReduceCommitment'
  | 'ReassignLine'
  | 'PullProductionForward'
  | 'PushProductionOut'
  | 'ExpediteMaterial'
  | 'ReviewFrozenPeriod'
  | 'ReviewMRPReadiness';

export type ScenarioPlan = {
  id: string;
  name: string;
  type: ScenarioType;
  site: string;
  baselinePlanId: string;
  baselinePlanName: string;
  baselinePlanVersion: string;
  horizonLabel: string;
  horizonStart: string;
  horizonEnd: string;
  status: ScenarioStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastCalculatedAt: string | null;
  description: string;
  notes?: string;
};

export type ScenarioChange = {
  id: string;
  scenarioId: string;
  category: ScenarioChangeCategoryType;
  title: string;
  description: string;
  active: boolean;
  severity: ScenarioSeverity;
  productCode?: string;
  productFamily?: string;
  lineId?: string;
  startPeriod: string;
  endPeriod: string;
  valueType: ScenarioValueType;
  baselineValue: number | string;
  scenarioValue: number | string;
  deltaValue: number | string;
  reason?: string;
  comment?: string;
};

export type BaselineImpactRow = {
  id: string;
  productCode: string;
  productDescription: string;
  productFamily: string;
  period: string;
  bucketType: BucketType;
  baselineRequestedQuantity: number;
  scenarioRequestedQuantity: number;
  baselineCommittedQuantity: number;
  scenarioCommittedQuantity: number;
  baselineRequiredHours: number;
  scenarioRequiredHours: number;
  baselineAvailableHours: number;
  scenarioAvailableHours: number;
  baselineUtilizationPercent: number;
  scenarioUtilizationPercent: number;
  baselineUncoveredQuantity: number;
  scenarioUncoveredQuantity: number;
  baselineEndingStock: number;
  scenarioEndingStock: number;
  baselineCapacityStatus: CapacityStatus;
  scenarioCapacityStatus: CapacityStatus;
  baselineStockStatus: StockStatus;
  scenarioStockStatus: StockStatus;
  baselineReadinessStatus: ReadinessStatus;
  scenarioReadinessStatus: ReadinessStatus;
};

export type PeriodSummaryRow = {
  period: string;
  bucketType: BucketType;
  baselineUtilizationPercent: number;
  scenarioUtilizationPercent: number;
  utilizationDelta: number;
  uncoveredDemand: number;
  inventoryDelta: number;
  capacityStatus: CapacityStatus;
  stockStatus: StockStatus;
  readinessStatus: ReadinessStatus;
};

export type ScenarioImpactSummary = {
  demandChangeUnits: number;
  demandChangePercent: number;
  commitmentGapUnits: number;
  overloadedPeriods: number;
  inventoryBelowMinCount: number;
  mrpReadinessImpact: ReadinessStatus;
  overallSeverity: ScenarioSeverity;
  capacityHoursDelta: number;
  uncoveredDemandDelta: number;
  affectedProductsCount: number;
  affectedLinesCount: number;
};

export type ScenarioException = {
  id: string;
  severity: ScenarioSeverity;
  category: ScenarioExceptionCategory;
  productCode?: string;
  productDescription?: string;
  period: string;
  lineId?: string;
  reason: string;
  suggestedAction: string;
};

export type SuggestedAction = {
  id: string;
  scenarioId: string;
  title: string;
  description: string;
  category: SuggestedActionCategoryType;
  impact: string;
  effort: EffortLevel;
  priority: PriorityLevel;
  relatedProductCode?: string;
  relatedPeriod?: string;
};

export type ScenarioAuditEvent = {
  id: string;
  scenarioId: string;
  timestamp: string;
  user: string;
  eventType: ScenarioAuditEventType;
  previousValue?: string;
  newValue?: string;
  comment?: string;
};

export type PeriodImpact = {
  period: string;
  bucketType: BucketType;
  demandDelta: number;
  capacityDelta: number;
  inventoryDelta: number;
  uncoveredDelta: number;
  utilizationBaseline: number;
  utilizationScenario: number;
  readinessStatus: ReadinessStatus;
  capacityStatus: CapacityStatus;
  severity: ScenarioSeverity;
  mainConstraint: string;
  affectedProducts: string[];
  affectedLines: string[];
};

export type TopImpactedProduct = {
  productCode: string;
  productDescription: string;
  uncoveredDelta: number;
  utilizationDelta: number;
};

export type ScenarioAssumption = {
  id: string;
  category: string;
  label: string;
  value: string;
  editable: boolean;
};

export type UtilizationChartPoint = {
  period: string;
  baseline: number;
  scenario: number;
};

export type ScenarioListItem = {
  id: string;
  name: string;
  type: ScenarioType;
  status: ScenarioStatus;
  createdBy: string;
  updatedAt: string;
  overallSeverity: ScenarioSeverity;
  description: string;
  isBluAIRecommended: boolean;
};

export type BluAIKeyDataPoint = {
  label: string;
  value: string;
  positive: boolean;
};

export type BluAIRecommendation = {
  recommendedScenarioId: string;
  recommendedScenarioName: string;
  reasoning: string;
  confidencePercent: number;
  keyDataPoints: BluAIKeyDataPoint[];
};

export type ScenarioPlanningBundle = {
  scenario: ScenarioPlan;
  changes: ScenarioChange[];
  impactRows: BaselineImpactRow[];
  periodSummaryRows: PeriodSummaryRow[];
  impactSummary: ScenarioImpactSummary;
  periodImpacts: PeriodImpact[];
  exceptions: ScenarioException[];
  suggestedActions: SuggestedAction[];
  topImpactedProducts: TopImpactedProduct[];
  auditEvents: ScenarioAuditEvent[];
  assumptions: ScenarioAssumption[];
  chartData: UtilizationChartPoint[];
};
