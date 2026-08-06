import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

const downtimeTrend = [24, 28, 30, 26, 22, 20, 21, 38, 45, 42, 37, 37, 36, 40, 44, 43, 42, 36, 45, 50, 44, 82, 45];

function MetricCard({
  accent,
  label,
  meta,
  target,
  unit,
  value,
}: {
  accent: string;
  label: string;
  meta?: string;
  target?: string;
  unit?: string;
  value: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        minHeight: 48,
        p: 1,
        pl: 1.25,
        bgcolor: tokenNeutral.lightest,
        border: `1px solid ${tokenNeutral.main}`,
        borderRadius: 1.2,
        boxShadow: '0 2px 7px rgba(20, 36, 70, 0.13)',
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
      <Box sx={{display: 'grid', gridTemplateColumns: target ? '1fr 52px' : '1fr', alignItems: 'center', gap: 1}}>
        <Box>
          <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.35}}>
            <Typography sx={{fontSize: 26, lineHeight: 0.95, color: workstationVisuals.tierTextHeading, fontWeight: 400}}>
              {value}
            </Typography>
            {unit ? (
              <Typography sx={{fontSize: 13, lineHeight: 1, color: workstationVisuals.tierTextHeading, mt: 0.2}}>
                {unit}
              </Typography>
            ) : null}
          </Box>
          <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextHeading, mt: 0.25}}>{label}</Typography>
        </Box>
        {target ? (
          <Box sx={{borderLeft: `1px solid ${tokenNeutral.dark}`, pl: 0.85, textAlign: 'center'}}>
            <Typography sx={{fontSize: 7, color: workstationVisuals.tierTextLabel, fontWeight: 900, letterSpacing: 0.5}}>TARGET</Typography>
            <Box sx={{display: 'inline-flex', mt: 0.25, px: 0.5, py: 0.2, borderRadius: 3, bgcolor: tokenWarning.dark, color: workstationVisuals.textPrimary, fontSize: 7.5, fontWeight: 900, whiteSpace: 'nowrap'}}>
              {target}
            </Box>
          </Box>
        ) : meta ? (
          <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextLabel, alignSelf: 'start', justifySelf: 'end'}}>{meta}</Typography>
        ) : null}
      </Box>
    </Paper>
  );
}

function DonutMetric({color, label, value}: {color: string; label: string; value: string}) {
  const radius = 19;
  const circumference = 2 * Math.PI * radius;
  const dash = Number(value) / 100 * circumference;

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: '48px auto', alignItems: 'center', gap: 0.6}}>
      <svg width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={radius} fill="none" stroke={tokenNeutral.main} strokeWidth="5" />
        <circle cx="24" cy="24" r={radius} fill="none" stroke={color} strokeDasharray={`${dash} ${circumference - dash}`} strokeLinecap="round" strokeWidth="5" transform="rotate(-90 24 24)" />
      </svg>
      <Box>
        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.2}}>
          <Typography sx={{fontSize: 24, lineHeight: 0.95, color: workstationVisuals.tierTextHeading, fontWeight: 400}}>{value}</Typography>
          <Typography sx={{fontSize: 13, lineHeight: 1, color: workstationVisuals.tierTextHeading, mt: 0.25}}>%</Typography>
        </Box>
        <Typography sx={{fontSize: 10.5, lineHeight: 1.1, color: workstationVisuals.tierTextHeading}}>{label}</Typography>
      </Box>
    </Box>
  );
}

type MyDowntimeWidgetProps = {
  onOpenDowntimeAnalysis?: () => void;
};

