export type DailyProductionReportStatus = 'Draft' | 'Saved' | 'Submitted' | 'Approved';

export type ProductionLineLifecycleStatus =
  | 'Running'
  | 'Stopped'
  | 'Idle'
  | 'PlannedDown'
  | 'Maintenance'
  | 'Complete';

export type DowntimeCategory =
  | 'Machine'
  | 'Material'
  | 'Labor'
  | 'Changeover'
  | 'Quality'
  | 'Maintenance'
  | 'Rework'
  | 'Other';

export type NoteCategory =
  | 'Production'
  | 'Downtime'
  | 'Material'
  | 'Quality'
  | 'Safety'
  | 'Labor'
  | 'Planning'
  | 'Other';

export type SeverityLevel = 'Info' | 'Warning' | 'Critical';

export type PerformanceStatusTone = 'green' | 'orange' | 'red' | 'gray' | 'blue';

export type DailyProductionReport = {
  id: string;
  reportDate: string;
  site: string;
  shift: string;
  planner: string;
  supervisor: string;
  reportStatus: DailyProductionReportStatus;
  lastUpdatedAt: string;
  lastSavedAt: string | null;
  submittedAt: string | null;
  notes: string;
};

export type ProductionLineStatus = {
  id: string;
  reportId: string;
  lineId: string;
  lineName: string;
  lineDescription: string;
  status: ProductionLineLifecycleStatus;
  productCode: string;
  productDescription: string;
  campaign: string;
  planUnits: number;
  actualUnits: number;
  achievementPercent: number | null;
  varianceUnits: number;
  oeePercent: number | null;
  qualityYieldPercent: number | null;
  ordersOnTimePercent: number | null;
  downtimeMinutes: number;
  reasonForGap: string;
  supervisor: string;
  lastUpdatedAt: string;
};

export type DowntimeEvent = {
  id: string;
  reportId: string;
  lineId: string;
  lineName: string;
  reason: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  impactUnits: number | null;
  category: DowntimeCategory;
  severity: SeverityLevel;
  comment: string;
};

export type DailyProductionKpi = {
  totalLines: number;
  activeLines: number;
  stoppedLines: number;
  idleLines: number;
  totalPlanUnits: number;
  totalActualUnits: number;
  totalVarianceUnits: number;
  planAchievementPercent: number;
  onTimeOrdersPercent: number | null;
  qualityYieldPercent: number | null;
  totalDowntimeMinutes: number;
  safetyIncidents: number;
  oeePercent: number | null;
};

export type ProductionNote = {
  id: string;
  reportId: string;
  category: NoteCategory;
  message: string;
  severity: SeverityLevel;
  createdBy: string;
  createdAt: string;
};

export type ProductionTrendPoint = {
  id: string;
  lineId: string;
  lineName: string;
  planUnits: number;
  actualUnits: number;
  achievementPercent: number | null;
  oeePercent: number | null;
  qualityYieldPercent: number | null;
};

export type DailyProductionAuditEvent = {
  id: string;
  reportId: string;
  timestamp: string;
  user: string;
  eventType: string;
  previousValue: string;
  newValue: string;
  comment: string;
};

export type DailyProductionLineFilters = {
  status: 'All' | ProductionLineLifecycleStatus;
  lineId: 'All' | string;
  productSearch: string;
  showOnlyGaps: boolean;
  showStoppedLinesOnly: boolean;
};

export type DailyProductionStatusDemoBundle = {
  report: DailyProductionReport;
  productionLineStatuses: ProductionLineStatus[];
  downtimeEvents: DowntimeEvent[];
  notes: ProductionNote[];
  auditEvents: DailyProductionAuditEvent[];
  lastRefreshAt: string;
  autoRefreshEnabled: boolean;
  safetyIncidents: number;
};
