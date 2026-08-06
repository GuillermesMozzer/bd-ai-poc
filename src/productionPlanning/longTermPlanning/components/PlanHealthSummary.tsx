import {
  CalendarMonth as CalendarMonthIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  Inventory2Outlined as Inventory2OutlinedIcon,
  ScheduleOutlined as ScheduleOutlinedIcon,
  TrendingUp as TrendingUpIcon,
  WarningAmberRounded as WarningAmberRoundedIcon,
} from '@mui/icons-material';
import {Box} from '@mui/material';
import type {PlanHealthSummary as PlanHealthSummaryType} from '../types';
import {MetricCard} from '../../ui/PlanningComponents';

type PlanHealthSummaryProps = {
  summary: PlanHealthSummaryType;
};

export default function PlanHealthSummary({summary}: PlanHealthSummaryProps) {
  const cards: Array<{label: string; value: React.ReactNode; tone?: 'default' | 'success' | 'warning' | 'danger' | 'blue'; icon: React.ReactNode}> = [
    {label: 'Total Requested Quantity', value: summary.totalRequestedQuantity.toLocaleString(), icon: <Inventory2OutlinedIcon fontSize="small" />},
    {label: 'Total Committed Quantity', value: summary.totalCommittedQuantity.toLocaleString(), icon: <CheckCircleOutlineIcon fontSize="small" />},
    {label: 'Commitment Gap', value: summary.commitmentGap.toLocaleString(), tone: summary.commitmentGap > 0 ? 'warning' : 'default', icon: <TrendingUpIcon fontSize="small" />},
    {label: 'Average Utilization %', value: `${summary.averageUtilizationPercent}%`, tone: summary.averageUtilizationPercent >= 90 ? 'warning' : 'default', icon: <TrendingUpIcon fontSize="small" />},
    {label: 'Feasible Rows', value: summary.feasibleItems, tone: 'success', icon: <CheckCircleOutlineIcon fontSize="small" />},
    {label: 'At-Risk Rows', value: summary.atRiskItems, tone: summary.atRiskItems > 0 ? 'warning' : 'default', icon: <WarningAmberRoundedIcon fontSize="small" />},
    {label: 'Constrained Rows', value: summary.constrainedItems, tone: summary.constrainedItems > 0 ? 'danger' : 'default', icon: <ErrorOutlineIcon fontSize="small" />},
    {label: 'Pending Data', value: summary.pendingDataItems, tone: summary.pendingDataItems > 0 ? 'blue' : 'default', icon: <ScheduleOutlinedIcon fontSize="small" />},
    {label: 'Not Producible', value: summary.notProducibleItems, tone: summary.notProducibleItems > 0 ? 'danger' : 'default', icon: <ErrorOutlineIcon fontSize="small" />},
    {label: 'Requires Decision', value: summary.requiresDecisionItems, tone: summary.requiresDecisionItems > 0 ? 'blue' : 'default', icon: <WarningAmberRoundedIcon fontSize="small" />},
    {label: 'Overloaded Line/Months', value: summary.overloadedLineMonths, tone: summary.overloadedLineMonths > 0 ? 'danger' : 'default', icon: <TrendingUpIcon fontSize="small" />},
    {label: 'Highest Utilization Month', value: summary.highestUtilizationMonth || '—', icon: <CalendarMonthIcon fontSize="small" />},
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))'},
        gap: 1.35,
      }}
    >
      {cards.map((card) => (
        <MetricCard key={card.label} label={card.label} value={card.value} tone={card.tone} icon={card.icon} />
      ))}
    </Box>
  );
}
