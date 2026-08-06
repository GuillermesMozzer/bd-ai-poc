import {useMemo, useState} from 'react';
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  Close as CloseIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import {Box, Button, Chip, Divider, Drawer, IconButton, Paper, Stack, Typography} from '@mui/material';
import type {MpsVersion} from './types';
import MpsVersionsPage from './MpsVersionsPage';
import {mpsVersions} from './mock';
import {MpsApprovalStatusBadge, MpsBaselineBadge} from './components/MpsVersionBadges';
import MpsPlanningPage from './MpsPlanningPage';
import {forecastVersions} from '../demandForecast/mock';
import {ApprovalStatusBadge, VersionTypeBadge} from '../demandForecast/components/ForecastBadges';
import {mrpVersions} from '../mrp/mock';
import {MrpApprovalStatusBadge, MrpBaselineBadge, MrpTypeBadge} from '../mrp/components/MrpVersionBadges';

type Props = {
  initialVersionId?: string;
  onOpenDemandVersion?: (forecastVersionId: string) => void;
  onOpenMrpVersion?: (mrpVersionId: string) => void;
};

const drawerPaperSx = {
  width: {xs: '100%', sm: 500},
  bgcolor: 'var(--planning-background)',
  borderLeft: '1px solid #E3E8F2',
  boxShadow: 'var(--planning-outer-shadow)',
} as const;

const drawerCardSx = {
  borderRadius: 3,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
  p: 1.5,
} as const;

