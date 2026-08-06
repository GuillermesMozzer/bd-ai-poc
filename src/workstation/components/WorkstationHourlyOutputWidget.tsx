import {Box, Typography} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
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

type WorkstationHourlyOutputWidgetProps = {
  hourlyOutput: WorkstationMetricPoint[];
  targetThroughputPerHour: number;
};

export default function WorkstationHourlyOutputWidget({
  hourlyOutput,
  targetThroughputPerHour,
}: WorkstationHourlyOutputWidgetProps) {
  const outputs = hourlyOutput.map((item) => Number(item.output));
  const totalOutput = outputs.reduce((sum, value) => sum + value, 0);
  const averageOutput = outputs.length ? totalOutput / outputs.length : 0;

  const kpis = [
    {label: 'Hourly total', value: totalOutput.toLocaleString(), tone: workstationVisuals.tierTextHeading},
    {label: 'Hourly average', value: averageOutput.toFixed(0), tone: workstationVisuals.blue},
    {label: 'Target / hour', value: targetThroughputPerHour.toLocaleString(), tone: workstationVisuals.tierTextLabel},
  ];

  return (
    <WidgetShell title="Hourly Output">
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.4, minHeight: 0, height: '100%'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 1}}>
          {kpis.map((item) => (
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
            <BarChart
              width={chartWidth}
              height={chartHeight}
              data={hourlyOutput}
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
              <ReferenceLine
                y={targetThroughputPerHour}
                stroke={workstationChartSemantic.targetLine}
                strokeDasharray="3 3"
              />
              <Bar dataKey="output" radius={[2, 2, 0, 0]}>
                {hourlyOutput.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={getTargetComparisonColor(Number(entry.output), targetThroughputPerHour, true)}
                  />
                ))}
              </Bar>
            </BarChart>
          )}
        </WorkstationAutoChartArea>
      </Box>
    </WidgetShell>
  );
}
