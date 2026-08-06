import type { PlannerAiPlanVariant } from '../ai/types';

export type StrategyComparisonInsights = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  beforeYouApply: string[];
};

const laborLoadRank = { Low: 1, Medium: 2, High: 3 } as const;

type MetricDefinition = {
  label: string;
  direction: 'lower' | 'higher';
  getValue: (variant: PlannerAiPlanVariant) => number;
  format: (variant: PlannerAiPlanVariant) => string;
};

const metricDefinitions: MetricDefinition[] = [
  {
    label: 'planned downtime',
    direction: 'lower',
    getValue: (variant) => variant.summaryMetrics.plannedDowntimeHours,
    format: (variant) => `${variant.summaryMetrics.plannedDowntimeHours.toFixed(1)}h`,
  },
  {
    label: 'risk score',
    direction: 'lower',
    getValue: (variant) => variant.summaryMetrics.riskScore,
    format: (variant) => `${variant.summaryMetrics.riskScore}`,
  },
  {
    label: 'PM compliance',
    direction: 'higher',
    getValue: (variant) => variant.summaryMetrics.pmCompliance,
    format: (variant) => `${variant.summaryMetrics.pmCompliance}%`,
  },
  {
    label: 'open backlog',
    direction: 'lower',
    getValue: (variant) => variant.summaryMetrics.openBacklog,
    format: (variant) => `${variant.summaryMetrics.openBacklog} items`,
  },
  {
    label: 'annual savings',
    direction: 'lower',
    getValue: (variant) => Number(variant.summaryMetrics.annualCostDelta.replace(/[^0-9.-]/g, '')) || 0,
    format: (variant) => variant.summaryMetrics.annualCostDelta,
  },
  {
    label: 'labor load',
    direction: 'lower',
    getValue: (variant) => laborLoadRank[variant.summaryMetrics.laborLoad],
    format: (variant) => variant.summaryMetrics.laborLoad,
  },
];

function isBestValue(values: number[], value: number, direction: 'lower' | 'higher') {
  const best = direction === 'lower' ? Math.min(...values) : Math.max(...values);
  return value === best;
}

function isWorstValue(values: number[], value: number, direction: 'lower' | 'higher') {
  const worst = direction === 'lower' ? Math.max(...values) : Math.min(...values);
  return value === worst && values.length > 1;
}

function buildComparativeInsights(variant: PlannerAiPlanVariant, allVariants: PlannerAiPlanVariant[]) {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  metricDefinitions.forEach((metric) => {
    const values = allVariants.map((entry) => metric.getValue(entry));
    const value = metric.getValue(variant);

    if (isBestValue(values, value, metric.direction)) {
      const runnerUp = [...allVariants]
        .filter((entry) => entry.id !== variant.id)
        .sort((left, right) => {
          const leftValue = metric.getValue(left);
          const rightValue = metric.getValue(right);
          return metric.direction === 'lower' ? leftValue - rightValue : rightValue - leftValue;
        })[0];

      if (runnerUp) {
        strengths.push(
          `Best ${metric.label} in this comparison (${metric.format(variant)} vs ${metric.format(runnerUp)} in ${runnerUp.strategyLabel}).`,
        );
      } else {
        strengths.push(`Leads on ${metric.label} (${metric.format(variant)}).`);
      }
      return;
    }

    if (isWorstValue(values, value, metric.direction)) {
      const leader = [...allVariants].sort((left, right) => {
        const leftValue = metric.getValue(left);
        const rightValue = metric.getValue(right);
        return metric.direction === 'lower' ? leftValue - rightValue : rightValue - leftValue;
      })[0];

      if (leader && leader.id !== variant.id) {
        weaknesses.push(
          `Weakest ${metric.label} here (${metric.format(variant)} vs ${metric.format(leader)} in ${leader.strategyLabel}).`,
        );
      }
    }
  });

  return { strengths, weaknesses };
}

export function buildStrategyComparisonInsights(
  variant: PlannerAiPlanVariant,
  allVariants: PlannerAiPlanVariant[],
): StrategyComparisonInsights {
  const { strengths: comparativeStrengths, weaknesses: comparativeWeaknesses } = buildComparativeInsights(
    variant,
    allVariants,
  );

  const strengths = [
    ...comparativeStrengths.slice(0, 2),
    variant.rationale.tradeoffs[0],
    ...variant.agentReasoning
      .filter((entry) => entry.stance === 'supporting' || !entry.stance)
      .slice(0, 2)
      .map((entry) => `${entry.agent}: ${entry.summary}`),
    variant.orchestrationSummary.summary,
  ].filter(Boolean);

  const weaknesses = [
    ...comparativeWeaknesses.slice(0, 2),
    variant.rationale.tradeoffs[1],
    ...variant.agentReasoning
      .filter((entry) => entry.stance === 'warning' || entry.stance === 'blocking')
      .map((entry) => `${entry.agent} (${entry.stance === 'blocking' ? 'blocking' : 'caution'}): ${entry.summary}`),
    ...variant.blockers.slice(0, 2).map((blocker) => `Parts blocker on ${blocker.asset}: ${blocker.summary}`),
    ...variant.agentConflicts.slice(0, 1).map((conflict) => conflict.summary),
  ].filter(Boolean);

  const uniqueStrengths = [...new Set(strengths)].slice(0, 4);
  const uniqueWeaknesses = [...new Set(weaknesses)].slice(0, 4);

  return {
    summary: variant.rationale.summary || variant.narrative,
    strengths: uniqueStrengths.length ? uniqueStrengths : [variant.strategyDescription],
    weaknesses: uniqueWeaknesses.length
      ? uniqueWeaknesses
      : ['No major agent warnings surfaced, but review schedule deltas before applying.'],
    beforeYouApply: variant.rationale.recommendedNextSteps.slice(0, 2),
  };
}
