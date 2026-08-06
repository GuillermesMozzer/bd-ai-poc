import {schedulingMachinesMock} from '../schedulingWorkspaceTimeline/schedulingMachinesMock';
import {schedulingMachineWorkOrdersMock} from '../schedulingWorkspaceTimeline/schedulingMachineWorkOrdersMock';
import {demoTimelineLines} from '../schedulingWorkspaceTimeline/mock';
import type {
  OeeDayPoint,
  V2ColumnLine,
  V2DateRange,
  V2ObjectCategoryConfig,
  V2TimelineEvent,
  V2UnplannedWorkOrder,
} from './types';

export const V2_REFERENCE_DATE = '2026-05-15';

export const v2DefaultDateRange: V2DateRange = {
  startDate: '2026-05-15',
  endDate: '2026-05-17',
  shortcut: 'ThreeDays',
};

export const V2_DAY_START_HOUR = 0;
export const V2_DAY_END_HOUR = 24;
export const V2_ROW_HEIGHT = 48;
export const V2_COLUMN_WIDTH = 140;
export const V2_DATE_COL_WIDTH = 30;
export const V2_HOUR_COL_WIDTH = 46;
export const V2_TIME_COL_WIDTH = V2_DATE_COL_WIDTH + V2_HOUR_COL_WIDTH;

export const v2ObjectCategories: V2ObjectCategoryConfig[] = [
  {id: 'work-orders', label: 'Work Orders', color: '#2563EB', enabled: true},
  {id: 'maintenance', label: 'Maintenance', color: '#F59E0B', enabled: false},
  {id: 'Downtime', label: 'Downtime', color: '#b910ae', enabled: false},
  {id: 'changeover', label: 'Changeover / Setup', color: '#10B981', enabled: false},
  {id: 'quality-hold', label: 'Quality Hold', color: '#DC2626', enabled: false},
  {id: 'cleaning', label: 'Cleaning', color: '#8B5CF6', enabled: false},
];

