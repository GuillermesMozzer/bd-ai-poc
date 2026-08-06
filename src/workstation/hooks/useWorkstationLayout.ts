import {useEffect, useMemo, useRef, useState} from 'react';
import {
  workstationDefaultHiddenWidgetIds,
  workstationDefaultWidgetOrder,
  workstationLayoutStorageKey,
  workstationWidgetRegistryMap,
} from '../data/widgetRegistry';
import type {
  WorkstationLayoutBreakpoint,
  WorkstationLayoutItem,
  WorkstationLayoutState,
  WorkstationResponsiveLayouts,
  WorkstationWidgetSize,
} from '../types';

const layoutBreakpoints: WorkstationLayoutBreakpoint[] = ['lg', 'md', 'sm', 'xs', 'xxs'];

const layoutCols: Record<WorkstationLayoutBreakpoint, number> = {
  lg: 12,
  md: 12,
  sm: 8,
  xs: 4,
  xxs: 2,
};

type LegacyLayoutState = Partial<WorkstationLayoutState> & {
  hiddenWidgetIds?: string[];
  order?: string[];
  sizeMap?: Record<string, WorkstationWidgetSize>;
};

function uniqueArray(arr: string[]): string[] {
  return arr.filter((value, index) => arr.indexOf(value) === index);
}

function sortLayoutItems(layout: WorkstationLayoutItem[]) {
  return [...layout].sort((left, right) => {
    if (left.y !== right.y) return left.y - right.y;
    if (left.x !== right.x) return left.x - right.x;
    return left.i.localeCompare(right.i);
  });
}

function sortLayoutItemsForCompare(layout: WorkstationLayoutItem[]) {
  return [...layout].sort((left, right) => left.i.localeCompare(right.i));
}

function areLayoutItemsEqual(left: WorkstationLayoutItem[], right: WorkstationLayoutItem[]) {
  if (left.length !== right.length) return false;

  const sortedLeft = sortLayoutItemsForCompare(left);
  const sortedRight = sortLayoutItemsForCompare(right);

  return sortedLeft.every((item, index) => {
    const other = sortedRight[index];

    return (
      item.i === other.i
      && item.x === other.x
      && item.y === other.y
      && item.w === other.w
      && item.h === other.h
      && item.minW === other.minW
      && item.minH === other.minH
      && item.maxW === other.maxW
      && item.maxH === other.maxH
    );
  });
}

function areResponsiveLayoutsEqual(left: WorkstationResponsiveLayouts, right: WorkstationResponsiveLayouts) {
  return layoutBreakpoints.every((breakpoint) => areLayoutItemsEqual(left[breakpoint], right[breakpoint]));
}

function getBottom(layout: WorkstationLayoutItem[]) {
  if (layout.length === 0) return 0;
  return Math.max(...layout.map((item) => item.y + item.h));
}

function sanitizeWidgetIds(candidateIds: unknown) {
  if (!Array.isArray(candidateIds)) return [];

  const validIds = new Set(workstationDefaultWidgetOrder);
  const seen = new Set<string>();

  return candidateIds.filter((widgetId): widgetId is string => {
    if (typeof widgetId !== 'string') return false;
    if (!validIds.has(widgetId) || seen.has(widgetId)) return false;
    seen.add(widgetId);
    return true;
  });
}

function getOrderedWidgetIds(rawState: LegacyLayoutState | null | undefined) {
  const rawOrder = sanitizeWidgetIds(rawState?.order);
  const order = [...rawOrder];

  workstationDefaultWidgetOrder.forEach((widgetId) => {
    if (!order.includes(widgetId)) {
      order.push(widgetId);
    }
  });

  return order;
}

function rawLayoutsMentionWidget(rawLayouts: unknown, widgetId: string) {
  if (typeof rawLayouts !== 'object' || rawLayouts === null) {
    return false;
  }

  return Object.values(rawLayouts as Record<string, unknown>).some((layout) => (
    Array.isArray(layout)
    && layout.some((item) => typeof item === 'object' && item !== null && (item as Record<string, unknown>).i === widgetId)
  ));
}

function isWidgetTrackedInRawState(rawState: LegacyLayoutState | null | undefined, widgetId: string) {
  if (!rawState) {
    return false;
  }

  return rawState.order?.includes(widgetId)
    || rawState.hiddenWidgetIds?.includes(widgetId)
    || rawLayoutsMentionWidget(rawState.layouts, widgetId);
}

