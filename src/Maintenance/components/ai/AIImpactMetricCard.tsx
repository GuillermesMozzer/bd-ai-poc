import { Box, Paper, Typography } from '@mui/material';
import { tokenBrand, tokenError, tokenSuccess, tokenText, tokenWarning } from '../../../workstation/theme';
import type { PlannerAiImpactMetric } from '../../ai/types';

function formatMetricValue(metric: PlannerAiImpactMetric, value: number) {
  if (metric.unit === '%') {
    return `${value}%`;
  }
  if (metric.unit === 'hours') {
    return `${value}h`;
  }
  return `${value}`;
}

function getAccentColor(metric: PlannerAiImpactMetric) {
  if (metric.emphasis === 'positive') {
    return tokenSuccess.dark;
  }
  if (metric.emphasis === 'negative') {
    return tokenError.dark;
  }
  return tokenText.secondary;
}

type AIImpactMetricCardProps = {
  metric: PlannerAiImpactMetric;
  compact?: boolean;
};

export function AIImpactMetricCard({ metric, compact = false }: AIImpactMetricCardProps) {
  const accentColor = getAccentColor(metric);
  const maxValue = Math.max(metric.before, metric.after, 1);
  const beforeWidth = `${(metric.before / maxValue) * 100}%`;
  const afterWidth = `${(metric.after / maxValue) * 100}%`;
  const improved = metric.direction === 'down' ? metric.after < metric.before : metric.after > metric.before;

  if (compact) {
    return (
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 0.5 }}>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }}>
            {metric.label}
          </Typography>
          <Typography sx={{ color: accentColor, fontSize: '0.7rem', fontWeight: 800 }}>
            {metric.deltaLabel}
          </Typography>
        </Box>
        <Box sx={{ mt: 0.45, display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', minWidth: 36 }}>
            {formatMetricValue(metric, metric.before)}
          </Typography>
          <Box sx={{ flex: 1, position: 'relative', height: 8, borderRadius: 99, bgcolor: '#E2E8F0' }}>
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: beforeWidth,
                borderRadius: 99,
                bgcolor: '#94A3B8',
                opacity: 0.55,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: afterWidth,
                borderRadius: 99,
                bgcolor: improved ? tokenBrand.main : tokenWarning.main,
              }}
            />
          </Box>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 800, minWidth: 40, textAlign: 'right' }}>
            {formatMetricValue(metric, metric.after)}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: '1px solid var(--token-divider)',
        p: 1.5,
        bgcolor: 'background.paper',
      }}
    >
      <Typography sx={{ color: tokenText.secondary, fontSize: '0.7rem', fontWeight: 700 }}>
        {metric.label}
      </Typography>
      <Typography sx={{ mt: 0.4, color: tokenText.primary, fontSize: '1.15rem', fontWeight: 800 }}>
        {formatMetricValue(metric, metric.after)}
      </Typography>
      <Typography sx={{ mt: 0.35, color: accentColor, fontSize: '0.73rem', fontWeight: 700 }}>
        {metric.deltaLabel} from {formatMetricValue(metric, metric.before)}
      </Typography>
    </Paper>
  );
}
