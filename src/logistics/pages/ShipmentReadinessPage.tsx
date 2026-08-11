import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LogisticsPageShell from '../components/LogisticsPageShell';
import ResetDemoDataButton from '../components/ResetDemoDataButton';
import {
  appendAudit,
  getShipments,
  setShipments,
  subscribeLogisticsDemo,
  type GateLight,
  type OutboundShipment,
} from '../data/reactiveLogisticsDemo';
import {
  focusVisibleOnDarkSx,
  focusVisibleSx,
  gateStatusLabel,
  onActivateKey,
  reducedMotionSx,
  touchTargetSx,
} from '../a11y';

const lightColor = (light: GateLight) =>
  light === 'GREEN' ? '#2e7d32' : light === 'YELLOW' ? '#F59E0B' : '#d32f2f';

/**
 * Gabriela "Gaby" — SpaceX Shipment Cockpit
 * Screen key: shipment_readiness
 * Contracts: Assisted Decision (DA) gating + Directed Movement (MD) PGI
 */
export default function ShipmentReadinessPage() {
  const [shipments, setShipmentsState] = useState<OutboundShipment[]>([]);
  const [selectedId, setSelectedId] = useState('SHIP-QRO-15');
  const [launching, setLaunching] = useState(false);
  const [customsLoading, setCustomsLoading] = useState(false);
  const [banner, setBanner] = useState('');

  useEffect(() => {
    const refresh = () => setShipmentsState(getShipments());
    refresh();
    return subscribeLogisticsDemo(refresh);
  }, []);

  const selected = useMemo(
    () => shipments.find((s) => s.id === selectedId) ?? shipments[0] ?? null,
    [shipments, selectedId],
  );

  const allGreen =
    !!selected &&
    selected.checks.batchRecord === 'GREEN' &&
    selected.checks.sterilizationPass === 'GREEN' &&
    selected.checks.customsClearance === 'GREEN' &&
    selected.checks.lineClearance === 'GREEN';

  const reverifyCustoms = () => {
    if (!selected) return;
    setCustomsLoading(true);
    window.setTimeout(() => {
      const next = getShipments().map((s) =>
        s.id === selected.id
          ? {
              ...s,
              status: 'READINESS_CHECK' as const,
              checks: { ...s.checks, customsClearance: 'GREEN' as const },
            }
          : s,
      );
      setShipments(next);
      setShipmentsState(next);
      appendAudit({
        actor: 'Gabriela “Gaby” Rodríguez Pérez',
        action: 'REVERIFY_CUSTOMS_XML',
        entityId: selected.id,
        contract: 'DA',
        detail: 'Async SAP QM / Receita verification completed — customs light GREEN.',
      });
      setCustomsLoading(false);
      setBanner(`${selected.id}: Customs XML re-verified successfully.`);
    }, 2000);
  };

  const launchShipment = () => {
    if (!selected || !allGreen) return;
    setLaunching(true);
    window.setTimeout(() => {
      const next = getShipments().map((s) =>
        s.id === selected.id ? { ...s, status: 'RELEASED' as const } : s,
      );
      setShipments(next);
      setShipmentsState(next);
      appendAudit({
        actor: 'Gabriela “Gaby” Rodríguez Pérez',
        action: 'GO_RELEASE_SHIPMENT_PGI',
        entityId: selected.id,
        contract: 'MD',
        detail: 'PGI confirmed in SAP. Truck cleared from dock.',
      });
      setLaunching(false);
      setBanner(`${selected.id}: GO — shipment released / PGI posted.`);
    }, 1600);
  };

  const gates = selected
    ? [
        { key: 'batchRecord', label: 'BATCH RECORD VALIDATION', light: selected.checks.batchRecord },
        {
          key: 'sterilizationPass',
          label: 'STERILIZATION CYCLE CONFIRMED',
          light: selected.checks.sterilizationPass,
        },
        { key: 'customsClearance', label: 'CUSTOMS DOCUMENTATION READY', light: selected.checks.customsClearance },
        { key: 'lineClearance', label: 'LINE CLEARANCE OK', light: selected.checks.lineClearance },
      ]
    : [];

  const goHelpId = 'go-release-help';

  return (
    <LogisticsPageShell
      title="SpaceX Shipping Cockpit — Gaby"
      subtitle="4-light release console · Querétaro / Reno · Control Tower aesthetic"
      toolbar={<ResetDemoDataButton />}
      banner={
        <Alert severity="info" sx={{ borderRadius: 2 }} role="status">
          Persona: <strong>Gabriela “Gaby” Rodríguez Pérez</strong> · Sterilization light listens to Dra. Alejandra
          RELEASE of LOT-A-114 via localStorage.
        </Alert>
      }
    >
      {banner ? (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setBanner('')} role="status">
          {banner}
        </Alert>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
          gap: 2,
        }}
      >
        <Paper
          sx={{ p: 2, borderRadius: 3, bgcolor: '#0B132B', color: '#fff' }}
          component="section"
          aria-labelledby="truck-list-heading"
        >
          <Typography id="truck-list-heading" component="h2" fontWeight={800} sx={{ mb: 1.5 }}>
            Trucks
          </Typography>
          <Stack spacing={1} role="listbox" aria-label="Outbound shipments" aria-activedescendant={selected?.id}>
            {shipments.map((shipment) => {
              const active = shipment.id === selected?.id;
              return (
                <Paper
                  key={shipment.id}
                  id={shipment.id}
                  role="option"
                  aria-selected={active}
                  tabIndex={0}
                  onClick={() => setSelectedId(shipment.id)}
                  onKeyDown={(e) => onActivateKey(e, () => setSelectedId(shipment.id))}
                  sx={{
                    p: 1.5,
                    cursor: 'pointer',
                    bgcolor: active ? 'rgba(4,78,215,0.35)' : 'rgba(255,255,255,0.06)',
                    color: '#fff',
                    border: active ? '2px solid #7EB6FF' : '1px solid rgba(255,255,255,0.2)',
                    ...focusVisibleOnDarkSx,
                  }}
                >
                  <Typography fontWeight={800}>{shipment.destination}</Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.88)' }}>
                    {shipment.id} · Status: {shipment.status}
                    {active ? ' · Selected' : ''}
                  </Typography>
                </Paper>
              );
            })}
          </Stack>
        </Paper>

        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            bgcolor: '#0B132B',
            color: '#fff',
            minHeight: 460,
            display: 'flex',
            flexDirection: 'column',
          }}
          component="section"
          aria-labelledby="shipment-detail-heading"
          aria-live="polite"
        >
          {!selected ? (
            <Typography>Select a shipment.</Typography>
          ) : (
            <>
              <Typography id="shipment-detail-heading" component="h2" variant="h5" fontWeight={900}>
                {selected.id}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.88)', mb: 2 }}>
                {selected.destination} · {selected.carrierName} · {selected.dockSlot} · Need {selected.needDate}
              </Typography>

              <Box
                role="list"
                aria-label="Release gates"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 1.5,
                  mb: 3,
                }}
              >
                {gates.map((gate) => {
                  const statusText = gateStatusLabel(gate.light);
                  return (
                    <Box
                      key={gate.key}
                      role="listitem"
                      aria-label={`${gate.label}: ${statusText}`}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Box
                        aria-hidden
                        sx={{
                          width: 18,
                          height: 18,
                          flexShrink: 0,
                          borderRadius: '50%',
                          bgcolor: lightColor(gate.light),
                          border: '2px solid rgba(255,255,255,0.85)',
                          animation:
                            gate.light === 'RED'
                              ? 'pulse 1.2s ease-in-out infinite'
                              : 'none',
                          '@keyframes pulse': {
                            '0%,100%': { opacity: 1 },
                            '50%': { opacity: 0.35 },
                          },
                          ...reducedMotionSx,
                        }}
                      />
                      <Box>
                        <Typography fontWeight={800} variant="body2">
                          {gate.label}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
                          Status: {statusText} ({gate.light})
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              {selected.id === 'SHIP-RNO-08' && selected.checks.customsClearance === 'RED' && (
                <Alert
                  severity="error"
                  sx={{ mb: 2 }}
                  role="alert"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={reverifyCustoms}
                      disabled={customsLoading}
                      aria-busy={customsLoading}
                      sx={{ ...touchTargetSx, ...focusVisibleSx }}
                    >
                      {customsLoading ? (
                        <>
                          <CircularProgress size={16} color="inherit" aria-hidden sx={{ mr: 1 }} />
                          Verifying…
                        </>
                      ) : (
                        'Re-Verify Customs XML'
                      )}
                    </Button>
                  }
                >
                  CUSTOMS DOCUMENTATION blocked (RED) — GO locked until SAP QM / Receita re-verify.
                </Alert>
              )}

              <Typography id={goHelpId} variant="caption" sx={{ color: 'rgba(255,255,255,0.88)', mb: 1 }}>
                {selected.status === 'RELEASED'
                  ? 'Shipment already released.'
                  : allGreen
                    ? 'All four gates passed. Ready to release.'
                    : 'GO is locked until every gate shows Pass (GREEN).'}
              </Typography>

              <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  disabled={!allGreen || launching || selected.status === 'RELEASED'}
                  onClick={launchShipment}
                  aria-describedby={goHelpId}
                  aria-busy={launching}
                  startIcon={
                    launching ? (
                      <CircularProgress size={18} color="inherit" aria-hidden />
                    ) : (
                      <RocketLaunchIcon aria-hidden />
                    )
                  }
                  sx={{
                    px: 4,
                    py: 1.6,
                    fontWeight: 900,
                    textTransform: 'none',
                    fontSize: '1.05rem',
                    bgcolor: allGreen ? '#2e7d32' : '#546E7A',
                    color: '#fff',
                    ...touchTargetSx,
                    ...focusVisibleOnDarkSx,
                    ...reducedMotionSx,
                    animation:
                      allGreen && selected.status !== 'RELEASED' ? 'goPulse 1.6s ease-in-out infinite' : 'none',
                    '@keyframes goPulse': {
                      '0%,100%': { boxShadow: '0 0 0 0 rgba(46,125,50,0.55)' },
                      '50%': { boxShadow: '0 0 0 14px rgba(46,125,50,0)' },
                    },
                    '&.Mui-disabled': { color: 'rgba(255,255,255,0.75)', bgcolor: '#546E7A' },
                  }}
                >
                  {selected.status === 'RELEASED' ? 'SHIPMENT RELEASED' : 'GO — RELEASE SHIPMENT'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </LogisticsPageShell>
  );
}
