import React, { useEffect, useState } from 'react';
import { Card, Box, Typography, Button, Grid } from '@mui/material';
import { Play, ShieldAlert } from 'lucide-react';
import {
  getPallets,
  getShipments,
  subscribeLogisticsDemo,
  type OutboundShipment,
} from '../data/reactiveLogisticsDemo';

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
    { label: 'Esterilização', green: isReleased },
    { label: 'Customs XML', green: shipment?.checks.customsClearance !== 'RED' },
    { label: 'Line Clearance', green: true },
  ];

  return (
    <Card
      sx={{
        height: '100%',
        bgcolor: '#0B132B',
        color: '#ffffff',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Box>
        <Typography variant="subtitle1" fontWeight="bold" color="#ffffff">
          SpaceX Release Console: {shipment?.id ?? 'SHIP-QRO-15'}
        </Typography>
        <Typography variant="caption" color="rgba(255,255,255,0.6)">
          Destino: {shipment?.destination ?? 'Querétaro, MX (Export)'} — Carga crítica de Plungers.
        </Typography>
      </Box>

      <Box sx={{ my: 2 }}>
        <Grid container spacing={1}>
          {lights.map((light) => (
            <Grid key={light.label} size={{ xs: 6 }}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: light.green ? '#2e7d32' : '#d32f2f',
                    animation: light.green ? 'none' : 'pulse 1.4s ease-in-out infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { opacity: 1 },
                      '50%': { opacity: 0.35 },
                    },
                  }}
                />
                <Typography variant="caption">{light.label}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ mt: 'auto' }}>
        {isReleased ? (
          <Button
            variant="contained"
            color="success"
            fullWidth
            startIcon={<Play size={16} />}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            LAUNCH SHIPMENT (GO)
          </Button>
        ) : (
          <Box
            sx={{
              p: 1,
              borderRadius: 1,
              border: '1px solid rgba(255,255,255,0.1)',
              bgcolor: 'rgba(211,47,47,0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#f44336' }}>
              <ShieldAlert size={16} />
              <Typography variant="caption" fontWeight="bold">
                CUSTODY LOCKED
              </Typography>
            </Box>
            <Typography variant="caption" color="rgba(255,255,255,0.5)" display="block" sx={{ mt: 0.5 }}>
              Lote LOT-A-114 pendente de Assinatura Digital de liberação de quarentena.
            </Typography>
          </Box>
        )}
      </Box>
    </Card>
  );
};

export default SpaceXShippingGatingWidget;
