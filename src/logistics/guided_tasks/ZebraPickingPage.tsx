import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  LinearProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ResetDemoDataButton from '../components/ResetDemoDataButton';
import {
  appendAudit,
  getPickTasks,
  setPickTasks,
  subscribeLogisticsDemo,
  type GuidedPickTask,
} from '../data/reactiveLogisticsDemo';
import { focusVisibleSx, reducedMotionSx, touchTargetSx } from '../a11y';
import { logisticsType } from '../typography';
import { tokenBrand, tokenError, tokenWarning } from '../../workstation/theme';

const EXCEPTION_REASONS = ['Aisle out of stock', 'Damaged pallet', 'Blocked bin', 'FIFO/lot mismatch'];

/**
 * José Luis "Pepe" — Zebra RF Guided Picking
 * Screen key: guided_tasks
 * Contract: Directed Movement (MD) with Assisted Decision (DA) exceptions
 */
export default function ZebraPickingPage() {
  const [tasks, setTasks] = useState<GuidedPickTask[]>([]);
  const [binScanned, setBinScanned] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [exceptionOpen, setExceptionOpen] = useState(false);
  const [exceptionReason, setExceptionReason] = useState(EXCEPTION_REASONS[0]);
  const [flash, setFlash] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    const refresh = () => setTasks(getPickTasks());
    refresh();
    return subscribeLogisticsDemo(refresh);
  }, []);

  const activeTask = useMemo(
    () => tasks.find((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS') ?? null,
    [tasks],
  );

  const progressPct = activeTask
    ? Math.round((activeTask.progressIndex / activeTask.progressTotal) * 100)
    : 0;

  const persist = (next: GuidedPickTask[]) => {
    setPickTasks(next);
    setTasks(next);
  };

  const scanBin = (correct: boolean) => {
    if (!activeTask) return;
    if (!correct) {
      setMismatch(true);
      setFlash(true);
      setStatusMessage('SOURCE_MISMATCH: physical position does not match FIFO and lot rules.');
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 180;
        gain.gain.value = 0.04;
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        window.setTimeout(() => {
          osc.stop();
          ctx.close();
        }, 220);
      } catch {
        // Audio optional in restricted environments
      }
      window.setTimeout(() => setFlash(false), 500);
      return;
    }
    setMismatch(false);
    setBinScanned(true);
    setStatusMessage(`Bin ${activeTask.location} confirmed. Scan pallet ID next.`);
    persist(
      tasks.map((t) =>
        t.id === activeTask.id ? { ...t, status: 'IN_PROGRESS' as const } : t,
      ),
    );
  };

  const scanPallet = () => {
    if (!activeTask || !binScanned) return;
    const nextIndex = Math.min(activeTask.progressIndex + 1, activeTask.progressTotal);
    const done = nextIndex >= activeTask.progressTotal;
    persist(
      tasks.map((t) =>
        t.id === activeTask.id
          ? {
              ...t,
              progressIndex: done ? t.progressTotal : nextIndex,
              status: done ? ('COMPLETED' as const) : ('IN_PROGRESS' as const),
            }
          : t,
      ),
    );
    appendAudit({
      actor: 'José Luis “Pepe” Martínez Gómez',
      action: done ? 'PICK_TASK_COMPLETED' : 'PICK_UNIT_CONFIRMED',
      entityId: activeTask.id,
      contract: 'MD',
      detail: `Scan pallet OK at ${activeTask.location} [URS-170-002]`,
    });
    setStatusMessage(
      done
        ? `Task ${activeTask.id} completed.`
        : `Unit confirmed. Progress ${nextIndex} of ${activeTask.progressTotal}.`,
    );
    setBinScanned(false);
  };

  const submitException = () => {
    if (!activeTask) return;
    persist(
      tasks.map((t) =>
        t.id === activeTask.id
          ? { ...t, status: 'EXCEPTION' as const, exceptionReason }
          : t,
      ),
    );
    appendAudit({
      actor: 'José Luis “Pepe” Martínez Gómez',
      action: 'PICK_EXCEPTION_F2',
      entityId: activeTask.id,
      contract: 'DA',
      reason: exceptionReason,
      detail: 'Recount ticket opened in Control Tower; operator redirected to alternate bin.',
    });
    setStatusMessage(`Exception submitted: ${exceptionReason}.`);
    setExceptionOpen(false);
    setBinScanned(false);
    setMismatch(false);
  };

  return (
    <Box
      component="main"
      aria-label="Zebra RF Guided Picking — Pepe"
      sx={{
        flexGrow: 1,
        minHeight: 'calc(100vh - 112px)',
        bgcolor: 'var(--active-theme-background-default)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        p: { xs: 1, md: 2 },
        position: 'relative',
      }}
    >
      <Typography
        component="div"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
        sx={{
          position: 'absolute',
          width: 1,
          height: 1,
          p: 0,
          m: -1,
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {statusMessage}
      </Typography>

      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 3 }}>
        <ResetDemoDataButton />
      </Box>

      <Box
        role="region"
        aria-labelledby="zebra-task-heading"
        aria-invalid={mismatch || undefined}
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: flash ? 'var(--token-error-soft-bg)' : 'var(--active-theme-background-paper)',
          color: 'text.primary',
          borderRadius: 3,
          border: mismatch ? '3px solid var(--token-error-main)' : '3px solid var(--paper-border-color)',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transition: 'background-color 120ms ease',
          boxShadow: 'var(--paper-shadow)',
          ...(reducedMotionSx as object),
        }}
      >
        <Typography
          id="zebra-task-heading"
          component="h1"
          sx={{ ...logisticsType.overline, color: 'text.secondary' }}
        >
          Zebra TC57 · RF Guided Picking · Pepe
        </Typography>

        {!activeTask ? (
          <Alert severity="success" role="status" sx={{ '& .MuiAlert-message': { fontSize: '0.8125rem' } }}>
            All guided tasks complete or in exception. Reset Demo Data to replay.
          </Alert>
        ) : (
          <>
            <Box>
              <Typography component="h2" sx={{ ...logisticsType.rfLabel, color: 'text.secondary' }}>
                TASK ID
              </Typography>
              <Typography sx={{ ...logisticsType.rfValueLg, fontFamily: 'monospace' }}>
                {activeTask.id}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ ...logisticsType.rfLabel, color: 'text.secondary' }}>LOCATION</Typography>
              <Typography sx={{ ...logisticsType.rfValue, fontFamily: 'monospace' }}>
                {activeTask.location}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ ...logisticsType.rfLabel, color: 'text.secondary' }}>SKU</Typography>
              <Typography sx={logisticsType.rfValue}>
                {activeTask.sku}
              </Typography>
              <Typography sx={{ ...logisticsType.caption, color: 'text.secondary', fontWeight: 500 }}>
                ({activeTask.materialName})
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ ...logisticsType.rfLabel, color: 'text.secondary' }}>QTY</Typography>
              <Typography sx={logisticsType.rfValueLg}>
                PICK {activeTask.qty}x UNITS
              </Typography>
            </Box>

            <Box>
              <Typography
                id="zebra-progress-label"
                sx={{ ...logisticsType.caption, mb: 0.75, color: 'text.primary' }}
              >
                PROGRESS · Item {activeTask.progressIndex} of {activeTask.progressTotal}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progressPct}
                aria-labelledby="zebra-progress-label"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPct}
                aria-valuetext={`${activeTask.progressIndex} of ${activeTask.progressTotal} items`}
                sx={{
                  height: 12,
                  borderRadius: 999,
                  bgcolor: 'var(--surface-muted-bg)',
                  '& .MuiLinearProgress-bar': { bgcolor: tokenBrand.light },
                }}
              />
            </Box>

            {mismatch && (
              <Alert severity="error" role="alert" sx={{ fontWeight: 700 }}>
                SOURCE_MISMATCH: Physical position does not match FIFO and lot rules
                [URS-150-003, URS-170-002]
              </Alert>
            )}

            <Stack spacing={1.25} sx={{ mt: 'auto' }}>
              {!binScanned ? (
                <>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => scanBin(true)}
                    sx={{
                      py: 1.25,
                      fontSize: '0.875rem',
                      fontWeight: 800,
                      bgcolor: tokenBrand.main,
                      color: tokenBrand.contrast,
                      textTransform: 'none',
                      ...(touchTargetSx as object),
                      ...(focusVisibleSx as object),
                    }}
                  >
                    SCAN BIN BARCODE
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={() => scanBin(false)}
                    sx={{
                      py: 1,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      textTransform: 'none',
                      borderColor: tokenError.light,
                      color: tokenError.main,
                      ...(touchTargetSx as object),
                      ...(focusVisibleSx as object),
                    }}
                  >
                    Simulate Wrong Bin Scan
                  </Button>
                </>
              ) : (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={scanPallet}
                  sx={{
                    py: 1.25,
                    fontSize: '0.875rem',
                    fontWeight: 800,
                    bgcolor: tokenBrand.main,
                    color: tokenBrand.contrast,
                    textTransform: 'none',
                    ...(touchTargetSx as object),
                    ...(focusVisibleSx as object),
                  }}
                >
                  SCAN PALLET ID [URS-170-002]
                </Button>
              )}
            </Stack>
          </>
        )}
      </Box>

      <Button
        variant="contained"
        color="warning"
        onClick={() => setExceptionOpen(true)}
        disabled={!activeTask}
        aria-haspopup="dialog"
        aria-expanded={exceptionOpen}
        sx={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          borderRadius: 999,
          fontWeight: 800,
          fontSize: '0.8125rem',
          textTransform: 'none',
          px: 2,
          py: 1.1,
          bgcolor: tokenWarning.main,
          color: tokenWarning.contrast,
          ...(touchTargetSx as object),
          ...(focusVisibleSx as object),
          '&:hover': { bgcolor: tokenWarning.dark },
          '&.Mui-disabled': { color: 'text.disabled', bgcolor: 'var(--token-warning-soft-bg)' },
        }}
      >
        F2 · Exception
      </Button>

      <Dialog
        open={exceptionOpen}
        onClose={() => setExceptionOpen(false)}
        fullWidth
        maxWidth="xs"
        aria-labelledby="exception-dialog-title"
        aria-describedby="exception-dialog-desc"
      >
        <DialogTitle id="exception-dialog-title">F2 — Yard / Bin Exception</DialogTitle>
        <DialogContent>
          <Typography id="exception-dialog-desc" variant="body2" sx={{ mb: 2 }}>
            Safely cancels the task, opens a recount in Control Tower, and redirects Pepe to another bin.
          </Typography>
          <TextField
            select
            fullWidth
            label="Reason"
            value={exceptionReason}
            onChange={(e) => setExceptionReason(e.target.value)}
            required
          >
            {EXCEPTION_REASONS.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExceptionOpen(false)} sx={focusVisibleSx}>
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={submitException} sx={focusVisibleSx}>
            Submit Exception
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
