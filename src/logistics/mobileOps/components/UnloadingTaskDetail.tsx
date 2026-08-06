import React from 'react';
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import TaskStatusPill from './TaskStatusPill';
import DeliveryExecutionWorkspace from './DeliveryExecutionWorkspace';
import { type DeliveryAcknowledgements } from './DeliveryWorkChecklist';
import { type UnloadingTask } from './UnloadingTaskCard';

type UnloadingTaskDetailProps = {
  task: UnloadingTask;
  operatorName: string;
  onAssign: () => void;
  onUnassign: () => void;
  onStart: () => void;
  acknowledgements: DeliveryAcknowledgements;
  confirmedPallets: number;
  onToggleAcknowledgement: (key: keyof DeliveryAcknowledgements) => void;
  onOpenPallets: () => void;
  onOpenReceivingChecks: () => void;
};

const priorityTone = { High: 'attention', Medium: 'primary', Low: 'neutral' } as const;

export default function UnloadingTaskDetail({ task, operatorName, onAssign, onUnassign, onStart, acknowledgements, confirmedPallets, onToggleAcknowledgement, onOpenPallets, onOpenReceivingChecks }: UnloadingTaskDetailProps) {
  const isAssignedToCurrentOperator = task.assignedOperators.some((operator) => operator.name === operatorName);

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography component="h2" sx={{ color: '#102A43', fontSize: 22, fontWeight: 900, lineHeight: 1.2 }}>Unloading task</Typography>
        <Typography sx={{ color: '#557086', fontSize: 13.5, fontWeight: 600, lineHeight: 1.45, mt: 0.55 }}>Shared delivery work for the inbound team.</Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 2, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #C7DBEE', backgroundImage: 'none', boxShadow: '0 8px 22px rgba(11, 92, 171, 0.08)' }}>
        <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
          <TaskStatusPill label={`${task.priority} priority`} tone={priorityTone[task.priority]} />
          <TaskStatusPill label={task.releaseStatus} tone="primary" />
          <TaskStatusPill label={task.unloadingStatus === 'In progress' ? 'Unloading in progress' : task.unloadingStatus} tone={task.unloadingStatus === 'In progress' ? 'success' : 'neutral'} />
        </Stack>
        <Stack direction="row" spacing={1.25} sx={{ mt: 1.5 }}>
          <Box aria-hidden="true" sx={{ width: 44, height: 44, flex: '0 0 44px', display: 'grid', placeItems: 'center', borderRadius: 2.5, bgcolor: '#EAF3FB', color: '#0B5CAB', '& svg': { fontSize: 25 } }}><LocalShippingOutlinedIcon /></Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#102A43', fontSize: 17, fontWeight: 900, lineHeight: 1.25 }}>{task.vendor}</Typography>
            <Typography sx={{ color: '#557086', fontSize: 13, fontWeight: 650, mt: 0.25 }}>{task.carrier} · Trailer {task.trailerId}</Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 1.75, borderColor: '#E5ECF2' }} />
        <Stack spacing={1}>
          <DetailRow label="PO" value={task.purchaseOrder} />
          <DetailRow label="Dock" value={task.dock} />
          {task.stagingLane ? <DetailRow label="Staging lane" value={task.stagingLane} /> : null}
          <DetailRow label="Expected pallets" value={`${task.expectedPallets}`} />
          <DetailRow label="Material" value={task.materialSummary} />
          {task.lot ? <DetailRow label="Lot" value={task.lot} /> : null}
        </Stack>

        <Divider sx={{ my: 1.75, borderColor: '#E5ECF2' }} />
        <Stack direction="row" alignItems="center" spacing={0.7}>
          <GroupsOutlinedIcon aria-hidden="true" sx={{ color: '#557086', fontSize: 19 }} />
          <Typography sx={{ color: '#102A43', fontSize: 14, fontWeight: 850 }}>Assigned operators ({task.assignedOperators.length})</Typography>
        </Stack>
        {task.assignedOperators.length > 0 ? (
          <Stack spacing={0.55} sx={{ mt: 1 }}>
            {task.assignedOperators.map((operator) => (
              <Typography key={operator.name} sx={{ color: operator.name === operatorName ? '#087A5B' : '#557086', fontSize: 13, fontWeight: operator.name === operatorName ? 850 : 650 }}>
                {operator.name === operatorName ? `${operator.name} (you)` : operator.name} · {operator.role}
              </Typography>
            ))}
          </Stack>
        ) : <Typography sx={{ color: '#718397', fontSize: 13, fontWeight: 600, mt: 0.75 }}>No operators assigned yet.</Typography>}
      </Paper>

      {isAssignedToCurrentOperator && task.unloadingStatus === 'In progress' ? (
        <>
          <DeliveryExecutionWorkspace task={task} acknowledgements={acknowledgements} confirmedPallets={confirmedPallets} onToggleAcknowledgement={onToggleAcknowledgement} onOpenPallets={onOpenPallets} onOpenReceivingChecks={onOpenReceivingChecks} />
          <Button variant="outlined" onClick={onUnassign} sx={{ minHeight: 48, borderRadius: 2.5, borderColor: '#8FA7BB', color: '#29475F', fontWeight: 850 }}>Unassign</Button>
        </>
      ) : !isAssignedToCurrentOperator ? (
        <Button variant="contained" onClick={onAssign} sx={primaryButtonSx}>Assign to me</Button>
      ) : task.releaseStatus === 'Pending release' ? (
        <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#F7F9FB', border: '1px solid #DDE4EB', color: '#557086' }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 750 }}>Waiting for coordinator release</Typography>
        </Paper>
      ) : task.unloadingStatus === 'Completed' ? (
        <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2.5, bgcolor: '#E8F6F1', border: '1px solid #9ACFBE', color: '#087A5B' }}>
          <Typography sx={{ fontSize: 13.5, fontWeight: 800 }}>This delivery is complete.</Typography>
        </Paper>
      ) : (
        <Stack spacing={1}>
          <Button variant="contained" onClick={onStart} sx={primaryButtonSx}>Start unloading</Button>
          <Button variant="outlined" onClick={onUnassign} sx={{ minHeight: 48, borderRadius: 2.5, borderColor: '#8FA7BB', color: '#29475F', fontWeight: 850 }}>Unassign</Button>
        </Stack>
      )}
    </Stack>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography sx={{ color: '#718397', fontSize: 12.5, fontWeight: 700 }}>{label}</Typography>
      <Typography sx={{ color: '#29475F', fontSize: 12.5, fontWeight: 800, textAlign: 'right' }}>{value}</Typography>
    </Stack>
  );
}

const primaryButtonSx = {
  minHeight: 48, borderRadius: 2.5, bgcolor: '#0B5CAB', color: '#FFFFFF', fontWeight: 850, boxShadow: 'none',
  '&:hover': { bgcolor: '#08477F', boxShadow: 'none' },
};
