import React from 'react';
import {Box, Stack, Typography} from '@mui/material';
import {AccessTime as AccessTimeIcon} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {LineShiftSchedule} from '../types';

type Props = {
  schedule: LineShiftSchedule;
  rightSlot?: React.ReactNode;
};

export default function LineShiftScheduleBar({schedule, rightSlot}: Props) {
  const shiftTimes = schedule.shifts.map((s) => `${s.startTime}–${s.endTime}`).join(' · ');
  return (
    <Box
      sx={{
        px: 2,
        py: 0.75,
        bgcolor: 'var(--planning-surface-muted)',
        borderBottom: `1px solid ${planningTokens.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <AccessTimeIcon sx={{fontSize: 13, color: planningTokens.textMuted}} />
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{flex: 1}}>
        <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>
          <strong>Shift Schedule:</strong>
        </Typography>
        <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>
          {schedule.shiftsPerDay} shifts/day
        </Typography>
        <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>·</Typography>
        <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>
          {schedule.daysPerWeek} days/week
        </Typography>
        <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>·</Typography>
        <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>
          {schedule.workingDaysPerMonth} working days/month
        </Typography>
        {shiftTimes && (
          <>
            <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>·</Typography>
            <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>
              {shiftTimes}
            </Typography>
          </>
        )}
      </Stack>
      {rightSlot && <Box sx={{ml: 'auto', flexShrink: 0}}>{rightSlot}</Box>}
    </Box>
  );
}
