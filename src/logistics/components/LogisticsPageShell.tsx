import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LOGISTICS_ACCENT } from '../constants';
import { fmtTime } from '../utils';
import { lx } from '../themeTokens';
import { focusVisibleSx, touchTargetSx } from '../a11y';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';

type LogisticsPageShellProps = {
  title: string;
  subtitle?: string;
  asOf?: string;
  banner?: React.ReactNode;
  toolbar?: React.ReactNode;
  /** When true (default), shows a back control to the main Logistics Control Tower. */
  backToControlTower?: boolean;
  /** Override label for the back control. */
  backLabel?: string;
  /** Custom back handler (e.g. embedded L2 layers). Falls back to Logistics CT screen. */
  onBack?: () => void;
  children: React.ReactNode;
};

export default function LogisticsPageShell({
  title,
  subtitle,
  asOf,
  banner,
  toolbar,
  backToControlTower = true,
  backLabel = 'Logistics Control Tower',
  onBack,
  children,
}: LogisticsPageShellProps) {
  const { setCurrentScreen } = useWorkstationContext();

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    setCurrentScreen('logistics_control_tower');
  };

  return (
    <Box
      component="main"
      aria-label={title}
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        bgcolor: 'background.default',
        color: 'text.primary',
        p: { xs: 2, md: 3 },
      }}
    >
      {backToControlTower ? (
        <Box sx={{ px: 0.5, mb: 1 }}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon aria-hidden />}
            onClick={handleBack}
            aria-label={`Back to ${backLabel}`}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              color: LOGISTICS_ACCENT,
              px: 0.5,
              minWidth: 0,
              ...touchTargetSx,
              ...focusVisibleSx,
              '&:hover': { bgcolor: lx.accentSoft },
            }}
          >
            {backLabel}
          </Button>
        </Box>
      ) : null}

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={1.5}
        sx={{ mb: 2.2, px: 0.5 }}
      >
        <Box>
          <Typography
            component="p"
            variant="overline"
            sx={{ color: LOGISTICS_ACCENT, fontWeight: 800, letterSpacing: '0.08em' }}
          >
            LOGISTICS
          </Typography>
          <Typography
            component="h1"
            variant="h5"
            tabIndex={-1}
            sx={{ color: lx.text, fontWeight: 800, lineHeight: 1.3 }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ color: lx.textMuted, mt: 0.4, maxWidth: 720 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          {asOf ? (
            <Typography variant="caption" sx={{ color: lx.textMuted, fontWeight: 600 }}>
              As of {fmtTime(asOf)}
            </Typography>
          ) : null}
          {toolbar}
        </Stack>
      </Stack>

      {banner ? <Box sx={{ mb: 2 }}>{banner}</Box> : null}

      {children}
    </Box>
  );
}
