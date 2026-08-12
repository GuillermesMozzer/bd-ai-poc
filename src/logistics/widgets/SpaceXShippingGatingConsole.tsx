import React, { useEffect, useState } from 'react';
import { Box, Button, CircularProgress, Grid, Paper, Typography } from '@mui/material';
import { AlertTriangle, CheckCircle, RotateCw } from 'lucide-react';
import {
  appendAudit,
  getPallets,
  getShipments,
  setShipments,
  subscribeLogisticsDemo,
  updatePallet,
} from '../data/reactiveLogisticsDemo';
import {
  ctV2Type,
  tokenCommon,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  workstationTierCardSx,
  workstationVisuals,
} from '../ctV2Theme';
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
    <Paper
      component="section"
      elevation={0}
      aria-labelledby="spacex-console-heading"
      aria-live="polite"
      sx={{
        ...workstationTierCardSx,
        p: 1.6,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: workstationVisuals.fontFamily,
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, gap: 1 }}>
        <Typography id="spacex-console-heading" component="h2" sx={{ ...ctV2Type.sectionTitle, color: tokenText.primary }}>
          SpaceX Shipping Gating (OB03)
        </Typography>
        <Button
          size="small"
          onClick={handleResetLocal}
          startIcon={<RotateCw size={12} aria-hidden />}
          sx={{
            color: tokenText.secondary,
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'none',
            minHeight: 28,
          }}
        >
          Reset Gate
        </Button>
      </Box>

      <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, display: 'block', mb: 1.5 }}>
        Target: Querétaro Export · {shipmentId} · Swift Transport
      </Typography>

      <Grid container spacing={1.25} sx={{ mb: 2 }} role="list" aria-label="Release gate status">
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
                  p: 1.25,
                  bgcolor: tokenNeutral.lightest,
                  borderRadius: '10px',
                  border: `1px solid ${isGreen ? tokenSuccess.lighter : tokenError.lighter}`,
                  transition: 'border-color 0.2s ease',
                }}
              >
                <Box
                  aria-hidden
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: isGreen ? tokenSuccess.main : tokenError.main,
                    mb: 0.75,
                    ...reducedMotionSx,
                  }}
                />
                <Typography
                  sx={{
                    color: isGreen ? tokenSuccess.dark : tokenError.dark,
                    fontSize: 10,
                    fontWeight: 800,
                    textAlign: 'center',
                    fontFamily: workstationVisuals.fontFamily,
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
              bgcolor: tokenSuccess.softBg,
              border: `1px solid ${tokenSuccess.lighter}`,
              borderRadius: '10px',
              p: 2,
              textAlign: 'center',
            }}
          >
            <CheckCircle size={28} color="currentColor" style={{ color: 'var(--token-success-main)', margin: '0 auto 8px' }} aria-hidden />
            <Typography sx={{ ...ctV2Type.body, color: tokenSuccess.dark, fontWeight: 800 }}>
              Launch complete — shipment released
            </Typography>
            <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, mt: 0.5, display: 'block' }}>
              SAP billing updated. Digital bill of custody sent to Grupo Trans-Mexico.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            {!allClear && (
              <Box
                role="status"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  p: 1.35,
                  bgcolor: tokenError.softBg,
                  border: `1px solid ${tokenError.lighter}`,
                  borderRadius: '10px',
                }}
              >
                <AlertTriangle size={16} color="currentColor" style={{ color: 'var(--token-error-main)', flexShrink: 0 }} aria-hidden />
                <Typography sx={{ ...ctV2Type.caption, color: tokenError.dark }}>
                  <strong>Safety lock active:</strong> Outbound loading blocked. Sterilization release for LOT-A-114 is required.
                </Typography>
              </Box>
            )}

            <Button
              variant="contained"
              disabled={!allClear || isLaunching}
              onClick={handleLaunch}
              aria-label={allClear ? 'GO — Release shipment' : 'Release shipment locked'}
              sx={{
                height: 44,
                fontFamily: workstationVisuals.fontFamily,
                fontWeight: 800,
                fontSize: 13,
                textTransform: 'none',
                borderRadius: 999,
                bgcolor: allClear ? tokenSuccess.main : tokenNeutral.lighter,
                color: allClear ? tokenCommon.white : tokenText.disabled,
                boxShadow: 'none',
                '&:hover': { bgcolor: allClear ? tokenSuccess.dark : tokenNeutral.lighter, boxShadow: 'none' },
                '&.Mui-disabled': { color: tokenText.disabled, bgcolor: tokenNeutral.lighter },
              }}
            >
              {isLaunching ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <CircularProgress size={16} sx={{ color: tokenCommon.white }} />
                  <span>Billing posting / SAP locks release...</span>
                </Box>
              ) : (
                <span>GO — Release Shipment</span>
              )}
            </Button>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default SpaceXShippingGatingConsole;
