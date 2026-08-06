import React, { useState, useMemo, useCallback } from 'react';
import {
  Box, Paper, Stack, Typography, Tabs, Tab, Button, Chip, Tooltip, IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  ArrowBack as BackIcon,
  LibraryAdd as BatchIcon,
  TableRows as TableIcon,
  ViewKanban as BoardIcon,
  Timeline as TimelineIcon,
  CalendarMonth as CalendarIcon,
  Warning as ExcIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { planningTokens, planningCardSx } from '../ui/planningTheme';

import type { WOConversationMessage, WOFilters, WOMainTab, WorkOrder } from './types';
import { WORK_ORDERS, SAVED_VIEWS, computeWOSummary } from './mockData';
import SummaryCounters from './components/SummaryCounters';
import GlobalFiltersBar from './components/GlobalFiltersBar';
import WODetailDrawer from './components/WODetailDrawer';
import BatchCreateWOModal from './components/BatchCreateWOModal';
import SmartWOCreationDrawer from './components/SmartWOCreationDrawer';
import AllWorkOrdersView from './views/AllWorkOrdersView';
import BoardView from './views/BoardView';
import TimelineView from './views/TimelineView';
import CalendarView from './views/CalendarView';
import ExceptionsView from './views/ExceptionsView';
import HistoryView from './views/HistoryView';

export interface WorkOrderManagementScreenProps {
  onBack?: () => void;
  onOpenBluAiWorkflow?: () => void;
  onCreateOrder?: () => void;
}

const DEFAULT_FILTERS: WOFilters = {
  search: '',
  lifecycleStatus: [],
  readinessStatus: [],
  riskLevel: [],
  line: [],
  machine: [],
  shift: [],
  dateFrom: '',
  dateTo: '',
  savedView: '',
  showExceptionsOnly: false,
  dataFreshness: [],
};

const TABS: { value: WOMainTab; label: string; icon: React.ReactNode }[] = [
  { value: 'all',        label: 'All Work Orders', icon: <TableIcon sx={{ fontSize: 16 }} /> },
  { value: 'board',      label: 'Board',            icon: <BoardIcon sx={{ fontSize: 16 }} /> },
  { value: 'timeline',   label: 'Timeline',         icon: <TimelineIcon sx={{ fontSize: 16 }} /> },
  { value: 'calendar',   label: 'Calendar',         icon: <CalendarIcon sx={{ fontSize: 16 }} /> },
  { value: 'exceptions', label: 'Exceptions',       icon: <ExcIcon sx={{ fontSize: 16 }} /> },
  { value: 'history',    label: 'History',          icon: <HistoryIcon sx={{ fontSize: 16 }} /> },
];

const buildInitialConversationByWo = (workOrders: WorkOrder[]) =>
  Object.fromEntries(
    workOrders.map((wo) => [
      wo.woId,
      wo.bluAiHistory?.length
        ? wo.bluAiHistory
        : [{
            id: `WO-INIT-${wo.woId}`,
            woId: wo.woId,
            role: 'assistant' as const,
            kind: 'summary' as const,
            text: `I am ready to help with ${wo.woId}. Ask about readiness, blockers, materials, schedule, or the next recommended action.`,
            timestamp: wo.sourceTimestamp,
          }],
    ]),
  ) as Record<string, WOConversationMessage[]>;

export default function WorkOrderManagementScreen({ onBack, onOpenBluAiWorkflow, onCreateOrder }: WorkOrderManagementScreenProps) {
  const [tab, setTab] = useState<WOMainTab>('all');
  const [filters, setFilters] = useState<WOFilters>(DEFAULT_FILTERS);
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [batchOpen, setBatchOpen] = useState(false);
  const [smartWOOpen, setSmartWOOpen] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const workOrders = WORK_ORDERS;
  const [woConversationById, setWoConversationById] = useState<Record<string, WOConversationMessage[]>>(() => buildInitialConversationByWo(workOrders));
  const summary = useMemo(() => computeWOSummary(workOrders), [workOrders]);

  const patchFilters = useCallback((patch: Partial<WOFilters>) => {
    setFilters(prev => ({ ...prev, ...patch }));
  }, []);

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const blockedCount = workOrders.filter(w => w.readinessStatus === 'Blocked').length;
  const exceptionCount = workOrders.filter(w => w.exceptions.length > 0).length;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: planningTokens.background, overflow: 'hidden' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          ...planningCardSx,
          borderRadius: 0,
          px: { xs: 2, md: 2.5 },
          py: 1.5,
          flexShrink: 0,
        }}
      >
        {/* Breadcrumb */}
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.8 }}>
          <Typography sx={{ fontSize: 11, color: planningTokens.textMuted }}>Production Planning</Typography>
          <Typography sx={{ fontSize: 11, color: planningTokens.textMuted }}>›</Typography>
          <Typography sx={{ fontSize: 11, fontWeight: 600, color: planningTokens.primaryBlue }}>Orders Management</Typography>
        </Stack>

        {/* Title row */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
          {onBack && (
            <Tooltip title="Back">
              <IconButton size="small" onClick={onBack} sx={{ color: planningTokens.textSecondary, p: 0.4 }}>
                <BackIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Typography sx={{ fontSize: 22, fontWeight: 900, color: planningTokens.textPrimary }}>
            Work Order Management
          </Typography>
          {blockedCount > 0 && (
            <Chip label={`${blockedCount} Blocked`} size="small" sx={{ bgcolor: '#FEF2F2', color: planningTokens.danger, fontWeight: 700, border: '1px solid #FECACA' }} />
          )}
          {exceptionCount > 0 && (
            <Chip label={`${exceptionCount} Exceptions`} size="small" sx={{ bgcolor: '#FFF7ED', color: planningTokens.warning, fontWeight: 700, border: '1px solid #FED7AA' }} />
          )}
          <Box sx={{ ml: 'auto' }}>
            <Tooltip title={`Last refreshed: ${lastRefresh.toLocaleTimeString()}`}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => setLastRefresh(new Date())}
                sx={{ fontSize: 11, fontWeight: 700, textTransform: 'none', height: 32, borderColor: planningTokens.border, color: planningTokens.textSecondary }}
              >
                Refresh
              </Button>
            </Tooltip>
          </Box>
        </Box>

        {/* Subtitle */}
        <Typography sx={{ fontSize: 12, color: planningTokens.textSecondary }}>
          AI-powered decision &amp; action copilot for your production floor
        </Typography>
      </Paper>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 1.5, md: 2.5 } }}>
        {/* Summary counters */}
        <SummaryCounters summary={summary} filters={filters} onFilterChange={patchFilters} />

        {/* Filters bar */}
        <GlobalFiltersBar filters={filters} savedViews={SAVED_VIEWS} onChange={patchFilters} onClear={clearFilters} />

        {/* Tab bar + action buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1, flexWrap: 'wrap' }}>
          <Paper elevation={0} sx={{ flex: 1, border: '1px solid var(--planning-border)', borderRadius: 2, overflow: 'hidden' }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 40,
                '& .MuiTab-root': { minHeight: 40, py: 0, fontSize: '0.75rem', fontWeight: 600, textTransform: 'none' },
                '& .Mui-selected': { fontWeight: 800 },
              }}
            >
              {TABS.map(t => (
                <Tab
                  key={t.value}
                  value={t.value}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      {t.icon}
                      {t.label}
                      {t.value === 'exceptions' && exceptionCount > 0 && (
                        <Chip label={exceptionCount} size="small" sx={{ height: 16, fontSize: '0.6rem', bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 800 }} />
                      )}
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Paper>

          <Button
            size="small"
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => onCreateOrder ? onCreateOrder() : setSmartWOOpen(true)}
            sx={{ bgcolor: planningTokens.primaryBlue, '&:hover': { bgcolor: planningTokens.primaryBlueAlt }, fontWeight: 700, whiteSpace: 'nowrap', height: 40, textTransform: 'none' }}
          >
            New WO
          </Button>
          <Button
            size="small"
            variant="contained"
            startIcon={<BatchIcon />}
            onClick={() => setBatchOpen(true)}
            sx={{ bgcolor: planningTokens.primaryBlue, '&:hover': { bgcolor: planningTokens.primaryBlueAlt }, fontWeight: 700, whiteSpace: 'nowrap', height: 40, textTransform: 'none' }}
          >
            Batch Create
          </Button>
        </Box>

        {/* Tab content */}
        <Paper elevation={0} sx={{ p: 2, border: '1px solid var(--planning-border)', borderRadius: 2, minHeight: 400 }}>
          {tab === 'all' && (
            <AllWorkOrdersView workOrders={workOrders} filters={filters} onSelectWO={setSelectedWO} />
          )}
          {tab === 'board' && (
            <BoardView workOrders={workOrders} filters={filters} onSelectWO={setSelectedWO} />
          )}
          {tab === 'timeline' && (
            <TimelineView workOrders={workOrders} filters={filters} onSelectWO={setSelectedWO} />
          )}
          {tab === 'calendar' && (
            <CalendarView workOrders={workOrders} filters={filters} onSelectWO={setSelectedWO} />
          )}
          {tab === 'exceptions' && (
            <ExceptionsView workOrders={workOrders} filters={filters} onSelectWO={setSelectedWO} />
          )}
          {tab === 'history' && (
            <HistoryView workOrders={workOrders} />
          )}
        </Paper>
      </Box>

      {/* WO Detail Drawer */}
      <WODetailDrawer
        wo={selectedWO}
        onClose={() => setSelectedWO(null)}
        bluAiConversation={selectedWO ? (woConversationById[selectedWO.woId] || []) : []}
        onBluAiConversationChange={(messages) => {
          if (!selectedWO) return;
          setWoConversationById(prev => ({ ...prev, [selectedWO.woId]: messages }));
        }}
        onOpenBluAiWorkflow={onOpenBluAiWorkflow}
      />

      {/* Batch Create Modal */}
      <BatchCreateWOModal open={batchOpen} onClose={() => setBatchOpen(false)} />

      {/* Smart WO Creation Drawer */}
      <SmartWOCreationDrawer open={smartWOOpen} onClose={() => setSmartWOOpen(false)} />
    </Box>
  );
}
