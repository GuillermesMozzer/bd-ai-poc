import type { KeyboardEvent } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

/** Visible keyboard focus ring (WCAG 2.4.7 Focus Visible). */
export const focusVisibleSx: SxProps<Theme> = {
  '&:focus-visible': {
    outline: '3px solid #044ED7',
    outlineOffset: 2,
  },
};

/** Dark-theme focus ring for SpaceX / Zebra surfaces. */
export const focusVisibleOnDarkSx: SxProps<Theme> = {
  '&:focus-visible': {
    outline: '3px solid #7EB6FF',
    outlineOffset: 2,
  },
};

/** Honor prefers-reduced-motion (WCAG 2.3.3). */
export const reducedMotionSx: SxProps<Theme> = {
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none !important',
    transition: 'none !important',
  },
};

/** Minimum touch / pointer target guidance (WCAG 2.5.5 / AAA-friendly 44px). */
export const touchTargetSx: SxProps<Theme> = {
  minHeight: 44,
  minWidth: 44,
};

/** Activate a control with Enter or Space (WCAG 2.1.1 Keyboard). */
export function onActivateKey(event: KeyboardEvent, action: () => void) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    action();
  }
}

/** High-contrast risk chip styles (WCAG 1.4.3 / 1.4.11). */
export const riskChipSx: Record<string, { bgcolor: string; color: string }> = {
  critical: { bgcolor: '#B71C1C', color: '#FFFFFF' },
  high: { bgcolor: '#C2410C', color: '#FFFFFF' },
  medium: { bgcolor: '#F59E0B', color: '#1A1A1A' },
  low: { bgcolor: '#1B5E20', color: '#FFFFFF' },
};

export function gateStatusLabel(light: 'GREEN' | 'YELLOW' | 'RED' | string): string {
  if (light === 'GREEN') return 'Pass';
  if (light === 'YELLOW') return 'Caution';
  if (light === 'RED') return 'Blocked';
  return String(light);
}
