import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import type {ReactNode} from 'react';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as SparkleIcon,
  OpenInFull as OpenInFullIcon,
} from '@mui/icons-material';

const frameSx = {
  width: '100%',
  height: '100%',
  minHeight: 0,
  p: 1.15,
  borderRadius: 1.8,
  bgcolor: workstationVisuals.tierTextHeading,
  border: '1px solid rgba(103,118,146,0.16)',
  boxShadow: 'none',
  containerType: 'size',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: workstationVisuals.fontFamily,
  overflow: 'hidden',
  '@container (max-width: 260px)': {
    p: 0.85,
  },
  '@container (max-width: 220px)': {
    p: 0.72,
  },
} as const;

const headerActionSx = {
  width: 20,
  height: 20,
  color: workstationVisuals.tierTextMeta,
  p: 0.25,
  '&:hover': {bgcolor: 'rgba(255,255,255,0.04)', color: tokenNeutral.dark},
} as const;

function ControlTowerWidgetFrame({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <Paper elevation={0} sx={frameSx}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.95}}>
        <Typography sx={{fontSize: 'clamp(11px, 6cqw, 13.5px)', lineHeight: 1.08, color: tokenCommon.white, fontWeight: 800}}>
          {title}
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.2}}>
          <IconButton size="small" sx={headerActionSx}>
            <SparkleIcon sx={{fontSize: 12}} />
          </IconButton>
          <IconButton size="small" sx={{...headerActionSx, color: tokenBrand.lighter}}>
            <OpenInFullIcon sx={{fontSize: 12.5}} />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column'}}>
        {children}
      </Box>
    </Paper>
  );
}

function SafetyMetricTile({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        minHeight: 0,
        px: 'clamp(7px, 4cqw, 14px)',
        py: 'clamp(6px, 3.2cqw, 12px)',
        borderRadius: '4px',
        bgcolor: workstationVisuals.tierTextHeading,
        borderLeft: `4px solid ${tokenInfo.light}`,
      }}
    >
      <Typography sx={{fontSize: 'clamp(12px, 7cqw, 15px)', lineHeight: 1, color: tokenCommon.white, fontWeight: 500}}>
        {value}
      </Typography>
      <Typography sx={{fontSize: 'clamp(8px, 4.3cqw, 10px)', lineHeight: 1.15, color: tokenNeutral.main, mt: 0.28}}>
        {label}
      </Typography>
    </Box>
  );
}

