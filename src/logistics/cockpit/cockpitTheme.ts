/** CoreSight-inspired control room tokens — scoped to Logistics CT cockpit only. */
export const ct = {
  bg: '#0c0e12',
  bgElevated: '#14181f',
  bgCard: '#1a1f29',
  bgCardHover: '#222836',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  text: '#f3f5f8',
  textMuted: '#8b93a7',
  textDim: '#5c6578',
  accent: '#2dd4bf',
  accentSoft: 'rgba(45,212,191,0.12)',
  ok: '#22c55e',
  okSoft: 'rgba(34,197,94,0.15)',
  warn: '#f59e0b',
  warnSoft: 'rgba(245,158,11,0.15)',
  danger: '#ef4444',
  dangerSoft: 'rgba(239,68,68,0.18)',
  bannerBg: 'rgba(239,68,68,0.22)',
  font: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, monospace',
} as const;

export type CtTone = 'ok' | 'warn' | 'danger' | 'neutral';

export const toneColor = (tone: CtTone) => {
  if (tone === 'ok') return ct.ok;
  if (tone === 'warn') return ct.warn;
  if (tone === 'danger') return ct.danger;
  return ct.textMuted;
};
