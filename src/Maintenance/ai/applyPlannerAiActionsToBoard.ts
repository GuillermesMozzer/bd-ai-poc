import type {
  PlannerAiCalendarCardInput,
  PlannerAiPlanAction,
  PlannerAiPlanningItemInput,
} from './types';

export type ApplyPlannerAiActionsResult = {
  cards: PlannerAiCalendarCardInput[];
  planningItems: PlannerAiPlanningItemInput[];
  appliedCount: number;
  createdCardIds: string[];
  updatedCardIds: string[];
};

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part.trim()[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function toCalendarPriority(priorityLabel: string): PlannerAiCalendarCardInput['priority'] {
  if (priorityLabel === 'Critical' || priorityLabel === 'High' || priorityLabel === 'Medium' || priorityLabel === 'Low') {
    return priorityLabel;
  }
  return 'Medium';
}

function buildCardFromPlanningItem(
  item: PlannerAiPlanningItemInput,
  action: Extract<PlannerAiPlanAction, { kind: 'schedule-planning-item' }>,
) {
  const assigneeName = action.technicianName ?? item.suggestedTechnician;
  return {
    id: `ai-card-${item.wo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    workOrder: item.wo,
    shift: action.recommendedShift,
    day: action.recommendedDay,
    startHour: action.recommendedStartHour,
    title: item.asset,
    type: item.type,
    priority: toCalendarPriority(item.priority),
    duration: item.duration,
    assignee: {
      name: assigneeName,
      initials: getInitials(assigneeName),
    },
    due: 'AI PLAN',
    statusOverride: 'Planning' as const,
  };
}

function buildCardFromFollowUpPromotion(action: Extract<PlannerAiPlanAction, { kind: 'promote-follow-up-request' }>) {
  const assigneeName = action.suggestedTechnician ?? 'BLU.AI Review';
  return {
    id: `ai-card-${action.workOrderLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    workOrder: action.workOrderLabel,
    shift: 'day' as const,
    day: 2,
    startHour: 9,
    title: action.asset,
    type: action.workType,
    priority: toCalendarPriority(action.priorityLabel),
    duration: action.durationLabel,
    assignee: {
      name: assigneeName,
      initials: getInitials(assigneeName),
    },
    due: 'AI PLAN',
    statusOverride: 'Planning' as const,
  };
}

export function applyPlannerAiActionsToBoard(
  cards: PlannerAiCalendarCardInput[],
  planningItems: PlannerAiPlanningItemInput[],
  selectedActions: PlannerAiPlanAction[],
): ApplyPlannerAiActionsResult {
  let nextCards = cards.map((card) => ({ ...card }));
  let nextPlanningItems = planningItems.map((item) => ({ ...item }));
  const createdCardIds: string[] = [];
  const updatedCardIds: string[] = [];
  let appliedCount = 0;

  selectedActions.forEach((action) => {
    if (action.kind === 'reschedule-card') {
      const cardIndex = nextCards.findIndex((card) => card.id === action.sourceId);
      if (cardIndex < 0) {
        return;
      }

      nextCards[cardIndex] = {
        ...nextCards[cardIndex],
        day: action.recommendedDay,
        shift: action.recommendedShift,
        startHour: action.recommendedStartHour ?? nextCards[cardIndex].startHour ?? 8,
        assignee: action.technicianName
          ? {
              name: action.technicianName,
              initials: getInitials(action.technicianName),
            }
          : nextCards[cardIndex].assignee,
      };
      updatedCardIds.push(action.sourceId);
      appliedCount += 1;
      return;
    }

    if (action.kind === 'schedule-planning-item') {
      const item = nextPlanningItems.find((entry) => entry.wo === action.sourceId);
      if (!item) {
        return;
      }

      nextPlanningItems = nextPlanningItems.filter((entry) => entry.wo !== action.sourceId);

      if (nextCards.some((card) => card.workOrder === item.wo)) {
        appliedCount += 1;
        return;
      }

      const card = buildCardFromPlanningItem(item, action);
      nextCards.push(card);
      createdCardIds.push(card.id);
      appliedCount += 1;
      return;
    }

    if (action.kind === 'promote-follow-up-request') {
      if (nextCards.some((card) => card.workOrder === action.workOrderLabel)) {
        appliedCount += 1;
        return;
      }

      const card = buildCardFromFollowUpPromotion(action);
      nextCards.push(card);
      createdCardIds.push(card.id);
      appliedCount += 1;
    }
  });

  return {
    cards: nextCards,
    planningItems: nextPlanningItems,
    appliedCount,
    createdCardIds,
    updatedCardIds,
  };
}
