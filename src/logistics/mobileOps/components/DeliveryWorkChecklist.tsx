import React from 'react';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export type DeliveryAcknowledgements = {
  palletsUnloaded: boolean;
  labelsApplied: boolean;
  issuesReviewed: boolean;
};

type DeliveryWorkChecklistProps = {
  acknowledgements: DeliveryAcknowledgements;
  lpsConfirmed: boolean;
  readyForReceivingChecks: boolean;
  onToggle: (key: keyof DeliveryAcknowledgements) => void;
  onOpenReceivingChecks: () => void;
};

const manualItems: Array<{ key: keyof DeliveryAcknowledgements; label: string; description: string }> = [
  { key: 'palletsUnloaded', label: 'Pallets unloaded', description: 'Acknowledge when physical unloading is complete' },
  { key: 'labelsApplied', label: 'Labels applied', description: 'Acknowledge labels applied in the work area' },
  { key: 'issuesReviewed', label: 'Issues reviewed', description: 'Acknowledge delivery concerns were considered' },
];

export default function DeliveryWorkChecklist({ acknowledgements, lpsConfirmed, readyForReceivingChecks, onToggle, onOpenReceivingChecks }: DeliveryWorkChecklistProps) {
  return (
    <Box sx={{ p: 1.5, borderRadius: 3, bgcolor: '#F7F9FB', border: '1px solid #DDE4EB' }}>
      <Typography sx={{ color: '#102A43', fontSize: 15, fontWeight: 900 }}>Delivery work</Typography>
      <Typography sx={{ color: '#718397', fontSize: 12.25, fontWeight: 600, lineHeight: 1.35, mt: 0.3 }}>Quick acknowledgements, not a receiving inspection checklist.</Typography>
      <Stack spacing={0.45} sx={{ mt: 1.25 }}>
        {manualItems.map((item) => (
          <ChecklistRow key={item.key} label={item.label} description={item.description} complete={acknowledgements[item.key]} onClick={() => onToggle(item.key)} />
        ))}
        <ChecklistRow label="LPs generated / confirmed" description="Complete when every expected pallet has a confirmed LP" complete={lpsConfirmed} />
        <ChecklistRow label="Ready for receiving checks" description={readyForReceivingChecks ? 'Receiving checks are available' : 'Complete delivery work and pallet identification first'} complete={readyForReceivingChecks} locked={!readyForReceivingChecks} onClick={readyForReceivingChecks ? onOpenReceivingChecks : undefined} />
      </Stack>
    </Box>
  );
}

function ChecklistRow({ label, description, complete, locked = false, onClick }: { label: string; description: string; complete: boolean; locked?: boolean; onClick?: () => void }) {
  return (
    <ButtonBase
      disabled={locked}
      onClick={onClick}
      sx={{
        width: '100%', minHeight: 48, px: 0.5, display: 'flex', alignItems: 'center', gap: 1, borderRadius: 1.75, color: '#102A43', textAlign: 'left',
        '&:hover': onClick ? { bgcolor: '#EDF5FB' } : undefined, '&.Mui-disabled': { opacity: 1 }, '&:focus-visible': { outline: '2px solid rgba(29, 116, 255, 0.35)' },
      }}
    >
      {locked ? <LockOutlinedIcon aria-hidden="true" sx={{ color: '#9AA9B7', fontSize: 20 }} /> : complete ? <CheckCircleIcon aria-hidden="true" sx={{ color: '#16866A', fontSize: 21 }} /> : <RadioButtonUncheckedIcon aria-hidden="true" sx={{ color: '#8AA0B3', fontSize: 21 }} />}
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography component="span" sx={{ display: 'block', color: complete ? '#087A5B' : '#29475F', fontSize: 12.75, fontWeight: 800, lineHeight: 1.25 }}>{label}</Typography>
        <Typography component="span" sx={{ display: 'block', color: '#718397', fontSize: 11.25, fontWeight: 600, lineHeight: 1.3, mt: 0.2 }}>{description}</Typography>
      </Box>
    </ButtonBase>
  );
}
