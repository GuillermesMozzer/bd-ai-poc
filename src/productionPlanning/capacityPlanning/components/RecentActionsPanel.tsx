import {Box, Button, Divider, Paper, Stack, Typography} from '@mui/material';
import {CheckCircle as CheckCircleIcon} from '@mui/icons-material';
import {planningTokens} from '../../ui/planningTheme';
import type {CapacityAction} from '../types';

type Props = {
  actions: CapacityAction[];
  nextSteps: string[];
};

export default function RecentActionsPanel({actions, nextSteps}: Props) {
  return (
    <Paper elevation={0} sx={{borderRadius: 3, border: `1px solid ${planningTokens.border}`, overflow: 'hidden'}}>
      {/* Recent Actions */}
      <Box sx={{px: 2, py: 1.2, borderBottom: `1px solid ${planningTokens.border}`}}>
        <Typography sx={{fontSize: 13, fontWeight: 700, color: planningTokens.textPrimary}}>Recent Actions</Typography>
      </Box>
      <Box sx={{px: 2, py: 1}}>
        {actions.map((action, i) => (
          <Box key={i} sx={{mb: i < actions.length - 1 ? 1 : 0}}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
              <Box>
                <Typography sx={{fontSize: 11, color: planningTokens.textSecondary}}>{action.timestamp}</Typography>
                <Typography sx={{fontSize: 12, color: planningTokens.textPrimary, mt: 0.2}}>{action.description}</Typography>
              </Box>
              <Typography sx={{fontSize: 11, color: planningTokens.textMuted, whiteSpace: 'nowrap'}}>by {action.user}</Typography>
            </Stack>
          </Box>
        ))}
        <Button variant="text" size="small" sx={{fontSize: 11, fontWeight: 700, textTransform: 'none', color: planningTokens.primaryBlue, mt: 0.5, p: 0}}>
          View All
        </Button>
      </Box>

      <Divider />

      {/* Next Steps */}
      <Box sx={{px: 2, py: 1}}>
        <Typography sx={{fontSize: 12, fontWeight: 700, color: planningTokens.textPrimary, mb: 0.8}}>Next Steps</Typography>
        <Stack spacing={0.6}>
          {nextSteps.map((step) => (
            <Stack key={step} direction="row" alignItems="center" spacing={0.8}>
              <CheckCircleIcon sx={{fontSize: 15, color: planningTokens.success, flexShrink: 0}} />
              <Typography sx={{fontSize: 12, color: planningTokens.textPrimary}}>{step}</Typography>
            </Stack>
          ))}
        </Stack>
        <Button variant="text" size="small" sx={{fontSize: 11, fontWeight: 700, textTransform: 'none', color: planningTokens.primaryBlue, mt: 1, p: 0}}>
          View Workflow
        </Button>
      </Box>
    </Paper>
  );
}
