import {Alert, Box, Paper, Tab, Tabs, Typography} from '@mui/material';
import {useCallback, useEffect, useMemo, useState} from 'react';
import {planningCardSx, planningTokens} from '../ui/planningTheme';
import MpsAuditTrailPanel from './components/MpsAuditTrailPanel';
import MpsAiAssistantWorkspace from './components/MpsAiAssistantWorkspace';
import MpsCapacitySummaryPanel from './components/MpsCapacitySummaryPanel';
import MpsDemandSummary from './components/MpsDemandSummary';
import MpsDemandSignalWorkspace from './components/MpsDemandSignalWorkspace';
import MpsExceptionsPanel from './components/MpsExceptionsPanel';
import MpsHealthSummaryPanel from './components/MpsHealthSummary';
import MpsInventoryProjectionPanel from './components/MpsInventoryProjectionPanel';
import MpsPlanHeader from './components/MpsPlanHeader';
import MpsPlanningActions from './components/MpsPlanningActions';
import MpsPlanningFilters from './components/MpsPlanningFilters';
import MpsPlanningGrid from './components/MpsPlanningGrid';
import MpsProductRulesPanel from './components/MpsProductRulesPanel';
import MpsScenarioDialog from './components/MpsScenarioDialog';
import MpsSummaryCards from './components/MpsSummaryCards';
import MrpReadinessPanel from './components/MrpReadinessPanel';
import ReleaseMpsDialog from './components/ReleaseMpsDialog';
import {initializeMpsAssistantSteps} from './assistantUtils';
import {createMpsPlanningMockData, MONTH_NAMES} from './mock';
import type {
  AuditEvent,
  MpsAssistantState,
  MpsBucketLine,
  MpsDemandLine,
  MpsPlan,
  MpsPlanningFiltersState,
  MpsScenario,
  ProductLineCapability,
  ProductPlanningRule,
  ProductionLine,
  ScenarioComparisonRow,
  WorkOrderProposal,
  WorkOrderProposalAuditEvent,
} from './types';
import {
  approveWorkOrderProposal,
  approveSelectedWorkOrderProposals,
  generateWorkOrderProposalsFromMps,
  rejectWorkOrderProposal,
  rejectSelectedWorkOrderProposals,
  createWorkOrderProposalAuditEvent,
} from './workOrderProposalUtils';
import WorkOrderProposalView from './components/WorkOrderProposalView';
import {
  applyMpsScenario,
  buildMpsBucketRowViews,
  buildMpsExceptions,
  buildScenarioComparison,
  calculateMpsCapacity,
  calculateMpsDemandAllocation,
  calculateMpsHealthSummary,
  calculateMrpReadiness,
  calculateMpsStockProjection,
  canReleaseMps,
  createAuditEvent,
  filterBucketRows,
  isPlanEditable,
  validateMpsPlan,
} from './utils';

type MpsPlanningPageProps = {
  linkedDemandCount?: number;
  linkedMrpCount?: number;
  onOpenDemandDrawer?: () => void;
  onOpenMrpDrawer?: () => void;
};

const CURRENT_USER = 'Danilo Brooks';

const AVAILABLE_MONTHS: {value: string; label: string}[] = (() => {
  const months = [];
  for (let y = 2026; y <= 2027; y++) {
    for (let m = 1; m <= 12; m++) {
      const value = `${y}-${String(m).padStart(2, '0')}`;
      months.push({value, label: `${MONTH_NAMES[m - 1]} ${y}`});
    }
  }
  return months;
})();

const DEFAULT_FILTERS: MpsPlanningFiltersState = {
  productFamily: '',
  search: '',
  productionLine: '',
  bucket: '',
  status: '',
  priority: '',
  riskLevel: '',
  onlyExceptions: false,
  onlyFrozen: false,
};

function recompute(
  bucketLines: MpsBucketLine[],
  demandLines: MpsDemandLine[],
  lines: ProductionLine[],
  capabilities: ProductLineCapability[],
  rules: ProductPlanningRule[],
) {
  const withCapacity = calculateMpsCapacity(bucketLines, lines, capabilities);
  const withStock = calculateMpsStockProjection(withCapacity, demandLines);
  const updatedDemand = calculateMpsDemandAllocation(demandLines, withStock);
  return {buckets: withStock, demand: updatedDemand};
}

