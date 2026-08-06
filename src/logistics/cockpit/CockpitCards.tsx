import React from 'react';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { ct, toneColor, type CtTone } from './cockpitTheme';
import { CockpitCard, Sparkline, StatusBar } from './Sparkline';

type BigKpiCardProps = {
  label: string;
  value: string | number;
  unit?: string;
  target: string;
  delta: string;
  tone: CtTone;
  sparkline: number[];
  onOpen?: () => void;
};

export function BigKpiCard({
  label,
  value,
  unit,
  target,
  delta,
  tone,
  sparkline,
  onOpen,
}: BigKpiCardProps) {
  return (
    <CockpitCard onClick={onOpen}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: ct.textMuted,
            fontFamily: ct.font,
          }}
        >
          {label}
        </Typography>
        {onOpen ? (
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onOpen();
            }}
            sx={{ color: ct.textDim, p: 0.3 }}
            aria-label={`Drill down ${label}`}
          >
            <OpenInFullIcon sx={{ fontSize: 14 }} />
          </IconButton>
        ) : null}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mt: 0.8 }}>
        <StatusBar tone={tone} height={44} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="baseline" spacing={0.6}>
            <Typography
              sx={{
                fontSize: 32,
                fontWeight: 700,
                lineHeight: 1,
                color: ct.text,
                fontFamily: ct.mono,
              }}
            >
              {value}
            </Typography>
            {unit ? (
              <Typography sx={{ fontSize: 11, color: ct.textDim }}>{unit}</Typography>
            ) : null}
          </Stack>
          <Typography sx={{ fontSize: 11, color: ct.textMuted, mt: 0.4 }}>{target}</Typography>
          <Typography sx={{ fontSize: 11, color: toneColor(tone), fontWeight: 600 }}>{delta}</Typography>
        </Box>
        <Box sx={{ width: 88, flexShrink: 0 }}>
          <Sparkline values={sparkline} tone={tone} height={40} />
        </Box>
      </Stack>
    </CockpitCard>
  );
}

type MacroflowCardProps = {
  title: string;
  processLabel: string;
  healthscore: number;
  utilization: number;
  secondaryLabel: string;
  secondaryValue: string | number;
  tone: CtTone;
  sparkline: number[];
  onGoToArea: () => void;
  onMaximize?: () => void;
};

export function MacroflowCard({
  title,
  processLabel,
  healthscore,
  utilization,
  secondaryLabel,
  secondaryValue,
  tone,
  sparkline,
  onGoToArea,
  onMaximize,
}: MacroflowCardProps) {
  return (
    <CockpitCard>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: ct.text, fontFamily: ct.font }}>
            {title}
          </Typography>
          <Typography sx={{ fontSize: 11, color: ct.textDim, mt: 0.2 }}>{processLabel}</Typography>
        </Box>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box
            component="button"
            onClick={onGoToArea}
            sx={{
              border: `1px solid ${ct.borderStrong}`,
              bgcolor: 'transparent',
              color: ct.accent,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.04em',
              px: 1,
              py: 0.5,
              borderRadius: 0.8,
              cursor: 'pointer',
              fontFamily: ct.font,
              whiteSpace: 'nowrap',
              '&:hover': { bgcolor: ct.accentSoft },
            }}
          >
            GO TO AREA VIEW →
          </Box>
          {onMaximize ? (
            <IconButton size="small" onClick={onMaximize} sx={{ color: ct.textDim, p: 0.3 }}>
              <OpenInFullIcon sx={{ fontSize: 14 }} />
            </IconButton>
          ) : null}
        </Stack>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1.5,
          mt: 1.5,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <StatusBar tone={tone} height={36} />
          <Box>
            <Typography sx={{ fontSize: 10, color: ct.textMuted, textTransform: 'uppercase' }}>
              Healthscore
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: toneColor(tone), fontFamily: ct.mono }}>
              {Math.round(healthscore)}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <StatusBar tone={utilization > 85 ? 'danger' : utilization > 70 ? 'warn' : 'ok'} height={36} />
          <Box>
            <Typography sx={{ fontSize: 10, color: ct.textMuted, textTransform: 'uppercase' }}>
              Capacity %
            </Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: ct.text, fontFamily: ct.mono }}>
              {Math.round(utilization)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Stack direction="row" spacing={1.5} alignItems="flex-end" sx={{ mt: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 10, color: ct.textMuted, textTransform: 'uppercase' }}>
            {secondaryLabel}
          </Typography>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: ct.text, fontFamily: ct.mono }}>
            {secondaryValue}
          </Typography>
        </Box>
        <Box sx={{ width: 120 }}>
          <Sparkline values={sparkline} tone={tone} height={36} />
        </Box>
      </Stack>
    </CockpitCard>
  );
}
