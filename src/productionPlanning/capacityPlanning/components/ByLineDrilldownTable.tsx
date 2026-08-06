import {Fragment} from 'react';
import {Box, Stack, Tooltip, Typography} from '@mui/material';
import {
  InfoOutlined as InfoOutlinedIcon,
  KeyboardArrowDown as ExpandIcon,
  KeyboardArrowRight as CollapseIcon,
} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {CapacityMonthDrilldown, CapacityWeek, LineShiftSchedule} from '../types';
import {getCellBg, getCellColor} from '../utils';

const DEFAULT_SCHEDULE: LineShiftSchedule = {
  lineId: '',
  shiftsPerDay: 3,
  daysPerWeek: 5,
  workingDaysPerMonth: 22,
  shifts: [],
};

type Props = {
  data: CapacityMonthDrilldown[];
  displayMode?: 'hrs' | 'pct';
  shiftSchedules: LineShiftSchedule[];
  selectedId: string | null;
  expandedLines: Set<string>;
  onToggleExpand: (lineId: string) => void;
  selectedMachineIds?: Set<string>;
  onMachineClick?: (machineId: string) => void;
};

function scheduleFor(lineId: string, schedules: LineShiftSchedule[]): LineShiftSchedule {
  return schedules.find((s) => s.lineId === lineId) ?? DEFAULT_SCHEDULE;
}

function formatHrs(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(Math.round(n));
}

type DayCellsProps = {
  available: number;
  required: number;
  utilizationPct: number;
  displayMode: 'hrs' | 'pct';
  isMachine?: boolean;
  borderLeft?: string;
};

function DayCells({available, required, utilizationPct, displayMode, isMachine, borderLeft}: DayCellsProps) {
  const fontSize = isMachine ? 10 : 11;
  const cellBase = {
    px: 0.5,
    py: 0.5,
    fontSize,
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
    minWidth: 44,
    cursor: 'default',
  };

  const hrsValue = displayMode === 'pct' ? `${utilizationPct}%` : formatHrs(available);
  const rateValue = displayMode === 'pct' ? `${utilizationPct}%` : formatHrs(required);
  const rateBg = getCellBg(utilizationPct);
  const rateColor = getCellColor(utilizationPct);
  const rateTooltip = displayMode === 'pct'
    ? `${utilizationPct}% utilization`
    : `Required: ${required.toLocaleString()} hrs`;

  return (
    <>
      <Tooltip title={`Available: ${available.toLocaleString()} hrs · Required: ${required.toLocaleString()} hrs`} placement="top">
        <Box
          component="td"
          sx={{
            ...cellBase,
            borderLeft: borderLeft,
            borderRight: `1px solid ${planningTokens.border}`,
            color: planningTokens.textSecondary,
            fontWeight: 500,
          }}
        >
          {hrsValue}
        </Box>
      </Tooltip>
      <Tooltip title={rateTooltip} placement="top">
        <Box
          component="td"
          sx={{
            ...cellBase,
            borderRight: `2px solid ${planningTokens.border}`,
            bgcolor: rateBg,
            color: rateColor,
            fontWeight: 700,
          }}
        >
          {rateValue}
        </Box>
      </Tooltip>
    </>
  );
}

function WeekHeader({week}: {week: CapacityWeek}) {
  const pct = week.utilizationPct;
  return (
    <Box
      component="th"
      colSpan={week.days.length * 2}
      sx={{
        px: 1,
        py: 0.5,
        fontSize: 10,
        fontWeight: 700,
        textAlign: 'center',
        bgcolor: getCellBg(pct) || planningTokens.surfaceMuted,
        color: getCellColor(pct) || planningTokens.textSecondary,
        borderRight: `2px solid ${planningTokens.border}`,
        borderBottom: `1px solid ${planningTokens.border}`,
      }}
    >
      {week.weekLabel}
      <Typography component="span" sx={{fontSize: 9, fontWeight: 400, ml: 0.5, opacity: 0.75}}>
        ({pct}%)
      </Typography>
    </Box>
  );
}

