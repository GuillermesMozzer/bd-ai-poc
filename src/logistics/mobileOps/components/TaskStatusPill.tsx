import React from 'react';
import { Box } from '@mui/material';

type TaskStatusPillProps = {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'attention';
};

const tones = {
  neutral: { background: '#EEF2F6', color: '#536579' },
  primary: { background: '#EAF3FB', color: '#0B5CAB' },
  success: { background: '#E8F6F1', color: '#087A5B' },
  attention: { background: '#FFF3DE', color: '#9A5600' },
} as const;

export default function TaskStatusPill({ label, tone = 'neutral' }: TaskStatusPillProps) {
  const colors = tones[tone];

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex', alignItems: 'center', minHeight: 24, px: 1, borderRadius: 99,
        bgcolor: colors.background, color: colors.color, fontSize: 11, fontWeight: 850,
        lineHeight: 1.2, whiteSpace: 'nowrap',
      }}
    >
      {label}
    </Box>
  );
}
