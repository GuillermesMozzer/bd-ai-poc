import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon, InfoOutlined as InfoOutlinedIcon } from '@mui/icons-material';
import { Box, Collapse, IconButton, Typography } from '@mui/material';
import { useState } from 'react';
import { tokenBrand, tokenDivider, tokenText } from '../../../workstation/theme';
import type { PlannerAiWorkflowStep } from './plannerAiWorkflow';

const STEP_GUIDANCE: Record<PlannerAiWorkflowStep, string> = {
  1: 'Start with Analyze & propose plan, or ask the copilot a question. All data is mocked for demo — no live systems or real dates.',
  2: 'Open Review recommendations to pick actions, or Compare strategies first. Only selected actions move forward.',
  3: 'Cascade preview shows mock impacts across horizons. Resolve approvals, then confirm to update the weekly board only.',
};

type PlannerAiHowItWorksProps = {
  activeStep: PlannerAiWorkflowStep;
};

export function PlannerAiHowItWorks({ activeStep }: PlannerAiHowItWorksProps) {
  const [open, setOpen] = useState(false);

  return (
    <Box
      sx={{
        borderRadius: '10px',
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 1.2,
          py: 0.75,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
          <InfoOutlinedIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
          <Typography sx={{ color: tokenText.primary, fontSize: '0.74rem', fontWeight: 800 }}>
            How agentic planning works
          </Typography>
        </Box>
        <IconButton
          size="small"
          aria-expanded={open}
          aria-label={open ? 'Collapse how it works' : 'Expand how it works'}
          onClick={() => setOpen((current) => !current)}
          sx={{ color: tokenText.secondary }}
        >
          {open ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      <Collapse in={open}>
        <Box sx={{ px: 1.2, pb: 1.15, display: 'grid', gap: 0.65 }}>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}>
            <Box component="span" sx={{ color: tokenText.primary, fontWeight: 800 }}>
              1 Analyze
            </Box>{' '}
            — BLU.AI reads the weekly board, planning queue, and mock CBM / follow-up / spare-parts signals.
          </Typography>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}>
            <Box component="span" sx={{ color: tokenText.primary, fontWeight: 800 }}>
              2 Review
            </Box>{' '}
            — Compare strategies, read agent reasoning, and choose which recommendations to keep.
          </Typography>
          <Typography sx={{ color: tokenText.secondary, fontSize: '0.71rem', lineHeight: 1.5 }}>
            <Box component="span" sx={{ color: tokenText.primary, fontWeight: 800 }}>
              3 Apply
            </Box>{' '}
            — Cascade preview gates every change. Confirm to update the weekly board; monthly / quarterly / annual views show impact badges only.
          </Typography>
          <Typography sx={{ color: tokenBrand.main, fontSize: '0.69rem', fontWeight: 700, lineHeight: 1.45 }}>
            Now: {STEP_GUIDANCE[activeStep]}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}
