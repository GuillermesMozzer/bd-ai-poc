export type WorkOrderPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type WorkOrderStatus =
  | 'Planned'
  | 'Ready'
  | 'Released'
  | 'Running'
  | 'Paused'
  | 'Completed'
  | 'Blocked'
  | 'Cancelled';

export type ReadinessStatus = 'Ready' | 'Warning' | 'Blocked' | 'NotChecked';

export type ReadinessCategory =
  | 'Material'
  | 'Machine'
  | 'Labor'
  | 'Quality'
  | 'Documentation'
  | 'Tooling'
  | 'WarehouseStaging'
  | 'Schedule'
  | 'BatchLot';

export type ReadinessSeverity = 'Info' | 'Warning' | 'Blocker';
export type ExceptionStatus = 'Open' | 'Acknowledged' | 'Resolved';
export type RecommendedActionStatus = 'Open' | 'InProgress' | 'Done';
export type RecommendedActionPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type RecommendedActionEffort = 'Low' | 'Medium' | 'High';

export type ReleaseRecommendation =
  | 'Ready to Release'
  | 'Ready with Warnings'
  | 'Do Not Release'
  | 'Readiness Not Checked';

export type WorkOrder = {
  id: string;
  woNumber: string;
  batchNumber: string;
  productCode: string;
  productDescription: string;
  productFamily: string;
  quantityRequired: number;
  quantityProduced: number;
  quantityRemaining: number;
  uom: string;
  dueDate: string;
  plannedStartDate: string;
  plannedEndDate: string;
  assignedLineId: string;
  assignedLineName: string;
  machineId: string;
  machineName: string;
  shift: string;
  crew: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  readinessStatus: ReadinessStatus;
  materialStatus: ReadinessStatus;
  machineStatus: ReadinessStatus;
  laborStatus: ReadinessStatus;
  qualityStatus: ReadinessStatus;
  documentationStatus: ReadinessStatus;
  scheduleStatus: ReadinessStatus;
  toolingStatus: ReadinessStatus;
  warehouseStatus: ReadinessStatus;
  exceptionCount: number;
  owner: string;
  lastCheckedAt: string | null;
  plannerComment: string;
};

export type WorkOrderReadinessCheck = {
  id: string;
  workOrderId: string;
  category: ReadinessCategory;
  status: ReadinessStatus;
  title: string;
  description: string;
  details: string;
  owner: string;
  lastCheckedAt: string | null;
  requiredAction: string;
  canOverride: boolean;
  severity: ReadinessSeverity;
};

export type MaterialReadinessItem = {
  id: string;
  workOrderId: string;
  componentCode: string;
  componentDescription: string;
  requiredQuantity: number;
  systemAvailableQuantity: number;
  physicallyConfirmedQuantity: number;
  stagedQuantity: number;
  uom: string;
  location: string;
  lotNumber: string;
  expiryDate: string;
  qualityStatus: 'Clear' | 'Hold' | 'Blocked' | 'InspectionRequired';
  status: 'Ready' | 'Warning' | 'Blocked';
  issue: string;
};

export type MachineReadinessItem = {
  id: string;
  workOrderId: string;
  lineId: string;
  machineId: string;
  machineName: string;
  requiredWindowStart: string;
  requiredWindowEnd: string;
  machineStatus: 'Available' | 'Down' | 'Maintenance' | 'Changeover' | 'Unknown';
  plannedDowntimeStart: string | null;
  plannedDowntimeEnd: string | null;
  capacityImpactHours: number;
  alternativeLineId: string | null;
  alternativeLineName: string | null;
  status: 'Ready' | 'Warning' | 'Blocked';
  issue: string;
};

export type LaborReadinessItem = {
  id: string;
  workOrderId: string;
  requiredCrew: number;
  availableCrew: number;
  requiredQualifiedOperators: number;
  availableQualifiedOperators: number;
  requiredSkill: string;
  shift: string;
  capacitySupportedPercent: number;
  status: 'Ready' | 'Warning' | 'Blocked';
  issue: string;
};

export type QualityReadinessItem = {
  id: string;
  workOrderId: string;
  qualityStatus: 'Clear' | 'Hold' | 'InspectionRequired' | 'NonconformanceOpen';
  openQnCount: number;
  openDeviationCount: number;
  batchReleaseDependency: string;
  requiredInspection: string;
  status: 'Ready' | 'Warning' | 'Blocked';
  issue: string;
};

