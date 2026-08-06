# Dark Mode Implementation Guide

This guide documents **exactly** how dark mode was implemented in this project (the backup/POC). Follow these steps in order to replicate the same changes in the real project.

## Approach: CSS Variable Bridging

Instead of editing hundreds of component files, we:
1. Map all design tokens to CSS custom properties (e.g. `var(--token-brand-main)`)
2. Define two sets of values: one under `:root` (light) and one under `:root[data-theme="dark"]`
3. Toggle `data-theme` attribute on `<html>` via React context
4. Set MUI `palette.mode` dynamically to align MUI internal logic

---

## Step 1 — Create ThemeModeContext

**Create:** `src/common/contexts/ThemeModeContext.tsx`

```tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

interface ThemeModeContextType {
  themeMode: ThemeMode;
  toggleThemeMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    if (saved === 'dark' || saved === 'light') return saved as ThemeMode;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', themeMode);
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  const toggleThemeMode = () => setThemeMode(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <ThemeModeContext.Provider value={{ themeMode, toggleThemeMode }}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error('useThemeMode must be used within a ThemeModeProvider');
  return context;
};
```

---

## Step 2 — Refactor src/theme.ts

**Modify:** `src/theme.ts`

Replace the static `muiTheme` export with a `getMuiTheme(mode)` function. Keep `activeTheme` using CSS variables.

> **CRITICAL RULE:** MUI throws a runtime error if `var(--...)` is passed to `palette.*` colors.  
> Always use **hardcoded hex** in `palette`. Use CSS variables only in `sx` / `styleOverrides`.

```ts
import { createTheme } from '@mui/material';

export const activeTheme = {
  primary:           'var(--active-theme-primary)',
  primaryLight:      'var(--active-theme-primary-light)',
  primaryDark:       'var(--active-theme-primary-dark)',
  secondary:         'var(--active-theme-secondary)',
  warning:           'var(--active-theme-warning)',
  success:           'var(--active-theme-success)',
  backgroundDefault: 'var(--active-theme-background-default)',
  backgroundPaper:   'var(--active-theme-background-paper)',
  textPrimary:       'var(--active-theme-text-primary)',
  textSecondary:     'var(--active-theme-text-secondary)',
  appBarGradient:    'var(--active-theme-appbar-gradient)',
} as const;

export const getMuiTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      background: {
        default: isDark ? '#0B0F19' : '#EBEDF0',
        paper:   isDark ? '#1E293B' : '#ffffff',
      },
      primary: {
        main:  isDark ? '#3E83FF' : '#044ED7',
        light: isDark ? '#60A5FA' : '#1D74FF',
        dark:  isDark ? '#1D4ED8' : '#060A3D',
      },
      secondary: { main: isDark ? '#22D3EE' : '#00C2EC' },
      warning:   { main: isDark ? '#F97316' : '#FF6E00' },
      success:   { main: isDark ? '#10B981' : '#00AF95' },
      text: {
        primary:   isDark ? '#F8FAFC' : '#1F2366',
        secondary: isDark ? '#94A3B8' : '#626465',
      },
    },
    // keep existing typography and components config,
    // but replace any hardcoded hex values with activeTheme.* or var(--...) references
  });
};
```

---

## Step 3 — Update App.tsx

**Modify:** `src/App.tsx`

```tsx
import { ThemeModeProvider, useThemeMode } from './common/contexts/ThemeModeContext';
import { getMuiTheme } from './theme';

function ThemeProviderWrapper() {
  const { themeMode } = useThemeMode();
  const theme = React.useMemo(() => getMuiTheme(themeMode), [themeMode]);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* ...existing providers like AuthProvider, WorkstationProvider etc... */}
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ThemeModeProvider>
        <ThemeProviderWrapper />
      </ThemeModeProvider>
    </AppErrorBoundary>
  );
}
```

---

## Step 4 — Add Dark Mode Toggle to MainLayout.tsx

**Modify:** `src/navigation/MainLayout.tsx`

```tsx
// 1. Add import at top
import { useThemeMode } from '../common/contexts/ThemeModeContext';
import { Switch } from '@mui/material';

// 2. Inside the component function
const { themeMode, toggleThemeMode } = useThemeMode();

// 3. In the user profile Popover List, add before the "Sign Out" item:
<ListItem sx={{ px: 2, py: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <ListItemText primary="Dark Mode" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
  <Switch size="small" checked={themeMode === 'dark'} onChange={toggleThemeMode} />
</ListItem>
```

---

