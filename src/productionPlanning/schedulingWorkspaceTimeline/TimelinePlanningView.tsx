import {Fragment, useMemo, useState} from 'react';
import {
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  ArrowDropDown as ArrowDropDownIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowRight as ArrowRightIcon,
  ErrorOutline as ErrorOutlineIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  collapseAllLines,
  expandAllLines,
  buildTimelineRows,
  calculateLineMachineCount,
  getMachineRiskSummary,
  getMachineWorkOrders,
  getMachinesForLine,
  mapMachineStatusToBadgeVariant,
  toggleExpandedLine,
} from './schedulingMachineDrilldownUtils';
import {
  defaultSelectedEventTypes,
  demoTimelineLines,
  timelineCategoryConfig,
  timelineMockDataNote,
  timelineShortcutOptions,
} from './mock';
import type {
  MachineWorkOrder,
  ProductionMachine,
  ScheduledWorkOrder,
  SchedulingTimelineLine,
  SelectedEventTypesState,
  TimelineCategoryConfig,
  TimelineDateRange,
  TimelineEvent,
  TimelineFiltersState,
  TimelineLineLoadSummaryItem,
  TimelineRow,
  TimelineSelection,
  TimelineSelectionSummary,
  TimelineShortcut,
} from './types';
import {
  assignTimelineStackLanes,
  buildLineLoadSummary,
  calculateEventBarPosition,
  calculateWorkOrderBarPosition,
  defaultTimelineFilters,
  detectTimelineConflicts,
  filterTimelineItems,
  formatTimelineDayLabel,
  generateTimelineDayGroups,
  generateTimelineHourColumns,
  getCategorySelectionState,
  getDateRangeFromShortcut,
  setAllEventTypesSelection,
  setCategoryEventTypesSelection,
  shiftTimelineRange,
  summarizeSelectedEventTypes,
  TIMELINE_HOUR_CELL_WIDTH,
  toggleSingleEventTypeSelection,
} from './utils';

const stickyLeftWidth = 260;

function workOrderColor(status: ScheduledWorkOrder['status']) {
  if (status === 'Running') {
    return '#2563EB';
  }
  if (status === 'Released') {
    return '#3B82F6';
  }
  if (status === 'Ready') {
    return '#60A5FA';
  }
  if (status === 'Completed') {
    return '#94A3B8';
  }
  if (status === 'Blocked') {
    return '#FCA5A5';
  }
  if (status === 'Paused') {
    return '#FDBA74';
  }
  return '#BFDBFE';
}

function eventColor(category: string, categoryConfig: TimelineCategoryConfig[]) {
  return categoryConfig.find((item) => item.name === category)?.color ?? '#CBD5E1';
}

export type SchedulingTimelineToolbarProps = {
  lines: SchedulingTimelineLine[];
  machines?: ProductionMachine[];
  dateRange: TimelineDateRange;
  onDateRangeChange: (value: TimelineDateRange) => void;
  filters: TimelineFiltersState;
  onFiltersChange: (value: TimelineFiltersState) => void;
  categoryConfig?: TimelineCategoryConfig[];
  selectedEventTypes: SelectedEventTypesState;
  onSelectedEventTypesChange: (value: SelectedEventTypesState) => void;
  showMachineDrilldown?: boolean;
  onShowMachineDrilldownChange?: (value: boolean) => void;
  expandedLineIds?: string[];
  onExpandedLineIdsChange?: (value: string[]) => void;
};

