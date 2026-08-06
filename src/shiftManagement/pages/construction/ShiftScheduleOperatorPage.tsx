import React from 'react';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CalendarMonth as CalendarMonthIcon,
  EventRepeat as EventRepeatIcon,
  FiberManualRecord as FiberManualRecordIcon,
  NotificationsActive as NotificationsActiveIcon,
  SwapHoriz as SwapHorizIcon,
  TimeToLeave as TimeOffIcon,
} from '@mui/icons-material';
import { activeTheme } from '../../../theme';
import { useShiftManagementContext } from '../../contexts/ShiftManagementContext';
import { teamManagementMembers } from '../../data/teamData';
import { useAuthContext } from '../../../auth/contexts/AuthContext';

type CalendarMode = 'Today' | 'Week' | 'Month';

const preferenceOptions = ['Prefer Morning', 'Prefer Afternoon', 'Prefer Night'] as const;
const timeOffTypeOptions = ['Vacation', 'Personal Leave', 'Medical Leave', 'Unpaid Leave', 'Other'] as const;

const crewByLineShift: Record<string, string> = {
  'A-Morning': 'Crew A',
  'A-Afternoon': 'Crew B',
  'A-Night': 'Crew C',
  'B-Morning': 'Crew B',
  'B-Afternoon': 'Crew C',
  'B-Night': 'Crew D',
};

const lineAreaLabels: Record<string, string> = {
  A: 'Line A',
  B: 'Line B',
};

const statusToneMap: Record<string, { bg: string; fg: string }> = {
  available: { bg: '#ECFDF5', fg: '#15803D' },
  break: { bg: '#FEF3C7', fg: '#B45309' },
  lunch: { bg: '#FFF7ED', fg: '#C2410C' },
  out: { bg: '#FEF2F2', fg: '#DC2626' },
};

const requestStatusToneMap: Record<string, { bg: string; fg: string }> = {
  Requested: { bg: '#FFF7ED', fg: '#C2410C' },
  Approved: { bg: '#ECFDF5', fg: '#15803D' },
  Rejected: { bg: '#FEF2F2', fg: '#DC2626' },
};

const operatorRequestDialogPaperSx = {
  borderRadius: 2,
  overflow: 'hidden',
};

const operatorRequestDialogTitleSx = {
  px: 2.6,
  py: 1.8,
  borderBottom: '1px solid #E2E8F0',
  bgcolor: '#F8FBFF',
};

const operatorRequestDialogContentSx = {
  p: 2.4,
  bgcolor: '#FFFFFF',
};

const operatorRequestDialogActionsSx = {
  px: 2.6,
  py: 1.45,
  borderTop: '1px solid #E2E8F0',
  bgcolor: '#F8FAFC',
  justifyContent: 'flex-end',
  gap: 0.8,
};

const operatorRequestHelperTextSx = {
  color: '#64748B',
  fontWeight: 700,
  lineHeight: 1.35,
};

const operatorRequestButtonSx = {
  borderRadius: 2,
  fontWeight: 800,
  textTransform: 'none',
  boxShadow: 'none',
};

