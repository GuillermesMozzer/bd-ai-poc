import React from 'react';
import {
  Box,
  Button,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tooltip,
  Typography,
  Divider,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  OpenInFull as OpenInFullIcon,
} from '@mui/icons-material';
import { activeTheme, lightHeaderIconButtonSx } from '../../theme';

type ShiftCode = 'M' | 'A' | 'N' | 'OFF' | 'VAC' | 'TRN' | 'STOP';

type Crew = {
  id: string;
  name: string;
  code: string;
};

type CrewDayState = {
  crewId: string;
  shiftCode: ShiftCode;
  hours: number;
};

type DailyShiftAssignment = {
  shift: Extract<ShiftCode, 'M' | 'A' | 'N'>;
  crews: Crew[];
  hours: number;
};

type DailyCrewCoverage = {
  date: string;
  weekday: string;
  assignments: DailyShiftAssignment[];
  offCrews: Crew[];
  status?: Extract<ShiftCode, 'VAC' | 'TRN' | 'STOP'>;
};

type CrewPattern = {
  id: string;
  name: string;
  year: number;
  crews: Crew[];
  days: DailyCrewCoverage[];
};

type MonthlySummary = {
  monthLabel: string;
  workingDays: number;
  workingHours: number;
};

type ShiftRotationRow = {
  label: string;
  cells: Array<{
    shift: Extract<ShiftCode, 'M' | 'A' | 'N'> | 'OFF';
    displayCode: string;
    durationDays: number;
  }>;
};

type PlannedStopItem = {
  id: string;
  title: string;
  type: 'Holiday' | 'Maintenance' | 'Production Stop' | 'Plant Shutdown' | 'Training Event' | 'Other';
  scope: 'Entire Site' | 'Department' | 'Area' | 'Line';
  scopeDetail: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
  reason: string;
  isActive: boolean;
};

type ShiftCrewPatternOverviewProps = {
  plannedStops?: PlannedStopItem[];
  onMarkFullStop?: (date: string) => void;
  context?: 'overview' | 'planner';
};

const monthLabels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dayCellWidth = 46;
const leftColumnWidth = 126;
const rightSummaryGrid = '82px 88px';
const anchorDate = new Date(2026, 0, 1, 12, 0, 0, 0);
const subtleShadow = '0 10px 24px rgba(15, 23, 42, 0.08)';

const shiftVisuals: Record<ShiftCode, { bg: string; border: string; color: string; label: string }> = {
  M: { bg: '#DBEAFE', border: '#93C5FD', color: '#1D4ED8', label: 'Morning' },
  A: { bg: '#FEF3C7', border: '#FCD34D', color: '#92400E', label: 'Afternoon' },
  N: { bg: '#E2E8F0', border: '#CBD5E1', color: '#334155', label: 'Night' },
  OFF: { bg: '#FFEDD5', border: '#FDBA74', color: '#C2410C', label: 'Day Off' },
  VAC: { bg: '#DCFCE7', border: '#86EFAC', color: '#166534', label: 'Vacation' },
  TRN: { bg: '#F3E8FF', border: '#D8B4FE', color: '#7E22CE', label: 'Training' },
  STOP: { bg: '#FEE2E2', border: '#FCA5A5', color: '#B91C1C', label: 'Planned Shutdown' },
};

const crews: Crew[] = [
  { id: 'crew-a', name: 'Crew A', code: 'A' },
  { id: 'crew-b', name: 'Crew B', code: 'B' },
  { id: 'crew-c', name: 'Crew C', code: 'C' },
  { id: 'crew-d', name: 'Crew D', code: 'D' },
  { id: 'crew-e', name: 'Crew E', code: 'E' },
];

const patternOptions = [
  { id: 'pattern-1', label: 'Pattern 1 - 5 Crew Rotation' },
  { id: 'pattern-2', label: 'Pattern 2 - Weekend 12h Prototype' },
];

