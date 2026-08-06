import React from 'react';
import {BarChart} from '@mui/x-charts/BarChart';
import {Paper, Typography} from '@mui/material';
import type {ProductionTrendPoint} from '../types';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
} as const;

export default function PlanVsActualTrendCard({trendData}: {trendData: ProductionTrendPoint[]}) {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, p: 1.6}}>
      <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
        Plan vs Actual Trend
      </Typography>
      <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 0.55}}>
        Plan Units, Actual Units, and line-level performance trend.
      </Typography>
      <BarChart
        height={280}
        xAxis={[{scaleType: 'band', data: trendData.map((point) => point.lineName)}]}
        series={[
          {data: trendData.map((point) => point.planUnits), label: 'Plan Units', color: '#2563EB'},
          {data: trendData.map((point) => point.actualUnits), label: 'Actual Units', color: '#16A34A'},
        ]}
        margin={{left: 56, right: 24, top: 24, bottom: 36}}
      />
    </Paper>
  );
}
