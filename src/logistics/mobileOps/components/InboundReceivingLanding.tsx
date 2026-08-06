import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import {
  AssignmentTurnedInOutlined as ActiveTasksIcon,
  ErrorOutline as ExceptionsIcon,
  LocalShippingOutlined as ReadyToUnloadIcon,
  WarehouseOutlined as PutawayIcon,
} from '@mui/icons-material';
import MobileReadOnlySummary from './MobileReadOnlySummary';
import MobileStatusCard from './MobileStatusCard';

export const inboundReceivingPlaceholderMessages = {
  releasedForPutaway: { title: 'Released for putaway', message: 'Released for putaway coming next' },
  exceptions: { title: 'Exceptions', message: 'Exceptions coming next' },
} as const;

export type InboundReceivingPlaceholder = keyof typeof inboundReceivingPlaceholderMessages;

type InboundReceivingLandingProps = {
  readyToUnloadCount: number;
  activeTasksCount: number;
  onOpenReadyToUnload: () => void;
  onOpenActiveTasks: () => void;
  onOpenPlaceholder: (placeholder: InboundReceivingPlaceholder) => void;
};

export default function InboundReceivingLanding({ readyToUnloadCount, activeTasksCount, onOpenReadyToUnload, onOpenActiveTasks, onOpenPlaceholder }: InboundReceivingLandingProps) {
  return (
    <Stack spacing={1.5}>
      <Box sx={{ mb: 0.75 }}>
        <Typography sx={{ color: '#0B5CAB', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Today
        </Typography>
        <Typography sx={{ color: '#557086', fontSize: 13.5, fontWeight: 600, lineHeight: 1.45, mt: 0.45 }}>
          Review the available work in your inbound area.
        </Typography>
      </Box>

      <MobileStatusCard title="Ready to unload" count={readyToUnloadCount} description="Deliveries released for operator unloading" icon={<ReadyToUnloadIcon />} onClick={onOpenReadyToUnload} />
      <MobileStatusCard title="My active tasks" count={activeTasksCount} description="Work currently assigned to you" icon={<ActiveTasksIcon />} onClick={onOpenActiveTasks} />
      <MobileReadOnlySummary />
      <MobileStatusCard title="Released for putaway" count={3} description="LPs cleared by QA for warehouse movement" icon={<PutawayIcon />} tone="success" onClick={() => onOpenPlaceholder('releasedForPutaway')} />
      <MobileStatusCard title="Exceptions" count={1} description="Escalations created by you or returned to you" icon={<ExceptionsIcon />} tone="attention" onClick={() => onOpenPlaceholder('exceptions')} />
    </Stack>
  );
}
