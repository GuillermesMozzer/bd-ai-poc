// ─── Enums / Union Types ──────────────────────────────────────────────────────

export type WOLifecycleStatus =
  | 'Draft'
  | 'Planned'
  | 'Scheduled'
  | 'ReadyForRelease'
  | 'Released'
  | 'InExecution'
  | 'OnHold'
  | 'Completed'
  | 'Closed'
  | 'Cancelled';

export type WOReadinessStatus = 'Ready' | 'Warning' | 'Blocked' | 'NotApplicable';

export type WORiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type WOExceptionType =
  | 'Material'
  | 'Machine'
  | 'Labor'
  | 'Quality'
  | 'Documentation'
  | 'Warehouse'
  | 'Sterilization'
  | 'StaleData'
  | 'DelayedStart'
  | 'OnHold'
  | 'ReleaseBlocked';

export type WOReadinessCategory =
  | 'Material'
  | 'Machine'
  | 'Labor'
  | 'Documentation'
  | 'Quality'
  | 'Warehouse'
  | 'Sterilization'
  | 'Schedule'
  | 'BatchLot';

export type WODataSource =
  | 'ERP'
  | 'MES'
  | 'ReadinessEngine'
  | 'Warehouse'
  | 'Quality'
  | 'Maintenance'
  | 'Sterilization'
  | 'ManualUserAction'
  | 'AICopilot';

export type WOAuditEventType =
  | 'Created'
  | 'StatusChanged'
  | 'FieldUpdated'
  | 'ReadinessCalculated'
  | 'ExceptionAdded'
  | 'ExceptionResolved'
  | 'CommentAdded'
  | 'OwnerAssigned'
  | 'DataRefreshed'
  | 'AIRecommendationAccepted'
  | 'AIRecommendationRejected'
  | 'OverrideApplied'
  | 'ActionExecuted';

export type WOUserDecision = 'Accepted' | 'Rejected' | 'Ignored' | 'Pending';
export type WOConversationRole = 'user' | 'assistant' | 'system';
export type WOConversationKind = 'summary' | 'question' | 'answer' | 'action' | 'note';

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface WOReadinessCheck {
  category: WOReadinessCategory;
  status: WOReadinessStatus;
  reason: string;
  lastChecked: string;
  source: WODataSource;
  details?: string;
}

export interface WOMaterialItem {
  materialCode: string;
  description: string;
  requiredQty: number;
  availableQty: number;
  shortageQty: number;
  uom: string;
  storageLocation: string;
  batch: string;
  expectedReplenishment?: string;
  stagingReady: boolean;
  missingStock: boolean;
  cycleCountRecommended: boolean;
}

export interface WOQuality {
  status: 'Released' | 'OnHold' | 'Pending' | 'Rejected';
  inspections: number;
  deviations: number;
  holds: number;
  releaseConfidence: number;
  expectedReleaseDate?: string;
  comments?: string;
}

export interface WOSterilization {
  required: boolean;
  readiness: WOReadinessStatus;
  dwellDeadline?: string;
  slotStatus: 'Confirmed' | 'Pending' | 'Unavailable' | 'NotRequired';
  vendorCapacity: 'Available' | 'Limited' | 'Unavailable';
  internalCapacity: 'Available' | 'Limited' | 'Unavailable';
  riskLevel: WORiskLevel;
  relatedBatchStatus?: string;
}

export interface WOException {
  id: string;
  type: WOExceptionType;
  severity: WORiskLevel;
  reason: string;
  detectedAt: string;
  impact: string;
  owner?: string;
  acknowledged: boolean;
  resolvedAt?: string;
  aiRecommendation?: string;
  aiRecommendationId?: string;
}

export interface WOAIRecommendation {
  id: string;
  woId: string;
  text: string;
  dataUsed: string[];
  confidence: number;
  impact: string;
  suggestedAction: string;
  userDecision: WOUserDecision;
  confirmedBy?: string;
  timestamp: string;
  reasonCode?: string;
  appliedAction?: string;
}

