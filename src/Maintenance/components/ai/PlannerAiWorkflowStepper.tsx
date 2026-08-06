import { Check as CheckIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { tokenBrand, tokenDivider, tokenSuccess, tokenText } from '../../../workstation/theme';
import type { PlannerAiWorkflowStep } from './plannerAiWorkflow';

const WORKFLOW_STEPS: Array<{ step: PlannerAiWorkflowStep; title: string; caption: string }> = [
  {
    step: 1,
    title: 'Analyze',
    caption: 'Mock signals from planner, backlog, CBM & parts',
  },
  {
    step: 2,
    title: 'Review',
    caption: 'Compare strategies and select actions',
  },
  {
    step: 3,
    title: 'Apply',
    caption: 'Confirm cascade impacts on weekly board',
  },
];

type PlannerAiWorkflowStepperProps = {
  activeStep: PlannerAiWorkflowStep;
  compact?: boolean;
};

export function PlannerAiWorkflowStepper({ activeStep, compact = false }: PlannerAiWorkflowStepperProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
        gap: compact ? 0.75 : 1,
      }}
    >
      {WORKFLOW_STEPS.map((item, index) => {
        const isComplete = item.step < activeStep;
        const isActive = item.step === activeStep;
        const accentColor = isComplete ? tokenSuccess.dark : isActive ? tokenBrand.main : tokenText.secondary;
        const borderColor = isComplete ? '#BBF7D0' : isActive ? tokenBrand.selectedBg : tokenDivider;
        const bgColor = isComplete ? '#ECFDF3' : isActive ? '#EFF6FF' : 'background.paper';

        return (
          <Box key={item.step} sx={{ display: 'flex', alignItems: 'stretch', gap: 0.75, minWidth: 0 }}>
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                p: compact ? 1 : 1.15,
                borderRadius: '10px',
                border: `1px solid ${borderColor}`,
                bgcolor: bgColor,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: isComplete ? tokenSuccess.dark : isActive ? tokenBrand.main : '#CBD5E1',
                    color: isComplete || isActive ? '#fff' : tokenText.secondary,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    flexShrink: 0,
                  }}
                >
                  {isComplete ? <CheckIcon sx={{ fontSize: 14 }} /> : item.step}
                </Box>
                <Typography sx={{ color: accentColor, fontSize: compact ? '0.74rem' : '0.78rem', fontWeight: 800 }}>
                  {item.title}
                </Typography>
              </Box>
              {!compact ? (
                <Typography sx={{ mt: 0.45, color: tokenText.secondary, fontSize: '0.68rem', lineHeight: 1.4, pl: 3.4 }}>
                  {item.caption}
                </Typography>
              ) : null}
            </Box>
            {index < WORKFLOW_STEPS.length - 1 ? (
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  width: 10,
                  alignSelf: 'center',
                  height: 2,
                  borderRadius: 99,
                  bgcolor: item.step < activeStep ? tokenSuccess.dark : tokenDivider,
                  flexShrink: 0,
                }}
              />
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
