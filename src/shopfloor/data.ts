import { 
  ShiftConfigItem, 
  CrewPatternItem,
  HolidayItem, 
  CilTaskRow, 
  ShiftRequestItem,
  LinePatternAssignmentItem,
} from './types';
import { HomeWidgetSize } from '../aiHome/types';
import { TeamShiftDefinition, TeamManagementDay, DayShiftSetup } from '../shiftManagement/types/teamTypes';

export const workstationDefaultWorkstreamApps = ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'];

export const workstationPredefinedApps : Record<string, string[]> = {
  'Operator View': ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'],
  'Leader View': ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'],
  'Tier 1': ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'],
  'Tier 2': ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'],
  'Tier 3': ['CIL', 'Centerline', 'Equipment Setup Changeover', 'Manage Activities'],
};

export const defaultHomeWidgetOrder = [
  'Shift Schedule',
  'Doc Manager',
  'Shift Logbook',
  'Control Tower',
  'Smart Search',
  'Tier 1 Meeting',
  'Action Tracker',
  'Tier 1 Overview',
  'Operations Entry',
  'Maintenance',
  'ESO',
  'Line Performance',
  'CIL',
] as const;

export const defaultHomeWidgetSizeMap : Record<string, HomeWidgetSize> = {
  'Maintenance': 'large',
  'Action Tracker': 'large',
  'Shift Logbook': 'large',
  'Line Performance': 'large',
  'CIL': 'large',
  'Shift Schedule': 'medium',
  'Tier 1 Meeting': 'medium',
  'ESO': 'medium',
  'Doc Manager': 'small',
  'Smart Search': 'small',
  'Control Tower': 'small',
  'Tier 1 Overview': 'small',
  'Operations Entry': 'small',
};

export const initialShiftConfigItems : ShiftConfigItem[] = [
  { id: 'shift-1', name: 'Morning', shiftType: '8-hour', start: '06:00', end: '14:00', duration: '8h', isActive: true, notes: 'Primary weekday day shift.' },
  { id: 'shift-2', name: 'Afternoon', shiftType: '8-hour', start: '14:00', end: '22:00', duration: '8h', isActive: true, notes: 'Second production shift.' },
  { id: 'shift-3', name: 'Night', shiftType: '8-hour', start: '22:00', end: '06:00', duration: '8h', isActive: true, notes: 'Overnight coverage.' },
  { id: 'shift-4', name: 'Day 12h', shiftType: '12-hour', start: '06:00', end: '18:00', duration: '12h', isActive: false, notes: 'Used for surge or weekend models.' },
];

export const initialCrewPatternItems: CrewPatternItem[] = [
  {
    id: 'pattern-1',
    name: '5-Crew Rotation',
    shiftIds: ['shift-1', 'shift-2', 'shift-3'],
    crewCount: 5,
    crewNames: ['Crew A', 'Crew B', 'Crew C', 'Crew D', 'Crew E'],
    rotationSequence: '7M -> 3A -> 4N -> 11D',
    offsetLogic: 'Each crew starts 5 days apart.',
    workingRestBlocks: '7M = 7 days Morning, 3A = 3 days Afternoon, 4N = 4 days Night, 11D = 11 days Off',
    weekendBehavior: 'Standard weekend coverage follows the same rotation.',
    isActive: true,
    notes: 'Default high-volume rotation.',
  },
  {
    id: 'pattern-2',
    name: '4-Crew Rotation',
    shiftIds: ['shift-1', 'shift-2', 'shift-3'],
    crewCount: 4,
    crewNames: ['Crew A', 'Crew B', 'Crew C', 'Crew D'],
    rotationSequence: '5M -> 2D -> 5A -> 2D -> 5N -> 2D',
    offsetLogic: 'Crews start one block apart.',
    workingRestBlocks: '5 workdays per shift block followed by 2 days off.',
    weekendBehavior: 'Weekend coverage rotates across all crews.',
    isActive: true,
    notes: 'Used when line demand is reduced.',
  },
];

