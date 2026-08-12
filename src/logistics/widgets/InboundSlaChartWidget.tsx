import React, { useMemo } from 'react';
import { Box, Card, Typography } from '@mui/material';
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
import { ct } from '../cockpit/cockpitTheme';

const data = [
  { day: 'Mon', hours: 4.2 },
  { day: 'Tue', hours: 5.8 },
  { day: 'Wed', hours: 7.1 },
  { day: 'Thu', hours: 4.9 },
  { day: 'Fri', hours: 3.5 },
  { day: 'Sat', hours: 3.1 },
  { day: 'Sun', hours: 2.8 },
];

/** Dark CoreSight inbound SLA chart for Control Tower V2 (distinct from light workstation InboundSlaWidget). */
export const InboundSlaChartWidget: React.FC = () => {
  const average = useMemo(
    () => (data.reduce((sum, row) => sum + row.hours, 0) / data.length).toFixed(2),
    [],
  );
  const summary = `Dock-to-stock cycle time by day. Shift average ${average} hours. Target SLA under 6.0 hours. Wednesday breached at 7.1 hours.`;

  return (
    <Card
      component="section"
      aria-labelledby="inbound-sla-v2-heading"
      sx={{
        bgcolor: ct.bgCard,
        border: `1px solid ${ct.border}`,
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, gap: 1 }}>
        <Typography
          id="inbound-sla-v2-heading"
          component="h2"
          sx={{ color: ct.accent, fontWeight: 700, fontFamily: ct.font, letterSpacing: '0.05em', fontSize: 13 }}
        >
          INBOUND DOCK-TO-STOCK SLA (IN01)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: ct.ok }}>
          <TrendingDown size={14} aria-hidden />
          <Typography sx={{ fontFamily: ct.mono, fontWeight: 700, fontSize: 11 }}>-18.4% WoW</Typography>
        </Box>
      </Box>

      <Typography sx={{ color: ct.textMuted, display: 'block', mb: 2, fontFamily: ct.mono, fontSize: 11 }}>
        Current Shift Average: {average} Hours · Target SLA Threshold: &lt; 6.0 Hours
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

      <Box role="img" aria-label={summary} sx={{ width: '100%', flexGrow: 1, minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ctV2ColorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ct.accent} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ct.accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="day"
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={5}
              tick={{ fill: ct.textMuted, fontFamily: ct.mono }}
            />
            <YAxis
              stroke="rgba(255,255,255,0.3)"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dx={-5}
              tick={{ fill: ct.textMuted, fontFamily: ct.mono }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#111827',
                border: `1px solid ${ct.borderStrong}`,
                borderRadius: 4,
                color: ct.text,
                fontFamily: ct.mono,
                fontSize: 11,
              }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke={ct.accent}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#ctV2ColorHours)"
              name="Hours"
            />
            <ReferenceLine
              y={6.0}
              stroke={ct.danger}
              strokeDasharray="4 4"
              label={{
                value: 'SLA TARGET',
                fill: ct.danger,
                fontSize: 8,
                position: 'insideTopRight',
                fontFamily: ct.mono,
                fontWeight: 'bold',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
};

export default InboundSlaChartWidget;
