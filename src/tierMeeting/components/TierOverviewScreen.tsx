import React from 'react';
import { Box, Paper, Typography, Grid } from '@mui/material';

export default function TierOverviewScreen({ tierMeetingCards }: any) {
  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 3, background: 'linear-gradient(135deg, #312e81, #9199D8)', color: 'white', border: 'none' }}>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.72)', letterSpacing: '0.08em' }}>TIER 1 OVERVIEW</Typography>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mt: 1 }}>Operations pulse in one view</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)', mt: 1 }}>A compact summary across safety, quality, delivery, cost, and open blockers.</Typography>
      </Paper>
      <Grid container spacing={2.5}>
        {tierMeetingCards.map((card: any) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Paper sx={{ p: 2.5 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>{card.label}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: card.tone, mb: 1 }}>{card.value}</Typography>
              <Typography variant="body2">{card.note}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}