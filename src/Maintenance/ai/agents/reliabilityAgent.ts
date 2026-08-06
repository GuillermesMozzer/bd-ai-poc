import type { PlannerAiAgentEvaluation, PlannerAiPlanAction, PlannerAiPlanStrategy } from '../types';
import type { PlannerAiAnalysis } from './plannerAiAnalysis';

type EvaluateReliabilityAgentParams = {
  analysis: PlannerAiAnalysis;
  strategy: PlannerAiPlanStrategy;
  actions: PlannerAiPlanAction[];
};

export function evaluateReliabilityAgent({
  analysis,
  strategy,
  actions,
}: EvaluateReliabilityAgentParams): PlannerAiAgentEvaluation {
  const topSignal = analysis.criticalSignals[0];

  return {
    agent: 'Reliability',
    title: 'Reliability agent',
    summary: topSignal
      ? `${topSignal.asset} anchors the ${strategy} variant because its degradation curve is the strongest condition signal in the current planning set.`
      : 'No single critical signal dominates the current plan, so reliability pressure stays moderate.',
    confidence: strategy === 'max-reliability' ? 95 : 89,
    findings: [
      ...(topSignal
        ? [
            {
              id: 'reliability-top-signal',
              agent: 'Reliability' as const,
              title: 'Top failure exposure',
              summary: `${topSignal.asset} is trending at ${topSignal.currentReading} with ${topSignal.daysToFailure} days-to-failure and a health score of ${topSignal.healthScore}.`,
              severity: 'warning' as const,
              asset: topSignal.asset,
              sourceLabel: 'CBM/PdM adapter',
              relatedActionIds: actions.filter((action) => action.asset === topSignal.asset).map((action) => action.id),
            },
          ]
        : []),
    ],
    actionAssessments: actions.map((action) => {
      const signal = analysis.riskByAsset.get(action.asset);
      const hasSignal = Boolean(signal);
      const supportBoost = strategy === 'max-reliability' ? 5 : strategy === 'recommended' ? 3 : 0;
      return {
        agent: 'Reliability',
        actionId: action.id,
        stance: hasSignal ? 'support' : action.kind === 'promote-follow-up-request' ? 'warning' : 'support',
        confidence: Math.min(98, (signal ? 78 + supportBoost + (100 - signal.healthScore) / 6 : 72) + (action.kind === 'schedule-planning-item' ? 4 : 0)),
        summary: signal
          ? `${action.asset} is backed by a ${signal.severity} ${signal.metric.toLowerCase()} signal, so pulling this work into the ${strategy} plan reduces near-term failure exposure.`
          : action.kind === 'promote-follow-up-request'
            ? `${action.asset} has weaker direct telemetry support, so reliability views this as visibility work more than an immediate execution driver.`
            : `${action.asset} still improves reliability posture even without being the strongest signal in the current stack.`,
      };
    }),
  };
}