export default function MpsPlanningPage({linkedDemandCount = 0, linkedMrpCount = 0, onOpenDemandDrawer, onOpenMrpDrawer}: MpsPlanningPageProps = {}) {
  const [expandedPanel, setExpandedPanel] = useState<'planning' | null>(null);
  const [plan, setPlan] = useState<MpsPlan | null>(null);
  const [demandLines, setDemandLines] = useState<MpsDemandLine[]>([]);
  const [bucketLines, setBucketLines] = useState<MpsBucketLine[]>([]);
  const [baselineBucketLines, setBaselineBucketLines] = useState<MpsBucketLine[]>([]);
  const [productionLines, setProductionLines] = useState<ProductionLine[]>([]);
  const [capabilities, setCapabilities] = useState<ProductLineCapability[]>([]);
  const [planningRules, setPlanningRules] = useState<ProductPlanningRule[]>([]);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [assistantState, setAssistantState] = useState<MpsAssistantState | null>(null);

  const [selectedMonth, setSelectedMonth] = useState('2026-06');
  const [filters, setFilters] = useState<MpsPlanningFiltersState>(DEFAULT_FILTERS);
  const [selectedProductCode, setSelectedProductCode] = useState<string | null>(null);
  const [validationRun, setValidationRun] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [scenarios, setScenarios] = useState<MpsScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null);
  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false);
  const [scenarioDialogMode, setScenarioDialogMode] = useState<'create' | 'compare'>('create');
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [assistantWorkspaceOpen, setAssistantWorkspaceOpen] = useState(false);
  const [workOrderProposals, setWorkOrderProposals] = useState<WorkOrderProposal[]>([]);
  const [workOrderProposalAuditEvents, setWoProposalAuditEvents] = useState<WorkOrderProposalAuditEvent[]>([]);
  const [workOrderProposalViewOpen, setWorkOrderProposalViewOpen] = useState(false);

  function createAssistant(bundle: ReturnType<typeof createMpsPlanningMockData>) {
    return initializeMpsAssistantSteps({
      plan: bundle.plan,
      demandLines: bundle.demandLines,
      bucketLines: bundle.bucketLines,
      currentUser: CURRENT_USER,
    });
  }

  function applyBundle(bundle: ReturnType<typeof createMpsPlanningMockData>) {
    const {buckets, demand} = recompute(bundle.bucketLines, bundle.demandLines, bundle.productionLines, bundle.capabilities, bundle.planningRules);
    setPlan(bundle.plan);
    setBucketLines(buckets);
    setBaselineBucketLines(bundle.bucketLines);
    setDemandLines(demand);
    setProductionLines(bundle.productionLines);
    setCapabilities(bundle.capabilities);
    setPlanningRules(bundle.planningRules);
    setAuditEvents(bundle.initialAuditEvents);
    setAssistantState(createAssistant(bundle));
    setLastRefreshedAt(new Date().toISOString());
  }

  useEffect(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    applyBundle(createMpsPlanningMockData(new Date(y, m - 1, 1)));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exceptions = useMemo(() => {
    if (!plan) return [];
    const updatedDemand = calculateMpsDemandAllocation(demandLines, bucketLines);
    return buildMpsExceptions(bucketLines, updatedDemand, capabilities, planningRules, productionLines);
  }, [bucketLines, demandLines, capabilities, planningRules, productionLines, plan]);

  const healthSummary = useMemo(
    () => calculateMpsHealthSummary(bucketLines, demandLines),
    [bucketLines, demandLines],
  );

  const mrpReadiness = useMemo(
    () => plan ? calculateMrpReadiness(plan, bucketLines, demandLines, exceptions, validationRun) : {isReady: false, checks: []},
    [plan, bucketLines, demandLines, exceptions, validationRun],
  );

  const canRelease = useMemo(
    () => plan ? canReleaseMps(plan, exceptions, validationRun, assistantState?.finalReadinessStatus) : false,
    [plan, exceptions, validationRun, assistantState],
  );

  const rowViews = useMemo(
    () => buildMpsBucketRowViews(bucketLines, productionLines, capabilities, planningRules),
    [bucketLines, productionLines, capabilities, planningRules],
  );

  const filteredRows = useMemo(
    () => filterBucketRows(rowViews, filters, selectedProductCode),
    [rowViews, filters, selectedProductCode],
  );

  const productFamilies = useMemo(
    () => [...new Set(demandLines.map((d) => d.productFamily))].sort(),
    [demandLines],
  );

  const bucketLabels = useMemo(
    () => [...new Set(bucketLines.map((b) => b.bucketLabel))],
    [bucketLines],
  );

  const comparisonRows = useMemo((): ScenarioComparisonRow[] => {
    if (!selectedScenarioId) return [];
    const scenario = scenarios.find((s) => s.id === selectedScenarioId);
    if (!scenario) return [];
    const scenarioBuckets = applyMpsScenario(bucketLines, scenario);
    return buildScenarioComparison(bucketLines, scenarioBuckets, demandLines);
  }, [selectedScenarioId, scenarios, bucketLines, demandLines]);

  const assistantRecommendationCounts = useMemo(() => {
    if (!assistantState) return {blockers: 0, warnings: 0};
    return assistantState.recommendations.reduce((acc, recommendation) => {
      if (recommendation.status !== 'Proposed') return acc;
      if (recommendation.severity === 'Blocker') acc.blockers += 1;
      if (recommendation.severity === 'Warning') acc.warnings += 1;
      return acc;
    }, {blockers: 0, warnings: 0});
  }, [assistantState]);

  const materialRiskCount = useMemo(
    () => bucketLines.filter((line) => `${line.constraintReason ?? ''} ${line.plannerComment ?? ''}`.includes('CAP-204')).length || 1,
    [bucketLines],
  );

  const isEditable = plan ? isPlanEditable(plan) : false;

  const addAudit = useCallback((params: Parameters<typeof createAuditEvent>[0]) => {
    setAuditEvents((prev) => [...prev, createAuditEvent(params)]);
  }, []);

  function simulateAction(key: string, durationMs: number, fn: () => void) {
    setLoadingAction(key);
    setTimeout(() => {
      fn();
      setLoadingAction(null);
    }, durationMs);
  }

  function handleValidate() {
    if (!plan) return;
    simulateAction('validate', 800, () => {
      const summary = validateMpsPlan(plan, demandLines, bucketLines, productionLines, capabilities, planningRules);
      setValidationRun(true);
      const blockers = summary.errors.length;
      const warns = summary.warnings.length;
      setValidationError(
        blockers > 0
          ? `Validation found ${blockers} blocker(s) and ${warns} warning(s). See Exceptions tab.`
          : warns > 0
            ? `Validation passed with ${warns} warning(s). See Exceptions tab.`
            : null,
      );
      addAudit({entityType: 'MpsPlan', entityId: plan.id, eventType: 'ValidationRun', user: CURRENT_USER, newValue: `${blockers} blockers, ${warns} warnings`, comment: 'Local validation run.'});
    });
  }

  function handleCapacityCheck() {
    if (!plan) return;
    simulateAction('capacity', 600, () => {
      const withCapacity = calculateMpsCapacity(bucketLines, productionLines, capabilities);
      const withStock = calculateMpsStockProjection(withCapacity, demandLines);
      const updated = calculateMpsDemandAllocation(demandLines, withStock);
      setBucketLines(withStock);
      setDemandLines(updated);
      addAudit({entityType: 'MpsPlan', entityId: plan.id, eventType: 'CapacityCheckRun', user: CURRENT_USER, comment: 'Capacity recalculated for all buckets.'});
    });
  }

  function handleStockProjection() {
    if (!plan) return;
    simulateAction('stock', 600, () => {
      const withStock = calculateMpsStockProjection(bucketLines, demandLines);
      const updated = calculateMpsDemandAllocation(demandLines, withStock);
      setBucketLines(withStock);
      setDemandLines(updated);
      addAudit({entityType: 'MpsPlan', entityId: plan.id, eventType: 'StockProjectionRun', user: CURRENT_USER, comment: 'Stock projection recalculated for all buckets.'});
    });
  }

  const handleEditQuantity = useCallback((bucketId: string, quantity: number) => {
    if (!plan || !isEditable) return;
    setBucketLines((prev) => {
      const updated = prev.map((b) => b.id === bucketId ? {...b, plannedQuantity: quantity, isEdited: true} : b);
      const {buckets, demand} = recompute(updated, demandLines, productionLines, capabilities, planningRules);
      const oldRow = prev.find((b) => b.id === bucketId);
      addAudit({entityType: 'MpsBucketLine', entityId: bucketId, eventType: 'QuantityChanged', user: CURRENT_USER, previousValue: String(oldRow?.plannedQuantity ?? ''), newValue: String(quantity)});
      setDemandLines(demand);
      return buckets;
    });
  }, [plan, isEditable, demandLines, productionLines, capabilities, planningRules, addAudit]);

  const handleEditLine = useCallback((bucketId: string, lineId: string | null) => {
    if (!plan || !isEditable) return;
    setBucketLines((prev) => {
      const oldRow = prev.find((b) => b.id === bucketId);
      const updated = prev.map((b) => b.id === bucketId ? {...b, assignedLineId: lineId, isEdited: true} : b);
      const {buckets, demand} = recompute(updated, demandLines, productionLines, capabilities, planningRules);
      addAudit({entityType: 'MpsBucketLine', entityId: bucketId, eventType: 'LineChanged', user: CURRENT_USER, previousValue: oldRow?.assignedLineId ?? 'none', newValue: lineId ?? 'none'});
      setDemandLines(demand);
      return buckets;
    });
  }, [plan, isEditable, demandLines, productionLines, capabilities, planningRules, addAudit]);

  const handleEditConstraintReason = useCallback((bucketId: string, reason: string) => {
    if (!plan || !isEditable) return;
    setBucketLines((prev) => prev.map((b) => b.id === bucketId ? {...b, constraintReason: reason} : b));
    addAudit({entityType: 'MpsBucketLine', entityId: bucketId, eventType: 'ReasonChanged', user: CURRENT_USER, newValue: reason});
  }, [plan, isEditable, addAudit]);

  const handleEditPlannerComment = useCallback((bucketId: string, comment: string) => {
    if (!plan || !isEditable) return;
    setBucketLines((prev) => prev.map((b) => b.id === bucketId ? {...b, plannerComment: comment} : b));
    addAudit({entityType: 'MpsBucketLine', entityId: bucketId, eventType: 'CommentChanged', user: CURRENT_USER, newValue: comment});
  }, [plan, isEditable, addAudit]);

  function handleCreateScenario(scenario: MpsScenario) {
    setScenarios((prev) => [...prev, scenario]);
    setSelectedScenarioId(scenario.id);
    addAudit({entityType: 'MpsScenario', entityId: scenario.id, eventType: 'ScenarioCreated', user: CURRENT_USER, newValue: scenario.name});
  }

  function handleApplyScenario(scenarioId: string) {
    const scenario = scenarios.find((s) => s.id === scenarioId);
    if (!scenario || !plan) return;
    simulateAction('scenario-apply', 400, () => {
      const applied = applyMpsScenario(bucketLines, scenario);
      const {buckets, demand} = recompute(applied, demandLines, productionLines, capabilities, planningRules);
      setBucketLines(buckets);
      setDemandLines(demand);
      setScenarios((prev) => prev.map((s) => s.id === scenarioId ? {...s, status: 'Applied'} : s));
      addAudit({entityType: 'MpsScenario', entityId: scenarioId, eventType: 'ScenarioApplied', user: CURRENT_USER, newValue: scenario.name, comment: 'Scenario applied to working MPS.'});
    });
  }

  function handleDiscardScenario(scenarioId: string) {
    setScenarios((prev) => prev.map((s) => s.id === scenarioId ? {...s, status: 'Discarded'} : s));
    if (selectedScenarioId === scenarioId) setSelectedScenarioId(null);
    addAudit({entityType: 'MpsScenario', entityId: scenarioId, eventType: 'ScenarioDiscarded', user: CURRENT_USER});
  }

  function handleRelease(releaseNotes: string) {
    if (!plan) return;
    simulateAction('release', 600, () => {
      const releasedAt = new Date().toISOString();
      const newStatus = assistantState?.finalReadinessStatus === 'ReadyForRelease' ? 'Released' as const : 'ReleasedWithWarnings' as const;
      setPlan({...plan, status: newStatus, releasedBy: CURRENT_USER, releasedAt, updatedAt: releasedAt, releaseComment: releaseNotes});
      setBucketLines((prev) => prev.map((b) => ({...b, status: 'Released' as const})));
      addAudit({entityType: 'MpsPlan', entityId: plan.id, eventType: 'PlanReleased', user: CURRENT_USER, newValue: newStatus, comment: releaseNotes});
      const proposals = generateWorkOrderProposalsFromMps(plan, bucketLines, productionLines);
      const initialAudit = proposals.map((p) =>
        createWorkOrderProposalAuditEvent({
          proposalId: p.id,
          user: 'AI MPS Assistant',
          eventType: 'ProposalGenerated',
          newValue: p.status,
        }),
      );
      setWorkOrderProposals(proposals);
      setWoProposalAuditEvents(initialAudit);
      setWorkOrderProposalViewOpen(true);
    });
  }

  function resetMonthState(month: string) {
    setSelectedMonth(month);
    const [y, m] = month.split('-').map(Number);
    const bundle = createMpsPlanningMockData(new Date(y, m - 1, 1));
    applyBundle(bundle);
    setScenarios([]);
    setSelectedScenarioId(null);
    setValidationRun(false);
    setValidationError(null);
    setFilters(DEFAULT_FILTERS);
    setSelectedProductCode(null);
    setAssistantWorkspaceOpen(false);
    setWorkOrderProposals([]);
    setWoProposalAuditEvents([]);
    setWorkOrderProposalViewOpen(false);
  }

  function handleMonthChange(month: string) {
    resetMonthState(month);
  }

  function handleReset() {
    simulateAction('reset', 400, () => {
      resetMonthState(selectedMonth);
      setAuditEvents((prev) => [{
        id: `audit-reset-${Date.now()}`,
        entityType: 'MpsPlan',
        entityId: plan?.id ?? 'mps-reset',
        eventType: 'DemoReset',
        user: CURRENT_USER,
        timestamp: new Date().toISOString(),
        comment: 'Demo plan data reset to initial state.',
        sourceScreen: 'MpsPlanningPage',
      }, ...prev]);
    });
  }

  function handleWoApprove(id: string) {
    const result = approveWorkOrderProposal(workOrderProposals, workOrderProposalAuditEvents, id, CURRENT_USER);
    setWorkOrderProposals(result.proposals);
    setWoProposalAuditEvents(result.auditEvents);
  }

  function handleWoReject(id: string, reason: string) {
    const result = rejectWorkOrderProposal(workOrderProposals, workOrderProposalAuditEvents, id, reason, CURRENT_USER);
    setWorkOrderProposals(result.proposals);
    setWoProposalAuditEvents(result.auditEvents);
  }

  function handleWoApproveSelected(ids: string[]) {
    const result = approveSelectedWorkOrderProposals(workOrderProposals, workOrderProposalAuditEvents, ids, CURRENT_USER);
    setWorkOrderProposals(result.proposals);
    setWoProposalAuditEvents(result.auditEvents);
  }

  function handleWoRejectSelected(ids: string[], reason: string) {
    const result = rejectSelectedWorkOrderProposals(workOrderProposals, workOrderProposalAuditEvents, ids, reason, CURRENT_USER);
    setWorkOrderProposals(result.proposals);
    setWoProposalAuditEvents(result.auditEvents);
  }

  function handleWoConfirmApproved() {
    const approved = workOrderProposals.filter((p) => p.status === 'ApprovedForCreation');
    if (approved.length === 0) return;
    const now = new Date().toISOString();
    const newAudit = createWorkOrderProposalAuditEvent({
      proposalId: 'batch',
      user: CURRENT_USER,
      eventType: 'ProposalsApprovedBatch',
      newValue: `Confirmed ${approved.length} approved proposals locally. No real Work Orders were created.`,
      comment: now,
    });
    setWoProposalAuditEvents((prev) => [...prev, newAudit]);
  }

  if (!plan || !assistantState) {
    return (
      <Box sx={{p: 4, textAlign: 'center', color: 'var(--planning-text-muted)'}}>
        <Typography sx={{fontSize: 15}}>Loading MPS data...</Typography>
      </Box>
    );
  }

  const hasActiveScenario = !!selectedScenarioId && scenarios.some((s) => s.id === selectedScenarioId && s.status !== 'Discarded');
  const renderPlanningPanel = (expanded = false) => (
    <Paper
      sx={{
        ...planningCardSx,
        borderRadius: 4,
        border: '1px solid #D8E2F0',
        bgcolor: 'var(--planning-surface)',
        overflow: 'hidden',
        p: expanded ? {xs: 1.6, md: 2.4} : 2.4,
      }}
    >
      <MpsPlanHeader
        plan={plan}
        lastRefreshedAt={lastRefreshedAt}
        currentUser={CURRENT_USER}
        expanded={expanded}
        onExpand={() => setExpandedPanel('planning')}
        onCollapse={() => setExpandedPanel(null)}
        linkedDemandCount={linkedDemandCount}
        linkedMrpCount={linkedMrpCount}
        onOpenDemandDrawer={onOpenDemandDrawer}
        onOpenMrpDrawer={onOpenMrpDrawer}
      />

      <MpsSummaryCards
        health={healthSummary}
        blockerCount={assistantRecommendationCounts.blockers}
        warningCount={assistantRecommendationCounts.warnings}
        materialRiskCount={materialRiskCount}
        readinessStatus={assistantState.finalReadinessStatus}
      />

      {assistantWorkspaceOpen ? (
        <Box sx={{mt: 2}}>
          <MpsAiAssistantWorkspace
            open={assistantWorkspaceOpen}
            onClose={() => setAssistantWorkspaceOpen(false)}
          />
        </Box>
      ) : (
        <MpsDemandSignalWorkspace
          plan={plan}
          demandLines={demandLines}
          bucketLines={bucketLines}
          planningRules={planningRules}
          productionLines={productionLines}
          exceptions={exceptions}
          mrpReadiness={mrpReadiness}
          selectedMonth={selectedMonth}
          availableMonths={AVAILABLE_MONTHS}
          onMonthChange={handleMonthChange}
          filters={filters}
          onChangeFilters={(patch) => setFilters((prev) => ({...prev, ...patch}))}
          selectedProductCode={selectedProductCode}
          onSelectProduct={setSelectedProductCode}
          scenarios={scenarios}
          readinessStatus={assistantState.finalReadinessStatus}
          canRelease={canRelease}
          onOpenAssistant={() => setAssistantWorkspaceOpen(true)}
          onOpenRelease={() => setReleaseDialogOpen(true)}
          onOpenCreateScenario={() => { setScenarioDialogMode('create'); setScenarioDialogOpen(true); }}
          onOpenCompareScenario={() => {
            setScenarioDialogMode('compare');
            setScenarioDialogOpen(true);
            addAudit({entityType: 'MpsScenario', entityId: selectedScenarioId ?? '', eventType: 'ScenarioCompared', user: CURRENT_USER});
          }}
          onEditQuantity={handleEditQuantity}
          validationError={validationError}
        />
      )}
    </Paper>
  );

  return (
    <Box
      sx={{
        p: 2.4,
        maxWidth: '100%',
        bgcolor: planningTokens.background,
        minHeight: '100%',
        backgroundImage: 'radial-gradient(circle at top right, rgba(109,40,217,0.08), transparent 24%), radial-gradient(circle at top left, rgba(4,78,215,0.08), transparent 28%)',
      }}
    >
      {expandedPanel === 'planning' ? renderPlanningPanel(true) : null}
      {expandedPanel === null ? (
        renderPlanningPanel()
      ) : null}

      <MpsScenarioDialog
        open={scenarioDialogOpen}
        mode={scenarioDialogMode}
        scenarios={scenarios.filter((s) => s.status !== 'Discarded')}
        selectedScenarioId={selectedScenarioId}
        comparisonRows={comparisonRows}
        currentUser={CURRENT_USER}
        planId={plan.id}
        onClose={() => setScenarioDialogOpen(false)}
        onCreateScenario={handleCreateScenario}
        onSelectScenario={setSelectedScenarioId}
        onApplyScenario={handleApplyScenario}
        onDiscardScenario={handleDiscardScenario}
      />

      <ReleaseMpsDialog
        open={releaseDialogOpen}
        mrpReadiness={mrpReadiness}
        canRelease={canRelease}
        onClose={() => setReleaseDialogOpen(false)}
        onConfirm={handleRelease}
      />

      <WorkOrderProposalView
        open={workOrderProposalViewOpen}
        proposals={workOrderProposals}
        auditEvents={workOrderProposalAuditEvents}
        planId={plan.id}
        onApproveProposal={handleWoApprove}
        onRejectProposal={handleWoReject}
        onApproveSelected={handleWoApproveSelected}
        onRejectSelected={handleWoRejectSelected}
        onConfirmApproved={handleWoConfirmApproved}
        onClose={() => setWorkOrderProposalViewOpen(false)}
      />

    </Box>
  );
}
