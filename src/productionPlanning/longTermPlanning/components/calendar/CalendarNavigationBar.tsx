import {ArrowBack, ChevronLeft, ChevronRight, Today} from '@mui/icons-material';
import {Button, Paper, Stack, Typography} from '@mui/material';

type CalendarNavigationBarProps = {
  title: string;
  subtitle: string;
  onPrevious: () => void;
  onNext: () => void;
  onBackToYear?: () => void;
  onToday?: () => void;
};

export default function CalendarNavigationBar({
  title,
  subtitle,
  onPrevious,
  onNext,
  onBackToYear,
  onToday,
}: CalendarNavigationBarProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.3,
        borderRadius: 4,
        border: '1px solid var(--planning-border)',
        bgcolor: 'var(--planning-surface)',
      }}
    >
      <Stack direction={{xs: 'column', md: 'row'}} justifyContent="space-between" spacing={1.5}>
        <div>
          <Typography sx={{fontSize: 22, color: '#0F172A', fontWeight: 900}}>
            {title}
          </Typography>
          <Typography sx={{fontSize: 13.5, color: 'var(--planning-text-secondary)', mt: 0.4}}>
            {subtitle}
          </Typography>
        </div>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          {onBackToYear ? (
            <Button startIcon={<ArrowBack />} variant="outlined" onClick={onBackToYear} sx={{fontWeight: 800, textTransform: 'none'}}>
              Back to Year
            </Button>
          ) : null}
          {onToday ? (
            <Button startIcon={<Today />} variant="outlined" onClick={onToday} sx={{fontWeight: 800, textTransform: 'none'}}>
              Current Period
            </Button>
          ) : null}
          <Button onClick={onPrevious} variant="outlined" sx={{minWidth: 42}}>
            <ChevronLeft />
          </Button>
          <Button onClick={onNext} variant="outlined" sx={{minWidth: 42}}>
            <ChevronRight />
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
