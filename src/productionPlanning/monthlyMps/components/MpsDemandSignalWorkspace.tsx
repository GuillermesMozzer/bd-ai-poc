import {
  AutoAwesome as AutoAwesomeIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircle as CheckCircleIcon,
  Edit as EditIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  InfoOutlined as InfoOutlinedIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Search as SearchIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  VisibilityOff as VisibilityOffIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {Fragment, type ReactNode, useMemo, useState} from 'react';
import CapacityPlanningView from './CapacityPlanningView';
import {planningTokens} from '../../ui/planningTheme';
import type {
  MpsAssistantFinalReadinessStatus,
  MpsBucketLine,
  MpsDemandLine,
  MpsException,
  MpsPlan,
  MpsPlanningFiltersState,
  MpsScenario,
  MrpReadiness,
  ProductPlanningRule,
  ProductionLine,
} from '../types';

type Props = {
  plan: MpsPlan;
  demandLines: MpsDemandLine[];
  bucketLines: MpsBucketLine[];
  planningRules: ProductPlanningRule[];
  productionLines: ProductionLine[];
  exceptions: MpsException[];
  mrpReadiness: MrpReadiness;
  selectedMonth: string;
  availableMonths: {value: string; label: string}[];
  onMonthChange: (month: string) => void;
  filters: MpsPlanningFiltersState;
  onChangeFilters: (patch: Partial<MpsPlanningFiltersState>) => void;
  selectedProductCode: string | null;
  onSelectProduct: (productCode: string | null) => void;
  scenarios: MpsScenario[];
  readinessStatus: MpsAssistantFinalReadinessStatus;
  canRelease: boolean;
  onOpenAssistant: () => void;
  onOpenRelease: () => void;
  onOpenCreateScenario: () => void;
  onOpenCompareScenario: () => void;
  onEditQuantity: (bucketId: string, quantity: number) => void;
  validationError: string | null;
};

type ViewMode = 'day' | 'week';

type ProductMatrixRow = {
  demandLine: MpsDemandLine;
  rule?: ProductPlanningRule;
  buckets: MpsBucketLine[];
  orderedQuantity: number;
  futureMonthlyDemand: number[];
  futureMonthlyMps: number[];
};

type DayCell = {
  key: string;
  label: string;
  weekday: string;
  bucketId: string;
  demand: number;
  ordered: number;
  planned: number;
  startingInventory: number;
  endingInventory: number;
  statusTone: 'ok' | 'low' | 'negative' | 'idle';
};

const MONTHLY_OFFSETS = [1, 2, 3] as const;
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_COLUMN_WIDTH = 160;
const DAY_COLUMN_WIDTH = 72;

type MatrixColumnGroupId =
  | 'product'
  | 'uom'
  | 'total'
  | 'dayBeforeStart'
  | 'currentPeriod'
  | 'totalPeriod'
  | 'future'
  | 'totalPeriodFuture';

export type MpsMatrixLeafColumn = {
  id: string;
  label: string;
  width: number;
  minWidth: number;
  align: 'left' | 'center' | 'right';
  groupId: MatrixColumnGroupId;
  editable?: boolean;
  frozen?: boolean;
  highlighted?: boolean;
  numeric?: boolean;
};

type MpsMatrixTimeColumn = {
  id: string;
  label: string;
  helper?: string;
};

const STATIC_MATRIX_COLUMNS = {
  productSku: {id: 'productSku', label: 'Product / SKU', width: 220, minWidth: 220, align: 'left', groupId: 'product'} satisfies MpsMatrixLeafColumn,
  uom: {id: 'uom', label: 'UOM', width: 70, minWidth: 70, align: 'center', groupId: 'uom'} satisfies MpsMatrixLeafColumn,
  total: {id: 'total', label: 'Total', width: 90, minWidth: 90, align: 'center', groupId: 'total', numeric: true} satisfies MpsMatrixLeafColumn,
  dayBeforeStart: {id: 'dayBeforeStart', label: 'Day Before Start', width: 120, minWidth: 120, align: 'center', groupId: 'dayBeforeStart', numeric: true} satisfies MpsMatrixLeafColumn,
  totalJuneRequiredDemand: {id: 'totalJuneRequiredDemand', label: 'Required Demand', width: 120, minWidth: 120, align: 'center', groupId: 'totalPeriod', highlighted: true, numeric: true} satisfies MpsMatrixLeafColumn,
  totalJuneDistributedMps: {id: 'totalJuneDistributedMps', label: 'Distributed (MPS)', width: 120, minWidth: 120, align: 'center', groupId: 'totalPeriod', highlighted: true, numeric: true} satisfies MpsMatrixLeafColumn,
  futureJul: {id: 'futureJul', label: 'Jul/2025', width: 120, minWidth: 120, align: 'center', groupId: 'future', numeric: true} satisfies MpsMatrixLeafColumn,
  futureAug: {id: 'futureAug', label: 'Aug/2025', width: 120, minWidth: 120, align: 'center', groupId: 'future', numeric: true} satisfies MpsMatrixLeafColumn,
  futureSep: {id: 'futureSep', label: 'Sep/2025', width: 120, minWidth: 120, align: 'center', groupId: 'future', numeric: true} satisfies MpsMatrixLeafColumn,
  totalPeriodFuture: {id: 'totalPeriodFuture', label: 'Total (Period + Future)', width: 140, minWidth: 140, align: 'center', groupId: 'totalPeriodFuture', numeric: true} satisfies MpsMatrixLeafColumn,
};

export function buildMpsMatrixLeafColumns(timeColumns: MpsMatrixTimeColumn[], timeColumnWidth = WEEK_COLUMN_WIDTH): MpsMatrixLeafColumn[] {
  return [
    STATIC_MATRIX_COLUMNS.productSku,
    STATIC_MATRIX_COLUMNS.uom,
    STATIC_MATRIX_COLUMNS.total,
    STATIC_MATRIX_COLUMNS.dayBeforeStart,
    ...timeColumns.map((column) => ({
      id: column.id,
      label: column.label,
      width: timeColumnWidth,
      minWidth: timeColumnWidth,
      align: 'center' as const,
      groupId: 'currentPeriod' as const,
      editable: true,
      frozen: column.id === 'wk23',
      numeric: true,
    })),
    STATIC_MATRIX_COLUMNS.totalJuneRequiredDemand,
    STATIC_MATRIX_COLUMNS.totalJuneDistributedMps,
    STATIC_MATRIX_COLUMNS.futureJul,
    STATIC_MATRIX_COLUMNS.futureAug,
    STATIC_MATRIX_COLUMNS.futureSep,
    STATIC_MATRIX_COLUMNS.totalPeriodFuture,
  ];
}

export function buildMpsMatrixGridTemplate(columns: MpsMatrixLeafColumn[]): string {
  return columns.map((column) => `${column.width}px`).join(' ');
}

export function getMpsMatrixGridWidth(columns: MpsMatrixLeafColumn[]): number {
  return columns.reduce((sum, column) => sum + column.width, 0);
}

export function getMpsMatrixLeafColumnIds(timeColumns: MpsMatrixTimeColumn[]): string[] {
  return buildMpsMatrixLeafColumns(timeColumns).map((column) => column.id);
}

export function getMpsMatrixGroupSpans(timeColumnCount: number) {
  return [
    {id: 'product', label: 'Product / SKU', span: 1},
    {id: 'uom', label: 'UOM', span: 1},
    {id: 'total', label: 'Total', span: 1},
    {id: 'dayBeforeStart', label: 'Day Before Start', span: 1},
    {id: 'currentPeriod', label: 'June 2026 (Weekly)', span: timeColumnCount},
    {id: 'totalPeriod', label: 'Total JUNE 2026', span: 2},
    {id: 'future', label: 'Future (Monthly)', span: 3},
    {id: 'totalPeriodFuture', label: 'Total (Period + Future)', span: 1},
  ];
}

function buildMatrixTimeColumns(viewMode: ViewMode, monthLabel: string, primaryBuckets: MpsBucketLine[], displayedDays: DayCell[]): MpsMatrixTimeColumn[] {
  return viewMode === 'day'
    ? displayedDays.map((day) => ({id: `day-${day.key}`, label: day.label, helper: day.weekday}))
    : primaryBuckets.map((bucket) => {
      const weekNumber = 22 + Number(bucket.bucketLabel.replace('Week ', ''));
      return {
        id: `wk${weekNumber}`,
        label: `Wk ${weekNumber}`,
        helper: `${bucket.bucketStartDate.slice(8, 10)}-${bucket.bucketEndDate.slice(8, 10)} ${monthLabel.slice(0, 3)}`,
      };
    });
}

function assertMpsMatrixCellCount(context: string, expected: number, actual: number) {
  if (import.meta.env.DEV && expected !== actual) {
    throw new Error(`MPS matrix cell count mismatch in ${context}: expected ${expected}, got ${actual}.`);
  }
}

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

function formatSigned(value: number): string {
  return value > 0 ? formatNumber(value) : value < 0 ? `-${formatNumber(Math.abs(value))}` : '0';
}

function createDays(startIso: string, endIso: string): string[] {
  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function splitAcrossDays(total: number, dayCount: number, weekdaysOnly: boolean): number[] {
  if (dayCount <= 0) return [];
  const indexes = Array.from({length: dayCount}, (_, index) => index);
  const activeIndexes = weekdaysOnly ? indexes.filter((index) => {
    const weekday = index % 7;
    return weekday !== 0 && weekday !== 6;
  }) : indexes;
  const targetIndexes = activeIndexes.length > 0 ? activeIndexes : indexes;
  const base = Math.floor(total / targetIndexes.length);
  let remainder = total - base * targetIndexes.length;

  return indexes.map((index) => {
    if (!targetIndexes.includes(index)) return 0;
    const addOne = remainder > 0 ? 1 : 0;
    remainder = Math.max(0, remainder - 1);
    return base + addOne;
  });
}

function getStatusTone(value: number, min: number): DayCell['statusTone'] {
  if (value < 0) return 'negative';
  if (value < min) return 'low';
  if (value === 0) return 'idle';
  return 'ok';
}

function buildProductMatrixRows(
  demandLines: MpsDemandLine[],
  bucketLines: MpsBucketLine[],
  planningRules: ProductPlanningRule[],
): ProductMatrixRow[] {
  return demandLines.map((demandLine, rowIndex) => {
    const rule = planningRules.find((entry) => entry.productCode === demandLine.productCode);
    const buckets = bucketLines
      .filter((bucket) => bucket.productCode === demandLine.productCode)
      .sort((left, right) => left.bucketStartDate.localeCompare(right.bucketStartDate));

    const orderedQuantity = demandLine.demandSource === 'FirmOrder'
      ? Math.round(demandLine.approvedMonthlyDemand * 0.86)
      : Math.round(demandLine.approvedMonthlyDemand * (0.18 + (rowIndex % 3) * 0.06));

    return {
      demandLine,
      rule,
      buckets,
      orderedQuantity,
      futureMonthlyDemand: MONTHLY_OFFSETS.map((offset) => Math.round(demandLine.approvedMonthlyDemand * (1 + (offset - 2) * 0.03))),
      futureMonthlyMps: MONTHLY_OFFSETS.map((offset) => Math.max(0, Math.round(demandLine.approvedMonthlyDemand * (0.92 + offset * 0.02) - (rowIndex + 1) * 120))),
    };
  });
}

function buildDailyCells(row: ProductMatrixRow): DayCell[] {
  const cells: DayCell[] = [];

  for (const bucket of row.buckets) {
    const days = createDays(bucket.bucketStartDate, bucket.bucketEndDate);
    const demandSplit = splitAcrossDays(Math.round(bucket.projectedDemandConsumption), days.length, false);
    const orderedSplit = splitAcrossDays(
      Math.round(row.orderedQuantity / Math.max(row.buckets.length, 1)),
      days.length,
      false,
    );
    const plannedSplit = splitAcrossDays(bucket.plannedQuantity, days.length, true);
    let previousEnding = bucket.projectedOpeningStock;

    days.forEach((dayIso, index) => {
      const startingInventory = index === 0 ? bucket.projectedOpeningStock : previousEnding;
      const endingInventory = startingInventory + plannedSplit[index] - demandSplit[index];
      previousEnding = endingInventory;
      const date = new Date(`${dayIso}T00:00:00`);
      cells.push({
        key: dayIso,
        label: String(date.getDate()).padStart(2, '0'),
        weekday: WEEKDAY_LABELS[date.getDay()],
        bucketId: bucket.id,
        demand: demandSplit[index],
        ordered: orderedSplit[index],
        planned: plannedSplit[index],
        startingInventory,
        endingInventory,
        statusTone: getStatusTone(endingInventory, row.rule?.stockMin ?? 0),
      });
    });
  }

  return cells;
}

function getInventoryToneColor(tone: DayCell['statusTone']): string {
  switch (tone) {
    case 'ok':
      return '#14804A';
    case 'low':
      return '#D97706';
    case 'negative':
      return '#DC2626';
    default:
      return '#94A3B8';
  }
}

function getLineName(bucket: MpsBucketLine, productionLines: ProductionLine[]): string {
  return productionLines.find((line) => line.id === bucket.assignedLineId)?.name ?? 'Unassigned';
}

export default function MpsDemandSignalWorkspace({
  plan,
  demandLines,
  bucketLines,
  planningRules,
  productionLines,
  exceptions,
  mrpReadiness,
  selectedMonth,
  availableMonths,
  onMonthChange,
  filters,
  onChangeFilters,
  selectedProductCode,
  onSelectProduct,
  scenarios,
  readinessStatus,
  canRelease,
  onOpenAssistant,
  onOpenRelease,
  onOpenCreateScenario,
  onOpenCompareScenario,
  onEditQuantity,
  validationError,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [activeTab, setActiveTab] = useState<'mps' | 'capacity'>('mps');
  const [actionsAnchor, setActionsAnchor] = useState<null | HTMLElement>(null);
  const [showFrozenPeriod, setShowFrozenPeriod] = useState(true);
  const [showHighlights, setShowHighlights] = useState(true);
  const [showMaintenanceStops, setShowMaintenanceStops] = useState(true);

  const rows = useMemo(
    () => buildProductMatrixRows(demandLines, bucketLines, planningRules),
    [demandLines, bucketLines, planningRules],
  );

  const filteredRows = useMemo(() => rows.filter((row) => {
    const matchesSearch = !filters.search || `${row.demandLine.productCode} ${row.demandLine.productDescription}`.toLowerCase().includes(filters.search.toLowerCase());
    const matchesFamily = !filters.productFamily || row.demandLine.productFamily === filters.productFamily;
    const matchesLine = !filters.productionLine || row.buckets.some((bucket) => bucket.assignedLineId === filters.productionLine);
    const matchesPriority = !filters.priority || row.demandLine.priority === filters.priority;
    const matchesRisk = !filters.riskLevel || row.demandLine.riskLevel === filters.riskLevel;
    const matchesStatus = !filters.status || row.buckets.some((bucket) => bucket.status === filters.status);
    const matchesExceptions = !filters.onlyExceptions || row.buckets.some((bucket) => bucket.projectedEndingStock < 0 || bucket.status === 'Overloaded');
    const matchesFrozen = !filters.onlyFrozen || row.buckets.some((bucket) => bucket.isFrozenPeriod);
    const matchesSelected = !selectedProductCode || row.demandLine.productCode === selectedProductCode;
    return matchesSearch && matchesFamily && matchesLine && matchesPriority && matchesRisk && matchesStatus && matchesExceptions && matchesFrozen && matchesSelected;
  }), [rows, filters, selectedProductCode]);

  const selectedRow = useMemo(() => {
    if (selectedProductCode) {
      return rows.find((row) => row.demandLine.productCode === selectedProductCode) ?? filteredRows[0] ?? rows[0] ?? null;
    }
    return filteredRows[0] ?? rows[0] ?? null;
  }, [filteredRows, rows, selectedProductCode]);

  const productFamilies = useMemo(
    () => [...new Set(rows.map((row) => row.demandLine.productFamily))].sort(),
    [rows],
  );

  const alertItems = useMemo(() => exceptions.slice(0, 5), [exceptions]);

  const totals = useMemo(() => ({
    starting: filteredRows.reduce((sum, row) => sum + (row.buckets[0]?.projectedOpeningStock ?? 0), 0),
    demand: filteredRows.reduce((sum, row) => sum + row.demandLine.approvedMonthlyDemand, 0),
    planned: filteredRows.reduce((sum, row) => sum + row.buckets.reduce((bucketSum, bucket) => bucketSum + bucket.plannedQuantity, 0), 0),
    ordered: filteredRows.reduce((sum, row) => sum + row.orderedQuantity, 0),
    ending: filteredRows.reduce((sum, row) => sum + (row.buckets[row.buckets.length - 1]?.projectedEndingStock ?? 0), 0),
    futureDemand: MONTHLY_OFFSETS.map((_, index) => filteredRows.reduce((sum, row) => sum + row.futureMonthlyDemand[index], 0)),
    futureMps: MONTHLY_OFFSETS.map((_, index) => filteredRows.reduce((sum, row) => sum + row.futureMonthlyMps[index], 0)),
  }), [filteredRows]);

  const monthLabel = availableMonths.find((entry) => entry.value === selectedMonth)?.label ?? selectedMonth;

  const primaryBuckets = filteredRows[0]?.buckets ?? [];
  const displayedDays = selectedRow ? buildDailyCells(selectedRow) : [];
  const matrixTimeColumns = useMemo(
    () => buildMatrixTimeColumns(viewMode, monthLabel, primaryBuckets, displayedDays),
    [displayedDays, monthLabel, primaryBuckets, viewMode],
  );
  const matrixColumns = useMemo(
    () => buildMpsMatrixLeafColumns(matrixTimeColumns, viewMode === 'day' ? DAY_COLUMN_WIDTH : WEEK_COLUMN_WIDTH),
    [matrixTimeColumns, viewMode],
  );
  const matrixGridTemplate = useMemo(() => buildMpsMatrixGridTemplate(matrixColumns), [matrixColumns]);
  const matrixMinWidth = useMemo(() => getMpsMatrixGridWidth(matrixColumns), [matrixColumns]);

  return (
    <Box>
      <TopBar
        plan={plan}
        monthLabel={monthLabel}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        onCreateScenario={onOpenCreateScenario}
        onCompareScenarios={onOpenCompareScenario}
        onOpenRelease={onOpenRelease}
        onOpenAssistant={onOpenAssistant}
        canRelease={canRelease}
        actionsAnchor={actionsAnchor}
        onOpenActions={setActionsAnchor}
        onCloseActions={() => setActionsAnchor(null)}
      />

      <TabsHeader activeTab={activeTab} onChangeTab={setActiveTab} />

      {activeTab === 'capacity' ? (
        <CapacityPlanningView viewMode={viewMode} plan={plan} />
      ) : (
      <Stack direction={{xs: 'column', lg: 'row'}} spacing={2}>
        <Box sx={{flex: 1, minWidth: 0}}>
          {/* MPS View content */}

          <InfoStrip />

          {validationError ? (
            <Box sx={{mb: 1.5, px: 1.5, py: 1.2, borderRadius: 3, border: '1px solid #FECACA', bgcolor: '#FEF2F2'}}>
              <Typography sx={{fontSize: 12, fontWeight: 700, color: '#B42318'}}>{validationError}</Typography>
            </Box>
          ) : null}

          <FilterBar
            filters={filters}
            productFamilies={productFamilies}
            selectedMonth={selectedMonth}
            availableMonths={availableMonths}
            onMonthChange={onMonthChange}
            onChangeFilters={onChangeFilters}
          />

          <Box
            sx={{
              border: '1px solid #D8E2F0',
              borderRadius: 4,
              bgcolor: 'var(--planning-surface)',
              boxShadow: planningTokens.softShadow,
              overflow: 'hidden',
            }}
          >
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 1.2, borderBottom: '1px solid #E6ECF5', bgcolor: '#FBFCFE'}}>
              <Typography sx={{fontSize: 12, fontWeight: 700, color: '#5B668A'}}>
                Plan and distribute demand by product. Adjust Planned Quantity (MPS) to meet required demand and maintain inventory targets.
              </Typography>
              <Stack direction="row" spacing={0.75}>
                <Button size="small" variant="outlined" sx={miniActionSx}>
                  <ExpandLessIcon sx={{fontSize: 16}} />
                  Expand All
                </Button>
                <Button size="small" variant="outlined" sx={miniActionSx}>
                  <ExpandMoreIcon sx={{fontSize: 16}} />
                  Collapse All
                </Button>
                <IconButton size="small" sx={{border: '1px solid #D8E2F0', borderRadius: 2}}>
                  <SettingsOutlinedIcon sx={{fontSize: 16, color: '#1769FF'}} />
                </IconButton>
              </Stack>
            </Box>

            <Box sx={{overflowX: 'auto'}}>
              <Box sx={{minWidth: matrixMinWidth}}>
                <MatrixHeader
                  monthLabel={monthLabel}
                  columns={matrixColumns}
                  timeColumns={matrixTimeColumns}
                  gridTemplate={matrixGridTemplate}
                  viewMode={viewMode}
                />

                {filteredRows.map((row) => (
                  <ProductBlock
                    key={row.demandLine.productCode}
                    row={row}
                    productionLines={productionLines}
                    viewMode={viewMode}
                    displayedDays={row.demandLine.productCode === selectedRow?.demandLine.productCode ? displayedDays : buildDailyCells(row)}
                    gridTemplate={matrixGridTemplate}
                    expectedCellCount={matrixColumns.length}
                    isSelected={selectedRow?.demandLine.productCode === row.demandLine.productCode}
                    onSelect={() => onSelectProduct(row.demandLine.productCode)}
                    onEditQuantity={onEditQuantity}
                    showFrozenPeriod={showFrozenPeriod}
                    showHighlights={showHighlights}
                  />
                ))}

                <TotalBlock
                  totals={totals}
                  displayedDays={selectedRow ? displayedDays : []}
                  viewMode={viewMode}
                  timeColumnCount={viewMode === 'day' ? displayedDays.length : primaryBuckets.length}
                  gridTemplate={matrixGridTemplate}
                  expectedCellCount={matrixColumns.length}
                />
              </Box>
            </Box>

            <Box sx={{px: 1.5, py: 1.2, borderTop: '1px solid #E6ECF5', display: 'flex', alignItems: 'center', gap: 1}}>
              <EditIcon sx={{fontSize: 15, color: '#1f63ea'}} />
              <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>
                Cells in blue are editable (Planned Quantity). Click the pencil icon on the Planned Quantity row to enable editing.
              </Typography>
            </Box>
          </Box>

          <Stack direction={{xs: 'column', xl: 'row'}} spacing={2} sx={{mt: 2}}>
            <AlertsCard alerts={alertItems} />
            <ScenarioSummaryCard
              scenarios={scenarios}
              totals={totals}
              selectedMonth={monthLabel}
            />
            <ApprovalStatusCard
              plan={plan}
              readinessStatus={readinessStatus}
              mrpReadiness={mrpReadiness}
              onOpenRelease={onOpenRelease}
              canRelease={canRelease}
            />
          </Stack>
        </Box>

        <Sidebar
          selectedRow={selectedRow}
          showFrozenPeriod={showFrozenPeriod}
          setShowFrozenPeriod={setShowFrozenPeriod}
          showMaintenanceStops={showMaintenanceStops}
          setShowMaintenanceStops={setShowMaintenanceStops}
          showHighlights={showHighlights}
          setShowHighlights={setShowHighlights}
        />
      </Stack>
      )}
    </Box>
  );
}

function TopBar({
  plan,
  monthLabel,
  viewMode,
  onChangeViewMode,
  onCreateScenario,
  onCompareScenarios,
  onOpenRelease,
  onOpenAssistant,
  canRelease,
  actionsAnchor,
  onOpenActions,
  onCloseActions,
}: {
  plan: MpsPlan;
  monthLabel: string;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  onCreateScenario: () => void;
  onCompareScenarios: () => void;
  onOpenRelease: () => void;
  onOpenAssistant: () => void;
  canRelease: boolean;
  actionsAnchor: HTMLElement | null;
  onOpenActions: (anchor: HTMLElement | null) => void;
  onCloseActions: () => void;
}) {
  return (
    <Box sx={{mb: 2}}>
      <Stack direction={{xs: 'column', xl: 'row'}} justifyContent="space-between" spacing={2}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography sx={{fontSize: 14, color: 'var(--planning-text-primary)', fontWeight: 700}}>
              Demand Signal Analysis
            </Typography>
            <KeyboardArrowRightIcon sx={{fontSize: 16, color: 'var(--planning-text-muted)'}} />
            <Typography sx={{fontSize: 14, color: 'var(--planning-text-primary)', fontWeight: 800}}>
              MPS & Capacity Planning
            </Typography>
            <InfoOutlinedIcon sx={{fontSize: 16, color: '#1f63ea'}} />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1}} flexWrap="wrap">
            <Typography sx={{fontSize: 13, color: '#0F172A', fontWeight: 700}}>
              Demand Signal:
            </Typography>
            <Typography sx={{fontSize: 14, fontWeight: 900, color: '#1f63ea'}}>
              DS-{plan.periodStartDate} - {monthLabel}
            </Typography>
            <Chip
              size="small"
              label="Completed Analysis"
              sx={{height: 24, bgcolor: '#E8F7ED', color: '#14804A', fontWeight: 800}}
            />
          </Stack>

          <Box sx={{display: 'grid', gridTemplateColumns: {xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(110px, 1fr))', xl: 'repeat(8, minmax(110px, 1fr))'}, gap: 2, mt: 2}}>
            <HeaderMetric label="Plant" value="Tijuana" />
            <HeaderMetric label="Scenario" value="Baseline" />
            <HeaderMetric label="Version" value="1" />
            <HeaderMetric label="Owner" value={plan.createdBy} />
            <HeaderMetric
              label="Time Bucket (Global)"
              value={(
                <Stack direction="row" spacing={0.5}>
                  <ModeBtn active={viewMode === 'day'} onClick={() => onChangeViewMode('day')}>Day</ModeBtn>
                  <ModeBtn active={viewMode === 'week'} onClick={() => onChangeViewMode('week')}>Week</ModeBtn>
                </Stack>
              )}
            />
            <HeaderMetric
              label="Frozen Period"
              value={(
                <Stack direction="row" spacing={0.5} alignItems="center" sx={{mt: 0.75}}>
                  <VisibilityOffIcon sx={{fontSize: 14, color: 'var(--planning-text-muted)'}} />
                  <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-muted)'}}>Hidden</Typography>
                </Stack>
              )}
            />
            <HeaderMetric label="Analysis Status" value="Completed" accent="#14804A" />
            <HeaderMetric
              label="Last Updated"
              value={(() => {
                const d = new Date(plan.updatedAt);
                return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
              })()}
            />
          </Box>
        </Box>

        <Stack alignItems={{xs: 'stretch', xl: 'flex-end'}} spacing={1}>
          <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{xs: 'flex-start', xl: 'flex-end'}}>
            <Button variant="outlined" sx={headerActionSx} onClick={onCreateScenario}>Create Scenario</Button>
            <Button variant="outlined" sx={headerActionSx} onClick={onOpenAssistant} startIcon={<AutoAwesomeIcon sx={{fontSize: 16}} />}>
              AI Assistant
            </Button> 
          </Stack>

          <Button
            variant="contained"
            onClick={onOpenRelease}
            sx={{
              minWidth: 196,
              alignSelf: {xs: 'stretch', xl: 'flex-end'},
              textTransform: 'none',
              fontWeight: 800,
              borderRadius: 2.5,
              py: 1.35,
              bgcolor: canRelease ? '#1f63ea' : '#94A3B8',
              boxShadow: '0 12px 24px rgba(31,99,234,0.22)',
            }}
          >
            Submit for Global Approval
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function HeaderMetric({label, value, accent}: {label: string; value: ReactNode; accent?: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 700}}>{label}</Typography>
      {typeof value === 'string' ? (
        <Typography sx={{fontSize: 14, fontWeight: 800, color: accent ?? '#0F172A', mt: 0.5}}>{value}</Typography>
      ) : (
        <Box sx={{mt: 0.75}}>{value}</Box>
      )}
    </Box>
  );
}

