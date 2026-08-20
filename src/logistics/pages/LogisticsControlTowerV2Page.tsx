import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  LayoutTemplate,
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Package,
  RotateCcw,
  Sparkles,
  Truck,
  Warehouse,
} from 'lucide-react';
import BdLogo from '../../common/components/BdLogo';
import { useAuthContext } from '../../auth/contexts/AuthContext';
import { useThemeMode } from '../../common/contexts/ThemeModeContext';
import { CtV2WidgetFrame } from '../ctV2/CtV2WidgetFrame';
import { CtV2GridLayout, resetCtV2Layouts } from '../ctV2/CtV2GridLayout';
import { CtV2NavProvider, type CtV2View } from '../ctV2/CtV2NavContext';
import { CtV2FiltersProvider } from '../ctV2/CtV2FiltersContext';
import { CtV2FilterBar } from '../ctV2/CtV2FilterBar';
import { CtV2NetworkMapView } from '../networkMap/CtV2NetworkMapView';
import {
  DASHBOARD_DEFAULT_LAYOUTS,
  DASHBOARD_LAYOUT_KEY,
  OUTBOUND_DEFAULT_LAYOUTS,
  OUTBOUND_LAYOUT_KEY,
  OVERVIEW_DEFAULT_LAYOUTS,
  OVERVIEW_LAYOUT_KEY,
  RECEIVING_DEFAULT_LAYOUTS,
  RECEIVING_LAYOUT_KEY,
  WIP_DEFAULT_LAYOUTS,
  WIP_LAYOUT_KEY,
} from '../ctV2/ctV2Layouts';
import { getCtV2UserScope, normalizeCtV2UserScope } from '../ctV2/ctV2LayoutStorage';
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
import {
  CT_V2_RECEIVING_WIDGET_IDS,
  CT_V2_RECEIVING_WIDGET_TITLES,
  renderCtV2ReceivingWidget,
  type CtV2ReceivingWidgetId,
} from '../widgets/CtV2ReceivingAreaWidgets';
import {
  CT_V2_WIP_WIDGET_IDS,
  CT_V2_WIP_WIDGET_TITLES,
  renderCtV2WipWidget,
  type CtV2WipWidgetId,
} from '../widgets/CtV2WipAreaWidgets';
import {
  CT_V2_OUTBOUND_WIDGET_IDS,
  CT_V2_OUTBOUND_WIDGET_TITLES,
  renderCtV2OutboundWidget,
  type CtV2OutboundWidgetId,
} from '../widgets/CtV2OutboundAreaWidgets';
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

const VIEW_COPY: Record<CtV2View, { eyebrow: string; title: string; subtitle: string }> = {
  overview: {
    eyebrow: 'Logistics · Decision Cockpit',
    title: 'Logistics Control Tower V2',
    subtitle: 'Active decision cockpit · drag widgets to rearrange · resize from corners',
  },
  network: {
    eyebrow: '4PL · Live Network Control',
    title: 'Logistics Control Tower V2',
    subtitle: 'Mexico & US BD corridor · trucks, plants, and demands moving in real time',
  },
  dashboard: {
    eyebrow: 'Logistics · Site Dashboard',
    title: 'Logistics Control Tower V2',
    subtitle: 'Classic Control Tower views as draggable widgets · IN01–OB03',
  },
  receiving: {
    eyebrow: 'Level 2 · Area view · IN01',
    title: 'Inbound · Receiving (IN01)',
    subtitle: 'Docks, staging, inspection · ST01–ST07 · widgets match Overview layout rules',
  },
  wip: {
    eyebrow: 'Level 2 · Area view · IN02 + WIP',
    title: 'WIP Control Tower',
    subtitle: 'Inventory, aging, exceptions, transfers · same Operator View widgets',
  },
  outbound: {
    eyebrow: 'Level 2 · Area view · OB01 · OB02 · OB03',
    title: 'Sterilization / Outbound Control Tower',
    subtitle: 'Steril network and shipment readiness · ATLAS insight preserved',
  },
};

