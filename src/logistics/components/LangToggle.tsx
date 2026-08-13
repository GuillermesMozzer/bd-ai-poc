import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { LOGISTICS_ACCENT } from '../constants';
import { lx } from '../themeTokens';

export type LangMode = 'en' | 'es' | 'both';

type LangToggleProps = {
  value: LangMode;
  onChange: (value: LangMode) => void;
};

export default function LangToggle({ value, onChange }: LangToggleProps) {
  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={(_, next) => {
        if (next) onChange(next);
      }}
      sx={{
        bgcolor: 'background.paper',
        '& .MuiToggleButton-root': {
          textTransform: 'none',
          fontWeight: 700,
          px: 1.2,
          py: 0.3,
          borderColor: lx.border,
          color: lx.textMuted,
          '&.Mui-selected': {
            bgcolor: LOGISTICS_ACCENT,
            color: '#fff',
            borderColor: LOGISTICS_ACCENT,
            '&:hover': { bgcolor: 'var(--token-brand-dark)' },
          },
        },
      }}
    >
      <ToggleButton value="en">EN</ToggleButton>
      <ToggleButton value="es">ES</ToggleButton>
      <ToggleButton value="both">EN+ES</ToggleButton>
    </ToggleButtonGroup>
  );
}

export function t(mode: LangMode, en: string, es: string): string {
  if (mode === 'es') return es;
  if (mode === 'both') return `${en} / ${es}`;
  return en;
}
