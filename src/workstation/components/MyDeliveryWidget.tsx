import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Box, Button, IconButton, Paper, Portal, Typography } from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Build as BuildIcon,
  OpenInFull as OpenInFullIcon,
  PauseRounded as PauseIcon,
  Search as SearchIcon,
  Send as SendIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  deliveryNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';
import WidgetLetterBadge from './WidgetLetterBadge';
import WidgetBreakdownControls from './WidgetBreakdownControls';
import {buildMonthDayLabels, reorderCalendarYearToTierYear} from './tierChartMonths';
import OeeModuleDrilldown, { type OeeModuleView } from './OEEProductionHour';

type DeliveryChartType = 'bars' | 'lines';
type DeliveryPeriod = 'Hourly' | 'Daily' | 'Monthly';
type DeliveryShift = 'All' | 'Shift A' | 'Shift B' | 'Shift C';
type DeliveryDashboardTimeframe = 'Today' | 'Yesterday' | 'Last 7 days' | 'Last 30 days';
type DeliveryBreakdownMode = 'line' | 'department';
type DeliveryView = 'Production Output' | 'OEE';

type DeliveryBreakdownRow = {
  delta: string;
  name: string;
  tone: string;
  trend: number[];
  value: string;
};

type DeliveryViewConfig = {
  accent: string;
  breakdownTitle: string;
  chartTitle: string;
  departments: DeliveryBreakdownRow[];
  delta: string;
  label: string;
  lines: DeliveryBreakdownRow[];
  max: number;
  target: number;
  targetLabel: string;
  title: DeliveryView;
  value: string;
};

const deliveryPeriodLabels: Record<DeliveryPeriod, string> = {
  Hourly: 'H',
  Daily: 'D',
  Monthly: 'M',
};

const productionOutputHourlySeries = [
  28, 30, 34, 29, 24, 24, 23, 31, 38, 32, 59, 59, 59, 58, 66, 72, 68, 66, 58, 43, 67, 69, 73, 28, 29,
];

const productionOutputHourlyLabels = ['00', '', '', '03', '', '', '06', '', '', '09', '', '', '12', '', '', '03', '', '', '06', '', '', '09', '', '', '00'];
const oeeHourlySeries = [81, 78, 75, 68, 63, 73, 86, 94, 65];
const oeeHourlyLabels = ['00', '03', '06', '09', '12', '03', '06', '09', '00'];

const deliveryShiftFactors: Record<DeliveryShift, number> = {
  All: 1,
  'Shift A': 0.96,
  'Shift B': 1,
  'Shift C': 0.93,
};

const deliveryTimeframePeriodMap: Record<DeliveryDashboardTimeframe, DeliveryPeriod> = {
  Today: 'Hourly',
  Yesterday: 'Hourly',
  'Last 7 days': 'Daily',
  'Last 30 days': 'Monthly',
};

const productionOutputSeriesMap: Record<DeliveryPeriod, Array<{ alert?: boolean; label: string; value: number }>> = {
  Hourly: productionOutputHourlySeries.map((value, index) => ({
    alert: index === 19,
    label: productionOutputHourlyLabels[index],
    value,
  })),
  Daily: [
    { label: 'Mon', value: 61 },
    { label: 'Tue', value: 64 },
    { label: 'Wed', value: 62 },
    { label: 'Thu', value: 68 },
    { label: 'Fri', value: 57 },
    { label: 'Sat', value: 72 },
    { label: 'Sun', value: 69 },
  ],
  Monthly: [
    ...buildMonthDayLabels(12).map((label, index) => ({
      label,
      value: reorderCalendarYearToTierYear([58, 61, 64, 62, 66, 70, 68, 71, 65, 56, 59, 63])[index],
    })),
  ],
};

const oeeSeriesMap: Record<DeliveryPeriod, Array<{ label: string; value: number }>> = {
  Hourly: oeeHourlySeries.map((value, index) => ({
    label: oeeHourlyLabels[index],
    value,
  })),
  Daily: [
    { label: 'Mon', value: 89 },
    { label: 'Tue', value: 93 },
    { label: 'Wed', value: 91 },
    { label: 'Thu', value: 95 },
    { label: 'Fri', value: 87 },
    { label: 'Sat', value: 98 },
    { label: 'Sun', value: 96 },
  ],
  Monthly: [
    ...buildMonthDayLabels(12).map((label, index) => ({
      label,
      value: reorderCalendarYearToTierYear([88, 91, 94, 90, 96, 98, 92, 95, 93, 87, 89, 91])[index],
    })),
  ],
};