export interface WOAuditEvent {
  id: string;
  woId: string;
  timestamp: string;
  eventType: WOAuditEventType;
  field?: string;
  previousValue?: string;
  newValue?: string;
  changedBy: string;
  source: WODataSource;
  reasonCode?: string;
  comment?: string;
  aiRecommendationId?: string;
}

export interface WOConversationMessage {
  id: string;
  woId: string;
  role: WOConversationRole;
  kind: WOConversationKind;
  text: string;
  timestamp: string;
  actionLabel?: string;
  reasonCode?: string;
  status?: 'Prepared' | 'Confirmed' | 'Cleared';
}

export interface WOGanttEvent {
  id: string;
  machineId: string;
  type: 'Maintenance' | 'Downtime' | 'LowOEE' | 'Normal' | 'Changeover' | 'Cleaning';
  label: string;
  startTime: string;
  endTime: string;
  oeeValue?: number;
}

export interface WorkOrder {
  woId: string;
  materialCode: string;
  materialDescription: string;
  batch: string;
  line: string;
  machine: string;
  machineId: string;
  lifecycleStatus: WOLifecycleStatus;
  readinessStatus: WOReadinessStatus;
  releaseStatus: 'NotReleased' | 'PendingRelease' | 'Released' | 'ReleaseBlocked';
  qualityStatus: 'Released' | 'OnHold' | 'Pending' | 'Rejected';
  riskLevel: WORiskLevel;
  scheduledStart: string;
  scheduledEnd: string;
  actualStart?: string;
  actualEnd?: string;
  plannedQty: number;
  completedQty: number;
  scrapQty: number;
  progressPct: number;
  uom: string;
  currentBlocker?: string;
  owner?: string;
  sourceSystem: WODataSource;
  sourceTimestamp: string;
  dataFreshness: 'Fresh' | 'Stale' | 'VeryStale';
  dataFreshnessHours: number;
  aiRiskScore: number;
  aiRecommendation?: string;
  sterilizationRequired: boolean;
  campaign?: string;
  customerRef?: string;
  shift: 'Morning' | 'Afternoon' | 'Night';
  readinessChecks: WOReadinessCheck[];
  materials: WOMaterialItem[];
  quality: WOQuality;
  sterilization?: WOSterilization;
  exceptions: WOException[];
  aiRecommendations: WOAIRecommendation[];
  auditEvents: WOAuditEvent[];
  bluAiHistory: WOConversationMessage[];
  currentOperation?: string;
  delayReason?: string;
  comments?: string;
}

// ─── Filters & State ──────────────────────────────────────────────────────────

export interface WOFilters {
  search: string;
  lifecycleStatus: WOLifecycleStatus[];
  readinessStatus: WOReadinessStatus[];
  riskLevel: WORiskLevel[];
  line: string[];
  machine: string[];
  shift: string[];
  dateFrom: string;
  dateTo: string;
  savedView: string;
  showExceptionsOnly: boolean;
  dataFreshness: string[];
}

export interface WOSavedView {
  id: string;
  label: string;
  filters: Partial<WOFilters>;
}

export interface WOSummary {
  total: number;
  draft: number;
  planned: number;
  scheduled: number;
  readyForRelease: number;
  released: number;
  inExecution: number;
  onHold: number;
  completed: number;
  closed: number;
  cancelled: number;
  blocked: number;
  critical: number;
  staleData: number;
  withExceptions: number;
}

export type WOMainTab = 'all' | 'board' | 'timeline' | 'calendar' | 'exceptions' | 'history';

export type BatchRowStatus = 'Valid' | 'Error' | 'Warning';

export interface BatchCreateRow {
  rowIndex: number;
  woId: string;
  materialCode: string;
  materialDescription: string;
  batch: string;
  line: string;
  machine: string;
  scheduledStart: string;
  scheduledEnd: string;
  plannedQty: number;
  uom: string;
  status: BatchRowStatus;
  errors: string[];
  warnings: string[];
}
