import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {ArrowBack as ArrowBackIcon, CalendarToday as CalendarTodayIcon, PlayArrow as PlayArrowIcon, Room as RoomIcon} from '@mui/icons-material';
import {Box, Button, Chip, Paper, Typography} from '@mui/material';

type MyEquipmentChangeoverExpandedProps = {
  onBack: () => void;
  onStartChangeover: () => void;
};

export default function MyEquipmentChangeoverExpanded({onBack, onStartChangeover}: MyEquipmentChangeoverExpandedProps) {
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
              <Typography sx={{fontSize: 16, fontWeight: 900, lineHeight: 1}}>Equipment Setup Changeover</Typography>
            </Box>
            <Paper elevation={0} sx={{px: 1.3, py: 0.6, borderRadius: 1.2, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white}}>
              <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenWarning.dark, display: 'inline'}}>Pending: 1</Typography>
              <Typography component="span" sx={{mx: 0.8}} />
              <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenSuccess.darker, display: 'inline'}}>Done: 0</Typography>
            </Paper>
          </Box>

          <Box sx={{p: 2}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, mb: 1.2}}>
              <CalendarTodayIcon sx={{fontSize: 18, color: workstationVisuals.textSecondary}} />
              <Typography sx={{fontSize: 16, fontWeight: 900, color: workstationVisuals.tierTextHeading}}>Today&apos;s Changeover Activities</Typography>
            </Box>

            <Paper elevation={0} sx={{p: 1.2, borderRadius: 1.3, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Chip label="Batch CO" size="small" sx={{bgcolor: tokenError.lightest, color: tokenError.main, fontWeight: 900}} />
                <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenBrand.darkest}}>AFA1-10 Zone 1</Typography>
                <RoomIcon sx={{fontSize: 14, color: workstationVisuals.tierTextMeta}} />
                <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary}}>Z1</Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Typography sx={{fontSize: 14, fontWeight: 900, color: workstationVisuals.textPrimary}}>14:30</Typography>
                <Button onClick={onStartChangeover} variant="contained" size="small" startIcon={<PlayArrowIcon />} sx={{fontWeight: 900, borderRadius: 1.8, px: 1.8}}>Start</Button>
              </Box>
            </Paper>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
