import React from 'react';
import {Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {mockFoilBreakdown} from '../../mocks';
import {MaterialStatusBadge} from '../Badges';

interface Props {
  onAction: (message: string) => void;
}

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

export default function FoilBreakdownTab({onAction}: Props) {
  return (
    <Box>
      <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
        Foil Breakdown — Demand vs. Inventory
      </Typography>
      <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
        <TableContainer sx={{overflow: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['PCN', 'Foil Material', 'Description', 'Production Qty', 'Scrap %', 'Req. Foil Qty', 'UOM', 'Available', 'Proj. Ending', 'Shortage Date', 'Risk', 'Actions'].map((h) => (
                  <TableCell key={h} sx={thSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockFoilBreakdown.map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: '#7C3AED'}}>{r.pcn}</TableCell>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{r.foilMaterial}</TableCell>
                  <TableCell sx={tdSx}>{r.foilDescription}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{r.productionQuantity.toLocaleString()}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{((r.scrapFactor - 1) * 100).toFixed(1)}%</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700}}>{r.requiredFoilQuantity.toLocaleString()}</TableCell>
                  <TableCell sx={tdSx}>{r.uom}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{r.availableStock.toLocaleString()}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700, color: r.projectedEndingStock < 0 ? '#B42318' : '#027A48'}}>
                    {r.projectedEndingStock.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{...tdSx, color: r.shortageDate ? '#B42318' : '#374151'}}>{r.shortageDate ?? '—'}</TableCell>
                  <TableCell sx={tdSx}><MaterialStatusBadge status={r.riskStatus} /></TableCell>
                  <TableCell sx={{...tdSx, minWidth: 200}}>
                    <Box sx={{display: 'flex', gap: 0.5}}>
                      <Button size="small" variant="outlined" onClick={() => onAction('Mock foil expedite created.')}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.8, borderRadius: 1.2}}>
                        Expedite
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => onAction('Mock production review suggestion submitted.')}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.8, borderRadius: 1.2}}>
                        Prod. Review
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
