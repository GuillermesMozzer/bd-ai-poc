import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
          Dock-to-Stock Cycle Time (SLA Mapped)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Target: 60 min. Linha Laranja representa o limite de tolerância regulatória.
        </Typography>
      </Box>
      <CardContent sx={{ flexGrow: 1, p: 1, minHeight: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={slaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCycleInboundSla" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#044ED7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#044ED7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="cycleTime"
              stroke="#044ED7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCycleInboundSla)"
              name="Tempo (Minutos)"
            />
            <Area
              type="monotone"
              dataKey="target"
              stroke="#FF5F00"
              strokeDasharray="4 4"
              fill="none"
              name="SLA Limit"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default InboundSlaWidget;
