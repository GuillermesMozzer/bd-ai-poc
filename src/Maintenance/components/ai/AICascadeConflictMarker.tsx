import { Box, Chip, Typography } from '@mui/material';
import type { PlannerAiHorizonProjection } from '../../ai/types';

type AICascadeConflictMarkerProps = {
  projections: PlannerAiHorizonProjection[];
  label: string;
};

export function AICascadeConflictMarker({ projections, label }: AICascadeConflictMarkerProps) {
  const projection = projections.find((item) => item.horizon === mapSurfaceLabelToHorizon(label));
  if (!projection || (!projection.conflictCount && !projection.hasBlocker)) {
    return null;
  }

  return (
    <Chip
      size="small"
      label={projection.hasBlocker ? `⚠ ${projection.conflictCount} blocker` : `⚡ ${projection.conflictCount}`}
      sx={{
        ml: 0.6,
        height: 20,
        fontSize: '0.62rem',
        fontWeight: 800,
        bgcolor: projection.hasBlocker ? '#FEF2F2' : '#FFF7ED',
        color: projection.hasBlocker ? '#B91C1C' : '#C2410C',
      }}
    />
  );
}

function mapSurfaceLabelToHorizon(label: string): PlannerAiHorizonProjection['horizon'] {
  switch (label.toLowerCase()) {
    case 'monthly':
      return 'monthly';
    case 'quarterly':
      return 'quarterly';
    case 'annual':
      return 'annual';
    default:
      return 'weekly';
  }
}

export function AICascadeConflictMarkerList({ projections }: { projections: PlannerAiHorizonProjection[] }) {
  if (!projections.some((item) => item.conflictCount > 0)) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {projections
        .filter((item) => item.conflictCount > 0)
        .map((item) => (
          <Chip
            key={item.horizon}
            size="small"
            label={`${item.horizon}: ${item.badgeLabel}`}
            sx={{ height: 22, fontSize: '0.66rem', fontWeight: 800, textTransform: 'capitalize' }}
          />
        ))}
    </Box>
  );
}
