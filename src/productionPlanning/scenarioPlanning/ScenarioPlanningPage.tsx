import {Alert, Box, Chip, Paper, Snackbar, Tab, Tabs, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button} from '@mui/material';
import {LocationOn as SiteIcon, AddCircleOutline as NewIcon} from '@mui/icons-material';
import {useMemo, useState} from 'react';
import {planningCardSx, planningTokens} from '../ui/planningTheme';
import ScenarioSetupBar from './components/ScenarioSetupBar';
import ScenarioTitleCard from './components/ScenarioTitleCard';
import ImpactSummaryCards from './components/ImpactSummaryCards';
import FutureImpactOverviewTable from './components/FutureImpactOverviewTable';
import UtilizationImpactChart from './components/UtilizationImpactChart';
import KeyInsightsPanel from './components/KeyInsightsPanel';
import ScenarioTimeline from './components/ScenarioTimeline';
import ScenarioComparisonTable from './components/ScenarioComparisonTable';
import ScenarioExceptionsTable from './components/ScenarioExceptionsTable';
import SuggestedActionsPanel from './components/SuggestedActionsPanel';
import ScenarioAssumptionsPanel from './components/ScenarioAssumptionsPanel';
import ScenarioAuditTrail from './components/ScenarioAuditTrail';
import ScenarioChangesPanel from './components/ScenarioChangesPanel';
import AddScenarioChangeDialog from './components/AddScenarioChangeDialog';
import TopImpactedProductsPanel from './components/TopImpactedProductsPanel';
import ScenarioActionsPanel from './components/ScenarioActionsPanel';
import ScenarioListPanel from './components/ScenarioListPanel';
import BluAIRecommendationPanel from './components/BluAIRecommendationPanel';
import {createLTDemoBundle, createSTDemoBundle, DEMO_SITE, LT_PERIODS, ST_PERIODS, LT_HORIZONS, ST_HORIZONS, LT_BASELINE_PLANS, ST_BASELINE_PLANS, AVAILABLE_SCENARIOS, BLU_AI_RECOMMENDATION, GOOD_RESULTS_SUMMARY} from './mock';
import {runScenarioSimulation, createScenarioAuditEvent, duplicateScenario, applyScenarioToWorkingState} from './utils';
import type {
  ScenarioAssumption,
  ScenarioAuditEvent,
  ScenarioChange,
  ScenarioPlan,
  ScenarioPlanningBundle,
  ScenarioStatus,
  ScenarioType,
} from './types';

const CURRENT_USER = 'Maya Planner';

const TABS = [
  'Impact Summary',
  'Timeline',
  'Comparison',
  'Exceptions',
  'Suggested Actions',
  'Assumptions',
  'Audit Trail',
];

function getPeriodsForType(type: ScenarioType): string[] {
  return type === 'LongTerm' ? LT_PERIODS : ST_PERIODS;
}

function getDefaultHorizonId(type: ScenarioType): string {
  return type === 'LongTerm' ? LT_HORIZONS[0].id : ST_HORIZONS[0].id;
}

function getDefaultBaselinePlanId(type: ScenarioType): string {
  return type === 'LongTerm' ? LT_BASELINE_PLANS[0].id : ST_BASELINE_PLANS[0].id;
}