const deliveryViews: Record<DeliveryView, DeliveryViewConfig> = {
  'Production Output': {
    accent: tokenBrand.main,
    breakdownTitle: 'Production Output',
    chartTitle: 'Production',
    departments: [
      { name: 'Assembly', value: '128k', delta: '+7k', tone: tokenSuccess.darker, trend: [102, 108, 110, 112, 116, 119, 123, 128] },
      { name: 'Molding', value: '111k', delta: '-3k', tone: tokenWarning.light, trend: [118, 116, 115, 113, 112, 111, 112, 111] },
      { name: 'Maintenance', value: '76k', delta: '+4k', tone: tokenSuccess.darker, trend: [66, 68, 69, 71, 72, 74, 75, 76] },
      { name: 'Warehouse', value: '86k', delta: '-5k', tone: tokenError.main, trend: [95, 93, 91, 90, 88, 87, 86, 86] },
    ],
    delta: '+24k',
    label: 'Production Output',
    lines: [
      { name: 'Line 01', value: '104k', delta: '+8k', tone: tokenSuccess.darker, trend: [76, 80, 84, 88, 90, 94, 100, 104] },
      { name: 'Line 02', value: '98k', delta: '+5k', tone: tokenSuccess.darker, trend: [72, 77, 79, 83, 86, 90, 95, 98] },
      { name: 'Line 03', value: '86k', delta: '-2k', tone: tokenWarning.light, trend: [82, 84, 87, 89, 88, 87, 86, 86] },
      { name: 'Line 04', value: '73k', delta: '-6k', tone: tokenError.main, trend: [88, 84, 82, 79, 77, 75, 74, 73] },
    ],
    max: 100,
    target: 48,
    targetLabel: 'Target 48',
    title: 'Production Output',
    value: '361k',
  },
  OEE: {
    accent: tokenSuccess.dark,
    breakdownTitle: 'OEE',
    chartTitle: 'OEE',
    departments: [
      { name: 'Assembly', value: '89%', delta: '+3pp', tone: tokenSuccess.darker, trend: [78, 80, 82, 84, 83, 86, 88, 89] },
      { name: 'Molding', value: '76%', delta: '-2pp', tone: tokenWarning.light, trend: [80, 78, 79, 77, 76, 75, 77, 76] },
      { name: 'Maintenance', value: '81%', delta: '+1pp', tone: tokenSuccess.darker, trend: [76, 77, 78, 79, 80, 81, 81, 81] },
      { name: 'Warehouse', value: '71%', delta: '-5pp', tone: tokenError.main, trend: [78, 75, 73, 72, 70, 69, 72, 71] },
    ],
    delta: '+2pp',
    label: 'OEE',
    lines: [
      { name: 'Line 01', value: '92%', delta: '+5pp', tone: tokenSuccess.darker, trend: [76, 84, 80, 86, 82, 88, 83, 91] },
      { name: 'Line 02', value: '88%', delta: '+3pp', tone: tokenSuccess.darker, trend: [72, 80, 74, 82, 70, 84, 76, 86] },
      { name: 'Line 03', value: '78%', delta: '-2pp', tone: tokenWarning.light, trend: [78, 72, 79, 76, 80, 69, 74, 72] },
      { name: 'Line 04', value: '72%', delta: '-4pp', tone: tokenError.main, trend: [74, 66, 70, 62, 68, 60, 69, 64] },
    ],
    max: 110,
    target: 70,
    targetLabel: 'vs Target (70%)',
    title: 'OEE',
    value: '85%',
  },
};

type MyDeliveryWidgetProps = {
  breakdownBy?: DeliveryBreakdownMode;
  dashboardShift?: DeliveryShift;
  dashboardTimeframe?: DeliveryDashboardTimeframe;
  onExpand?: () => void;
  onOpenProductionDelivery?: () => void;
  onBreakdownByChange?: (mode: DeliveryBreakdownMode) => void;
  onShowBreakdownChange?: (show: boolean) => void;
  showBreakdown?: boolean;
  showCurrentOrderCard?: boolean;
  tierOverviewLabel?: string;
  overviewItemPrefix?: string;
  enableLineOverviewDrilldown?: boolean;
  chartType?: DeliveryChartType;
  onChartTypeChange?: (type: DeliveryChartType) => void;
};

