import React, { useMemo, useState } from 'react';
import { Avatar, Box, Button, Card, Chip, LinearProgress, Typography } from '@mui/material';
import { AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { appendAudit, updatePallet } from '../data/reactiveLogisticsDemo';
import { ct } from '../cockpit/cockpitTheme';

interface DecisionItem {
  id: string;
  title: string;
  material: string;
  impact: string;
  minutesToStop: number;
  ownerName: string;
  ownerInitials: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'OPEN' | 'ASSIGNED' | 'RESOLVED';
  sapDoc: string;
}

const INITIAL_DECISIONS: DecisionItem[] = [
  {
    id: 'DEC-0709-01',
    title: 'QA Inspection Quarantined - Lot A-114',
    material: 'Syringe Plunger 5ml (SKU: BD-8805-SYR)',
    impact: 'Line 3 Filling stops in 18 minutes',
    minutesToStop: 18,
    ownerName: 'Dra. Alejandra González',
    ownerInitials: 'AG',
    severity: 'CRITICAL',
    status: 'OPEN',
    sapDoc: 'SAP-QM-26440',
  },
  {
    id: 'DEC-0709-02',
    title: 'Customs Tax Mismatch - Reno Shipment',
    material: 'Finished Goods G22 (SHIP-RNO-08)',
    impact: 'Late penalty of $12K/hr starts in 45 minutes',
    minutesToStop: 45,
    ownerName: 'Gabriela Rodríguez (Gaby)',
    ownerInitials: 'GR',
    severity: 'HIGH',
    status: 'OPEN',
    sapDoc: 'SAP-SD-88021',
  },
  {
    id: 'DEC-0709-03',
    title: 'Unloading Dwell Exceeded - Trailer TRL-7710',
    material: 'Molding Resin (PO-98440)',
    impact: 'Carrier detention billing active',
    minutesToStop: 120,
    ownerName: 'María Guadalupe (Lupita)',
    ownerInitials: 'MH',
    severity: 'MEDIUM',
    status: 'ASSIGNED',
    sapDoc: 'SAP-MM-99102',
  },
];

export type PrioritizedDecisionQueueProps = {
  onResolved?: (message: string) => void;
};

export const PrioritizedDecisionQueue: React.FC<PrioritizedDecisionQueueProps> = ({ onResolved }) => {
  const [decisions, setDecisions] = useState<DecisionItem[]>(() =>
    [...INITIAL_DECISIONS].sort((a, b) => a.minutesToStop - b.minutesToStop),
  );

  const openCount = useMemo(() => decisions.filter((d) => d.status !== 'RESOLVED').length, [decisions]);

  const handleFastTrack = (id: string) => {
    if (id === 'DEC-0709-01') {
      updatePallet('ELP2026.101', { status: 'RELEASED' });
      appendAudit({
        actor: 'Dra. Alejandra González (CT Fast-Track)',
        action: 'QA_RELEASE_FAST_TRACK',
        entityId: 'ELP2026.101',
        contract: 'ID',
        reason: 'Control Tower prioritized decision queue resolve',
        detail: 'LOT-A-114 released via DA decision queue',
      });
      onResolved?.('LOT-A-114 released — SpaceX sterilization gate unlocked for SHIP-QRO-15.');
    } else if (id === 'DEC-0709-02') {
      onResolved?.('Customs mismatch escalated to Gaby workstation — open SpaceX / ATLAS action.');
    } else {
      onResolved?.(`${id} marked resolved in decision queue.`);
    }

    setDecisions((prev) =>
      prev.map((dec) => (dec.id === id ? { ...dec, status: 'RESOLVED' as const } : dec)),
    );
  };

  return (
    <Card
      component="section"
      aria-labelledby="decision-queue-heading"
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
          id="decision-queue-heading"
          component="h2"
          sx={{ color: ct.accent, fontWeight: 700, fontFamily: ct.font, letterSpacing: '0.05em', fontSize: 13 }}
        >
          PRIORITIZED DECISION QUEUE (DA)
        </Typography>
        <Chip
          label={`Risk Horizon · ${openCount} open`}
          size="small"
          sx={{
            bgcolor: ct.warnSoft,
            color: ct.warn,
            fontSize: 10,
            fontFamily: ct.mono,
            height: 22,
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
        {decisions.map((item) => {
          const isCritical = item.severity === 'CRITICAL';
          const isHigh = item.severity === 'HIGH';
          const isResolved = item.status === 'RESOLVED';
          const severityColor = isCritical ? ct.danger : isHigh ? ct.warn : ct.textMuted;

          return (
            <Box
              key={item.id}
              sx={{
                p: 1.5,
                borderRadius: '6px',
                bgcolor: isResolved ? ct.okSoft : ct.bgCardHover,
                borderLeft: `4px solid ${isResolved ? ct.ok : severityColor}`,
                transition: 'background-color 0.2s ease, opacity 0.2s ease',
                opacity: isResolved ? 0.7 : 1,
                '&:hover': { bgcolor: isResolved ? ct.okSoft : '#2a3144' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: ct.text, fontWeight: 700, mb: 0.5, fontSize: 13, fontFamily: ct.font }}>
                    {item.title}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{ color: ct.textMuted, display: 'block', fontFamily: ct.mono, fontSize: 11 }}
                  >
                    {item.material} · {item.sapDoc}
                  </Typography>
                </Box>
                <Chip
                  label={item.status}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 9,
                    fontFamily: ct.mono,
                    bgcolor: isResolved ? ct.okSoft : 'rgba(255,255,255,0.08)',
                    color: isResolved ? ct.ok : ct.text,
                    flexShrink: 0,
                  }}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  my: 1,
                  bgcolor: 'rgba(0,0,0,0.25)',
                  p: 1,
                  borderRadius: '4px',
                }}
              >
                <AlertTriangle size={14} color={ct.danger} aria-hidden />
                <Typography sx={{ color: ct.danger, fontWeight: 700, fontFamily: ct.mono, fontSize: 11 }}>
                  {item.impact}
                </Typography>
              </Box>

              {!isResolved && (
                <Box sx={{ mt: 1 }}>
                  <Typography
                    sx={{ color: ct.textDim, display: 'block', mb: 0.5, fontFamily: ct.mono, fontSize: 10 }}
                  >
                    Time-to-Impact Window
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(0, Math.min(100, 100 - item.minutesToStop / 1.2))}
                      aria-label={`${item.minutesToStop} minutes to impact`}
                      sx={{
                        flexGrow: 1,
                        height: 4,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.1)',
                        '& .MuiLinearProgress-bar': { bgcolor: severityColor },
                      }}
                    />
                    <Typography
                      sx={{
                        color: severityColor,
                        fontFamily: ct.mono,
                        fontWeight: 700,
                        minWidth: 40,
                        textAlign: 'right',
                        fontSize: 11,
                      }}
                    >
                      {item.minutesToStop}m
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <Avatar
                    sx={{
                      width: 22,
                      height: 22,
                      fontSize: 9,
                      fontWeight: 700,
                      bgcolor: ct.accentSoft,
                      color: ct.accent,
                      border: `1px solid ${ct.borderStrong}`,
                    }}
                  >
                    {item.ownerInitials}
                  </Avatar>
                  <Typography sx={{ color: ct.textMuted, fontFamily: ct.font, fontSize: 11 }} noWrap>
                    {item.ownerName}
                  </Typography>
                </Box>

                {!isResolved ? (
                  <Button
                    variant="contained"
                    size="small"
                    endIcon={<ArrowRight size={12} aria-hidden />}
                    onClick={() => handleFastTrack(item.id)}
                    aria-label={`Resolve ${item.id}`}
                    sx={{
                      height: 24,
                      fontSize: 10,
                      fontFamily: ct.mono,
                      textTransform: 'none',
                      bgcolor: isCritical ? ct.danger : '#044ed7',
                      color: '#ffffff',
                      boxShadow: 'none',
                      '&:hover': { bgcolor: isCritical ? '#d32f2f' : '#033da6', boxShadow: 'none' },
                    }}
                  >
                    RESOLVE
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: ct.ok }}>
                    <UserCheck size={12} aria-hidden />
                    <Typography sx={{ fontFamily: ct.mono, fontWeight: 700, fontSize: 10 }}>AUDITED</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Card>
  );
};

export default PrioritizedDecisionQueue;
