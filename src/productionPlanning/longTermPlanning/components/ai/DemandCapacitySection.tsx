import {Box, Chip, Table, TableBody, TableCell, TableHead, TableRow, Typography} from '@mui/material';
import type {DemandCapacityRow} from '../../aiProposalTypes';
import {planningTokens} from '../../../ui/planningTheme';

const CAPACITY_STATUS_TONE: Record<string, {bg: string; color: string; border: string}> = {
  Feasible: {bg: '#ECFDF3', color: '#16A34A', border: '#BBF7D0'},
  Warning: {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  Overloaded: {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'},
  MissingData: {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#D0D5DD'},
};

function CapacityStatusBadge({status}: {status: string}) {
  const tone = CAPACITY_STATUS_TONE[status] ?? CAPACITY_STATUS_TONE['MissingData'];
  return (
    <Chip
      label={status}
      size="small"
      sx={{fontWeight: 700, fontSize: 11, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, borderRadius: 1.5}}
    />
  );
}

type Props = {
  rows: DemandCapacityRow[];
};

export default function DemandCapacitySection({rows}: Props) {
  if (rows.length === 0) {
    return (
      <Box sx={{p: 2, textAlign: 'center'}}>
        <Typography sx={{fontSize: 13, color: planningTokens.textMuted}}>No demand vs capacity data available.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{overflow: 'auto'}}>
      <Table size="small" aria-label="Demand vs Capacity">
        <TableHead>
          <TableRow sx={{'& th': {fontWeight: 800, fontSize: 11, color: planningTokens.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', borderBottom: `2px solid ${planningTokens.border}`}}}>
            <TableCell>Month</TableCell>
            <TableCell>Product</TableCell>
            <TableCell align="right">Forecast</TableCell>
            <TableCell align="right">Req. Hrs</TableCell>
            <TableCell>Line</TableCell>
            <TableCell align="right">Avail. Hrs</TableCell>
            <TableCell align="right">Utilization</TableCell>
            <TableCell>Capacity Status</TableCell>
            <TableCell>AI Recommendation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} sx={{'&:hover': {bgcolor: '#F8FAFF'}, '& td': {fontSize: 12, py: 1, borderBottom: `1px solid ${planningTokens.border}`}}}>
              <TableCell sx={{whiteSpace: 'nowrap'}}>{row.month}</TableCell>
              <TableCell>
                <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary}}>{row.productCode}</Typography>
                <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>{row.productDescription}</Typography>
              </TableCell>
              <TableCell align="right" sx={{fontWeight: 600}}>{row.forecastDemand.toLocaleString()}</TableCell>
              <TableCell align="right">{row.requiredHours != null ? `${row.requiredHours} hrs` : '—'}</TableCell>
              <TableCell sx={{whiteSpace: 'nowrap'}}>{row.eligibleLine}</TableCell>
              <TableCell align="right">{row.availableHours} hrs</TableCell>
              <TableCell align="right">
                {row.utilizationPercent != null ? (
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: row.utilizationPercent >= 100 ? planningTokens.danger : row.utilizationPercent >= 90 ? planningTokens.warning : planningTokens.success}}>
                    {row.utilizationPercent}%
                  </Typography>
                ) : '—'}
              </TableCell>
              <TableCell><CapacityStatusBadge status={row.capacityStatus} /></TableCell>
              <TableCell sx={{maxWidth: 200}}>
                <Typography sx={{fontSize: 11.5, color: planningTokens.textSecondary, lineHeight: 1.4}}>{row.aiRecommendation}</Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
