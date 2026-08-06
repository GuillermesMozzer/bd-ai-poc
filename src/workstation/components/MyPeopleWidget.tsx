import { workstationVisuals } from '../theme';
import { useEffect, useMemo, useState } from 'react';
import { Box, Button, IconButton, Paper, Typography } from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  OpenInFull as OpenInFullIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  peopleNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';
import WidgetLetterBadge from './WidgetLetterBadge';
import WidgetBreakdownControls from './WidgetBreakdownControls';
import {buildMonthDayLabels, reorderCalendarYearToTierYear} from './tierChartMonths';

type PeoplePeriod = 'Daily' | 'Monthly';
type PeopleShift = 'All' | 'Shift A' | 'Shift B' | 'Shift C';
type PeopleChartType = 'bars' | 'lines';
type PeopleDashboardTimeframe = 'Today' | 'Yesterday' | 'Last 7 days' | 'Last 30 days';
type PeopleBreakdownMode = 'line' | 'department';

const peopleMetrics = [
  { label: 'Absences', value: 2, target: 3, color: '#10B64B' },
  { label: 'Day Offs', value: 5, target: 5, color: '#10B64B' },
  { label: 'Medical Leaves', value: 1, target: 0, color: '#EF343D' },
  { label: 'Vacation', value: 2, target: 5, color: '#10B64B' },
];

const periodData: Record<PeoplePeriod, Array<{ label: string; value: number }>> = {
  Daily: [
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 5 },
    { label: 'Wed', value: 2 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 3 },
    { label: 'Sat', value: 1 },
    { label: 'Sun', value: 2 },
  ],
  Monthly: [
    ...buildMonthDayLabels(12).map((label, index) => ({
      label,
      value: reorderCalendarYearToTierYear([3, 6, 2, 5, 4, 2, 3, 5, 6, 4, 3, 2])[index],
    })),
  ],
};

const shiftFactorMap: Record<PeopleShift, number> = {
  All: 1,
  'Shift A': 0.75,
  'Shift B': 1,
  'Shift C': 1.2,
};

const peopleTimeframePeriodMap: Record<PeopleDashboardTimeframe, PeoplePeriod> = {
  Today: 'Daily',
  Yesterday: 'Daily',
  'Last 7 days': 'Daily',
  'Last 30 days': 'Monthly',
};

const periodLabelMap: Record<PeoplePeriod, string> = {
  Daily: 'D',
  Monthly: 'M',
};

const peopleLineData = [
  { name: 'Line 01', value: '1 absent', delta: '-1', tone: '#10B95F', trend: [3, 2, 2, 1, 1, 0, 1, 1] },
  { name: 'Line 02', value: '2 absent', delta: '0', tone: '#10B95F', trend: [2, 1, 2, 2, 1, 2, 2, 2] },
  { name: 'Line 03', value: '4 absent', delta: '+1', tone: '#FFB33B', trend: [2, 3, 2, 4, 3, 4, 4, 4] },
  { name: 'Line 04', value: '6 absent', delta: '+3', tone: '#EF343D', trend: [2, 3, 4, 5, 4, 6, 5, 6] },
];

const peopleDepartmentData = [
  { name: 'Assembly', value: '5 absent', delta: '+2', tone: '#EF343D', trend: [3, 3, 4, 4, 5, 5, 5, 5] },
  { name: 'Molding', value: '1 absent', delta: '-1', tone: '#10B95F', trend: [3, 2, 2, 2, 1, 1, 1, 1] },
  { name: 'Maintenance', value: '2 absent', delta: '0', tone: '#10B95F', trend: [2, 2, 1, 2, 2, 2, 2, 2] },
  { name: 'Warehouse', value: '3 absent', delta: '+1', tone: '#FFB33B', trend: [1, 2, 2, 3, 2, 3, 3, 3] },
];

type MyPeopleWidgetProps = {
  breakdownBy?: PeopleBreakdownMode;
  dashboardShift?: PeopleShift;
  dashboardTimeframe?: PeopleDashboardTimeframe;
  onExpand?: () => void;
  useTierCarousel?: boolean;
  overviewLabel?: string;
  overviewItemPrefix?: string;
  onBreakdownByChange?: (mode: PeopleBreakdownMode) => void;
  onShowBreakdownChange?: (show: boolean) => void;
  showBreakdown?: boolean;
  chartType?: PeopleChartType;
  onChartTypeChange?: (type: PeopleChartType) => void;
};

