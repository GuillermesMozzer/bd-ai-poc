import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Box, Button, Paper, Snackbar, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { LayoutDashboard, LayoutTemplate, RotateCcw, Sparkles } from 'lucide-react';
import BdLogo from '../../common/components/BdLogo';
import { useThemeMode } from '../../common/contexts/ThemeModeContext';
import { CtV2WidgetFrame } from '../ctV2/CtV2WidgetFrame';
import { CtV2GridLayout, type CtV2LayoutItem, resetCtV2Layouts } from '../ctV2/CtV2GridLayout';
import { PrioritizedDecisionQueue } from '../widgets/PrioritizedDecisionQueue';
import { SpaceXShippingGatingConsole } from '../widgets/SpaceXShippingGatingConsole';
import { SterilizationLoadsTimelineWidget } from '../widgets/SterilizationLoadsTimelineWidget';
import { InboundSlaChartWidget } from '../widgets/InboundSlaChartWidget';
import { AtlasAiPrescriptivePanel } from '../widgets/AtlasAiPrescriptivePanel';
import {
  CT_V2_DASHBOARD_WIDGET_IDS,
  CT_V2_DASHBOARD_WIDGET_TITLES,
  renderCtV2DashboardWidget,
  type CtV2DashboardWidgetId,
} from '../widgets/CtV2DashboardWidgets';
import { resetLogisticsDemoData } from '../data/reactiveLogisticsDemo';
import {
  ctV2Type,
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenText,
  tokenSuccess,
  workstationVisuals,
} from '../ctV2Theme';

type CtV2View = 'overview' | 'dashboard';

const OVERVIEW_LAYOUT_KEY = 'bd-logistics-ct-v2-layout-v1';
const DASHBOARD_LAYOUT_KEY = 'bd-logistics-ct-v2-dashboard-layout-v1';

type OverviewWidgetId =
  | 'decision_queue'
  | 'atlas_ai'
  | 'spacex_gating'
  | 'inbound_sla'
  | 'sterilization_timeline';

const OVERVIEW_WIDGET_TITLES: Record<OverviewWidgetId, string> = {
  decision_queue: 'Decision Queue',
  atlas_ai: 'ATLAS.AI',
  spacex_gating: 'SpaceX Gating',
  inbound_sla: 'Inbound SLA',
  sterilization_timeline: 'Sterilization Timeline',
};

const OVERVIEW_DEFAULT_LG: CtV2LayoutItem[] = [
  { i: 'decision_queue', x: 0, y: 0, w: 4, h: 14, minW: 3, minH: 8 },
  { i: 'atlas_ai', x: 0, y: 14, w: 4, h: 12, minW: 3, minH: 8 },
  { i: 'spacex_gating', x: 4, y: 0, w: 4, h: 15, minW: 3, minH: 8 },
  { i: 'inbound_sla', x: 4, y: 15, w: 4, h: 11, minW: 3, minH: 7 },
  { i: 'sterilization_timeline', x: 8, y: 0, w: 4, h: 26, minW: 3, minH: 10 },
];

