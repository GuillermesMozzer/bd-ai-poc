import type {ActionTrackerCategory, ActionTrackerRow} from '../actionTracker/types';
import type {ActionTrackerKanbanColumnId, ActionTrackerTableColumnId} from '../actionTracker/config';

export type TierMeetingLaneId = 'safety' | 'quality' | 'delivery' | 'cost' | 'people' | 'custom' | 'actionTracker';
export type TierMeetingLaneStatus = 'On Track' | 'Watch' | 'Critical';
export type TierMeetingLaneSpan = number;
export type TierMeetingLanePosition = {
  columnStart: number;
  rowStart: number;
};
export type TierMeetingInsightSeverity = 'info' | 'warning' | 'critical' | 'opportunity';
export type TierMeetingLaneComponentId =
  | 'laneGraphics'
  | 'aiInsights'
  | 'kpis'
  | 'quickLinks'
  | 'actionSummary'
  | 'dailyTracker'
  | 'additionalCards'
  | 'qualityCallouts'
  | 'scheduleWindow'
  | 'productInfo'
  | 'oeeCard'
  | 'graphsCharts'
  | 'chart'
  | 'insights'
  | 'focusAreas'
  | 'recognition'
  | 'communications'
  | 'startMeeting';

export type TierMeetingKPI = {
  id: string;
  label: string;
  value: string;
  target?: string;
  tone: string;
  note?: string;
};

export type TierMeetingGraphicCard = {
  id: string;
  scopeLabel: string;
  label: string;
  value: string;
  target: string;
  comparisonLabel: string;
  accent: string;
  trendValues: number[];
};

export type TierMeetingInsight = {
  id: string;
  title: string;
  description: string;
  severity: TierMeetingInsightSeverity;
  recommendation?: string;
};

export type TierMeetingActionSummary = {
  open: number;
  underReview: number;
  underApproval: number;
  completed: number;
  overdue: number;
};

export type TierMeetingChartPoint = {
  label: string;
  value: number;
  tone?: string;
};

export type TierMeetingDailyTrackerConfig = {
  centerLabel: string;
  totalDays: number;
  recordedThroughDay: number;
  activeDay: number;
  incidentDays: number[];
  details: TierMeetingDailyTrackerDayDetail[];
};

export type TierMeetingDailyTrackerDayDetail = {
  day: number;
  title: string;
  summary: string;
  notes: string[];
};

export type TierMeetingRecognition = {
  id: string;
  name: string;
  highlight: string;
  detail: string;
};

export type TierMeetingCommunication = {
  id: string;
  title: string;
  detail: string;
};

export type TierMeetingActionDetail = {
  id: string;
  title: string;
  owner: string;
  dueDate: string;
  priority: string;
  status: string;
};

export type TierMeetingPillar = {
  id: TierMeetingLaneId;
  category: ActionTrackerCategory;
  title: string;
  subtitle: string;
  color: string;
  aiInsightText: string;
  heroValue: string;
  heroLabel: string;
  status: TierMeetingLaneStatus;
  kpis: TierMeetingKPI[];
  insights: TierMeetingInsight[];
  actionSummary: TierMeetingActionSummary;
  chartTitle?: string;
  chartData?: TierMeetingChartPoint[];
  graphicCards?: TierMeetingGraphicCard[];
  dailyTracker?: TierMeetingDailyTrackerConfig;
  recognitions?: TierMeetingRecognition[];
  communications?: TierMeetingCommunication[];
  focusAreas?: string[];
  linkedActions: TierMeetingActionDetail[];
};

export type TierMeetingLaneSettings = {
  visibleComponentIds: TierMeetingLaneComponentId[];
  visibleKpiIds: string[];
  visibleGraphicCardIds: string[];
  componentOrder: TierMeetingLaneComponentId[];
  kpiOrder: string[];
  graphicCardOrder: string[];
  visibleTableColumnIds?: ActionTrackerTableColumnId[];
  visibleKanbanColumnIds?: ActionTrackerKanbanColumnId[];
};

export type TierMeetingBoardState = {
  visibleLaneIds: TierMeetingLaneId[];
  laneOrder: TierMeetingLaneId[];
  laneSpans: Record<TierMeetingLaneId, TierMeetingLaneSpan>;
  laneHeights: Record<TierMeetingLaneId, number>;
  lanePositions: Record<TierMeetingLaneId, TierMeetingLanePosition>;
  laneStatuses: Partial<Record<TierMeetingLaneId, TierMeetingLaneStatus>>;
  laneTitles: Partial<Record<TierMeetingLaneId, string>>;
  laneSettings: Partial<Record<TierMeetingLaneId, TierMeetingLaneSettings>>;
  expandedLaneSettings: Partial<Record<TierMeetingLaneId, TierMeetingLaneSettings>>;
  expandedLaneId: TierMeetingLaneId | null;
};

export type TierMeetingBoardActions = {
  onOpenActionTracker: (category?: ActionTrackerCategory) => void;
  onOpenActionDetails: (row: ActionTrackerRow) => void;
  onStartMeeting: () => void;
};
