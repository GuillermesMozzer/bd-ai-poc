import {useMemo, useState} from 'react';
import {Box, ButtonBase, IconButton, Typography} from '@mui/material';
import {
  NorthEast as NorthEastIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenWarning,
  workstationVisuals,
} from '../theme';
import type {WorkstationWidgetProps} from '../types';
import WidgetShell from './WidgetShell';

type CavityStatus = 'Available' | 'Maintenance' | 'Blocked' | 'Inspection';

type Cavity = {
  id: string;
  status: CavityStatus;
  lastCheck: string;
};

type MoldingAsset = {
  id: string;
  name: string;
  cavityAvailability: number;
  status: CavityStatus;
  cavities: Cavity[];
};

const moldingAssets: MoldingAsset[] = [
  {
    id: 'mld-104',
    name: 'Molding M-104',
    cavityAvailability: 98.2,
    status: 'Available',
    cavities: [
      {id: 'C01', status: 'Available', lastCheck: '08:12'},
      {id: 'C02', status: 'Available', lastCheck: '08:14'},
      {id: 'C03', status: 'Inspection', lastCheck: '08:21'},
      {id: 'C04', status: 'Available', lastCheck: '08:23'},
    ],
  },
  {
    id: 'mld-118',
    name: 'Molding M-118',
    cavityAvailability: 94.6,
    status: 'Inspection',
    cavities: [
      {id: 'C01', status: 'Available', lastCheck: '09:04'},
      {id: 'C02', status: 'Inspection', lastCheck: '09:09'},
      {id: 'C03', status: 'Available', lastCheck: '09:11'},
      {id: 'C04', status: 'Maintenance', lastCheck: '09:18'},
    ],
  },
  {
    id: 'mld-122',
    name: 'Molding M-122',
    cavityAvailability: 91.8,
    status: 'Maintenance',
    cavities: [
      {id: 'C01', status: 'Available', lastCheck: '10:02'},
      {id: 'C02', status: 'Maintenance', lastCheck: '10:07'},
      {id: 'C03', status: 'Maintenance', lastCheck: '10:09'},
      {id: 'C04', status: 'Available', lastCheck: '10:16'},
    ],
  },
  {
    id: 'mld-131',
    name: 'Molding M-131',
    cavityAvailability: 88.9,
    status: 'Blocked',
    cavities: [
      {id: 'C01', status: 'Blocked', lastCheck: '10:36'},
      {id: 'C02', status: 'Available', lastCheck: '10:41'},
      {id: 'C03', status: 'Inspection', lastCheck: '10:44'},
      {id: 'C04', status: 'Blocked', lastCheck: '10:47'},
    ],
  },
];

function statusTone(status: CavityStatus) {
  if (status === 'Available') return {bg: tokenSuccess.lightest, fg: tokenSuccess.darker, border: tokenSuccess.lighter};
  if (status === 'Maintenance') return {bg: tokenWarning.softBg, fg: tokenWarning.main, border: tokenWarning.lighter};
  if (status === 'Blocked') return {bg: tokenError.softBg, fg: tokenError.main, border: tokenError.lighter};
  return {bg: tokenInfo.lightest, fg: tokenInfo.darker, border: tokenInfo.lighter};
}

const moldingConditionRank: Record<CavityStatus, number> = {
  Blocked: 0,
  Maintenance: 1,
  Inspection: 2,
  Available: 3,
};

function StatusBadge({status}: {status: CavityStatus}) {
  const tone = statusTone(status);

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 72,
        borderRadius: '999px',
        px: 0.75,
        py: 0.28,
        bgcolor: tone.bg,
        color: tone.fg,
        border: `1px solid ${tone.border}`,
        fontSize: '0.62rem',
        fontWeight: 800,
        lineHeight: 1,
        fontFamily: workstationVisuals.fontFamily,
      }}
    >
      {status}
    </Box>
  );
}

