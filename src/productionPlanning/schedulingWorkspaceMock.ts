import type {ProductionPlanningPageId} from './planningOverviewMock';

export type SchedulingViewMode = 'timeline' | 'kanban' | 'calendar' | 'gantt' | 'table';
export type SchedulingWorkOrderStatus = 'Approved' | 'Warning' | 'Blocked' | 'Scheduled' | 'Ready';
export type SchedulingReadiness = 'Ready' | 'Warning' | 'Blocked';
export type SchedulingRisk = 'Low' | 'Medium' | 'High';

export type SchedulingWorkOrder = {
  id: string;
  product: string;
  quantity: number;
  line: string;
  machine: string;
  status: SchedulingWorkOrderStatus;
  readiness: SchedulingReadiness;
  risk: SchedulingRisk;
  aiConfidence: number;
  day: string | null;
  sequenceIndex: number | null;
  family: string;
  source: 'approved' | 'ai' | 'backlog';
};

export type SchedulingLine = {
  id: string;
  name: string;
  machines: string[];
};

export type SchedulingDayColumn = {
  id: string;
  label: string;
  shortLabel: string;
};

export type SchedulingAuditEvent = {
  id: string;
  timestamp: string;
  action: string;
  item: string;
  actor: string;
  details: string;
};

export type ReasonCode = {
  code: string;
  label: string;
};

export type SchedulingValidationIssue = {
  id: string;
  severity: 'Error' | 'Warning' | 'Info';
  message: string;
};

export const schedulingLines: SchedulingLine[] = [
  {id: 'line-1', name: 'Line 1', machines: ['Mixer 01', 'Filler 01']},
  {id: 'line-2', name: 'Line 2', machines: ['Assembler 03', 'Packer 04']},
  {id: 'line-3', name: 'Line 3', machines: ['Sterile Cell 02', 'Packer 07']},
];

export const schedulingDays: SchedulingDayColumn[] = [
  {id: '2026-05-13', label: 'Tuesday · May 13', shortLabel: 'Tue 13'},
  {id: '2026-05-14', label: 'Wednesday · May 14', shortLabel: 'Wed 14'},
  {id: '2026-05-15', label: 'Thursday · May 15', shortLabel: 'Thu 15'},
  {id: '2026-05-16', label: 'Friday · May 16', shortLabel: 'Fri 16'},
];

export const schedulingReasonCodes: ReasonCode[] = [
  {code: 'MAT', label: 'Material constraint'},
  {code: 'CAP', label: 'Capacity balancing'},
  {code: 'COV', label: 'Coverage priority'},
  {code: 'CHG', label: 'Changeover optimization'},
  {code: 'QTY', label: 'Quantity split'},
];

export const initialApprovedSequence: SchedulingWorkOrder[] = [
  {
    id: 'WO-1842',
    product: 'Nexiva 20G',

    quantity: 18000,
    line: 'Line 2',
    machine: 'Assembler 03',
    status: 'Approved',
    readiness: 'Ready',
    risk: 'Low',
    aiConfidence: 95,
    day: '2026-05-13',
    sequenceIndex: 1,
    family: 'Nexiva',
    source: 'approved',
  },
  {
    id: 'WO-1837',
    product: 'Nexiva 22G',

    quantity: 14000,
    line: 'Line 2',
    machine: 'Assembler 03',
    status: 'Warning',
    readiness: 'Warning',
    risk: 'Medium',
    aiConfidence: 78,
    day: '2026-05-13',
    sequenceIndex: 2,
    family: 'Nexiva',
    source: 'approved',
  },
  {
    id: 'WO-1861',
    product: 'PosiFlush 5ml',

    quantity: 24000,
    line: 'Line 1',
    machine: 'Filler 01',
    status: 'Approved',
    readiness: 'Ready',
    risk: 'Low',
    aiConfidence: 88,
    day: '2026-05-14',
    sequenceIndex: 1,
    family: 'PosiFlush',
    source: 'approved',
  },
  {
    id: 'WO-1874',
    product: 'Sterile Tray Kit A',

    quantity: 9000,
    line: 'Line 3',
    machine: 'Sterile Cell 02',
    status: 'Scheduled',
    readiness: 'Ready',
    risk: 'Medium',
    aiConfidence: 90,
    day: '2026-05-15',
    sequenceIndex: 1,
    family: 'Tray Kit',
    source: 'approved',
  },
  {
    id: 'WO-1882',
    product: 'Sterile Tray Kit B',

    quantity: 11000,
    line: 'Line 3',
    machine: 'Sterile Cell 02',
    status: 'Warning',
    readiness: 'Warning',
    risk: 'High',
    aiConfidence: 72,
    day: '2026-05-16',
    sequenceIndex: 1,
    family: 'Tray Kit',
    source: 'approved',
  },
];

