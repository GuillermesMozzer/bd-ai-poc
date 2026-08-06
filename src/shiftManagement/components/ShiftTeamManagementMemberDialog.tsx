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
import { resolveInitials } from '../utils/teamUtils';
import { teamManagementStatusStyles } from '../data/teamData';

interface ShiftTeamManagementMemberDialogProps {
  selectedTeamManagementMember: any;
  setSelectedTeamManagementMemberName: (name: string | null) => void;
}

const ShiftTeamManagementMemberDialog: React.FC<ShiftTeamManagementMemberDialogProps> = ({
  selectedTeamManagementMember,
  setSelectedTeamManagementMemberName,
}) => {
  if (!selectedTeamManagementMember) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 48,
        right: 0,
        bottom: 0,
        width: { xs: '100%', sm: 410 },
        zIndex: 1410,
        ...lightDrawerPanelSx,
        borderLeft: '1px solid rgba(148,163,184,0.16)',
        backgroundImage: 'none',
        boxShadow: '-12px 0 34px rgba(15,23,42,0.10)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(148,163,184,0.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ color: activeTheme.primary, fontWeight: 800 }}>Operator Profile</Typography>
        <IconButton size="small" onClick={() => setSelectedTeamManagementMemberName(null)} sx={lightHeaderIconButtonSx}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ p: 1.8, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.1 }}>
        <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2, border: '1px solid #DBDDDF', bgcolor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Box>
            <Typography variant="caption" sx={{ color: '#626465', fontWeight: 700 }}>Current status</Typography>
            <Typography variant="subtitle1" sx={{ color: '#1f2937', fontWeight: 800 }}>{selectedTeamManagementMember.name}</Typography>
          </Box>
          <Chip
            size="small"
            label={selectedTeamManagementMember.statusDetail}
            sx={{
              bgcolor: (teamManagementStatusStyles as any)[selectedTeamManagementMember.status].bg,
              color: (teamManagementStatusStyles as any)[selectedTeamManagementMember.status].fg,
              border: `1px solid ${(teamManagementStatusStyles as any)[selectedTeamManagementMember.status].border}`,
              fontWeight: 800,
            }}
          />
        </Paper>

        <Grid container spacing={1}>
          <Grid size={{ xs: 4.5 }}>
            <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px solid #DBDDDF', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Avatar src={selectedTeamManagementMember.photo} alt={selectedTeamManagementMember.name} sx={{ width: 108, height: 108, fontSize: 34, bgcolor: selectedTeamManagementMember.avatarTone, color: '#1d4ed8' }}>
                {resolveInitials(selectedTeamManagementMember.name)}
              </Avatar>
            </Paper>
          </Grid>
          <Grid size={{ xs: 7.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
              {[
                { label: 'Role', value: selectedTeamManagementMember.role },
                { label: 'Shift', value: `${selectedTeamManagementMember.shift} • ${selectedTeamManagementMember.timeWindow}` },
                { label: 'Zone', value: `${selectedTeamManagementMember.zone} • Line ${selectedTeamManagementMember.line}` },
                { label: 'Leave', value: selectedTeamManagementMember.upcomingVacation },
              ].map((item) => (
                <Paper key={item.label} elevation={0} sx={{ p: 0.8, borderRadius: 2, border: '1px solid #DBDDDF', bgcolor: '#f8fafc' }}>
                  <Typography variant="caption" sx={{ color: '#626465', fontWeight: 700 }}>{item.label}</Typography>
                  <Typography variant="body2" sx={{ color: '#1f2937', fontWeight: 700 }}>{item.value}</Typography>
                </Paper>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2, border: '1px solid #DBDDDF', bgcolor: '#F8FBFF' }}>
          <Typography variant="subtitle2" sx={{ color: activeTheme.primary, fontWeight: 800, mb: 0.7 }}>Monthly KPIs</Typography>
          <Grid container spacing={0.8}>
            {[
              { label: 'Worked Days', value: `${selectedTeamManagementMember.workedDays}`, tone: '#2563eb' },
              { label: 'Sick Leave', value: `${selectedTeamManagementMember.workedDays}`, tone: '#dc2626' },
              { label: 'Attendance', value: `${selectedTeamManagementMember.attendance}%`, tone: '#16a34a' },
              { label: 'Overtime', value: `${selectedTeamManagementMember.overtimeHours} h`, tone: '#EA580C' },
            ].map((item) => (
              <Grid size={{ xs: 6 }} key={item.label}>
                <Paper elevation={0} sx={{ p: 0.8, borderRadius: 1.6, border: '1px solid #DBDDDF', borderLeft: `4px solid ${item.tone}`, bgcolor: '#ffffff' }}>
                  <Typography variant="h6" sx={{ color: item.tone, fontWeight: 800, lineHeight: 1 }}>{item.value}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>{item.label}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2, border: '1px solid #DBDDDF', bgcolor: '#FFF7F0' }}>
          <Typography variant="subtitle2" sx={{ color: '#EA580C', fontWeight: 800, mb: 0.5 }}>Supervisor AI insight</Typography>
          <Typography variant="body2" sx={{ color: '#7C2D12' }}>{selectedTeamManagementMember.supervisorInsight}</Typography>
        </Paper>

        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2, border: '1px solid #DBDDDF' }}>
              <Typography variant="subtitle2" sx={{ color: activeTheme.primary, fontWeight: 800, mb: 0.7 }}>Skills</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
                {selectedTeamManagementMember.skills.map((skill: string) => (
                  <Chip key={skill} size="small" label={skill} sx={{ fontWeight: 700, bgcolor: '#EFF6FF', color: '#1D4ED8' }} />
                ))}
              </Box>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2, border: '1px solid #DBDDDF' }}>
              <Typography variant="subtitle2" sx={{ color: activeTheme.primary, fontWeight: 800, mb: 0.7 }}>Certifications</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
                {selectedTeamManagementMember.certifications.map((certification: any) => (
                  <Box key={certification.name} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: '#1f2937', fontWeight: 700 }}>{certification.name}</Typography>
                    <Typography variant="caption" sx={{ color: '#64748b' }}>{certification.expires}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        <Paper elevation={0} sx={{ p: 1.1, borderRadius: 2, border: '1px solid #DBDDDF' }}>
          <Typography variant="subtitle2" sx={{ color: activeTheme.primary, fontWeight: 800, mb: 0.7 }}>Weekly schedule</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
            {selectedTeamManagementMember.weeklySchedule.map((item: any) => (
              <Paper key={`${selectedTeamManagementMember.name}-${item.day}`} elevation={0} sx={{ px: 0.8, py: 0.65, borderRadius: 1.5, border: '1px solid #E5E7EB', bgcolor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 700 }}>{item.day}</Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>{item.note}</Typography>
                </Box>
                <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 700 }}>{item.hours}</Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ShiftTeamManagementMemberDialog;