export const initialLinePatternAssignmentItems: LinePatternAssignmentItem[] = [
  {
    id: 'line-pattern-1',
    lineArea: 'Line A',
    crewPatternId: 'pattern-1',
    startDate: '2026-01-01',
    endDate: '2026-06-30',
    isActive: true,
    notes: 'High-demand first-half plan.',
  },
  {
    id: 'line-pattern-2',
    lineArea: 'Line A',
    crewPatternId: 'pattern-2',
    startDate: '2026-07-01',
    endDate: '2026-12-31',
    isActive: false,
    notes: 'Planned lower-volume second-half rotation.',
  },
  {
    id: 'line-pattern-3',
    lineArea: 'Line B',
    crewPatternId: 'pattern-1',
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    notes: 'Stable year-round assignment.',
  },
];

export const initialHolidayItems : HolidayItem[] = [
  {
    id: 'planned-stop-1',
    title: 'Christmas Shutdown',
    type: 'Plant Shutdown',
    scope: 'Entire Site',
    scopeDetail: 'Entire Plant',
    startDate: '2026-12-23',
    startTime: '06:00',
    endDate: '2027-01-02',
    endTime: '22:00',
    description: 'Annual plant closure.',
    reason: 'Christmas and New Year shutdown.',
    isActive: true,
  },
  {
    id: 'planned-stop-2',
    title: 'Line A Preventive Maintenance',
    type: 'Maintenance',
    scope: 'Line',
    scopeDetail: 'Line A',
    startDate: '2026-08-14',
    startTime: '14:00',
    endDate: '2026-08-15',
    endTime: '14:00',
    description: 'Planned maintenance window for filling assets.',
    reason: 'Quarterly preventive maintenance stop.',
    isActive: true,
  },
  {
    id: 'planned-stop-3',
    title: 'Warehouse Training Event',
    type: 'Training Event',
    scope: 'Department',
    scopeDetail: 'Warehouse',
    startDate: '2026-09-10',
    startTime: '08:00',
    endDate: '2026-09-10',
    endTime: '12:00',
    description: 'Forklift and safety recertification.',
    reason: 'Mandatory team training.',
    isActive: false,
  },
];

export const cilTaskRows : CilTaskRow[] = [
  { task: 'Clean conveyor belt', equipment: 'Z1 Main Indexer', type: 'CIL', avgTime: '12 min', machineState: 'Running / External', responsible: 'John Smith', status: 'Done' },
  { task: 'Lubricate bearings', equipment: 'Z1 Feeder', type: 'CIL', avgTime: '8 min', machineState: 'Stopped / Internal', responsible: 'Maria Garcia', status: 'Running' },
  { task: 'Check roller pressure', equipment: 'Z1 Cutter', type: 'CL', avgTime: '5 min', machineState: 'Running / External', responsible: 'David Lee', status: 'Pending' },
  { task: 'Inspect tightening torque', equipment: 'Z2 Tipper', type: 'IT', avgTime: '6 min', machineState: 'Stopped / Internal', responsible: 'Sarah Johnson', status: 'Pending' },
  { task: 'Clean filter screen', equipment: 'Z2 Assembly Station', type: 'CIL', avgTime: '15 min', machineState: 'Running / External', responsible: 'Mike Wilson', status: 'Done' },
  { task: 'Verify temperature setpoint', equipment: 'Z3 Press', type: 'CL', avgTime: '4 min', machineState: 'Running / External', responsible: 'Jennifer Brown', status: 'Pending' },
  { task: 'Tighten mounting bolts', equipment: 'Z1 Main Indexer', type: 'IT', avgTime: '10 min', machineState: 'Stopped / Internal', responsible: 'Carlos Mendez', status: 'Done' },
  { task: 'Inspect belt tension', equipment: 'Z4 Needle Station', type: 'IT', avgTime: '7 min', machineState: 'Running / External', responsible: 'Amanda Torres', status: 'Pending' },
  { task: 'Check alignment gauge', equipment: 'Z3 Press', type: 'CL', avgTime: '5 min', machineState: 'Running / External', responsible: 'John Smith', status: 'Done' },
  { task: 'Lubricate chain drive', equipment: 'Z5 Sub Assembly', type: 'CIL', avgTime: '9 min', machineState: 'Stopped / Internal', responsible: 'Maria Garcia', status: 'Running' },
  { task: 'Verify pressure setpoint', equipment: 'Z1 Feeder', type: 'CL', avgTime: '4 min', machineState: 'Running / External', responsible: 'David Lee', status: 'Pending' },
  { task: 'Clean vacuum nozzles', equipment: 'Z6 Tube Cath Assembly', type: 'CIL', avgTime: '20 min', machineState: 'Stopped / Internal', responsible: 'Sarah Johnson', status: 'Pending' },
  { task: 'Inspect safety guard', equipment: 'Z2 Tipper', type: 'CIL', avgTime: '6 min', machineState: 'Running / External', responsible: 'Mike Wilson', status: 'Done' },
  { task: 'Check centerline offset', equipment: 'Z4 Needle Station', type: 'CL', avgTime: '5 min', machineState: 'Running / External', responsible: 'Amanda Torres', status: 'Pending' },
  { task: 'Tighten bracket screws', equipment: 'Z5 Sub Assembly', type: 'IT', avgTime: '8 min', machineState: 'Stopped / Internal', responsible: 'Carlos Mendez', status: 'Done' },
  { task: 'Inspect sensor alignment', equipment: 'Z3 Press', type: 'IT', avgTime: '6 min', machineState: 'Running / External', responsible: 'Jennifer Brown', status: 'Pending' },
  { task: 'Clean guide rails', equipment: 'Z6 Tube Cath Assembly', type: 'CIL', avgTime: '10 min', machineState: 'Running / External', responsible: 'John Smith', status: 'Done' },
  { task: 'Verify clamp pressure', equipment: 'Z2 Assembly Station', type: 'CL', avgTime: '4 min', machineState: 'Stopped / Internal', responsible: 'Maria Garcia', status: 'Pending' },
];

