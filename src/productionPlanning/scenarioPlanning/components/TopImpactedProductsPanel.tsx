import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {planningCardSx, planningTokens} from '../../ui/planningTheme';
import type {TopImpactedProduct} from '../types';

type Props = {
  products: TopImpactedProduct[];
};

export default function TopImpactedProductsPanel({products}: Props) {
  const top5 = products.slice(0, 5);

  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 0, overflow: 'hidden'}}>
      <Box sx={{px: 2, py: 1.5, borderBottom: `1px solid ${planningTokens.border}`}}>
        <Typography sx={{fontSize: 13.5, fontWeight: 900, color: planningTokens.textPrimary}}>
          Top Impacted Products
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{'& th': {bgcolor: planningTokens.surfaceMuted}}}>
              <TableCell sx={{fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', py: 1, borderBottom: `1px solid ${planningTokens.border}`}}>
                Product
              </TableCell>
              <TableCell align="right" sx={{fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', py: 1, borderBottom: `1px solid ${planningTokens.border}`}}>
                Uncovered Δ
              </TableCell>
              <TableCell align="right" sx={{fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', py: 1, borderBottom: `1px solid ${planningTokens.border}`}}>
                Util Δ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {top5.map((p) => (
              <TableRow key={p.productCode} hover>
                <TableCell sx={{fontSize: 12.5, py: 0.9, fontWeight: 700, borderBottom: `1px solid ${planningTokens.border}`}}>
                  {p.productCode}
                </TableCell>
                <TableCell align="right" sx={{
                  fontSize: 12.5, py: 0.9, fontWeight: 700,
                  color: p.uncoveredDelta > 0 ? planningTokens.danger : planningTokens.success,
                  borderBottom: `1px solid ${planningTokens.border}`,
                }}>
                  {p.uncoveredDelta > 0 ? `+${p.uncoveredDelta.toLocaleString()}` : p.uncoveredDelta === 0 ? '—' : p.uncoveredDelta.toLocaleString()}
                </TableCell>
                <TableCell align="right" sx={{
                  fontSize: 12.5, py: 0.9, fontWeight: 700,
                  color: p.utilizationDelta > 10 ? planningTokens.danger : p.utilizationDelta > 0 ? '#B54708' : planningTokens.textMuted,
                  borderBottom: `1px solid ${planningTokens.border}`,
                }}>
                  {p.utilizationDelta > 0 ? `+${p.utilizationDelta}%` : p.utilizationDelta === 0 ? '—' : `${p.utilizationDelta}%`}
                </TableCell>
              </TableRow>
            ))}
            {top5.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} sx={{textAlign: 'center', py: 2, color: planningTokens.textMuted, fontSize: 12}}>
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
