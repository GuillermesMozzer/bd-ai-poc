import {Box, Paper, Typography} from '@mui/material';
import {NorthEast as TrendIcon} from '@mui/icons-material';
import type {TierMeetingKPI} from '../types';

type TierMeetingKpiCardProps = {
  kpi: TierMeetingKPI;
};

const positiveKeywords = ['compliance', 'rft', 'adherence'];

function parseNumericValue(value: string) {
  const normalized = value.replace(/,/g, '').replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function isHigherBetter(kpi: TierMeetingKPI) {
  const label = kpi.label.toLowerCase();
  if (positiveKeywords.some((keyword) => label.includes(keyword))) return true;
  return kpi.value.includes('%') && (kpi.target ?? '').includes('%');
}

function getKpiHealth(kpi: TierMeetingKPI) {
  const current = parseNumericValue(kpi.value);
  const target = parseNumericValue(kpi.target ?? '');

  if (current === null || target === null) {
    return {accent: '#7AD36B', belowTarget: false};
  }

  const higherBetter = isHigherBetter(kpi);
  const belowTarget = higherBetter ? current < target : current > target;

  return {
    accent: belowTarget ? '#FF5A52' : '#7AD36B',
    belowTarget,
  };
}

export default function TierMeetingKpiCard({kpi}: TierMeetingKpiCardProps) {
  const health = getKpiHealth(kpi);

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        minHeight: {xs: 66, xl: 80},
        pt: {xs: 0.8, xl: 1.1},
        pr: {xs: 0.9, xl: 1.25},
        pb: {xs: 0.55, xl: 0.7},
        pl: {xs: 1.45, xl: 2.1},
        borderRadius: 2.8,
        overflow: 'hidden',
        bgcolor: '#FFFFFF',
        border: '1px solid #DBDDDF',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.45,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: {xs: 4, xl: 6},
          bgcolor: health.accent,
        }}
      />

      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
          <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.3}}>
            <Typography sx={{fontSize: {xs: '0.9rem', md: '0.92rem', lg: '0.98rem', xl: '1.65rem'}, lineHeight: 1, fontWeight: 900, color: health.accent}}>
              {kpi.value}
            </Typography>
            {kpi.note ? (
              <Typography sx={{fontSize: {xs: '0.5rem', md: '0.52rem', xl: '0.82rem'}, fontWeight: 800, color: '#6F7787'}}>
                {kpi.note}
              </Typography>
            ) : null}
          </Box>
          <TrendIcon sx={{fontSize: {xs: 11, md: 12, xl: 18}, color: health.accent, mt: 0.1}} />
        </Box>
        <Box sx={{textAlign: 'right'}}>
          <Typography sx={{fontSize: {xs: '0.46rem', md: '0.48rem', xl: '0.72rem'}, fontWeight: 800, color: '#6F7787', letterSpacing: '0.05em'}}>
            TARGET {kpi.target ?? '-'}
          </Typography>
        </Box>
      </Box>

      <Typography sx={{fontSize: {xs: '0.58rem', md: '0.6rem', xl: '0.95rem'}, fontWeight: 800, color: '#626465', letterSpacing: '0.03em', lineHeight: 1.15}}>
        {kpi.label.toUpperCase()}
      </Typography>
    </Paper>
  );
}
