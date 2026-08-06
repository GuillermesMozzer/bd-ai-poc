import { AutoAwesome as SparkleIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { buildControlTowerPlannerWidgetSnapshot } from '../Maintenance/ai/buildControlTowerPlannerWidgetSnapshot';

function MetricTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Box
      sx={{
        minHeight: 68,
        px: 1,
        py: 0.85,
        borderRadius: '8px',
        bgcolor: '#364150',
        borderLeft: `3px solid ${accent}`,
      }}
    >
      <Typography sx={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>{value}</Typography>
      <Typography sx={{ mt: 0.45, fontSize: 9.8, color: '#DFE6F2', lineHeight: 1.2, fontWeight: 700 }}>{label}</Typography>
    </Box>
  );
}

export function ControlTowerMaintenancePlannerWidget() {
  const snapshot = useMemo(() => buildControlTowerPlannerWidgetSnapshot(), []);

  return (
    <Box sx={{ display: 'grid', gap: 0.85 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
        <SparkleIcon sx={{ color: '#F97316', fontSize: 16 }} />
        <Typography sx={{ fontSize: 11.5, fontWeight: 900, color: '#FFFFFF' }}>
          Maintenance planner · BLU.AI
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.65 }}>
        <MetricTile label="Plan health" value={`${snapshot.planHealthPct}%`} accent="#5AC85A" />
        <MetricTile label="AI recs pending" value={String(snapshot.aiRecommendationsPending)} accent="#5AA7FF" />
        <MetricTile label="Breakdown risk" value={String(snapshot.breakdownRiskScore)} accent="#E54C4C" />
        <MetricTile label="OEE projection" value={snapshot.oeeProjectionDelta} accent="#14A0EB" />
      </Box>

      <Box sx={{ px: 1.05, py: 0.9, borderRadius: '10px', bgcolor: '#202C3E', borderLeft: '3px solid #5AA7FF' }}>
        <Typography sx={{ fontSize: 10.2, color: '#DAE3F3', lineHeight: 1.45 }}>{snapshot.narrative}</Typography>
        <Typography sx={{ mt: 0.55, fontSize: 9.8, color: '#9FB0CB', lineHeight: 1.35 }}>
          Follow-up backlog: {snapshot.followUpBacklogCount} open · {snapshot.blockedByPartsCount} blocked by parts
          {snapshot.topRiskAsset ? ` · watch ${snapshot.topRiskAsset}` : ''}
        </Typography>
      </Box>
    </Box>
  );
}
