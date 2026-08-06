export type ScheduleVersionStatus = 'Draft' | 'Published' | 'Frozen' | 'Superseded' | 'Simulation';

export type ScheduleValidationStatus = 'Not Validated' | 'Valid' | 'Warning' | 'Blocked';

export type ScheduleApprovalStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';

export type ScheduleVersion = {
  id: string;
  scheduleNumber: string;
  versionNumber: string;
  scheduleVersionCode: string;
  cycleId: string;
  planningCycle: string;

  planningPeriodStart: string;
  planningPeriodEnd: string;

  status: ScheduleVersionStatus;
  approvalStatus: ScheduleApprovalStatus;
  validationStatus: ScheduleValidationStatus;
  isReadOnly: boolean;
  isApprovedBaseline: boolean;

  linkedMpsVersionId: string;
  linkedMrpSnapshotId: string;

  previousScheduleVersionId: string | null;

  createdBy: string;
  createdAt: string;
  publishedBy: string | null;
  publishedAt: string | null;
  frozenAt: string | null;

  changeReason: string;
  approvedBy: string | null;
  approvedAt: string | null;
  impactedWOs: string[];
  impactedLines: string[];
  impactedMaterials: string[];
  notes: string | null;
};

export type ScheduleItemReadinessStatus = 'Ready' | 'AtRisk' | 'Blocked';
export type ScheduleItemMaterialStatus = 'Available' | 'Shortage' | 'Partial';

export type ScheduleItem = {
  id: string;
  scheduleVersionId: string;
  mpsLineId: string;
  mrpMaterialLineIds: string[];
  workOrderId: string | null;
  materialId: string;
  itemCode: string;
  line: string;
  machine: string;
  sequence: number;
  scheduledStart: string;
  scheduledEnd: string;
  plannedQuantity: number;
  readinessStatus: ScheduleItemReadinessStatus;
  materialStatus: ScheduleItemMaterialStatus;
  hasDraftChanges: boolean;
};

export type ScheduleVersionCycleGroup = {
  cycleId: string;
  cycleLabel: string;
  versions: ScheduleVersion[];
};

export type ScheduleVersionKpi = {
  key: string;
  label: string;
  value: string | number;
  helperText: string;
  tone: 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  icon: 'baseline' | 'pending' | 'versions' | 'lines';
};

export type ScheduleVersionFiltersState = {
  cycleId: string;
  status: string;
  approvalStatus: string;
  validationStatus: string;
  linkedMpsVersionId: string;
  dateFrom: string;
  dateTo: string;
  search: string;
};
