import React from 'react';
import { Stack, Typography } from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import { type UnloadingTask } from './UnloadingTaskCard';
import DeliveryExecutionCard from './DeliveryExecutionCard';
import DeliveryWorkChecklist, { type DeliveryAcknowledgements } from './DeliveryWorkChecklist';
import PalletProgressSummary from './PalletProgressSummary';

type DeliveryExecutionWorkspaceProps = {
  task: UnloadingTask;
  acknowledgements: DeliveryAcknowledgements;
  confirmedPallets: number;
  onToggleAcknowledgement: (key: keyof DeliveryAcknowledgements) => void;
  onOpenPallets: () => void;
  onOpenReceivingChecks: () => void;
};

export default function DeliveryExecutionWorkspace({ task, acknowledgements, confirmedPallets, onToggleAcknowledgement, onOpenPallets, onOpenReceivingChecks }: DeliveryExecutionWorkspaceProps) {
  const allPalletsConfirmed = task.expectedPallets > 0 && confirmedPallets === task.expectedPallets;
  const readyForReceivingChecks = allPalletsConfirmed && acknowledgements.palletsUnloaded && acknowledgements.labelsApplied && acknowledgements.issuesReviewed;

  return (
    <Stack spacing={1.25}>
      <Typography sx={{ color: 'var(--active-theme-text-primary)', fontSize: 17, fontWeight: 900, pt: 0.5 }}>Delivery execution</Typography>
      <PalletProgressSummary confirmedCount={confirmedPallets} expectedCount={task.expectedPallets} />
      <DeliveryWorkChecklist acknowledgements={acknowledgements} lpsConfirmed={allPalletsConfirmed} readyForReceivingChecks={readyForReceivingChecks} onToggle={onToggleAcknowledgement} onOpenReceivingChecks={onOpenReceivingChecks} />
      <Stack spacing={1}>
        <DeliveryExecutionCard title="Pallets / LPs" description="Generate, print, and confirm pallet identities" detail={`${confirmedPallets} of ${task.expectedPallets} pallets identified`} icon={<LocalOfferOutlinedIcon />} onClick={onOpenPallets} />
        <DeliveryExecutionCard title="Receiving checks" description={readyForReceivingChecks ? 'Receiving checklist coming next' : allPalletsConfirmed ? 'Complete delivery acknowledgements to continue' : 'Available after pallet identification'} icon={<FactCheckOutlinedIcon />} onClick={readyForReceivingChecks ? onOpenReceivingChecks : undefined} disabled={!readyForReceivingChecks} />
        <DeliveryExecutionCard title="Report issue" description="Damage, mismatch, and document review coming next" icon={<FlagOutlinedIcon />} disabled />
        <DeliveryExecutionCard title="Complete receiving" description="Available after delivery checks are complete" icon={<AssignmentTurnedInOutlinedIcon />} disabled />
        <DeliveryExecutionCard title="Delivery details" description={`PO ${task.purchaseOrder} · ${task.dock} · ${task.assignedOperators.length} operators assigned`} icon={<Inventory2OutlinedIcon />} readOnly />
      </Stack>
    </Stack>
  );
}
