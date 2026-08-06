import React from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';

export default function LinePerformanceScreen() {
  return (
    <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 4 }, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <ConstructionIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
      <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 1 }}>
        Line Performance
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center', maxWidth: 400 }}>
        This view is currently under construction. Please check back later.
      </Typography>
    </Box>
  );
}
