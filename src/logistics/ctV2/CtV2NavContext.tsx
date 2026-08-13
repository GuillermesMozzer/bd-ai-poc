import React, { createContext, useContext } from 'react';

export type CtV2View = 'overview' | 'dashboard' | 'receiving' | 'wip' | 'outbound';

export type CtV2AreaId = 'receiving' | 'wip' | 'outbound';

type CtV2NavContextValue = {
  view: CtV2View;
  setView: (view: CtV2View) => void;
  goToArea: (area: CtV2AreaId) => void;
};

const CtV2NavContext = createContext<CtV2NavContextValue | null>(null);

export function CtV2NavProvider({
  view,
  setView,
  children,
}: {
  view: CtV2View;
  setView: (view: CtV2View) => void;
  children: React.ReactNode;
}) {
  const value: CtV2NavContextValue = {
    view,
    setView,
    goToArea: (area) => setView(area),
  };
  return <CtV2NavContext.Provider value={value}>{children}</CtV2NavContext.Provider>;
}

export function useCtV2Nav(): CtV2NavContextValue {
  const ctx = useContext(CtV2NavContext);
  if (!ctx) {
    return {
      view: 'overview',
      setView: () => undefined,
      goToArea: () => undefined,
    };
  }
  return ctx;
}

export function areaIdFromMacroflowArea(area: string): CtV2AreaId {
  if (area === 'receiving') return 'receiving';
  if (area === 'outbound') return 'outbound';
  return 'wip';
}
