import {Box} from '@mui/material';
import type {CalendarMonthSummary} from '../../types';
import CalendarMonthCard from './CalendarMonthCard';

const monthFormatter = new Intl.DateTimeFormat('en-US', {month: 'long', timeZone: 'UTC'});

type LongTermPlanningYearCalendarProps = {
  summaries: CalendarMonthSummary[];
  onSelectMonth: (month: string) => void;
};

export default function LongTermPlanningYearCalendar({summaries, onSelectMonth}: LongTermPlanningYearCalendarProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))'},
        gap: 1.5,
      }}
    >
      {summaries.map((summary) => (
        <CalendarMonthCard
          key={summary.month}
          summary={summary}
          monthLabel={monthFormatter.format(new Date(`${summary.month}-01T00:00:00Z`))}
          onClick={() => onSelectMonth(summary.month)}
        />
      ))}
    </Box>
  );
}