function getHiddenWidgetIds(rawState: LegacyLayoutState | null | undefined, orderedWidgetIds: string[]) {
  const rawHiddenWidgetIds = sanitizeWidgetIds(rawState?.hiddenWidgetIds);
  const nextDefaultHiddenWidgetIds = workstationDefaultHiddenWidgetIds.filter((widgetId) => !isWidgetTrackedInRawState(rawState, widgetId));

  if (!rawState) {
    return workstationDefaultHiddenWidgetIds;
  }

  if (Array.isArray(rawState.hiddenWidgetIds)) {
    return uniqueArray([...rawHiddenWidgetIds, ...nextDefaultHiddenWidgetIds]);
  }

  if (Array.isArray(rawState.order)) {
    return uniqueArray([
      ...orderedWidgetIds.filter((widgetId) => !rawState.order?.includes(widgetId)),
      ...nextDefaultHiddenWidgetIds,
    ]);
  }

  return workstationDefaultHiddenWidgetIds;
}

function createLayoutItem(widgetId: string, cols: number, y: number): WorkstationLayoutItem {
  const widget = workstationWidgetRegistryMap[widgetId];
  const {w, h, minW, minH} = widget.defaultLayout;

  return {
    i: widgetId,
    x: 0,
    y,
    w: Math.min(w, cols),
    h,
    minW: Math.min(minW, cols),
    minH,
  };
}

function buildPackedLayout(widgetIds: string[], cols: number) {
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  let bottom = 0;

  const layout: WorkstationLayoutItem[] = [];

  widgetIds.forEach((widgetId) => {
    const widget = workstationWidgetRegistryMap[widgetId];
    if (!widget) return;

    const itemWidth = Math.min(widget.defaultLayout.w, cols);
    const itemMinWidth = Math.min(widget.defaultLayout.minW, cols);

    if (x !== 0 && x + itemWidth > cols) {
      x = 0;
      y = bottom;
      rowHeight = 0;
    }

    layout.push({
      i: widgetId,
      x,
      y,
      w: itemWidth,
      h: widget.defaultLayout.h,
      minW: itemMinWidth,
      minH: widget.defaultLayout.minH,
    });

    rowHeight = Math.max(rowHeight, widget.defaultLayout.h);
    x += itemWidth;
    bottom = Math.max(bottom, y + rowHeight);

    if (x >= cols) {
      x = 0;
      y = bottom;
      rowHeight = 0;
    }
  });

  return layout;
}

function repackLayoutForCols(layout: WorkstationLayoutItem[], cols: number) {
  const nextLayout: WorkstationLayoutItem[] = [];
  let x = 0;
  let y = 0;
  let rowHeight = 0;
  let bottom = 0;

  sortLayoutItems(layout).forEach((item) => {
    const widget = workstationWidgetRegistryMap[item.i];
    if (!widget) return;

    const width = Math.max(1, Math.min(item.w, cols));
    const minWidth = Math.max(1, Math.min(item.minW ?? widget.defaultLayout.minW, cols));
    const height = Math.max(1, item.h);
    const minHeight = Math.max(1, item.minH ?? widget.defaultLayout.minH);

    if (x !== 0 && x + width > cols) {
      x = 0;
      y = bottom;
      rowHeight = 0;
    }

    nextLayout.push({
      ...item,
      x,
      y,
      w: width,
      h: height,
      minW: minWidth,
      minH: minHeight,
    });

    rowHeight = Math.max(rowHeight, height);
    x += width;
    bottom = Math.max(bottom, y + rowHeight);

    if (x >= cols) {
      x = 0;
      y = bottom;
      rowHeight = 0;
    }
  });

  return nextLayout;
}

function clampLayoutItemsToCols(layout: WorkstationLayoutItem[], cols: number) {
  return layout.map((item) => {
    const widget = workstationWidgetRegistryMap[item.i];
    if (!widget) return item;

    const minWidth = Math.max(1, Math.min(item.minW ?? widget.defaultLayout.minW, cols));
    const width = Math.max(minWidth, Math.min(item.w, cols));

    return {
      ...item,
      x: Math.min(Math.max(0, item.x), Math.max(0, cols - width)),
      y: Math.max(0, item.y),
      w: width,
      h: Math.max(1, item.h),
      minW: minWidth,
      minH: Math.max(1, item.minH ?? widget.defaultLayout.minH),
    };
  });
}

