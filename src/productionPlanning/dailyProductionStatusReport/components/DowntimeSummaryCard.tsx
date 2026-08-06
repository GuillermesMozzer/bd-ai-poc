import React from 'react';
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import type {DowntimeEvent} from '../types';
import {formatTimeLabel, formatUnits} from '../utils';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
} as const;

export default function DowntimeSummaryCard({events}: {events: DowntimeEvent[]}) {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, p: 1.4}}>
      <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
        Downtime Summary (Top 5)
      </Typography>
      <TableContainer sx={{mt: 1}}>
        <Table size="small" aria-label="Downtime summary table">
          <TableHead>
            <TableRow>
              <TableCell>Line</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>End Time</TableCell>
              <TableCell>Duration (min)</TableCell>
              <TableCell>Impact (Units)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>{event.lineName}</TableCell>
                <TableCell>{event.reason}</TableCell>
                <TableCell>{formatTimeLabel(event.startTime)}</TableCell>
                <TableCell>{formatTimeLabel(event.endTime)}</TableCell>
                <TableCell>{event.durationMinutes}</TableCell>
                <TableCell>{event.impactUnits === null ? '-' : formatUnits(event.impactUnits)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
