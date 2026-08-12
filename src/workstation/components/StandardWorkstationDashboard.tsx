import {Box, Paper, LinearProgress, Typography, Divider, Button, Chip} from '@mui/material';
import {BarChart} from '@mui/x-charts/BarChart';
import {LineChart} from '@mui/x-charts/LineChart';
import type {
  WorkstationDashboardData,
  WorkstationLayoutBreakpoint,
  WorkstationLayoutItem,
  WorkstationResponsiveLayouts,
  MaintenanceOpenTarget,
} from '../types';
// @ts-ignore
import {Responsive as ResponsiveGridLayoutBase} from 'react-grid-layout/legacy';
import type {ComponentType} from 'react';
import {useEffect, useState} from 'react';
import {createStableWidthProvider, type WidthProviderComponentProps} from './stableWidthProvider';
import {
  workstationBreakpoints,
  workstationCols,
  workstationBreakpointKeys,
  shellLessWidgetIds,
  getEscalationIcon,
  getPriorityTone,
} from '../workstationConstants';
import {
  getTargetComparisonColor,
  workstationChartSemantic,
  workstationTierChartSx,
  workstationTierInsetCardSx,
  workstationVisuals,
} from '../theme';
import WorkstationKpiTrendCard from './WorkstationKpiTrendCard';
import WorkstationAutoChartArea from './WorkstationAutoChartArea';
import WorkstationSeriesBarWidget from './WorkstationSeriesBarWidget';
import WorkstationSeriesLineWidget from './WorkstationSeriesLineWidget';
import WorkstationRankedMetricWidget from './WorkstationRankedMetricWidget';
import WorkstationSelectedItemDetailsWidget from './WorkstationSelectedItemDetailsWidget';
import WorkstationCycleTimeTargetWidget from './WorkstationCycleTimeTargetWidget';
import WorkstationHourlyOutputWidget from './WorkstationHourlyOutputWidget';
import WorkstationTopDowntimeCausesWidget from './WorkstationTopDowntimeCausesWidget';
import WorkstationLineStatusOverviewWidget from './WorkstationLineStatusOverviewWidget';
import WorkstationSqdcOperatorWidget from './WorkstationSqdcOperatorWidget';
import WidgetWorkOrders from './WidgetWorkOrders';
import {
  InboundSlaWidget,
  ActiveLoadsTimelineWidget,
  LineShortageRiskWidget,
  SpaceXShippingGatingWidget,
  PrioritizedDecisionQueue,
  SpaceXShippingGatingConsole,
  SterilizationLoadsTimelineWidget,
  InboundSlaChartWidget,
  AtlasAiPrescriptivePanel,
} from '../../logistics/widgets';
import {useWorkstationDetailState} from '../hooks/useWorkstationDetailState';
import {useWorkstationLayout} from '../hooks/useWorkstationLayout';

const ResponsiveGridLayout = createStableWidthProvider(
  ResponsiveGridLayoutBase as unknown as ComponentType<WidthProviderComponentProps & Record<string, unknown>>,
);
const standardGridMargin: [number, number] = [12, 12];

type StandardWorkstationDashboardProps = {
  data: WorkstationDashboardData;
  layoutStorageKey?: string;
  onOpenActionTracker: () => void;
  onOpenLineLog: () => void;
  onOpenMaintenance: (target?: MaintenanceOpenTarget) => void;
  onOpenTierMeeting: () => void;
};

function formatCompact(value: number) {
  return Intl.NumberFormat('en-US', {notation: 'compact', maximumFractionDigits: 1}).format(value);
}

function normalizeGridLayout(layout: unknown): WorkstationLayoutItem[] {
  if (!Array.isArray(layout)) return [];

  return layout
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && typeof item.i === 'string')
    .map((item) => ({
      i: item.i as string,
      x: typeof item.x === 'number' ? item.x : 0,
      y: typeof item.y === 'number' ? item.y : 0,
      w: typeof item.w === 'number' ? item.w : 1,
      h: typeof item.h === 'number' ? item.h : 1,
      minW: typeof item.minW === 'number' ? item.minW : undefined,
      minH: typeof item.minH === 'number' ? item.minH : undefined,
      maxW: typeof item.maxW === 'number' ? item.maxW : undefined,
      maxH: typeof item.maxH === 'number' ? item.maxH : undefined,
    }));
}