function ModeBtn({active, onClick, children}: {active: boolean; onClick: () => void; children: React.ReactNode}) {
  return (
    <Button
      size="small"
      onClick={onClick}
      sx={{
        minWidth: 58,
        px: 1.4,
        py: 0.5,
        fontSize: 12,
        fontWeight: 800,
        textTransform: 'none',
        borderRadius: 1.8,
        border: '1px solid',
        borderColor: active ? '#1f63ea' : '#D8E2F0',
        bgcolor: active ? '#1f63ea' : '#FFFFFF',
        color: active ? '#FFFFFF' : '#475467',
        '&:hover': {bgcolor: active ? '#1b57cf' : '#F8FAFF'},
      }}
    >
      {children}
    </Button>
  );
}

function TabsHeader({activeTab, onChangeTab}: {activeTab: 'mps' | 'capacity'; onChangeTab: (tab: 'mps' | 'capacity') => void}) {
  return (
    <Stack direction="row" spacing={3} sx={{borderBottom: '1px solid #E6ECF5', mb: 1.5}}>
      <Box
        onClick={() => onChangeTab('mps')}
        sx={{
          cursor: 'pointer',
          pb: 1.2,
          borderBottom: activeTab === 'mps' ? '2px solid #1f63ea' : '2px solid transparent',
        }}
      >
        <Typography sx={{fontSize: 14, fontWeight: 800, color: activeTab === 'mps' ? '#1f63ea' : '#475467'}}>
          MPS View (by Product)
        </Typography>
      </Box>
      <Box
        onClick={() => onChangeTab('capacity')}
        sx={{
          cursor: 'pointer',
          pb: 1.2,
          borderBottom: activeTab === 'capacity' ? '2px solid #1f63ea' : '2px solid transparent',
        }}
      >
        <Typography sx={{fontSize: 14, fontWeight: 800, color: activeTab === 'capacity' ? '#1f63ea' : '#475467'}}>
          Capacity Planning View (by Resource)
        </Typography>
      </Box>
    </Stack>
  );
}

