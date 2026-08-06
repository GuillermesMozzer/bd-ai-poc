export type TimelineShortcut = 'Today' | 'ThreeDays' | 'SevenDays' | 'FifteenDays' | 'OneMonth' | 'Custom';

export type TimelineViewMode = 'timeline';

export type SchedulingLineStatus = 'Available' | 'Running' | 'Maintenance' | 'Down' | 'Overloaded' | 'Idle' | 'AtRisk';
export type ScheduledWorkOrderStatus = 'Planned' | 'Ready' | 'Released' | 'Running' | 'Completed' | 'Blocked' | 'Paused' | 'OnHold';
export type ReadinessStatus = 'Ready' | 'Warning' | 'Blocked' | 'NotChecked';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type TimelineSeverity = 'Info' | 'Warning' | 'Blocker';
export type TimelineRiskLevel = 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
export type MachineType =
  | 'Filler'
  | 'Sealer'
  | 'Labeler'
  | 'Packer'
  | 'Sterilizer'
  | 'Inspector'
  | 'Printer'
  | 'Robot'
  | 'Conveyor'
  | 'Tester'
  | 'Washer'
  | 'Dryer'
  | 'Other';
export type MachineStatus = 'Running' | 'Available' | 'Down' | 'Maintenance' | 'Idle' | 'Setup' | 'Blocked' | 'AtRisk';
export type TimelineEventStatus =
  | 'Planned'
  | 'Ready'
  | 'Released'
  | 'Running'
  | 'Completed'
  | 'Paused'
  | 'On Hold'
  | 'Cancelled'
  | 'Warning'
  | 'Blocker';

export type TimelineDateRange = {
  startDate: string;
  endDate: string;
  shortcut: TimelineShortcut;
};

export type TimelineHourColumn = {
  id: string;
  date: string;
  hour: number;
  startDateTime: string;
  endDateTime: string;
  dayLabel: string;
  hourLabel: string;
};

export type TimelineDayGroup = {
  id: string;
  date: string;
  dayLabel: string;
  startColumnIndex: number;
  columnSpan: number;
};

export type TimelineSelection =
  | {kind: 'workOrder'; id: string}
  | {kind: 'event'; id: string}
  | {kind: 'machine'; id: string}
  | null;

export type SchedulingTimelineLine = {
  id: string;
  name: string;
  area: string;
  status: SchedulingLineStatus;
  utilizationPercent: number;
  availableHours: number;
  plannedHours: number;
  currentWorkOrderId?: string;
  riskLevel?: TimelineRiskLevel;
  riskReason?: string;
  machineCount?: number;
  notes?: string;
};

export type ScheduledWorkOrder = {
  id: string;
  woNumber: string;
  batchNumber: string;
  productCode: string;
  productDescription: string;
  productFamily: string;
  quantity: number;
  uom: string;
  lineId: string;
  plannedStartDateTime: string;
  plannedEndDateTime: string;
  durationHours: number;
  status: ScheduledWorkOrderStatus;
  readinessStatus: ReadinessStatus;
  priority: PriorityLevel;
  exceptionCount: number;
  machineId?: string;
  machineName?: string;
  machineType?: MachineType;
  operationName?: string;
  operationSequence?: number;
  setupRequired?: boolean;
  setupMinutes?: number;
  changeoverGroup?: string;
  materialRisk?: Exclude<TimelineRiskLevel, 'Critical'>;
  qualityRisk?: Exclude<TimelineRiskLevel, 'Critical'>;
  laborRisk?: Exclude<TimelineRiskLevel, 'Critical'>;
  progressPercent?: number;
  aiSequenceRecommendation?: string;
  notes?: string;
  constraintReason?: string;
  plannerComment?: string;
};

export type MachineWorkOrder = ScheduledWorkOrder & {
  machineId: string;
  machineName: string;
  machineType: MachineType;
  operationName: string;
  operationSequence: number;
  setupRequired: boolean;
  setupMinutes: number;
  changeoverGroup: string;
  materialRisk: Exclude<TimelineRiskLevel, 'Critical'>;
  qualityRisk: Exclude<TimelineRiskLevel, 'Critical'>;
  laborRisk: Exclude<TimelineRiskLevel, 'Critical'>;
  progressPercent: number;
};

export type ProductionMachine = {
  id: string;
  lineId: string;
  name: string;
  description: string;
  machineType: MachineType;
  status: MachineStatus;
  utilizationPercent: number;
  currentWorkOrderId: string | null;
  riskLevel: TimelineRiskLevel;
  riskReason: string;
  capacityRatePerHour: number;
  notes?: string;
};

export type TimelineRow = {
  id: string;
  rowType: 'Line' | 'Machine';
  parentLineId: string;
  label: string;
  subLabel: string;
  status: string;
  utilizationPercent: number;
  riskLevel: TimelineRiskLevel;
  depth: number;
  isExpanded: boolean;
  machineCount: number;
  currentWorkOrderId?: string | null;
  dataRef: SchedulingTimelineLine | ProductionMachine;
};

export type TimelineCategoryConfig = {
  name: string;
  color: string;
  eventTypes: string[];
};

export type SelectedEventTypesState = Record<string, Record<string, boolean>>;

export type TimelineEvent = {
  id: string;
  lineId: string;
  lineName: string;
  machineId?: string;
  machineName?: string;
  category: string;
  eventType: string;
  status: TimelineEventStatus;
  severity: TimelineSeverity;
  startDateTime: string;
  endDateTime: string;
  description: string;
  source: string;
  reasonCode: string;
  recommendedActions: string[];
  relatedWorkOrderId?: string;
  workOrderId?: string;
  productCode?: string;
  productDescription?: string;
  batch?: string;
  progress?: number;
};

export type TimelineFiltersState = {
  lineId: string;
  status: string;
  priority: string;
  impact: string;
  productSearch: string;
  showConflictsOnly: boolean;
  showExceptionsOnly: boolean;
};

export type TimelineBarPosition = {
  startColumnIndex: number;
  columnSpan: number;
  left: number;
  width: number;
  isClippedStart: boolean;
  isClippedEnd: boolean;
  visible: boolean;
};

export type TimelineConflictMap = {
  workOrderConflicts: Record<string, string[]>;
  eventConflicts: Record<string, string[]>;
  lineConflictCounts: Record<string, number>;
  machineConflictCounts?: Record<string, number>;
};

export type TimelineLineLoadSummaryItem = {
  lineId: string;
  plannedHours: number;
  availableHours: number;
  utilizationPercent: number;
  conflictCount: number;
  exceptionCount: number;
};

export type TimelineSelectionSummary = {
  allSelected: boolean;
  noneSelected: boolean;
  someSelected: boolean;
  selectedCountByCategory: Record<string, number>;
  totalCountByCategory: Record<string, number>;
  totalSelectedCount: number;
  totalEventTypeCount: number;
};

export type TimelineStackLane = {
  id: string;
  laneIndex: number;
};
