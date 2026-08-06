export const publishedWorkstationsStorageKey = 'published-workstations-v1';

import type {PublishedWorkstationSnapshot} from './workstationViewState';
import {readPublishedWorkstationSnapshot} from './workstationViewState';
import {
  buildWorkstationAssignmentFromNodeId,
  buildWorkstationAssignmentFromDraft,
  defaultWorkstationAssignmentDraft,
  formatWorkstationAssignmentSummary,
  getWorkstationAssignmentNodeId,
  type WorkstationAssignment,
} from './workstationAssignment.ts';

export type PublishedWorkstation = {
  assignment: WorkstationAssignment;
  id: string;
  title: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  domains: string[];
  history?: PublishedWorkstationHistoryEntry[];
  widgetCount: number;
  layoutStorageKey: string;
  snapshot: unknown;
  bookmarked: boolean;
  sharedWith: string[];
};

export type PublishedWorkstationHistoryEntry = {
  date: string;
  detail: string;
  label: string;
};

const presetVisibleWidgetIds = [
  'safety',
  'quality',
  'delivery',
  'cost',
  'people',
  'loss-focused-kpis',
  'escalation-tags',
  'communication',
  'recognition',
  'action-tracker',
] as const;

const presetHiddenWidgetIds = [
  'production-planning',
  'shift-oee',
  'shift-schedule',
  'scrap',
  'my-tasks',
  'my-esos',
  'shift-production',
  'machine-utilization',
  'hourly-scrap',
  'downtime',
  'eso',
  'top-losses',
  'zone-performance',
  'tier-management',
] as const;

export const tier1PublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [...presetHiddenWidgetIds],
    layoutSchemaVersion: 17,
    layouts: {
      lg: [
        {i: 'safety', x: 0, y: 0, w: 2, h: 11, minW: 2, minH: 7},
        {i: 'quality', x: 2, y: 0, w: 2, h: 11, minW: 2, minH: 7},
        {i: 'delivery', x: 4, y: 0, w: 2, h: 11, minW: 2, minH: 10},
        {i: 'cost', x: 6, y: 0, w: 2, h: 11, minW: 2, minH: 10},
        {i: 'people', x: 8, y: 0, w: 2, h: 11, minW: 2, minH: 10},
        {i: 'loss-focused-kpis', x: 10, y: 0, w: 2, h: 11, minW: 1, minH: 7},
        {i: 'escalation-tags', x: 0, y: 11, w: 10, h: 5, minW: 8, minH: 4},
        {i: 'communication', x: 10, y: 11, w: 2, h: 5, minW: 2, minH: 4},
        {i: 'action-tracker', x: 0, y: 16, w: 10, h: 10, minW: 8, minH: 9},
        {i: 'recognition', x: 10, y: 16, w: 2, h: 10, minW: 2, minH: 4},
      ],
    },
  },
  widgetPreferences: {
    actionTracker: {viewMode: 'board'},
    cost: {breakdownBy: 'line', showBreakdown: false},
    delivery: {breakdownBy: 'line', showBreakdown: false},
    people: {breakdownBy: 'line', showBreakdown: false},
  },
};

export const tier2PublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [...presetHiddenWidgetIds],
    layoutSchemaVersion: 17,
    layouts: {
      lg: [
        {i: 'safety', x: 0, y: 0, w: 2, h: 11, minW: 2, minH: 7},
        {i: 'quality', x: 2, y: 0, w: 2, h: 11, minW: 2, minH: 7},
        {i: 'delivery', x: 4, y: 0, w: 2, h: 11, minW: 2, minH: 10},
        {i: 'cost', x: 6, y: 0, w: 2, h: 11, minW: 2, minH: 10},
        {i: 'people', x: 8, y: 0, w: 2, h: 11, minW: 2, minH: 10},
        {i: 'loss-focused-kpis', x: 10, y: 0, w: 2, h: 11, minW: 1, minH: 7},
        {i: 'escalation-tags', x: 0, y: 11, w: 10, h: 5, minW: 8, minH: 4},
        {i: 'communication', x: 10, y: 11, w: 2, h: 5, minW: 2, minH: 4},
        {i: 'action-tracker', x: 0, y: 16, w: 10, h: 10, minW: 8, minH: 9},
        {i: 'recognition', x: 10, y: 16, w: 2, h: 6, minW: 2, minH: 4},
      ],
    },
  },
  widgetPreferences: {
    actionTracker: {viewMode: 'table'},
    cost: {breakdownBy: 'line', showBreakdown: false},
    delivery: {breakdownBy: 'line', showBreakdown: false},
    people: {breakdownBy: 'line', showBreakdown: false},
  },
};

