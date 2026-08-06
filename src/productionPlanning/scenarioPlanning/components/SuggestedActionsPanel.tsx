import {Box, Chip, Paper, Typography} from '@mui/material';
import {
  AddCircleOutline as AddCapacityIcon,
  ArrowBack as PullForwardIcon,
  ArrowForward as PushOutIcon,
  LocalShipping as ExpediteMtlIcon,
  MoveDown as MoveIcon,
  ReduceCapacity as ReduceIcon,
  Rule as ReviewIcon,
  SwapHoriz as ReassignIcon,
} from '@mui/icons-material';
import {planningTokens, planningSurfaceSx} from '../../ui/planningTheme';
import type {SuggestedAction} from '../types';

type Props = {
  actions: SuggestedAction[];
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  AddCapacity: <AddCapacityIcon sx={{fontSize: 18}} />,
  MoveDemand: <MoveIcon sx={{fontSize: 18}} />,
  PullProductionForward: <PullForwardIcon sx={{fontSize: 18}} />,
  PushProductionOut: <PushOutIcon sx={{fontSize: 18}} />,
  ReduceCommitment: <ReduceIcon sx={{fontSize: 18}} />,
  ReassignLine: <ReassignIcon sx={{fontSize: 18}} />,
  ExpediteMaterial: <ExpediteMtlIcon sx={{fontSize: 18}} />,
  ReviewMRPReadiness: <ReviewIcon sx={{fontSize: 18}} />,
  ReviewFrozenPeriod: <ReviewIcon sx={{fontSize: 18}} />,
};

function priorityStyle(priority: string) {
  if (priority === 'Critical') return {bg: '#FEF2F2', color: planningTokens.danger, border: '#FECACA'};
  if (priority === 'High') return {bg: '#FFF7ED', color: planningTokens.warning, border: '#FED7AA'};
  if (priority === 'Medium') return {bg: '#EFF6FF', color: planningTokens.primaryBlue, border: '#BFDBFE'};
  return {bg: '#F8FAFC', color: planningTokens.textSecondary, border: '#CBD5E1'};
}

function effortStyle(effort: string) {
  if (effort === 'High') return planningTokens.danger;
  if (effort === 'Medium') return planningTokens.warning;
  return planningTokens.success;
}

export default function SuggestedActionsPanel({actions}: Props) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.5}}>
      {actions.length === 0 && (
        <Typography sx={{fontSize: 13, color: planningTokens.textMuted}}>No suggested actions at this time.</Typography>
      )}
      {actions.map((action) => {
        const pt = priorityStyle(action.priority);
        const ec = effortStyle(action.effort);
        const icon = CATEGORY_ICONS[action.category] ?? <ReviewIcon sx={{fontSize: 18}} />;

        return (
          <Paper key={action.id} elevation={0} sx={{...planningSurfaceSx, p: 2}}>
            <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 1.5}}>
              <Box sx={{
                width: 36, height: 36, borderRadius: 2, flexShrink: 0,
                bgcolor: `color-mix(in srgb, ${planningTokens.primaryBlue} 8%, transparent)`,
                color: planningTokens.primaryBlue,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {icon}
              </Box>
              <Box sx={{flex: 1, minWidth: 0}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.4}}>
                  <Typography sx={{fontSize: 13.5, fontWeight: 800, color: planningTokens.textPrimary}}>
                    {action.title}
                  </Typography>
                  <Chip size="small" label={action.priority}
                    sx={{bgcolor: pt.bg, color: pt.color, border: `1px solid ${pt.border}`, fontWeight: 800, fontSize: 11}} />
                </Box>
                <Typography sx={{fontSize: 12.5, color: planningTokens.textSecondary, mb: 1, lineHeight: 1.5}}>
                  {action.description}
                </Typography>
                <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 2}}>
                  <Box>
                    <Typography sx={{fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em'}}>Impact</Typography>
                    <Typography sx={{fontSize: 12, color: planningTokens.success}}>{action.impact}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em'}}>Effort</Typography>
                    <Typography sx={{fontSize: 12, color: ec, fontWeight: 700}}>{action.effort}</Typography>
                  </Box>
                  {action.relatedProductCode && (
                    <Box>
                      <Typography sx={{fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em'}}>Product</Typography>
                      <Typography sx={{fontSize: 12}}>{action.relatedProductCode}</Typography>
                    </Box>
                  )}
                  {action.relatedPeriod && (
                    <Box>
                      <Typography sx={{fontSize: 10.5, fontWeight: 800, color: planningTokens.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em'}}>Period</Typography>
                      <Typography sx={{fontSize: 12}}>{action.relatedPeriod}</Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        );
      })}
    </Box>
  );
}
