import { Box, Chip, Tooltip } from '@mui/material';
import { useMemo } from 'react';
import { tokenDivider, tokenText } from '../../../workstation/theme';
import {
  getHealthChipLabel,
  getPartsChipLabel,
  getPartsTone,
  getPlannerCardSignals,
} from '../../ai/plannerCardSignals';
import {
  buildPlannerWoReadiness,
  getReadinessScoreTone,
} from '../../ai/plannerWoReadiness';
import { PlannerWoReadinessTooltipContent } from './PlannerWoReadinessTooltipContent';

type CalendarWorkCardSignalChipsProps = {
  assetTitle: string;
  assigneeName?: string;
  tags?: string[];
};

function getHealthChipStyles(tone: NonNullable<ReturnType<typeof getPlannerCardSignals>['health']>['tone']) {
  switch (tone) {
    case 'critical':
      return { bg: '#FEF2F2', border: '#FECACA', color: '#B91C1C' };
    case 'warning':
      return { bg: '#FFF7ED', border: '#FED7AA', color: '#C2410C' };
    case 'caution':
      return { bg: '#FFFBEB', border: '#FDE68A', color: '#B45309' };
    case 'healthy':
      return { bg: '#ECFDF3', border: '#BBF7D0', color: '#166534' };
    default:
      return { bg: '#F8FAFC', border: tokenDivider, color: tokenText.secondary };
  }
}

function getPartsChipStyles(tone: ReturnType<typeof getPartsTone>) {
  switch (tone) {
    case 'ready':
      return { bg: '#ECFDF3', border: '#BBF7D0', color: '#166534' };
    case 'warning':
      return { bg: '#FFFBEB', border: '#FDE68A', color: '#B45309' };
    case 'blocked':
      return { bg: '#FEF2F2', border: '#FECACA', color: '#B91C1C' };
    default:
      return { bg: '#F8FAFC', border: tokenDivider, color: tokenText.secondary };
  }
}

function getReadinessChipStyles(tone: ReturnType<typeof getReadinessScoreTone>) {
  switch (tone) {
    case 'ready':
      return { bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8' };
    case 'warning':
      return { bg: '#FFFBEB', border: '#FDE68A', color: '#B45309' };
    case 'blocked':
      return { bg: '#FEF2F2', border: '#FECACA', color: '#B91C1C' };
  }
}

export function CalendarWorkCardSignalChips({
  assetTitle,
  assigneeName,
  tags = [],
}: CalendarWorkCardSignalChipsProps) {
  const signals = useMemo(() => getPlannerCardSignals(assetTitle, tags), [assetTitle, tags]);
  const readiness = useMemo(
    () => buildPlannerWoReadiness(assetTitle, { assigneeName, tags }),
    [assetTitle, assigneeName, tags],
  );
  const healthStyles = signals.health ? getHealthChipStyles(signals.health.tone) : null;
  const partsStyles = getPartsChipStyles(getPartsTone(signals.parts.status));
  const readinessStyles = getReadinessChipStyles(getReadinessScoreTone(readiness.overallScore));

  return (
    <Box sx={{ mt: 0.55, display: 'flex', alignItems: 'center', gap: 0.45, flexWrap: 'wrap' }}>
      <Tooltip
        title={<PlannerWoReadinessTooltipContent breakdown={readiness} />}
        arrow
        placement="top"
        slotProps={{
          tooltip: {
            sx: {
              bgcolor: 'background.paper',
              color: tokenText.primary,
              border: `1px solid ${tokenDivider}`,
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
              p: 1,
              maxWidth: 320,
            },
          },
        }}
      >
        <Chip
          size="small"
          label={`Ready ${readiness.overallScore}%`}
          sx={{
            height: 18,
            borderRadius: 99,
            bgcolor: readinessStyles.bg,
            color: readinessStyles.color,
            border: `1px solid ${readinessStyles.border}`,
            fontSize: '0.58rem',
            fontWeight: 800,
            '& .MuiChip-label': { px: 0.65 },
          }}
        />
      </Tooltip>
      {signals.health && healthStyles ? (
        <Tooltip title={signals.health.summary} arrow placement="top">
          <Chip
            size="small"
            label={getHealthChipLabel(signals.health)}
            sx={{
              height: 18,
              borderRadius: 99,
              bgcolor: healthStyles.bg,
              color: healthStyles.color,
              border: `1px solid ${healthStyles.border}`,
              fontSize: '0.58rem',
              fontWeight: 800,
              '& .MuiChip-label': { px: 0.65 },
            }}
          />
        </Tooltip>
      ) : null}
      <Tooltip title={`${signals.parts.summary} ${signals.parts.detail}`} arrow placement="top">
        <Chip
          size="small"
          label={getPartsChipLabel(signals.parts.status)}
          sx={{
            height: 18,
            borderRadius: 99,
            bgcolor: partsStyles.bg,
            color: partsStyles.color,
            border: `1px solid ${partsStyles.border}`,
            fontSize: '0.58rem',
            fontWeight: 800,
            '& .MuiChip-label': { px: 0.65 },
          }}
        />
      </Tooltip>
    </Box>
  );
}
