import {Box, Typography} from '@mui/material';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';
import {workstationChartSemantic, workstationRechartsTheme, workstationTierInsetCardSx, workstationVisuals} from '../theme';
import WorkstationAutoChartArea from './WorkstationAutoChartArea';
import WidgetShell from './WidgetShell';

const data = [
  {time: '6 AM', production: 350, target: 400},
  {time: '7', production: 420, target: 400},
  {time: '8', production: 500, target: 480},
  {time: '9', production: 490, target: 480},
  {time: '10', production: 480, target: 480},
  {time: '11', production: 410, target: 480},
  {time: '12 PM', production: 350, target: 480},
];

const kpis = [
  {label: 'Shift Target', value: '2,000', unit: 'pcs'},
  {label: 'To Target', value: '1,688', unit: 'pcs'},
  {label: 'Est. Complete', value: '2:30 PM', unit: ''},
];

export default function WorkstationProductionVsTargetWidget() {
  return (
    <WidgetShell title="Production vs Target">
      <Box sx={{display: 'flex', flexGrow: 1, gap: 1.5, minHeight: 0, height: '100%'}}>

        {/* Left — Chart */}
        <Box sx={{flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0}}>
          {/* Legend */}
          <Box sx={{display: 'flex', justifyContent: 'center', mb: 0.75, gap: 2}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
              <Box sx={{width: 16, height: 2, bgcolor: workstationChartSemantic.targetLine, borderRadius: 1}} />
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  color: workstationVisuals.tierTextLabel,
                  fontWeight: 700,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                Target
              </Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
              <Box sx={{width: 10, height: 10, bgcolor: workstationChartSemantic.good, borderRadius: '2px'}} />
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  color: workstationVisuals.tierTextLabel,
                  fontWeight: 700,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                On target
              </Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
              <Box sx={{width: 10, height: 10, bgcolor: workstationChartSemantic.bad, borderRadius: '2px'}} />
              <Typography
                sx={{
                  fontSize: '0.65rem',
                  color: workstationVisuals.tierTextLabel,
                  fontWeight: 700,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                Below target
              </Typography>
            </Box>
          </Box>

          <Box sx={{flexGrow: 1, minHeight: 0}}>
            <WorkstationAutoChartArea maxHeight={400}>
              {(chartHeight, chartWidth) => (
                <ComposedChart
                  width={chartWidth}
                  height={chartHeight}
                  data={data}
                  margin={{top: 5, right: 8, left: -20, bottom: 0}}
                >
                  <CartesianGrid
                    strokeDasharray={workstationRechartsTheme.gridDash}
                    vertical={false}
                    stroke={workstationRechartsTheme.gridColor}
                  />
                  <XAxis
                    dataKey="time"
                    tick={workstationRechartsTheme.axisTickStyle}
                    dy={8}
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
                  <Bar dataKey="production" barSize={18} radius={[3, 3, 0, 0]}>
                    {data.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.production >= entry.target
                            ? workstationChartSemantic.good
                            : workstationChartSemantic.bad
                        }
                      />
                    ))}
                  </Bar>
                  <Line
                    type="monotone"
                    dataKey="target"
                    stroke={workstationChartSemantic.targetLine}
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </ComposedChart>
              )}
            </WorkstationAutoChartArea>
          </Box>
        </Box>

        {/* Right — KPI panel */}
        <Box
          sx={{
            ...workstationTierInsetCardSx,
            minWidth: 110,
            p: 1.2,
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
                  color: workstationVisuals.tierTextMeta,
                  fontWeight: 700,
                  fontSize: '0.62rem',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  fontFamily: workstationVisuals.fontFamily,
                  mb: 0.3,
                }}
              >
                {kpi.label}
              </Typography>
              <Typography
                sx={{
                  color: workstationVisuals.tierTextHeading,
                  fontWeight: 900,
                  fontSize: '1.1rem',
                  lineHeight: 1,
                  fontFamily: workstationVisuals.fontFamily,
                }}
              >
                {kpi.value}
                {kpi.unit && (
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.7rem',
                      color: workstationVisuals.tierTextMeta,
                      fontWeight: 600,
                      ml: 0.3,
                      fontFamily: workstationVisuals.fontFamily,
                    }}
                  >
                    {kpi.unit}
                  </Typography>
                )}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </WidgetShell>
  );
}
