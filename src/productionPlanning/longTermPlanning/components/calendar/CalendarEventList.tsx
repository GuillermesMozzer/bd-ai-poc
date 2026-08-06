import {Chip, Paper, Stack, Typography} from '@mui/material';
import type {CalendarPlanningEvent} from '../../types';
import {eventTypeLabels, eventTypeTone, severityTone} from './calendarStyles';

export default function CalendarEventList({events}: {events: CalendarPlanningEvent[]}) {
  if (!events.length) {
    return (
      <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)'}}>
        No calendar events for the selected period.
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      {events.map((event) => (
        <Paper
          key={event.id}
          elevation={0}
          sx={{
            p: 1.2,
            borderRadius: 3,
            border: '1px solid var(--planning-border)',
            bgcolor: 'var(--planning-surface)',
          }}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
            <Chip
              size="small"
              label={eventTypeLabels[event.type]}
              sx={{
                bgcolor: eventTypeTone[event.type].bg,
                color: eventTypeTone[event.type].color,
                border: `1px solid ${eventTypeTone[event.type].border}`,
                fontWeight: 800,
              }}
            />
            <Chip
              size="small"
              label={event.severity}
              sx={{
                bgcolor: severityTone[event.severity].bg,
                color: severityTone[event.severity].color,
                border: `1px solid ${severityTone[event.severity].border}`,
                fontWeight: 800,
              }}
            />
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 700}}>
              {event.startDate === event.endDate ? event.startDate : `${event.startDate} to ${event.endDate}`}
            </Typography>
          </Stack>
          <Typography sx={{fontSize: 14, color: '#0F172A', fontWeight: 800, mt: 1}}>
            {event.title}
          </Typography>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', mt: 0.5, lineHeight: 1.55}}>
            {event.description}
          </Typography>
        </Paper>
      ))}
    </Stack>
  );
}
