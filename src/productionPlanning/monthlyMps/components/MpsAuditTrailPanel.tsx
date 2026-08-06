import {Box, Stack, Typography} from '@mui/material';
import type {AuditEvent} from '../types';

type Props = {
  auditEvents: AuditEvent[];
};

const eventColor: Record<string, string> = {
  PlanInitialized:    '#6D28D9',
  ValidationRun:      '#0369A1',
  CapacityCheckRun:   '#0369A1',
  StockProjectionRun: '#0369A1',
  QuantityChanged:    '#B54708',
  LineChanged:        '#B54708',
  ReasonChanged:      '#475467',
  CommentChanged:     '#475467',
  ScenarioCreated:    '#6D28D9',
  ScenarioCompared:   '#6D28D9',
  ScenarioApplied:    '#027A48',
  PlanReleased:       '#027A48',
  DemoReset:          '#71717A',
};

export default function MpsAuditTrailPanel({auditEvents}: Props) {
  if (auditEvents.length === 0) {
    return (
      <Box sx={{textAlign: 'center', py: 6, color: 'var(--planning-text-muted)'}}>
        <Typography sx={{fontSize: 13}}>No audit events recorded yet.</Typography>
      </Box>
    );
  }

  const sorted = [...auditEvents].sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <Box>
      <Typography sx={{fontSize: 15, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 2}}>Audit Trail</Typography>
      <Stack spacing={1}>
        {sorted.map((event) => {
          const color = eventColor[event.eventType] ?? '#475467';
          return (
            <Box
              key={event.id}
              sx={{
                border: '1px solid var(--planning-border)',
                borderLeft: `3px solid ${color}`,
                borderRadius: 2,
                p: 1.4,
                bgcolor: '#FAFAFA',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start" flexWrap="wrap" rowGap={0.4}>
                <Box sx={{minWidth: 160}}>
                  <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)'}}>{new Date(event.timestamp).toLocaleString()}</Typography>
                  <Typography sx={{fontSize: 11, fontWeight: 600, color: 'var(--planning-text-secondary)'}}>{event.user}</Typography>
                </Box>
                <Box sx={{flex: 1}}>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color}}>{event.eventType}</Typography>
                  <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>
                    {event.entityType} · {event.entityId}
                  </Typography>
                  {(event.previousValue || event.newValue) && (
                    <Stack direction="row" spacing={1} sx={{mt: 0.4}} alignItems="center">
                      {event.previousValue && <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', textDecoration: 'line-through'}}>{event.previousValue}</Typography>}
                      {event.previousValue && event.newValue && <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)'}}>→</Typography>}
                      {event.newValue && <Typography sx={{fontSize: 11, fontWeight: 600, color: 'var(--planning-text-primary)'}}>{event.newValue}</Typography>}
                    </Stack>
                  )}
                  {event.comment && <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.4, fontStyle: 'italic'}}>{event.comment}</Typography>}
                  {event.reasonCode && <Typography sx={{fontSize: 11, color: '#6D28D9', mt: 0.2}}>Reason: {event.reasonCode}</Typography>}
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
