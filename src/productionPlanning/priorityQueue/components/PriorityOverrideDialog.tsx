import React, {useState} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import type {RiskSeverity, WoPriority} from '../types';

interface PriorityOverrideDialogProps {
  open: boolean;
  currentPriority: WoPriority | RiskSeverity;
  mode: 'work-order' | 'operational-risk';
  onClose: () => void;
  onConfirm: (newPriority: WoPriority | RiskSeverity, reason: string) => void;
}

const woPriorityOptions: WoPriority[] = ['Critical', 'High', 'Medium', 'Low'];
const riskSeverityOptions: RiskSeverity[] = ['Critical', 'High', 'Medium'];

export default function PriorityOverrideDialog({
  open,
  currentPriority,
  mode,
  onClose,
  onConfirm,
}: PriorityOverrideDialogProps) {
  const [newPriority, setNewPriority] = useState<string>(currentPriority);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState(false);

  const options = mode === 'work-order' ? woPriorityOptions : riskSeverityOptions;

  function handleConfirm() {
    if (!reason.trim()) {
      setReasonError(true);
      return;
    }
    onConfirm(newPriority as WoPriority | RiskSeverity, reason.trim());
    handleClose();
  }

  function handleClose() {
    setNewPriority(currentPriority);
    setReason('');
    setReasonError(false);
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Override Priority</DialogTitle>
      <DialogContent sx={{display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important'}}>
        <Alert severity="info" sx={{fontSize: 13}}>
          The original system/AI priority will remain visible alongside your override.
        </Alert>
        <TextField
          select
          label="Current priority"
          size="small"
          value={currentPriority}
          disabled
          fullWidth
        >
          {options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField
          select
          label="New priority"
          size="small"
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          fullWidth
        >
          {options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
        <TextField
          label="Reason for override *"
          multiline
          minRows={2}
          fullWidth
          size="small"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (e.target.value.trim()) setReasonError(false);
          }}
          error={reasonError}
          helperText={reasonError ? 'A reason is required to override priority.' : undefined}
          placeholder="Explain why you are changing the priority…"
        />
        {newPriority !== currentPriority && reason.trim() && (
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontStyle: 'italic'}}>
            Will display: "Priority manually overridden by you on {new Date().toLocaleString()}. Reason: {reason}"
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2}}>
        <Button onClick={handleClose} sx={{textTransform: 'none'}}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{textTransform: 'none', fontWeight: 700}}
        >
          Apply override
        </Button>
      </DialogActions>
    </Dialog>
  );
}
