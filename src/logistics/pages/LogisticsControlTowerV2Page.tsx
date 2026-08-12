import React, { useState } from 'react';
import { Alert, Box, Button, Grid, Paper, Snackbar, Typography } from '@mui/material';
import BdLogo from '../../common/components/BdLogo';
import { useThemeMode } from '../../common/contexts/ThemeModeContext';
import { PrioritizedDecisionQueue } from '../widgets/PrioritizedDecisionQueue';
import { SpaceXShippingGatingConsole } from '../widgets/SpaceXShippingGatingConsole';
import { SterilizationLoadsTimelineWidget } from '../widgets/SterilizationLoadsTimelineWidget';
import { InboundSlaChartWidget } from '../widgets/InboundSlaChartWidget';
import { AtlasAiPrescriptivePanel } from '../widgets/AtlasAiPrescriptivePanel';
import { resetLogisticsDemoData } from '../data/reactiveLogisticsDemo';
import {
  ctV2Type,
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenSuccess,
  tokenText,
  workstationVisuals,
} from '../ctV2Theme';

/**
 * Logistics Control Tower V2 — Active Decision System.
 * Operator View / Atlas AI aesthetic; follows app light/dark theme.
 */
export default function LogisticsControlTowerV2Page() {
  const { themeMode } = useThemeMode();
  const [toast, setToast] = useState<string | null>(null);
  const logoSurface = themeMode === 'dark' ? 'onDark' : 'onLight';

  const handleGlobalReset = () => {
    const confirmed = window.confirm(
      'Reset Demo Data?\n\nThis clears Inside Logistics demo localStorage and reloads the Happy Path seed. It does not clear edition or auth.',
    );
    if (!confirmed) return;
    resetLogisticsDemoData();
  };

  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        backgroundImage: workstationVisuals.pageBackground,
        height: '100%',
        minHeight: 0,
        color: tokenText.primary,
        overflow: { xs: 'auto', md: 'hidden' },
        p: { xs: 1.5, md: 2 },
        display: 'flex',
        flexDirection: 'column',
        fontFamily: workstationVisuals.fontFamily,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          p: { xs: 1.4, md: 1.75 },
          gap: 2,
          flexShrink: 0,
          borderRadius: 2.2,
          bgcolor: 'background.paper',
          border: workstationVisuals.shellBorder,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', minWidth: 0 }}>
          <BdLogo surface={logoSurface} height={28} alt="BD" />
          <Box sx={{ minWidth: 0 }}>
            <Typography component="p" sx={{ ...ctV2Type.eyebrow, color: tokenBrand.dark }}>
              Logistics · Decision Cockpit
            </Typography>
            <Typography component="h1" sx={{ ...ctV2Type.pageTitle, color: workstationVisuals.tierTextHeading, mt: 0.35 }}>
              Logistics Control Tower V2
            </Typography>
            <Typography sx={{ ...ctV2Type.pageSubtitle, color: tokenText.secondary, mt: 0.35 }}>
              El Paso site command center · prioritized decisions, gating, custody, and ATLAS.AI
            </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          onClick={handleGlobalReset}
          sx={{
            height: 36,
            fontSize: 12,
            fontWeight: 800,
            borderRadius: 999,
            borderColor: tokenError.light,
            color: tokenError.dark,
            fontFamily: workstationVisuals.fontFamily,
            textTransform: 'none',
            flexShrink: 0,
            px: 1.8,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: tokenError.softBg, borderColor: tokenError.main },
          }}
        >
          Reset Demo Data
        </Button>
      </Paper>

      <Grid
        container
        spacing={2}
        sx={{
          flexGrow: 1,
          minHeight: 0,
          height: { md: 'calc(100% - 104px)' },
          alignContent: 'stretch',
        }}
      >
        <Grid size={{ xs: 12, md: 4 }} sx={{ height: { xs: 'auto', md: '100%' }, minHeight: { xs: 420, md: 0 } }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <PrioritizedDecisionQueue onResolved={setToast} />
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <AtlasAiPrescriptivePanel onToast={setToast} />
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ height: { xs: 'auto', md: '100%' }, minHeight: { xs: 420, md: 0 } }}>
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
            <Box sx={{ flex: 1.2, minHeight: 0 }}>
              <SpaceXShippingGatingConsole onToast={setToast} />
            </Box>
            <Box sx={{ flex: 0.8, minHeight: 0 }}>
              <InboundSlaChartWidget />
            </Box>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }} sx={{ height: { xs: 'auto', md: '100%' }, minHeight: { xs: 360, md: 0 } }}>
          <SterilizationLoadsTimelineWidget />
        </Grid>
      </Grid>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity="success"
          variant="filled"
          sx={{
            fontFamily: workstationVisuals.fontFamily,
            fontWeight: 700,
            bgcolor: tokenSuccess.main,
            color: tokenCommon.white,
          }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
