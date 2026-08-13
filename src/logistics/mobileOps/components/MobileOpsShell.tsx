import React from 'react';
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import AppsIcon from '@mui/icons-material/Apps';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type MobileOpsShellProps = {
  title: string;
  operatorName: string;
  operatorRole?: string;
  navigationLabel: string;
  navigationMode?: 'library' | 'back';
  onNavigate: () => void;
  children: React.ReactNode;
};

export default function MobileOpsShell({
  title,
  operatorName,
  operatorRole,
  navigationLabel,
  navigationMode = 'library',
  onNavigate,
  children,
}: MobileOpsShellProps) {
  return (
    <Box
      data-logistics-mobile-ops-page
      sx={{
        minHeight: '100dvh',
        bgcolor: 'var(--active-theme-background-default)',
        color: 'var(--active-theme-text-primary)',
        
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <Box
        component="header"
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: 'var(--active-theme-background-paper)',
          borderBottom: '1px solid var(--paper-border-color)',
          boxShadow: 'var(--paper-shadow)',
          pt: 'env(safe-area-inset-top)',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 560,
            mx: 'auto',
            px: { xs: 1.5, sm: 2.5 },
            py: 1.25,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <IconButton
              onClick={onNavigate}
              aria-label={navigationLabel}
              title={navigationLabel}
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 2.5,
                bgcolor: 'var(--token-brand-soft-bg)',
                color: 'var(--token-brand-main)',
                border: '1px solid var(--paper-border-color)',
                '&:hover': { bgcolor: 'var(--token-brand-selected-bg)' },
              }}
            >
              {navigationMode === 'back' ? <ArrowBackIcon /> : <AppsIcon />}
            </IconButton>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                component="p"
                sx={{
                  color: 'var(--token-brand-main)',
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  lineHeight: 1.2,
                }}
              >
                Inside Logistics
              </Typography>
              <Typography
                component="h1"
                sx={{
                  color: 'var(--active-theme-text-primary)',
                  fontSize: { xs: 19, sm: 21 },
                  fontWeight: 900,
                  lineHeight: 1.2,
                  mt: 0.25,
                }}
              >
                {title}
              </Typography>
            </Box>

            {/* Wikimedia Commons: HEADSHOT.jpg, CC0 1.0 public-domain dedication. */}
            <Avatar
              src="/images/charles-gavin-avatar.jpg"
              alt="Charles Gavin"
              sx={{
                width: 36,
                height: 36,
                flexShrink: 0,
                bgcolor: 'var(--token-brand-main)',
                border: '2px solid #D7E7F5',
              }}
            />
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.8}
            sx={{
              mt: 1,
              ml: { xs: 0, sm: 7 },
              color: 'var(--active-theme-text-secondary)',
            }}
          >
            <Box
              aria-hidden="true"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'var(--token-success-main)',
                boxShadow: '0 0 0 3px rgba(22, 134, 106, 0.12)',
              }}
            />
            <Typography component="p" sx={{ color: 'var(--active-theme-text-secondary)', fontSize: 12.5, lineHeight: 1.35 }}>
              <Box component="span" sx={{ color: 'var(--active-theme-text-primary)', fontWeight: 800 }}>
                {operatorName}
              </Box>
              {operatorRole ? (
                <Box component="span" sx={{ color: 'var(--active-theme-text-secondary)', fontWeight: 600 }}>
                  {' - '}{operatorRole}
                </Box>
              ) : null}
              <Box component="span" sx={{ color: 'var(--active-theme-text-secondary)', fontWeight: 700 }}>
                {' · Active session'}
              </Box>
            </Typography>
          </Stack>
        </Box>
      </Box>

      <Box
        component="main"
        sx={{
          width: '100%',
          maxWidth: 560,
          mx: 'auto',
          px: { xs: 2, sm: 3 },
          pt: { xs: 2.5, sm: 3.5 },
          pb: 'calc(24px + env(safe-area-inset-bottom))',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