export const cilResponsibilityCards = [
  {
    title: 'Operator standard work',
    chip: 'Frontline routine',
    points: [
      'Basic cleaning of accessible machine areas',
      'Visual inspection during start-up, operation, and shutdown',
      'Simple lubrication and basic tightening allowed by procedure',
      'Follow CIL checklists and tag abnormalities for follow-up',
    ],
  },
  {
    title: 'Technician follow-up',
    chip: 'Skilled intervention',
    points: [
      'Root-cause diagnosis, repairs, and component replacement',
      'Alignment, calibration, precision settings, and testing',
      'Close abnormalities raised by operators',
      'Define standards, limits, frequencies, and operator training',
    ],
  },
];

export const initialShiftRequestItems : ShiftRequestItem[] = [
  { id: 'request-1', type: 'Shift Swap', requestedBy: 'James Walker', startDate: 'Apr 12, 2026', endDate: 'Apr 13, 2026', reason: 'Scheduling conflict', status: 'Requested' },
  { id: 'request-2', type: 'Vacation', requestedBy: 'Sophia Mitchell', startDate: 'Jul 15, 2026', endDate: 'Jul 19, 2026', reason: 'Family trip', status: 'Approved' },
  { id: 'request-3', type: 'Day Off', requestedBy: 'Lucas Hayes', startDate: 'May 03, 2026', endDate: 'May 03, 2026', reason: 'Birthday :)', status: 'Rejected' },
];

export const DEFAULT_USER_NAME = 'Operator';

export const DEFAULT_USER_ROLE = 'Operator L10';

export const smartSearchCategories = ['All', 'Documents', 'Tasks & Work Orders', 'Notifications', 'Trainings', 'Assets', 'Time Series', '3D'] as const;

export const homeSiteOptions = ['Global', 'Sandy', 'Europe', 'Asia', 'Campinas', 'Tijuana', 'Plymouth'] as const;

export const defaultShiftDefinitions : TeamShiftDefinition[] = [
    { id: 'Morning', label: 'Morning', start: '06:00', end: '14:00' },
    { id: 'Afternoon', label: 'Afternoon', start: '14:00', end: '22:00' },
    { id: 'Night', label: 'Night', start: '22:00', end: '06:00' },
  ];

