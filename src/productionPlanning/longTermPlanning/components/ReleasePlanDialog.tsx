import {Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField, Typography} from '@mui/material';

type ReleasePlanDialogProps = {
  open: boolean;
  reasonCode: string;
  releaseNotes: string;
  onClose: () => void;
  onChangeReasonCode: (value: string) => void;
  onChangeReleaseNotes: (value: string) => void;
  onConfirm: () => void;
};

export default function ReleasePlanDialog(props: ReleasePlanDialogProps) {
  const ready = Boolean(props.reasonCode.trim() || props.releaseNotes.trim());

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{fontWeight: 900, color: 'var(--planning-text-primary)'}}>Release Long-Term Plan</DialogTitle>
      <DialogContent dividers>
        <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', lineHeight: 1.65}}>
          Releasing the plan makes all editable fields read-only in the current front-end state and records a local audit event.
        </Typography>
        <TextField
          select
          fullWidth
          label="Reason code"
          value={props.reasonCode}
          onChange={(event) => props.onChangeReasonCode(event.target.value)}
          sx={{mt: 2}}
        >
          <MenuItem value="">Select a reason</MenuItem>
          <MenuItem value="BASELINE_APPROVED">Baseline approved</MenuItem>
          <MenuItem value="S&OP_SIGNOFF">S&OP signoff</MenuItem>
          <MenuItem value="CAPACITY_REVIEW_COMPLETE">Capacity review complete</MenuItem>
        </TextField>
        <TextField
          multiline
          minRows={4}
          fullWidth
          label="Release notes"
          value={props.releaseNotes}
          onChange={(event) => props.onChangeReleaseNotes(event.target.value)}
          placeholder="Required release notes or justification"
          sx={{mt: 2}}
        />
      </DialogContent>
      <DialogActions sx={{p: 2}}>
        <Button onClick={props.onClose} sx={{textTransform: 'none', fontWeight: 800}}>Cancel</Button>
        <Button variant="contained" color="success" disabled={!ready} onClick={props.onConfirm} sx={{textTransform: 'none', fontWeight: 800}}>
          Confirm Release
        </Button>
      </DialogActions>
    </Dialog>
  );
}
