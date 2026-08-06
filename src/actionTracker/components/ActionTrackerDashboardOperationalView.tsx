import {useEffect, useMemo, useState} from 'react';
import {
  AccessTimeFilled as AccessTimeFilledIcon,
  Add as AddIcon,
  BookmarkBorder as BookmarkBorderIcon,
  DownloadOutlined as DownloadOutlinedIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Refresh as RefreshIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  TaskAltOutlined as TaskAltOutlinedIcon,
  TipsAndUpdatesOutlined as TipsAndUpdatesOutlinedIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {useActionTrackerContext} from '../contexts/ActionTrackerContext';
import type {
  ActionTrackerCategory,
  ActionTrackerPriority,
  ActionTrackerRow,
  ActionTrackerStatus,
} from '../types';
import {
  actionTrackerReferenceDate,
  getActionTrackerVisibleStatus,
  parseActionTrackerDate,
  resolveActionTrackerScope,
} from '../utils';
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
  workstationPriorityTone,
} from '../../workstation/theme';

type DashboardDatePreset = 'rolling45' | 'quarterToDate' | 'allActivity' | 'custom';
type AssetViewMode = 'graph' | 'table' | 'trend';
type SimpleViewMode = 'chart' | 'table';
type AssetTrendMetric = 'totalActions' | 'averageResolutionDays' | 'closureRate';
type AssetGraphMetric = 'totalActions' | 'averageResolutionDays' | 'closureRate';
type DashboardStatusKey = ActionTrackerStatus | 'Overdue';
type HierarchyKey = 'plant' | 'area' | 'unit' | 'line' | 'zone' | 'machine';

type PreparedRow = ActionTrackerRow & {
  plantLabel: string;
  areaLabel: string;
  unitLabel: string;
  lineLabel: string;
  zoneLabel: string;
  machineLabel: string;
  createdAt: number;
  dueAt: number;
  visibleStatus: DashboardStatusKey;
  overdue: boolean;
};

type AttentionReason =
  | 'Overdue'
  | 'Due today'
  | 'Due this week'
  | 'Waiting approval too long'
  | 'Reopened after completion'
  | 'High priority active action'
  | 'Extended due date'
  | 'Recently reassigned';

type AttentionRecord = {
  row: PreparedRow;
  reason: string;
  reasonType: AttentionReason;
  score: number;
};

type AssetRow = {
  key: string;
  element: string;
  totalActions: number;
  openActions: number;
  overdueActions: number;
  completedActions: number;
  averageResolutionDays: number;
  closureRate: number;
  trend: string;
  rows: PreparedRow[];
};

type AssigneeRow = {
  assignee: string;
  activeActions: number;
  overdueActions: number;
  dueThisWeekActions: number;
  pendingApprovalActions: number;
  closureRate: number;
  averageResolutionDays: number;
  rows: PreparedRow[];
};

type DrilldownItem = {
  row: PreparedRow;
  reason?: string;
};

type DrilldownState = {
  title: string;
  subtitle: string;
  items: DrilldownItem[];
};

type KpiCard = {
  id: string;
  label: string;
  value: string;
  helper: string;
  tone: string;
  tint: string;
  unit?: string;
  onClick?: () => void;
};

type DueDateBucketKey = 'Overdue' | 'Due Today' | 'Due This Week' | 'Due Next Week' | 'Later';

type DueDateBucketRow = {
  bucket: DueDateBucketKey;
  High: number;
  Medium: number;
  Low: number;
  total: number;
  rows: PreparedRow[];
};

const panelBorder = tokenDivider;
const softBorder = tokenDivider;
const surfaceBackground = 'background.paper';
const chartGridColor = tokenNeutral.dark;
const chartAxisColor = tokenText.secondary;
const sectionChipSx = {
  height: 22,
  borderRadius: '999px',
  bgcolor: tokenBrand.softBg,
  color: tokenBrand.main,
  border: `1px solid ${tokenDivider}`,
  fontWeight: 700,
} as const;
const toolbarButtonSx = {
  minHeight: 34,
  borderRadius: '8px',
  px: 1.25,
  fontWeight: 500,
  textTransform: 'none',
  borderColor: tokenBrand.main,
  color: tokenBrand.main,
  bgcolor: 'background.paper',
  boxShadow: 'none',
  '&:hover': {
    borderColor: tokenBrand.dark,
    bgcolor: tokenBrand.softBg,
    boxShadow: 'none',
  },
} as const;
const primaryButtonSx = {
  minHeight: 34,
  borderRadius: '8px',
  px: 1.45,
  fontWeight: 500,
  textTransform: 'none',
  bgcolor: tokenBrand.main,
  color: tokenBrand.contrast,
  boxShadow: 'none',
  '&:hover': {
    bgcolor: tokenBrand.dark,
    boxShadow: 'none',
  },
} as const;
const storageKey = 'action-tracker-dashboard-view-v4';
const dayMs = 24 * 60 * 60 * 1000;
const approvalAgingThresholdDays = 3;
const statusPalette: Record<DashboardStatusKey, string> = {
  Open: tokenBrand.main,
  'In Progress': tokenInfo.main,
  'Under Approval': tokenWarning.main,
  Completed: tokenSuccess.main,
  Overdue: tokenError.main,
  Reopened: tokenWarning.dark,
  Canceled: tokenText.secondary,
};
const statusTone: Record<DashboardStatusKey, {main: string; bg: string; border: string}> = {
  Open: {main: tokenBrand.main, bg: tokenBrand.softBg, border: tokenDivider},
  'In Progress': {main: tokenInfo.main, bg: tokenInfo.softBg, border: tokenDivider},
  'Under Approval': {main: tokenWarning.main, bg: tokenWarning.softBg, border: tokenDivider},
  Completed: {main: tokenSuccess.darker, bg: tokenSuccess.softBg, border: tokenDivider},
  Overdue: {main: tokenError.main, bg: tokenError.softBg, border: tokenDivider},
  Reopened: {main: tokenWarning.dark, bg: tokenWarning.softBg, border: tokenDivider},
  Canceled: {main: tokenText.secondary, bg: tokenNeutral.lightest, border: tokenDivider},
};
const hierarchyOrder: Array<{key: HierarchyKey; label: string; getter: (row: PreparedRow) => string}> = [
  {key: 'plant', label: 'Plant', getter: (row) => row.plantLabel},
  {key: 'area', label: 'Area', getter: (row) => row.areaLabel},
  {key: 'unit', label: 'Unit', getter: (row) => row.unitLabel},
  {key: 'line', label: 'Line', getter: (row) => row.lineLabel},
  {key: 'zone', label: 'Zone', getter: (row) => row.zoneLabel},
  {key: 'machine', label: 'Machine', getter: (row) => row.machineLabel},
];
const statusOrder: DashboardStatusKey[] = ['Open', 'In Progress', 'Under Approval', 'Completed', 'Overdue', 'Reopened', 'Canceled'];
const priorityPalette: Record<ActionTrackerPriority, string> = {
  High: tokenError.main,
  Medium: tokenWarning.main,
  Low: tokenSuccess.darker,
};
const priorityTone = workstationPriorityTone;

function getAreaLabel(row: ActionTrackerRow) {
  if (row.area?.trim()) return row.area;
  if (row.source === 'TMS 1' || row.source === 'Tier' || row.source === 'Action Tracker') return 'Area A';
  if (row.source === 'TMS 2') return 'Area B';
  if (row.source === 'TMS 3' || row.source === 'Shift Logbook') return 'Area C';
  if (row.source === 'Maintenance') return 'Area D';
  return 'Area E';
}

function formatShortDate(value: number) {
  return new Date(value).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

function formatDateInput(value: number) {
  return new Date(value).toLocaleDateString('en-CA');
}

function parseDateInput(value: string, endOfDay = false) {
  if (!value.trim()) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return endOfDay ? parsed.getTime() + dayMs - 1 : parsed.getTime();
}

function formatRange(start: number, end: number) {
  return `${formatShortDate(start)} - ${formatShortDate(end)}`;
}

function getQuarterStart(value: number) {
  const date = new Date(value);
  const quarterMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), quarterMonth, 1).getTime();
}

function buildBuckets(start: number, end: number) {
  const totalDays = Math.max(1, Math.ceil((end - start + dayMs) / dayMs));
  const unit = totalDays <= 31 ? 'day' : totalDays <= 120 ? 'week' : 'month';
  const buckets: Array<{label: string; start: number; end: number}> = [];
  const cursor = new Date(start);
  cursor.setHours(0, 0, 0, 0);

  while (cursor.getTime() <= end) {
    const bucketStart = cursor.getTime();
    let bucketEnd = bucketStart + dayMs - 1;
    let label = formatShortDate(bucketStart);

    if (unit === 'week') {
      bucketEnd = Math.min(end, bucketStart + (7 * dayMs) - 1);
      label = `${formatShortDate(bucketStart)} - ${formatShortDate(bucketEnd)}`;
      cursor.setDate(cursor.getDate() + 7);
    } else if (unit === 'month') {
      const nextMonthStart = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1).getTime();
      bucketEnd = Math.min(end, nextMonthStart - 1);
      label = new Date(bucketStart).toLocaleDateString('en-US', {month: 'short', year: '2-digit'});
      cursor.setMonth(cursor.getMonth() + 1);
    } else {
      cursor.setDate(cursor.getDate() + 1);
    }

    buckets.push({label, start: bucketStart, end: bucketEnd});
  }

  return buckets;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

function getResolutionDays(rows: PreparedRow[]) {
  if (!rows.length) return 0;
  const total = rows.reduce((sum, row) => sum + Math.max(1, Math.round((row.dueAt - row.createdAt) / dayMs)), 0);
  return total / rows.length;
}

function getTrend(current: number, previous: number, inverse = false) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return 'No comparison';
  if (previous === 0) return current === 0 ? 'No change' : `${inverse ? 'Down' : 'Up'} from 0`;
  const delta = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(delta) < 0.1) return 'No change';
  const direction = delta > 0 ? (inverse ? 'Down' : 'Up') : (inverse ? 'Up' : 'Down');
  return `${direction} ${Math.abs(delta).toFixed(1)}%`;
}

function formatDuration(days: number) {
  return Number.isFinite(days) ? days.toFixed(1) : '0.0';
}

function formatInteger(value: number) {
  return new Intl.NumberFormat('en-US', {maximumFractionDigits: 0}).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function isActiveRow(row: PreparedRow) {
  return row.visibleStatus !== 'Completed' && row.visibleStatus !== 'Canceled';
}

function isRowRelevantToPeriod(row: Pick<PreparedRow, 'createdAt' | 'dueAt'>, period: {start: number; end: number}) {
  if (row.createdAt >= period.start && row.createdAt <= period.end) return true;
  return row.createdAt <= period.end && row.dueAt >= period.start;
}

function getTodayRange(now: number) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  const start = date.getTime();
  return {start, end: start + dayMs - 1};
}

function isDueToday(row: PreparedRow, now: number) {
  if (!isActiveRow(row) || row.overdue) return false;
  const today = getTodayRange(now);
  return row.dueAt >= today.start && row.dueAt <= today.end;
}

