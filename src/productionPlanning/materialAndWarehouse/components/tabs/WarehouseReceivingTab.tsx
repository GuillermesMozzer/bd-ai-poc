import React, {useState} from 'react';
import {Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {mockWarehouseReceipts} from '../../mocks';
import type {WarehouseReceiptRecord} from '../../types';
import {ReceiptStatusBadge} from '../Badges';

interface Props {
  onAction: (message: string) => void;
}

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

export default function WarehouseReceivingTab({onAction}: Props) {
  const [rows, setRows] = useState<WarehouseReceiptRecord[]>(mockWarehouseReceipts);

  function updateRow(receiptId: string, update: Partial<WarehouseReceiptRecord>, msg: string) {
    setRows((prev) => prev.map((r) => r.receiptId === receiptId ? {...r, ...update} : r));
    onAction(msg);
  }

  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5}}>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
          Warehouse Receiving — {rows.length} Records
        </Typography>
        <Button size="small" variant="outlined" onClick={() => onAction('Mock export started.')}
          sx={{fontSize: 12, textTransform: 'none', fontWeight: 700, borderRadius: 1.5}}>Export</Button>
      </Box>
      <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
        <TableContainer sx={{overflow: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Receipt ID', 'Del. Note', 'PO #', 'Supplier', 'Material', 'Batch', 'Rcvd Qty', 'Exp. Qty', 'UOM', 'Integrity', 'Delivery Match', 'SAP Receipt', 'Label', 'SQA', 'Hold', 'Put-Away', 'User', 'Timestamp', 'Actions'].map((h) => (
                  <TableCell key={h} sx={thSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.receiptId} hover>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{r.receiptId}</TableCell>
                  <TableCell sx={tdSx}>{r.deliveryNote}</TableCell>
                  <TableCell sx={tdSx}>{r.poNumber}</TableCell>
                  <TableCell sx={tdSx}>{r.supplier}</TableCell>
                  <TableCell sx={{...tdSx, fontWeight: 800}}>{r.material}</TableCell>
                  <TableCell sx={tdSx}>{r.batch}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700, color: r.quantityReceived < r.quantityExpected ? '#B42318' : '#027A48'}}>
                    {r.quantityReceived.toLocaleString()}
                  </TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{r.quantityExpected.toLocaleString()}</TableCell>
                  <TableCell sx={tdSx}>{r.uom}</TableCell>
                  <TableCell sx={tdSx}><ReceiptStatusBadge status={r.integrityCheck} /></TableCell>
                  <TableCell sx={tdSx}><ReceiptStatusBadge status={r.deliveryMatchStatus === 'Matched' ? 'Released' : 'Pending'} /></TableCell>
                  <TableCell sx={tdSx}><ReceiptStatusBadge status={r.sapReceiptStatus} /></TableCell>
                  <TableCell sx={tdSx}><ReceiptStatusBadge status={r.labelStatus === 'Labeled' ? 'Released' : 'Pending'} /></TableCell>
                  <TableCell sx={tdSx}><ReceiptStatusBadge status={r.sqaStatus} /></TableCell>
                  <TableCell sx={tdSx}><ReceiptStatusBadge status={r.holdStatus === 'No Hold' ? 'Released' : 'Blocked'} /></TableCell>
                  <TableCell sx={tdSx}><ReceiptStatusBadge status={r.putAwayStatus === 'Completed' ? 'Released' : r.putAwayStatus === 'Blocked' ? 'Blocked' : 'Pending'} /></TableCell>
                  <TableCell sx={tdSx}>{r.receivingUser}</TableCell>
                  <TableCell sx={tdSx}>{new Date(r.receivingTimestamp).toLocaleString()}</TableCell>
                  <TableCell sx={{...tdSx, minWidth: 260}}>
                    <Box sx={{display: 'flex', gap: 0.4, flexWrap: 'wrap'}}>
                      <Button size="small" variant="contained" onClick={() => updateRow(r.receiptId, {sapReceiptStatus: 'Confirmed'}, 'Mock receipt confirmed.')}
                        sx={{fontSize: 10, textTransform: 'none', fontWeight: 700, py: 0.2, px: 0.7, borderRadius: 1, bgcolor: '#027A48', '&:hover': {bgcolor: '#015C35'}}}>
                        Confirm
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => updateRow(r.receiptId, {deliveryMatchStatus: 'Discrepancy'}, 'Mock discrepancy recorded.')}
                        sx={{fontSize: 10, textTransform: 'none', fontWeight: 700, py: 0.2, px: 0.7, borderRadius: 1}}>
                        Discrepancy
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => updateRow(r.receiptId, {labelStatus: 'Labeled'}, 'Mock label generated.')}
                        sx={{fontSize: 10, textTransform: 'none', fontWeight: 700, py: 0.2, px: 0.7, borderRadius: 1}}>
                        Label
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => updateRow(r.receiptId, {sqaStatus: 'Under Review'}, 'Mock sent to SQA.')}
                        sx={{fontSize: 10, textTransform: 'none', fontWeight: 700, py: 0.2, px: 0.7, borderRadius: 1}}>
                        SQA
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => updateRow(r.receiptId, {putAwayStatus: 'Completed'}, 'Mock released to put-away.')}
                        sx={{fontSize: 10, textTransform: 'none', fontWeight: 700, py: 0.2, px: 0.7, borderRadius: 1}}>
                        Put-Away
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
