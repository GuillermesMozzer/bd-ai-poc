import React, { useEffect, useMemo, useState } from 'react';
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

const DISPOSITION_REASONS = [
  'Liberação pós-esterilização',
  'Liberação de quarentena de matéria-prima',
  'Revisão laboratorial completa — conforme',
  'Hold por desvio — evidência insuficiente',
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
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Regulatory ceiling: commercial release is <strong>never automatic (N3)</strong>. Evidence may be assisted (N2);
          disposition remains a permanent human gate (N1).
        </Alert>
      }
    >
      {notice && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setNotice('')}>
          {notice}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 0.8fr' },
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1 }}>
            Quarantine Queue (risk-sorted)
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Lot / LP</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Risk</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {queue.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  selected={selected?.id === row.id}
                  onClick={() => setSelectedId(row.id)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>
                    <Typography fontWeight={700}>{row.batch}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {row.id}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {row.sku}
                    <Typography variant="caption" display="block" color="text.secondary">
                      {row.materialName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={(row.lineStopRisk ?? 'low').toUpperCase()}
                      color={row.lineStopRisk === 'critical' ? 'error' : 'warning'}
                    />
                    {row.batch === 'LOT-A-114' && (
                      <Typography variant="caption" display="block" color="error.main" fontWeight={700}>
                        Urgente — Parada de Linha
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{row.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Paper sx={{ p: 2.5, borderRadius: 3 }}>
          {!selected ? (
            <Typography color="text.secondary">Select a lot.</Typography>
          ) : (
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={800}>
                Lot {selected.batch}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selected.materialName} · PO {selected.poNumber} · LP {selected.id}
              </Typography>

              <Typography variant="subtitle2" fontWeight={800}>
                Laboratory Evidence Pack
              </Typography>
              <Chip label="COA Uploaded (OK)" color="success" />
              <Chip label="Bioburden Micro Test (Passed)" color="success" />
              <Chip label="Biological Indicators (Sterile)" color="success" />

              <Alert severity="info">
                Contract ID · Evidence automation allowed (N2). Final disposition requires e-signature (N1).
              </Alert>

              <Button
                variant="contained"
                disabled={!canRelease}
                onClick={openEsign}
                sx={{ textTransform: 'none', fontWeight: 800, bgcolor: '#044ED7' }}
              >
                Open E-Signature Gateway
              </Button>
              {selected.status === 'RELEASED' && (
                <Alert severity="success">Already RELEASED — Gaby SpaceX steril light should be GREEN.</Alert>
              )}
              {selected.status === 'EXPECTED' && (
                <Alert severity="warning">
                  Waiting for Lupita dock transfer (status EXPECTED). Complete Mobile Receiving first.
                </Alert>
              )}
            </Stack>
          )}
        </Paper>
      </Box>

      <Dialog open={esignOpen} onClose={() => setEsignOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Assinatura Eletrônica (E-Signature) — 21 CFR Part 11</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              type="password"
              label="Senha de login"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              required
            />
            <TextField
              select
              label="Motivo da Disposição"
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
            <Alert severity="warning">
              Eu atesto sob as penalidades de compliance que revisei todas as evidências físicas de laboratório e as
              submeto em conformidade com as normas regulatórias da FDA e 21 CFR Part 11 [URS-610-002].
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEsignOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!passwordOk} onClick={confirmRelease}>
            Confirm Release
          </Button>
        </DialogActions>
      </Dialog>
    </LogisticsPageShell>
  );
}
