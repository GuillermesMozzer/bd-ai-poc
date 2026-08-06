import { SmartSearchCategory } from '../types';
import {
  EntityEdge,
  EntityNode,
  SMART_SEARCH_SOURCE_CATEGORIES,
  ScoredItem,
  SmartSearchCatalogItem,
  SmartSearchEngineResult,
  SmartSearchEngineSummary,
  SmartSearchExperienceMode,
  SmartSearchFilters,
  SmartSearchIntent,
} from './types';
import { getGlobalSearchCatalog } from './globalCatalog';

const CATEGORY_LIST = SMART_SEARCH_SOURCE_CATEGORIES;

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokenize(query: string): string[] {
  return normalize(query).split(' ').filter((token) => token.length > 1);
}

export function buildSearchIndex(
  mode: SmartSearchExperienceMode,
  currentUserName: string,
  siteDataMap?: Record<Exclude<SmartSearchCategory, 'All'>, SmartSearchCatalogItem[]>,
): SmartSearchCatalogItem[] {
  const globalCatalog = getGlobalSearchCatalog(currentUserName);
  if (mode === 'default' || !siteDataMap) {
    return Object.values(globalCatalog).flat();
  }
  const merged = new Map<string, SmartSearchCatalogItem>();
  Object.values(globalCatalog).flat().forEach((item) => merged.set(item.id, item));
  Object.values(siteDataMap).flat().forEach((item) => merged.set(item.id, item as SmartSearchCatalogItem));
  return Array.from(merged.values());
}

export function detectIntent(query: string): SmartSearchIntent {
  const n = normalize(query);
  if (/\b(training|learning|course|certification|compliance)\b/.test(n)) return 'training';
  if (/\b(document|manual|sop|guide|procedure|pdf)\b/.test(n)) return 'documents';
  if (/\b(site|footprint|overview|portfolio|product famil)\b/.test(n)) return 'site_overview';
  if (/\b(who is working|crew|staff|shift coverage|operator)\b/.test(n)) return 'workforce';
  if (/\b(bearing|vibration|failure|maintenance|anomaly|critical|trend|downtime|oee)\b/.test(n)) return 'reliability';
  return 'general';
}

function extractEntities(tokens: string[], items: SmartSearchCatalogItem[]): Set<string> {
  const entities = new Set<string>();
  tokens.forEach((token) => entities.add(token));
  items.forEach((item) => {
    (item.entityTags ?? []).forEach((tag) => {
      if (tokens.some((t) => tag.includes(t) || t.includes(tag.replace(/-/g, ' ')))) {
        entities.add(tag);
      }
    });
  });
  return entities;
}

function scoreItem(
  item: SmartSearchCatalogItem,
  tokens: string[],
  entities: Set<string>,
  scopeAliases: string[],
): { score: number; matchedTerms: string[] } {
  if (!tokens.length) return { score: 1, matchedTerms: [] };

  const title = normalize(item.title);
  const subtitle = normalize(item.subtitle);
  const summary = normalize(item.summary);
  const keywords = (item.keywords ?? []).map(normalize);
  const tags = (item.entityTags ?? []).map(normalize);
  const itemDetail = item.detail as { folderPath?: string[] } | undefined;
  const folderPath = Array.isArray(itemDetail?.folderPath)
    ? itemDetail.folderPath.join(' ').toLowerCase()
    : '';
  const haystack = `${title} ${subtitle} ${summary} ${keywords.join(' ')} ${tags.join(' ')} ${folderPath} ${normalize(item.location)} ${normalize(item.plant)}`;

  let score = 0;
  const matchedTerms: string[] = [];

  tokens.forEach((token) => {
    if (title.includes(token)) {
      score += 3;
      matchedTerms.push(token);
    } else if (keywords.some((kw) => kw.includes(token))) {
      score += 2;
      matchedTerms.push(token);
    } else if (subtitle.includes(token) || summary.includes(token)) {
      score += 1;
      matchedTerms.push(token);
    } else if (haystack.includes(token)) {
      score += 0.5;
      matchedTerms.push(token);
    }
  });

  (item.entityTags ?? []).forEach((tag) => {
    if (entities.has(tag)) score += 1.5;
  });

  if (scopeAliases.length) {
    const scopeMatch = scopeAliases.some((alias) => haystack.includes(alias));
    if (scopeMatch) score += 2;
  }

  if (item.status?.toLowerCase().includes('critical') || item.status?.toLowerCase().includes('overdue')) {
    score += 0.3;
  }

  return { score, matchedTerms: Array.from(new Set(matchedTerms)) };
}