export default function MyPeopleWidget({
  breakdownBy = 'line',
  dashboardShift,
  dashboardTimeframe,
  onExpand,
  useTierCarousel = false,
  overviewLabel = 'Line overview',
  overviewItemPrefix = 'Line',
  onBreakdownByChange,
  onShowBreakdownChange,
  showBreakdown = true,
  chartType: propChartType = 'bars',
}: MyPeopleWidgetProps) {
  const [period, setPeriod] = useState<PeoplePeriod>('Daily');
  const shift = dashboardShift ?? 'All';
  const chartType = propChartType;
  const notifications = useWidgetNotifications(peopleNotificationConfig);
  const breakdownRows = breakdownBy === 'line' ? peopleLineData : peopleDepartmentData;
  const chartData = useMemo(
    () => periodData[period].map((item) => ({ ...item, value: Math.round(item.value * shiftFactorMap[shift]) })),
    [period, shift],
  );

  useEffect(() => {
    if (dashboardTimeframe) {
      setPeriod(peopleTimeframePeriodMap[dashboardTimeframe]);
    }
  }, [dashboardTimeframe]);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        p: 'clamp(10px, 2cqw, 16px)',
        borderRadius: 1.8,
        bgcolor: '#FFFFFF',
        border: '1px solid #DDE4EF',
        boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.04)',
        overflow: 'hidden',
        containerType: 'inline-size',
        display: 'grid',
        gridTemplateRows: useTierCarousel ? 'auto 78px minmax(236px, 1fr)' : 'auto 56px auto minmax(282px, 1fr)',
        gap: 'clamp(10px, 2.5cqw, 14px)',
        '@container (max-width: 260px)': {
          gridTemplateRows: useTierCarousel ? 'auto 76px minmax(226px, 1fr)' : 'auto 52px auto minmax(262px, 1fr)',
          gap: 1,
          '& .people-header-actions': {
            gap: 0.15,
          },
          '& .people-metrics': {
            gap: 0.55,
          },
          '& .people-chart-controls': {
            gap: 0.25,
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: 'clamp(0px, 0.9cqw, 4px)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 'clamp(10px, 3cqw, 16px)', minWidth: 0 }}>
          <WidgetLetterBadge letter="P" defaultTone="green" />
          <Typography sx={{ fontSize: 'clamp(16px, 3.4cqw, 20px)', color: workstationVisuals.textPrimary, fontWeight: 800, fontFamily: workstationVisuals.fontFamily, lineHeight: 1 }}>
            People
          </Typography>
        </Box>
        <Box className="people-header-actions" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <AutoAwesomeIcon sx={{ fontSize: 'clamp(17px, 4cqw, 21px)', color: '#E5EBF3' }} />
          <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={27} />
          <IconButton size="small" onClick={onExpand} sx={{ width: 28, height: 28, color: '#0457FF' }}>
            <OpenInFullIcon sx={{ fontSize: 'clamp(18px, 4cqw, 22px)', color: '#0457FF' }} />
          </IconButton>
        </Box>
      </Box>

      {useTierCarousel ? null : (
        <Paper
          elevation={0}
          sx={{
            height: 56,
            borderRadius: 1.1,
            bgcolor: '#EF343D',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 'clamp(13px, 3.5cqw, 18px)',
          }}
        >
          <WarningIcon sx={{ fontSize: 27, flexShrink: 0 }} />
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 'clamp(16px, 4.2cqw, 18px)', lineHeight: 1, fontWeight: 900 }}>Shift at Risk</Typography>
            <Typography sx={{ fontSize: 'clamp(13px, 3.4cqw, 15px)', lineHeight: 1.15, fontWeight: 700 }}>33% of the Team is absent</Typography>
          </Box>
        </Paper>
      )}

      {useTierCarousel ? (
        <MetricCarousel metrics={peopleMetrics} />
      ) : (
        <Box className="people-metrics" sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gridAutoRows: 66, gap: 0.85 }}>
          {peopleMetrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </Box>
      )}

      <Box sx={{ minHeight: 0, display: 'grid', gridTemplateRows: 'auto minmax(138px, 1fr) auto', alignContent: 'start', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontSize: 'clamp(16px, 4.2cqw, 18px)', color: '#202124', fontWeight: 900, lineHeight: 1 }}>
            Absenteeism
          </Typography>
          <Box className="people-chart-controls" sx={{ display: 'flex', alignItems: 'center', gap: 0.45, justifyContent: 'flex-end' }}>
            {(['Daily', 'Monthly'] as PeoplePeriod[]).map((item) => (
              <PeriodPill
                key={item}
                active={period === item}
                label={periodLabelMap[item]}
                onClick={() => setPeriod(item)}
              />
            ))}
          </Box>
        </Box>

        <Box sx={{ height: 'clamp(144px, 36cqw, 174px)', minHeight: 0, display: 'grid', placeItems: 'center' }}>
          <PeopleAbsenteeismChart data={chartData} type={chartType} />
        </Box>

        {showBreakdown ? (
          <Box sx={{ minHeight: 0, overflow: 'hidden', mt: 0.85 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.8, mb: 0.7, borderTop: '1px solid #E6ECF4', pt: 0.85 }}>
              <Typography sx={{ fontSize: 11, color: '#18315F', fontWeight: 950 }}>{useTierCarousel ? overviewLabel.toUpperCase() : `ABSENTEEISM BY ${breakdownBy === 'line' ? 'LINE' : 'DEPARTMENT'}`}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                <Typography sx={{ fontSize: 10, color: '#74829C', fontWeight: 850 }}>target: 3</Typography>
                <WidgetBreakdownControls
                  breakdownBy={breakdownBy}
                  onBreakdownByChange={(mode) => onBreakdownByChange?.(mode)}
                  onShowBreakdownChange={(show) => onShowBreakdownChange?.(show)}
                  showBreakdown={showBreakdown}
                />
              </Box>
            </Box>
            {breakdownRows.map((line, index) => <PeopleLineRow key={line.name} {...line} name={useTierCarousel ? `${overviewItemPrefix} ${index + 1}` : line.name} />)}
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.85, borderTop: '1px solid #E6ECF4', pt: 0.85 }}>
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
        config={peopleNotificationConfig}
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

function PeriodPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      onClick={onClick}
      sx={{
        minWidth: 0,
        width: 24,
        height: 18,
        p: 0,
        borderRadius: 999,
        color: active ? '#FFFFFF' : '#70A7FF',
        bgcolor: active ? '#5B8CFF' : '#FFFFFF',
        border: '1px solid #D8E8FF',
        fontSize: 10,
        fontWeight: 900,
        lineHeight: 1,
        '&:hover': { bgcolor: active ? '#4678F2' : '#F8FBFF' },
      }}
    >
      {label}
    </Button>
  );
}

function MetricCard({metric}: {metric: typeof peopleMetrics[number]}) {
  const showTarget = metric.target > 0;
  const textColor = metric.color === '#EF343D' ? metric.color : '#202326';

  return (
    <Paper elevation={0} className="sqdc-metric-card" sx={{
      position: 'relative',
      height: 66,
      minHeight: 66,
      pl: 1.2,
      pr: 0.65,
      py: 0.8,
      border: '1px solid #E6EBEF',
      borderRadius: '6px',
      overflow: 'hidden',
      bgcolor: '#EEF3F6',
      boxShadow: '0 3px 10px rgba(23, 84, 180, 0.14)',
      cursor: 'default',
    }}>
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: metric.color }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.35, height: '100%' }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 29, lineHeight: 0.95, color: textColor, fontWeight: 400 }}>
            {metric.value}
          </Typography>
          <Typography sx={{ fontSize: 11, lineHeight: 1, color: textColor, mt: 0.15 }}>
            {metric.label}
          </Typography>
        </Box>
        {showTarget ? (
          <Box sx={{ pt: 1.1, textAlign: 'right', flexShrink: 0 }}>
            <Typography sx={{ fontSize: 7.5, letterSpacing: 0, color: '#4E565C', fontWeight: 700, textTransform: 'uppercase' }}>
              Target
            </Typography>
            <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 17, px: 0.45, mt: 0.15, borderRadius: 999, bgcolor: '#DDE4E8', color: '#2E3338', fontSize: 9.5, fontWeight: 800 }}>
              {metric.target}
            </Box>
          </Box>
        ) : null}
      </Box>
    </Paper>
  );
}

