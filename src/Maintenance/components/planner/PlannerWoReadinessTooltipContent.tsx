import { Box, LinearProgress, Typography } from '@mui/material';
import { tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerWoReadinessBreakdown, PlannerWoReadinessStatus } from '../../ai/plannerWoReadiness';

type PlannerWoReadinessTooltipContentProps = {
  breakdown: PlannerWoReadinessBreakdown;
};

function getStatusColor(status: PlannerWoReadinessStatus) {
  switch (status) {
    case 'ready':
      return '#166534';
    case 'warning':
      return '#B45309';
    case 'blocked':
      return '#B91C1C';
    default:
      return tokenText.secondary;
  }
}

function ReadinessDimensionRow({
  dimension,
}: {
  dimension: PlannerWoReadinessBreakdown['materials'];
}) {
  return (
    <Box sx={{ display: 'grid', gap: 0.35 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75 }}>
        <Typography sx={{ color: tokenText.primary, fontSize: '0.68rem', fontWeight: 800 }}>
          {dimension.label}
        </Typography>
        <Typography sx={{ color: getStatusColor(dimension.status), fontSize: '0.68rem', fontWeight: 800 }}>
          {dimension.score}%
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={dimension.score}
        sx={{
          height: 5,
          borderRadius: 99,
          bgcolor: '#E2E8F0',
          '& .MuiLinearProgress-bar': {
            borderRadius: 99,
            bgcolor: getStatusColor(dimension.status),
          },
        }}
      />
      <Typography sx={{ color: tokenText.secondary, fontSize: '0.62rem', lineHeight: 1.4 }}>
        {dimension.detail}
      </Typography>
    </Box>
  );
}

export function PlannerWoReadinessTooltipContent({ breakdown }: PlannerWoReadinessTooltipContentProps) {
  return (
    <Box sx={{ p: 0.35, minWidth: 220, maxWidth: 280, display: 'grid', gap: 0.75 }}>
      <Box sx={{ pb: 0.55, borderBottom: `1px solid ${tokenDivider}` }}>
        <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 800 }}>
          WO readiness {breakdown.overallScore}%
        </Typography>
        <Typography sx={{ mt: 0.2, color: tokenText.secondary, fontSize: '0.62rem', lineHeight: 1.35 }}>
          Materials · Labor · Tooling
        </Typography>
      </Box>
      <ReadinessDimensionRow dimension={breakdown.materials} />
      <ReadinessDimensionRow dimension={breakdown.labor} />
      <ReadinessDimensionRow dimension={breakdown.tooling} />
    </Box>
  );
}
