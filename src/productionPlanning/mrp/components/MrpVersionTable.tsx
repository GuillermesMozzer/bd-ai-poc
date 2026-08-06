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
import type {MrpApprovalStatus, MrpVersion, MrpVersionCycleGroup} from '../types';
import {MrpApprovalStatusBadge, MrpBaselineBadge, MrpTypeBadge} from './MrpVersionBadges';

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

const STATUS_ORDER: MrpApprovalStatus[] = ['Approved', 'Pending Approval', 'Rejected', 'Draft'];
const STATUS_COLORS: Record<MrpApprovalStatus, string> = {
  Approved: '#027A48',
  'Pending Approval': '#B54708',
  Rejected: '#B42318',
  Draft: '#1D4ED8',
};

function formatTs(ts: string) {
  return new Date(ts).toLocaleString('en-GB', {dateStyle: 'short', timeStyle: 'short'});
}

function formatPeriod(start: string, end: string) {
  const fmt = (d: string) => new Date(d).toLocaleString('en-GB', {month: 'short', year: 'numeric'});
  const s = fmt(start);
  const e = fmt(end);
  return s === e ? s : `${s} – ${e}`;
}

function CycleGroupHeader({
  group,
  expanded,
  hasActionCol,
  onToggle,
}: {
  group: MrpVersionCycleGroup;
  expanded: boolean;
  hasActionCol?: boolean;
  onToggle: () => void;
}) {
  const counts = STATUS_ORDER.reduce<Partial<Record<MrpApprovalStatus, number>>>((acc, s) => {
    const n = group.versions.filter((v) => v.approvalStatus === s).length;
    if (n > 0) acc[s] = n;
    return acc;
  }, {});
  const officialCount = group.versions.filter((v) => v.mrpType === 'Official').length;
  const simCount = group.versions.filter((v) => v.mrpType === 'Simulation').length;

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
      <TableCell colSpan={hasActionCol ? 12 : 11} sx={{py: 1, px: 1, border: 0}}>
        <Stack direction="row" alignItems="center" gap={1.5} flexWrap="wrap">
          <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>
            {group.cycleLabel}
          </Typography>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 500}}>
            {group.versions.length} version{group.versions.length !== 1 ? 's' : ''}
          </Typography>
          <Box sx={{ml: 'auto', display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center'}}>
            {(Object.entries(counts) as [MrpApprovalStatus, number][]).map(([status, count]) => (
              <Stack key={status} direction="row" alignItems="center" gap={0.4}>
                <Box sx={{width: 7, height: 7, borderRadius: '50%', bgcolor: STATUS_COLORS[status]}} />
                <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 600}}>
                  {count} {status}
                </Typography>
              </Stack>
            ))}
            {officialCount > 0 && (
              <Typography sx={{fontSize: 11, color: '#6D28D9', fontWeight: 700, bgcolor: 'var(--planning-ai-accent-bg)', px: 0.8, py: 0.2, borderRadius: 1, border: '1px solid #DDD6FE'}}>
                {officialCount} Official
              </Typography>
            )}
            {simCount > 0 && (
              <Typography sx={{fontSize: 11, color: '#B54708', fontWeight: 700, bgcolor: '#FFF7ED', px: 0.8, py: 0.2, borderRadius: 1, border: '1px solid #F9DBAF'}}>
                {simCount} Sim
              </Typography>
            )}
          </Box>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

