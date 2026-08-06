import React from 'react';
import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { LOGISTICS_ACCENT } from '../constants';
import { lx } from '../themeTokens';

type LogisticsDrawerProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  width?: number;
  children: React.ReactNode;
};

export default function LogisticsDrawer({
  open,
  onClose,
  title,
  subtitle,
  width = 440,
  children,
}: LogisticsDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: width },
          p: 0,
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderLeft: `1px solid ${lx.border}`,
        },
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2,
          borderBottom: `1px solid ${lx.divider}`,
          position: 'sticky',
          top: 0,
          bgcolor: 'background.paper',
          zIndex: 1,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: lx.text, lineHeight: 1.3 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography variant="caption" sx={{ color: lx.textMuted, fontWeight: 600 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          <IconButton onClick={onClose} size="small" aria-label="Close details" sx={{ color: lx.textMuted }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Box>
      <Box sx={{ px: 2.5, py: 2.5, color: lx.text, '& section + section': { mt: 2.5 } }}>{children}</Box>
      <Box sx={{ height: 24 }} />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 4,
          height: '100%',
          bgcolor: LOGISTICS_ACCENT,
        }}
      />
    </Drawer>
  );
}

export function DrawerSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="section">
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 800,
          color: lx.text,
          mb: 1.2,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export function DetailList({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        gap: 1,
        '& dt': { color: lx.textMuted, fontSize: 12, fontWeight: 700, m: 0 },
        '& dd': { color: lx.text, fontSize: 13, fontWeight: 600, m: 0 },
      }}
      component="dl"
    >
      {items.map((item) => (
        <React.Fragment key={item.label}>
          <Box component="dt">{item.label}</Box>
          <Box component="dd">{item.value}</Box>
        </React.Fragment>
      ))}
    </Box>
  );
}
