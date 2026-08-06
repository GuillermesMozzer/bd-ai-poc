import { inferPlannerLineFromAsset, inferPlannerZoneFromAsset } from './buildPlannerAiSnapshot';
import { buildIntentFromCopilotSuggestion, buildSyntheticPlanForIntent } from './buildPlannerChangeIntent';
import { enrichPlanActionsWithPartsEta } from './plannerPartsEta';
import type { PlannerAiAnalysis } from './agents/plannerAiAnalysis';
import type {
  PlannerAiCalendarCardInput,
  PlannerAiChangeIntent,
  PlannerAiCopilotSuggestion,
  PlannerAiPlanAction,
  PlannerAiPlanVariant,
  PlannerAiPlanningItemInput,
  PlannerAiShift,
  PlannerAiSpecialistAgentId,
  PlannerAiWhatIfResult,
  PlannerAiWhatIfScenario,
} from './types';

function enrichReviewPlan(
  plan: PlannerAiPlanVariant,
  overrides: {
    label?: string;
    strategyLabel?: string;
    narrative?: string;
    headline?: string;
    summary?: string;
    participatingAgents?: PlannerAiSpecialistAgentId[];
    agentReasoning?: PlannerAiPlanVariant['agentReasoning'];
    impactMetrics?: PlannerAiPlanVariant['impactMetrics'];
    id?: string;
  },
): PlannerAiPlanVariant {
  return {
    ...plan,
    id: overrides.id ?? plan.id,
    label: overrides.label ?? plan.label,
    strategyLabel: overrides.strategyLabel ?? plan.strategyLabel,
    narrative: overrides.narrative ?? plan.narrative,
    rationale: {
      ...plan.rationale,
      headline: overrides.headline ?? plan.rationale.headline,
      summary: overrides.summary ?? plan.rationale.summary,
    },
    orchestrationSummary: {
      ...plan.orchestrationSummary,
      headline: overrides.headline ?? plan.orchestrationSummary.headline,
      summary: overrides.summary ?? plan.orchestrationSummary.summary,
      participatingAgents: overrides.participatingAgents ?? plan.orchestrationSummary.participatingAgents,
    },
    agentReasoning: overrides.agentReasoning ?? plan.agentReasoning,
    impactMetrics: overrides.impactMetrics ?? plan.impactMetrics,
  };
}

export function resolveCopilotPlanningItem(
  suggestion: PlannerAiCopilotSuggestion,
  planningItems: PlannerAiPlanningItemInput[],
) {
  return (
    planningItems.find((item) => item.wo === suggestion.planningItemSourceId) ??
    (suggestion.workOrderLabel &&
    suggestion.asset &&
    suggestion.priorityLabel &&
    suggestion.durationLabel &&
    suggestion.workType
      ? {
          wo: suggestion.workOrderLabel,
          asset: suggestion.asset,
          line: suggestion.line ?? 'AI Copilot',
          zone: suggestion.zone ?? 'Planner',
          duration: suggestion.durationLabel,
          priority: suggestion.priorityLabel,
          suggestedTechnician: suggestion.suggestedTechnician ?? 'BLU.AI Review',
          type: suggestion.workType,
          tone: '#2563EB',
        }
      : null)
  );
}

