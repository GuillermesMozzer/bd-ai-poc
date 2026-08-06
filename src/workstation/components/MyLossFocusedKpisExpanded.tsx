import {useEffect, useMemo, useState} from 'react';
import {
  tokenBrand,
  tokenError,
  tokenWarning,
  tokenSuccess,
  tokenInfo,
  tokenNeutral,
  tokenCommon,
  workstationVisuals,
} from '../theme';
import {Box, Button, Chip, Paper, Typography} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowDownward as ArrowDownwardIcon,
  ArrowUpward as ArrowUpwardIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';
import {
  formatLossPercent,
  lossFocusedActions,
  lossFocusedDateFilters,
  lossFocusedKpiDefinitions,
  lossFocusedMetricOptions,
  lossFocusedPeriods,
  lossFocusedShiftFilters,
  type LossActionStatus,
  type LossFocusedDateFilter,
  type LossFocusedMetricId,
  type LossFocusedPeriod,
  type LossFocusedShiftFilter,
} from './lossFocusedKpisData';

type MyLossFocusedKpisExpandedProps = {
  activeMetricIds: LossFocusedMetricId[];
  onBack: () => void;
  onMoveMetricDown: (metricId: LossFocusedMetricId) => void;
  onMoveMetricUp: (metricId: LossFocusedMetricId) => void;
  onOpenActionTrackerExpanded: () => void;
  onToggleMetric: (metricId: LossFocusedMetricId) => void;
};

const shiftFactorMap: Record<LossFocusedShiftFilter, number> = {
  'All Shifts': 1,
  'Shift A': 0.93,
  'Shift B': 1,
  'Shift C': 1.08,
};

const dateFactorMap: Record<LossFocusedDateFilter, number> = {
  Today: 1,
  Yesterday: 0.94,
  '1 Week': 1.06,
  '1 Month': 1.12,
};

const actionStatusTone: Record<LossActionStatus, {bg: string; color: string; border: string}> = {
  Open: {bg: '#EEF4FF', color: '#246BFE', border: '#BFD2F4'},
  'In Progress': {bg: '#EFF8FF', color: '#0B63E5', border: '#B9DCFF'},
  Review: {bg: '#FFF7ED', color: '#EA580C', border: '#FED7AA'},
};