## Step 5 — Add CSS Variables to src/index.css

Add two CSS blocks after any existing imports.

### 5a — Light Mode Values (`:root`)

```css
:root {
  /* ---- Active Theme (Light) ---- */
  --active-theme-primary: #044ED7;
  --active-theme-primary-light: #1D74FF;
  --active-theme-primary-dark: #060A3D;
  --active-theme-secondary: #00C2EC;
  --active-theme-warning: #FF6E00;
  --active-theme-success: #00AF95;
  --active-theme-background-default: #EBEDF0;
  --active-theme-background-paper: #ffffff;
  --active-theme-text-primary: #1F2366;
  --active-theme-text-secondary: #626465;
  --active-theme-appbar-gradient: linear-gradient(90deg, #060A3D 0%, #1F2366 52%, #044ED7 100%);

  /* ---- Surfaces & Utility ---- */
  --body-background: linear-gradient(180deg, #fbfdff 0%, #eef4ff 100%);
  --scrollbar-thumb-color: #cbd5e1;
  --text-selection-color: rgba(37,99,235,0.18);
  --focus-outline-color: rgba(37,99,235,0.28);
  --paper-shadow: 0 14px 34px rgba(15,23,42,0.06);
  --paper-border-color: rgba(148,163,184,0.16);
  --button-hover-shadow: 0 12px 24px rgba(15,23,42,0.12);
  --button-contained-shadow: 0 14px 30px rgba(4,78,215,0.22);
  --button-outlined-hover-bg: #f5f8ff;
  --button-outlined-hover-border: rgba(37,99,235,0.38);
  --card-shadow: 0 12px 28px rgba(15,23,42,0.05);
  --input-border-color: rgba(148,163,184,0.18);
  --input-hover-border-color: rgba(4,78,215,0.35);
  --appbar-border-bottom: rgba(255,255,255,0.1);
  --drawer-panel-bg: #f8fcfd;
  --drawer-shadow: -12px 0 34px rgba(15,23,42,0.10);
  --badge-soft-bg: rgba(31,99,234,0.06);
  --badge-soft-border: rgba(31,99,234,0.12);
  --badge-outlined-border: rgba(31,99,234,0.3);
  --status-warning-bg: rgba(255,152,0,0.04);
  --status-warning-border: rgba(255,152,0,0.3);
  --status-success-bg: rgba(102,187,106,0.04);
  --status-success-border: rgba(102,187,106,0.3);
  --status-neutral-bg: rgba(15,23,42,0.02);
  --status-neutral-border: rgba(15,23,42,0.16);
  --action-btn-bg: #FFFFFF;
  --action-btn-border: rgba(15,23,42,0.08);
  --action-btn-hover-bg: #F8FAFC;
  --action-btn-hover-border: rgba(15,23,42,0.16);
  --table-border-color: rgba(15,23,42,0.04);
  --shadow-color-light: rgba(15,23,42,0.12);

  /* ---- Workstation Token Palette (Light) ---- */
  --token-brand-darkest: #020043;
  --token-brand-darker: #001F9B;
  --token-brand-dark: #0042C5;
  --token-brand-main: #1F63EA;
  --token-brand-light: #3E83FF;
  --token-brand-lighter: #599EFF;
  --token-brand-lightest: #94D5FF;
  --token-brand-contrast: #FFFFFF;
  --token-brand-soft-bg: rgba(31,99,234,0.08);
  --token-brand-selected-bg: rgba(31,99,234,0.12);

  --token-error-darkest: #B71C1C;
  --token-error-darker: #D32F2F;
  --token-error-dark: #E53935;
  --token-error-main: #F44336;
  --token-error-light: #EF5350;
  --token-error-lighter: #E57373;
  --token-error-lightest: #FECDD2;
  --token-error-contrast: #FFFFFF;
  --token-error-soft-bg: rgba(244,67,54,0.08);
  --token-error-selected-bg: rgba(244,67,54,0.12);

  --token-warning-darkest: #4A1A00;
  --token-warning-darker: #A13C00;
  --token-warning-dark: #FB8C00;
  --token-warning-main: #FF9800;
  --token-warning-light: #FFA726;
  --token-warning-lighter: #FFCC80;
  --token-warning-lightest: #FFE0B2;
  --token-warning-contrast: #000000;
  --token-warning-soft-bg: rgba(255,152,0,0.08);
  --token-warning-selected-bg: rgba(255,152,0,0.12);

  --token-success-darkest: #2E7D32;
  --token-success-darker: #43A047;
  --token-success-dark: #4CAF50;
  --token-success-main: #66BB6A;
  --token-success-light: #66BB6A;
  --token-success-lighter: #81C784;
  --token-success-lightest: #C8E6C9;
  --token-success-contrast: #000000;
  --token-success-soft-bg: rgba(102,187,106,0.08);
  --token-success-selected-bg: rgba(102,187,106,0.12);

  --token-info-darkest: #01579B;
  --token-info-darker: #0288D1;
  --token-info-dark: #039BE5;
  --token-info-main: #03A9F4;
  --token-info-light: #29B6F6;
  --token-info-lighter: #4FC3F7;
  --token-info-lightest: #B3E5FC;
  --token-info-contrast: #000000;
  --token-info-soft-bg: rgba(3,169,244,0.08);
  --token-info-selected-bg: rgba(3,169,244,0.12);

  --token-neutral-darkest: #9D9FA2;
  --token-neutral-darker: #BBBEC1;
  --token-neutral-dark: #DBDDDF;
  --token-neutral-main: #E9EDEF;
  --token-neutral-lighter: #F0F2F4;
  --token-neutral-lightest: #F8FAFC;
  --token-neutral-contrast: #000000;

  --token-text-primary: rgba(0,0,0,0.87);
  --token-text-secondary: rgba(0,0,0,0.60);
  --token-text-disabled: rgba(0,0,0,0.38);
  --token-divider: rgba(0,0,0,0.12);
  --token-common-white: #FFFFFF;
  --token-common-black: #000000;

  /* ---- Workstation Visuals (Light) ---- */
  --visuals-page-background: radial-gradient(circle at top left, rgba(31,99,234,0.08), transparent 28%), linear-gradient(180deg, #F3F6FA 0%, #E9EEF4 100%);
  --visuals-shell-border: 1px solid rgba(148,163,184,0.16);
  --visuals-card-border: 1px solid #DBDDDF;
  --visuals-card-shadow: 0 18px 40px rgba(15,23,42,0.08);
  --visuals-text-primary: #0F172A;
  --visuals-text-secondary: #64748B;
  --visuals-text-muted: #94A3B8;
  --visuals-slate-surface: #F8FAFC;
  --visuals-dark-surface: #0F172A;
  --visuals-dark-surface-alt: #1E293B;
  --visuals-tier-border: #E2E8F0;
  --visuals-tier-surface: #FFFFFF;
  --visuals-tier-surface-soft: #F8FAFD;
  --visuals-tier-surface-muted: #F4F7FC;
  --visuals-tier-panel-bg: #FFFFFF;
  --visuals-tier-shadow: 0 1px 3px rgba(0,0,0,0.01), 0 1px 2px rgba(0,0,0,0.02);
  --visuals-tier-text-heading: #202433;
  --visuals-tier-text-label: #626465;
  --visuals-tier-text-meta: #6F7787;
  --visuals-tier-axis: #17356D;
  --visuals-tier-grid: rgba(23,53,109,0.18);
  --visuals-tier-grid-soft: rgba(23,53,109,0.12);

  --chart-legacy-good-soft: rgba(102,187,106,0.16);
  --chart-legacy-bad-soft: rgba(244,67,54,0.16);
  --chart-legacy-neutral-soft: rgba(31,99,234,0.16);

  --priority-high-bg: #FECDD2;
  --priority-high-color: #E53935;
  --priority-high-border: #E57373;
  --priority-medium-bg: #FFE0B2;
  --priority-medium-color: #FB8C00;
  --priority-medium-border: #FFCC80;
  --priority-low-bg: #C8E6C9;
  --priority-low-color: #43A047;
  --priority-low-border: #81C784;
}
```

