import type {
  AiCapacityProposal,
  CapacityAction,
  CapacityByLine,
  CapacityByLineMachines,
  CapacityDay,
  CapacityKpis,
  CapacityLine,
  CapacityLineDetail,
  CapacityMachine,
  CapacityMonth,
  CapacityMonthDrilldown,
  CapacityScenario,
  CapacitySiteArea,
  CapacityWeek,
  DailyCapacityPoint,
  EquipmentLedgerEntry,
  EquipmentOeePoint,
  HistoricalActualCapacity,
  LineDesignCapacity,
  LineShiftSchedule,
  PlanningAssumption,
  UtilizationStatus,
} from './types';
import {getUtilizationStatus} from './utils';

const MONTHS = [
  'Jun-2026', 'Jul-2026', 'Aug-2026', 'Sep-2026', 'Oct-2026', 'Nov-2026',
  'Dec-2026', 'Jan-2027', 'Feb-2027', 'Mar-2027', 'Apr-2027', 'May-2027',
];

export const capacityKpis: CapacityKpis = {
  totalDemand: 1245320,
  requiredCapacity: 1551400,
  availableCapacity: 1452800,
  capacityGap: -98600,
  avgUtilization: 94,
  overloadedMonths: ['Mar-2027', 'Apr-2027'],
  bottleneckLine: 'Line 10',
  bottleneckMonth: 'Mar-2027',
  planningConfidence: 'High',
  totalDemandDelta: 6.4,
  requiredCapacityDelta: 7.2,
  availableCapacityDelta: 2.1,
};

export const capacityScenarios: CapacityScenario[] = [
  {id: 'baseline', label: 'Baseline'},
  {id: 'capacity-recovery', label: 'Capacity Recovery'},
  {id: 'demand-upside', label: 'Demand Upside'},
];

export const capacityLines: CapacityLine[] = [
  {id: 'line-10', name: 'Line 10', availableHrs: 136000, requiredHrs: 160800, utilizationPct: 118, status: 'Overloaded', position: {x: '56%', y: '18%'}},
  {id: 'line-07', name: 'Line 07', availableHrs: 126000, requiredHrs: 143640, utilizationPct: 114, status: 'Overloaded', position: {x: '72%', y: '28%'}},
  {id: 'line-03', name: 'Line 03', availableHrs: 113000, requiredHrs: 122040, utilizationPct: 108, status: 'AtRisk', position: {x: '22%', y: '32%'}},
  {id: 'line-05', name: 'Line 05', availableHrs: 125000, requiredHrs: 135000, utilizationPct: 108, status: 'AtRisk', position: {x: '42%', y: '40%'}},
  {id: 'line-01', name: 'Line 01', availableHrs: 139000, requiredHrs: 127880, utilizationPct: 92, status: 'OK', position: {x: '66%', y: '44%'}},
  {id: 'line-02', name: 'Line 02', availableHrs: 139000, requiredHrs: 118150, utilizationPct: 85, status: 'OK', position: {x: '46%', y: '62%'}},
];

function makeMonthRow(available: number, base: number, overloadMonths: number[]): CapacityMonth[] {
  return MONTHS.map((month, i) => {
    const mult = overloadMonths.includes(i) ? 1.18 : 0.85 + Math.random() * 0.2;
    const required = Math.round(available * mult);
    const pct = Math.round((required / available) * 100);
    const status = pct > 120 ? 'Overloaded' : pct > 105 ? 'AtRisk' : pct > 90 ? 'AtRisk' : 'OK';
    return {month, available, required, utilizationPct: pct, status};
  });
}

