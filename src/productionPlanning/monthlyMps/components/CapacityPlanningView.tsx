import {
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  InfoOutlined as InfoOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {Fragment, useMemo, useState} from 'react';
import {planningTokens} from '../../ui/planningTheme';
import type {MpsPlan} from '../types';

type ViewMode = 'day' | 'week';

type CapacityColumnGroupId =
  | 'resourceWorkCenter'
  | 'uom'
  | 'dayBeforeStart'
  | 'currentPeriod'
  | 'subtotal'
  | 'future'
  | 'totalPeriodFuture';

export type CapacityLeafColumn = {
  id: string;
  label: string;
  subLabel?: string;
  width: number;
  align: 'left' | 'center' | 'right';
  groupId: CapacityColumnGroupId;
};

// June 2025: day 1 = Sunday. Array index 0 = Jun 1, index 29 = Jun 30.
const JUNE_WEEKDAYS = [
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
  'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat',
  'Sun', 'Mon',
];

const COL_RESOURCE: CapacityLeafColumn = {id: 'resourceWorkCenter', label: 'Resource / Work Center', width: 190, align: 'left', groupId: 'resourceWorkCenter'};
const COL_UOM: CapacityLeafColumn = {id: 'uom', label: 'UOM', width: 52, align: 'center', groupId: 'uom'};
const COL_DAY_BEFORE: CapacityLeafColumn = {id: 'dayBeforeStart', label: '31/May', width: 68, align: 'center', groupId: 'dayBeforeStart'};
const COL_SUBTOTAL: CapacityLeafColumn = {id: 'subtotalJun2025', label: 'Jun/2025', width: 72, align: 'center', groupId: 'subtotal'};
const COL_FUT_JUL: CapacityLeafColumn = {id: 'futureJul2025', label: 'Jul/2025', width: 72, align: 'center', groupId: 'future'};
const COL_FUT_AUG: CapacityLeafColumn = {id: 'futureAug2025', label: 'Aug/2025', width: 72, align: 'center', groupId: 'future'};
const COL_FUT_SEP: CapacityLeafColumn = {id: 'futureSep2025', label: 'Sep/2025', width: 72, align: 'center', groupId: 'future'};
const COL_TOTAL: CapacityLeafColumn = {id: 'totalPeriodFuture', label: 'Total (Period + Future)', width: 90, align: 'center', groupId: 'totalPeriodFuture'};

// --- Exported column utilities ---

export function buildCapacityLeafColumns(viewMode: ViewMode): CapacityLeafColumn[] {
  if (viewMode === 'day') {
    const dayCols: CapacityLeafColumn[] = Array.from({length: 30}, (_, i) => ({
      id: `day${String(i + 1).padStart(2, '0')}`,
      label: String(i + 1).padStart(2, '0'),
      subLabel: JUNE_WEEKDAYS[i],
      width: 52,
      align: 'center' as const,
      groupId: 'currentPeriod' as const,
    }));
    return [COL_RESOURCE, COL_UOM, COL_DAY_BEFORE, ...dayCols, COL_SUBTOTAL, COL_FUT_JUL, COL_FUT_AUG, COL_FUT_SEP, COL_TOTAL];
  }
  const weekCols: CapacityLeafColumn[] = [
    {id: 'wk1', label: 'Wk 1', subLabel: '01-07 Jun', width: 120, align: 'center', groupId: 'currentPeriod'},
    {id: 'wk2', label: 'Wk 2', subLabel: '08-14 Jun', width: 120, align: 'center', groupId: 'currentPeriod'},
    {id: 'wk3', label: 'Wk 3', subLabel: '15-21 Jun', width: 120, align: 'center', groupId: 'currentPeriod'},
    {id: 'wk4', label: 'Wk 4', subLabel: '22-30 Jun', width: 120, align: 'center', groupId: 'currentPeriod'},
  ];
  return [
    COL_RESOURCE, COL_UOM, COL_DAY_BEFORE,
    ...weekCols,
    {...COL_SUBTOTAL, width: 80},
    {...COL_FUT_JUL, width: 80},
    {...COL_FUT_AUG, width: 80},
    {...COL_FUT_SEP, width: 80},
    {...COL_TOTAL, width: 100},
  ];
}

export function buildCapacityGridTemplate(columns: CapacityLeafColumn[]): string {
  return columns.map((col) => `${col.width}px`).join(' ');
}

export function getCapacityGridWidth(columns: CapacityLeafColumn[]): number {
  return columns.reduce((sum, col) => sum + col.width, 0);
}

export function getCapacityGroupSpans(timeColumnCount: number) {
  return [
    {id: 'resourceWorkCenter', label: 'Resource / Work Center', span: 1},
    {id: 'uom', label: 'UOM', span: 1},
    {id: 'dayBeforeStart', label: 'Day Before Start', span: 1},
    {id: 'currentPeriod', label: 'June/2025 (Daily)', span: timeColumnCount},
    {id: 'subtotal', label: 'Subtotal', span: 1},
    {id: 'future', label: 'Future (Monthly)', span: 3},
    {id: 'totalPeriodFuture', label: 'Total (Period + Future)', span: 1},
  ];
}

export function getCapacityLeafColumnIds(viewMode: ViewMode): string[] {
  return buildCapacityLeafColumns(viewMode).map((col) => col.id);
}

// --- Dev assertion ---

function assertCapacityCellCount(context: string, expected: number, actual: number) {
  if (import.meta.env.DEV && expected !== actual) {
    throw new Error(`Capacity matrix cell mismatch in ${context}: expected ${expected}, got ${actual}.`);
  }
}

// --- Mock data ---

// June 2025 non-working days: weekends (Jun 1=Sun, Jun 7=Sat, etc.)
const JUNE_NON_WORKING = new Set([1, 7, 8, 14, 15, 21, 22, 28, 29]);

// Week day ranges (0-based indices into 30-day June array)
const WEEK_RANGES: [[number, number], [number, number], [number, number], [number, number]] = [
  [0, 6],   // wk1: Jun 1-7
  [7, 13],  // wk2: Jun 8-14
  [14, 20], // wk3: Jun 15-21
  [21, 29], // wk4: Jun 22-30
];

type WorkCenterRaw = {
  id: string;
  name: string;
  uom: string;
  availPerDay: number;
  workloadByDay: number[];  // 30 entries; index 0 = Jun 1
  futureWorkload: [number, number, number];
  futureAvail: [number, number, number];
};

const WORK_CENTER_DATA: WorkCenterRaw[] = [
  {
    id: 'WC-100',
    name: 'Mixing Line 1',
    uom: 'h',
    availPerDay: 32,
    workloadByDay: [
      0,    24.0, 26.0, 25.0, 23.0, 24.5, 0,
      0,    26.5, 23.0, 27.0, 24.0, 22.0, 0,
      0,    21.0, 16.0, 18.0, 19.0, 17.0, 0,
      0,    20.0, 18.0, 17.0, 16.0, 16.0, 0,
      0,    16.0,
    ],
    futureWorkload: [685, 680, 660],
    futureAvail: [992, 960, 960],
  },
  {
    id: 'WC-200',
    name: 'Filling Line 2',
    uom: 'h',
    availPerDay: 24,
    workloadByDay: [
      0,    18.0, 17.0, 16.0, 17.0, 18.0, 0,
      0,    17.0, 0,    17.0, 17.0, 16.0, 0,
      0,    16.0, 17.0, 17.0, 17.0, 16.0, 0,
      0,    13.0, 14.0, 13.0, 14.0, 12.0, 0,
      0,    13.0,
    ],
    futureWorkload: [480, 450, 460],
    futureAvail: [744, 744, 720],
  },
  {
    id: 'WC-300',
    name: 'Packaging Line 3',
    uom: 'h',
    availPerDay: 16,
    workloadByDay: [
      0,    14.0, 14.0, 14.0, 14.0, 13.0, 0,
      0,    14.0, 14.0, 15.0, 13.0, 13.0, 0,
      0,    0,    14.0, 14.0, 13.0, 13.0, 0,
      0,    14.0, 13.0, 13.0, 13.0, 14.0, 0,
      0,    14.0,
    ],
    futureWorkload: [360, 380, 390],
    futureAvail: [496, 496, 480],
  },
];

// --- Computed data types ---

type DayComputedData = {
  workload: number;
  available: number;
  effective: number;
  gap: number;
  utilization: number;
  nonWorking: boolean;
};

type WeekComputedData = {
  workload: number;
  available: number;
  effective: number;
  gap: number;
  utilization: number;
  nonWorking: boolean;
};

// --- Helper functions ---

function computeDailyData(raw: WorkCenterRaw, oeeRate: number): DayComputedData[] {
  return raw.workloadByDay.map((workload, i) => {
    const day = i + 1;
    const nonWorking = JUNE_NON_WORKING.has(day);
    const available = raw.availPerDay;
    const effective = available * (oeeRate / 100);
    const gap = nonWorking ? 0 : effective - workload;
    const utilization = (!nonWorking && effective > 0) ? (workload / effective) * 100 : 0;
    return {workload, available, effective, gap, utilization, nonWorking};
  });
}

function computeWeeklyData(daily: DayComputedData[]): WeekComputedData[] {
  return WEEK_RANGES.map(([start, end]) => {
    const slice = daily.slice(start, end + 1);
    const workload = slice.reduce((s, d) => s + d.workload, 0);
    const available = slice.reduce((s, d) => s + d.available, 0);
    const effective = slice.reduce((s, d) => s + d.effective, 0);
    const gap = effective - workload;
    const utilization = effective > 0 ? (workload / effective) * 100 : 0;
    const nonWorking = workload === 0;
    return {workload, available, effective, gap, utilization, nonWorking};
  });
}

function fmtH(v: number): string {
  return v.toFixed(1);
}

function fmtPct(v: number): string {
  if (v === 0) return '0%';
  return `${Math.round(v)}%`;
}

type DotStatus = 'ok' | 'attention' | 'overload' | 'nonWorking';

function getDotStatus(utilization: number, nonWorking: boolean): DotStatus {
  if (nonWorking) return 'nonWorking';
  if (utilization > 95) return 'overload';
  if (utilization >= 80) return 'attention';
  return 'ok';
}

const DOT_COLORS: Record<DotStatus, string> = {
  ok: planningTokens.success,
  attention: planningTokens.warning,
  overload: planningTokens.danger,
  nonWorking: '#94A3B8',
};

function gapColor(gap: number, nonWorking: boolean): string {
  if (nonWorking) return planningTokens.textSecondary;
  if (gap < 0) return planningTokens.danger;
  return planningTokens.textPrimary;
}

function utilizationColor(pct: number, nonWorking: boolean): string {
  if (nonWorking) return planningTokens.textSecondary;
  if (pct > 95) return planningTokens.danger;
  if (pct >= 80) return planningTokens.warning;
  return planningTokens.success;
}

// --- Main component ---

type Props = {
  viewMode: ViewMode;
  plan: MpsPlan;
};

export default function CapacityPlanningView({viewMode}: Props) {
  const [oeeRate, setOeeRate] = useState(85);
  const [oeeInput, setOeeInput] = useState('85.00');
  const [editingOee, setEditingOee] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(WORK_CENTER_DATA.map((wc) => wc.id)),
  );
  const [showFrozenPeriod, setShowFrozenPeriod] = useState(true);
  const [showMaintenanceStops, setShowMaintenanceStops] = useState(true);
  const [showHighlights, setShowHighlights] = useState(true);

  const leafColumns = useMemo(() => buildCapacityLeafColumns(viewMode), [viewMode]);
  const gridTemplate = useMemo(() => buildCapacityGridTemplate(leafColumns), [leafColumns]);
  const gridWidth = useMemo(() => getCapacityGridWidth(leafColumns), [leafColumns]);
  const timeColumnCount = viewMode === 'day' ? 30 : 4;

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSaveOee = () => {
    const parsed = parseFloat(oeeInput.replace(',', '.'));
    if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 100) {
      setOeeRate(parsed);
      setOeeInput(parsed.toFixed(2));
    } else {
      setOeeInput(oeeRate.toFixed(2));
    }
    setEditingOee(false);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
          px: 1.5,
          py: 1.2,
          borderRadius: 3,
          border: '1px solid #E6ECF5',
          bgcolor: 'var(--planning-surface-muted)',
          gap: 1,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <InfoOutlinedIcon sx={{fontSize: 16, color: '#1f63ea'}} />
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>
            Review workload and capacity by resource. Based on Planned Quantity (MPS) from MPS View.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} flexShrink={0}>
          <Button
            size="small"
            variant="outlined"
            sx={miniActionSx}
            onClick={() => setExpandedGroups(new Set(WORK_CENTER_DATA.map((wc) => wc.id)))}
          >
            <ExpandLessIcon sx={{fontSize: 16}} />
            Expand All
          </Button>
          <Button
            size="small"
            variant="outlined"
            sx={miniActionSx}
            onClick={() => setExpandedGroups(new Set())}
          >
            <ExpandMoreIcon sx={{fontSize: 16}} />
            Collapse All
          </Button>
          <Tooltip title="Column settings">
            <IconButton size="small" sx={{border: '1px solid #D8E2F0', borderRadius: 2}}>
              <SettingsOutlinedIcon sx={{fontSize: 16, color: '#1769FF'}} />
            </IconButton>
          </Tooltip>
          <Button size="small" variant="outlined" sx={miniActionSx} endIcon={<KeyboardArrowDownIcon sx={{fontSize: 16}} />}>
            Export
          </Button>
        </Stack>
      </Box>

      <Stack direction={{xs: 'column', lg: 'row'}} spacing={2}>
        <Box sx={{flex: 1, minWidth: 0}}>
          <Box
            sx={{
              border: '1px solid #D8E2F0',
              borderRadius: 4,
              bgcolor: 'var(--planning-surface)',
              boxShadow: planningTokens.softShadow,
              overflow: 'hidden',
            }}
          >
            <Box sx={{overflowX: 'auto'}}>
              <Box sx={{minWidth: gridWidth}}>
                <CapacityMatrixHeader
                  leafColumns={leafColumns}
                  gridTemplate={gridTemplate}
                  timeColumnCount={timeColumnCount}
                  viewMode={viewMode}
                />
                {WORK_CENTER_DATA.map((wc) => (
                  <ResourceGroup
                    key={wc.id}
                    wc={wc}
                    oeeRate={oeeRate}
                    viewMode={viewMode}
                    leafColumns={leafColumns}
                    gridTemplate={gridTemplate}
                    expanded={expandedGroups.has(wc.id)}
                    onToggle={() => toggleGroup(wc.id)}
                  />
                ))}
              </Box>
            </Box>
            <Box sx={{px: 1.5, py: 1, borderTop: '1px solid #E6ECF5', bgcolor: '#FBFCFE'}}>
              <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>
                Workload = processing time based on BOM route and Planned Quantity (MPS). Effective Capacity = Available Capacity × OEE.
              </Typography>
            </Box>
          </Box>
        </Box>

        <CapacitySidebar
          oeeRate={oeeRate}
          oeeInput={oeeInput}
          editingOee={editingOee}
          onOeeInputChange={setOeeInput}
          onStartEditOee={() => { setOeeInput(oeeRate.toFixed(2)); setEditingOee(true); }}
          onSaveOee={handleSaveOee}
          showFrozenPeriod={showFrozenPeriod}
          onShowFrozenPeriod={setShowFrozenPeriod}
          showMaintenanceStops={showMaintenanceStops}
          onShowMaintenanceStops={setShowMaintenanceStops}
          showHighlights={showHighlights}
          onShowHighlights={setShowHighlights}
        />
      </Stack>
    </Box>
  );
}