function genOeeDays(refDate: string, count: number): string[] {
  const days: string[] = [];
  const base = new Date(refDate);
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function genOeeTrend(baseUtil: number, seed: number, days: string[]): OeeDayPoint[] {
  return days.map((day, i) => ({
    day,
    value: Math.min(100, Math.max(30, Math.round(baseUtil + Math.sin(i * seed + seed) * 14))),
  }));
}

const OEE_TREND_DAYS = genOeeDays(V2_REFERENCE_DATE, 7);

export const v2Lines: V2ColumnLine[] = demoTimelineLines.slice(0, 4).map((line, li) => ({
  id: line.id,
  label: line.name,
  shortLabel: `Line ${line.id.replace('line-', '')}`,
  status: line.status,
  utilizationPercent: line.utilizationPercent,
  expanded: true,
  oeeTrend: genOeeTrend(line.utilizationPercent, li + 1.3, OEE_TREND_DAYS),
  machines: schedulingMachinesMock
    .filter((m) => m.lineId === line.id)
    .map((m, mi) => ({
      id: m.id,
      lineId: m.lineId,
      label: m.name,
      shortLabel: m.name.split(' ')[0] ?? m.name,
      status: m.status,
      utilizationPercent: m.utilizationPercent,
      oeeTrend: genOeeTrend(m.utilizationPercent, (li + 1) * 0.7 + mi * 1.1, OEE_TREND_DAYS),
    })),
}));

export const v2PlannedWorkOrders = schedulingMachineWorkOrdersMock.filter((wo) =>
  v2Lines.some((l) => l.id === wo.lineId),
);

export const v2UnplannedWorkOrders: V2UnplannedWorkOrder[] = [
  {
    id: 'unpl-001',
    woNumber: 'WO-100310',
    productCode: 'FG-1003',
    productDescription: 'Standard Tube C',
    quantity: 20000,
    uom: 'PCS',
    priority: 'High',
    dueDate: '2026-05-17',
    durationHours: 4,
    materialRisk: 'Low',
    qualityRisk: 'None',
    laborRisk: 'None',
  },
  {
    id: 'unpl-002',
    woNumber: 'WO-200155',
    productCode: 'FG-2002',
    productDescription: 'Additive Tube Premium',
    quantity: 14000,
    uom: 'PCS',
    priority: 'Critical',
    dueDate: '2026-05-16',
    durationHours: 3,
    materialRisk: 'High',
    qualityRisk: 'None',
    laborRisk: 'Low',
  },
  {
    id: 'unpl-003',
    woNumber: 'WO-300140',
    productCode: 'FG-4002',
    productDescription: 'Specialty Pack B',
    quantity: 4800,
    uom: 'PCS',
    priority: 'Medium',
    dueDate: '2026-05-18',
    durationHours: 5,
    materialRisk: 'None',
    qualityRisk: 'Medium',
    laborRisk: 'None',
  },
  {
    id: 'unpl-004',
    woNumber: 'WO-400060',
    productCode: 'FG-3002',
    productDescription: 'Gel Product Premium',
    quantity: 16000,
    uom: 'PCS',
    priority: 'Low',
    dueDate: '2026-05-19',
    durationHours: 6,
    materialRisk: 'None',
    qualityRisk: 'None',
    laborRisk: 'None',
  },
  {
    id: 'unpl-005',
    woNumber: 'WO-500110',
    productCode: 'FG-5002',
    productDescription: 'Low Volume SKU B',
    quantity: 1200,
    uom: 'PCS',
    priority: 'High',
    dueDate: '2026-05-16',
    durationHours: 2,
    materialRisk: 'None',
    qualityRisk: 'None',
    laborRisk: 'Medium',
  },
];

// Events: machine-10a has maintenance+cleaning overlap; machine-20a has maintenance+downtime overlap;
// machine-40a has maintenance+cleaning overlap.
export const v2TimelineEvents: V2TimelineEvent[] = [
  // line-10 / machine-10a: maintenance 04:00–07:00 + cleaning 05:30–08:00 → overlap 05:30–07:00
  {id: 'ev-001', machineId: 'machine-10a', lineId: 'line-10', type: 'maintenance', label: 'Preventive Maintenance', startDateTime: '2026-05-15T04:00:00', endDateTime: '2026-05-15T07:00:00'},
  {id: 'ev-002', machineId: 'machine-10a', lineId: 'line-10', type: 'cleaning',    label: 'Pre-Run Deep Clean',    startDateTime: '2026-05-15T05:30:00', endDateTime: '2026-05-15T08:00:00'},

  // line-10 / machine-10c: unplanned downtime
  {id: 'ev-003', machineId: 'machine-10c', lineId: 'line-10', type: 'downtime',    label: 'Label Jam – Unplanned', startDateTime: '2026-05-16T08:00:00', endDateTime: '2026-05-16T11:00:00'},

  // line-20 / machine-20a: maintenance 08:00–11:00 + downtime 09:30–12:30 → overlap 09:30–11:00
  {id: 'ev-004', machineId: 'machine-20a', lineId: 'line-20', type: 'maintenance', label: 'Scheduled Maintenance',  startDateTime: '2026-05-15T08:00:00', endDateTime: '2026-05-15T11:00:00'},
  {id: 'ev-005', machineId: 'machine-20a', lineId: 'line-20', type: 'downtime',    label: 'Capper Fault',          startDateTime: '2026-05-15T09:30:00', endDateTime: '2026-05-15T12:30:00'},

  // line-20 / machine-20b: cleaning
  {id: 'ev-006', machineId: 'machine-20b', lineId: 'line-20', type: 'cleaning',    label: 'End-of-Run Cleaning',   startDateTime: '2026-05-16T06:00:00', endDateTime: '2026-05-16T08:00:00'},

  // line-30 / machine-30b: long downtime (machine is Down per status)
  {id: 'ev-007', machineId: 'machine-30b', lineId: 'line-30', type: 'downtime',    label: 'Servo Fault – Robot Down', startDateTime: '2026-05-15T06:00:00', endDateTime: '2026-05-16T06:00:00'},

  // line-30 / machine-30d: cleaning
  {id: 'ev-008', machineId: 'machine-30d', lineId: 'line-30', type: 'cleaning',    label: 'Shift-End Clean',       startDateTime: '2026-05-17T05:00:00', endDateTime: '2026-05-17T07:00:00'},

  // line-40 / machine-40a: maintenance 01:00–05:00 + cleaning 03:00–06:00 → overlap 03:00–05:00
  {id: 'ev-009', machineId: 'machine-40a', lineId: 'line-40', type: 'maintenance', label: 'Sterilizer Overhaul',    startDateTime: '2026-05-16T01:00:00', endDateTime: '2026-05-16T05:00:00'},
  {id: 'ev-010', machineId: 'machine-40a', lineId: 'line-40', type: 'cleaning',    label: 'Chamber Cleaning',      startDateTime: '2026-05-16T03:00:00', endDateTime: '2026-05-16T06:00:00'},
];

export function generateV2TimeSlots(startDate: string, endDate: string) {
  const slots: Array<{day: string; dayLabel: string; hour: number; hourLabel: string; id: string}> = [];
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T23:59:59`);
  const current = new Date(start);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    const dayLabel = `${dayNames[current.getDay()]}, ${monthNames[current.getMonth()]} ${current.getDate()}`;
    for (let h = V2_DAY_START_HOUR; h < V2_DAY_END_HOUR; h++) {
      slots.push({
        day: dateStr,
        dayLabel,
        hour: h,
        hourLabel: `${String(h).padStart(2, '0')}:00`,
        id: `${dateStr}-${h}`,
      });
    }
    current.setDate(current.getDate() + 1);
  }
  return slots;
}

export function getDateOffsetDays(baseDate: string, days: number): string {
  const d = new Date(`${baseDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
