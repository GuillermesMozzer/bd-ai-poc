import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';

type MobilePlaceholderViewProps = { title: string; message: string; onBack: () => void; backLabel?: string };

export default function MobilePlaceholderView({ title, message, onBack, backLabel = 'Back to Inbound Receiving' }: MobilePlaceholderViewProps) {
  return (
    <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, mt: { xs: 1, sm: 2 }, borderRadius: 4, bgcolor: 'var(--active-theme-background-paper)', backgroundImage: 'none', border: '1px solid var(--paper-border-color)', boxShadow: 'var(--paper-shadow)', textAlign: 'center' }}>
      <Box aria-hidden="true" sx={{ width: 68, height: 68, borderRadius: 3.5, display: 'grid', placeItems: 'center', mx: 'auto', bgcolor: 'var(--token-brand-soft-bg)', color: 'var(--token-brand-main)', '& svg': { fontSize: 34 } }}>
        <WarehouseOutlinedIcon />
      </Box>
      <Typography component="h2" sx={{ color: 'var(--active-theme-text-primary)', fontSize: 24, fontWeight: 900, mt: 2.25 }}>{title}</Typography>
      <Typography sx={{ color: 'var(--active-theme-text-secondary)', fontSize: 15, fontWeight: 600, mt: 1, lineHeight: 1.5 }}>{message}</Typography>
      <Button variant="contained" onClick={onBack} sx={{ mt: 3, minHeight: 48, px: 3, borderRadius: 2.5, bgcolor: 'var(--token-brand-main)', backgroundImage: 'none', color: 'var(--token-brand-contrast)', boxShadow: 'none', '&:hover': { bgcolor: 'var(--token-brand-dark)', backgroundImage: 'none', boxShadow: 'none', transform: 'none' } }}>
        {backLabel}
      </Button>
    </Paper>
  );
}