function appendMissingItems(layout: WorkstationLayoutItem[], orderedWidgetIds: string[], cols: number) {
  const nextLayout = [...sortLayoutItems(layout)];

  orderedWidgetIds.forEach((widgetId) => {
    if (nextLayout.some((item) => item.i === widgetId)) return;
    nextLayout.push(createLayoutItem(widgetId, cols, getBottom(nextLayout)));
  });

  return sortLayoutItems(nextLayout);
}

function sanitizeLayoutItems(
  rawItems: unknown,
  cols: number,
  orderedWidgetIds: string[],
  fallbackLayout: WorkstationLayoutItem[],
) {
  if (!Array.isArray(rawItems)) {
    return appendMissingItems(clampLayoutItemsToCols(fallbackLayout, cols), orderedWidgetIds, cols);
  }

  const validIds = new Set(workstationDefaultWidgetOrder);
  const seen = new Set<string>();

  const sanitizedItems: WorkstationLayoutItem[] = rawItems
    .filter((rawItem): rawItem is Record<string, unknown> => typeof rawItem === 'object' && rawItem !== null)
    .reduce<WorkstationLayoutItem[]>((items, rawItem) => {
      const widgetId = typeof rawItem.i === 'string' ? rawItem.i : '';
      if (!validIds.has(widgetId) || seen.has(widgetId)) {
        return items;
      }

      const widget = workstationWidgetRegistryMap[widgetId];
      seen.add(widgetId);

      const width = Number(rawItem.w);
      const height = Number(rawItem.h);
      const x = Number(rawItem.x);
      const y = Number(rawItem.y);

      items.push({
        i: widgetId,
        x: Number.isFinite(x) ? Math.max(0, Math.round(x)) : 0,
        y: Number.isFinite(y) ? Math.max(0, Math.round(y)) : 0,
        w: Number.isFinite(width) ? Math.max(1, Math.min(Math.round(width), cols)) : Math.min(widget.defaultLayout.w, cols),
        h: Number.isFinite(height) ? Math.max(1, Math.round(height)) : widget.defaultLayout.h,
        minW: Math.min(
          Number.isFinite(Number(rawItem.minW))
            ? Math.min(Math.max(1, Math.round(Number(rawItem.minW))), widget.defaultLayout.minW)
            : widget.defaultLayout.minW,
          cols,
        ),
        minH: Number.isFinite(Number(rawItem.minH))
          ? Math.min(Math.max(1, Math.round(Number(rawItem.minH))), widget.defaultLayout.minH)
          : widget.defaultLayout.minH,
      });

      return items;
    }, []);

  return appendMissingItems(clampLayoutItemsToCols(sanitizedItems, cols), orderedWidgetIds, cols);
}

function buildResponsiveLayouts(orderedWidgetIds: string[]) {
  const baseLayout = buildPackedLayout(orderedWidgetIds, layoutCols.lg);

  return layoutBreakpoints.reduce((layouts, breakpoint) => {
    layouts[breakpoint] = breakpoint === 'lg'
      ? appendMissingItems(baseLayout, orderedWidgetIds, layoutCols[breakpoint])
      : repackLayoutForCols(baseLayout, layoutCols[breakpoint]);
    return layouts;
  }, {} as WorkstationResponsiveLayouts);
}

function sanitizeResponsiveLayouts(rawLayouts: unknown, orderedWidgetIds: string[]) {
  const defaultLayouts = buildResponsiveLayouts(orderedWidgetIds);
  const candidateLayouts = typeof rawLayouts === 'object' && rawLayouts !== null
    ? rawLayouts as Partial<Record<WorkstationLayoutBreakpoint, unknown>>
    : null;

  const largeLayout = sanitizeLayoutItems(candidateLayouts?.lg, layoutCols.lg, orderedWidgetIds, defaultLayouts.lg);

  return layoutBreakpoints.reduce((layouts, breakpoint) => {
    layouts[breakpoint] = breakpoint === 'lg'
      ? largeLayout
      : sanitizeLayoutItems(candidateLayouts?.[breakpoint], layoutCols[breakpoint], orderedWidgetIds, repackLayoutForCols(largeLayout, layoutCols[breakpoint]));
    return layouts;
  }, {} as WorkstationResponsiveLayouts);
}