export default function MyDowntimeWidget({onOpenDowntimeAnalysis}: MyDowntimeWidgetProps) {
  return (
    <Paper elevation={0} sx={{width: '100%', height: '100%', minHeight: 262, p: 1.6, borderRadius: 1.5, bgcolor: tokenCommon.white, border: `1px solid ${tokenNeutral.main}`, boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.06)', overflow: 'hidden', display: 'grid', gridTemplateRows: 'auto auto auto minmax(0, 1fr)', gap: 1.15}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Typography sx={{fontSize: 15, lineHeight: 1, color: workstationVisuals.textPrimary, fontWeight: 800, fontFamily: workstationVisuals.fontFamily}}>Downtime</Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.1}}>
          <AutoAwesomeIcon sx={{fontSize: 18, color: tokenInfo.lightest}} />
          <StarBorderIcon sx={{fontSize: 19, color: tokenBrand.main}} />
          <OpenInFullIcon sx={{fontSize: 18, color: tokenBrand.main}} />
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2}}>
        <MetricCard accent={tokenWarning.dark} label="Total Shift Downtime" target="120 MIN" unit="min" value="148" />
        <MetricCard accent={tokenInfo.dark} label="Overbudget" meta="$" value="8,5K" />
      </Box>

      <Paper elevation={0} sx={{position: 'relative', minHeight: 49, p: 1, pl: 1.25, bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.2, boxShadow: '0 2px 7px rgba(20, 36, 70, 0.13)', overflow: 'hidden', '&::before': {content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 5, bgcolor: tokenInfo.dark}}}>
        <Typography sx={{fontSize: 10, color: workstationVisuals.tierTextHeading}}>Caused by</Typography>
        <Typography sx={{fontSize: 26, lineHeight: 1, color: workstationVisuals.tierTextHeading, fontWeight: 400}}>Zone 5A</Typography>
      </Paper>

      <Paper elevation={0} sx={{p: 1.1, minHeight: 0, borderRadius: 1.3, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenCommon.white, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', overflow: 'hidden'}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.55}}>
          <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextHeading, fontWeight: 800}}>Downtime Trend</Typography>
          <Typography sx={{fontSize: 10.5, color: tokenWarning.dark, fontWeight: 850}}>target 60 min</Typography>
        </Box>
        <Box
          onClick={onOpenDowntimeAnalysis}
          sx={{pt: 0.45, cursor: onOpenDowntimeAnalysis ? 'pointer' : 'default'}}
        >
          <DowntimeTrendChart values={downtimeTrend} />
        </Box>
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8, mt: 0.65}}>
          <DonutMetric color={tokenWarning.light} label="Stoppage" value="29" />
          <DonutMetric color={tokenSuccess.lighter} label="Speed Loss" value="12" />
        </Box>
      </Paper>
    </Paper>
  );
}

function DowntimeTrendChart({values}: {values: number[]}) {
  const width = 300;
  const height = 116;
  const left = 28;
  const right = 8;
  const top = 11;
  const bottom = 18;
  const max = 100;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const targetY = top + chartHeight - (60 / max) * chartHeight;
  const points = values.map((value, index) => ({
    x: left + (index / Math.max(values.length - 1, 1)) * chartWidth,
    y: top + chartHeight - (value / max) * chartHeight,
    value,
  }));
  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
      {[100, 50, 0].map((tick) => {
        const y = top + chartHeight - (tick / max) * chartHeight;
        return (
          <g key={tick}>
            <line x1={left} x2={width - right} y1={y} y2={y} stroke={tokenNeutral.main} />
            <text x={left - 8} y={y + 3.5} textAnchor="end" fontSize="10" fill={workstationVisuals.textMuted}>{tick}</text>
          </g>
        );
      })}
      <line x1={left} x2={width - right} y1={targetY} y2={targetY} stroke={tokenBrand.main} strokeDasharray="3 3" />
      <path d={path} fill="none" stroke={tokenWarning.dark} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((point, index) => <circle key={index} cx={point.x} cy={point.y} r="2.6" fill={point.value > 60 ? tokenError.dark : tokenWarning.dark} stroke={tokenCommon.white} strokeWidth="1" />)}
    </svg>
  );
}
