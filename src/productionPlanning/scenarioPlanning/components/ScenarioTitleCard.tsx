import {Box, Button, IconButton, Paper, Tooltip, Typography} from '@mui/material';
import {
  AutoGraph as ScenarioIcon,
  Compare as CompareIcon,
  Edit as EditIcon,
  MoreHoriz as MoreIcon,
  PlayArrow as RunIcon,
  RocketLaunch as ApplyIcon,
  Save as SaveIcon,
  Delete as DiscardIcon,
} from '@mui/icons-material';
import {planningCardSx, planningTokens} from '../../ui/planningTheme';
import {ScenarioStatusBadge} from './Badges';
import type {ScenarioPlan} from '../types';

type Props = {
  scenario: ScenarioPlan;
  onRunScenario: () => void;
  onCompare: () => void;
  onApplyToPlan: () => void;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onRename: () => void;
};

export default function ScenarioTitleCard({
  scenario, onRunScenario, onCompare, onApplyToPlan, onSaveDraft, onDiscard, onRename,
}: Props) {
  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 2, mb: 2}}>
      <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap'}}>
        {/* Icon + Name */}
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0}}>
          <Box sx={{
            width: 44, height: 44, borderRadius: 2.5, flexShrink: 0,
            bgcolor: `color-mix(in srgb, ${planningTokens.primaryBlue} 9%, transparent)`,
            color: planningTokens.primaryBlue,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ScenarioIcon fontSize="small" />
          </Box>
          <Box sx={{minWidth: 0}}>
            <Typography sx={{fontSize: 10.5, fontWeight: 700, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.07em'}}>
              Scenario
            </Typography>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
              <Typography sx={{fontSize: 20, fontWeight: 900, color: planningTokens.textPrimary, lineHeight: 1.2}}>
                {scenario.name}
              </Typography>
              <Tooltip title="Rename scenario">
                <IconButton size="small" onClick={onRename} sx={{color: planningTokens.textMuted}}>
                  <EditIcon sx={{fontSize: 16}} />
                </IconButton>
              </Tooltip>
              <ScenarioStatusBadge status={scenario.status} />
            </Box>
            <Typography sx={{fontSize: 12, color: planningTokens.textMuted, mt: 0.3}}>
              Created by {scenario.createdBy} on {scenario.createdAt}
            </Typography>
          </Box>
        </Box>

        {/* Actions */}
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
          <Button
            variant="contained"
            size="small"
            startIcon={<RunIcon />}
            onClick={onRunScenario}
            sx={{
              textTransform: 'none', fontWeight: 800,
              bgcolor: planningTokens.primaryBlue,
              '&:hover': {bgcolor: '#1558d6'},
            }}
          >
            Run Scenario
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CompareIcon />}
            onClick={onCompare}
            sx={{textTransform: 'none', fontWeight: 800, borderColor: planningTokens.primaryBlue, color: planningTokens.primaryBlue}}
          >
            Compare
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ApplyIcon />}
            onClick={onApplyToPlan}
            disabled={scenario.status === 'Discarded'}
            sx={{textTransform: 'none', fontWeight: 800, borderColor: '#16A34A', color: '#16A34A', '&:hover': {bgcolor: '#ECFDF3'}}}
          >
            Apply to Plan
          </Button>
          <Tooltip title="More actions">
            <IconButton size="small" sx={{border: `1px solid ${planningTokens.border}`, borderRadius: 1.5}}>
              <MoreIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SaveIcon />}
            onClick={onSaveDraft}
            sx={{textTransform: 'none', fontWeight: 800, borderColor: planningTokens.border, color: planningTokens.textSecondary}}
          >
            Save Draft
          </Button>
          <Button
            variant="text"
            size="small"
            startIcon={<DiscardIcon />}
            onClick={onDiscard}
            color="error"
            sx={{textTransform: 'none', fontWeight: 800}}
          >
            Discard
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
