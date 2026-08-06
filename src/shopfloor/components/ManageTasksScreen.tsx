import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  InputAdornment,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Tabs,
  Tab,
  Grid,
  Menu,
  Radio,
  Switch,
  Checkbox,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountTreeOutlined as DependencyFlowIcon,
  CalendarToday as CalendarIcon,
  MoreHoriz as MoreIcon,
  Edit as EditIcon,
  DeleteOutline as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  AutoAwesome as SparkleIcon,
  Assignment as ActivityIcon,
  AccessTime as AccessTimeIcon,
  Adjust as ComponentIcon,
  PrecisionManufacturingOutlined as EquipmentIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon,
  FormatListBulleted as LegendIcon,
  OpenInFull as OpenInFullIcon,
  PersonOutline as PersonOutlineIcon,
  PlaceOutlined as PlaceIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  RestartAlt as ResetIcon,
  Search as SearchIcon,
  Tune as TuneIcon,
  ViewTimelineOutlined as TimelineIcon,
  WbSunnyOutlined as SunIcon,
  NightlightRound as MoonIcon,
} from '@mui/icons-material';
import { lightHeaderIconButtonSx } from '../../theme';
import {
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenError,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
} from '../../workstation/theme';

type ActivityType = 'CIL' | 'Centerline' | 'Changeover';
type ActivityGroupBy = 'Type' | 'Frequency' | 'Location';
type ChangeoverPhase = 'Pre Changeover' | 'Line Clearance' | 'Line Down Changeover' | 'Centerline' | 'Ramp Up & Adjustments';
type StepListKind = 'cil' | 'centerline' | 'changeover';
type StepDragState = { list: StepListKind; id: string; phase?: ChangeoverPhase; operatorId?: string };
type ChangeoverStepViewMode = 'operator' | 'stage';
type RescheduleShift = 'Shift 1' | 'Shift 2' | 'Shift 3';
type OccurrenceStatus = 'Pending' | 'Completed' | 'Overdue' | 'Skipped';
type ChangeoverOperatorStatus = 'Pending' | 'Running' | 'Waiting Review' | 'Done';
type FrequencyType = 'Per Shift' | 'Hourly' | 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'Custom';
type FrequencyRepeatUnit = 'hour' | 'day' | 'week' | 'month' | 'year';
type FrequencyEndMode = 'never' | 'onDate' | 'after';
type FrequencyTimeMode = 'specific' | 'multiple';
type FrequencyMonthlyMode = 'day' | 'weekday' | 'lastDay';
type FrequencyShiftId = 'morning' | 'afternoon' | 'night';
type FrequencyWeekdayId = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type FrequencyOrdinal = 'first' | 'second' | 'third' | 'fourth' | 'last';

type FrequencyConfig = {
  frequency: FrequencyType;
  repeatEvery: string;
  repeatUnit: FrequencyRepeatUnit;
  startDate: string;
  startTime: string;
  shiftTimes: Record<FrequencyShiftId, string>;
  weekDays: FrequencyWeekdayId[];
  timeMode: FrequencyTimeMode;
  times: string[];
  selectedShifts: FrequencyShiftId[];
  monthlyMode: FrequencyMonthlyMode;
  monthlyDay: string;
  monthlyOrdinal: FrequencyOrdinal;
  monthlyWeekday: FrequencyWeekdayId;
  annualMonth: string;
  annualDay: string;
  endMode: FrequencyEndMode;
  endDate: string;
  endOccurrences: string;
  timezone: string;
  exceptionDates: string;
  blackoutDates: string;
  skipHolidays: boolean;
  moveFromNonWorkingDays: boolean;
  customRule: string;
  advancedOpen: boolean;
};
type StepRequirementFields = {
  stepName: string;
  stepDescription: string;
  imageRequired: boolean;
  ppeRequired: boolean;
  requiredPpe: string[];
  toolsRequired: boolean;
  requiredTools: string[];
};

type CenterlineRequirementType = StepRequirementFields & {
  parameter: string;
  parameterUnit: string;
  min: string;
  target: string;
  max: string;
  machineCondition: string;
  attachments: string[];
};

type ManagedActivity = {
  id: string;
  title: string;
  category: ActivityType;
  location: string;
  equipment: string;
  component?: string;
  changeoverFrom?: string;
  changeoverTo?: string;
  nextDate: string;
  nextShift: RescheduleShift;
  lastOccurrence: string;
  frequency: string;
  frequencyConfig?: FrequencyConfig;
  duration: string;
};

type ManagedOccurrence = {
  id: string;
  activityId: string;
  date: string;
  time: string;
  shift: RescheduleShift;
  status: OccurrenceStatus;
  assignedTo: string;
};

type AssignmentRole = 'Operator' | 'Technician' | 'Maintenance';
type ChangeoverAssignmentStepId = 'pre-changeover' | 'line-clearance' | 'line-down-changeover' | 'centerline' | 'ramp-up-adjustments';

type OperatorOption = {
  id: string;
  name: string;
  initials: string;
  role: AssignmentRole;
  color: string;
};

type ChangeoverAssignmentStep = {
  id: ChangeoverAssignmentStepId;
  number: number;
  title: string;
  totalTasks: number;
  color: string;
  softColor: string;
  defaultVisibleTasks: number;
};

type ChangeoverAssignmentTask = {
  id: string;
  stepId: ChangeoverAssignmentStepId;
  code: string;
  task: string;
  description: string;
  estimatedTime: string;
  role: AssignmentRole;
};

type AssignmentModalTab = 'tasks' | 'dependencies';
type DependencyViewMode = 'flow' | 'timeline';
type DependencyType = 'FS' | 'SS' | 'FF' | 'SF';
type DependencyTaskStatus = 'completed' | 'assigned' | 'not-started' | 'not-assigned';

type ChangeoverDependency = {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  type: DependencyType;
  critical: boolean;
  mandatory: boolean;
};

type TimelineTaskPlacement = {
  taskId: string;
  startMinute: number;
  durationMinute: number;
};

type CILStep = { id: string; type: string; duration: string; machineCondition: string; attachments: string[] } & StepRequirementFields;
type CenterlineParameter = { id: string } & CenterlineRequirementType;
type ChangeoverStep = { id: string; type: string; duration: string; machineCondition: string; attachments: string[]; parameter: string; parameterUnit: string; min: string; target: string; max: string } & StepRequirementFields;
type ChangeoverOperatorStep = ChangeoverStep & { phase: ChangeoverPhase };
type ChangeoverOperatorRoutine = OperatorOption & {
  functionLabel: string;
  steps: ChangeoverOperatorStep[];
};
type ExcelImportStage = 'upload' | 'routines';
type MockExcelRoutine = {
  id: string;
  title: string;
  sourceSheet: string;
  confidence: string;
  category: 'CIL';
  location: string;
  equipment: string;
  component: string;
  duration: string;
  frequencyConfig: FrequencyConfig;
  steps: Array<Omit<CILStep, 'id'>>;
};

const PPE_OPTIONS = ['Safety Glasses', 'Protective Gloves', 'Hearing Protection', 'Safety Shoes', 'Face Shield', 'Respiratory Mask'];
const TOOLS_OPTIONS = ['Torque Wrench', 'Allen Key Set', 'Screwdriver Set', 'Caliper', 'Infrared Thermometer', 'Cleaning Kit'];
const PARAMETER_UNIT_OPTIONS = ['mm', 'cm', 'm', 'bar', 'psi', 'deg C', 'deg F', 'V', 'A', 'Hz', '%', 'rpm', 'N*m'];
const FREQUENCY_OPTIONS: FrequencyType[] = ['Per Shift', 'Hourly', 'Daily', 'Weekly', 'Biweekly', 'Monthly', 'Quarterly', 'Annual', 'Custom'];
const FREQUENCY_REPEAT_UNITS: FrequencyRepeatUnit[] = ['hour', 'day', 'week', 'month', 'year'];
const FREQUENCY_WEEKDAYS: Array<{ id: FrequencyWeekdayId; label: string; longLabel: string }> = [
  { id: 'mon', label: 'Mon', longLabel: 'Monday' },
  { id: 'tue', label: 'Tue', longLabel: 'Tuesday' },
  { id: 'wed', label: 'Wed', longLabel: 'Wednesday' },
  { id: 'thu', label: 'Thu', longLabel: 'Thursday' },
  { id: 'fri', label: 'Fri', longLabel: 'Friday' },
  { id: 'sat', label: 'Sat', longLabel: 'Saturday' },
  { id: 'sun', label: 'Sun', longLabel: 'Sunday' },
];
const FREQUENCY_SHIFT_OPTIONS: Array<{ id: FrequencyShiftId; label: string; time: string; shift: RescheduleShift }> = [
  { id: 'morning', label: 'Morning Shift (06:00 - 14:00)', time: '06:00', shift: 'Shift 1' },
  { id: 'afternoon', label: 'Afternoon Shift (14:00 - 22:00)', time: '14:00', shift: 'Shift 2' },
  { id: 'night', label: 'Night Shift (22:00 - 06:00)', time: '22:00', shift: 'Shift 3' },
];
const FREQUENCY_TIMEZONES = ['America/New_York', 'America/Sao_Paulo', 'UTC', 'Europe/London', 'Asia/Singapore'];
const FREQUENCY_MONTHS = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const getTodayIsoDate = (): string => new Date().toISOString().slice(0, 10);

