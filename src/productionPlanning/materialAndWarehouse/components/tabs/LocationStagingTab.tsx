import React from 'react';
import {Box, Button, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {mockLocations, mockStagingBoard} from '../../mocks';
import {MaterialStatusBadge, StagingStatusBadge} from '../Badges';

interface Props {
  onAction: (message: string) => void;
}

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

export default function LocationStagingTab({onAction}: Props) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
      {/* Material Location */}
      <Box>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
          A. Material Location — {mockLocations.length} Records
        </Typography>
        <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
          <TableContainer sx={{overflow: 'auto'}}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Material', 'Batch', 'Quantity', 'UOM', 'Location', 'FIFO Rank', 'Status', 'Expiry Date', 'Last Movement', 'Last Scan User', 'Actions'].map((h) => (
                    <TableCell key={h} sx={thSx}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mockLocations.map((loc, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{loc.material}</TableCell>
                    <TableCell sx={tdSx}>{loc.batch}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700}}>{loc.quantity.toLocaleString()}</TableCell>
                    <TableCell sx={tdSx}>{loc.uom}</TableCell>
                    <TableCell sx={{...tdSx, fontWeight: 700, color: '#374151'}}>{loc.location}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'center'}}>{loc.fifoRank}</TableCell>
                    <TableCell sx={tdSx}><MaterialStatusBadge status={loc.status} /></TableCell>
                    <TableCell sx={tdSx}>{loc.expiryDate ?? '—'}</TableCell>
                    <TableCell sx={tdSx}>{new Date(loc.lastMovement).toLocaleString()}</TableCell>
                    <TableCell sx={tdSx}>{loc.lastScanUser}</TableCell>
                    <TableCell sx={{...tdSx, minWidth: 230}}>
                      <Box sx={{display: 'flex', gap: 0.5}}>
                        <Button size="small" variant="outlined" onClick={() => onAction('Mock scan-to-location performed.')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Scan</Button>
                        <Button size="small" variant="outlined" onClick={() => onAction('Mock location move recorded.')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Move</Button>
                        <Button size="small" variant="outlined" onClick={() => onAction('Mock cycle count request submitted.')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Cycle Count</Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Divider />

      {/* Staging Board */}
      <Box>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
          B. Staging Board — {mockStagingBoard.length} Records
        </Typography>
        <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
          <TableContainer sx={{overflow: 'auto'}}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Work Order', 'Line', 'Material', 'Req. Qty', 'Picked', 'Staged', 'Missing', 'Status', 'Required By', 'WH Owner', 'Actions'].map((h) => (
                    <TableCell key={h} sx={thSx}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mockStagingBoard.map((s, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{...tdSx, fontWeight: 800, color: '#7C3AED'}}>{s.workOrder}</TableCell>
                    <TableCell sx={tdSx}>{s.productionLine}</TableCell>
                    <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{s.requiredMaterial}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right'}}>{s.requiredQuantity.toLocaleString()}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right'}}>{s.pickedQuantity.toLocaleString()}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right'}}>{s.stagedQuantity.toLocaleString()}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700, color: s.missingQuantity > 0 ? '#B42318' : '#027A48'}}>
                      {s.missingQuantity.toLocaleString()}
                    </TableCell>
                    <TableCell sx={tdSx}><StagingStatusBadge status={s.stagingStatus} /></TableCell>
                    <TableCell sx={tdSx}>{new Date(s.requiredBy).toLocaleString()}</TableCell>
                    <TableCell sx={tdSx}>{s.warehouseOwner}</TableCell>
                    <TableCell sx={{...tdSx, minWidth: 240}}>
                      <Box sx={{display: 'flex', gap: 0.4, flexWrap: 'wrap'}}>
                        <Button size="small" variant="outlined" onClick={() => onAction('Mock pick initiated.')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Pick</Button>
                        <Button size="small" variant="outlined" onClick={() => onAction('Mock staging confirmed.')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Stage</Button>
                        <Button size="small" variant="outlined" onClick={() => onAction('Mock goods issue confirmed.')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Confirm</Button>
                        <Button size="small" variant="outlined" color="warning" onClick={() => onAction('Mock mismatch reported.')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Mismatch</Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>
    </Box>
  );
}