function sanitizeLayoutState(rawState: LegacyLayoutState | null | undefined): WorkstationLayoutState {
  const orderedWidgetIds = getOrderedWidgetIds(rawState);
  const hiddenWidgetIds = getHiddenWidgetIds(rawState, orderedWidgetIds);

  return {
    hiddenWidgetIds,
    layouts: sanitizeResponsiveLayouts(rawState?.layouts, orderedWidgetIds),
  };
}

function readInitialLayoutState(storageKey: string) {
  if (typeof window === 'undefined') {
    return sanitizeLayoutState(null);
  }

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) {
      return sanitizeLayoutState(null);
    }

    return sanitizeLayoutState(JSON.parse(rawValue) as LegacyLayoutState);
  } catch {
    return sanitizeLayoutState(null);
  }
}

function filterVisibleLayouts(layouts: WorkstationResponsiveLayouts, hiddenWidgetIds: string[]) {
  return layoutBreakpoints.reduce((nextLayouts, breakpoint) => {
    nextLayouts[breakpoint] = layouts[breakpoint].filter((item) => !hiddenWidgetIds.includes(item.i));
    return nextLayouts;
  }, {} as WorkstationResponsiveLayouts);
}

function mergeVisibleLayouts(
  currentLayouts: WorkstationResponsiveLayouts,
  nextVisibleLayouts: Partial<WorkstationResponsiveLayouts>,
  hiddenWidgetIds: string[],
) {
  const orderedWidgetIds = workstationDefaultWidgetOrder;

  return layoutBreakpoints.reduce((layouts, breakpoint) => {
    const hiddenItems = currentLayouts[breakpoint].filter((item) => hiddenWidgetIds.includes(item.i));
    const fallbackVisibleLayout = currentLayouts[breakpoint].filter((item) => !hiddenWidgetIds.includes(item.i));
    const nextVisible = sanitizeLayoutItems(
      nextVisibleLayouts[breakpoint],
      layoutCols[breakpoint],
      orderedWidgetIds.filter((widgetId) => !hiddenWidgetIds.includes(widgetId)),
      fallbackVisibleLayout,
    );

    layouts[breakpoint] = appendMissingItems(
      [...nextVisible, ...hiddenItems],
      orderedWidgetIds,
      layoutCols[breakpoint],
    );

    return layouts;
  }, {} as WorkstationResponsiveLayouts);
}

function addWidgetToLayouts(layouts: WorkstationResponsiveLayouts, widgetId: string) {
  return layoutBreakpoints.reduce((nextLayouts, breakpoint) => {
    const currentLayout = layouts[breakpoint];
    nextLayouts[breakpoint] = currentLayout.some((item) => item.i === widgetId)
      ? currentLayout
      : [...currentLayout, createLayoutItem(widgetId, layoutCols[breakpoint], getBottom(currentLayout))];
    return nextLayouts;
  }, {} as WorkstationResponsiveLayouts);
}

function revealWidgetInLayouts(layouts: WorkstationResponsiveLayouts, hiddenWidgetIds: string[], widgetId: string) {
  const hiddenWidgetSet = new Set(hiddenWidgetIds);
  const widget = workstationWidgetRegistryMap[widgetId];

  return layoutBreakpoints.reduce((nextLayouts, breakpoint) => {
    const cols = layoutCols[breakpoint];
    const currentLayout = layouts[breakpoint];
    const existingItem = currentLayout.find((item) => item.i === widgetId);
    const visibleItems = currentLayout.filter((item) => !hiddenWidgetSet.has(item.i) && item.i !== widgetId);
    const hiddenItems = currentLayout.filter((item) => hiddenWidgetSet.has(item.i) && item.i !== widgetId);
    const bottom = getBottom(visibleItems);
    const minWidth = Math.max(1, Math.min(existingItem?.minW ?? widget.defaultLayout.minW, cols));
    const width = Math.max(minWidth, Math.min(existingItem?.w ?? widget.defaultLayout.w, cols));

    const revealedItem: WorkstationLayoutItem = {
      i: widgetId,
      x: 0,
      y: bottom,
      w: width,
      h: Math.max(1, existingItem?.h ?? widget.defaultLayout.h),
      minW: minWidth,
      minH: Math.max(1, existingItem?.minH ?? widget.defaultLayout.minH),
      maxW: existingItem?.maxW,
      maxH: existingItem?.maxH,
    };

    nextLayouts[breakpoint] = appendMissingItems(
      [...visibleItems, revealedItem, ...hiddenItems],
      workstationDefaultWidgetOrder,
      cols,
    );

    return nextLayouts;
  }, {} as WorkstationResponsiveLayouts);
}

