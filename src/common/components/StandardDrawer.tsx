import React from 'react';
import { Drawer, Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface StandardDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: number | string;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
  headerVariant?: 'branded' | 'light'; // default: 'branded'
  headerChip?: React.ReactNode;
  headerActions?: React.ReactNode;
}

const StandardDrawer: React.FC<StandardDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = 500,
  anchor = 'right',
  headerVariant = 'branded',
  headerChip,
  headerActions,
}) => {
  return (
    <Drawer
      anchor={anchor}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: width },
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          bgcolor: 'background.default',
          backgroundImage: 'none',
          boxShadow: 'var(--drawer-shadow)',
          borderLeft: '1px solid var(--paper-border-color)',
        }
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundImage: 'none',
          ...(headerVariant === 'branded'
            ? {
                bgcolor: 'var(--active-theme-primary)',
                color: 'var(--token-brand-contrast)',
              }
            : {
                bgcolor: 'background.paper',
                borderBottom: '1px solid var(--paper-border-color)',
              }),
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              lineHeight: 1.2,
              color: headerVariant === 'branded' ? 'var(--token-brand-contrast)' : 'text.primary',
            }}
          >
            {title.toUpperCase()}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              sx={{
                color:
                  headerVariant === 'branded'
                    ? 'color-mix(in srgb, var(--token-brand-contrast) 76%, transparent)'
                    : 'text.secondary',
                fontWeight: 500,
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
        {headerChip && <Box sx={{ ml: 'auto', mr: 1 }}>{headerChip}</Box>}
        {headerActions && <Box sx={{ display: 'flex', gap: 0.5 }}>{headerActions}</Box>}
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color:
              headerVariant === 'branded' ? 'var(--token-brand-contrast)' : 'text.secondary',
            borderRadius: '8px',
            '&:hover': {
              bgcolor:
                headerVariant === 'branded'
                  ? 'color-mix(in srgb, var(--token-brand-contrast) 12%, transparent)'
                  : 'var(--token-brand-soft-bg)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Content */}
      <Box sx={{ p: 4, flexGrow: 1, overflowY: 'auto' }}>
        {children}
      </Box>

      {/* Footer */}
      {footer && (
        <Box sx={{ p: 4, borderTop: '1px solid var(--paper-border-color)', mt: 'auto', bgcolor: 'background.paper' }}>
          {footer}
        </Box>
      )}
    </Drawer>
  );
};

export default StandardDrawer;
