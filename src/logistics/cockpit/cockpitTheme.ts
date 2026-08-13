import {
  tokenBrand,
  tokenError,
  tokenSuccess,
  tokenText,
  tokenWarning,
  workstationVisuals,
} from '../../workstation/theme';

/**
 * Logistics cockpit tokens — follow app light/dark via CSS variables.
 * Consumers (KpiDrilldownModal, CockpitCards, CT V1) inherit theme automatically.
 */
export const ct = {
  bg: 'var(--active-theme-background-default)',
  bgElevated: 'var(--active-theme-background-paper)',
  bgCard: 'var(--surface-subtle-bg)',
  bgCardHover: 'var(--surface-hover-bg)',
  border: 'var(--paper-border-color)',
  borderStrong: 'var(--chip-border-color)',
  text: 'var(--active-theme-text-primary)',
  textMuted: 'var(--active-theme-text-secondary)',
  textDim: 'var(--token-text-disabled)',
  accent: 'var(--active-theme-secondary)',
  accentSoft: 'var(--token-info-soft-bg)',
  ok: tokenSuccess.main,
  okSoft: tokenSuccess.softBg,
  warn: tokenWarning.main,
  warnSoft: tokenWarning.softBg,
  danger: tokenError.main,
  dangerSoft: tokenError.softBg,
  escalated: 'var(--token-brand-lighter)',
  escalatedSoft: tokenBrand.softBg,
  bannerBg: tokenError.softBg,
  font: workstationVisuals.fontFamily,
  mono: 'ui-monospace, "SFMono-Regular", Menlo, Monaco, Consolas, monospace',
} as const;

export type CtTone = 'ok' | 'warn' | 'danger' | 'neutral';

export const toneColor = (tone: CtTone) => {
  if (tone === 'ok') return ct.ok;
  if (tone === 'warn') return ct.warn;
  if (tone === 'danger') return ct.danger;
  return ct.textMuted;
};
