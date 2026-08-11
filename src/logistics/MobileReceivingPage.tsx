import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Paper,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LogisticsPageShell from './components/LogisticsPageShell';
import ResetDemoDataButton from './components/ResetDemoDataButton';
import {
  appendAudit,
  getPallets,
  isSapSyncFixed,
  setSapSyncFixed,
  subscribeLogisticsDemo,
  updatePallet,
  type PalletUnit,
} from './data/reactiveLogisticsDemo';

type ChecklistState = {
  physicalMatch: boolean;
  bolMatch: boolean;
  labelPrinted: boolean;
  coaAttached: boolean;
};

const emptyChecklist: ChecklistState = {
  physicalMatch: false,
  bolMatch: false,
  labelPrinted: false,
  coaAttached: false,
};

/**
 * María Guadalupe "Lupita" — Tablet Receiving (Dock)
 * Screen key: logistics_mobile_ops
 * Contract: Directed Movement (MD) + Inspect evidence capture
 */
export default function MobileReceivingPage() {
  const [pallets, setPalletsState] = useState<PalletUnit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>('ELP2026.101');
  const [checklist, setChecklist] = useState<ChecklistState>(emptyChecklist);
  const [sapFixed, setSapFixed] = useState(false);
  const [sapLoading, setSapLoading] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    const refresh = () => {
      setPalletsState(getPallets());
      setSapFixed(isSapSyncFixed());
    };
    refresh();
    return subscribeLogisticsDemo(refresh);
  }, []);

  const selected = useMemo(
    () => pallets.find((p) => p.id === selectedId) ?? null,
    [pallets, selectedId],
  );

  const isExceptionTruck = selected?.divergences?.includes('SAP_SYNC_FAILED') && !sapFixed;
  const allChecked =
    checklist.physicalMatch && checklist.bolMatch && checklist.labelPrinted && checklist.coaAttached;
  const canTransfer =
    !!selected &&
    !isExceptionTruck &&
    allChecked &&
    selected.status !== 'IN_INSPECTION' &&
    selected.status !== 'RELEASED';

  const selectTruck = (id: string) => {
    setSelectedId(id);
    setChecklist(emptyChecklist);
  };

  const retrySapSync = () => {
    setSapLoading(true);
    window.setTimeout(() => {
      setSapSyncFixed(true);
      setSapFixed(true);
      setSapLoading(false);
      setToast('SAP sync restored — checklist unlocked [URS-400-003]');
    }, 1200);
  };

  const markDockReady = () => {
    if (!selected || !canTransfer) return;
    updatePallet(selected.id, {
      status: 'IN_INSPECTION',
      receivedQty: selected.expectedQty,
      coaAttached: true,
      location: 'QA-HOLD-01',
    });
    appendAudit({
      actor: 'María Guadalupe “Lupita” Hernández López',
      action: 'MARK_DOCK_READY_TRANSFER_CUSTODY',
      entityId: selected.id,
      contract: 'MD',
      detail: `Barcode LP ${selected.id} confirmed. Custody transferred to QA inspection queue.`,
    });
    setToast(`LP ${selected.id} barcoded → IN_INSPECTION. Pending item created for Dra. Alejandra.`);
    setChecklist(emptyChecklist);
  };

  return (
    <LogisticsPageShell
      title='Tablet Receiving — Lupita'
      subtitle="Dock tablet · SAP appointment queue · Directed Movement (MD)"
      toolbar={<ResetDemoDataButton />}
      banner={
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Persona: <strong>María Guadalupe “Lupita” Hernández López</strong> · 10&quot; tablet view · El Paso Dock
        </Alert>
      }
    >
      <Box
        sx={{
          maxWidth: 980,
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '340px 1fr' },
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
            SAP Appointment Queue
          </Typography>
          <Stack spacing={1.25}>
            {pallets.map((pallet) => {
              const active = pallet.id === selectedId;
              return (
                <Paper
                  key={pallet.id}
                  variant="outlined"
                  onClick={() => selectTruck(pallet.id)}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    borderColor: active ? '#044ED7' : 'divider',
                    bgcolor: active ? 'rgba(4,78,215,0.06)' : 'background.paper',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocalShippingIcon sx={{ color: active ? '#044ED7' : 'text.secondary' }} />
                    <Box>
                      <Typography variant="body2" fontWeight={800}>
                        {pallet.carrierName} — {pallet.dock}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pallet.scheduledTime} · {pallet.poNumber} · {pallet.status}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3, minHeight: 420 }}>
          {!selected ? (
            <Typography color="text.secondary">Select a truck appointment.</Typography>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {selected.carrierName} — {selected.dock} ({selected.scheduledTime})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selected.sku} · {selected.materialName} · Batch {selected.batch} · LP {selected.id}
                </Typography>
              </Box>

              {selected.divergences?.includes('SAP_SYNC_FAILED') && (
                <Alert
                  severity={sapFixed ? 'success' : 'error'}
                  action={
                    !sapFixed ? (
                      <Button color="inherit" size="small" onClick={retrySapSync} disabled={sapLoading}>
                        {sapLoading ? <CircularProgress size={16} color="inherit" /> : 'Retry SAP Sync'}
                      </Button>
                    ) : undefined
                  }
                >
                  {sapFixed
                    ? 'SAP sync recovered. PO paperwork verified — checklist unlocked.'
                    : '⚠️ PO Paperwork could not be verified — SAP sync failed [URS-400-003]'}
                </Alert>
              )}

              {!isExceptionTruck && (
                <>
                  <Typography variant="subtitle2" fontWeight={800}>
                    4-Point Dock Checklist
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklist.physicalMatch}
                        onChange={(e) => setChecklist((c) => ({ ...c, physicalMatch: e.target.checked }))}
                      />
                    }
                    label="Physical vs documentary match?"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklist.bolMatch}
                        onChange={(e) => setChecklist((c) => ({ ...c, bolMatch: e.target.checked }))}
                      />
                    }
                    label="Invoice & BOL match the PO?"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklist.labelPrinted}
                        onChange={(e) => setChecklist((c) => ({ ...c, labelPrinted: e.target.checked }))}
                      />
                    }
                    label="Physical Pallet ID label printed?"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checklist.coaAttached}
                        onChange={(e) => setChecklist((c) => ({ ...c, coaAttached: e.target.checked }))}
                      />
                    }
                    label="Supplier COA attached?"
                  />

                  <Button
                    variant="contained"
                    size="large"
                    disabled={!canTransfer}
                    onClick={markDockReady}
                    sx={{
                      mt: 1,
                      bgcolor: '#044ED7',
                      textTransform: 'none',
                      fontWeight: 800,
                      py: 1.4,
                      '&:hover': { bgcolor: '#033ba8' },
                    }}
                  >
                    MARK DOCK READY (TRANSFER CUSTODY)
                  </Button>
                  {selected.status === 'IN_INSPECTION' || selected.status === 'RELEASED' ? (
                    <Alert severity="success">
                      Custody already transferred · status {selected.status}
                    </Alert>
                  ) : null}
                </>
              )}
            </Stack>
          )}
        </Paper>
      </Box>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </LogisticsPageShell>
  );
}
