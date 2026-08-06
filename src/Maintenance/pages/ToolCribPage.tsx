import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Construction as ConstructionIcon } from '@mui/icons-material';

export default function ToolCribPage() {
  return (
    <Box
      sx={{
        flexGrow: 1,
        minHeight: 'calc(100vh - 112px)',
        overflowY: 'auto',
        bgcolor: 'background.default',
        p: { xs: 2, md: 4 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: 'min(720px, 100%)',
          p: { xs: 4, md: 6 },
          borderRadius: 4,
          border: '1px solid rgba(148,163,184,0.22)',
          textAlign: 'center',
          bgcolor: '#FFFFFF',
          boxShadow: '0 20px 50px rgba(15,23,42,0.05)',
        }}
      >
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            bgcolor: 'rgba(15, 118, 110, 0.1)',
            color: '#0f766e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <ConstructionIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography
          variant="overline"
          sx={{ color: '#0f766e', fontWeight: 800, letterSpacing: '0.1em', display: 'block', mb: 1 }}
        >
          MAINTENANCE WORKSTREAM
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 900, color: '#1F2366', mb: 2 }}>
          Tool Crib
        </Typography>
        <Typography variant="h6" sx={{ color: '#64748B', fontWeight: 700, mb: 3 }}>
          Under Development
        </Typography>
        <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 500, margin: '0 auto' }}>
          We are building a comprehensive tool and spare parts management system. This module will allow you to track inventory, request tools, and manage maintenance assets.
        </Typography>
      </Paper>
    </Box>
  );
}
