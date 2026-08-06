import { Box, ButtonBase, Paper, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiPlanStrategy, PlannerAiPlanVariant } from '../../ai/types';

type AIPlanTradeoffMatrixProps = {
  variants: PlannerAiPlanVariant[];
  activeVariantId: string | null;
  onSelectVariant: (variantId: string) => void;
};

const PLOT_MARGIN = 10;

function normalizeToPlotPercent(value: number, min: number, max: number, invert = false) {
  if (min === max) {
    return 50;
  }
  const ratio = (value - min) / (max - min);
  const normalized = invert ? 1 - ratio : ratio;
  return PLOT_MARGIN + normalized * (100 - PLOT_MARGIN * 2);
}

function getDotColor(isActive: boolean) {
  return isActive ? tokenBrand.main : '#0F172A';
}

const strategyTradeoffTaglines: Record<PlannerAiPlanStrategy, string> = {
  recommended: 'Top-left — balanced path with more downtime than the production-first options.',
  'min-downtime': 'Far top-right — lowest downtime and the highest residual risk.',
  'max-reliability': 'Bottom-left — lowest risk, accepts the longest maintenance windows.',
  'production-sync': 'Top-right — short changeover stops with higher risk, but safer than Min Downtime.',
};

function getLabelOffset(xPercent: number, yPercent: number) {
  if (xPercent < 30) {
    return { left: '100%', top: '50%', transform: 'translate(6px, -50%)', textAlign: 'left' as const };
  }
  if (xPercent > 70) {
    return { right: '100%', top: '50%', transform: 'translate(-6px, -50%)', textAlign: 'right' as const };
  }
  if (yPercent < 35) {
    return { left: '50%', top: '100%', transform: 'translate(-50%, 6px)', textAlign: 'center' as const };
  }
  return { left: '50%', bottom: '100%', transform: 'translate(-50%, -6px)', textAlign: 'center' as const };
}

