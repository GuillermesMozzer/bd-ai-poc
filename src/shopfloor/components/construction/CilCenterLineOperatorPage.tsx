import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import WorkstationCilCenterlineWidget from '../../../workstation/components/WorkstationCilCenterlineWidget';

type CilCenterLineOperatorPageProps = {
  discipline?: 'CIL' | 'Centerline';
};

export default function CilCenterLineOperatorPage({ discipline }: CilCenterLineOperatorPageProps) {
  const isCil = discipline !== 'Centerline';
  const title = isCil ? 'CIL Operator Workstation' : 'Centerline Operator Workstation';
  const subtitle = isCil
    ? 'Operator view for CIL execution.'
    : 'Operator view for centerline verification.';
  const overline = isCil ? 'CIL' : 'CENTERLINE';

  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: 'calc(100vh - 112px)',
        overflowY: 'auto',
        bgcolor: '#F8FAFC',
        p: { xs: 1.5, md: 2.5 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          p: { xs: 1.5, md: 2 },
          borderRadius: 3,
          border: '1px solid rgba(148,163,184,0.22)',
          bgcolor: '#FFFFFF',
          boxShadow: '0 16px 40px rgba(15,23,42,0.06)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: 'calc(100vh - 162px)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 1, flexWrap: 'wrap', mb: 1.25 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#06b6d4', fontWeight: 800, letterSpacing: '0.08em', display: 'block' }}>
              {overline}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#1F2366', lineHeight: 1.15 }}>
              {title}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', mt: 0.4 }}>
              {subtitle}
            </Typography>
          </Box>
        </Box>
        <WorkstationCilCenterlineWidget flowMode={isCil ? 'CIL' : 'CL'} pageLayout />
      </Paper>
    </Box>
  );
}

