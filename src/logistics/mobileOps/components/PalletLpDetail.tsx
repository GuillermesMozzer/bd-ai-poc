import React from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import TaskStatusPill from './TaskStatusPill';
import { type PalletLp } from './PalletLpCard';

type PalletLpDetailProps = {
  pallet: PalletLp;
  onGenerateLp: () => void;
  onPrintLabel: () => void;
  onReprintLabel: () => void;
  onConfirmLp: () => void;
};

const statusTone = { 'Not started': 'neutral', 'LP generated': 'primary', 'Label printed': 'primary', 'LP confirmed': 'success' } as const;

export default function PalletLpDetail({ pallet, onGenerateLp, onPrintLabel, onReprintLabel, onConfirmLp }: PalletLpDetailProps) {
  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography component="h2" sx={{ color: '#102A43', fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>Pallet {pallet.sequence}</Typography>
        <Typography sx={{ color: '#557086', fontSize: 13.5, fontWeight: 600, lineHeight: 1.45, mt: 0.55 }}>Pallet identification and label acknowledgement.</Typography>
      </Box>
      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #C7DBEE', backgroundImage: 'none', boxShadow: '0 8px 22px rgba(11, 92, 171, 0.08)' }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box aria-hidden="true" sx={{ width: 48, height: 48, display: 'grid', placeItems: 'center', borderRadius: 2.5, bgcolor: pallet.confirmed ? '#E8F6F1' : '#EAF3FB', color: pallet.confirmed ? '#087A5B' : '#0B5CAB', '& svg': { fontSize: 26 } }}><LocalOfferOutlinedIcon /></Box>
          <Box><TaskStatusPill label={pallet.status} tone={statusTone[pallet.status]} /><Typography sx={{ color: '#29475F', fontSize: 13, fontWeight: 750, mt: 0.75 }}>{pallet.lpId ?? 'No LP generated yet'}</Typography></Box>
        </Stack>
        <Stack spacing={0.7} sx={{ mt: 1.75, pt: 1.5, borderTop: '1px solid #E5ECF2' }}>
          <DetailLine label="LP identity" value={pallet.lpId ? 'Generated' : 'Pending'} />
          <DetailLine label="Label" value={pallet.labelPrinted ? 'Printed' : 'Not printed'} />
          <DetailLine label="Confirmation" value={pallet.confirmed ? 'Confirmed' : 'Pending'} />
        </Stack>
      </Paper>
      {!pallet.lpId ? <Button variant="contained" onClick={onGenerateLp} sx={primaryButtonSx}>Generate LP</Button> : (
        <Stack spacing={1}>
          <Button variant="contained" onClick={onPrintLabel} sx={primaryButtonSx}>{pallet.labelPrinted ? 'Print label again' : 'Print label'}</Button>
          <Button variant="outlined" onClick={onReprintLabel} sx={outlineButtonSx}>Reprint label</Button>
          {!pallet.confirmed ? <Button variant="contained" onClick={onConfirmLp} sx={{ ...primaryButtonSx, bgcolor: '#087A5B', '&:hover': { bgcolor: '#056148', boxShadow: 'none' } }}>Confirm LP</Button> : <Box sx={{ p: 1.25, borderRadius: 2.5, textAlign: 'center', bgcolor: '#E8F6F1', color: '#087A5B', fontSize: 13, fontWeight: 850 }}>LP confirmed</Box>}
        </Stack>
      )}
    </Stack>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return <Stack direction="row" justifyContent="space-between" spacing={2}><Typography sx={{ color: '#718397', fontSize: 12.5, fontWeight: 700 }}>{label}</Typography><Typography sx={{ color: '#29475F', fontSize: 12.5, fontWeight: 850 }}>{value}</Typography></Stack>;
}

const primaryButtonSx = { minHeight: 48, borderRadius: 2.5, bgcolor: '#0B5CAB', color: '#FFFFFF', fontWeight: 850, boxShadow: 'none', '&:hover': { bgcolor: '#08477F', boxShadow: 'none' } };
const outlineButtonSx = { minHeight: 48, borderRadius: 2.5, borderColor: '#8FA7BB', color: '#29475F', fontWeight: 850 };
