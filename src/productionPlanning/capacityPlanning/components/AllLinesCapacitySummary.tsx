import {Box, Chip, Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography} from '@mui/material';
import {ViewList as AllLinesIcon} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {CapacityByLineMachines, LineDesignCapacity, PlanningAssumption} from '../types';
import {getUtilizationColor, getUtilizationBg, getUtilizationStatus} from '../utils';

type Props = {
  lines: CapacityByLineMachines[];
  designCapacities: LineDesignCapacity[];
  assumptions: PlanningAssumption[];
};

export default function AllLinesCapacitySummary({lines, designCapacities, assumptions}: Props) {
  const rows = lines.map((line) => {
    const design = designCapacities.find((d) => d.lineId === line.lineId);
    const assumption = assumptions.find((a) => a.lineId === line.lineId);
    const maxUtil = Math.max(...line.months.map((m) => m.utilizationPct));
    const status = getUtilizationStatus(maxUtil);
    return {line, design, assumption, maxUtil, status};
  });

  const totalDesignHrs = rows.reduce((s, r) => s + (r.design?.designHrsPerMonth ?? 0), 0);
  const totalEffHrs = rows.reduce((s, r) => s + (r.assumption?.effectivePlanningHrsPerMonth ?? 0), 0);
  const avgFactor = rows.length > 0
    ? Math.round(rows.reduce((s, r) => s + (r.assumption?.planningEfficiencyFactor ?? 0), 0) / rows.length * 1000) / 1000
    : 0;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
      {/* Summary KPI strip */}
      <Paper elevation={0} sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 2, px: 2.5, py: 1.5}}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{mb: 1.5}}>
          <AllLinesIcon sx={{fontSize: 18, color: planningTokens.primaryBlue}} />
          <Typography sx={{fontSize: 14, fontWeight: 800, color: planningTokens.textPrimary}}>
            All Lines – Capacity Configuration Overview
          </Typography>
          <Chip
            label={`${lines.length} lines`}
            size="small"
            sx={{fontSize: 11, height: 20, bgcolor: 'var(--planning-neutral-bg)', color: planningTokens.primaryBlue, fontWeight: 700}}
          />
        </Stack>
        <Stack direction="row" spacing={4}>
          <Box>
            <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>Total Design Hrs/Mo</Typography>
            <Typography sx={{fontSize: 16, fontWeight: 800, color: planningTokens.textPrimary}}>
              {(totalDesignHrs / 1000).toFixed(0)}K hrs
            </Typography>
          </Box>
          <Box>
            <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>Total Effective Hrs/Mo</Typography>
            <Typography sx={{fontSize: 16, fontWeight: 800, color: planningTokens.primaryBlue}}>
              {(totalEffHrs / 1000).toFixed(0)}K hrs
            </Typography>
          </Box>
          <Box>
            <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>Avg Planning Factor</Typography>
            <Typography sx={{fontSize: 16, fontWeight: 800, color: planningTokens.textPrimary}}>
              {(avgFactor * 100).toFixed(1)}%
            </Typography>
          </Box>
          <Box>
            <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>Lines at Risk / Overloaded</Typography>
            <Typography sx={{fontSize: 16, fontWeight: 800, color: '#DC2626'}}>
              {rows.filter((r) => r.status === 'AtRisk' || r.status === 'Overloaded').length}
              <span style={{fontSize: 12, fontWeight: 500, color: planningTokens.textMuted}}> / {lines.length}</span>
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Lines table */}
      <Paper elevation={0} sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 2, overflow: 'hidden'}}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{bgcolor: 'var(--planning-surface-muted)', '& th': {fontSize: 11, fontWeight: 700, color: planningTokens.textMuted, py: 1, borderBottom: `1px solid ${planningTokens.border}`}}}>
              <TableCell>Line</TableCell>
              <TableCell align="center">Shifts/Day</TableCell>
              <TableCell align="center">Days/Week</TableCell>
              <TableCell align="right">Design Hrs/Mo</TableCell>
              <TableCell align="right">Planning Factor</TableCell>
              <TableCell align="right">Eff. Hrs/Mo</TableCell>
              <TableCell align="right">Nominal OEE</TableCell>
              <TableCell>Last Updated</TableCell>
              <TableCell align="center">Peak Util.</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(({line, design, assumption, maxUtil, status}) => {
              const utilColor = getUtilizationColor(status);
              const utilBg = getUtilizationBg(status);
              return (
                <TableRow
                  key={line.lineId}
                  sx={{'& td': {fontSize: 12, py: 0.9, borderBottom: `1px solid color-mix(in srgb, ${planningTokens.border} 20%, transparent)`}, '&:last-child td': {borderBottom: 'none'}}}
                >
                  <TableCell>
                    <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary}}>
                      {line.lineName}
                    </Typography>
                    <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>
                      {line.machines.length} machine{line.machines.length !== 1 ? 's' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{color: planningTokens.textSecondary}}>{design?.designShiftsPerDay ?? '--'}</TableCell>
                  <TableCell align="center" sx={{color: planningTokens.textSecondary}}>{design?.designDaysPerWeek ?? '--'}</TableCell>
                  <TableCell align="right" sx={{fontWeight: 600, color: planningTokens.textPrimary}}>
                    {design ? `${(design.designHrsPerMonth / 1000).toFixed(0)}K` : '--'}
                  </TableCell>
                  <TableCell align="right">
                    {assumption ? (
                      <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.primaryBlue}}>
                        {(assumption.planningEfficiencyFactor * 100).toFixed(0)}%
                      </Typography>
                    ) : '--'}
                  </TableCell>
                  <TableCell align="right" sx={{fontWeight: 600, color: planningTokens.textPrimary}}>
                    {assumption ? `${(assumption.effectivePlanningHrsPerMonth / 1000).toFixed(0)}K` : '--'}
                  </TableCell>
                  <TableCell align="right" sx={{color: planningTokens.textSecondary}}>
                    {design ? `${design.nominalOeePct}%` : '--'}
                  </TableCell>
                  <TableCell sx={{color: planningTokens.textMuted, fontSize: 11}}>
                    {assumption ? (
                      <Box>
                        <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>{assumption.lastUpdatedAt}</Typography>
                        <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>{assumption.lastUpdatedBy}</Typography>
                      </Box>
                    ) : '--'}
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={`${maxUtil}%`}
                      size="small"
                      sx={{
                        fontSize: 10, height: 20, fontWeight: 700,
                        bgcolor: utilBg,
                        color: utilColor,
                        border: `1px solid color-mix(in srgb, ${utilColor} 20%, transparent)`,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Paper>

      <Typography sx={{fontSize: 11, color: planningTokens.textMuted, fontStyle: 'italic', px: 0.5}}>
        Select a line or equipment in the hierarchy to view and edit its capacity configuration.
      </Typography>
    </Box>
  );
}
