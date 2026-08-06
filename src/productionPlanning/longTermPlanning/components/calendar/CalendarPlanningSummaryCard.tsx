import {Paper, Typography} from '@mui/material';

type CalendarPlanningSummaryCardProps = {
  label: string;
  value: string | number;
  accent?: string;
};

export default function CalendarPlanningSummaryCard({label, value, accent}: CalendarPlanningSummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.35,
        borderRadius: 3,
        border: '1px solid var(--planning-border)',
        bgcolor: 'var(--planning-surface)',
        minHeight: 86,
      }}
    >
      <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
        {label}
      </Typography>
      <Typography sx={{fontSize: 24, color: accent ?? '#0F172A', fontWeight: 900, mt: 0.8}}>
        {value}
      </Typography>
    </Paper>
  );
}
