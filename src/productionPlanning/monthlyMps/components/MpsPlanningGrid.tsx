import {memo} from 'react';
import {AcUnit as FrozenIcon, Edit as EditIcon} from '@mui/icons-material';
import {Box, MenuItem, Stack, TextField, Tooltip, Typography} from '@mui/material';
import type {MpsBucketRowView, ProductionLine} from '../types';
import {MpsBucketStatusBadge} from './Badges';

type Props = {
  rows: MpsBucketRowView[];
  productionLines: ProductionLine[];
  isEditable: boolean;
  onEditQuantity: (bucketId: string, quantity: number) => void;
  onEditLine: (bucketId: string, lineId: string | null) => void;
  onEditConstraintReason: (bucketId: string, reason: string) => void;
  onEditPlannerComment: (bucketId: string, comment: string) => void;
};

const COLS = [
  {label: 'Product', width: '90px'},
  {label: 'Description', width: '1fr'},
  {label: 'Bucket', width: '70px'},
  {label: 'Planned Qty', width: '100px'},
  {label: 'Line', width: '90px'},
  {label: 'Req Hrs', width: '72px'},
  {label: 'Avail Hrs', width: '72px'},
  {label: 'Util %', width: '68px'},
  {label: 'Open Stock', width: '84px'},
  {label: 'Demand', width: '72px'},
  {label: 'End Stock', width: '84px'},
  {label: 'Min', width: '60px'},
  {label: 'Max', width: '60px'},
  {label: 'Cov Days', width: '72px'},
  {label: 'Status', width: '100px'},
  {label: 'Reason', width: '140px'},
  {label: 'Comment', width: '140px'},
];

const gridTemplate = COLS.map((c) => c.width).join(' ');

function utilColor(pct: number): string {
  if (pct > 100) return '#B42318';
  if (pct >= 90) return '#B54708';
  if (pct >= 70) return '#0369A1';
  return '#027A48';
}

export default function MpsPlanningGrid({rows, productionLines, isEditable, onEditQuantity, onEditLine, onEditConstraintReason, onEditPlannerComment}: Props) {
  if (rows.length === 0) {
    return (
      <Box sx={{textAlign: 'center', py: 6, color: 'var(--planning-text-muted)', border: '1px solid #D8DEE8', borderRadius: 2.8, bgcolor: 'var(--planning-surface)'}}>
        <Typography sx={{fontSize: 13}}>No rows match the current filters.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{overflowX: 'auto', mb: 2, border: '1px solid #D8DEE8', borderRadius: 2.8, bgcolor: 'var(--planning-surface)', boxShadow: '0 8px 24px rgba(15,23,42,0.04)'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: gridTemplate, minWidth: 1400}}>
        {COLS.map((col) => (
          <Typography
            key={col.label}
            sx={{
              fontSize: 10,
              fontWeight: 800,
              color: 'var(--planning-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              p: '8px 10px',
              bgcolor: 'var(--planning-surface-muted)',
              borderBottom: '2px solid #E2E8F0',
              borderRight: '1px solid #E2E8F0',
              whiteSpace: 'nowrap',
            }}
          >
            {col.label}
          </Typography>
        ))}

        {rows.map((row) => (
          <GridRow
            key={row.id}
            row={row}
            productionLines={productionLines}
            isEditable={isEditable}
            onEditQuantity={onEditQuantity}
            onEditLine={onEditLine}
            onEditConstraintReason={onEditConstraintReason}
            onEditPlannerComment={onEditPlannerComment}
          />
        ))}
      </Box>
    </Box>
  );
}

