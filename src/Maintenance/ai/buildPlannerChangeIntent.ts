import { inferPlannerLineFromAsset, inferPlannerZoneFromAsset } from './buildPlannerAiSnapshot';
import { enrichPlanActionsWithPartsEta } from './plannerPartsEta';
import type {
  PlannerAiCalendarCardInput,
  PlannerAiChangeIntent,
  PlannerAiCopilotSuggestion,
  PlannerAiPlanAction,
  PlannerAiPlanVariant,
  PlannerAiShift,
  PlannerAiSpecialistAgentId,
} from './types';

function buildBaseAction(
  id: string,
  card: PlannerAiCalendarCardInput,
  recommendedDay: number,
  recommendedShift: PlannerAiShift,
): PlannerAiPlanAction {
  return {
    id,
    kind: 'reschedule-card',
    title: `Move ${card.title}`,
    asset: card.title,
    workOrderLabel: card.workOrder,
    sourceId: card.id,
    reason: 'Manual planner change routed through cascade review.',
    impactSummary: `Reschedule ${card.workOrder} to ${recommendedShift === 'day' ? 'day' : 'night'} shift on day ${recommendedDay + 1}.`,
    priorityLabel: card.priority,
    confidence: 82,
    executionReadiness: 'pass',
    agentContributors: ['Planner'],
    recommendedDay,
    recommendedShift,
    recommendedStartHour: card.startHour ?? 8,
    technicianName: card.assignee.name,
    line: inferPlannerLineFromAsset(card.title),
    zone: inferPlannerZoneFromAsset(card.title),
  };
}

export function buildIntentFromCardMove(
  card: PlannerAiCalendarCardInput,
  toDay: number,
  toShift: PlannerAiShift,
  source: 'manual-dnd' | 'reschedule-modal' = 'manual-dnd',
): PlannerAiChangeIntent {
  const actionId = `manual-move-${card.id}`;
  const syntheticActions = [buildBaseAction(actionId, card, toDay, toShift)];

  return {
    id: `intent-${card.id}-${toDay}-${toShift}`,
    source,
    label: source === 'reschedule-modal' ? 'Reschedule confirmation' : 'Weekly board move',
    summary: `Move ${card.workOrder} (${card.title}) to ${toShift === 'day' ? 'day' : 'night'} shift on day ${toDay + 1}.`,
    strategyLabel: source === 'reschedule-modal' ? 'Manual reschedule' : 'Manual weekly move',
    syntheticActions,
    manualCardMove: {
      cardId: card.id,
      toDay,
      toShift,
    },
    selectedActionIds: [actionId],
  };
}

export function buildIntentFromAiActions(
  variantId: string,
  strategyLabel: string,
  actions: PlannerAiPlanAction[],
  selectedActionIds: string[],
): PlannerAiChangeIntent {
  return {
    id: `intent-ai-${variantId}`,
    source: 'ai-apply',
    label: 'AI plan apply',
    summary: `${selectedActionIds.length} AI recommendation${selectedActionIds.length === 1 ? '' : 's'} selected for propagated apply.`,
    strategyLabel,
    syntheticActions: actions.filter((action) => selectedActionIds.includes(action.id)),
    variantId,
    selectedActionIds,
  };
}

export function buildIntentFromCopilotSuggestion(
  suggestion: PlannerAiCopilotSuggestion,
  planningItem: {
    wo: string;
    asset: string;
    line?: string;
    zone?: string;
    duration: string;
    priority: string;
    suggestedTechnician: string;
    type: string;
  },
  targetDay: number,
  targetShift: PlannerAiShift,
): PlannerAiChangeIntent {
  const actionId = `copilot-schedule-${suggestion.id}`;
  const syntheticActions: PlannerAiPlanAction[] = [
    {
      id: actionId,
      kind: 'schedule-planning-item',
      title: `Schedule ${planningItem.asset}`,
      asset: planningItem.asset,
      workOrderLabel: planningItem.wo,
      sourceId: planningItem.wo,
      reason: suggestion.summary,
      impactSummary: `Place ${planningItem.wo} on the weekly board from copilot drag.`,
      priorityLabel: planningItem.priority,
      confidence: 78,
      executionReadiness: 'pass',
      agentContributors: ['Planner', 'Labor'],
      recommendedDay: targetDay,
      recommendedShift: targetShift,
      recommendedStartHour: suggestion.recommendedStartHour ?? 8,
      technicianName: suggestion.suggestedTechnician ?? planningItem.suggestedTechnician,
      line: planningItem.line ?? inferPlannerLineFromAsset(planningItem.asset),
      zone: planningItem.zone ?? inferPlannerZoneFromAsset(planningItem.asset),
    },
  ];

  return {
    id: `intent-copilot-${suggestion.id}`,
    source: 'copilot-drag',
    label: 'Copilot drag-to-schedule',
    summary: suggestion.summary,
    strategyLabel: 'Copilot scheduling',
    syntheticActions,
    selectedActionIds: [actionId],
    copilotSchedule: {
      suggestionId: suggestion.id,
      targetDay,
      targetShift,
    },
  };
}

const emptyOrchestrationSummary = {
  strategy: 'recommended' as const,
  headline: 'Manual change review',
  summary: 'Cascade preview generated from a manual planner change.',
  participatingAgents: ['Planner'] as PlannerAiSpecialistAgentId[],
  blockedActionCount: 0,
  warningActionCount: 0,
  conflictCount: 0,
};

export function buildSyntheticPlanForIntent(intent: PlannerAiChangeIntent): PlannerAiPlanVariant {
  return {
    id: `synthetic-plan-${intent.id}`,
    label: intent.label,
    generatedAt: new Date().toLocaleString(),
    generationDurationMs: 0,
    generatorLabel: 'Planner cascade engine',
    horizonLabel: 'Weekly',
    confidence: 80,
    confidenceFactors: [],
    impactMetrics: [],
    feasibilityChecklist: [],
    actions: enrichPlanActionsWithPartsEta(intent.syntheticActions),
    blockers: [],
    narrative: intent.summary,
    rationale: {
      headline: intent.label,
      summary: intent.summary,
      tradeoffs: ['Manual changes still propagate cross-horizon impacts before commit.'],
      recommendedNextSteps: ['Review selected actions, then continue to cascade impacts before applying.'],
    },
    riskCallouts: [],
    partsReadiness: [],
    bundles: [],
    agentConflicts: [],
    agentEvaluations: [],
    orchestrationSummary: emptyOrchestrationSummary,
    strategy: 'recommended',
    strategyLabel: intent.strategyLabel,
    strategyDescription: intent.summary,
    summaryMetrics: {
      riskScore: 40,
      plannedDowntimeHours: 12,
      pmCompliance: 82,
      partsReadiness: 80,
      openBacklog: 0,
      laborLoad: 'Medium',
      annualCostDelta: 'neutral',
    },
    scheduleDelta: intent.syntheticActions.map((action) => ({
      id: `delta-${action.id}`,
      tone: 'move' as const,
      summary: action.title,
      detail: action.impactSummary,
    })),
    agentReasoning: [],
    longTermMetrics: [],
    tradeoffPoint: {
      variantId: `synthetic-plan-${intent.id}`,
      label: intent.strategyLabel,
      riskScore: 40,
      downtimeHours: 12,
      laborLoad: 'Medium',
    },
  };
}
