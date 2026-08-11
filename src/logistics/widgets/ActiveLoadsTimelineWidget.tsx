import React, { useEffect, useState } from 'react';
import { Card, Box, Typography, CardContent } from '@mui/material';
import { Truck, CheckCircle2, Circle } from 'lucide-react';
import { getLoads, subscribeLogisticsDemo, type SterilizationLoad } from '../data/reactiveLogisticsDemo';

export const ActiveLoadsTimelineWidget: React.FC = () => {
  const [load, setLoad] = useState<SterilizationLoad | null>(null);

  useEffect(() => {
    const refresh = () => {
      const loads = getLoads();
      setLoad(loads[0] ?? null);
    };
    refresh();
    return subscribeLogisticsDemo(refresh);
  }, []);

  const steps = [
    { label: 'Load Dispatched', status: 'COMPLETE' as const, time: '08:15 AM' },
    { label: 'Provider Arrival', status: 'COMPLETE' as const, time: '09:30 AM' },
    { label: 'In Sterilization', status: 'COMPLETE' as const, time: '11:00 AM' },
    {
      label: 'Return Transit',
      status: 'ACTIVE' as const,
      time: `ETA ${load?.eta ?? '10:45 AM'}`,
    },
    { label: 'Quarantine Release', status: 'PENDING' as const, time: '--:--' },
  ];

  return (
    <Card sx={{ height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Custody Tracking: {load?.id ?? 'LOAD-ELP-61'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Truck {load?.carrierPlate ?? 'TX-R-4402'} returning from external sterilizer (
          {load?.providerName ?? 'Sterigenics'}).
        </Typography>
      </Box>
      <CardContent sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {steps.map((step, idx) => (
            <Box key={step.label} sx={{ display: 'flex', gap: 2, position: 'relative' }}>
              {idx < steps.length - 1 && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 12,
                    top: 24,
                    bottom: -16,
                    width: 2,
                    bgcolor: step.status === 'COMPLETE' ? '#044ED7' : 'divider',
                  }}
                />
              )}
              <Box sx={{ zIndex: 2 }}>
                {step.status === 'COMPLETE' && <CheckCircle2 size={24} color="#044ED7" />}
                {step.status === 'ACTIVE' && <Truck size={24} color="#FF5F00" className="animate-bounce" />}
                {step.status === 'PENDING' && <Circle size={24} color="#bdc3c7" />}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={step.status === 'ACTIVE' ? 'bold' : 'normal'}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {step.time}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ActiveLoadsTimelineWidget;
