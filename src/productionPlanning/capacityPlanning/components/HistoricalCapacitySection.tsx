import {useState} from 'react';
import {Box, Stack, ToggleButton, ToggleButtonGroup, Typography} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {planningTokens} from '../../ui/planningTheme';
import type {HistoricalActualCapacity, LineDesignCapacity} from '../types';

type ViewMode = 'hours' | 'units';

type Props = {
  history: HistoricalActualCapacity[];
  design: LineDesignCapacity;
};

export default function HistoricalCapacitySection({history, design}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('hours');

  const rate = design.designRatePerHr;

  const chartData = history.map((h) => {
    const [mon, yr] = h.month.split('-');
    const label = `${mon}'${yr.slice(2)}`;
    if (viewMode === 'units') {
      return {
        month: label,
        Design: Math.round((h.designHrs * rate) / 1_000_000 * 100) / 100,
        Planned: Math.round((h.plannedHrs * rate) / 1_000_000 * 100) / 100,
        Actual: Math.round((h.actualHrs * rate) / 1_000_000 * 100) / 100,
        pct: h.utilizationVsPlan,
      };
    }
    return {
      month: label,
      Design: Math.round(h.designHrs / 1000),
      Planned: Math.round(h.plannedHrs / 1000),
      Actual: Math.round(h.actualHrs / 1000),
      pct: h.utilizationVsPlan,
    };
  });

  const avgActual = Math.round(history.reduce((s, h) => s + h.actualHrs, 0) / history.length);
  const avgPct = Math.round(history.reduce((s, h) => s + h.utilizationVsPlan, 0) / history.length);
  const last3 = history.slice(-3);
  const first3 = history.slice(0, 3);
  const trend = last3.reduce((s, h) => s + h.actualHrs, 0) > first3.reduce((s, h) => s + h.actualHrs, 0);

  const isUnits = viewMode === 'units';
  const yUnit = isUnits ? 'M' : 'K';
  const tooltipSuffix = isUnits ? `M ${design.rateUnit.replace('/hr', '/mo')}` : 'K hrs';

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
      {/* View toggle */}
      <Stack direction="row" justifyContent="flex-end">
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, v) => v && setViewMode(v)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              fontSize: 10,
              fontWeight: 600,
              py: 0.25,
              px: 1.25,
              textTransform: 'none',
              border: `1px solid ${planningTokens.border}`,
              color: planningTokens.textMuted,
              '&.Mui-selected': {
                bgcolor: planningTokens.primaryBlue,
                color: '#fff',
                '&:hover': {bgcolor: planningTokens.primaryBlue},
              },
            },
          }}
        >
          <ToggleButton value="hours">Hours</ToggleButton>
          <ToggleButton value="units">Units ({design.rateUnit.replace('/hr', '/mo')})</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={chartData} barCategoryGap="25%" margin={{top: 4, right: 4, bottom: 0, left: -20}}>
          <XAxis dataKey="month" tick={{fontSize: 9}} axisLine={false} tickLine={false} />
          <YAxis tick={{fontSize: 9}} axisLine={false} tickLine={false} unit={yUnit} />
          <Tooltip
            formatter={(v: number, name: string) => [`${v}${tooltipSuffix}`, name]}
            contentStyle={{fontSize: 11, borderRadius: 6, border: `1px solid ${planningTokens.border}`}}
          />
          <Legend wrapperStyle={{fontSize: 10}} />
          <ReferenceLine y={0} stroke={planningTokens.border} />
          <Bar dataKey="Design" fill="#CBD5E1" radius={[2, 2, 0, 0]} />
          <Bar dataKey="Planned" fill={planningTokens.primaryBlue} radius={[2, 2, 0, 0]} opacity={0.75} />
          <Bar dataKey="Actual" fill="#22C55E" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary strip */}
      <Stack direction="row" spacing={3} sx={{px: 0.5}}>
        <Box>
          <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>Avg Actual</Typography>
          {isUnits ? (
            <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary}}>
              {((avgActual * rate) / 1_000_000).toFixed(2)}M {design.rateUnit.replace('/hr', '/mo')}
            </Typography>
          ) : (
            <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary}}>
              {Math.round(avgActual / 1000)}K hrs/mo
            </Typography>
          )}
        </Box>
        <Box>
          <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>Avg Utilization vs Plan</Typography>
          <Typography sx={{fontSize: 13, fontWeight: 700, color: avgPct >= 95 ? '#22C55E' : '#F97316'}}>
            {avgPct}%
          </Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
          {trend
            ? <TrendingUpIcon sx={{fontSize: 18, color: '#22C55E'}} />
            : <TrendingDownIcon sx={{fontSize: 18, color: '#F97316'}} />}
          <Box>
            <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>Trend (12 mo)</Typography>
            <Typography sx={{fontSize: 12, fontWeight: 600, color: trend ? '#22C55E' : '#F97316'}}>
              {trend ? 'Improving' : 'Declining'}
            </Typography>
          </Box>
        </Box>
      </Stack>

      {isUnits && (
        <Typography sx={{fontSize: 10, color: planningTokens.textMuted, fontStyle: 'italic'}}>
          Units = actual/planned/design hours × {design.designRatePerHr.toLocaleString()} {design.rateUnit} (design rate). Actual output varies by product run rates.
        </Typography>
      )}
    </Box>
  );
}
