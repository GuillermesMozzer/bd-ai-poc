import React, { useEffect, useState } from 'react';
import { Card, Box, Typography, CardContent } from '@mui/material';
import { Truck, CheckCircle2, Circle } from 'lucide-react';
import { getLoads, subscribeLogisticsDemo, type SterilizationLoad } from '../data/reactiveLogisticsDemo';
import { reducedMotionSx } from '../a11y';

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

  const statusText = {
    COMPLETE: 'Complete',
    ACTIVE: 'In progress',
    PENDING: 'Pending',
  } as const;

  return (
    <Card
      component="section"
      aria-labelledby="custody-tracking-heading"
      sx={{ height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column' }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography id="custody-tracking-heading" component="h2" variant="subtitle1" fontWeight="bold">
          Custody Tracking: {load?.id ?? 'LOAD-ELP-61'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Truck {load?.carrierPlate ?? 'TX-R-4402'} returning from external sterilizer (
          {load?.providerName ?? 'Sterigenics'}).
        </Typography>
      </Box>
      <CardContent sx={{ p: 2, flexGrow: 1, overflowY: 'auto' }}>
        <Box
          component="ol"
          aria-label="Sterilization custody timeline"
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, m: 0, p: 0, listStyle: 'none' }}
        >
          {steps.map((step, idx) => (
            <Box
              component="li"
              key={step.label}
              aria-current={step.status === 'ACTIVE' ? 'step' : undefined}
              sx={{ display: 'flex', gap: 2, position: 'relative' }}
            >
              {idx < steps.length - 1 && (
                <Box
                  aria-hidden
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
              <Box sx={{ zIndex: 2 }} aria-hidden>
                {step.status === 'COMPLETE' && <CheckCircle2 size={24} color="#044ED7" />}
                {step.status === 'ACTIVE' && (
                  <Box sx={reducedMotionSx}>
                    <Truck size={24} color="#C2410C" className="animate-bounce" />
                  </Box>
                )}
                {step.status === 'PENDING' && <Circle size={24} color="#64748b" />}
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={step.status === 'ACTIVE' ? 'bold' : 'normal'}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {statusText[step.status]} · {step.time}
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
