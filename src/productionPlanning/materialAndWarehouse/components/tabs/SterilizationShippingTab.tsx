import React from 'react';
import {Box, Button, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {mockSterilizationBacklog, mockSterilizationLoads, mockPostSterile} from '../../mocks';
import {MaterialStatusBadge, ReceiptStatusBadge} from '../Badges';

interface Props {
  onAction: (message: string) => void;
  onAskAi: (id: string) => void;
}

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

export default function SterilizationShippingTab({onAction, onAskAi}: Props) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 3}}>
      {/* Pre-Sterile Backlog */}
      <Box>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
          A. Pre-Sterile Backlog
        </Typography>
        <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
          <TableContainer sx={{overflow: 'auto'}}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Batch', 'PCN', 'Quantity', 'Date of Mfg', 'Dwell Limit', 'Days Remaining', 'Sterilizer', 'Status', 'Risk', 'Actions'].map((h) => (
                    <TableCell key={h} sx={thSx}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mockSterilizationBacklog.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{...tdSx, fontWeight: 800}}>{r.batch}</TableCell>
                    <TableCell sx={{...tdSx, color: '#7C3AED', fontWeight: 800}}>{r.pcn}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700}}>{r.quantity.toLocaleString()}</TableCell>
                    <TableCell sx={tdSx}>{r.dateOfManufacture}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right'}}>{r.dwellLimitDays} days</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 800, color: r.daysRemaining <= 7 ? '#B42318' : r.daysRemaining <= 14 ? '#B45309' : '#027A48'}}>
                      {r.daysRemaining}
                    </TableCell>
                    <TableCell sx={tdSx}>{r.sterilizer}</TableCell>
                    <TableCell sx={tdSx}>{r.status}</TableCell>
                    <TableCell sx={tdSx}><MaterialStatusBadge status={r.risk} /></TableCell>
                    <TableCell sx={{...tdSx, minWidth: 200}}>
                      <Box sx={{display: 'flex', gap: 0.4}}>
                        <Button size="small" variant="outlined" onClick={() => onAction('Mock load prioritized.')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Prioritize</Button>
                        <Button size="small" variant="outlined" color="warning" onClick={() => onAction('Mock dwell risk flag created.')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1.2}}>Flag Risk</Button>
                        <Button size="small" variant="contained" onClick={() => onAskAi('m1')}
                          sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 0.7, borderRadius: 1, bgcolor: '#7C3AED', '&:hover': {bgcolor: '#5B21B6'}}}>AI</Button>
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

      {/* Load Readiness */}
      <Box>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
          B. Sterilization Load Readiness
        </Typography>
        <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
          <TableContainer sx={{overflow: 'auto'}}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Load ID', 'Sterilizer', 'Batch', 'PCN', 'Quantity', 'Density', 'Cycle Time (h)', 'Compatibility', 'Pallet Count', 'Load Status'].map((h) => (
                    <TableCell key={h} sx={thSx}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mockSterilizationLoads.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{r.loadId}</TableCell>
                    <TableCell sx={tdSx}>{r.sterilizer}</TableCell>
                    <TableCell sx={tdSx}>{r.batch}</TableCell>
                    <TableCell sx={{...tdSx, color: '#7C3AED', fontWeight: 800}}>{r.pcn}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700}}>{r.quantity.toLocaleString()}</TableCell>
                    <TableCell sx={tdSx}>{r.densityCategory}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right'}}>{r.cycleTime}h</TableCell>
                    <TableCell sx={tdSx}><ReceiptStatusBadge status={r.compatibilityStatus === 'Compatible' ? 'Released' : 'Blocked'} /></TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right'}}>{r.palletCount}</TableCell>
                    <TableCell sx={tdSx}><ReceiptStatusBadge status={r.loadStatus === 'Ready to Load' ? 'Released' : 'Pending'} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Divider />

      {/* Post-Sterile Confirmation */}
      <Box>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
          C. Post-Sterile Confirmation
        </Typography>
        <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
          <TableContainer sx={{overflow: 'auto'}}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Batch', 'Qty Sterilized', 'SAP Confirmation', 'Shipping Status', 'LOTS Transfer', 'Release Status', 'Exception'].map((h) => (
                    <TableCell key={h} sx={thSx}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {mockPostSterile.map((r, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{...tdSx, fontWeight: 800}}>{r.batch}</TableCell>
                    <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700}}>{r.quantitySterilized.toLocaleString()}</TableCell>
                    <TableCell sx={tdSx}><ReceiptStatusBadge status={r.sapConfirmationStatus === 'Confirmed' ? 'Released' : 'Pending'} /></TableCell>
                    <TableCell sx={tdSx}><ReceiptStatusBadge status={r.shippingStatus === 'Ready to Ship' ? 'Released' : 'Pending'} /></TableCell>
                    <TableCell sx={tdSx}><ReceiptStatusBadge status={r.lotsTransferStatus === 'Transferred' ? 'Released' : 'Pending'} /></TableCell>
                    <TableCell sx={tdSx}><ReceiptStatusBadge status={r.releaseStatus === 'Released' ? 'Released' : 'Pending'} /></TableCell>
                    <TableCell sx={{...tdSx, color: r.exception ? '#B42318' : '#9CA3AF'}}>{r.exception || '—'}</TableCell>
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
