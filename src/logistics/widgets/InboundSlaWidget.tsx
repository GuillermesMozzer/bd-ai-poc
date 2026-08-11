import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { logisticsType } from '../typography';

const slaData = [
  { time: '08:00', cycleTime: 45, target: 60 },
  { time: '09:00', cycleTime: 52, target: 60 },
  { time: '10:00', cycleTime: 58, target: 60 },
  { time: '11:00', cycleTime: 42, target: 60 },
  { time: '12:00', cycleTime: 38, target: 60 },
  { time: '13:00', cycleTime: 65, target: 60 },
  { time: '14:00', cycleTime: 48, target: 60 },
];

export const InboundSlaWidget: React.FC = () => {
  const breached = slaData.filter((d) => d.cycleTime > d.target);
  const summary = `Dock-to-stock cycle time by hour. Target ${slaData[0].target} minutes. ${breached.length} hour(s) above SLA: ${
    breached.map((d) => `${d.time} at ${d.cycleTime} minutes`).join('; ') || 'none'
  }.`;

  return (
    <Card
      component="section"
      aria-labelledby="inbound-sla-heading"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography id="inbound-sla-heading" component="h2" sx={{ ...logisticsType.sectionTitle, color: 'text.primary' }}>
          Dock-to-Stock Cycle Time (SLA Mapped)
        </Typography>
        <Typography sx={{ ...logisticsType.caption, color: 'text.secondary', mt: 0.25 }}>
          Target: 60 min. Dashed orange line marks the regulatory tolerance limit.
        </Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 1, minHeight: 220 }}>
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
        <Box role="img" aria-label={summary} sx={{ width: '100%', height: '100%', minHeight: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={slaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCycleInboundSla" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#044ED7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#044ED7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#334155' }} />
              <YAxis tick={{ fontSize: 11, fill: '#334155' }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="cycleTime"
                stroke="#044ED7"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCycleInboundSla)"
                name="Time (Minutes)"
              />
              <Area
                type="monotone"
                dataKey="target"
                stroke="#C2410C"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
                name="SLA Limit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default InboundSlaWidget;
