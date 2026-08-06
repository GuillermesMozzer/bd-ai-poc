import type {
  PlannerAiAssistantHorizon,
  PlannerAiCascadeImpact,
  PlannerAiCascadePreview,
  PlannerAiPlanningItemInput,
} from './types';

export type HorizonPlanningMutation = {
  horizon: PlannerAiAssistantHorizon;
  workOrderLabel: string;
  asset: string;
  badgeLabel: string;
  summary: string;
};

export type PropagatedPlanningItem = PlannerAiPlanningItemInput & {
  propagatedHorizons?: PlannerAiAssistantHorizon[];
};

function uniqueHorizons(horizons: PlannerAiAssistantHorizon[]) {
  return [...new Set(horizons)];
}

export function buildHorizonPlanningMutations(
  impacts: PlannerAiCascadeImpact[],
  selectedWorkOrders: string[],
): HorizonPlanningMutation[] {
  return impacts.flatMap((impact) =>
    impact.affectedWorkOrders.map((workOrderLabel) => ({
      horizon: impact.horizon,
      workOrderLabel,
      asset: workOrderLabel,
      badgeLabel: impact.badgeLabel,
      summary: impact.summary,
    })),
  ).filter((mutation) => selectedWorkOrders.length === 0 || selectedWorkOrders.includes(mutation.workOrderLabel));
}

export function propagateHorizonPlanningItems<T extends PlannerAiPlanningItemInput>(
  planningItems: T[],
  preview: PlannerAiCascadePreview | null,
): T[] {
  if (!preview) {
    return planningItems;
  }

  const selectedWorkOrders = preview.impacts
    .flatMap((impact) => impact.affectedWorkOrders)
    .filter((workOrder, index, list) => list.indexOf(workOrder) === index);

  if (!selectedWorkOrders.length) {
    return planningItems;
  }

  const horizonsByWorkOrder = new Map<string, PlannerAiAssistantHorizon[]>();
  preview.impacts.forEach((impact) => {
    impact.affectedWorkOrders.forEach((workOrderLabel) => {
      const current = horizonsByWorkOrder.get(workOrderLabel) ?? [];
      horizonsByWorkOrder.set(workOrderLabel, uniqueHorizons([...current, impact.horizon]));
    });
  });

  return planningItems.map((item) => {
    const propagatedHorizons = horizonsByWorkOrder.get(item.wo);
    if (!propagatedHorizons?.length) {
      return item;
    }

    return {
      ...item,
      propagatedHorizons,
    };
  });
}
