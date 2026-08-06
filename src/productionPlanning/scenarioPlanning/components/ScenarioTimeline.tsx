import {Box, Chip, Paper, Typography} from '@mui/material';
import {ErrorOutline as BlockerIcon, WarningAmber as WarningIcon, CheckCircleOutline as OkIcon} from '@mui/icons-material';
import {planningCardSx, planningTokens} from '../../ui/planningTheme';
import type {PeriodImpact} from '../types';

type Props = {
  periodImpacts: PeriodImpact[];
  selectedPeriod: string | null;
  onSelectPeriod: (period: string) => void;
};

function sign(v: number) {
  return v > 0 ? `+${v.toLocaleString()}` : v.toLocaleString();
}

export default function ScenarioTimeline({periodImpacts, selectedPeriod, onSelectPeriod}: Props) {
  return (
    <Box>
      <Typography sx={{fontSize: 13, color: planningTokens.textMuted, mb: 2}}>
        Period-by-period ripple effect. Click a period to see detailed impacts.
      </Typography>

      {/* Period cards */}
      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3}}>
        {periodImpacts.map((pi) => {
          const isSelected = selectedPeriod === pi.period;
          const isBlocker = pi.severity === 'Blocker';
          const isWarning = pi.severity === 'Warning';
          const borderColor = isBlocker ? planningTokens.danger : isWarning ? planningTokens.warning : planningTokens.border;
          const bg = isSelected ? `color-mix(in srgb, ${planningTokens.primaryBlue} 3%, transparent)` : planningTokens.surface;
          const Icon = isBlocker ? BlockerIcon : isWarning ? WarningIcon : OkIcon;
          const iconColor = isBlocker ? planningTokens.danger : isWarning ? planningTokens.warning : planningTokens.success;

          return (
            <Paper
              key={pi.period}
              elevation={0}
              component="button"
              onClick={() => onSelectPeriod(pi.period)}
              sx={{
                ...planningCardSx,
                bgcolor: bg,
                border: `1px solid ${isSelected ? planningTokens.primaryBlue : borderColor}`,
                p: 1.5,
                minWidth: 130,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                outline: isSelected ? `2px solid ${planningTokens.primaryBlue}` : 'none',
                outlineOffset: 2,
                '&:hover': {borderColor: planningTokens.primaryBlue},
              }}
            >
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1}}>
                <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.textPrimary}}>
                  {pi.period}
                </Typography>
                <Icon sx={{fontSize: 16, color: iconColor}} />
              </Box>

              <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.4}}>
                <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>
                  Demand: <span style={{fontWeight: 700, color: pi.demandDelta > 0 ? '#B54708' : planningTokens.textPrimary}}>{sign(pi.demandDelta)}</span>
                </Typography>
                <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>
                  Util: <span style={{fontWeight: 700, color: pi.utilizationScenario > 100 ? planningTokens.danger : planningTokens.textPrimary}}>{pi.utilizationScenario}%</span>
                </Typography>
                <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>
                  Uncovered: <span style={{fontWeight: 700, color: pi.uncoveredDelta > 0 ? planningTokens.danger : planningTokens.success}}>{pi.uncoveredDelta > 0 ? `+${pi.uncoveredDelta.toLocaleString()}` : '—'}</span>
                </Typography>
              </Box>

              <Chip
                size="small"
                label={pi.severity}
                sx={{
                  mt: 1, fontSize: 10, fontWeight: 800, height: 18,
                  bgcolor: isBlocker ? '#FEF2F2' : isWarning ? '#FFF7ED' : '#ECFDF3',
                  color: isBlocker ? planningTokens.danger : isWarning ? planningTokens.warning : planningTokens.success,
                }}
              />
            </Paper>
          );
        })}
      </Box>

      {/* Selected period detail */}
      {selectedPeriod && (() => {
        const pi = periodImpacts.find((p) => p.period === selectedPeriod);
        if (!pi) return null;
        return (
          <Paper elevation={0} sx={{...planningCardSx, p: 2}}>
            <Typography sx={{fontSize: 14, fontWeight: 900, color: planningTokens.textPrimary, mb: 1.5}}>
              {pi.period} — Detail
            </Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, 1fr)'}, gap: 2}}>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', mb: 0.5}}>Main Constraint</Typography>
                <Typography sx={{fontSize: 13, color: planningTokens.danger, fontWeight: 700}}>{pi.mainConstraint}</Typography>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', mb: 0.5}}>Readiness</Typography>
                <Typography sx={{fontSize: 13, fontWeight: 700, color: pi.readinessStatus === 'NotReady' ? planningTokens.danger : planningTokens.success}}>
                  {pi.readinessStatus === 'NotReady' ? 'Not Ready' : 'Ready'}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', mb: 0.5}}>Utilization</Typography>
                <Typography sx={{fontSize: 13, fontWeight: 700}}>
                  Baseline {pi.utilizationBaseline}% → Scenario <span style={{color: pi.utilizationScenario > 100 ? planningTokens.danger : planningTokens.textPrimary}}>{pi.utilizationScenario}%</span>
                </Typography>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', mb: 0.5}}>Affected Products</Typography>
                <Typography sx={{fontSize: 13}}>{pi.affectedProducts.join(', ') || '—'}</Typography>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', mb: 0.5}}>Affected Lines</Typography>
                <Typography sx={{fontSize: 13}}>{pi.affectedLines.join(', ') || '—'}</Typography>
              </Box>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', mb: 0.5}}>Capacity Δ</Typography>
                <Typography sx={{fontSize: 13, fontWeight: 700, color: pi.capacityDelta < 0 ? planningTokens.danger : planningTokens.textMuted}}>
                  {pi.capacityDelta !== 0 ? `${pi.capacityDelta > 0 ? '+' : ''}${pi.capacityDelta} hrs` : '—'}
                </Typography>
              </Box>
            </Box>
          </Paper>
        );
      })()}
    </Box>
  );
}
