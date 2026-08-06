import React, { useMemo } from 'react';
import { Box, Paper, Typography, Chip, LinearProgress, Alert } from '@mui/material';
import { AutoAwesome as SparkleIcon } from '@mui/icons-material';
import type { WorkOrder, WOFilters, WOLifecycleStatus } from '../types';
import { LIFECYCLE_COLORS, ReadinessChip, RiskChip } from '../components/WOStatusChip';

interface BoardViewProps {
  workOrders: WorkOrder[];
  filters: WOFilters;
  onSelectWO: (wo: WorkOrder) => void;
}

const COLUMNS: WOLifecycleStatus[] = [
  'Draft', 'Planned', 'Scheduled', 'ReadyForRelease', 'Released', 'InExecution', 'OnHold', 'Completed',
];

function applyFilters(wos: WorkOrder[], f: WOFilters): WorkOrder[] {
  return wos.filter(wo => {
    if (f.search) {
      const s = f.search.toLowerCase();
      if (!wo.woId.toLowerCase().includes(s) && !wo.materialDescription.toLowerCase().includes(s)) return false;
    }
    if (f.readinessStatus.length && !f.readinessStatus.includes(wo.readinessStatus)) return false;
    if (f.riskLevel.length && !f.riskLevel.includes(wo.riskLevel)) return false;
    if (f.line.length && !f.line.includes(wo.line)) return false;
    if (f.showExceptionsOnly && wo.exceptions.length === 0) return false;
    return true;
  });
}

function WOCard({ wo, onSelect }: { wo: WorkOrder; onSelect: () => void }) {
  const c = LIFECYCLE_COLORS[wo.lifecycleStatus];
  return (
    <Paper
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 1.5, borderRadius: 2, mb: 1,
        border: `1px solid color-mix(in srgb, ${c.color} 13%, transparent)`,
        borderLeft: `3px solid ${c.color}`,
        cursor: 'pointer',
        bgcolor: 'white',
        '&:hover': { bgcolor: 'var(--planning-surface-muted)', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E40AF' }}>{wo.woId}</Typography>
        <RiskChip level={wo.riskLevel} />
      </Box>
      <Typography variant="caption" sx={{ color: 'var(--planning-text-secondary)', display: 'block', fontSize: '0.7rem', lineHeight: 1.4, mb: 0.75 }}>
        {wo.materialDescription.slice(0, 38)}{wo.materialDescription.length > 38 ? '…' : ''}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 0.75 }}>
        <Chip label={`Batch ${wo.batch}`} size="small" sx={{ bgcolor: 'var(--planning-surface-muted)', color: '#475569', fontSize: '0.62rem', height: 18 }} />
        <Chip label={wo.line} size="small" sx={{ bgcolor: 'var(--planning-surface-muted)', color: '#475569', fontSize: '0.62rem', height: 18 }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <ReadinessChip status={wo.readinessStatus} />
        {wo.exceptions.length > 0 && (
          <Chip label={`${wo.exceptions.length} exc`} size="small" sx={{ bgcolor: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: '0.62rem', height: 18 }} />
        )}
      </Box>
      {wo.lifecycleStatus === 'InExecution' && (
        <LinearProgress variant="determinate" value={wo.progressPct}
          sx={{ mt: 0.5, height: 4, borderRadius: 2, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': { bgcolor: '#2563EB' } }} />
      )}
      {wo.currentBlocker && (
        <Typography variant="caption" sx={{ color: '#DC2626', fontSize: '0.62rem', display: 'block', mt: 0.5 }}>
          ⚠ {wo.currentBlocker.slice(0, 50)}
        </Typography>
      )}
      <Typography variant="caption" sx={{ color: 'var(--planning-text-muted)', fontSize: '0.62rem', display: 'block', mt: 0.5 }}>
        {new Date(wo.scheduledStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </Typography>
    </Paper>
  );
}

export default function BoardView({ workOrders, filters, onSelectWO }: BoardViewProps) {
  const filtered = useMemo(() => applyFilters(workOrders, filters), [workOrders, filters]);

  const byColumn = useMemo(() => {
    const map: Record<WOLifecycleStatus, WorkOrder[]> = {} as any;
    COLUMNS.forEach(col => { map[col] = []; });
    filtered.forEach(wo => {
      if (COLUMNS.includes(wo.lifecycleStatus)) map[wo.lifecycleStatus].push(wo);
    });
    return map;
  }, [filtered]);

  const stuckWOs = filtered.filter(wo =>
    wo.lifecycleStatus === 'OnHold' || (wo.lifecycleStatus === 'ReadyForRelease' && wo.readinessStatus === 'Blocked')
  );

  return (
    <Box sx={{ overflowX: 'auto' }}>
      {stuckWOs.length > 0 && (
        <Alert severity="warning" icon={<SparkleIcon />} sx={{ mb: 2, borderRadius: 2, fontSize: '0.82rem' }}>
          <strong>AI Alert:</strong> {stuckWOs.length} WO{stuckWOs.length !== 1 ? 's' : ''} appear stuck (On Hold or Release Blocked). Recommend reviewing: {stuckWOs.map(w => w.woId).slice(0, 3).join(', ')}.
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 1.5, minWidth: COLUMNS.length * 230, pb: 2 }}>
        {COLUMNS.map(col => {
          const c = LIFECYCLE_COLORS[col];
          const wos = byColumn[col];
          return (
            <Box key={col} sx={{ minWidth: 220, flex: '0 0 220px' }}>
              <Box sx={{
                p: 1.25, borderRadius: '8px 8px 0 0',
                bgcolor: c.bg, border: `1px solid color-mix(in srgb, ${c.color} 20%, transparent)`, borderBottom: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <Typography variant="caption" sx={{ fontWeight: 800, color: c.color, fontSize: '0.72rem' }}>
                  {c.label}
                </Typography>
                <Chip label={wos.length} size="small" sx={{ bgcolor: c.color + '22', color: c.color, fontWeight: 800, height: 20, fontSize: '0.68rem' }} />
              </Box>
              <Box sx={{
                minHeight: 200, p: 1, bgcolor: 'var(--planning-surface-muted)',
                border: `1px solid color-mix(in srgb, ${c.color} 13%, transparent)`, borderTop: 'none', borderRadius: '0 0 8px 8px',
              }}>
                {wos.map(wo => (
                  <WOCard key={wo.woId} wo={wo} onSelect={() => onSelectWO(wo)} />
                ))}
                {wos.length === 0 && (
                  <Typography variant="caption" sx={{ color: '#CBD5E1', textAlign: 'center', display: 'block', mt: 4 }}>No WOs</Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
