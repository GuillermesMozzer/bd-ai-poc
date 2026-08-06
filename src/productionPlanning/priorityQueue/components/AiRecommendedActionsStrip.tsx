import React from 'react';
import {Box, Button, Paper, Stack, Typography} from '@mui/material';
import {ArrowOutwardRounded as ArrowOutwardRoundedIcon} from '@mui/icons-material';
import type {AiActionCard} from '../types';
import {AiLabel, ConfidenceBadge, GovernedBadge, PriorityBadge, SeverityBadge} from './Badges';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

export default function AiRecommendedActionsStrip({
  actions,
  onOpen,
  onAction,
}: {
  actions: AiActionCard[];
  onOpen: (id: string) => void;
  onAction: (label: string, relatedId: string) => void;
}) {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{fontSize: 15, fontWeight: 900, color: '#08184A'}}>AI Recommended Actions</Typography>
        <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>AI prepares actions; controlled actions still require human confirmation.</Typography>
      </Stack>
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 1.2}}>
        {actions.map((action) => (
          <Paper key={action.id} elevation={0} sx={{...moduleCardSx, p: 1.6}}>
            <Stack spacing={1.25}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box>
                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                    <Typography sx={{fontSize: 12, fontWeight: 900, color: '#1D74FF'}}>P{action.rank}</Typography>
                    {'clusterName' in action ? null : null}
                    {'Critical' === action.priority || 'High' === action.priority || 'Medium' === action.priority || 'Low' === action.priority ? (
                      <PriorityBadge priority={action.priority as any} />
                    ) : (
                      <SeverityBadge severity={action.priority as any} />
                    )}
                    <AiLabel />
                    {action.governed ? <GovernedBadge /> : null}
                  </Stack>
                  <Typography sx={{fontSize: 15, fontWeight: 800, color: '#08184A', mt: 0.8}}>{action.title}</Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => onOpen(action.relatedId)}
                  sx={{minWidth: 0, p: 0.5, borderRadius: 2}}
                >
                  <ArrowOutwardRoundedIcon sx={{fontSize: 18}} />
                </Button>
              </Stack>

              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1}}>
                <Meta label="Related" value={action.relatedLabel} />
                <Meta label="Demand protected" value={action.demandProtected} />
                <Meta label="Deadline" value={action.deadline} />
                <Meta label="Owner" value={action.owner} />
                <Box>
                  <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.45}}>
                    Confidence
                  </Typography>
                  <ConfidenceBadge confidence={action.confidence} />
                </Box>
              </Box>

              <Box sx={{p: 1.1, borderRadius: 2, bgcolor: 'var(--planning-surface-muted)', border: '1px solid var(--planning-border)'}}>
                <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.45}}>
                  Why
                </Typography>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', lineHeight: 1.5}}>{action.why}</Typography>
              </Box>

              <Stack direction="row" gap={0.8} flexWrap="wrap">
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => onAction(action.primaryAction, action.relatedId)}
                  sx={{textTransform: 'none', fontWeight: 700, bgcolor: '#1D74FF', '&:hover': {bgcolor: '#1558C0'}}}
                >
                  {action.primaryAction}
                </Button>
                {action.secondaryActions.map((label) => (
                  <Button
                    key={label}
                    variant="outlined"
                    size="small"
                    onClick={() => onAction(label, action.relatedId)}
                    sx={{textTransform: 'none', fontWeight: 700, borderColor: 'rgba(148,163,184,0.45)', color: 'var(--planning-text-primary)'}}
                  >
                    {label}
                  </Button>
                ))}
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

function Meta({label, value}: {label: string; value: string}) {
  return (
    <Box>
      <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', mb: 0.45}}>
        {label}
      </Typography>
      <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', lineHeight: 1.45}}>{value}</Typography>
    </Box>
  );
}
