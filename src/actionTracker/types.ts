export type ActionTrackerStatus = 'Open' | 'In Progress' | 'Under Approval' | 'Completed' | 'Canceled' | 'Overdue' | 'Reopened';
export type ActionTrackerPriority = 'High' | 'Medium' | 'Low';
export type ActionTrackerCategory = 'QUALITY' | 'COST' | 'PEOPLE' | 'DELIVERY' | 'SAFETY';
export type ActionTrackerType = 'Corrective' | 'Preventive' | 'BBS' | 'Near Miss' | 'Condition Report';
export type ActionTrackerSource =
  | 'ESO'
  | 'Maintenance'
  | 'TMS 1'
  | 'TMS 2'
  | 'TMS 3'
  | 'Tier'
  | 'Action Tracker'
  | 'BLU.AI'
  | 'Document Flow'
  | 'Shift Logbook'
  | 'CILT'
  | 'Tier 1'
  | 'Tier 2'
  | 'Tier 3';
export type ActionTrackerRecurrenceUnit = 'Daily' | 'Weekly' | 'Monthly';

export type ActionTrackerRecurrence = {
  interval: number;
  unit: ActionTrackerRecurrenceUnit;
  startsOn?: string;
  endsOn?: string;
};

export type ActionTrackerWorkflowEventStatus = 'Completed' | 'Cancelled';

export type ActionTrackerReassignmentHistoryEntry = {
  id: string;
  actionReference: string;
  previousOwner: string;
  newOwner: string;
  changedBy: string;
  timestamp: string;
  timestampMs: number;
  justification?: string;
  eventStatus: ActionTrackerWorkflowEventStatus;
};

export type ActionTrackerDueDateExtensionHistoryEntry = {
  id: string;
  actionReference: string;
  originalDueDate: string;
  newDueDate: string;
  changedBy: string;
  timestamp: string;
  timestampMs: number;
  justification?: string;
  eventStatus: ActionTrackerWorkflowEventStatus;
};

export type ActionTrackerAttachment = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  dataUrl: string;
};

export type ActionTrackerRecordType = 'MainAction';

export type ActionTrackerRow = {
  id: string;
  externalId?: string;
  recordType?: ActionTrackerRecordType;
  creationDate: string;
  createdAtMs?: number;
  source: string;
  title: string;
  problem: string;
  type: ActionTrackerType;
  category: ActionTrackerCategory;
  plant?: string;
  area?: string;
  unit?: string;
  line?: string;
  zone?: string;
  machine?: string;
  location: string;
  createdBy: string;
  assignedTo: string;
  reviewer: string;
  approver: string;
  dueDate: string;
  priority: ActionTrackerPriority;
  shift: string;
  status: ActionTrackerStatus;
  suggestedActions: string;
  supportNeeded: string;
  recurrence?: ActionTrackerRecurrence | null;
  aiAssisted: boolean;
  implementedSolution?: string;
  attachments?: ActionTrackerAttachment[];
  implementationAttachments?: ActionTrackerAttachment[];
  cancellationJustification?: string;
  dueDateExtensionCount?: number;
  dueDateExtensionLastUpdatedAtMs?: number;
  dueDateExtensionHistory?: ActionTrackerDueDateExtensionHistoryEntry[];
  reassignmentCount?: number;
  reassignmentLastUpdatedAtMs?: number;
  reassignmentHistory?: ActionTrackerReassignmentHistoryEntry[];
  originRecordId?: string;
  originRecordLabel?: string;
  originScreen?: string;
  tierLevel?: string;
  meetingDate?: string;
};

export type ActionTrackerCreateDraft = {
  title: string;
  problem: string;
  type: ActionTrackerType | '';
  category: ActionTrackerCategory | '';
  plant: string;
  area: string;
  unit: string;
  line: string;
  zone: string;
  machine: string;
  priority: ActionTrackerPriority | '';
  location: string;
  dueDate: string;
  createdBy: string;
  assignedTo: string;
  approver: string;
  supportNeeded: boolean;
  supportOwner: string;
  aiAssisted: boolean;
  attachments: ActionTrackerAttachment[];
  source?: string;
  originRecordId?: string;
  originRecordLabel?: string;
  originScreen?: string;
  tierLevel?: string;
  meetingDate?: string;
  createdAtMs?: number;
};

export type ActionTrackerCreateContext = {
  source: ActionTrackerSource | string;
  title?: string;
  problem?: string;
  type?: ActionTrackerType;
  category?: ActionTrackerCategory;
  plant?: string;
  area?: string;
  unit?: string;
  line?: string;
  zone?: string;
  machine?: string;
  location?: string;
  dueDate?: string;
  createdBy?: string;
  assignedTo?: string;
  approver?: string;
  priority?: ActionTrackerPriority;
  originRecordId?: string;
  originRecordLabel?: string;
  originScreen?: string;
  tierLevel?: string;
  meetingDate?: string;
  aiAssisted?: boolean;
};
