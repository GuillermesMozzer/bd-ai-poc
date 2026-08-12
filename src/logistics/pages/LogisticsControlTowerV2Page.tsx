import React, { useCallback, useMemo, useState, type ComponentType } from 'react';
import { Alert, Box, Button, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { GripVertical, LayoutTemplate, RotateCcw } from 'lucide-react';
import { Responsive as ResponsiveGridLayoutBase } from 'react-grid-layout/legacy';
import 'react-grid-layout/css/styles.css';
import BdLogo from '../../common/components/BdLogo';
import { useThemeMode } from '../../common/contexts/ThemeModeContext';
import {
  createStableWidthProvider,
  type WidthProviderComponentProps,
} from '../../workstation/components/stableWidthProvider';
import { PrioritizedDecisionQueue } from '../widgets/PrioritizedDecisionQueue';
import { SpaceXShippingGatingConsole } from '../widgets/SpaceXShippingGatingConsole';
import { SterilizationLoadsTimelineWidget } from '../widgets/SterilizationLoadsTimelineWidget';
import { InboundSlaChartWidget } from '../widgets/InboundSlaChartWidget';
import { AtlasAiPrescriptivePanel } from '../widgets/AtlasAiPrescriptivePanel';
import { resetLogisticsDemoData } from '../data/reactiveLogisticsDemo';
import {
  ctV2Type,
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  workstationVisuals,
} from '../ctV2Theme';

const ResponsiveGridLayout = createStableWidthProvider(
  ResponsiveGridLayoutBase as unknown as ComponentType<WidthProviderComponentProps & Record<string, unknown>>,
);

const LAYOUT_STORAGE_KEY = 'bd-logistics-ct-v2-layout-v1';
const DRAG_HANDLE_CLASS = 'ct-v2-drag-handle';

type CtV2WidgetId =
  | 'decision_queue'
  | 'atlas_ai'
  | 'spacex_gating'
  | 'inbound_sla'
  | 'sterilization_timeline';

type LayoutItem = {
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

const DEFAULT_LG: LayoutItem[] = [
  { i: 'decision_queue', x: 0, y: 0, w: 4, h: 14, minW: 3, minH: 8 },
  { i: 'atlas_ai', x: 0, y: 14, w: 4, h: 12, minW: 3, minH: 8 },
  { i: 'spacex_gating', x: 4, y: 0, w: 4, h: 15, minW: 3, minH: 8 },
  { i: 'inbound_sla', x: 4, y: 15, w: 4, h: 11, minW: 3, minH: 7 },
  { i: 'sterilization_timeline', x: 8, y: 0, w: 4, h: 26, minW: 3, minH: 10 },
];

const DEFAULT_LAYOUTS: Record<string, LayoutItem[]> = {
  lg: DEFAULT_LG,
  md: DEFAULT_LG,
  sm: [
    { i: 'decision_queue', x: 0, y: 0, w: 4, h: 12, minW: 3, minH: 8 },
    { i: 'atlas_ai', x: 4, y: 0, w: 4, h: 12, minW: 3, minH: 8 },
    { i: 'spacex_gating', x: 0, y: 12, w: 4, h: 13, minW: 3, minH: 8 },
    { i: 'inbound_sla', x: 4, y: 12, w: 4, h: 13, minW: 3, minH: 7 },
    { i: 'sterilization_timeline', x: 0, y: 25, w: 8, h: 14, minW: 4, minH: 10 },
  ],
  xs: [
    { i: 'decision_queue', x: 0, y: 0, w: 4, h: 12, minW: 2, minH: 8 },
    { i: 'spacex_gating', x: 0, y: 12, w: 4, h: 12, minW: 2, minH: 8 },
    { i: 'atlas_ai', x: 0, y: 24, w: 4, h: 12, minW: 2, minH: 8 },
    { i: 'inbound_sla', x: 0, y: 36, w: 4, h: 10, minW: 2, minH: 7 },
    { i: 'sterilization_timeline', x: 0, y: 46, w: 4, h: 14, minW: 2, minH: 10 },
  ],
  xxs: [
    { i: 'decision_queue', x: 0, y: 0, w: 2, h: 12, minW: 2, minH: 8 },
    { i: 'spacex_gating', x: 0, y: 12, w: 2, h: 12, minW: 2, minH: 8 },
    { i: 'atlas_ai', x: 0, y: 24, w: 2, h: 12, minW: 2, minH: 8 },
    { i: 'inbound_sla', x: 0, y: 36, w: 2, h: 10, minW: 2, minH: 7 },
    { i: 'sterilization_timeline', x: 0, y: 46, w: 2, h: 14, minW: 2, minH: 10 },
  ],
};

const WIDGET_META: Record<CtV2WidgetId, { title: string }> = {
  decision_queue: { title: 'Decision Queue' },
  atlas_ai: { title: 'ATLAS.AI' },
  spacex_gating: { title: 'SpaceX Gating' },
  inbound_sla: { title: 'Inbound SLA' },
  sterilization_timeline: { title: 'Sterilization Timeline' },
};

function readStoredLayouts(): Record<string, LayoutItem[]> {
  if (typeof window === 'undefined') return structuredClone(DEFAULT_LAYOUTS);
  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_LAYOUTS);
    const parsed = JSON.parse(raw) as Record<string, LayoutItem[]>;
    if (!parsed?.lg || !Array.isArray(parsed.lg)) return structuredClone(DEFAULT_LAYOUTS);
    return { ...structuredClone(DEFAULT_LAYOUTS), ...parsed };
  } catch {
    return structuredClone(DEFAULT_LAYOUTS);
  }
}

