import {useEffect, useMemo, useState} from 'react';
import {actionTrackerKanbanColumns, actionTrackerTableColumns} from '../../actionTracker/config';
import {getAvailableLaneComponentIds} from '../laneComponents';
import type {
  TierMeetingBoardState,
  TierMeetingLaneComponentId,
  TierMeetingLaneId,
  TierMeetingLanePosition,
  TierMeetingLaneSettings,
  TierMeetingLaneSpan,
  TierMeetingLaneStatus,
  TierMeetingPillar,
} from '../types';

const storageKey = 'bd-ai-poc.tier-meeting-board-layout.v6';
const gridColumnCount = 60;
const minRegularLaneSpan = 10;
const minActionTrackerLaneSpan = 24;
const defaultLaneHeight = 620;
const minLaneHeight = 420;
const maxLaneHeight = 1200;
const actionTrackerLaneId: TierMeetingLaneId = 'actionTracker';
const defaultVisibleLaneIds: TierMeetingLaneId[] = ['safety', 'quality', 'delivery', 'cost', 'people', 'custom', 'actionTracker'];
const defaultLaneOrder: TierMeetingLaneId[] = ['safety', 'quality', 'delivery', 'cost', 'people', 'custom', 'actionTracker'];
const defaultLaneSpans: Record<TierMeetingLaneId, TierMeetingLaneSpan> = {
  safety: 10,
  quality: 10,
  delivery: 10,
  cost: 10,
  people: 10,
  custom: 10,
  actionTracker: 50,
};
const defaultLaneHeights: Record<TierMeetingLaneId, number> = {
  safety: 620,
  quality: 620,
  delivery: 620,
  cost: 620,
  people: 620,
  custom: 1080,
  actionTracker: 430,
};
const defaultLanePositions: Record<TierMeetingLaneId, TierMeetingLanePosition> = {
  safety: {columnStart: 1, rowStart: 1},
  quality: {columnStart: 11, rowStart: 1},
  delivery: {columnStart: 21, rowStart: 1},
  cost: {columnStart: 31, rowStart: 1},
  people: {columnStart: 41, rowStart: 1},
  custom: {columnStart: 51, rowStart: 1},
  actionTracker: {columnStart: 1, rowStart: 17},
};

const defaultActionTrackerSettings: TierMeetingLaneSettings = {
  visibleComponentIds: [],
  visibleKpiIds: [],
  visibleGraphicCardIds: [],
  componentOrder: ['aiInsights', 'kpis', 'quickLinks'],
  kpiOrder: [],
  graphicCardOrder: [],
  visibleTableColumnIds: actionTrackerTableColumns.map((column) => column.id),
  visibleKanbanColumnIds: actionTrackerKanbanColumns.map((column) => column.id),
};

type PersistedBoardState = Partial<Pick<TierMeetingBoardState, 'visibleLaneIds' | 'laneOrder' | 'laneSpans' | 'laneHeights' | 'lanePositions' | 'laneStatuses' | 'laneTitles' | 'laneSettings' | 'expandedLaneSettings'>>;

function createDefaultSettings(pillars: TierMeetingPillar[]): Record<TierMeetingLaneId, TierMeetingLaneSettings> {
  return pillars.reduce<Record<TierMeetingLaneId, TierMeetingLaneSettings>>((accumulator, pillar) => {
    let laneDefaultComponentOrder: TierMeetingLaneComponentId[] = getAvailableLaneComponentIds(pillar);
    if (pillar.id === 'safety') laneDefaultComponentOrder = ['dailyTracker', 'kpis', 'additionalCards'];
    if (pillar.id === 'quality') laneDefaultComponentOrder = ['dailyTracker', 'kpis', 'additionalCards'];
    if (pillar.id === 'delivery') laneDefaultComponentOrder = ['productInfo', 'oeeCard', 'graphsCharts'];
    if (pillar.id === 'cost') laneDefaultComponentOrder = ['kpis', 'graphsCharts'];
    if (pillar.id === 'people') laneDefaultComponentOrder = ['graphsCharts'];
    if (pillar.id === 'custom') laneDefaultComponentOrder = ['kpis', 'recognition', 'communications'];

    accumulator[pillar.id] = {
      visibleComponentIds: [...laneDefaultComponentOrder],
      visibleKpiIds: pillar.kpis.map((kpi) => kpi.id),
      visibleGraphicCardIds: pillar.graphicCards?.map((card) => card.id) ?? [],
      componentOrder: [...laneDefaultComponentOrder],
      kpiOrder: pillar.kpis.map((kpi) => kpi.id),
      graphicCardOrder: pillar.graphicCards?.map((card) => card.id) ?? [],
    };
    return accumulator;
  }, {} as Record<TierMeetingLaneId, TierMeetingLaneSettings>);
}

