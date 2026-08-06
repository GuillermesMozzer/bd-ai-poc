import React from 'react';
import { Chip } from '@mui/material';
import { humanize, slaTone, severityTone, type KpiTone } from '../utils';
import { lx } from '../themeTokens';

const toneSx: Record<KpiTone, { bg: string; color: string; border: string }> = {
  default: { bg: lx.chipBg, color: lx.text, border: lx.chipBorder },
  ok: { bg: lx.okSoft, color: lx.ok, border: 'rgba(16,185,129,0.35)' },
  warn: { bg: lx.warnSoft, color: lx.warn, border: 'rgba(245,158,11,0.35)' },
  danger: { bg: lx.dangerSoft, color: lx.danger, border: 'rgba(239,68,68,0.35)' },
};

type StatusPillProps = {
  label: string;
  tone?: KpiTone;
  size?: 'small' | 'medium';
};

export function StatusPill({ label, tone = 'default', size = 'small' }: StatusPillProps) {
  const styles = toneSx[tone];
  return (
    <Chip
      size={size}
      label={humanize(label)}
      sx={{
        height: size === 'small' ? 22 : 26,
        fontWeight: 700,
        fontSize: 11,
        textTransform: 'capitalize',
        bgcolor: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        '& .MuiChip-label': { px: 1 },
      }}
    />
  );
}

export function SlaPill({ status }: { status: string }) {
  return <StatusPill label={status} tone={slaTone(status)} />;
}

export function SeverityPill({ severity }: { severity: string }) {
  return <StatusPill label={severity} tone={severityTone(severity)} />;
}
