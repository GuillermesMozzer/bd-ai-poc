import { CheckCircle as CheckIcon, Star as StarIcon } from '@mui/icons-material';
import { Box, Button, ButtonBase, Chip, Paper, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenSuccess, tokenText } from '../../../workstation/theme';
import type { PlannerAiComparisonSession, PlannerAiPlanVariant } from '../../ai/types';

const neutralCellBg = '#F8FAFC';

type AIStrategyComparisonTableProps = {
  comparisonSession: PlannerAiComparisonSession;
  activeVariantId: string;
  onSelectVariant: (variantId: string) => void;
  onReviewVariant: (variantId: string) => void;
};

type MetricDirection = 'lower' | 'higher';

type ComparisonMetric = {
  id: string;
  label: string;
  hint: string;
  direction: MetricDirection;
  getNumericValue: (variant: PlannerAiPlanVariant) => number;
  formatValue: (variant: PlannerAiPlanVariant) => string;
};

const laborLoadRank = { Low: 1, Medium: 2, High: 3 } as const;

function parseAnnualCostDelta(value: string) {
  const numeric = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
}

const comparisonMetrics: ComparisonMetric[] = [
  {
    id: 'downtime',
    label: 'Planned downtime',
    hint: 'Less stop time this week',
    direction: 'lower',
    getNumericValue: (variant) => variant.summaryMetrics.plannedDowntimeHours,
    formatValue: (variant) => `${variant.summaryMetrics.plannedDowntimeHours.toFixed(1)}h`,
  },
  {
    id: 'risk',
    label: 'Risk score',
    hint: 'Lower exposure to failure',
    direction: 'lower',
    getNumericValue: (variant) => variant.summaryMetrics.riskScore,
    formatValue: (variant) => `${variant.summaryMetrics.riskScore}`,
  },
  {
    id: 'compliance',
    label: 'PM compliance',
    hint: 'On-time preventive coverage',
    direction: 'higher',
    getNumericValue: (variant) => variant.summaryMetrics.pmCompliance,
    formatValue: (variant) => `${variant.summaryMetrics.pmCompliance}%`,
  },
  {
    id: 'backlog',
    label: 'Open backlog',
    hint: 'Fewer queued work orders',
    direction: 'lower',
    getNumericValue: (variant) => variant.summaryMetrics.openBacklog,
    formatValue: (variant) => `${variant.summaryMetrics.openBacklog}`,
  },
  {
    id: 'savings',
    label: 'Annual savings',
    hint: 'Projected cost reduction',
    direction: 'lower',
    getNumericValue: (variant) => parseAnnualCostDelta(variant.summaryMetrics.annualCostDelta),
    formatValue: (variant) => variant.summaryMetrics.annualCostDelta,
  },
  {
    id: 'labor',
    label: 'Labor load',
    hint: 'Crew strain this week',
    direction: 'lower',
    getNumericValue: (variant) => laborLoadRank[variant.summaryMetrics.laborLoad],
    formatValue: (variant) => variant.summaryMetrics.laborLoad,
  },
  {
    id: 'confidence',
    label: 'AI confidence',
    hint: 'How sure BLU.AI is',
    direction: 'higher',
    getNumericValue: (variant) => variant.confidence,
    formatValue: (variant) => `${variant.confidence}%`,
  },
];

function isBestValue(values: number[], value: number, direction: MetricDirection) {
  if (!values.length) {
    return false;
  }
  const best = direction === 'lower' ? Math.min(...values) : Math.max(...values);
  return value === best;
}

function getBarWidth(values: number[], value: number, direction: MetricDirection) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return '72%';
  }
  const normalized = direction === 'lower' ? (max - value) / (max - min) : (value - min) / (max - min);
  return `${Math.max(18, Math.round(normalized * 72 + 18))}%`;
}

function countWins(variant: PlannerAiPlanVariant, variants: PlannerAiPlanVariant[]) {
  return comparisonMetrics.reduce((wins, metric) => {
    const values = variants.map((entry) => metric.getNumericValue(entry));
    const value = metric.getNumericValue(variant);
    return wins + (isBestValue(values, value, metric.direction) ? 1 : 0);
  }, 0);
}

