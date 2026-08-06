import React, {useState} from 'react';
import {Box, Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {mockSapMovements} from '../../mocks';

interface Props {
  onAction: (message: string) => void;
}

const GROUPS = ['All', 'PCN Receipts', 'Raw Material Receipts', 'Raw Material Usage', 'Foil Receipts', 'Foil Usage', 'Adjustments'] as const;
type Group = typeof GROUPS[number];

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

export default function SapMovementsTab({onAction}: Props) {
  const [activeGroup, setActiveGroup] = useState<Group>('All');

  const rows = activeGroup === 'All'
    ? mockSapMovements
    : mockSapMovements.filter((r) => r.movementGroup === activeGroup);

  return (
    <Box>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, flexWrap: 'wrap', gap: 1}}>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
          SAP Movements — {rows.length} Records
        </Typography>
        <Button size="small" variant="outlined" onClick={() => onAction('Mock SAP refresh started.')}
          sx={{fontSize: 12, textTransform: 'none', fontWeight: 700, borderRadius: 1.5}}>
          Refresh from SAP
        </Button>
      </Box>

      <Box sx={{display: 'flex', gap: 0.8, mb: 1.5, flexWrap: 'wrap'}}>
        {GROUPS.map((g) => (
          <Chip
            key={g}
            label={g}
            size="small"
            onClick={() => setActiveGroup(g)}
            sx={{
              fontSize: 11, fontWeight: 800, cursor: 'pointer',
              bgcolor: activeGroup === g ? '#7C3AED' : '#F8FAFC',
              color: activeGroup === g ? '#FFFFFF' : '#475467',
              border: activeGroup === g ? '1px solid #7C3AED' : '1px solid #D0D5DD',
              borderRadius: 1.5,
              '&:hover': {bgcolor: activeGroup === g ? '#5B21B6' : '#F5F3FF'},
            }}
          />
        ))}
      </Box>

      <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
        <TableContainer sx={{overflow: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Plant', 'Mvmt Type', 'Group', 'Material', 'Description', 'PO', 'Mat Doc', 'Posting Date', 'Qty', 'UOM', 'Batch', 'Reference', 'Conv. EA', 'Total Base', 'Source', 'Refreshed'].map((h) => (
                  <TableCell key={h} sx={thSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={16} sx={{textAlign: 'center', py: 4, color: 'var(--planning-text-muted)', fontSize: 13}}>
                    No movements for this filter.
                  </TableCell>
                </TableRow>
              ) : rows.map((r) => (
                <TableRow key={r.id} hover>
                  <TableCell sx={tdSx}>{r.plant}</TableCell>
                  <TableCell sx={{...tdSx, fontWeight: 800}}>{r.movementType}</TableCell>
                  <TableCell sx={tdSx}>{r.movementGroup}</TableCell>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{r.material}</TableCell>
                  <TableCell sx={tdSx}>{r.materialDescription}</TableCell>
                  <TableCell sx={tdSx}>{r.purchaseOrder || '—'}</TableCell>
                  <TableCell sx={tdSx}>{r.materialDocument}</TableCell>
                  <TableCell sx={tdSx}>{r.postingDate}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right', color: r.quantity < 0 ? '#B42318' : '#027A48', fontWeight: 700}}>
                    {r.quantity > 0 ? '+' : ''}{r.quantity.toLocaleString()}
                  </TableCell>
                  <TableCell sx={tdSx}>{r.uom}</TableCell>
                  <TableCell sx={tdSx}>{r.batch}</TableCell>
                  <TableCell sx={tdSx}>{r.reference || '—'}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{r.conversionToEa}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700}}>{r.totalQuantityBaseUom.toLocaleString()}</TableCell>
                  <TableCell sx={tdSx}>{r.sourceSystem}</TableCell>
                  <TableCell sx={tdSx}>{new Date(r.refreshTimestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
