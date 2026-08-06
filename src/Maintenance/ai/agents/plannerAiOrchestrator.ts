import type {
  PlannerAiAgentAssessment,
  PlannerAiAgentConflict,
  PlannerAiAgentEvaluation,
  PlannerAiAgentReasoning,
  PlannerAiConfidenceFactor,
  PlannerAiFeasibilityItem,
  PlannerAiFeasibilityStatus,
  PlannerAiPlanAction,
  PlannerAiPlanStrategy,
  PlannerAiOrchestrationSummary,
} from '../types';
import type { PlannerAiAnalysis } from './plannerAiAnalysis';
import { evaluateLaborAgent } from './laborAgent';
import { evaluateProductionAgent } from './productionAgent';
import { evaluateReliabilityAgent } from './reliabilityAgent';
import { evaluateSafetyAgent } from './safetyAgent';
import { evaluateSparePartsAgent } from './sparePartsAgent';

export type PlannerAiOrchestrationResult = {
  actions: PlannerAiPlanAction[];
  agentEvaluations: PlannerAiAgentEvaluation[];
  agentReasoning: PlannerAiAgentReasoning[];
  confidenceFactors: PlannerAiConfidenceFactor[];
  feasibilityChecklist: PlannerAiFeasibilityItem[];
  agentConflicts: PlannerAiAgentConflict[];
  orchestrationSummary: PlannerAiOrchestrationSummary;
};

type OrchestratePlannerAiActionsParams = {
  analysis: PlannerAiAnalysis;
  strategy: PlannerAiPlanStrategy;
  actions: PlannerAiPlanAction[];
};

function uniqueValues<T>(values: T[]) {
  return [...new Set(values)];
}

function getDominantStatus(statuses: PlannerAiFeasibilityStatus[]): PlannerAiFeasibilityStatus {
  if (statuses.includes('blocker')) {
    return 'blocker';
  }
  if (statuses.includes('warning')) {
    return 'warning';
  }
  return 'pass';
}

function mapAssessmentStatusToReadiness(assessments: PlannerAiAgentAssessment[]): PlannerAiFeasibilityStatus {
  if (assessments.some((assessment) => assessment.stance === 'block')) {
    return 'blocker';
  }
  if (assessments.some((assessment) => assessment.stance === 'warning')) {
    return 'warning';
  }
  return 'pass';
}

function getReasoningStance(evaluation: PlannerAiAgentEvaluation): PlannerAiAgentReasoning['stance'] {
  if (evaluation.findings.some((finding) => finding.severity === 'blocker') || evaluation.actionAssessments.some((assessment) => assessment.stance === 'block')) {
    return 'blocking';
  }
  if (evaluation.findings.some((finding) => finding.severity === 'warning') || evaluation.actionAssessments.some((assessment) => assessment.stance === 'warning')) {
    return 'warning';
  }
  return 'supporting';
}

function buildAgentReasoning(evaluations: PlannerAiAgentEvaluation[]): PlannerAiAgentReasoning[] {
  return evaluations.map((evaluation) => ({
    id: `reasoning-${evaluation.agent.toLowerCase().replace(/\s+/g, '-')}`,
    agent: evaluation.agent,
    title: evaluation.title,
    summary: evaluation.summary,
    confidence: evaluation.confidence,
    stance: getReasoningStance(evaluation),
    highlights: evaluation.findings.slice(0, 2).map((finding) => finding.summary),
  }));
}

function buildConfidenceFactors(evaluations: PlannerAiAgentEvaluation[], conflictCount: number): PlannerAiConfidenceFactor[] {
  const factors = evaluations.map((evaluation) => ({
    label: `${evaluation.agent} agent`,
    value: evaluation.confidence,
    summary: evaluation.summary,
  }));
  const consensusBase = Math.round(
    evaluations.reduce((total, evaluation) => total + evaluation.confidence, 0) / Math.max(1, evaluations.length),
  );

  return [
    ...factors,
    {
      label: 'Orchestrator agent',
      value: Math.max(58, consensusBase - conflictCount * 6),
      summary:
        conflictCount > 0
          ? `${conflictCount} cross-agent conflict${conflictCount === 1 ? '' : 's'} reduced the confidence of the merged recommendation set.`
          : 'Specialist agents aligned cleanly on the merged recommendation set.',
    },
  ];
}

