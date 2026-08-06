import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  FilterAltOutlined as FilterAltOutlinedIcon,
  RefreshRounded as RefreshRoundedIcon,
  SearchRounded as SearchRoundedIcon,
  WarningAmberRounded as WarningAmberRoundedIcon,
} from '@mui/icons-material';
import type {
  ActionPayload,
  DecisionLogEntry,
  DemandRiskRow,
  PriorityOverrideRecord,
  RiskClusterItem,
  RiskFilters,
  RiskSeverity,
  ViewMode,
  WoFilters,
  WoPriority,
  WoQueueItem,
} from './types';
import {
  aiActionCards,
  aiInsightMap,
  aiPriorityBriefing,
  conversationHistory,
  demandRiskDetailMap,
  demandRiskRows,
  lineImpactRows,
  operationalRiskKpis,
  preparedActionPayloads,
  riskClusterItems,
  riskDetailMap,
  woDetailMap,
  workOrderKpis,
  workOrderQueueItems,
} from './mock';
import PriorityQueueKpiCards from './components/PriorityQueueKpiCards';
import PriorityQueueTable from './components/PriorityQueueTable';
import WoDetailPanel from './components/WoDetailPanel';
import RiskDetailPanel from './components/RiskDetailPanel';
import DemandRiskDetailPanel from './components/DemandRiskDetailPanel';
import ActionConfirmDialog from './components/ActionConfirmDialog';
import PriorityOverrideDialog from './components/PriorityOverrideDialog';
import AiPriorityBriefingCard from './components/AiPriorityBriefingCard';
import AiRecommendedActionsStrip from './components/AiRecommendedActionsStrip';
import {ConfidenceBadge, FreshnessBadge, GovernedBadge, SeverityBadge, StatusBadge} from './components/Badges';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

const defaultWoFilters: WoFilters = {
  priority: 'All',
  readiness: 'All',
  actionStatus: 'All',
  lineMachine: 'All',
  search: '',
  owner: 'All',
  blocker: 'All',
  demandImpact: 'All',
  aiConfidence: 'All',
  freshness: 'All',
  assignment: 'All',
  overrideActive: 'All',
  recoverableToday: 'All',
};

const defaultRiskFilters: RiskFilters = {
  severity: 'All',
  owner: 'All',
  actionStatus: 'All',
  lineMachine: 'All',
  blocker: 'All',
  demandImpact: 'All',
  aiConfidence: 'All',
  freshness: 'All',
  assignment: 'All',
  overrideActive: 'All',
  recoverableToday: 'All',
  search: '',
};

type PageStatus = 'loading' | 'ready' | 'error';
type Selection = {type: 'wo' | 'cluster' | 'demand'; id: string} | null;

type OverrideDialogState = {
  open: boolean;
  itemId: string;
  currentPriority: WoPriority | RiskSeverity;
};

