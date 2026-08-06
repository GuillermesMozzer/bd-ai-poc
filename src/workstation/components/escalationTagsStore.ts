import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useEffect, useState} from 'react';
import type {ActionCategory, ActionPriority, ActionTrackerItem} from './actionTrackerStore';

export type EscalationTagStatus = 'Open' | 'In Review' | 'Mitigated' | 'Escalated';
export type EscalationTagIcon = 'team' | 'close' | 'tt';

export type EscalationTagHistoryEntry = {
  id: string;
  actor: string;
  detail: string;
  timestamp: string;
  type: 'created' | 'escalated' | 'comment';
};

export type EscalationTag = {
  id: string;
  actionId?: string;
  code: string;
  color: string;
  title: string;
  owner: string;
  date: string;
  level: 'High' | 'Medium' | 'Low';
  levelColor: string;
  icon: EscalationTagIcon;
  fromTier: string;
  currentTier: string;
  status: EscalationTagStatus;
  latestHistory: string;
  history: EscalationTagHistoryEntry[];
};

const escalationTagsStorageKey = 'workstation-escalation-tags-v1';
const escalationTagsChangedEvent = 'workstation-escalation-tags-changed';

const defaultEscalationTags: EscalationTag[] = [
  {id: 'esc-1', code: 'S', color: tokenError.main, title: 'Recurring joint pressure in Packing Area', owner: 'John D.', date: 'May 15', level: 'High', levelColor: tokenError.main, icon: 'team', fromTier: 'Tier 1', currentTier: 'Tier 2', status: 'Open', latestHistory: 'Escalated from Tier 1 due to repeat pressure loss.', history: [{id: 'esc-1-created', actor: 'John D.', detail: 'Escalated from Tier 1 due to repeat pressure loss.', timestamp: 'May 15, 08:12', type: 'created'}]},
  {id: 'esc-2', code: 'Q', color: tokenSuccess.main, title: 'Seal integrity failures above limit', owner: 'Alex C.', date: 'May 16', level: 'High', levelColor: tokenWarning.dark, icon: 'team', fromTier: 'Tier 1', currentTier: 'Tier 3', status: 'In Review', latestHistory: 'Quality review opened with Tier 3 support.', history: [{id: 'esc-2-created', actor: 'Alex C.', detail: 'Quality review opened with Tier 3 support.', timestamp: 'May 16, 10:04', type: 'created'}]},
  {id: 'esc-3', code: 'D', color: tokenWarning.dark, title: 'Late shipments exceeding customer SLA', owner: 'Lisa W.', date: 'May 17', level: 'High', levelColor: tokenError.main, icon: 'team', fromTier: 'Tier 2', currentTier: 'Tier 2', status: 'Open', latestHistory: 'Delivery team is reviewing open customer impact.', history: [{id: 'esc-3-created', actor: 'Lisa W.', detail: 'Delivery team is reviewing open customer impact.', timestamp: 'May 17, 06:48', type: 'created'}]},
  {id: 'esc-4', code: 'C', color: tokenSuccess.main, title: 'Energy consumption above baseline this week', owner: 'Tom K.', date: 'May 18', level: 'Medium', levelColor: tokenWarning.dark, icon: 'tt', fromTier: 'Tier 1', currentTier: 'Tier 2', status: 'Mitigated', latestHistory: 'Mitigation in place and utility load normalized.', history: [{id: 'esc-4-created', actor: 'Tom K.', detail: 'Mitigation in place and utility load normalized.', timestamp: 'May 18, 11:22', type: 'created'}]},
  {id: 'esc-5', code: 'P', color: tokenError.main, title: 'Overtime > 12% for 2 consecutive weeks', owner: 'Sarah M.', date: 'May 20', level: 'Medium', levelColor: tokenWarning.dark, icon: 'team', fromTier: 'Tier 2', currentTier: 'Tier 3', status: 'Escalated', latestHistory: 'People escalation raised for staffing recovery plan.', history: [{id: 'esc-5-created', actor: 'Sarah M.', detail: 'People escalation raised for staffing recovery plan.', timestamp: 'May 20, 09:10', type: 'created'}]},
];

function getCategoryTone(category: ActionCategory) {
  if (category === 'QUALITY') return {code: 'Q', color: tokenSuccess.main};
  if (category === 'SAFETY') return {code: 'S', color: tokenError.main};
  if (category === 'DELIVERY') return {code: 'D', color: tokenWarning.dark};
  if (category === 'COST') return {code: 'C', color: tokenSuccess.main};
  return {code: 'P', color: tokenError.main};
}

function getPriorityColor(priority: ActionPriority) {
  if (priority === 'High') return tokenError.main;
  if (priority === 'Medium') return tokenWarning.dark;
  return tokenSuccess.darker;
}

function formatTagDate(timestamp: string) {
  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime())
    ? timestamp
    : parsed.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

