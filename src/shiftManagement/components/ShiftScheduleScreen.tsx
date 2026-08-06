import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  IconButton,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Popover,
  Drawer,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AutoAwesome as SparkleIcon,
  AccessTime as TimeIcon,
  Groups as GroupsIcon,
  CancelOutlined as CancelIcon,
  WarningAmber as WarningIcon,
  CheckCircleOutline as CheckCircleIcon,
  OpenInFull as OpenInFullIcon,
  CloseFullscreen as CloseFullscreenIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { activeTheme, lightHeaderIconButtonSx } from '../../theme';
import {
  shiftScheduleShiftRows,
  shiftScheduleAiInsights,
  shiftScheduleEventStyles,
  shiftScheduleWeekDays,
} from '../data';
import { teamManagementMembers } from '../data/teamData';
import { useShiftManagementContext } from '../contexts/ShiftManagementContext';
import ShiftMemberProfileDialog from './ShiftMemberProfileDialog';

type BaseShiftKey = 'morning' | 'afternoon' | 'night';
type ShiftId = string;
type DayKey = (typeof shiftScheduleWeekDays)[number]['key'];

type WorkerMeta = {
  id: string;
  name: string;
  role: string;
  shift: BaseShiftKey;
  line: string;
  zone: string;
  equipment: string;
};

type WorkerAssignment = {
  workerId: string;
  line: string;
  status?: keyof typeof shiftScheduleEventStyles;
  aiSignal?: boolean;
};

type MoveSelection = {
  workerId: string;
  fromDay: DayKey;
};

type SummaryCoverageCellSelection = {
  key: string;
  lineId: string;
  dayKey: DayKey;
  shiftBase: BaseShiftKey;
  line: string;
  dateLabel: string;
  shiftLabel: string;
  coverageValue: string;
  statusLabel: string;
  statusTone: string;
  statusBg: string;
  statusBorder: string;
  assignedPeople: Array<{ name: string; role: string }>;
  missingPositions: string[];
  notes: string[];
};

type AiRecommendationDecision = 'pending' | 'accepted' | 'rejected';

type ShiftScheduleViewMode = 'schedule' | 'crewPatternOverview';

type ShiftScheduleScreenProps = {
  initialViewMode?: ShiftScheduleViewMode;
};

let shouldFocusSummaryPlanOnNextLoad = false;
let shouldOpenSummaryAiDrawerOnNextLoad = false;

const shiftLabelById: Record<BaseShiftKey, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night',
};

const baseShiftRotation: BaseShiftKey[] = ['morning', 'afternoon', 'night'];

const lineOrder = ['A', 'B', 'C', 'D'] as const;
const compactSummaryThreshold = 8;

const shiftLineTargets: Record<BaseShiftKey, Record<string, number>> = {
  morning: { A: 6, B: 12, C: 20, D: 8 },
  afternoon: { A: 6, B: 12, C: 20, D: 8 },
  night: { A: 6, B: 12, C: 20, D: 8 },
};

const lineRoleRequirements: Record<string, Array<{ role: string; count: number }>> = {
  A: [
    { role: 'Line Lead', count: 1 },
    { role: 'Operator', count: 2 },
    { role: 'Technical Operator', count: 1 },
    { role: 'QA Inspector', count: 1 },
    { role: 'Material Handler', count: 1 },
  ],
  B: [
    { role: 'Line Lead', count: 1 },
    { role: 'Operator', count: 6 },
    { role: 'Technical Operator', count: 2 },
    { role: 'QA Inspector', count: 1 },
    { role: 'Material Handler', count: 2 },
  ],
  C: [
    { role: 'Line Lead', count: 1 },
    { role: 'Operator', count: 10 },
    { role: 'Technical Operator', count: 3 },
    { role: 'QA Inspector', count: 2 },
    { role: 'Material Handler', count: 4 },
  ],
  D: [
    { role: 'Line Lead', count: 1 },
    { role: 'Operator', count: 3 },
    { role: 'Technical Operator', count: 2 },
    { role: 'QA Inspector', count: 1 },
    { role: 'Material Handler', count: 1 },
  ],
};

const eventFilterOptions = [
  { value: 'All', label: 'All events' },
  { value: 'absence', label: 'Absence' },
  { value: 'swap', label: 'Swap' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'overtime', label: 'Overtime' },
  { value: 'dayoff', label: 'Day off' },
] as const;

const departmentOptions = ['Production', 'Human Resources', 'Backoffice', 'Warehouse', 'Quality', 'Maintenance'] as const;
const calendarViewOptions = ['Day', 'Week', 'Month', 'Year'] as const;
const lineAreaOptions = ['All areas', 'Line A', 'Line B', 'Line C', 'Line D'] as const;

const departmentDutyRoster: Record<string, Array<{ name: string; role: string; area: string; shift: BaseShiftKey; status?: keyof typeof shiftScheduleEventStyles }>> = {
  'Human Resources': [
    { name: 'Ana Costa', role: 'HR Business Partner', area: 'Employee Relations', shift: 'morning' },
    { name: 'Marta Flores', role: 'Training Coordinator', area: 'Learning Center', shift: 'afternoon' },
    { name: 'Kevin Price', role: 'Timekeeping Analyst', area: 'HR Operations', shift: 'morning', status: 'overtime' },
  ],
  Backoffice: [
    { name: 'Paula Reis', role: 'Production Scheduler', area: 'Planning Office', shift: 'morning' },
    { name: 'Andre Gomes', role: 'Document Controller', area: 'Backoffice', shift: 'afternoon' },
    { name: 'Laura Chen', role: 'Operations Analyst', area: 'Backoffice', shift: 'night' },
  ],
  Warehouse: [
    { name: 'Rafael Soto', role: 'Forklift Operator', area: 'Receiving', shift: 'morning' },
    { name: 'Nina Patel', role: 'Material Handler', area: 'Line Supply', shift: 'afternoon' },
    { name: 'Omar Khan', role: 'Warehouse Lead', area: 'Dispatch', shift: 'night', status: 'absence' },
  ],
  Quality: [
    { name: 'Sarah Connor', role: 'Quality Inspector', area: 'Line A', shift: 'morning' },
    { name: 'Olivia Bennett', role: 'QA Technician', area: 'Micro Lab', shift: 'night' },
    { name: 'Julia Stone', role: 'Batch Release Specialist', area: 'QA Office', shift: 'afternoon' },
  ],
  Maintenance: [
    { name: 'Michael Thompson', role: 'Maintenance Technician', area: 'Utilities', shift: 'afternoon' },
    { name: 'Diego Marin', role: 'Electrical Technician', area: 'Packaging', shift: 'night' },
    { name: 'Henry Cole', role: 'Reliability Technician', area: 'Filling', shift: 'morning', status: 'swap' },
  ],
};

const availabilityLikeStatuses = new Set(['absence', 'dayoff', 'vacation']);

const lineSetup = {
  A: { zone: 'Z1', equipment: ['Filler', 'Vision', 'Cartoner', 'Palletizer', 'Changeover', 'Materials'] },
  B: { zone: 'Z2', equipment: ['Mixer', 'Case Packer', 'Labeler', 'QA Gate', 'Utilities', 'Warehouse'] },
  C: { zone: 'Z3', equipment: ['Blender', 'Extruder', 'Inspection', 'Packing', 'CIP', 'Warehouse'] },
  D: { zone: 'Z4', equipment: ['Stretch Wrapper', 'Cartoner', 'Dispatch', 'Sanitation', 'Maintenance', 'Warehouse'] },
} as const;

const lineProductNames: Record<string, string> = {
  A: 'Nexiva',
  B: 'Alaris',
  C: 'BD Vacutainer',
  D: 'BD Insyte',
};

const lineVisuals: Record<string, { accent: string; soft: string; edge: string }> = {
  A: { accent: '#2563EB', soft: '#EEF4FF', edge: '#BFDBFE' },
  B: { accent: '#0F766E', soft: '#ECFDF5', edge: '#A7F3D0' },
  C: { accent: '#C2410C', soft: '#FFF7ED', edge: '#FED7AA' },
  D: { accent: '#7C3AED', soft: '#F5F3FF', edge: '#DDD6FE' },
};
const lineAreaLookup: Record<string, string> = {
  A: 'Area A',
  B: 'Area B',
  C: 'Area C',
  D: 'Area D',
};
const plannedStopTypeOptions = ['Holiday', 'Maintenance', 'Production Stop', 'Plant Shutdown', 'Training Event', 'Other'] as const;
const plannedStopScopeOptions = ['Entire Site', 'Department', 'Area', 'Line'] as const;

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const dayKeySequence = shiftScheduleWeekDays.map((day) => day.key);
const dayKeyIndexLookup = new Map(dayKeySequence.map((dayKey, index) => [dayKey, index]));
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });

const syntheticFirstNames = [
  'John', 'Maria', 'Carlos', 'Sarah', 'Nina', 'James', 'Emily', 'Lucas', 'Olivia', 'Daniel',
  'Ava', 'Noah', 'Sophia', 'Mateo', 'Priya', 'Victor', 'Emma', 'Hector', 'Julia', 'Leo',
  'Bianca', 'Liam', 'Mia', 'Diego', 'Chloe', 'Rafael', 'Grace', 'Andre', 'Ruby', 'Jonas',
  'Hazel', 'Omar', 'Keira', 'Skye', 'Pablo', 'Claire', 'Bruno', 'Isla', 'Theo', 'Lara',
];

const syntheticLastNames = [
  'Brooks', 'Silva', 'Mendez', 'Turner', 'Patel', 'Walker', 'Carter', 'Hayes', 'Mitchell', 'Moreno',
  'King', 'Foster', 'Shah', 'Ramos', 'Diaz', 'Stone', 'Ward', 'Green', 'Luna', 'Perez',
  'Scott', 'Harper', 'Marin', 'Cole', 'Evans', 'Torres', 'Nash', 'Boyd', 'Shaw', 'Kent',
  'Quinn', 'Ortiz', 'Lane', 'Blake', 'Russo', 'Price', 'Hill', 'Mills', 'Perry', 'Grant',
];

const createSyntheticName = (shift: BaseShiftKey, line: string, index: number) => {
  const shiftOffset = baseShiftRotation.indexOf(shift) * 17;
  const lineOffset = lineOrder.indexOf(line as (typeof lineOrder)[number]) * 11;
  const seed = shiftOffset + lineOffset + index;
  const first = syntheticFirstNames[seed % syntheticFirstNames.length];
  const last = syntheticLastNames[(seed * 3) % syntheticLastNames.length];
  return `${first} ${last}`;
};

const getLineRoleSlots = (line: string) => (
  (lineRoleRequirements[line] ?? []).flatMap((requirement) =>
    Array.from({ length: requirement.count }, (_, index) => ({
      role: requirement.role,
      slotNumber: index + 1,
    })),
  )
);

const workerCatalogList: WorkerMeta[] = baseShiftRotation.flatMap((shift) =>
  lineOrder.flatMap((line) =>
    getLineRoleSlots(line).map((slot, index) => ({
      id: `${shift}-${line}-${slugify(`${slot.role}-${slot.slotNumber}-${createSyntheticName(shift, line, index)}`)}`,
      name: createSyntheticName(shift, line, index),
      role: slot.role,
      shift,
      line,
      zone: lineSetup[line].zone,
      equipment: lineSetup[line].equipment[index % lineSetup[line].equipment.length],
    })),
  ),
);

const workerDirectory = new Map(workerCatalogList.map((worker) => [worker.id, worker]));
const workerDirectoryByName = new Map(workerCatalogList.map((worker) => [worker.name, worker]));

const buildShiftAssignments = (baseShift: BaseShiftKey): Record<DayKey, WorkerAssignment[]> => {
  const shiftWorkers = workerCatalogList.filter((worker) => worker.shift === baseShift);
  return shiftScheduleWeekDays.reduce((dayAcc, day) => {
    dayAcc[day.key] = shiftWorkers.map((worker) => ({ workerId: worker.id, line: worker.line }));
    return dayAcc;
  }, {} as Record<DayKey, WorkerAssignment[]>);
};

const initialBaseAssignments: Record<BaseShiftKey, Record<DayKey, WorkerAssignment[]>> = {
  morning: buildShiftAssignments('morning'),
  afternoon: buildShiftAssignments('afternoon'),
  night: buildShiftAssignments('night'),
};

const overrideAssignment = (
  state: Record<BaseShiftKey, Record<DayKey, WorkerAssignment[]>>,
  shift: BaseShiftKey,
  day: DayKey,
  workerId: string,
  patch: Partial<WorkerAssignment>,
) => {
  state[shift][day] = state[shift][day].map((assignment) => (
    assignment.workerId === workerId ? { ...assignment, ...patch } : assignment
  ));
};

const findWorkerId = (shift: BaseShiftKey, line: string, role: string, occurrence = 1) => {
  const match = workerCatalogList
    .filter((worker) => worker.shift === shift && worker.line === line && worker.role === role)
    [occurrence - 1];
  return match?.id;
};

[
  { shift: 'morning' as const, day: 'tue' as const, workerId: findWorkerId('morning', 'A', 'Operator', 2), patch: { status: 'overtime' as const } },
  { shift: 'morning' as const, day: 'wed' as const, workerId: findWorkerId('morning', 'A', 'QA Inspector', 1), patch: { status: 'swap' as const } },
  { shift: 'morning' as const, day: 'thu' as const, workerId: findWorkerId('morning', 'A', 'Line Lead', 1), patch: { status: 'dayoff' as const } },
  { shift: 'afternoon' as const, day: 'tue' as const, workerId: findWorkerId('afternoon', 'B', 'Operator', 3), patch: { status: 'absence' as const, aiSignal: true } },
  { shift: 'afternoon' as const, day: 'wed' as const, workerId: findWorkerId('afternoon', 'B', 'Material Handler', 1), patch: { status: 'swap' as const } },
  { shift: 'afternoon' as const, day: 'thu' as const, workerId: findWorkerId('afternoon', 'B', 'Technical Operator', 2), patch: { status: 'overtime' as const } },
  { shift: 'night' as const, day: 'mon' as const, workerId: findWorkerId('night', 'C', 'QA Inspector', 2), patch: { status: 'vacation' as const } },
  { shift: 'night' as const, day: 'thu' as const, workerId: findWorkerId('night', 'C', 'Operator', 8), patch: { status: 'overtime' as const } },
  { shift: 'night' as const, day: 'fri' as const, workerId: findWorkerId('night', 'C', 'Material Handler', 3), patch: { status: 'absence' as const, aiSignal: true } },
].forEach(({ shift, day, workerId, patch }) => {
  if (workerId) overrideAssignment(initialBaseAssignments, shift, day, workerId, patch);
});

const parseIsoDate = (value: string) => {
  const [yearText, monthText, dayText] = value.split('-');
  return new Date(Number(yearText), Number(monthText) - 1, Number(dayText), 12, 0, 0, 0);
};

const formatIsoDate = (date: Date) => (
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
);

const startOfWeek = (date: Date) => {
  const mondayOffset = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayOffset, 12, 0, 0, 0);
};

const getDayKeyForDate = (date: Date): DayKey => {
  const lookup = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;
  return lookup[date.getDay()];
};

const getDayMetaForDate = (date: Date) => ({
  key: getDayKeyForDate(date),
  day: date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
  date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  isoDate: formatIsoDate(date),
});

const matchesPlannedStopScope = (
  stop: {
    scope: 'Entire Site' | 'Department' | 'Area' | 'Line';
    scopeDetail: string;
  },
  department: string,
  line?: string,
) => {
  const detail = stop.scopeDetail.toLowerCase();
  if (stop.scope === 'Entire Site') return true;
  if (stop.scope === 'Department') return detail.includes(department.toLowerCase());
  if (!line) return stop.scope !== 'Line';
  const lineLabel = `line ${line}`.toLowerCase();
  const areaLabel = (lineAreaLookup[line] ?? '').toLowerCase();
  if (stop.scope === 'Line') return detail.includes(lineLabel) || detail === line.toLowerCase();
  if (stop.scope === 'Area') return detail.includes(areaLabel) || detail.includes(lineLabel);
  return false;
};

const isStopActiveOnDate = (
  stop: {
    startDate: string;
    endDate: string;
    isActive: boolean;
  },
  isoDate: string,
) => stop.isActive && stop.startDate <= isoDate && stop.endDate >= isoDate;

const getVisibleDates = (selectedDate: string, view: (typeof calendarViewOptions)[number]) => {
  const anchor = parseIsoDate(selectedDate);
  if (view === 'Day') return [anchor];
  if (view === 'Week') {
    const start = startOfWeek(anchor);
    return Array.from({ length: 7 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index, 12, 0, 0, 0));
  }
  if (view === 'Month') {
    return Array.from(
      { length: new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate() },
      (_, index) => new Date(anchor.getFullYear(), anchor.getMonth(), index + 1, 12, 0, 0, 0),
    );
  }
  return Array.from({ length: 12 }, (_, index) => new Date(anchor.getFullYear(), index, 1, 12, 0, 0, 0));
};

const formatRangeLabel = (dates: Date[]) => {
  if (!dates.length) return '';
  const first = dates[0];
  const last = dates[dates.length - 1];
  const sameMonth = first.getMonth() === last.getMonth() && first.getFullYear() === last.getFullYear();
  if (dates.length === 1) return `${monthFormatter.format(first)} ${first.getDate()}, ${first.getFullYear()}`;
  if (sameMonth) return `${monthFormatter.format(first)} ${first.getDate()} - ${last.getDate()}, ${first.getFullYear()}`;
  return `${monthFormatter.format(first)} ${first.getDate()} - ${monthFormatter.format(last)} ${last.getDate()}, ${last.getFullYear()}`;
};

