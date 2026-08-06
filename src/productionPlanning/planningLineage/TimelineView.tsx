import {useRef, useState} from 'react';
import {
  ArrowForwardIos as ArrowForwardIosIcon,
  Assignment as AssignmentIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  Block as BlockIcon,
  BubbleChart as BubbleChartIcon,
  CheckCircle as CheckCircleIcon,
  Description as DescriptionIcon,
  Error as ErrorIcon,
  ErrorOutline as ErrorOutlineIcon,
  FactCheck as FactCheckIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  LocalShipping as LocalShippingIcon,
  OpenInNew as OpenInNewIcon,
  PauseCircle as PauseCircleIcon,
  Science as ScienceIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import type {LineageChain, LineageDemandGroup, LineageFilterState, LineageNode, LineageNodeStatus, LineageStageId} from './types';

// ─── Stage groups ─────────────────────────────────────────────────────────────

type TimelineStageGroup = {
  id: string;
  label: string;
  number: number;
  color: string;
  stageIds: LineageStageId[];
};

const TIMELINE_STAGES: TimelineStageGroup[] = [
  {id: 'demand',    label: 'Demand',         number: 1, color: '#1D4ED8', stageIds: ['demand']},
  {id: 'forecast',  label: 'Forecast',        number: 2, color: '#7C3AED', stageIds: ['mps']},
  {id: 'mps',       label: 'MPS',             number: 3, color: '#0891B2', stageIds: ['mrp']},
  {id: 'mrp',       label: 'MRP',             number: 4, color: '#059669', stageIds: ['planned-order']},
  {id: 'orders',    label: 'Orders',          number: 5, color: '#D97706', stageIds: ['production-order']},
  {id: 'schedule',  label: 'Schedule',        number: 6, color: '#6D28D9', stageIds: ['schedule']},
  {id: 'execution', label: 'Execution',       number: 7, color: '#DC2626', stageIds: ['wo-release', 'execution']},
  {id: 'batch',     label: 'Batch',           number: 8, color: '#1D4ED8', stageIds: ['batch-produced', 'material-lot-genealogy', 'ipc-quality', 'deviations', 'sterilization', 'dhr-documentation']},
  {id: 'release',   label: 'Release Status',  number: 9, color: '#16A34A', stageIds: ['batch-release-decision', 'final-disposition']},
];

// ─── Data derivation ──────────────────────────────────────────────────────────

type BatchRow = {
  chainId: string;
  batchId: string;
  product: string;
  woNumber: string;
  producedQty: string;
  dom: string;
  expiry: string;
  line: string;
  executionStatus: string;
  executionStatusRaw: LineageNodeStatus;
  releaseStatus: string;
  releaseStatusRaw: LineageNodeStatus;
  expectedRelease: string;
};

function getNode(chain: LineageChain, stageId: LineageStageId): LineageNode | undefined {
  return chain.nodes.find((n) => n.stageId === stageId);
}

function mapExecutionStatus(status: LineageNodeStatus): string {
  if (status === 'approved' || status === 'released') return 'Completed';
  if (status === 'on-hold' || status === 'blocked') return 'On Hold';
  if (status === 'draft') return 'Not Started';
  if (status === 'warning' || status === 'critical') return 'In Progress';
  return 'In Progress';
}

function mapReleaseStatus(status: LineageNodeStatus): string {
  if (status === 'released') return 'Released';
  if (status === 'on-hold') return 'QA Hold';
  if (status === 'draft') return 'Pending Review';
  if (status === 'not-applicable') return 'Not Applicable';
  if (status === 'rejected') return 'Rejected';
  if (status === 'blocked') return 'QA Hold';
  return 'Pending Review';
}

function deriveBatchRow(chain: LineageChain, group: LineageDemandGroup): BatchRow {
  const poNode = getNode(chain, 'production-order');
  const execNode = getNode(chain, 'execution');
  const bpNode = getNode(chain, 'batch-produced');
  const relNode = getNode(chain, 'batch-release-decision');

  const batchId = bpNode?.label?.replace(/^Batch\s+/, '') ?? chain.id;
  const woNumber = poNode?.label?.split(' / ')[1] ?? poNode?.label ?? '';
  const producedQty = execNode?.quantity ?? bpNode?.quantity ?? '';
  const dom = bpNode?.sublabel ?? '';
  const expiry = bpNode?.metaLine1?.replace(/^Exp:\s*/, '') ?? '';
  const executionStatusRaw = execNode?.status ?? 'draft';
  const releaseStatusRaw = relNode?.status ?? 'draft';

  return {
    chainId: chain.id,
    batchId,
    product: group.product,
    woNumber,
    producedQty,
    dom,
    expiry,
    line: group.line,
    executionStatus: mapExecutionStatus(executionStatusRaw),
    executionStatusRaw,
    releaseStatus: mapReleaseStatus(releaseStatusRaw),
    releaseStatusRaw,
    expectedRelease: relNode?.sublabel ?? 'TBD',
  };
}

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusColor(status: LineageNodeStatus): string {
  if (status === 'approved' || status === 'released') return '#16A34A';
  if (status === 'warning') return '#D97706';
  if (status === 'critical' || status === 'blocked' || status === 'rejected') return '#DC2626';
  if (status === 'on-hold') return '#D97706';
  if (status === 'draft') return '#94A3B8';
  if (status === 'not-applicable') return '#94A3B8';
  return '#94A3B8';
}

function dotStatus(nodes: (LineageNode | undefined)[]): 'green' | 'orange' | 'red' | 'grey' {
  const statuses = nodes.filter(Boolean).map((n) => n!.status);
  if (statuses.some((s) => s === 'critical' || s === 'blocked' || s === 'rejected')) return 'red';
  if (statuses.some((s) => s === 'warning' || s === 'on-hold')) return 'orange';
  if (statuses.every((s) => s === 'approved' || s === 'released')) return 'green';
  return 'grey';
}

const DOT_COLORS = {green: '#16A34A', orange: '#D97706', red: '#DC2626', grey: '#CBD5E1'};

// ─── Stage Pipeline Card ──────────────────────────────────────────────────────

type StatusCount = {green: number; orange: number; red: number};

function StagePipelineCard({
  stage,
  sharedNode,
  statusCounts,
  totalChains,
  isSelected,
  isActive,
  onClick,
}: {
  stage: TimelineStageGroup;
  sharedNode: LineageNode | null;
  statusCounts: StatusCount;
  totalChains: number;
  isSelected: boolean;
  isActive: boolean;
  onClick: () => void;
}) {
  const hasMultiple = totalChains > 1;
  const totalDots = statusCounts.green + statusCounts.orange + statusCounts.red;

  return (
    <Box
      onClick={onClick}
      sx={{
        minWidth: 148,
        maxWidth: 180,
        flex: 1,
        border: `1.5px solid ${isActive ? stage.color : isSelected ? '#CBD5E1' : '#E2E8F0'}`,
        borderRadius: 2,
        p: 1.5,
        bgcolor: isActive ? `color-mix(in srgb, ${stage.color} 5%, transparent)` : '#fff',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background-color 0.15s',
        '&:hover': {borderColor: stage.color, bgcolor: `color-mix(in srgb, ${stage.color} 3%, transparent)`},
        position: 'relative',
      }}
    >
      {/* Number badge + label */}
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, mb: 1}}>
        <Box sx={{
          width: 22, height: 22, borderRadius: '50%', bgcolor: stage.color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Typography sx={{fontSize: 10, fontWeight: 800, color: '#fff'}}>{stage.number}</Typography>
        </Box>
        <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-primary)', lineHeight: 1.2}}>{stage.label}</Typography>
      </Box>

      {/* Node label */}
      {sharedNode && (
        <Typography sx={{fontSize: 11, color: '#475569', mb: 0.5, lineHeight: 1.3, fontWeight: 500}}>
          {sharedNode.label.length > 22 ? `${sharedNode.label.slice(0, 20)}…` : sharedNode.label}
        </Typography>
      )}

      {/* Quantity */}
      {sharedNode?.quantity && (
        <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', mb: 0.75}}>
          {sharedNode.quantity} units
        </Typography>
      )}

      {/* Multi-chain counts */}
      {hasMultiple && totalDots > 0 && (
        <Box sx={{display: 'flex', gap: 0.5, mt: 0.5, alignItems: 'center'}}>
          {statusCounts.green > 0 && (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.25}}>
              <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: '#16A34A'}} />
              <Typography sx={{fontSize: 10, color: '#16A34A', fontWeight: 700}}>{statusCounts.green}</Typography>
            </Box>
          )}
          {statusCounts.orange > 0 && (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.25}}>
              <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: '#D97706'}} />
              <Typography sx={{fontSize: 10, color: '#D97706', fontWeight: 700}}>{statusCounts.orange}</Typography>
            </Box>
          )}
          {statusCounts.red > 0 && (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.25}}>
              <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: '#DC2626'}} />
              <Typography sx={{fontSize: 10, color: '#DC2626', fontWeight: 700}}>{statusCounts.red}</Typography>
            </Box>
          )}
        </Box>
      )}

      {/* Single-chain status badge */}
      {!hasMultiple && sharedNode && (
        <Box sx={{
          display: 'inline-block', px: 0.75, py: 0.25, borderRadius: 1,
          bgcolor: `color-mix(in srgb, ${statusColor(sharedNode.status)} 9%, transparent)`,
          border: `1px solid color-mix(in srgb, ${statusColor(sharedNode.status)} 25%, transparent)`,
          mt: 0.5,
        }}>
          <Typography sx={{fontSize: 9, fontWeight: 700, color: statusColor(sharedNode.status), textTransform: 'uppercase', letterSpacing: 0.3}}>
            {sharedNode.statusLabel ?? sharedNode.status}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// ─── Stage Pipeline ───────────────────────────────────────────────────────────

function computeStatusCounts(chains: LineageChain[], stageIds: LineageStageId[]): StatusCount {
  const counts = {green: 0, orange: 0, red: 0};
  for (const chain of chains) {
    const nodes = stageIds.map((id) => getNode(chain, id)).filter(Boolean) as LineageNode[];
    const d = dotStatus(nodes);
    if (d === 'green') counts.green++;
    else if (d === 'orange') counts.orange++;
    else if (d === 'red') counts.red++;
  }
  return counts;
}

function StagePipeline({
  group,
  activeStageFilter,
  onStageClick,
  selectedChain,
}: {
  group: LineageDemandGroup;
  activeStageFilter: string | null;
  onStageClick: (stageId: string | null) => void;
  selectedChain: LineageChain | null;
}) {
  const allNodes = group.chains.flatMap((c) => c.nodes);
  const uniqueNodes = new Map<string, LineageNode>();
  allNodes.forEach((n) => {if (!uniqueNodes.has(n.id)) uniqueNodes.set(n.id, n);});

  function getRepresentativeNode(stageIds: LineageStageId[]): LineageNode | null {
    for (const sid of stageIds) {
      const found = Array.from(uniqueNodes.values()).find((n) => n.stageId === sid && n.sharedAcrossChains);
      if (found) return found;
    }
    for (const sid of stageIds) {
      const found = Array.from(uniqueNodes.values()).find((n) => n.stageId === sid);
      if (found) return found;
    }
    return null;
  }

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 0.5, px: 2, py: 1.5,
      bgcolor: 'var(--planning-surface-muted)', borderBottom: '1px solid var(--planning-border)', overflowX: 'auto',
      scrollbarWidth: 'none', '&::-webkit-scrollbar': {display: 'none'},
    }}>
      {TIMELINE_STAGES.map((stage, idx) => {
        const repNode = getRepresentativeNode(stage.stageIds);
        const counts = computeStatusCounts(group.chains, stage.stageIds);
        const isActive = activeStageFilter === stage.id;

        // Determine if this stage is selected batch's "active" stage
        const isSelected = selectedChain
          ? stage.stageIds.some((sid) => selectedChain.nodeIdsByStage[sid])
          : false;

        return (
          <Box key={stage.id} sx={{display: 'flex', alignItems: 'center', flexShrink: 0, flex: 1, minWidth: 0}}>
            <StagePipelineCard
              stage={stage}
              sharedNode={repNode}
              statusCounts={counts}
              totalChains={group.chains.length}
              isSelected={isSelected}
              isActive={isActive}
              onClick={() => onStageClick(isActive ? null : stage.id)}
            />
            {idx < TIMELINE_STAGES.length - 1 && (
              <ArrowForwardIosIcon sx={{fontSize: 12, color: '#CBD5E1', mx: 0.25, flexShrink: 0}} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Batch Table ──────────────────────────────────────────────────────────────

function ExecStatusChip({status, raw}: {status: string; raw: LineageNodeStatus}) {
  const color = raw === 'approved' || raw === 'released' ? '#16A34A'
    : raw === 'on-hold' || raw === 'blocked' ? '#D97706'
    : raw === 'draft' ? '#94A3B8'
    : '#1D4ED8';
  return (
    <Box sx={{
      display: 'inline-block', px: 1, py: 0.25, borderRadius: 1,
      bgcolor: `color-mix(in srgb, ${color} 9%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
    }}>
      <Typography sx={{fontSize: 10, fontWeight: 700, color, letterSpacing: 0.2}}>{status}</Typography>
    </Box>
  );
}

function ReleaseStatusChip({status, raw}: {status: string; raw: LineageNodeStatus}) {
  const color = raw === 'released' ? '#16A34A'
    : raw === 'on-hold' || raw === 'blocked' ? '#D97706'
    : raw === 'rejected' ? '#DC2626'
    : raw === 'not-applicable' ? '#94A3B8'
    : '#1D4ED8';
  return (
    <Box sx={{
      display: 'inline-block', px: 1, py: 0.25, borderRadius: 1,
      bgcolor: `color-mix(in srgb, ${color} 9%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 25%, transparent)`,
    }}>
      <Typography sx={{fontSize: 10, fontWeight: 700, color, letterSpacing: 0.2}}>{status}</Typography>
    </Box>
  );
}

function BatchTable({
  rows,
  selectedChainId,
  onSelect,
  activeTab,
  onTabChange,
  group,
}: {
  rows: BatchRow[];
  selectedChainId: string | null;
  onSelect: (chainId: string) => void;
  activeTab: number;
  onTabChange: (tab: number) => void;
  group: LineageDemandGroup;
}) {
  const exceptions = group.chains.filter((c) => c.nodes.some((n) => n.status === 'warning' || n.status === 'critical'));
  const blockers = group.chains.filter((c) => c.nodes.some((n) => n.status === 'blocked'));
  const alerts = group.chains.filter((c) => c.nodes.some((n) => n.hasRiskIndicator));

  const visibleChainIds = new Set<string>(
    activeTab === 0 ? rows.map((r) => r.chainId)
      : activeTab === 1 ? exceptions.map((c) => c.id)
      : activeTab === 2 ? blockers.map((c) => c.id)
      : alerts.map((c) => c.id),
  );
  const visibleRows = rows.filter((r) => visibleChainIds.has(r.chainId));

  // Summary counts
  const released = rows.filter((r) => r.releaseStatusRaw === 'released').length;
  const qaHold = rows.filter((r) => r.releaseStatus === 'QA Hold').length;
  const pending = rows.filter((r) => r.releaseStatus === 'Pending Review').length;

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', bgcolor: '#fff'}}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => onTabChange(v)}
        sx={{
          minHeight: 38, borderBottom: '1px solid var(--planning-border)', px: 2,
          '& .MuiTab-root': {minHeight: 38, fontSize: 12, fontWeight: 600, textTransform: 'none', px: 1.5},
          '& .MuiTabs-indicator': {bgcolor: '#1D4ED8'},
        }}
      >
        <Tab label={`Overview`} />
        <Tab label={
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
            Exceptions
            {exceptions.length > 0 && (
              <Box sx={{bgcolor: '#D97706', borderRadius: 5, px: 0.6, py: 0.1}}>
                <Typography sx={{fontSize: 9, fontWeight: 800, color: '#fff'}}>{exceptions.length}</Typography>
              </Box>
            )}
          </Box>
        } />
        <Tab label={
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
            Blockers
            {blockers.length > 0 && (
              <Box sx={{bgcolor: '#DC2626', borderRadius: 5, px: 0.6, py: 0.1}}>
                <Typography sx={{fontSize: 9, fontWeight: 800, color: '#fff'}}>{blockers.length}</Typography>
              </Box>
            )}
          </Box>
        } />
        <Tab label={
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
            Alerts
            {alerts.length > 0 && (
              <Box sx={{bgcolor: '#F59E0B', borderRadius: 5, px: 0.6, py: 0.1}}>
                <Typography sx={{fontSize: 9, fontWeight: 800, color: '#fff'}}>{alerts.length}</Typography>
              </Box>
            )}
          </Box>
        } />
      </Tabs>

      <Box sx={{px: 2, py: 1, bgcolor: 'var(--planning-surface-muted)', borderBottom: '1px solid var(--planning-border)'}}>
        <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-primary)'}}>
          {activeTab === 0 ? `Batches (${rows.length})` : activeTab === 1 ? `Exceptions (${exceptions.length})` : activeTab === 2 ? `Blockers (${blockers.length})` : `Alerts (${alerts.length})`}
        </Typography>
      </Box>

      <TableContainer sx={{flex: 1, overflowY: 'auto'}}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {['Batch ID', 'Product', 'WO Number', 'Produced Qty', 'DOM', 'Status', 'Release Status', 'Expected Release'].map((col) => (
                <TableCell key={col} sx={{
                  fontSize: 10, fontWeight: 700, color: 'var(--planning-text-secondary)', bgcolor: 'var(--planning-surface-muted)',
                  py: 0.75, borderBottom: '1px solid var(--planning-border)', whiteSpace: 'nowrap',
                }}>
                  {col}
                </TableCell>
              ))}
              <TableCell sx={{bgcolor: 'var(--planning-surface-muted)', width: 24}} />
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} sx={{textAlign: 'center', py: 4, color: 'var(--planning-text-muted)', fontSize: 13}}>
                  No batches match this filter.
                </TableCell>
              </TableRow>
            ) : visibleRows.map((row) => {
              const isSelected = selectedChainId === row.chainId;
              return (
                <TableRow
                  key={row.chainId}
                  onClick={() => onSelect(row.chainId)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: isSelected ? '#EFF6FF' : 'transparent',
                    borderLeft: isSelected ? '3px solid #1D4ED8' : '3px solid transparent',
                    '&:hover': {bgcolor: isSelected ? '#EFF6FF' : '#F8FAFC'},
                  }}
                >
                  <TableCell sx={{fontSize: 12, fontWeight: 700, color: '#1D4ED8', whiteSpace: 'nowrap', py: 0.75}}>
                    {row.batchId}
                  </TableCell>
                  <TableCell sx={{fontSize: 12, color: 'var(--planning-text-secondary)', py: 0.75}}>{row.product}</TableCell>
                  <TableCell sx={{fontSize: 12, color: 'var(--planning-text-secondary)', py: 0.75, whiteSpace: 'nowrap'}}>{row.woNumber}</TableCell>
                  <TableCell sx={{fontSize: 12, color: 'var(--planning-text-secondary)', py: 0.75, whiteSpace: 'nowrap'}}>{row.producedQty}</TableCell>
                  <TableCell sx={{fontSize: 12, color: 'var(--planning-text-secondary)', py: 0.75, whiteSpace: 'nowrap'}}>{row.dom}</TableCell>
                  <TableCell sx={{py: 0.75}}>
                    <ExecStatusChip status={row.executionStatus} raw={row.executionStatusRaw} />
                  </TableCell>
                  <TableCell sx={{py: 0.75}}>
                    <ReleaseStatusChip status={row.releaseStatus} raw={row.releaseStatusRaw} />
                  </TableCell>
                  <TableCell sx={{fontSize: 12, color: 'var(--planning-text-secondary)', py: 0.75, whiteSpace: 'nowrap'}}>{row.expectedRelease}</TableCell>
                  <TableCell sx={{py: 0.75, pr: 1}}>
                    <Box sx={{fontSize: 14, color: 'var(--planning-text-muted)'}}>›</Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Summary footer */}
      <Box sx={{
        px: 2, py: 1, borderTop: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)',
        display: 'flex', gap: 2, flexWrap: 'wrap',
      }}>
        <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 600}}>{rows.length} Total Batches</Typography>
        {released > 0 && <Typography sx={{fontSize: 11, color: '#16A34A', fontWeight: 600}}>{released} Released</Typography>}
        {pending > 0 && <Typography sx={{fontSize: 11, color: '#1D4ED8', fontWeight: 600}}>{pending} Pending Review</Typography>}
        {qaHold > 0 && <Typography sx={{fontSize: 11, color: '#D97706', fontWeight: 600}}>{qaHold} QA Hold</Typography>}
      </Box>
    </Box>
  );
}

// ─── Mini Timeline ────────────────────────────────────────────────────────────

function MiniTimeline({chain, onDotClick}: {chain: LineageChain; onDotClick: (stageId: string) => void}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'flex-start', py: 1.5, overflowX: 'auto', scrollbarWidth: 'none', '&::-webkit-scrollbar': {display: 'none'}}}>
      {TIMELINE_STAGES.map((stage, idx) => {
        const nodes = stage.stageIds
          .map((sid) => chain.nodes.find((n) => n.stageId === sid))
          .filter(Boolean) as LineageNode[];
        const d = nodes.length === 0 ? 'grey' : dotStatus(nodes);
        const color = DOT_COLORS[d];
        const isNA = nodes.every((n) => n.isNotApplicable);

        return (
          <Box key={stage.id} sx={{display: 'flex', alignItems: 'flex-start', flexShrink: 0}}>
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 64}}>
              <Tooltip title={stage.label}>
                <Box
                  onClick={() => onDotClick(stage.id)}
                  sx={{
                    width: 26, height: 26, borderRadius: '50%',
                    bgcolor: isNA ? 'transparent' : color,
                    border: isNA ? `2px dashed ${color}` : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: d !== 'grey' ? `0 0 0 3px color-mix(in srgb, ${color} 19%, transparent)` : 'none',
                    '&:hover': {transform: 'scale(1.15)'},
                    transition: 'transform 0.15s',
                  }}
                >
                  {d === 'green' && <CheckCircleIcon sx={{fontSize: 14, color: '#fff'}} />}
                  {d === 'orange' && <WarningIcon sx={{fontSize: 12, color: '#fff'}} />}
                  {d === 'red' && <ErrorIcon sx={{fontSize: 12, color: '#fff'}} />}
                  {d === 'grey' && isNA && <Box sx={{width: 6, height: 6, borderRadius: '50%', bgcolor: color}} />}
                </Box>
              </Tooltip>
              <Typography sx={{fontSize: 9, color: 'var(--planning-text-secondary)', mt: 0.5, textAlign: 'center', lineHeight: 1.2, fontWeight: 500}}>
                {stage.label}
              </Typography>
            </Box>
            {idx < TIMELINE_STAGES.length - 1 && (
              <Box sx={{
                height: 2, flex: 1, bgcolor: d === 'grey' ? '#E2E8F0' : color,
                mt: '12px', minWidth: 8,
              }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────

type DetailRowIcon = 'demand' | 'order' | 'execution' | 'material' | 'quality' | 'sterilization' | 'dhr' | 'release' | 'audit';

const DETAIL_ICONS: Record<DetailRowIcon, React.ReactNode> = {
  demand: <LocalShippingIcon sx={{fontSize: 16, color: '#1D4ED8'}} />,
  order: <AssignmentIcon sx={{fontSize: 16, color: '#7C3AED'}} />,
  execution: <FactCheckIcon sx={{fontSize: 16, color: '#D97706'}} />,
  material: <BubbleChartIcon sx={{fontSize: 16, color: '#059669'}} />,
  quality: <ScienceIcon sx={{fontSize: 16, color: '#0891B2'}} />,
  sterilization: <Verified sx={{fontSize: 16, color: '#6D28D9'}} />,
  dhr: <DescriptionIcon sx={{fontSize: 16, color: '#0369A1'}} />,
  release: <AssignmentTurnedInIcon sx={{fontSize: 16, color: '#16A34A'}} />,
  audit: <HistoryIcon sx={{fontSize: 16, color: 'var(--planning-text-secondary)'}} />,
};

function statusIcon(status: LineageNodeStatus | null) {
  if (!status) return <InfoIcon sx={{fontSize: 16, color: 'var(--planning-text-muted)'}} />;
  if (status === 'approved' || status === 'released') return <CheckCircleIcon sx={{fontSize: 16, color: '#16A34A'}} />;
  if (status === 'warning' || status === 'on-hold') return <WarningIcon sx={{fontSize: 16, color: '#D97706'}} />;
  if (status === 'critical' || status === 'blocked' || status === 'rejected') return <ErrorOutlineIcon sx={{fontSize: 16, color: '#DC2626'}} />;
  if (status === 'not-applicable') return <InfoIcon sx={{fontSize: 16, color: 'var(--planning-text-muted)'}} />;
  if (status === 'draft') return <PauseCircleIcon sx={{fontSize: 16, color: 'var(--planning-text-muted)'}} />;
  return <InfoIcon sx={{fontSize: 16, color: 'var(--planning-text-muted)'}} />;
}

// workaround for named import conflict
function Verified({sx}: {sx: object}) {
  return <VerifiedIcon sx={sx} />;
}

function DetailRow({
  icon,
  title,
  summary,
  nodeStatus,
  id,
}: {
  icon: DetailRowIcon;
  title: string;
  summary: string;
  nodeStatus: LineageNodeStatus | null;
  id?: string;
}) {
  return (
    <Box
      id={id}
      sx={{
        display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.25,
        borderBottom: '1px solid var(--planning-border)',
        '&:hover': {bgcolor: 'var(--planning-surface-muted)'},
      }}
    >
      <Box sx={{
        width: 32, height: 32, borderRadius: 1.5, bgcolor: 'var(--planning-surface-muted)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {DETAIL_ICONS[icon]}
      </Box>
      <Box sx={{flex: 1, minWidth: 0}}>
        <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-primary)', mb: 0.2}}>{title}</Typography>
        <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', lineHeight: 1.4}}>{summary}</Typography>
      </Box>
      <Box sx={{flexShrink: 0}}>{statusIcon(nodeStatus)}</Box>
    </Box>
  );
}

// ─── Batch Detail Panel ───────────────────────────────────────────────────────

function BatchDetailPanel({
  chain,
  group,
  row,
  onBack,
}: {
  chain: LineageChain;
  group: LineageDemandGroup;
  row: BatchRow;
  onBack: () => void;
}) {
  const detailRef = useRef<HTMLDivElement>(null);

  function scrollToSection(stageId: string) {
    const el = detailRef.current?.querySelector(`#detail-section-${stageId}`);
    if (el) el.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  const demandNode = getNode(chain, 'demand');
  const mpsNode = getNode(chain, 'mps');
  const mrpNode = getNode(chain, 'mrp');
  const poNode = getNode(chain, 'production-order');
  const schedNode = getNode(chain, 'schedule');
  const worNode = getNode(chain, 'wo-release');
  const execNode = getNode(chain, 'execution');
  const bpNode = getNode(chain, 'batch-produced');
  const matNode = getNode(chain, 'material-lot-genealogy');
  const ipcNode = getNode(chain, 'ipc-quality');
  const devNode = getNode(chain, 'deviations');
  const sterNode = getNode(chain, 'sterilization');
  const dhrNode = getNode(chain, 'dhr-documentation');
  const relNode = getNode(chain, 'batch-release-decision');
  const finNode = getNode(chain, 'final-disposition');

  // Summaries
  const demandSummary = [demandNode?.label, mpsNode?.label, mrpNode?.label].filter(Boolean).join(' • ') || '—';
  const orderSummary = [poNode?.label, schedNode?.label, `${group.line} / ${poNode?.metaLine1?.replace('Line 2 | ', '') ?? ''}`].filter(Boolean).join(' • ');
  const execSummary = execNode
    ? `Start ${execNode.sublabel ?? '—'}  •  ${execNode.quantity ?? '—'}  •  Scrap: ${execNode.metaLine1?.replace('Scrap: ', '') ?? '—'}`
    : '—';
  const matSummary = matNode
    ? [matNode.metaLine1, matNode.metaLine2].filter(Boolean).join('  •  ')
    : '—';
  const qualityStatus = (() => {
    const ipcStatus = ipcNode?.status ?? null;
    const devStatus = devNode?.status ?? null;
    if (devStatus === 'critical' || devStatus === 'blocked') return 'critical' as LineageNodeStatus;
    if (devStatus === 'warning') return 'warning' as LineageNodeStatus;
    return ipcStatus;
  })();
  const qualitySummary = [
    ipcNode ? `IPC ${ipcNode.statusLabel}` : null,
    devNode ? `Deviations: ${devNode.metaLine1}` : null,
  ].filter(Boolean).join('  •  ') || '—';
  const sterSummary = sterNode?.isNotApplicable
    ? 'Not Required for this product'
    : sterNode
    ? [sterNode.metaLine1, sterNode.metaLine2].filter(Boolean).join('  •  ')
    : '—';
  const dhrSummary = dhrNode
    ? [dhrNode.statusLabel, dhrNode.metaLine2].filter(Boolean).join('  •  ')
    : '—';
  const relSummary = relNode
    ? `${relNode.statusLabel ?? relNode.status}  •  Expected Release: ${relNode.sublabel ?? 'TBD'}`
    : '—';
  const auditSummary = finNode?.metaLine2 ?? relNode?.metaLine2 ?? execNode?.metaLine2 ?? '—';

  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', height: '100%',
      borderLeft: '1px solid #E2E8F0', bgcolor: '#fff',
    }}>
      {/* Header */}
      <Box sx={{px: 2, pt: 1.5, pb: 1, borderBottom: '1px solid var(--planning-border)'}}>
        <Button
          size="small"
          startIcon={<Box component="span" sx={{fontSize: 14}}>‹</Box>}
          onClick={onBack}
          sx={{fontSize: 11, color: 'var(--planning-text-secondary)', textTransform: 'none', p: 0, mb: 0.75, fontWeight: 600, minWidth: 0}}
        >
          Back to Batches
        </Button>

        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap'}}>
          <Typography sx={{fontSize: 16, fontWeight: 800, color: '#0F172A', letterSpacing: -0.3}}>
            {row.batchId}
          </Typography>
          <ReleaseStatusChip status={row.releaseStatus} raw={row.releaseStatusRaw} />
        </Box>

        <Box sx={{display: 'flex', gap: 1}}>
          <Button
            variant="outlined" size="small"
            startIcon={<AssignmentIcon sx={{fontSize: 13}} />}
            sx={{fontSize: 11, textTransform: 'none', borderColor: '#CBD5E1', color: 'var(--planning-text-secondary)', fontWeight: 600}}
          >
            Batch Detail
          </Button>
          <Button
            variant="contained" size="small"
            startIcon={<OpenInNewIcon sx={{fontSize: 13}} />}
            endIcon={<Box component="span" sx={{fontSize: 12}}>▾</Box>}
            sx={{fontSize: 11, textTransform: 'none', bgcolor: '#1D4ED8', fontWeight: 600}}
          >
            FDA Evidence View
          </Button>
        </Box>
      </Box>

      {/* Metadata bar */}
      <Box sx={{
        px: 2, py: 1, bgcolor: 'var(--planning-surface-muted)', borderBottom: '1px solid var(--planning-border)',
        display: 'flex', gap: 2.5, flexWrap: 'wrap',
      }}>
        {[
          {label: 'Product', value: row.product},
          {label: 'Line', value: row.line},
          {label: 'WO', value: row.woNumber},
          {label: 'Produced Qty', value: row.producedQty},
          {label: 'DOM', value: row.dom},
          {label: 'Expiry', value: row.expiry || '—'},
        ].map(({label, value}) => (
          <Box key={label}>
            <Typography sx={{fontSize: 9, color: 'var(--planning-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4}}>{label}</Typography>
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-primary)', fontWeight: 600}}>{value}</Typography>
          </Box>
        ))}
      </Box>

      {/* Mini timeline */}
      <Box sx={{px: 2, py: 0.5, borderBottom: '1px solid var(--planning-border)'}}>
        <MiniTimeline chain={chain} onDotClick={scrollToSection} />
      </Box>

      {/* Detail rows */}
      <Box ref={detailRef} sx={{flex: 1, overflowY: 'auto'}}>
        <DetailRow id="detail-section-demand" icon="demand" title="Linked Demand & Plan" summary={demandSummary} nodeStatus={demandNode?.status ?? null} />
        <DetailRow id="detail-section-orders" icon="order" title="Order & Schedule" summary={orderSummary} nodeStatus={poNode?.status ?? null} />
        <DetailRow id="detail-section-execution" icon="execution" title="Execution" summary={execSummary} nodeStatus={execNode?.status ?? null} />
        <DetailRow id="detail-section-batch" icon="material" title="Material Genealogy" summary={matSummary} nodeStatus={matNode?.status ?? null} />
        <DetailRow id="detail-section-batch-quality" icon="quality" title="Quality & Inspections" summary={qualitySummary} nodeStatus={qualityStatus} />
        <DetailRow id="detail-section-batch-ster" icon="sterilization" title="Sterilization" summary={sterSummary} nodeStatus={sterNode?.status ?? null} />
        <DetailRow id="detail-section-batch-dhr" icon="dhr" title="DHR / Documentation" summary={dhrSummary} nodeStatus={dhrNode?.status ?? null} />
        <DetailRow id="detail-section-release" icon="release" title="Release Decision" summary={relSummary} nodeStatus={relNode?.status ?? null} />
        <DetailRow id="detail-section-release-audit" icon="audit" title="Audit Trail" summary={auditSummary} nodeStatus={null} />
      </Box>
    </Box>
  );
}

// ─── TimelineView ─────────────────────────────────────────────────────────────

export default function TimelineView({
  groups,
  filters,
}: {
  groups: LineageDemandGroup[];
  filters: LineageFilterState;
}) {
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [activeStageFilter, setActiveStageFilter] = useState<string | null>(null);

  // Use the first group if no demandId filter, else use filtered groups
  const activeGroup = groups[0] ?? null;

  if (!activeGroup) {
    return (
      <Box sx={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1.5}}>
        <Typography sx={{fontSize: 14, color: 'var(--planning-text-muted)'}}>No demand groups match the current filters.</Typography>
      </Box>
    );
  }

  // Filter chains by active stage filter
  const filteredGroup: LineageDemandGroup = activeStageFilter
    ? {
        ...activeGroup,
        chains: activeGroup.chains.filter((chain) => {
          const stageGroup = TIMELINE_STAGES.find((s) => s.id === activeStageFilter);
          if (!stageGroup) return true;
          return stageGroup.stageIds.some((sid) => chain.nodeIdsByStage[sid]);
        }),
      }
    : activeGroup;

  const batchRows = filteredGroup.chains.map((c) => deriveBatchRow(c, filteredGroup));

  const selectedChain = selectedChainId
    ? activeGroup.chains.find((c) => c.id === selectedChainId) ?? null
    : null;
  const selectedRow = selectedChainId
    ? batchRows.find((r) => r.chainId === selectedChainId) ?? null
    : null;

  function handleStageClick(stageId: string | null) {
    setActiveStageFilter(stageId);
    setSelectedChainId(null);
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden'}}>
      <StagePipeline
        group={activeGroup}
        activeStageFilter={activeStageFilter}
        onStageClick={handleStageClick}
        selectedChain={selectedChain}
      />

      <Box sx={{display: 'flex', flex: 1, overflow: 'hidden'}}>
        <Box sx={{
          flex: selectedChain ? '0 0 55%' : 1,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          transition: 'flex 0.2s',
        }}>
          <BatchTable
            rows={batchRows}
            selectedChainId={selectedChainId}
            onSelect={setSelectedChainId}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            group={filteredGroup}
          />
        </Box>

        {selectedChain && selectedRow && (
          <Box sx={{flex: '0 0 45%', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
            <BatchDetailPanel
              chain={selectedChain}
              group={activeGroup}
              row={selectedRow}
              onBack={() => setSelectedChainId(null)}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
}
