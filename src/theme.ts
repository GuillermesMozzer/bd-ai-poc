/**
 * Shared MUI theme and reusable sx style constants.
 * Import from here instead of defining inline in App.tsx or feature files.
 */
import { createTheme } from '@mui/material';
import type { ThemeMode } from './common/contexts/ThemeModeContext';

export const activeTheme = {
  primary: 'var(--active-theme-primary)',
  primaryLight: 'var(--active-theme-primary-light)',
  primaryDark: 'var(--active-theme-primary-dark)',
  secondary: 'var(--active-theme-secondary)',
  warning: 'var(--active-theme-warning)',
  success: 'var(--active-theme-success)',
  backgroundDefault: 'var(--active-theme-background-default)',
  backgroundPaper: 'var(--active-theme-background-paper)',
  textPrimary: 'var(--active-theme-text-primary)',
  textSecondary: 'var(--active-theme-text-secondary)',
  appBarGradient: 'var(--active-theme-appbar-gradient)',
} as const;

const lightPalette = {
  backgroundDefault: '#EBEDF0',
  backgroundPaper: '#FFFFFF',
  primary: '#044ED7',
  primaryLight: '#1D74FF',
  primaryDark: '#060A3D',
  secondary: '#00C2EC',
  warning: '#FF6E00',
  success: '#00AF95',
  textPrimary: '#1F2366',
  textSecondary: '#626465',
  divider: 'rgba(0,0,0,0.12)',
};

const darkPalette = {
  backgroundDefault: '#0B0F19',
  backgroundPaper: '#1E293B',
  primary: '#3E83FF',
  primaryLight: '#60A5FA',
  primaryDark: '#1D4ED8',
  secondary: '#22D3EE',
  warning: '#F97316',
  success: '#10B981',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  divider: 'rgba(255,255,255,0.12)',
};

