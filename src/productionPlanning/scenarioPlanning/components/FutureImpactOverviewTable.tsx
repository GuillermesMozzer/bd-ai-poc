import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {planningTokens, planningSurfaceSx} from '../../ui/planningTheme';
import {CapacityStatusBadge, ReadinessBadge, StockStatusBadge} from './Badges';
import type {BucketType, PeriodSummaryRow} from '../types';

type Props = {
  rows: PeriodSummaryRow[];
  bucketType: BucketType;
};

const hdrSx = {
  fontSize: 11, fontWeight: 800, color: planningTokens.textMuted,
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: `2px solid ${planningTokens.border}`, py: 1, whiteSpace: 'nowrap' as const,
};

const cellSx = {fontSize: 13, py: 1, borderBottom: `1px solid ${planningTokens.border}`};

function DeltaCell({value}: {value: number}) {
  const color = value > 5 ? planningTokens.danger : value > 0 ? '#B54708' : value < -5 ? planningTokens.success : planningTokens.textMuted;
  const prefix = value > 0 ? '+' : '';
  return (
    <TableCell sx={{...cellSx, color, fontWeight: 700}}>
      {prefix}{value}%
    </TableCell>
  );
}

function UncoveredCell({value}: {value: number}) {
  const color = value > 0 ? planningTokens.danger : planningTokens.textMuted;
  return (
    <TableCell sx={{...cellSx, color, fontWeight: value > 0 ? 700 : 400}}>
      {value > 0 ? value.toLocaleString() : '—'}
    </TableCell>
  );
}

function InvDeltaCell({value}: {value: number}) {
  const color = value < -1000 ? planningTokens.danger : value > 0 ? planningTokens.success : planningTokens.textMuted;
  const prefix = value > 0 ? '+' : '';
  return (
    <TableCell sx={{...cellSx, color, fontWeight: Math.abs(value) > 500 ? 700 : 400}}>
      {value !== 0 ? `${prefix}${value.toLocaleString()}` : '—'}
    </TableCell>
  );
}

export default function FutureImpactOverviewTable({rows, bucketType}: Props) {
  const colLabel = bucketType === 'Month' ? 'Month' : 'Week';

  return (
    <Box>
      <Typography sx={{fontSize: 13, fontWeight: 800, color: planningTokens.textPrimary, mb: 1}}>
        Future Impact Overview (Monthly)
      </Typography>
      <Paper elevation={0} sx={{...planningSurfaceSx, overflow: 'hidden'}}>
        <TableContainer sx={{maxHeight: 360, overflowX: 'auto'}}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{'& th': {bgcolor: planningTokens.surfaceMuted}}}>
                <TableCell sx={hdrSx}>{colLabel}</TableCell>
                <TableCell sx={hdrSx}>Baseline Util %</TableCell>
                <TableCell sx={hdrSx}>Scenario Util %</TableCell>
                <TableCell sx={hdrSx}>Util Δ</TableCell>
                <TableCell sx={hdrSx}>Uncovered (Units)</TableCell>
                <TableCell sx={hdrSx}>Inventory Δ</TableCell>
                <TableCell sx={hdrSx}>Capacity Status</TableCell>
                <TableCell sx={hdrSx}>Stock Status</TableCell>
                <TableCell sx={hdrSx}>Readiness</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.period} hover>
                  <TableCell sx={{...cellSx, fontWeight: 700, color: planningTokens.textPrimary}}>
                    {row.period}
                  </TableCell>
                  <TableCell sx={{...cellSx, color: planningTokens.textSecondary}}>
                    {row.baselineUtilizationPercent}%
                  </TableCell>
                  <TableCell sx={{...cellSx, fontWeight: 700, color: row.scenarioUtilizationPercent > 100 ? planningTokens.danger : planningTokens.textPrimary}}>
                    {row.scenarioUtilizationPercent}%
                  </TableCell>
                  <DeltaCell value={row.utilizationDelta} />
                  <UncoveredCell value={row.uncoveredDemand} />
                  <InvDeltaCell value={row.inventoryDelta} />
                  <TableCell sx={cellSx}><CapacityStatusBadge status={row.capacityStatus} /></TableCell>
                  <TableCell sx={cellSx}><StockStatusBadge status={row.stockStatus} /></TableCell>
                  <TableCell sx={cellSx}><ReadinessBadge status={row.readinessStatus} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{px: 2, py: 1, display: 'flex', gap: 2.5, borderTop: `1px solid ${planningTokens.border}`, flexWrap: 'wrap'}}>
          {[
            {color: planningTokens.success, label: 'Feasible / OK / Ready'},
            {color: planningTokens.warning, label: 'At Risk / Warning'},
            {color: planningTokens.danger, label: 'Overloaded / Below Min / Not Ready'},
          ].map((item) => (
            <Box key={item.label} sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
              <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: item.color}} />
              <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>{item.label}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
