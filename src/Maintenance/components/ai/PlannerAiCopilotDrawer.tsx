import { Close as CloseIcon } from '@mui/icons-material';
import { Box, IconButton, Typography } from '@mui/material';
import { tokenBrand, tokenCommon, tokenDivider, tokenText } from '../../../workstation/theme';
import type { ReactNode } from 'react';

type PlannerAiCopilotDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

const DRAWER_WIDTH = 420;

export function PlannerAiCopilotDrawer({
  open,
  onClose,
  title = 'BLU.AI copilot',
  subtitle,
  children,
}: PlannerAiCopilotDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 48,
        right: 0,
        bottom: 0,
        width: { xs: '100%', sm: `${DRAWER_WIDTH}px` },
        zIndex: 1400,
        display: 'flex',
        flexDirection: 'column',
        borderLeft: `1px solid ${tokenDivider}`,
        bgcolor: tokenCommon.white,
        boxShadow: '-8px 0 24px rgba(15, 23, 42, 0.08)',
      }}
    >
      <Box
        sx={{
          px: 1.6,
          py: 1.2,
          borderBottom: `1px solid ${tokenDivider}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 1,
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: tokenBrand.main, fontSize: '0.92rem', fontWeight: 800 }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography sx={{ mt: 0.35, color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <IconButton size="small" onClick={onClose} aria-label="Close copilot drawer" sx={{ color: tokenText.secondary }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.5, py: 1.2 }}>
        {children}
      </Box>
    </Box>
  );
}