export default function MyDeliveryWidget({
  breakdownBy = 'line',
  dashboardShift,
  dashboardTimeframe,
  onExpand,
  onBreakdownByChange,
  onShowBreakdownChange,
  showBreakdown = true,
  showCurrentOrderCard = true,
  tierOverviewLabel,
  overviewItemPrefix,
  enableLineOverviewDrilldown = false,
  chartType: propChartType = 'bars',
}: MyDeliveryWidgetProps) {
  const chartType = propChartType;
  const [period, setPeriod] = useState<DeliveryPeriod>('Hourly');
  const shift = dashboardShift ?? 'All';
  const [view, setView] = useState<DeliveryView>(chartType === 'lines' ? 'OEE' : 'Production Output');
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const [isLineOverviewOpen, setIsLineOverviewOpen] = useState(false);
  const [isOeeModuleOpen, setIsOeeModuleOpen] = useState(false);
  const [oeeModuleView, setOeeModuleView] = useState<OeeModuleView>('timeline');
  const notifications = useWidgetNotifications(deliveryNotificationConfig);
  const active = deliveryViews[view];
  const breakdownRows = breakdownBy === 'line' ? active.lines : active.departments;
  const chartSeries = view === 'Production Output' ? productionOutputSeriesMap : oeeSeriesMap;
  const chartData = useMemo(
    () => chartSeries[period].map((item) => ({ ...item, value: Math.round(item.value * deliveryShiftFactors[shift]) })),
    [chartSeries, period, shift],
  );

  useEffect(() => {
    if (isCarouselPaused) return undefined;

    const rotateId = window.setInterval(() => {
      setView((currentView) => currentView === 'Production Output' ? 'OEE' : 'Production Output');
    }, 5500);

    return () => window.clearInterval(rotateId);
  }, [isCarouselPaused]);

  useEffect(() => {
    if (dashboardTimeframe) {
      setPeriod(deliveryTimeframePeriodMap[dashboardTimeframe]);
    }
  }, [dashboardTimeframe]);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        p: 'clamp(10px, 2cqw, 16px)',
        borderRadius: 1.8,
        bgcolor: tokenCommon.white,
        border: `1px solid ${tokenNeutral.main}`,
        boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.04)',
        overflow: 'hidden',
        containerType: 'inline-size',
        display: 'grid',
        gridTemplateRows: showCurrentOrderCard ? 'auto minmax(78px, auto) auto minmax(0, 1fr)' : 'auto auto minmax(0, 1fr)',
        gap: 'clamp(9px, 2.2cqw, 12px)',
        '@container (max-width: 300px)': {
          gridTemplateRows: showCurrentOrderCard ? 'auto minmax(78px, auto) auto minmax(0, 1fr)' : 'auto auto minmax(0, 1fr)',
          gap: 1,
          '& .delivery-header': {
            alignItems: 'flex-start',
          },
          '& .delivery-header-actions': {
            gap: 0.2,
          },
          '& .delivery-line-row': {
            gridTemplateColumns: 'minmax(0, 68px) minmax(0, 46px) minmax(0, 42px) minmax(0, 1fr)',
            gap: 0.55,
          },
          '& .delivery-order-title': {
            fontSize: 11.5,
          },
        },
        '@container (max-width: 240px)': {
          '& .delivery-header': {
            flexWrap: 'wrap',
          },
          '& .delivery-summary-card': {
            px: 1,
          },
          '& .delivery-line-row': {
            gridTemplateColumns: 'minmax(0, 62px) minmax(0, 42px) minmax(0, 40px) minmax(0, 1fr)',
            gap: 0.45,
          },
          '& .delivery-line-text': {
            fontSize: 10.5,
          },
        },
        '@container (max-width: 210px)': {
          gridTemplateRows: 'auto auto auto minmax(0, 1fr)',
          '& .delivery-title': {
            fontSize: 16,
          },
          '& .delivery-kpi-grid': {
            gridTemplateColumns: '1fr',
          },
          '& .delivery-line-row': {
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gridTemplateAreas: '"name value" "delta delta" "trend trend"',
            gap: 0.3,
            paddingBlock: 6,
          },
          '& .delivery-line-name': {
            gridArea: 'name',
          },
          '& .delivery-line-value': {
            gridArea: 'value',
            justifySelf: 'end',
          },
          '& .delivery-line-delta': {
            gridArea: 'delta',
          },
          '& .delivery-line-trend': {
            gridArea: 'trend',
          },
        },
      }}
    >
      <Box className="delivery-header" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 3cqw, 16px)', minWidth: 0 }}>
          <Box sx={{ flexShrink: 0 }}>
            <WidgetLetterBadge letter="D" defaultTone="green" />
          </Box>
          <Typography className="delivery-title" sx={{ fontSize: 'clamp(16px, 3.4cqw, 20px)', color: workstationVisuals.textPrimary, fontWeight: 800, fontFamily: workstationVisuals.fontFamily, lineHeight: 1 }}>
            Delivery
          </Typography>
        </Box>
        <Box className="delivery-header-actions" sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
          <AutoAwesomeIcon sx={{ fontSize: 'clamp(17px, 4cqw, 21px)', color: tokenNeutral.main }} />
          <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={28} />
          <IconButton size="small" onClick={onExpand} sx={{ width: 28, height: 28, color: tokenBrand.main }}>
            <OpenInFullIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {showCurrentOrderCard ? (
        <Paper elevation={0} sx={{ px: 1.55, py: 1.1, minWidth: 0, borderRadius: 1.4, border: 'none', bgcolor: tokenNeutral.lighter }}>
          <Typography sx={{ fontSize: 12, color: workstationVisuals.tierTextLabel, fontWeight: 450, lineHeight: 1 }}>PO 125854021</Typography>
          <Typography className="delivery-order-title" sx={{ fontSize: 20, color: workstationVisuals.textPrimary, fontWeight: 450, mt: 0.25, lineHeight: 1.18 }} noWrap>
            Nexiva 18 GA x 1 1/4 I...
          </Typography>
          <Box sx={{ height: 6, mt: 1.15, borderRadius: 999, bgcolor: tokenNeutral.darker, overflow: 'hidden', display: 'flex' }}>
            <Box sx={{ height: '100%', width: '58%', bgcolor: tokenSuccess.dark }} />
            <Box sx={{ height: '100%', width: '10%', bgcolor: tokenError.light }} />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mt: 0.35, gap: 1 }}>
            <Typography sx={{ fontSize: 16, color: workstationVisuals.textPrimary, fontWeight: 400, lineHeight: 1 }}>401k of 662k Delivered</Typography>
            <Typography sx={{ fontSize: 18, color: tokenError.light, fontWeight: 400, lineHeight: 1 }}>-44k</Typography>
          </Box>
        </Paper>
      ) : null}

      <Box className="delivery-kpi-grid" sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0.85 }}>
        <Box sx={{minWidth: 0}}>
          <DeliverySummaryCard view={view} onClick={onExpand} />
          <CarouselControls
            activeView={view}
            isPaused={isCarouselPaused}
            onPauseToggle={() => setIsCarouselPaused((current) => !current)}
            onSelect={(nextView) => {
              setView(nextView);
              setIsCarouselPaused(true);
            }}
          />
        </Box>
      </Box>

      <Box sx={{ minWidth: 0, minHeight: 0, display: 'grid', gridTemplateRows: 'auto auto auto auto', alignContent: 'start', overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            mt: enableLineOverviewDrilldown ? 0.6 : 1.2,
            mb: 0.2,
          }}
        >
          <Typography sx={{ fontSize: 15, color: workstationVisuals.tierTextHeading, fontWeight: 850, lineHeight: 1 }}>{active.chartTitle}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
            {(['Hourly', 'Daily', 'Monthly'] as DeliveryPeriod[]).map((item) => (
              <DeliveryPill key={item} active={period === item} label={deliveryPeriodLabels[item]} onClick={() => setPeriod(item)} />
            ))}
            <IconButton size="small" onClick={onExpand} sx={{width: 18, height: 18, ml: 0.15, color: tokenBrand.main}}>
              <OpenInFullIcon sx={{fontSize: 14}} />
            </IconButton>
          </Box>
        </Box>

        <Box
          onClick={() => setIsOeeModuleOpen(true)}
          sx={{
            height: 'clamp(126px, 31cqw, 154px)',
            alignSelf: 'start',
            mt: 0.65,
            mb: -0.15,
            minWidth: 0,
            minHeight: 0,
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            cursor: 'pointer',
          }}
        >
          <DeliveryChart
            data={chartData}
            max={view === 'OEE' ? 100 : active.max}
            min={view === 'OEE' ? 50 : 0}
            target={active.target}
            type={view === 'Production Output' ? 'bars' : 'lines'}
          />
        </Box>
        <CarouselControls
          activeView={view}
          isPaused={isCarouselPaused}
          onPauseToggle={() => setIsCarouselPaused((current) => !current)}
          onSelect={(nextView) => {
            setView(nextView);
            setIsCarouselPaused(true);
          }}
        />

        {showBreakdown ? (
          <Box
            onClick={enableLineOverviewDrilldown ? () => setIsLineOverviewOpen(true) : undefined}
            sx={{
              minWidth: 0,
              minHeight: 0,
              overflow: 'hidden',
              mt: 0.7,
              cursor: enableLineOverviewDrilldown ? 'pointer' : 'default',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.8, mb: 0.55, borderTop: `1px solid ${tokenNeutral.main}`, pt: 0.75 }}>
              <Typography sx={{ fontSize: 11, color: workstationVisuals.tierTextHeading, fontWeight: 950 }}>
                {tierOverviewLabel ? tierOverviewLabel.toUpperCase() : `${active.breakdownTitle.toUpperCase()} BY ${breakdownBy === 'line' ? 'LINE' : 'DEPARTMENT'}`}
              </Typography>
              <Box
                onClick={(event) => event.stopPropagation()}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}
              >
                <Typography sx={{ fontSize: 10, color: workstationVisuals.tierTextMeta, fontWeight: 850 }}>{active.targetLabel}</Typography>
                <WidgetBreakdownControls
                  breakdownBy={breakdownBy}
                  onBreakdownByChange={(mode) => onBreakdownByChange?.(mode)}
                  onShowBreakdownChange={(show) => onShowBreakdownChange?.(show)}
                  showBreakdown={showBreakdown}
                />
              </Box>
            </Box>
            {breakdownRows.map((line, index) => (
              <DeliveryLineRow key={line.name} {...line} name={overviewItemPrefix ? `${overviewItemPrefix} ${index + 1}` : line.name} />
            ))}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.7, borderTop: `1px solid ${tokenNeutral.main}`, pt: 0.75 }}>
            <WidgetBreakdownControls
              breakdownBy={breakdownBy}
              onBreakdownByChange={(mode) => onBreakdownByChange?.(mode)}
              onShowBreakdownChange={(show) => onShowBreakdownChange?.(show)}
              showBreakdown={showBreakdown}
            />
          </Box>
        )}
      </Box>

      <WidgetNotificationsDialog
        active={notifications.active}
        config={deliveryNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
      {isLineOverviewOpen ? (
        <Portal>
          <DeliveryLineOverviewDrilldown
            itemLabel={overviewItemPrefix ?? 'Line'}
            overviewLabel={tierOverviewLabel ?? 'Line overview'}
            onClose={() => setIsLineOverviewOpen(false)}
          />
        </Portal>
      ) : null}
      {isOeeModuleOpen ? (
        <Portal>
          <OeeModuleDrilldown
            activeView={oeeModuleView}
            onClose={() => setIsOeeModuleOpen(false)}
            onViewChange={setOeeModuleView}
          />
        </Portal>
      ) : null}
    </Paper>
  );
}



