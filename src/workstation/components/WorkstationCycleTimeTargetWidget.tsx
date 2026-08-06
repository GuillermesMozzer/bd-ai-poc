import {Box, Chip, Typography} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type {WorkstationMetricPoint} from '../types';
import {
  getTargetComparisonColor,
  workstationChartSemantic,
  workstationRechartsTheme,
  workstationTierInsetCardSx,
  workstationVisuals,
} from '../theme';
import WorkstationAutoChartArea from './WorkstationAutoChartArea';
import WidgetShell from './WidgetShell';

type WorkstationCycleTimeTargetWidgetProps = {
  cycleTimeVsTarget: Record<string, WorkstationMetricPoint[]>;
  onSelectTarget: (targetKey: string) => void;
  selectedTarget: string;
};

export default function WorkstationCycleTimeTargetWidget({
  cycleTimeVsTarget,
  onSelectTarget,
  selectedTarget,
}: WorkstationCycleTimeTargetWidgetProps) {
  const targetKeys = Object.keys(cycleTimeVsTarget);
  const activeTarget = cycleTimeVsTarget[selectedTarget] ? selectedTarget : targetKeys[0];
  const series = cycleTimeVsTarget[activeTarget] ?? [];
  const latestPoint = series[series.length - 1];
  const latestActual = Number(latestPoint?.actual ?? 0);
  const latestTargetValue = Number(latestPoint?.target ?? 0);
  const variance = latestActual - latestTargetValue;
  const actualTone = getTargetComparisonColor(latestActual, latestTargetValue, false);

  return (
    <WidgetShell
      title="Cycle Time vs Target"
      action={
        <Box sx={{display: 'flex', gap: 0.5}}>
          {targetKeys.map((targetKey) => {
            const isSelected = targetKey === activeTarget;
            return (
              <Chip
                key={targetKey}
                size="small"
                label={targetKey}
                onClick={() => onSelectTarget(targetKey)}
                sx={{
                  height: 20,
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  bgcolor: isSelected ? workstationVisuals.blueSoft : workstationVisuals.tierSurfaceMuted,
                  color: isSelected ? workstationVisuals.blue : workstationVisuals.tierTextMeta,
                  border: isSelected ? `1px solid rgba(4,78,215,0.15)` : `1px solid ${workstationVisuals.tierBorder}`,
                  fontFamily: workstationVisuals.fontFamily,
                  '&:hover': {bgcolor: isSelected ? workstationVisuals.blueSoft : workstationVisuals.tierSurface},
                }}
              />
            );
          })}
        </Box>
      }
    >
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.4, minHeight: 0, height: '100%'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 1}}>
          {[
            {label: 'Latest actual', value: `${latestActual.toFixed(2)} s`, tone: workstationVisuals.tierTextHeading},
            {label: 'Target', value: `${latestTargetValue.toFixed(2)} s`, tone: workstationVisuals.tierTextLabel},
            {
              label: 'Variance',
              value: `${variance >= 0 ? '+' : ''}${variance.toFixed(2)} s`,
              tone: variance > 0 ? workstationChartSemantic.bad : workstationChartSemantic.good,
            },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                ...workstationTierInsetCardSx,
                p: 1.05,
                backgroundImage: workstationVisuals.tierPanelBackground,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: workstationVisuals.tierTextLabel,
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                {item.label}
              </Typography>
              <Typography
                sx={{
                  color: item.tone,
                  fontWeight: 900,
                  mt: 0.35,
                  lineHeight: 1.05,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        <WorkstationAutoChartArea maxHeight={250}>
          {(chartHeight, chartWidth) => (
            <LineChart
              width={chartWidth}
              height={chartHeight}
              data={series}
              margin={{top: 10, right: 10, left: -20, bottom: 0}}
            >
              <CartesianGrid
                strokeDasharray={workstationRechartsTheme.gridDash}
                vertical={false}
                stroke={workstationRechartsTheme.gridColor}
              />
              <XAxis
                dataKey="label"
                tick={workstationRechartsTheme.axisTickStyle}
                {...workstationRechartsTheme.axisProps}
              />
              <YAxis
                tick={workstationRechartsTheme.axisTickStyle}
                {...workstationRechartsTheme.axisProps}
              />
              <Tooltip
                contentStyle={workstationRechartsTheme.tooltipContentStyle}
                labelStyle={workstationRechartsTheme.tooltipLabelStyle}
                itemStyle={workstationRechartsTheme.tooltipItemStyle}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke={actualTone}
                strokeWidth={2.5}
                dot={false}
                activeDot={{r: 6}}
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke={workstationChartSemantic.targetLine}
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          )}
        </WorkstationAutoChartArea>
      </Box>
    </WidgetShell>
  );
}
