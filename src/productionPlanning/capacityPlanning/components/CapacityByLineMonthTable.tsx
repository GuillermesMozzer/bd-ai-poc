import {Fragment, useState} from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Select,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Download as DownloadIcon,
  InfoOutlined as InfoOutlinedIcon,
  MoreHoriz as MoreHorizIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {CapacityByLine, CapacityUnit, LineShiftSchedule, UtilizationStatus} from '../types';
import {convertCapacityHours, formatCapacityValue, getCellBg, getCellColor, getUtilizationStatus} from '../utils';
import CapacityUnitDropdown from './CapacityUnitDropdown';

function formatK(n: number): string {
  return `${Math.round(n / 1000)}K`;
}

const DEFAULT_SCHEDULE: LineShiftSchedule = {
  lineId: '',
  shiftsPerDay: 3,
  daysPerWeek: 5,
  workingDaysPerMonth: 22,
  shifts: [],
};

function hrsHeader(unit: CapacityUnit): string {
  switch (unit) {
    case 'pct': return 'hrs';
    case 'perMonth': return 'hrs/mo';
    case 'perWeek': return 'hrs/wk';
    case 'perDay': return 'hrs/day';
    case 'perShift': return 'hrs/sh';
  }
}

function rateHeader(unit: CapacityUnit): string {
  switch (unit) {
    case 'pct': return 'rate';
    case 'perMonth': return 'rate/mo';
    case 'perWeek': return 'rate/wk';
    case 'perDay': return 'rate/day';
    case 'perShift': return 'rate/sh';
  }
}

type Props = {
  data: CapacityByLine[];
  unit?: CapacityUnit;
  shiftSchedules?: LineShiftSchedule[];
  // Optional controlled props — when omitted the component manages its own state
  selectedLineIds?: Set<string>;
  selectedCells?: Set<string>;
  onCellToggle?: (lineId: string, month: string) => void;
  scenarioOverrides?: Map<string, number>;
  highlightFilter?: 'All' | 'Overloaded' | 'AtRisk';
  forceEditMode?: boolean;
  onApplyChanges?: () => void;
};

