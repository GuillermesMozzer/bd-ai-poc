import type { PlannerAiAssistantInsight, PlannerAiInsightTone } from './types';

const tonePriority: Record<PlannerAiInsightTone, number> = {
  critical: 4,
  warning: 3,
  info: 2,
  positive: 1,
};

function pickDominantTone(insights: PlannerAiAssistantInsight[]): PlannerAiInsightTone {
  return insights.reduce<PlannerAiInsightTone>(
    (current, insight) => (tonePriority[insight.tone] > tonePriority[current] ? insight.tone : current),
    insights[0].tone,
  );
}

function mergeInsightGroup(group: PlannerAiAssistantInsight[]): PlannerAiAssistantInsight {
  if (group.length === 1) {
    return group[0];
  }

  const linkedAsset = group[0].linkedAsset;
  const linkedCardId = group[0].linkedCardId;
  const metricInsight = group.find((insight) => insight.metricLabel);

  return {
    id: `merged-${linkedCardId ?? linkedAsset ?? group[0].id}`,
    title: linkedAsset ? `${linkedAsset} — combined signals` : 'Combined horizon signals',
    summary: group.map((insight) => `${insight.title}: ${insight.summary}`).join(' '),
    tone: pickDominantTone(group),
    metricLabel: metricInsight?.metricLabel,
    sourceLabel: [...new Set(group.map((insight) => insight.sourceLabel).filter(Boolean))].join(' · '),
    linkedAsset,
    linkedCardId,
    agentContributors: [...new Set(group.flatMap((insight) => insight.agentContributors ?? []))],
  };
}

export function dedupeCopilotInsights(insights: PlannerAiAssistantInsight[]): PlannerAiAssistantInsight[] {
  const grouped = new Map<string, PlannerAiAssistantInsight[]>();
  const standalone: PlannerAiAssistantInsight[] = [];

  insights.forEach((insight) => {
    const groupKey = insight.linkedCardId ?? insight.linkedAsset;
    if (!groupKey) {
      standalone.push(insight);
      return;
    }

    const currentGroup = grouped.get(groupKey) ?? [];
    currentGroup.push(insight);
    grouped.set(groupKey, currentGroup);
  });

  return [...[...grouped.values()].map(mergeInsightGroup), ...standalone];
}
