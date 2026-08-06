import {Box, Button, Chip, MenuItem, Select, Slider, Stack, TextField, Typography} from '@mui/material';
import {SmartToy as AiIcon} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {LineDesignCapacity, PlanningAssumption} from '../types';

type Props = {
  assumption: PlanningAssumption;
  design: LineDesignCapacity;
  onChange: (a: PlanningAssumption) => void;
  onSave: () => void;
};

export default function PlanningAssumptionsSection({assumption, design, onChange, onSave}: Props) {
  const effective = Math.round(design.designHrsPerMonth * assumption.planningEfficiencyFactor);

  function update(patch: Partial<PlanningAssumption>) {
    const updated = {...assumption, ...patch};
    updated.effectivePlanningHrsPerMonth = Math.round(
      design.designHrsPerMonth * updated.planningEfficiencyFactor,
    );
    onChange(updated);
  }

  const labelSx = {fontSize: 12, color: planningTokens.textSecondary, mb: 0.5};
  const inputSx = {fontSize: 12};

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
      {/* Efficiency factor */}
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} sx={{mb: 0.5}}>
          <Typography sx={labelSx}>Planning Efficiency Factor</Typography>
          {assumption.aiProposed && (
            <Chip
              icon={<AiIcon sx={{fontSize: 11}} />}
              label="AI Proposed"
              size="small"
              sx={{fontSize: 10, height: 18, bgcolor: '#EDE9FE', color: '#7C3AED', border: '1px solid #DDD6FE'}}
            />
          )}
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Slider
            value={assumption.planningEfficiencyFactor}
            onChange={(_, v) => update({planningEfficiencyFactor: v as number})}
            min={0.5}
            max={1.0}
            step={0.01}
            sx={{flex: 1, color: planningTokens.primaryBlue}}
          />
          <TextField
            value={(assumption.planningEfficiencyFactor * 100).toFixed(0)}
            onChange={(e) => {
              const pct = parseFloat(e.target.value);
              if (!isNaN(pct) && pct >= 50 && pct <= 100) {
                update({planningEfficiencyFactor: pct / 100});
              }
            }}
            size="small"
            inputProps={{style: {textAlign: 'right', ...inputSx}}}
            sx={{width: 72}}
            InputProps={{endAdornment: <Typography sx={{fontSize: 12, ml: 0.5, color: planningTokens.textMuted}}>%</Typography>}}
          />
        </Stack>
        <Typography sx={{fontSize: 11, color: planningTokens.textMuted, mt: 0.25}}>
          Effective planning capacity: <strong>{effective.toLocaleString()} hrs/month</strong>
        </Typography>
      </Box>

      {/* Shifts + days */}
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5}}>
        <Box>
          <Typography sx={labelSx}>Planned Shifts / Day</Typography>
          <Select
            value={assumption.plannedShiftsPerDay}
            onChange={(e) => update({plannedShiftsPerDay: Number(e.target.value)})}
            size="small"
            fullWidth
            sx={{fontSize: 12}}
          >
            {[1, 2, 3].map((n) => <MenuItem key={n} value={n} sx={{fontSize: 12}}>{n}</MenuItem>)}
          </Select>
        </Box>
        <Box>
          <Typography sx={labelSx}>Planned Days / Week</Typography>
          <Select
            value={assumption.plannedDaysPerWeek}
            onChange={(e) => update({plannedDaysPerWeek: Number(e.target.value)})}
            size="small"
            fullWidth
            sx={{fontSize: 12}}
          >
            {[5, 6, 7].map((n) => <MenuItem key={n} value={n} sx={{fontSize: 12}}>{n}</MenuItem>)}
          </Select>
        </Box>
      </Box>

      {/* Notes */}
      <Box>
        <Typography sx={labelSx}>Notes</Typography>
        <TextField
          value={assumption.notes}
          onChange={(e) => update({notes: e.target.value})}
          multiline
          minRows={2}
          size="small"
          fullWidth
          inputProps={{style: inputSx}}
          placeholder="Describe any planning constraints or assumptions..."
        />
      </Box>

      {/* Meta + save */}
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography sx={{fontSize: 11, color: planningTokens.textMuted}}>
          Last updated by <strong>{assumption.lastUpdatedBy}</strong> on {assumption.lastUpdatedAt}
        </Typography>
        <Button
          variant="contained"
          size="small"
          onClick={onSave}
          sx={{fontSize: 11, fontWeight: 700, textTransform: 'none', height: 30, bgcolor: planningTokens.primaryBlue}}
        >
          Save
        </Button>
      </Stack>
    </Box>
  );
}
