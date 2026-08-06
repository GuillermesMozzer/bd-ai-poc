import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import {
  AutoAwesome as InsightsIcon,
  CalendarToday as CalendarIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  DarkMode as NightIcon,
  GroupsOutlined as GroupsOutlinedIcon,
  ErrorOutline as AlertIcon,
  InfoOutlined as InfoOutlinedIcon,
  LightMode as SunnyIcon,
  OpenInFull as OpenInFullIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  ShowChart as ShowChartIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { lightHeaderIconButtonSx } from '../../theme';
import {
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
} from '../../workstation/theme';
import WorkstationCilCenterlineWidget from '../../workstation/components/WorkstationCilCenterlineWidget';
import {updateCilReviewQueueItemStatus, useCilReviewQueueItems} from '../../workstation/components/cilActivityReviewStore';
import {updateCenterlineReviewQueueItemStatus, useCenterlineReviewQueueItems} from '../../workstation/components/centerlineActivityReviewStore';

type TaskType = 'CIL' | 'CL';
type TaskStatus = 'Done' | 'Running' | 'Pending' | 'Waiting Review' | 'Overdue';
type LineType = 'Line A' | 'Line B';
type Discipline = 'CIL' | 'Centerline';
type PeriodFilter = 'today' | 'actualWeek' | 'lastWeek' | 'mtd' | 'lastMonth' | 'ytd' | 'date';
type WeeklyAssignmentStatus = 'Done' | 'In Progress' | 'Pending' | 'Overdue';

type TaskRow = {
  id: string;
  task: string;
  line: LineType;
  area: 'Area A' | 'Area B';
  equipment: string;
  type: TaskType;
  shift: 'Shift 1' | 'Shift 2' | 'Shift 3';
  avgTime: string;
  machineState: 'Running / External' | 'Stopped / Internal';
  actualTime: string;
  completedAt: string;
  createdAt: string;
  responsible: string;
  status: TaskStatus;
  parameter?: string;
  targetRange?: string;
  actualReading?: string;
  reviewQueueId?: string;
  replayElapsedSeconds?: number;
  replayComment?: string;
  replayId?: string;
  reviewQueueSource?: 'cil' | 'centerline';
};

type AbnormalityRow = {
  activityId: string;
  description: string;
  status: 'Pending' | 'Scheduled' | 'In Progress' | 'Closed';
  shift: 'Shift 1' | 'Shift 2' | 'Shift 3';
  line: LineType;
  area: string;
  equipment: string;
  responsible: string;
  createdAt: string;
};

type WeeklyTask = { title: string; equipment: string; highlight?: boolean; target?: string; operator: string; status: WeeklyAssignmentStatus; shift: 'Day' | 'Night'; value?: string; outOfTarget?: boolean };
type WeeklyDay = { dayLabel: string; dayNumber: string; completed: number; total: number; active?: boolean; tasks: WeeklyTask[] };

type CompletedTaskDetails = {
  id: string;
  status: TaskStatus;
  title: string;
  equipment: string;
  source: string;
  typeLabel?: string;
  avgTime?: string;
  machineState?: string;
  actualTime?: string;
  completedAt?: string;
  responsible?: string;
  summary: { done: number; total: number; completionRate: number; pending: number; inProgress: number };
  replayId?: string;
  reviewQueueId?: string;
  replayElapsedSeconds?: number;
  replayComment?: string;
  reviewQueueSource?: 'cil' | 'centerline';
};

type CenterlineChartRange = {
  min: number;
  max: number;
  targetLow: number;
  targetHigh: number;
  controlLow: number;
  controlHigh: number;
  unit: string;
};

type CenterlineRangeStatus = 'inTarget' | 'controlZone' | 'outOfRange';
type CenterlineExpandedPeriod = 'mtd' | 'ytd' | 'month';

type CenterlineExpandedTimeline = {
  kind: CenterlineExpandedPeriod;
  pointGranularity: 'day' | 'month';
  labels: string[];
  subtitle: string;
  monthLabel: string;
  monthIndex: number;
};

type CenterlineTrendChartModel = {
  parameter: string;
  color: string;
  config: CenterlineChartRange;
  selectedEquipment: string;
  series: number[];
  labels: string[];
  latestValue: number;
  latestStatus: CenterlineRangeStatus;
  averageValue: number;
  minValue: number;
  maxValue: number;
  withinTargetPct: number;
  trendLabel: string;
  trendTone: string;
};

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
  mb: 2.25,
} as const;

const kpiSummaryCardSx = {
  height: '100%',
  p: 2,
  borderRadius: '12px',
  border: `1px solid ${tokenDivider}`,
  bgcolor: 'background.paper',
  boxShadow: 'none',
} as const;

const analyticsCardSx = {
  minHeight: 250,
  height: '100%',
  width: '100%',
  p: 2,
  borderRadius: '12px',
  border: `1px solid ${tokenDivider}`,
  bgcolor: 'background.paper',
  boxShadow: 'none',
  position: 'relative',
} as const;

const analyticsTitleSx = {
  color: tokenBrand.main,
  fontWeight: 700,
  textTransform: 'uppercase',
  lineHeight: 1.4,
  letterSpacing: 0,
} as const;

const kpiSummaryTitleSx = {
  fontSize: '0.875rem',
  color: tokenText.primary,
  fontWeight: 500,
  lineHeight: 1.57,
} as const;

const kpiSummaryPeriodSx = {
  fontSize: '0.75rem',
  color: tokenText.secondary,
  mb: 1.5,
  lineHeight: 1.3,
} as const;

const kpiMetricLabelSx = {
  fontSize: '0.75rem',
  color: tokenText.secondary,
  lineHeight: 1.3,
} as const;

const kpiMetricValueSx = {
  fontSize: '1.5rem',
  fontWeight: 400,
  lineHeight: 1,
} as const;

const kpiMetricDeltaSx = (color: string) => ({
  fontSize: '0.75rem',
  color,
  fontWeight: 500,
  lineHeight: 1.3,
});