// --- Header ---

function CapacityMatrixHeader({
  leafColumns,
  gridTemplate,
  timeColumnCount,
  viewMode,
}: {
  leafColumns: CapacityLeafColumn[];
  gridTemplate: string;
  timeColumnCount: number;
  viewMode: ViewMode;
}) {
  const groupSpans = getCapacityGroupSpans(timeColumnCount).map((group) => {
    if (group.id === 'currentPeriod') {
      return {...group, label: `June/2025 (${viewMode === 'day' ? 'Daily' : 'Weekly'})`};
    }
    return group;
  });

  const totalSpan = groupSpans.reduce((sum, g) => sum + g.span, 0);
  assertCapacityCellCount('header group spans', leafColumns.length, totalSpan);

  return (
    <Box sx={{borderBottom: '1px solid #E6ECF5', position: 'sticky', top: 0, zIndex: 1, bgcolor: 'var(--planning-surface)'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate}}>
        {groupSpans.map((group) => (
          <Box
            key={group.id}
            sx={{
              gridColumn: `span ${group.span}`,
              px: 0.75,
              py: 0.9,
              borderLeft: (group.id === 'subtotal' || group.id === 'future' || group.id === 'totalPeriodFuture') ? '2px solid #BFD5FF' : 'none',
              borderRight: '1px solid #E6ECF5',
              borderBottom: '1px solid #E6ECF5',
              textAlign: 'center',
              bgcolor: group.id === 'subtotal' || group.id === 'totalPeriodFuture' ? '#F5FAFF' : '#FFFFFF',
            }}
          >
            <Typography sx={{fontSize: 11, fontWeight: 800, color: (group.id === 'subtotal' || group.id === 'totalPeriodFuture') ? '#1f63ea' : '#1F2366'}}>
              {group.label}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate}}>
        {leafColumns.map((col) => (
          <Box
            key={col.id}
            sx={{
              px: 0.5,
              py: 0.75,
              borderLeft: (col.id === 'subtotalJun2025' || col.id === 'futureJul2025' || col.id === 'totalPeriodFuture') ? '2px solid #BFD5FF' : 'none',
              borderRight: '1px solid #EDF1F7',
              textAlign: 'center',
              bgcolor: (col.id === 'subtotalJun2025' || col.id === 'totalPeriodFuture') ? '#F5FAFF' : '#FFFFFF',
            }}
          >
            <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-primary)', lineHeight: 1.2}}>
              {col.label}
            </Typography>
            {col.subLabel ? (
              <Typography sx={{fontSize: 9.5, fontWeight: 600, color: 'var(--planning-text-muted)', mt: 0.1}}>
                {col.subLabel}
              </Typography>
            ) : null}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// --- Resource group ---

function ResourceGroup({
  wc,
  oeeRate,
  viewMode,
  leafColumns,
  gridTemplate,
  expanded,
  onToggle,
}: {
  wc: WorkCenterRaw;
  oeeRate: number;
  viewMode: ViewMode;
  leafColumns: CapacityLeafColumn[];
  gridTemplate: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const daily = useMemo(() => computeDailyData(wc, oeeRate), [wc, oeeRate]);
  const weekly = useMemo(() => computeWeeklyData(daily), [daily]);

  const timeData: DayComputedData[] | WeekComputedData[] = viewMode === 'day' ? daily : weekly;
  const timeCount = viewMode === 'day' ? 30 : 4;

  const subtotalWorkload = daily.reduce((s, d) => s + d.workload, 0);
  const subtotalAvail = wc.availPerDay * 30;
  const subtotalEffective = subtotalAvail * (oeeRate / 100);
  const subtotalGap = subtotalEffective - subtotalWorkload;
  const subtotalUtil = subtotalEffective > 0 ? (subtotalWorkload / subtotalEffective) * 100 : 0;

  const totWorkload = subtotalWorkload + wc.futureWorkload[0] + wc.futureWorkload[1] + wc.futureWorkload[2];
  const totAvail = subtotalAvail + wc.futureAvail[0] + wc.futureAvail[1] + wc.futureAvail[2];

  // Validate cell count: resourceWorkCenter + uom + dayBefore + time cols + subtotal + 3 future + total
  const expectedCells = 3 + timeCount + 1 + 3 + 1;
  assertCapacityCellCount(`ResourceGroup ${wc.id}`, leafColumns.length, expectedCells);

  return (
    <Box sx={{borderBottom: '1px solid #E6ECF5'}}>
      {/* Group header row — spans all columns */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: gridTemplate,
          cursor: 'pointer',
          bgcolor: '#F8FAFD',
          '&:hover': {bgcolor: '#F0F5FF'},
        }}
        onClick={onToggle}
      >
        <Box
          sx={{
            gridColumn: '1 / -1',
            display: 'flex',
            alignItems: 'center',
            px: 1.2,
            py: 0.9,
            gap: 0.75,
          }}
        >
          <Box sx={{color: '#1f63ea', display: 'flex', alignItems: 'center'}}>
            {expanded ? <ExpandLessIcon sx={{fontSize: 18}} /> : <ExpandMoreIcon sx={{fontSize: 18}} />}
          </Box>
          <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>{wc.id}</Typography>
          <Typography sx={{fontSize: 13, fontWeight: 600, color: 'var(--planning-text-secondary)'}}>{wc.name}</Typography>
          <Box sx={{ml: 'auto'}}>
            <Typography
              component="span"
              sx={{fontSize: 12, fontWeight: 700, color: '#1f63ea', textDecoration: 'underline', cursor: 'pointer'}}
              onClick={(e) => e.stopPropagation()}
            >
              View details
            </Typography>
          </Box>
        </Box>
      </Box>

      {expanded ? (
        <Fragment>
          <MetricRow
            label="Workload"
            uom={wc.uom}
            dayBefore="-"
            timeValues={timeData.map((d) => fmtH(d.workload))}
            timeColors={timeData.map((d) => (d.workload > 0 ? '#1f63ea' : planningTokens.textSecondary))}
            subtotalValue={fmtH(subtotalWorkload)}
            futureValues={wc.futureWorkload.map(fmtH)}
            totalValue={fmtH(totWorkload)}
            leafColumns={leafColumns}
            gridTemplate={gridTemplate}
          />
          <MetricRow
            label="Available Capacity"
            uom={wc.uom}
            dayBefore="-"
            timeValues={timeData.map((d) => fmtH(d.available))}
            timeColors={timeData.map(() => planningTokens.textPrimary)}
            subtotalValue={fmtH(subtotalAvail)}
            futureValues={wc.futureAvail.map(fmtH)}
            totalValue={fmtH(totAvail)}
            leafColumns={leafColumns}
            gridTemplate={gridTemplate}
          />
          <MetricRow
            label={`Effective Capacity (OEE ${Math.round(oeeRate)}%)`}
            uom={wc.uom}
            dayBefore="-"
            timeValues={timeData.map((d) => fmtH(d.effective))}
            timeColors={timeData.map(() => planningTokens.textPrimary)}
            subtotalValue={fmtH(subtotalEffective)}
            futureValues={wc.futureAvail.map((v) => fmtH(v * (oeeRate / 100)))}
            totalValue={fmtH(totAvail * (oeeRate / 100))}
            leafColumns={leafColumns}
            gridTemplate={gridTemplate}
          />
          <MetricRow
            label="Capacity Gap"
            uom={wc.uom}
            dayBefore="-"
            timeValues={timeData.map((d) => d.nonWorking ? '-' : fmtH(d.gap))}
            timeColors={timeData.map((d) => gapColor(d.gap, d.nonWorking))}
            subtotalValue={fmtH(subtotalGap)}
            subtotalColor={gapColor(subtotalGap, false)}
            futureValues={wc.futureAvail.map((v, i) => fmtH(v * (oeeRate / 100) - wc.futureWorkload[i]))}
            futureColors={wc.futureAvail.map((v, i) => gapColor(v * (oeeRate / 100) - wc.futureWorkload[i], false))}
            totalValue={fmtH(totAvail * (oeeRate / 100) - totWorkload)}
            totalColor={gapColor(totAvail * (oeeRate / 100) - totWorkload, false)}
            leafColumns={leafColumns}
            gridTemplate={gridTemplate}
          />
          <MetricRow
            label="Utilization %"
            uom="%"
            dayBefore="-"
            timeValues={timeData.map((d) => d.nonWorking ? '0%' : fmtPct(d.utilization))}
            timeColors={timeData.map((d) => utilizationColor(d.utilization, d.nonWorking))}
            subtotalValue={fmtPct(subtotalUtil)}
            subtotalColor={utilizationColor(subtotalUtil, false)}
            futureValues={wc.futureWorkload.map((w, i) => {
              const eff = wc.futureAvail[i] * (oeeRate / 100);
              return eff > 0 ? fmtPct((w / eff) * 100) : '0%';
            })}
            futureColors={wc.futureWorkload.map((w, i) => {
              const eff = wc.futureAvail[i] * (oeeRate / 100);
              return eff > 0 ? utilizationColor((w / eff) * 100, false) : planningTokens.textSecondary;
            })}
            totalValue={fmtPct((totWorkload / (totAvail * (oeeRate / 100))) * 100)}
            totalColor={utilizationColor((totWorkload / (totAvail * (oeeRate / 100))) * 100, false)}
            leafColumns={leafColumns}
            gridTemplate={gridTemplate}
          />
          <StatusDotRow
            label="Capacity Status"
            uom="%"
            dayBefore="-"
            timeStatuses={timeData.map((d) => getDotStatus(d.utilization, d.nonWorking))}
            subtotalStatus={getDotStatus(subtotalUtil, false)}
            futureStatuses={wc.futureWorkload.map((w, i) => {
              const eff = wc.futureAvail[i] * (oeeRate / 100);
              return getDotStatus(eff > 0 ? (w / eff) * 100 : 0, false);
            })}
            totalStatus={getDotStatus((totWorkload / (totAvail * (oeeRate / 100))) * 100, false)}
            leafColumns={leafColumns}
            gridTemplate={gridTemplate}
          />
        </Fragment>
      ) : null}
    </Box>
  );
}

// --- Metric row ---

function MetricRow({
  label,
  uom,
  dayBefore,
  timeValues,
  timeColors,
  subtotalValue,
  subtotalColor,
  futureValues,
  futureColors,
  totalValue,
  totalColor,
  leafColumns,
  gridTemplate,
}: {
  label: string;
  uom: string;
  dayBefore: string;
  timeValues: string[];
  timeColors: string[];
  subtotalValue: string;
  subtotalColor?: string;
  futureValues: string[];
  futureColors?: string[];
  totalValue: string;
  totalColor?: string;
  leafColumns: CapacityLeafColumn[];
  gridTemplate: string;
}) {
  const renderedCells = 3 + timeValues.length + 1 + 3 + 1;
  assertCapacityCellCount(`MetricRow "${label}"`, leafColumns.length, renderedCells);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        borderBottom: '1px solid #EDF1F7',
        '&:hover': {bgcolor: '#FAFCFF'},
      }}
    >
      {/* col 1: label */}
      <Box sx={{px: 1.2, py: 0.7, display: 'flex', alignItems: 'center'}}>
        <Typography sx={{fontSize: 12, fontWeight: 600, color: planningTokens.textSecondary}}>{label}</Typography>
      </Box>
      {/* col 2: uom */}
      <CellBox><Typography sx={metricCellSx}>{uom}</Typography></CellBox>
      {/* col 3: day before start */}
      <CellBox><Typography sx={{...metricCellSx, color: planningTokens.textSecondary}}>{dayBefore}</Typography></CellBox>
      {/* time period cells */}
      {timeValues.map((value, i) => (
        <CellBox key={i}>
          <Typography sx={{...metricCellSx, color: timeColors[i] ?? planningTokens.textPrimary}}>{value}</Typography>
        </CellBox>
      ))}
      {/* subtotal */}
      <CellBox separator>
        <Typography sx={{...metricCellSx, fontWeight: 700, color: subtotalColor ?? planningTokens.textPrimary}}>{subtotalValue}</Typography>
      </CellBox>
      {/* future months */}
      {futureValues.map((value, i) => (
        <CellBox key={`fut-${i}`} separator={i === 0}>
          <Typography sx={{...metricCellSx, color: futureColors?.[i] ?? planningTokens.textPrimary}}>{value}</Typography>
        </CellBox>
      ))}
      {/* total */}
      <CellBox separator>
        <Typography sx={{...metricCellSx, fontWeight: 700, color: totalColor ?? planningTokens.textPrimary}}>{totalValue}</Typography>
      </CellBox>
    </Box>
  );
}

// --- Status dot row ---

function StatusDotRow({
  label,
  uom,
  dayBefore,
  timeStatuses,
  subtotalStatus,
  futureStatuses,
  totalStatus,
  leafColumns,
  gridTemplate,
}: {
  label: string;
  uom: string;
  dayBefore: string;
  timeStatuses: DotStatus[];
  subtotalStatus: DotStatus;
  futureStatuses: DotStatus[];
  totalStatus: DotStatus;
  leafColumns: CapacityLeafColumn[];
  gridTemplate: string;
}) {
  const renderedCells = 3 + timeStatuses.length + 1 + 3 + 1;
  assertCapacityCellCount(`StatusDotRow "${label}"`, leafColumns.length, renderedCells);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        borderBottom: '1px solid #EDF1F7',
        '&:hover': {bgcolor: '#FAFCFF'},
      }}
    >
      <Box sx={{px: 1.2, py: 0.7, display: 'flex', alignItems: 'center'}}>
        <Typography sx={{fontSize: 12, fontWeight: 600, color: planningTokens.textSecondary}}>{label}</Typography>
      </Box>
      <CellBox><Typography sx={metricCellSx}>{uom}</Typography></CellBox>
      <CellBox><Typography sx={{...metricCellSx, color: planningTokens.textSecondary}}>{dayBefore}</Typography></CellBox>
      {timeStatuses.map((status, i) => (
        <CellBox key={i}>
          <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: DOT_COLORS[status], mx: 'auto'}} />
        </CellBox>
      ))}
      <CellBox separator>
        <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: DOT_COLORS[subtotalStatus], mx: 'auto'}} />
      </CellBox>
      {futureStatuses.map((status, i) => (
        <CellBox key={`fut-${i}`} separator={i === 0}>
          <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: DOT_COLORS[status], mx: 'auto'}} />
        </CellBox>
      ))}
      <CellBox separator>
        <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: DOT_COLORS[totalStatus], mx: 'auto'}} />
      </CellBox>
    </Box>
  );
}