function normalizeLaneIds(input: TierMeetingLaneId[] | undefined, availableLaneIds: TierMeetingLaneId[], fallback: TierMeetingLaneId[]) {
  const valid = (input ?? []).filter((laneId, index, array) => availableLaneIds.includes(laneId) && array.indexOf(laneId) === index);
  return valid.length ? valid : fallback.filter((laneId) => availableLaneIds.includes(laneId));
}

function normalizeLaneOrder(input: TierMeetingLaneId[] | undefined, availableLaneIds: TierMeetingLaneId[]) {
  const seen = new Set<TierMeetingLaneId>();
  const ordered = (input ?? [])
    .filter((laneId) => availableLaneIds.includes(laneId))
    .filter((laneId) => {
      if (seen.has(laneId)) return false;
      seen.add(laneId);
      return true;
    });

  availableLaneIds.forEach((laneId) => {
    if (!seen.has(laneId)) {
      ordered.push(laneId);
    }
  });

  return ordered;
}

function getReferenceLaneOrder(availableLaneIds: TierMeetingLaneId[]) {
  return defaultLaneOrder.filter((laneId) => availableLaneIds.includes(laneId));
}

function getMinLaneSpan(laneId?: TierMeetingLaneId) {
  return laneId === actionTrackerLaneId ? minActionTrackerLaneSpan : minRegularLaneSpan;
}

function clampLaneSpan(value: number | undefined, laneId?: TierMeetingLaneId) {
  if (!value || Number.isNaN(value)) return laneId === actionTrackerLaneId ? minActionTrackerLaneSpan : minRegularLaneSpan;
  return Math.min(gridColumnCount, Math.max(getMinLaneSpan(laneId), Math.round(value)));
}

function normalizeLaneSpans(
  input: Record<TierMeetingLaneId, TierMeetingLaneSpan> | undefined,
  availableLaneIds: TierMeetingLaneId[],
) {
  return availableLaneIds.reduce<Record<TierMeetingLaneId, TierMeetingLaneSpan>>((accumulator, laneId) => {
    accumulator[laneId] = clampLaneSpan(input?.[laneId] ?? defaultLaneSpans[laneId], laneId);
    return accumulator;
  }, {} as Record<TierMeetingLaneId, TierMeetingLaneSpan>);
}

function clampLaneHeight(value: number | undefined) {
  if (!value || Number.isNaN(value)) return defaultLaneHeight;
  return Math.min(maxLaneHeight, Math.max(minLaneHeight, Math.round(value)));
}

function normalizeLaneHeights(
  input: Record<TierMeetingLaneId, number> | undefined,
  availableLaneIds: TierMeetingLaneId[],
) {
  return availableLaneIds.reduce<Record<TierMeetingLaneId, number>>((accumulator, laneId) => {
    accumulator[laneId] = clampLaneHeight(input?.[laneId] ?? defaultLaneHeights[laneId]);
    return accumulator;
  }, {} as Record<TierMeetingLaneId, number>);
}

function getLaneRowSpan(height: number) {
  return Math.max(1, Math.ceil((height + 16) / (24 + 16)));
}