export function AIPlanTradeoffMatrix({
  variants,
  activeVariantId,
  onSelectVariant,
}: AIPlanTradeoffMatrixProps) {
  const riskValues = variants.map((variant) => variant.tradeoffPoint.riskScore);
  const downtimeValues = variants.map((variant) => variant.tradeoffPoint.downtimeHours);
  const minRisk = Math.min(...riskValues);
  const maxRisk = Math.max(...riskValues);
  const minDowntime = Math.min(...downtimeValues);
  const maxDowntime = Math.max(...downtimeValues);

  const plotPoints = variants.map((variant) => {
    const { riskScore, downtimeHours } = variant.tradeoffPoint;
    return {
      variant,
      xPercent: normalizeToPlotPercent(downtimeHours, minDowntime, maxDowntime, true),
      yPercent: normalizeToPlotPercent(riskScore, minRisk, maxRisk, true),
    };
  });

  return (
    <Paper elevation={0} sx={{ borderRadius: '14px', border: `1px solid ${tokenDivider}`, p: 1.5, height: '100%' }}>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 800 }}>
        Risk vs. downtime map
      </Typography>
      <Typography sx={{ mt: 0.25, color: tokenText.secondary, fontSize: '0.68rem', lineHeight: 1.45 }}>
        Each strategy occupies a different quadrant. Lower-left is ideal. Tap a dot to switch.
      </Typography>

      <Box
        sx={{
          mt: 1,
          position: 'relative',
          height: 240,
          borderRadius: '12px',
          border: `1px solid ${tokenDivider}`,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 32,
            right: 20,
            bottom: 32,
            left: 20,
            borderRadius: '10px',
            bgcolor: '#F8FAFC',
            border: `1px solid ${tokenDivider}`,
            overflow: 'visible',
          }}
        >
          <Box sx={{ position: 'absolute', left: '50%', top: 0, bottom: 0, borderLeft: `1px dashed ${tokenDivider}` }} />
          <Box sx={{ position: 'absolute', top: '50%', left: 0, right: 0, borderTop: `1px dashed ${tokenDivider}` }} />

          <Typography
            sx={{
              position: 'absolute',
              left: 8,
              top: 6,
              color: tokenText.secondary,
              fontSize: '0.6rem',
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            Higher risk
            <br />
            More downtime
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              right: 8,
              top: 6,
              color: tokenText.secondary,
              fontSize: '0.6rem',
              fontWeight: 700,
              lineHeight: 1.3,
              textAlign: 'right',
            }}
          >
            Higher risk
            <br />
            Less downtime
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              left: 8,
              bottom: 6,
              color: tokenText.secondary,
              fontSize: '0.6rem',
              fontWeight: 700,
              lineHeight: 1.3,
            }}
          >
            Lower risk
            <br />
            More downtime
          </Typography>
          <Typography
            sx={{
              position: 'absolute',
              right: 8,
              bottom: 6,
              color: tokenText.secondary,
              fontSize: '0.6rem',
              fontWeight: 700,
              lineHeight: 1.3,
              textAlign: 'right',
            }}
          >
            Lower risk
            <br />
            Less downtime
          </Typography>

          {plotPoints.map(({ variant, xPercent, yPercent }) => {
            const isActive = variant.id === activeVariantId;
            const labelOffset = getLabelOffset(xPercent, yPercent);

            return (
              <ButtonBase
                key={variant.id}
                onClick={() => onSelectVariant(variant.id)}
                aria-label={`Select ${variant.strategyLabel} strategy`}
                sx={{
                  position: 'absolute',
                  left: `${xPercent}%`,
                  top: `${yPercent}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isActive ? 3 : 2,
                }}
              >
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Box
                    sx={{
                      width: isActive ? 20 : 14,
                      height: isActive ? 20 : 14,
                      borderRadius: '50%',
                      bgcolor: getDotColor(isActive),
                      border: `2px solid ${isActive ? '#BFDBFE' : '#CBD5E1'}`,
                      boxShadow: isActive ? '0 0 0 5px rgba(4,78,215,0.14)' : 'none',
                    }}
                  />
                  {isActive ? (
                    <Typography
                      sx={{
                        position: 'absolute',
                        ...labelOffset,
                        color: tokenText.primary,
                        fontSize: '0.62rem',
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        bgcolor: 'rgba(255,255,255,0.92)',
                        px: 0.45,
                        py: 0.15,
                        borderRadius: '4px',
                        border: `1px solid ${tokenDivider}`,
                        pointerEvents: 'none',
                      }}
                    >
                      {variant.strategyLabel}
                    </Typography>
                  ) : null}
                </Box>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ mt: 0.9, display: 'grid', gap: 0.5 }}>
        {plotPoints.map(({ variant }) => {
          const isActive = variant.id === activeVariantId;
          return (
            <ButtonBase
              key={`legend-${variant.id}`}
              onClick={() => onSelectVariant(variant.id)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                px: 0.85,
                py: 0.5,
                borderRadius: '8px',
                border: `1px solid ${isActive ? '#BFDBFE' : tokenDivider}`,
                bgcolor: isActive ? 'rgba(4,78,215,0.05)' : 'transparent',
                textAlign: 'left',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0 }}>
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    flexShrink: 0,
                    bgcolor: getDotColor(isActive),
                  }}
                />
                <Typography
                  sx={{
                    color: tokenText.primary,
                    fontSize: '0.68rem',
                    fontWeight: isActive ? 800 : 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {variant.strategyLabel}
                </Typography>
              </Box>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.64rem', flexShrink: 0 }}>
                {variant.tradeoffPoint.riskScore} risk · {variant.tradeoffPoint.downtimeHours.toFixed(1)}h
              </Typography>
            </ButtonBase>
          );
        })}
      </Box>

      {activeVariantId ? (
        <Typography sx={{ mt: 0.75, color: tokenText.secondary, fontSize: '0.66rem', lineHeight: 1.45 }}>
          {strategyTradeoffTaglines[variants.find((variant) => variant.id === activeVariantId)?.strategy ?? 'recommended']}
        </Typography>
      ) : null}
    </Paper>
  );
}
