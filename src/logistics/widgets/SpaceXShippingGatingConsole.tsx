import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CircularProgress, Grid, Typography } from '@mui/material';
import { AlertTriangle, CheckCircle, RotateCw } from 'lucide-react';
import {
  appendAudit,
  getPallets,
  getShipments,
  setShipments,
  subscribeLogisticsDemo,
  updatePallet,
} from '../data/reactiveLogisticsDemo';
import { ct } from '../cockpit/cockpitTheme';
import { reducedMotionSx } from '../a11y';

type GateKey = 'batchRecord' | 'sterilization' | 'customs' | 'lineClearance';
type GateStatus = 'GREEN' | 'RED';

const GATE_LABELS: Record<GateKey, string> = {
  batchRecord: 'Batch Record',
  sterilization: 'Sterilization',
  customs: 'Customs',
  lineClearance: 'Line Clearance',
};

export type SpaceXShippingGatingConsoleProps = {
  onToast?: (message: string) => void;
};

export const SpaceXShippingGatingConsole: React.FC<SpaceXShippingGatingConsoleProps> = ({ onToast }) => {
  const [gates, setGates] = useState<Record<GateKey, GateStatus>>({
    batchRecord: 'GREEN',
    sterilization: 'RED',
    customs: 'GREEN',
    lineClearance: 'GREEN',
  });
  const [shipmentId, setShipmentId] = useState('SHIP-QRO-15');
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const pallets = getPallets();
      const shipments = getShipments();
      const shipment = shipments.find((s) => s.id === 'SHIP-QRO-15') ?? shipments[0] ?? null;
      const pallet = pallets.find((p) => p.id === 'ELP2026.101');
      if (shipment) setShipmentId(shipment.id);

      const sterilGreen =
        pallet?.status === 'RELEASED' || shipment?.checks.sterilizationPass === 'GREEN';
      const customsGreen = shipment?.checks.customsClearance !== 'RED';

      setGates({
        batchRecord: shipment?.checks.batchRecord === 'GREEN' ? 'GREEN' : 'RED',
        sterilization: sterilGreen ? 'GREEN' : 'RED',
        customs: customsGreen ? 'GREEN' : 'RED',
        lineClearance: shipment?.checks.lineClearance === 'GREEN' ? 'GREEN' : 'RED',
      });

      if (shipment?.status === 'RELEASED') setLaunchSuccess(true);
    };

    refresh();
    return subscribeLogisticsDemo(refresh);
  }, []);

  const handleLaunch = () => {
    setIsLaunching(true);
    window.setTimeout(() => {
      const shipments = getShipments();
      setShipments(
        shipments.map((s) =>
          s.id === 'SHIP-QRO-15'
            ? {
                ...s,
                status: 'RELEASED',
                checks: {
                  batchRecord: 'GREEN',
                  sterilizationPass: 'GREEN',
                  customsClearance: 'GREEN',
                  lineClearance: 'GREEN',
                },
              }
            : s,
        ),
      );
      appendAudit({
        actor: 'Gabriela Rodríguez (CT V2)',
        action: 'SHIPMENT_PGI_RELEASE',
        entityId: 'SHIP-QRO-15',
        contract: 'MD',
        detail: 'GO — RELEASE SHIPMENT from Control Tower V2 gating console',
      });
      setIsLaunching(false);
      setLaunchSuccess(true);
      onToast?.('SHIP-QRO-15 released — SAP billing updated and custody bill sent.');
    }, 2500);
  };

  const handleResetLocal = () => {
    updatePallet('ELP2026.101', { status: 'IN_INSPECTION' });
    const shipments = getShipments();
    setShipments(
      shipments.map((s) =>
        s.id === 'SHIP-QRO-15'
          ? {
              ...s,
              status: 'READINESS_CHECK',
              checks: {
                ...s.checks,
                sterilizationPass: 'RED',
                batchRecord: 'GREEN',
                customsClearance: 'GREEN',
                lineClearance: 'GREEN',
              },
            }
          : s,
      ),
    );
    setLaunchSuccess(false);
    onToast?.('SpaceX gates reset — sterilization locked pending QA release.');
  };

  const allClear = Object.values(gates).every((status) => status === 'GREEN');

  return (
    <Card
      component="section"
      aria-labelledby="spacex-console-heading"
      aria-live="polite"
      sx={{
        bgcolor: ct.bgCard,
        border: `1px solid ${ct.border}`,
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}>
        <Typography
          id="spacex-console-heading"
          component="h2"
          sx={{ color: ct.accent, fontWeight: 700, fontFamily: ct.font, letterSpacing: '0.05em', fontSize: 13 }}
        >
          SPACEX SHIPPING GATING CONSOLE (OB03)
        </Typography>
        <Button
          size="small"
          onClick={handleResetLocal}
          startIcon={<RotateCw size={10} aria-hidden />}
          sx={{
            color: ct.textDim,
            fontSize: 10,
            fontFamily: ct.mono,
            textTransform: 'none',
            minHeight: 28,
          }}
        >
          Reset Gate
        </Button>
      </Box>

      <Typography sx={{ color: ct.textMuted, display: 'block', mb: 2, fontFamily: ct.mono, fontSize: 11 }}>
        Target Shipment: Querétaro Export · {shipmentId} · Swift Transport
      </Typography>

      <Grid container spacing={1.5} sx={{ mb: 2.5 }} role="list" aria-label="Release gate status">
        {(Object.keys(GATE_LABELS) as GateKey[]).map((gateName) => {
          const isGreen = gates[gateName] === 'GREEN';
          return (
            <Grid key={gateName} size={{ xs: 6, sm: 3 }}>
              <Box
                role="listitem"
                aria-label={`${GATE_LABELS[gateName]}: ${isGreen ? 'Pass' : 'Blocked'}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 1.5,
                  bgcolor: ct.bgCardHover,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: isGreen ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)',
                  boxShadow: isGreen
                    ? 'inset 0 0 10px rgba(34,197,94,0.05)'
                    : 'inset 0 0 10px rgba(239,68,68,0.05)',
                  transition: 'border-color 0.2s ease',
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: isGreen ? ct.ok : ct.danger,
                    boxShadow: isGreen ? `0 0 8px ${ct.ok}` : `0 0 8px ${ct.danger}`,
                    mb: 1,
                    ...reducedMotionSx,
                  }}
                />
                <Typography
                  sx={{
                    color: isGreen ? ct.ok : ct.danger,
                    fontSize: 9,
                    fontWeight: 700,
                    fontFamily: ct.mono,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  {GATE_LABELS[gateName]}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      <Box sx={{ mt: 'auto' }}>
        {launchSuccess ? (
          <Box
            role="status"
            sx={{
              bgcolor: ct.okSoft,
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: '6px',
              p: 2,
              textAlign: 'center',
            }}
          >
            <CheckCircle size={28} color={ct.ok} style={{ margin: '0 auto 8px' }} aria-hidden />
            <Typography sx={{ color: ct.ok, fontWeight: 700, fontFamily: ct.mono, fontSize: 13 }}>
              LAUNCH COMPLETE (SHIPMENT RELEASED)
            </Typography>
            <Typography sx={{ color: ct.textMuted, mt: 0.5, display: 'block', fontSize: 11 }}>
              SAP billing updated. Digital bill of custody sent to Grupo Trans-Mexico.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {!allClear && (
              <Box
                role="status"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  bgcolor: ct.dangerSoft,
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '6px',
                }}
              >
                <AlertTriangle size={16} color={ct.danger} style={{ flexShrink: 0 }} aria-hidden />
                <Typography sx={{ color: ct.danger, fontFamily: ct.font, fontSize: 12 }}>
                  <strong>SAFETY LOCK ACTIVE:</strong> Outbound truck loading is blocked. Sterilization
                  release for LOT-A-114 is required.
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              disabled={!allClear || isLaunching}
              onClick={handleLaunch}
              aria-label={allClear ? 'GO — Release shipment' : 'Release shipment locked'}
              sx={{
                height: 48,
                fontFamily: ct.mono,
                fontWeight: 700,
                letterSpacing: '0.08em',
                fontSize: 13,
                textTransform: 'none',
                bgcolor: allClear ? ct.ok : 'rgba(255,255,255,0.05)',
                color: allClear ? '#ffffff' : 'rgba(255,255,255,0.3)',
                boxShadow: allClear ? '0 0 15px rgba(34, 197, 94, 0.4)' : 'none',
                animation: allClear ? 'ctV2GoPulse 2s infinite' : 'none',
                '@keyframes ctV2GoPulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.4)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(34, 197, 94, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)' },
                },
                '&:hover': { bgcolor: allClear ? '#1ea34b' : 'rgba(255,255,255,0.05)' },
                '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)', bgcolor: 'rgba(255,255,255,0.03)' },
                ...reducedMotionSx,
              }}
            >
              {isLaunching ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={16} sx={{ color: '#ffffff' }} />
                  <span>BILLING POSTING / SAP LOCKS RELEASE...</span>
                </Box>
              ) : (
                <span>GO — RELEASE SHIPMENT</span>
              )}
            </Button>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default SpaceXShippingGatingConsole;
