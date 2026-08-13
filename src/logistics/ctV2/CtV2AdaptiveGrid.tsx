import React, { createContext, useContext, useLayoutEffect, useRef, useState } from 'react';
import { Box, type BoxProps } from '@mui/material';

/** Presets tuned for common CT V2 card densities. */
export const CT_V2_GRID_PRESETS = {
  /** Executive / receiving KPI strips (6 cards → 6×1 … 1×6). */
  kpiStrip: { minItemWidth: 148, maxCols: 6 },
  /** Macroflow / journey / WIP cards. */
  cards: { minItemWidth: 220, maxCols: 4 },
  /** Dense metric pairs / leadership tiles. */
  metrics: { minItemWidth: 120, maxCols: 6 },
  /** Wide board panels. */
  boards: { minItemWidth: 280, maxCols: 3 },
  /** Two-up detail rows that collapse to stack. */
  pair: { minItemWidth: 180, maxCols: 2 },
} as const;

export type CtV2GridPresetName = keyof typeof CT_V2_GRID_PRESETS;

export type CtV2AdaptiveGridProps = {
  /** Number of child items (used to cap columns at item count). */
  itemCount: number;
  /** Named density preset (overridden by explicit minItemWidth / maxCols). */
  preset?: CtV2GridPresetName;
  /** Minimum readable width per cell in px. */
  minItemWidth?: number;
  /** Hard cap on columns (defaults to itemCount). */
  maxCols?: number;
  /** Gap between cells (theme spacing units or CSS). */
  gap?: number | string;
  children: React.ReactNode;
  sx?: BoxProps['sx'];
};

type AdaptiveGridContextValue = {
  cols: number;
  width: number;
  cellWidth: number;
  /** True when each cell is wide enough for secondary chrome (sparklines, dual metrics). */
  comfortable: boolean;
  /** True when cells are very tight — stack dense content. */
  compact: boolean;
};

const AdaptiveGridContext = createContext<AdaptiveGridContextValue>({
  cols: 1,
  width: 0,
  cellWidth: 0,
  comfortable: true,
  compact: false,
});

export function useAdaptiveGrid(): AdaptiveGridContextValue {
  return useContext(AdaptiveGridContext);
}

/**
 * Compute how many columns fit in a container while keeping each cell readable.
 * Prefers even grids when close to the width-fit (e.g. 6 items → 6 / 3 / 2 / 1).
 */
export function computeAdaptiveCols(
  width: number,
  itemCount: number,
  minItemWidth = 160,
  maxCols?: number,
): number {
  if (itemCount <= 1) return 1;
  if (width <= 0) return Math.min(2, itemCount, maxCols ?? itemCount);
  const byWidth = Math.max(1, Math.floor((width + 8) / minItemWidth));
  const maxFit = Math.max(1, Math.min(itemCount, maxCols ?? itemCount, byWidth));

  let bestDivisor = 1;
  for (let c = maxFit; c >= 1; c -= 1) {
    if (itemCount % c === 0) {
      bestDivisor = c;
      break;
    }
  }
  if (bestDivisor >= Math.ceil(maxFit / 2)) return bestDivisor;
  return maxFit;
}

function readElementWidth(node: HTMLElement): number {
  const rect = node.getBoundingClientRect().width;
  if (rect > 0) return rect;
  if (node.clientWidth > 0) return node.clientWidth;
  const parent = node.parentElement;
  if (parent) {
    const pw = parent.getBoundingClientRect().width;
    if (pw > 0) return pw;
  }
  return 0;
}

export function useContainerWidth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const apply = () => {
      const next = Math.round(readElementWidth(node));
      setWidth((prev) => (Math.abs(prev - next) < 1 ? prev : next));
    };

    apply();

    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(apply);
    };

    const observers: ResizeObserver[] = [];
    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(schedule);
      ro.observe(node);
      // RGL sets size on the grid item; observing the parent catches mid-resize updates
      // that sometimes don't propagate cleanly to percentage-sized children.
      if (node.parentElement) ro.observe(node.parentElement);
      const gridItem = node.closest('.react-grid-item');
      if (gridItem instanceof HTMLElement && gridItem !== node.parentElement) {
        ro.observe(gridItem);
      }
      observers.push(ro);
    }

    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      observers.forEach((o) => o.disconnect());
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return { ref, width };
}

/**
 * CSS grid that reflows columns from the widget's own width (not the viewport).
 * Uses both CSS auto-fit (works during live RGL resize) and measured cols for
 * density hints (comfortable / compact) consumed by child cards.
 */
export function CtV2AdaptiveGrid({
  itemCount,
  preset,
  minItemWidth,
  maxCols,
  gap = 1,
  children,
  sx,
}: CtV2AdaptiveGridProps) {
  const presetCfg = preset ? CT_V2_GRID_PRESETS[preset] : undefined;
  const resolvedMin = minItemWidth ?? presetCfg?.minItemWidth ?? 160;
  const resolvedMax = Math.max(1, maxCols ?? presetCfg?.maxCols ?? itemCount);
  const { ref, width } = useContainerWidth();
  const cols = computeAdaptiveCols(width, itemCount, resolvedMin, resolvedMax);
  const gapPx = typeof gap === 'number' ? gap * 8 : 8;
  const cellWidth = cols > 0 ? Math.max(0, (width - gapPx * (cols - 1)) / cols) : width;
  const comfortable = width === 0 || cellWidth >= 200;
  const compact = cellWidth > 0 && cellWidth < 160;

  const value: AdaptiveGridContextValue = {
    cols,
    width,
    cellWidth,
    comfortable,
    compact,
  };

  // CSS auto-fit is the source of truth for column count during live resize.
  // minmax(max(minPx, 100%/maxCols), 1fr) caps at maxCols when wide and collapses
  // toward 1 column when the widget is narrower than minPx * n.
  const cssColumns = `repeat(auto-fit, minmax(max(${resolvedMin}px, calc(100% / ${resolvedMax})), 1fr))`;

  return (
    <AdaptiveGridContext.Provider value={value}>
      <Box
        ref={ref}
        sx={{
          display: 'grid',
          gridTemplateColumns: cssColumns,
          gap,
          width: '100%',
          minWidth: 0,
          alignContent: 'start',
          ...((sx as object) ?? {}),
        }}
      >
        {children}
      </Box>
    </AdaptiveGridContext.Provider>
  );
}
