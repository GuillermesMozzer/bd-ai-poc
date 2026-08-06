import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import { useEffect, useMemo, useState } from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  OpenInFull as OpenInFullIcon,
  PauseRounded as PauseIcon,
} from '@mui/icons-material';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  costNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';
import WidgetLetterBadge from './WidgetLetterBadge';
import WidgetBreakdownControls from './WidgetBreakdownControls';
import {buildMonthDayLabels} from './tierChartMonths';

type CostChartType = 'bars' | 'lines';
type CostPeriod = 'Hourly' | 'Daily' | 'Monthly';
type CostShift = 'All' | 'Shift A' | 'Shift B' | 'Shift C';
type CostDashboardTimeframe = 'Today' | 'Yesterday' | 'Last 7 days' | 'Last 30 days';
type CostView = 'Scrap' | 'Downtime';
type CostSummaryCardId = 'scrap-percent' | 'scrap-units' | 'downtime-hours';
type CostBreakdownMode = 'line' | 'department';

const costPeriodLabels: Record<CostPeriod, string> = {
  Hourly: 'H',
  Daily: 'D',
  Monthly: 'M',
};

const costShiftFactors: Record<CostShift, number> = {
  All: 1,
  'Shift A': 0.82,
  'Shift B': 1,
  'Shift C': 1.18,
};

const costTimeframePeriodMap: Record<CostDashboardTimeframe, CostPeriod> = {
  Today: 'Hourly',
  Yesterday: 'Hourly',
  'Last 7 days': 'Daily',
  'Last 30 days': 'Monthly',
};

const costSummaryCards: Array<{
  accent: string;
  chartView: CostView;
  id: CostSummaryCardId;
  label: string;
  target: string;
  textColor: string;
  unit?: string;
  value: string;
}> = [
  {
    accent: tokenSuccess.dark,
    chartView: 'Scrap',
    id: 'scrap-percent',
    label: 'Total Scrap Produced',
    target: '10%',
    textColor: workstationVisuals.tierTextHeading,
    unit: '%',
    value: '9',
  },
  {
    accent: tokenSuccess.dark,
    chartView: 'Scrap',
    id: 'scrap-units',
    label: 'Total Scrap Produced',
    target: '110',
    textColor: workstationVisuals.tierTextHeading,
    unit: 'Units',
    value: '103',
  },
  {
    accent: tokenError.dark,
    chartView: 'Downtime',
    id: 'downtime-hours',
    label: 'Downtime',
    target: '75',
    textColor: tokenError.dark,
    unit: 'h',
    value: '88',
  },
];

