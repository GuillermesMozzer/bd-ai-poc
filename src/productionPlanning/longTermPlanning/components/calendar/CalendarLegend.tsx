import {Chip, Paper, Stack, Typography} from '@mui/material';
import type {CalendarPlanningEventType} from '../../types';
import {eventTypeLabels, eventTypeTone} from './calendarStyles';

const legendItems: CalendarPlanningEventType[] = [
  'Holiday',
  'AnnualShutdown',
  'Blackout',
  'ReducedCapacity',
  'Maintenance',
  'Project',
  'SupplierTest',
  'MaterialTest',
  'Validation',
  'EngineeringEvent',
  'CapacityOverload',
  'AtRisk',
  'ConstrainedDemand',
  'UncoveredDemand',
];

export default function CalendarLegend() {
  return (
    <Paper elevation={0} sx={{p: 1.4, borderRadius: 4, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
      <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
        Legend
      </Typography>
      <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{mt: 1.2}}>
        {legendItems.map((item) => (
          <Chip
            key={item}
            size="small"
            label={eventTypeLabels[item]}
            sx={{
              bgcolor: eventTypeTone[item].bg,
              color: eventTypeTone[item].color,
              border: `1px solid ${eventTypeTone[item].border}`,
              fontWeight: 800,
            }}
          />
        ))}
      </Stack>
    </Paper>
  );
}
