// ── MRP Versioning Types ──────────────────────────────────────────────────────

export type MrpApprovalStatus = 'Draft' | 'Pending Approval' | 'Approved' | 'Rejected';

export type MrpType = 'Official' | 'Simulation';

export type MrpVersion = {
  id: string;
  planningCycle: string;
  cycleId: string;
  parentMpsVersionId: string;
  mrpType: MrpType;
  effectivePeriodStart: string;
  effectivePeriodEnd: string;
  generatedAt: string;
  generatedBy: string;
  approvalStatus: MrpApprovalStatus;
  approvedBy: string | null;
  approvedAt: string | null;
  isApprovedBaseline: boolean;
  changeReason: string;
  previousValues: Record<string, unknown>;
  impactedMaterials: string[];
  impactedWOs: string[];
  impactedLines: string[];
  linkedForecastVersionIds: string[];
  notes: string | null;
};

export type MrpVersionAuditEventType =
  | 'Generated'
  | 'Submitted'
  | 'Approved'
  | 'Rejected'
  | 'SetAsBaseline'
  | 'Superseded';

export type MrpVersionAuditEvent = {
  id: string;
  versionId: string;
  eventType: MrpVersionAuditEventType;
  actor: string;
  timestamp: string;
  comment: string | null;
  previousValue?: string;
  newValue?: string;
};

export type MrpVersionKpi = {
  key: string;
  label: string;
  value: string | number;
  helperText: string;
  tone: 'success' | 'warning' | 'info' | 'neutral' | 'danger';
  icon: 'baseline' | 'pending' | 'versions' | 'lines' | 'simulation';
};

export type MrpVersionFiltersState = {
  cycleId: string;
  approvalStatus: string;
  mrpType: string;
  isBaseline: string;
  parentMpsVersionId: string;
  dateFrom: string;
  dateTo: string;
  search: string;
};

export type MrpVersionCycleGroup = {
  cycleId: string;
  cycleLabel: string;
  versions: MrpVersion[];
};
