import type { PlannerAiAgentEvaluation, PlannerAiPlanAction, PlannerAiPlanStrategy } from '../types';
import type { PlannerAiAnalysis } from './plannerAiAnalysis';

type EvaluateSafetyAgentParams = {
  analysis: PlannerAiAnalysis;
  strategy: PlannerAiPlanStrategy;
  actions: PlannerAiPlanAction[];
};

function actionNeedsPermitReview(action: PlannerAiPlanAction) {
  const zoneText = `${action.asset} ${'zone' in action ? action.zone ?? '' : ''}`.toLowerCase();
  return zoneText.includes('molding') || zoneText.includes('boiler') || zoneText.includes('conveyor');
}

export function evaluateSafetyAgent({ analysis, strategy, actions }: EvaluateSafetyAgentParams): PlannerAiAgentEvaluation {
  const permitReviewActions = actions.filter(actionNeedsPermitReview);
  const criticalSignal = analysis.criticalSignals[0];

  return {
    agent: 'Safety',
    title: 'Safety agent',
    summary: permitReviewActions.length
      ? `${permitReviewActions.length} proposed action${permitReviewActions.length === 1 ? '' : 's'} touch zones or assets that should keep a permit-style review note in the ${strategy} plan.`
      : 'No obvious hazardous overlap or permit-style review pattern was detected in the current action set.',
    confidence: criticalSignal ? 82 : 78,
    findings: permitReviewActions.slice(0, 2).map((action, index) => ({
      id: `safety-review-${index + 1}`,
      agent: 'Safety' as const,
      title: 'Safety review note',
      summary: `${action.asset} should keep a safety review note visible because the proposed work touches a zone that often needs tighter execution control.`,
      severity: 'warning' as const,
      asset: action.asset,
      sourceLabel: 'Safety heuristic',
      relatedActionIds: [action.id],
    })),
    actionAssessments: actions.map((action) => {
      const needsReview = actionNeedsPermitReview(action);
      return {
        agent: 'Safety',
        actionId: action.id,
        stance: needsReview ? 'warning' : 'support',
        confidence: needsReview ? 79 : 84,
        summary: needsReview
          ? `${action.asset} is workable, but safety wants a visible review checkpoint before execution is treated as fully frictionless.`
          : `${action.asset} does not present an obvious additional safety constraint in the current planning slice.`,
      };
    }),
  };
}