export default function PriorityQueuePage({onBack: _onBack}: {onBack?: () => void}) {
  const [viewMode, setViewMode] = useState<ViewMode>('work-order');
  const [pageStatus, setPageStatus] = useState<PageStatus>('loading');
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [selection, setSelection] = useState<Selection>({type: 'wo', id: 'WO-350021'});
  const [expandedWoId, setExpandedWoId] = useState<string | null>('WO-350021');
  const [woFilters, setWoFilters] = useState<WoFilters>(defaultWoFilters);
  const [riskFilters, setRiskFilters] = useState<RiskFilters>(defaultRiskFilters);
  const [decisionLog, setDecisionLog] = useState<DecisionLogEntry[]>([]);
  const [overrides, setOverrides] = useState<Record<string, PriorityOverrideRecord>>({});
  const [woItems, setWoItems] = useState<WoQueueItem[]>(workOrderQueueItems);
  const [riskItems, setRiskItems] = useState<RiskClusterItem[]>(riskClusterItems);
  const [actionPayload, setActionPayload] = useState<ActionPayload | null>(null);
  const [overrideDialog, setOverrideDialog] = useState<OverrideDialogState>({open: false, itemId: '', currentPriority: 'High'});

  useEffect(() => {
    const timer = setTimeout(() => setPageStatus('ready'), 500);
    return () => clearTimeout(timer);
  }, []);

  const filteredWoItems = useMemo(() => {
    return woItems.filter((item) => {
      if (woFilters.priority !== 'All' && item.priority !== woFilters.priority) return false;
      if (woFilters.readiness !== 'All' && item.readiness !== woFilters.readiness) return false;
      if (woFilters.actionStatus !== 'All' && item.actionStatus !== woFilters.actionStatus) return false;
      if (woFilters.lineMachine !== 'All' && !item.lineMachine.includes(woFilters.lineMachine)) return false;
      if (woFilters.owner !== 'All' && item.owner !== woFilters.owner) return false;
      if (woFilters.blocker !== 'All' && !item.mainBlocker.toLowerCase().includes(woFilters.blocker.toLowerCase())) return false;
      if (woFilters.aiConfidence !== 'All' && item.aiConfidence !== woFilters.aiConfidence) return false;
      if (woFilters.freshness !== 'All' && item.freshness !== woFilters.freshness) return false;
      if (woFilters.assignment === 'Assigned' && !item.owner) return false;
      if (woFilters.assignment === 'Unassigned' && item.owner) return false;
      if (woFilters.overrideActive === 'Yes' && !item.overrideActive) return false;
      if (woFilters.overrideActive === 'No' && item.overrideActive) return false;
      if (woFilters.recoverableToday === 'Yes' && !item.recoverableToday) return false;
      if (woFilters.recoverableToday === 'No' && item.recoverableToday) return false;
      if (woFilters.search) {
        const search = woFilters.search.toLowerCase();
        if (!item.woId.toLowerCase().includes(search) && !item.product.toLowerCase().includes(search) && !item.batch.toLowerCase().includes(search)) return false;
      }
      if (woFilters.demandImpact === 'High' && !item.demandAtRisk.includes('K') && !item.demandAtRisk.includes('batches')) return false;
      return true;
    });
  }, [woItems, woFilters]);

  const filteredRiskItems = useMemo(() => {
    return riskItems.filter((item) => {
      if (riskFilters.severity !== 'All' && item.severity !== riskFilters.severity) return false;
      if (riskFilters.owner !== 'All' && item.owner !== riskFilters.owner) return false;
      if (riskFilters.actionStatus !== 'All' && item.actionStatus !== riskFilters.actionStatus) return false;
      if (riskFilters.lineMachine !== 'All' && !item.linesImpacted.includes(riskFilters.lineMachine)) return false;
      if (riskFilters.blocker !== 'All' && !item.rootCause.toLowerCase().includes(riskFilters.blocker.toLowerCase())) return false;
      if (riskFilters.aiConfidence !== 'All' && item.confidence !== riskFilters.aiConfidence) return false;
      if (riskFilters.freshness !== 'All' && item.freshness !== riskFilters.freshness) return false;
      if (riskFilters.search) {
        const search = riskFilters.search.toLowerCase();
        if (!item.clusterName.toLowerCase().includes(search) && !item.rootCause.toLowerCase().includes(search) && !item.linesImpacted.toLowerCase().includes(search)) return false;
      }
      return true;
    });
  }, [riskItems, riskFilters]);

  const filteredDemandRows = useMemo(() => {
    return demandRiskRows.filter((item) => {
      if (riskFilters.owner !== 'All' && item.owner !== riskFilters.owner) return false;
      if (riskFilters.aiConfidence !== 'All' && item.confidence !== riskFilters.aiConfidence) return false;
      if (riskFilters.search) {
        const search = riskFilters.search.toLowerCase();
        if (!item.family.toLowerCase().includes(search) && !item.mainConstraint.toLowerCase().includes(search)) return false;
      }
      return true;
    });
  }, [riskFilters]);

  const hasStaleData = useMemo(() => {
    return [...filteredWoItems, ...filteredRiskItems].some((item) => aiInsightMap[item.id]?.isStale);
  }, [filteredWoItems, filteredRiskItems]);

  const selectedWoItem = selection?.type === 'wo' ? woItems.find((item) => item.id === selection.id) ?? null : null;
  const selectedRiskItem = selection?.type === 'cluster' ? riskItems.find((item) => item.id === selection.id) ?? null : null;
  const selectedDemandItem = selection?.type === 'demand' ? demandRiskRows.find((item) => item.id === selection.id) ?? null : null;

  const woLines = useMemo(() => Array.from(new Set(workOrderQueueItems.map((item) => item.lineMachine))), []);
  const riskOwners = useMemo(() => Array.from(new Set(riskClusterItems.map((item) => item.owner))), []);

  const simulateRefresh = useCallback(() => {
    setPageStatus('loading');
    setLastRefresh(new Date());
    setTimeout(() => setPageStatus('ready'), 700);
  }, []);

  const logDecision = useCallback((entry: Omit<DecisionLogEntry, 'id' | 'timestamp' | 'user'>) => {
    const newEntry: DecisionLogEntry = {
      ...entry,
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'Current User',
    };
    setDecisionLog((prev) => [newEntry, ...prev]);
    if (process.env.NODE_ENV !== 'production') {
      console.info('[PriorityQueue] Decision logged:', newEntry);
    }
  }, []);

  const openSelection = useCallback((type: Selection['type'], id: string) => {
    setSelection({type, id});
    if (type === 'wo') setExpandedWoId(id);
  }, []);

  const openPreparedAction = useCallback((preparedActionId: string, fallbackRecommendation: string, relatedId: string) => {
    const payload = preparedActionPayloads[preparedActionId];
    if (payload) {
      setActionPayload(payload);
    } else {
      setActionPayload({
        title: fallbackRecommendation,
        relatedLabel: relatedId,
        owner: 'Owner not assigned',
        reasonCode: 'AI-REC',
        recommendationId: `GEN-${relatedId}`,
        rationale: fallbackRecommendation,
        comment: '',
        confirmationLabel: 'Confirm Action',
      });
    }
  }, []);

  const handleViewModeChange = useCallback((_: React.MouseEvent<HTMLElement>, value: ViewMode | null) => {
    if (!value) return;
    setViewMode(value);
    setSelection(value === 'work-order' ? {type: 'wo', id: 'WO-350021'} : {type: 'cluster', id: 'cluster-material-shortage'});
  }, []);

  const handleQuickAction = useCallback((id: string) => {
    if (id === 'review-top-actions') {
      setViewMode('work-order');
      setSelection({type: 'wo', id: 'WO-350021'});
      setExpandedWoId('WO-350021');
      return;
    }
    if (id === 'open-demand-risk') {
      setViewMode('operational-risk');
      setSelection({type: 'demand', id: 'demand-family-a'});
      return;
    }
    if (id === 'view-root-cause-clusters') {
      setViewMode('operational-risk');
      setSelection({type: 'cluster', id: 'cluster-material-shortage'});
      return;
    }
    if (id === 'refresh-readiness') {
      simulateRefresh();
    }
  }, [simulateRefresh]);

  const handleOpenOverride = useCallback(() => {
    if (!selection) return;
    const currentPriority =
      selection.type === 'wo'
        ? ((woItems.find((item) => item.id === selection.id)?.priority ?? 'High') as WoPriority)
        : ((riskItems.find((item) => item.id === selection.id)?.severity ?? 'High') as RiskSeverity);
    setOverrideDialog({open: true, itemId: selection.id, currentPriority});
  }, [selection, riskItems, woItems]);

  const handleConfirmOverride = useCallback((newPriority: WoPriority | RiskSeverity, reason: string) => {
    const {itemId, currentPriority} = overrideDialog;
    const record: PriorityOverrideRecord = {
      originalPriority: currentPriority,
      newPriority,
      user: 'Current User',
      timestamp: new Date().toLocaleString(),
      reason,
    };
    setOverrides((prev) => ({...prev, [itemId]: record}));
    if (viewMode === 'work-order') {
      setWoItems((prev) => prev.map((item) => item.id === itemId ? {...item, priority: newPriority as WoPriority, priorityOverride: record, overrideActive: true} : item));
    } else {
      setRiskItems((prev) => prev.map((item) => item.id === itemId ? {...item, severity: newPriority as RiskSeverity, priorityOverride: record} : item));
    }
    logDecision({
      viewMode,
      selectedItemId: itemId,
      aiRecommendation: aiInsightMap[itemId]?.recommendedAction ?? '',
      userDecision: 'modified',
      comment: reason,
      resultingAction: `Priority overridden from ${currentPriority} to ${newPriority}`,
    });
    setOverrideDialog({open: false, itemId: '', currentPriority: 'High'});
  }, [aiInsightMap, logDecision, overrideDialog, viewMode]);

  const handleAction = useCallback((actionLabel: string, itemId?: string) => {
    const targetId = itemId ?? selection?.id;
    if (!targetId) return;
    const woTarget = woItems.find((item) => item.id === targetId);
    const riskTarget = riskItems.find((item) => item.id === targetId);
    const demandTarget = demandRiskRows.find((item) => item.id === targetId);
    const preparedActionId = woTarget?.preparedActionId ?? riskTarget?.preparedActionId ?? demandTarget?.preparedActionId;
    const recommendation = woTarget?.aiRecommendation ?? riskTarget?.aiRecommendation ?? demandTarget?.aiRecoveryRecommendation ?? actionLabel;
    openPreparedAction(preparedActionId ?? '', recommendation, targetId);
  }, [demandRiskRows, openPreparedAction, riskItems, selection?.id, woItems]);

  const handleConfirmAction = useCallback((comment: string) => {
    if (!selection && !actionPayload) return;
    const selectedItemId = selection?.id ?? actionPayload?.relatedLabel ?? '';
    logDecision({
      viewMode,
      selectedItemId,
      aiRecommendation: actionPayload?.title ?? '',
      userDecision: 'accepted',
      comment,
      resultingAction: `Confirmed ${actionPayload?.title ?? 'AI action'}`,
    });
    if (selection?.type === 'wo') {
      setWoItems((prev) => prev.map((item) => item.id === selection.id ? {...item, actionStatus: 'Assigned'} : item));
    }
    if (selection?.type === 'cluster') {
      setRiskItems((prev) => prev.map((item) => item.id === selection.id ? {...item, actionStatus: 'Assigned'} : item));
    }
    setActionPayload(null);
  }, [actionPayload, logDecision, selection, viewMode]);

  return (
    <Box sx={{p: {xs: 2, md: 3}, display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'var(--planning-background)', minHeight: '100%'}}>
      <Box>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Typography sx={{fontSize: 28, fontWeight: 900, color: '#08184A', lineHeight: 1.1}}>
              AI Action Center for Work Order Readiness
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center" sx={{mt: 0.75}} flexWrap="wrap">
              <MetaItem label="Site" value="BD Site 1" />
              <MetaItem label="Planning horizon" value="26-May to 31-May 2026" />
              <MetaItem label="Last refresh" value={lastRefresh.toLocaleTimeString()} />
              <MetaItem label="AI decisions logged" value={String(decisionLog.length)} />
            </Stack>
          </Box>
          <Tooltip title="Refresh readiness data">
            <IconButton onClick={simulateRefresh} size="small" sx={{border: '1px solid var(--planning-border)', borderRadius: 2}}>
              <RefreshRoundedIcon sx={{fontSize: 18}} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {hasStaleData && pageStatus === 'ready' ? (
        <Alert severity="warning" icon={<WarningAmberRoundedIcon fontSize="small" />} sx={{py: 0.5, fontSize: 13}}>
          Some AI recommendations rely on source data that is older than the freshness threshold. Review freshness before confirming governed actions.
        </Alert>
      ) : null}

      <AiPriorityBriefingCard briefing={aiPriorityBriefing} onQuickAction={handleQuickAction} />
      <PriorityQueueKpiCards cards={viewMode === 'work-order' ? workOrderKpis : operationalRiskKpis} />

      <Stack direction="row" justifyContent="center">
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={{'& .MuiToggleButton-root': {textTransform: 'none', fontWeight: 700, fontSize: 13, px: 3, py: 1}}}
        >
          <ToggleButton value="work-order">Work Order Focus</ToggleButton>
          <ToggleButton value="operational-risk">Operational Risk Focus</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {viewMode === 'work-order' ? (
        <WoFiltersBar filters={woFilters} lines={woLines} onChange={(next) => setWoFilters((prev) => ({...prev, ...next}))} onReset={() => setWoFilters(defaultWoFilters)} />
      ) : (
        <RiskFiltersBar filters={riskFilters} owners={riskOwners} lines={woLines} onChange={(next) => setRiskFilters((prev) => ({...prev, ...next}))} onReset={() => setRiskFilters(defaultRiskFilters)} />
      )}

      {viewMode === 'work-order' ? (
        <>
          <AiRecommendedActionsStrip
            actions={aiActionCards}
            onOpen={(id) => openSelection('wo', id)}
            onAction={(label, relatedId) => handleAction(label, relatedId)}
          />
          <Box sx={{display: 'flex', gap: 2, alignItems: 'flex-start'}}>
            <PriorityQueueTable
              items={filteredWoItems}
              selectedId={selection?.type === 'wo' ? selection.id : null}
              expandedId={expandedWoId}
              onSelect={(id) => openSelection('wo', id)}
              onToggleExpand={(id) => setExpandedWoId((prev) => prev === id ? null : id)}
              onRowAction={(action, itemId) => handleAction(action, itemId)}
              status={pageStatus}
            />
            {pageStatus === 'ready' && selectedWoItem && woDetailMap[selectedWoItem.id] ? (
              <WoDetailPanel
                item={selectedWoItem}
                detail={woDetailMap[selectedWoItem.id]}
                insight={aiInsightMap[selectedWoItem.id]}
                conversation={conversationHistory[selectedWoItem.id] ?? []}
                override={overrides[selectedWoItem.id]}
                onAcceptRecommendation={() => handleAction(selectedWoItem.nextAction, selectedWoItem.id)}
                onOverridePriority={handleOpenOverride}
                onAction={(action) => handleAction(action, selectedWoItem.id)}
              />
            ) : null}
          </Box>
        </>
      ) : (
        <Box sx={{display: 'flex', gap: 2, alignItems: 'flex-start'}}>
          <Box sx={{flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2}}>
            <RiskClusterSection items={filteredRiskItems} selectedId={selection?.type === 'cluster' ? selection.id : null} onSelect={(id) => openSelection('cluster', id)} onAction={(label, id) => handleAction(label, id)} />
            <DemandRiskSection items={filteredDemandRows} selectedId={selection?.type === 'demand' ? selection.id : null} onSelect={(id) => openSelection('demand', id)} onAction={(label, id) => handleAction(label, id)} />
            <LineImpactSection />
          </Box>
          {pageStatus === 'ready' && selectedRiskItem && riskDetailMap[selectedRiskItem.id] ? (
            <RiskDetailPanel
              item={selectedRiskItem}
              detail={riskDetailMap[selectedRiskItem.id]}
              insight={aiInsightMap[selectedRiskItem.id]}
              conversation={conversationHistory[selectedRiskItem.id] ?? []}
              override={overrides[selectedRiskItem.id]}
              onAcceptRecommendation={() => handleAction(selectedRiskItem.primaryAction, selectedRiskItem.id)}
              onOverrideSeverity={handleOpenOverride}
              onAction={(action) => handleAction(action, selectedRiskItem.id)}
            />
          ) : null}
          {pageStatus === 'ready' && selectedDemandItem && demandRiskDetailMap[selectedDemandItem.id] ? (
            <DemandRiskDetailPanel
              item={selectedDemandItem}
              detail={demandRiskDetailMap[selectedDemandItem.id]}
              insight={aiInsightMap[selectedDemandItem.id]}
              conversation={conversationHistory[selectedDemandItem.id] ?? []}
              onAcceptRecommendation={() => handleAction(selectedDemandItem.nextAction, selectedDemandItem.id)}
              onAction={(action) => handleAction(action, selectedDemandItem.id)}
            />
          ) : null}
        </Box>
      )}

      <ActionConfirmDialog
        open={Boolean(actionPayload)}
        payload={actionPayload}
        onClose={() => setActionPayload(null)}
        onConfirm={handleConfirmAction}
      />
      <PriorityOverrideDialog
        open={overrideDialog.open}
        currentPriority={overrideDialog.currentPriority}
        mode={viewMode}
        onClose={() => setOverrideDialog({open: false, itemId: '', currentPriority: 'High'})}
        onConfirm={handleConfirmOverride}
      />
    </Box>
  );
}