const recentIssueRows = [
  {index: 1, status: 'Running', tone: tokenSuccess.dark},
  {index: 2, status: 'Running', tone: tokenSuccess.dark, warning: true},
  {index: 3, status: 'BREAKDOWN', tone: tokenError.dark, active: true},
  {index: 4, status: 'Running', tone: tokenError.dark, warning: true},
  {index: 5, status: 'Running', tone: tokenSuccess.dark},
  {index: 6, status: 'Running', tone: tokenError.dark},
  {index: 7, status: 'Running', tone: tokenSuccess.dark, warning: true},
  {index: 8, status: 'Running', tone: tokenSuccess.dark},
  {index: 9, status: 'Running', tone: tokenSuccess.dark},
];

function DeliveryLineOverviewDrilldown({
  itemLabel,
  overviewLabel,
  onClose,
}: {
  itemLabel: string;
  overviewLabel: string;
  onClose: () => void;
}) {
  const activeItemName = `${itemLabel} 3`;

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 10000, bgcolor: 'rgba(7, 11, 27, 0.72)', display: 'grid', placeItems: 'center'}}>
      <Paper
        elevation={0}
        sx={{
          width: 'min(1408px, 100vw)',
          height: 'min(714px, 100vh)',
          borderRadius: '8px',
          border: `1px solid ${workstationVisuals.textMuted}`,
          bgcolor: tokenNeutral.lightest,
          boxShadow: '0 24px 54px rgba(0, 0, 0, 0.42)',
          p: '20px 39px 38px',
          overflow: 'hidden',
        }}
      >
        <Box sx={{height: '100%', display: 'grid', gridTemplateRows: '28px minmax(0, 1fr)', gap: 1.5}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Typography sx={{fontSize: 18, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>
              <Box component="span" sx={{color: tokenNeutral.darkest}}>Delivery &gt; </Box>
              {overviewLabel}
            </Typography>
            <IconButton onClick={onClose} sx={{width: 28, height: 28, color: tokenBrand.main}}>
              <OpenInFullIcon sx={{fontSize: 20}} />
            </IconButton>
          </Box>

          <Box sx={{display: 'grid', gridTemplateColumns: '330px minmax(0, 1fr) 320px', gap: 1.2, minHeight: 0}}>
            <Paper elevation={0} sx={{border: `1px solid ${tokenNeutral.dark}`, borderRadius: '10px', bgcolor: tokenNeutral.lightest, p: 2, overflow: 'hidden'}}>
              <Typography sx={{fontSize: 16, fontWeight: 900, mb: 1.25}}>Recent Issues</Typography>
              <Box sx={{display: 'grid', gap: 1}}>
                {recentIssueRows.map((row) => (
                  <Paper
                    key={row.index}
                    elevation={0}
                    sx={{
                      height: 49,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      px: 1,
                      borderRadius: '6px',
                      border: row.active ? `2px solid ${tokenBrand.main}` : `1px solid ${tokenNeutral.dark}`,
                      bgcolor: tokenNeutral.lighter,
                      boxShadow: row.active ? '0 1px 7px rgba(34, 101, 255, 0.18)' : '0 1px 3px rgba(15, 23, 42, 0.08)',
                    }}
                  >
                    <Box sx={{width: 4, height: 18, borderRadius: 999, bgcolor: row.tone}} />
                    <Typography sx={{fontSize: 14, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>{itemLabel} {row.index}</Typography>
                    {row.warning ? <WarningIcon sx={{fontSize: 16, color: tokenWarning.dark}} /> : null}
                    <Box sx={{ml: 'auto'}}>
                      {row.active ? (
                        <Box sx={{height: 18, px: 1, borderRadius: 999, bgcolor: tokenError.dark, color: tokenCommon.white, display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 900, letterSpacing: 0.5}}>
                          BREAKDOWN
                        </Box>
                      ) : (
                        <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextMeta}}>{row.status}</Typography>
                      )}
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>

            <Paper elevation={0} sx={{border: `1px solid ${tokenNeutral.dark}`, borderRadius: '10px', bgcolor: tokenNeutral.lightest, px: 2.1, py: 2, overflow: 'hidden'}}>
              <Typography sx={{fontSize: 16, fontWeight: 900, color: workstationVisuals.tierTextHeading, mb: 2}}>{activeItemName}</Typography>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.8}}>
                <WarningIcon sx={{fontSize: 28, color: tokenError.dark}} />
                <Typography sx={{fontSize: 18, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>{itemLabel} Breakdown</Typography>
              </Box>
              <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextMeta, lineHeight: 1}}>Mechanical Failure</Typography>
              <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading, lineHeight: 1.05, maxWidth: 590, mb: 2.4}}>
                Production stopped due to conveyor motor overheating in the assembly section. Operators reported abnormal noise and intermittent conveyor speed reduction before the line shutdown occurred automatically.
              </Typography>

              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2.5}}>
                <Paper elevation={0} sx={{height: 66, borderRadius: '7px', border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenNeutral.lighter, boxShadow: '0 3px 10px rgba(23, 84, 180, 0.14)', position: 'relative', px: 1.4, py: 0.8}}>
                  <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: tokenNeutral.darkest}} />
                  <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
                    <Box>
                      <Typography sx={{fontSize: 34, lineHeight: 0.95, color: workstationVisuals.tierTextHeading, fontWeight: 400}}>45<Box component="span" sx={{fontSize: 14, ml: 0.5}}>mins</Box></Typography>
                      <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading}}>Downtime so far</Typography>
                    </Box>
                    <Box sx={{pt: 1.1, textAlign: 'right'}}>
                      <Typography sx={{fontSize: 9, color: workstationVisuals.tierTextLabel, fontWeight: 900}}>RECORD</Typography>
                      <Box sx={{display: 'inline-grid', placeItems: 'center', minWidth: 26, height: 18, mt: 0.2, borderRadius: 999, bgcolor: tokenNeutral.dark, fontSize: 10, fontWeight: 900}}>103</Box>
                    </Box>
                  </Box>
                </Paper>
                <Paper elevation={0} sx={{height: 66, borderRadius: '7px', border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenNeutral.lighter, boxShadow: '0 3px 10px rgba(23, 84, 180, 0.14)', position: 'relative', px: 1.4, py: 0.8}}>
                  <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: tokenError.dark}} />
                  <Typography sx={{fontSize: 34, lineHeight: 0.95, color: tokenError.dark, fontWeight: 800}}>2.4<Box component="span" sx={{fontSize: 14, ml: 0.4}}>k</Box></Typography>
                  <Typography sx={{fontSize: 12, color: tokenError.dark}}>Lost Units</Typography>
                </Paper>
              </Box>

              <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px 32px'}}>
                <DetailSection icon={<BuildIcon />} title="Affected Equipment" items={['Conveyor Drive Motor - Zone B', 'Product Transfer Conveyor', 'Sensor Array 3']} />
                <DetailSection icon={<BuildIcon />} title="Impact" items={['Production loss: 12,500 units', 'Changeover delayed by 30 minutes', 'Two operators reassigned during repair activity']} />
                <DetailSection icon={<SearchIcon />} title="Root Cause" body="Initial investigation identified insufficient lubrication and excessive wear on motor bearings, causing temperature increase and automatic safety shutdown." />
                <DetailSection icon={<BuildIcon />} title="Corrective Actions" items={['Maintenance replaced damaged bearings', 'Conveyor alignment verified', 'Sensor functionality retested before restart']} />
                <DetailSection icon={<BuildIcon />} title="Preventive Actions" items={['Increase preventive maintenance inspection frequency', 'Add thermal monitoring checkpoint during startup', 'Review spare part replacement intervals']} />
              </Box>
            </Paper>

            <Box sx={{display: 'grid', gridTemplateRows: '300px 1fr', gap: 1.2, minHeight: 0}}>
              <Paper elevation={0} sx={{border: `1px solid ${tokenNeutral.dark}`, borderRadius: '10px', bgcolor: tokenNeutral.lightest, px: 1.8, py: 1.6, display: 'grid', gridTemplateRows: 'auto 1fr auto'}}>
                <Typography sx={{fontSize: 16, fontWeight: 900}}>Comments</Typography>
                <Box />
                <Box sx={{height: 40, border: `1px solid ${tokenBrand.main}`, borderRadius: '10px', display: 'flex', alignItems: 'center', px: 1.3, color: tokenInfo.darkest, fontSize: 16}}>
                  Leave a Comment
                  <SendIcon sx={{ml: 'auto', fontSize: 30, color: tokenBrand.main}} />
                </Box>
              </Paper>
              <Paper elevation={0} sx={{border: `1px solid ${tokenNeutral.dark}`, borderRadius: '10px', bgcolor: tokenNeutral.lightest, px: 1.8, py: 1.5}}>
                <Box sx={{display: 'flex', alignItems: 'center', mb: 1.2}}>
                  <Typography sx={{fontSize: 18, mr: 0.4, color: tokenWarning.dark, fontWeight: 900}}>✦</Typography>
                  <Typography sx={{fontSize: 16, color: tokenBrand.main, fontWeight: 900}}>BLU.AI INSIGHTS</Typography>
                  <OpenInFullIcon sx={{fontSize: 19, color: tokenBrand.main, ml: 'auto'}} />
                </Box>
                <Paper elevation={0} sx={{height: 66, px: 1.25, py: 1, borderRadius: '10px', border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenNeutral.lighter}}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                    <WarningIcon sx={{fontSize: 16, color: tokenError.dark}} />
                    <Typography sx={{fontSize: 16, fontWeight: 900, color: workstationVisuals.tierTextHeading, lineHeight: 1}}>Critical Bottleneck</Typography>
                  </Box>
                  <Typography sx={{fontSize: 11.5, lineHeight: 1.08, color: workstationVisuals.tierTextHeading, mt: 0.35}}>
                    Zone 5A is operating at 78.3 PPM (35% below Target). This is triggering a ...
                  </Typography>
                </Paper>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

