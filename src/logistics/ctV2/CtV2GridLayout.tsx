import React, { useCallback, useState, type ComponentType, type ReactNode } from 'react';
import { Box } from '@mui/material';
import { Responsive as ResponsiveGridLayoutBase } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import {
  createStableWidthProvider,
  type WidthProviderComponentProps,
} from '../../workstation/components/stableWidthProvider';
import { CT_V2_DRAG_HANDLE_CLASS } from './CtV2WidgetFrame';
import {
  readCtV2LayoutsForUser,
  writeCtV2LayoutsForUser,
} from './ctV2LayoutStorage';

const ResponsiveGridLayout = createStableWidthProvider(
  ResponsiveGridLayoutBase as unknown as ComponentType<WidthProviderComponentProps & Record<string, unknown>>,
);

export type CtV2LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
};

const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
const cols = { lg: 12, md: 12, sm: 8, xs: 4, xxs: 2 };

function normalizeLayout(layout: unknown): CtV2LayoutItem[] {
  if (!Array.isArray(layout)) return [];
  return layout
    .map((item) => {
      const row = item as Partial<CtV2LayoutItem>;
      if (!row?.i || typeof row.x !== 'number' || typeof row.y !== 'number') return null;
      return {
        i: String(row.i),
        x: row.x,
        y: row.y,
        w: typeof row.w === 'number' ? row.w : 4,
        h: typeof row.h === 'number' ? row.h : 10,
        minW: typeof row.minW === 'number' ? row.minW : 2,
        minH: typeof row.minH === 'number' ? row.minH : 6,
      };
    })
    .filter((item) => Boolean(item)) as CtV2LayoutItem[];
}

export function readCtV2Layouts(
  storageKey: string,
  defaultLayouts: Record<string, CtV2LayoutItem[]>,
  userScope?: string,
): Record<string, CtV2LayoutItem[]> {
  return readCtV2LayoutsForUser(storageKey, defaultLayouts, userScope);
}

type CtV2GridLayoutProps = {
  storageKey: string;
  defaultLayouts: Record<string, CtV2LayoutItem[]>;
  widgetIds: string[];
  renderWidget: (widgetId: string) => ReactNode;
  gridKey: string;
  userScope?: string;
};

export function CtV2GridLayout({
  storageKey,
  defaultLayouts,
  widgetIds,
  renderWidget,
  gridKey,
  userScope,
}: CtV2GridLayoutProps) {
  const [layouts, setLayouts] = useState<Record<string, CtV2LayoutItem[]>>(() =>
    readCtV2LayoutsForUser(storageKey, defaultLayouts, userScope),
  );
  const [activeBreakpoint, setActiveBreakpoint] = useState('lg');

  React.useEffect(() => {
    setLayouts(readCtV2LayoutsForUser(storageKey, defaultLayouts, userScope));
  }, [storageKey, userScope, defaultLayouts]);

  const commitBreakpointLayout = useCallback(
    (layout: unknown) => {
      const nextBreakpointLayout = normalizeLayout(layout);
      if (nextBreakpointLayout.length === 0) return;
      setLayouts((prev) => {
        const next = {
          ...prev,
          [activeBreakpoint]: nextBreakpointLayout,
        };
        writeCtV2LayoutsForUser(storageKey, next, userScope);
        return next;
      });
    },
    [activeBreakpoint, storageKey, userScope],
  );

  return (
    <Box
      sx={{
        flexGrow: 1,
        minWidth: 0,
        width: '100%',
        pb: 2,
        '& .react-grid-layout': { minHeight: 160 },
        '& .react-grid-item': { transition: 'transform 180ms ease' },
        '& .react-grid-item.react-grid-placeholder': {
          backgroundColor: 'rgba(4, 78, 215, 0.10)',
          border: '1px dashed rgba(4, 78, 215, 0.35)',
          borderRadius: 2.6,
        },
        '& .react-resizable-handle': { opacity: 0.55, zIndex: 4 },
        '& .react-grid-item:hover .react-resizable-handle': { opacity: 1 },
        '& .react-resizable-handle::after': {
          borderColor: 'var(--token-brand-main) !important',
        },
      }}
    >
      <ResponsiveGridLayout
        key={gridKey}
        className="layout"
        layouts={layouts as unknown as Record<string, unknown[]>}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={28}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        isDraggable
        isResizable
        resizeHandles={['se', 'sw', 'ne', 'nw', 'e', 'w', 's', 'n']}
        draggableHandle={`.${CT_V2_DRAG_HANDLE_CLASS}`}
        compactType="vertical"
        preventCollision={false}
        useCSSTransforms
        onBreakpointChange={(bp: string) => setActiveBreakpoint(bp)}
        onDragStop={(layout: unknown) => commitBreakpointLayout(layout)}
        onResizeStop={(layout: unknown) => commitBreakpointLayout(layout)}
      >
        {widgetIds.map((widgetId) => (
          <div key={widgetId} style={{ height: '100%', width: '100%', minWidth: 0, overflow: 'hidden' }}>
            {renderWidget(widgetId)}
          </div>
        ))}
      </ResponsiveGridLayout>
    </Box>
  );
}

export function resetCtV2Layouts(
  storageKey: string,
  defaultLayouts: Record<string, CtV2LayoutItem[]>,
  userScope?: string,
): void {
  writeCtV2LayoutsForUser(storageKey, structuredClone(defaultLayouts), userScope);
}

export { breakpoints as CT_V2_BREAKPOINTS, cols as CT_V2_COLS };
