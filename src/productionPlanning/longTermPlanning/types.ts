export type LongTermPlanStatus =
  | 'Draft'
  | 'Imported'
  | 'Validated'
  | 'CapacityReviewed'
  | 'Adjusted'
  | 'Released'
  | 'Superseded';

export type DemandSource =
  | 'GlobalForecast'
  | 'FirmOrder'
  | 'DistributionCenterEstimate'
  | 'ManualAdjustment'
  | 'Other';

export type LongTermPlanningLineStatus =
  | 'Feasible'
  | 'AtRisk'
  | 'Constrained'
  | 'NotProducible'
  | 'PendingData'
  | 'RequiresDecision';

export type PlanningScenarioStatus = 'Draft' | 'Compared' | 'Applied' | 'Discarded';

export type ExceptionSeverity = 'Info' | 'Warning' | 'Blocker';

export type ValidationSeverity = 'Warning' | 'Blocker';

export type PlanningViewMode = 'table' | 'calendar';

export type CalendarViewLevel = 'year' | 'month' | 'day';

export type CalendarPlanningEventType =
  | 'Holiday'
  | 'AnnualShutdown'
  | 'Blackout'
  | 'ReducedCapacity'
  | 'Maintenance'
  | 'Project'
  | 'SupplierTest'
  | 'MaterialTest'
  | 'Validation'
  | 'EngineeringEvent'
  | 'CapacityOverload'
  | 'AtRisk'
  | 'ConstrainedDemand'
  | 'UncoveredDemand';

export type CalendarPlanningEventSource = 'Plan' | 'Capacity' | 'Calendar' | 'Scenario' | 'Manual';

export type CalendarPlanningImpact = {
  requestedQuantity: number;
  committedQuantity: number;
  uncoveredQuantity: number;
  requiredHours: number;
  availableHours: number;
  utilizationPercent: number;
};

export type CalendarPlanningEvent = {
  id: string;
  title: string;
  type: CalendarPlanningEventType;
  date: string;
  startDate: string;
  endDate: string;
  month: string;
  site?: string;
  lineId?: string | null;
  productCode?: string;
  severity: ExceptionSeverity;
  description: string;
  source: CalendarPlanningEventSource;
  impact: CalendarPlanningImpact;
};

export type CalendarMonthSummary = {
  month: string;
  year: number;
  requestedQuantity: number;
  committedQuantity: number;
  uncoveredQuantity: number;
  requiredHours: number;
  availableHours: number;
  utilizationPercent: number;
  totalPlanningRows: number;
  feasibleCount: number;
  atRiskCount: number;
  constrainedCount: number;
  pendingDataCount: number;
  notProducibleCount: number;
  eventCount: number;
  blockerCount: number;
  warningCount: number;
  topConstraints: string[];
};

export type CalendarDaySummary = {
  date: string;
  requestedQuantity: number;
  committedQuantity: number;
  uncoveredQuantity: number;
  requiredHours: number;
  availableHours: number;
  utilizationPercent: number;
  eventCount: number;
  blockerCount: number;
  warningCount: number;
  events: CalendarPlanningEvent[];
  planningRows: LongTermPlanRowView[];
  affectedProducts: string[];
  affectedLines: string[];
  constraints: string[];
  suggestedActions: string[];
  highestSeverity: ExceptionSeverity;
  fallbackMessage?: string;
};

export type CalendarFiltersState = {
  eventType: CalendarPlanningEventType | '';
  severity: ExceptionSeverity | '';
  source: CalendarPlanningEventSource | '';
  impactType:
    | ''
    | 'requestedQuantity'
    | 'committedQuantity'
    | 'uncoveredQuantity'
    | 'requiredHours'
    | 'availableHours'
    | 'utilizationPercent';
};

export type LongTermPlan = {
  id: string;
  name: string;
  site: string;
  horizonStartMonth: string;
  horizonEndMonth: string;
  version: string;
  source: string;
  status: LongTermPlanStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  releasedBy?: string;
  releasedAt?: string;
  sourceTimestamp: string;
  notes?: string;
};

export type LongTermPlanLine = {
  id: string;
  planId: string;
  productCode: string;
  productDescription: string;
  productFamily: string;
  uom: string;
  month: string;
  requestedQuantity: number;
  committedQuantity?: number | null;
  assignedLineId?: string | null;
  demandSource: DemandSource;
  status: LongTermPlanningLineStatus;
  constraintReason?: string;
  plannerComment?: string;
  isEdited?: boolean;
};

