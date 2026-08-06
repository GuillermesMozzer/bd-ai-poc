import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';

export default function MobileReadOnlySummary() {
  return (
    <Paper elevation={0} aria-label="Waiting for QA: 8 LPs and 8 pallets. Quality review pending." sx={{ minHeight: 88, p: 1.75, display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 3, bgcolor: '#F7F9FB', backgroundImage: 'none', border: '1px solid #DDE4EB', boxShadow: 'none' }}>
      <Box aria-hidden="true" sx={{ width: 44, height: 44, flex: '0 0 44px', borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: '#EBEFF3', color: '#718397', '& svg': { fontSize: 23 } }}>
        <FactCheckOutlinedIcon />
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography sx={{ color: '#536579', fontSize: 14, fontWeight: 800, lineHeight: 1.25 }}>Waiting for QA</Typography>
        <Typography sx={{ color: '#718397', fontSize: 12.5, fontWeight: 600, lineHeight: 1.35, mt: 0.35 }}>Quality review pending</Typography>
      </Box>
      <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
        <Typography sx={{ color: '#536579', fontSize: 15, fontWeight: 850, lineHeight: 1.25 }}>8 LPs</Typography>
        <Typography sx={{ color: '#718397', fontSize: 12.5, fontWeight: 700, lineHeight: 1.3, mt: 0.25 }}>8 pallets</Typography>
      </Box>
    </Paper>
  );
}
