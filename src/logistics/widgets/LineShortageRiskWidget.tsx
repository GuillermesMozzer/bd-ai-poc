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
import { riskChipSx } from '../a11y';
import { logisticsType } from '../typography';

export const LineShortageRiskWidget: React.FC = () => {
  const [rows, setRows] = useState<LineShortageRiskItem[]>([]);

  useEffect(() => {
    const refresh = () => setRows(getShortages());
    refresh();
    return subscribeLogisticsDemo(refresh);
  }, []);

  return (
    <Card
      component="section"
      aria-labelledby="line-shortage-heading"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography id="line-shortage-heading" component="h2" sx={logisticsType.sectionTitle}>
          Line Shortage Risk
        </Typography>
        <Typography sx={{ ...logisticsType.caption, color: 'text.secondary', mt: 0.25 }}>
          Picking queues prioritized by imminent line-stop risk (DA — Assisted Decision).
        </Typography>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
        <Table size="small" aria-labelledby="line-shortage-heading">
          <caption style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
            Line shortage risks sorted by urgency
          </caption>
          <TableHead>
            <TableRow>
              <TableCell scope="col">Line</TableCell>
              <TableCell scope="col">SKU</TableCell>
              <TableCell scope="col">Risk</TableCell>
              <TableCell scope="col" align="right">
                ETA stop
              </TableCell>
              <TableCell scope="col">Bin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const chip = riskChipSx[row.risk] ?? riskChipSx.low;
              const urgent = row.minutesToStop < 30;
              return (
                <TableRow key={row.id} hover>
                  <TableCell scope="row">
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
                        bgcolor: chip.bgcolor,
                        color: chip.color,
                        fontWeight: 700,
                        height: 22,
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={urgent ? 'error.dark' : 'text.primary'}
                      aria-label={`${row.minutesToStop} minutes to line stop${urgent ? ', urgent' : ''}`}
                    >
                      {row.minutesToStop} min
                      {urgent ? ' · Urgent' : ''}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {row.suggestedBin}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Card>
  );
};

export default LineShortageRiskWidget;
