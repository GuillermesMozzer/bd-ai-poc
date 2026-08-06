import { getPartsReadinessForAsset } from './adapters/sparePartsAdapter';
import { buildPartsEtaNote, buildPlannerPartsEta } from './plannerPartsEta';
import { orchestratePlannerAiActions } from './agents/plannerAiOrchestrator';
import {
  analyzePlannerInputs,
  analyzePlannerSnapshot,
  formatDay,
  getExecutionReadiness,
  type PlannerAiAnalysis,
} from './agents/plannerAiAnalysis';
import { buildPlannerAiSnapshot } from './buildPlannerAiSnapshot';
import { dedupeCopilotInsights } from './dedupeCopilotInsights';
import { buildMaintenanceBundles } from './buildMaintenanceBundles';
import { buildStrategyRiskCallouts, enrichOrchestrationForStrategy } from './buildStrategyOrchestrationDetails';
import { generatePlannerAiCascadePreview } from './generatePlannerAiCascadePreview';
import { pickWeeklyBoardInsightLink } from './plannerCardSignals';
import type {
  PlannerAiAgentReasoning,
  PlannerAiAssistantHorizon,
  PlannerAiAssistantInsight,
  PlannerAiAssistantMessage,
  PlannerAiComparisonSession,
  PlannerAiCopilotSnapshot,
  PlannerAiCopilotSuggestion,
  PlannerAiCalendarCardInput,
  PlannerAiFeasibilityItem,
  PlannerAiFeasibilityStatus,
  PlannerAiImpactMetric,
  PlannerAiLongTermMetric,
  PlannerAiPartsReadiness,
  PlannerAiPlan,
  PlannerAiPlanAction,
  PlannerAiPlannerSnapshot,
  PlannerAiPlanningItemInput,
  PlannerAiPlanStrategy,
  PlannerAiPlanVariant,
  PlannerAiQuickPrompt,
  PlannerAiRiskSignal,
  PlannerAiScheduleDeltaItem,
  PlannerAiVariantSummary,
  PlannerAiWhatIfResult,
  PlannerAiWhatIfScenario,
  PlannerAiWhatIfScenarioKind,
} from './types';

type ActionOverrides = {
  title?: string;
  reason?: string;
  impactSummary?: string;
  confidence?: number;
  recommendedDay?: number;
  recommendedShift?: 'day' | 'night';
  recommendedStartHour?: number;
  technicianName?: string;
  priorityLabel?: string;
  suggestedTechnician?: string;
  durationLabel?: string;
  workType?: 'Preventive' | 'Corrective';
  line?: string;
  zone?: string;
  riskNote?: string;
  partsNote?: string;
  agentContributors?: PlannerAiPlanAction['agentContributors'];
};

function buildImpactMetricsFromSummary(
  summary: PlannerAiVariantSummary,
  baseline: PlannerAiAnalysis['baseline'],
): PlannerAiImpactMetric[] {
  const riskDelta = baseline.riskScore - summary.riskScore;
  const downtimeDelta = Number((baseline.plannedDowntimeHours - summary.plannedDowntimeHours).toFixed(1));
  const complianceDelta = summary.pmCompliance - baseline.pmCompliance;
  const readinessDelta = summary.partsReadiness - baseline.partsReadiness;
  const backlogDelta = baseline.openBacklog - summary.openBacklog;

  return [
    {
      id: 'pm-compliance',
      label: 'PM Compliance',
      before: baseline.pmCompliance,
      after: summary.pmCompliance,
      unit: '%',
      direction: 'up',
      deltaValue: complianceDelta,
      deltaLabel: `${complianceDelta >= 0 ? '+' : ''}${complianceDelta}%`,
      emphasis: 'positive',
      summary: 'Scheduling the highest-risk preventive work earlier improves weekly PM adherence.',
    },
    {
      id: 'breakdown-risk',
      label: 'Breakdown Risk',
      before: baseline.riskScore,
      after: summary.riskScore,
      unit: 'score',
      direction: 'down',
      deltaValue: riskDelta,
      deltaLabel: `${riskDelta >= 0 ? '-' : '+'}${Math.abs(riskDelta)}`,
      emphasis: 'positive',
      summary: 'CBM-driven pull-forwards reduce exposure on the riskiest assets in the current horizon.',
    },
    {
      id: 'planned-downtime',
      label: 'Planned Downtime',
      before: baseline.plannedDowntimeHours,
      after: summary.plannedDowntimeHours,
      unit: 'hours',
      direction: 'down',
      deltaValue: downtimeDelta,
      deltaLabel: `${downtimeDelta >= 0 ? '-' : '+'}${Math.abs(downtimeDelta).toFixed(1)}h`,
      emphasis: 'positive',
      summary: 'The recommendation clusters work into already-active windows to avoid adding fresh interruptions later in the week.',
    },
    {
      id: 'parts-readiness',
      label: 'Parts Readiness',
      before: baseline.partsReadiness,
      after: summary.partsReadiness,
      unit: '%',
      direction: 'up',
      deltaValue: readinessDelta,
      deltaLabel: `${readinessDelta >= 0 ? '+' : ''}${readinessDelta}%`,
      emphasis: 'positive',
      summary: 'The plan keeps blocked work visible while prioritizing assets that already have executable part coverage.',
    },
    {
      id: 'open-backlog',
      label: 'Open Backlog',
      before: baseline.openBacklog,
      after: summary.openBacklog,
      unit: 'count',
      direction: 'down',
      deltaValue: backlogDelta,
      deltaLabel: `${backlogDelta >= 0 ? '-' : '+'}${Math.abs(backlogDelta)}`,
      emphasis: 'positive',
      summary: 'One follow-up request is promoted into the planner and one queue item is scheduled into execution.',
    },
  ];
}