function getWidgetSizeFromWidth(width: number): WorkstationWidgetSize {
  if (width >= 10) return 'large';
  if (width >= 5) return 'medium';
  return 'small';
}

export function useWorkstationLayout(storageKey = workstationLayoutStorageKey) {
  const [layoutState, setLayoutState] = useState<WorkstationLayoutState>(() => readInitialLayoutState(storageKey));
  const activeKeyRef = useRef(storageKey);

  // Switch layouts when the storage key changes (e.g. switching predefined workstations)
  useEffect(() => {
    if (activeKeyRef.current !== storageKey) {
      setLayoutState(readInitialLayoutState(storageKey));
      activeKeyRef.current = storageKey;
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Only save if the current layoutState actually belongs to the current storageKey.
    // This prevents the old layout from being written to a new storageKey before the sync effect runs.
    if (activeKeyRef.current !== storageKey) return;

    window.localStorage.setItem(storageKey, JSON.stringify(layoutState));
  }, [layoutState, storageKey]);

  const hiddenWidgetIds = useMemo(
    () => workstationDefaultWidgetOrder.filter((widgetId) => layoutState.hiddenWidgetIds.includes(widgetId)),
    [layoutState.hiddenWidgetIds],
  );

  const visibleLayouts = useMemo(
    () => filterVisibleLayouts(layoutState.layouts, hiddenWidgetIds),
    [hiddenWidgetIds, layoutState.layouts],
  );

  const visibleWidgetIds = useMemo(
    () => sortLayoutItems(visibleLayouts.lg).map((item) => item.i),
    [visibleLayouts],
  );

  const showWidget = (widgetId: string) => {
    if (!workstationWidgetRegistryMap[widgetId]) return;

    setLayoutState((prev) => {
      const isHidden = prev.hiddenWidgetIds.includes(widgetId);
      const layouts = isHidden
        ? revealWidgetInLayouts(prev.layouts, prev.hiddenWidgetIds, widgetId)
        : addWidgetToLayouts(prev.layouts, widgetId);
      const nextHiddenWidgetIds = prev.hiddenWidgetIds.filter((id) => id !== widgetId);

      if (areResponsiveLayoutsEqual(prev.layouts, layouts) && nextHiddenWidgetIds.length === prev.hiddenWidgetIds.length) {
        return prev;
      }

      return {
        ...prev,
        layouts,
        hiddenWidgetIds: nextHiddenWidgetIds,
      };
    });
  };

  const hideWidget = (widgetId: string) => {
    if (!workstationWidgetRegistryMap[widgetId]) return;

    setLayoutState((prev) => {
      if (prev.hiddenWidgetIds.includes(widgetId)) {
        return prev;
      }

      return {
        ...prev,
        hiddenWidgetIds: [...prev.hiddenWidgetIds, widgetId],
      };
    });
  };

  const updateVisibleLayouts = (nextVisibleLayouts: Partial<WorkstationResponsiveLayouts>) => {
    setLayoutState((prev) => {
      const nextLayouts = mergeVisibleLayouts(prev.layouts, nextVisibleLayouts, prev.hiddenWidgetIds);
      if (areResponsiveLayoutsEqual(prev.layouts, nextLayouts)) {
        return prev;
      }

      return {
        ...prev,
        layouts: nextLayouts,
      };
    });
  };

  const resetLayout = () => {
    setLayoutState(sanitizeLayoutState(null));
  };

  const getWidgetSize = (widgetId: string) => {
    const widgetLayout = layoutState.layouts.lg.find((item) => item.i === widgetId);
    if (!widgetLayout) {
      return workstationWidgetRegistryMap[widgetId]?.defaultSize ?? 'medium';
    }

    return getWidgetSizeFromWidth(widgetLayout.w);
  };

  return {
    getWidgetSize,
    hiddenWidgetIds,
    hideWidget,
    layoutState,
    resetLayout,
    showWidget,
    updateVisibleLayouts,
    visibleLayouts,
    visibleWidgetIds,
  };
}
