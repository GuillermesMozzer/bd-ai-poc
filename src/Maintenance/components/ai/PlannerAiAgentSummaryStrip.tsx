import { AutoAwesome as SparkleIcon } from '@mui/icons-material';
import { Box, Chip, Paper, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiPlanVariant, PlannerAiWhatIfResult } from '../../ai/types';

type PlannerAiAgentSummaryStripProps = {
  generatedPlan: PlannerAiPlanVariant | null;
  reviewPlan: PlannerAiPlanVariant | null;
  reviewPlanSource: 'copilot' | 'what-if' | null;
  whatIfResult: PlannerAiWhatIfResult | null;
  isCompareMode?: boolean;
};

export function PlannerAiAgentSummaryStrip({
  generatedPlan,
  reviewPlan,
  reviewPlanSource,
  whatIfResult,
  isCompareMode = false,
}: PlannerAiAgentSummaryStripProps) {
  const activePlan = reviewPlan ?? generatedPlan;
  const sourceLabel = reviewPlan
    ? reviewPlanSource === 'what-if'
      ? 'What-if review'
      : 'Copilot review'
    : generatedPlan
      ? isCompareMode
        ? 'Review strategy'
        : 'Active strategy'
      : null;

  if (!activePlan && !whatIfResult?.agentCommentary?.length) {
    return null;
  }

  const orchestration = activePlan?.orchestrationSummary;
  const agents = orchestration?.participatingAgents ?? whatIfResult?.agentCommentary?.map((entry) => entry.agent) ?? [];

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: `1px solid ${tokenBrand.selectedBg}`,
        bgcolor: '#EFF6FF',
        p: 1.25,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
        <SparkleIcon sx={{ color: '#F97316', fontSize: 16 }} />
        <Typography sx={{ color: tokenBrand.main, fontSize: '0.78rem', fontWeight: 800 }}>
          Agent summary
        </Typography>
      </Box>

      {orchestration ? (
        <>
          <Typography sx={{ mt: 0.55, color: tokenText.primary, fontSize: '0.74rem', fontWeight: 800, lineHeight: 1.45 }}>
            {orchestration.headline}
          </Typography>
          <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}>
            {orchestration.summary}
          </Typography>
        </>
      ) : whatIfResult ? (
        <Typography sx={{ mt: 0.55, color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}>
          {whatIfResult.summary}
        </Typography>
      ) : null}
    </Paper>
  );
}