function normalizeLayout(layout: unknown): LayoutItem[] {
  if (!Array.isArray(layout)) return [];
  return layout
    .map((item) => {
      const row = item as Partial<LayoutItem>;
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
    .filter((item): item is LayoutItem => Boolean(item));
}

type WidgetFrameProps = {
  widgetId: CtV2WidgetId;
  children: React.ReactNode;
};

function CtV2WidgetFrame({ widgetId, children }: WidgetFrameProps) {
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        position: 'relative',
      }}
    >
      <Box
        className={DRAG_HANDLE_CLASS}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 3,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: 0.75,
          py: 0.35,
          borderRadius: 999,
          bgcolor: 'background.paper',
          border: `1px solid ${tokenNeutral.main}`,
          color: tokenText.secondary,
          cursor: 'grab',
          boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
          '&:active': { cursor: 'grabbing' },
          '&:hover': { color: tokenBrand.main, borderColor: tokenBrand.light },
        }}
        aria-label={`Drag ${WIDGET_META[widgetId].title}`}
        title="Drag to reposition"
      >
        <GripVertical size={12} aria-hidden />
        <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          Move
        </Typography>
      </Box>
      <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>{children}</Box>
    </Box>
  );
}

/**
 * Logistics Control Tower V2 — Active Decision System.
 * Operator View / Atlas AI aesthetic with draggable + resizable widgets.
 */
