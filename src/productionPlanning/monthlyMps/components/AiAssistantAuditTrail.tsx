import {Box, Typography} from '@mui/material';
import type {MpsAssistantAuditEvent, MpsAssistantStep} from '../types';

type Props = {
  events: MpsAssistantAuditEvent[];
  steps: MpsAssistantStep[];
};

export default function AiAssistantAuditTrail({events, steps}: Props) {
  if (events.length === 0) {
    return (
      <Box sx={{textAlign: 'center', py: 4, color: 'var(--planning-text-muted)'}}>
        <Typography sx={{fontSize: 13}}>No assistant audit activity yet.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{display: 'grid', gap: 1}}>
      {events
        .slice()
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .map((event) => {
          const step = steps.find((item) => item.id === event.stepId);
          return (
            <Box key={event.id} sx={{border: '1px solid var(--planning-border)', borderRadius: 2.4, p: 1.25, bgcolor: 'var(--planning-surface)'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '170px 140px 1fr 1fr'}, gap: 1}}>
                <Item label="Timestamp" value={new Date(event.timestamp).toLocaleString()} />
                <Item label="User" value={event.user} />
                <Item label="Step" value={step ? `${step.sequence}. ${step.shortTitle}` : event.stepId} />
                <Item label="Event" value={event.eventType} />
                <Item label="Previous" value={event.previousValue ?? '—'} />
                <Item label="New" value={event.newValue ?? '—'} />
                <Item label="Comment" value={event.comment ?? '—'} />
              </Box>
            </Box>
          );
        })}
    </Box>
  );
}

function Item({label, value}: {label: string; value: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
        {label}
      </Typography>
      <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-primary)', mt: 0.25, lineHeight: 1.5}}>
        {value}
      </Typography>
    </Box>
  );
}
