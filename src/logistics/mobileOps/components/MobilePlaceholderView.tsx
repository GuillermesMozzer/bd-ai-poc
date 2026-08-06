import React from 'react';
import { Box, Button, Paper, Typography } from '@mui/material';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';

type MobilePlaceholderViewProps = { title: string; message: string; onBack: () => void; backLabel?: string };

export default function MobilePlaceholderView({ title, message, onBack, backLabel = 'Back to Inbound Receiving' }: MobilePlaceholderViewProps) {
  return (
    <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, mt: { xs: 1, sm: 2 }, borderRadius: 4, bgcolor: '#FFFFFF', backgroundImage: 'none', border: '1px solid #C7DBEE', boxShadow: '0 12px 32px rgba(11, 92, 171, 0.10)', textAlign: 'center' }}>
      <Box aria-hidden="true" sx={{ width: 68, height: 68, borderRadius: 3.5, display: 'grid', placeItems: 'center', mx: 'auto', bgcolor: '#EAF3FB', color: '#0B5CAB', '& svg': { fontSize: 34 } }}>
        <WarehouseOutlinedIcon />
      </Box>
      <Typography component="h2" sx={{ color: '#102A43', fontSize: 24, fontWeight: 900, mt: 2.25 }}>{title}</Typography>
      <Typography sx={{ color: '#557086', fontSize: 15, fontWeight: 600, mt: 1, lineHeight: 1.5 }}>{message}</Typography>
      <Button variant="contained" onClick={onBack} sx={{ mt: 3, minHeight: 48, px: 3, borderRadius: 2.5, bgcolor: '#0B5CAB', backgroundImage: 'none', color: '#FFFFFF', boxShadow: 'none', '&:hover': { bgcolor: '#08477F', backgroundImage: 'none', boxShadow: 'none', transform: 'none' } }}>
        {backLabel}
      </Button>
    </Paper>
  );
}
