import {Close as CloseIcon, Warning as WarningIcon} from '@mui/icons-material';
import {Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography} from '@mui/material';
import {useState} from 'react';
import type {MrpReadiness} from '../types';

type Props = {
  open: boolean;
  mrpReadiness: MrpReadiness;
  canRelease: boolean;
  onClose: () => void;
  onConfirm: (releaseNotes: string) => void;
};

export default function ReleaseMpsDialog({open, mrpReadiness, canRelease, onClose, onConfirm}: Props) {
  const [notes, setNotes] = useState('');

  function handleConfirm() {
    if (!notes.trim()) return;
    onConfirm(notes.trim());
    setNotes('');
    onClose();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', pr: 1}}>
        <Box>
          <Typography sx={{fontSize: 11, color: '#6D28D9', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Release Action</Typography>
          <Typography sx={{fontSize: 20, fontWeight: 900, color: 'var(--planning-text-primary)', mt: 0.4}}>Release MPS</Typography>
        </Box>
        <Button onClick={onClose} sx={{minWidth: 0, p: 0.8}}><CloseIcon /></Button>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {!canRelease && (
            <Box sx={{p: 1.4, bgcolor: '#FEF3F2', border: '1px solid #FECDCA', borderRadius: 2, display: 'flex', gap: 1.2}}>
              <WarningIcon sx={{color: '#B42318', fontSize: 20, flexShrink: 0, mt: 0.1}} />
              <Box>
                <Typography sx={{fontSize: 13, fontWeight: 700, color: '#B42318'}}>Release is currently blocked</Typography>
                <Typography sx={{fontSize: 12, color: '#B42318', mt: 0.4}}>
                  Resolve all blocker exceptions and run Validate MPS before releasing.
                </Typography>
              </Box>
            </Box>
          )}

          {mrpReadiness.isReady ? (
            <Box sx={{p: 1.4, bgcolor: '#ECFDF3', border: '1px solid #ABEFC6', borderRadius: 2}}>
              <Typography sx={{fontSize: 13, fontWeight: 700, color: '#027A48'}}>MPS is ready for MRP</Typography>
              <Typography sx={{fontSize: 12, color: '#027A48', mt: 0.4}}>All readiness checks have passed.</Typography>
            </Box>
          ) : (
            <Box sx={{p: 1.4, bgcolor: '#FFF7E8', border: '1px solid #F9DBAF', borderRadius: 2}}>
              <Typography sx={{fontSize: 13, fontWeight: 700, color: '#B54708'}}>MRP readiness checks have not all passed</Typography>
              <Stack spacing={0.6} sx={{mt: 0.8}}>
                {mrpReadiness.checks.filter((c) => !c.passed).map((c) => (
                  <Typography key={c.label} sx={{fontSize: 12, color: '#B54708'}}>• {c.label}: {c.detail}</Typography>
                ))}
              </Stack>
            </Box>
          )}

          <Box>
            <Typography sx={{fontSize: 13, color: 'var(--planning-text-primary)', mb: 0.5, fontWeight: 600}}>Release Notes / Reason Code <span style={{color: '#B42318'}}>*</span></Typography>
            <TextField
              multiline
              rows={3}
              fullWidth
              placeholder="Describe the basis for this release…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{'& .MuiOutlinedInput-root': {borderRadius: 2}}}
            />
          </Box>

          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>
            Releasing will set the MPS status to <strong>Released</strong> and make the planning grid read-only.
            An audit event will be recorded. MRP is not executed.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{px: 3, py: 2, gap: 1}}>
        <Button onClick={onClose} sx={{color: 'var(--planning-text-secondary)'}}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          disabled={!notes.trim()}
          variant="contained"
          sx={{bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}, fontWeight: 700}}
        >
          Confirm Release
        </Button>
      </DialogActions>
    </Dialog>
  );
}
