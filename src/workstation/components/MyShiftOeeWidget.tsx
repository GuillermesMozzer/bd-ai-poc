import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {Box, IconButton, Paper, Typography} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  OpenInFull as OpenInFullIcon,
  StarBorder as StarBorderIcon,
} from '@mui/icons-material';

type MyShiftOeeWidgetProps = {
  onExpand?: () => void;
};

function AvgLineSpeedCard() {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        height: 58,
        px: 1,
        pl: 1.45,
        bgcolor: tokenNeutral.lightest,
        border: `1px solid ${tokenNeutral.main}`,
        borderRadius: 1.5,
        boxShadow: '0 2px 7px rgba(20, 36, 70, 0.13)',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 5,
          bgcolor: tokenWarning.dark,
        },
      }}
    >
      <Box sx={{minWidth: 0}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.45}}>
          <Typography sx={{fontSize: {xs: 26, sm: 30}, lineHeight: 1, fontWeight: 400, color: workstationVisuals.tierTextHeading, letterSpacing: 0}}>
            125
          </Typography>
          <Typography sx={{fontSize: 13, lineHeight: 1.2, fontWeight: 400, color: workstationVisuals.tierTextHeading, mt: 0.45}}>
            ppm
          </Typography>
        </Box>
        <Typography sx={{fontSize: 10.5, lineHeight: 1.1, color: workstationVisuals.tierTextHeading, letterSpacing: 0}}>
          AVG Line Speed
        </Typography>
      </Box>
      <Box sx={{minWidth: 62, borderLeft: `1px solid ${tokenNeutral.dark}`, pl: 0.9, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.35}}>
        <Typography sx={{fontSize: 8, lineHeight: 1, fontWeight: 800, color: workstationVisuals.tierTextLabel, letterSpacing: 0.6}}>
          TARGET
        </Typography>
        <Box sx={{px: 0.75, py: 0.2, borderRadius: 3, bgcolor: tokenWarning.dark, color: tokenCommon.white, fontSize: 10, lineHeight: 1.1, fontWeight: 800, whiteSpace: 'nowrap'}}>
          143 ppm
        </Box>
      </Box>
    </Paper>
  );
}

export default function MyShiftOeeWidget({onExpand}: MyShiftOeeWidgetProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        p: 1.5,
        borderRadius: 1.5,
        bgcolor: tokenCommon.white,
        border: `1px solid ${tokenNeutral.main}`,
        boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.06)',
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.3}}>
        <Typography sx={{fontSize: 15, lineHeight: 1, fontWeight: 800, color: workstationVisuals.tierTextHeading}}>
          Shift OEE
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2}}>
          <AutoAwesomeIcon sx={{fontSize: 18, color: tokenInfo.lightest}} />
          <StarBorderIcon sx={{fontSize: 19, color: tokenBrand.main}} />
          <IconButton
            aria-label="Expand shift OEE"
            onClick={onExpand}
            size="small"
            sx={{width: 22, height: 22, p: 0, color: tokenBrand.main}}
          >
            <OpenInFullIcon sx={{fontSize: 18}} />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 1.3, mb: 1.3}}>
        <AvgLineSpeedCard />
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 1.3}}>
        <Paper
          elevation={0}
          sx={{
            position: 'relative',
            height: 172,
            p: 1.45,
            borderRadius: 1.5,
            border: `1px solid ${tokenNeutral.main}`,
            overflow: 'hidden',
            bgcolor: tokenCommon.white,
          }}
        >
          <Typography sx={{fontSize: 15.5, fontWeight: 800, color: workstationVisuals.tierTextHeading, lineHeight: 1}}>
            Shift OEE
          </Typography>
          <AutoAwesomeIcon sx={{position: 'absolute', top: 12, right: 13, color: tokenInfo.lightest, fontSize: 19}} />

          <Box sx={{position: 'absolute', left: 18, right: 18, bottom: 22, height: 112}}>
            <svg viewBox="0 0 190 112" width="100%" height="100%" aria-hidden="true">
              <path d="M 20 92 A 75 75 0 0 1 170 92" fill="none" stroke={tokenNeutral.dark} strokeLinecap="round" strokeWidth="9" />
              <path d="M 20 92 A 75 75 0 0 1 96 18" fill="none" stroke={tokenWarning.dark} strokeLinecap="round" strokeWidth="9" />
              <path d="M 20 92 A 75 75 0 0 1 170 92" fill="none" stroke={tokenSuccess.lighter} strokeDasharray="168 238" strokeDashoffset="-66" strokeLinecap="round" strokeWidth="5" />
              <path d="M 20 92 A 75 75 0 0 1 170 92" fill="none" opacity={0.96} stroke={tokenWarning.dark} strokeDasharray="120 238" strokeDashoffset="-12" strokeLinecap="round" strokeWidth="6" />
              <circle cx="59" cy="34" r="7" fill={tokenCommon.white} stroke={tokenWarning.dark} strokeWidth="5" />
            </svg>
            <Box sx={{position: 'absolute', left: 0, right: 0, top: 58, textAlign: 'center'}}>
              <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 0.25}}>
                <Typography sx={{fontSize: 40, lineHeight: 0.9, fontWeight: 400, color: workstationVisuals.tierTextHeading, letterSpacing: 0}}>
                  35
                </Typography>
                <Typography sx={{fontSize: 17, lineHeight: 1, fontWeight: 300, color: workstationVisuals.tierTextLabel, mt: 0.4}}>
                  %
                </Typography>
              </Box>
              <Typography sx={{fontSize: 10, lineHeight: 1.2, color: tokenWarning.darker, mt: 0.25}}>
                Target: 56%
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Paper>
  );
}