function buildFeasibilityChecklist({
  analysis,
  evaluations,
  actions,
  conflicts,
}: {
  analysis: PlannerAiAnalysis;
  evaluations: PlannerAiAgentEvaluation[];
  actions: PlannerAiPlanAction[];
  conflicts: PlannerAiAgentConflict[];
}): PlannerAiFeasibilityItem[] {
  const reliability = evaluations.find((evaluation) => evaluation.agent === 'Reliability');
  const spareParts = evaluations.find((evaluation) => evaluation.agent === 'Spare Parts');
  const labor = evaluations.find((evaluation) => evaluation.agent === 'Labor');
  const production = evaluations.find((evaluation) => evaluation.agent === 'Production');
  const safety = evaluations.find((evaluation) => evaluation.agent === 'Safety');
  const blockedActions = actions.filter((action) => action.executionReadiness === 'blocker');
  const warningActions = actions.filter((action) => action.executionReadiness === 'warning');

  return [
    {
      id: 'reliability-coverage',
      label: 'Reliability signal coverage',
      status: analysis.criticalSignals.length ? 'pass' : 'warning',
      detail: reliability?.summary ?? 'Reliability signal coverage was not available.',
      sourceLabel: 'Reliability agent',
      agentContributors: ['Reliability'],
    },
    {
      id: 'parts-readiness',
      label: 'Spare-parts readiness',
      status: blockedActions.length ? 'blocker' : warningActions.length ? 'warning' : 'pass',
      detail: spareParts?.summary ?? 'Parts readiness review was not available.',
      resolutionHint: blockedActions.length ? 'Keep blocked work visible in planning until material coverage is restored.' : undefined,
      sourceLabel: 'Spare Parts agent',
      agentContributors: ['Spare Parts'],
    },
    {
      id: 'labor-envelope',
      label: 'Labor and slot fit',
      status: labor?.actionAssessments.some((assessment) => assessment.stance === 'warning') ? 'warning' : 'pass',
      detail: labor?.summary ?? 'Crew loading review was not available.',
      resolutionHint: labor?.actionAssessments.some((assessment) => assessment.stance === 'warning')
        ? 'Apply the highest-confidence actions first, then rebalance peak-day work if technician load tightens.'
        : undefined,
      sourceLabel: 'Labor agent',
      agentContributors: ['Labor'],
    },
    {
      id: 'production-window-fit',
      label: 'Production window alignment',
      status: production?.actionAssessments.some((assessment) => assessment.stance === 'warning') ? 'warning' : 'pass',
      detail: production?.summary ?? 'Production fit review was not available.',
      sourceLabel: 'Production agent',
      agentContributors: ['Production'],
    },
    {
      id: 'safety-review',
      label: 'Safety review posture',
      status: safety?.actionAssessments.some((assessment) => assessment.stance === 'warning') ? 'warning' : 'pass',
      detail: safety?.summary ?? 'Safety review was not available.',
      resolutionHint: conflicts.some((conflict) => conflict.agents.includes('Safety'))
        ? 'Keep the affected work visible, but preserve the safety review note before execution.'
        : undefined,
      sourceLabel: 'Safety agent',
      agentContributors: ['Safety'],
    },
  ];
}

function buildConflicts(actions: PlannerAiPlanAction[], assessmentsByActionId: Map<string, PlannerAiAgentAssessment[]>): PlannerAiAgentConflict[] {
  const conflicts: PlannerAiAgentConflict[] = [];

  actions.forEach((action) => {
    const assessments = assessmentsByActionId.get(action.id) ?? [];
    const supportAgents = assessments.filter((assessment) => assessment.stance === 'support');
    const warningAgents = assessments.filter((assessment) => assessment.stance === 'warning');
    const blockingAgents = assessments.filter((assessment) => assessment.stance === 'block');

    if (blockingAgents.length && supportAgents.length) {
      conflicts.push({
        id: `conflict-${action.id}-block`,
        title: `${action.asset} is recommended but not fully executable`,
        summary: `${blockingAgents[0].summary} Reliability or production still support the action, so the planner must decide whether to defer or rework timing.`,
        severity: 'blocker',
        resolution: 'Keep the action visible, but do not treat it as directly executable until the blocking constraint is cleared.',
        agents: uniqueValues([
          ...blockingAgents.map((assessment) => assessment.agent),
          ...supportAgents.map((assessment) => assessment.agent),
        ]),
        actionId: action.id,
        asset: action.asset,
      });
    } else if (warningAgents.length && supportAgents.length) {
      conflicts.push({
        id: `conflict-${action.id}-warning`,
        title: `${action.asset} has a cross-agent caution`,
        summary: `${warningAgents[0].summary} The action remains viable, but the plan should preserve a visible caution note on it.`,
        severity: 'warning',
        resolution: 'Proceed with review rather than auto-trusting the action as frictionless.',
        agents: uniqueValues([
          ...warningAgents.map((assessment) => assessment.agent),
          ...supportAgents.map((assessment) => assessment.agent),
        ]),
        actionId: action.id,
        asset: action.asset,
      });
    }
  });

  return conflicts;
}

