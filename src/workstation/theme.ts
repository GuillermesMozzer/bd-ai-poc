// ─── Design System Color Tokens (Light Mode) ─────────────────────────────────
// All colors come directly from design-system/Light.tokens.json
// Key: always use the `.main` value as the primary and `.lightest` as the soft bg.
//
// brand.*     → #1F63EA (brand.main)
// error.*     → #F44336 (error.main)
// warning.*   → #FF9800 (warning.main)
// success.*   → #66BB6A (success.main)
// info.*      → #03A9F4 (info.main)
// neutral.*   → #E9EDEF (neutral.main)

// ─── Brand (Primary) Palette ──────────────────────────────────────────────────
export const tokenBrand = {
  darkest:      'var(--token-brand-darkest)', // brand.darkest (_blue/900)
  darker:       'var(--token-brand-darker)', // brand.darker  (_blue/700)
  dark:         'var(--token-brand-dark)', // brand.dark    (_blue/600)
  main:         'var(--token-brand-main)', // brand.main    (_blue/500) ← use this
  light:        'var(--token-brand-light)', // brand.light   (_blue/400)
  lighter:      'var(--token-brand-lighter)', // brand.lighter (_blue/300)
  lightest:     'var(--token-brand-lightest)', // brand.lightest(_blue/100)
  contrast:     'var(--token-brand-contrast)',
  softBg:       'var(--token-brand-soft-bg)',
  selectedBg:   'var(--token-brand-selected-bg)',
} as const;

// ─── Error (Red) Palette ──────────────────────────────────────────────────────
export const tokenError = {
  darkest:      'var(--token-error-darkest)', // error.darkest (_red/900)
  darker:       'var(--token-error-darker)', // error.darker  (_red/700)
  dark:         'var(--token-error-dark)', // error.dark    (_red/600)
  main:         'var(--token-error-main)', // error.main    (_red/500) ← use this
  light:        'var(--token-error-light)', // error.light   (_red/400)
  lighter:      'var(--token-error-lighter)', // error.lighter (_red/300)
  lightest:     'var(--token-error-lightest)', // error.lightest(_red/100)
  contrast:     'var(--token-error-contrast)',
  softBg:       'var(--token-error-soft-bg)',
  selectedBg:   'var(--token-error-selected-bg)',
} as const;

// ─── Warning (Orange) Palette ─────────────────────────────────────────────────
export const tokenWarning = {
  darkest:      'var(--token-warning-darkest)', // warning.darkest
  darker:       'var(--token-warning-darker)', // warning.darker
  dark:         'var(--token-warning-dark)', // warning.dark   (_orange/600)
  main:         'var(--token-warning-main)', // warning.main   (_orange/500) ← use this
  light:        'var(--token-warning-light)', // warning.light  (_orange/400)
  lighter:      'var(--token-warning-lighter)', // warning.lighter(_orange/200)
  lightest:     'var(--token-warning-lightest)', // warning.lightest(_orange/100)
  contrast:     'var(--token-warning-contrast)',
  softBg:       'var(--token-warning-soft-bg)',
  selectedBg:   'var(--token-warning-selected-bg)',
} as const;

// ─── Success (Green) Palette ──────────────────────────────────────────────────
export const tokenSuccess = {
  darkest:      'var(--token-success-darkest)', // success.darkest (_green/800)
  darker:       'var(--token-success-darker)', // success.darker  (_green/600)
  dark:         'var(--token-success-dark)', // success.dark    (_green/500)
  main:         'var(--token-success-main)', // success.main    (_green/400) ← use this
  light:        'var(--token-success-light)', // success.light   (_green/400)
  lighter:      'var(--token-success-lighter)', // success.lighter (_green/300)
  lightest:     'var(--token-success-lightest)', // success.lightest(_green/100)
  contrast:     'var(--token-success-contrast)',
  softBg:       'var(--token-success-soft-bg)',
  selectedBg:   'var(--token-success-selected-bg)',
} as const;

// ─── Info (Light Blue) Palette ────────────────────────────────────────────────
export const tokenInfo = {
  darkest:      'var(--token-info-darkest)', // info.darkest (_lightBlue/900)
  darker:       'var(--token-info-darker)', // info.darker  (_lightBlue/700)
  dark:         'var(--token-info-dark)', // info.dark    (_lightBlue/600)
  main:         'var(--token-info-main)', // info.main    (_lightBlue/500) ← use this
  light:        'var(--token-info-light)', // info.light   (_lightBlue/400)
  lighter:      'var(--token-info-lighter)', // info.lighter (_lightBlue/300)
  lightest:     'var(--token-info-lightest)', // info.lightest(_lightBlue/100)
  contrast:     'var(--token-info-contrast)',
  softBg:       'var(--token-info-soft-bg)',
  selectedBg:   'var(--token-info-selected-bg)',
} as const;

