import React, { ReactNode } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export interface StandardDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;           // optional icon left of title
  headerChip?: ReactNode;     // optional chip/badge right of title
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  children: ReactNode;
  footer?: ReactNode;
  variant?: 'default' | 'compact' | 'analytical'; // controls content padding density
}

const paddingByVariant = {
  default: 2,      // 16px
  compact: 1.5,    // 12px
  analytical: 2.5, // 20px
};

const StandardDialog: React.FC<StandardDialogProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  headerChip,
  maxWidth = 'sm',
  fullWidth = true,
  children,
  footer,
  variant = 'default',
}) => {
  const contentPadding = paddingByVariant[variant];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      sx={{
        // Above elevated app drawers (e.g. Operations Entry at modal + 200)
        zIndex: (theme) => theme.zIndex.modal + 210,
      }}
      PaperProps={{
        sx: {
          borderRadius: '12px',
          backgroundImage: 'none',
          bgcolor: 'background.paper',
          border: '1px solid var(--paper-border-color)',
          boxShadow: 'var(--paper-shadow)',
          overflow: 'hidden',
          zIndex: (theme) => theme.zIndex.modal + 211,
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        component="div"
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          bgcolor: 'background.paper',
          borderBottom: '1px solid var(--paper-border-color)',
        }}
      >
        {icon && (
          <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            {icon}
          </Box>
        )}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'text.primary', lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {headerChip && <Box sx={{ flexShrink: 0 }}>{headerChip}</Box>}
        <IconButton
          onClick={onClose}
          size="small"
          aria-label="Close dialog"
          sx={{
            color: 'text.secondary',
            borderRadius: '8px',
            flexShrink: 0,
            '&:hover': { bgcolor: 'var(--token-brand-soft-bg)' },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Content */}
      <DialogContent
        sx={{
          p: contentPadding,
          bgcolor: 'background.default',
          overflowY: 'auto',
        }}
      >
        {children}
      </DialogContent>

      {/* Footer */}
      {footer && (
        <DialogActions
          sx={{
            p: 2,
            bgcolor: 'background.paper',
            borderTop: '1px solid var(--paper-border-color)',
            gap: 1,
          }}
        >
          {footer}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default StandardDialog;