export default function ShiftScheduleOperatorPage() {
  const { currentUserName } = useAuthContext();
  const {
    settings: {
      holidayItems,
      shiftRequestItems,
      createShiftRequest,
    },
    renderShiftSchedulePersistentActions,
  } = useShiftManagementContext();

  const employee = React.useMemo(
    () => teamManagementMembers.find((member) => member.name === currentUserName) ?? teamManagementMembers[1],
    [currentUserName],
  );

  const [calendarMode, setCalendarMode] = React.useState<CalendarMode>('Week');
  const [isSwapDialogOpen, setIsSwapDialogOpen] = React.useState(false);
  const [isTimeOffDialogOpen, setIsTimeOffDialogOpen] = React.useState(false);
  const [preferences, setPreferences] = React.useState({
    preferredShift: 'Prefer Morning',
    overtime: true,
    extraCoverage: false,
  });
  const [swapDraft, setSwapDraft] = React.useState({
    shiftDay: employee.weeklySchedule[0]?.day ?? 'Mon',
    shiftHours: employee.weeklySchedule[0]?.hours ?? employee.timeWindow,
    targetEmployee: teamManagementMembers.find((member) => member.name !== employee.name && member.role === employee.role)?.name ?? teamManagementMembers[0].name,
    reason: '',
  });
  const [timeOffDraft, setTimeOffDraft] = React.useState({
    type: 'Vacation',
    startDate: '2026-07-15',
    endDate: '2026-07-19',
    reason: '',
  });

  const currentCrew = crewByLineShift[`${employee.line}-${employee.shift}`] ?? 'Crew B';
  const currentLineLabel = lineAreaLabels[employee.line] ?? `Line ${employee.line}`;
  const currentShiftLabel = `${employee.shift} Shift`;
  const currentStatusTone = statusToneMap[employee.status] ?? { bg: '#F1F5F9', fg: '#475569' };

  const scheduleDays = React.useMemo(
    () => employee.weeklySchedule.map((entry, index) => ({
      id: `${entry.day}-${index}`,
      day: entry.day,
      shift: index === 2 && employee.shift === 'Morning' ? 'Afternoon Shift' : currentShiftLabel,
      crew: index === 2 && currentCrew === 'Crew A' ? 'Crew B' : currentCrew,
      line: index === 2 ? 'Line B' : currentLineLabel,
      hours: entry.hours,
      status: index === 3 ? 'Planned Training' : 'Scheduled',
      note: entry.note,
    })),
    [currentCrew, currentLineLabel, currentShiftLabel, employee.shift, employee.weeklySchedule],
  );

  const scheduleViewItems = React.useMemo(() => {
    if (calendarMode === 'Today') {
      return scheduleDays.slice(0, 1);
    }
    if (calendarMode === 'Week') {
      return scheduleDays;
    }
    return Array.from({ length: 4 }).flatMap((_, weekIndex) =>
      scheduleDays.map((day) => ({
        ...day,
        id: `${day.id}-w${weekIndex + 1}`,
        day: `${day.day} ${weekIndex + 1}`,
      })),
    );
  }, [calendarMode, scheduleDays]);

  const upcomingAssignments = React.useMemo(
    () => scheduleDays.slice(0, 5),
    [scheduleDays],
  );

  const myRequests = React.useMemo(
    () => shiftRequestItems.filter((item) => item.requestedBy === employee.name).slice(0, 6),
    [employee.name, shiftRequestItems],
  );

  const operatorNotifications = React.useMemo(() => {
    const requestNotifications = shiftRequestItems
      .filter((item) => item.requestedBy === employee.name)
      .slice(0, 4)
      .map((item) => ({
        type:
          item.type === 'Shift Swap'
            ? item.status === 'Approved'
              ? 'Swap approved'
              : item.status === 'Rejected'
                ? 'Swap rejected'
                : 'Shift updated'
            : item.status === 'Approved'
              ? 'Leave approved'
              : item.status === 'Rejected'
                ? 'Leave rejected'
                : 'Shift updated',
        detail: `${item.type} - ${item.startDate} -> ${item.endDate}`,
      }));

    const stopNotifications = holidayItems.slice(0, 2).map((item) => ({
      type: item.type === 'Training Event' ? 'Training scheduled' : 'Planned stop',
      detail: `${item.title} - ${item.scopeDetail}`,
    }));

    return [
      ...requestNotifications,
      { type: 'Crew reassignment', detail: `${employee.name} remains assigned to ${currentCrew}.` },
      ...stopNotifications,
    ].slice(0, 6);
  }, [currentCrew, employee.name, holidayItems, shiftRequestItems]);

  const handleSubmitSwap = () => {
    createShiftRequest({
      type: 'Shift Swap',
      requestedBy: employee.name,
      startDate: swapDraft.shiftDay,
      endDate: swapDraft.shiftDay,
      reason: `Swap with ${swapDraft.targetEmployee}. ${swapDraft.reason}`.trim(),
    });
    setIsSwapDialogOpen(false);
    setSwapDraft((prev) => ({ ...prev, reason: '' }));
  };

  const handleSubmitTimeOff = () => {
    createShiftRequest({
      type: timeOffDraft.type,
      requestedBy: employee.name,
      startDate: timeOffDraft.startDate,
      endDate: timeOffDraft.endDate,
      reason: timeOffDraft.reason,
    });
    setIsTimeOffDialogOpen(false);
    setTimeOffDraft((prev) => ({ ...prev, reason: '' }));
  };

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 1.8,
            px: { xs: 1.8, md: 2.2 },
            py: { xs: 1.5, md: 1.8 },
            borderRadius: 2.5,
            border: '1px solid #D8DEE8',
            bgcolor: '#FFFFFF',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' },
            alignItems: 'flex-start',
            gap: 1.5,
          }}
        >
          <Box sx={{ minWidth: 0, maxWidth: 760 }}>
            <Typography variant="caption" sx={{ color: activeTheme.primary, letterSpacing: '0.08em', fontWeight: 800, lineHeight: 1, textTransform: 'uppercase' }}>
              SHIFT SCHEDULE
            </Typography>
            <Typography variant="h5" sx={{ color: activeTheme.textPrimary, fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.6rem' }, lineHeight: 1.05, letterSpacing: '-0.03em', mt: 0.15 }}>
              Operator Board
            </Typography>
            <Typography variant="caption" sx={{ color: activeTheme.textSecondary, mt: 0.35, display: 'block', lineHeight: 1.3, fontSize: '0.9rem' }}>
              Personal self-service schedule using the same shift, crew, line, planned stop, and request logic configured by supervisors.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', lg: 'flex-end' }, gap: 1, minWidth: 0 }}>
            {renderShiftSchedulePersistentActions()}
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
              <Button variant="contained" startIcon={<SwapHorizIcon />} sx={{ borderRadius: 999, fontWeight: 800 }} onClick={() => setIsSwapDialogOpen(true)}>
                Request Shift Swap
              </Button>
              <Button variant="outlined" startIcon={<TimeOffIcon />} sx={{ borderRadius: 999, fontWeight: 800 }} onClick={() => setIsTimeOffDialogOpen(true)}>
                Request Time Off
              </Button>
            </Box>
          </Box>
        </Paper>

        <Grid container spacing={1.4}>
          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: '1px solid #DBE3F1' }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                <Avatar src={employee.photo} sx={{ width: 56, height: 56, bgcolor: employee.avatarTone, color: '#1D4ED8', fontWeight: 900 }}>
                  {employee.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                </Avatar>
                <Box sx={{ minWidth: 180 }}>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#1F2937' }}>{employee.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>{employee.role} - Production</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', flex: 1 }}>
                  {[currentCrew, employee.role, currentLineLabel, currentShiftLabel, employee.timeWindow].map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      sx={{ bgcolor: '#F8FAFC', color: '#0F172A', fontWeight: 800, border: '1px solid #E2E8F0' }}
                    />
                  ))}
                </Box>
                <Box sx={{ ml: 'auto', minWidth: 220 }}>
                  <Paper elevation={0} sx={{ p: 1.05, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: currentStatusTone.bg }}>
                    <Typography variant="caption" sx={{ color: currentStatusTone.fg, fontWeight: 900, textTransform: 'uppercase' }}>
                      Current Shift Status
                    </Typography>
                    <Typography sx={{ color: '#0F172A', fontWeight: 900, mt: 0.25 }}>{employee.statusDetail}</Typography>
                    <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                      {currentShiftLabel} - {currentLineLabel}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: '1px solid #DBE3F1', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1.1 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ color: '#1F2937', fontWeight: 800 }}>Schedule</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                    Week view is the default and shows shift, crew, line, hours, and status for each day.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap' }}>
                  {(['Today', 'Week', 'Month'] as CalendarMode[]).map((mode) => (
                    <Button
                      key={mode}
                      size="small"
                      variant={calendarMode === mode ? 'contained' : 'outlined'}
                      onClick={() => setCalendarMode(mode)}
                      sx={{ borderRadius: 999, fontWeight: 800, minWidth: 78 }}
                    >
                      {mode}
                    </Button>
                  ))}
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: calendarMode === 'Month' ? 'repeat(4, minmax(0, 1fr))' : calendarMode === 'Today' ? 'minmax(0, 1fr)' : 'repeat(5, minmax(0, 1fr))',
                  gap: 0.9,
                }}
              >
                {scheduleViewItems.map((item) => (
                  <Paper key={item.id} elevation={0} sx={{ p: 1.05, borderRadius: 2, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF', minHeight: 138 }}>
                    <Typography sx={{ color: '#0F172A', fontWeight: 900, mb: 0.55 }}>{item.day}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45 }}>
                      <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 800 }}>{item.shift}</Typography>
                      <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700 }}>{item.crew}</Typography>
                      <Typography variant="caption" sx={{ color: '#334155', fontWeight: 700 }}>{item.line}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeIcon sx={{ fontSize: 14, color: '#64748B' }} />
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>{item.hours}</Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={item.status}
                        sx={{
                          mt: 0.25,
                          alignSelf: 'flex-start',
                          bgcolor: item.status === 'Planned Training' ? '#F5F3FF' : '#EEF4FF',
                          color: item.status === 'Planned Training' ? '#7C3AED' : '#1D4ED8',
                          fontWeight: 800,
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>{item.note}</Typography>
                    </Box>
                  </Paper>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: '1px solid #DBE3F1', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
                <CalendarMonthIcon sx={{ fontSize: 20, color: '#2563EB' }} />
                <Typography variant="subtitle1" sx={{ color: '#1F2937', fontWeight: 800 }}>Upcoming Assignments</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
                {upcomingAssignments.map((assignment) => (
                  <Box key={`${assignment.day}-${assignment.line}`} sx={{ display: 'grid', gridTemplateColumns: '22px 1fr', gap: 0.9, alignItems: 'start' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 0.25 }}>
                      <FiberManualRecordIcon sx={{ fontSize: 12, color: '#2563EB' }} />
                    </Box>
                    <Box sx={{ pb: 0.9, borderBottom: '1px solid #E2E8F0' }}>
                      <Typography sx={{ color: '#0F172A', fontWeight: 900, lineHeight: 1.1 }}>{assignment.day}</Typography>
                      <Typography variant="caption" sx={{ color: '#2563EB', fontWeight: 800, display: 'block', mt: 0.25 }}>{assignment.shift}</Typography>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block' }}>{assignment.line}</Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 5 }}>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: '1px solid #DBE3F1', height: '100%' }}>
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle1" sx={{ color: '#1F2937', fontWeight: 800 }}>My Requests</Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                  Pending, approved, and rejected swap and leave requests.
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
                {myRequests.map((item) => {
                  const tone = requestStatusToneMap[item.status] ?? requestStatusToneMap.Requested;
                  return (
                    <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.2, alignItems: 'center', py: 0.85, borderBottom: '1px solid #E2E8F0' }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: tone.fg, fontWeight: 900, textTransform: 'uppercase' }}>{item.status}</Typography>
                        <Typography sx={{ color: '#0F172A', fontWeight: 800, lineHeight: 1.15 }}>{item.type}</Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>Requested {item.startDate}</Typography>
                      </Box>
                      <Chip size="small" label={item.endDate} sx={{ bgcolor: tone.bg, color: tone.fg, fontWeight: 800 }} />
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: '1px solid #DBE3F1', height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
                <NotificationsActiveIcon sx={{ fontSize: 20, color: '#0F766E' }} />
                <Typography variant="subtitle1" sx={{ color: '#1F2937', fontWeight: 800 }}>Notifications</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
                {operatorNotifications.map((item, index) => (
                  <Box key={`${item.type}-${index}`} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.2, alignItems: 'center', py: 0.75, borderBottom: '1px solid #E2E8F0' }}>
                    <Box>
                      <Typography sx={{ color: '#0F172A', fontWeight: 800, lineHeight: 1.15 }}>{item.type}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>{item.detail}</Typography>
                    </Box>
                    <FiberManualRecordIcon sx={{ fontSize: 10, color: '#0F766E' }} />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, border: '1px solid #DBE3F1' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 1 }}>
                <EventRepeatIcon sx={{ fontSize: 20, color: '#7C3AED' }} />
                <Typography variant="subtitle1" sx={{ color: '#1F2937', fontWeight: 800 }}>Availability Preferences</Typography>
              </Box>
              <Grid container spacing={1.2} alignItems="center">
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Preferred Shift</InputLabel>
                    <Select
                      label="Preferred Shift"
                      value={preferences.preferredShift}
                      onChange={(event) => setPreferences((prev) => ({ ...prev, preferredShift: event.target.value }))}
                    >
                      {preferenceOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    control={<Switch checked={preferences.overtime} onChange={(event) => setPreferences((prev) => ({ ...prev, overtime: event.target.checked }))} />}
                    label="Available for Overtime"
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <FormControlLabel
                    control={<Switch checked={preferences.extraCoverage} onChange={(event) => setPreferences((prev) => ({ ...prev, extraCoverage: event.target.checked }))} />}
                    label="Available for Extra Coverage"
                  />
                </Grid>
              </Grid>
              <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.8 }}>
                Preferences are informational only and do not directly change the schedule.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={isSwapDialogOpen} onClose={() => setIsSwapDialogOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: operatorRequestDialogPaperSx }}>
        <DialogTitle sx={operatorRequestDialogTitleSx}>
          <Typography sx={{ color: '#1F2937', fontWeight: 900, lineHeight: 1.15 }}>Request Shift Swap</Typography>
          <Typography variant="caption" sx={{ ...operatorRequestHelperTextSx, display: 'block', mt: 0.35 }}>
            Submit a swap request for review using the existing certification, position, crew, and approval workflow.
          </Typography>
        </DialogTitle>
        <DialogContent sx={operatorRequestDialogContentSx}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>My Shift</InputLabel>
                <Select
                  label="My Shift"
                  value={`${swapDraft.shiftDay}|${swapDraft.shiftHours}`}
                  onChange={(event) => {
                    const [shiftDay, shiftHours] = String(event.target.value).split('|');
                    setSwapDraft((prev) => ({ ...prev, shiftDay, shiftHours }));
                  }}
                >
                  {employee.weeklySchedule.map((entry) => (
                    <MenuItem key={`${entry.day}-${entry.hours}`} value={`${entry.day}|${entry.hours}`}>
                      {entry.day} - {entry.hours}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Swap With</InputLabel>
                <Select
                  label="Swap With"
                  value={swapDraft.targetEmployee}
                  onChange={(event) => setSwapDraft((prev) => ({ ...prev, targetEmployee: event.target.value }))}
                >
                  {teamManagementMembers.filter((member) => member.name !== employee.name).map((member) => (
                    <MenuItem key={member.name} value={member.name}>
                      {member.name} - {member.role}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Reason"
                size="small"
                fullWidth
                multiline
                minRows={3}
                value={swapDraft.reason}
                onChange={(event) => setSwapDraft((prev) => ({ ...prev, reason: event.target.value }))}
                helperText="This request follows the existing certification, position, crew, and approval workflow."
                FormHelperTextProps={{ sx: operatorRequestHelperTextSx }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={operatorRequestDialogActionsSx}>
          <Button onClick={() => setIsSwapDialogOpen(false)} sx={{ fontWeight: 800 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitSwap} disabled={!swapDraft.reason.trim()} sx={operatorRequestButtonSx}>
            Submit Swap Request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isTimeOffDialogOpen} onClose={() => setIsTimeOffDialogOpen(false)} fullWidth maxWidth="md" PaperProps={{ sx: operatorRequestDialogPaperSx }}>
        <DialogTitle sx={operatorRequestDialogTitleSx}>
          <Typography sx={{ color: '#1F2937', fontWeight: 900, lineHeight: 1.15 }}>Request Time Off</Typography>
          <Typography variant="caption" sx={{ ...operatorRequestHelperTextSx, display: 'block', mt: 0.35 }}>
            Submit time off for review using the existing schedule request and approval workflow.
          </Typography>
        </DialogTitle>
        <DialogContent sx={operatorRequestDialogContentSx}>
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  value={timeOffDraft.type}
                  onChange={(event) => setTimeOffDraft((prev) => ({ ...prev, type: event.target.value }))}
                >
                  {timeOffTypeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                fullWidth
                value={timeOffDraft.startDate}
                onChange={(event) => setTimeOffDraft((prev) => ({ ...prev, startDate: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="End Date"
                type="date"
                size="small"
                fullWidth
                value={timeOffDraft.endDate}
                onChange={(event) => setTimeOffDraft((prev) => ({ ...prev, endDate: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Reason"
                size="small"
                fullWidth
                multiline
                minRows={3}
                value={timeOffDraft.reason}
                onChange={(event) => setTimeOffDraft((prev) => ({ ...prev, reason: event.target.value }))}
                helperText="This request follows the existing schedule request and approval workflow."
                FormHelperTextProps={{ sx: operatorRequestHelperTextSx }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={operatorRequestDialogActionsSx}>
          <Button onClick={() => setIsTimeOffDialogOpen(false)} sx={{ fontWeight: 800 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitTimeOff} disabled={!timeOffDraft.reason.trim()} sx={operatorRequestButtonSx}>
            Submit Time Off Request
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
