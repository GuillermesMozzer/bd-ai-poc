import {
  CalendarMonth as CalendarMonthIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  HourglassEmpty as HourglassEmptyIcon,
  Science as ScienceIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';
import {Box, Paper, Typography} from '@mui/material';
import type {MrpVersionKpi} from '../types';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

const toneColors = {
  success: {bg: '#ECFDF3', color: '#027A48'},
  warning: {bg: '#FFF7ED', color: '#B54708'},
  info:    {bg: '#EFF6FF', color: '#1D4ED8'},
  neutral: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)'},
  danger:  {bg: '#FEF2F2', color: '#B42318'},
};

function KpiIcon({icon, tone}: {icon: MrpVersionKpi['icon']; tone: MrpVersionKpi['tone']}) {
  const {bg, color} = toneColors[tone];
  const iconEl =
    icon === 'baseline'   ? <CheckCircleOutlineIcon sx={{fontSize: 20, color}} /> :
    icon === 'pending'    ? <HourglassEmptyIcon sx={{fontSize: 20, color}} /> :
    icon === 'versions'   ? <VerifiedIcon sx={{fontSize: 20, color}} /> :
    icon === 'simulation' ? <ScienceIcon sx={{fontSize: 20, color}} /> :
                            <CalendarMonthIcon sx={{fontSize: 20, color}} />;
  return (
    <Box sx={{width: 38, height: 38, borderRadius: 2, bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
      {iconEl}
    </Box>
  );
}

interface MrpVersionKpiCardsProps {
  cards: MrpVersionKpi[];
}

export default function MrpVersionKpiCards({cards}: MrpVersionKpiCardsProps) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)'}, gap: 1.2}}>
      {cards.map((card) => (
        <Paper key={card.key} elevation={0} sx={{...moduleCardSx, p: 2, display: 'flex', alignItems: 'center', gap: 1.5}}>
          <KpiIcon icon={card.icon} tone={card.tone} />
          <Box sx={{minWidth: 0}}>
            <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.3}}>
              {card.label}
            </Typography>
            <Typography sx={{fontSize: 18, fontWeight: 900, color: 'var(--planning-text-primary)', lineHeight: 1.1}}>
              {card.value}
            </Typography>
            <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', mt: 0.3}}>
              {card.helperText}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}
