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
 * Example with 6 items and minItemWidth 148:
 *   wide  → 6×1 · medium → 3×2 · narrow → 2×3 · tight → 1×6
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

  // Prefer a divisor of itemCount when it stays reasonably dense (avoid 5+1 / 4+2 for 6 KPIs).
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

export function useContainerWidth<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node || typeof ResizeObserver === 'undefined') return undefined;

    const apply = (next: number) => {
      const rounded = Math.round(next);
      setWidth((prev) => (Math.abs(prev - rounded) < 1 ? prev : rounded));
    };

    apply(node.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      apply(entry.contentRect.width);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, width };
}

/**
 * CSS grid that reflows columns from the widget's own width (not the viewport).
 * Use inside CT V2 widgets so drag/resize updates the internal card layout.
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
  const resolvedMax = maxCols ?? presetCfg?.maxCols;
  const { ref, width } = useContainerWidth();
  const cols = computeAdaptiveCols(width, itemCount, resolvedMin, resolvedMax);
  const gapPx = typeof gap === 'number' ? gap * 8 : 8;
  const cellWidth = cols > 0 ? Math.max(0, (width - gapPx * (cols - 1)) / cols) : width;
  const comfortable = cellWidth >= 200;
  const compact = cellWidth > 0 && cellWidth < 160;

  const value: AdaptiveGridContextValue = {
    cols,
    width,
    cellWidth,
    comfortable,
    compact,
  };

  return (
    <AdaptiveGridContext.Provider value={value}>
      <Box
        ref={ref}
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap,
          width: '100%',
          alignContent: 'start',
          transition: 'grid-template-columns 120ms ease',
          ...((sx as object) ?? {}),
        }}
      >
        {children}
      </Box>
    </AdaptiveGridContext.Provider>
  );
}