const costViews: Record<CostView, {
  accent: string;
  departments: Array<{ delta: string; name: string; tone: string; trend: number[]; value: string }>;
  delta: string;
  label: string;
  lines: Array<{ delta: string; name: string; tone: string; trend: number[]; value: string }>;
  max: number;
  target: number;
  targetLabel: string;
  title: string;
  unit: string;
  value: string;
  values: number[];
}> = {
  Scrap: {
    accent: tokenSuccess.darker,
    departments: [
      { name: 'Molding', value: '$10.4k', delta: '-$0.8k', tone: tokenSuccess.darker, trend: [18, 16, 15, 14, 13, 12, 11, 10] },
      { name: 'Assembly', value: '$12.8k', delta: '+$0.4k', tone: tokenWarning.light, trend: [15, 17, 16, 18, 19, 18, 20, 21] },
      { name: 'Maintenance', value: '$8.1k', delta: '-$1.5k', tone: tokenSuccess.darker, trend: [14, 13, 12, 11, 10, 9, 8, 8] },
      { name: 'Warehouse', value: '$6.3k', delta: '+$0.7k', tone: tokenError.dark, trend: [7, 8, 7, 8, 9, 10, 9, 10] },
    ],
    delta: '-4k',
    label: 'Total Scrap Produced',
    lines: [
      { name: 'Line 01', value: '$8.2k', delta: '-$1.1k', tone: tokenSuccess.darker, trend: [20, 18, 16, 17, 14, 13, 12, 11] },
      { name: 'Line 02', value: '$9.8k', delta: '-$0.6k', tone: tokenSuccess.darker, trend: [18, 17, 18, 14, 15, 12, 13, 11] },
      { name: 'Line 03', value: '$11.4k', delta: '+$1.2k', tone: tokenWarning.light, trend: [10, 12, 11, 15, 14, 16, 15, 17] },
      { name: 'Line 04', value: '$14.0k', delta: '+$3.5k', tone: tokenError.dark, trend: [12, 16, 15, 19, 18, 22, 21, 24] },
    ],
    max: 50,
    target: 15,
    targetLabel: 'Budget 15%',
    title: 'Scrap',
    unit: '',
    value: '9%',
    values: [14, 15, 14, 13, 12, 12, 12, 18, 15, 9, 9, 9, 10, 16, 10, 10, 9, 19, 11, 11, 12, 13, 15],
  },
  Downtime: {
    accent: tokenWarning.dark,
    departments: [
      { name: 'Molding', value: '34 min', delta: '-4 min', tone: tokenSuccess.darker, trend: [40, 38, 36, 34, 35, 33, 32, 34] },
      { name: 'Assembly', value: '48 min', delta: '+6 min', tone: tokenWarning.light, trend: [38, 41, 44, 42, 45, 47, 48, 50] },
      { name: 'Maintenance', value: '58 min', delta: '+12 min', tone: tokenError.dark, trend: [44, 48, 46, 50, 52, 55, 57, 58] },
      { name: 'Warehouse', value: '22 min', delta: '-3 min', tone: tokenSuccess.darker, trend: [28, 27, 26, 24, 23, 22, 22, 21] },
    ],
    delta: '+28 min',
    label: 'Total Shift Downtime',
    lines: [
      { name: 'Line 01', value: '18 min', delta: '-6 min', tone: tokenSuccess.darker, trend: [24, 22, 18, 20, 16, 15, 14, 13] },
      { name: 'Line 02', value: '26 min', delta: '-2 min', tone: tokenSuccess.darker, trend: [30, 28, 24, 26, 22, 24, 21, 20] },
      { name: 'Line 03', value: '42 min', delta: '+8 min', tone: tokenWarning.light, trend: [32, 34, 35, 40, 38, 44, 41, 45] },
      { name: 'Line 04', value: '62 min', delta: '+28 min', tone: tokenError.dark, trend: [38, 44, 50, 48, 58, 52, 60, 66] },
    ],
    max: 100,
    target: 60,
    targetLabel: 'Target 60 min',
    title: 'Downtime',
    unit: '',
    value: '148 min',
    values: [24, 28, 30, 26, 22, 20, 21, 38, 45, 42, 37, 37, 36, 40, 44, 43, 42, 36, 45, 50, 44, 82, 45],
  },
};

type MyCostWidgetProps = {
  breakdownBy?: CostBreakdownMode;
  dashboardShift?: CostShift;
  dashboardTimeframe?: CostDashboardTimeframe;
  onExpand?: () => void;
  onOpenDowntimeAnalysis?: () => void;
  onBreakdownByChange?: (mode: CostBreakdownMode) => void;
  onShowBreakdownChange?: (show: boolean) => void;
  showBreakdown?: boolean;
  chartType?: CostChartType;
  onChartTypeChange?: (type: CostChartType) => void;
  stackedCharts?: boolean;
  showChartCarouselControls?: boolean;
  showStackedChartControls?: boolean;
  tierOverviewLabel?: string;
  overviewItemPrefix?: string;
  totalScrapProducedOverride?: number;
  targetOverride?: number;
  scrapValuesOverride?: number[];
};

