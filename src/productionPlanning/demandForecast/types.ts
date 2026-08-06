export type ForecastApprovalStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';
export type ForecastVersionType = 'Baseline' | 'Revised';

export type ForecastVersion = {
  id: string;
  cycleId: string;
  cycleLabel: string;
  versionType: ForecastVersionType;
  importedAt: string;
  sourceSystem: string;
  importedBy: string;
  approvedBy: string | null;
  approvalStatus: ForecastApprovalStatus;
  approvalDate: string | null;
  changeReason: string;
  impactedMaterials: string[];
  impactedWOs: string[];
  impactedLines: string[];
  notes: string | null;
  linkedMpsVersionIds: string[];
};

export type ApprovalEventType = 'Imported' | 'Submitted' | 'Approved' | 'Rejected' | 'Revised';

export type ApprovalHistoryEvent = {
  id: string;
  versionId: string;
  eventType: ApprovalEventType;
  actor: string;
  timestamp: string;
  comment: string | null;
};

export type ForecastKpi = {
  key: string;
  label: string;
  value: string | number;
  helperText: string;
  tone: 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  icon: 'version' | 'pending' | 'revisions' | 'lines';
};

export type ForecastFiltersState = {
  cycleId: string;
  versionType: string;
  approvalStatus: string;
  dateFrom: string;
  dateTo: string;
  search: string;
};

export type CycleGroup = {
  cycleId: string;
  cycleLabel: string;
  versions: ForecastVersion[];
};