export const capacityByLine: CapacityByLine[] = [
  {
    lineId: 'line-10', lineName: 'Line 10',
    months: [
      {month:'Jun-2026', available:110000, required:101200, utilizationPct:92, status:'OK'},
      {month:'Jul-2026', available:108000, required:102600, utilizationPct:95, status:'OK'},
      {month:'Aug-2026', available:112000, required:109760, utilizationPct:98, status:'OK'},
      {month:'Sep-2026', available:110000, required:109890, utilizationPct:100, status:'OK'},
      {month:'Oct-2026', available:116000, required:113680, utilizationPct:98, status:'OK'},
      {month:'Nov-2026', available:110000, required:104500, utilizationPct:95, status:'OK'},
      {month:'Dec-2026', available:114000, required:108300, utilizationPct:95, status:'OK'},
      {month:'Jan-2027', available:108000, required:99360, utilizationPct:92, status:'OK'},
      {month:'Feb-2027', available:114000, required:108300, utilizationPct:95, status:'OK'},
      {month:'Mar-2027', available:136000, required:160800, utilizationPct:118, status:'Overloaded'},
      {month:'Apr-2027', available:126000, required:143640, utilizationPct:114, status:'Overloaded'},
      {month:'May-2027', available:114000, required:107160, utilizationPct:94, status:'OK'},
    ],
    totalAvail: 1308000, totalReq: 1388000,
  },
  {
    lineId: 'line-07', lineName: 'Line 07',
    months: [
      {month:'Jun-2026', available:110000, required:99000, utilizationPct:90, status:'OK'},
      {month:'Jul-2026', available:108000, required:100440, utilizationPct:93, status:'OK'},
      {month:'Aug-2026', available:120000, required:115200, utilizationPct:96, status:'OK'},
      {month:'Sep-2026', available:136000, required:131920, utilizationPct:97, status:'OK'},
      {month:'Oct-2026', available:116000, required:116000, utilizationPct:100, status:'OK'},
      {month:'Nov-2026', available:116000, required:106720, utilizationPct:92, status:'OK'},
      {month:'Dec-2026', available:118000, required:107380, utilizationPct:91, status:'OK'},
      {month:'Jan-2027', available:112000, required:100800, utilizationPct:90, status:'OK'},
      {month:'Feb-2027', available:118000, required:112100, utilizationPct:95, status:'OK'},
      {month:'Mar-2027', available:126000, required:143640, utilizationPct:114, status:'Overloaded'},
      {month:'Apr-2027', available:108000, required:116640, utilizationPct:108, status:'AtRisk'},
      {month:'May-2027', available:115000, required:109250, utilizationPct:95, status:'OK'},
    ],
    totalAvail: 1208000, totalReq: 1320000,
  },
  {
    lineId: 'line-03', lineName: 'Line 03',
    months: [
      {month:'Jun-2026', available:113000, required:101700, utilizationPct:90, status:'OK'},
      {month:'Jul-2026', available:120000, required:111600, utilizationPct:93, status:'OK'},
      {month:'Aug-2026', available:130000, required:124800, utilizationPct:96, status:'OK'},
      {month:'Sep-2026', available:130000, required:127400, utilizationPct:98, status:'OK'},
      {month:'Oct-2026', available:128000, required:122880, utilizationPct:96, status:'OK'},
      {month:'Nov-2026', available:112000, required:100800, utilizationPct:90, status:'OK'},
      {month:'Dec-2026', available:112000, required:98560, utilizationPct:88, status:'OK'},
      {month:'Jan-2027', available:120000, required:103200, utilizationPct:86, status:'OK'},
      {month:'Feb-2027', available:122000, required:110000, utilizationPct:90, status:'OK'},
      {month:'Mar-2027', available:113000, required:122040, utilizationPct:108, status:'AtRisk'},
      {month:'Apr-2027', available:108000, required:111240, utilizationPct:103, status:'AtRisk'},
      {month:'May-2027', available:130000, required:114400, utilizationPct:88, status:'OK'},
    ],
    totalAvail: 1132000, totalReq: 1224000,
  },
  {
    lineId: 'line-05', lineName: 'Line 05',
    months: [
      {month:'Jun-2026', available:133000, required:117040, utilizationPct:88, status:'OK'},
      {month:'Jul-2026', available:138000, required:126960, utilizationPct:92, status:'OK'},
      {month:'Aug-2026', available:123000, required:113160, utilizationPct:92, status:'OK'},
      {month:'Sep-2026', available:130000, required:120900, utilizationPct:93, status:'OK'},
      {month:'Oct-2026', available:128000, required:111360, utilizationPct:87, status:'OK'},
      {month:'Nov-2026', available:126000, required:107100, utilizationPct:85, status:'OK'},
      {month:'Dec-2026', available:126000, required:113400, utilizationPct:90, status:'OK'},
      {month:'Jan-2027', available:126000, required:113400, utilizationPct:90, status:'OK'},
      {month:'Feb-2027', available:125000, required:113750, utilizationPct:91, status:'OK'},
      {month:'Mar-2027', available:133000, required:143640, utilizationPct:108, status:'AtRisk'},
      {month:'Apr-2027', available:133000, required:139650, utilizationPct:105, status:'AtRisk'},
      {month:'May-2027', available:133000, required:122360, utilizationPct:92, status:'OK'},
    ],
    totalAvail: 1096000, totalReq: 1096000,
  },
  {
    lineId: 'line-02', lineName: 'Line 02',
    months: [
      {month:'Jun-2026', available:139000, required:118150, utilizationPct:85, status:'OK'},
      {month:'Jul-2026', available:155000, required:136400, utilizationPct:88, status:'OK'},
      {month:'Aug-2026', available:136000, required:126480, utilizationPct:93, status:'OK'},
      {month:'Sep-2026', available:156000, required:141960, utilizationPct:91, status:'OK'},
      {month:'Oct-2026', available:136000, required:122400, utilizationPct:90, status:'OK'},
      {month:'Nov-2026', available:136000, required:115600, utilizationPct:85, status:'OK'},
      {month:'Dec-2026', available:130000, required:113100, utilizationPct:87, status:'OK'},
      {month:'Jan-2027', available:130000, required:110500, utilizationPct:85, status:'OK'},
      {month:'Feb-2027', available:135000, required:119340, utilizationPct:88, status:'OK'},
      {month:'Mar-2027', available:186000, required:189720, utilizationPct:102, status:'AtRisk'},
      {month:'Apr-2027', available:135000, required:136350, utilizationPct:101, status:'AtRisk'},
      {month:'May-2027', available:126000, required:113400, utilizationPct:90, status:'OK'},
    ],
    totalAvail: 804000, totalReq: 835000,
  },
];

