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
          'Reset Demo Data?\n\nIsso limpa o localStorage logístico e recarrega a página para o Happy Path inicial.',
        );
        if (confirmed) resetLogisticsDemoData();
      }}
      sx={{ textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}
    >
      Reset Demo Data
    </Button>
  );
}
