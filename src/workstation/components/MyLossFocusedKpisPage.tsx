import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, Button, Paper, Typography} from '@mui/material';
import {
  Close as CloseIcon,
  ShowChart as ShowChartIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';

type MyLossFocusedKpisPageProps = {
  onClose: () => void;
};

const annualMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const changeoverAnnual = [244, 232, 226, 219, 211, 203, 198, 192, 187, 181, 176, 168];
const breakdownAnnual = [82, 76, 71, 92, 68, 64, 59, 74, 57, 52, 49, 45];

const paretoLosses = [
  {label: 'Running below standard cycle time', minutes: 244, color: tokenBrand.main},
  {label: 'Changeover duration exceeded standard', minutes: 168, color: tokenInfo.light},
  {label: 'High defect rate during startup', minutes: 120, color: tokenWarning.dark},
  {label: 'Breakdown on filler station', minutes: 82, color: tokenError.main},
  {label: 'Material waiting at staging', minutes: 64, color: tokenBrand.lighter},
];

export default function MyLossFocusedKpisPage({onClose}: MyLossFocusedKpisPageProps) {
  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 2100, bgcolor: tokenNeutral.lighter, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)'}}>
      <Box sx={{height: 112, px: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.8}}>
          <Box sx={{width: 48, height: 48, borderRadius: 2.2, bgcolor: tokenNeutral.lighter, border: `1px solid ${tokenNeutral.main}`, display: 'grid', placeItems: 'center'}}>
            <ShowChartIcon sx={{fontSize: 26, color: tokenBrand.main}} />
          </Box>
          <Box>
            <Typography sx={{fontSize: 40, lineHeight: 1, fontWeight: 800, color: workstationVisuals.textPrimary}}>Loss Focused KPIs</Typography>
            <Typography sx={{fontSize: 13, letterSpacing: 1, color: workstationVisuals.textSecondary, fontWeight: 700}}>DETAILED ANNUAL LOSS ANALYTICS</Typography>
          </Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Button onClick={onClose} sx={{minWidth: 38, width: 38, height: 38, borderRadius: 2, color: workstationVisuals.tierTextLabel, border: `1px solid ${tokenNeutral.dark}`}}>
            <CloseIcon sx={{fontSize: 18}} />
          </Button>
        </Box>
      </Box>

      <Box sx={{p: 2.2, overflow: 'hidden', minHeight: 0}}>
        <Box sx={{height: '100%', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 1.8}}>
          <AnnualLineChartCard
            color={tokenBrand.main}
            data={changeoverAnnual}
            subtitle="Minutes lost by month"
            title="Annual Changeover"
          />
          <AnnualLineChartCard
            color={tokenError.main}
            data={breakdownAnnual}
            subtitle="Minutes lost by month"
            title="Annual Breakdown"
          />
          <ParetoTopLossesCard />
        </Box>
      </Box>
    </Box>
  );
}

function AnnualLineChartCard({
  color,
  data,
  subtitle,
  title,
}: {
  color: string;
  data: number[];
  subtitle: string;
  title: string;
}) {
  const total = data.reduce((sum, value) => sum + value, 0);
  const best = Math.min(...data);
  const latest = data[data.length - 1];

  return (
    <Paper elevation={0} sx={{minHeight: 0, borderRadius: 3, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white, p: 1.8, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', boxShadow: '0 18px 38px rgba(15,23,42,0.06)'}}>
      <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2}}>
        <Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
            <ShowChartIcon sx={{fontSize: 18, color}} />
            <Typography sx={{fontSize: 16, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>{title}</Typography>
          </Box>
          <Typography sx={{fontSize: 12, color: workstationVisuals.textSecondary, mt: 0.35}}>{subtitle}</Typography>
        </Box>
        <Box sx={{textAlign: 'right'}}>
          <Typography sx={{fontSize: 34, lineHeight: 1, fontWeight: 900, color: workstationVisuals.textPrimary}}>{latest}</Typography>
          <Typography sx={{fontSize: 12, color: workstationVisuals.textMuted, fontWeight: 800}}>MINS latest</Typography>
        </Box>
      </Box>

      <Box sx={{minHeight: 0, mt: 1.5}}>
        <AnnualLineChart color={color} data={data} />
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1.2, mt: 1.3}}>
        <ChartStat label="Annual total" value={`${total} mins`} />
        <ChartStat label="Best month" value={`${best} mins`} />
        <ChartStat label="YoY focus" value={latest <= best + 6 ? 'Stable' : 'Watch'} />
      </Box>
    </Paper>
  );
}

