import React, { useMemo, useState } from 'react';
import { Avatar, Box, Button, Chip, LinearProgress, Paper, Typography } from '@mui/material';
import { AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { appendAudit, updatePallet } from '../data/reactiveLogisticsDemo';
import { useCtV2Filters } from '../ctV2/CtV2FiltersContext';
import {
  ctV2Type,
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenError,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
  workstationTierCardSx,
  workstationVisuals,
} from '../ctV2Theme';

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
  const { sitesLabel, periodLabel, scaleCount } = useCtV2Filters();
  const [decisions, setDecisions] = useState<DecisionItem[]>(() =>
    [...INITIAL_DECISIONS].sort((a, b) => a.minutesToStop - b.minutesToStop),
  );

  const openCount = useMemo(() => decisions.filter((d) => d.status !== 'RESOLVED').length, [decisions]);
  const displayOpenCount = scaleCount(Math.max(1, openCount));

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
    <Paper
      component="section"
      elevation={0}
      aria-labelledby="decision-queue-heading"
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
        <Typography id="decision-queue-heading" component="h2" sx={{ ...ctV2Type.sectionTitle, color: tokenText.primary }}>
          Prioritized Decision Queue (DA)
        </Typography>
        <Chip
          label={`${displayOpenCount} open · ${sitesLabel} · ${periodLabel}`}
          size="small"
          sx={{
            bgcolor: tokenWarning.softBg,
            color: tokenWarning.dark,
            fontSize: 10,
            fontWeight: 800,
            height: 22,
            fontFamily: workstationVisuals.fontFamily,
          }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
        {decisions.map((item) => {
          const isCritical = item.severity === 'CRITICAL';
          const isHigh = item.severity === 'HIGH';
          const isResolved = item.status === 'RESOLVED';
          const severityColor = isCritical ? tokenError.main : isHigh ? tokenWarning.main : tokenNeutral.darker;

          return (
            <Box
              key={item.id}
              sx={{
                p: 1.35,
                borderRadius: '10px',
                bgcolor: isResolved ? tokenSuccess.softBg : tokenNeutral.lightest,
                border: `1px solid ${isResolved ? tokenSuccess.lighter : workstationVisuals.tierBorder}`,
                borderLeft: `4px solid ${isResolved ? tokenSuccess.main : severityColor}`,
                opacity: isResolved ? 0.82 : 1,
                transition: 'background-color 0.2s ease',
                '&:hover': { bgcolor: isResolved ? tokenSuccess.softBg : 'var(--surface-hover-bg)' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75, gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ ...ctV2Type.body, color: tokenText.primary, fontWeight: 800, mb: 0.35 }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, display: 'block' }}>
                    {item.material} · {item.sapDoc}
                  </Typography>
                </Box>
                <Chip
                  label={item.status}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: 9,
                    fontWeight: 800,
                    bgcolor: isResolved ? tokenSuccess.softBg : tokenBrand.softBg,
                    color: isResolved ? tokenSuccess.dark : tokenBrand.main,
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
                  bgcolor: 'background.paper',
                  border: `1px solid ${tokenDivider}`,
                  p: 1,
                  borderRadius: '8px',
                }}
              >
                <AlertTriangle size={14} color="currentColor" style={{ color: 'var(--token-error-main)' }} aria-hidden />
                <Typography sx={{ ...ctV2Type.caption, color: tokenError.dark, fontWeight: 800 }}>
                  {item.impact}
                </Typography>
              </Box>

              {!isResolved && (
                <Box sx={{ mt: 1 }}>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary, display: 'block', mb: 0.5 }}>
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
                        bgcolor: tokenNeutral.lighter,
                        '& .MuiLinearProgress-bar': { bgcolor: severityColor },
                      }}
                    />
                    <Typography sx={{ ...ctV2Type.mono, color: severityColor, minWidth: 40, textAlign: 'right' }}>
                      {item.minutesToStop}m
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.25, gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                  <Avatar
                    sx={{
                      width: 22,
                      height: 22,
                      fontSize: 9,
                      fontWeight: 800,
                      bgcolor: tokenBrand.softBg,
                      color: tokenBrand.main,
                      border: `1px solid ${tokenBrand.lighter}`,
                    }}
                  >
                    {item.ownerInitials}
                  </Avatar>
                  <Typography sx={{ ...ctV2Type.caption, color: tokenText.secondary }} noWrap>
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
                      height: 28,
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'none',
                      borderRadius: 999,
                      bgcolor: isCritical ? tokenError.main : tokenBrand.main,
                      color: tokenCommon.white,
                      boxShadow: 'none',
                      '&:hover': {
                        bgcolor: isCritical ? tokenError.dark : tokenBrand.dark,
                        boxShadow: 'none',
                      },
                    }}
                  >
                    Resolve
                  </Button>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: tokenSuccess.dark }}>
                    <UserCheck size={12} aria-hidden />
                    <Typography sx={{ ...ctV2Type.caption, fontWeight: 800, color: tokenSuccess.dark }}>Audited</Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

export default PrioritizedDecisionQueue;
