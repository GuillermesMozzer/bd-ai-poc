/**
 * Inside Logistics typography — aligned to Smart Factory density
 * (widget titles ~0.92rem, page chrome compact).
 */
export const logisticsType = {
  overline: {
    fontSize: '0.6875rem',
    fontWeight: 800,
    letterSpacing: '0.08em',
    lineHeight: 1.2,
  },
  pageTitle: {
    fontSize: '1.05rem',
    fontWeight: 700,
    letterSpacing: '-0.01em',
    lineHeight: 1.3,
  },
  pageSubtitle: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  sectionTitle: {
    fontSize: '0.9rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  body: {
    fontSize: '0.8125rem',
    fontWeight: 500,
    lineHeight: 1.45,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.35,
  },
  /** Zebra RF values — readable on handheld, not oversized vs desktop app */
  rfLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    letterSpacing: '0.04em',
    lineHeight: 1.2,
  },
  rfValue: {
    fontSize: '1.125rem',
    fontWeight: 800,
    lineHeight: 1.2,
  },
  rfValueLg: {
    fontSize: '1.25rem',
    fontWeight: 900,
    lineHeight: 1.15,
  },
} as const;