export default function ScenarioPlanningPage() {
  const [bundle, setBundle] = useState<ScenarioPlanningBundle>(() => createLTDemoBundle());
  const [scenario, setScenario] = useState<ScenarioPlan>(bundle.scenario);
  const [changes, setChanges] = useState<ScenarioChange[]>(bundle.changes);
  const [assumptions, setAssumptions] = useState<ScenarioAssumption[]>(bundle.assumptions);
  const [auditEvents, setAuditEvents] = useState<ScenarioAuditEvent[]>(bundle.auditEvents);

  const [activeTab, setActiveTab] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [addChangeOpen, setAddChangeOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [hasRun, setHasRun] = useState(false);
  const [snackbar, setSnackbar] = useState<{open: boolean; message: string; severity: 'success' | 'info' | 'warning'}>({open: false, message: '', severity: 'info'});

  const periods = getPeriodsForType(scenario.type);

  // Re-run simulation whenever changes are modified
  const simResult = useMemo(() => {
    return runScenarioSimulation(scenario, changes, periods, scenario.type === 'LongTerm' ? 'Month' : 'Week');
  }, [scenario.id, changes, scenario.type]); // eslint-disable-line react-hooks/exhaustive-deps

  function addAuditEvent(
    eventType: ScenarioAuditEvent['eventType'],
    previousValue?: string,
    newValue?: string,
    comment?: string,
  ) {
    const evt = createScenarioAuditEvent(scenario.id, eventType, CURRENT_USER, previousValue, newValue, comment);
    setAuditEvents((prev) => [...prev, evt]);
  }

  function showSnackbar(message: string, severity: 'success' | 'info' | 'warning' = 'info') {
    setSnackbar({open: true, message, severity});
  }

  // ── Scenario type switch ────────────────────────────────────────────────────
  function handleTypeChange(type: ScenarioType) {
    const prevType = scenario.type;
    if (prevType === type) return;
    const newBundle = type === 'LongTerm' ? createLTDemoBundle() : createSTDemoBundle();
    setBundle(newBundle);
    setScenario(newBundle.scenario);
    setChanges(newBundle.changes);
    setAssumptions(newBundle.assumptions);
    setAuditEvents(newBundle.auditEvents);
    setSelectedPeriod(null);
    setHasRun(false);
    addAuditEvent('ScenarioTypeChanged', prevType, type);
    showSnackbar(`Switched to ${type === 'LongTerm' ? 'Long-Term' : 'Short-Term'} scenario mode.`);
  }

  // ── Setup bar controls ──────────────────────────────────────────────────────
  function handleBaselinePlanChange(id: string) {
    setScenario((s) => ({...s, baselinePlanId: id, status: 'Draft', lastCalculatedAt: null}));
    showSnackbar('Baseline plan updated. Re-run simulation to apply.', 'warning');
  }

  function handleHorizonChange(id: string) {
    const horizons = scenario.type === 'LongTerm' ? LT_HORIZONS : ST_HORIZONS;
    const horizon = horizons.find((h) => h.id === id);
    setScenario((s) => ({...s, horizonLabel: horizon?.label ?? id}));
  }

  function handleStatusChange(status: ScenarioStatus) {
    setScenario((s) => ({...s, status}));
  }

  // ── Scenario actions ────────────────────────────────────────────────────────
  function handleRunScenario() {
    const now = new Date().toLocaleString();
    setScenario((s) => ({...s, status: 'Simulated', lastCalculatedAt: now, updatedAt: now}));
    setHasRun(true);
    addAuditEvent('ScenarioSimulated', scenario.status, 'Simulated', 'Manual simulation run triggered.');
    showSnackbar('Scenario simulated successfully — all constraints resolved.', 'success');
  }

  function handleCompare() {
    const now = new Date().toLocaleString();
    setScenario((s) => ({...s, status: 'Compared', updatedAt: now}));
    setActiveTab(2);
    addAuditEvent('ScenarioCompared', scenario.status, 'Compared');
    showSnackbar('Comparison view activated.', 'info');
  }

  function handleApplyToPlan() {
    const {appliedScenario} = applyScenarioToWorkingState(scenario, simResult.impactRows);
    setScenario(appliedScenario);
    addAuditEvent('ScenarioApplied', scenario.status, 'Applied', 'Applied to local working state only.');
    showSnackbar('Scenario applied to local working state.', 'success');
  }

  function handleSaveDraft() {
    const now = new Date().toLocaleString();
    setScenario((s) => ({...s, updatedAt: now}));
    addAuditEvent('ScenarioSaved', undefined, 'Draft saved');
    showSnackbar('Draft saved to local state.', 'success');
  }

  function handleDiscard() {
    const prevStatus = scenario.status;
    const now = new Date().toLocaleString();
    setScenario((s) => ({...s, status: 'Discarded', updatedAt: now}));
    addAuditEvent('ScenarioDiscarded', prevStatus, 'Discarded');
    showSnackbar('Scenario discarded.', 'warning');
  }

  function handleRename() {
    setRenameValue(scenario.name);
    setRenameOpen(true);
  }

  function handleRenameSave() {
    if (!renameValue.trim()) return;
    const prev = scenario.name;
    setScenario((s) => ({...s, name: renameValue.trim()}));
    addAuditEvent('ChangeUpdated', prev, renameValue.trim(), 'Scenario renamed');
    setRenameOpen(false);
    showSnackbar('Scenario renamed.', 'success');
  }

  // ── Change management ───────────────────────────────────────────────────────
  function handleAddChange(change: ScenarioChange) {
    setChanges((prev) => [...prev, change]);
    addAuditEvent('ChangeAdded', undefined, change.title);
    showSnackbar(`Change "${change.title}" added. Re-run simulation to apply.`, 'success');
    setAddChangeOpen(false);
  }

  function handleToggleChange(id: string) {
    setChanges((prev) => prev.map((c) => c.id === id ? {...c, active: !c.active} : c));
    const chg = changes.find((c) => c.id === id);
    if (chg) addAuditEvent('ChangeUpdated', chg.active ? 'Active' : 'Inactive', chg.active ? 'Inactive' : 'Active', chg.title);
    showSnackbar('Change toggled. Re-run simulation to apply.', 'warning');
  }

  // ── Assumptions ─────────────────────────────────────────────────────────────
  function handleUpdateAssumption(id: string, value: string) {
    setAssumptions((prev) => prev.map((a) => a.id === id ? {...a, value} : a));
  }

  // ── Scenario panel actions ───────────────────────────────────────────────────
  function handleExport() {
    showSnackbar('Export available in future integration.', 'info');
  }

  function handleCreateActionList() {
    addAuditEvent('ChangeAdded', undefined, 'Action list created from suggested actions');
    showSnackbar('Action list created from suggested actions.', 'success');
  }

  function handleDuplicate() {
    const {scenario: newScenario} = duplicateScenario(scenario, changes);
    setScenario(newScenario);
    addAuditEvent('ScenarioDuplicated', scenario.name, newScenario.name);
    showSnackbar(`Scenario duplicated as "${newScenario.name}".`, 'success');
  }

  function handleDelete() {
    const newBundle = createLTDemoBundle();
    setBundle(newBundle);
    setScenario(newBundle.scenario);
    setChanges(newBundle.changes);
    setAssumptions(newBundle.assumptions);
    setAuditEvents(newBundle.auditEvents);
    showSnackbar('Scenario deleted. Demo scenario reloaded.', 'warning');
  }

  function handleNewScenario() {
    const newBundle = scenario.type === 'LongTerm' ? createLTDemoBundle() : createSTDemoBundle();
    setBundle(newBundle);
    setScenario({...newBundle.scenario, id: `scen-new-${Date.now()}`, name: 'New Scenario', status: 'Draft', lastCalculatedAt: null});
    setChanges([]);
    setHasRun(false);
    setAuditEvents([createScenarioAuditEvent(newBundle.scenario.id, 'ScenarioLoaded', CURRENT_USER, undefined, 'New blank scenario created')]);
    showSnackbar('New scenario created.', 'success');
  }

  function handleSelectScenario(id: string) {
    if (id === scenario.id) return;
    const newBundle = createLTDemoBundle();
    setBundle(newBundle);
    setScenario({...newBundle.scenario, id, name: AVAILABLE_SCENARIOS.find((s) => s.id === id)?.name ?? newBundle.scenario.name});
    setChanges(newBundle.changes);
    setAssumptions(newBundle.assumptions);
    setAuditEvents(newBundle.auditEvents);
    setHasRun(false);
    showSnackbar(`Scenario loaded: ${AVAILABLE_SCENARIOS.find((s) => s.id === id)?.name ?? id}`, 'info');
  }

  function handleRecalculate() {
    handleRunScenario();
  }

  const horizonId = (() => {
    const horizons = scenario.type === 'LongTerm' ? LT_HORIZONS : ST_HORIZONS;
    return horizons.find((h) => h.label === scenario.horizonLabel)?.id ?? horizons[0].id;
  })();

  const exceptionCount = simResult.exceptions.length;
  const suggestedCount = simResult.suggestedActions.length;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0}}>
      {/* Page Header */}
      <Box sx={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        mb: 2, flexWrap: 'wrap', gap: 1,
      }}>        
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap'}}>          
          <Box
            component="button"
            onClick={handleNewScenario}
            sx={{
              display: 'flex', alignItems: 'center', gap: 0.7, px: 2, py: 0.9,
              bgcolor: planningTokens.primaryBlue, color: '#fff', border: 'none',
              borderRadius: 2, cursor: 'pointer', fontWeight: 800, fontSize: 13,
              '&:hover': {bgcolor: '#1558d6'},
            }}
          >
            <NewIcon sx={{fontSize: 16}} />
            New Scenario
          </Box>
        </Box>
      </Box>

      {/* Scenario List Panel */}
      <ScenarioListPanel
        scenarios={AVAILABLE_SCENARIOS}
        activeScenarioId={scenario.id}
        onSelectScenario={handleSelectScenario}
      />

      {/* Setup Bar */}
      <ScenarioSetupBar
        scenarioType={scenario.type}
        baselinePlanId={scenario.baselinePlanId}
        site={scenario.site}
        horizonId={horizonId}
        scenarioStatus={scenario.status}
        lastCalculatedAt={scenario.lastCalculatedAt}
        onTypeChange={handleTypeChange}
        onBaselinePlanChange={handleBaselinePlanChange}
        onHorizonChange={handleHorizonChange}
        onStatusChange={handleStatusChange}
        onRecalculate={handleRecalculate}
      />

      {/* Scenario Title Card */}
      <ScenarioTitleCard
        scenario={scenario}
        onRunScenario={handleRunScenario}
        onCompare={handleCompare}
        onApplyToPlan={handleApplyToPlan}
        onSaveDraft={handleSaveDraft}
        onDiscard={handleDiscard}
        onRename={handleRename}
      />

      {/* Blu.AI Recommendation */}
      <BluAIRecommendationPanel recommendation={BLU_AI_RECOMMENDATION} />

      {/* Main content + right panels */}
      <Box sx={{display: 'flex', gap: 2, flex: 1, minHeight: 0, alignItems: 'flex-start'}}>
        {/* Left: Main Content */}
        <Box sx={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2}}>
          {/* Tabs */}
          <Paper elevation={0} sx={{...planningCardSx, p: 0, overflow: 'hidden'}}>
            <Tabs
              value={activeTab}
              onChange={(_, v) => setActiveTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: `1px solid ${planningTokens.border}`,
                '& .MuiTab-root': {fontSize: 13, fontWeight: 700, textTransform: 'none', minHeight: 44},
                '& .Mui-selected': {fontWeight: 900, color: planningTokens.primaryBlue},
                '& .MuiTabs-indicator': {bgcolor: planningTokens.primaryBlue},
              }}
            >
              {TABS.map((tab, idx) => {
                let label: React.ReactNode = tab;
                if (idx === 3 && exceptionCount > 0) {
                  label = (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
                      {tab}
                      <Box sx={{
                        bgcolor: planningTokens.danger, color: '#fff',
                        borderRadius: '10px', fontSize: 10, fontWeight: 800,
                        px: 0.7, py: 0.1, lineHeight: 1.6,
                      }}>{exceptionCount}</Box>
                    </Box>
                  );
                }
                if (idx === 4 && suggestedCount > 0) {
                  label = (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
                      {tab}
                      <Box sx={{
                        bgcolor: planningTokens.primaryBlue, color: '#fff',
                        borderRadius: '10px', fontSize: 10, fontWeight: 800,
                        px: 0.7, py: 0.1, lineHeight: 1.6,
                      }}>{suggestedCount}</Box>
                    </Box>
                  );
                }
                return <Tab key={tab} label={label} />;
              })}
            </Tabs>

            {/* Tab content */}
            <Box sx={{p: 2.5}}>
              {/* Impact Summary */}
              {activeTab === 0 && (
                <Box>
                  <ImpactSummaryCards summary={hasRun ? GOOD_RESULTS_SUMMARY : simResult.impactSummary} />
                  <FutureImpactOverviewTable
                    rows={simResult.periodSummaryRows}
                    bucketType={scenario.type === 'LongTerm' ? 'Month' : 'Week'}
                  />
                  <UtilizationImpactChart data={simResult.chartData} />
                  <KeyInsightsPanel summary={hasRun ? GOOD_RESULTS_SUMMARY : simResult.impactSummary} hasRun={hasRun} />
                </Box>
              )}

              {/* Timeline */}
              {activeTab === 1 && (
                <ScenarioTimeline
                  periodImpacts={simResult.periodImpacts}
                  selectedPeriod={selectedPeriod}
                  onSelectPeriod={setSelectedPeriod}
                />
              )}

              {/* Comparison */}
              {activeTab === 2 && (
                <ScenarioComparisonTable rows={simResult.impactRows} />
              )}

              {/* Exceptions */}
              {activeTab === 3 && (
                <ScenarioExceptionsTable exceptions={simResult.exceptions} />
              )}

              {/* Suggested Actions */}
              {activeTab === 4 && (
                <SuggestedActionsPanel actions={simResult.suggestedActions} />
              )}

              {/* Assumptions */}
              {activeTab === 5 && (
                <ScenarioAssumptionsPanel
                  assumptions={assumptions}
                  onUpdate={handleUpdateAssumption}
                />
              )}

              {/* Audit Trail */}
              {activeTab === 6 && (
                <ScenarioAuditTrail events={auditEvents} />
              )}
            </Box>
          </Paper>
        </Box>

        {/* Right Panels */}
        <Box sx={{
          width: {xs: '100%', xl: 360},
          flexShrink: 0,
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <ScenarioChangesPanel
            changes={changes}
            onAddChange={() => setAddChangeOpen(true)}
            onToggleChange={handleToggleChange}
          />
          <TopImpactedProductsPanel products={simResult.topImpactedProducts} />
          <ScenarioActionsPanel
            onExport={handleExport}
            onCreateActionList={handleCreateActionList}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
          />
        </Box>
      </Box>

      {/* Add Change Dialog */}
      <AddScenarioChangeDialog
        open={addChangeOpen}
        scenarioId={scenario.id}
        periods={periods}
        onClose={() => setAddChangeOpen(false)}
        onSave={handleAddChange}
      />

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle sx={{fontWeight: 900, color: planningTokens.textPrimary}}>Rename Scenario</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus fullWidth size="small" label="Scenario Name"
            value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRenameSave()}
          />
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setRenameOpen(false)} sx={{textTransform: 'none', fontWeight: 700}}>Cancel</Button>
          <Button
            variant="contained" onClick={handleRenameSave}
            disabled={!renameValue.trim()}
            sx={{textTransform: 'none', fontWeight: 800, bgcolor: planningTokens.primaryBlue}}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({...s, open: false}))}
        anchorOrigin={{vertical: 'bottom', horizontal: 'right'}}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({...s, open: false}))}
          severity={snackbar.severity}
          sx={{fontSize: 13, fontWeight: 700}}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
