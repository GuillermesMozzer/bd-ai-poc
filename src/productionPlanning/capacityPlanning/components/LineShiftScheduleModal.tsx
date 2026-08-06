import {Dialog, DialogContent, DialogTitle, Typography} from '@mui/material';
import {planningTokens} from '../../ui/planningTheme';
import type {LineShiftSchedule} from '../types';
import ShiftScheduleScreen from '../../../shiftManagement/components/ShiftScheduleScreen';

type Props = {
  open: boolean;
  lineName: string;
  schedule: LineShiftSchedule | null;
  onClose: () => void;
};

export default function LineShiftScheduleModal({open, lineName, schedule, onClose}: Props) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xl"
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: 'hidden',
          minHeight: '85vh',
        },
      }}
    >
      <DialogTitle sx={{pb: 1.25}}>
        <Typography sx={{fontSize: 18, fontWeight: 900, color: planningTokens.textPrimary}}>
          Shift Schedule
        </Typography>
        <Typography sx={{fontSize: 12, color: planningTokens.textSecondary}}>
          {lineName || 'Selected line'}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{px: 0, pb: 0, height: '100%'}}>
        {schedule ? (
          <ShiftScheduleScreen />
        ) : (
          <Typography sx={{px: 3, py: 3, fontSize: 13, color: planningTokens.textMuted}}>
            No shift schedule available for this line.
          </Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