function InfoStrip() {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1.5, px: 1.5, py: 1.2, borderRadius: 3, border: '1px solid #E6ECF5', bgcolor: 'var(--planning-surface-muted)'}}>
      <InfoOutlinedIcon sx={{fontSize: 16, color: '#1f63ea'}} />
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>
        Plan and distribute demand by product. Adjust planned quantity (MPS) to meet required demand and maintain inventory targets.
      </Typography>
    </Box>
  );
}

function FilterBar({
  filters,
  productFamilies,
  selectedMonth,
  availableMonths,
  onMonthChange,
  onChangeFilters,
}: {
  filters: MpsPlanningFiltersState;
  productFamilies: string[];
  selectedMonth: string;
  availableMonths: {value: string; label: string}[];
  onMonthChange: (month: string) => void;
  onChangeFilters: (patch: Partial<MpsPlanningFiltersState>) => void;
}) {
  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1.25, mb: 1.5}}>
      <TextField
        select
        size="small"
        value={selectedMonth}
        onChange={(event) => onMonthChange(event.target.value)}
        sx={filterFieldSx(176)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CalendarMonthIcon sx={{fontSize: 16, color: '#1f63ea'}} />
            </InputAdornment>
          ),
        }}
      >
        {availableMonths.map((entry) => (
          <MenuItem key={entry.value} value={entry.value}>{entry.label}</MenuItem>
        ))}
      </TextField>

      <TextField
        size="small"
        placeholder="Search product..."
        value={filters.search}
        onChange={(event) => onChangeFilters({search: event.target.value})}
        sx={filterFieldSx(210)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{fontSize: 16, color: 'var(--planning-text-muted)'}} />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        select
        size="small"
        value={filters.productFamily}
        onChange={(event) => onChangeFilters({productFamily: event.target.value})}
        placeholder="Family"
        sx={filterFieldSx(150)}
      >
        <MenuItem value="">All families</MenuItem>
        {productFamilies.map((family) => (
          <MenuItem key={family} value={family}>{family}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

function MatrixHeader({
  monthLabel,
  columns,
  timeColumns,
  gridTemplate,
  viewMode,
}: {
  monthLabel: string;
  columns: MpsMatrixLeafColumn[];
  timeColumns: MpsMatrixTimeColumn[];
  gridTemplate: string;
  viewMode: ViewMode;
}) {
  const groupSpans = getMpsMatrixGroupSpans(timeColumns.length).map((group) => {
    if (group.id === 'currentPeriod') {
      return {...group, label: `${monthLabel} (${viewMode === 'day' ? 'Daily' : 'Weekly'})`};
    }
    if (group.id === 'totalPeriod') {
      return {...group, label: `Total ${monthLabel.toUpperCase()}`};
    }
    return group;
  });
  const headerLeafColumnCount = columns.length;
  assertMpsMatrixCellCount('header leaf columns', headerLeafColumnCount, 4 + timeColumns.length + 2 + 3 + 1);

  return (
    <Box sx={{borderBottom: '1px solid #E6ECF5'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate}}>
        {groupSpans.map((group) => (
          <HeaderGroupCell
            key={group.id}
            label={group.label}
            span={group.span}
            tone={group.id === 'totalPeriod' ? 'blue' : undefined}
            separatorBefore={group.id === 'totalPeriod' || group.id === 'future' || group.id === 'totalPeriodFuture'}
          />
        ))}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate}}>
        {columns.map((column) => (
          <HeaderCell
            key={column.id}
            label={column.label}
            center={column.align !== 'left'}
            compact
            tone={column.highlighted ? 'blue' : undefined}
            helper={timeColumns.find((timeColumn) => timeColumn.id === column.id)?.helper}
            separatorBefore={column.id === 'totalJuneRequiredDemand' || column.id === 'futureJul' || column.id === 'totalPeriodFuture'}
          />
        ))}
      </Box>
    </Box>
  );
}

function ProductBlock({
  row,
  productionLines,
  viewMode,
  displayedDays,
  gridTemplate,
  expectedCellCount,
  isSelected,
  onSelect,
  onEditQuantity,
  showFrozenPeriod,
  showHighlights,
}: {
  row: ProductMatrixRow;
  productionLines: ProductionLine[];
  viewMode: ViewMode;
  displayedDays: DayCell[];
  gridTemplate: string;
  expectedCellCount: number;
  isSelected: boolean;
  onSelect: () => void;
  onEditQuantity: (bucketId: string, quantity: number) => void;
  showFrozenPeriod: boolean;
  showHighlights: boolean;
}) {
  const [editMode, setEditMode] = useState(false);

  const totalPlanned = row.buckets.reduce((sum, bucket) => sum + bucket.plannedQuantity, 0);
  const totalEnding = row.buckets[row.buckets.length - 1]?.projectedEndingStock ?? 0;
  const totalFuture = row.futureMonthlyDemand.reduce((sum, value) => sum + value, 0);

  const timeValues = viewMode === 'day'
    ? {
      starting: displayedDays.map((day) => day.startingInventory),
      demand: displayedDays.map((day) => day.demand),
      planned: displayedDays.map((day) => day.planned),
      ending: displayedDays.map((day) => day.endingInventory),
      status: displayedDays.map((day) => day.statusTone),
      editableKeys: [] as string[],
    }
    : {
      starting: row.buckets.map((bucket) => bucket.projectedOpeningStock),
      demand: row.buckets.map((bucket) => Math.round(bucket.projectedDemandConsumption)),
      planned: row.buckets.map((bucket) => bucket.plannedQuantity),
      ending: row.buckets.map((bucket) => bucket.projectedEndingStock),
      status: row.buckets.map((bucket) => getStatusTone(bucket.projectedEndingStock, row.rule?.stockMin ?? 0)),
      editableKeys: row.buckets.map((bucket) => bucket.id),
    };
  const bodyCellCount = 4 + timeValues.starting.length + 2 + 3 + 1;
  assertMpsMatrixCellCount(`product ${row.demandLine.productCode}`, expectedCellCount, bodyCellCount);

  return (
    <Box sx={{borderBottom: '1px solid #E6ECF5', bgcolor: isSelected ? '#FCFDFF' : '#FFFFFF'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate}}>
        <ProductIdentityCell
          row={row}
          isSelected={isSelected}
          onSelect={onSelect}
          productionLines={productionLines}
        />
        <ProductMetaCell value={row.demandLine.uom.toLowerCase()} center />
        <ProductMetaCell value={formatNumber(row.demandLine.approvedMonthlyDemand)} center tone="blue" />
        <ProductMetaCell value={formatNumber(row.buckets[0]?.projectedOpeningStock ?? 0)} center />

        <TimeRow values={timeValues.starting} tone="blue" />
        <SummaryPair left={row.demandLine.approvedMonthlyDemand} right={totalPlanned} />
        <FutureCells values={row.futureMonthlyDemand} />
        <ProductMetaCell value={formatNumber(totalFuture)} center tone="blue" separatorBefore />

        <SubRow label="Starting Inventory" />
        <ProductMetaCell value={row.demandLine.uom.toLowerCase()} center subdued />
        <ProductMetaCell value={formatNumber(row.buckets[0]?.projectedOpeningStock ?? 0)} center tone="blue" />
        <ProductMetaCell value={formatNumber(row.buckets[0]?.projectedOpeningStock ?? 0)} center />
        <TimeRow values={timeValues.starting} tone="blue" />
        <SummaryPair left={row.buckets[0]?.projectedOpeningStock ?? 0} right={row.buckets[0]?.projectedOpeningStock ?? 0} />
        <FutureCells values={row.futureMonthlyMps.map((value, index) => Math.max(0, value - row.futureMonthlyDemand[index] + 300))} />
        <ProductMetaCell value={formatNumber(row.buckets[0]?.projectedOpeningStock ?? 0)} center separatorBefore />

        <SubRow label="Required Demand" />
        <ProductMetaCell value={row.demandLine.uom.toLowerCase()} center subdued />
        <ProductMetaCell value={formatNumber(row.demandLine.approvedMonthlyDemand)} center tone="blue" />
        <ProductMetaCell value="-" center subdued />
        <TimeRow values={timeValues.demand} tone="blue" />
        <SummaryPair left={row.demandLine.approvedMonthlyDemand} right={totalPlanned} emphasizeLeft />
        <FutureCells values={row.futureMonthlyDemand} tone="blue" />
        <ProductMetaCell value={formatNumber(totalFuture)} center tone="blue" separatorBefore />

        <SubRow label="Planned Quantity (MPS)" highlight onEdit={() => setEditMode((prev) => !prev)} editMode={editMode} />
        <ProductMetaCell value={row.demandLine.uom.toLowerCase()} center subdued />
        <ProductMetaCell value={formatNumber(totalPlanned)} center tone="blue" />
        <ProductMetaCell value="-" center subdued />
        <EditableTimeRow
          values={timeValues.planned}
          editableKeys={timeValues.editableKeys}
          onEditQuantity={onEditQuantity}
          readOnly={viewMode === 'day' || !editMode}
        />
        <SummaryPair left={totalPlanned} right={totalPlanned} emphasizeBoth />
        <FutureCells values={row.futureMonthlyMps} tone="blue" />
        <ProductMetaCell value={formatNumber(row.futureMonthlyMps.reduce((sum, value) => sum + value, 0))} center tone="blue" separatorBefore />

        <SubRow label="Ending Inventory" />
        <ProductMetaCell value={row.demandLine.uom.toLowerCase()} center subdued />
        <ProductMetaCell value={formatSigned(totalEnding)} center tone={totalEnding < 0 ? 'danger' : 'blue'} />
        <ProductMetaCell value={formatNumber(row.buckets[0]?.projectedOpeningStock ?? 0)} center />
        <TimeRow values={timeValues.ending} tone="inventory" minStock={row.rule?.stockMin ?? 0} />
        <SummaryPair left={totalEnding} right={totalEnding} inventory />
        <FutureCells values={row.futureMonthlyMps.map((value, index) => value - row.futureMonthlyDemand[index])} tone="inventory" minStock={row.rule?.stockMin ?? 0} />
        <ProductMetaCell value={formatSigned(totalEnding + row.futureMonthlyMps.reduce((sum, value, index) => sum + value - row.futureMonthlyDemand[index], 0))} center tone="danger" separatorBefore />

        <SubRow label="Inventory Status" />
        <ProductMetaCell value={row.demandLine.uom.toLowerCase()} center subdued />
        <ProductMetaCell value="" center />
        <ProductMetaCell value="" center />
        <StatusDotRow statuses={timeValues.status} showFrozenPeriod={showFrozenPeriod} showHighlights={showHighlights} />
        <StatusSummaryPair statuses={timeValues.status} />
        <StatusDotFutureRow values={row.futureMonthlyMps.map((value, index) => getStatusTone(value - row.futureMonthlyDemand[index], row.rule?.stockMin ?? 0))} />
        <ProductMetaCell value="" center separatorBefore />
      </Box>
    </Box>
  );
}

function ProductIdentityCell({
  row,
  isSelected,
  onSelect,
  productionLines,
}: {
  row: ProductMatrixRow;
  isSelected: boolean;
  onSelect: () => void;
  productionLines: ProductionLine[];
}) {
  const leadTimeDays = Math.max(1, row.buckets.length - 1);
  return (
    <Box
      onClick={onSelect}
      sx={{
        px: 1.2,
        py: 1.15,
        borderRight: '1px solid #EDF1F7',
        borderTop: isSelected ? '2px solid #1f63ea' : '2px solid transparent',
        cursor: 'pointer',
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Typography sx={{fontSize: 13, fontWeight: 800, color: '#0F172A'}}>
          {row.demandLine.productCode}
        </Typography>
        <Typography sx={{fontSize: 12, color: '#1f63ea', fontWeight: 700}}>View details</Typography>
      </Stack>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.35}}>
        {row.demandLine.productDescription}
      </Typography>
      <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', mt: 0.4}}>
        {row.demandLine.productFamily} • {getLineName(row.buckets[0], productionLines)} • LT {leadTimeDays}d
      </Typography>
    </Box>
  );
}

function SubRow({label, highlight = false, muted = false, onEdit, editMode}: {
  label: string;
  highlight?: boolean;
  muted?: boolean;
  onEdit?: () => void;
  editMode?: boolean;
}) {
  return (
    <Box sx={{
      px: 1.2,
      py: 1.05,
      borderRight: '1px solid #EDF1F7',
      bgcolor: highlight ? '#F8FBFF' : '#FFFFFF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 0.5,
    }}>
      <Typography sx={{fontSize: 12, fontWeight: highlight ? 800 : 700, color: highlight ? '#1f63ea' : muted ? '#64748B' : '#0F172A'}}>
        {label}
      </Typography>
      {onEdit ? (
        <Tooltip title={editMode ? 'Disable editing' : 'Enable editing'}>
          <IconButton
            size="small"
            onClick={onEdit}
            sx={{
              p: 0.3,
              color: editMode ? '#1f63ea' : '#94A3B8',
              '&:hover': {bgcolor: 'var(--planning-neutral-bg)', color: '#1f63ea'},
            }}
          >
            <EditIcon sx={{fontSize: 13}} />
          </IconButton>
        </Tooltip>
      ) : null}
    </Box>
  );
}

function ProductMetaCell({
  value,
  center = false,
  tone,
  subdued = false,
  separatorBefore = false,
}: {
  value: string;
  center?: boolean;
  tone?: 'blue' | 'danger';
  subdued?: boolean;
  separatorBefore?: boolean;
}) {
  return (
    <Box sx={{px: 0.75, py: 1.05, borderLeft: separatorBefore ? '2px solid #BFD5FF' : 'none', borderRight: '1px solid #EDF1F7', textAlign: center ? 'center' : 'left'}}>
      <Typography sx={{fontSize: 12, fontWeight: tone ? 800 : 700, color: tone === 'blue' ? '#1f63ea' : tone === 'danger' ? '#DC2626' : subdued ? '#64748B' : '#0F172A'}}>
        {value}
      </Typography>
    </Box>
  );
}

function TimeRow({
  values,
  tone,
  minStock = 0,
}: {
  values: number[];
  tone: 'blue' | 'inventory';
  minStock?: number;
}) {
  return (
    <>
      {values.map((value, index) => {
        const isInventory = tone === 'inventory';
        const color = !isInventory
          ? '#1f63ea'
          : value < 0
            ? '#DC2626'
            : value < minStock
              ? '#D97706'
              : '#0F172A';
        return (
          <Box key={`${tone}-${index}-${value}`} sx={{px: 0.75, py: 1.05, borderRight: '1px solid #EDF1F7', textAlign: 'center'}}>
            <Typography sx={{fontSize: 12, fontWeight: tone === 'blue' ? 800 : 700, color}}>
              {value === 0 ? (tone === 'inventory' ? '0' : '-') : formatSigned(value)}
            </Typography>
          </Box>
        );
      })}
    </>
  );
}

function EditableTimeRow({
  values,
  editableKeys,
  onEditQuantity,
  readOnly,
}: {
  values: number[];
  editableKeys: string[];
  onEditQuantity: (bucketId: string, quantity: number) => void;
  readOnly: boolean;
}) {
  return (
    <>
      {values.map((value, index) => {
        const key = editableKeys[index];
        return (
          <Box key={`editable-${key ?? index}`} sx={{px: 0.55, py: 0.6, borderRight: '1px solid #EDF1F7', textAlign: 'center'}}>
            {readOnly || !key ? (
              <Typography sx={{fontSize: 12, fontWeight: 800, color: '#1f63ea'}}>{value === 0 ? '-' : formatNumber(value)}</Typography>
            ) : (
              <TextField
                size="small"
                type="number"
                value={value}
                onChange={(event) => onEditQuantity(key, Number(event.target.value))}
                sx={{
                  width: 68,
                  '& .MuiOutlinedInput-root': {
                    height: 28,
                    borderRadius: 1.8,
                    fontSize: 12,
                    bgcolor: 'var(--planning-surface)',
                  },
                  '& .MuiOutlinedInput-input': {
                    px: 0.6,
                    py: 0.2,
                    textAlign: 'center',
                    fontWeight: 800,
                    color: '#1f63ea',
                  },
                }}
              />
            )}
          </Box>
        );
      })}
    </>
  );
}

function StatusDotRow({
  statuses,
  showFrozenPeriod,
  showHighlights,
}: {
  statuses: DayCell['statusTone'][];
  showFrozenPeriod: boolean;
  showHighlights: boolean;
}) {
  return (
    <>
      {statuses.map((status, index) => (
        <Box key={`status-${index}`} sx={{px: 0.75, py: 1.05, borderRight: '1px solid #EDF1F7', textAlign: 'center'}}>
          {showFrozenPeriod || showHighlights ? (
            <Box sx={{width: 9, height: 9, borderRadius: '50%', bgcolor: getInventoryToneColor(status), mx: 'auto'}} />
          ) : (
            <RadioButtonUncheckedIcon sx={{fontSize: 10, color: '#CBD5E1'}} />
          )}
        </Box>
      ))}
    </>
  );
}

function StatusSummaryPair({statuses}: {statuses: DayCell['statusTone'][]}) {
  const tone = statuses.includes('negative') ? 'negative' : statuses.includes('low') ? 'low' : 'ok';
  const color = getInventoryToneColor(tone);
  return (
    <>
      <Box sx={{px: 0.75, py: 1.05, textAlign: 'center', borderLeft: '2px solid #BFD5FF', borderRight: '1px solid #D6E7FF', bgcolor: '#F5FAFF'}}>
        <Box sx={{width: 9, height: 9, borderRadius: '50%', bgcolor: color, mx: 'auto'}} />
      </Box>
      <Box sx={{px: 0.75, py: 1.05, textAlign: 'center', borderRight: '1px solid #BFD5FF', bgcolor: '#F5FAFF'}}>
        <Box sx={{width: 9, height: 9, borderRadius: '50%', bgcolor: color, mx: 'auto'}} />
      </Box>
    </>
  );
}

function SummaryPair({
  left,
  right,
  emphasizeLeft = false,
  emphasizeBoth = false,
  inventory = false,
}: {
  left: number;
  right: number;
  emphasizeLeft?: boolean;
  emphasizeBoth?: boolean;
  inventory?: boolean;
}) {
  return (
    <>
      {[left, right].map((value, index) => {
        const color = inventory
          ? value < 0
            ? '#DC2626'
            : '#0F172A'
          : emphasizeBoth || (emphasizeLeft && index === 0) || index === 1
            ? '#1F2366'
            : '#0F172A';
        return (
          <Box
            key={`${index}-${value}`}
            sx={{
              px: 0.75,
              py: 1.05,
              textAlign: 'center',
              borderLeft: index === 0 ? '2px solid #BFD5FF' : 'none',
              borderRight: index === 0 ? '1px solid #D6E7FF' : '1px solid #BFD5FF',
              bgcolor: '#F5FAFF',
            }}
          >
            <Typography sx={{fontSize: 12, fontWeight: 800, color}}>
              {inventory ? formatSigned(value) : formatNumber(value)}
            </Typography>
          </Box>
        );
      })}
    </>
  );
}

function FutureCells({
  values,
  tone,
  minStock = 0,
}: {
  values: number[];
  tone?: 'blue' | 'inventory';
  minStock?: number;
}) {
  return (
    <>
      {values.map((value, index) => {
        const color = tone === 'blue'
          ? '#1f63ea'
          : tone === 'inventory'
            ? value < 0
              ? '#DC2626'
              : value < minStock
                ? '#D97706'
                : '#0F172A'
            : '#0F172A';
        return (
          <Box key={`future-${index}-${value}`} sx={{px: 0.75, py: 1.05, borderLeft: index === 0 ? '2px solid #D8E2F0' : 'none', borderRight: '1px solid #EDF1F7', textAlign: 'center'}}>
            <Typography sx={{fontSize: 12, fontWeight: tone ? 800 : 700, color}}>
              {value === 0 ? '0' : formatSigned(value)}
            </Typography>
          </Box>
        );
      })}
    </>
  );
}

function StatusDotFutureRow({values}: {values: DayCell['statusTone'][]}) {
  return (
    <>
      {values.map((value, index) => (
        <Box key={`future-status-${index}`} sx={{px: 0.75, py: 1.05, borderLeft: index === 0 ? '2px solid #D8E2F0' : 'none', borderRight: '1px solid #EDF1F7', textAlign: 'center'}}>
          <Box sx={{width: 9, height: 9, borderRadius: '50%', bgcolor: getInventoryToneColor(value), mx: 'auto'}} />
        </Box>
      ))}
    </>
  );
}

function TotalBlock({
  totals,
  displayedDays,
  viewMode,
  timeColumnCount,
  gridTemplate,
  expectedCellCount,
}: {
  totals: {
    starting: number;
    demand: number;
    planned: number;
    ordered: number;
    ending: number;
    futureDemand: number[];
    futureMps: number[];
  };
  displayedDays: DayCell[];
  viewMode: ViewMode;
  timeColumnCount: number;
  gridTemplate: string;
  expectedCellCount: number;
}) {
  const timeValues = viewMode === 'day'
    ? {
      starting: displayedDays.map((day) => day.startingInventory),
      demand: displayedDays.map((day) => day.demand),
      planned: displayedDays.map((day) => day.planned),
      ending: displayedDays.map((day) => day.endingInventory),
    }
    : {
      starting: [],
      demand: [],
      planned: [],
      ending: [],
    };

  const totalCellCount = 4 + timeColumnCount + 2 + 3 + 1;
  assertMpsMatrixCellCount('total rows', expectedCellCount, totalCellCount);

  return (
    <Box sx={{bgcolor: '#FAFCFF'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate}}>
        <SubRow label="Total (All Products)" />
        <ProductMetaCell value="un" center subdued />
        <ProductMetaCell value={formatNumber(totals.demand)} center tone="blue" />
        <ProductMetaCell value="-" center />
        {(viewMode === 'day' ? timeValues.demand : Array.from({length: timeColumnCount}, () => 0)).map((value, index) => (
          <ProductMetaCell key={`total-hdr-${index}`} value={viewMode === 'day' ? formatNumber(value) : '-'} center tone="blue" />
        ))}
        <SummaryPair left={totals.demand} right={totals.planned} emphasizeBoth />
        <FutureCells values={totals.futureDemand} tone="blue" />
        <ProductMetaCell value={formatNumber(totals.futureDemand.reduce((sum, value) => sum + value, 0))} center tone="blue" separatorBefore />
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate}}>
        <SubRow label="Total Starting Inventory" />
        <ProductMetaCell value="un" center subdued />
        <ProductMetaCell value={formatNumber(totals.starting)} center tone="blue" />
        <ProductMetaCell value={formatNumber(totals.starting)} center />
        {(viewMode === 'day' ? timeValues.starting : Array.from({length: timeColumnCount}, () => 0)).map((value, index) => (
          <ProductMetaCell key={`total-starting-${index}`} value={viewMode === 'day' ? formatNumber(value) : '-'} center tone="blue" />
        ))}
        <SummaryPair left={totals.starting} right={totals.starting} />
        <FutureCells values={Array(3).fill(0)} />
        <ProductMetaCell value={formatNumber(totals.starting)} center separatorBefore />
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate}}>
        <SubRow label="Total Required Demand" />
        <ProductMetaCell value="un" center subdued />
        <ProductMetaCell value={formatNumber(totals.demand)} center tone="blue" />
        <ProductMetaCell value="-" center />
        {(viewMode === 'day' ? timeValues.demand : Array.from({length: timeColumnCount}, () => 0)).map((value, index) => (
          <ProductMetaCell key={`total-demand-${index}`} value={viewMode === 'day' ? formatNumber(value) : '-'} center tone="blue" />
        ))}
        <SummaryPair left={totals.demand} right={totals.planned} emphasizeLeft />
        <FutureCells values={totals.futureDemand} tone="blue" />
        <ProductMetaCell value={formatNumber(totals.futureDemand.reduce((sum, value) => sum + value, 0))} center tone="blue" separatorBefore />
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate}}>
        <SubRow label="Total Planned Quantity (MPS)" />
        <ProductMetaCell value="un" center subdued />
        <ProductMetaCell value={formatNumber(totals.planned)} center tone="blue" />
        <ProductMetaCell value="-" center />
        {(viewMode === 'day' ? timeValues.planned : Array.from({length: timeColumnCount}, () => 0)).map((value, index) => (
          <ProductMetaCell key={`total-planned-${index}`} value={viewMode === 'day' ? formatNumber(value) : '-'} center tone="blue" />
        ))}
        <SummaryPair left={totals.planned} right={totals.planned} emphasizeBoth />
        <FutureCells values={totals.futureMps} tone="blue" />
        <ProductMetaCell value={formatNumber(totals.futureMps.reduce((sum, value) => sum + value, 0))} center tone="blue" separatorBefore />
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate}}>
        <SubRow label="Total Ending Inventory" />
        <ProductMetaCell value="un" center subdued />
        <ProductMetaCell value={formatSigned(totals.ending)} center tone={totals.ending < 0 ? 'danger' : 'blue'} />
        <ProductMetaCell value="-" center />
        {(viewMode === 'day' ? timeValues.ending : Array.from({length: timeColumnCount}, () => 0)).map((value, index) => (
          <ProductMetaCell key={`total-ending-${index}`} value={viewMode === 'day' ? formatSigned(value) : '-'} center tone={value < 0 ? 'danger' : undefined} />
        ))}
        <SummaryPair left={totals.ending} right={totals.ending} inventory />
        <FutureCells values={totals.futureMps.map((value, index) => value - totals.futureDemand[index])} tone="inventory" />
        <ProductMetaCell value={formatSigned(totals.ending + totals.futureMps.reduce((sum, value, index) => sum + value - totals.futureDemand[index], 0))} center tone="danger" separatorBefore />
      </Box>
    </Box>
  );
}

