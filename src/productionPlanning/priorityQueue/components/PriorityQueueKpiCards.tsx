import React from 'react';
import {Box, Paper, Stack, Typography} from '@mui/material';
import {
  AutoModeRounded as AutoModeRoundedIcon,
  BlockRounded as BlockRoundedIcon,
  FactCheckRounded as FactCheckRoundedIcon,
  FactoryRounded as FactoryRoundedIcon,
  Inventory2Rounded as Inventory2RoundedIcon,
  PersonOffRounded as PersonOffRoundedIcon,
  ShieldRounded as ShieldRoundedIcon,
  ScheduleRounded as ScheduleRoundedIcon,
  SpaceDashboardRounded as SpaceDashboardRoundedIcon,
  WarningAmberRounded as WarningAmberRoundedIcon,
} from '@mui/icons-material';
import type {KpiCardData} from '../types';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

const toneColors = {
  danger: {bg: '#FEF2F2', color: '#B42318'},
  warning: {bg: '#FFF7ED', color: '#C2410C'},
  info: {bg: '#EFF6FF', color: '#1D4ED8'},
  neutral: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)'},
  success: {bg: '#ECFDF3', color: '#027A48'},
};

function getIcon(icon: string) {
  switch (icon) {
    case 'inventory':
      return <Inventory2RoundedIcon sx={{fontSize: 18}} />;
    case 'shield':
      return <ShieldRoundedIcon sx={{fontSize: 18}} />;
    case 'bolt':
      return <AutoModeRoundedIcon sx={{fontSize: 18}} />;
    case 'block':
      return <BlockRoundedIcon sx={{fontSize: 18}} />;
    case 'schedule':
      return <ScheduleRoundedIcon sx={{fontSize: 18}} />;
    case 'owner-off':
      return <PersonOffRoundedIcon sx={{fontSize: 18}} />;
    case 'cluster':
      return <SpaceDashboardRoundedIcon sx={{fontSize: 18}} />;
    case 'factory':
      return <FactoryRoundedIcon sx={{fontSize: 18}} />;
    case 'override':
      return <FactCheckRoundedIcon sx={{fontSize: 18}} />;
    default:
      return <WarningAmberRoundedIcon sx={{fontSize: 18}} />;
  }
}

export default function PriorityQueueKpiCards({cards}: {cards: KpiCardData[]}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(6, minmax(0, 1fr))'}, gap: 1.2}}>
      {cards.map((card) => {
        const {bg, color} = toneColors[card.tone];
        return (
          <Paper key={card.key} elevation={0} sx={{...moduleCardSx, p: 1.8}}>
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Box sx={{width: 34, height: 34, borderRadius: 2, bgcolor: bg, color, display: 'grid', placeItems: 'center', flexShrink: 0}}>
                {getIcon(card.icon)}
              </Box>
              <Box sx={{minWidth: 0}}>
                <Typography sx={{fontSize: 12, fontWeight: 800, color: 'var(--planning-text-secondary)'}}>{card.label}</Typography>
                <Typography sx={{fontSize: 24, lineHeight: 1.05, fontWeight: 900, color: 'var(--planning-text-primary)', mt: 0.5}}>{card.value}</Typography>
                <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.5}}>{card.helperText}</Typography>
              </Box>
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
}