function isDueThisWeek(row: PreparedRow, now: number) {
  if (!isActiveRow(row) || row.overdue) return false;
  const today = getTodayRange(now);
  return row.dueAt >= today.start && row.dueAt <= today.start + (7 * dayMs) - 1;
}

function isDueNextWeek(row: PreparedRow, now: number) {
  if (!isActiveRow(row) || row.overdue) return false;
  const today = getTodayRange(now);
  const nextWeekStart = today.start + (7 * dayMs);
  const nextWeekEnd = today.start + (14 * dayMs) - 1;
  return row.dueAt >= nextWeekStart && row.dueAt <= nextWeekEnd;
}

function getApprovalAgeDays(row: PreparedRow, now: number) {
  return Math.max(1, Math.round((now - row.createdAt) / dayMs));
}

function getAttentionRecord(row: PreparedRow, now: number): AttentionRecord | null {
  const overdueDays = row.overdue ? Math.max(1, Math.round((now - row.dueAt) / dayMs)) : 0;
  const approvalAge = row.visibleStatus === 'Under Approval' ? getApprovalAgeDays(row, now) : 0;

  if (row.overdue) {
    return {row, reason: `Overdue by ${overdueDays} day${overdueDays === 1 ? '' : 's'}`, reasonType: 'Overdue', score: 2000 + overdueDays};
  }
  if (isDueToday(row, now)) {
    return {row, reason: 'Due today', reasonType: 'Due today', score: 1800};
  }
  if (approvalAge > approvalAgingThresholdDays) {
    return {row, reason: `Waiting approval for ${approvalAge} days`, reasonType: 'Waiting approval too long', score: 1600 + approvalAge};
  }
  if (row.visibleStatus === 'Reopened') {
    return {row, reason: 'Reopened after completion', reasonType: 'Reopened after completion', score: 1500};
  }
  if ((row.dueDateExtensionCount ?? 0) > 0) {
    return {row, reason: 'Extended due date', reasonType: 'Extended due date', score: 1400 + (row.dueDateExtensionCount ?? 0)};
  }
  if ((row.reassignmentCount ?? 0) > 0) {
    return {row, reason: 'Recently reassigned', reasonType: 'Recently reassigned', score: 1300 + (row.reassignmentCount ?? 0)};
  }
  if (row.priority === 'High' && isActiveRow(row)) {
    return {row, reason: 'High priority active action', reasonType: 'High priority active action', score: 1200};
  }
  if (isDueThisWeek(row, now)) {
    return {row, reason: 'Due this week', reasonType: 'Due this week', score: 1100};
  }
  return null;
}

function buildCsv(rows: PreparedRow[]) {
  const columns = ['Action ID', 'Title', 'Owner', 'Plant', 'Area', 'Unit', 'Line', 'Zone', 'Machine', 'Due Date', 'Priority', 'Status'];
  const escapeValue = (value: string | number) => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [
    columns.map(escapeValue).join(','),
    ...rows.map((row) => [
      row.id,
      row.title,
      row.assignedTo,
      row.plantLabel,
      row.areaLabel,
      row.unitLabel,
      row.lineLabel,
      row.zoneLabel,
      row.machineLabel,
      row.dueDate,
      row.priority,
      row.visibleStatus,
    ].map(escapeValue).join(',')),
  ];
  return lines.join('\n');
}

function downloadCsv(filename: string, content: string) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], {type: 'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function DashboardPanel({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper elevation={0} sx={{p: {xs: 1.5, md: 2}, borderRadius: '12px', border: `1px solid ${panelBorder}`, bgcolor: 'background.paper', backgroundImage: 'none', boxShadow: 'none'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 1.05, flexWrap: 'wrap'}}>
        <Box>
          <Typography sx={{fontSize: '0.875rem', lineHeight: 1.57, fontWeight: 500, color: tokenText.primary}}>{title}</Typography>
          <Typography sx={{fontSize: '0.75rem', lineHeight: 1.3, color: tokenText.secondary, mt: 0.25}}>{subtitle}</Typography>
        </Box>
        {actions ? <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap'}}>{actions}</Box> : null}
      </Box>
      {children}
    </Paper>
  );
}

function DashboardChartSurface({
  label,
  detail,
  height,
  children,
  action,
}: {
  label: string;
  detail: string;
  height: number;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Box sx={{p: 1, borderRadius: '12px', border: `1px solid ${softBorder}`, bgcolor: surfaceBackground, backgroundImage: 'none'}}>
      <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.8, flexWrap: 'wrap'}}>
        <Box>
          <Typography sx={{fontSize: '0.75rem', lineHeight: 1.3, letterSpacing: 0, textTransform: 'uppercase', color: tokenText.secondary, fontWeight: 700}}>{label}</Typography>
          <Typography sx={{fontSize: '0.75rem', lineHeight: 1.3, color: tokenText.primary, fontWeight: 500, mt: 0.25}}>{detail}</Typography>
        </Box>
        {action}
      </Box>
      <Box sx={{height, mt: 0.95}}>{children}</Box>
    </Box>
  );
}

function DashboardDataTable({
  columns,
  rows,
}: {
  columns: string[];
  rows: Array<Record<string, string | number>>;
}) {
  return (
    <Box sx={{height: '100%', overflow: 'auto', borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: 'background.paper'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(110px, 1fr))`, px: 1, py: 0.75, bgcolor: tokenNeutral.lightest, borderBottom: `1px solid ${softBorder}`, position: 'sticky', top: 0, zIndex: 1}}>
        {columns.map((column) => (
          <Typography key={column} sx={{fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 700, textTransform: 'uppercase'}}>{column}</Typography>
        ))}
      </Box>
      {rows.map((row, index) => (
        <Box key={index} sx={{display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(110px, 1fr))`, px: 1, py: 0.75, borderBottom: index === rows.length - 1 ? 'none' : `1px solid ${softBorder}`, bgcolor: index % 2 ? tokenNeutral.lightest : 'background.paper'}}>
          {columns.map((column) => (
            <Typography key={column} sx={{fontSize: '0.75rem', color: tokenText.primary, fontWeight: column === columns[0] ? 700 : 400}}>
              {String(row[column] ?? '')}
            </Typography>
          ))}
        </Box>
      ))}
    </Box>
  );
}

function DashboardChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{name?: string; value?: number | string; color?: string; payload?: Record<string, unknown>}>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <Paper elevation={0} sx={{minWidth: 170, px: 1.25, py: 1, borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: 'background.paper', boxShadow: '0 4px 10px rgba(0,31,155,0.12)'}}>
      {label ? <Typography sx={{fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 500, mb: 0.5}}>{label}</Typography> : null}
      <Box sx={{display: 'grid', gap: 0.45}}>
        {payload.map((entry) => (
          <Box key={`${entry.name}-${entry.value}`} sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0}}>
              <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color ?? tokenBrand.main, flexShrink: 0}} />
              <Typography sx={{fontSize: '0.75rem', color: tokenText.primary, fontWeight: 400}}>{entry.name}</Typography>
            </Box>
            <Typography sx={{fontSize: '0.75rem', color: tokenText.primary, fontWeight: 700}}>{entry.value}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function DashboardSelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  label: string;
  value: T | '';
  onChange: (value: T | '') => void;
  options: Array<{label: string; value: T}>;
  allLabel?: string;
}) {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as T | '')}
      sx={{
        '& .MuiInputBase-root': {borderRadius: '12px', bgcolor: 'background.paper'},
        '& .MuiOutlinedInput-notchedOutline': {borderColor: panelBorder},
        '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {borderColor: tokenBrand.main},
        '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor: tokenBrand.main},
      }}
    >
      <MenuItem value="">{allLabel ?? 'All'}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
      ))}
    </TextField>
  );
}

function DashboardDateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      type="date"
      size="small"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      InputLabelProps={{shrink: true}}
      sx={{
        '& .MuiInputBase-root': {borderRadius: '12px', bgcolor: 'background.paper'},
        '& .MuiOutlinedInput-notchedOutline': {borderColor: panelBorder},
        '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {borderColor: tokenBrand.main},
        '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor: tokenBrand.main},
      }}
    />
  );
}

