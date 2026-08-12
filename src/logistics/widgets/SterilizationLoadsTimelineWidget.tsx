import React, { useEffect, useState } from 'react';
import { Box, Card, Typography } from '@mui/material';
import { Timer } from 'lucide-react';
import { getLoads, subscribeLogisticsDemo, type SterilizationLoad } from '../data/reactiveLogisticsDemo';
import { ct } from '../cockpit/cockpitTheme';
import { reducedMotionSx } from '../a11y';

interface TimelineNode {
  label: string;
  sub: string;
  status: 'COMPLETE' | 'ACTIVE' | 'PENDING';
  timestamp?: string;
}

/** Dark CoreSight sterilization custody timeline for Control Tower V2 (distinct from light workstation widget). */
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
    <Card
      component="section"
      aria-labelledby="steril-timeline-heading"
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
          id="steril-timeline-heading"
          component="h2"
          sx={{ color: ct.accent, fontWeight: 700, fontFamily: ct.font, letterSpacing: '0.05em', fontSize: 13 }}
        >
          STERILIZATION LOAD TRACKING (OB02)
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: ct.warn }}>
          <Timer size={12} aria-hidden />
          <Typography sx={{ fontFamily: ct.mono, fontWeight: 700, fontSize: 11 }}>TAT SLA: 7 Days</Typography>
        </Box>
      </Box>

      <Typography sx={{ color: ct.textMuted, display: 'block', mb: 2, fontFamily: ct.mono, fontSize: 11 }}>
        Load ID: {loadId} · Route: External Provider · Est. Completion: 24h
      </Typography>

      <Box component="ol" aria-label="Sterilization custody timeline" sx={{ pl: 1, position: 'relative', m: 0, listStyle: 'none', flexGrow: 1 }}>
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            left: 17,
            top: 10,
            bottom: 24,
            width: 2,
            bgcolor: 'rgba(255,255,255,0.1)',
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
                gap: 2.5,
                mb: idx === nodes.length - 1 ? 0 : 2.5,
                position: 'relative',
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  bgcolor: isComplete ? ct.ok : isActive ? ct.warn : ct.bgCardHover,
                  border: '2px solid',
                  borderColor: isComplete ? ct.ok : isActive ? ct.warn : 'rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1,
                  boxShadow: isActive ? `0 0 8px ${ct.warn}` : 'none',
                  flexShrink: 0,
                }}
              >
                {isComplete && (
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#ffffff' }} />
                )}
                {isActive && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#ffffff',
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
                      fontWeight: isComplete || isActive ? 700 : 400,
                      color: isComplete ? ct.text : isActive ? ct.warn : 'rgba(255,255,255,0.4)',
                      fontFamily: ct.font,
                      fontSize: 13,
                    }}
                  >
                    {node.label}
                  </Typography>
                  {node.timestamp && (
                    <Typography
                      sx={{
                        fontFamily: ct.mono,
                        color: isActive ? ct.warn : ct.textMuted,
                        fontWeight: isActive ? 700 : 400,
                        fontSize: 11,
                        flexShrink: 0,
                      }}
                    >
                      {node.timestamp}
                    </Typography>
                  )}
                </Box>
                <Typography sx={{ color: ct.textMuted, display: 'block', mt: 0.2, fontSize: 11 }}>
                  {node.sub}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
};

export default SterilizationLoadsTimelineWidget;
