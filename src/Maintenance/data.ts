
import type { 
  MaintenanceCard, 
  CbmAlertCard, 
  PlannerCalendarRow, 
  MaintenanceTeamMember, 
  MaintenancePriority 
} from './types';

// Extracted from App.tsx
const maintenanceLaneData: {
    requests: MaintenanceCard[];
    autonomous: MaintenanceCard[];
    review: MaintenanceCard[];
    closed: MaintenanceCard[];
    team: {
      scheduling: MaintenanceCard[];
      scheduled: MaintenanceCard[];
      progress: MaintenanceCard[];
    };
  } = {
    requests: [
      { id: 'mr-1', title: 'Mixer Unit 3', detail: 'Unusual vibrations. Check bearings.', assignee: 'Julia Roberts', due: 'Jan 13, 15:30PM', priority: 'Low' },
      { id: 'mr-2', title: 'Oven Conveyor', detail: 'Belt slippage. Adjust tension.', assignee: 'Bruno Aquino', due: 'Jan 13, 10:00AM', priority: 'Emergency' },
      { id: 'mr-8', title: 'Injection Molding Press 4', detail: 'Rejected molded parts from cavities 3 and 7 showing flash and incomplete fill during batch validation.', assignee: 'Maria Silva', due: 'Jan 13, 14:20PM', priority: 'High', tags: ['Molding'] },
      { id: 'mr-3', title: 'Cooling System A', detail: 'Low coolant level. Inspect for leaks.', assignee: 'BLU.AI', due: 'Jan 13, 09:10AM', priority: 'Medium' },
      { id: 'mr-4', title: 'Press Machine 7', detail: 'Hydraulic pressure dropping. Check pump.', assignee: 'BLU.AI', due: 'Jan 13, 08:30PM', priority: 'High' },
      { id: 'mr-5', title: 'Welding Robot 2', detail: 'Inconsistent welds. Calibrate settings.', assignee: 'Bruno Aquino', due: 'Jan 13, 08:20AM', priority: 'High' },
      { id: 'mr-6', title: 'Packaging Line B', detail: 'Jammed conveyor. Clear obstruction.', assignee: 'Bruno Aquino', due: 'Jan 12, 17:30PM', priority: 'Low' },
      { id: 'mr-7', title: 'Mixer Unit 5', detail: 'Strange humming noise. Check motor mounts.', assignee: 'Bruno Aquino', due: 'Jan 12, 11:30AM', priority: 'Low' },
    ],
    autonomous: [
      { id: 'ap-1', title: 'Injection Molding Unit', detail: 'Fluid leakage identified around the primary piston gasket. Urgent examination and gasket replacement needed.', assignee: 'Bruno Aquino', due: 'Jan 13, 16:30PM', priority: 'High' },
      { id: 'ap-2', title: 'Blow Molding Machine', detail: 'Leakage observed near the main piston seal. Immediate assessment and seal replacement are necessary.', assignee: 'Afoson Davi', due: 'Jan 13, 15:30PM', priority: 'Immediate' },
    ],
    review: [
      { id: 'rv-1', title: 'Blow Molding Machine WO', detail: 'AM task finished. Waiting technical review and sign-off.', assignee: 'Afoson Davi', due: 'Jan 13', priority: 'Medium' },
      { id: 'rv-2', title: 'Extrusion Machine WO', detail: 'Maintenance team execution completed. Pending supervisor verification.', assignee: 'Bruno Aquino', due: 'Jan 13', priority: 'Low' },
    ],
    closed: [
      { id: 'cl-1', title: 'Cooling Circuit Flush WO', detail: 'Closed after review. Documentation completed.', assignee: 'Julia Roberts', due: 'Jan 13', priority: 'Low' },
      { id: 'cl-2', title: 'Conveyor Belt Tension WO', detail: 'Closed and archived in maintenance history.', assignee: 'Bruno Aquino', due: 'Jan 13', priority: 'Low' },
    ],
    team: {
      scheduling: [
        { id: 'sch-1', title: 'Conveyor CV-210', detail: 'Belt tracking drift detected near the transfer point. Requires corrective alignment and roller inspection.', assignee: 'Bruno Aquino', due: 'Jan 13', priority: 'Low', equipmentCriticality: 'A' },
        { id: 'sch-2', title: 'Packaging Robot RB-402', detail: 'Vacuum gripper is losing hold during pick cycle. Requires corrective hose inspection and end-effector adjustment.', assignee: 'Bruno Aquino', due: 'Jan 13', priority: 'Low', equipmentCriticality: 'B', tags: ['Parts Reserved'] },
        { id: 'sch-3', title: 'Transfer Pump P-118', detail: 'Seal temperature is rising above expected range. Corrective inspection needed before the next production window.', assignee: 'Daniel Ortega', due: 'Jan 13', priority: 'High', equipmentCriticality: 'A' },
        { id: 'sch-4', title: 'Vision System VS-05', detail: 'Intermittent reject signal from camera station. Corrective lens cleaning and trigger validation required.', assignee: 'Maria Silva', due: 'Jan 14', priority: 'Low', equipmentCriticality: 'C' },
        { id: 'sch-5', title: 'Case Packer CP-06', detail: 'Carton indexing is drifting after speed changes. Corrective timing check is waiting on the replacement sensor kit.', assignee: 'Kadin Workman', due: 'Jan 14', priority: 'Low', equipmentCriticality: 'B', tags: ['Requested Missing Parts'] },
      ],
      scheduled: [
        { id: 'std-1', title: 'Extrusion Machine', detail: 'Oil leak detected near main cylinder seal. Requires immediate inspection and seal replacement.', assignee: 'Bruno Aquino', due: 'Jan 13', priority: 'Medium', tags: ['No Parts Required'] },
        { id: 'std-2', title: 'Extrusion Machine', detail: 'Oil leak detected near main cylinder seal. Requires immediate inspection and seal replacement.', assignee: 'Bruno Aquino', due: 'Jan 13', priority: 'Medium', tags: ['Parts Reserved'] },
        { id: 'std-3', title: 'Dosing Pump Skid', detail: 'Preventive seal replacement scheduled after throughput variation on the dosing loop.', assignee: 'Daniel Ortega', due: 'Jan 14', priority: 'High', tags: ['Parts Ready'] },
        { id: 'std-4', title: 'Packaging Line B', detail: 'Conveyor guide repair is scheduled, but one required roller kit is not available in stock.', assignee: 'Kadin Workman', due: 'Jan 14', priority: 'Immediate', tags: ['Requested Missing Parts'] },
        { id: 'std-5', title: 'Syringe Assembly PM', detail: 'Preventive work order scheduled for lubrication, seal inspection, and dispensing accuracy verification.', assignee: 'Daniel Ortega', due: 'Jan 15', priority: 'Medium', tags: ['Parts Reserved'] },
      ],
      progress: [
        { id: 'ip-1', title: 'Extrusion Machine', detail: 'Oil leak detected near main cylinder seal. Requires immediate inspection and seal replacement.', assignee: 'Bruno Aquino', due: 'Jan 13', priority: 'High', tags: ['AM'] },
        { id: 'ip-2', title: 'Extrusion Machine', detail: 'Oil leak detected near main cylinder seal. Requires immediate inspection and seal replacement.', assignee: 'Bruno Aquino', due: 'Jan 13', priority: 'High', executionState: 'paused' },
        { id: 'ip-3', title: 'Cooling System A', detail: 'Operator cleaning found residue buildup near the coolant return filter. Autonomous maintenance check is in progress.', assignee: 'Maria Silva', due: 'Jan 13', priority: 'Medium' },
      ],
    },
  };
  const maintenancePerformanceKpis = [
    { label: 'Maintenance Requests', value: '3', tone: '#044ED7', bg: '#EFF6FF' },
    { label: 'Open Work Orders', value: '13', tone: '#044ED7', bg: '#EFF6FF' },
    { label: 'Scheduled Today', value: '11', tone: '#044ED7', bg: '#EFF6FF' },
    { label: 'Overdue', value: '2', tone: '#B91C1C', bg: '#FEF2F2' },
    { label: 'Breakdowns (24h)', value: '4', tone: '#B91C1C', bg: '#FEF2F2' },
    { label: 'Assets At Risk', value: '1', tone: '#C2410C', bg: '#FFF7ED' },
  ] as const;
  const pmCmWeeklyTracking = [
    { week: 'Week 1', preventive: 33, corrective: 15 },
    { week: 'Week 2', preventive: 39, corrective: 12 },
    { week: 'Week 3', preventive: 36, corrective: 18 },
    { week: 'Week 4', preventive: 41, corrective: 23 },
  ] as const;
  const monthlyConsumed = [
    { asset: 'Forklift', value: 8400 },
    { asset: 'Conveyor', value: 12100 },
    { asset: 'Pallet Jack', value: 3200 },
    { asset: 'Crane', value: 15800 },
    { asset: 'AGV', value: 9600 },
  ] as const;
  const monthlyMaintenanceCost = [
    { month: 'Jan', value: 45000 },
    { month: 'Feb', value: 52000 },
    { month: 'Mar', value: 48500 },
    { month: 'Apr', value: 56000 },
    { month: 'May', value: 51000 },
    { month: 'Jun', value: 49500 },
  ] as const;
  const reliabilityByLine = [
    { line: 'Line 1', mttr: 3.1, mtbf: 40 },
    { line: 'Line 2', mttr: 2.4, mtbf: 46 },
    { line: 'Line 3', mttr: 4.0, mtbf: 34 },
    { line: 'Line 4', mttr: 2.9, mtbf: 43 },
  ] as const;
  const cbmAlertCards: CbmAlertCard[] = [
    { asset: 'Robotic Pick-and-Place System A1', parameter: 'Servo motor vibration', grade: 'A', daysToFailure: 5, healthScore: 65, scheduled: '14/03/2026', recommended: '04/03/2026', urgent: true },
    { asset: 'Hydraulic Press B2', parameter: 'Torque', grade: 'B', daysToFailure: 12, healthScore: 78, scheduled: '14/03/2026', recommended: '04/03/2026', urgent: true },
    { asset: 'Robotic Arm D3', parameter: 'Press force', grade: 'B', daysToFailure: 18, healthScore: 72, scheduled: '24/03/2026', recommended: '15/03/2026', urgent: true },
    { asset: 'Conveyor System C1', parameter: 'All parameters operating normally', grade: 'C', daysToFailure: 45, healthScore: 92, scheduled: '09/04/2026', recommended: '', urgent: false },
    { asset: 'Laser Cutter E1', parameter: 'All parameters operating normally', grade: 'C', daysToFailure: 35, healthScore: 88, scheduled: '04/04/2026', recommended: '', urgent: false },
    { asset: 'Conveyor System C1', parameter: 'All parameters operating normally', grade: 'C', daysToFailure: 52, healthScore: 95, scheduled: '17/04/2026', recommended: '', urgent: false },
  ];
  const plannerRows = [
    { name: 'Injection molding machine', bars: [{ start: 2, width: 8, tone: '#2563eb' }, { start: 33, width: 33, tone: '#2563eb' }, { start: 66, width: 8, tone: '#2563eb' }], markers: [{ pos: 4, tone: '#1d4ed8' }, { pos: 30, tone: '#f97316' }, { pos: 35, tone: '#ef4444' }] },
    { name: 'Electric injection', bars: [{ start: 16, width: 8, tone: '#3b82f6' }, { start: 49, width: 10, tone: '#3b82f6' }, { start: 82, width: 8, tone: '#3b82f6' }], markers: [{ pos: 20, tone: '#1d4ed8' }, { pos: 55, tone: '#1d4ed8' }] },
    { name: 'Plastic extrusion machine', bars: [{ start: 33, width: 15, tone: '#3b82f6' }], markers: [{ pos: 39, tone: '#1d4ed8' }, { pos: 58, tone: '#f97316' }] },
    { name: 'Hot runner system', bars: [{ start: 25, width: 8, tone: '#3b82f6' }, { start: 66, width: 34, tone: '#2563eb' }], markers: [{ pos: 6, tone: '#ef4444' }, { pos: 45, tone: '#f97316' }] },
    { name: 'Mold temperature controller', bars: [{ start: 41, width: 8, tone: '#3b82f6' }], markers: [{ pos: 45, tone: '#1d4ed8' }] },
    { name: 'Injection molds', bars: [{ start: 33, width: 15, tone: '#3b82f6' }], markers: [{ pos: 21, tone: '#f97316' }, { pos: 35, tone: '#1d4ed8' }] },
    { name: 'Material conveying system', bars: [{ start: 2, width: 8, tone: '#2563eb' }, { start: 33, width: 8, tone: '#3b82f6' }, { start: 51, width: 23, tone: '#3b82f6' }], markers: [{ pos: 8, tone: '#1d4ed8' }, { pos: 61, tone: '#1d4ed8' }] },
    { name: 'Chiller / cooling system', bars: [], markers: [{ pos: 18, tone: '#ef4444' }] },
    { name: 'Mold clamping unit', bars: [{ start: 2, width: 3, tone: '#93c5fd' }, { start: 17, width: 3, tone: '#93c5fd' }, { start: 33, width: 3, tone: '#93c5fd' }, { start: 51, width: 3, tone: '#93c5fd' }, { start: 66, width: 3, tone: '#93c5fd' }, { start: 83, width: 3, tone: '#93c5fd' }], markers: [{ pos: 2, tone: '#1d4ed8' }, { pos: 19, tone: '#1d4ed8' }, { pos: 35, tone: '#1d4ed8' }, { pos: 53, tone: '#1d4ed8' }] },
    { name: 'Injection unit', bars: [{ start: 2, width: 8, tone: '#2563eb' }, { start: 33, width: 8, tone: '#2563eb' }, { start: 66, width: 8, tone: '#2563eb' }], markers: [{ pos: 4, tone: '#1d4ed8' }, { pos: 30, tone: '#f97316' }, { pos: 35, tone: '#1d4ed8' }] },
    { name: 'Plastic extrusion machine', bars: [{ start: 16, width: 8, tone: '#3b82f6' }, { start: 49, width: 8, tone: '#3b82f6' }, { start: 82, width: 8, tone: '#3b82f6' }], markers: [{ pos: 20, tone: '#1d4ed8' }, { pos: 45, tone: '#f97316' }, { pos: 55, tone: '#93c5fd' }] },
    { name: 'Leak tester', bars: [{ start: 33, width: 15, tone: '#3b82f6' }], markers: [{ pos: 39, tone: '#1d4ed8' }] },
  ] as const;
  const plannerCalendarDays = [
    { label: 'Sun', date: 15 },
    { label: 'Mon', date: 16 },
    { label: 'Tue', date: 17 },
    { label: 'Wed', date: 18 },
    { label: 'Thu', date: 19 },
    { label: 'Fri', date: 20 },
    { label: 'Sat', date: 21 },
  ] as const;
  const plannerCalendarRows: PlannerCalendarRow[] = ['Planned & Unscheduled', 'Day Shift', 'Night Shift'];
  const plannerCalendarInitialData: Record<PlannerCalendarRow, string[][]> = {
    'Planned & Unscheduled': [
      [],
      [],
      [],
      [],
      ['Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA'],
      ['Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA'],
      ['Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA'],
    ],
    'Day Shift': [
      ['Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA'],
      ['Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA'],
      ['Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA'],
      ['Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA'],
      [],
      [],
      [],
    ],
    'Night Shift': [
      ['Hydraulic Press #2 Drive UrA'],
      ['Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA', 'Hydraulic Press #2 Drive UrA'],
      ['Hydraulic Press #2 Drive UrA'],
      [],
      [],
      [],
      [],
    ],
  };
  const maintenanceTeamMembersInitial: MaintenanceTeamMember[] = [
    { name: 'Carlos Mendez', role: 'Operator', team: 'Morning', status: 'Available' as const },
    { name: 'Noah Philis', role: 'Process Analyst', team: 'Team C', status: 'Available' as const },
    { name: 'Marcus Noladim', role: 'Process Engineer', team: 'Team B', status: 'Available' as const },
    { name: 'Maria Pinna', role: 'Technician', team: 'Morning', status: 'Available' as const },
    { name: 'John Miranda', role: 'Operator', team: 'Team A', status: 'Vacation' as const },
    { name: 'Indio Chillerpa', role: 'Analyst', team: 'Team B', status: 'Available' as const },
    { name: 'Juliana Machado', role: 'Line Leader', team: 'Team C', status: 'Available' as const },
    { name: 'Emma Jameson', role: 'Technician', team: 'Team B', status: 'Available' as const },
    { name: 'Sergio Roswell', role: 'Analyst', team: 'Morning', status: 'Available' as const },
    { name: 'Marcus Noladim', role: 'Mechanic', team: 'Morning', status: 'Available' as const },
    { name: 'Jesus Alba', role: 'Line Mechanic', team: 'Team C', status: 'Available' as const },
  ];
  const maintenancePriorityStyles: Record<MaintenancePriority, { bg: string; fg: string; border: string; rank: number }> = {
    Emergency: { bg: '#FEE2E2', fg: '#B91C1C', border: '#FCA5A5', rank: 0 },
    Immediate: { bg: '#FFEDD5', fg: '#EA580C', border: '#FDBA74', rank: 1 },
    High: { bg: '#FEF3C7', fg: '#A16207', border: '#D97706', rank: 2 },
    Medium: { bg: '#FEF9C3', fg: '#CA8A04', border: '#FACC15', rank: 3 },
    Low: { bg: '#DCFCE7', fg: '#166534', border: '#86EFAC', rank: 4 },
    'Very Low': { bg: '#E0F2FE', fg: '#0369A1', border: '#7DD3FC', rank: 5 },
  };

export {
  maintenanceLaneData,
  maintenancePerformanceKpis,
  pmCmWeeklyTracking,
  monthlyConsumed,
  monthlyMaintenanceCost,
  reliabilityByLine,
  cbmAlertCards,
  plannerRows,
  plannerCalendarDays,
  plannerCalendarRows,
  plannerCalendarInitialData,
  maintenanceTeamMembersInitial,
  maintenancePriorityStyles
};