export const capacitySiteAreas: CapacitySiteArea[] = [
  {area: 'Building 1 (Lines)', availableHrs: 520800, requiredHrs: 589200, utilizationPct: 113, status: 'Overloaded'},
  {area: 'Building 2 (Lines)', availableHrs: 412400, requiredHrs: 398600, utilizationPct: 97, status: 'AtRisk'},
  {area: 'Warehouse', availableHrs: 80000, requiredHrs: 62400, utilizationPct: 78, status: 'OK'},
  {area: 'Utilities', availableHrs: null, requiredHrs: null, utilizationPct: null, status: 'NA'},
  {area: 'Total', availableHrs: 1013200, requiredHrs: 1050200, utilizationPct: 104, status: 'AtRisk'},
];

export const line10Detail: CapacityLineDetail = {
  lineId: 'line-10',
  month: 'Mar-2027',
  availableHrs: 136000,
  requiredHrs: 160800,
  utilizationPct: 118,
  capacityGap: -24800,
  bottleneckReason: 'Demand peak + Planned downtime',
  mainProducts: ['Family A', 'Family B'],
  topConstraints: ['Planned Downtime', 'Changeovers'],
};

export const lineDetails: Record<string, CapacityLineDetail> = {
  'line-10': line10Detail,
  'line-07': {lineId:'line-07', month:'Mar-2027', availableHrs:126000, requiredHrs:143640, utilizationPct:114, capacityGap:-17640, bottleneckReason:'High demand volume', mainProducts:['Family C'], topConstraints:['Changeovers']},
  'line-03': {lineId:'line-03', month:'Mar-2027', availableHrs:113000, requiredHrs:122040, utilizationPct:108, capacityGap:-9040, bottleneckReason:'Staffing constraint', mainProducts:['Family A','Family D'], topConstraints:['Labor Gap']},
  'line-05': {lineId:'line-05', month:'Mar-2027', availableHrs:133000, requiredHrs:143640, utilizationPct:108, capacityGap:-10640, bottleneckReason:'Campaign overlap', mainProducts:['Family B'], topConstraints:['Campaign Overlap','Changeovers']},
  'line-01': {lineId:'line-01', month:'Mar-2027', availableHrs:139000, requiredHrs:127880, utilizationPct:92, capacityGap:11120, bottleneckReason:'None', mainProducts:['Family E'], topConstraints:[]},
  'line-02': {lineId:'line-02', month:'Mar-2027', availableHrs:186000, requiredHrs:189720, utilizationPct:102, capacityGap:-3720, bottleneckReason:'Minor scheduling gap', mainProducts:['Family F'], topConstraints:['Scheduling Gap']},
};

export const dailyCapacityProfile: DailyCapacityPoint[] = Array.from({length: 29}, (_, i) => {
  const day = i + 1;
  const available = 4800 + Math.sin(i * 0.4) * 600;
  const required = 5800 + Math.sin(i * 0.3 + 1) * 900;
  return {day, available: Math.round(available), required: Math.round(required), gap: Math.round(available - required)};
});

export const recentActions: CapacityAction[] = [
  {timestamp: '24-May-2026 10:15', description: 'Capacity Recovery scenario created', user: 'You'},
  {timestamp: '24-May-2026 09:47', description: 'Overtime added for line 225 hrs', user: 'You'},
  {timestamp: '24-May-2026 08:32', description: 'Planned maintenance moved (Jan-25)', user: 'You'},
];

export const nextSteps = [
  'Review scenarios',
  'Adjust site commitment',
  'Validate with stakeholders',
  'Submit for approval',
];

// ── Machine-level capacity data ───────────────────────────────────────────────

function makeMachineMonths(lineMonths: CapacityMonth[], pct: number): CapacityMonth[] {
  return lineMonths.map((m) => {
    const available = Math.round(m.available * pct);
    const required = Math.round(m.required * pct);
    const utilizationPct = available > 0 ? Math.round((required / available) * 100) : 0;
    const status: UtilizationStatus = utilizationPct > 120 ? 'Overloaded'
      : utilizationPct > 105 ? 'AtRisk'
      : utilizationPct >= 90 ? 'AtRisk'
      : 'OK';
    return {month: m.month, available, required, utilizationPct, status};
  });
}

function makeMachine(id: string, name: string, lineId: string, lineMonths: CapacityMonth[], pct: number): CapacityMachine {
  const months = makeMachineMonths(lineMonths, pct);
  return {
    machineId: id, machineName: name, lineId,
    months,
    totalAvail: months.reduce((s, m) => s + m.available, 0),
    totalReq: months.reduce((s, m) => s + m.required, 0),
  };
}

function addMachines(line: CapacityByLine, machines: CapacityMachine[]): CapacityByLineMachines {
  return {...line, machines};
}

