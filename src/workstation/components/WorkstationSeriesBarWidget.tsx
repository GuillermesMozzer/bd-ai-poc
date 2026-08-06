import {Box, Typography} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {
  workstationRechartsTheme,
  workstationTierInsetCardSx,
  workstationVisuals,
} from '../theme';
import WorkstationAutoChartArea from './WorkstationAutoChartArea';
import WidgetShell from './WidgetShell';

type BarSeriesConfig = {
  color: string;
  data: Array<number | {color: string; value: number}>;
  label: string;
  stack?: string;
};

type WorkstationSeriesBarWidgetProps = {
  height?: number;
  labels: string[];
  series: BarSeriesConfig[];
  summaryItems?: Array<{label: string; tone: string; value: string}>;
  title?: string;
};

export default function WorkstationSeriesBarWidget({
  height = 250,
  labels,
  series,
  summaryItems = [],
  title,
}: WorkstationSeriesBarWidgetProps) {
  // Transform data for Recharts
  const chartData = labels.map((label, index) => {
    const dataPoint: any = {label};
    series.forEach((s) => {
      const val = s.data[index];
      dataPoint[s.label] = typeof val === 'object' ? val.value : val;
    });
    return dataPoint;
  });

  return (
    <WidgetShell title={title}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.4, minHeight: 0, height: '100%'}}>
      {summaryItems.length ? (
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 1}}>
          {summaryItems.map((item) => (
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
                  fontFamily: workstationVisuals.fontFamily,
                  lineHeight: 1.05,
                }}
              >
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : null}

      <WorkstationAutoChartArea maxHeight={height}>
        {(chartHeight, chartWidth) => (
          <BarChart
            width={chartWidth}
            height={chartHeight}
            data={chartData}
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
            {series.map((s) => (
              <Bar key={s.label} dataKey={s.label} stackId={s.stack} radius={[2, 2, 0, 0]}>
                {labels.map((_, index) => {
                  const val = s.data[index];
                  const barColor = typeof val === 'object' ? val.color : s.color;
                  return <Cell key={`cell-${index}`} fill={barColor} />;
                })}
              </Bar>
            ))}
          </BarChart>
        )}
      </WorkstationAutoChartArea>
    </Box>
    </WidgetShell>
  );
}