export const tier3PublishedSnapshot: PublishedWorkstationSnapshot = {
  layoutState: {
    addedCustomWidgetIds: [],
    customWidgets: [],
    hiddenWidgetIds: [...presetHiddenWidgetIds],
    layoutSchemaVersion: 17,
    layouts: {
      lg: [
        {i: 'safety', x: 0, y: 0, w: 2, h: 11, minW: 2, minH: 7},
        {i: 'quality', x: 2, y: 0, w: 2, h: 11, minW: 2, minH: 7},
        {i: 'delivery', x: 4, y: 0, w: 2, h: 11, minW: 2, minH: 10},
        {i: 'cost', x: 6, y: 0, w: 2, h: 11, minW: 2, minH: 10},
        {i: 'people', x: 8, y: 0, w: 2, h: 11, minW: 2, minH: 10},
        {i: 'loss-focused-kpis', x: 10, y: 0, w: 2, h: 11, minW: 1, minH: 7},
        {i: 'escalation-tags', x: 0, y: 11, w: 10, h: 5, minW: 8, minH: 4},
        {i: 'communication', x: 10, y: 11, w: 2, h: 5, minW: 2, minH: 4},
        {i: 'action-tracker', x: 0, y: 16, w: 10, h: 10, minW: 8, minH: 9},
        {i: 'recognition', x: 10, y: 16, w: 2, h: 6, minW: 2, minH: 4},
      ],
    },
  },
  widgetPreferences: {
    actionTracker: {viewMode: 'table'},
    cost: {breakdownBy: 'line', showBreakdown: false},
    delivery: {breakdownBy: 'line', showBreakdown: false},
    people: {breakdownBy: 'line', showBreakdown: false},
  },
};

const projectPublishedWorkstations: PublishedWorkstation[] = [
  {
    assignment: buildWorkstationAssignmentFromDraft({...defaultWorkstationAssignmentDraft, level: 'line'}),
    id: 'sample-tier-1',
    title: 'Tier 1',
    author: 'BD Excellence',
    createdAt: '2026-05-06T00:00:00.000Z',
    updatedAt: '2026-05-06T00:00:00.000Z',
    domains: ['shopfloor', 'safety', 'quality', 'actions'],
    widgetCount: presetVisibleWidgetIds.length,
    layoutStorageKey: 'workstation-dashboard-layout-v6',
    snapshot: tier1PublishedSnapshot,
    bookmarked: true,
    sharedWith: ['BD Excellence', 'Line 10 Leads', 'Operations Team'],
  },
  {
    assignment: buildWorkstationAssignmentFromDraft({...defaultWorkstationAssignmentDraft, level: 'unit'}),
    id: 'sample-tier-2',
    title: 'Tier 2',
    author: 'BD Excellence',
    createdAt: '2026-05-06T00:00:00.000Z',
    updatedAt: '2026-05-06T00:00:00.000Z',
    domains: ['oee', 'downtime', 'actions', 'quality'],
    widgetCount: presetVisibleWidgetIds.length,
    layoutStorageKey: 'workstation-dashboard-layout-v6',
    snapshot: tier2PublishedSnapshot,
    bookmarked: true,
    sharedWith: ['BD Excellence', 'Area Leaders', 'Maintenance'],
  },
  {
    assignment: buildWorkstationAssignmentFromDraft({...defaultWorkstationAssignmentDraft, level: 'area'}),
    id: 'sample-tier-3',
    title: 'Tier 3',
    author: 'BD Excellence',
    createdAt: '2026-05-06T00:00:00.000Z',
    updatedAt: '2026-05-06T00:00:00.000Z',
    domains: ['operations', 'quality', 'maintenance', 'actions'],
    widgetCount: presetVisibleWidgetIds.length,
    layoutStorageKey: 'workstation-dashboard-layout-v6',
    snapshot: tier3PublishedSnapshot,
    bookmarked: true,
    sharedWith: ['BD Excellence', 'Site Leadership', 'Quality Team'],
  },
];

