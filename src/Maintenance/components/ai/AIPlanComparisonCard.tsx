import { Box, Button, Chip, Paper, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenNeutral, tokenText } from '../../../workstation/theme';
import type { PlannerAiPlanVariant } from '../../ai/types';

type AIPlanComparisonCardProps = {
  variant: PlannerAiPlanVariant;
  isActive: boolean;
  isRecommended: boolean;
  onSelect: () => void;
  onReview: () => void;
};

function getLaborLoadColor(laborLoad: PlannerAiPlanVariant['summaryMetrics']['laborLoad']) {
  if (laborLoad === 'High') {
    return { bgcolor: '#FFF7ED', color: '#C2410C', border: '#FED7AA' };
  }

  if (laborLoad === 'Medium') {
    return { bgcolor: '#EFF6FF', color: tokenBrand.main, border: '#BFDBFE' };
  }

  return { bgcolor: '#ECFDF3', color: '#166534', border: '#BBF7D0' };
}

export function AIPlanComparisonCard({
  variant,
  isActive,
  isRecommended,
  onSelect,
  onReview,
}: AIPlanComparisonCardProps) {
  const laborLoadStyles = getLaborLoadColor(variant.summaryMetrics.laborLoad);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '14px',
        border: `1px solid ${isActive ? '#BFDBFE' : tokenDivider}`,
        bgcolor: isActive ? 'rgba(4,78,215,0.04)' : 'background.paper',
        p: 1.8,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
            <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
              {variant.strategyLabel}
            </Typography>
            {isRecommended ? (
              <Chip
                size="small"
                label="Recommended"
                sx={{
                  height: 22,
                  borderRadius: 99,
                  bgcolor: '#EFF6FF',
                  color: tokenBrand.main,
                  border: '1px solid #BFDBFE',
                  fontWeight: 800,
                }}
              />
            ) : null}
            {isActive ? (
              <Chip
                size="small"
                label="Active"
                sx={{
                  height: 22,
                  borderRadius: 99,
                  bgcolor: tokenNeutral.lightest,
                  color: tokenText.primary,
                  border: `1px solid ${tokenDivider}`,
                  fontWeight: 700,
                }}
              />
            ) : null}
          </Box>
          <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.73rem', lineHeight: 1.45 }}>
            {variant.strategyDescription}
          </Typography>
        </Box>
        <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 800 }}>
          {variant.confidence}% confidence
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 1.3,
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 0.9,
        }}
      >
        <Box>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.67rem', textTransform: 'uppercase', fontWeight: 800 }}>
            Downtime
          </Typography>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
            {variant.summaryMetrics.plannedDowntimeHours.toFixed(1)}h
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.67rem', textTransform: 'uppercase', fontWeight: 800 }}>
            Risk Score
          </Typography>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
            {variant.summaryMetrics.riskScore}
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.67rem', textTransform: 'uppercase', fontWeight: 800 }}>
            PM Compliance
          </Typography>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
            {variant.summaryMetrics.pmCompliance}%
          </Typography>
        </Box>
        <Box>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.67rem', textTransform: 'uppercase', fontWeight: 800 }}>
            Open Backlog
          </Typography>
          <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
            {variant.summaryMetrics.openBacklog}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ mt: 1.1, display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
        <Chip
          size="small"
          label={`${variant.summaryMetrics.laborLoad} labor load`}
          sx={{
            height: 22,
            borderRadius: 99,
            bgcolor: laborLoadStyles.bgcolor,
            color: laborLoadStyles.color,
            border: `1px solid ${laborLoadStyles.border}`,
            fontWeight: 700,
          }}
        />
        <Chip
          size="small"
          label={variant.summaryMetrics.annualCostDelta}
          sx={{
            height: 22,
            borderRadius: 99,
            bgcolor: '#ECFDF3',
            color: '#166534',
            border: '1px solid #BBF7D0',
            fontWeight: 700,
          }}
        />
      </Box>

      <Box sx={{ mt: 1.4, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Button
          variant={isActive ? 'contained' : 'outlined'}
          onClick={onSelect}
          sx={{
            minHeight: 34,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: 'none',
            borderColor: tokenBrand.main,
            bgcolor: isActive ? tokenBrand.main : 'transparent',
            color: isActive ? '#fff' : tokenBrand.main,
            '&:hover': { boxShadow: 'none', bgcolor: isActive ? tokenBrand.dark : 'rgba(4,78,215,0.06)' },
          }}
        >
          {isActive ? 'Active strategy' : 'Set active'}
        </Button>
        <Button
          variant="text"
          onClick={onReview}
          sx={{
            minHeight: 34,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 700,
            color: tokenText.secondary,
          }}
        >
          Review strategy
        </Button>
      </Box>
    </Paper>
  );
}