const formatFrequencyDate = (isoDate: string): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${month}/${day}/${year}`;
};

const createDefaultShiftTimes = (): Record<FrequencyShiftId, string> => ({
  morning: '08:00',
  afternoon: '14:00',
  night: '22:00',
});

const cloneFrequencyConfig = (config: FrequencyConfig): FrequencyConfig => ({
  ...config,
  shiftTimes: { ...createDefaultShiftTimes(), ...(config.shiftTimes ?? {}) },
  weekDays: [...config.weekDays],
  times: [...config.times],
  selectedShifts: [...config.selectedShifts],
});

const createBaseFrequencyConfig = (): FrequencyConfig => ({
  frequency: 'Per Shift',
  repeatEvery: '1',
  repeatUnit: 'day',
  startDate: getTodayIsoDate(),
  startTime: '08:00',
  shiftTimes: createDefaultShiftTimes(),
  weekDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
  timeMode: 'specific',
  times: ['08:00', '14:00', '20:00'],
  selectedShifts: ['morning', 'afternoon'],
  monthlyMode: 'day',
  monthlyDay: '5',
  monthlyOrdinal: 'first',
  monthlyWeekday: 'mon',
  annualMonth: '1',
  annualDay: '1',
  endMode: 'never',
  endDate: '2026-12-31',
  endOccurrences: '10',
  timezone: 'America/New_York',
  exceptionDates: '',
  blackoutDates: '',
  skipHolidays: true,
  moveFromNonWorkingDays: true,
  customRule: '',
  advancedOpen: false,
});

const createFrequencyConfigForType = (frequency: FrequencyType, previous?: FrequencyConfig): FrequencyConfig => {
  const base = previous ? cloneFrequencyConfig(previous) : createBaseFrequencyConfig();
  const next: FrequencyConfig = {
    ...base,
    frequency,
    repeatEvery: base.repeatEvery || '1',
    shiftTimes: { ...createDefaultShiftTimes(), ...base.shiftTimes },
    weekDays: base.weekDays.length ? base.weekDays : ['mon', 'tue', 'wed', 'thu', 'fri'],
    times: base.times.length ? base.times : ['08:00'],
    selectedShifts: base.selectedShifts.length ? base.selectedShifts : ['morning'],
  };

  if (frequency === 'Per Shift') {
    return { ...next, repeatEvery: '1', repeatUnit: 'day', timeMode: 'specific' };
  }
  if (frequency === 'Hourly') {
    return { ...next, repeatEvery: next.repeatEvery === '1' ? '4' : next.repeatEvery, repeatUnit: 'hour' };
  }
  if (frequency === 'Daily') {
    return { ...next, repeatEvery: '1', repeatUnit: 'day' };
  }
  if (frequency === 'Weekly') {
    return { ...next, repeatEvery: '1', repeatUnit: 'week' };
  }
  if (frequency === 'Biweekly') {
    return { ...next, repeatEvery: '2', repeatUnit: 'week' };
  }
  if (frequency === 'Monthly') {
    return { ...next, repeatEvery: '1', repeatUnit: 'month' };
  }
  if (frequency === 'Quarterly') {
    return { ...next, repeatEvery: '3', repeatUnit: 'month' };
  }
  if (frequency === 'Annual') {
    return { ...next, repeatEvery: '1', repeatUnit: 'year' };
  }
  return {
    ...next,
    customRule: next.customRule || 'Every 2 business days during production weeks',
  };
};

const createDefaultFrequencyConfig = (): FrequencyConfig => createFrequencyConfigForType('Per Shift');

const createFrequencyConfigFromSummary = (frequency: string): FrequencyConfig => {
  const normalized = frequency.toLowerCase();
  if (normalized.includes('hour')) return createFrequencyConfigForType('Hourly');
  if (normalized.includes('daily')) return createFrequencyConfigForType('Daily');
  if (normalized.includes('biweekly')) return createFrequencyConfigForType('Biweekly');
  if (normalized.includes('weekly')) return createFrequencyConfigForType('Weekly');
  if (normalized.includes('monthly')) return createFrequencyConfigForType('Monthly');
  if (normalized.includes('quarter')) return createFrequencyConfigForType('Quarterly');
  if (normalized.includes('annual')) return createFrequencyConfigForType('Annual');
  if (normalized.includes('custom')) return createFrequencyConfigForType('Custom');
  return createFrequencyConfigForType('Per Shift');
};

const getRepeatUnitLabel = (unit: FrequencyRepeatUnit, plural = true): string => `${unit}${plural ? '(s)' : ''}`;

const summarizeFrequencyConfig = (config: FrequencyConfig): string => {
  const repeatEvery = config.repeatEvery || '1';
  const firstTime = config.timeMode === 'multiple' ? config.times.join(', ') : config.startTime;
  const endSummary = config.endMode === 'onDate'
    ? ` until ${formatFrequencyDate(config.endDate)}`
    : config.endMode === 'after'
      ? ` for ${config.endOccurrences || '0'} occurrence(s)`
      : '';

  if (config.frequency === 'Per Shift') {
    const shifts = FREQUENCY_SHIFT_OPTIONS
      .filter((shift) => config.selectedShifts.includes(shift.id))
      .map((shift) => `${shift.label.split(' Shift')[0]} ${config.shiftTimes[shift.id] || shift.time}`)
      .join(', ');
    return `Per Shift${shifts ? `: ${shifts}` : ''}${endSummary}`;
  }

  if (config.frequency === 'Monthly' || config.frequency === 'Quarterly') {
    const monthlyRule = config.monthlyMode === 'day'
      ? `day ${config.monthlyDay || '1'}`
      : config.monthlyMode === 'lastDay'
        ? 'last day'
        : `${config.monthlyOrdinal} ${FREQUENCY_WEEKDAYS.find((day) => day.id === config.monthlyWeekday)?.longLabel ?? 'Monday'}`;
    return `${config.frequency}, every ${repeatEvery} month(s) on ${monthlyRule} at ${firstTime}${endSummary}`;
  }

  if (config.frequency === 'Annual') {
    const month = FREQUENCY_MONTHS.find((item) => item.value === config.annualMonth)?.label ?? 'January';
    return `Annual, ${month} ${config.annualDay || '1'} at ${firstTime}${endSummary}`;
  }

  if (config.frequency === 'Custom') {
    return `Custom, every ${repeatEvery} ${getRepeatUnitLabel(config.repeatUnit)} at ${firstTime}${endSummary}`;
  }

  if (config.repeatUnit === 'week') {
    const days = FREQUENCY_WEEKDAYS
      .filter((day) => config.weekDays.includes(day.id))
      .map((day) => day.label)
      .join(', ');
    return `${config.frequency}, every ${repeatEvery} week(s)${days ? ` on ${days}` : ''} at ${firstTime}${endSummary}`;
  }

  return `${config.frequency}, every ${repeatEvery} ${getRepeatUnitLabel(config.repeatUnit)} at ${firstTime}${endSummary}`;
};

const getShiftFromFrequencyConfig = (config: FrequencyConfig, fallbackShift: RescheduleShift): RescheduleShift => {
  if (config.frequency !== 'Per Shift') return fallbackShift;
  const selectedShift = FREQUENCY_SHIFT_OPTIONS.find((shift) => config.selectedShifts.includes(shift.id));
  return selectedShift?.shift ?? fallbackShift;
};

const getShiftTimeFromFrequencyConfig = (config: FrequencyConfig, shift: RescheduleShift, fallbackTime: string): string => {
  const shiftOption = FREQUENCY_SHIFT_OPTIONS.find((option) => option.shift === shift);
  if (!shiftOption) return fallbackTime;
  return config.shiftTimes?.[shiftOption.id] || shiftOption.time || fallbackTime;
};

const changeoverOperators: OperatorOption[] = [
  { id: 'alex-brown', name: 'Alex Brown', initials: 'AB', role: 'Operator', color: tokenBrand.main },
  { id: 'chris-davis', name: 'Chris Davis', initials: 'CD', role: 'Operator', color: tokenWarning.main },
  { id: 'emily-rogers', name: 'Emily Rogers', initials: 'ER', role: 'Technician', color: tokenSuccess.main },
  { id: 'ethan-walker', name: 'Ethan Walker', initials: 'EW', role: 'Maintenance', color: tokenInfo.main },
  { id: 'delila-bran', name: 'Delila Bran', initials: 'DB', role: 'Operator', color: tokenBrand.light },
  { id: 'mariana-costa', name: 'Mariana Costa', initials: 'MC', role: 'Technician', color: tokenError.main },
  { id: 'rafael-santos', name: 'Rafael Santos', initials: 'RS', role: 'Maintenance', color: tokenInfo.dark },
  { id: 'priya-nair', name: 'Priya Nair', initials: 'PN', role: 'Operator', color: tokenBrand.dark },
];

const changeoverAssignmentSteps: ChangeoverAssignmentStep[] = [
  { id: 'pre-changeover', number: 1, title: 'Pre Changeover', totalTasks: 6, color: tokenBrand.main, softColor: tokenBrand.softBg, defaultVisibleTasks: 2 },
  { id: 'line-clearance', number: 2, title: 'Line Clearance', totalTasks: 7, color: tokenWarning.main, softColor: tokenWarning.softBg, defaultVisibleTasks: 2 },
  { id: 'line-down-changeover', number: 3, title: 'Line Down Changeover', totalTasks: 12, color: tokenSuccess.main, softColor: tokenSuccess.softBg, defaultVisibleTasks: 2 },
  { id: 'centerline', number: 4, title: 'Centerline', totalTasks: 3, color: tokenInfo.main, softColor: tokenInfo.softBg, defaultVisibleTasks: 1 },
  { id: 'ramp-up-adjustments', number: 5, title: 'Ramp Up & Adjustments', totalTasks: 8, color: tokenBrand.light, softColor: tokenBrand.softBg, defaultVisibleTasks: 2 },
];

const changeoverPhases: ChangeoverPhase[] = ['Pre Changeover', 'Line Clearance', 'Line Down Changeover', 'Centerline', 'Ramp Up & Adjustments'];

const changeoverSkuOptions = [
  { value: 'SKU A', label: 'SKU A - Current format' },
  { value: 'SKU B', label: 'SKU B - Next format' },
  { value: 'SKU C', label: 'SKU C - Alternate pack' },
  { value: 'SKU D', label: 'SKU D - Large format' },
  { value: 'FG-1001', label: 'FG-1001 - Standard Tube A' },
  { value: 'FG-1002', label: 'FG-1002 - Standard Tube B' },
  { value: 'FG-2001', label: 'FG-2001 - Additive Tube' },
  { value: 'FG-3001', label: 'FG-3001 - Gel Product' },
  { value: 'FG-4001', label: 'FG-4001 - Specialty Pack' },
  { value: 'FG-5001', label: 'FG-5001 - Low Volume Product' },
];

const changeoverPhaseNumberByPhase: Record<ChangeoverPhase, number> = {
  'Pre Changeover': 1,
  'Line Clearance': 2,
  'Line Down Changeover': 3,
  Centerline: 4,
  'Ramp Up & Adjustments': 5,
};

const changeoverAssignmentTasks: ChangeoverAssignmentTask[] = [
  { id: 'co-1-1', stepId: 'pre-changeover', code: '1.1', task: 'Review batch record and specifications', description: 'Confirm next SKU requirements and documents before the line is released', estimatedTime: '3 min', role: 'Technician' },
  { id: 'co-1-2', stepId: 'pre-changeover', code: '1.2', task: 'Prepare tools and components', description: 'Gather required tools, parts, labels, and materials at line-side', estimatedTime: '4 min', role: 'Operator' },
  { id: 'co-1-3', stepId: 'pre-changeover', code: '1.3', task: 'Stage new format parts', description: 'Move guides, change parts, star wheels, and nozzles to the staging rack', estimatedTime: '6 min', role: 'Maintenance' },
  { id: 'co-1-4', stepId: 'pre-changeover', code: '1.4', task: 'Confirm maintenance window', description: 'Validate lockout plan and downtime start with the line leader', estimatedTime: '2 min', role: 'Maintenance' },
  { id: 'co-1-5', stepId: 'pre-changeover', code: '1.5', task: 'Verify quality holds', description: 'Confirm no product-hold, allergen, or material constraints remain open', estimatedTime: '3 min', role: 'Technician' },
  { id: 'co-1-6', stepId: 'pre-changeover', code: '1.6', task: 'Brief operators on sequence', description: 'Align owners, handoffs, and escalation channel', estimatedTime: '5 min', role: 'Operator' },
  { id: 'co-2-1', stepId: 'line-clearance', code: '2.1', task: 'Remove WIP and finished product from the line', description: 'Clear all materials and products from equipment and conveyors', estimatedTime: '5 min', role: 'Operator' },
  { id: 'co-2-2', stepId: 'line-clearance', code: '2.2', task: 'Verify line is clean and area is safe', description: 'Complete visual inspection and safety check before teardown', estimatedTime: '2 min', role: 'Operator' },
  { id: 'co-2-3', stepId: 'line-clearance', code: '2.3', task: 'Scan previous SKU labels', description: 'Confirm no mixed labels remain in pack-out and rework zones', estimatedTime: '3 min', role: 'Operator' },
  { id: 'co-2-4', stepId: 'line-clearance', code: '2.4', task: 'Remove obsolete packaging', description: 'Return cartons, trays, and film to staging before setup', estimatedTime: '4 min', role: 'Operator' },
  { id: 'co-2-5', stepId: 'line-clearance', code: '2.5', task: 'Check line clearance log', description: 'Confirm last lot closure and QA signoff are complete', estimatedTime: '2 min', role: 'Technician' },
  { id: 'co-2-6', stepId: 'line-clearance', code: '2.6', task: 'Clean reject bins', description: 'Empty and wipe reject bins before new SKU parts enter the line', estimatedTime: '3 min', role: 'Operator' },
  { id: 'co-2-7', stepId: 'line-clearance', code: '2.7', task: 'Release line to changeover', description: 'Notify leader that clearance is complete and recorded', estimatedTime: '1 min', role: 'Technician' },
  { id: 'co-3-1', stepId: 'line-down-changeover', code: '3.1', task: 'Remove existing parts', description: 'Disassemble parts to be replaced', estimatedTime: '8 min', role: 'Maintenance' },
  { id: 'co-3-2', stepId: 'line-down-changeover', code: '3.2', task: 'Install new parts', description: 'Install parts for next SKU', estimatedTime: '10 min', role: 'Maintenance' },
  { id: 'co-3-3', stepId: 'line-down-changeover', code: '3.3', task: 'Adjust conveyor guides', description: 'Set guide rails to target width and verify clearances', estimatedTime: '6 min', role: 'Maintenance' },
  { id: 'co-3-4', stepId: 'line-down-changeover', code: '3.4', task: 'Replace transfer star wheel', description: 'Remove old wheel and mount the SKU D wheel', estimatedTime: '9 min', role: 'Maintenance' },
  { id: 'co-3-5', stepId: 'line-down-changeover', code: '3.5', task: 'Change filler nozzles', description: 'Fit nozzles and verify seating before restart', estimatedTime: '7 min', role: 'Maintenance' },
  { id: 'co-3-6', stepId: 'line-down-changeover', code: '3.6', task: 'Update recipe in HMI', description: 'Load SKU D parameters with supervisor access', estimatedTime: '4 min', role: 'Technician' },
  { id: 'co-3-7', stepId: 'line-down-changeover', code: '3.7', task: 'Inspect guarding and interlocks', description: 'Confirm panels and interlocks are restored', estimatedTime: '5 min', role: 'Maintenance' },
  { id: 'co-3-8', stepId: 'line-down-changeover', code: '3.8', task: 'Dry cycle machine', description: 'Run line slowly and listen for contact points', estimatedTime: '6 min', role: 'Operator' },
  { id: 'co-3-9', stepId: 'line-down-changeover', code: '3.9', task: 'Tighten critical fasteners', description: 'Torque fasteners to standard range', estimatedTime: '4 min', role: 'Maintenance' },
  { id: 'co-3-10', stepId: 'line-down-changeover', code: '3.10', task: 'Clear tools from machine', description: 'Remove loose tools and parts from guarded area', estimatedTime: '2 min', role: 'Operator' },
  { id: 'co-3-11', stepId: 'line-down-changeover', code: '3.11', task: 'Validate lubrication points', description: 'Check pins and guide rails after install', estimatedTime: '3 min', role: 'Maintenance' },
  { id: 'co-3-12', stepId: 'line-down-changeover', code: '3.12', task: 'Hand off to centerline', description: 'Confirm line is ready for centerline checks', estimatedTime: '1 min', role: 'Technician' },
  { id: 'co-4-1', stepId: 'centerline', code: '4.1', task: 'Check temperature centerline', description: 'Measure equipment temperature and confirm it is within centerline range', estimatedTime: '4 min', role: 'Technician' },
  { id: 'co-4-2', stepId: 'centerline', code: '4.2', task: 'Check pneumatic pressure', description: 'Measure pressure and compare against the centerline target', estimatedTime: '4 min', role: 'Technician' },
  { id: 'co-4-3', stepId: 'centerline', code: '4.3', task: 'Verify speed baseline', description: 'Confirm equipment speed is stable before production ramp', estimatedTime: '5 min', role: 'Operator' },
  { id: 'co-5-1', stepId: 'ramp-up-adjustments', code: '5.1', task: 'Reassemble and secure equipment', description: 'Reassemble all components and tighten after parameter checks', estimatedTime: '5 min', role: 'Maintenance' },
  { id: 'co-5-2', stepId: 'ramp-up-adjustments', code: '5.2', task: 'Restore guards and panels', description: 'Close all guarding and verify latches', estimatedTime: '4 min', role: 'Maintenance' },
  { id: 'co-5-3', stepId: 'ramp-up-adjustments', code: '5.3', task: 'Run first-piece inspection', description: 'Confirm first units meet acceptance criteria', estimatedTime: '8 min', role: 'Technician' },
  { id: 'co-5-4', stepId: 'ramp-up-adjustments', code: '5.4', task: 'Verify speed ramp target', description: 'Increase speed while monitoring rejects and micro-stops', estimatedTime: '7 min', role: 'Operator' },
  { id: 'co-5-5', stepId: 'ramp-up-adjustments', code: '5.5', task: 'Quality release for production', description: 'Capture approval and release line to production', estimatedTime: '4 min', role: 'Technician' },
  { id: 'co-5-6', stepId: 'ramp-up-adjustments', code: '5.6', task: 'Clean floor and staging area', description: 'Remove packaging, scrap, and spare parts from the area', estimatedTime: '5 min', role: 'Operator' },
  { id: 'co-5-7', stepId: 'ramp-up-adjustments', code: '5.7', task: 'Confirm waste disposal', description: 'Dispose of previous SKU scrap using the correct stream', estimatedTime: '2 min', role: 'Operator' },
  { id: 'co-5-8', stepId: 'ramp-up-adjustments', code: '5.8', task: 'Record changeover completion', description: 'Update task log and close the checklist', estimatedTime: '3 min', role: 'Technician' },
];

const initialChangeoverAssignments: Record<string, string> = {
  'co-1-1': 'alex-brown',
  'co-1-2': 'chris-davis',
  'co-2-1': 'emily-rogers',
};

const initialChangeoverDependencies: ChangeoverDependency[] = [
  { id: 'dep-1', fromTaskId: 'co-1-1', toTaskId: 'co-2-1', type: 'FS', critical: true, mandatory: true },
  { id: 'dep-2', fromTaskId: 'co-1-2', toTaskId: 'co-2-2', type: 'FS', critical: true, mandatory: true },
  { id: 'dep-3', fromTaskId: 'co-2-1', toTaskId: 'co-3-1', type: 'FS', critical: true, mandatory: true },
  { id: 'dep-4', fromTaskId: 'co-2-2', toTaskId: 'co-3-2', type: 'FS', critical: true, mandatory: true },
  { id: 'dep-5', fromTaskId: 'co-2-3', toTaskId: 'co-3-3', type: 'SS', critical: false, mandatory: false },
  { id: 'dep-6', fromTaskId: 'co-3-1', toTaskId: 'co-4-1', type: 'FS', critical: true, mandatory: true },
  { id: 'dep-7', fromTaskId: 'co-3-2', toTaskId: 'co-4-2', type: 'FS', critical: true, mandatory: true },
  { id: 'dep-8', fromTaskId: 'co-3-3', toTaskId: 'co-4-2', type: 'FF', critical: false, mandatory: false },
  { id: 'dep-9', fromTaskId: 'co-4-1', toTaskId: 'co-5-1', type: 'FS', critical: true, mandatory: true },
  { id: 'dep-10', fromTaskId: 'co-4-2', toTaskId: 'co-5-1', type: 'FS', critical: true, mandatory: true },
  { id: 'dep-11', fromTaskId: 'co-2-3', toTaskId: 'co-5-1', type: 'SF', critical: false, mandatory: false },
];

const dependencyTaskStatusSeed: Record<string, DependencyTaskStatus> = {
  'co-1-1': 'completed',
  'co-1-2': 'completed',
  'co-2-1': 'completed',
  'co-2-2': 'assigned',
  'co-2-3': 'not-started',
  'co-3-1': 'completed',
  'co-3-2': 'assigned',
  'co-3-3': 'completed',
  'co-4-1': 'assigned',
  'co-4-2': 'assigned',
  'co-5-1': 'assigned',
};

const timelineTaskPlacements: TimelineTaskPlacement[] = [
  { taskId: 'co-1-1', startMinute: 0, durationMinute: 5 },
  { taskId: 'co-1-2', startMinute: 5, durationMinute: 2 },
  { taskId: 'co-2-1', startMinute: 8, durationMinute: 3 },
  { taskId: 'co-2-2', startMinute: 18, durationMinute: 4 },
  { taskId: 'co-3-1', startMinute: 14, durationMinute: 8 },
  { taskId: 'co-3-2', startMinute: 14, durationMinute: 10 },
  { taskId: 'co-3-3', startMinute: 21, durationMinute: 6 },
  { taskId: 'co-4-1', startMinute: 26, durationMinute: 5 },
  { taskId: 'co-4-2', startMinute: 34, durationMinute: 4 },
  { taskId: 'co-5-1', startMinute: 39, durationMinute: 6 },
];

const timelineTickMarks = [
  { label: '14:30', minute: 0 },
  { label: '14:35', minute: 5 },
  { label: '14:40', minute: 10 },
  { label: '14:45', minute: 15 },
  { label: '14:50', minute: 20 },
  { label: '14:55', minute: 25 },
  { label: '15:00', minute: 30 },
  { label: '15:05', minute: 35 },
  { label: '15:10', minute: 40 },
];

const createExpandedStepState = (expanded: boolean): Record<ChangeoverAssignmentStepId, boolean> =>
  changeoverAssignmentSteps.reduce((acc, step) => ({ ...acc, [step.id]: expanded }), {} as Record<ChangeoverAssignmentStepId, boolean>);


const createStepRequirementFields = (): StepRequirementFields => ({
  stepName: '',
  stepDescription: '',
  imageRequired: false,
  ppeRequired: false,
  requiredPpe: [],
  toolsRequired: false,
  requiredTools: [],
});

const createCilStep = (): CILStep => ({ id: `cil-${Date.now()}-${Math.random()}`, type: 'Inspection', duration: '2', machineCondition: 'Stopped', attachments: [], ...createStepRequirementFields() });
const createCenterlineParameter = (): CenterlineParameter => ({ id: `cl-${Date.now()}-${Math.random()}`, parameter: '', parameterUnit: '', min: '', target: '', max: '', machineCondition: 'Running', attachments: [], ...createStepRequirementFields() });
const createChangeoverStep = (): ChangeoverStep => ({ id: `co-${Date.now()}-${Math.random()}`, type: 'Inspection', duration: '5', machineCondition: 'Stopped', attachments: [], parameter: '', parameterUnit: '', min: '', target: '', max: '', ...createStepRequirementFields() });

const getOperatorInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'OP';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const getStepDurationMinutes = (duration: string): number => {
  const parsed = Number.parseFloat(duration);
  return Number.isFinite(parsed) ? Math.max(parsed, 0) : 0;
};

const formatStepMinutes = (minutes: number): string => `${Number.isInteger(minutes) ? minutes : minutes.toFixed(1)} min`;

const createChangeoverOperatorStep = (
  phase: ChangeoverPhase = 'Pre Changeover',
  patch: Partial<ChangeoverOperatorStep> = {},
): ChangeoverOperatorStep => ({
  ...createChangeoverStep(),
  phase,
  ...patch,
});

const createDefaultChangeoverOperatorRoutines = (): ChangeoverOperatorRoutine[] => [
  {
    id: 'changeover-operator-1',
    name: 'Operator 1',
    initials: 'O1',
    role: 'Operator',
    functionLabel: 'Primary operator',
    color: tokenBrand.main,
    steps: [
      createChangeoverOperatorStep('Pre Changeover', {
        stepName: 'Separate tools and materials',
        stepDescription: 'Gather the required tools, components, labels, and materials before line clearance starts.',
        duration: '5',
        ppeRequired: true,
        requiredPpe: ['Safety Glasses'],
        toolsRequired: true,
        requiredTools: ['Allen Key Set'],
      }),
      createChangeoverOperatorStep('Line Clearance', {
        stepName: 'Remove previous product',
        stepDescription: 'Clear WIP, finished product, and obsolete packaging from the operator zone.',
        duration: '7',
        imageRequired: true,
      }),
      createChangeoverOperatorStep('Ramp Up & Adjustments', {
        stepName: 'Adjust initial parameters',
        stepDescription: 'Support the first ramp-up checks and adjust basic operator parameters while rejects are monitored.',
        duration: '5',
        machineCondition: 'Running',
      }),
    ],
  },
  {
    id: 'changeover-operator-2',
    name: 'Operator 2',
    initials: 'O2',
    role: 'Operator',
    functionLabel: 'Support operator',
    color: tokenSuccess.main,
    steps: [
      createChangeoverOperatorStep('Pre Changeover', {
        stepName: 'Check change parts',
        stepDescription: 'Confirm the change parts and components are available and match the next SKU.',
        duration: '5',
        toolsRequired: true,
        requiredTools: ['Caliper'],
      }),
      createChangeoverOperatorStep('Line Down Changeover', {
        stepName: 'Support part replacement',
        stepDescription: 'Assist with the part swap and keep removed components organized for inspection.',
        duration: '8',
      }),
    ],
  },
];

const mockExcelRoutines: MockExcelRoutine[] = [
  {
    id: 'excel-routine-cleaning-filler',
    title: 'Clean and Inspect Filler Nozzle Area - Line 1',
    sourceSheet: 'CIL_Line_1',
    confidence: '96%',
    category: 'CIL',
    location: 'Line 1 / Filling Zone',
    equipment: 'Filler 01',
    component: 'Nozzle plate and drip tray',
    duration: '18',
    frequencyConfig: {
      ...createFrequencyConfigForType('Per Shift'),
      startDate: '2026-05-11',
      selectedShifts: ['morning', 'afternoon', 'night'],
      startTime: '06:00',
      shiftTimes: { morning: '06:00', afternoon: '14:00', night: '22:00' },
      times: ['06:00', '14:00', '22:00'],
      timezone: 'America/New_York',
    },
    steps: [
      {
        stepName: 'Prepare the filler area for cleaning',
        stepDescription: 'Stop the filler at the normal cleaning position, confirm the area is clear, and place the cleaning kit on the stainless work surface.',
        type: 'Inspection',
        duration: '3',
        machineCondition: 'Stopped',
        attachments: [],
        imageRequired: true,
        ppeRequired: true,
        requiredPpe: ['Safety Glasses', 'Protective Gloves'],
        toolsRequired: true,
        requiredTools: ['Cleaning Kit'],
      },
      {
        stepName: 'Remove residue from nozzle tips',
        stepDescription: 'Wipe each nozzle tip from top to bottom using approved lint-free wipes until no visible product residue remains.',
        type: 'Cleaning',
        duration: '6',
        machineCondition: 'Stopped',
        attachments: [],
        imageRequired: true,
        ppeRequired: true,
        requiredPpe: ['Safety Glasses', 'Protective Gloves'],
        toolsRequired: true,
        requiredTools: ['Cleaning Kit'],
      },
      {
        stepName: 'Clean drip tray and splash guard',
        stepDescription: 'Remove debris from the drip tray, clean the splash guard corners, and verify that the drain path is unobstructed.',
        type: 'Cleaning',
        duration: '5',
        machineCondition: 'Stopped',
        attachments: [],
        imageRequired: true,
        ppeRequired: true,
        requiredPpe: ['Protective Gloves'],
        toolsRequired: true,
        requiredTools: ['Cleaning Kit'],
      },
      {
        stepName: 'Inspect nozzle seals after cleaning',
        stepDescription: 'Check each nozzle seal for swelling, cracks, or looseness and report any abnormal condition before releasing the equipment.',
        type: 'Inspection',
        duration: '4',
        machineCondition: 'Stopped',
        attachments: [],
        imageRequired: false,
        ppeRequired: true,
        requiredPpe: ['Safety Glasses', 'Protective Gloves'],
        toolsRequired: false,
        requiredTools: [],
      },
    ],
  },
  {
    id: 'excel-routine-conveyor-photoeye',
    title: 'Clean Conveyor Photoeye Lenses - Zone 2',
    sourceSheet: 'CIL_Sensors',
    confidence: '91%',
    category: 'CIL',
    location: 'Line 1 / Conveyor Zone 2',
    equipment: 'Conveyor 02',
    component: 'Photoeye lens housings',
    duration: '12',
    frequencyConfig: {
      ...createFrequencyConfigForType('Daily'),
      startDate: '2026-05-11',
      startTime: '08:00',
      timezone: 'America/New_York',
    },
    steps: [
      {
        stepName: 'Inspect photoeye lens condition',
        stepDescription: 'Check the emitter and receiver lenses for dust, adhesive buildup, or misalignment before cleaning.',
        type: 'Inspection',
        duration: '3',
        machineCondition: 'Running',
        attachments: [],
        imageRequired: false,
        ppeRequired: true,
        requiredPpe: ['Safety Glasses'],
        toolsRequired: false,
        requiredTools: [],
      },
      {
        stepName: 'Clean lens housings',
        stepDescription: 'Use an approved wipe to clean both lens housings and avoid changing the sensor bracket position.',
        type: 'Cleaning',
        duration: '5',
        machineCondition: 'Running',
        attachments: [],
        imageRequired: true,
        ppeRequired: true,
        requiredPpe: ['Safety Glasses', 'Protective Gloves'],
        toolsRequired: true,
        requiredTools: ['Cleaning Kit'],
      },
      {
        stepName: 'Verify sensor response',
        stepDescription: 'Pass a test part through the detection point and confirm the sensor indicator changes state consistently.',
        type: 'Inspection',
        duration: '4',
        machineCondition: 'Running',
        attachments: [],
        imageRequired: false,
        ppeRequired: true,
        requiredPpe: ['Safety Glasses'],
        toolsRequired: false,
        requiredTools: [],
      },
    ],
  },
  {
    id: 'excel-routine-cartoner-glue',
    title: 'Clean Cartoner Glue Nozzle Tips',
    sourceSheet: 'Packaging_CIL',
    confidence: '88%',
    category: 'CIL',
    location: 'Packaging / Cartoner',
    equipment: 'Cartoner 01',
    component: 'Hot melt glue nozzle tips',
    duration: '16',
    frequencyConfig: {
      ...createFrequencyConfigForType('Weekly'),
      startDate: '2026-05-11',
      weekDays: ['mon', 'thu'],
      startTime: '09:00',
      timezone: 'America/New_York',
    },
    steps: [
      {
        stepName: 'Make the glue station safe',
        stepDescription: 'Confirm the glue station is in maintenance mode and wait until the nozzle guard can be handled safely.',
        type: 'Inspection',
        duration: '4',
        machineCondition: 'Stopped',
        attachments: [],
        imageRequired: false,
        ppeRequired: true,
        requiredPpe: ['Safety Glasses', 'Protective Gloves', 'Face Shield'],
        toolsRequired: false,
        requiredTools: [],
      },
      {
        stepName: 'Remove charred glue buildup',
        stepDescription: 'Clean the outside of each glue nozzle tip and remove charred adhesive without scratching the nozzle surface.',
        type: 'Cleaning',
        duration: '8',
        machineCondition: 'Stopped',
        attachments: [],
        imageRequired: true,
        ppeRequired: true,
        requiredPpe: ['Safety Glasses', 'Protective Gloves', 'Face Shield'],
        toolsRequired: true,
        requiredTools: ['Cleaning Kit'],
      },
      {
        stepName: 'Confirm clean glue pattern',
        stepDescription: 'Run a controlled test shot and verify that the glue pattern is even, centered, and free of strings.',
        type: 'Inspection',
        duration: '4',
        machineCondition: 'Running',
        attachments: [],
        imageRequired: true,
        ppeRequired: true,
        requiredPpe: ['Safety Glasses'],
        toolsRequired: false,
        requiredTools: [],
      },
    ],
  },
];

const reorderItemsById = <T extends { id: string },>(items: T[], sourceId: string, targetId: string): T[] => {
  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return items;
  const next = [...items];
  const [movedItem] = next.splice(sourceIndex, 1);
  next.splice(targetIndex, 0, movedItem);
  return next;
};

const initialActivities: ManagedActivity[] = [
  { id: 'act-1', title: 'Inspect lubrication points - Line A', category: 'CIL', location: 'Line A / Zone 1', equipment: 'Filler 01', component: 'Lubrication manifold', nextDate: '2026-05-11', nextShift: 'Shift 1', lastOccurrence: '2026-05-01', frequency: 'Per Shift', duration: '15' },
  { id: 'act-2', title: 'Clean sensor housing - Zone 2', category: 'CIL', location: 'Line A / Zone 2', equipment: 'Conveyor 02', component: 'Photoeye housing', nextDate: '2026-05-11', nextShift: 'Shift 2', lastOccurrence: '2026-05-03', frequency: 'Per Shift', duration: '12' },
  { id: 'act-3', title: 'Tighten guard fasteners - Filler 04', category: 'CIL', location: 'Line B / Filler 04', equipment: 'Filler 04', component: 'Guard fasteners', nextDate: '2026-05-11', nextShift: 'Shift 1', lastOccurrence: '2026-05-04', frequency: 'Weekly', duration: '20' },
  { id: 'act-4', title: 'Visual check for oil leaks - Conveyor 2', category: 'CIL', location: 'Line B / Conveyor 2', equipment: 'Conveyor 2', component: 'Gearbox seal', nextDate: '2026-05-11', nextShift: 'Shift 3', lastOccurrence: '2026-05-05', frequency: 'Per Shift', duration: '10' },
  { id: 'act-5', title: 'Validate centerline width - Press 3', category: 'Centerline', location: 'Press Area / Press 3', equipment: 'Press 3', component: 'Width gauge', nextDate: '2026-05-12', nextShift: 'Shift 1', lastOccurrence: '2026-05-02', frequency: 'Weekly', duration: '8' },
  { id: 'act-6', title: 'Confirm baseline alignment - Sealer', category: 'Centerline', location: 'Packaging / Sealer 2', equipment: 'Sealer 2', component: 'Alignment gauge', nextDate: '2026-05-12', nextShift: 'Shift 2', lastOccurrence: '2026-05-07', frequency: 'Biweekly', duration: '14' },
  { id: 'act-7', title: 'SKU A to SKU B setup checklist', category: 'Changeover', location: 'Line 12', equipment: 'Line 12 Main', nextDate: '2026-05-11', nextShift: 'Shift 2', lastOccurrence: '2026-05-01', frequency: 'N/A', duration: '35' },
  { id: 'act-8', title: 'Tooling swap readiness - Line 12', category: 'Changeover', location: 'Line 12', equipment: 'Line 12 Main', nextDate: '2026-05-12', nextShift: 'Shift 3', lastOccurrence: '2026-05-04', frequency: 'N/A', duration: '28' },
  { id: 'act-9', title: 'Adjust centerline guide - Cell B', category: 'Centerline', location: 'Assembly / Cell B', equipment: 'Cell B', component: 'Guide rail', nextDate: '2026-05-12', nextShift: 'Shift 2', lastOccurrence: '2026-05-06', frequency: 'Daily', duration: '9' },
  { id: 'act-10', title: 'Inspect air knife manifold - Line A', category: 'CIL', location: 'Line A / Zone 3', equipment: 'Air Knife 03', component: 'Air manifold', nextDate: '2026-05-13', nextShift: 'Shift 1', lastOccurrence: '2026-05-06', frequency: 'Daily', duration: '11' },
  { id: 'act-11', title: 'Check reject bin sensor - Zone 4', category: 'CIL', location: 'Line B / Zone 4', equipment: 'Reject Bin 04', component: 'Reject sensor', nextDate: '2026-05-13', nextShift: 'Shift 2', lastOccurrence: '2026-05-07', frequency: 'Per Shift', duration: '6' },
  { id: 'act-12', title: 'Verify press ram home position', category: 'Centerline', location: 'Press Area / Press 2', equipment: 'Press 2', component: 'Ram encoder', nextDate: '2026-05-13', nextShift: 'Shift 1', lastOccurrence: '2026-05-05', frequency: 'Weekly', duration: '13' },
  { id: 'act-13', title: 'Confirm vision camera baseline', category: 'Centerline', location: 'Line C / Vision Cell', equipment: 'Vision Camera 01', component: 'Camera lens', nextDate: '2026-05-14', nextShift: 'Shift 3', lastOccurrence: '2026-05-08', frequency: 'Weekly', duration: '10' },
  { id: 'act-14', title: 'Line 8 product format change', category: 'Changeover', location: 'Line 8', equipment: 'Line 8 Main', nextDate: '2026-05-14', nextShift: 'Shift 2', lastOccurrence: '2026-05-08', frequency: 'N/A', duration: '42' },
  { id: 'act-15', title: 'Needle nest plate swap', category: 'Changeover', location: 'Line 5', equipment: 'Nest Plate Station', nextDate: '2026-05-15', nextShift: 'Shift 1', lastOccurrence: '2026-05-09', frequency: 'N/A', duration: '31' },
  { id: 'act-16', title: 'Clean glue nozzle tips - Cartoner', category: 'CIL', location: 'Packaging / Cartoner', equipment: 'Cartoner 01', component: 'Glue nozzle', nextDate: '2026-05-15', nextShift: 'Shift 2', lastOccurrence: '2026-05-09', frequency: 'Daily', duration: '7' },
  { id: 'act-17', title: 'Set labeler pressure centerline', category: 'Centerline', location: 'Line D / Labeler', equipment: 'Labeler 02', component: 'Pressure regulator', nextDate: '2026-05-16', nextShift: 'Shift 1', lastOccurrence: '2026-05-10', frequency: 'Per Shift', duration: '8' },
  { id: 'act-18', title: 'Packaging rail width changeover', category: 'Changeover', location: 'Packaging / Rail Set', equipment: 'Packaging Rail 02', nextDate: '2026-05-16', nextShift: 'Shift 3', lastOccurrence: '2026-05-10', frequency: 'N/A', duration: '26' },
];

const formatDateMmDdYyyy = (isoDate: string): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${month}/${day}/${year}`;
};

const referenceTodayIso = '2026-05-11';
const activityPageSize = 9;
const shiftOrder: RescheduleShift[] = ['Shift 1', 'Shift 2', 'Shift 3'];
const occurrenceTimeOptions = Array.from({ length: 48 }, (_, index) => {
  const hour = Math.floor(index / 2);
  const minute = index % 2 === 0 ? '00' : '30';
  return `${String(hour).padStart(2, '0')}:${minute}`;
});
const occurrenceAssignees = ['John Smith', 'Maria Garcia', 'Alex Johnson'];

const pageCardSx = {
  borderRadius: '12px',
  border: `1px solid ${tokenDivider}`,
  bgcolor: 'background.paper',
  boxShadow: 'none',
} as const;

const assistantPanelSx = {
  width: '100%',
  p: 2,
  borderRadius: '12px',
  border: 'none',
  bgcolor: tokenNeutral.lightest,
  mb: 1.2,
} as const;

const sectionTitleSx = {
  color: tokenBrand.main,
  fontSize: '0.875rem',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: 0,
} as const;

const outlinedActionSx = {
  borderRadius: '8px',
  borderColor: tokenDivider,
  color: tokenText.primary,
  fontWeight: 700,
  textTransform: 'none',
} as const;

const containedActionSx = {
  borderRadius: '8px',
  bgcolor: `${tokenBrand.main} !important`,
  color: `${tokenBrand.contrast} !important`,
  fontWeight: 700,
  textTransform: 'none',
  boxShadow: 'none',
  '&:hover': { bgcolor: `${tokenBrand.dark} !important`, boxShadow: 'none' },
} as const;

const getCategoryTone = (category: ActivityType): { bg: string; color: string; border: string } => {
  if (category === 'CIL') return { bg: tokenBrand.softBg, color: tokenBrand.main, border: tokenBrand.lightest };
  if (category === 'Centerline') return { bg: tokenInfo.softBg, color: tokenInfo.darker, border: tokenInfo.lightest };
  return { bg: tokenWarning.softBg, color: tokenWarning.dark, border: tokenWarning.lighter };
};

const getOccurrenceStatusTone = (status: OccurrenceStatus): { bg: string; color: string; border: string } => {
  if (status === 'Completed') return { bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenSuccess.lighter };
  if (status === 'Overdue') return { bg: tokenError.softBg, color: tokenError.dark, border: tokenError.lighter };
  if (status === 'Skipped') return { bg: tokenNeutral.lighter, color: tokenText.secondary, border: tokenDivider };
  return { bg: tokenBrand.softBg, color: tokenBrand.main, border: tokenBrand.lightest };
};

const changeoverOperatorStatusOrder: ChangeoverOperatorStatus[] = ['Pending', 'Running', 'Waiting Review', 'Done'];

const getChangeoverOperatorStatusTone = (status: ChangeoverOperatorStatus): { bg: string; color: string; border: string } => {
  if (status === 'Done') return getOccurrenceStatusTone('Completed');
  if (status === 'Waiting Review') return getOccurrenceStatusTone('Skipped');
  return getOccurrenceStatusTone('Pending');
};

const getShiftMeta = (shift: RescheduleShift): { label: string; window: string; defaultTime: string; icon: 'sun' | 'moon' } => {
  if (shift === 'Shift 2') return { label: 'Afternoon', window: '14:00 - 22:00', defaultTime: '14:00', icon: 'sun' };
  if (shift === 'Shift 3') return { label: 'Night', window: '22:00 - 06:00', defaultTime: '22:00', icon: 'moon' };
  return { label: 'Morning', window: '06:00 - 14:00', defaultTime: '06:00', icon: 'sun' };
};

const getShiftFromTime = (time: string): RescheduleShift => {
  const hour = Number.parseInt(time.split(':')[0] ?? '', 10);
  if (!Number.isFinite(hour)) return 'Shift 1';
  if (hour >= 14 && hour < 22) return 'Shift 2';
  if (hour >= 22 || hour < 6) return 'Shift 3';
  return 'Shift 1';
};

const addDaysToIso = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const addMonthsToIso = (isoDate: string, months: number): string => {
  const date = new Date(`${isoDate}T12:00:00`);
  const sourceDay = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + months);
  const monthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(sourceDay, monthLastDay));
  return date.toISOString().slice(0, 10);
};

const setIsoDayOfMonth = (isoDate: string, day: string): string => {
  const parsedDay = Math.max(1, Math.min(31, Number.parseInt(day, 10) || 1));
  const date = new Date(`${isoDate}T12:00:00`);
  const monthLastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(parsedDay, monthLastDay));
  return date.toISOString().slice(0, 10);
};

const weekdayIndexById: Record<FrequencyWeekdayId, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const parsePositiveInteger = (value: string, fallback: number): number => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const formatOccurrenceDateLabel = (isoDate: string): string => {
  const date = new Date(`${isoDate}T12:00:00`);
  const monthDayYear = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  if (isoDate === referenceTodayIso) return `Today, ${monthDayYear}`;
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).format(date);
};

const buildFrequencyDates = (config: FrequencyConfig, baseDate: string, count: number): string[] => {
  const repeatEvery = parsePositiveInteger(config.repeatEvery, 1);
  if (config.repeatUnit === 'week') {
    const selectedWeekdays = (config.weekDays.length ? config.weekDays : ['mon']).map((day) => weekdayIndexById[day]);
    const startDate = new Date(`${baseDate}T12:00:00`);
    const dates: string[] = [];
    for (let dayOffset = 0; dates.length < count && dayOffset < 730; dayOffset += 1) {
      const candidate = new Date(startDate);
      candidate.setDate(startDate.getDate() + dayOffset);
      const weeksSinceStart = Math.floor(dayOffset / 7);
      if (weeksSinceStart % repeatEvery === 0 && selectedWeekdays.includes(candidate.getDay())) {
        dates.push(candidate.toISOString().slice(0, 10));
      }
    }
    return dates.length ? dates : Array.from({ length: count }, (_, index) => addDaysToIso(baseDate, index * repeatEvery * 7));
  }

  if (config.repeatUnit === 'month') {
    return Array.from({ length: count }, (_, index) => {
      const date = addMonthsToIso(baseDate, index * repeatEvery);
      return config.monthlyMode === 'day' ? setIsoDayOfMonth(date, config.monthlyDay) : date;
    });
  }

  if (config.repeatUnit === 'year') {
    return Array.from({ length: count }, (_, index) => {
      const date = new Date(`${baseDate}T12:00:00`);
      date.setFullYear(date.getFullYear() + (index * repeatEvery));
      date.setMonth((Number.parseInt(config.annualMonth, 10) || 1) - 1);
      return setIsoDayOfMonth(date.toISOString().slice(0, 10), config.annualDay);
    });
  }

  if (config.repeatUnit === 'hour') {
    return Array.from({ length: count }, (_, index) => addDaysToIso(baseDate, Math.floor(index / Math.max(1, Math.floor(24 / repeatEvery)))));
  }

  return Array.from({ length: count }, (_, index) => addDaysToIso(baseDate, index * repeatEvery));
};