const rotationTemplate: Array<{ shiftCode: ShiftCode; hours: number }> = [
  { shiftCode: 'M', hours: 8 },
  { shiftCode: 'M', hours: 8 },
  { shiftCode: 'M', hours: 8 },
  { shiftCode: 'M', hours: 8 },
  { shiftCode: 'M', hours: 8 },
  { shiftCode: 'OFF', hours: 0 },
  { shiftCode: 'OFF', hours: 0 },
  { shiftCode: 'A', hours: 8 },
  { shiftCode: 'A', hours: 8 },
  { shiftCode: 'A', hours: 8 },
  { shiftCode: 'A', hours: 8 },
  { shiftCode: 'A', hours: 8 },
  { shiftCode: 'OFF', hours: 0 },
  { shiftCode: 'OFF', hours: 0 },
  { shiftCode: 'N', hours: 8 },
  { shiftCode: 'N', hours: 8 },
  { shiftCode: 'N', hours: 8 },
  { shiftCode: 'N', hours: 8 },
  { shiftCode: 'N', hours: 8 },
  { shiftCode: 'OFF', hours: 0 },
  { shiftCode: 'OFF', hours: 0 },
  { shiftCode: 'OFF', hours: 0 },
];

const shiftPeriodTemplate: Array<{ shift: Extract<ShiftCode, 'M' | 'A' | 'N'> | 'OFF'; durationDays: number }> = [
  { shift: 'OFF', durationDays: 11 },
  { shift: 'A', durationDays: 3 },
  { shift: 'N', durationDays: 4 },
  { shift: 'M', durationDays: 7 },
  { shift: 'OFF', durationDays: 11 },
  { shift: 'M', durationDays: 7 },
  { shift: 'A', durationDays: 3 },
  { shift: 'N', durationDays: 4 },
];

const dailyStatusOverrides: Record<string, Extract<ShiftCode, 'VAC' | 'TRN' | 'STOP'>> = {
  '2026-02-04': 'TRN',
  '2026-06-11': 'VAC',
  '2026-06-18': 'TRN',
  '2026-10-29': 'TRN',
  '2026-12-23': 'STOP',
  '2026-12-24': 'STOP',
  '2026-12-25': 'STOP',
  '2026-12-30': 'STOP',
  '2026-12-31': 'STOP',
};

const toIsoDate = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const isStopActiveOnDate = (stop: PlannedStopItem, isoDate: string) => stop.isActive && stop.startDate <= isoDate && stop.endDate >= isoDate;

const buildDatesForYear = (year: number) => {
  const start = new Date(year, 0, 1, 12, 0, 0, 0);
  const end = new Date(year, 11, 31, 12, 0, 0, 0);
  const dates: Date[] = [];
  for (let cursor = start; cursor <= end; cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() + 1, 12, 0, 0, 0)) {
    dates.push(cursor);
  }
  return dates;
};

const normalizeShiftCoverage = (states: CrewDayState[], dateIndex: number, isWeekendPrototype: boolean) => {
  const shifts: Array<Extract<ShiftCode, 'M' | 'A' | 'N'>> = ['M', 'A', 'N'];
  const assignments = shifts.map((shift, shiftIndex) => {
    const direct = states.filter((state) => state.shiftCode === shift);
    const activeStates = states.filter((state) => state.shiftCode !== 'OFF');
    const fallback = direct.length ? [] : [activeStates[(dateIndex + shiftIndex) % Math.max(1, activeStates.length)]].filter(Boolean);
    const extraCoverage = (dateIndex + shiftIndex) % (isWeekendPrototype ? 8 : 11) === 0
      ? activeStates.filter((state) => state.shiftCode !== shift).slice(0, 1)
      : [];
    const selectedStates = [...direct, ...fallback, ...extraCoverage];
    const uniqueCrewIds = new Set<string>();
    const selectedCrews = selectedStates
      .map((state) => crews.find((crew) => crew.id === state.crewId))
      .filter((crew): crew is Crew => {
        if (!crew || uniqueCrewIds.has(crew.id)) return false;
        uniqueCrewIds.add(crew.id);
        return true;
      });

    return {
      shift,
      crews: selectedCrews.length ? selectedCrews : [crews[(dateIndex + shiftIndex) % crews.length]],
      hours: (selectedStates[0]?.hours || 8) * Math.max(1, selectedCrews.length || 1),
    };
  });

  return assignments;
};

