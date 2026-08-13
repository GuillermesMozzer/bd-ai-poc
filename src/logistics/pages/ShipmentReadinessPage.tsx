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
  focusVisibleSx,
  gateStatusLabel,
  onActivateKey,
  reducedMotionSx,
  touchTargetSx,
} from '../a11y';
import { logisticsType } from '../typography';
import { lx } from '../themeTokens';
import { tokenBrand, tokenSuccess } from '../../workstation/theme';

const lightColor = (light: GateLight) =>
  light === 'GREEN' ? lx.ok : light === 'YELLOW' ? lx.warn : lx.danger;

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
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: `1px solid ${lx.border}`,
          }}
          component="section"
          aria-labelledby="truck-list-heading"
        >
          <Typography id="truck-list-heading" component="h2" sx={{ ...logisticsType.sectionTitle, mb: 1.25 }}>
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
                    bgcolor: active ? tokenBrand.selectedBg : lx.soft,
                    color: 'text.primary',
                    border: active ? `2px solid ${tokenBrand.main}` : `1px solid ${lx.border}`,
                    ...(focusVisibleSx as object),
                  }}
                >
                  <Typography sx={{ ...logisticsType.body, fontWeight: 700 }}>{shipment.destination}</Typography>
                  <Typography sx={{ ...logisticsType.caption, color: 'text.secondary' }}>
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
            bgcolor: 'background.paper',
            color: 'text.primary',
            border: `1px solid ${lx.border}`,
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
              <Typography id="shipment-detail-heading" component="h2" sx={{ ...logisticsType.sectionTitle, fontSize: '1rem' }}>
                {selected.id}
              </Typography>
              <Typography sx={{ ...logisticsType.caption, color: 'text.secondary', mb: 2 }}>
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
                        bgcolor: lx.soft,
                        border: `1px solid ${lx.border}`,
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
                          border: `2px solid ${lx.border}`,
                          animation:
                            gate.light === 'RED'
                              ? 'pulse 1.2s ease-in-out infinite'
                              : 'none',
                          '@keyframes pulse': {
                            '0%,100%': { opacity: 1 },
                            '50%': { opacity: 0.35 },
                          },
                          ...(reducedMotionSx as object),
                        }}
                      />
                      <Box>
                        <Typography sx={{ ...logisticsType.caption, fontWeight: 800, color: 'text.primary' }}>
                          {gate.label}
                        </Typography>
                        <Typography sx={{ ...logisticsType.caption, color: 'text.secondary' }}>
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
                      sx={{ ...(touchTargetSx as object), ...(focusVisibleSx as object) }}
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

              <Typography id={goHelpId} variant="caption" sx={{ color: 'text.secondary', mb: 1 }}>
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
                    px: 3,
                    py: 1.25,
                    fontWeight: 800,
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    bgcolor: allGreen ? tokenSuccess.main : lx.muted,
                    color: allGreen ? tokenSuccess.contrast : 'text.secondary',
                    ...(touchTargetSx as object),
                    ...(focusVisibleSx as object),
                    ...(reducedMotionSx as object),
                    animation:
                      allGreen && selected.status !== 'RELEASED' ? 'goPulse 1.6s ease-in-out infinite' : 'none',
                    '@keyframes goPulse': {
                      '0%,100%': { boxShadow: `0 0 0 0 ${tokenSuccess.softBg}` },
                      '50%': { boxShadow: '0 0 0 14px transparent' },
                    },
                    '&.Mui-disabled': {
                      color: 'text.disabled',
                      bgcolor: lx.muted,
                    },
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