function WoFiltersBar({
  filters,
  lines,
  onChange,
  onReset,
}: {
  filters: WoFilters;
  lines: string[];
  onChange: (next: Partial<WoFilters>) => void;
  onReset: () => void;
}) {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, p: 1.5}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))'}, gap: 1}}>
        <TextField select label="Priority" size="small" value={filters.priority} onChange={(e) => onChange({priority: e.target.value})}>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField select label="Readiness" size="small" value={filters.readiness} onChange={(e) => onChange({readiness: e.target.value})}>
          {['All', 'Blocked', 'Warning', 'Ready'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField select label="Action Status" size="small" value={filters.actionStatus} onChange={(e) => onChange({actionStatus: e.target.value})}>
          {['All', 'New', 'Assigned', 'In Review', 'Waiting Response', 'Escalated', 'Completed', 'Resolved Pending Recheck', 'Rejected'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField select label="Line / Machine" size="small" value={filters.lineMachine} onChange={(e) => onChange({lineMachine: e.target.value})}>
          <MenuItem value="All">All Lines</MenuItem>
          {lines.map((line) => <MenuItem key={line} value={line}>{line}</MenuItem>)}
        </TextField>
        <TextField
          label="Product / WO search"
          size="small"
          value={filters.search}
          onChange={(e) => onChange({search: e.target.value})}
          placeholder="Product, WO ID..."
          InputProps={{startAdornment: <SearchRoundedIcon sx={{fontSize: 18, color: '#98A2B3', mr: 1}} />}}
        />
        <TextField select label="Owner" size="small" value={filters.owner} onChange={(e) => onChange({owner: e.target.value})}>
          {['All', 'Material Controller', 'Quality Eng.', 'Sterilization', 'Production Manager', 'Planner', 'Packaging Lead'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField select label="AI Confidence" size="small" value={filters.aiConfidence} onChange={(e) => onChange({aiConfidence: e.target.value})}>
          {['All', 'High', 'Medium', 'Low'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField select label="Data Freshness" size="small" value={filters.freshness} onChange={(e) => onChange({freshness: e.target.value})}>
          {['All', 'Fresh', 'Watch', 'Stale'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField select label="Override Active" size="small" value={filters.overrideActive} onChange={(e) => onChange({overrideActive: e.target.value})}>
          {['All', 'Yes', 'No'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField select label="Recoverable Today" size="small" value={filters.recoverableToday} onChange={(e) => onChange({recoverableToday: e.target.value})}>
          {['All', 'Yes', 'No'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" startIcon={<FilterAltOutlinedIcon />} size="small" sx={{textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap'}}>
            AI filters
          </Button>
          <Button variant="outlined" size="small" onClick={onReset} sx={{textTransform: 'none', fontWeight: 700}}>
            Reset
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

function RiskFiltersBar({
  filters,
  owners,
  lines,
  onChange,
  onReset,
}: {
  filters: RiskFilters;
  owners: string[];
  lines: string[];
  onChange: (next: Partial<RiskFilters>) => void;
  onReset: () => void;
}) {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, p: 1.5}}>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))'}, gap: 1}}>
        <TextField select label="Severity" size="small" value={filters.severity} onChange={(e) => onChange({severity: e.target.value})}>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField select label="Action Status" size="small" value={filters.actionStatus} onChange={(e) => onChange({actionStatus: e.target.value})}>
          {['All', 'New', 'Assigned', 'In Review', 'Waiting Response', 'Escalated', 'Completed', 'Resolved Pending Recheck', 'Rejected'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField select label="Owner" size="small" value={filters.owner} onChange={(e) => onChange({owner: e.target.value})}>
          <MenuItem value="All">All Owners</MenuItem>
          {owners.map((owner) => <MenuItem key={owner} value={owner}>{owner}</MenuItem>)}
        </TextField>
        <TextField select label="Line / Machine" size="small" value={filters.lineMachine} onChange={(e) => onChange({lineMachine: e.target.value})}>
          <MenuItem value="All">All Lines</MenuItem>
          {lines.map((line) => <MenuItem key={line} value={line}>{line}</MenuItem>)}
        </TextField>
        <TextField
          label="Cluster / demand search"
          size="small"
          value={filters.search}
          onChange={(e) => onChange({search: e.target.value})}
          placeholder="Cluster, family, line..."
          InputProps={{startAdornment: <SearchRoundedIcon sx={{fontSize: 18, color: '#98A2B3', mr: 1}} />}}
        />
        <TextField select label="AI Confidence" size="small" value={filters.aiConfidence} onChange={(e) => onChange({aiConfidence: e.target.value})}>
          {['All', 'High', 'Medium', 'Low'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField select label="Data Freshness" size="small" value={filters.freshness} onChange={(e) => onChange({freshness: e.target.value})}>
          {['All', 'Fresh', 'Watch', 'Stale'].map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="outlined" startIcon={<FilterAltOutlinedIcon />} size="small" sx={{textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap'}}>
            Root cause filters
          </Button>
          <Button variant="outlined" size="small" onClick={onReset} sx={{textTransform: 'none', fontWeight: 700}}>
            Reset
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}

function RiskClusterSection({
  items,
  selectedId,
  onSelect,
  onAction,
}: {
  items: RiskClusterItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAction: (action: string, id: string) => void;
}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
      <Typography sx={{fontSize: 15, fontWeight: 900, color: '#08184A'}}>Risk Clusters</Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 1.2}}>
        {items.map((item) => (
          <Paper
            key={item.id}
            elevation={0}
            onClick={() => onSelect(item.id)}
            sx={{
              ...moduleCardSx,
              p: 1.6,
              cursor: 'pointer',
              borderColor: selectedId === item.id ? '#93C5FD' : 'rgba(148,163,184,0.18)',
              boxShadow: selectedId === item.id ? '0 0 0 1px rgba(29,116,255,0.18)' : moduleCardSx.boxShadow,
            }}
          >
            <Stack spacing={1.1}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                    <Typography sx={{fontSize: 12, fontWeight: 900, color: '#1D74FF'}}>C{item.rank}</Typography>
                    <SeverityBadge severity={item.severity} />
                    <StatusBadge status={item.actionStatus} />
                  </Stack>
                  <Typography sx={{fontSize: 16, fontWeight: 800, color: '#08184A', mt: 0.8}}>{item.clusterName}</Typography>
                </Box>
                <Stack spacing={0.5} alignItems="flex-end">
                  <ConfidenceBadge confidence={item.confidence} />
                  <FreshnessBadge state={item.freshness} />
                </Stack>
              </Stack>
              <GridMeta rows={[
                ['Affected WOs', String(item.affectedWos)],
                ['Demand at risk', item.demandAtRisk],
                ['Lines impacted', item.linesImpacted],
                ['Earliest start', item.earliestStart],
                ['Owner', item.owner],
              ]} />
              <Narrative title="Main root cause" value={item.rootCause} />
              <Narrative title="AI recommended action" value={item.aiRecommendation} />
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                <Button variant="contained" size="small" onClick={(event) => { event.stopPropagation(); onAction(item.primaryAction, item.id); }} sx={{textTransform: 'none', fontWeight: 700}}>
                  {item.primaryAction}
                </Button>
                <Button variant="outlined" size="small" onClick={(event) => { event.stopPropagation(); onSelect(item.id); }} sx={{textTransform: 'none', fontWeight: 700}}>
                  Open Detail
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function DemandRiskSection({
  items,
  selectedId,
  onSelect,
  onAction,
}: {
  items: DemandRiskRow[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAction: (action: string, id: string) => void;
}) {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, overflow: 'hidden'}}>
      <Box sx={{px: 1.6, py: 1.2, borderBottom: '1px solid rgba(148,163,184,0.15)'}}>
        <Typography sx={{fontSize: 15, fontWeight: 900, color: '#08184A'}}>Demand Risk</Typography>
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        {items.map((item, index) => (
          <Box
            key={item.id}
            onClick={() => onSelect(item.id)}
            sx={{
              px: 1.6,
              py: 1.2,
              cursor: 'pointer',
              borderTop: index === 0 ? 'none' : '1px solid rgba(148,163,184,0.12)',
              bgcolor: selectedId === item.id ? '#EFF6FF' : '#FFFFFF',
            }}
          >
            <Stack direction={{xs: 'column', xl: 'row'}} spacing={1.2} justifyContent="space-between">
              <Box sx={{minWidth: 0}}>
                <Typography sx={{fontSize: 14, fontWeight: 800, color: '#08184A'}}>{item.family}</Typography>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.35}}>
                  Demand required: {item.demandRequired} | Ready: {item.readyQuantity} | At risk: {item.atRiskQuantity} | Recoverable: {item.recoverableQuantity}
                </Typography>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', mt: 0.65}}>
                  Main constraint: {item.mainConstraint} | Affected WOs: {item.affectedWos.join(', ')}
                </Typography>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.65}}>
                  AI recommendation: {item.aiRecoveryRecommendation}
                </Typography>
              </Box>
              <Stack spacing={0.75} alignItems={{xs: 'flex-start', xl: 'flex-end'}}>
                <ConfidenceBadge confidence={item.confidence} />
                <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>Earliest risk: {item.earliestRiskDate}</Typography>
                <Button variant="contained" size="small" onClick={(event) => { event.stopPropagation(); onAction(item.nextAction, item.id); }} sx={{textTransform: 'none', fontWeight: 700}}>
                  {item.nextAction}
                </Button>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function LineImpactSection() {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, overflow: 'hidden'}}>
      <Box sx={{px: 1.6, py: 1.2, borderBottom: '1px solid rgba(148,163,184,0.15)'}}>
        <Typography sx={{fontSize: 15, fontWeight: 900, color: '#08184A'}}>Line Impact</Typography>
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column'}}>
        {lineImpactRows.map((row, index) => (
          <Box key={row.id} sx={{px: 1.6, py: 1.2, borderTop: index === 0 ? 'none' : '1px solid rgba(148,163,184,0.12)'}}>
            <Stack direction={{xs: 'column', lg: 'row'}} spacing={1.2} justifyContent="space-between">
              <Box>
                <Typography sx={{fontSize: 14, fontWeight: 800, color: '#08184A'}}>{row.lineMachine}</Typography>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.35}}>
                  {row.wosAtRisk} | {row.atRiskQuantity} | {row.lineHoursAtRisk} line risk
                </Typography>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', mt: 0.65}}>
                  Primary constraint: {row.primaryConstraint}
                </Typography>
              </Box>
              <Box sx={{textAlign: {xs: 'left', lg: 'right'}}}>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>Earliest impact: {row.earliestImpact}</Typography>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', mt: 0.35}}>AI recommendation: {row.aiRecommendation}</Typography>
                <Typography sx={{fontSize: 12, fontWeight: 800, color: '#1D4ED8', mt: 0.5}}>{row.nextAction}</Typography>
              </Box>
            </Stack>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function MetaItem({label, value}: {label: string; value: string}) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)'}}>{value}</Typography>
    </Stack>
  );
}

function GridMeta({rows}: {rows: [string, string][]}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 0.8}}>
      {rows.map(([label, value]) => (
        <Box key={label}>
          <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.35}}>
            {label}
          </Typography>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', lineHeight: 1.45}}>{value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function Narrative({title, value}: {title: string; value: string}) {
  return (
    <Box sx={{p: 1.05, borderRadius: 2, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
      <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.35}}>
        {title}
      </Typography>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', lineHeight: 1.5}}>{value}</Typography>
    </Box>
  );
}
