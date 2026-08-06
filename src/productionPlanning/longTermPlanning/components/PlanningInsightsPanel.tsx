import {Box, Paper, Typography} from '@mui/material';
import type {LongTermPlanRowView, PlanningException, ProductionLine} from '../types';
import {InsightCard, StatusPill} from '../../ui/PlanningComponents';
import {planningCardSx, planningTokens} from '../../ui/planningTheme';

type PlanningInsightsPanelProps = {
  rows: LongTermPlanRowView[];
  exceptions: PlanningException[];
  productionLines: ProductionLine[];
  lastUpdatedAt: string | null;
};

export default function PlanningInsightsPanel({
  rows,
  exceptions,
  productionLines,
  lastUpdatedAt,
}: PlanningInsightsPanelProps) {
  const constrainedRows = rows.filter((row) => row.status === 'Constrained');
  const uncoveredUnits = rows.reduce((sum, row) => sum + row.uncoveredQuantity, 0);
  const avgUtilization = rows.length ? (rows.reduce((sum, row) => sum + row.utilizationPercent, 0) / rows.length).toFixed(2) : '0.00';
  const exceptionBreakdown = {
    blocker: exceptions.filter((item) => item.severity === 'Blocker').length,
    warning: exceptions.filter((item) => item.severity === 'Warning').length,
    info: exceptions.filter((item) => item.severity === 'Info').length,
  };

  const lineSummary = productionLines.map((line) => {
    const lineRows = rows.filter((row) => row.assignedLineId === line.id);
    const utilization = lineRows.length
      ? lineRows.reduce((sum, row) => sum + row.utilizationPercent, 0) / lineRows.length
      : 0;
    return {name: line.name, utilization: Number(utilization.toFixed(0))};
  });

  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 1.3}}>
      <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', px: 0.4}}>
        Insights
      </Typography>
      <Box sx={{display: 'grid', gap: 1.05, mt: 1.1}}>
        <InsightCard title="Constrained Rows" value={constrainedRows.length} subtitle={`${rows.length ? ((constrainedRows.length / rows.length) * 100).toFixed(1) : '0.0'}% of total`} tone={constrainedRows.length ? 'danger' : 'success'} />
        <InsightCard title="Uncovered Units" value={uncoveredUnits.toLocaleString()} subtitle={`Across ${rows.filter((row) => row.uncoveredQuantity > 0).length} rows`} tone={uncoveredUnits ? 'danger' : 'success'} />
        <InsightCard title="Average Utilization" value={`${avgUtilization}%`} subtitle="All lines" tone={Number(avgUtilization) >= 90 ? 'warning' : 'success'} />
        <InsightCard title="Line Load Summary">
          <Box sx={{display: 'grid', gap: 0.9}}>
            {lineSummary.map((line) => (
              <Box key={line.name} sx={{display: 'grid', gridTemplateColumns: '56px 1fr 38px', gap: 1, alignItems: 'center'}}>
                <Typography sx={{fontSize: 12, color: planningTokens.textSecondary, fontWeight: 700}}>
                  {line.name}
                </Typography>
                <Box sx={{height: 6, bgcolor: '#E8EDF8', borderRadius: 999, overflow: 'hidden'}}>
                  <Box
                    sx={{
                      height: '100%',
                      width: `${Math.min(line.utilization, 140)}%`,
                      borderRadius: 999,
                      bgcolor: line.utilization >= 100 ? planningTokens.danger : line.utilization >= 90 ? planningTokens.warning : planningTokens.success,
                    }}
                  />
                </Box>
                <Typography sx={{fontSize: 11.5, color: planningTokens.textPrimary, fontWeight: 800}}>
                  {line.utilization}%
                </Typography>
              </Box>
            ))}
          </Box>
        </InsightCard>
        <InsightCard title="Exceptions">
          <Box sx={{display: 'grid', gap: 0.7}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <StatusPill label="Constrained" tone="Constrained" />
              <Typography sx={{fontSize: 12.5, color: planningTokens.textPrimary, fontWeight: 800}}>{exceptionBreakdown.blocker}</Typography>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <StatusPill label="At Risk" tone="AtRisk" />
              <Typography sx={{fontSize: 12.5, color: planningTokens.textPrimary, fontWeight: 800}}>{exceptionBreakdown.warning}</Typography>
            </Box>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <StatusPill label="OK" tone="Feasible" />
              <Typography sx={{fontSize: 12.5, color: planningTokens.textPrimary, fontWeight: 800}}>{rows.filter((row) => row.status === 'Feasible').length}</Typography>
            </Box>
          </Box>
        </InsightCard>
        <InsightCard
          title="Last Updated"
          value={lastUpdatedAt ? new Date(lastUpdatedAt).toLocaleString() : 'Not refreshed yet'}
          subtitle="Local planning session timestamp"
        />
      </Box>
    </Paper>
  );
}
