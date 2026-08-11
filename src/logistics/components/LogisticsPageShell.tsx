import React from 'react';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { LOGISTICS_ACCENT } from '../constants';
import { fmtTime } from '../utils';
import { lx } from '../themeTokens';
import { focusVisibleSx, touchTargetSx } from '../a11y';
import { logisticsType } from '../typography';
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
        p: { xs: 1.5, md: 2 },
      }}
    >
      {backToControlTower ? (
        <Box sx={{ px: 0.5, mb: 0.75 }}>
          <Button
            size="small"
            startIcon={<ArrowBackIcon aria-hidden sx={{ fontSize: 16 }} />}
            onClick={handleBack}
            aria-label={`Back to ${backLabel}`}
            sx={{
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.8125rem',
              color: LOGISTICS_ACCENT,
              px: 0.5,
              minWidth: 0,
              minHeight: 36,
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
        spacing={1}
        sx={{ mb: 1.75, px: 0.5 }}
      >
        <Box>
          <Typography component="p" variant="overline" sx={{ ...logisticsType.overline, color: LOGISTICS_ACCENT }}>
            LOGISTICS
          </Typography>
          <Typography
            component="h1"
            tabIndex={-1}
            sx={{ ...logisticsType.pageTitle, color: lx.text }}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography sx={{ ...logisticsType.pageSubtitle, color: lx.textMuted, mt: 0.35, maxWidth: 720 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
          {asOf ? (
            <Typography sx={{ ...logisticsType.caption, color: lx.textMuted }}>
              As of {fmtTime(asOf)}
            </Typography>
          ) : null}
          {toolbar}
        </Stack>
      </Stack>

      {banner ? <Box sx={{ mb: 1.5 }}>{banner}</Box> : null}

      {children}
    </Box>
  );
}
