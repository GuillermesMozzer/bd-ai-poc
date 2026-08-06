import type { ActionTrackerRow } from '../actionTracker/types';

export type HomeWidgetSize = 'small' | 'medium' | 'large';

export type ShiftSettingsTab = 'configuration' | 'patterns' | 'lineAssignments' | 'holidays' | 'requests';

export type ShiftLogbookTicket = {
  id: string;
  title: string;
  category: 'Maintenance Request' | 'Work Order' | 'OEE' | 'Non-Conformance' | 'Shift Notes' | 'ESO' | 'Scrap' | 'Performance Output';
  ticketType: string;
  line: string;
  zone: string;
  riskLevel: string;
  shift: string;
  status: string;
  reporter: string;
  reporterType: 'Human' | 'BLU.AI';
  createdAt: string;
  dateScope: 'Current Shift' | 'Last Shift' | 'Custom Date';
  tone: string;
  summary: string;
  x: number;
  y: number;
};

export type ShiftConfigItem = {
  id: string;
  name: string;
  shiftType: string;
  start: string;
  end: string;
  duration: string;
  isActive: boolean;
  notes?: string;
};

export type CrewPatternItem = {
  id: string;
  name: string;
  shiftIds: string[];
  crewCount: number;
  crewNames: string[];
  rotationSequence: string;
  offsetLogic: string;
  workingRestBlocks: string;
  weekendBehavior: string;
  isActive: boolean;
  notes?: string;
};

export type LinePatternAssignmentItem = {
  id: string;
  lineArea: string;
  crewPatternId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  notes?: string;
};

export type HolidayItem = {
  id: string;
  title: string;
  type: 'Holiday' | 'Maintenance' | 'Production Stop' | 'Plant Shutdown' | 'Training Event' | 'Other';
  scope: 'Entire Site' | 'Department' | 'Area' | 'Line';
  scopeDetail: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  reason: string;
  isActive: boolean;
};

export type ShiftRequestStatus = 'Requested' | 'Approved' | 'Rejected';

export type ShiftRequestItem = {
  id: string;
  type: string;
  requestedBy: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: ShiftRequestStatus;
};

export type CilTaskType = 'CIL' | 'CL' | 'IT';
export type CilMachineState = 'Running / External' | 'Stopped / Internal';
export type CilTaskStatus = 'Done' | 'Running' | 'Pending';

export type CilTaskRow = {
  task: string;
  equipment: string;
  type: CilTaskType;
  avgTime: string;
  machineState: CilMachineState;
  responsible: string;
  status: CilTaskStatus;
};

export type MaintenancePriority = 'Emergency' | 'High' | 'Medium' | 'Low';

export type MaintenanceCard = {
  id: string;
  title: string;
  detail: string;
  assignee: string;
  due: string;
  priority: MaintenancePriority;
};

export type PlannerCalendarRow = 'Planned & Unscheduled' | 'Day Shift' | 'Night Shift';

export type MaintenanceTeamMember = {
  name: string;
  role: string;
  team: 'Team A' | 'Team B' | 'Team C' | 'Morning';
  status: 'Available' | 'Vacation' | 'On Shift';
};

export type CbmAlertCard = {
  asset: string;
  parameter: string;
  grade: 'A' | 'B' | 'C';
  daysToFailure: number;
  healthScore: number;
  scheduled: string;
  recommended: string;
  urgent: boolean;
};

export type ArtifactDetail = {
  id: string;
  name: string;
  type?: string;
  status?: string;
  version?: string;
  owner?: string;
  approver?: string;
  modified?: string;
  modifiedBy?: string;
  reviewDate?: string;
  site?: string;
  line?: string;
  asset?: string;
};


export type NotificationAlert = {
  id: string;
  title: string;
  message: string;
  location: string;
  site: string;
  line: string;
  team: string;
  source: string;
  sourceLabel?: string;
  reference: string;
  category: string;
  createdAt: string;
  dueDate: string;
  priority: ActionTrackerRow['priority'];
  severity: 'info' | 'success' | 'warning' | 'critical';
  status: 'New' | 'Acknowledged' | 'In Progress' | 'Approved' | 'Rejected' | 'Pending' | 'Overdue' | 'Scheduled';
  owner: string;
  audience: 'inbox' | 'team';
  assignedTo: string[];
  assignedRoles?: string[];
  employee: string;
  assignee: string;
  relatedPerson?: string;
  workflowLabel: string;
  workflowScreen: string;
  details: Array<{
    label: string;
    value: string;
  }>;
};

export type CustomNotificationRuleStatus = 'Active' | 'Paused';

export type CustomNotificationRule = {
  id: string;
  name: string;
  widgetId?: string;
  sourceWidget: string;
  triggerCondition: string;
  scope: string;
  frequency: string;
  status: CustomNotificationRuleStatus;
  createdDate: string;
  lastTriggered: string;
  createdBy: string;
  selectedEventIds?: string[];
  deliveryIds?: Array<'in-app' | 'email' | 'teams' | 'daily-digest'>;
  frequencyId?: 'instant' | 'hourly' | 'daily';
  filters?: {
    site: string;
    line: string;
    priority: string;
    category: string;
    status: string;
  };
};

export const smartSearchCategories = ['All', 'Documents', 'Tasks & Work Orders', 'Notifications', 'Trainings', 'Assets', 'Time Series', '3D'] as const;
export const homeSiteOptions = ['Global', 'Sandy', 'Europe', 'Asia', 'Campinas', 'Tijuana', 'Plymouth'] as const;

export type SmartSearchCategory = (typeof smartSearchCategories)[number];
export type HomeSiteScope = (typeof homeSiteOptions)[number];