function sanitizeEscalationTag(candidate: unknown): EscalationTag | null {
  if (typeof candidate !== 'object' || candidate === null) return null;
  const row = candidate as Record<string, unknown>;
  if (
    typeof row.id !== 'string'
    || typeof row.code !== 'string'
    || typeof row.color !== 'string'
    || typeof row.title !== 'string'
    || typeof row.owner !== 'string'
    || typeof row.date !== 'string'
    || typeof row.level !== 'string'
    || typeof row.levelColor !== 'string'
    || typeof row.icon !== 'string'
    || typeof row.fromTier !== 'string'
    || typeof row.currentTier !== 'string'
    || typeof row.status !== 'string'
  ) {
    return null;
  }

  const history = Array.isArray(row.history)
    ? row.history.filter((item): item is EscalationTagHistoryEntry => {
      if (typeof item !== 'object' || item === null) return false;
      const entry = item as Record<string, unknown>;
      return typeof entry.id === 'string'
        && typeof entry.actor === 'string'
        && typeof entry.detail === 'string'
        && typeof entry.timestamp === 'string'
        && (entry.type === 'created' || entry.type === 'escalated' || entry.type === 'comment');
    })
    : [];

  return {
    id: row.id,
    actionId: typeof row.actionId === 'string' ? row.actionId : undefined,
    code: row.code,
    color: row.color,
    title: row.title,
    owner: row.owner,
    date: row.date,
    level: (row.level === 'High' || row.level === 'Medium' || row.level === 'Low') ? row.level : 'Medium',
    levelColor: row.levelColor,
    icon: (row.icon === 'close' || row.icon === 'tt' || row.icon === 'team') ? row.icon : 'team',
    fromTier: row.fromTier,
    currentTier: row.currentTier,
    status: (row.status === 'Open' || row.status === 'In Review' || row.status === 'Mitigated' || row.status === 'Escalated') ? row.status : 'Open',
    latestHistory: typeof row.latestHistory === 'string' ? row.latestHistory : history[history.length - 1]?.detail ?? '',
    history,
  };
}

export function readEscalationTags() {
  if (typeof window === 'undefined') return defaultEscalationTags;

  try {
    const raw = window.localStorage.getItem(escalationTagsStorageKey);
    if (!raw) return defaultEscalationTags;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultEscalationTags;
    const sanitized = parsed.map(sanitizeEscalationTag).filter((item): item is EscalationTag => Boolean(item));
    return sanitized.length ? sanitized : defaultEscalationTags;
  } catch {
    return defaultEscalationTags;
  }
}

export function writeEscalationTags(tags: EscalationTag[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(escalationTagsStorageKey, JSON.stringify(tags));
  window.dispatchEvent(new CustomEvent<EscalationTag[]>(escalationTagsChangedEvent, {detail: tags}));
}

function normalizeTier(value: string) {
  return value.startsWith('Tier ') ? value : 'Tier 1';
}

export function addEscalationTagFromAction({
  action,
  actor,
  detail,
  target,
  timestamp,
}: {
  action: ActionTrackerItem;
  actor: string;
  detail: string;
  target: string;
  timestamp: string;
}) {
  const tags = readEscalationTags();
  const categoryTone = getCategoryTone(action.category);
  const nextHistoryEntry: EscalationTagHistoryEntry = {
    id: `esc-history-${Date.now()}`,
    actor,
    detail,
    timestamp,
    type: 'escalated',
  };
  const nextTier = target.startsWith('Tier ') ? target : normalizeTier(action.source);
  const fromTier = normalizeTier(action.source);
  const existingIndex = tags.findIndex((tag) => tag.actionId === action.id);

  if (existingIndex >= 0) {
    const current = tags[existingIndex];
    const updated: EscalationTag = {
      ...current,
      owner: action.assignedTo,
      date: formatTagDate(timestamp),
      level: action.priority,
      levelColor: getPriorityColor(action.priority),
      fromTier,
      currentTier: nextTier,
      status: nextTier === 'Tier 3' ? 'Escalated' : 'In Review',
      latestHistory: detail,
      history: [...current.history, nextHistoryEntry],
    };
    const nextTags = tags.map((tag, index) => index === existingIndex ? updated : tag);
    writeEscalationTags(nextTags);
    return updated;
  }

  const nextTag: EscalationTag = {
    id: `esc-${Date.now()}`,
    actionId: action.id,
    code: categoryTone.code,
    color: categoryTone.color,
    title: action.title,
    owner: action.assignedTo,
    date: formatTagDate(timestamp),
    level: action.priority,
    levelColor: getPriorityColor(action.priority),
    icon: 'team',
    fromTier,
    currentTier: nextTier,
    status: nextTier === 'Tier 3' ? 'Escalated' : 'In Review',
    latestHistory: detail,
    history: [nextHistoryEntry],
  };
  writeEscalationTags([nextTag, ...tags]);
  return nextTag;
}

export function useEscalationTags() {
  const [tags, setTags] = useState<EscalationTag[]>(() => readEscalationTags());

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleChanged = (event: Event) => {
      const nextTags = (event as CustomEvent<EscalationTag[]>).detail;
      setTags(Array.isArray(nextTags) ? nextTags : readEscalationTags());
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === escalationTagsStorageKey) {
        setTags(readEscalationTags());
      }
    };

    window.addEventListener(escalationTagsChangedEvent, handleChanged as EventListener);
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(escalationTagsChangedEvent, handleChanged as EventListener);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return {tags};
}