function buildSchedulePlanningAction(
  planningItem: PlannerAiPlanningItemInput,
  riskSignal: PlannerAiRiskSignal | undefined,
  overrides: ActionOverrides = {},
): PlannerAiPlanAction {
  const readiness = getPartsReadinessForAsset(planningItem.asset);
  const partsEta = buildPlannerPartsEta(planningItem.asset, [], overrides.recommendedDay ?? 2);
  return {
    id: `ai-action-schedule-${planningItem.wo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    kind: 'schedule-planning-item',
    title: overrides.title ?? `Schedule ${planningItem.asset} into the weekly board`,
    asset: planningItem.asset,
    workOrderLabel: planningItem.wo,
    sourceId: planningItem.wo,
    reason:
      overrides.reason ??
      `CBM risk on ${planningItem.asset} is elevated and the work is still unscheduled in the planning queue.`,
    impactSummary:
      overrides.impactSummary ?? 'Moves a high-risk queued work order into execution while parts are still executable.',
    priorityLabel: overrides.priorityLabel ?? planningItem.priority,
    confidence: overrides.confidence ?? 88,
    executionReadiness: getExecutionReadiness(readiness),
    agentContributors: overrides.agentContributors ?? ['Planner', 'Reliability', 'Spare Parts'],
    recommendedDay: overrides.recommendedDay ?? 2,
    recommendedShift: overrides.recommendedShift ?? 'day',
    recommendedStartHour: overrides.recommendedStartHour ?? 8,
    technicianName: overrides.technicianName ?? planningItem.suggestedTechnician,
    riskNote:
      overrides.riskNote ??
      (riskSignal
        ? `${planningItem.asset} has ${riskSignal.daysToFailure} days-to-failure with a health score of ${riskSignal.healthScore}.`
        : undefined),
    partsNote: overrides.partsNote ?? buildPartsEtaNote(partsEta),
    partsEtaLabel: partsEta.partsEtaLabel,
    partsEtaRisk: partsEta.risk,
  };
}

function buildRescheduleCardAction(
  card: PlannerAiCalendarCardInput,
  riskSignal: PlannerAiRiskSignal | undefined,
  overrides: ActionOverrides = {},
): PlannerAiPlanAction {
  const readiness = getPartsReadinessForAsset(card.title);
  const recommendedDay = overrides.recommendedDay ?? Math.max(0, card.day - 1);
  const partsEta = buildPlannerPartsEta(card.title, [], recommendedDay);
  return {
    id: `ai-action-reschedule-${card.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    kind: 'reschedule-card',
    title: overrides.title ?? `Resequence ${card.title} inside the current weekly window`,
    asset: card.title,
    workOrderLabel: card.workOrder,
    sourceId: card.id,
    reason:
      overrides.reason ??
      `${card.title} risk is trending upward, and moving the work earlier reduces late-week exposure.`,
    impactSummary:
      overrides.impactSummary ?? 'Moves an existing PM earlier to reduce exposure and align work on the same asset family.',
    priorityLabel: overrides.priorityLabel ?? card.priority,
    confidence: overrides.confidence ?? 84,
    executionReadiness: getExecutionReadiness(readiness),
    agentContributors: overrides.agentContributors ?? ['Planner', 'Reliability'],
    recommendedDay,
    recommendedShift: overrides.recommendedShift ?? 'day',
    recommendedStartHour: overrides.recommendedStartHour ?? card.startHour,
    technicianName: overrides.technicianName ?? card.assignee.name,
    riskNote:
      overrides.riskNote ??
      (riskSignal
        ? `${card.title} has a ${riskSignal.metric} alert with ${riskSignal.daysToFailure} days-to-failure.`
        : undefined),
    partsNote: overrides.partsNote ?? buildPartsEtaNote(partsEta),
    partsEtaLabel: partsEta.partsEtaLabel,
    partsEtaRisk: partsEta.risk,
  };
}

function buildPromoteFollowUpAction(
  request: PlannerAiAnalysis['followUpSnapshot']['requests'][number],
  overrides: ActionOverrides = {},
): PlannerAiPlanAction {
  const readiness = getPartsReadinessForAsset(request.asset, request.tags);
  const partsEta = buildPlannerPartsEta(request.asset, request.tags);
  return {
    id: `ai-action-promote-${request.id.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    kind: 'promote-follow-up-request',
    title: overrides.title ?? `Promote ${request.asset} into planner backlog`,
    asset: request.asset,
    workOrderLabel: request.workOrderLabel,
    sourceId: request.id,
    reason:
      overrides.reason ??
      'The follow-up backlog contains unresolved work that should stay visible in the same weekly cycle as CBM-driven scheduling.',
    impactSummary:
      overrides.impactSummary ?? 'Keeps unresolved follow-up work visible in the planner without forcing it into execution too early.',
    priorityLabel: overrides.priorityLabel ?? request.priorityLabel,
    confidence: overrides.confidence ?? 79,
    executionReadiness: getExecutionReadiness(readiness),
    agentContributors: overrides.agentContributors ?? ['Follow-Up', 'Planner', 'Reliability'],
    suggestedTechnician: overrides.suggestedTechnician ?? request.assigneeName,
    durationLabel: overrides.durationLabel ?? request.durationLabel,
    workType: overrides.workType ?? 'Corrective',
    line: overrides.line ?? request.line ?? 'Line review',
    zone: overrides.zone ?? request.zone ?? 'Maintenance',
    riskNote:
      overrides.riskNote ??
      'This creates a planner-visible follow-up action so execution risk and backlog review happen in the same cycle.',
    partsNote: overrides.partsNote ?? buildPartsEtaNote(partsEta),
    partsEtaLabel: partsEta.partsEtaLabel,
    partsEtaRisk: partsEta.risk,
  };
}

function buildVariantSummary(
  strategy: PlannerAiPlanStrategy,
  baseline: PlannerAiAnalysis['baseline'],
  actions: PlannerAiPlanAction[],
  criticalSignalCount: number,
): PlannerAiVariantSummary {
  const readyActions = actions.filter((action) => action.executionReadiness === 'pass').length;
  const actionCount = actions.length;
  const backlogReduction = Math.min(Math.max(actionCount, 1), 4);

  if (strategy === 'min-downtime') {
    return {
      riskScore: baseline.riskScore + 10 + criticalSignalCount,
      plannedDowntimeHours: 8.4,
      pmCompliance: Math.min(84, baseline.pmCompliance + 4),
      partsReadiness: Math.min(82, baseline.partsReadiness + 2 + readyActions),
      openBacklog: Math.max(0, baseline.openBacklog - backlogReduction + 4),
      laborLoad: 'High',
      annualCostDelta: '-$245K',
    };
  }

  if (strategy === 'max-reliability') {
    return {
      riskScore: Math.max(30, baseline.riskScore - 42 - criticalSignalCount),
      plannedDowntimeHours: 17.0,
      pmCompliance: Math.min(97, baseline.pmCompliance + 18),
      partsReadiness: Math.min(94, baseline.partsReadiness + 12 + readyActions * 2),
      openBacklog: Math.max(0, baseline.openBacklog - backlogReduction - 3),
      laborLoad: 'Medium',
      annualCostDelta: '-$185K',
    };
  }

  if (strategy === 'production-sync') {
    return {
      riskScore: baseline.riskScore - 2 + criticalSignalCount,
      plannedDowntimeHours: 10.5,
      pmCompliance: Math.min(87, baseline.pmCompliance + 6),
      partsReadiness: Math.min(86, baseline.partsReadiness + 6 + readyActions),
      openBacklog: Math.max(0, baseline.openBacklog - backlogReduction + 2),
      laborLoad: 'Low',
      annualCostDelta: '-$228K',
    };
  }

  return {
    riskScore: Math.max(56, baseline.riskScore - 16),
    plannedDowntimeHours: 14.0,
    pmCompliance: Math.min(92, baseline.pmCompliance + 12),
    partsReadiness: Math.min(90, baseline.partsReadiness + 10 + readyActions * 2),
    openBacklog: Math.max(0, baseline.openBacklog - backlogReduction),
    laborLoad: 'Medium',
    annualCostDelta: '-$210K',
  };
}

function buildLongTermMetrics(strategyLabel: string, summary: PlannerAiVariantSummary): PlannerAiLongTermMetric[] {
  return [
    {
      id: 'annual-cost',
      label: 'Annual Cost',
      currentValue: '$2.4M',
      projectedValue: summary.annualCostDelta.startsWith('-')
        ? `$${(2.4 - Math.abs(Number(summary.annualCostDelta.replace(/[^0-9.]/g, ''))) / 1000).toFixed(2)}M`
        : '$2.4M',
      deltaLabel: summary.annualCostDelta,
      emphasis: 'positive',
      summary: `${strategyLabel} rebalances maintenance spend by avoiding avoidable breakdown cost and overtime spikes.`,
    },
    {
      id: 'annual-downtime',
      label: 'Planned Downtime / Year',
      currentValue: '890h',
      projectedValue: `${Math.max(620, Math.round(890 - (18.5 - summary.plannedDowntimeHours) * 24))}h`,
      deltaLabel: `${summary.plannedDowntimeHours <= 13 ? '-30%' : '-22%'}`,
      emphasis: 'positive',
      summary: 'The weekly scheduling pattern projects into annual stop-time reduction when repeated consistently.',
    },
    {
      id: 'annual-risk',
      label: 'Avg Breakdown Risk',
      currentValue: '58',
      projectedValue: `${Math.max(18, Math.round(summary.riskScore * 0.78))}`,
      deltaLabel: `${summary.riskScore <= 30 ? '-50%' : '-38%'}`,
      emphasis: 'positive',
      summary: 'Earlier intervention on degrading assets lowers repeat-failure exposure over a longer horizon.',
    },
    {
      id: 'resource-strain',
      label: 'Tech Resource Strain',
      currentValue: '72%',
      projectedValue: summary.laborLoad === 'High' ? '69%' : summary.laborLoad === 'Medium' ? '64%' : '59%',
      deltaLabel: summary.laborLoad === 'High' ? '-3pts' : summary.laborLoad === 'Medium' ? '-8pts' : '-13pts',
      emphasis: summary.laborLoad === 'High' ? 'neutral' : 'positive',
      summary: 'The chosen strategy changes how aggressively work is packed into existing crew capacity.',
    },
  ];
}


function buildVariantNarrative(strategy: PlannerAiPlanStrategy, analysis: PlannerAiAnalysis, actions: PlannerAiPlanAction[]) {
  const primaryAsset = analysis.planningTarget?.asset ?? analysis.criticalSignals[0]?.asset ?? 'the highest-risk asset';
  const partsBlocker = analysis.blockers[0];

  if (strategy === 'min-downtime') {
    return [
      `${primaryAsset} is still addressed, but only through the smallest set of moves needed to reduce avoidable stop/start churn this week.`,
      `The variant limits queue promotions so downtime falls faster than backlog does, trading some long-term risk reduction for a tighter production window.`,
      partsBlocker
        ? `${partsBlocker.asset} remains blocked by parts readiness and is intentionally not pulled into any new execution window.`
        : 'No hard parts blockers are introduced by the compressed sequence.',
    ].join(' ');
  }

  if (strategy === 'max-reliability') {
    return [
      `${primaryAsset} and the next-highest risk work are both accelerated so the plan attacks the failure curve more aggressively than the recommended baseline.`,
      'The variant accepts slightly more planned downtime now in exchange for stronger PM compliance and lower projected breakdown exposure.',
      partsBlocker
        ? `${partsBlocker.asset} still stays out of direct execution until material coverage improves, preserving plan credibility.`
        : 'All highlighted moves stay inside the current executable envelope.',
    ].join(' ');
  }

  if (strategy === 'production-sync') {
    return [
      `${primaryAsset} and related work are bundled into the same changeover window so maintenance rides an already-planned production transition.`,
      'The variant minimizes extra stop/start events by co-scheduling with low-OEE periods instead of creating standalone maintenance pockets.',
      partsBlocker
        ? `${partsBlocker.asset} stays visible as a blocker so production alignment does not hide readiness gaps.`
        : 'All bundled moves stay inside windows where production has already accepted a transition.',
    ].join(' ');
  }

  return [
    `${primaryAsset} is pulled into the weekly plan because the current condition signal is too strong to leave in the queue.`,
    'The recommended variant balances breakdown-risk reduction, parts readiness, and manageable crew loading rather than optimizing a single metric too aggressively.',
    partsBlocker
      ? `${partsBlocker.asset} remains visible as a blocker instead of being forced into execution.`
      : 'No hard parts blockers were detected in the top recommendation set.',
  ].join(' ');
}

function buildVariantRationale(strategy: PlannerAiPlanStrategy): PlannerAiPlan['rationale'] {
  if (strategy === 'min-downtime') {
    return {
      headline: 'Compress work into the fewest interruptions possible.',
      summary:
        'This strategy favors production continuity and stop-time reduction, even if some lower-readiness work remains queued for a later cycle.',
      tradeoffs: [
        'Lowest planned downtime this week, but the highest residual breakdown risk.',
        'Backlog stays higher because fewer queued items are promoted into execution.',
      ],
      recommendedNextSteps: [
        'Review technician coverage on the compressed execution day before applying the full set.',
        'Use this strategy when production protection is the top objective for the week.',
      ],
    };
  }

  if (strategy === 'max-reliability') {
    return {
      headline: 'Front-load the riskiest work to suppress failure exposure.',
      summary:
        'This strategy deliberately spends more weekly execution energy on high-risk assets so the downstream reliability curve improves faster.',
      tradeoffs: [
        'Lowest risk score and strongest PM compliance in the comparison.',
        'Keeps the most planned downtime — production absorbs longer maintenance windows.',
      ],
      recommendedNextSteps: [
        'Use this strategy when condition signals are deteriorating faster than normal.',
        'Confirm that parts coverage and technician availability are still acceptable on the earlier slots.',
      ],
    };
  }

  if (strategy === 'production-sync') {
    return {
      headline: 'Co-schedule maintenance with changeovers and low-OEE windows.',
      summary:
        'This strategy aligns work with production transitions so the plant absorbs fewer separate interruptions while still advancing critical maintenance.',
      tradeoffs: [
        'Fits approved changeover windows with low crew strain and short stop-time.',
        'Defers some condition work, so breakdown risk stays higher than the Recommended path.',
      ],
      recommendedNextSteps: [
        'Use this strategy when changeover or low-OEE windows are already approved for the week.',
        'Confirm the bundled window still has enough crew coverage before applying all actions.',
      ],
    };
  }

  return {
    headline: 'Prioritize condition-driven work while preserving executable weekly flow.',
    summary:
      'The recommended variant prefers work that is both condition-critical and immediately executable, then keeps blocked or unresolved items visible instead of over-committing the weekly board.',
    tradeoffs: [
      'Balances breakdown-risk reduction against manageable labor loading.',
      'Keeps blocked work visible, which preserves realism but leaves some backlog in view.',
    ],
    recommendedNextSteps: [
      'Apply the highest-confidence items first and verify technician assignment on the peak-load day.',
      'Review blocker rows with missing or thin parts coverage before pulling them into direct execution.',
    ],
  };
}

function buildScheduleDelta(strategy: PlannerAiPlanStrategy, actions: PlannerAiPlanAction[], analysis: PlannerAiAnalysis): PlannerAiScheduleDeltaItem[] {
  const entries: PlannerAiScheduleDeltaItem[] = actions.map((action) => {
    if (action.kind === 'reschedule-card') {
      const sourceCard = analysis.conveyorCard?.id === action.sourceId ? analysis.conveyorCard : analysis.secondaryCard;
      return {
        id: `${strategy}-${action.id}`,
        tone: 'move',
        summary: `Move ${action.workOrderLabel} to ${formatDay(action.recommendedDay)} ${action.recommendedShift}`,
        detail: sourceCard
          ? `${sourceCard.title} shifts from ${formatDay(sourceCard.day)} ${sourceCard.shift} to ${formatDay(action.recommendedDay)} ${action.recommendedShift}.`
          : action.reason,
      };
    }

    if (action.kind === 'schedule-planning-item') {
      return {
        id: `${strategy}-${action.id}`,
        tone: 'add',
        summary: `Schedule ${action.workOrderLabel} on ${formatDay(action.recommendedDay)} ${action.recommendedShift}`,
        detail: `${action.asset} is moved from the planning queue into a weekly execution slot at ${action.recommendedStartHour}:00.`,
      };
    }

    return {
      id: `${strategy}-${action.id}`,
      tone: 'add',
      summary: `Promote ${action.workOrderLabel} into planner backlog`,
      detail: `${action.asset} stays visible in planning with ${action.durationLabel} estimated duration in ${action.line} / ${action.zone}.`,
    };
  });

  if (strategy === 'min-downtime') {
    entries.push({
      id: `${strategy}-defer-followup`,
      tone: 'defer',
      summary: 'Defer secondary follow-up promotion',
      detail: 'Lower-priority backlog remains outside the weekly execution envelope to protect production uptime.',
    });
  }

  if (strategy === 'max-reliability') {
    entries.push({
      id: `${strategy}-note-extra-buffer`,
      tone: 'note',
      summary: 'Reserve more early-week maintenance capacity',
      detail: 'The plan intentionally opens more room around high-risk assets so urgent follow-on work can stay in the same intervention window.',
    });
  }

  if (strategy === 'production-sync') {
    entries.push({
      id: `${strategy}-note-changeover`,
      tone: 'note',
      summary: 'Bundle work into the Line 10 changeover window',
      detail: 'Conveyor and queue items are aligned to the same production transition block to avoid a second stop later in the week.',
    });
  }

  return entries;
}

function buildVariant(
  strategy: PlannerAiPlanStrategy,
  label: string,
  description: string,
  analysis: PlannerAiAnalysis,
  snapshot: PlannerAiPlannerSnapshot,
  generatedAt: string,
  generationDurationMs: number,
): PlannerAiPlanVariant {
  const actions: PlannerAiPlanAction[] = [];

  if (strategy === 'recommended') {
    if (analysis.planningTarget) {
      actions.push(
        buildSchedulePlanningAction(analysis.planningTarget, analysis.riskByAsset.get(analysis.planningTarget.asset), {
          confidence: 92,
          recommendedDay: 2,
          title: `Schedule ${analysis.planningTarget.asset} into the weekly board`,
          reason: `CBM risk on ${analysis.planningTarget.asset} is critical and the work is still unscheduled in the planning queue.`,
          impactSummary: 'Moves the highest-risk queued work into execution while parts are still executable.',
        }),
      );
    }

    if (analysis.conveyorCard) {
      actions.push(
        buildRescheduleCardAction(analysis.conveyorCard, analysis.riskByAsset.get(analysis.conveyorCard.title), {
          confidence: 84,
          recommendedDay: 2,
          title: 'Consolidate Conveyor CV-101 work into the earlier maintenance window',
          reason: 'Conveyor risk is trending upward, and consolidating duplicate conveyor work reduces stop/start churn later in the week.',
        }),
      );
    }

    if (analysis.moldingRequest) {
      actions.push(
        buildPromoteFollowUpAction(analysis.moldingRequest, {
          confidence: 79,
          title: `Promote ${analysis.moldingRequest.asset} into planner backlog`,
          reason: 'The follow-up backlog contains an unresolved molding request while molding-related CBM signals are already elevated.',
          line: 'Line 10',
          zone: 'Molding',
        }),
      );
    }
  }

  if (strategy === 'min-downtime') {
    if (analysis.conveyorCard) {
      actions.push(
        buildRescheduleCardAction(analysis.conveyorCard, analysis.riskByAsset.get(analysis.conveyorCard.title), {
          confidence: 90,
          recommendedDay: Math.max(0, analysis.conveyorCard.day - 2),
          title: 'Pull conveyor PM into the earliest open downtime slot',
          reason: 'The strategy concentrates maintenance inside the first available open stop to avoid creating a second downtime pocket later in the week.',
          agentContributors: ['Planner', 'Production', 'Reliability'],
        }),
      );
    }

    if (analysis.planningTarget) {
      actions.push(
        buildSchedulePlanningAction(analysis.planningTarget, analysis.riskByAsset.get(analysis.planningTarget.asset), {
          confidence: 86,
          recommendedDay: 1,
          title: `Schedule ${analysis.planningTarget.asset} alongside the existing stop`,
          reason: `The queue item on ${analysis.planningTarget.asset} is inserted into the same downtime cluster so production absorbs one interruption instead of two.`,
          impactSummary: 'Improves uptime by bundling the highest-risk queue item into an already-disrupted window.',
          agentContributors: ['Planner', 'Production', 'Reliability', 'Spare Parts'],
        }),
      );
    }
  }

  if (strategy === 'max-reliability') {
    if (analysis.planningTarget) {
      actions.push(
        buildSchedulePlanningAction(analysis.planningTarget, analysis.riskByAsset.get(analysis.planningTarget.asset), {
          confidence: 95,
          recommendedDay: 1,
          title: `Accelerate ${analysis.planningTarget.asset} before failure exposure widens`,
          reason: `The highest-risk queue item is pulled forward as early as possible to suppress failure probability this week.`,
        }),
      );
    }

    if (analysis.conveyorCard) {
      actions.push(
        buildRescheduleCardAction(analysis.conveyorCard, analysis.riskByAsset.get(analysis.conveyorCard.title), {
          confidence: 89,
          recommendedDay: 1,
          title: 'Move Conveyor CV-101 work into the same high-control intervention window',
          reason: 'Conveyor exposure remains elevated, so this variant resolves it earlier even if planned downtime grows slightly.',
          agentContributors: ['Planner', 'Reliability', 'Production'],
        }),
      );
    }

    if (analysis.moldingRequest) {
      actions.push(
        buildPromoteFollowUpAction(analysis.moldingRequest, {
          confidence: 84,
          title: `Elevate ${analysis.moldingRequest.asset} for reliability review`,
          reason: 'The molding request is promoted sooner so reliability review happens in the same cycle as the highest-risk scheduled work.',
          line: 'Line 10',
          zone: 'Molding',
        }),
      );
    }

    if (analysis.secondaryPlanningTarget) {
      actions.push(
        buildSchedulePlanningAction(
          analysis.secondaryPlanningTarget,
          analysis.riskByAsset.get(analysis.secondaryPlanningTarget.asset),
          {
            confidence: 82,
            recommendedDay: 3,
            title: `Advance ${analysis.secondaryPlanningTarget.asset} as a secondary reliability catch-up`,
            reason: 'A second queue item is pulled forward to reduce the chance that a related issue becomes the next emergent interruption.',
            impactSummary: 'Improves reliability at the cost of a wider weekly maintenance footprint.',
            agentContributors: ['Planner', 'Reliability', 'Labor'],
          },
        ),
      );
    }
  }

  if (strategy === 'production-sync') {
    if (analysis.conveyorCard) {
      actions.push(
        buildRescheduleCardAction(analysis.conveyorCard, analysis.riskByAsset.get(analysis.conveyorCard.title), {
          confidence: 91,
          recommendedDay: 2,
          title: 'Align Conveyor CV-101 with the Line 10 changeover window',
          reason: 'Production planning shows a changeover block on Day 3 AM; consolidating conveyor PM there avoids a separate production stop.',
          agentContributors: ['Planner', 'Production', 'Reliability'],
        }),
      );
    }

    if (analysis.planningTarget) {
      actions.push(
        buildSchedulePlanningAction(analysis.planningTarget, analysis.riskByAsset.get(analysis.planningTarget.asset), {
          confidence: 88,
          recommendedDay: 2,
          title: `Schedule ${analysis.planningTarget.asset} into the changeover window`,
          reason: 'The queue item is placed inside the same low-OEE transition window so maintenance rides an already-approved production break.',
          impactSummary: 'Protects output by sharing downtime with a planned product transition.',
          agentContributors: ['Planner', 'Production', 'Spare Parts'],
        }),
      );
    }

    if (analysis.moldingRequest) {
      actions.push(
        buildPromoteFollowUpAction(analysis.moldingRequest, {
          confidence: 83,
          title: `Stage ${analysis.moldingRequest.asset} for changeover bundle review`,
          reason: 'Molding work is queued for bundling with the next product transition instead of a standalone maintenance stop.',
          line: 'Line 10',
          zone: 'Molding',
        }),
      );
    }
  }

  const orchestration = orchestratePlannerAiActions({
    analysis,
    strategy,
    actions,
  });
  const resolvedActions = orchestration.actions;
  const summary = buildVariantSummary(strategy, analysis.baseline, resolvedActions, analysis.criticalSignals.length);
  const strategyDetails = enrichOrchestrationForStrategy(strategy, orchestration, analysis, summary);
  const confidenceFactors = orchestration.confidenceFactors;
  const confidence = Math.round(confidenceFactors.reduce((total, factor) => total + factor.value, 0) / confidenceFactors.length);

  return {
    id: `planner-ai-${strategy}`,
    strategy,
    strategyLabel: label,
    strategyDescription: description,
    label: label === 'Recommended' ? 'BLU.AI Recommended Weekly Plan' : `BLU.AI ${label} Weekly Plan`,
    generatedAt,
    generationDurationMs,
    generatorLabel: 'BLU.AI Mock Orchestrator',
    horizonLabel: 'Weekly planning horizon',
    confidence,
    confidenceFactors,
    impactMetrics: buildImpactMetricsFromSummary(summary, analysis.baseline),
    feasibilityChecklist: strategyDetails.feasibilityChecklist,
    actions: resolvedActions,
    blockers: analysis.blockers,
    bundles: buildMaintenanceBundles(resolvedActions),
    coverageSummary: snapshot.coverageSummary,
    narrative: buildVariantNarrative(strategy, analysis, resolvedActions),
    rationale: buildVariantRationale(strategy),
    riskCallouts: buildStrategyRiskCallouts(strategy, analysis, resolvedActions),
    partsReadiness: analysis.partsReadiness,
    agentConflicts: strategyDetails.agentConflicts,
    agentEvaluations: orchestration.agentEvaluations,
    orchestrationSummary: strategyDetails.orchestrationSummary,
    summaryMetrics: summary,
    scheduleDelta: buildScheduleDelta(strategy, resolvedActions, analysis),
    agentReasoning: strategyDetails.agentReasoning,
    longTermMetrics: buildLongTermMetrics(label, summary),
    tradeoffPoint: {
      variantId: `planner-ai-${strategy}`,
      label,
      riskScore: summary.riskScore,
      downtimeHours: summary.plannedDowntimeHours,
      laborLoad: summary.laborLoad,
    },
  };
}

function resolvePlannerSnapshot({
  snapshot,
  cards,
  planningItems,
}: {
  snapshot?: PlannerAiPlannerSnapshot;
  cards?: PlannerAiCalendarCardInput[];
  planningItems?: PlannerAiPlanningItemInput[];
}) {
  if (snapshot) {
    return snapshot;
  }

  return buildPlannerAiSnapshot({
    cards: cards ?? [],
    planningItems: planningItems ?? [],
  });
}

export function generatePlannerAiComparisonSession({
  snapshot,
  cards,
  planningItems,
  generatedAt = new Date().toLocaleString(),
  generationDurationMs = 640,
}: {
  snapshot?: PlannerAiPlannerSnapshot;
  cards?: PlannerAiCalendarCardInput[];
  planningItems?: PlannerAiPlanningItemInput[];
  generatedAt?: string;
  generationDurationMs?: number;
}): PlannerAiComparisonSession {
  const resolvedSnapshot = resolvePlannerSnapshot({ snapshot, cards, planningItems });
  const analysis = analyzePlannerSnapshot(resolvedSnapshot);
  const variants = [
    buildVariant(
      'recommended',
      'Recommended',
      'Balanced middle path — moderate downtime and risk with the best execution feasibility.',
      analysis,
      resolvedSnapshot,
      generatedAt,
      generationDurationMs,
    ),
    buildVariant(
      'min-downtime',
      'Min Downtime',
      'Lowest stop-time — accepts the highest breakdown risk to protect production output.',
      analysis,
      resolvedSnapshot,
      generatedAt,
      generationDurationMs,
    ),
    buildVariant(
      'max-reliability',
      'Max Reliability',
      'Lowest risk posture — keeps the most planned downtime to front-load critical work.',
      analysis,
      resolvedSnapshot,
      generatedAt,
      generationDurationMs,
    ),
    buildVariant(
      'production-sync',
      'Production Output',
      'Short changeover stops — less downtime than Recommended, but elevated risk from compressed windows.',
      analysis,
      resolvedSnapshot,
      generatedAt,
      generationDurationMs,
    ),
  ];

  return {
    id: 'planner-ai-comparison-phase-3',
    label: 'BLU.AI Weekly Strategy Comparison',
    generatedAt,
    generationDurationMs,
    generatorLabel: 'BLU.AI Mock Orchestrator',
    horizonLabel: 'Weekly planning horizon',
    recommendedVariantId: 'planner-ai-recommended',
    variants,
  };
}

export function generatePlannerAiPlan({
  snapshot,
  cards,
  planningItems,
  generatedAt = new Date().toLocaleString(),
  generationDurationMs = 640,
}: {
  snapshot?: PlannerAiPlannerSnapshot;
  cards?: PlannerAiCalendarCardInput[];
  planningItems?: PlannerAiPlanningItemInput[];
  generatedAt?: string;
  generationDurationMs?: number;
}): PlannerAiPlan {
  const comparisonSession = generatePlannerAiComparisonSession({
    snapshot,
    cards,
    planningItems,
    generatedAt,
    generationDurationMs,
  });

  return (
    comparisonSession.variants.find((variant) => variant.id === comparisonSession.recommendedVariantId) ??
    comparisonSession.variants[0]
  );
}

function getResolvedCopilotPlan(
  snapshot: PlannerAiPlannerSnapshot,
  activePlan?: PlannerAiPlanVariant | null,
) {
  if (activePlan) {
    return activePlan;
  }

  const comparisonSession = generatePlannerAiComparisonSession({
    snapshot,
    generatedAt: 'Current planner state',
    generationDurationMs: 0,
  });

  return (
    comparisonSession.variants.find((variant) => variant.id === comparisonSession.recommendedVariantId) ??
    comparisonSession.variants[0] ??
    null
  );
}

function getHorizonLabel(horizon: PlannerAiAssistantHorizon) {
  switch (horizon) {
    case 'monthly':
      return 'monthly';
    case 'quarterly':
      return 'quarterly';
    case 'annual':
      return 'annual';
    default:
      return 'weekly';
  }
}

function buildAssistantTimestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function buildCopilotProactiveContext(
  analysis: PlannerAiAnalysis,
  horizon: PlannerAiAssistantHorizon,
  insights: PlannerAiAssistantInsight[],
  activePlan?: PlannerAiPlanVariant | null,
  recommendedPlan?: PlannerAiPlanVariant | null,
): PlannerAiCopilotProactiveContext {
  const horizonLabel = getHorizonLabel(horizon);

  if (activePlan) {
    return {
      hasBetterPlan: false,
      commandBarMessage: '',
      suggestedCta: 'review',
    };
  }

  const plan = recommendedPlan;
  if (!plan || plan.actions.length === 0) {
    const signalCount = insights.length;
    return {
      hasBetterPlan: false,
      commandBarMessage:
        signalCount > 0
          ? `I analyzed your ${horizonLabel} schedule and found ${signalCount} signal${signalCount === 1 ? '' : 's'} worth reviewing. Open the copilot for details, or use Analyze & propose when you want AI scheduling strategies.`
          : `Your ${horizonLabel} schedule looks stable. Open the copilot for questions, or run Analyze & propose to compare AI scheduling strategies.`,
      suggestedCta: signalCount > 0 ? 'copilot' : 'analyze',
    };
  }

  const riskDelta = analysis.baseline.riskScore - plan.summaryMetrics.riskScore;
  const actionCount = plan.actions.length;
  const criticalCount = analysis.criticalSignals.length;
  const hasSchedulePressure =
    criticalCount > 0 ||
    analysis.blockers.length > 0 ||
    analysis.planningTarget !== null ||
    analysis.followUpSnapshot.requests.length > 0;
  const hasBetterPlan = riskDelta >= 4 && hasSchedulePressure;

  if (hasBetterPlan) {
    const highlights: string[] = [];
    if (riskDelta >= 4) {
      highlights.push(`~${riskDelta} pt lower breakdown risk`);
    }
    if (criticalCount > 0) {
      highlights.push(`${criticalCount} elevated CBM signal${criticalCount === 1 ? '' : 's'}`);
    } else if (analysis.planningTarget) {
      highlights.push('unscheduled critical work');
    } else if (analysis.blockers.length > 0) {
      highlights.push('parts-readiness constraints');
    }

    const highlightText = highlights.slice(0, 2).join(' and ');

    return {
      hasBetterPlan: true,
      commandBarMessage: `I found a stronger ${horizonLabel} plan than your current schedule — ${plan.strategyLabel} addresses ${highlightText} with ${actionCount} coordinated action${actionCount === 1 ? '' : 's'}. Select Analyze & propose to review the recommendation.`,
      suggestedCta: 'analyze',
      recommendedStrategyLabel: plan.strategyLabel,
      actionCount,
      riskDelta,
    };
  }

  const signalCount = insights.length;
  return {
    hasBetterPlan: false,
    commandBarMessage:
      signalCount > 0
        ? `I analyzed your ${horizonLabel} schedule and found ${signalCount} signal${signalCount === 1 ? '' : 's'} worth reviewing. Open the copilot for details, or use Analyze & propose when you want AI scheduling strategies.`
        : `Your ${horizonLabel} schedule looks stable. Open the copilot for questions, or run Analyze & propose to compare AI scheduling strategies.`,
    suggestedCta: signalCount > 0 ? 'copilot' : 'analyze',
  };
}

function buildCopilotGreeting(
  horizon: PlannerAiAssistantHorizon,
  proactiveContext: PlannerAiCopilotProactiveContext,
  activePlan?: PlannerAiPlanVariant | null,
) {
  if (activePlan) {
    return `Copilot is watching the ${getHorizonLabel(horizon)} horizon with ${activePlan.strategyLabel} as the active strategy. Ask about risk, blockers, or what-if changes.`;
  }

  if (proactiveContext.commandBarMessage) {
    return proactiveContext.commandBarMessage;
  }

  return `Copilot is ready for the ${getHorizonLabel(horizon)} horizon. Ask a question, run a what-if simulation, or generate a fresh AI plan.`;
}

function buildCopilotQuickPrompts(horizon: PlannerAiAssistantHorizon): PlannerAiQuickPrompt[] {
  if (horizon === 'monthly') {
    return [
      {
        id: 'monthly-backlog',
        label: 'Monthly backlog risk',
        question: 'Show the biggest monthly backlog and compliance risks.',
        intent: 'monthly-focus',
      },
      {
        id: 'monthly-balance',
        label: 'Balance monthly work',
        question: 'How should I rebalance the monthly maintenance load?',
        intent: 'monthly-focus',
      },
      {
        id: 'monthly-strategy',
        label: 'Why this strategy?',
        question: 'Why is the current AI strategy a fit for monthly planning?',
        intent: 'strategy-explainer',
      },
    ];
  }

  if (horizon === 'quarterly') {
    return [
      {
        id: 'quarterly-hotspots',
        label: 'Quarterly hotspots',
        question: 'What are the biggest quarterly reliability hotspots?',
        intent: 'quarterly-focus',
      },
      {
        id: 'quarterly-cluster',
        label: 'Shutdown clusters',
        question: 'Where should I cluster work to use shutdown windows better this quarter?',
        intent: 'quarterly-focus',
      },
      {
        id: 'quarterly-strategy',
        label: 'Explain strategy',
        question: 'Explain the current AI strategy in quarterly terms.',
        intent: 'strategy-explainer',
      },
    ];
  }

  if (horizon === 'annual') {
    return [
      {
        id: 'annual-overdue',
        label: 'Annual overdue risk',
        question: 'Which annual plan areas are carrying the highest overdue risk?',
        intent: 'annual-focus',
      },
      {
        id: 'annual-capacity',
        label: 'Strategic PM load',
        question: 'How is the annual PM load shaping long-range maintenance capacity?',
        intent: 'annual-focus',
      },
      {
        id: 'annual-strategy',
        label: 'Explain annual fit',
        question: 'Why is the current AI strategy a fit for the annual view?',
        intent: 'strategy-explainer',
      },
    ];
  }

  return [
    {
      id: 'weekly-risk',
      label: 'Riskiest asset',
      question: 'What is the riskiest asset this week?',
      intent: 'risk-summary',
    },
    {
      id: 'weekly-strategy',
      label: 'Why this strategy?',
      question: 'Why did AI choose this strategy?',
      intent: 'strategy-explainer',
    },
    {
      id: 'weekly-reschedule',
      label: 'Reschedule help',
      question: 'Which weekly work order should I reschedule first?',
      intent: 'reschedule',
    },
  ];
}

function withWeeklyBoardLink(
  insight: PlannerAiAssistantInsight,
  cards: PlannerAiCalendarCardInput[],
  preferredAssets: Array<string | undefined>,
  analysis: PlannerAiAnalysis,
): PlannerAiAssistantInsight {
  const boardLink = pickWeeklyBoardInsightLink(cards, preferredAssets, analysis.criticalSignals);

  if (!boardLink) {
    return insight;
  }

  return {
    ...insight,
    linkedAsset: boardLink.asset,
    linkedCardId: boardLink.cardId,
  };
}

function buildCopilotInsights(
  analysis: PlannerAiAnalysis,
  horizon: PlannerAiAssistantHorizon,
  activePlan?: PlannerAiPlanVariant | null,
  cards: PlannerAiCalendarCardInput[] = [],
): PlannerAiAssistantInsight[] {
  const topSignal = analysis.criticalSignals[0];
  const topBlocker = analysis.blockers[0];
  const planLabel = activePlan?.strategyLabel ?? 'Recommended';
  const topConflict = activePlan?.agentConflicts[0];
  const topAgentReasoning = activePlan?.agentReasoning[0];
  const primaryBoardLink = pickWeeklyBoardInsightLink(
    cards,
    [analysis.conveyorCard?.title, topSignal?.asset, topBlocker?.asset],
    analysis.criticalSignals,
  );

  if (horizon === 'monthly') {
    return [
      {
        id: 'monthly-compliance',
        title: 'Monthly compliance pressure',
        summary: `${analysis.baseline.openBacklog} open backlog items and ${analysis.criticalSignals.length} elevated CBM signals imply that the monthly route should protect PM compliance before adding discretionary work.`,
        tone: 'warning',
        metricLabel: `${analysis.baseline.pmCompliance}% baseline PM compliance`,
        sourceLabel: 'Planner baseline',
      },
      withWeeklyBoardLink(
        {
          id: 'monthly-parts',
          title: 'Readiness gate for monthly balancing',
          summary: topBlocker
            ? `${topBlocker.asset} remains blocked by parts, so monthly balancing should favor executable kits first.`
            : primaryBoardLink
              ? `${primaryBoardLink.asset} is the clearest weekly-board example of parts and health signals to inspect before monthly balancing.`
              : 'No hard parts blocker is dominating the monthly picture, so backlog balancing can focus on labor and compliance fit.',
          tone: topBlocker ? 'warning' : primaryBoardLink ? 'info' : 'positive',
          sourceLabel: 'Spare-parts adapter',
        },
        cards,
        [topBlocker?.asset, analysis.conveyorCard?.title, primaryBoardLink?.asset],
        analysis,
      ),
      {
        id: 'monthly-strategy',
        title: 'Current strategy fit',
        summary: activePlan
          ? `${planLabel} remains a reasonable monthly anchor because ${activePlan.orchestrationSummary.summary.toLowerCase()}`
          : `${planLabel} remains a reasonable monthly anchor because it keeps the weekly recommendation set actionable without hiding open backlog pressure.`,
        tone: 'info',
        sourceLabel: activePlan ? 'Multi-agent orchestrator' : 'Copilot',
        agentContributors: activePlan?.orchestrationSummary.participatingAgents,
      },
    ];
  }

  if (horizon === 'quarterly') {
    return [
      withWeeklyBoardLink(
        {
          id: 'quarterly-hotspot',
          title: 'Quarterly reliability hotspot',
          summary: topSignal
            ? `${topSignal.asset} is the leading quarterly reliability hotspot, with ${topSignal.daysToFailure} days-to-failure and elevated ${topSignal.metric}.`
            : primaryBoardLink
              ? `${primaryBoardLink.asset} is the best weekly-board example to inspect for quarterly reliability pressure.`
              : 'No single asset dominates the quarterly risk stack right now.',
          tone: topSignal ? 'critical' : primaryBoardLink ? 'info' : 'info',
          sourceLabel: 'CBM/PdM adapter',
        },
        cards,
        [analysis.conveyorCard?.title, topSignal?.asset, primaryBoardLink?.asset],
        analysis,
      ),
      {
        id: 'quarterly-clustering',
        title: 'Shutdown clustering opportunity',
        summary: activePlan?.agentReasoning.find((reasoning) => reasoning.agent === 'Production')?.summary ??
          'The quarter should cluster conveyor, molding, and queue work into fewer intervention windows so the weekly execution flow does not create recurring stop/start churn.',
        tone: 'info',
        sourceLabel: activePlan ? 'Production agent' : 'Copilot',
        agentContributors: activePlan ? ['Production'] : undefined,
      },
      {
        id: 'quarterly-labor',
        title: 'Resource conflict watch',
        summary: `${analysis.criticalSignals.length} high-priority signals competing for the same weekly crews indicates that quarterly planning should keep a recovery buffer instead of running every week at max load.`,
        tone: 'warning',
        sourceLabel: 'Planner baseline',
      },
    ];
  }

  if (horizon === 'annual') {
    return [
      {
        id: 'annual-overdue',
        title: 'Annual overdue exposure',
        summary: `${analysis.baseline.openBacklog} currently visible backlog items suggest that annual exposure is driven more by execution carryover than by lack of detected work.`,
        tone: 'warning',
        metricLabel: `${analysis.baseline.openBacklog} open items`,
        sourceLabel: 'Planner baseline',
      },
      withWeeklyBoardLink(
        {
          id: 'annual-criticality',
          title: 'Strategic risk anchor',
          summary: topSignal
            ? `${topSignal.asset} should stay in the annual risk narrative because repeated weekly deferral would compound its breakdown exposure.`
            : primaryBoardLink
              ? `${primaryBoardLink.asset} is the clearest weekly-board anchor for annual risk storytelling in this mock dataset.`
              : 'No annual risk anchor is currently overwhelming the rest of the asset base.',
          tone: topSignal ? 'critical' : primaryBoardLink ? 'info' : 'info',
          sourceLabel: 'CBM/PdM adapter',
        },
        cards,
        [analysis.conveyorCard?.title, topSignal?.asset, primaryBoardLink?.asset],
        analysis,
      ),
      {
        id: 'annual-strategy',
        title: 'Long-range strategy fit',
        summary: activePlan
          ? `${planLabel} is strongest when the annual plan wants a realistic bridge from strategic PM intent down to executable weekly work. ${activePlan.orchestrationSummary.summary}`
          : `${planLabel} is strongest when the annual plan wants a realistic bridge from strategic PM intent down to executable weekly work.`,
        tone: 'positive',
        sourceLabel: activePlan ? 'Multi-agent orchestrator' : 'Copilot',
        agentContributors: activePlan?.orchestrationSummary.participatingAgents,
      },
    ];
  }

  const weeklyInsights: PlannerAiAssistantInsight[] = [];

  if (analysis.conveyorCard) {
    weeklyInsights.push(
      withWeeklyBoardLink(
        {
          id: 'weekly-board-spotlight',
          title: 'Weekly board spotlight',
          summary: `${analysis.conveyorCard.title} is scheduled on the weekly board. Open it to review the mock health and parts chips on its work-order cards.`,
          tone: 'info',
          sourceLabel: 'Weekly planner board',
        },
        cards,
        [analysis.conveyorCard.title],
        analysis,
      ),
    );
  }

  weeklyInsights.push(
    withWeeklyBoardLink(
      {
        id: 'weekly-risk',
        title: 'Weekly risk anchor',
        summary: primaryBoardLink
          ? `${primaryBoardLink.asset} is the highest-risk asset currently visible on the weekly board${topSignal && topSignal.asset !== primaryBoardLink.asset ? `, while ${topSignal.asset} remains the broader mock CBM hotspot.` : '.'}`
          : topSignal
            ? `${topSignal.asset} is the riskiest mock CBM signal at ${topSignal.currentReading}, with ${topSignal.daysToFailure} days-to-failure.`
            : 'No critical weekly risk anchor is currently above the rest of the candidate set.',
        tone: primaryBoardLink || topSignal ? 'critical' : 'info',
        metricLabel: primaryBoardLink
          ? `Health ${primaryBoardLink.healthScore}`
          : topSignal
            ? `Health ${topSignal.healthScore}`
            : undefined,
        sourceLabel: 'CBM/PdM adapter',
      },
      cards,
      [analysis.conveyorCard?.title, primaryBoardLink?.asset, topSignal?.asset],
      analysis,
    ),
    withWeeklyBoardLink(
      {
        id: 'weekly-blocker',
        title: 'Execution blocker watch',
        summary: topConflict?.severity === 'blocker'
          ? topConflict.summary
          : topBlocker
            ? `${topBlocker.asset} is still constrained by parts readiness, so the weekly board should avoid over-committing it into direct execution.`
            : primaryBoardLink
              ? `${primaryBoardLink.asset} is a good weekly-board card to inspect for parts readiness before committing more work.`
              : 'No hard parts blocker is stopping the top weekly candidate set.',
        tone: topConflict?.severity === 'blocker' || topBlocker ? 'warning' : primaryBoardLink ? 'info' : 'positive',
        sourceLabel: topConflict ? 'Multi-agent conflict resolver' : 'Spare-parts adapter',
        agentContributors: topConflict?.agents,
      },
      cards,
      [topBlocker?.asset, analysis.conveyorCard?.title, primaryBoardLink?.asset],
      analysis,
    ),
    {
      id: 'weekly-strategy',
      title: 'Active strategy stance',
      summary: activePlan
        ? `${activePlan.strategyLabel} is active with ${activePlan.actions.length} proposed actions and ${activePlan.summaryMetrics.laborLoad.toLowerCase()} labor pressure. ${topAgentReasoning ? `${topAgentReasoning.agent} is currently the strongest shaping agent.` : ''}`
        : 'No strategy is active yet; generate a plan to compare execution trade-offs.',
      tone: activePlan ? 'info' : 'warning',
      sourceLabel: activePlan ? 'Multi-agent orchestrator' : 'Planner AI',
      agentContributors: activePlan?.orchestrationSummary.participatingAgents,
    },
  );

  return weeklyInsights;
}

function buildCopilotSuggestions(
  analysis: PlannerAiAnalysis,
  horizon: PlannerAiAssistantHorizon,
  activePlan?: PlannerAiPlanVariant | null,
): PlannerAiCopilotSuggestion[] {
  if (horizon !== 'weekly') {
    return [
      {
        id: `${horizon}-review-compare`,
        horizon,
        tone: 'info',
        actionType: 'review-compare',
        actionLabel: 'Compare strategies',
        title: `Review ${getHorizonLabel(horizon)} strategy trade-offs`,
        summary: `Use the phase 3 comparison flow to inspect how the current AI strategy behaves before making ${getHorizonLabel(horizon)} planning adjustments.`,
        reason: 'The planner already has a comparison surface that can ground longer-horizon decisions in the weekly execution slice.',
        agentContributors: activePlan?.orchestrationSummary.participatingAgents,
      },
      {
        id: `${horizon}-review-plan`,
        horizon,
        tone: activePlan ? 'positive' : 'warning',
        actionType: 'review-plan',
        actionLabel: activePlan ? 'Review active plan' : 'Generate AI plan',
        title: `Anchor ${getHorizonLabel(horizon)} decisions in an executable weekly plan`,
        summary: activePlan
          ? `${activePlan.strategyLabel} is the current execution anchor. Review it before shifting higher-horizon commitments.`
          : `No active weekly strategy is loaded. Generate one first so ${getHorizonLabel(horizon)} decisions can reference real execution constraints.`,
        reason: 'Longer-horizon copilot guidance is more useful when it is grounded in the current weekly plan state.',
        agentContributors: activePlan?.orchestrationSummary.participatingAgents,
      },
    ];
  }

  const suggestions: PlannerAiCopilotSuggestion[] = [];

  if (analysis.conveyorCard) {
    suggestions.push({
      id: 'weekly-reschedule-conveyor',
      horizon: 'weekly',
      tone: 'warning',
      actionType: 'open-reschedule',
      actionLabel: 'Open reschedule',
      title: `Revisit ${analysis.conveyorCard.workOrder}`,
      summary: `${analysis.conveyorCard.title} is already on the weekly board and is a good candidate for a guided reschedule review.`,
      reason: 'The weekly assistant should use the existing reschedule flow instead of creating a parallel edit path.',
      asset: analysis.conveyorCard.title,
      workOrderLabel: analysis.conveyorCard.workOrder,
      targetCardId: analysis.conveyorCard.id,
      priorityLabel: analysis.conveyorCard.priority,
      durationLabel: analysis.conveyorCard.duration,
      workType: analysis.conveyorCard.type,
      suggestedTechnician: analysis.conveyorCard.assignee.name,
      agentContributors: ['Production', 'Reliability', 'Safety'],
    });
  }

  if (analysis.planningTarget) {
    const riskSignal = analysis.riskByAsset.get(analysis.planningTarget.asset);
    suggestions.push({
      id: 'weekly-drag-planning-target',
      horizon: 'weekly',
      tone: 'positive',
      actionType: 'drag-to-schedule',
      actionLabel: 'Drag to weekly board',
      title: `Stage ${analysis.planningTarget.wo} into execution`,
      summary: `${analysis.planningTarget.asset} is unscheduled but executable. Drag this suggestion into a weekly slot to place it on the board.`,
      reason: riskSignal
        ? `${analysis.planningTarget.asset} is carrying ${riskSignal.daysToFailure} days-to-failure and should be scheduled before it rolls into another cycle.`
        : 'The planning queue item is a strong candidate for direct weekly scheduling.',
      asset: analysis.planningTarget.asset,
      workOrderLabel: analysis.planningTarget.wo,
      planningItemSourceId: analysis.planningTarget.wo,
      priorityLabel: analysis.planningTarget.priority,
      durationLabel: analysis.planningTarget.duration,
      workType: analysis.planningTarget.type,
      suggestedTechnician: analysis.planningTarget.suggestedTechnician,
      line: analysis.planningTarget.line,
      zone: analysis.planningTarget.zone,
      recommendedDay: 2,
      recommendedShift: 'day',
      recommendedStartHour: 8,
      agentContributors: ['Reliability', 'Spare Parts', 'Labor'],
    });
  }

  suggestions.push({
    id: 'weekly-review-compare',
    horizon: 'weekly',
    tone: 'info',
    actionType: 'review-compare',
    actionLabel: 'Compare strategies',
    title: 'Inspect strategy trade-offs before acting',
    summary: activePlan
      ? `${activePlan.strategyLabel} is active. Compare it against the other strategies if you need a different downtime vs. reliability posture.`
      : 'Use plan comparison to choose between balanced, downtime-focused, and reliability-focused scheduling patterns.',
    reason: 'Weekly copilot suggestions should connect directly to the existing phase 3 comparison flow.',
    agentContributors: activePlan?.orchestrationSummary.participatingAgents,
  });

  return suggestions;
}

function buildCopilotReply({
  question,
  horizon,
  analysis,
  activePlan,
}: {
  question: string;
  horizon: PlannerAiAssistantHorizon;
  analysis: PlannerAiAnalysis;
  activePlan?: PlannerAiPlanVariant | null;
}): PlannerAiAssistantMessage {
  const normalizedQuestion = question.toLowerCase();
  const topSignal = analysis.criticalSignals[0];
  const topBlocker = analysis.blockers[0];
  const topConflict = activePlan?.agentConflicts[0];
  const topReasoning = activePlan?.agentReasoning[0];
  let content = `Copilot reviewed the ${getHorizonLabel(horizon)} horizon and found no stronger recommendation than the current baseline.`;
  let intent: PlannerAiAssistantMessage['intent'] = 'general';

  if (normalizedQuestion.includes('riskiest')) {
    intent = 'risk-summary';
    content = topSignal
      ? `${topSignal.asset} is the riskiest ${getHorizonLabel(horizon)} asset right now. It is running at ${topSignal.currentReading}, with ${topSignal.daysToFailure} days-to-failure and a health score of ${topSignal.healthScore}.`
      : `No single asset is clearly dominating the ${getHorizonLabel(horizon)} risk stack right now.`;
  } else if (normalizedQuestion.includes('why') || normalizedQuestion.includes('strategy')) {
    intent = 'strategy-explainer';
    content = activePlan
      ? `${activePlan.strategyLabel} is active because ${activePlan.orchestrationSummary.summary} ${topReasoning ? `${topReasoning.agent} is the strongest shaping agent right now: ${topReasoning.summary}` : activePlan.rationale.summary}`
      : `No active strategy is loaded yet, so the next best step is to generate a fresh weekly plan before asking for strategy rationale.`;
  } else if (normalizedQuestion.includes('block') || normalizedQuestion.includes('constraint')) {
    intent = 'general';
    content = topConflict
      ? `${topConflict.title}. ${topConflict.summary} Recommended resolution: ${topConflict.resolution}`
      : topBlocker
        ? `${topBlocker.asset} is the main current readiness constraint. ${topBlocker.detail}`
        : 'No cross-agent blocker is dominating the current recommendation set right now.';
  } else if (normalizedQuestion.includes('monthly')) {
    intent = 'monthly-focus';
    content = `Monthly focus should protect PM compliance and keep blocked parts work out of the critical route. ${topBlocker ? `${topBlocker.asset} is the main readiness gate to watch.` : 'No single parts blocker is dominating the monthly route.'}`;
  } else if (normalizedQuestion.includes('quarter')) {
    intent = 'quarterly-focus';
    content = topSignal
      ? `Quarterly planning should cluster work around ${topSignal.asset} and other high-risk assets instead of spreading disruption across too many weeks.`
      : 'Quarterly planning should favor shutdown clustering and recovery buffer rather than maxing out every week.';
  } else if (normalizedQuestion.includes('annual')) {
    intent = 'annual-focus';
    content = `Annual planning should watch backlog carryover and overdue exposure first, then align the chosen weekly strategy with long-range PM load.`;
  } else if (normalizedQuestion.includes('reschedule')) {
    intent = 'reschedule';
    content = analysis.conveyorCard
      ? `${analysis.conveyorCard.workOrder} is the best current reschedule candidate because it is already on the weekly board and can be moved through the existing guided reschedule flow.`
      : 'There is no obvious board candidate to reschedule right now, so focus on scheduling a high-risk planning item first.';
  }

  return {
    id: `assistant-reply-${Date.now()}`,
    role: 'assistant',
    content,
    timestampLabel: buildAssistantTimestamp(),
    horizon,
    intent,
  };
}

function buildWhatIfScenarios(horizon: PlannerAiAssistantHorizon): PlannerAiWhatIfScenario[] {
  return [
    {
      id: `${horizon}-move-pm`,
      label: 'Move a PM to a later window',
      description: `Simulate moving a preventive task later in the ${getHorizonLabel(horizon)} horizon to free near-term capacity.`,
      kind: 'move-pm-next-window',
    },
    {
      id: `${horizon}-defer-pm`,
      label: 'Defer a low-risk PM',
      description: `Estimate the trade-off of deferring a low-risk PM for the current ${getHorizonLabel(horizon)} cycle.`,
      kind: 'defer-low-risk-pm',
    },
    {
      id: `${horizon}-bundle-window`,
      label: 'Bundle work into one shutdown window',
      description: `Compress multiple tasks into a shared shutdown window and measure downtime vs. labor strain.`,
      kind: 'bundle-shutdown-window',
    },
  ];
}

function buildWhatIfMetrics(
  analysis: PlannerAiAnalysis,
  kind: PlannerAiWhatIfScenarioKind,
): PlannerAiWhatIfResult['metrics'] {
  if (kind === 'move-pm-next-window') {
    return [
      {
        id: 'risk',
        label: 'Breakdown Risk',
        beforeLabel: `${analysis.baseline.riskScore}`,
        afterLabel: `${analysis.baseline.riskScore + 7}`,
        deltaLabel: '+7',
        emphasis: 'negative',
      },
      {
        id: 'downtime',
        label: 'Planned Downtime',
        beforeLabel: `${analysis.baseline.plannedDowntimeHours.toFixed(1)}h`,
        afterLabel: `${Math.max(10.8, analysis.baseline.plannedDowntimeHours - 1.1).toFixed(1)}h`,
        deltaLabel: '-1.1h',
        emphasis: 'positive',
      },
      {
        id: 'backlog',
        label: 'Open Backlog',
        beforeLabel: `${analysis.baseline.openBacklog}`,
        afterLabel: `${analysis.baseline.openBacklog + 1}`,
        deltaLabel: '+1',
        emphasis: 'negative',
      },
    ];
  }

  if (kind === 'defer-low-risk-pm') {
    return [
      {
        id: 'risk',
        label: 'Breakdown Risk',
        beforeLabel: `${analysis.baseline.riskScore}`,
        afterLabel: `${analysis.baseline.riskScore + 3}`,
        deltaLabel: '+3',
        emphasis: 'neutral',
      },
      {
        id: 'readiness',
        label: 'Parts Readiness',
        beforeLabel: `${analysis.baseline.partsReadiness}%`,
        afterLabel: `${Math.min(96, analysis.baseline.partsReadiness + 4)}%`,
        deltaLabel: '+4%',
        emphasis: 'positive',
      },
      {
        id: 'capacity',
        label: 'Labor Pressure',
        beforeLabel: 'Medium',
        afterLabel: 'Low',
        deltaLabel: 'easier',
        emphasis: 'positive',
      },
    ];
  }

  return [
    {
      id: 'downtime',
      label: 'Planned Downtime',
      beforeLabel: `${analysis.baseline.plannedDowntimeHours.toFixed(1)}h`,
      afterLabel: `${Math.max(9.6, analysis.baseline.plannedDowntimeHours - 2.0).toFixed(1)}h`,
      deltaLabel: '-2.0h',
      emphasis: 'positive',
    },
    {
      id: 'risk',
      label: 'Breakdown Risk',
      beforeLabel: `${analysis.baseline.riskScore}`,
      afterLabel: `${Math.max(30, analysis.baseline.riskScore - 4)}`,
      deltaLabel: '-4',
      emphasis: 'positive',
    },
    {
      id: 'capacity',
      label: 'Labor Pressure',
      beforeLabel: 'Medium',
      afterLabel: 'High',
      deltaLabel: 'tighter',
      emphasis: 'negative',
    },
  ];
}

export function generatePlannerAiSuggestions({
  snapshot,
  cards,
  planningItems,
  horizon,
  activePlan,
}: {
  snapshot?: PlannerAiPlannerSnapshot;
  cards?: PlannerAiCalendarCardInput[];
  planningItems?: PlannerAiPlanningItemInput[];
  horizon: PlannerAiAssistantHorizon;
  activePlan?: PlannerAiPlanVariant | null;
}): PlannerAiCopilotSuggestion[] {
  const resolvedSnapshot = resolvePlannerSnapshot({ snapshot, cards, planningItems });
  const analysis = analyzePlannerSnapshot(resolvedSnapshot);
  const resolvedPlan = getResolvedCopilotPlan(resolvedSnapshot, activePlan);
  return buildCopilotSuggestions(analysis, horizon, resolvedPlan);
}

export function generatePlannerAiCopilotSnapshot({
  snapshot,
  cards,
  planningItems,
  horizon,
  question,
  activePlan,
}: {
  snapshot?: PlannerAiPlannerSnapshot;
  cards?: PlannerAiCalendarCardInput[];
  planningItems?: PlannerAiPlanningItemInput[];
  horizon: PlannerAiAssistantHorizon;
  question?: string;
  activePlan?: PlannerAiPlanVariant | null;
}): PlannerAiCopilotSnapshot {
  const resolvedSnapshot = resolvePlannerSnapshot({ snapshot, cards, planningItems });
  const analysis = analyzePlannerSnapshot(resolvedSnapshot);
  const resolvedPlan = getResolvedCopilotPlan(resolvedSnapshot, activePlan);
  const insights = dedupeCopilotInsights(buildCopilotInsights(analysis, horizon, resolvedPlan, resolvedSnapshot.cards));
  const proactiveContext = buildCopilotProactiveContext(analysis, horizon, insights, activePlan, resolvedPlan);

  return {
    horizon,
    proactiveContext,
    greeting: buildCopilotGreeting(horizon, proactiveContext, activePlan),
    quickPrompts: buildCopilotQuickPrompts(horizon),
    insights,
    suggestions: buildCopilotSuggestions(analysis, horizon, resolvedPlan),
    assistantReply: question?.trim()
      ? buildCopilotReply({
          question,
          horizon,
          analysis,
          activePlan: resolvedPlan,
        })
      : undefined,
    whatIfScenarios: buildWhatIfScenarios(horizon),
  };
}

export function generatePlannerAiWhatIfResult({
  snapshot,
  cards,
  planningItems,
  horizon,
  scenario,
}: {
  snapshot?: PlannerAiPlannerSnapshot;
  cards?: PlannerAiCalendarCardInput[];
  planningItems?: PlannerAiPlanningItemInput[];
  horizon: PlannerAiAssistantHorizon;
  scenario: PlannerAiWhatIfScenario;
}): PlannerAiWhatIfResult {
  const resolvedSnapshot = resolvePlannerSnapshot({ snapshot, cards, planningItems });
  const analysis = analyzePlannerSnapshot(resolvedSnapshot);
  const resolvedPlan = getResolvedCopilotPlan(resolvedSnapshot);
  const blockers = analysis.blockers.length
    ? [analysis.blockers[0].detail]
    : scenario.kind === 'bundle-shutdown-window'
      ? ['Bundling more work into one window raises crew concentration and may require supervisor review.']
      : [];

  const summaryByKind: Record<PlannerAiWhatIfScenarioKind, string> = {
    'move-pm-next-window': `Moving a preventive task later in the ${getHorizonLabel(horizon)} horizon frees near-term capacity but increases failure exposure and backlog carryover.`,
    'defer-low-risk-pm': `Deferring a low-risk PM eases capacity and parts pressure, but it modestly increases downstream risk if the task keeps slipping.`,
    'bundle-shutdown-window': `Bundling work into one shared shutdown window improves downtime efficiency, but it increases labor concentration in that execution block.`,
  };

  const recommendationByKind: Record<PlannerAiWhatIfScenarioKind, string> = {
    'move-pm-next-window': 'Use this only when near-term production protection matters more than immediate risk reduction.',
    'defer-low-risk-pm': 'Use this when you need to recover capacity without touching the highest-risk assets.',
    'bundle-shutdown-window': 'Use this when the team can absorb a denser work block and wants fewer separate production interruptions.',
  };

  return {
    id: `what-if-${scenario.kind}`,
    title: scenario.label,
    summary: summaryByKind[scenario.kind],
    recommendation: recommendationByKind[scenario.kind],
    generatedAt: new Date().toLocaleString(),
    metrics: buildWhatIfMetrics(analysis, scenario.kind),
    blockers,
    horizonImpacts: resolvedPlan
      ? generatePlannerAiCascadePreview({
          snapshot: resolvedSnapshot,
          plan: resolvedPlan,
          selectedActionIds: resolvedPlan.actions.slice(0, Math.min(2, resolvedPlan.actions.length)).map((action) => action.id),
        }).impacts
      : undefined,
    approvalRequests: resolvedPlan
      ? generatePlannerAiCascadePreview({
          snapshot: resolvedSnapshot,
          plan: resolvedPlan,
          selectedActionIds: resolvedPlan.actions.slice(0, Math.min(2, resolvedPlan.actions.length)).map((action) => action.id),
        }).approvalRequests
      : undefined,
    coverageSummary: resolvedSnapshot.coverageSummary,
    agentCommentary: resolvedPlan?.agentReasoning.slice(0, 3).map((reasoning) => ({
      agent: reasoning.agent === 'Follow-Up' || reasoning.agent === 'Planner' ? 'Reliability' : reasoning.agent,
      summary:
        scenario.kind === 'bundle-shutdown-window'
          ? `${reasoning.agent}: ${reasoning.summary}`
          : scenario.kind === 'move-pm-next-window'
            ? `${reasoning.agent}: moving work later changes the current ${reasoning.agent.toLowerCase()} posture from the active strategy baseline.`
            : `${reasoning.agent}: deferring lower-risk work eases near-term pressure but should stay inside the agent's current caution envelope.`,
      stance:
        reasoning.stance === 'blocking'
          ? 'block'
          : reasoning.stance === 'warning'
            ? 'warning'
            : 'support',
    })),
  };
}