const createOccurrencesForActivity = (activity: ManagedActivity): ManagedOccurrence[] => {
  if (activity.category === 'Changeover') {
    return [{
      id: `${activity.id}-occ-1`,
      activityId: activity.id,
      date: activity.nextDate || referenceTodayIso,
      time: getShiftMeta(activity.nextShift).defaultTime,
      shift: activity.nextShift,
      status: 'Pending',
      assignedTo: '',
    }];
  }

  const config = activity.frequencyConfig
    ? cloneFrequencyConfig(activity.frequencyConfig)
    : { ...createFrequencyConfigFromSummary(activity.frequency), startDate: activity.nextDate || referenceTodayIso };
  const baseDate = activity.id === 'act-1' ? referenceTodayIso : config.startDate || activity.nextDate || referenceTodayIso;
  const occurrenceCount = config.endMode === 'after'
    ? Math.min(20, parsePositiveInteger(config.endOccurrences, 6))
    : config.frequency === 'Per Shift'
      ? 8
      : 6;
  const frequencyDates = buildFrequencyDates(config, baseDate, occurrenceCount);
  const frequencyTimes = config.timeMode === 'multiple' && config.times.length ? config.times : [config.startTime || '08:00'];
  const configuredShifts = config.selectedShifts
    .map((shiftId) => FREQUENCY_SHIFT_OPTIONS.find((shift) => shift.id === shiftId)?.shift)
    .filter(Boolean) as RescheduleShift[];
  const shiftCycle = configuredShifts.length ? configuredShifts : shiftOrder;

  return Array.from({ length: occurrenceCount }, (_, index) => {
    const shift = config.frequency === 'Per Shift'
      ? shiftCycle[index % shiftCycle.length]
      : activity.nextShift;
    const shiftMeta = getShiftMeta(shift);
    const dateIndex = config.frequency === 'Per Shift'
      ? Math.floor(index / shiftCycle.length)
      : Math.floor(index / frequencyTimes.length);
    const time = config.frequency === 'Per Shift'
      ? getShiftTimeFromFrequencyConfig(config, shift, shiftMeta.defaultTime)
      : frequencyTimes[index % frequencyTimes.length] || config.startTime || shiftMeta.defaultTime;

    return {
      id: `${activity.id}-occ-${index + 1}`,
      activityId: activity.id,
      date: config.frequency === 'Per Shift' ? addDaysToIso(baseDate, dateIndex) : (frequencyDates[dateIndex] ?? baseDate),
      time,
      shift,
      status: index === 5 && activity.category === 'Changeover' ? 'Overdue' : 'Pending',
      assignedTo: occurrenceAssignees[index % occurrenceAssignees.length],
    };
  });
};

const createInitialOccurrences = (activities: ManagedActivity[]): Record<string, ManagedOccurrence[]> =>
  activities.reduce((acc, activity) => {
    acc[activity.id] = createOccurrencesForActivity(activity);
    return acc;
  }, {} as Record<string, ManagedOccurrence[]>);

const getAssignmentRoleTone = (role: AssignmentRole): { bg: string; color: string; border: string } => {
  if (role === 'Technician') return { bg: tokenWarning.softBg, color: tokenWarning.dark, border: tokenWarning.lighter };
  if (role === 'Maintenance') return { bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenSuccess.lighter };
  return { bg: tokenBrand.softBg, color: tokenBrand.main, border: tokenBrand.lightest };
};

const getAssignmentStep = (stepId: ChangeoverAssignmentStepId): ChangeoverAssignmentStep =>
  changeoverAssignmentSteps.find((step) => step.id === stepId) ?? changeoverAssignmentSteps[0];

const getAssignmentTask = (taskId: string): ChangeoverAssignmentTask | undefined =>
  changeoverAssignmentTasks.find((task) => task.id === taskId);

const getDependencyTypeLabel = (type: DependencyType): string => {
  if (type === 'SS') return 'Start -> Start (SS)';
  if (type === 'FF') return 'Finish -> Finish (FF)';
  if (type === 'SF') return 'Start -> Finish (SF)';
  return 'Finish -> Start (FS)';
};

const getDependencyStatusTone = (status: DependencyTaskStatus): { color: string; bg: string; border: string; label: string } => {
  if (status === 'completed') return { color: tokenSuccess.darker, bg: tokenSuccess.softBg, border: tokenSuccess.lighter, label: 'Completed' };
  if (status === 'assigned') return { color: tokenWarning.dark, bg: tokenWarning.softBg, border: tokenWarning.lighter, label: 'In progress / Assigned' };
  if (status === 'not-started') return { color: tokenText.secondary, bg: tokenNeutral.lightest, border: tokenDivider, label: 'Not started' };
  return { color: tokenText.secondary, bg: 'background.paper', border: tokenDivider, label: 'Not assigned' };
};

