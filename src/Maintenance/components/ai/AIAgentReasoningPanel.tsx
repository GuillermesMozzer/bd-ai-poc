import { Box, Chip, Paper, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenError, tokenText, tokenWarning } from '../../../workstation/theme';
import type { PlannerAiPlanVariant } from '../../ai/types';

type AIAgentReasoningPanelProps = {
  variant: PlannerAiPlanVariant;
  embedded?: boolean;
};

function getStanceChipStyles(stance: PlannerAiPlanVariant['agentReasoning'][number]['stance']) {
  if (stance === 'blocking') {
    return { bgcolor: '#FEF2F2', color: tokenError.main, border: '#FECACA', label: 'Blocking' };
  }

  if (stance === 'warning') {
    return { bgcolor: '#FFF7ED', color: tokenWarning.dark, border: '#FED7AA', label: 'Caution' };
  }

  return { bgcolor: '#EFF6FF', color: tokenBrand.main, border: '#BFDBFE', label: 'Supporting' };
}

export function AIAgentReasoningPanel({ variant, embedded = false }: AIAgentReasoningPanelProps) {
  const sortedReasoning = [...variant.agentReasoning].sort((left, right) => {
    const rank = { blocking: 0, warning: 1, supporting: 2 } as const;
    return rank[left.stance] - rank[right.stance];
  });

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: embedded ? 0 : '12px',
        border: embedded ? 'none' : `1px solid ${tokenDivider}`,
        p: embedded ? 0 : 1.8,
        bgcolor: embedded ? 'transparent' : 'background.paper',
      }}
    >
      {embedded ? null : (
        <>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
            Agent reasoning panel
          </Typography>
          <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.73rem', lineHeight: 1.45 }}>
            Why {variant.strategyLabel.toLowerCase()} is recommending this shape of work.
          </Typography>
        </>
      )}

      <Box sx={{ mt: embedded ? 0 : 1.15, display: 'grid', gap: 0.9 }}>
        {sortedReasoning.map((reasoning) => (
          (() => {
            const stanceChip = getStanceChipStyles(reasoning.stance);
            return (
              <Box
                key={reasoning.id}
                sx={{
                  p: 1,
                  borderRadius: '10px',
                  border: `1px solid ${tokenDivider}`,
                  bgcolor: 'background.paper',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap' }}>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 800 }}>
                      {reasoning.agent}
                    </Typography>
                    <Chip
                      size="small"
                      label={`${reasoning.confidence}% confidence`}
                      sx={{
                        height: 22,
                        borderRadius: 99,
                        bgcolor: '#EFF6FF',
                        color: tokenBrand.main,
                        border: '1px solid #BFDBFE',
                        fontWeight: 700,
                      }}
                    />
                    <Chip
                      size="small"
                      label={stanceChip.label}
                      sx={{
                        height: 22,
                        borderRadius: 99,
                        bgcolor: stanceChip.bgcolor,
                        color: stanceChip.color,
                        border: `1px solid ${stanceChip.border}`,
                        fontWeight: 700,
                      }}
                    />
                  </Box>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 700 }}>
                    {reasoning.title}
                  </Typography>
                </Box>
                <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
                  {reasoning.summary}
                </Typography>
                {reasoning.highlights?.length ? (
                  <Box sx={{ mt: 0.55, display: 'grid', gap: 0.25 }}>
                    {reasoning.highlights.map((highlight) => (
                      <Typography key={highlight} sx={{ color: tokenText.secondary, fontSize: '0.69rem', lineHeight: 1.4 }}>
                        • {highlight}
                      </Typography>
                    ))}
                  </Box>
                ) : null}
              </Box>
            );
          })()
        ))}
      </Box>
    </Paper>
  );
}