// --- Shared cell wrapper ---

function CellBox({separator = false, children}: {separator?: boolean; children: React.ReactNode}) {
  return (
    <Box
      sx={{
        px: 0.5,
        py: 0.7,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderLeft: separator ? '2px solid #BFD5FF' : 'none',
        borderRight: '1px solid #EDF1F7',
      }}
    >
      {children}
    </Box>
  );
}

// --- Sidebar ---

function CapacitySidebar({
  oeeRate,
  oeeInput,
  editingOee,
  onOeeInputChange,
  onStartEditOee,
  onSaveOee,
  showFrozenPeriod,
  onShowFrozenPeriod,
  showMaintenanceStops,
  onShowMaintenanceStops,
  showHighlights,
  onShowHighlights,
}: {
  oeeRate: number;
  oeeInput: string;
  editingOee: boolean;
  onOeeInputChange: (v: string) => void;
  onStartEditOee: () => void;
  onSaveOee: () => void;
  showFrozenPeriod: boolean;
  onShowFrozenPeriod: (v: boolean) => void;
  showMaintenanceStops: boolean;
  onShowMaintenanceStops: (v: boolean) => void;
  showHighlights: boolean;
  onShowHighlights: (v: boolean) => void;
}) {
  return (
    <Box sx={{width: {xs: '100%', lg: 264}, flexShrink: 0}}>
      {/* Capacity Settings */}
      <Box sx={sidebarCardSx}>
        <Typography sx={sidebarTitleSx}>Capacity Settings</Typography>
        <Stack spacing={1.4}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Typography sx={settingLabelSx}>OEE Rate</Typography>
            {editingOee ? (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <TextField
                  size="small"
                  value={oeeInput}
                  onChange={(e) => onOeeInputChange(e.target.value)}
                  onBlur={onSaveOee}
                  onKeyDown={(e) => { if (e.key === 'Enter') onSaveOee(); if (e.key === 'Escape') onSaveOee(); }}
                  autoFocus
                  sx={{width: 80, '& .MuiInputBase-input': {fontSize: 13, py: 0.4, textAlign: 'right'}}}
                  inputProps={{inputMode: 'decimal'}}
                />
                <Typography sx={{fontSize: 13, color: planningTokens.textSecondary}}>%</Typography>
              </Stack>
            ) : (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.textPrimary}}>
                  {oeeRate.toFixed(2).replace('.', ',')}%
                </Typography>
                <IconButton size="small" onClick={onStartEditOee} sx={{p: 0.25}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill={planningTokens.primaryBlue}>
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm2.92-.92 9.06-9.06 1.08 1.08-9.06 9.06H5.92v-1.08zM20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.02 0-1.41z"/>
                  </svg>
                </IconButton>
              </Stack>
            )}
          </Box>
          <Box>
            <Typography sx={settingLabelSx}>Capacity Unit</Typography>
            <Typography sx={settingValueSx}>Hours (h)</Typography>
          </Box>
          <Box>
            <Typography sx={settingLabelSx}>Calendar</Typography>
            <Typography sx={settingValueSx}>Production Calendar</Typography>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Box>
              <Typography sx={settingLabelSx}>Maintenance &amp; Stops</Typography>
              <Typography sx={settingValueSx}>Shown in daily view</Typography>
            </Box>
            <VisibilityIcon sx={{fontSize: 18, color: planningTokens.textSecondary}} />
          </Box>
        </Stack>
      </Box>

      {/* Legend */}
      <Box sx={{...sidebarCardSx, mt: 2}}>
        <Typography sx={sidebarTitleSx}>Legend</Typography>
        <Stack spacing={1}>
          <LegendItem color={DOT_COLORS.ok} label="OK (< 80%)" />
          <LegendItem color={DOT_COLORS.attention} label="Attention (80% - 95%)" />
          <LegendItem color={DOT_COLORS.overload} label="Overload (> 95%)" />
          <LegendItem color={DOT_COLORS.nonWorking} label="Non working day" />
        </Stack>
      </Box>

      {/* Display Options */}
      <Box sx={{...sidebarCardSx, mt: 2}}>
        <Typography sx={sidebarTitleSx}>Display Options</Typography>
        <Stack spacing={1.2}>
          <FormControlLabel
            control={<Checkbox size="small" checked={showFrozenPeriod} onChange={(e) => onShowFrozenPeriod(e.target.checked)} />}
            label={<Typography sx={{fontSize: 13}}>Show Frozen Period</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={showMaintenanceStops} onChange={(e) => onShowMaintenanceStops(e.target.checked)} />}
            label={<Typography sx={{fontSize: 13}}>Show Maintenance / Stops</Typography>}
          />
          <FormControlLabel
            control={<Checkbox size="small" checked={showHighlights} onChange={(e) => onShowHighlights(e.target.checked)} />}
            label={<Typography sx={{fontSize: 13}}>Show Highlights</Typography>}
          />
          <Divider />
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 700}}>Highlight Rules</Typography>
          <Select size="small" value="utilization" sx={{fontSize: 13}}>
            <MenuItem value="utilization">Utilization %</MenuItem>
            <MenuItem value="gap">Capacity Gap</MenuItem>
          </Select>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 700}}>Display Unit</Typography>
          <Select size="small" value="hours" sx={{fontSize: 13}}>
            <MenuItem value="hours">Hours (h)</MenuItem>
            <MenuItem value="percent">Percentage (%)</MenuItem>
          </Select>
        </Stack>
      </Box>

      {/* Info note */}
      <Box sx={{...sidebarCardSx, mt: 2, bgcolor: 'var(--planning-surface-muted)', border: '1px solid #BFD5FF'}}>
        <Stack direction="row" spacing={0.75} alignItems="flex-start">
          <InfoOutlinedIcon sx={{fontSize: 16, color: '#1f63ea', mt: 0.2, flexShrink: 0}} />
          <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, lineHeight: 1.5}}>
            Capacity is calculated based on Planned Quantity (MPS) from MPS View.
          </Typography>
        </Stack>
      </Box>
    </Box>
  );
}

