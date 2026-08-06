import React from 'react';
import {Box, Paper, Typography} from '@mui/material';
import {
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';

type KpiTone = 'neutral' | 'success' | 'warning' | 'danger';
type TrendDirection = 'up' | 'down' | 'flat';

interface KpiCardProps {
  label: string;
  value: string | number;
  tone?: KpiTone;
  trend?: TrendDirection;
  trendLabel?: string;
  subtitle?: string;
}

const toneStyles: Record<KpiTone, {border: string; accent: string; valueCx: string}> = {
  neutral: {border: 'rgba(148,163,184,0.22)', accent: '#475467', valueCx: '#1F2366'},
  success: {border: '#ABEFC6', accent: '#027A48', valueCx: '#027A48'},
  warning: {border: '#FDE68A', accent: '#B45309', valueCx: '#B45309'},
  danger: {border: '#FECDCA', accent: '#B42318', valueCx: '#B42318'},
};

export default function KpiCard({label, value, tone = 'neutral', trend, trendLabel, subtitle}: KpiCardProps) {
  const styles = toneStyles[tone];

  const TrendIcon =
    trend === 'up' ? TrendingUpIcon :
    trend === 'down' ? TrendingDownIcon :
    TrendingFlatIcon;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.8,
        borderRadius: 3,
        border: `1px solid ${styles.border}`,
        bgcolor: 'var(--planning-surface)',
        boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', lineHeight: 1.3}}>
        {label}
      </Typography>
      <Typography sx={{fontSize: 28, fontWeight: 900, color: styles.valueCx, lineHeight: 1.1}}>
        {value}
      </Typography>
      {(trend || subtitle) ? (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.4, mt: 0.2}}>
          {trend && <TrendIcon sx={{fontSize: 14, color: styles.accent}} />}
          <Typography sx={{fontSize: 11, color: styles.accent, fontWeight: 700}}>
            {trendLabel ?? subtitle ?? ''}
          </Typography>
        </Box>
      ) : null}
    </Paper>
  );
}
