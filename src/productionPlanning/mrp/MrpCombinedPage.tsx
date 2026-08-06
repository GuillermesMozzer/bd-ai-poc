import {useState} from 'react';
import {ArrowBack as ArrowBackIcon} from '@mui/icons-material';
import {Box, Button, Chip, Divider, Paper, Stack, Typography} from '@mui/material';
import type {MrpVersion} from './types';
import MrpVersionsPage from './MrpVersionsPage';
import {mrpVersions} from './mock';
import {MrpApprovalStatusBadge, MrpBaselineBadge, MrpTypeBadge} from './components/MrpVersionBadges';
import MrpPlanningPage from './MrpPlanningPage';

type Props = {initialVersionId?: string};

export default function MrpCombinedPage({initialVersionId}: Props) {
  const [selectedVersion, setSelectedVersion] = useState<MrpVersion | null>(() =>
    initialVersionId ? (mrpVersions.find((v) => v.id === initialVersionId) ?? mrpVersions[0] ?? null) : null
  );

  if (!selectedVersion) {
    return <MrpVersionsPage onVersionSelect={setSelectedVersion} />;
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 0, bgcolor: '#F5F8FC', minHeight: '100%'}}>
      <Paper
        elevation={0}
        sx={{
          mx: {xs: 1.5, md: 2},
          mt: {xs: 1.5, md: 2},
          mb: 0,
          borderRadius: 2,
          border: '1px solid #D7E2F0',
          bgcolor: 'var(--planning-surface)',
          boxShadow: '0 10px 26px rgba(15, 35, 86, 0.06)',
          px: 1.4,
          py: 0.95,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.2} flexWrap="wrap">
          <Button
            startIcon={<ArrowBackIcon sx={{fontSize: 16}} />}
            onClick={() => setSelectedVersion(null)}
            size="small"
            sx={{
              color: '#071B5F',
              fontWeight: 900,
              fontSize: 12,
              textTransform: 'none',
              px: 1.1,
              height: 30,
              borderRadius: 1.4,
              border: '1px solid #D7E2F0',
              '&:hover': {bgcolor: '#F7FAFF'},
            }}
          >
            All Versions
          </Button>
          <Divider orientation="vertical" flexItem sx={{borderColor: '#D7E2F0'}} />
          <Typography sx={{fontSize: 12, fontWeight: 950, color: '#071B5F', fontFamily: 'monospace'}}>
            {selectedVersion.id}
          </Typography>
          <Chip
            label={selectedVersion.planningCycle}
            size="small"
            sx={{fontSize: 10.5, height: 20, fontWeight: 850, bgcolor: '#EEF5FF', color: '#0B5CFF', border: '1px solid #CFE0FF'}}
          />
          <MrpTypeBadge mrpType={selectedVersion.mrpType} />
          {selectedVersion.isApprovedBaseline && <MrpBaselineBadge />}
          <MrpApprovalStatusBadge status={selectedVersion.approvalStatus} />
          <Divider orientation="vertical" flexItem sx={{mx: 0.2, borderColor: '#D7E2F0'}} />
          <Typography sx={{fontSize: 11, color: '#405783', fontFamily: 'monospace', fontWeight: 850}}>
            Parent MPS: {selectedVersion.parentMpsVersionId}
          </Typography>
          {selectedVersion.changeReason ? (
            <>
              <Divider orientation="vertical" flexItem sx={{mx: 0.2, borderColor: '#D7E2F0'}} />
              <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', maxWidth: 440, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
                {selectedVersion.changeReason}
              </Typography>
            </>
          ) : null}
        </Stack>
      </Paper>

      <Box sx={{pb: 2}}>
        <MrpPlanningPage version={selectedVersion} />
      </Box>
    </Box>
  );
}