export default function MoldingWidget({className, style, onExpand}: WorkstationWidgetProps) {
  const [selectedMoldingId, setSelectedMoldingId] = useState(moldingAssets[1].id);
  const selectedMolding = moldingAssets.find((asset) => asset.id === selectedMoldingId) ?? moldingAssets[0];
  const totalCavityAvailability = useMemo(
    () => moldingAssets.reduce((total, asset) => total + asset.cavityAvailability, 0) / moldingAssets.length,
    [],
  );
  const sortedMoldingAssets = useMemo(
    () => [...moldingAssets].sort((left, right) => {
      const conditionComparison = moldingConditionRank[left.status] - moldingConditionRank[right.status];

      if (conditionComparison !== 0) return conditionComparison;

      return left.cavityAvailability - right.cavityAvailability;
    }),
    [],
  );

  const headerAction = onExpand ? (
    <IconButton size="small" aria-label="Open Maintenance Analytics" onClick={onExpand} sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}>
      <NorthEastIcon sx={{fontSize: 18}} />
    </IconButton>
  ) : null;

  return (
    <WidgetShell title="Molding" action={headerAction} className={className} style={style}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.1, minHeight: 0, overflow: 'auto', pr: 0.2}}>
        <Box
          sx={{
            border: `1px solid ${tokenSuccess.lighter}`,
            borderRadius: '8px',
            bgcolor: tokenSuccess.lightest,
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.2,
          }}
        >
          <Box sx={{minWidth: 0}}>
            <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4, fontFamily: workstationVisuals.fontFamily}}>
              Total Cavity Availability
            </Typography>
            <Typography sx={{fontSize: '1.46rem', color: tokenSuccess.darker, fontWeight: 850, lineHeight: 1.02, mt: 0.45, fontFamily: workstationVisuals.fontFamily}}>
              {totalCavityAvailability.toFixed(1)}%
            </Typography>
          </Box>
          <Typography sx={{fontSize: '0.7rem', color: tokenSuccess.darker, fontWeight: 800, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
            +1.4 pp
          </Typography>
        </Box>

        <Box>
          <Typography sx={{fontSize: '0.82rem', fontWeight: 700, color: workstationVisuals.textPrimary, mb: 0.8, fontFamily: workstationVisuals.fontFamily}}>
            Moldings with Cavity %
          </Typography>
          <Box sx={{display: 'grid', gap: 0.65}}>
            {sortedMoldingAssets.map((asset) => {
              const isSelected = asset.id === selectedMolding.id;
              const tone = statusTone(asset.status);

              return (
                <ButtonBase
                  key={asset.id}
                  onClick={() => setSelectedMoldingId(asset.id)}
                  aria-pressed={isSelected}
                  sx={{
                    display: 'block',
                    width: '100%',
                    border: isSelected ? `1px solid ${tokenBrand.main}` : `1px solid ${workstationVisuals.tierBorder}`,
                    borderRadius: '8px',
                    bgcolor: isSelected ? tokenNeutral.lightest : tokenCommon.white,
                    p: 0.85,
                    textAlign: 'left',
                    transition: 'border-color 140ms ease, box-shadow 140ms ease, background-color 140ms ease',
                    boxShadow: isSelected ? `inset 0 0 0 1px ${tokenBrand.main}` : 'none',
                    '&:hover': {borderColor: tokenBrand.main, bgcolor: tokenNeutral.lightest},
                    '&:focus-visible': {outline: `2px solid ${tokenBrand.main}`, outlineOffset: 2},
                  }}
                >
                  <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 0.85}}>
                    <Box sx={{minWidth: 0}}>
                      <Typography sx={{fontSize: '0.74rem', color: workstationVisuals.textPrimary, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily}}>
                        {asset.name}
                      </Typography>
                      <Box sx={{height: 5, borderRadius: 999, bgcolor: 'rgba(15, 23, 42, 0.08)', overflow: 'hidden', mt: 0.55}}>
                        <Box sx={{height: '100%', width: `${asset.cavityAvailability}%`, borderRadius: 999, bgcolor: tone.fg}} />
                      </Box>
                    </Box>
                    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.35}}>
                      <Typography sx={{fontSize: '0.82rem', color: tone.fg, fontWeight: 900, lineHeight: 1, fontFamily: workstationVisuals.fontFamily}}>
                        {asset.cavityAvailability.toFixed(1)}%
                      </Typography>
                      <StatusBadge status={asset.status} />
                    </Box>
                  </Box>
                </ButtonBase>
              );
            })}
          </Box>
        </Box>

        <Box sx={{minHeight: 0}}>
          <Typography sx={{fontSize: '0.82rem', fontWeight: 700, color: workstationVisuals.textPrimary, mb: 0.8, fontFamily: workstationVisuals.fontFamily}}>
            {selectedMolding.name} Cavities
          </Typography>
          <Box sx={{border: `1px solid ${workstationVisuals.tierBorder}`, borderRadius: '8px', overflow: 'hidden', bgcolor: tokenCommon.white}}>
            {selectedMolding.cavities.map((cavity) => (
              <Box
                key={`${selectedMolding.id}-${cavity.id}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '54px minmax(0, 1fr) auto',
                  alignItems: 'center',
                  gap: 0.75,
                  px: 0.9,
                  py: 0.72,
                  borderTop: `1px solid ${workstationVisuals.tierBorder}`,
                  '&:first-of-type': {borderTop: 0},
                }}
              >
                <Typography sx={{fontSize: '0.72rem', color: workstationVisuals.textPrimary, fontWeight: 850, fontFamily: workstationVisuals.fontFamily}}>
                  {cavity.id}
                </Typography>
                <StatusBadge status={cavity.status} />
                <Typography sx={{fontSize: '0.64rem', color: workstationVisuals.textSecondary, fontWeight: 700, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
                  {cavity.lastCheck}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </WidgetShell>
  );
}
