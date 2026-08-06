import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import UnloadingTaskCard, { type UnloadingTask } from './UnloadingTaskCard';

type ReadyToUnloadListProps = {
  tasks: UnloadingTask[];
  operatorName: string;
  onOpenTask: (taskId: string) => void;
};

export default function ReadyToUnloadList({ tasks, operatorName, onOpenTask }: ReadyToUnloadListProps) {
  return (
    <Stack spacing={1.5}>
      <Box sx={{ mb: 0.5 }}>
        <Typography component="h2" sx={{ color: '#102A43', fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>
          Ready to unload
        </Typography>
        <Typography sx={{ color: '#557086', fontSize: 13.5, fontWeight: 600, lineHeight: 1.45, mt: 0.55 }}>
          Coordinator-released deliveries. Assignment keeps each delivery visible to the whole team.
        </Typography>
      </Box>
      {tasks.map((task) => <UnloadingTaskCard key={task.id} task={task} operatorName={operatorName} onClick={() => onOpenTask(task.id)} />)}
    </Stack>
  );
}
