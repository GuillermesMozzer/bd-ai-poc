import React from 'react';
import { Box, Typography } from '@mui/material';

type PalletProgressSummaryProps = {
  confirmedCount: number;
  expectedCount: number;
};

export default function PalletProgressSummary({ confirmedCount, expectedCount }: PalletProgressSummaryProps) {
  const progress = expectedCount === 0 ? 0 : (confirmedCount / expectedCount) * 100;

  return (
    <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'var(--token-brand-soft-bg)', border: '1px solid var(--paper-border-color)' }}>
      <Typography sx={{ color: 'var(--token-brand-main)', fontSize: 14, fontWeight: 900, lineHeight: 1.25 }}>
        {confirmedCount} of {expectedCount} pallets identified
      </Typography>
      <Box aria-hidden="true" sx={{ height: 7, mt: 1, overflow: 'hidden', borderRadius: 99, bgcolor: 'var(--token-brand-selected-bg)' }}>
        <Box sx={{ width: `${progress}%`, height: '100%', borderRadius: 'inherit', bgcolor: 'var(--token-brand-main)', transition: 'width 180ms ease' }} />
      </Box>
    </Box>
  );
}
