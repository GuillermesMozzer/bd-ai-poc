import {Box, Chip, Stack, Typography} from '@mui/material';
import type {MpsHealthSummary, MrpReadiness} from '../types';

type Props = {
  health: MpsHealthSummary;
  mrpReadiness: MrpReadiness;
};

export default function MpsHealthSummaryPanel({health, mrpReadiness}: Props) {
  return (
    <Box sx={{mt: 2}}>
      <Typography sx={{fontSize: 13, fontWeight: 700, color: 'var(--planning-text-primary)', mb: 1.2}}>MPS Health Summary</Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 1.2}}>
        <SummaryCard label="Total Approved Demand" value={health.totalApprovedDemand.toLocaleString()} accent="#6D28D9" />
        <SummaryCard label="Total Planned" value={health.totalPlannedQuantity.toLocaleString()} accent="#0369A1" />
        <SummaryCard label="Remaining Unplanned" value={health.remainingUnplanned.toLocaleString()} accent={health.remainingUnplanned > 0 ? '#B54708' : '#027A48'} />
        <SummaryCard label="Overplanned" value={health.overplannedQuantity.toLocaleString()} accent={health.overplannedQuantity > 0 ? '#B42318' : '#027A48'} />
        <SummaryCard label="Avg Utilization" value={`${health.avgUtilization}%`} accent="#0369A1" />
        <SummaryCard label="Highest Utilization" value={`${health.highestUtilizationPercent}%`} sub={health.highestUtilizationLabel} accent={health.highestUtilizationPercent > 100 ? '#B42318' : health.highestUtilizationPercent >= 90 ? '#B54708' : '#0369A1'} />
        <SummaryCard label="Feasible" value={String(health.feasibleCount)} accent="#027A48" />
        <SummaryCard label="At Risk" value={String(health.atRiskCount)} accent="#B54708" />
        <SummaryCard label="Overloaded" value={String(health.overloadedCount)} accent={health.overloadedCount > 0 ? '#B42318' : '#027A48'} />
        <SummaryCard label="Stock Risk" value={String(health.stockRiskCount)} accent={health.stockRiskCount > 0 ? '#B54708' : '#027A48'} />
        <SummaryCard label="Missing Data" value={String(health.missingDataCount)} accent={health.missingDataCount > 0 ? '#B42318' : '#027A48'} />
        <SummaryCard label="Requires Decision" value={String(health.requiresDecisionCount)} accent={health.requiresDecisionCount > 0 ? '#6D28D9' : '#027A48'} />
        <SummaryCard label="Frozen Edits" value={String(health.frozenPeriodEditsCount)} accent={health.frozenPeriodEditsCount > 0 ? '#1D4ED8' : '#027A48'} />
        <Box sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, p: 1.2, display: 'flex', flexDirection: 'column', gap: 0.6}}>
          <Typography sx={{fontSize: 10, fontWeight: 700, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>MRP Readiness</Typography>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip
              label={mrpReadiness.isReady ? 'Ready for MRP' : 'Not Ready'}
              size="small"
              sx={{fontWeight: 700, fontSize: 11, bgcolor: mrpReadiness.isReady ? '#ECFDF3' : '#FEF3F2', color: mrpReadiness.isReady ? '#027A48' : '#B42318', border: `1px solid ${mrpReadiness.isReady ? '#ABEFC6' : '#FECDCA'}`, borderRadius: 1.5}}
            />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

function SummaryCard({label, value, sub, accent}: {label: string; value: string; sub?: string; accent: string}) {
  return (
    <Box sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, p: 1.2, borderLeft: `3px solid ${accent}`, bgcolor: '#FAFAFA'}}>
      <Typography sx={{fontSize: 10, fontWeight: 700, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em'}}>{label}</Typography>
      <Typography sx={{fontSize: 20, fontWeight: 900, color: accent, lineHeight: 1.2, mt: 0.3}}>{value}</Typography>
      {sub && <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)', mt: 0.2}}>{sub}</Typography>}
    </Box>
  );
}
