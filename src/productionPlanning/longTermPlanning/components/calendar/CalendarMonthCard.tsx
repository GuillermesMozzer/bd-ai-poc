import {ButtonBase, Chip, Paper, Stack, Typography} from '@mui/material';
import type {CalendarMonthSummary} from '../../types';
import {severityTone} from './calendarStyles';

type CalendarMonthCardProps = {
  summary: CalendarMonthSummary;
  monthLabel: string;
  onClick: () => void;
};

export default function CalendarMonthCard({summary, monthLabel, onClick}: CalendarMonthCardProps) {
  const severity = summary.blockerCount > 0 ? 'Blocker' : summary.warningCount > 0 ? 'Warning' : 'Info';

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: 'block',
        textAlign: 'left',
        width: '100%',
        borderRadius: 4,
      }}
      aria-label={`Open ${monthLabel} ${summary.year} month view`}
    >
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 4,
          border: '1px solid var(--planning-border)',
          bgcolor: 'var(--planning-surface)',
          minHeight: 206,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)',
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <div>
            <Typography sx={{fontSize: 20, color: '#0F172A', fontWeight: 900}}>
              {monthLabel}
            </Typography>
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 700}}>
              {summary.year}
            </Typography>
          </div>
          <Chip
            size="small"
            label={severity}
            sx={{
              bgcolor: severityTone[severity].bg,
              color: severityTone[severity].color,
              border: `1px solid ${severityTone[severity].border}`,
              fontWeight: 800,
            }}
          />
        </Stack>
        <Stack spacing={0.8} sx={{mt: 1.8}}>
          {[
            ['Requested', summary.requestedQuantity.toLocaleString()],
            ['Committed', summary.committedQuantity.toLocaleString()],
            ['Uncovered', summary.uncoveredQuantity.toLocaleString()],
            ['Utilization', `${summary.utilizationPercent}%`],
          ].map(([label, value]) => (
            <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
              <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 700}}>{label}</Typography>
              <Typography sx={{fontSize: 13.5, color: '#0F172A', fontWeight: 900}}>{value}</Typography>
            </Stack>
          ))}
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{mt: 1.6}}>
          <Chip size="small" label={`${summary.eventCount} events`} sx={{fontWeight: 800}} />
          <Chip size="small" label={`${summary.blockerCount} blockers`} sx={{fontWeight: 800}} />
          <Chip size="small" label={`${summary.warningCount} warnings`} sx={{fontWeight: 800}} />
        </Stack>
      </Paper>
    </ButtonBase>
  );
}
