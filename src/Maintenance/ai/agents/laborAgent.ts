import type { PlannerAiAgentEvaluation, PlannerAiPlanAction, PlannerAiPlanStrategy } from '../types';
import type { PlannerAiAnalysis } from './plannerAiAnalysis';

type EvaluateLaborAgentParams = {
  analysis: PlannerAiAnalysis;
  strategy: PlannerAiPlanStrategy;
  actions: PlannerAiPlanAction[];
};

function getRecommendedDay(action: PlannerAiPlanAction) {
  return action.kind === 'promote-follow-up-request' ? null : action.recommendedDay;
}

export function evaluateLaborAgent({ analysis, strategy, actions }: EvaluateLaborAgentParams): PlannerAiAgentEvaluation {
  void analysis;

  const actionsByDay = actions.reduce<Record<number, number>>((acc, action) => {
    const day = getRecommendedDay(action);
    if (day === null) {
      return acc;
    }
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});
  const peakDayEntry = Object.entries(actionsByDay).sort((left, right) => Number(right[1]) - Number(left[1]))[0];
  const peakDay = peakDayEntry ? Number(peakDayEntry[0]) : null;
  const peakDayLoad = peakDayEntry ? Number(peakDayEntry[1]) : 0;
  const isAggressiveStrategy = strategy === 'max-reliability';

  return {
    agent: 'Labor',
    title: 'Labor agent',
    summary:
      peakDayLoad > 2
        ? `The ${strategy} plan compresses ${peakDayLoad} actions onto day ${peakDay + 1}, so technician loading should be reviewed before full execution.`
        : 'Crew loading stays inside a manageable weekly envelope for manual assignment review.',
    confidence: peakDayLoad > 2 ? 76 : 86,
    findings: peakDayLoad > 2
      ? [
          {
            id: 'labor-peak-day',
            agent: 'Labor',
            title: 'Peak crew concentration',
            summary: `Day ${peakDay !== null ? peakDay + 1 : 1} is carrying ${peakDayLoad} planned actions, which raises assignment pressure.`,
            severity: 'warning',
            sourceLabel: 'Weekly planner state',
            relatedActionIds: actions.filter((action) => getRecommendedDay(action) === peakDay).map((action) => action.id),
          },
        ]
      : [],
    actionAssessments: actions.map((action) => {
      const day = getRecommendedDay(action);
      const dayLoad = day === null ? 0 : actionsByDay[day] ?? 0;
      const loadWarning = dayLoad > 2 || (isAggressiveStrategy && dayLoad > 1);
      return {
        agent: 'Labor',
        actionId: action.id,
        stance: action.kind === 'promote-follow-up-request' ? 'support' : loadWarning ? 'warning' : 'support',
        confidence: loadWarning ? 75 : 87,
        summary:
          action.kind === 'promote-follow-up-request'
            ? `${action.asset} improves backlog visibility without immediately consuming crew capacity.`
            : loadWarning
              ? `${action.asset} fits the plan, but the selected day is getting crew-dense and may need supervisor balancing.`
              : `${action.asset} fits the current labor envelope without creating unusual assignment pressure.`,
      };
    }),
  };
}
