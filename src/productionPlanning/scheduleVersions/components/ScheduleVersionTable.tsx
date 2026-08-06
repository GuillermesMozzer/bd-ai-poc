import {
  ArrowForward as ArrowForwardIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
} from '@mui/icons-material';
import {
  Box,
  Chip,
  Collapse,
  IconButton,
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
import type {ScheduleApprovalStatus, ScheduleVersion, ScheduleVersionCycleGroup} from '../types';
import {ScheduleApprovalStatusBadge, ScheduleBaselineBadge, ScheduleStatusBadge} from './ScheduleVersionBadges';

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

const APPROVAL_STATUS_ORDER: ScheduleApprovalStatus[] = ['Approved', 'Pending Approval', 'Rejected', 'Draft'];
const APPROVAL_STATUS_COLORS: Record<ScheduleApprovalStatus, string> = {
  Approved: '#027A48',
  'Pending Approval': '#B54708',
  Rejected: '#B42318',
  Draft: '#1D4ED8',
};

function formatTs(ts: string) {
  return new Date(ts).toLocaleString('en-GB', {dateStyle: 'short', timeStyle: 'short'});
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('en-GB', {dateStyle: 'short'});
}

function formatPeriod(start: string, end: string) {
  return `${formatDate(start)} – ${formatDate(end)}`;
}

function ValidationChip({status}: {status: ScheduleVersion['validationStatus']}) {
  const colors =
    status === 'Valid'          ? {bg: '#ECFDF3', color: '#027A48'} :
    status === 'Warning'        ? {bg: '#FFF7ED', color: '#B54708'} :
    status === 'Blocked'        ? {bg: '#FEF2F2', color: '#B42318'} :
                                  {bg: '#F8FAFC', color: 'var(--planning-text-secondary)'};
  return (
    <Chip
      label={status}
      size="small"
      sx={{height: 20, fontSize: 11, fontWeight: 700, bgcolor: colors.bg, color: colors.color, borderRadius: 1}}
    />
  );
}

function CycleGroupHeader({
  group,
  expanded,
  hasActionCol,
  onToggle,
}: {
  group: ScheduleVersionCycleGroup;
  expanded: boolean;
  hasActionCol?: boolean;
  onToggle: () => void;
}) {
  const counts = APPROVAL_STATUS_ORDER.reduce<Partial<Record<ScheduleApprovalStatus, number>>>((acc, s) => {
    const n = group.versions.filter((v) => v.approvalStatus === s).length;
    if (n > 0) acc[s] = n;
    return acc;
  }, {});

  return (
    <TableRow
      onClick={onToggle}
      sx={{
        bgcolor: 'var(--planning-neutral-bg)',
        cursor: 'pointer',
        '&:hover': {bgcolor: '#E8EEFF'},
        transition: 'background-color 0.1s',
        borderTop: '2px solid #C7D2FE',
        borderBottom: expanded ? 'none' : '2px solid #C7D2FE',
      }}
    >
      <TableCell sx={{py: 1, px: 0.5, width: 36, border: 0}}>
        <IconButton size="small" sx={{color: '#4338CA'}}>
          {expanded ? <KeyboardArrowDownIcon sx={{fontSize: 18}} /> : <KeyboardArrowRightIcon sx={{fontSize: 18}} />}
        </IconButton>
      </TableCell>
      <TableCell colSpan={hasActionCol ? 10 : 9} sx={{py: 1, px: 1, border: 0}}>
        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
          <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>
            {group.cycleLabel}
          </Typography>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 500}}>
            {group.versions.length} version{group.versions.length !== 1 ? 's' : ''}
          </Typography>
          <Box sx={{ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap'}}>
            {(Object.entries(counts) as [ScheduleApprovalStatus, number][]).map(([status, count]) => (
              <Stack key={status} direction="row" alignItems="center" gap={0.4}>
                <Box sx={{width: 7, height: 7, borderRadius: '50%', bgcolor: APPROVAL_STATUS_COLORS[status]}} />
                <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 600}}>
                  {count} {status}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function ScheduleVersionRow({
  v,
  isExpanded,
  onRowClick,
  onToggleExpand,
}: {
  v: ScheduleVersion;
  isExpanded: boolean;
  onRowClick?: (v: ScheduleVersion) => void;
  onToggleExpand: () => void;
}) {
  return (
    <>
      <TableRow
        onClick={() => onRowClick?.(v)}
        sx={{
          bgcolor: 'inherit',
          cursor: onRowClick ? 'pointer' : 'default',
          '&:hover': {bgcolor: '#F0F7FF'},
          transition: 'background-color 0.1s',
        }}
      >
        <TableCell
          sx={{...bodyCellSx, px: 0.5, width: 36}}
          onClick={(e) => {e.stopPropagation(); onToggleExpand();}}
        >
          <IconButton size="small" sx={{color: 'var(--planning-text-muted)'}}>
            {isExpanded ? <ExpandMoreIcon sx={{fontSize: 16}} /> : <ChevronRightIcon sx={{fontSize: 16}} />}
          </IconButton>
        </TableCell>
        <TableCell sx={bodyCellSx}>
          <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-primary)', fontFamily: 'monospace'}}>
            {v.scheduleVersionCode}
          </Typography>
          <Typography sx={{fontSize: 11, color: 'var(--planning-text-muted)', fontFamily: 'monospace'}}>
            {v.id}
          </Typography>
        </TableCell>
        <TableCell sx={bodyCellSx}>
          <Stack direction="row" gap={0.5} flexWrap="wrap">
            <ScheduleStatusBadge status={v.status} />
            {v.isApprovedBaseline && <ScheduleBaselineBadge />}
          </Stack>
        </TableCell>
        <TableCell sx={bodyCellSx}>
          <ScheduleApprovalStatusBadge status={v.approvalStatus} />
        </TableCell>
        <TableCell sx={bodyCellSx}>
          <ValidationChip status={v.validationStatus} />
        </TableCell>
        <TableCell sx={{...bodyCellSx, whiteSpace: 'nowrap'}}>
          {formatPeriod(v.planningPeriodStart, v.planningPeriodEnd)}
        </TableCell>
        <TableCell sx={{...bodyCellSx, maxWidth: 160}}>
          <Tooltip title={v.linkedMpsVersionId} placement="top">
            <Chip
              label={v.linkedMpsVersionId}
              size="small"
              sx={{fontSize: 11, height: 20, bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', fontWeight: 600, border: '1px solid #C7D2FE', maxWidth: 150}}
            />
          </Tooltip>
        </TableCell>
        <TableCell sx={{...bodyCellSx, maxWidth: 160}}>
          <Tooltip title={v.linkedMrpSnapshotId} placement="top">
            <Chip
              label={v.linkedMrpSnapshotId}
              size="small"
              sx={{fontSize: 11, height: 20, bgcolor: '#F0FDF4', color: '#027A48', fontWeight: 600, border: '1px solid #ABEFC6', maxWidth: 150}}
            />
          </Tooltip>
        </TableCell>
        <TableCell sx={bodyCellSx}>{v.createdBy}</TableCell>
        <TableCell sx={{...bodyCellSx, whiteSpace: 'nowrap'}}>{formatTs(v.createdAt)}</TableCell>
        {onRowClick && (
          <TableCell sx={{...bodyCellSx, width: 36, px: 0.5, textAlign: 'center'}}>
            <ArrowForwardIcon sx={{fontSize: 15, color: 'var(--planning-text-muted)'}} />
          </TableCell>
        )}
      </TableRow>
      <TableRow key={`${v.id}-expand`}>
        <TableCell colSpan={onRowClick ? 11 : 10} sx={{p: 0, border: 0}}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{bgcolor: 'var(--planning-surface-muted)', borderTop: '1px solid var(--planning-border)', borderBottom: '1px solid var(--planning-border)', px: 3, py: 2}}>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 2}}>
                <Box>
                  <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1}}>
                    Impacted Work Orders
                  </Typography>
                  {v.impactedWOs.length > 0 ? (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {v.impactedWOs.map((wo) => (
                        <Chip key={wo} label={wo} size="small" sx={{fontSize: 11, height: 20, bgcolor: 'var(--planning-ai-accent-bg)', color: '#6D28D9', fontWeight: 600}} />
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>None</Typography>
                  )}
                </Box>
                <Box>
                  <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1}}>
                    Impacted Lines
                  </Typography>
                  {v.impactedLines.length > 0 ? (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {v.impactedLines.map((l) => (
                        <Chip key={l} label={l} size="small" sx={{fontSize: 11, height: 20, bgcolor: '#ECFDF3', color: '#027A48', fontWeight: 600}} />
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>None</Typography>
                  )}
                </Box>
                <Box>
                  <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1}}>
                    Impacted Materials
                  </Typography>
                  {v.impactedMaterials.length > 0 ? (
                    <Stack direction="row" flexWrap="wrap" gap={0.5}>
                      {v.impactedMaterials.map((m) => (
                        <Chip key={m} label={m} size="small" sx={{fontSize: 11, height: 20, bgcolor: 'var(--planning-neutral-bg)', color: '#1D4ED8', fontWeight: 600}} />
                      ))}
                    </Stack>
                  ) : (
                    <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>None</Typography>
                  )}
                </Box>
              </Box>
              {v.previousScheduleVersionId && (
                <Box sx={{mb: 2}}>
                  <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1}}>
                    Previous Version
                  </Typography>
                  <Chip
                    label={v.previousScheduleVersionId}
                    size="small"
                    sx={{fontSize: 11, height: 20, bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', fontWeight: 600, border: '1px solid var(--planning-border)', fontFamily: 'monospace'}}
                  />
                </Box>
              )}
              {v.publishedAt && (
                <Box sx={{mb: 2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2}}>
                  {v.publishedBy && (
                    <Box>
                      <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5}}>
                        Published By
                      </Typography>
                      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{v.publishedBy}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5}}>
                      Published At
                    </Typography>
                    <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{formatTs(v.publishedAt)}</Typography>
                  </Box>
                  {v.frozenAt && (
                    <Box>
                      <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5}}>
                        Frozen At
                      </Typography>
                      <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{formatTs(v.frozenAt)}</Typography>
                    </Box>
                  )}
                </Box>
              )}
              <Box>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.5}}>
                  Change Reason
                </Typography>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)'}}>{v.changeReason}</Typography>
                {v.notes && (
                  <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.5, fontStyle: 'italic'}}>{v.notes}</Typography>
                )}
              </Box>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

