import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
} from '@mui/material';
import { activeTheme } from '../../theme';

import { useShiftManagementContext } from '../contexts/ShiftManagementContext';

interface ShiftSiteOrganogramScreenProps {
  orgChartDraft: {
    siteDirector: string;
    operationsManager: string;
    qualityLead: string;
    maintenanceLead: string;
    shiftLeads: string[];
  };
}

const ShiftSiteOrganogramScreen: React.FC<ShiftSiteOrganogramScreenProps> = ({
  orgChartDraft,
}) => {
  const { renderShiftSchedulePersistentActions } = useShiftManagementContext();
  const workforceHealthKpis = [
    { label: 'Active overtime', value: 7, sub: 'workforce fatigue risk', tone: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
    { label: 'Attendance issues', value: 4, sub: 'late / absent today', tone: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
    { label: 'Open slots', value: 5, sub: 'staffing gaps', tone: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
    { label: 'PTO conflicts', value: 2, sub: 'future shortages', tone: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    { label: 'Skill shortages', value: 3, sub: 'certification risk', tone: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  ];

  const teamGapRows = [
    {
      leader: orgChartDraft.shiftLeads[0] ?? 'Crew Lead A',
      line: 'Line A',
      area: 'Packaging / Filling',
      staffed: 12,
      required: 15,
      openRoles: 3,
      overtime: 2,
      missingCerts: 1,
      tone: '#2563EB',
    },
    {
      leader: orgChartDraft.shiftLeads[1] ?? 'Crew Lead B',
      line: 'Line B',
      area: 'Cartoner / Case Packer',
      staffed: 10,
      required: 12,
      openRoles: 2,
      overtime: 3,
      missingCerts: 0,
      tone: '#0F766E',
    },
    {
      leader: orgChartDraft.shiftLeads[2] ?? 'Crew Lead C',
      line: 'Line C',
      area: 'Utilities / Support',
      staffed: 8,
      required: 11,
      openRoles: 3,
      overtime: 1,
      missingCerts: 2,
      tone: '#B45309',
    },
  ];

  if (!orgChartDraft) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">No organogram data available.</Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 1.6,
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
            <Typography variant="caption" sx={{ color: activeTheme.primary, letterSpacing: '0.08em', fontWeight: 800, textTransform: 'uppercase' }}>
              OPERATIONS STRUCTURE
            </Typography>
            <Typography variant="h5" sx={{ color: activeTheme.textPrimary, fontWeight: 800, mt: 0.2 }}>
              Operations Ownership View
            </Typography>
            <Typography variant="caption" sx={{ color: activeTheme.textSecondary, mt: 0.35, display: 'block' }}>
              View operational ownership, escalation paths, and staffing risk signals across Shift Schedule leadership.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', lg: 'flex-end' }, alignItems: 'flex-start', minWidth: 0 }}>
            {renderShiftSchedulePersistentActions()}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 1.6, borderRadius: 2.5, border: '1px solid #DBE3F1', mb: 1.5, bgcolor: '#FFFFFF' }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.35,
              borderRadius: 2.3,
              border: '1px solid #D8E2F2',
              bgcolor: '#FFFFFF',
              mb: 1.35,
            }}
          >
            <Typography variant="subtitle1" sx={{ color: '#1F2937', fontWeight: 900, mb: 0.2 }}>
              Workforce Health Dashboard
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1 }}>
              Leadership signals for fatigue, attendance, open roles, PTO conflicts, and skill risks. Workforce assignment remains managed in Crew Setup.
            </Typography>
            <Grid container spacing={0.9}>
              {workforceHealthKpis.map((kpi) => (
                <Grid key={`org-kpi-${kpi.label}`} size={{ xs: 12, sm: 6, md: 2.4 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      border: `1px solid ${kpi.border}`,
                      bgcolor: kpi.bg,
                      height: '100%',
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase' }}>
                      {kpi.label}
                    </Typography>
                    <Typography variant="h5" sx={{ color: kpi.tone, fontWeight: 900, lineHeight: 1.05, mt: 0.4 }}>
                      {kpi.value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#475569' }}>
                      {kpi.sub}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>

          <Typography variant="subtitle1" sx={{ color: '#1F2937', fontWeight: 800, mb: 0.3 }}>
            Operations Organogram
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 1.3 }}>
            Site-level hierarchy by function, showing operational ownership and line accountability without changing assignments.
          </Typography>
          <Box
            sx={{
              mt: 0.4,
              p: { xs: 1.1, md: 2 },
              borderRadius: 3,
              border: '1px solid #E2E8F0',
              background:
                'radial-gradient(circle at 18% 20%, rgba(59,130,246,0.08) 0%, rgba(255,255,255,0) 36%), radial-gradient(circle at 82% 12%, rgba(16,185,129,0.08) 0%, rgba(255,255,255,0) 30%), #FBFDFF',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Paper
                elevation={0}
                sx={{
                  px: 2.4,
                  py: 1.4,
                  borderRadius: 2.5,
                  border: '1px solid #93C5FD',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 14px 32px rgba(29,78,216,0.14)',
                  minWidth: 290,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: '#1D4ED8', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Site Manager / Leader</Typography>
                <Typography variant="subtitle1" sx={{ color: '#0F172A', fontWeight: 900, mt: 0.3 }}>{orgChartDraft.siteDirector}</Typography>
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Box sx={{ width: 2, height: 28, bgcolor: '#BFD3F8', borderRadius: 999 }} />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.4 }}>
              <Paper
                elevation={0}
                sx={{
                  px: 2.4,
                  py: 1.2,
                  borderRadius: 2.4,
                  border: '1px solid #86EFAC',
                  bgcolor: '#FFFFFF',
                  boxShadow: '0 12px 28px rgba(5,150,105,0.12)',
                  minWidth: 280,
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" sx={{ color: '#047857', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Operations</Typography>
                <Typography variant="subtitle2" sx={{ color: '#0F172A', fontWeight: 900, mt: 0.25 }}>{orgChartDraft.operationsManager}</Typography>
              </Paper>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ width: { xs: '72%', md: '82%' }, height: 2, bgcolor: '#CBD5E1', borderRadius: 999 }} />
            </Box>

            <Grid container spacing={1.6} sx={{ mt: 0.2 }}>
              {[
                { title: 'Quality', lead: orgChartDraft.qualityLead, tone: '#7C3AED', border: '#DDD6FE', badge: '#F5F3FF', note: 'Standards and release' },
                { title: 'Maintenance', lead: orgChartDraft.maintenanceLead, tone: '#DC2626', border: '#FECACA', badge: '#FEF2F2', note: 'Assets and interventions' },
                { title: 'Shift Leads', lead: orgChartDraft.shiftLeads.join(' / '), tone: '#EA580C', border: '#FED7AA', badge: '#FFF7ED', note: 'Shift execution ownership' },
              ].map((node) => (
                <Grid key={`org-func-${node.title}`} size={{ xs: 12, md: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.6 }}>
                    <Box sx={{ width: 2, height: 20, bgcolor: '#CBD5E1', borderRadius: 999 }} />
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.35,
                      borderRadius: 2.3,
                      border: `1px solid ${node.border}`,
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
                      minHeight: 114,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: node.tone, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{node.title}</Typography>
                        <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 800, mt: 0.25 }}>{node.lead}</Typography>
                      </Box>
                      <Chip size="small" label="Lead" sx={{ bgcolor: node.badge, color: node.tone, border: `1px solid ${node.border}`, fontWeight: 800 }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.6 }}>{node.note}</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper
              elevation={0}
              sx={{
                p: 1.35,
                borderRadius: 2.3,
                border: '1px solid #D8E2F2',
                bgcolor: '#FFFFFF',
                mt: 1.8,
              }}
            >
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Ownership To Production Line Mapping
              </Typography>
              <Grid container spacing={1} sx={{ mt: 0.35 }}>
                {teamGapRows.map((item) => {
                  const coveragePct = Math.round((item.staffed / item.required) * 100);
                  const isOverloaded = item.overtime >= 3 || item.openRoles >= 3;
                  return (
                  <Grid key={`line-map-modern-${item.leader}`} size={{ xs: 12, md: 4 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.05,
                        borderRadius: 2,
                        border: `1px solid ${item.tone}33`,
                        bgcolor: '#FFFFFF',
                        height: '100%',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.7, alignItems: 'flex-start' }}>
                        <Typography variant="body2" sx={{ color: '#1F2937', fontWeight: 900 }}>{item.leader}</Typography>
                        <Chip
                          size="small"
                          label={isOverloaded ? 'Overloaded team' : 'Balanced'}
                          sx={{
                            height: 22,
                            bgcolor: isOverloaded ? '#FEF2F2' : '#ECFDF5',
                            color: isOverloaded ? '#DC2626' : '#059669',
                            border: `1px solid ${isOverloaded ? '#FECACA' : '#BBF7D0'}`,
                            fontWeight: 800,
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: item.tone, fontWeight: 800, display: 'block', mt: 0.2 }}>{item.line}</Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mb: 0.75 }}>{item.area}</Typography>
                      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.7 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800 }}>Staffing</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 900, color: '#0F172A' }}>{item.staffed}/{item.required}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800 }}>Open roles</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 900, color: '#1D4ED8' }}>{item.openRoles}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 800 }}>Overtime</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 900, color: item.overtime > 0 ? '#EA580C' : '#16A34A' }}>{item.overtime}</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 0.75, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                          Coverage: <Box component="span" sx={{ color: coveragePct < 85 ? '#DC2626' : '#059669', fontWeight: 900 }}>{coveragePct}%</Box>
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 700 }}>
                          Missing certs: <Box component="span" sx={{ color: item.missingCerts > 0 ? '#B45309' : '#16A34A', fontWeight: 900 }}>{item.missingCerts}</Box>
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                )})}
              </Grid>
            </Paper>
          </Box>
        </Paper>
      </Paper>
    </Box>
  );
};

export default ShiftSiteOrganogramScreen;
