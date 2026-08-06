import {Box, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Tooltip, Typography} from '@mui/material';
import {Refresh as RefreshIcon} from '@mui/icons-material';
import {planningTokens, planningSurfaceSx} from '../../ui/planningTheme';
import {ScenarioStatusBadge} from './Badges';
import type {ScenarioStatus, ScenarioType} from '../types';
import {LT_BASELINE_PLANS, LT_HORIZONS, ST_BASELINE_PLANS, ST_HORIZONS} from '../mock';

type Props = {
  scenarioType: ScenarioType;
  baselinePlanId: string;
  site: string;
  horizonId: string;
  scenarioStatus: ScenarioStatus;
  lastCalculatedAt: string | null;
  onTypeChange: (type: ScenarioType) => void;
  onBaselinePlanChange: (id: string) => void;
  onHorizonChange: (id: string) => void;
  onStatusChange: (status: ScenarioStatus) => void;
  onRecalculate: () => void;
};

const SCENARIO_STATUSES: ScenarioStatus[] = ['Draft', 'Simulated', 'Compared', 'Applied', 'Discarded'];

export default function ScenarioSetupBar({
  scenarioType, baselinePlanId, site, horizonId, scenarioStatus,
  lastCalculatedAt, onTypeChange, onBaselinePlanChange, onHorizonChange,
  onStatusChange, onRecalculate,
}: Props) {
  const isLT = scenarioType === 'LongTerm';
  const baselinePlans = isLT ? LT_BASELINE_PLANS : ST_BASELINE_PLANS;
  const horizons = isLT ? LT_HORIZONS : ST_HORIZONS;

  return (
    <Paper elevation={0} sx={{...planningSurfaceSx, p: 1.6, mb: 2}}>
      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center'}}>
        {/* Scenario Type */}
        <Box>
          <Typography sx={{fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', mb: 0.5}}>
            Scenario Type
          </Typography>
          <Box sx={{display: 'flex', borderRadius: 1.5, overflow: 'hidden', border: `1px solid ${planningTokens.border}`}}>
            {(['LongTerm', 'ShortTerm'] as ScenarioType[]).map((t) => (
              <Box
                key={t}
                component="button"
                onClick={() => onTypeChange(t)}
                sx={{
                  px: 1.8, py: 0.8, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13,
                  bgcolor: scenarioType === t ? planningTokens.primaryBlue : 'transparent',
                  color: scenarioType === t ? '#fff' : planningTokens.textSecondary,
                  transition: 'all 0.15s',
                  '&:hover': {bgcolor: scenarioType === t ? planningTokens.primaryBlue : planningTokens.backgroundAlt},
                }}
              >
                {t === 'LongTerm' ? 'Long-Term' : 'Short-Term'}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Baseline Plan */}
        <FormControl size="small" sx={{minWidth: 240}}>
          <InputLabel sx={{fontSize: 12, fontWeight: 700}}>Baseline Plan</InputLabel>
          <Select
            value={baselinePlanId}
            label="Baseline Plan"
            onChange={(e) => onBaselinePlanChange(e.target.value)}
            sx={{fontSize: 13}}
          >
            {baselinePlans.map((p) => (
              <MenuItem key={p.id} value={p.id} sx={{fontSize: 13}}>{p.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Site */}
        <FormControl size="small" sx={{minWidth: 180}}>
          <InputLabel sx={{fontSize: 12, fontWeight: 700}}>Site</InputLabel>
          <Select value={site} label="Site" sx={{fontSize: 13}}>
            <MenuItem value={site} sx={{fontSize: 13}}>{site}</MenuItem>
          </Select>
        </FormControl>

        {/* Horizon */}
        <FormControl size="small" sx={{minWidth: 240}}>
          <InputLabel sx={{fontSize: 12, fontWeight: 700}}>Horizon</InputLabel>
          <Select
            value={horizonId}
            label="Horizon"
            onChange={(e) => onHorizonChange(e.target.value)}
            sx={{fontSize: 13}}
          >
            {horizons.map((h) => (
              <MenuItem key={h.id} value={h.id} sx={{fontSize: 13}}>{h.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Scenario Status */}
        <FormControl size="small" sx={{minWidth: 140}}>
          <InputLabel sx={{fontSize: 12, fontWeight: 700}}>Scenario Status</InputLabel>
          <Select
            value={scenarioStatus}
            label="Scenario Status"
            onChange={(e) => onStatusChange(e.target.value as ScenarioStatus)}
            sx={{fontSize: 13}}
            renderValue={(val) => <ScenarioStatusBadge status={val as ScenarioStatus} />}
          >
            {SCENARIO_STATUSES.map((s) => (
              <MenuItem key={s} value={s} sx={{fontSize: 13}}>
                <ScenarioStatusBadge status={s} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Last Calculated */}
        <Box sx={{ml: 'auto', display: 'flex', alignItems: 'center', gap: 1}}>
          <Box>
            <Typography sx={{fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em'}}>
              Last Calculated
            </Typography>
            <Typography sx={{fontSize: 12.5, fontWeight: 700, color: planningTokens.textPrimary}}>
              {lastCalculatedAt ?? '—'}
            </Typography>
          </Box>
          <Tooltip title="Re-run simulation">
            <IconButton size="small" onClick={onRecalculate}
              sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 1.5}}>
              <RefreshIcon fontSize="small" sx={{color: planningTokens.primaryBlue}} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Paper>
  );
}