// --- Small helpers ---

function LegendItem({color, label}: {color: string; label: string}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0}} />
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
    </Stack>
  );
}

// --- Style constants ---

const miniActionSx = {
  textTransform: 'none',
  fontWeight: 700,
  borderRadius: 2,
  fontSize: 12,
  color: '#1f63ea',
  borderColor: '#D8E2F0',
  bgcolor: 'var(--planning-surface)',
  gap: 0.5,
} as const;

const sidebarCardSx = {
  border: '1px solid #D8E2F0',
  borderRadius: 4,
  bgcolor: 'var(--planning-surface)',
  boxShadow: planningTokens.softShadow,
  p: 2,
} as const;

const sidebarTitleSx = {
  fontSize: 14,
  fontWeight: 800,
  color: '#0F172A',
  mb: 1.5,
} as const;

const settingLabelSx = {
  fontSize: 11,
  fontWeight: 700,
  color: 'var(--planning-text-secondary)',
} as const;

const settingValueSx = {
  fontSize: 13,
  fontWeight: 700,
  color: planningTokens.textPrimary,
  mt: 0.25,
} as const;

const metricCellSx = {
  fontSize: 12,
  fontWeight: 600,
  color: planningTokens.textPrimary,
  textAlign: 'center' as const,
} as const;