function buildDefaultLanePositions(
  availableLaneIds: TierMeetingLaneId[],
  laneOrder: TierMeetingLaneId[],
  laneSpans: Record<TierMeetingLaneId, TierMeetingLaneSpan>,
  laneHeights: Record<TierMeetingLaneId, number>,
) {
  const referenceOrder = getReferenceLaneOrder(availableLaneIds);
  const hasReferenceCoverage = referenceOrder.every((laneId) => laneOrder.includes(laneId));
  if (hasReferenceCoverage) {
    return availableLaneIds.reduce<Record<TierMeetingLaneId, TierMeetingLanePosition>>((accumulator, laneId) => {
      accumulator[laneId] = defaultLanePositions[laneId] ?? {columnStart: 1, rowStart: 1};
      return accumulator;
    }, {} as Record<TierMeetingLaneId, TierMeetingLanePosition>);
  }

  const positions = {} as Record<TierMeetingLaneId, TierMeetingLanePosition>;
  let currentColumn = 1;
  let currentRow = 1;
  let rowDepth = 0;

  laneOrder.filter((laneId) => availableLaneIds.includes(laneId)).forEach((laneId) => {
    const span = laneSpans[laneId];
    const rowSpan = getLaneRowSpan(laneHeights[laneId]);

    if (currentColumn + span - 1 > gridColumnCount) {
      currentRow += rowDepth;
      currentColumn = 1;
      rowDepth = 0;
    }

    positions[laneId] = {
      columnStart: currentColumn,
      rowStart: currentRow,
    };

    currentColumn += span;
    rowDepth = Math.max(rowDepth, rowSpan);
  });

  return positions;
}

function normalizeLanePositions(
  input: Record<TierMeetingLaneId, TierMeetingLanePosition> | undefined,
  availableLaneIds: TierMeetingLaneId[],
  laneOrder: TierMeetingLaneId[],
  laneSpans: Record<TierMeetingLaneId, TierMeetingLaneSpan>,
  laneHeights: Record<TierMeetingLaneId, number>,
) {
  const defaults = buildDefaultLanePositions(availableLaneIds, laneOrder, laneSpans, laneHeights);
  const resolved = {} as Record<TierMeetingLaneId, TierMeetingLanePosition>;
  const placedLanes: Array<{
    laneId: TierMeetingLaneId;
    columnStart: number;
    columnEnd: number;
    rowStart: number;
    rowEnd: number;
  }> = [];

  laneOrder.filter((laneId) => availableLaneIds.includes(laneId)).forEach((laneId) => {
    const fallback = defaults[laneId];
    const span = laneSpans[laneId];
    const rowSpan = getLaneRowSpan(laneHeights[laneId]);
    const columnStart = Math.max(1, Math.min(gridColumnCount - span + 1, Math.round(input?.[laneId]?.columnStart ?? fallback.columnStart)));
    let rowStart = Math.max(1, Math.round(input?.[laneId]?.rowStart ?? fallback.rowStart));

    while (placedLanes.some((placedLane) => {
      const columnEnd = columnStart + span - 1;
      const rowEnd = rowStart + rowSpan - 1;
      const columnsOverlap = columnStart <= placedLane.columnEnd && columnEnd >= placedLane.columnStart;
      const rowsOverlap = rowStart <= placedLane.rowEnd && rowEnd >= placedLane.rowStart;
      return columnsOverlap && rowsOverlap;
    })) {
      rowStart += 1;
    }

    const columnEnd = columnStart + span - 1;
    const rowEnd = rowStart + rowSpan - 1;
    resolved[laneId] = {columnStart, rowStart};
    placedLanes.push({
      laneId,
      columnStart,
      columnEnd,
      rowStart,
      rowEnd,
    });
  });

  return availableLaneIds.reduce<Record<TierMeetingLaneId, TierMeetingLanePosition>>((accumulator, laneId) => {
    accumulator[laneId] = resolved[laneId] ?? defaults[laneId];
    return accumulator;
  }, {} as Record<TierMeetingLaneId, TierMeetingLanePosition>);
}

