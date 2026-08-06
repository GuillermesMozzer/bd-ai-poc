import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import type {MaterialRecord} from '../types';

interface Props {
  open: boolean;
  material: MaterialRecord | null;
  onClose: () => void;
  onAction: (message: string) => void;
}

const genericPrompts = [
  'Which materials will stock out in the next 4 weeks?',
  'What changed since the last refresh?',
  'Which supplier deliveries are late?',
  'Which materials are below 50% safety stock?',
  'Which SQA holds impact production?',
];

function HeparinContent({onAction}: {onAction: (m: string) => void}) {
  return (
    <Stack spacing={2}>
      <Box sx={{p: 1.5, borderRadius: 2, bgcolor: '#FFF7ED', border: '1px solid #FED7AA'}}>
        <Typography sx={{fontSize: 11, fontWeight: 900, color: '#C2410C', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 0.5}}>
          Risk Summary
        </Typography>
        <Typography sx={{fontSize: 13, color: '#7C2D12', lineHeight: 1.65}}>
          Material <strong>8004430 — Heparin</strong> is projected to fall below safety stock in Week 31 and reach stockout in Week 33.
        </Typography>
      </Box>

      <Box>
        <Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1}}>
          Main Drivers
        </Typography>
        <Stack spacing={0.6}>
          {[
            'ABG demand increased versus baseline by ~15%.',
            'Open PO (4500012345) is confirmed 7 days after the required date.',
            '24 units of current stock are on SQA hold (CoA deviation).',
            'Usage trend is above planned scrap assumption (actual 3.2% vs plan 3%).',
          ].map((d, i) => (
            <Typography key={i} sx={{fontSize: 13, color: 'var(--planning-text-secondary)', lineHeight: 1.55}}>
              {i + 1}. {d}
            </Typography>
          ))}
        </Stack>
      </Box>

      <Divider />

      <Box>
        <Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.07em', mb: 1}}>
          Recommended Actions
        </Typography>
        <Stack spacing={0.6}>
          {[
            'Request supplier pull-in of PO 4500012345 by 7 days.',
            'Ask SQA to confirm release date for Batch B2026-001.',
            'Simulate moving PCN NS364316 production from Week 32 to Week 34.',
            'If pull-in is not possible, create a formal expedite request.',
          ].map((a, i) => (
            <Typography key={i} sx={{fontSize: 13, color: 'var(--planning-text-secondary)', lineHeight: 1.55}}>
              {i + 1}. {a}
            </Typography>
          ))}
        </Stack>
      </Box>

      <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
        <Chip
          label="Confidence: 88%"
          size="small"
          sx={{bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', border: '1px solid #C7D2FE', fontWeight: 800, fontSize: 11}}
        />
        <Chip
          label="Data as of: 14 May 2026 06:15"
          size="small"
          sx={{bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', border: '1px solid var(--planning-border)', fontWeight: 700, fontSize: 11}}
        />
      </Box>

      <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 1}}>
        {[
          {label: 'Create Scenario', msg: 'Mock scenario created for Heparin.'},
          {label: 'Create Expedite', msg: 'Mock expedite created for 8004430.'},
          {label: 'Notify Planner', msg: 'Mock notification sent to Planner.'},
          {label: 'Notify SQA', msg: 'Mock notification sent to SQA.'},
          {label: 'Add Comment', msg: 'Mock comment added.'},
        ].map(({label, msg}) => (
          <Button
            key={label}
            variant="outlined"
            size="small"
            onClick={() => onAction(msg)}
            sx={{textTransform: 'none', fontSize: 12, fontWeight: 700, borderRadius: 1.5}}
          >
            {label}
          </Button>
        ))}
      </Box>
    </Stack>
  );
}

function GenericMaterialContent({material, onAction}: {material: MaterialRecord; onAction: (m: string) => void}) {
  return (
    <Stack spacing={2}>
      <Box sx={{p: 1.5, borderRadius: 2, bgcolor: '#F0FDF4', border: '1px solid #ABEFC6'}}>
        <Typography sx={{fontSize: 13, color: '#166534', lineHeight: 1.65}}>
          AI analysis for <strong>{material.materialNumber} — {material.materialDescription}</strong>:
          current status is <strong>{material.readinessStatus}</strong>.
          {material.riskReason ? ` Risk note: ${material.riskReason}` : ' No critical risk factors detected at this time.'}
        </Typography>
      </Box>
      <Box sx={{display: 'flex', gap: 1, flexWrap: 'wrap'}}>
        {[
          {label: 'Create Scenario', msg: `Mock scenario created for ${material.materialNumber}.`},
          {label: 'Create Expedite', msg: `Mock expedite created for ${material.materialNumber}.`},
          {label: 'Notify Planner', msg: 'Mock notification sent to Planner.'},
        ].map(({label, msg}) => (
          <Button key={label} variant="outlined" size="small" onClick={() => onAction(msg)}
            sx={{textTransform: 'none', fontSize: 12, fontWeight: 700, borderRadius: 1.5}}>
            {label}
          </Button>
        ))}
      </Box>
    </Stack>
  );
}

export default function AIAssistantPanel({open, material, onClose, onAction}: Props) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" scroll="paper">
      <DialogTitle sx={{display: 'flex', alignItems: 'flex-start', gap: 1.5, pr: 1.2, pb: 1.5}}>
        <Box sx={{flex: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
            <AutoAwesomeIcon sx={{fontSize: 18, color: '#7C3AED'}} />
            <Typography sx={{fontSize: 11, fontWeight: 900, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
              AI Material Risk Advisor
            </Typography>
          </Box>
          <Typography sx={{fontSize: 20, fontWeight: 900, color: 'var(--planning-text-primary)', mt: 0.3}}>
            {material ? `${material.materialNumber} — ${material.materialDescription}` : 'Ask the AI'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{mt: 0.3}}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          {/* Disclaimer */}
          <Box sx={{display: 'flex', gap: 1, p: 1.5, borderRadius: 2, bgcolor: '#FFFBEB', border: '1px solid #FDE68A', alignItems: 'flex-start'}}>
            <WarningAmberIcon sx={{fontSize: 16, color: '#B45309', mt: 0.1, flexShrink: 0}} />
            <Typography sx={{fontSize: 12, color: '#78350F', lineHeight: 1.55}}>
              <strong>AI suggestions are advisory only.</strong> No inventory, purchasing, quality, warehouse, or production change will be applied without authorized user confirmation.
            </Typography>
          </Box>

          {material ? (
            material.materialNumber === '8004430'
              ? <HeparinContent onAction={onAction} />
              : <GenericMaterialContent material={material} onAction={onAction} />
          ) : (
            <Box>
              <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', mb: 1.5}}>
                Select a material for a specific analysis, or try one of these prompts:
              </Typography>
              <Stack spacing={1}>
                {genericPrompts.map((p) => (
                  <Box
                    key={p}
                    onClick={() => onAction('Mock AI response generated.')}
                    sx={{p: 1.2, borderRadius: 1.5, border: '1px solid #E5E7EB', cursor: 'pointer', '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)', borderColor: '#DDD6FE'}, fontSize: 13, color: '#374151'}}
                  >
                    {p}
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{px: 2, py: 1.5}}>
        <Button onClick={onClose} sx={{textTransform: 'none', fontWeight: 800}}>Dismiss</Button>
      </DialogActions>
    </Dialog>
  );
}