### 5b — Dark Mode Values (`:root[data-theme="dark"]`)

```css
:root[data-theme="dark"] {
  /* ---- Active Theme (Dark) ---- */
  --active-theme-primary: #3E83FF;
  --active-theme-primary-light: #60A5FA;
  --active-theme-primary-dark: #1D4ED8;
  --active-theme-secondary: #22D3EE;
  --active-theme-warning: #F97316;
  --active-theme-success: #10B981;
  --active-theme-background-default: #0B0F19;
  --active-theme-background-paper: #1E293B;
  --active-theme-text-primary: #F8FAFC;
  --active-theme-text-secondary: #94A3B8;
  --active-theme-appbar-gradient: linear-gradient(90deg, #090D16 0%, #111827 52%, #1E293B 100%);

  /* ---- Surfaces & Utility (Dark) ---- */
  --body-background: radial-gradient(circle at top left, rgba(31,99,234,0.15), transparent 35%), linear-gradient(180deg, #090D16 0%, #0F172A 100%);
  --scrollbar-thumb-color: #475569;
  --text-selection-color: rgba(59,130,246,0.3);
  --shadow-color-light: rgba(0,0,0,0.4);
  --focus-outline-color: rgba(59,130,246,0.5);
  --paper-shadow: 0 14px 34px rgba(0,0,0,0.3);
  --paper-border-color: rgba(255,255,255,0.08);
  --button-hover-shadow: 0 12px 24px rgba(0,0,0,0.4);
  --button-contained-shadow: 0 14px 30px rgba(59,130,246,0.3);
  --button-outlined-hover-bg: rgba(59,130,246,0.08);
  --button-outlined-hover-border: rgba(59,130,246,0.5);
  --card-shadow: 0 12px 28px rgba(0,0,0,0.2);
  --input-border-color: rgba(255,255,255,0.12);
  --input-hover-border-color: rgba(59,130,246,0.4);
  --appbar-border-bottom: rgba(255,255,255,0.08);
  --drawer-panel-bg: #111827;
  --drawer-shadow: -12px 0 34px rgba(0,0,0,0.4);
  --badge-soft-bg: rgba(59,130,246,0.1);
  --badge-soft-border: rgba(59,130,246,0.2);
  --badge-outlined-border: rgba(59,130,246,0.4);
  --status-warning-bg: rgba(249,115,22,0.1);
  --status-warning-border: rgba(249,115,22,0.3);
  --status-success-bg: rgba(16,185,129,0.1);
  --status-success-border: rgba(16,185,129,0.3);
  --status-neutral-bg: rgba(255,255,255,0.05);
  --status-neutral-border: rgba(255,255,255,0.15);
  --action-btn-bg: #1E293B;
  --action-btn-border: rgba(255,255,255,0.08);
  --action-btn-hover-bg: #334155;
  --action-btn-hover-border: rgba(255,255,255,0.16);
  --table-border-color: rgba(255,255,255,0.06);

  /* ---- Workstation Token Palette (Dark) ---- */
  --token-brand-darkest: #0F172A;
  --token-brand-darker: #1E3A8A;
  --token-brand-dark: #1D4ED8;
  --token-brand-main: #3E83FF;
  --token-brand-light: #60A5FA;
  --token-brand-lighter: #93C5FD;
  --token-brand-lightest: #BFDBFE;
  --token-brand-contrast: #0F172A;
  --token-brand-soft-bg: rgba(59,130,246,0.15);
  --token-brand-selected-bg: rgba(59,130,246,0.25);

  --token-error-darkest: #7F1D1D;
  --token-error-darker: #991B1B;
  --token-error-dark: #B91C1C;
  --token-error-main: #EF4444;
  --token-error-light: #F87171;
  --token-error-lighter: #FCA5A5;
  --token-error-lightest: #FFCDD2;
  --token-error-contrast: #7F1D1D;
  --token-error-soft-bg: rgba(239,68,68,0.15);
  --token-error-selected-bg: rgba(239,68,68,0.25);

  --token-warning-darkest: #78350F;
  --token-warning-darker: #92400E;
  --token-warning-dark: #B45309;
  --token-warning-main: #F59E0B;
  --token-warning-light: #FBBF24;
  --token-warning-lighter: #FDE68A;
  --token-warning-lightest: #FFE0B2;
  --token-warning-contrast: #78350F;
  --token-warning-soft-bg: rgba(245,158,11,0.15);
  --token-warning-selected-bg: rgba(245,158,11,0.25);

  --token-success-darkest: #064E3B;
  --token-success-darker: #065F46;
  --token-success-dark: #047857;
  --token-success-main: #10B981;
  --token-success-light: #34D399;
  --token-success-lighter: #6EE7B7;
  --token-success-lightest: #A7F3D0;
  --token-success-contrast: #064E3B;
  --token-success-soft-bg: rgba(16,185,129,0.15);
  --token-success-selected-bg: rgba(16,185,129,0.25);

  --token-info-darkest: #1E3A8A;
  --token-info-darker: #1D4ED8;
  --token-info-dark: #2563EB;
  --token-info-main: #3B82F6;
  --token-info-light: #60A5FA;
  --token-info-lighter: #93C5FD;
  --token-info-lightest: #BFDBFE;
  --token-info-contrast: #1E3A8A;
  --token-info-soft-bg: rgba(59,130,246,0.15);
  --token-info-selected-bg: rgba(59,130,246,0.25);

  --token-neutral-darkest: #F1F5F9;
  --token-neutral-darker: #E2E8F0;
  --token-neutral-dark: #475569;
  --token-neutral-main: #334155;
  --token-neutral-lighter: #1E293B;
  --token-neutral-lightest: #0F172A;
  --token-neutral-contrast: #F1F5F9;

  --token-text-primary: rgba(255,255,255,0.9);
  --token-text-secondary: rgba(255,255,255,0.65);
  --token-text-disabled: rgba(255,255,255,0.4);
  --token-divider: rgba(255,255,255,0.12);
  /* Note: token-common-white is intentionally mapped to the dark surface in dark mode */
  --token-common-white: #1E293B;
  --token-common-black: #FFFFFF;

  /* ---- Workstation Visuals (Dark) ---- */
  --visuals-page-background: radial-gradient(circle at top left, rgba(31,99,234,0.15), transparent 30%), linear-gradient(180deg, #090D16 0%, #0F172A 100%);
  --visuals-shell-border: 1px solid rgba(255,255,255,0.08);
  --visuals-card-border: 1px solid rgba(255,255,255,0.12);
  --visuals-card-shadow: 0 18px 40px rgba(0,0,0,0.3);
  --visuals-text-primary: #F8FAFC;
  --visuals-text-secondary: #94A3B8;
  --visuals-text-muted: #64748B;
  --visuals-slate-surface: #1E293B;
  --visuals-dark-surface: #0F172A;
  --visuals-dark-surface-alt: #1E293B;
  --visuals-tier-border: rgba(255,255,255,0.08);
  --visuals-tier-surface: #1E293B;
  --visuals-tier-surface-soft: #111827;
  --visuals-tier-surface-muted: #0B0F19;
  --visuals-tier-panel-bg: #1E293B;
  --visuals-tier-shadow: 0 4px 12px rgba(0,0,0,0.3);
  --visuals-tier-text-heading: #F8FAFC;
  --visuals-tier-text-label: #94A3B8;
  --visuals-tier-text-meta: #64748B;
  --visuals-tier-axis: #94A3B8;
  --visuals-tier-grid: rgba(255,255,255,0.12);
  --visuals-tier-grid-soft: rgba(255,255,255,0.08);

  --chart-legacy-good-soft: rgba(16,185,129,0.2);
  --chart-legacy-bad-soft: rgba(239,68,68,0.2);
  --chart-legacy-neutral-soft: rgba(59,130,246,0.2);

  --priority-high-bg: rgba(239,68,68,0.15);
  --priority-high-color: #F87171;
  --priority-high-border: rgba(239,68,68,0.3);
  --priority-medium-bg: rgba(245,158,11,0.15);
  --priority-medium-color: #FBBF24;
  --priority-medium-border: rgba(245,158,11,0.3);
  --priority-low-bg: rgba(16,185,129,0.15);
  --priority-low-color: #34D399;
  --priority-low-border: rgba(16,185,129,0.3);
}
```

