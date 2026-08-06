import React, {useState} from 'react';
import {
  Box,
  Paper,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {mockProjectedInventory} from '../../mocks';
import type {InventoryBucket, MaterialStatus} from '../../types';

const statusBg: Record<MaterialStatus, string> = {
  Ready: '#ECFDF3',
  Warning: '#FFFBEB',
  Critical: '#FFF7ED',
  Blocked: '#FEF2F2',
  Shortage: '#FEF2F2',
  'On Hold': '#F5F3FF',
  'In Transit': '#EFF6FF',
  Unknown: '#F8FAFC',
};

const statusColor: Record<MaterialStatus, string> = {
  Ready: '#027A48',
  Warning: '#B45309',
  Critical: '#C2410C',
  Blocked: '#B42318',
  Shortage: '#B42318',
  'On Hold': '#6D28D9',
  'In Transit': '#1D4ED8',
  Unknown: '#475467',
};

const thSx = {fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', py: 1, px: 1.2, bgcolor: 'var(--planning-surface-muted)'};

function BucketCell({bucket, materialNumber}: {bucket: InventoryBucket; materialNumber: string}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <TableCell
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          py: 1, px: 1, cursor: 'pointer', textAlign: 'right', minWidth: 80,
          bgcolor: statusBg[bucket.status],
          '&:hover': {opacity: 0.8, outline: '1px solid #6D28D9'},
        }}
      >
        <Typography sx={{fontSize: 12, fontWeight: 800, color: statusColor[bucket.status]}}>
          {bucket.endingStock.toLocaleString()}
        </Typography>
        <Typography sx={{fontSize: 10, color: statusColor[bucket.status], opacity: 0.8}}>
          {bucket.status}
        </Typography>
      </TableCell>

      <Popover
        open={Boolean(anchor)}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        transformOrigin={{vertical: 'top', horizontal: 'center'}}
      >
        <Box sx={{p: 2, minWidth: 220}}>
          <Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1}}>
            {materialNumber} · {bucket.bucketLabel}
          </Typography>
          {[
            ['Opening Stock', bucket.openingStock],
            ['Confirmed Receipts', bucket.confirmedReceipts],
            ['Forecast Receipts', bucket.forecastReceipts],
            ['Planned Consumption', -bucket.plannedConsumption],
            ['Actual Consumption', -bucket.actualConsumption],
            ['Adjustments', bucket.adjustments],
            ['Ending Stock', bucket.endingStock],
          ].map(([label, val]) => (
            <Box key={String(label)} sx={{display: 'flex', justifyContent: 'space-between', py: 0.4, borderBottom: '1px solid var(--planning-border)'}}>
              <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
              <Typography sx={{fontSize: 12, fontWeight: 700, color: Number(val) < 0 && label === 'Ending Stock' ? '#B42318' : '#1F2366'}}>
                {Number(val).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}

export default function ProjectedInventoryTab() {
  const weeks = mockProjectedInventory[0]?.buckets.map((b) => b.bucketLabel) ?? [];

  return (
    <Box>
      <Typography sx={{fontSize: 12, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
        Projected Inventory Matrix — Click any cell for bucket detail
      </Typography>

      <Box sx={{display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap'}}>
        {[
          {label: 'Ready (above SS)', bg: '#ECFDF3', color: '#027A48'},
          {label: 'Warning (below SS)', bg: '#FFFBEB', color: '#B45309'},
          {label: 'Critical (below 50% SS)', bg: '#FFF7ED', color: '#C2410C'},
          {label: 'Shortage (below 0)', bg: '#FEF2F2', color: '#B42318'},
        ].map(({label, bg, color}) => (
          <Box key={label} sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
            <Box sx={{width: 12, height: 12, borderRadius: 0.5, bgcolor: bg, border: `1px solid ${color}`, opacity: 0.8}} />
            <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
          </Box>
        ))}
      </Box>

      <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.5, overflow: 'hidden'}}>
        <TableContainer sx={{overflow: 'auto'}}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{...thSx, minWidth: 140}}>Material</TableCell>
                <TableCell sx={thSx}>Supplier</TableCell>
                <TableCell sx={{...thSx, textAlign: 'right'}}>Current Stock</TableCell>
                <TableCell sx={{...thSx, textAlign: 'right'}}>Safety Stock</TableCell>
                <TableCell sx={{...thSx, textAlign: 'right'}}>Stockout Date</TableCell>
                {weeks.map((w) => <TableCell key={w} sx={{...thSx, textAlign: 'right'}}>{w}</TableCell>)}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockProjectedInventory.map((r) => (
                <TableRow key={r.materialNumber}>
                  <TableCell sx={{fontSize: 12, py: 1, px: 1.2, whiteSpace: 'nowrap'}}>
                    <Typography sx={{fontSize: 12, fontWeight: 800, color: '#1D4ED8'}}>{r.materialNumber}</Typography>
                    <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{r.materialDescription}</Typography>
                  </TableCell>
                  <TableCell sx={{fontSize: 12, py: 1, px: 1.2, whiteSpace: 'nowrap', color: '#374151'}}>{r.supplier}</TableCell>
                  <TableCell sx={{fontSize: 12, py: 1, px: 1.2, textAlign: 'right', fontWeight: 700}}>{r.currentStock.toLocaleString()}</TableCell>
                  <TableCell sx={{fontSize: 12, py: 1, px: 1.2, textAlign: 'right', color: 'var(--planning-text-secondary)'}}>{r.safetyStock.toLocaleString()}</TableCell>
                  <TableCell sx={{fontSize: 12, py: 1, px: 1.2, textAlign: 'right', color: r.projectedStockoutDate ? '#B42318' : '#027A48', fontWeight: 700}}>
                    {r.projectedStockoutDate ?? '—'}
                  </TableCell>
                  {r.buckets.map((bucket) => (
                    <BucketCell key={bucket.bucketLabel} bucket={bucket} materialNumber={r.materialNumber} />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Stack direction="row" spacing={1} sx={{mt: 1.5}}>
        <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)'}}>
          * Ending stock values shown. Click any cell to see bucket detail. Source: SAP ECC · Refreshed: 14 May 2026 06:15
        </Typography>
      </Stack>
    </Box>
  );
}