function normalizeLaneStatuses(
  input: Partial<Record<TierMeetingLaneId, TierMeetingLaneStatus>> | undefined,
  pillars: TierMeetingPillar[],
) {
  return pillars.reduce<Partial<Record<TierMeetingLaneId, TierMeetingLaneStatus>>>((accumulator, pillar) => {
    accumulator[pillar.id] = input?.[pillar.id] ?? pillar.status;
    return accumulator;
  }, {});
}

function normalizeLaneTitles(
  input: Partial<Record<TierMeetingLaneId, string>> | undefined,
  pillars: TierMeetingPillar[],
) {
  return pillars.reduce<Partial<Record<TierMeetingLaneId, string>>>((accumulator, pillar) => {
    const sanitizedTitle = input?.[pillar.id]?.trim();
    accumulator[pillar.id] = sanitizedTitle ?? pillar.title;
    return accumulator;
  }, {});
}

function normalizeLaneSettings(
  input: Partial<Record<TierMeetingLaneId, TierMeetingLaneSettings>> | undefined,
  pillars: TierMeetingPillar[],
) {
  const defaults = createDefaultSettings(pillars);
  const normalized = pillars.reduce<Partial<Record<TierMeetingLaneId, TierMeetingLaneSettings>>>((accumulator, pillar) => {
    const nextSettings = input?.[pillar.id];
    const availableKpiIds = pillar.kpis.map((kpi) => kpi.id);
    const availableGraphicCardIds = pillar.graphicCards?.map((card) => card.id) ?? [];
    const availableComponentIds = getAvailableLaneComponentIds(pillar);
    const visibleKpiIds = nextSettings?.visibleKpiIds?.filter((kpiId) => availableKpiIds.includes(kpiId));
    const visibleGraphicCardIds = nextSettings?.visibleGraphicCardIds?.filter((cardId) => availableGraphicCardIds.includes(cardId));
    const visibleComponentIds = nextSettings?.visibleComponentIds?.filter((componentId) => availableComponentIds.includes(componentId));
    const orderedKpiIds = nextSettings?.kpiOrder?.filter((kpiId) => availableKpiIds.includes(kpiId));
    const orderedGraphicCardIds = nextSettings?.graphicCardOrder?.filter((cardId) => availableGraphicCardIds.includes(cardId));
    const orderedComponentIds = nextSettings?.componentOrder?.filter((componentId) => availableComponentIds.includes(componentId));
    const kpiOrder = orderedKpiIds?.length
      ? [...orderedKpiIds, ...availableKpiIds.filter((kpiId) => !orderedKpiIds.includes(kpiId))]
      : defaults[pillar.id].kpiOrder;
    const graphicCardOrder = orderedGraphicCardIds?.length
      ? [...orderedGraphicCardIds, ...availableGraphicCardIds.filter((cardId) => !orderedGraphicCardIds.includes(cardId))]
      : defaults[pillar.id].graphicCardOrder;
    const componentOrder = orderedComponentIds?.length
      ? [...orderedComponentIds, ...availableComponentIds.filter((componentId) => !orderedComponentIds.includes(componentId))]
      : defaults[pillar.id].componentOrder;
    const shouldResetGraphicVisibility =
      Boolean(nextSettings?.visibleGraphicCardIds?.length)
      && availableGraphicCardIds.length > 0
      && (visibleGraphicCardIds?.length ?? 0) === 0;

    accumulator[pillar.id] = {
      visibleComponentIds: visibleComponentIds?.length ? visibleComponentIds : defaults[pillar.id].visibleComponentIds,
      visibleKpiIds: visibleKpiIds?.length ? visibleKpiIds : defaults[pillar.id].visibleKpiIds,
      visibleGraphicCardIds: shouldResetGraphicVisibility
        ? defaults[pillar.id].visibleGraphicCardIds
        : (visibleGraphicCardIds ?? defaults[pillar.id].visibleGraphicCardIds),
      componentOrder,
      kpiOrder,
      graphicCardOrder,
    };
    return accumulator;
  }, {});

  const nextActionTrackerSettings = input?.[actionTrackerLaneId];
  const availableComponentIds = defaultActionTrackerSettings.componentOrder;
  const visibleComponentIds = nextActionTrackerSettings?.visibleComponentIds?.filter((componentId) => availableComponentIds.includes(componentId));
  const orderedComponentIds = nextActionTrackerSettings?.componentOrder?.filter((componentId) => availableComponentIds.includes(componentId));
  const availableTableColumnIds = actionTrackerTableColumns.map((column) => column.id);
  const availableKanbanColumnIds = actionTrackerKanbanColumns.map((column) => column.id);
  const visibleTableColumnIds = nextActionTrackerSettings?.visibleTableColumnIds?.filter((columnId) => availableTableColumnIds.includes(columnId));
  const visibleKanbanColumnIds = nextActionTrackerSettings?.visibleKanbanColumnIds?.filter((columnId) => availableKanbanColumnIds.includes(columnId));

  normalized[actionTrackerLaneId] = {
    visibleComponentIds: visibleComponentIds ?? defaultActionTrackerSettings.visibleComponentIds,
    visibleKpiIds: [],
    visibleGraphicCardIds: [],
    componentOrder: orderedComponentIds?.length
      ? [...orderedComponentIds, ...availableComponentIds.filter((componentId) => !orderedComponentIds.includes(componentId))]
      : defaultActionTrackerSettings.componentOrder,
    kpiOrder: [],
    graphicCardOrder: [],
    visibleTableColumnIds: visibleTableColumnIds?.length ? visibleTableColumnIds : defaultActionTrackerSettings.visibleTableColumnIds,
    visibleKanbanColumnIds: visibleKanbanColumnIds?.length ? visibleKanbanColumnIds : defaultActionTrackerSettings.visibleKanbanColumnIds,
  };

  return normalized;
}

