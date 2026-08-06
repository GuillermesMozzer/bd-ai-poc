import {Box, Paper, Typography, useMediaQuery, useTheme} from '@mui/material';
import {SouthEast as DownTrendIcon, NorthEast as UpTrendIcon} from '@mui/icons-material';
import type {TierMeetingGraphicCard} from '../types';

type TierMeetingLaneGraphicCardsProps = {
  cards: TierMeetingGraphicCard[];
  variant?: 'board' | 'dialog';
};

function buildSparklinePath(values: number[], width: number, height: number, bottomPadding: number) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const xStep = values.length > 1 ? width / (values.length - 1) : width;
  const chartHeight = height - bottomPadding;

  const points = values.map((value, index) => {
    const normalized = max === min ? 0.5 : (value - min) / (max - min);
    const x = index * xStep;
    const y = chartHeight - (normalized * (chartHeight - 10)) - 4;
    return `${x},${y}`;
  });

  return {
    linePath: `M ${points.join(' L ')}`,
    areaPath: `M 0,${chartHeight} L ${points.join(' L ')} L ${width},${chartHeight} Z`,
  };
}

function TierMeetingLaneGraphicCard({
  card,
  compact = false,
}: {
  card: TierMeetingGraphicCard;
  compact?: boolean;
}) {
  const width = 220;
  const height = compact ? 54 : 74;
  const bottomPadding = compact ? 12 : 18;
  const {linePath, areaPath} = buildSparklinePath(card.trendValues, width, height, bottomPadding);
  const positive = card.accent.toLowerCase() !== '#ff5a52' && card.accent.toLowerCase() !== '#e43b46';
  const TrendIcon = positive ? UpTrendIcon : DownTrendIcon;
  const fillColor = positive ? 'rgba(122,211,107,0.18)' : 'rgba(255,90,82,0.16)';
  const gridColor = positive ? 'rgba(122,211,107,0.16)' : 'rgba(255,90,82,0.14)';

  return (
    <Paper
      elevation={0}
      sx={{
        p: compact ? 0.8 : 1.1,
        minHeight: compact ? 126 : 172,
        borderRadius: 2.6,
        border: '1px solid #D7DCE6',
        backgroundImage: 'linear-gradient(180deg, #F8FAFD 0%, #FFFFFF 100%)',
        boxShadow: '0 6px 16px rgba(15,23,42,0.05)',
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: compact ? 0.4 : 1}}>
        <Box sx={{minWidth: 0}}>
          <Typography sx={{fontSize: compact ? '0.42rem' : '0.58rem', fontWeight: 800, color: '#7C8AA5', letterSpacing: '0.08em', textTransform: 'uppercase'}}>
            {card.scopeLabel}
          </Typography>
          <Typography sx={{mt: 0.15, fontSize: compact ? '0.62rem' : '0.88rem', fontWeight: 900, color: '#202433', lineHeight: 1.05, textTransform: 'uppercase'}}>
            {card.label}
          </Typography>
        </Box>
        <Typography
          sx={{
            fontSize: compact ? '0.42rem' : '0.68rem',
            fontWeight: 900,
            color: '#6D7891',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            whiteSpace: compact ? 'normal' : 'nowrap',
            textAlign: 'right',
            lineHeight: compact ? 1.05 : 1.2,
            maxWidth: compact ? 56 : 'none',
            flexShrink: 0,
          }}
        >
          Target {card.target}
        </Typography>
      </Box>

      <Typography sx={{mt: compact ? 0.75 : 1.15, fontSize: compact ? '1.45rem' : '2.25rem', lineHeight: 0.95, fontWeight: 900, color: card.accent}}>
        {card.value}
      </Typography>

      <Box sx={{mt: 0.55, display: 'flex', alignItems: 'center', gap: 0.35}}>
        <TrendIcon sx={{fontSize: compact ? 11 : 15, color: card.accent}} />
        <Typography sx={{fontSize: compact ? '0.5rem' : '0.72rem', fontWeight: 700, color: card.accent}}>
          {card.comparisonLabel}
        </Typography>
      </Box>

      <Box sx={{mt: compact ? 0.45 : 0.8}}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={compact ? 54 : 74} preserveAspectRatio="none" aria-hidden="true">
          <line x1="0" y1="14" x2={width} y2="14" stroke={gridColor} strokeWidth="1" />
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke={gridColor} strokeWidth="1" />
          <line x1="0" y1={height - bottomPadding} x2={width} y2={height - bottomPadding} stroke={gridColor} strokeWidth="1" />
          {Array.from({length: 5}, (_, index) => (
            <line
              key={index}
              x1={(index * width) / 4}
              y1="0"
              x2={(index * width) / 4}
              y2={height - bottomPadding}
              stroke={gridColor}
              strokeWidth="1"
            />
          ))}
          <path d={areaPath} fill={fillColor} />
          <path d={linePath} fill="none" stroke={card.accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </Box>
    </Paper>
  );
}

export default function TierMeetingLaneGraphicCards({
  cards,
  variant = 'board',
}: TierMeetingLaneGraphicCardsProps) {
  const theme = useTheme();
  const compactBoard = useMediaQuery(theme.breakpoints.down('xl'));
  const compact = variant === 'dialog' || compactBoard;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: variant === 'dialog' ? 'repeat(2, minmax(0, 1fr))' : 'repeat(2, minmax(0, 1fr))',
        },
        gap: 1,
      }}
    >
      {cards.map((card) => (
        <TierMeetingLaneGraphicCard key={card.id} card={card} compact={compact} />
      ))}
    </Box>
  );
}
