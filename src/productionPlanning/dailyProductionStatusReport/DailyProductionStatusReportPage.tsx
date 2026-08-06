import React, {useMemo, useState} from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle, Button, Box, MenuItem, Paper, Stack, Switch, TextField, Typography} from '@mui/material';
import {
  buildDowntimeSummary,
  buildKeyProductionNotes,
  buildProductionTrendData,
  calculateDailyProductionKpis,
  createDailyProductionAuditEvent,
  enrichProductionLine,
  filterProductionLines,
  formatCompactTimestamp,
} from './utils';
import {createDailyProductionStatusDemoBundle} from './mocks';
import type {DailyProductionLineFilters, ProductionLineStatus} from './types';
import DailyProductionReportHeader from './components/DailyProductionReportHeader';
import DailyProductionKpiCards from './components/DailyProductionKpiCards';
import ProductionStatusByLineTable from './components/ProductionStatusByLineTable';
import DowntimeSummaryCard from './components/DowntimeSummaryCard';
import KeyNotesCard from './components/KeyNotesCard';
import PlanVsActualTrendCard from './components/PlanVsActualTrendCard';
import LineDetailDrawer from './components/LineDetailDrawer';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
} as const;

const defaultFilters: DailyProductionLineFilters = {
  status: 'All',
  lineId: 'All',
  productSearch: '',
  showOnlyGaps: false,
  showStoppedLinesOnly: false,
};

type PageState = ReturnType<typeof createDailyProductionStatusDemoBundle>;

function createInitialState(): PageState {
  return createDailyProductionStatusDemoBundle();
}

