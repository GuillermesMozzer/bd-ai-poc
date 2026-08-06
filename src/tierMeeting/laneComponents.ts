import type {TierMeetingLaneComponentId, TierMeetingPillar} from './types';

export type TierMeetingLaneComponentDefinition = {
  id: TierMeetingLaneComponentId;
  label: string;
};

const componentLabels: Record<TierMeetingLaneComponentId, string> = {
  laneGraphics: 'Lane graphics',
  aiInsights: 'AI insights',
  kpis: 'KPI cards',
  quickLinks: 'Quick links',
  actionSummary: 'Action summary',
  dailyTracker: 'Daily tracker',
  additionalCards: 'Additional cards',
  qualityCallouts: 'Quality call-outs',
  scheduleWindow: 'Schedule window',
  productInfo: 'Product info',
  oeeCard: 'OEE card',
  graphsCharts: 'Graphs & charts',
  chart: 'Chart',
  insights: 'Insights',
  focusAreas: 'Focus areas',
  recognition: 'Recognition',
  communications: 'Communications',
  startMeeting: 'Start meeting CTA',
};

export function getAvailableLaneComponentIds(pillar: TierMeetingPillar): TierMeetingLaneComponentId[] {
  if (pillar.id === 'safety') return ['laneGraphics', 'kpis', 'dailyTracker', 'additionalCards', 'aiInsights', 'actionSummary'];
  if (pillar.id === 'quality') return ['laneGraphics', 'kpis', 'dailyTracker', 'additionalCards', 'aiInsights', 'actionSummary'];
  if (pillar.id === 'delivery') return ['laneGraphics', 'kpis', 'productInfo', 'oeeCard', 'graphsCharts', 'aiInsights', 'actionSummary'];
  if (pillar.id === 'cost') return ['laneGraphics', 'kpis', 'graphsCharts', 'aiInsights', 'actionSummary'];
  if (pillar.id === 'custom') {
    return [
      'laneGraphics',
      'kpis',
      'dailyTracker',
      'additionalCards',
      'productInfo',
      'oeeCard',
      'graphsCharts',
      'recognition',
      'communications',
      'aiInsights',
      'focusAreas',
      'startMeeting',
      'actionSummary',
    ];
  }
  return ['laneGraphics', 'graphsCharts', 'recognition', 'communications', 'aiInsights', 'startMeeting', 'actionSummary'];
}

export function getLaneComponentDefinitions(pillar: TierMeetingPillar): TierMeetingLaneComponentDefinition[] {
  return getAvailableLaneComponentIds(pillar).map((id) => ({
    id,
    label: componentLabels[id],
  }));
}
