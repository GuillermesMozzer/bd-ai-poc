import {Box, Typography} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  workstationRechartsTheme,
  workstationTierInsetCardSx,
  workstationVisuals,
} from '../theme';
import WorkstationAutoChartArea from './WorkstationAutoChartArea';
import WidgetShell from './WidgetShell';

type LineSeriesConfig = {
  color: string;
  data: number[];
  id: string;
  label: string;
};

type WorkstationSeriesLineWidgetProps = {
  height?: number;
  labels: string[];
  series: LineSeriesConfig[];
  summaryItems?: Array<{label: string; tone: string; value: string}>;
  yMin?: number;
  title?: string;
};

export default function WorkstationSeriesLineWidget({
  height = 250,
  labels,
  series,
  summaryItems = [],
  yMin,
  title,
}: WorkstationSeriesLineWidgetProps) {
  // Transform data for Recharts
  const chartData = labels.map((label, index) => {
    const dataPoint: any = {label};
    series.forEach((s) => {
      dataPoint[s.label] = s.data[index];
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
          <LineChart
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
              domain={yMin !== undefined ? [yMin, 'auto'] : ['auto', 'auto']}
              tick={workstationRechartsTheme.axisTickStyle}
              {...workstationRechartsTheme.axisProps}
            />
            <Tooltip
              contentStyle={workstationRechartsTheme.tooltipContentStyle}
              labelStyle={workstationRechartsTheme.tooltipLabelStyle}
              itemStyle={workstationRechartsTheme.tooltipItemStyle}
            />
            {series.map((s) => (
              <Line
                key={s.label}
                type="monotone"
                dataKey={s.label}
                stroke={s.color}
                strokeWidth={2.5}
                dot={false}
                activeDot={{r: 6}}
              />
            ))}
          </LineChart>
        )}
      </WorkstationAutoChartArea>
    </Box>
    </WidgetShell>
  );
}
