// ── Radix DS alignment notes ─────────────────────────────────────────────────
// brand/main (Light): #1f63ea        → primaryBlue
// borderRadius/Medium 12px           → MUI sx: borderRadius: 3
// borderRadius/xSmall  6px           → MUI sx: borderRadius: 1.5
// elevation/2                        → softShadow
// elevation/3                        → shadow
// elevation/5                        → outerShadow
// Tokens marked ⚠ [mismatch] have no direct DS semantic equivalent.

export const planningTokens = {
  // Backgrounds — background/paper-elevation-0 & 1
  background: 'var(--planning-background)',
  backgroundAlt: 'var(--planning-background-alt)',
  surface: 'var(--planning-surface)',
  surfaceMuted: 'var(--planning-surface-muted)',

  // Brand — brand/main (Light), project-specific navy variant
  primaryNavy: 'var(--planning-primary-navy)',       // dark brand variant (project-specific, no DS token)
  primaryNavyAlt: 'var(--planning-primary-navy-alt)',
  primaryBlue: 'var(--planning-primary-blue)',       // brand/main Light  [was #1769FF]
  primaryBlueAlt: 'var(--planning-primary-blue-alt)',    // brand/states/hover  [was #1D6BFF]

  // Text
  textPrimary: 'var(--planning-text-primary)',       // text/primary (project-specific navy tint)
  textSecondary: 'var(--planning-text-secondary)',     // text/secondary
  textMuted: 'var(--planning-text-muted)',         // text/disabled

  // Divider
  border: 'var(--planning-border)',

  // Feedback — success/main, warning/main, error/main
  success: 'var(--planning-success)',
  warning: 'var(--planning-warning)',
  danger: 'var(--planning-danger)',
  successActive: 'var(--planning-success-active)',     // active status indicator (pulse dot)

  // Status light backgrounds — semantic alpha/light variants
  successBg: 'var(--planning-success-bg)',
  successBorder: 'var(--planning-success-border)',
  warningBg: 'var(--planning-warning-bg)',
  warningBorder: 'var(--planning-warning-border)',
  dangerBg: 'var(--planning-danger-bg)',
  dangerBorder: 'var(--planning-danger-border)',
  neutralBg: 'var(--planning-neutral-bg)',         // info/light
  neutralBorder: 'var(--planning-neutral-border)',
  neutralBgAlt: 'var(--planning-neutral-bg-alt)',      // deeper info/light gradient stop

  // Aliases kept for backward-compatibility with other modules
  neutral: 'var(--planning-primary-blue)',           // alias → primaryBlue (brand/main)
  purpleHighlight: 'var(--planning-ai-accent-bg)',   // alias → aiAccentBg

  // ⚠ [mismatch] AI/purple accent — no DS semantic token for indigo/violet
  aiAccent: 'var(--planning-ai-accent)',
  aiAccentBg: 'var(--planning-ai-accent-bg)',
  aiAccentBorder: 'var(--planning-ai-accent-border)',

  // ⚠ [mismatch] Amber/yellow — no DS amber semantic token
  warningAmber: 'var(--planning-warning-amber)',
  warningAmberBg: 'var(--planning-warning-amber-bg)',
  warningAmberDark: 'var(--planning-warning-amber-dark)',

  // Neutral draft/superseded states
  draftBg: 'var(--planning-draft-bg)',
  draftBorder: 'var(--planning-draft-border)',

  // Elevation — DS elevation/2, /3, /5
  softShadow: 'var(--planning-soft-shadow)',
  shadow: 'var(--planning-shadow)',
  outerShadow: 'var(--planning-outer-shadow)',

  topBarHeight: 72,
} as const;

export const planningStatusTones = {
  Feasible:         {bg: planningTokens.successBg,    color: planningTokens.success,       border: planningTokens.successBorder},
  AtRisk:           {bg: planningTokens.warningBg,    color: planningTokens.warning,       border: planningTokens.warningBorder},
  Constrained:      {bg: planningTokens.dangerBg,     color: planningTokens.danger,        border: planningTokens.dangerBorder},
  PendingData:      {bg: planningTokens.neutralBg,    color: planningTokens.primaryBlue,   border: planningTokens.neutralBorder},
  NotProducible:    {bg: planningTokens.dangerBg,     color: planningTokens.danger,        border: planningTokens.dangerBorder},
  RequiresDecision: {bg: planningTokens.aiAccentBg,   color: planningTokens.aiAccent,      border: planningTokens.aiAccentBorder},
  Draft:            {bg: planningTokens.draftBg,      color: planningTokens.textSecondary, border: planningTokens.draftBorder},
  Imported:         {bg: planningTokens.neutralBg,    color: planningTokens.primaryBlue,   border: planningTokens.neutralBorder},
  Validated:        {bg: planningTokens.successBg,    color: planningTokens.success,       border: planningTokens.successBorder},
  CapacityReviewed: {bg: planningTokens.aiAccentBg,   color: planningTokens.aiAccent,      border: planningTokens.aiAccentBorder},
  Adjusted:         {bg: planningTokens.aiAccentBg,   color: planningTokens.aiAccent,      border: planningTokens.aiAccentBorder},
  Released:         {bg: planningTokens.successBg,    color: planningTokens.success,       border: planningTokens.successBorder},
  Superseded:       {bg: planningTokens.draftBg,      color: planningTokens.textSecondary, border: planningTokens.draftBorder},
  Info:             {bg: planningTokens.neutralBg,    color: planningTokens.primaryBlue,   border: planningTokens.neutralBorder},
  Warning:          {bg: planningTokens.warningBg,    color: planningTokens.warning,       border: planningTokens.warningBorder},
  Blocker:          {bg: planningTokens.dangerBg,     color: planningTokens.danger,        border: planningTokens.dangerBorder},
} as const;

// borderRadius: 3  →  3 × theme.shape.borderRadius (4px) = 12px  (borderRadius/Medium)
export const planningSurfaceSx = {
  backgroundColor: planningTokens.surface,
  border: `1px solid ${planningTokens.border}`,
  borderRadius: 3,
  boxShadow: planningTokens.softShadow,
} as const;

export const planningCardSx = {
  ...planningSurfaceSx,
  boxShadow: planningTokens.shadow,
} as const;
