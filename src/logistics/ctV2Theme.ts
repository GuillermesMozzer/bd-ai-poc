/**
 * Logistics Control Tower V2 visual tokens.
 * Mirrors Operator View / Atlas AI (workstation design system) — theme-aware via CSS vars.
 */
export {
  tokenBrand,
  tokenError,
  tokenWarning,
  tokenSuccess,
  tokenInfo,
  tokenNeutral,
  tokenText,
  tokenDivider,
  tokenCommon,
  workstationVisuals,
  workstationTierCardSx,
  workstationTierInsetCardSx,
  workstationWidgetTitleSx,
} from '../workstation/theme';

export const ctV2Type = {
  eyebrow: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  pageTitle: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    fontSize: { xs: 22, md: 26 },
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1.15,
  },
  pageSubtitle: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.35,
  },
  sectionTitle: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    fontSize: '0.92rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  body: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.4,
  },
  caption: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    fontSize: 11,
    fontWeight: 600,
    lineHeight: 1.35,
  },
  mono: {
    fontFamily: '"Inter", "Segoe UI", sans-serif',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
} as const;
