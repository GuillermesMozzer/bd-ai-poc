import {Box, Typography} from '@mui/material';
import type {CalendarDaySummary} from '../../types';
import CalendarDayCell from './CalendarDayCell';

function buildMonthGrid(month: string) {
  const start = new Date(`${month}-01T00:00:00`);
  const firstDay = new Date(start);
  firstDay.setDate(1 - firstDay.getDay());
  const dates: string[] = [];
  for (let index = 0; index < 42; index += 1) {
    const cursor = new Date(firstDay);
    cursor.setDate(firstDay.getDate() + index);
    dates.push(cursor.toISOString().slice(0, 10));
  }
  return dates;
}

const weekdayFormatter = new Intl.DateTimeFormat('en-US', {weekday: 'short', timeZone: 'UTC'});

type LongTermPlanningMonthCalendarProps = {
  month: string;
  selectedDate: string | null;
  getDaySummary: (date: string) => CalendarDaySummary;
  onSelectDate: (date: string) => void;
};

export default function LongTermPlanningMonthCalendar({
  month,
  selectedDate,
  getDaySummary,
  onSelectDate,
}: LongTermPlanningMonthCalendarProps) {
  const dates = buildMonthGrid(month);

  return (
    <Box>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1, mb: 1}}>
        {Array.from({length: 7}, (_, index) => {
          const cursor = new Date(Date.UTC(2026, 0, 4 + index));
          return (
            <Typography
              key={index}
              sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 800, textTransform: 'uppercase', px: 0.5}}
            >
              {weekdayFormatter.format(cursor)}
            </Typography>
          );
        })}
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 1}}>
        {dates.map((date) => {
          const summary = getDaySummary(date);
          return (
            <CalendarDayCell
              key={date}
              date={date}
              dayNumber={Number(date.slice(-2))}
              summary={summary}
              inCurrentMonth={date.startsWith(month)}
              selected={selectedDate === date}
              onClick={() => onSelectDate(date)}
            />
          );
        })}
      </Box>
    </Box>
  );
}
