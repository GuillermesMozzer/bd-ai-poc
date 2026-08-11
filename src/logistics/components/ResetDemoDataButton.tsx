import React from 'react';
import { Button } from '@mui/material';
import ReplayIcon from '@mui/icons-material/Replay';
import { resetLogisticsDemoData } from '../data/reactiveLogisticsDemo';
import { focusVisibleSx, touchTargetSx } from '../a11y';

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
      startIcon={<ReplayIcon aria-hidden />}
      aria-label="Reset demo data to the initial Happy Path"
      onClick={() => {
        const confirmed = window.confirm(
          'Reset Demo Data?\n\nThis clears logistics localStorage and reloads the page to the initial Happy Path.',
        );
        if (confirmed) resetLogisticsDemoData();
      }}
      sx={{
        textTransform: 'none',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        ...touchTargetSx,
        ...focusVisibleSx,
      }}
    >
      Reset Demo Data
    </Button>
  );
}