function Sidebar({
  selectedRow,
  showFrozenPeriod,
  setShowFrozenPeriod,
  showMaintenanceStops,
  setShowMaintenanceStops,
  showHighlights,
  setShowHighlights,
}: {
  selectedRow: ProductMatrixRow | null;
  showFrozenPeriod: boolean;
  setShowFrozenPeriod: (value: boolean) => void;
  showMaintenanceStops: boolean;
  setShowMaintenanceStops: (value: boolean) => void;
  showHighlights: boolean;
  setShowHighlights: (value: boolean) => void;
}) {
  return (
    <Box sx={{width: {xs: '100%', lg: 280}, flexShrink: 0}}>
      <Box sx={sidebarCardSx}>
        <Typography sx={sidebarTitleSx}>Product Details</Typography>
        {selectedRow ? (
          <Stack spacing={1.2}>
            <SidebarField label="SKU / Material" value={selectedRow.demandLine.productCode} />
            <SidebarField label="Family" value={selectedRow.demandLine.productFamily} />
            <SidebarField label="UOM" value={selectedRow.demandLine.uom.toLowerCase()} />
            <SidebarField label="Lead Time (Prod.)" value={`${Math.max(1, selectedRow.buckets.length - 1)} dias`} />
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1}}>
              <SidebarField label="Scrap Rate" value="5,00%" />
              <SidebarField label="Safety Stock" value={selectedRow.rule ? formatNumber(selectedRow.rule.stockMin) : '-'} />
              <SidebarField label="MOQ" value={selectedRow.rule ? formatNumber(selectedRow.rule.minLotSize) : '-'} />
              <SidebarField label="Lot Size / Multiple" value={selectedRow.rule ? formatNumber(selectedRow.rule.preferredLotSize) : '-'} />
            </Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>Rounding (Auto)</Typography>
              <Switch checked />
            </Stack>
            <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)'}}>Last applied: 02/06/2025 10:15</Typography>
            <Button sx={{p: 0, alignSelf: 'flex-start', textTransform: 'none', fontSize: 12, fontWeight: 800}}>View Product Master Data</Button>
          </Stack>
        ) : null}
      </Box>

      <Box sx={{...sidebarCardSx, mt: 2}}>
        <Typography sx={sidebarTitleSx}>Legend</Typography>
        <Stack spacing={1}>
          <LegendItem color="#14804A" label="Inventory OK (>= Safety Stock)" />
          <LegendItem color="#D97706" label="Inventory Low (< Safety Stock)" />
          <LegendItem color="#DC2626" label="Inventory Negative" />
          <LegendItem color="#94A3B8" label="Non Working Day" />
        </Stack>
      </Box>

      <Box sx={{...sidebarCardSx, mt: 2}}>
        <Typography sx={sidebarTitleSx}>Display Options</Typography>
        <Stack spacing={1.2}>
          <FormControlLabel control={<Checkbox checked={showFrozenPeriod} onChange={(event) => setShowFrozenPeriod(event.target.checked)} />} label="Show Frozen Period" />
          <FormControlLabel control={<Checkbox checked={showMaintenanceStops} onChange={(event) => setShowMaintenanceStops(event.target.checked)} />} label="Show Maintenance / Stops" />
          <FormControlLabel control={<Checkbox checked={showHighlights} onChange={(event) => setShowHighlights(event.target.checked)} />} label="Show Highlights" />
          <Divider />
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 700}}>Highlight Rules</Typography>
          <Select size="small" value="Safety Stock">
            <MenuItem value="Safety Stock">Safety Stock</MenuItem>
          </Select>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 700}}>Display Unit</Typography>
          <Select size="small" value="Base Unit (un)">
            <MenuItem value="Base Unit (un)">Base Unit (un)</MenuItem>
          </Select>
        </Stack>
      </Box>
    </Box>
  );
}

