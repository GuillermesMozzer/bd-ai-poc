import {Chip} from '@mui/material';
import type {PerformanceStatusTone, ProductionLineLifecycleStatus} from '../types';
import {deriveLineStatusSeverity} from '../utils';

const toneMap: Record<PerformanceStatusTone, {bg: string; color: string; border: string}> = {
  green: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  orange: {bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA'},
  red: {bg: '#FEF2F2', color: '#B42318', border: '#FECDCA'},
  gray: {bg: '#F2F4F7', color: 'var(--planning-text-secondary)', border: '#D0D5DD'},
  blue: {bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE'},
};

export default function ProductionLineStatusBadge({status}: {status: ProductionLineLifecycleStatus}) {
  const tone = toneMap[deriveLineStatusSeverity(status)];
  return (
    <Chip
      size="small"
      label={status}
      sx={{
        height: 26,
        bgcolor: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        fontWeight: 800,
        borderRadius: 999,
      }}
    />
  );
}