export const capacityByLineMachines: CapacityByLineMachines[] = (() => {
  const [l10, l07, l03, l05, l02] = capacityByLine;
  return [
    addMachines(l10, [
      makeMachine('mch-10-a', 'Press 01',     'line-10', l10.months, 0.45),
      makeMachine('mch-10-b', 'Press 02',     'line-10', l10.months, 0.35),
      makeMachine('mch-10-c', 'Assembly 01',  'line-10', l10.months, 0.20),
    ]),
    addMachines(l07, [
      makeMachine('mch-07-a', 'Injection 01', 'line-07', l07.months, 0.55),
      makeMachine('mch-07-b', 'Injection 02', 'line-07', l07.months, 0.45),
    ]),
    addMachines(l03, [
      makeMachine('mch-03-a', 'Stamping 01',  'line-03', l03.months, 0.50),
      makeMachine('mch-03-b', 'Stamping 02',  'line-03', l03.months, 0.30),
      makeMachine('mch-03-c', 'Welding 01',   'line-03', l03.months, 0.20),
    ]),
    addMachines(l05, [
      makeMachine('mch-05-a', 'Forming 01',   'line-05', l05.months, 0.60),
      makeMachine('mch-05-b', 'Forming 02',   'line-05', l05.months, 0.40),
    ]),
    addMachines(l02, [
      makeMachine('mch-02-a', 'Extrusion 01', 'line-02', l02.months, 0.55),
      makeMachine('mch-02-b', 'Extrusion 02', 'line-02', l02.months, 0.45),
    ]),
  ];
})();

export const BY_LINE_SCENARIO_ID = 'capacity-recovery';
export const BY_LINE_SCENARIO_LABEL = 'Capacity Recovery';
export const CURRENT_USER = 'You';
export const initialScenarioOverrides: Record<string, number> = {};

// ── Shift Schedules ──────────────────────────────────────────────────────────

export const lineShiftSchedules: LineShiftSchedule[] = [
  {
    lineId: 'line-10', shiftsPerDay: 3, daysPerWeek: 5, workingDaysPerMonth: 22,
    shifts: [
      {name: 'Morning',   startTime: '06:00', endTime: '14:00', hoursPerShift: 8},
      {name: 'Afternoon', startTime: '14:00', endTime: '22:00', hoursPerShift: 8},
      {name: 'Night',     startTime: '22:00', endTime: '06:00', hoursPerShift: 8},
    ],
  },
  {
    lineId: 'line-07', shiftsPerDay: 3, daysPerWeek: 5, workingDaysPerMonth: 22,
    shifts: [
      {name: 'Morning',   startTime: '06:00', endTime: '14:00', hoursPerShift: 8},
      {name: 'Afternoon', startTime: '14:00', endTime: '22:00', hoursPerShift: 8},
      {name: 'Night',     startTime: '22:00', endTime: '06:00', hoursPerShift: 8},
    ],
  },
  {
    lineId: 'line-03', shiftsPerDay: 2, daysPerWeek: 5, workingDaysPerMonth: 22,
    shifts: [
      {name: 'Morning',   startTime: '07:00', endTime: '15:00', hoursPerShift: 8},
      {name: 'Afternoon', startTime: '15:00', endTime: '23:00', hoursPerShift: 8},
    ],
  },
  {
    lineId: 'line-05', shiftsPerDay: 2, daysPerWeek: 5, workingDaysPerMonth: 22,
    shifts: [
      {name: 'Morning',   startTime: '07:00', endTime: '15:00', hoursPerShift: 8},
      {name: 'Afternoon', startTime: '15:00', endTime: '23:00', hoursPerShift: 8},
    ],
  },
  {
    lineId: 'line-01', shiftsPerDay: 3, daysPerWeek: 5, workingDaysPerMonth: 22,
    shifts: [
      {name: 'Morning',   startTime: '06:00', endTime: '14:00', hoursPerShift: 8},
      {name: 'Afternoon', startTime: '14:00', endTime: '22:00', hoursPerShift: 8},
      {name: 'Night',     startTime: '22:00', endTime: '06:00', hoursPerShift: 8},
    ],
  },
  {
    lineId: 'line-02', shiftsPerDay: 3, daysPerWeek: 7, workingDaysPerMonth: 30,
    shifts: [
      {name: 'Morning',   startTime: '06:00', endTime: '14:00', hoursPerShift: 8},
      {name: 'Afternoon', startTime: '14:00', endTime: '22:00', hoursPerShift: 8},
      {name: 'Night',     startTime: '22:00', endTime: '06:00', hoursPerShift: 8},
    ],
  },
];

// ── Month Drilldown Generator ─────────────────────────────────────────────────

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function parseMonthStart(month: string): Date {
  const [mon, year] = month.split('-');
  return new Date(parseInt(year), MONTH_NAMES.indexOf(mon), 1);
}

