import type { FollowUpPlanningSnapshot } from '../adapters/followUpAdapter';
import { getPartsReadinessForAsset } from '../adapters/sparePartsAdapter';
import { buildPlannerAiSnapshot } from '../buildPlannerAiSnapshot';
import type {
  PlannerAiCalendarCardInput,
  PlannerAiFeasibilityStatus,
  PlannerAiPartsReadiness,
  PlannerAiPlannerSnapshot,
  PlannerAiPlanningItemInput,
  PlannerAiRiskSignal,
} from '../types';

export type PlannerAiAnalysis = {
  planningTarget: PlannerAiPlanningItemInput | null;
  secondaryPlanningTarget: PlannerAiPlanningItemInput | null;
  conveyorCard: PlannerAiCalendarCardInput | null;
  secondaryCard: PlannerAiCalendarCardInput | null;
  moldingRequest: FollowUpPlanningSnapshot['requests'][number] | null;
  secondaryRequest: FollowUpPlanningSnapshot['requests'][number] | null;
  followUpSnapshot: FollowUpPlanningSnapshot;
  criticalSignals: PlannerAiRiskSignal[];
  riskByAsset: Map<string, PlannerAiRiskSignal>;
  blockers: Array<{ id: string; asset: string; status: 'risk' | 'blocked'; summary: string; detail: string; sourceLabel: string }>;
  partsReadiness: PlannerAiPartsReadiness[];
  baseline: {
    riskScore: number;
    pmCompliance: number;
    plannedDowntimeHours: number;
    partsReadiness: number;
    openBacklog: number;
  };
};

export function getExecutionReadiness(partsReadiness: PlannerAiPartsReadiness | undefined): PlannerAiFeasibilityStatus {
  if (!partsReadiness) {
    return 'warning';
  }

  if (partsReadiness.status === 'blocked') {
    return 'blocker';
  }

  if (partsReadiness.status === 'risk' || partsReadiness.status === 'unknown') {
    return 'warning';
  }

  return 'pass';
}

export function formatDay(day: number) {
  return `Day ${day + 1}`;
}

export function analyzePlannerSnapshot(snapshot: PlannerAiPlannerSnapshot): PlannerAiAnalysis {
  const riskByAsset = new Map<string, PlannerAiRiskSignal>();
  snapshot.riskSignals.forEach((signal) => {
    const current = riskByAsset.get(signal.asset);
    if (!current || signal.daysToFailure < current.daysToFailure || signal.healthScore < current.healthScore) {
      riskByAsset.set(signal.asset, signal);
    }
  });

  const followUpSnapshot = snapshot.followUpSnapshot;
  const planningTarget =
    snapshot.planningItems.find((item) => riskByAsset.get(item.asset)?.severity === 'critical') ??
    snapshot.planningItems[0] ??
    null;
  const secondaryPlanningTarget =
    snapshot.planningItems.find((item) => item.wo !== planningTarget?.wo) ?? null;
  const conveyorCard =
    [...snapshot.cards]
      .filter((card) => card.title === 'Conveyor CV-101')
      .sort((left, right) => right.day - left.day)[0] ?? null;
  const secondaryCard = [...snapshot.cards].find((card) => card.id !== conveyorCard?.id) ?? null;
  const moldingRequest =
    followUpSnapshot.requests.find((item) => item.asset.toLowerCase().includes('molding')) ?? followUpSnapshot.requests[0] ?? null;
  const secondaryRequest = followUpSnapshot.requests.find((item) => item.id !== moldingRequest?.id) ?? null;

  const actionPartsReadiness: PlannerAiPartsReadiness[] = [
    ...(planningTarget ? [getPartsReadinessForAsset(planningTarget.asset)] : []),
    ...(secondaryPlanningTarget ? [getPartsReadinessForAsset(secondaryPlanningTarget.asset)] : []),
    ...(conveyorCard ? [getPartsReadinessForAsset(conveyorCard.title)] : []),
    ...(secondaryCard ? [getPartsReadinessForAsset(secondaryCard.title)] : []),
    ...(moldingRequest ? [getPartsReadinessForAsset(moldingRequest.asset, moldingRequest.tags)] : []),
    ...(secondaryRequest ? [getPartsReadinessForAsset(secondaryRequest.asset, secondaryRequest.tags)] : []),
  ];

  const blockedFollowUpReadiness = followUpSnapshot.blockedScheduled.map((item) =>
    getPartsReadinessForAsset(item.asset, item.tags),
  );
  const blockers = blockedFollowUpReadiness
    .filter((readiness): readiness is PlannerAiPartsReadiness & { status: 'blocked' | 'risk' } =>
      readiness.status === 'blocked' || readiness.status === 'risk',
    )
    .map((readiness, index) => ({
      id: `blocker-${index + 1}`,
      asset: readiness.asset,
      status: readiness.status,
      summary: readiness.summary,
      detail: readiness.detail,
      sourceLabel: readiness.sourceLabel ?? 'Spare parts',
    }));

  const criticalSignals = snapshot.riskSignals
    .filter((signal) => signal.severity === 'critical' || signal.severity === 'high')
    .sort((left, right) => left.daysToFailure - right.daysToFailure)
    .slice(0, 3);

  return {
    planningTarget,
    secondaryPlanningTarget,
    conveyorCard,
    secondaryCard,
    moldingRequest,
    secondaryRequest,
    followUpSnapshot,
    criticalSignals,
    riskByAsset,
    blockers,
    partsReadiness: [...actionPartsReadiness, ...blockedFollowUpReadiness],
    baseline: snapshot.baseline,
  };
}

export function analyzePlannerInputs(cards: PlannerAiCalendarCardInput[], planningItems: PlannerAiPlanningItemInput[]): PlannerAiAnalysis {
  return analyzePlannerSnapshot(
    buildPlannerAiSnapshot({
      cards,
      planningItems,
    }),
  );
}