function loadPersistedState(): PersistedBoardState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) as PersistedBoardState : null;
  } catch {
    return null;
  }
}

export function useTierMeetingBoardState(pillars: TierMeetingPillar[]) {
  const availableLaneIds = [...pillars.map((pillar) => pillar.id), actionTrackerLaneId];
  const pillarLayoutSignature = pillars
    .map((pillar) => `${pillar.id}:${pillar.status}:${pillar.kpis.map((kpi) => kpi.id).join(',')}`)
    .join('|');
  const persistedState = useMemo(() => loadPersistedState(), []);

  const [visibleLaneIds, setVisibleLaneIds] = useState<TierMeetingLaneId[]>(() => (
    normalizeLaneIds(persistedState?.visibleLaneIds, availableLaneIds, defaultVisibleLaneIds)
  ));
  const [laneOrder, setLaneOrder] = useState<TierMeetingLaneId[]>(() => (
    normalizeLaneOrder(persistedState?.laneOrder, getReferenceLaneOrder(availableLaneIds))
  ));
  const [laneSpans, setLaneSpans] = useState<Record<TierMeetingLaneId, TierMeetingLaneSpan>>(() => (
    normalizeLaneSpans(persistedState?.laneSpans, availableLaneIds)
  ));
  const [laneHeights, setLaneHeights] = useState<Record<TierMeetingLaneId, number>>(() => (
    normalizeLaneHeights(persistedState?.laneHeights, availableLaneIds)
  ));
  const [lanePositions, setLanePositions] = useState<Record<TierMeetingLaneId, TierMeetingLanePosition>>(() => {
    const initialSpans = normalizeLaneSpans(persistedState?.laneSpans, availableLaneIds);
    const initialHeights = normalizeLaneHeights(persistedState?.laneHeights, availableLaneIds);
    const initialOrder = normalizeLaneOrder(persistedState?.laneOrder, getReferenceLaneOrder(availableLaneIds));
    return normalizeLanePositions(persistedState?.lanePositions, availableLaneIds, initialOrder, initialSpans, initialHeights);
  });
  const [laneStatuses, setLaneStatuses] = useState<Partial<Record<TierMeetingLaneId, TierMeetingLaneStatus>>>(() => (
    normalizeLaneStatuses(persistedState?.laneStatuses, pillars)
  ));
  const [laneTitles, setLaneTitles] = useState<Partial<Record<TierMeetingLaneId, string>>>(() => (
    normalizeLaneTitles(persistedState?.laneTitles, pillars)
  ));
  const [laneSettings, setLaneSettings] = useState<Partial<Record<TierMeetingLaneId, TierMeetingLaneSettings>>>(() => (
    normalizeLaneSettings(persistedState?.laneSettings, pillars)
  ));
  const [expandedLaneSettings, setExpandedLaneSettings] = useState<Partial<Record<TierMeetingLaneId, TierMeetingLaneSettings>>>(() => (
    normalizeLaneSettings(persistedState?.expandedLaneSettings, pillars)
  ));
  const [expandedLaneId, setExpandedLaneId] = useState<TierMeetingLaneId | null>(null);

  useEffect(() => {
    setVisibleLaneIds((previous) => normalizeLaneIds(previous, availableLaneIds, defaultVisibleLaneIds));
    setLaneOrder((previous) => normalizeLaneOrder(previous, availableLaneIds));
    const nextSpans = normalizeLaneSpans(laneSpans, availableLaneIds);
    const nextHeights = normalizeLaneHeights(laneHeights, availableLaneIds);
    const nextOrder = normalizeLaneOrder(laneOrder, availableLaneIds);
    setLaneSpans(nextSpans);
    setLaneHeights(nextHeights);
    setLanePositions((previous) => {
      return normalizeLanePositions(previous, availableLaneIds, nextOrder, nextSpans, nextHeights);
    });
    setLaneStatuses((previous) => normalizeLaneStatuses(previous, pillars));
    setLaneTitles((previous) => normalizeLaneTitles(previous, pillars));
    setLaneSettings((previous) => normalizeLaneSettings(previous, pillars));
    setExpandedLaneSettings((previous) => normalizeLaneSettings(previous, pillars));
  }, [pillarLayoutSignature]);

  useEffect(() => {
    setLanePositions((previous) => normalizeLanePositions(previous, availableLaneIds, laneOrder, laneSpans, laneHeights));
  }, [availableLaneIds.join('|'), laneOrder, laneSpans, laneHeights, visibleLaneIds]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stateToPersist: PersistedBoardState = {
      visibleLaneIds,
      laneOrder,
      laneSpans,
      laneHeights,
      lanePositions,
      laneStatuses,
      laneTitles,
      laneSettings,
      expandedLaneSettings,
    };
    window.localStorage.setItem(storageKey, JSON.stringify(stateToPersist));
  }, [visibleLaneIds, laneOrder, laneSpans, laneHeights, lanePositions, laneStatuses, laneTitles, laneSettings, expandedLaneSettings]);

  const orderedVisibleLaneIds = useMemo(
    () => laneOrder.filter((laneId) => visibleLaneIds.includes(laneId)),
    [laneOrder, visibleLaneIds],
  );

  const orderedVisiblePillars = useMemo(
    () => orderedVisibleLaneIds
      .map((laneId) => pillars.find((pillar) => pillar.id === laneId))
      .filter((pillar): pillar is TierMeetingPillar => Boolean(pillar)),
    [orderedVisibleLaneIds, pillars],
  );

  const state: TierMeetingBoardState = {
    visibleLaneIds,
    laneOrder,
    laneSpans,
    laneHeights,
    lanePositions,
    laneStatuses,
    laneTitles,
    laneSettings,
    expandedLaneSettings,
    expandedLaneId,
  };

  return {
    state,
    orderedVisibleLaneIds,
    orderedVisiblePillars,
    toggleLaneVisibility: (laneId: TierMeetingLaneId) => {
      setVisibleLaneIds((previous) => {
        if (previous.includes(laneId)) {
          return previous.length === 1 ? previous : previous.filter((id) => id !== laneId);
        }
        return laneOrder.filter((id) => previous.includes(id) || id === laneId);
      });
    },
    setLaneStatus: (laneId: TierMeetingLaneId, status: TierMeetingLaneStatus) => {
      setLaneStatuses((previous) => ({...previous, [laneId]: status}));
    },
    setLaneTitle: (laneId: TierMeetingLaneId, title: string) => {
      const sanitizedTitle = title.trimStart();
      setLaneTitles((previous) => ({
        ...previous,
        [laneId]: sanitizedTitle,
      }));
    },
    setLaneSpan: (laneId: TierMeetingLaneId, span: TierMeetingLaneSpan) => {
      const nextSpan = clampLaneSpan(span, laneId);
      setLaneSpans((previous) => ({...previous, [laneId]: nextSpan}));
      setLanePositions((previous) => ({
        ...previous,
        [laneId]: {
          ...previous[laneId],
          columnStart: Math.max(1, Math.min(gridColumnCount - nextSpan + 1, previous[laneId]?.columnStart ?? 1)),
        },
      }));
    },
    setLaneHeight: (laneId: TierMeetingLaneId, height: number) => {
      setLaneHeights((previous) => ({...previous, [laneId]: clampLaneHeight(height)}));
    },
    updateLaneSettings: (laneId: TierMeetingLaneId, nextSettings: TierMeetingLaneSettings) => {
      setLaneSettings((previous) => ({...previous, [laneId]: nextSettings}));
    },
    updateExpandedLaneSettings: (laneId: TierMeetingLaneId, nextSettings: TierMeetingLaneSettings) => {
      setExpandedLaneSettings((previous) => ({...previous, [laneId]: nextSettings}));
    },
    setLanePosition: (laneId: TierMeetingLaneId, position: TierMeetingLanePosition) => {
      setLanePositions((previous) => ({
        ...previous,
        [laneId]: {
          columnStart: Math.max(1, Math.min(gridColumnCount - laneSpans[laneId] + 1, Math.round(position.columnStart))),
          rowStart: Math.max(1, Math.round(position.rowStart)),
        },
      }));
    },
    reorderLane: (
      sourceLaneId: TierMeetingLaneId,
      targetLaneId: TierMeetingLaneId,
      position: 'before' | 'after' = 'before',
    ) => {
      if (sourceLaneId === targetLaneId) return;
      setLaneOrder((previous) => {
        const nextOrder = previous.filter((laneId) => laneId !== sourceLaneId);
        const targetIndex = nextOrder.indexOf(targetLaneId);
        if (targetIndex === -1) return previous;
        const insertionIndex = position === 'after' ? targetIndex + 1 : targetIndex;
        nextOrder.splice(insertionIndex, 0, sourceLaneId);
        return nextOrder;
      });
    },
    reorderLaneToIndex: (sourceLaneId: TierMeetingLaneId, targetIndex: number) => {
      setLaneOrder((previous) => {
        const currentIndex = previous.indexOf(sourceLaneId);
        if (currentIndex === -1) return previous;

        const nextOrder = previous.filter((laneId) => laneId !== sourceLaneId);
        const normalizedIndex = Math.max(0, Math.min(targetIndex, nextOrder.length));
        nextOrder.splice(normalizedIndex, 0, sourceLaneId);
        return nextOrder;
      });
    },
    resetLayout: () => {
      setVisibleLaneIds(defaultVisibleLaneIds.filter((laneId) => availableLaneIds.includes(laneId)));
      const nextOrder = getReferenceLaneOrder(availableLaneIds);
      setLaneOrder(nextOrder);
      const nextSpans = normalizeLaneSpans(undefined, availableLaneIds);
      const nextHeights = normalizeLaneHeights(undefined, availableLaneIds);
      setLaneSpans(nextSpans);
      setLaneHeights(nextHeights);
      setLanePositions(normalizeLanePositions(undefined, availableLaneIds, nextOrder, nextSpans, nextHeights));
      setLaneTitles(normalizeLaneTitles(undefined, pillars));
      setExpandedLaneSettings(normalizeLaneSettings(undefined, pillars));
    },
    openExpandedLane: (laneId: TierMeetingLaneId) => setExpandedLaneId(laneId),
    closeExpandedLane: () => setExpandedLaneId(null),
  };
}