export default function MyLossFocusedKpisExpanded({
  activeMetricIds,
  onBack,
  onMoveMetricDown,
  onMoveMetricUp,
  onOpenActionTrackerExpanded,
  onToggleMetric,
}: MyLossFocusedKpisExpandedProps) {
  const [shiftFilter, setShiftFilter] = useState<LossFocusedShiftFilter>('All Shifts');
  const [dateFilter, setDateFilter] = useState<LossFocusedDateFilter>('Today');
  const [isEditSectionOpen, setIsEditSectionOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<LossFocusedMetricId>(activeMetricIds[0] ?? 'breakdown');
  const period: LossFocusedPeriod = dateFilter === '1 Week' || dateFilter === '1 Month'
    ? 'week'
    : shiftFilter === 'All Shifts'
      ? 'day'
      : 'shift';

  useEffect(() => {
    if (!activeMetricIds.includes(selectedMetric) && activeMetricIds.length > 0) {
      setSelectedMetric(activeMetricIds[0]);
    }
  }, [activeMetricIds, selectedMetric]);

  const orderedMetrics = useMemo(() => {
    if (!activeMetricIds.includes(selectedMetric)) return activeMetricIds;
    return [selectedMetric, ...activeMetricIds.filter((metricId) => metricId !== selectedMetric)];
  }, [activeMetricIds, selectedMetric]);

  return (
    <Box sx={{height: 'calc(100vh - 176px)', minHeight: 640, display: 'flex', flexDirection: 'column', bgcolor: '#FFFFFF', border: '1px solid #C8D8FF', borderRadius: 1, overflow: 'hidden'}}>
      <Box sx={{height: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.4, borderBottom: '1px solid #E5EAF2'}}>
        <Button
          onClick={onBack}
          startIcon={<ArrowBackIcon sx={{fontSize: 18, color: workstationVisuals.textPrimary}} />}
          sx={{
            minWidth: 0,
            px: 0.2,
            color: workstationVisuals.textPrimary,
            fontWeight: 800,
            fontSize: 'clamp(16px, 3.4cqw, 20px)',
            fontFamily: workstationVisuals.fontFamily,
            lineHeight: 1,
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'transparent',
              opacity: 0.85,
            }
          }}
        >
          Loss Focused KPIs
        </Button>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, color: '#0B63E5'}}>
          <StarBorderIcon sx={{fontSize: 17}} />
        </Box>
      </Box>

      <Box sx={{p: 1.2, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', gap: 1.15, minHeight: 0, flex: 1}}>
        <Paper elevation={0} sx={{p: 0.95, borderRadius: 1.2, border: '1px solid #DDE6F3', bgcolor: '#F8FBFF'}}>
          <Box sx={{display: 'grid', gap: 0.8}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
              <FilterIcon sx={{fontSize: 16, color: '#0B63E5'}} />
              <Typography sx={{fontSize: 12.5, color: '#202124', fontWeight: 900}}>Filters</Typography>
            </Box>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap'}}>
              <FilterGroup
                label="Date"
                options={lossFocusedDateFilters.map((item) => ({id: item, label: item === '1 Week' ? '1W' : item === '1 Month' ? '1M' : item}))}
                selected={dateFilter}
                onChange={(value) => setDateFilter(value as LossFocusedDateFilter)}
              />
              <FilterGroup
                label="Shift"
                options={lossFocusedShiftFilters.map((item) => ({id: item, label: item}))}
                selected={shiftFilter}
                onChange={(value) => setShiftFilter(value as LossFocusedShiftFilter)}
              />
            </Box>

            <Box sx={{display: 'grid', gap: 0.5}}>
              <Button
                onClick={() => setIsEditSectionOpen((current) => !current)}
                sx={{justifyContent: 'space-between', minWidth: 0, px: 0, color: '#0B63E5', fontSize: 11.5, fontWeight: 900, textTransform: 'none'}}
              >
                Edit KPIs
                {isEditSectionOpen ? <ExpandLessIcon sx={{fontSize: 18}} /> : <ExpandMoreIcon sx={{fontSize: 18}} />}
              </Button>

              {isEditSectionOpen ? (
                <Box sx={{display: 'grid', gap: 0.55}}>
                  <Typography sx={{fontSize: 11, color: '#667085', fontWeight: 900}}>KPI Library</Typography>
                  <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.45}}>
                    {lossFocusedMetricOptions.map((item) => {
                      const isActive = activeMetricIds.includes(item.id);
                      return (
                    <Button
                      key={item.id}
                      onClick={() => {
                        onToggleMetric(item.id);
                        setSelectedMetric(item.id);
                      }}
                      sx={{
                        minWidth: 0,
                        height: 26,
                        px: 0.9,
                        borderRadius: 999,
                        textTransform: 'none',
                        fontSize: 10.4,
                        fontWeight: 900,
                        color: isActive ? '#0B63E5' : '#526071',
                        bgcolor: isActive ? '#EEF4FF' : '#FFFFFF',
                            border: `1px solid ${isActive ? '#BFD2F4' : '#D6DEEA'}`,
                            '&:hover': {bgcolor: isActive ? '#E5EEFF' : '#F8FAFC'},
                          }}
                        >
                          {isActive ? item.label : `+ ${item.label}`}
                        </Button>
                      );
                    })}
                  </Box>

                  {activeMetricIds.length > 0 ? (
                    <Box sx={{display: 'grid', gap: 0.4}}>
                      <Typography sx={{fontSize: 11, color: '#667085', fontWeight: 900}}>Priority</Typography>
                      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.45}}>
                        {activeMetricIds.map((metricId, index) => {
                          const metric = lossFocusedKpiDefinitions[metricId];
                          return (
                            <Paper
                              key={`priority-${metricId}`}
                              elevation={0}
                              sx={{px: 0.45, py: 0.35, borderRadius: 999, border: '1px solid #D6DEEA', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 0.35}}
                            >
                              <Button
                                onClick={() => setSelectedMetric(metricId)}
                                sx={{
                                  minWidth: 0,
                                  height: 24,
                                  px: 0.75,
                                  borderRadius: 999,
                                  textTransform: 'none',
                                  fontSize: 10.2,
                                  fontWeight: 900,
                                  color: selectedMetric === metricId ? '#0B63E5' : '#344054',
                                  bgcolor: selectedMetric === metricId ? '#EEF4FF' : '#FFFFFF',
                                }}
                              >
                                {`${index + 1}. ${metric.title}`}
                              </Button>
                              <Button
                                onClick={() => onMoveMetricUp(metricId)}
                                disabled={index === 0}
                                sx={{minWidth: 22, width: 22, height: 22, p: 0, borderRadius: 999, color: '#0B63E5', border: '1px solid #D6DEEA'}}
                              >
                                <ArrowUpwardIcon sx={{fontSize: 13}} />
                              </Button>
                              <Button
                                onClick={() => onMoveMetricDown(metricId)}
                                disabled={index === activeMetricIds.length - 1}
                                sx={{minWidth: 22, width: 22, height: 22, p: 0, borderRadius: 999, color: '#0B63E5', border: '1px solid #D6DEEA'}}
                              >
                                <ArrowDownwardIcon sx={{fontSize: 13}} />
                              </Button>
                            </Paper>
                          );
                        })}
                      </Box>
                    </Box>
                  ) : null}
                </Box>
              ) : null}
            </Box>
          </Box>
        </Paper>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {xs: '1fr', xl: '230px minmax(0, 1fr) 255px'},
            gap: 1.1,
            minHeight: 0,
          }}
        >
          <Box sx={{display: 'grid', alignContent: 'start', gap: 0.8, minHeight: 0, overflowY: 'auto', pr: 0.2}}>
            {orderedMetrics.length === 0 ? (
              <Paper elevation={0} sx={{p: 1.1, borderRadius: 1, border: '1px dashed #D6DEEA', bgcolor: '#FAFBFD'}}>
                <Typography sx={{fontSize: 11.5, color: '#667085', lineHeight: 1.45}}>
                  No KPIs selected. Activate items from the KPI Library to build this view.
                </Typography>
              </Paper>
            ) : orderedMetrics.map((metricId, index) => (
              <LossSummaryCard
                key={metricId}
                dateFilter={dateFilter}
                metricId={metricId}
                period={period}
                rank={index + 1}
                selected={selectedMetric === metricId}
                shiftFilter={shiftFilter}
                onSelect={() => setSelectedMetric(metricId)}
              />
            ))}
          </Box>

          <Box sx={{display: 'grid', gap: 0.9, minHeight: 0, overflowY: 'auto', pr: 0.25}}>
            {orderedMetrics.map((metricId, index) => (
              <LossDetailChart
                key={`${metricId}-${period}-${shiftFilter}-${dateFilter}`}
                dateFilter={dateFilter}
                metricId={metricId}
                period={period}
                rank={index + 1}
                shiftFilter={shiftFilter}
              />
            ))}
          </Box>

          <Paper elevation={0} sx={{p: 1, borderRadius: 1.2, border: '1px solid #E5EAF3', bgcolor: '#FFFFFF', display: 'grid', gridTemplateRows: 'auto auto minmax(0, 1fr)', minHeight: 0}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75}}>
              <Typography sx={{fontSize: 13.5, color: '#202124', fontWeight: 900}}>Actions</Typography>
              <Button onClick={onOpenActionTrackerExpanded} sx={{minWidth: 28, width: 28, height: 28, p: 0, borderRadius: 999, color: '#0B63E5', border: '1px solid #DDE6F3'}}>
                <OpenInFullIcon sx={{fontSize: 16}} />
              </Button>
            </Box>

            <Typography sx={{fontSize: 11.3, color: '#667085', lineHeight: 1.4, mb: 0.9}}>
              Linked action items for the KPIs currently in focus.
            </Typography>

            <Box sx={{display: 'grid', gap: 0.75, alignContent: 'start', overflowY: 'auto', pr: 0.2}}>
              {orderedMetrics.map((metricId) => {
                const metricActions = lossFocusedActions.filter((action) => action.metricId === metricId);
                return (
                  <Box key={`actions-${metricId}`} sx={{display: 'grid', gap: 0.5}}>
                    <Typography sx={{fontSize: 10.8, fontWeight: 900, color: '#667085'}}>
                      {lossFocusedKpiDefinitions[metricId].title}
                    </Typography>
                    {metricActions.length > 0 ? metricActions.map((action) => (
                      <Paper key={action.id} elevation={0} sx={{p: 0.9, borderRadius: 1.1, border: '1px solid #E5EAF3', borderLeft: `3px solid ${action.tone}`, bgcolor: '#FFFFFF'}}>
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.6, mb: 0.65}}>
                          <Box sx={{minWidth: 30, height: 24, px: 0.7, borderRadius: 0.8, border: `1px solid color-mix(in srgb, ${action.tone} 33%, transparent)`, color: action.tone, display: 'grid', placeItems: 'center', fontSize: 10.5, fontWeight: 900}}>
                            {action.shortLabel}
                          </Box>
                          <Chip
                            label={action.status}
                            sx={{
                              height: 22,
                              bgcolor: actionStatusTone[action.status].bg,
                              color: actionStatusTone[action.status].color,
                              border: `1px solid ${actionStatusTone[action.status].border}`,
                              fontSize: 10,
                              fontWeight: 900,
                            }}
                          />
                        </Box>
                        <Typography sx={{fontSize: 12.1, color: '#202124', fontWeight: 900, lineHeight: 1.35}}>
                          {action.title}
                        </Typography>
                        <Typography sx={{fontSize: 10.6, color: '#667085', mt: 0.75}}>
                          Owner: {action.owner}
                        </Typography>
                        <Typography sx={{fontSize: 10.6, color: '#EA580C', fontWeight: 900, mt: 0.2}}>
                          {action.dueLabel}
                        </Typography>
                      </Paper>
                    )) : (
                      <Paper elevation={0} sx={{p: 0.95, borderRadius: 1, border: '1px dashed #D6DEEA', bgcolor: '#FAFBFD'}}>
                        <Typography sx={{fontSize: 11.2, color: '#667085'}}>
                          No linked action yet.
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

function FilterGroup({
  label,
  onChange,
  options,
  selected,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{id: string; label: string}>;
  selected: string;
}) {
  return (
    <Box sx={{display: 'grid', gap: 0.35}}>
      <Typography sx={{fontSize: 10.8, color: '#667085', fontWeight: 900}}>{label}</Typography>
      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.45}}>
        {options.map((item) => (
          <Button
            key={item.id}
            onClick={() => onChange(item.id)}
            sx={{
              minWidth: 0,
              height: 28,
              px: 1.15,
              borderRadius: 999,
              textTransform: 'none',
              fontSize: 10.6,
              fontWeight: 900,
              color: selected === item.id ? '#FFFFFF' : '#246BFE',
              bgcolor: selected === item.id ? '#246BFE' : '#FFFFFF',
              border: `1px solid ${selected === item.id ? '#246BFE' : '#D6DEEA'}`,
              '&:hover': {bgcolor: selected === item.id ? '#1658E5' : '#EEF4FF'},
            }}
          >
            {item.label}
          </Button>
        ))}
      </Box>
    </Box>
  );
}

function LossSummaryCard({
  dateFilter,
  metricId,
  onSelect,
  period,
  rank,
  selected,
  shiftFilter,
}: {
  dateFilter: LossFocusedDateFilter;
  metricId: LossFocusedMetricId;
  onSelect: () => void;
  period: LossFocusedPeriod;
  rank: number;
  selected: boolean;
  shiftFilter: LossFocusedShiftFilter;
}) {
  const metric = lossFocusedKpiDefinitions[metricId];
  const data = metric.periods[period];
  const factor = shiftFactorMap[shiftFilter] * dateFactorMap[dateFilter];
  const average = roundOneDecimal(data.average * factor);
  const trendValues = data.trendPoints.map((value) => roundOneDecimal(value * factor));
  const tone = average > data.target ? '#FF4D4F' : '#16A34A';

  return (
    <Paper
      elevation={0}
      onClick={onSelect}
      sx={{
        p: 0.95,
        borderRadius: 1,
        border: selected ? '1px solid #86B8FF' : '1px solid #E5EAF3',
        bgcolor: selected ? '#F8FBFF' : '#FFFFFF',
        cursor: 'pointer',
        boxShadow: selected ? '0 0 0 1px rgba(36, 107, 254, 0.08)' : 'none',
      }}
    >
      <Typography sx={{fontSize: 11.8, fontWeight: 900, color: '#202124'}}>
        {`${rank}. ${metric.title}`}
      </Typography>
      <Typography sx={{fontSize: 10.2, color: '#667085', mt: 0.15}}>
        {metric.subtitle}
      </Typography>

      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', mt: 0.75, border: '1px solid #E1E7F0', borderRadius: 0.9, overflow: 'hidden'}}>
        {lossFocusedPeriods.map((item) => (
          <Box
            key={item.id}
            sx={{
              height: 22,
              display: 'grid',
              placeItems: 'center',
              bgcolor: period === item.id ? '#EEF4FF' : '#FFFFFF',
              color: period === item.id ? '#246BFE' : '#667085',
              fontSize: 8.9,
              fontWeight: 900,
              borderRight: item.id === 'week' ? 'none' : '1px solid #E1E7F0',
            }}
          >
            {item.label}
          </Box>
        ))}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 70px', gap: 0.7, alignItems: 'end', mt: 0.85}}>
        <Box>
          <Typography sx={{fontSize: 9.2, color: '#667085', fontWeight: 900}}>
            {period === 'week' ? 'WEEK AVG' : period === 'shift' ? 'SHIFT AVG' : 'DAY AVG'}
          </Typography>
          <Typography sx={{fontSize: 18.5, lineHeight: 0.95, color: tone, fontWeight: 900, mt: 0.18}}>
            {formatLossPercent(average)}
          </Typography>
          <Typography sx={{fontSize: 10, color: '#202124', mt: 0.45, fontWeight: 800}}>
            TARGET: <Box component="span" sx={{color: '#246BFE'}}>{`<= ${formatLossPercent(data.target)}`}</Box>
          </Typography>
        </Box>
        <Box sx={{ml: -0.85}}>
          <Sparkline values={trendValues} tone={tone} />
        </Box>
      </Box>
    </Paper>
  );
}

function LossDetailChart({
  dateFilter,
  metricId,
  period,
  rank,
  shiftFilter,
}: {
  dateFilter: LossFocusedDateFilter;
  metricId: LossFocusedMetricId;
  period: LossFocusedPeriod;
  rank: number;
  shiftFilter: LossFocusedShiftFilter;
}) {
  const metric = lossFocusedKpiDefinitions[metricId];
  const baseData = metric.periods[period];
  const factor = shiftFactorMap[shiftFilter] * dateFactorMap[dateFilter];
  const values = baseData.detailValues.map((value) => roundOneDecimal(value * factor));
  const average = roundOneDecimal(baseData.average * factor);
  const summaryMinutes = Math.round(baseData.summaryMinutes * factor);
  const tone = average > baseData.target ? '#FF4D4F' : '#16A34A';

  return (
    <Paper elevation={0} sx={{p: 1.05, borderRadius: 1, border: '1px solid #E5EAF3', bgcolor: '#FFFFFF'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, mb: 0.8}}>
        <Box>
          <Typography sx={{fontSize: 12.5, color: '#202124', fontWeight: 900}}>
            {`${rank}. ${metric.title}`}
          </Typography>
          <Typography sx={{fontSize: 10.5, color: '#667085', mt: 0.15}}>
            {metric.subtitle} | {dateFilter === '1 Week' ? '1W' : dateFilter === '1 Month' ? '1M' : dateFilter} | {shiftFilter}
          </Typography>
        </Box>
        <Box sx={{textAlign: 'right'}}>
          <Typography sx={{fontSize: 21, color: tone, lineHeight: 0.95}}>
            {summaryMinutes}
            <Box component="span" sx={{fontSize: 11.5, color: '#7A7F87', ml: 0.35, fontWeight: 700}}>Mins</Box>
          </Typography>
          <Typography sx={{fontSize: 10.5, color: '#246BFE', fontWeight: 900, mt: 0.2}}>
            {formatLossPercent(average)} avg
          </Typography>
        </Box>
      </Box>

      <LossBarsChart
        labels={baseData.detailLabels}
        target={baseData.target}
        values={values}
      />
    </Paper>
  );
}

function LossBarsChart({
  labels,
  target,
  values,
}: {
  labels: string[];
  target: number;
  values: number[];
}) {
  const maxValue = Math.max(35, ...values.map((value) => value + 2), target + 6);

  return (
    <Box sx={{border: '1px solid #E5EAF3', borderRadius: 0.9, p: 0.9, bgcolor: '#FFFFFF'}}>
      <Box sx={{position: 'relative', height: 188, display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr)', gap: 0.75}}>
        <Box sx={{display: 'grid', gridTemplateRows: 'repeat(6, 1fr)', alignItems: 'end'}}>
          {[100, 80, 60, 40, 20, 0].map((tick) => (
            <Typography key={tick} sx={{fontSize: 9, color: '#667085', textAlign: 'right'}}>
              {tick}%
            </Typography>
          ))}
        </Box>

        <Box sx={{position: 'relative', display: 'grid', gridTemplateRows: '1fr auto'}}>
          <Box sx={{position: 'relative', borderLeft: '1px solid #E5EAF3', borderBottom: '1px solid #E5EAF3'}}>
            {[0, 1, 2, 3, 4].map((step) => (
              <Box
                key={step}
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: `${step * 20}%`,
                  borderTop: '1px solid #EEF2F6',
                }}
              />
            ))}

            <Box
              sx={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: `${(target / maxValue) * 100}%`,
                borderTop: '2px dashed #5B8CFF',
              }}
            />

            <Box sx={{position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))`, alignItems: 'end', gap: 0.4, px: 0.7, pb: 0.4}}>
              {values.map((value, index) => {
                const aboveTarget = value > target;
                return (
                  <Box key={`${labels[index]}-${index}`} sx={{display: 'grid', alignItems: 'end', justifyItems: 'center', height: '100%'}}>
                    <Typography sx={{fontSize: 8.9, color: '#202124', fontWeight: 900, mb: 0.3}}>
                      {`${value.toFixed(1).replace('.0', '')}%`}
                    </Typography>
                    <Box
                      sx={{
                        width: '70%',
                        minWidth: 10,
                        height: `${(value / maxValue) * 100}%`,
                        borderRadius: '3px 3px 0 0',
                        bgcolor: aboveTarget ? '#FF3B30' : '#58B368',
                      }}
                    />
                  </Box>
                );
              })}
            </Box>
          </Box>

          <Box sx={{display: 'grid', gridTemplateColumns: `repeat(${labels.length}, minmax(0, 1fr))`, gap: 0.4, px: 0.7, pt: 0.45}}>
            {labels.map((label) => (
              <Typography key={label} sx={{fontSize: 8.8, color: '#667085', textAlign: 'center'}}>
                {label}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function Sparkline({tone, values}: {tone: string; values: number[]}) {
  const width = 72;
  const height = 30;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 0.5);
  const points = values.map((value, index) => {
    const x = 2 + (index / Math.max(values.length - 1, 1)) * (width - 6);
    const y = height - ((value - min) / range) * (height - 8) - 4;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} aria-hidden="true">
      <line x1="0" x2={width} y1={height - 8} y2={height - 8} stroke="#EDF2F7" strokeWidth="1" />
      <polyline fill="none" stroke={tone} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

function roundOneDecimal(value: number) {
  return Math.round(value * 10) / 10;
}