function DetailSection({
  body,
  icon,
  items,
  title,
}: {
  body?: string;
  icon: ReactNode;
  items?: string[];
  title: string;
}) {
  return (
    <Box sx={{minWidth: 0}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.4}}>
        <Box sx={{color: workstationVisuals.tierTextMeta, display: 'grid', placeItems: 'center', '& svg': {fontSize: 21}}}>{icon}</Box>
        <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading, fontWeight: 900}}>{title}</Typography>
      </Box>
      {body ? (
        <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading, lineHeight: 1.2}}>{body}</Typography>
      ) : (
        <Box component="ul" sx={{m: 0, pl: 2, color: workstationVisuals.tierTextHeading}}>
          {items?.map((item) => (
            <Typography component="li" key={item} sx={{fontSize: 12, lineHeight: 1.35}}>{item}</Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}

function DeliveryPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      sx={{
        minWidth: 0,
        width: 24,
        height: 18,
        p: 0,
        borderRadius: 999,
        color: active ? tokenCommon.white : tokenBrand.light,
        bgcolor: active ? tokenBrand.lighter : tokenCommon.white,
        border: `1px solid ${tokenBrand.lighter}`,
        fontSize: 10,
        fontWeight: 900,
        lineHeight: 1,
        '&:hover': { bgcolor: active ? tokenBrand.light : tokenNeutral.lightest },
      }}
    >
      {label}
    </Button>
  );
}

function DeliverySummaryCard({onClick, view}: {onClick?: () => void; view: DeliveryView}) {
  const isOee = view === 'OEE';

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      className="delivery-summary-card"
      sx={{
        position: 'relative',
        height: 66,
        minWidth: 0,
        pl: 1.55,
        pr: 1.15,
        py: 0.8,
        borderRadius: '6px',
        bgcolor: tokenNeutral.lighter,
        border: `1px solid ${tokenNeutral.main}`,
        boxShadow: '0 3px 10px rgba(23, 84, 180, 0.14)',
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
      }}
    >
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: isOee ? tokenError.dark : tokenSuccess.dark}} />
      <Box sx={{display: 'flex', justifyContent: 'space-between', height: '100%', gap: 1}}>
        <Box sx={{minWidth: 0}}>
          {isOee ? (
            <Typography sx={{fontSize: 33, lineHeight: 0.95, color: tokenError.dark, fontWeight: 800}}>
              85<Box component="span" sx={{fontSize: 14, ml: 0.35, fontWeight: 500}}>%</Box>
            </Typography>
          ) : (
            <Typography sx={{fontSize: 33, lineHeight: 0.95, color: workstationVisuals.tierTextHeading, fontWeight: 400}}>
              12,650<Box component="span" sx={{fontSize: 14, ml: 0.45, fontWeight: 400}}>Units</Box>
            </Typography>
          )}
          <Typography sx={{fontSize: 12, lineHeight: 1, color: isOee ? tokenError.dark : workstationVisuals.tierTextHeading, mt: 0.15}}>
            {isOee ? 'Actual OEE' : 'Total Production'}
          </Typography>
        </Box>
        <Box sx={{pt: 1.1, textAlign: 'right', flexShrink: 0}}>
          <Typography sx={{fontSize: 9, letterSpacing: 0, color: workstationVisuals.tierTextLabel, fontWeight: 700}}>TARGET</Typography>
          <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: isOee ? 34 : 50, height: 18, px: 0.55, mt: 0.15, borderRadius: 999, bgcolor: tokenNeutral.dark, color: workstationVisuals.tierTextHeading, fontSize: 10, fontWeight: 800}}>
            {isOee ? '95%' : '12,000'}
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

