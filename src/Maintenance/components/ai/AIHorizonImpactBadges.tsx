import { Box, Chip, Paper, Typography } from '@mui/material';
import { tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiCascadeImpact } from '../../ai/types';

type AIHorizonImpactBadgesProps = {
  impacts: PlannerAiCascadeImpact[];
  activeHorizon: PlannerAiCascadeImpact['horizon'];
};

export function AIHorizonImpactBadges({ impacts, activeHorizon }: AIHorizonImpactBadgesProps) {
  if (!impacts.length) {
    return null;
  }

  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.2 }}>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.77rem', fontWeight: 800 }}>
        Propagated AI impact
      </Typography>
      <Box sx={{ mt: 0.8, display: 'flex', gap: 0.65, flexWrap: 'wrap' }}>
        {impacts.map((impact) => (
          <Chip
            key={impact.horizon}
            size="small"
            label={`${impact.horizon}: ${impact.badgeLabel}`}
            sx={{
              height: 24,
              borderRadius: 99,
              bgcolor: impact.horizon === activeHorizon ? '#EFF6FF' : 'background.paper',
              color: impact.horizon === activeHorizon ? '#1D4ED8' : tokenText.secondary,
              border: `1px solid ${impact.horizon === activeHorizon ? '#BFDBFE' : tokenDivider}`,
              fontWeight: 800,
              textTransform: 'capitalize',
            }}
          />
        ))}
      </Box>
    </Paper>
  );
}
