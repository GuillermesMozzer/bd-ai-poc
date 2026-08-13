import React from 'react';
import { Box, Typography } from '@mui/material';
import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';
import type { CtTone } from '../cockpit/cockpitTheme';
import {
  ctV2Type,
  tokenBrand,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
  workstationTierCardSx,
  workstationTierInsetCardSx,
  workstationVisuals,
  workstationWidgetTitleSx,
} from '../ctV2Theme';

export type CtV2VisualTone = CtTone | 'red' | 'yellow' | 'green' | 'accent' | 'default';

export function toneColorV2(tone: CtV2VisualTone): string {
  if (tone === 'danger' || tone === 'red') return tokenError.main;
  if (tone === 'warn' || tone === 'yellow') return tokenWarning.main;
  if (tone === 'ok' || tone === 'green') return tokenSuccess.main;
  if (tone === 'accent') return tokenBrand.main;
  return tokenNeutral.main;
}

export function toneSoftBgV2(tone: CtV2VisualTone): string {
  if (tone === 'danger' || tone === 'red') return tokenError.softBg;
  if (tone === 'warn' || tone === 'yellow') return tokenWarning.softBg;
  if (tone === 'ok' || tone === 'green') return tokenSuccess.softBg;
  if (tone === 'accent') return tokenBrand.softBg;
  return 'var(--token-neutral-soft-bg, rgba(148,163,184,0.08))';
}

type SparklineV2Props = {
  values: number[];
  tone?: CtTone;
  height?: number;
};

export function SparklineV2({ values, tone = 'neutral', height = 36 }: SparklineV2Props) {
  const data = values.map((v, i) => ({ i, v }));
  return (
    <Box sx={{ width: '100%', height, minWidth: 64 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 2, bottom: 0, left: 2 }}>
          <YAxis domain={['dataMin - 1', 'dataMax + 1']} hide />
          <Line
            type="monotone"
            dataKey="v"
            stroke={toneColorV2(tone)}
            strokeWidth={1.6}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}

type StatusBarV2Props = { tone: CtV2VisualTone; height?: number };

export function StatusBarV2({ tone, height = 40 }: StatusBarV2Props) {
  return (
    <Box
      sx={{
        width: 3,
        height,
        borderRadius: 1,
        bgcolor: toneColorV2(tone),
        flexShrink: 0,
      }}
    />
  );
}

type CtV2WidgetShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  noPadding?: boolean;
  sx?: object;
};

/** Themed widget surface used inside draggable grid tiles. */
export function CtV2WidgetShell({ title, subtitle, children, noPadding, sx }: CtV2WidgetShellProps) {
  return (
    <Box
      sx={{
        ...workstationTierCardSx,
        height: '100%',
        width: '100%',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        borderRadius: 2.6,
        ...sx,
      }}
    >
      <Box sx={{ px: 2, pt: 1.75, pb: subtitle ? 0.5 : 1, flexShrink: 0, pr: 7 }}>
        <Typography sx={{ ...workstationWidgetTitleSx, ...ctV2Type.sectionTitle }}>{title}</Typography>
        {subtitle ? (
          <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.35 }}>{subtitle}</Typography>
        ) : null}
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: '100%',
          overflow: 'auto',
          px: noPadding ? 0 : 2,
          pb: noPadding ? 0 : 1.75,
          fontFamily: workstationVisuals.fontFamily,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

type CtV2InsetCardProps = {
  children: React.ReactNode;
  onClick?: () => void;
  sx?: object;
};

type CtV2StatusChipProps = {
  label: string;
  tone?: CtV2VisualTone;
};

export function CtV2StatusChip({ label, tone = 'neutral' }: CtV2StatusChipProps) {
  const resolved = tone === 'default' ? 'neutral' : tone;
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        height: 22,
        px: 0.9,
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 800,
        letterSpacing: '0.02em',
        textTransform: 'capitalize',
        bgcolor: toneSoftBgV2(resolved),
        color: toneColorV2(resolved),
        border: `1px solid ${toneColorV2(resolved)}33`,
        whiteSpace: 'nowrap',
      }}
    >
      {label.replace(/_/g, ' ')}
    </Box>
  );
}

export function CtV2InsetCard({ children, onClick, sx }: CtV2InsetCardProps) {
  return (
    <Box
      onClick={onClick}
      sx={{
        ...workstationTierInsetCardSx,
        p: 1.25,
        borderRadius: 2,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        '&:hover': onClick
          ? {
              borderColor: tokenBrand.light,
              boxShadow: workstationVisuals.cardShadow,
            }
          : undefined,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
