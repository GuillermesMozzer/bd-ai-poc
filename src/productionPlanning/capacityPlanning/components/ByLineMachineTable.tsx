import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip as MuiTooltip,
  Typography,
} from '@mui/material';
import {
  ChevronRight as ChevronRightIcon,
  Download as DownloadIcon,
  ExpandMore as ExpandMoreIcon,
  MoreHoriz as MoreHorizIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {CapacityByLineMachines, CapacityMachine, UtilizationStatus} from '../types';
import {getCellBg, getCellColor, getUtilizationStatus} from '../utils';

function formatK(n: number): string {
  return `${Math.round(n / 1000)}K`;
}

type Props = {
  data: CapacityByLineMachines[];
  selectedLineIds: Set<string> | null;
  expandedLines: Set<string>;
  onToggleLineExpand: (lineId: string) => void;
  selectedCells: Set<string>;
  onCellToggle: (machineId: string, month: string) => void;
  scenarioOverrides: Map<string, number>;
  highlightFilter: 'All' | 'Overloaded' | 'AtRisk';
  onApplyChanges: () => void;
};

export default function ByLineMachineTable({
  data,
  selectedLineIds,
  expandedLines,
  onToggleLineExpand,
  selectedCells,
  onCellToggle,
  scenarioOverrides,
  highlightFilter,
  onApplyChanges,
}: Props) {
  const visibleData = selectedLineIds
    ? data.filter((r) => selectedLineIds.has(r.lineId))
    : data;

  const months = (visibleData[0] ?? data[0])?.months.map((m) => m.month) ?? [];

  function getScenarioAvail(machineId: string, month: string, baseline: number): number {
    return scenarioOverrides.get(`${machineId}-${month}`) ?? baseline;
  }

  function getMachineUtil(machineId: string, month: string, required: number, baselineAvail: number): number {
    const avail = getScenarioAvail(machineId, month, baselineAvail);
    return avail > 0 ? Math.round((required / avail) * 100) : 0;
  }

  function getCellOpacity(status: UtilizationStatus): number {
    if (highlightFilter === 'All') return 1;
    return status === highlightFilter ? 1 : 0.3;
  }

  function lineScenarioAvail(line: CapacityByLineMachines, month: string): number {
    return line.machines.reduce((sum, m) => {
      const mo = m.months.find((mo) => mo.month === month);
      return sum + getScenarioAvail(m.machineId, month, mo?.available ?? 0);
    }, 0);
  }

  function lineRequired(line: CapacityByLineMachines, month: string): number {
    return line.machines.reduce((sum, m) => {
      const mo = m.months.find((mo) => mo.month === month);
      return sum + (mo?.required ?? 0);
    }, 0);
  }

  function lineUtil(line: CapacityByLineMachines, month: string): number {
    const avail = lineScenarioAvail(line, month);
    const req = lineRequired(line, month);
    return avail > 0 ? Math.round((req / avail) * 100) : 0;
  }

  const colStyle = {
    px: 0.75, py: 0.6, fontSize: 11,
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

  function renderLineRow(line: CapacityByLineMachines) {
    const isExpanded = expandedLines.has(line.lineId);
    return (
      <Box component="tr" key={`line-${line.lineId}`} sx={{borderTop: `1px solid ${planningTokens.border}`, bgcolor: planningTokens.surfaceMuted}}>
        <Box
          component="td"
          onClick={() => onToggleLineExpand(line.lineId)}
          sx={{
            px: 1, py: 0.75,
            position: 'sticky', left: 0,
            bgcolor: planningTokens.surfaceMuted, zIndex: 1,
            borderRight: `1px solid ${planningTokens.border}`,
            cursor: 'pointer', userSelect: 'none',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              size="small"
              sx={{p: 0.2, color: planningTokens.textSecondary}}
              onClick={(e) => { e.stopPropagation(); onToggleLineExpand(line.lineId); }}
            >
              {isExpanded
                ? <ExpandMoreIcon sx={{fontSize: 15}} />
                : <ChevronRightIcon sx={{fontSize: 15}} />
              }
            </IconButton>
            <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary}}>
              {line.lineName}
            </Typography>
          </Stack>
        </Box>
        {months.map((month) => {
          const pct = lineUtil(line, month);
          const avail = lineScenarioAvail(line, month);
          return (
            <MuiTooltip key={`${line.lineId}-${month}`} title={`Avail: ${formatK(avail)}`}>
              <Box component="td" sx={{...colStyle, bgcolor: getCellBg(pct), color: getCellColor(pct), fontWeight: 700}}>
                {pct}%
              </Box>
            </MuiTooltip>
          );
        })}
        <Box component="td" sx={{...colStyle, fontWeight: 700, color: planningTokens.textSecondary}}>
          {formatK(months.reduce((s, mo) => s + lineScenarioAvail(line, mo), 0))}
        </Box>
        <Box component="td" sx={{...colStyle, fontWeight: 700, color: planningTokens.textPrimary}}>
          {formatK(months.reduce((s, mo) => s + lineRequired(line, mo), 0))}
        </Box>
      </Box>
    );
  }

  function renderMachineRow(machine: CapacityMachine) {
    return (
      <Box component="tr" key={`mch-${machine.machineId}`} sx={{borderTop: `1px solid ${planningTokens.border}`, '&:hover': {bgcolor: '#F8FAFF'}}}>
        <Box component="td" sx={{
          pl: 4.5, pr: 1, py: 0.5, fontSize: 11, fontWeight: 500,
          color: planningTokens.textSecondary,
          position: 'sticky', left: 0,
          bgcolor: 'white', zIndex: 1,
          borderRight: `1px solid ${planningTokens.border}`,
        }}>
          {machine.machineName}
        </Box>
        {machine.months.map((m) => {
          const cellKey = `${machine.machineId}-${m.month}`;
          const isSelected = selectedCells.has(cellKey);
          const avail = getScenarioAvail(machine.machineId, m.month, m.available);
          const utilPct = getMachineUtil(machine.machineId, m.month, m.required, m.available);
          const status = getUtilizationStatus(utilPct);
          const opacity = getCellOpacity(status);
          return (
            <MuiTooltip key={cellKey} title={`Avail: ${formatK(avail)}`}>
              <Box
                component="td"
                onClick={() => onCellToggle(machine.machineId, m.month)}
                sx={{
                  ...colStyle,
                  bgcolor: isSelected ? '#DBEAFE' : getCellBg(utilPct),
                  color: getCellColor(utilPct),
                  fontWeight: 700,
                  cursor: 'pointer',
                  outline: isSelected ? `2px solid ${planningTokens.primaryBlue}` : 'none',
                  outlineOffset: '-2px',
                  userSelect: 'none',
                  opacity,
                  transition: 'opacity 0.15s',
                }}
              >
                {utilPct}%
              </Box>
            </MuiTooltip>
          );
        })}
        <Box component="td" sx={{...colStyle, fontWeight: 600, color: planningTokens.textSecondary}}>
          {formatK(machine.months.reduce((s, m) => s + getScenarioAvail(machine.machineId, m.month, m.available), 0))}
        </Box>
        <Box component="td" sx={{...colStyle, fontWeight: 600, color: planningTokens.textPrimary}}>
          {formatK(machine.totalReq)}
        </Box>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{borderRadius: 3, border: `1px solid ${planningTokens.border}`, overflow: 'hidden'}}>
      {/* Controls bar */}
      <Box sx={{px: 2, py: 1, borderBottom: `1px solid ${planningTokens.border}`, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1}}>
        <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary, mr: 0.5}}>
          Capacity by Line &amp; Machine (hours)
        </Typography>
        {selectedCells.size > 0 && (
          <Chip
            label={`${selectedCells.size} cells selected`}
            size="small"
            sx={{fontSize: 10, height: 20, bgcolor: 'var(--planning-ai-accent-bg)', color: '#4F46E5', border: '1px solid #C7D2FE'}}
          />
        )}
        <Box sx={{ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5}}>
          <Button
            variant="contained"
            size="small"
            disabled={selectedCells.size === 0}
            onClick={onApplyChanges}
            sx={{fontSize: 11, height: 26, textTransform: 'none', fontWeight: 700, bgcolor: planningTokens.primaryBlue}}
          >
            Apply Changes
          </Button>
          <MuiTooltip title="Refresh"><IconButton size="small" sx={{p: 0.4}}><RefreshIcon sx={{fontSize: 15}} /></IconButton></MuiTooltip>
          <MuiTooltip title="Download"><IconButton size="small" sx={{p: 0.4}}><DownloadIcon sx={{fontSize: 15}} /></IconButton></MuiTooltip>
          <IconButton size="small" sx={{p: 0.4}}><MoreHorizIcon sx={{fontSize: 15}} /></IconButton>
        </Box>
      </Box>

      {/* Table */}
      <Box sx={{overflowX: 'auto'}}>
        <Box component="table" sx={{width: '100%', borderCollapse: 'collapse', minWidth: 900}}>
          <Box component="thead">
            <Box component="tr">
              <Box component="th" sx={{...headerStyle, textAlign: 'left', position: 'sticky', left: 0, bgcolor: planningTokens.surfaceMuted, zIndex: 1, minWidth: 140}}>
                Line / Machine
              </Box>
              {months.map((month) => (
                <Box component="th" key={month} sx={{...headerStyle, minWidth: 64}}>
                  {month}
                </Box>
              ))}
              <Box component="th" sx={{...headerStyle, fontSize: 9}}>Avail.</Box>
              <Box component="th" sx={{...headerStyle, fontSize: 9}}>Req.</Box>
            </Box>
          </Box>

          <Box component="tbody">
            {visibleData.flatMap((line) => {
              const isExpanded = expandedLines.has(line.lineId);
              const machineRows = isExpanded ? line.machines.map(renderMachineRow) : [];
              return [renderLineRow(line), ...machineRows];
            })}

            {/* TOTAL row */}
            <Box component="tr" sx={{borderTop: `2px solid ${planningTokens.border}`, bgcolor: planningTokens.surfaceMuted}}>
              <Box component="td" sx={{px: 1.5, py: 0.6, fontSize: 12, fontWeight: 800, color: planningTokens.textPrimary, position: 'sticky', left: 0, bgcolor: planningTokens.surfaceMuted, zIndex: 1, borderRight: `1px solid ${planningTokens.border}`}}>
                TOTAL
              </Box>
              {months.map((month) => {
                const totalAvail = visibleData.reduce((s, line) => s + lineScenarioAvail(line, month), 0);
                const totalReq = visibleData.reduce((s, line) => s + lineRequired(line, month), 0);
                const pct = totalAvail > 0 ? Math.round((totalReq / totalAvail) * 100) : 0;
                return (
                  <MuiTooltip key={`total-${month}`} title={`Avail: ${formatK(totalAvail)}`}>
                    <Box component="td" sx={{...colStyle, fontWeight: 700, bgcolor: getCellBg(pct), color: getCellColor(pct)}}>
                      {pct}%
                    </Box>
                  </MuiTooltip>
                );
              })}
              <Box component="td" sx={{...colStyle, fontWeight: 800}}>
                {formatK(visibleData.reduce((s, line) => s + months.reduce((ms, mo) => ms + lineScenarioAvail(line, mo), 0), 0))}
              </Box>
              <Box component="td" sx={{...colStyle, fontWeight: 800}}>
                {formatK(visibleData.reduce((s, line) => s + months.reduce((ms, mo) => ms + lineRequired(line, mo), 0), 0))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Footer legend */}
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
        {selectedCells.size > 0 && (
          <Typography sx={{fontSize: 11, color: '#4F46E5', fontWeight: 600}}>
            {selectedCells.size} machine cell{selectedCells.size !== 1 ? 's' : ''} selected — configure adjustment above and preview impact
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
