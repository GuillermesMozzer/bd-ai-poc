import {Box, Chip, Typography} from '@mui/material';
import {ArrowForwardIos as ArrowForwardIosIcon} from '@mui/icons-material';
import {workstationChartSemantic, workstationVisuals} from '../theme';
import WidgetShell from './WidgetShell';

export default function WorkstationLineStatusWidget() {
  return (
    <WidgetShell title="Line Status" noPadding>
      {/* Full-bleed background image */}
      <Box
        component="img"
        src="/images/Line.png"
        alt="Line Overview"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />

      {/* Content overlays */}
      <Box sx={{position: 'relative', zIndex: 1, width: '100%', height: '100%'}}>

        {/* Info panel — top-left */}
        <Box
          sx={{
            position: 'absolute',
            top: 48,
            left: 12,
            p: 1.25,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(4px)',
            border: `1px solid ${workstationVisuals.tierBorder}`,
            boxShadow: workstationVisuals.tierShadow,
            minWidth: 180,
          }}
        >
          <Typography
            sx={{
              color: workstationVisuals.tierTextHeading,
              fontSize: '0.78rem',
              fontWeight: 700,
              mb: 0.25,
              fontFamily: workstationVisuals.fontFamily,
            }}
          >
            Equipment:{' '}
            <span style={{fontWeight: 500, color: workstationVisuals.tierTextLabel}}>
              IAG BC Lines
            </span>
          </Typography>
          <Typography
            sx={{
              color: workstationVisuals.tierTextHeading,
              fontSize: '0.78rem',
              fontWeight: 700,
              mb: 0.25,
              fontFamily: workstationVisuals.fontFamily,
            }}
          >
            Product:{' '}
            <span style={{fontWeight: 500, color: workstationVisuals.tierTextLabel}}>
              Autoguard
            </span>
          </Typography>
          <Typography
            sx={{
              color: workstationVisuals.tierTextMeta,
              fontSize: '0.72rem',
              fontWeight: 500,
              fontFamily: workstationVisuals.fontFamily,
            }}
          >
            Zone 1
          </Typography>
        </Box>

        {/* Machine status badges */}
        <MachineStatusBadge machineName="Machine 1" status="BLOCKED" top="10%" right="20%" />
        <MachineStatusBadge machineName="Machine 3" status="RUNNING" top="40%" left="5%" />
        <MachineStatusBadge machineName="Machine 4" status="RUNNING" bottom="15%" left="35%" />
      </Box>
    </WidgetShell>
  );
}

// ─── Helper component ────────────────────────────────────────────────────────

function MachineStatusBadge({
  machineName,
  status,
  top,
  left,
  right,
  bottom,
}: {
  machineName: string;
  status: 'RUNNING' | 'BLOCKED';
  top?: string | number;
  left?: string | number;
  right?: string | number;
  bottom?: string | number;
}) {
  const isRunning = status === 'RUNNING';

  return (
    <Box
      sx={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        p: 1.25,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        bgcolor: 'rgba(255,255,255,0.96)',
        backdropFilter: 'blur(4px)',
        border: `1px solid ${workstationVisuals.tierBorder}`,
        boxShadow: workstationVisuals.tierShadow,
        cursor: 'pointer',
        transition: 'transform 0.18s ease',
        '&:hover': {transform: 'scale(1.04)'},
      }}
    >
      <Box>
        <Typography
          sx={{
            color: workstationVisuals.tierTextHeading,
            fontWeight: 700,
            fontSize: '0.82rem',
            mb: 0.4,
            fontFamily: workstationVisuals.fontFamily,
          }}
        >
          {machineName}
        </Typography>
        <Chip
          label={status}
          size="small"
          sx={{
            bgcolor: isRunning ? workstationChartSemantic.good : workstationChartSemantic.bad,
            color: workstationVisuals.tierSurface,
            fontWeight: 800,
            fontSize: '0.65rem',
            fontFamily: workstationVisuals.fontFamily,
            height: 18,
            '& .MuiChip-label': {px: 0.75},
          }}
        />
      </Box>

      {/* Navigate arrow */}
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          bgcolor: workstationVisuals.blue,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <ArrowForwardIosIcon sx={{color: workstationVisuals.tierSurface, fontSize: '0.65rem'}} />
      </Box>
    </Box>
  );
}
