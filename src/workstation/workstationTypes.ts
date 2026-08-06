import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from './theme';
export const workstationTypeOrder = [
  'Tier Management',
  'Quality',
  'Leadership',
  'Maintenance',
  'Production',
  'Engineering',
  'Safety',
] as const;

export type WorkstationType = typeof workstationTypeOrder[number];

export type WorkstationTypeOption = {
  accent: string;
  border: string;
  description: string;
  laneBackground: string;
  label: WorkstationType;
  tint: string;
};

export const workstationTypeOptions: WorkstationTypeOption[] = [
  {
    label: 'Tier Management',
    description: 'Tier boards, operator views, and escalation cadence workstations.',
    accent: tokenBrand.main,
    tint: tokenNeutral.lighter,
    border: tokenInfo.lightest,
    laneBackground: 'rgba(37, 99, 235, 0.06)',
  },
  {
    label: 'Quality',
    description: 'Quality review, defect tracking, FPY, CAPA, and containment workstations.',
    accent: tokenBrand.lighter,
    tint: tokenNeutral.lightest,
    border: tokenNeutral.main,
    laneBackground: 'rgba(139, 92, 246, 0.06)',
  },
  {
    label: 'Leadership',
    description: 'Leader, supervisor, and site review workstations.',
    accent: workstationVisuals.tierTextLabel,
    tint: workstationVisuals.slateSurface,
    border: tokenNeutral.dark,
    laneBackground: 'rgba(71, 85, 105, 0.06)',
  },
  {
    label: 'Maintenance',
    description: 'Maintenance planning, downtime, PM, and asset care workstations.',
    accent: tokenWarning.dark,
    tint: tokenNeutral.lightest,
    border: tokenWarning.lightest,
    laneBackground: 'rgba(249, 115, 22, 0.06)',
  },
  {
    label: 'Production',
    description: 'Production flow, output, line performance, and KPI workstations.',
    accent: tokenSuccess.main,
    tint: tokenNeutral.lighter,
    border: tokenSuccess.lightest,
    laneBackground: 'rgba(22, 163, 74, 0.06)',
  },
  {
    label: 'Engineering',
    description: 'Process engineering, technical review, and line support workstations.',
    accent: tokenInfo.darker,
    tint: tokenNeutral.lightest,
    border: tokenInfo.lightest,
    laneBackground: 'rgba(8, 145, 178, 0.06)',
  },
  {
    label: 'Safety',
    description: 'Safety tracking, incidents, and risk follow-up workstations.',
    accent: tokenError.main,
    tint: tokenNeutral.lighter,
    border: tokenError.lightest,
    laneBackground: 'rgba(239, 68, 68, 0.06)',
  },
];

const workstationTypeMetaByLabel = new Map(
  workstationTypeOptions.map((option) => [option.label, option]),
);

export function isWorkstationType(value: unknown): value is WorkstationType {
  return typeof value === 'string' && workstationTypeMetaByLabel.has(value as WorkstationType);
}

export function getWorkstationTypeMeta(type: WorkstationType) {
  return workstationTypeMetaByLabel.get(type) ?? workstationTypeOptions[0];
}

export function inferWorkstationType({
  title = '',
  domains = [],
  apps = [],
}: {
  apps?: string[];
  domains?: string[];
  title?: string;
}): WorkstationType {
  const normalizedTitle = normalizeValue(title);
  const signals = [normalizedTitle, ...domains.map(normalizeValue), ...apps.map(normalizeValue)];

  if (matchesAny(signals, ['tier', 'operator view', 'operator', 'escalation', 'tier meeting'])) {
    return 'Tier Management';
  }
  if (matchesAny(signals, ['leader', 'leadership', 'supervisor', 'site review', 'executive'])) {
    return 'Leadership';
  }
  if (matchesAny(signals, ['quality', 'fpy', 'scrap', 'defect', 'capa', 'complaint', 'containment'])) {
    return 'Quality';
  }
  if (matchesAny(signals, ['safety', 'incident', 'near miss', 'sheq', 'eso', 'risk'])) {
    return 'Safety';
  }
  if (matchesAny(signals, ['maintenance', 'downtime', 'cbm', 'pmd', 'asset', 'tool crib', 'equipment'])) {
    return 'Maintenance';
  }
  if (matchesAny(signals, ['engineering', 'traceability', 'technical', 'process'])) {
    return 'Engineering';
  }
  return 'Production';
}

function matchesAny(signals: string[], keywords: string[]) {
  return keywords.some((keyword) => signals.some((signal) => signal.includes(keyword)));
}

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}
