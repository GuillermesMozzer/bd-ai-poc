import {Paper, Typography} from '@mui/material';
import type {AuditEvent} from '../types';

export default function AuditTrailPanel({events}: {events: AuditEvent[]}) {
  return (
    <Paper elevation={0} sx={{p: 1.6, borderRadius: 4, border: '1px solid var(--planning-border)', boxShadow: '0 12px 26px rgba(15, 23, 42, 0.04)'}}>
      <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
        Audit Trail
      </Typography>
      <Typography sx={{fontSize: 20, color: '#0F172A', fontWeight: 900, mt: 0.8}}>
        Chronological local planner actions
      </Typography>
      {events.length ? (
        <Paper elevation={0} sx={{display: 'grid', gap: 1.05, mt: 1.5, bgcolor: 'transparent'}}>
          {events.map((event) => (
            <Paper key={event.id} elevation={0} sx={{p: 1.2, borderRadius: 3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
              <Paper elevation={0} sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '180px 140px minmax(0, 1fr) 180px'}, gap: 1, bgcolor: 'transparent'}}>
                <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 700}}>
                  {new Date(event.timestamp).toLocaleString()}
                </Typography>
                <Typography sx={{fontSize: 12.8, color: '#0F172A', fontWeight: 800}}>
                  {event.user}
                </Typography>
                <div>
                  <Typography sx={{fontSize: 13.2, color: '#0F172A', fontWeight: 900}}>
                    {event.eventType} · {event.entityType}
                  </Typography>
                  <Typography sx={{fontSize: 12.6, color: 'var(--planning-text-secondary)', mt: 0.3, lineHeight: 1.45}}>
                    {event.previousValue ? `From: ${event.previousValue}. ` : ''}
                    {event.newValue ? `To: ${event.newValue}. ` : ''}
                    {event.comment || event.reasonCode || 'No additional comment.'}
                  </Typography>
                </div>
                <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 700}}>
                  {event.sourceScreen}
                </Typography>
              </Paper>
            </Paper>
          ))}
        </Paper>
      ) : (
        <Typography sx={{fontSize: 13.5, color: 'var(--planning-text-secondary)', mt: 1.4}}>
          No local audit events yet.
        </Typography>
      )}
    </Paper>
  );
}