export type DocumentationReadinessItem = {
  id: string;
  workOrderId: string;
  documentName: string;
  documentType: 'SOP' | 'DHR' | 'WorkInstruction' | 'Checklist' | 'Specification' | 'Other';
  requiredVersion: string;
  availableVersion: string;
  lifecycleStatus: 'Approved' | 'InReview' | 'Expired' | 'Missing' | 'UnderRevision';
  eSignatureRequired: boolean;
  status: 'Ready' | 'Warning' | 'Blocked';
  issue: string;
};

export type ToolingReadinessItem = {
  id: string;
  workOrderId: string;
  toolCode: string;
  toolDescription: string;
  requiredQuantity: number;
  availableQuantity: number;
  calibrationStatus: 'Valid' | 'Expired' | 'DueSoon' | 'Missing';
  status: 'Ready' | 'Warning' | 'Blocked';
  issue: string;
};

export type WarehouseStagingItem = {
  id: string;
  workOrderId: string;
  stagingArea: string;
  requiredMaterialsCount: number;
  stagedMaterialsCount: number;
  missingMaterialsCount: number;
  status: 'Ready' | 'Warning' | 'Blocked';
  issue: string;
};

export type ScheduleReadinessItem = {
  id: string;
  workOrderId: string;
  assignedLineId: string;
  plannedStartDate: string;
  plannedEndDate: string;
  dueDate: string;
  capacityUtilizationAfterRelease: number;
  conflictsCount: number;
  frozenPeriodImpact: string;
  status: 'Ready' | 'Warning' | 'Blocked';
  issue: string;
};

export type WorkOrderReadinessException = {
  id: string;
  workOrderId: string;
  category: ReadinessCategory;
  severity: ReadinessSeverity;
  reason: string;
  suggestedAction: string;
  owner: string;
  ageMinutes: number;
  status: ExceptionStatus;
  comment?: string;
};

export type RecommendedAction = {
  id: string;
  workOrderId: string;
  title: string;
  description: string;
  category:
    | 'ExpediteMaterial'
    | 'ConfirmPhysicalStock'
    | 'MoveToAlternativeLine'
    | 'AdjustLaborPlan'
    | 'RequestQualityRelease'
    | 'UpdateDocumentation'
    | 'StageMaterials'
    | 'ReviewSchedule'
    | 'HoldWorkOrder'
    | 'ProceedToRelease';
  priority: RecommendedActionPriority;
  effort: RecommendedActionEffort;
  expectedImpact: string;
  status: RecommendedActionStatus;
};

export type ReadinessAuditEvent = {
  id: string;
  workOrderId: string;
  timestamp: string;
  user: string;
  eventType: string;
  previousValue: string;
  newValue: string;
  comment: string;
};

export type WoReadinessFilters = {
  line: string;
  readinessStatus: ReadinessStatus | 'All';
  priority: WorkOrderPriority | 'All';
  search: string;
  dueDateFrom: string;
  dueDateTo: string;
  issueCategory: ReadinessCategory | 'All';
  showOnlyBlockers: boolean;
  showOnlyWarnings: boolean;
};

export type WoReadinessDetailTab =
  | 'Overview'
  | 'Checklist'
  | 'Materials'
  | 'Machine & Labor'
  | 'Quality & Docs'
  | 'Exceptions'
  | 'Actions'
  | 'History';

export type ReadinessSummaryCard = {
  key:
    | 'total'
    | 'ready'
    | 'warning'
    | 'blocked'
    | 'notChecked'
    | 'materialIssues'
    | 'machineIssues'
    | 'laborIssues'
    | 'qualityHolds'
    | 'documentationIssues';
  label: string;
  count: number;
  helperText: string;
  tone: 'neutral' | 'good' | 'warning' | 'danger' | 'info';
};

export type WoReadinessBundle = {
  siteName: string;
  siteLabel: string;
  workOrders: WorkOrder[];
  readinessChecks: WorkOrderReadinessCheck[];
  materialItems: MaterialReadinessItem[];
  machineItems: MachineReadinessItem[];
  laborItems: LaborReadinessItem[];
  qualityItems: QualityReadinessItem[];
  documentationItems: DocumentationReadinessItem[];
  toolingItems: ToolingReadinessItem[];
  warehouseItems: WarehouseStagingItem[];
  scheduleItems: ScheduleReadinessItem[];
  exceptions: WorkOrderReadinessException[];
  recommendedActions: RecommendedAction[];
  auditEvents: ReadinessAuditEvent[];
  selectedWorkOrderId: string;
  referenceNow: string;
};

export type WoReadinessState = WoReadinessBundle & {
  filters: WoReadinessFilters;
  activeDetailTab: WoReadinessDetailTab;
  releaseDialogOpen: boolean;
  commentDialogOpen: boolean;
};
