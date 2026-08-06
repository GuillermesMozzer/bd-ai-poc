import {
  AccessTimeRounded as AccessTimeRoundedIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmberRounded as WarningAmberRoundedIcon,
} from '@mui/icons-material';
import {Box, Paper, Typography} from '@mui/material';
import {BarChart} from '@mui/x-charts/BarChart';
import type {CapacitySummary} from '../types';
import {SectionHeader, SummaryTile} from '../../ui/PlanningComponents';
import {planningCardSx, planningTokens} from '../../ui/planningTheme';

type CapacitySummaryPanelProps = {
  summary: CapacitySummary;
  monthlyUtilization: Array<{month: string; utilizationPercent: number}>;
};

export default function CapacitySummaryPanel({summary, monthlyUtilization}: CapacitySummaryPanelProps) {
  const tiles: Array<{label: string; value: React.ReactNode; tone?: 'default' | 'success' | 'warning' | 'danger' | 'blue'; icon: React.ReactNode}> = [
    {label: 'Total Required Hours', value: summary.totalRequiredHours, icon: <AccessTimeRoundedIcon fontSize="small" />},
    {label: 'Total Available Hours', value: summary.totalAvailableHours, icon: <CalendarMonthOutlinedIcon fontSize="small" />},
    {label: 'Remaining Hours', value: summary.remainingHours, tone: summary.remainingHours < 0 ? 'danger' : 'blue', icon: <TrendingUpIcon fontSize="small" />},
    {label: 'Average Utilization %', value: `${summary.averageUtilizationPercent}%`, tone: summary.averageUtilizationPercent >= 90 ? 'warning' : 'blue', icon: <TrendingUpIcon fontSize="small" />},
    {label: 'Feasible Items', value: summary.feasibleItems, tone: 'success', icon: <CheckCircleOutlineIcon fontSize="small" />},
    {label: 'Constrained Items', value: summary.constrainedItems, tone: summary.constrainedItems ? 'danger' : 'default', icon: <ErrorOutlineIcon fontSize="small" />},
    {label: 'At-Risk Items', value: summary.atRiskItems, tone: summary.atRiskItems ? 'warning' : 'default', icon: <WarningAmberRoundedIcon fontSize="small" />},
    {label: 'Pending-Data Items', value: summary.pendingDataItems, tone: summary.pendingDataItems ? 'blue' : 'default', icon: <CalendarMonthOutlinedIcon fontSize="small" />},
    {label: 'Not-Producible Items', value: summary.notProducibleItems, tone: summary.notProducibleItems ? 'danger' : 'default', icon: <ErrorOutlineIcon fontSize="small" />},
  ];

  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 2}}>
      <SectionHeader eyebrow="Capacity Summary" title="Feasibility across the visible planning horizon" />

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr 1fr', xl: 'repeat(5, minmax(0, 1fr))'}, gap: 1.1, mt: 1.7}}>
        {tiles.map((tile) => (
          <SummaryTile key={tile.label} label={tile.label} value={tile.value} tone={tile.tone} icon={tile.icon} />
        ))}
      </Box>

      <Paper elevation={0} sx={{mt: 1.7, p: 1.4, borderRadius: 4, border: `1px solid ${planningTokens.border}`, boxShadow: 'none'}}>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: planningTokens.textPrimary, textTransform: 'uppercase', letterSpacing: '0.08em'}}>
          Utilization by month
        </Typography>
        <BarChart
          height={300}
          xAxis={[{
            scaleType: 'band',
            data: monthlyUtilization.map((item) => item.month),
            tickLabelStyle: {fill: planningTokens.textSecondary, fontSize: 11},
          }]}
          yAxis={[{
            min: 0,
            max: 150,
            tickLabelStyle: {fill: planningTokens.textSecondary, fontSize: 11},
          }]}
          grid={{horizontal: true}}
          series={[{
            data: monthlyUtilization.map((item) => item.utilizationPercent),
            color: '#5B5CEB',
            label: 'Utilization %',
          }]}
          margin={{left: 46, right: 20, top: 22, bottom: 28}}
          sx={{
            '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': {stroke: '#CBD5E1'},
            '& .MuiChartsGrid-line': {stroke: '#D7E1F0', strokeDasharray: '4 4'},
            '& .MuiBarElement-root': {rx: 8, ry: 8},
          }}
        />
      </Paper>
    </Paper>
  );
}
