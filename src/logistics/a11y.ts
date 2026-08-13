import type { KeyboardEvent } from 'react';
import type { SxProps, Theme } from '@mui/material/styles';

/** Visible keyboard focus ring (WCAG 2.4.7 Focus Visible). */
export const focusVisibleSx: SxProps<Theme> = {
  '&:focus-visible': {
    outline: '3px solid var(--token-brand-main)',
    outlineOffset: 2,
  },
};

/** Alternate focus ring (kept for compatibility; same token-aware ring). */
export const focusVisibleOnDarkSx: SxProps<Theme> = {
  '&:focus-visible': {
    outline: '3px solid var(--token-brand-light)',
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

/** High-contrast risk chip styles (WCAG 1.4.3 / 1.4.11) — theme tokens. */
export const riskChipSx: Record<string, { bgcolor: string; color: string }> = {
  critical: { bgcolor: 'var(--token-error-darkest)', color: 'var(--token-common-white)' },
  high: { bgcolor: 'var(--token-warning-dark)', color: 'var(--token-common-white)' },
  medium: { bgcolor: 'var(--token-warning-main)', color: 'var(--token-common-black)' },
  low: { bgcolor: 'var(--token-success-darkest)', color: 'var(--token-common-white)' },
};

export function gateStatusLabel(light: 'GREEN' | 'YELLOW' | 'RED' | string): string {
  if (light === 'GREEN') return 'Pass';
  if (light === 'YELLOW') return 'Caution';
  if (light === 'RED') return 'Blocked';
  return String(light);
}
