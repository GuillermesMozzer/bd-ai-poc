import {Box, Button, Chip, MenuItem, Paper, Select, TextField, Typography} from '@mui/material';
import {TuneRounded as TuneIcon} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {BulkAdjustmentSpec} from '../types';

type AdjustmentType = BulkAdjustmentSpec['adjustmentType'];

const ADJUSTMENT_OPTIONS: {value: AdjustmentType; label: string}[] = [
  {value: 'AddHours', label: '+ Add Hours'},
  {value: 'SubtractHours', label: '− Subtract Hours'},
  {value: 'SetHours', label: '= Set Hours'},
  {value: 'AddPct', label: '+ Add %'},
  {value: 'SubtractPct', label: '− Subtract %'},
];

type Props = {
  selectedCellCount: number;
  spec: BulkAdjustmentSpec | null;
  onSpecChange: (spec: BulkAdjustmentSpec) => void;
  onPreview: () => void;
  onClearSelection: () => void;
};

export default function BulkAdjustmentPanel({
  selectedCellCount,
  spec,
  onSpecChange,
  onPreview,
  onClearSelection,
}: Props) {
  const adjustmentType = spec?.adjustmentType ?? 'AddHours';
  const rawValue = spec?.adjustmentValue;
  const valueStr = rawValue !== undefined ? String(rawValue) : '';
  const isPct = adjustmentType === 'AddPct' || adjustmentType === 'SubtractPct';

  function handleTypeChange(type: AdjustmentType) {
    onSpecChange({adjustmentType: type, adjustmentValue: spec?.adjustmentValue ?? 0});
  }

  function handleValueChange(raw: string) {
    const n = parseFloat(raw);
    if (!isNaN(n) && n >= 0) {
      onSpecChange({adjustmentType: adjustmentType, adjustmentValue: n});
    } else if (raw === '' || raw === '-') {
      onSpecChange({adjustmentType: adjustmentType, adjustmentValue: 0});
    }
  }

  const canPreview = selectedCellCount > 0 && spec !== null && spec.adjustmentValue > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid color-mix(in srgb, ${planningTokens.primaryBlue} 20%, transparent)`,
        borderRadius: 2,
        px: 2,
        py: 1,
        bgcolor: '#F5F8FF',
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        flexWrap: 'wrap',
      }}
    >
      <TuneIcon sx={{fontSize: 16, color: planningTokens.primaryBlue}} />

      <Chip
        label={`${selectedCellCount} cell${selectedCellCount !== 1 ? 's' : ''} selected`}
        size="small"
        sx={{fontSize: 11, height: 22, bgcolor: 'var(--planning-ai-accent-bg)', color: '#4F46E5', border: '1px solid #C7D2FE', fontWeight: 700}}
      />

      <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>Adjust by:</Typography>

      <Select
        value={adjustmentType}
        onChange={(e) => handleTypeChange(e.target.value as AdjustmentType)}
        size="small"
        sx={{fontSize: 11, height: 28, minWidth: 150, '.MuiSelect-select': {py: '4px', pr: '28px !important'}}}
      >
        {ADJUSTMENT_OPTIONS.map((o) => (
          <MenuItem key={o.value} value={o.value} sx={{fontSize: 11}}>{o.label}</MenuItem>
        ))}
      </Select>

      <TextField
        size="small"
        value={valueStr}
        onChange={(e) => handleValueChange(e.target.value)}
        placeholder={isPct ? 'e.g. 10' : 'e.g. 5000'}
        inputProps={{style: {fontSize: 11, padding: '4px 8px', width: 80}}}
        sx={{
          '& .MuiOutlinedInput-root': {height: 28},
          '& .MuiOutlinedInput-input': {textAlign: 'right'},
        }}
      />

      {isPct && (
        <Typography sx={{fontSize: 11, color: planningTokens.textSecondary, ml: -1}}>%</Typography>
      )}

      <Box sx={{ml: 'auto', display: 'flex', gap: 1, alignItems: 'center'}}>
        <Button
          size="small"
          variant="text"
          onClick={onClearSelection}
          sx={{fontSize: 11, height: 28, textTransform: 'none', color: planningTokens.textSecondary}}
        >
          Clear selection
        </Button>
        <Button
          size="small"
          variant="contained"
          disabled={!canPreview}
          onClick={onPreview}
          sx={{fontSize: 11, height: 28, textTransform: 'none', fontWeight: 700, bgcolor: planningTokens.primaryBlue}}
        >
          Preview Impact
        </Button>
      </Box>
    </Paper>
  );
}
