import React from 'react';
import {
  Box, TextField, InputAdornment, Select, MenuItem, FormControl, InputLabel,
  Chip, Button, Badge, Tooltip, Stack,
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Clear as ClearIcon, Bookmark as BookmarkIcon } from '@mui/icons-material';
import type { WOFilters, WOSavedView, WOLifecycleStatus, WOReadinessStatus, WORiskLevel } from '../types';

interface GlobalFiltersBarProps {
  filters: WOFilters;
  savedViews: WOSavedView[];
  onChange: (patch: Partial<WOFilters>) => void;
  onClear: () => void;
}

const LIFECYCLE_OPTIONS: WOLifecycleStatus[] = [
  'Draft', 'Planned', 'Scheduled', 'ReadyForRelease', 'Released', 'InExecution', 'OnHold', 'Completed', 'Closed', 'Cancelled',
];
const READINESS_OPTIONS: WOReadinessStatus[] = ['Ready', 'Warning', 'Blocked', 'NotApplicable'];
const RISK_OPTIONS: WORiskLevel[] = ['Low', 'Medium', 'High', 'Critical'];
const LINE_OPTIONS = ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'];
const SHIFT_OPTIONS = ['Morning', 'Afternoon', 'Night'];

function countActiveFilters(f: WOFilters) {
  let n = 0;
  if (f.search) n++;
  if (f.lifecycleStatus.length) n++;
  if (f.readinessStatus.length) n++;
  if (f.riskLevel.length) n++;
  if (f.line.length) n++;
  if (f.shift.length) n++;
  if (f.dateFrom) n++;
  if (f.dateTo) n++;
  if (f.showExceptionsOnly) n++;
  if (f.dataFreshness.length) n++;
  return n;
}

export default function GlobalFiltersBar({ filters, savedViews, onChange, onClear }: GlobalFiltersBarProps) {
  const activeCount = countActiveFilters(filters);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
      {/* Saved views row */}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <BookmarkIcon sx={{ fontSize: 16, color: 'var(--planning-text-secondary)' }} />
        {savedViews.map(sv => (
          <Chip
            key={sv.id}
            label={sv.label}
            size="small"
            variant={filters.savedView === sv.id ? 'filled' : 'outlined'}
            onClick={() => {
              if (filters.savedView === sv.id) {
                onChange({ savedView: '', ...sv.filters });
              } else {
                onChange({ savedView: sv.id, ...sv.filters });
              }
            }}
            sx={{
              fontWeight: 600,
              fontSize: '0.7rem',
              ...(filters.savedView === sv.id
                ? { bgcolor: 'var(--planning-text-primary)', color: 'white', border: '1px solid #1E293B' }
                : { color: '#475569' }),
            }}
          />
        ))}
      </Box>

      {/* Main filter row */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search WO ID, material, batch…"
          value={filters.search}
          onChange={e => onChange({ search: e.target.value })}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> }}
          sx={{ minWidth: 220, flex: 1, maxWidth: 320 }}
        />

        <FormControl size="small" sx={{ minWidth: 130 }}>
          <InputLabel>Status</InputLabel>
          <Select
            multiple
            label="Status"
            value={filters.lifecycleStatus}
            onChange={e => onChange({ lifecycleStatus: e.target.value as WOLifecycleStatus[] })}
            renderValue={v => `${(v as string[]).length} selected`}
          >
            {LIFECYCLE_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Readiness</InputLabel>
          <Select
            multiple
            label="Readiness"
            value={filters.readinessStatus}
            onChange={e => onChange({ readinessStatus: e.target.value as WOReadinessStatus[] })}
            renderValue={v => `${(v as string[]).length} selected`}
          >
            {READINESS_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Risk</InputLabel>
          <Select
            multiple
            label="Risk"
            value={filters.riskLevel}
            onChange={e => onChange({ riskLevel: e.target.value as WORiskLevel[] })}
            renderValue={v => `${(v as string[]).length} selected`}
          >
            {RISK_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Line</InputLabel>
          <Select
            multiple
            label="Line"
            value={filters.line}
            onChange={e => onChange({ line: e.target.value as string[] })}
            renderValue={v => `${(v as string[]).length} selected`}
          >
            {LINE_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 110 }}>
          <InputLabel>Shift</InputLabel>
          <Select
            multiple
            label="Shift"
            value={filters.shift}
            onChange={e => onChange({ shift: e.target.value as string[] })}
            renderValue={v => `${(v as string[]).length} selected`}
          >
            {SHIFT_OPTIONS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
          </Select>
        </FormControl>

        <TextField
          size="small"
          type="date"
          label="From"
          InputLabelProps={{ shrink: true }}
          value={filters.dateFrom}
          onChange={e => onChange({ dateFrom: e.target.value })}
          sx={{ width: 148 }}
        />
        <TextField
          size="small"
          type="date"
          label="To"
          InputLabelProps={{ shrink: true }}
          value={filters.dateTo}
          onChange={e => onChange({ dateTo: e.target.value })}
          sx={{ width: 148 }}
        />

        <Chip
          label="Exceptions only"
          size="small"
          variant={filters.showExceptionsOnly ? 'filled' : 'outlined'}
          onClick={() => onChange({ showExceptionsOnly: !filters.showExceptionsOnly })}
          sx={{
            fontWeight: 600,
            fontSize: '0.7rem',
            cursor: 'pointer',
            ...(filters.showExceptionsOnly ? { bgcolor: '#7C3AED', color: 'white' } : {}),
          }}
        />

        {activeCount > 0 && (
          <Tooltip title="Clear all filters">
            <Button
              size="small"
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={onClear}
              sx={{ borderColor: '#CBD5E1', color: '#475569', fontSize: '0.72rem' }}
            >
              Clear ({activeCount})
            </Button>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