export function createPublishedWorkstationHistoryEntry(
  label: string,
  detail: string,
  date: string,
): PublishedWorkstationHistoryEntry {
  return {date, detail, label};
}

function normalizeWorkstationIdentifier(value: string) {
  return value.trim().toLowerCase();
}

function getDefaultSnapshotByIdentifier(identifier: string) {
  const normalized = normalizeWorkstationIdentifier(identifier);

  if (normalized === 'sample-tier-1' || normalized === 'tier 1') return tier1PublishedSnapshot;
  if (normalized === 'sample-tier-2' || normalized === 'tier 2') return tier2PublishedSnapshot;
  if (normalized === 'sample-tier-3' || normalized === 'tier 3') return tier3PublishedSnapshot;
  return null;
}

export function getPresetSnapshotForWorkstationTitle(title: string) {
  return getDefaultSnapshotByIdentifier(title);
}

function getPresetSnapshotForWorkstation(workstation: Pick<PublishedWorkstation, 'id' | 'title'>) {
  return getDefaultSnapshotByIdentifier(workstation.id) ?? getDefaultSnapshotByIdentifier(workstation.title);
}

function withDefaultSnapshot(workstation: PublishedWorkstation): PublishedWorkstation {
  const presetSnapshot = getPresetSnapshotForWorkstation(workstation);
  if (workstation.snapshot || !presetSnapshot) {
    return workstation;
  }

  return {
    ...workstation,
    snapshot: presetSnapshot,
    widgetCount: presetVisibleWidgetIds.length,
  };
}

function withDefaultHistory(workstation: PublishedWorkstation): PublishedWorkstation {
  if (Array.isArray(workstation.history) && workstation.history.length > 0) {
    return workstation;
  }

  const owner = workstation.author.trim() || 'Workstations Library';
  const assignmentSummary = formatWorkstationAssignmentSummary(workstation.assignment);
  const history = [
    createPublishedWorkstationHistoryEntry('Created', `${owner} created this workstation.`, workstation.createdAt),
    createPublishedWorkstationHistoryEntry('Published', `Assigned to ${assignmentSummary}.`, workstation.updatedAt),
  ];

  if (workstation.updatedAt !== workstation.createdAt) {
    history.push(
      createPublishedWorkstationHistoryEntry(
        'Last update',
        `${workstation.widgetCount} widgets currently enabled in this workstation.`,
        workstation.updatedAt,
      ),
    );
  }

  return {
    ...workstation,
    history,
  };
}

function withNormalizedGeneratedTitle(workstation: PublishedWorkstation): PublishedWorkstation {
  const assignmentSummary = formatWorkstationAssignmentSummary(workstation.assignment);
  const generatedSuffixes = [
    ` • ${assignmentSummary}`,
    ` â€¢ ${assignmentSummary}`,
    ` - ${assignmentSummary}`,
  ];

  const normalizedTitle = generatedSuffixes.reduce((currentTitle, suffix) => (
    currentTitle.endsWith(suffix) ? currentTitle.slice(0, -suffix.length).trim() : currentTitle
  ), workstation.title);

  return normalizedTitle === workstation.title
    ? workstation
    : {...workstation, title: normalizedTitle};
}

function withDefaultAssignment(workstation: Omit<PublishedWorkstation, 'assignment'> & {assignment?: WorkstationAssignment}): PublishedWorkstation {
  const fallbackAssignment = buildWorkstationAssignmentFromDraft(defaultWorkstationAssignmentDraft);
  const normalizedAssignment = workstation.assignment
    ? buildWorkstationAssignmentFromNodeId(getWorkstationAssignmentNodeId(workstation.assignment)) ?? workstation.assignment
    : fallbackAssignment;

  return {
    ...workstation,
    assignment: normalizedAssignment,
  };
}

