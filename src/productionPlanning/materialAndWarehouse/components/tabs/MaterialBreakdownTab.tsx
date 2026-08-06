import React from 'react';
import {Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {mockMaterialBreakdown} from '../../mocks';

interface Props {
  onAction: (message: string) => void;
}

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

export default function MaterialBreakdownTab({onAction}: Props) {
  return (
    <Box>
      <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
        Material Breakdown — PCN to Material Explosion
      </Typography>
      <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
        <TableContainer sx={{overflow: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['PCN', 'Finished Good', 'Family', 'Material #', 'Description', 'BOM Qty', 'Scrap %', 'Req. Qty', 'UOM', 'Conv. Factor', 'Req. Qty (Base)', 'Source', 'Actions'].map((h) => (
                  <TableCell key={h} sx={thSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockMaterialBreakdown.map((r, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: '#7C3AED'}}>{r.pcn}</TableCell>
                  <TableCell sx={tdSx}>{r.finishedGood}</TableCell>
                  <TableCell sx={tdSx}>{r.productFamily}</TableCell>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{r.materialNumber}</TableCell>
                  <TableCell sx={tdSx}>{r.materialDescription}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{r.bomQuantity}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{((r.scrapFactor - 1) * 100).toFixed(1)}%</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700}}>{r.requiredQuantity.toFixed(3)}</TableCell>
                  <TableCell sx={tdSx}>{r.uom}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{r.conversionFactor}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{r.requiredQuantityBaseUom.toFixed(5)}</TableCell>
                  <TableCell sx={tdSx}>{r.source}</TableCell>
                  <TableCell sx={{...tdSx, minWidth: 180}}>
                    <Box sx={{display: 'flex', gap: 0.5}}>
                      <Button size="small" variant="outlined" onClick={() => onAction('Mock BOM source view opened.')}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.8, borderRadius: 1.2}}>
                        BOM Source
                      </Button>
                      <Button size="small" variant="outlined" color="warning" onClick={() => onAction('Mock master data flag created.')}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.8, borderRadius: 1.2}}>
                        Flag Issue
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
