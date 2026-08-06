import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import { lx } from '../themeTokens';

type PanelCardProps = {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  sx?: object;
};

export default function PanelCard({ title, action, children, sx }: PanelCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${lx.border}`,
        bgcolor: 'background.paper',
        color: 'text.primary',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.4,
          borderBottom: `1px solid ${lx.divider}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: lx.text }}>
          {title}
        </Typography>
        {action}
      </Box>
      <Box sx={{ p: 2, color: lx.text }}>{children}</Box>
    </Paper>
  );
}
