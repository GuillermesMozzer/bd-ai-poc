import { Box, Paper, Typography } from '@mui/material';
import { tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiLongTermMetric, PlannerAiPlanVariant } from '../../ai/types';

type AILongTermMetricsPanelProps = {
  variant: PlannerAiPlanVariant;
  compact?: boolean;
};

function getDeltaColor(metric: PlannerAiLongTermMetric) {
  if (metric.emphasis === 'positive') {
    return { color: '#166534', bg: '#ECFDF3', border: '#BBF7D0' };
  }

  if (metric.emphasis === 'negative') {
    return { color: '#B91C1C', bg: '#FEF2F2', border: '#FECACA' };
  }

  return { color: '#475569', bg: '#F8FAFC', border: '#CBD5E1' };
}

export function AILongTermMetricsPanel({ variant, compact = false }: AILongTermMetricsPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: compact ? 0 : '12px',
        border: compact ? 'none' : `1px solid ${tokenDivider}`,
        p: compact ? 0 : 1.8,
        bgcolor: compact ? 'transparent' : 'background.paper',
      }}
    >
      {compact ? null : (
        <>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
            Long-term metric deltas
          </Typography>
          <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.73rem', lineHeight: 1.45 }}>
            Annualized view of what {variant.strategyLabel.toLowerCase()} could change if repeated consistently.
          </Typography>
        </>
      )}

      <Box
        sx={{
          mt: compact ? 0 : 1.15,
          display: 'grid',
          gridTemplateColumns: compact ? { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' } : '1fr',
          gap: 0.8,
        }}
      >
        {variant.longTermMetrics.map((metric) => {
          const deltaStyles = getDeltaColor(metric);
          return (
            <Box
              key={metric.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: compact ? '1fr auto' : { xs: '1fr', md: '1.15fr 0.9fr 0.9fr 0.6fr' },
                gap: 1,
                alignItems: 'center',
                p: 1,
                borderRadius: '10px',
                border: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Box>
                <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 800 }}>
                  {metric.label}
                </Typography>
                {compact ? null : (
                  <Typography sx={{ mt: 0.2, color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.45 }}>
                    {metric.summary}
                  </Typography>
                )}
                {compact ? (
                  <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.7rem' }}>
                    {metric.currentValue} → <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>{metric.projectedValue}</Box>
                  </Typography>
                ) : null}
              </Box>
              {compact ? null : (
                <>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.73rem' }}>
                    Current: <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>{metric.currentValue}</Box>
                  </Typography>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.73rem' }}>
                    Projected: <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>{metric.projectedValue}</Box>
                  </Typography>
                </>
              )}
              <Box
                sx={{
                  justifySelf: { xs: 'flex-start', md: compact ? 'end' : 'end' },
                  px: 0.8,
                  py: 0.4,
                  borderRadius: '999px',
                  bgcolor: deltaStyles.bg,
                  border: `1px solid ${deltaStyles.border}`,
                  color: deltaStyles.color,
                  fontSize: '0.7rem',
                  fontWeight: 800,
                }}
              >
                {metric.deltaLabel}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}
