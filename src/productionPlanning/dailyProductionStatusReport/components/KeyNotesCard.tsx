import React from 'react';
import {Box, Paper, Typography} from '@mui/material';
import type {PerformanceStatusTone, ProductionNote} from '../types';
import {getSeverityColor} from '../utils';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
} as const;

const toneMap: Record<PerformanceStatusTone, string> = {
  green: '#027A48',
  orange: '#C2410C',
  red: '#B42318',
  gray: '#667085',
  blue: '#1D4ED8',
};

export default function KeyNotesCard({notes}: {notes: ProductionNote[]}) {
  return (
    <Paper elevation={0} sx={{...moduleCardSx, p: 1.6}}>
      <Typography sx={{fontSize: 12, color: '#4F46E5', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>
        Key Notes
      </Typography>
      <Box component="ul" sx={{m: 0, mt: 1.2, pl: 2.2, display: 'grid', gap: 1.1}}>
        {notes.map((note) => (
          <Box component="li" key={note.id} sx={{color: toneMap[getSeverityColor(note.severity)]}}>
            <Typography sx={{fontSize: 13.5, color: 'var(--planning-text-secondary)', lineHeight: 1.55}}>{note.message}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