export type ProductionLineMonth = {
  month: string;
  availableHours: number;
  plannedDowntimeHours: number;
  calendarNotes?: string;
};

export type ProductionLine = {
  id: string;
  name: string;
  area: string;
  active: boolean;
  monthlyAvailableHours: ProductionLineMonth[];
};

export type ProductLineCapability = {
  productCode: string;
  lineId: string;
  productionRateUnitsPerHour?: number | null;
  minLotSize?: number;
  maxLotSize?: number;
  preferredLotSize?: number;
  active: boolean;
  notes?: string;
};

export type CapacityResult = {
  planLineId: string;
  month: string;
  productCode: string;
  lineId?: string | null;
  requestedQuantity: number;
  committedQuantity: number;
  productionRateUnitsPerHour?: number | null;
  requiredHours: number;
  availableHours: number;
  remainingHours: number;
  utilizationPercent: number;
  uncoveredQuantity: number;
  status: LongTermPlanningLineStatus;
  reason?: string;
};

export type ScenarioLineChange = {
  planLineId: string;
  committedQuantity?: number | null;
  assignedLineId?: string | null;
  plannerComment?: string;
};

export type PlanningScenario = {
  id: string;
  planId: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  assumptions: string;
  status: PlanningScenarioStatus;
  changedLines: ScenarioLineChange[];
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

export type ValidationMessage = {
  id: string;
  severity: ValidationSeverity;
  code: string;
  message: string;
  planLineId?: string;
  productCode?: string;
  month?: string;
  field?: string;
  lineId?: string;
  affectedLineIds?: string[];
  affectedFields?: string[];
  statusHint?: LongTermPlanningLineStatus;
};

export type ValidationSummary = {
  status: 'Valid' | 'Warning' | 'Invalid';
  errors: ValidationMessage[];
  warnings: ValidationMessage[];
  affectedLineIds: string[];
  affectedFields: string[];
};

export type PlanningException = {
  id: string;
  severity: ExceptionSeverity;
  product: string;
  month: string;
  line?: string;
  reason: string;
  suggestedAction: string;
  planLineId?: string;
};

export type LongTermPlanningFiltersState = {
  productFamily: string;
  search: string;
  productionLine: string;
  status: string;
  demandSource: string;
  monthStart: string;
  monthEnd: string;
  onlyExceptions: boolean;
};

export type LongTermPlanRowView = LongTermPlanLine & {
  assignedLineName: string;
  requiredHours: number;
  availableHours: number;
  utilizationPercent: number;
  uncoveredQuantity: number;
  status: LongTermPlanningLineStatus;
  pendingChanges: boolean;
  hasExceptions: boolean;
  validationMessages: ValidationMessage[];
  capacityResult?: CapacityResult;
};

export type CapacitySummary = {
  totalRequiredHours: number;
  totalAvailableHours: number;
  remainingHours: number;
  averageUtilizationPercent: number;
  feasibleItems: number;
  constrainedItems: number;
  atRiskItems: number;
  pendingDataItems: number;
  notProducibleItems: number;
  requiresDecisionItems: number;
};

export type ScenarioComparisonRow = {
  planLineId: string;
  productCode: string;
  month: string;
  baselineCommittedQuantity: number;
  scenarioCommittedQuantity: number;
  baselineStatus: LongTermPlanningLineStatus;
  scenarioStatus: LongTermPlanningLineStatus;
  baselineUtilization: number;
  scenarioUtilization: number;
  uncoveredQuantityDelta: number;
  requiredHoursDelta: number;
};

export type LongTermPlanningMockBundle = {
  plan: LongTermPlan;
  planLines: LongTermPlanLine[];
  productionLines: ProductionLine[];
  capabilities: ProductLineCapability[];
  calendarEvents: CalendarPlanningEvent[];
};

export type PlanHealthSummary = {
  totalRequestedQuantity: number;
  totalCommittedQuantity: number;
  commitmentGap: number;
  averageUtilizationPercent: number;
  feasibleItems: number;
  atRiskItems: number;
  constrainedItems: number;
  pendingDataItems: number;
  notProducibleItems: number;
  requiresDecisionItems: number;
  overloadedLineMonths: number;
  highestUtilizationMonth: string;
};
