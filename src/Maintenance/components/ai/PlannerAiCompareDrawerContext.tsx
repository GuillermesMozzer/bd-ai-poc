import { Box, Chip, Paper, Typography } from '@mui/material';
import { useMemo } from 'react';
import { buildStrategyComparisonInsights } from '../../ai/buildStrategyComparisonInsights';
import type { PlannerAiPlanVariant } from '../../ai/types';
import { tokenBrand, tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiCompareDialogTab } from './plannerAiCompareDialog';
import { getCompareDialogTabLabel } from './plannerAiCompareDialog';

type PlannerAiCompareDrawerContextProps = {
  compareTab: PlannerAiCompareDialogTab;
  activeVariant: PlannerAiPlanVariant;
  allVariants: PlannerAiPlanVariant[];
};

function getDeltaToneColor(tone: PlannerAiPlanVariant['scheduleDelta'][number]['tone']) {
  if (tone === 'critical') {
    return { border: '#FECACA', bg: '#FEF2F2', color: '#B91C1C' };
  }
  if (tone === 'warning') {
    return { border: '#FED7AA', bg: '#FFF7ED', color: '#C2410C' };
  }
  return { border: '#BFDBFE', bg: '#EFF6FF', color: '#1D4ED8' };
}

export function PlannerAiCompareDrawerContext({
  compareTab,
  activeVariant,
  allVariants,
}: PlannerAiCompareDrawerContextProps) {
  const insights = useMemo(
    () => buildStrategyComparisonInsights(activeVariant, allVariants),
    [activeVariant, allVariants],
  );

  const blockingAgents = activeVariant.agentReasoning.filter((entry) => entry.stance === 'blocking').length;
  const warningAgents = activeVariant.agentReasoning.filter((entry) => entry.stance === 'warning').length;

  return (
    <Box sx={{ display: 'grid', gap: 1.1 }}>
      <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenBrand.selectedBg}`, bgcolor: '#EFF6FF', p: 1.25 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap' }}>
          <Typography sx={{ color: tokenBrand.main, fontSize: '0.72rem', fontWeight: 800 }}>
            Following modal · {getCompareDialogTabLabel(compareTab)}
          </Typography>
          <Chip
            size="small"
            label={activeVariant.strategyLabel}
            sx={{ height: 22, borderRadius: 99, fontWeight: 700, bgcolor: 'background.paper' }}
          />
        </Box>
        <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}>
          {activeVariant.rationale.headline}
        </Typography>
      </Paper>

      {compareTab === 'compare' ? (
        <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.4 }}>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 800 }}>
            Strategic review insights
          </Typography>
          <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.55 }}>
            {insights.summary}
          </Typography>
          {insights.strengths[0] ? (
            <Typography sx={{ mt: 0.65, color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}>
              <Box component="span" sx={{ fontWeight: 800, color: tokenText.primary }}>
                Strength:
              </Box>{' '}
              {insights.strengths[0]}
            </Typography>
          ) : null}
          {insights.weaknesses[0] ? (
            <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}>
              <Box component="span" sx={{ fontWeight: 800, color: tokenText.primary }}>
                Watch-out:
              </Box>{' '}
              {insights.weaknesses[0]}
            </Typography>
          ) : null}
        </Paper>
      ) : null}

      {compareTab === 'changes' ? (
        <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.4 }}>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 800 }}>
            Schedule changes ({activeVariant.scheduleDelta.length})
          </Typography>
          <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.68rem', lineHeight: 1.45 }}>
            Highlights from the What changes tab for {activeVariant.strategyLabel}.
          </Typography>
          <Box sx={{ mt: 0.85, display: 'grid', gap: 0.65 }}>
            {activeVariant.scheduleDelta.slice(0, 4).map((delta) => {
              const toneStyles = getDeltaToneColor(delta.tone);
              return (
                <Box
                  key={delta.id}
                  sx={{
                    p: 0.85,
                    borderRadius: '10px',
                    border: `1px solid ${toneStyles.border}`,
                    bgcolor: toneStyles.bg,
                  }}
                >
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.73rem', fontWeight: 800 }}>
                    {delta.summary}
                  </Typography>
                  <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.7rem', lineHeight: 1.45 }}>
                    {delta.detail}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </Paper>
      ) : null}

      {compareTab === 'details' ? (
        <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.4 }}>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 800 }}>
            Agent & long-term snapshot
          </Typography>
          <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.68rem', lineHeight: 1.45 }}>
            {blockingAgents || warningAgents
              ? `${blockingAgents} blocking · ${warningAgents} caution signal${warningAgents === 1 ? '' : 's'} on ${activeVariant.strategyLabel}.`
              : `No blocking agent conflicts on ${activeVariant.strategyLabel}.`}
          </Typography>
          <Box sx={{ mt: 0.85, display: 'grid', gap: 0.65 }}>
            {activeVariant.agentReasoning.slice(0, 3).map((entry) => (
              <Box
                key={entry.id}
                sx={{
                  p: 0.85,
                  borderRadius: '10px',
                  border: `1px solid ${tokenDivider}`,
                  bgcolor: 'background.paper',
                }}
              >
                <Typography sx={{ color: tokenText.primary, fontSize: '0.73rem', fontWeight: 800 }}>
                  {entry.agent}
                </Typography>
                <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.7rem', lineHeight: 1.45 }}>
                  {entry.summary}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      ) : null}
    </Box>
  );
}
