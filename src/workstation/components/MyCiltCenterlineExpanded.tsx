import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
﻿import {ArrowBack as ArrowBackIcon, PlayArrow as PlayArrowIcon, Refresh as RefreshIcon, Room as RoomIcon} from '@mui/icons-material';
import {Box, Button, Chip, Paper, Typography} from '@mui/material';

type MyCiltCenterlineExpandedProps = {
  onBack: () => void;
  onStartCilt: () => void;
  onStartCenterline: () => void;
};

const rowSx = {
  p: 1.2,
  borderRadius: 1.3,
  border: `1px solid ${tokenNeutral.dark}`,
  bgcolor: tokenCommon.white,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 1,
} as const;

export default function MyCiltCenterlineExpanded({onBack, onStartCilt, onStartCenterline}: MyCiltCenterlineExpandedProps) {
  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 1500, overflowY: 'auto', bgcolor: tokenNeutral.main}}>
      <Box sx={{p: 1.2}}>
        <Paper elevation={0} sx={{borderRadius: 2.2, border: `1px solid ${tokenNeutral.dark}`, overflow: 'hidden'}}>
          <Box sx={{bgcolor: tokenBrand.darkest, color: tokenCommon.white, px: 2, py: 1.3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1.6}}>
              <Button onClick={onBack} startIcon={<ArrowBackIcon sx={{fontSize: 18}} />} sx={{color: tokenCommon.white, fontWeight: 800, textTransform: 'none', minWidth: 0, px: 0.4}}>
                Back
              </Button>
              <Box sx={{width: 1, height: 40, bgcolor: 'rgba(255,255,255,0.3)'}} />
              <Box>
                <Typography sx={{fontSize: 16, fontWeight: 900, lineHeight: 1}}>CILT & Centerline</Typography>
                <Typography sx={{fontSize: 12, color: tokenNeutral.main, lineHeight: 1.1}}>Delila Bran • Zone A • CILT Tasks & History</Typography>
              </Box>
            </Box>
            <Paper elevation={0} sx={{px: 1.3, py: 0.6, borderRadius: 1.2, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white}}>
              <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenWarning.dark, display: 'inline'}}>Pending: 3</Typography>
              <Typography component="span" sx={{mx: 0.8, color: workstationVisuals.textMuted, fontWeight: 700}}> </Typography>
              <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenSuccess.darker, display: 'inline'}}>Done: 1</Typography>
            </Paper>
          </Box>

          <Box sx={{p: 2, display: 'grid', gap: 1.3}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
              <RefreshIcon sx={{fontSize: 18, color: tokenBrand.main}} />
              <Typography sx={{fontSize: 16, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>Today&apos;s CILT Tasks</Typography>
              <Chip size="small" label="1 tasks" sx={{fontWeight: 800, bgcolor: tokenNeutral.lighter, color: tokenBrand.main}} />
            </Box>
            <Paper elevation={0} sx={rowSx}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Chip label="CIL" size="small" sx={{bgcolor: tokenNeutral.main, color: tokenBrand.main, fontWeight: 900}} />
                <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenBrand.darkest}}>AFA1-10 Zone 1</Typography>
                <RoomIcon sx={{fontSize: 14, color: workstationVisuals.tierTextMeta}} />
                <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary}}>Z1</Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Typography sx={{fontSize: 14, fontWeight: 900, color: workstationVisuals.textPrimary}}>10:00</Typography>
                <Chip label="scheduled" size="small" sx={{bgcolor: tokenNeutral.lighter, color: workstationVisuals.textSecondary, fontWeight: 800}} />
                <Button onClick={onStartCilt} variant="contained" size="small" startIcon={<PlayArrowIcon />} sx={{fontWeight: 900, borderRadius: 1.8}}>Start CILT</Button>
              </Box>
            </Paper>

            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, mt: 1}}>
              <RefreshIcon sx={{fontSize: 18, color: tokenWarning.dark}} />
              <Typography sx={{fontSize: 16, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>Today&apos;s CL Tasks</Typography>
              <Chip size="small" label="3 tasks" sx={{fontWeight: 800, bgcolor: tokenNeutral.lighter, color: tokenBrand.main}} />
            </Box>
            {[
              {name: 'Z1 Main Indexer', zone: 'Z1', time: '09:30', status: 'completed'},
              {name: 'Z2 Tipper Unit', zone: 'Z2', time: '11:00', status: 'scheduled'},
              {name: 'Z3 Assembly Press', zone: 'Z3', time: '14:30', status: 'scheduled'},
            ].map((task) => (
              <Paper key={task.name} elevation={0} sx={{...rowSx, borderColor: task.status === 'completed' ? tokenSuccess.lightest : tokenNeutral.dark, bgcolor: task.status === 'completed' ? tokenNeutral.lightest : tokenCommon.white}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                  <Chip label="CL" size="small" sx={{bgcolor: tokenWarning.lightest, color: tokenWarning.dark, fontWeight: 900}} />
                  <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenBrand.darkest}}>{task.name}</Typography>
                  <RoomIcon sx={{fontSize: 14, color: workstationVisuals.tierTextMeta}} />
                  <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary}}>{task.zone}</Typography>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                  <Typography sx={{fontSize: 14, fontWeight: 900, color: workstationVisuals.textPrimary}}>{task.time}</Typography>
                  <Chip label={task.status} size="small" sx={{bgcolor: task.status === 'completed' ? tokenNeutral.main : tokenNeutral.lighter, color: task.status === 'completed' ? tokenSuccess.darker : workstationVisuals.textSecondary, fontWeight: 800}} />
                  {task.status === 'scheduled' ? <Button onClick={onStartCenterline} variant="contained" size="small" startIcon={<PlayArrowIcon />} sx={{fontWeight: 900, borderRadius: 1.8}}>Start CL</Button> : null}
                </Box>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
