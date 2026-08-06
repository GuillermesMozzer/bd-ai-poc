import {
  AutoAwesome as AutoAwesomeIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  Search as SearchIcon,
  TuneRounded as TuneRoundedIcon,
} from '@mui/icons-material';
import {Box, Chip, InputAdornment, MenuItem, Paper, Switch, TextField, Typography} from '@mui/material';
import type {DemandSource, LongTermPlanningFiltersState, LongTermPlanningLineStatus, ProductionLine} from '../types';
import {ActionButton} from '../../ui/PlanningComponents';
import {planningCardSx, planningTokens} from '../../ui/planningTheme';

type LongTermPlanningFiltersProps = {
  filters: LongTermPlanningFiltersState;
  months: string[];
  lines: ProductionLine[];
  productFamilies: string[];
  aiProposalLoading?: boolean;
  onChange: (next: LongTermPlanningFiltersState) => void;
  onGenerateAiProposal: () => void;
};

const statuses: Array<LongTermPlanningLineStatus | ''> = ['', 'Feasible', 'AtRisk', 'Constrained', 'PendingData', 'NotProducible', 'RequiresDecision'];
const demandSources: Array<DemandSource | ''> = ['', 'GlobalForecast', 'FirmOrder', 'DistributionCenterEstimate', 'ManualAdjustment', 'Other'];

const fieldSx = {
  minWidth: {xs: '100%', sm: 180},
  '& .MuiOutlinedInput-root': {
    height: 40,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  '& .MuiInputLabel-root': {
    fontSize: 13,
  },
};

export default function LongTermPlanningFilters({
  filters,
  months,
  lines,
  productFamilies,
  aiProposalLoading = false,
  onChange,
  onGenerateAiProposal,
}: LongTermPlanningFiltersProps) {
  const handleFieldChange = (field: keyof LongTermPlanningFiltersState, value: string | boolean) => {
    onChange({...filters, [field]: value});
  };

  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 1.4}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap', alignItems: 'center'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2.5,
              bgcolor: 'var(--planning-neutral-bg)',
              color: planningTokens.primaryBlue,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TuneRoundedIcon sx={{fontSize: 18}} />
          </Box>
          <Box>
            <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
              Filters
            </Typography>
            <Typography sx={{fontSize: 13, color: planningTokens.textSecondary}}>
              Refine the forecast view without taking extra space.
            </Typography>
          </Box>
          {filters.onlyExceptions ? <Chip label="Exceptions only" size="small" sx={{fontWeight: 800}} /> : null}
        </Box>
        <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center'}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, px: 1.1, height: 40, borderRadius: 3, bgcolor: planningTokens.surfaceMuted, border: `1px solid ${planningTokens.border}`}}>
            <Switch size="small" checked={filters.onlyExceptions} onChange={(event) => handleFieldChange('onlyExceptions', event.target.checked)} />
            <Typography sx={{fontSize: 13, color: planningTokens.textPrimary, fontWeight: 700}}>
              Only exceptions
            </Typography>
          </Box>
          <ActionButton
            label={aiProposalLoading ? 'Generating...' : 'AI Forecast Proposal'}
            variant="primary"
            startIcon={<AutoAwesomeIcon />}
            disabled={aiProposalLoading}
            onClick={onGenerateAiProposal}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mt: 1.35,
          alignItems: 'center',
        }}
      >
        <TextField select label="Product family" size="small" value={filters.productFamily} onChange={(event) => handleFieldChange('productFamily', event.target.value)} sx={fieldSx}>
          <MenuItem value="">All</MenuItem>
          {productFamilies.map((family) => <MenuItem key={family} value={family}>{family}</MenuItem>)}
        </TextField>
        <TextField
          label="Product search"
          size="small"
          value={filters.search}
          onChange={(event) => handleFieldChange('search', event.target.value)}
          placeholder="Code or description"
          sx={{...fieldSx, flex: '1 1 240px'}}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        <TextField select label="Production line" size="small" value={filters.productionLine} onChange={(event) => handleFieldChange('productionLine', event.target.value)} sx={fieldSx}>
          <MenuItem value="">All</MenuItem>
          {lines.map((line) => <MenuItem key={line.id} value={line.id}>{line.name}</MenuItem>)}
        </TextField>
        <TextField select label="Status" size="small" value={filters.status} onChange={(event) => handleFieldChange('status', event.target.value)} sx={fieldSx}>
          <MenuItem value="">All</MenuItem>
          {statuses.filter(Boolean).map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
        </TextField>
        <TextField select label="Demand source" size="small" value={filters.demandSource} onChange={(event) => handleFieldChange('demandSource', event.target.value)} sx={fieldSx}>
          <MenuItem value="">All</MenuItem>
          {demandSources.filter(Boolean).map((source) => <MenuItem key={source} value={source}>{source}</MenuItem>)}
        </TextField>
        <TextField
          select
          label="Month start"
          size="small"
          value={filters.monthStart}
          onChange={(event) => handleFieldChange('monthStart', event.target.value)}
          sx={fieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <CalendarMonthOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        >
          {months.map((month) => <MenuItem key={month} value={month}>{month}</MenuItem>)}
        </TextField>
        <TextField
          select
          label="Month end"
          size="small"
          value={filters.monthEnd}
          onChange={(event) => handleFieldChange('monthEnd', event.target.value)}
          sx={fieldSx}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <CalendarMonthOutlinedIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        >
          {months.map((month) => <MenuItem key={month} value={month}>{month}</MenuItem>)}
        </TextField>
      </Box>
    </Paper>
  );
}
