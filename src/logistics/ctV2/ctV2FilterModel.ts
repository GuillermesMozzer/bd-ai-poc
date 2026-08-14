import {
  BD_PLANT_SITES,
  continentLabel,
  getPlantById,
  type BdContinent,
  type BdPlantSite,
} from '../networkMap/bdPlantSites';

export type CtV2SiteId = string;
export type CtV2Frequency = 'hourly' | 'shift' | 'daily' | 'weekly' | 'monthly';

/** Every BD plant from the Network Map catalog. */
export const CT_V2_SITES: CtV2SiteId[] = BD_PLANT_SITES.map((p) => p.id);

export const CT_V2_FREQUENCIES: { value: CtV2Frequency; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'shift', label: 'Shift' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

function plantKindWeight(kind: BdPlantSite['kind']): number {
  if (kind === 'manufacturing') return 1;
  if (kind === 'pharma') return 0.86;
  if (kind === 'distribution') return 0.58;
  return 0.38;
}

function hashId(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Relative plant volume vs a manufacturing baseline (demo). */
export const CT_V2_SITE_WEIGHT: Record<string, number> = Object.fromEntries(
  BD_PLANT_SITES.map((p) => {
    const jitter = 0.82 + (hashId(p.id) % 24) / 100;
    return [p.id, Number((plantKindWeight(p.kind) * jitter).toFixed(3))];
  }),
);

const ALL_PLANTS_WEIGHT = CT_V2_SITES.reduce((sum, id) => sum + (CT_V2_SITE_WEIGHT[id] ?? 0), 0);

/** Keep “all plants” near the previous 3-site demo scale. */
const NETWORK_BASELINE = 2.27;

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

/** Legacy 3-site labels used in older mock rows. */
export const LEGACY_SITE_TO_PLANT: Record<string, CtV2SiteId> = {
  'El Paso': 'us-elpaso',
  Sandy: 'us-sandy',
  Curitiba: 'br-sao-paulo',
  'Sao Paulo': 'br-sao-paulo',
};

export function plantForSiteId(id: string): BdPlantSite | undefined {
  return getPlantById(id);
}

export function siteShortName(id: string): string {
  return getPlantById(id)?.shortName ?? id;
}

export function siteContinent(id: string): BdContinent | undefined {
  return getPlantById(id)?.continent;
}

export function sitesByContinent(continent: BdContinent): CtV2SiteId[] {
  return BD_PLANT_SITES.filter((p) => p.continent === continent).map((p) => p.id);
}

export function groupedSiteOptions(): Array<{ continent: BdContinent; label: string; sites: BdPlantSite[] }> {
  const order: BdContinent[] = ['americas', 'europe', 'asia', 'africa', 'oceania'];
  return order.map((continent) => ({
    continent,
    label: continentLabel(continent),
    sites: BD_PLANT_SITES.filter((p) => p.continent === continent),
  }));
}

export function siteVolumeFactor(sites: CtV2SiteId[]): number {
  if (!sites.length) return NETWORK_BASELINE;
  const selected = sites.reduce((sum, site) => sum + (CT_V2_SITE_WEIGHT[site] ?? 0), 0);
  if (!ALL_PLANTS_WEIGHT) return NETWORK_BASELINE;
  return (selected / ALL_PLANTS_WEIGHT) * NETWORK_BASELINE;
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
      : sites.reduce((sum, site) => sum + (CT_V2_SITE_WEIGHT[site] ?? 0), 0) / sites.length;
  const networkAvg = ALL_PLANTS_WEIGHT / Math.max(1, CT_V2_SITES.length);
  const scaled = value * (siteAvg / Math.max(0.2, networkAvg)) * CT_V2_FREQ_TIME_FACTOR[frequency];
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
  if (sites.length === CT_V2_SITES.length) return `All plants (${CT_V2_SITES.length})`;
  if (sites.length === 0) return 'No plants';
  if (sites.length === 1) return siteShortName(sites[0]);
  if (sites.length === 2) return `${siteShortName(sites[0])} + ${siteShortName(sites[1])}`;
  return `${sites.length} plants`;
}

function resolveCandidateToPlantId(candidate: string): CtV2SiteId | null {
  if (CT_V2_SITES.includes(candidate)) return candidate;
  const alias = LEGACY_SITE_TO_PLANT[candidate];
  if (alias) return alias;
  const match = BD_PLANT_SITES.find(
    (p) =>
      p.shortName === candidate
      || p.city === candidate
      || p.name === candidate
      || p.city.startsWith(candidate)
      || candidate.startsWith(p.shortName),
  );
  return match?.id ?? null;
}

export function sitesInclude(sites: CtV2SiteId[], site: CtV2SiteId | string): boolean {
  const resolved = resolveCandidateToPlantId(String(site));
  if (resolved) return sites.includes(resolved);
  return sites.includes(site as CtV2SiteId);
}
