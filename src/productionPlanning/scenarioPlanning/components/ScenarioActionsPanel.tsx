import {Box, Paper, Tooltip, Typography} from '@mui/material';
import {
  ContentCopy as DuplicateIcon,
  Delete as DeleteIcon,
  Download as ExportIcon,
  PlaylistAdd as ActionListIcon,
} from '@mui/icons-material';
import {planningCardSx, planningTokens} from '../../ui/planningTheme';

type Props = {
  onExport: () => void;
  onCreateActionList: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
};

type ActionItem = {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: string;
  disabled?: boolean;
  tooltip?: string;
};

export default function ScenarioActionsPanel({onExport, onCreateActionList, onDuplicate, onDelete}: Props) {
  const actions: ActionItem[] = [
    {
      label: 'Export Scenario Report',
      icon: <ExportIcon sx={{fontSize: 17}} />,
      onClick: onExport,
      disabled: true,
      tooltip: 'Available in future integration.',
    },
    {
      label: 'Create Action List',
      icon: <ActionListIcon sx={{fontSize: 17}} />,
      onClick: onCreateActionList,
    },
    {
      label: 'Duplicate Scenario',
      icon: <DuplicateIcon sx={{fontSize: 17}} />,
      onClick: onDuplicate,
    },
    {
      label: 'Delete Scenario',
      icon: <DeleteIcon sx={{fontSize: 17}} />,
      onClick: onDelete,
      color: planningTokens.danger,
    },
  ];

  return (
    <Paper elevation={0} sx={{...planningCardSx, p: 0, overflow: 'hidden'}}>
      <Box sx={{px: 2, py: 1.5, borderBottom: `1px solid ${planningTokens.border}`}}>
        <Typography sx={{fontSize: 13.5, fontWeight: 900, color: planningTokens.textPrimary}}>
          Scenario Actions
        </Typography>
      </Box>
      <Box sx={{display: 'flex', flexDirection: 'column', p: 1.5, gap: 0.5}}>
        {actions.map((action) => (
          <Tooltip key={action.label} title={action.tooltip ?? ''} placement="left">
            <span>
              <Box
                component="button"
                onClick={action.disabled ? undefined : action.onClick}
                disabled={action.disabled}
                sx={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 1.2,
                  px: 1.5, py: 1, border: 'none', borderRadius: 1.5, cursor: action.disabled ? 'not-allowed' : 'pointer',
                  bgcolor: 'transparent', textAlign: 'left',
                  color: action.disabled ? planningTokens.textMuted : (action.color ?? planningTokens.primaryBlue),
                  opacity: action.disabled ? 0.5 : 1,
                  fontWeight: 700, fontSize: 13,
                  transition: 'background 0.12s',
                  '&:hover:not(:disabled)': {bgcolor: `color-mix(in srgb, ${planningTokens.primaryBlue} 4%, transparent)`},
                }}
              >
                {action.icon}
                {action.label}
              </Box>
            </span>
          </Tooltip>
        ))}
      </Box>
    </Paper>
  );
}
