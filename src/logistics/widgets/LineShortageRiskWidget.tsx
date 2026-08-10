import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  getShortages,
  subscribeLogisticsDemo,
  type LineShortageRiskItem,
} from '../data/reactiveLogisticsDemo';

const riskColor: Record<LineShortageRiskItem['risk'], string> = {
  critical: '#d32f2f',
  high: '#FF5F00',
  medium: '#f9a825',
  low: '#2e7d32',
};

export const LineShortageRiskWidget: React.FC = () => {
  const [rows, setRows] = useState<LineShortageRiskItem[]>([]);

  useEffect(() => {
    const refresh = () => setRows(getShortages());
    refresh();
    return subscribeLogisticsDemo(refresh);
  }, []);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Risco de Abastecimento (Shortage)
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Filas de picking priorizadas por risco iminente de parada de linha (DA — Assisted Decision).
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Linha</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Risco</TableCell>
              <TableCell align="right">ETA stop</TableCell>
              <TableCell>Bin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={700}>
                    {row.line}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack spacing={0.25}>
                    <Typography variant="body2">{row.sku}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.materialName} · qty {row.qtyNeeded}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.risk.toUpperCase()}
                    sx={{
                      bgcolor: riskColor[row.risk],
                      color: '#fff',
                      fontWeight: 700,
                      height: 22,
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color={row.minutesToStop < 30 ? '#d32f2f' : 'text.primary'}
                  >
                    {row.minutesToStop} min
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                    {row.suggestedBin}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
};

export default LineShortageRiskWidget;
