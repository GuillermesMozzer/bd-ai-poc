import React, { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type AppEdition = 'classic' | 'inside_logistics';

export const APP_EDITION_STORAGE_KEY = 'bd-smart-factory-edition';

export const APP_EDITION_META: Record<
  AppEdition,
  {
    id: AppEdition;
    title: string;
    shortTitle: string;
    badge: string;
    description: string;
    highlights: string[];
    accent: string;
  }
> = {
  classic: {
    id: 'classic',
    title: 'Smart Factory (current version)',
    shortTitle: 'Smart Factory',
    badge: 'CURRENT',
    description:
      'The full existing experience: workstations, maintenance, planning, logistics control towers, and classic mobile ops.',
    highlights: [
      'Original Logistics Mobile Ops, Guided Tasks, Quality Release, and Shipment Readiness',
      'Best for demos of the consolidated Smart Factory product',
      'Does not include the reactive Happy Path Lupita → Pepe → Alejandra → Gaby',
    ],
    accent: '#044ED7',
  },
  inside_logistics: {
    id: 'inside_logistics',
    title: 'Inside Logistics (new version)',
    shortTitle: 'Inside Logistics',
    badge: 'NEW · V7',
    description:
      'Edition with logistics widgets, MD/DA/ID contracts, and four reactive journeys synced via localStorage.',
    highlights: [
      'Lupita (dock), Pepe (Zebra RF), Dra. Alejandra (e-sign), Gaby (SpaceX cockpit)',
      'Widgets: inbound SLA, Sterigenics timeline, shortage risk, SpaceX gating',
      'Reset Demo Data to replay the Happy Path during presentations',
    ],
    accent: '#FF5F00',
  },
};

function readStoredEdition(): AppEdition | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get('edition');
  if (fromQuery === 'classic' || fromQuery === 'inside_logistics') {
    return fromQuery;
  }
  const raw = window.localStorage.getItem(APP_EDITION_STORAGE_KEY);
  if (raw === 'classic' || raw === 'inside_logistics') return raw;
  return null;
}

function persistEdition(edition: AppEdition | null) {
  if (typeof window === 'undefined') return;
  if (!edition) {
    window.localStorage.removeItem(APP_EDITION_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(APP_EDITION_STORAGE_KEY, edition);
}

type EditionContextValue = {
  edition: AppEdition | null;
  hasSelectedEdition: boolean;
  isInsideLogistics: boolean;
  isClassic: boolean;
  selectEdition: (edition: AppEdition) => void;
  clearEdition: () => void;
};

const EditionContext = createContext<EditionContextValue | undefined>(undefined);

export function EditionProvider({ children }: { children: ReactNode }) {
  const [edition, setEdition] = useState<AppEdition | null>(() => readStoredEdition());

  const selectEdition = useCallback((next: AppEdition) => {
    persistEdition(next);
    setEdition(next);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('edition', next);
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const clearEdition = useCallback(() => {
    persistEdition(null);
    setEdition(null);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('edition');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  const value = useMemo<EditionContextValue>(
    () => ({
      edition,
      hasSelectedEdition: edition !== null,
      isInsideLogistics: edition === 'inside_logistics',
      isClassic: edition === 'classic',
      selectEdition,
      clearEdition,
    }),
    [edition, selectEdition, clearEdition],
  );

  return <EditionContext.Provider value={value}>{children}</EditionContext.Provider>;
}

export function useEditionContext() {
  const context = useContext(EditionContext);
  if (!context) {
    throw new Error('useEditionContext must be used within an EditionProvider');
  }
  return context;
}