// ─── Neutral (Grey) Palette ───────────────────────────────────────────────────
export const tokenNeutral = {
  darkest:      'var(--token-neutral-darkest)', // neutral.darkest (_grey/600)
  darker:       'var(--token-neutral-darker)', // neutral.darker  (_grey/500)
  dark:         'var(--token-neutral-dark)', // neutral.dark    (_grey/400)
  main:         'var(--token-neutral-main)', // neutral.main    (_grey/300) ← use this
  lighter:      'var(--token-neutral-lighter)', // neutral.lighter
  lightest:     'var(--token-neutral-lightest)', // neutral.lightest
  contrast:     'var(--token-neutral-contrast)',
} as const;

// ─── Text & Divider Tokens ────────────────────────────────────────────────────
export const tokenText = {
  primary:   'var(--token-text-primary)',   // text.primary
  secondary: 'var(--token-text-secondary)',   // text.secondary
  disabled:  'var(--token-text-disabled)',   // text.disabled
} as const;

export const tokenDivider = 'var(--token-divider)'; // divider

// ─── Common ───────────────────────────────────────────────────────────────────
export const tokenCommon = {
  white: 'var(--token-common-white)',
  black: 'var(--token-common-black)',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// WORKSTATION VISUALS  (consumed by all widget components)
// Rename mappings clearly so each key declares its token source.
// ─────────────────────────────────────────────────────────────────────────────
export const workstationVisuals = {
  fontFamily: '"Inter", "Segoe UI", sans-serif',
  pageBackground:
    'var(--visuals-page-background)',
  shellBorder: 'var(--visuals-shell-border)',
  cardBorder: 'var(--visuals-card-border)',
  cardShadow: 'var(--visuals-card-shadow)',
  cardRadius: '14px',
  denseRadius: '10px',

  // Text
  textPrimary:   'var(--visuals-text-primary)',
  textSecondary: 'var(--visuals-text-secondary)',
  textMuted:     'var(--visuals-text-muted)',

  // Semantic colors — all from Light tokens
  blue:       tokenBrand.main,        // #1F63EA  brand.main
  blueSoft:   tokenBrand.softBg,      // rgba(31,99,234,0.08)
  cyan:       tokenSuccess.main,      // #66BB6A  success.main
  cyanSoft:   tokenSuccess.softBg,    // rgba(102,187,106,0.08)
  amber:      tokenWarning.main,      // #FF9800  warning.main
  amberSoft:  tokenWarning.softBg,    // rgba(255,152,0,0.08)
  rose:       tokenError.main,        // #F44336  error.main
  roseSoft:   tokenError.softBg,      // rgba(244,67,54,0.08)
  violet:     tokenInfo.main,         // #03A9F4  info.main
  violetSoft: tokenInfo.softBg,       // rgba(3,169,244,0.08)

  // Surfaces
  slateSurface:     tokenNeutral.lightest,  // #F8FAFC
  darkSurface:      'var(--visuals-dark-surface)',
  darkSurfaceAlt:   'var(--visuals-dark-surface-alt)',

  // Tier card design system
  tierBorder:            'var(--visuals-tier-border)',                    // #E2E8F0 (light and clean)
  tierSurface:           'var(--visuals-tier-surface)',            // #FFFFFF
  tierSurfaceSoft:       'var(--visuals-tier-surface-soft)',
  tierSurfaceMuted:      'var(--visuals-tier-surface-muted)',
  tierPanelBackground:   'var(--visuals-tier-panel-bg)',                    // Solid white surface
  tierShadow:            'var(--visuals-tier-shadow)', // Extremely subtle shadow
  tierTextHeading:       'var(--visuals-tier-text-heading)',
  tierTextLabel:         'var(--visuals-tier-text-label)',
  tierTextMeta:          'var(--visuals-tier-text-meta)',
  tierTextMuted:         'var(--token-neutral-darkest)',         // #9D9FA2
  tierAxis:              'var(--visuals-tier-axis)',
  tierGrid:              'var(--visuals-tier-grid)',
  tierGridSoft:          'var(--visuals-tier-grid-soft)',
  tierDash:              'var(--token-neutral-dark)',            // #DBDDDF
} as const;

// ─── Chart Semantic Colors ────────────────────────────────────────────────────
// All chart status colors sourced from Light tokens
export const workstationChartSemantic = {
  // ✅ Good / Success / Running
  good:         tokenSuccess.main,       // #66BB6A  success.main
  goodDark:     tokenSuccess.darker,     // #43A047  success.darker
  goodSoft:     tokenSuccess.softBg,     // rgba(102,187,106,0.08)
  goodBg:       tokenSuccess.lightest,   // #C8E6C9  success.lightest

  // ❌ Bad / Error / Overdue / Down
  bad:          tokenError.main,         // #F44336  error.main
  badDark:      tokenError.dark,         // #E53935  error.dark
  badSoft:      tokenError.softBg,       // rgba(244,67,54,0.08)
  badBg:        tokenError.lightest,     // #FECDD2  error.lightest

  // ⚠️ Warning / At Risk / Idle
  warn:         tokenWarning.main,       // #FF9800  warning.main
  warnDark:     tokenWarning.dark,       // #FB8C00  warning.dark
  warnSoft:     tokenWarning.softBg,     // rgba(255,152,0,0.08)
  warnBg:       tokenWarning.lightest,   // #FFE0B2  warning.lightest

  // ℹ️ Info / Neutral Action / Active Lines
  neutral:      tokenBrand.main,         // #1F63EA  brand.main
  neutralSoft:  tokenBrand.softBg,       // rgba(31,99,234,0.08)
  neutralBg:    tokenBrand.lightest,     // #94D5FF  brand.lightest

  // ─ Target / Offline / Setup
  target:       tokenNeutral.main,       // #E9EDEF  neutral.main
  targetLine:   tokenNeutral.darkest,    // #9D9FA2  neutral.darkest

  // Legacy aliases (kept for backward compat with existing consumers)
  goodSoftLegacy:    'var(--chart-legacy-good-soft)',
  badSoftLegacy:     'var(--chart-legacy-bad-soft)',
  neutralSoftLegacy: 'var(--chart-legacy-neutral-soft)',
} as const;

// ─── Priority / Status Tone Helpers ──────────────────────────────────────────
// Consistent pill/badge tones for priority labels across all widgets.
export const workstationPriorityTone = {
  High: {
    bg:     'var(--priority-high-bg)',    // #FECDD2
    color:  'var(--priority-high-color)',        // #E53935
    border: 'var(--priority-high-border)',     // #E57373
  },
  Medium: {
    bg:     'var(--priority-medium-bg)',  // #FFE0B2
    color:  'var(--priority-medium-color)',      // #FB8C00
    border: 'var(--priority-medium-border)',   // #FFCC80
  },
  Low: {
    bg:     'var(--priority-low-bg)',  // #C8E6C9
    color:  'var(--priority-low-color)',    // #43A047
    border: 'var(--priority-low-border)',   // #81C784
  },
} as const;

// ─── Timeline / Gantt Bar Colors ──────────────────────────────────────────────
// For machine availability, shift schedule, and Gantt-style status bars.
export const workstationTimelineTone = {
  running:  tokenSuccess.main,       // #66BB6A  success.main
  idle:     tokenWarning.main,       // #FF9800  warning.main
  down:     tokenError.main,         // #F44336  error.main
  offline:  tokenNeutral.main,       // #E9EDEF  neutral.main
  setup:    tokenNeutral.darker,     // #BBBEC1  neutral.darker
} as const;

// ─── SQDCP Domain Badge Colors ────────────────────────────────────────────────
export const workstationSqdcpTone = {
  S: { color: tokenSuccess.darker,  softBg: tokenSuccess.softBg,  label: 'Safety'   },
  Q: { color: tokenError.main,      softBg: tokenError.softBg,    label: 'Quality'  },
  D: { color: tokenBrand.main,      softBg: tokenBrand.softBg,    label: 'Delivery' },
  C: { color: tokenWarning.dark,    softBg: tokenWarning.softBg,  label: 'Cost'     },
  P: { color: tokenInfo.main,       softBg: tokenInfo.softBg,     label: 'People'   },
} as const;

export function getTargetComparisonColor(actual: number, target: number, higherBetter = true) {
  const meetsTarget = higherBetter ? actual >= target : actual <= target;
  return meetsTarget ? workstationChartSemantic.good : workstationChartSemantic.bad;
}

export const workstationTierCardSx = {
  bgcolor: workstationVisuals.tierSurface,
  backgroundImage: workstationVisuals.tierPanelBackground,
  border: `1px solid ${workstationVisuals.tierBorder}`,
  borderRadius: 2.6,
  boxShadow: workstationVisuals.tierShadow,
} as const;

export const workstationTierInsetCardSx = {
  bgcolor: workstationVisuals.tierSurface,
  border: `1px solid ${workstationVisuals.tierBorder}`,
  borderRadius: 2.3,
} as const;

/**
 * @legacy — only used by the remaining @mui/x-charts components during Recharts migration.
 * New widgets should use workstationRechartsTheme instead.
 */
export const workstationTierChartSx = {
  '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': {stroke: workstationVisuals.tierAxis},
  '& .MuiChartsGrid-line': {stroke: workstationVisuals.tierGrid, strokeDasharray: '3 3'},
  '& .MuiLineElement-root': {strokeWidth: 2.5},
  '& .MuiMarkElement-root': {display: 'none'},
  '& .MuiBarElement-root': {rx: 3, ry: 3},
} as const;

// ─── Shared Widget Title Typography ──────────────────────────────────────────
export const workstationWidgetTitleSx = {
  fontSize: '0.92rem',
  fontWeight: 600,
  color: workstationVisuals.textPrimary,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.2,
} as const;

// ─── Custom Badge & Action Button Styling (Clean Design) ─────────────────────
export const workstationSoftBadgeSx = {
  px: 1,
  py: 0.25,
  borderRadius: '9999px',
  bgcolor: 'var(--token-brand-soft-bg)',
  color: 'var(--token-brand-main)',
  fontSize: '0.72rem',
  fontWeight: 600,
  border: '1px solid var(--token-brand-selected-bg)',
  display: 'inline-flex',
  alignItems: 'center',
} as const;

export const workstationOutlinedBadgeSx = {
  px: 1,
  py: 0.25,
  borderRadius: '9999px',
  bgcolor: 'transparent',
  color: 'var(--token-brand-main)',
  fontSize: '0.72rem',
  fontWeight: 600,
  border: '1px solid var(--button-outlined-border)',
  display: 'inline-flex',
  alignItems: 'center',
} as const;

export const workstationStatusPillSx = (severity: 'warning' | 'neutral' | 'success') => {
  if (severity === 'warning') {
    return {
      px: 1,
      py: 0.25,
      borderRadius: '9999px',
      bgcolor: 'var(--status-warning-bg)',
      color: 'var(--token-warning-main)',
      fontSize: '0.72rem',
      fontWeight: 600,
      border: '1px solid var(--status-warning-border)',
      display: 'inline-flex',
      alignItems: 'center',
    } as const;
  }
  if (severity === 'success') {
    return {
      px: 1,
      py: 0.25,
      borderRadius: '9999px',
      bgcolor: 'var(--status-success-bg)',
      color: 'var(--token-success-main)',
      fontSize: '0.72rem',
      fontWeight: 600,
      border: '1px solid var(--status-success-border)',
      display: 'inline-flex',
      alignItems: 'center',
    } as const;
  }
  return {
    px: 1,
    py: 0.25,
    borderRadius: '9999px',
    bgcolor: 'var(--status-neutral-bg)',
    color: 'var(--visuals-text-primary)',
    fontSize: '0.72rem',
    fontWeight: 600,
    border: '1px solid var(--status-neutral-border)',
    display: 'inline-flex',
    alignItems: 'center',
  } as const;
};

export const workstationActionButtonSx = {
  width: '100%',
  py: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1,
  bgcolor: 'var(--visuals-tier-surface)',
  color: 'var(--visuals-text-primary)',
  fontSize: '0.78rem',
  fontWeight: 600,
  border: '1px solid var(--paper-border-color)',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: 'var(--surface-hover-bg)',
    borderColor: 'var(--status-neutral-border)',
  },
} as const;

