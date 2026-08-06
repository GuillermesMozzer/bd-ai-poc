import React from 'react';
import { Box, ButtonBase, Stack, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TaskStatusPill from './TaskStatusPill';

export type OperatorAssignment = {
  name: string;
  role: string;
};

export type UnloadingTask = {
  id: string;
  priority: 'High' | 'Medium' | 'Low';
  vendor: string;
  carrier: string;
  trailerId: string;
  purchaseOrder: string;
  dock: string;
  stagingLane?: string;
  expectedPallets: number;
  materialSummary: string;
  lot?: string;
  releaseStatus: 'Pending release' | 'Ready to unload';
  unloadingStatus: 'Not started' | 'In progress' | 'Completed';
  assignedOperators: OperatorAssignment[];
};

type UnloadingTaskCardProps = {
  task: UnloadingTask;
  operatorName: string;
  onClick: () => void;
};

const priorityTone = { High: 'attention', Medium: 'primary', Low: 'neutral' } as const;

export default function UnloadingTaskCard({ task, operatorName, onClick }: UnloadingTaskCardProps) {
  const operatorCount = task.assignedOperators.length;
  const isAssignedToCurrentOperator = task.assignedOperators.some((operator) => operator.name === operatorName);

  return (
    <ButtonBase
      onClick={onClick}
      aria-label={`Open ${task.vendor}, trailer ${task.trailerId}`}
      sx={{
        width: '100%', display: 'block', p: 1.75, borderRadius: 3, border: '1px solid #C7DBEE',
        bgcolor: '#FFFFFF', color: '#102A43', textAlign: 'left', boxShadow: '0 8px 22px rgba(11, 92, 171, 0.08)',
        '&:hover': { borderColor: '#0B5CAB', boxShadow: '0 12px 28px rgba(11, 92, 171, 0.14)', transform: 'translateY(-1px)' },
        '&:focus-visible': { outline: '3px solid rgba(29, 116, 255, 0.28)', outlineOffset: 2 },
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          <TaskStatusPill label={`${task.priority} priority`} tone={priorityTone[task.priority]} />
          <TaskStatusPill label={task.releaseStatus} tone="primary" />
          {task.unloadingStatus === 'In progress' ? <TaskStatusPill label="Unloading in progress" tone="success" /> : null}
        </Stack>
        <ChevronRightIcon aria-hidden="true" sx={{ color: '#0B5CAB', flexShrink: 0, mt: 0.15 }} />
      </Stack>

      <Stack direction="row" spacing={1.25} sx={{ mt: 1.25 }}>
        <Box aria-hidden="true" sx={{ width: 38, height: 38, flex: '0 0 38px', display: 'grid', placeItems: 'center', borderRadius: 2, bgcolor: '#EAF3FB', color: '#0B5CAB', '& svg': { fontSize: 22 } }}>
          <LocalShippingOutlinedIcon />
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography component="span" sx={{ display: 'block', color: '#102A43', fontSize: 15.5, fontWeight: 850, lineHeight: 1.25 }}>
            {task.vendor}
          </Typography>
          <Typography component="span" sx={{ display: 'block', color: '#557086', fontSize: 12.5, fontWeight: 650, lineHeight: 1.4, mt: 0.3 }}>
            {task.carrier} · {task.trailerId}
          </Typography>
        </Box>
      </Stack>

      <Typography component="span" sx={{ display: 'block', color: '#557086', fontSize: 12.5, fontWeight: 650, lineHeight: 1.4, mt: 1.25 }}>
        PO {task.purchaseOrder} · {task.dock} · {task.expectedPallets} expected pallets
      </Typography>
      <Typography component="span" sx={{ display: 'block', color: '#718397', fontSize: 12, fontWeight: 600, lineHeight: 1.4, mt: 0.35 }}>
        {task.materialSummary}
      </Typography>

      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 1.25, pt: 1.15, borderTop: '1px solid #E5ECF2' }}>
        <Stack direction="row" alignItems="center" spacing={0.55} sx={{ minWidth: 0 }}>
          <GroupsOutlinedIcon aria-hidden="true" sx={{ color: '#557086', fontSize: 18 }} />
          <Typography component="span" sx={{ color: '#557086', fontSize: 12.5, fontWeight: 750, lineHeight: 1.3 }}>
            {operatorCount === 0 ? 'No operators assigned' : `${operatorCount} operator${operatorCount === 1 ? '' : 's'} assigned`}
          </Typography>
        </Stack>
        {isAssignedToCurrentOperator ? <TaskStatusPill label="Assigned to you" tone="success" /> : null}
      </Stack>
    </ButtonBase>
  );
}
