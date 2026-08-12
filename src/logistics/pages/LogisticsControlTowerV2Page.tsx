import React, { useState } from 'react';
import { Alert, Box, Button, Grid, Snackbar, Typography } from '@mui/material';
import { PrioritizedDecisionQueue } from '../widgets/PrioritizedDecisionQueue';
import { SpaceXShippingGatingConsole } from '../widgets/SpaceXShippingGatingConsole';
import { SterilizationLoadsTimelineWidget } from '../widgets/SterilizationLoadsTimelineWidget';
import { InboundSlaChartWidget } from '../widgets/InboundSlaChartWidget';
import { AtlasAiPrescriptivePanel } from '../widgets/AtlasAiPrescriptivePanel';
import { resetLogisticsDemoData } from '../data/reactiveLogisticsDemo';
import { ct } from '../cockpit/cockpitTheme';

/**
 * Logistics Control Tower V2 — Active Decision System (CoreSight dark cockpit).
 * Parallel to classic LogisticsControlTowerPage (macroflow carousel L1).
 */
export default function LogisticsControlTowerV2Page() {
  const [toast, setToast] = useState<string | null>(null);

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
        bgcolor: ct.bg,
        height: '100%',
        minHeight: 0,
        color: ct.text,
        overflow: 'hidden',
        p: { xs: 1.5, md: 2 },
        display: 'flex',
        flexDirection: 'column',
        fontFamily: ct.font,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          pb: 1.5,
          borderBottom: `1px solid ${ct.border}`,
          gap: 2,
          flexShrink: 0,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, flexWrap: 'wrap', minWidth: 0 }}>
          <Typography
            component="h1"
            sx={{
              color: ct.accent,
              fontWeight: 700,
              fontFamily: ct.font,
              letterSpacing: '0.1em',
              fontSize: { xs: 16, md: 18 },
            }}
          >
            BD LOGISTICS CT
          </Typography>
          <Typography sx={{ color: ct.textDim, fontFamily: ct.mono, fontSize: 11 }}>
            EL PASO Site Command Center · L1 DECISION COCKPIT · V2
          </Typography>
        </Box>
        <Button
          variant="outlined"
          onClick={handleGlobalReset}
          sx={{
            height: 28,
            fontSize: 11,
            borderColor: ct.danger,
            color: ct.danger,
            fontFamily: ct.mono,
            textTransform: 'none',
            flexShrink: 0,
            '&:hover': { bgcolor: ct.dangerSoft, borderColor: ct.danger },
          }}
        >
          RESET DEMO DATA
        </Button>
      </Box>

      <Grid
        container
        spacing={2}
        sx={{
          flexGrow: 1,
          minHeight: 0,
          height: { md: 'calc(100% - 56px)' },
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
          sx={{ fontFamily: ct.mono, bgcolor: ct.ok, color: '#fff' }}
        >
          {toast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
