import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import type { KpiTone } from '../utils';
import { lx } from '../themeTokens';

export type KpiItem = {
  label: string;
  value: React.ReactNode;
  tone?: KpiTone;
  helper?: React.ReactNode;
};

const toneStyles: Record<KpiTone, { border: string; value: string; bg: string }> = {
  default: { border: lx.border, value: lx.text, bg: 'var(--active-theme-background-paper)' },
  ok: { border: 'rgba(16,185,129,0.35)', value: lx.ok, bg: lx.okSoft },
  warn: { border: 'rgba(245,158,11,0.35)', value: lx.warn, bg: lx.warnSoft },
  danger: { border: 'rgba(239,68,68,0.35)', value: lx.danger, bg: lx.dangerSoft },
};

export default function KpiRow({ items }: { items: KpiItem[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          sm: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(6, minmax(0, 1fr))',
        },
        gap: 1.5,
        mb: 2,
      }}
    >
      {items.map((item) => {
        const tone = toneStyles[item.tone ?? 'default'];
        return (
          <Paper
            key={item.label}
            elevation={0}
            sx={{
              p: 1.6,
              borderRadius: 2,
              border: `1px solid ${tone.border}`,
              bgcolor: tone.bg,
              minHeight: 92,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: tone.value, lineHeight: 1.1 }}>
              {item.value}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: lx.textMuted, fontWeight: 700, display: 'block', mt: 0.6 }}
            >
              {item.label}
            </Typography>
            {item.helper ? (
              <Box sx={{ mt: 0.8, color: lx.textMuted, fontSize: 12 }}>{item.helper}</Box>
            ) : null}
          </Paper>
        );
      })}
    </Box>
  );
}
