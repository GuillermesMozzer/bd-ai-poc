import {Box, Button, Paper, Typography} from '@mui/material';
import {Area, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';
import {planningTokens} from '../../ui/planningTheme';
import type {DailyCapacityPoint} from '../types';

type Props = {
  data: DailyCapacityPoint[];
  lineName: string;
  month: string;
};

export default function DailyCapacityProfileChart({data, lineName, month}: Props) {
  return (
    <Paper elevation={0} sx={{borderRadius: 3, border: `1px solid ${planningTokens.border}`, overflow: 'hidden'}}>
      <Box sx={{px: 2, py: 1.2, borderBottom: `1px solid ${planningTokens.border}`}}>
        <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary}}>
          Daily Capacity Profile – {month} ({lineName})
        </Typography>
      </Box>
      <Box sx={{px: 1, pt: 1, pb: 0.5}}>
        <ResponsiveContainer width="100%" height={150}>
          <ComposedChart data={data} margin={{top: 4, right: 8, left: -10, bottom: 0}}>
            <CartesianGrid strokeDasharray="3 3" stroke={planningTokens.border} />
            <XAxis
              dataKey="day"
              tick={{fontSize: 10, fill: planningTokens.textMuted}}
              tickLine={false}
              tickFormatter={(d) => `${d} Mar`}
              interval={6}
            />
            <YAxis
              tick={{fontSize: 10, fill: planningTokens.textMuted}}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              domain={[0, 'auto']}
            />
            <Tooltip
              contentStyle={{fontSize: 11, borderRadius: 8, border: `1px solid ${planningTokens.border}`}}
              formatter={(val: number, name: string) => [`${val.toLocaleString()} hrs`, name]}
            />
            <Legend iconSize={8} wrapperStyle={{fontSize: 10, paddingTop: 4}} />
            <Area
              dataKey="gap"
              name="Gap"
              fill="rgba(220,38,38,0.12)"
              stroke={planningTokens.danger}
              strokeWidth={1}
              dot={false}
            />
            <Line
              dataKey="available"
              name="Available Capacity"
              stroke={planningTokens.success}
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 2"
            />
            <Line
              dataKey="required"
              name="Required Capacity"
              stroke={planningTokens.primaryBlue}
              strokeWidth={1.5}
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
      <Box sx={{px: 2, pb: 1.2, textAlign: 'center'}}>
        <Button variant="text" size="small" sx={{fontSize: 11, fontWeight: 700, textTransform: 'none', color: planningTokens.primaryBlue}}>
          Adjust Daily Capacity and Assumptions
        </Button>
      </Box>
    </Paper>
  );
}