const ManageTasksScreen: React.FC = () => {
  const [managedActivities, setManagedActivities] = useState<ManagedActivity[]>(initialActivities);
  const [activityOccurrences, setActivityOccurrences] = useState<Record<string, ManagedOccurrence[]>>(() => createInitialOccurrences(initialActivities));
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(initialActivities[0]?.id ?? null);
  const [activityPage, setActivityPage] = useState(1);
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ActivityType>('CIL');
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  const [activityName, setActivityName] = useState('');
  const [location, setLocation] = useState('Line 1');
  const [equipment, setEquipment] = useState('');
  const [activityComponent, setActivityComponent] = useState('');
  const [frequencyConfig, setFrequencyConfig] = useState<FrequencyConfig>(createDefaultFrequencyConfig());
  const [duration, setDuration] = useState('15');
  const [changeoverFrom, setChangeoverFrom] = useState('');
  const [changeoverTo, setChangeoverTo] = useState('');

  const [cilSteps, setCilSteps] = useState<CILStep[]>([createCilStep()]);
  const [centerlineParameters, setCenterlineParameters] = useState<CenterlineParameter[]>([createCenterlineParameter()]);
  const [changeoverViewMode, setChangeoverViewMode] = useState<ChangeoverStepViewMode>('operator');
  const [selectedChangeoverOperatorId, setSelectedChangeoverOperatorId] = useState('changeover-operator-1');
  const [changeoverOperatorRoutines, setChangeoverOperatorRoutines] = useState<ChangeoverOperatorRoutine[]>(() => createDefaultChangeoverOperatorRoutines());
  const [draggedStep, setDraggedStep] = useState<StepDragState | null>(null);
  const [dragOverStep, setDragOverStep] = useState<StepDragState | null>(null);

  const [actionsAnchorEl, setActionsAnchorEl] = useState<null | HTMLElement>(null);
  const [actionsActivityId, setActionsActivityId] = useState<string | null>(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [groupAnchorEl, setGroupAnchorEl] = useState<null | HTMLElement>(null);
  const [uploadMenuAnchorEl, setUploadMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [excelImportOpen, setExcelImportOpen] = useState(false);
  const [excelImportStage, setExcelImportStage] = useState<ExcelImportStage>('upload');
  const [excelFileName, setExcelFileName] = useState('');
  const [selectedExcelRoutineId, setSelectedExcelRoutineId] = useState(mockExcelRoutines[0].id);
  const [importAppliedMessage, setImportAppliedMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'All'>('All');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('All');
  const [nextDateFilter, setNextDateFilter] = useState('');
  const [groupBy, setGroupBy] = useState<ActivityGroupBy>('Type');
  const [visibleOccurrenceCount, setVisibleOccurrenceCount] = useState(5);

  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleActivityId, setRescheduleActivityId] = useState<string | null>(null);
  const [rescheduleOccurrenceId, setRescheduleOccurrenceId] = useState<string | null>(null);
  const [rescheduleCurrentDate, setRescheduleCurrentDate] = useState('');
  const [rescheduleCurrentTime, setRescheduleCurrentTime] = useState('');
  const [rescheduleCurrentShift, setRescheduleCurrentShift] = useState<RescheduleShift>('Shift 1');
  const [rescheduleNewDate, setRescheduleNewDate] = useState('');
  const [rescheduleNewTime, setRescheduleNewTime] = useState('');
  const [rescheduleNewShift, setRescheduleNewShift] = useState<RescheduleShift>('Shift 1');
  const [rescheduleJustification, setRescheduleJustification] = useState('');
  const [addOccurrenceDialogOpen, setAddOccurrenceDialogOpen] = useState(false);
  const [addOccurrenceActivityId, setAddOccurrenceActivityId] = useState<string | null>(null);
  const [addOccurrenceDate, setAddOccurrenceDate] = useState('');
  const [addOccurrenceTime, setAddOccurrenceTime] = useState('');
  const [addOccurrenceShift, setAddOccurrenceShift] = useState<RescheduleShift>('Shift 1');

  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [assignmentActivityId, setAssignmentActivityId] = useState<string | null>(null);
  const [assignmentOccurrenceId, setAssignmentOccurrenceId] = useState<string | null>(null);
  const [savedChangeoverAssignments, setSavedChangeoverAssignments] = useState<Record<string, string>>(initialChangeoverAssignments);
  const [savedChangeoverAssignmentsByOccurrence, setSavedChangeoverAssignmentsByOccurrence] = useState<Record<string, Record<string, string>>>({});
  const [expandedChangeoverOccurrences, setExpandedChangeoverOccurrences] = useState<Record<string, boolean>>({});
  const [changeoverOccurrenceOperatorAssignees, setChangeoverOccurrenceOperatorAssignees] = useState<Record<string, Record<string, string>>>({});
  const [changeoverOccurrenceOperatorStatuses, setChangeoverOccurrenceOperatorStatuses] = useState<Record<string, Record<string, ChangeoverOperatorStatus>>>({});
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, string>>(initialChangeoverAssignments);
  const [assignmentSearchQuery, setAssignmentSearchQuery] = useState('');
  const [expandedAssignmentSteps, setExpandedAssignmentSteps] = useState<Record<ChangeoverAssignmentStepId, boolean>>(createExpandedStepState(true));
  const [fullyVisibleAssignmentSteps, setFullyVisibleAssignmentSteps] = useState<Record<ChangeoverAssignmentStepId, boolean>>(createExpandedStepState(false));
  const [assignmentModalTab, setAssignmentModalTab] = useState<AssignmentModalTab>('tasks');
  const [savedChangeoverDependencies, setSavedChangeoverDependencies] = useState<ChangeoverDependency[]>(initialChangeoverDependencies);
  const [dependencyDrafts, setDependencyDrafts] = useState<ChangeoverDependency[]>(initialChangeoverDependencies);
  const [dependencyViewMode, setDependencyViewMode] = useState<DependencyViewMode>('flow');
  const [showDependencyLegend, setShowDependencyLegend] = useState(true);
  const [expandedDependencySteps, setExpandedDependencySteps] = useState<Record<ChangeoverAssignmentStepId, boolean>>(createExpandedStepState(true));
  const [dependencyFromTaskId, setDependencyFromTaskId] = useState('co-1-1');
  const [dependencyToTaskId, setDependencyToTaskId] = useState('co-2-1');
  const [dependencyType, setDependencyType] = useState<DependencyType>('FS');
  const [timelineZoom, setTimelineZoom] = useState(100);
  const [selectedDependencyTaskId, setSelectedDependencyTaskId] = useState<string | null>(null);

  const selectedActivity = useMemo(() => managedActivities.find((item) => item.id === actionsActivityId) ?? null, [managedActivities, actionsActivityId]);
  const assignmentActivity = useMemo(() => managedActivities.find((item) => item.id === assignmentActivityId) ?? null, [managedActivities, assignmentActivityId]);
  const assignmentOccurrence = useMemo(
    () => (assignmentActivityId && assignmentOccurrenceId
      ? activityOccurrences[assignmentActivityId]?.find((occurrence) => occurrence.id === assignmentOccurrenceId) ?? null
      : null),
    [activityOccurrences, assignmentActivityId, assignmentOccurrenceId],
  );
  const selectedExcelRoutine = useMemo(
    () => mockExcelRoutines.find((routine) => routine.id === selectedExcelRoutineId) ?? mockExcelRoutines[0],
    [selectedExcelRoutineId],
  );
  const selectedChangeoverOperator = useMemo(
    () => changeoverOperatorRoutines.find((operator) => operator.id === selectedChangeoverOperatorId) ?? changeoverOperatorRoutines[0] ?? null,
    [changeoverOperatorRoutines, selectedChangeoverOperatorId],
  );
  const changeoverOccurrenceAssigneeOptions = useMemo(
    () => Array.from(new Set([
      ...occurrenceAssignees,
      ...changeoverOperators.map((operator) => operator.name),
    ])),
    [],
  );
  const changeoverOperatorStats = useMemo(
    () => changeoverOperatorRoutines.map((operator) => {
      const totalMinutes = operator.steps.reduce((sum, step) => sum + getStepDurationMinutes(step.duration), 0);
      return {
        operatorId: operator.id,
        totalMinutes,
        totalSteps: operator.steps.length,
        phaseCount: new Set(operator.steps.map((step) => step.phase)).size,
      };
    }),
    [changeoverOperatorRoutines],
  );
  const changeoverStageGroups = useMemo(
    () => changeoverPhases.map((phase) => {
      const steps = changeoverOperatorRoutines.flatMap((operator) => (
        operator.steps
          .map((step, index) => ({ operator, step, index }))
          .filter((item) => item.step.phase === phase)
      ));
      const totalMinutes = steps.reduce((sum, item) => sum + getStepDurationMinutes(item.step.duration), 0);
      return { phase, steps, totalMinutes };
    }),
    [changeoverOperatorRoutines],
  );
  const operatorById = useMemo(() => new Map(changeoverOperators.map((operator) => [operator.id, operator])), []);
  const assignmentStats = useMemo(() => {
    const assigned = changeoverAssignmentTasks.filter((task) => Boolean(assignmentDrafts[task.id])).length;
    return {
      total: changeoverAssignmentTasks.length,
      assigned,
      unassigned: changeoverAssignmentTasks.length - assigned,
    };
  }, [assignmentDrafts]);
  const visibleAssignmentStepGroups = useMemo(() => {
    const normalizedSearch = assignmentSearchQuery.trim().toLowerCase();
    return changeoverAssignmentSteps
      .map((step) => {
        const stepTasks = changeoverAssignmentTasks.filter((task) => task.stepId === step.id);
        const matchingTasks = normalizedSearch
          ? stepTasks.filter((task) => (
            task.code.toLowerCase().includes(normalizedSearch)
            || task.task.toLowerCase().includes(normalizedSearch)
            || task.description.toLowerCase().includes(normalizedSearch)
            || task.role.toLowerCase().includes(normalizedSearch)
          ))
          : stepTasks;
        const shouldShowAllTasks = Boolean(fullyVisibleAssignmentSteps[step.id]) || Boolean(normalizedSearch);
        const visibleTasks = shouldShowAllTasks ? matchingTasks : matchingTasks.slice(0, step.defaultVisibleTasks);
        return {
          step,
          tasks: matchingTasks,
          visibleTasks,
          remainingTasks: Math.max(matchingTasks.length - visibleTasks.length, 0),
        };
      })
      .filter((group) => group.tasks.length > 0);
  }, [assignmentSearchQuery, fullyVisibleAssignmentSteps]);
  const areAllAssignmentStepsFullyVisible = changeoverAssignmentSteps.every((step) => expandedAssignmentSteps[step.id] && fullyVisibleAssignmentSteps[step.id]);
  const dependencyStatusByTaskId = useMemo(() => {
    const result: Record<string, DependencyTaskStatus> = {};
    changeoverAssignmentTasks.forEach((task) => {
      if (!assignmentDrafts[task.id]) {
        result[task.id] = 'not-assigned';
        return;
      }
      result[task.id] = dependencyTaskStatusSeed[task.id] ?? 'assigned';
    });
    return result;
  }, [assignmentDrafts]);
  const dependencyStepStats = useMemo(() => {
    return changeoverAssignmentSteps.reduce((acc, step) => {
      const stepTasks = changeoverAssignmentTasks.filter((task) => task.stepId === step.id);
      acc[step.id] = {
        completed: stepTasks.filter((task) => dependencyStatusByTaskId[task.id] === 'completed').length,
        assigned: stepTasks.filter((task) => dependencyStatusByTaskId[task.id] === 'assigned').length,
        notStarted: stepTasks.filter((task) => dependencyStatusByTaskId[task.id] === 'not-started').length,
        notAssigned: stepTasks.filter((task) => dependencyStatusByTaskId[task.id] === 'not-assigned').length,
      };
      return acc;
    }, {} as Record<ChangeoverAssignmentStepId, { completed: number; assigned: number; notStarted: number; notAssigned: number }>);
  }, [dependencyStatusByTaskId]);
  const equipmentOptions = useMemo(
    () => ['All', ...Array.from(new Set(managedActivities.map((item) => item.equipment))).sort((a, b) => a.localeCompare(b))],
    [managedActivities],
  );
  const filteredActivities = useMemo(
    () =>
      managedActivities.filter((item) => {
        const normalizedSearch = searchQuery.trim().toLowerCase();
        const matchesSearch = !normalizedSearch
          || item.title.toLowerCase().includes(normalizedSearch)
          || item.location.toLowerCase().includes(normalizedSearch)
          || item.equipment.toLowerCase().includes(normalizedSearch)
          || (item.component ?? '').toLowerCase().includes(normalizedSearch);
        const matchesType = typeFilter === 'All' || item.category === typeFilter;
        const matchesEquipment = equipmentFilter === 'All' || item.equipment === equipmentFilter;
        const matchesNextDate = !nextDateFilter || item.nextDate === nextDateFilter;
        return matchesSearch && matchesType && matchesEquipment && matchesNextDate;
      }),
    [managedActivities, searchQuery, typeFilter, equipmentFilter, nextDateFilter],
  );
  const orderedActivities = useMemo(() => {
    const typeRank: Record<ActivityType, number> = { CIL: 0, Centerline: 1, Changeover: 2 };
    const groupValue = (activity: ManagedActivity): string => {
      if (groupBy === 'Frequency') return activity.frequencyConfig?.frequency ?? activity.frequency;
      if (groupBy === 'Location') return activity.location;
      return activity.category;
    };
    return [...filteredActivities].sort((a, b) => {
      if (groupBy === 'Type' && a.category !== b.category) return typeRank[a.category] - typeRank[b.category];
      const groupComparison = groupValue(a).localeCompare(groupValue(b));
      if (groupComparison !== 0) return groupComparison;
      return a.title.localeCompare(b.title);
    });
  }, [filteredActivities, groupBy]);
  const firstFilteredActivityId = orderedActivities[0]?.id ?? null;
  const activityPageCount = Math.max(1, Math.ceil(orderedActivities.length / activityPageSize));
  const currentActivityPage = Math.min(activityPage, activityPageCount);
  const pagedActivities = useMemo(
    () => orderedActivities.slice((currentActivityPage - 1) * activityPageSize, currentActivityPage * activityPageSize),
    [orderedActivities, currentActivityPage],
  );
  const selectedActivityForView = useMemo(
    () => orderedActivities.find((item) => item.id === selectedActivityId) ?? orderedActivities[0] ?? managedActivities[0] ?? null,
    [orderedActivities, selectedActivityId, managedActivities],
  );
  const selectedOccurrences = useMemo(
    () => (selectedActivityForView ? activityOccurrences[selectedActivityForView.id] ?? [] : []),
    [activityOccurrences, selectedActivityForView],
  );
  const displayOccurrences = selectedOccurrences;
  const visibleOccurrences = displayOccurrences.slice(0, visibleOccurrenceCount);
  const rescheduleOccurrence = selectedOccurrences.find((occurrence) => occurrence.id === rescheduleOccurrenceId) ?? null;

  useEffect(() => {
    setSelectedActivityId(firstFilteredActivityId);
    setVisibleOccurrenceCount(5);
    setRescheduleDialogOpen(false);
  }, [firstFilteredActivityId, searchQuery, typeFilter, equipmentFilter, nextDateFilter, groupBy]);

  const openExcelImportModal = (): void => {
    setUploadMenuAnchorEl(null);
    setExcelFileName('');
    setSelectedExcelRoutineId(mockExcelRoutines[0].id);
    setExcelImportStage('upload');
    setExcelImportOpen(true);
  };

  const handleMockExcelUpload = (fileName = 'Line_1_CIL_Cleaning_Routines.xlsx'): void => {
    setExcelFileName(fileName);
    setSelectedExcelRoutineId(mockExcelRoutines[0].id);
    setExcelImportStage('routines');
  };

  const handlePlaceholderImportOption = (source: string): void => {
    setUploadMenuAnchorEl(null);
    window.alert(`${source} import is mocked as a placeholder in this prototype. Select Excel to run the full sample flow.`);
  };

  const buildImportedCilStep = (step: Omit<CILStep, 'id'>, index: number): CILStep => ({
    ...step,
    id: `cil-import-${Date.now()}-${index}`,
    attachments: [...step.attachments],
    requiredPpe: [...step.requiredPpe],
    requiredTools: [...step.requiredTools],
  });

  const applyImportedExcelRoutine = (): void => {
    const routine = selectedExcelRoutine;
    setActiveTab(routine.category);
    setEditingActivityId(null);
    setActivityName(routine.title);
    setLocation(routine.location);
    setEquipment(routine.equipment);
    setActivityComponent(routine.component);
    setDuration(routine.duration);
    setChangeoverFrom('');
    setChangeoverTo('');
    setFrequencyConfig(cloneFrequencyConfig(routine.frequencyConfig));
    setCilSteps(routine.steps.map(buildImportedCilStep));
    setCenterlineParameters([createCenterlineParameter()]);
    const nextOperatorRoutines = createDefaultChangeoverOperatorRoutines();
    setChangeoverOperatorRoutines(nextOperatorRoutines);
    setSelectedChangeoverOperatorId(nextOperatorRoutines[0]?.id ?? '');
    setChangeoverViewMode('operator');
    setImportAppliedMessage(`Imported from ${excelFileName || 'Excel mock'}: ${routine.title}`);
    setExcelImportOpen(false);
  };

  const prefillScenarioByType = (activity: ManagedActivity): void => {
    if (activity.category === 'CIL') {
      setCilSteps([
        {
          id: `cil-${Date.now()}-prefill`,
          stepName: `Inspect and execute CIL routine for ${activity.equipment}`,
          stepDescription: `Follow the standard routine for ${activity.title}.`,
          type: 'Inspection',
          duration: activity.duration || '10',
          machineCondition: 'Stopped',
          attachments: [],
          imageRequired: false,
          ppeRequired: false,
          requiredPpe: [],
          toolsRequired: false,
          requiredTools: [],
        },
      ]);
      return;
    }
    if (activity.category === 'Centerline') {
      setCenterlineParameters([
        {
          id: `cl-${Date.now()}-prefill`,
          parameter: `Centerline baseline check - ${activity.equipment}`,
          parameterUnit: '',
          stepName: `Centerline check - ${activity.equipment}`,
          stepDescription: `Verify the baseline parameter range for ${activity.title}.`,
          min: '0',
          target: '0',
          max: '0',
          machineCondition: 'Running',
          attachments: [],
          imageRequired: false,
          ppeRequired: false,
          requiredPpe: [],
          toolsRequired: false,
          requiredTools: [],
        },
      ]);
      return;
    }
    const nextOperatorRoutines = createDefaultChangeoverOperatorRoutines().map((operator, index) => (
      index === 0
        ? {
          ...operator,
          steps: [
            createChangeoverOperatorStep('Pre Changeover', {
              id: `co-${Date.now()}-prefill`,
              stepName: `Prepare changeover for ${activity.equipment}`,
              stepDescription: `Review requirements and stage tools before line clearance for ${activity.title}.`,
              duration: activity.duration || '15',
            }),
          ],
        }
        : operator
    ));
    setChangeoverOperatorRoutines(nextOperatorRoutines);
    setSelectedChangeoverOperatorId(nextOperatorRoutines[0]?.id ?? '');
    setChangeoverViewMode('operator');
  };

  const resetForm = (): void => {
    setActivityName('');
    setLocation('Line 1');
    setEquipment('');
    setActivityComponent('');
    setFrequencyConfig(createDefaultFrequencyConfig());
    setDuration('15');
    setChangeoverFrom('');
    setChangeoverTo('');
    setCilSteps([createCilStep()]);
    setCenterlineParameters([createCenterlineParameter()]);
    const nextOperatorRoutines = createDefaultChangeoverOperatorRoutines();
    setChangeoverOperatorRoutines(nextOperatorRoutines);
    setSelectedChangeoverOperatorId(nextOperatorRoutines[0]?.id ?? '');
    setChangeoverViewMode('operator');
    setImportAppliedMessage('');
  };

  const closeActivityDialog = (): void => {
    setIsActivityDialogOpen(false);
    setUploadMenuAnchorEl(null);
    setExcelImportOpen(false);
    setEditingActivityId(null);
    resetForm();
    setActiveTab('CIL');
  };

  const openCreateDialog = (): void => {
    setEditingActivityId(null);
    setActiveTab('CIL');
    resetForm();
    setIsActivityDialogOpen(true);
  };

  const fillActivityForm = (activity: ManagedActivity): void => {
    setActiveTab(activity.category);
    setActivityName(activity.title);
    setLocation(activity.location);
    setEquipment(activity.equipment);
    setActivityComponent(activity.component ?? '');
    setChangeoverFrom(activity.changeoverFrom ?? '');
    setChangeoverTo(activity.changeoverTo ?? '');
    setFrequencyConfig(activity.frequencyConfig
      ? cloneFrequencyConfig(activity.frequencyConfig)
      : { ...createFrequencyConfigFromSummary(activity.frequency), startDate: activity.nextDate || referenceTodayIso });
    setDuration(activity.duration);
    prefillScenarioByType(activity);
  };

  const openEditDialog = (activity: ManagedActivity): void => {
    setEditingActivityId(activity.id);
    fillActivityForm(activity);
    setIsActivityDialogOpen(true);
  };

  const openDuplicateDialog = (activity: ManagedActivity): void => {
    setEditingActivityId(null);
    fillActivityForm(activity);
    setActivityName(`${activity.title} copy`);
    setIsActivityDialogOpen(true);
  };

  const saveActivity = (): void => {
    const hasMissingCenterlineUnit = centerlineParameters.some((step) => !step.parameterUnit.trim());
    const hasMissingChangeoverCenterlineUnit = changeoverOperatorRoutines.some((operator) => (
      operator.steps.some((step) => step.phase === 'Centerline' && !step.parameterUnit.trim())
    ));
    if ((activeTab === 'Centerline' && hasMissingCenterlineUnit) || (activeTab === 'Changeover' && hasMissingChangeoverCenterlineUnit)) {
      window.alert('Please select the parameter unit for all Centerline steps.');
      return;
    }
    const hasMissingShiftTime = activeTab !== 'Changeover'
      && frequencyConfig.frequency === 'Per Shift'
      && frequencyConfig.selectedShifts.some((shift) => !frequencyConfig.shiftTimes[shift]);
    if (hasMissingShiftTime) {
      window.alert('Please select an activity time for each selected shift.');
      return;
    }
    const now = new Date().toISOString().slice(0, 10);
    const existingActivity = editingActivityId ? managedActivities.find((item) => item.id === editingActivityId) : undefined;
    const preservedShift = existingActivity?.nextShift ?? 'Shift 1';
    const nextFrequencyConfig = activeTab === 'Changeover' ? undefined : cloneFrequencyConfig(frequencyConfig);
    const payload: Omit<ManagedActivity, 'id'> = {
      title: activityName,
      category: activeTab,
      location,
      equipment,
      component: activeTab === 'Changeover' ? '' : activityComponent,
      changeoverFrom: activeTab === 'Changeover' ? changeoverFrom : undefined,
      changeoverTo: activeTab === 'Changeover' ? changeoverTo : undefined,
      nextDate: nextFrequencyConfig?.startDate || now,
      nextShift: nextFrequencyConfig ? getShiftFromFrequencyConfig(nextFrequencyConfig, preservedShift) : preservedShift,
      lastOccurrence: now,
      frequency: nextFrequencyConfig ? summarizeFrequencyConfig(nextFrequencyConfig) : 'N/A',
      frequencyConfig: nextFrequencyConfig,
      duration,
    };
    if (editingActivityId) {
      const updatedActivity = { ...payload, id: editingActivityId };
      setManagedActivities((prev) => prev.map((item) => (item.id === editingActivityId ? updatedActivity : item)));
      setActivityOccurrences((prev) => ({
        ...prev,
        [editingActivityId]: createOccurrencesForActivity(updatedActivity),
      }));
    } else {
      const newActivity = { ...payload, id: `act-${Date.now()}` };
      setManagedActivities((prev) => [newActivity, ...prev]);
      setActivityOccurrences((prev) => ({ ...prev, [newActivity.id]: createOccurrencesForActivity(newActivity) }));
      setSelectedActivityId(newActivity.id);
      setActivityPage(1);
    }
    closeActivityDialog();
  };

  const isSameStepList = (first: StepDragState | null, second: StepDragState): boolean =>
    Boolean(first && first.list === second.list && (first.phase ?? '') === (second.phase ?? '') && (first.operatorId ?? '') === (second.operatorId ?? ''));

  const isStepBeingDragged = (step: StepDragState): boolean =>
    Boolean(draggedStep && isSameStepList(draggedStep, step) && draggedStep.id === step.id);

  const isStepDropTarget = (step: StepDragState): boolean =>
    Boolean(dragOverStep && isSameStepList(dragOverStep, step) && dragOverStep.id === step.id && draggedStep?.id !== step.id);

  const getStepCardSx = (step: StepDragState) => ({
    p: 1.2,
    borderRadius: '12px',
    mb: 1,
    borderColor: isStepDropTarget(step) ? tokenBrand.main : tokenDivider,
    bgcolor: isStepDropTarget(step) ? tokenBrand.softBg : 'background.paper',
    outline: isStepDropTarget(step) ? `2px solid ${tokenBrand.softBg}` : 'none',
    opacity: isStepBeingDragged(step) ? 0.62 : 1,
    transition: 'border-color 120ms ease, outline-color 120ms ease, background-color 120ms ease, opacity 120ms ease',
  });

  const handleStepDragStart = (event: React.DragEvent<HTMLElement>, step: StepDragState): void => {
    event.stopPropagation();
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/manage-task-step-id', step.id);
    setDraggedStep(step);
    setDragOverStep(null);
  };

  const handleStepDragOver = (event: React.DragEvent<HTMLElement>, step: StepDragState): void => {
    if (!isSameStepList(draggedStep, step) || draggedStep?.id === step.id) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    if (!dragOverStep || dragOverStep.id !== step.id || !isSameStepList(dragOverStep, step)) {
      setDragOverStep(step);
    }
  };

  const handleStepDrop = (event: React.DragEvent<HTMLElement>, step: StepDragState): void => {
    event.preventDefault();
    event.stopPropagation();
    if (!isSameStepList(draggedStep, step) || !draggedStep || draggedStep.id === step.id) {
      setDraggedStep(null);
      setDragOverStep(null);
      return;
    }

    if (step.list === 'cil') {
      setCilSteps((prev) => reorderItemsById(prev, draggedStep.id, step.id));
    } else if (step.list === 'centerline') {
      setCenterlineParameters((prev) => reorderItemsById(prev, draggedStep.id, step.id));
    } else if (step.operatorId) {
      setChangeoverOperatorRoutines((prev) => prev.map((operator) => (
        operator.id === step.operatorId
          ? { ...operator, steps: reorderItemsById(operator.steps, draggedStep.id, step.id) }
          : operator
      )));
    }

    setDraggedStep(null);
    setDragOverStep(null);
  };

  const handleStepDragEnd = (): void => {
    setDraggedStep(null);
    setDragOverStep(null);
  };

  const renderStepDragHandle = (step: StepDragState, index: number, displayNumber = String(index + 1)): React.ReactNode => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
      <Tooltip title="Drag to reorder">
        <Box
          component="span"
          draggable
          onDragStart={(event) => handleStepDragStart(event, step)}
          onDragEnd={handleStepDragEnd}
          role="button"
          tabIndex={0}
          aria-label={`Reorder step ${displayNumber}`}
          sx={{
            width: 24,
            height: 24,
            borderRadius: 1,
            display: 'grid',
            placeItems: 'center',
            color: tokenText.secondary,
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            '&:hover': { bgcolor: tokenBrand.softBg, color: tokenBrand.main },
          }}
        >
          <DragIndicatorIcon sx={{ fontSize: 18 }} />
        </Box>
      </Tooltip>
      <Chip size="small" label={displayNumber} sx={{ minWidth: 26, fontWeight: 700, color: tokenText.primary, bgcolor: 'background.paper', border: `1px solid ${tokenDivider}` }} />
    </Box>
  );

  const openActions = (event: React.MouseEvent<HTMLElement>, activityId: string): void => {
    setActionsAnchorEl(event.currentTarget);
    setActionsActivityId(activityId);
    setSelectedActivityId(activityId);
    setVisibleOccurrenceCount(5);
  };

  const closeActions = (): void => {
    setActionsAnchorEl(null);
    setActionsActivityId(null);
  };

  const getSavedAssignmentsForOccurrence = (occurrenceId: string | null): Record<string, string> => {
    if (!occurrenceId) return savedChangeoverAssignments;
    return savedChangeoverAssignmentsByOccurrence[occurrenceId] ?? initialChangeoverAssignments;
  };

  const openAssignmentDialog = (activity: ManagedActivity, occurrence?: ManagedOccurrence): void => {
    setAssignmentActivityId(activity.id);
    setAssignmentOccurrenceId(occurrence?.id ?? null);
    setAssignmentDrafts(getSavedAssignmentsForOccurrence(occurrence?.id ?? null));
    setDependencyDrafts(savedChangeoverDependencies);
    setAssignmentSearchQuery('');
    setExpandedAssignmentSteps(createExpandedStepState(true));
    setFullyVisibleAssignmentSteps(createExpandedStepState(false));
    setExpandedDependencySteps(createExpandedStepState(true));
    setAssignmentModalTab('tasks');
    setDependencyViewMode('flow');
    setShowDependencyLegend(true);
    setTimelineZoom(100);
    setSelectedDependencyTaskId(null);
    setAssignmentDialogOpen(true);
    closeActions();
  };

  const cancelAssignmentDialog = (): void => {
    setAssignmentDialogOpen(false);
    setAssignmentActivityId(null);
    setAssignmentOccurrenceId(null);
    setAssignmentDrafts(getSavedAssignmentsForOccurrence(assignmentOccurrenceId));
    setDependencyDrafts(savedChangeoverDependencies);
    setAssignmentSearchQuery('');
    setAssignmentModalTab('tasks');
    setSelectedDependencyTaskId(null);
  };

  const saveAssignments = (): void => {
    if (assignmentOccurrenceId) {
      setSavedChangeoverAssignmentsByOccurrence((prev) => ({
        ...prev,
        [assignmentOccurrenceId]: assignmentDrafts,
      }));
    } else {
      setSavedChangeoverAssignments(assignmentDrafts);
    }
    setSavedChangeoverDependencies(dependencyDrafts);
    setAssignmentDialogOpen(false);
    setAssignmentActivityId(null);
    setAssignmentOccurrenceId(null);
  };

  const updateTaskAssignee = (taskId: string, operatorId: string): void => {
    setAssignmentDrafts((prev) => {
      const next = { ...prev };
      if (operatorId) {
        next[taskId] = operatorId;
      } else {
        delete next[taskId];
      }
      return next;
    });
  };

  const toggleAssignmentStep = (stepId: ChangeoverAssignmentStepId): void => {
    setExpandedAssignmentSteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const showAllTasksForStep = (stepId: ChangeoverAssignmentStepId): void => {
    setFullyVisibleAssignmentSteps((prev) => ({ ...prev, [stepId]: true }));
  };

  const toggleAllAssignmentTasks = (): void => {
    const nextVisibleState = !areAllAssignmentStepsFullyVisible;
    setExpandedAssignmentSteps(createExpandedStepState(true));
    setFullyVisibleAssignmentSteps(createExpandedStepState(nextVisibleState));
  };

  const toggleDependencyStep = (stepId: ChangeoverAssignmentStepId): void => {
    setExpandedDependencySteps((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const toggleAllDependencySteps = (): void => {
    const shouldExpand = !changeoverAssignmentSteps.every((step) => expandedDependencySteps[step.id]);
    setExpandedDependencySteps(createExpandedStepState(shouldExpand));
  };

  const addDependencyDraft = (): void => {
    if (!dependencyFromTaskId || !dependencyToTaskId || dependencyFromTaskId === dependencyToTaskId) return;
    const exists = dependencyDrafts.some((dependency) => (
      dependency.fromTaskId === dependencyFromTaskId
      && dependency.toTaskId === dependencyToTaskId
      && dependency.type === dependencyType
    ));
    if (exists) return;
    setDependencyDrafts((prev) => [
      ...prev,
      {
        id: `dep-${Date.now()}`,
        fromTaskId: dependencyFromTaskId,
        toTaskId: dependencyToTaskId,
        type: dependencyType,
        critical: false,
        mandatory: true,
      },
    ]);
  };

  const removeDependencyDraft = (dependencyId: string): void => {
    setDependencyDrafts((prev) => prev.filter((dependency) => dependency.id !== dependencyId));
  };

  const removeTaskAssignee = (taskId: string): void => {
    updateTaskAssignee(taskId, '');
  };

  const downloadDependencyMap = (): void => {
    const escapeCsv = (value: string): string => `"${value.replace(/"/g, '""')}"`;
    const rows = dependencyDrafts.map((dependency) => {
      const fromTask = getAssignmentTask(dependency.fromTaskId);
      const toTask = getAssignmentTask(dependency.toTaskId);
      return [
        dependency.id,
        fromTask?.code ?? '',
        fromTask?.task ?? '',
        toTask?.code ?? '',
        toTask?.task ?? '',
        getDependencyTypeLabel(dependency.type),
        dependency.mandatory ? 'Mandatory' : 'Optional',
      ].map(escapeCsv).join(',');
    });
    const csv = [
      ['Dependency ID', 'From task', 'From task name', 'To task', 'To task name', 'Type', 'Rule'].map(escapeCsv).join(','),
      ...rows,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'changeover-dependency-map.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAssignmentList = (): void => {
    const escapeCsv = (value: string): string => `"${value.replace(/"/g, '""')}"`;
    const rows = changeoverAssignmentTasks.map((task) => {
      const step = changeoverAssignmentSteps.find((item) => item.id === task.stepId);
      const operator = operatorById.get(assignmentDrafts[task.id]);
      return [
        step?.number ? String(step.number) : '',
        step?.title ?? '',
        task.code,
        task.task,
        task.description,
        task.estimatedTime,
        task.role,
        operator?.name ?? '',
        operator ? 'Assigned' : 'Unassigned',
      ].map(escapeCsv).join(',');
    });
    const csv = [
      ['Step', 'Step name', 'Task', 'Task name', 'Task description', 'Estimated time', 'Skill / Role', 'Assigned to', 'Status'].map(escapeCsv).join(','),
      ...rows,
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'changeover-task-assignments.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const openRescheduleDialog = (activity: ManagedActivity, occurrence?: ManagedOccurrence): void => {
    const targetOccurrence = occurrence ?? activityOccurrences[activity.id]?.[0] ?? createOccurrencesForActivity(activity)[0];
    setSelectedActivityId(activity.id);
    setRescheduleActivityId(activity.id);
    setRescheduleOccurrenceId(targetOccurrence.id);
    setRescheduleCurrentDate(targetOccurrence.date);
    setRescheduleCurrentTime(targetOccurrence.time);
    setRescheduleCurrentShift(targetOccurrence.shift);
    setRescheduleNewDate(targetOccurrence.date);
    setRescheduleNewTime(targetOccurrence.time);
    setRescheduleNewShift(targetOccurrence.shift);
    setRescheduleJustification('');
    setRescheduleDialogOpen(true);
  };

  const saveReschedule = (): void => {
    if (!rescheduleActivityId || !rescheduleOccurrenceId || !rescheduleNewDate || !rescheduleNewTime || !rescheduleNewShift) return;
    setActivityOccurrences((prev) => ({
      ...prev,
      [rescheduleActivityId]: (prev[rescheduleActivityId] ?? []).map((occurrence) => (
        occurrence.id === rescheduleOccurrenceId
          ? { ...occurrence, date: rescheduleNewDate, time: rescheduleNewTime, shift: rescheduleNewShift }
          : occurrence
      )),
    }));
    setManagedActivities((prev) => prev.map((item) => (
      item.id === rescheduleActivityId
        ? { ...item, nextDate: rescheduleNewDate, nextShift: rescheduleNewShift }
        : item
    )));
    setRescheduleDialogOpen(false);
  };

  const openAddOccurrenceDialog = (activity: ManagedActivity): void => {
    const currentOccurrences = activityOccurrences[activity.id] ?? [];
    const lastOccurrence = currentOccurrences[currentOccurrences.length - 1];
    const lastShiftIndex = Math.max(0, shiftOrder.indexOf(lastOccurrence?.shift ?? activity.nextShift));
    const nextShift = activity.category === 'Changeover'
      ? (lastOccurrence?.shift ?? activity.nextShift)
      : shiftOrder[(lastShiftIndex + 1) % shiftOrder.length];
    const shouldAdvanceDate = activity.category === 'Changeover' || nextShift === shiftOrder[0];
    const nextDate = addDaysToIso(lastOccurrence?.date ?? activity.nextDate ?? referenceTodayIso, shouldAdvanceDate ? 1 : 0);

    setSelectedActivityId(activity.id);
    setAddOccurrenceActivityId(activity.id);
    setAddOccurrenceDate(nextDate);
    const nextTime = getShiftMeta(nextShift).defaultTime;
    setAddOccurrenceShift(getShiftFromTime(nextTime));
    setAddOccurrenceTime(nextTime);
    setRescheduleDialogOpen(false);
    setAddOccurrenceDialogOpen(true);
  };

  const saveNewOccurrence = (): void => {
    const activity = managedActivities.find((item) => item.id === addOccurrenceActivityId);
    if (!activity || !addOccurrenceDate || !addOccurrenceTime || !addOccurrenceShift) return;
    const currentOccurrences = activityOccurrences[activity.id] ?? [];
    const nextOccurrence: ManagedOccurrence = {
      id: `${activity.id}-occ-${Date.now()}`,
      activityId: activity.id,
      date: addOccurrenceDate,
      time: addOccurrenceTime,
      shift: addOccurrenceShift,
      status: 'Pending',
      assignedTo: '',
    };

    setActivityOccurrences((prev) => ({
      ...prev,
      [activity.id]: [...(prev[activity.id] ?? []), nextOccurrence],
    }));
    setManagedActivities((prev) => prev.map((item) => (
      item.id === activity.id
        ? { ...item, nextDate: addOccurrenceDate, nextShift: addOccurrenceShift }
        : item
    )));
    setSavedChangeoverAssignmentsByOccurrence((prev) => ({
      ...prev,
      [nextOccurrence.id]: {},
    }));
    setChangeoverOccurrenceOperatorAssignees((prev) => ({
      ...prev,
      [nextOccurrence.id]: {},
    }));
    setChangeoverOccurrenceOperatorStatuses((prev) => ({
      ...prev,
      [nextOccurrence.id]: {},
    }));
    setExpandedChangeoverOccurrences((prev) => ({
      ...prev,
      [nextOccurrence.id]: true,
    }));
    setVisibleOccurrenceCount((prev) => Math.max(prev + 1, currentOccurrences.length + 1));
    setAddOccurrenceDialogOpen(false);
    setAddOccurrenceActivityId(null);
  };

  const updateOccurrenceAssignee = (occurrence: ManagedOccurrence, assignedTo: string): void => {
    setActivityOccurrences((prev) => ({
      ...prev,
      [occurrence.activityId]: (prev[occurrence.activityId] ?? []).map((item) => (
        item.id === occurrence.id ? { ...item, assignedTo } : item
      )),
    }));
  };

  const isChangeoverOccurrenceExpanded = (occurrenceId: string): boolean =>
    expandedChangeoverOccurrences[occurrenceId] ?? true;

  const toggleChangeoverOccurrence = (occurrenceId: string): void => {
    setExpandedChangeoverOccurrences((prev) => ({
      ...prev,
      [occurrenceId]: !(prev[occurrenceId] ?? true),
    }));
  };

  const getChangeoverOperatorAssignee = (occurrenceId: string, operator: ChangeoverOperatorRoutine): string => {
    const occurrenceAssigneesByOperator = changeoverOccurrenceOperatorAssignees[occurrenceId];
    if (occurrenceAssigneesByOperator) return occurrenceAssigneesByOperator[operator.id] ?? '';
    return '';
  };

  const updateChangeoverOperatorAssignee = (occurrenceId: string, operatorId: string, assignedTo: string): void => {
    setChangeoverOccurrenceOperatorAssignees((prev) => ({
      ...prev,
      [occurrenceId]: {
        ...(prev[occurrenceId] ?? {}),
        [operatorId]: assignedTo,
      },
    }));
  };

  const getChangeoverOperatorStatus = (occurrenceId: string, operatorId: string): ChangeoverOperatorStatus =>
    changeoverOccurrenceOperatorStatuses[occurrenceId]?.[operatorId] ?? 'Pending';

  const cycleChangeoverOperatorStatus = (occurrenceId: string, operatorId: string): void => {
    const currentStatus = getChangeoverOperatorStatus(occurrenceId, operatorId);
    const currentIndex = changeoverOperatorStatusOrder.indexOf(currentStatus);
    const nextStatus = changeoverOperatorStatusOrder[(currentIndex + 1) % changeoverOperatorStatusOrder.length];
    setChangeoverOccurrenceOperatorStatuses((prev) => ({
      ...prev,
      [occurrenceId]: {
        ...(prev[occurrenceId] ?? {}),
        [operatorId]: nextStatus,
      },
    }));
  };

  const deleteActivity = (activityId: string): void => {
    setManagedActivities((prev) => prev.filter((item) => item.id !== activityId));
    setActivityOccurrences((prev) => {
      const next = { ...prev };
      delete next[activityId];
      return next;
    });
    if (selectedActivityId === activityId) setSelectedActivityId(null);
    if (rescheduleActivityId === activityId) setRescheduleDialogOpen(false);
    closeActions();
  };

  const cycleOccurrenceStatus = (occurrence: ManagedOccurrence): void => {
    const nextStatusByStatus: Record<OccurrenceStatus, OccurrenceStatus> = {
      Pending: 'Completed',
      Completed: 'Overdue',
      Overdue: 'Skipped',
      Skipped: 'Pending',
    };
    setActivityOccurrences((prev) => ({
      ...prev,
      [occurrence.activityId]: (prev[occurrence.activityId] ?? []).map((item) => (
        item.id === occurrence.id ? { ...item, status: nextStatusByStatus[item.status] } : item
      )),
    }));
  };

  const ignoreOccurrence = (occurrence: ManagedOccurrence): void => {
    setActivityOccurrences((prev) => ({
      ...prev,
      [occurrence.activityId]: (prev[occurrence.activityId] ?? []).map((item) => (
        item.id === occurrence.id ? { ...item, status: 'Skipped' } : item
      )),
    }));
    if (rescheduleOccurrenceId === occurrence.id) setRescheduleDialogOpen(false);
  };

  const resetRoutineFilters = (): void => {
    setSearchQuery('');
    setTypeFilter('All');
    setEquipmentFilter('All');
    setNextDateFilter('');
    setActivityPage(1);
    setFilterAnchorEl(null);
  };

  const renderUpload = () => (
    <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />} sx={{ fontWeight: 700, borderRadius: 2 }}>
      Upload documents/images/videos
      <input hidden type="file" multiple />
    </Button>
  );

  const renderStepEvidenceControls = <T extends StepRequirementFields & { id: string }>(
    step: T,
    onPatch: (patch: Partial<T>) => void,
  ) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
      <FormControlLabel
        sx={{ ml: 0.1 }}
        control={(
          <Switch
            checked={step.imageRequired}
            onChange={(_, checked) => onPatch({ imageRequired: checked } as Partial<T>)}
          />
        )}
        label="Image required"
      />
      {renderUpload()}
    </Box>
  );

  const renderStepRequirements = <T extends StepRequirementFields & { id: string }>(
    step: T,
    onPatch: (patch: Partial<T>) => void,
  ) => (
    <Grid container spacing={1} sx={{ mb: 1 }}>
      <Grid size={{ xs: 12 }}>
        <TextField
          size="small"
          fullWidth
          label="Step name"
          value={step.stepName}
          onChange={(event) => onPatch({ stepName: event.target.value } as Partial<T>)}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        <TextField
          size="small"
          fullWidth
          multiline
          minRows={2}
          label="Step description"
          value={step.stepDescription}
          onChange={(event) => onPatch({ stepDescription: event.target.value } as Partial<T>)}
        />
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControlLabel
          sx={{ ml: 0.4 }}
          control={(
            <Switch
              checked={step.ppeRequired}
              onChange={(_, checked) => onPatch({ ppeRequired: checked, requiredPpe: checked ? step.requiredPpe : [] } as Partial<T>)}
            />
          )}
          label="Personal Protective Equipment (PPE) required"
        />
        {step.ppeRequired ? (
          <FormControl size="small" fullWidth sx={{ mt: 0.4 }}>
            <InputLabel id={`ppe-required-${step.id}`}>Required PPE</InputLabel>
            <Select
              labelId={`ppe-required-${step.id}`}
              multiple
              label="Required PPE"
              value={step.requiredPpe}
              onChange={(event) => {
                const value = event.target.value;
                onPatch({ requiredPpe: typeof value === 'string' ? value.split(',') : value } as Partial<T>);
              }}
              renderValue={(selected) => (selected as string[]).join(', ')}
            >
              {PPE_OPTIONS.map((option) => (
                <MenuItem key={`${step.id}-ppe-${option}`} value={option}>
                  <Checkbox checked={step.requiredPpe.includes(option)} />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
      </Grid>
      <Grid size={{ xs: 12, md: 6 }}>
        <FormControlLabel
          sx={{ ml: 0.4 }}
          control={(
            <Switch
              checked={step.toolsRequired}
              onChange={(_, checked) => onPatch({ toolsRequired: checked, requiredTools: checked ? step.requiredTools : [] } as Partial<T>)}
            />
          )}
          label="Tools required"
        />
        {step.toolsRequired ? (
          <FormControl size="small" fullWidth sx={{ mt: 0.4 }}>
            <InputLabel id={`tools-required-${step.id}`}>Required tools</InputLabel>
            <Select
              labelId={`tools-required-${step.id}`}
              multiple
              label="Required tools"
              value={step.requiredTools}
              onChange={(event) => {
                const value = event.target.value;
                onPatch({ requiredTools: typeof value === 'string' ? value.split(',') : value } as Partial<T>);
              }}
              renderValue={(selected) => (selected as string[]).join(', ')}
            >
              {TOOLS_OPTIONS.map((option) => (
                <MenuItem key={`${step.id}-tool-${option}`} value={option}>
                  <Checkbox checked={step.requiredTools.includes(option)} />
                  <ListItemText primary={option} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
      </Grid>
    </Grid>
  );

  const getChangeoverPhaseVisual = (phase: ChangeoverPhase): ChangeoverAssignmentStep =>
    changeoverAssignmentSteps.find((item) => item.title === phase) ?? changeoverAssignmentSteps[0];

  const updateChangeoverOperatorRoutine = (operatorId: string, patch: Partial<Pick<ChangeoverOperatorRoutine, 'name' | 'role' | 'functionLabel'>>): void => {
    setChangeoverOperatorRoutines((prev) => prev.map((operator) => (
      operator.id === operatorId
        ? {
          ...operator,
          ...patch,
          initials: patch.name !== undefined ? getOperatorInitials(patch.name) : operator.initials,
        }
        : operator
    )));
  };

  const addChangeoverOperatorRoutine = (): void => {
    const colorOptions = [tokenBrand.main, tokenSuccess.main, tokenWarning.main, tokenInfo.main, tokenError.main, tokenBrand.dark];
    const operatorId = `changeover-operator-${Date.now()}`;
    const nextOperator: ChangeoverOperatorRoutine = {
      id: operatorId,
      name: 'Operator',
      initials: 'OP',
      role: 'Operator',
      functionLabel: 'Operator role',
      color: colorOptions[0],
      steps: [createChangeoverOperatorStep('Pre Changeover')],
    };
    setChangeoverOperatorRoutines((prev) => {
      const nextNumber = prev.length + 1;
      return [...prev, {
        ...nextOperator,
        name: `Operator ${nextNumber}`,
        initials: `O${nextNumber}`,
        color: colorOptions[(nextNumber - 1) % colorOptions.length],
      }];
    });
    setSelectedChangeoverOperatorId(operatorId);
    setChangeoverViewMode('operator');
  };

  const removeChangeoverOperatorRoutine = (operatorId: string): void => {
    setChangeoverOperatorRoutines((prev) => {
      if (prev.length <= 1) return prev;
      const removedIndex = prev.findIndex((operator) => operator.id === operatorId);
      const nextOperators = prev.filter((operator) => operator.id !== operatorId);
      if (selectedChangeoverOperatorId === operatorId) {
        const fallbackIndex = Math.max(0, removedIndex - 1);
        setSelectedChangeoverOperatorId(nextOperators[fallbackIndex]?.id ?? nextOperators[0]?.id ?? '');
      }
      return nextOperators;
    });
  };

  const addChangeoverOperatorStep = (operatorId: string, phase: ChangeoverPhase = 'Pre Changeover'): void => {
    setChangeoverOperatorRoutines((prev) => prev.map((operator) => (
      operator.id === operatorId
        ? { ...operator, steps: [...operator.steps, createChangeoverOperatorStep(phase)] }
        : operator
    )));
  };

  const updateChangeoverOperatorStep = (operatorId: string, stepId: string, patch: Partial<ChangeoverOperatorStep>): void => {
    setChangeoverOperatorRoutines((prev) => prev.map((operator) => (
      operator.id === operatorId
        ? {
          ...operator,
          steps: operator.steps.map((step) => (step.id === stepId ? { ...step, ...patch } : step)),
        }
        : operator
    )));
  };

  const removeChangeoverOperatorStep = (operatorId: string, stepId: string): void => {
    setChangeoverOperatorRoutines((prev) => prev.map((operator) => (
      operator.id === operatorId
        ? { ...operator, steps: operator.steps.filter((step) => step.id !== stepId) }
        : operator
    )));
  };

  const renderChangeoverStepCard = (
    operator: ChangeoverOperatorRoutine,
    step: ChangeoverOperatorStep,
    index: number,
  ) => {
    const stepDragState: StepDragState = { list: 'changeover', id: step.id, operatorId: operator.id };
    const operatorSequenceNumber = Math.max(1, changeoverOperatorRoutines.findIndex((item) => item.id === operator.id) + 1);
    const stepDisplayNumber = `${operatorSequenceNumber}.${index + 1}`;
    const showCenterlineFields = step.phase === 'Centerline';

    return (
      <Paper
        key={step.id}
        variant="outlined"
        sx={{ ...getStepCardSx(stepDragState), borderRadius: '8px' }}
        onDragOver={(event) => handleStepDragOver(event, stepDragState)}
        onDrop={(event) => handleStepDrop(event, stepDragState)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: { xs: 'wrap', md: 'nowrap' }, mb: 1 }}>
          {renderStepDragHandle(stepDragState, index, stepDisplayNumber)}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, ml: 'auto', width: { xs: '100%', sm: 'auto' }, justifyContent: 'flex-end' }}>
            <FormControl size="small" sx={{ minWidth: { xs: 0, sm: 230 }, width: { xs: '100%', sm: 260 } }}>
              <InputLabel id={`changeover-phase-${step.id}`}>Step stage</InputLabel>
              <Select
                labelId={`changeover-phase-${step.id}`}
                label="Step stage"
                value={step.phase}
                onChange={(event) => updateChangeoverOperatorStep(operator.id, step.id, { phase: event.target.value as ChangeoverPhase })}
                renderValue={(value) => {
                  const visual = getChangeoverPhaseVisual(value as ChangeoverPhase);
                  return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                      <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: visual.color, flexShrink: 0 }} />
                      <Typography component="span" noWrap sx={{ fontSize: '0.78rem', fontWeight: 700 }}>{String(value)}</Typography>
                    </Box>
                  );
                }}
              >
                {changeoverPhases.map((phase) => {
                  const visual = getChangeoverPhaseVisual(phase);
                  return (
                    <MenuItem key={`${step.id}-${phase}`} value={phase}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <Box component="span" sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: visual.color }} />
                        {phase}
                      </Box>
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
            <IconButton size="small" onClick={() => removeChangeoverOperatorStep(operator.id, step.id)} sx={{ color: tokenError.dark, flexShrink: 0 }}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        {renderStepRequirements(step, (patch) => updateChangeoverOperatorStep(operator.id, step.id, patch as Partial<ChangeoverOperatorStep>))}
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField size="small" fullWidth label="Duration (min)" value={step.duration} onChange={(event) => updateChangeoverOperatorStep(operator.id, step.id, { duration: event.target.value })} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>Machine condition</InputLabel>
              <Select label="Machine condition" value={step.machineCondition} onChange={(event) => updateChangeoverOperatorStep(operator.id, step.id, { machineCondition: String(event.target.value) })}>
                <MenuItem value="Stopped">Stopped</MenuItem>
                <MenuItem value="Running">Running</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          {showCenterlineFields ? (
            <>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel id={`changeover-centerline-unit-${step.id}`}>Parameter unit</InputLabel>
                  <Select
                    labelId={`changeover-centerline-unit-${step.id}`}
                    label="Parameter unit"
                    value={step.parameterUnit}
                    onChange={(event) => updateChangeoverOperatorStep(operator.id, step.id, { parameterUnit: String(event.target.value) })}
                  >
                    {PARAMETER_UNIT_OPTIONS.map((option) => <MenuItem key={`${step.id}-changeover-centerline-unit-${option}`} value={option}>{option}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField size="small" fullWidth label="Min" value={step.min} onChange={(event) => updateChangeoverOperatorStep(operator.id, step.id, { min: event.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField size="small" fullWidth label="Target" value={step.target} onChange={(event) => updateChangeoverOperatorStep(operator.id, step.id, { target: event.target.value })} />
              </Grid>
              <Grid size={{ xs: 12, md: 2 }}>
                <TextField size="small" fullWidth label="Max" value={step.max} onChange={(event) => updateChangeoverOperatorStep(operator.id, step.id, { max: event.target.value })} />
              </Grid>
            </>
          ) : null}
          <Grid size={{ xs: 12 }}>
            {renderStepEvidenceControls(step, (patch) => updateChangeoverOperatorStep(operator.id, step.id, patch as Partial<ChangeoverOperatorStep>))}
          </Grid>
        </Grid>
      </Paper>
    );
  };

  const renderChangeoverOperatorView = () => {
    const operator = selectedChangeoverOperator;
    if (!operator) return null;

    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' }, gap: 1.2 }}>
        <Box sx={{ display: 'grid', gap: 0.8, alignSelf: 'start' }}>
          {changeoverOperatorRoutines.map((item) => {
            const stats = changeoverOperatorStats.find((operatorStat) => operatorStat.operatorId === item.id);
            const isSelected = item.id === operator.id;
            return (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  p: 1,
                  borderRadius: '8px',
                  border: `1px solid ${isSelected ? tokenBrand.main : tokenDivider}`,
                  bgcolor: isSelected ? tokenBrand.softBg : 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 0.8,
                }}
              >
                <Box
                  onClick={() => setSelectedChangeoverOperatorId(item.id)}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.8,
                    minWidth: 0,
                    flex: 1,
                    cursor: 'pointer',
                  }}
                >
                  {renderOperatorAvatar(item, 32)}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 800 }}>{item.name}</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 500 }}>
                      {stats?.totalSteps ?? 0} steps - {formatStepMinutes(stats?.totalMinutes ?? 0)}
                    </Typography>
                  </Box>
                </Box>
                <Tooltip disableInteractive title={changeoverOperatorRoutines.length <= 1 ? 'Keep at least one operator' : 'Remove operator'}>
                  <span>
                    <IconButton
                      type="button"
                      size="small"
                      onMouseDown={(event) => event.stopPropagation()}
                      onClick={(event) => {
                        event.stopPropagation();
                        removeChangeoverOperatorRoutine(item.id);
                      }}
                      disabled={changeoverOperatorRoutines.length <= 1}
                      sx={{ color: changeoverOperatorRoutines.length <= 1 ? tokenText.disabled : tokenError.dark }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Paper>
            );
          })}
          <Button type="button" variant="outlined" onClick={addChangeoverOperatorRoutine} startIcon={<AddIcon />} sx={{ ...outlinedActionSx, borderStyle: 'dashed', width: '100%' }}>
            Add operator
          </Button>
        </Box>

        <Paper elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: 'background.paper', p: 1.2 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1, alignItems: 'start', mb: 1.1 }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.9, minWidth: 0 }}>
              {renderOperatorAvatar(operator, 34)}
              <Box sx={{ minWidth: 0, width: '100%' }}>
                <TextField
                  size="small"
                  fullWidth
                  label="Operator"
                  value={operator.name}
                  onChange={(event) => updateChangeoverOperatorRoutine(operator.id, { name: event.target.value })}
                  sx={{ mb: 0.8 }}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="Function (optional)"
                  value={operator.functionLabel}
                  onChange={(event) => updateChangeoverOperatorRoutine(operator.id, { functionLabel: event.target.value })}
                />
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'grid', gap: 1 }}>
            {operator.steps.map((step, index) => renderChangeoverStepCard(operator, step, index))}
          </Box>

          <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
            {changeoverPhases.map((phase) => {
              const visual = getChangeoverPhaseVisual(phase);
              return (
                <Button
                  key={`${operator.id}-add-${phase}`}
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                  onClick={() => addChangeoverOperatorStep(operator.id, phase)}
                  sx={{ height: 30, borderRadius: '8px', textTransform: 'none', color: visual.color, borderColor: visual.color, fontSize: '0.7rem', fontWeight: 800, '&:hover': { borderColor: visual.color, bgcolor: visual.softColor } }}
                >
                  {phase}
                </Button>
              );
            })}
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderChangeoverStageView = () => (
    <Paper elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: 'background.paper', p: 1 }}>
      <Box sx={{ display: 'grid', gap: 0.8 }}>
        {changeoverStageGroups.map((group) => {
          const visual = getChangeoverPhaseVisual(group.phase);
          return (
            <Paper key={`stage-view-${group.phase}`} elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', overflow: 'hidden', bgcolor: 'background.paper' }}>
              <Box sx={{ px: 1, py: 0.8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, bgcolor: visual.softColor, borderBottom: `1px solid ${tokenDivider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0 }}>
                  <KeyboardArrowDownIcon sx={{ color: visual.color, fontSize: 18 }} />
                  <Typography sx={{ color: visual.color, fontSize: '0.78rem', fontWeight: 900, textTransform: 'uppercase' }}>{group.phase}</Typography>
                </Box>
                <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700 }}>
                  {group.steps.length} steps - {formatStepMinutes(group.totalMinutes)}
                </Typography>
              </Box>
              {group.steps.length ? (
                <Box>
                  {group.steps.map(({ operator, step, index }) => {
                    const operatorSequenceNumber = Math.max(1, changeoverOperatorRoutines.findIndex((item) => item.id === operator.id) + 1);
                    return (
                      <Box
                        key={`${group.phase}-${operator.id}-${step.id}`}
                        sx={{ px: 1, py: 0.85, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '170px minmax(0, 1fr) 72px auto' }, gap: 0.9, alignItems: 'center', borderBottom: `1px solid ${tokenDivider}` }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0 }}>
                          {renderOperatorAvatar(operator, 24)}
                          <Typography noWrap sx={{ color: tokenBrand.main, fontSize: '0.74rem', fontWeight: 800 }}>{operator.name}</Typography>
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ color: tokenText.primary, fontSize: '0.76rem', fontWeight: 700 }}>{step.stepName || 'Untitled step'}</Typography>
                          <Typography noWrap sx={{ color: tokenText.secondary, fontSize: '0.66rem', fontWeight: 500 }}>{step.stepDescription || 'No description yet'}</Typography>
                        </Box>
                        <Chip size="small" label={`${operatorSequenceNumber}.${index + 1}`} sx={{ justifySelf: { md: 'start' }, bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, fontWeight: 800 }} />
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700 }}>{formatStepMinutes(getStepDurationMinutes(step.duration))}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              ) : (
                <Box sx={{ px: 1, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.74rem', fontWeight: 500 }}>No operator has steps in this stage yet.</Typography>
                  {selectedChangeoverOperator ? (
                    <Button size="small" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={() => addChangeoverOperatorStep(selectedChangeoverOperator.id, group.phase)} sx={{ color: tokenBrand.main, fontSize: '0.72rem', fontWeight: 800, textTransform: 'none' }}>
                      Add to selected operator
                    </Button>
                  ) : null}
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );

  const updateFrequencyConfig = (patch: Partial<FrequencyConfig>): void => {
    setFrequencyConfig((prev) => ({ ...prev, ...patch }));
  };

  const setFrequencyType = (nextFrequency: FrequencyType): void => {
    setFrequencyConfig((prev) => createFrequencyConfigForType(nextFrequency, prev));
  };

  const toggleFrequencyWeekday = (weekday: FrequencyWeekdayId): void => {
    setFrequencyConfig((prev) => {
      const nextDays = prev.weekDays.includes(weekday)
        ? prev.weekDays.filter((day) => day !== weekday)
        : [...prev.weekDays, weekday];
      return { ...prev, weekDays: nextDays.length ? nextDays : [weekday] };
    });
  };

  const toggleFrequencyShift = (shift: FrequencyShiftId): void => {
    setFrequencyConfig((prev) => {
      const nextShifts = prev.selectedShifts.includes(shift)
        ? prev.selectedShifts.filter((item) => item !== shift)
        : [...prev.selectedShifts, shift];
      const normalizedShifts = nextShifts.length ? nextShifts : [shift];
      const firstShift = normalizedShifts[0];
      return {
        ...prev,
        selectedShifts: normalizedShifts,
        startTime: prev.shiftTimes[firstShift] || prev.startTime,
      };
    });
  };

  const updateFrequencyShiftTime = (shift: FrequencyShiftId, time: string): void => {
    setFrequencyConfig((prev) => ({
      ...prev,
      shiftTimes: { ...prev.shiftTimes, [shift]: time },
      startTime: prev.selectedShifts[0] === shift ? time : prev.startTime,
    }));
  };

  const addFrequencyTime = (): void => {
    setFrequencyConfig((prev) => {
      if (!prev.startTime || prev.times.includes(prev.startTime)) return prev;
      return { ...prev, times: [...prev.times, prev.startTime].sort() };
    });
  };

  const removeFrequencyTime = (time: string): void => {
    setFrequencyConfig((prev) => ({
      ...prev,
      times: prev.times.length > 1 ? prev.times.filter((item) => item !== time) : prev.times,
    }));
  };

  const renderFrequencyModule = () => {
    const isPerShift = frequencyConfig.frequency === 'Per Shift';
    const isCustom = frequencyConfig.frequency === 'Custom';
    const showWeekdays = frequencyConfig.repeatUnit === 'week' && !isPerShift;
    const showMonthly = (frequencyConfig.repeatUnit === 'month' || frequencyConfig.frequency === 'Monthly' || frequencyConfig.frequency === 'Quarterly') && !isCustom;
    const showAnnual = frequencyConfig.repeatUnit === 'year' && !isCustom;
    const frequencySummary = summarizeFrequencyConfig(frequencyConfig);

    return (
      <Paper
        variant="outlined"
        sx={{
          mb: 1.4,
          p: { xs: 1.25, md: 1.45 },
          borderRadius: '12px',
          borderColor: tokenDivider,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1.25 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: tokenText.primary, fontSize: '0.76rem', fontWeight: 700, letterSpacing: 0, textTransform: 'uppercase' }}>
              Frequency & Schedule
            </Typography>
            <Typography sx={{ mt: 0.2, color: tokenText.secondary, fontSize: '0.78rem', fontWeight: 400 }}>
              Configure common, shift-based, monthly, annual, or custom recurrence rules.
            </Typography>
          </Box>
          <Chip
            size="small"
            label={frequencySummary}
            sx={{
              maxWidth: { xs: '100%', md: 520 },
              height: 26,
              borderRadius: '8px',
              bgcolor: tokenBrand.softBg,
              color: tokenBrand.main,
              border: `1px solid ${tokenDivider}`,
              fontWeight: 700,
              '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
            }}
          />
        </Box>

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl size="small" fullWidth>
              <InputLabel id="activity-frequency-label">Frequency</InputLabel>
              <Select
                labelId="activity-frequency-label"
                label="Frequency"
                value={frequencyConfig.frequency}
                onChange={(event) => setFrequencyType(event.target.value as FrequencyType)}
              >
                {FREQUENCY_OPTIONS.map((option) => (
                  <MenuItem key={`frequency-${option}`} value={option}>{option}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {isCustom ? (
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="activity-repeat-unit-label">Repeat unit</InputLabel>
                <Select
                  labelId="activity-repeat-unit-label"
                  label="Repeat unit"
                  value={frequencyConfig.repeatUnit}
                  onChange={(event) => updateFrequencyConfig({ repeatUnit: event.target.value as FrequencyRepeatUnit })}
                >
                  {FREQUENCY_REPEAT_UNITS.map((unit) => (
                    <MenuItem key={`repeat-unit-${unit}`} value={unit}>{getRepeatUnitLabel(unit)}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ) : null}

          {!isPerShift ? (
            <>
              <Grid size={{ xs: 6, md: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="Repeat every"
                  value={frequencyConfig.repeatEvery}
                  onChange={(event) => updateFrequencyConfig({ repeatEvery: event.target.value })}
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 6, md: isCustom ? 2 : 3 }}>
                <Box sx={{ height: 40, px: 1, border: `1px solid ${tokenDivider}`, borderRadius: '8px', display: 'flex', alignItems: 'center', color: tokenText.secondary, fontSize: '0.8rem', fontWeight: 700 }}>
                  {getRepeatUnitLabel(frequencyConfig.repeatUnit)}
                </Box>
              </Grid>
            </>
          ) : null}

          <Grid size={{ xs: 12, md: isPerShift ? 4 : 3 }}>
            <TextField
              size="small"
              fullWidth
              type="date"
              label={isPerShift ? 'First occurrence' : 'Starts on'}
              value={frequencyConfig.startDate}
              onChange={(event) => updateFrequencyConfig({ startDate: event.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          {!isPerShift ? (
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                size="small"
                fullWidth
                type="time"
                label="Time"
                value={frequencyConfig.startTime}
                onChange={(event) => updateFrequencyConfig({ startTime: event.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          ) : null}
        </Grid>

        {isPerShift ? (
          <Box sx={{ mt: 1.15 }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.74rem', fontWeight: 700, mb: 0.45 }}>Select shifts and activity time</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 0.55 }}>
              {FREQUENCY_SHIFT_OPTIONS.map((shift) => {
                const isSelected = frequencyConfig.selectedShifts.includes(shift.id);
                return (
                  <Box
                    key={`shift-${shift.id}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 136px' },
                      alignItems: 'center',
                      gap: 0.8,
                      minHeight: 46,
                      px: 0.75,
                      py: 0.55,
                      border: `1px solid ${isSelected ? tokenBrand.main : tokenDivider}`,
                      borderRadius: '8px',
                      bgcolor: isSelected ? tokenBrand.softBg : 'background.paper',
                    }}
                  >
                    <FormControlLabel
                      sx={{ m: 0, minWidth: 0 }}
                      control={(
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => toggleFrequencyShift(shift.id)}
                        />
                      )}
                      label={<Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700, lineHeight: 1.2 }}>{shift.label}</Typography>}
                    />
                    {isSelected ? (
                      <TextField
                        size="small"
                        fullWidth
                        type="time"
                        label="Activity time"
                        value={frequencyConfig.shiftTimes[shift.id] || shift.time}
                        onChange={(event) => updateFrequencyShiftTime(shift.id, event.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiInputBase-root': { height: 36 },
                          '& .MuiInputBase-input': { fontSize: '0.82rem', fontWeight: 800, minWidth: 0 },
                          '& .MuiInputLabel-root': { fontSize: '0.72rem' },
                        }}
                      />
                    ) : (
                      <Box sx={{ height: 34, px: 1, display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', sm: 'flex-end' }, color: tokenText.disabled, fontSize: '0.74rem', fontWeight: 700 }}>
                        Not scheduled
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : null}

        {showWeekdays ? (
          <Box sx={{ mt: 1.15 }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.74rem', fontWeight: 700, mb: 0.45 }}>Repeat on</Typography>
            <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
              {FREQUENCY_WEEKDAYS.map((day) => {
                const selected = frequencyConfig.weekDays.includes(day.id);
                return (
                  <Button
                    key={`weekday-${day.id}`}
                    size="small"
                    variant={selected ? 'contained' : 'outlined'}
                    onClick={() => toggleFrequencyWeekday(day.id)}
                    sx={{
                      minWidth: 46,
                      height: 30,
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      bgcolor: selected ? `${tokenBrand.main} !important` : 'background.paper',
                      color: selected ? `${tokenBrand.contrast} !important` : tokenText.secondary,
                      borderColor: selected ? tokenBrand.main : tokenDivider,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: selected ? `${tokenBrand.dark} !important` : tokenNeutral.lightest,
                        borderColor: selected ? tokenBrand.dark : tokenBrand.main,
                      },
                    }}
                  >
                    {day.label}
                  </Button>
                );
              })}
            </Box>
          </Box>
        ) : null}

        {!isPerShift ? (
          <Box sx={{ mt: 1.15 }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.74rem', fontWeight: 700, mb: 0.35 }}>Time of day</Typography>
            <Box sx={{ display: 'flex', gap: 1.4, flexWrap: 'wrap', alignItems: 'center' }}>
              <FormControlLabel
                sx={{ m: 0 }}
                control={<Radio size="small" checked={frequencyConfig.timeMode === 'specific'} onChange={() => updateFrequencyConfig({ timeMode: 'specific' })} />}
                label={<Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700 }}>At a specific time</Typography>}
              />
              <FormControlLabel
                sx={{ m: 0 }}
                control={<Radio size="small" checked={frequencyConfig.timeMode === 'multiple'} onChange={() => updateFrequencyConfig({ timeMode: 'multiple' })} />}
                label={<Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700 }}>Multiple times</Typography>}
              />
              {frequencyConfig.timeMode === 'multiple' ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap' }}>
                  {frequencyConfig.times.map((time) => (
                    <Chip
                      key={`frequency-time-${time}`}
                      size="small"
                      label={time}
                      onDelete={() => removeFrequencyTime(time)}
                      sx={{ height: 26, borderRadius: '8px', bgcolor: tokenNeutral.lighter, color: tokenText.primary, fontWeight: 700 }}
                    />
                  ))}
                  <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 16 }} />} onClick={addFrequencyTime} sx={{ height: 28, borderRadius: 1, textTransform: 'none', fontWeight: 800 }}>
                    Add time
                  </Button>
                </Box>
              ) : null}
            </Box>
          </Box>
        ) : null}

        {showMonthly ? (
          <Grid container spacing={1} sx={{ mt: 0.2 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="monthly-repeat-label">Repeat</InputLabel>
                <Select
                  labelId="monthly-repeat-label"
                  label="Repeat"
                  value={frequencyConfig.monthlyMode}
                  onChange={(event) => updateFrequencyConfig({ monthlyMode: event.target.value as FrequencyMonthlyMode })}
                >
                  <MenuItem value="day">Day</MenuItem>
                  <MenuItem value="weekday">Weekday pattern</MenuItem>
                  <MenuItem value="lastDay">Last day</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {frequencyConfig.monthlyMode === 'day' ? (
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  size="small"
                  fullWidth
                  type="number"
                  label="On day"
                  value={frequencyConfig.monthlyDay}
                  onChange={(event) => updateFrequencyConfig({ monthlyDay: event.target.value })}
                  inputProps={{ min: 1, max: 31 }}
                />
              </Grid>
            ) : null}
            {frequencyConfig.monthlyMode === 'weekday' ? (
              <>
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="monthly-ordinal-label">Ordinal</InputLabel>
                    <Select
                      labelId="monthly-ordinal-label"
                      label="Ordinal"
                      value={frequencyConfig.monthlyOrdinal}
                      onChange={(event) => updateFrequencyConfig({ monthlyOrdinal: event.target.value as FrequencyOrdinal })}
                    >
                      <MenuItem value="first">First</MenuItem>
                      <MenuItem value="second">Second</MenuItem>
                      <MenuItem value="third">Third</MenuItem>
                      <MenuItem value="fourth">Fourth</MenuItem>
                      <MenuItem value="last">Last</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="monthly-weekday-label">Weekday</InputLabel>
                    <Select
                      labelId="monthly-weekday-label"
                      label="Weekday"
                      value={frequencyConfig.monthlyWeekday}
                      onChange={(event) => updateFrequencyConfig({ monthlyWeekday: event.target.value as FrequencyWeekdayId })}
                    >
                      {FREQUENCY_WEEKDAYS.map((day) => (
                        <MenuItem key={`monthly-weekday-${day.id}`} value={day.id}>{day.longLabel}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            ) : null}
          </Grid>
        ) : null}

        {showAnnual ? (
          <Grid container spacing={1} sx={{ mt: 0.2 }}>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl size="small" fullWidth>
                <InputLabel id="annual-month-label">Month</InputLabel>
                <Select
                  labelId="annual-month-label"
                  label="Month"
                  value={frequencyConfig.annualMonth}
                  onChange={(event) => updateFrequencyConfig({ annualMonth: String(event.target.value) })}
                >
                  {FREQUENCY_MONTHS.map((month) => (
                    <MenuItem key={`annual-month-${month.value}`} value={month.value}>{month.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                size="small"
                fullWidth
                type="number"
                label="Day"
                value={frequencyConfig.annualDay}
                onChange={(event) => updateFrequencyConfig({ annualDay: event.target.value })}
                inputProps={{ min: 1, max: 31 }}
              />
            </Grid>
          </Grid>
        ) : null}

        {isCustom ? (
          <TextField
            size="small"
            fullWidth
            multiline
            minRows={2}
            label="Custom rule note"
            value={frequencyConfig.customRule}
            onChange={(event) => updateFrequencyConfig({ customRule: event.target.value })}
            sx={{ mt: 1.15 }}
          />
        ) : null}

        {!isPerShift ? (
          <Box sx={{ mt: 1.2, display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap' }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.74rem', fontWeight: 700, mr: 0.2 }}>End</Typography>
            <FormControlLabel
              sx={{ m: 0 }}
              control={<Radio size="small" checked={frequencyConfig.endMode === 'never'} onChange={() => updateFrequencyConfig({ endMode: 'never' })} />}
              label={<Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700 }}>Never</Typography>}
            />
            <FormControlLabel
              sx={{ m: 0 }}
              control={<Radio size="small" checked={frequencyConfig.endMode === 'onDate'} onChange={() => updateFrequencyConfig({ endMode: 'onDate' })} />}
              label={<Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700 }}>On</Typography>}
            />
            <TextField
              size="small"
              type="date"
              value={frequencyConfig.endDate}
              disabled={frequencyConfig.endMode !== 'onDate'}
              onChange={(event) => updateFrequencyConfig({ endDate: event.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ width: 165, '& .MuiInputBase-root': { height: 34 } }}
            />
            <FormControlLabel
              sx={{ m: 0 }}
              control={<Radio size="small" checked={frequencyConfig.endMode === 'after'} onChange={() => updateFrequencyConfig({ endMode: 'after' })} />}
              label={<Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700 }}>After</Typography>}
            />
            <TextField
              size="small"
              type="number"
              value={frequencyConfig.endOccurrences}
              disabled={frequencyConfig.endMode !== 'after'}
              onChange={(event) => updateFrequencyConfig({ endOccurrences: event.target.value })}
              inputProps={{ min: 1 }}
              sx={{ width: 86, '& .MuiInputBase-root': { height: 34 } }}
            />
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.78rem', fontWeight: 700 }}>occurrence(s)</Typography>
          </Box>
        ) : null}

        <Box sx={{ mt: 1.15, border: `1px solid ${tokenDivider}`, borderRadius: '8px', overflow: 'hidden' }}>
          <Button
            fullWidth
            onClick={() => updateFrequencyConfig({ advancedOpen: !frequencyConfig.advancedOpen })}
            sx={{
              justifyContent: 'space-between',
              textTransform: 'none',
              color: tokenText.primary,
              fontWeight: 700,
              fontSize: '0.78rem',
              px: 1,
              py: 0.75,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
              <AddIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
              Advanced options (timezone, exceptions, blackout dates)
            </Box>
            <ExpandMoreIcon sx={{ fontSize: 18, transform: frequencyConfig.advancedOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform .18s ease' }} />
          </Button>
          {frequencyConfig.advancedOpen ? (
            <Box sx={{ p: 1, borderTop: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
              <Grid container spacing={1}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="timezone-label">Timezone</InputLabel>
                    <Select
                      labelId="timezone-label"
                      label="Timezone"
                      value={frequencyConfig.timezone}
                      onChange={(event) => updateFrequencyConfig({ timezone: String(event.target.value) })}
                    >
                      {FREQUENCY_TIMEZONES.map((timezone) => (
                        <MenuItem key={`timezone-${timezone}`} value={timezone}>{timezone}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Exception dates"
                    placeholder="2026-06-19, 2026-07-04"
                    value={frequencyConfig.exceptionDates}
                    onChange={(event) => updateFrequencyConfig({ exceptionDates: event.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <TextField
                    size="small"
                    fullWidth
                    label="Blackout dates"
                    placeholder="2026-12-24 to 2026-12-26"
                    value={frequencyConfig.blackoutDates}
                    onChange={(event) => updateFrequencyConfig({ blackoutDates: event.target.value })}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={<Switch checked={frequencyConfig.skipHolidays} onChange={(_, checked) => updateFrequencyConfig({ skipHolidays: checked })} />}
                    label={<Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700 }}>Skip holidays and planned shutdowns</Typography>}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControlLabel
                    sx={{ m: 0 }}
                    control={<Switch checked={frequencyConfig.moveFromNonWorkingDays} onChange={(_, checked) => updateFrequencyConfig({ moveFromNonWorkingDays: checked })} />}
                    label={<Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700 }}>Move non-working-day occurrences to next workday</Typography>}
                  />
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </Box>
      </Paper>
    );
  };

  const renderOperatorAvatar = (operator: OperatorOption, size = 24) => (
    <Box
      component="span"
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        bgcolor: operator.color,
        color: tokenCommon.white,
        display: 'inline-grid',
        placeItems: 'center',
        flexShrink: 0,
        fontSize: size > 22 ? '0.66rem' : '0.58rem',
        fontWeight: 900,
      }}
    >
      {operator.initials}
    </Box>
  );

  const renderAssigneeValue = (operatorId: string) => {
    const operator = operatorById.get(operatorId);
    if (!operator) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: tokenText.disabled, fontSize: '0.78rem', fontWeight: 500 }}>
          <PersonOutlineIcon sx={{ fontSize: 15 }} />
          Select person...
        </Box>
      );
    }
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
        {renderOperatorAvatar(operator, 22)}
        <Typography component="span" noWrap sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700 }}>
          {operator.name}
        </Typography>
      </Box>
    );
  };

  const renderRoleChip = (role: AssignmentRole) => {
    const tone = getAssignmentRoleTone(role);
    return (
      <Chip
        size="small"
        icon={<PersonOutlineIcon sx={{ fontSize: '0.86rem !important' }} />}
        label={role}
        sx={{
          height: 24,
          borderRadius: 1.2,
          bgcolor: tone.bg,
          color: tone.color,
          border: `1px solid ${tone.border}`,
          fontSize: '0.7rem',
          fontWeight: 900,
          '& .MuiChip-icon': { color: tone.color },
        }}
      />
    );
  };

  const renderDependencyStatusDot = (status: DependencyTaskStatus, dashed = false) => {
    const tone = getDependencyStatusTone(status);
    if (status === 'completed') return <CheckCircleOutlineIcon sx={{ fontSize: 16, color: tone.color }} />;
    return (
      <Box
        component="span"
        sx={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          border: `2px ${dashed ? 'dashed' : 'solid'} ${tone.color}`,
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
    );
  };

  const renderDependencyTaskCard = (task: ChangeoverAssignmentTask, options?: { compact?: boolean; timeline?: boolean; flow?: boolean }) => {
    const assignee = operatorById.get(assignmentDrafts[task.id] ?? '');
    const status = dependencyStatusByTaskId[task.id] ?? 'not-assigned';
    const statusTone = getDependencyStatusTone(status);
    const step = getAssignmentStep(task.stepId);
    const isSelected = selectedDependencyTaskId === task.id;
    return (
      <Paper
        key={task.id}
        elevation={0}
        onClick={() => {
          if (!selectedDependencyTaskId) {
            setSelectedDependencyTaskId(task.id);
            setDependencyFromTaskId(task.id);
            return;
          }
          if (selectedDependencyTaskId !== task.id) {
            setDependencyToTaskId(task.id);
          }
          setSelectedDependencyTaskId(null);
        }}
        sx={{
          p: options?.compact ? 0.75 : 0.95,
          borderRadius: '8px',
          border: isSelected ? `2px solid ${tokenBrand.main}` : `1px ${status === 'not-assigned' ? 'dashed' : 'solid'} ${status === 'not-assigned' ? tokenDivider : step.color}`,
          bgcolor: status === 'not-assigned' ? 'background.paper' : step.softColor,
          cursor: 'pointer',
          minHeight: options?.timeline ? 30 : options?.compact ? 58 : 84,
          height: options?.flow ? 84 : 'auto',
          boxShadow: 'none',
          '&:hover': { borderColor: tokenBrand.main, bgcolor: tokenNeutral.lightest, boxShadow: 'none' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0 }}>
            {renderDependencyStatusDot(status, status === 'not-assigned')}
            <Typography sx={{ color: tokenText.primary, fontSize: options?.compact ? '0.64rem' : '0.7rem', fontWeight: 700 }}>{task.code}</Typography>
          </Box>
        </Box>
        <Typography sx={{ mt: 0.5, color: tokenText.primary, fontSize: options?.compact ? '0.64rem' : '0.72rem', fontWeight: 700, lineHeight: 1.25 }}>
          {options?.compact ? task.task.replace(' from the line', '') : task.task}
        </Typography>
        {assignee ? (
          <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
            {renderOperatorAvatar(assignee, options?.compact ? 18 : 21)}
            <Chip
              size="small"
              icon={<PersonOutlineIcon sx={{ fontSize: '0.78rem !important' }} />}
              label={assignee.role}
              sx={{
                height: 20,
                borderRadius: 1,
                bgcolor: getAssignmentRoleTone(assignee.role).bg,
                color: getAssignmentRoleTone(assignee.role).color,
                fontSize: '0.62rem',
                fontWeight: 900,
                '& .MuiChip-icon': { color: getAssignmentRoleTone(assignee.role).color },
              }}
            />
          </Box>
        ) : (
          <Typography sx={{ mt: 0.75, color: statusTone.color, fontSize: '0.64rem', fontWeight: 900 }}>{statusTone.label}</Typography>
        )}
      </Paper>
    );
  };

  const renderDependencySidebar = () => (
    <Paper elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: 'background.paper', p: 1, minHeight: 430 }}>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>Steps</Typography>
      <Box sx={{ display: 'grid', gap: 0.8 }}>
        {changeoverAssignmentSteps.map((step) => {
          const stats = dependencyStepStats[step.id];
          const isExpanded = expandedDependencySteps[step.id];
          return (
            <Paper key={step.id} elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: 'background.paper', p: 0.9 }}>
              <Button
                fullWidth
                onClick={() => toggleDependencyStep(step.id)}
                sx={{ p: 0, justifyContent: 'space-between', textAlign: 'left', color: tokenText.primary, textTransform: 'none', '&:hover': { bgcolor: 'transparent' } }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                  <Box sx={{ width: 22, height: 22, borderRadius: '8px', bgcolor: step.color, color: tokenCommon.white, display: 'grid', placeItems: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
                    {step.number}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700 }}>{step.title}</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', fontWeight: 500 }}>{step.totalTasks} tasks</Typography>
                  </Box>
                </Box>
                {isExpanded ? <KeyboardArrowDownIcon sx={{ color: tokenText.primary, fontSize: 18 }} /> : <KeyboardArrowRightIcon sx={{ color: tokenText.primary, fontSize: 18 }} />}
              </Button>
              {isExpanded ? (
                <Box sx={{ mt: 0.9, display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.6 }}>
                  {[
                    { value: stats.completed, status: 'completed' as DependencyTaskStatus },
                    { value: stats.assigned, status: 'assigned' as DependencyTaskStatus },
                    { value: stats.notStarted, status: 'not-started' as DependencyTaskStatus },
                    { value: stats.notAssigned, status: 'not-assigned' as DependencyTaskStatus },
                  ].map((item) => (
                    <Box key={`${step.id}-${item.status}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                      {renderDependencyStatusDot(item.status, item.status === 'not-assigned')}
                      <Typography sx={{ color: tokenText.primary, fontSize: '0.7rem', fontWeight: 700 }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              ) : null}
            </Paper>
          );
        })}
      </Box>
      <Button
        fullWidth
        variant="outlined"
        size="small"
        startIcon={<LegendIcon sx={{ fontSize: 15 }} />}
        onClick={toggleAllDependencySteps}
        sx={{ mt: 1.15, height: 32, borderRadius: '8px', borderColor: tokenDivider, color: tokenText.primary, fontSize: '0.74rem', fontWeight: 700, textTransform: 'none', '&:hover': { borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg } }}
      >
        {changeoverAssignmentSteps.every((step) => expandedDependencySteps[step.id]) ? 'Collapse all' : 'Expand all'}
      </Button>
    </Paper>
  );

  const renderDependencyControls = () => (
    <Box sx={{ display: 'flex', alignItems: 'end', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'end', gap: 0.8, flexWrap: 'wrap' }}>
        <Box>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 700, textTransform: 'uppercase', mb: 0.4 }}>View mode</Typography>
          <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
            <Button
              variant={dependencyViewMode === 'flow' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<DependencyFlowIcon sx={{ fontSize: 15 }} />}
              onClick={() => setDependencyViewMode('flow')}
              sx={{ height: 30, borderRadius: '8px', textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, bgcolor: dependencyViewMode === 'flow' ? `${tokenBrand.softBg} !important` : 'background.paper', color: tokenBrand.main, borderColor: dependencyViewMode === 'flow' ? tokenBrand.main : tokenDivider, boxShadow: 'none', '&:hover': { borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg, boxShadow: 'none' } }}
            >
              Flow (Dependencies)
            </Button>
            <Button
              variant={dependencyViewMode === 'timeline' ? 'contained' : 'outlined'}
              size="small"
              startIcon={<TimelineIcon sx={{ fontSize: 15 }} />}
              onClick={() => setDependencyViewMode('timeline')}
              sx={{ height: 30, borderRadius: '8px', textTransform: 'none', fontSize: '0.72rem', fontWeight: 700, bgcolor: dependencyViewMode === 'timeline' ? `${tokenBrand.softBg} !important` : 'background.paper', color: tokenBrand.main, borderColor: dependencyViewMode === 'timeline' ? tokenBrand.main : tokenDivider, boxShadow: 'none', '&:hover': { borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg, boxShadow: 'none' } }}
            >
              Timeline (Gantt)
            </Button>
          </Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
        {dependencyViewMode === 'timeline' ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 700 }}>Zoom</Typography>
            <Button variant="outlined" size="small" onClick={() => setTimelineZoom((prev) => Math.max(80, prev - 10))} sx={{ minWidth: 30, height: 30, borderRadius: '8px', borderColor: tokenDivider, color: tokenBrand.main }}>-</Button>
            <Typography sx={{ color: tokenText.primary, fontSize: '0.74rem', fontWeight: 700, width: 42, textAlign: 'center' }}>{timelineZoom}%</Typography>
            <Button variant="outlined" size="small" onClick={() => setTimelineZoom((prev) => Math.min(140, prev + 10))} sx={{ minWidth: 30, height: 30, borderRadius: '8px', borderColor: tokenDivider, color: tokenBrand.main }}>+</Button>
          </Box>
        ) : null}
        <Button
          variant="outlined"
          size="small"
          startIcon={<LegendIcon sx={{ fontSize: 15 }} />}
          onClick={() => setShowDependencyLegend((prev) => !prev)}
          sx={{ height: 30, borderRadius: '8px', borderColor: tokenDivider, color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', '&:hover': { borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg } }}
        >
          Legend
        </Button>
      </Box>
    </Box>
  );

  const renderDependencyLegend = () => (
    <Paper elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: 'background.paper', p: 1.2, minWidth: 150 }}>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', mb: 1 }}>Legend</Typography>
      <Box sx={{ display: 'grid', gap: 0.75 }}>
        {[
          { label: 'Finish -> Start (FS)', type: 'solid' },
          { label: 'Start -> Start (SS)', type: 'dash' },
          { label: 'Finish -> Finish (FF)', type: 'dash' },
          { label: 'Start -> Finish (SF)', type: 'dash' },
        ].map((item) => (
          <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
            <Box sx={{ width: 24, borderTop: `2px ${item.type === 'solid' ? 'solid' : 'dashed'} ${tokenText.primary}`, position: 'relative', '&:after': { content: '""', position: 'absolute', right: -2, top: -4, width: 6, height: 6, borderTop: `2px solid ${tokenText.primary}`, borderRight: `2px solid ${tokenText.primary}`, transform: 'rotate(45deg)' } }} />
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.67rem', fontWeight: 500 }}>{item.label}</Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', mt: 1.6, mb: 0.85 }}>Status</Typography>
      <Box sx={{ display: 'grid', gap: 0.7 }}>
        {(['completed', 'assigned', 'not-started', 'not-assigned'] as DependencyTaskStatus[]).map((status) => (
          <Box key={status} sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
            {renderDependencyStatusDot(status, status === 'not-assigned')}
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.67rem', fontWeight: 500 }}>{getDependencyStatusTone(status).label}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );

  const renderDependencyBuilder = () => (
    <Paper elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: 'background.paper', p: 1, mb: 1 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 180px auto' }, gap: 0.85, alignItems: 'end' }}>
        <FormControl size="small" fullWidth>
          <InputLabel>Predecessor</InputLabel>
          <Select label="Predecessor" value={dependencyFromTaskId} onChange={(event) => setDependencyFromTaskId(String(event.target.value))} sx={{ height: 32, fontSize: '0.74rem' }}>
            {changeoverAssignmentTasks.map((task) => <MenuItem key={`from-${task.id}`} value={task.id}>{task.code} - {task.task}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Successor</InputLabel>
          <Select label="Successor" value={dependencyToTaskId} onChange={(event) => setDependencyToTaskId(String(event.target.value))} sx={{ height: 32, fontSize: '0.74rem' }}>
            {changeoverAssignmentTasks.map((task) => <MenuItem key={`to-${task.id}`} value={task.id}>{task.code} - {task.task}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" fullWidth>
          <InputLabel>Type</InputLabel>
          <Select label="Type" value={dependencyType} onChange={(event) => setDependencyType(event.target.value as DependencyType)} sx={{ height: 32, fontSize: '0.74rem' }}>
            <MenuItem value="FS">Finish - Start</MenuItem>
            <MenuItem value="SS">Start - Start</MenuItem>
            <MenuItem value="FF">Finish - Finish</MenuItem>
            <MenuItem value="SF">Start - Finish</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          size="small"
          startIcon={<DependencyFlowIcon sx={{ fontSize: 15 }} />}
          onClick={addDependencyDraft}
          disabled={dependencyFromTaskId === dependencyToTaskId}
          sx={{ height: 32, borderRadius: '8px', bgcolor: `${tokenBrand.main} !important`, color: `${tokenBrand.contrast} !important`, fontSize: '0.72rem', fontWeight: 700, textTransform: 'none', whiteSpace: 'nowrap', boxShadow: 'none', '&:hover': { bgcolor: `${tokenBrand.dark} !important`, boxShadow: 'none' } }}
        >
          Add dependency
        </Button>
      </Box>
      <Box sx={{ mt: 0.8, display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
        {dependencyDrafts.slice(-4).map((dependency) => {
          const fromTask = getAssignmentTask(dependency.fromTaskId);
          const toTask = getAssignmentTask(dependency.toTaskId);
          return (
            <Chip
              key={dependency.id}
              size="small"
              label={`${fromTask?.code ?? ''} -> ${toTask?.code ?? ''} ${dependency.type}`}
              onDelete={() => removeDependencyDraft(dependency.id)}
              sx={{ height: 22, borderRadius: '8px', bgcolor: tokenNeutral.lightest, color: tokenText.primary, border: `1px solid ${tokenDivider}`, fontSize: '0.66rem', fontWeight: 700 }}
            />
          );
        })}
      </Box>
    </Paper>
  );

  const renderDependencyFlowView = () => {
    const flowBoardWidth = 1020;
    const flowColumnWidth = flowBoardWidth / changeoverAssignmentSteps.length;
    const flowColumnPadding = 18;
    const flowHeaderHeight = 54;
    const flowCardHeight = 84;
    const flowCardGap = 12;
    const dependencyTaskIds = new Set<string>();
    dependencyDrafts.forEach((dependency) => {
      dependencyTaskIds.add(dependency.fromTaskId);
      dependencyTaskIds.add(dependency.toTaskId);
    });
    const visibleTaskIdsByStep = changeoverAssignmentSteps.reduce((acc, step) => {
      const stepTasks = changeoverAssignmentTasks.filter((task) => task.stepId === step.id);
      const defaultTaskIds = stepTasks.slice(0, step.defaultVisibleTasks).map((task) => task.id);
      const dependencyTaskIdsForStep = stepTasks
        .filter((task) => dependencyTaskIds.has(task.id))
        .map((task) => task.id);
      acc[step.id] = Array.from(new Set([...defaultTaskIds, ...dependencyTaskIdsForStep]));
      return acc;
    }, {} as Record<ChangeoverAssignmentStepId, string[]>);
    const flowTaskPositions: Record<string, { columnIndex: number; rowIndex: number }> = {};
    changeoverAssignmentSteps.forEach((step, columnIndex) => {
      visibleTaskIdsByStep[step.id].forEach((taskId, rowIndex) => {
        flowTaskPositions[taskId] = { columnIndex, rowIndex };
      });
    });
    const maxFlowRows = Math.max(1, ...Object.values(visibleTaskIdsByStep).map((taskIds) => taskIds.length));
    const flowBoardHeight = flowHeaderHeight + (maxFlowRows * flowCardHeight) + (Math.max(maxFlowRows - 1, 0) * flowCardGap) + 18;
    const getFlowAnchor = (taskId: string, side: 'left' | 'right') => {
      const position = flowTaskPositions[taskId];
      if (!position) return null;
      const columnX = position.columnIndex * flowColumnWidth;
      return {
        x: side === 'right' ? columnX + flowColumnWidth - flowColumnPadding : columnX + flowColumnPadding,
        y: flowHeaderHeight + (position.rowIndex * (flowCardHeight + flowCardGap)) + (flowCardHeight / 2),
      };
    };
    const visibleDependencies: Array<{ dependency: ChangeoverDependency; from: { x: number; y: number }; to: { x: number; y: number } }> = [];
    dependencyDrafts.forEach((dependency) => {
      const from = getFlowAnchor(dependency.fromTaskId, 'right');
      const to = getFlowAnchor(dependency.toTaskId, 'left');
      if (from && to) visibleDependencies.push({ dependency, from, to });
    });
    const buildDependencyPath = (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const sameColumn = Math.abs(from.x - to.x) < flowColumnWidth / 2;
      if (sameColumn) {
        const loopX = Math.min(flowBoardWidth - 12, from.x + 28);
        return `M ${from.x} ${from.y} C ${loopX} ${from.y}, ${loopX} ${to.y}, ${to.x} ${to.y}`;
      }
      const direction = to.x >= from.x ? 1 : -1;
      const controlOffset = Math.max(38, Math.abs(to.x - from.x) * 0.45);
      return `M ${from.x} ${from.y} C ${from.x + (direction * controlOffset)} ${from.y}, ${to.x - (direction * controlOffset)} ${to.y}, ${to.x} ${to.y}`;
    };
    return (
      <Box>
        <Paper elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: 'background.paper', overflow: 'hidden' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: showDependencyLegend ? 'minmax(0, 1fr) 166px' : '1fr' }, minHeight: 410 }}>
            <Box sx={{ overflowX: 'auto' }}>
              <Box sx={{ minWidth: flowBoardWidth, minHeight: flowBoardHeight, position: 'relative', display: 'grid', gridTemplateColumns: `repeat(${changeoverAssignmentSteps.length}, ${flowColumnWidth}px)`, borderRight: { xl: showDependencyLegend ? `1px solid ${tokenDivider}` : 'none' } }}>
                <svg
                  width={flowBoardWidth}
                  height={flowBoardHeight}
                  viewBox={`0 0 ${flowBoardWidth} ${flowBoardHeight}`}
                  style={{ position: 'absolute', inset: 0, zIndex: 3, pointerEvents: 'none' }}
                >
                  <defs>
                    <marker id="dependency-flow-arrowhead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={tokenText.primary} />
                    </marker>
                  </defs>
                  {visibleDependencies.map(({ dependency, from, to }, index) => {
                    const midX = (from.x + to.x) / 2;
                    const midY = (from.y + to.y) / 2;
                    return (
                      <React.Fragment key={`dependency-arrow-${dependency.id}`}>
                        <path
                          d={buildDependencyPath(from, to)}
                          fill="none"
                          stroke={tokenText.primary}
                          strokeWidth={dependency.type === 'FS' ? 1.8 : 1.5}
                          strokeDasharray={dependency.type === 'FS' ? undefined : '6 5'}
                          markerEnd="url(#dependency-flow-arrowhead)"
                          opacity={0.9}
                        />
                        <rect x={midX - 13} y={midY - 8 - (index % 2) * 8} width="26" height="16" rx="5" fill={tokenCommon.white} stroke={tokenDivider} />
                        <text x={midX} y={midY + 3 - (index % 2) * 8} textAnchor="middle" fontSize="9" fontWeight="700" fill={tokenText.primary}>{dependency.type}</text>
                      </React.Fragment>
                    );
                  })}
                </svg>
                {changeoverAssignmentSteps.map((step, columnIndex) => {
                  const taskIds = visibleTaskIdsByStep[step.id];
                  const totalHidden = Math.max(step.totalTasks - taskIds.length, 0);
                  return (
                    <Box key={step.id} sx={{ p: 1.05, borderRight: columnIndex < changeoverAssignmentSteps.length - 1 ? `1px solid ${tokenDivider}` : 'none', position: 'relative', zIndex: 2, minHeight: flowBoardHeight }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1 }}>
                        <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: step.softColor, color: step.color, border: `1px solid ${step.color}`, display: 'grid', placeItems: 'center', fontSize: '0.68rem', fontWeight: 900 }}>{step.number}</Box>
                        <Box>
                          <Typography sx={{ color: tokenText.primary, fontSize: '0.7rem', fontWeight: 700 }}>{step.title}</Typography>
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 500 }}>{step.totalTasks} tasks</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'grid', gap: 0.9 }}>
                        {taskIds.map((taskId) => {
                          const task = getAssignmentTask(taskId);
                          if (!task) return null;
                          return (
                            <Box key={taskId} sx={{ position: 'relative', height: flowCardHeight }}>
                              {renderDependencyTaskCard(task, { flow: true })}
                            </Box>
                          );
                        })}
                        {totalHidden > 0 ? (
                          <Button variant="outlined" size="small" sx={{ height: 28, borderRadius: '8px', borderStyle: 'dashed', borderColor: tokenDivider, color: tokenBrand.main, fontSize: '0.7rem', fontWeight: 700, textTransform: 'none', '&:hover': { borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg } }}>
                            + {totalHidden} more tasks
                          </Button>
                        ) : null}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
            {showDependencyLegend ? <Box sx={{ p: 1.05 }}>{renderDependencyLegend()}</Box> : null}
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderTimelineBar = (placement: TimelineTaskPlacement, rowIndex: number) => {
    const task = getAssignmentTask(placement.taskId);
    if (!task) return null;
    const step = getAssignmentStep(task.stepId);
    const assignee = operatorById.get(assignmentDrafts[task.id] ?? '');
    const left = 12 + (placement.startMinute / 45) * 84;
    const width = (placement.durationMinute / 45) * 84;
    const status = dependencyStatusByTaskId[task.id] ?? 'not-assigned';
    return (
      <Box
        key={`timeline-${placement.taskId}`}
        onClick={() => {
          setSelectedDependencyTaskId(task.id);
          setDependencyFromTaskId(task.id);
        }}
        sx={{
          position: 'absolute',
          left: `${left}%`,
          top: 34 + rowIndex * 82,
          width: `${width}%`,
          minWidth: 132,
          height: 34,
          borderRadius: 1,
          border: `1px ${status === 'not-assigned' ? 'dashed' : 'solid'} ${step.color}`,
          bgcolor: status === 'not-assigned' ? 'background.paper' : step.softColor,
          display: 'flex',
          alignItems: 'center',
          gap: 0.65,
          px: 0.8,
          cursor: 'pointer',
          boxShadow: 'none',
          zIndex: 3,
        }}
      >
        <Typography noWrap sx={{ color: tokenText.primary, fontSize: '0.66rem', fontWeight: 700, flex: 1 }}>
          {task.code} {task.task}
        </Typography>
        {assignee ? renderOperatorAvatar(assignee, 18) : renderDependencyStatusDot(status, status === 'not-assigned')}
        <Typography sx={{ color: tokenText.primary, fontSize: '0.62rem', fontWeight: 700 }}>{placement.durationMinute} min</Typography>
      </Box>
    );
  };

  const renderDependenciesTimelineView = () => {
    const timelineWidth = 1120 * (timelineZoom / 100);
    return (
      <Box>
        <Paper elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: 'background.paper', overflow: 'hidden' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ width: timelineWidth, minWidth: 960, position: 'relative', p: 1.2, pb: 0.8 }}>
              <Box sx={{ height: 38, pl: 118, position: 'relative', borderBottom: `1px solid ${tokenDivider}` }}>
                <Typography sx={{ position: 'absolute', left: 0, top: 1, color: tokenText.primary, fontSize: '0.68rem', fontWeight: 700 }}>Start<br />14:30</Typography>
                {timelineTickMarks.map((tick) => (
                  <Box key={tick.label} sx={{ position: 'absolute', left: `${12 + (tick.minute / 45) * 84}%`, top: 0, height: '100%' }}>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.68rem', fontWeight: 700, transform: 'translateX(-50%)' }}>{tick.label}</Typography>
                    <Box sx={{ mt: 1.1, height: 10, borderLeft: `1px solid ${tokenDivider}` }} />
                  </Box>
                ))}
                <Typography sx={{ position: 'absolute', right: 8, top: 1, color: tokenText.primary, fontSize: '0.68rem', fontWeight: 700, textAlign: 'right' }}>Target completion<br />15:05</Typography>
              </Box>
              <Box sx={{ position: 'relative', height: 5 * 82 + 32 }}>
                {changeoverAssignmentSteps.map((step, index) => (
                  <Box key={`timeline-row-${step.id}`} sx={{ position: 'absolute', left: 0, right: 0, top: index * 82, height: 82, borderBottom: `1px solid ${tokenDivider}` }}>
                    <Box sx={{ position: 'absolute', left: 0, top: 25, display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: step.softColor, color: step.color, border: `1px solid ${step.color}`, display: 'grid', placeItems: 'center', fontSize: '0.62rem', fontWeight: 900 }}>{step.number}</Box>
                      <Typography sx={{ color: step.color, fontSize: '0.7rem', fontWeight: 900 }}>{step.title}</Typography>
                    </Box>
                  </Box>
                ))}
                {Array.from({ length: 10 }).map((_, index) => (
                  <Box key={`timeline-grid-${index}`} sx={{ position: 'absolute', top: 0, bottom: 0, left: `${12 + index * 8.4}%`, borderLeft: `1px solid ${tokenDivider}` }} />
                ))}
                <Box sx={{ position: 'absolute', top: 0, bottom: 0, left: `${12 + (35 / 45) * 84}%`, borderLeft: `2px dashed ${tokenBrand.main}`, zIndex: 1 }} />
                {timelineTaskPlacements.map((placement) => {
                  const task = getAssignmentTask(placement.taskId);
                  if (!task) return null;
                  const rowIndex = changeoverAssignmentSteps.findIndex((step) => step.id === task.stepId);
                  return renderTimelineBar(placement, rowIndex);
                })}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  };

  const renderDependenciesView = () => (
    <Box>
      {renderDependencyControls()}
      {renderDependencyBuilder()}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '225px minmax(0, 1fr)' }, gap: 1 }}>
        {renderDependencySidebar()}
        {dependencyViewMode === 'flow' ? renderDependencyFlowView() : renderDependenciesTimelineView()}
      </Box>
    </Box>
  );

  const hasMissingCenterlineUnit = centerlineParameters.some((step) => !step.parameterUnit.trim());
  const hasMissingParameterCheckUnit = changeoverOperatorRoutines.some((operator) => (
    operator.steps.some((step) => step.phase === 'Centerline' && !step.parameterUnit.trim())
  ));
  const isSaveDisabled = (activeTab === 'Centerline' && hasMissingCenterlineUnit)
    || (activeTab === 'Changeover' && hasMissingParameterCheckUnit);
  const activityStartIndex = orderedActivities.length === 0 ? 0 : (currentActivityPage - 1) * activityPageSize + 1;
  const activityEndIndex = Math.min(currentActivityPage * activityPageSize, orderedActivities.length);

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 2.4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Box sx={{ maxWidth: 920 }}>
            <Typography variant="h5" sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.334, letterSpacing: 0 }}>Manage Activities</Typography>
          </Box>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog} sx={containedActionSx}>Create Activity</Button>
        </Box>
      </Box>

      <Paper elevation={0} sx={assistantPanelSx}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2, px: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
            <SparkleIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
            <Typography variant="caption" sx={{ color: tokenBrand.main, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>BLU.AI Insights</Typography>
          </Box>
          <Button size="small" endIcon={<ChevronRightIcon sx={{ fontSize: 16 }} />} sx={{ minWidth: 0, textTransform: 'none', color: tokenBrand.main, fontWeight: 500, borderRadius: '8px', px: 0.8 }}>View all insights</Button>
        </Box>
        <Box sx={{ px: 2, py: 1.5, borderRadius: '6px', bgcolor: 'rgba(0,0,0,0.03)', border: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{ color: tokenBrand.main, display: 'flex', flexShrink: 0 }}><ActivityIcon sx={{ fontSize: 18 }} /></Box>
          <Typography variant="body2" sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.75rem', lineHeight: 1.3 }}>
            <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>Data suggests "Inspect lubrication points"</Box>
            {' - '}
            interval could be extended from 7 to 10 days without risk.
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 0.98fr) minmax(0, 1.02fr)' }, gap: 1.5, alignItems: 'stretch' }}>
        <Paper elevation={0} sx={{ ...pageCardSx, overflow: 'hidden', minHeight: 640 }}>
          <Box sx={{ px: 2, pt: 1.8, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap' }}>
              <Typography sx={sectionTitleSx}>1. Activity Routines</Typography>
              <Chip label={managedActivities.length} size="small" sx={{ height: 20, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenBrand.lightest}`, fontSize: '0.68rem', fontWeight: 700 }} />
            </Box>
            <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.78rem', fontWeight: 400 }}>These are your configured activity routines.</Typography>
          </Box>

          <Box sx={{ px: 1.8, py: 1.2, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(230px, 1fr) auto auto' }, gap: 1, alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(event) => { setSearchQuery(event.target.value); setActivityPage(1); }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: tokenText.secondary, fontSize: 18 }} /></InputAdornment> }}
              sx={{ '& .MuiInputBase-root': { height: 40, borderRadius: '8px' }, '& .MuiInputBase-input': { fontSize: '0.84rem', fontWeight: 500 } }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterIcon sx={{ fontSize: 17 }} />}
              onClick={(event) => setFilterAnchorEl(event.currentTarget)}
              sx={{ height: 40, ...outlinedActionSx, fontSize: '0.78rem', px: 1.35 }}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              startIcon={<TuneIcon sx={{ fontSize: 17 }} />}
              endIcon={<ExpandMoreIcon sx={{ fontSize: 17 }} />}
              onClick={(event) => setGroupAnchorEl(event.currentTarget)}
              sx={{ height: 40, ...outlinedActionSx, fontSize: '0.78rem', px: 1.35, whiteSpace: 'nowrap' }}
            >
              Group by: {groupBy}
            </Button>
          </Box>

          <TableContainer sx={{ px: 1.2 }}>
            <Table size="small" sx={{ minWidth: 700, borderCollapse: 'separate', borderSpacing: '0 0' }}>
              <TableHead>
                <TableRow sx={{ '& th': { color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500, textTransform: 'none', letterSpacing: 0, borderBottom: `1px solid ${tokenDivider}`, py: 0.85 } }}>
                  <TableCell sx={{ pl: 1 }}>Activity</TableCell>
                  <TableCell sx={{ width: 104 }}>Type</TableCell>
                  <TableCell sx={{ width: 218 }}>Location / Equipment / Component</TableCell>
                  <TableCell sx={{ width: 190 }}>Frequency</TableCell>
                  <TableCell align="right" sx={{ pr: 1, width: 76 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedActivities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} sx={{ py: 5, textAlign: 'center', color: tokenText.secondary, fontWeight: 500 }}>No activities match the current filters.</TableCell>
                  </TableRow>
                ) : null}
                {pagedActivities.map((row) => {
                  const typeTone = getCategoryTone(row.category);
                  const isSelected = selectedActivityForView?.id === row.id;
                  const frequencyDetail = row.frequencyConfig ? summarizeFrequencyConfig(row.frequencyConfig) : row.frequency === 'Per Shift'
                      ? 'Every shift'
                      : row.frequency === 'Weekly'
                        ? 'Every 1 week(s)'
                        : row.frequency === 'Biweekly'
                          ? 'Every 2 week(s)'
                          : 'Every day';

                  return (
                    <TableRow
                      key={row.id}
                      hover
                      onClick={() => {
                        setSelectedActivityId(row.id);
                        setVisibleOccurrenceCount(5);
                        setRescheduleDialogOpen(false);
                      }}
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isSelected ? tokenBrand.softBg : 'background.paper',
                        outline: isSelected ? `1px solid ${tokenBrand.main}` : 'none',
                        outlineOffset: -1,
                        '& td': { borderBottom: `1px solid ${tokenDivider}`, py: 1.15 },
                        '&:hover td': { bgcolor: tokenNeutral.lightest },
                      }}
                    >
                      <TableCell sx={{ pl: 1, borderTopLeftRadius: isSelected ? 1 : 0, borderBottomLeftRadius: isSelected ? 1 : 0 }}>
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.25 }}>{row.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={row.category} sx={{ height: 23, bgcolor: typeTone.bg, color: typeTone.color, border: `1px solid ${typeTone.border}`, fontSize: '0.68rem', fontWeight: 900 }} />
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 500, lineHeight: 1.35 }}>{row.location}</Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', fontWeight: 400, lineHeight: 1.35 }}>{row.equipment}</Typography>
                        {row.component ? (
                          <Typography sx={{ color: tokenBrand.main, fontSize: '0.7rem', fontWeight: 500, lineHeight: 1.35 }}>{row.component}</Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 500, lineHeight: 1.35 }}>{row.category === 'Changeover' ? 'N/A' : row.frequencyConfig?.frequency ?? row.frequency}</Typography>
                        {row.category !== 'Changeover' ? (
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', fontWeight: 400, lineHeight: 1.35 }}>{frequencyDetail}</Typography>
                        ) : null}
                      </TableCell>
                      <TableCell align="right" sx={{ pr: 1, borderTopRightRadius: isSelected ? 1 : 0, borderBottomRightRadius: isSelected ? 1 : 0 }}>
                        <IconButton
                          size="small"
                          onClick={(event) => {
                            event.stopPropagation();
                            openActions(event, row.id);
                          }}
                          sx={{ ...lightHeaderIconButtonSx, width: 34, height: 34, borderRadius: 1.5 }}
                        >
                          <MoreIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ px: 1.8, py: 1.55, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.78rem', fontWeight: 400 }}>
              Showing {activityStartIndex} to {activityEndIndex} of {orderedActivities.length} activities
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
              <IconButton
                size="small"
                disabled={currentActivityPage === 1}
                onClick={() => setActivityPage((prev) => Math.max(1, prev - 1))}
                sx={{ width: 32, height: 32, borderRadius: '8px', border: `1px solid ${tokenDivider}`, color: tokenText.primary }}
              >
                <KeyboardArrowRightIcon sx={{ fontSize: 18, transform: 'rotate(180deg)' }} />
              </IconButton>
              {Array.from({ length: activityPageCount }, (_, index) => index + 1).slice(0, 3).map((page) => (
                (() => {
                  const isActivePage = page === currentActivityPage;
                  return (
                    <Button
                      key={page}
                      variant={isActivePage ? 'contained' : 'outlined'}
                      onClick={() => setActivityPage(page)}
                      sx={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: '8px',
                        px: 0,
                        bgcolor: isActivePage ? `${tokenBrand.main} !important` : 'background.paper',
                        color: isActivePage ? `${tokenCommon.white} !important` : `${tokenText.primary} !important`,
                        borderColor: isActivePage ? tokenBrand.main : tokenDivider,
                        boxShadow: 'none',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        '&:hover': {
                          bgcolor: isActivePage ? `${tokenBrand.dark} !important` : tokenNeutral.lightest,
                          borderColor: isActivePage ? tokenBrand.dark : tokenDivider,
                          boxShadow: 'none',
                        },
                      }}
                    >
                      {page}
                    </Button>
                  );
                })()
              ))}
              <IconButton
                size="small"
                disabled={currentActivityPage === activityPageCount}
                onClick={() => setActivityPage((prev) => Math.min(activityPageCount, prev + 1))}
                sx={{ width: 32, height: 32, borderRadius: '8px', border: `1px solid ${tokenDivider}`, color: tokenText.primary }}
              >
                <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ ...pageCardSx, overflow: 'hidden', minHeight: 640 }}>
          <Box sx={{ px: 2, pt: 1.8, pb: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.4, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={sectionTitleSx}>2. Upcoming Occurrences</Typography>
              <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.78rem', fontWeight: 400 }}>Next scheduled occurrences for the selected activity routine.</Typography>
            </Box>
          </Box>

          {selectedActivityForView ? (
            <>
              <Box sx={{ mx: 1.8, my: 1, px: 1.4, py: 1.15, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap' }}>
                <Box sx={{ minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.2 }}>{selectedActivityForView.title}</Typography>
                    {(() => {
                      const tone = getCategoryTone(selectedActivityForView.category);
                      return <Chip size="small" label={selectedActivityForView.category} sx={{ height: 22, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontSize: '0.68rem', fontWeight: 900 }} />;
                    })()}
                  </Box>
                  <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 1.3, flexWrap: 'wrap', color: tokenText.secondary }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}><PlaceIcon sx={{ fontSize: 15 }} /><Typography sx={{ fontSize: '0.74rem', fontWeight: 400 }}>{selectedActivityForView.location}</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}><EquipmentIcon sx={{ fontSize: 15 }} /><Typography sx={{ fontSize: '0.74rem', fontWeight: 400 }}>{selectedActivityForView.equipment}</Typography></Box>
                    {selectedActivityForView.component ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}><ComponentIcon sx={{ fontSize: 15 }} /><Typography sx={{ fontSize: '0.74rem', fontWeight: 400 }}>{selectedActivityForView.component}</Typography></Box>
                    ) : null}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}><AccessTimeIcon sx={{ fontSize: 15 }} /><Typography sx={{ fontSize: '0.74rem', fontWeight: 400 }}>{selectedActivityForView.category === 'Changeover' ? 'N/A' : selectedActivityForView.frequency}</Typography></Box>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                    onClick={() => openAddOccurrenceDialog(selectedActivityForView)}
                    sx={{ height: 38, ...outlinedActionSx, fontSize: '0.76rem', px: 1.45, whiteSpace: 'nowrap' }}
                  >
                    Add Occurrence
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                    onClick={() => openEditDialog(selectedActivityForView)}
                    sx={{ height: 38, ...outlinedActionSx, fontSize: '0.76rem', px: 1.45, whiteSpace: 'nowrap' }}
                  >
                    Edit Routine
                  </Button>
                </Box>
              </Box>

              <TableContainer sx={{ px: 1.2, mt: 0.9 }}>
                <Table size="small" sx={{ minWidth: 760 }}>
                  <TableHead>
                    <TableRow sx={{ '& th': { color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500, textTransform: 'none', letterSpacing: 0, borderBottom: `1px solid ${tokenDivider}`, py: 0.85 } }}>
                      <TableCell sx={{ pl: 1, width: 190 }}>Next Occurrence</TableCell>
                      <TableCell sx={{ width: 186 }}>Shift</TableCell>
                      <TableCell sx={{ width: 122 }}>Status</TableCell>
                      <TableCell sx={{ width: 170 }}>{selectedActivityForView.category === 'Changeover' ? 'Assignment Scope' : 'Assigned To'}</TableCell>
                      <TableCell align="right" sx={{ pr: 1, width: 300 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {visibleOccurrences.map((occurrence) => {
                      const shiftMeta = getShiftMeta(occurrence.shift);
                      const statusTone = getOccurrenceStatusTone(occurrence.status);
                      const isChangeoverOccurrence = selectedActivityForView.category === 'Changeover';
                      const isExpanded = isChangeoverOccurrenceExpanded(occurrence.id);
                      return (
                        <React.Fragment key={occurrence.id}>
                          <TableRow sx={{ '& td': { borderBottom: isChangeoverOccurrence && isExpanded ? 'none' : `1px solid ${tokenDivider}`, py: 1.05 } }}>
                            <TableCell sx={{ pl: 1 }}>
                              <Box sx={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 0.75, alignItems: 'start' }}>
                                <CalendarIcon sx={{ mt: 0.2, fontSize: 17, color: tokenText.secondary }} />
                                <Box>
                                  <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.25 }}>{formatOccurrenceDateLabel(occurrence.date)}</Typography>
                                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.76rem', fontWeight: 400, lineHeight: 1.25 }}>{occurrence.time}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 0.75, alignItems: 'start' }}>
                                {shiftMeta.icon === 'moon' ? <MoonIcon sx={{ mt: 0.15, fontSize: 17, color: tokenInfo.main }} /> : <SunIcon sx={{ mt: 0.15, fontSize: 18, color: tokenWarning.main }} />}
                                <Box>
                                  <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.25 }}>{shiftMeta.label}</Typography>
                                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.76rem', fontWeight: 400, lineHeight: 1.25 }}>{shiftMeta.window}</Typography>
                                </Box>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Click to change status">
                                <Chip
                                  size="small"
                                  label={occurrence.status}
                                  onClick={() => cycleOccurrenceStatus(occurrence)}
                                  sx={{ height: 23, bgcolor: statusTone.bg, color: statusTone.color, border: `1px solid ${statusTone.border}`, fontSize: '0.68rem', fontWeight: 900, cursor: 'pointer' }}
                                />
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              {isChangeoverOccurrence ? (
                                <Box sx={{ display: 'inline-flex', flexDirection: 'column', gap: 0.15, minWidth: 0 }}>
                                  <Chip
                                    size="small"
                                    label="Step-level only"
                                    sx={{ height: 24, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenBrand.lightest}`, fontSize: '0.68rem', fontWeight: 900 }}
                                  />
                                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', fontWeight: 600 }}>Assign operators below</Typography>
                                </Box>
                              ) : (
                                <FormControl size="small" fullWidth>
                                  <Select
                                    value={occurrence.assignedTo}
                                    onChange={(event) => updateOccurrenceAssignee(occurrence, event.target.value)}
                                    displayEmpty
                                    sx={{
                                      height: 32,
                                      borderRadius: '8px',
                                      color: tokenText.primary,
                                      fontSize: '0.76rem',
                                      fontWeight: 700,
                                      bgcolor: 'background.paper',
                                      '& .MuiSelect-select': { py: 0.65 },
                                    }}
                                  >
                                    <MenuItem value="">Unassigned</MenuItem>
                                    {occurrenceAssignees.map((assignee) => (
                                      <MenuItem key={assignee} value={assignee}>{assignee}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              )}
                            </TableCell>
                            <TableCell align="right" sx={{ pr: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.65 }}>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  startIcon={<CalendarIcon sx={{ fontSize: 15 }} />}
                                  onClick={() => openRescheduleDialog(selectedActivityForView, occurrence)}
                                  sx={{ height: 34, ...outlinedActionSx, fontSize: '0.72rem', px: 1.15 }}
                                >
                                  Reschedule
                                </Button>
                                {isChangeoverOccurrence ? (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    endIcon={isExpanded ? <KeyboardArrowDownIcon sx={{ fontSize: 16 }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => toggleChangeoverOccurrence(occurrence.id)}
                                    sx={{ height: 34, ...outlinedActionSx, fontSize: '0.72rem', px: 1.15, whiteSpace: 'nowrap' }}
                                  >
                                    Steps
                                  </Button>
                                ) : null}
                                <Tooltip title="Ignore Occurrence">
                                  <IconButton
                                    size="small"
                                    aria-label="Ignore Occurrence"
                                    onClick={() => ignoreOccurrence(occurrence)}
                                    sx={{ ...lightHeaderIconButtonSx, width: 34, height: 34, borderRadius: '8px', color: tokenError.dark }}
                                  >
                                    <CloseIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </TableCell>
                          </TableRow>
                          {isChangeoverOccurrence && isExpanded ? (
                            <TableRow sx={{ '& td': { borderBottom: `1px solid ${tokenDivider}`, pt: 0, pb: 1.25 } }}>
                              <TableCell colSpan={5} sx={{ px: 1.4 }}>
                                <Paper elevation={0} sx={{ p: 1.2, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                    <Box>
                                      <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 800 }}>
                                        Changeover steps - {formatOccurrenceDateLabel(occurrence.date)}
                                      </Typography>
                                      <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', fontWeight: 500 }}>
                                        Assign each operator for this occurrence and track step load at a glance.
                                      </Typography>
                                    </Box>
                                    <Chip
                                      size="small"
                                      label={`${changeoverOperatorRoutines.length} operators`}
                                      sx={{ height: 24, bgcolor: 'background.paper', color: tokenText.primary, border: `1px solid ${tokenDivider}`, fontWeight: 800 }}
                                    />
                                  </Box>
                                  <Box sx={{ display: 'grid', gap: 0.75 }}>
                                    {changeoverOperatorRoutines.map((operator, operatorIndex) => {
                                      const operatorAssignee = getChangeoverOperatorAssignee(occurrence.id, operator);
                                      const operatorMinutes = operator.steps.reduce((sum, step) => sum + getStepDurationMinutes(step.duration), 0);
                                      const operatorStatus = getChangeoverOperatorStatus(occurrence.id, operator.id);
                                      const operatorStatusTone = getChangeoverOperatorStatusTone(operatorStatus);
                                      return (
                                        <Paper key={`${occurrence.id}-${operator.id}`} elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: 'background.paper', overflow: 'hidden' }}>
                                          <Box sx={{ px: 1.05, py: 0.9, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 130px 240px auto' }, gap: 1, alignItems: 'center', bgcolor: tokenNeutral.lightest }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
                                              {renderOperatorAvatar(operator, 28)}
                                              <Box sx={{ minWidth: 0 }}>
                                                <Typography noWrap sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 900 }}>
                                                  Operator {operatorIndex + 1}
                                                </Typography>
                                                <Typography noWrap sx={{ color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 600 }}>
                                                  {operator.functionLabel || operator.name}
                                                </Typography>
                                              </Box>
                                            </Box>
                                            <Tooltip title="Click to change status">
                                              <Chip
                                                size="small"
                                                label={operatorStatus}
                                                onClick={() => cycleChangeoverOperatorStatus(occurrence.id, operator.id)}
                                                sx={{ justifySelf: { xs: 'start', md: 'stretch' }, height: 24, bgcolor: operatorStatusTone.bg, color: operatorStatusTone.color, border: `1px solid ${operatorStatusTone.border}`, fontSize: '0.68rem', fontWeight: 900, cursor: 'pointer' }}
                                              />
                                            </Tooltip>
                                            <Box>
                                              <Typography sx={{ color: tokenText.secondary, fontSize: '0.62rem', fontWeight: 800, lineHeight: 1, mb: 0.25 }}>Assigned to</Typography>
                                              <FormControl size="small" fullWidth>
                                                <Select
                                                  value={operatorAssignee}
                                                  onChange={(event) => updateChangeoverOperatorAssignee(occurrence.id, operator.id, event.target.value)}
                                                  displayEmpty
                                                  sx={{ height: 34, borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800 }}
                                                >
                                                  <MenuItem value="">Unassigned</MenuItem>
                                                  {changeoverOccurrenceAssigneeOptions.map((assignee) => (
                                                    <MenuItem key={`${occurrence.id}-${operator.id}-${assignee}`} value={assignee}>{assignee}</MenuItem>
                                                  ))}
                                                </Select>
                                              </FormControl>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 0.55, flexWrap: 'wrap' }}>
                                              <Chip size="small" label={`${operator.steps.length} steps`} sx={{ height: 24, bgcolor: 'background.paper', color: tokenText.primary, border: `1px solid ${tokenDivider}`, fontSize: '0.68rem', fontWeight: 900 }} />
                                              <Chip size="small" label={formatStepMinutes(operatorMinutes)} sx={{ height: 24, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenBrand.lightest}`, fontSize: '0.68rem', fontWeight: 900 }} />
                                            </Box>
                                          </Box>
                                        </Paper>
                                      );
                                    })}
                                  </Box>
                                </Paper>
                              </TableCell>
                            </TableRow>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {displayOccurrences.length > visibleOccurrenceCount ? (
                <Box sx={{ px: 1.8, py: 0.95 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 18 }} />}
                    onClick={() => setVisibleOccurrenceCount((prev) => Math.min(displayOccurrences.length, prev + 3))}
                    sx={{ height: 38, ...outlinedActionSx, fontSize: '0.76rem' }}
                  >
                    Load more
                  </Button>
                </Box>
              ) : null}

              {rescheduleDialogOpen && rescheduleActivityId === selectedActivityForView.id && rescheduleOccurrence ? (
                <Paper elevation={0} sx={{ mx: 1.8, mt: 0.7, mb: 1.8, p: 1.55, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', boxShadow: 'none' }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.86rem', fontWeight: 700 }}>Reschedule this occurrence</Typography>
                  <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.74rem', fontWeight: 400 }}>
                    Current slot: {formatDateMmDdYyyy(rescheduleCurrentDate)} at {rescheduleCurrentTime}, {getShiftMeta(rescheduleCurrentShift).label}.
                  </Typography>
                  <Grid container spacing={1.15} sx={{ mt: 1.05, alignItems: 'end' }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Date"
                        value={rescheduleNewDate}
                        onChange={(event) => setRescheduleNewDate(event.target.value)}
                        InputLabelProps={{ shrink: true }}
                        sx={{ '& .MuiInputBase-root': { height: 38, borderRadius: 1.4 }, '& .MuiInputBase-input': { fontSize: '0.82rem', fontWeight: 700 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel id="reschedule-time-label">Time</InputLabel>
                        <Select
                          labelId="reschedule-time-label"
                          label="Time"
                          value={rescheduleNewTime}
                          onChange={(event) => {
                            const nextTime = String(event.target.value);
                            setRescheduleNewTime(nextTime);
                            setRescheduleNewShift(getShiftFromTime(nextTime));
                          }}
                          sx={{ height: 38, borderRadius: 1.4, fontSize: '0.82rem', fontWeight: 800, bgcolor: 'background.paper' }}
                          MenuProps={{ PaperProps: { sx: { maxHeight: 280, borderRadius: '8px' } } }}
                        >
                          {occurrenceTimeOptions.map((time) => (
                            <MenuItem key={`reschedule-time-${time}`} value={time}>{time}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Box sx={{ height: 38, px: 1.15, borderRadius: 1.4, border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                        <Box>
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.62rem', fontWeight: 800, lineHeight: 1 }}>Shift</Typography>
                          <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 900, lineHeight: 1.25 }}>{getShiftMeta(rescheduleNewShift).label}</Typography>
                        </Box>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700 }}>{getShiftMeta(rescheduleNewShift).window}</Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, lg: 7 }}>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Optional note"
                        value={rescheduleJustification}
                        onChange={(event) => setRescheduleJustification(event.target.value)}
                        sx={{ '& .MuiInputBase-root': { height: 38, borderRadius: 1.4 }, '& .MuiInputBase-input': { fontSize: '0.82rem', fontWeight: 700 } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, lg: 5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={saveReschedule}
                          sx={{ minWidth: 84, height: 38, ...containedActionSx, fontSize: '0.78rem' }}
                        >
                          Save
                        </Button>
                        <Button
                          variant="text"
                          onClick={() => setRescheduleDialogOpen(false)}
                          sx={{ height: 38, color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700, borderRadius: '8px' }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              ) : null}
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center', color: tokenText.secondary, fontWeight: 500 }}>Select an activity routine to view its occurrences.</Box>
          )}
        </Paper>
      </Box>

      <Menu anchorEl={filterAnchorEl} open={Boolean(filterAnchorEl)} onClose={() => setFilterAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
        {(['All', 'CIL', 'Centerline', 'Changeover'] as Array<ActivityType | 'All'>).map((type) => (
          <MenuItem
            key={type}
            selected={typeFilter === type}
            onClick={() => {
              setTypeFilter(type);
              setActivityPage(1);
              setFilterAnchorEl(null);
            }}
          >
            {type === 'All' ? 'All types' : type}
          </MenuItem>
        ))}
        <MenuItem onClick={resetRoutineFilters}>Reset filters</MenuItem>
      </Menu>

      <Menu anchorEl={groupAnchorEl} open={Boolean(groupAnchorEl)} onClose={() => setGroupAnchorEl(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        {(['Type', 'Frequency', 'Location'] as ActivityGroupBy[]).map((option) => (
          <MenuItem
            key={option}
            selected={groupBy === option}
            onClick={() => {
              setGroupBy(option);
              setActivityPage(1);
              setGroupAnchorEl(null);
            }}
          >
            {option}
          </MenuItem>
        ))}
      </Menu>

      <Menu anchorEl={actionsAnchorEl} open={Boolean(actionsAnchorEl)} onClose={closeActions} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <MenuItem onClick={() => { if (selectedActivity) openEditDialog(selectedActivity); closeActions(); }}><EditIcon sx={{ mr: 1, fontSize: 17 }} /> Edit activity</MenuItem>
        <MenuItem onClick={() => { if (selectedActivity) openDuplicateDialog(selectedActivity); closeActions(); }}><ActivityIcon sx={{ mr: 1, fontSize: 17 }} /> Duplicate activity</MenuItem>
        <MenuItem onClick={() => { if (selectedActivity) deleteActivity(selectedActivity.id); }} sx={{ color: tokenError.main }}><DeleteIcon sx={{ mr: 1, fontSize: 17 }} /> Delete activity</MenuItem>
      </Menu>

      <Dialog
        open={assignmentDialogOpen}
        onClose={cancelAssignmentDialog}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: 'min(1500px, calc(100vw - 36px))',
            maxWidth: 'none',
            borderRadius: '12px',
            bgcolor: 'background.paper',
            overflow: 'hidden',
          },
        }}
      >
        <Box sx={{ bgcolor: 'background.default', maxHeight: 'calc(100vh - 42px)', overflow: 'auto' }}>
          <Box sx={{ px: { xs: 1.35, md: 1.7 }, pt: { xs: 1.35, md: 1.55 }, pb: 1.05, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2 }}>
              <Box>
                <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.2 }}>
                  Changeover Task Assignment
                </Typography>
                <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontWeight: 400, fontSize: '0.76rem' }}>
                  Assign responsible people for all changeover tasks.
                </Typography>
              </Box>
              <IconButton onClick={cancelAssignmentDialog} size="small" sx={{ width: 34, height: 34, color: tokenText.primary, border: `1px solid ${tokenDivider}`, borderRadius: '8px' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Box sx={{ mt: 1.25, display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 340px' }, gap: 1.25 }}>
              <Paper elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: 'background.paper', p: { xs: 1.15, md: 1.25 } }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.95fr 0.8fr 1.35fr' }, gap: { xs: 1.3, md: 0 }, alignItems: 'stretch' }}>
                  <Box sx={{ pr: { md: 1.5 }, borderRight: { md: `1px solid ${tokenDivider}` } }}>
                    <Typography sx={{ color: tokenBrand.main, fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase' }}>Changeover</Typography>
                    <Typography sx={{ mt: 0.55, color: tokenText.primary, fontWeight: 700, fontSize: '0.98rem' }}>{assignmentActivity?.title || 'Selected changeover'}</Typography>
                    <Box sx={{ mt: 0.7, display: 'flex', alignItems: 'center', gap: 0.6, color: tokenText.secondary }}>
                      <ActivityIcon sx={{ fontSize: 15, color: tokenText.secondary }} />
                      <Typography sx={{ fontSize: '0.74rem', fontWeight: 400 }}>{assignmentActivity?.equipment || 'Z1 Cutter'}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ px: { md: 1.5 }, borderRight: { md: `1px solid ${tokenDivider}` } }}>
                    <Typography sx={{ color: tokenBrand.main, fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase' }}>Occurrence</Typography>
                    <Box sx={{ mt: 0.7, display: 'flex', alignItems: 'center', gap: 0.55 }}>
                      <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.82rem' }}>
                        {assignmentOccurrence ? `${formatOccurrenceDateLabel(assignmentOccurrence.date)}, ${assignmentOccurrence.time}` : 'Selected occurrence'}
                      </Typography>
                      <CalendarIcon sx={{ fontSize: 15, color: tokenText.secondary }} />
                    </Box>
                    <Typography sx={{ mt: 0.55, color: tokenText.secondary, fontSize: '0.72rem', fontWeight: 400 }}>
                      Duration target: <Box component="span" sx={{ color: tokenBrand.main, fontWeight: 700 }}>{assignmentActivity?.duration ?? '35'} min</Box>
                    </Typography>
                  </Box>
                  <Box sx={{ px: { md: 1.5 }, borderRight: { md: `1px solid ${tokenDivider}` } }}>
                    <Typography sx={{ color: tokenBrand.main, fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase' }}>Shift</Typography>
                    <Chip
                      label={assignmentOccurrence ? getShiftMeta(assignmentOccurrence.shift).label : getShiftMeta(assignmentActivity?.nextShift ?? 'Shift 1').label}
                      size="small"
                      sx={{ mt: 0.7, height: 22, borderRadius: '8px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontSize: '0.66rem', fontWeight: 700 }}
                    />
                  </Box>
                  <Box sx={{ pl: { md: 1.5 }, display: 'flex', alignItems: 'center', gap: 0.9 }}>
                    {renderOperatorAvatar({ id: 'john-smith', name: 'John Smith', initials: 'JS', role: 'Technician', color: tokenSuccess.main }, 26)}
                    <Box>
                      <Typography sx={{ color: tokenBrand.main, fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase', mb: 0.55 }}>Requested by</Typography>
                      <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.1 }}>{assignmentOccurrence?.assignedTo ?? 'John Smith'}</Typography>
                      <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', fontWeight: 400 }}>{assignmentOccurrence ? formatOccurrenceDateLabel(assignmentOccurrence.date) : 'Selected date'}</Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: 'background.paper', p: { xs: 1.15, md: 1.25 } }}>
                <Typography sx={{ color: tokenBrand.main, fontSize: '0.66rem', fontWeight: 700, textTransform: 'uppercase' }}>Tasks overview</Typography>
                <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', alignItems: 'center' }}>
                  {[
                    { label: 'Total tasks', value: assignmentStats.total, color: tokenText.primary },
                    { label: 'Unassigned', value: assignmentStats.unassigned, color: tokenWarning.dark },
                    { label: 'Assigned', value: assignmentStats.assigned, color: tokenSuccess.darker },
                  ].map((metric, index) => (
                    <Box key={metric.label} sx={{ pl: index === 0 ? 0 : 2, borderLeft: index === 0 ? 'none' : `1px solid ${tokenDivider}` }}>
                      <Typography sx={{ color: metric.color, fontSize: '1.05rem', fontWeight: 700, lineHeight: 1 }}>{metric.value}</Typography>
                      <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 400 }}>{metric.label}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>

            <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(5, minmax(0, 1fr))' }, gap: { xs: 0.85, md: 1.1 } }}>
              {changeoverAssignmentSteps.map((step) => (
                <Box
                  key={step.id}
                  onClick={() => toggleAssignmentStep(step.id)}
                  sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 0.75, alignItems: 'center', cursor: 'pointer', minWidth: 0 }}
                >
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      border: `1px solid ${step.color}`,
                      bgcolor: step.softColor,
                      color: step.color,
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 900,
                      fontSize: '0.74rem',
                      outline: `3px solid ${step.softColor}`,
                    }}
                  >
                    {step.number}
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>{step.title}</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', fontWeight: 500 }}>{step.totalTasks} tasks</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          <Box sx={{ px: { xs: 1.35, md: 1.7 }, pb: 1.7 }}>
            <Paper elevation={0} sx={{ mt: 1, border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: 'background.paper', overflow: 'hidden' }}>
              <Box sx={{ px: 1.25, py: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', borderBottom: `1px solid ${tokenDivider}` }}>
                <Tabs value={assignmentModalTab} onChange={(_, value) => setAssignmentModalTab(value as AssignmentModalTab)} sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, px: 1.05, color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase' }, '& .Mui-selected': { color: `${tokenText.primary} !important`, fontWeight: 700 }, '& .MuiTabs-indicator': { bgcolor: tokenBrand.main, height: 2 } }}>
                  <Tab value="tasks" label="Tasks by step" />
                </Tabs>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', py: 0.65 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<OpenInFullIcon sx={{ fontSize: 14 }} />}
                    onClick={toggleAllAssignmentTasks}
                    sx={{ height: 30, ...outlinedActionSx, fontSize: '0.72rem' }}
                  >
                    {areAllAssignmentStepsFullyVisible ? 'Collapse all' : 'Expand all'}
                  </Button>
                  <TextField
                    size="small"
                    placeholder="Search tasks..."
                    value={assignmentSearchQuery}
                    onChange={(event) => setAssignmentSearchQuery(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: tokenText.secondary, fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: { xs: '100%', sm: 280 },
                      '& .MuiInputBase-root': { height: 30, borderRadius: '8px' },
                      '& .MuiInputBase-input': { fontSize: '0.74rem', fontWeight: 500 },
                    }}
                  />
                </Box>
              </Box>
              <TableContainer sx={{ maxHeight: { xs: 500, md: '52vh' } }}>
                  <Table size="small" stickyHeader sx={{ minWidth: 1180 }}>
                    <TableHead>
                      <TableRow sx={{ '& th': { bgcolor: tokenNeutral.lightest, color: tokenText.primary, fontSize: '0.68rem', fontWeight: 700, borderBottom: `1px solid ${tokenDivider}` } }}>
                        <TableCell sx={{ width: 360, pl: 4.6 }}>Step / Task</TableCell>
                        <TableCell>Task description</TableCell>
                        <TableCell sx={{ width: 120 }}>Estimated time</TableCell>
                        <TableCell sx={{ width: 170 }}>Skill / Role</TableCell>
                        <TableCell sx={{ width: 245 }}>Assigned to</TableCell>
                        <TableCell sx={{ width: 155 }}>Status</TableCell>
                        <TableCell sx={{ width: 48 }} />
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visibleAssignmentStepGroups.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} sx={{ py: 5, textAlign: 'center', color: tokenText.secondary, fontWeight: 500 }}>
                            No tasks match the current search.
                          </TableCell>
                        </TableRow>
                      ) : null}
                      {visibleAssignmentStepGroups.map(({ step, visibleTasks, remainingTasks }) => {
                        const isStepExpanded = Boolean(expandedAssignmentSteps[step.id]);
                        return (
                          <React.Fragment key={step.id}>
                            <TableRow>
                              <TableCell colSpan={7} sx={{ py: 0, px: 0, bgcolor: 'background.paper', borderBottom: `1px solid ${tokenDivider}`, borderLeft: `4px solid ${step.color}` }}>
                                <Button
                                  fullWidth
                                  onClick={() => toggleAssignmentStep(step.id)}
                                  sx={{ minHeight: 40, px: 1.4, justifyContent: 'flex-start', borderRadius: 0, color: tokenText.primary, textTransform: 'none', '&:hover': { bgcolor: step.softColor } }}
                                >
                                  {isStepExpanded ? <KeyboardArrowDownIcon sx={{ mr: 1, color: step.color }} /> : <KeyboardArrowRightIcon sx={{ mr: 1, color: step.color }} />}
                                  <Box sx={{ width: 22, height: 22, borderRadius: '8px', bgcolor: step.color, color: tokenCommon.white, display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 700, mr: 1.1 }}>{step.number}</Box>
                                  <Typography component="span" sx={{ color: step.color, fontWeight: 700, fontSize: '0.82rem' }}>{step.title}</Typography>
                                  <Typography component="span" sx={{ ml: 0.65, color: tokenText.secondary, fontWeight: 500, fontSize: '0.76rem' }}>({step.totalTasks} tasks)</Typography>
                                </Button>
                              </TableCell>
                            </TableRow>
                            {isStepExpanded ? visibleTasks.map((task) => {
                              const assigneeId = assignmentDrafts[task.id] ?? '';
                              const assignee = operatorById.get(assigneeId);
                              const isAssigned = Boolean(assignee);
                              return (
                                <TableRow key={task.id} sx={{ '& td': { py: 0.8, borderBottom: `1px solid ${tokenDivider}`, color: tokenText.primary, fontSize: '0.76rem' } }}>
                                  <TableCell sx={{ pl: 4.9 }}>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: '42px 1fr', gap: 0.9, alignItems: 'start' }}>
                                      <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 700 }}>{task.code}</Typography>
                                      <Typography sx={{ color: tokenText.primary, fontSize: '0.76rem', fontWeight: 500, lineHeight: 1.35 }}>{task.task}</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell sx={{ color: `${tokenText.secondary} !important`, fontWeight: 400 }}>{task.description}</TableCell>
                                  <TableCell sx={{ color: `${tokenText.primary} !important`, fontWeight: 500 }}>{task.estimatedTime}</TableCell>
                                  <TableCell>{assignee ? renderRoleChip(assignee.role) : null}</TableCell>
                                  <TableCell>
                                    <FormControl size="small" fullWidth>
                                      <Select
                                        displayEmpty
                                        value={assigneeId}
                                        onChange={(event) => updateTaskAssignee(task.id, String(event.target.value))}
                                        renderValue={(value) => renderAssigneeValue(String(value))}
                                        sx={{ height: 32, borderRadius: '8px', bgcolor: 'background.paper', '& .MuiSelect-select': { py: 0.4, display: 'flex', alignItems: 'center' } }}
                                      >
                                        <MenuItem value="">
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: tokenText.disabled, fontSize: '0.82rem', fontWeight: 500 }}>
                                            <PersonOutlineIcon sx={{ fontSize: 16 }} />
                                            Select person...
                                          </Box>
                                        </MenuItem>
                                        {changeoverOperators.map((operator) => (
                                          <MenuItem key={`${task.id}-${operator.id}`} value={operator.id}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, minWidth: 0 }}>
                                              {renderOperatorAvatar(operator, 24)}
                                              <Box sx={{ minWidth: 0 }}>
                                                <Typography noWrap sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 700 }}>{operator.name}</Typography>
                                                <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 400 }}>{operator.role}</Typography>
                                              </Box>
                                            </Box>
                                          </MenuItem>
                                        ))}
                                      </Select>
                                    </FormControl>
                                  </TableCell>
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: isAssigned ? tokenSuccess.darker : tokenWarning.dark, fontWeight: 700 }}>
                                      {isAssigned ? <CheckCircleOutlineIcon sx={{ fontSize: 17 }} /> : <RadioButtonUncheckedIcon sx={{ fontSize: 17 }} />}
                                      <Typography sx={{ fontSize: '0.76rem', fontWeight: 700 }}>{isAssigned ? 'Assigned' : 'Unassigned'}</Typography>
                                    </Box>
                                  </TableCell>
                                  <TableCell align="center">
                                    <Tooltip title={isAssigned ? 'Remove operator' : 'No operator selected'}>
                                      <span>
                                        <IconButton size="small" onClick={() => removeTaskAssignee(task.id)} disabled={!isAssigned} sx={{ color: isAssigned ? tokenError.dark : tokenText.disabled }}>
                                          <ResetIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              );
                            }) : null}
                            {isStepExpanded && remainingTasks > 0 ? (
                              <TableRow>
                                <TableCell colSpan={7} sx={{ py: 0.65, pl: 9.2, borderBottom: `1px solid ${tokenDivider}` }}>
                                  <Button size="small" onClick={() => showAllTasksForStep(step.id)} sx={{ color: tokenBrand.main, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', minHeight: 24, px: 0.5, borderRadius: '8px' }}>
                                    + {remainingTasks} more tasks
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ) : null}
                          </React.Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
              </TableContainer>
            </Paper>

            <Box sx={{ mt: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                <Button
                  variant="outlined"
                  onClick={cancelAssignmentDialog}
                  sx={{ minWidth: 136, height: 34, ...outlinedActionSx, fontSize: '0.74rem' }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={saveAssignments}
                  sx={{ minWidth: 158, height: 34, ...containedActionSx, fontSize: '0.74rem' }}
                >
                  Save assignments
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>

      <Dialog
        open={addOccurrenceDialogOpen}
        onClose={() => setAddOccurrenceDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', bgcolor: 'background.paper' } }}
      >
        <Box sx={{ p: 2.2 }}>
          <Typography sx={{ color: tokenText.primary, fontSize: '1rem', fontWeight: 800 }}>
            Add Occurrence
          </Typography>
          <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.76rem', fontWeight: 400 }}>
            Choose the schedule for this specific occurrence.
          </Typography>

          <Grid container spacing={1.2} sx={{ mt: 1.6 }}>
            <Grid size={{ xs: 12, sm: 5 }}>
              <TextField
                fullWidth
                required
                size="small"
                type="date"
                label="Date"
                value={addOccurrenceDate}
                onChange={(event) => setAddOccurrenceDate(event.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiInputBase-root': { height: 38, borderRadius: 1.4 }, '& .MuiInputBase-input': { fontSize: '0.82rem', fontWeight: 700 } }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 3 }}>
              <FormControl size="small" fullWidth required>
                <InputLabel id="add-occurrence-time-label">Time</InputLabel>
                <Select
                  labelId="add-occurrence-time-label"
                  label="Time"
                  value={addOccurrenceTime}
                  onChange={(event) => {
                    const nextTime = String(event.target.value);
                    setAddOccurrenceTime(nextTime);
                    setAddOccurrenceShift(getShiftFromTime(nextTime));
                  }}
                  sx={{ height: 38, borderRadius: 1.4, fontSize: '0.82rem', fontWeight: 800, bgcolor: 'background.paper' }}
                  MenuProps={{ PaperProps: { sx: { maxHeight: 280, borderRadius: '8px' } } }}
                >
                  {occurrenceTimeOptions.map((time) => (
                    <MenuItem key={`add-occurrence-time-${time}`} value={time}>{time}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Box sx={{ height: 38, px: 1.15, borderRadius: 1.4, border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.62rem', fontWeight: 800, lineHeight: 1 }}>Shift</Typography>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 900, lineHeight: 1.25 }}>{getShiftMeta(addOccurrenceShift).label}</Typography>
                </Box>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700 }}>{getShiftMeta(addOccurrenceShift).window}</Typography>
              </Box>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setAddOccurrenceDialogOpen(false)}
              sx={{ height: 36, ...outlinedActionSx, fontSize: '0.76rem' }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!addOccurrenceDate || !addOccurrenceTime}
              onClick={saveNewOccurrence}
              sx={{ height: 36, ...containedActionSx, fontSize: '0.76rem' }}
            >
              Add Occurrence
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={isActivityDialogOpen} onClose={closeActivityDialog} maxWidth="lg" fullWidth>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: tokenText.primary, mb: 2 }}>
            {editingActivityId ? `Edit ${activeTab} Activity` : 'Create New Activity'}
          </Typography>
          {editingActivityId ? (
            <Tabs value={activeTab} sx={{ mb: 2 }}>
              <Tab value={activeTab} label={`Edit ${activeTab}`} />
            </Tabs>
          ) : (
            <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value as ActivityType)} sx={{ mb: 2 }}>
              <Tab value="CIL" label="Create CIL" />
              <Tab value="Centerline" label="Create Centerline" />
              <Tab value="Changeover" label="Create Changeover" />
            </Tabs>
          )}

          <Paper variant="outlined" sx={{ p: 1.6, mb: 1.8, borderRadius: '12px', borderStyle: 'dashed', borderColor: tokenDivider, bgcolor: tokenNeutral.lightest }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5 }}>
              <Box>
                <Typography sx={{ color: tokenBrand.main, fontWeight: 700 }}>Import from SOP document or Excel spreadsheet</Typography>
                <Typography variant="caption" sx={{ color: tokenText.secondary }}>Upload SOP (PDF, DOCX) or Excel spreadsheet (XLS, XLSX) and AI will auto-fill fields and steps.</Typography>
                {importAppliedMessage ? (
                  <Chip
                    size="small"
                    label={importAppliedMessage}
                    sx={{ display: 'flex', width: 'fit-content', maxWidth: { xs: '100%', md: 620 }, mt: 0.75, bgcolor: tokenSuccess.softBg, color: tokenSuccess.darker, border: `1px solid ${tokenSuccess.lighter}`, fontWeight: 700, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }}
                  />
                ) : null}
              </Box>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                onClick={(event) => setUploadMenuAnchorEl(event.currentTarget)}
                sx={{ ...outlinedActionSx, fontWeight: 700, whiteSpace: 'nowrap' }}
              >
                Upload Document
              </Button>
            </Box>
          </Paper>

          <Menu
            anchorEl={uploadMenuAnchorEl}
            open={Boolean(uploadMenuAnchorEl)}
            onClose={() => setUploadMenuAnchorEl(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={openExcelImportModal}>Excel</MenuItem>
            <MenuItem onClick={() => handlePlaceholderImportOption('SOP')}>SOP</MenuItem>
            <MenuItem onClick={() => handlePlaceholderImportOption('Cognite File')}>Use Cognite File</MenuItem>
          </Menu>

          <Grid container spacing={1.1} sx={{ mb: 1.2 }}>
            <Grid size={{ xs: 12 }}><TextField size="small" fullWidth label={activeTab === 'Centerline' ? 'Centerline Name' : 'Activity Name'} value={activityName} onChange={(e) => setActivityName(e.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: activeTab === 'Changeover' ? 2 : 3 }}><TextField size="small" fullWidth label="Location" value={location} onChange={(e) => setLocation(e.target.value)} /></Grid>
            <Grid size={{ xs: 12, md: activeTab === 'Changeover' ? 2 : 3 }}><TextField size="small" fullWidth label="Equipment" value={equipment} onChange={(e) => setEquipment(e.target.value)} /></Grid>
            {activeTab !== 'Changeover' ? (
              <Grid size={{ xs: 12, md: 3 }}><TextField size="small" fullWidth label="Component" value={activityComponent} onChange={(e) => setActivityComponent(e.target.value)} /></Grid>
            ) : null}
            {activeTab === 'Changeover' ? (
              <>
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="changeover-from-sku">From</InputLabel>
                    <Select
                      labelId="changeover-from-sku"
                      label="From"
                      value={changeoverFrom}
                      onChange={(event) => setChangeoverFrom(String(event.target.value))}
                    >
                      <MenuItem value=""><em>Select SKU</em></MenuItem>
                      {changeoverSkuOptions.map((option) => (
                        <MenuItem key={`changeover-from-${option.value}`} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 3 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel id="changeover-to-sku">To</InputLabel>
                    <Select
                      labelId="changeover-to-sku"
                      label="To"
                      value={changeoverTo}
                      onChange={(event) => setChangeoverTo(String(event.target.value))}
                    >
                      <MenuItem value=""><em>Select SKU</em></MenuItem>
                      {changeoverSkuOptions.map((option) => (
                        <MenuItem key={`changeover-to-${option.value}`} value={option.value}>{option.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </>
            ) : null}
            <Grid size={{ xs: 12, md: activeTab === 'Changeover' ? 2 : 3 }}><TextField size="small" fullWidth label="Duration (min)" value={duration} onChange={(e) => setDuration(e.target.value)} /></Grid>
          </Grid>

          {activeTab !== 'Changeover' ? renderFrequencyModule() : null}

          {activeTab === 'CIL' ? (
            <Box>
              <Typography variant="subtitle2" sx={{ color: tokenText.secondary, mb: 1, fontWeight: 500 }}>STEPS / ACTIVITIES</Typography>
              {cilSteps.map((step, index) => {
                const stepDragState: StepDragState = { list: 'cil', id: step.id };
                return (
                  <Paper
                    key={step.id}
                    variant="outlined"
                    sx={getStepCardSx(stepDragState)}
                    onDragOver={(event) => handleStepDragOver(event, stepDragState)}
                    onDrop={(event) => handleStepDrop(event, stepDragState)}
                  >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      {renderStepDragHandle(stepDragState, index)}
                      <IconButton size="small" onClick={() => setCilSteps((prev) => prev.filter((s) => s.id !== step.id))}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                    {renderStepRequirements(step, (patch) => setCilSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, ...patch } : s)))}
                    <Grid container spacing={1}><Grid size={{ xs: 12, md: 4 }}><FormControl size="small" fullWidth><InputLabel>Type</InputLabel><Select label="Type" value={step.type} onChange={(e) => setCilSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, type: e.target.value } : s))}><MenuItem value="Inspection">Inspection</MenuItem><MenuItem value="Cleaning">Cleaning</MenuItem><MenuItem value="Lubrication">Lubrication</MenuItem><MenuItem value="Tightening">Tightening</MenuItem></Select></FormControl></Grid><Grid size={{ xs: 12, md: 4 }}><TextField size="small" fullWidth label="Duration (min)" value={step.duration} onChange={(e) => setCilSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, duration: e.target.value } : s))} /></Grid><Grid size={{ xs: 12, md: 4 }}><FormControl size="small" fullWidth><InputLabel>Machine condition</InputLabel><Select label="Machine condition" value={step.machineCondition} onChange={(e) => setCilSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, machineCondition: e.target.value } : s))}><MenuItem value="Stopped">Stopped</MenuItem><MenuItem value="Running">Running</MenuItem></Select></FormControl></Grid><Grid size={{ xs: 12 }}>{renderStepEvidenceControls(step, (patch) => setCilSteps((prev) => prev.map((s) => s.id === step.id ? { ...s, ...patch } : s)))}</Grid></Grid>
                  </Paper>
                );
              })}
              <Button variant="outlined" onClick={() => setCilSteps((prev) => [...prev, createCilStep()])} startIcon={<AddIcon />} sx={{ ...outlinedActionSx, width: '100%' }}>Add step</Button>
            </Box>
          ) : null}

          {activeTab === 'Centerline' ? (
            <Box>
              <Typography variant="subtitle2" sx={{ color: tokenText.secondary, mb: 1, fontWeight: 500 }}>PARAMETERS</Typography>
              {centerlineParameters.map((step, index) => {
                const stepDragState: StepDragState = { list: 'centerline', id: step.id };
                return (
                  <Paper
                    key={step.id}
                    variant="outlined"
                    sx={getStepCardSx(stepDragState)}
                    onDragOver={(event) => handleStepDragOver(event, stepDragState)}
                    onDrop={(event) => handleStepDrop(event, stepDragState)}
                  >
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      {renderStepDragHandle(stepDragState, index)}
                      <IconButton size="small" onClick={() => setCenterlineParameters((prev) => prev.filter((s) => s.id !== step.id))}><DeleteIcon fontSize="small" /></IconButton>
                    </Box>
                    {renderStepRequirements(step, (patch) => setCenterlineParameters((prev) => prev.map((s) => s.id === step.id ? { ...s, ...patch } : s)))}
                    <Grid container spacing={1}>
                    <Grid size={{ xs: 12, md: 3 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel id={`centerline-unit-${step.id}`}>Parameter unit</InputLabel>
                        <Select
                          labelId={`centerline-unit-${step.id}`}
                          label="Parameter unit"
                          value={step.parameterUnit}
                          onChange={(event) => setCenterlineParameters((prev) => prev.map((s) => s.id === step.id ? { ...s, parameterUnit: String(event.target.value) } : s))}
                        >
                          {PARAMETER_UNIT_OPTIONS.map((option) => <MenuItem key={`${step.id}-unit-${option}`} value={option}>{option}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField size="small" fullWidth label="Min" value={step.min} onChange={(e) => setCenterlineParameters((prev) => prev.map((s) => s.id === step.id ? { ...s, min: e.target.value } : s))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField size="small" fullWidth label="Target" value={step.target} onChange={(e) => setCenterlineParameters((prev) => prev.map((s) => s.id === step.id ? { ...s, target: e.target.value } : s))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 2 }}>
                      <TextField size="small" fullWidth label="Max" value={step.max} onChange={(e) => setCenterlineParameters((prev) => prev.map((s) => s.id === step.id ? { ...s, max: e.target.value } : s))} />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Machine condition</InputLabel>
                        <Select label="Machine condition" value={step.machineCondition} onChange={(e) => setCenterlineParameters((prev) => prev.map((s) => s.id === step.id ? { ...s, machineCondition: e.target.value } : s))}>
                          <MenuItem value="Running">Running</MenuItem>
                          <MenuItem value="Stopped">Stopped</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                      <Grid size={{ xs: 12 }}>
                        {renderStepEvidenceControls(step, (patch) => setCenterlineParameters((prev) => prev.map((s) => s.id === step.id ? { ...s, ...patch } : s)))}
                      </Grid>
                    </Grid>
                  </Paper>
                );
              })}
              <Button variant="outlined" onClick={() => setCenterlineParameters((prev) => [...prev, createCenterlineParameter()])} startIcon={<AddIcon />} sx={{ ...outlinedActionSx, width: '100%' }}>Add parameter</Button>
            </Box>
          ) : null}

          {activeTab === 'Changeover' ? (
            <Box>
              <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" sx={{ color: tokenText.secondary, fontWeight: 500 }}>STEPS / ACTIVITIES</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', fontWeight: 600 }}>View by:</Typography>
                  <Tabs
                    value={changeoverViewMode}
                    onChange={(_, value) => setChangeoverViewMode(value as ChangeoverStepViewMode)}
                    sx={{
                      minHeight: 32,
                      border: `1px solid ${tokenDivider}`,
                      borderRadius: '8px',
                      bgcolor: 'background.paper',
                      '& .MuiTabs-indicator': { display: 'none' },
                      '& .MuiTab-root': { minHeight: 30, px: 1.3, fontSize: '0.72rem', fontWeight: 800, textTransform: 'none', color: tokenText.secondary },
                      '& .Mui-selected': { bgcolor: `${tokenBrand.main} !important`, color: `${tokenCommon.white} !important`, borderRadius: '7px' },
                    }}
                  >
                    <Tab value="operator" icon={<PersonOutlineIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Operator" />
                    <Tab value="stage" icon={<LegendIcon sx={{ fontSize: 16 }} />} iconPosition="start" label="Stage" />
                  </Tabs>
                </Box>
              </Box>
              {changeoverViewMode === 'operator' ? renderChangeoverOperatorView() : renderChangeoverStageView()}
            </Box>
          ) : null}

          <Box sx={{ mt: 2.2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            <Button variant="outlined" onClick={closeActivityDialog} sx={outlinedActionSx}>Cancel</Button>
            <Button variant="contained" disabled={isSaveDisabled} onClick={saveActivity} sx={containedActionSx}>{editingActivityId ? 'Save changes' : `Create ${activeTab} Activity`}</Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={excelImportOpen} onClose={() => setExcelImportOpen(false)} maxWidth="md" fullWidth>
        <Box sx={{ p: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: tokenText.primary }}>
                Import Excel Routine
              </Typography>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.84rem', fontWeight: 400 }}>
                Importing routines from the uploaded file with AI assistance.
              </Typography>
            </Box>
            <IconButton size="small" onClick={() => setExcelImportOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {excelImportStage === 'upload' ? (
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2, md: 3 },
                minHeight: 230,
                borderRadius: '12px',
                borderStyle: 'dashed',
                borderColor: tokenDivider,
                bgcolor: tokenNeutral.lightest,
                display: 'grid',
                placeItems: 'center',
                textAlign: 'center',
              }}
            >
              <Box>
                <CloudUploadIcon sx={{ fontSize: 42, color: tokenBrand.main, mb: 1 }} />
                <Typography sx={{ color: tokenText.primary, fontWeight: 700, mb: 0.4 }}>
                  Upload CIL routine spreadsheet
                </Typography>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.82rem', fontWeight: 400, mb: 1.5 }}>
                  Supported mock formats: XLS and XLSX.
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    onClick={() => handleMockExcelUpload()}
                    sx={containedActionSx}
                  >
                    Upload Excel
                  </Button>
                </Box>
              </Box>
            </Paper>
          ) : (
            <Box>
              <Paper variant="outlined" sx={{ p: 1.2, mb: 1.2, borderRadius: '12px', bgcolor: tokenNeutral.lightest, borderColor: tokenDivider }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                  <Box>
                    <Typography sx={{ color: tokenText.primary, fontWeight: 700 }}>{excelFileName || 'Line_1_CIL_Cleaning_Routines.xlsx'}</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.78rem', fontWeight: 400 }}>
                      {mockExcelRoutines.length} routines identified from the workbook.
                    </Typography>
                  </Box>
                  <Chip size="small" label="AI parsed" sx={{ bgcolor: tokenSuccess.softBg, color: tokenSuccess.darker, border: `1px solid ${tokenSuccess.lighter}`, fontWeight: 700 }} />
                </Box>
              </Paper>

              <Grid container spacing={1.1}>
                <Grid size={{ xs: 12, md: 5 }}>
                  {mockExcelRoutines.map((routine) => {
                    const isSelected = selectedExcelRoutineId === routine.id;
                    return (
                      <Paper
                        key={routine.id}
                        variant="outlined"
                        onClick={() => setSelectedExcelRoutineId(routine.id)}
                        sx={{
                          p: 1.1,
                          mb: 0.9,
                          borderRadius: '12px',
                          cursor: 'pointer',
                          borderColor: isSelected ? tokenBrand.main : tokenDivider,
                          bgcolor: isSelected ? tokenBrand.softBg : 'background.paper',
                          boxShadow: 'none',
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.85 }}>
                          <Radio size="small" checked={isSelected} sx={{ p: 0.2, color: tokenBrand.main, '&.Mui-checked': { color: tokenBrand.main } }} />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography sx={{ color: tokenText.primary, fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.25 }}>
                              {routine.title}
                            </Typography>
                            <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.74rem', fontWeight: 400 }}>
                              {routine.sourceSheet} | {routine.steps.length} steps | {routine.confidence} confidence
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    );
                  })}
                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>
                  <Paper variant="outlined" sx={{ p: 1.25, borderRadius: '12px', borderColor: tokenDivider, bgcolor: 'background.paper' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                      <Box>
                        <Typography sx={{ color: tokenText.primary, fontWeight: 700 }}>{selectedExcelRoutine.title}</Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.76rem', fontWeight: 400 }}>
                          {selectedExcelRoutine.location} | {selectedExcelRoutine.equipment} | {selectedExcelRoutine.component}
                        </Typography>
                      </Box>
                      <Chip size="small" label={`${selectedExcelRoutine.duration} min`} sx={{ bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenBrand.lightest}`, fontWeight: 700 }} />
                    </Box>
                    {selectedExcelRoutine.steps.map((step, index) => (
                      <Box key={`${selectedExcelRoutine.id}-preview-${step.stepName}`} sx={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 0.8, py: 0.75, borderTop: index === 0 ? 'none' : `1px solid ${tokenDivider}` }}>
                        <Chip size="small" label={index + 1} sx={{ width: 24, height: 24, bgcolor: tokenNeutral.lightest, color: tokenText.primary, border: `1px solid ${tokenDivider}`, fontWeight: 700, '& .MuiChip-label': { px: 0 } }} />
                        <Box>
                          <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 700 }}>{step.stepName}</Typography>
                          <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.45 }}>
                            {step.stepDescription}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 1.6, display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="outlined" onClick={() => setExcelImportStage('upload')} sx={outlinedActionSx}>
                  Back to upload
                </Button>
                <Button variant="contained" onClick={applyImportedExcelRoutine} sx={containedActionSx}>
                  Import selected routine
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Dialog>

    </Box>
  );
};

export default ManageTasksScreen;

