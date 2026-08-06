import {
  AutoAwesome as AutoAwesomeIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import {Box, Button, Chip, Divider, Stack, Tooltip, Typography} from '@mui/material';
import type {V2DateRange, V2DateShortcut} from '../types';
import {getDateOffsetDays, V2_REFERENCE_DATE} from '../mock';

type Props = {
  dateRange: V2DateRange;
  onDateRangeChange: (range: V2DateRange) => void;
  transposed: boolean;
  onToggleTranspose: () => void;
  onOpenAssistant: () => void;
  isEditMode: boolean;
  onEnterEditMode: () => void;
  onCancelEditMode: () => void;
  onSaveEditMode: () => void;
};

const shortcuts: Array<{id: V2DateShortcut; label: string; days: number}> = [
  {id: 'Today', label: 'Today', days: 0},
  {id: 'ThreeDays', label: '3 Days', days: 2},
  {id: 'SevenDays', label: '7 Days', days: 6},
];

function formatDisplayDate(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function daysBetween(start: string, end: string) {
  const s = new Date(`${start}T00:00:00`);
  const e = new Date(`${end}T00:00:00`);
  return Math.round((e.getTime() - s.getTime()) / 86400000);
}

export default function V2Toolbar({
  dateRange,
  onDateRangeChange,
  transposed,
  onToggleTranspose,
  onOpenAssistant,
  isEditMode,
  onEnterEditMode,
  onCancelEditMode,
  onSaveEditMode,
}: Props) {
  const span = daysBetween(dateRange.startDate, dateRange.endDate);

  function handleShortcut(shortcut: V2DateShortcut, days: number) {
    onDateRangeChange({
      startDate: V2_REFERENCE_DATE,
      endDate: getDateOffsetDays(V2_REFERENCE_DATE, days),
      shortcut,
    });
  }

  function shiftRange(direction: -1 | 1) {
    const shift = direction * (span + 1);
    onDateRangeChange({
      startDate: getDateOffsetDays(dateRange.startDate, shift),
      endDate: getDateOffsetDays(dateRange.endDate, shift),
      shortcut: null,
    });
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        px: 2,
        py: 1.25,
        borderBottom: '1px solid var(--planning-border)',
        bgcolor: 'var(--planning-surface)',
        flexWrap: 'wrap',
        rowGap: 1,
      }}
    >
      <Stack direction="row" spacing={0.5}>
        {shortcuts.map((s) => (
          <Chip
            key={s.id}
            label={s.label}
            size="small"
            onClick={() => handleShortcut(s.id, s.days)}
            sx={{
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 12,
              bgcolor: dateRange.shortcut === s.id ? '#EEF2FF' : '#F8FAFC',
              color: dateRange.shortcut === s.id ? '#4338CA' : '#475467',
              border: dateRange.shortcut === s.id ? '1px solid #C7D2FE' : '1px solid #E3E8F2',
              '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA'},
            }}
          />
        ))}
      </Stack>

      <Divider orientation="vertical" flexItem />

      <Stack direction="row" alignItems="center" spacing={1}>
        <Tooltip title="Previous period">
          <Box
            component="button"
            onClick={() => shiftRange(-1)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              border: '1px solid var(--planning-border)',
              borderRadius: 1,
              bgcolor: 'var(--planning-surface-muted)',
              cursor: 'pointer',
              color: 'var(--planning-text-secondary)',
              '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', borderColor: '#C7D2FE'},
            }}
          >
            <ChevronLeftIcon sx={{fontSize: 18}} />
          </Box>
        </Tooltip>

        <Typography sx={{fontSize: 13, fontWeight: 700, color: '#08184A', minWidth: 200, textAlign: 'center'}}>
          {formatDisplayDate(dateRange.startDate)}
          {dateRange.startDate !== dateRange.endDate && ` — ${formatDisplayDate(dateRange.endDate)}`}
        </Typography>

        <Tooltip title="Next period">
          <Box
            component="button"
            onClick={() => shiftRange(1)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              border: '1px solid var(--planning-border)',
              borderRadius: 1,
              bgcolor: 'var(--planning-surface-muted)',
              cursor: 'pointer',
              color: 'var(--planning-text-secondary)',
              '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', borderColor: '#C7D2FE'},
            }}
          >
            <ChevronRightIcon sx={{fontSize: 18}} />
          </Box>
        </Tooltip>

        <Tooltip title={transposed ? 'Restore default timeline orientation' : 'Transpose timeline'}>
          <Box
            component="button"
            onClick={onToggleTranspose}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 28,
              height: 28,
              border: transposed ? '1px solid #C7D2FE' : '1px solid #E3E8F2',
              borderRadius: 1,
              bgcolor: transposed ? '#EEF2FF' : '#F8FAFC',
              cursor: 'pointer',
              color: transposed ? '#4338CA' : '#475467',
              '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', borderColor: '#C7D2FE'},
            }}
          >
            <SwapHorizIcon sx={{fontSize: 17}} />
          </Box>
        </Tooltip>
      </Stack>

      <Box sx={{flex: 1}} />

      {isEditMode ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label="Edit mode"
            size="small"
            sx={{
              fontSize: 11,
              fontWeight: 800,
              bgcolor: 'var(--planning-ai-accent-bg)',
              color: '#4338CA',
              border: '1px solid #C7D2FE',
            }}
          />
          <Button
            variant="outlined"
            onClick={onCancelEditMode}
            sx={{
              fontWeight: 700,
              fontSize: 12,
              textTransform: 'none',
              borderRadius: 2,
              color: 'var(--planning-text-secondary)',
              borderColor: '#D0D5DD',
              '&:hover': {borderColor: '#98A2B3', bgcolor: 'var(--planning-surface-muted)'},
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon sx={{fontSize: 16}} />}
            onClick={onSaveEditMode}
            sx={{
              bgcolor: '#1769FF',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 12,
              textTransform: 'none',
              borderRadius: 2,
              boxShadow: 'none',
              '&:hover': {bgcolor: '#1257D5', boxShadow: 'none'},
            }}
          >
            Save
          </Button>
        </Stack>
      ) : (
        <Tooltip title="Edit">
          <Box
            component="button"
            onClick={onEnterEditMode}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              border: '1px solid var(--planning-border)',
              borderRadius: 1.5,
              bgcolor: 'var(--planning-surface-muted)',
              cursor: 'pointer',
              color: 'var(--planning-text-secondary)',
              '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', borderColor: '#C7D2FE'},
            }}
          >
            <EditIcon sx={{fontSize: 17}} />
          </Box>
        </Tooltip>
      )}

      <Button
        variant="contained"
        startIcon={<AutoAwesomeIcon sx={{fontSize: 16}} />}
        onClick={onOpenAssistant}
        sx={{
          bgcolor: '#6D28D9',
          color: '#FFFFFF',
          fontWeight: 800,
          fontSize: 13,
          textTransform: 'none',
          borderRadius: 2,
          px: 2,
          py: 0.75,
          boxShadow: 'none',
          '&:hover': {bgcolor: '#5B21B6', boxShadow: 'none'},
        }}
      >
        AI Assistant
      </Button>
    </Box>
  );
}