export const getMuiTheme = (mode: ThemeMode) => {
  const paletteValues = mode === 'dark' ? darkPalette : lightPalette;

  return createTheme({
    palette: {
      mode,
      background: {
        default: paletteValues.backgroundDefault,
        paper: paletteValues.backgroundPaper,
      },
      primary: {
        main: paletteValues.primary,
        light: paletteValues.primaryLight,
        dark: paletteValues.primaryDark,
      },
      secondary: {
        main: paletteValues.secondary,
      },
      warning: {
        main: paletteValues.warning,
      },
      success: {
        main: paletteValues.success,
      },
      text: {
        primary: paletteValues.textPrimary,
        secondary: paletteValues.textSecondary,
      },
      divider: paletteValues.divider,
    },
    typography: {
      fontFamily: '"Inter", sans-serif',
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
        color: activeTheme.textPrimary,
      },
      h4: {
        fontWeight: 800,
        letterSpacing: '-0.03em',
        color: activeTheme.textPrimary,
      },
      h6: {
        fontWeight: 600,
        fontSize: '1rem',
        letterSpacing: '-0.01em',
      },
      subtitle1: {
        fontWeight: 600,
        color: activeTheme.textSecondary,
      },
      subtitle2: {
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        fontSize: '0.75rem',
      },
      body2: {
        color: activeTheme.textSecondary,
      },
      caption: {
        fontWeight: 600,
        color: activeTheme.textSecondary,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          ':root': {
            colorScheme: mode,
          },
          '@media screen and (max-width: 1280px)': {
            html: { zoom: '0.75' },
          },
          '@media screen and (min-width: 1281px) and (max-width: 1366px)': {
            html: { zoom: '0.78' },
          },
          '@media screen and (min-width: 1367px) and (max-width: 1440px)': {
            html: { zoom: '0.83' },
          },
          '@media screen and (min-width: 1441px) and (max-width: 1600px)': {
            html: { zoom: '0.90' },
          },
          '@media screen and (min-width: 1601px) and (max-width: 1920px)': {
            html: { zoom: '0.95' },
          },
          '@media screen and (min-width: 1921px)': {
            html: { zoom: '1' },
          },
          body: {
            background: 'var(--body-background)',
            color: activeTheme.textPrimary,
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': {
              width: '6px',
              height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'var(--scrollbar-thumb-color)',
              borderRadius: '10px',
            },
            '& ::selection': {
              backgroundColor: 'var(--text-selection-color)',
            },
          },
          'a[data-skip-link]': {
            position: 'absolute',
            top: 8,
            left: 12,
            zIndex: 2000,
            padding: '10px 14px',
            borderRadius: 12,
            background: 'var(--active-theme-background-paper)',
            color: activeTheme.primaryLight,
            border: '1px solid var(--focus-border-color)',
            boxShadow: 'var(--paper-shadow)',
            transform: 'translateY(-140%)',
            transition: 'transform 0.2s ease',
            textDecoration: 'none',
            fontWeight: 700,
          },
          'a[data-skip-link]:focus': {
            transform: 'translateY(0)',
          },
          '*:focus-visible': {
            outline: '3px solid var(--focus-outline-color)',
            outlineOffset: 2,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
            backgroundColor: 'var(--active-theme-background-paper)',
            backdropFilter: 'none',
            boxShadow: 'var(--paper-shadow)',
            border: '1px solid var(--paper-border-color)',
            transition: 'background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 700,
            padding: '9px 16px',
            transition: 'all 0.2s',
            boxShadow: 'none',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: 'var(--button-hover-shadow)',
            },
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${activeTheme.primary} 0%, ${activeTheme.primaryLight} 100%)`,
            boxShadow: 'var(--button-contained-shadow)',
            '&:hover': {
              background: `linear-gradient(135deg, ${activeTheme.primaryLight} 0%, ${activeTheme.primaryDark} 100%)`,
            },
          },
          outlinedPrimary: {
            borderColor: 'var(--button-outlined-border)',
            color: activeTheme.primary,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'var(--button-outlined-hover-bg)',
              borderColor: 'var(--button-outlined-hover-border)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            border: '1px solid var(--paper-border-color)',
            backgroundImage: 'none',
            backgroundColor: 'var(--active-theme-background-paper)',
            boxShadow: 'var(--card-shadow)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              backgroundColor: 'var(--input-bg)',
              backdropFilter: 'none',
              color: activeTheme.textPrimary,
              '& fieldset': {
                borderColor: 'var(--input-border-color)',
              },
              '&:hover fieldset': {
                borderColor: 'var(--input-hover-border-color)',
              },
              '&.Mui-focused fieldset': {
                borderColor: activeTheme.primaryLight,
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          outlined: {
            borderRadius: 12,
            backgroundColor: 'var(--input-bg)',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            fontWeight: 700,
            border: '1px solid var(--chip-border-color)',
            backgroundColor: 'var(--chip-bg)',
            color: activeTheme.textPrimary,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backdropFilter: 'none',
            backgroundImage: 'none',
            backgroundColor: 'var(--drawer-panel-bg)',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: activeTheme.appBarGradient,
            backdropFilter: 'blur(18px)',
            borderBottom: '1px solid var(--appbar-border-bottom)',
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

export const muiTheme = getMuiTheme('light');

// ---------------------------------------------------------------------------
// Reusable sx style constants - import these instead of redefining per file
// ---------------------------------------------------------------------------

export const drawerHeaderIconButtonSx = {
  color: 'white',
  border: '1px solid rgba(255,255,255,0.12)',
  bgcolor: 'rgba(255,255,255,0.08)',
  transition: 'all 0.2s ease',
  '&:hover': {
    bgcolor: 'rgba(255,255,255,0.14)',
    transform: 'translateY(-1px)',
  },
  '&:focus-visible': {
    outline: '3px solid rgba(191,219,254,0.7)',
    outlineOffset: 2,
  },
} as const;

export const lightHeaderIconButtonSx = {
  color: 'var(--active-theme-primary)',
  border: '1px solid var(--paper-border-color)',
  bgcolor: 'var(--active-theme-background-paper)',
  transition: 'all 0.2s ease',
  '&:hover': {
    bgcolor: 'var(--button-outlined-hover-bg)',
    borderColor: 'var(--button-outlined-hover-border)',
    transform: 'translateY(-1px)',
  },
  '&:focus-visible': {
    outline: '3px solid var(--focus-outline-color)',
    outlineOffset: 2,
  },
} as const;

export const lightDrawerPanelSx = {
  p: 0,
  display: 'flex',
  flexDirection: 'column',
  bgcolor: 'var(--drawer-panel-bg)',
  backgroundImage: 'none',
  boxShadow: 'var(--drawer-shadow)',
} as const;

export const lightDrawerSectionSx = {
  borderRadius: 3,
  bgcolor: 'var(--active-theme-background-paper)',
  border: '1px solid var(--paper-border-color)',
  boxShadow: 'var(--card-shadow)',
} as const;

export const workstationDrawerCardSx = {
  p: 2.2,
  borderRadius: 3,
  bgcolor: 'var(--active-theme-background-paper)',
  border: '1px solid var(--paper-border-color)',
  boxShadow: 'var(--card-shadow)',
} as const;

export const workstationDrawerButtonCardSx = (accent: string) => ({
  p: 2.2,
  minHeight: 160,
  width: '100%',
  borderRadius: 3,
  cursor: 'pointer',
  textAlign: 'left',
  bgcolor: 'var(--active-theme-background-paper)',
  border: '1px solid var(--paper-border-color)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'all 0.2s ease',
  boxShadow: 'var(--card-shadow)',
  '&:hover': {
    transform: 'translateY(-3px)',
    borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`,
    bgcolor: 'var(--surface-hover-bg)',
    boxShadow: `0 18px 30px -24px ${accent}`,
  },
  '&:focus-visible': {
    outline: `3px solid color-mix(in srgb, ${accent} 35%, transparent)`,
    outlineOffset: 3,
    borderColor: `color-mix(in srgb, ${accent} 70%, transparent)`,
  },
} as const);