const chipFilterSx = (active: boolean) => ({
  bgcolor: active ? tokenBrand.main : tokenNeutral.lighter,
  color: active ? tokenBrand.contrast : tokenText.primary,
  border: `1px solid ${active ? tokenBrand.main : tokenDivider}`,
  borderRadius: '999px',
  fontWeight: 500,
  cursor: 'pointer',
  '&:hover': {
    bgcolor: active ? tokenBrand.dark : tokenBrand.softBg,
    borderColor: tokenBrand.main,
  },
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const mapCenterlineValueToY = (value: number, config: CenterlineChartRange, chartTop: number, chartBottom: number) => {
  const boundedValue = clamp(value, config.min, config.max);
  const normalized = (boundedValue - config.min) / Math.max(config.max - config.min, 0.0001);
  return chartBottom - normalized * (chartBottom - chartTop);
};

const getCenterlineRangeStatus = (value: number, config: CenterlineChartRange): CenterlineRangeStatus => {
  if (value < config.controlLow || value > config.controlHigh) return 'outOfRange';
  if (value < config.targetLow || value > config.targetHigh) return 'controlZone';
  return 'inTarget';
};

const centerlineMockToday = new Date('2026-05-27T12:00:00');

const formatMonthKey = (year: number, monthIndex: number) => `${year}-${String(monthIndex + 1).padStart(2, '0')}`;

const averageCenterlineValues = (values: number[]) => (values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0);

const formatCenterlineReading = (value: number, unit: string) => `${value.toFixed(unit === 'rpm' ? 0 : 1)} ${unit}`;

const calculatePearsonCorrelation = (leftSeries: number[], rightSeries: number[]) => {
  const length = Math.min(leftSeries.length, rightSeries.length);
  if (length < 2) return 0;

  const left = leftSeries.slice(0, length);
  const right = rightSeries.slice(0, length);
  const leftAverage = averageCenterlineValues(left);
  const rightAverage = averageCenterlineValues(right);

  const numerator = left.reduce((sum, value, index) => sum + ((value - leftAverage) * (right[index] - rightAverage)), 0);
  const leftDeviation = Math.sqrt(left.reduce((sum, value) => sum + ((value - leftAverage) ** 2), 0));
  const rightDeviation = Math.sqrt(right.reduce((sum, value) => sum + ((value - rightAverage) ** 2), 0));

  if (!leftDeviation || !rightDeviation) return 0;
  return numerator / (leftDeviation * rightDeviation);
};

const getCenterlineTrendTone = (series: number[]) => {
  if (series.length < 2) return { label: 'Stable', color: tokenText.secondary };

  const firstValue = series[0];
  const lastValue = series[series.length - 1];
  const delta = lastValue - firstValue;
  const relativeChange = Math.abs(delta) / Math.max(Math.abs(firstValue), 1);

  if (relativeChange < 0.015) return { label: 'Stable', color: tokenText.secondary };
  return delta > 0
    ? { label: 'Slight increase', color: tokenWarning.main }
    : { label: 'Slight decrease', color: tokenSuccess.main };
};

const getCorrelationStrength = (correlation: number) => {
  const magnitude = Math.abs(correlation);
  if (magnitude >= 0.75) return { label: correlation >= 0 ? 'Strong positive' : 'Strong inverse', color: correlation >= 0 ? tokenSuccess.darker : tokenWarning.dark, bg: correlation >= 0 ? tokenSuccess.softBg : tokenWarning.softBg, border: correlation >= 0 ? tokenSuccess.main : tokenWarning.main };
  if (magnitude >= 0.45) return { label: correlation >= 0 ? 'Moderate positive' : 'Moderate inverse', color: tokenBrand.main, bg: tokenBrand.softBg, border: tokenBrand.main };
  return { label: correlation >= 0 ? 'Weak positive' : 'Weak inverse', color: tokenText.secondary, bg: tokenNeutral.lighter, border: tokenDivider };
};

const parseMonthKey = (monthKey: string) => {
  const [yearRaw, monthRaw] = monthKey.split('-');
  const year = Number.parseInt(yearRaw ?? '', 10);
  const month = Number.parseInt(monthRaw ?? '', 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return { year: centerlineMockToday.getFullYear(), monthIndex: centerlineMockToday.getMonth() };
  }
  return { year, monthIndex: month - 1 };
};

const buildCenterlineDaySeries = (baseSeries: number[], config: CenterlineChartRange, totalDays: number, seed: number, monthIndex: number) => {
  const safeBase = baseSeries.length ? baseSeries : [((config.targetLow + config.targetHigh) / 2)];
  const span = config.max - config.min;
  const decimals = config.unit === 'rpm' ? 0 : 1;
  return Array.from({ length: totalDays }, (_, index) => {
    const baseValue = safeBase[index % safeBase.length];
    const fastWave = Math.sin((index + 1 + seed) / 2.7) * span * 0.035;
    const slowWave = Math.cos((index + 1 + monthIndex + seed) / 6.1) * span * 0.026;
    const drift = (((index + 1) / Math.max(totalDays, 1)) - 0.5) * span * 0.03;
    const value = clamp(baseValue + fastWave + slowWave + drift, config.min + span * 0.04, config.max - span * 0.04);
    return Number(value.toFixed(decimals));
  });
};

const buildCenterlineMonthSeries = (baseSeries: number[], config: CenterlineChartRange, totalMonths: number, seed: number) => {
  const safeBase = baseSeries.length ? baseSeries : [((config.targetLow + config.targetHigh) / 2)];
  const span = config.max - config.min;
  const baseline = safeBase.reduce((sum, value) => sum + value, 0) / safeBase.length;
  const decimals = config.unit === 'rpm' ? 0 : 1;
  return Array.from({ length: totalMonths }, (_, index) => {
    const anchor = safeBase[index % safeBase.length];
    const seasonal = Math.sin((index + seed + 1) / 1.6) * span * 0.04;
    const trend = (((index + 1) / Math.max(totalMonths, 1)) - 0.5) * span * 0.035;
    const value = clamp(((anchor + baseline) / 2) + seasonal + trend, config.min + span * 0.05, config.max - span * 0.05);
    return Number(value.toFixed(decimals));
  });
};

const CIL_TASK_ROWS: TaskRow[] = [
  { id: 'ACT-100245', task: 'Clean conveyor belt', line: 'Line A', area: 'Area A', equipment: 'Z1 Main Indexer', type: 'CIL', shift: 'Shift 1', avgTime: '12 min', machineState: 'Running / External', actualTime: '11 min', completedAt: '2026-05-21 08:14', createdAt: '2026-05-21 08:15', responsible: 'John Smith', status: 'Done' },
  { id: 'ACT-100246', task: 'Lubricate bearings', line: 'Line A', area: 'Area A', equipment: 'Z1 Feeder', type: 'CIL', shift: 'Shift 2', avgTime: '8 min', machineState: 'Stopped / Internal', actualTime: '-', completedAt: '-', createdAt: '2026-05-21 07:58', responsible: 'Maria Garcia', status: 'Running' },
  { id: 'CL-100301', task: 'Check roller pressure', line: 'Line B', area: 'Area A', equipment: 'Z3 Press', type: 'CL', shift: 'Shift 3', avgTime: '4 min', machineState: 'Running / External', actualTime: '-', completedAt: '-', createdAt: '2026-05-21 08:20', responsible: 'David Lee', status: 'Running', parameter: 'Pressure', targetRange: '4.0 - 6.0 bar', actualReading: '6.3 bar' },
  { id: 'ACT-100247', task: 'Inspect tightening torque', line: 'Line B', area: 'Area A', equipment: 'Z2 Tipper', type: 'CIL', shift: 'Shift 3', avgTime: '6 min', machineState: 'Stopped / Internal', actualTime: '-', completedAt: '-', createdAt: '2026-05-21 08:05', responsible: 'Sarah Johnson', status: 'Pending' },
  { id: 'ACT-100248', task: 'Clean filter screen', line: 'Line A', area: 'Area A', equipment: 'Z2 Assembly Station', type: 'CIL', shift: 'Shift 1', avgTime: '15 min', machineState: 'Running / External', actualTime: '13 min', completedAt: '2026-05-21 09:02', createdAt: '2026-05-21 08:30', responsible: 'Mike Wilson', status: 'Done' },
  { id: 'CL-100302', task: 'Verify temperature setpoint', line: 'Line A', area: 'Area A', equipment: 'Z1 Feeder', type: 'CL', shift: 'Shift 2', avgTime: '5 min', machineState: 'Running / External', actualTime: '4 min', completedAt: '2026-05-21 08:15', createdAt: '2026-05-21 08:15', responsible: 'John Smith', status: 'Done', parameter: 'Temperature', targetRange: '95 - 105 \u00B0C', actualReading: '101.2 \u00B0C' },
  { id: 'ACT-100249', task: 'Tighten mounting bolts', line: 'Line A', area: 'Area B', equipment: 'Z1 Main Indexer', type: 'CIL', shift: 'Shift 2', avgTime: '10 min', machineState: 'Stopped / Internal', actualTime: '12 min', completedAt: '2026-05-21 10:27', createdAt: '2026-05-21 09:35', responsible: 'Carlos Mendez', status: 'Done' },
  { id: 'CL-100303', task: 'Inspect belt tension', line: 'Line B', area: 'Area B', equipment: 'Z4 Needle Station', type: 'CL', shift: 'Shift 3', avgTime: '6 min', machineState: 'Running / External', actualTime: '-', completedAt: '-', createdAt: '2026-05-21 09:10', responsible: 'Amanda Torres', status: 'Pending', parameter: 'Belt Tension', targetRange: '20 - 30 N', actualReading: '-' },
  { id: 'CL-100304', task: 'Check alignment gauge', line: 'Line B', area: 'Area B', equipment: 'Z2 Assembly Station', type: 'CL', shift: 'Shift 1', avgTime: '5 min', machineState: 'Running / External', actualTime: '-', completedAt: '-', createdAt: '2026-05-21 10:52', responsible: 'Kevin Brown', status: 'Pending', parameter: 'Lubrication Flow', targetRange: '1.0 - 2.0 L/min', actualReading: '-' },
  { id: 'ACT-100250', task: 'Lubricate chain drive', line: 'Line B', area: 'Area B', equipment: 'Z5 Sub Assembly', type: 'CIL', shift: 'Shift 2', avgTime: '9 min', machineState: 'Stopped / Internal', actualTime: '-', completedAt: '-', createdAt: '2026-05-21 09:48', responsible: 'Maria Garcia', status: 'Running' },
  { id: 'CL-100305', task: 'Verify pressure setpoint', line: 'Line A', area: 'Area B', equipment: 'Z1 Feeder', type: 'CL', shift: 'Shift 3', avgTime: '5 min', machineState: 'Running / External', actualTime: '-', completedAt: '-', createdAt: '2026-05-21 09:55', responsible: 'Maria Garcia', status: 'Pending', parameter: 'Pressure', targetRange: '4.0 - 6.0 bar', actualReading: '-' },
  { id: 'ACT-100251', task: 'Clean sensor guard before handoff', line: 'Line B', area: 'Area B', equipment: 'Z4 Needle Station', type: 'CIL', shift: 'Shift 1', avgTime: '7 min', machineState: 'Stopped / Internal', actualTime: '-', completedAt: '-', createdAt: '2026-05-21 07:30', responsible: 'Ana Souza', status: 'Overdue' },
];

const ABNORMALITY_ROWS: AbnormalityRow[] = [
  { activityId: 'ABN-200112', description: 'Lubricate bearings abnormal noise', status: 'Pending', shift: 'Shift 2', line: 'Line A', area: 'Area A', equipment: 'Z1 Feeder', responsible: 'Maria Garcia', createdAt: '2026-05-21 08:02' },
  { activityId: 'ABN-200113', description: 'Pressure below setpoint', status: 'In Progress', shift: 'Shift 3', line: 'Line B', area: 'Area A', equipment: 'Z3 Press', responsible: 'Kevin Brown', createdAt: '2026-05-21 08:05' },
  { activityId: 'ABN-200114', description: 'Sensor cleaning scheduled', status: 'Scheduled', shift: 'Shift 1', line: 'Line A', area: 'Area A', equipment: 'Z2 Assembly Station', responsible: 'Mike Wilson', createdAt: '2026-05-21 08:15' },
  { activityId: 'ABN-200115', description: 'Conveyor alignment corrected', status: 'Closed', shift: 'Shift 1', line: 'Line B', area: 'Area B', equipment: 'Z2 Tipper', responsible: 'Sarah Johnson', createdAt: '2026-05-21 08:30' },
];

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  today: 'Today',
  actualWeek: 'Actual Week',
  lastWeek: 'Last Week',
  mtd: 'Month to Date',
  lastMonth: 'Last Month',
  ytd: 'Year to Date',
  date: 'Custom Date',
};

const SPECIFIC_DATE_LABELS: Record<string, string> = {
  '2026-05-06': 'May 6, 2026',
  '2026-05-05': 'May 5, 2026',
  '2026-05-04': 'May 4, 2026',
};

const getPeriodRows = <T,>(rows: T[], periodFilter: PeriodFilter): T[] => {
  switch (periodFilter) {
    case 'today':
      return rows.slice(0, Math.max(3, Math.ceil(rows.length * 0.45)));
    case 'actualWeek':
      return rows.slice(0, Math.max(5, Math.ceil(rows.length * 0.7)));
    case 'lastWeek':
      return rows.slice(Math.max(0, rows.length - Math.max(5, Math.ceil(rows.length * 0.65))));
    case 'mtd':
      return rows;
    case 'lastMonth':
      return [...rows].reverse().slice(0, Math.max(4, Math.ceil(rows.length * 0.75)));
    case 'ytd':
      return rows;
    case 'date':
      return rows.slice(1, Math.max(3, Math.ceil(rows.length * 0.55)));
    default:
      return rows;
  }
};

const CIL_WEEKLY_DAYS: WeeklyDay[] = [
  { dayLabel: 'Mon', dayNumber: '11', completed: 9, total: 21, tasks: [
    { title: 'Lubricate bearings', equipment: 'Z1 Feeder', operator: 'John', status: 'Overdue', shift: 'Day', outOfTarget: true },
    { title: 'Lubricate bearings', equipment: 'Z1 Feeder', operator: 'Carlos', status: 'Done', shift: 'Night' },
    { title: 'Clean sensor housing', equipment: 'Z2 Assembly Station', operator: 'Maria', status: 'Done', shift: 'Day' },
    { title: 'Inspect chain guide', equipment: 'Z3 Press', operator: 'Lucas', status: 'In Progress', shift: 'Night' },
  ] },
  { dayLabel: 'Tue', dayNumber: '12', completed: 9, total: 31, tasks: [
    { title: 'Inspect belt tension', equipment: 'Z5 Sub Assembly', operator: 'Maria', status: 'Done', shift: 'Day', highlight: true },
    { title: 'Inspect belt tension', equipment: 'Z5 Sub Assembly', operator: 'Amanda', status: 'Done', shift: 'Night', highlight: true },
    { title: 'Tighten guard fasteners', equipment: 'Z2 Tipper', operator: 'Robert', status: 'In Progress', shift: 'Night' },
    { title: 'Lubricate motor base', equipment: 'Z1 Main Indexer', operator: 'Paula', status: 'Pending', shift: 'Day' },
  ] },
  { dayLabel: 'Wed', dayNumber: '13', completed: 9, total: 31, tasks: [
    { title: 'Lubricate linear actuator', equipment: 'Z1 Main Indexer', operator: 'David', status: 'Done', shift: 'Day', highlight: true },
    { title: 'Lubricate linear actuator', equipment: 'Z1 Main Indexer', operator: 'Robert', status: 'Done', shift: 'Night', highlight: true },
    { title: 'Clean guide rails', equipment: 'Z6 Tube Cath Assembly', operator: 'Renata', status: 'Pending', shift: 'Night' },
  ] },
  { dayLabel: 'Thu', dayNumber: '14', completed: 8, total: 31, tasks: [
    { title: 'Clean coolant reservoir', equipment: 'Z4 Needle Station', operator: 'Sarah', status: 'Done', shift: 'Day' },
    { title: 'Clean coolant reservoir', equipment: 'Z4 Needle Station', operator: 'Lisa', status: 'In Progress', shift: 'Night' },
    { title: 'Inspect clamp torque', equipment: 'Z4 Needle Station', operator: 'Bruno', status: 'Pending', shift: 'Day' },
  ] },
  { dayLabel: 'Fri', dayNumber: '15', completed: 5, total: 21, active: true, tasks: [
    { title: 'Lubricate slide rails', equipment: 'Z2 Sealer', operator: 'Mike', status: 'Done', shift: 'Day' },
    { title: 'Lubricate slide rails', equipment: 'Z2 Sealer', operator: 'James', status: 'In Progress', shift: 'Night' },
    { title: 'Inspect lubrication points', equipment: 'Filler 01', operator: 'Kelly', status: 'Pending', shift: 'Night' },
    { title: 'Check seal alignment', equipment: 'Z2 Sealer', operator: 'Ana', status: 'Overdue', shift: 'Day', outOfTarget: true },
  ] },
  { dayLabel: 'Sat', dayNumber: '16', completed: 0, total: 0, tasks: [
    { title: 'Clean grease fittings', equipment: 'Z3 Press', operator: 'John', status: 'Pending', shift: 'Day' },
    { title: 'Clean grease fittings', equipment: 'Z3 Press', operator: 'Carlos', status: 'Pending', shift: 'Night' },
    { title: 'Inspect roller coupling', equipment: 'Z1 Cutter', operator: 'Tiago', status: 'In Progress', shift: 'Day' },
  ] },
  { dayLabel: 'Sun', dayNumber: '17', completed: 0, total: 0, tasks: [
    { title: 'Lubricate bearings', equipment: 'Z5 Sub Assembly', operator: 'David', status: 'Pending', shift: 'Day' },
    { title: 'Lubricate bearings', equipment: 'Z5 Sub Assembly', operator: 'Robert', status: 'Pending', shift: 'Night' },
    { title: 'Clean nozzle head', equipment: 'Z6 Tube Cath Assembly', operator: 'Marcela', status: 'Done', shift: 'Night' },
  ] },
];

const CENTERLINE_WEEKLY_DAYS: WeeklyDay[] = [
  { dayLabel: 'Mon', dayNumber: '11', completed: 8, total: 21, tasks: [
    { title: 'Verify temperature setpoint', equipment: 'Z1 Feeder', target: '185 C', operator: 'John', status: 'Overdue', shift: 'Day', value: '185 C' },
    { title: 'Verify temperature setpoint', equipment: 'Z1 Feeder', target: '185 C', operator: 'Carlos', status: 'Done', shift: 'Night', value: '185 C' },
    { title: 'Check alignment gauge', equipment: 'Z1 Cutter', target: '0.02 mm', operator: 'Amanda', status: 'Done', shift: 'Night', value: '0.01 mm', outOfTarget: true },
    { title: 'Verify film offset', equipment: 'Z1 Cutter', target: '0.30 mm', operator: 'Rafael', status: 'Pending', shift: 'Day', value: '--' },
  ] },
  { dayLabel: 'Tue', dayNumber: '12', completed: 7, total: 21, tasks: [
    { title: 'Check torque setpoint', equipment: 'Z4 Needle Station', target: '25 Nm', operator: 'John', status: 'Done', shift: 'Day', value: '26 Nm' },
    { title: 'Verify coolant temperature', equipment: 'Z6 Tube Cath Assembly', target: '22 C', operator: 'David', status: 'Done', shift: 'Day', value: '17 C', outOfTarget: true },
    { title: 'Verify coolant temperature', equipment: 'Z6 Tube Cath Assembly', target: '22 C', operator: 'Robert', status: 'Done', shift: 'Night', value: '18 C', outOfTarget: true },
    { title: 'Check feeder pressure', equipment: 'Z1 Feeder', target: '2.5 bar', operator: 'Sofia', status: 'In Progress', shift: 'Night', value: '2.4 bar' },
  ] },
  { dayLabel: 'Wed', dayNumber: '13', completed: 5, total: 21, tasks: [
    { title: 'Check spindle runout', equipment: 'Z4 Cartoner', target: '0.01 mm', operator: 'John', status: 'Overdue', shift: 'Day', value: '0.01 mm' },
    { title: 'Verify air pressure', equipment: 'Z2 Sealer', target: '6.0 bar', operator: 'Amanda', status: 'Done', shift: 'Night', value: '6.0 bar' },
    { title: 'Check spindle speed', equipment: 'Z4 Cartoner', target: '1800 rpm', operator: 'Henrique', status: 'Pending', shift: 'Day', value: '--' },
  ] },
  { dayLabel: 'Thu', dayNumber: '14', completed: 4, total: 21, active: true, tasks: [
    { title: 'Verify motor current', equipment: 'Z2 Tipper', target: '12 A', operator: 'John', status: 'Done', shift: 'Day', value: '9 A', outOfTarget: true },
    { title: 'Verify motor current', equipment: 'Z2 Tipper', target: '12 A', operator: 'Carlos', status: 'Pending', shift: 'Night', value: '--' },
    { title: 'Check seal compression', equipment: 'Z2 Assembly Station', target: '3.2 mm', operator: 'Maria', status: 'Overdue', shift: 'Day', value: '2.8 mm', outOfTarget: true },
    { title: 'Verify marking sensor', equipment: 'Z2 Tipper', target: '5 V', operator: 'Camila', status: 'In Progress', shift: 'Night', value: '5.1 V' },
  ] },
  { dayLabel: 'Fri', dayNumber: '15', completed: 0, total: 21, tasks: [
    { title: 'Verify pressure setpoint', equipment: 'Z6 Tube Cath Assembly', target: '2.8 bar', operator: 'John', status: 'Pending', shift: 'Day', value: '--' },
    { title: 'Verify pressure setpoint', equipment: 'Z6 Tube Cath Assembly', target: '2.8 bar', operator: 'Carlos', status: 'Pending', shift: 'Night', value: '--' },
    { title: 'Verify print delay', equipment: 'Domino 1', target: '12 ms', operator: 'Diego', status: 'Pending', shift: 'Day', value: '--' },
  ] },
  { dayLabel: 'Sat', dayNumber: '16', completed: 0, total: 0, tasks: [
    { title: 'Verify coolant temperature', equipment: 'Z1 Main Indexer', target: '22 C', operator: 'John', status: 'Pending', shift: 'Day', value: '--' },
    { title: 'Verify coolant temperature', equipment: 'Z1 Main Indexer', target: '22 C', operator: 'Carlos', status: 'Pending', shift: 'Night', value: '--' },
    { title: 'Verify main pressure line', equipment: 'Top film infeed', target: '3.1 bar', operator: 'Aline', status: 'Done', shift: 'Day', value: '3.1 bar' },
  ] },
  { dayLabel: 'Sun', dayNumber: '17', completed: 0, total: 0, tasks: [
    { title: 'Verify belt tension force', equipment: 'Z1 Cutter', target: '8.5 kN', operator: 'David', status: 'Pending', shift: 'Day', value: '--' },
    { title: 'Verify belt tension force', equipment: 'Z1 Cutter', target: '8.5 kN', operator: 'Robert', status: 'Pending', shift: 'Night', value: '--' },
    { title: 'Verify optic fiber #2', equipment: 'Optic fiber', target: '1 V', operator: 'Gabriel', status: 'In Progress', shift: 'Night', value: '0.9 V' },
  ] },
];

const statusTone = (status: WeeklyAssignmentStatus | TaskStatus) => {
  if (status === 'Done') return { bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenSuccess.lightest };
  if (status === 'Running' || status === 'In Progress') return { bg: tokenBrand.softBg, color: tokenBrand.main, border: tokenBrand.selectedBg };
  if (status === 'Waiting Review') return { bg: tokenBrand.softBg, color: tokenBrand.dark, border: tokenBrand.selectedBg };
  if (status === 'Overdue') return { bg: tokenWarning.softBg, color: tokenWarning.dark, border: tokenWarning.lightest };
  return { bg: tokenNeutral.lighter, color: tokenText.secondary, border: tokenDivider };
};

const inferWeeklyTaskLine = (equipment: string): LineType => {
  const normalized = equipment.toLowerCase();
  if (normalized.includes('z1') || normalized.includes('z2') || normalized.includes('feeder') || normalized.includes('filler')) return 'Line A';
  return 'Line B';
};

type CiltKpisScreenProps = {
  discipline?: Discipline;
};

const CiltKpisScreen: React.FC<CiltKpisScreenProps> = ({ discipline }) => {
  const fixedDiscipline = discipline;
  const selectedDiscipline: Discipline = fixedDiscipline ?? 'CIL';
  const [mode, setMode] = useState<'weekly' | 'overview'>('overview');
  const [weeklyDiscipline, setWeeklyDiscipline] = useState<Discipline>(selectedDiscipline);
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('today');
  const [specificDate, setSpecificDate] = useState('2026-05-06');
  const [lineFilter, setLineFilter] = useState<'all' | LineType>('all');
  const [shiftFilter, setShiftFilter] = useState<'all' | TaskRow['shift']>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [equipmentFilter, setEquipmentFilter] = useState('all');
  const [responsibleFilter, setResponsibleFilter] = useState('all');
  const [listType, setListType] = useState<'activities' | 'abnormalities'>('activities');
  const [kpiDrilldown, setKpiDrilldown] = useState<null | 'performance' | 'abnormality' | 'execution'>(null);
  const [centerlineParameter, setCenterlineParameter] = useState('Temperature');
  const [centerlineCompareParameter, setCenterlineCompareParameter] = useState('Pressure');
  const [centerlineTempEquipment, setCenterlineTempEquipment] = useState('Z1 Feeder');
  const [isCenterlineTrendExpanded, setIsCenterlineTrendExpanded] = useState(false);
  const [centerlineExpandedPeriod, setCenterlineExpandedPeriod] = useState<CenterlineExpandedPeriod>('mtd');
  const [centerlineExpandedMonth, setCenterlineExpandedMonth] = useState(formatMonthKey(centerlineMockToday.getFullYear(), centerlineMockToday.getMonth()));
  const [selectedCompletedTask, setSelectedCompletedTask] = useState<CompletedTaskDetails | null>(null);
  const [weeklyStatusFilter, setWeeklyStatusFilter] = useState<'all' | WeeklyAssignmentStatus | 'Out of Target'>('all');
  const [weeklyShiftFilter, setWeeklyShiftFilter] = useState<'all' | WeeklyTask['shift']>('all');
  const [weeklyLineFilter, setWeeklyLineFilter] = useState<'all' | LineType>('all');
  const [weeklyEquipmentFilter, setWeeklyEquipmentFilter] = useState('all');
  const [weeklyResponsibleFilter, setWeeklyResponsibleFilter] = useState('all');
  const {items: reviewQueueItems} = useCilReviewQueueItems();
  const {items: centerlineReviewQueueItems} = useCenterlineReviewQueueItems();

  const effectiveWeeklyDiscipline: Discipline = fixedDiscipline ?? weeklyDiscipline;
  const weeklyDays = effectiveWeeklyDiscipline === 'CIL' ? CIL_WEEKLY_DAYS : CENTERLINE_WEEKLY_DAYS;
  const countBy = (rows: TaskRow[], status: TaskStatus) => rows.filter((row) => row.status === status).length;
  const reviewQueueRows = useMemo<TaskRow[]>(
    () => {
      const cilRows = reviewQueueItems.map((item) => ({
        id: item.activityId,
        task: item.task,
        line: item.line,
        area: item.area,
        equipment: item.equipment,
        type: 'CIL' as const,
        shift: item.shift,
        avgTime: item.avgTime,
        machineState: item.machineState,
        actualTime: item.actualTime,
        completedAt: item.completedAt,
        createdAt: item.createdAt,
        responsible: item.responsible,
        status: item.status,
        reviewQueueId: item.id,
        replayId: item.replayId,
        replayElapsedSeconds: item.elapsedSeconds,
        replayComment: item.comment,
        reviewQueueSource: 'cil' as const,
      }));
      const clRows = centerlineReviewQueueItems.map((item) => ({
        id: item.activityId,
        task: item.task,
        line: item.line,
        area: item.area,
        equipment: item.equipment,
        type: 'CL' as const,
        shift: item.shift,
        avgTime: item.avgTime,
        machineState: item.machineState,
        actualTime: item.actualTime,
        completedAt: item.completedAt,
        createdAt: item.createdAt,
        responsible: item.responsible,
        status: item.status,
        reviewQueueId: item.id,
        replayId: item.replayId,
        replayElapsedSeconds: item.elapsedSeconds,
        replayComment: item.comment,
        reviewQueueSource: 'centerline' as const,
        parameter: item.parameter ?? 'Temperature / Pressure',
        targetRange: item.targetRange ?? '95-105 C | 4.0-6.0 bar',
        actualReading: item.actualReading ?? '-',
      }));
      return [...cilRows, ...clRows].sort((a, b) => {
        if (a.reviewQueueId === 'cil-review-mock-1') return -1;
        if (b.reviewQueueId === 'cil-review-mock-1') return 1;
        if (a.reviewQueueId === 'centerline-review-mock-1') return -1;
        if (b.reviewQueueId === 'centerline-review-mock-1') return 1;
        return 0;
      });
    },
    [reviewQueueItems, centerlineReviewQueueItems],
  );
  const activityRows = useMemo(
    () => getPeriodRows([...reviewQueueRows, ...CIL_TASK_ROWS], periodFilter),
    [reviewQueueRows, periodFilter],
  );
  const weeklyTasks = useMemo(() => weeklyDays.flatMap((day) => day.tasks), [weeklyDays]);
  const weeklyEquipmentOptions = useMemo(() => Array.from(new Set(weeklyTasks.map((task) => task.equipment))), [weeklyTasks]);
  const weeklyResponsibleOptions = useMemo(() => Array.from(new Set(weeklyTasks.map((task) => task.operator))), [weeklyTasks]);
  const filteredWeeklyDays = useMemo(
    () =>
      weeklyDays.map((day) => ({
        ...day,
        tasks: day.tasks.filter((task) => {
          const line = inferWeeklyTaskLine(task.equipment);
          return (
            (weeklyStatusFilter === 'all' || (weeklyStatusFilter === 'Out of Target' ? Boolean(task.outOfTarget) : task.status === weeklyStatusFilter)) &&
            (weeklyShiftFilter === 'all' || task.shift === weeklyShiftFilter) &&
            (weeklyLineFilter === 'all' || line === weeklyLineFilter) &&
            (weeklyEquipmentFilter === 'all' || task.equipment === weeklyEquipmentFilter) &&
            (weeklyResponsibleFilter === 'all' || task.operator === weeklyResponsibleFilter)
          );
        }),
      })),
    [weeklyDays, weeklyStatusFilter, weeklyShiftFilter, weeklyLineFilter, weeklyEquipmentFilter, weeklyResponsibleFilter],
  );

  const filteredRows = useMemo(
    () =>
      activityRows.filter((row) => {
        const disciplineOk = selectedDiscipline === 'CIL' ? row.type === 'CIL' : row.type === 'CL';
        return (
          disciplineOk &&
          (lineFilter === 'all' || row.line === lineFilter) &&
          (shiftFilter === 'all' || row.shift === shiftFilter) &&
          (statusFilter === 'all' || row.status === statusFilter) &&
          (equipmentFilter === 'all' || row.equipment === equipmentFilter) &&
          (responsibleFilter === 'all' || row.responsible === responsibleFilter)
        );
      }),
    [activityRows, selectedDiscipline, lineFilter, shiftFilter, statusFilter, equipmentFilter, responsibleFilter],
  );
  const filteredAbnormalities = useMemo(
    () =>
      getPeriodRows(ABNORMALITY_ROWS, periodFilter).filter((row) =>
        (lineFilter === 'all' || row.line === lineFilter)
        && (shiftFilter === 'all' || row.shift === shiftFilter)
        && (equipmentFilter === 'all' || row.equipment === equipmentFilter),
      ),
    [periodFilter, lineFilter, shiftFilter, equipmentFilter],
  );
  const filteredActivities = useMemo(
    () => filteredRows,
    [filteredRows],
  );

  const doneCount = countBy(filteredRows, 'Done');
  const runningCount = countBy(filteredRows, 'Running');
  const pendingCount = countBy(filteredRows, 'Pending') + countBy(filteredRows, 'Waiting Review');
  const overdueCount = countBy(filteredRows, 'Overdue');
  const totalCount = filteredRows.length;
  const statusPct = {
    done: totalCount ? Math.round((doneCount / totalCount) * 100) : 0,
    running: totalCount ? Math.round((runningCount / totalCount) * 100) : 0,
    pending: totalCount ? Math.round((pendingCount / totalCount) * 100) : 0,
    overdue: totalCount ? Math.round((overdueCount / totalCount) * 100) : 0,
  };
  const statusDonutStops = {
    done: statusPct.done,
    running: statusPct.done + statusPct.running,
    pending: statusPct.done + statusPct.running + statusPct.pending,
  };
  const statusLegendItems = [
    { label: 'Done', value: doneCount, pct: statusPct.done, color: tokenSuccess.main },
    { label: 'Running', value: runningCount, pct: statusPct.running, color: tokenBrand.main },
    { label: 'Pending', value: pendingCount, pct: statusPct.pending, color: tokenNeutral.dark },
    { label: 'Overdue', value: overdueCount, pct: statusPct.overdue, color: tokenError.main },
  ];

  const equipmentOptions = useMemo(() => Array.from(new Set(activityRows.map((item) => item.equipment))), [activityRows]);
  const responsibleOptions = useMemo(() => Array.from(new Set(activityRows.map((item) => item.responsible))), [activityRows]);
  const centerlineParameterTrendByEquipment: Record<string, Record<string, number[]>> = {
    Temperature: {
      'Z1 Feeder': [95.0, 99.0, 97.0, 101.0, 94.0, 98.0, 102.0],
      'Z2 Sealer': [95.8, 97.3, 96.9, 99.2, 95.5, 98.1, 99.4],
      'Z4 Cartoner': [98.4, 101.1, 99.6, 102.8, 97.4, 100.2, 104.0],
    },
    Pressure: {
      'Z1 Feeder': [5.4, 6.2, 5.8, 7.0, 5.2, 6.0, 7.2],
      'Z2 Sealer': [5.1, 5.7, 5.6, 6.4, 5.3, 5.8, 6.5],
      'Z4 Cartoner': [5.8, 6.5, 6.1, 7.3, 5.7, 6.3, 7.4],
    },
    Speed: {
      'Z1 Feeder': [62, 64, 63, 65, 66, 64, 65],
      'Z2 Sealer': [59, 58, 60, 61, 60, 59, 60],
      'Z4 Cartoner': [68, 67, 69, 70, 69, 68, 70],
    },
    'Flow Rate': {
      'Z1 Feeder': [30.0, 27.5, 28.3, 25.8, 31.0, 29.0, 26.2],
      'Z2 Sealer': [28.4, 26.9, 27.6, 25.1, 29.2, 27.8, 25.5],
      'Z4 Cartoner': [31.2, 28.7, 29.4, 26.7, 32.0, 30.3, 27.4],
    },
    'Motor Current': {
      'Z1 Feeder': [11.2, 12.3, 12.0, 13.8, 10.9, 12.8, 14.1],
      'Z2 Sealer': [10.4, 11.5, 11.1, 12.8, 10.1, 11.8, 13.0],
      'Z4 Cartoner': [12.2, 13.1, 12.9, 14.5, 11.8, 13.5, 14.8],
    },
    Vibration: {
      'Z1 Feeder': [1.3, 1.6, 1.5, 2.0, 1.4, 1.7, 2.2],
      'Z2 Sealer': [1.1, 1.4, 1.3, 1.7, 1.2, 1.5, 1.8],
      'Z4 Cartoner': [1.5, 1.8, 1.7, 2.3, 1.6, 1.9, 2.5],
    },
  };
  const centerlineParameterTrendPrevWeekByEquipment: Record<string, Record<string, number[]>> = {
    Temperature: {
      'Z1 Feeder': [96.1, 98.8, 97.6, 99.4, 96.2, 98.1, 100.0],
      'Z2 Sealer': [95.0, 96.1, 96.2, 97.4, 95.2, 96.6, 97.8],
      'Z4 Cartoner': [97.0, 99.8, 98.4, 100.6, 96.9, 98.7, 101.2],
    },
    Pressure: {
      'Z1 Feeder': [5.1, 5.6, 5.5, 6.2, 5.0, 5.7, 6.3],
      'Z2 Sealer': [4.9, 5.4, 5.3, 5.9, 5.1, 5.5, 6.0],
      'Z4 Cartoner': [5.5, 6.0, 5.8, 6.6, 5.4, 6.0, 6.7],
    },
    Speed: {
      'Z1 Feeder': [60, 61, 62, 63, 64, 63, 64],
      'Z2 Sealer': [57, 57, 58, 59, 59, 58, 59],
      'Z4 Cartoner': [66, 66, 67, 68, 68, 67, 68],
    },
    'Flow Rate': {
      'Z1 Feeder': [31.0, 29.4, 29.2, 27.5, 31.8, 30.1, 28.4],
      'Z2 Sealer': [29.1, 27.8, 27.9, 26.3, 29.8, 28.5, 27.0],
      'Z4 Cartoner': [32.0, 30.4, 30.1, 28.2, 32.6, 31.2, 29.1],
    },
    'Motor Current': {
      'Z1 Feeder': [10.8, 11.7, 11.5, 12.9, 10.6, 12.0, 13.2],
      'Z2 Sealer': [10.0, 10.8, 10.7, 11.9, 9.8, 11.1, 12.0],
      'Z4 Cartoner': [11.7, 12.4, 12.1, 13.5, 11.2, 12.8, 13.9],
    },
    Vibration: {
      'Z1 Feeder': [1.2, 1.4, 1.3, 1.7, 1.2, 1.5, 1.8],
      'Z2 Sealer': [1.0, 1.2, 1.2, 1.5, 1.1, 1.3, 1.5],
      'Z4 Cartoner': [1.3, 1.6, 1.5, 2.0, 1.4, 1.7, 2.1],
    },
  };
  const centerlineTemperatureLabels = ['Apr 30', 'May 1', 'May 2', 'May 3', 'May 4', 'May 5', 'May 6'];
  const centerlineParameterOptions = Object.keys(centerlineParameterTrendByEquipment);
  const centerlineTemperatureEquipmentOptions = Array.from(new Set(centerlineParameterOptions.flatMap((parameter) => Object.keys(centerlineParameterTrendByEquipment[parameter] ?? {}))));
  const centerlineExpandedMonthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => {
        const monthDate = new Date(centerlineMockToday.getFullYear(), centerlineMockToday.getMonth() - index, 1);
        const value = formatMonthKey(monthDate.getFullYear(), monthDate.getMonth());
        return {
          value,
          label: monthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        };
      }),
    [],
  );
  const centerlineExpandedTimeline = useMemo<CenterlineExpandedTimeline>(() => {
    const monthFormatter = (year: number, monthIndex: number) => new Date(year, monthIndex, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (centerlineExpandedPeriod === 'ytd') {
      const totalMonths = centerlineMockToday.getMonth() + 1;
      const labels = Array.from({ length: totalMonths }, (_, index) => new Date(centerlineMockToday.getFullYear(), index, 1).toLocaleDateString('en-US', { month: 'short' }));
      return {
        kind: 'ytd',
        pointGranularity: 'month',
        labels,
        subtitle: `${centerlineMockToday.getFullYear()} year-to-date`,
        monthLabel: monthFormatter(centerlineMockToday.getFullYear(), centerlineMockToday.getMonth()),
        monthIndex: centerlineMockToday.getMonth(),
      };
    }
    const selectedMonthMeta = centerlineExpandedPeriod === 'month'
      ? parseMonthKey(centerlineExpandedMonth)
      : { year: centerlineMockToday.getFullYear(), monthIndex: centerlineMockToday.getMonth() };
    const daysInMonth = new Date(selectedMonthMeta.year, selectedMonthMeta.monthIndex + 1, 0).getDate();
    const dayCount = centerlineExpandedPeriod === 'mtd' ? centerlineMockToday.getDate() : daysInMonth;
    const labels = Array.from({ length: dayCount }, (_, index) => String(index + 1));
    const monthLabel = monthFormatter(selectedMonthMeta.year, selectedMonthMeta.monthIndex);
    return {
      kind: centerlineExpandedPeriod,
      pointGranularity: 'day',
      labels,
      subtitle: centerlineExpandedPeriod === 'mtd'
        ? `${monthLabel} (day 1 to ${dayCount})`
        : `${monthLabel} (all ${daysInMonth} days)`,
      monthLabel,
      monthIndex: selectedMonthMeta.monthIndex,
    };
  }, [centerlineExpandedMonth, centerlineExpandedPeriod]);
  const centerlineTemperatureTrend = (centerlineParameterTrendByEquipment[centerlineParameter]?.[centerlineTempEquipment]) ?? centerlineParameterTrendByEquipment.Temperature['Z1 Feeder'];
  const centerlineTemperaturePrevWeekTrend = (centerlineParameterTrendPrevWeekByEquipment[centerlineParameter]?.[centerlineTempEquipment]) ?? centerlineParameterTrendPrevWeekByEquipment.Temperature['Z1 Feeder'];
  const centerlineAvgTempCurrent = centerlineTemperatureTrend.reduce((sum, value) => sum + value, 0) / centerlineTemperatureTrend.length;
  const centerlineAvgTempPrevWeek = centerlineTemperaturePrevWeekTrend.reduce((sum, value) => sum + value, 0) / centerlineTemperaturePrevWeekTrend.length;
  const centerlineAvgTempDelta = centerlineAvgTempCurrent - centerlineAvgTempPrevWeek;
  const centerlineDoneDelta = 2;
  const centerlineRunningDelta = -1;
  const centerlineOutOfTargetDelta = 1;
  const centerlineCoverageDelta = 4;
  const centerlineOverdueDelta = -1;
  const outOfTargetReadings = selectedDiscipline === 'Centerline' ? overdueCount : 0;
  const centerlineChartRangeByParameter: Record<string, CenterlineChartRange> = {
    Temperature: { min: 90, max: 110, targetLow: 95, targetHigh: 105, controlLow: 87, controlHigh: 110, unit: '\u00B0C' },
    Pressure: { min: 4, max: 9, targetLow: 5.5, targetHigh: 7.5, controlLow: 5.0, controlHigh: 8.0, unit: 'bar' },
    Speed: { min: 55, max: 75, targetLow: 60, targetHigh: 70, controlLow: 58, controlHigh: 72, unit: 'rpm' },
    'Flow Rate': { min: 18, max: 34, targetLow: 22, targetHigh: 30, controlLow: 20, controlHigh: 32, unit: 'm3/h' },
    'Motor Current': { min: 8, max: 18, targetLow: 10, targetHigh: 15, controlLow: 9.5, controlHigh: 16, unit: 'A' },
    Vibration: { min: 0.5, max: 4.5, targetLow: 1.0, targetHigh: 3.0, controlLow: 0.8, controlHigh: 3.5, unit: 'mm/s' },
  };
  const cilShiftFound = { t1: 7, t2: 6, t3: 5 };
  const cilShiftResolved = { t1: 6, t2: 5, t3: 4 };
  const cilFoundTotal = cilShiftFound.t1 + cilShiftFound.t2 + cilShiftFound.t3;
  const cilResolvedTotal = cilShiftResolved.t1 + cilShiftResolved.t2 + cilShiftResolved.t3;
  const cilResolutionRate = Math.round((cilResolvedTotal / cilFoundTotal) * 100);
  const cilBacklogOpen = cilFoundTotal - cilResolvedTotal;
  const cilBacklog24h = 2;
  const cilBacklog48h = 1;
  const cilOnTimeCompleted = 12;
  const cilCompletedActivities = 15;
  const cilOnTimeCompletionRate = Math.round((cilOnTimeCompleted / cilCompletedActivities) * 100);
  const cilExecutedActivities = 60;
  const cilAbnormalityRate = (cilFoundTotal / cilExecutedActivities).toFixed(2);
  const cilActivitiesWithAbnormalityPct = Math.round((cilFoundTotal / cilExecutedActivities) * 100);
  const cilUnresolvedAbnormalities = cilBacklogOpen;
  const cilTmeByShift = { t1: 10.8, t2: 11.6, t3: 12.4 };
  const cilTme = ((cilTmeByShift.t1 + cilTmeByShift.t2 + cilTmeByShift.t3) / 3).toFixed(1);
  const cilMttrByShift = { t1: 2.2, t2: 2.7, t3: 3.1 };
  const cilMttr = ((cilMttrByShift.t1 + cilMttrByShift.t2 + cilMttrByShift.t3) / 3).toFixed(1);
  const cilTrendFound = [15, 17, 13, 19, 16, 18, 18];
  const cilTrendResolved = [12, 14, 11, 16, 14, 15, 15];
  const cilTrendLabels = ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'D-1', 'Today'];
  const resetFilters = () => {
    setPeriodFilter('today');
    setSpecificDate('2026-05-06');
    setLineFilter('all');
    setShiftFilter('all');
    setStatusFilter('all');
    setEquipmentFilter('all');
    setResponsibleFilter('all');
    setListType('activities');
    setWeeklyStatusFilter('all');
    setWeeklyShiftFilter('all');
    setWeeklyLineFilter('all');
    setWeeklyEquipmentFilter('all');
    setWeeklyResponsibleFilter('all');
  };
  const periodLabel = periodFilter === 'date' ? (SPECIFIC_DATE_LABELS[specificDate] ?? 'Custom Date') : PERIOD_LABELS[periodFilter];
  const averageExecutionTime = filteredRows.length
    ? filteredRows.reduce((sum, row) => sum + (Number.parseFloat(row.actualTime) || Number.parseFloat(row.avgTime) || 0), 0) / filteredRows.length
    : Number(cilTme);
  const activeOperatorCount = new Set(filteredRows.filter((row) => row.status !== 'Done').map((row) => row.responsible)).size;
  const abnormalityOpenCount = filteredAbnormalities.filter((row) => row.status !== 'Closed').length;
  const abnormalityResolvedCount = filteredAbnormalities.filter((row) => row.status === 'Closed').length;
  const perfOnTimeDisplay = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const perfAetDisplay = averageExecutionTime.toFixed(1);
  const perfCompletedDisplay = doneCount;
  const abnormalityRateDisplay = totalCount ? Math.round((filteredAbnormalities.length / totalCount) * 100) : 0;
  const abnormalityResolvedDisplay = filteredAbnormalities.length ? Math.round((abnormalityResolvedCount / filteredAbnormalities.length) * 100) : 0;
  const abnormalityOpenDisplay = abnormalityOpenCount;
  const liveRunningDisplay = runningCount;
  const livePendingDisplay = pendingCount;
  const liveOperatorsDisplay = activeOperatorCount;
  const comparisonSuffix = periodFilter === 'mtd'
    ? 'vs Last Month'
    : periodFilter === 'lastMonth'
      ? 'vs Previous Month'
    : periodFilter === 'ytd'
      ? 'vs Last Year'
      : periodFilter === 'actualWeek'
        ? 'vs Last Week'
      : periodFilter === 'lastWeek'
        ? 'vs Previous Week'
      : periodFilter === 'date'
        ? 'vs Previous Day'
        : 'vs Yesterday';
  const onTimeCompletionColor = perfOnTimeDisplay >= 90 ? tokenSuccess.main : tokenError.main;
  const clComplianceDisplay = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const clAvgExecutionDisplay = averageExecutionTime.toFixed(1);
  const clActivitiesCompletedDisplay = doneCount;
  const clParametersMonitoredDisplay = filteredRows.filter((row) => row.type === 'CL' && row.parameter).length;
  const clOutOfRangeDisplay = overdueCount;
  const clResolutionRateDisplay = abnormalityResolvedDisplay;
  const clLiveRunningDisplay = runningCount;
  const clLivePendingDisplay = pendingCount;
  const clLiveOperatorsDisplay = activeOperatorCount;
  const clComplianceColor = clComplianceDisplay >= 90 ? tokenSuccess.main : tokenError.main;
  const cilInsightRows = [
    {
      key: 'overtime',
      title: 'Overtime risk is high on Line B (120% vs target). Consider reallocating operators.',
      subtitle: 'Current overtime trend has been above target for the last 3 shifts.',
      accent: tokenError.main,
      bg: tokenError.softBg,
      border: tokenDivider,
      icon: <AlertIcon sx={{ fontSize: 15 }} />,
    },
    {
      key: 'abnormalities',
      title: '3 abnormalities are open for more than 2 hours.',
      subtitle: 'Prioritize line leader follow-up to reduce execution backlog.',
      accent: tokenWarning.main,
      bg: tokenWarning.softBg,
      border: tokenDivider,
      icon: <InfoOutlinedIcon sx={{ fontSize: 15 }} />,
    },
    {
      key: 'review-queue',
      title: 'Waiting Review queue increased in the last hour.',
      subtitle: 'Review pending CIL executions to avoid delayed closeout.',
      accent: tokenBrand.main,
      bg: tokenBrand.softBg,
      border: tokenDivider,
      icon: <TimelineIcon sx={{ fontSize: 15 }} />,
    },
  ];
  const centerlineInsightRows = [
    {
      key: 'temp',
      title: 'Temperature on Z1 Feeder has increased steadily over the last 5 days and is approaching the upper control limit.',
      subtitle: 'Current reading is 101.2 \u00B0C, just 3.8 \u00B0C below the upper limit of 105 \u00B0C.',
      accent: tokenError.main,
      bg: tokenError.softBg,
      border: tokenDivider,
      icon: <AlertIcon sx={{ fontSize: 15 }} />,
    },
    {
      key: 'pressure',
      title: 'Pressure variability on Line B increased 22% this month, indicating potential instability in the filtering system.',
      subtitle: 'Standard deviation increased from 0.41 to 0.50 bar compared to last month.',
      accent: tokenWarning.main,
      bg: tokenWarning.softBg,
      border: tokenDivider,
      icon: <InfoOutlinedIcon sx={{ fontSize: 15 }} />,
    },
    {
      key: 'recovery',
      title: 'Parameter recovery time after deviations increased from 12 min to 31 min this week.',
      subtitle: 'Slower recovery may indicate emerging equipment or process issues.',
      accent: tokenBrand.main,
      bg: tokenBrand.softBg,
      border: tokenDivider,
      icon: <TimelineIcon sx={{ fontSize: 15 }} />,
    },
  ];
  const centerlineActivityStatusLegend = statusLegendItems;
  const centerlineActivityTotal = centerlineActivityStatusLegend.reduce((sum, item) => sum + item.value, 0);
  const centerlineParameterStatusCounts = {
    inRange: doneCount + runningCount,
    outOfRange: pendingCount + overdueCount,
  };
  const centerlineParameterStatusTotal = Object.values(centerlineParameterStatusCounts).reduce((sum, value) => sum + value, 0);
  const centerlineParameterStatusLegend = [
    { label: 'In Range', value: centerlineParameterStatusCounts.inRange, pct: centerlineParameterStatusTotal ? Math.round((centerlineParameterStatusCounts.inRange / centerlineParameterStatusTotal) * 100) : 0, color: tokenSuccess.main },
    { label: 'Out of Range', value: centerlineParameterStatusCounts.outOfRange, pct: centerlineParameterStatusTotal ? Math.round((centerlineParameterStatusCounts.outOfRange / centerlineParameterStatusTotal) * 100) : 0, color: tokenWarning.dark },
  ];
  const centerlineParameterTotal = centerlineParameterStatusLegend.reduce((sum, item) => sum + item.value, 0);
  const abnormalitiesByLine = Array.from(
    filteredAbnormalities.reduce((map, row) => map.set(row.line, (map.get(row.line) ?? 0) + 1), new Map<string, number>()),
  ).map(([line, count], index) => ({
    line,
    count,
    share: filteredAbnormalities.length ? Math.round((count / filteredAbnormalities.length) * 100) : 0,
    color: [tokenError.main, tokenWarning.dark, tokenWarning.main, tokenSuccess.main, tokenNeutral.darkest][index % 5],
  }));
  const centerlineChartConfig = centerlineChartRangeByParameter[centerlineParameter] ?? centerlineChartRangeByParameter.Temperature;
  const centerlineTrendValues = centerlineTemperatureTrend;
  const centerlineChartTop = 30;
  const centerlineChartBottom = 145;
  const centerlineChartLeft = 20;
  const centerlineChartWidth = 320;
  const centerlineTargetMidpoint = (centerlineChartConfig.targetLow + centerlineChartConfig.targetHigh) / 2;
  const centerlineRangeStatusStyles: Record<CenterlineRangeStatus, { label: string; color: string; background: string; border: string }> = {
    inTarget: { label: 'Inside Target', color: tokenSuccess.darker, background: tokenSuccess.softBg, border: tokenSuccess.main },
    controlZone: { label: 'Control Zone', color: tokenBrand.main, background: tokenBrand.softBg, border: tokenBrand.main },
    outOfRange: { label: 'Out of Range', color: tokenError.dark, background: tokenError.softBg, border: tokenError.main },
  };
  const centerlineControlHighY = mapCenterlineValueToY(centerlineChartConfig.controlHigh, centerlineChartConfig, centerlineChartTop, centerlineChartBottom);
  const centerlineTargetHighY = mapCenterlineValueToY(centerlineChartConfig.targetHigh, centerlineChartConfig, centerlineChartTop, centerlineChartBottom);
  const centerlineTargetLowY = mapCenterlineValueToY(centerlineChartConfig.targetLow, centerlineChartConfig, centerlineChartTop, centerlineChartBottom);
  const centerlineControlLowY = mapCenterlineValueToY(centerlineChartConfig.controlLow, centerlineChartConfig, centerlineChartTop, centerlineChartBottom);

  const centerlineGetTrendValuesForParameter = (parameter: string, equipment: string) => {
    const trendsByEquipment = centerlineParameterTrendByEquipment[parameter] ?? {};
    const equipmentOptions = Object.keys(trendsByEquipment);
    const fallbackEquipment = equipmentOptions[0];
    return trendsByEquipment[equipment] ?? (fallbackEquipment ? trendsByEquipment[fallbackEquipment] : []);
  };

  const effectiveCenterlineCompareParameter = centerlineCompareParameter !== centerlineParameter && centerlineParameterOptions.includes(centerlineCompareParameter)
    ? centerlineCompareParameter
    : (centerlineParameterOptions.find((parameter) => parameter !== centerlineParameter) ?? centerlineParameter);
  const centerlineBuildExpandedChart = (parameter: string, color: string): CenterlineTrendChartModel => {
    const config = centerlineChartRangeByParameter[parameter] ?? centerlineChartRangeByParameter.Temperature;
    const trendsByEquipment = centerlineParameterTrendByEquipment[parameter] ?? {};
    const equipmentOptions = Object.keys(trendsByEquipment);
    const selectedEquipment = equipmentOptions.includes(centerlineTempEquipment) ? centerlineTempEquipment : (equipmentOptions[0] ?? centerlineTempEquipment);
    const baseSeries = centerlineGetTrendValuesForParameter(parameter, selectedEquipment);
    const seed = [...`${parameter}-${selectedEquipment}`].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const series = centerlineExpandedTimeline.pointGranularity === 'month'
      ? buildCenterlineMonthSeries(baseSeries, config, centerlineExpandedTimeline.labels.length, seed)
      : buildCenterlineDaySeries(baseSeries, config, centerlineExpandedTimeline.labels.length, seed, centerlineExpandedTimeline.monthIndex);
    const latestValue = series[series.length - 1] ?? ((config.targetLow + config.targetHigh) / 2);
    const trendTone = getCenterlineTrendTone(series);
    const valuesInTarget = series.filter((value) => value >= config.targetLow && value <= config.targetHigh).length;
    return {
      parameter,
      color,
      config,
      selectedEquipment,
      series,
      labels: centerlineExpandedTimeline.labels,
      latestValue,
      latestStatus: getCenterlineRangeStatus(latestValue, config),
      averageValue: averageCenterlineValues(series),
      minValue: Math.min(...series),
      maxValue: Math.max(...series),
      withinTargetPct: series.length ? Math.round((valuesInTarget / series.length) * 100) : 0,
      trendLabel: trendTone.label,
      trendTone: trendTone.color,
    };
  };
  const centerlineComparisonCharts = [
    centerlineBuildExpandedChart(centerlineParameter, tokenBrand.main),
    centerlineBuildExpandedChart(effectiveCenterlineCompareParameter, tokenWarning.main),
  ];
  const [primaryCenterlineComparison, secondaryCenterlineComparison] = centerlineComparisonCharts;
  const centerlineCorrelation = calculatePearsonCorrelation(primaryCenterlineComparison.series, secondaryCenterlineComparison.series);
  const centerlineCorrelationStrength = getCorrelationStrength(centerlineCorrelation);
  const centerlineNormalizeValue = (value: number, series: number[]) => {
    const min = Math.min(...series);
    const max = Math.max(...series);
    return (value - min) / Math.max(max - min, 0.0001);
  };
  const centerlineJointScores = primaryCenterlineComparison.series.map((value, index) => (
    centerlineNormalizeValue(value, primaryCenterlineComparison.series)
    + centerlineNormalizeValue(secondaryCenterlineComparison.series[index] ?? value, secondaryCenterlineComparison.series)
  ));
  const centerlineLowestJointIndex = centerlineJointScores.reduce((lowestIndex, score, index) => (score < centerlineJointScores[lowestIndex] ? index : lowestIndex), 0);
  const centerlineHighestJointIndex = centerlineJointScores.reduce((highestIndex, score, index) => (score > centerlineJointScores[highestIndex] ? index : highestIndex), 0);
  const centerlineRecoveryIndex = Math.max(0, primaryCenterlineComparison.series.length - 1);

  const openCompletedTaskDetails = (row: TaskRow) => {
    if (row.status !== 'Done' && row.status !== 'Waiting Review') return;
    const sourceRows = activityRows.filter((item) => item.type === row.type);
    const done = countBy(sourceRows, 'Done');
    const running = countBy(sourceRows, 'Running');
    const pending = countBy(sourceRows, 'Pending') + countBy(sourceRows, 'Waiting Review');
    setSelectedCompletedTask({
      id: row.id,
      status: row.status,
      title: row.task,
      equipment: row.equipment,
      source: row.type === 'CIL' ? 'CIL List' : 'Centerline List',
      typeLabel: row.type,
      avgTime: row.avgTime,
      machineState: row.machineState,
      actualTime: row.actualTime,
      completedAt: row.completedAt,
      responsible: row.responsible,
      replayId: row.replayId ?? `${row.task}-${row.equipment}-${Date.now()}`,
      reviewQueueId: row.reviewQueueId,
      replayElapsedSeconds: row.replayElapsedSeconds,
      replayComment: row.replayComment,
      reviewQueueSource: row.reviewQueueSource,
      summary: { done, total: sourceRows.length, completionRate: sourceRows.length ? Math.round((done / sourceRows.length) * 100) : 0, pending, inProgress: running },
    });
  };
  const completeWaitingReview = () => {
    if (!selectedCompletedTask?.reviewQueueId) return;
    if (selectedCompletedTask.reviewQueueSource === 'centerline') {
      updateCenterlineReviewQueueItemStatus(selectedCompletedTask.reviewQueueId, 'Done');
    } else {
      updateCilReviewQueueItemStatus(selectedCompletedTask.reviewQueueId, 'Done');
    }
    setSelectedCompletedTask(null);
  };
  const returnWaitingReview = () => {
    if (!selectedCompletedTask?.reviewQueueId) return;
    if (selectedCompletedTask.reviewQueueSource === 'centerline') {
      updateCenterlineReviewQueueItemStatus(selectedCompletedTask.reviewQueueId, 'Pending');
    } else {
      updateCilReviewQueueItemStatus(selectedCompletedTask.reviewQueueId, 'Pending');
    }
    setSelectedCompletedTask(null);
  };

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' }, gap: 1.5, alignItems: 'center' }}>
          <Box sx={{ maxWidth: 660 }}>
            <Typography variant="h5" sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.334, letterSpacing: 0 }}>
              {mode === 'weekly'
                ? `${selectedDiscipline} Weekly Plan`
                : (selectedDiscipline === 'CIL' ? 'CIL Activities Monitoring' : 'Centerline Activities & Parameter Monitoring')}
            </Typography>
          </Box>
          {mode === 'overview' ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: periodFilter === 'date' ? 'repeat(5, minmax(130px, 1fr)) auto' : 'repeat(4, minmax(130px, 1fr)) auto' }, gap: 0.9, alignItems: 'end', justifyContent: 'end', width: 'fit-content', ml: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 165 }}>
              <InputLabel id="period-filter-label">Period</InputLabel>
              <Select labelId="period-filter-label" value={periodFilter} label="Period" onChange={(event) => setPeriodFilter(event.target.value as PeriodFilter)}>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="actualWeek">Actual Week</MenuItem>
                <MenuItem value="lastWeek">Last Week</MenuItem>
                <MenuItem value="mtd">Month to Date</MenuItem>
                <MenuItem value="lastMonth">Last Month</MenuItem>
                <MenuItem value="ytd">Year to Date</MenuItem>
                <MenuItem value="date">Custom Date</MenuItem>
              </Select>
            </FormControl>
            {periodFilter === 'date' ? (
              <FormControl size="small" sx={{ minWidth: 165 }}>
                <InputLabel id="specific-date-label">Date</InputLabel>
                <Select labelId="specific-date-label" value={specificDate} label="Date" onChange={(event) => setSpecificDate(event.target.value)}>
                  <MenuItem value="2026-05-06">May 6, 2026</MenuItem>
                  <MenuItem value="2026-05-05">May 5, 2026</MenuItem>
                  <MenuItem value="2026-05-04">May 4, 2026</MenuItem>
                </Select>
              </FormControl>
            ) : null}
            <FormControl size="small" sx={{ minWidth: 130 }}><InputLabel id="shift-filter-label">Shift</InputLabel><Select labelId="shift-filter-label" value={shiftFilter} label="Shift" onChange={(event) => setShiftFilter(event.target.value as typeof shiftFilter)}><MenuItem value="all">All</MenuItem><MenuItem value="Shift 1">Shift 1</MenuItem><MenuItem value="Shift 2">Shift 2</MenuItem><MenuItem value="Shift 3">Shift 3</MenuItem></Select></FormControl>
            <FormControl size="small" sx={{ minWidth: 130 }}><InputLabel id="line-filter-header-label">Line</InputLabel><Select labelId="line-filter-header-label" value={lineFilter} label="Line" onChange={(event) => setLineFilter(event.target.value as typeof lineFilter)}><MenuItem value="all">All</MenuItem><MenuItem value="Line A">Line A</MenuItem><MenuItem value="Line B">Line B</MenuItem></Select></FormControl>
            <FormControl size="small" sx={{ minWidth: 165 }}><InputLabel id="equipment-header-label">Equipment</InputLabel><Select labelId="equipment-header-label" value={equipmentFilter} label="Equipment" onChange={(event) => setEquipmentFilter(event.target.value)}><MenuItem value="all">All</MenuItem>{equipmentOptions.map((equipment) => <MenuItem key={`h-equip-${equipment}`} value={equipment}>{equipment}</MenuItem>)}</Select></FormControl>
            <Button onClick={resetFilters} sx={{ color: tokenBrand.main, textTransform: 'none', fontWeight: 500, justifySelf: 'start', px: 0.4, borderRadius: '8px' }}>Clear Filters</Button>
            </Box>
          ) : null}
        </Box>
      </Box>

      {mode === 'weekly' ? (
        <Paper elevation={0} sx={{ ...pageCardSx, overflow: 'hidden' }}>
          <Box sx={{ px: 2, py: 1.25, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap', borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {!fixedDiscipline ? <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {fixedDiscipline ? (
                <Chip
                  label={fixedDiscipline}
                  sx={chipFilterSx(true)}
                />
              ) : (
                <>
                  <Chip label="CIL" onClick={() => setWeeklyDiscipline('CIL')} sx={chipFilterSx(weeklyDiscipline === 'CIL')} />
                  <Chip label="Centerline" onClick={() => setWeeklyDiscipline('Centerline')} sx={chipFilterSx(weeklyDiscipline === 'Centerline')} />
                </>
              )}
            </Box> : <Chip label={selectedDiscipline} sx={chipFilterSx(true)} />}
              <FormControl size="small" sx={{ minWidth: 125 }}>
                <InputLabel id="weekly-status-filter-label">Status</InputLabel>
                <Select labelId="weekly-status-filter-label" value={weeklyStatusFilter} label="Status" onChange={(event) => setWeeklyStatusFilter(event.target.value as typeof weeklyStatusFilter)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Done">Done</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                  <MenuItem value="Out of Target">Out of Target</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 115 }}>
                <InputLabel id="weekly-shift-filter-label">Shift</InputLabel>
                <Select labelId="weekly-shift-filter-label" value={weeklyShiftFilter} label="Shift" onChange={(event) => setWeeklyShiftFilter(event.target.value as typeof weeklyShiftFilter)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Day">Day</MenuItem>
                  <MenuItem value="Night">Night</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 115 }}>
                <InputLabel id="weekly-line-filter-label">Line</InputLabel>
                <Select labelId="weekly-line-filter-label" value={weeklyLineFilter} label="Line" onChange={(event) => setWeeklyLineFilter(event.target.value as typeof weeklyLineFilter)}>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Line A">Line A</MenuItem>
                  <MenuItem value="Line B">Line B</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 165 }}>
                <InputLabel id="weekly-equipment-filter-label">Equipment</InputLabel>
                <Select labelId="weekly-equipment-filter-label" value={weeklyEquipmentFilter} label="Equipment" onChange={(event) => setWeeklyEquipmentFilter(event.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  {weeklyEquipmentOptions.map((equipment) => <MenuItem key={`weekly-equip-${equipment}`} value={equipment}>{equipment}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 145 }}>
                <InputLabel id="weekly-responsible-filter-label">Responsible</InputLabel>
                <Select labelId="weekly-responsible-filter-label" value={weeklyResponsibleFilter} label="Responsible" onChange={(event) => setWeeklyResponsibleFilter(event.target.value)}>
                  <MenuItem value="all">All</MenuItem>
                  {weeklyResponsibleOptions.map((responsible) => <MenuItem key={`weekly-resp-${responsible}`} value={responsible}>{responsible}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
              <IconButton size="small" sx={lightHeaderIconButtonSx}><ChevronLeftIcon fontSize="small" /></IconButton>
              <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 500, minWidth: 170, textAlign: 'center' }}>May 11 - May 17, 2026</Typography>
              <IconButton size="small" sx={lightHeaderIconButtonSx}><ChevronRightIcon fontSize="small" /></IconButton>
            </Box>
          </Box>

          <Box sx={{ p: 1.5, overflowX: 'auto' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(180px, 1fr))', gap: 1, width: '100%' }}>
              {filteredWeeklyDays.map((day) => (
                <Paper key={`${day.dayLabel}-${day.dayNumber}`} elevation={0} sx={{ height: '70vh', maxHeight: 760, borderRadius: '12px', border: day.active ? `1px solid ${tokenBrand.main}` : `1px solid ${tokenDivider}`, bgcolor: 'background.paper', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ px: 1.5, py: 1.25, borderBottom: `1px solid ${tokenDivider}`, bgcolor: day.active ? tokenBrand.softBg : 'background.paper' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.8 }}><Typography variant="body2" sx={{ color: tokenText.secondary, fontWeight: 500 }}>{day.dayLabel}</Typography><Typography variant="h6" sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '1.05rem' }}>{day.dayNumber}</Typography></Box>
                      <Typography variant="caption" sx={{ color: tokenSuccess.darker, fontWeight: 700 }}>{day.tasks.filter((task) => task.status === 'Done').length} / {day.tasks.length}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ p: 1, display: 'grid', gap: 0.85, flex: 1, overflowY: 'auto' }}>
                    {day.tasks.map((task) => (
                      <Paper key={`${day.dayLabel}-${task.title}-${task.shift}-${task.operator}`} elevation={0} sx={{ p: 0.75, borderRadius: '8px', border: `1px solid ${(task.status === 'Overdue' || (effectiveWeeklyDiscipline === 'Centerline' && task.outOfTarget)) ? tokenError.lightest : tokenDivider}`, bgcolor: (task.status === 'Overdue' || (effectiveWeeklyDiscipline === 'Centerline' && task.outOfTarget)) ? tokenError.softBg : 'background.paper' }}>
                        <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.43 }}>{task.title}</Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: 0.2, color: tokenText.secondary, fontSize: '0.75rem', lineHeight: 1.3 }}>{task.equipment}</Typography>
                        {effectiveWeeklyDiscipline === 'Centerline' && task.target ? <Typography variant="caption" sx={{ display: 'block', mt: 0.2, color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.3 }}>Target: {task.target}</Typography> : null}
                        <Box sx={{ mt: 0.55, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.6 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
                            {task.shift === 'Night' ? <NightIcon sx={{ fontSize: 12, color: tokenBrand.main }} /> : <SunnyIcon sx={{ fontSize: 12, color: tokenWarning.main }} />}
                            <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, fontSize: '0.75rem', lineHeight: 1.3 }}>
                              {task.operator}{effectiveWeeklyDiscipline === 'Centerline' ? ' - ' : ''}
                              {effectiveWeeklyDiscipline === 'Centerline' ? <Box component="span" sx={{ color: task.outOfTarget ? tokenError.main : tokenSuccess.darker, fontWeight: 700 }}>{task.value ?? '--'}</Box> : null}
                            </Typography>
                          </Box>
                          <Chip size="small" label={task.status} sx={{ height: 22, bgcolor: statusTone(task.status).bg, color: statusTone(task.status).color, border: `1px solid ${statusTone(task.status).border}`, fontWeight: 800, '& .MuiChip-label': { px: 0.75, fontSize: '0.72rem' } }} />
                        </Box>
                        {(task.status === 'Overdue' || (effectiveWeeklyDiscipline === 'Centerline' && task.outOfTarget)) ? (
                          <Box sx={{ mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.35 }}>
                            <AlertIcon sx={{ fontSize: 10, color: tokenError.main }} />
                            <Typography variant="caption" sx={{ color: tokenError.dark, fontWeight: 700, fontSize: '0.625rem', lineHeight: 1.1 }}>
                              {task.status === 'Overdue' && effectiveWeeklyDiscipline === 'Centerline' && task.outOfTarget
                                ? 'Overdue and out of target'
                                : task.status === 'Overdue'
                                  ? 'Overdue'
                                  : 'Out of target'}
                            </Typography>
                          </Box>
                        ) : null}
                      </Paper>
                    ))}
                    {!day.tasks.length ? <Typography sx={{ fontSize: '0.76rem', color: tokenText.disabled, textAlign: 'center', mt: 1 }}>No tasks for current filters</Typography> : null}
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
        </Paper>
      ) : (
        <>
          {selectedDiscipline === 'CIL' ? (
            <>
              <Paper elevation={0} sx={assistantPanelSx}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2, px: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
                    <InsightsIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
                    <Typography variant="caption" sx={{ color: tokenBrand.main, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      BLU.AI Insights
                    </Typography>
                  </Box>
                  <Button variant="text" sx={{ minWidth: 0, px: 0.2, textTransform: 'none', color: tokenBrand.main, fontWeight: 500, fontSize: '0.8rem', borderRadius: '8px' }}>
                    View all insights <ChevronRightIcon sx={{ fontSize: 16, ml: 0.1 }} />
                  </Button>
                </Box>
                <Box sx={{ display: 'grid', gap: 0.5 }}>
                  {cilInsightRows.map((insight, index) => (
                    <Box key={insight.key} sx={{ px: index === 0 ? 2 : 1, py: index === 0 ? 1.5 : 0.5, borderRadius: '6px', border: index === 0 ? `1px solid ${tokenDivider}` : '1px solid transparent', bgcolor: index === 0 ? 'rgba(0,0,0,0.03)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Box sx={{ color: index === 0 ? tokenError.main : tokenBrand.main, display: 'flex', flexShrink: 0 }}>{insight.icon}</Box>
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 400, lineHeight: 1.3 }}>
                            <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                            {insight.title}
                            </Box>
                            {' - '}
                            {insight.subtitle}
                          </Typography>
                        </Box>
                      </Box>
                      <Button variant="text" sx={{ minWidth: 0, textTransform: 'none', color: tokenBrand.main, fontWeight: 500, fontSize: '0.76rem', whiteSpace: 'nowrap', borderRadius: '8px' }}>
                        View insight <ChevronRightIcon sx={{ fontSize: 14, ml: 0.1 }} />
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Grid container spacing={2} sx={{ mb: 2.1 }}>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Paper elevation={0} sx={kpiSummaryCardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <ShowChartIcon sx={{ fontSize: 17, color: tokenBrand.main }} />
                      <Typography sx={kpiSummaryTitleSx}>CIL Performance</Typography>
                    </Box>
                    <Typography sx={kpiSummaryPeriodSx}>{periodLabel}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.1 }}>
                      <Box>
                        <Typography sx={kpiMetricLabelSx}>On-Time Completion</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: onTimeCompletionColor }}>{perfOnTimeDisplay}%</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenError.main)}>-6% {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Avg. Execution Time</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenBrand.main }}>{perfAetDisplay} min</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>-8% {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Activities Completed</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenBrand.main }}>{perfCompletedDisplay}</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>+9% {comparisonSuffix}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Paper elevation={0} sx={kpiSummaryCardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <ReportProblemOutlinedIcon sx={{ fontSize: 17, color: tokenWarning.dark }} />
                      <Typography sx={kpiSummaryTitleSx}>Abnormality Management</Typography>
                    </Box>
                    <Typography sx={kpiSummaryPeriodSx}>{periodLabel}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.1 }}>
                      <Box>
                        <Typography sx={kpiMetricLabelSx}>Abnormality Rate</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenError.main }}>{abnormalityRateDisplay}%</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenError.main)}>+5% {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Resolution Rate</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenBrand.main }}>{abnormalityResolvedDisplay}%</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>+8% {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Open Abnormalities</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenWarning.dark }}>{abnormalityOpenDisplay}</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>-40% {comparisonSuffix}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Paper elevation={0} sx={kpiSummaryCardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <GroupsOutlinedIcon sx={{ fontSize: 17, color: tokenBrand.main }} />
                      <Typography sx={kpiSummaryTitleSx}>Live Execution</Typography>
                    </Box>
                    <Typography sx={kpiSummaryPeriodSx}>{periodLabel}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.1 }}>
                      <Box>
                        <Typography sx={kpiMetricLabelSx}>Running Activities</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenSuccess.darker }}>{liveRunningDisplay}</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>-33% {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Pending Activities</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenWarning.dark }}>{livePendingDisplay}</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>-29% {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Operators Active</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenSuccess.darker }}>{liveOperatorsDisplay}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2.25, alignItems: 'stretch' }}>
                <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
                  <Paper elevation={0} sx={analyticsCardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="caption" sx={analyticsTitleSx}>Execution Time Trend</Typography>
                      <InfoOutlinedIcon sx={{ fontSize: 14, color: tokenText.secondary }} />
                    </Box>
                    <Box sx={{ mt: 1.2 }}>
                      <svg width="100%" height="180" viewBox="0 0 380 180" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="executionTrendFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={tokenBrand.lightest} stopOpacity="0.42" />
                            <stop offset="100%" stopColor={tokenBrand.lightest} stopOpacity="0.08" />
                          </linearGradient>
                        </defs>
                        {[0, 1, 2, 3, 4, 5].map((tick) => (
                          <line key={`cil-grid-${tick}`} x1="35" y1={20 + tick * 24} x2="355" y2={20 + tick * 24} stroke={tokenDivider} strokeWidth="1" />
                        ))}
                        <text x="12" y="95" transform="rotate(-90 12 95)" fontSize="8" fill={tokenText.secondary}>Time (min)</text>
                        {['25', '20', '15', '10', '5', '0'].map((label, index) => <text key={`y-${label}`} x="20" y={24 + index * 24} fontSize="8" fill={tokenText.secondary}>{label}</text>)}
                        <polyline fill="url(#executionTrendFill)" stroke="none" points={`${cilTrendResolved.map((point, index) => `${35 + index * 53},${145 - point * 4.6}`).join(' ')} 353,145 35,145`} />
                        <polyline fill="none" stroke={tokenSuccess.main} strokeWidth="2.7" points={cilTrendResolved.map((point, index) => `${35 + index * 53},${145 - point * 4.6}`).join(' ')} />
                        <polyline fill="none" stroke={tokenError.main} strokeWidth="2.7" points={cilTrendFound.map((point, index) => `${35 + index * 53},${145 - point * 4.6}`).join(' ')} />
                        {cilTrendFound.map((point, index) => <circle key={`found-${index}`} cx={35 + index * 53} cy={145 - point * 4.6} r="3.1" fill={tokenError.main} stroke={tokenCommon.white} strokeWidth="1" />)}
                        {cilTrendResolved.map((point, index) => <circle key={`resolved-${index}`} cx={35 + index * 53} cy={145 - point * 4.6} r="3.1" fill={tokenSuccess.main} stroke={tokenCommon.white} strokeWidth="1" />)}
                        <line x1="35" y1="145" x2="355" y2="145" stroke={tokenDivider} strokeWidth="1" />
                        {['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'].map((label, index) => <text key={`x-${label}`} x={29 + index * 53} y="164" fontSize="8" fill={tokenText.secondary}>{label}</text>)}
                      </svg>
                      <Box sx={{ mt: 0.55, display: 'flex', gap: 1.3, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}><Box sx={{ width: 14, height: 2.5, borderRadius: 999, bgcolor: tokenSuccess.main }} /><Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary }}>Expected Average Time</Typography></Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}><Box sx={{ width: 14, height: 2.5, borderRadius: 999, bgcolor: tokenError.main }} /><Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary }}>Actual Average Time</Typography></Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
                  <Paper elevation={0} sx={analyticsCardSx}>
                    <Typography variant="caption" sx={analyticsTitleSx}>Abnormalities by Line</Typography>
                    <Box sx={{ mt: 1.6, display: 'grid', gap: 1 }}>
                      {abnormalitiesByLine.map((item) => (
                        <Box key={`line-${item.line}`}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography sx={{ fontSize: '0.78rem', color: tokenText.primary }}>{item.line}</Typography>
                            <Typography sx={{ fontSize: '0.78rem', color: tokenText.primary, fontWeight: 700 }}>{item.count} ({item.share}%)</Typography>
                          </Box>
                          <Box sx={{ mt: 0.2, width: '100%', height: 8, borderRadius: 999, bgcolor: tokenNeutral.lighter }}>
                            <Box sx={{ width: `${item.share}%`, height: '100%', borderRadius: 999, bgcolor: item.color }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex' }}>
                  <Paper elevation={0} sx={analyticsCardSx}>
                    <Typography variant="caption" sx={analyticsTitleSx}>Activity by Status</Typography>
                    <Box sx={{ mt: 1.1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '172px 1fr' }, alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 154, height: 154, borderRadius: '50%', background: `conic-gradient(${tokenSuccess.main} 0% ${statusDonutStops.done}%, ${tokenBrand.main} ${statusDonutStops.done}% ${statusDonutStops.running}%, ${tokenNeutral.dark} ${statusDonutStops.running}% ${statusDonutStops.pending}%, ${tokenError.main} ${statusDonutStops.pending}% 100%)`, display: 'grid', placeItems: 'center', justifySelf: 'center', mx: 'auto' }}>
                        <Box sx={{ width: 94, height: 94, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '1.7rem', fontWeight: 700, color: tokenText.primary, lineHeight: 1 }}>{totalCount}</Typography>
                          <Typography sx={{ fontSize: '0.74rem', color: tokenText.secondary, lineHeight: 1.2, mt: 0.35 }}>Total</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'grid', gap: 0.68, minWidth: 165, pr: { sm: 1.2 } }}>
                        {statusLegendItems.map((item) => (
                          <Box key={`status-${item.label}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} /><Typography sx={{ fontSize: '0.8rem', color: tokenText.primary, fontWeight: 500 }}>{item.label}</Typography></Box>
                            <Typography sx={{ fontSize: '0.8rem', color: tokenText.primary, fontWeight: 700 }}>{item.value} ({item.pct}%)</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </>
          ) : null}

          {selectedDiscipline === 'Centerline' ? (
            <>
              <Paper elevation={0} sx={assistantPanelSx}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 2, px: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
                    <InsightsIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
                    <Typography variant="caption" sx={{ color: tokenBrand.main, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      BLU.AI Insights
                    </Typography>
                  </Box>
                  <Button variant="text" sx={{ minWidth: 0, px: 0.2, textTransform: 'none', color: tokenBrand.main, fontWeight: 500, fontSize: '0.8rem', borderRadius: '8px' }}>
                    View all insights <ChevronRightIcon sx={{ fontSize: 16, ml: 0.1 }} />
                  </Button>
                </Box>
                <Box sx={{ display: 'grid', gap: 0.5 }}>
                  {centerlineInsightRows.map((insight, index) => (
                    <Box key={insight.key} sx={{ px: index === 0 ? 2 : 1, py: index === 0 ? 1.5 : 0.5, borderRadius: '6px', border: index === 0 ? `1px solid ${tokenDivider}` : '1px solid transparent', bgcolor: index === 0 ? 'rgba(0,0,0,0.03)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                        <Box sx={{ color: index === 0 ? tokenError.main : tokenBrand.main, display: 'flex', flexShrink: 0 }}>{insight.icon}</Box>
                        <Box>
                          <Typography sx={{ fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 400, lineHeight: 1.3 }}>
                            <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                            {insight.title}
                            </Box>
                            {' - '}
                            {insight.subtitle}
                          </Typography>
                        </Box>
                      </Box>
                      <Button variant="text" sx={{ minWidth: 0, textTransform: 'none', color: tokenBrand.main, fontWeight: 500, fontSize: '0.76rem', whiteSpace: 'nowrap', borderRadius: '8px' }}>
                        View insight <ChevronRightIcon sx={{ fontSize: 14, ml: 0.1 }} />
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Grid container spacing={2} sx={{ mb: 2.25 }}>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Paper elevation={0} sx={kpiSummaryCardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <AlertIcon sx={{ fontSize: 17, color: tokenError.main }} />
                      <Typography sx={kpiSummaryTitleSx}>Centerline Performance</Typography>
                    </Box>
                    <Typography sx={kpiSummaryPeriodSx}>{periodLabel}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.1 }}>
                      <Box>
                        <Typography sx={kpiMetricLabelSx}>Centerline Compliance</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: clComplianceColor }}>{clComplianceDisplay}%</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenError.main)}>+12 pp {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Avg. Execution Time</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenError.main }}>{clAvgExecutionDisplay} min</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenError.main)}>+18% {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Activities Completed</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenBrand.main }}>{clActivitiesCompletedDisplay}</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>+9% {comparisonSuffix}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Paper elevation={0} sx={kpiSummaryCardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <ReportProblemOutlinedIcon sx={{ fontSize: 17, color: tokenWarning.dark }} />
                      <Typography sx={kpiSummaryTitleSx}>Parameter Deviation Management</Typography>
                    </Box>
                    <Typography sx={kpiSummaryPeriodSx}>{periodLabel}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.1 }}>
                      <Box>
                        <Typography sx={kpiMetricLabelSx}>Parameters Monitored</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenWarning.dark }}>{clParametersMonitoredDisplay}</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>+7% {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Parameters Out of Range</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenWarning.dark }}>{clOutOfRangeDisplay}</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>-40% {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Resolution Rate</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenBrand.main }}>{clResolutionRateDisplay}%</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>+8% {comparisonSuffix}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 4 }}>
                  <Paper elevation={0} sx={kpiSummaryCardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <GroupsOutlinedIcon sx={{ fontSize: 17, color: tokenBrand.main }} />
                      <Typography sx={kpiSummaryTitleSx}>Live Execution</Typography>
                    </Box>
                    <Typography sx={kpiSummaryPeriodSx}>{periodLabel}</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1.1 }}>
                      <Box>
                        <Typography sx={kpiMetricLabelSx}>Running Activities</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenSuccess.darker }}>{clLiveRunningDisplay}</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>-33% {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Pending Activities</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenWarning.dark }}>{clLivePendingDisplay}</Typography>
                        <Typography sx={kpiMetricDeltaSx(tokenSuccess.darker)}>-29% {comparisonSuffix}</Typography>
                      </Box>
                      <Box sx={{ pl: 1.2, borderLeft: `1px solid ${tokenDivider}` }}>
                        <Typography sx={kpiMetricLabelSx}>Operators Active</Typography>
                        <Typography sx={{ ...kpiMetricValueSx, color: tokenSuccess.darker }}>{clLiveOperatorsDisplay}</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2.25, alignItems: 'stretch' }}>
                <Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ display: 'flex' }}>
                  <Paper elevation={0} sx={analyticsCardSx}>
                    <Typography variant="caption" sx={analyticsTitleSx}>Activity by Status</Typography>
                    <Box sx={{ mt: 0.8, minHeight: 190, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '190px 1fr' }, alignItems: 'center', gap: { xs: 1.1, sm: 1.8 } }}>
                      <Box sx={{ width: 174, height: 174, borderRadius: '50%', background: `conic-gradient(${tokenSuccess.main} 0% ${statusDonutStops.done}%, ${tokenBrand.main} ${statusDonutStops.done}% ${statusDonutStops.running}%, ${tokenNeutral.dark} ${statusDonutStops.running}% ${statusDonutStops.pending}%, ${tokenWarning.main} ${statusDonutStops.pending}% 100%)`, display: 'grid', placeItems: 'center', justifySelf: 'center' }}>
                        <Box sx={{ width: 110, height: 110, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: tokenText.primary, lineHeight: 1 }}>{centerlineActivityTotal}</Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: tokenText.secondary, lineHeight: 1.2, mt: 0.35 }}>Total</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'grid', gap: 0.78, pr: { sm: 0.8 } }}>
                        {centerlineActivityStatusLegend.map((item) => (
                          <Box key={`cl-activity-${item.label}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                              <Typography sx={{ fontSize: '0.82rem', color: tokenText.primary, fontWeight: 500 }}>{item.label}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.82rem', color: tokenText.primary, fontWeight: 700 }}>{item.value} ({item.pct}%)</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ display: 'flex' }}>
                  <Paper elevation={0} sx={analyticsCardSx}>
                    <Typography variant="caption" sx={analyticsTitleSx}>Parameter by Status</Typography>
                    <Box sx={{ mt: 0.8, minHeight: 190, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '190px 1fr' }, alignItems: 'center', gap: { xs: 1.1, sm: 1.8 } }}>
                      <Box sx={{ width: 174, height: 174, borderRadius: '50%', background: `conic-gradient(${tokenSuccess.main} 0% ${centerlineParameterStatusLegend[0]?.pct ?? 0}%, ${tokenWarning.dark} ${centerlineParameterStatusLegend[0]?.pct ?? 0}% 100%)`, display: 'grid', placeItems: 'center', justifySelf: 'center' }}>
                        <Box sx={{ width: 110, height: 110, borderRadius: '50%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                          <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: tokenText.primary, lineHeight: 1 }}>{centerlineParameterTotal}</Typography>
                          <Typography sx={{ fontSize: '0.78rem', color: tokenText.secondary, lineHeight: 1.2, mt: 0.35 }}>Total</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'grid', gap: 0.78, pr: { sm: 0.8 } }}>
                        {centerlineParameterStatusLegend.map((item) => (
                          <Box key={`cl-parameter-${item.label}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                              <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color }} />
                              <Typography sx={{ fontSize: '0.82rem', color: tokenText.primary, fontWeight: 500 }}>{item.label}</Typography>
                            </Box>
                            <Typography sx={{ fontSize: '0.82rem', color: tokenText.primary, fontWeight: 700 }}>{item.value} ({item.pct}%)</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ display: 'flex' }}>
                  <Paper elevation={0} sx={analyticsCardSx}>
                    <Typography variant="caption" sx={analyticsTitleSx}>Abnormalities by Line</Typography>
                    <Box sx={{ mt: 1.6, display: 'grid', gap: 0.9 }}>
                      {abnormalitiesByLine.map((item) => (
                        <Box key={`cl-line-${item.line}`}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontSize: '0.77rem', color: tokenText.primary }}>{item.line}</Typography>
                            <Typography sx={{ fontSize: '0.77rem', color: tokenText.primary, fontWeight: 700 }}>{item.count} ({item.share}%)</Typography>
                          </Box>
                          <Box sx={{ mt: 0.2, width: '100%', height: 8, borderRadius: 999, bgcolor: tokenNeutral.lighter }}>
                            <Box sx={{ width: `${item.share}%`, height: '100%', borderRadius: 999, bgcolor: item.color }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6, lg: 3 }} sx={{ display: 'flex' }}>
                  <Paper elevation={0} sx={analyticsCardSx}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.75, flexWrap: 'nowrap', minWidth: 0 }}>
                      <Typography variant="caption" sx={{ ...analyticsTitleSx, mt: 0.4, width: 82, flex: '0 0 82px' }}>Parameter Trend</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'nowrap', justifyContent: 'flex-end', minWidth: 0, flex: '1 1 auto' }}>
                        <FormControl size="small" sx={{ minWidth: 0, width: 118 }}>
                          <InputLabel id="cl-equipment-trend-label">Equipment</InputLabel>
                          <Select labelId="cl-equipment-trend-label" value={centerlineTempEquipment} label="Equipment" onChange={(event) => setCenterlineTempEquipment(event.target.value)} sx={{ '& .MuiSelect-select': { fontSize: '0.75rem' } }}>
                            {centerlineTemperatureEquipmentOptions.map((equipment) => (
                              <MenuItem key={`cl-chart-equip-${equipment}`} value={equipment}>{equipment}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={{ minWidth: 0, width: 118 }}>
                          <InputLabel id="cl-parameter-trend-label">Parameter</InputLabel>
                          <Select
                            labelId="cl-parameter-trend-label"
                            value={centerlineParameter}
                            label="Parameter"
                            onChange={(event) => {
                              const nextParameter = event.target.value;
                              setCenterlineParameter(nextParameter);
                              if (centerlineCompareParameter === nextParameter) {
                                setCenterlineCompareParameter(centerlineParameterOptions.find((parameter) => parameter !== nextParameter) ?? nextParameter);
                              }
                              const equipmentOptions = Object.keys(centerlineParameterTrendByEquipment[nextParameter] ?? {});
                              if (!equipmentOptions.includes(centerlineTempEquipment)) {
                                setCenterlineTempEquipment(equipmentOptions[0] ?? 'Z1 Feeder');
                              }
                            }}
                            sx={{ '& .MuiSelect-select': { fontSize: '0.75rem' } }}
                          >
                            {centerlineParameterOptions.map((parameter) => (
                              <MenuItem key={`cl-chart-param-${parameter}`} value={parameter}>{parameter}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <IconButton
                          onClick={() => setIsCenterlineTrendExpanded(true)}
                          aria-label="Expand parameter trend"
                          sx={{ width: 37, height: 37, flex: '0 0 37px', border: `1px solid ${tokenDivider}`, color: tokenBrand.main, borderRadius: '8px' }}
                        >
                          <OpenInFullIcon sx={{ fontSize: 17 }} />
                        </IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 1 }}>
                        <svg width="100%" height="170" viewBox="0 0 360 170" preserveAspectRatio="none">
                          {[0, 1, 2, 3, 4].map((tick) => (
                          <line key={`cl-grid-${tick}`} x1={centerlineChartLeft} y1={centerlineChartTop + tick * 24} x2={centerlineChartLeft + centerlineChartWidth} y2={centerlineChartTop + tick * 24} stroke={tokenDivider} strokeWidth="1" />
                        ))}
                        <rect x={centerlineChartLeft} y={centerlineChartTop} width={centerlineChartWidth} height={Math.max(0, centerlineControlHighY - centerlineChartTop)} fill={tokenError.softBg} fillOpacity="0.48" />
                        <rect x={centerlineChartLeft} y={centerlineControlHighY} width={centerlineChartWidth} height={Math.max(0, centerlineTargetHighY - centerlineControlHighY)} fill={tokenBrand.softBg} fillOpacity="0.7" />
                        <rect x={centerlineChartLeft} y={centerlineTargetHighY} width={centerlineChartWidth} height={Math.max(0, centerlineTargetLowY - centerlineTargetHighY)} fill={tokenCommon.white} fillOpacity="1" />
                        <rect x={centerlineChartLeft} y={centerlineTargetLowY} width={centerlineChartWidth} height={Math.max(0, centerlineControlLowY - centerlineTargetLowY)} fill={tokenBrand.softBg} fillOpacity="0.7" />
                        <rect x={centerlineChartLeft} y={centerlineControlLowY} width={centerlineChartWidth} height={Math.max(0, centerlineChartBottom - centerlineControlLowY)} fill={tokenError.softBg} fillOpacity="0.48" />
                        <polyline
                          fill="none"
                          stroke={tokenText.secondary}
                          strokeDasharray="4 4"
                          strokeWidth="2"
                          points={centerlineTrendValues.map((_, index) => `${24 + index * 48},${mapCenterlineValueToY(centerlineTargetMidpoint, centerlineChartConfig, centerlineChartTop, centerlineChartBottom)}`).join(' ')}
                        />
                        <polyline
                          fill="none"
                          stroke={tokenBrand.main}
                          strokeWidth="2.8"
                          points={centerlineTrendValues.map((point, index) => `${24 + index * 48},${mapCenterlineValueToY(point, centerlineChartConfig, centerlineChartTop, centerlineChartBottom)}`).join(' ')}
                        />
                        {centerlineTrendValues.map((point, index) => (
                          <circle key={`cl-trend-point-${index}`} cx={24 + index * 48} cy={mapCenterlineValueToY(point, centerlineChartConfig, centerlineChartTop, centerlineChartBottom)} r="2.6" fill={tokenBrand.main} stroke={tokenCommon.white} strokeWidth="1" />
                        ))}
                        {[centerlineChartConfig.max, centerlineChartConfig.max - ((centerlineChartConfig.max - centerlineChartConfig.min) / 4), centerlineChartConfig.max - (((centerlineChartConfig.max - centerlineChartConfig.min) / 4) * 2), centerlineChartConfig.max - (((centerlineChartConfig.max - centerlineChartConfig.min) / 4) * 3), centerlineChartConfig.min].map((value, index) => (
                          <text key={`cl-y-${value}`} x="2" y={34 + index * 24} fontSize="8" fill={tokenText.secondary}>{Number.isInteger(value) ? value : value.toFixed(1)}</text>
                        ))}
                        {centerlineTemperatureLabels.map((label, index) => (
                          <text key={`cl-x-${label}`} x={10 + index * 48} y="160" fontSize="8" fill={tokenText.secondary}>{label}</text>
                        ))}
                        <text x="338" y="92" fontSize="10" fill={tokenBrand.main} fontWeight="700" textAnchor="end">{centerlineChartConfig.unit}</text>
                      </svg>
                      <Box sx={{ mt: 0.6, display: 'flex', alignItems: 'center', gap: 1.1, flexWrap: 'wrap' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 12, height: 2.5, borderRadius: 999, bgcolor: tokenBrand.main }} />
                          <Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary }}>Actual Reading</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 12, borderTop: `2px dashed ${tokenText.secondary}` }} />
                          <Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary }}>Target ({centerlineChartConfig.targetLow} - {centerlineChartConfig.targetHigh} {centerlineChartConfig.unit})</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 12, height: 8, borderRadius: 0.8, bgcolor: 'background.paper', border: `1px solid ${tokenDivider}` }} />
                          <Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary }}>Inside Target</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box sx={{ width: 12, height: 8, borderRadius: 0.8, bgcolor: tokenError.softBg }} />
                          <Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary }}>Out of Range</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </>
          ) : null}

          <Paper elevation={0} sx={{ ...pageCardSx, overflow: 'hidden' }}>
            <Box sx={{ px: 2.25, py: 0, borderBottom: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Tabs
                value={listType}
                onChange={(_, value) => setListType(value)}
                sx={{
                  minHeight: 44,
                  '& .MuiTabs-indicator': { bgcolor: tokenBrand.main, height: 2 },
                  '& .MuiTab-root': {
                    minHeight: 44,
                    py: 1.5,
                    color: tokenText.secondary,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    letterSpacing: '0.1px',
                    textTransform: 'uppercase',
                  },
                  '& .Mui-selected': { color: tokenText.primary, fontWeight: 700 },
                }}
              >
                <Tab value="activities" label={`Activities (${filteredActivities.length})`} />
                <Tab value="abnormalities" label={`Abnormalities (${ABNORMALITY_ROWS.length})`} />
              </Tabs>
            </Box>
            <TableContainer>
              <Table size="small" sx={{ minWidth: 1180 }}>
                <TableHead>
                  <TableRow sx={{ '& th': { color: tokenText.secondary, fontSize: '0.875rem', fontWeight: 500, textTransform: 'none', borderBottom: `1px solid ${tokenDivider}`, py: 1.2 } }}>
                    <TableCell sx={{ pl: 2.25 }}>Activity ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Line</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Equipment / Machine</TableCell>
                    <TableCell>Estimated Time</TableCell>
                    <TableCell>Actual Time</TableCell>
                    <TableCell>Completed By</TableCell>
                    <TableCell>Completed At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listType === 'activities'
                    ? filteredActivities.map((row) => {
                      const sTone = statusTone(row.status);
                      return (
                        <TableRow key={row.id} onClick={() => openCompletedTaskDetails(row)} sx={{ '& td': { borderBottom: `1px solid ${tokenDivider}`, py: 1.05 }, cursor: row.status === 'Done' || row.status === 'Waiting Review' ? 'pointer' : 'default', '&:hover': { bgcolor: tokenBrand.softBg } }}>
                          <TableCell sx={{ pl: 2.25, fontSize: '0.875rem', color: tokenBrand.main, fontWeight: 700 }}>{row.id}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.type}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.primary, fontWeight: 500 }}>{row.task}</TableCell>
                          <TableCell><Chip size="small" label={row.status} sx={{ height: 22, bgcolor: sTone.bg, color: sTone.color, border: `1px solid ${sTone.border}`, fontWeight: 800 }} /></TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.shift}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.line}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.area}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.equipment}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.avgTime}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.status === 'Done' || row.status === 'Waiting Review' ? row.actualTime : '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.responsible}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.status === 'Done' || row.status === 'Waiting Review' ? row.completedAt : '-'}</TableCell>
                        </TableRow>
                      );
                    })
                    : filteredAbnormalities.map((row) => {
                      const sTone = statusTone(row.status === 'In Progress' ? 'Running' : row.status === 'Closed' ? 'Done' : 'Pending');
                      return (
                        <TableRow key={row.activityId} sx={{ '& td': { borderBottom: `1px solid ${tokenDivider}`, py: 1.05 }, '&:hover': { bgcolor: tokenBrand.softBg } }}>
                          <TableCell sx={{ pl: 2.25, fontSize: '0.875rem', color: tokenBrand.main, fontWeight: 700 }}>{row.activityId}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>Abnormality</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.primary, fontWeight: 500 }}>{row.description}</TableCell>
                          <TableCell><Chip size="small" label={row.status} sx={{ height: 22, bgcolor: sTone.bg, color: sTone.color, border: `1px solid ${sTone.border}`, fontWeight: 800 }} /></TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.shift}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.line}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.area}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.equipment}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>-</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>-</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.responsible}</TableCell>
                          <TableCell sx={{ fontSize: '0.875rem', color: tokenText.secondary }}>{row.createdAt}</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}

      <Dialog
        open={isCenterlineTrendExpanded}
        onClose={() => setIsCenterlineTrendExpanded(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{ sx: { borderRadius: '12px', maxHeight: '92vh', overflowX: 'hidden', overflowY: 'auto', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}` } }}
      >
        <Box sx={{ p: { xs: 1.25, md: 1.55 }, bgcolor: 'background.paper' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.25, flexWrap: 'wrap', mb: 1.15 }}>
            <Box sx={{ minWidth: 158 }}>
              <Typography sx={{ color: tokenBrand.main, fontSize: { xs: '0.92rem', md: '1rem' }, lineHeight: 1.28, fontWeight: 700, letterSpacing: 0, textTransform: 'uppercase' }}>
                Parameter<br />Trend
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'flex-end', gap: 1, flex: '1 1 720px' }}>
              <FormControl size="small" sx={{ minWidth: 174 }}>
                <InputLabel id="cl-expanded-primary-parameter-label">Parameter</InputLabel>
                <Select
                  labelId="cl-expanded-primary-parameter-label"
                  value={centerlineParameter}
                  label="Parameter"
                  onChange={(event) => {
                    const nextParameter = event.target.value;
                    setCenterlineParameter(nextParameter);
                    if (effectiveCenterlineCompareParameter === nextParameter) {
                      setCenterlineCompareParameter(centerlineParameterOptions.find((parameter) => parameter !== nextParameter) ?? nextParameter);
                    }
                  }}
                  sx={{ '& .MuiSelect-select': { fontSize: '0.8rem', fontWeight: 700 } }}
                >
                  {centerlineParameterOptions.map((parameter) => (
                    <MenuItem key={`cl-expanded-primary-param-${parameter}`} value={parameter} disabled={parameter === effectiveCenterlineCompareParameter}>{parameter}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 174 }}>
                <InputLabel id="cl-expanded-equipment-label">Equipment</InputLabel>
                <Select
                  labelId="cl-expanded-equipment-label"
                  value={centerlineTempEquipment}
                  label="Equipment"
                  onChange={(event) => setCenterlineTempEquipment(event.target.value)}
                  sx={{ '& .MuiSelect-select': { fontSize: '0.8rem', fontWeight: 700 } }}
                >
                  {centerlineTemperatureEquipmentOptions.map((equipment) => (
                    <MenuItem key={`cl-expanded-equip-${equipment}`} value={equipment}>{equipment}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 176 }}>
                <InputLabel id="cl-expanded-period-label">Date Range</InputLabel>
                <Select
                  labelId="cl-expanded-period-label"
                  value={centerlineExpandedPeriod}
                  label="Date Range"
                  onChange={(event) => setCenterlineExpandedPeriod(event.target.value as CenterlineExpandedPeriod)}
                  sx={{ '& .MuiSelect-select': { fontSize: '0.8rem', fontWeight: 700 } }}
                >
                  <MenuItem value="mtd">Month to Date</MenuItem>
                  <MenuItem value="ytd">Year to Date</MenuItem>
                  <MenuItem value="month">Specific Month</MenuItem>
                </Select>
              </FormControl>
              {centerlineExpandedPeriod === 'month' ? (
                <FormControl size="small" sx={{ minWidth: 190 }}>
                  <InputLabel id="cl-expanded-month-label">Month</InputLabel>
                  <Select
                    labelId="cl-expanded-month-label"
                    value={centerlineExpandedMonth}
                    label="Month"
                    onChange={(event) => setCenterlineExpandedMonth(event.target.value)}
                    sx={{ '& .MuiSelect-select': { fontSize: '0.8rem', fontWeight: 700 } }}
                  >
                    {centerlineExpandedMonthOptions.map((monthOption) => (
                      <MenuItem key={`cl-expanded-month-${monthOption.value}`} value={monthOption.value}>{monthOption.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : null}
              <FormControl size="small" sx={{ minWidth: 190 }}>
                <InputLabel id="cl-expanded-compare-parameter-label">Compare with</InputLabel>
                <Select
                  labelId="cl-expanded-compare-parameter-label"
                  value={effectiveCenterlineCompareParameter}
                  label="Compare with"
                  onChange={(event) => setCenterlineCompareParameter(event.target.value)}
                  sx={{ '& .MuiSelect-select': { fontSize: '0.8rem', fontWeight: 700 } }}
                >
                  {centerlineParameterOptions.map((parameter) => (
                    <MenuItem key={`cl-expanded-compare-param-${parameter}`} value={parameter} disabled={parameter === centerlineParameter}>{parameter}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <IconButton
                onClick={() => setIsCenterlineTrendExpanded(false)}
                aria-label="Close parameter trend"
                sx={{ width: 40, height: 40, border: `1px solid ${tokenDivider}`, color: tokenBrand.main, borderRadius: '8px', bgcolor: 'background.paper' }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>

          <Grid container spacing={1.25} sx={{ mb: 1.25 }}>
            {centerlineComparisonCharts.map((chart) => {
              const chartTop = 34;
              const chartBottom = 206;
              const chartLeft = 44;
              const chartWidth = 884;
              const step = chart.series.length > 1 ? chartWidth / (chart.series.length - 1) : 0;
              const xFor = (index: number) => (chart.series.length > 1 ? chartLeft + (index * step) : chartLeft + (chartWidth / 2));
              const visibleLabelStep = chart.labels.length <= 14 ? 1 : Math.ceil(chart.labels.length / 12);
              const chartControlHighY = mapCenterlineValueToY(chart.config.controlHigh, chart.config, chartTop, chartBottom);
              const chartTargetHighY = mapCenterlineValueToY(chart.config.targetHigh, chart.config, chartTop, chartBottom);
              const chartTargetLowY = mapCenterlineValueToY(chart.config.targetLow, chart.config, chartTop, chartBottom);
              const chartControlLowY = mapCenterlineValueToY(chart.config.controlLow, chart.config, chartTop, chartBottom);
              const chartTargetMid = (chart.config.targetLow + chart.config.targetHigh) / 2;
              return (
                <Grid key={`expanded-chart-${chart.parameter}`} size={{ xs: 12, lg: 6 }} sx={{ display: 'flex' }}>
                  <Paper elevation={0} sx={{ width: '100%', p: 1.2, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.4 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: '0.84rem', color: tokenText.primary, fontWeight: 700, lineHeight: 1.15 }}>{chart.parameter} ({chart.config.unit})</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.65 }}>
                          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: chart.color }} />
                          <Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary, fontWeight: 500 }}>Actual Reading</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography sx={{ fontSize: '0.96rem', color: chart.color, fontWeight: 700, lineHeight: 1.1 }}>{formatCenterlineReading(chart.averageValue, chart.config.unit)}</Typography>
                        <Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary, fontWeight: 500 }}>Average</Typography>
                      </Box>
                    </Box>

                    <svg width="100%" height="250" viewBox="0 0 980 250" preserveAspectRatio="none">
                      {[0, 1, 2, 3, 4].map((tick) => (
                        <line key={`expanded-grid-${chart.parameter}-${tick}`} x1={chartLeft} y1={chartTop + tick * ((chartBottom - chartTop) / 4)} x2={chartLeft + chartWidth} y2={chartTop + tick * ((chartBottom - chartTop) / 4)} stroke={tokenDivider} strokeWidth="1" />
                      ))}
                      <rect x={chartLeft} y={chartTop} width={chartWidth} height={Math.max(0, chartControlHighY - chartTop)} fill={tokenError.softBg} fillOpacity="0.46" />
                      <rect x={chartLeft} y={chartControlHighY} width={chartWidth} height={Math.max(0, chartTargetHighY - chartControlHighY)} fill={tokenBrand.softBg} fillOpacity="0.85" />
                      <rect x={chartLeft} y={chartTargetHighY} width={chartWidth} height={Math.max(0, chartTargetLowY - chartTargetHighY)} fill={tokenCommon.white} fillOpacity="1" />
                      <rect x={chartLeft} y={chartTargetLowY} width={chartWidth} height={Math.max(0, chartControlLowY - chartTargetLowY)} fill={tokenBrand.softBg} fillOpacity="0.85" />
                      <rect x={chartLeft} y={chartControlLowY} width={chartWidth} height={Math.max(0, chartBottom - chartControlLowY)} fill={tokenError.softBg} fillOpacity="0.46" />
                      <polyline
                        fill="none"
                        stroke={tokenText.secondary}
                        strokeDasharray="7 8"
                        strokeWidth="2"
                        points={chart.series.map((_, index) => `${xFor(index)},${mapCenterlineValueToY(chartTargetMid, chart.config, chartTop, chartBottom)}`).join(' ')}
                      />
                      <polyline
                        fill="none"
                        stroke={chart.color}
                        strokeWidth="3.2"
                        points={chart.series.map((point, index) => `${xFor(index)},${mapCenterlineValueToY(point, chart.config, chartTop, chartBottom)}`).join(' ')}
                      />
                      {chart.series.map((point, index) => (
                        <circle key={`expanded-point-${chart.parameter}-${index}`} cx={xFor(index)} cy={mapCenterlineValueToY(point, chart.config, chartTop, chartBottom)} r={chart.series.length > 40 ? 2 : 4.2} fill={chart.color} stroke={tokenCommon.white} strokeWidth="1.8" />
                      ))}
                      {[chart.config.max, chart.config.max - ((chart.config.max - chart.config.min) / 4), chart.config.max - (((chart.config.max - chart.config.min) / 4) * 2), chart.config.max - (((chart.config.max - chart.config.min) / 4) * 3), chart.config.min].map((value, index) => (
                        <text key={`expanded-y-${chart.parameter}-${value}`} x="6" y={38 + index * ((chartBottom - chartTop) / 4)} fontSize="10" fill={tokenText.secondary}>{Number.isInteger(value) ? value : value.toFixed(1)}</text>
                      ))}
                      {chart.labels.map((label, index) => {
                        const showLabel = chart.labels.length <= 14
                          || index === 0
                          || index === chart.labels.length - 1
                          || ((index + 1) % visibleLabelStep === 0);
                        if (!showLabel) return null;
                        return (
                          <text key={`expanded-x-${chart.parameter}-${label}-${index}`} x={xFor(index)} y="232" fontSize="9" fill={tokenText.secondary} textAnchor="middle">{label}</text>
                        );
                      })}
                    </svg>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: { xs: 0.85, md: 1.3 }, flexWrap: 'wrap', mt: -0.25, mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}><Box sx={{ width: 18, height: 2.5, borderRadius: 999, bgcolor: chart.color }} /><Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary, fontWeight: 500 }}>Actual Reading</Typography></Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}><Box sx={{ width: 18, borderTop: `2px dashed ${tokenText.secondary}` }} /><Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary, fontWeight: 500 }}>Target ({chart.config.targetLow} - {chart.config.targetHigh} {chart.config.unit})</Typography></Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}><Box sx={{ width: 18, height: 10, borderRadius: 0.75, bgcolor: tokenBrand.softBg, border: `1px solid ${tokenDivider}` }} /><Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary, fontWeight: 500 }}>Inside Target</Typography></Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}><Box sx={{ width: 18, height: 10, borderRadius: 0.75, bgcolor: tokenError.softBg, border: `1px solid ${tokenDivider}` }} /><Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary, fontWeight: 500 }}>Out of Range</Typography></Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' }, border: `1px solid ${tokenDivider}`, borderRadius: '8px', overflow: 'hidden' }}>
                      {[
                        { label: 'Maximum', value: formatCenterlineReading(chart.maxValue, chart.config.unit), color: chart.maxValue > chart.config.targetHigh ? tokenError.main : chart.color },
                        { label: 'Minimum', value: formatCenterlineReading(chart.minValue, chart.config.unit), color: chart.minValue < chart.config.targetLow ? tokenError.main : chart.color },
                        { label: 'Inside target', value: `${chart.withinTargetPct}%`, color: tokenText.primary },
                        { label: 'Trend', value: chart.trendLabel, color: chart.trendTone },
                      ].map((metric, index) => (
                        <Box key={`${chart.parameter}-${metric.label}`} sx={{ px: 1.25, py: 0.85, borderRight: { md: index < 3 ? `1px solid ${tokenDivider}` : 'none' }, borderTop: { xs: index > 1 ? `1px solid ${tokenDivider}` : 'none', md: 'none' } }}>
                          <Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary, fontWeight: 500 }}>{metric.label}</Typography>
                          <Typography sx={{ fontSize: '0.86rem', color: metric.color, fontWeight: 700, mt: 0.2 }}>{metric.value}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 1,
              border: 'none',
              bgcolor: tokenNeutral.lightest,
              background: 'none',
              overflow: 'hidden',
              minHeight: { xs: 330, md: 250 },
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, mb: 0.2 }}>
                  <InsightsIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
                  <Typography variant="caption" sx={{ color: tokenBrand.main, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>BLU.AI Insights</Typography>
                  <Chip size="small" label="Correlation analysis" sx={{ height: 21, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontSize: '0.66rem', fontWeight: 700 }} />
                </Box>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', fontWeight: 400, lineHeight: 1.25 }}>
                  {centerlineExpandedTimeline.subtitle} | {primaryCenterlineComparison.selectedEquipment}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ px: 2, pb: 2, flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' }, alignItems: 'stretch', gap: 0 }}>
              <Box sx={{ minHeight: { md: 150 }, px: 2, py: 1.5, display: 'flex', flexDirection: 'column', borderRadius: '6px', border: `1px solid ${tokenDivider}`, bgcolor: 'rgba(0,0,0,0.03)' }}>
                <Typography sx={{ fontSize: '0.75rem', color: tokenText.primary, fontWeight: 700 }}>Correlation</Typography>
                <Box sx={{ mt: 0.55, display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: '1.34rem', color: tokenBrand.main, fontWeight: 700, lineHeight: 1 }}>{centerlineCorrelation.toFixed(2)}</Typography>
                  <Chip size="small" label={centerlineCorrelationStrength.label} sx={{ height: 22, color: centerlineCorrelationStrength.color, bgcolor: centerlineCorrelationStrength.bg, border: `1px solid ${centerlineCorrelationStrength.border}`, fontSize: '0.66rem', fontWeight: 900 }} />
                </Box>
                <Typography sx={{ mt: 0.7, fontSize: '0.74rem', color: tokenText.secondary, lineHeight: 1.45, fontWeight: 400 }}>
                  {centerlineCorrelation >= 0
                    ? `When ${secondaryCenterlineComparison.parameter.toLowerCase()} increases, ${primaryCenterlineComparison.parameter.toLowerCase()} tends to increase as well.`
                    : `${secondaryCenterlineComparison.parameter} is moving opposite to ${primaryCenterlineComparison.parameter} in this window.`}
                </Typography>
              </Box>

              <Box sx={{ minHeight: { md: 150 }, px: { md: 1.25 }, py: { xs: 1, md: 0 }, display: 'flex', flexDirection: 'column', borderRight: { md: `1px solid ${tokenDivider}` }, borderBottom: { xs: `1px solid ${tokenDivider}`, md: 'none' } }}>
                <Typography sx={{ fontSize: '0.72rem', color: tokenText.primary, fontWeight: 700 }}>Relationship direction</Typography>
                <TimelineIcon sx={{ mt: 0.7, fontSize: 17, color: tokenBrand.main }} />
                <Typography sx={{ mt: 0.7, fontSize: '0.74rem', color: tokenText.secondary, lineHeight: 1.45, fontWeight: 400 }}>
                  {centerlineCorrelation >= 0
                    ? 'Both parameters rise and fall in the same direction across most of the selected period.'
                    : 'The parameters compensate each other, suggesting an inverse process relationship.'}
                </Typography>
              </Box>

              <Box sx={{ minHeight: { md: 150 }, px: { md: 1.25 }, py: { xs: 1, md: 0 }, display: 'flex', flexDirection: 'column', borderRight: { md: `1px solid ${tokenDivider}` }, borderBottom: { xs: `1px solid ${tokenDivider}`, md: 'none' } }}>
                <Typography sx={{ fontSize: '0.72rem', color: tokenText.primary, fontWeight: 700 }}>Key moments</Typography>
                {[
                  { color: tokenSuccess.main, text: `${centerlineCorrelation >= 0 ? 'Shared peak' : 'Largest separation'} on ${primaryCenterlineComparison.labels[centerlineHighestJointIndex]}` },
                  { color: tokenError.main, text: `${centerlineCorrelation >= 0 ? 'Shared dip' : 'Opposite move'} on ${primaryCenterlineComparison.labels[centerlineLowestJointIndex]}` },
                  { color: tokenSuccess.main, text: `Aligned recovery by ${primaryCenterlineComparison.labels[centerlineRecoveryIndex]}` },
                ].map((moment) => (
                  <Box key={moment.text} sx={{ mt: 0.65, display: 'flex', alignItems: 'flex-start', gap: 0.65 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: moment.color, mt: 0.55, flexShrink: 0 }} />
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.74rem', lineHeight: 1.35, fontWeight: 400 }}>{moment.text}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ minHeight: { md: 150 }, pl: { md: 1.25 }, pt: { xs: 1, md: 0 }, display: 'flex', flexDirection: 'column' }}>
                <Typography sx={{ fontSize: '0.72rem', color: tokenText.primary, fontWeight: 700 }}>Possible impact</Typography>
                <Box sx={{ mt: 0.7, display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                  <InfoOutlinedIcon sx={{ fontSize: 17, color: tokenBrand.main, flexShrink: 0, mt: 0.1 }} />
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.74rem', lineHeight: 1.45, fontWeight: 400 }}>
                    {centerlineCorrelation >= 0
                      ? `${secondaryCenterlineComparison.parameter} may be influencing ${primaryCenterlineComparison.parameter.toLowerCase()}. Monitor the shared process loop on ${primaryCenterlineComparison.selectedEquipment}.`
                      : `A control adjustment in ${secondaryCenterlineComparison.parameter.toLowerCase()} may be masking ${primaryCenterlineComparison.parameter.toLowerCase()} drift. Review setpoint compensation.`}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Dialog>

      <Dialog open={Boolean(kpiDrilldown)} onClose={() => setKpiDrilldown(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '12px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}` } }}>
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.4, color: tokenText.primary }}>KPI Drill Down</Typography>
          <Typography sx={{ fontSize: '0.84rem', color: tokenText.secondary, mb: 1.2 }}>
            {kpiDrilldown === 'performance' ? 'Execution performance details by hour.' : kpiDrilldown === 'abnormality' ? 'Abnormality evolution and root cause concentration.' : 'Execution status distribution trend.'}
          </Typography>
          <svg width="100%" height="200" viewBox="0 0 460 200" preserveAspectRatio="none">
            {[0, 1, 2, 3].map((t) => <line key={`d-${t}`} x1="20" y1={30 + t * 40} x2="440" y2={30 + t * 40} stroke={tokenDivider} />)}
            <polyline fill="none" stroke={tokenBrand.main} strokeWidth="3" points="20,150 80,130 140,138 200,112 260,120 320,95 380,104 440,88" />
            <polyline fill="none" stroke={tokenSuccess.main} strokeWidth="3" points="20,162 80,148 140,150 200,140 260,136 320,128 380,120 440,114" />
          </svg>
          <Box sx={{ mt: 1.3, textAlign: 'right' }}><Button variant="contained" onClick={() => setKpiDrilldown(null)} sx={{ borderRadius: '8px', boxShadow: 'none', textTransform: 'none', bgcolor: tokenBrand.main, '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' } }}>Close</Button></Box>
        </Box>
      </Dialog>

      {selectedCompletedTask ? (
        <Box aria-hidden sx={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <WorkstationCilCenterlineWidget
            onBackToCilCenterline={() => setSelectedCompletedTask(null)}
            reviewMode={selectedCompletedTask.status === 'Waiting Review' ? 'line-leader' : undefined}
            onCompleteReview={completeWaitingReview}
            onReturnReview={returnWaitingReview}
            completedFlowSeed={{
              replayId: selectedCompletedTask.replayId ?? `${Date.now()}`,
              mode: selectedCompletedTask.typeLabel === 'CL' ? 'CL' : 'CIL',
              headerTitle: `${selectedCompletedTask.typeLabel === 'CL' ? 'Centerline' : 'CIL'} Execution - ${selectedCompletedTask.equipment}`,
              elapsedSeconds: selectedCompletedTask.replayElapsedSeconds ?? (Number.parseInt((selectedCompletedTask.actualTime ?? '0').replace(/\D/g, ''), 10) * 60 || 600),
              comment: selectedCompletedTask.replayComment ?? `${selectedCompletedTask.title} finished with ${selectedCompletedTask.actualTime ?? 'recorded'} by ${selectedCompletedTask.responsible ?? 'operator'}.`,
              responsible: selectedCompletedTask.responsible,
            }}
          />
        </Box>
      ) : null}

    </Box>
  );
};

export default CiltKpisScreen;




