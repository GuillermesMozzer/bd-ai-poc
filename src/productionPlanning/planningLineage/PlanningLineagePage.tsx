import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from 'react';
import {
  AccessTime as AccessTimeIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Block as BlockIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
  Error as ErrorIcon,
  ErrorOutline as ErrorOutlineIcon,
  FilterList as FilterListIcon,
  History as HistoryIcon,
  Info as InfoIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  Layers as LayersIcon,
  LayersClear as LayersClearIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
  PauseCircle as PauseCircleIcon,
  Remove as RemoveIcon,
  Science as ScienceIcon,
  Verified as VerifiedIcon,
  Warning as WarningIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import StandardDrawer from '../../common/components/StandardDrawer';
import {DEFAULT_LINEAGE_FILTERS, LINEAGE_DEMAND_GROUPS, LINEAGE_STAGES} from './mock';
import type {
  LineageChain,
  LineageDemandGroup,
  LineageFilterState,
  LineageNode,
  LineageNodeStatus,
  LineagePathStep,
  LineageStageConfig,
  LineageStageId,
} from './types';
import AgenticView from './AgenticView';
import TimelineView from './TimelineView';

// ─── Internal types ──────────────────────────────────────────────────────────

type ParentGroup = {
  parentKey: string;
  nodes: LineageNode[];
  firstChainIdx: number;
  spanCount: number;
};

type ConnectionLine = {
  chainId: string;
  fromNodeId: string;
  toNodeId: string;
  isSimulation: boolean;
  color: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type DeleteTargetNode = {
  chainId: string;
  nodeId: string;
  stageId: LineageStageId;
  label: string;
};

type CreateNodeTarget = {
  parentNode: LineageNode;
  chain: LineageChain;
  demandGroup: LineageDemandGroup;
  nextStageId: LineageStageId;
};

// ─── Stage → page navigation map ─────────────────────────────────────────────

const STAGE_TO_PAGE_ID: Partial<Record<LineageStageId, string>> = {
  demand:                   'twelve-month-plan',
  mps:                      'monthly-mps',
  mrp:                      'mrp',
  'planned-order':          'mrp',
  'production-order':       'work-orders',
  schedule:                 'schedule-versions',
  'wo-release':             'work-orders',
  execution:                'work-orders',
  'batch-produced':         'batch-release',
  'material-lot-genealogy': 'batch-release',
  'ipc-quality':            'quality-inspections',
  deviations:               'quality-inspections',
  sterilization:            'sterilization',
  'dhr-documentation':      'batch-release',
  'batch-release-decision': 'batch-release',
  'final-disposition':      'batch-release',
};

const NEXT_STAGE: Partial<Record<LineageStageId, LineageStageId>> = {
  demand:            'mps',
  mps:               'mrp',
  mrp:               'planned-order',
  'planned-order':   'production-order',
  'production-order':'schedule',
};

const STAGE_LABELS: Partial<Record<LineageStageId, string>> = {
  demand:                   'Demand',
  mps:                      'MPS',
  mrp:                      'MRP',
  'planned-order':          'Planned Order',
  'production-order':       'Production Order / WO',
  schedule:                 'Schedule',
  'wo-release':             'WO Release',
  execution:                'Execution',
  'batch-produced':         'Batch Produced',
  'material-lot-genealogy': 'Material Lot Genealogy',
  'ipc-quality':            'IPC / Quality',
  deviations:               'Deviations / QNs',
  sterilization:            'Sterilization',
  'dhr-documentation':      'DHR / Documentation',
  'batch-release-decision': 'Batch Release Decision',
  'final-disposition':      'Final Disposition',
};

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<LineageNodeStatus, {bg: string; border: string; icon: string}> = {
  approved:          {bg: '#ECFDF3', border: '#86EFAC',  icon: '#16A34A'},
  warning:           {bg: '#FFF7ED', border: '#FED7AA',  icon: '#F97316'},
  critical:          {bg: '#FEF2F2', border: '#FECACA',  icon: '#EF4444'},
  simulation:        {bg: '#EEF2FF', border: '#C7D2FE',  icon: '#6D28D9'},
  draft:             {bg: '#F8FAFC', border: '#CBD5E1',  icon: '#64748B'},
  ready:             {bg: '#F0FDF4', border: '#86EFAC',  icon: '#15803D'},
  blocked:           {bg: '#FEF2F2', border: '#FECACA',  icon: '#DC2626'},
  released:          {bg: '#ECFDF5', border: '#6EE7B7',  icon: '#047857'},
  'on-hold':         {bg: '#FFFBEB', border: '#FDE68A',  icon: '#B45309'},
  rejected:          {bg: '#FFF1F2', border: '#FECDD3',  icon: '#BE123C'},
  'not-applicable':  {bg: '#F8FAFC', border: '#CBD5E1',  icon: '#64748B'},
  stale:             {bg: '#FEFCE8', border: '#FEF08A',  icon: '#A16207'},
  superseded:        {bg: '#F5F3FF', border: '#DDD6FE',  icon: '#7C3AED'},
};

const STAGE_PLURAL_LABELS: Partial<Record<LineageStageId, string>> = {
  demand:                   'Demand Baselines',
  mps:                      'MPS Versions',
  mrp:                      'MRP Plans',
  'planned-order':          'Planned Orders',
  'production-order':       'Production Orders',
  schedule:                 'Schedule Versions',
  'wo-release':             'WO Releases',
  execution:                'Execution Records',
  'batch-produced':         'Batches',
  'material-lot-genealogy': 'Material Lots',
  'ipc-quality':            'IPC / QA Records',
  deviations:               'Deviation Records',
  sterilization:            'Sterilization Records',
  'dhr-documentation':      'DHR Records',
  'batch-release-decision': 'Release Decisions',
  'final-disposition':      'Disposition Records',
};

function parseQty(s: string | undefined): number {
  if (!s) return 0;
  return parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
}

function formatQty(n: number): string {
  return n > 0 ? n.toLocaleString('en-US') : '';
}

function getNodeGroupingParentKey(node: LineageNode, chain: LineageChain, stageId: LineageStageId): string {
  if (stageId === 'batch-produced') {
    const poNode = chain.nodes.find((candidate) => candidate.id === node.parentNodeId);
    if (poNode?.parentNodeId) return poNode.parentNodeId;
  }
  return node.parentNodeId ?? `__${node.id}__`;
}

// All stages in LINEAGE_STAGES are data columns. The leftmost row-header column
// (demand group label) is a separate fixed-width area not part of LINEAGE_STAGES.
const ROW_HEADER_WIDTH = 180;
const CONTENT_STAGES = LINEAGE_STAGES;
const ALL_GROUPABLE_STAGE_IDS = CONTENT_STAGES.map((s) => s.id as LineageStageId);
const TOTAL_GRID_WIDTH = ROW_HEADER_WIDTH + LINEAGE_STAGES.reduce((sum, s) => sum + s.widthPx, 0);
const GRID_TEMPLATE = `${ROW_HEADER_WIDTH}px ${CONTENT_STAGES.map((s) => `${s.widthPx}px`).join(' ')}`;

// ─── StatusIcon ──────────────────────────────────────────────────────────────

function StatusIcon({status, size = 14}: {status: LineageNodeStatus; size?: number}) {
  const color = STATUS_STYLES[status].icon;
  const sx = {fontSize: size, color};
  if (status === 'approved')         return <CheckCircleIcon sx={sx} />;
  if (status === 'warning')          return <WarningIcon sx={sx} />;
  if (status === 'critical')         return <ErrorIcon sx={sx} />;
  if (status === 'simulation')       return <ScienceIcon sx={sx} />;
  if (status === 'ready')            return <CheckCircleIcon sx={sx} />;
  if (status === 'blocked')          return <BlockIcon sx={sx} />;
  if (status === 'released')         return <VerifiedIcon sx={sx} />;
  if (status === 'on-hold')          return <PauseCircleIcon sx={sx} />;
  if (status === 'rejected')         return <CancelIcon sx={sx} />;
  if (status === 'not-applicable')   return <RemoveIcon sx={sx} />;
  if (status === 'stale')            return <AccessTimeIcon sx={sx} />;
  if (status === 'superseded')       return <HistoryIcon sx={sx} />;
  return <InfoIcon sx={sx} />;
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({status, label}: {status: LineageNodeStatus; label?: string}) {
  const s = STATUS_STYLES[status];
  return (
    <Chip
      size="small"
      icon={<StatusIcon status={status} size={10} />}
      label={label ?? status}
      sx={{
        height: 18,
        fontSize: 10,
        fontWeight: 700,
        bgcolor: s.bg,
        color: s.icon,
        border: `1px solid ${s.border}`,
        '& .MuiChip-icon': {color: s.icon, ml: 0.5},
      }}
    />
  );
}

// ─── NodeTooltipContent ──────────────────────────────────────────────────────

function TooltipRow({label, value}: {label: string; value?: string}) {
  if (!value) return null;
  return (
    <Box sx={{display: 'flex', gap: 0.8, alignItems: 'baseline'}}>
      <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)', fontWeight: 600, flexShrink: 0, minWidth: 60}}>{label}</Typography>
      <Typography sx={{fontSize: 10, color: '#F1F5F9', fontFamily: 'monospace'}}>{value}</Typography>
    </Box>
  );
}

const STAGE_TITLES: Partial<Record<string, string>> = {
  demand:                   'Demand Baseline',
  mps:                      'Master Production Schedule',
  mrp:                      'Material Requirements Plan',
  'planned-order':          'Planned Order',
  'production-order':       'Production Order / Work Order',
  schedule:                 'Schedule Version',
  'wo-release':             'WO Release Readiness',
  execution:                'Execution / Confirmations',
  'batch-produced':         'Batch Record',
  'material-lot-genealogy': 'Material Lot Genealogy',
  'ipc-quality':            'IPC / Quality Inspections',
  deviations:               'Deviations / QNs / Holds',
  sterilization:            'Sterilization',
  'dhr-documentation':      'DHR / Documentation Review',
  'batch-release-decision': 'Batch Release Decision',
  'final-disposition':      'Final Disposition / Audit Trail',
};

function NodeTooltipContent({node}: {node: LineageNode}) {
  const title = STAGE_TITLES[node.stageId] ?? node.stageId;
  return (
    <Box sx={{p: 0.5, maxWidth: 260}}>
      <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 0.8}}>
        {title}
      </Typography>
      <TooltipRow label="ID" value={node.label} />
      <TooltipRow label="Date" value={node.sublabel} />
      <TooltipRow label="Quantity" value={node.quantity} />
      <TooltipRow label="Status" value={node.statusLabel} />
      <TooltipRow label="Detail 1" value={node.metaLine1} />
      <TooltipRow label="Detail 2" value={node.metaLine2} />
      <TooltipRow label="Detail 3" value={node.metaLine3} />
      <TooltipRow label="Source" value={node.sourceSystem} />
    </Box>
  );
}

