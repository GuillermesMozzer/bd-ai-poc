import React from 'react';
import { Button } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import { resetLogisticsDemoData } from '../data/reactiveLogisticsDemo';

type ResetDemoDataButtonProps = {
  variant?: 'text' | 'outlined' | 'contained';
  size?: 'small' | 'medium' | 'large';
};

export default function ResetDemoDataButton({
  variant = 'outlined',
  size = 'small',
}: ResetDemoDataButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      color="warning"
      startIcon={<ReplayIcon />}
      onClick={() => {
        const confirmed = window.confirm(
          'Reset Demo Data?\n\nThis clears logistics localStorage and reloads the page to the initial Happy Path.',
        );
        if (confirmed) resetLogisticsDemoData();
      }}
      sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
    >
      Reset Demo Data
    </Button>
  );
}