const buildShiftRotationRows = (): ShiftRotationRow[] => {
  const cycleLength = shiftPeriodTemplate.reduce((sum, block) => sum + block.durationDays, 0);
  const getPeriodForDay = (periodDayIndex: number) => {
    let cursor = ((periodDayIndex % cycleLength) + cycleLength) % cycleLength;
    return shiftPeriodTemplate.find((block) => {
      if (cursor < block.durationDays) return true;
      cursor -= block.durationDays;
      return false;
    }) ?? shiftPeriodTemplate[0];
  };

  return crews.map((_, rowIndex) => {
    const baseCells = Array.from({ length: 31 }, (_, dayIndex) => {
      const period = getPeriodForDay(dayIndex + rowIndex * 5);
      return {
        shift: period.shift,
        displayCode: '',
        durationDays: period.durationDays,
      };
    });

    const cells = baseCells.map((cell) => {
      const shiftCode = cell.shift === 'OFF' ? 'D' : cell.shift;
      return {
        ...cell,
        displayCode: `${cell.durationDays}${shiftCode}`,
      };
    });

    return {
      label: `Shift ${rowIndex + 1}`,
      cells,
    };
  });
};

const buildPattern = (year: number, patternId: string): CrewPattern => {
  const dates = buildDatesForYear(year);
  const isWeekendPrototype = patternId === 'pattern-2';
  const days = dates.map((date, dateIndex) => {
    const diffDays = Math.floor((date.getTime() - anchorDate.getTime()) / 86400000);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const crewStates = crews.map((crew, crewIndex) => {
      const templateIndex = ((diffDays + crewIndex * 4) % rotationTemplate.length + rotationTemplate.length) % rotationTemplate.length;
      const base = rotationTemplate[templateIndex];
      return {
        crewId: crew.id,
        shiftCode: base.shiftCode,
        hours: isWeekendPrototype && weekend && base.hours > 0 ? 12 : base.hours,
      };
    });
    const isoDate = toIsoDate(date);
    const assignments = normalizeShiftCoverage(crewStates, dateIndex, isWeekendPrototype);

    return {
      date: isoDate,
      weekday: weekdayLabels[date.getDay()],
      assignments,
      offCrews: crewStates
        .filter((state) => state.shiftCode === 'OFF')
        .map((state) => crews.find((crew) => crew.id === state.crewId))
        .filter(Boolean) as Crew[],
      status: dailyStatusOverrides[isoDate],
    };
  });

  return {
    id: patternId,
    name: patternOptions.find((option) => option.id === patternId)?.label ?? 'Pattern 1 - 5 Crew Rotation',
    year,
    crews,
    days,
  };
};

