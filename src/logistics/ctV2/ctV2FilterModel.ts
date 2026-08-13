export type CtV2SiteId = 'El Paso' | 'Sandy' | 'Curitiba';

export type CtV2Frequency = 'hourly' | 'shift' | 'daily' | 'weekly' | 'monthly';

export const CT_V2_SITES: CtV2SiteId[] = ['El Paso', 'Sandy', 'Curitiba'];

export const CT_V2_FREQUENCIES: { value: CtV2Frequency; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'shift', label: 'Shift' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

/** Relative plant volume vs El Paso baseline (demo). */
export const CT_V2_SITE_WEIGHT: Record<CtV2SiteId, number> = {
  'El Paso': 1,
  Sandy: 0.72,
  Curitiba: 0.55,
};

/** Volume multiplier vs shift baseline (demo). */
export const CT_V2_FREQ_MULTIPLIER: Record<CtV2Frequency, number> = {
  hourly: 0.28,
  shift: 1,
  daily: 2.6,
  weekly: 11,
  monthly: 42,
};

/** Cycle-time / aging feel by horizon (demo). */
export const CT_V2_FREQ_TIME_FACTOR: Record<CtV2Frequency, number> = {
  hourly: 0.55,
  shift: 1,
  daily: 1.15,
  weekly: 1.35,
  monthly: 1.55,
};

export const CT_V2_FREQ_PERIOD_LABEL: Record<CtV2Frequency, string> = {
  hourly: 'Last 7 hours',
  shift: 'Current shift',
  daily: 'Last 7 days',
  weekly: 'Last 7 weeks',
  monthly: 'Last 7 months',
};

export const CT_V2_FREQ_AXIS: Record<CtV2Frequency, string[]> = {
  hourly: ['H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1', 'Now'],
  shift: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  daily: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  weekly: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
  monthly: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'],
};

export function siteVolumeFactor(sites: CtV2SiteId[]): number {
  if (!sites.length) return 1;
  return sites.reduce((sum, site) => sum + CT_V2_SITE_WEIGHT[site], 0);
}

export function scaleCount(value: number, sites: CtV2SiteId[], frequency: CtV2Frequency): number {
  const scaled = value * siteVolumeFactor(sites) * CT_V2_FREQ_MULTIPLIER[frequency];
  return Math.max(0, Math.round(scaled));
}

export function scaleDecimal(
  value: number,
  sites: CtV2SiteId[],
  frequency: CtV2Frequency,
  digits = 1,
): number {
  const siteAvg =
    sites.length === 0
      ? 1
      : sites.reduce((sum, site) => sum + CT_V2_SITE_WEIGHT[site], 0) / sites.length;
  const scaled = value * siteAvg * CT_V2_FREQ_TIME_FACTOR[frequency];
  const factor = 10 ** digits;
  return Math.round(scaled * factor) / factor;
}

export function scaleSparkline(
  values: number[],
  sites: CtV2SiteId[],
  frequency: CtV2Frequency,
): number[] {
  return values.map((v) => scaleCount(v, sites, frequency));
}

export function formatSitesLabel(sites: CtV2SiteId[]): string {
  if (sites.length === CT_V2_SITES.length) return 'All plants';
  if (sites.length === 0) return 'No plants';
  if (sites.length === 1) return sites[0];
  return `${sites.length} plants`;
}

export function sitesInclude(sites: CtV2SiteId[], site: CtV2SiteId | string): boolean {
  return sites.includes(site as CtV2SiteId);
}
