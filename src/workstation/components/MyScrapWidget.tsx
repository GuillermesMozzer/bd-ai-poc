import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

const scrapTrend = [14, 15, 14, 13, 12, 12, 12, 18, 15, 9, 9, 9, 10, 16, 10, 10, 9, 19, 11, 11, 12, 13, 15];

function MetricStrip({
  accent,
  bg,
  label,
  meta,
  unit,
  value,
}: {
  accent: string;
  bg: string;
  label: string;
  meta?: string;
  unit?: string;
  value: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        minHeight: 58,
        p: 1.15,
        pl: 1.45,
        bgcolor: bg,
        border: `1px solid ${tokenNeutral.main}`,
        borderRadius: 1.25,
        boxShadow: '0 2px 7px rgba(20, 36, 70, 0.12)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          bgcolor: accent,
        },
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1}}>
        <Box sx={{minWidth: 0}}>
          <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.35}}>
            <Typography sx={{fontSize: 30, lineHeight: 0.95, fontWeight: 400, color: workstationVisuals.tierTextHeading}}>
              {value}
            </Typography>
            {unit ? (
              <Typography sx={{fontSize: 13, lineHeight: 1, fontWeight: 400, color: workstationVisuals.tierTextLabel, mt: 0.25}}>
                {unit}
              </Typography>
            ) : null}
          </Box>
          <Typography sx={{fontSize: 10.5, lineHeight: 1.1, color: workstationVisuals.tierTextHeading, mt: 0.25}}>
            {label}
          </Typography>
        </Box>
        {meta ? (
          <Typography sx={{fontSize: 9, lineHeight: 1, color: workstationVisuals.tierTextLabel, fontWeight: 700, mt: 0.35, whiteSpace: 'nowrap'}}>
            {meta}
          </Typography>
        ) : null}
      </Box>
    </Paper>
  );
}

function CauseDonut({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const dash = Number(value) / 100 * circumference;

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: '48px auto', alignItems: 'center', gap: 0.7, minWidth: 0}}>
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={radius} fill="none" stroke={tokenNeutral.main} strokeWidth="5" />
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          stroke={color}
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
          strokeWidth="5"
          transform="rotate(-90 24 24)"
        />
      </svg>
      <Box sx={{minWidth: 0}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.2}}>
          <Typography sx={{fontSize: 25, lineHeight: 0.9, fontWeight: 400, color: tokenBrand.darker}}>
            {value}
          </Typography>
          <Typography sx={{fontSize: 13, lineHeight: 1, fontWeight: 400, color: tokenBrand.darker, mt: 0.3}}>
            %
          </Typography>
        </Box>
        <Typography sx={{fontSize: 12, lineHeight: 1.15, color: tokenBrand.darker, whiteSpace: 'nowrap'}}>
          {label}
        </Typography>
      </Box>
    </Box>
  );
}

export default function MyScrapWidget() {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 304,
        p: 1.6,
        borderRadius: 1.5,
        bgcolor: tokenCommon.white,
        border: `1px solid ${tokenNeutral.main}`,
        boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.06)',
        overflow: 'hidden',
        display: 'grid',
        gridTemplateRows: 'auto auto auto minmax(0, 1fr)',
        gap: 1.25,
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Typography sx={{fontSize: 15, lineHeight: 1, fontWeight: 900, color: tokenBrand.dark}}>
          Scrap
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1}}>
          <AutoAwesomeIcon sx={{fontSize: 18, color: tokenInfo.lightest}} />
          <StarBorderIcon sx={{fontSize: 19, color: tokenBrand.main}} />
          <OpenInFullIcon sx={{fontSize: 18, color: tokenBrand.main}} />
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5}}>
        <MetricStrip accent={tokenWarning.dark} bg={tokenNeutral.lightest} label="Scrap Cost" meta="VS BUDGET  +4K" unit="$" value="39.4K" />
        <MetricStrip accent={tokenError.light} bg={tokenError.lightest} label="Total" meta="16.2K" unit="%" value="23.84" />
      </Box>

      <MetricStrip accent={tokenInfo.dark} bg={tokenNeutral.lightest} label="Top Driver" meta="GLASS BARREL" unit="K" value="7.1" />

      <Paper elevation={0} sx={{p: 1.1, minHeight: 0, borderRadius: 1.4, bgcolor: tokenCommon.white, border: `1px solid ${tokenNeutral.main}`, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', overflow: 'hidden'}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.55}}>
          <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading, fontWeight: 800}}>Scrap Trend</Typography>
          <Typography sx={{fontSize: 10.5, color: tokenError.dark, fontWeight: 850}}>budget 15%</Typography>
        </Box>
        <Box sx={{pt: 0.45}}>
          <ScrapTrendChart values={scrapTrend} />
        </Box>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1}}>
          <CauseDonut color={tokenWarning.dark} label="Overfill" value="47" />
          <CauseDonut color={tokenInfo.darkest} label="Machine Adj." value="32" />
          <CauseDonut color={tokenSuccess.lighter} label="Mat. Reject" value="12" />
        </Box>
      </Paper>
    </Paper>
  );
}

function ScrapTrendChart({values}: {values: number[]}) {
  const width = 300;
  const height = 116;
  const left = 28;
  const right = 8;
  const top = 11;
  const bottom = 18;
  const max = 25;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const targetY = top + chartHeight - (15 / max) * chartHeight;
  const points = values.map((value, index) => ({
    x: left + (index / Math.max(values.length - 1, 1)) * chartWidth,
    y: top + chartHeight - (value / max) * chartHeight,
    value,
  }));
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      {[25, 15, 0].map((tick) => {
        const y = top + chartHeight - (tick / max) * chartHeight;
        return (
          <g key={tick}>
            <line x1={left} x2={width - right} y1={y} y2={y} stroke={tokenNeutral.main} />
            <text x={left - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill={workstationVisuals.textMuted}>{tick}</text>
          </g>
        );
      })}
      <line x1={left} x2={width - right} y1={targetY} y2={targetY} stroke={tokenBrand.main} strokeDasharray="3 3" />
      <path d={path} fill="none" stroke={tokenError.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="2.6" fill={point.value > 15 ? tokenError.dark : tokenSuccess.darker} stroke={tokenCommon.white} strokeWidth="1" />)}
    </svg>
  );
}