export function readPublishedWorkstations(): PublishedWorkstation[] {
  if (typeof window === 'undefined') {
    return projectPublishedWorkstations.map((item) => withNormalizedGeneratedTitle(withDefaultHistory(withDefaultSnapshot(withDefaultAssignment(item)))));
  }

  try {
    const raw = window.localStorage.getItem(publishedWorkstationsStorageKey);
    if (!raw) return projectPublishedWorkstations.map((item) => withNormalizedGeneratedTitle(withDefaultHistory(withDefaultSnapshot(withDefaultAssignment(item)))));
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.map((item) => withNormalizedGeneratedTitle(withDefaultHistory(withDefaultSnapshot(withDefaultAssignment(item as PublishedWorkstation)))))
      : [];
  } catch {
    return projectPublishedWorkstations.map((item) => withNormalizedGeneratedTitle(withDefaultHistory(withDefaultSnapshot(withDefaultAssignment(item)))));
  }
}

export function writePublishedWorkstations(workstations: PublishedWorkstation[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(publishedWorkstationsStorageKey, JSON.stringify(workstations));
}

export function publishCurrentWorkstation({
  assignment,
  author,
  domains = ['shopfloor', 'oee', 'quality', 'actions'],
  layoutStorageKey,
  replaceId,
  title,
}: {
  assignment: WorkstationAssignment;
  author: string;
  domains?: string[];
  layoutStorageKey: string;
  replaceId?: string;
  title: string;
}) {
  const now = new Date().toISOString();
  const existing = readPublishedWorkstations();
  const previousWorkstation = replaceId ? existing.find((workstation) => workstation.id === replaceId) : null;
  const snapshot = readPublishedWorkstationSnapshot(layoutStorageKey);

  const layoutState = typeof snapshot === 'object' && snapshot && 'layoutState' in snapshot
    ? snapshot.layoutState
    : null;
  const hiddenWidgetIds = typeof layoutState === 'object' && layoutState && 'hiddenWidgetIds' in layoutState && Array.isArray((layoutState as {hiddenWidgetIds?: unknown}).hiddenWidgetIds)
    ? (layoutState as {hiddenWidgetIds: string[]}).hiddenWidgetIds
    : [];
  const widgetCount = Math.max(0, 16 - hiddenWidgetIds.length);
  const nextAssignmentSummary = formatWorkstationAssignmentSummary(assignment);
  const previousAssignmentSummary = previousWorkstation
    ? formatWorkstationAssignmentSummary(previousWorkstation.assignment)
    : null;
  const history = previousWorkstation?.history ? [...previousWorkstation.history] : [
    createPublishedWorkstationHistoryEntry('Created', `${author.trim() || 'Anonymous'} created this workstation.`, previousWorkstation?.createdAt ?? now),
  ];

  if (!previousWorkstation) {
    history.push(createPublishedWorkstationHistoryEntry('Published', `Assigned to ${nextAssignmentSummary}.`, now));
  } else if (previousAssignmentSummary !== nextAssignmentSummary) {
    history.push(createPublishedWorkstationHistoryEntry('Destination updated', `Reassigned from ${previousAssignmentSummary} to ${nextAssignmentSummary}.`, now));
  }

  const workstation: PublishedWorkstation = {
    assignment,
    id: replaceId ?? `ws-${Date.now()}`,
    title: title.trim() || 'Untitled page (workstation)',
    author: author.trim() || 'Anonymous',
    createdAt: previousWorkstation?.createdAt ?? now,
    updatedAt: now,
    domains,
    history,
    widgetCount,
    layoutStorageKey,
    snapshot,
    bookmarked: previousWorkstation?.bookmarked ?? false,
    sharedWith: previousWorkstation?.sharedWith ?? ['Line 10 Leads'],
  };

  writePublishedWorkstations(replaceId
    ? existing.map((item) => (item.id === replaceId ? workstation : item))
    : [workstation, ...existing]);
  return workstation;
}
