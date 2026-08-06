import {
  tokenText,
  tokenDivider,
  tokenError,
  tokenWarning,
  tokenSuccess,
  tokenBrand,
  tokenNeutral,
} from '../workstation/theme';

/** Theme-aware color aliases for logistics screens (switch with data-theme). */
export const lx = {
  text: tokenText.primary,
  textMuted: tokenText.secondary,
  textDisabled: tokenText.disabled,
  divider: tokenDivider,
  paper: 'var(--active-theme-background-paper)',
  page: 'var(--active-theme-background-default)',
  soft: 'var(--surface-subtle-bg)',
  muted: 'var(--surface-muted-bg)',
  hover: 'var(--surface-hover-bg)',
  border: 'var(--paper-border-color)',
  chipBg: 'var(--chip-bg)',
  chipBorder: 'var(--chip-border-color)',
  accent: tokenBrand.main,
  accentSoft: tokenBrand.softBg,
  ok: tokenSuccess.main,
  okSoft: tokenSuccess.softBg,
  warn: tokenWarning.main,
  warnSoft: tokenWarning.softBg,
  danger: tokenError.main,
  dangerSoft: tokenError.softBg,
  neutralSoft: tokenNeutral.lightest,
} as const;
