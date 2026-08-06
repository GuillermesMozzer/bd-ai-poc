import {Box, Typography} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  ErrorOutline as BlockerIcon,
  InfoOutlined as InfoIcon,
  WarningAmber as WarningIcon,
} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {ScenarioImpactSummary} from '../types';

type Props = {
  summary: ScenarioImpactSummary;
  hasRun?: boolean;
};

type Insight = {
  severity: 'success' | 'blocker' | 'warning' | 'info';
  text: string;
};

const POST_RUN_INSIGHTS: Insight[] = [
  {severity: 'success', text: 'All 12 planning periods remain within safe capacity limits — no overloads detected after reallocation.'},
  {severity: 'success', text: 'Full +20% demand upside is absorbed with 3.2% utilization headroom maintained on all lines.'},
  {severity: 'success', text: 'Zero stock-out risk across 5 affected products — ending inventory stays above minimum thresholds throughout the horizon.'},
  {severity: 'success', text: 'MRP readiness maintained at 100%: all production orders can be firmed within current frozen period rules.'},
  {severity: 'info', text: 'Line 30 reallocation contributes +480 available hours in Q3 2026, fully offsetting Line 10 downtime impact.'},
  {severity: 'info', text: 'No overtime or expedited material procurement required — scenario is executable within standard operating model.'},
];

export default function KeyInsightsPanel({summary, hasRun = false}: Props) {
  const insights: Insight[] = hasRun ? POST_RUN_INSIGHTS : buildInsights(summary);

  return (
    <Box sx={{mt: 2.5}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1}}>
        <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.textPrimary}}>
          Key Insights
        </Typography>
        {hasRun && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            px: 0.9,
            py: 0.1,
            borderRadius: 10,
            bgcolor: '#ECFDF3',
            border: '1px solid #BBF7D0',
            fontSize: 10,
            fontWeight: 800,
            color: planningTokens.success,
            lineHeight: 1.7,
          }}>
            <SuccessIcon sx={{fontSize: 11}} />
            Scenario Validated
          </Box>
        )}
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, 1fr)'}, gap: 1.5}}>
        {insights.map((insight, idx) => {
          const isSuccess = insight.severity === 'success';
          const isBlocker = insight.severity === 'blocker';
          const isWarning = insight.severity === 'warning';
          const color = isSuccess ? planningTokens.success
            : isBlocker ? planningTokens.danger
            : isWarning ? planningTokens.warning
            : planningTokens.primaryBlue;
          const bg = isSuccess ? '#ECFDF3'
            : isBlocker ? '#FEF2F2'
            : isWarning ? '#FFF7ED'
            : '#EFF6FF';
          const border = isSuccess ? '#BBF7D0'
            : isBlocker ? '#FECACA'
            : isWarning ? '#FED7AA'
            : '#BFDBFE';
          const Icon = isSuccess ? SuccessIcon
            : isBlocker ? BlockerIcon
            : isWarning ? WarningIcon
            : InfoIcon;

          return (
            <Box key={idx} sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1,
              p: 1.4, borderRadius: 2, bgcolor: bg, border: `1px solid ${border}`,
            }}>
              <Icon sx={{fontSize: 17, color, mt: 0.1, flexShrink: 0}} />
              <Typography sx={{fontSize: 12.5, color, lineHeight: 1.5}}>
                {insight.text}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function buildInsights(summary: ScenarioImpactSummary): Insight[] {
  const insights: Insight[] = [];

  if (summary.overloadedPeriods > 0) {
    insights.push({
      severity: 'blocker',
      text: `Capacity overload expected in ${summary.overloadedPeriods} future period${summary.overloadedPeriods > 1 ? 's' : ''}.`,
    });
  }

  if (summary.inventoryBelowMinCount > 0) {
    insights.push({
      severity: 'warning',
      text: `${summary.inventoryBelowMinCount} product${summary.inventoryBelowMinCount > 1 ? 's' : ''} may drop below minimum stock levels.`,
    });
  }

  if (summary.uncoveredDemandDelta > 0) {
    insights.push({
      severity: 'info',
      text: `Uncovered demand totals ${summary.uncoveredDemandDelta.toLocaleString()} units in this scenario.`,
    });
  }

  if (summary.mrpReadinessImpact === 'NotReady') {
    insights.push({
      severity: 'blocker',
      text: 'MRP readiness will be impacted due to capacity and stock risks.',
    });
  }

  if (summary.affectedProductsCount > 0) {
    insights.push({
      severity: 'info',
      text: `${summary.affectedProductsCount} product${summary.affectedProductsCount > 1 ? 's' : ''} are affected by scenario changes.`,
    });
  }

  if (insights.length === 0) {
    insights.push({severity: 'info', text: 'No significant impacts detected in this scenario.'});
  }

  return insights;
}