export default function LogisticsControlTowerV2Page() {
  const { themeMode } = useThemeMode();
  const [toast, setToast] = useState<string | null>(null);
  const [layouts, setLayouts] = useState<Record<string, LayoutItem[]>>(readStoredLayouts);
  const [activeBreakpoint, setActiveBreakpoint] = useState('lg');
  const logoSurface = themeMode === 'dark' ? 'onDark' : 'onLight';

  const persistLayouts = useCallback((next: Record<string, LayoutItem[]>) => {
    setLayouts(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(next));
    }
  }, []);

  const commitBreakpointLayout = useCallback(
    (layout: unknown) => {
      const nextBreakpointLayout = normalizeLayout(layout);
      if (nextBreakpointLayout.length === 0) return;
      persistLayouts({
        ...layouts,
        [activeBreakpoint]: nextBreakpointLayout,
      });
    },
    [activeBreakpoint, layouts, persistLayouts],
  );

  const handleResetLayout = () => {
    persistLayouts(structuredClone(DEFAULT_LAYOUTS));
    setToast('Widget layout restored to default arrangement.');
  };

  const handleGlobalReset = () => {
    const confirmed = window.confirm(
      'Reset Demo Data?\n\nThis clears Inside Logistics demo localStorage and reloads the Happy Path seed. It does not clear edition or auth.',
    );
    if (!confirmed) return;
    resetLogisticsDemoData();
  };

  const widgetNodes = useMemo(
    () => ({
      decision_queue: (
        <CtV2WidgetFrame widgetId="decision_queue">
          <PrioritizedDecisionQueue onResolved={setToast} />
        </CtV2WidgetFrame>
      ),
      atlas_ai: (
        <CtV2WidgetFrame widgetId="atlas_ai">
          <AtlasAiPrescriptivePanel onToast={setToast} />
        </CtV2WidgetFrame>
      ),
      spacex_gating: (
        <CtV2WidgetFrame widgetId="spacex_gating">
          <SpaceXShippingGatingConsole onToast={setToast} />
        </CtV2WidgetFrame>
      ),
      inbound_sla: (
        <CtV2WidgetFrame widgetId="inbound_sla">
          <InboundSlaChartWidget />
        </CtV2WidgetFrame>
      ),
      sterilization_timeline: (
        <CtV2WidgetFrame widgetId="sterilization_timeline">
          <SterilizationLoadsTimelineWidget />
        </CtV2WidgetFrame>
      ),
    }),
    [],
  );

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        backgroundImage: workstationVisuals.pageBackground,
        height: '100%',
        minHeight: 0,
        color: tokenText.primary,
        overflow: 'auto',
        p: { xs: 1.5, md: 2 },
        display: 'flex',
        flexDirection: 'column',
        fontFamily: workstationVisuals.fontFamily,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          p: { xs: 1.4, md: 1.75 },
          gap: 2,
          flexShrink: 0,
          borderRadius: 2.2,
          bgcolor: 'background.paper',
          border: workstationVisuals.shellBorder,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', minWidth: 0 }}>
          <BdLogo surface={logoSurface} height={28} alt="BD" />
          <Box sx={{ minWidth: 0 }}>
            <Typography component="p" sx={{ ...ctV2Type.eyebrow, color: tokenBrand.dark }}>
              Logistics · Decision Cockpit
            </Typography>
            <Typography component="h1" sx={{ ...ctV2Type.pageTitle, color: workstationVisuals.tierTextHeading, mt: 0.35 }}>
              Logistics Control Tower V2
            </Typography>
            <Typography sx={{ ...ctV2Type.pageSubtitle, color: tokenText.secondary, mt: 0.35 }}>
              Drag widgets to rearrange · resize from corners · layout saved for this browser
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={handleResetLayout}
            startIcon={<LayoutTemplate size={14} aria-hidden />}
            sx={{
              height: 36,
              fontSize: 12,
              fontWeight: 800,
              borderRadius: 999,
              borderColor: tokenBrand.light,
              color: tokenBrand.main,
              fontFamily: workstationVisuals.fontFamily,
              textTransform: 'none',
              px: 1.8,
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main },
            }}
          >
            Reset Layout
          </Button>
          <Button
            variant="outlined"
            onClick={handleGlobalReset}
            startIcon={<RotateCcw size={14} aria-hidden />}
            sx={{
              height: 36,
              fontSize: 12,
              fontWeight: 800,
              borderRadius: 999,
              borderColor: tokenError.light,
              color: tokenError.dark,
              fontFamily: workstationVisuals.fontFamily,
              textTransform: 'none',
              px: 1.8,
              bgcolor: 'background.paper',
              '&:hover': { bgcolor: tokenError.softBg, borderColor: tokenError.main },
            }}
          >
            Reset Demo Data
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          width: '100%',
          pb: 2,
          '& .react-grid-layout': {
            minHeight: 160,
          },
          '& .react-grid-item': {
            transition: 'transform 180ms ease',
          },
          '& .react-grid-item.react-grid-placeholder': {
            backgroundColor: 'rgba(4, 78, 215, 0.10)',
            border: '1px dashed rgba(4, 78, 215, 0.35)',
            borderRadius: 2.6,
          },
          '& .react-resizable-handle': {
            opacity: 0.55,
            zIndex: 4,
          },
          '& .react-grid-item:hover .react-resizable-handle': {
            opacity: 1,
          },
          '& .react-resizable-handle::after': {
            borderColor: 'var(--token-brand-main) !important',
          },
        }}
      >
        <ResponsiveGridLayout
          key="logistics-ct-v2-grid"
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
          draggableHandle={`.${DRAG_HANDLE_CLASS}`}
          compactType="vertical"
          preventCollision={false}
          useCSSTransforms
          onBreakpointChange={(bp: string) => setActiveBreakpoint(bp)}
          onDragStop={(layout: unknown) => commitBreakpointLayout(layout)}
          onResizeStop={(layout: unknown) => commitBreakpointLayout(layout)}
        >
          {(Object.keys(widgetNodes) as CtV2WidgetId[]).map((widgetId) => (
            <div key={widgetId} style={{ height: '100%' }}>
              {widgetNodes[widgetId]}
            </div>
          ))}
        </ResponsiveGridLayout>
      </Box>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity="success"
          variant="filled"
          sx={{
            fontFamily: workstationVisuals.fontFamily,
            fontWeight: 700,
            bgcolor: tokenSuccess.main,
            color: tokenCommon.white,
          }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
