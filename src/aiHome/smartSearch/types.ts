import { SmartSearchCategory } from '../types';

export type SmartSearchExperienceMode = 'default' | 'columbus-west-site' | 'sandy-site';

export type SmartSearchIntent =
  | 'reliability'
  | 'training'
  | 'documents'
  | 'site_overview'
  | 'workforce'
  | 'general';

export type SmartSearchItemKind =
  | 'document'
  | 'task'
  | 'notification'
  | 'training'
  | 'asset'
  | 'timeSeries'
  | '3d'
  | 'action'
  | 'eso'
  | 'shiftNote';

export type SmartSearchCatalogItem = {
  id: string;
  category: Exclude<SmartSearchCategory, 'All'>;
  kind: SmartSearchItemKind;
  title: string;
  subtitle: string;
  summary: string;
  status: string;
  tone: string;
  metric: string;
  secondaryMetric?: string;
  location: string;
  plant: string;
  updated: string;
  keywords: string[];
  relatedIds?: string[];
  entityTags?: string[];
  [key: string]: unknown;
};

export type ScoredItem = SmartSearchCatalogItem & {
  score: number;
  matchedTerms: string[];
};

export type EntityNode = {
  id: string;
  itemId: string;
  label: string;
  category: Exclude<SmartSearchCategory, 'All'>;
  kind: SmartSearchItemKind;
  tone: string;
};

export type EntityEdge = {
  from: string;
  to: string;
  label?: string;
};

export type SmartSearchSummaryFinding = {
  label: string;
  value: string;
  tone: string;
};

export type SmartSearchSummaryAction = {
  label: string;
  accent: string;
  itemId?: string;
};

export type SmartSearchEngineSummary = {
  text: string;
  findings: SmartSearchSummaryFinding[];
  followUps: string[];
  actions: SmartSearchSummaryAction[];
};

export type SmartSearchEngineStats = {
  sourcesSearched: number;
  totalMatches: number;
  totalIndexed: number;
  topCategories: Array<{ category: string; count: number }>;
};

export type SmartSearchFilters = {
  type: string;
  location: string;
  plant: string;
  date: string;
};

export type SmartSearchEngineResult = {
  intent: SmartSearchIntent;
  rankedResults: ScoredItem[];
  categoryBuckets: Record<Exclude<SmartSearchCategory, 'All'>, ScoredItem[]>;
  entityGraph: { nodes: EntityNode[]; edges: EntityEdge[] };
  summary: SmartSearchEngineSummary;
  stats: SmartSearchEngineStats;
};

export const SMART_SEARCH_SOURCE_CATEGORIES: Exclude<SmartSearchCategory, 'All'>[] = [
  'Documents',
  'Tasks & Work Orders',
  'Notifications',
  'Trainings',
  'Assets',
  'Time Series',
  '3D',
  'Action Tracking',
  'ESO',
  'Shift Notes',
];
