import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import { type UnloadingTask } from './UnloadingTaskCard';
import { type PalletLp } from './PalletLpCard';
import PalletLpCard from './PalletLpCard';
import PalletProgressSummary from './PalletProgressSummary';

type PalletLpModuleProps = {
  task: UnloadingTask;
  pallets: PalletLp[];
  receivingChecksReady: boolean;
  onOpenPallet: (sequence: number) => void;
  onOpenReceivingChecks: () => void;
};

export default function PalletLpModule({ task, pallets, receivingChecksReady, onOpenPallet, onOpenReceivingChecks }: PalletLpModuleProps) {
  const confirmedCount = pallets.filter((pallet) => pallet.confirmed).length;
  const allConfirmed = pallets.length > 0 && confirmedCount === pallets.length;

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography component="h2" sx={{ color: '#102A43', fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>Pallets / LPs</Typography>
        <Typography sx={{ color: '#557086', fontSize: 13.5, fontWeight: 600, lineHeight: 1.45, mt: 0.55 }}>{task.trailerId} · {task.expectedPallets} expected pallets</Typography>
      </Box>
      <PalletProgressSummary confirmedCount={confirmedCount} expectedCount={task.expectedPallets} />
      <Stack spacing={1.05}>{pallets.map((pallet) => <PalletLpCard key={pallet.sequence} pallet={pallet} onClick={() => onOpenPallet(pallet.sequence)} />)}</Stack>
      {allConfirmed ? (
        <Box sx={{ p: 1.5, borderRadius: 2.75, bgcolor: '#E8F6F1', border: '1px solid #9ACFBE' }}>
          <Typography sx={{ color: '#087A5B', fontSize: 14, fontWeight: 900 }}>All pallets identified</Typography>
          <Typography sx={{ color: '#397866', fontSize: 12.25, fontWeight: 650, lineHeight: 1.35, mt: 0.35 }}>Pallet identification is complete for this delivery.</Typography>
          <Button variant="contained" disabled={!receivingChecksReady} onClick={onOpenReceivingChecks} sx={{ mt: 1.25, minHeight: 42, borderRadius: 2.25, bgcolor: '#087A5B', fontWeight: 850, boxShadow: 'none', '&:hover': { bgcolor: '#056148', boxShadow: 'none' }, '&.Mui-disabled': { bgcolor: '#B7D7CB', color: '#FFFFFF' } }}>Receiving checklist coming next</Button>
        </Box>
      ) : null}
    </Stack>
  );
}
