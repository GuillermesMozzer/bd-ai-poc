import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from '@mui/material';
import {planningTokens, planningSurfaceSx} from '../../ui/planningTheme';
import type {ScenarioAuditEvent} from '../types';

type Props = {
  events: ScenarioAuditEvent[];
};

const hdrSx = {
  fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted,
  textTransform: 'uppercase' as const, letterSpacing: '0.06em',
  borderBottom: `2px solid ${planningTokens.border}`, py: 1,
  bgcolor: planningTokens.surfaceMuted,
};

const cellSx = {fontSize: 12.5, py: 1, borderBottom: `1px solid ${planningTokens.border}`};

const EVENT_LABELS: Record<string, string> = {
  ScenarioLoaded: 'Scenario Loaded',
  ScenarioTypeChanged: 'Scenario Type Changed',
  ChangeAdded: 'Change Added',
  ChangeUpdated: 'Change Updated',
  ChangeRemoved: 'Change Removed',
  ScenarioSimulated: 'Scenario Simulated',
  ScenarioCompared: 'Scenario Compared',
  ScenarioApplied: 'Scenario Applied',
  ScenarioSaved: 'Scenario Saved',
  ScenarioDiscarded: 'Scenario Discarded',
  ScenarioDuplicated: 'Scenario Duplicated',
};

export default function ScenarioAuditTrail({events}: Props) {
  const sorted = [...events].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <Box>
      <Typography sx={{fontSize: 13, color: planningTokens.textMuted, mb: 2}}>
        Chronological log of all changes and actions in this scenario.
      </Typography>
      <Paper elevation={0} sx={{...planningSurfaceSx, overflow: 'hidden'}}>
        <TableContainer sx={{maxHeight: 500}}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={hdrSx}>Timestamp</TableCell>
                <TableCell sx={hdrSx}>User</TableCell>
                <TableCell sx={hdrSx}>Event</TableCell>
                <TableCell sx={hdrSx}>Previous Value</TableCell>
                <TableCell sx={hdrSx}>New Value</TableCell>
                <TableCell sx={hdrSx}>Comment</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((event) => (
                <TableRow key={event.id} hover>
                  <TableCell sx={{...cellSx, whiteSpace: 'nowrap', color: planningTokens.textMuted}}>
                    {event.timestamp}
                  </TableCell>
                  <TableCell sx={{...cellSx, fontWeight: 700}}>{event.user}</TableCell>
                  <TableCell sx={cellSx}>
                    <Typography sx={{fontSize: 12.5, fontWeight: 700, color: planningTokens.primaryBlue}}>
                      {EVENT_LABELS[event.eventType] ?? event.eventType}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{...cellSx, color: planningTokens.textMuted, maxWidth: 200}}>
                    {event.previousValue ?? '—'}
                  </TableCell>
                  <TableCell sx={{...cellSx, maxWidth: 200}}>
                    {event.newValue ?? '—'}
                  </TableCell>
                  <TableCell sx={{...cellSx, color: planningTokens.textMuted, maxWidth: 200}}>
                    {event.comment ?? '—'}
                  </TableCell>
                </TableRow>
              ))}
              {sorted.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} sx={{textAlign: 'center', py: 3, color: planningTokens.textMuted, fontSize: 13}}>
                    No audit events recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