---

## Step 6 — Fix Widget Hardcoded Colors

These are the most common dark mode bugs. Apply these patterns across all widget files in `src/workstation/components/`:

### Pattern 1: Card backgrounds

```ts
// BEFORE (white card, broken in dark mode)
const insetCardSx = {
  border: '1px solid rgba(15, 23, 42, 0.06)',
  borderRadius: '8px',
  bgcolor: tokenCommon.white,
};

// AFTER (theme-aware)
const insetCardSx = {
  border: `1px solid ${workstationVisuals.tierBorder}`,
  borderRadius: '8px',
  bgcolor: 'background.paper',
};
```

### Pattern 2: Filter/tab buttons

```ts
// BEFORE
const filterButtonSx = {
  border: '1px solid rgba(15, 23, 42, 0.08)',
  color: 'rgba(15, 23, 42, 0.7)',
  bgcolor: tokenCommon.white,
  '&:hover': { borderColor: 'rgba(15, 23, 42, 0.16)' },
};

// AFTER
const filterButtonSx = {
  border: `1px solid ${workstationVisuals.tierBorder}`,
  color: workstationVisuals.textSecondary,
  bgcolor: 'background.paper',
  '&:hover': { borderColor: tokenNeutral.dark },
};
```

### Pattern 3: KPI column dividers

