import { useState } from 'react';
import { Avatar, Box, Button, Chip, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, TextField, Typography, TextField as MuiTextField } from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome as SparkleIcon,
  BuildCircle as BuildCircleIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  OpenInFull as OpenInFullIcon,
  Search as SearchIcon,
  Star as StarIcon,
  WarningAmber as WarningAmberIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import type { MaintenanceTeamMember } from '../types';

type ActiveTheme = {
  primary: string;
};

import { maintenanceTeamMembersInitial } from '../data';

type MaintenanceMyTeamPageProps = {
  activeTheme?: ActiveTheme;
};

const teamMemberPhotos: Record<string, string> = {
  'Carlos Mendez-Operator': 'https://i.pravatar.cc/96?img=12',
  'Noah Philis-Process Analyst': 'https://i.pravatar.cc/96?img=11',
  'Marcus Noladim-Process Engineer': 'https://i.pravatar.cc/96?img=52',
  'Maria Pinna-Technician': 'https://i.pravatar.cc/96?img=44',
  'John Miranda-Operator': 'https://i.pravatar.cc/96?img=15',
  'Indio Chillerpa-Analyst': 'https://i.pravatar.cc/96?img=61',
  'Juliana Machado-Line Leader': 'https://i.pravatar.cc/96?img=35',
  'Emma Jameson-Technician': 'https://i.pravatar.cc/96?img=45',
  'Sergio Roswell-Analyst': 'https://i.pravatar.cc/96?img=53',
  'Marcus Noladim-Mechanic': 'https://i.pravatar.cc/96?img=60',
  'Jesus Alba-Line Mechanic': 'https://i.pravatar.cc/96?img=59',
};

const fallbackPhotos = [
  'https://i.pravatar.cc/96?img=13',
  'https://i.pravatar.cc/96?img=14',
  'https://i.pravatar.cc/96?img=16',
  'https://i.pravatar.cc/96?img=17',
];

const memberDetails: Record<string, { shift: string; ptoScheduled: string; capacity: string; machines: string }> = {
  'Carlos Mendez-Operator': {
    shift: 'Day',
    ptoScheduled: 'Team C',
    capacity: 'Packaging Line Operation / Autonomous Maintenance',
    machines: 'Packaging Station / Labeling Station / Case Packer',
  },
  'Noah Philis-Process Analyst': {
    shift: 'Day',
    ptoScheduled: 'Team C',
    capacity: 'Process Analytics / Line Balancing / Loss Analysis',
    machines: 'OEE Dashboard / Packaging Station / Filling Line',
  },
  'Marcus Noladim-Process Engineer': {
    shift: 'Night',
    ptoScheduled: 'Team B',
    capacity: 'Process Optimization / Preventive Maintenance',
    machines: 'Plastic Extruder / Molding Machine / Utilities Panel',
  },
  'Maria Pinna-Technician': {
    shift: 'Day',
    ptoScheduled: 'Team C',
    capacity: 'Molding Machine Maintenance / Metal Mold Making',
    machines: 'Plastic Extruder / Molding Machine / Packaging Station',
  },
  'John Miranda-Operator': {
    shift: 'Day',
    ptoScheduled: 'Team A',
    capacity: 'Line Operation / Changeover / Safety Checks',
    machines: 'Filling Line / Conveyor / Packaging Station',
  },
  'Indio Chillerpa-Analyst': {
    shift: 'Night',
    ptoScheduled: 'Team B',
    capacity: 'Root Cause Analysis / Work Order Review',
    machines: 'CMMS / Quality Station / Molding Machine',
  },
  'Emma Jameson-Technician': {
    shift: 'Morning',
    ptoScheduled: 'Team B',
    capacity: 'Electrical Troubleshooting / Planned Maintenance',
    machines: 'Servo Press / PLC Cabinet / Packaging Station',
  },
  'Jesus Alba-Line Mechanic': {
    shift: 'Day',
    ptoScheduled: 'Team A',
    capacity: 'Mechanical Repair / Lubrication / Line Setup',
    machines: 'Conveyor / Plastic Extruder / Palletizer',
  },
};

function getTeamMemberPhoto(member: MaintenanceTeamMember, index: number) {
  return teamMemberPhotos[`${member.name}-${member.role}`] ?? fallbackPhotos[index % fallbackPhotos.length];
}

