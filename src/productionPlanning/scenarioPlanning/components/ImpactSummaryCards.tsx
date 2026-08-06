import {Box, Paper, Typography} from '@mui/material';
import {
  TrendingUp as DemandIcon,
  Warning as CommitmentIcon,
  Speed as CapacityIcon,
  Inventory as InventoryIcon,
  Verified as MrpIcon,
  ErrorOutline as SeverityIcon,
} from '@mui/icons-material';
import {planningTokens, planningSurfaceSx} from '../../ui/planningTheme';
import type {ScenarioImpactSummary} from '../types';

type CardProps = {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  valueColor?: string;
  iconBg?: string;
};

function MetricCard({label, value, sub, icon, valueColor = planningTokens.textPrimary, iconBg = `color-mix(in srgb, ${planningTokens.primaryBlue} 8%, transparent)`}: CardProps) {
  return (
    <Paper elevation={0} sx={{...planningSurfaceSx, p: 1.8, display: 'flex', flexDirection: 'column', gap: 0.6, flex: '1 1 140px', minWidth: 0}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Typography sx={{fontSize: 11, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em', lineHeight: 1.2}}>
          {label}
        </Typography>
        <Box sx={{width: 32, height: 32, borderRadius: 1.5, bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          {icon}
        </Box>
      </Box>
      <Typography sx={{fontSize: 26, fontWeight: 900, color: valueColor, lineHeight: 1.1}}>
        {value}
      </Typography>
      <Typography sx={{fontSize: 11.5, color: planningTokens.textMuted}}>
        {sub}
      </Typography>
    </Paper>
  );
}

type Props = {
  summary: ScenarioImpactSummary;
};

export default function ImpactSummaryCards({summary}: Props) {
  const demandStr = summary.demandChangeUnits >= 0
    ? `+${summary.demandChangeUnits.toLocaleString()}`
    : summary.demandChangeUnits.toLocaleString();

  const commitStr = summary.commitmentGapUnits >= 0
    ? `+${summary.commitmentGapUnits.toLocaleString()}`
    : summary.commitmentGapUnits.toLocaleString();

  const mrpColor = summary.mrpReadinessImpact === 'NotReady' ? planningTokens.danger : planningTokens.success;
  const sevColor = summary.overallSeverity === 'Blocker' ? planningTokens.danger
    : summary.overallSeverity === 'Warning' ? planningTokens.warning
    : planningTokens.neutral;

  return (
    <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2.5}}>
      <MetricCard
        label="Demand Change (Units)"
        value={demandStr}
        sub={`${summary.demandChangePercent >= 0 ? '+' : ''}${summary.demandChangePercent}% vs baseline`}
        icon={<DemandIcon sx={{fontSize: 17, color: planningTokens.primaryBlue}} />}
        valueColor={summary.demandChangeUnits > 0 ? '#B54708' : planningTokens.textPrimary}
        iconBg={`color-mix(in srgb, ${planningTokens.primaryBlue} 8%, transparent)`}
      />
      <MetricCard
        label="Commitment Gap (Units)"
        value={commitStr}
        sub="Increase vs baseline"
        icon={<CommitmentIcon sx={{fontSize: 17, color: planningTokens.warning}} />}
        valueColor={summary.commitmentGapUnits > 0 ? '#B54708' : planningTokens.success}
        iconBg="#FFF7ED"
      />
      <MetricCard
        label="Overloaded Periods"
        value={String(summary.overloadedPeriods)}
        sub={`vs ${summary.overloadedPeriods > 1 ? '1' : '0'} in baseline`}
        icon={<CapacityIcon sx={{fontSize: 17, color: summary.overloadedPeriods > 0 ? planningTokens.danger : planningTokens.success}} />}
        valueColor={summary.overloadedPeriods > 0 ? planningTokens.danger : planningTokens.success}
        iconBg={summary.overloadedPeriods > 0 ? '#FEF2F2' : '#ECFDF3'}
      />
      <MetricCard
        label="Inventory Below Min"
        value={String(summary.inventoryBelowMinCount)}
        sub={`vs 0 in baseline`}
        icon={<InventoryIcon sx={{fontSize: 17, color: summary.inventoryBelowMinCount > 0 ? planningTokens.danger : planningTokens.success}} />}
        valueColor={summary.inventoryBelowMinCount > 0 ? planningTokens.danger : planningTokens.success}
        iconBg={summary.inventoryBelowMinCount > 0 ? '#FEF2F2' : '#ECFDF3'}
      />
      <MetricCard
        label="MRP Readiness Impact"
        value={summary.mrpReadinessImpact === 'NotReady' ? 'Not Ready' : 'Ready'}
        sub="vs Ready in baseline"
        icon={<MrpIcon sx={{fontSize: 17, color: mrpColor}} />}
        valueColor={mrpColor}
        iconBg={summary.mrpReadinessImpact === 'NotReady' ? '#FEF2F2' : '#ECFDF3'}
      />
      <MetricCard
        label="Overall Severity"
        value={summary.overallSeverity}
        sub="Highest impact"
        icon={<SeverityIcon sx={{fontSize: 17, color: sevColor}} />}
        valueColor={sevColor}
        iconBg={summary.overallSeverity === 'Blocker' ? '#FEF2F2' : summary.overallSeverity === 'Warning' ? '#FFF7ED' : '#EFF6FF'}
      />
    </Box>
  );
}
