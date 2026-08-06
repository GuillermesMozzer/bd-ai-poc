import React from 'react';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import TaskStatusPill from './TaskStatusPill';

export type PalletLp = {
  deliveryId: string;
  sequence: number;
  lpId?: string;
  labelPrinted: boolean;
  confirmed: boolean;
  status: 'Not started' | 'LP generated' | 'Label printed' | 'LP confirmed';
};

type PalletLpCardProps = { pallet: PalletLp; onClick: () => void };

const statusTone = { 'Not started': 'neutral', 'LP generated': 'primary', 'Label printed': 'primary', 'LP confirmed': 'success' } as const;

export default function PalletLpCard({ pallet, onClick }: PalletLpCardProps) {
  const nextAction = !pallet.lpId ? 'Generate LP' : !pallet.confirmed ? 'Confirm LP' : 'Confirmed';
  return (
    <ButtonBase onClick={onClick} aria-label={`Open pallet ${pallet.sequence}`} sx={{ width: '100%', p: 1.5, display: 'flex', alignItems: 'center', gap: 1.25, borderRadius: 2.75, border: '1px solid #D3E0EB', bgcolor: '#FFFFFF', color: '#102A43', textAlign: 'left', boxShadow: '0 5px 16px rgba(11, 92, 171, 0.06)', '&:hover': { borderColor: '#0B5CAB', transform: 'translateY(-1px)' }, '&:focus-visible': { outline: '3px solid rgba(29, 116, 255, 0.28)', outlineOffset: 2 } }}>
      <Box aria-hidden="true" sx={{ width: 40, height: 40, flex: '0 0 40px', display: 'grid', placeItems: 'center', borderRadius: 2.25, bgcolor: pallet.confirmed ? '#E8F6F1' : '#EAF3FB', color: pallet.confirmed ? '#087A5B' : '#0B5CAB', '& svg': { fontSize: 22 } }}><LocalOfferOutlinedIcon /></Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} useFlexGap flexWrap="wrap"><Typography component="span" sx={{ color: '#102A43', fontSize: 14.5, fontWeight: 900 }}>Pallet {pallet.sequence}</Typography><TaskStatusPill label={pallet.status} tone={statusTone[pallet.status]} /></Stack>
        <Typography component="span" sx={{ display: 'block', color: pallet.lpId ? '#557086' : '#718397', fontSize: 12, fontWeight: 650, mt: 0.45 }}>{pallet.lpId ?? 'No LP generated'}</Typography>
        <Typography component="span" sx={{ display: 'block', color: '#718397', fontSize: 11.5, fontWeight: 600, mt: 0.25 }}>{pallet.labelPrinted ? 'Label printed' : 'Label not printed'} · {pallet.confirmed ? 'LP confirmed' : nextAction}</Typography>
      </Box>
      <ChevronRightIcon aria-hidden="true" sx={{ color: '#0B5CAB', flexShrink: 0 }} />
    </ButtonBase>
  );
}
