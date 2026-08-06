import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
﻿import {
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  ChatBubbleOutline as ChatBubbleOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  NotInterested as NotInterestedIcon,
} from '@mui/icons-material';
import {Box, Button, Chip, FormControl, InputLabel, MenuItem, Paper, Select, Typography} from '@mui/material';
import {useState} from 'react';
import {useShiftManagementContext} from '../../shiftManagement/contexts/ShiftManagementContext';

type MyChangeoverExecutionScreenProps = {onBack: () => void};
type ChangeoverGroupId = 'pre_changeover' | 'line_clearance' | 'line_down_changeover' | 'centerline' | 'ramp_up_adjustments';

const changeoverGroups: Array<{id: ChangeoverGroupId; title: string; sub: string; count: string; border: string; bg: string}> = [
  {id: 'pre_changeover', title: 'Pre Changeover', sub: 'External - Preparation', count: '0/10 tasks', border: tokenBrand.lightest, bg: tokenNeutral.lighter},
  {id: 'line_clearance', title: 'Line Clearance', sub: 'Clear previous WO before teardown', count: '0/5 tasks', border: tokenWarning.lighter, bg: tokenNeutral.lightest},
  {id: 'line_down_changeover', title: 'Line Down Changeover', sub: 'Internal - While Line is Stopped', count: '0/11 tasks', border: tokenWarning.lighter, bg: tokenNeutral.lightest},
  {id: 'centerline', title: 'Centerline', sub: 'Validation - Parameter Stabilization', count: '0/3 tasks', border: tokenNeutral.darker, bg: tokenNeutral.lightest},
  {id: 'ramp_up_adjustments', title: 'Ramp Up & Adjustments', sub: 'Return to Nominal Production', count: '0/4 tasks', border: tokenWarning.lighter, bg: tokenNeutral.lightest},
];

const tasksByGroup: Record<ChangeoverGroupId, Array<{id: string; txt: string; chips: string[]}>> = {
  pre_changeover: [
    {id: '1.1', txt: 'Prepare paperwork for new work order.', chips: ['Z1 Cutter', 'Operator']},
    {id: '1.2', txt: 'Scan materials to the new work order.', chips: ['Z1 Cutter', 'QS3-0148-WI-001']},
    {id: '1.6', txt: 'Ensure tools needed are available before line clearance.', chips: ['Z1 Cutter', 'Operator']},
  ],
  line_clearance: [
    {id: '2.1', txt: 'Verify Z1 is purged of previous work order.', chips: ['Z1 Cutter', 'Requires Verification']},
    {id: '2.2', txt: 'Empty hopper and ensure drums are clear of cannula from previous work order.', chips: ['Z1 Cutter', 'Z1.C42']},
    {id: '2.3', txt: 'Remove all previous work order paperwork and prepare paperwork for the next work order.', chips: ['Z1 Cutter', 'Z1']},
    {id: '2.4', txt: 'Clean entire Z1.', chips: ['Z1 Cutter', 'Requires Verification']},
  ],
  line_down_changeover: [
    {id: '3.1', txt: 'Purge out zone and record stop time.', chips: ['Z1 Cutter', 'AU-30']},
    {id: '3.6', txt: 'Remove flare blocks.', chips: ['Z1 Cutter', 'AU-30']},
    {id: '3.12', txt: 'Load new wedges into the wedge bowl.', chips: ['Z1 Cutter', 'Operator']},
  ],
  centerline: [
    {id: '4.1', txt: 'Measure equipment temperature and confirm it is within centerline range.', chips: ['Z1 Cutter', 'QA']},
    {id: '4.2', txt: 'Measure pneumatic pressure and compare against centerline target.', chips: ['Z1 Cutter', 'Operator']},
    {id: '4.3', txt: 'Measure equipment speed and verify centerline stability.', chips: ['Z1 Cutter', 'QA']},
  ],
  ramp_up_adjustments: [
    {id: '5.1', txt: 'Record end time of the changeover and complete bottom portion of checklist.', chips: ['Z1 Cutter', 'Operator']},
    {id: '5.3', txt: 'Return previous raw materials to Kanban racks.', chips: ['Z1 Cutter', 'QS3-0148-WI-001']},
    {id: '5.4', txt: 'Return previous work order folder to PCO.', chips: ['Z1 Cutter', 'Operator']},
  ],
};