const OVERVIEW_DEFAULT_LAYOUTS: Record<string, CtV2LayoutItem[]> = {
  lg: OVERVIEW_DEFAULT_LG,
  md: OVERVIEW_DEFAULT_LG,
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

const DASHBOARD_DEFAULT_LG: CtV2LayoutItem[] = [
  { i: 'global_alert', x: 0, y: 0, w: 12, h: 4, minW: 4, minH: 3 },
  { i: 'executive_kpis', x: 0, y: 4, w: 4, h: 16, minW: 3, minH: 10 },
  { i: 'macroflow_status', x: 4, y: 4, w: 5, h: 16, minW: 3, minH: 10 },
  { i: 'area_towers', x: 9, y: 4, w: 3, h: 8, minW: 2, minH: 6 },
  { i: 'exception_pulse', x: 9, y: 12, w: 3, h: 8, minW: 2, minH: 6 },
  { i: 'ai_site_summary', x: 0, y: 20, w: 4, h: 6, minW: 3, minH: 4 },
  { i: 'journey_heatmap', x: 4, y: 20, w: 5, h: 10, minW: 3, minH: 8 },
  { i: 'critical_materials', x: 9, y: 20, w: 3, h: 6, minW: 2, minH: 5 },
  { i: 'leadership_kpis', x: 0, y: 26, w: 4, h: 6, minW: 3, minH: 5 },
  { i: 'wip_lanes', x: 0, y: 32, w: 6, h: 12, minW: 3, minH: 8 },
  { i: 'related_shortcuts', x: 6, y: 32, w: 3, h: 6, minW: 2, minH: 5 },
  { i: 'receiving_kpis', x: 9, y: 26, w: 3, h: 6, minW: 2, minH: 5 },
  { i: 'truck_schedule', x: 6, y: 38, w: 6, h: 10, minW: 3, minH: 7 },
  { i: 'dock_status', x: 0, y: 44, w: 3, h: 8, minW: 2, minH: 6 },
  { i: 'outbound_kpis', x: 3, y: 44, w: 3, h: 8, minW: 2, minH: 6 },
  { i: 'outbound_units', x: 9, y: 32, w: 3, h: 16, minW: 2, minH: 8 },
];

const DASHBOARD_DEFAULT_LAYOUTS: Record<string, CtV2LayoutItem[]> = {
  lg: DASHBOARD_DEFAULT_LG,
  md: DASHBOARD_DEFAULT_LG,
  sm: DASHBOARD_DEFAULT_LG.map((item) => ({ ...item, w: Math.min(item.w, 8), x: item.x >= 8 ? 0 : item.x })),
  xs: CT_V2_DASHBOARD_WIDGET_IDS.map((id, index) => ({
    i: id,
    x: 0,
    y: index * 10,
    w: 4,
    h: 10,
    minW: 2,
    minH: 5,
  })),
  xxs: CT_V2_DASHBOARD_WIDGET_IDS.map((id, index) => ({
    i: id,
    x: 0,
    y: index * 10,
    w: 2,
    h: 10,
    minW: 2,
    minH: 5,
  })),
};

/**
 * Logistics Control Tower V2 — Overview (decision cockpit) + Dashboard (V1 CT widgets).
 */
export default function LogisticsControlTowerV2Page() {
  const { themeMode } = useThemeMode();
  const [view, setView] = useState<CtV2View>('overview');
  const [toast, setToast] = useState<string | null>(null);
  const [overviewResetKey, setOverviewResetKey] = useState(0);
  const [dashboardResetKey, setDashboardResetKey] = useState(0);
  const logoSurface = themeMode === 'dark' ? 'onDark' : 'onLight';

  const handleResetLayout = () => {
    if (view === 'overview') {
      resetCtV2Layouts(OVERVIEW_LAYOUT_KEY, OVERVIEW_DEFAULT_LAYOUTS);
      setOverviewResetKey((n) => n + 1);
    } else {
      resetCtV2Layouts(DASHBOARD_LAYOUT_KEY, DASHBOARD_DEFAULT_LAYOUTS);
      setDashboardResetKey((n) => n + 1);
    }
    setToast(`${view === 'overview' ? 'Overview' : 'Dashboard'} layout restored to default.`);
  };

  const handleGlobalReset = () => {
    const confirmed = window.confirm(
      'Reset Demo Data?\n\nThis clears Inside Logistics demo localStorage and reloads the Happy Path seed. It does not clear edition or auth.',
    );
    if (!confirmed) return;
    resetLogisticsDemoData();
  };

  const renderOverviewWidget = useCallback(
    (widgetId: string) => {
      const id = widgetId as OverviewWidgetId;
      const title = OVERVIEW_WIDGET_TITLES[id];
      const inner = {
        decision_queue: <PrioritizedDecisionQueue onResolved={setToast} />,
        atlas_ai: <AtlasAiPrescriptivePanel onToast={setToast} />,
        spacex_gating: <SpaceXShippingGatingConsole onToast={setToast} />,
        inbound_sla: <InboundSlaChartWidget />,
        sterilization_timeline: <SterilizationLoadsTimelineWidget />,
      }[id];
      return (
        <CtV2WidgetFrame title={title}>
          {inner}
        </CtV2WidgetFrame>
      );
    },
    [],
  );

  const renderDashboardWidget = useCallback((widgetId: string) => {
    const id = widgetId as CtV2DashboardWidgetId;
    return (
      <CtV2WidgetFrame title={CT_V2_DASHBOARD_WIDGET_TITLES[id]}>
        {renderCtV2DashboardWidget(id)}
      </CtV2WidgetFrame>
    );
  }, []);

  const overviewIds = useMemo(() => Object.keys(OVERVIEW_WIDGET_TITLES), []);
  const dashboardIds = useMemo(() => [...CT_V2_DASHBOARD_WIDGET_IDS], []);

  const viewSubtitle =
    view === 'overview'
      ? 'Active decision cockpit · drag widgets to rearrange · resize from corners'
      : 'Classic Control Tower views as draggable widgets · IN01–OB03 · receiving & outbound';

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
          flexDirection: 'column',
          gap: 1.5,
          mb: 2,
          p: { xs: 1.4, md: 1.75 },
          flexShrink: 0,
          borderRadius: 2.2,
          bgcolor: 'background.paper',
          border: workstationVisuals.shellBorder,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
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
                {viewSubtitle}
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
        </Box>

        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, next: CtV2View | null) => {
            if (next) setView(next);
          }}
          aria-label="Control Tower V2 view"
          sx={{
            alignSelf: { xs: 'stretch', md: 'flex-start' },
            '& .MuiToggleButton-root': {
              fontFamily: workstationVisuals.fontFamily,
              fontWeight: 800,
              fontSize: 12,
              textTransform: 'none',
              px: 2,
              py: 0.85,
              borderColor: 'divider',
              color: tokenText.secondary,
              gap: 0.75,
              '&.Mui-selected': {
                bgcolor: tokenBrand.softBg,
                color: tokenBrand.main,
                borderColor: tokenBrand.light,
                '&:hover': { bgcolor: tokenBrand.selectedBg },
              },
            },
          }}
        >
          <ToggleButton value="overview" aria-label="Overview">
            <Sparkles size={14} aria-hidden />
            Overview
          </ToggleButton>
          <ToggleButton value="dashboard" aria-label="Dashboard">
            <LayoutDashboard size={14} aria-hidden />
            Dashboard
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {view === 'overview' ? (
        <CtV2GridLayout
          key={`ct-v2-overview-${overviewResetKey}`}
          gridKey={`logistics-ct-v2-overview-${overviewResetKey}`}
          storageKey={OVERVIEW_LAYOUT_KEY}
          defaultLayouts={OVERVIEW_DEFAULT_LAYOUTS}
          widgetIds={overviewIds}
          renderWidget={renderOverviewWidget}
        />
      ) : (
        <CtV2GridLayout
          key={`ct-v2-dashboard-${dashboardResetKey}`}
          gridKey={`logistics-ct-v2-dashboard-${dashboardResetKey}`}
          storageKey={DASHBOARD_LAYOUT_KEY}
          defaultLayouts={DASHBOARD_DEFAULT_LAYOUTS}
          widgetIds={dashboardIds}
          renderWidget={renderDashboardWidget}
        />
      )}

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