function CarouselControls({
  activeView,
  isPaused,
  onPauseToggle,
  onSelect,
}: {
  activeView: DeliveryView;
  isPaused: boolean;
  onPauseToggle: () => void;
  onSelect: (view: DeliveryView) => void;
}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.45, mt: 0.45, height: 12}}>
      <IconButton
        aria-label={isPaused ? 'Resume carousel' : 'Pause carousel'}
        size="small"
        onClick={onPauseToggle}
        sx={{width: 12, height: 12, p: 0, color: tokenBrand.main}}
      >
        <PauseIcon sx={{fontSize: 14}} />
      </IconButton>
      {(['OEE', 'Production Output'] as DeliveryView[]).map((item) => (
        <Box
          key={item}
          component="button"
          type="button"
          aria-label={`Show ${item}`}
          onClick={() => onSelect(item)}
          sx={{
            width: activeView === item ? 6 : 5,
            height: activeView === item ? 6 : 5,
            border: 0,
            p: 0,
            borderRadius: '50%',
            bgcolor: activeView === item ? tokenBrand.main : tokenBrand.lightest,
            cursor: 'pointer',
          }}
        />
      ))}
    </Box>
  );
}

function DeliveryChart({
  data,
  max,
  min = 0,
  target,
  type,
}: {
  data: Array<{ alert?: boolean; label: string; value: number }>;
  max: number;
  min?: number;
  target: number;
  type: DeliveryChartType;
}) {
  const width = 310;
  const height = 166;
  const left = 34;
  const right = 8;
  const top = 8;
  const bottom = 24;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const range = max - min;
  const points = data.map((item, index) => ({
    x: left + (index / Math.max(data.length - 1, 1)) * chartWidth,
    y: top + chartHeight - ((item.value - min) / range) * chartHeight,
    ...item,
  }));
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const barWidth = Math.max(5, Math.min(9, chartWidth / Math.max(data.length, 1) - 4));
  const ticks = max === 100 && min === 50 ? [100, 90, 80, 70, 60, 50] : max === 100 ? [100, 80, 60, 40, 20, 0] : [max, Math.round(max * 0.5), 0];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      {ticks.map((tick) => {
        const y = top + chartHeight - ((tick - min) / range) * chartHeight;
        return (
          <g key={tick}>
            <line x1={left} x2={width - right} y1={y} y2={y} stroke={tokenNeutral.main} />
            <text x={left - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill={workstationVisuals.textMuted}>{tick === 0 ? '00' : tick}</text>
          </g>
        );
      })}
      {points.map((point, index) => (
        <line key={`grid-${point.label}-${index}`} x1={point.x} x2={point.x} y1={top} y2={top + chartHeight} stroke={tokenNeutral.lighter} />
      ))}
      <line x1={left} x2={width - right} y1={top + chartHeight - ((target - min) / range) * chartHeight} y2={top + chartHeight - ((target - min) / range) * chartHeight} stroke={tokenBrand.lighter} strokeWidth="1.2" strokeDasharray="3 3" />
      {type === 'lines' ? (
        <>
          <SegmentedLine points={points} target={target} />
          {points.map((point, index) => (
            <circle key={index} cx={point.x} cy={point.y} r="3.8" fill={tokenCommon.white} stroke={point.value < target ? tokenError.main : tokenSuccess.dark} strokeWidth="2.6" />
          ))}
        </>
      ) : (
        points.map((point, index) => {
          const barHeight = (point.value / max) * chartHeight;
          return (
            <rect
              key={index}
              x={point.x - barWidth / 2}
              y={top + chartHeight - Math.max(barHeight, 4)}
              width={barWidth}
              height={Math.max(barHeight, 4)}
              rx="3"
              fill={(point.alert ?? point.value < target) ? tokenError.main : tokenSuccess.dark}
            />
          );
        })
      )}
      {points.map((point, index) => (
        <text key={`label-${point.label}-${index}`} x={point.x} y={height - 7} textAnchor="middle" fontSize="10" fill={workstationVisuals.textMuted}>{point.label}</text>
      ))}
    </svg>
  );
}

