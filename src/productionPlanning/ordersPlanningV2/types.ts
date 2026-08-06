import type {MachineWorkOrder, ScheduledWorkOrder} from '../schedulingWorkspaceTimeline/types';

export type {ScheduledWorkOrder, MachineWorkOrder};

export type V2TimelineEventType = 'maintenance' | 'downtime' | 'cleaning';

export type V2TimelineEvent = {
  id: string;
  machineId: string;
  lineId: string;
  type: V2TimelineEventType;
  label: string;
  startDateTime: string;
  endDateTime: string;
};

export type V2ObjectCategoryId =
  | 'work-orders'
  | 'maintenance'
  |  'Downtime'
  | 'changeover'
  | 'quality-hold'
  | 'cleaning';

export type V2ObjectCategoryConfig = {
  id: string;
  label: string;
  color: string;
  enabled: boolean;
  children?: V2ObjectCategoryConfig[];
};

export type OeeDayPoint = {
  day: string;
  value: number;
};

export type V2ColumnMachine = {
  id: string;
  lineId: string;
  label: string;
  shortLabel: string;
  status: string;
  utilizationPercent: number;
  oeeTrend?: OeeDayPoint[];
};

export type V2ColumnLine = {
  id: string;
  label: string;
  shortLabel: string;
  status: string;
  utilizationPercent: number;
  machines: V2ColumnMachine[];
  expanded: boolean;
  oeeTrend?: OeeDayPoint[];
};

export type V2TimeSlot = {
  day: string;
  dayLabel: string;
  hour: number;
  hourLabel: string;
  id: string;
};

export type V2WorkOrderBlock = {
  id: string;
  machineId: string;
  lineId: string;
  startHourIndex: number;
  endHourIndex: number;
  wo: MachineWorkOrder;
  hasConflict: boolean;
};

export type V2UnplannedWorkOrder = {
  id: string;
  woNumber: string;
  productCode: string;
  productDescription: string;
  quantity: number;
  uom: string;
  priority: ScheduledWorkOrder['priority'];
  dueDate: string;
  durationHours: number;
  materialRisk: string;
  qualityRisk: string;
  laborRisk: string;
};

export type V2DragSource = 'planned' | 'unplanned';

export type V2TimelineDropTarget = {
  lineId: string;
  machineId: string;
  slotId: string;
};

export type V2DragPayload = {
  source: V2DragSource;
  workOrderId: string;
  lineId?: string;
  machineId?: string;
};

export type V2DateShortcut = 'Today' | 'ThreeDays' | 'SevenDays';

export type V2DateRange = {
  startDate: string;
  endDate: string;
  shortcut: V2DateShortcut | null;
};
