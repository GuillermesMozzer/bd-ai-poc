import {useMemo, useState} from 'react';
import {Box, MenuItem, Paper, Stack, TextField, Typography} from '@mui/material';
import type {MrpVersion, MrpVersionCycleGroup, MrpVersionFiltersState} from './types';
import {
  buildMrpVersionKpis,
  defaultMrpVersionFilters,
  mrpCycleOptions,
  mrpVersions,
} from './mock';
import MrpVersionKpiCards from './components/MrpVersionKpiCards';
import MrpVersionTable from './components/MrpVersionTable';
import MrpAiSearch, {parseMrpAiQuery} from './components/MrpAiSearch';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

const ALL_CYCLE_IDS = [...new Set(mrpVersions.map((v) => v.cycleId))];

const MPS_PARENT_OPTIONS = [...new Set(mrpVersions.map((v) => v.parentMpsVersionId))].sort();

interface MrpVersionsPageProps {
  onVersionSelect?: (version: MrpVersion) => void;
}

export default function MrpVersionsPage({onVersionSelect}: MrpVersionsPageProps = {}) {
  const [filters, setFilters] = useState<MrpVersionFiltersState>(defaultMrpVersionFilters);
  const [aiQuery, setAiQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(ALL_CYCLE_IDS));

  const kpis = useMemo(() => buildMrpVersionKpis(mrpVersions), []);

  const aiFilter = useMemo(() => parseMrpAiQuery(aiQuery), [aiQuery]);

  const filteredVersions = useMemo(() => {
    return mrpVersions.filter((v) => {
      if (!aiFilter.apply(v)) return false;
      if (filters.cycleId && v.cycleId !== filters.cycleId) return false;
      if (filters.approvalStatus && v.approvalStatus !== filters.approvalStatus) return false;
      if (filters.mrpType && v.mrpType !== filters.mrpType) return false;
      if (filters.isBaseline === 'true' && !v.isApprovedBaseline) return false;
      if (filters.isBaseline === 'false' && v.isApprovedBaseline) return false;
      if (filters.parentMpsVersionId && v.parentMpsVersionId !== filters.parentMpsVersionId) return false;
      if (filters.dateFrom && v.generatedAt < filters.dateFrom) return false;
      if (filters.dateTo && v.generatedAt > filters.dateTo + 'T23:59:59') return false;
      return true;
    });
  }, [filters, aiFilter]);

  const cycleGroups = useMemo<MrpVersionCycleGroup[]>(() => {
    const groupMap = new Map<string, MrpVersionCycleGroup>();
    for (const v of filteredVersions) {
      if (!groupMap.has(v.cycleId)) {
        groupMap.set(v.cycleId, {cycleId: v.cycleId, cycleLabel: v.planningCycle, versions: []});
      }
      groupMap.get(v.cycleId)!.versions.push(v);
    }
    return mrpCycleOptions
      .map((opt) => groupMap.get(opt.id))
      .filter((g): g is MrpVersionCycleGroup => g !== undefined);
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

  function setFilter<K extends keyof MrpVersionFiltersState>(key: K, value: MrpVersionFiltersState[K]) {
    setFilters((prev) => ({...prev, [key]: value}));
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'var(--planning-background)', p: 3, minHeight: '100%'}}>

      {/* Page header */}
      <Box>
        <Typography sx={{fontSize: 22, fontWeight: 900, color: 'var(--planning-text-primary)', lineHeight: 1.2}}>
          MRP Baseline Control
        </Typography>
        <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', mt: 0.5}}>
          Select an MRP version to review material requirements planning for the planning cycle.
        </Typography>
      </Box>

      {/* KPI cards */}
      <MrpVersionKpiCards cards={kpis} />

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
            {mrpCycleOptions.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="MRP Type"
            size="small"
            value={filters.mrpType}
            onChange={(e) => setFilter('mrpType', e.target.value)}
            sx={{minWidth: 160}}
          >
            <MenuItem value="">All types</MenuItem>
            <MenuItem value="Official">Official</MenuItem>
            <MenuItem value="Simulation">Simulation</MenuItem>
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
            sx={{minWidth: 160}}
          >
            <MenuItem value="">All versions</MenuItem>
            <MenuItem value="true">Baseline only</MenuItem>
            <MenuItem value="false">Non-baseline</MenuItem>
          </TextField>

          <TextField
            select
            label="Parent MPS"
            size="small"
            value={filters.parentMpsVersionId}
            onChange={(e) => setFilter('parentMpsVersionId', e.target.value)}
            sx={{minWidth: 190}}
          >
            <MenuItem value="">All MPS versions</MenuItem>
            {MPS_PARENT_OPTIONS.map((id) => (
              <MenuItem key={id} value={id}>{id}</MenuItem>
            ))}
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
      <MrpVersionTable
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
