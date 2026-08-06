import {Alert, Box, Paper, Typography} from '@mui/material';
import {LineChart} from '@mui/x-charts/LineChart';
import {planningTokens, planningSurfaceSx} from '../../ui/planningTheme';
import type {UtilizationChartPoint} from '../types';

type Props = {
  data: UtilizationChartPoint[];
};

export default function UtilizationImpactChart({data}: Props) {
  const hasOverload = data.some((d) => d.scenario > 100);
  const periods = data.map((d) => d.period);
  const baselineValues = data.map((d) => d.baseline);
  const scenarioValues = data.map((d) => d.scenario);

  return (
    <Box>
      <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.textPrimary, mb: 1}}>
        Utilization % Over Time
      </Typography>
      <Paper elevation={0} sx={{...planningSurfaceSx, p: 2}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 3, mb: 1.5}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
            <Box sx={{width: 20, height: 3, bgcolor: planningTokens.primaryBlue, borderRadius: 1}} />
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, fontWeight: 700}}>Baseline</Typography>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
            <Box sx={{width: 20, height: 3, bgcolor: planningTokens.danger, borderRadius: 1}} />
            <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, fontWeight: 700}}>Scenario</Typography>
          </Box>
        </Box>

        <LineChart
          xAxis={[{
            data: periods,
            scaleType: 'point',
            tickLabelStyle: {fontSize: 11, fill: planningTokens.textMuted},
          }]}
          yAxis={[{
            min: 0,
            max: 130,
            tickLabelStyle: {fontSize: 11, fill: planningTokens.textMuted},
            valueFormatter: (v) => `${v}%`,
          }]}
          series={[
            {
              data: baselineValues,
              label: 'Baseline',
              color: planningTokens.primaryBlue,
              showMark: true,
              curve: 'linear',
            },
            {
              data: scenarioValues,
              label: 'Scenario',
              color: planningTokens.danger,
              showMark: true,
              curve: 'linear',
            },
          ]}
          height={240}
          margin={{top: 10, bottom: 40, left: 50, right: 20}}
          sx={{
            '& .MuiLineElement-root': {strokeWidth: 2},
            '& .MuiMarkElement-root': {strokeWidth: 2},
          }}
        />

        {hasOverload && (
          <Alert severity="warning" sx={{mt: 1, fontSize: 12, py: 0.5}}>
            {data.filter((d) => d.scenario > 100).length} period{data.filter((d) => d.scenario > 100).length > 1 ? 's' : ''} exceed 100% utilization in scenario
          </Alert>
        )}
      </Paper>
    </Box>
  );
}