function DashboardMultiSelectField({
  label,
  values,
  onChange,
  options,
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  options: Array<{label: string; value: string}>;
}) {
  return (
    <TextField
      select
      SelectProps={{
        multiple: true,
        renderValue: (selected) => (selected as string[]).length ? `${label}: ${(selected as string[]).join(', ')}` : `All ${label}`,
      }}
      size="small"
      label={label}
      value={values}
      onChange={(event) => onChange(event.target.value as unknown as string[])}
      sx={{
        '& .MuiInputBase-root': {borderRadius: '12px', bgcolor: 'background.paper'},
        '& .MuiOutlinedInput-notchedOutline': {borderColor: panelBorder},
        '& .MuiInputBase-root:hover .MuiOutlinedInput-notchedOutline': {borderColor: tokenBrand.main},
        '& .MuiInputBase-root.Mui-focused .MuiOutlinedInput-notchedOutline': {borderColor: tokenBrand.main},
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          <Checkbox checked={values.includes(option.value)} size="small" sx={{mr: 1}} />
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default function ActionTrackerDashboardOperationalView({
  aiState: _aiState,
  onOpenPrioritizationMethodChat: _onOpenPrioritizationMethodChat,
  onOpenCreatedActionReasonChat: _onOpenCreatedActionReasonChat,
}: {
  aiState?: unknown;
  onOpenPrioritizationMethodChat: () => void;
  onOpenCreatedActionReasonChat: () => void;
}) {
  const {
    actionTrackerItems,
    actionFilterValues,
    clearActionFilters,
    isActionOverdue,
    openActionTrackerDetails,
    setActionFilterValues,
    setIsActionCreateDrawerOpen,
    setSelectedActionTrackerItem,
  } = useActionTrackerContext();

  const [datePreset, setDatePreset] = useState<DashboardDatePreset>('rolling45');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [assetViewMode, setAssetViewMode] = useState<AssetViewMode>('graph');
  const [assetGraphMetric, setAssetGraphMetric] = useState<AssetGraphMetric>('totalActions');
  const [assigneeViewMode, setAssigneeViewMode] = useState<SimpleViewMode>('chart');
  const [assetTrendMetric, setAssetTrendMetric] = useState<AssetTrendMetric>('totalActions');
  const [hiddenStatus, setHiddenStatus] = useState<DashboardStatusKey[]>(['Overdue', 'Reopened', 'Canceled']);
  const [savedViewNote, setSavedViewNote] = useState('');
  const [drilldown, setDrilldown] = useState<DrilldownState | null>(null);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        datePreset?: DashboardDatePreset;
        customDateFrom?: string;
        customDateTo?: string;
        assetViewMode?: AssetViewMode;
        assetGraphMetric?: AssetGraphMetric;
        assigneeViewMode?: SimpleViewMode;
        assetTrendMetric?: AssetTrendMetric;
        hiddenStatus?: DashboardStatusKey[];
      };
      if (parsed.datePreset) setDatePreset(parsed.datePreset);
      if (parsed.customDateFrom) setCustomDateFrom(parsed.customDateFrom);
      if (parsed.customDateTo) setCustomDateTo(parsed.customDateTo);
      if (parsed.assetViewMode) setAssetViewMode(parsed.assetViewMode);
      if (parsed.assetGraphMetric) setAssetGraphMetric(parsed.assetGraphMetric);
      if (parsed.assigneeViewMode) setAssigneeViewMode(parsed.assigneeViewMode);
      if (parsed.assetTrendMetric) setAssetTrendMetric(parsed.assetTrendMetric);
      if (Array.isArray(parsed.hiddenStatus)) setHiddenStatus(parsed.hiddenStatus);
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(storageKey, JSON.stringify({
      datePreset,
      customDateFrom,
      customDateTo,
      assetViewMode,
      assetGraphMetric,
      assigneeViewMode,
      assetTrendMetric,
      hiddenStatus,
    }));
  }, [assetGraphMetric, assetTrendMetric, assetViewMode, assigneeViewMode, customDateFrom, customDateTo, datePreset, hiddenStatus]);

  const preparedRows = useMemo<PreparedRow[]>(() => (
    actionTrackerItems
      .map((row) => {
        const createdAt = typeof row.createdAtMs === 'number' ? row.createdAtMs : parseActionTrackerDate(row.creationDate);
        const dueAt = parseActionTrackerDate(row.dueDate);
        if (createdAt === null || dueAt === null) return null;
        const scope = resolveActionTrackerScope(row);
        return {
          ...row,
          plantLabel: scope.plant || row.plant || '',
          areaLabel: getAreaLabel(row),
          unitLabel: scope.unit || row.unit || '',
          lineLabel: scope.line || row.line || '',
          zoneLabel: scope.zone || row.zone || '',
          machineLabel: row.machine || '',
          createdAt,
          dueAt,
          visibleStatus: getActionTrackerVisibleStatus(row, actionTrackerReferenceDate),
          overdue: isActionOverdue(row),
        };
      })
      .filter((row): row is PreparedRow => Boolean(row))
  ), [actionTrackerItems, isActionOverdue]);

  const minCreatedAt = preparedRows.length ? Math.min(...preparedRows.map((row) => row.createdAt)) : Date.now();
  const maxCreatedAt = preparedRows.length ? Math.max(...preparedRows.map((row) => row.createdAt)) : Date.now();
  const currentPeriod = useMemo(() => {
    if (datePreset === 'custom') {
      const parsedFrom = parseDateInput(customDateFrom);
      const parsedTo = parseDateInput(customDateTo, true);
      const start = parsedFrom ?? minCreatedAt;
      const end = parsedTo ?? maxCreatedAt;
      return start <= end ? {start, end} : {start: end, end: start};
    }
    if (datePreset === 'quarterToDate') return {start: getQuarterStart(maxCreatedAt), end: maxCreatedAt};
    if (datePreset === 'allActivity') return {start: minCreatedAt, end: maxCreatedAt};
    return {start: Math.max(minCreatedAt, maxCreatedAt - (44 * dayMs)), end: maxCreatedAt};
  }, [customDateFrom, customDateTo, datePreset, maxCreatedAt, minCreatedAt]);
  const previousPeriod = useMemo(() => {
    const duration = Math.max(dayMs, currentPeriod.end - currentPeriod.start);
    return {start: currentPeriod.start - duration - dayMs, end: currentPeriod.start - dayMs};
  }, [currentPeriod.end, currentPeriod.start]);
  const buckets = useMemo(() => buildBuckets(currentPeriod.start, currentPeriod.end), [currentPeriod.end, currentPeriod.start]);
  const now = actionTrackerReferenceDate.getTime();

  const plantScopedRows = useMemo(
    () => preparedRows.filter((row) => !(actionFilterValues.plant ?? []).length || (actionFilterValues.plant ?? []).includes(row.plantLabel)),
    [actionFilterValues.plant, preparedRows],
  );
  const areaScopedRows = useMemo(
    () => plantScopedRows.filter((row) => !actionFilterValues.area.length || actionFilterValues.area.includes(row.areaLabel)),
    [actionFilterValues.area, plantScopedRows],
  );
  const unitScopedRows = useMemo(
    () => areaScopedRows.filter((row) => !actionFilterValues.unit.length || actionFilterValues.unit.includes(row.unitLabel)),
    [actionFilterValues.unit, areaScopedRows],
  );
  const lineScopedRows = useMemo(
    () => unitScopedRows.filter((row) => !actionFilterValues.line.length || actionFilterValues.line.includes(row.lineLabel)),
    [actionFilterValues.line, unitScopedRows],
  );
  const zoneScopedRows = useMemo(
    () => lineScopedRows.filter((row) => !(actionFilterValues.zone ?? []).length || (actionFilterValues.zone ?? []).includes(row.zoneLabel)),
    [actionFilterValues.zone, lineScopedRows],
  );

  const plantOptions = useMemo(() => uniqueSorted(preparedRows.map((row) => row.plantLabel)), [preparedRows]);
  const areaOptions = useMemo(() => uniqueSorted(plantScopedRows.map((row) => row.areaLabel)), [plantScopedRows]);
  const unitOptions = useMemo(() => uniqueSorted(areaScopedRows.map((row) => row.unitLabel)), [areaScopedRows]);
  const lineOptions = useMemo(() => uniqueSorted(unitScopedRows.map((row) => row.lineLabel)), [unitScopedRows]);
  const zoneOptions = useMemo(() => uniqueSorted(lineScopedRows.map((row) => row.zoneLabel)), [lineScopedRows]);
  const machineOptions = useMemo(() => uniqueSorted(zoneScopedRows.map((row) => row.machineLabel)), [zoneScopedRows]);
  const ownerOptions = useMemo(() => uniqueSorted(preparedRows.map((row) => row.assignedTo)), [preparedRows]);
  const sourceOptions = useMemo(() => uniqueSorted(preparedRows.map((row) => row.source)), [preparedRows]);
  const createdByOptions = useMemo(() => uniqueSorted(preparedRows.map((row) => row.createdBy)), [preparedRows]);

  useEffect(() => {
    const nextArea = actionFilterValues.area.filter((value) => areaOptions.includes(value));
    if (nextArea.length !== actionFilterValues.area.length) {
      setActionFilterValues((current) => ({...current, area: nextArea}));
    }
  }, [actionFilterValues.area, areaOptions, setActionFilterValues]);

  useEffect(() => {
    const nextUnit = actionFilterValues.unit.filter((value) => unitOptions.includes(value));
    if (nextUnit.length !== actionFilterValues.unit.length) {
      setActionFilterValues((current) => ({...current, unit: nextUnit}));
    }
  }, [actionFilterValues.unit, setActionFilterValues, unitOptions]);

  useEffect(() => {
    const nextLine = actionFilterValues.line.filter((value) => lineOptions.includes(value));
    if (nextLine.length !== actionFilterValues.line.length) {
      setActionFilterValues((current) => ({...current, line: nextLine}));
    }
  }, [actionFilterValues.line, lineOptions, setActionFilterValues]);

  useEffect(() => {
    const nextZone = (actionFilterValues.zone ?? []).filter((value) => zoneOptions.includes(value));
    if (nextZone.length !== (actionFilterValues.zone ?? []).length) {
      setActionFilterValues((current) => ({...current, zone: nextZone}));
    }
  }, [actionFilterValues.zone, setActionFilterValues, zoneOptions]);

  useEffect(() => {
    const nextMachine = (actionFilterValues.machine ?? []).filter((value) => machineOptions.includes(value));
    if (nextMachine.length !== (actionFilterValues.machine ?? []).length) {
      setActionFilterValues((current) => ({...current, machine: nextMachine}));
    }
  }, [actionFilterValues.machine, machineOptions, setActionFilterValues]);

  const filteredRows = useMemo(() => preparedRows.filter((row) => {
    const matchesStatus = !actionFilterValues.status.length || actionFilterValues.status.includes(row.visibleStatus);
    const matchesPriority = !actionFilterValues.priority || row.priority === actionFilterValues.priority;
    const matchesCategory = !actionFilterValues.category.length || actionFilterValues.category.includes(row.category);
    const matchesOwner = !actionFilterValues.assignedTo.length || actionFilterValues.assignedTo.includes(row.assignedTo);
    const matchesCreatedBy = !actionFilterValues.createdBy || row.createdBy === actionFilterValues.createdBy;
    const matchesPlant = !(actionFilterValues.plant ?? []).length || (actionFilterValues.plant ?? []).includes(row.plantLabel);
    const matchesArea = !actionFilterValues.area.length || actionFilterValues.area.includes(row.areaLabel);
    const matchesUnit = !actionFilterValues.unit.length || actionFilterValues.unit.includes(row.unitLabel);
    const matchesLine = !actionFilterValues.line.length || actionFilterValues.line.includes(row.lineLabel);
    const matchesZone = !(actionFilterValues.zone ?? []).length || (actionFilterValues.zone ?? []).includes(row.zoneLabel);
    const matchesMachine = !(actionFilterValues.machine ?? []).length || (actionFilterValues.machine ?? []).includes(row.machineLabel);
    const matchesSource = !actionFilterValues.source.length || actionFilterValues.source.includes(row.source);
    return matchesStatus && matchesPriority && matchesCategory && matchesOwner && matchesCreatedBy && matchesPlant && matchesArea && matchesUnit && matchesLine && matchesZone && matchesMachine && matchesSource;
  }), [actionFilterValues, preparedRows]);

  const currentRows = useMemo(
    () => filteredRows.filter((row) => isRowRelevantToPeriod(row, currentPeriod)),
    [currentPeriod, filteredRows],
  );
  const previousRows = useMemo(
    () => filteredRows.filter((row) => isRowRelevantToPeriod(row, previousPeriod)),
    [filteredRows, previousPeriod],
  );
  const activeRows = useMemo(() => currentRows.filter(isActiveRow), [currentRows]);
  const completedRows = useMemo(() => currentRows.filter((row) => row.visibleStatus === 'Completed'), [currentRows]);
  const previousCompletedRows = useMemo(() => previousRows.filter((row) => row.visibleStatus === 'Completed'), [previousRows]);

  const openDrilldown = (title: string, subtitle: string, items: DrilldownItem[]) => {
    setDrilldown({title, subtitle, items});
  };

  const totalActionsInScope = currentRows.length;
  const overdueRows = currentRows.filter((row) => row.overdue);
  const dueThisWeekRows = activeRows.filter((row) => isDueThisWeek(row, now));
  const pendingApprovalRows = currentRows.filter((row) => row.visibleStatus === 'Under Approval');
  const closureRate = totalActionsInScope ? (completedRows.length / totalActionsInScope) * 100 : 0;
  const avgResolution = getResolutionDays(completedRows.length ? completedRows : currentRows);
  const previousAvgResolution = getResolutionDays(previousCompletedRows.length ? previousCompletedRows : previousRows);

  const kpis: KpiCard[] = [
    {
      id: 'total',
      label: 'Total Actions in Scope',
      value: formatInteger(totalActionsInScope),
      helper: `${getTrend(totalActionsInScope, previousRows.length, true)} versus previous period`,
      tone: tokenBrand.main,
      tint: tokenBrand.softBg,
      onClick: () => openDrilldown('Total Actions in Scope', 'All action records inside the current dashboard scope.', currentRows.map((row) => ({row}))),
    },
    {
      id: 'overdue',
      label: 'Overdue',
      value: formatInteger(overdueRows.length),
      helper: `${getTrend(overdueRows.length, previousRows.filter((row) => row.overdue).length, true)} versus previous period`,
      tone: tokenError.main,
      tint: tokenError.softBg,
      onClick: () => openDrilldown('Overdue Actions', 'Actions that have already missed their due date.', overdueRows.map((row) => ({row, reason: `Overdue by ${Math.max(1, Math.round((now - row.dueAt) / dayMs))} day${Math.max(1, Math.round((now - row.dueAt) / dayMs)) === 1 ? '' : 's'}`}))),
    },
    {
      id: 'dueThisWeek',
      label: 'Due This Week',
      value: formatInteger(dueThisWeekRows.length),
      helper: `${getTrend(dueThisWeekRows.length, previousRows.filter((row) => isDueThisWeek(row, now)).length, true)} versus previous period`,
      tone: tokenWarning.main,
      tint: tokenWarning.softBg,
      onClick: () => openDrilldown('Due This Week', 'Active actions due today or within the next seven days.', dueThisWeekRows.map((row) => ({row, reason: isDueToday(row, now) ? 'Due today' : 'Due this week'}))),
    },
    {
      id: 'pendingApproval',
      label: 'Pending Approval',
      value: formatInteger(pendingApprovalRows.length),
      helper: `${getTrend(pendingApprovalRows.length, previousRows.filter((row) => row.visibleStatus === 'Under Approval').length, true)} versus previous period`,
      tone: tokenInfo.main,
      tint: tokenInfo.softBg,
      onClick: () => openDrilldown('Pending Approval', 'Actions currently waiting for approval.', pendingApprovalRows.map((row) => ({row, reason: `Waiting approval for ${getApprovalAgeDays(row, now)} days`}))),
    },
    {
      id: 'closure',
      label: 'Closure %',
      value: closureRate.toFixed(1),
      unit: '%',
      helper: `${getTrend(closureRate, previousRows.length ? (previousCompletedRows.length / previousRows.length) * 100 : 0)} versus previous period`,
      tone: tokenSuccess.darker,
      tint: tokenSuccess.softBg,
      onClick: () => openDrilldown('Closed Actions', 'Completed actions contributing to closure performance.', completedRows.map((row) => ({row}))),
    },
    {
      id: 'resolution',
      label: 'Avg. Resolution Time',
      value: formatDuration(avgResolution),
      unit: 'days',
      helper: `${getTrend(avgResolution, previousAvgResolution, true)} versus previous period`,
      tone: tokenText.secondary,
      tint: tokenNeutral.lightest,
      onClick: () => openDrilldown('Resolution Time Records', 'Completed records used to calculate average resolution time.', (completedRows.length ? completedRows : currentRows).map((row) => ({row, reason: `${formatDuration(Math.max(1, Math.round((row.dueAt - row.createdAt) / dayMs)))} days`}))),
    },
  ];

  const attentionRecords = useMemo(
    () => currentRows
      .map((row) => getAttentionRecord(row, now))
      .filter((item): item is AttentionRecord => Boolean(item))
      .sort((left, right) => right.score - left.score || left.row.dueAt - right.row.dueAt)
      .slice(0, 10),
    [currentRows, now],
  );

  const dueDateOutlookRows = useMemo<DueDateBucketRow[]>(() => {
    const activeScopedRows = currentRows.filter(isActiveRow);
    const bucketEntries: Array<{bucket: DueDateBucketKey; rows: PreparedRow[]}> = [
      {bucket: 'Overdue', rows: activeScopedRows.filter((row) => row.overdue)},
      {bucket: 'Due Today', rows: activeScopedRows.filter((row) => isDueToday(row, now))},
      {bucket: 'Due This Week', rows: activeScopedRows.filter((row) => isDueThisWeek(row, now) && !isDueToday(row, now))},
      {bucket: 'Due Next Week', rows: activeScopedRows.filter((row) => isDueNextWeek(row, now))},
      {bucket: 'Later', rows: activeScopedRows.filter((row) => !row.overdue && !isDueToday(row, now) && !isDueThisWeek(row, now) && !isDueNextWeek(row, now))},
    ];

    return bucketEntries.map(({bucket, rows}) => ({
      bucket,
      High: rows.filter((row) => row.priority === 'High').length,
      Medium: rows.filter((row) => row.priority === 'Medium').length,
      Low: rows.filter((row) => row.priority === 'Low').length,
      total: rows.length,
      rows,
    }));
  }, [currentRows, now]);

  const selectedHierarchy = {
    plant: (actionFilterValues.plant ?? []).length === 1 ? (actionFilterValues.plant ?? [])[0] : '',
    area: actionFilterValues.area.length === 1 ? actionFilterValues.area[0] : '',
    unit: actionFilterValues.unit.length === 1 ? actionFilterValues.unit[0] : '',
    line: actionFilterValues.line.length === 1 ? actionFilterValues.line[0] : '',
    zone: (actionFilterValues.zone ?? []).length === 1 ? (actionFilterValues.zone ?? [])[0] : '',
    machine: (actionFilterValues.machine ?? []).length === 1 ? (actionFilterValues.machine ?? [])[0] : '',
  };

  const assetScope = useMemo(() => {
    if (selectedHierarchy.machine) return {level: 'machine' as HierarchyKey, label: 'Machine', getter: (row: PreparedRow) => row.machineLabel};
    if (selectedHierarchy.zone) return {level: 'machine' as HierarchyKey, label: 'Machine', getter: (row: PreparedRow) => row.machineLabel};
    if (selectedHierarchy.line) {
      const lineRows = currentRows.filter((row) => row.lineLabel === selectedHierarchy.line);
      const hasZones = lineRows.some((row) => row.zoneLabel);
      return hasZones
        ? {level: 'zone' as HierarchyKey, label: 'Zone', getter: (row: PreparedRow) => row.zoneLabel}
        : {level: 'machine' as HierarchyKey, label: 'Machine', getter: (row: PreparedRow) => row.machineLabel};
    }
    if (selectedHierarchy.unit) return {level: 'line' as HierarchyKey, label: 'Line', getter: (row: PreparedRow) => row.lineLabel};
    if (selectedHierarchy.area) return {level: 'unit' as HierarchyKey, label: 'Unit', getter: (row: PreparedRow) => row.unitLabel};
    if (selectedHierarchy.plant) return {level: 'area' as HierarchyKey, label: 'Area', getter: (row: PreparedRow) => row.areaLabel};
    return {level: 'plant' as HierarchyKey, label: 'Plant', getter: (row: PreparedRow) => row.plantLabel};
  }, [currentRows, selectedHierarchy]);

  const assetRows = useMemo(() => {
    const previousMap = new Map<string, PreparedRow[]>();
    previousRows.forEach((row) => {
      const key = assetScope.getter(row) || `Unassigned ${assetScope.label}`;
      if (!previousMap.has(key)) previousMap.set(key, []);
      previousMap.get(key)?.push(row);
    });

    const groups = new Map<string, PreparedRow[]>();
    currentRows.forEach((row) => {
      const key = assetScope.getter(row) || `Unassigned ${assetScope.label}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(row);
    });

    return Array.from(groups.entries()).map(([key, rows]) => {
      const previousCount = previousMap.get(key)?.length ?? 0;
      const completedCount = rows.filter((row) => row.visibleStatus === 'Completed').length;
      return {
        key,
        element: key,
        totalActions: rows.length,
        openActions: rows.filter(isActiveRow).length,
        overdueActions: rows.filter((row) => row.overdue).length,
        completedActions: completedCount,
        averageResolutionDays: getResolutionDays(rows.filter((row) => row.visibleStatus === 'Completed').length ? rows.filter((row) => row.visibleStatus === 'Completed') : rows),
        closureRate: rows.length ? (completedCount / rows.length) * 100 : 0,
        trend: getTrend(rows.length, previousCount, true),
        rows,
      };
    }).sort((left, right) => right.overdueActions - left.overdueActions || right.openActions - left.openActions || right.totalActions - left.totalActions);
  }, [assetScope, currentRows, previousRows]);

  const assetGraphRows = useMemo(() => assetRows.map((row) => ({
    ...row,
    graphValue: assetGraphMetric === 'averageResolutionDays'
      ? Number(formatDuration(row.averageResolutionDays))
      : assetGraphMetric === 'closureRate'
        ? Number(row.closureRate.toFixed(1))
        : row.totalActions,
  })), [assetGraphMetric, assetRows]);

  const assetTrendSeries = useMemo(() => {
    const topElements = assetRows.slice(0, 4);
    return buckets.map((bucket) => {
      const point: Record<string, string | number> = {Period: bucket.label};
      topElements.forEach((asset) => {
        const rows = asset.rows.filter((row) => row.createdAt >= bucket.start && row.createdAt <= bucket.end);
        const completed = rows.filter((row) => row.visibleStatus === 'Completed').length;
        point[asset.element] = assetTrendMetric === 'averageResolutionDays'
          ? Number(formatDuration(getResolutionDays(rows.filter((row) => row.visibleStatus === 'Completed').length ? rows.filter((row) => row.visibleStatus === 'Completed') : rows)))
          : assetTrendMetric === 'closureRate'
            ? Number((rows.length ? (completed / rows.length) * 100 : 0).toFixed(1))
            : rows.length;
      });
      return point;
    });
  }, [assetRows, assetTrendMetric, buckets]);

  const statusTrendRows = useMemo(() => {
    const totals: Record<DashboardStatusKey, number> = {
      Open: 0,
      'In Progress': 0,
      'Under Approval': 0,
      Completed: 0,
      Overdue: 0,
      Reopened: 0,
      Canceled: 0,
    };

    return buckets.map((bucket) => {
      const point: Record<string, string | number> = {Period: bucket.label};
      statusOrder.forEach((status) => {
        const increment = currentRows.filter((row) => row.visibleStatus === status && row.createdAt >= currentPeriod.start && row.createdAt <= bucket.end).length;
        totals[status] = increment;
        point[status] = totals[status];
      });
      return point;
    });
  }, [buckets, currentPeriod.start, currentRows]);

  const assigneeRows = useMemo(() => {
    const groups = new Map<string, PreparedRow[]>();
    currentRows.forEach((row) => {
      if (!groups.has(row.assignedTo)) groups.set(row.assignedTo, []);
      groups.get(row.assignedTo)?.push(row);
    });
    return Array.from(groups.entries()).map(([assignee, rows]) => {
      const completedCount = rows.filter((row) => row.visibleStatus === 'Completed').length;
      return {
        assignee,
        activeActions: rows.filter(isActiveRow).length,
        overdueActions: rows.filter((row) => row.overdue).length,
        dueThisWeekActions: rows.filter((row) => isDueThisWeek(row, now)).length,
        pendingApprovalActions: rows.filter((row) => row.visibleStatus === 'Under Approval').length,
        closureRate: rows.length ? (completedCount / rows.length) * 100 : 0,
        averageResolutionDays: getResolutionDays(rows.filter((row) => row.visibleStatus === 'Completed').length ? rows.filter((row) => row.visibleStatus === 'Completed') : rows),
        rows,
      };
    }).sort((left, right) => right.overdueActions - left.overdueActions || right.dueThisWeekActions - left.dueThisWeekActions || right.activeActions - left.activeActions);
  }, [currentRows, now]);

  const extendedRows = currentRows.filter((row) => (row.dueDateExtensionCount ?? 0) > 0);
  const reassignedRows = currentRows.filter((row) => (row.reassignmentCount ?? 0) > 0);
  const reopenedRows = currentRows.filter((row) => row.visibleStatus === 'Reopened');
  const approvalAgingRows = pendingApprovalRows.filter((row) => getApprovalAgeDays(row, now) > approvalAgingThresholdDays);
  const averageApprovalAge = pendingApprovalRows.length
    ? pendingApprovalRows.reduce((sum, row) => sum + getApprovalAgeDays(row, now), 0) / pendingApprovalRows.length
    : 0;
  const previousApprovalAge = previousRows.filter((row) => row.visibleStatus === 'Under Approval').length
    ? previousRows.filter((row) => row.visibleStatus === 'Under Approval').reduce((sum, row) => sum + getApprovalAgeDays(row, now), 0) / previousRows.filter((row) => row.visibleStatus === 'Under Approval').length
    : 0;

  const processHealthCards = [
    {
      label: 'Extended Due Date',
      value: formatInteger(extendedRows.length),
      helper: getTrend(extendedRows.length, previousRows.filter((row) => (row.dueDateExtensionCount ?? 0) > 0).length, true),
      detail: `${currentRows.length ? ((extendedRows.length / currentRows.length) * 100).toFixed(1) : '0.0'}% of scoped actions`,
      tone: tokenWarning.main,
      onClick: () => openDrilldown('Extended Due Date', 'Actions that have received a due date extension.', extendedRows.map((row) => ({row, reason: 'Extended due date'}))),
    },
    {
      label: 'Reassigned Actions',
      value: formatInteger(reassignedRows.length),
      helper: getTrend(reassignedRows.length, previousRows.filter((row) => (row.reassignmentCount ?? 0) > 0).length, true),
      detail: `${currentRows.length ? ((reassignedRows.length / currentRows.length) * 100).toFixed(1) : '0.0'}% of scoped actions`,
      tone: tokenSuccess.darker,
      onClick: () => openDrilldown('Reassigned Actions', 'Actions that were recently reassigned.', reassignedRows.map((row) => ({row, reason: 'Recently reassigned'}))),
    },
    {
      label: 'Reopened Actions',
      value: formatInteger(reopenedRows.length),
      helper: getTrend(reopenedRows.length, previousRows.filter((row) => row.visibleStatus === 'Reopened').length, true),
      detail: 'Returned to active flow after completion.',
      tone: tokenWarning.dark,
      onClick: () => openDrilldown('Reopened Actions', 'Actions reopened after completion.', reopenedRows.map((row) => ({row, reason: 'Reopened after completion'}))),
    },
    {
      label: 'Avg. Time in Approval',
      value: formatDuration(averageApprovalAge),
      helper: getTrend(averageApprovalAge, previousApprovalAge, true),
      detail: `${pendingApprovalRows.length} actions currently under approval`,
      tone: tokenInfo.main,
      onClick: () => openDrilldown('Approval Queue', 'Approval records used to calculate average time in approval.', pendingApprovalRows.map((row) => ({row, reason: `Waiting approval for ${getApprovalAgeDays(row, now)} days`}))),
    },
    {
      label: 'Approval Aging',
      value: formatInteger(approvalAgingRows.length),
      helper: `${approvalAgingThresholdDays}+ days in approval`,
      detail: approvalAgingRows.length ? `Oldest waiting approval is ${Math.max(...approvalAgingRows.map((row) => getApprovalAgeDays(row, now)))} days` : 'No approval aging risk in scope',
      tone: tokenError.main,
      onClick: () => openDrilldown('Approval Aging', `Approval records waiting longer than ${approvalAgingThresholdDays} days.`, approvalAgingRows.map((row) => ({row, reason: `Waiting approval for ${getApprovalAgeDays(row, now)} days`}))),
    },
  ];

  const filterChips = useMemo(() => {
    const chips: Array<{label: string; onDelete?: () => void}> = [
      {label: `Range: ${formatRange(currentPeriod.start, currentPeriod.end)}`},
    ];
    const pushMulti = (label: string, values: string[], patcher: (value: string) => void) => {
      values.forEach((value) => chips.push({label: `${label}: ${value}`, onDelete: () => patcher(value)}));
    };
    pushMulti('Plant', actionFilterValues.plant ?? [], (value) => setActionFilterValues((current) => ({...current, plant: (current.plant ?? []).filter((item) => item !== value)})));
    pushMulti('Area', actionFilterValues.area, (value) => setActionFilterValues((current) => ({...current, area: current.area.filter((item) => item !== value)})));
    pushMulti('Unit', actionFilterValues.unit, (value) => setActionFilterValues((current) => ({...current, unit: current.unit.filter((item) => item !== value)})));
    pushMulti('Line', actionFilterValues.line, (value) => setActionFilterValues((current) => ({...current, line: current.line.filter((item) => item !== value)})));
    pushMulti('Zone', actionFilterValues.zone ?? [], (value) => setActionFilterValues((current) => ({...current, zone: (current.zone ?? []).filter((item) => item !== value)})));
    pushMulti('Machine', actionFilterValues.machine ?? [], (value) => setActionFilterValues((current) => ({...current, machine: (current.machine ?? []).filter((item) => item !== value)})));
    pushMulti('Source', actionFilterValues.source, (value) => setActionFilterValues((current) => ({...current, source: current.source.filter((item) => item !== value)})));
    pushMulti('Status', actionFilterValues.status, (value) => setActionFilterValues((current) => ({...current, status: current.status.filter((item) => item !== value)})));
    pushMulti('Category', actionFilterValues.category, (value) => setActionFilterValues((current) => ({...current, category: current.category.filter((item) => item !== value)})));
    pushMulti('Owner', actionFilterValues.assignedTo, (value) => setActionFilterValues((current) => ({...current, assignedTo: current.assignedTo.filter((item) => item !== value)})));
    if (actionFilterValues.priority) {
      chips.push({label: `Priority: ${actionFilterValues.priority}`, onDelete: () => setActionFilterValues((current) => ({...current, priority: ''}))});
    }
    if (actionFilterValues.createdBy) {
      chips.push({label: `Created By: ${actionFilterValues.createdBy}`, onDelete: () => setActionFilterValues((current) => ({...current, createdBy: ''}))});
    }
    return chips;
  }, [actionFilterValues, currentPeriod.end, currentPeriod.start, setActionFilterValues]);

  const setHierarchyFilters = (patch: Partial<typeof actionFilterValues>) => {
    setActionFilterValues((current) => ({...current, ...patch}));
  };

  const handlePlantChange = (values: string[]) => {
    setHierarchyFilters({plant: values, area: [], unit: [], line: [], zone: [], machine: []});
  };
  const handleAreaChange = (values: string[]) => {
    setHierarchyFilters({area: values, unit: [], line: [], zone: [], machine: []});
  };
  const handleUnitChange = (values: string[]) => {
    setHierarchyFilters({unit: values, line: [], zone: [], machine: []});
  };
  const handleLineChange = (values: string[]) => {
    setHierarchyFilters({line: values, zone: [], machine: []});
  };
  const handleZoneChange = (values: string[]) => {
    setHierarchyFilters({zone: values, machine: []});
  };
  const handleMachineChange = (values: string[]) => {
    setHierarchyFilters({machine: values});
  };

  const hierarchyBreadcrumbs = hierarchyOrder
    .map((level) => ({
      ...level,
      value: level.key === 'plant'
        ? selectedHierarchy.plant
        : level.key === 'area'
          ? selectedHierarchy.area
          : level.key === 'unit'
            ? selectedHierarchy.unit
            : level.key === 'line'
              ? selectedHierarchy.line
              : level.key === 'zone'
                ? selectedHierarchy.zone
                : selectedHierarchy.machine,
    }))
    .filter((level) => level.value);

  const drillAssetDown = (element: string) => {
    if (assetScope.level === 'plant') handlePlantChange(element ? [element] : []);
    if (assetScope.level === 'area') handleAreaChange(element ? [element] : []);
    if (assetScope.level === 'unit') handleUnitChange(element ? [element] : []);
    if (assetScope.level === 'line') handleLineChange(element ? [element] : []);
    if (assetScope.level === 'zone') handleZoneChange(element ? [element] : []);
    if (assetScope.level === 'machine') handleMachineChange(element ? [element] : []);
  };

  const drillAssetUp = () => {
    if (selectedHierarchy.machine) handleMachineChange([]);
    else if (selectedHierarchy.zone) handleZoneChange([]);
    else if (selectedHierarchy.line) handleLineChange([]);
    else if (selectedHierarchy.unit) handleUnitChange([]);
    else if (selectedHierarchy.area) handleAreaChange([]);
    else if (selectedHierarchy.plant) handlePlantChange([]);
  };

  const resetFilters = () => {
    clearActionFilters();
    setDatePreset('rolling45');
    setCustomDateFrom('');
    setCustomDateTo('');
    setHiddenStatus([]);
    setShowMoreFilters(false);
  };

  const visibleStatusRows = statusOrder.filter((status) => !hiddenStatus.includes(status));
  const visibleAttentionRecords = attentionRecords.slice(0, 6);
  const dueDateOutlookChartHeight = Math.min(292, Math.max(220, dueDateOutlookRows.length * 32 + 48));
  const assetChartHeight = assetRows.length <= 1
    ? 220
    : Math.min(360, Math.max(256, assetRows.slice(0, 8).length * 32 + 54));
  const assigneeChartHeight = Math.min(330, Math.max(240, assigneeRows.slice(0, 10).length * 28 + 56));
  const statusChartHeight = Math.min(320, Math.max(255, visibleStatusRows.length * 18 + 150));

  return (
    <Box sx={{display: 'grid', gap: 1.5}}>
      <Paper elevation={0} sx={{p: {xs: 1.5, md: 2}, borderRadius: '12px', border: `1px solid ${panelBorder}`, bgcolor: 'background.paper', backgroundImage: 'none', boxShadow: 'none'}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.1, flexWrap: 'wrap'}}>
          <Box>
            <Typography sx={{fontSize: '1.25rem', lineHeight: 1.6, color: tokenText.primary, fontWeight: 700}}>Action Tracker Dashboard</Typography>
            <Typography sx={{fontSize: '0.875rem', lineHeight: 1.43, color: tokenText.secondary, mt: 0.25}}>
              Operational analytics for action workload, due date pressure, asset tree performance, ownership, and process health.
            </Typography>
            <Typography sx={{fontSize: '0.75rem', lineHeight: 1.3, color: tokenText.disabled, mt: 0.25}}>
              Filters refine only the action records already visible to the current user scope.
            </Typography>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap'}}>
            <Button variant="outlined" startIcon={<BookmarkBorderIcon />} onClick={() => setSavedViewNote(`Saved dashboard view at ${new Date().toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}.`)} sx={toolbarButtonSx}>Save View</Button>
            <Button variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={() => downloadCsv('action-tracker-dashboard.csv', buildCsv(currentRows))} sx={toolbarButtonSx}>Export</Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setSelectedActionTrackerItem(null); setIsActionCreateDrawerOpen(true); }} sx={primaryButtonSx}>Add Action</Button>
          </Box>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(8, minmax(0, 1fr))'}, gap: 0.75, mt: 1.1}}>
          <DashboardSelectField
            label="Date Range"
            value={datePreset}
            onChange={(value) => setDatePreset((value || 'rolling45') as DashboardDatePreset)}
            options={[
              {label: `Rolling 45 days (${formatRange(currentPeriod.start, currentPeriod.end)})`, value: 'rolling45'},
              {label: 'Quarter to date', value: 'quarterToDate'},
              {label: 'All activity', value: 'allActivity'},
              {label: 'Custom range', value: 'custom'},
            ]}
          />
          <DashboardMultiSelectField label="Plant" values={actionFilterValues.plant ?? []} onChange={handlePlantChange} options={plantOptions.map((value) => ({label: value, value}))} />
          <DashboardMultiSelectField label="Area" values={actionFilterValues.area} onChange={handleAreaChange} options={areaOptions.map((value) => ({label: value, value}))} />
          <DashboardMultiSelectField label="Unit" values={actionFilterValues.unit} onChange={handleUnitChange} options={unitOptions.map((value) => ({label: value, value}))} />
          <DashboardMultiSelectField label="Line" values={actionFilterValues.line} onChange={handleLineChange} options={lineOptions.map((value) => ({label: value, value}))} />
          <DashboardMultiSelectField label="Status" values={actionFilterValues.status} onChange={(values) => setActionFilterValues((current) => ({...current, status: values}))} options={statusOrder.map((value) => ({label: value, value}))} />
          <DashboardSelectField<ActionTrackerPriority> label="Priority" value={(actionFilterValues.priority as ActionTrackerPriority | '') ?? ''} onChange={(value) => setActionFilterValues((current) => ({...current, priority: value || ''}))} options={(['High', 'Medium', 'Low'] as ActionTrackerPriority[]).map((value) => ({label: value, value}))} allLabel="All Priorities" />
          <DashboardMultiSelectField label="Owner / Assignee" values={actionFilterValues.assignedTo} onChange={(values) => setActionFilterValues((current) => ({...current, assignedTo: values}))} options={ownerOptions.map((value) => ({label: value, value}))} />
            <Button variant="outlined" onClick={() => setShowMoreFilters((current) => !current)} sx={{...toolbarButtonSx, minHeight: 40}}>
            {showMoreFilters ? 'Less Filters' : 'More Filters'}
          </Button>
          {datePreset === 'custom' ? <DashboardDateField label="From" value={customDateFrom || formatDateInput(currentPeriod.start)} onChange={setCustomDateFrom} /> : null}
          {datePreset === 'custom' ? <DashboardDateField label="To" value={customDateTo || formatDateInput(currentPeriod.end)} onChange={setCustomDateTo} /> : null}
        </Box>

        {showMoreFilters ? (
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))'}, gap: 0.75, mt: 0.75}}>
            <DashboardMultiSelectField label="Zone" values={actionFilterValues.zone ?? []} onChange={handleZoneChange} options={zoneOptions.map((value) => ({label: value, value}))} />
            <DashboardMultiSelectField label="Machine" values={actionFilterValues.machine ?? []} onChange={handleMachineChange} options={machineOptions.map((value) => ({label: value, value}))} />
            <DashboardMultiSelectField label="Source / Origin" values={actionFilterValues.source} onChange={(values) => setActionFilterValues((current) => ({...current, source: values}))} options={sourceOptions.map((value) => ({label: value, value}))} />
            <DashboardMultiSelectField label="Category / SQDCP" values={actionFilterValues.category} onChange={(values) => setActionFilterValues((current) => ({...current, category: values}))} options={(['SAFETY', 'QUALITY', 'DELIVERY', 'COST', 'PEOPLE'] as ActionTrackerCategory[]).map((value) => ({label: value, value}))} />
            <DashboardSelectField label="Created By" value={actionFilterValues.createdBy} onChange={(value) => setActionFilterValues((current) => ({...current, createdBy: value || ''}))} options={createdByOptions.map((value) => ({label: value, value}))} allLabel="All Creators" />
          </Box>
        ) : null}

        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap', mt: 0.8}}>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={resetFilters} sx={{...toolbarButtonSx, minHeight: 30, px: 1}}>Reset Filters</Button>
          {filterChips.map((chip) => (
            <Chip key={chip.label} size="small" label={chip.label} onDelete={chip.onDelete} sx={{borderRadius: '999px', fontWeight: 500, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, '& .MuiChip-label': {px: 0.85}}} />
          ))}
        </Box>
        {savedViewNote ? <Typography sx={{mt: 0.55, fontSize: '0.75rem', color: tokenBrand.main, fontWeight: 500}}>{savedViewNote}</Typography> : null}
      </Paper>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))'}, gap: 0.8}}>
        {kpis.map((metric) => (
          <Paper key={metric.id} elevation={0} onClick={metric.onClick} sx={{p: 1.25, minHeight: 108, borderRadius: '8px', border: `1px solid ${panelBorder}`, borderLeft: `4px solid ${metric.tone}`, bgcolor: 'background.paper', backgroundImage: 'none', cursor: metric.onClick ? 'pointer' : 'default', boxShadow: 'none', '&:hover': metric.onClick ? {borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg} : undefined, transition: 'background-color 140ms ease, border-color 140ms ease'}}>
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.8}}>
              <Box sx={{width: 32, height: 32, borderRadius: '6px', bgcolor: metric.tint, color: metric.tone, display: 'grid', placeItems: 'center'}}>
                {metric.id === 'overdue' ? <ReportProblemOutlinedIcon sx={{fontSize: 20}} /> : metric.id === 'resolution' ? <AccessTimeFilledIcon sx={{fontSize: 20}} /> : metric.id === 'pendingApproval' ? <TaskAltOutlinedIcon sx={{fontSize: 20}} /> : <TipsAndUpdatesOutlinedIcon sx={{fontSize: 20}} />}
              </Box>
              <Typography sx={{fontSize: '0.625rem', lineHeight: 1.4, color: tokenText.secondary, fontWeight: 500, textAlign: 'right', maxWidth: 128}}>{metric.helper}</Typography>
            </Box>
            <Typography sx={{mt: 1, fontSize: '0.75rem', color: tokenText.primary, fontWeight: 700}}>{metric.label}</Typography>
            <Typography sx={{mt: 0.25, fontSize: '1.5rem', color: tokenText.primary, fontWeight: 700, lineHeight: 1}}>
              {metric.value}
              {metric.unit ? <Box component="span" sx={{fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 500, ml: 0.35}}>{metric.unit}</Box> : null}
            </Typography>
          </Paper>
        ))}
      </Box>

      <DashboardPanel
        title="Actions Requiring Attention"
        subtitle="Priority records that need follow-up now, without turning this dashboard into the full action list."
        actions={
          <>
            <Chip size="small" label={`${visibleAttentionRecords.length} of ${attentionRecords.length}`} sx={sectionChipSx} />
            <Button size="small" variant="outlined" onClick={() => openDrilldown('Actions Requiring Attention', 'Action records currently surfaced by the attention rules in the dashboard scope.', attentionRecords.map((item) => ({row: item.row, reason: item.reason})))} sx={toolbarButtonSx}>
              View All
            </Button>
          </>
        }
      >
        <Box sx={{display: 'grid', gap: 0.65}}>
          <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(82px, 0.75fr) minmax(210px, 1.6fr) minmax(120px, 0.95fr) minmax(160px, 1.15fr) minmax(98px, 0.85fr) minmax(78px, 0.7fr) minmax(110px, 0.85fr) minmax(150px, 1.05fr) minmax(108px, 0.85fr)', gap: 0.8, px: 1, py: 0.75, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: `1px solid ${softBorder}`}}>
            {['Action ID', 'Title', 'Owner', 'Area / Line / Machine', 'Due Date', 'Priority', 'Status', 'Reason', 'Open Detail'].map((column) => (
              <Typography key={column} sx={{fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 700, textTransform: 'uppercase'}}>{column}</Typography>
            ))}
          </Box>
          <Box sx={{display: 'grid', gap: 0.55, maxHeight: 332, overflow: 'auto', pr: 0.15}}>
          {visibleAttentionRecords.map((item, index) => (
            <Box key={item.row.id} sx={{display: 'grid', gridTemplateColumns: 'minmax(82px, 0.75fr) minmax(210px, 1.6fr) minmax(120px, 0.95fr) minmax(160px, 1.15fr) minmax(98px, 0.85fr) minmax(78px, 0.7fr) minmax(110px, 0.85fr) minmax(150px, 1.05fr) minmax(108px, 0.85fr)', gap: 0.8, alignItems: 'center', px: 1, py: 0.8, borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: index % 2 ? tokenNeutral.lightest : 'background.paper', transition: 'background-color 120ms ease, border-color 120ms ease', '&:hover': {bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main}}}>
              <Typography sx={{fontSize: '0.75rem', color: tokenBrand.main, fontWeight: 700}}>{item.row.id}</Typography>
              <Typography sx={{fontSize: '0.75rem', color: tokenText.primary, fontWeight: 500, lineHeight: 1.3}}>{item.row.title}</Typography>
              <Typography sx={{fontSize: '0.75rem', color: tokenText.primary, fontWeight: 400}}>{item.row.assignedTo}</Typography>
              <Typography sx={{fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 400, lineHeight: 1.3}}>
                {[item.row.areaLabel, item.row.lineLabel, item.row.machineLabel].filter(Boolean).join(' / ') || 'Unassigned'}
              </Typography>
              <Typography sx={{fontSize: '0.75rem', color: item.row.overdue ? tokenError.main : tokenText.primary, fontWeight: 500}}>{item.row.dueDate}</Typography>
              <Chip size="small" label={item.row.priority} sx={{width: 'fit-content', height: 22, bgcolor: priorityTone[item.row.priority].bg, color: priorityTone[item.row.priority].color, border: `1px solid ${priorityTone[item.row.priority].border}`, fontWeight: 500}} />
              <Chip size="small" label={item.row.visibleStatus} sx={{width: 'fit-content', height: 22, bgcolor: statusTone[item.row.visibleStatus].bg, color: statusTone[item.row.visibleStatus].main, border: `1px solid ${statusTone[item.row.visibleStatus].border}`, fontWeight: 500}} />
              <Chip size="small" label={item.reason} sx={{width: 'fit-content', maxWidth: '100%', bgcolor: tokenNeutral.lightest, color: tokenText.primary, border: `1px solid ${tokenDivider}`, fontWeight: 500, '& .MuiChip-label': {overflow: 'hidden', textOverflow: 'ellipsis'}}} />
              <Button size="small" variant="outlined" onClick={() => openActionTrackerDetails(item.row)} sx={{...toolbarButtonSx, minHeight: 28}}>Open Detail</Button>
            </Box>
          ))}
          </Box>
          {!attentionRecords.length ? (
            <Typography sx={{py: 2.5, textAlign: 'center', color: tokenText.secondary, fontSize: '0.875rem'}}>No actions require immediate follow-up inside the current dashboard scope.</Typography>
          ) : null}
        </Box>
      </DashboardPanel>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 5fr) minmax(0, 7fr)'}, gap: 1.2, alignItems: 'start'}}>
        <DashboardPanel
          title="Due Date Outlook"
          subtitle="Timing pressure across the current filtered dataset, separated from lifecycle status behavior."
          actions={
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap'}}>
              {(['High', 'Medium', 'Low'] as ActionTrackerPriority[]).map((priority) => (
                <Chip key={priority} size="small" label={priority} sx={{borderRadius: '999px', bgcolor: priorityTone[priority].bg, color: priorityTone[priority].color, border: `1px solid ${priorityTone[priority].border}`, fontWeight: 500}} />
              ))}
            </Box>
          }
        >
          <DashboardChartSurface label="Due date buckets" detail="Click a priority segment to open the related actions in that timing bucket." height={dueDateOutlookChartHeight}>
            {dueDateOutlookRows.some((row) => row.total > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dueDateOutlookRows} layout="vertical" margin={{top: 8, right: 18, left: 18, bottom: 0}}>
                  <CartesianGrid stroke={chartGridColor} strokeDasharray="4 4" horizontal={false} />
                  <XAxis type="number" tick={{fontSize: 11, fill: chartAxisColor}} />
                  <YAxis type="category" dataKey="bucket" width={108} tick={{fontSize: 11, fill: chartAxisColor}} />
                  <RechartsTooltip content={<DashboardChartTooltip />} />
                  <Legend wrapperStyle={{fontSize: 11}} />
                  {(['High', 'Medium', 'Low'] as ActionTrackerPriority[]).map((priority) => (
                    <Bar
                      key={priority}
                      dataKey={priority}
                      name={priority}
                      stackId="dueDateOutlook"
                      fill={priorityPalette[priority]}
                      radius={priority === 'Low' ? [0, 6, 6, 0] : [0, 0, 0, 0]}
                      onClick={(data: any) => {
                        const bucket = String(data?.bucket ?? '') as DueDateBucketKey;
                        const bucketRow = dueDateOutlookRows.find((row) => row.bucket === bucket);
                        if (!bucketRow) return;
                        openDrilldown(`${bucket} · ${priority}`, 'Active action records contributing to this due date pressure segment.', bucketRow.rows.filter((row) => row.priority === priority).map((row) => ({row, reason: bucket})));
                      }}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{display: 'grid', placeItems: 'center', height: '100%'}}>
                <Typography sx={{fontSize: '0.875rem', color: tokenText.secondary}}>No active due-date pressure matches the current scope.</Typography>
              </Box>
            )}
          </DashboardChartSurface>
        </DashboardPanel>

        <DashboardPanel
          title="Asset Tree Performance & Hotspots"
          subtitle={`Current scope resolves to ${assetScope.label} so the next operational drill path stays explicit.`}
          actions={
            <>
              <Box sx={{display: 'inline-flex', p: 0.25, borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: 'background.paper'}}>
                {(['graph', 'table', 'trend'] as AssetViewMode[]).map((mode) => (
                  <Button key={mode} size="small" onClick={() => setAssetViewMode(mode)} sx={{minWidth: 0, px: 1, height: 24, borderRadius: '6px', textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', color: assetViewMode === mode ? tokenBrand.contrast : tokenText.secondary, bgcolor: assetViewMode === mode ? tokenBrand.main : 'transparent'}}>
                    {mode === 'graph' ? 'Graph View' : mode === 'table' ? 'Table View' : 'Trend View'}
                  </Button>
                ))}
              </Box>
              <Button size="small" variant="outlined" onClick={drillAssetUp} disabled={!hierarchyBreadcrumbs.length} sx={toolbarButtonSx}>Go Up</Button>
            </>
          }
        >
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 1}}>
            <Chip size="small" label="All Authorized Scope" sx={sectionChipSx} />
            {hierarchyBreadcrumbs.map((item) => (
              <Box key={item.key} sx={{display: 'flex', alignItems: 'center', gap: 0.3}}>
                <KeyboardArrowRightIcon sx={{fontSize: 16, color: tokenText.secondary}} />
                <Chip size="small" label={`${item.label}: ${item.value}`} sx={{borderRadius: '999px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontWeight: 500}} />
              </Box>
            ))}
          </Box>

          {assetViewMode === 'graph' ? (
            <DashboardChartSurface
              label={`${assetScope.label} hotspots`}
              detail="Use the metric selector to focus the chart on volume, resolution time, or closure performance."
              height={assetChartHeight}
              action={(
                <Box sx={{display: 'inline-flex', p: 0.25, borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: 'background.paper'}}>
                  {([
                    {key: 'totalActions', label: 'Total Actions'},
                    {key: 'averageResolutionDays', label: 'Avg. Resolution Time'},
                    {key: 'closureRate', label: 'Closure %'},
                  ] as Array<{key: AssetGraphMetric; label: string}>).map((item) => (
                    <Button key={item.key} size="small" onClick={() => setAssetGraphMetric(item.key)} sx={{minWidth: 0, px: 1, height: 24, borderRadius: '6px', textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', color: assetGraphMetric === item.key ? tokenBrand.contrast : tokenText.secondary, bgcolor: assetGraphMetric === item.key ? tokenBrand.main : 'transparent'}}>
                      {item.label}
                    </Button>
                  ))}
                </Box>
              )}
            >
              {assetGraphRows.length ? (
                <Box sx={{display: 'grid', gap: 0.8, height: '100%'}}>
                  {assetGraphRows.length === 1 ? (
                    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))'}, gap: 0.65}}>
                      <Paper elevation={0} sx={{p: 1, borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: 'background.paper'}}>
                        <Typography sx={{fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 700, textTransform: 'uppercase'}}>Asset Element</Typography>
                        <Typography sx={{mt: 0.25, fontSize: '0.875rem', color: tokenText.primary, fontWeight: 700}}>{assetGraphRows[0].element}</Typography>
                      </Paper>
                      <Paper elevation={0} sx={{p: 1, borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: 'background.paper'}}>
                        <Typography sx={{fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 700, textTransform: 'uppercase'}}>{assetGraphMetric === 'closureRate' ? 'Closure %' : assetGraphMetric === 'averageResolutionDays' ? 'Avg. Resolution Time' : 'Total Actions'}</Typography>
                        <Typography sx={{mt: 0.25, fontSize: '0.875rem', color: tokenText.primary, fontWeight: 700}}>
                          {assetGraphMetric === 'closureRate' ? formatPercent(assetGraphRows[0].closureRate) : assetGraphMetric === 'averageResolutionDays' ? `${formatDuration(assetGraphRows[0].averageResolutionDays)} days` : formatInteger(assetGraphRows[0].totalActions)}
                        </Typography>
                      </Paper>
                      <Paper elevation={0} sx={{p: 1, borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: 'background.paper'}}>
                        <Typography sx={{fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 700, textTransform: 'uppercase'}}>Drill-down</Typography>
                        <Button size="small" variant="outlined" onClick={() => drillAssetDown(assetGraphRows[0].element)} sx={{...toolbarButtonSx, mt: 0.5}}>Open Next Level</Button>
                      </Paper>
                    </Box>
                  ) : null}
                  <Box sx={{flex: 1, minHeight: 0}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={assetGraphRows.slice(0, 8)} layout="vertical" margin={{top: 8, right: 24, left: 20, bottom: 0}}>
                        <CartesianGrid stroke={chartGridColor} strokeDasharray="4 4" />
                        <XAxis type="number" tick={{fontSize: 11, fill: chartAxisColor}} />
                        <YAxis type="category" dataKey="element" width={118} tick={{fontSize: 11, fill: chartAxisColor}} />
                        <RechartsTooltip content={<DashboardChartTooltip />} />
                        <Legend wrapperStyle={{fontSize: 11}} />
                        <Bar
                          dataKey="graphValue"
                          name={assetGraphMetric === 'closureRate' ? 'Closure %' : assetGraphMetric === 'averageResolutionDays' ? 'Avg. Resolution Time' : 'Total Actions'}
                          fill={assetGraphMetric === 'closureRate' ? tokenSuccess.darker : assetGraphMetric === 'averageResolutionDays' ? tokenInfo.main : tokenBrand.main}
                          radius={[0, 6, 6, 0]}
                          onClick={(data: any) => drillAssetDown(String(data?.element ?? ''))}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              ) : (
                <Box sx={{display: 'grid', placeItems: 'center', height: '100%'}}>
                  <Typography sx={{fontSize: '0.875rem', color: tokenText.secondary}}>No asset data matches the current scope.</Typography>
                </Box>
              )}
            </DashboardChartSurface>
          ) : null}

          {assetViewMode === 'table' ? (
            <Box sx={{display: 'grid', gap: 0.8}}>
              <DashboardDataTable
                columns={['Asset Element', 'Total Actions', 'Open', 'Overdue', 'Completed', 'Avg. Resolution Time', 'Closure %']}
                rows={assetRows.map((row) => ({
                  'Asset Element': row.element,
                  'Total Actions': row.totalActions,
                  Open: row.openActions,
                  Overdue: row.overdueActions,
                  Completed: row.completedActions,
                  'Avg. Resolution Time': `${formatDuration(row.averageResolutionDays)} days`,
                  'Closure %': formatPercent(row.closureRate),
                }))}
              />
            </Box>
          ) : null}

          {assetViewMode === 'trend' ? (
            <DashboardChartSurface
              label={`${assetScope.label} trend`}
              detail="Evaluate how action volume, average resolution time, or closure rate changed over time for the current asset scope."
              height={assetChartHeight}
              action={(
                <Box sx={{display: 'inline-flex', p: 0.25, borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: 'background.paper'}}>
                  {([
                    {key: 'totalActions', label: 'Number of Actions'},
                    {key: 'averageResolutionDays', label: 'Avg. Resolution Time'},
                    {key: 'closureRate', label: 'Closure %'},
                  ] as Array<{key: AssetTrendMetric; label: string}>).map((item) => (
                    <Button key={item.key} size="small" onClick={() => setAssetTrendMetric(item.key)} sx={{minWidth: 0, px: 1, height: 24, borderRadius: '6px', textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', color: assetTrendMetric === item.key ? tokenBrand.contrast : tokenText.secondary, bgcolor: assetTrendMetric === item.key ? tokenBrand.main : 'transparent'}}>
                      {item.label}
                    </Button>
                  ))}
                </Box>
              )}
            >
              {assetRows.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={assetTrendSeries} margin={{top: 8, right: 24, left: 0, bottom: 20}}>
                    <CartesianGrid stroke={chartGridColor} strokeDasharray="4 4" />
                    <XAxis dataKey="Period" tick={{fontSize: 11, fill: chartAxisColor}} />
                    <YAxis tick={{fontSize: 11, fill: chartAxisColor}} />
                    <RechartsTooltip content={<DashboardChartTooltip />} />
                    <Legend verticalAlign="bottom" wrapperStyle={{fontSize: 11}} />
                    {assetRows.slice(0, 4).map((row, index) => (
                      <Line key={row.key} type="monotone" dataKey={row.element} stroke={[tokenBrand.main, tokenSuccess.darker, tokenWarning.main, tokenInfo.main][index % 4]} strokeWidth={2.6} dot={{r: 2.8, strokeWidth: 2, fill: tokenCommon.white}} activeDot={{r: 5}} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{display: 'grid', placeItems: 'center', height: '100%'}}>
                  <Typography sx={{fontSize: '0.875rem', color: tokenText.secondary}}>No asset data matches the current scope.</Typography>
                </Box>
              )}
            </DashboardChartSurface>
          ) : null}
        </DashboardPanel>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 7fr) minmax(320px, 5fr)'}, gap: 1.2, alignItems: 'start'}}>
        <DashboardPanel title="Cumulative Status Trend Over Time" subtitle="Lifecycle statuses accumulate from the start of the selected period so managers can see whether flow is improving or piling up.">
          <DashboardChartSurface label="Status accumulation" detail="Use the legend chips to toggle statuses, or open a status record list below." height={statusChartHeight}>
            {currentRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={statusTrendRows} margin={{top: 8, right: 22, left: 0, bottom: 20}}>
                  <CartesianGrid stroke={chartGridColor} strokeDasharray="4 4" />
                  <XAxis dataKey="Period" tick={{fontSize: 11, fill: chartAxisColor}} />
                  <YAxis tick={{fontSize: 11, fill: chartAxisColor}} />
                  <RechartsTooltip content={<DashboardChartTooltip />} />
                  <Legend verticalAlign="bottom" wrapperStyle={{fontSize: 11}} />
                  {visibleStatusRows.map((status) => (
                    <Line key={status} type="monotone" dataKey={status} stroke={statusPalette[status]} strokeWidth={2.5} dot={false} activeDot={{r: 5}} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{display: 'grid', placeItems: 'center', height: '100%'}}>
                <Typography sx={{fontSize: '0.875rem', color: tokenText.secondary}}>No lifecycle activity in the selected period.</Typography>
              </Box>
            )}
          </DashboardChartSurface>

          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap', mt: 1}}>
            {statusOrder.map((status) => {
              const hidden = hiddenStatus.includes(status);
              const count = currentRows.filter((row) => row.visibleStatus === status).length;
              return (
                <Button
                  key={status}
                  size="small"
                  onClick={() => setHiddenStatus((current) => current.includes(status) ? current.filter((item) => item !== status) : [...current, status])}
                  onDoubleClick={() => openDrilldown(`${status} Actions`, 'Action records behind this lifecycle status.', currentRows.filter((row) => row.visibleStatus === status).map((row) => ({row, reason: status === 'Overdue' ? `Overdue by ${Math.max(1, Math.round((now - row.dueAt) / dayMs))} days` : status})))}
                  sx={{borderRadius: '999px', textTransform: 'none', fontWeight: 500, color: hidden ? tokenText.secondary : statusTone[status].main, border: `1px solid ${hidden ? tokenDivider : statusTone[status].border}`, bgcolor: hidden ? 'background.paper' : statusTone[status].bg}}
                >
                  {status} ({count})
                </Button>
              );
            })}
          </Box>
        </DashboardPanel>

        <DashboardPanel title="Process Health" subtitle="Workflow friction indicators such as due date instability, ownership churn, rework, and approval delay.">
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr', gap: 0.75}}>
            {processHealthCards.map((metric) => (
              <Paper key={metric.label} elevation={0} onClick={metric.onClick} sx={{p: 1.25, borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: 'background.paper', backgroundImage: 'none', cursor: 'pointer', boxShadow: 'none', '&:hover': {borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg}}}>
                <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.8}}>
                  <Typography sx={{fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 700, textTransform: 'uppercase'}}>{metric.label}</Typography>
                  <Box sx={{width: 9, height: 9, borderRadius: '50%', bgcolor: metric.tone, flexShrink: 0, mt: 0.4}} />
                </Box>
                <Typography sx={{mt: 0.5, fontSize: '1.25rem', color: tokenText.primary, fontWeight: 700, lineHeight: 1}}>{metric.value}</Typography>
                <Typography sx={{mt: 0.5, fontSize: '0.75rem', color: tokenText.primary, fontWeight: 500}}>{metric.helper}</Typography>
                <Typography sx={{mt: 0.25, fontSize: '0.75rem', color: tokenText.secondary, lineHeight: 1.3}}>{metric.detail}</Typography>
              </Paper>
            ))}
          </Box>
        </DashboardPanel>
      </Box>

      <DashboardPanel
        title="Actions by Assignee"
        subtitle="Use workload and timing pressure together to spot overloaded owners or follow-up bottlenecks."
        actions={
          <Box sx={{display: 'inline-flex', p: 0.25, borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: 'background.paper'}}>
            {(['chart', 'table'] as SimpleViewMode[]).map((mode) => (
              <Button key={mode} size="small" onClick={() => setAssigneeViewMode(mode)} sx={{minWidth: 0, px: 1, height: 24, borderRadius: '6px', textTransform: 'none', fontWeight: 500, fontSize: '0.75rem', color: assigneeViewMode === mode ? tokenBrand.contrast : tokenText.secondary, bgcolor: assigneeViewMode === mode ? tokenBrand.main : 'transparent'}}>
                {mode === 'chart' ? 'Chart View' : 'Table View'}
              </Button>
            ))}
          </Box>
        }
      >
        {assigneeViewMode === 'chart' ? (
          <DashboardChartSurface label="Workload by assignee" detail="Click an assignee bar to open the related action records." height={assigneeChartHeight}>
            {assigneeRows.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assigneeRows.slice(0, 10)} layout="vertical" margin={{top: 8, right: 18, left: 30, bottom: 0}}>
                  <CartesianGrid stroke={chartGridColor} strokeDasharray="4 4" />
                  <XAxis type="number" tick={{fontSize: 11, fill: chartAxisColor}} />
                  <YAxis type="category" dataKey="assignee" width={118} tick={{fontSize: 11, fill: chartAxisColor}} />
                  <RechartsTooltip content={<DashboardChartTooltip />} />
                  <Legend wrapperStyle={{fontSize: 11}} />
                  <Bar dataKey="activeActions" name="Active Actions" fill={tokenBrand.main} radius={[0, 6, 6, 0]} onClick={(data: any) => {
                    const assignee = String(data?.assignee ?? '');
                    const clicked = assigneeRows.find((row) => row.assignee === assignee);
                    if (clicked) openDrilldown(`${clicked.assignee}`, 'All action records owned by this assignee in the current scope.', clicked.rows.map((row) => ({row})));
                  }} />
                  <Bar dataKey="dueThisWeekActions" name="Due This Week" fill={tokenWarning.main} radius={[0, 6, 6, 0]} />
                  <Bar dataKey="overdueActions" name="Overdue" fill={tokenError.main} radius={[0, 6, 6, 0]} />
                  <Bar dataKey="pendingApprovalActions" name="Pending Approval" fill={tokenInfo.main} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{display: 'grid', placeItems: 'center', height: '100%'}}>
                <Typography sx={{fontSize: '0.875rem', color: tokenText.secondary}}>No assignee workload matches the current filters.</Typography>
              </Box>
            )}
          </DashboardChartSurface>
        ) : (
          <DashboardDataTable
            columns={['Assignee', 'Active Actions', 'Due This Week', 'Overdue', 'Pending Approval', 'Closure %', 'Avg. Resolution Time']}
            rows={assigneeRows.map((row) => ({
              Assignee: row.assignee,
              'Active Actions': row.activeActions,
              'Due This Week': row.dueThisWeekActions,
              Overdue: row.overdueActions,
              'Pending Approval': row.pendingApprovalActions,
              'Closure %': formatPercent(row.closureRate),
              'Avg. Resolution Time': `${formatDuration(row.averageResolutionDays)} days`,
            }))}
          />
        )}
      </DashboardPanel>

      <Dialog open={Boolean(drilldown)} onClose={() => setDrilldown(null)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{fontWeight: 700, color: tokenText.primary}}>{drilldown?.title}</DialogTitle>
        <DialogContent dividers sx={{display: 'grid', gap: 0.9}}>
          {drilldown ? <Typography sx={{fontSize: '0.875rem', color: tokenText.secondary}}>{drilldown.subtitle}</Typography> : null}
          {drilldown?.items.length ? (
            <Box sx={{display: 'grid', gap: 0.8}}>
              {drilldown.items.map(({row, reason}) => (
                <Paper key={`${row.id}-${reason ?? 'record'}`} elevation={0} sx={{p: 1.25, borderRadius: '8px', border: `1px solid ${softBorder}`, bgcolor: 'background.paper'}}>
                  <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(90px, 0.7fr) minmax(220px, 1.7fr) minmax(140px, 1fr) minmax(110px, 0.9fr) minmax(90px, 0.7fr) minmax(120px, 0.9fr) minmax(170px, 1.2fr) auto', gap: 1, alignItems: 'center'}}>
                    <Typography sx={{fontSize: '0.75rem', color: tokenBrand.main, fontWeight: 700}}>{row.id}</Typography>
                    <Typography sx={{fontSize: '0.875rem', color: tokenText.primary, fontWeight: 500}}>{row.title}</Typography>
                    <Typography sx={{fontSize: '0.75rem', color: tokenText.primary, fontWeight: 400}}>{row.assignedTo}</Typography>
                    <Typography sx={{fontSize: '0.75rem', color: tokenText.primary, fontWeight: 500}}>{row.dueDate}</Typography>
                    <Typography sx={{fontSize: '0.75rem', color: priorityTone[row.priority].color, fontWeight: 700}}>{row.priority}</Typography>
                    <Chip size="small" label={row.visibleStatus} sx={{width: 'fit-content', bgcolor: statusTone[row.visibleStatus].bg, color: statusTone[row.visibleStatus].main, border: `1px solid ${statusTone[row.visibleStatus].border}`, fontWeight: 500}} />
                    <Typography sx={{fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 400}}>{reason || 'In current scope'}</Typography>
                    <Button size="small" variant="outlined" onClick={() => openActionTrackerDetails(row)} sx={toolbarButtonSx}>Open Detail</Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography sx={{fontSize: '0.875rem', color: tokenText.secondary}}>No action records are available for this selection.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDrilldown(null)} sx={{textTransform: 'none', fontWeight: 500, color: tokenBrand.main}}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
