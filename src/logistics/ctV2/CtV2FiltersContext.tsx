import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import {
  CT_V2_SITES,
  type CtV2Frequency,
  type CtV2SiteId,
  formatSitesLabel,
  scaleCount,
  scaleDecimal,
  scaleSparkline,
  siteVolumeFactor,
  CT_V2_FREQ_PERIOD_LABEL,
  CT_V2_FREQ_AXIS,
} from './ctV2FilterModel';

const FILTER_STORAGE_KEY = 'bd-logistics-ct-v2-filters-v1';

type StoredFilters = {
  sites: CtV2SiteId[];
  frequency: CtV2Frequency;
};

type CtV2FiltersContextValue = {
  sites: CtV2SiteId[];
  frequency: CtV2Frequency;
  setSites: (sites: CtV2SiteId[]) => void;
  setFrequency: (frequency: CtV2Frequency) => void;
  toggleSite: (site: CtV2SiteId) => void;
  selectAllSites: () => void;
  sitesLabel: string;
  periodLabel: string;
  axisLabels: string[];
  volumeFactor: number;
  scaleCount: (value: number) => number;
  scaleDecimal: (value: number, digits?: number) => number;
  scaleSparkline: (values: number[]) => number[];
  includesSite: (site: string) => boolean;
};

const CtV2FiltersContext = createContext<CtV2FiltersContextValue | null>(null);

function readStoredFilters(): StoredFilters {
  if (typeof window === 'undefined') {
    return { sites: [...CT_V2_SITES], frequency: 'shift' };
  }
  try {
    const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return { sites: [...CT_V2_SITES], frequency: 'shift' };
    const parsed = JSON.parse(raw) as Partial<StoredFilters>;
    const sites = Array.isArray(parsed.sites)
      ? parsed.sites.filter((s): s is CtV2SiteId => CT_V2_SITES.includes(s as CtV2SiteId))
      : [...CT_V2_SITES];
    const frequency =
      parsed.frequency === 'hourly'
      || parsed.frequency === 'shift'
      || parsed.frequency === 'daily'
      || parsed.frequency === 'weekly'
      || parsed.frequency === 'monthly'
        ? parsed.frequency
        : 'shift';
    return { sites: sites.length ? sites : [...CT_V2_SITES], frequency };
  } catch {
    return { sites: [...CT_V2_SITES], frequency: 'shift' };
  }
}

function writeStoredFilters(next: StoredFilters) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(next));
}

export function CtV2FiltersProvider({ children }: { children: React.ReactNode }) {
  const initial = useMemo(() => readStoredFilters(), []);
  const [sites, setSitesState] = useState<CtV2SiteId[]>(initial.sites);
  const [frequency, setFrequencyState] = useState<CtV2Frequency>(initial.frequency);

  const setSites = useCallback((next: CtV2SiteId[]) => {
    const normalized = next.length ? next : [...CT_V2_SITES];
    setSitesState(normalized);
    writeStoredFilters({ sites: normalized, frequency });
  }, [frequency]);

  const setFrequency = useCallback((next: CtV2Frequency) => {
    setFrequencyState(next);
    writeStoredFilters({ sites, frequency: next });
  }, [sites]);

  const toggleSite = useCallback((site: CtV2SiteId) => {
    setSitesState((prev) => {
      const exists = prev.includes(site);
      let next = exists ? prev.filter((s) => s !== site) : [...prev, site];
      if (next.length === 0) next = [site];
      writeStoredFilters({ sites: next, frequency });
      return next;
    });
  }, [frequency]);

  const selectAllSites = useCallback(() => {
    setSites([...CT_V2_SITES]);
  }, [setSites]);

  const value = useMemo<CtV2FiltersContextValue>(() => ({
    sites,
    frequency,
    setSites,
    setFrequency,
    toggleSite,
    selectAllSites,
    sitesLabel: formatSitesLabel(sites),
    periodLabel: CT_V2_FREQ_PERIOD_LABEL[frequency],
    axisLabels: CT_V2_FREQ_AXIS[frequency],
    volumeFactor: siteVolumeFactor(sites),
    scaleCount: (n) => scaleCount(n, sites, frequency),
    scaleDecimal: (n, digits) => scaleDecimal(n, sites, frequency, digits),
    scaleSparkline: (values) => scaleSparkline(values, sites, frequency),
    includesSite: (site) => sites.includes(site as CtV2SiteId),
  }), [sites, frequency, setSites, setFrequency, toggleSite, selectAllSites]);

  return <CtV2FiltersContext.Provider value={value}>{children}</CtV2FiltersContext.Provider>;
}

export function useCtV2Filters(): CtV2FiltersContextValue {
  const ctx = useContext(CtV2FiltersContext);
  if (!ctx) {
    return {
      sites: [...CT_V2_SITES],
      frequency: 'shift',
      setSites: () => undefined,
      setFrequency: () => undefined,
      toggleSite: () => undefined,
      selectAllSites: () => undefined,
      sitesLabel: 'All plants',
      periodLabel: CT_V2_FREQ_PERIOD_LABEL.shift,
      axisLabels: CT_V2_FREQ_AXIS.shift,
      volumeFactor: siteVolumeFactor([...CT_V2_SITES]),
      scaleCount: (n) => scaleCount(n, [...CT_V2_SITES], 'shift'),
      scaleDecimal: (n, digits) => scaleDecimal(n, [...CT_V2_SITES], 'shift', digits),
      scaleSparkline: (values) => scaleSparkline(values, [...CT_V2_SITES], 'shift'),
      includesSite: () => true,
    };
  }
  return ctx;
}