function buildWeeks(month: string, availHrs: number, reqHrs: number): CapacityWeek[] {
  const start = parseMonthStart(month);
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();

  const workingDays: number[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = new Date(start.getFullYear(), start.getMonth(), d).getDay();
    if (dow >= 1 && dow <= 5) workingDays.push(d);
  }

  const hrsPerDay = workingDays.length > 0 ? availHrs / workingDays.length : 0;
  const reqPerDay = workingDays.length > 0 ? reqHrs / workingDays.length : 0;

  // Group days into Mon-starting weeks
  const weekMap = new Map<number, number[]>();
  for (const d of workingDays) {
    const date = new Date(start.getFullYear(), start.getMonth(), d);
    const monday = new Date(date);
    monday.setDate(d - ((date.getDay() + 6) % 7)); // Monday of that week
    const weekKey = monday.getDate() + monday.getMonth() * 100;
    if (!weekMap.has(weekKey)) weekMap.set(weekKey, []);
    weekMap.get(weekKey)!.push(d);
  }

  const weeks: CapacityWeek[] = [];
  let weekIdx = 1;
  for (const [, days] of weekMap) {
    const seed = weekIdx * 7;
    const capacityDays: CapacityDay[] = days.map((d, i) => {
      const variation = 0.9 + ((seed + i * 13) % 20) / 100; // deterministic 0.90–1.10
      const avail = Math.round(hrsPerDay * variation);
      const req = Math.round(reqPerDay * (0.92 + ((seed + i * 7) % 16) / 100));
      const pct = avail > 0 ? Math.round((req / avail) * 100) : 0;
      const dow = new Date(start.getFullYear(), start.getMonth(), d).getDay();
      return {
        date: `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        dayLabel: `${DAY_NAMES[dow]} ${d}`,
        isWorkingDay: true,
        available: avail,
        required: req,
        utilizationPct: pct,
        status: getUtilizationStatus(pct),
      };
    });
    const wAvail = capacityDays.reduce((s, d) => s + d.available, 0);
    const wReq = capacityDays.reduce((s, d) => s + d.required, 0);
    const wPct = wAvail > 0 ? Math.round((wReq / wAvail) * 100) : 0;
    const firstDay = new Date(start.getFullYear(), start.getMonth(), days[0]);
    const lastDay = new Date(start.getFullYear(), start.getMonth(), days[days.length - 1]);
    weeks.push({
      weekLabel: `W${weekIdx}`,
      startDate: firstDay.toISOString().slice(0, 10),
      endDate: lastDay.toISOString().slice(0, 10),
      days: capacityDays,
      available: wAvail,
      required: wReq,
      utilizationPct: wPct,
      status: getUtilizationStatus(wPct),
    });
    weekIdx++;
  }
  return weeks;
}

function buildDrilldown(
  lineId: string,
  lineName: string,
  month: string,
  availHrs: number,
  reqHrs: number,
  machines: {machineId: string; machineName: string; machinePct: number}[],
): CapacityMonthDrilldown {
  return {
    lineId,
    lineName,
    month,
    weeks: buildWeeks(month, availHrs, reqHrs),
    machines: machines.map(({machineId, machineName, machinePct}) => ({
      machineId,
      machineName,
      weeks: buildWeeks(month, Math.round(availHrs * machinePct), Math.round(reqHrs * machinePct)),
    })),
  };
}

export const capacityMonthDrilldowns: Record<string, CapacityMonthDrilldown> = (() => {
  const result: Record<string, CapacityMonthDrilldown> = {};
  const lineDefs: {lineId: string; lineName: string; machines: {machineId: string; machineName: string; machinePct: number}[]}[] = [
    {lineId: 'line-10', lineName: 'Line 10', machines: [{machineId:'mch-10-a', machineName:'Press 01', machinePct:0.45}, {machineId:'mch-10-b', machineName:'Press 02', machinePct:0.35}, {machineId:'mch-10-c', machineName:'Assembly 01', machinePct:0.20}]},
    {lineId: 'line-07', lineName: 'Line 07', machines: [{machineId:'mch-07-a', machineName:'Injection 01', machinePct:0.55}, {machineId:'mch-07-b', machineName:'Injection 02', machinePct:0.45}]},
    {lineId: 'line-03', lineName: 'Line 03', machines: [{machineId:'mch-03-a', machineName:'Stamping 01', machinePct:0.50}, {machineId:'mch-03-b', machineName:'Stamping 02', machinePct:0.30}, {machineId:'mch-03-c', machineName:'Welding 01', machinePct:0.20}]},
    {lineId: 'line-05', lineName: 'Line 05', machines: [{machineId:'mch-05-a', machineName:'Forming 01', machinePct:0.60}, {machineId:'mch-05-b', machineName:'Forming 02', machinePct:0.40}]},
    {lineId: 'line-02', lineName: 'Line 02', machines: [{machineId:'mch-02-a', machineName:'Extrusion 01', machinePct:0.55}, {machineId:'mch-02-b', machineName:'Extrusion 02', machinePct:0.45}]},
  ];

  for (const line of lineDefs) {
    const lineMonths = capacityByLine.find((l) => l.lineId === line.lineId)?.months ?? [];
    for (const m of lineMonths) {
      const key = `${line.lineId}-${m.month}`;
      result[key] = buildDrilldown(line.lineId, line.lineName, m.month, m.available, m.required, line.machines);
    }
  }
  return result;
})();

// ── Design Capacities ─────────────────────────────────────────────────────────

export const lineDesignCapacities: LineDesignCapacity[] = [
  {lineId: 'line-10', designHrsPerMonth: 132000, designShiftsPerDay: 3, designDaysPerWeek: 5, designHrsPerShift: 8, nominalOeePct: 85, designRatePerHr: 180, rateUnit: 'pcs/hr'},
  {lineId: 'line-07', designHrsPerMonth: 126000, designShiftsPerDay: 3, designDaysPerWeek: 5, designHrsPerShift: 8, nominalOeePct: 82, designRatePerHr: 150, rateUnit: 'pcs/hr'},
  {lineId: 'line-03', designHrsPerMonth:  88000, designShiftsPerDay: 2, designDaysPerWeek: 5, designHrsPerShift: 8, nominalOeePct: 80, designRatePerHr:  95, rateUnit: 'pcs/hr'},
  {lineId: 'line-05', designHrsPerMonth:  88000, designShiftsPerDay: 2, designDaysPerWeek: 5, designHrsPerShift: 8, nominalOeePct: 83, designRatePerHr: 110, rateUnit: 'pcs/hr'},
  {lineId: 'line-01', designHrsPerMonth: 132000, designShiftsPerDay: 3, designDaysPerWeek: 5, designHrsPerShift: 8, nominalOeePct: 88, designRatePerHr: 200, rateUnit: 'pcs/hr'},
  {lineId: 'line-02', designHrsPerMonth: 180000, designShiftsPerDay: 3, designDaysPerWeek: 7, designHrsPerShift: 8, nominalOeePct: 86, designRatePerHr: 240, rateUnit: 'pcs/hr'},
];

// ── Planning Assumptions ──────────────────────────────────────────────────────

export const planningAssumptions: PlanningAssumption[] = [
  {lineId: 'line-10', planningEfficiencyFactor: 0.88, plannedShiftsPerDay: 3, plannedDaysPerWeek: 5, effectivePlanningHrsPerMonth: 116160, notes: 'Includes 2 planned maintenance windows per quarter.', lastUpdatedBy: 'M.Silva', lastUpdatedAt: '2026-04-15'},
  {lineId: 'line-07', planningEfficiencyFactor: 0.86, plannedShiftsPerDay: 3, plannedDaysPerWeek: 5, effectivePlanningHrsPerMonth: 108360, notes: 'Reduced factor due to changeover frequency.', lastUpdatedBy: 'A.Torres', lastUpdatedAt: '2026-04-10'},
  {lineId: 'line-03', planningEfficiencyFactor: 0.90, plannedShiftsPerDay: 2, plannedDaysPerWeek: 5, effectivePlanningHrsPerMonth:  79200, notes: 'Stable line; higher factor reflects good OEE trend.', lastUpdatedBy: 'P.Costa', lastUpdatedAt: '2026-03-22'},
  {lineId: 'line-05', planningEfficiencyFactor: 0.87, plannedShiftsPerDay: 2, plannedDaysPerWeek: 5, effectivePlanningHrsPerMonth:  76560, notes: 'Campaign-based scheduling; volatility expected.', lastUpdatedBy: 'P.Costa', lastUpdatedAt: '2026-03-22'},
  {lineId: 'line-01', planningEfficiencyFactor: 0.92, plannedShiftsPerDay: 3, plannedDaysPerWeek: 5, effectivePlanningHrsPerMonth: 121440, notes: 'Best-performing line; factor reflects mature process.', lastUpdatedBy: 'R.Lima', lastUpdatedAt: '2026-05-01'},
  {lineId: 'line-02', planningEfficiencyFactor: 0.84, plannedShiftsPerDay: 3, plannedDaysPerWeek: 7, effectivePlanningHrsPerMonth: 151200, notes: '7-day operation; lower factor for weekend maintenance.', lastUpdatedBy: 'R.Lima', lastUpdatedAt: '2026-04-28'},
];

// ── Historical Actual Capacity ────────────────────────────────────────────────

const HIST_MONTHS = ['Jun-2025','Jul-2025','Aug-2025','Sep-2025','Oct-2025','Nov-2025','Dec-2025','Jan-2026','Feb-2026','Mar-2026','Apr-2026','May-2026'];

function buildHistory(lineId: string, designHrs: number, planFactor: number): HistoricalActualCapacity[] {
  const plannedHrs = Math.round(designHrs * planFactor);
  return HIST_MONTHS.map((month, i) => {
    const trend = 0.95 + i * 0.004; // slight upward trend
    const noise = 0.97 + ((lineId.charCodeAt(5) * (i + 3)) % 7) / 100;
    const actualHrs = Math.round(plannedHrs * trend * noise);
    return {
      lineId,
      month,
      actualHrs,
      plannedHrs,
      designHrs,
      utilizationVsPlan: Math.round((actualHrs / plannedHrs) * 100),
      utilizationVsDesign: Math.round((actualHrs / designHrs) * 100),
    };
  });
}

export const historicalActualCapacity: HistoricalActualCapacity[] = [
  ...buildHistory('line-10', 132000, 0.88),
  ...buildHistory('line-07', 126000, 0.86),
  ...buildHistory('line-03',  88000, 0.90),
  ...buildHistory('line-05',  88000, 0.87),
  ...buildHistory('line-01', 132000, 0.92),
  ...buildHistory('line-02', 180000, 0.84),
];

// ── AI Capacity Proposals ─────────────────────────────────────────────────────

// ── Equipment Detail Data ─────────────────────────────────────────────────────

function buildEquipmentOee(
  machineId: string,
  baseOee: number,
  baseRate: number,
): EquipmentOeePoint[] {
  return HIST_MONTHS.map((month, i) => {
    const seed = machineId.charCodeAt(machineId.length - 1) + i;
    const noise = (seed % 9) / 100 - 0.04;
    const oee = Math.max(60, Math.min(95, Math.round((baseOee + noise * 100 + i * 0.3) * 10) / 10));
    const availability = Math.min(98, Math.round((oee / 0.88 + noise * 20) * 10) / 10);
    const performance = Math.min(98, Math.round((oee / 0.92 + noise * 15) * 10) / 10);
    const quality = Math.min(99.5, Math.round((97 + noise * 10) * 10) / 10);
    const actualRate = Math.round(baseRate * (oee / 100));
    return {month, oee, availability, performance, quality, designRate: baseRate, actualRate};
  });
}

type MachineOeeDef = {machineId: string; baseOee: number; baseRate: number};
const machineOeeDefs: MachineOeeDef[] = [
  {machineId: 'mch-10-a', baseOee: 84, baseRate: 180},
  {machineId: 'mch-10-b', baseOee: 81, baseRate: 180},
  {machineId: 'mch-10-c', baseOee: 87, baseRate: 180},
  {machineId: 'mch-07-a', baseOee: 79, baseRate: 150},
  {machineId: 'mch-07-b', baseOee: 83, baseRate: 150},
  {machineId: 'mch-03-a', baseOee: 82, baseRate: 95},
  {machineId: 'mch-03-b', baseOee: 78, baseRate: 95},
  {machineId: 'mch-03-c', baseOee: 85, baseRate: 95},
  {machineId: 'mch-05-a', baseOee: 80, baseRate: 110},
  {machineId: 'mch-05-b', baseOee: 76, baseRate: 110},
  {machineId: 'mch-02-a', baseOee: 83, baseRate: 240},
  {machineId: 'mch-02-b', baseOee: 80, baseRate: 240},
];

export const equipmentOeeTrends: Record<string, EquipmentOeePoint[]> = Object.fromEntries(
  machineOeeDefs.map((d) => [d.machineId, buildEquipmentOee(d.machineId, d.baseOee, d.baseRate)]),
);

const ledgerTemplates: Record<string, EquipmentLedgerEntry[]> = {
  'mch-10-a': [
    {date: '2026-05-12', type: 'Planned Maintenance', duration: 8, description: 'Quarterly PM – lubrication, belt check', status: 'Closed'},
    {date: '2026-04-03', type: 'Unplanned Downtime', duration: 4, description: 'Hydraulic seal failure – replaced on-site', status: 'Closed'},
    {date: '2026-03-18', type: 'Changeover', duration: 3, description: 'Product family switch: Family A → B', status: 'Closed'},
    {date: '2026-02-25', type: 'Inspection', duration: 2, description: 'Annual safety inspection – passed', status: 'Closed'},
    {date: '2026-01-14', type: 'Repair', duration: 6, description: 'Die alignment correction', status: 'Closed'},
    {date: '2025-12-09', type: 'Calibration', duration: 1, description: 'Pressure sensor recalibration', status: 'Closed'},
    {date: '2025-11-20', type: 'Planned Maintenance', duration: 8, description: 'Semi-annual PM – full overhaul', status: 'Closed'},
  ],
  'mch-10-b': [
    {date: '2026-05-20', type: 'Unplanned Downtime', duration: 6, description: 'PLC fault – control board replaced', status: 'Open'},
    {date: '2026-04-15', type: 'Planned Maintenance', duration: 8, description: 'Quarterly PM – die inspection', status: 'Closed'},
    {date: '2026-03-02', type: 'Changeover', duration: 4, description: 'Product family switch: Family B → C', status: 'Closed'},
    {date: '2026-02-10', type: 'Repair', duration: 5, description: 'Punch guide worn – replaced', status: 'Closed'},
    {date: '2025-12-18', type: 'Inspection', duration: 2, description: 'Year-end condition monitoring', status: 'Closed'},
  ],
  'mch-10-c': [
    {date: '2026-05-05', type: 'Planned Maintenance', duration: 4, description: 'Monthly PM – conveyor and fixtures', status: 'Closed'},
    {date: '2026-04-22', type: 'Changeover', duration: 2, description: 'Fixture swap for new model run', status: 'Closed'},
    {date: '2026-03-08', type: 'Calibration', duration: 1, description: 'Torque tool calibration cycle', status: 'Closed'},
    {date: '2026-01-30', type: 'Inspection', duration: 3, description: 'Ergonomic safety audit', status: 'Closed'},
  ],
  'mch-07-a': [
    {date: '2026-05-18', type: 'Planned Maintenance', duration: 10, description: 'Major PM – screw and barrel inspection', status: 'Closed'},
    {date: '2026-04-07', type: 'Unplanned Downtime', duration: 7, description: 'Temperature controller fault', status: 'Closed'},
    {date: '2026-03-14', type: 'Changeover', duration: 5, description: 'Mold change – part number switch', status: 'Closed'},
    {date: '2026-01-21', type: 'Repair', duration: 9, description: 'Barrel wear – rebored and relined', status: 'Closed'},
    {date: '2025-11-05', type: 'Inspection', duration: 2, description: 'Hydraulic system leak check', status: 'Closed'},
  ],
  'mch-07-b': [
    {date: '2026-05-22', type: 'Changeover', duration: 4, description: 'Mold change – production schedule update', status: 'Closed'},
    {date: '2026-04-11', type: 'Planned Maintenance', duration: 8, description: 'Quarterly PM – clamping unit service', status: 'Closed'},
    {date: '2026-02-28', type: 'Repair', duration: 3, description: 'Ejector pin breakage – replaced set', status: 'Closed'},
    {date: '2025-12-03', type: 'Calibration', duration: 2, description: 'Injection pressure calibration', status: 'Closed'},
  ],
};

function defaultLedger(machineId: string): EquipmentLedgerEntry[] {
  return [
    {date: '2026-05-10', type: 'Planned Maintenance', duration: 6, description: 'Scheduled PM – general service', status: 'Closed'},
    {date: '2026-04-08', type: 'Inspection', duration: 2, description: 'Condition-based monitoring check', status: 'Closed'},
    {date: '2026-03-15', type: 'Changeover', duration: 3, description: 'Product changeover', status: 'Closed'},
    {date: '2026-02-20', type: 'Calibration', duration: 1, description: `${machineId} – sensor calibration`, status: 'Closed'},
  ];
}

export const equipmentLedgers: Record<string, EquipmentLedgerEntry[]> = Object.fromEntries(
  machineOeeDefs.map((d) => [d.machineId, ledgerTemplates[d.machineId] ?? defaultLedger(d.machineId)]),
);

export const aiCapacityProposals: AiCapacityProposal[] = [
  {
    lineId: 'line-10',
    proposedEfficiencyFactor: 0.86,
    proposedPlanningHrsPerMonth: 113520,
    reasoning: 'Analysis of 12 months of historical data (Jun-2025–May-2026) shows average actual output of 112,800 hrs/month with a range of 105,000–119,000. The current planning factor of 0.88 tends to overestimate available capacity during Q4 demand peaks. Reducing to 0.86 better aligns with observed throughput and accounts for recurring Q3/Q4 maintenance patterns.',
    confidence: 'High',
    basedOnMonths: 12,
    generatedAt: '2026-05-24T10:30:00',
    status: 'pending',
  },
  {
    lineId: 'line-07',
    proposedEfficiencyFactor: 0.84,
    proposedPlanningHrsPerMonth: 105840,
    reasoning: 'Historical actuals average 104,200 hrs/month against a planned 108,360. Changeover frequency has been 18% higher than planned in 8 of 12 months. Reducing the factor to 0.84 reflects actual changeover losses and aligns planning with observed performance without requiring a structural change to shift scheduling.',
    confidence: 'High',
    basedOnMonths: 12,
    generatedAt: '2026-05-24T10:30:00',
    status: 'pending',
  },
  {
    lineId: 'line-03',
    proposedEfficiencyFactor: 0.91,
    proposedPlanningHrsPerMonth: 80080,
    reasoning: 'Line 03 shows a consistent upward trend in actual capacity over the past 6 months, reaching 79,500–81,000 hrs/month. The current factor of 0.90 is slightly conservative. A marginal increase to 0.91 captures the process maturity gains while leaving buffer for occasional unplanned stoppages.',
    confidence: 'Medium',
    basedOnMonths: 12,
    generatedAt: '2026-05-24T10:30:00',
    status: 'pending',
  },
  {
    lineId: 'line-05',
    proposedEfficiencyFactor: 0.85,
    proposedPlanningHrsPerMonth: 74800,
    reasoning: 'Campaign scheduling on Line 05 creates high variability (CV: 11%). Historical actuals range from 68,000 to 82,000 hrs/month. The current factor of 0.87 is within range but the last 3 months trend lower due to increased campaign complexity. Reducing to 0.85 provides a more conservative and achievable planning baseline.',
    confidence: 'Medium',
    basedOnMonths: 12,
    generatedAt: '2026-05-24T10:30:00',
    status: 'pending',
  },
  {
    lineId: 'line-01',
    proposedEfficiencyFactor: 0.93,
    proposedPlanningHrsPerMonth: 122760,
    reasoning: 'Line 01 consistently outperforms planning targets — actuals exceed plan in 10 of 12 months (avg +1.5%). The line benefits from a mature process and experienced crew. Increasing the factor from 0.92 to 0.93 better reflects actual capacity availability without inflating commitments beyond what the historical ceiling supports.',
    confidence: 'High',
    basedOnMonths: 12,
    generatedAt: '2026-05-24T10:30:00',
    status: 'pending',
  },
  {
    lineId: 'line-02',
    proposedEfficiencyFactor: 0.82,
    proposedPlanningHrsPerMonth: 147600,
    reasoning: '7-day continuous operation makes Line 02 susceptible to weekend crew variability and higher unplanned downtime rates (avg 8.2% vs 5% target). Historical actuals average 145,800 hrs/month against a plan of 151,200. Reducing the factor to 0.82 corrects for systematic overestimation observed during Q1 and Q4.',
    confidence: 'Medium',
    basedOnMonths: 12,
    generatedAt: '2026-05-24T10:30:00',
    status: 'pending',
  },
];
