import {Box, Paper, Typography} from '@mui/material';
import {NorthEast as UpTrendIcon, SouthEast as DownTrendIcon} from '@mui/icons-material';
import {workstationVisuals} from '../theme';

type WorkstationKpiTrendCardProps = {
  accent: string;
  comparisonLabel: string;
  label: string;
  positive?: boolean;
  scopeLabel?: string;
  showScopeLabel?: boolean;
  target: string;
  trendValues: number[];
  value: string;
};

function buildSparklinePath(values: number[], width: number, height: number, bottomPadding: number) {
  const safeValues = values.length ? values : [0];
  const min = Math.min(...safeValues);
  const max = Math.max(...safeValues);
  const xStep = safeValues.length > 1 ? width / (safeValues.length - 1) : width;
  const chartHeight = height - bottomPadding;

  const points = safeValues.map((rawValue, index) => {
    const normalized = max === min ? 0.5 : (rawValue - min) / (max - min);
    const x = index * xStep;
    const y = chartHeight - (normalized * (chartHeight - 10)) - 4;
    return `${x},${y}`;
  });

  return {
    linePath: `M ${points.join(' L ')}`,
    areaPath: `M 0,${chartHeight} L ${points.join(' L ')} L ${width},${chartHeight} Z`,
  };
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const fullHex = normalized.length === 3
    ? normalized.split('').map((character) => `${character}${character}`).join('')
    : normalized;
  const parsed = Number.parseInt(fullHex, 16);

  if (!Number.isFinite(parsed)) {
    return `rgba(4,78,215,${alpha})`;
  }

  const red = (parsed >> 16) & 255;
  const green = (parsed >> 8) & 255;
  const blue = parsed & 255;

  return `rgba(${red},${green},${blue},${alpha})`;
}

export default function WorkstationKpiTrendCard({
  accent,
  comparisonLabel,
  label,
  positive = true,
  scopeLabel,
  showScopeLabel = true,
  target,
  trendValues,
  value,
}: WorkstationKpiTrendCardProps) {
  const width = 220;
  const height = 72;
  const bottomPadding = 18;
  const {linePath, areaPath} = buildSparklinePath(trendValues, width, height, bottomPadding);
  const TrendIcon = positive ? UpTrendIcon : DownTrendIcon;
  const gridColor = hexToRgba(accent, 0.12);
  const fillColor = hexToRgba(accent, 0.18);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        minHeight: 0,
        p: 1.15,
        borderRadius: 2.6,
        border: `1px solid ${workstationVisuals.tierBorder}`,
        backgroundImage: workstationVisuals.tierPanelBackground,
        boxShadow: workstationVisuals.tierShadow,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1}}>
        <Box sx={{minWidth: 0}}>
          {showScopeLabel && scopeLabel ? (
            <Typography
              sx={{
                fontSize: '0.56rem',
                fontWeight: 800,
                color: workstationVisuals.tierTextMeta,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontFamily: workstationVisuals.fontFamily,
              }}
            >
              {scopeLabel}
            </Typography>
          ) : null}
          <Typography
            sx={{
              mt: showScopeLabel && scopeLabel ? 0.2 : 0,
              fontSize: '0.75rem',
              fontWeight: 900,
              color: workstationVisuals.tierTextHeading,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              fontFamily: workstationVisuals.fontFamily,
            }}
          >
            {label}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontSize: '0.75rem',
            fontWeight: 900,
            color: workstationVisuals.tierTextMeta,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            textAlign: 'right',
            lineHeight: 1.1,
            fontFamily: workstationVisuals.fontFamily,
          }}
        >
          Target {target}
        </Typography>
      </Box>

      <Typography
        sx={{
          mt: 0.9,
          fontSize: '1.6rem',
          lineHeight: 0.95,
          fontWeight: 900,
          color: accent,
          fontFamily: workstationVisuals.fontFamily,
        }}
      >
        {value}
      </Typography>

      <Box sx={{mt: 0.7, display: 'flex', alignItems: 'center', gap: 0.4}}>
        <TrendIcon sx={{fontSize: 15, color: accent}} />
        <Typography
          sx={{
            fontSize: '0.72rem',
            fontWeight: 700,
            color: accent,
            fontFamily: workstationVisuals.fontFamily,
          }}
        >
          {comparisonLabel}
        </Typography>
      </Box>

      <Box sx={{mt: 'auto', pt: 0.75}}>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="72" preserveAspectRatio="none" aria-hidden="true">
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
          <path d={linePath} fill="none" stroke={accent} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </Box>
    </Paper>
  );
}
