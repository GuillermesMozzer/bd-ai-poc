import {ButtonBase, Chip, Paper, Stack, Typography} from '@mui/material';
import type {CalendarDaySummary} from '../../types';
import {severityTone} from './calendarStyles';

type CalendarDayCellProps = {
  date: string;
  dayNumber: number;
  summary: CalendarDaySummary;
  inCurrentMonth: boolean;
  selected: boolean;
  onClick: () => void;
};

export default function CalendarDayCell({
  date,
  dayNumber,
  summary,
  inCurrentMonth,
  selected,
  onClick,
}: CalendarDayCellProps) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{display: 'block', textAlign: 'left', width: '100%', height: '100%', borderRadius: 3}}
      aria-label={`Open planning details for ${date}`}
    >
      <Paper
        elevation={0}
        sx={{
          p: 1,
          height: 124,
          borderRadius: 3,
          border: selected ? '2px solid #2563EB' : '1px solid #E4EAF5',
          bgcolor: inCurrentMonth ? '#FFFFFF' : '#F8FAFC',
          opacity: inCurrentMonth ? 1 : 0.72,
          boxShadow: selected ? '0 12px 24px rgba(37, 99, 235, 0.14)' : 'none',
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Typography sx={{fontSize: 14, color: '#0F172A', fontWeight: 900}}>
            {dayNumber}
          </Typography>
          <Chip
            size="small"
            label={summary.highestSeverity}
            sx={{
              height: 22,
              bgcolor: severityTone[summary.highestSeverity].bg,
              color: severityTone[summary.highestSeverity].color,
              border: `1px solid ${severityTone[summary.highestSeverity].border}`,
              fontWeight: 800,
            }}
          />
        </Stack>
        <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 700, mt: 1}}>
          {summary.eventCount} events
        </Typography>
        <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 700, mt: 0.4}}>
          Utilization {summary.utilizationPercent}%
        </Typography>
        <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 700, mt: 0.4}}>
          {summary.blockerCount} blockers
        </Typography>
      </Paper>
    </ButtonBase>
  );
}
