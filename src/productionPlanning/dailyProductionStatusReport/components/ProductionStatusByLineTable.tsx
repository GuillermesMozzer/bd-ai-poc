import React from 'react';
import {MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography} from '@mui/material';
import type {ProductionLineLifecycleStatus, ProductionLineStatus} from '../types';
import {
  calculateTotalsRow,
  deriveOeeStatus,
  deriveOnTimeStatus,
  deriveQualityYieldStatus,
  formatDeltaUnits,
  formatPercent,
  formatUnits,
} from '../utils';
import AchievementProgressBar from './AchievementProgressBar';
import ProductionLineStatusBadge from './ProductionLineStatusBadge';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
} as const;

const metricColorMap = {
  green: '#027A48',
  orange: '#C2410C',
  red: '#B42318',
  gray: '#667085',
  blue: '#1D4ED8',
} as const;

type Props = {
  lines: ProductionLineStatus[];
  selectedLineId: string | null;
  onSelectLine: (lineId: string) => void;
  onUpdateLine: (lineId: string, patch: Partial<ProductionLineStatus>) => void;
};

const editableStatuses: ProductionLineLifecycleStatus[] = ['Running', 'Stopped', 'Idle', 'PlannedDown', 'Maintenance', 'Complete'];

export default function ProductionStatusByLineTable({
  lines,
  selectedLineId,
  onSelectLine,
  onUpdateLine,
}: Props) {
  const totals = calculateTotalsRow(lines);

  return (
    <Paper elevation={0} sx={{...moduleCardSx, overflow: 'hidden'}}>
      <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', px: 1.5, pt: 1.5}}>
        Production Status by Line
      </Typography>
      <TableContainer sx={{mt: 1}}>
        <Table size="small" aria-label="Production status by line table">
          <TableHead>
            <TableRow>
              <TableCell>Line</TableCell>
              <TableCell>Line Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Product / Campaign</TableCell>
              <TableCell>Plan (Units)</TableCell>
              <TableCell>Actual (Units)</TableCell>
              <TableCell>Achv. (%)</TableCell>
              <TableCell>Variance (Units)</TableCell>
              <TableCell>OEE (%)</TableCell>
              <TableCell>Quality Yield (%)</TableCell>
              <TableCell>Orders On-Time (%)</TableCell>
              <TableCell>Downtime (min)</TableCell>
              <TableCell>Reason for Gap / Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lines.map((line) => {
              const varianceColor = line.varianceUnits < 0 ? '#DC2626' : line.varianceUnits > 0 ? '#16A34A' : '#475467';
              const oeeColor = metricColorMap[deriveOeeStatus(line.oeePercent)];
              const qualityColor = metricColorMap[deriveQualityYieldStatus(line.qualityYieldPercent)];
              const onTimeColor = metricColorMap[deriveOnTimeStatus(line.ordersOnTimePercent)];
              const selected = selectedLineId === line.lineId;

              return (
                <TableRow
                  key={line.id}
                  hover
                  selected={selected}
                  onClick={() => onSelectLine(line.lineId)}
                  sx={{
                    cursor: 'pointer',
                    '&.Mui-selected': {bgcolor: 'var(--planning-neutral-bg)'},
                    '& .MuiTableCell-root': {py: 1.05, verticalAlign: 'top'},
                  }}
                >
                  <TableCell sx={{fontWeight: 900, color: 'var(--planning-text-primary)'}}>{line.lineName}</TableCell>
                  <TableCell>{line.lineDescription}</TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <Select
                      size="small"
                      value={line.status}
                      onChange={(event) => onUpdateLine(line.lineId, {status: event.target.value as ProductionLineLifecycleStatus})}
                      sx={{minWidth: 130}}
                      renderValue={(value) => <ProductionLineStatusBadge status={value as ProductionLineLifecycleStatus} />}
                    >
                      {editableStatuses.map((status) => (
                        <MenuItem key={status} value={status}>{status}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Typography sx={{fontSize: 12.5, color: '#1F2937', fontWeight: 800}}>{line.productCode}</Typography>
                    <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 0.45}}>{line.productDescription}</Typography>
                  </TableCell>
                  <TableCell>{formatUnits(line.planUnits)}</TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <TextField
                      size="small"
                      type="number"
                      value={line.actualUnits}
                      onChange={(event) => onUpdateLine(line.lineId, {actualUnits: Number(event.target.value)})}
                      sx={{width: 112}}
                      inputProps={{'aria-label': `${line.lineName} actual units`}}
                    />
                  </TableCell>
                  <TableCell><AchievementProgressBar value={line.achievementPercent} /></TableCell>
                  <TableCell sx={{fontWeight: 900, color: varianceColor}}>{formatDeltaUnits(line.varianceUnits)}</TableCell>
                  <TableCell sx={{fontWeight: 800, color: oeeColor}}>{formatPercent(line.oeePercent)}</TableCell>
                  <TableCell sx={{fontWeight: 800, color: qualityColor}}>{formatPercent(line.qualityYieldPercent)}</TableCell>
                  <TableCell sx={{fontWeight: 800, color: onTimeColor}}>{formatPercent(line.ordersOnTimePercent)}</TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <TextField
                      size="small"
                      type="number"
                      value={line.downtimeMinutes}
                      onChange={(event) => onUpdateLine(line.lineId, {downtimeMinutes: Number(event.target.value)})}
                      sx={{width: 92}}
                      inputProps={{'aria-label': `${line.lineName} downtime minutes`}}
                    />
                  </TableCell>
                  <TableCell onClick={(event) => event.stopPropagation()}>
                    <TextField
                      size="small"
                      value={line.reasonForGap}
                      onChange={(event) => onUpdateLine(line.lineId, {reasonForGap: event.target.value})}
                      sx={{minWidth: 260}}
                      inputProps={{'aria-label': `${line.lineName} gap notes`}}
                    />
                  </TableCell>
                </TableRow>
              );
            })}

            <TableRow sx={{bgcolor: 'var(--planning-surface-muted)'}}>
              <TableCell sx={{fontWeight: 900, color: 'var(--planning-text-primary)'}}>TOTAL</TableCell>
              <TableCell colSpan={3} />
              <TableCell sx={{fontWeight: 900}}>{formatUnits(totals.totalPlanUnits)}</TableCell>
              <TableCell sx={{fontWeight: 900}}>{formatUnits(totals.totalActualUnits)}</TableCell>
              <TableCell sx={{fontWeight: 900}}>{formatPercent(totals.achievementPercent)}</TableCell>
              <TableCell sx={{fontWeight: 900, color: totals.totalVarianceUnits < 0 ? '#DC2626' : '#16A34A'}}>
                {formatDeltaUnits(totals.totalVarianceUnits)}
              </TableCell>
              <TableCell sx={{fontWeight: 900}}>{formatPercent(totals.oeePercent)}</TableCell>
              <TableCell sx={{fontWeight: 900}}>{formatPercent(totals.qualityYieldPercent)}</TableCell>
              <TableCell sx={{fontWeight: 900}}>{formatPercent(totals.ordersOnTimePercent)}</TableCell>
              <TableCell sx={{fontWeight: 900}}>{totals.downtimeMinutes}</TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
