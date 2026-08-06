import { Box, Paper, Typography } from '@mui/material';
import { tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiPlanVariant, PlannerAiScheduleDeltaItem } from '../../ai/types';

type AIPlanScheduleDeltaViewProps = {
  variant: PlannerAiPlanVariant;
};

function getDeltaPresentation(tone: PlannerAiScheduleDeltaItem['tone']) {
  if (tone === 'add') {
    return { prefix: '+', color: '#166534', bg: '#ECFDF3', border: '#BBF7D0' };
  }

  if (tone === 'move') {
    return { prefix: '~', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' };
  }

  if (tone === 'defer') {
    return { prefix: '-', color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' };
  }

  return { prefix: 'i', color: '#475569', bg: '#F8FAFC', border: '#CBD5E1' };
}

export function AIPlanScheduleDeltaView({ variant }: AIPlanScheduleDeltaViewProps) {
  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.8 }}>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
        Schedule delta view
      </Typography>
      <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.73rem', lineHeight: 1.45 }}>
        {variant.strategyLabel} compared against the current weekly planner state.
      </Typography>

      <Box sx={{ mt: 1.15, display: 'grid', gap: 0.8 }}>
        {variant.scheduleDelta.map((item) => {
          const presentation = getDeltaPresentation(item.tone);
          return (
            <Box
              key={item.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr',
                gap: 0.9,
                p: 1,
                borderRadius: '10px',
                bgcolor: 'background.paper',
                border: `1px solid ${tokenDivider}`,
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '8px',
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: presentation.bg,
                  border: `1px solid ${presentation.border}`,
                  color: presentation.color,
                  fontWeight: 800,
                  fontSize: '0.82rem',
                }}
              >
                {presentation.prefix}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 800, lineHeight: 1.4 }}>
                  {item.summary}
                </Typography>
                <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
                  {item.detail}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
