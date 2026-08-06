import { monitoringCards } from '../data/cbmMonitoringData';
import { getPartsReadinessForAsset } from './adapters/sparePartsAdapter';
import type { PlannerAiPartsReadiness, PlannerAiPartsStatus, PlannerAiRiskSignal } from './types';
import { getPlannerAiRiskSignals } from './adapters/cbmAdapter';

export type PlannerCardHealthSignal = {
  healthScore: number;
  severityLabel: string;
  tone: 'critical' | 'warning' | 'caution' | 'healthy' | 'unknown';
  metric: string;
  currentReading: string;
  daysToFailure: number;
  summary: string;
};

export type PlannerCardSignalSnapshot = {
  assetTitle: string;
  health: PlannerCardHealthSignal | null;
  parts: PlannerAiPartsReadiness;
};

function normalizeEquipmentLabel(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function extractEquipmentCode(label: string) {
  return label.toUpperCase().match(/[A-Z]+-\d+/)?.[0] ?? null;
}

export function isSamePlannerEquipmentLabel(firstLabel: string, secondLabel: string) {
  const normalizedFirst = normalizeEquipmentLabel(firstLabel);
  const normalizedSecond = normalizeEquipmentLabel(secondLabel);

  if (!normalizedFirst || !normalizedSecond) {
    return false;
  }

  if (normalizedFirst === normalizedSecond) {
    return true;
  }

  if (normalizedFirst.includes(normalizedSecond) || normalizedSecond.includes(normalizedFirst)) {
    return true;
  }

  const firstCode = extractEquipmentCode(firstLabel);
  const secondCode = extractEquipmentCode(secondLabel);

  return Boolean(firstCode && secondCode && firstCode === secondCode);
}

function findRiskSignalForAsset(assetTitle: string, signals: PlannerAiRiskSignal[]) {
  const directMatches = signals.filter((signal) => isSamePlannerEquipmentLabel(assetTitle, signal.asset));

  if (directMatches.length) {
    return directMatches.sort((left, right) => left.healthScore - right.healthScore)[0];
  }

  if (/extrusion/i.test(assetTitle)) {
    const extrusionMatch = signals.find((signal) => /extruder|extrusion/i.test(signal.asset));
    if (extrusionMatch) {
      return extrusionMatch;
    }
  }

  if (/boiler|feed pump/i.test(assetTitle)) {
    const pumpMatch = signals.find((signal) => /pump/i.test(signal.asset));
    if (pumpMatch) {
      return pumpMatch;
    }
  }

  if (/labeler|packaging robot/i.test(assetTitle)) {
    const packagingMatch = signals.find((signal) => /packaging|labeler/i.test(signal.asset));
    if (packagingMatch) {
      return packagingMatch;
    }
  }

  return null;
}

function mapHealthTone(healthScore: number, severity: string): PlannerCardHealthSignal['tone'] {
  if (severity === 'critical' || healthScore <= 20) {
    return 'critical';
  }

  if (severity === 'high' || healthScore <= 40) {
    return 'warning';
  }

  if (healthScore <= 65) {
    return 'caution';
  }

  if (healthScore > 65) {
    return 'healthy';
  }

  return 'unknown';
}

function mapMonitoringSeverity(severity: string): PlannerAiRiskSignal['severity'] {
  if (severity === 'critical') {
    return 'critical';
  }

  if (severity === 'mediumCritical') {
    return 'high';
  }

  if (severity === 'lessCritical') {
    return 'medium';
  }

  return 'low';
}

function buildHealthSignal(assetTitle: string): PlannerCardHealthSignal | null {
  const riskSignals = getPlannerAiRiskSignals();
  const matchedSignal = findRiskSignalForAsset(assetTitle, riskSignals);

  if (matchedSignal) {
    const tone = mapHealthTone(matchedSignal.healthScore, matchedSignal.severity);
    return {
      healthScore: matchedSignal.healthScore,
      severityLabel: matchedSignal.severity === 'critical' ? 'Critical' : matchedSignal.severity === 'high' ? 'Elevated' : 'Watch',
      tone,
      metric: matchedSignal.metric,
      currentReading: matchedSignal.currentReading,
      daysToFailure: matchedSignal.daysToFailure,
      summary: `${matchedSignal.metric} at ${matchedSignal.currentReading} · ${matchedSignal.daysToFailure}d to failure (mock CBM)`,
    };
  }

  const monitoringMatch = monitoringCards
    .filter((card) => isSamePlannerEquipmentLabel(assetTitle, card.asset))
    .sort((left, right) => left.healthScore - right.healthScore)[0];

  if (!monitoringMatch) {
    return null;
  }

  const severity = mapMonitoringSeverity(monitoringMatch.severity);
  return {
    healthScore: monitoringMatch.healthScore,
    severityLabel: monitoringMatch.statusLabel,
    tone: mapHealthTone(monitoringMatch.healthScore, severity),
    metric: monitoringMatch.metric,
    currentReading: monitoringMatch.currentReading,
    daysToFailure: monitoringMatch.daysToFailure,
    summary: `${monitoringMatch.metric} at ${monitoringMatch.currentReading} · ${monitoringMatch.daysToFailure}d to failure (mock CBM)`,
  };
}

export function getPartsTone(status: PlannerAiPartsStatus): 'ready' | 'warning' | 'blocked' | 'unknown' {
  if (status === 'ready') {
    return 'ready';
  }

  if (status === 'risk') {
    return 'warning';
  }

  if (status === 'blocked') {
    return 'blocked';
  }

  return 'unknown';
}

export function getPartsChipLabel(status: PlannerAiPartsStatus) {
  switch (status) {
    case 'ready':
      return 'Parts ready';
    case 'risk':
      return 'Parts low';
    case 'blocked':
      return 'Parts blocked';
    default:
      return 'Parts n/a';
  }
}

export function getHealthChipLabel(health: PlannerCardHealthSignal) {
  return `Health ${health.healthScore}`;
}

export function getPlannerCardSignals(assetTitle: string, tags: string[] = []): PlannerCardSignalSnapshot {
  return {
    assetTitle,
    health: buildHealthSignal(assetTitle),
    parts: getPartsReadinessForAsset(assetTitle, tags),
  };
}

export function findPlannerCardIdForAsset<T extends { id: string; title: string }>(
  cards: readonly T[],
  assetLabel: string,
): string | null {
  const match = cards.find((card) => isSamePlannerEquipmentLabel(card.title, assetLabel));
  return match?.id ?? null;
}

export type WeeklyBoardInsightLink = {
  asset: string;
  cardId: string;
  healthScore: number;
};

export function getWeeklyBoardInsightLinks(
  cards: readonly { id: string; title: string }[],
  riskSignals: PlannerAiRiskSignal[] = getPlannerAiRiskSignals(),
): WeeklyBoardInsightLink[] {
  const uniqueTitles = [...new Set(cards.map((card) => card.title))];

  return uniqueTitles
    .map((title) => {
      const cardId = findPlannerCardIdForAsset(cards, title);
      if (!cardId) {
        return null;
      }

      const health = buildHealthSignal(title);
      const matchedSignal = findRiskSignalForAsset(title, riskSignals);

      return {
        asset: title,
        cardId,
        healthScore: health?.healthScore ?? matchedSignal?.healthScore ?? 100,
      };
    })
    .filter((entry): entry is WeeklyBoardInsightLink => entry !== null)
    .sort((left, right) => left.healthScore - right.healthScore);
}

export function pickWeeklyBoardInsightLink(
  cards: readonly { id: string; title: string }[],
  preferredAssets: Array<string | undefined>,
  riskSignals: PlannerAiRiskSignal[] = getPlannerAiRiskSignals(),
): WeeklyBoardInsightLink | null {
  const boardLinks = getWeeklyBoardInsightLinks(cards, riskSignals);

  for (const preferredAsset of preferredAssets) {
    if (!preferredAsset) {
      continue;
    }

    const preferredLink = boardLinks.find((link) => isSamePlannerEquipmentLabel(link.asset, preferredAsset));
    if (preferredLink) {
      return preferredLink;
    }
  }

  return boardLinks[0] ?? null;
}