export const workstationTableSx = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.82rem',
  fontFamily: workstationVisuals.fontFamily,
} as const;

export const workstationTableHeaderCellSx = {
  py: 1,
  px: 0.5,
  fontSize: '0.72rem',
  fontWeight: 600,
  color: workstationVisuals.textSecondary,
  textAlign: 'left',
} as const;

export const workstationTableCellSx = {
  py: 1.25,
  px: 0.5,
  color: workstationVisuals.textPrimary,
  borderBottom: '1px solid var(--token-divider)',
} as const;


// ─── Recharts Shared Theme ────────────────────────────────────────────────────
export const workstationRechartsTheme = {
  axisTickStyle: {
    fill: workstationVisuals.tierAxis,
    fontSize: 10,
    fontFamily: workstationVisuals.fontFamily,
    fontWeight: 600,
  },
  gridColor: workstationVisuals.tierGridSoft,
  gridDash: '3 3',
  tooltipContentStyle: {
    backgroundColor: workstationVisuals.tierSurface,
    borderRadius: '8px',
    border: `1px solid ${workstationVisuals.tierBorder}`,
    boxShadow: workstationVisuals.tierShadow,
    fontSize: '0.75rem',
    fontFamily: workstationVisuals.fontFamily,
    padding: '6px 10px',
  },
  tooltipLabelStyle: {
    color: workstationVisuals.tierTextHeading,
    fontWeight: 700,
    fontSize: '0.75rem',
    fontFamily: workstationVisuals.fontFamily,
  },
  tooltipItemStyle: {
    color: workstationVisuals.tierTextLabel,
    fontSize: '0.72rem',
    fontFamily: workstationVisuals.fontFamily,
  },
  axisProps: {
    axisLine: false as const,
    tickLine: false as const,
  },
} as const;
