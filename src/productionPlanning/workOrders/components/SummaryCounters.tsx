import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { WOSummary, WOFilters } from '../types';
import { planningTokens } from '../../ui/planningTheme';

interface SummaryCountersProps {
  summary: WOSummary;
  filters: WOFilters;
  onFilterChange: (patch: Partial<WOFilters>) => void;
}

const COUNTERS = [
  { key: 'total',          label: 'Total',         color: planningTokens.textPrimary,  bg: planningTokens.surface,        border: planningTokens.border, filterKey: null },
  { key: 'inExecution',    label: 'In Execution',  color: '#92400E',                   bg: '#FFFBEB',                     border: '#FDE68A',             filterKey: 'InExecution' },
  { key: 'released',       label: 'Released',      color: planningTokens.success,      bg: '#ECFDF5',                     border: '#A7F3D0',             filterKey: 'Released' },
  { key: 'scheduled',      label: 'Scheduled',     color: '#0369A1',                   bg: '#F0F9FF',                     border: '#BAE6FD',             filterKey: 'Scheduled' },
  { key: 'planned',        label: 'Planned',       color: planningTokens.primaryBlue,  bg: '#EFF6FF',                     border: '#BFDBFE',             filterKey: 'Planned' },
  { key: 'onHold',         label: 'On Hold',       color: planningTokens.warning,      bg: '#FFF7ED',                     border: '#FED7AA',             filterKey: 'OnHold' },
  { key: 'blocked',        label: 'Blocked',       color: planningTokens.danger,       bg: '#FEF2F2',                     border: '#FECACA',             filterKey: null },
  { key: 'critical',       label: 'Critical Risk', color: '#991B1B',                   bg: '#FEF2F2',                     border: '#FECACA',             filterKey: null },
  { key: 'withExceptions', label: 'Exceptions',    color: '#7C3AED',                   bg: '#F5F3FF',                     border: '#DDD6FE',             filterKey: null },
  { key: 'staleData',      label: 'Stale Data',    color: planningTokens.textSecondary, bg: '#F8FAFC',                    border: planningTokens.border, filterKey: null },
] as const;

export default function SummaryCounters({ summary, filters, onFilterChange }: SummaryCountersProps) {
  const handleClick = (counter: typeof COUNTERS[number]) => {
    if (counter.key === 'total') {
      onFilterChange({ lifecycleStatus: [], readinessStatus: [], riskLevel: [], showExceptionsOnly: false });
      return;
    }
    if (counter.key === 'blocked') {
      onFilterChange({ readinessStatus: ['Blocked'] });
      return;
    }
    if (counter.key === 'critical') {
      onFilterChange({ riskLevel: ['Critical'] });
      return;
    }
    if (counter.key === 'withExceptions') {
      onFilterChange({ showExceptionsOnly: true });
      return;
    }
    if (counter.key === 'staleData') {
      onFilterChange({ dataFreshness: ['Stale', 'VeryStale'] });
      return;
    }
    if (counter.filterKey) {
      onFilterChange({ lifecycleStatus: [counter.filterKey as any] });
    }
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(10, minmax(0, 1fr))', gap: 1, mb: 2 }}>
      {COUNTERS.map(c => {
        const count = summary[c.key as keyof WOSummary] as number;
        return (
          <Paper
            key={c.key}
            elevation={0}
            onClick={() => handleClick(c)}
            sx={{
              p: 1.2,
              borderRadius: 2,
              border: `1px solid ${c.border}`,
              bgcolor: c.bg,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.3,
              transition: 'transform 0.12s, box-shadow 0.12s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${c.border}` },
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: planningTokens.textSecondary, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {c.label}
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 900, color: c.color, lineHeight: 1.1 }}>
              {count}
            </Typography>
          </Paper>
        );
      })}
    </Box>
  );
}
