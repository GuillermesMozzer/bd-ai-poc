import {useState, useMemo} from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AutoGraph as DesignIcon,
  Tune as PlanningIcon,
  History as HistoryIcon,
  AutoAwesome as AiIcon,
} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import {
  capacityByLineMachines,
  lineDesignCapacities,
  lineShiftSchedules,
  planningAssumptions,
  historicalActualCapacity,
  aiCapacityProposals,
  equipmentOeeTrends,
  equipmentLedgers,
  CURRENT_USER,
} from '../mock';
import type {AiCapacityProposal, PlanningAssumption} from '../types';
import CapacityHierarchyExplorer from './CapacityHierarchyExplorer';
import DesignCapacitySection from './DesignCapacitySection';
import PlanningAssumptionsSection from './PlanningAssumptionsSection';
import HistoricalCapacitySection from './HistoricalCapacitySection';
import AiCapacityAnalysisPanel from './AiCapacityAnalysisPanel';
import EquipmentDetailPanel from './EquipmentDetailPanel';
import AllLinesCapacitySummary from './AllLinesCapacitySummary';
import LineShiftScheduleModal from './LineShiftScheduleModal';

function EmptyState() {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320, flexDirection: 'column', gap: 1}}>
      <PlanningIcon sx={{fontSize: 40, color: planningTokens.border}} />
      <Typography sx={{fontSize: 14, fontWeight: 600, color: planningTokens.textSecondary}}>
        Select a line to view capacity configuration
      </Typography>
      <Typography sx={{fontSize: 12, color: planningTokens.textMuted}}>
        Use the hierarchy on the left to select a production line.
      </Typography>
    </Box>
  );
}

