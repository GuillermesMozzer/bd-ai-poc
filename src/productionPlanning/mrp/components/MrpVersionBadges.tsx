import {Chip} from '@mui/material';
import type {MrpApprovalStatus, MrpType} from '../types';

const tones = {
  green:  {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  amber:  {bg: '#FFF7ED', color: '#B54708', border: '#F9DBAF'},
  red:    {bg: '#FEF2F2', color: '#B42318', border: '#FECDCA'},
  blue:   {bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE'},
  purple: {bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE'},
} as const;

function toneChip(label: string, tone: keyof typeof tones) {
  const {bg, color, border} = tones[tone];
  return (
    <Chip
      label={label}
      size="small"
      sx={{height: 22, fontSize: 11, fontWeight: 800, bgcolor: bg, color, border: `1px solid ${border}`, borderRadius: 1.5}}
    />
  );
}

export function MrpApprovalStatusBadge({status}: {status: MrpApprovalStatus}) {
  const tone =
    status === 'Approved'         ? 'green'  :
    status === 'Pending Approval' ? 'amber'  :
    status === 'Rejected'         ? 'red'    : 'blue';
  return toneChip(status, tone);
}

export function MrpBaselineBadge() {
  return toneChip('Approved Baseline', 'purple');
}

export function MrpTypeBadge({mrpType}: {mrpType: MrpType}) {
  return mrpType === 'Official'
    ? toneChip('Official MRP', 'purple')
    : toneChip('Simulation', 'amber');
}