export function orchestratePlannerAiActions({
  analysis,
  strategy,
  actions,
}: OrchestratePlannerAiActionsParams): PlannerAiOrchestrationResult {
  const evaluations = [
    evaluateSafetyAgent({ analysis, strategy, actions }),
    evaluateSparePartsAgent({ analysis, strategy, actions }),
    evaluateLaborAgent({ analysis, strategy, actions }),
    evaluateProductionAgent({ analysis, strategy, actions }),
    evaluateReliabilityAgent({ analysis, strategy, actions }),
  ];

  const assessmentsByActionId = new Map<string, PlannerAiAgentAssessment[]>();
  evaluations.forEach((evaluation) => {
    evaluation.actionAssessments.forEach((assessment) => {
      const current = assessmentsByActionId.get(assessment.actionId) ?? [];
      current.push(assessment);
      assessmentsByActionId.set(assessment.actionId, current);
    });
  });

  const agentConflicts = buildConflicts(actions, assessmentsByActionId);
  const mergedActions = actions.map((action) => {
    const assessments = assessmentsByActionId.get(action.id) ?? [];
    const assessmentReadiness = mapAssessmentStatusToReadiness(assessments);
    const executionReadiness = getDominantStatus([action.executionReadiness, assessmentReadiness]);
    const sortedAssessments = [...assessments].sort((left, right) => right.confidence - left.confidence);
    const primaryAssessment =
      sortedAssessments.find((assessment) => assessment.stance !== 'support') ?? sortedAssessments[0] ?? null;
    const confidenceBase =
      assessments.length > 0
        ? Math.round((action.confidence + assessments.reduce((total, assessment) => total + assessment.confidence, 0) / assessments.length) / 2)
        : action.confidence;
    const linkedConflictIds = agentConflicts.filter((conflict) => conflict.actionId === action.id).map((conflict) => conflict.id);

    const inferredAgentContributors = uniqueValues([
      ...action.agentContributors,
      ...evaluations
        .filter((evaluation) => evaluation.actionAssessments.some((assessment) => assessment.actionId === action.id))
        .map((evaluation) => evaluation.agent),
    ]);

    return {
      ...action,
      confidence: confidenceBase,
      executionReadiness,
      primaryAgent: primaryAssessment?.agent ?? action.primaryAgent,
      agentContributors: inferredAgentContributors,
      agentAssessmentSummary: primaryAssessment?.summary ?? action.agentAssessmentSummary,
      agentAssessments: assessments,
      agentConflictIds: linkedConflictIds,
    };
  });

  const blockedActionCount = mergedActions.filter((action) => action.executionReadiness === 'blocker').length;
  const warningActionCount = mergedActions.filter((action) => action.executionReadiness === 'warning').length;
  const orchestrationSummary: PlannerAiOrchestrationSummary = {
    strategy,
    headline: `${evaluations.length} agents reviewed ${mergedActions.length} action${mergedActions.length === 1 ? '' : 's'}`,
    summary:
      blockedActionCount > 0
        ? `${blockedActionCount} action${blockedActionCount === 1 ? '' : 's'} remain blocked after cross-agent review, so the planner should treat the output as guided planning rather than direct execution.`
        : warningActionCount > 0
          ? `${warningActionCount} action${warningActionCount === 1 ? '' : 's'} carry cross-agent caution notes, but the merged plan is still executable with review.`
          : 'All specialist agents aligned on an execution-ready recommendation set.',
    participatingAgents: evaluations.map((evaluation) => evaluation.agent),
    blockedActionCount,
    warningActionCount,
    conflictCount: agentConflicts.length,
  };

  return {
    actions: mergedActions,
    agentEvaluations: evaluations,
    agentReasoning: buildAgentReasoning(evaluations),
    confidenceFactors: buildConfidenceFactors(evaluations, agentConflicts.length),
    feasibilityChecklist: buildFeasibilityChecklist({
      analysis,
      evaluations,
      actions: mergedActions,
      conflicts: agentConflicts,
    }),
    agentConflicts,
    orchestrationSummary,
  };
}