export default function MpsCombinedPage({initialVersionId, onOpenDemandVersion, onOpenMrpVersion}: Props) {
  const [selectedVersion, setSelectedVersion] = useState<MpsVersion | null>(() =>
    initialVersionId ? (mpsVersions.find((v) => v.id === initialVersionId) ?? null) : null
  );
  const [demandDrawerOpen, setDemandDrawerOpen] = useState(false);
  const [mrpDrawerOpen, setMrpDrawerOpen] = useState(false);

  const linkedDemandVersions = useMemo(() => {
    if (!selectedVersion) return [];
    const linkedIds = new Set(selectedVersion.linkedForecastVersionIds);
    return forecastVersions.filter((version) => linkedIds.has(version.id));
  }, [selectedVersion]);

  const linkedMrpVersions = useMemo(() => {
    if (!selectedVersion) return [];
    const linkedIds = new Set(selectedVersion.linkedMrpVersionIds ?? []);
    return mrpVersions.filter((version) => linkedIds.has(version.id));
  }, [selectedVersion]);

  if (!selectedVersion) {
    return <MpsVersionsPage onVersionSelect={setSelectedVersion} />;
  }

  function openDemandVersion(versionId: string) {
    setDemandDrawerOpen(false);
    onOpenDemandVersion?.(versionId);
  }

  function openMrpVersion(versionId: string) {
    setMrpDrawerOpen(false);
    onOpenMrpVersion?.(versionId);
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0, bgcolor: 'var(--planning-background)', minHeight: '100%'}}>
      {/* Version context header */}
      <Paper
        elevation={0}
        sx={{
          mx: 3,
          mt: 3,
          mb: 2,
          borderRadius: 3,
          border: '1px solid var(--planning-border)',
          bgcolor: 'var(--planning-surface)',
          boxShadow: 'var(--planning-soft-shadow)',
          px: 2.5,
          py: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap">
          <Button
            startIcon={<ArrowBackIcon sx={{fontSize: 16}} />}
            onClick={() => setSelectedVersion(null)}
            size="small"
            sx={{
              color: 'var(--planning-text-secondary)',
              fontWeight: 600,
              fontSize: 13,
              textTransform: 'none',
              px: 1.5,
              '&:hover': {bgcolor: 'var(--planning-surface-muted)'},
            }}
          >
            All versions
          </Button>
          <Divider orientation="vertical" flexItem />
          <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)', fontFamily: 'monospace'}}>
            {selectedVersion.id}
          </Typography>
          <Chip
            label={selectedVersion.planningCycle}
            size="small"
            sx={{fontSize: 11, height: 20, fontWeight: 600, bgcolor: 'var(--planning-neutral-bg)', color: '#4338CA'}}
          />
          {selectedVersion.isApprovedBaseline && <MpsBaselineBadge />}
          <MpsApprovalStatusBadge status={selectedVersion.approvalStatus} />
          {selectedVersion.changeReason && (
            <>
              <Divider orientation="vertical" flexItem sx={{mx: 0.5}} />
              <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontStyle: 'italic', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {selectedVersion.changeReason}
              </Typography>
            </>
          )}
          <Box sx={{flex: 1}} />
        </Stack>
      </Paper>

      {/* Full MPS planning view */}
      <MpsPlanningPage
        linkedDemandCount={linkedDemandVersions.length}
        linkedMrpCount={linkedMrpVersions.length}
        onOpenDemandDrawer={() => setDemandDrawerOpen(true)}
        onOpenMrpDrawer={() => setMrpDrawerOpen(true)}
      />

      <Drawer
        anchor="right"
        open={demandDrawerOpen}
        onClose={() => setDemandDrawerOpen(false)}
        PaperProps={{sx: drawerPaperSx}}
      >
        <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
          <Box sx={{p: 2, borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 900, color: '#4338CA', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                  Associated Demands
                </Typography>
                <Typography sx={{fontSize: 20, fontWeight: 900, color: 'var(--planning-text-primary)', mt: 0.5}}>
                  Forecasts for {selectedVersion.id}
                </Typography>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.5}}>
                  Open the demand versions that originated this MPS.
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setDemandDrawerOpen(false)} sx={{color: 'var(--planning-text-secondary)'}}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
          <Stack spacing={1.2} sx={{p: 2, overflowY: 'auto'}}>
            {linkedDemandVersions.map((version) => (
              <Paper key={version.id} elevation={0} sx={drawerCardSx}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                    <Typography sx={{fontSize: 13, fontWeight: 900, color: 'var(--planning-text-primary)', fontFamily: 'monospace'}}>
                      {version.id}
                    </Typography>
                    <VersionTypeBadge type={version.versionType} />
                    <ApprovalStatusBadge status={version.approvalStatus} />
                  </Stack>
                  <Typography sx={{fontSize: 13, fontWeight: 700, color: 'var(--planning-text-secondary)'}}>{version.cycleLabel}</Typography>
                  <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{version.changeReason}</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<OpenInNewIcon sx={{fontSize: 15}} />}
                    onClick={() => openDemandVersion(version.id)}
                    sx={{alignSelf: 'flex-start', textTransform: 'none', fontWeight: 800, borderRadius: 2}}
                  >
                    Go to Demand Matrix
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      </Drawer>

      <Drawer
        anchor="right"
        open={mrpDrawerOpen}
        onClose={() => setMrpDrawerOpen(false)}
        PaperProps={{sx: drawerPaperSx}}
      >
        <Box sx={{height: '100%', display: 'flex', flexDirection: 'column'}}>
          <Box sx={{p: 2, borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 900, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.08em'}}>
                  Associated MRP
                </Typography>
                <Typography sx={{fontSize: 20, fontWeight: 900, color: 'var(--planning-text-primary)', mt: 0.5}}>
                  Material plan from {selectedVersion.id}
                </Typography>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.5}}>
                  Review existing MRP versions or generate a new MRP from this MPS.
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setMrpDrawerOpen(false)} sx={{color: 'var(--planning-text-secondary)'}}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Box>
          <Stack spacing={1.2} sx={{p: 2, overflowY: 'auto', flex: 1}}>
            {linkedMrpVersions.length > 0 ? linkedMrpVersions.map((version) => (
              <Paper key={version.id} elevation={0} sx={drawerCardSx}>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                    <Typography sx={{fontSize: 13, fontWeight: 900, color: 'var(--planning-text-primary)', fontFamily: 'monospace'}}>
                      {version.id}
                    </Typography>
                    <MrpTypeBadge mrpType={version.mrpType} />
                    {version.isApprovedBaseline && <MrpBaselineBadge />}
                    <MrpApprovalStatusBadge status={version.approvalStatus} />
                  </Stack>
                  <Typography sx={{fontSize: 13, fontWeight: 700, color: 'var(--planning-text-secondary)'}}>{version.planningCycle}</Typography>
                  <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{version.changeReason}</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<OpenInNewIcon sx={{fontSize: 15}} />}
                    onClick={() => openMrpVersion(version.id)}
                    sx={{alignSelf: 'flex-start', textTransform: 'none', fontWeight: 800, borderRadius: 2}}
                  >
                    Open MRP
                  </Button>
                </Stack>
              </Paper>
            )) : (
              <Paper elevation={0} sx={{...drawerCardSx, textAlign: 'center'}}>
                <Typography sx={{fontSize: 13, fontWeight: 900, color: 'var(--planning-text-primary)'}}>No MRP linked yet.</Typography>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.5}}>
                  Create the material requirements plan directly from this MPS context.
                </Typography>
              </Paper>
            )}
          </Stack>
          <Box sx={{p: 2, borderTop: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AutoAwesomeIcon sx={{fontSize: 17}} />}
              sx={{textTransform: 'none', fontWeight: 900, borderRadius: 2.5, py: 1.2, bgcolor: '#059669', '&:hover': {bgcolor: '#047857'}}}
            >
              Create MRP from This MPS
            </Button>
          </Box>
        </Box>
      </Drawer>
    </Box>
  );
}
