import React, { useState, useMemo } from 'react';
import {
  Box, Table, TableHead, TableRow, TableCell, TableBody, TableSortLabel,
  Checkbox, Toolbar, Typography, Button, Alert, Chip, LinearProgress, Tooltip, Paper,
} from '@mui/material';
import { SmartToy as AIIcon, GetApp as ExportIcon, PersonAdd as AssignIcon } from '@mui/icons-material';
import type { WorkOrder, WOFilters } from '../types';
import { LifecycleChip, ReadinessChip, RiskChip, DataFreshnessChip } from '../components/WOStatusChip';

interface AllWorkOrdersViewProps {
  workOrders: WorkOrder[];
  filters: WOFilters;
  onSelectWO: (wo: WorkOrder) => void;
}

type SortKey = 'woId' | 'scheduledStart' | 'progressPct' | 'aiRiskScore' | 'lifecycleStatus' | 'riskLevel';
type SortDir = 'asc' | 'desc';

function applyFilters(wos: WorkOrder[], f: WOFilters): WorkOrder[] {
  return wos.filter(wo => {
    if (f.search) {
      const s = f.search.toLowerCase();
      if (!wo.woId.toLowerCase().includes(s) && !wo.materialDescription.toLowerCase().includes(s) && !wo.batch.toLowerCase().includes(s)) return false;
    }
    if (f.lifecycleStatus.length && !f.lifecycleStatus.includes(wo.lifecycleStatus)) return false;
    if (f.readinessStatus.length && !f.readinessStatus.includes(wo.readinessStatus)) return false;
    if (f.riskLevel.length && !f.riskLevel.includes(wo.riskLevel)) return false;
    if (f.line.length && !f.line.includes(wo.line)) return false;
    if (f.machine.length && !f.machine.includes(wo.machine)) return false;
    if (f.shift.length && !f.shift.includes(wo.shift)) return false;
    if (f.showExceptionsOnly && wo.exceptions.length === 0) return false;
    if (f.dataFreshness.length && !f.dataFreshness.includes(wo.dataFreshness)) return false;
    if (f.dateFrom && wo.scheduledStart < f.dateFrom) return false;
    if (f.dateTo && wo.scheduledStart > f.dateTo + 'T23:59:59') return false;
    return true;
  });
}

