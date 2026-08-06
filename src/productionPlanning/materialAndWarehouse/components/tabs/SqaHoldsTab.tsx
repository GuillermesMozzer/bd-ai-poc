import React from 'react';
import {Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {mockSqaHolds} from '../../mocks';
import {MaterialStatusBadge, ReceiptStatusBadge} from '../Badges';

interface Props {
  onAction: (message: string) => void;
}

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

export default function SqaHoldsTab({onAction}: Props) {
  return (
    <Box>
      <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
        Quality / SQA Holds — {mockSqaHolds.length} Active Holds
      </Typography>
      <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
        <TableContainer sx={{overflow: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Material', 'Batch', 'Supplier', 'Qty on Hold', 'Hold Reason', 'SQA Review', 'Inspection Status', 'Expected Release', 'Impacted WOs', 'Impacted PCNs', 'Shortage Risk', 'Owner', 'Last Update', 'Actions'].map((h) => (
                  <TableCell key={h} sx={thSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockSqaHolds.map((hold, i) => (
                <TableRow key={i} hover>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{hold.material}</TableCell>
                  <TableCell sx={tdSx}>{hold.batch}</TableCell>
                  <TableCell sx={tdSx}>{hold.supplier}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700, color: '#B42318'}}>
                    {hold.quantityOnHold.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{...tdSx, maxWidth: 200, whiteSpace: 'normal', lineHeight: 1.4}}>
                    {hold.holdReason}
                  </TableCell>
                  <TableCell sx={tdSx}>
                    {hold.sqaReviewRequired
                      ? <Typography component="span" sx={{fontSize: 11, fontWeight: 800, color: '#C2410C'}}>Required</Typography>
                      : <Typography component="span" sx={{fontSize: 11, color: '#027A48'}}>Optional</Typography>
                    }
                  </TableCell>
                  <TableCell sx={tdSx}><ReceiptStatusBadge status={hold.inspectionStatus} /></TableCell>
                  <TableCell sx={{...tdSx, color: hold.expectedReleaseDate ? '#374151' : '#9CA3AF'}}>
                    {hold.expectedReleaseDate ?? 'TBD'}
                  </TableCell>
                  <TableCell sx={tdSx}>{hold.impactedWorkOrders.join(', ') || '—'}</TableCell>
                  <TableCell sx={tdSx}>{hold.impactedPcns.join(', ') || '—'}</TableCell>
                  <TableCell sx={tdSx}><MaterialStatusBadge status={hold.shortageRisk} /></TableCell>
                  <TableCell sx={tdSx}>{hold.owner}</TableCell>
                  <TableCell sx={tdSx}>{new Date(hold.lastUpdate).toLocaleString()}</TableCell>
                  <TableCell sx={{...tdSx, minWidth: 240}}>
                    <Box sx={{display: 'flex', gap: 0.4, flexWrap: 'wrap'}}>
                      <Button size="small" variant="outlined" onClick={() => onAction('Mock SQA update request sent.')}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>SQA Update</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => onAction('Mock escalation submitted.')}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Escalate</Button>
                      <Button size="small" variant="outlined" onClick={() => onAction('Mock shortage link created.')}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Link Shortage</Button>
                      <Button size="small" variant="outlined" onClick={() => onAction('Mock comment added.')}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Comment</Button>
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