const ShiftScheduleScreen: React.FC<ShiftScheduleScreenProps> = ({ initialViewMode = 'schedule' }) => {
  const {
    schedule: {
      resolvedShiftInsights,
      openShiftAiInsightKey,
      setResolvedShiftInsights,
      setOpenShiftAiInsightKey,
      selectedShiftMember,
      setSelectedShiftMember,
      getShiftMemberAvatar,
    },
    settings: {
      shiftRequestItems,
      holidayItems,
      isHolidayDrawerOpen,
      setIsHolidayDrawerOpen,
      holidayDraft,
      setHolidayDraft,
      editingHolidayId,
      saveHolidayDraft,
    },
    teamShiftDefinitions,
    renderShiftSchedulePersistentActions,
    setCurrentScreen,
  } = useShiftManagementContext();

  const plannerShiftViews = React.useMemo(
    () => (teamShiftDefinitions.length ? teamShiftDefinitions : [
      { id: 'Morning', label: 'Shift A', start: '06:00', end: '14:00' },
      { id: 'Afternoon', label: 'Shift B', start: '14:00', end: '22:00' },
      { id: 'Night', label: 'Shift C', start: '22:00', end: '06:00' },
    ]).map((shift, index) => ({
      ...shift,
      baseShift: baseShiftRotation[index % baseShiftRotation.length],
    })),
    [teamShiftDefinitions],
  );

  const [selectedShiftId, setSelectedShiftId] = React.useState<ShiftId>(plannerShiftViews[0]?.id ?? 'Morning');
  const [selectedDepartment, setSelectedDepartment] = React.useState<(typeof departmentOptions)[number]>('Production');
  const [selectedLineArea, setSelectedLineArea] = React.useState<(typeof lineAreaOptions)[number]>('All areas');
  const [selectedCalendarView, setSelectedCalendarView] = React.useState<(typeof calendarViewOptions)[number]>('Day');
  const [selectedSummaryDate, setSelectedSummaryDate] = React.useState('2026-02-15');
  const [selectedSummaryShiftId, setSelectedSummaryShiftId] = React.useState<ShiftId | 'all'>('all');
  const [summaryMatrixDetailLevel, setSummaryMatrixDetailLevel] = React.useState<'compact' | 'detailed'>('compact');
  const [selectedRoleFilter, setSelectedRoleFilter] = React.useState('All');
  const [selectedEventFilter, setSelectedEventFilter] = React.useState('All');
  const [assignmentsByShift, setAssignmentsByShift] = React.useState<Record<string, Record<DayKey, WorkerAssignment[]>>>(() =>
    plannerShiftViews.reduce((acc, shift) => {
      acc[shift.id] = structuredClone(initialBaseAssignments[shift.baseShift]);
      return acc;
    }, {} as Record<string, Record<DayKey, WorkerAssignment[]>>),
  );
  const [moveSelection, setMoveSelection] = React.useState<MoveSelection | null>(null);
  const [isCalendarFullscreen, setIsCalendarFullscreen] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ShiftScheduleViewMode>(initialViewMode);
  const [selectedAiRecommendationIndex, setSelectedAiRecommendationIndex] = React.useState(0);
  const [isSummaryAiDrawerOpen, setIsSummaryAiDrawerOpen] = React.useState(false);
  const [selectedSummaryCoverageCell, setSelectedSummaryCoverageCell] = React.useState<SummaryCoverageCellSelection | null>(null);
  const [isSummaryCoverageDetailOpen, setIsSummaryCoverageDetailOpen] = React.useState(false);
  const [summaryLegendAnchorEl, setSummaryLegendAnchorEl] = React.useState<HTMLElement | null>(null);
  const [commandCenterKpiInsight, setCommandCenterKpiInsight] = React.useState<{ label: string; anchorEl: HTMLElement } | null>(null);
  const [isQuickApprovalsOpen, setIsQuickApprovalsOpen] = React.useState(false);
  const [selectedQuickApprovalIndex, setSelectedQuickApprovalIndex] = React.useState(0);
  const [quickApprovalDecisions, setQuickApprovalDecisions] = React.useState<Record<string, string>>({});
  const summaryScrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const summaryCoveragePlanRef = React.useRef<HTMLDivElement | null>(null);
  const aiDecisionAdvanceTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);

  React.useEffect(() => {
    if (viewMode !== 'schedule' || !shouldFocusSummaryPlanOnNextLoad) return undefined;
    const shouldOpenAi = shouldOpenSummaryAiDrawerOnNextLoad;
    shouldFocusSummaryPlanOnNextLoad = false;
    shouldOpenSummaryAiDrawerOnNextLoad = false;

    const timer = window.setTimeout(() => {
      if (shouldOpenAi) {
        setSelectedAiRecommendationIndex(0);
        setIsSummaryAiDrawerOpen(true);
      }
      summaryCoveragePlanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 2000);

    return () => window.clearTimeout(timer);
  }, [viewMode]);

  React.useEffect(() => () => {
    if (aiDecisionAdvanceTimerRef.current !== null) {
      window.clearTimeout(aiDecisionAdvanceTimerRef.current);
    }
  }, []);

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((part) => part[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const getCoverageState = (assigned: number, required: number) => {
    if (required <= 0) return { bg: '#F8FAFC', border: '#CBD5E1', tone: '#64748B', label: 'No schedule' };
    const gap = assigned - required;
    if (gap >= 0) return { bg: '#ECFDF3', border: '#BBF7D0', tone: '#15803D', label: 'Fully covered' };
    if (gap === -1) return { bg: '#FFF7ED', border: '#FED7AA', tone: '#C2410C', label: 'Under target' };
    return { bg: '#FEF2F2', border: '#FECACA', tone: '#B91C1C', label: 'Critical gap' };
  };

  const coverageLegend = [
    getCoverageState(6, 6),
    getCoverageState(5, 6),
    getCoverageState(2, 6),
    getCoverageState(0, 0),
  ];

  React.useEffect(() => {
    if (!plannerShiftViews.some((shift) => shift.id === selectedShiftId)) {
      setSelectedShiftId(plannerShiftViews[0]?.id ?? 'Afternoon');
    }
    if (selectedSummaryShiftId !== 'all' && !plannerShiftViews.some((shift) => shift.id === selectedSummaryShiftId)) {
      setSelectedSummaryShiftId('all');
    }
  }, [plannerShiftViews, selectedShiftId, selectedSummaryShiftId]);

  React.useEffect(() => {
    setAssignmentsByShift((prev) => {
      const next = { ...prev };
      plannerShiftViews.forEach((shift) => {
        if (!next[shift.id]) {
          next[shift.id] = structuredClone(initialBaseAssignments[shift.baseShift]);
        }
      });
      Object.keys(next).forEach((shiftId) => {
        if (!plannerShiftViews.some((shift) => shift.id === shiftId)) delete next[shiftId];
      });
      return next;
    });
  }, [plannerShiftViews]);

  React.useEffect(() => {
    setSelectedLineArea('All areas');
    setSelectedRoleFilter('All');
    setSelectedEventFilter('All');
  }, [selectedDepartment]);

  const activePlannerShift = plannerShiftViews.find((shift) => shift.id === selectedShiftId) ?? plannerShiftViews[0];
  const activeShift = shiftScheduleShiftRows.find((row) => row.id === activePlannerShift?.baseShift) ?? shiftScheduleShiftRows[1];
  const activeShiftHours = activePlannerShift ? `${activePlannerShift.start} - ${activePlannerShift.end}` : activeShift.hours;
  const shiftDisplayLabels = React.useMemo<Record<string, string>>(
    () => plannerShiftViews.reduce((acc, shift) => {
      acc[shift.id] = shift.label;
      return acc;
    }, {} as Record<string, string>),
    [plannerShiftViews],
  );
  const shiftAssignments = assignmentsByShift[selectedShiftId] ?? structuredClone(initialBaseAssignments[activePlannerShift?.baseShift ?? 'afternoon']);
  const summaryShiftViews = React.useMemo(
    () => (selectedSummaryShiftId === 'all'
      ? plannerShiftViews
      : plannerShiftViews.filter((shift) => shift.id === selectedSummaryShiftId)),
    [plannerShiftViews, selectedSummaryShiftId],
  );
  const getShiftAbbreviation = React.useCallback((shift: (typeof plannerShiftViews)[number]) => (
    shift.baseShift === 'morning' ? 'M' : shift.baseShift === 'afternoon' ? 'A' : 'N'
  ), []);

  const roleOptions = React.useMemo(() => {
    const roles = new Set<string>();
    if (selectedDepartment === 'Production') {
      workerCatalogList
        .filter((worker) => worker.shift === (activePlannerShift?.baseShift ?? 'afternoon'))
        .forEach((worker) => roles.add(worker.role));
    } else {
      (departmentDutyRoster[selectedDepartment] ?? []).forEach((person) => roles.add(person.role));
    }
    return ['All', ...Array.from(roles).sort((a, b) => a.localeCompare(b))];
  }, [activePlannerShift, selectedDepartment]);

  const selectedAreaLine = selectedLineArea.startsWith('Line ') ? selectedLineArea.replace('Line ', '') : 'All';

  const areaOptions = React.useMemo(() => {
    if (selectedDepartment === 'Production') return [...lineAreaOptions];
    const areas = Array.from(new Set((departmentDutyRoster[selectedDepartment] ?? []).map((person) => person.area))).sort((a, b) => a.localeCompare(b));
    return ['All areas', ...areas];
  }, [selectedDepartment]);

  const departmentPeopleOnDuty = React.useMemo(() => {
    if (selectedDepartment === 'Production') return [];
    const roster = departmentDutyRoster[selectedDepartment] ?? [];
    return roster.filter((person) => {
      const shiftMatch = !activePlannerShift || person.shift === activePlannerShift.baseShift;
      const roleMatch = selectedRoleFilter === 'All' || person.role === selectedRoleFilter;
      const eventMatch = selectedEventFilter === 'All' || person.status === selectedEventFilter;
      const areaMatch = selectedLineArea === 'All areas' || person.area === selectedLineArea;
      return shiftMatch && roleMatch && eventMatch && areaMatch;
    });
  }, [activePlannerShift, selectedDepartment, selectedEventFilter, selectedLineArea, selectedRoleFilter]);

  const memberSourceDirectory = React.useMemo(
    () => new Map(teamManagementMembers.map((member) => [member.name, member])),
    [],
  );

  const profileDirectory = React.useMemo(() => new Map(workerCatalogList.map((worker, index) => {
    const source = memberSourceDirectory.get(worker.name);
    const fallbackCertifications = source?.certifications?.length
      ? source.certifications.map((item) => `${item.name} (${item.expires})`)
      : [source?.certification ?? `${worker.role} qualification - Sep ${String((index % 7) + 10).padStart(2, '0')}, 2026`];
    const requiredTrainingList = source
      ? [
          `Annual GMP refresher - Due ${['Jul 12, 2026', 'Aug 06, 2026', 'Sep 18, 2026'][index % 3]}`,
          `${lineProductNames[source.line]} line recertification - Due ${['Jun 28, 2026', 'Jul 21, 2026', 'Aug 14, 2026'][index % 3]}`,
        ]
      : [
          `Aseptic behavior refresher - Due ${['Jul 08, 2026', 'Aug 02, 2026', 'Sep 11, 2026'][index % 3]}`,
          `${lineProductNames[worker.line]} line recertification - Due ${['Jun 24, 2026', 'Jul 19, 2026', 'Aug 09, 2026'][index % 3]}`,
        ];
    const profile = source
      ? {
          role: source.role,
          position: `${source.zone} - ${source.equipment}`,
          team: `Crew ${source.line}`,
          location: `Line ${source.line} / ${source.zone}`,
          trainings: fallbackCertifications,
          requiredTrainings: requiredTrainingList,
          certifications: fallbackCertifications,
          skills: source.skills ?? [],
          upcomingVacation: source.upcomingVacation,
          workingHours: Math.round(source.workedDays * 7.4),
          overtimeHours: source.overtimeHours,
          absenceDays: source.sickLeave,
          attendance: source.attendance,
          utilization: source.utilization,
          supervisorInsight: source.supervisorInsight,
          bluAiOverview: `BLU.AI sees ${source.name.split(' ')[0]} as strongest in ${source.skills?.slice(0, 2).join(' and ').toLowerCase() ?? 'line support'}, with good coverage potential for ${lineProductNames[source.line]} when training gaps are cleared.`,
          avatarTone: source.avatarTone,
          weeklySchedule: source.weeklySchedule ?? [],
        }
      : {
          role: worker.role,
          position: `${worker.zone} - ${worker.equipment}`,
          team: `Crew ${worker.line}`,
          location: `Line ${worker.line} / ${worker.zone}`,
          trainings: [
            `Safety refresh - Jul ${String((index % 9) + 10).padStart(2, '0')}, 2026`,
            `Role certification - Aug ${String((index % 9) + 14).padStart(2, '0')}, 2026`,
          ],
          requiredTrainings: requiredTrainingList,
          certifications: [
            `${worker.role} qualification - Sep ${String((index % 6) + 3).padStart(2, '0')}, 2026`,
            `${lineProductNames[worker.line]} process check - Oct ${String((index % 6) + 9).padStart(2, '0')}, 2026`,
          ],
          skills: [worker.equipment, worker.role, `Line ${worker.line} coverage`],
          upcomingVacation: index % 4 === 0 ? 'No vacation planned' : `Sep ${String((index % 12) + 3).padStart(2, '0')} - Sep ${String((index % 12) + 6).padStart(2, '0')}, 2026`,
          workingHours: 148 + (index % 18),
          overtimeHours: index % 6,
          absenceDays: index % 3 === 0 ? 1 : 0,
          attendance: 93 + (index % 6),
          utilization: 78 + (index % 17),
          supervisorInsight: `${worker.name.split(' ')[0]} is a reliable ${worker.role.toLowerCase()} for ${lineProductNames[worker.line].toLowerCase()} coverage.`,
          bluAiOverview: `BLU.AI rates ${worker.name.split(' ')[0]} as a flexible ${worker.role.toLowerCase()} with the best fit on ${lineProductNames[worker.line]} and adjacent line support when demand spikes.`,
          avatarTone: '#DBEAFE',
          weeklySchedule: shiftScheduleWeekDays.map((day) => ({
            day: day.day.slice(0, 3),
            hours: shiftLabelById[worker.shift] === 'Morning' ? '06:00 - 14:00' : shiftLabelById[worker.shift] === 'Afternoon' ? '14:00 - 22:00' : '22:00 - 06:00',
            note: `${lineProductNames[worker.line]} support`,
          })),
        };

    return [worker.id, profile];
  })), [memberSourceDirectory]);

  const moveWorker = React.useCallback((targetDay: DayKey, targetLine: string, workerId: string, fromDay: DayKey) => {
    setAssignmentsByShift((prev) => {
      const shiftAssignmentsSnapshot = prev[selectedShiftId];
      const sourceDayEntries = shiftAssignmentsSnapshot[fromDay];
      const movingAssignment = sourceDayEntries.find((assignment) => assignment.workerId === workerId);
      if (!movingAssignment) return prev;

      const nextShiftAssignments: Record<DayKey, WorkerAssignment[]> = { ...shiftAssignmentsSnapshot };
      nextShiftAssignments[fromDay] = sourceDayEntries.filter((assignment) => assignment.workerId !== workerId);
      nextShiftAssignments[targetDay] = [
        ...shiftAssignmentsSnapshot[targetDay].filter((assignment) => assignment.workerId !== workerId),
        { ...movingAssignment, line: targetLine },
      ];

      return {
        ...prev,
        [selectedShiftId]: nextShiftAssignments,
      };
    });
    setMoveSelection(null);
  }, [selectedShiftId]);

  const visibleDates = React.useMemo(
    () => getVisibleDates(selectedSummaryDate, selectedCalendarView),
    [selectedCalendarView, selectedSummaryDate],
  );
  const visiblePlannedStops = React.useMemo(
    () => {
      const selectedDate = parseIsoDate(selectedSummaryDate);
      const startDate = selectedCalendarView === 'Year'
        ? formatIsoDate(new Date(selectedDate.getFullYear(), 0, 1, 12, 0, 0, 0))
        : selectedCalendarView === 'Month'
          ? formatIsoDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1, 12, 0, 0, 0))
          : formatIsoDate(visibleDates[0] ?? selectedDate);
      const endDate = selectedCalendarView === 'Year'
        ? formatIsoDate(new Date(selectedDate.getFullYear(), 11, 31, 12, 0, 0, 0))
        : selectedCalendarView === 'Month'
          ? formatIsoDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0, 12, 0, 0, 0))
          : formatIsoDate(visibleDates[visibleDates.length - 1] ?? selectedDate);

      return holidayItems.filter((stop) =>
        stop.isActive
        && stop.startDate <= endDate
        && stop.endDate >= startDate
        && matchesPlannedStopScope(stop, selectedDepartment, selectedAreaLine === 'All' ? undefined : selectedAreaLine),
      );
    },
    [holidayItems, selectedAreaLine, selectedCalendarView, selectedDepartment, selectedSummaryDate, visibleDates],
  );
  const visibleDayCells = React.useMemo(
    () => visibleDates.map((date) => getDayMetaForDate(date)),
    [visibleDates],
  );
  const periodLabel = React.useMemo(() => {
    const selectedDate = parseIsoDate(selectedSummaryDate);
    if (selectedCalendarView === 'Month') {
      return `${selectedDate.toLocaleDateString('en-US', { month: 'long' })} ${selectedDate.getFullYear()}`;
    }
    if (selectedCalendarView === 'Year') {
      return String(selectedDate.getFullYear());
    }
    return formatRangeLabel(visibleDates);
  }, [selectedCalendarView, selectedSummaryDate, visibleDates]);

  const lineRows = React.useMemo(() => (
    lineOrder
      .filter((line) => selectedAreaLine === 'All' || line === selectedAreaLine)
      .map((line) => ({
      id: line,
      label: `Line ${line}`,
      cells: visibleDayCells.map((day) => {
        const sourceAssignments = shiftAssignments[day.key] ?? [];
        const rawEntries = sourceAssignments
          .filter((assignment) => assignment.line === line)
          .map((assignment) => {
            const meta = workerDirectory.get(assignment.workerId);
            return {
              ...assignment,
              id: assignment.workerId,
              name: meta?.name ?? 'Unknown worker',
              role: meta?.role ?? 'Operator',
              zone: meta?.zone ?? 'N/A',
              equipment: meta?.equipment ?? 'General support',
            };
          });

        const visibleEntries = rawEntries.filter((person) => {
          const roleMatch = selectedRoleFilter === 'All' || person.role === selectedRoleFilter;
          const eventMatch = selectedEventFilter === 'All' || person.status === selectedEventFilter;
          return roleMatch && eventMatch;
        });

        const requiredPositions = lineRoleRequirements[line] ?? [];
        const availablePeople = rawEntries.filter((person) => !person.status || !availabilityLikeStatuses.has(person.status));
        const peopleByRole = availablePeople.reduce((acc, person) => {
          acc[person.role] = [...(acc[person.role] ?? []), person];
          return acc;
        }, {} as Record<string, typeof availablePeople>);
        const coverageSlots = requiredPositions.flatMap((requirement) => (
          Array.from({ length: requirement.count }, (_, index) => {
            const assignedPerson = peopleByRole[requirement.role]?.shift();
            return {
              role: requirement.role,
              slotLabel: requirement.count > 1 ? `${requirement.role} ${index + 1}` : requirement.role,
              assignedPerson,
            };
          })
        ));
        const missingPositions = coverageSlots.filter((slot) => !slot.assignedPerson);
        const filledPositions = coverageSlots.filter((slot) => slot.assignedPerson);
        const target = coverageSlots.length || (shiftLineTargets[activePlannerShift?.baseShift ?? 'afternoon'][line] ?? 6);
        const available = filledPositions.length;
        const gap = available - target;
        const visibleAvailableEntries = visibleEntries.filter((person) => !person.status || !availabilityLikeStatuses.has(person.status));
        const roleGroups = visibleAvailableEntries.reduce((acc, person) => {
          const key = person.role;
          acc[key] = [...(acc[key] ?? []), person];
          return acc;
        }, {} as Record<string, typeof visibleAvailableEntries>);
        const compactRoleGroups = Object.entries(roleGroups)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([role, people]) => ({
            role,
            people,
            previewNames: people.slice(0, 3).map((person) => person.name.split(' ')[0]),
            remainingCount: Math.max(0, people.length - 3),
          }));
        const plannedStops = holidayItems.filter((stop) => isStopActiveOnDate(stop, day.isoDate) && matchesPlannedStopScope(stop, selectedDepartment, line));
        const insightKey = `${selectedShiftId}-${day.isoDate}`;
        const insight = shiftScheduleAiInsights[insightKey];
        const hasInsight = Boolean(
          insight
          && rawEntries.some((person) => person.aiSignal || person.status === 'absence' || person.status === 'swap'),
        );

        return {
          day,
          line,
          rawEntries,
          visibleEntries,
          visibleAvailableEntries,
          requiredPositions,
          coverageSlots,
          missingPositions,
          filledPositions,
          roleGroups: compactRoleGroups,
          target,
          assigned: rawEntries.length,
          available,
          gap,
          plannedStops,
          insightKey,
          insight,
          hasInsight,
          useCompactSummary: target > compactSummaryThreshold,
        };
      }),
    }))
  ), [activePlannerShift, holidayItems, selectedAreaLine, selectedDepartment, selectedEventFilter, selectedRoleFilter, selectedShiftId, shiftAssignments, visibleDayCells]);

  const aggregatePeriodLineRows = React.useMemo(() => {
    if (selectedCalendarView === 'Day') return [];
    const selectedDate = parseIsoDate(selectedSummaryDate);
    const periodDates = selectedCalendarView === 'Week'
      ? visibleDates
      : selectedCalendarView === 'Month'
      ? Array.from({ length: 6 }, (_, index) => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1 + (index * 7), 12, 0, 0, 0))
          .filter((date) => date.getMonth() === selectedDate.getMonth())
      : Array.from(
          { length: 12 },
          (_, index) => new Date(selectedDate.getFullYear(), index, 1, 12, 0, 0, 0),
        );

    return lineOrder
      .filter((line) => selectedAreaLine === 'All' || line === selectedAreaLine)
      .map((line) => {
        const target = (lineRoleRequirements[line] ?? []).reduce((sum, requirement) => sum + requirement.count, 0);
        const buckets = periodDates.map((periodDate) => {
          const bucketDates = selectedCalendarView === 'Week'
            ? [periodDate]
            : selectedCalendarView === 'Month'
            ? Array.from({ length: 7 }, (_, index) => new Date(periodDate.getFullYear(), periodDate.getMonth(), periodDate.getDate() + index, 12, 0, 0, 0))
                .filter((date) => date.getMonth() === periodDate.getMonth())
            : Array.from(
                { length: new Date(periodDate.getFullYear(), periodDate.getMonth() + 1, 0).getDate() },
                (_, index) => new Date(periodDate.getFullYear(), periodDate.getMonth(), index + 1, 12, 0, 0, 0),
              );

          const dayCells = bucketDates.map((date) => {
            const dayKey = getDayKeyForDate(date);
            const isoDate = formatIsoDate(date);
            const rawEntries = (shiftAssignments[dayKey] ?? [])
              .filter((assignment) => assignment.line === line)
              .map((assignment) => {
                const meta = workerDirectory.get(assignment.workerId);
                return {
                  ...assignment,
                  id: assignment.workerId,
                  name: meta?.name ?? 'Unknown worker',
                  role: meta?.role ?? 'Operator',
                };
              });
            const availablePeople = rawEntries.filter((person) => !person.status || !availabilityLikeStatuses.has(person.status));
            const peopleByRole = availablePeople.reduce((acc, person) => {
              acc[person.role] = [...(acc[person.role] ?? []), person];
              return acc;
            }, {} as Record<string, typeof availablePeople>);
            const coverageSlots = (lineRoleRequirements[line] ?? []).flatMap((requirement) =>
              Array.from({ length: requirement.count }, (_, index) => ({
                role: requirement.role,
                slotLabel: requirement.count > 1 ? `${requirement.role} ${index + 1}` : requirement.role,
                assignedPerson: peopleByRole[requirement.role]?.shift(),
              })),
            );
            return {
              available: coverageSlots.filter((slot) => slot.assignedPerson).length,
              missingPositions: coverageSlots.filter((slot) => !slot.assignedPerson),
              rawEntries,
              plannedStops: holidayItems.filter((stop) => isStopActiveOnDate(stop, isoDate) && matchesPlannedStopScope(stop, selectedDepartment, line)),
            };
          });

          const roleGroupAccumulator = new Map<string, Set<string>>();
          dayCells.forEach((cell) => {
            cell.rawEntries
              .filter((person) => !person.status || !availabilityLikeStatuses.has(person.status))
              .forEach((person) => {
                if (selectedRoleFilter !== 'All' && person.role !== selectedRoleFilter) return;
                const names = roleGroupAccumulator.get(person.role) ?? new Set<string>();
                names.add(person.name.split(' ')[0]);
                roleGroupAccumulator.set(person.role, names);
              });
          });

          const roleGroups = Array.from(roleGroupAccumulator.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([role, names]) => {
              const list = Array.from(names);
              return {
                role,
                previewNames: list.slice(0, 3),
                remainingCount: Math.max(0, list.length - 3),
              };
            });

          const filledTotal = dayCells.reduce((sum, cell) => sum + cell.available, 0);
          const targetTotal = target * dayCells.length;
          const missingPositions = dayCells.flatMap((cell) => cell.missingPositions);
          const uniqueStopTitles = Array.from(new Set(dayCells.flatMap((cell) => cell.plannedStops.map((stop) => stop.title))));
          const averageFilled = Math.round(filledTotal / Math.max(1, dayCells.length));

          return {
            label: selectedCalendarView === 'Week'
              ? periodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : selectedCalendarView === 'Month'
              ? `Week of ${periodDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : periodDate.toLocaleDateString('en-US', { month: 'short' }),
            subtitle: selectedCalendarView === 'Week'
              ? periodDate.toLocaleDateString('en-US', { weekday: 'short' })
              : selectedCalendarView === 'Month'
                ? `${bucketDates.length} days`
                : `${bucketDates.length} days`,
            filledText: `${filledTotal} / ${targetTotal} positions filled`,
            filledAverageText: `${averageFilled} / ${target} avg daily filled`,
            gapCount: missingPositions.length,
            gapPreview: missingPositions.slice(0, 4).map((slot) => slot.slotLabel),
            hiddenGapCount: Math.max(0, missingPositions.length - 4),
            roleGroups,
            plannedStopCount: uniqueStopTitles.length,
            plannedStopPreview: uniqueStopTitles.slice(0, 3),
          };
        });

        return {
          id: line,
          label: `Line ${line}`,
          product: lineProductNames[line],
          target,
          buckets,
        };
      });
  }, [holidayItems, selectedAreaLine, selectedCalendarView, selectedDepartment, selectedRoleFilter, selectedSummaryDate, shiftAssignments, visibleDates]);

  const summary = React.useMemo(() => {
    const allRawEntries = lineRows.flatMap((line) => line.cells.flatMap((cell) => cell.rawEntries));
    const openSlots = lineRows.reduce(
      (acc, line) => acc + line.cells.reduce((cellAcc, cell) => cellAcc + cell.missingPositions.length, 0),
      0,
    );
    const gapBreakdown = lineRows
      .flatMap((line) => line.cells.flatMap((cell) => cell.missingPositions))
      .reduce((acc, slot) => {
        acc[slot.role] = (acc[slot.role] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    const linesCovered = lineRows.filter((line) => line.cells.some((cell) => cell.assigned > 0)).length;
    const availableSlots = allRawEntries.filter((entry) => !entry.status || !availabilityLikeStatuses.has(entry.status)).length;
    return { openSlots, linesCovered, availableSlots, gapBreakdown, plannedStops: visiblePlannedStops.length };
  }, [lineRows, visiblePlannedStops.length]);

  const summaryCoverageRows = React.useMemo(() => (
    lineOrder
      .filter((line) => selectedAreaLine === 'All' || line === selectedAreaLine)
      .map((line) => ({
        id: line,
        label: `Line ${line}`,
        cells: shiftScheduleWeekDays.flatMap((day) => summaryShiftViews.map((shift) => {
          const shiftAssignmentsSnapshot = assignmentsByShift[shift.id] ?? structuredClone(initialBaseAssignments[shift.baseShift]);
          const rawEntries = (shiftAssignmentsSnapshot[day.key] ?? [])
            .filter((assignment) => assignment.line === line)
            .map((assignment) => {
              const meta = workerDirectory.get(assignment.workerId);
              return {
                ...assignment,
                id: assignment.workerId,
                name: meta?.name ?? 'Unknown worker',
                role: meta?.role ?? 'Operator',
                zone: meta?.zone ?? 'N/A',
                equipment: meta?.equipment ?? 'General support',
              };
            });

          const visibleEntries = rawEntries.filter((person) => {
            const roleMatch = selectedRoleFilter === 'All' || person.role === selectedRoleFilter;
            const eventMatch = selectedEventFilter === 'All' || person.status === selectedEventFilter;
            return roleMatch && eventMatch;
          });
          const requiredPositions = lineRoleRequirements[line] ?? [];
          const availablePeople = rawEntries.filter((person) => !person.status || !availabilityLikeStatuses.has(person.status));
          const peopleByRole = availablePeople.reduce((acc, person) => {
            acc[person.role] = [...(acc[person.role] ?? []), person];
            return acc;
          }, {} as Record<string, typeof availablePeople>);
          const coverageSlots = requiredPositions.flatMap((requirement) => (
            Array.from({ length: requirement.count }, (_, index) => {
              const assignedPerson = peopleByRole[requirement.role]?.shift();
              return {
                role: requirement.role,
                slotLabel: requirement.count > 1 ? `${requirement.role} ${index + 1}` : requirement.role,
                assignedPerson,
              };
            })
          ));
          const missingPositions = coverageSlots.filter((slot) => !slot.assignedPerson);
          const filledPositions = coverageSlots.filter((slot) => slot.assignedPerson);
          const target = coverageSlots.length || (shiftLineTargets[shift.baseShift][line] ?? 6);
          const available = filledPositions.length;

          return {
            day,
            line,
            shiftId: shift.id,
            shiftLabel: shift.label,
            shiftBase: shift.baseShift,
            shiftAbbreviation: getShiftAbbreviation(shift),
            rawEntries,
            visibleEntries,
            coverageSlots,
            missingPositions,
            filledPositions,
            target,
            available,
          };
        })),
      }))
  ), [assignmentsByShift, getShiftAbbreviation, selectedAreaLine, selectedEventFilter, selectedRoleFilter, summaryShiftViews]);

  const summaryCoverage = React.useMemo(() => {
    const cells = summaryCoverageRows.flatMap((line) => line.cells);
    const openSlots = cells.reduce((acc, cell) => acc + cell.missingPositions.length, 0);
    const gapBreakdown = cells
      .flatMap((cell) => cell.missingPositions)
      .reduce((acc, slot) => {
        acc[slot.role] = (acc[slot.role] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    const linesCovered = summaryCoverageRows.filter((line) => line.cells.some((cell) => cell.available > 0)).length;
    const availableSlots = cells.reduce((acc, cell) => acc + cell.available, 0);
    return { openSlots, linesCovered, availableSlots, gapBreakdown };
  }, [summaryCoverageRows]);

  const aiScheduleRecommendations = React.useMemo(() => [
    {
      title: 'Fill recurring Operator gap on Line C',
      status: 'Open',
      affectedCells: [
        { line: 'C', day: 'fri' as DayKey, shift: 'night' as BaseShiftKey, previewGain: 3, previewPerson: 'Mason Clarke' },
        { line: 'C', day: 'tue' as DayKey, shift: 'afternoon' as BaseShiftKey, previewGain: 1, previewPerson: 'Mason Clarke' },
        { line: 'C', day: 'wed' as DayKey, shift: 'afternoon' as BaseShiftKey, previewGain: 1, previewPerson: 'Mason Clarke' },
      ],
      findings: [
        'Line C has recurring Operator gaps across the selected week.',
        'Current coverage is below target on the highlighted days.',
        'Adjacent crews show potential relief capacity for supervisor review.',
      ],
      actions: [
        'Review qualified Operators from Crew B and Crew C.',
        'Create a draft plan for Line Leader approval.',
        'Confirm no planned stop or absence constraint blocks the move.',
      ],
      impact: 'Preview indicates Line C can move from critical gap risk toward under-target or full coverage on the highlighted days.',
    },
    {
      title: 'Review overtime imbalance on Crew A',
      status: 'Needs review',
      affectedCells: [
        { line: 'A', day: 'mon' as DayKey, shift: 'morning' as BaseShiftKey, previewGain: 1, previewPerson: 'Olivia Chen' },
        { line: 'A', day: 'fri' as DayKey, shift: 'afternoon' as BaseShiftKey, previewGain: 1, previewPerson: 'Olivia Chen' },
      ],
      findings: [
        'Crew A is carrying more overtime-coded assignments than nearby crews.',
        'The imbalance is visible in the selected Summary window.',
      ],
      actions: [
        'Compare Crew A relief options before approving additional overtime.',
        'Review affected line coverage with the shift supervisor.',
      ],
      impact: 'Preview suggests overtime pressure can be reduced if relief coverage is confirmed.',
    },
    {
      title: 'Validate holiday boundary conflict',
      status: 'Needs review',
      affectedCells: [
        { line: 'B', day: 'thu' as DayKey, shift: 'night' as BaseShiftKey, previewGain: 0, previewPerson: 'Holiday boundary review' },
        { line: 'B', day: 'fri' as DayKey, shift: 'night' as BaseShiftKey, previewGain: 0, previewPerson: 'Holiday boundary review' },
      ],
      findings: [
        'A schedule boundary near the selected period may affect planned coverage.',
        'Highlighted cells should be checked before draft schedule confirmation.',
      ],
      actions: [
        'Validate the holiday boundary against the active shift pattern.',
        'Confirm staffing coverage before publishing any schedule changes.',
      ],
      impact: 'Preview keeps current coverage unchanged until a draft is created and confirmed.',
    },
    {
      title: 'Confirm backup Material Handler coverage',
      status: 'Open',
      affectedCells: [
        { line: 'D', day: 'wed' as DayKey, shift: 'morning' as BaseShiftKey, previewGain: 1, previewPerson: 'Noah Perez' },
        { line: 'D', day: 'sat' as DayKey, shift: 'night' as BaseShiftKey, previewGain: 1, previewPerson: 'Noah Perez' },
      ],
      findings: [
        'Backup Material Handler coverage is thin in the selected Summary view.',
        'A review can prevent late-shift coverage pressure.',
      ],
      actions: [
        'Check cross-trained Material Handlers for optional backup coverage.',
        'Review the draft with the Line Leader before applying changes.',
      ],
      impact: 'Preview indicates reduced staffing risk for the highlighted Line D cells.',
    },
  ], []);

  const [aiRecommendationDecisions, setAiRecommendationDecisions] = React.useState<AiRecommendationDecision[]>(
    () => aiScheduleRecommendations.map(() => 'pending'),
  );
  const [aiDecisionFlash, setAiDecisionFlash] = React.useState<{ decision: AiRecommendationDecision; message: string } | null>(null);

  const selectedAiRecommendation = aiScheduleRecommendations[selectedAiRecommendationIndex] ?? aiScheduleRecommendations[0];
  const selectedAiRecommendationDecision = aiRecommendationDecisions[selectedAiRecommendationIndex] ?? 'pending';
  const selectedAiRecommendationStatusLabel = selectedAiRecommendationDecision === 'accepted'
    ? 'Accepted'
    : selectedAiRecommendationDecision === 'rejected'
      ? 'Rejected'
      : 'Pending review';
  const selectedAiRecommendationStatusSx = selectedAiRecommendationDecision === 'accepted'
    ? { bgcolor: '#ECFDF3', color: '#15803D', border: '1px solid #BBF7D0' }
    : selectedAiRecommendationDecision === 'rejected'
      ? { bgcolor: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' }
      : { bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74' };
  const allAiRecommendationsReviewed = aiRecommendationDecisions.every((decision) => decision !== 'pending');
  const affectedSummaryCellKeys = React.useMemo(() => (
    new Set(selectedAiRecommendation.affectedCells.map((cell) => `${cell.line}-${cell.day}-${cell.shift}`))
  ), [selectedAiRecommendation]);
  const aiCellPreviewByKey = React.useMemo(() => {
    const previews = new Map<string, {
      decision: AiRecommendationDecision;
      previewGain: number;
      previewPerson?: string;
      recommendationIndex: number;
    }>();

    aiScheduleRecommendations.forEach((recommendation, recommendationIndex) => {
      const decision = aiRecommendationDecisions[recommendationIndex] ?? 'pending';
      if (decision === 'pending' && recommendationIndex !== selectedAiRecommendationIndex) return;

      recommendation.affectedCells.forEach((cell) => {
        previews.set(`${cell.line}-${cell.day}-${cell.shift}`, {
          decision,
          previewGain: cell.previewGain ?? 1,
          previewPerson: cell.previewPerson,
          recommendationIndex,
        });
      });
    });

    return previews;
  }, [aiRecommendationDecisions, aiScheduleRecommendations, selectedAiRecommendationIndex]);
  const getSummaryCellAiPreview = React.useCallback((cell: {
    line: string;
    day: { key: DayKey };
    shiftBase: BaseShiftKey;
    available: number;
    target: number;
  }) => {
    const preview = aiCellPreviewByKey.get(`${cell.line}-${cell.day.key}-${cell.shiftBase}`);
    if (!preview) return { decision: null as AiRecommendationDecision | null, available: cell.available, improvement: 0, previewPerson: undefined as string | undefined };

    if (preview.decision !== 'accepted') {
      return { decision: preview.decision, available: cell.available, improvement: 0, previewPerson: preview.previewPerson };
    }

    const improvement = cell.available < cell.target ? Math.min(preview.previewGain, cell.target - cell.available) : 0;
    return {
      decision: preview.decision,
      available: cell.available + improvement,
      improvement,
      previewPerson: preview.previewPerson,
    };
  }, [aiCellPreviewByKey]);
  const displaySummaryCoverage = React.useMemo(() => {
    const cells = summaryCoverageRows.flatMap((line) => line.cells);
    const previewCells = cells.map((cell) => {
      const preview = getSummaryCellAiPreview(cell);
      const adjustedMissingCount = Math.max(cell.target - preview.available, 0);
      return {
        cell,
        preview,
        adjustedMissingCount,
        adjustedMissingPositions: cell.missingPositions.slice(preview.improvement),
      };
    });
    const openSlots = previewCells.reduce((acc, item) => acc + item.adjustedMissingCount, 0);
    const gapBreakdown = previewCells
      .flatMap((item) => item.adjustedMissingPositions)
      .reduce((acc, slot) => {
        acc[slot.role] = (acc[slot.role] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    const linesCovered = summaryCoverageRows.filter((line) => line.cells.some((cell) => getSummaryCellAiPreview(cell).available > 0)).length;
    const availableSlots = previewCells.reduce((acc, item) => acc + item.preview.available, 0);
    return { openSlots, linesCovered, availableSlots, gapBreakdown };
  }, [getSummaryCellAiPreview, summaryCoverageRows]);
  const handleAiRecommendationDecision = React.useCallback((decision: Exclude<AiRecommendationDecision, 'pending'>) => {
    const decidedRecommendationIndex = selectedAiRecommendationIndex;
    if (aiDecisionAdvanceTimerRef.current !== null) {
      window.clearTimeout(aiDecisionAdvanceTimerRef.current);
      aiDecisionAdvanceTimerRef.current = null;
    }
    setAiRecommendationDecisions((prev) => {
      const next = [...prev];
      next[decidedRecommendationIndex] = decision;
      return next;
    });
    setAiDecisionFlash({
      decision,
      message: decision === 'accepted'
        ? 'Recommendation accepted. Moving to next...'
        : 'Recommendation rejected. Moving to next...',
    });

    aiDecisionAdvanceTimerRef.current = window.setTimeout(() => {
      setAiDecisionFlash(null);
      setSelectedAiRecommendationIndex((prev) => {
        if (prev !== decidedRecommendationIndex || decidedRecommendationIndex >= aiScheduleRecommendations.length - 1) return prev;
        return decidedRecommendationIndex + 1;
      });
      aiDecisionAdvanceTimerRef.current = null;
    }, 800);
  }, [aiScheduleRecommendations.length, selectedAiRecommendationIndex]);
  const handleAiRecommendationNavigation = React.useCallback((direction: 'previous' | 'next') => {
    if (aiDecisionAdvanceTimerRef.current !== null) {
      window.clearTimeout(aiDecisionAdvanceTimerRef.current);
      aiDecisionAdvanceTimerRef.current = null;
    }
    setAiDecisionFlash(null);
    setSelectedAiRecommendationIndex((prev) => (
      direction === 'previous'
        ? (prev + aiScheduleRecommendations.length - 1) % aiScheduleRecommendations.length
        : (prev + 1) % aiScheduleRecommendations.length
    ));
  }, [aiScheduleRecommendations.length]);
  const summaryKpis = React.useMemo(() => {
    const totalVisibleRequired = displaySummaryCoverage.availableSlots + displaySummaryCoverage.openSlots;
    const coveragePercent = Math.max(0, Math.round((displaySummaryCoverage.availableSlots / Math.max(totalVisibleRequired, 1)) * 100));
    const assignedValue = selectedDepartment === 'Production' ? displaySummaryCoverage.availableSlots : departmentPeopleOnDuty.length;
    const requiredValue = selectedDepartment === 'Production' ? totalVisibleRequired : departmentPeopleOnDuty.length + departmentPeopleOnDuty.filter((person) => person.status).length;
    const pendingApprovalCount = shiftRequestItems.filter((request) => request.status === 'Requested').length;

    return [
      {
        label: 'Assigned / Required',
        value: `${assignedValue} / ${requiredValue}`,
        detail: 'assigned vs required in current view',
        trend: selectedSummaryShiftId === 'all' ? 'all shifts' : `${shiftDisplayLabels[selectedSummaryShiftId] ?? selectedSummaryShiftId}`,
        tone: '#0F766E',
        bg: '#ECFEFF',
        icon: <GroupsIcon sx={{ fontSize: 14 }} />,
        sparkline: '2,28 18,24 34,25 50,18 66,20 82,12 98,15',
      },
      {
        label: 'Coverage %',
        value: `${coveragePercent}%`,
        detail: 'based on assigned headcount and required staffing',
        trend: 'filtered view',
        tone: '#7C3AED',
        bg: '#F5F3FF',
        icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
        sparkline: '2,30 18,26 34,22 50,20 66,16 82,12 98,14',
      },
      {
        label: 'Vacancy Count',
        value: String(selectedDepartment === 'Production' ? displaySummaryCoverage.openSlots : departmentPeopleOnDuty.filter((person) => person.status).length),
        detail: 'open positions / coverage gaps',
        trend: 'filtered scope',
        tone: '#C2410C',
        bg: '#FFF7ED',
        icon: <CancelIcon sx={{ fontSize: 14 }} />,
        sparkline: '2,12 18,14 34,12 50,18 66,22 82,24 98,28',
      },
      {
        label: 'Workforce Status',
        value: '142 working · 12 day off · 5 vacation · 3 sick · 5 training',
        detail: 'status mix in selected period',
        trend: selectedCalendarView,
        tone: '#1D4ED8',
        bg: '#EEF4FF',
        icon: <GroupsIcon sx={{ fontSize: 14 }} />,
        sparkline: '2,24 18,24 34,18 50,18 66,14 82,14 98,10',
      },
      {
        label: 'Schedule Events',
        value: '2 overtime · 1 plant holiday · 3 shift swaps',
        detail: 'events visible in current filters',
        trend: selectedEventFilter === 'All' ? 'all event types' : selectedEventFilter,
        tone: '#0F766E',
        bg: '#ECFEFF',
        icon: <TimeIcon sx={{ fontSize: 14 }} />,
        sparkline: '2,22 18,20 34,21 50,18 66,20 82,18 98,16',
      },
      {
        label: 'Pending Approvals in View',
        value: String(pendingApprovalCount),
        detail: 'requests affecting this selected scope',
        trend: 'approval queue',
        tone: '#C2410C',
        bg: '#FFF7ED',
        icon: <WarningIcon sx={{ fontSize: 14 }} />,
        sparkline: '2,20 18,18 34,22 50,20 66,18 82,24 98,22',
      },
      {
        label: 'Validation Issues',
        value: '2',
        detail: 'calendar or assignment issues in view',
        trend: 'needs review',
        tone: '#B91C1C',
        bg: '#FEF2F2',
        icon: <WarningIcon sx={{ fontSize: 14 }} />,
        sparkline: '2,18 18,16 34,20 50,18 66,24 82,26 98,22',
      },
    ];
  }, [departmentPeopleOnDuty, displaySummaryCoverage.availableSlots, displaySummaryCoverage.openSlots, selectedCalendarView, selectedDepartment, selectedEventFilter, selectedSummaryShiftId, shiftDisplayLabels, shiftRequestItems]);
  const summaryPlannedCalendarKpis = React.useMemo(() => {
    const planningValidationIssues = 2;
    return [
      {
        label: 'Working Hours',
        value: '8,736h',
        detail: 'planned working hours in selected calendar period',
        tone: '#1D4ED8',
        bg: '#EEF4FF',
        icon: <TimeIcon sx={{ fontSize: 13 }} />,
      },
      {
        label: 'Off Hours',
        value: '3,240h',
        detail: 'planned non-working / day-off hours',
        tone: '#475569',
        bg: '#F8FAFC',
        icon: <TimeIcon sx={{ fontSize: 13 }} />,
      },
      {
        label: 'Holiday Hours',
        value: '128h',
        detail: 'configured holiday hours',
        tone: '#7C3AED',
        bg: '#F5F3FF',
        icon: <CheckCircleIcon sx={{ fontSize: 13 }} />,
      },
      {
        label: 'Calendar Validation Issues',
        value: String(planningValidationIssues),
        detail: 'blocking or warning issues',
        tone: '#C2410C',
        bg: '#FFF7ED',
        icon: <WarningIcon sx={{ fontSize: 13 }} />,
      },
      {
        label: 'Publish Status',
        value: planningValidationIssues > 0 ? 'Blocked' : 'Ready',
        detail: 'based on validation state',
        tone: planningValidationIssues > 0 ? '#B91C1C' : '#047857',
        bg: planningValidationIssues > 0 ? '#FEF2F2' : '#ECFDF5',
        icon: planningValidationIssues > 0 ? <WarningIcon sx={{ fontSize: 13 }} /> : <CheckCircleIcon sx={{ fontSize: 13 }} />,
      },
    ];
  }, []);
  const summaryCoverageGridTemplate = `138px repeat(${shiftScheduleWeekDays.length * Math.max(summaryShiftViews.length, 1)}, minmax(${summaryMatrixDetailLevel === 'detailed' ? 190 : 86}px, 1fr))`;

  const selectedShiftMemberRecord = selectedShiftMember as ({
    workerId?: string;
    shiftId?: string;
    name: string;
    status?: keyof typeof shiftScheduleEventStyles;
    shiftLabel: string;
    shiftHours: string;
    dayLabel: string;
  } | null);
  const selectedMoveWorker = moveSelection ? workerDirectory.get(moveSelection.workerId) : null;
  const selectedShiftWorkerMeta = selectedShiftMemberRecord ? workerDirectory.get(selectedShiftMemberRecord.workerId ?? '') ?? workerDirectoryByName.get(selectedShiftMemberRecord.name) : null;
  const selectedShiftMemberProfile = selectedShiftWorkerMeta ? profileDirectory.get(selectedShiftWorkerMeta.id) : null;
  const selectedShiftMemberWeekSchedule = React.useMemo(() => {
    if (!selectedShiftWorkerMeta || !selectedShiftMemberRecord) return [];
    const currentShiftAssignments = assignmentsByShift[selectedShiftMemberRecord.shiftId ?? selectedShiftId] ?? {};
    return shiftScheduleWeekDays.map((day) => {
      const assignment = (currentShiftAssignments[day.key] ?? []).find((item) => item.workerId === selectedShiftWorkerMeta.id);
      return {
        day: day.day,
        date: day.date,
        shift: `Line ${assignment?.line ?? selectedShiftWorkerMeta.line}`,
        hours: activeShiftHours,
        status: assignment?.status,
      };
    });
  }, [activeShiftHours, assignmentsByShift, selectedShiftId, selectedShiftMemberRecord, selectedShiftWorkerMeta]);

  const isDetailedProductionView = selectedCalendarView === 'Day';

  const shiftSelectedPeriod = (direction: -1 | 1) => {
    const current = parseIsoDate(selectedSummaryDate);
    if (selectedCalendarView === 'Day') {
      setSelectedSummaryDate(formatIsoDate(new Date(current.getFullYear(), current.getMonth(), current.getDate() + direction, 12, 0, 0, 0)));
      return;
    }
    if (selectedCalendarView === 'Week') {
      setSelectedSummaryDate(formatIsoDate(new Date(current.getFullYear(), current.getMonth(), current.getDate() + (direction * 7), 12, 0, 0, 0)));
      return;
    }
    if (selectedCalendarView === 'Month') {
      setSelectedSummaryDate(formatIsoDate(new Date(current.getFullYear(), current.getMonth() + direction, 1, 12, 0, 0, 0)));
      return;
    }
    setSelectedSummaryDate(formatIsoDate(new Date(current.getFullYear() + direction, 0, 1, 12, 0, 0, 0)));
  };
  const commandCenterKpis = React.useMemo(() => [
    {
      label: 'Current Shift',
      value: `${shiftDisplayLabels[selectedShiftId] ?? 'Morning'} · ${activeShiftHours}`,
      detail: 'current operational shift',
      tone: '#1D4ED8',
      bg: '#EEF4FF',
      icon: <TimeIcon sx={{ fontSize: 14 }} />,
      sparkline: '2,24 18,24 34,20 50,20 66,18 82,18 98,16',
      trend: 'active now',
      insight: {
        explanation: 'The Command Center is focused on the active operational shift.',
        why: 'Shift context frames staffing gaps, approvals, and schedule readiness decisions.',
        next: 'Review Summary for line and role-level coverage in this shift context.',
        cta: 'Review shift coverage',
      },
    },
    {
      label: 'Team Workforce Status',
      value: '167 active / visible',
      detail: 'workforce visible in current scope',
      tone: '#0F766E',
      bg: '#ECFEFF',
      icon: <GroupsIcon sx={{ fontSize: 14 }} />,
      sparkline: '2,28 18,24 34,25 50,18 66,20 82,12 98,15',
      trend: '+4 vs last shift',
      insight: {
        explanation: 'Visible workforce status is stable for the current scope.',
        why: 'Workforce visibility supports faster assignment, replacement, and approval decisions.',
        next: 'Review people-level coverage where staffing risk is highest.',
        cta: 'Review workforce',
      },
    },
    {
      label: 'Coverage %',
      value: `${Math.max(0, Math.round((summary.availableSlots / Math.max(summary.availableSlots + summary.openSlots, 1)) * 100))}%`,
      detail: 'assigned vs required staffing',
      tone: '#7C3AED',
      bg: '#F5F3FF',
      icon: <CheckCircleIcon sx={{ fontSize: 14 }} />,
      sparkline: '2,30 18,26 34,22 50,20 66,16 82,12 98,14',
      trend: 'filtered view',
      insight: {
        explanation: 'Coverage compares assigned staffing against required staffing in the current scope.',
        why: 'Strong aggregate coverage can still hide shift, team, or role-specific shortages.',
        next: 'Review affected shifts in Summary.',
        cta: 'Review coverage',
      },
    },
    {
      label: 'Vacancy Count',
      value: `${summary.openSlots}`,
      detail: 'open positions / staffing gaps',
      tone: '#C2410C',
      bg: '#FFF7ED',
      icon: <CancelIcon sx={{ fontSize: 14 }} />,
      sparkline: '2,12 18,14 34,12 50,18 66,22 82,24 98,28',
      trend: 'watch trend',
      insight: {
        explanation: 'Open positions need attention before they become current-shift coverage gaps.',
        why: 'Vacancies can create reassignment pressure, overtime events, or uncovered required roles.',
        next: 'Open Summary to locate gaps by line, day, and shift.',
        cta: 'Locate vacancies',
      },
    },
    {
      label: 'Pending Approvals',
      value: `${shiftRequestItems.filter((request) => request.status === 'Requested').length}`,
      detail: 'shift swaps and schedule-affecting requests',
      tone: '#C2410C',
      bg: '#FFF7ED',
      icon: <WarningIcon sx={{ fontSize: 14 }} />,
      sparkline: '2,20 18,18 34,22 50,20 66,18 82,24 98,22',
      trend: 'manager review',
      insight: {
        explanation: 'Pending approvals include requests that may change coverage or assignment readiness.',
        why: 'Approval decisions should account for whether a request creates or resolves a staffing gap.',
        next: 'Open quick approvals for schedule-affecting requests.',
        cta: 'Review approvals',
      },
    },
    {
      label: 'Calendar Validation Issues',
      value: '2',
      detail: 'blocking or warning issues before publish/use',
      tone: '#B91C1C',
      bg: '#FEF2F2',
      icon: <WarningIcon sx={{ fontSize: 14 }} />,
      sparkline: '2,18 18,16 34,20 50,18 66,24 82,26 98,22',
      trend: 'needs validation',
      insight: {
        explanation: 'Two local validation warnings need review before calendar use or publish readiness.',
        why: 'Boundary or assignment warnings can reduce trust in the generated schedule.',
        next: 'Review calendar validation guidance with staffing recommendations.',
        cta: 'Review validation',
      },
    },
  ], [activeShiftHours, selectedShiftId, shiftDisplayLabels, shiftRequestItems, summary.availableSlots, summary.openSlots]);

  const commandCenterSections = React.useMemo(() => ({
    aiInsights: [
      { title: 'Line C Operator replacement needed', detail: 'BLU.AI detected recurring understaffing in the selected week.', tone: '#1D4ED8', action: 'Review AI recommendations' },
      { title: 'Crew A working-hours balance needs review', detail: 'Relief coverage could reduce overload before handoff.', tone: '#C2410C', action: 'Preview in Summary' },
      { title: 'Holiday boundary should be validated', detail: 'Planned stop timing overlaps a crew-pattern transition.', tone: '#7C3AED', action: 'Check validation' },
    ],
    readiness: [
      { label: 'Current Shift', value: `${shiftDisplayLabels[selectedShiftId] ?? 'Morning'} shift`, detail: `${activeShiftHours} operational window` },
      { label: 'Coverage Health', value: summary.openSlots ? 'Coverage watch' : 'Stable', detail: `${summary.availableSlots} assigned against required staffing` },
      { label: 'Calendar Validation Issues', value: '2 warnings', detail: 'assignment and holiday boundary checks' },
    ],
    gaps: [
      { role: 'Operator', line: 'Line C', shift: shiftDisplayLabels[selectedShiftId] ?? 'Current shift', status: 'Recurring gap' },
      { role: 'Material Handler', line: 'Line A', shift: 'Morning Shift', status: 'Unfilled today' },
      { role: 'Quality Inspector', line: 'Line B', shift: 'Afternoon Shift', status: 'Backup needed' },
    ],
    aiRecommendations: [
      { title: 'Find replacement for recurring Operator gap on Line C', detail: 'Recurring staffing gap across three visible days; Crew C has the best match for coverage review.', tone: '#1D4ED8' },
      { title: 'Balance working hours for Crew A', detail: 'Crew A is carrying more relief coverage than nearby crews in the same window.', tone: '#C2410C' },
      { title: 'Resolve holiday boundary validation warning', detail: 'Upcoming planned stop overlaps a pattern transition and should be reviewed before calendar use.', tone: '#7C3AED' },
    ],
    priorityApprovals: {
      summary: ['5 requests need approval', '2 high impact', '1 creates critical coverage gap', '3 can be approved with no coverage impact'],
      requestTypes: ['Swap', 'Vacation', 'Overtime', 'Absence'],
      rows: [
        { title: 'Swap request impacts Line C Night Shift', status: 'High impact', tone: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' },
        { title: 'Vacation request creates Operator gap', status: 'Needs review', tone: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
        { title: 'Overtime request has no coverage impact', status: 'Low risk', tone: '#047857', bg: '#ECFDF5', border: '#A7F3D0' },
      ],
      requests: [
        {
          id: 'approval-swap-line-c-night',
          type: 'Swap',
          employee: 'Emma Diaz',
          context: 'Line C · Fri 20 · Night Shift',
          lineArea: 'Line C',
          date: 'Fri 20',
          shift: 'Night Shift',
          requestedChange: 'Swap Night Shift coverage with Mason Clarke.',
          impact: 'Creates Operator gap if approved without replacement',
          aiCheck: 'Needs review',
          status: 'High impact',
          tone: '#B91C1C',
          bg: '#FEF2F2',
          border: '#FECACA',
        },
        {
          id: 'approval-vacation-operator-gap',
          type: 'Vacation',
          employee: 'Olivia Chen',
          context: 'Line C · Mon 16 · Morning Shift',
          lineArea: 'Line C',
          date: 'Mon 16',
          shift: 'Morning Shift',
          requestedChange: 'Vacation request for scheduled Operator slot.',
          impact: 'Creates Operator gap unless backup coverage is assigned',
          aiCheck: 'Needs review',
          status: 'Needs review',
          tone: '#C2410C',
          bg: '#FFF7ED',
          border: '#FED7AA',
        },
        {
          id: 'approval-overtime-no-impact',
          type: 'Overtime',
          employee: 'Noah Perez',
          context: 'Line A · Tue 17 · Afternoon Shift',
          lineArea: 'Line A',
          date: 'Tue 17',
          shift: 'Afternoon Shift',
          requestedChange: 'Overtime extension for planned handoff support.',
          impact: 'No coverage gap created in current view',
          aiCheck: 'Low risk',
          status: 'Low risk',
          tone: '#047857',
          bg: '#ECFDF5',
          border: '#A7F3D0',
        },
        {
          id: 'approval-absence-material-handler',
          type: 'Absence',
          employee: 'Liam Brooks',
          context: 'Line B · Wed 18 · Morning Shift',
          lineArea: 'Line B',
          date: 'Wed 18',
          shift: 'Morning Shift',
          requestedChange: 'Absence reported for Material Handler coverage.',
          impact: 'Backup role is available with no critical coverage impact',
          aiCheck: 'Coverage available',
          status: 'Low risk',
          tone: '#047857',
          bg: '#ECFDF5',
          border: '#A7F3D0',
        },
        {
          id: 'approval-swap-qa-inspector',
          type: 'Swap',
          employee: 'Mia Foster',
          context: 'Quality Lab · Thu 19 · Afternoon Shift',
          lineArea: 'Quality Lab',
          date: 'Thu 19',
          shift: 'Afternoon Shift',
          requestedChange: 'Swap QA Inspector coverage with Ava Turner.',
          impact: 'No coverage impact if swap partner confirms',
          aiCheck: 'Pending confirmation',
          status: 'Needs review',
          tone: '#C2410C',
          bg: '#FFF7ED',
          border: '#FED7AA',
        },
      ],
    },
    criticalActions: [
      { title: 'Review open Line C Operator gap', owner: 'Line Leader', due: 'Before shift handoff' },
      { title: 'Approve pending schedule requests', owner: 'Supervisor', due: `${shiftRequestItems.filter((request) => request.status === 'Requested').length} waiting` },
      { title: 'Confirm planned stop readiness', owner: 'Factory Admin', due: `${holidayItems.filter((item) => item.isActive).length} active stops` },
    ],
  }), [activeShiftHours, holidayItems, selectedShiftId, shiftDisplayLabels, shiftRequestItems, summary.availableSlots, summary.openSlots]);

  const quickApprovalRequests = commandCenterSections.priorityApprovals.requests;
  const selectedQuickApproval = quickApprovalRequests[selectedQuickApprovalIndex] ?? quickApprovalRequests[0];
  const selectedQuickApprovalDecision = selectedQuickApproval ? quickApprovalDecisions[selectedQuickApproval.id] : undefined;
  const updateQuickApprovalDecision = React.useCallback((decision: string) => {
    if (!selectedQuickApproval) return;
    setQuickApprovalDecisions((prev) => ({ ...prev, [selectedQuickApproval.id]: decision }));
  }, [selectedQuickApproval]);

  const openSummaryWithAiFocus = React.useCallback((openAiDrawer = false) => {
    shouldFocusSummaryPlanOnNextLoad = true;
    shouldOpenSummaryAiDrawerOnNextLoad = openAiDrawer;
    setCurrentScreen('shift_schedule_summary');
  }, [setCurrentScreen]);

  if (viewMode === 'crewPatternOverview') {
    return (
      <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 1.5, md: 2.25 } }}>
        <Paper sx={{ p: { xs: 1.2, md: 1.5 }, borderRadius: 3 }}>
          <Paper
            elevation={0}
            sx={{
              mb: 1.2,
              px: { xs: 1.2, md: 1.5 },
              py: { xs: 1.05, md: 1.15 },
              borderRadius: 2.5,
              border: '1px solid #D8DEE8',
              bgcolor: '#FFFFFF',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' },
              alignItems: 'flex-start',
              gap: 1.2,
            }}
          >
            <Box sx={{ minWidth: 0, maxWidth: 760 }}>
              <Typography variant="caption" sx={{ color: activeTheme.primary, letterSpacing: '0.08em', fontWeight: 800, lineHeight: 1, textTransform: 'uppercase' }}>
                COMMAND CENTER
              </Typography>
              <Typography variant="h5" sx={{ color: activeTheme.textPrimary, fontWeight: 800, fontSize: { xs: '1.12rem', md: '1.32rem' }, lineHeight: 1.05, mt: 0.2 }}>
                Shift Command Center
              </Typography>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, mt: 0.22, display: 'block', maxWidth: 700, lineHeight: 1.3, fontSize: '0.72rem' }}>
                Real-time view of coverage health, staffing risks, pending decisions, AI recommendations, and schedule readiness.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.6, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, minWidth: 0 }}>
              {renderShiftSchedulePersistentActions()}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ mb: 1, p: 1.05, borderRadius: 2.2, border: '1px solid #BFDBFE', bgcolor: '#F8FBFF' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 0.8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: 1.5, display: 'grid', placeItems: 'center', bgcolor: '#EEF4FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                  <SparkleIcon sx={{ fontSize: 17 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 900, lineHeight: 1.1 }}>
                    BLU.AI Insights
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                    AI-assisted signals for shift readiness review.
                  </Typography>
                </Box>
              </Box>
              <Chip
                size="small"
                icon={<SparkleIcon sx={{ fontSize: '13px !important' }} />}
                label="AI Agent Active"
                sx={{ height: 24, bgcolor: '#EEF4FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontWeight: 900, '& .MuiChip-label': { px: 0.75, fontSize: '0.64rem' } }}
              />
            </Box>
            <Grid container spacing={0.75}>
              {commandCenterSections.aiInsights.map((insight) => (
                <Grid key={insight.title} size={{ xs: 12, md: 4 }}>
                  <Paper elevation={0} sx={{ p: 0.85, borderRadius: 1.7, border: `1px solid ${insight.tone}26`, bgcolor: '#FFFFFF', height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.55 }}>
                      <SparkleIcon sx={{ fontSize: 14, color: insight.tone, mt: 0.12, flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: '#1F2937', fontWeight: 900, fontSize: '0.82rem', lineHeight: 1.16 }}>
                          {insight.title}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mt: 0.3, lineHeight: 1.25 }}>
                          {insight.detail}
                        </Typography>
                        <Typography variant="caption" sx={{ color: insight.tone, fontWeight: 900, display: 'block', mt: 0.55 }}>
                          {insight.action}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Grid container spacing={1}>
            {commandCenterKpis.map((card) => (
              <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 2 }}>
                <Paper elevation={0} sx={{ p: 1.15, borderRadius: 2.2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8, mb: 0.85 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0 }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: 1.1, display: 'grid', placeItems: 'center', bgcolor: card.bg, color: card.tone, flexShrink: 0 }}>
                        {card.icon}
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', lineHeight: 1.2 }}>
                        {card.label}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      aria-label={`${card.label} AI insight`}
                      onClick={(event) => setCommandCenterKpiInsight({ label: card.label, anchorEl: event.currentTarget })}
                      sx={{
                        width: 24,
                        height: 24,
                        color: card.tone,
                        bgcolor: `${card.tone}12`,
                        border: `1px solid ${card.tone}28`,
                        '&:hover': { bgcolor: `${card.tone}1F`, boxShadow: `0 0 0 3px ${card.tone}12` },
                      }}
                    >
                      <SparkleIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Box>
                  <Typography sx={{ color: card.tone, fontSize: '1.35rem', fontWeight: 900, lineHeight: 1 }}>
                    {card.value}
                  </Typography>
                  <Box sx={{ mt: 0.6, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 0.8 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontWeight: 700, lineHeight: 1.25 }}>
                        {card.detail}
                      </Typography>
                      <Typography variant="caption" sx={{ color: card.tone, display: 'block', mt: 0.25, fontWeight: 900, fontSize: '0.58rem' }}>
                        {card.trend}
                      </Typography>
                    </Box>
                    <Box
                      component="svg"
                      viewBox="0 0 100 34"
                      sx={{ width: 76, height: 28, flexShrink: 0, overflow: 'visible' }}
                      aria-hidden="true"
                    >
                      <polyline points={card.sparkline} fill="none" stroke={card.tone} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.82" />
                      <polyline points={card.sparkline} fill="none" stroke={card.tone} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
                    </Box>
                  </Box>
                </Paper>
                <Popover
                  open={commandCenterKpiInsight?.label === card.label}
                  anchorEl={commandCenterKpiInsight?.label === card.label ? commandCenterKpiInsight.anchorEl : null}
                  onClose={() => setCommandCenterKpiInsight(null)}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                  PaperProps={{
                    sx: {
                      width: 330,
                      maxWidth: 'calc(100vw - 32px)',
                      p: 1.15,
                      borderRadius: 2,
                      border: '1px solid #BFDBFE',
                      boxShadow: '0 18px 40px rgba(15,23,42,0.16)',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mb: 0.75 }}>
                    <SparkleIcon sx={{ fontSize: 15, color: card.tone }} />
                    <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      AI insight
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 850, lineHeight: 1.35, mb: 0.85 }}>
                    {card.insight.explanation}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem' }}>
                    Why it matters
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#334155', display: 'block', mt: 0.25, mb: 0.75, lineHeight: 1.35, fontWeight: 700 }}>
                    {card.insight.why}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem' }}>
                    Suggested next step
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#334155', display: 'block', mt: 0.25, mb: 0.9, lineHeight: 1.35, fontWeight: 700 }}>
                    {card.insight.next}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SparkleIcon />}
                    onClick={() => {
                      setCommandCenterKpiInsight(null);
                      openSummaryWithAiFocus(card.label === 'Calendar Validation Issues');
                    }}
                    sx={{ borderRadius: 1.6, textTransform: 'none', fontWeight: 900 }}
                  >
                    {card.insight.cta}
                  </Button>
                </Popover>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={1.1} sx={{ mt: 1.15 }}>
            <Grid size={{ xs: 12, lg: 7.2 }}>
              <Paper elevation={0} sx={{ p: 1.2, borderRadius: 2.2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#1F2937', fontWeight: 900, lineHeight: 1.1 }}>
                      Current Shift Readiness
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      What needs attention now across shift readiness, staffing coverage, vacancies, and validation issues.
                    </Typography>
                  </Box>
                </Box>
                <Grid container spacing={0.8}>
                  {commandCenterSections.readiness.map((item) => (
                    <Grid key={item.label} size={{ xs: 12, md: 4 }}>
                      <Paper elevation={0} sx={{ p: 1, borderRadius: 1.8, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC', height: '100%' }}>
                        <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem' }}>
                          {item.label}
                        </Typography>
                        <Typography sx={{ color: '#1F2937', fontWeight: 900, mt: 0.35, lineHeight: 1.1 }}>
                          {item.value}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mt: 0.3 }}>
                          {item.detail}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" sx={{ color: '#C2410C', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.66rem' }}>
                      Open Staffing Gaps
                    </Typography>
                    <Box sx={{ mt: 0.7, display: 'flex', flexDirection: 'column', gap: 0.65 }}>
                      {commandCenterSections.gaps.map((gap) => (
                        <Paper key={`${gap.line}-${gap.role}`} elevation={0} sx={{ p: 0.85, borderRadius: 1.6, border: '1px solid #FED7AA', bgcolor: '#FFF7ED' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8, flexWrap: 'wrap' }}>
                            <Typography sx={{ color: '#1F2937', fontWeight: 900, fontSize: '0.84rem' }}>{gap.role} - {gap.line}</Typography>
                            <Chip size="small" label={gap.status} sx={{ height: 20, bgcolor: '#FFEDD5', color: '#C2410C', border: '1px solid #FDBA74', fontWeight: 900, '& .MuiChip-label': { px: 0.7, fontSize: '0.62rem' } }} />
                          </Box>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>{gap.shift}</Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.66rem' }}>
                      Pending Requests / Upcoming Planned Stops
                    </Typography>
                    <Box sx={{ mt: 0.7, display: 'flex', flexDirection: 'column', gap: 0.65 }}>
                      {shiftRequestItems.filter((request) => request.status === 'Requested').slice(0, 2).map((request) => (
                        <Paper key={request.id} elevation={0} sx={{ p: 0.85, borderRadius: 1.6, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF' }}>
                          <Typography sx={{ color: '#1F2937', fontWeight: 900, fontSize: '0.84rem' }}>{request.type}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>{request.requestedBy} - {request.startDate}</Typography>
                        </Paper>
                      ))}
                      {holidayItems.filter((item) => item.isActive).slice(0, 1).map((item) => (
                        <Paper key={item.id} elevation={0} sx={{ p: 0.85, borderRadius: 1.6, border: '1px solid #DDD6FE', bgcolor: '#F5F3FF' }}>
                          <Typography sx={{ color: '#1F2937', fontWeight: 900, fontSize: '0.84rem' }}>{item.title}</Typography>
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>{item.scopeDetail} - {item.startDate}</Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 4.8 }} sx={{ alignSelf: 'flex-start' }}>
              <Paper elevation={0} sx={{ px: 1, py: 0.85, borderRadius: 2, border: '1px solid #FED7AA', bgcolor: '#FFFBEB', height: 'auto', alignSelf: 'flex-start' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.8, flexWrap: 'wrap', mb: 0.55 }}>
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#1F2937', fontWeight: 900, lineHeight: 1.05 }}>
                      Priority Approvals
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, lineHeight: 1.2 }}>
                      Operational request decisions that may affect current or working-calendar coverage.
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setSelectedQuickApprovalIndex(0);
                      setIsQuickApprovalsOpen(true);
                    }}
                    sx={{ borderRadius: 2, fontWeight: 900, textTransform: 'none', minHeight: 30, boxShadow: 'none', bgcolor: '#C2410C', '&:hover': { bgcolor: '#9A3412' } }}
                  >
                    Open quick approvals
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.45, flexWrap: 'wrap', mb: 0.5 }}>
                  {commandCenterSections.priorityApprovals.summary.map((item, index) => (
                    <Box
                      key={item}
                      sx={{
                        px: 0.75,
                        py: 0.28,
                        borderRadius: 999,
                        border: index === 2 ? '1px solid #FECACA' : '1px solid #FED7AA',
                        bgcolor: index === 2 ? '#FEF2F2' : '#FFFFFF',
                        color: index === 2 ? '#B91C1C' : '#334155',
                        fontWeight: 900,
                        fontSize: '0.66rem',
                        lineHeight: 1.15,
                      }}
                    >
                      {item}
                    </Box>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.4, flexWrap: 'wrap', mb: 0.55 }}>
                  {commandCenterSections.priorityApprovals.requestTypes.map((type) => (
                    <Chip
                      key={type}
                      size="small"
                      label={type}
                      sx={{ height: 21, bgcolor: '#FFFFFF', color: '#92400E', border: '1px solid #FED7AA', fontWeight: 900, '& .MuiChip-label': { px: 0.65, fontSize: '0.6rem' } }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'grid', gap: 0.4 }}>
                  {commandCenterSections.priorityApprovals.rows.map((request, index) => (
                    <Paper key={request.title} elevation={0} sx={{ px: 0.75, py: 0.5, borderRadius: 1.5, border: `1px solid ${request.border}`, bgcolor: '#FFFFFF' }}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto auto' }, alignItems: 'center', gap: 0.55 }}>
                        <Typography sx={{ color: '#1F2937', fontWeight: 900, fontSize: '0.82rem', lineHeight: 1.15, minWidth: 0 }}>
                          {request.title}
                        </Typography>
                        <Chip
                          size="small"
                          label={request.status}
                          sx={{ justifySelf: { xs: 'start', sm: 'end' }, height: 20, bgcolor: request.bg, color: request.tone, border: `1px solid ${request.border}`, fontWeight: 900, '& .MuiChip-label': { px: 0.7, fontSize: '0.62rem' } }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSelectedQuickApprovalIndex(index);
                            setIsQuickApprovalsOpen(true);
                          }}
                          sx={{ justifySelf: { xs: 'start', sm: 'end' }, borderRadius: 1.6, fontWeight: 900, textTransform: 'none', minHeight: 24, px: 1.05, py: 0.1 }}
                        >
                          Review
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 7.2 }}>
              <Paper elevation={0} sx={{ p: 1.2, borderRadius: 2.2, border: '1px solid #BFDBFE', bgcolor: '#F8FBFF', height: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
                      <SparkleIcon sx={{ fontSize: 15, color: '#1D4ED8' }} />
                      <Typography variant="subtitle1" sx={{ color: '#1F2937', fontWeight: 900, lineHeight: 1.1 }}>
                        AI Recommendations / Staffing Insights
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Mock decision-support signals for review only.
                    </Typography>
                  </Box>
                  <Chip size="small" icon={<SparkleIcon sx={{ fontSize: '12px !important' }} />} label="Mock AI" sx={{ height: 22, bgcolor: '#EEF4FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontWeight: 900 }} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {commandCenterSections.aiRecommendations.map((item, index) => (
                    <Paper key={item.title} elevation={0} sx={{ p: 0.95, borderRadius: 1.7, border: `1px solid ${item.tone}33`, bgcolor: '#FFFFFF' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8 }}>
                        <Typography sx={{ color: '#1F2937', fontWeight: 900, fontSize: '0.86rem', lineHeight: 1.2 }}>{item.title}</Typography>
                        <Typography variant="caption" sx={{ color: item.tone, fontWeight: 900 }}>{index + 1}/3</Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mt: 0.45, lineHeight: 1.3 }}>
                        {item.detail}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
                <Box sx={{ mt: 1, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  <Button variant="contained" size="small" startIcon={<SparkleIcon />} onClick={() => openSummaryWithAiFocus(true)} sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', boxShadow: 'none' }}>
                    Review AI recommendations
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => openSummaryWithAiFocus(false)} sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}>
                    Review in Summary
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, lg: 4.8 }}>
              <Paper elevation={0} sx={{ p: 1.2, borderRadius: 2.2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Typography variant="subtitle1" sx={{ color: '#1F2937', fontWeight: 900, lineHeight: 1.1 }}>
                  Critical Actions
                </Typography>
                <Grid container spacing={0.85} sx={{ mt: 0.85 }}>
                  {commandCenterSections.criticalActions.map((action) => (
                    <Grid key={action.title} size={{ xs: 12 }}>
                      <Paper elevation={0} sx={{ p: 0.95, borderRadius: 1.7, border: '1px solid #E2E8F0', bgcolor: '#FBFDFF', height: '100%' }}>
                        <Typography sx={{ color: '#1F2937', fontWeight: 900, fontSize: '0.86rem', lineHeight: 1.2 }}>{action.title}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mt: 0.45 }}>{action.owner}</Typography>
                        <Chip size="small" label={action.due} sx={{ mt: 0.7, height: 20, bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 900, '& .MuiChip-label': { px: 0.7, fontSize: '0.62rem' } }} />
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          <Drawer
            anchor="right"
            open={isQuickApprovalsOpen}
            onClose={() => setIsQuickApprovalsOpen(false)}
            ModalProps={{ BackdropProps: { invisible: true } }}
            PaperProps={{
              sx: {
                width: { xs: '100%', sm: 420 },
                maxWidth: '100vw',
                p: 1.4,
                bgcolor: '#F8FAFC',
                borderLeft: '1px solid #CBD5E1',
                boxShadow: '-18px 0 38px rgba(15,23,42,0.14)',
              },
            }}
          >
            {selectedQuickApproval ? (
              <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Quick Approvals
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 950, lineHeight: 1.1, mt: 0.2 }}>
                      Request {selectedQuickApprovalIndex + 1} of {quickApprovalRequests.length}
                    </Typography>
                  </Box>
                  <IconButton size="small" onClick={() => setIsQuickApprovalsOpen(false)} sx={{ color: '#64748B' }}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.6, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={selectedQuickApprovalIndex === 0}
                    onClick={() => setSelectedQuickApprovalIndex((prev) => Math.max(prev - 1, 0))}
                    sx={{ borderRadius: 1.6, fontWeight: 900, textTransform: 'none', minHeight: 28 }}
                  >
                    Previous
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={selectedQuickApprovalIndex === quickApprovalRequests.length - 1}
                    onClick={() => setSelectedQuickApprovalIndex((prev) => Math.min(prev + 1, quickApprovalRequests.length - 1))}
                    sx={{ borderRadius: 1.6, fontWeight: 900, textTransform: 'none', minHeight: 28 }}
                  >
                    Next
                  </Button>
                  {selectedQuickApprovalDecision ? (
                    <Chip
                      size="small"
                      label={selectedQuickApprovalDecision}
                      sx={{ height: 22, bgcolor: '#EEF4FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontWeight: 900, '& .MuiChip-label': { px: 0.7, fontSize: '0.62rem' } }}
                    />
                  ) : null}
                </Box>

                <Paper elevation={0} sx={{ p: 1.15, borderRadius: 2, border: `1px solid ${selectedQuickApproval.border}`, bgcolor: '#FFFFFF' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography sx={{ color: '#0F172A', fontWeight: 950, fontSize: '1rem', lineHeight: 1.15 }}>
                        {selectedQuickApproval.type} request
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
                        {selectedQuickApproval.employee}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={selectedQuickApproval.status}
                      sx={{ height: 22, bgcolor: selectedQuickApproval.bg, color: selectedQuickApproval.tone, border: `1px solid ${selectedQuickApproval.border}`, fontWeight: 900, '& .MuiChip-label': { px: 0.7, fontSize: '0.62rem' } }}
                    />
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.7 }}>
                    {[
                      ['Line / Area', selectedQuickApproval.lineArea],
                      ['Date', selectedQuickApproval.date],
                      ['Shift', selectedQuickApproval.shift],
                      ['Requester', selectedQuickApproval.employee],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ p: 0.75, borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.56rem' }}>
                          {label}
                        </Typography>
                        <Typography sx={{ color: '#1F2937', fontWeight: 900, fontSize: '0.8rem', lineHeight: 1.2 }}>
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                <Paper elevation={0} sx={{ p: 1.15, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem' }}>
                    Requested change
                  </Typography>
                  <Typography sx={{ mt: 0.35, color: '#1F2937', fontWeight: 850, fontSize: '0.88rem', lineHeight: 1.35 }}>
                    {selectedQuickApproval.requestedChange}
                  </Typography>
                  <Box sx={{ mt: 1, p: 0.85, borderRadius: 1.6, border: `1px solid ${selectedQuickApproval.border}`, bgcolor: selectedQuickApproval.bg }}>
                    <Typography variant="caption" sx={{ color: selectedQuickApproval.tone, fontWeight: 950, textTransform: 'uppercase', fontSize: '0.58rem' }}>
                      Impact summary
                    </Typography>
                    <Typography sx={{ mt: 0.3, color: selectedQuickApproval.tone, fontWeight: 900, fontSize: '0.84rem', lineHeight: 1.3 }}>
                      {selectedQuickApproval.impact}
                    </Typography>
                  </Box>
                  <Box sx={{ mt: 0.85, display: 'flex', justifyContent: 'space-between', gap: 0.8, alignItems: 'center', p: 0.75, borderRadius: 1.5, border: '1px solid #BFDBFE', bgcolor: '#F8FBFF' }}>
                    <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 900 }}>
                      AI check / validation status
                    </Typography>
                    <Chip size="small" label={selectedQuickApproval.aiCheck} sx={{ height: 20, bgcolor: '#EEF4FF', color: '#1D4ED8', border: '1px solid #BFDBFE', fontWeight: 900, '& .MuiChip-label': { px: 0.65, fontSize: '0.6rem' } }} />
                  </Box>
                </Paper>

                <Box sx={{ mt: 'auto', display: 'grid', gap: 0.65 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.65 }}>
                    <Button variant="contained" onClick={() => updateQuickApprovalDecision('Approved locally')} sx={{ borderRadius: 1.8, fontWeight: 900, textTransform: 'none', boxShadow: 'none', bgcolor: '#047857', '&:hover': { bgcolor: '#065F46' } }}>
                      Approve
                    </Button>
                    <Button variant="outlined" onClick={() => updateQuickApprovalDecision('Rejected locally')} sx={{ borderRadius: 1.8, fontWeight: 900, textTransform: 'none', color: '#B91C1C', borderColor: '#FECACA' }}>
                      Reject
                    </Button>
                  </Box>
                  <Button variant="outlined" onClick={() => updateQuickApprovalDecision('More info requested')} sx={{ borderRadius: 1.8, fontWeight: 900, textTransform: 'none' }}>
                    Request more info
                  </Button>
                  <Button
                    variant="text"
                    onClick={() => {
                      setIsQuickApprovalsOpen(false);
                      openSummaryWithAiFocus(false);
                    }}
                    sx={{ borderRadius: 1.8, fontWeight: 900, textTransform: 'none' }}
                  >
                    View impact in Summary
                  </Button>
                </Box>
              </Box>
            ) : null}
          </Drawer>
        </Paper>
      </Box>
    );
  }

  return (
    <Box ref={summaryScrollContainerRef} sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 1.5, md: 2.25 } }}>
      <Paper sx={{ p: { xs: 1.2, md: 1.5 }, borderRadius: 3 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 0.85,
            px: { xs: 1.2, md: 1.5 },
            py: { xs: 1.05, md: 1.15 },
            borderRadius: 2.5,
            border: '1px solid #D8DEE8',
            bgcolor: '#FFFFFF',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' },
            alignItems: 'flex-start',
            gap: 1.2,
          }}
        >
          <Box sx={{ minWidth: 0, maxWidth: 760 }}>
            <Typography variant="caption" sx={{ color: activeTheme.primary, letterSpacing: '0.08em', fontWeight: 800, lineHeight: 1, textTransform: 'uppercase' }}>
              SUMMARY
            </Typography>
            <Typography variant="h5" sx={{ color: activeTheme.textPrimary, fontWeight: 800, fontSize: { xs: '1.08rem', md: '1.24rem' }, lineHeight: 1.05, letterSpacing: '-0.03em', mt: 0.2 }}>
              Workforce Coverage Summary
            </Typography>
            <Typography variant="caption" sx={{ color: activeTheme.textSecondary, mt: 0.22, display: 'block', maxWidth: 760, lineHeight: 1.25, fontSize: '0.69rem' }}>
              See assigned vs required coverage by line, day, shift, role, and selected period.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.6, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, minWidth: 0 }}>
            {renderShiftSchedulePersistentActions()}
          </Box>
        </Paper>
        <>
        <Paper elevation={0} sx={{ mb: 0.85, p: 0.9, borderRadius: 2.2, border: '1px solid #E2E8F0', bgcolor: '#FBFDFF' }}>
          <Grid container spacing={0.75} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Department</InputLabel>
                <Select label="Department" value={selectedDepartment} onChange={(event) => setSelectedDepartment(event.target.value as (typeof departmentOptions)[number])}>
                  {departmentOptions.map((department) => (
                    <MenuItem key={department} value={department}>{department}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Line / Area</InputLabel>
                <Select label="Line / Area" value={selectedLineArea} onChange={(event) => setSelectedLineArea(event.target.value as (typeof lineAreaOptions)[number])}>
                  {areaOptions.map((area) => (
                    <MenuItem key={area} value={area}>{area}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.8 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Shift</InputLabel>
                <Select
                  label="Shift"
                  value={selectedSummaryShiftId}
                  onChange={(event) => {
                    const nextShift = event.target.value as ShiftId | 'all';
                    setSelectedSummaryShiftId(nextShift);
                    if (nextShift !== 'all') setSelectedShiftId(nextShift);
                    setMoveSelection(null);
                  }}
                >
                  <MenuItem value="all">All Shifts</MenuItem>
                  {plannerShiftViews.map((shift) => (
                    <MenuItem key={shift.id} value={shift.id}>{shift.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.65 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Role</InputLabel>
                <Select label="Role" value={selectedRoleFilter} onChange={(event) => setSelectedRoleFilter(event.target.value)}>
                  {roleOptions.map((role) => (
                    <MenuItem key={role} value={role}>{role}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.65 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Event type</InputLabel>
                <Select label="Event type" value={selectedEventFilter} onChange={(event) => setSelectedEventFilter(event.target.value)}>
                  {eventFilterOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 1.55 }}>
              <TextField
                label="Date"
                type="date"
                size="small"
                fullWidth
                value={selectedSummaryDate}
                onChange={(event) => setSelectedSummaryDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 1.55 }}>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={selectedCalendarView}
                onChange={(_, nextView) => nextView && setSelectedCalendarView(nextView)}
                sx={{ width: '100%', '& .MuiToggleButton-root': { flex: 1, px: 0.55, fontSize: '0.66rem', fontWeight: 800, textTransform: 'none' } }}
              >
                {calendarViewOptions.map((view) => (
                  <ToggleButton key={view} value={view}>{view}</ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={0.55} sx={{ mb: 0.65 }}>
          {summaryKpis.map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4, xl: 12 / 7 }}>
              <Paper elevation={0} sx={{ p: 0.72, borderRadius: 1.7, border: '1px solid #E7EDF5', bgcolor: '#FBFDFF', height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mb: 0.35 }}>
                  <Box sx={{ width: 18, height: 18, borderRadius: 1, display: 'grid', placeItems: 'center', bgcolor: item.bg, color: item.tone, flexShrink: 0 }}>
                    {item.icon}
                  </Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem', letterSpacing: '0.04em', lineHeight: 1.15 }}>
                    {item.label}
                  </Typography>
                </Box>
                <Typography sx={{ color: item.tone, fontSize: { xs: '0.88rem', md: '1rem' }, fontWeight: 900, lineHeight: 1.02 }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.6rem', display: 'block', lineHeight: 1.2, mt: 0.25 }}>
                  {item.detail}
                </Typography>
                <Box sx={{ mt: 0.45, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 0.5 }}>
                  <Typography variant="caption" sx={{ color: item.tone, fontWeight: 900, fontSize: '0.58rem', lineHeight: 1.15 }}>
                    {item.trend}
                  </Typography>
                  <Box component="svg" viewBox="0 0 100 34" sx={{ width: 54, height: 20, flexShrink: 0, overflow: 'visible' }} aria-hidden="true">
                    <polyline points={item.sparkline} fill="none" stroke={item.tone} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" opacity="0.82" />
                    <polyline points={item.sparkline} fill="none" stroke={item.tone} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" opacity="0.12" />
                  </Box>
                </Box>
                {selectedDepartment === 'Production' && item.label === 'Vacancy Count' ? (
                  <Box sx={{ mt: 0.45, display: 'flex', gap: 0.35, flexWrap: 'wrap' }}>
                    {Object.entries(displaySummaryCoverage.gapBreakdown).length ? Object.entries(displaySummaryCoverage.gapBreakdown).map(([role, count]) => (
                      <Box
                        key={role}
                        sx={{
                          px: 0.55,
                          py: 0.18,
                          borderRadius: 99,
                          border: '1px solid #FED7AA',
                          bgcolor: '#FFFBEB',
                          color: '#9A3412',
                          fontSize: '0.56rem',
                          fontWeight: 900,
                          lineHeight: 1.25,
                        }}
                      >
                        {count} {role}
                      </Box>
                    )) : (
                      <Box sx={{ px: 0.55, py: 0.18, borderRadius: 99, bgcolor: '#ECFDF3', color: '#15803D', fontSize: '0.56rem', fontWeight: 900 }}>
                        All roles covered
                      </Box>
                    )}
                  </Box>
                ) : null}
              </Paper>
            </Grid>
          ))}
        </Grid>

        {visiblePlannedStops.length ? (
          <Paper elevation={0} sx={{ mb: 0.65, px: 0.9, py: 0.75, borderRadius: 2, border: '1px solid #FECACA', bgcolor: '#FEF2F2' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 900 }}>
                {visiblePlannedStops.length} planned stop{visiblePlannedStops.length > 1 ? 's' : ''} in the visible {selectedCalendarView.toLowerCase()} window
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.35, flexWrap: 'wrap' }}>
                {visiblePlannedStops.slice(0, 4).map((stop) => (
                  <Chip
                    key={stop.id}
                    size="small"
                    label={`${stop.title} · ${stop.startDate}`}
                    sx={{ bgcolor: '#FFFFFF', border: '1px solid #FCA5A5', color: '#991B1B', fontWeight: 800 }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        ) : null}

        <Paper elevation={0} sx={{ mb: 0.65, p: 0.8, borderRadius: 1.8, border: '1px solid #D8DEE8', bgcolor: '#FFFFFF' }}>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', gap: 0.8, mb: 0.65, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', letterSpacing: '0.04em' }}>
                Planned Calendar KPIs
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', fontSize: '0.64rem', mt: 0.12 }}>
                Is the planned calendar balanced, valid, and publish-ready?
              </Typography>
            </Box>
            <Chip
              size="small"
              label="Planning context"
              sx={{ height: 22, borderRadius: 999, bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #E2E8F0', fontWeight: 800, fontSize: '0.62rem' }}
            />
          </Box>
          <Grid container spacing={0.5}>
            {summaryPlannedCalendarKpis.map((item) => (
              <Grid key={item.label} size={{ xs: 12, sm: 6, md: 12 / 5 }}>
                <Paper elevation={0} sx={{ p: 0.65, borderRadius: 1.5, border: '1px solid #E7EDF5', bgcolor: '#FBFDFF', height: '100%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.32 }}>
                    <Box sx={{ width: 17, height: 17, borderRadius: 1, display: 'grid', placeItems: 'center', bgcolor: item.bg, color: item.tone, flexShrink: 0 }}>
                      {item.icon}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.55rem', letterSpacing: '0.04em', lineHeight: 1.15 }}>
                      {item.label}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: item.tone, fontSize: { xs: '0.82rem', md: '0.94rem' }, fontWeight: 900, lineHeight: 1.04 }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, fontSize: '0.58rem', display: 'block', lineHeight: 1.2, mt: 0.22 }}>
                    {item.detail}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Box sx={{ mb: 0.6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
            Coverage by Line, Day and Shift - {selectedDepartment} - {selectedCalendarView} view for {periodLabel}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
            <Button
              variant={isSummaryAiDrawerOpen ? 'contained' : 'outlined'}
              size="small"
              startIcon={<SparkleIcon />}
              onClick={() => {
                setSelectedAiRecommendationIndex(0);
                setIsSummaryAiDrawerOpen(true);
              }}
              sx={{ borderRadius: 999, fontWeight: 800, textTransform: 'none', minHeight: 34, boxShadow: 'none' }}
            >
              Review AI recommendations
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={isCalendarFullscreen ? <CloseFullscreenIcon /> : <OpenInFullIcon />}
              onClick={() => setIsCalendarFullscreen((prev) => !prev)}
              sx={{ borderRadius: 999, fontWeight: 800, textTransform: 'none', minHeight: 34 }}
            >
              {isCalendarFullscreen ? 'Exit Full Screen' : 'Full Screen'}
            </Button>
          </Box>
        </Box>

        {selectedDepartment === 'Production' ? (
          <>
        <Box
          ref={summaryCoveragePlanRef}
          sx={{
            display: 'grid',
            gridTemplateColumns: isCalendarFullscreen
              ? (isSummaryAiDrawerOpen ? { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 360px', xl: 'minmax(0, 1fr) 380px' } : { xs: 'minmax(0, 1fr)' })
              : (isSummaryAiDrawerOpen ? { xs: '1fr', md: 'minmax(0, 1fr) 340px', xl: 'minmax(0, 1fr) 360px' } : { xs: '1fr' }),
            gridTemplateRows: isCalendarFullscreen ? 'auto minmax(0, 1fr)' : 'auto',
            gap: 1,
            alignItems: isSummaryAiDrawerOpen ? 'stretch' : 'start',
            position: isCalendarFullscreen ? 'fixed' : 'relative',
            inset: isCalendarFullscreen ? 0 : 'auto',
            zIndex: isCalendarFullscreen ? 1400 : 'auto',
            height: isCalendarFullscreen ? '100vh' : 'auto',
            p: isCalendarFullscreen ? 1.25 : 0,
            borderRadius: isCalendarFullscreen ? 0 : 0,
            bgcolor: isCalendarFullscreen ? 'rgba(248,250,252,0.98)' : 'transparent',
            boxShadow: isCalendarFullscreen ? '0 20px 60px rgba(15,23,42,0.24)' : 'none',
            overflow: isCalendarFullscreen ? 'hidden' : 'visible',
          }}
        >
          {isCalendarFullscreen ? (
            <Button
              variant="contained"
              size="small"
              startIcon={<CloseFullscreenIcon />}
              onClick={() => setIsCalendarFullscreen(false)}
              sx={{
                gridColumn: '1 / -1',
                justifySelf: 'end',
                position: 'relative',
                zIndex: 1501,
                borderRadius: 999,
                fontWeight: 900,
                textTransform: 'none',
                minHeight: 32,
                boxShadow: '0 8px 18px rgba(37,99,235,0.22)',
              }}
            >
              Exit Full Screen
            </Button>
          ) : null}
          <Box sx={{ minWidth: 0, minHeight: 0, height: isCalendarFullscreen ? '100%' : 'auto', overflow: isCalendarFullscreen ? 'hidden' : 'visible', display: isCalendarFullscreen ? 'flex' : 'block', flexDirection: 'column' }}>
            {selectedMoveWorker ? (
          <Paper elevation={0} sx={{ mb: 0.8, px: 1, py: 0.65, borderRadius: 2, border: '1px solid #BFDBFE', bgcolor: '#F8FBFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: '#1D4ED8', fontWeight: 800, fontSize: '0.75rem' }}>
              Moving {selectedMoveWorker.name} ({selectedMoveWorker.role}). Drop into another line/day cell.
            </Typography>
            <Button size="small" variant="outlined" onClick={() => setMoveSelection(null)} sx={{ borderRadius: 999, fontWeight: 800, minHeight: 28, fontSize: '0.68rem' }}>
              Cancel move
            </Button>
          </Paper>
        ) : null}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.55, flexWrap: 'wrap', gap: 0.7, flexShrink: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <IconButton size="small" sx={lightHeaderIconButtonSx} onClick={() => shiftSelectedPeriod(-1)}><ChevronLeftIcon fontSize="small" /></IconButton>
            <Typography variant="subtitle1" sx={{ color: activeTheme.primary, fontWeight: 800, fontSize: '0.92rem' }}>{periodLabel}</Typography>
            <IconButton size="small" sx={lightHeaderIconButtonSx} onClick={() => shiftSelectedPeriod(1)}><ChevronRightIcon fontSize="small" /></IconButton>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, fontSize: '0.64rem', textTransform: 'uppercase' }}>
                Detail level
              </Typography>
              <ToggleButtonGroup
                exclusive
                size="small"
                value={summaryMatrixDetailLevel}
                onChange={(_, nextLevel: 'compact' | 'detailed' | null) => {
                  if (nextLevel) setSummaryMatrixDetailLevel(nextLevel);
                }}
                sx={{
                  '& .MuiToggleButton-root': {
                    minHeight: 26,
                    px: 0.9,
                    py: 0.15,
                    borderColor: '#CBD5E1',
                    color: '#475569',
                    fontSize: '0.64rem',
                    fontWeight: 900,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      bgcolor: '#DBEAFE',
                      color: '#1D4ED8',
                    },
                  },
                }}
              >
                <ToggleButton value="compact">Compact</ToggleButton>
                <ToggleButton value="detailed">Detailed</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={(event) => setSummaryLegendAnchorEl(event.currentTarget)}
              sx={{
                minHeight: 28,
                px: 1.1,
                borderRadius: 999,
                borderColor: '#CBD5E1',
                color: '#334155',
                fontSize: '0.68rem',
                fontWeight: 900,
                textTransform: 'none',
              }}
            >
              Legend
            </Button>
            <Popover
              open={Boolean(summaryLegendAnchorEl)}
              anchorEl={summaryLegendAnchorEl}
              onClose={() => setSummaryLegendAnchorEl(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{
                sx: {
                  mt: 0.8,
                  width: 310,
                  p: 1.2,
                  borderRadius: 2,
                  border: '1px solid #CBD5E1',
                  boxShadow: '0 16px 36px rgba(15,23,42,0.14)',
                },
              }}
            >
              <Box sx={{ display: 'grid', gap: 1.05 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 950, textTransform: 'uppercase', fontSize: '0.62rem' }}>
                    Coverage
                  </Typography>
                  <Box sx={{ mt: 0.55, display: 'grid', gap: 0.55 }}>
                    {coverageLegend.map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.bg, border: `1px solid ${item.border}`, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#334155', fontWeight: 800, fontSize: '0.72rem' }}>
                          {item.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ pt: 0.8, borderTop: '1px solid #E2E8F0' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 950, textTransform: 'uppercase', fontSize: '0.62rem' }}>
                    Events
                  </Typography>
                  <Box sx={{ mt: 0.55, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.55 }}>
                    {Object.values(shiftScheduleEventStyles).map((item) => (
                      <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0 }}>
                        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: item.color, flexShrink: 0 }} />
                        <Typography variant="caption" sx={{ color: '#334155', fontWeight: 800, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
                          {item.label}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Popover>
          </Box>
        </Box>

        {isDetailedProductionView ? (
        <Box
          sx={
            isCalendarFullscreen
              ? {
                  flex: 1,
                  minHeight: 0,
                  overflow: 'auto',
                }
              : { overflowX: 'auto' }
          }
        >
          <Paper elevation={0} sx={{ borderRadius: 2.4, border: '1px solid #CFE0F8', overflow: 'hidden', minWidth: Math.max(980, 138 + shiftScheduleWeekDays.length * summaryShiftViews.length * (summaryMatrixDetailLevel === 'detailed' ? 190 : 86)) }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: summaryCoverageGridTemplate, borderBottom: '1px solid #CFE0F8' }}>
              <Box sx={{ gridRow: '1 / span 2', borderRight: '1px solid #CFE0F8', bgcolor: '#FAFCFF', minHeight: 72, px: 0.85, display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.64rem' }}>
                  Lines
                </Typography>
              </Box>
              {shiftScheduleWeekDays.map((day) => (
                <Box
                  key={`summary-day-${day.key}`}
                  sx={{
                    gridColumn: `span ${summaryShiftViews.length}`,
                    p: 0.55,
                    minHeight: 38,
                    borderRight: '1px solid #CFE0F8',
                    bgcolor: '#FAFCFF',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#334155', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', lineHeight: 1 }}>
                    {day.day} {day.date}
                  </Typography>
                </Box>
              ))}
              {shiftScheduleWeekDays.flatMap((day) => summaryShiftViews.map((shift) => (
                <Box
                  key={`summary-shift-${day.key}-${shift.id}`}
                  sx={{
                    py: 0.45,
                    px: 0.35,
                    minHeight: 34,
                    borderRight: '1px solid #CFE0F8',
                    borderTop: '1px solid #E2E8F0',
                    bgcolor: '#FFFFFF',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, fontSize: '0.68rem', lineHeight: 1 }}>
                    {getShiftAbbreviation(shift)}
                  </Typography>
                </Box>
              )))}
            </Box>

            {summaryCoverageRows.map((lineRow, lineIndex) => (
              <Box key={`summary-coverage-${lineRow.id}`} sx={{ display: 'grid', gridTemplateColumns: summaryCoverageGridTemplate, borderBottom: lineIndex === summaryCoverageRows.length - 1 ? 'none' : '1px solid #CFE0F8' }}>
                <Box
                  sx={{
                    p: 0.8,
                    borderRight: '1px solid #CFE0F8',
                    bgcolor: lineVisuals[lineRow.id].soft,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 0.24,
                    minHeight: 76,
                    borderLeft: `5px solid ${lineVisuals[lineRow.id].accent}`,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: activeTheme.primary, fontWeight: 900, lineHeight: 1.05, fontSize: '0.84rem' }}>
                    {lineRow.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: lineVisuals[lineRow.id].accent, fontWeight: 800, fontSize: '0.58rem', letterSpacing: '0.02em' }}>
                    {lineProductNames[lineRow.id]}
                  </Typography>
                </Box>
                {lineRow.cells.map((cell) => {
                  const aiCellPreview = getSummaryCellAiPreview(cell);
                  const coverageState = getCoverageState(aiCellPreview.available, cell.target);
                  const coverageValue = cell.target > 0 ? `${aiCellPreview.available}/${cell.target}` : 'N/A';
                  const aiCellDecision = aiCellPreview.decision;
                  const isAiPendingCell = aiCellDecision === 'pending';
                  const cellSelectionKey = `${cell.line}-${cell.day.key}-${cell.shiftId}`;
                  const isSelectedCell = selectedSummaryCoverageCell?.key === cellSelectionKey;
                  const assignedPeople = cell.filledPositions
                    .map((slot) => slot.assignedPerson)
                    .filter(Boolean)
                    .slice(0, 6)
                    .map((person) => ({ name: person?.name ?? 'Unknown worker', role: person?.role ?? 'Assigned role' }));
                  const previewAssignedPeople = aiCellPreview.decision === 'accepted' && aiCellPreview.improvement > 0 && aiCellPreview.previewPerson
                    ? [...assignedPeople, { name: aiCellPreview.previewPerson, role: 'Operator' }]
                    : assignedPeople;
                  const missingPositions = cell.missingPositions.slice(aiCellPreview.improvement).map((slot) => slot.slotLabel).slice(0, 6);
                  const missingPositionsPreview = missingPositions.slice(0, 3);
                  const assignedPeoplePreview = previewAssignedPeople.slice(0, summaryMatrixDetailLevel === 'detailed' ? 3 : 0);
                  const assignedMoreCount = Math.max(previewAssignedPeople.length - assignedPeoplePreview.length, 0);
                  const missingMoreCount = Math.max(cell.missingPositions.length - aiCellPreview.improvement - missingPositionsPreview.length, 0);
                  const openCoverageDetail = () => {
                    const notes = [
                      aiCellPreview.available < cell.target ? 'Coverage below target' : 'Coverage meets required target',
                      missingPositions.some((position) => position.toLowerCase().includes('operator')) ? 'Operator coverage below target' : '',
                      aiCellPreview.available < Math.max(2, Math.floor(cell.target / 2)) ? 'Certification coverage incomplete' : '',
                    ].filter(Boolean);

                    setSelectedSummaryCoverageCell({
                      key: cellSelectionKey,
                      lineId: cell.line,
                      dayKey: cell.day.key,
                      shiftBase: cell.shiftBase,
                      line: `Line ${cell.line}`,
                      dateLabel: `${cell.day.day} ${cell.day.date}`,
                      shiftLabel: cell.shiftLabel,
                      coverageValue,
                      statusLabel: coverageState.label,
                      statusTone: coverageState.tone,
                      statusBg: coverageState.bg,
                      statusBorder: coverageState.border,
                      assignedPeople: previewAssignedPeople,
                      missingPositions,
                      notes,
                    });
                    setIsSummaryCoverageDetailOpen(true);
                  };
                  return (
                    <Tooltip
                      key={`${cell.line}-${cell.day.key}-${cell.shiftId}`}
                      title={`${cell.line} · ${cell.day.day} ${cell.day.date} · ${cell.shiftLabel} · ${coverageValue} · View people and missing positions`}
                      arrow
                      placement="top"
                    >
                      <Box
                        onClick={openCoverageDetail}
                        sx={{
                          p: summaryMatrixDetailLevel === 'detailed' ? 0.75 : 0.55,
                          minHeight: summaryMatrixDetailLevel === 'detailed' ? 154 : 76,
                          borderRight: '1px solid #CFE0F8',
                          bgcolor: isAiPendingCell ? '#FFF7ED' : coverageState.bg,
                          borderTop: isSelectedCell ? '3px solid #2563EB' : isAiPendingCell ? '2px solid #F97316' : `2px solid ${coverageState.border}`,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: summaryMatrixDetailLevel === 'detailed' ? 'flex-start' : 'center',
                          alignItems: summaryMatrixDetailLevel === 'detailed' ? 'stretch' : 'center',
                          gap: summaryMatrixDetailLevel === 'detailed' ? 0.55 : 0.25,
                          cursor: 'pointer',
                          position: 'relative',
                          transition: 'box-shadow 0.18s ease, transform 0.18s ease',
                          boxShadow: isSelectedCell
                            ? 'inset 0 0 0 2px #2563EB, 0 8px 18px rgba(37,99,235,0.18)'
                            : 'none',
                          '&:hover': {
                            boxShadow: `inset 0 0 0 2px ${isSelectedCell ? '#2563EB' : isAiPendingCell ? '#F97316' : coverageState.border}`,
                            transform: 'translateY(-1px)',
                          },
                        }}
                      >
                        {isSelectedCell ? (
                          <Box sx={{ position: 'absolute', top: 4, left: 4, width: 7, height: 7, borderRadius: '50%', bgcolor: '#2563EB' }} />
                        ) : null}
                        {isAiPendingCell ? (
                          <Box sx={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', bgcolor: '#F97316' }} />
                        ) : null}
                        <Typography sx={{ color: coverageState.tone, fontWeight: 950, fontSize: '0.92rem', lineHeight: 1 }}>
                          {coverageValue}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 900, fontSize: '0.56rem', lineHeight: 1, textTransform: 'uppercase' }}>
                          {cell.shiftAbbreviation} · {coverageState.label}
                        </Typography>
                        {summaryMatrixDetailLevel === 'detailed' ? (
                          <>
                            <Chip
                              size="small"
                              label={coverageState.label}
                              sx={{
                                alignSelf: 'flex-start',
                                height: 20,
                                mt: 0.1,
                                bgcolor: '#FFFFFF',
                                color: coverageState.tone,
                                border: `1px solid ${coverageState.border}`,
                                fontWeight: 900,
                                '& .MuiChip-label': { px: 0.55, fontSize: '0.56rem' },
                              }}
                            />
                            <Box sx={{ width: '100%' }}>
                              <Typography variant="caption" sx={{ color: '#334155', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.54rem', display: 'block', mb: 0.28 }}>
                                Assigned
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                {assignedPeoplePreview.length ? assignedPeoplePreview.map((person) => (
                                  <Typography key={`${cellSelectionKey}-${person.name}`} variant="caption" sx={{ color: '#166534', fontWeight: 800, fontSize: '0.58rem', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {person.name} - {person.role}
                                  </Typography>
                                )) : (
                                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, fontSize: '0.58rem' }}>
                                    None assigned
                                  </Typography>
                                )}
                                {assignedMoreCount > 0 ? (
                                  <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 900, fontSize: '0.56rem' }}>
                                    +{assignedMoreCount} more
                                  </Typography>
                                ) : null}
                              </Box>
                            </Box>
                            <Box sx={{ width: '100%' }}>
                              <Typography variant="caption" sx={{ color: '#334155', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.54rem', display: 'block', mb: 0.28 }}>
                                Missing
                              </Typography>
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                                {missingPositionsPreview.length ? missingPositionsPreview.map((position) => (
                                  <Typography key={`${cellSelectionKey}-${position}`} variant="caption" sx={{ color: '#9A3412', fontWeight: 850, fontSize: '0.58rem', lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {position}
                                  </Typography>
                                )) : (
                                  <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 900, fontSize: '0.58rem' }}>
                                    None
                                  </Typography>
                                )}
                                {missingMoreCount > 0 ? (
                                  <Typography variant="caption" sx={{ color: '#C2410C', fontWeight: 900, fontSize: '0.56rem' }}>
                                    +{missingMoreCount} more
                                  </Typography>
                                ) : null}
                              </Box>
                            </Box>
                          </>
                        ) : null}
                      </Box>
                    </Tooltip>
                  );
                })}
              </Box>
            ))}
          </Paper>

          <Paper elevation={0} sx={{ display: 'none', borderRadius: 2.4, border: '1px solid #CFE0F8', overflow: 'hidden', minWidth: 1430 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '138px repeat(7, minmax(168px, 1fr))', borderBottom: '1px solid #CFE0F8' }}>
              <Box sx={{ borderRight: '1px solid #CFE0F8', bgcolor: '#FAFCFF', minHeight: 50, px: 0.85, display: 'flex', alignItems: 'center' }}>
                <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.64rem' }}>
                  Lines
                </Typography>
              </Box>
              {visibleDayCells.map((day) => (
                <Box
                  key={day.isoDate}
                  sx={{
                    p: 0.8,
                    minHeight: 50,
                    borderRight: '1px solid #CFE0F8',
                    bgcolor: '#FAFCFF',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#334155', lineHeight: 1.05, textTransform: 'uppercase', fontSize: '0.62rem' }}>{day.day}</Typography>
                  <Typography variant="h5" sx={{ color: activeTheme.primary, fontWeight: 900, lineHeight: 1, mt: 0.1, fontSize: '0.94rem' }}>{day.date}</Typography>
                </Box>
              ))}
            </Box>

            {lineRows.map((lineRow, lineIndex) => (
              <Box key={lineRow.id} sx={{ display: 'grid', gridTemplateColumns: `138px repeat(${visibleDayCells.length}, minmax(168px, 1fr))`, borderBottom: lineIndex === lineRows.length - 1 ? 'none' : '1px solid #CFE0F8' }}>
                <Box
                  sx={{
                    p: 0.8,
                    borderRight: '1px solid #CFE0F8',
                    bgcolor: lineVisuals[lineRow.id].soft,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: 0.24,
                    minHeight: 214,
                    borderLeft: `5px solid ${lineVisuals[lineRow.id].accent}`,
                  }}
                >
                  <Typography variant="subtitle1" sx={{ color: activeTheme.primary, fontWeight: 900, lineHeight: 1.05, fontSize: '0.84rem' }}>
                    {lineRow.label}
                  </Typography>
                  <Typography variant="caption" sx={{ color: lineVisuals[lineRow.id].accent, fontWeight: 800, fontSize: '0.58rem', letterSpacing: '0.02em' }}>
                    {lineProductNames[lineRow.id]}
                  </Typography>
                </Box>

                {lineRow.cells.map((cell) => {
                  const coverageState = getCoverageState(cell.available, cell.target);
                  const coverageValue = cell.target > 0 ? `${cell.available}/${cell.target}` : 'N/A';
                  const isAffectedCell = affectedSummaryCellKeys.has(`${cell.line}-${cell.day.key}`);
                  return (
                    <Box
                      key={`${lineRow.id}-${cell.day.key}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const payload = event.dataTransfer.getData('text/plain');
                        if (!payload) return;
                        const parsed = JSON.parse(payload) as MoveSelection;
                        moveWorker(cell.day.key, cell.line, parsed.workerId, parsed.fromDay);
                      }}
                      sx={{
                        p: 0.48,
                        borderRight: '1px solid #CFE0F8',
                        minHeight: 214,
                        bgcolor: isAffectedCell ? '#FFF7ED' : moveSelection ? '#FCFEFF' : '#FFFFFF',
                        position: 'relative',
                        outline: isAffectedCell ? '2px solid #F97316' : 'none',
                        outlineOffset: -2,
                        boxShadow: isAffectedCell ? 'inset 0 0 0 999px rgba(255,247,237,0.42)' : 'none',
                      }}
                    >
                      {isAffectedCell ? (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 5,
                            right: 5,
                            zIndex: 2,
                            px: 0.46,
                            py: 0.12,
                            borderRadius: 99,
                            bgcolor: '#FFEDD5',
                            color: '#C2410C',
                            border: '1px solid #FDBA74',
                            fontSize: '0.52rem',
                            fontWeight: 900,
                            lineHeight: 1.3,
                          }}
                        >
                          Affected
                        </Box>
                      ) : null}
                      <Tooltip title="View people and missing positions" arrow placement="top">
                        <Box
                          sx={{
                            mb: 0.45,
                            px: 0.52,
                            py: 0.34,
                            borderRadius: 1.2,
                            border: `1px solid ${isAffectedCell ? '#F97316' : coverageState.border}`,
                            bgcolor: coverageState.bg,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: 'help',
                            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                            '&:hover': {
                              boxShadow: `0 0 0 2px ${coverageState.border}`,
                            },
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="caption" sx={{ color: coverageState.tone, fontWeight: 900, fontSize: '0.72rem', lineHeight: 1 }}>
                              {coverageValue}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700, fontSize: '0.58rem', display: 'block', lineHeight: 1.05 }}>
                              assigned / required
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: coverageState.tone, fontWeight: 900, fontSize: '0.64rem', whiteSpace: 'nowrap' }}>
                            {coverageState.label}
                          </Typography>
                        </Box>
                      </Tooltip>

                      {cell.plannedStops.length ? (
                        <Box sx={{ mb: 0.42, px: 0.5, py: 0.32, borderRadius: 1.2, bgcolor: '#FEF2F2', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: 0.28 }}>
                          <WarningIcon sx={{ fontSize: 12 }} />
                          <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.57rem' }}>
                            Planned stop: {cell.plannedStops[0]?.title}{cell.plannedStops.length > 1 ? ` + ${cell.plannedStops.length - 1} more` : ''}
                          </Typography>
                        </Box>
                      ) : null}

                      {cell.useCompactSummary ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.42 }}>
                          {cell.roleGroups.map((group) => (
                            <Paper
                              key={`${cell.line}-${cell.day.isoDate}-${group.role}`}
                              elevation={0}
                              sx={{ px: 0.62, py: 0.52, borderRadius: 1.35, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}
                            >
                              <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 900, fontSize: '0.61rem' }}>
                                {group.role}: {group.previewNames.join(', ')}{group.remainingCount ? ` + ${group.remainingCount} more` : ''}
                              </Typography>
                            </Paper>
                          ))}
                          {cell.missingPositions.length ? (
                            <Paper elevation={0} sx={{ px: 0.62, py: 0.52, borderRadius: 1.35, border: '1px dashed #FDBA74', bgcolor: '#FFF7ED' }}>
                              <Typography variant="caption" sx={{ color: '#9A3412', fontWeight: 900, display: 'block', mb: 0.18 }}>
                                Missing:
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#C2410C', fontWeight: 800, fontSize: '0.58rem' }}>
                                {cell.missingPositions.slice(0, 4).map((slot) => slot.slotLabel).join(', ')}
                                {cell.missingPositions.length > 4 ? ` + ${cell.missingPositions.length - 4} more` : ''}
                              </Typography>
                            </Paper>
                          ) : (
                            <Box sx={{ px: 0.5, py: 0.32, borderRadius: 1.2, bgcolor: '#F0FDF4', color: '#15803D', display: 'flex', alignItems: 'center', gap: 0.28 }}>
                              <CheckCircleIcon sx={{ fontSize: 12 }} />
                              <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.57rem' }}>All required positions covered</Typography>
                            </Box>
                          )}
                        </Box>
                      ) : (
                      <>
                      <Box sx={{ display: 'flex', gap: 0.32, flexWrap: 'wrap', mb: 0.45 }}>
                        {cell.coverageSlots.map((slot) => {
                          const covered = Boolean(slot.assignedPerson);
                          return (
                            <Box
                              key={`${cell.line}-${cell.day.key}-${slot.slotLabel}`}
                              title={covered ? `${slot.slotLabel}: ${slot.assignedPerson?.name}` : `${slot.slotLabel}: Needs assignment`}
                              sx={{
                                px: 0.42,
                                py: 0.18,
                                borderRadius: 99,
                                border: covered ? '1px solid #BBF7D0' : '1px dashed #FDBA74',
                                bgcolor: covered ? '#F0FDF4' : '#FFF7ED',
                                color: covered ? '#15803D' : '#C2410C',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.22,
                                fontSize: '0.52rem',
                                fontWeight: 900,
                                lineHeight: 1.15,
                                maxWidth: '100%',
                              }}
                            >
                              {covered ? <CheckCircleIcon sx={{ fontSize: 9 }} /> : <WarningIcon sx={{ fontSize: 9 }} />}
                              <Box component="span" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {slot.slotLabel.replace('Technical Operator', 'Tech Op').replace('Material Handler', 'Material')}
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>

                      {!cell.missingPositions.length ? (
                        <Box sx={{ mb: 0.48, px: 0.5, py: 0.32, borderRadius: 1.2, bgcolor: '#F0FDF4', color: '#15803D', display: 'flex', alignItems: 'center', gap: 0.28 }}>
                          <CheckCircleIcon sx={{ fontSize: 12 }} />
                          <Typography variant="caption" sx={{ fontWeight: 900, fontSize: '0.57rem' }}>All required positions covered</Typography>
                        </Box>
                      ) : null}

                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.38 }}>
                        {cell.missingPositions.map((slot) => (
                          <Paper
                            key={`${cell.line}-${cell.day.key}-empty-${slot.slotLabel}`}
                            elevation={0}
                            sx={{
                              px: 0.55,
                              py: 0.5,
                              minHeight: 54,
                              borderRadius: 1.35,
                              border: '1px dashed #FDBA74',
                              borderTop: '2px solid #F97316',
                              bgcolor: '#FFF7ED',
                              position: 'relative',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                boxShadow: '0 8px 18px rgba(249,115,22,0.18)',
                                transform: 'translateY(-1px)',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.35 }}>
                              <Typography variant="caption" sx={{ color: '#7C2D12', fontWeight: 900, lineHeight: 1.1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.63rem', minWidth: 0 }}>
                                {slot.slotLabel}
                              </Typography>
                              <WarningIcon sx={{ fontSize: 12, color: '#EA580C', flexShrink: 0, mt: 0.05 }} />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#C2410C', mt: 0.28, display: 'block', fontSize: '0.58rem', lineHeight: 1.05, fontWeight: 900 }}>
                              Empty
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#9A3412', mt: 0.16, display: 'block', fontSize: '0.54rem', lineHeight: 1.05, fontWeight: 800 }}>
                              Needs assignment
                            </Typography>
                          </Paper>
                        ))}

                        {cell.visibleEntries.map((person) => {
                          const eventStyle = person.status ? shiftScheduleEventStyles[person.status] : null;
                          const selectedForMove = moveSelection?.workerId === person.id && moveSelection.fromDay === cell.day.key;
                          return (
                            <Paper
                              key={`${cell.line}-${cell.day.key}-${person.id}`}
                              elevation={0}
                              draggable
                              onClick={() => setSelectedShiftMember({
                                workerId: person.id,
                                name: person.name,
                                status: person.status,
                                shiftId: selectedShiftId,
                                shiftLabel: shiftDisplayLabels[selectedShiftId],
                                shiftHours: activeShiftHours,
                                dayLabel: `${cell.day.day} ${cell.day.date}`,
                                teamLabel: `Line ${person.line}`,
                              } as any)}
                              onDragStart={(event) => {
                                event.dataTransfer.setData('text/plain', JSON.stringify({ workerId: person.id, fromDay: cell.day.key }));
                                setMoveSelection({ workerId: person.id, fromDay: cell.day.key });
                              }}
                              sx={{
                                px: 0.55,
                                py: 0.5,
                                minHeight: 54,
                                borderRadius: 1.35,
                                border: `1px solid ${selectedForMove ? '#2563EB' : '#E2E8F0'}`,
                                borderTop: `2px solid ${selectedForMove ? '#2563EB' : eventStyle ? eventStyle.color : '#D9E4F5'}`,
                                bgcolor: selectedForMove ? '#EFF6FF' : eventStyle ? `${eventStyle.color}10` : '#F8FAFC',
                                cursor: 'grab',
                                position: 'relative',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                  boxShadow: '0 6px 16px rgba(15,23,42,0.10)',
                                  transform: 'translateY(-1px)',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.35 }}>
                                <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 800, lineHeight: 1.1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.63rem', minWidth: 0 }}>
                                  {person.name}
                                </Typography>
                                {person.aiSignal ? <SparkleIcon sx={{ fontSize: 11, color: '#FF6E00', flexShrink: 0, mt: 0.1 }} /> : null}
                              </Box>
                              <Typography variant="caption" sx={{ color: '#5B6B80', mt: 0.28, display: 'block', fontSize: '0.58rem', lineHeight: 1.05, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {person.role}
                              </Typography>
                            </Paper>
                          );
                        })}

                        {cell.visibleEntries.length === 0 && cell.missingPositions.length === 0 ? (
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontStyle: 'italic', mt: 0.35, fontSize: '0.61rem', gridColumn: '1 / -1' }}>
                            No one assigned for the active filters
                          </Typography>
                        ) : null}
                      </Box>
                      </>
                      )}

                      {cell.hasInsight && !resolvedShiftInsights[cell.insightKey] ? (
                        <IconButton
                          size="small"
                          onClick={() => setOpenShiftAiInsightKey((prev) => (prev === cell.insightKey ? null : cell.insightKey))}
                          sx={{
                            position: 'absolute',
                            right: 6,
                            bottom: 5,
                            width: 22,
                            height: 22,
                            bgcolor: '#FFF7ED',
                            border: '1px solid #FED7AA',
                            color: '#FF6E00',
                            '&:hover': { bgcolor: '#FFEDD5' },
                          }}
                        >
                          <SparkleIcon sx={{ fontSize: 13 }} />
                        </IconButton>
                      ) : null}

                      {cell.insight && openShiftAiInsightKey === cell.insightKey ? (
                        <Paper
                          elevation={4}
                          sx={{
                            position: 'absolute',
                            top: 64,
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: 290,
                            zIndex: 20,
                            p: 1.2,
                            borderRadius: 2,
                            border: '1px solid #DBDDDF',
                            boxShadow: '0 16px 34px rgba(15,23,42,0.20)',
                          }}
                        >
                          <Typography variant="subtitle2" sx={{ color: '#1F2937', fontWeight: 800 }}>
                            <SparkleIcon sx={{ fontSize: 14, mr: 0.45, verticalAlign: '-2px', color: '#FF6E00' }} />
                            {cell.insight.title}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#475569', mt: 0.8, mb: 1 }}>
                            {cell.insight.detail}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 700, display: 'block', mb: 0.45 }}>
                            Recommended replacements
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45 }}>
                            {cell.insight.candidates.map((candidateName) => (
                              <Paper key={`${cell.insightKey}-${candidateName}`} elevation={0} sx={{ px: 0.6, py: 0.45, borderRadius: 99, border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.6 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0 }}>
                                  <Avatar
                                    src={getShiftMemberAvatar(candidateName).src}
                                    alt={candidateName}
                                    sx={{ width: 18, height: 18, fontSize: 9, bgcolor: getShiftMemberAvatar(candidateName).accent, color: '#1F2937', border: '1px solid rgba(148,163,184,0.35)' }}
                                  >
                                    {getInitials(candidateName)}
                                  </Avatar>
                                  <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {candidateName}
                                  </Typography>
                                </Box>
                                <Button
                                  size="small"
                                  variant="text"
                                  sx={{ minWidth: 56, px: 0.5, py: 0.1, fontWeight: 800, fontSize: '0.68rem' }}
                                  onClick={() => {
                                    const targetWorker = cell.rawEntries.find((person) => person.status === 'absence' || person.aiSignal) ?? cell.rawEntries[cell.rawEntries.length - 1];
                                    const candidateWorker = workerDirectoryByName.get(candidateName);
                                    if (!targetWorker || !candidateWorker) return;

                                    setAssignmentsByShift((prev) => ({
                                      ...prev,
                                      [selectedShiftId]: {
                                        ...prev[selectedShiftId],
                                        [cell.day.key]: prev[selectedShiftId][cell.day.key].map((assignment) => (
                                          assignment.workerId === targetWorker.id
                                            ? {
                                                workerId: candidateWorker.id,
                                                line: targetWorker.line,
                                              }
                                            : assignment
                                        )),
                                      },
                                    }));
                                    setResolvedShiftInsights((prev) => ({ ...prev, [cell.insightKey]: true }));
                                    setOpenShiftAiInsightKey(null);
                                  }}
                                >
                                  Replace
                                </Button>
                              </Paper>
                            ))}
                          </Box>
                          <Typography variant="caption" sx={{ display: 'block', mt: 0.8, textAlign: 'right', color: '#94A3B8' }}>
                            powered by BLU.AI
                          </Typography>
                        </Paper>
                      ) : null}
                    </Box>
                  );
                })}
              </Box>
            ))}
          </Paper>
        </Box>
        ) : (
          <Grid container spacing={0.8}>
            {aggregatePeriodLineRows.map((lineRow) => (
              <Grid key={lineRow.id} size={{ xs: 12 }}>
                <Paper elevation={0} sx={{ borderRadius: 2.2, border: '1px solid #D9E4F5', overflow: 'hidden', bgcolor: '#FFFFFF' }}>
                  <Box sx={{ px: 1.05, py: 0.9, borderBottom: '1px solid #E2E8F0', bgcolor: lineVisuals[lineRow.id].soft, borderLeft: `5px solid ${lineVisuals[lineRow.id].accent}` }}>
                    <Typography variant="subtitle1" sx={{ color: '#0F172A', fontWeight: 900, fontSize: '0.88rem' }}>{lineRow.label}</Typography>
                    <Typography variant="caption" sx={{ color: lineVisuals[lineRow.id].accent, fontWeight: 800 }}>
                      {lineRow.product} • target staffing {lineRow.target}
                    </Typography>
                  </Box>
                  <Box sx={{ p: 0.8, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: `repeat(${Math.min(lineRow.buckets.length, selectedCalendarView === 'Month' ? 4 : 6)}, minmax(0, 1fr))` }, gap: 0.7 }}>
                    {lineRow.buckets.map((bucket) => (
                      <Paper key={`${lineRow.id}-${bucket.label}`} elevation={0} sx={{ p: 0.82, borderRadius: 1.8, border: '1px solid #E2E8F0', bgcolor: '#FBFDFF' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.8, alignItems: 'flex-start', mb: 0.55 }}>
                          <Box>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.58rem' }}>{bucket.subtitle}</Typography>
                            <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 900 }}>{bucket.label}</Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={bucket.gapCount ? `${bucket.gapCount} gaps` : 'Covered'}
                            sx={{
                              bgcolor: bucket.gapCount ? '#FFF7ED' : '#ECFDF3',
                              color: bucket.gapCount ? '#C2410C' : '#15803D',
                              border: bucket.gapCount ? '1px solid #FED7AA' : '1px solid #BBF7D0',
                              fontWeight: 900,
                            }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 900 }}>{bucket.filledText}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.65 }}>{bucket.filledAverageText}</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.42 }}>
                          {bucket.plannedStopCount ? (
                            <Box sx={{ px: 0.7, py: 0.55, borderRadius: 1.4, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                              <Typography variant="caption" sx={{ color: '#991B1B', fontWeight: 900, display: 'block', mb: 0.18 }}>
                                Planned stop
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#B91C1C', fontWeight: 800 }}>
                                {bucket.plannedStopPreview.join(', ')}
                              </Typography>
                            </Box>
                          ) : null}
                          {bucket.roleGroups.map((group) => (
                            <Box key={`${lineRow.id}-${bucket.label}-${group.role}`} sx={{ px: 0.7, py: 0.55, borderRadius: 1.4, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                              <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 900 }}>
                                {group.role}: {group.previewNames.join(', ')}{group.remainingCount ? ` + ${group.remainingCount} more` : ''}
                              </Typography>
                            </Box>
                          ))}
                          {bucket.gapPreview.length ? (
                            <Box sx={{ px: 0.7, py: 0.55, borderRadius: 1.4, bgcolor: '#FFF7ED', border: '1px dashed #FDBA74' }}>
                              <Typography variant="caption" sx={{ color: '#9A3412', fontWeight: 900, display: 'block', mb: 0.2 }}>
                                Missing:
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#C2410C', fontWeight: 800 }}>
                                {bucket.gapPreview.join(', ')}{bucket.hiddenGapCount ? ` + ${bucket.hiddenGapCount} more` : ''}
                              </Typography>
                            </Box>
                          ) : null}
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
          </Box>
          {isSummaryAiDrawerOpen ? (
          <Paper
            elevation={0}
            sx={{
              p: 1.25,
              borderRadius: 2.4,
              border: '1px solid #BFDBFE',
              bgcolor: '#F8FBFF',
              minWidth: 0,
              alignSelf: 'stretch',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: { md: isCalendarFullscreen ? '100%' : 640 },
              position: 'relative',
              top: 0,
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.9 }}>
              <Box>
                <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.62rem' }}>
                  Summary optimization
                </Typography>
                <Typography variant="subtitle1" sx={{ color: '#0F172A', fontWeight: 900, lineHeight: 1.1 }}>
                  AI Schedule Optimization
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
                <Chip
                  size="small"
                  label={selectedAiRecommendationStatusLabel}
                  sx={{ height: 22, ...selectedAiRecommendationStatusSx, fontWeight: 900, '& .MuiChip-label': { px: 0.7, fontSize: '0.62rem' } }}
                />
                <Button size="small" variant="text" onClick={() => setIsSummaryAiDrawerOpen(false)} sx={{ minWidth: 0, px: 0.5, color: '#64748B', fontWeight: 900 }}>
                  Close
                </Button>
              </Box>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', pr: 0.15 }}>
            <Paper elevation={0} sx={{ p: 0.8, borderRadius: 1.6, border: '1px solid #DBEAFE', bgcolor: '#FFFFFF', mb: 0.85 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem' }}>
                Scope from current Summary context
              </Typography>
              <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 800, mt: 0.35, lineHeight: 1.25 }}>
                {selectedDepartment} - {selectedLineArea} - {selectedSummaryShiftId === 'all' ? 'All Shifts' : shiftDisplayLabels[selectedSummaryShiftId] ?? selectedSummaryShiftId} - {selectedCalendarView} from {selectedSummaryDate}
              </Typography>
            </Paper>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.6, mb: 0.8 }}>
              <Typography variant="caption" sx={{ color: '#334155', fontWeight: 900 }}>
                Recommendation &larr; {selectedAiRecommendationIndex + 1} of {aiScheduleRecommendations.length} &rarr;
              </Typography>
              <Box sx={{ display: 'flex', gap: 0.35 }}>
                <IconButton
                  size="small"
                  aria-label="Previous recommendation"
                  onClick={() => handleAiRecommendationNavigation('previous')}
                  sx={{ ...lightHeaderIconButtonSx, width: 26, height: 26 }}
                >
                  <ChevronLeftIcon sx={{ fontSize: 15 }} />
                </IconButton>
                <IconButton
                  size="small"
                  aria-label="Next recommendation"
                  onClick={() => handleAiRecommendationNavigation('next')}
                  sx={{ ...lightHeaderIconButtonSx, width: 26, height: 26 }}
                >
                  <ChevronRightIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 900, lineHeight: 1.15, mb: 0.55 }}>
              {selectedAiRecommendation.title}
            </Typography>
            <Typography variant="caption" sx={{ color: '#C2410C', fontWeight: 800, display: 'block', mb: 1, lineHeight: 1.3 }}>
              Highlights show affected schedule areas only. No changes are applied until a draft is created and confirmed.
            </Typography>
            {aiDecisionFlash ? (
              <Paper
                elevation={0}
                sx={{
                  p: 0.7,
                  borderRadius: 1.5,
                  border: `1px solid ${aiDecisionFlash.decision === 'accepted' ? '#BBF7D0' : '#FECACA'}`,
                  bgcolor: aiDecisionFlash.decision === 'accepted' ? '#ECFDF3' : '#FEF2F2',
                  mb: 0.9,
                }}
              >
                <Typography variant="caption" sx={{ color: aiDecisionFlash.decision === 'accepted' ? '#15803D' : '#B91C1C', fontWeight: 900, lineHeight: 1.3 }}>
                  {aiDecisionFlash.message}
                </Typography>
              </Paper>
            ) : null}
            {!aiDecisionFlash && allAiRecommendationsReviewed ? (
              <Paper elevation={0} sx={{ p: 0.7, borderRadius: 1.5, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF', mb: 0.9 }}>
                <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 900, lineHeight: 1.3 }}>
                  All recommendations reviewed. Previous steps keep their accepted or rejected preview state.
                </Typography>
              </Paper>
            ) : null}

            {[
              { label: 'Key findings', items: selectedAiRecommendation.findings },
              { label: 'Suggested actions', items: selectedAiRecommendation.actions },
            ].map((section) => (
              <Box key={section.label} sx={{ mb: 1 }}>
                <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                  {section.label}
                </Typography>
                <Box sx={{ mt: 0.45, display: 'flex', flexDirection: 'column', gap: 0.45 }}>
                  {section.items.map((item) => (
                    <Box key={item} sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-start' }}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#2563EB', mt: 0.62, flexShrink: 0 }} />
                      <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700, lineHeight: 1.3 }}>
                        {item}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}

            <Paper elevation={0} sx={{ p: 0.85, borderRadius: 1.6, border: '1px solid #BBF7D0', bgcolor: '#F0FDF4', mb: 0.9 }}>
              <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                Impact preview
              </Typography>
              <Typography variant="caption" sx={{ color: '#166534', fontWeight: 800, display: 'block', mt: 0.35, lineHeight: 1.32 }}>
                {selectedAiRecommendation.impact}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 0.85, borderRadius: 1.6, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', mb: 0.9 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                Data sources used
              </Typography>
              <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700, display: 'block', mt: 0.35, lineHeight: 1.35 }}>
                Current Summary filters, weekly coverage matrix, local staffing gaps, role requirements, and planned schedule signals.
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 0.85, borderRadius: 1.6, border: '1px solid #FED7AA', bgcolor: '#FFFBEB', mb: 1 }}>
              <Typography variant="caption" sx={{ color: '#9A3412', fontWeight: 900, lineHeight: 1.35 }}>
                This is a local preview. No schedule is saved or published.
              </Typography>
            </Paper>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.55, pt: 0.9, mt: 0.85, borderTop: '1px solid #DBEAFE', flexShrink: 0 }}>
              <Button variant="outlined" size="small" sx={{ borderRadius: 1.6, textTransform: 'none', fontWeight: 900 }}>
                Preview impact
              </Button>
              <Button
                variant="contained"
                size="small"
                disabled={selectedAiRecommendationDecision === 'accepted'}
                onClick={() => handleAiRecommendationDecision('accepted')}
                sx={{ borderRadius: 1.6, textTransform: 'none', fontWeight: 900, boxShadow: 'none', bgcolor: '#16A34A', '&:hover': { bgcolor: '#15803D' } }}
              >
                Accept recommendation
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled={selectedAiRecommendationDecision === 'rejected'}
                onClick={() => handleAiRecommendationDecision('rejected')}
                sx={{ borderRadius: 1.6, textTransform: 'none', fontWeight: 900, color: '#B91C1C', borderColor: '#FCA5A5' }}
              >
                Reject recommendation
              </Button>
              <Button variant="text" size="small" onClick={() => setIsSummaryAiDrawerOpen(false)} sx={{ borderRadius: 1.6, textTransform: 'none', fontWeight: 900, color: '#64748B' }}>
                Dismiss
              </Button>
            </Box>
          </Paper>
          ) : null}
        </Box>
          </>
        ) : (
          <Grid container spacing={1}>
            {departmentPeopleOnDuty.map((person) => {
              const statusStyle = person.status ? shiftScheduleEventStyles[person.status] : null;
              return (
                <Grid key={`${person.name}-${person.area}`} size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Paper elevation={0} sx={{ p: 1.15, borderRadius: 2.2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', height: '100%', transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 12px 28px rgba(15,23,42,0.08)' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 900 }}>{person.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 800 }}>{person.role}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', display: 'block', fontWeight: 700 }}>{person.area}</Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={statusStyle?.label ?? 'Available'}
                        sx={{
                          bgcolor: statusStyle ? `${statusStyle.color}18` : '#DCFCE7',
                          color: statusStyle?.color ?? '#15803D',
                          border: `1px solid ${statusStyle?.color ?? '#BBF7D0'}`,
                          fontWeight: 800,
                        }}
                      />
                    </Box>
                    <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                      <Paper elevation={0} sx={{ p: 0.75, borderRadius: 1.6, bgcolor: '#F8FBFF', border: '1px solid #DBEAFE' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.58rem' }}>Shift</Typography>
                        <Typography variant="body2" sx={{ color: '#1D4ED8', fontWeight: 900 }}>{shiftLabelById[person.shift]}</Typography>
                      </Paper>
                      <Paper elevation={0} sx={{ p: 0.75, borderRadius: 1.6, bgcolor: '#F8FBFF', border: '1px solid #DBEAFE' }}>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.58rem' }}>Period</Typography>
                        <Typography variant="body2" sx={{ color: '#1D4ED8', fontWeight: 900 }}>{selectedCalendarView}</Typography>
                      </Paper>
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
            {departmentPeopleOnDuty.length === 0 ? (
              <Grid size={{ xs: 12 }}>
                <Paper elevation={0} sx={{ p: 1.3, borderRadius: 2.2, border: '1px dashed #CBD5E1', bgcolor: '#F8FAFC' }}>
                  <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 800 }}>
                    No people match the selected department, area, shift, role, and event filters.
                  </Typography>
                </Paper>
              </Grid>
            ) : null}
          </Grid>
        )}
        <Dialog
          open={Boolean(selectedSummaryCoverageCell && isSummaryCoverageDetailOpen)}
          onClose={() => setIsSummaryCoverageDetailOpen(false)}
          fullWidth
          maxWidth="sm"
          sx={{ zIndex: 1602 }}
          PaperProps={{
            sx: {
              borderRadius: 2.4,
              border: '1px solid #CBD5E1',
              boxShadow: '0 24px 70px rgba(15,23,42,0.24)',
              overflow: 'hidden',
            },
          }}
        >
          {selectedSummaryCoverageCell ? (
            <>
              <DialogTitle sx={{ px: 2, pt: 1.8, pb: 1.1, borderBottom: '1px solid #E2E8F0' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.62rem' }}>
                  Summary coverage
                </Typography>
                <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 950, lineHeight: 1.15, mt: 0.2 }}>
                  Coverage Detail
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', fontWeight: 800, mt: 0.35 }}>
                  {selectedSummaryCoverageCell.line} - {selectedSummaryCoverageCell.dateLabel} - {selectedSummaryCoverageCell.shiftLabel}
                </Typography>
              </DialogTitle>
              <DialogContent sx={{ px: 2, py: 1.5, bgcolor: '#F8FAFC' }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.85, mb: 1 }}>
                  <Paper elevation={0} sx={{ p: 1, borderRadius: 1.8, border: `1px solid ${selectedSummaryCoverageCell.statusBorder}`, bgcolor: selectedSummaryCoverageCell.statusBg }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem' }}>
                      Coverage assigned/required
                    </Typography>
                    <Typography sx={{ color: selectedSummaryCoverageCell.statusTone, fontWeight: 950, fontSize: '1.35rem', lineHeight: 1.05, mt: 0.25 }}>
                      {selectedSummaryCoverageCell.coverageValue}
                    </Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ p: 1, borderRadius: 1.8, border: `1px solid ${selectedSummaryCoverageCell.statusBorder}`, bgcolor: '#FFFFFF' }}>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem' }}>
                      Status
                    </Typography>
                    <Typography sx={{ color: selectedSummaryCoverageCell.statusTone, fontWeight: 950, fontSize: '0.95rem', lineHeight: 1.15, mt: 0.35 }}>
                      {selectedSummaryCoverageCell.statusLabel}
                    </Typography>
                  </Paper>
                </Box>

                <Paper elevation={0} sx={{ p: 1, borderRadius: 1.8, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem' }}>
                        Assigned people sample
                      </Typography>
                      <Box sx={{ mt: 0.55, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                        {selectedSummaryCoverageCell.assignedPeople.length ? selectedSummaryCoverageCell.assignedPeople.map((person) => (
                          <Box key={`${selectedSummaryCoverageCell.key}-${person.name}`} sx={{ px: 0.65, py: 0.45, borderRadius: 1.4, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
                            <Typography variant="caption" sx={{ color: '#166534', fontWeight: 900, display: 'block', lineHeight: 1.1 }}>
                              {person.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700, fontSize: '0.6rem' }}>
                              {person.role}
                            </Typography>
                          </Box>
                        )) : (
                          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>No assigned people in this filtered view</Typography>
                        )}
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#C2410C', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem' }}>
                        Missing positions sample
                      </Typography>
                      <Box sx={{ mt: 0.55, display: 'flex', flexDirection: 'column', gap: 0.4 }}>
                        {selectedSummaryCoverageCell.missingPositions.length ? selectedSummaryCoverageCell.missingPositions.map((position) => (
                          <Box key={`${selectedSummaryCoverageCell.key}-${position}`} sx={{ px: 0.65, py: 0.45, borderRadius: 1.4, bgcolor: '#FFF7ED', border: '1px dashed #FDBA74' }}>
                            <Typography variant="caption" sx={{ color: '#9A3412', fontWeight: 900, lineHeight: 1.1 }}>
                              {position}
                            </Typography>
                          </Box>
                        )) : (
                          <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 900 }}>No missing positions</Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                    {selectedSummaryCoverageCell.notes.map((note) => (
                      <Typography key={`${selectedSummaryCoverageCell.key}-${note}`} variant="caption" sx={{ color: '#64748B', fontWeight: 800, lineHeight: 1.3 }}>
                        - {note}
                      </Typography>
                    ))}
                  </Box>
                </Paper>
              </DialogContent>
              <DialogActions sx={{ px: 2, py: 1.25, borderTop: '1px solid #E2E8F0', gap: 0.65, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<SparkleIcon />}
                  onClick={() => {
                    const relatedRecommendationIndex = aiScheduleRecommendations.findIndex((recommendation) => (
                      recommendation.affectedCells.some((cell) => (
                        cell.line === selectedSummaryCoverageCell.lineId
                        && cell.day === selectedSummaryCoverageCell.dayKey
                        && cell.shift === selectedSummaryCoverageCell.shiftBase
                      ))
                    ));
                    setIsSummaryCoverageDetailOpen(false);
                    setSelectedAiRecommendationIndex(relatedRecommendationIndex >= 0 ? relatedRecommendationIndex : 0);
                    setIsSummaryAiDrawerOpen(true);
                    window.requestAnimationFrame(() => {
                      summaryCoveragePlanRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                  }}
                  sx={{ borderRadius: 1.6, textTransform: 'none', fontWeight: 900, boxShadow: 'none' }}
                >
                  Find replacements with AI
                </Button>
                <Box sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <Button size="small" variant="outlined" sx={{ borderRadius: 1.6, textTransform: 'none', fontWeight: 900 }}>
                    View people
                  </Button>
                  <Button size="small" variant="outlined" sx={{ borderRadius: 1.6, textTransform: 'none', fontWeight: 900 }}>
                    Open Crew Setup
                  </Button>
                  <Button size="small" variant="text" onClick={() => setIsSummaryCoverageDetailOpen(false)} sx={{ borderRadius: 1.6, textTransform: 'none', fontWeight: 900, color: '#64748B' }}>
                    Close
                  </Button>
                </Box>
              </DialogActions>
            </>
          ) : null}
        </Dialog>
        </>
        <ShiftMemberProfileDialog
          selectedShiftMember={selectedShiftMember}
          selectedShiftMemberProfile={selectedShiftMemberProfile}
          selectedShiftMemberWeekSchedule={selectedShiftMemberWeekSchedule}
          getShiftMemberAvatar={getShiftMemberAvatar}
          setSelectedShiftMember={setSelectedShiftMember}
        />
        <Dialog
          open={isHolidayDrawerOpen}
          onClose={() => setIsHolidayDrawerOpen(false)}
          fullWidth
          maxWidth="md"
          PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ px: 2.4, py: 1.7, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FBFF' }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: activeTheme.textPrimary, lineHeight: 1.1 }}>
              {editingHolidayId ? 'Edit Planned Stop' : 'Create Planned Stop'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
              Configure the stop here and it will be reflected in Overview, Summary, and Planner.
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 2.2, bgcolor: '#FFFFFF' }}>
            <Grid container spacing={1.4}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField label="Title" size="small" fullWidth value={holidayDraft.title} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, title: event.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select label="Type" value={holidayDraft.type} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, type: event.target.value as typeof plannedStopTypeOptions[number] }))}>
                    {plannedStopTypeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Scope</InputLabel>
                  <Select label="Scope" value={holidayDraft.scope} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, scope: event.target.value as typeof plannedStopScopeOptions[number] }))}>
                    {plannedStopScopeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField label="Department / Area / Line" size="small" fullWidth value={holidayDraft.scopeDetail} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, scopeDetail: event.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Start Date" type="date" size="small" fullWidth value={holidayDraft.startDate} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, startDate: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Start Time" type="time" size="small" fullWidth value={holidayDraft.startTime} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, startTime: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="End Date" type="date" size="small" fullWidth value={holidayDraft.endDate} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, endDate: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="End Time" type="time" size="small" fullWidth value={holidayDraft.endTime} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, endTime: event.target.value }))} slotProps={{ inputLabel: { shrink: true } }} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Description" size="small" fullWidth multiline minRows={3} value={holidayDraft.description} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, description: event.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="Reason" size="small" fullWidth multiline minRows={2} value={holidayDraft.reason} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, reason: event.target.value }))} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <FormControlLabel control={<Switch checked={holidayDraft.isActive} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, isActive: event.target.checked }))} />} label="Active planned stop" />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ px: 2.4, py: 1.4, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
            <Button onClick={() => setIsHolidayDrawerOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={saveHolidayDraft} disabled={!holidayDraft.title.trim()} sx={{ borderRadius: 2.2, fontWeight: 800 }}>
              {editingHolidayId ? 'Save Planned Stop' : 'Create Planned Stop'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default ShiftScheduleScreen;
