import { AutoAwesome as SparkleIcon } from '@mui/icons-material';
import { Box, Paper, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenText, tokenWarning } from '../../../workstation/theme';
import type { PlannerAiPlan } from '../../ai/types';

type AINaturalLanguageExplainerProps = {
  plan: PlannerAiPlan;
};

export function AINaturalLanguageExplainer({ plan }: AINaturalLanguageExplainerProps) {
  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.8 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
        <SparkleIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
        <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
          Risk explanation
        </Typography>
      </Box>

      <Typography sx={{ mt: 1.05, color: tokenText.primary, fontSize: '0.8rem', fontWeight: 800, lineHeight: 1.45 }}>
        {plan.rationale.headline}
      </Typography>
      <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.76rem', lineHeight: 1.55 }}>
        {plan.narrative}
      </Typography>
      <Typography sx={{ mt: 0.75, color: tokenText.secondary, fontSize: '0.74rem', lineHeight: 1.5 }}>
        {plan.rationale.summary}
      </Typography>

      <Box sx={{ mt: 1.2, display: 'grid', gap: 0.7 }}>
        {(plan.rationale.tradeoffs ?? []).map((tradeoff, index) => (
          <Typography key={`${tradeoff}-${index}`} sx={{ color: tokenWarning.dark, fontSize: '0.72rem', lineHeight: 1.45 }}>
            Trade-off: {tradeoff}
          </Typography>
        ))}
      </Box>

      <Box sx={{ mt: 1.25, display: 'grid', gap: 0.55 }}>
        {(plan.rationale.recommendedNextSteps ?? []).map((step, index) => (
          <Typography key={`${step}-${index}`} sx={{ color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
            Next: {step}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
}