function getMemberDetails(member: MaintenanceTeamMember) {
  return memberDetails[`${member.name}-${member.role}`] ?? {
    shift: member.team === 'Morning' ? 'Morning' : 'Day',
    ptoScheduled: member.team,
    capacity: `${member.role} Training / Maintenance Operations`,
    machines: 'Packaging Station / Molding Machine / Work Order Terminal',
  };
}

export default function MaintenanceMyTeamPage({
  activeTheme = { primary: '#044ED7' },
}: MaintenanceMyTeamPageProps) {
  const [maintenanceSearch, setMaintenanceSearch] = useState('');
  const [maintenanceTeamFilter, setMaintenanceTeamFilter] = useState<'All' | 'Team A' | 'Team B' | 'Team C' | 'Morning'>('All');
  const [maintenanceTeamStatusFilter, setMaintenanceTeamStatusFilter] = useState<'All' | 'Available' | 'Vacation' | 'On Shift'>('All');
  const [maintenanceTeamMembers, setMaintenanceTeamMembers] = useState<MaintenanceTeamMember[]>(maintenanceTeamMembersInitial);

  const [isMaintenanceMemberDrawerOpen, setIsMaintenanceMemberDrawerOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('');
  const [newMemberTeam, setNewMemberTeam] = useState<'Team A' | 'Team B' | 'Team C' | 'Morning'>('Team A');
  const [newMemberStatus, setNewMemberStatus] = useState<'Available' | 'Vacation' | 'On Shift'>('Available');

  const onOpenAddMember = () => setIsMaintenanceMemberDrawerOpen(true);

  const saveMaintenanceMember = () => {
    const newMember: MaintenanceTeamMember = {
      name: newMemberName,
      role: newMemberRole,
      team: newMemberTeam,
      status: newMemberStatus,
    };
    setMaintenanceTeamMembers([...maintenanceTeamMembers, newMember]);
    setIsMaintenanceMemberDrawerOpen(false);
    resetMaintenanceMemberForm();
  };

  const resetMaintenanceMemberForm = () => {
    setNewMemberName('');
    setNewMemberRole('');
    setNewMemberTeam('Team A');
    setNewMemberStatus('Available');
  };

  const lightHeaderIconButtonSx = {
    color: '#475569',
    bgcolor: '#f1f5f9',
    '&:hover': { bgcolor: '#e2e8f0', color: '#0f172a' }
  };

  const [selectedMember, setSelectedMember] = useState<{ member: MaintenanceTeamMember; photo: string } | null>(null);
  const selectedMemberDetails = selectedMember ? getMemberDetails(selectedMember.member) : null;

  const filteredMaintenanceTeamMembers = maintenanceTeamMembers.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(maintenanceSearch.toLowerCase()) || m.role.toLowerCase().includes(maintenanceSearch.toLowerCase());
    const matchesTeam = maintenanceTeamFilter === 'All' || m.team === maintenanceTeamFilter;
    const matchesStatus = maintenanceTeamStatusFilter === 'All' || m.status === maintenanceTeamStatusFilter;
    return matchesSearch && matchesTeam && matchesStatus;
  });

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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ maxWidth: 920 }}>
            <Typography variant="h5" sx={{ color: '#101828', fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.6rem' }, lineHeight: 1.05, letterSpacing: '-0.03em', mt: 0.15 }}>
              Maintenance My Team
            </Typography>
            <Typography variant="caption" sx={{ color: '#475467', mt: 0.35, display: 'block', maxWidth: 760, lineHeight: 1.3, fontSize: '0.78rem' }}>
              Track technician availability, shift coverage, and BLU.AI staffing alerts across maintenance teams.
            </Typography>
          </Box>
          <Chip
            size="small"
            icon={<BuildCircleIcon sx={{ fontSize: 14 }} />}
            label={`${filteredMaintenanceTeamMembers.length} members`}
            sx={{
              height: 26,
              borderRadius: 99,
              bgcolor: '#EFF6FF',
              color: '#044ED7',
              border: '1px solid #BFDBFE',
              fontWeight: 800,
              '& .MuiChip-icon': { color: '#044ED7', ml: 0.8 },
            }}
          />
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 1.5,
            border: '1px solid #BFDBFE',
            bgcolor: '#EFF6FF',
            px: 1.1,
            py: 0.75,
            mb: 1.1,
            boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.45 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0 }}>
              <SparkleIcon sx={{ color: '#FF6E00', fontSize: 18, flexShrink: 0 }} />
              <Typography variant="subtitle2" sx={{ color: '#044ED7', fontWeight: 900, lineHeight: 1 }}>
                BLU.AI Detected Alerts
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
              <Button size="small" endIcon={<KeyboardArrowDownIcon />} sx={{ minWidth: 0, color: '#64748B', fontSize: '0.65rem', fontWeight: 800, px: 0.4 }}>
                Collapse
              </Button>
              <IconButton size="small" sx={{ width: 22, height: 22, color: '#2563EB' }}>
                <StarIcon sx={{ fontSize: 15 }} />
              </IconButton>
              <IconButton size="small" sx={{ width: 22, height: 22, color: '#2563EB' }}>
                <OpenInFullIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          </Box>
          <Box
            sx={{
              borderRadius: 1,
              bgcolor: '#DBEAFE',
              px: 1.1,
              py: 0.65,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, minWidth: 0 }}>
              <WarningAmberIcon sx={{ color: '#FF6E00', fontSize: 22, flexShrink: 0 }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ display: 'block', color: '#044ED7', fontWeight: 900, lineHeight: 1.05 }}>
                  Emma Jameson
                </Typography>
                <Typography variant="caption" sx={{ display: 'block', color: '#044ED7', fontWeight: 600, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Try switching Emma&apos;s work shift to the night shift.
                </Typography>
              </Box>
            </Box>
            <Button
              size="small"
              endIcon={<KeyboardArrowRightIcon />}
              sx={{ color: '#044ED7', fontSize: '0.68rem', fontWeight: 900, minWidth: 112, flexShrink: 0, px: 0.7 }}
            >
              Tell me more
            </Button>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.5, border: '1px solid #DBDDDF', bgcolor: '#FFFFFF', mb: 1.4 }}>
          <Grid container spacing={1.2} alignItems="center">
            <Grid size={{ xs: 12, md: 3.8 }}>
              <TextField
                size="small"
                label="Search"
                placeholder="Name, Role..."
                value={maintenanceSearch}
                onChange={(event) => setMaintenanceSearch(event.target.value)}
                fullWidth
                InputProps={{ endAdornment: <SearchIcon sx={{ color: activeTheme.primary }} /> }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2.2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Team</InputLabel>
                <Select label="Team" value={maintenanceTeamFilter} onChange={(event) => setMaintenanceTeamFilter(event.target.value as any)}>
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Team A">Team A</MenuItem>
                  <MenuItem value="Team B">Team B</MenuItem>
                  <MenuItem value="Team C">Team C</MenuItem>
                  <MenuItem value="Morning">Morning</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 2.2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={maintenanceTeamStatusFilter}
                  onChange={(event) => setMaintenanceTeamStatusFilter(event.target.value as any)}
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Available">Available</MenuItem>
                  <MenuItem value="Vacation">Vacation</MenuItem>
                  <MenuItem value="On Shift">On Shift</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 3.8 }}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={onOpenAddMember} sx={{ borderRadius: 1.2, fontWeight: 900, textTransform: 'uppercase', px: 1.6 }}>
                  Add Member
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Grid container spacing={1.2}>
          {filteredMaintenanceTeamMembers.map((member, index) => {
            const initials = member.name
              .split(' ')
              .map((name) => name[0])
              .slice(0, 2)
              .join('');
            const isVacation = member.status === 'Vacation';

            return (
              <Grid key={`${member.name}-${member.role}-${index}`} size={{ xs: 12, sm: 6, lg: 3 }}>
                <Paper
                  component="button"
                  type="button"
                  elevation={0}
                  onClick={() => setSelectedMember({ member, photo: getTeamMemberPhoto(member, index) })}
                  sx={{
                    width: '100%',
                    p: 1.15,
                    borderRadius: 1.2,
                    border: '1px solid #DBDDDF',
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 1px 3px rgba(15,23,42,0.16)',
                    minHeight: 68,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
                    '&:hover': {
                      borderColor: '#93C5FD',
                      boxShadow: '0 6px 16px rgba(15,23,42,0.14)',
                      transform: 'translateY(-1px)',
                    },
                    '&:focus-visible': {
                      outline: '3px solid rgba(37,99,235,0.22)',
                      outlineOffset: 2,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.05, minWidth: 0 }}>
                      <Avatar
                        src={getTeamMemberPhoto(member, index)}
                        imgProps={{ referrerPolicy: 'no-referrer' }}
                        sx={{ width: 38, height: 38, bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 800, flexShrink: 0 }}
                      >
                        {initials}
                      </Avatar>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="subtitle2" sx={{ color: '#044ED7', fontWeight: 900, lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {member.name}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: '#1f4aa8', fontWeight: 700, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {member.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, flexShrink: 0 }}>
                      <Typography variant="caption" sx={{ color: '#626465', fontWeight: 600 }}>
                        {member.team}
                      </Typography>
                      <Box
                        component="span"
                        sx={{
                          px: 1,
                          py: 0.35,
                          borderRadius: 999,
                          bgcolor: isVacation ? '#f3f4f6' : '#eff6ff',
                          color: isVacation ? '#6b7280' : '#2563eb',
                          border: `1px solid ${isVacation ? '#d1d5db' : '#93c5fd'}`,
                          fontWeight: 800,
                          fontSize: '0.58rem',
                          lineHeight: 1,
                        }}
                      >
                        {member.status.toUpperCase()}
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {selectedMember && selectedMemberDetails ? (
          <Box
            sx={{
              position: 'fixed',
              top: 48,
              right: 0,
              bottom: 0,
              width: { xs: '100%', sm: 430 },
              zIndex: 1406,
              p: 0,
              display: 'flex',
              flexDirection: 'column',
              bgcolor: '#f8fcfd',
              backgroundImage: 'none',
              borderLeft: '1px solid rgba(148,163,184,0.16)',
              boxShadow: '-12px 0 34px rgba(15,23,42,0.10)',
            }}
          >
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: activeTheme.primary }}>
                Team Member
              </Typography>
              <IconButton
                size="small"
                onClick={() => setSelectedMember(null)}
                aria-label="Close team member details"
                sx={{
                  color: '#1e40af',
                  border: '1px solid rgba(148,163,184,0.18)',
                  bgcolor: '#ffffff',
                  transition: 'all 0.2s ease',
                  '&:hover': { bgcolor: '#f5f8ff', borderColor: 'rgba(37,99,235,0.22)', transform: 'translateY(-1px)' },
                  '&:focus-visible': { outline: '3px solid rgba(37,99,235,0.22)', outlineOffset: 2 },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            <Box sx={{ p: 2.5, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.1 }}>
              <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2, border: '1px solid #DBDDDF', bgcolor: '#FFFFFF' }}>
                <Typography variant="caption" sx={{ display: 'block', color: '#626465', fontWeight: 700, lineHeight: 1 }}>
                  Name
                </Typography>
                <Typography variant="body2" sx={{ color: '#101828', fontWeight: 700, mt: 0.35 }}>
                  {selectedMember.member.name}
                </Typography>
              </Paper>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.1, alignItems: 'stretch' }}>
                <Paper elevation={0} sx={{ p: 1.3, borderRadius: 2, border: '1px solid #DBDDDF', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 148 }}>
                  <Avatar
                    src={selectedMember.photo}
                    imgProps={{ referrerPolicy: 'no-referrer' }}
                    sx={{ width: 118, height: 118, bgcolor: '#dbeafe', color: '#1d4ed8', fontWeight: 900, fontSize: '2rem' }}
                  >
                    {selectedMember.member.name
                      .split(' ')
                      .map((name) => name[0])
                      .slice(0, 2)
                      .join('')}
                  </Avatar>
                </Paper>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
                  <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2, border: '1px solid #DBDDDF', bgcolor: '#FFFFFF', flex: 1 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: '#626465', fontWeight: 700, lineHeight: 1 }}>
                      Role
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#101828', fontWeight: 700, mt: 0.35, lineHeight: 1.1 }}>
                      {selectedMember.member.role}
                    </Typography>
                  </Paper>
                  <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2, border: '1px solid #DBDDDF', bgcolor: '#FFFFFF', flex: 1 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: '#626465', fontWeight: 700, lineHeight: 1 }}>
                      Team
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#101828', fontWeight: 700, mt: 0.35 }}>
                      {selectedMember.member.team}
                    </Typography>
                  </Paper>
                </Box>
              </Box>

              {[
                ['Shift', selectedMemberDetails.shift],
                ['Capacity / Trainings / Certifications', selectedMemberDetails.capacity],
                ['Authorized machines', selectedMemberDetails.machines],
              ].map(([label, value]) => (
                <Paper key={label} elevation={0} sx={{ p: 1.1, borderRadius: 2, border: '1px solid #DBDDDF', bgcolor: '#FFFFFF' }}>
                  <Typography variant="caption" sx={{ display: 'block', color: '#626465', fontWeight: 700, lineHeight: 1 }}>
                    {label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#101828', fontWeight: 700, mt: 0.35, lineHeight: 1.2 }}>
                    {value}
                  </Typography>
                </Paper>
              ))}
            </Box>

            <Box sx={{ mt: 'auto', p: 2.5, borderTop: '1px solid rgba(148,163,184,0.16)', display: 'flex', justifyContent: 'flex-end', gap: 1.2, flexWrap: 'wrap' }}>
              <Button variant="text" color="error" size="small" startIcon={<DeleteOutlineIcon />} sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
                Remove from my team
              </Button>
              <Button variant="outlined" size="small" startIcon={<CloseIcon />} onClick={() => setSelectedMember(null)} sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
                Close
              </Button>
            </Box>
          </Box>
        ) : null}

        {isMaintenanceMemberDrawerOpen ? (
          <Box
            sx={{
              position: 'fixed',
              top: 48,
              right: 0,
              bottom: 0,
              width: { xs: '100%', sm: 510 },
              zIndex: 1406,
              bgcolor: '#f8fcfd',
              borderLeft: '1px solid rgba(148,163,184,0.16)',
              backgroundImage: 'none',
              boxShadow: '-12px 0 34px rgba(15,23,42,0.10)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(148,163,184,0.16)' }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: activeTheme.primary }}>Add Team Member</Typography>
              <IconButton
                size="small"
                onClick={() => {
                  setIsMaintenanceMemberDrawerOpen(false);
                  resetMaintenanceMemberForm();
                }}
                sx={lightHeaderIconButtonSx}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={{ p: 2.5, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Paper elevation={0} sx={{ p: 1.4, borderRadius: 2.5, border: '1px solid #DBDDDF', bgcolor: '#eef4ff' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#044ED7' }}>
                  <SparkleIcon sx={{ fontSize: 15, mr: 0.6, verticalAlign: '-2px' }} />
                  BLU.AI Assistant
                </Typography>
                <Typography variant="body2" sx={{ color: '#1f4aa8', mt: 0.45 }}>
                  I can suggest role, team, and shift based on workload and planner demand.
                </Typography>
              </Paper>
              <MuiTextField size="small" label="Full Name" placeholder="Name..." fullWidth value={newMemberName} onChange={(event) => setNewMemberName(event.target.value)} />
              <MuiTextField size="small" label="Role" placeholder="Role..." fullWidth value={newMemberRole} onChange={(event) => setNewMemberRole(event.target.value)} />
              <Grid container spacing={1.2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Team</InputLabel>
                    <Select value={newMemberTeam} label="Team" onChange={(event) => setNewMemberTeam(event.target.value as any)}>
                      <MenuItem value="Team A">Team A</MenuItem>
                      <MenuItem value="Team B">Team B</MenuItem>
                      <MenuItem value="Team C">Team C</MenuItem>
                      <MenuItem value="Morning">Morning</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select value={newMemberStatus} label="Status" onChange={(event) => setNewMemberStatus(event.target.value as any)}>
                      <MenuItem value="Available">Available</MenuItem>
                      <MenuItem value="On Shift">On Shift</MenuItem>
                      <MenuItem value="Vacation">Vacation</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <MuiTextField size="small" label="Shift" placeholder="e.g. Day Shift" fullWidth />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <MuiTextField size="small" label="Start Date" placeholder="Select..." fullWidth />
                </Grid>
              </Grid>
            </Box>
            <Box sx={{ mt: 'auto', p: 2.5, borderTop: '1px solid rgba(148,163,184,0.16)', display: 'flex', justifyContent: 'flex-end', gap: 1.2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsMaintenanceMemberDrawerOpen(false);
                  resetMaintenanceMemberForm();
                }}
                startIcon={<CloseIcon />}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={saveMaintenanceMember} startIcon={<CheckIcon />} disabled={!newMemberName.trim() || !newMemberRole.trim()}>
                Save Member
              </Button>
            </Box>
          </Box>
        ) : null}
      </Paper>
    </Box>
  );
}
