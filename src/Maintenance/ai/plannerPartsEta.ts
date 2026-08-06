import { getPartsReadinessForAsset } from './adapters/sparePartsAdapter';
import type { PlannerAiPlanAction, PlannerAiPartsEtaRisk } from './types';

export type PlannerPartsEtaContext = {
  etaLabel: string;
  partsEtaLabel: string;
  risk: PlannerAiPartsEtaRisk;
  scheduleConflict: boolean;
  leadDays: number;
};

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function resolveLeadDays(
  asset: string,
  tags: string[],
  readinessStatus: ReturnType<typeof getPartsReadinessForAsset>['status'],
) {
  if (tags.some((tag) => tag.toLowerCase().includes('requested missing parts'))) {
    return 12;
  }

  if (tags.some((tag) => tag.toLowerCase().includes('parts reserved') || tag.toLowerCase().includes('parts ready'))) {
    return 0;
  }

  if (readinessStatus === 'ready') {
    return 0;
  }

  if (readinessStatus === 'risk') {
    return 5;
  }

  if (readinessStatus === 'blocked') {
    return 12;
  }

  return 7;
}

export function buildPlannerPartsEta(
  asset: string,
  tags: string[] = [],
  recommendedDay?: number,
  referenceDate = new Date(),
): PlannerPartsEtaContext {
  const readiness = getPartsReadinessForAsset(asset, tags);
  const leadDays = resolveLeadDays(asset, tags, readiness.status);
  const etaDate = addDays(referenceDate, leadDays);
  const etaLabel = formatShortDate(etaDate);
  const partsEtaLabel = leadDays === 0 ? 'Ready now' : etaLabel;

  let risk: PlannerAiPartsEtaRisk = leadDays === 0 ? 'ready' : leadDays <= 5 ? 'tight' : 'late';
  let scheduleConflict = false;

  if (recommendedDay !== undefined) {
    const scheduleDate = addDays(referenceDate, recommendedDay);
    if (etaDate.getTime() > scheduleDate.getTime()) {
      risk = 'late';
      scheduleConflict = true;
    } else if (leadDays > 0 && etaDate.getTime() === scheduleDate.getTime()) {
      risk = 'tight';
    } else if (leadDays === 0) {
      risk = 'ready';
    }
  }

  return {
    etaLabel,
    partsEtaLabel,
    risk,
    scheduleConflict,
    leadDays,
  };
}

export function buildPartsEtaNote(eta: PlannerPartsEtaContext) {
  if (eta.scheduleConflict) {
    return `Parts ETA ${eta.partsEtaLabel} · after proposed slot`;
  }

  if (eta.partsEtaLabel === 'Ready now') {
    return 'Parts ready · no lead time';
  }

  return `Parts ETA ${eta.partsEtaLabel}`;
}

export function enrichPlanActionWithPartsEta(
  action: PlannerAiPlanAction,
  tags: string[] = [],
  referenceDate = new Date(),
): PlannerAiPlanAction {
  const recommendedDay = action.kind === 'promote-follow-up-request' ? undefined : action.recommendedDay;
  const eta = buildPlannerPartsEta(action.asset, tags, recommendedDay, referenceDate);

  return {
    ...action,
    partsEtaLabel: eta.partsEtaLabel,
    partsEtaRisk: eta.risk,
    partsNote: action.partsNote ?? buildPartsEtaNote(eta),
  };
}

export function enrichPlanActionsWithPartsEta(
  actions: PlannerAiPlanAction[],
  referenceDate = new Date(),
): PlannerAiPlanAction[] {
  return actions.map((action) => enrichPlanActionWithPartsEta(action, [], referenceDate));
}
