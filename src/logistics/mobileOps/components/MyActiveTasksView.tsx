import React from 'react';
import { Box, Paper, Stack, Typography } from '@mui/material';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import UnloadingTaskCard, { type UnloadingTask } from './UnloadingTaskCard';

type MyActiveTasksViewProps = {
  tasks: UnloadingTask[];
  operatorName: string;
  onOpenTask: (taskId: string) => void;
};

export default function MyActiveTasksView({ tasks, operatorName, onOpenTask }: MyActiveTasksViewProps) {
  return (
    <Stack spacing={1.5}>
      <Box sx={{ mb: 0.5 }}>
        <Typography component="h2" sx={{ color: 'var(--active-theme-text-primary)', fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>
          My active tasks
        </Typography>
        <Typography sx={{ color: 'var(--active-theme-text-secondary)', fontSize: 13.5, fontWeight: 600, lineHeight: 1.45, mt: 0.55 }}>
          Deliveries where you are assigned, including work already in progress.
        </Typography>
      </Box>
      {tasks.length > 0 ? tasks.map((task) => <UnloadingTaskCard key={task.id} task={task} operatorName={operatorName} onClick={() => onOpenTask(task.id)} />) : (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 3, bgcolor: 'var(--active-theme-background-paper)', border: '1px solid var(--paper-border-color)', backgroundImage: 'none' }}>
          <AssignmentTurnedInOutlinedIcon aria-hidden="true" sx={{ color: 'var(--active-theme-text-secondary)', fontSize: 34 }} />
          <Typography sx={{ color: 'var(--active-theme-text-primary)', fontSize: 16, fontWeight: 850, mt: 0.75 }}>No active tasks</Typography>
          <Typography sx={{ color: 'var(--active-theme-text-secondary)', fontSize: 13, fontWeight: 600, mt: 0.35 }}>Claim a released delivery to see it here.</Typography>
        </Paper>
      )}
    </Stack>
  );
}
