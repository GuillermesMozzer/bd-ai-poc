import {Box, Checkbox, FormControlLabel, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography} from '@mui/material';
import {useState} from 'react';
import {planningTokens, planningSurfaceSx} from '../../ui/planningTheme';
import {CapacityStatusBadge} from './Badges';
import type {BaselineImpactRow} from '../types';

type Props = {
  rows: BaselineImpactRow[];
};

const hdrSx = {
  fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted,
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: `2px solid ${planningTokens.border}`, py: 1, whiteSpace: 'nowrap' as const,
  bgcolor: planningTokens.surfaceMuted,
};

const cellSx = {fontSize: 12, py: 0.8, borderBottom: `1px solid ${planningTokens.border}`};

function DeltaNumCell({base, scenario}: {base: number; scenario: number}) {
  const delta = scenario - base;
  const color = delta > 0 ? '#B54708' : delta < 0 ? planningTokens.success : planningTokens.textMuted;
  const prefix = delta > 0 ? '+' : '';
  return (
    <TableCell sx={{...cellSx, color, fontWeight: delta !== 0 ? 700 : 400}}>
      {delta !== 0 ? `${prefix}${delta.toLocaleString()}` : '—'}
    </TableCell>
  );
}

function DeltaPctCell({base, scenario}: {base: number; scenario: number}) {
  const delta = Math.round((scenario - base) * 10) / 10;
  const color = delta > 5 ? planningTokens.danger : delta > 0 ? '#B54708' : delta < 0 ? planningTokens.success : planningTokens.textMuted;
  const prefix = delta > 0 ? '+' : '';
  return (
    <TableCell sx={{...cellSx, color, fontWeight: Math.abs(delta) > 3 ? 700 : 400}}>
      {delta !== 0 ? `${prefix}${delta}%` : '—'}
    </TableCell>
  );
}

export default function ScenarioComparisonTable({rows}: Props) {
  const [filterProduct, setFilterProduct] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('');
  const [onlyChanged, setOnlyChanged] = useState(false);
  const [onlyBlockers, setOnlyBlockers] = useState(false);

  const filteredRows = rows.filter((r) => {
    if (filterProduct && !r.productCode.toLowerCase().includes(filterProduct.toLowerCase())) return false;
    if (filterPeriod && !r.period.toLowerCase().includes(filterPeriod.toLowerCase())) return false;
    if (onlyChanged && r.scenarioRequestedQuantity === r.baselineRequestedQuantity && r.scenarioCapacityStatus === r.baselineCapacityStatus) return false;
    if (onlyBlockers && r.scenarioCapacityStatus !== 'Overloaded') return false;
    return true;
  });

  return (
    <Box>
      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2, alignItems: 'center'}}>
        <TextField
          size="small" label="Filter Product" value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          sx={{width: 160, '& .MuiInputBase-input': {fontSize: 13}}}
        />
        <TextField
          size="small" label="Filter Period" value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
          sx={{width: 140, '& .MuiInputBase-input': {fontSize: 13}}}
        />
        <FormControlLabel
          control={<Checkbox size="small" checked={onlyChanged} onChange={(e) => setOnlyChanged(e.target.checked)} />}
          label={<Typography sx={{fontSize: 12.5}}>Changed rows only</Typography>}
        />
        <FormControlLabel
          control={<Checkbox size="small" checked={onlyBlockers} onChange={(e) => setOnlyBlockers(e.target.checked)} />}
          label={<Typography sx={{fontSize: 12.5}}>Blockers only</Typography>}
        />
        <Typography sx={{fontSize: 12, color: planningTokens.textMuted, ml: 'auto'}}>
          {filteredRows.length} rows
        </Typography>
      </Box>

      <Paper elevation={0} sx={{...planningSurfaceSx, overflow: 'hidden'}}>
        <TableContainer sx={{maxHeight: 480, overflowX: 'auto'}}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={hdrSx}>Product</TableCell>
                <TableCell sx={hdrSx}>Period</TableCell>
                <TableCell sx={hdrSx}>Base Requested</TableCell>
                <TableCell sx={hdrSx}>Scen Requested</TableCell>
                <TableCell sx={hdrSx}>Δ Requested</TableCell>
                <TableCell sx={hdrSx}>Base Committed</TableCell>
                <TableCell sx={hdrSx}>Scen Committed</TableCell>
                <TableCell sx={hdrSx}>Δ Committed</TableCell>
                <TableCell sx={hdrSx}>Base Util%</TableCell>
                <TableCell sx={hdrSx}>Scen Util%</TableCell>
                <TableCell sx={hdrSx}>Δ Util%</TableCell>
                <TableCell sx={hdrSx}>Base Stock</TableCell>
                <TableCell sx={hdrSx}>Scen Stock</TableCell>
                <TableCell sx={hdrSx}>Δ Stock</TableCell>
                <TableCell sx={hdrSx}>Base Status</TableCell>
                <TableCell sx={hdrSx}>Scen Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell sx={{...cellSx, fontWeight: 700}}>{row.productCode}</TableCell>
                  <TableCell sx={cellSx}>{row.period}</TableCell>
                  <TableCell sx={cellSx}>{row.baselineRequestedQuantity.toLocaleString()}</TableCell>
                  <TableCell sx={{...cellSx, fontWeight: row.scenarioRequestedQuantity !== row.baselineRequestedQuantity ? 700 : 400}}>
                    {row.scenarioRequestedQuantity.toLocaleString()}
                  </TableCell>
                  <DeltaNumCell base={row.baselineRequestedQuantity} scenario={row.scenarioRequestedQuantity} />
                  <TableCell sx={cellSx}>{row.baselineCommittedQuantity.toLocaleString()}</TableCell>
                  <TableCell sx={cellSx}>{row.scenarioCommittedQuantity.toLocaleString()}</TableCell>
                  <DeltaNumCell base={row.baselineCommittedQuantity} scenario={row.scenarioCommittedQuantity} />
                  <TableCell sx={cellSx}>{row.baselineUtilizationPercent}%</TableCell>
                  <TableCell sx={{...cellSx, color: row.scenarioUtilizationPercent > 100 ? planningTokens.danger : 'inherit', fontWeight: row.scenarioUtilizationPercent > 100 ? 700 : 400}}>
                    {row.scenarioUtilizationPercent}%
                  </TableCell>
                  <DeltaPctCell base={row.baselineUtilizationPercent} scenario={row.scenarioUtilizationPercent} />
                  <TableCell sx={cellSx}>{row.baselineEndingStock.toLocaleString()}</TableCell>
                  <TableCell sx={{...cellSx, color: row.scenarioStockStatus === 'BelowMin' ? planningTokens.danger : 'inherit', fontWeight: row.scenarioStockStatus === 'BelowMin' ? 700 : 400}}>
                    {row.scenarioEndingStock.toLocaleString()}
                  </TableCell>
                  <DeltaNumCell base={row.baselineEndingStock} scenario={row.scenarioEndingStock} />
                  <TableCell sx={cellSx}><CapacityStatusBadge status={row.baselineCapacityStatus} /></TableCell>
                  <TableCell sx={cellSx}><CapacityStatusBadge status={row.scenarioCapacityStatus} /></TableCell>
                </TableRow>
              ))}
              {filteredRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={16} sx={{textAlign: 'center', py: 3, color: planningTokens.textMuted, fontSize: 13}}>
                    No rows match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
