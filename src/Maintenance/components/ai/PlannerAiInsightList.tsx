import { OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import { Box, Button, Paper, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiAssistantInsight } from '../../ai/types';

type PlannerAiInsightListProps = {
  insights: PlannerAiAssistantInsight[];
  onInsightLink?: (assetLabel: string, cardId?: string) => void;
  title?: string;
  description?: string | null;
};

function getToneStyles(tone: PlannerAiAssistantInsight['tone']) {
  if (tone === 'critical') {
    return { border: '#FECACA', bg: '#FEF2F2', color: '#B91C1C' };
  }

  if (tone === 'warning') {
    return { border: '#FED7AA', bg: '#FFF7ED', color: '#C2410C' };
  }

  if (tone === 'positive') {
    return { border: '#BBF7D0', bg: '#ECFDF3', color: '#166534' };
  }

  return { border: '#BFDBFE', bg: '#EFF6FF', color: '#1D4ED8' };
}

export function PlannerAiInsightList({
  insights,
  onInsightLink,
  title = 'Horizon-aware insights',
  description = 'Linked insights jump to matching work-order cards on the weekly board.',
}: PlannerAiInsightListProps) {
  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.8 }}>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
        {title}
      </Typography>
      {description ? (
        <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.68rem', lineHeight: 1.45 }}>
          {description}
        </Typography>
      ) : null}

      <Box sx={{ mt: 1.1, display: 'grid', gap: 0.8 }}>
        {insights.map((insight) => {
          const toneStyles = getToneStyles(insight.tone);
          const canLink = Boolean(insight.linkedCardId && insight.linkedAsset && onInsightLink);

          return (
            <Box
              key={insight.id}
              sx={{
                p: 1,
                borderRadius: '10px',
                border: `1px solid ${toneStyles.border}`,
                bgcolor: toneStyles.bg,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 800 }}>
                  {insight.title}
                </Typography>
                {insight.metricLabel ? (
                  <Typography sx={{ color: toneStyles.color, fontSize: '0.68rem', fontWeight: 800 }}>
                    {insight.metricLabel}
                  </Typography>
                ) : null}
              </Box>
              <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.5 }}>
                {insight.summary}
              </Typography>
              {insight.agentContributors?.length ? (
                <Typography sx={{ mt: 0.32, color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700, lineHeight: 1.4 }}>
                  Agents: {insight.agentContributors.join(', ')}
                </Typography>
              ) : null}
              {insight.sourceLabel ? (
                <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700 }}>
                  Source: {insight.sourceLabel}
                </Typography>
              ) : null}
              {canLink ? (
                <Button
                  fullWidth
                  size="small"
                  variant="outlined"
                  startIcon={<OpenInNewIcon sx={{ fontSize: 14 }} />}
                  onClick={() => onInsightLink!(insight.linkedAsset!, insight.linkedCardId)}
                  sx={{
                    mt: 0.75,
                    minHeight: 32,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: '0.72rem',
                    color: tokenBrand.main,
                    borderColor: tokenBrand.selectedBg,
                    bgcolor: 'background.paper',
                    '&:hover': {
                      borderColor: tokenBrand.main,
                      bgcolor: '#EFF6FF',
                    },
                  }}
                >
                  View {insight.linkedAsset} on weekly board
                </Button>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