// ─── NodeCard ────────────────────────────────────────────────────────────────

type NodeCardProps = {
  node: LineageNode;
  demandColor: string;
  isOnSelectedChain: boolean;
  isSelected: boolean;
  dimmed: boolean;
  nodeRef: (el: HTMLDivElement | null) => void;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDelete?: () => void;
  onNavigate?: () => void;
  onCreateChild?: () => void;
  isExpandable?: boolean;
};

function NodeCard({node, demandColor, isOnSelectedChain, isSelected, dimmed, nodeRef, onClick, onMouseEnter, onMouseLeave, onDelete, onNavigate, onCreateChild}: NodeCardProps) {
  const canCreateChild = NEXT_STAGE[node.stageId] !== undefined;
  const s = STATUS_STYLES[node.status];
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

  function handleMenuOpen(e: React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
  }

  function handleMenuClose(e?: React.MouseEvent) {
    e?.stopPropagation();
    setMenuAnchor(null);
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    setMenuAnchor(null);
    onDelete?.();
  }

  return (
    <Paper
      ref={nodeRef}
      elevation={0}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sx={{
        width: '100%',
        maxWidth: 180,
        border: `1px solid ${isOnSelectedChain ? demandColor : s.border}`,
        bgcolor: s.bg,
        borderRadius: 2,
        p: 1,
        cursor: 'pointer',
        outline: isSelected ? `2px solid ${demandColor}` : isOnSelectedChain ? `1.5px solid color-mix(in srgb, ${demandColor} 38%, transparent)` : '2px solid transparent',
        outlineOffset: 2,
        transition: 'all 0.15s',
        opacity: dimmed ? 0.35 : 1,
        '&:hover': {borderColor: demandColor, opacity: 1},
        '&:hover .node-action-btn': {opacity: 1},
        zIndex: 1,
        position: 'relative',
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5, mb: 0.3}}>
        <Typography sx={{fontSize: 11, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', lineHeight: 1.3, wordBreak: 'break-all'}}>
          {node.label}
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.3, flexShrink: 0}}>
          <StatusIcon status={node.status} size={13} />
          {onDelete && (
            <IconButton
              className="node-action-btn"
              size="small"
              onClick={handleMenuOpen}
              sx={{
                p: 0.2, opacity: 0, transition: 'opacity 0.15s',
                color: 'var(--planning-text-muted)',
                '&:hover': {color: '#EF4444', bgcolor: '#FEF2F2'},
              }}
            >
              <MoreVertIcon sx={{fontSize: 13}} />
            </IconButton>
          )}
        </Box>
      </Box>
      {node.sublabel && (
        <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', lineHeight: 1.2}}>{node.sublabel}</Typography>
      )}
      {node.quantity && (
        <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-primary)', mt: 0.3, lineHeight: 1.2}}>
          {node.quantity}
        </Typography>
      )}
      {node.metaLine1 && (
        <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', mt: 0.2, lineHeight: 1.2}}>{node.metaLine1}</Typography>
      )}
      {node.metaLine2 && (
        <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', lineHeight: 1.2}}>{node.metaLine2}</Typography>
      )}
      {node.metaLine3 && (
        <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', lineHeight: 1.2}}>{node.metaLine3}</Typography>
      )}
      <Box sx={{mt: 0.5, display: 'flex', flexWrap: 'wrap', gap: 0.4}}>
        {node.hasRiskIndicator && (
          <Chip
            icon={<ErrorOutlineIcon sx={{fontSize: 9, color: '#DC2626 !important'}} />}
            label="Blocker"
            size="small"
            sx={{height: 16, fontSize: 9, fontWeight: 800, bgcolor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', '& .MuiChip-icon': {ml: 0.3}}}
          />
        )}
        {node.hasAuditFlag && (
          <Chip
            label="Modified"
            size="small"
            sx={{height: 16, fontSize: 9, fontWeight: 800, bgcolor: '#FFF7ED', color: '#B45309', border: '1px solid #FED7AA'}}
          />
        )}
        {node.statusLabel && <StatusBadge status={node.status} label={node.statusLabel} />}
        {node.sharedAcrossChains && (
          <Chip
            label="1:N"
            size="small"
            sx={{
              height: 16, fontSize: 9, fontWeight: 800,
              bgcolor: '#F0F9FF', color: '#0369A1',
              border: '1px solid #BAE6FD',
            }}
          />
        )}
      </Box>

      {onNavigate && (
        <Button
          size="small"
          variant="text"
          endIcon={<OpenInNewIcon sx={{fontSize: 10}} />}
          onClick={(e) => { e.stopPropagation(); onNavigate(); }}
          sx={{
            mt: 0.8,
            fontSize: 10,
            fontWeight: 700,
            py: 0.3,
            px: 0.8,
            minWidth: 0,
            textTransform: 'none',
            color: '#1D4ED8',
            lineHeight: 1.2,
            '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)'},
          }}
        >
          Go to
        </Button>
      )}

      {canCreateChild && (
        <Box
          className="node-action-btn"
          sx={{
            position: 'absolute',
            right: -16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 10,
            opacity: 0,
            transition: 'opacity 0.15s',
          }}
        >
          <IconButton
            size="small"
            onClick={(e) => { e.stopPropagation(); onCreateChild?.(); }}
            sx={{
              p: 0.3,
              bgcolor: '#ECFDF3',
              border: '1.5px solid #86EFAC',
              color: '#16A34A',
              '&:hover': {bgcolor: '#D1FAE5', borderColor: '#4ADE80'},
              boxShadow: '0 1px 4px 0 #00000018',
            }}
          >
            <AddCircleOutlineIcon sx={{fontSize: 16}} />
          </IconButton>
        </Box>
      )}

      {onDelete && (
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
          onClick={(e) => e.stopPropagation()}
          slotProps={{paper: {elevation: 3, sx: {minWidth: 160, borderRadius: 1.5}}}}
        >
          <MenuItem
            onClick={handleDelete}
            sx={{fontSize: 12, color: '#EF4444', gap: 1, py: 0.8}}
          >
            <DeleteOutlineIcon sx={{fontSize: 15}} />
            Delete Version
          </MenuItem>
        </Menu>
      )}
    </Paper>
  );
}

// ─── EmptyCell ───────────────────────────────────────────────────────────────

function EmptyCell() {
  return (
    <Box sx={{
      width: '100%', maxWidth: 180, height: 40,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Typography sx={{fontSize: 16, color: '#CBD5E1', fontWeight: 300}}>—</Typography>
    </Box>
  );
}

// ─── GroupedStageCard ────────────────────────────────────────────────────────

type GroupedStageCardProps = {
  nodes: LineageNode[];
  stageId: LineageStageId;
  demandColor: string;
  isExpanded: boolean;
  onToggle: () => void;
  nodeRef: (el: HTMLDivElement | null) => void;
  makeNodeRef: (nodeId: string) => (el: HTMLDivElement | null) => void;
  selectedChainId: string | null;
  hoveredChainId: string | null;
  onChainSelect: (chainId: string) => void;
  onChainHover: (chainId: string | null) => void;
};

function GroupedStageCard({
  nodes, stageId, demandColor, isExpanded, onToggle,
  nodeRef, makeNodeRef, selectedChainId, hoveredChainId, onChainSelect, onChainHover,
}: GroupedStageCardProps) {
  const totalQty = nodes.reduce((acc, n) => acc + parseQty(n.quantity), 0);
  const statusGroups = nodes.reduce<Record<string, {status: LineageNodeStatus; count: number}>>((acc, n) => {
    const key = n.statusLabel ?? n.status;
    if (!acc[key]) acc[key] = {status: n.status, count: 0};
    acc[key].count++;
    return acc;
  }, {});
  const dominantStatus = (
    (['critical', 'blocked', 'rejected', 'on-hold', 'warning', 'simulation', 'superseded', 'stale', 'draft', 'ready', 'released', 'approved', 'not-applicable'] as LineageNodeStatus[])
      .find(s => nodes.some(n => n.status === s))
  ) ?? 'draft';
  const s = STATUS_STYLES[dominantStatus];

  const depth = Math.min(nodes.length - 1, 2);
  const stackShadow = [
    depth >= 1 ? `4px 4px 0 0 #CBD5E1` : '',
    depth >= 2 ? `8px 8px 0 0 #E2E8F0` : '',
  ].filter(Boolean).join(', ');

  const stageLabel = STAGE_PLURAL_LABELS[stageId] ?? stageId;

  return (
    <Box sx={{width: '100%', maxWidth: 195, display: 'flex', flexDirection: 'column', gap: 1, pb: depth > 0 ? `${depth * 4}px` : 0}}>
      {/* Summary card with stacked shadow effect */}
      <Paper
        ref={nodeRef}
        elevation={0}
        sx={{
          width: '100%',
          border: `1px solid ${s.border}`,
          bgcolor: s.bg,
          borderRadius: 2,
          p: 1,
          boxShadow: stackShadow || 'none',
          position: 'relative',
        }}
      >
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.5, mb: 0.3}}>
          <Typography sx={{fontSize: 11, fontWeight: 800, color: '#0F172A', lineHeight: 1.3}}>
            {nodes.length} {stageLabel}
          </Typography>
          <StatusIcon status={dominantStatus} size={13} />
        </Box>

        {totalQty > 0 && (
          <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-primary)', mb: 0.5, lineHeight: 1.2}}>
            Total: {formatQty(totalQty)}
          </Typography>
        )}

        <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.4, mb: 0.5}}>
          {Object.entries(statusGroups).map(([label, {status, count}]) => (
            <StatusBadge key={label} status={status} label={`${label} ${count}`} />
          ))}
        </Box>

        <Button
          size="small"
          variant="text"
          onClick={onToggle}
          endIcon={isExpanded
            ? <KeyboardArrowDownIcon sx={{fontSize: 10}} />
            : <KeyboardArrowRightIcon sx={{fontSize: 10}} />}
          sx={{
            fontSize: 10, fontWeight: 700, py: 0.2, px: 0.6,
            minWidth: 0, textTransform: 'none', color: '#1D4ED8',
            '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)'},
          }}
        >
          {isExpanded ? 'Recolher' : `${nodes.length} itens`}
        </Button>
      </Paper>

      {/* Expanded individual cards */}
      {isExpanded && (
        <Stack spacing={1}>
          {nodes.map((node) => (
            <Tooltip
              key={node.id}
              title={<NodeTooltipContent node={node} />}
              enterDelay={500}
              arrow
              placement="top"
            >
              <Box sx={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                <NodeCard
                  node={node}
                  demandColor={demandColor}
                  isOnSelectedChain={false}
                  isSelected={false}
                  dimmed={Boolean(selectedChainId)}
                  nodeRef={makeNodeRef(node.id)}
                  onClick={() => {}}
                  onMouseEnter={() => {}}
                  onMouseLeave={() => {}}
                />
              </Box>
            </Tooltip>
          ))}
        </Stack>
      )}
    </Box>
  );
}

