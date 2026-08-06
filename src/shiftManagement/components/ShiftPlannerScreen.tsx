import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { activeTheme } from '../../theme';
import { useShiftManagementContext } from '../contexts/ShiftManagementContext';

const tabSx = {
  textTransform: 'none',
  fontWeight: 800,
  fontSize: '0.92rem',
  minHeight: 42,
  px: 1.2,
  borderBottom: '3px solid transparent',
  boxSizing: 'border-box',
  '&.Mui-selected': {
    color: activeTheme.primary,
    borderBottomColor: activeTheme.primary,
  },
};

const plannerActionButtonSx = { borderRadius: 2, fontWeight: 800, textTransform: 'none', boxShadow: 'none' };
const plannerTableContainerSx = { border: '1px solid #CBD5E1', borderRadius: 1.5, overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' };
const plannerDialogPaperSx = { borderRadius: 2, overflow: 'hidden' };
const plannerDialogTitleSx = { px: 2.6, py: 1.8, borderBottom: '1px solid #E2E8F0', bgcolor: '#F8FBFF' };
const plannerDialogContentSx = { p: 2.4, bgcolor: '#FFFFFF' };
const plannerDialogActionsSx = { px: 2.6, py: 1.45, borderTop: '1px solid #E2E8F0', bgcolor: '#F8FAFC', justifyContent: 'flex-end', gap: 0.8 };
const plannerDialogGridSpacing = 1.5;
const plannerDialogHelperTextSx = { color: '#64748B', fontWeight: 700, lineHeight: 1.35, display: 'block', mt: 0.35 };
const plannerPatternSectionSx = { p: 1.25, borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#FBFDFF' };
const plannerShiftFieldSx = { mt: 0.5 };

const operationalScopeOptions = ['Line A', 'Line B', 'Line C', 'Line D', 'Production Area', 'Molding Department', 'Warehouse', 'Quality Lab'];
const plannedStopTypeOptions = ['Holiday', 'Maintenance', 'Production Stop', 'Plant Shutdown', 'Training Event', 'Other'] as const;
const plannedStopScopeOptions = ['Entire Site', 'Department', 'Area', 'Line'] as const;
const workingCalendarViewOptions = ['Per Shift', 'Per Team'] as const;
const shiftColorOptions = [
  { value: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', text: '#1D4ED8' },
  { value: '#F59E0B', bg: '#FEF3C7', border: '#FCD34D', text: '#92400E' },
  { value: '#475569', bg: '#E2E8F0', border: '#CBD5E1', text: '#334155' },
  { value: '#0F766E', bg: '#CCFBF1', border: '#5EEAD4', text: '#0F766E' },
  { value: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9' },
  { value: '#DC2626', bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
  { value: '#94A3B8', bg: '#F1F5F9', border: '#CBD5E1', text: '#475569' },
] as const;
const requestStatusVisuals = {
  Requested: { bg: '#FFF7ED', color: '#C2410C', border: '#FDBA74' },
  Approved: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
  Rejected: { bg: '#FEF2F2', color: '#DC2626', border: '#FECACA' },
} as const;
const requestTableHeadCellSx = {
  fontWeight: 900,
  color: '#64748B',
  bgcolor: '#F8FAFC',
  borderBottom: '1px solid #CBD5E1',
  fontSize: '0.68rem',
  letterSpacing: '0.02em',
};

const plannedCalendarYear = 2027;
const plannedCalendarWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const plannedCalendarMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const plannedCalendarShifts = [
  { id: 'mn', abbreviation: 'MN', name: 'Morning', time: '06:00-14:00', colorCode: '#2563EB', bg: '#DBEAFE', border: '#93C5FD', text: '#1D4ED8' },
  { id: 'af', abbreviation: 'AF', name: 'Afternoon', time: '14:00-22:00', colorCode: '#0F766E', bg: '#CCFBF1', border: '#5EEAD4', text: '#0F766E' },
  { id: 'ni', abbreviation: 'NI', name: 'Night', time: '22:00-06:00', colorCode: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE', text: '#6D28D9' },
  { id: 'off', abbreviation: 'OFF', name: 'Day Off', time: 'Non-working', colorCode: '#DC2626', bg: '#FEF2F2', border: '#FECACA', text: '#B91C1C' },
] as const;
const plannedCalendarPatterns = [
  {
    id: 'weekendCoverage',
    name: 'Weekend Coverage',
    startDate: '2027-01-01',
    sequence: ['mn', 'mn', 'off', 'af', 'af', 'off'],
  },
  {
    id: 'fiveCrewRotation',
    name: '5-Crew Rotation',
    startDate: '2027-01-01',
    sequence: ['mn', 'mn', 'af', 'af', 'ni', 'ni', 'off', 'off', 'off', 'off'],
  },
] as const;
const plannedCalendarTeams = [
  { name: 'Crew A', abbreviation: 'A', startSlot: 1, offset: 0 },
  { name: 'Crew B', abbreviation: 'B', startSlot: 3, offset: 2 },
  { name: 'Crew C', abbreviation: 'C', startSlot: 5, offset: 4 },
  { name: 'Crew D', abbreviation: 'D', startSlot: 7, offset: 6 },
  { name: 'Crew E', abbreviation: 'E', startSlot: 9, offset: 8 },
] as const;

function calculateDurationLabel(start: string, end: string) {
  const [startHour = 0, startMinute = 0] = start.split(':').map(Number);
  const [endHour = 0, endMinute = 0] = end.split(':').map(Number);
  const startTotal = startHour * 60 + startMinute;
  let endTotal = endHour * 60 + endMinute;
  if (endTotal <= startTotal) {
    endTotal += 24 * 60;
  }
  const totalMinutes = Math.max(endTotal - startTotal, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

function buildCrewNames(crewCount: number) {
  return Array.from({ length: crewCount }, (_, index) => `Crew ${String.fromCharCode(65 + index)}`);
}

const ShiftPlannerScreen: React.FC = () => {
  const [workingCalendarView, setWorkingCalendarView] = React.useState<(typeof workingCalendarViewOptions)[number]>('Per Shift');
  const [selectedPlannedCalendarPatternId, setSelectedPlannedCalendarPatternId] = React.useState<(typeof plannedCalendarPatterns)[number]['id']>('fiveCrewRotation');
  const {
    settings: {
      shiftSettingsTab,
      setShiftSettingsTab,
      shiftConfigSearch,
      setShiftConfigSearch,
      crewPatternSearch,
      setCrewPatternSearch,
      linePatternAssignmentSearch,
      setLinePatternAssignmentSearch,
      holidaySearch,
      setHolidaySearch,
      requestSearch,
      setRequestSearch,
      requestStatusFilter,
      setRequestStatusFilter,
      shiftConfigItems,
      crewPatternItems,
      filteredShiftConfigItems,
      filteredCrewPatternItems,
      filteredLinePatternAssignmentItems,
      filteredHolidayItems,
      filteredShiftRequestItems,
      isShiftConfigDrawerOpen,
      isCrewPatternDrawerOpen,
      isLinePatternAssignmentDrawerOpen,
      isHolidayDrawerOpen,
      setIsShiftConfigDrawerOpen,
      setIsCrewPatternDrawerOpen,
      setIsLinePatternAssignmentDrawerOpen,
      setIsHolidayDrawerOpen,
      editingShiftConfigId,
      editingCrewPatternId,
      editingLinePatternAssignmentId,
      editingHolidayId,
      shiftConfigDraft,
      setShiftConfigDraft,
      crewPatternDraft,
      setCrewPatternDraft,
      linePatternAssignmentDraft,
      setLinePatternAssignmentDraft,
      holidayDraft,
      setHolidayDraft,
      openNewShiftConfigDrawer,
      openEditShiftConfigDrawer,
      saveShiftConfigDraft,
      deleteShiftConfig,
      openNewCrewPatternDrawer,
      openEditCrewPatternDrawer,
      saveCrewPatternDraft,
      deleteCrewPattern,
      openNewLinePatternAssignmentDrawer,
      openEditLinePatternAssignmentDrawer,
      saveLinePatternAssignmentDraft,
      deleteLinePatternAssignment,
      openNewHolidayDrawer,
      openEditHolidayDrawer,
      saveHolidayDraft,
      deleteHoliday,
      updateShiftRequestStatus,
    },
    renderShiftSchedulePersistentActions,
  } = useShiftManagementContext();

  const crewPatternNameById = React.useMemo(
    () => new Map(crewPatternItems.map((item) => [item.id, item.name])),
    [crewPatternItems],
  );
  const teamLineAssignmentTeamOptions = React.useMemo(() => [
    { teamCrew: 'Crew A', crewPatternId: 'pattern-1', crewPatternName: '5-Crew Rotation' },
    { teamCrew: 'Crew B', crewPatternId: 'pattern-1', crewPatternName: '5-Crew Rotation' },
    { teamCrew: 'Crew C', crewPatternId: 'pattern-2', crewPatternName: 'Weekend Coverage' },
    { teamCrew: 'Crew D', crewPatternId: 'night-support', crewPatternName: 'Night Support' },
    { teamCrew: 'Crew E', crewPatternId: 'pattern-1', crewPatternName: '5-Crew Rotation' },
  ], []);
  const selectedTeamLineAssignmentPattern = linePatternAssignmentDraft.crewPatternName
    ?? crewPatternNameById.get(linePatternAssignmentDraft.crewPatternId)
    ?? 'Select a team';

  const selectedShiftColor = shiftColorOptions.find((option) => option.value === shiftConfigDraft.colorCode) ?? shiftColorOptions[0];
  const shiftAbbreviation = (shiftConfigDraft.abbreviation ?? '').trim().toUpperCase();
  const isShiftAbbreviationDuplicate = Boolean(shiftAbbreviation) && shiftConfigItems.some((item) => {
    if (item.id === shiftConfigDraft.id) return false;
    const existingAbbreviation = (item.abbreviation ?? item.name.replace(/[^a-z0-9]/gi, '').slice(0, 3)).trim().toUpperCase();
    return existingAbbreviation === shiftAbbreviation;
  });
  const isShiftConfigSaveDisabled = !shiftConfigDraft.name.trim() || !shiftAbbreviation || isShiftAbbreviationDuplicate;
  const crewPatternTeams = React.useMemo(
    () => (crewPatternDraft.crewTeams?.length ? crewPatternDraft.crewTeams : crewPatternDraft.crewNames.map((name, index) => ({
      name,
      abbreviation: name.replace(/[^a-z0-9]/gi, '').slice(-1).toUpperCase() || String.fromCharCode(65 + index),
      sequenceStartDate: '2026-01-01',
    }))),
    [crewPatternDraft.crewNames, crewPatternDraft.crewTeams],
  );
  const [crewPatternInsertionIndex, setCrewPatternInsertionIndex] = React.useState(0);
  const [selectedCrewPatternSequenceIndexes, setSelectedCrewPatternSequenceIndexes] = React.useState<number[]>([]);
  const [draggedCrewPatternSequenceIndex, setDraggedCrewPatternSequenceIndex] = React.useState<number | null>(null);
  const crewPatternDrawerStateRef = React.useRef({ open: false, draftId: '' });
  const crewPatternShiftById = React.useMemo(
    () => new Map(shiftConfigItems.map((item) => [item.id, item])),
    [shiftConfigItems],
  );
  const availableCrewPatternShifts = React.useMemo(
    () => shiftConfigItems.filter((item) => item.isActive || item.isNonWorking || item.name.toLowerCase() === 'day off'),
    [shiftConfigItems],
  );
  const crewPatternShiftByToken = React.useMemo(() => {
    const entries: Array<[string, string]> = [];
    shiftConfigItems.forEach((item) => {
      const abbreviation = (item.abbreviation ?? item.name.replace(/[^a-z0-9]/gi, '').slice(0, 3)).toUpperCase();
      entries.push([item.id.toUpperCase(), item.id], [abbreviation, item.id], [item.name.toUpperCase(), item.id]);
      if (item.name.toLowerCase() === 'morning') entries.push(['M', item.id], ['MN', item.id]);
      if (item.name.toLowerCase() === 'afternoon') entries.push(['A', item.id], ['AF', item.id]);
      if (item.name.toLowerCase() === 'night') entries.push(['N', item.id], ['NI', item.id]);
      if (item.isNonWorking || item.name.toLowerCase() === 'day off') entries.push(['D', item.id], ['OFF', item.id]);
    });
    return new Map(entries);
  }, [shiftConfigItems]);
  const parseCrewPatternSequence = React.useCallback((rotationSequence: string) => {
    if (!rotationSequence.trim()) return [];
    return rotationSequence
      .split('->')
      .map((step) => step.trim())
      .filter(Boolean)
      .flatMap((step) => {
        const directMatch = crewPatternShiftByToken.get(step.toUpperCase());
        if (directMatch) return [directMatch];
        const blockMatch = step.match(/^(\d+)\s*([a-zA-Z]+)$/);
        if (!blockMatch) return [];
        const count = Number(blockMatch[1]);
        const shiftId = crewPatternShiftByToken.get(blockMatch[2].toUpperCase());
        return shiftId ? Array.from({ length: count }, () => shiftId) : [];
      });
  }, [crewPatternShiftByToken]);
  const crewPatternDraftSequence = React.useMemo(
    () => parseCrewPatternSequence(crewPatternDraft.rotationSequence),
    [crewPatternDraft.rotationSequence, parseCrewPatternSequence],
  );
  const updateCrewPatternSequence = React.useCallback((sequence: string[]) => {
    const uniqueShiftIds = Array.from(new Set(sequence));
    setCrewPatternDraft((prev) => ({
      ...prev,
      shiftIds: uniqueShiftIds,
      rotationSequence: sequence.join(' -> '),
    }));
  }, [setCrewPatternDraft]);
  const insertCrewPatternShift = React.useCallback((shiftId: string) => {
    const nextSequence = [...crewPatternDraftSequence];
    const safeIndex = Math.min(Math.max(crewPatternInsertionIndex, 0), nextSequence.length);
    nextSequence.splice(safeIndex, 0, shiftId);
    updateCrewPatternSequence(nextSequence);
    setCrewPatternInsertionIndex(safeIndex + 1);
    setSelectedCrewPatternSequenceIndexes([]);
  }, [crewPatternDraftSequence, crewPatternInsertionIndex, updateCrewPatternSequence]);
  const deleteSelectedCrewPatternShifts = React.useCallback(() => {
    if (!selectedCrewPatternSequenceIndexes.length) return;
    const selectedIndexes = new Set(selectedCrewPatternSequenceIndexes);
    const removedBeforeSlot = selectedCrewPatternSequenceIndexes.filter((index) => index < crewPatternInsertionIndex).length;
    const nextSequence = crewPatternDraftSequence.filter((_, shiftIndex) => !selectedIndexes.has(shiftIndex));
    updateCrewPatternSequence(nextSequence);
    setCrewPatternInsertionIndex(Math.min(Math.max(crewPatternInsertionIndex - removedBeforeSlot, 0), nextSequence.length));
    setSelectedCrewPatternSequenceIndexes([]);
  }, [crewPatternDraftSequence, crewPatternInsertionIndex, selectedCrewPatternSequenceIndexes, updateCrewPatternSequence]);
  const reorderCrewPatternShift = React.useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= crewPatternDraftSequence.length) return;
    const safeInsertionIndex = Math.min(Math.max(toIndex, 0), crewPatternDraftSequence.length);
    const nextSequence = [...crewPatternDraftSequence];
    const [shiftId] = nextSequence.splice(fromIndex, 1);
    const nextIndex = fromIndex < safeInsertionIndex ? safeInsertionIndex - 1 : safeInsertionIndex;
    if (fromIndex === nextIndex) {
      setDraggedCrewPatternSequenceIndex(null);
      return;
    }
    nextSequence.splice(nextIndex, 0, shiftId);
    updateCrewPatternSequence(nextSequence);
    setSelectedCrewPatternSequenceIndexes([nextIndex]);
    setCrewPatternInsertionIndex(Math.min(nextIndex + 1, nextSequence.length));
    setDraggedCrewPatternSequenceIndex(null);
  }, [crewPatternDraftSequence, updateCrewPatternSequence]);
  React.useEffect(() => {
    const previous = crewPatternDrawerStateRef.current;
    if (isCrewPatternDrawerOpen && (!previous.open || previous.draftId !== crewPatternDraft.id)) {
      setCrewPatternInsertionIndex(crewPatternDraftSequence.length);
      setSelectedCrewPatternSequenceIndexes([]);
      setDraggedCrewPatternSequenceIndex(null);
    }
    crewPatternDrawerStateRef.current = {
      open: isCrewPatternDrawerOpen,
      draftId: crewPatternDraft.id,
    };
  }, [crewPatternDraft.id, crewPatternDraftSequence.length, isCrewPatternDrawerOpen]);

  const updateCrewPatternTeam = React.useCallback((index: number, field: 'name' | 'abbreviation' | 'sequenceStartDate', value: string) => {
    setCrewPatternDraft((prev) => {
      const sourceTeams = prev.crewTeams?.length ? prev.crewTeams : prev.crewNames.map((name, teamIndex) => ({
        name,
        abbreviation: name.replace(/[^a-z0-9]/gi, '').slice(-1).toUpperCase() || String.fromCharCode(65 + teamIndex),
        sequenceStartDate: '2026-01-01',
      }));
      const crewTeams = sourceTeams.map((team, teamIndex) => (
        teamIndex === index ? { ...team, [field]: field === 'abbreviation' ? value.toUpperCase().slice(0, 3) : value } : team
      ));
      return {
        ...prev,
        crewNames: crewTeams.map((team) => team.name),
        crewCount: crewTeams.length,
        crewTeams,
      };
    });
  }, [setCrewPatternDraft]);

  const updateShiftTimes = React.useCallback((field: 'start' | 'end', value: string) => {
    setShiftConfigDraft((prev) => {
      const next = { ...prev, [field]: value };
      return { ...next, duration: calculateDurationLabel(next.start, next.end) };
    });
  }, [setShiftConfigDraft]);

  const renderShiftConfiguration = () => (
    <>
      <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search shifts"
          value={shiftConfigSearch}
          onChange={(event) => setShiftConfigSearch(event.target.value)}
          sx={{ width: 280 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: activeTheme.primary, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" startIcon={<AddIcon />} sx={plannerActionButtonSx} onClick={openNewShiftConfigDrawer}>
          Create Shift
        </Button>
      </Box>
      <TableContainer component={Paper} elevation={0} sx={plannerTableContainerSx}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>SHIFT</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>TIME</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>DURATION</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>DAY OFF</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>NOTES</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD', width: 110 }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredShiftConfigItems.map((item) => {
              const abbreviation = (item.abbreviation ?? item.name.replace(/[^a-z0-9]/gi, '').slice(0, 3)).toUpperCase();
              const colorOption = shiftColorOptions.find((option) => option.value === item.colorCode) ?? shiftColorOptions[0];
              const duration = calculateDurationLabel(item.start, item.end);
              return (
                <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#F8FBFF' } }}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 32,
                          borderRadius: 1.4,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: colorOption.bg,
                          color: colorOption.text,
                          border: `2px solid ${colorOption.border}`,
                          fontWeight: 950,
                          fontSize: '0.78rem',
                          letterSpacing: '0.02em',
                          opacity: item.isNonWorking ? 0.86 : 1,
                          flexShrink: 0,
                        }}
                      >
                        {abbreviation || '---'}
                      </Box>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: '#1F2937', fontWeight: 900, lineHeight: 1.15, fontSize: '0.86rem' }}>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, lineHeight: 1.2 }}>
                          Controlled calendar color
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: '#1F2937', fontWeight: 850 }}>
                    {item.start}-{item.end}
                  </TableCell>
                  <TableCell>
                    <Typography sx={{ color: '#1F2937', fontWeight: 850, lineHeight: 1.2 }}>
                      {duration}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      Derived from start/end
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {item.isNonWorking ? (
                      <Box sx={{ display: 'flex', gap: 0.35, flexWrap: 'wrap' }}>
                        <Chip label="Day off" size="small" sx={{ height: 22, bgcolor: colorOption.bg, color: colorOption.text, border: `1px solid ${colorOption.border}`, fontWeight: 900, '& .MuiChip-label': { px: 0.7, fontSize: '0.62rem' } }} />
                        <Chip label="Non-working" size="small" sx={{ height: 22, bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1', fontWeight: 900, '& .MuiChip-label': { px: 0.7, fontSize: '0.62rem' } }} />
                      </Box>
                    ) : (
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>
                        Working shift
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={item.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      sx={{
                        fontWeight: 900,
                        bgcolor: item.isActive ? '#EAF8EF' : '#F1F5F9',
                        color: item.isActive ? '#15803D' : '#64748B',
                        border: `1px solid ${item.isActive ? '#A7F3D0' : '#CBD5E1'}`,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#475569', maxWidth: 280 }}>{item.notes || 'No notes'}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEditShiftConfigDrawer(item)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => deleteShiftConfig(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const renderCrewPatterns = () => (
    <>
      <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search crew patterns"
          value={crewPatternSearch}
          onChange={(event) => setCrewPatternSearch(event.target.value)}
          sx={{ width: 320 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: activeTheme.primary, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" startIcon={<AddIcon />} sx={plannerActionButtonSx} onClick={openNewCrewPatternDrawer}>
          Add Crew Pattern
        </Button>
      </Box>
      <TableContainer component={Paper} elevation={0} sx={plannerTableContainerSx}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>PATTERN</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>ROTATION SEQUENCE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>SEQUENCE LENGTH</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>TEAMS</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD', width: 110 }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCrewPatternItems.map((item) => {
              const sequence = parseCrewPatternSequence(item.rotationSequence);
              const visibleSequence = sequence.slice(0, 8);
              const overflowCount = Math.max(sequence.length - visibleSequence.length, 0);
              return (
                <TableRow key={item.id}>
                  <TableCell sx={{ fontWeight: 800 }}>
                    <Typography sx={{ fontWeight: 900, color: activeTheme.textPrimary, fontSize: '0.9rem' }}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                      {item.notes || 'No notes'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ minWidth: 280 }}>
                    <Box sx={{ display: 'flex', gap: 0.45, alignItems: 'center', overflowX: 'auto', py: 0.2 }}>
                      {visibleSequence.length ? visibleSequence.map((shiftId, index) => {
                        const shift = crewPatternShiftById.get(shiftId);
                        const colorOption = shiftColorOptions.find((option) => option.value === shift?.colorCode) ?? shiftColorOptions[0];
                        const abbreviation = (shift?.abbreviation ?? shift?.name.replace(/[^a-z0-9]/gi, '').slice(0, 3) ?? shiftId).toUpperCase();
                        return (
                          <Box
                            key={`${item.id}-${shiftId}-${index}`}
                            sx={{
                              minWidth: 38,
                              height: 30,
                              px: 0.65,
                              borderRadius: 1,
                              border: `1px solid ${colorOption.border}`,
                              bgcolor: colorOption.bg,
                              color: colorOption.text,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '0.72rem',
                              flex: '0 0 auto',
                            }}
                          >
                            {abbreviation}
                          </Box>
                        );
                      }) : (
                        <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800 }}>
                          No sequence
                        </Typography>
                      )}
                      {overflowCount ? (
                        <Chip
                          label={`+${overflowCount} more`}
                          size="small"
                          sx={{ height: 24, fontWeight: 900, color: '#475569', bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }}
                        />
                      ) : null}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{sequence.length} slots</TableCell>
                  <TableCell>{item.crewCount} teams</TableCell>
                  <TableCell>
                    <Chip
                      label={item.isActive ? 'Active' : 'Draft'}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: item.isActive ? '#EAF8EF' : '#FEF3C7',
                        color: item.isActive ? '#15803D' : '#92400E',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => openEditCrewPatternDrawer(item)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" onClick={() => deleteCrewPattern(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const renderLinePatternAssignments = () => (
    <>
      <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search team-to-line assignments"
          value={linePatternAssignmentSearch}
          onChange={(event) => setLinePatternAssignmentSearch(event.target.value)}
          sx={{ width: 320 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: activeTheme.primary, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" startIcon={<AddIcon />} sx={plannerActionButtonSx} onClick={openNewLinePatternAssignmentDrawer}>
          Assign Team to Line
        </Button>
      </Box>
      <TableContainer component={Paper} elevation={0} sx={plannerTableContainerSx}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>OPERATIONAL SCOPE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>TEAM / CREW</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>CREW PATTERN</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>ASSIGNMENT TYPE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>START DATE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>END DATE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>NOTES</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD', width: 110 }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLinePatternAssignmentItems.map((item) => {
              const assignmentStatus = item.status ?? (item.isActive ? 'Active' : 'Inactive');
              const statusSx = assignmentStatus === 'Active'
                ? { bgcolor: '#EAF8EF', color: '#15803D' }
                : assignmentStatus === 'Draft'
                  ? { bgcolor: '#FEF3C7', color: '#92400E' }
                  : { bgcolor: '#F1F5F9', color: '#64748B' };
              return (
              <TableRow key={item.id}>
                <TableCell sx={{ fontWeight: 800 }}>{item.lineArea}</TableCell>
                <TableCell>{item.teamCrew ?? 'Select a team'}</TableCell>
                <TableCell sx={{ color: '#475569' }}>{item.crewPatternName ?? crewPatternNameById.get(item.crewPatternId) ?? 'Inherited from selected team'}</TableCell>
                <TableCell>{item.assignmentType ?? 'Primary'}</TableCell>
                <TableCell>{item.startDate}</TableCell>
                <TableCell>{item.endDate}</TableCell>
                <TableCell>
                  <Chip
                    label={assignmentStatus}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      ...statusSx,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: '#475569', maxWidth: 260 }}>{item.notes || 'No notes'}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEditLinePatternAssignmentDrawer(item)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => deleteLinePatternAssignment(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const renderHolidays = () => (
    <>
      <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search planned stops"
          value={holidaySearch}
          onChange={(event) => setHolidaySearch(event.target.value)}
          sx={{ width: 280 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: activeTheme.primary, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="contained" startIcon={<AddIcon />} sx={plannerActionButtonSx} onClick={openNewHolidayDrawer}>
          Create Planned Stop
        </Button>
      </Box>
      <TableContainer component={Paper} elevation={0} sx={plannerTableContainerSx}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>TITLE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>TYPE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>SCOPE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>START</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>END</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD' }}>STATUS</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#8CA0BD', width: 110 }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHolidayItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontWeight: 800 }}>{item.title}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.scopeDetail}</TableCell>
                <TableCell>{item.startDate} {item.startTime}</TableCell>
                <TableCell>{item.endDate} {item.endTime}</TableCell>
                <TableCell>
                  <Chip
                    label={item.isActive ? 'Active' : 'Inactive'}
                    size="small"
                    sx={{
                      fontWeight: 800,
                      bgcolor: item.isActive ? '#EAF8EF' : '#F1F5F9',
                      color: item.isActive ? '#15803D' : '#64748B',
                    }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => openEditHolidayDrawer(item)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => deleteHoliday(item.id)}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const renderRequests = () => (
    <>
      <Box sx={{ mb: 1.2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search"
          value={requestSearch}
          onChange={(event) => setRequestSearch(event.target.value)}
          sx={{ width: 320 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: activeTheme.primary, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
        />
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={requestStatusFilter} onChange={(event) => setRequestStatusFilter(event.target.value as 'All' | 'Requested' | 'Approved' | 'Rejected')}>
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Requested">Requested</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper} elevation={0} sx={plannerTableContainerSx}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={requestTableHeadCellSx}>REQUEST TYPE</TableCell>
              <TableCell sx={requestTableHeadCellSx}>REQUESTED BY</TableCell>
              <TableCell sx={requestTableHeadCellSx}>START DATE</TableCell>
              <TableCell sx={requestTableHeadCellSx}>END DATE</TableCell>
              <TableCell sx={requestTableHeadCellSx}>REASON</TableCell>
              <TableCell sx={requestTableHeadCellSx}>STATUS</TableCell>
              <TableCell sx={{ ...requestTableHeadCellSx, width: 112, textAlign: 'right' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredShiftRequestItems.map((item) => {
              const statusVisual = requestStatusVisuals[item.status];
              return (
              <TableRow key={item.id} sx={{ '&:hover': { bgcolor: '#F8FBFF' } }}>
                <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                  <Typography sx={{ color: '#1F2937', fontWeight: 900, lineHeight: 1.2, fontSize: '0.86rem' }}>
                    {item.type}
                  </Typography>
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                  <Typography sx={{ color: '#1F2937', fontWeight: 800, lineHeight: 1.2, fontSize: '0.82rem' }}>
                    {item.requestedBy}
                  </Typography>
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800 }}>
                    {item.startDate}
                  </Typography>
                </TableCell>
                <TableCell sx={{ verticalAlign: 'top', py: 1 }}>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800 }}>
                    {item.endDate}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: '#475569', maxWidth: 340, verticalAlign: 'top', py: 1 }}>
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, lineHeight: 1.35, display: 'block' }}>
                    {item.reason || 'No reason provided'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={item.status}
                    size="small"
                    sx={{
                      minWidth: 86,
                      fontWeight: 900,
                      bgcolor: statusVisual.bg,
                      color: statusVisual.color,
                      border: `1px solid ${statusVisual.border}`,
                      '& .MuiChip-label': { px: 0.9 },
                    }}
                  />
                </TableCell>
                <TableCell sx={{ textAlign: 'right' }}>
                  <IconButton
                    size="small"
                    aria-label={`Approve ${item.type} request from ${item.requestedBy}`}
                    title="Approve request"
                    onClick={() => updateShiftRequestStatus(item.id, 'Approved')}
                    sx={{ color: '#047857', bgcolor: '#ECFDF5', border: '1px solid #A7F3D0', mr: 0.45, '&:hover': { bgcolor: '#D1FAE5' } }}
                  >
                    <CheckIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    aria-label={`Reject ${item.type} request from ${item.requestedBy}`}
                    title="Reject request"
                    onClick={() => updateShiftRequestStatus(item.id, 'Rejected')}
                    sx={{ color: '#DC2626', bgcolor: '#FEF2F2', border: '1px solid #FECACA', '&:hover': { bgcolor: '#FEE2E2' } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );

  const plannedCalendarShiftById = React.useMemo(
    () => new Map(plannedCalendarShifts.map((shift) => [shift.id, shift])),
    [],
  );
  const selectedPlannedCalendarPattern = React.useMemo(
    () => plannedCalendarPatterns.find((pattern) => pattern.id === selectedPlannedCalendarPatternId) ?? plannedCalendarPatterns[0],
    [selectedPlannedCalendarPatternId],
  );
  const plannedCalendarYearMonths = React.useMemo(() => {
    const startParts = selectedPlannedCalendarPattern.startDate.split('-').map(Number);
    const startUtc = Date.UTC(startParts[0] ?? plannedCalendarYear, (startParts[1] ?? 1) - 1, startParts[2] ?? 1);

    return plannedCalendarMonths.map((month, monthIndex) => {
      const daysInMonth = new Date(plannedCalendarYear, monthIndex + 1, 0).getDate();
      const rows = Array.from({ length: daysInMonth }, (_, index) => {
        const dayNumber = index + 1;
        const date = new Date(plannedCalendarYear, monthIndex, dayNumber);
        const dateUtc = Date.UTC(plannedCalendarYear, monthIndex, dayNumber);
        const baseOffset = Math.floor((dateUtc - startUtc) / 86400000);
        const getShiftForOffset = (teamOffset = 0) => {
          const sequenceLength = selectedPlannedCalendarPattern.sequence.length;
          const sequenceIndex = ((baseOffset + teamOffset) % sequenceLength + sequenceLength) % sequenceLength;
          const shiftId = selectedPlannedCalendarPattern.sequence[sequenceIndex] ?? 'mn';
          return plannedCalendarShiftById.get(shiftId) ?? plannedCalendarShifts[0];
        };
        const teamAssignments = plannedCalendarTeams.map((team) => ({ team, shift: getShiftForOffset(team.offset) }));
        const shiftAssignments = plannedCalendarShifts.reduce((acc, shift) => {
          acc[shift.id] = teamAssignments.filter((assignment) => assignment.shift.id === shift.id).map((assignment) => assignment.team);
          return acc;
        }, {} as Record<(typeof plannedCalendarShifts)[number]['id'], Array<(typeof plannedCalendarTeams)[number]>>);

        return {
          dayNumber,
          dateLabel: `${month.slice(0, 3)} ${dayNumber}`,
          weekday: plannedCalendarWeekdays[date.getDay()] ?? '',
          teamAssignments,
          shiftAssignments,
        };
      });

      return { month, monthIndex, rows };
    });
  }, [plannedCalendarShiftById, selectedPlannedCalendarPattern]);
  const plannedCalendarShiftBuckets = [
    { id: 'mn', label: 'M' },
    { id: 'af', label: 'A' },
    { id: 'ni', label: 'N' },
    { id: 'off', label: 'O' },
  ] as const;
  const plannedCalendarValidationIssueCount = 2;
  const plannedCalendarKpis = [
    {
      label: 'Working Hours',
      value: '8,736h',
      detail: 'annual planned working hours',
      tone: '#1D4ED8',
      bg: '#EEF4FF',
      border: '#BFDBFE',
    },
    {
      label: 'Off Hours',
      value: '3,240h',
      detail: 'annual non-working / day-off hours',
      tone: '#475569',
      bg: '#F8FAFC',
      border: '#E2E8F0',
    },
    {
      label: 'Holiday Hours',
      value: '128h',
      detail: 'configured holiday hours',
      tone: '#7C3AED',
      bg: '#F5F3FF',
      border: '#DDD6FE',
    },
    {
      label: 'Calendar Validation Issues',
      value: String(plannedCalendarValidationIssueCount),
      detail: 'assignment or holiday boundary warnings',
      tone: '#C2410C',
      bg: '#FFF7ED',
      border: '#FED7AA',
    },
    {
      label: 'Publish Status',
      value: plannedCalendarValidationIssueCount > 0 ? 'Blocked' : 'Ready',
      detail: 'calendar publish readiness',
      tone: plannedCalendarValidationIssueCount > 0 ? '#B91C1C' : '#047857',
      bg: plannedCalendarValidationIssueCount > 0 ? '#FEF2F2' : '#ECFDF5',
      border: plannedCalendarValidationIssueCount > 0 ? '#FECACA' : '#A7F3D0',
    },
    {
      label: 'Teams Configured',
      value: String(plannedCalendarTeams.length),
      detail: 'teams using selected crew pattern',
      tone: '#0F766E',
      bg: '#ECFEFF',
      border: '#99F6E4',
    },
  ];
  const plannedCalendarValidationSummaries = [
    'Shift with no team assigned',
    'Holiday start/end time does not align with shift boundary',
  ];
  const renderPlannedShiftCard = (shift: (typeof plannedCalendarShifts)[number], label: string = shift.abbreviation, title?: string) => (
    <Box
      title={title}
      sx={{
        minWidth: 34,
        display: 'inline-flex',
        justifyContent: 'center',
        px: 0.55,
        py: 0.32,
        borderRadius: 1.15,
        bgcolor: shift.bg,
        color: shift.text,
        border: `1px solid ${shift.border}`,
        fontWeight: 950,
        fontSize: '0.7rem',
        lineHeight: 1,
      }}
    >
      {label}
    </Box>
  );

  const renderPlannedCalendar = () => (
    <>
      <Paper elevation={0} sx={{ mb: 1.2, p: 1.2, borderRadius: 2.2, border: '1px solid #E2E8F0', bgcolor: '#FBFDFF' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) auto' }, gap: 1.1, alignItems: 'start' }}>
          <Box>
            <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.68rem' }}>
              Planned Calendar
            </Typography>
            <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 900, lineHeight: 1.1, mt: 0.2 }}>
              Generated crew-pattern calendar
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750, display: 'block', mt: 0.35, lineHeight: 1.3 }}>
              Generated from selected crew pattern, team start dates, and shift definitions.
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 180px))' }, gap: 0.75 }}>
            <FormControl size="small">
              <InputLabel>Crew pattern</InputLabel>
              <Select
                label="Crew pattern"
                value={selectedPlannedCalendarPatternId}
                onChange={(event) => setSelectedPlannedCalendarPatternId(event.target.value as (typeof plannedCalendarPatterns)[number]['id'])}
              >
                {plannedCalendarPatterns.map((pattern) => (
                  <MenuItem key={pattern.id} value={pattern.id}>{pattern.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Start date" size="small" value={selectedPlannedCalendarPattern.startDate} InputProps={{ readOnly: true }} />
            <TextField label="Year" size="small" value={plannedCalendarYear} InputProps={{ readOnly: true }} />
          </Box>
        </Box>

        <Box sx={{ mt: 1, display: 'flex', gap: 0.45, flexWrap: 'wrap' }}>
          {plannedCalendarShifts.map((shift) => (
            <Chip
              key={shift.id}
              label={`${shift.abbreviation} ${shift.name}`}
              size="small"
              sx={{ bgcolor: shift.bg, color: shift.text, border: `1px solid ${shift.border}`, fontWeight: 900, '& .MuiChip-label': { px: 0.8 } }}
            />
          ))}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ mb: 1.2, p: 1, borderRadius: 2.2, border: '1px solid #D8DEE8', bgcolor: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 0.8, flexWrap: 'wrap', mb: 0.85 }}>
          <Box>
            <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.64rem', letterSpacing: '0.04em' }}>
              Planned Calendar KPIs
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750, display: 'block', mt: 0.18, lineHeight: 1.3 }}>
              Validation and publish-readiness signals for the generated calendar.
            </Typography>
          </Box>
          <Chip
            size="small"
            label={plannedCalendarValidationIssueCount > 0 ? 'Publish blocked' : 'Ready to publish'}
            sx={{
              bgcolor: plannedCalendarValidationIssueCount > 0 ? '#FEF2F2' : '#ECFDF5',
              color: plannedCalendarValidationIssueCount > 0 ? '#B91C1C' : '#047857',
              border: `1px solid ${plannedCalendarValidationIssueCount > 0 ? '#FECACA' : '#A7F3D0'}`,
              fontWeight: 900,
              borderRadius: 999,
            }}
          />
        </Box>
        <Grid container spacing={0.65}>
          {plannedCalendarKpis.map((item) => (
            <Grid key={item.label} size={{ xs: 12, sm: 6, md: 4, xl: 2 }}>
              <Paper elevation={0} sx={{ p: 0.75, borderRadius: 1.6, border: `1px solid ${item.border}`, bgcolor: item.bg, height: '100%' }}>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.56rem', letterSpacing: '0.04em', display: 'block', lineHeight: 1.15 }}>
                  {item.label}
                </Typography>
                <Typography sx={{ color: item.tone, fontSize: { xs: '0.92rem', md: '1.05rem' }, fontWeight: 950, lineHeight: 1.08, mt: 0.3 }}>
                  {item.value}
                </Typography>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 750, fontSize: '0.6rem', display: 'block', lineHeight: 1.25, mt: 0.25 }}>
                  {item.detail}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ mt: 0.8, display: 'flex', alignItems: 'center', gap: 0.45, flexWrap: 'wrap' }}>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.58rem' }}>
            Validation examples
          </Typography>
          {plannedCalendarValidationSummaries.map((summary) => (
            <Chip
              key={summary}
              label={summary}
              size="small"
              sx={{ height: 22, bgcolor: '#FFFBEB', color: '#9A3412', border: '1px solid #FED7AA', fontWeight: 800, '& .MuiChip-label': { px: 0.75, fontSize: '0.6rem' } }}
            />
          ))}
        </Box>
      </Paper>

      <Box sx={{ mb: 1.2, display: 'flex', gap: 0.6, flexWrap: 'wrap' }}>
        {workingCalendarViewOptions.map((view) => (
          <Button
            key={view}
            variant={workingCalendarView === view ? 'contained' : 'outlined'}
            size="small"
            onClick={() => setWorkingCalendarView(view)}
            sx={plannerActionButtonSx}
          >
            {view}
          </Button>
        ))}
      </Box>

      <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2.2, border: '1px solid #D8DEE8', bgcolor: '#FFFFFF' }}>
        <Box sx={{ mb: 1 }}>
          <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.68rem' }}>
            {workingCalendarView}
          </Typography>
          <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 900, lineHeight: 1.1, mt: 0.2 }}>
            {plannedCalendarYear} annual generated calendar
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 750, display: 'block', mt: 0.35, lineHeight: 1.3 }}>
            {workingCalendarView === 'Per Shift'
              ? 'Per Shift cells show assigned team abbreviation for each configured shift.'
              : 'Per Team cells show assigned shift abbreviation for each team.'}
          </Typography>
        </Box>
        <Box sx={{ overflowX: 'auto', overflowY: 'hidden', pb: 0.8 }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', minWidth: 'max-content' }}>
            {plannedCalendarYearMonths.map((monthBlock) => (
              <Paper
                key={monthBlock.month}
                elevation={0}
                sx={{
                  flex: '0 0 auto',
                  width: workingCalendarView === 'Per Shift' ? 330 : 388,
                  borderRadius: 1.8,
                  border: '1px solid #D8DEE8',
                  bgcolor: '#FFFFFF',
                  overflow: 'visible',
                }}
              >
                <Box sx={{ px: 0.9, py: 0.65, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 950, lineHeight: 1.1 }}>
                    {monthBlock.month} {plannedCalendarYear}
                  </Typography>
                </Box>
                <Box sx={{ overflow: 'visible' }}>
                  <Table size="small" sx={{ tableLayout: 'fixed', width: workingCalendarView === 'Per Shift' ? 330 : 388 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...requestTableHeadCellSx, width: 42, px: 0.5, py: 0.55 }}>DAY</TableCell>
                        <TableCell sx={{ ...requestTableHeadCellSx, width: 48, px: 0.5, py: 0.55 }}>WK</TableCell>
                        {workingCalendarView === 'Per Shift' ? plannedCalendarShiftBuckets.map((bucket) => (
                          <TableCell key={bucket.id} align="center" sx={{ ...requestTableHeadCellSx, width: 56, px: 0.4, py: 0.55 }}>
                            {bucket.label}
                          </TableCell>
                        )) : plannedCalendarTeams.map((team) => (
                          <TableCell key={team.name} align="center" sx={{ ...requestTableHeadCellSx, width: 58, px: 0.4, py: 0.55 }}>
                            {team.abbreviation}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthBlock.rows.map((row) => (
                        <TableRow key={`${monthBlock.month}-${row.dayNumber}`} hover>
                          <TableCell sx={{ color: '#0F172A', fontWeight: 900, borderBottom: '1px solid #E2E8F0', px: 0.5, py: 0.35, fontSize: '0.68rem' }}>
                            {String(row.dayNumber).padStart(2, '0')}
                          </TableCell>
                          <TableCell sx={{ color: '#64748B', fontWeight: 850, borderBottom: '1px solid #E2E8F0', textTransform: 'uppercase', px: 0.5, py: 0.35, fontSize: '0.66rem' }}>
                            {row.weekday}
                          </TableCell>
                          {workingCalendarView === 'Per Shift' ? plannedCalendarShiftBuckets.map((bucket) => {
                            const shift = plannedCalendarShiftById.get(bucket.id) ?? plannedCalendarShifts[0];
                            const teams = row.shiftAssignments[bucket.id] ?? [];
                            const teamLabel = teams.map((team) => team.abbreviation).join('/');
                            const teamTitle = teams.length ? teams.map((team) => team.name).join(', ') : 'No team assigned';
                            return (
                              <TableCell key={`${monthBlock.month}-${row.dayNumber}-${bucket.id}`} align="center" sx={{ borderBottom: '1px solid #E2E8F0', px: 0.25, py: 0.3 }}>
                                {teams.length ? renderPlannedShiftCard(shift, teamLabel, `${row.dateLabel} ${shift.name}: ${teamTitle}`) : (
                                  <Box sx={{ color: '#94A3B8', fontWeight: 900, fontSize: '0.68rem' }}>-</Box>
                                )}
                              </TableCell>
                            );
                          }) : row.teamAssignments.map(({ team, shift }) => (
                            <TableCell key={`${monthBlock.month}-${row.dayNumber}-${team.abbreviation}`} align="center" sx={{ borderBottom: '1px solid #E2E8F0', px: 0.25, py: 0.3 }}>
                              {renderPlannedShiftCard(shift, shift.abbreviation === 'OFF' ? 'O' : shift.abbreviation.slice(0, 1), `${row.dateLabel} ${team.name}: ${shift.name}`)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Paper>
    </>
  );

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Paper elevation={0} sx={{ mb: 1.8, px: { xs: 1.8, md: 2.2 }, py: { xs: 1.5, md: 1.8 }, borderRadius: 2.5, border: '1px solid #D8DEE8', bgcolor: '#FFFFFF', display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' }, alignItems: 'flex-start', gap: 1.5 }}>
          <Box sx={{ minWidth: 0, maxWidth: 760 }}>
            <Typography variant="caption" sx={{ color: activeTheme.primary, letterSpacing: '0.08em', fontWeight: 800, lineHeight: 1, textTransform: 'uppercase' }}>
              SHIFT SCHEDULE
            </Typography>
            <Typography variant="h5" sx={{ color: activeTheme.textPrimary, fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.6rem' }, lineHeight: 1.05, letterSpacing: '-0.03em', mt: 0.15 }}>
              Planner settings workspace
            </Typography>
            <Typography variant="caption" sx={{ color: activeTheme.textSecondary, mt: 0.35, display: 'block', lineHeight: 1.3, fontSize: '0.9rem' }}>
              Configure the planner in order: create shifts, create crew patterns, assign teams to operational lines/scopes, then complete employee assignments in Crew Setup.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, alignItems: 'flex-start', minWidth: 0 }}>
            {renderShiftSchedulePersistentActions()}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ border: '1px solid #D8DEE8', borderRadius: 2.5, overflow: 'hidden' }}>
          <Tabs
            value={shiftSettingsTab}
            onChange={(_, value) => setShiftSettingsTab(value)}
            sx={{
              px: 1.5,
              borderBottom: '1px solid #E2E8F0',
              minHeight: 46,
              '& .MuiTabs-indicator': { display: 'none' },
            }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab value="configuration" label="Shift Configuration" sx={tabSx} />
            <Tab value="patterns" label="Crew Pattern Configuration" sx={tabSx} />
            <Tab value="lineAssignments" label="Team-to-Line Assignment" sx={tabSx} />
            <Tab value="holidays" label="Planned Stops" sx={tabSx} />
            <Tab value="workingCalendar" label="Planned Calendar" sx={tabSx} />
          </Tabs>
          <Box sx={{ p: 1.5, minHeight: 460 }}>
            {shiftSettingsTab === 'configuration' ? renderShiftConfiguration() : null}
            {shiftSettingsTab === 'patterns' ? renderCrewPatterns() : null}
            {shiftSettingsTab === 'lineAssignments' ? renderLinePatternAssignments() : null}
            {shiftSettingsTab === 'holidays' ? renderHolidays() : null}
            {shiftSettingsTab === 'workingCalendar' ? renderPlannedCalendar() : null}
          </Box>
        </Paper>
      </Paper>

      <Dialog
        open={isShiftConfigDrawerOpen}
        onClose={() => setIsShiftConfigDrawerOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: plannerDialogPaperSx }}
      >
        <DialogTitle sx={plannerDialogTitleSx}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: activeTheme.textPrimary, lineHeight: 1.1 }}>
            {editingShiftConfigId ? 'Edit Shift' : 'Create Shift'}
          </Typography>
          <Typography variant="caption" sx={plannerDialogHelperTextSx}>
            Define shift identity, timing, calendar color, and whether this represents a working or non-working shift.
          </Typography>
        </DialogTitle>
        <DialogContent sx={plannerDialogContentSx}>
          <Grid container spacing={plannerDialogGridSpacing}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Shift name"
                size="small"
                fullWidth
                sx={plannerShiftFieldSx}
                value={shiftConfigDraft.name}
                onChange={(event) => setShiftConfigDraft((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                label="Shift abbreviation"
                size="small"
                fullWidth
                sx={plannerShiftFieldSx}
                value={shiftConfigDraft.abbreviation ?? ''}
                error={isShiftAbbreviationDuplicate}
                helperText={isShiftAbbreviationDuplicate ? 'Abbreviation already used by another shift.' : 'Up to 3 characters.'}
                inputProps={{ maxLength: 3 }}
                onChange={(event) => {
                  const abbreviation = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
                  setShiftConfigDraft((prev) => ({ ...prev, abbreviation }));
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Duration"
                size="small"
                fullWidth
                disabled
                sx={plannerShiftFieldSx}
                value={shiftConfigDraft.duration}
                helperText="Derived from start and end time."
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Start time"
                type="time"
                size="small"
                fullWidth
                sx={plannerShiftFieldSx}
                value={shiftConfigDraft.start}
                onChange={(event) => updateShiftTimes('start', event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="End time"
                type="time"
                size="small"
                fullWidth
                sx={plannerShiftFieldSx}
                value={shiftConfigDraft.end}
                onChange={(event) => updateShiftTimes('end', event.target.value)}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 1.2, borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#FBFDFF' }}>
                <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                  Color coding
                </Typography>
                <Box sx={{ mt: 1, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {shiftColorOptions.map((option) => {
                    const isSelected = shiftConfigDraft.colorCode === option.value;
                    return (
                      <Box
                        key={option.value}
                        component="button"
                        type="button"
                        aria-label={`Select color ${shiftColorOptions.indexOf(option) + 1}`}
                        onClick={() => setShiftConfigDraft((prev) => ({ ...prev, colorCode: option.value }))}
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 1.5,
                          bgcolor: option.value,
                          border: `2px solid ${isSelected ? activeTheme.primary : option.border}`,
                          boxShadow: isSelected ? '0 0 0 3px rgba(37,99,235,0.14)' : 'none',
                          cursor: 'pointer',
                          transition: 'box-shadow 180ms ease, border-color 180ms ease, transform 180ms ease',
                          '&:hover': { boxShadow: '0 0 0 3px rgba(15,23,42,0.08)' },
                          '&:focus-visible': { outline: `2px solid ${activeTheme.primary}`, outlineOffset: 2 },
                        }}
                      />
                    );
                  })}
                </Box>
                {shiftConfigDraft.isNonWorking && shiftConfigDraft.colorCode !== '#94A3B8' ? (
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mt: 0.75 }}>
                    A neutral swatch is available when this shift represents non-working time.
                  </Typography>
                ) : null}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mt: 0.25 }}>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={shiftConfigDraft.isActive && !shiftConfigDraft.isNonWorking}
                      disabled={Boolean(shiftConfigDraft.isNonWorking)}
                      onChange={(event) => setShiftConfigDraft((prev) => ({ ...prev, isActive: event.target.checked, isNonWorking: event.target.checked ? false : prev.isNonWorking }))}
                    />
                  )}
                  label="Active shift"
                />
                {shiftConfigDraft.isNonWorking ? (
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mt: -0.35, ml: 5.8 }}>
                    Disabled because this is marked as non-working.
                  </Typography>
                ) : null}
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ mt: 0.25 }}>
                <FormControlLabel
                  control={(
                    <Switch
                      checked={Boolean(shiftConfigDraft.isNonWorking)}
                      onChange={(event) => setShiftConfigDraft((prev) => ({ ...prev, isNonWorking: event.target.checked, isActive: event.target.checked ? false : prev.isActive }))}
                    />
                  )}
                  label="Day-off / non-working shift"
                />
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={{ p: 1.15, borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 0.9 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem' }}>
                      Calendar Preview
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mt: 0.2 }}>
                      Output preview from abbreviation, timing, state, and selected color.
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={shiftConfigDraft.isNonWorking ? 'Non-working' : shiftConfigDraft.isActive ? 'Active' : 'Inactive'}
                    sx={{
                      height: 22,
                      bgcolor: shiftConfigDraft.isNonWorking ? '#F1F5F9' : shiftConfigDraft.isActive ? '#ECFDF5' : '#F8FAFC',
                      color: shiftConfigDraft.isNonWorking ? '#475569' : shiftConfigDraft.isActive ? '#047857' : '#64748B',
                      border: '1px solid #CBD5E1',
                      fontWeight: 900,
                    }}
                  />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 0.65 }}>
                  {['Mon', 'Tue', 'Wed'].map((day) => (
                    <Box key={day} sx={{ p: 0.75, borderRadius: 1.3, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC', minHeight: 78 }}>
                      <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, display: 'block', mb: 0.45 }}>
                        {day}
                      </Typography>
                      <Chip
                        size="small"
                        label={shiftAbbreviation || '---'}
                        sx={{
                          height: 24,
                          minWidth: 46,
                          bgcolor: selectedShiftColor.bg,
                          color: selectedShiftColor.text,
                          border: `1px solid ${selectedShiftColor.border}`,
                          fontWeight: 900,
                          '& .MuiChip-label': { px: 0.85, fontSize: '0.7rem' },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700, display: 'block', mt: 0.55 }}>
                        {shiftConfigDraft.start} - {shiftConfigDraft.end}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                size="small"
                fullWidth
                multiline
                minRows={3}
                sx={plannerShiftFieldSx}
                value={shiftConfigDraft.notes ?? ''}
                onChange={(event) => setShiftConfigDraft((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={plannerDialogActionsSx}>
          <Button onClick={() => setIsShiftConfigDrawerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveShiftConfigDraft} disabled={isShiftConfigSaveDisabled} sx={plannerActionButtonSx}>
            {editingShiftConfigId ? 'Save Shift' : 'Create Shift'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isCrewPatternDrawerOpen}
        onClose={() => setIsCrewPatternDrawerOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: plannerDialogPaperSx }}
      >
        <DialogTitle sx={plannerDialogTitleSx}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: activeTheme.textPrimary, lineHeight: 1.1 }}>
            {editingCrewPatternId ? 'Edit Crew Pattern' : 'Create Crew Pattern'}
          </Typography>
          <Typography variant="caption" sx={plannerDialogHelperTextSx}>
            Use existing shifts to define the rotation structure before assigning the pattern to lines.
          </Typography>
        </DialogTitle>
        <DialogContent sx={plannerDialogContentSx}>
          <Grid container spacing={plannerDialogGridSpacing}>
            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={plannerPatternSectionSx}>
                <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                  Pattern details
                </Typography>
                <Grid container spacing={plannerDialogGridSpacing} sx={{ mt: 0.5 }}>
                  <Grid size={{ xs: 12, md: 7 }}>
                    <TextField
                      label="Crew pattern name"
                      size="small"
                      fullWidth
                      value={crewPatternDraft.name}
                      onChange={(event) => setCrewPatternDraft((prev) => ({ ...prev, name: event.target.value }))}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <FormControlLabel
                      control={<Switch checked={crewPatternDraft.isActive} onChange={(event) => setCrewPatternDraft((prev) => ({ ...prev, isActive: event.target.checked }))} />}
                      label="Active crew pattern"
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Notes"
                      size="small"
                      fullWidth
                      multiline
                      minRows={2}
                      value={crewPatternDraft.notes ?? ''}
                      onChange={(event) => setCrewPatternDraft((prev) => ({ ...prev, notes: event.target.value }))}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={plannerPatternSectionSx}>
                <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                  Rotation sequence
                </Typography>
                <Box sx={{ mt: 0.35, mb: 1, display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700 }}>
                    Click a shift to insert it at the highlighted slot. Drag cards to reorder.
                  </Typography>
                  {selectedCrewPatternSequenceIndexes.length ? (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<DeleteIcon fontSize="small" />}
                      onClick={deleteSelectedCrewPatternShifts}
                      sx={{ minHeight: 28, borderRadius: 1.5, fontWeight: 900, textTransform: 'none' }}
                    >
                      Delete selected ({selectedCrewPatternSequenceIndexes.length})
                    </Button>
                  ) : null}
                </Box>
                <Box sx={{ display: 'flex', gap: 0.65, flexWrap: 'wrap', mb: 1.25 }}>
                  {availableCrewPatternShifts.map((item) => {
                    const colorOption = shiftColorOptions.find((option) => option.value === item.colorCode) ?? shiftColorOptions[0];
                    const abbreviation = (item.abbreviation ?? item.name.replace(/[^a-z0-9]/gi, '').slice(0, 3)).toUpperCase();
                    return (
                      <Button
                        key={item.id}
                        type="button"
                        variant="outlined"
                        onClick={() => insertCrewPatternShift(item.id)}
                        sx={{
                          width: 116,
                          height: 52,
                          minWidth: 116,
                          maxWidth: 116,
                          px: 0.75,
                          py: 0.5,
                          borderRadius: 1.5,
                          borderColor: colorOption.border,
                          bgcolor: colorOption.bg,
                          color: colorOption.text,
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0,
                          '&:hover': {
                            bgcolor: colorOption.bg,
                            borderColor: colorOption.text,
                          },
                        }}
                      >
                        <Typography sx={{ fontWeight: 950, fontSize: '0.88rem', lineHeight: 1 }}>
                          {abbreviation}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, lineHeight: 1.1, whiteSpace: 'nowrap' }}>
                          {item.isNonWorking ? 'Day off' : `${item.start} - ${item.end}`}
                        </Typography>
                      </Button>
                    );
                  })}
                </Box>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1.5,
                    border: '1px solid #CBD5E1',
                    bgcolor: '#F8FAFC',
                    display: 'flex',
                    gap: 0.65,
                    alignItems: 'center',
                    overflowX: 'auto',
                    minHeight: 64,
                  }}
                  onClick={() => setSelectedCrewPatternSequenceIndexes([])}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggedCrewPatternSequenceIndex !== null) {
                      reorderCrewPatternShift(draggedCrewPatternSequenceIndex, crewPatternInsertionIndex);
                    }
                  }}
                >
                  {crewPatternDraftSequence.map((shiftId, slotIndex) => (
                    <React.Fragment key={`sequence-card-wrap-${shiftId}-${slotIndex}`}>
                      {crewPatternInsertionIndex === slotIndex ? (
                        <Box
                          role="button"
                          tabIndex={0}
                          onClick={(event) => {
                            event.stopPropagation();
                            setCrewPatternInsertionIndex(slotIndex);
                            setSelectedCrewPatternSequenceIndexes([]);
                          }}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') setCrewPatternInsertionIndex(slotIndex);
                          }}
                          onDragOver={(event) => event.preventDefault()}
                          onDrop={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            if (draggedCrewPatternSequenceIndex !== null) reorderCrewPatternShift(draggedCrewPatternSequenceIndex, slotIndex);
                          }}
                          sx={{
                            width: 56,
                            minWidth: 56,
                            height: 38,
                            borderRadius: 1.25,
                            border: `2px dashed ${activeTheme.primary}`,
                            bgcolor: '#FFFFFF',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: activeTheme.primary,
                            fontWeight: 900,
                            fontSize: '0.68rem',
                            textAlign: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          Insert
                        </Box>
                      ) : null}
                      {(() => {
                        const shiftId = crewPatternDraftSequence[slotIndex];
                        const shift = crewPatternShiftById.get(shiftId);
                        const colorOption = shiftColorOptions.find((option) => option.value === shift?.colorCode) ?? shiftColorOptions[0];
                        const abbreviation = (shift?.abbreviation ?? shift?.name.replace(/[^a-z0-9]/gi, '').slice(0, 3) ?? shiftId).toUpperCase();
                        const isSelected = selectedCrewPatternSequenceIndexes.includes(slotIndex);
                        return (
                          <Box
                            key={`sequence-card-${shiftId}-${slotIndex}`}
                            role="button"
                            tabIndex={0}
                            draggable
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedCrewPatternSequenceIndexes((prev) => (
                                prev.includes(slotIndex) ? prev.filter((index) => index !== slotIndex) : [...prev, slotIndex]
                              ));
                              setCrewPatternInsertionIndex(slotIndex + 1);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                setSelectedCrewPatternSequenceIndexes((prev) => (
                                  prev.includes(slotIndex) ? prev.filter((index) => index !== slotIndex) : [...prev, slotIndex]
                                ));
                              }
                            }}
                            onDragStart={(event) => {
                              setDraggedCrewPatternSequenceIndex(slotIndex);
                              event.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              if (draggedCrewPatternSequenceIndex !== null) reorderCrewPatternShift(draggedCrewPatternSequenceIndex, slotIndex);
                            }}
                            onDragEnd={() => setDraggedCrewPatternSequenceIndex(null)}
                            sx={{
                              width: 56,
                              minWidth: 56,
                              height: 38,
                              borderRadius: 1.25,
                              border: `2px solid ${isSelected ? activeTheme.primary : colorOption.border}`,
                              bgcolor: colorOption.bg,
                              color: colorOption.text,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'grab',
                              boxShadow: isSelected ? '0 0 0 3px rgba(37,99,235,0.14)' : 'none',
                              opacity: draggedCrewPatternSequenceIndex === slotIndex ? 0.55 : 1,
                              '&:active': { cursor: 'grabbing' },
                            }}
                          >
                            <Typography sx={{ fontWeight: 950, lineHeight: 1, fontSize: '0.9rem' }}>
                              {abbreviation}
                            </Typography>
                          </Box>
                        );
                      })()}
                    </React.Fragment>
                  ))}
                  {crewPatternInsertionIndex === crewPatternDraftSequence.length ? (
                    <Box
                      role="button"
                      tabIndex={0}
                      onClick={(event) => {
                        event.stopPropagation();
                        setCrewPatternInsertionIndex(crewPatternDraftSequence.length);
                        setSelectedCrewPatternSequenceIndexes([]);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') setCrewPatternInsertionIndex(crewPatternDraftSequence.length);
                      }}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        if (draggedCrewPatternSequenceIndex !== null) reorderCrewPatternShift(draggedCrewPatternSequenceIndex, crewPatternDraftSequence.length);
                      }}
                      sx={{
                        width: 56,
                        minWidth: 56,
                        height: 38,
                        borderRadius: 1.25,
                        border: `2px dashed ${activeTheme.primary}`,
                        bgcolor: '#FFFFFF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: activeTheme.primary,
                        fontWeight: 900,
                        fontSize: '0.68rem',
                        textAlign: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      Insert
                    </Box>
                  ) : null}
                </Box>
                {crewPatternDraftSequence.length === 0 ? (
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mt: 0.8 }}>
                    Click a shift to insert it at the highlighted slot. Drag created cards to reorder.
                  </Typography>
                ) : (
                  <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mt: 0.8 }}>
                    {crewPatternDraftSequence.length} slots in this sequence. Colors come from Shift Configuration.
                  </Typography>
                )}
                <Grid container spacing={plannerDialogGridSpacing} sx={{ mt: 1 }}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Offset logic"
                      size="small"
                      fullWidth
                      multiline
                      minRows={3}
                      value={crewPatternDraft.offsetLogic}
                      onChange={(event) => setCrewPatternDraft((prev) => ({ ...prev, offsetLogic: event.target.value }))}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      label="Working / rest blocks"
                      size="small"
                      fullWidth
                      multiline
                      minRows={3}
                      value={crewPatternDraft.workingRestBlocks}
                      onChange={(event) => setCrewPatternDraft((prev) => ({ ...prev, workingRestBlocks: event.target.value }))}
                      helperText="Describe working and non-working blocks if needed."
                    />
                  </Grid>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Weekend behavior"
                      size="small"
                      fullWidth
                      value={crewPatternDraft.weekendBehavior}
                      onChange={(event) => setCrewPatternDraft((prev) => ({ ...prev, weekendBehavior: event.target.value }))}
                    />
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Paper elevation={0} sx={plannerPatternSectionSx}>
                <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, textTransform: 'uppercase', fontSize: '0.68rem' }}>
                  Teams
                </Typography>
                <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mt: 0.35, mb: 1 }}>
                  The sequence repeats from each team's selected start date.
                </Typography>
                <Grid container spacing={plannerDialogGridSpacing}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <TextField
                      label="Number of teams"
                      type="number"
                      size="small"
                      fullWidth
                      value={crewPatternDraft.crewCount}
                      onChange={(event) => {
                        const crewCount = Math.max(1, Number(event.target.value) || 1);
                        const crewNames = buildCrewNames(crewCount);
                        setCrewPatternDraft((prev) => ({
                          ...prev,
                          crewCount,
                          crewNames,
                          crewTeams: crewNames.map((name, index) => ({
                            name,
                            abbreviation: prev.crewTeams?.[index]?.abbreviation ?? name.replace(/[^a-z0-9]/gi, '').slice(-1).toUpperCase(),
                            sequenceStartDate: prev.crewTeams?.[index]?.sequenceStartDate ?? '2026-01-01',
                          })),
                        }));
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 8 }}>
                    <TextField
                      label="Crew labels"
                      size="small"
                      fullWidth
                      value={crewPatternDraft.crewNames.join(', ')}
                      onChange={(event) => {
                        const crewNames = event.target.value.split(',').map((item) => item.trim()).filter(Boolean);
                        setCrewPatternDraft((prev) => ({
                          ...prev,
                          crewNames,
                          crewCount: crewNames.length,
                          crewTeams: crewNames.map((name, index) => ({
                            name,
                            abbreviation: prev.crewTeams?.[index]?.abbreviation ?? name.replace(/[^a-z0-9]/gi, '').slice(-1).toUpperCase(),
                            sequenceStartDate: prev.crewTeams?.[index]?.sequenceStartDate ?? '2026-01-01',
                          })),
                        }));
                      }}
                    />
                  </Grid>
                  {crewPatternTeams.map((team, index) => (
                    <Grid size={{ xs: 12 }} key={`${team.name}-${index}`}>
                      <Paper elevation={0} sx={{ p: 1, borderRadius: 1.5, border: '1px solid #E2E8F0', bgcolor: '#FFFFFF' }}>
                        <Grid container spacing={1}>
                          <Grid size={{ xs: 12, md: 5 }}>
                            <TextField
                              label="Team name"
                              size="small"
                              fullWidth
                              value={team.name}
                              onChange={(event) => updateCrewPatternTeam(index, 'name', event.target.value)}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 3 }}>
                            <TextField
                              label="Team abbreviation"
                              size="small"
                              fullWidth
                              value={team.abbreviation}
                              inputProps={{ maxLength: 3 }}
                              onChange={(event) => updateCrewPatternTeam(index, 'abbreviation', event.target.value.replace(/[^a-z0-9]/gi, '').toUpperCase())}
                            />
                          </Grid>
                          <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                              label="Sequence start date"
                              type="date"
                              size="small"
                              fullWidth
                              value={team.sequenceStartDate}
                              onChange={(event) => updateCrewPatternTeam(index, 'sequenceStartDate', event.target.value)}
                              slotProps={{ inputLabel: { shrink: true } }}
                            />
                          </Grid>
                        </Grid>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={plannerDialogActionsSx}>
          <Button onClick={() => setIsCrewPatternDrawerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveCrewPatternDraft} disabled={!crewPatternDraft.name.trim() || crewPatternDraftSequence.length === 0} sx={plannerActionButtonSx}>
            {editingCrewPatternId ? 'Save Crew Pattern' : 'Create Crew Pattern'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isLinePatternAssignmentDrawerOpen}
        onClose={() => setIsLinePatternAssignmentDrawerOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: plannerDialogPaperSx }}
      >
        <DialogTitle sx={plannerDialogTitleSx}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: activeTheme.textPrimary, lineHeight: 1.1 }}>
            {editingLinePatternAssignmentId ? 'Edit Team-to-Line Assignment' : 'Assign Team to Operational Scope'}
          </Typography>
          <Typography variant="caption" sx={plannerDialogHelperTextSx}>
            Assign a team/crew to an operational scope with effective dates.
          </Typography>
        </DialogTitle>
        <DialogContent sx={plannerDialogContentSx}>
          <Grid container spacing={plannerDialogGridSpacing}>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Operational Scope</InputLabel>
                <Select
                  label="Operational Scope"
                  value={linePatternAssignmentDraft.lineArea}
                  onChange={(event) => setLinePatternAssignmentDraft((prev) => ({ ...prev, lineArea: event.target.value }))}
                >
                  {operationalScopeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Team / Crew</InputLabel>
                <Select
                  label="Team / Crew"
                  value={linePatternAssignmentDraft.teamCrew ?? ''}
                  onChange={(event) => {
                    const selectedTeam = teamLineAssignmentTeamOptions.find((item) => item.teamCrew === event.target.value);
                    setLinePatternAssignmentDraft((prev) => ({
                      ...prev,
                      teamCrew: event.target.value,
                      crewPatternId: selectedTeam?.crewPatternId ?? prev.crewPatternId,
                      crewPatternName: selectedTeam?.crewPatternName ?? prev.crewPatternName,
                    }));
                  }}
                >
                  {teamLineAssignmentTeamOptions.map((item) => <MenuItem key={item.teamCrew} value={item.teamCrew}>{item.teamCrew}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Crew Pattern"
                size="small"
                fullWidth
                value={selectedTeamLineAssignmentPattern}
                InputProps={{ readOnly: true }}
                helperText="Inherited from selected team"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Assignment Type</InputLabel>
                <Select
                  label="Assignment Type"
                  value={linePatternAssignmentDraft.assignmentType ?? 'Primary'}
                  onChange={(event) => setLinePatternAssignmentDraft((prev) => ({ ...prev, assignmentType: event.target.value as 'Primary' | 'Support' | 'Temporary' }))}
                >
                  <MenuItem value="Primary">Primary</MenuItem>
                  <MenuItem value="Support">Support</MenuItem>
                  <MenuItem value="Temporary">Temporary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Start date"
                type="date"
                size="small"
                fullWidth
                value={linePatternAssignmentDraft.startDate}
                onChange={(event) => setLinePatternAssignmentDraft((prev) => ({ ...prev, startDate: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="End date"
                type="date"
                size="small"
                fullWidth
                value={linePatternAssignmentDraft.endDate}
                onChange={(event) => setLinePatternAssignmentDraft((prev) => ({ ...prev, endDate: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={linePatternAssignmentDraft.status ? linePatternAssignmentDraft.status === 'Active' : linePatternAssignmentDraft.isActive} onChange={(event) => setLinePatternAssignmentDraft((prev) => ({ ...prev, isActive: event.target.checked, status: event.target.checked ? 'Active' : 'Inactive' }))} />}
                label="Active assignment"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Notes"
                size="small"
                fullWidth
                multiline
                minRows={3}
                value={linePatternAssignmentDraft.notes ?? ''}
                onChange={(event) => setLinePatternAssignmentDraft((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={plannerDialogActionsSx}>
          <Button onClick={() => setIsLinePatternAssignmentDrawerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveLinePatternAssignmentDraft} disabled={!linePatternAssignmentDraft.teamCrew} sx={plannerActionButtonSx}>
            {editingLinePatternAssignmentId ? 'Save Assignment' : 'Assign Team'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isHolidayDrawerOpen}
        onClose={() => setIsHolidayDrawerOpen(false)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: plannerDialogPaperSx }}
      >
        <DialogTitle sx={plannerDialogTitleSx}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: activeTheme.textPrimary, lineHeight: 1.1 }}>
            {editingHolidayId ? 'Edit Planned Stop' : 'Create Planned Stop'}
          </Typography>
          <Typography variant="caption" sx={plannerDialogHelperTextSx}>
            Configure any planned non-working period with date and time granularity, type, and scope.
          </Typography>
        </DialogTitle>
        <DialogContent sx={plannerDialogContentSx}>
          <Grid container spacing={plannerDialogGridSpacing}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Title"
                size="small"
                fullWidth
                value={holidayDraft.title}
                onChange={(event) => setHolidayDraft((prev) => ({ ...prev, title: event.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  label="Type"
                  value={holidayDraft.type}
                  onChange={(event) => setHolidayDraft((prev) => ({ ...prev, type: event.target.value as typeof plannedStopTypeOptions[number] }))}
                >
                  {plannedStopTypeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Scope</InputLabel>
                <Select
                  label="Scope"
                  value={holidayDraft.scope}
                  onChange={(event) => setHolidayDraft((prev) => ({ ...prev, scope: event.target.value as typeof plannedStopScopeOptions[number] }))}
                >
                  {plannedStopScopeOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                label="Department / Area / Line"
                size="small"
                fullWidth
                value={holidayDraft.scopeDetail}
                onChange={(event) => setHolidayDraft((prev) => ({ ...prev, scopeDetail: event.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Start Date"
                type="date"
                size="small"
                fullWidth
                value={holidayDraft.startDate}
                onChange={(event) => setHolidayDraft((prev) => ({ ...prev, startDate: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Start Time"
                type="time"
                size="small"
                fullWidth
                value={holidayDraft.startTime}
                onChange={(event) => setHolidayDraft((prev) => ({ ...prev, startTime: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="End Date"
                type="date"
                size="small"
                fullWidth
                value={holidayDraft.endDate}
                onChange={(event) => setHolidayDraft((prev) => ({ ...prev, endDate: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="End Time"
                type="time"
                size="small"
                fullWidth
                value={holidayDraft.endTime}
                onChange={(event) => setHolidayDraft((prev) => ({ ...prev, endTime: event.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                size="small"
                fullWidth
                multiline
                minRows={3}
                value={holidayDraft.description}
                onChange={(event) => setHolidayDraft((prev) => ({ ...prev, description: event.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Reason"
                size="small"
                fullWidth
                multiline
                minRows={2}
                value={holidayDraft.reason}
                onChange={(event) => setHolidayDraft((prev) => ({ ...prev, reason: event.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={<Switch checked={holidayDraft.isActive} onChange={(event) => setHolidayDraft((prev) => ({ ...prev, isActive: event.target.checked }))} />}
                label="Active planned stop"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={plannerDialogActionsSx}>
          <Button onClick={() => setIsHolidayDrawerOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveHolidayDraft} disabled={!holidayDraft.title.trim()} sx={plannerActionButtonSx}>
            {editingHolidayId ? 'Save Planned Stop' : 'Create Planned Stop'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ShiftPlannerScreen;