function SegmentedLine({
  points,
  target,
}: {
  points: Array<{x: number; y: number; value: number}>;
  target: number;
}) {
  return (
    <>
      {points.slice(0, -1).map((point, index) => {
        const nextPoint = points[index + 1];
        const color = point.value < target || nextPoint.value < target ? tokenError.main : tokenSuccess.dark;
        return (
          <line
            key={`${point.x}-${nextPoint.x}`}
            x1={point.x}
            x2={nextPoint.x}
            y1={point.y}
            y2={nextPoint.y}
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
          />
        );
      })}
    </>
  );
}

function DeliveryLineRow({ delta, name, tone, trend, value }: DeliveryBreakdownRow) {
  return (
    <Box className="delivery-line-row" sx={{ display: 'grid', gridTemplateColumns: '84px 50px 46px minmax(0, 1fr)', alignItems: 'center', minHeight: 34, gap: 0.8, borderTop: `1px solid ${tokenNeutral.main}` }}>
      <Box className="delivery-line-name" sx={{ display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: tone }} />
        <Typography className="delivery-line-text" sx={{ fontSize: 12, color: workstationVisuals.tierTextHeading, fontWeight: 800 }} noWrap>{name}</Typography>
      </Box>
      <Typography className="delivery-line-text delivery-line-value" sx={{ fontSize: 12, color: workstationVisuals.tierTextHeading, fontWeight: 950 }}>{value}</Typography>
      <Typography className="delivery-line-text delivery-line-delta" sx={{ fontSize: 11, color: delta.startsWith('+') ? tokenSuccess.darker : tokenError.main, fontWeight: 850 }}>{delta}</Typography>
      <Box className="delivery-line-trend" sx={{ minWidth: 0 }}>
        <DeliverySparkline values={trend} color={tone} />
      </Box>
    </Box>
  );
}

function DeliverySparkline({ color, values }: { color: string; values: number[] }) {
  const width = 84;
  const height = 24;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * width;
    const y = 3 + (1 - (value - min) / range) * (height - 6);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="24" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
