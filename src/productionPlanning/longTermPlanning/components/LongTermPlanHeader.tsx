import {Box, Paper} from '@mui/material';
import type {LongTermPlan} from '../types';
import {MetricCard, SectionHeader} from '../../ui/PlanningComponents';
import {planningCardSx} from '../../ui/planningTheme';

type LongTermPlanHeaderProps = {
  plan: LongTermPlan;
  totalRequested: number;
  totalCommitted: number;
  exceptionCount: number;
};

export default function LongTermPlanHeader({plan, totalRequested, totalCommitted, exceptionCount}: LongTermPlanHeaderProps) {
  const cards: Array<{label: string; value: React.ReactNode; tone?: 'default' | 'success' | 'warning' | 'danger' | 'blue'}> = [
    {label: 'Selected Plan', value: plan.name},
    {label: 'Site', value: plan.site},
    {label: 'Horizon', value: `${plan.horizonStartMonth} to ${plan.horizonEndMonth}`},
    {label: 'Total Requested', value: totalRequested.toLocaleString()},
    {label: 'Total Committed', value: totalCommitted.toLocaleString()},
    {label: 'Exceptions', value: exceptionCount, tone: exceptionCount ? 'warning' : 'success'},
  ];

  return (
    <Box sx={{display: 'grid', gap: 1.4}}>
      <Paper elevation={0} sx={{...planningCardSx, p: 1.2}}>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))'}, gap: 1.1}}>
          {cards.map((card) => (
            <MetricCard key={card.label} label={card.label} value={card.value} tone={card.tone} />
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
