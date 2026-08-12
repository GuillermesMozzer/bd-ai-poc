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

const data = [
  { day: 'Mon', hours: 4.2 },
  { day: 'Tue', hours: 5.8 },
  { day: 'Wed', hours: 7.1 },
  { day: 'Thu', hours: 4.9 },
  { day: 'Fri', hours: 3.5 },
  { day: 'Sat', hours: 3.1 },
  { day: 'Sun', hours: 2.8 },
];

/** Theme-aware inbound SLA chart for Control Tower V2. */
export const InboundSlaChartWidget: React.FC = () => {
  const average = useMemo(
    () => (data.reduce((sum, row) => sum + row.hours, 0) / data.length).toFixed(2),
    [],
  );
  const summary = `Dock-to-stock cycle time by day. Shift average ${average} hours. Target SLA under 6.0 hours. Wednesday breached at 7.1 hours.`;

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
          <Typography sx={{ ...ctV2Type.caption, fontWeight: 800, color: tokenSuccess.dark }}>-18.4% WoW</Typography>
        </Box>
      </Box>

      <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, display: 'block', mb: 1.5 }}>
        Shift average: {average} h · Target SLA: &lt; 6.0 h
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
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
              dy={5}
              tick={{ fill: 'var(--token-text-secondary)', fontFamily: 'Inter, Segoe UI, sans-serif' }}
            />
            <YAxis
              stroke="var(--token-text-secondary)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-5}
              tick={{ fill: 'var(--token-text-secondary)', fontFamily: 'Inter, Segoe UI, sans-serif' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--active-theme-background-paper)',
                border: '1px solid var(--token-divider)',
                borderRadius: 8,
                color: 'var(--token-text-primary)',
                fontFamily: 'Inter, Segoe UI, sans-serif',
                fontSize: 11,
                fontWeight: 600,
              }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="var(--token-brand-main)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#ctV2ColorHours)"
              name="Hours"
            />
            <ReferenceLine
              y={6.0}
              stroke="var(--token-error-main)"
              strokeDasharray="4 4"
              label={{
                value: 'SLA TARGET',
                fill: 'var(--token-error-main)',
                fontSize: 9,
                position: 'insideTopRight',
                fontFamily: 'Inter, Segoe UI, sans-serif',
                fontWeight: 800,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
};

export default InboundSlaChartWidget;
