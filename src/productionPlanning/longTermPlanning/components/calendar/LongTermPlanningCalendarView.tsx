import {MenuItem, Paper, Stack, TextField, Typography} from '@mui/material';
import {useMemo} from 'react';
import type {
  CapacityResult,
  CalendarDaySummary,
  CalendarFiltersState,
  CalendarPlanningEvent,
  CalendarViewLevel,
  LongTermPlanRowView,
} from '../../types';
import {
  filterCalendarEvents,
  getLongTermPlanningDaySummary,
  getLongTermPlanningYearSummary,
} from '../../utils';
import CalendarLegend from './CalendarLegend';
import CalendarNavigationBar from './CalendarNavigationBar';
import LongTermPlanningDayDetailsPanel from './LongTermPlanningDayDetailsPanel';
import LongTermPlanningMonthCalendar from './LongTermPlanningMonthCalendar';
import LongTermPlanningYearCalendar from './LongTermPlanningYearCalendar';

const monthFormatter = new Intl.DateTimeFormat('en-US', {month: 'long', year: 'numeric', timeZone: 'UTC'});

type LongTermPlanningCalendarViewProps = {
  rows: LongTermPlanRowView[];
  capacityResults: CapacityResult[];
  events: CalendarPlanningEvent[];
  site: string;
  viewLevel: CalendarViewLevel;
  selectedYear: number;
  selectedMonth: string;
  selectedDate: string | null;
  selectedDaySummary: CalendarDaySummary | null;
  calendarFilters: CalendarFiltersState;
  isDayDetailsOpen: boolean;
  onChangeCalendarFilters: (next: CalendarFiltersState) => void;
  onSelectMonth: (month: string) => void;
  onSelectDate: (date: string, summary: CalendarDaySummary) => void;
  onBackToYear: () => void;
  onChangeYear: (year: number) => void;
  onChangeMonth: (month: string) => void;
  onCloseDayDetails: () => void;
};

