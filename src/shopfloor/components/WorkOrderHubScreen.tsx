import React from 'react';
import { Box, Paper, Typography, Grid, Chip, Button, Alert } from '@mui/material';
import { AutoAwesome as SparkleIcon } from '@mui/icons-material';

export interface WorkOrderHubScreenProps {
  onAskAi: () => void;
  onOpenOperations: () => void;
  onOpenActionTracker: () => void;
}

export default function WorkOrderHubScreen({
  onAskAi,
  onOpenOperations,
  onOpenActionTracker,
}: WorkOrderHubScreenProps) {
  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: '#EBEDF0', p: { xs: 2, md: 4 } }}>
      <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 3, background: 'linear-gradient(135deg, #1F2366, #0f766e)', color: 'white', border: 'none' }}>
        <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.72)', letterSpacing: '0.08em' }}>WORK ORDER HUB</Typography>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 800, mt: 1 }}>Maintenance actions in motion</Typography>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.82)', mt: 1 }}>Track open work orders, due times, ownership, and the next action BLU.AI recommends before handoff.</Typography>
      </Paper>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Open work orders</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { title: 'WO-2481 Conveyor Verification', due: 'Today 14:30', owner: 'Maintenance', status: 'Awaiting closeout', tone: '#E43B46' },
                { title: 'WO-2468 Hydraulic Press Inspection', due: 'Tomorrow 08:00', owner: 'Reliability', status: 'Draft ready', tone: '#0f766e' },
                { title: 'WO-2442 Guarding Recheck', due: 'Next shift', owner: 'Safety', status: 'Queued', tone: '#044ED7' },
              ].map((item) => (
                <Paper key={item.title} elevation={0} sx={{ p: 2, borderRadius: 3, borderLeft: `4px solid ${item.tone}` }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, mb: 0.75 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{item.title}</Typography>
                    <Chip label={item.status} size="small" sx={{ bgcolor: `${item.tone}22`, color: item.tone, fontWeight: 800 }} />
                  </Box>
                  <Typography variant="caption" sx={{ display: 'block', color: '#626465', mb: 0.45 }}>Owner: {item.owner}</Typography>
                  <Typography variant="body2">Due: {item.due}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 2.5, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>BLU.AI Next Step</Typography>
            <Alert severity="warning" sx={{ borderRadius: 3, mb: 2 }}>WO-2481 should be closed before handoff. BLU.AI recommends final verification and note submission now.</Alert>
            <Button fullWidth variant="contained" startIcon={<SparkleIcon />} onClick={onAskAi} sx={{ bgcolor: '#0f766e', '&:hover': { bgcolor: '#115e59' } }}>Ask BLU.AI About Work Orders</Button>
          </Paper>
          <Paper sx={{ p: 2.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>Quick links</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" onClick={onOpenOperations}>Open Operations</Button>
              <Button variant="outlined" onClick={onOpenActionTracker}>Open Action Tracker</Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