export function AIStrategyComparisonTable({
  comparisonSession,
  activeVariantId,
  onSelectVariant,
  onReviewVariant,
}: AIStrategyComparisonTableProps) {
  const { variants, recommendedVariantId } = comparisonSession;

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: `1px solid ${tokenDivider}`, overflow: 'hidden' }}>
      <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
        <Typography sx={{ color: tokenText.primary, fontSize: '0.88rem', fontWeight: 800 }}>
          Strategy scorecard
        </Typography>
        <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.73rem' }}>
          Green highlights the best value per row. Tap a column to make that strategy active.
        </Typography>
      </Box>

      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: 720, display: 'grid', gridTemplateColumns: `minmax(150px, 1.1fr) repeat(${variants.length}, minmax(130px, 1fr))` }}>
          <Box sx={{ px: 1.5, py: 1.2, borderBottom: `1px solid ${tokenDivider}`, bgcolor: neutralCellBg }} />
          {variants.map((variant) => {
            const isActive = variant.id === activeVariantId;
            const isRecommended = variant.id === recommendedVariantId;
            const wins = countWins(variant, variants);

            return (
              <ButtonBase
                key={variant.id}
                onClick={() => onSelectVariant(variant.id)}
                sx={{
                  px: 1.2,
                  py: 1.2,
                  display: 'grid',
                  gap: 0.55,
                  alignContent: 'start',
                  textAlign: 'left',
                  borderBottom: `1px solid ${tokenDivider}`,
                  borderLeft: `1px solid ${tokenDivider}`,
                  bgcolor: isActive ? 'rgba(4,78,215,0.05)' : 'background.paper',
                  transition: 'background-color 0.15s ease',
                  '&:hover': { bgcolor: isActive ? 'rgba(4,78,215,0.07)' : 'rgba(15,23,42,0.02)' },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 800, lineHeight: 1.25 }}>
                    {variant.strategyLabel}
                  </Typography>
                  {isRecommended ? (
                    <Chip
                      size="small"
                      icon={<StarIcon sx={{ fontSize: '0.82rem !important' }} />}
                      label="Rec"
                      sx={{
                        height: 20,
                        borderRadius: 99,
                        bgcolor: '#EFF6FF',
                        color: tokenBrand.main,
                        border: '1px solid #BFDBFE',
                        fontWeight: 800,
                        '& .MuiChip-icon': { color: tokenBrand.main },
                      }}
                    />
                  ) : null}
                </Box>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', lineHeight: 1.35 }}>
                  {variant.strategyDescription}
                </Typography>
                <Typography sx={{ color: tokenSuccess.dark, fontSize: '0.68rem', fontWeight: 800 }}>
                  Best on {wins} of {comparisonMetrics.length} metrics
                </Typography>
              </ButtonBase>
            );
          })}

          {comparisonMetrics.map((metric) => {
            const values = variants.map((variant) => metric.getNumericValue(variant));

            return (
              <Box key={metric.id} sx={{ display: 'contents' }}>
                <Box
                  sx={{
                    px: 1.5,
                    py: 1.1,
                    borderBottom: `1px solid ${tokenDivider}`,
                    bgcolor: neutralCellBg,
                  }}
                >
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.74rem', fontWeight: 800 }}>
                    {metric.label}
                  </Typography>
                  <Typography sx={{ mt: 0.15, color: tokenText.secondary, fontSize: '0.64rem' }}>
                    {metric.hint}
                  </Typography>
                </Box>

                {variants.map((variant) => {
                  const isActive = variant.id === activeVariantId;
                  const value = metric.getNumericValue(variant);
                  const best = isBestValue(values, value, metric.direction);
                  const barWidth = getBarWidth(values, value, metric.direction);

                  return (
                    <Box
                      key={`${metric.id}-${variant.id}`}
                      sx={{
                        px: 1.2,
                        py: 1.1,
                        borderBottom: `1px solid ${tokenDivider}`,
                        borderLeft: `1px solid ${tokenDivider}`,
                        bgcolor: isActive ? 'rgba(4,78,215,0.03)' : 'background.paper',
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                        <Typography
                          sx={{
                            color: best ? tokenSuccess.dark : tokenText.primary,
                            fontSize: '0.82rem',
                            fontWeight: 800,
                          }}
                        >
                          {metric.formatValue(variant)}
                        </Typography>
                        {best ? <CheckIcon sx={{ fontSize: 15, color: tokenSuccess.main }} /> : null}
                      </Box>
                      <Box sx={{ mt: 0.55, height: 6, borderRadius: 99, bgcolor: '#E2E8F0', overflow: 'hidden' }}>
                        <Box
                          sx={{
                            height: '100%',
                            width: barWidth,
                            borderRadius: 99,
                            bgcolor: best ? tokenSuccess.main : isActive ? tokenBrand.main : '#94A3B8',
                            opacity: best ? 1 : isActive ? 0.85 : 0.55,
                          }}
                        />
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            );
          })}

          <Box sx={{ px: 1.5, py: 1.2, bgcolor: neutralCellBg }} />
          {variants.map((variant) => {
            const isActive = variant.id === activeVariantId;
            return (
              <Box
                key={`${variant.id}-action`}
                sx={{
                  px: 1.2,
                  py: 1.2,
                  borderLeft: `1px solid ${tokenDivider}`,
                  bgcolor: isActive ? 'rgba(4,78,215,0.03)' : 'background.paper',
                }}
              >
                <Button
                  fullWidth
                  variant={isActive ? 'contained' : 'outlined'}
                  onClick={() => onReviewVariant(variant.id)}
                  sx={{
                    py: 0.75,
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    boxShadow: 'none',
                    borderColor: tokenBrand.main,
                    bgcolor: isActive ? tokenBrand.main : 'transparent',
                    color: isActive ? '#fff' : tokenBrand.main,
                    '&:hover': { boxShadow: 'none', bgcolor: isActive ? tokenBrand.dark : 'rgba(4,78,215,0.06)' },
                  }}
                >
                  {isActive ? 'Review this strategy' : 'Preview'}
                </Button>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
}
