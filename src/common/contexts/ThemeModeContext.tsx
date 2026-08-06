import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeModeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
};

const themeModeStorageKey = 'bd-smart-factory-theme-mode';

const readInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'light';

  try {
    const saved = window.localStorage.getItem(themeModeStorageKey);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Ignore storage failures and fall back to the OS preference.
  }

  try {
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

const applyThemeMode = (mode: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(readInitialThemeMode);

  useEffect(() => {
    applyThemeMode(themeMode);

    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(themeModeStorageKey, themeMode);
    } catch {
      // Theme still works for the current session when storage is unavailable.
    }
  }, [themeMode]);

  const value = useMemo<ThemeModeContextValue>(() => ({
    themeMode,
    setThemeMode: setThemeModeState,
    toggleThemeMode: () => {
      setThemeModeState((current) => (current === 'dark' ? 'light' : 'dark'));
    },
  }), [themeMode]);

  return (
    <ThemeModeContext.Provider value={value}>
      {children}
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within a ThemeModeProvider');
  }
  return context;
};

export const THEME_MODE_STORAGE_KEY = themeModeStorageKey;