export function buildReviewPlanFromCopilotSuggestion(
  suggestion: PlannerAiCopilotSuggestion,
  planningItem: NonNullable<ReturnType<typeof resolveCopilotPlanningItem>>,
  targetDay: number,
  targetShift: PlannerAiShift,
): { plan: PlannerAiPlanVariant; intent: PlannerAiChangeIntent } {
  const intent = buildIntentFromCopilotSuggestion(suggestion, planningItem, targetDay, targetShift);
  const basePlan = buildSyntheticPlanForIntent(intent);

  const participatingAgents: PlannerAiSpecialistAgentId[] = [
    'Planner',
    ...(suggestion.agentContributors?.filter((agent): agent is PlannerAiSpecialistAgentId =>
      ['Safety', 'Spare Parts', 'Labor', 'Production', 'Reliability'].includes(agent),
    ) ?? ['Labor']),
  ];

  const plan = enrichReviewPlan(
    {
      ...basePlan,
      actions: enrichPlanActionsWithPartsEta(basePlan.actions),
    },
    {
    label: `Copilot review · ${suggestion.title}`,
    strategyLabel: 'Copilot suggestion',
    narrative: suggestion.summary,
    headline: 'Copilot suggestion routed through Step 2 review',
    summary: `${suggestion.reason} Review the proposed weekly placement before opening cascade impacts.`,
    participatingAgents: [...new Set(participatingAgents)],
    agentReasoning: suggestion.agentContributors?.length
      ? suggestion.agentContributors.map((agent) => ({
          agent,
          stance: 'support' as const,
          summary: `${agent} supports staging ${planningItem.asset} from the copilot suggestion path.`,
          confidence: 78,
        }))
      : [],
    impactMetrics: [
      {
        id: 'copilot-review-confidence',
        label: 'Review confidence',
        before: 72,
        after: 78,
        unit: '%',
        deltaLabel: '+6 pts',
        emphasis: 'positive',
        summary: 'Mock confidence for a single copilot scheduling recommendation.',
      },
    ],
  });

  return { plan, intent };
}

function buildWhatIfActions(
  scenario: PlannerAiWhatIfScenario,
  analysis: PlannerAiAnalysis,
  cards: PlannerAiCalendarCardInput[],
): PlannerAiPlanAction[] {
  const conveyorCard = analysis.conveyorCard;
  const lowPriorityCard =
    [...cards].find((card) => card.priority === 'Low' || card.priority === 'Medium') ?? cards[0] ?? null;
  const planningTarget = analysis.planningTarget;

  if (scenario.kind === 'move-pm-next-window' && conveyorCard) {
    const recommendedDay = Math.min(conveyorCard.day + 1, 6);
    return [
      {
        id: `what-if-move-${conveyorCard.id}`,
        kind: 'reschedule-card',
        title: `Move ${conveyorCard.title}`,
        asset: conveyorCard.title,
        workOrderLabel: conveyorCard.workOrder,
        sourceId: conveyorCard.id,
        reason: scenario.description,
        impactSummary: `Shift ${conveyorCard.workOrder} to the next weekly window before confirming.`,
        priorityLabel: conveyorCard.priority,
        confidence: 74,
        executionReadiness: 'warning',
        agentContributors: ['Production', 'Reliability'],
        recommendedDay,
        recommendedShift: conveyorCard.shift,
        recommendedStartHour: conveyorCard.startHour ?? 8,
        technicianName: conveyorCard.assignee.name,
        line: inferPlannerLineFromAsset(conveyorCard.title),
        zone: inferPlannerZoneFromAsset(conveyorCard.title),
      },
    ];
  }

  if (scenario.kind === 'defer-low-risk-pm' && lowPriorityCard) {
    const recommendedDay = Math.min(lowPriorityCard.day + 2, 6);
    return [
      {
        id: `what-if-defer-${lowPriorityCard.id}`,
        kind: 'reschedule-card',
        title: `Defer ${lowPriorityCard.title}`,
        asset: lowPriorityCard.title,
        workOrderLabel: lowPriorityCard.workOrder,
        sourceId: lowPriorityCard.id,
        reason: scenario.description,
        impactSummary: `Defer ${lowPriorityCard.workOrder} to recover near-term capacity.`,
        priorityLabel: lowPriorityCard.priority,
        confidence: 71,
        executionReadiness: 'warning',
        agentContributors: ['Labor', 'Production'],
        recommendedDay,
        recommendedShift: lowPriorityCard.shift,
        recommendedStartHour: lowPriorityCard.startHour ?? 8,
        technicianName: lowPriorityCard.assignee.name,
        line: inferPlannerLineFromAsset(lowPriorityCard.title),
        zone: inferPlannerZoneFromAsset(lowPriorityCard.title),
      },
    ];
  }

  if (scenario.kind === 'bundle-shutdown-window' && planningTarget) {
    return [
      {
        id: `what-if-schedule-${planningTarget.wo}`,
        kind: 'schedule-planning-item',
        title: `Schedule ${planningTarget.asset}`,
        asset: planningTarget.asset,
        workOrderLabel: planningTarget.wo,
        sourceId: planningTarget.wo,
        reason: scenario.description,
        impactSummary: `Bundle ${planningTarget.wo} into a shared shutdown window on the weekly board.`,
        priorityLabel: planningTarget.priority,
        confidence: 76,
        executionReadiness: 'pass',
        agentContributors: ['Production', 'Labor', 'Safety'],
        recommendedDay: 2,
        recommendedShift: 'day',
        recommendedStartHour: 8,
        technicianName: planningTarget.suggestedTechnician,
        line: planningTarget.line,
        zone: planningTarget.zone,
      },
      ...(conveyorCard
        ? [
            {
              id: `what-if-bundle-${conveyorCard.id}`,
              kind: 'reschedule-card' as const,
              title: `Align ${conveyorCard.title}`,
              asset: conveyorCard.title,
              workOrderLabel: conveyorCard.workOrder,
              sourceId: conveyorCard.id,
              reason: 'Bundle with the same shutdown window.',
              impactSummary: `Move ${conveyorCard.workOrder} into the bundled shutdown block.`,
              priorityLabel: conveyorCard.priority,
              confidence: 73,
              executionReadiness: 'warning' as const,
              agentContributors: ['Production', 'Labor'] as PlannerAiSpecialistAgentId[],
              recommendedDay: 2,
              recommendedShift: 'day' as PlannerAiShift,
              recommendedStartHour: 10,
              technicianName: conveyorCard.assignee.name,
              line: inferPlannerLineFromAsset(conveyorCard.title),
              zone: inferPlannerZoneFromAsset(conveyorCard.title),
            },
          ]
        : []),
    ];
  }

  return [];
}