function AnnualLineChart({color, data}: {color: string; data: number[]}) {
  const width = 780;
  const height = 265;
  const left = 44;
  const right = 18;
  const top = 18;
  const bottom = 36;
  const min = Math.min(...data) - 12;
  const max = Math.max(...data) + 12;
  const range = Math.max(max - min, 1);
  const xStep = (width - left - right) / (data.length - 1);
  const points = data.map((value, index) => {
    const x = left + index * xStep;
    const y = top + ((max - value) / range) * (height - top - bottom);
    return {x, y, value};
  });
  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
  const fillPath = `${polyline} ${points[points.length - 1].x},${height - bottom} ${points[0].x},${height - bottom}`;
  const ticks = [max, max - range * 0.25, max - range * 0.5, max - range * 0.75, min].map((value) => Math.round(value));

  return (
    <Box sx={{height: '100%', minHeight: 260, border: `1px dashed ${tokenNeutral.dark}`, borderRadius: 2, overflow: 'hidden', bgcolor: tokenCommon.white}}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" preserveAspectRatio="none" aria-hidden="true">
        {ticks.map((tick, index) => {
          const y = top + index * ((height - top - bottom) / (ticks.length - 1));
          return (
            <g key={`${tick}-${index}`}>
              <line x1={left} x2={width - right} y1={y} y2={y} stroke={tokenNeutral.main} strokeDasharray="4 4" />
              <text x={left - 10} y={y + 4} textAnchor="end" fontSize="11" fill={workstationVisuals.textSecondary}>{tick}</text>
            </g>
          );
        })}
        <polygon points={fillPath} fill={color} opacity="0.08" />
        <polyline points={polyline} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {points.map((point, index) => (
          <g key={annualMonths[index]}>
            <circle cx={point.x} cy={point.y} r="5" fill={tokenCommon.white} stroke={color} strokeWidth="3" vectorEffect="non-scaling-stroke" />
            <text x={point.x} y={height - 12} textAnchor="middle" fontSize="11" fill={workstationVisuals.textSecondary}>{annualMonths[index]}</text>
            <text x={point.x} y={point.y - 12} textAnchor="middle" fontSize="11" fontWeight="700" fill={workstationVisuals.tierTextHeading}>{point.value}</text>
          </g>
        ))}
      </svg>
    </Box>
  );
}

function ParetoTopLossesCard() {
  const total = paretoLosses.reduce((sum, item) => sum + item.minutes, 0);
  let cumulative = 0;

  return (
    <Paper elevation={0} sx={{gridColumn: '1 / span 2', minHeight: 0, borderRadius: 3, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white, p: 1.8, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', boxShadow: '0 18px 38px rgba(15,23,42,0.06)'}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
          <WarningAmberIcon sx={{fontSize: 18, color: tokenError.main}} />
          <Typography sx={{fontSize: 16, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>Pareto: Top 5 Losses</Typography>
        </Box>
        <Typography sx={{fontSize: 12, color: workstationVisuals.textSecondary, fontWeight: 800}}>Cumulative minutes by loss driver</Typography>
      </Box>

      <Box sx={{minHeight: 0, mt: 1.4, display: 'grid', gap: 1.1}}>
        {paretoLosses.map((loss, index) => {
          cumulative += loss.minutes;
          const width = (loss.minutes / paretoLosses[0].minutes) * 100;
          const cumulativePct = Math.round((cumulative / total) * 100);
          return (
            <Box key={loss.label} sx={{display: 'grid', gridTemplateColumns: '290px minmax(0, 1fr) 86px 68px', alignItems: 'center', gap: 1.2}}>
              <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextHeading, fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {index + 1}. {loss.label}
              </Typography>
              <Box sx={{height: 28, borderRadius: 999, bgcolor: tokenNeutral.lighter, overflow: 'hidden', position: 'relative'}}>
                <Box sx={{height: '100%', width: `${width}%`, bgcolor: loss.color, borderRadius: 999}} />
              </Box>
              <Typography sx={{fontSize: 14, color: workstationVisuals.textPrimary, fontWeight: 900, textAlign: 'right'}}>{loss.minutes} mins</Typography>
              <Typography sx={{fontSize: 12, color: workstationVisuals.textSecondary, fontWeight: 800, textAlign: 'right'}}>{cumulativePct}%</Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

function ChartStat({label, value}: {label: string; value: string}) {
  return (
    <Box sx={{borderRadius: 2, border: `1px solid ${tokenNeutral.main}`, bgcolor: tokenNeutral.lightest, px: 1.2, py: 1}}>
      <Typography sx={{fontSize: 11, color: workstationVisuals.textSecondary, fontWeight: 800}}>{label}</Typography>
      <Typography sx={{fontSize: 16, color: workstationVisuals.textPrimary, fontWeight: 900, mt: 0.25}}>{value}</Typography>
    </Box>
  );
}
