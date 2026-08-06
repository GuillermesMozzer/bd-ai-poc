import React from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Grid,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { activeTheme, lightDrawerPanelSx, lightHeaderIconButtonSx } from '../../theme';
import { getInitials } from '../utils';

interface ShiftMemberProfileDialogProps {
  selectedShiftMember: any;
  selectedShiftMemberProfile: any;
  selectedShiftMemberWeekSchedule: any[];
  getShiftMemberAvatar: (name: string) => { src: string; accent: string };
  setSelectedShiftMember: (member: any) => void;
}

const sectionCardSx = {
  p: 1.2,
  borderRadius: 3,
  border: '1px solid rgba(228,231,236,0.9)',
  bgcolor: '#FFFFFF',
  boxShadow: '0 1px 2px rgba(16,24,40,0.03)',
} as const;

const sectionEyebrowSx = {
  color: '#667085',
  fontWeight: 800,
  letterSpacing: '0.06em',
  display: 'block',
  mb: 0.75,
  fontSize: '0.68rem',
} as const;

const ShiftMemberProfileDialog: React.FC<ShiftMemberProfileDialogProps> = ({
  selectedShiftMember,
  selectedShiftMemberProfile,
  selectedShiftMemberWeekSchedule,
  getShiftMemberAvatar,
  setSelectedShiftMember,
}) => {
  if (!selectedShiftMember || !selectedShiftMemberProfile) return null;

  const trainings = selectedShiftMemberProfile.trainings ?? [];
  const requiredTrainings = selectedShiftMemberProfile.requiredTrainings ?? [];
  const certifications = selectedShiftMemberProfile.certifications ?? [];
  const detailItems = [
    { label: 'Role', value: selectedShiftMemberProfile.role },
    { label: 'Position', value: selectedShiftMemberProfile.position },
    { label: 'Crew', value: selectedShiftMemberProfile.team },
    { label: 'Location', value: selectedShiftMemberProfile.location },
    { label: 'Status', value: selectedShiftMember.status === 'absence' ? `Sick - Mar ${selectedShiftMember.dayLabel.split(' ')[1]}, 2026` : 'Available' },
    { label: 'Shift', value: selectedShiftMember.shiftLabel },
  ];
  const statItems = [
    { label: 'Working', value: `${selectedShiftMemberProfile.workingHours} h`, tone: '#2563eb' },
    { label: 'Overtime', value: `${selectedShiftMemberProfile.overtimeHours} h`, tone: '#64748b' },
    { label: 'Absence', value: `${selectedShiftMemberProfile.absenceDays} days`, tone: '#ef4444' },
    { label: 'Attendance', value: `${selectedShiftMemberProfile.attendance}%`, tone: '#0f766e' },
    { label: 'Utilization', value: `${selectedShiftMemberProfile.utilization}%`, tone: '#7c3aed' },
  ];

  const statusLabel = selectedShiftMember.status === 'absence'
    ? 'Absent'
    : selectedShiftMember.status === 'swap'
      ? 'Swap'
      : selectedShiftMember.status === 'overtime'
        ? 'Overtime'
        : 'Available';

  const statusTone = selectedShiftMember.status === 'absence'
    ? { bg: '#fee2e2', color: '#dc2626' }
    : selectedShiftMember.status === 'swap'
      ? { bg: '#dbeafe', color: '#2563eb' }
      : selectedShiftMember.status === 'overtime'
        ? { bg: '#ffedd5', color: '#c2410c' }
        : { bg: '#dcfce7', color: '#16a34a' };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 48,
        right: 0,
        bottom: 0,
        width: { xs: '100%', sm: 400 },
        zIndex: 1410,
        ...lightDrawerPanelSx,
        borderLeft: '1px solid rgba(148,163,184,0.16)',
        bgcolor: '#FFFFFF',
        backgroundImage: 'none',
        boxShadow: '-12px 0 34px rgba(15,23,42,0.10)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ px: 2.25, py: 1.8, borderBottom: '1px solid rgba(148,163,184,0.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'linear-gradient(180deg, #FFFFFF 0%, #F8FBFF 100%)' }}>
        <Box>
          <Typography variant="h6" sx={{ color: activeTheme.primary, fontWeight: 800, lineHeight: 1.1 }}>Operator Profile</Typography>
          <Typography variant="caption" sx={{ color: '#667085', fontWeight: 600 }}>Shift coverage and qualification details</Typography>
        </Box>
        <IconButton size="small" onClick={() => setSelectedShiftMember(null)} sx={lightHeaderIconButtonSx}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 1.5, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.15, bgcolor: '#FCFCFD' }}>
        <Paper elevation={0} sx={{ p: 1.4, borderRadius: 3.2, border: '1px solid rgba(228,231,236,0.92)', bgcolor: '#FFFFFF', boxShadow: '0 4px 14px rgba(16,24,40,0.04)' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1, minWidth: 0 }}>
              <Avatar
                src={getShiftMemberAvatar(selectedShiftMember.name).src}
                alt={selectedShiftMember.name}
                imgProps={{ referrerPolicy: 'no-referrer' }}
                sx={{ width: 56, height: 56, fontSize: 20, bgcolor: getShiftMemberAvatar(selectedShiftMember.name).accent, color: '#1d4ed8', border: '1px solid rgba(148,163,184,0.24)', flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.4)' }}
              >
                {getInitials(selectedShiftMember.name)}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: '#98A2B3', fontWeight: 800, letterSpacing: '0.08em' }}>WORKER</Typography>
                <Typography variant="subtitle1" sx={{ color: '#1f2937', fontWeight: 800, lineHeight: 1.12, mt: 0.1 }}>{selectedShiftMember.name}</Typography>
                <Typography variant="body2" sx={{ color: '#667085', fontWeight: 600, mt: 0.28 }}>
                  {selectedShiftMemberProfile.role} - {selectedShiftMemberProfile.team}
                </Typography>
              </Box>
            </Box>
            <Chip
              size="small"
              label={statusLabel}
              sx={{
                bgcolor: statusTone.bg,
                color: statusTone.color,
                fontWeight: 800,
                height: 24,
                mt: 0.15,
              }}
            />
          </Box>
          <Box sx={{ mt: 1.15, pt: 1.05, borderTop: '1px solid #F2F4F7', display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', columnGap: 1.2, rowGap: 0.95 }}>
            {detailItems.map((item) => (
              <Box key={item.label} sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: '#98A2B3', fontWeight: 700, display: 'block', lineHeight: 1.1, textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.03em' }}>{item.label}</Typography>
                <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 700, mt: 0.22, lineHeight: 1.25, wordBreak: 'break-word' }}>{item.value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Grid container spacing={0.9}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ ...sectionCardSx, height: '100%' }}>
              <Typography variant="caption" sx={sectionEyebrowSx}>SUPERVISOR INSIGHT</Typography>
              <Typography variant="body2" sx={{ color: '#344054', fontWeight: 600, lineHeight: 1.55 }}>{selectedShiftMemberProfile.supervisorInsight}</Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ ...sectionCardSx, height: '100%', borderColor: 'rgba(178,221,255,0.9)', bgcolor: '#F5FAFF', background: 'linear-gradient(180deg, #F8FBFF 0%, #F5FAFF 100%)' }}>
              <Typography variant="caption" sx={{ ...sectionEyebrowSx, color: '#1D4ED8' }}>BLU.AI OVERVIEW</Typography>
              <Typography variant="body2" sx={{ color: '#194185', fontWeight: 600, lineHeight: 1.55 }}>{selectedShiftMemberProfile.bluAiOverview}</Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box>
          <Typography variant="caption" sx={sectionEyebrowSx}>CURRENT MONTH</Typography>
          <Grid container spacing={0.8}>
            {statItems.map((item) => (
              <Grid size={{ xs: 4 }} key={item.label}>
                <Paper elevation={0} sx={{ p: 0.9, borderRadius: 2.5, border: '1px solid rgba(228,231,236,0.9)', bgcolor: '#FFFFFF', minHeight: 74, boxShadow: '0 1px 2px rgba(16,24,40,0.03)' }}>
                  <Typography sx={{ color: item.tone, fontSize: '0.92rem', fontWeight: 900, lineHeight: 1.02 }}>{item.value}</Typography>
                  <Typography variant="caption" sx={{ color: '#98A2B3', fontWeight: 800, display: 'block', mt: 0.42, lineHeight: 1.15, textTransform: 'uppercase', fontSize: '0.58rem', letterSpacing: '0.03em' }}>{item.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Paper elevation={0} sx={sectionCardSx}>
          <Typography variant="caption" sx={sectionEyebrowSx}>SKILLS</Typography>
          <Box sx={{ display: 'flex', gap: 0.55, flexWrap: 'wrap' }}>
            {(selectedShiftMemberProfile.skills ?? []).map((skill: string) => (
              <Chip key={skill} label={skill} size="small" sx={{ fontWeight: 700, bgcolor: '#F8FAFC', color: '#344054', border: '1px solid #EAECF0', borderRadius: 999, '& .MuiChip-label': { px: 1 } }} />
            ))}
          </Box>
        </Paper>

        <Grid container spacing={0.9}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ ...sectionCardSx, height: '100%' }}>
              <Typography variant="caption" sx={sectionEyebrowSx}>TRAININGS</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
                {trainings.map((training: string) => (
                  <Box key={training} sx={{ px: 0.1, py: 0.1 }}>
                    <Typography variant="body2" sx={{ color: '#344054', fontWeight: 600, lineHeight: 1.4 }}>{training}</Typography>
                    <Box sx={{ mt: 0.65, borderBottom: '1px solid #F2F4F7' }} />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ ...sectionCardSx, height: '100%', borderColor: 'rgba(219,234,254,0.95)' }}>
              <Typography variant="caption" sx={{ ...sectionEyebrowSx, color: '#1D4ED8' }}>REQUIRED TRAINING</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
                {requiredTrainings.map((training: string) => (
                  <Box key={training} sx={{ px: 0.1, py: 0.1 }}>
                    <Typography variant="body2" sx={{ color: '#1d4ed8', fontWeight: 600, lineHeight: 1.4 }}>{training}</Typography>
                    <Box sx={{ mt: 0.65, borderBottom: '1px solid #DBEAFE' }} />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={0.9}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ ...sectionCardSx, height: '100%' }}>
              <Typography variant="caption" sx={sectionEyebrowSx}>CERTIFICATIONS</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
                {certifications.map((certification: string) => (
                  <Box key={certification} sx={{ px: 0.1, py: 0.1 }}>
                    <Typography variant="body2" sx={{ color: '#344054', fontWeight: 600, lineHeight: 1.4 }}>{certification}</Typography>
                    <Box sx={{ mt: 0.65, borderBottom: '1px solid #F2F4F7' }} />
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper elevation={0} sx={{ ...sectionCardSx, height: '100%', bgcolor: '#F9FAFB' }}>
              <Typography variant="caption" sx={sectionEyebrowSx}>PLANNING NOTES</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#98A2B3', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.03em' }}>Upcoming Vacation</Typography>
                  <Typography variant="body2" sx={{ color: '#344054', fontWeight: 600, mt: 0.18 }}>{selectedShiftMemberProfile.upcomingVacation}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#98A2B3', fontWeight: 800, textTransform: 'uppercase', fontSize: '0.62rem', letterSpacing: '0.03em' }}>Shift Window</Typography>
                  <Typography variant="body2" sx={{ color: '#344054', fontWeight: 600, mt: 0.18 }}>{selectedShiftMember.shiftHours}</Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={sectionCardSx}>
          <Typography variant="caption" sx={sectionEyebrowSx}>THIS WEEK'S SCHEDULE</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
            {selectedShiftMemberWeekSchedule.map((item) => (
              <Box
                key={`${item.day}-${item.date}`}
                sx={{
                  px: 0.2,
                  py: 0.45,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  borderBottom: '1px solid #F2F4F7',
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{item.day}</Typography>
                  <Typography variant="caption" sx={{ color: '#667085' }}>{item.date}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{item.shift}</Typography>
                  <Typography variant="caption" sx={{ color: item.status === 'absence' ? '#DC2626' : '#667085', fontWeight: item.status === 'absence' ? 700 : 600 }}>{item.hours || 'Off'}</Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ShiftMemberProfileDialog;