const NAV_ITEMS: { value: CtV2View; label: string; icon: React.ReactNode }[] = [
  { value: 'overview', label: 'Overview', icon: <Sparkles size={14} aria-hidden /> },
  { value: 'network', label: 'Network Map', icon: <MapIcon size={14} aria-hidden /> },
  { value: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} aria-hidden /> },
  { value: 'receiving', label: 'Receiving', icon: <Truck size={14} aria-hidden /> },
  { value: 'wip', label: 'WIP', icon: <Warehouse size={14} aria-hidden /> },
  { value: 'outbound', label: 'Outbound', icon: <Package size={14} aria-hidden /> },
];

/**
 * Logistics Control Tower V2 — Overview, Dashboard, and L2 area views.
 */
export default function LogisticsControlTowerV2Page() {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('md'));
  const { themeMode } = useThemeMode();
  const { loginEmail, isAuthenticated } = useAuthContext();
  const [view, setView] = useState<CtV2View>('overview');
  const [toast, setToast] = useState<string | null>(null);
  /** Network Map: collapse workstation chrome + ops rail so the map fills the viewport. */
  const [mapFocus, setMapFocus] = useState(false);
  const [resetKeys, setResetKeys] = useState<Record<CtV2View, number>>({
    overview: 0,
    network: 0,
    dashboard: 0,
    receiving: 0,
    wip: 0,
    outbound: 0,
  });
  const logoSurface = themeMode === 'dark' ? 'onDark' : 'onLight';
  const copy = VIEW_COPY[view];
  const isAreaView = view === 'receiving' || view === 'wip' || view === 'outbound';
  const isNetworkView = view === 'network';
  const chromeCollapsed = isNetworkView && mapFocus;

  useEffect(() => {
    if (!isNetworkView) {
      setMapFocus(false);
      return;
    }
    // Mobile / tablet: prioritize the map by collapsing chrome + ops rail upward.
    if (isCompact) setMapFocus(true);
  }, [isNetworkView, isCompact]);

  const userScope = useMemo(() => {
    if (isAuthenticated && loginEmail.trim()) {
      return normalizeCtV2UserScope(loginEmail);
    }
    return getCtV2UserScope();
  }, [isAuthenticated, loginEmail]);

  const bumpReset = (target: CtV2View) => {
    setResetKeys((prev) => ({ ...prev, [target]: prev[target] + 1 }));
  };

  const handleResetLayout = () => {
    if (view === 'network') {
      setToast('Network Map does not use a widget layout.');
      return;
    }
    if (view === 'overview') resetCtV2Layouts(OVERVIEW_LAYOUT_KEY, OVERVIEW_DEFAULT_LAYOUTS, userScope);
    if (view === 'dashboard') resetCtV2Layouts(DASHBOARD_LAYOUT_KEY, DASHBOARD_DEFAULT_LAYOUTS, userScope);
    if (view === 'receiving') resetCtV2Layouts(RECEIVING_LAYOUT_KEY, RECEIVING_DEFAULT_LAYOUTS, userScope);
    if (view === 'wip') resetCtV2Layouts(WIP_LAYOUT_KEY, WIP_DEFAULT_LAYOUTS, userScope);
    if (view === 'outbound') resetCtV2Layouts(OUTBOUND_LAYOUT_KEY, OUTBOUND_DEFAULT_LAYOUTS, userScope);
    bumpReset(view);
    setToast(`${copy.title} layout restored to default.`);
  };

  const handleGlobalReset = () => {
    const confirmed = window.confirm(
      'Reset Demo Data?\n\nThis clears Inside Logistics demo localStorage and reloads the Happy Path seed. It does not clear edition or auth.',
    );
    if (!confirmed) return;
    resetLogisticsDemoData();
  };

  const renderOverviewWidget = useCallback((widgetId: string) => {
    const id = widgetId as OverviewWidgetId;
    const inner = {
      decision_queue: <PrioritizedDecisionQueue onResolved={setToast} />,
      atlas_ai: <AtlasAiPrescriptivePanel onToast={setToast} />,
      spacex_gating: <SpaceXShippingGatingConsole onToast={setToast} />,
      inbound_sla: <InboundSlaChartWidget />,
      sterilization_timeline: <SterilizationLoadsTimelineWidget />,
    }[id];
    return <CtV2WidgetFrame title={OVERVIEW_WIDGET_TITLES[id]}>{inner}</CtV2WidgetFrame>;
  }, []);

  const renderDashboardWidget = useCallback((widgetId: string) => {
    const id = widgetId as CtV2DashboardWidgetId;
    return (
      <CtV2WidgetFrame title={CT_V2_DASHBOARD_WIDGET_TITLES[id]}>
        {renderCtV2DashboardWidget(id)}
      </CtV2WidgetFrame>
    );
  }, []);

  const renderReceivingWidget = useCallback((widgetId: string) => {
    const id = widgetId as CtV2ReceivingWidgetId;
    return (
      <CtV2WidgetFrame title={CT_V2_RECEIVING_WIDGET_TITLES[id]}>
        {renderCtV2ReceivingWidget(id)}
      </CtV2WidgetFrame>
    );
  }, []);

  const renderWipWidget = useCallback((widgetId: string) => {
    const id = widgetId as CtV2WipWidgetId;
    return (
      <CtV2WidgetFrame title={CT_V2_WIP_WIDGET_TITLES[id]}>
        {renderCtV2WipWidget(id)}
      </CtV2WidgetFrame>
    );
  }, []);

  const renderOutboundWidget = useCallback((widgetId: string) => {
    const id = widgetId as CtV2OutboundWidgetId;
    return (
      <CtV2WidgetFrame title={CT_V2_OUTBOUND_WIDGET_TITLES[id]}>
        {renderCtV2OutboundWidget(id)}
      </CtV2WidgetFrame>
    );
  }, []);

  const overviewIds = useMemo(() => Object.keys(OVERVIEW_WIDGET_TITLES), []);
  const dashboardIds = useMemo(() => [...CT_V2_DASHBOARD_WIDGET_IDS], []);
  const receivingIds = useMemo(() => [...CT_V2_RECEIVING_WIDGET_IDS], []);
  const wipIds = useMemo(() => [...CT_V2_WIP_WIDGET_IDS], []);
  const outboundIds = useMemo(() => [...CT_V2_OUTBOUND_WIDGET_IDS], []);

  const toggleSx = {
    alignSelf: { xs: 'stretch', md: 'flex-start' },
    flexWrap: 'wrap' as const,
    '& .MuiToggleButton-root': {
      fontFamily: workstationVisuals.fontFamily,
      fontWeight: 800,
      fontSize: 12,
      textTransform: 'none' as const,
      px: 1.6,
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
  };

  return (
    <CtV2FiltersProvider>
      <CtV2NavProvider view={view} setView={setView}>
      <Box
        sx={{
          bgcolor: 'background.default',
          backgroundImage: workstationVisuals.pageBackground,
          height: '100%',
          minHeight: 0,
          flex: 1,
          color: tokenText.primary,
          overflow: isNetworkView ? 'hidden' : 'auto',
          p: { xs: 1, sm: 1.5, md: 2 },
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
            gap: chromeCollapsed ? 0.75 : 1.5,
            mb: isNetworkView ? 1 : 2,
            p: chromeCollapsed ? { xs: 1, md: 1.15 } : { xs: 1.4, md: 1.75 },
            flexShrink: 0,
            borderRadius: 2.2,
            bgcolor: 'background.paper',
            border: workstationVisuals.shellBorder,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.25, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', minWidth: 0, flex: '1 1 220px' }}>
              <BdLogo surface={logoSurface} height={chromeCollapsed ? 22 : 28} alt="BD" />
              <Box sx={{ minWidth: 0 }}>
                {!chromeCollapsed ? (
                  <Typography component="p" sx={{ ...ctV2Type.eyebrow, color: tokenBrand.dark }}>
                    {copy.eyebrow}
                  </Typography>
                ) : null}
                <Typography
                  component="h1"
                  sx={{
                    ...(chromeCollapsed
                      ? { fontFamily: workstationVisuals.fontFamily, fontSize: 16, fontWeight: 850, letterSpacing: '-0.02em', lineHeight: 1.2 }
                      : ctV2Type.pageTitle),
                    color: workstationVisuals.tierTextHeading,
                    mt: chromeCollapsed ? 0 : 0.35,
                  }}
                >
                  {chromeCollapsed ? 'Network Map' : copy.title}
                </Typography>
                {!chromeCollapsed ? (
                  <Typography sx={{ ...ctV2Type.pageSubtitle, color: tokenText.secondary, mt: 0.35 }}>
                    {copy.subtitle}
                  </Typography>
                ) : null}
              </Box>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end" alignItems="center" sx={{ flex: '0 1 auto' }}>
              {isNetworkView ? (
                <Button
                  variant={mapFocus ? 'contained' : 'outlined'}
                  onClick={() => setMapFocus((v) => !v)}
                  startIcon={mapFocus ? <Maximize2 size={14} aria-hidden /> : <Minimize2 size={14} aria-hidden />}
                  aria-pressed={mapFocus}
                  aria-label={mapFocus ? 'Expand filters and navigation' : 'Collapse filters and focus map'}
                  sx={{
                    height: 36,
                    fontSize: 12,
                    fontWeight: 800,
                    borderRadius: 999,
                    borderColor: tokenBrand.light,
                    color: mapFocus ? '#fff' : tokenBrand.main,
                    bgcolor: mapFocus ? tokenBrand.main : 'background.paper',
                    fontFamily: workstationVisuals.fontFamily,
                    textTransform: 'none',
                    px: 1.8,
                    '&:hover': {
                      bgcolor: mapFocus ? tokenBrand.dark : tokenBrand.softBg,
                      borderColor: tokenBrand.main,
                    },
                  }}
                >
                  {mapFocus ? 'Show panels' : 'Focus map'}
                </Button>
              ) : null}
              {isAreaView ? (
                <Button
                  variant="outlined"
                  onClick={() => setView('dashboard')}
                  startIcon={<ArrowLeft size={14} aria-hidden />}
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
                  Back to dashboard
                </Button>
              ) : null}
              {!isNetworkView ? (
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
              ) : null}
              {!chromeCollapsed ? (
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
              ) : (
                <IconButton
                  aria-label="Reset demo data"
                  onClick={handleGlobalReset}
                  size="small"
                  sx={{
                    border: `1px solid ${tokenError.light}`,
                    color: tokenError.dark,
                    borderRadius: 999,
                    width: 36,
                    height: 36,
                  }}
                >
                  <RotateCcw size={14} aria-hidden />
                </IconButton>
              )}
            </Stack>
          </Box>

          <Collapse in={!chromeCollapsed} timeout={180} unmountOnExit>
            <Box
              sx={{
                width: '100%',
                pt: 0.25,
                borderTop: '1px solid',
                borderColor: 'divider',
              }}
            >
              <CtV2FilterBar />
            </Box>
          </Collapse>

          <Stack direction="row" spacing={0.75} alignItems="center" useFlexGap flexWrap="wrap">
            <ToggleButtonGroup
              value={view}
              exclusive
              onChange={(_, next: CtV2View | null) => {
                if (next) setView(next);
              }}
              aria-label="Control Tower V2 view"
              sx={{
                ...toggleSx,
                flex: '1 1 auto',
                '& .MuiToggleButton-root': {
                  ...toggleSx['& .MuiToggleButton-root'],
                  ...(chromeCollapsed
                    ? { px: 1.1, py: 0.55, fontSize: 11, minWidth: 0 }
                    : null),
                },
              }}
            >
              {NAV_ITEMS.map((item) => (
                <ToggleButton key={item.value} value={item.value} aria-label={item.label}>
                  {item.icon}
                  {chromeCollapsed && isCompact ? null : item.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            {isNetworkView ? (
              <IconButton
                aria-label={mapFocus ? 'Expand site filters' : 'Collapse site filters'}
                onClick={() => setMapFocus((v) => !v)}
                size="small"
                sx={{
                  border: `1px solid ${tokenBrand.light}`,
                  color: tokenBrand.main,
                  borderRadius: 1.5,
                  width: 34,
                  height: 34,
                  flexShrink: 0,
                }}
              >
                {mapFocus ? <ChevronDown size={16} aria-hidden /> : <ChevronUp size={16} aria-hidden />}
              </IconButton>
            ) : null}
          </Stack>
        </Paper>

        {view === 'overview' ? (
          <CtV2GridLayout
            key={`ct-v2-overview-${resetKeys.overview}`}
            gridKey={`logistics-ct-v2-overview-${resetKeys.overview}`}
            storageKey={OVERVIEW_LAYOUT_KEY}
            defaultLayouts={OVERVIEW_DEFAULT_LAYOUTS}
            widgetIds={overviewIds}
            renderWidget={renderOverviewWidget}
            userScope={userScope}
          />
        ) : null}
        {view === 'network' ? (
          <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <CtV2NetworkMapView onToast={setToast} railCollapsed={mapFocus} onToggleRail={() => setMapFocus((v) => !v)} />
          </Box>
        ) : null}
        {view === 'dashboard' ? (
          <CtV2GridLayout
            key={`ct-v2-dashboard-${resetKeys.dashboard}`}
            gridKey={`logistics-ct-v2-dashboard-${resetKeys.dashboard}`}
            storageKey={DASHBOARD_LAYOUT_KEY}
            defaultLayouts={DASHBOARD_DEFAULT_LAYOUTS}
            widgetIds={dashboardIds}
            renderWidget={renderDashboardWidget}
            userScope={userScope}
          />
        ) : null}
        {view === 'receiving' ? (
          <CtV2GridLayout
            key={`ct-v2-receiving-${resetKeys.receiving}`}
            gridKey={`logistics-ct-v2-receiving-${resetKeys.receiving}`}
            storageKey={RECEIVING_LAYOUT_KEY}
            defaultLayouts={RECEIVING_DEFAULT_LAYOUTS}
            widgetIds={receivingIds}
            renderWidget={renderReceivingWidget}
            userScope={userScope}
          />
        ) : null}
        {view === 'wip' ? (
          <CtV2GridLayout
            key={`ct-v2-wip-${resetKeys.wip}`}
            gridKey={`logistics-ct-v2-wip-${resetKeys.wip}`}
            storageKey={WIP_LAYOUT_KEY}
            defaultLayouts={WIP_DEFAULT_LAYOUTS}
            widgetIds={wipIds}
            renderWidget={renderWipWidget}
            userScope={userScope}
          />
        ) : null}
        {view === 'outbound' ? (
          <CtV2GridLayout
            key={`ct-v2-outbound-${resetKeys.outbound}`}
            gridKey={`logistics-ct-v2-outbound-${resetKeys.outbound}`}
            storageKey={OUTBOUND_LAYOUT_KEY}
            defaultLayouts={OUTBOUND_DEFAULT_LAYOUTS}
            widgetIds={outboundIds}
            renderWidget={renderOutboundWidget}
            userScope={userScope}
          />
        ) : null}

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
      </CtV2NavProvider>
    </CtV2FiltersProvider>
  );
}