function EventCategoryFilterPanel({
  categoryConfig,
  selectedEventTypes,
  onSelectedEventTypesChange,
}: {
  categoryConfig: TimelineCategoryConfig[];
  selectedEventTypes: SelectedEventTypesState;
  onSelectedEventTypesChange: (value: SelectedEventTypesState) => void;
}) {
  const [panelExpanded, setPanelExpanded] = useState(true);
  const selectionSummary = useMemo(() => summarizeSelectedEventTypes(categoryConfig, selectedEventTypes), [categoryConfig, selectedEventTypes]);

  return (
    <Paper elevation={0} sx={{borderRadius: 2.8, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)', overflow: 'hidden'}}>
      <Stack spacing={0}>
        <Stack
          direction={{xs: 'column', lg: 'row'}}
          spacing={1}
          sx={{
            justifyContent: 'space-between',
            alignItems: {lg: 'center'},
            px: 1.4,
            py: 1.2,
            bgcolor: 'var(--planning-surface-muted)',
            borderBottom: panelExpanded ? '1px solid #E2E8F0' : 'none',
          }}
        >
          <Stack direction="row" spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap', rowGap: 0.8}}>
            <Button
              size="small"
              onClick={() => setPanelExpanded((current) => !current)}
              startIcon={panelExpanded ? <ArrowDropDownIcon fontSize="small" /> : <ArrowRightIcon fontSize="small" />}
              sx={{textTransform: 'none', fontWeight: 900, color: '#0F172A', px: 0.8}}
            >
              Event categories
            </Button>
            <Stack direction="row" spacing={0.5} sx={{alignItems: 'center'}}>
              <Checkbox
                checked={selectionSummary.allSelected}
                indeterminate={selectionSummary.someSelected}
                onChange={() => onSelectedEventTypesChange(setAllEventTypesSelection(categoryConfig, !selectionSummary.allSelected))}
                size="small"
              />
              <Typography sx={{fontSize: 12.8, color: '#0F172A', fontWeight: 800}}>All categories</Typography>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap', rowGap: 0.8}}>
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 700}}>
              {selectionSummary.totalSelectedCount}/{selectionSummary.totalEventTypeCount} selected
            </Typography>
            <Button size="small" onClick={() => onSelectedEventTypesChange(setAllEventTypesSelection(categoryConfig, false))} sx={{textTransform: 'none', fontWeight: 800}}>
              Clear All
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => setPanelExpanded(false)}
              sx={{textTransform: 'none', fontWeight: 800, bgcolor: '#2563EB', '&:hover': {bgcolor: '#1D4ED8'}}}
            >
              Apply Filters
            </Button>
          </Stack>
        </Stack>

        <Collapse in={panelExpanded}>
          <Box sx={{p: 1.2}}>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))'}, gap: 1}}>
              {categoryConfig.map((category) => {
                const categoryState = getCategorySelectionState(category.name, selectionSummary);
                return (
                  <Paper
                    key={category.name}
                    elevation={0}
                    sx={{
                      p: 1.1,
                      borderRadius: 2.2,
                      border: '1px solid var(--planning-border)',
                      bgcolor: categoryState.noneSelected ? '#FFFFFF' : '#FCFCFD',
                    }}
                  >
                    <Stack direction="row" spacing={0.4} sx={{alignItems: 'flex-start', justifyContent: 'space-between'}}>
                      <Stack direction="row" spacing={0.6} sx={{alignItems: 'center', minWidth: 0, pr: 0.4}}>
                        <Checkbox
                          size="small"
                          checked={categoryState.allSelected}
                          indeterminate={categoryState.someSelected}
                          onChange={() => onSelectedEventTypesChange(setCategoryEventTypesSelection(selectedEventTypes, category, !categoryState.allSelected))}
                        />
                        <Box sx={{width: 10, height: 10, mt: 0.5, borderRadius: 999, bgcolor: category.color, flexShrink: 0}} />
                        <Box sx={{minWidth: 0}}>
                          <Typography sx={{fontSize: 12.7, color: '#0F172A', fontWeight: 800, lineHeight: 1.2}}>{category.name}</Typography>
                          <Typography sx={{fontSize: 11.3, color: 'var(--planning-text-secondary)', fontWeight: 700, mt: 0.25}}>
                            {selectionSummary.selectedCountByCategory[category.name]}/{selectionSummary.totalCountByCategory[category.name]} selected
                          </Typography>
                        </Box>
                      </Stack>
                      <Button
                        size="small"
                        onClick={() => onSelectedEventTypesChange(setCategoryEventTypesSelection(selectedEventTypes, category, true))}
                        sx={{minWidth: 0, px: 0.6, textTransform: 'none', fontSize: 11.2, fontWeight: 800}}
                      >
                        All
                      </Button>
                    </Stack>

                    <Divider sx={{my: 0.8}} />

                    <Stack spacing={0.15}>
                      {category.eventTypes.map((eventType) => (
                        <Stack key={eventType} direction="row" spacing={0.45} sx={{alignItems: 'flex-start', minWidth: 0}}>
                          <Checkbox
                            size="small"
                            checked={selectedEventTypes[category.name]?.[eventType] ?? false}
                            onChange={() => onSelectedEventTypesChange(toggleSingleEventTypeSelection(selectedEventTypes, category.name, eventType))}
                            sx={{py: 0.2}}
                          />
                          <Typography sx={{fontSize: 11.75, color: 'var(--planning-text-secondary)', lineHeight: 1.35, pt: 0.75}}>
                            {eventType}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        </Collapse>
      </Stack>
    </Paper>
  );
}

export function SchedulingTimelineToolbar({
  lines,
  machines = [],
  dateRange,
  onDateRangeChange,
  filters,
  onFiltersChange,
  categoryConfig = timelineCategoryConfig,
  selectedEventTypes,
  onSelectedEventTypesChange,
  showMachineDrilldown = true,
  onShowMachineDrilldownChange,
  expandedLineIds = [],
  onExpandedLineIdsChange,
}: SchedulingTimelineToolbarProps) {
  const updateShortcut = (shortcut: TimelineShortcut) => {
    onDateRangeChange(getDateRangeFromShortcut(shortcut));
  };

  return (
    <Paper elevation={0} sx={{p: 1.6, borderRadius: 3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
      <Stack spacing={1.4}>
        <Stack direction={{xs: 'column', xl: 'row'}} spacing={1} sx={{justifyContent: 'space-between', alignItems: {xl: 'center'}}}>
          <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
            <Button size="small" variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => onDateRangeChange(shiftTimelineRange(dateRange, -1))} sx={{textTransform: 'none', fontWeight: 800}}>
              Previous Range
            </Button>
            <Button size="small" variant="outlined" startIcon={<AccessTimeIcon />} onClick={() => updateShortcut('Today')} sx={{textTransform: 'none', fontWeight: 800}}>
              Today
            </Button>
            <Button size="small" variant="outlined" endIcon={<ArrowForwardIcon />} onClick={() => onDateRangeChange(shiftTimelineRange(dateRange, 1))} sx={{textTransform: 'none', fontWeight: 800}}>
              Next Range
            </Button>
            {timelineShortcutOptions.map((item) => (
              <Button
                key={item.id}
                size="small"
                variant={dateRange.shortcut === item.id ? 'contained' : 'outlined'}
                onClick={() => updateShortcut(item.id)}
                sx={{textTransform: 'none', fontWeight: 800, bgcolor: dateRange.shortcut === item.id ? '#2563EB' : undefined, '&:hover': {bgcolor: dateRange.shortcut === item.id ? '#1D4ED8' : undefined}}}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 700}}>
            {formatTimelineDayLabel(dateRange.startDate)} to {formatTimelineDayLabel(dateRange.endDate)}
          </Typography>
        </Stack>

        <Stack direction={{xs: 'column', xl: 'row'}} spacing={1} sx={{justifyContent: 'space-between', alignItems: {xl: 'center'}}}>
          <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
            <Button
              size="small"
              variant="text"
              disabled={!onExpandedLineIdsChange}
              onClick={() => onExpandedLineIdsChange?.(expandAllLines(lines))}
              sx={{textTransform: 'none', fontWeight: 800}}
            >
              Expand All Lines
            </Button>
            <Button
              size="small"
              variant="text"
              disabled={!onExpandedLineIdsChange}
              onClick={() => onExpandedLineIdsChange?.(collapseAllLines())}
              sx={{textTransform: 'none', fontWeight: 800}}
            >
              Collapse All Lines
            </Button>
            <Chip
              clickable
              label={showMachineDrilldown ? 'Show Machine Drilldown' : 'Machine Drilldown Hidden'}
              color={showMachineDrilldown ? 'primary' : 'default'}
              onClick={() => onShowMachineDrilldownChange?.(!showMachineDrilldown)}
              sx={{fontWeight: 800}}
            />
          </Stack>
          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 700}}>
            {expandedLineIds.length} expanded · {machines.length} machines available
          </Typography>
        </Stack>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(8, minmax(0, 1fr))'}, gap: 1}}>
          <TextField
            label="Start date"
            type="date"
            size="small"
            value={dateRange.startDate}
            onChange={(event) => onDateRangeChange({...dateRange, startDate: event.target.value, shortcut: 'Custom'})}
            InputLabelProps={{shrink: true}}
          />
          <TextField
            label="End date"
            type="date"
            size="small"
            value={dateRange.endDate}
            onChange={(event) => onDateRangeChange({...dateRange, endDate: event.target.value, shortcut: 'Custom'})}
            InputLabelProps={{shrink: true}}
          />
          <TextField select label="Line" size="small" value={filters.lineId} onChange={(event) => onFiltersChange({...filters, lineId: event.target.value})}>
            <MenuItem value="all">All lines</MenuItem>
            {lines.map((line) => (
              <MenuItem key={line.id} value={line.id}>{line.name}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Status" size="small" value={filters.status} onChange={(event) => onFiltersChange({...filters, status: event.target.value})}>
            <MenuItem value="all">All statuses</MenuItem>
            {['Planned', 'Ready', 'Released', 'Running', 'Completed', 'Blocked', 'Paused', 'Warning', 'On Hold', 'Cancelled'].map((status) => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Priority" size="small" value={filters.priority} onChange={(event) => onFiltersChange({...filters, priority: event.target.value})}>
            <MenuItem value="all">All priorities</MenuItem>
            {['Low', 'Medium', 'High', 'Critical'].map((priority) => (
              <MenuItem key={priority} value={priority}>{priority}</MenuItem>
            ))}
          </TextField>
          <TextField select label="Impact" size="small" value={filters.impact} onChange={(event) => onFiltersChange({...filters, impact: event.target.value})}>
            <MenuItem value="all">All impacts</MenuItem>
            {['Info', 'Warning', 'Blocker'].map((impact) => (
              <MenuItem key={impact} value={impact}>{impact}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Product search"
            size="small"
            value={filters.productSearch}
            onChange={(event) => onFiltersChange({...filters, productSearch: event.target.value})}
            placeholder="WO, category, event type"
          />
          <Stack direction="row" spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap', rowGap: 1}}>
            <Chip
              clickable
              label="Show conflicts only"
              color={filters.showConflictsOnly ? 'error' : 'default'}
              onClick={() => onFiltersChange({...filters, showConflictsOnly: !filters.showConflictsOnly})}
            />
            <Chip
              clickable
              label="Show exceptions only"
              color={filters.showExceptionsOnly ? 'warning' : 'default'}
              onClick={() => onFiltersChange({...filters, showExceptionsOnly: !filters.showExceptionsOnly})}
            />
            <Button size="small" onClick={() => onFiltersChange(defaultTimelineFilters)} sx={{textTransform: 'none', fontWeight: 800}}>
              Reset
            </Button>
          </Stack>
        </Box>

        <EventCategoryFilterPanel
          categoryConfig={categoryConfig}
          selectedEventTypes={selectedEventTypes}
          onSelectedEventTypesChange={onSelectedEventTypesChange}
        />
      </Stack>
    </Paper>
  );
}

export type TimelineLegendProps = {
  compact?: boolean;
  categoryConfig?: TimelineCategoryConfig[];
  selectedEventTypes: SelectedEventTypesState;
  onSelectedEventTypesChange: (value: SelectedEventTypesState) => void;
};

export function TimelineLegend({
  compact = false,
  categoryConfig = timelineCategoryConfig,
  selectedEventTypes,
  onSelectedEventTypesChange,
}: TimelineLegendProps) {
  const selectionSummary = useMemo(() => summarizeSelectedEventTypes(categoryConfig, selectedEventTypes), [categoryConfig, selectedEventTypes]);
  return (
    <Paper elevation={0} sx={{p: compact ? 1.2 : 1.6, borderRadius: 3, border: '1px solid var(--planning-border)'}} data-testid="timeline-legend">
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em'}}>Legend</Typography>
      <Typography sx={{fontSize: 11.8, color: 'var(--planning-text-secondary)', mt: 0.6}}>{timelineMockDataNote}</Typography>
      <Stack direction="row" spacing={1} sx={{mt: 1, flexWrap: 'wrap', rowGap: 1}}>
        {categoryConfig.map((category) => {
          const categoryState = getCategorySelectionState(category.name, selectionSummary);
          return (
            <Chip
              key={category.name}
              clickable
              label={`${category.name} ${selectionSummary.selectedCountByCategory[category.name]}/${selectionSummary.totalCountByCategory[category.name]}`}
              onClick={() => onSelectedEventTypesChange(setCategoryEventTypesSelection(selectedEventTypes, category, !categoryState.allSelected))}
              sx={{
                borderRadius: 999,
                border: `1px solid ${category.color}`,
                bgcolor: categoryState.noneSelected ? '#FFFFFF' : `color-mix(in srgb, ${category.color} 13%, transparent)`,
                color: '#0F172A',
                fontWeight: 800,
                opacity: categoryState.noneSelected ? 0.72 : 1,
              }}
            />
          );
        })}
      </Stack>
    </Paper>
  );
}

export type TimelineLineLoadSummaryProps = {
  lines: SchedulingTimelineLine[];
  summary: TimelineLineLoadSummaryItem[];
};

export function TimelineLineLoadSummary({lines, summary}: TimelineLineLoadSummaryProps) {
  const totals = summary.reduce(
    (accumulator, item) => ({
      plannedHours: accumulator.plannedHours + item.plannedHours,
      availableHours: accumulator.availableHours + item.availableHours,
      conflicts: accumulator.conflicts + item.conflictCount,
      exceptions: accumulator.exceptions + item.exceptionCount,
    }),
    {plannedHours: 0, availableHours: 0, conflicts: 0, exceptions: 0},
  );
  const utilization = totals.availableHours > 0 ? Number(((totals.plannedHours / totals.availableHours) * 100).toFixed(1)) : 0;

  return (
    <Paper elevation={0} sx={{p: 1.6, borderRadius: 3, border: '1px solid var(--planning-border)'}}>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em'}}>Line Load Summary</Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))'}, gap: 1, mt: 1.1}}>
        {[
          {label: 'Lines in scope', value: String(lines.length)},
          {label: 'Total planned hours', value: String(totals.plannedHours)},
          {label: 'Available hours', value: String(totals.availableHours)},
          {label: 'Utilization', value: `${utilization}%`},
          {label: 'Conflicts / Exceptions', value: `${totals.conflicts} / ${totals.exceptions}`},
        ].map((item) => (
          <Paper key={item.label} elevation={0} sx={{p: 1.1, borderRadius: 2.2, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
            <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{item.label}</Typography>
            <Typography sx={{fontSize: 20, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 0.4}}>{item.value}</Typography>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
}

export type TimelineDetailsPanelProps = {
  selectedItem: ScheduledWorkOrder | TimelineEvent | ProductionMachine | null;
  selectedKind: 'workOrder' | 'event' | 'machine' | null;
  lines?: SchedulingTimelineLine[];
};

export function TimelineDetailsPanel({selectedItem, selectedKind, lines = demoTimelineLines}: TimelineDetailsPanelProps) {
  if (!selectedItem || !selectedKind) {
    return (
      <Paper elevation={0} sx={{p: 1.8, borderRadius: 3, border: '1px dashed #CBD5E1', bgcolor: 'var(--planning-surface)'}}>
        <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 800}}>Select a work order or event to inspect details.</Typography>
      </Paper>
    );
  }

  const lineName = lines.find((line) => line.id === selectedItem.lineId)?.name ?? selectedItem.lineId;

  return (
    <Paper elevation={0} sx={{p: 1.8, borderRadius: 3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}} data-testid="timeline-details-panel">
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em'}}>
        {selectedKind === 'workOrder' ? 'Selected Work Order' : selectedKind === 'machine' ? 'Selected Machine' : 'Selected Event'}
      </Typography>
      {selectedKind === 'workOrder' ? (
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1, mt: 1.2}}>
          <DetailField label="WO number" value={(selectedItem as ScheduledWorkOrder).woNumber} />
          <DetailField label="Product" value={`${(selectedItem as ScheduledWorkOrder).productCode} - ${(selectedItem as ScheduledWorkOrder).productDescription}`} />
          <DetailField label="Quantity" value={`${(selectedItem as ScheduledWorkOrder).quantity} ${(selectedItem as ScheduledWorkOrder).uom}`} />
          <DetailField label="Line" value={lineName} />
          <DetailField label="Machine" value={(selectedItem as ScheduledWorkOrder).machineName || 'Line-level schedule'} />
          <DetailField label="Planned start" value={(selectedItem as ScheduledWorkOrder).plannedStartDateTime} />
          <DetailField label="Planned end" value={(selectedItem as ScheduledWorkOrder).plannedEndDateTime} />
          <DetailField label="Duration" value={`${(selectedItem as ScheduledWorkOrder).durationHours} h`} />
          <DetailField label="Status" value={(selectedItem as ScheduledWorkOrder).status} />
          <DetailField label="Readiness" value={(selectedItem as ScheduledWorkOrder).readinessStatus} />
          <DetailField label="Priority" value={(selectedItem as ScheduledWorkOrder).priority} />
          <DetailField label="Operation" value={(selectedItem as ScheduledWorkOrder).operationName || 'N/A'} />
          <DetailField label="Progress" value={typeof (selectedItem as ScheduledWorkOrder).progressPercent === 'number' ? `${(selectedItem as ScheduledWorkOrder).progressPercent}%` : 'N/A'} />
          <DetailField label="Exceptions" value={String((selectedItem as ScheduledWorkOrder).exceptionCount)} />
          <DetailField label="Notes" value={(selectedItem as ScheduledWorkOrder).plannerComment || 'No notes'} />
        </Box>
      ) : selectedKind === 'machine' ? (
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1, mt: 1.2}}>
          <DetailField label="Machine" value={(selectedItem as ProductionMachine).name} />
          <DetailField label="Parent line" value={lineName} />
          <DetailField label="Type" value={(selectedItem as ProductionMachine).machineType} />
          <DetailField label="Status" value={(selectedItem as ProductionMachine).status} />
          <DetailField label="Utilization" value={`${(selectedItem as ProductionMachine).utilizationPercent}%`} />
          <DetailField label="Current WO" value={(selectedItem as ProductionMachine).currentWorkOrderId || 'No current WO'} />
          <DetailField label="Risk level" value={(selectedItem as ProductionMachine).riskLevel} />
          <DetailField label="Risk reason" value={(selectedItem as ProductionMachine).riskReason || 'No active risk'} />
          <DetailField label="Capacity rate" value={`${(selectedItem as ProductionMachine).capacityRatePerHour.toLocaleString()} units / hour`} />
          <DetailField label="Notes" value={(selectedItem as ProductionMachine).notes || 'No notes'} />
        </Box>
      ) : (
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1, mt: 1.2}}>
          <DetailField label="Category" value={(selectedItem as TimelineEvent).category} />
          <DetailField label="Event type" value={(selectedItem as TimelineEvent).eventType} />
          <DetailField label="Line" value={lineName} />
          <DetailField label="Start" value={(selectedItem as TimelineEvent).startDateTime} />
          <DetailField label="End" value={(selectedItem as TimelineEvent).endDateTime} />
          <DetailField label="Status" value={(selectedItem as TimelineEvent).status} />
          <DetailField label="Severity" value={(selectedItem as TimelineEvent).severity} />
          <DetailField label="Source" value={(selectedItem as TimelineEvent).source} />
          <DetailField label="Reason code" value={(selectedItem as TimelineEvent).reasonCode} />
          <DetailField label="Impacted WO" value={(selectedItem as TimelineEvent).workOrderId || 'N/A'} />
          <DetailField label="Description" value={(selectedItem as TimelineEvent).description} />
          <DetailField label="Recommended actions" value={(selectedItem as TimelineEvent).recommendedActions.join(' | ')} />
        </Box>
      )}
    </Paper>
  );
}

function DetailField({label, value}: {label: string; value: string}) {
  return (
    <Paper elevation={0} sx={{p: 1.1, borderRadius: 2.2, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
      <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{label}</Typography>
      <Typography sx={{fontSize: 13.5, color: '#1F2937', fontWeight: 700, mt: 0.3}}>{value}</Typography>
    </Paper>
  );
}

export type TimelinePlanningViewProps = {
  lines: SchedulingTimelineLine[];
  workOrders: ScheduledWorkOrder[];
  events: TimelineEvent[];
  machines?: ProductionMachine[];
  machineWorkOrders?: MachineWorkOrder[];
  machineEvents?: TimelineEvent[];
  dateRange: TimelineDateRange;
  filters: TimelineFiltersState;
  selectedItem: TimelineSelection;
  onSelectItem: (value: TimelineSelection) => void;
  categoryConfig?: TimelineCategoryConfig[];
  selectedEventTypes: SelectedEventTypesState;
  expandedLineIds?: string[];
  onExpandedLineIdsChange?: (value: string[]) => void;
  showMachineDrilldown?: boolean;
};

export default function TimelinePlanningView({
  lines,
  workOrders,
  events,
  machines = [],
  machineWorkOrders = [],
  machineEvents = [],
  dateRange,
  filters,
  selectedItem,
  onSelectItem,
  categoryConfig = timelineCategoryConfig,
  selectedEventTypes = defaultSelectedEventTypes,
  expandedLineIds = [],
  onExpandedLineIdsChange,
  showMachineDrilldown = true,
}: TimelinePlanningViewProps) {
  const hourColumns = useMemo(() => generateTimelineHourColumns(dateRange.startDate, dateRange.endDate), [dateRange.endDate, dateRange.startDate]);
  const dayGroups = useMemo(() => generateTimelineDayGroups(hourColumns), [hourColumns]);
  const combinedWorkOrders = useMemo(() => [...workOrders, ...machineWorkOrders], [machineWorkOrders, workOrders]);
  const combinedEvents = useMemo(() => [...events, ...machineEvents], [events, machineEvents]);
  const visibleWorkOrders = useMemo(
    () => combinedWorkOrders.filter((item) => calculateWorkOrderBarPosition(item, hourColumns).visible),
    [combinedWorkOrders, hourColumns],
  );
  const visibleEvents = useMemo(
    () => combinedEvents.filter((item) => calculateEventBarPosition(item, hourColumns).visible),
    [combinedEvents, hourColumns],
  );
  const conflicts = useMemo(() => detectTimelineConflicts(visibleWorkOrders, visibleEvents), [visibleEvents, visibleWorkOrders]);
  const filteredItems = useMemo(
    () => filterTimelineItems(visibleWorkOrders, visibleEvents, filters, conflicts, selectedEventTypes),
    [conflicts, filters, selectedEventTypes, visibleEvents, visibleWorkOrders],
  );
  const lineSummary = useMemo(() => buildLineLoadSummary(lines, filteredItems.workOrders, filteredItems.events, dateRange, conflicts), [conflicts, dateRange, filteredItems.events, filteredItems.workOrders, lines]);
  const timelineWidth = hourColumns.length * TIMELINE_HOUR_CELL_WIDTH;
  const hierarchySearch = filters.productSearch.trim().toLowerCase();
  const filteredLineIds = new Set([
    ...filteredItems.workOrders.map((item) => item.lineId),
    ...filteredItems.events.map((item) => item.lineId),
  ]);
  const visibleLines = lines.filter((line) => {
    if (filters.lineId !== 'all') {
      return line.id === filters.lineId;
    }
    if (hierarchySearch) {
      if (`${line.name} ${line.area} ${line.currentWorkOrderId ?? ''}`.toLowerCase().includes(hierarchySearch)) {
        return true;
      }
      const lineMachines = getMachinesForLine(line.id, machines);
      if (lineMachines.some((machine) => `${machine.name} ${machine.machineType} ${machine.description}`.toLowerCase().includes(hierarchySearch))) {
        return true;
      }
    }
    return filteredLineIds.size === 0 ? true : filteredLineIds.has(line.id);
  });
  const visibleRows = useMemo(
    () =>
      buildTimelineRows(
        visibleLines.map((line) => ({
          ...line,
          machineCount: line.machineCount ?? calculateLineMachineCount(line.id, machines),
        })),
        machines.filter((machine) => visibleLines.some((line) => line.id === machine.lineId)),
        expandedLineIds,
        showMachineDrilldown,
      ),
    [expandedLineIds, machines, showMachineDrilldown, visibleLines],
  );

  const renderStatusChip = (label: string, tone: 'success' | 'warning' | 'error' | 'default' | 'primary') => {
    const palette =
      tone === 'success'
        ? {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'}
        : tone === 'warning'
          ? {bg: '#FFF7ED', color: '#C2410C', border: '#FDBA74'}
          : tone === 'error'
            ? {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'}
            : tone === 'primary'
              ? {bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE'}
              : {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#E2E8F0'};
    return <Chip size="small" label={label} sx={{height: 22, fontWeight: 800, bgcolor: palette.bg, color: palette.color, border: `1px solid ${palette.border}`}} />;
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.4}}>
      <Box data-testid="timeline-grid">
        <Box
          data-testid="timeline-scroll-container"
          sx={{
            overflow: 'auto',
            borderRadius: 3,
            border: '1px solid var(--planning-border)',
            bgcolor: 'var(--planning-surface)',
            maxHeight: 680,
          }}
        >
          <Box sx={{minWidth: stickyLeftWidth + timelineWidth}}>
            <Box sx={{position: 'sticky', top: 0, zIndex: 5, bgcolor: 'var(--planning-surface)', boxShadow: '0 1px 0 rgba(15, 23, 42, 0.06)'}}>
              <Box sx={{display: 'flex'}}>
                <Box sx={{position: 'sticky', left: 0, zIndex: 6, width: stickyLeftWidth, minWidth: stickyLeftWidth, p: 1.4, borderRight: '1px solid #E2E8F0', bgcolor: 'var(--planning-surface-muted)'}}>
                  <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em'}}>Line / Machine</Typography>
                </Box>
                <Box sx={{width: timelineWidth}}>
                  <Box sx={{display: 'flex', borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
                    {dayGroups.map((group) => (
                      <Box
                        key={group.id}
                        data-testid="timeline-day-group-header"
                        sx={{width: group.columnSpan * TIMELINE_HOUR_CELL_WIDTH, minWidth: group.columnSpan * TIMELINE_HOUR_CELL_WIDTH, p: 1, borderRight: '1px solid #E2E8F0'}}
                      >
                        <Typography sx={{fontSize: 12, color: '#0F172A', fontWeight: 800}}>{group.dayLabel}</Typography>
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{display: 'flex', bgcolor: 'var(--planning-surface)'}}>
                    {hourColumns.map((column) => (
                      <Box
                        key={column.id}
                        data-testid="timeline-hour-header"
                        sx={{width: TIMELINE_HOUR_CELL_WIDTH, minWidth: TIMELINE_HOUR_CELL_WIDTH, py: 0.75, textAlign: 'center', borderRight: '1px solid #EEF2F7', borderBottom: '1px solid var(--planning-border)'}}
                      >
                        <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', fontWeight: 700}}>{column.hourLabel}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>

            {visibleRows.map((row) => {
              const isLineRow = row.rowType === 'Line';
              const line = isLineRow ? (row.dataRef as SchedulingTimelineLine) : lines.find((item) => item.id === row.parentLineId);
              const machine = !isLineRow ? (row.dataRef as ProductionMachine) : null;
              const summary = isLineRow ? lineSummary.find((item) => item.lineId === row.parentLineId) : null;
              const rowWorkOrders = isLineRow
                ? filteredItems.workOrders.filter((item) => item.lineId === row.parentLineId && !item.machineId)
                : filteredItems.workOrders.filter((item) => item.machineId === machine?.id);
              const rowEvents = isLineRow
                ? filteredItems.events.filter((item) => item.lineId === row.parentLineId && !item.machineId)
                : filteredItems.events.filter((item) => item.machineId === machine?.id);
              const eventLaneMap = assignTimelineStackLanes(rowEvents);
              const workOrderLaneMap = assignTimelineStackLanes(
                rowWorkOrders.map((item) => ({
                  id: item.id,
                  startDateTime: item.plannedStartDateTime,
                  endDateTime: item.plannedEndDateTime,
                })),
              );
              const eventLaneCount = Math.max(1, ...Object.values(eventLaneMap).map((item) => item.laneIndex + 1), rowEvents.length ? 1 : 0);
              const workOrderLaneCount = Math.max(1, ...Object.values(workOrderLaneMap).map((item) => item.laneIndex + 1), rowWorkOrders.length ? 1 : 0);
              const rowHeight = Math.max(isLineRow ? 88 : 74, 18 + eventLaneCount * 18 + workOrderLaneCount * (isLineRow ? 42 : 36) + 18);
              const statusTone = isLineRow
                ? row.status === 'Running'
                  ? 'success'
                  : row.status === 'AtRisk' || row.status === 'Overloaded'
                    ? 'warning'
                    : row.status === 'Down'
                      ? 'error'
                      : 'default'
                : mapMachineStatusToBadgeVariant(machine?.status ?? 'Idle');

              return (
                <Box key={row.id} sx={{display: 'flex', minHeight: rowHeight, borderTop: '1px solid #EEF2F7'}}>
                  <Box
                    sx={{
                      position: 'sticky',
                      left: 0,
                      zIndex: 4,
                      width: stickyLeftWidth,
                      minWidth: stickyLeftWidth,
                      p: 1.2,
                      borderRight: '1px solid #E2E8F0',
                      bgcolor: isLineRow ? '#FFFFFF' : '#FCFCFD',
                      borderLeft: isLineRow ? 'none' : '3px solid #D8B4FE',
                    }}
                  >
                    {isLineRow ? (
                      <Stack direction="row" spacing={0.8} sx={{alignItems: 'flex-start'}}>
                        <Button
                          size="small"
                          aria-label={row.isExpanded ? `Collapse ${line?.name} machines` : `Expand ${line?.name} machines`}
                          onClick={() => onExpandedLineIdsChange?.(toggleExpandedLine(expandedLineIds, row.parentLineId))}
                          sx={{minWidth: 28, width: 28, height: 28, p: 0, color: '#0F172A'}}
                        >
                          {row.isExpanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
                        </Button>
                        <Box sx={{minWidth: 0}}>
                          <Typography sx={{fontSize: 13.4, color: '#0F172A', fontWeight: 900}}>{line?.name}</Typography>
                          <Typography sx={{fontSize: 12.2, color: 'var(--planning-text-secondary)', mt: 0.35}}>{line?.area}</Typography>
                          <Typography sx={{fontSize: 11.8, color: 'var(--planning-text-secondary)', mt: 0.55}}>Current / Next WO: {line?.currentWorkOrderId || rowWorkOrders[0]?.woNumber || 'No WO'}</Typography>
                          <Stack direction="row" spacing={0.6} sx={{mt: 0.9, flexWrap: 'wrap', rowGap: 0.6}}>
                            {renderStatusChip(line?.status ?? row.status, statusTone)}
                            {renderStatusChip(`${summary?.utilizationPercent ?? line?.utilizationPercent ?? row.utilizationPercent}% util`, 'default')}
                            {renderStatusChip(`${row.machineCount} machines`, 'primary')}
                            {renderStatusChip(`Risk: ${line?.riskLevel ?? row.riskLevel}`, (line?.riskLevel ?? row.riskLevel) === 'High' || (line?.riskLevel ?? row.riskLevel) === 'Critical' ? 'error' : (line?.riskLevel ?? row.riskLevel) === 'Medium' ? 'warning' : 'default')}
                            {!!summary?.conflictCount && renderStatusChip(`${summary.conflictCount} conflicts`, 'error')}
                          </Stack>
                        </Box>
                      </Stack>
                    ) : (
                      <Stack direction="row" spacing={1} sx={{alignItems: 'flex-start', pl: 1.2}}>
                        <Button
                          size="small"
                          aria-label={`Open ${machine!.name} details for ${line?.name}`}
                          onClick={() => onSelectItem({kind: 'machine', id: machine!.id})}
                          sx={{minWidth: 28, width: 28, height: 28, p: 0, color: '#6D28D9'}}
                        >
                          <PrecisionManufacturingIcon sx={{fontSize: 18}} />
                        </Button>
                        <Box sx={{minWidth: 0}}>
                          <Typography sx={{fontSize: 12.7, color: '#0F172A', fontWeight: 900}}>{machine?.name}</Typography>
                          <Typography sx={{fontSize: 11.8, color: 'var(--planning-text-secondary)', mt: 0.25}}>{line?.name} · {machine?.machineType}</Typography>
                          <Typography sx={{fontSize: 11.6, color: 'var(--planning-text-secondary)', mt: 0.55}}>Current WO: {machine?.currentWorkOrderId || rowWorkOrders[0]?.woNumber || 'No WO'}</Typography>
                          <Stack direction="row" spacing={0.6} sx={{mt: 0.8, flexWrap: 'wrap', rowGap: 0.6}}>
                            {renderStatusChip(machine?.status ?? row.status, statusTone)}
                            {renderStatusChip(`${machine?.utilizationPercent ?? row.utilizationPercent}% util`, 'default')}
                            {renderStatusChip(`Risk: ${machine?.riskLevel ?? row.riskLevel}`, (machine?.riskLevel ?? row.riskLevel) === 'High' || (machine?.riskLevel ?? row.riskLevel) === 'Critical' ? 'error' : (machine?.riskLevel ?? row.riskLevel) === 'Medium' ? 'warning' : 'default')}
                          </Stack>
                          <Typography sx={{fontSize: 11.4, color: 'var(--planning-text-secondary)', mt: 0.55}}>{getMachineRiskSummary(machine!)}</Typography>
                        </Box>
                      </Stack>
                    )}
                  </Box>
                  <Box
                    sx={{
                      position: 'relative',
                      width: timelineWidth,
                      minWidth: timelineWidth,
                      minHeight: rowHeight,
                      backgroundColor: isLineRow ? '#FFFFFF' : '#FCFCFD',
                      backgroundImage: `repeating-linear-gradient(to right, transparent 0, transparent ${TIMELINE_HOUR_CELL_WIDTH - 1}px, #EEF2F7 ${TIMELINE_HOUR_CELL_WIDTH - 1}px, #EEF2F7 ${TIMELINE_HOUR_CELL_WIDTH}px)`,
                    }}
                  >
                    {rowEvents.map((item) => {
                      const position = calculateEventBarPosition(item, hourColumns);
                      const hasConflict = (conflicts.eventConflicts[item.id] ?? []).length > 0;
                      const laneIndex = eventLaneMap[item.id]?.laneIndex ?? 0;
                      return (
                        <Tooltip key={item.id} title={`${item.category} | ${item.eventType} | ${item.severity} | ${item.startDateTime} -> ${item.endDateTime} | ${item.description}`}>
                          <Box
                            role="button"
                            tabIndex={0}
                            onClick={() => onSelectItem({kind: 'event', id: item.id})}
                            sx={{
                              position: 'absolute',
                              top: 8 + laneIndex * 18,
                              left: position.left,
                              width: position.width,
                              minWidth: 34,
                              height: 16,
                              px: 0.5,
                              borderRadius: 999,
                              bgcolor: eventColor(item.category, categoryConfig),
                              border: hasConflict ? '1px solid #991B1B' : '1px solid rgba(15, 23, 42, 0.08)',
                              cursor: 'pointer',
                              opacity: selectedItem?.kind === 'event' && selectedItem.id === item.id ? 1 : 0.92,
                              overflow: 'hidden',
                            }}
                          >
                            <Typography sx={{fontSize: 10.2, lineHeight: '14px', color: '#0F172A', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                              {item.eventType}
                            </Typography>
                          </Box>
                        </Tooltip>
                      );
                    })}
                    {rowWorkOrders.map((item) => {
                      const position = calculateWorkOrderBarPosition(item, hourColumns);
                      const conflictMessages = conflicts.workOrderConflicts[item.id] ?? [];
                      const selected = selectedItem?.kind === 'workOrder' && selectedItem.id === item.id;
                      const laneIndex = workOrderLaneMap[item.id]?.laneIndex ?? 0;
                      const topOffset = 16 + eventLaneCount * 18 + laneIndex * (isLineRow ? 42 : 36);
                      return (
                        <Tooltip key={item.id} title={`${item.woNumber} | ${item.productCode} | ${item.quantity} ${item.uom} | ${item.plannedStartDateTime} -> ${item.plannedEndDateTime} | ${item.status}`}>
                          <Box
                            role="button"
                            tabIndex={0}
                            data-testid={`work-order-bar-${item.id}`}
                            onClick={() => onSelectItem({kind: 'workOrder', id: item.id})}
                            sx={{
                              position: 'absolute',
                              top: topOffset,
                              left: position.left,
                              width: position.width,
                              minWidth: 36,
                              height: isLineRow ? 36 : 30,
                              px: isLineRow ? 0.9 : 0.7,
                              borderRadius: 2.2,
                              bgcolor: workOrderColor(item.status),
                              color: '#0F172A',
                              border: selected ? '2px solid #1D4ED8' : conflictMessages.length > 0 ? '1px solid #DC2626' : '1px solid rgba(15, 23, 42, 0.12)',
                              boxShadow: selected ? '0 0 0 2px rgba(37, 99, 235, 0.12)' : undefined,
                              cursor: 'pointer',
                              overflow: 'hidden',
                            }}
                          >
                            <Stack direction="row" spacing={0.5} sx={{alignItems: 'center'}}>
                              {(item.priority === 'Critical' || item.priority === 'High') && <Box sx={{width: 7, height: 7, borderRadius: 999, bgcolor: item.priority === 'Critical' ? '#B91C1C' : '#EA580C'}} />}
                              <Typography sx={{fontSize: isLineRow ? 11.2 : 10.8, fontWeight: 900, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{item.woNumber}</Typography>
                              {conflictMessages.length > 0 && <ErrorOutlineIcon sx={{fontSize: 14, color: '#991B1B'}} />}
                              {!isLineRow && typeof item.progressPercent === 'number' && item.progressPercent > 0 ? (
                                <Typography sx={{fontSize: 10.2, fontWeight: 800, ml: 'auto'}}>{item.progressPercent}%</Typography>
                              ) : null}
                            </Stack>
                            <Typography sx={{fontSize: 10.5, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                              {isLineRow ? `${item.productCode}${position.width >= 150 ? ` | ${item.quantity} ${item.uom}` : ''}` : `${item.operationName}${position.width >= 150 ? ` | ${item.productCode}` : ''}`}
                            </Typography>
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export function buildSelectedTimelineItem(
  selection: TimelineSelection,
  workOrders: ScheduledWorkOrder[],
  events: TimelineEvent[],
  machines: ProductionMachine[] = [],
) {
  if (!selection) {
    return {item: null, kind: null as null | 'workOrder' | 'event' | 'machine'};
  }
  if (selection.kind === 'workOrder') {
    return {
      item: workOrders.find((item) => item.id === selection.id) ?? null,
      kind: 'workOrder' as const,
    };
  }
  if (selection.kind === 'machine') {
    return {
      item: machines.find((item) => item.id === selection.id) ?? null,
      kind: 'machine' as const,
    };
  }
  return {
    item: events.find((item) => item.id === selection.id) ?? null,
    kind: 'event' as const,
  };
}

export function buildTimelinePresentation(
  lines: SchedulingTimelineLine[],
  workOrders: ScheduledWorkOrder[],
  events: TimelineEvent[],
  dateRange: TimelineDateRange,
  filters: TimelineFiltersState,
  selectedEventTypes: SelectedEventTypesState,
) {
  const hourColumns = generateTimelineHourColumns(dateRange.startDate, dateRange.endDate);
  const visibleWorkOrders = workOrders.filter((item) => calculateWorkOrderBarPosition(item, hourColumns).visible);
  const visibleEvents = events.filter((item) => calculateEventBarPosition(item, hourColumns).visible);
  const conflicts = detectTimelineConflicts(visibleWorkOrders, visibleEvents);
  const filteredItems = filterTimelineItems(visibleWorkOrders, visibleEvents, filters, conflicts, selectedEventTypes);
  const lineSummary = buildLineLoadSummary(lines, filteredItems.workOrders, filteredItems.events, dateRange, conflicts);
  return {hourColumns, conflicts, filteredItems, lineSummary};
}