export const defaultDayShiftSetup : Record<TeamManagementDay, Record<string, DayShiftSetup>> = {
    Monday: { Morning: { operators: 9, technicians: 3, qaInspectors: 2 }, Afternoon: { operators: 8, technicians: 3, qaInspectors: 2 }, Night: { operators: 7, technicians: 2, qaInspectors: 1 } },
    Tuesday: { Morning: { operators: 9, technicians: 3, qaInspectors: 2 }, Afternoon: { operators: 8, technicians: 3, qaInspectors: 2 }, Night: { operators: 7, technicians: 2, qaInspectors: 1 } },
    Wednesday: { Morning: { operators: 9, technicians: 3, qaInspectors: 2 }, Afternoon: { operators: 8, technicians: 3, qaInspectors: 2 }, Night: { operators: 7, technicians: 2, qaInspectors: 1 } },
    Thursday: { Morning: { operators: 9, technicians: 3, qaInspectors: 2 }, Afternoon: { operators: 8, technicians: 3, qaInspectors: 2 }, Night: { operators: 7, technicians: 2, qaInspectors: 1 } },
    Friday: { Morning: { operators: 9, technicians: 3, qaInspectors: 2 }, Afternoon: { operators: 8, technicians: 3, qaInspectors: 2 }, Night: { operators: 7, technicians: 2, qaInspectors: 1 } },
    Saturday: { Morning: { operators: 7, technicians: 2, qaInspectors: 1 }, Afternoon: { operators: 7, technicians: 2, qaInspectors: 1 }, Night: { operators: 6, technicians: 2, qaInspectors: 1 } },
    Sunday: { Morning: { operators: 7, technicians: 2, qaInspectors: 1 }, Afternoon: { operators: 7, technicians: 2, qaInspectors: 1 }, Night: { operators: 6, technicians: 2, qaInspectors: 1 } },
  };

export const shiftScheduleEventStyles = {
    vacation: { label: 'Vacation', color: '#0ea5e9' },
    overtime: { label: 'Overtime Work', color: '#f59e0b' },
    absence: { label: 'Absence', color: '#ef4444' },
    swap: { label: 'Swap', color: '#2563eb' },
    dayoff: { label: 'Day Off', color: '#4caf50' },
  } as const;

export const shiftScheduleWeekDays = [
    { key: 'sun', day: 'Sun', date: '15' },
    { key: 'mon', day: 'Mon', date: '16' },
    { key: 'tue', day: 'Tue', date: '17' },
    { key: 'wed', day: 'Wed', date: '18' },
    { key: 'thu', day: 'Thu', date: '19' },
    { key: 'fri', day: 'Fri', date: '20' },
    { key: 'sat', day: 'Sat', date: '21' },
  ] as const;

export const toolInsightMap : Record<string, string> = {
    'Shift Schedule': 'Maria S. is out today and a second-half swap still needs confirmation before 15:00.',
    'Doc Manager': 'The Employee Handbook approval is overdue and still blocking one downstream workflow.',
    'Shift Logbook': 'Two shift changes and one maintenance observation should be carried into handoff.',
    'Control Tower': 'Line 10 and maintenance verification are the top plant priorities right now.',
    'Smart Search': 'The fastest search win is the blocked e-signature and its linked approval trail.',
    'Tier 1 Meeting': 'Three blockers are queued for the next meeting and one quality item needs escalation.',
    'Action Tracker': 'Four actions remain open, with one blocked and another due before handoff.',
    'Tier 1 Overview': 'Safety and quality are the two pillars most likely to move before the next review.',
  'Operations Entry': 'BLU.AI can prefill a handoff draft with the centerlining and maintenance updates.',
    'Maintenance': 'WO-2481 and the hydraulic press inspection are the highest-risk maintenance items.',
    'ESO': 'Two safety observations remain open and one closure needs owner confirmation.',
    'Line Performance': 'Weekly output is trending up, but downtime concentration is still tied to Line 10.',
    'CIL': 'Operator CIL completion is at 45% and two technician abnormalities still need closure.',
  };