function MrpVersionRow({
  v,
  isExpanded,
  onRowClick,
  onToggleExpand,
}: {
  v: MrpVersion;
  isExpanded: boolean;
  onRowClick?: (v: MrpVersion) => void;
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
            {v.id}
          </Typography>
        </TableCell>
        <TableCell sx={bodyCellSx}>{v.planningCycle}</TableCell>
        <TableCell sx={bodyCellSx}><MrpTypeBadge mrpType={v.mrpType} /></TableCell>
        <TableCell sx={bodyCellSx}>
          {v.isApprovedBaseline ? <MrpBaselineBadge /> : <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)'}}>—</Typography>}
        </TableCell>
        <TableCell sx={{...bodyCellSx, whiteSpace: 'nowrap'}}>
          {formatPeriod(v.effectivePeriodStart, v.effectivePeriodEnd)}
        </TableCell>
        <TableCell sx={bodyCellSx}>{formatTs(v.generatedAt)}</TableCell>
        <TableCell sx={bodyCellSx}>{v.generatedBy}</TableCell>
        <TableCell sx={bodyCellSx}>
          <Tooltip title={`Parent MPS: ${v.parentMpsVersionId}`} placement="top">
            <Chip
              label={v.parentMpsVersionId}
              size="small"
              sx={{fontSize: 11, height: 20, bgcolor: 'var(--planning-ai-accent-bg)', color: '#6D28D9', fontWeight: 600, border: '1px solid #DDD6FE', fontFamily: 'monospace'}}
            />
          </Tooltip>
        </TableCell>
        <TableCell sx={bodyCellSx}><MrpApprovalStatusBadge status={v.approvalStatus} /></TableCell>
        <TableCell sx={bodyCellSx}>{v.approvedBy ?? '—'}</TableCell>
        <TableCell sx={{...bodyCellSx, maxWidth: 120}}>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {v.impactedLines.join(', ') || '—'}
          </Typography>
        </TableCell>
        {onRowClick && (
          <TableCell sx={{...bodyCellSx, width: 36, px: 0.5, textAlign: 'center'}}>
            <ArrowForwardIcon sx={{fontSize: 15, color: 'var(--planning-text-muted)'}} />
          </TableCell>
        )}
      </TableRow>
      <TableRow key={`${v.id}-expand`}>
        <TableCell colSpan={onRowClick ? 14 : 13} sx={{p: 0, border: 0}}>
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <Box sx={{bgcolor: 'var(--planning-surface-muted)', borderTop: '1px solid var(--planning-border)', borderBottom: '1px solid var(--planning-border)', px: 3, py: 2}}>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 3, mb: 2}}>
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
              </Box>
              {v.linkedForecastVersionIds.length > 0 && (
                <Box sx={{mb: 2}}>
                  <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1}}>
                    Linked Forecast Versions
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {v.linkedForecastVersionIds.map((fct) => (
                      <Chip key={fct} label={fct} size="small" sx={{fontSize: 11, height: 20, bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', fontWeight: 600, border: '1px solid #C7D2FE'}} />
                    ))}
                  </Stack>
                </Box>
              )}
              <Box sx={{mb: 2}}>
                <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1}}>
                  Parent MPS Version
                </Typography>
                <Chip
                  label={v.parentMpsVersionId}
                  size="small"
                  sx={{fontSize: 11, height: 20, bgcolor: 'var(--planning-ai-accent-bg)', color: '#6D28D9', fontWeight: 600, border: '1px solid #DDD6FE', fontFamily: 'monospace'}}
                />
              </Box>
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

interface MrpVersionTableProps {
  groups: MrpVersionCycleGroup[];
  expandedId: string | null;
  expandedGroups: Set<string>;
  onRowClick?: (v: MrpVersion) => void;
  onToggleExpand: (id: string) => void;
  onToggleGroup: (cycleId: string) => void;
}

export default function MrpVersionTable({
  groups,
  expandedId,
  expandedGroups,
  onRowClick,
  onToggleExpand,
  onToggleGroup,
}: MrpVersionTableProps) {
  const totalVersions = groups.reduce((sum, g) => sum + g.versions.length, 0);

  if (totalVersions === 0) {
    return (
      <Paper elevation={0} sx={{...moduleCardSx, p: 4, textAlign: 'center'}}>
        <Typography sx={{color: 'var(--planning-text-muted)', fontSize: 14}}>No MRP versions match the current filters.</Typography>
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
              <TableCell sx={headCellSx}>Version ID</TableCell>
              <TableCell sx={headCellSx}>Planning Cycle</TableCell>
              <TableCell sx={headCellSx}>MRP Type</TableCell>
              <TableCell sx={headCellSx}>Baseline</TableCell>
              <TableCell sx={headCellSx}>Effective Period</TableCell>
              <TableCell sx={headCellSx}>Generated</TableCell>
              <TableCell sx={headCellSx}>Generated By</TableCell>
              <TableCell sx={headCellSx}>Parent MPS</TableCell>
              <TableCell sx={headCellSx}>Status</TableCell>
              <TableCell sx={headCellSx}>Approved By</TableCell>
              <TableCell sx={headCellSx}>Lines</TableCell>
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
                    <MrpVersionRow
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