```ts
// BEFORE
borderRight: idx < kpis.length - 1 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none',

// AFTER
borderRight: idx < kpis.length - 1 ? `1px solid ${workstationVisuals.tierBorder}` : 'none',
```

### Pattern 4: Row separators

```ts
// BEFORE
borderBottom: last ? 'none' : '1px solid rgba(15, 23, 42, 0.045)',

// AFTER
borderBottom: last ? 'none' : `1px solid ${workstationVisuals.tierBorder}`,
```

### Pattern 5: Status badge borders (color transparency bug)

> `${color}33` appended to a CSS variable produces invalid CSS like `var(--token-error-main)33`

```ts
// BEFORE (invalid CSS in dark mode)
border: `1px solid ${getToneColor(tone)}33`,

// AFTER (valid color-mix)
border: `1px solid color-mix(in srgb, ${getToneColor(tone)} 20%, transparent)`,
```

### Pattern 6: Donut chart hollow centers

```tsx
// BEFORE
<Box sx={{ position: 'absolute', inset: 14, borderRadius: '50%', bgcolor: tokenCommon.white }}>

// AFTER
<Box sx={{ position: 'absolute', inset: 14, borderRadius: '50%', bgcolor: 'background.paper' }}>
```

### Pattern 7: Criticality chips