interface ScheduleVersionTableProps {
  groups: ScheduleVersionCycleGroup[];
  expandedId: string | null;
  expandedGroups: Set<string>;
  onRowClick?: (v: ScheduleVersion) => void;
  onToggleExpand: (id: string) => void;
  onToggleGroup: (cycleId: string) => void;
}

export default function ScheduleVersionTable({
  groups,
  expandedId,
  expandedGroups,
  onRowClick,
  onToggleExpand,
  onToggleGroup,
}: ScheduleVersionTableProps) {
  const totalVersions = groups.reduce((sum, g) => sum + g.versions.length, 0);

  if (totalVersions === 0) {
    return (
      <Paper elevation={0} sx={{...moduleCardSx, p: 4, textAlign: 'center'}}>
        <Typography sx={{color: 'var(--planning-text-muted)', fontSize: 14}}>No schedule versions match the current filters.</Typography>
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={{...moduleCardSx, overflow: 'hidden'}}>
      <TableContainer sx={{maxHeight: 'calc(100vh - 340px)', overflow: 'auto'}}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{...headCellSx, width: 36, px: 0.5}} />
              <TableCell sx={headCellSx}>Schedule Code</TableCell>
              <TableCell sx={headCellSx}>Status</TableCell>
              <TableCell sx={headCellSx}>Approval</TableCell>
              <TableCell sx={headCellSx}>Validation</TableCell>
              <TableCell sx={headCellSx}>Period</TableCell>
              <TableCell sx={headCellSx}>Linked MPS</TableCell>
              <TableCell sx={headCellSx}>Linked MRP Snapshot</TableCell>
              <TableCell sx={headCellSx}>Created By</TableCell>
              <TableCell sx={headCellSx}>Created At</TableCell>
              {onRowClick && <TableCell sx={{...headCellSx, width: 36, px: 0.5}} />}
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => {
              const isGroupExpanded = expandedGroups.has(group.cycleId);
              return (
                <>
                  <CycleGroupHeader
                    key={`group-${group.cycleId}`}
                    group={group}
                    expanded={isGroupExpanded}
                    hasActionCol={!!onRowClick}
                    onToggle={() => onToggleGroup(group.cycleId)}
                  />
                  {isGroupExpanded && group.versions.map((v) => (
                    <ScheduleVersionRow
                      key={v.id}
                      v={v}
                      isExpanded={expandedId === v.id}
                      onRowClick={onRowClick}
                      onToggleExpand={() => onToggleExpand(v.id)}
                    />
                  ))}
                </>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
