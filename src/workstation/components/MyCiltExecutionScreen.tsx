import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
﻿import {
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  NotInterested as NotInterestedIcon,
} from '@mui/icons-material';
import {Box, Button, Chip, Paper, Typography} from '@mui/material';
import {useShiftManagementContext} from '../../shiftManagement/contexts/ShiftManagementContext';

type MyCiltExecutionScreenProps = {onBack: () => void};

export default function MyCiltExecutionScreen({onBack}: MyCiltExecutionScreenProps) {
  const {setIsShiftEntryOpen, setShiftEntryMode} = useShiftManagementContext().logbook;
  const openMaintenanceRequest = () => {
    setShiftEntryMode('maintenance');
    setIsShiftEntryOpen(true);
  };
  const rows = [
    {id: 'Z1.1', text: 'Clean outside of guarding (doors). Inspect for damaged or missing guarding, including guard fasteners, gaskets, and safety tape.', state: 'RUNNING / EXTERNAL', min: '10 min'},
    {id: 'Z1.2', text: 'Inspect air gauges and ensure all are reading correct values. Inspect gauges for signs of damage or malfunction.', state: 'RUNNING / EXTERNAL', min: '5 min'},
    {id: 'Z1.3', text: 'Inspect wedge inlines and escapement slide for damage.', state: 'STOPPED / INTERNAL', min: '3 min'},
  ];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 1600, bgcolor: tokenNeutral.lighter, overflowY: 'auto'}}>
      <Paper elevation={0} sx={{borderRadius: 0, borderBottom: `1px solid ${tokenNeutral.dark}`}}>
        <Box sx={{bgcolor: tokenBrand.darkest, color: tokenCommon.white, px: 2, py: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.4}}>
            <Button onClick={onBack} startIcon={<ArrowBackIcon sx={{fontSize: 17}} />} sx={{color: tokenCommon.white, fontWeight: 800, textTransform: 'none'}}>Back</Button>
            <Box sx={{width: 1, height: 34, bgcolor: 'rgba(255,255,255,0.3)'}} />
            <Box>
              <Typography sx={{fontSize: 16, fontWeight: 900, lineHeight: 1.2}}>CILT Execution - Z1</Typography>
              <Typography sx={{fontSize: 12, color: tokenNeutral.main}}>Line 10 • Zone A Feeder • May 5, 2026 • Delila Bran</Typography>
            </Box>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <Chip icon={<AccessTimeIcon sx={{fontSize: 14}} />} label="Elapsed 00:00:02" sx={{height: 28, bgcolor: tokenNeutral.lighter, color: tokenBrand.main, fontWeight: 800}} />
            <Typography sx={{fontSize: 14, fontWeight: 900}}>Progress 0/11</Typography>
          </Box>
        </Box>
      </Paper>
      <Box sx={{p: 1.4, display: 'grid', gap: 1}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Button variant="outlined" endIcon={<ExpandMoreIcon />} sx={{borderColor: tokenNeutral.dark, minWidth: 220, justifyContent: 'space-between', textTransform: 'none'}}>All Stations</Button>
          <Button variant="contained" size="small" sx={{fontWeight: 800, textTransform: 'none'}}>All</Button>
          <Button size="small" sx={{fontWeight: 800, textTransform: 'none'}}>Running Only</Button>
          <Button size="small" sx={{fontWeight: 800, textTransform: 'none'}}>Stopped Only</Button>
          <Typography sx={{ml: 'auto', color: workstationVisuals.tierTextLabel, fontSize: 13}}>Showing 11 of 11 tasks</Typography>
        </Box>
        {rows.map((row) => (
          <Paper key={row.id} elevation={0} sx={{p: 1.25, borderRadius: 1.2, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap'}}>
                <Chip label="Zone A Feeder" size="small" sx={{fontWeight: 700}} />
                <Typography sx={{fontSize: 18, lineHeight: 1, fontWeight: 900, color: tokenBrand.main}}>{row.id}</Typography>
                <Chip label="ALL" size="small" />
                <Chip label={row.id === 'Z1.2' ? 'INSPECT' : 'CLEAN'} size="small" />
                <Chip label={row.state} size="small" sx={{color: row.state.includes('RUNNING') ? tokenSuccess.darker : tokenError.main, fontWeight: 800}} />
              </Box>
              <Chip icon={<AccessTimeIcon sx={{fontSize: 14}} />} label={row.min} size="small" />
            </Box>
            <Typography sx={{mt: 0.7, color: workstationVisuals.textPrimary, fontSize: 15, lineHeight: 1.35}}>{row.text}</Typography>
            <Box sx={{mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 0.7, flexWrap: 'wrap'}}>
              <Button variant="outlined" color="error" startIcon={<ErrorOutlineIcon />} size="small" onClick={openMaintenanceRequest} sx={{fontWeight: 800, textTransform: 'none'}}>Report Issue</Button>
              <Button variant="outlined" startIcon={<ChatBubbleOutlineIcon />} size="small" sx={{fontWeight: 800, textTransform: 'none'}}>Comment</Button>
              <Button variant="outlined" color="warning" startIcon={<NotInterestedIcon />} size="small" sx={{fontWeight: 800, textTransform: 'none'}}>Not Applicable</Button>
              <Button variant="contained" startIcon={<CheckCircleOutlineIcon />} size="small" sx={{fontWeight: 800, textTransform: 'none'}}>Complete</Button>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