export default function LineCapacityManagementTab() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [assumptionEdits, setAssumptionEdits] = useState<Map<string, PlanningAssumption>>(new Map());
  const [proposals, setProposals] = useState<Map<string, AiCapacityProposal>>(() => {
    const map = new Map<string, AiCapacityProposal>();
    for (const p of aiCapacityProposals) map.set(p.lineId, p);
    return map;
  });
  const [saveSnack, setSaveSnack] = useState(false);
  const [shiftScheduleOpen, setShiftScheduleOpen] = useState(false);

  function handleHierarchySelect(id: string | null) {
    setSelectedId(id);
  }

  // Determine what is selected
  const selectedMachine = useMemo(() => {
    if (!selectedId) return null;
    for (const row of capacityByLineMachines) {
      const m = row.machines.find((m) => m.machineId === selectedId);
      if (m) return {machine: m, line: row};
    }
    return null;
  }, [selectedId]);

  // Resolve to lineId when a line (not machine) is selected
  const resolvedLineId = useMemo(() => {
    if (!selectedId) return null;
    if (selectedMachine) return null; // machine selected — handled separately
    if (capacityByLineMachines.some((r) => r.lineId === selectedId)) return selectedId;
    return null;
  }, [selectedId, selectedMachine]);

  const design = resolvedLineId ? lineDesignCapacities.find((d) => d.lineId === resolvedLineId) : null;
  const baseAssumption = resolvedLineId ? planningAssumptions.find((a) => a.lineId === resolvedLineId) : null;
  const assumption = resolvedLineId
    ? (assumptionEdits.get(resolvedLineId) ?? baseAssumption)
    : null;
  const history = resolvedLineId
    ? historicalActualCapacity.filter((h) => h.lineId === resolvedLineId)
    : [];
  const proposal = resolvedLineId ? proposals.get(resolvedLineId) ?? null : null;
  const lineName = capacityByLineMachines.find((r) => r.lineId === resolvedLineId)?.lineName ?? '';
  const selectedShiftSchedule = resolvedLineId
    ? lineShiftSchedules.find((schedule) => schedule.lineId === resolvedLineId) ?? null
    : null;

  function handleAssumptionChange(updated: PlanningAssumption) {
    if (!resolvedLineId) return;
    setAssumptionEdits((prev) => new Map(prev).set(resolvedLineId, updated));
  }

  function handleSave() {
    if (!resolvedLineId || !assumption) return;
    setAssumptionEdits((prev) => new Map(prev).set(resolvedLineId, {
      ...assumption,
      lastUpdatedBy: CURRENT_USER,
      lastUpdatedAt: new Date().toISOString().slice(0, 10),
    }));
    setSaveSnack(true);
  }

  function handleAnalyze() {
    if (!resolvedLineId) return;
    const existing = proposals.get(resolvedLineId);
    if (existing) {
      setProposals((prev) => new Map(prev).set(resolvedLineId, {...existing, status: 'pending'}));
    }
  }

  function handleAccept(p: AiCapacityProposal) {
    if (!resolvedLineId || !assumption) return;
    setProposals((prev) => new Map(prev).set(resolvedLineId, {...p, status: 'accepted'}));
    setAssumptionEdits((prev) => new Map(prev).set(resolvedLineId, {
      ...assumption,
      planningEfficiencyFactor: p.proposedEfficiencyFactor,
      effectivePlanningHrsPerMonth: p.proposedPlanningHrsPerMonth,
      aiProposed: true,
      lastUpdatedBy: 'AI',
      lastUpdatedAt: new Date().toISOString().slice(0, 10),
    }));
  }

  function handleReject(p: AiCapacityProposal) {
    if (!resolvedLineId) return;
    setProposals((prev) => new Map(prev).set(resolvedLineId, {...p, status: 'rejected'}));
  }

  const sectionHeaderSx = {fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary};

  return (
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
          selectedId={selectedId}
          onSelect={handleHierarchySelect}
        />
      </Paper>

      {/* Right panel */}
      <Box>
        {/* All Lines: no selection */}
        {!selectedId && (
          <AllLinesCapacitySummary
            lines={capacityByLineMachines}
            designCapacities={lineDesignCapacities}
            assumptions={[...planningAssumptions.map((a) => assumptionEdits.get(a.lineId) ?? a)]}
          />
        )}

        {/* Machine selected */}
        {selectedMachine && (
          <EquipmentDetailPanel
            machineId={selectedMachine.machine.machineId}
            machineName={selectedMachine.machine.machineName}
            lineName={selectedMachine.line.lineName}
            oeeData={equipmentOeeTrends[selectedMachine.machine.machineId] ?? []}
            ledger={equipmentLedgers[selectedMachine.machine.machineId] ?? []}
          />
        )}

        {/* Line selected */}
        {resolvedLineId && !selectedMachine && (!design || !assumption ? (
          <Paper elevation={0} sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 3}}>
            <EmptyState />
          </Paper>
        ) : (
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 0}}>
            {/* Title */}
            <Paper elevation={0} sx={{border: `1px solid ${planningTokens.border}`, borderRadius: '12px 12px 0 0', borderBottom: 'none', px: 2, py: 1.25}}>
              <Typography sx={{fontSize: 15, fontWeight: 800, color: planningTokens.textPrimary}}>
                {lineName}
              </Typography>
              <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>
                Line Capacity Configuration
              </Typography>
            </Paper>

            {/* Design Capacity */}
            <Accordion
              disableGutters
              defaultExpanded
              elevation={0}
              sx={{border: `1px solid ${planningTokens.border}`, borderBottom: 'none', borderRadius: 0, '&::before': {display: 'none'}}}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{fontSize: 18}} />} sx={{px: 2, minHeight: 40, '& .MuiAccordionSummary-content': {my: 0.75}}}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <DesignIcon sx={{fontSize: 15, color: planningTokens.textMuted}} />
                  <Typography sx={sectionHeaderSx}>Design Capacity</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{px: 2, pb: 2, pt: 0}}>
                <DesignCapacitySection
                  design={design}
                  onOpenAvailableTime={() => setShiftScheduleOpen(true)}
                />
              </AccordionDetails>
            </Accordion>

            {/* Planning Assumptions */}
            <Accordion
              disableGutters
              defaultExpanded
              elevation={0}
              sx={{border: `1px solid ${planningTokens.border}`, borderBottom: 'none', borderRadius: 0, '&::before': {display: 'none'}}}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{fontSize: 18}} />} sx={{px: 2, minHeight: 40, '& .MuiAccordionSummary-content': {my: 0.75}}}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <PlanningIcon sx={{fontSize: 15, color: planningTokens.primaryBlue}} />
                  <Typography sx={sectionHeaderSx}>Planning Assumptions</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{px: 2, pb: 2, pt: 0}}>
                <PlanningAssumptionsSection
                  assumption={assumption}
                  design={design}
                  onChange={handleAssumptionChange}
                  onSave={handleSave}
                />
              </AccordionDetails>
            </Accordion>

            {/* Historical Actual */}
            <Accordion
              disableGutters
              defaultExpanded
              elevation={0}
              sx={{border: `1px solid ${planningTokens.border}`, borderBottom: 'none', borderRadius: 0, '&::before': {display: 'none'}}}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{fontSize: 18}} />} sx={{px: 2, minHeight: 40, '& .MuiAccordionSummary-content': {my: 0.75}}}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <HistoryIcon sx={{fontSize: 15, color: planningTokens.textMuted}} />
                  <Typography sx={sectionHeaderSx}>Historical Actual (last 12 months)</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{px: 2, pb: 2, pt: 0}}>
                {history.length > 0
                  ? <HistoricalCapacitySection history={history} design={design} />
                  : <Typography sx={{fontSize: 12, color: planningTokens.textMuted}}>No historical data available.</Typography>
                }
              </AccordionDetails>
            </Accordion>

            {/* AI Analysis */}
            <Accordion
              disableGutters
              elevation={0}
              sx={{border: `1px solid ${planningTokens.border}`, borderRadius: '0 0 12px 12px', '&::before': {display: 'none'}}}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon sx={{fontSize: 18}} />} sx={{px: 2, minHeight: 40, '& .MuiAccordionSummary-content': {my: 0.75}}}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <AiIcon sx={{fontSize: 15, color: '#7C3AED'}} />
                  <Typography sx={sectionHeaderSx}>AI Capacity Analysis</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{px: 2, pb: 2, pt: 0}}>
                <AiCapacityAnalysisPanel
                  lineId={resolvedLineId}
                  proposal={proposal}
                  onAnalyze={handleAnalyze}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        ))}
      </Box>

      <Snackbar
        open={saveSnack}
        autoHideDuration={3000}
        onClose={() => setSaveSnack(false)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      >
        <Alert severity="success" onClose={() => setSaveSnack(false)} sx={{fontSize: 12}}>
          Planning assumptions saved successfully.
        </Alert>
      </Snackbar>

      <LineShiftScheduleModal
        open={shiftScheduleOpen}
        lineName={lineName}
        schedule={selectedShiftSchedule}
        onClose={() => setShiftScheduleOpen(false)}
      />
    </Box>
  );
}
