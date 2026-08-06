import {Chip} from '@mui/material';
import type {ExceptionSeverity, LongTermPlanStatus, LongTermPlanningLineStatus} from '../types';
import {planningStatusTones} from '../../ui/planningTheme';

const statusTone: Record<LongTermPlanStatus | LongTermPlanningLineStatus, {bg: string; color: string; border: string}> = planningStatusTones;
const severityTone: Record<ExceptionSeverity, {bg: string; color: string; border: string}> = planningStatusTones;

export function StatusBadge({status}: {status: LongTermPlanStatus | LongTermPlanningLineStatus}) {
  const tone = statusTone[status];
  return (
    <Chip
      size="small"
      label={status}
      sx={{
        bgcolor: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        fontWeight: 800,
      }}
    />
  );
}

export function SeverityBadge({severity}: {severity: ExceptionSeverity}) {
  const tone = severityTone[severity];
  return (
    <Chip
      size="small"
      label={severity}
      sx={{
        bgcolor: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        fontWeight: 800,
      }}
    />
  );
}
