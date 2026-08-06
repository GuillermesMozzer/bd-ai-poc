import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import { Box, Paper, Typography } from '@mui/material';
import { tokenDivider, tokenError, tokenSuccess, tokenText, tokenWarning } from '../../../workstation/theme';
import type { PlannerAiFeasibilityItem } from '../../ai/types';

function getChecklistIcon(status: PlannerAiFeasibilityItem['status']) {
  if (status === 'pass') {
    return <CheckCircleOutlineIcon sx={{ fontSize: 16, color: tokenSuccess.main, mt: 0.1 }} />;
  }

  if (status === 'blocker') {
    return <ErrorOutlineIcon sx={{ fontSize: 16, color: tokenError.main, mt: 0.1 }} />;
  }

  return <WarningAmberIcon sx={{ fontSize: 16, color: tokenWarning.main, mt: 0.1 }} />;
}

type AIFeasibilityChecklistProps = {
  items: PlannerAiFeasibilityItem[];
};

export function AIFeasibilityChecklist({ items }: AIFeasibilityChecklistProps) {
  return (
    <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, p: 1.8 }}>
      <Typography sx={{ color: tokenText.primary, fontSize: '0.84rem', fontWeight: 800 }}>
        Feasibility checklist
      </Typography>
      <Box sx={{ mt: 1.1, display: 'grid', gap: 0.95 }}>
        {items.map((item) => (
          <Box
            key={item.id}
            sx={{
              p: 1,
              borderRadius: '10px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: 'background.paper',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.8,
            }}
          >
            {getChecklistIcon(item.status)}
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 800 }}>
                {item.label}
              </Typography>
              <Typography sx={{ mt: 0.2, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
                {item.detail}
              </Typography>
              {item.agentContributors?.length ? (
                <Typography sx={{ mt: 0.24, color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700, lineHeight: 1.4 }}>
                  Agents: {item.agentContributors.join(', ')}
                </Typography>
              ) : null}
              {item.sourceLabel ? (
                <Typography sx={{ mt: 0.22, color: tokenText.secondary, fontSize: '0.68rem', lineHeight: 1.4 }}>
                  Source: {item.sourceLabel}
                </Typography>
              ) : null}
              {item.resolutionHint ? (
                <Typography sx={{ mt: 0.28, color: tokenWarning.dark, fontSize: '0.71rem', lineHeight: 1.4 }}>
                  Next step: {item.resolutionHint}
                </Typography>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
