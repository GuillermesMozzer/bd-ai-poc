import {useState} from 'react';
import {ArrowBack as ArrowBackIcon} from '@mui/icons-material';
import {Box, Button, Chip, Divider, Paper, Stack, Typography} from '@mui/material';
import type {ScheduleVersion} from './types';
import ScheduleVersionsPage from './ScheduleVersionsPage';
import {ScheduleApprovalStatusBadge, ScheduleBaselineBadge, ScheduleStatusBadge} from './components/ScheduleVersionBadges';
import SchedulePlanningPage from './SchedulePlanningPage';

export default function ScheduleVersionsCombinedPage() {
  const [selectedVersion, setSelectedVersion] = useState<ScheduleVersion | null>(null);

  if (!selectedVersion) {
    return <ScheduleVersionsPage onVersionSelect={setSelectedVersion} />;
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
            {selectedVersion.scheduleVersionCode}
          </Typography>
          <Chip
            label={selectedVersion.planningCycle}
            size="small"
            sx={{fontSize: 11, height: 20, fontWeight: 600, bgcolor: 'var(--planning-neutral-bg)', color: '#4338CA'}}
          />
          <ScheduleStatusBadge status={selectedVersion.status} />
          {selectedVersion.isApprovedBaseline && <ScheduleBaselineBadge />}
          <ScheduleApprovalStatusBadge status={selectedVersion.approvalStatus} />
          {selectedVersion.changeReason && (
            <>
              <Divider orientation="vertical" flexItem sx={{mx: 0.5}} />
              <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontStyle: 'italic', maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {selectedVersion.changeReason}
              </Typography>
            </>
          )}
        </Stack>
      </Paper>

      <SchedulePlanningPage version={selectedVersion} />
    </Box>
  );
}