// ─── BezierPath ──────────────────────────────────────────────────────────────

type BezierPathProps = ConnectionLine & {isSelected: boolean; isHovered: boolean};

function BezierPath({x1, y1, x2, y2, color, isSimulation, isSelected, isHovered}: BezierPathProps) {
  const dx = x2 - x1;
  const cx1 = x1 + dx * 0.45;
  const cx2 = x1 + dx * 0.55;
  const opacity = isSelected ? 1 : isHovered ? 0.7 : 0.28;
  const strokeWidth = isSelected ? 2.5 : 1.5;
  return (
    <path
      d={`M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeDasharray={isSimulation ? '6 4' : undefined}
      fill="none"
      opacity={opacity}
      strokeLinecap="round"
    />
  );
}

// ─── StageHeaderRow ──────────────────────────────────────────────────────────

function StageHeaderRow({
  stages,
  groupedStages,
  onToggleStageGroup,
}: {
  stages: LineageStageConfig[];
  groupedStages: Set<LineageStageId>;
  onToggleStageGroup: (id: LineageStageId) => void;
}) {
  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: GRID_TEMPLATE,
      position: 'sticky',
      top: 0,
      zIndex: 10,
      bgcolor: 'var(--planning-surface-muted)',
      borderBottom: '2px solid #E2E8F0',
      boxShadow: '0 1px 4px 0 #0000000A',
      isolation: 'isolate',
    }}>
      <Box sx={{p: 1.5, display: 'flex', alignItems: 'center'}}>
        <Typography sx={{fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em'}}>
          Group
        </Typography>
      </Box>
      {stages.map((stage, idx) => (
        <Box
          key={stage.id}
          sx={{
            p: 1.5,
            borderLeft: '1px solid #E2E8F0',
            display: 'flex',
            flexDirection: 'column',
            gap: 0.3,
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
            <Box sx={{
              width: 20, height: 20, borderRadius: '50%',
              bgcolor: '#1D4ED8', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 800, flexShrink: 0,
            }}>
              {idx + 1}
            </Box>
            <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-primary)', lineHeight: 1.3}}>
              {stage.label}
            </Typography>
            {(
              <Tooltip title={groupedStages.has(stage.id as LineageStageId) ? 'Desagrupar coluna' : 'Agrupar coluna'}>
                <IconButton
                  size="small"
                  onClick={() => onToggleStageGroup(stage.id as LineageStageId)}
                  sx={{
                    p: 0.3, ml: 'auto',
                    color: groupedStages.has(stage.id as LineageStageId) ? '#1D4ED8' : '#94A3B8',
                    bgcolor: groupedStages.has(stage.id as LineageStageId) ? '#EEF2FF' : 'transparent',
                    border: `1px solid ${groupedStages.has(stage.id as LineageStageId) ? '#C7D2FE' : 'transparent'}`,
                    borderRadius: 1,
                    '&:hover': {bgcolor: 'var(--planning-ai-accent-bg)', color: '#1D4ED8'},
                  }}
                >
                  {groupedStages.has(stage.id as LineageStageId)
                    ? <LayersClearIcon sx={{fontSize: 14}} />
                    : <LayersIcon sx={{fontSize: 14}} />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
}

// ─── DemandGroupRow ──────────────────────────────────────────────────────────

type DemandGroupRowProps = {
  group: LineageDemandGroup;
  isExpanded: boolean;
  onToggle: () => void;
  selectedChainId: string | null;
  hoveredChainId: string | null;
  nodeRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  onChainSelect: (chainId: string) => void;
  onChainHover: (chainId: string | null) => void;
  onDeleteChain: (chainId: string, nodeId: string, stageId: LineageStageId, label: string) => void;
  onNavigate?: (pageId: string, versionId: string) => void;
  onCreateChild: (node: LineageNode, chain: LineageChain, group: LineageDemandGroup) => void;
  groupedStages: Set<LineageStageId>;
  expandedGroupCells: Set<string>;
  onToggleGroupCell: (demandGroupId: string, stageId: LineageStageId, parentKey: string) => void;
};

function DemandGroupRow({group, isExpanded, onToggle, selectedChainId, hoveredChainId, nodeRefs, onChainSelect, onChainHover, onDeleteChain, onNavigate, onCreateChild, groupedStages, expandedGroupCells, onToggleGroupCell}: DemandGroupRowProps) {
  const chainCount = group.chains.length;

  const makeNodeRef = useCallback((nodeId: string) => (el: HTMLDivElement | null) => {
    if (el) nodeRefs.current.set(nodeId, el);
    else nodeRefs.current.delete(nodeId);
  }, [nodeRefs]);

  // Detect nodes that appear in more than one chain at the same stage
  const sharedNodesByStage = useMemo<Map<string, Set<string>>>(() => {
    const map = new Map<string, Set<string>>();
    CONTENT_STAGES.forEach((stage) => {
      const countById = new Map<string, number>();
      group.chains.forEach((chain) => {
        const nid = chain.nodeIdsByStage[stage.id];
        if (nid) countById.set(nid, (countById.get(nid) ?? 0) + 1);
      });
      countById.forEach((count, nid) => {
        if (count > 1) {
          if (!map.has(stage.id)) map.set(stage.id, new Set());
          map.get(stage.id)!.add(nid);
        }
      });
    });
    return map;
  }, [group.chains]);

  // For each shared nodeId: the first chain row index and how many rows it spans
  const sharedNodeSpans = useMemo<Map<string, {firstRow: number; spanCount: number}>>(() => {
    const spans = new Map<string, {firstRow: number; spanCount: number}>();
    CONTENT_STAGES.forEach((stage) => {
      const sharedIds = sharedNodesByStage.get(stage.id);
      if (!sharedIds) return;
      sharedIds.forEach((nid) => {
        const rowIndices = group.chains
          .map((chain, idx) => (chain.nodeIdsByStage[stage.id] === nid ? idx : -1))
          .filter((i) => i >= 0);
        spans.set(nid, {firstRow: rowIndices[0], spanCount: rowIndices.length});
      });
    });
    return spans;
  }, [sharedNodesByStage, group.chains]);

  const groupedStageCells = useMemo(() => {
    const result = new Map<LineageStageId, {owners: Map<number, ParentGroup>; covered: Set<number>}>();
    CONTENT_STAGES.forEach((stage) => {
      const stageId = stage.id as LineageStageId;
      if (!groupedStages.has(stageId)) return;

      const parentGroupMap = new Map<string, {nodes: LineageNode[]; chainIndices: number[]}>();
      group.chains.forEach((chain, idx) => {
        const node = chain.nodes.find((n) => n.stageId === stageId);
        if (!node) return;
        const parentKey = getNodeGroupingParentKey(node, chain, stageId);
        if (!parentGroupMap.has(parentKey)) parentGroupMap.set(parentKey, {nodes: [], chainIndices: []});
        const pg = parentGroupMap.get(parentKey)!;
        if (!pg.nodes.find((n) => n.id === node.id)) pg.nodes.push(node);
        pg.chainIndices.push(idx);
      });

      if (parentGroupMap.size === 0) return;

      const owners = new Map<number, ParentGroup>();
      const covered = new Set<number>();
      parentGroupMap.forEach(({nodes, chainIndices}, parentKey) => {
        if (chainIndices.length <= 1) return;
        const sorted = [...chainIndices].sort((a, b) => a - b);
        const firstChainIdx = sorted[0];
        const lastChainIdx = sorted[sorted.length - 1];
        const spanCount = lastChainIdx - firstChainIdx + 1;
        owners.set(firstChainIdx, {parentKey, nodes, firstChainIdx, spanCount});
        for (let i = firstChainIdx + 1; i <= lastChainIdx; i++) covered.add(i);
      });

      result.set(stageId, {owners, covered});
    });
    return result;
  }, [group.chains, groupedStages]);

  return (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: GRID_TEMPLATE,
      gridTemplateRows: isExpanded ? `repeat(${chainCount}, auto)` : '1fr',
      borderBottom: '1px solid var(--planning-border)',
    }}>
      {/* Row header — spans all chain sub-rows */}
      <Box sx={{
        gridColumn: 1,
        gridRow: isExpanded ? `1 / span ${chainCount}` : 1,
        borderLeft: `4px solid ${group.color}`,
        borderRight: '1px solid #E2E8F0',
        p: 1.5,
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        bgcolor: `color-mix(in srgb, ${group.color} 3%, transparent)`,
        alignSelf: 'stretch',
        minHeight: isExpanded ? undefined : 48,
      }}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
          <IconButton size="small" onClick={onToggle} sx={{p: 0.2, color: 'var(--planning-text-secondary)', '&:hover': {bgcolor: `color-mix(in srgb, ${group.color} 9%, transparent)`}}}>
            {isExpanded ? <KeyboardArrowDownIcon sx={{fontSize: 16}} /> : <KeyboardArrowRightIcon sx={{fontSize: 16}} />}
          </IconButton>
          <Typography sx={{fontSize: 13, fontWeight: 900, color: '#0F172A', lineHeight: 1.2}}>
            {group.demandLabel}
          </Typography>
        </Box>
        {isExpanded && (
          <>
            <Typography sx={{fontSize: 11, color: '#475569', lineHeight: 1.3, pl: 3.5}}>
              {group.product}
            </Typography>
            <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', lineHeight: 1.2, pl: 3.5}}>
              {group.line}
            </Typography>
            <Typography sx={{fontSize: 10, fontWeight: 700, color: 'var(--planning-text-primary)', lineHeight: 1.2, pl: 3.5}}>
              {group.quantity}
            </Typography>
            <Box sx={{pl: 3.5}}>
              <StatusBadge status={group.status} label={
                group.status === 'approved' ? 'On Track' :
                group.status === 'warning'  ? 'At Risk' :
                group.status === 'critical' ? 'Critical' :
                group.status === 'draft'    ? 'Ad Hoc' :
                group.status === 'blocked'  ? 'Blocked' :
                group.status === 'released' ? 'Released' :
                group.status
              } />
            </Box>
          </>
        )}
      </Box>

      {/* Chain rows */}
      {group.chains.map((chain, chainIdx) => {
        const isChainSelected = selectedChainId === chain.id;
        const isChainHovered = hoveredChainId === chain.id;
        const someChainSelected = Boolean(selectedChainId);

        return CONTENT_STAGES.map((stage, stageIdx) => {
          const stageId = stage.id as LineageStageId;
          const groupInfo = groupedStageCells.get(stageId);

          // Grouped stage rendering — only for chains that are actually part of a multi-node group
          if (groupInfo && (groupInfo.covered.has(chainIdx) || groupInfo.owners.has(chainIdx))) {
            // Covered by a spanning grouped card → hidden placeholder
            if (groupInfo.covered.has(chainIdx)) {
              return <Box key={`${chain.id}-${stageId}-covered`} sx={{display: 'none'}} />;
            }

            // Owner of a parent group → render GroupedStageCard
            const ownerGroup = groupInfo.owners.get(chainIdx)!;
            const groupCellKey = `${group.id}::${stageId}::${ownerGroup.parentKey}`;
            const isGroupCellExpanded = expandedGroupCells.has(groupCellKey);
            return (
              <Box
                key={`grouped-${group.id}-${stageId}-${ownerGroup.parentKey}`}
                sx={{
                  gridColumn: stageIdx + 2,
                  gridRow: isExpanded ? `${ownerGroup.firstChainIdx + 1} / span ${ownerGroup.spanCount}` : 1,
                  display: isExpanded ? 'flex' : 'none',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  p: 1,
                  borderLeft: '1px solid #E2E8F0',
                  minHeight: 90,
                  pt: 1.5,
                }}
              >
                <GroupedStageCard
                  nodes={ownerGroup.nodes}
                  stageId={stageId}
                  demandColor={group.color}
                  isExpanded={isGroupCellExpanded}
                  onToggle={() => onToggleGroupCell(group.id, stageId, ownerGroup.parentKey)}
                  nodeRef={makeNodeRef(ownerGroup.nodes[0].id)}
                  makeNodeRef={makeNodeRef}
                  selectedChainId={selectedChainId}
                  hoveredChainId={hoveredChainId}
                  onChainSelect={onChainSelect}
                  onChainHover={onChainHover}
                />
              </Box>
            );
          }

          // Non-grouped stage: standard rendering
          const node = chain.nodes.find((n) => n.stageId === stageId) ?? null;
          const nodeId = chain.nodeIdsByStage[stageId];
          const isShared = nodeId ? (sharedNodesByStage.get(stageId)?.has(nodeId) ?? false) : false;
          const span = nodeId ? sharedNodeSpans.get(nodeId) : undefined;
          const isOwnerRow = span ? chainIdx === span.firstRow : true;

          if (isShared && !isOwnerRow) {
            return <Box key={`${chain.id}-${stageId}`} sx={{display: 'none'}} />;
          }

          const isNodeOnSelectedChain = isChainSelected;
          const isDimmed = someChainSelected && !isChainSelected;
          const canDelete = chain.isSimulation && Boolean(node?.isSimulation);
          const handleDelete = canDelete && node
            ? () => onDeleteChain(chain.id, node.id, stageId, node.label)
            : undefined;

          const navPageId = node?.linkedPageId ?? (node ? STAGE_TO_PAGE_ID[node.stageId] : undefined);
          const handleNavigate = node && navPageId && onNavigate
            ? () => onNavigate(navPageId, node.linkedVersionId ?? node.id)
            : undefined;

          const handleCreateChildNode = node && NEXT_STAGE[node.stageId]
            ? () => onCreateChild(node, chain, group)
            : undefined;

          const gridRowValue = isShared && span
            ? `${span.firstRow + 1} / span ${span.spanCount}`
            : chainIdx + 1;

          return (
            <Box
              key={`${chain.id}-${stageId}`}
              sx={{
                gridColumn: stageIdx + 2,
                gridRow: gridRowValue,
                p: 1,
                display: isExpanded ? 'flex' : 'none',
                alignItems: 'center',
                justifyContent: 'center',
                borderLeft: stageIdx === 0 ? '1px solid #E2E8F0' : 'none',
                borderBottom: chainIdx < chainCount - 1 ? '1px dashed #E2E8F0' : 'none',
                bgcolor: isChainHovered && !someChainSelected
                  ? `color-mix(in srgb, ${group.color} 2%, transparent)`
                  : chain.isSimulation
                    ? '#EEF2FF28'
                    : 'transparent',
                transition: 'background-color 0.12s',
                minHeight: 90,
              }}
              onMouseEnter={() => onChainHover(chain.id)}
              onMouseLeave={() => onChainHover(null)}
            >
              {node ? (
                <Tooltip
                  title={<NodeTooltipContent node={node} />}
                  enterDelay={500}
                  arrow
                  placement="top"
                >
                  <Box sx={{width: '100%', display: 'flex', justifyContent: 'center'}}>
                    <NodeCard
                      node={node}
                      demandColor={group.color}
                      isOnSelectedChain={isNodeOnSelectedChain}
                      isSelected={isNodeOnSelectedChain}
                      dimmed={isDimmed}
                      nodeRef={makeNodeRef(node.id)}
                      onClick={() => onChainSelect(chain.id)}
                      onMouseEnter={() => onChainHover(chain.id)}
                      onMouseLeave={() => onChainHover(null)}
                      onDelete={handleDelete}
                      onNavigate={handleNavigate}
                      onCreateChild={handleCreateChildNode}
                    />
                  </Box>
                </Tooltip>
              ) : (
                <EmptyCell />
              )}
            </Box>
          );
        });
      })}
    </Box>
  );
}

// ─── DeleteChainDialog ───────────────────────────────────────────────────────

type DeleteChainDialogProps = {
  open: boolean;
  target: DeleteTargetNode | null;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteChainDialog({open, target, onClose, onConfirm}: DeleteChainDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{display: 'flex', alignItems: 'center', gap: 1, pb: 1}}>
        <WarningAmberIcon sx={{color: '#EF4444', fontSize: 20}} />
        <Typography sx={{fontSize: 15, fontWeight: 800, color: '#0F172A'}}>Delete Version</Typography>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{fontSize: 13, color: '#374151', mb: 1.5}}>
          Are you sure you want to delete <strong>{target?.label}</strong>? This will remove the entire simulation chain from the lineage view.
        </Typography>
        <Box sx={{
          bgcolor: '#FFF7ED', border: '1px solid #FED7AA', borderRadius: 1.5,
          px: 1.5, py: 1, display: 'flex', alignItems: 'flex-start', gap: 1,
        }}>
          <WarningIcon sx={{fontSize: 14, color: '#F97316', mt: 0.2, flexShrink: 0}} />
          <Typography sx={{fontSize: 11, color: '#92400E', lineHeight: 1.5}}>
            Only simulation versions can be deleted. Approved chains are locked and cannot be removed.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 2, gap: 1}}>
        <Button onClick={onClose} size="small" variant="outlined" sx={{fontSize: 12}}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          size="small"
          variant="contained"
          sx={{fontSize: 12, bgcolor: '#EF4444', '&:hover': {bgcolor: '#DC2626'}}}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── LegendSection ───────────────────────────────────────────────────────────

function LegendSection() {
  return (
    <Box>
      <Typography sx={{fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', mb: 1, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
        Legend
      </Typography>
      <Stack spacing={0.8}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <svg width={32} height={10}><line x1={0} y1={5} x2={32} y2={5} stroke="#1D4ED8" strokeWidth={2} strokeLinecap="round" /></svg>
          <Typography sx={{fontSize: 11, color: '#475569'}}>Official / Primary chain</Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <svg width={32} height={10}><line x1={0} y1={5} x2={32} y2={5} stroke="#6D28D9" strokeWidth={2} strokeDasharray="5 4" strokeLinecap="round" /></svg>
          <Typography sx={{fontSize: 11, color: '#475569'}}>Simulation / Alternative</Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Chip label="1:N" size="small" sx={{height: 16, fontSize: 9, fontWeight: 800, bgcolor: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD'}} />
          <Typography sx={{fontSize: 11, color: '#475569'}}>Shared parent node (branching)</Typography>
        </Box>
      </Stack>
      <Divider sx={{my: 1.2}} />
      <Stack spacing={0.6}>
        {([
          ['released',        'Released / Final'],
          ['approved',        'Approved / On Track'],
          ['ready',           'Ready'],
          ['warning',         'Warning / At Risk'],
          ['critical',        'Critical'],
          ['blocked',         'Blocked'],
          ['on-hold',         'On Hold'],
          ['rejected',        'Rejected'],
          ['simulation',      'Simulation'],
          ['superseded',      'Superseded'],
          ['stale',           'Stale Data'],
          ['not-applicable',  'Not Applicable'],
          ['draft',           'Draft / Ad Hoc'],
        ] as [LineageNodeStatus, string][]).map(([status, label]) => (
          <Box key={status} sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
            <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: STATUS_STYLES[status].icon, flexShrink: 0}} />
            <Typography sx={{fontSize: 11, color: '#475569'}}>{label}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

// ─── SelectedPathPanel ───────────────────────────────────────────────────────

type SelectedPathPanelProps = {
  chain: LineageChain | null;
  demandGroup: LineageDemandGroup | null;
  onClose: () => void;
};

function SelectedPathPanel({chain, demandGroup, onClose}: SelectedPathPanelProps) {
  const steps: LineagePathStep[] = useMemo(() => {
    return LINEAGE_STAGES.map((stage) => ({
      stageId: stage.id as LineageStageId,
      stageLabel: stage.shortLabel,
      node: chain?.nodes.find((n) => n.stageId === stage.id) ?? null,
    }));
  }, [chain]);

  return (
    <Box sx={{
      width: 256,
      flexShrink: 0,
      borderLeft: '1px solid #E2E8F0',
      display: 'flex',
      flexDirection: 'column',
      bgcolor: 'var(--planning-background)',
      overflowY: 'auto',
    }}>
      {/* Header */}
      <Box sx={{
        px: 2, py: 1.5,
        borderBottom: '1px solid var(--planning-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        bgcolor: 'var(--planning-background)',
        zIndex: 1,
      }}>
        <Typography sx={{fontSize: 12, fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em'}}>
          Selected Path
        </Typography>
        {chain && (
          <IconButton size="small" onClick={onClose} sx={{p: 0.4}}>
            <CloseIcon sx={{fontSize: 15}} />
          </IconButton>
        )}
      </Box>

      <Box sx={{p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 2}}>
        {!chain ? (
          <>
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-muted)', textAlign: 'center', mt: 2, lineHeight: 1.6}}>
              Click any card in the diagram to trace the full planning path.
            </Typography>
            <Divider />
            <LegendSection />
          </>
        ) : (
          <>
            {/* Demand context */}
            {demandGroup && (
              <Box sx={{
                borderLeft: `3px solid ${demandGroup.color}`,
                pl: 1.2, py: 0.8,
                bgcolor: `color-mix(in srgb, ${demandGroup.color} 4%, transparent)`,
                borderRadius: '0 6px 6px 0',
              }}>
                <Typography sx={{fontSize: 12, fontWeight: 800, color: '#0F172A'}}>{demandGroup.demandLabel}</Typography>
                <Typography sx={{fontSize: 11, color: '#475569'}}>{demandGroup.product} · {demandGroup.quantity}</Typography>
                <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', mt: 0.2}}>{chain.label}</Typography>
                {chain.isSimulation && (
                  <Chip label="Simulation" size="small" sx={{mt: 0.5, height: 16, fontSize: 9, fontWeight: 700, bgcolor: 'var(--planning-ai-accent-bg)', color: '#6D28D9'}} />
                )}
              </Box>
            )}

            {/* Step list — all 16 stages */}
            <Stack spacing={0.4}>
              {steps.map((step, idx) => (
                <Box
                  key={step.stageId}
                  sx={{
                    display: 'flex', alignItems: 'flex-start', gap: 1,
                    p: 0.8, borderRadius: 1.5,
                    border: '1px solid transparent',
                    '&:hover': step.node ? {bgcolor: 'var(--planning-surface-muted)', borderColor: '#E2E8F0'} : {},
                  }}
                >
                  <Box sx={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    bgcolor: step.node ? (demandGroup?.color ?? '#1D4ED8') : '#E2E8F0',
                    color: step.node ? '#fff' : '#94A3B8',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 800, mt: 0.1,
                  }}>
                    {idx + 1}
                  </Box>
                  <Box sx={{flex: 1, minWidth: 0}}>
                    <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em'}}>
                      {step.stageLabel}
                    </Typography>
                    {step.node ? (
                      <>
                        <Typography sx={{fontSize: 11, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', mt: 0.1}}>
                          {step.node.label}
                        </Typography>
                        {step.node.sublabel && (
                          <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)'}}>{step.node.sublabel}</Typography>
                        )}
                        {step.node.statusLabel && (
                          <StatusBadge status={step.node.status} label={step.node.statusLabel} />
                        )}
                        {step.node.sharedAcrossChains && (
                          <Chip label="Shared node" size="small" sx={{mt: 0.3, height: 14, fontSize: 9, bgcolor: '#F0F9FF', color: '#0369A1', border: '1px solid #BAE6FD'}} />
                        )}
                      </>
                    ) : (
                      <Typography sx={{fontSize: 10, color: '#CBD5E1', fontStyle: 'italic'}}>Not linked</Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Stack>

            <Divider />
            <LegendSection />
          </>
        )}
      </Box>
    </Box>
  );
}

// ─── FilterBar ───────────────────────────────────────────────────────────────

type FilterBarProps = {
  filters: LineageFilterState;
  onChange: (next: LineageFilterState) => void;
  groupedStages: Set<LineageStageId>;
  onGroupAll: () => void;
};

function countActiveFilters(filters: LineageFilterState): number {
  return [
    filters.demandId, filters.status, filters.productCode, filters.batchId,
    filters.woNumber, filters.line, filters.qualityStatus, filters.releaseStatus,
    filters.sterilizationStatus, filters.blockerType, filters.dateFrom, filters.dateTo,
    filters.dataFreshness,
  ].filter(Boolean).length;
}

function FilterBar({filters, onChange, groupedStages, onGroupAll}: FilterBarProps) {
  const allGrouped = ALL_GROUPABLE_STAGE_IDS.every((id) => groupedStages.has(id));
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  const fieldSx = {minWidth: 140, '& .MuiInputBase-root': {fontSize: 12}};

  function clear() {
    onChange({...filters, demandId: '', status: '', productCode: '', batchId: '', woNumber: '', line: '', qualityStatus: '', releaseStatus: '', sterilizationStatus: '', blockerType: '', dateFrom: '', dateTo: '', dataFreshness: ''});
  }

  return (
    <Box sx={{flexShrink: 0, bgcolor: '#fff', borderBottom: '1px solid var(--planning-border)', position: 'sticky', top: 0, zIndex: 20}}>
      {/* Primary bar */}
      <Box sx={{px: 2, py: 1.2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap'}}>
        <Box>
          <Typography sx={{fontSize: 16, fontWeight: 900, color: '#0F172A', lineHeight: 1}}>Production Lineage</Typography>
          <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.2}}>FDA inspection traceability — demand to final disposition</Typography>
        </Box>

        <Divider orientation="vertical" flexItem sx={{mx: 0.5}} />

        <TextField
          select size="small" label="Demand"
          value={filters.demandId}
          onChange={(e) => onChange({...filters, demandId: e.target.value})}
          sx={fieldSx}
        >
          <MenuItem value="">All Demands</MenuItem>
          {LINEAGE_DEMAND_GROUPS.map((g) => (
            <MenuItem key={g.id} value={g.id}>{g.demandLabel} — {g.product}</MenuItem>
          ))}
        </TextField>

        <TextField
          select size="small" label="Status"
          value={filters.status}
          onChange={(e) => onChange({...filters, status: e.target.value})}
          sx={fieldSx}
        >
          <MenuItem value="">All Statuses</MenuItem>
          <MenuItem value="released">Released</MenuItem>
          <MenuItem value="approved">On Track</MenuItem>
          <MenuItem value="ready">Ready</MenuItem>
          <MenuItem value="warning">Warning / At Risk</MenuItem>
          <MenuItem value="critical">Critical</MenuItem>
          <MenuItem value="blocked">Blocked</MenuItem>
          <MenuItem value="on-hold">On Hold</MenuItem>
          <MenuItem value="rejected">Rejected</MenuItem>
          <MenuItem value="simulation">Simulation</MenuItem>
          <MenuItem value="superseded">Superseded</MenuItem>
          <MenuItem value="draft">Draft / Ad Hoc</MenuItem>
        </TextField>

        <TextField
          size="small" label="Batch ID"
          value={filters.batchId}
          onChange={(e) => onChange({...filters, batchId: e.target.value})}
          placeholder="e.g. B260512-A01"
          sx={{minWidth: 160, '& .MuiInputBase-root': {fontSize: 12}}}
        />

        <TextField
          size="small" label="WO Number"
          value={filters.woNumber}
          onChange={(e) => onChange({...filters, woNumber: e.target.value})}
          placeholder="e.g. WO-A-001"
          sx={{minWidth: 140, '& .MuiInputBase-root': {fontSize: 12}}}
        />

        <Button
          size="small"
          variant="text"
          startIcon={<FilterListIcon sx={{fontSize: 14}} />}
          onClick={() => setAdvancedOpen((v) => !v)}
          sx={{
            fontSize: 11, fontWeight: 700, textTransform: 'none', height: 26,
            color: advancedOpen ? '#1D4ED8' : '#64748B',
            '&:hover': {bgcolor: 'var(--planning-surface-muted)'},
          }}
        >
          More Filters
          {activeCount > 0 && (
            <Box component="span" sx={{
              ml: 0.5, px: 0.6, py: 0.1, borderRadius: 1,
              bgcolor: '#1D4ED8', color: '#fff', fontSize: 9, fontWeight: 800,
            }}>
              {activeCount}
            </Box>
          )}
        </Button>

        {activeCount > 0 && (
          <Button size="small" variant="text" onClick={clear} sx={{fontSize: 11, color: 'var(--planning-text-muted)', textTransform: 'none', height: 26}}>
            Clear all
          </Button>
        )}

        <Box sx={{ml: 'auto', display: 'flex', alignItems: 'center', gap: 1}}>
          <Tooltip title={allGrouped ? 'Ungroup all columns' : 'Group all columns'}>
            <Button
              size="small"
              variant={allGrouped ? 'contained' : 'outlined'}
              startIcon={allGrouped ? <LayersClearIcon sx={{fontSize: 14}} /> : <LayersIcon sx={{fontSize: 14}} />}
              onClick={onGroupAll}
              sx={{
                fontSize: 11, fontWeight: 700, textTransform: 'none', height: 26,
                color: allGrouped ? '#fff' : '#475569',
                bgcolor: allGrouped ? '#1D4ED8' : 'transparent',
                borderColor: allGrouped ? '#1D4ED8' : '#CBD5E1',
                '&:hover': {bgcolor: allGrouped ? '#1E40AF' : '#F1F5F9', borderColor: allGrouped ? '#1E40AF' : '#94A3B8'},
              }}
            >
              {allGrouped ? 'Ungroup All' : 'Group All'}
            </Button>
          </Tooltip>
          <Divider orientation="vertical" flexItem />
          {(['flow', 'timeline', 'agentic'] as const).map((mode) => (
            <Chip
              key={mode}
              label={mode === 'flow' ? 'Flow View' : mode === 'timeline' ? 'Timeline View' : (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                  Agentic View
                  <Box component="span" sx={{fontSize: 8, fontWeight: 900, color: filters.viewMode === mode ? '#BBF7D0' : '#16A34A'}}>New</Box>
                </Box>
              )}
              onClick={() => onChange({...filters, viewMode: mode})}
              size="small"
              sx={{
                fontSize: 11, fontWeight: 700, cursor: 'pointer', height: 26,
                bgcolor: filters.viewMode === mode ? '#1D4ED8' : 'transparent',
                color: filters.viewMode === mode ? '#fff' : '#64748B',
                border: `1px solid ${filters.viewMode === mode ? '#1D4ED8' : '#CBD5E1'}`,
                '&:hover': {bgcolor: filters.viewMode === mode ? '#1E40AF' : '#F1F5F9'},
              }}
            />
          ))}
        </Box>
      </Box>

      {/* Advanced filters panel */}
      <Collapse in={advancedOpen}>
        <Box sx={{px: 2, pb: 1.5, borderTop: '1px solid #F1F5F9', display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center', bgcolor: 'var(--planning-surface-muted)'}}>
          <TextField
            size="small" label="Product / Item Code"
            value={filters.productCode}
            onChange={(e) => onChange({...filters, productCode: e.target.value})}
            sx={{minWidth: 160, mt: 1.2, '& .MuiInputBase-root': {fontSize: 12}}}
          />
          <TextField
            select size="small" label="Production Line"
            value={filters.line}
            onChange={(e) => onChange({...filters, line: e.target.value})}
            sx={{minWidth: 130, mt: 1.2, '& .MuiInputBase-root': {fontSize: 12}}}
          >
            <MenuItem value="">All Lines</MenuItem>
            <MenuItem value="Line 1">Line 1</MenuItem>
            <MenuItem value="Line 2">Line 2</MenuItem>
            <MenuItem value="Line 3">Line 3</MenuItem>
            <MenuItem value="Line 4">Line 4</MenuItem>
          </TextField>
          <TextField
            select size="small" label="Quality Status"
            value={filters.qualityStatus}
            onChange={(e) => onChange({...filters, qualityStatus: e.target.value})}
            sx={{minWidth: 140, mt: 1.2, '& .MuiInputBase-root': {fontSize: 12}}}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="approved">Passed</MenuItem>
            <MenuItem value="warning">Open Blocker</MenuItem>
            <MenuItem value="critical">Failed</MenuItem>
          </TextField>
          <TextField
            select size="small" label="Release Status"
            value={filters.releaseStatus}
            onChange={(e) => onChange({...filters, releaseStatus: e.target.value})}
            sx={{minWidth: 140, mt: 1.2, '& .MuiInputBase-root': {fontSize: 12}}}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="released">Released</MenuItem>
            <MenuItem value="on-hold">On Hold</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="draft">Pending Review</MenuItem>
          </TextField>
          <TextField
            select size="small" label="Sterilization Status"
            value={filters.sterilizationStatus}
            onChange={(e) => onChange({...filters, sterilizationStatus: e.target.value})}
            sx={{minWidth: 160, mt: 1.2, '& .MuiInputBase-root': {fontSize: 12}}}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="released">Completed</MenuItem>
            <MenuItem value="on-hold">On Hold</MenuItem>
            <MenuItem value="not-applicable">Not Applicable</MenuItem>
            <MenuItem value="draft">Pending</MenuItem>
          </TextField>
          <TextField
            select size="small" label="Blockers"
            value={filters.blockerType}
            onChange={(e) => onChange({...filters, blockerType: e.target.value})}
            sx={{minWidth: 130, mt: 1.2, '& .MuiInputBase-root': {fontSize: 12}}}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="any">Has Blockers</MenuItem>
          </TextField>
          <TextField
            size="small" label="Date From"
            value={filters.dateFrom}
            onChange={(e) => onChange({...filters, dateFrom: e.target.value})}
            placeholder="dd Mon yyyy"
            sx={{minWidth: 130, mt: 1.2, '& .MuiInputBase-root': {fontSize: 12}}}
          />
          <TextField
            size="small" label="Date To"
            value={filters.dateTo}
            onChange={(e) => onChange({...filters, dateTo: e.target.value})}
            placeholder="dd Mon yyyy"
            sx={{minWidth: 130, mt: 1.2, '& .MuiInputBase-root': {fontSize: 12}}}
          />
          <TextField
            select size="small" label="Data Freshness"
            value={filters.dataFreshness}
            onChange={(e) => onChange({...filters, dataFreshness: e.target.value})}
            sx={{minWidth: 140, mt: 1.2, '& .MuiInputBase-root': {fontSize: 12}}}
          >
            <MenuItem value="">Any</MenuItem>
            <MenuItem value="fresh">Fresh (&lt; 1h)</MenuItem>
            <MenuItem value="stale">Stale (&gt; 4h)</MenuItem>
          </TextField>
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── CreateNodeDrawer ────────────────────────────────────────────────────────

type CreateNodeForm = {
  label: string;
  date: string;
  quantity: string;
  notes: string;
  nodeType: 'simulation' | 'validProposal';
};

type CreateNodeDrawerProps = {
  target: CreateNodeTarget | null;
  onClose: () => void;
  onSave: (form: CreateNodeForm, goTo: boolean) => void;
};

function CreateNodeDrawer({target, onClose, onSave}: CreateNodeDrawerProps) {
  const [form, setForm] = useState<CreateNodeForm>({
    label: '',
    date: '',
    quantity: '',
    notes: '',
    nodeType: 'simulation',
  });

  useEffect(() => {
    if (target) {
      setForm({label: '', date: '', quantity: '', notes: '', nodeType: 'simulation'});
    }
  }, [target]);

  if (!target) return null;

  const parentNode = target.parentNode;
  const parentStageLabel = STAGE_LABELS[parentNode.stageId] ?? parentNode.stageId;
  const nextStageLabel = STAGE_LABELS[target.nextStageId] ?? target.nextStageId;
  const hasNavPage = Boolean(STAGE_TO_PAGE_ID[target.nextStageId]);

  const parentStyles = STATUS_STYLES[parentNode.status];

  function handleChange(field: keyof CreateNodeForm, value: string) {
    setForm((prev) => ({...prev, [field]: value}));
  }

  const footer = (
    <Box sx={{display: 'flex', gap: 1, justifyContent: 'flex-end'}}>
      <Button size="small" variant="outlined" onClick={onClose} sx={{fontSize: 12}}>
        Cancel
      </Button>
      <Button
        size="small"
        variant="contained"
        disabled={!form.label.trim()}
        onClick={() => onSave(form, false)}
        sx={{fontSize: 12, bgcolor: '#1D4ED8', '&:hover': {bgcolor: '#1E40AF'}}}
      >
        Save
      </Button>
      {hasNavPage && (
        <Button
          size="small"
          variant="contained"
          endIcon={<OpenInNewIcon sx={{fontSize: 12}} />}
          disabled={!form.label.trim()}
          onClick={() => onSave(form, true)}
          sx={{fontSize: 12, bgcolor: '#0F172A', '&:hover': {bgcolor: 'var(--planning-text-primary)'}}}
        >
          Save and Go To
        </Button>
      )}
    </Box>
  );

  return (
    <StandardDrawer
      open={Boolean(target)}
      onClose={onClose}
      title={`Create ${nextStageLabel}`}
      subtitle={`Child of ${parentNode.label}`}
      width={520}
      footer={footer}
    >
      {/* Parent section */}
      <Box sx={{mb: 3}}>
        <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1}}>
          Parent Node
        </Typography>
        <Box sx={{
          border: `1px solid ${parentStyles.border}`,
          bgcolor: parentStyles.bg,
          borderRadius: 2,
          p: 1.5,
        }}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.5}}>
            <Chip
              size="small"
              label={parentStageLabel}
              sx={{height: 18, fontSize: 10, fontWeight: 700, bgcolor: 'var(--planning-ai-accent-bg)', color: '#1D4ED8', border: '1px solid #C7D2FE'}}
            />
            <StatusBadge status={parentNode.status} label={parentNode.statusLabel} />
          </Box>
          <Typography sx={{fontSize: 13, fontWeight: 800, color: '#0F172A', fontFamily: 'monospace', mt: 0.5}}>
            {parentNode.label}
          </Typography>
          {parentNode.sublabel && (
            <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.3}}>{parentNode.sublabel}</Typography>
          )}
          {parentNode.quantity && (
            <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-primary)', mt: 0.3}}>{parentNode.quantity}</Typography>
          )}
        </Box>
      </Box>

      <Divider sx={{mb: 3}} />

      {/* New node form */}
      <Box sx={{mb: 2}}>
        <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1.5}}>
          New {nextStageLabel}
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="ID / Label"
            size="small"
            required
            fullWidth
            value={form.label}
            onChange={(e) => handleChange('label', e.target.value)}
            inputProps={{'aria-label': 'ID / Label'}}
            sx={{'& .MuiInputBase-root': {fontSize: 13}}}
          />
          <TextField
            label="Date"
            size="small"
            fullWidth
            value={form.date}
            onChange={(e) => handleChange('date', e.target.value)}
            placeholder="e.g. 15 Jun 2026"
            sx={{'& .MuiInputBase-root': {fontSize: 13}}}
          />
          <TextField
            label="Quantity"
            size="small"
            fullWidth
            value={form.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            placeholder="e.g. 120,000,000"
            sx={{'& .MuiInputBase-root': {fontSize: 13}}}
          />
          <TextField
            label="Notes"
            size="small"
            fullWidth
            multiline
            rows={2}
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            sx={{'& .MuiInputBase-root': {fontSize: 13}}}
          />
        </Stack>
      </Box>

      <Divider sx={{mb: 2}} />

      {/* Type selector */}
      <Box>
        <Typography sx={{fontSize: 10, fontWeight: 800, color: 'var(--planning-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', mb: 1}}>
          Version Type
        </Typography>
        <RadioGroup
          value={form.nodeType}
          onChange={(e) => handleChange('nodeType', e.target.value)}
        >
          <FormControlLabel
            value="simulation"
            control={<Radio size="small" sx={{color: '#6D28D9', '&.Mui-checked': {color: '#6D28D9'}}} />}
            label={
              <Box>
                <Typography sx={{fontSize: 13, fontWeight: 700, color: '#0F172A'}}>Simulation</Typography>
                <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>Alternative scenario — does not affect the official chain</Typography>
              </Box>
            }
            sx={{alignItems: 'flex-start', mb: 1, '& .MuiRadio-root': {mt: 0.3}}}
          />
          <FormControlLabel
            value="validProposal"
            control={<Radio size="small" sx={{color: '#1D4ED8', '&.Mui-checked': {color: '#1D4ED8'}}} />}
            label={
              <Box>
                <Typography sx={{fontSize: 13, fontWeight: 700, color: '#0F172A'}}>Valid Proposal</Typography>
                <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>Draft candidate for the official planning chain</Typography>
              </Box>
            }
            sx={{alignItems: 'flex-start', '& .MuiRadio-root': {mt: 0.3}}}
          />
        </RadioGroup>
      </Box>
    </StandardDrawer>
  );
}

// ─── PlanningLineagePage ──────────────────────────────────────────────────────

type PlanningLineagePageProps = {
  onNavigate?: (pageId: string, versionId: string) => void;
};

export default function PlanningLineagePage({onNavigate}: PlanningLineagePageProps) {
  const [demandGroups, setDemandGroups] = useState<LineageDemandGroup[]>(LINEAGE_DEMAND_GROUPS);
  const [selectedChainId, setSelectedChainId] = useState<string | null>(null);
  const [hoveredChainId, setHoveredChainId] = useState<string | null>(null);
  const [filters, setFilters] = useState<LineageFilterState>(DEFAULT_LINEAGE_FILTERS);
  const [isPanning, setIsPanning] = useState(false);
  const [connections, setConnections] = useState<ConnectionLine[]>([]);
  const [measureTick, setMeasureTick] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetNode | null>(null);
  const [createTarget, setCreateTarget] = useState<CreateNodeTarget | null>(null);
  const [expandedDemandIds, setExpandedDemandIds] = useState<Set<string>>(
    () => new Set(LINEAGE_DEMAND_GROUPS.map((g) => g.id))
  );
  const [groupedStages, setGroupedStages] = useState<Set<LineageStageId>>(() => new Set());
  const [expandedGroupCells, setExpandedGroupCells] = useState<Set<string>>(() => new Set());

  const nodeRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const gridInnerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const panStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  // ── Delete handlers ────────────────────────────────────────────────────────

  function handleDeleteChain(chainId: string, nodeId: string, stageId: LineageStageId, label: string) {
    setDeleteTarget({chainId, nodeId, stageId, label});
  }

  function handleConfirmDelete() {
    if (!deleteTarget) return;
    setDemandGroups((prev) =>
      prev
        .map((g) => ({...g, chains: g.chains.filter((c) => c.id !== deleteTarget.chainId)}))
        .filter((g) => g.chains.length > 0)
    );
    if (selectedChainId === deleteTarget.chainId) setSelectedChainId(null);
    setDeleteTarget(null);
  }

  // ── Create child node handlers ─────────────────────────────────────────────

  function handleOpenCreate(node: LineageNode, chain: LineageChain, group: LineageDemandGroup) {
    const nextStageId = NEXT_STAGE[node.stageId];
    if (!nextStageId) return;
    setCreateTarget({parentNode: node, chain, demandGroup: group, nextStageId});
  }

  function handleSaveNode(form: CreateNodeForm, goTo: boolean) {
    if (!createTarget) return;
    const {parentNode, chain, demandGroup, nextStageId} = createTarget;
    const navPageId = STAGE_TO_PAGE_ID[nextStageId];

    const isSimulation = form.nodeType === 'simulation';
    const newNode: LineageNode = {
      id: `node-${Date.now()}`,
      stageId: nextStageId,
      label: form.label.trim(),
      sublabel: form.date.trim() || undefined,
      quantity: form.quantity.trim() || undefined,
      metaLine1: form.notes.trim() || undefined,
      status: isSimulation ? 'simulation' : 'draft',
      statusLabel: isSimulation ? 'Simulation' : 'Draft',
      isSimulation: isSimulation || undefined,
      parentNodeId: parentNode.id,
      linkedPageId: navPageId,
      linkedVersionId: navPageId ? form.label.trim() : undefined,
    };

    const alreadyHasNextStage = Boolean(chain.nodeIdsByStage[nextStageId]);

    setDemandGroups((prev) =>
      prev.map((g) => {
        if (g.id !== demandGroup.id) return g;

        if (!alreadyHasNextStage) {
          // Extend the existing chain
          const updatedChains = g.chains.map((c) => {
            if (c.id !== chain.id) return c;
            return {
              ...c,
              isSimulation: c.isSimulation || isSimulation,
              nodeIdsByStage: {...c.nodeIdsByStage, [nextStageId]: newNode.id},
              nodes: [...c.nodes, newNode],
            };
          });
          return {...g, chains: updatedChains};
        } else {
          // Branch: create a new chain sharing nodes up to and including parent stage
          const parentStageIdx = LINEAGE_STAGES.findIndex((s) => s.id === parentNode.stageId);
          const sharedNodes = chain.nodes.filter((n) => {
            const idx = LINEAGE_STAGES.findIndex((s) => s.id === n.stageId);
            return idx <= parentStageIdx;
          });
          const newChain: LineageChain = {
            id: `chain-${Date.now()}`,
            demandGroupId: g.id,
            label: `${isSimulation ? 'Simulation' : 'Draft'} from ${parentNode.label}`,
            isSimulation,
            nodeIdsByStage: {
              ...Object.fromEntries(sharedNodes.map((n) => [n.stageId, n.id])),
              [nextStageId]: newNode.id,
            },
            nodes: [...sharedNodes, newNode],
          };
          const insertIdx = g.chains.findIndex((c) => c.id === chain.id) + 1;
          const updatedChains = [...g.chains.slice(0, insertIdx), newChain, ...g.chains.slice(insertIdx)];
          return {...g, chains: updatedChains};
        }
      })
    );

    setCreateTarget(null);
    setMeasureTick((t) => t + 1);

    if (goTo) {
      if (navPageId && newNode.linkedVersionId) onNavigate?.(navPageId, newNode.linkedVersionId);
    }
  }

  function handleToggleDemand(demandId: string) {
    setExpandedDemandIds((prev) => {
      const next = new Set(prev);
      if (next.has(demandId)) next.delete(demandId);
      else next.add(demandId);
      return next;
    });
    setMeasureTick((t) => t + 1);
  }

  function handleToggleStageGroup(stageId: LineageStageId) {
    setGroupedStages((prev) => {
      const next = new Set(prev);
      if (next.has(stageId)) next.delete(stageId);
      else next.add(stageId);
      return next;
    });
    setExpandedGroupCells((prev) => {
      const next = new Set(prev);
      [...next].filter((k) => k.split('::')[1] === stageId).forEach((k) => next.delete(k));
      return next;
    });
    setMeasureTick((t) => t + 1);
  }

  function handleToggleGroupCell(demandGroupId: string, stageId: LineageStageId, parentKey: string) {
    const key = `${demandGroupId}::${stageId}::${parentKey}`;
    setExpandedGroupCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    setMeasureTick((t) => t + 1);
  }

  function handleGroupAll() {
    const allGrouped = ALL_GROUPABLE_STAGE_IDS.every((id) => groupedStages.has(id));
    setGroupedStages(allGrouped ? new Set() : new Set(ALL_GROUPABLE_STAGE_IDS));
    if (allGrouped) setExpandedGroupCells(new Set());
    setMeasureTick((t) => t + 1);
  }

  // ── Filtered groups ────────────────────────────────────────────────────────

  const visibleGroups = useMemo<LineageDemandGroup[]>(() => {
    return demandGroups
      .filter((g) => {
        if (filters.demandId && g.id !== filters.demandId) return false;
        if (filters.productCode && !g.product.toLowerCase().includes(filters.productCode.toLowerCase())) return false;
        if (filters.line && g.line !== filters.line) return false;
        return true;
      })
      .map((g) => ({
        ...g,
        chains: g.chains.filter((c) => {
          if (filters.status && !c.nodes.some((n) => n.status === filters.status)) return false;
          if (filters.batchId && !c.nodes.some((n) => n.stageId === 'batch-produced' && n.label.toLowerCase().includes(filters.batchId.toLowerCase()))) return false;
          if (filters.woNumber && !c.nodes.some((n) => n.stageId === 'production-order' && n.label.toLowerCase().includes(filters.woNumber.toLowerCase()))) return false;
          if (filters.qualityStatus && !c.nodes.some((n) => n.stageId === 'ipc-quality' && n.status === filters.qualityStatus)) return false;
          if (filters.releaseStatus && !c.nodes.some((n) => n.stageId === 'batch-release-decision' && n.status === filters.releaseStatus)) return false;
          if (filters.sterilizationStatus && !c.nodes.some((n) => n.stageId === 'sterilization' && n.status === filters.sterilizationStatus)) return false;
          if (filters.blockerType === 'any' && !c.nodes.some((n) => n.hasRiskIndicator)) return false;
          return true;
        }),
      }))
      .filter((g) => g.chains.length > 0);
  }, [filters, demandGroups]);

  // ── Lookups ────────────────────────────────────────────────────────────────

  const selectedChain = useMemo<LineageChain | null>(() => {
    if (!selectedChainId) return null;
    for (const g of demandGroups) {
      const c = g.chains.find((ch) => ch.id === selectedChainId);
      if (c) return c;
    }
    return null;
  }, [selectedChainId, demandGroups]);

  const selectedDemandGroup = useMemo<LineageDemandGroup | null>(() => {
    if (!selectedChain) return null;
    return demandGroups.find((g) => g.id === selectedChain.demandGroupId) ?? null;
  }, [selectedChain, demandGroups]);

  // ── Measure node positions → compute SVG connections ──────────────────────

  const stageIdsInOrder = useMemo(() => CONTENT_STAGES.map((s) => s.id), []);

  const measureConnections = useCallback(() => {
    const gridEl = gridInnerRef.current;
    if (!gridEl) return;

    // CSS zoom compensation: getBoundingClientRect() returns coordinates in
    // zoomed viewport space, but the SVG is rendered in element space (pre-zoom).
    // Dividing by the html zoom factor converts back to element-space coordinates.
    const htmlZoom = parseFloat(
      window.getComputedStyle(document.documentElement).getPropertyValue('zoom') || '1'
    ) || 1;

    const gridRect = gridEl.getBoundingClientRect();
    const newConnections: ConnectionLine[] = [];
    const seenPairs = new Set<string>();

    for (const group of visibleGroups) {
      for (const chain of group.chains) {
        for (let i = 0; i < stageIdsInOrder.length - 1; i++) {
          const fromStageId = stageIdsInOrder[i];
          const toStageId = stageIdsInOrder[i + 1];
          const fromId = chain.nodeIdsByStage[fromStageId];
          const toId = chain.nodeIdsByStage[toStageId];
          if (!fromId || !toId) continue;
          const pairKey = `${fromId}-${toId}`;
          if (seenPairs.has(pairKey)) continue;
          seenPairs.add(pairKey);
          const fromEl = nodeRefs.current.get(fromId);
          const toEl = nodeRefs.current.get(toId);
          if (!fromEl || !toEl) continue;
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          newConnections.push({
            chainId: chain.id,
            fromNodeId: fromId,
            toNodeId: toId,
            isSimulation: chain.isSimulation,
            color: group.color,
            x1: (fromRect.right - gridRect.left) / htmlZoom,
            y1: (fromRect.top + fromRect.height / 2 - gridRect.top) / htmlZoom,
            x2: (toRect.left - gridRect.left) / htmlZoom,
            y2: (toRect.top + toRect.height / 2 - gridRect.top) / htmlZoom,
          });
        }
      }
    }
    setConnections(newConnections);
  }, [visibleGroups, stageIdsInOrder]);

  useLayoutEffect(() => {
    measureConnections();
  }, [measureConnections, measureTick]);

  // ResizeObserver on grid inner
  useEffect(() => {
    const el = gridInnerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setMeasureTick((t) => t + 1));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Scroll listener — debounced with requestAnimationFrame
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    let rafId: number;
    const onScroll = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => setMeasureTick((t) => t + 1));
    };
    el.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    function stopPanning() {
      if (!panStateRef.current.active) return;
      panStateRef.current.active = false;
      setIsPanning(false);
    }

    function handleMouseMove(event: MouseEvent) {
      if (!panStateRef.current.active) return;
      const el = scrollContainerRef.current;
      if (!el) {
        stopPanning();
        return;
      }
      if ((event.buttons & 2) !== 2) {
        stopPanning();
        return;
      }

      const dx = event.clientX - panStateRef.current.startX;
      const dy = event.clientY - panStateRef.current.startY;
      el.scrollLeft = panStateRef.current.scrollLeft - dx;
      el.scrollTop = panStateRef.current.scrollTop - dy;
      event.preventDefault();
    }

    function handleMouseUp(event: MouseEvent) {
      if (event.button !== 0 && event.button !== 2) return;
      stopPanning();
    }

    window.addEventListener('mousemove', handleMouseMove, {passive: false});
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', stopPanning);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', stopPanning);
    };
  }, []);

  function handlePanStart(event: React.MouseEvent<HTMLDivElement>) {
    if (event.button !== 2) return;
    const el = scrollContainerRef.current;
    if (!el) return;

    panStateRef.current = {
      active: true,
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: el.scrollLeft,
      scrollTop: el.scrollTop,
    };
    setIsPanning(true);
    event.preventDefault();
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'var(--planning-background)', overflow: 'hidden'}}>
      <FilterBar filters={filters} onChange={setFilters} groupedStages={groupedStages} onGroupAll={handleGroupAll} />

      {filters.viewMode === 'timeline' ? (
        <TimelineView groups={visibleGroups} filters={filters} />
      ) : filters.viewMode === 'agentic' ? (
        <AgenticView groups={visibleGroups} initialDemandId={filters.demandId || undefined} />
      ) : (
        <Box sx={{display: 'flex', flex: 1, overflow: 'hidden'}}>
          {/* Canvas area */}
          <Box
            ref={scrollContainerRef}
            onMouseDown={handlePanStart}
            onContextMenu={(event) => event.preventDefault()}
            sx={{
              flex: 1,
              overflowX: 'auto',
              overflowY: 'auto',
              position: 'relative',
              cursor: isPanning ? 'grabbing' : 'grab',
              userSelect: isPanning ? 'none' : 'auto',
            }}
          >
            <Box
              ref={gridInnerRef}
              sx={{minWidth: TOTAL_GRID_WIDTH, position: 'relative'}}
            >
              {/* SVG overlay for connections */}
              <svg
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  overflow: 'visible',
                  zIndex: 5,
                }}
              >
                <defs>
                  <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                    <path d="M0,0 L0,6 L6,3 z" fill="#94A3B8" />
                  </marker>
                </defs>
                {connections.map((c) => (
                  <BezierPath
                    key={`${c.fromNodeId}-${c.toNodeId}`}
                    {...c}
                    isSelected={c.chainId === selectedChainId}
                    isHovered={c.chainId === hoveredChainId}
                  />
                ))}
              </svg>

              <StageHeaderRow stages={LINEAGE_STAGES} groupedStages={groupedStages} onToggleStageGroup={handleToggleStageGroup} />

              {visibleGroups.length === 0 ? (
                <Box sx={{p: 6, textAlign: 'center'}}>
                  <Typography sx={{fontSize: 14, color: 'var(--planning-text-muted)'}}>No chains match the current filters.</Typography>
                </Box>
              ) : (
                visibleGroups.map((group) => (
                  <DemandGroupRow
                    key={group.id}
                    group={group}
                    isExpanded={expandedDemandIds.has(group.id)}
                    onToggle={() => handleToggleDemand(group.id)}
                    selectedChainId={selectedChainId}
                    hoveredChainId={hoveredChainId}
                    nodeRefs={nodeRefs}
                    onChainSelect={setSelectedChainId}
                    onChainHover={setHoveredChainId}
                    onDeleteChain={handleDeleteChain}
                    onNavigate={onNavigate}
                    onCreateChild={handleOpenCreate}
                    groupedStages={groupedStages}
                    expandedGroupCells={expandedGroupCells}
                    onToggleGroupCell={handleToggleGroupCell}
                  />
                ))
              )}
            </Box>
          </Box>

          {/* Right panel */}
          <SelectedPathPanel
            chain={selectedChain}
            demandGroup={selectedDemandGroup}
            onClose={() => setSelectedChainId(null)}
          />
        </Box>
      )}

      <DeleteChainDialog
        open={Boolean(deleteTarget)}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      <CreateNodeDrawer
        target={createTarget}
        onClose={() => setCreateTarget(null)}
        onSave={handleSaveNode}
      />
    </Box>
  );
}
