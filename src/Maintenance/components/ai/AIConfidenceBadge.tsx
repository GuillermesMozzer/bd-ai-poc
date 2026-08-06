import { Box, Chip, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenNeutral, tokenText } from '../../../workstation/theme';
import type { PlannerAiPlan } from '../../ai/types';

type AIConfidenceBadgeProps = {
  plan: PlannerAiPlan;
};

export function AIConfidenceBadge({ plan }: AIConfidenceBadgeProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Chip
          size="small"
          label={`${plan.confidence}% confidence`}
          sx={{
            height: 24,
            borderRadius: 99,
            bgcolor: '#EFF6FF',
            color: tokenBrand.main,
            border: '1px solid #BFDBFE',
            fontWeight: 800,
          }}
        />
        <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem' }}>
          {plan.generatorLabel} · {plan.generationDurationMs}ms · {plan.horizonLabel}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
        {plan.confidenceFactors.map((factor) => (
          <Chip
            key={factor.label}
            size="small"
            label={`${factor.label}: ${factor.value}%`}
            sx={{
              height: 22,
              borderRadius: 99,
              bgcolor: tokenNeutral.lightest,
              color: tokenText.secondary,
              border: `1px solid ${tokenDivider}`,
              fontWeight: 700,
            }}
          />
        ))}
      </Box>
      <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
        {plan.orchestrationSummary.participatingAgents.map((agent) => (
          <Chip
            key={agent}
            size="small"
            label={agent}
            sx={{
              height: 22,
              borderRadius: 99,
              bgcolor: 'background.paper',
              color: tokenText.secondary,
              border: `1px solid ${tokenDivider}`,
              fontWeight: 700,
            }}
          />
        ))}
      </Box>
      <Typography sx={{ color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.4 }}>
        {plan.orchestrationSummary.headline}. {plan.orchestrationSummary.summary}
      </Typography>
    </Box>
  );
}