export const initialAiSequence: SchedulingWorkOrder[] = [
  {
    id: 'WO-1861',
    product: 'PosiFlush 5ml',

    quantity: 24000,
    line: 'Line 1',
    machine: 'Filler 01',
    status: 'Approved',
    readiness: 'Ready',
    risk: 'Low',
    aiConfidence: 93,
    day: '2026-05-13',
    sequenceIndex: 1,
    family: 'PosiFlush',
    source: 'ai',
  },
  {
    id: 'WO-1842',
    product: 'Nexiva 20G',

    quantity: 18000,
    line: 'Line 2',
    machine: 'Assembler 03',
    status: 'Scheduled',
    readiness: 'Ready',
    risk: 'Low',
    aiConfidence: 96,
    day: '2026-05-13',
    sequenceIndex: 1,
    family: 'Nexiva',
    source: 'ai',
  },
  {
    id: 'WO-1874',
    product: 'Sterile Tray Kit A',

    quantity: 9000,
    line: 'Line 3',
    machine: 'Sterile Cell 02',
    status: 'Scheduled',
    readiness: 'Ready',
    risk: 'Medium',
    aiConfidence: 91,
    day: '2026-05-14',
    sequenceIndex: 1,
    family: 'Tray Kit',
    source: 'ai',
  },
  {
    id: 'WO-1882',
    product: 'Sterile Tray Kit B',

    quantity: 11000,
    line: 'Line 3',
    machine: 'Sterile Cell 02',
    status: 'Warning',
    readiness: 'Warning',
    risk: 'High',
    aiConfidence: 84,
    day: '2026-05-15',
    sequenceIndex: 1,
    family: 'Tray Kit',
    source: 'ai',
  },
  {
    id: 'WO-1837',
    product: 'Nexiva 22G',

    quantity: 14000,
    line: 'Line 2',
    machine: 'Assembler 03',
    status: 'Warning',
    readiness: 'Warning',
    risk: 'Medium',
    aiConfidence: 81,
    day: '2026-05-16',
    sequenceIndex: 1,
    family: 'Nexiva',
    source: 'ai',
  },
];

export const initialUnscheduledBacklog: SchedulingWorkOrder[] = [
  {
    id: 'WO-1895',
    product: 'Nexiva 24G',

    quantity: 12000,
    line: 'Line 2',
    machine: 'Assembler 03',
    status: 'Blocked',
    readiness: 'Blocked',
    risk: 'High',
    aiConfidence: 39,
    day: null,
    sequenceIndex: null,
    family: 'Nexiva',
    source: 'backlog',
  },
  {
    id: 'WO-1902',
    product: 'PosiFlush 10ml',

    quantity: 15000,
    line: 'Line 1',
    machine: 'Filler 01',
    status: 'Warning',
    readiness: 'Warning',
    risk: 'Medium',
    aiConfidence: 68,
    day: null,
    sequenceIndex: null,
    family: 'PosiFlush',
    source: 'backlog',
  },
  {
    id: 'WO-1908',
    product: 'Sterile Tray Kit C',

    quantity: 8000,
    line: 'Line 3',
    machine: 'Sterile Cell 02',
    status: 'Ready',
    readiness: 'Ready',
    risk: 'Low',
    aiConfidence: 87,
    day: null,
    sequenceIndex: null,
    family: 'Tray Kit',
    source: 'backlog',
  },
];

export const initialSchedulingAuditEvents: SchedulingAuditEvent[] = [
  {
    id: 'AUD-SCH-101',
    timestamp: '2026-05-13 09:11',
    action: 'Approved sequence loaded',
    item: 'Scheduling Workspace',
    actor: 'BLU.AI Planner',
    details: 'Local mock approved schedule loaded for short-term planning review.',
  },
  {
    id: 'AUD-SCH-102',
    timestamp: '2026-05-13 09:24',
    action: 'Planner opened schedule',
    item: 'Scheduling Workspace',
    actor: 'Maya Planner',
    details: 'Opened the short-term scheduling page for exception review.',
  },
];

export const schedulingWorkflowLinks: Array<{label: string; pageId: ProductionPlanningPageId}> = [
  {label: 'Open Command Center', pageId: 'planning-overview'},
  {label: 'Open Work Orders', pageId: 'work-orders'},
];
