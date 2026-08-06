import {CalendarMonth as CalendarMonthIcon, Search as SearchIcon} from '@mui/icons-material';
import {Box, Checkbox, FormControlLabel, FormGroup, InputAdornment, MenuItem, Stack, TextField, Typography} from '@mui/material';
import type {MpsPlanningFiltersState, ProductionLine} from '../types';

type Props = {
  filters: MpsPlanningFiltersState;
  onChange: (patch: Partial<MpsPlanningFiltersState>) => void;
  productFamilies: string[];
  productionLines: ProductionLine[];
  bucketLabels: string[];
  selectedMonth: string;
  availableMonths: {value: string; label: string}[];
  onMonthChange: (month: string) => void;
};

const STATUS_OPTIONS = ['Feasible', 'AtRisk', 'Overloaded', 'BelowLotSize', 'AboveLotSize', 'StockRisk', 'MissingData', 'RequiresDecision', 'Released'];
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High', 'Critical'];
const RISK_OPTIONS = ['Low', 'Medium', 'High'];

export default function MpsPlanningFilters({filters, onChange, productFamilies, productionLines, bucketLabels, selectedMonth, availableMonths, onMonthChange}: Props) {
  return (
    <Box sx={{bgcolor: 'var(--planning-surface)', border: '1px solid #D8E2F0', borderRadius: 3, p: 1.75, mb: 2, boxShadow: '0 10px 24px rgba(8,24,74,0.05)'}}>
      <Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', mb: 1.2}}>
        Filters
      </Typography>
      <Stack direction="row" spacing={1.2} flexWrap="wrap" rowGap={1.2} alignItems="center">
        <TextField
          select
          size="small"
          label="Month"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          InputProps={{startAdornment: <InputAdornment position="start"><CalendarMonthIcon sx={{fontSize: 16, color: '#1769FF'}} /></InputAdornment>}}
          sx={{
            minWidth: 175,
            bgcolor: '#fff',
            '& .MuiOutlinedInput-root': {borderRadius: 2.6, fontSize: 13, bgcolor: '#F0F6FF'},
            '& .MuiOutlinedInput-notchedOutline': {borderColor: '#BFDBFE'},
            '& .MuiInputLabel-root': {color: '#1769FF', fontWeight: 700},
          }}
        >
          {availableMonths.map(({value, label}) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>

        <Box sx={{width: '1px', height: 28, bgcolor: '#E2E8F0', mx: 0.4, display: {xs: 'none', md: 'block'}}} />

        <TextField
          size="small"
          placeholder="Search product..."
          value={filters.search}
          onChange={(e) => onChange({search: e.target.value})}
          InputProps={{startAdornment: <InputAdornment position="start"><SearchIcon sx={{fontSize: 16, color: 'var(--planning-text-muted)'}} /></InputAdornment>}}
          sx={{minWidth: 200, bgcolor: '#fff', '& .MuiOutlinedInput-root': {borderRadius: 2.6, fontSize: 13, bgcolor: '#F8FAFF'}}}
        />

        <SelectFilter
          label="Family"
          value={filters.productFamily}
          options={productFamilies}
          onChange={(v) => onChange({productFamily: v})}
        />
        <SelectFilter
          label="Line"
          value={filters.productionLine}
          options={productionLines.map((l) => l.id)}
          labels={productionLines.map((l) => l.name)}
          onChange={(v) => onChange({productionLine: v})}
        />
        <SelectFilter
          label="Bucket"
          value={filters.bucket}
          options={bucketLabels}
          onChange={(v) => onChange({bucket: v})}
        />
        <SelectFilter
          label="Status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(v) => onChange({status: v})}
        />
        <SelectFilter
          label="Priority"
          value={filters.priority}
          options={PRIORITY_OPTIONS}
          onChange={(v) => onChange({priority: v})}
        />
        <SelectFilter
          label="Risk"
          value={filters.riskLevel}
          options={RISK_OPTIONS}
          onChange={(v) => onChange({riskLevel: v})}
        />
      </Stack>
    </Box>
  );
}

function SelectFilter({label, value, options, labels, onChange}: {
  label: string;
  value: string;
  options: string[];
  labels?: string[];
  onChange: (v: string) => void;
}) {
  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={{minWidth: 130, bgcolor: '#fff', '& .MuiOutlinedInput-root': {borderRadius: 2.6, fontSize: 13, bgcolor: '#F8FAFF'}}}
    >
      <MenuItem value=""><em>All</em></MenuItem>
      {options.map((opt, i) => (
        <MenuItem key={opt} value={opt}>{labels ? labels[i] : opt}</MenuItem>
      ))}
    </TextField>
  );
}
