import {useMemo, useState} from 'react';
import {Box, MenuItem, Paper, Stack, TextField, Typography} from '@mui/material';
import type {CycleGroup, ForecastFiltersState, ForecastVersion} from './types';
import {
  buildForecastKpis,
  defaultForecastFilters,
  forecastCycleOptions,
  forecastVersions,
} from './mock';
import ForecastKpiCards from './components/ForecastKpiCards';
import ForecastVersionTable from './components/ForecastVersionTable';
import ForecastAiSearch, {parseAiQuery} from './components/ForecastAiSearch';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

const ALL_CYCLE_IDS = [...new Set(forecastVersions.map((v) => v.cycleId))];

interface DemandForecastPageProps {
  onVersionSelect?: (version: ForecastVersion) => void;
}

export default function DemandForecastPage({onVersionSelect}: DemandForecastPageProps = {}) {
  const [filters, setFilters] = useState<ForecastFiltersState>(defaultForecastFilters);
  const [aiQuery, setAiQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(ALL_CYCLE_IDS));

  const kpis = useMemo(() => buildForecastKpis(forecastVersions), []);

  const aiFilter = useMemo(() => parseAiQuery(aiQuery), [aiQuery]);

  const filteredVersions = useMemo(() => {
    return forecastVersions.filter((v) => {
      if (!aiFilter.apply(v)) return false;
      if (filters.cycleId && v.cycleId !== filters.cycleId) return false;
      if (filters.versionType && v.versionType !== filters.versionType) return false;
      if (filters.approvalStatus && v.approvalStatus !== filters.approvalStatus) return false;
      if (filters.dateFrom && v.importedAt < filters.dateFrom) return false;
      if (filters.dateTo && v.importedAt > filters.dateTo + 'T23:59:59') return false;
      return true;
    });
  }, [filters, aiFilter]);

  const cycleGroups = useMemo<CycleGroup[]>(() => {
    const groupMap = new Map<string, CycleGroup>();
    for (const v of filteredVersions) {
      if (!groupMap.has(v.cycleId)) {
        groupMap.set(v.cycleId, {cycleId: v.cycleId, cycleLabel: v.cycleLabel, versions: []});
      }
      groupMap.get(v.cycleId)!.versions.push(v);
    }
    return forecastCycleOptions
      .map((opt) => groupMap.get(opt.id))
      .filter((g): g is CycleGroup => g !== undefined);
  }, [filteredVersions]);

  function handleToggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function handleToggleGroup(cycleId: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(cycleId)) next.delete(cycleId);
      else next.add(cycleId);
      return next;
    });
  }

  function setFilter<K extends keyof ForecastFiltersState>(key: K, value: ForecastFiltersState[K]) {
    setFilters((prev) => ({...prev, [key]: value}));
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'var(--planning-background)', p: 3, minHeight: '100%'}}>

      {/* Page header */}
      <Box>
        <Typography sx={{fontSize: 22, fontWeight: 900, color: 'var(--planning-text-primary)', lineHeight: 1.2}}>
          Demand Forecast
        </Typography>
        <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', mt: 0.5}}>
          Select a forecast version to analyze rolling 12-month demand, feasibility, and site commitments.
        </Typography>
      </Box>

      {/* KPI cards */}
      <ForecastKpiCards cards={kpis} />

      {/* Filter bar */}
      <Paper elevation={0} sx={{...moduleCardSx, p: 1.5}}>
        <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
          <TextField
            select
            label="Cycle"
            size="small"
            value={filters.cycleId}
            onChange={(e) => setFilter('cycleId', e.target.value)}
            sx={{minWidth: 200}}
          >
            <MenuItem value="">All cycles</MenuItem>
            {forecastCycleOptions.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Version Type"
            size="small"
            value={filters.versionType}
            onChange={(e) => setFilter('versionType', e.target.value)}
            sx={{minWidth: 150}}
          >
            <MenuItem value="">All types</MenuItem>
            <MenuItem value="Baseline">Baseline</MenuItem>
            <MenuItem value="Revised">Revised</MenuItem>
          </TextField>

          <TextField
            select
            label="Approval Status"
            size="small"
            value={filters.approvalStatus}
            onChange={(e) => setFilter('approvalStatus', e.target.value)}
            sx={{minWidth: 170}}
          >
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Pending Approval">Pending Approval</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>

          <TextField
            label="From"
            type="date"
            size="small"
            value={filters.dateFrom}
            onChange={(e) => setFilter('dateFrom', e.target.value)}
            InputLabelProps={{shrink: true}}
            sx={{minWidth: 150}}
          />

          <TextField
            label="To"
            type="date"
            size="small"
            value={filters.dateTo}
            onChange={(e) => setFilter('dateTo', e.target.value)}
            InputLabelProps={{shrink: true}}
            sx={{minWidth: 150}}
          />
        </Stack>
      </Paper>

      {/* Version table */}
      <ForecastVersionTable
        groups={cycleGroups}
        expandedId={expandedId}
        expandedGroups={expandedGroups}
        onRowClick={onVersionSelect}
        onToggleExpand={handleToggleExpand}
        onToggleGroup={handleToggleGroup}
      />

    </Box>
  );
}