function getSelectedItemTypeFromEntity(entity: string) {
  const normalizedEntity = entity.toLowerCase();
  if (normalizedEntity === 'work order') return 'work-order';
  if (normalizedEntity === 'sku') return 'sku';
  if (normalizedEntity === 'batch') return 'batch';
  if (normalizedEntity === 'lot') return 'lot';
  return null;
}

export default function StandardWorkstationDashboard({
  data,
  layoutStorageKey,
  onOpenActionTracker,
  onOpenLineLog,
  onOpenMaintenance,
  onOpenTierMeeting,
}: StandardWorkstationDashboardProps) {
  const [activeBreakpoint, setActiveBreakpoint] = useState<WorkstationLayoutBreakpoint>('lg');
  const {
    selectedCycleTarget,
    selectedItemType,
    setSelectedCycleTarget,
    setSelectedItemType,
  } = useWorkstationDetailState();

  const {
    updateVisibleLayouts,
    visibleLayouts,
    visibleWidgetIds,
  } = useWorkstationLayout(layoutStorageKey);

  const {
    alert,
    alarmTrend,
    bottleneckRanking,
    cycleTimeTrend,
    defectBreakdown,
    downtimePareto,
    energyTrend,
    escalationActions,
    machinePerformance,
    machineStateDistribution,
    operationalMetrics,
    operatorTasks,
    outputByProcess,
    throughputByProcess,
    hourlyOutput,
    outputByShift,
    outputTrend,
    processYield,
    processes,
    qualityByShift,
    scrapTrend,
    selectedItems,
    summary,
    topDowntimeCauses,
    traceabilityHistory,
    cycleTimeVsTarget,
    utilitiesByMachine,
    wipLevels,
  } = data;

  // KPIs and Trends calculation
  const shiftProgressPercent = Math.min((summary.currentOutput / summary.shiftTarget) * 100, 100);
  const shiftElapsedPercent = Math.min((summary.shiftElapsedMinutes / summary.shiftDurationMinutes) * 100, 100);
  const projectedShiftOutput = summary.shiftElapsedMinutes > 0
    ? (summary.currentOutput / summary.shiftElapsedMinutes) * summary.shiftDurationMinutes
    : 0;
  const projectedOnTarget = projectedShiftOutput >= summary.shiftTarget;
  const projectedTone = projectedOnTarget ? '#7AD36B' : '#FF5A52';
  const executionOnTarget = shiftProgressPercent >= shiftElapsedPercent;
  const executionBarTone = executionOnTarget ? '#044ED7' : '#FF5A52';
  const projectedShiftPercent = Math.min((projectedShiftOutput / summary.shiftTarget) * 100, 100);

  const oeeTrendValues = operationalMetrics.map((item) => Number(item.oee));
  const latestOee = oeeTrendValues[oeeTrendValues.length - 1] ?? summary.oee;
  const previousOee = oeeTrendValues[oeeTrendValues.length - 2] ?? latestOee;
  const oeeTrendDelta = latestOee - previousOee;
  const oeeTarget = 85;
  const oeeOnTarget = latestOee >= oeeTarget;
  const oeeAccent = oeeOnTarget ? '#7AD36B' : '#FF5A52';

  const availabilityTrendValues = operationalMetrics.map((item) => Number(item.availability));
  const latestAvailability = availabilityTrendValues[availabilityTrendValues.length - 1] ?? summary.availability;
  const previousAvailability = availabilityTrendValues[availabilityTrendValues.length - 2] ?? latestAvailability;
  const availabilityDelta = latestAvailability - previousAvailability;
  const availabilityTarget = 90;
  const availabilityOnTarget = latestAvailability >= availabilityTarget;
  const availabilityAccent = availabilityOnTarget ? '#7AD36B' : '#FF5A52';

  const performanceTrendValues = operationalMetrics.map((item) => Number(item.performance));
  const latestPerformance = performanceTrendValues[performanceTrendValues.length - 1] ?? summary.performance;
  const previousPerformance = performanceTrendValues[performanceTrendValues.length - 2] ?? latestPerformance;
  const performanceDelta = latestPerformance - previousPerformance;
  const performanceTarget = 95;
  const performanceOnTarget = latestPerformance >= performanceTarget;
  const performanceAccent = performanceOnTarget ? '#7AD36B' : '#FF5A52';

  const qualityTrendValues = operationalMetrics.map((item) => Number(item.quality));
  const latestQualityMetric = qualityTrendValues[qualityTrendValues.length - 1] ?? summary.quality;
  const previousQualityMetric = qualityTrendValues[qualityTrendValues.length - 2] ?? latestQualityMetric;
  const qualityDelta = latestQualityMetric - previousQualityMetric;
  const qualityTarget = 95;
  const qualityOnTarget = latestQualityMetric >= qualityTarget;
  const qualityAccent = qualityOnTarget ? '#7AD36B' : '#FF5A52';

  const fpyTrendValues = scrapTrend.map((item) => 100 - Number(item.scrap));
  const latestFpy = fpyTrendValues[fpyTrendValues.length - 1] ?? summary.fpy;
  const previousFpy = fpyTrendValues[fpyTrendValues.length - 2] ?? latestFpy;
  const fpyDelta = latestFpy - previousFpy;
  const fpyTarget = 98;
  const fpyOnTarget = latestFpy >= fpyTarget;
  const fpyAccent = fpyOnTarget ? '#7AD36B' : '#FF5A52';

  const scrapTrendValues = scrapTrend.map((item) => Number(item.scrap));
  const latestScrap = scrapTrendValues[scrapTrendValues.length - 1] ?? summary.scrapRate;
  const previousScrap = scrapTrendValues[scrapTrendValues.length - 2] ?? latestScrap;
  const scrapDelta = latestScrap - previousScrap;
  const scrapTarget = 2;
  const scrapOnTarget = latestScrap <= scrapTarget;
  const scrapAccent = scrapOnTarget ? '#7AD36B' : '#FF5A52';
  const scrapGuardrail = scrapTrend.map(() => 2);

  const downtimeTrendValues = topDowntimeCauses.slice().reverse().map((item) => Number(item.minutes));
  const latestDowntime = downtimeTrendValues[downtimeTrendValues.length - 1] ?? summary.downtimeMinutes;
  const previousDowntime = downtimeTrendValues[downtimeTrendValues.length - 2] ?? latestDowntime;
  const downtimeDelta = latestDowntime - previousDowntime;
  const downtimeTarget = 40;
  const downtimeOnTarget = latestDowntime <= downtimeTarget;
  const downtimeAccent = downtimeOnTarget ? '#7AD36B' : '#FF5A52';

  const energyUnitTrendValues = energyTrend.map((item) => Number(item.energy) / 450);
  const latestEnergyUnit = energyUnitTrendValues[energyUnitTrendValues.length - 1] ?? summary.energyPerUnitKwh;
  const previousEnergyUnit = energyUnitTrendValues[energyUnitTrendValues.length - 2] ?? latestEnergyUnit;
  const energyUnitDelta = latestEnergyUnit - previousEnergyUnit;
  const energyUnitTarget = 0.32;
  const energyUnitOnTarget = latestEnergyUnit <= energyUnitTarget;
  const energyUnitAccent = energyUnitOnTarget ? '#7AD36B' : '#FF5A52';

  const performanceMetricCards: Array<{widgetId: string; label: string; value: string; tone: string}> = [
    {widgetId: 'oee-kpi', label: 'OEE', value: `${summary.oee}%`, tone: '#044ED7'},
    {widgetId: 'availability-kpi', label: 'Availability', value: `${summary.availability}%`, tone: '#0F766E'},
    {widgetId: 'performance-kpi', label: 'Performance', value: `${summary.performance}%`, tone: '#FF6E00'},
    {widgetId: 'quality-kpi', label: 'Quality', value: `${summary.quality}%`, tone: '#7C3AED'},
  ];

  const summarySupportCards: Array<{widgetId: string; label: string; value: string; note: string}> = [
    {widgetId: 'downtime-kpi', label: 'Downtime', value: `${summary.downtimeMinutes} min`, note: `MTTR ${summary.mttrMinutes} min`},
    {widgetId: 'fpy-kpi', label: 'FPY', value: `${summary.fpy}%`, note: `Scrap ${summary.scrapRate}%`},
    {widgetId: 'scrap-kpi', label: 'Scrap', value: `${summary.scrapRate}%`, note: `FPY ${summary.fpy}%`},
    {widgetId: 'energy-unit-kpi', label: 'Energy / unit', value: `${summary.energyPerUnitKwh} kWh`, note: `Takt ${summary.taktTimeSeconds}s`},
  ];

  const renderTierMetricCard = ({
    accent,
    label,
    note,
    target,
    value,
  }: {
    accent: string;
    label: string;
    note?: string;
    target?: string;
    value: string;
  }) => (
    <Paper
      elevation={0}
      sx={{
        ...workstationTierInsetCardSx,
        position: 'relative',
        overflow: 'hidden',
        pt: 0.9,
        pr: 1.05,
        pb: 0.75,
        pl: 1.55,
        minHeight: note || target ? 86 : 72,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundImage: workstationVisuals.tierPanelBackground,
      }}
    >
      <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent}} />
      {target ? (
        <Box sx={{display: 'flex', justifyContent: 'flex-end'}}>
          <Typography sx={{fontSize: '0.62rem', fontWeight: 800, color: workstationVisuals.tierTextMeta, letterSpacing: '0.06em', textTransform: 'uppercase'}}>
            Target {target}
          </Typography>
        </Box>
      ) : null}
      <Typography sx={{fontSize: '0.62rem', fontWeight: 800, color: workstationVisuals.tierTextLabel, letterSpacing: '0.05em', textTransform: 'uppercase'}}>
        {label}
      </Typography>
      <Typography sx={{fontSize: '2rem', color: accent, fontWeight: 900, mt: 0.35, lineHeight: 0.95}}>
        {value}
      </Typography>
      {note ? (
        <Typography sx={{fontSize: '0.68rem', fontWeight: 700, color: accent, mt: 0.55}}>
          {note}
        </Typography>
      ) : null}
    </Paper>
  );

  const renderOeeTrendCard = ({showScopeLabel = true}: {showScopeLabel?: boolean} = {}) => (
    <WorkstationKpiTrendCard
      accent={oeeAccent}
      comparisonLabel={`${oeeTrendDelta >= 0 ? '+' : ''}${oeeTrendDelta.toFixed(1)} pts vs prior day`}
      label="OEE"
      positive={oeeOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${oeeTarget}%`}
      trendValues={oeeTrendValues}
      value={`${latestOee.toFixed(1)}%`}
    />
  );

  const renderAvailabilityTrendCard = ({showScopeLabel = true}: {showScopeLabel?: boolean} = {}) => (
    <WorkstationKpiTrendCard
      accent={availabilityAccent}
      comparisonLabel={`${availabilityDelta >= 0 ? '+' : ''}${availabilityDelta.toFixed(1)} pts vs prior day`}
      label="Availability"
      positive={availabilityOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${availabilityTarget}%`}
      trendValues={availabilityTrendValues}
      value={`${latestAvailability.toFixed(1)}%`}
    />
  );

  const renderPerformanceTrendCard = ({showScopeLabel = true}: {showScopeLabel?: boolean} = {}) => (
    <WorkstationKpiTrendCard
      accent={performanceAccent}
      comparisonLabel={`${performanceDelta >= 0 ? '+' : ''}${performanceDelta.toFixed(1)} pts vs prior day`}
      label="Performance"
      positive={performanceOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${performanceTarget}%`}
      trendValues={performanceTrendValues}
      value={`${latestPerformance.toFixed(1)}%`}
    />
  );

  const renderQualityTrendCard = ({showScopeLabel = true}: {showScopeLabel?: boolean} = {}) => (
    <WorkstationKpiTrendCard
      accent={qualityAccent}
      comparisonLabel={`${qualityDelta >= 0 ? '+' : ''}${qualityDelta.toFixed(1)} pts vs prior day`}
      label="Quality"
      positive={qualityOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${qualityTarget}%`}
      trendValues={qualityTrendValues}
      value={`${latestQualityMetric.toFixed(1)}%`}
    />
  );

  const renderFpyTrendCard = ({showScopeLabel = true}: {showScopeLabel?: boolean} = {}) => (
    <WorkstationKpiTrendCard
      accent={fpyAccent}
      comparisonLabel={`${fpyDelta >= 0 ? '+' : ''}${fpyDelta.toFixed(1)} pts vs prior hour`}
      label="FPY"
      positive={fpyOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${fpyTarget}%`}
      trendValues={fpyTrendValues}
      value={`${latestFpy.toFixed(1)}%`}
    />
  );

  const renderDowntimeTrendCard = ({showScopeLabel = true}: {showScopeLabel?: boolean} = {}) => (
    <WorkstationKpiTrendCard
      accent={downtimeAccent}
      comparisonLabel={`${downtimeDelta >= 0 ? '+' : ''}${downtimeDelta.toFixed(0)} min vs prior cause`}
      label="Downtime"
      positive={downtimeOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${downtimeTarget} min`}
      trendValues={downtimeTrendValues}
      value={`${latestDowntime.toFixed(0)} min`}
    />
  );

  const renderScrapTrendCard = ({showScopeLabel = true}: {showScopeLabel?: boolean} = {}) => (
    <WorkstationKpiTrendCard
      accent={scrapAccent}
      comparisonLabel={`${scrapDelta >= 0 ? '+' : ''}${scrapDelta.toFixed(1)} pts vs prior hour`}
      label="Scrap"
      positive={scrapOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${scrapTarget}%`}
      trendValues={scrapTrendValues}
      value={`${latestScrap.toFixed(1)}%`}
    />
  );

  const renderEnergyUnitTrendCard = ({showScopeLabel = true}: {showScopeLabel?: boolean} = {}) => (
    <WorkstationKpiTrendCard
      accent={energyUnitAccent}
      comparisonLabel={`${energyUnitDelta >= 0 ? '+' : ''}${energyUnitDelta.toFixed(2)} kWh vs prior hour`}
      label="Energy / Unit"
      positive={energyUnitOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${energyUnitTarget.toFixed(2)} kWh`}
      trendValues={energyUnitTrendValues}
      value={`${latestEnergyUnit.toFixed(2)} kWh`}
    />
  );

  const renderShiftExecutionCard = ({
    compact = false,
    fillHeight = false,
  }: {
    compact?: boolean;
    fillHeight?: boolean;
  } = {}) => (
    <Paper
      elevation={0}
      sx={{
        ...workstationTierInsetCardSx,
        p: compact ? 1 : 1.15,
        borderRadius: 2.6,
        backgroundImage: workstationVisuals.tierPanelBackground,
        minHeight: 0,
        height: fillHeight ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: workstationVisuals.tierShadow,
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'column', gap: compact ? 0.45 : 0.7, my: 'auto'}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1}}>
          <Typography sx={{fontSize: compact ? '0.82rem' : '0.92rem', fontWeight: 900, color: workstationVisuals.tierTextLabel, lineHeight: 1.05, textTransform: 'uppercase', fontFamily: workstationVisuals.fontFamily}}>
            Shift Execution
          </Typography>
          <Typography sx={{fontSize: compact ? '0.82rem' : '0.92rem', fontWeight: 900, color: workstationVisuals.tierTextMeta, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'right', lineHeight: 1.1, fontFamily: workstationVisuals.fontFamily}}>
            Target {summary.shiftTarget.toLocaleString()}
          </Typography>
        </Box>
        <Typography sx={{fontSize: compact ? '2.05rem' : '2.3rem', lineHeight: 0.95, fontWeight: 900, color: projectedTone, fontFamily: workstationVisuals.fontFamily}}>
          {summary.currentOutput.toLocaleString()}
        </Typography>
        <Typography sx={{fontSize: compact ? '0.66rem' : '0.72rem', fontWeight: 700, color: executionBarTone, fontFamily: workstationVisuals.fontFamily}}>
          {projectedOnTarget ? 'On pace to target' : 'Below pace to target'}
        </Typography>
        <Box sx={{pt: 0.1}}>
          <LinearProgress
            variant="determinate"
            value={shiftProgressPercent}
            sx={{
              height: compact ? 12 : 14,
              borderRadius: 999,
              bgcolor: workstationVisuals.tierSurfaceMuted,
              border: `1px solid ${workstationVisuals.tierBorder}`,
              overflow: 'hidden',
              position: 'relative',
              '& .MuiLinearProgress-bar': {borderRadius: 999, bgcolor: executionBarTone},
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 2,
                bottom: 2,
                left: `${Math.max(projectedShiftPercent - 0.8, 0)}%`,
                width: '3px',
                borderRadius: 999,
                bgcolor: projectedTone,
                boxShadow: `0 0 0 4px color-mix(in srgb, ${projectedTone} 13%, transparent)`,
                zIndex: 2,
              },
            }}
          />
          <Box sx={{display: 'flex', justifyContent: 'space-between', mt: compact ? 0.5 : 0.65}}>
            <Typography sx={{fontSize: compact ? '0.66rem' : '0.72rem', color: workstationVisuals.tierTextLabel, fontWeight: 700, fontFamily: workstationVisuals.fontFamily}}>
              {shiftProgressPercent.toFixed(1)}% to shift target
            </Typography>
            <Typography sx={{fontSize: compact ? '0.66rem' : '0.72rem', color: workstationVisuals.tierTextLabel, fontWeight: 700, fontFamily: workstationVisuals.fontFamily}}>
              Shift clock {shiftElapsedPercent.toFixed(0)}%
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  const renderWidgetContent = (widgetId: string) => {
    if (widgetId === 'line-status-overview') {
      return (
        <WorkstationLineStatusOverviewWidget
          data={data}
          onOpenLineLog={onOpenLineLog}
        />
      );
    }
    if (widgetId === 'safety-operator') return <WorkstationSqdcOperatorWidget kind="safety" />;
    if (widgetId === 'quality-operator') return <WorkstationSqdcOperatorWidget kind="quality" />;

    if (widgetId === 'oee-performance') {
      return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))'}, gap: 1.2}}>
            {performanceMetricCards.map((item) => (
              <Box key={item.widgetId}>
                {item.widgetId === 'oee-kpi'
                  ? renderOeeTrendCard()
                  : item.widgetId === 'availability-kpi'
                    ? renderAvailabilityTrendCard()
                    : item.widgetId === 'performance-kpi'
                      ? renderPerformanceTrendCard()
                      : item.widgetId === 'quality-kpi'
                        ? renderQualityTrendCard()
                      : renderTierMetricCard({accent: item.tone, label: item.label, value: item.value})}
              </Box>
            ))}
          </Box>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '1.1fr 0.9fr'}, gap: 2}}>
            {renderShiftExecutionCard()}
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr', gap: 1}}>
              {summarySupportCards.map((item) => (
                <Box key={item.widgetId}>
                  {item.widgetId === 'fpy-kpi'
                    ? renderFpyTrendCard()
                    : item.widgetId === 'scrap-kpi'
                      ? renderScrapTrendCard()
                    : item.widgetId === 'downtime-kpi'
                      ? renderDowntimeTrendCard()
                      : item.widgetId === 'energy-unit-kpi'
                        ? renderEnergyUnitTrendCard()
                        : renderTierMetricCard({accent: item.widgetId === 'energy-unit-kpi' ? '#044ED7' : '#5CC96B', label: item.label, value: item.value, note: item.note})}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      );
    }

    if (widgetId === 'output-vs-plan') {
      return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0, height: '100%'}}>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 1}}>
            {[
              {label: 'Shift gap', value: `${formatCompact(Math.max(summary.shiftTarget - summary.currentOutput, 0))} units`},
              {label: 'Daily target', value: formatCompact(summary.dailyTarget)},
              {label: 'Throughput target', value: `${formatCompact(summary.targetThroughputPerHour)}/h`},
            ].map((item) => (
              <Paper key={item.label} elevation={0} sx={{...workstationTierInsetCardSx, p: 1.05, backgroundImage: workstationVisuals.tierPanelBackground}}>
                <Typography variant="caption" sx={{color: workstationVisuals.tierTextLabel, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase'}}>
                  {item.label}
                </Typography>
                <Typography sx={{color: workstationVisuals.tierTextHeading, fontWeight: 900, mt: 0.35}}>
                  {item.value}
                </Typography>
              </Paper>
            ))}
          </Box>
          <WorkstationAutoChartArea maxHeight={240}>
            {(chartHeight) => (
              <BarChart
                height={chartHeight}
                hideLegend
                xAxis={[{
                  data: outputByShift.map((item) => item.label),
                  scaleType: 'band',
                  tickLabelStyle: {fill: workstationVisuals.tierAxis, fontSize: 9},
                }]}
                yAxis={[{tickLabelStyle: {fill: workstationVisuals.tierAxis, fontSize: 9}}]}
                series={[
                  {data: outputByShift.map((item) => Number(item.actual)), label: 'Actual', color: workstationChartSemantic.neutral},
                  {data: outputByShift.map((item) => Number(item.planned)), label: 'Planned', color: workstationChartSemantic.target},
                ] as any}
                margin={{top: 12, right: 12, bottom: 24, left: 32}}
                grid={{horizontal: true}}
                sx={workstationTierChartSx}
              />
            )}
          </WorkstationAutoChartArea>
        </Box>
      );
    }

    if (widgetId === 'downtime-overview') {
      return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2}}>
          {renderTierMetricCard({
            accent: '#FF5A52',
            label: 'Active loss',
            value: `${summary.downtimeMinutes} min`,
            note: 'Largest stop is electrode replacement on Welding 3.',
          })}
          {topDowntimeCauses.slice(0, 3).map((cause) => (
            <Box key={cause.label}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.45}}>
                <Typography variant="body2" sx={{fontWeight: 700, color: '#1F2366'}}>{cause.label}</Typography>
                <Typography variant="caption" sx={{color: '#626465', fontWeight: 700}}>{cause.minutes} min</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Number(cause.percentage)}
                sx={{height: 8, borderRadius: 999, bgcolor: '#FEE2E2', '& .MuiLinearProgress-bar': {borderRadius: 999, bgcolor: '#EF4444'}}}
              />
            </Box>
          ))}
        </Box>
      );
    }

    if (widgetId === 'machine-health') {
      return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.9}}>
          <Box sx={{display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.8fr 1.4fr', gap: 1, px: 0.4}}>
            {['Machine', 'Status', 'OEE', 'Downtime', 'Last stop'].map((label) => (
              <Typography key={label} variant="caption" sx={{color: '#64748B', fontWeight: 800}}>{label}</Typography>
            ))}
          </Box>
          {machinePerformance.map((row) => (
            <Paper
              key={row.machine}
              elevation={0}
              onClick={() => {
                if (cycleTimeVsTarget[row.machine]) {
                  setSelectedCycleTarget(row.machine);
                }
              }}
              sx={{
                p: 1.2,
                borderRadius: 2.5,
                bgcolor: selectedCycleTarget === row.machine ? '#EEF4FF' : '#F8FAFC',
                border: selectedCycleTarget === row.machine ? '1px solid #DBEAFE' : '1px solid #E2E8F0',
                cursor: cycleTimeVsTarget[row.machine] ? 'pointer' : 'default',
              }}
            >
              <Box sx={{display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.8fr 1.4fr', gap: 1, alignItems: 'center'}}>
                <Typography sx={{fontWeight: 700, color: '#1F2366'}}>{row.machine}</Typography>
                <Chip size="small" label={row.status} sx={{fontWeight: 800, bgcolor: row.statusBackground, color: row.statusColor, border: '1px solid #E2E8F0'}} />
                <Typography variant="body2" sx={{color: '#334155', fontWeight: 700}}>{row.oee}</Typography>
                <Typography variant="body2" sx={{color: '#334155'}}>{row.downtime}</Typography>
                <Typography variant="caption" sx={{color: '#475569'}}>{row.lastStop}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      );
    }

    if (widgetId === 'traceability-preview') {
      return (
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
          {traceabilityHistory.slice(-5).reverse().map((event, index) => (
            <Box key={`${event.timestamp}-${event.id}`}>
              <Box
                onClick={() => {
                  const nextItemType = getSelectedItemTypeFromEntity(event.entity);
                  if (nextItemType) setSelectedItemType(nextItemType as any);
                }}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '88px 1.1fr auto',
                  gap: 1.2,
                  alignItems: 'center',
                  cursor: getSelectedItemTypeFromEntity(event.entity) ? 'pointer' : 'default',
                  borderRadius: 2,
                  px: 0.6,
                  py: 0.4,
                  '&:hover': getSelectedItemTypeFromEntity(event.entity) ? {bgcolor: '#F8FAFC'} : undefined,
                }}
              >
                <Typography variant="caption" sx={{color: '#475569', fontWeight: 800}}>{event.timestamp}</Typography>
                <Box sx={{minWidth: 0}}>
                  <Typography sx={{fontWeight: 700, color: '#1F2366'}}>{event.event}</Typography>
                  <Typography variant="caption" sx={{color: '#626465', display: 'block', mt: 0.15}}>{event.entity} | {event.id} | {event.machine}</Typography>
                </Box>
                <Chip size="small" label={event.status} sx={{fontWeight: 800, bgcolor: event.statusBackground, color: event.statusColor, border: '1px solid #E2E8F0'}} />
              </Box>
              {index < 4 ? <Divider sx={{mt: 1}} /> : null}
            </Box>
          ))}
        </Box>
      );
    }

    if (widgetId === 'operational-metrics') {
      return (
        <WorkstationSeriesLineWidget
          labels={operationalMetrics.map((item) => String(item.label))}
          series={[
            {id: 'availability', label: 'Availability', color: workstationChartSemantic.good, data: operationalMetrics.map((item) => Number(item.availability))},
            {id: 'oee', label: 'OEE', color: workstationChartSemantic.neutral, data: operationalMetrics.map((item) => Number(item.oee))},
            {id: 'quality', label: 'Quality', color: workstationChartSemantic.neutral, data: operationalMetrics.map((item) => Number(item.quality))},
            {id: 'performance', label: 'Performance', color: workstationChartSemantic.good, data: operationalMetrics.map((item) => Number(item.performance))},
          ]}
          summaryItems={[
            {label: 'Latest OEE', value: `${summary.oee}%`, tone: workstationChartSemantic.neutral},
            {label: 'Latest availability', value: `${summary.availability}%`, tone: workstationChartSemantic.good},
            {label: 'Latest quality', value: `${summary.quality}%`, tone: workstationChartSemantic.neutral},
          ]}
          yMin={60}
        />
      );
    }

    // Fallback for standard widgets that might use common components
    if (widgetId === 'selected-item-details') return <WorkstationSelectedItemDetailsWidget selectedItemType={selectedItemType} selectedItems={selectedItems} traceabilityHistory={traceabilityHistory} onSelectItemType={setSelectedItemType} />;
    if (widgetId === 'cycle-time-target') return <WorkstationCycleTimeTargetWidget cycleTimeVsTarget={cycleTimeVsTarget} selectedTarget={selectedCycleTarget} onSelectTarget={setSelectedCycleTarget} />;
    if (widgetId === 'output-trend-hourly') return <WorkstationHourlyOutputWidget hourlyOutput={hourlyOutput} targetThroughputPerHour={summary.targetThroughputPerHour} />;
    if (widgetId === 'top-downtime-causes') return <WorkstationTopDowntimeCausesWidget topDowntimeCauses={topDowntimeCauses} />;
    if (widgetId === 'work-orders') return <WidgetWorkOrders />;
    if (widgetId === 'inbound_sla_chart') return <InboundSlaWidget />;
    if (widgetId === 'active_loads_timeline') return <ActiveLoadsTimelineWidget />;
    if (widgetId === 'line_shortage_risk') return <LineShortageRiskWidget />;
    if (widgetId === 'spacex_shipping_gating') return <SpaceXShippingGatingWidget />;
    if (widgetId === 'prioritized_decision_queue') return <PrioritizedDecisionQueue />;
    if (widgetId === 'spacex_shipping_gating_console') return <SpaceXShippingGatingConsole />;
    if (widgetId === 'sterilization_loads_timeline') return <SterilizationLoadsTimelineWidget />;
    if (widgetId === 'inbound_sla_chart_v2') return <InboundSlaChartWidget />;
    if (widgetId === 'atlas_ai_prescriptive_panel') return <AtlasAiPrescriptivePanel />;

    return null;
  };

  const commitBreakpointLayout = (layout: unknown) => {
    const nextBreakpointLayout = normalizeGridLayout(layout);
    if (nextBreakpointLayout.length === 0) return;
    updateVisibleLayouts({[activeBreakpoint]: nextBreakpointLayout});
  };

  return (
    <Box sx={{px: {xs: 0.5, md: 1, xl: 2}, pb: 4}}>
      <ResponsiveGridLayout
        className="layout"
        layouts={visibleLayouts}
        breakpoints={workstationBreakpoints}
        cols={workstationCols}
        rowHeight={26}
        margin={standardGridMargin}
        onBreakpointChange={(bp) => setActiveBreakpoint(bp as WorkstationLayoutBreakpoint)}
        onLayoutChange={(layout) => commitBreakpointLayout(layout)}
        draggableHandle=".widget-drag-handle"
        useCSSTransforms={true}
      >
        {visibleWidgetIds.map((widgetId) => (
          <Box key={widgetId}>
            <Paper
              elevation={0}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: shellLessWidgetIds.has(widgetId) ? 0 : 3,
                bgcolor: shellLessWidgetIds.has(widgetId) ? 'transparent' : '#FFFFFF',
                border: shellLessWidgetIds.has(widgetId) ? 'none' : '1px solid #E2E8F0',
                overflow: 'hidden',
              }}
            >
              {!shellLessWidgetIds.has(widgetId) && (
                <Box sx={{px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                  <Typography sx={{fontWeight: 900, color: '#1E293B', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em'}}>
                    {widgetId.replace(/-/g, ' ')}
                  </Typography>
                </Box>
              )}
              <Box sx={{flex: 1, p: shellLessWidgetIds.has(widgetId) ? 0 : 2, overflow: 'auto'}}>
                {renderWidgetContent(widgetId)}
              </Box>
            </Paper>
          </Box>
        ))}
      </ResponsiveGridLayout>
    </Box>
  );
}
