import React, { useEffect, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { Timer } from 'lucide-react';
import { getLoads, subscribeLogisticsDemo, type SterilizationLoad } from '../data/reactiveLogisticsDemo';
import {
  ctV2Type,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
  workstationTierCardSx,
  workstationVisuals,
} from '../ctV2Theme';
import { reducedMotionSx } from '../a11y';

interface TimelineNode {
  label: string;
  sub: string;
  status: 'COMPLETE' | 'ACTIVE' | 'PENDING';
  timestamp?: string;
}

/** Theme-aware sterilization custody timeline for Control Tower V2. */
export const SterilizationLoadsTimelineWidget: React.FC = () => {
  const [load, setLoad] = useState<SterilizationLoad | null>(null);

  useEffect(() => {
    const refresh = () => setLoad(getLoads()[0] ?? null);
    refresh();
    return subscribeLogisticsDemo(refresh);
  }, []);

  const loadId = load?.id ?? 'LOAD-ELP-61';
  const provider = load?.providerName ?? 'Sterigenics External';
  const plate = load?.carrierPlate ?? 'TX-R-4402';
  const eta = load?.eta ?? '04:30 PM';

  const nodes: TimelineNode[] = [
    { label: 'Carrier Loaded', sub: `El Paso Dock 3 · ${plate}`, status: 'COMPLETE', timestamp: '08:15 AM' },
    { label: 'In Transit', sub: `To ${provider}`, status: 'COMPLETE', timestamp: '09:00 AM' },
    { label: 'Sterilization Processing', sub: 'Cycle #C-990812', status: 'COMPLETE', timestamp: '11:30 AM' },
    { label: 'In Transit Back', sub: 'Trailer returning', status: 'ACTIVE', timestamp: `ETA ${eta}` },
    { label: 'Quarantine Gate', sub: 'QA Bioburden validation', status: 'PENDING' },
  ];

  return (
    <Paper
      component="section"
      elevation={0}
      aria-labelledby="steril-timeline-heading"
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
        <Typography id="steril-timeline-heading" component="h2" sx={{ ...ctV2Type.sectionTitle, color: tokenText.primary }}>
          Sterilization Load Tracking (OB02)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: tokenWarning.dark }}>
          <Timer size={12} aria-hidden />
          <Typography sx={{ ...ctV2Type.caption, fontWeight: 800, color: tokenWarning.dark }}>TAT SLA: 7 Days</Typography>
        </Box>
      </Box>

      <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, display: 'block', mb: 2 }}>
        Load ID: {loadId} · Route: External Provider · Est. Completion: 24h
      </Typography>

      <Box
        component="ol"
        aria-label="Sterilization custody timeline"
        sx={{ pl: 1, position: 'relative', m: 0, listStyle: 'none', flexGrow: 1 }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 17,
            top: 10,
            bottom: 24,
            width: 2,
            bgcolor: tokenNeutral.main,
          }}
        />

        {nodes.map((node, idx) => {
          const isComplete = node.status === 'COMPLETE';
          const isActive = node.status === 'ACTIVE';

          return (
            <Box
              component="li"
              key={node.label}
              aria-current={isActive ? 'step' : undefined}
              sx={{
                display: 'flex',
                gap: 2,
                mb: idx === nodes.length - 1 ? 0 : 2.25,
                position: 'relative',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: isComplete ? tokenSuccess.main : isActive ? tokenWarning.main : 'background.paper',
                  border: '2px solid',
                  borderColor: isComplete ? tokenSuccess.main : isActive ? tokenWarning.main : tokenNeutral.main,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  flexShrink: 0,
                }}
              >
                {isComplete && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'background.paper' }} />
                )}
                {isActive && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'background.paper',
                      animation: 'ctV2PulseDot 1.5s infinite',
                      '@keyframes ctV2PulseDot': {
                        '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                        '50%': { transform: 'scale(1.2)', opacity: 1 },
                        '100%': { transform: 'scale(0.8)', opacity: 0.5 },
                      },
                      ...reducedMotionSx,
                    }}
                  />
                )}
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
                  <Typography
                    sx={{
                      ...ctV2Type.body,
                      fontWeight: isComplete || isActive ? 800 : 600,
                      color: isComplete || isActive ? tokenText.primary : tokenText.secondary,
                    }}
                  >
                    {node.label}
                  </Typography>
                  {node.timestamp && (
                    <Typography
                      sx={{
                        ...ctV2Type.caption,
                        color: isActive ? tokenWarning.dark : tokenText.secondary,
                        fontWeight: isActive ? 800 : 600,
                        flexShrink: 0,
                      }}
                    >
                      {node.timestamp}
                    </Typography>
                  )}
                </Box>
                <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, display: 'block', mt: 0.2 }}>
                  {node.sub}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default SterilizationLoadsTimelineWidget;
