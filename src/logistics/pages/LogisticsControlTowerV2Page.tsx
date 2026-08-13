import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Box, Button, Paper, Snackbar, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ArrowLeft, LayoutDashboard, LayoutTemplate, Package, RotateCcw, Sparkles, Truck, Warehouse } from 'lucide-react';
import BdLogo from '../../common/components/BdLogo';
import { useAuthContext } from '../../auth/contexts/AuthContext';
import { useThemeMode } from '../../common/contexts/ThemeModeContext';
import { CtV2WidgetFrame } from '../ctV2/CtV2WidgetFrame';
import { CtV2GridLayout, resetCtV2Layouts } from '../ctV2/CtV2GridLayout';
import { CtV2NavProvider, type CtV2View } from '../ctV2/CtV2NavContext';
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
  { value: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} aria-hidden /> },
  { value: 'receiving', label: 'Receiving', icon: <Truck size={14} aria-hidden /> },
  { value: 'wip', label: 'WIP', icon: <Warehouse size={14} aria-hidden /> },
  { value: 'outbound', label: 'Outbound', icon: <Package size={14} aria-hidden /> },
];

/**
 * Logistics Control Tower V2 — Overview, Dashboard, and L2 area views.
 */
export default function LogisticsControlTowerV2Page() {
  const { themeMode } = useThemeMode();
  const { loginEmail, isAuthenticated } = useAuthContext();
  const [view, setView] = useState<CtV2View>('overview');
  const [toast, setToast] = useState<string | null>(null);
  const [resetKeys, setResetKeys] = useState<Record<CtV2View, number>>({
    overview: 0,
    dashboard: 0,
    receiving: 0,
    wip: 0,
    outbound: 0,
  });
  const logoSurface = themeMode === 'dark' ? 'onDark' : 'onLight';
  const copy = VIEW_COPY[view];
  const isAreaView = view === 'receiving' || view === 'wip' || view === 'outbound';
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
    <CtV2NavProvider view={view} setView={setView}>
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
                  {copy.eyebrow}
                </Typography>
                <Typography component="h1" sx={{ ...ctV2Type.pageTitle, color: workstationVisuals.tierTextHeading, mt: 0.35 }}>
                  {copy.title}
                </Typography>
                <Typography sx={{ ...ctV2Type.pageSubtitle, color: tokenText.secondary, mt: 0.35 }}>
                  {copy.subtitle}
                </Typography>
              </Box>
            </Box>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
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
            sx={toggleSx}
          >
            {NAV_ITEMS.map((item) => (
              <ToggleButton key={item.value} value={item.value} aria-label={item.label}>
                {item.icon}
                {item.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
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
  );
}
