import React, {useMemo} from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {mockMaterials} from '../../mocks';
import type {MaterialRecord, MaterialWarehouseFilters} from '../../types';
import {MaterialStatusBadge} from '../Badges';

interface Props {
  filters: MaterialWarehouseFilters;
  onViewDetail: (id: string) => void;
  onAskAi: (id: string) => void;
  onAction: (message: string) => void;
}

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};
const tdSx = {fontSize: 12, color: '#374151', py: 1, px: 1.2, whiteSpace: 'nowrap'};

function filterMaterials(materials: MaterialRecord[], filters: MaterialWarehouseFilters): MaterialRecord[] {
  return materials.filter((m) => {
    if (filters.materialNumber && !m.materialNumber.toLowerCase().includes(filters.materialNumber.toLowerCase())) return false;
    if (filters.status && m.readinessStatus !== filters.status) return false;
    if (filters.materialType && m.materialType !== filters.materialType) return false;
    if (filters.supplier && m.supplier !== filters.supplier) return false;
    if (filters.pcn && m.relatedPcn !== filters.pcn) return false;
    return true;
  });
}

export default function MaterialOverviewTab({filters, onViewDetail, onAskAi, onAction}: Props) {
  const rows = useMemo(() => filterMaterials(mockMaterials, filters), [filters]);

  return (
    <Box>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5}}>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
          Material Overview — {rows.length} Record{rows.length !== 1 ? 's' : ''}
        </Typography>
        <Button variant="outlined" size="small" onClick={() => onAction('Mock export started.')}
          sx={{fontSize: 12, textTransform: 'none', fontWeight: 700, borderRadius: 1.5}}>
          Export
        </Button>
      </Box>

      <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
        <TableContainer sx={{overflow: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {['Material #', 'Description', 'Type', 'Supplier', 'PCN', 'Current', 'Available', 'Blocked', 'Safety Stk', 'SS%', 'Shortage Date', 'Next Delivery', 'Open PO', 'Status', 'Risk Reason', 'Owner', 'Last Updated', 'Actions'].map((h) => (
                  <TableCell key={h} sx={thSx}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={18} sx={{textAlign: 'center', py: 4, color: 'var(--planning-text-muted)', fontSize: 13}}>
                    No records match the current filters.
                  </TableCell>
                </TableRow>
              ) : rows.map((m) => (
                <TableRow key={m.id} hover sx={{'&:hover': {bgcolor: 'var(--planning-ai-accent-bg)'}}}>
                  <TableCell sx={{...tdSx, fontWeight: 800, color: '#1D4ED8'}}>{m.materialNumber}</TableCell>
                  <TableCell sx={{...tdSx, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis'}}>{m.materialDescription}</TableCell>
                  <TableCell sx={tdSx}>{m.materialType}</TableCell>
                  <TableCell sx={tdSx}>{m.supplier}</TableCell>
                  <TableCell sx={tdSx}>{m.relatedPcn}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{m.currentStock.toLocaleString()}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{m.availableStock.toLocaleString()}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right', color: m.blockedStock > 0 ? '#B42318' : '#374151'}}>{m.blockedStock.toLocaleString()}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{m.safetyStock.toLocaleString()}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right', fontWeight: 700, color: m.safetyStockPercentage < 50 ? '#B42318' : m.safetyStockPercentage < 100 ? '#B45309' : '#027A48'}}>
                    {m.safetyStockPercentage.toFixed(0)}%
                  </TableCell>
                  <TableCell sx={{...tdSx, color: m.projectedFirstShortageDate ? '#B42318' : '#374151'}}>
                    {m.projectedFirstShortageDate ?? '—'}
                  </TableCell>
                  <TableCell sx={tdSx}>{m.nextDeliveryDate ?? '—'}</TableCell>
                  <TableCell sx={{...tdSx, textAlign: 'right'}}>{m.openPoQuantity.toLocaleString()}</TableCell>
                  <TableCell sx={tdSx}><MaterialStatusBadge status={m.readinessStatus} /></TableCell>
                  <TableCell sx={{...tdSx, maxWidth: 200, whiteSpace: 'normal', lineHeight: 1.4}}>{m.riskReason || '—'}</TableCell>
                  <TableCell sx={tdSx}>{m.responsibleOwner}</TableCell>
                  <TableCell sx={tdSx}>{new Date(m.lastUpdated).toLocaleDateString()}</TableCell>
                  <TableCell sx={{...tdSx, minWidth: 220}}>
                    <Box sx={{display: 'flex', gap: 0.6}}>
                      <Button size="small" variant="outlined" onClick={() => onViewDetail(m.id)}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 1, borderRadius: 1.2}}>
                        View Detail
                      </Button>
                      <Button size="small" variant="outlined" onClick={() => onAction('Mock expedite created.')}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 1, borderRadius: 1.2}}>
                        Expedite
                      </Button>
                      <Button size="small" variant="contained" onClick={() => onAskAi(m.id)}
                        sx={{fontSize: 11, textTransform: 'none', fontWeight: 700, py: 0.3, px: 1, borderRadius: 1.2, bgcolor: '#7C3AED', '&:hover': {bgcolor: '#5B21B6'}}}>
                        Ask AI
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
