import React, { useMemo, useState } from 'react';
import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Alert, Chip, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
} from '@mui/material';
import { AutoAwesome as SparkleIcon, Search as SearchIcon } from '@mui/icons-material';
import type { WorkOrder, WOAuditEvent, WOAuditEventType } from '../types';

interface HistoryViewProps {
  workOrders: WorkOrder[];
}

const EVENT_TYPE_OPTIONS: WOAuditEventType[] = [
  'Created', 'StatusChanged', 'FieldUpdated', 'ReadinessCalculated', 'ExceptionAdded',
  'ExceptionResolved', 'CommentAdded', 'OwnerAssigned', 'DataRefreshed',
  'AIRecommendationAccepted', 'AIRecommendationRejected', 'OverrideApplied', 'ActionExecuted',
];

const EVENT_TYPE_COLOR: Partial<Record<WOAuditEventType, { bg: string; color: string }>> = {
  StatusChanged:              { bg: '#EFF6FF', color: '#2563EB' },
  AIRecommendationAccepted:   { bg: '#ECFDF5', color: '#059669' },
  AIRecommendationRejected:   { bg: '#FEF2F2', color: '#DC2626' },
  ExceptionAdded:             { bg: '#FFF7ED', color: '#EA580C' },
  ExceptionResolved:          { bg: '#ECFDF5', color: '#047857' },
  OverrideApplied:            { bg: '#F5F3FF', color: '#7C3AED' },
  ActionExecuted:             { bg: '#F0F9FF', color: '#0369A1' },
};

export default function HistoryView({ workOrders }: HistoryViewProps) {
  const [search, setSearch] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('');

  const allEvents = useMemo<Array<WOAuditEvent & { woInfo: WorkOrder }>>(() => {
    const result: Array<WOAuditEvent & { woInfo: WorkOrder }> = [];
    workOrders.forEach(wo => {
      wo.auditEvents.forEach(ev => result.push({ ...ev, woInfo: wo }));
    });
    return result.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [workOrders]);

  const filtered = useMemo(() => {
    return allEvents.filter(ev => {
      if (search && !ev.woId.toLowerCase().includes(search.toLowerCase()) && !ev.changedBy.toLowerCase().includes(search.toLowerCase())) return false;
      if (eventTypeFilter && ev.eventType !== eventTypeFilter) return false;
      if (sourceFilter && ev.source !== sourceFilter) return false;
      return true;
    });
  }, [allEvents, search, eventTypeFilter, sourceFilter]);

  const aiEvents = allEvents.filter(ev => ev.eventType === 'AIRecommendationAccepted' || ev.eventType === 'AIRecommendationRejected');
  const aiAccepted = aiEvents.filter(ev => ev.eventType === 'AIRecommendationAccepted').length;
  const statusChanges = allEvents.filter(ev => ev.eventType === 'StatusChanged');
  const blockerChanges = statusChanges.filter(ev => ev.newValue === 'OnHold').length;

  return (
    <Box>
      {/* AI Summary Banner */}
      <Alert severity="info" icon={<SparkleIcon />} sx={{ mb: 2, borderRadius: 2, fontSize: '0.82rem' }}>
        <strong>AI Pattern Summary:</strong> {aiEvents.length} AI recommendations generated — {aiAccepted} accepted ({aiEvents.length > 0 ? Math.round((aiAccepted / aiEvents.length) * 100) : 0}% acceptance rate).
        {blockerChanges > 0 && ` ${blockerChanges} WOs moved to On Hold — review for common root causes.`}
        {' '}Most active source: ERP ({allEvents.filter(e => e.source === 'ERP').length} events).
      </Alert>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search WO ID or user…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
          sx={{ minWidth: 200 }}
        />
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Event Type</InputLabel>
          <Select label="Event Type" value={eventTypeFilter} onChange={e => setEventTypeFilter(e.target.value as string)}>
            <MenuItem value="">All types</MenuItem>
            {EVENT_TYPE_OPTIONS.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Source</InputLabel>
          <Select label="Source" value={sourceFilter} onChange={e => setSourceFilter(e.target.value as string)}>
            <MenuItem value="">All sources</MenuItem>
            {['ERP', 'MES', 'ReadinessEngine', 'AICopilot', 'ManualUserAction', 'Quality', 'Warehouse'].map(s => (
              <MenuItem key={s} value={s}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {['Timestamp', 'WO ID', 'Event Type', 'Field', 'Previous', 'New Value', 'By', 'Source', 'Note'].map(h => (
                <TableCell key={h} sx={{ fontWeight: 700, fontSize: '0.68rem', color: '#475569', bgcolor: 'var(--planning-surface-muted)', py: 0.75 }}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.slice(0, 100).map(ev => {
              const colors = EVENT_TYPE_COLOR[ev.eventType] || { bg: '#F8FAFC', color: '#475569' };
              const isAI = ev.eventType === 'AIRecommendationAccepted' || ev.eventType === 'AIRecommendationRejected';
              return (
                <TableRow key={ev.id} sx={{ bgcolor: isAI ? '#FAFAFE' : 'transparent', '&:hover': { bgcolor: 'var(--planning-surface-muted)' } }}>
                  <TableCell sx={{ py: 0.75, fontSize: '0.7rem', color: 'var(--planning-text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(ev.timestamp).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </TableCell>
                  <TableCell sx={{ py: 0.75 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#1E40AF' }}>{ev.woId}</Typography>
                  </TableCell>
                  <TableCell sx={{ py: 0.75 }}>
                    <Chip
                      label={ev.eventType}
                      size="small"
                      icon={isAI ? <SparkleIcon sx={{ fontSize: '14px !important' }} /> : undefined}
                      sx={{ bgcolor: colors.bg, color: colors.color, fontWeight: 700, fontSize: '0.62rem' }}
                    />
                  </TableCell>
                  <TableCell sx={{ py: 0.75, fontSize: '0.7rem', color: '#475569' }}>{ev.field || '—'}</TableCell>
                  <TableCell sx={{ py: 0.75, fontSize: '0.7rem', color: '#DC2626' }}>{ev.previousValue || '—'}</TableCell>
                  <TableCell sx={{ py: 0.75, fontSize: '0.7rem', color: '#059669', fontWeight: ev.newValue ? 600 : 400 }}>{ev.newValue || '—'}</TableCell>
                  <TableCell sx={{ py: 0.75, fontSize: '0.7rem' }}>{ev.changedBy}</TableCell>
                  <TableCell sx={{ py: 0.75 }}>
                    <Chip label={ev.source} size="small" sx={{ bgcolor: 'var(--planning-surface-muted)', color: '#475569', fontSize: '0.62rem' }} />
                  </TableCell>
                  <TableCell sx={{ py: 0.75, fontSize: '0.68rem', color: 'var(--planning-text-secondary)', maxWidth: 200 }}>
                    {ev.comment || ev.reasonCode || '—'}
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} sx={{ textAlign: 'center', py: 5, color: 'var(--planning-text-muted)' }}>No events match the current filters.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
      <Typography variant="caption" sx={{ color: 'var(--planning-text-muted)', display: 'block', mt: 1, textAlign: 'right' }}>
        Showing {Math.min(filtered.length, 100)} of {filtered.length} events
      </Typography>
    </Box>
  );
}