export default function DailyProductionStatusReportPage() {
  const [state, setState] = useState<PageState>(() => createInitialState());
  const [filters, setFilters] = useState<DailyProductionLineFilters>(defaultFilters);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);

  const kpis = useMemo(
    () => calculateDailyProductionKpis(state.productionLineStatuses, state.safetyIncidents),
    [state.productionLineStatuses, state.safetyIncidents],
  );
  const visibleLines = useMemo(
    () => filterProductionLines(state.productionLineStatuses, filters),
    [filters, state.productionLineStatuses],
  );
  const downtimeSummary = useMemo(() => buildDowntimeSummary(state.downtimeEvents), [state.downtimeEvents]);
  const generatedNotes = useMemo(
    () => buildKeyProductionNotes(state.productionLineStatuses, state.downtimeEvents, kpis),
    [kpis, state.downtimeEvents, state.productionLineStatuses],
  );
  const mergedNotes = useMemo(() => {
    const existingIds = new Set(state.notes.map((note) => note.id));
    return [...state.notes, ...generatedNotes.filter((note) => !existingIds.has(note.id))];
  }, [generatedNotes, state.notes]);
  const trendData = useMemo(() => buildProductionTrendData(state.productionLineStatuses), [state.productionLineStatuses]);
  const selectedLine = state.productionLineStatuses.find((line) => line.lineId === selectedLineId) ?? null;
  const selectedLineDowntime = state.downtimeEvents.filter((event) => event.lineId === selectedLineId);

  const appendAuditEvent = (eventType: string, previousValue: string, newValue: string, comment: string) => {
    setState((current) => ({
      ...current,
      auditEvents: [
        createDailyProductionAuditEvent({
          reportId: current.report.id,
          user: current.report.planner,
          eventType,
          previousValue,
          newValue,
          comment,
        }),
        ...current.auditEvents,
      ],
    }));
  };

  const handleRefresh = () => {
    const refreshedAt = new Date().toISOString();
    setState((current) => ({
      ...current,
      lastRefreshAt: refreshedAt,
      report: {...current.report, lastUpdatedAt: refreshedAt},
    }));
    appendAuditEvent('ReportRefreshed', state.lastRefreshAt, refreshedAt, 'Local refresh updated the timestamp.');
  };

  const handleSave = () => {
    const savedAt = new Date().toISOString();
    setState((current) => ({
      ...current,
      report: {
        ...current.report,
        reportStatus: 'Saved',
        lastSavedAt: savedAt,
        lastUpdatedAt: savedAt,
      },
    }));
    appendAuditEvent('ReportSaved', state.report.reportStatus, 'Saved', 'Local save updated report status and timestamp.');
  };

  const handleReset = () => {
    setState(createInitialState());
    setFilters(defaultFilters);
    setSelectedLineId(null);
  };

  const handleSubmit = () => {
    const submittedAt = new Date().toISOString();
    setState((current) => ({
      ...current,
      report: {
        ...current.report,
        reportStatus: 'Submitted',
        submittedAt,
        lastUpdatedAt: submittedAt,
      },
    }));
    appendAuditEvent('ReportSubmitted', state.report.reportStatus, 'Submitted', 'Local submit updated report status only.');
    setSubmitDialogOpen(false);
  };

  const handleUpdateLine = (lineId: string, patch: Partial<ProductionLineStatus>) => {
    setState((current) => {
      const previousLine = current.productionLineStatuses.find((line) => line.lineId === lineId);
      if (!previousLine) {
        return current;
      }
      const updatedLine = enrichProductionLine({
        ...previousLine,
        ...patch,
        lastUpdatedAt: new Date().toISOString(),
      });
      const nextLines = current.productionLineStatuses.map((line) => (line.lineId === lineId ? updatedLine : line));
      const changedFields = Object.keys(patch);
      const auditEvent = createDailyProductionAuditEvent({
        reportId: current.report.id,
        user: current.report.planner,
        eventType: 'LineUpdated',
        previousValue: JSON.stringify(previousLine),
        newValue: JSON.stringify(updatedLine),
        comment: `Updated ${lineId}: ${changedFields.join(', ')}`,
      });
      return {
        ...current,
        productionLineStatuses: nextLines,
        report: {...current.report, lastUpdatedAt: updatedLine.lastUpdatedAt},
        auditEvents: [auditEvent, ...current.auditEvents],
      };
    });
  };

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}} data-testid="daily-production-status-report-page">
      <DailyProductionReportHeader
        report={state.report}
        lastRefreshAt={state.lastRefreshAt}
        onRefresh={handleRefresh}
        onSave={handleSave}
        onSubmit={() => setSubmitDialogOpen(true)}
        onReset={handleReset}
      />

      <DailyProductionKpiCards kpis={kpis} />

      <Paper elevation={0} sx={{...moduleCardSx, p: 1.5}}>
        <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
          Filters
        </Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(5, minmax(0, 1fr))'}, gap: 1.1, mt: 1.2}}>
          <TextField
            select
            size="small"
            label="Line Status"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({...current, status: event.target.value as DailyProductionLineFilters['status']}))}
          >
            {['All', 'Running', 'Stopped', 'Idle', 'PlannedDown', 'Maintenance', 'Complete'].map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Line"
            value={filters.lineId}
            onChange={(event) => setFilters((current) => ({...current, lineId: event.target.value}))}
          >
            <MenuItem value="All">All Lines</MenuItem>
            {state.productionLineStatuses.map((line) => (
              <MenuItem key={line.lineId} value={line.lineId}>{line.lineName}</MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Product Search"
            value={filters.productSearch}
            onChange={(event) => setFilters((current) => ({...current, productSearch: event.target.value}))}
            placeholder="Product, line, notes"
          />
          <Paper elevation={0} sx={{display: 'flex', alignItems: 'center', px: 1.2, border: '1px solid var(--planning-border)', borderRadius: 2}}>
            <Switch checked={filters.showOnlyGaps} onChange={(event) => setFilters((current) => ({...current, showOnlyGaps: event.target.checked}))} />
            <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 700}}>Show only gaps</Typography>
          </Paper>
          <Paper elevation={0} sx={{display: 'flex', alignItems: 'center', px: 1.2, border: '1px solid var(--planning-border)', borderRadius: 2}}>
            <Switch checked={filters.showStoppedLinesOnly} onChange={(event) => setFilters((current) => ({...current, showStoppedLinesOnly: event.target.checked}))} />
            <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 700}}>Show stopped only</Typography>
          </Paper>
        </Box>
      </Paper>

      <ProductionStatusByLineTable
        lines={visibleLines}
        selectedLineId={selectedLineId}
        onSelectLine={setSelectedLineId}
        onUpdateLine={handleUpdateLine}
      />

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1.05fr 0.95fr 1.1fr'}, gap: 1.2}}>
        <DowntimeSummaryCard events={downtimeSummary} />
        <KeyNotesCard notes={mergedNotes} />
        <PlanVsActualTrendCard trendData={trendData} />
      </Box>

      <Paper elevation={0} sx={{...moduleCardSx, p: 1.4}}>
        <Stack direction="row" spacing={2} sx={{justifyContent: 'space-between', flexWrap: 'wrap'}}>
          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>Last updated: {formatCompactTimestamp(state.report.lastUpdatedAt)}</Typography>
          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>Auto refresh: {state.autoRefreshEnabled ? 'On' : 'Off'}</Typography>
        </Stack>
      </Paper>

      <LineDetailDrawer line={selectedLine} downtimeEvents={selectedLineDowntime} onClose={() => setSelectedLineId(null)} />

      <Dialog open={submitDialogOpen} onClose={() => setSubmitDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900, color: 'var(--planning-text-primary)'}}>Submit Daily Production Status Report</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', lineHeight: 1.65}}>
            This is a front-end-only confirmation. Submitting will update local report status and create a local audit entry.
          </Typography>
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setSubmitDialogOpen(false)} sx={{textTransform: 'none', fontWeight: 800}}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} sx={{textTransform: 'none', fontWeight: 800}}>Confirm submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
