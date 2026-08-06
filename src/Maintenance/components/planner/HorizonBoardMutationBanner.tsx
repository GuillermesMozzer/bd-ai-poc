import { Alert, Box, Chip } from '@mui/material';
import { tokenDivider } from '../../../workstation/theme';
import type { PlannerAiCascadeImpact } from '../../ai/types';

type HorizonBoardMutationBannerProps = {
  impact: PlannerAiCascadeImpact | null;
};

export function HorizonBoardMutationBanner({ impact }: HorizonBoardMutationBannerProps) {
  if (!impact) {
    return null;
  }

  return (
    <Box sx={{ mb: 1.1 }}>
      <Alert
        severity={impact.conflictIds.length ? 'warning' : 'success'}
        sx={{ border: `1px solid ${tokenDivider}`, alignItems: 'flex-start' }}
      >
        <Box sx={{ fontSize: '0.78rem', fontWeight: 800 }}>{impact.title}</Box>
        <Box sx={{ mt: 0.2, fontSize: '0.74rem', lineHeight: 1.45 }}>{impact.summary}</Box>
        <Box sx={{ mt: 0.65, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip size="small" label={impact.badgeLabel} sx={{ height: 22, borderRadius: 99, fontWeight: 700 }} />
          {impact.affectedWorkOrders.slice(0, 4).map((workOrder) => (
            <Chip
              key={workOrder}
              size="small"
              label={workOrder}
              variant="outlined"
              sx={{ height: 22, borderRadius: 99, fontWeight: 700 }}
            />
          ))}
        </Box>
      </Alert>
    </Box>
  );
}
