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
import { focusVisibleSx, onActivateKey, touchTargetSx } from './a11y';
import { logisticsType } from './typography';

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

  const transferHelpId = 'dock-transfer-help';

  return (
    <LogisticsPageShell
      title="Tablet Receiving — Lupita"
      subtitle="Dock tablet · SAP appointment queue · Directed Movement (MD)"
      toolbar={<ResetDemoDataButton />}
      banner={
        <Alert severity="info" sx={{ borderRadius: 2 }} role="status">
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
        <Paper sx={{ p: 2, borderRadius: 3 }} component="section" aria-labelledby="sap-queue-heading">
          <Typography id="sap-queue-heading" component="h2" sx={{ ...logisticsType.sectionTitle, mb: 1.25 }}>
            SAP Appointment Queue
          </Typography>
          <Stack spacing={1.25} role="listbox" aria-label="Truck appointments" aria-activedescendant={selectedId ?? undefined}>
            {pallets.map((pallet) => {
              const active = pallet.id === selectedId;
              return (
                <Paper
                  key={pallet.id}
                  id={pallet.id}
                  variant="outlined"
                  role="option"
                  aria-selected={active}
                  tabIndex={0}
                  onClick={() => selectTruck(pallet.id)}
                  onKeyDown={(e) => onActivateKey(e, () => selectTruck(pallet.id))}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    borderColor: active ? 'var(--token-brand-main)' : 'divider',
                    borderWidth: active ? 2 : 1,
                    bgcolor: active ? 'rgba(4,78,215,0.06)' : 'background.paper',
                    ...focusVisibleSx,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocalShippingIcon aria-hidden sx={{ color: active ? 'var(--token-brand-main)' : 'text.secondary' }} />
                    <Box>
                      <Typography sx={{ ...logisticsType.body, fontWeight: 700, color: 'text.primary' }}>
                        {pallet.carrierName} — {pallet.dock}
                      </Typography>
                      <Typography sx={{ ...logisticsType.caption, color: 'text.secondary' }}>
                        {pallet.scheduledTime} · {pallet.poNumber} · Status: {pallet.status}
                        {active ? ' · Selected' : ''}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        </Paper>

        <Paper
          sx={{ p: 2.5, borderRadius: 3, minHeight: 420 }}
          component="section"
          aria-labelledby="dock-detail-heading"
          aria-live="polite"
        >
          {!selected ? (
            <Typography color="text.secondary">Select a truck appointment.</Typography>
          ) : (
            <Stack spacing={2}>
              <Box>
                <Typography id="dock-detail-heading" component="h2" sx={logisticsType.sectionTitle}>
                  {selected.carrierName} — {selected.dock} ({selected.scheduledTime})
                </Typography>
                <Typography sx={{ ...logisticsType.caption, color: 'text.secondary', mt: 0.35 }}>
                  {selected.sku} · {selected.materialName} · Batch {selected.batch} · LP {selected.id}
                </Typography>
              </Box>

              {selected.divergences?.includes('SAP_SYNC_FAILED') && (
                <Alert
                  severity={sapFixed ? 'success' : 'error'}
                  role="alert"
                  action={
                    !sapFixed ? (
                      <Button
                        color="inherit"
                        size="small"
                        onClick={retrySapSync}
                        disabled={sapLoading}
                        aria-busy={sapLoading}
                        sx={{ ...touchTargetSx, ...focusVisibleSx }}
                      >
                        {sapLoading ? (
                          <>
                            <CircularProgress size={16} color="inherit" aria-hidden sx={{ mr: 1 }} />
                            Retrying…
                          </>
                        ) : (
                          'Retry SAP Sync'
                        )}
                      </Button>
                    ) : undefined
                  }
                >
                  {sapFixed
                    ? 'SAP sync recovered. PO paperwork verified — checklist unlocked.'
                    : 'Warning: PO paperwork could not be verified — SAP sync failed [URS-400-003]'}
                </Alert>
              )}

              {!isExceptionTruck && (
                <>
                  <Typography component="h3" id="dock-checklist-heading" sx={logisticsType.sectionTitle}>
                    4-Point Dock Checklist
                  </Typography>
                  <Stack component="fieldset" aria-labelledby="dock-checklist-heading" sx={{ border: 0, m: 0, p: 0, gap: 0.25, '& .MuiFormControlLabel-label': { fontSize: '0.8125rem' } }}>
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
                  </Stack>

                  <Typography id={transferHelpId} variant="caption" color="text.secondary">
                    {canTransfer
                      ? 'All checklist items complete. Ready to transfer custody.'
                      : 'Complete all four checklist items before transferring custody.'}
                  </Typography>

                  <Button
                    variant="contained"
                    size="large"
                    disabled={!canTransfer}
                    onClick={markDockReady}
                    aria-describedby={transferHelpId}
                    sx={{
                      mt: 1,
                      bgcolor: 'var(--token-brand-main)',
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.8125rem',
                      py: 1.1,
                      ...touchTargetSx,
                      ...focusVisibleSx,
                      '&:hover': { bgcolor: 'var(--token-brand-dark)' },
                      '&.Mui-disabled': { color: 'rgba(0,0,0,0.55)', bgcolor: 'rgba(4,78,215,0.25)' },
                    }}
                  >
                    MARK DOCK READY (TRANSFER CUSTODY)
                  </Button>
                  {selected.status === 'IN_INSPECTION' || selected.status === 'RELEASED' ? (
                    <Alert severity="success" role="status">
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
        ContentProps={{ role: 'status', 'aria-live': 'polite' }}
      />
    </LogisticsPageShell>
  );
}
