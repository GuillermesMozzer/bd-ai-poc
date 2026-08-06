import React from 'react';
import {Box, Button, Paper, Stack, Typography} from '@mui/material';
import {AutoAwesomeRounded as AutoAwesomeRoundedIcon, RefreshRounded as RefreshRoundedIcon} from '@mui/icons-material';
import type {AiPriorityBriefing} from '../types';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid rgba(29,116,255,0.18)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

export default function AiPriorityBriefingCard({
  briefing,
  onQuickAction,
}: {
  briefing: AiPriorityBriefing;
  onQuickAction: (id: string) => void;
}) {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, overflow: 'hidden'}}>
      <Box sx={{background: 'linear-gradient(135deg, #08184A 0%, #1D74FF 100%)', px: 2.25, py: 1.6}}>
        <Stack direction={{xs: 'column', lg: 'row'}} spacing={2} justifyContent="space-between" alignItems={{xs: 'flex-start', lg: 'center'}}>
          <Box sx={{minWidth: 0}}>
            <Stack direction="row" spacing={1} alignItems="center">
              <AutoAwesomeRoundedIcon sx={{fontSize: 18, color: '#FFFFFF'}} />
              <Typography sx={{fontSize: 12, fontWeight: 900, letterSpacing: '0.08em', color: '#FFFFFF', textTransform: 'uppercase'}}>
                AI Priority Briefing
              </Typography>
            </Stack>
            <Typography sx={{fontSize: 22, fontWeight: 900, color: '#FFFFFF', mt: 1, lineHeight: 1.2, maxWidth: 920}}>
              {briefing.headline}
            </Typography>
            <Typography sx={{fontSize: 13, color: 'rgba(255,255,255,0.82)', mt: 1, maxWidth: 960, lineHeight: 1.6}}>
              {briefing.summary}
            </Typography>
          </Box>
          <Stack spacing={0.5} sx={{minWidth: 220}}>
            {briefing.keySignals.map((signal) => (
              <Box key={signal} sx={{px: 1.2, py: 0.75, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.12)'}}>
                <Typography sx={{fontSize: 12, color: '#FFFFFF', lineHeight: 1.45}}>{signal}</Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>
      <Box sx={{px: 2.25, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center'}}>
        {briefing.quickActions.map((action) => (
          <Button
            key={action.id}
            variant={action.id === 'review-top-actions' ? 'contained' : 'outlined'}
            size="small"
            onClick={() => onQuickAction(action.id)}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
              ...(action.id === 'review-top-actions'
                ? {bgcolor: '#1D74FF', '&:hover': {bgcolor: '#1558C0'}}
                : {borderColor: 'rgba(148,163,184,0.45)', color: 'var(--planning-text-primary)'}),
            }}
          >
            {action.id === 'refresh-readiness' ? <RefreshRoundedIcon sx={{fontSize: 16, mr: 0.75}} /> : null}
            {action.label}
          </Button>
        ))}
        <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', ml: 'auto'}}>{briefing.refreshLabel}</Typography>
      </Box>
    </Paper>
  );
}