function AlertsCard({alerts}: {alerts: MpsException[]}) {
  return (
    <Box sx={{...bottomCardSx, flex: 1}}>
      <Typography sx={bottomTitleSx}>Alerts ({alerts.length})</Typography>
      <Stack spacing={1.1}>
        {alerts.map((alert) => (
          <Stack key={alert.id} direction="row" spacing={1.1} alignItems="flex-start">
            {alert.severity === 'Blocker' ? (
              <WarningAmberIcon sx={{fontSize: 18, color: '#DC2626', mt: 0.2}} />
            ) : (
              <InfoOutlinedIcon sx={{fontSize: 18, color: '#1f63ea', mt: 0.2}} />
            )}
            <Box>
              <Typography sx={{fontSize: 12, fontWeight: 700, color: '#0F172A'}}>{alert.productCode ?? 'Planning alert'}</Typography>
              <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{alert.reason}</Typography>
            </Box>
          </Stack>
        ))}
      </Stack>
      <Button sx={{mt: 1.25, p: 0, textTransform: 'none', fontSize: 12, fontWeight: 800}}>View All Alerts</Button>
    </Box>
  );
}

function ScenarioSummaryCard({
  scenarios,
  totals,
  selectedMonth,
}: {
  scenarios: MpsScenario[];
  totals: {
    demand: number;
    planned: number;
    ordered: number;
    ending: number;
    futureDemand: number[];
    futureMps: number[];
  };
  selectedMonth: string;
}) {
  const rows = [
    {
      name: 'Baseline (Current)',
      status: 'Active (Final)',
      updated: '02/06/2025 14:32',
      planned: totals.planned,
      inventory: totals.ending,
      overloadDays: scenarios.length > 0 ? 4 : 2,
    },
    ...scenarios.slice(0, 2).map((scenario, index) => ({
      name: scenario.name,
      status: scenario.status,
      updated: new Date(scenario.createdAt).toLocaleString(),
      planned: totals.planned + (index + 1) * 400,
      inventory: totals.ending + (index + 1) * 1600,
      overloadDays: Math.max(0, 3 - index),
    })),
  ];

  return (
    <Box sx={{...bottomCardSx, flex: 1.8}}>
      <Typography sx={bottomTitleSx}>Scenario Summary</Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 1fr 0.9fr 0.9fr 0.8fr', gap: 1, borderBottom: '1px solid #E6ECF5', pb: 1}}>
        {['Scenario', 'Status', 'Last Updated', 'Total Planned Qty (MPS)', 'Projected Ending Inv.', 'Capacity Overload Days'].map((label) => (
          <Typography key={label} sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
        ))}
      </Box>
      <Stack spacing={1} sx={{mt: 1.25}}>
        {rows.map((row) => (
          <Box key={row.name} sx={{display: 'grid', gridTemplateColumns: '1.2fr 0.7fr 1fr 0.9fr 0.9fr 0.8fr', gap: 1}}>
            <Typography sx={{fontSize: 12, fontWeight: 700, color: '#0F172A'}}>{row.name}</Typography>
            <Typography sx={{fontSize: 12, color: '#14804A'}}>{row.status}</Typography>
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{row.updated}</Typography>
            <Typography sx={{fontSize: 12, fontWeight: 700, color: '#0F172A'}}>{formatNumber(row.planned)}</Typography>
            <Typography sx={{fontSize: 12, fontWeight: 700, color: row.inventory < 0 ? '#DC2626' : '#14804A'}}>{formatSigned(row.inventory)}</Typography>
            <Typography sx={{fontSize: 12, fontWeight: 700, color: row.overloadDays > 0 ? '#D97706' : '#14804A'}}>{row.overloadDays}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function ApprovalStatusCard({
  plan,
  readinessStatus,
  mrpReadiness,
  onOpenRelease,
  canRelease,
}: {
  plan: MpsPlan;
  readinessStatus: MpsAssistantFinalReadinessStatus;
  mrpReadiness: MrpReadiness;
  onOpenRelease: () => void;
  canRelease: boolean;
}) {
  const steps = [
    {label: 'Completed Analysis', state: 'done'},
    {label: 'Submit for Global Approval', state: canRelease ? 'active' : 'current'},
    {label: 'Approved', state: plan.status === 'Released' ? 'current' : 'todo'},
    {label: 'MRP Trigger', state: mrpReadiness.isReady ? 'todo' : 'todo'},
  ] as const;

  return (
    <Box sx={{...bottomCardSx, flex: 1.1}}>
      <Typography sx={bottomTitleSx}>Approval Status</Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mt: 2}}>
        {steps.map((step, index) => (
          <Fragment key={step.label}>
            <Stack alignItems="center" spacing={0.6} sx={{flex: 1}}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: step.state === 'done' ? '#14804A' : step.state === 'active' ? '#1f63ea' : '#9CA3AF',
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 800,
                }}
              >
                {step.state === 'done' ? <CheckCircleIcon sx={{fontSize: 16}} /> : index + 1}
              </Box>
              <Typography sx={{fontSize: 11, fontWeight: 700, color: '#0F172A', textAlign: 'center'}}>{step.label}</Typography>
            </Stack>
            {index < steps.length - 1 ? <Box sx={{height: 2, flex: 1, bgcolor: '#D8E2F0'}} /> : null}
          </Fragment>
        ))}
      </Stack>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 2}}>
        Readiness: <strong>{readinessStatus}</strong> {mrpReadiness.isReady ? '• MRP ready' : '• review pending checks'}
      </Typography>
      <Button
        variant="contained"
        onClick={onOpenRelease}
        sx={{mt: 2, width: '100%', borderRadius: 2.5, textTransform: 'none', fontWeight: 800, py: 1.2, bgcolor: canRelease ? '#1f63ea' : '#94A3B8'}}
      >
        Submit for Global Approval
      </Button>
    </Box>
  );
}