export function buildReviewPlanFromWhatIf(
  scenario: PlannerAiWhatIfScenario,
  result: PlannerAiWhatIfResult,
  analysis: PlannerAiAnalysis,
  cards: PlannerAiCalendarCardInput[],
): PlannerAiPlanVariant | null {
  const actions = buildWhatIfActions(scenario, analysis, cards);
  if (!actions.length) {
    return null;
  }

  const variantId = `review-plan-what-if-${scenario.id}`;
  const intent = {
    id: `intent-what-if-${scenario.id}`,
    source: 'ai-apply' as const,
    label: `What-if review · ${scenario.label}`,
    summary: result.summary,
    strategyLabel: 'What-if simulation',
    syntheticActions: actions,
    variantId,
    selectedActionIds: actions.map((action) => action.id),
  };

  const basePlan = buildSyntheticPlanForIntent(intent);
  const participatingAgents =
    result.agentCommentary?.map((entry) => entry.agent) ??
    (['Reliability', 'Production', 'Labor'] as PlannerAiSpecialistAgentId[]);

  return enrichReviewPlan(
    {
      ...basePlan,
      actions: enrichPlanActionsWithPartsEta(actions),
    },
    {
    id: variantId,
    label: `What-if review · ${scenario.label}`,
    strategyLabel: 'What-if simulation',
    narrative: result.summary,
    headline: result.title,
    summary: `${result.recommendation} Continue in Step 2 review before cascade apply.`,
    participatingAgents: [...new Set(participatingAgents)],
    agentReasoning:
      result.agentCommentary?.map((entry) => ({
        agent: entry.agent,
        stance: entry.stance,
        summary: entry.summary,
        confidence: 75,
      })) ?? [],
    impactMetrics: result.metrics.map((metric) => ({
      id: metric.id,
      label: metric.label,
      before: 0,
      after: 0,
      unit: '',
      deltaLabel: metric.deltaLabel,
      emphasis: metric.emphasis,
      summary: `${metric.beforeLabel} → ${metric.afterLabel}`,
    })),
  });
}
