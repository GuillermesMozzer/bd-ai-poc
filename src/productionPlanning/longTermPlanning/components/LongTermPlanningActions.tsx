import {useState} from 'react';
import {
  AddCircleOutline as AddCircleOutlineIcon,
  Autorenew as AutorenewIcon,
  FileDownloadOutlined as FileDownloadOutlinedIcon,
  InsightsOutlined as InsightsOutlinedIcon,
  MoreHoriz as MoreHorizIcon,
  PlaylistAddCheckCircleOutlined as PlaylistAddCheckCircleOutlinedIcon,
} from '@mui/icons-material';
import {Box, Menu, MenuItem, Paper} from '@mui/material';
import type {PlanningViewMode} from '../types';
import {ActionButton} from '../../ui/PlanningComponents';
import {planningCardSx} from '../../ui/planningTheme';
import LongTermPlanningViewToggle from './LongTermPlanningViewToggle';

type LongTermPlanningActionsProps = {
  disabled?: boolean;
  loadingAction: string | null;
  canCompareScenario: boolean;
  canApplyScenario: boolean;
  canRelease: boolean;
  hasSelectedRows: boolean;
  planningViewMode: PlanningViewMode;
  onValidate: () => void;
  onRunCapacity: () => void;
  onCreateScenario: () => void;
  onCompareScenario: () => void;
  onApplyScenario: () => void;
  onReleasePlan: () => void;
  onResetDemoPlan: () => void;
  onTogglePlanningView: (mode: PlanningViewMode) => void;
};

export default function LongTermPlanningActions(props: LongTermPlanningActionsProps) {
  const {loadingAction} = props;
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const isLoading = (action: string) => loadingAction === action;

  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 1.1}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', alignItems: 'center'}}>
        <Box sx={{display: 'flex', gap: 0.9, flexWrap: 'wrap', alignItems: 'center'}}>
          <LongTermPlanningViewToggle value={props.planningViewMode} onChange={props.onTogglePlanningView} />
          <ActionButton
            label="Assign Line"
            variant="primary"
            startIcon={<PlaylistAddCheckCircleOutlinedIcon />}
            disabled={props.disabled || !props.hasSelectedRows}
            onClick={props.onCreateScenario}
          />
          <ActionButton
            label={isLoading('validate') ? 'Recalculating...' : 'Recalculate'}
            startIcon={<AutorenewIcon />}
            disabled={props.disabled || isLoading('validate')}
            onClick={props.onValidate}
          />
          <ActionButton
            label={isLoading('capacity') ? 'Checking...' : 'Run Capacity Check'}
            variant="primary"
            startIcon={<InsightsOutlinedIcon />}
            disabled={props.disabled || isLoading('capacity')}
            onClick={props.onRunCapacity}
          />
          <ActionButton label="Export" startIcon={<FileDownloadOutlinedIcon />} />
          <ActionButton
            label="Create Scenario"
            startIcon={<AddCircleOutlineIcon />}
            disabled={props.disabled}
            onClick={props.onCreateScenario}
          />
        </Box>
        <ActionButton
          label="More actions"
          startIcon={<MoreHorizIcon />}
          onClick={(event) => setMenuAnchor(event.currentTarget)}
        />
      </Box>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => {props.onCompareScenario(); setMenuAnchor(null);}} disabled={!props.canCompareScenario}>
          Compare Scenario
        </MenuItem>
        <MenuItem onClick={() => {props.onApplyScenario(); setMenuAnchor(null);}} disabled={!props.canApplyScenario}>
          Apply Scenario
        </MenuItem>
        <MenuItem onClick={() => {props.onReleasePlan(); setMenuAnchor(null);}} disabled={!props.canRelease}>
          Release Plan
        </MenuItem>
        <MenuItem onClick={() => {props.onResetDemoPlan(); setMenuAnchor(null);}} disabled={isLoading('load')}>
          {isLoading('load') ? 'Resetting...' : 'Reset Demo Plan'}
        </MenuItem>
      </Menu>
    </Paper>
  );
}
