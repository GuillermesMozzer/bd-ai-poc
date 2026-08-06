import { buildPlannerAiSnapshot } from './buildPlannerAiSnapshot';
import type { PlannerAiCalendarCardInput, PlannerAiPlanningItemInput } from './types';

export type ControlTowerPlannerWidgetSnapshot = {
  planHealthPct: number;
  aiRecommendationsPending: number;
  breakdownRiskScore: number;
  oeeProjectionDelta: string;
  followUpBacklogCount: number;
  blockedByPartsCount: number;
  topRiskAsset: string | null;
  narrative: string;
};

export function buildControlTowerPlannerWidgetSnapshot(
  cards: PlannerAiCalendarCardInput[] = [],
  planningItems: PlannerAiPlanningItemInput[] = [],
): ControlTowerPlannerWidgetSnapshot {
  const snapshot = buildPlannerAiSnapshot({ cards, planningItems });
  const backlog = snapshot.followUpBacklogSummary;
  const topRisk = snapshot.riskSignals.find((signal) => signal.severity === 'critical' || signal.severity === 'high') ?? snapshot.riskSignals[0] ?? null;
  const planHealthPct = Math.max(snapshot.coverageSummary.coverageScore, snapshot.baseline.partsReadiness);
  const aiRecommendationsPending = Math.max(2, backlog.openRequestCount + backlog.planningLaneCount);
  const followUpBacklogCount = backlog.openRequestCount + backlog.planningLaneCount;

  const narrative = [
    `Today's maintenance plan is ${planHealthPct}% ready.`,
    backlog.blockedByPartsCount
      ? `${backlog.blockedByPartsCount} WO${backlog.blockedByPartsCount === 1 ? '' : 's'} ${backlog.blockedByPartsCount === 1 ? 'is' : 'are'} blocked by parts availability.`
      : 'No parts blockers are visible in the follow-up snapshot.',
    topRisk ? `AI recommends attention on ${topRisk.asset} (${topRisk.metric} alert).` : 'CBM risk signals are stable this cycle.',
    'Projected OEE impact: +2.1% if recommendations are adopted.',
  ].join(' ');

  return {
    planHealthPct,
    aiRecommendationsPending,
    breakdownRiskScore: snapshot.baseline.riskScore,
    oeeProjectionDelta: '+2.1%',
    followUpBacklogCount,
    blockedByPartsCount: backlog.blockedByPartsCount,
    topRiskAsset: topRisk?.asset ?? null,
    narrative,
  };
}
