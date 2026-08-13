import React from 'react';
import { Box } from '@mui/material';

type TaskStatusPillProps = {
  label: string;
  tone?: 'neutral' | 'primary' | 'success' | 'attention';
};

const tones = {
  neutral: { background: 'var(--surface-subtle-bg)', color: 'var(--active-theme-text-secondary)' },
  primary: { background: 'var(--token-brand-soft-bg)', color: 'var(--token-brand-main)' },
  success: { background: 'var(--token-success-soft-bg)', color: 'var(--token-success-main)' },
  attention: { background: 'var(--token-warning-soft-bg)', color: 'var(--token-warning-dark)' },
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
