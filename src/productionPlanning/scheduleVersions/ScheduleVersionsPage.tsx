import {useMemo, useState} from 'react';
import {Box, MenuItem, Paper, Stack, TextField, Typography} from '@mui/material';
import type {ScheduleVersion, ScheduleVersionCycleGroup, ScheduleVersionFiltersState} from './types';
import {
  buildScheduleVersionKpis,
  defaultScheduleFilters,
  scheduleCycleOptions,
  scheduleVersions,
} from './mock';
import ScheduleVersionKpiCards from './components/ScheduleVersionKpiCards';
import ScheduleVersionTable from './components/ScheduleVersionTable';
import ScheduleAiSearch, {parseScheduleAiQuery} from './components/ScheduleAiSearch';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

const ALL_CYCLE_IDS = [...new Set(scheduleVersions.map((v) => v.cycleId))];

interface ScheduleVersionsPageProps {
  onVersionSelect?: (version: ScheduleVersion) => void;
}

export default function ScheduleVersionsPage({onVersionSelect}: ScheduleVersionsPageProps = {}) {
  const [filters, setFilters] = useState<ScheduleVersionFiltersState>(defaultScheduleFilters);
  const [aiQuery, setAiQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(ALL_CYCLE_IDS));

  const kpis = useMemo(() => buildScheduleVersionKpis(scheduleVersions), []);

  const aiFilter = useMemo(() => parseScheduleAiQuery(aiQuery), [aiQuery]);

  const filteredVersions = useMemo(() => {
    return scheduleVersions.filter((v) => {
      if (!aiFilter.apply(v)) return false;
      if (filters.cycleId && v.cycleId !== filters.cycleId) return false;
      if (filters.status && v.status !== filters.status) return false;
      if (filters.approvalStatus && v.approvalStatus !== filters.approvalStatus) return false;
      if (filters.validationStatus && v.validationStatus !== filters.validationStatus) return false;
      if (filters.linkedMpsVersionId && !v.linkedMpsVersionId.toLowerCase().includes(filters.linkedMpsVersionId.toLowerCase())) return false;
      if (filters.dateFrom && v.createdAt < filters.dateFrom) return false;
      if (filters.dateTo && v.createdAt > filters.dateTo + 'T23:59:59') return false;
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (
          !v.id.toLowerCase().includes(s) &&
          !v.scheduleVersionCode.toLowerCase().includes(s) &&
          !v.scheduleNumber.toLowerCase().includes(s) &&
          !v.planningCycle.toLowerCase().includes(s) &&
          !v.createdBy.toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [filters, aiFilter]);

  const cycleGroups = useMemo<ScheduleVersionCycleGroup[]>(() => {
    const groupMap = new Map<string, ScheduleVersionCycleGroup>();
    for (const v of filteredVersions) {
      if (!groupMap.has(v.cycleId)) {
        groupMap.set(v.cycleId, {cycleId: v.cycleId, cycleLabel: v.planningCycle, versions: []});
      }
      groupMap.get(v.cycleId)!.versions.push(v);
    }
    return scheduleCycleOptions
      .map((opt) => groupMap.get(opt.id))
      .filter((g): g is ScheduleVersionCycleGroup => g !== undefined);
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

  function setFilter<K extends keyof ScheduleVersionFiltersState>(key: K, value: ScheduleVersionFiltersState[K]) {
    setFilters((prev) => ({...prev, [key]: value}));
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'var(--planning-background)', p: 3, minHeight: '100%'}}>

      {/* Page header */}
      <Box>
        <Typography sx={{fontSize: 22, fontWeight: 900, color: 'var(--planning-text-primary)', lineHeight: 1.2}}>
          Schedule Version Control
        </Typography>
        <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', mt: 0.5}}>
          Select a schedule version to review the execution plan, traceability to MPS and MRP, and scheduling items.
        </Typography>
      </Box>

      {/* KPI cards */}
      <ScheduleVersionKpiCards cards={kpis} />

      {/* AI Search */}
      <ScheduleAiSearch
        value={aiQuery}
        onChange={setAiQuery}
        resultCount={filteredVersions.length}
        totalCount={scheduleVersions.length}
      />

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
            {scheduleCycleOptions.map((opt) => (
              <MenuItem key={opt.id} value={opt.id}>{opt.label}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Status"
            size="small"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            sx={{minWidth: 150}}
          >
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Published">Published</MenuItem>
            <MenuItem value="Frozen">Frozen</MenuItem>
            <MenuItem value="Superseded">Superseded</MenuItem>
            <MenuItem value="Simulation">Simulation</MenuItem>
          </TextField>

          <TextField
            select
            label="Approval"
            size="small"
            value={filters.approvalStatus}
            onChange={(e) => setFilter('approvalStatus', e.target.value)}
            sx={{minWidth: 170}}
          >
            <MenuItem value="">All approvals</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Pending Approval">Pending Approval</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </TextField>

          <TextField
            select
            label="Validation"
            size="small"
            value={filters.validationStatus}
            onChange={(e) => setFilter('validationStatus', e.target.value)}
            sx={{minWidth: 160}}
          >
            <MenuItem value="">All validations</MenuItem>
            <MenuItem value="Not Validated">Not Validated</MenuItem>
            <MenuItem value="Valid">Valid</MenuItem>
            <MenuItem value="Warning">Warning</MenuItem>
            <MenuItem value="Blocked">Blocked</MenuItem>
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
      <ScheduleVersionTable
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
