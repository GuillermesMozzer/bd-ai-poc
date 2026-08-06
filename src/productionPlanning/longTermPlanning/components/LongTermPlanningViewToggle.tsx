import {CalendarMonthRounded as CalendarMonthRoundedIcon, GridViewRounded as GridViewRoundedIcon} from '@mui/icons-material';
import {ToggleButton, ToggleButtonGroup} from '@mui/material';
import type {PlanningViewMode} from '../types';

type LongTermPlanningViewToggleProps = {
  value: PlanningViewMode;
  onChange: (value: PlanningViewMode) => void;
};

export default function LongTermPlanningViewToggle({value, onChange}: LongTermPlanningViewToggleProps) {
  return (
    <ToggleButtonGroup
      exclusive
      value={value}
      onChange={(_event, nextValue: PlanningViewMode | null) => {
        if (nextValue) {
          onChange(nextValue);
        }
      }}
      aria-label="Planning view mode"
      sx={{
        gap: 1,
        flexWrap: 'wrap',
        '& .MuiToggleButtonGroup-grouped': {
          border: '1px solid #D7DFEA !important',
          px: 2.1,
          py: 1,
          minWidth: 148,
          textTransform: 'none',
          fontWeight: 800,
          fontSize: 15,
          color: '#243B53',
          bgcolor: 'var(--planning-surface)',
          borderRadius: '14px !important',
          boxShadow: '0 1px 2px rgba(15, 23, 42, 0.06)',
        },
        '& .Mui-selected': {
          bgcolor: '#2563EB !important',
          color: '#FFFFFF !important',
          borderColor: '#2563EB !important',
          boxShadow: '0 10px 22px rgba(37, 99, 235, 0.24)',
        },
        '& .MuiToggleButton-root:hover': {
          bgcolor: 'var(--planning-surface-muted)',
        },
        '& .Mui-selected:hover': {
          bgcolor: '#1D4ED8 !important',
        },
      }}
    >
      <ToggleButton value="table" aria-label="Planning grid view">
        <GridViewRoundedIcon sx={{fontSize: 18, mr: 1}} />
        Planning Grid
      </ToggleButton>
      <ToggleButton value="calendar" aria-label="Calendar view">
        <CalendarMonthRoundedIcon sx={{fontSize: 18, mr: 1}} />
        Calendar
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
