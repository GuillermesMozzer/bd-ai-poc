import {useMemo, useState} from 'react';
import {Box, Chip, Divider, MenuItem, Paper, Select, Stack, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import {planningTokens} from '../../ui/planningTheme';
import {
  capacityByLineMachines,
  capacityMonthDrilldowns,
  lineShiftSchedules,
  BY_LINE_SCENARIO_LABEL,
} from '../mock';
import type {BulkAdjustmentSpec, PendingCellAdjustment} from '../types';
import {getUtilizationStatus} from '../utils';
import CapacityHierarchyExplorer from './CapacityHierarchyExplorer';
import BulkAdjustmentPanel from './BulkAdjustmentPanel';
import ByLineDrilldownTable from './ByLineDrilldownTable';
import ImpactPreviewDrawer from './ImpactPreviewDrawer';
import LineShiftScheduleBar from './LineShiftScheduleBar';

const MONTHS = [
  'Jun-2026', 'Jul-2026', 'Aug-2026', 'Sep-2026', 'Oct-2026', 'Nov-2026',
  'Dec-2026', 'Jan-2027', 'Feb-2027', 'Mar-2027', 'Apr-2027', 'May-2027',
];

type HighlightFilter = 'All' | 'Overloaded' | 'AtRisk';

function buildInitialOverrides(): Map<string, number> {
  const map = new Map<string, number>();
  for (const row of capacityByLineMachines) {
    for (const machine of row.machines) {
      for (const m of machine.months) {
        map.set(`${machine.machineId}-${m.month}`, m.available);
      }
    }
  }
  return map;
}

function computePendingAdjustments(
  selectedCells: Set<string>,
  spec: BulkAdjustmentSpec,
  scenarioOverrides: Map<string, number>,
): PendingCellAdjustment[] {
  const results: PendingCellAdjustment[] = [];

  for (const key of selectedCells) {
    const monthMatch = key.match(/-([A-Z][a-z]{2}-\d{4})$/);
    if (!monthMatch) continue;
    const month = monthMatch[1];
    const machineId = key.slice(0, key.length - month.length - 1);

    let machine: typeof capacityByLineMachines[0]['machines'][0] | undefined;
    let parentLine: typeof capacityByLineMachines[0] | undefined;
    for (const row of capacityByLineMachines) {
      const found = row.machines.find((m) => m.machineId === machineId);
      if (found) { machine = found; parentLine = row; break; }
    }
    if (!machine || !parentLine) continue;

    const monthData = machine.months.find((m) => m.month === month);
    if (!monthData) continue;

    const currentAvail = scenarioOverrides.get(key) ?? monthData.available;
    let newAvail: number;
    switch (spec.adjustmentType) {
      case 'AddHours':      newAvail = currentAvail + spec.adjustmentValue; break;
      case 'SubtractHours': newAvail = Math.max(0, currentAvail - spec.adjustmentValue); break;
      case 'SetHours':      newAvail = spec.adjustmentValue; break;
      case 'AddPct':        newAvail = Math.round(currentAvail * (1 + spec.adjustmentValue / 100)); break;
      case 'SubtractPct':   newAvail = Math.round(currentAvail * (1 - spec.adjustmentValue / 100)); break;
    }

    const scenarioUtilPct = newAvail > 0 ? Math.round((monthData.required / newAvail) * 100) : 0;
    results.push({
      lineId: machineId,
      lineName: `${parentLine.lineName} / ${machine.machineName}`,
      month,
      baselineAvailable: monthData.available,
      baselineRequired: monthData.required,
      baselineUtilPct: monthData.utilizationPct,
      baselineStatus: getUtilizationStatus(monthData.utilizationPct),
      scenarioAvailable: newAvail,
      scenarioUtilPct,
      scenarioStatus: getUtilizationStatus(scenarioUtilPct),
      adjustmentType: spec.adjustmentType,
      adjustmentValue: spec.adjustmentValue,
      hoursDelta: newAvail - monthData.available,
    });
  }

  return results;
}

export default function ByLineTab() {
  const [hierarchySelected, setHierarchySelected] = useState<string | null>(null);
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());
  const [highlightFilter, setHighlightFilter] = useState<HighlightFilter>('All');
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [adjustmentSpec, setAdjustmentSpec] = useState<BulkAdjustmentSpec | null>(null);
  const [scenarioOverrides, setScenarioOverrides] = useState<Map<string, number>>(buildInitialOverrides);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [pendingAdjustments, setPendingAdjustments] = useState<PendingCellAdjustment[]>([]);

  const [selectedMonth, setSelectedMonth] = useState('Mar-2027');
  const [displayMode, setDisplayMode] = useState<'hrs' | 'pct'>('hrs');

  // Derive visible line filter from hierarchy selection
  const visibleLineIds = useMemo<Set<string> | null>(() => {
    if (!hierarchySelected) return null;
    const isLine = capacityByLineMachines.some((r) => r.lineId === hierarchySelected);
    if (isLine) return new Set([hierarchySelected]);
    for (const row of capacityByLineMachines) {
      if (row.machines.some((m) => m.machineId === hierarchySelected)) {
        return new Set([row.lineId]);
      }
    }
    return null;
  }, [hierarchySelected]);

  // Build drilldown data for the selected month, filtered by hierarchy
  const drilldownData = useMemo(() => {
    const lines = visibleLineIds
      ? capacityByLineMachines.filter((r) => visibleLineIds.has(r.lineId))
      : capacityByLineMachines;
    return lines
      .map((line) => capacityMonthDrilldowns[`${line.lineId}-${selectedMonth}`])
      .filter(Boolean);
  }, [visibleLineIds, selectedMonth]);

  // Shift schedule for the selected (first visible) line
  const primarySchedule = useMemo(() => {
    const firstLineId = visibleLineIds
      ? [...visibleLineIds][0]
      : capacityByLineMachines[0]?.lineId;
    return lineShiftSchedules.find((s) => s.lineId === firstLineId)
      ?? lineShiftSchedules[0];
  }, [visibleLineIds]);

  // Machine IDs selected for the current month
  const selectedMachineIds = useMemo(() => {
    const ids = new Set<string>();
    for (const key of selectedCells) {
      const monthMatch = key.match(/-([A-Z][a-z]{2}-\d{4})$/);
      if (monthMatch && monthMatch[1] === selectedMonth) {
        ids.add(key.slice(0, key.length - monthMatch[1].length - 1));
      }
    }
    return ids;
  }, [selectedCells, selectedMonth]);

  function handleHierarchySelect(id: string | null) {
    setHierarchySelected(id);
    if (!id) return;
    const lineId = capacityByLineMachines.find(
      (r) => r.lineId === id || r.machines.some((m) => m.machineId === id),
    )?.lineId;
    if (lineId) setExpandedLines((prev) => new Set([...prev, lineId]));
  }

  function handleToggleLineExpand(lineId: string) {
    setExpandedLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  }

  function handleMachineClick(machineId: string) {
    const key = `${machineId}-${selectedMonth}`;
    setSelectedCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleClearSelection() {
    setSelectedCells(new Set());
    setAdjustmentSpec(null);
  }

  function handlePreview() {
    if (!adjustmentSpec || selectedCells.size === 0) return;
    const pending = computePendingAdjustments(selectedCells, adjustmentSpec, scenarioOverrides);
    setPendingAdjustments(pending);
    setPreviewOpen(true);
  }

  function handleApply(_reason: string, _comment: string) {
    const updatedMap = new Map(scenarioOverrides);
    for (const adj of pendingAdjustments) {
      updatedMap.set(`${adj.lineId}-${adj.month}`, adj.scenarioAvailable);
    }
    setScenarioOverrides(updatedMap);
    setSelectedCells(new Set());
    setPendingAdjustments([]);
    setAdjustmentSpec(null);
    setPreviewOpen(false);
  }

  const HIGHLIGHT_OPTIONS: HighlightFilter[] = ['All', 'Overloaded', 'AtRisk'];
  const highlightColors: Record<HighlightFilter, {active: string; bg: string}> = {
    All: {active: planningTokens.primaryBlue, bg: '#EEF2FF'},
    Overloaded: {active: '#DC2626', bg: '#FEF2F2'},
    AtRisk: {active: '#F97316', bg: '#FFF7ED'},
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
      {/* Toolbar */}
      <Paper
        elevation={0}
        sx={{
          border: `1px solid ${planningTokens.border}`,
          borderRadius: 2,
          px: 2, py: 0.75,
          display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap',
        }}
      >
        {/* Month selector */}
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>Month:</Typography>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            size="small"
            sx={{fontSize: 11, height: 28, '.MuiSelect-select': {py: '3px', pr: '28px !important'}}}
          >
            {MONTHS.map((m) => <MenuItem key={m} value={m} sx={{fontSize: 11}}>{m}</MenuItem>)}
          </Select>
        </Stack>

        <Divider orientation="vertical" flexItem />

        {/* Highlight filter */}
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>Highlight:</Typography>
          {HIGHLIGHT_OPTIONS.map((opt) => {
            const active = highlightFilter === opt;
            const colors = highlightColors[opt];
            return (
              <Chip
                key={opt}
                label={opt}
                size="small"
                onClick={() => setHighlightFilter(opt)}
                sx={{
                  fontSize: 10, height: 22, cursor: 'pointer',
                  bgcolor: active ? colors.active : 'transparent',
                  color: active ? 'white' : planningTokens.textSecondary,
                  border: `1px solid ${active ? colors.active : planningTokens.border}`,
                  fontWeight: active ? 700 : 400,
                  '&:hover': {bgcolor: active ? colors.active : colors.bg},
                }}
              />
            );
          })}
        </Stack>

        <Divider orientation="vertical" flexItem />

        <Typography sx={{fontSize: 11, color: planningTokens.textMuted, flex: 1}}>
          Click machine rows to select, then configure a bulk adjustment.
        </Typography>
      </Paper>

      {/* Sidebar + Main */}
      <Box sx={{display: 'grid', gridTemplateColumns: '240px 1fr', gap: 1.5, alignItems: 'start'}}>
        {/* Hierarchy Explorer */}
        <Paper
          elevation={0}
          sx={{
            border: `1px solid ${planningTokens.border}`,
            borderRadius: 3,
            overflow: 'hidden',
            minHeight: 400,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <CapacityHierarchyExplorer
            lines={capacityByLineMachines}
            selectedId={hierarchySelected}
            onSelect={handleHierarchySelect}
          />
        </Paper>

        {/* Main work area */}
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
          {selectedCells.size > 0 && (
            <BulkAdjustmentPanel
              selectedCellCount={selectedCells.size}
              spec={adjustmentSpec}
              onSpecChange={setAdjustmentSpec}
              onPreview={handlePreview}
              onClearSelection={handleClearSelection}
            />
          )}

          <Paper
            elevation={0}
            sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 3, overflow: 'hidden'}}
          >
            {primarySchedule && (
              <LineShiftScheduleBar
                schedule={primarySchedule}
                rightSlot={
                  <ToggleButtonGroup
                    value={displayMode}
                    exclusive
                    onChange={(_, v) => v && setDisplayMode(v)}
                    size="small"
                  >
                    <ToggleButton value="hrs" sx={{py: 0.25, px: 1, fontSize: 10, lineHeight: 1.4}}>hrs</ToggleButton>
                    <ToggleButton value="pct" sx={{py: 0.25, px: 1, fontSize: 10, lineHeight: 1.4}}>%</ToggleButton>
                  </ToggleButtonGroup>
                }
              />
            )}
            <ByLineDrilldownTable
              data={drilldownData}
              displayMode={displayMode}
              shiftSchedules={lineShiftSchedules}
              selectedId={hierarchySelected}
              expandedLines={expandedLines}
              onToggleExpand={handleToggleLineExpand}
              selectedMachineIds={selectedMachineIds}
              onMachineClick={handleMachineClick}
            />
          </Paper>

        </Box>
      </Box>

      <ImpactPreviewDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pending={pendingAdjustments}
        scenarioLabel={BY_LINE_SCENARIO_LABEL}
        onApply={handleApply}
      />
    </Box>
  );
}