```tsx
// BEFORE
bgcolor: tokenCommon.white,

// AFTER
bgcolor: 'background.paper',
```

### Pattern 8: Progress bar track backgrounds

```tsx
// BEFORE
<Box sx={{ height: 6, bgcolor: 'rgba(15, 23, 42, 0.04)', borderRadius: 999 }}>

// AFTER
<Box sx={{ height: 6, bgcolor: tokenNeutral.lighter, borderRadius: 999 }}>
```

---

## Step 7 — Files That Were Modified in This Session

| Component File | Changes Applied |
|---|---|
| `EquipmentStatusWidget.tsx` | insetCardSx → background.paper + tierBorder, color-mix |
| `MaintenanceCbmPdmWidget.tsx` | insetCardSx → background.paper + tierBorder |
| `MaintenanceAnalyticsWidget.tsx` | sparkline border → tierBorder |
| `MaintenanceTechnicianAiInsights.tsx` | alert blue (#F4F8FC) → tokenNeutral.lightest |
| `MaintenanceHubWidget.tsx` | KPI divider borders → tierBorder |
| `MaintenancePlannerWidget.tsx` | KPI dividers + row borders + filter badge → tierBorder |
| `MyMaintenanceBacklogWidget.tsx` | insetCardSx → background.paper + tierBorder |
| `MyEsosWidget.tsx` | filterButtonSx + insetCardSx + KPI borders |
| `MyEsoWidget.tsx` | filterButtonSx + all card borders + donut overlays + progress bar |
| `SparePartsMonitorWidget.tsx` | insetCardSx + row borders + tab buttons + color-mix badges |
| `WidgetWorkOrders.tsx` | insetCardSx + dateNavigatorSx + row cards + criticality chips |

---

## Step 8 — Verification Commands

```bash
# TypeScript type check (must pass clean)
npx tsc --noEmit

# Production build (must complete without errors)
npm run build
```

### Manual Test Checklist

- [ ] Open app in browser
- [ ] Click user avatar (top right) in the header
- [ ] Toggle "Dark Mode" switch
- [ ] Verify backgrounds go dark, text stays readable
- [ ] Verify widget cards, borders, tables render correctly
- [ ] Reload page — theme should persist (localStorage)
- [ ] Toggle back to light — everything should restore cleanly

---

## Common Pitfalls Quick Reference

| Problem | Root Cause | Fix |
|---|---|---|
| MUI runtime error: `Unsupported var(--...) color` | CSS variable in `palette.*` | Use hardcoded hex in palette only |
| Text invisible in dark mode | `rgba(15,23,42,0.7)` hardcoded | `workstationVisuals.textSecondary` |
| Card still white in dark mode | `bgcolor: tokenCommon.white` | `bgcolor: 'background.paper'` |
| Badge border shows as invalid CSS | `${color}33` string concat | `color-mix(in srgb, ${color} 20%, transparent)` |
| Border too harsh / not adapting | `rgba(15,23,42,0.06)` hardcoded | `workstationVisuals.tierBorder` |
| Hover border not visible in dark | `rgba(15,23,42,0.16)` hardcoded | `tokenNeutral.dark` |
| Progress bar track invisible | `rgba(15,23,42,0.04)` hardcoded | `tokenNeutral.lighter` |