function matchesFilters(item: SmartSearchCatalogItem, filters: SmartSearchFilters): boolean {
  if (filters.type !== 'All Types' && filters.type !== item.category) return false;
  if (filters.location !== 'All Locations' && !item.location.toLowerCase().includes(filters.location.toLowerCase())) {
    return false;
  }
  if (
    filters.plant !== 'All Plants/Cell/Line'
    && !`${item.location} ${item.plant}`.toLowerCase().includes(filters.plant.toLowerCase())
  ) {
    return false;
  }
  return true;
}

function buildEntityGraph(
  topItems: ScoredItem[],
  allItems: SmartSearchCatalogItem[],
): { nodes: EntityNode[]; edges: EntityEdge[] } {
  const itemMap = new Map(allItems.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const chainItems: SmartSearchCatalogItem[] = [];

  topItems.slice(0, 3).forEach((item) => {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      chainItems.push(item);
    }
    (item.relatedIds ?? []).forEach((relatedId) => {
      const related = itemMap.get(relatedId);
      if (related && !seen.has(related.id) && chainItems.length < 7) {
        seen.add(related.id);
        chainItems.push(related);
      }
    });
  });

  const nodes: EntityNode[] = chainItems.slice(0, 7).map((item) => ({
    id: `node-${item.id}`,
    itemId: item.id,
    label: item.title.length > 42 ? `${item.title.slice(0, 40)}…` : item.title,
    category: item.category,
    kind: item.kind,
    tone: item.tone,
  }));

  const edges: EntityEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i += 1) {
    edges.push({ from: nodes[i].id, to: nodes[i + 1].id, label: 'linked to' });
  }

  return { nodes, edges };
}

function buildSummary(
  intent: SmartSearchIntent,
  query: string,
  ranked: ScoredItem[],
  stats: SmartSearchEngineResult['stats'],
): SmartSearchEngineSummary {
  const top = ranked[0];
  const second = ranked[1];
  const third = ranked[2];
  const total = stats.totalMatches;
  const categories = stats.topCategories.slice(0, 3).map((c) => c.category).join(', ');

  let text: string;
  if (!total || !top) {
    text = 'Smart Search did not find strong matches for this query. Try broader terms, an asset ID, work order number, or document title.';
  } else if (intent === 'reliability' && top.kind === 'timeSeries') {
    text = `Found ${total} connected records across ${categories || 'operational sources'}. The strongest signal is ${top.title} at ${top.metric}, linked to ${second?.title ?? 'related work orders'}${third ? ` and ${third.title}` : ''}. BLU.AI recommends reviewing the trend before the next shift handoff.`;
  } else if (intent === 'training') {
    text = `Found ${total} enablement records across ${categories || 'training and documents'}. ${top.title} is the best starting point${second ? `, with ${second.title} as a supporting resource` : ''}. Prioritize completion before the next operating window.`;
  } else if (intent === 'documents') {
    text = `Found ${total} document matches. ${top.title} has the highest relevance${top.metric ? ` with ${top.metric}` : ''}${second ? `. Also review ${second.title} for related procedures` : ''}.`;
  } else if (intent === 'site_overview') {
    text = `Smart Search assembled ${total} site-context records across ${categories || 'multiple sources'}. ${top.title} provides the best entry point for orientation before drilling into tasks and live signals.`;
  } else {
    text = `Found ${total} connected records across ${categories || 'documents, workflows, and live streams'}. The top match is ${top.title}${top.metric ? ` (${top.metric})` : ''}${second ? `, followed by ${second.title}` : ''}. Use the evidence chain below to navigate related sources.`;
  }

  const findings = [
    {
      label: 'Connected sources',
      value: String(total),
      tone: '#044ED7',
    },
    {
      label: 'Top match',
      value: top?.metric?.split(' ')[0] ?? top?.status ?? '—',
      tone: top?.tone ?? '#FF6E00',
    },
    {
      label: 'Categories',
      value: String(stats.topCategories.length),
      tone: '#0ea5e9',
    },
    {
      label: 'Index coverage',
      value: `${stats.totalIndexed}`,
      tone: '#0f766e',
    },
  ];

  const followUps = intent === 'reliability'
    ? [
        'How do I check if a bearing is going bad?',
        'When should I call maintenance vs. my supervisor?',
        'Show related work orders and shift notes',
      ]
    : intent === 'training'
      ? [
          'Show me the shortest training',
          'What should operators inspect first?',
          'What document should I open before maintenance arrives?',
        ]
      : intent === 'documents'
        ? [
            'Summarize the most relevant sections',
            'Show related work orders',
            'What actions are blocked by this document?',
          ]
        : [
            'Narrow this to assets',
            'Show related work orders',
            `Summarize the most important result for "${query.slice(0, 40)}"`,
          ];

  const actions: SmartSearchEngineSummary['actions'] = [
    { label: 'Open top result', accent: '#044ED7', itemId: top?.id },
    { label: 'Review evidence chain', accent: '#0f766e', itemId: second?.id },
    { label: 'Continue with BLU.AI', accent: '#1D74FF' },
  ];

  return { text, findings, followUps, actions };
}

