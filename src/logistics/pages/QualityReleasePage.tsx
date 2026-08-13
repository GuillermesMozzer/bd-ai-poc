import React, { useEffect, useId, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import LogisticsPageShell from '../components/LogisticsPageShell';
import ResetDemoDataButton from '../components/ResetDemoDataButton';
import {
  appendAudit,
  getPallets,
  subscribeLogisticsDemo,
  updatePallet,
  type PalletUnit,
} from '../data/reactiveLogisticsDemo';
import { useAuthContext } from '../../auth/contexts/AuthContext';
import { focusVisibleSx, onActivateKey, riskChipSx, touchTargetSx } from '../a11y';
import { logisticsType } from '../typography';

const DISPOSITION_REASONS = [
  'Post-sterilization release',
  'Raw-material quarantine release',
  'Full laboratory review — conforming',
  'Hold for deviation — insufficient evidence',
];

const riskRank: Record<NonNullable<PalletUnit['lineStopRisk']>, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/**
 * Dra. Alejandra — QA Workstation & E-Signature
 * Screen key: quality_release
 * Contract: Inspect & Disposition (ID) — N1 regulatory ceiling
 */
export default function QualityReleasePage() {
  const { loginPassword } = useAuthContext();
  const [pallets, setPallets] = useState<PalletUnit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>('ELP2026.101');
  const [esignOpen, setEsignOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [reason, setReason] = useState(DISPOSITION_REASONS[0]);
  const [notice, setNotice] = useState('');
  const attestationId = useId();
  const passwordErrorId = useId();

  useEffect(() => {
    const refresh = () => setPallets(getPallets());
    refresh();
    return subscribeLogisticsDemo(refresh);
  }, []);

  const queue = useMemo(
    () =>
      [...pallets]
        .filter((p) => p.status === 'IN_INSPECTION' || p.status === 'HOLD' || p.status === 'EXPECTED' || p.status === 'RELEASED')
        .sort((a, b) => (riskRank[a.lineStopRisk ?? 'low'] ?? 9) - (riskRank[b.lineStopRisk ?? 'low'] ?? 9)),
    [pallets],
  );

  const selected = queue.find((p) => p.id === selectedId) ?? queue[0] ?? null;
  const canRelease = selected?.status === 'IN_INSPECTION' || selected?.status === 'HOLD';
  const passwordOk = password.trim().length > 0 && (password === loginPassword || password.length >= 4);

  const openEsign = () => {
    setPassword('');
    setReason(DISPOSITION_REASONS[0]);
    setEsignOpen(true);
  };

  const confirmRelease = () => {
    if (!selected || !passwordOk) return;
    updatePallet(selected.id, { status: 'RELEASED' });
    appendAudit({
      actor: 'Dra. Alejandra González Sánchez',
      action: 'QA_E_SIGNATURE_RELEASE',
      entityId: selected.id,
      contract: 'ID',
      reason,
      detail:
        'FDA 21 CFR Part 11 attestation recorded. Sterilization gate unlocked for SpaceX cockpit (Gaby). [URS-610-002]',
    });
    setEsignOpen(false);
    setNotice(`Lot ${selected.batch} RELEASED — SpaceX sterilization light unlocked for SHIP-QRO-15.`);
  };

  return (
    <LogisticsPageShell
      title="QA Release Workstation — Dra. Alejandra"
      subtitle="Quarantine disposition · FDA 21 CFR Part 11 · Inspect & Disposition (ID / N1 gate)"
      toolbar={<ResetDemoDataButton />}
      banner={
        <Alert severity="warning" sx={{ borderRadius: 2 }} role="status">
          Regulatory ceiling: commercial release is <strong>never automatic (N3)</strong>. Evidence may be assisted (N2);
          disposition remains a permanent human gate (N1).
        </Alert>
      }
    >
      {notice ? (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice('')} role="status">
          {notice}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2, borderRadius: 3 }} component="section" aria-labelledby="quarantine-queue-heading">
          <Typography id="quarantine-queue-heading" component="h2" sx={{ ...logisticsType.sectionTitle, mb: 1 }}>
            Quarantine Queue (risk-sorted)
          </Typography>
          <Table size="small" aria-labelledby="quarantine-queue-heading">
            <caption style={{ captionSide: 'bottom', textAlign: 'left', paddingTop: 8 }}>
              Select a lot row to open disposition details. Rows are keyboard-activatable.
            </caption>
            <TableHead>
              <TableRow>
                <TableCell scope="col">Lot / LP</TableCell>
                <TableCell scope="col">Material</TableCell>
                <TableCell scope="col">Risk</TableCell>
                <TableCell scope="col">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queue.map((row) => {
                const selectedRow = selected?.id === row.id;
                const risk = row.lineStopRisk ?? 'low';
                const chip = riskChipSx[risk] ?? riskChipSx.low;
                return (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selectedRow}
                    tabIndex={0}
                    aria-selected={selectedRow}
                    onClick={() => setSelectedId(row.id)}
                    onKeyDown={(e) => onActivateKey(e, () => setSelectedId(row.id))}
                    sx={{
                      cursor: 'pointer',
                      ...focusVisibleSx,
                      '&.Mui-selected': { bgcolor: 'rgba(4,78,215,0.10)' },
                    }}
                  >
                    <TableCell scope="row">
                      <Typography sx={{ ...logisticsType.body, fontWeight: 700, color: 'text.primary' }}>{row.batch}</Typography>
                      <Typography sx={{ ...logisticsType.caption, color: 'text.secondary' }}>
                        {row.id}
                        {selectedRow ? ' · Selected' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ ...logisticsType.body, color: 'text.primary' }}>{row.sku}</Typography>
                      <Typography sx={{ ...logisticsType.caption, color: 'text.secondary' }} display="block">
                        {row.materialName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={risk.toUpperCase()}
                        sx={{ bgcolor: chip.bgcolor, color: chip.color, fontWeight: 700 }}
                      />
                      {row.batch === 'LOT-A-114' && (
                        <Typography variant="caption" display="block" color="error.main" fontWeight={700}>
                          Urgent — Line Stop
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>

        <Paper
          sx={{ p: 2.5, borderRadius: 3 }}
          component="section"
          aria-labelledby="lot-detail-heading"
          aria-live="polite"
        >
          {!selected ? (
            <Typography color="text.secondary">Select a lot.</Typography>
          ) : (
            <Stack spacing={1.5}>
              <Typography id="lot-detail-heading" component="h2" sx={logisticsType.sectionTitle}>
                Lot {selected.batch}
              </Typography>
              <Typography sx={{ ...logisticsType.caption, color: 'text.secondary' }}>
                {selected.materialName} · PO {selected.poNumber} · LP {selected.id}
              </Typography>

              <Typography component="h3" sx={logisticsType.sectionTitle}>
                Laboratory Evidence Pack
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip label="COA Uploaded (OK)" color="success" />
                <Chip label="Bioburden Micro Test (Passed)" color="success" />
                <Chip label="Biological Indicators (Sterile)" color="success" />
              </Stack>

              <Alert severity="info" role="status">
                Contract ID · Evidence automation allowed (N2). Final disposition requires e-signature (N1).
              </Alert>

              <Button
                variant="contained"
                disabled={!canRelease}
                onClick={openEsign}
                aria-haspopup="dialog"
                aria-expanded={esignOpen}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.8125rem',
                  bgcolor: 'var(--token-brand-main)',
                  ...touchTargetSx,
                  ...focusVisibleSx,
                  '&.Mui-disabled': { color: 'rgba(0,0,0,0.55)', bgcolor: 'rgba(4,78,215,0.25)' },
                }}
              >
                Open E-Signature Gateway
              </Button>
              {selected.status === 'RELEASED' && (
                <Alert severity="success" role="status">
                  Already RELEASED — Gaby SpaceX steril light should be GREEN.
                </Alert>
              )}
              {selected.status === 'EXPECTED' && (
                <Alert severity="warning" role="status">
                  Waiting for Lupita dock transfer (status EXPECTED). Complete Mobile Receiving first.
                </Alert>
              )}
            </Stack>
          )}
        </Paper>
      </Box>

      <Dialog
        open={esignOpen}
        onClose={() => setEsignOpen(false)}
        fullWidth
        maxWidth="sm"
        aria-labelledby="esign-dialog-title"
        aria-describedby={attestationId}
      >
        <DialogTitle id="esign-dialog-title">Electronic Signature (E-Signature) — 21 CFR Part 11</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="password"
              label="Login password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
              autoComplete="current-password"
              error={password.length > 0 && !passwordOk}
              helperText={
                password.length > 0 && !passwordOk
                  ? 'Enter your login password (minimum 4 characters for this demo).'
                  : 'Required for 21 CFR Part 11 attestation.'
              }
              FormHelperTextProps={{ id: passwordErrorId }}
              inputProps={{ 'aria-describedby': `${passwordErrorId} ${attestationId}` }}
            />
            <TextField
              select
              label="Disposition reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              required
            >
              {DISPOSITION_REASONS.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </TextField>
            <Alert id={attestationId} severity="warning" role="note">
              I attest under the penalties of compliance that I have reviewed all physical laboratory evidence and submit
              it in accordance with FDA regulations and 21 CFR Part 11 [URS-610-002].
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEsignOpen(false)} sx={focusVisibleSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!passwordOk}
            onClick={confirmRelease}
            sx={{ ...focusVisibleSx, '&.Mui-disabled': { color: 'rgba(0,0,0,0.55)' } }}
          >
            Confirm Release
          </Button>
        </DialogActions>
      </Dialog>
    </LogisticsPageShell>
  );
}
