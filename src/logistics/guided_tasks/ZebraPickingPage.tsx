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

const EXCEPTION_REASONS = ['Corredor sem estoque', 'Pallet avariado', 'Bin bloqueado', 'FIFO/lote divergente'];

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
    setExceptionOpen(false);
    setBinScanned(false);
    setMismatch(false);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: 'calc(100vh - 112px)',
        bgcolor: '#0B132B',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'stretch',
        p: { xs: 1, md: 2 },
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 3 }}>
        <ResetDemoDataButton />
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
          bgcolor: flash ? '#7f1d1d' : '#111827',
          color: '#fff',
          borderRadius: 3,
          border: '3px solid #1f2937',
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          transition: 'background-color 120ms ease',
          boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.7, letterSpacing: 1.2 }}>
          Zebra TC57 · RF Guided Picking · Pepe
        </Typography>

        {!activeTask ? (
          <Alert severity="success">All guided tasks complete or in exception. Reset Demo Data to replay.</Alert>
        ) : (
          <>
            <Box>
              <Typography sx={{ fontSize: '0.85rem', opacity: 0.7 }}>TASK ID</Typography>
              <Typography sx={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1.1 }}>
                {activeTask.id}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.85rem', opacity: 0.7 }}>LOCATION</Typography>
              <Typography sx={{ fontSize: '1.55rem', fontWeight: 800, fontFamily: 'monospace' }}>
                {activeTask.location}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.85rem', opacity: 0.7 }}>SKU</Typography>
              <Typography sx={{ fontSize: '1.35rem', fontWeight: 800 }}>
                {activeTask.sku}
              </Typography>
              <Typography sx={{ opacity: 0.75 }}>({activeTask.materialName})</Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '0.85rem', opacity: 0.7 }}>QTY</Typography>
              <Typography sx={{ fontSize: '1.8rem', fontWeight: 900 }}>
                PICK {activeTask.qty}x UNITS
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ mb: 0.75, fontWeight: 700 }}>
                PROGRESS · Item {activeTask.progressIndex} of {activeTask.progressTotal}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progressPct}
                sx={{
                  height: 12,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.12)',
                  '& .MuiLinearProgress-bar': { bgcolor: '#044ED7' },
                }}
              />
            </Box>

            {mismatch && (
              <Alert severity="error" sx={{ fontWeight: 700 }}>
                ❌ SOURCE_MISMATCH: Posição física em desacordo com as regras de FIFO e lote
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
                      py: 1.6,
                      fontSize: '1.05rem',
                      fontWeight: 900,
                      bgcolor: '#044ED7',
                      textTransform: 'none',
                    }}
                  >
                    SCAN BIN BARCODE
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={() => scanBin(false)}
                    sx={{ py: 1.2, fontWeight: 800, textTransform: 'none' }}
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
                    py: 1.6,
                    fontSize: '1.05rem',
                    fontWeight: 900,
                    bgcolor: '#044ED7',
                    textTransform: 'none',
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
        sx={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          borderRadius: 999,
          fontWeight: 900,
          textTransform: 'none',
          px: 2.5,
          py: 1.4,
          bgcolor: '#FF5F00',
          '&:hover': { bgcolor: '#e05500' },
        }}
      >
        F2 · Exception
      </Button>

      <Dialog open={exceptionOpen} onClose={() => setExceptionOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>F2 — Yard / Bin Exception</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Cancela a tarefa com segurança, abre recount na Control Tower e direciona Pepe para outro bin.
          </Typography>
          <TextField
            select
            fullWidth
            label="Motivo"
            value={exceptionReason}
            onChange={(e) => setExceptionReason(e.target.value)}
          >
            {EXCEPTION_REASONS.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {reason}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExceptionOpen(false)}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={submitException}>
            Submit Exception
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
