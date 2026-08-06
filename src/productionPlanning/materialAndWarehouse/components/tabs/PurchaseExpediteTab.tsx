import React from 'react';
import {Box, Button, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {mockPurchaseOrders, mockExpediteActions} from '../../mocks';
import {MaterialStatusBadge, ApprovalStatusBadge, ReceiptStatusBadge} from '../Badges';

interface Props {
  onAction: (message: string) => void;
  onAskAi: (id: string) => void;
}

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

function SectionLabel({label, count}: {label: string; count: number}) {
  return (
    <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
      {label} — {count} Records
    </Typography>
  );
}

export default function PurchaseExpediteTab({onAction, onAskAi}: Props) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
      {/* Purchase Orders */}
      <Box>
        <SectionLabel label="A. Purchase Orders" count={mockPurchaseOrders.length} />
        <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
          <TableContainer sx={{overflow: 'auto'}}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['PO Number', 'Material', 'Description', 'Supplier', 'PO Qty', 'Confirmed Qty', 'Req. Delivery', 'Conf. Delivery', 'In Transit', 'Receipt Status', 'Last Confirmation', 'Risk', 'Actions'].map((h) => (
                    <TableCell key={h} sx={thSx}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPurchaseOrders.map((po) => (
                  <TableRow key={po.poNumber} hover>
                    <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{po.poNumber}</TableCell>
                    <TableCell sx={{...tdSx, fontWeight: 800}}>{po.material}</TableCell>
                    <TableCell sx={tdSx}>{po.materialDescription}</TableCell>
                    <TableCell sx={tdSx}>{po.supplier}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right'}}>{po.poQuantity.toLocaleString()}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right'}}>{po.confirmedQuantity.toLocaleString()}</TableCell>
                    <TableCell sx={tdSx}>{po.requestedDeliveryDate}</TableCell>
                    <TableCell sx={{...tdSx, color: po.confirmedDeliveryDate > po.requestedDeliveryDate ? '#B42318' : '#027A48', fontWeight: 700}}>
                      {po.confirmedDeliveryDate}
                    </TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right'}}>{po.inTransitQuantity.toLocaleString()}</TableCell>
                    <TableCell sx={tdSx}><ReceiptStatusBadge status={po.receiptStatus} /></TableCell>
                    <TableCell sx={tdSx}>{po.lastSupplierConfirmation}</TableCell>
                    <TableCell sx={tdSx}><MaterialStatusBadge status={po.riskStatus} /></TableCell>
                    <TableCell sx={{...tdSx, minWidth: 200}}>
                      <Box sx={{display: 'flex', gap: 0.5}}>
                        <Button size="small" variant="outlined" onClick={() => onAction('Mock follow-up sent to supplier.')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.8, borderRadius: 1.2}}>Follow Up</Button>
                        <Button size="small" variant="outlined" onClick={() => onAction('Mock expedite created for PO.')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.8, borderRadius: 1.2}}>Expedite</Button>
                        <Button size="small" variant="contained" onClick={() => onAskAi('m1')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.8, borderRadius: 1.2, bgcolor: '#7C3AED', '&:hover': {bgcolor: '#5B21B6'}}}>AI</Button>
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

      {/* Expedite Actions */}
      <Box>
        <SectionLabel label="B. Expedite Actions" count={mockExpediteActions.length} />
        <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
          <TableContainer sx={{overflow: 'auto'}}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Expedite ID', 'Material', 'Supplier', 'Reason', 'Production Impact', 'Normal Delivery', 'Req. Pull-In', 'Conf. Pull-In', 'Transport', 'Extra Cost (USD)', 'Approval Status', 'Owner', 'Comments'].map((h) => (
                    <TableCell key={h} sx={thSx}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mockExpediteActions.map((ex) => (
                  <TableRow key={ex.expediteId} hover>
                    <TableCell sx={{...tdSx, fontWeight: 800, color: '#7C3AED'}}>{ex.expediteId}</TableCell>
                    <TableCell sx={{...tdSx, fontWeight: 800}}>{ex.material}</TableCell>
                    <TableCell sx={tdSx}>{ex.supplier}</TableCell>
                    <TableCell sx={{...tdSx, maxWidth: 160, whiteSpace: 'normal', lineHeight: 1.4}}>{ex.reason}</TableCell>
                    <TableCell sx={{...tdSx, maxWidth: 150, whiteSpace: 'normal', lineHeight: 1.4}}>{ex.productionImpact}</TableCell>
                    <TableCell sx={tdSx}>{ex.normalDeliveryDate}</TableCell>
                    <TableCell sx={{...tdSx, fontWeight: 700, color: '#C2410C'}}>{ex.requestedPullInDate}</TableCell>
                    <TableCell sx={{...tdSx, color: ex.confirmedPullInDate ? '#027A48' : '#9CA3AF'}}>{ex.confirmedPullInDate ?? '—'}</TableCell>
                    <TableCell sx={tdSx}>{ex.transportMode}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700}}>${ex.estimatedExtraCost.toLocaleString()}</TableCell>
                    <TableCell sx={tdSx}><ApprovalStatusBadge status={ex.approvalStatus} /></TableCell>
                    <TableCell sx={tdSx}>{ex.owner}</TableCell>
                    <TableCell sx={{...tdSx, maxWidth: 200, whiteSpace: 'normal', lineHeight: 1.4}}>{ex.comments}</TableCell>
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