export default function MyChangeoverExecutionScreen({onBack}: MyChangeoverExecutionScreenProps) {
  const [activeGroupId, setActiveGroupId] = useState<ChangeoverGroupId>('pre_changeover');
  const {setIsShiftEntryOpen, setShiftEntryMode} = useShiftManagementContext().logbook;
  const openMaintenanceRequest = () => {
    setShiftEntryMode('maintenance');
    setIsShiftEntryOpen(true);
  };
  const activeGroup = changeoverGroups.find((group) => group.id === activeGroupId) ?? changeoverGroups[0];
  const activeTasks = tasksByGroup[activeGroupId];

  return (
    <Box sx={{position: 'fixed', inset: 0, zIndex: 1600, bgcolor: tokenNeutral.lighter, overflowY: 'auto'}}>
      <Paper elevation={0} sx={{borderRadius: 0, borderBottom: `1px solid ${tokenNeutral.dark}`}}>
        <Box sx={{bgcolor: tokenBrand.darkest, color: tokenCommon.white, px: 2, py: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1.4}}>
            <Button onClick={onBack} startIcon={<ArrowBackIcon sx={{fontSize: 17}} />} sx={{color: tokenCommon.white, fontWeight: 800, textTransform: 'none'}}>Back</Button>
            <Box sx={{width: 1, height: 34, bgcolor: 'rgba(255,255,255,0.3)'}} />
            <Box>
              <Typography sx={{fontSize: 16, fontWeight: 900, lineHeight: 1.2}}>Changeover</Typography>
              <Typography sx={{fontSize: 12, color: tokenNeutral.main}}>Gauge and Length Setup Checklist • Z1 • Line 10</Typography>
            </Box>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
            <Chip icon={<AccessTimeIcon sx={{fontSize: 14}} />} label="00:32" sx={{height: 28, bgcolor: tokenNeutral.lightest, color: tokenBrand.darker, fontWeight: 800}} />
            <Chip label={activeGroup.count.replace('tasks', 'Tasks')} sx={{height: 28, bgcolor: tokenNeutral.lightest, color: tokenBrand.darker, fontWeight: 800}} />
          </Box>
        </Box>
      </Paper>

      <Box sx={{p: 1.4}}>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'minmax(260px, 360px) minmax(0, 1fr)'}, gap: 1, alignItems: 'center', mb: 1}}>
          <FormControl size="small" fullWidth>
            <InputLabel>Changeover group</InputLabel>
            <Select label="Changeover group" value={activeGroupId} onChange={(event) => setActiveGroupId(event.target.value as ChangeoverGroupId)}>
              {changeoverGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>{group.title}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Paper elevation={0} sx={{p: 1, borderRadius: 1.2, border: `1px solid ${activeGroup.border}`, bgcolor: activeGroup.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
            <Box>
              <Typography sx={{fontSize: 15, fontWeight: 900, color: tokenBrand.darker}}>{activeGroup.title}</Typography>
              <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextLabel}}>{activeGroup.sub}</Typography>
            </Box>
            <Chip label={activeGroup.count} size="small" sx={{fontWeight: 800}} />
          </Paper>
        </Box>

        <Box sx={{display: 'grid', gap: 0.9}}>
          {activeTasks.map((row) => (
            <Paper key={row.id} elevation={0} sx={{p: 1.15, borderRadius: 1.2, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, mb: 0.45, flexWrap: 'wrap'}}>
                <Typography sx={{fontSize: 18, fontWeight: 900, lineHeight: 1}}>{row.id}</Typography>
                {row.chips.map((chip) => <Chip key={`${row.id}-${chip}`} label={chip} size="small" />)}
              </Box>
              <Typography sx={{fontSize: 15, color: workstationVisuals.textPrimary}}>{row.txt}</Typography>
              <Box sx={{mt: 1, display: 'flex', justifyContent: 'flex-end', gap: 0.7, flexWrap: 'wrap'}}>
                <Button size="small" variant="outlined" color="error" startIcon={<ErrorOutlineIcon />} onClick={openMaintenanceRequest} sx={{fontWeight: 800, textTransform: 'none'}}>Report Issue</Button>
                <Button size="small" variant="outlined" startIcon={<ChatBubbleOutlineIcon />} sx={{fontWeight: 800, textTransform: 'none'}}>Comment</Button>
                <Button size="small" variant="outlined" color="warning" startIcon={<NotInterestedIcon />} sx={{fontWeight: 800, textTransform: 'none'}}>Not Applicable</Button>
                <Button size="small" variant="contained" startIcon={<CheckCircleOutlineIcon />} sx={{fontWeight: 800, textTransform: 'none'}}>Complete</Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