export default function LongTermPlanningCalendarView({
  rows,
  capacityResults,
  events,
  site,
  viewLevel,
  selectedYear,
  selectedMonth,
  selectedDate,
  selectedDaySummary,
  calendarFilters,
  isDayDetailsOpen,
  onChangeCalendarFilters,
  onSelectMonth,
  onSelectDate,
  onBackToYear,
  onChangeYear,
  onChangeMonth,
  onCloseDayDetails,
}: LongTermPlanningCalendarViewProps) {
  const filteredEvents = useMemo(() => filterCalendarEvents(events, calendarFilters), [events, calendarFilters]);
  const yearSummaries = useMemo(
    () => getLongTermPlanningYearSummary(rows, capacityResults, filteredEvents, selectedYear),
    [rows, capacityResults, filteredEvents, selectedYear],
  );

  const getDaySummary = (date: string) =>
    getLongTermPlanningDaySummary(rows, capacityResults, filteredEvents, date);

  const title =
    viewLevel === 'year'
      ? `${selectedYear} calendar overview`
      : monthFormatter.format(new Date(`${selectedMonth}-01T00:00:00Z`));
  const subtitle =
    viewLevel === 'year'
      ? 'Review the planning horizon by month, then drill into daily signals and events.'
      : 'Select a day to open the planning details panel with events, constraints, and affected products.';

  return (
    <Stack spacing={1.5}>
      <CalendarNavigationBar
        title={title}
        subtitle={subtitle}
        onPrevious={() => {
          if (viewLevel === 'year') {
            onChangeYear(selectedYear - 1);
          } else {
            const date = new Date(`${selectedMonth}-01T00:00:00Z`);
            date.setUTCMonth(date.getUTCMonth() - 1);
            onChangeMonth(date.toISOString().slice(0, 7));
          }
        }}
        onNext={() => {
          if (viewLevel === 'year') {
            onChangeYear(selectedYear + 1);
          } else {
            const date = new Date(`${selectedMonth}-01T00:00:00Z`);
            date.setUTCMonth(date.getUTCMonth() + 1);
            onChangeMonth(date.toISOString().slice(0, 7));
          }
        }}
        onBackToYear={viewLevel !== 'year' ? onBackToYear : undefined}
        onToday={() => onChangeMonth(rows[0]?.month.slice(0, 7) ?? selectedMonth)}
      />

      <Paper elevation={0} sx={{p: 1.3, borderRadius: 4, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
        <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
          Calendar filters
        </Typography>
        <Stack direction={{xs: 'column', lg: 'row'}} spacing={1.1} useFlexGap sx={{mt: 1.1, flexWrap: 'wrap'}}>
          <TextField
            select
            label="Event type"
            size="small"
            value={calendarFilters.eventType}
            onChange={(event) => onChangeCalendarFilters({...calendarFilters, eventType: event.target.value as CalendarFiltersState['eventType']})}
            sx={{minWidth: 190}}
          >
            <MenuItem value="">All event types</MenuItem>
            {['Holiday', 'AnnualShutdown', 'Blackout', 'ReducedCapacity', 'Maintenance', 'Project', 'SupplierTest', 'MaterialTest', 'Validation', 'EngineeringEvent', 'CapacityOverload', 'AtRisk', 'ConstrainedDemand', 'UncoveredDemand'].map((type) => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Severity"
            size="small"
            value={calendarFilters.severity}
            onChange={(event) => onChangeCalendarFilters({...calendarFilters, severity: event.target.value as CalendarFiltersState['severity']})}
            sx={{minWidth: 160}}
          >
            <MenuItem value="">All severities</MenuItem>
            <MenuItem value="Info">Info</MenuItem>
            <MenuItem value="Warning">Warning</MenuItem>
            <MenuItem value="Blocker">Blocker</MenuItem>
          </TextField>
          <TextField
            select
            label="Source"
            size="small"
            value={calendarFilters.source}
            onChange={(event) => onChangeCalendarFilters({...calendarFilters, source: event.target.value as CalendarFiltersState['source']})}
            sx={{minWidth: 170}}
          >
            <MenuItem value="">All sources</MenuItem>
            {['Plan', 'Capacity', 'Calendar', 'Scenario', 'Manual'].map((source) => (
              <MenuItem key={source} value={source}>{source}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Impact"
            size="small"
            value={calendarFilters.impactType}
            onChange={(event) => onChangeCalendarFilters({...calendarFilters, impactType: event.target.value as CalendarFiltersState['impactType']})}
            sx={{minWidth: 170}}
          >
            <MenuItem value="">All impacts</MenuItem>
            <MenuItem value="requestedQuantity">Requested qty</MenuItem>
            <MenuItem value="committedQuantity">Committed qty</MenuItem>
            <MenuItem value="uncoveredQuantity">Uncovered qty</MenuItem>
            <MenuItem value="requiredHours">Required hrs</MenuItem>
            <MenuItem value="availableHours">Available hrs</MenuItem>
            <MenuItem value="utilizationPercent">Utilization %</MenuItem>
          </TextField>
        </Stack>
      </Paper>

      <CalendarLegend />

      {viewLevel === 'year' ? (
        <LongTermPlanningYearCalendar summaries={yearSummaries} onSelectMonth={onSelectMonth} />
      ) : (
        <Stack direction={{xs: 'column', xl: 'row'}} spacing={1.5} alignItems="stretch">
          <Paper elevation={0} sx={{p: 1.3, borderRadius: 4, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)', flex: 1}}>
            <LongTermPlanningMonthCalendar
              month={selectedMonth}
              selectedDate={selectedDate}
              getDaySummary={getDaySummary}
              onSelectDate={(date) => onSelectDate(date, getDaySummary(date))}
            />
          </Paper>
          <LongTermPlanningDayDetailsPanel
            open={isDayDetailsOpen}
            summary={selectedDaySummary}
            site={site}
            onClose={onCloseDayDetails}
          />
        </Stack>
      )}
    </Stack>
  );
}
