import {
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import type {ScheduleItem, ScheduleVersion} from './types';
import {scheduleItems} from './mock';
import {ScheduleApprovalStatusBadge, ScheduleBaselineBadge, ScheduleStatusBadge} from './components/ScheduleVersionBadges';

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
};

const headCellSx = {
  fontSize: 11,
  fontWeight: 800,
  color: 'var(--planning-text-secondary)',
  bgcolor: 'var(--planning-surface-muted)',
  borderBottom: '1px solid var(--planning-border)',
  py: 1.2,
  px: 1.5,
  whiteSpace: 'nowrap',
};

const bodyCellSx = {
  fontSize: 12,
  color: 'var(--planning-text-secondary)',
  py: 1,
  px: 1.5,
  borderBottom: '1px solid var(--planning-border)',
  verticalAlign: 'middle',
};

function formatTs(ts: string) {
  return new Date(ts).toLocaleString('en-GB', {dateStyle: 'short', timeStyle: 'short'});
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-GB', {dateStyle: 'short'});
}

function ReadinessChip({status}: {status: ScheduleItem['readinessStatus']}) {
  const colors =
    status === 'Ready'   ? {bg: '#ECFDF3', color: '#027A48'} :
    status === 'AtRisk'  ? {bg: '#FFF7ED', color: '#B54708'} :
                           {bg: '#FEF2F2', color: '#B42318'};
  return (
    <Chip label={status} size="small" sx={{height: 20, fontSize: 11, fontWeight: 700, bgcolor: colors.bg, color: colors.color, borderRadius: 1}} />
  );
}

function MaterialChip({status}: {status: ScheduleItem['materialStatus']}) {
  const colors =
    status === 'Available' ? {bg: '#ECFDF3', color: '#027A48'} :
    status === 'Partial'   ? {bg: '#FFF7ED', color: '#B54708'} :
                             {bg: '#FEF2F2', color: '#B42318'};
  return (
    <Chip label={status} size="small" sx={{height: 20, fontSize: 11, fontWeight: 700, bgcolor: colors.bg, color: colors.color, borderRadius: 1}} />
  );
}

function ValidationIcon({status}: {status: ScheduleVersion['validationStatus']}) {
  if (status === 'Valid') return <CheckCircleIcon sx={{fontSize: 16, color: '#027A48'}} />;
  if (status === 'Warning') return <WarningIcon sx={{fontSize: 16, color: '#B54708'}} />;
  if (status === 'Blocked') return <WarningIcon sx={{fontSize: 16, color: '#B42318'}} />;
  return <InfoIcon sx={{fontSize: 16, color: 'var(--planning-text-muted)'}} />;
}

interface SchedulePlanningPageProps {
  version: ScheduleVersion;
}

