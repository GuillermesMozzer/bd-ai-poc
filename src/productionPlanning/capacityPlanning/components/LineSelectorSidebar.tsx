import {Box, Checkbox, Chip, FormControlLabel, Paper, Stack, Typography} from '@mui/material';
import {planningTokens} from '../../ui/planningTheme';
import type {CapacityByLine, UtilizationStatus} from '../types';
import {getUtilizationColor, getUtilizationBg, getUtilizationStatus} from '../utils';

type FilterOption = UtilizationStatus | 'All';

type Props = {
  lines: CapacityByLine[];
  selectedLineIds: Set<string>;
  onToggleLine: (lineId: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  filterStatus: FilterOption;
  onChangeFilter: (f: FilterOption) => void;
};

function worstStatus(line: CapacityByLine): UtilizationStatus {
  let worst: UtilizationStatus = 'NoData';
  const order: UtilizationStatus[] = ['NoData', 'UnderUtilized', 'OK', 'AtRisk', 'Overloaded'];
  for (const m of line.months) {
    const s = getUtilizationStatus(m.utilizationPct);
    if (order.indexOf(s) > order.indexOf(worst)) worst = s;
  }
  return worst;
}

function maxUtil(line: CapacityByLine): number {
  return Math.max(...line.months.map((m) => m.utilizationPct));
}

const FILTER_OPTIONS: FilterOption[] = ['All', 'Overloaded', 'AtRisk', 'OK'];

export default function LineSelectorSidebar({
  lines,
  selectedLineIds,
  onToggleLine,
  onSelectAll,
  onClearAll,
  filterStatus,
  onChangeFilter,
}: Props) {
  const filteredLines = filterStatus === 'All'
    ? lines
    : lines.filter((l) => worstStatus(l) === filterStatus);

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${planningTokens.border}`,
        borderRadius: 3,
        width: 220,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{px: 1.5, py: 1, borderBottom: `1px solid ${planningTokens.border}`, bgcolor: planningTokens.surfaceMuted}}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary}}>Lines</Typography>
          <Stack direction="row" spacing={0.5}>
            <Typography
              onClick={onSelectAll}
              sx={{fontSize: 10, color: planningTokens.primaryBlue, cursor: 'pointer', '&:hover': {textDecoration: 'underline'}}}
            >
              All
            </Typography>
            <Typography sx={{fontSize: 10, color: planningTokens.textMuted}}>·</Typography>
            <Typography
              onClick={onClearAll}
              sx={{fontSize: 10, color: planningTokens.textSecondary, cursor: 'pointer', '&:hover': {textDecoration: 'underline'}}}
            >
              None
            </Typography>
          </Stack>
        </Stack>

        {/* Filter chips */}
        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{mt: 0.75}}>
          {FILTER_OPTIONS.map((opt) => {
            const active = filterStatus === opt;
            return (
              <Chip
                key={opt}
                label={opt}
                size="small"
                onClick={() => onChangeFilter(opt)}
                sx={{
                  fontSize: 9,
                  height: 18,
                  cursor: 'pointer',
                  bgcolor: active ? planningTokens.primaryBlue : 'transparent',
                  color: active ? 'white' : planningTokens.textSecondary,
                  border: `1px solid ${active ? planningTokens.primaryBlue : planningTokens.border}`,
                  '&:hover': {bgcolor: active ? planningTokens.primaryBlue : '#F0F4FF'},
                }}
              />
            );
          })}
        </Stack>
      </Box>

      {/* Line list */}
      <Box sx={{overflowY: 'auto', flex: 1}}>
        {filteredLines.map((line) => {
          const status = worstStatus(line);
          const pct = maxUtil(line);
          const checked = selectedLineIds.has(line.lineId);
          return (
            <Box
              key={line.lineId}
              sx={{
                px: 1,
                py: 0.5,
                borderBottom: `1px solid ${planningTokens.border}`,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: checked ? '#F5F8FF' : 'transparent',
                '&:hover': {bgcolor: '#EEF3FF'},
                cursor: 'pointer',
              }}
              onClick={() => onToggleLine(line.lineId)}
            >
              <Checkbox
                checked={checked}
                size="small"
                sx={{p: 0, color: planningTokens.border, '&.Mui-checked': {color: planningTokens.primaryBlue}}}
                onClick={(e) => e.stopPropagation()}
                onChange={() => onToggleLine(line.lineId)}
              />
              <Typography sx={{fontSize: 11, fontWeight: 600, color: planningTokens.textPrimary, flex: 1, ml: 0.5}}>
                {line.lineName}
              </Typography>
              <Chip
                label={`${pct}%`}
                size="small"
                sx={{
                  fontSize: 9,
                  height: 16,
                  bgcolor: getUtilizationBg(status),
                  color: getUtilizationColor(status),
                  border: `1px solid color-mix(in srgb, ${getUtilizationColor(status)} 20%, transparent)`,
                  fontWeight: 700,
                }}
              />
            </Box>
          );
        })}
        {filteredLines.length === 0 && (
          <Box sx={{px: 2, py: 2, textAlign: 'center'}}>
            <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>No lines match filter</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}