export function ControlTowerIncidentsOverviewWidget() {
  return (
    <ControlTowerWidgetFrame title="Incidents Overview">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '110px minmax(0, 1fr)',
          gap: 1.4,
          alignItems: 'center',
          flex: 1,
          minHeight: 0,
          '@container (max-width: 315px)': {
            gridTemplateColumns: '1fr',
            gap: 0.8,
          },
          '@container (max-width: 235px)': {
            gap: 0.6,
          },
        }}
      >
        <Box
          sx={{
            minHeight: 0,
            px: 'clamp(8px, 4.3cqw, 16px)',
            py: 'clamp(7px, 3.6cqw, 12px)',
            borderRadius: '4px',
            bgcolor: tokenWarning.darkest,
            borderLeft: `4px solid ${tokenError.main}`,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography sx={{fontSize: 'clamp(30px, 18cqw, 54px)', lineHeight: 0.86, fontWeight: 500, color: tokenCommon.white}}>
              3
            </Typography>
            <Typography sx={{fontSize: 'clamp(8px, 4cqw, 10px)', lineHeight: 1, color: tokenNeutral.lightest, mt: 0.4}}>
              Incident
            </Typography>
          </Box>
          <Box sx={{textAlign: 'right', pb: 0.2}}>
            <Typography sx={{fontSize: 'clamp(7px, 3cqw, 8px)', lineHeight: 1, color: tokenNeutral.dark, fontWeight: 700}}>
              TARGET
            </Typography>
            <Box sx={{mt: 0.24, ml: 'auto', width: 'clamp(12px, 6cqw, 16px)', height: 'clamp(12px, 6cqw, 16px)', borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.16)', display: 'grid', placeItems: 'center'}}>
              <Typography sx={{fontSize: 'clamp(7px, 3cqw, 8px)', lineHeight: 1, color: tokenCommon.white, fontWeight: 700}}>
                2
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{display: 'grid', gap: 0.55, minHeight: 0}}>
          {[
            {label: 'Fatality', value: '0', width: 36, color: workstationVisuals.tierTextLabel},
            {label: 'Serious Injury', value: '1', width: 72, color: tokenError.main},
            {label: 'Minor Injury', value: '1', width: 100, color: workstationVisuals.tierTextLabel},
            {label: 'Near Miss', value: '1', width: 100, color: workstationVisuals.tierTextLabel},
          ].map((row) => (
            <Box
              key={row.label}
              sx={{
                display: 'grid',
                gridTemplateColumns: '104px minmax(0, 1fr)',
                gap: 0.85,
                alignItems: 'center',
                '@container (max-width: 235px)': {
                  gridTemplateColumns: '1fr',
                  gap: 0.35,
                },
              }}
            >
              <Typography sx={{fontSize: 'clamp(8px, 4.6cqw, 10.9px)', lineHeight: 1, color: tokenNeutral.lighter, fontWeight: 500}}>
                {row.label}
              </Typography>
              <Box sx={{position: 'relative', height: 'clamp(13px, 6cqw, 17px)', borderRadius: '3px', bgcolor: workstationVisuals.tierTextLabel, overflow: 'hidden'}}>
                <Box sx={{position: 'absolute', insetY: 0, left: 0, width: `${row.width}%`, bgcolor: row.color}} />
                <Typography sx={{position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontSize: 'clamp(8px, 4.2cqw, 10px)', lineHeight: 1, color: tokenCommon.white, fontWeight: 700}}>
                  {row.value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </ControlTowerWidgetFrame>
  );
}

export function ControlTowerTrirWidget() {
  return (
    <ControlTowerWidgetFrame title="TRIR">
      <Box
        sx={{
          minHeight: 0,
          px: 'clamp(8px, 4.2cqw, 16px)',
          py: 'clamp(8px, 4cqw, 14px)',
          borderRadius: '4px',
          bgcolor: workstationVisuals.tierTextHeading,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 1,
          flex: 1,
          minWidth: 0,
          '@container (max-width: 220px)': {
            alignItems: 'flex-start',
            flexDirection: 'column',
          },
        }}
      >
        <Box sx={{minWidth: 0}}>
          <Typography sx={{fontSize: 'clamp(30px, 22cqw, 58px)', lineHeight: 0.92, color: tokenCommon.white, fontWeight: 600}}>
            0.02
          </Typography>
          <Typography sx={{fontSize: 'clamp(8px, 4.4cqw, 10.2px)', lineHeight: 1, color: tokenNeutral.main, mt: 0.42}}>
            TRIR Actual
          </Typography>
        </Box>
        <Box sx={{textAlign: 'right', pb: 0.22}}>
          <Typography sx={{fontSize: 'clamp(7px, 3cqw, 8px)', lineHeight: 1, color: tokenNeutral.dark, fontWeight: 700}}>
            TARGET
          </Typography>
          <Typography sx={{fontSize: 'clamp(8px, 4.3cqw, 10.2px)', lineHeight: 1.12, color: tokenCommon.white, fontWeight: 700, mt: 0.18}}>
            0.00
          </Typography>
        </Box>
      </Box>
    </ControlTowerWidgetFrame>
  );
}

export function ControlTowerSafetyTrackingWidget() {
  return (
    <ControlTowerWidgetFrame title="Safety Tracking">
      <Box sx={{display: 'grid', gap: 0.75, flex: 1, minHeight: 0}}>
        <SafetyMetricTile label="Days without incidents" value="2" />
        <SafetyMetricTile label="Longest period without incident" value="100" />
      </Box>
    </ControlTowerWidgetFrame>
  );
}

export function ControlTowerEsosWidget() {
  return (
    <ControlTowerWidgetFrame title="ESOs">
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: 0.7,
          flex: 1,
          minHeight: 0,
          '@container (max-width: 220px)': {
            gridTemplateColumns: '1fr',
          },
        }}
      >
        <SafetyMetricTile label="BBS" value="1.150" />
        <SafetyMetricTile label="Near Miss" value="420" />
        <SafetyMetricTile label="Unsafe Condition" value="200" />
        <SafetyMetricTile label="Safe Condition" value="640" />
      </Box>
    </ControlTowerWidgetFrame>
  );
}