export default function MyCostWidget({
  breakdownBy = 'line',
  dashboardShift,
  dashboardTimeframe,
  onExpand,
  onOpenDowntimeAnalysis,
  onBreakdownByChange,
  onShowBreakdownChange,
  showBreakdown = true,
  chartType: propChartType = 'bars',
  stackedCharts = false,
  showChartCarouselControls = false,
  showStackedChartControls = true,
  tierOverviewLabel,
  overviewItemPrefix,
  totalScrapProducedOverride,
  targetOverride,
  scrapValuesOverride,
}: MyCostWidgetProps) {
  const chartType = propChartType;
  const [period, setPeriod] = useState<CostPeriod>('Hourly');
  const shift = dashboardShift ?? 'All';
  const [view, setView] = useState<CostView>('Scrap');
  const [activeSummaryIndex, setActiveSummaryIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const notifications = useWidgetNotifications(costNotificationConfig);
  const effectiveCostSummaryCards = useMemo(
    () => costSummaryCards.map((card) => card.id === 'scrap-percent'
      ? {
          ...card,
          target: typeof targetOverride === 'number' ? `${targetOverride}%` : card.target,
          value: typeof totalScrapProducedOverride === 'number' ? String(totalScrapProducedOverride) : card.value,
        }
      : card),
    [targetOverride, totalScrapProducedOverride],
  );
  const effectiveCostViews = useMemo(
    () => ({
      ...costViews,
      Scrap: {
        ...costViews.Scrap,
        target: typeof targetOverride === 'number' ? targetOverride : costViews.Scrap.target,
        targetLabel: typeof targetOverride === 'number' ? `Budget ${targetOverride}%` : costViews.Scrap.targetLabel,
        value: typeof totalScrapProducedOverride === 'number' ? `${totalScrapProducedOverride}%` : costViews.Scrap.value,
        values: scrapValuesOverride?.length ? scrapValuesOverride : costViews.Scrap.values,
      },
    }),
    [scrapValuesOverride, targetOverride, totalScrapProducedOverride],
  );
  const active = effectiveCostViews[view];
  const breakdownRows = breakdownBy === 'line' ? active.lines : active.departments;
  const adjustedValues = useMemo(
    () => active.values.map((value) => Math.round(value * costShiftFactors[shift])),
    [active.values, shift],
  );

  useEffect(() => {
    if (isCarouselPaused) return undefined;

    const rotateId = window.setInterval(() => {
      setActiveSummaryIndex((currentIndex) => (currentIndex + 1) % effectiveCostSummaryCards.length);
    }, 3200);

    return () => window.clearInterval(rotateId);
  }, [effectiveCostSummaryCards.length, isCarouselPaused]);

  useEffect(() => {
    setView(effectiveCostSummaryCards[activeSummaryIndex]?.chartView ?? 'Scrap');
  }, [activeSummaryIndex, effectiveCostSummaryCards]);

  useEffect(() => {
    if (dashboardTimeframe) {
      setPeriod(costTimeframePeriodMap[dashboardTimeframe]);
    }
  }, [dashboardTimeframe]);

  const renderChartControls = () => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
      {(['Hourly', 'Daily', 'Monthly'] as CostPeriod[]).map((item) => (
        <SmallPill key={item} active={period === item} label={costPeriodLabels[item]} onClick={() => setPeriod(item)} />
      ))}
    </Box>
  );

  const renderStackedCostChart = (costView: CostView) => {
    const metric = effectiveCostViews[costView];
    const values = metric.values.map((value) => Math.round(value * costShiftFactors[shift]));

    return (
      <Box
        onClick={costView === 'Downtime' ? onOpenDowntimeAnalysis : undefined}
        sx={{
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: 'auto minmax(82px, 1fr) auto',
          overflow: 'hidden',
          cursor: costView === 'Downtime' && onOpenDowntimeAnalysis ? 'pointer' : 'default',
        }}
      >
        <Typography sx={{ fontSize: 15, color: workstationVisuals.tierTextHeading, fontWeight: 850, lineHeight: 1, mb: 0.4 }}>{metric.title}</Typography>
        <Box sx={{ minHeight: 0, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
          <CostChart
            max={metric.max}
            period={period}
            target={metric.target}
            type={chartType}
            values={values}
          />
        </Box>
        {showStackedChartControls ? (
          <CostCarouselControls
            activeView={view}
            isPaused={isCarouselPaused}
            onPauseToggle={() => setIsCarouselPaused((current) => !current)}
            onSelect={(nextView) => {
              setView(nextView);
              setIsCarouselPaused(true);
            }}
          />
        ) : null}
      </Box>
    );
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        p: 'clamp(10px, 2cqw, 16px)',
        borderRadius: 1.8,
        bgcolor: tokenCommon.white,
        border: `1px solid ${tokenNeutral.main}`,
        boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.04)',
        overflow: 'hidden',
        containerType: 'inline-size',
        display: 'grid',
        gridTemplateRows: 'auto auto minmax(0, 1fr)',
        gap: 'clamp(9px, 2.1cqw, 12px)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 3cqw, 16px)', minWidth: 0 }}>
          <WidgetLetterBadge letter="C" defaultTone="green" />
          <Typography sx={{ fontSize: 'clamp(16px, 3.4cqw, 20px)', color: workstationVisuals.textPrimary, fontWeight: 800, fontFamily: workstationVisuals.fontFamily, lineHeight: 1 }}>
            Cost
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
          <AutoAwesomeIcon sx={{ fontSize: 'clamp(17px, 4cqw, 21px)', color: tokenNeutral.main }} />
          <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={28} />
          <IconButton size="small" onClick={onExpand} sx={{ width: 28, height: 28, color: tokenBrand.main }}>
            <OpenInFullIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      <CostSummaryCarousel
        activeIndex={activeSummaryIndex}
        cards={effectiveCostSummaryCards}
        isPaused={isCarouselPaused}
        onPauseToggle={() => setIsCarouselPaused((current) => !current)}
        onSelect={(index) => {
          setActiveSummaryIndex(index);
          setIsCarouselPaused(true);
        }}
      />

      {stackedCharts ? (
        <Box sx={{ minHeight: 0, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) minmax(0, 1fr)', gap: 0.65, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
            {renderChartControls()}
          </Box>
          {renderStackedCostChart('Scrap')}
          {renderStackedCostChart('Downtime')}
        </Box>
      ) : (
      <Box sx={{ minHeight: 0, display: 'grid', gridTemplateRows: 'auto minmax(126px, 1fr) auto', alignContent: 'start', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.35 }}>
          <Typography sx={{ fontSize: 15, color: workstationVisuals.tierTextHeading, fontWeight: 850, lineHeight: 1 }}>{active.title}</Typography>
          {renderChartControls()}
        </Box>
        <Box
          onClick={view === 'Downtime' ? onOpenDowntimeAnalysis : undefined}
          sx={{
            height: 'clamp(126px, 33cqw, 160px)',
            minHeight: 0,
            display: 'grid',
            placeItems: 'center',
            overflow: 'hidden',
            pt: 0.55,
            cursor: view === 'Downtime' && onOpenDowntimeAnalysis ? 'pointer' : 'default',
          }}
        >
          <CostChart
            max={active.max}
            period={period}
            target={active.target}
            type={chartType}
            values={adjustedValues}
          />
        </Box>
        {showChartCarouselControls ? (
          <CostCarouselControls
            activeView={view}
            isPaused={isCarouselPaused}
            onPauseToggle={() => setIsCarouselPaused((current) => !current)}
            onSelect={(nextView) => {
              setView(nextView);
              setIsCarouselPaused(true);
            }}
          />
        ) : null}
        {showBreakdown ? (
          <Box sx={{ minHeight: 0, overflow: 'hidden', mt: 0.7 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.8, mb: 0.55, borderTop: `1px solid ${tokenNeutral.main}`, pt: 0.75 }}>
              <Typography sx={{ fontSize: 11, color: workstationVisuals.tierTextHeading, fontWeight: 950 }}>{tierOverviewLabel ? tierOverviewLabel.toUpperCase() : `${active.title.toUpperCase()} BY ${breakdownBy === 'line' ? 'LINE' : 'DEPARTMENT'}`}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                <Typography sx={{ fontSize: 10, color: workstationVisuals.tierTextMeta, fontWeight: 850 }}>{active.targetLabel}</Typography>
                <WidgetBreakdownControls
                  breakdownBy={breakdownBy}
                  onBreakdownByChange={(mode) => onBreakdownByChange?.(mode)}
                  onShowBreakdownChange={(show) => onShowBreakdownChange?.(show)}
                  showBreakdown={showBreakdown}
                />
              </Box>
            </Box>
            {breakdownRows.map((line, index) => <CostLineRow key={line.name} {...line} name={overviewItemPrefix ? `${overviewItemPrefix} ${index + 1}` : line.name} />)}
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
      )}

      <WidgetNotificationsDialog
        active={notifications.active}
        config={costNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
    </Paper>
  );
}

function CostSummaryCarousel({
  activeIndex,
  cards,
  isPaused,
  onPauseToggle,
  onSelect,
}: {
  activeIndex: number;
  cards: typeof costSummaryCards;
  isPaused: boolean;
  onPauseToggle: () => void;
  onSelect: (index: number) => void;
}) {
  const card = cards[activeIndex] ?? cards[0];

  return (
    <Box sx={{minWidth: 0, display: 'grid', gridTemplateRows: '66px auto', gap: 0.45}}>
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          height: 66,
          minHeight: 66,
          pl: 1.55,
          pr: 1,
          py: 0.8,
          borderRadius: '6px',
          bgcolor: tokenNeutral.lighter,
          border: `1px solid ${tokenNeutral.main}`,
          boxShadow: '0 3px 10px rgba(23, 84, 180, 0.14)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: card.accent}} />
        <Box sx={{display: 'flex', justifyContent: 'space-between', height: '100%', gap: 1}}>
          <Box sx={{minWidth: 0}}>
            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.45}}>
              <Typography sx={{fontSize: 29, lineHeight: 0.95, color: card.textColor, fontWeight: 400}}>
                {card.value}
              </Typography>
              {card.unit ? (
                <Typography sx={{fontSize: card.id === 'scrap-units' ? 15 : 13, lineHeight: 1.05, color: card.textColor, fontWeight: 400, mt: 0.2}}>
                  {card.unit}
                </Typography>
              ) : null}
            </Box>
            <Typography sx={{fontSize: 11, lineHeight: 1, color: card.textColor, mt: 0.15}}>
              {card.label}
            </Typography>
          </Box>
          <Box sx={{pt: 1.1, textAlign: 'right', flexShrink: 0}}>
            <Typography sx={{fontSize: 8.5, letterSpacing: 0, color: workstationVisuals.tierTextLabel, fontWeight: 700, textTransform: 'uppercase'}}>
              Target
            </Typography>
            <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 29, height: 18, px: 0.55, mt: 0.15, borderRadius: 999, bgcolor: tokenNeutral.dark, color: workstationVisuals.tierTextHeading, fontSize: 10, fontWeight: 800}}>
              {card.target}
            </Box>
          </Box>
        </Box>
      </Paper>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.45, height: 12}}>
        <IconButton
          aria-label={isPaused ? 'Resume carousel' : 'Pause carousel'}
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            onPauseToggle();
          }}
          sx={{width: 12, height: 12, p: 0, color: tokenBrand.main}}
        >
          <PauseIcon sx={{fontSize: 14}} />
        </IconButton>
        {cards.map((item, index) => (
          <Box
            key={item.id}
            component="button"
            type="button"
            aria-label={`Show ${item.label}`}
            onClick={(event) => {
              event.stopPropagation();
              onSelect(index);
            }}
            sx={{
              width: activeIndex === index ? 6 : 5,
              height: activeIndex === index ? 6 : 5,
              border: 0,
              p: 0,
              borderRadius: '50%',
              bgcolor: activeIndex === index ? tokenBrand.main : tokenBrand.lightest,
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

function SmallPill({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
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

function CostCarouselControls({
  activeView,
  isPaused,
  onPauseToggle,
  onSelect,
}: {
  activeView: CostView;
  isPaused: boolean;
  onPauseToggle: () => void;
  onSelect: (view: CostView) => void;
}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.45, mt: 0.3, height: 12}}>
      <IconButton
        aria-label={isPaused ? 'Resume carousel' : 'Pause carousel'}
        size="small"
        onClick={(event) => {
          event.stopPropagation();
          onPauseToggle();
        }}
        sx={{width: 12, height: 12, p: 0, color: tokenBrand.main}}
      >
        <PauseIcon sx={{fontSize: 14}} />
      </IconButton>
      {(['Scrap', 'Downtime'] as CostView[]).map((item) => (
        <Box
          key={item}
          component="button"
          type="button"
          aria-label={`Show ${item}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(item);
          }}
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

function CostChart({ max, period, target, type, values }: { max: number; period: CostPeriod; target: number; type: CostChartType; values: number[] }) {
  const width = 310;
  const height = 166;
  const left = 30;
  const right = 8;
  const top = 7;
  const bottom = 24;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const targetY = top + chartHeight - (target / max) * chartHeight;
  const points = values.map((value, index) => ({ x: left + (index / Math.max(values.length - 1, 1)) * chartWidth, y: top + chartHeight - (value / max) * chartHeight, value }));
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const isMonthlyPeriod = period === 'Monthly';
  const labels = isMonthlyPeriod
    ? buildMonthDayLabels(values.length)
    : period === 'Daily'
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    : ['00', '03', '06', '09', '12', '03', '06', '09', '00'];
  const axisLabels = isMonthlyPeriod
    ? points
      .map((point, index) => ({label: labels[index], x: point.x}))
      .filter((_, index) => index % 3 === 0 || index === points.length - 1)
    : labels.map((label, index) => ({
      label,
      x: left + (index / Math.max(labels.length - 1, 1)) * chartWidth,
    }));
  const barWidth = Math.max(5, Math.min(9, chartWidth / values.length - 3));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      {[max, max * 0.8, max * 0.6, max * 0.4, max * 0.2, 0].map((tick) => {
        const y = top + chartHeight - (tick / max) * chartHeight;
        return (
          <g key={tick}>
            <line x1={left} x2={width - right} y1={y} y2={y} stroke={tick === 0 ? tokenNeutral.dark : tokenNeutral.lighter} />
            <text x={left - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill={workstationVisuals.textMuted}>{Math.round(tick)}</text>
          </g>
        );
      })}
      {points.map((point, index) => <line key={index} x1={point.x} x2={point.x} y1={top} y2={top + chartHeight} stroke={tokenNeutral.main} />)}
      <line x1={left} x2={width - right} y1={targetY} y2={targetY} stroke={tokenBrand.lighter} strokeWidth="1.2" strokeDasharray="3 3" />
      {type === 'lines' ? (
        <>
          <path d={path} fill="none" stroke={tokenInfo.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="2.8" fill={point.value > target ? tokenError.main : tokenInfo.dark} stroke={tokenCommon.white} strokeWidth="1.2" />)}
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
              fill={point.value > target ? tokenError.main : tokenSuccess.dark}
            />
          );
        })
      )}
      {axisLabels.map((item, index) => (
        <text key={`${item.label}-${index}`} x={item.x} y={height - 7} textAnchor="middle" fontSize="10" fill={tokenNeutral.darkest}>{item.label}</text>
      ))}
    </svg>
  );
}

function CostLineRow({ delta, name, tone, trend, value }: { delta: string; name: string; tone: string; trend: number[]; value: string }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '82px 54px 52px minmax(0, 1fr)', alignItems: 'center', minHeight: 32, gap: 0.65, borderTop: `1px solid ${tokenNeutral.main}` }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0 }}>
        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: tone }} />
        <Typography sx={{ fontSize: 11.5, color: workstationVisuals.tierTextHeading, fontWeight: 800 }} noWrap>{name}</Typography>
      </Box>
      <Typography sx={{ fontSize: 11.5, color: workstationVisuals.tierTextHeading, fontWeight: 950 }}>{value}</Typography>
      <Typography sx={{ fontSize: 10.5, color: delta.startsWith('+') ? tokenError.dark : tokenSuccess.darker, fontWeight: 850 }}>{delta}</Typography>
      <CostSparkline values={trend} color={tone} />
    </Box>
  );
}

function CostSparkline({ color, values }: { color: string; values: number[] }) {
  const width = 78;
  const height = 22;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const points = values.map((value, index) => `${(index / Math.max(values.length - 1, 1)) * width},${3 + (1 - (value - min) / range) * (height - 6)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="22" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