export default function SchedulePlanningPage({version}: SchedulePlanningPageProps) {
  const versionItems = scheduleItems.filter((item) => item.scheduleVersionId === version.id);
  const isDraft = !version.isReadOnly;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, bgcolor: 'var(--planning-background)', p: 3, minHeight: '100%'}}>

      {/* Read-only banner */}
      {version.isReadOnly && (
        <Alert
          icon={<LockIcon sx={{fontSize: 18}} />}
          severity="info"
          sx={{borderRadius: 3, fontSize: 13, fontWeight: 600}}
        >
          This schedule version is <strong>{version.status}</strong> and cannot be modified.
          To make changes, create a new schedule version referencing the same MPS and MRP sources.
        </Alert>
      )}

      {/* Version header */}
      <Paper elevation={0} sx={{...moduleCardSx, p: 2.5}}>
        <Stack direction="row" alignItems="flex-start" gap={2} flexWrap="wrap">
          <Box sx={{flex: 1, minWidth: 0}}>
            <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap" mb={1}>
              <Typography sx={{fontSize: 20, fontWeight: 900, color: 'var(--planning-text-primary)', fontFamily: 'monospace'}}>
                {version.scheduleVersionCode}
              </Typography>
              <ScheduleStatusBadge status={version.status} />
              <ScheduleApprovalStatusBadge status={version.approvalStatus} />
              {version.isApprovedBaseline && <ScheduleBaselineBadge />}
              <Stack direction="row" alignItems="center" gap={0.5}>
                <ValidationIcon status={version.validationStatus} />
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 600}}>{version.validationStatus}</Typography>
              </Stack>
            </Stack>
            <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)'}}>
              {version.planningCycle} · {formatDate(version.planningPeriodStart)} – {formatDate(version.planningPeriodEnd)}
            </Typography>
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.5, fontStyle: 'italic'}}>
              {version.changeReason}
            </Typography>
          </Box>
          {isDraft && (
            <Stack direction="row" gap={1}>
              <Button
                variant="outlined"
                size="small"
                sx={{textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: 13}}
              >
                Validate
              </Button>
              <Button
                variant="contained"
                size="small"
                sx={{textTransform: 'none', fontWeight: 700, borderRadius: 2, fontSize: 13, bgcolor: '#4338CA', '&:hover': {bgcolor: '#3730A3'}}}
              >
                Publish
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>

      {/* Traceability panel */}
      <Paper elevation={0} sx={{...moduleCardSx, p: 2.5}}>
        <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em'}}>
          Traceability
        </Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(3, 1fr)'}, gap: 2}}>
          <Box>
            <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8}}>
              Linked MPS Version
            </Typography>
            <Tooltip title="Approved MPS version used as the production plan source for this schedule" placement="top">
              <Chip
                label={version.linkedMpsVersionId}
                size="small"
                sx={{fontSize: 12, height: 24, fontWeight: 700, bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', border: '1px solid #C7D2FE', fontFamily: 'monospace', cursor: 'default'}}
              />
            </Tooltip>
          </Box>
          <Box>
            <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8}}>
              Linked MRP Snapshot
            </Typography>
            <Tooltip title="Official MRP snapshot used as the material availability source for this schedule" placement="top">
              <Chip
                label={version.linkedMrpSnapshotId}
                size="small"
                sx={{fontSize: 12, height: 24, fontWeight: 700, bgcolor: '#F0FDF4', color: '#027A48', border: '1px solid #ABEFC6', fontFamily: 'monospace', cursor: 'default'}}
              />
            </Tooltip>
          </Box>
          {version.previousScheduleVersionId && (
            <Box>
              <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8}}>
                Previous Version
              </Typography>
              <Chip
                label={version.previousScheduleVersionId}
                size="small"
                sx={{fontSize: 12, height: 24, fontWeight: 700, bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', border: '1px solid var(--planning-border)', fontFamily: 'monospace', cursor: 'default'}}
              />
            </Box>
          )}
        </Box>
      </Paper>

      {/* Schedule items table */}
      <Paper elevation={0} sx={{...moduleCardSx, overflow: 'hidden'}}>
        <Box sx={{px: 2.5, py: 1.5, borderBottom: '1px solid var(--planning-border)'}}>
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography sx={{fontSize: 14, fontWeight: 800, color: 'var(--planning-text-primary)'}}>
              Schedule Items
            </Typography>
            <Chip
              label={`${versionItems.length} item${versionItems.length !== 1 ? 's' : ''}`}
              size="small"
              sx={{height: 20, fontSize: 11, bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', fontWeight: 700}}
            />
          </Stack>
        </Box>
        {versionItems.length === 0 ? (
          <Box sx={{p: 4, textAlign: 'center'}}>
            <Typography sx={{color: 'var(--planning-text-muted)', fontSize: 14}}>No schedule items for this version.</Typography>
          </Box>
        ) : (
          <TableContainer sx={{maxHeight: 'calc(100vh - 520px)', overflow: 'auto'}}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={headCellSx}>#</TableCell>
                  <TableCell sx={headCellSx}>Item Code</TableCell>
                  <TableCell sx={headCellSx}>Line</TableCell>
                  <TableCell sx={headCellSx}>Machine</TableCell>
                  <TableCell sx={headCellSx}>Scheduled Start</TableCell>
                  <TableCell sx={headCellSx}>Scheduled End</TableCell>
                  <TableCell sx={headCellSx}>Qty</TableCell>
                  <TableCell sx={headCellSx}>Readiness</TableCell>
                  <TableCell sx={headCellSx}>Material</TableCell>
                  <TableCell sx={headCellSx}>Work Order</TableCell>
                  <TableCell sx={headCellSx}>MPS Line</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {versionItems
                  .sort((a, b) => a.line.localeCompare(b.line) || a.sequence - b.sequence)
                  .map((item) => (
                    <TableRow key={item.id} sx={{'&:hover': {bgcolor: 'var(--planning-surface-muted)'}}}>
                      <TableCell sx={{...bodyCellSx, fontWeight: 700, color: 'var(--planning-text-muted)'}}>{item.sequence}</TableCell>
                      <TableCell sx={bodyCellSx}>
                        <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-primary)', fontFamily: 'monospace'}}>
                          {item.itemCode}
                        </Typography>
                        <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', fontFamily: 'monospace'}}>{item.materialId}</Typography>
                      </TableCell>
                      <TableCell sx={bodyCellSx}>{item.line}</TableCell>
                      <TableCell sx={bodyCellSx}>{item.machine}</TableCell>
                      <TableCell sx={{...bodyCellSx, whiteSpace: 'nowrap'}}>{formatTs(item.scheduledStart)}</TableCell>
                      <TableCell sx={{...bodyCellSx, whiteSpace: 'nowrap'}}>{formatTs(item.scheduledEnd)}</TableCell>
                      <TableCell sx={{...bodyCellSx, fontWeight: 700}}>{item.plannedQuantity.toLocaleString()}</TableCell>
                      <TableCell sx={bodyCellSx}><ReadinessChip status={item.readinessStatus} /></TableCell>
                      <TableCell sx={bodyCellSx}><MaterialChip status={item.materialStatus} /></TableCell>
                      <TableCell sx={bodyCellSx}>
                        {item.workOrderId
                          ? <Chip label={item.workOrderId} size="small" sx={{fontSize: 11, height: 20, bgcolor: 'var(--planning-ai-accent-bg)', color: '#6D28D9', fontWeight: 600}} />
                          : <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>—</Typography>
                        }
                      </TableCell>
                      <TableCell sx={bodyCellSx}>
                        <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', fontFamily: 'monospace'}}>{item.mpsLineId}</Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Metadata footer */}
      <Paper elevation={0} sx={{...moduleCardSx, p: 2.5}}>
        <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.06em'}}>
          Version Metadata
        </Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)'}, gap: 2}}>
          <Box>
            <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5}}>Created By</Typography>
            <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 600}}>{version.createdBy}</Typography>
            <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)'}}>{formatTs(version.createdAt)}</Typography>
          </Box>
          {version.publishedBy && version.publishedAt && (
            <Box>
              <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5}}>Published By</Typography>
              <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 600}}>{version.publishedBy}</Typography>
              <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)'}}>{formatTs(version.publishedAt)}</Typography>
            </Box>
          )}
          {version.frozenAt && (
            <Box>
              <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5}}>Frozen At</Typography>
              <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 600}}>{formatTs(version.frozenAt)}</Typography>
            </Box>
          )}
          {version.approvedBy && (
            <Box>
              <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5}}>Approved By</Typography>
              <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 600}}>{version.approvedBy}</Typography>
              {version.approvedAt && <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)'}}>{formatTs(version.approvedAt)}</Typography>}
            </Box>
          )}
        </Box>
        {version.notes && (
          <>
            <Divider sx={{my: 1.5}} />
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontStyle: 'italic'}}>{version.notes}</Typography>
          </>
        )}
      </Paper>

    </Box>
  );
}