const ShiftCrewPatternOverview: React.FC<ShiftCrewPatternOverviewProps> = ({
  plannedStops = [],
  onMarkFullStop,
  context = 'overview',
}) => {
  const [selectedYear, setSelectedYear] = React.useState(2026);
  const [selectedPatternId, setSelectedPatternId] = React.useState('pattern-1');
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [selectedCoverage, setSelectedCoverage] = React.useState<DailyCrewCoverage | null>(null);

  const crewPattern = React.useMemo(() => buildPattern(selectedYear, selectedPatternId), [selectedPatternId, selectedYear]);
  const selectedCoveragePlannedStops = React.useMemo(
    () => plannedStops.filter((stop) => selectedCoverage && isStopActiveOnDate(stop, selectedCoverage.date)),
    [plannedStops, selectedCoverage],
  );

  const monthlyRows = React.useMemo(() => monthLabels.map((monthLabel, monthIndex) => {
    const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
    const cells = Array.from({ length: 31 }, (_, index) => {
      if (index + 1 > daysInMonth) return null;
      const date = new Date(selectedYear, monthIndex, index + 1, 12, 0, 0, 0);
      return {
        date,
        coverage: crewPattern.days.find((day) => day.date === toIsoDate(date)),
        dayNumber: index + 1,
      };
    });
    return { monthLabel, monthIndex, cells };
  }), [crewPattern.days, selectedYear]);

  const monthlySummaries = React.useMemo<MonthlySummary[]>(() => monthlyRows.map((monthRow) => {
    const validDays = monthRow.cells.map((cell) => cell?.coverage).filter(Boolean) as DailyCrewCoverage[];
    const workingDays = validDays.filter((day) => day.assignments.length > 0 && day.status !== 'STOP').length;
    const workingHours = validDays.reduce((sum, day) => (
      day.status === 'STOP' ? sum : sum + day.assignments.reduce((daySum, assignment) => daySum + assignment.hours, 0)
    ), 0);

    return {
      monthLabel: monthRow.monthLabel,
      workingDays,
      workingHours,
    };
  }), [monthlyRows]);

  const shiftRotationRows = React.useMemo(
    () => buildShiftRotationRows(),
    [],
  );

  const mergeCoverageWithStops = React.useCallback((coverage: DailyCrewCoverage) => {
    const matchingStops = plannedStops.filter((stop) => isStopActiveOnDate(stop, coverage.date));
    if (!matchingStops.length) return { coverage, matchingStops };
    const mergedStatus: DailyCrewCoverage['status'] = coverage.status === 'STOP'
      ? 'STOP'
      : matchingStops.some((stop) => stop.type === 'Production Stop' || stop.type === 'Plant Shutdown')
        ? 'STOP'
        : coverage.status;
    return {
      matchingStops,
      coverage: {
        ...coverage,
        status: mergedStatus,
      },
    };
  }, [plannedStops]);

  const gridTemplateColumns = `${leftColumnWidth}px repeat(31, minmax(0, ${dayCellWidth}px)) ${rightSummaryGrid}`;

  const renderDayHeader = () => (
    <Box sx={{ display: 'grid', gridTemplateColumns, borderBottom: '1px solid #D9E4F5', bgcolor: '#FAFCFF', position: 'sticky', top: 0, zIndex: 2 }}>
      <Box sx={{ px: 1, py: 0.8, borderRight: '1px solid #D9E4F5', display: 'flex', alignItems: 'center' }}>
        <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 900, fontSize: '0.63rem', textTransform: 'uppercase' }}>
          Month
        </Typography>
      </Box>
      {Array.from({ length: 31 }, (_, index) => (
        <Box key={`day-header-${index + 1}`} sx={{ minHeight: 30, borderRight: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption" sx={{ color: '#334155', fontWeight: 900, fontSize: '0.62rem' }}>
            {index + 1}
          </Typography>
        </Box>
      ))}
      <Box sx={{ borderRight: '1px solid #D9E4F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 900, fontSize: '0.57rem', textAlign: 'center' }}>
          Days
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 900, fontSize: '0.57rem', textAlign: 'center' }}>
          Hours
        </Typography>
      </Box>
    </Box>
  );

  const renderCoverageTooltip = (dayNumber: number, coverage: DailyCrewCoverage) => {
    const statusVisual = coverage.status ? shiftVisuals[coverage.status] : null;
    return (
      <Box sx={{ minWidth: 230, p: 0.4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75, gap: 1 }}>
          <Box>
            <Typography sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '0.82rem', lineHeight: 1.1 }}>
              {coverage.date}
            </Typography>
            <Typography sx={{ color: '#CBD5E1', fontWeight: 700, fontSize: '0.66rem' }}>
              Day {dayNumber} / Weekday {coverage.weekday}
            </Typography>
          </Box>
          {coverage.status ? (
            <Box sx={{ px: 0.7, py: 0.35, borderRadius: 999, bgcolor: statusVisual?.bg, color: statusVisual?.color, fontWeight: 900, fontSize: '0.58rem' }}>
              {coverage.status}
            </Box>
          ) : null}
        </Box>
        <Box sx={{ display: 'grid', gap: 0.45 }}>
          {coverage.assignments.map((assignment) => {
            const visual = shiftVisuals[assignment.shift];
            return (
              <Box key={`${coverage.date}-tooltip-${assignment.shift}`} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, px: 0.7, py: 0.45, borderRadius: 1, bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.10)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
                  <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: visual.bg, border: `1px solid ${visual.border}` }} />
                  <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.68rem' }}>
                    {visual.label}
                  </Typography>
                </Box>
                <Typography sx={{ color: '#E2E8F0', fontWeight: 900, fontSize: '0.68rem' }}>
                  {assignment.crews.map((crew) => crew.name).join(', ')} / {assignment.hours}h
                </Typography>
              </Box>
            );
          })}
        </Box>
        <Box sx={{ mt: 0.7, pt: 0.65, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
          <Typography sx={{ color: '#CBD5E1', fontWeight: 800, fontSize: '0.62rem', mb: 0.3 }}>
            Off crews
          </Typography>
          <Typography sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: '0.68rem' }}>
            {coverage.offCrews.length ? coverage.offCrews.map((crew) => crew.name).join(', ') : 'No crew off'}
          </Typography>
        </Box>
      </Box>
    );
  };

  const renderCoverageCell = (dayNumber: number, coverage: DailyCrewCoverage) => {
    const { coverage: effectiveCoverage, matchingStops } = mergeCoverageWithStops(coverage);
    const statusVisual = effectiveCoverage.status ? shiftVisuals[effectiveCoverage.status] : null;
    const title = [
      effectiveCoverage.date,
      ...effectiveCoverage.assignments.map((assignment) => `${shiftVisuals[assignment.shift].label}: ${assignment.crews.map((crew) => crew.name).join(', ')}`),
      effectiveCoverage.offCrews.length ? `Off: ${effectiveCoverage.offCrews.map((crew) => crew.name).join(', ')}` : '',
      effectiveCoverage.status ? shiftVisuals[effectiveCoverage.status].label : '',
      ...matchingStops.map((stop) => `Planned stop: ${stop.title}`),
    ].filter(Boolean).join(' | ');

    return (
      <Tooltip
        arrow
        placement="top"
        title={renderCoverageTooltip(dayNumber, effectiveCoverage)}
        componentsProps={{
          tooltip: {
            sx: {
              bgcolor: '#0F172A',
              borderRadius: 2,
              boxShadow: '0 20px 40px rgba(15,23,42,0.28)',
              border: '1px solid rgba(255,255,255,0.12)',
              p: 0.8,
            },
          },
          arrow: { sx: { color: '#0F172A' } },
        }}
      >
      <Box
        aria-label={title}
        onClick={() => setSelectedCoverage(effectiveCoverage)}
        sx={{
          minHeight: 72,
          px: 0.28,
          py: 0.35,
          borderRight: '1px solid #E2E8F0',
          bgcolor: statusVisual?.bg ?? '#FFFFFF',
          color: '#0F172A',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 0.22,
          cursor: 'pointer',
          position: 'relative',
          transition: 'box-shadow 0.18s ease, transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
          '&:hover': {
            zIndex: 3,
            transform: 'translateY(-1px)',
            boxShadow: '0 8px 18px rgba(37, 99, 235, 0.18)',
            outline: '2px solid rgba(37, 99, 235, 0.28)',
            outlineOffset: '-2px',
            bgcolor: statusVisual?.bg ?? '#F8FBFF',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 0 }}>
          <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: '0.55rem', lineHeight: 1 }}>
            {dayNumber}
          </Typography>
          <Typography sx={{ color: '#64748B', fontWeight: 900, fontSize: '0.48rem', lineHeight: 1 }}>
            {coverage.weekday}
          </Typography>
        </Box>
        {effectiveCoverage.status === 'STOP' ? (
          <Box sx={{ px: 0.25, py: 0.16, borderRadius: 0.7, bgcolor: shiftVisuals.STOP.bg, border: `1px solid ${shiftVisuals.STOP.border}`, textAlign: 'center' }}>
            <Typography sx={{ color: shiftVisuals.STOP.color, fontWeight: 900, fontSize: '0.43rem', lineHeight: 1.05 }}>
              STOP
            </Typography>
          </Box>
        ) : (
          effectiveCoverage.assignments.map((assignment) => {
            const visual = shiftVisuals[assignment.shift];
            return (
              <Box
                key={`${effectiveCoverage.date}-${assignment.shift}-${assignment.crews.map((crew) => crew.id).join('-')}`}
                sx={{
                  px: 0.25,
                  py: 0.12,
                  borderRadius: 0.7,
                  bgcolor: visual.bg,
                  border: `1px solid ${visual.border}`,
                  textAlign: 'center',
                  boxShadow: 'inset 0 -1px 0 rgba(15,23,42,0.04)',
                }}
              >
                <Typography sx={{ color: visual.color, fontWeight: 900, fontSize: '0.42rem', lineHeight: 1.08 }}>
                  {assignment.shift}: {assignment.crews.map((crew) => crew.code).join(',')}
                </Typography>
              </Box>
            );
          })
        )}
        {effectiveCoverage.status && effectiveCoverage.status !== 'STOP' ? (
          <Typography sx={{ color: statusVisual?.color, fontWeight: 900, fontSize: '0.42rem', lineHeight: 1, textAlign: 'center' }}>
            {effectiveCoverage.status}
          </Typography>
        ) : null}
      </Box>
      </Tooltip>
    );
  };

  const annualGrid = (
    <Paper
      elevation={0}
      sx={{
        borderRadius: isFullscreen ? 0 : 2.4,
        border: isFullscreen ? 'none' : '1px solid #D6DCE7',
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        height: isFullscreen ? '100%' : 'auto',
      }}
    >
      <Box sx={{ px: 1.2, py: 1, borderBottom: '1px solid #D9E4F5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', bgcolor: '#FFFFFF' }}>
        <Box>
          <Typography variant="subtitle1" sx={{ color: activeTheme.primary, fontWeight: 900, fontSize: '0.98rem', lineHeight: 1.1 }}>
            {context === 'planner' ? 'Planner' : 'Overview'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.64rem' }}>
            {context === 'planner' ? 'Working Calendar' : 'Annual Crew Pattern Calendar'} / {crewPattern.name}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel>Pattern</InputLabel>
            <Select label="Pattern" value={selectedPatternId} onChange={(event) => setSelectedPatternId(event.target.value)}>
              {patternOptions.map((option) => (
                <MenuItem key={option.id} value={option.id}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, px: 0.5, py: 0.35, borderRadius: 999, border: '1px solid #D9E4F5', bgcolor: '#FAFCFF' }}>
            <IconButton size="small" sx={lightHeaderIconButtonSx} onClick={() => setSelectedYear((prev) => prev - 1)}>
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
            <Typography sx={{ color: '#0F172A', fontWeight: 900, minWidth: 48, textAlign: 'center', fontSize: '0.82rem' }}>
              {selectedYear}
            </Typography>
            <IconButton size="small" sx={lightHeaderIconButtonSx} onClick={() => setSelectedYear((prev) => prev + 1)}>
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Box>
          {isFullscreen ? (
            <IconButton size="small" onClick={() => setIsFullscreen(false)} sx={{ width: 34, height: 34, border: '1px solid #D9E4F5', bgcolor: '#FFFFFF' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          ) : (
            <Button
              variant="outlined"
              size="small"
              startIcon={<OpenInFullIcon />}
              onClick={() => setIsFullscreen(true)}
              sx={{ borderRadius: 999, fontWeight: 800, textTransform: 'none', minHeight: 34 }}
            >
              Full Screen
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ overflow: 'auto', maxHeight: isFullscreen ? 'calc(100vh - 118px)' : '74vh', background: 'linear-gradient(180deg, #F8FAFC 0%, #EEF4FF 100%)' }}>
        <Box sx={{ minWidth: 1740 }}>
          {renderDayHeader()}

          {monthlyRows.map((monthRow, monthIndex) => (
            <Box key={monthRow.monthLabel} sx={{ display: 'grid', gridTemplateColumns, borderBottom: '1px solid #E2E8F0' }}>
              <Box sx={{ px: 1, py: 0.7, borderRight: '1px solid #D9E4F5', bgcolor: '#FAFCFF', display: 'flex', alignItems: 'center', borderLeft: `4px solid ${activeTheme.primary}` }}>
                <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 900, fontSize: '0.65rem' }}>
                  {monthRow.monthLabel}
                </Typography>
              </Box>
              {monthRow.cells.map((cell, index) => (
                cell?.coverage ? (
                  <React.Fragment key={`${monthRow.monthLabel}-${index + 1}`}>
                    {renderCoverageCell(index + 1, cell.coverage)}
                  </React.Fragment>
                ) : (
                  <Box key={`${monthRow.monthLabel}-${index + 1}`} sx={{ minHeight: 72, borderRight: '1px solid #E2E8F0', bgcolor: '#F1F5F9' }} />
                )
              ))}
              <Box sx={{ borderRight: '1px solid #D9E4F5', bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 900, fontSize: '0.62rem' }}>
                  {monthlySummaries[monthIndex].workingDays}
                </Typography>
              </Box>
              <Box sx={{ bgcolor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="caption" sx={{ color: '#166534', fontWeight: 900, fontSize: '0.62rem' }}>
                  {monthlySummaries[monthIndex].workingHours}
                </Typography>
              </Box>
            </Box>
          ))}

          {shiftRotationRows.map((rotationRow) => (
            <Box key={rotationRow.label} sx={{ display: 'grid', gridTemplateColumns, borderBottom: '1px solid #E2E8F0' }}>
              <Box sx={{ px: 1, py: 0.7, borderRight: '1px solid #D9E4F5', bgcolor: '#F8FBFF', display: 'flex', alignItems: 'center', borderLeft: `4px solid ${activeTheme.primary}` }}>
                <Typography variant="caption" sx={{ color: '#0F172A', fontWeight: 900, fontSize: '0.65rem' }}>
                  {rotationRow.label}
                </Typography>
              </Box>
              {rotationRow.cells.map((cell, index) => {
                const visual = shiftVisuals[cell.shift];
                return (
                  <Tooltip
                    key={`${rotationRow.label}-${index + 1}`}
                    arrow
                    title={`${rotationRow.label} / Day ${index + 1}: ${cell.displayCode} = ${cell.durationDays} days ${cell.shift === 'OFF' ? 'off / rest' : `on ${visual.label}`}`}
                  >
                    <Box
                      sx={{
                        minHeight: 36,
                        px: 0.25,
                        py: 0.3,
                        borderRight: '1px solid #E2E8F0',
                        bgcolor: cell.shift === 'OFF' ? '#FFF7ED' : '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          px: 0.2,
                          py: 0.18,
                          borderRadius: 0.7,
                          bgcolor: visual.bg,
                          border: `1px solid ${visual.border}`,
                          color: visual.color,
                          textAlign: 'center',
                          fontSize: '0.43rem',
                          fontWeight: 950,
                          lineHeight: 1.1,
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {cell.displayCode}
                      </Box>
                    </Box>
                  </Tooltip>
                );
              })}
              <Box sx={{ borderRight: '1px solid #D9E4F5', bgcolor: '#F8FAFC' }} />
              <Box sx={{ bgcolor: '#F8FAFC' }} />
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ px: 1.2, py: 1.15, borderTop: '1px solid #D9E4F5', bgcolor: '#FFFFFF' }}>
        <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px solid #CFE0F8', background: 'linear-gradient(135deg, #F8FBFF 0%, #FFFFFF 58%, #F0F7FF 100%)', boxShadow: subtleShadow }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.85, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase' }}>
                Legend
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', fontSize: '0.58rem' }}>
                Month cells show shift / crew coverage. Shift rows show duration codes such as 7M, 4N, 3A, 11D.
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap', alignItems: 'center' }}>
            {Object.entries(shiftVisuals).map(([code, visual]) => (
              <Box key={code} sx={{ display: 'flex', alignItems: 'center', gap: 0.5, px: 0.75, py: 0.5, borderRadius: 1.5, border: `1px solid ${visual.border}`, bgcolor: visual.bg, boxShadow: '0 4px 10px rgba(15,23,42,0.06)' }}>
                <Typography variant="caption" sx={{ color: visual.color, fontWeight: 950, fontSize: '0.62rem', minWidth: 28 }}>
                  {code === 'OFF' ? 'D/OFF' : code}
                </Typography>
                <Typography variant="caption" sx={{ color: visual.color, fontWeight: 800, fontSize: '0.58rem' }}>
                  {visual.label}
                </Typography>
              </Box>
            ))}
            {crews.map((crew) => (
              <Box key={crew.id} sx={{ display: 'flex', alignItems: 'center', gap: 0.45, px: 0.75, py: 0.5, borderRadius: 1.5, border: '1px solid #D9E4F5', bgcolor: '#FFFFFF' }}>
                <Box sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: '#EFF6FF', color: activeTheme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 900 }}>
                  {crew.code}
                </Box>
                <Typography variant="caption" sx={{ color: '#334155', fontWeight: 800, fontSize: '0.58rem' }}>
                  {crew.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Paper>
  );

  const selectedCoverageDetails = selectedCoverage ? mergeCoverageWithStops(selectedCoverage).coverage : null;
  const workingCrews = selectedCoverageDetails
    ? Array.from(new Set(selectedCoverageDetails.assignments.flatMap((assignment) => assignment.crews.map((crew) => crew.name))))
    : [];
  const linesAffected = selectedCoveragePlannedStops.length
    ? selectedCoveragePlannedStops.map((stop) => stop.scopeDetail)
    : selectedCoverageDetails?.status === 'STOP'
      ? ['Entire Site', 'Primary Production Lines']
      : ['Line A', 'Line B', 'Line C', 'Line D'];
  const warnings = selectedCoverageDetails
    ? [
        ...(selectedCoverageDetails.status === 'STOP' ? ['Full stop is active for the selected day.'] : []),
        ...(selectedCoverageDetails.status === 'TRN' ? ['Training event changes normal crew allocation.'] : []),
        ...(selectedCoverageDetails.status === 'VAC' ? ['Vacation / leave coverage needs confirmation.'] : []),
        ...(selectedCoverageDetails.offCrews.length > 2 ? ['High off-crew count may reduce flexibility.'] : []),
        ...selectedCoveragePlannedStops.map((stop) => `${stop.title} (${stop.scope})`),
      ]
    : [];

  return (
    <Box>
      {!isFullscreen ? annualGrid : null}

      {isFullscreen ? (
        <Box
          sx={{
            position: 'fixed',
            inset: 12,
            zIndex: 1500,
            bgcolor: 'rgba(248,250,252,0.98)',
            boxShadow: '0 24px 64px rgba(15,23,42,0.24)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          {annualGrid}
        </Box>
      ) : null}

      <Drawer
        anchor="right"
        open={Boolean(selectedCoverageDetails)}
        onClose={() => setSelectedCoverage(null)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 420 }, p: 2, bgcolor: '#FFFFFF' } }}
      >
        {selectedCoverageDetails ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
              <Box>
                <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: '1.05rem' }}>
                  {new Date(`${selectedCoverageDetails.date}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </Typography>
                <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.75rem' }}>
                  {new Date(`${selectedCoverageDetails.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long' })}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedCoverage(null)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>

            <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2, border: '1px solid #D9E4F5', bgcolor: '#F8FBFF' }}>
              <Typography sx={{ color: activeTheme.primary, fontWeight: 900, fontSize: '0.74rem', mb: 0.45 }}>Shift coverage</Typography>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.82rem' }}>
                {selectedCoverageDetails.assignments.filter((assignment) => assignment.crews.length > 0).length} / 3 shifts covered
              </Typography>
            </Paper>

            {selectedCoverageDetails.assignments.map((assignment) => (
              <Paper key={`${selectedCoverageDetails.date}-${assignment.shift}`} elevation={0} sx={{ p: 1.05, borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography sx={{ color: shiftVisuals[assignment.shift].color, fontWeight: 900, fontSize: '0.76rem', mb: 0.25 }}>
                  {shiftVisuals[assignment.shift].label} Shift
                </Typography>
                <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.8rem' }}>
                  {assignment.crews.map((crew) => crew.name).join(', ')}
                </Typography>
                <Typography sx={{ color: '#64748B', fontWeight: 700, fontSize: '0.68rem' }}>
                  {assignment.hours} crew-hours scheduled
                </Typography>
              </Paper>
            ))}

            <Divider />

            <Box>
              <Typography sx={{ color: activeTheme.primary, fontWeight: 900, fontSize: '0.74rem', mb: 0.35 }}>Working crews</Typography>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.8rem' }}>
                {workingCrews.join(', ') || 'No crews scheduled'}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: activeTheme.primary, fontWeight: 900, fontSize: '0.74rem', mb: 0.35 }}>Off crews</Typography>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.8rem' }}>
                {selectedCoverageDetails.offCrews.map((crew) => crew.name).join(', ') || 'No crews off'}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: activeTheme.primary, fontWeight: 900, fontSize: '0.74rem', mb: 0.35 }}>Lines / areas affected</Typography>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.8rem' }}>
                {linesAffected.join(', ')}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: activeTheme.primary, fontWeight: 900, fontSize: '0.74rem', mb: 0.35 }}>Events</Typography>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.8rem' }}>
                {selectedCoveragePlannedStops.length
                  ? selectedCoveragePlannedStops.map((stop) => stop.title).join(', ')
                  : selectedCoverageDetails.status
                    ? shiftVisuals[selectedCoverageDetails.status].label
                    : 'No extra events'}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: activeTheme.primary, fontWeight: 900, fontSize: '0.74rem', mb: 0.35 }}>Vacation / leave indicators</Typography>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.8rem' }}>
                {selectedCoverageDetails.status === 'VAC' ? 'Vacation / leave coverage applied' : 'No vacation / leave indicator for this day'}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ color: activeTheme.primary, fontWeight: 900, fontSize: '0.74rem', mb: 0.35 }}>Gaps / warnings</Typography>
              <Typography sx={{ color: '#0F172A', fontWeight: 800, fontSize: '0.8rem' }}>
                {warnings.join(' ') || 'No active warnings'}
              </Typography>
            </Box>

            <Button
              variant="contained"
              onClick={() => {
                onMarkFullStop?.(selectedCoverageDetails.date);
              }}
              sx={{ mt: 0.5, borderRadius: 999, fontWeight: 900, textTransform: 'none' }}
            >
              Mark as Full Stop
            </Button>
          </Box>
        ) : null}
      </Drawer>
    </Box>
  );
};

export default ShiftCrewPatternOverview;