export default function ByLineDrilldownTable({
  data,
  displayMode = 'hrs',
  shiftSchedules,
  selectedId,
  expandedLines,
  onToggleExpand,
  selectedMachineIds,
  onMachineClick,
}: Props) {
  if (data.length === 0) {
    return (
      <Box sx={{p: 4, textAlign: 'center', color: planningTokens.textMuted, fontSize: 13}}>
        No data for selected month.
      </Box>
    );
  }

  const weeks = data[0].weeks;

  const thBase = {
    px: 0.8,
    py: 0.4,
    fontSize: 10,
    fontWeight: 700,
    textAlign: 'center' as const,
    color: planningTokens.textSecondary,
    bgcolor: planningTokens.surfaceMuted,
    borderRight: `1px solid ${planningTokens.border}`,
    whiteSpace: 'nowrap' as const,
  };
  const stickyCol = {
    px: 1.5,
    py: 0.6,
    fontSize: 12,
    fontWeight: 600,
    color: planningTokens.textPrimary,
    position: 'sticky' as const,
    left: 0,
    bgcolor: 'white',
    zIndex: 1,
    borderRight: `1px solid ${planningTokens.border}`,
    minWidth: 116,
    maxWidth: 116,
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const hrsLabel = displayMode === 'pct' ? '%' : 'hrs';
  const rateLabel = displayMode === 'pct' ? '%' : 'req';
  const rateTooltip = displayMode === 'pct' ? 'Capacity utilization' : 'Required capacity in hours';

  return (
    <Box>
      <Box sx={{overflowX: 'auto'}}>
      <Box component="table" sx={{width: '100%', borderCollapse: 'collapse', fontSize: 11}}>
        <Box component="thead">
          {/* Row 1: Week headers */}
          <Box component="tr">
            <Box
              component="th"
              rowSpan={3}
              sx={{...thBase, textAlign: 'left', position: 'sticky', left: 0, zIndex: 2, minWidth: 116, maxWidth: 116, bgcolor: planningTokens.surfaceMuted}}
            >
              Line / Machine
            </Box>
            {weeks.map((week) => (
              <WeekHeader key={week.weekLabel} week={week} />
            ))}
            <Box component="th" colSpan={2} sx={{...thBase, borderLeft: `2px solid ${planningTokens.border}`}}>Total</Box>
          </Box>

          {/* Row 2: Day headers (each spans 2 sub-columns) */}
          <Box component="tr">
            {weeks.map((week) =>
              week.days.map((day) => (
                <Box
                  component="th"
                  key={`${week.weekLabel}-${day.dayLabel}`}
                  colSpan={2}
                  sx={{
                    ...thBase,
                    fontSize: 9,
                    fontWeight: 600,
                    borderRight: day === week.days[week.days.length - 1]
                      ? `2px solid ${planningTokens.border}`
                      : `1px solid ${planningTokens.border}`,
                  }}
                >
                  {day.dayLabel}
                </Box>
              ))
            )}
            <Box component="th" colSpan={2} sx={{...thBase, borderLeft: `2px solid ${planningTokens.border}`}} />
          </Box>

          {/* Row 3: Sub-column headers (hrs + rate per day) */}
          <Box component="tr">
            {weeks.map((week) =>
              week.days.map((day) => (
                <Fragment key={`sub-${week.weekLabel}-${day.dayLabel}`}>
                  <Box component="th" sx={{...thBase, fontSize: 9, fontWeight: 600}}>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3}}>
                      {hrsLabel}
                      <Tooltip title="Available capacity in hours" arrow>
                        <InfoOutlinedIcon sx={{fontSize: 9, color: planningTokens.textSecondary, cursor: 'help'}} />
                      </Tooltip>
                    </Box>
                  </Box>
                  <Box
                    component="th"
                    sx={{
                      ...thBase,
                      fontSize: 9,
                      fontWeight: 600,
                      borderRight: day === week.days[week.days.length - 1]
                        ? `2px solid ${planningTokens.border}`
                        : `1px solid ${planningTokens.border}`,
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.3}}>
                      {rateLabel}
                      <Tooltip title={rateTooltip} arrow>
                        <InfoOutlinedIcon sx={{fontSize: 9, color: planningTokens.textSecondary, cursor: 'help'}} />
                      </Tooltip>
                    </Box>
                  </Box>
                </Fragment>
              ))
            )}
            <Box component="th" sx={{...thBase, fontSize: 9, fontWeight: 600, borderLeft: `2px solid ${planningTokens.border}`}}>
              {hrsLabel}
            </Box>
            <Box component="th" sx={{...thBase, fontSize: 9, fontWeight: 600}}>{rateLabel}</Box>
          </Box>
        </Box>

        <Box component="tbody">
          {data.map((line) => {
            const isSelected = selectedId === line.lineId;
            const isExpanded = expandedLines.has(line.lineId);
            const hasMachines = (line.machines?.length ?? 0) > 0;

            return (
              <Fragment key={line.lineId}>
                {/* Line row */}
                <Box
                  component="tr"
                  sx={{
                    borderTop: `1px solid ${planningTokens.border}`,
                    bgcolor: isSelected ? '#EFF6FF' : 'white',
                    '&:hover': {bgcolor: '#F8FAFF'},
                  }}
                >
                  <Box
                    component="td"
                    sx={{
                      ...stickyCol,
                      bgcolor: isSelected ? '#EFF6FF' : 'white',
                      borderLeft: isSelected ? `3px solid ${planningTokens.primaryBlue}` : '3px solid transparent',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      cursor: hasMachines ? 'pointer' : 'default',
                    }}
                    onClick={() => hasMachines && onToggleExpand(line.lineId)}
                  >
                    {hasMachines ? (
                      isExpanded
                        ? <ExpandIcon sx={{fontSize: 15, color: planningTokens.textMuted}} />
                        : <CollapseIcon sx={{fontSize: 15, color: planningTokens.textMuted}} />
                    ) : (
                      <Box sx={{width: 15}} />
                    )}
                    <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary}}>
                      {line.lineName}
                    </Typography>
                  </Box>
                  {line.weeks.map((week) =>
                    week.days.map((day) => (
                      <DayCells
                        key={`${line.lineId}-${week.weekLabel}-${day.dayLabel}`}
                        available={day.available}
                        required={day.required}
                        utilizationPct={day.utilizationPct}
                        displayMode={displayMode}
                      />
                    ))
                  )}
                  {(() => {
                    const allDays = line.weeks.flatMap((w) => w.days);
                    const totalAvail = allDays.reduce((s, d) => s + d.available, 0);
                    const totalReq = allDays.reduce((s, d) => s + d.required, 0);
                    const totalUtil = totalAvail > 0 ? Math.round((totalReq / totalAvail) * 100) : 0;
                    return (
                      <DayCells
                        available={totalAvail}
                        required={totalReq}
                        utilizationPct={totalUtil}
                        displayMode={displayMode}
                        borderLeft={`2px solid ${planningTokens.border}`}
                      />
                    );
                  })()}
                </Box>

                {/* Machine rows */}
                {isExpanded &&
                  line.machines?.map((machine) => {
                    const isMachineSelected = selectedMachineIds?.has(machine.machineId) ?? false;
                    return (
                      <Box
                        component="tr"
                        key={`machine-${machine.machineId}`}
                        sx={{
                          borderTop: `1px solid ${planningTokens.border}`,
                          bgcolor: isMachineSelected ? '#DBEAFE' : '#FAFBFF',
                          outline: isMachineSelected ? `2px solid ${planningTokens.primaryBlue}` : 'none',
                          outlineOffset: '-2px',
                          cursor: onMachineClick ? 'pointer' : 'default',
                          '&:hover': {bgcolor: isMachineSelected ? '#BFDBFE' : '#F1F5F9'},
                        }}
                        onClick={() => onMachineClick?.(machine.machineId)}
                      >
                        <Box
                          component="td"
                          sx={{
                            ...stickyCol,
                            bgcolor: isMachineSelected ? '#DBEAFE' : '#FAFBFF',
                            pl: 3.5,
                            fontSize: 11,
                            fontWeight: 500,
                            color: planningTokens.textSecondary,
                          }}
                        >
                          {machine.machineName}
                        </Box>
                        {machine.weeks.map((week) =>
                          week.days.map((day) => (
                            <DayCells
                              key={`${machine.machineId}-${week.weekLabel}-${day.dayLabel}`}
                              available={day.available}
                              required={day.required}
                              utilizationPct={day.utilizationPct}
                              displayMode={displayMode}
                              isMachine
                            />
                          ))
                        )}
                        {(() => {
                          const allDays = machine.weeks.flatMap((w) => w.days);
                          const totalAvail = allDays.reduce((s, d) => s + d.available, 0);
                          const totalReq = allDays.reduce((s, d) => s + d.required, 0);
                          const totalUtil = totalAvail > 0 ? Math.round((totalReq / totalAvail) * 100) : 0;
                          return (
                            <DayCells
                              available={totalAvail}
                              required={totalReq}
                              utilizationPct={totalUtil}
                              displayMode={displayMode}
                              isMachine
                              borderLeft={`2px solid ${planningTokens.border}`}
                            />
                          );
                        })()}
                      </Box>
                    );
                  })}
              </Fragment>
            );
          })}

          <Box component="tr" sx={{borderTop: `2px solid ${planningTokens.border}`, bgcolor: planningTokens.surfaceMuted}}>
            <Box
              component="td"
              sx={{
                ...stickyCol,
                bgcolor: planningTokens.surfaceMuted,
                fontWeight: 800,
              }}
            >
              Total
            </Box>
            {weeks.map((week, weekIndex) =>
              week.days.map((_, dayIndex) => {
                const available = data.reduce((sum, line) => sum + (line.weeks[weekIndex]?.days[dayIndex]?.available ?? 0), 0);
                const required = data.reduce((sum, line) => sum + (line.weeks[weekIndex]?.days[dayIndex]?.required ?? 0), 0);
                const utilizationPct = available > 0 ? Math.round((required / available) * 100) : 0;
                return (
                  <DayCells
                    key={`total-${week.weekLabel}-${dayIndex}`}
                    available={available}
                    required={required}
                    utilizationPct={utilizationPct}
                    displayMode={displayMode}
                  />
                );
              })
            )}
            {(() => {
              const totalAvail = data.reduce(
                (sum, line) => sum + line.weeks.reduce((weekSum, week) => weekSum + week.days.reduce((daySum, day) => daySum + day.available, 0), 0),
                0,
              );
              const totalReq = data.reduce(
                (sum, line) => sum + line.weeks.reduce((weekSum, week) => weekSum + week.days.reduce((daySum, day) => daySum + day.required, 0), 0),
                0,
              );
              const totalUtil = totalAvail > 0 ? Math.round((totalReq / totalAvail) * 100) : 0;
              return (
                <DayCells
                  available={totalAvail}
                  required={totalReq}
                  utilizationPct={totalUtil}
                  displayMode={displayMode}
                  borderLeft={`2px solid ${planningTokens.border}`}
                />
              );
            })()}
          </Box>
        </Box>
      </Box>
      </Box>
      <Box sx={{px: 2, py: 1, borderTop: `1px solid ${planningTokens.border}`, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
        <Stack direction="row" spacing={1} alignItems="center">
          {[
            {color: '#22C55E', label: 'Under 90%'},
            {color: '#FEF08A', label: '90% – 105%'},
            {color: '#FED7AA', label: '105% – 120%'},
            {color: '#FECACA', label: 'Over 120%'},
          ].map((item) => (
            <Stack key={item.label} direction="row" spacing={0.4} alignItems="center">
              <Box sx={{width: 10, height: 10, bgcolor: item.color, borderRadius: 0.5, border: `1px solid rgba(0,0,0,0.1)`}} />
              <Typography sx={{fontSize: 10, color: planningTokens.textSecondary}}>{item.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