export default function AllWorkOrdersView({ workOrders, filters, onSelectWO }: AllWorkOrdersViewProps) {
  const [sortKey, setSortKey] = useState<SortKey>('scheduledStart');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => applyFilters(workOrders, filters), [workOrders, filters]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aV = a[sortKey] as string | number;
      const bV = b[sortKey] as string | number;
      const cmp = aV < bV ? -1 : aV > bV ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir]);

  const atRisk = filtered.filter(wo => wo.aiRiskScore > 65).length;

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const toggleAll = () => {
    if (selected.size === sorted.length) setSelected(new Set());
    else setSelected(new Set(sorted.map(w => w.woId)));
  };

  const toggleOne = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const COLS: { key: SortKey; label: string; sortable?: boolean }[] = [
    { key: 'woId', label: 'WO ID', sortable: true },
    { key: 'scheduledStart', label: 'Scheduled Start', sortable: true },
    { key: 'lifecycleStatus', label: 'Status', sortable: true },
    { key: 'riskLevel', label: 'Risk', sortable: true },
    { key: 'progressPct', label: 'Progress', sortable: true },
    { key: 'aiRiskScore', label: 'AI Score', sortable: true },
  ];

  return (
    <Box>
      {/* AI Banner */}
      {atRisk > 0 && (
        <Alert severity="warning" icon={<AIIcon />} sx={{ mb: 2, borderRadius: 2, fontSize: '0.82rem' }}>
          <strong>AI detected {atRisk} WO{atRisk !== 1 ? 's' : ''} at risk</strong> — review recommended before next shift handoff.
        </Alert>
      )}

      {/* Bulk toolbar */}
      {selected.size > 0 && (
        <Paper elevation={0} sx={{ mb: 1.5, px: 2, py: 1, bgcolor: 'var(--planning-neutral-bg)', border: '1px solid #BFDBFE', borderRadius: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#1D4ED8', flex: 1 }}>{selected.size} selected</Typography>
          <Button size="small" variant="outlined" sx={{ borderColor: '#3B82F6', color: '#1D4ED8', fontSize: '0.72rem' }}>Release</Button>
          <Button size="small" variant="outlined" sx={{ borderColor: '#F59E0B', color: '#B45309', fontSize: '0.72rem' }}>Put On Hold</Button>
          <Button size="small" startIcon={<AssignIcon />} sx={{ color: '#475569', fontSize: '0.72rem' }}>Assign Owner</Button>
          <Button size="small" startIcon={<ExportIcon />} sx={{ color: '#475569', fontSize: '0.72rem' }}>Export</Button>
          <Button size="small" onClick={() => setSelected(new Set())} sx={{ color: 'var(--planning-text-muted)', fontSize: '0.72rem' }}>Clear</Button>
        </Paper>
      )}

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: 'var(--planning-surface-muted)' }}>
                <Checkbox size="small" indeterminate={selected.size > 0 && selected.size < sorted.length} checked={selected.size === sorted.length && sorted.length > 0} onChange={toggleAll} />
              </TableCell>
              {COLS.map(col => (
                <TableCell key={col.key} sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 1 }}>
                  {col.sortable ? (
                    <TableSortLabel active={sortKey === col.key} direction={sortKey === col.key ? sortDir : 'asc'} onClick={() => toggleSort(col.key)}>
                      {col.label}
                    </TableSortLabel>
                  ) : col.label}
                </TableCell>
              ))}
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 1 }}>Material</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 1 }}>Line / Machine</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 1 }}>Qty</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 1 }}>Readiness</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 1 }}>Data</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: '0.72rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 1 }}>Exceptions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map(wo => (
              <TableRow
                key={wo.woId}
                hover
                selected={selected.has(wo.woId)}
                onClick={() => onSelectWO(wo)}
                sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'var(--planning-surface-muted)' } }}
              >
                <TableCell padding="checkbox" onClick={e => { e.stopPropagation(); toggleOne(wo.woId); }}>
                  <Checkbox size="small" checked={selected.has(wo.woId)} />
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E40AF', display: 'block' }}>{wo.woId}</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--planning-text-muted)', fontSize: '0.63rem' }}>{wo.shift}</Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75, fontSize: '0.72rem' }}>{new Date(wo.scheduledStart).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</TableCell>
                <TableCell sx={{ py: 0.75 }}><LifecycleChip status={wo.lifecycleStatus} /></TableCell>
                <TableCell sx={{ py: 0.75 }}><RiskChip level={wo.riskLevel} /></TableCell>
                <TableCell sx={{ py: 0.75, minWidth: 100 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress variant="determinate" value={wo.progressPct} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: wo.progressPct > 80 ? '#059669' : '#3B82F6' } }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.65rem', color: '#475569' }}>{wo.progressPct}%</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Chip label={wo.aiRiskScore} size="small" sx={{ fontWeight: 800, fontSize: '0.68rem', bgcolor: wo.aiRiskScore > 70 ? '#FEF2F2' : wo.aiRiskScore > 40 ? '#FFFBEB' : '#ECFDF5', color: wo.aiRiskScore > 70 ? '#DC2626' : wo.aiRiskScore > 40 ? '#D97706' : '#059669' }} />
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>{wo.materialCode}</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', fontSize: '0.65rem' }}>{wo.materialDescription.slice(0, 28)}{wo.materialDescription.length > 28 ? '…' : ''}</Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', fontSize: '0.72rem' }}>{wo.line}</Typography>
                  <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', fontSize: '0.65rem' }}>{wo.machine}</Typography>
                </TableCell>
                <TableCell sx={{ py: 0.75, fontSize: '0.72rem' }}>{wo.plannedQty} {wo.uom}</TableCell>
                <TableCell sx={{ py: 0.75 }}><ReadinessChip status={wo.readinessStatus} /></TableCell>
                <TableCell sx={{ py: 0.75 }}><DataFreshnessChip freshness={wo.dataFreshness} hours={wo.dataFreshnessHours} /></TableCell>
                <TableCell sx={{ py: 0.75 }}>
                  {wo.exceptions.length > 0
                    ? <Chip label={wo.exceptions.length} size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 800, fontSize: '0.68rem' }} />
                    : <Typography variant="caption" sx={{ color: 'var(--planning-text-muted)' }}>—</Typography>}
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={13} sx={{ textAlign: 'center', py: 4, color: 'var(--planning-text-muted)' }}>No work orders match the current filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>

      <Typography variant="caption" sx={{ color: 'var(--planning-text-muted)', display: 'block', mt: 1, textAlign: 'right' }}>
        Showing {sorted.length} of {workOrders.length} work orders
      </Typography>
    </Box>
  );
}
