import React from 'react';
import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import {Close as CloseIcon} from '@mui/icons-material';
import type {MaterialRecord} from '../types';
import {MaterialStatusBadge} from './Badges';

interface Props {
  open: boolean;
  material: MaterialRecord | null;
  onClose: () => void;
  onAction: (message: string) => void;
}

function SectionLabel({label}: {label: string}) {
  return (
    <Typography sx={{fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--planning-text-secondary)', mt: 0.5}}>
      {label}
    </Typography>
  );
}

function DataRow({label, value}: {label: string; value: React.ReactNode}) {
  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.6}}>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', fontWeight: 700, textAlign: 'right', maxWidth: '55%'}}>{value}</Typography>
    </Box>
  );
}

export default function MaterialDetailDrawer({open, material, onClose, onAction}: Props) {
  if (!material) return null;

  const actions = [
    {label: 'Create Expedite', msg: 'Mock expedite action created.'},
    {label: 'Request SQA Update', msg: 'Mock SQA update request sent.'},
    {label: 'Request Plan Change', msg: 'Mock plan change request created.'},
    {label: 'Create Scenario', msg: 'Mock scenario created.'},
    {label: 'Add Comment', msg: 'Mock comment added.'},
    {label: 'View Audit Trail', msg: 'Opening mock audit trail...'},
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{sx: {width: {xs: '100vw', sm: 480}, display: 'flex', flexDirection: 'column'}}}
    >
      {/* Header */}
      <Box sx={{px: 2.5, py: 2, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'flex-start', gap: 1}}>
        <Box sx={{flex: 1}}>
          <Typography sx={{fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--planning-text-secondary)'}}>
            Material Detail
          </Typography>
          <Typography sx={{fontSize: 20, fontWeight: 900, color: 'var(--planning-text-primary)', mt: 0.3}}>
            {material.materialNumber}
          </Typography>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', mt: 0.2}}>
            {material.materialDescription}
          </Typography>
          <Box sx={{display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap'}}>
            <MaterialStatusBadge status={material.readinessStatus} />
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Scrollable content */}
      <Box sx={{flex: 1, overflow: 'auto', px: 2.5, py: 2}}>
        <Stack spacing={2}>
          {/* Header info */}
          <Box>
            <SectionLabel label="Identification" />
            <Divider sx={{mb: 1, mt: 0.5}} />
            <DataRow label="Material Type" value={material.materialType} />
            <DataRow label="Supplier" value={material.supplier} />
            <DataRow label="Product Family" value={material.productFamily} />
            <DataRow label="Related PCN" value={material.relatedPcn} />
            <DataRow label="Responsible Owner" value={material.responsibleOwner} />
          </Box>

          {/* Inventory */}
          <Box>
            <SectionLabel label="Inventory" />
            <Divider sx={{mb: 1, mt: 0.5}} />
            <DataRow label="Current Stock" value={material.currentStock.toLocaleString()} />
            <DataRow label="Available Stock" value={material.availableStock.toLocaleString()} />
            <DataRow label="Blocked Stock" value={material.blockedStock.toLocaleString()} />
            <DataRow label="Safety Stock" value={material.safetyStock.toLocaleString()} />
            <DataRow label="Safety Stock %" value={`${material.safetyStockPercentage.toFixed(1)}%`} />
            <DataRow label="Projected Shortage" value={material.projectedFirstShortageDate ?? '—'} />
          </Box>

          {/* Demand */}
          <Box>
            <SectionLabel label="Demand" />
            <Divider sx={{mb: 1, mt: 0.5}} />
            <DataRow label="Consumption (4 Wks)" value={material.consumptionNextFourWeeks.toLocaleString()} />
            <DataRow label="Related PCN" value={material.relatedPcn} />
            <DataRow label="Impacted WOs" value="WO-8800001, WO-8800003" />
          </Box>

          {/* Supply */}
          <Box>
            <SectionLabel label="Supply" />
            <Divider sx={{mb: 1, mt: 0.5}} />
            <DataRow label="Open PO Quantity" value={material.openPoQuantity.toLocaleString()} />
            <DataRow label="Next Delivery" value={material.nextDeliveryDate ?? '—'} />
            <DataRow label="In Transit" value="0" />
          </Box>

          {/* Warehouse */}
          <Box>
            <SectionLabel label="Warehouse" />
            <Divider sx={{mb: 1, mt: 0.5}} />
            <DataRow label="Batch" value="B2026-001" />
            <DataRow label="Location" value="WH-A-01-02" />
            <DataRow label="FIFO Rank" value="1" />
            <DataRow label="Hold Status" value={material.blockedStock > 0 ? 'Hold' : 'No Hold'} />
            <DataRow label="Staging Status" value={material.availableStock > 0 ? 'Available' : 'Blocked'} />
          </Box>

          {/* Quality */}
          <Box>
            <SectionLabel label="Quality" />
            <Divider sx={{mb: 1, mt: 0.5}} />
            <DataRow label="SQA Status" value={material.blockedStock > 0 ? 'Under Review' : 'Released'} />
            <DataRow label="Inspection Status" value={material.blockedStock > 0 ? 'In Progress' : 'Complete'} />
            <DataRow label="Hold Reason" value={material.blockedStock > 0 ? 'CoA deviation — pH OOS' : '—'} />
            <DataRow label="Expected Release" value={material.blockedStock > 0 ? '2026-05-22' : '—'} />
          </Box>

          {/* Risk */}
          {material.riskReason && (
            <Box sx={{p: 1.5, borderRadius: 2, bgcolor: '#FFF7ED', border: '1px solid #FED7AA'}}>
              <Typography sx={{fontSize: 11, fontWeight: 900, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
                Risk Summary
              </Typography>
              <Typography sx={{fontSize: 12, color: '#7C2D12', mt: 0.5, lineHeight: 1.5}}>
                {material.riskReason}
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      {/* Footer actions */}
      <Box sx={{px: 2.5, py: 2, borderTop: '1px solid #E5E7EB', display: 'flex', flexWrap: 'wrap', gap: 1}}>
        {actions.map(({label, msg}) => (
          <Button
            key={label}
            variant="outlined"
            size="small"
            onClick={() => onAction(msg)}
            sx={{textTransform: 'none', fontSize: 12, fontWeight: 700, borderRadius: 1.5, py: 0.5}}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Drawer>
  );
}
