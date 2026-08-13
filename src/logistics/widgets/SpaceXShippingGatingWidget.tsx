import React, { useEffect, useState } from 'react';
import { Card, Box, Typography, Button, Grid } from '@mui/material';
import { Play, ShieldAlert } from 'lucide-react';
import {
  getPallets,
  getShipments,
  subscribeLogisticsDemo,
  type OutboundShipment,
} from '../data/reactiveLogisticsDemo';
import { focusVisibleSx, reducedMotionSx, touchTargetSx } from '../a11y';
import { logisticsType } from '../typography';

export const SpaceXShippingGatingWidget: React.FC = () => {
  const [shipment, setShipment] = useState<OutboundShipment | null>(null);
  const [palletStatus, setPalletStatus] = useState<string>('IN_INSPECTION');

  useEffect(() => {
    const refresh = () => {
      const pallets = getPallets();
      const plungerPallet = pallets.find((p) => p.id === 'ELP2026.101');
      if (plungerPallet) setPalletStatus(plungerPallet.status);
      const shipments = getShipments();
      setShipment(shipments.find((s) => s.id === 'SHIP-QRO-15') ?? shipments[0] ?? null);
    };
    refresh();
    return subscribeLogisticsDemo(refresh);
  }, []);

  const isReleased = palletStatus === 'RELEASED' || shipment?.checks.sterilizationPass === 'GREEN';
  const lights = [
    { label: 'Batch Record', green: true },
    { label: 'Sterilization', green: isReleased },
    { label: 'Customs XML', green: shipment?.checks.customsClearance !== 'RED' },
    { label: 'Line Clearance', green: true },
  ];

  return (
    <Card
      component="section"
      aria-labelledby="spacex-gating-heading"
      aria-live="polite"
      sx={{
        height: '100%',
        bgcolor: 'var(--active-theme-background-default)',
        color: 'text.primary',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography id="spacex-gating-heading" component="h2" sx={{ ...logisticsType.sectionTitle, color: 'text.primary' }}>
          SpaceX Release Console: {shipment?.id ?? 'SHIP-QRO-15'}
        </Typography>
        <Typography sx={{ ...logisticsType.caption, color: 'text.secondary', mt: 0.25 }}>
          Destination: {shipment?.destination ?? 'Querétaro, MX (Export)'} — Critical plungers load.
        </Typography>
      </Box>

      <Box sx={{ my: 2 }} role="list" aria-label="Release gate status">
        <Grid container spacing={1}>
          {lights.map((light) => {
            const statusText = light.green ? 'Pass' : 'Blocked';
            return (
              <Grid key={light.label} size={{ xs: 6 }}>
                <Box
                  role="listitem"
                  aria-label={`${light.label}: ${statusText}`}
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: 'var(--surface-subtle-bg)',
                    border: '1px solid var(--paper-border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Box
                    aria-hidden
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: light.green ? 'var(--token-success-main)' : 'var(--token-error-main)',
                      border: '1px solid var(--paper-border-color)',
                      animation: light.green ? 'none' : 'pulse 1.4s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0.35 },
                      },
                      ...(reducedMotionSx as object),
                    }}
                  />
                  <Box>
                    <Typography sx={{ ...logisticsType.caption, display: 'block', color: 'text.primary', fontWeight: 700 }}>
                      {light.label}
                    </Typography>
                    <Typography sx={{ ...logisticsType.caption, color: 'text.secondary' }}>
                      {statusText}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        {isReleased ? (
          <Button
            variant="contained"
            color="success"
            fullWidth
            startIcon={<Play size={16} aria-hidden />}
            aria-label="Launch shipment, all gates passed"
            sx={{
              textTransform: 'none',
              fontWeight: 'bold',
              ...(touchTargetSx as object),
              ...(focusVisibleSx as object),
            }}
          >
            LAUNCH SHIPMENT (GO)
          </Button>
        ) : (
          <Box
            role="status"
            sx={{
              p: 1,
              borderRadius: 1,
              border: '1px solid var(--paper-border-color)',
              bgcolor: 'var(--token-error-soft-bg)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'var(--token-error-main)' }}>
              <ShieldAlert size={16} aria-hidden />
              <Typography variant="caption" fontWeight="bold" sx={{ color: 'var(--token-error-main)' }}>
                CUSTODY LOCKED
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }} display="block">
              Lot LOT-A-114 pending digital signature for quarantine release.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default SpaceXShippingGatingWidget;