function SidebarField({label, value}: {label: string; value: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 700}}>{label}</Typography>
      <Typography sx={{fontSize: 12, color: '#0F172A', fontWeight: 800, mt: 0.35}}>{value}</Typography>
    </Box>
  );
}

function LegendItem({color, label}: {color: string; label: string}) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: color}} />
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
    </Stack>
  );
}

function HeaderGroupCell({
  label,
  span,
  tone,
  separatorBefore = false,
}: {
  label: string;
  span: number;
  tone?: 'blue';
  separatorBefore?: boolean;
}) {
  return (
    <Box
      sx={{
        gridColumn: `span ${span}`,
        px: 0.75,
        py: 1,
        borderLeft: separatorBefore ? '2px solid #BFD5FF' : 'none',
        borderRight: '1px solid #E6ECF5',
        borderBottom: '1px solid #E6ECF5',
        textAlign: 'center',
        bgcolor: tone === 'blue' ? '#F5FAFF' : '#FFFFFF',
      }}
    >
      <Typography sx={{fontSize: 12, fontWeight: 800, color: tone === 'blue' ? '#1f63ea' : '#1F2366'}}>
        {label}
      </Typography>
    </Box>
  );
}

function HeaderCell({
  label,
  center = false,
  compact = false,
  tone,
  helper,
  separatorBefore = false,
}: {
  label: string;
  center?: boolean;
  compact?: boolean;
  tone?: 'blue';
  helper?: string;
  separatorBefore?: boolean;
}) {
  return (
    <Box sx={{px: 0.75, py: compact ? 0.75 : 1.15, borderLeft: separatorBefore ? '2px solid #BFD5FF' : 'none', borderRight: '1px solid #EDF1F7', textAlign: center ? 'center' : 'left', bgcolor: tone === 'blue' ? '#F5FAFF' : '#FFFFFF'}}>
      <Typography sx={{fontSize: compact ? 11 : 12, fontWeight: 800, color: tone === 'blue' ? '#1f63ea' : '#1F2366'}}>
        {label}
      </Typography>
      {helper ? (
        <Typography sx={{fontSize: 9.5, fontWeight: 700, color: 'var(--planning-text-muted)', mt: 0.15}}>
          {helper}
        </Typography>
      ) : null}
    </Box>
  );
}

