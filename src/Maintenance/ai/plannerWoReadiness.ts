import { getPartsReadinessForAsset } from './adapters/sparePartsAdapter';
import type { PlannerAiPartsStatus } from './types';

export type PlannerWoReadinessStatus = 'ready' | 'warning' | 'blocked' | 'unknown';

export type PlannerWoReadinessDimension = {
  label: string;
  score: number;
  status: PlannerWoReadinessStatus;
  detail: string;
};

export type PlannerWoReadinessBreakdown = {
  overallScore: number;
  materials: PlannerWoReadinessDimension;
  labor: PlannerWoReadinessDimension;
  tooling: PlannerWoReadinessDimension;
};

function mapPartsStatusToScore(status: PlannerAiPartsStatus): number {
  switch (status) {
    case 'ready':
      return 96;
    case 'risk':
      return 58;
    case 'blocked':
      return 22;
    default:
      return 50;
  }
}

function mapPartsStatusToReadiness(status: PlannerAiPartsStatus): PlannerWoReadinessStatus {
  switch (status) {
    case 'ready':
      return 'ready';
    case 'risk':
      return 'warning';
    case 'blocked':
      return 'blocked';
    default:
      return 'unknown';
  }
}

function buildLaborDimension(assigneeName?: string, assetTitle?: string): PlannerWoReadinessDimension {
  if (assigneeName?.trim()) {
    return {
      label: 'Labor',
      score: 90,
      status: 'ready',
      detail: `${assigneeName} is assigned and shift coverage is available for this window.`,
    };
  }

  return {
    label: 'Labor',
    score: 42,
    status: 'warning',
    detail: `No technician is assigned yet for ${assetTitle ?? 'this work order'}.`,
  };
}

function buildToolingDimension(assetTitle: string, tags: string[] = []): PlannerWoReadinessDimension {
  const normalized = `${assetTitle} ${tags.join(' ')}`.toLowerCase();

  if (normalized.includes('tooling') || normalized.includes('mold') || normalized.includes('press')) {
    return {
      label: 'Tooling',
      score: 68,
      status: 'warning',
      detail: 'Specialty tooling is required — verify calibration and crib availability before release.',
    };
  }

  if (normalized.includes('conveyor') || normalized.includes('pump') || normalized.includes('boiler')) {
    return {
      label: 'Tooling',
      score: 88,
      status: 'ready',
      detail: 'Standard maintenance tooling kit is available for this asset class.',
    };
  }

  return {
    label: 'Tooling',
    score: 82,
    status: 'ready',
    detail: 'No specialty tooling gate is flagged for this work order.',
  };
}

export function buildPlannerWoReadiness(
  assetTitle: string,
  options: { tags?: string[]; assigneeName?: string } = {},
): PlannerWoReadinessBreakdown {
  const tags = options.tags ?? [];
  const parts = getPartsReadinessForAsset(assetTitle, tags);
  const materialsScore = mapPartsStatusToScore(parts.status);
  const labor = buildLaborDimension(options.assigneeName, assetTitle);
  const tooling = buildToolingDimension(assetTitle, tags);
  const overallScore = Math.round((materialsScore + labor.score + tooling.score) / 3);

  return {
    overallScore,
    materials: {
      label: 'Materials',
      score: materialsScore,
      status: mapPartsStatusToReadiness(parts.status),
      detail: `${parts.summary} ${parts.detail}`,
    },
    labor,
    tooling,
  };
}

export function getReadinessScoreTone(score: number): 'ready' | 'warning' | 'blocked' {
  if (score >= 80) {
    return 'ready';
  }

  if (score >= 55) {
    return 'warning';
  }

  return 'blocked';
}
