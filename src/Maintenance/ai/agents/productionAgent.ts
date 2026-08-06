import type { PlannerAiAgentEvaluation, PlannerAiPlanAction, PlannerAiPlanStrategy } from '../types';
import type { PlannerAiAnalysis } from './plannerAiAnalysis';

type EvaluateProductionAgentParams = {
  analysis: PlannerAiAnalysis;
  strategy: PlannerAiPlanStrategy;
  actions: PlannerAiPlanAction[];
};

function getCurrentScheduledDay(analysis: PlannerAiAnalysis, action: PlannerAiPlanAction) {
  if (action.kind !== 'reschedule-card') {
    return null;
  }

  const matchingCard =
    analysis.conveyorCard?.id === action.sourceId
      ? analysis.conveyorCard
      : analysis.secondaryCard?.id === action.sourceId
        ? analysis.secondaryCard
        : null;

  return matchingCard?.day ?? null;
}

export function evaluateProductionAgent({
  analysis,
  strategy,
  actions,
}: EvaluateProductionAgentParams): PlannerAiAgentEvaluation {
  const earlyWindowActions = actions.filter(
    (action) => action.kind !== 'promote-follow-up-request' && action.recommendedDay <= 2,
  ).length;

  return {
    agent: 'Production',
    title: 'Production agent',
    summary:
      strategy === 'min-downtime'
        ? `The ${strategy} variant keeps ${earlyWindowActions} actions clustered inside earlier windows to avoid creating extra production interruptions later in the week.`
        : strategy === 'production-sync'
          ? `The production-sync variant bundles ${earlyWindowActions} actions into changeover-aligned windows so maintenance rides planned production transitions.`
          : 'Production impact is acceptable as long as work stays close to existing stop windows instead of scattering across the week.',
    confidence: strategy === 'min-downtime' ? 92 : strategy === 'production-sync' ? 91 : 83,
    findings: [
      {
        id: 'production-windowing',
        agent: 'Production',
        title: 'Downtime shaping',
        summary:
          earlyWindowActions > 0
            ? `${earlyWindowActions} proposed action${earlyWindowActions === 1 ? '' : 's'} are clustered into earlier execution windows to reduce stop/start churn.`
            : 'No meaningful downtime clustering opportunity was identified in the current action set.',
        severity: earlyWindowActions > 0 ? 'info' : 'warning',
        sourceLabel: 'Weekly planner state',
      },
    ],
    actionAssessments: actions.map((action) => {
      if (action.kind === 'promote-follow-up-request') {
        return {
          agent: 'Production',
          actionId: action.id,
          stance: 'support',
          confidence: 82,
          summary: `${action.asset} stays in planning visibility without forcing a production commitment yet.`,
        };
      }

      const currentDay = getCurrentScheduledDay(analysis, action);
      const isEarlierOrSameWindow = currentDay === null || action.recommendedDay <= currentDay;
      const isLateWeekCompression =
        action.recommendedDay >= 4 && strategy !== 'production-sync' && strategy !== 'min-downtime';

      return {
        agent: 'Production',
        actionId: action.id,
        stance: isLateWeekCompression ? 'warning' : 'support',
        confidence: strategy === 'min-downtime' && isEarlierOrSameWindow ? 93 : 84,
        summary: isLateWeekCompression
          ? `${action.asset} is still acceptable, but pushing it later risks creating another production interruption pocket.`
          : isEarlierOrSameWindow
            ? `${action.asset} aligns with the current production objective by staying inside or ahead of the existing maintenance window.`
            : `${action.asset} is acceptable, though production would prefer tighter clustering if other constraints allow it.`,
      };
    }),
  };
}