const miniActionSx = {
  textTransform: 'none',
  fontWeight: 700,
  borderRadius: 2,
  color: '#1f63ea',
  borderColor: '#D8E2F0',
  bgcolor: 'var(--planning-surface)',
};

const headerActionSx = {
  textTransform: 'none',
  borderRadius: 2.5,
  px: 1.6,
  py: 0.95,
  fontWeight: 800,
  fontSize: 12,
  borderColor: '#D8E2F0',
  color: 'var(--planning-text-primary)',
};

function filterFieldSx(width: number) {
  return {
    width,
    '& .MuiOutlinedInput-root': {
      borderRadius: 2.5,
      bgcolor: 'var(--planning-surface)',
      fontSize: 13,
    },
  } as const;
}

const sidebarCardSx = {
  border: '1px solid #D8E2F0',
  borderRadius: 4,
  bgcolor: 'var(--planning-surface)',
  boxShadow: planningTokens.softShadow,
  p: 2,
};

const sidebarTitleSx = {
  fontSize: 14,
  fontWeight: 800,
  color: '#0F172A',
  mb: 1.5,
};

const bottomCardSx = {
  border: '1px solid #D8E2F0',
  borderRadius: 4,
  bgcolor: 'var(--planning-surface)',
  boxShadow: planningTokens.softShadow,
  p: 2,
  minWidth: 0,
};

const bottomTitleSx = {
  fontSize: 14,
  fontWeight: 800,
  color: '#0F172A',
};
