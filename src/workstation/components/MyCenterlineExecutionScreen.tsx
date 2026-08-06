import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
﻿import {
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  NotInterested as NotInterestedIcon,
  TaskAlt as TaskAltIcon,
} from '@mui/icons-material';
import {Box, Button, Chip, Paper, TextField, Typography} from '@mui/material';
import {useShiftManagementContext} from '../../shiftManagement/contexts/ShiftManagementContext';

type MyCenterlineExecutionScreenProps = {onBack: () => void};

export default function MyCenterlineExecutionScreen({onBack}: MyCenterlineExecutionScreenProps) {
  const {setIsShiftEntryOpen, setShiftEntryMode} = useShiftManagementContext().logbook;
  const openMaintenanceRequest = () => {
    setShiftEntryMode('maintenance');
    setIsShiftEntryOpen(true);
  };
  const rows = [
    {id: 'CL-1.1', label: 'Main Air Supply', target: 'Target: 85 PSI +/- 5', unit: 'PSI', min: '4 min', ph: 'Enter value (PSI)'},
    {id: 'CL-1.2', label: 'Indexer Speed', target: 'Target: 120 RPM +/- 10', unit: 'RPM', min: '3 min', ph: 'Enter value (RPM)'},
    {id: 'CL-1.3', label: 'Heater Zone 1', target: 'Target: 185 °C +/- 3', unit: '°C', min: '3 min', ph: 'Enter value (°C)'},
  ];
  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 1600, bgcolor: tokenNeutral.lighter, overflowY: 'auto'}}>
      <Paper elevation={0} sx={{borderRadius: 0, borderBottom: `1px solid ${tokenNeutral.dark}`}}>
        <Box sx={{bgcolor: tokenBrand.darkest, color: tokenCommon.white, px: 2, py: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.4}}>
            <Button onClick={onBack} startIcon={<ArrowBackIcon sx={{fontSize: 17}} />} sx={{color: tokenCommon.white, fontWeight: 800, textTransform: 'none'}}>Back</Button>
            <Box sx={{width: 1, height: 34, bgcolor: 'rgba(255,255,255,0.3)'}} />
            <Box>
              <Typography sx={{fontSize: 16, fontWeight: 900, lineHeight: 1.2}}>Centerline Verification - Z1</Typography>
              <Typography sx={{fontSize: 12, color: tokenNeutral.main}}>Line 10 • Zone A Feeder • May 5, 2026 • Delila Bran</Typography>
            </Box>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <Chip icon={<AccessTimeIcon sx={{fontSize: 14}} />} label="Elapsed 00:00:03" sx={{height: 28, bgcolor: tokenNeutral.lighter, color: tokenBrand.main, fontWeight: 800}} />
            <Typography sx={{fontSize: 14, fontWeight: 900}}>Progress 0/8</Typography>
          </Box>
        </Box>
      </Paper>
      <Box sx={{p: 1.4, display: 'grid', gap: 1}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Button variant="outlined" endIcon={<ExpandMoreIcon />} sx={{borderColor: tokenNeutral.dark, minWidth: 220, justifyContent: 'space-between', textTransform: 'none'}}>All Stations</Button>
          <Button variant="contained" size="small" sx={{fontWeight: 800, textTransform: 'none'}}>All</Button>
          <Button size="small" sx={{fontWeight: 800, textTransform: 'none'}}>Running Only</Button>
          <Button size="small" sx={{fontWeight: 800, textTransform: 'none'}}>Stopped Only</Button>
          <Typography sx={{ml: 'auto', color: workstationVisuals.tierTextLabel, fontSize: 13}}>Showing 8 of 8 tasks</Typography>
        </Box>
        {rows.map((row) => (
          <Paper key={row.id} elevation={0} sx={{p: 1.25, borderRadius: 1.2, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap'}}>
                <Chip label="Zone A Main Indexer" size="small" sx={{fontWeight: 700}} />
                <Typography sx={{fontSize: 18, lineHeight: 1, fontWeight: 900, color: tokenBrand.main}}>{row.id}</Typography>
                <Chip label={row.label} size="small" />
                <Chip label="RUNNING / EXTERNAL" size="small" sx={{color: tokenSuccess.darker, fontWeight: 800}} />
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Typography sx={{fontWeight: 900, color: workstationVisuals.textPrimary, fontSize: 14}}>{row.target}</Typography>
                <Chip icon={<AccessTimeIcon sx={{fontSize: 14}} />} label={row.min} size="small" />
              </Box>
            </Box>
            <Typography sx={{mt: 0.7, color: workstationVisuals.textPrimary, fontSize: 15, lineHeight: 1.35}}>Verify {row.label.toLowerCase()} matches production spec. Read value from display.</Typography>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.9}}>
              <TextField size="small" placeholder={row.ph} sx={{width: 320}} />
              <Typography sx={{fontSize: 14, fontWeight: 800, color: workstationVisuals.textSecondary}}>{row.unit}</Typography>
            </Box>
            <Box sx={{mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 0.7, flexWrap: 'wrap'}}>
              <Button variant="outlined" color="error" startIcon={<ErrorOutlineIcon />} size="small" onClick={openMaintenanceRequest} sx={{fontWeight: 800, textTransform: 'none'}}>Report Issue</Button>
              <Button variant="outlined" startIcon={<ChatBubbleOutlineIcon />} size="small" sx={{fontWeight: 800, textTransform: 'none'}}>Comment</Button>
              <Button variant="outlined" color="warning" startIcon={<NotInterestedIcon />} size="small" sx={{fontWeight: 800, textTransform: 'none'}}>Not Applicable</Button>
              <Button variant="contained" startIcon={<TaskAltIcon />} size="small" sx={{fontWeight: 800, textTransform: 'none'}}>Record</Button>
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
