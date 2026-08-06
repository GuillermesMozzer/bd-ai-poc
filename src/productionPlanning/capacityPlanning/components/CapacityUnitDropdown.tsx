import {FormControl, MenuItem, Select} from '@mui/material';
import type {CapacityUnit} from '../types';
import {capacityUnitLabel} from '../utils';

const UNITS: CapacityUnit[] = ['pct', 'perMonth', 'perWeek', 'perDay', 'perShift'];

type Props = {
  value: CapacityUnit;
  onChange: (u: CapacityUnit) => void;
};

export default function CapacityUnitDropdown({value, onChange}: Props) {
  return (
    <FormControl size="small" sx={{minWidth: 130}}>
      <Select
        value={value}
        onChange={(e) => onChange(e.target.value as CapacityUnit)}
        sx={{fontSize: 12, height: 30, '& .MuiSelect-select': {py: 0.4, px: 1}}}
      >
        {UNITS.map((u) => (
          <MenuItem key={u} value={u} sx={{fontSize: 12}}>
            {capacityUnitLabel(u)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
