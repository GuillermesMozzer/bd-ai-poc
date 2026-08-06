import type { PlannerAiAgentEvaluation, PlannerAiPlanAction, PlannerAiPlanStrategy } from '../types';
import type { PlannerAiAnalysis } from './plannerAiAnalysis';

type EvaluateSparePartsAgentParams = {
  analysis: PlannerAiAnalysis;
  strategy: PlannerAiPlanStrategy;
  actions: PlannerAiPlanAction[];
};

export function evaluateSparePartsAgent({
  analysis,
  strategy,
  actions,
}: EvaluateSparePartsAgentParams): PlannerAiAgentEvaluation {
  const blockingReadiness = analysis.partsReadiness.filter((item) => item.status === 'blocked');
  const riskReadiness = analysis.partsReadiness.filter((item) => item.status === 'risk' || item.status === 'unknown');

  return {
    agent: 'Spare Parts',
    title: 'Spare-parts agent',
    summary: blockingReadiness.length
      ? `${blockingReadiness[0].asset} remains materially blocked, so the ${strategy} plan must protect execution credibility by not treating it as fully ready.`
      : riskReadiness.length
        ? `${riskReadiness.length} action candidate${riskReadiness.length === 1 ? '' : 's'} carry supply risk, so the plan should keep them visible but review timing.`
        : 'Current recommendation candidates are materially executable and can be prioritized by risk and production fit.',
    confidence: blockingReadiness.length ? 80 : 91,
    findings: [
      ...blockingReadiness.map((item, index) => ({
        id: `spare-parts-blocker-${index + 1}`,
        agent: 'Spare Parts' as const,
        title: 'Material blocker',
        summary: `${item.asset}: ${item.detail}`,
        severity: 'blocker' as const,
        asset: item.asset,
        sourceLabel: item.sourceLabel ?? 'Spare-parts adapter',
        relatedActionIds: actions.filter((action) => action.asset === item.asset).map((action) => action.id),
      })),
      ...riskReadiness.slice(0, 2).map((item, index) => ({
        id: `spare-parts-warning-${index + 1}`,
        agent: 'Spare Parts' as const,
        title: 'Material risk',
        summary: `${item.asset}: ${item.summary}`,
        severity: 'warning' as const,
        asset: item.asset,
        sourceLabel: item.sourceLabel ?? 'Spare-parts adapter',
        relatedActionIds: actions.filter((action) => action.asset === item.asset).map((action) => action.id),
      })),
    ],
    actionAssessments: actions.map((action) => {
      const readiness = analysis.partsReadiness.find((item) => item.asset === action.asset);
      const confidence = readiness?.status === 'ready' ? 94 : readiness?.status === 'risk' ? 76 : readiness?.status === 'blocked' ? 92 : 70;
      return {
        agent: 'Spare Parts',
        actionId: action.id,
        stance: readiness?.status === 'blocked' ? 'block' : readiness?.status === 'risk' || readiness?.status === 'unknown' ? 'warning' : 'support',
        confidence,
        summary:
          readiness?.status === 'blocked'
            ? `${action.asset} cannot be treated as execution-ready because parts coverage is blocked.`
            : readiness?.status === 'risk' || readiness?.status === 'unknown'
              ? `${action.asset} remains viable, but supply readiness is thin enough that the ${strategy} plan should keep a review warning on it.`
              : `${action.asset} has parts coverage aligned with the proposed maintenance window.`,
      };
    }),
  };
}
