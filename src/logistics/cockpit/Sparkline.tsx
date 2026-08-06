import React from 'react';
import { Box } from '@mui/material';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import { ct, toneColor, type CtTone } from './cockpitTheme';

type SparklineProps = {
  values: number[];
  tone?: CtTone;
  height?: number;
};

export function Sparkline({ values, tone = 'neutral', height = 36 }: SparklineProps) {
  const data = values.map((v, i) => ({ i, v }));
  return (
    <Box sx={{ width: '100%', height, minWidth: 64 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
          <Line
            type="monotone"
            dataKey="v"
            stroke={toneColor(tone)}
            strokeWidth={1.6}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

type StatusBarProps = { tone: CtTone; height?: number };

export function StatusBar({ tone, height = 40 }: StatusBarProps) {
  return (
    <Box
      sx={{
        width: 3,
        height,
        borderRadius: 1,
        bgcolor: toneColor(tone),
        flexShrink: 0,
      }}
    />
  );
}

export function CockpitCard({
  children,
  onClick,
  sx,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  sx?: object;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        bgcolor: ct.bgCard,
        border: `1px solid ${ct.border}`,
        borderRadius: 1.2,
        p: 1.5,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'background 0.15s ease, border-color 0.15s ease',
        '&:hover': onClick
          ? { bgcolor: ct.bgCardHover, borderColor: ct.borderStrong }
          : undefined,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
