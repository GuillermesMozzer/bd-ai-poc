import {Box, LinearProgress, Paper, Typography} from '@mui/material';
import {TrendingDown as TrendingDownIcon, TrendingUp as TrendingUpIcon} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {CapacityKpis} from '../types';
import {formatKHours, formatUnits} from '../utils';

type SparklineProps = {values: number[]; color: string};

function Sparkline({values, color}: SparklineProps) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 52;
  const h = 20;
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(' ');
  return (
    <svg width={w} height={h} style={{flexShrink: 0}}>
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const demandSparkline = [58, 62, 65, 67, 71, 74, 76, 78, 80, 82, 84, 86];
const reqCapSparkline = [70, 74, 78, 81, 85, 89, 92, 96, 99, 103, 107, 110];
const availCapSparkline = [100, 101, 102, 101, 103, 103, 104, 104, 105, 105, 106, 106];
const gapSparkline = [30, 27, 24, 20, 18, 14, 12, 8, 6, 2, -1, -4];

type KpiCardProps = {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
  sparkline?: number[];
  sparkColor?: string;
  progress?: number;
  progressColor?: string;
  children?: React.ReactNode;
};

function KpiCard({label, value, sub, subColor, sparkline, sparkColor, progress, progressColor, children}: KpiCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: `1px solid ${planningTokens.border}`,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        minWidth: 0,
      }}
    >
      <Typography sx={{fontSize: 11, fontWeight: 600, color: planningTokens.textSecondary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{label}</Typography>
      <Typography sx={{fontSize: 20, fontWeight: 800, color: planningTokens.textPrimary, lineHeight: 1.1, whiteSpace: 'nowrap'}}>{value}</Typography>
      {sub && (
        <Typography sx={{fontSize: 11, color: subColor ?? planningTokens.textSecondary}}>{sub}</Typography>
      )}
      {sparkline && sparkColor && (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 0.5}}>
          <Sparkline values={sparkline} color={sparkColor} />
        </Box>
      )}
      {progress !== undefined && (
        <Box sx={{mt: 0.5}}>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: planningTokens.border,
              '& .MuiLinearProgress-bar': {bgcolor: progressColor ?? planningTokens.primaryBlue},
            }}
          />
        </Box>
      )}
      {children}
    </Paper>
  );
}

type Props = {kpis: CapacityKpis};

export default function CapacityKpiCards({kpis}: Props) {
  const deltaColor = (d: number) => (d >= 0 ? planningTokens.success : planningTokens.danger);

  return (
    <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(8, minmax(0, 1fr))', gap: 1.5}}>
      <KpiCard
        label="Total Demand (12M)"
        value={formatUnits(kpis.totalDemand)}
        sub={`+${kpis.totalDemandDelta}% vs Apr-2026`}
        subColor={deltaColor(kpis.totalDemandDelta)}
        sparkline={demandSparkline}
        sparkColor={planningTokens.primaryBlue}
      />
      <KpiCard
        label="Required Capacity (12M)"
        value={`${formatKHours(kpis.requiredCapacity)}`}
        sub={`+${kpis.requiredCapacityDelta}% vs Apr-2026`}
        subColor={deltaColor(kpis.requiredCapacityDelta)}
        sparkline={reqCapSparkline}
        sparkColor={planningTokens.textSecondary}
      >
        <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>hours</Typography>
      </KpiCard>
      <KpiCard
        label="Available Capacity (12M)"
        value={`${formatKHours(kpis.availableCapacity)}`}
        sub={`+${kpis.availableCapacityDelta}% vs Apr-2026`}
        subColor={deltaColor(kpis.availableCapacityDelta)}
        sparkline={availCapSparkline}
        sparkColor={planningTokens.success}
      >
        <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>hours</Typography>
      </KpiCard>
      <KpiCard
        label="Capacity Gap (12M)"
        value={`${formatKHours(Math.abs(kpis.capacityGap))}`}
        sub={`${kpis.capacityGap < 0 ? '-' : '+'}${formatKHours(Math.abs(kpis.capacityGap))} hours`}
        subColor={kpis.capacityGap < 0 ? planningTokens.danger : planningTokens.success}
        sparkline={gapSparkline}
        sparkColor={kpis.capacityGap < 0 ? planningTokens.danger : planningTokens.success}
      />
      <KpiCard
        label="Avg. Capacity Utilization"
        value={`${kpis.avgUtilization}%`}
        sub="vs 100% available"
        subColor={planningTokens.textSecondary}
        progress={kpis.avgUtilization}
        progressColor={kpis.avgUtilization > 100 ? planningTokens.danger : kpis.avgUtilization > 90 ? '#F97316' : planningTokens.success}
      />
      <Paper
        elevation={0}
        sx={{p: 1.5, borderRadius: 3, border: `1px solid ${planningTokens.border}`, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0}}
      >
        <Typography sx={{fontSize: 11, fontWeight: 600, color: planningTokens.textSecondary}}>Overloaded Months</Typography>
        <Typography sx={{fontSize: 20, fontWeight: 800, color: planningTokens.danger, lineHeight: 1.1}}>{kpis.overloadedMonths.length}</Typography>
        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.3, mt: 0.3}}>
          {kpis.overloadedMonths.map((m) => (
            <Typography key={m} sx={{fontSize: 10, fontWeight: 700, color: planningTokens.danger}}>{m}</Typography>
          ))}
        </Box>
      </Paper>
      <Paper
        elevation={0}
        sx={{p: 1.5, borderRadius: 3, border: `1px solid ${planningTokens.border}`, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0}}
      >
        <Typography sx={{fontSize: 11, fontWeight: 600, color: planningTokens.textSecondary}}>Bottleneck Line</Typography>
        <Typography sx={{fontSize: 20, fontWeight: 800, color: planningTokens.textPrimary, lineHeight: 1.1}}>{kpis.bottleneckLine}</Typography>
        <Typography sx={{fontSize: 10, fontWeight: 700, color: planningTokens.danger}}>{kpis.bottleneckMonth}</Typography>
      </Paper>
      <Paper
        elevation={0}
        sx={{p: 1.5, borderRadius: 3, border: `1px solid ${planningTokens.border}`, display: 'flex', flexDirection: 'column', gap: 0.5, minWidth: 0}}
      >
        <Typography sx={{fontSize: 11, fontWeight: 600, color: planningTokens.textSecondary}}>Planning Confidence</Typography>
        <Typography
          sx={{
            fontSize: 20, fontWeight: 800, lineHeight: 1.1,
            color: kpis.planningConfidence === 'High' ? planningTokens.success : kpis.planningConfidence === 'Medium' ? '#F97316' : planningTokens.danger,
          }}
        >
          {kpis.planningConfidence}
        </Typography>
        <Box sx={{display: 'flex', gap: 0.3, mt: 0.5}}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Box
              key={i}
              sx={{
                width: 8, height: 14, borderRadius: 1,
                bgcolor: i <= (kpis.planningConfidence === 'High' ? 5 : kpis.planningConfidence === 'Medium' ? 3 : 1)
                  ? planningTokens.success
                  : planningTokens.border,
              }}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
