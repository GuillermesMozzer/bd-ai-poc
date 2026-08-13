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
    <ButtonBase onClick={onClick} aria-label={`Open pallet ${pallet.sequence}`} sx={{ width: '100%', p: 1.5, display: 'flex', alignItems: 'center', gap: 1.25, borderRadius: 2.75, border: '1px solid var(--paper-border-color)', bgcolor: 'var(--active-theme-background-paper)', color: 'var(--active-theme-text-primary)', textAlign: 'left', boxShadow: 'var(--card-shadow)', '&:hover': { borderColor: 'var(--token-brand-main)', transform: 'translateY(-1px)' }, '&:focus-visible': { outline: '3px solid rgba(29, 116, 255, 0.28)', outlineOffset: 2 } }}>
      <Box aria-hidden="true" sx={{ width: 40, height: 40, flex: '0 0 40px', display: 'grid', placeItems: 'center', borderRadius: 2.25, bgcolor: pallet.confirmed ? 'var(--token-success-soft-bg)' : 'var(--token-brand-soft-bg)', color: pallet.confirmed ? 'var(--token-success-main)' : 'var(--token-brand-main)', '& svg': { fontSize: 22 } }}><LocalOfferOutlinedIcon /></Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} useFlexGap flexWrap="wrap"><Typography component="span" sx={{ color: 'var(--active-theme-text-primary)', fontSize: 14.5, fontWeight: 900 }}>Pallet {pallet.sequence}</Typography><TaskStatusPill label={pallet.status} tone={statusTone[pallet.status]} /></Stack>
        <Typography component="span" sx={{ display: 'block', color: pallet.lpId ? 'var(--active-theme-text-secondary)' : 'var(--active-theme-text-secondary)', fontSize: 12, fontWeight: 650, mt: 0.45 }}>{pallet.lpId ?? 'No LP generated'}</Typography>
        <Typography component="span" sx={{ display: 'block', color: 'var(--active-theme-text-secondary)', fontSize: 11.5, fontWeight: 600, mt: 0.25 }}>{pallet.labelPrinted ? 'Label printed' : 'Label not printed'} · {pallet.confirmed ? 'LP confirmed' : nextAction}</Typography>
      </Box>
      <ChevronRightIcon aria-hidden="true" sx={{ color: 'var(--token-brand-main)', flexShrink: 0 }} />
    </ButtonBase>
  );
}