function MetricCarousel({metrics}: {metrics: typeof peopleMetrics}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMetric = metrics[activeIndex];

  useEffect(() => {
    const rotateId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % metrics.length);
    }, 3200);

    return () => window.clearInterval(rotateId);
  }, [metrics.length]);

  return (
    <Box sx={{minWidth: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', gap: 0.45}}>
      <MetricCard metric={activeMetric} />
      <Box sx={{display: 'flex', justifyContent: 'center', gap: 0.45}}>
        {metrics.map((metric, index) => (
          <Box
            key={metric.label}
            onClick={() => setActiveIndex(index)}
            sx={{
              width: index === activeIndex ? 14 : 5,
              height: 5,
              borderRadius: 999,
              bgcolor: index === activeIndex ? '#4C83FF' : '#CBD5E1',
              cursor: 'pointer',
              transition: 'all 160ms ease',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

function PeopleAbsenteeismChart({
  data,
  type,
}: {
  data: Array<{ label: string; value: number }>;
  type: PeopleChartType;
}) {
  const width = 310;
  const height = 166;
  const left = 30;
  const right = 8;
  const top = 8;
  const bottom = 24;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const max = Math.max(10, ...data.map((item) => item.value + 2));
  const target = 3;
  const points = data.map((item, index) => {
    const x = left + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = top + chartHeight - (item.value / max) * chartHeight;
    return { x, y, ...item };
  });
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const barWidth = Math.max(10, Math.min(18, chartWidth / Math.max(data.length, 1) - 8));

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height="100%"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {[max, max * 0.8, max * 0.6, max * 0.4, max * 0.2, 0].map((tick) => {
        const y = top + chartHeight - (tick / max) * chartHeight;
        return (
          <g key={tick}>
            <line x1={left} x2={width - right} y1={y} y2={y} stroke={tick === 0 ? '#C8D2E0' : '#F1F4F8'} />
            <text x={left - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill="#9AA6BA">
              {Math.round(tick)}
            </text>
          </g>
        );
      })}

      {points.map((point) => (
        <line key={`grid-${point.label}`} x1={point.x} x2={point.x} y1={top} y2={top + chartHeight} stroke="#E1E5EA" />
      ))}

      <line
        x1={left}
        x2={width - right}
        y1={top + chartHeight - (target / max) * chartHeight}
        y2={top + chartHeight - (target / max) * chartHeight}
        stroke="#4C83FF"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />

      {type === 'lines' ? (
        <>
          <path d={path} fill="none" stroke="#EF343D" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((point) => (
            <circle
              key={`dot-${point.label}`}
              cx={point.x}
              cy={point.y}
              r={point.value > target ? 3.5 : 2.8}
              fill={point.value > target ? '#EF343D' : '#36A566'}
              stroke="#FFFFFF"
              strokeWidth="1.2"
            />
          ))}
        </>
      ) : (
        points.map((point) => {
          const barHeight = (point.value / max) * chartHeight;
          return (
            <rect
              key={`bar-${point.label}`}
              x={point.x - barWidth / 2}
              y={top + chartHeight - Math.max(barHeight, 4)}
              width={barWidth}
              height={Math.max(barHeight, 4)}
              rx="4"
              fill={point.value > target ? '#EF343D' : '#36A566'}
            />
          );
        })
      )}

      {points.map((point) => (
        <text key={`label-${point.label}`} x={point.x} y={height - 7} textAnchor="middle" fontSize="10" fill="#9AA1AA">
          {point.label}
        </text>
      ))}
    </svg>
  );
}

function PeopleLineRow({ delta, name, tone, trend, value }: { delta: string; name: string; tone: string; trend: number[]; value: string }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '82px 62px 34px minmax(0, 1fr)', alignItems: 'center', minHeight: 32, gap: 0.65, borderTop: '1px solid #E6ECF4' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0 }}>
        <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: tone }} />
        <Typography sx={{ fontSize: 11.5, color: '#18315F', fontWeight: 800 }} noWrap>{name}</Typography>
      </Box>
      <Typography sx={{ fontSize: 11.5, color: '#18315F', fontWeight: 950 }}>{value}</Typography>
      <Typography sx={{ fontSize: 10.5, color: delta.startsWith('+') ? '#EF343D' : '#10B95F', fontWeight: 850 }}>{delta}</Typography>
      <PeopleSparkline values={trend} color={tone} />
    </Box>
  );
}

function PeopleSparkline({ color, values }: { color: string; values: number[] }) {
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
