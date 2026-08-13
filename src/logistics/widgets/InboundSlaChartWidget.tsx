import React, { useMemo } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { TrendingDown } from 'lucide-react';
import {
  ctV2Type,
  tokenSuccess,
  tokenText,
  workstationTierCardSx,
  workstationVisuals,
} from '../ctV2Theme';
import { useCtV2Filters } from '../ctV2/CtV2FiltersContext';

const BASE_HOURS = [4.2, 5.8, 7.1, 4.9, 3.5, 3.1, 2.8];

/** Theme-aware inbound SLA chart for Control Tower V2 — reacts to site/frequency filters. */
export const InboundSlaChartWidget: React.FC = () => {
  const { sitesLabel, periodLabel, axisLabels, scaleDecimal, frequency } = useCtV2Filters();

  const chartData = useMemo(
    () =>
      axisLabels.map((day, index) => ({
        day,
        hours: scaleDecimal(BASE_HOURS[index] ?? 4, 1),
      })),
    [axisLabels, scaleDecimal],
  );

  const average = useMemo(
    () => (chartData.reduce((sum, row) => sum + row.hours, 0) / chartData.length).toFixed(2),
    [chartData],
  );
  const target = scaleDecimal(6, 1);
  const summary = `Dock-to-stock cycle time for ${sitesLabel} · ${periodLabel}. Average ${average} hours. Target SLA under ${target} hours.`;

  return (
    <Paper
      component="section"
      elevation={0}
      aria-labelledby="inbound-sla-v2-heading"
      sx={{
        ...workstationTierCardSx,
        p: 1.6,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: workstationVisuals.fontFamily,
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75, gap: 1 }}>
        <Typography id="inbound-sla-v2-heading" component="h2" sx={{ ...ctV2Type.sectionTitle, color: tokenText.primary }}>
          Inbound Dock-to-Stock SLA (IN01)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: tokenSuccess.dark }}>
          <TrendingDown size={14} aria-hidden />
          <Typography sx={{ ...ctV2Type.caption, fontWeight: 800, color: tokenSuccess.dark }}>
            {frequency === 'hourly' ? '-6.2% HoH' : frequency === 'monthly' ? '-11.0% MoM' : '-18.4% WoW'}
          </Typography>
        </Box>
      </Box>

      <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, display: 'block', mb: 1.5 }}>
        {sitesLabel} · {periodLabel}: {average} h · Target SLA: &lt; {target} h
      </Typography>

      <Typography
        component="p"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          p: 0,
          m: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {summary}
      </Typography>

      <Box role="img" aria-label={summary} sx={{ width: '100%', flexGrow: 1, minHeight: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ctV2ColorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--token-brand-main)" stopOpacity={0.28} />
                <stop offset="95%" stopColor="var(--token-brand-main)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--token-divider)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="var(--token-text-secondary)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--token-text-secondary)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              unit="h"
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid var(--token-divider)',
                fontSize: 12,
                fontWeight: 700,
              }}
            />
            <ReferenceLine
              y={target}
              stroke="var(--token-error-main)"
              strokeDasharray="4 4"
              label={{ value: 'SLA', fill: 'var(--token-error-main)', fontSize: 10 }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="var(--token-brand-main)"
              fillOpacity={1}
              fill="url(#ctV2ColorHours)"
              strokeWidth={2}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};
