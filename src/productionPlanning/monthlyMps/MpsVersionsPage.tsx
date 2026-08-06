import {useMemo, useState} from 'react';
import {Box, MenuItem, Paper, Stack, TextField, Typography} from '@mui/material';
import type {MpsVersion, MpsVersionCycleGroup, MpsVersionFiltersState} from './types';
import {
  buildMpsVersionKpis,
  defaultMpsVersionFilters,
  mpsCycleOptions,
  mpsVersions,
} from './mock';
import MpsVersionKpiCards from './components/MpsVersionKpiCards';
import MpsVersionTable from './components/MpsVersionTable';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

const ALL_CYCLE_IDS = [...new Set(mpsVersions.map((v) => v.cycleId))];

interface MpsVersionsPageProps {
  onVersionSelect?: (version: MpsVersion) => void;
}

export default function MpsVersionsPage({onVersionSelect}: MpsVersionsPageProps = {}) {
  const [filters, setFilters] = useState<MpsVersionFiltersState>(defaultMpsVersionFilters);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(ALL_CYCLE_IDS));

  const kpis = useMemo(() => buildMpsVersionKpis(mpsVersions), []);

  const filteredVersions = useMemo(() => {
    return mpsVersions.filter((v) => {
      if (filters.cycleId && v.cycleId !== filters.cycleId) return false;
      if (filters.approvalStatus && v.approvalStatus !== filters.approvalStatus) return false;
      if (filters.isBaseline === 'true' && !v.isApprovedBaseline) return false;
      if (filters.isBaseline === 'false' && v.isApprovedBaseline) return false;
      if (filters.dateFrom && v.importedAt < filters.dateFrom) return false;
      if (filters.dateTo && v.importedAt > filters.dateTo + 'T23:59:59') return false;
      return true;
    });
  }, [filters]);

  const cycleGroups = useMemo<MpsVersionCycleGroup[]>(() => {
    const groupMap = new Map<string, MpsVersionCycleGroup>();
    for (const v of filteredVersions) {
      if (!groupMap.has(v.cycleId)) {
        groupMap.set(v.cycleId, {cycleId: v.cycleId, cycleLabel: v.planningCycle, versions: []});
      }
      groupMap.get(v.cycleId)!.versions.push(v);
    }
    return mpsCycleOptions
      .map((opt) => groupMap.get(opt.id))
      .filter((g): g is MpsVersionCycleGroup => g !== undefined);
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

  function setFilter<K extends keyof MpsVersionFiltersState>(key: K, value: MpsVersionFiltersState[K]) {
    setFilters((prev) => ({...prev, [key]: value}));
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'var(--planning-background)', p: 3, minHeight: '100%'}}>

      {/* Page header */}
      <Box>
        <Typography sx={{fontSize: 22, fontWeight: 900, color: 'var(--planning-text-primary)', lineHeight: 1.2}}>
          MPS Baseline Control
        </Typography>
        <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', mt: 0.5}}>
          Select an MPS version to review the master production schedule for the planning cycle.
        </Typography>
      </Box>

      {/* KPI cards */}
      <MpsVersionKpiCards cards={kpis} />

      {/* Filter bar */}
      <Paper elevation={0} sx={{...moduleCardSx, p: 1.5}}>
        <Stack direction="row" flexWrap="wrap" gap={1.5} alignItems="center">
          <TextField
            select
            label="Cycle"
            size="small"
            value={filters.cycleId}
            onChange={(e) => setFilter('cycleId', e.target.value)}
            sx={{minWidth: 220}}
          >
            <MenuItem value="">All cycles</MenuItem>
            {mpsCycleOptions.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
            ))}
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
            select
            label="Baseline"
            size="small"
            value={filters.isBaseline}
            onChange={(e) => setFilter('isBaseline', e.target.value)}
            sx={{minWidth: 170}}
          >
            <MenuItem value="">All versions</MenuItem>
            <MenuItem value="true">Baseline only</MenuItem>
            <MenuItem value="false">Non-baseline</MenuItem>
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
      <MpsVersionTable
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
