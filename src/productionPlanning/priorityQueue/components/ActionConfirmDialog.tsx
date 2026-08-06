import React, {useEffect, useState} from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Box,
  Stack,
} from '@mui/material';
import {AutoAwesome as AutoAwesomeIcon} from '@mui/icons-material';
import type {ActionPayload} from '../types';

interface ActionConfirmDialogProps {
  open: boolean;
  payload: ActionPayload | null;
  onClose: () => void;
  onConfirm: (comment: string) => void;
}

export default function ActionConfirmDialog({open, payload, onClose, onConfirm}: ActionConfirmDialogProps) {
  const [comment, setComment] = useState('');

  useEffect(() => {
    setComment(payload?.comment ?? '');
  }, [payload]);

  function handleConfirm() {
    onConfirm(comment);
    setComment('');
  }

  function handleClose() {
    setComment(payload?.comment ?? '');
    onClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{display: 'flex', alignItems: 'center', gap: 1, pb: 1}}>
        <AutoAwesomeIcon sx={{fontSize: 20, color: '#1D74FF'}} />
        Confirm AI-Prepared Action
      </DialogTitle>
      <DialogContent>
        {payload ? (
          <>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: '#F0F5FF',
                border: '1px solid #BFD3FF',
                mb: 2,
              }}
            >
              <Typography sx={{fontSize: 11, fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8}}>
                Action Summary
              </Typography>
              <Stack spacing={0.7}>
                <InfoRow label="Action" value={payload.title} />
                <InfoRow label="Item" value={payload.relatedLabel} />
                <InfoRow label="Owner" value={payload.owner} />
                <InfoRow label="Reason Code" value={payload.reasonCode} />
                <InfoRow label="AI Recommendation ID" value={payload.recommendationId} />
              </Stack>
            </Box>

            <Box sx={{mb: 2}}>
              <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5}}>
                AI rationale
              </Typography>
              <Typography sx={{fontSize: 13, color: 'var(--planning-text-primary)', lineHeight: 1.6}}>
                {payload.rationale}
              </Typography>
            </Box>

            <TextField
              label="Comment"
              multiline
              minRows={3}
              fullWidth
              size="small"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add context or notes about this decision..."
            />
          </>
        ) : null}
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2}}>
        <Button onClick={handleClose} sx={{textTransform: 'none'}}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          sx={{textTransform: 'none', fontWeight: 700, bgcolor: '#1D74FF', '&:hover': {bgcolor: '#044ED7'}}}
        >
          {payload?.confirmationLabel ?? 'Confirm Action'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function InfoRow({label, value}: {label: string; value: string}) {
  return (
    <Stack direction="row" spacing={1.2} justifyContent="space-between">
      <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', textAlign: 'right'}}>{value}</Typography>
    </Stack>
  );
}