export function runSmartSearchEngine(
  query: string,
  index: SmartSearchCatalogItem[],
  options: {
    filters?: SmartSearchFilters;
    scopeAliases?: string[];
    mode?: SmartSearchExperienceMode;
    showAllOnEmpty?: boolean;
  } = {},
): SmartSearchEngineResult {
  const filters = options.filters ?? {
    type: 'All Types',
    location: 'All Locations',
    plant: 'All Plants/Cell/Line',
    date: 'Any time',
  };
  const scopeAliases = (options.scopeAliases ?? []).map((a) => a.toLowerCase());
  const tokens = tokenize(query);
  const intent = detectIntent(query);
  const showAll = options.showAllOnEmpty && !tokens.length;

  const entities = extractEntities(tokens, index);

  const scored: ScoredItem[] = index
    .map((item) => {
      const { score, matchedTerms } = showAll
        ? { score: 1, matchedTerms: [] as string[] }
        : scoreItem(item, tokens, entities, scopeAliases);
      return { ...item, score, matchedTerms };
    })
    .filter((item) => (showAll ? true : item.score > 0))
    .filter((item) => matchesFilters(item, filters))
    .sort((a, b) => b.score - a.score);

  const categoryBuckets = CATEGORY_LIST.reduce(
    (acc, category) => {
      acc[category] = scored.filter((item) => item.category === category);
      return acc;
    },
    {} as Record<Exclude<SmartSearchCategory, 'All'>, ScoredItem[]>,
  );

  const topCategories = CATEGORY_LIST
    .map((category) => ({ category, count: categoryBuckets[category].length }))
    .filter((entry) => entry.count > 0)
    .sort((a, b) => b.count - a.count);

  const stats = {
    sourcesSearched: CATEGORY_LIST.length,
    totalMatches: scored.length,
    totalIndexed: index.length,
    topCategories,
  };

  const entityGraph = buildEntityGraph(scored, index);
  const summary = buildSummary(intent, query, scored, stats);

  return {
    intent,
    rankedResults: scored,
    categoryBuckets,
    entityGraph,
    summary,
    stats,
  };
}

export function getItemsByIds(index: SmartSearchCatalogItem[], ids: string[]): SmartSearchCatalogItem[] {
  const map = new Map(index.map((item) => [item.id, item]));
  return ids.map((id) => map.get(id)).filter(Boolean) as SmartSearchCatalogItem[];
}

export function getRelatedItems(item: SmartSearchCatalogItem, index: SmartSearchCatalogItem[]): SmartSearchCatalogItem[] {
  const relatedIds = item.relatedIds ?? [];
  return getItemsByIds(index, relatedIds);
}
