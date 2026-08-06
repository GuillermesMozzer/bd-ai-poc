import {Box, Typography} from '@mui/material';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {workstationChartSemantic, workstationRechartsTheme, workstationVisuals} from '../theme';
import WorkstationAutoChartArea from './WorkstationAutoChartArea';
import WidgetShell from './WidgetShell';

type ScrapTrendDataPoint = {
  time: string;
  scrap: number;
};

interface WorkstationScrapTrendDetailedWidgetProps {
  data: ScrapTrendDataPoint[];
  targetPercent?: number;
  currentScrapPercent?: number;
  vsTarget?: number;
  vsYesterday?: number;
}

export default function WorkstationScrapTrendDetailedWidget({
  data,
  targetPercent = 1.0,
  currentScrapPercent = 1.32,
  vsTarget = 0.32,
  vsYesterday = 0.18,
}: WorkstationScrapTrendDetailedWidgetProps) {
  const isAboveTarget = currentScrapPercent > targetPercent;
  const valueColor = isAboveTarget ? workstationChartSemantic.bad : workstationChartSemantic.good;

  const kpis = [
    {
      label: 'Scrap %',
      value: `${currentScrapPercent.toFixed(2)}%`,
      color: valueColor,
      size: '2rem',
    },
    {
      label: 'Target',
      value: `${targetPercent.toFixed(2)}%`,
      color: workstationVisuals.tierTextHeading,
      size: '1.1rem',
    },
    {
      label: 'vs Target',
      value: `${vsTarget > 0 ? '+' : ''}${vsTarget.toFixed(2)} pp`,
      color: vsTarget > 0 ? workstationChartSemantic.bad : workstationChartSemantic.good,
      size: '1rem',
    },
    {
      label: 'vs Yesterday',
      value: `${vsYesterday > 0 ? '+' : ''}${vsYesterday.toFixed(2)} pp`,
      color: vsYesterday > 0 ? workstationChartSemantic.bad : workstationChartSemantic.good,
      size: '1rem',
    },
  ];

  return (
    <WidgetShell
      title="Scrap Overview"
      action={
        <Typography
          sx={{
            color: workstationVisuals.blue,
            fontWeight: 700,
            fontSize: '0.72rem',
            cursor: 'pointer',
            fontFamily: workstationVisuals.fontFamily,
            '&:hover': {textDecoration: 'underline'},
          }}
        >
          Today ⌄
        </Typography>
      }
    >
      <Box sx={{display: 'flex', flexGrow: 1, gap: 2.5, minHeight: 0, height: '100%'}}>

        {/* Left — KPI Panel */}
        <Box
          sx={{
            minWidth: 110,
            borderRight: `1px solid ${workstationVisuals.tierBorder}`,
            pr: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {kpis.map((kpi) => (
            <Box key={kpi.label}>
              <Typography
                sx={{
                  color: workstationVisuals.tierTextLabel,
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  mb: 0.25,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                {kpi.label}
              </Typography>
              <Typography
                sx={{
                  color: kpi.color,
                  fontWeight: 700,
                  fontSize: kpi.size,
                  lineHeight: 1,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                {kpi.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Right — Chart */}
        <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
          <Box sx={{flexGrow: 1, minHeight: 0}}>
            <WorkstationAutoChartArea maxHeight={400}>
              {(chartHeight, chartWidth) => (
                <ComposedChart
                  width={chartWidth}
                  height={chartHeight}
                  data={data}
                  margin={{top: 5, right: 10, left: -20, bottom: 5}}
                >
                  <defs>
                    {/* Gradient fill: bad (above target) fades to good (below) */}
                    <linearGradient id="scrapAreaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={workstationChartSemantic.bad} stopOpacity={0.18} />
                      <stop offset="60%" stopColor={workstationChartSemantic.bad} stopOpacity={0.06} />
                      <stop offset="100%" stopColor={workstationChartSemantic.good} stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray={workstationRechartsTheme.gridDash}
                    vertical={false}
                    stroke={workstationRechartsTheme.gridColor}
                  />
                  <XAxis
                    dataKey="time"
                    tick={workstationRechartsTheme.axisTickStyle}
                    {...workstationRechartsTheme.axisProps}
                  />
                  <YAxis
                    domain={[0, 'dataMax + 0.5']}
                    tickFormatter={(val) => `${val}%`}
                    tick={workstationRechartsTheme.axisTickStyle}
                    {...workstationRechartsTheme.axisProps}
                  />
                  <Tooltip
                    contentStyle={workstationRechartsTheme.tooltipContentStyle}
                    labelStyle={workstationRechartsTheme.tooltipLabelStyle}
                    itemStyle={workstationRechartsTheme.tooltipItemStyle}
                    formatter={(val: number) => [`${val.toFixed(2)}%`, 'Scrap']}
                  />

                  {/* Target reference line */}
                  <ReferenceLine
                    y={targetPercent}
                    stroke={workstationChartSemantic.targetLine}
                    strokeDasharray="4 4"
                    label={{
                      position: 'right',
                      value: `Target (${targetPercent.toFixed(2)}%)`,
                      fill: workstationVisuals.tierTextMeta,
                      fontSize: 10,
                      fontWeight: 600,
                      fontFamily: workstationVisuals.fontFamily,
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="scrap"
                    stroke="none"
                    fill="url(#scrapAreaFill)"
                  />

                  <Line
                    type="monotone"
                    dataKey="scrap"
                    stroke={workstationChartSemantic.bad}
                    strokeWidth={2.5}
                    dot={(props: any) => {
                      const {cx, cy, payload} = props;
                      const isAbove = payload.scrap > targetPercent;
                      return (
                        <circle
                          key={`dot-${payload.time}`}
                          cx={cx}
                          cy={cy}
                          r={4}
                          stroke={isAbove ? workstationChartSemantic.bad : workstationChartSemantic.good}
                          fill={workstationVisuals.tierSurface}
                          strokeWidth={2.5}
                        />
                      );
                    }}
                    activeDot={{r: 6}}
                  />
                </ComposedChart>
              )}
            </WorkstationAutoChartArea>
          </Box>

          {/* Legend */}
          <Box sx={{display: 'flex', justifyContent: 'center', gap: 3, mt: 1}}>
            {[
              {color: workstationChartSemantic.good, label: 'At or below target'},
              {color: workstationChartSemantic.bad, label: 'Above target'},
            ].map((item) => (
              <Box key={item.label} sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: item.color,
                    transform: 'rotate(45deg)',
                    borderRadius: '1px',
                    flexShrink: 0,
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.7rem',
                    color: workstationVisuals.tierTextLabel,
                    fontWeight: 600,
                    fontFamily: workstationVisuals.fontFamily,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </WidgetShell>
  );
}