export default function CapacityByLineMonthTable({
  data,
  unit: unitProp,
  shiftSchedules,
  selectedLineIds,
  selectedCells: controlledCells,
  onCellToggle,
  scenarioOverrides,
  highlightFilter,
  forceEditMode,
  onApplyChanges,
}: Props) {
  const [internalUnit, setInternalUnit] = useState<CapacityUnit>('pct');
  const unit = unitProp ?? internalUnit;
  const setUnit = unitProp !== undefined ? () => {} : setInternalUnit;

  const [internalCells, setInternalCells] = useState<Set<string>>(new Set([
    'line-10-Mar-2027', 'line-10-Apr-2027',
    'line-07-Mar-2027', 'line-07-Apr-2027',
    'line-03-Mar-2027', 'line-03-Apr-2027',
    'line-05-Mar-2027', 'line-05-Apr-2027',
    'line-02-Mar-2027', 'line-02-Apr-2027',
    'line-01-Mar-2027', 'line-01-Apr-2027',
  ]));
  const [groupBy, setGroupBy] = useState('Line');
  const [editMode, setEditMode] = useState('Bulk Edit');
  const [viewMode, setViewMode] = useState<'baseline' | 'scenario'>('scenario');

  const isControlled = controlledCells !== undefined;
  const selectedCells = isControlled ? controlledCells : internalCells;
  const isEditMode = forceEditMode ?? (editMode === 'Bulk Edit');

  function scheduleFor(lineId: string): LineShiftSchedule {
    return shiftSchedules?.find((s) => s.lineId === lineId) ?? DEFAULT_SCHEDULE;
  }

  function formatHrs(lineId: string, hrs: number): string {
    if (unit === 'pct') return formatK(hrs);
    const converted = convertCapacityHours(hrs, unit, scheduleFor(lineId));
    return formatCapacityValue(converted, unit);
  }

  // Apply line filter when controlled
  const visibleData = selectedLineIds
    ? data.filter((r) => selectedLineIds.has(r.lineId))
    : data;

  const months = visibleData[0]?.months.map((m) => m.month) ?? [];

  function getScenarioAvail(lineId: string, month: string, baseline: number): number {
    if (viewMode !== 'scenario' || !scenarioOverrides) return baseline;
    return scenarioOverrides.get(`${lineId}-${month}`) ?? baseline;
  }

  function getScenarioUtil(lineId: string, month: string, required: number, baselineAvail: number): number {
    const avail = getScenarioAvail(lineId, month, baselineAvail);
    if (avail === 0) return 0;
    return Math.round((required / avail) * 100);
  }

  function getCellOpacity(status: UtilizationStatus): number {
    if (!highlightFilter || highlightFilter === 'All') return 1;
    return status === highlightFilter ? 1 : 0.3;
  }

  function toggleCell(lineId: string, month: string) {
    if (!isEditMode) return;
    if (isControlled && onCellToggle) {
      onCellToggle(lineId, month);
      return;
    }
    const key = `${lineId}-${month}`;
    setInternalCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleReset() {
    if (isControlled && onCellToggle) return; // parent manages reset
    setInternalCells(new Set());
  }

  function handleApply() {
    if (onApplyChanges) onApplyChanges();
  }

  const colStyle = {
    px: 1,
    py: 0.6,
    fontSize: 11,
    textAlign: 'center' as const,
    whiteSpace: 'nowrap' as const,
    borderRight: `1px solid ${planningTokens.border}`,
  };
  const headerStyle = {
    ...colStyle,
    fontWeight: 700,
    color: planningTokens.textSecondary,
    bgcolor: planningTokens.surfaceMuted,
    fontSize: 10,
  };

  return (
    <Paper elevation={0} sx={{borderRadius: 3, border: `1px solid ${planningTokens.border}`, overflow: 'hidden'}}>
      {/* Controls bar */}
      <Box sx={{px: 2, py: 1, borderBottom: `1px solid ${planningTokens.border}`, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1}}>
        <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary, mr: 0.5}}>
          Capacity Overview
        </Typography>
        <Divider orientation="vertical" flexItem sx={{mx: 0.5}} />
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>Group by:</Typography>
          <Select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            size="small"
            sx={{fontSize: 11, height: 26, '.MuiSelect-select': {py: '3px', pr: '28px !important'}}}
          >
            {['Line', 'Building', 'Product Family'].map((o) => <MenuItem key={o} value={o} sx={{fontSize: 11}}>{o}</MenuItem>)}
          </Select>
        </Stack>
        <Box sx={{ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5}}>
          <Tooltip title="Download"><IconButton size="small" sx={{p: 0.4}}><DownloadIcon sx={{fontSize: 15}} /></IconButton></Tooltip>
          <IconButton size="small" sx={{p: 0.4}}><MoreHorizIcon sx={{fontSize: 15}} /></IconButton>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{overflowX: 'auto'}}>
        <Box component="table" sx={{width: '100%', borderCollapse: 'collapse', minWidth: 900}}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{...headerStyle, textAlign: 'left', position: 'sticky', left: 0, bgcolor: planningTokens.surfaceMuted, zIndex: 1, minWidth: 70}}>Line</Box>
              {months.map((month) => (
                <Box component="th" key={month} colSpan={2} sx={{...headerStyle, borderBottom: `1px solid ${planningTokens.border}`, minWidth: 90}}>
                  {month}
                </Box>
              ))}
              <Box component="th" colSpan={2} sx={{...headerStyle}}>Total</Box>
            </Box>
            <Box component="tr">
              <Box component="th" sx={{...headerStyle, textAlign: 'left', position: 'sticky', left: 0, bgcolor: planningTokens.surfaceMuted, zIndex: 1}} />
              {months.map((month) => (
                <Fragment key={month}>
                  <Box component="th" sx={{...headerStyle, fontSize: 9}}>
                    <Stack direction="row" alignItems="center" justifyContent="center" gap={0.3}>
                      {hrsHeader(unit)}
                      <Tooltip title="Available capacity hours" arrow>
                        <InfoOutlinedIcon sx={{fontSize: 9, color: planningTokens.textSecondary, cursor: 'help'}} />
                      </Tooltip>
                    </Stack>
                  </Box>
                  <Box component="th" sx={{...headerStyle, fontSize: 9}}>
                    <Stack direction="row" alignItems="center" justifyContent="center" gap={0.3}>
                      {rateHeader(unit)}
                      <Tooltip title="Capacity rate" arrow>
                        <InfoOutlinedIcon sx={{fontSize: 9, color: planningTokens.textSecondary, cursor: 'help'}} />
                      </Tooltip>
                    </Stack>
                  </Box>
                </Fragment>
              ))}
              <Box component="th" sx={{...headerStyle, fontSize: 9}}>{hrsHeader(unit)}</Box>
              <Box component="th" sx={{...headerStyle, fontSize: 9}}>Req.</Box>
            </Box>
          </Box>
          <Box component="tbody">
            {visibleData.map((row) => (
              <Box component="tr" key={row.lineId} sx={{borderTop: `1px solid ${planningTokens.border}`, '&:hover': {bgcolor: '#F8FAFF'}}}>
                <Box component="td" sx={{px: 1.5, py: 0.6, fontSize: 12, fontWeight: 600, color: planningTokens.textPrimary, position: 'sticky', left: 0, bgcolor: 'white', zIndex: 1, borderRight: `1px solid ${planningTokens.border}`}}>
                  {row.lineName}
                </Box>
                {row.months.map((m) => {
                  const cellKey = `${row.lineId}-${m.month}`;
                  const isSelected = selectedCells.has(cellKey);
                  const avail = getScenarioAvail(row.lineId, m.month, m.available);
                  const utilPct = getScenarioUtil(row.lineId, m.month, m.required, m.available);
                  const status = getUtilizationStatus(utilPct);
                  const opacity = getCellOpacity(status);
                  return (
                    <Fragment key={cellKey}>
                      <Box
                        component="td"
                        sx={{...colStyle, color: planningTokens.textSecondary, cursor: 'default'}}
                      >
                        {formatHrs(row.lineId, avail)}
                      </Box>
                      <Box
                        component="td"
                        onClick={() => toggleCell(row.lineId, m.month)}
                        sx={{
                          ...colStyle,
                          bgcolor: isSelected ? '#DBEAFE' : getCellBg(utilPct),
                          color: getCellColor(utilPct),
                          fontWeight: 700,
                          cursor: isEditMode ? 'pointer' : 'default',
                          outline: isSelected ? `2px solid ${planningTokens.primaryBlue}` : 'none',
                          outlineOffset: '-2px',
                          userSelect: 'none',
                          opacity,
                          transition: 'opacity 0.15s',
                        }}
                      >
                        {formatHrs(row.lineId, m.required)}
                      </Box>
                    </Fragment>
                  );
                })}
                {/* Total avail/req for row — use scenario avail for total */}
                <Box component="td" sx={{...colStyle, fontWeight: 600, color: planningTokens.textSecondary}}>
                  {formatHrs(row.lineId, row.months.reduce((sum, m) => sum + getScenarioAvail(row.lineId, m.month, m.available), 0))}
                </Box>
                <Box component="td" sx={{...colStyle, fontWeight: 600, color: planningTokens.textPrimary}}>{formatK(row.totalReq)}</Box>
              </Box>
            ))}
            {/* TOTAL row */}
            <Box component="tr" sx={{borderTop: `2px solid ${planningTokens.border}`, bgcolor: planningTokens.surfaceMuted}}>
              <Box component="td" sx={{px: 1.5, py: 0.6, fontSize: 12, fontWeight: 800, color: planningTokens.textPrimary, position: 'sticky', left: 0, bgcolor: planningTokens.surfaceMuted, zIndex: 1, borderRight: `1px solid ${planningTokens.border}`}}>
                TOTAL
              </Box>
              {visibleData[0]?.months.map((m, i) => {
                const totalAvail = visibleData.reduce((sum, row) => sum + getScenarioAvail(row.lineId, m.month, row.months[i].available), 0);
                const totalReq = visibleData.reduce((sum, row) => sum + row.months[i].required, 0);
                const pct = totalAvail > 0 ? Math.round((totalReq / totalAvail) * 100) : 0;
                return (
                  <Fragment key={`total-${m.month}`}>
                    <Box component="td" sx={{...colStyle, fontWeight: 700, color: planningTokens.textSecondary}}>
                      {formatHrs('', totalAvail)}
                    </Box>
                    <Box component="td" sx={{...colStyle, fontWeight: 700, bgcolor: getCellBg(pct), color: getCellColor(pct)}}>
                      {formatHrs('', totalReq)}
                    </Box>
                  </Fragment>
                );
              })}
              <Box component="td" sx={{...colStyle, fontWeight: 800}}>
                {formatHrs('', visibleData.reduce((s, r) => s + r.months.reduce((ms, m) => ms + getScenarioAvail(r.lineId, m.month, m.available), 0), 0))}
              </Box>
              <Box component="td" sx={{...colStyle, fontWeight: 800}}>{formatK(visibleData.reduce((s, r) => s + r.totalReq, 0))}</Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
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
    </Paper>
  );
}