const GridRow = memo(function GridRow({row, productionLines, isEditable, onEditQuantity, onEditLine, onEditConstraintReason, onEditPlannerComment}: {
  row: MpsBucketRowView;
  productionLines: ProductionLine[];
  isEditable: boolean;
  onEditQuantity: (id: string, qty: number) => void;
  onEditLine: (id: string, lineId: string | null) => void;
  onEditConstraintReason: (id: string, reason: string) => void;
  onEditPlannerComment: (id: string, comment: string) => void;
}) {
  const isFrozen = row.isFrozenPeriod;
  const rowBg = isFrozen ? '#EFF6FF' : row.isEdited ? '#F5F3FF' : '#FFFFFF';
  const cellSx = {
    p: '6px 10px',
    borderBottom: '1px solid var(--planning-border)',
    borderRight: '1px solid #F1F5F9',
    bgcolor: rowBg,
    display: 'flex',
    alignItems: 'center',
    minHeight: 44,
    fontSize: 12,
    transition: 'background-color 0.15s ease',
  };

  return (
    <>
      <Box sx={{...cellSx, borderLeft: isFrozen ? '3px solid #1D4ED8' : row.isEdited ? '3px solid #6D28D9' : '3px solid transparent'}}>
        <Stack spacing={0.2}>
          <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-primary)'}}>{row.productCode}</Typography>
          {row.isEdited && <EditIcon sx={{fontSize: 10, color: '#6D28D9'}} />}
          {isFrozen && <Tooltip title="Frozen period"><FrozenIcon sx={{fontSize: 10, color: '#1D4ED8'}} /></Tooltip>}
        </Stack>
      </Box>
      <Box sx={{...cellSx}}>
        <Box>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)'}}>{row.productDescription}</Typography>
          <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)'}}>{row.productFamily}</Typography>
        </Box>
      </Box>
      <Box sx={{...cellSx}}>
        <Typography sx={{fontSize: 11, fontWeight: 600, color: 'var(--planning-text-secondary)'}}>{row.bucketLabel}</Typography>
      </Box>
      <Box sx={{...cellSx, p: '2px 4px'}}>
        {isEditable ? (
          <TextField
            size="small"
            type="number"
            value={row.plannedQuantity}
            onChange={(e) => onEditQuantity(row.id, Number(e.target.value))}
            inputProps={{min: 0, style: {fontSize: 12, padding: '4px 6px'}}}
            sx={{width: 90, '& .MuiOutlinedInput-root': {borderRadius: 1.5, fontSize: 12}}}
          />
        ) : (
          <Typography sx={{fontSize: 12, fontWeight: 600, color: 'var(--planning-text-primary)'}}>{row.plannedQuantity.toLocaleString()}</Typography>
        )}
      </Box>
      <Box sx={{...cellSx, p: '2px 4px'}}>
        {isEditable ? (
          <TextField
            select
            size="small"
            value={row.assignedLineId ?? ''}
            onChange={(e) => onEditLine(row.id, e.target.value || null)}
            sx={{width: 84, '& .MuiOutlinedInput-root': {borderRadius: 1.5, fontSize: 11}}}
          >
            <MenuItem value=""><em>None</em></MenuItem>
            {productionLines.filter((l) => l.active).map((l) => (
              <MenuItem key={l.id} value={l.id} sx={{fontSize: 12}}>{l.name}</MenuItem>
            ))}
          </TextField>
        ) : (
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{row.lineName}</Typography>
        )}
      </Box>
      <NumCell value={row.requiredHours} sx={cellSx} />
      <NumCell value={row.availableHours} sx={cellSx} />
      <Box sx={{...cellSx}}>
        <Typography sx={{fontSize: 12, fontWeight: 700, color: utilColor(row.utilizationPercent)}}>
          {row.utilizationPercent > 0 ? `${row.utilizationPercent}%` : '-'}
        </Typography>
      </Box>
      <NumCell value={row.projectedOpeningStock} sx={cellSx} />
      <NumCell value={row.projectedDemandConsumption} sx={cellSx} />
      <Box sx={{...cellSx}}>
        <Typography sx={{
          fontSize: 12,
          fontWeight: 600,
          color: row.projectedEndingStock < row.minStock ? '#B42318' : row.projectedEndingStock > row.maxStock ? '#B54708' : '#1E293B',
        }}>
          {row.projectedEndingStock.toLocaleString()}
        </Typography>
      </Box>
      <NumCell value={row.minStock} sx={cellSx} small />
      <NumCell value={row.maxStock} sx={cellSx} small />
      <Box sx={{...cellSx}}>
        <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{row.stockCoverageDays > 0 ? `${row.stockCoverageDays}d` : '-'}</Typography>
      </Box>
      <Box sx={{...cellSx}}>
        <MpsBucketStatusBadge status={row.status} />
      </Box>
      <Box sx={{...cellSx, p: '2px 4px'}}>
        {isEditable ? (
          <TextField
            size="small"
            value={row.constraintReason ?? ''}
            onChange={(e) => onEditConstraintReason(row.id, e.target.value)}
            placeholder={row.isFrozenPeriod && row.isEdited ? 'Required' : 'Optional'}
            inputProps={{style: {fontSize: 11, padding: '3px 6px'}}}
            sx={{width: '100%', '& .MuiOutlinedInput-root': {borderRadius: 1.5, fontSize: 11}}}
          />
        ) : (
          <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{row.constraintReason ?? '-'}</Typography>
        )}
      </Box>
      <Box sx={{...cellSx, p: '2px 4px'}}>
        {isEditable ? (
          <TextField
            size="small"
            value={row.plannerComment ?? ''}
            onChange={(e) => onEditPlannerComment(row.id, e.target.value)}
            placeholder="Optional"
            inputProps={{style: {fontSize: 11, padding: '3px 6px'}}}
            sx={{width: '100%', '& .MuiOutlinedInput-root': {borderRadius: 1.5, fontSize: 11}}}
          />
        ) : (
          <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>{row.plannerComment ?? '-'}</Typography>
        )}
      </Box>
    </>
  );
});

function NumCell({value, sx, small}: {value: number; sx: object; small?: boolean}) {
  return (
    <Box sx={sx}>
      <Typography sx={{fontSize: small ? 11 : 12, color: 'var(--planning-text-secondary)'}}>
        {value !== 0 ? value.toLocaleString() : '-'}
      </Typography>
    </Box>
  );
}
