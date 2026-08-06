import {useEffect, useMemo, useRef, useState} from 'react';
import {
  AccountTree as AccountTreeIcon,
  AutoAwesome as AutoAwesomeIcon,
  BuildCircle as BuildCircleIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  CompareArrows as CompareArrowsIcon,
  ErrorOutline as ErrorOutlineIcon,
  Factory as FactoryIcon,
  Groups as GroupsIcon,
  Inventory2 as Inventory2Icon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  OpenInNew as OpenInNewIcon,
  PlayArrow as PlayArrowIcon,
  RadioButtonChecked as RadioButtonCheckedIcon,
  ShieldOutlined as ShieldOutlinedIcon,
  SwapHoriz as SwapHorizIcon,
  WarningAmber as WarningAmberIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {AGENTIC_VIEW_BY_DEMAND, DEFAULT_AGENTIC_DEMAND_ID} from './agenticMock';
import type {
  AgentActivityItem,
  AgentCard,
  AgentCardStatus,
  AgentConnection,
  AgenticAuditLogItem,
  AgenticRecommendation,
  AgenticViewState,
  LineageDemandGroup,
  LineageNodeStatus,
  RiskItem,
} from './types';

const AGENT_COLORS: Record<AgentCard['type'], {main: string; soft: string; border: string}> = {
  'demand-signal': {main: '#2563EB', soft: '#EFF6FF', border: '#BFDBFE'},
  production: {main: '#2563EB', soft: '#EFF6FF', border: '#BFDBFE'},
  'material-warehouse': {main: '#16A34A', soft: '#ECFDF3', border: '#BBF7D0'},
  quality: {main: '#7C3AED', soft: '#F5F3FF', border: '#DDD6FE'},
  maintenance: {main: '#F97316', soft: '#FFF7ED', border: '#FED7AA'},
  'shift-labor': {main: '#F59E0B', soft: '#FFFBEB', border: '#FDE68A'},
  sterilization: {main: '#8B5CF6', soft: '#F5F3FF', border: '#DDD6FE'},
  orchestrator: {main: '#1D4ED8', soft: '#EFF6FF', border: '#BFDBFE'},
};

const STATUS_META: Record<AgentCardStatus, {color: string; bg: string; border: string}> = {
  'No Issue': {color: '#16A34A', bg: '#ECFDF3', border: '#BBF7D0'},
  Warning: {color: '#D97706', bg: '#FFFBEB', border: '#FDE68A'},
  'At Risk': {color: '#F97316', bg: '#FFF7ED', border: '#FED7AA'},
  Blocked: {color: '#DC2626', bg: '#FEF2F2', border: '#FECACA'},
  'Recommendation Ready': {color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE'},
};

const DEMAND_STATUS_LABELS: Partial<Record<LineageNodeStatus, string>> = {
  approved: 'On Track',
  released: 'Released',
  warning: 'At Risk',
  critical: 'At Risk',
  blocked: 'Blocked',
  draft: 'Draft',
};

function AgentIcon({agent}: {agent: AgentCard}) {
  const sx = {fontSize: 18, color: AGENT_COLORS[agent.type].main};
  if (agent.type === 'demand-signal') return <RadioButtonCheckedIcon sx={sx} />;
  if (agent.type === 'production') return <FactoryIcon sx={sx} />;
  if (agent.type === 'material-warehouse') return <Inventory2Icon sx={sx} />;
  if (agent.type === 'quality') return <ShieldOutlinedIcon sx={sx} />;
  if (agent.type === 'maintenance') return <BuildCircleIcon sx={sx} />;
  if (agent.type === 'shift-labor') return <GroupsIcon sx={sx} />;
  if (agent.type === 'sterilization') return <LocalFireDepartmentIcon sx={sx} />;
  return <AutoAwesomeIcon sx={sx} />;
}

function StatusPill({status}: {status: AgentCardStatus}) {
  const meta = STATUS_META[status];
  return (
    <Chip
      label={status}
      size="small"
      sx={{
        height: 18,
        fontSize: 10,
        fontWeight: 800,
        bgcolor: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`,
      }}
    />
  );
}

function DemandStatusPill({status}: {status: LineageNodeStatus}) {
  const label = DEMAND_STATUS_LABELS[status] ?? status;
  const meta =
    status === 'critical' || status === 'blocked'
      ? STATUS_META.Blocked
      : status === 'warning'
        ? STATUS_META['At Risk']
        : status === 'draft'
          ? STATUS_META.Warning
          : STATUS_META['No Issue'];

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 18,
        fontSize: 10,
        fontWeight: 800,
        bgcolor: meta.bg,
        color: meta.color,
        border: `1px solid ${meta.border}`,
      }}
    />
  );
}

function MiniSparkline({values, color}: {values: number[]; color: string}) {
  const points = values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * 52;
      const y = 22 - ((value - 30) / 30) * 18;
      return `${x},${Math.max(3, Math.min(22, y))}`;
    })
    .join(' ');

  return (
    <svg width="58" height="24" viewBox="0 0 58 24" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AgentCardView({agent, onClick}: {agent: AgentCard; onClick: () => void}) {
  const color = AGENT_COLORS[agent.type];

  return (
    <Paper
      elevation={0}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') onClick();
      }}
      sx={{
        minHeight: 158,
        border: `1px solid ${color.border}`,
        borderRadius: 2,
        p: 1.3,
        bgcolor: '#fff',
        cursor: 'pointer',
        position: 'relative',
        zIndex: 2,
        boxShadow: '0 8px 18px rgba(15, 23, 42, 0.04)',
        '&:hover': {borderColor: color.main, boxShadow: '0 12px 24px rgba(15, 23, 42, 0.08)'},
        '&:focus-visible': {outline: `2px solid ${color.main}`, outlineOffset: 2},
      }}
    >
      <Box sx={{display: 'flex', gap: 1, alignItems: 'flex-start', mb: 1}}>
        <Box sx={{width: 32, height: 32, borderRadius: '50%', bgcolor: color.soft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          <AgentIcon agent={agent} />
        </Box>
        <Box sx={{minWidth: 0, flex: 1}}>
          <Typography sx={{fontSize: 12, fontWeight: 900, color: '#0F172A', lineHeight: 1.2}}>{agent.name}</Typography>
          <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', fontWeight: 700}}>{agent.state}</Typography>
        </Box>
      </Box>

      <Box sx={{border: '1px solid var(--planning-border)', borderRadius: 1.5, p: 1, minHeight: 58, bgcolor: 'var(--planning-surface-muted)'}}>
        {agent.insight.map((line) => (
          <Typography key={line} sx={{fontSize: 10.5, color: 'var(--planning-text-secondary)', fontWeight: 600, lineHeight: 1.35}}>
            {line}
          </Typography>
        ))}
      </Box>

      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1}}>
        <StatusPill status={agent.status} />
        <Typography sx={{fontSize: 10, color: 'var(--planning-text-muted)', fontWeight: 700}}>{agent.lastUpdated}</Typography>
      </Box>

      <Box sx={{display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1, mt: 1}}>
        <Box>
          <Typography sx={{fontSize: 9, color: 'var(--planning-text-secondary)', fontWeight: 800}}>Confidence</Typography>
          <Typography sx={{fontSize: 15, color: '#0F172A', fontWeight: 900}}>{agent.confidence}%</Typography>
        </Box>
        <MiniSparkline values={agent.sparkline} color={color.main} />
      </Box>
    </Paper>
  );
}

const FLOW_VIEWBOX = {width: 1000, height: 820};
const ACTIVE_CONNECTION_COLOR = '#16A34A';
const BLOCKED_CONNECTION_COLOR = '#DC2626';

const FLOW_AGENT_PLACEMENT: Record<string, {left: number; top: number; width: number}> = {
  'demand-signal': {left: 28, top: 60, width: 190},
  production: {left: 28, top: 320, width: 190},
  maintenance: {left: 28, top: 580, width: 190},
  orchestrator: {left: 330, top: 330, width: 340},
  material: {left: 782, top: 60, width: 190},
  quality: {left: 782, top: 240, width: 190},
  labor: {left: 782, top: 420, width: 190},
  sterilization: {left: 782, top: 600, width: 190},
};

const FLOW_CONNECTION_PATHS: Record<string, {d: string; marker: {x: number; y: number}; label: {x: number; y: number}}> = {
  'demand-production': {
    d: 'M218 139 C290 139 300 409 330 409',
    marker: {x: 290, y: 274},
    label: {x: 230, y: 240},
  },
  'production-material': {
    d: 'M218 399 C280 399 295 409 330 409',
    marker: {x: 284, y: 404},
    label: {x: 220, y: 370},
  },
  'maintenance-orchestrator': {
    d: 'M218 659 C290 659 300 409 330 409',
    marker: {x: 290, y: 534},
    label: {x: 230, y: 500},
  },
  'material-quality': {
    d: 'M782 139 C710 139 700 409 670 409',
    marker: {x: 710, y: 274},
    label: {x: 640, y: 240},
  },
  'quality-orchestrator': {
    d: 'M782 319 C730 319 710 409 670 409',
    marker: {x: 722, y: 364},
    label: {x: 650, y: 330},
  },
  'labor-orchestrator': {
    d: 'M782 499 C730 499 710 409 670 409',
    marker: {x: 722, y: 454},
    label: {x: 650, y: 420},
  },
  'sterilization-orchestrator': {
    d: 'M782 679 C710 679 700 409 670 409',
    marker: {x: 710, y: 544},
    label: {x: 640, y: 510},
  },
};

function getConnectionLabel(connection: AgentConnection, agentsById: Map<string, AgentCard>) {
  const source = agentsById.get(connection.sourceAgentId)?.name ?? connection.sourceAgentId;
  const target = agentsById.get(connection.targetAgentId)?.name ?? connection.targetAgentId;
  const status = connection.status === 'blocked' ? 'Blocked' : 'Active';
  return `${status} connection from ${source} to ${target}`;
}

function AgentConnectorLayer({connections, agents}: {connections: AgentConnection[]; agents: AgentCard[]}) {
  const agentsById = useMemo(() => new Map(agents.map((agent) => [agent.id, agent])), [agents]);

  return (
    <svg
      role="img"
      aria-label="Agent communication flow"
      viewBox={`0 0 ${FLOW_VIEWBOX.width} ${FLOW_VIEWBOX.height}`}
      preserveAspectRatio="none"
      style={{position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1}}
    >
      <style>
        {`
          @keyframes agentic-flow-dash {
            from { stroke-dashoffset: 22; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes agentic-warning-pulse {
            0%, 100% { opacity: 0.55; transform: scale(0.82); }
            50% { opacity: 0.16; transform: scale(1.55); }
          }
        `}
      </style>
      <defs>
        <filter id="agentic-soft-green" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#16A34A" floodOpacity="0.22" />
        </filter>
        <marker id="agentic-arrow-active" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={ACTIVE_CONNECTION_COLOR} />
        </marker>
        <marker id="agentic-arrow-blocked" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill={BLOCKED_CONNECTION_COLOR} />
        </marker>
      </defs>
      {connections.map((connection, index) => {
        const pathMeta = FLOW_CONNECTION_PATHS[connection.id];
        if (!pathMeta) return null;

        const isBlocked = connection.status === 'blocked';
        const color = isBlocked ? BLOCKED_CONNECTION_COLOR : ACTIVE_CONNECTION_COLOR;
        const label = getConnectionLabel(connection, agentsById);

        return (
          <g key={connection.id} aria-label={label}>
            <title>{label}</title>
            <path
              d={pathMeta.d}
              fill="none"
              stroke={color}
              strokeWidth={isBlocked ? 2.7 : 2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={isBlocked ? '8 8' : '7 9'}
              filter={isBlocked ? undefined : 'url(#agentic-soft-green)'}
              style={{
                animation: isBlocked ? 'none' : 'agentic-flow-dash 1.25s linear infinite',
                animationDelay: `${index * -0.12}s`,
              }}
            />
            {!isBlocked && (
              <circle r="4.2" fill={ACTIVE_CONNECTION_COLOR} opacity="0.9">
                <animateMotion dur={`${2 + (index % 3) * 0.25}s`} repeatCount="indefinite" path={pathMeta.d} />
              </circle>
            )}
            {isBlocked && (
              <>
                <circle cx={pathMeta.marker.x} cy={pathMeta.marker.y} r="15" fill="#FEE2E2" style={{transformOrigin: `${pathMeta.marker.x}px ${pathMeta.marker.y}px`, animation: 'agentic-warning-pulse 1.4s ease-in-out infinite'}} />
                <circle cx={pathMeta.marker.x} cy={pathMeta.marker.y} r="7" fill={BLOCKED_CONNECTION_COLOR} stroke="#fff" strokeWidth="3" />
                <text x={pathMeta.marker.x} y={pathMeta.marker.y + 3.5} textAnchor="middle" fontSize="9" fontWeight="900" fill="#fff">!</text>
                <g>
                  <rect x={pathMeta.label.x} y={pathMeta.label.y} width="122" height="24" rx="12" fill="#FEF2F2" stroke="#FECACA" />
                  <text x={pathMeta.label.x + 61} y={pathMeta.label.y + 16} textAnchor="middle" fontSize="10" fontWeight="800" fill={BLOCKED_CONNECTION_COLOR}>
                    {connection.label ?? 'Signal interrupted'}
                  </text>
                </g>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function DemandPanel({
  groups,
  selectedDemandId,
  onSelect,
}: {
  groups: LineageDemandGroup[];
  selectedDemandId: string;
  onSelect: (demandId: string) => void;
}) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set(groups.map((group) => group.id)));

  useEffect(() => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      groups.forEach((group) => next.add(group.id));
      return next;
    });
  }, [groups]);

  return (
    <Box sx={{width: 232, flexShrink: 0, borderRight: '1px solid #E2E8F0', bgcolor: '#fff', overflowY: 'auto'}}>
      <Box sx={{px: 2, py: 1.5, borderBottom: '1px solid var(--planning-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)', textTransform: 'uppercase'}}>Group / Demand</Typography>
        <AccountTreeIcon sx={{fontSize: 14, color: 'var(--planning-text-secondary)'}} />
      </Box>

      {groups.map((group) => {
        const expanded = expandedIds.has(group.id);
        const selected = selectedDemandId === group.id;
        return (
          <Box
            key={group.id}
            component="button"
            onClick={() => onSelect(group.id)}
            sx={{
              width: '100%',
              display: 'block',
              textAlign: 'left',
              border: 0,
              borderBottom: '1px solid var(--planning-border)',
              borderLeft: `4px solid ${group.color}`,
              bgcolor: selected ? `color-mix(in srgb, ${group.color} 5%, transparent)` : '#fff',
              p: 0,
              cursor: 'pointer',
              '&:hover': {bgcolor: `color-mix(in srgb, ${group.color} 4%, transparent)`},
              '&:focus-visible': {outline: `2px solid ${group.color}`, outlineOffset: -2},
            }}
          >
            <Box sx={{px: 1.5, py: 1.3}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    setExpandedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(group.id)) next.delete(group.id);
                      else next.add(group.id);
                      return next;
                    });
                  }}
                  sx={{p: 0.1, color: 'var(--planning-text-secondary)'}}
                >
                  {expanded ? <KeyboardArrowDownIcon sx={{fontSize: 16}} /> : <KeyboardArrowRightIcon sx={{fontSize: 16}} />}
                </IconButton>
                <Typography sx={{fontSize: 13, fontWeight: 900, color: '#0F172A'}}>{group.demandLabel}</Typography>
              </Box>
              {expanded && (
                <Box sx={{pl: 3.2, pt: 0.5}}>
                  <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 700}}>{group.product} | {group.line}</Typography>
                  <Typography sx={{fontSize: 12, color: '#0F172A', fontWeight: 900, mt: 0.4}}>{group.quantity}</Typography>
                  <Box sx={{mt: 0.8}}>
                    <DemandStatusPill status={group.status} />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        );
      })}

      <Button
        size="small"
        startIcon={<Box component="span" sx={{fontSize: 16, lineHeight: 1}}>+</Box>}
        sx={{m: 1.5, fontSize: 11, fontWeight: 800, textTransform: 'none', color: '#1D4ED8'}}
      >
        Add Demand Group
      </Button>
    </Box>
  );
}

function CanvasHeader({
  data,
  loading,
  stale,
  analysisMessage,
  onRun,
}: {
  data: AgenticViewState;
  loading: boolean;
  stale: boolean;
  analysisMessage?: string;
  onRun: () => void;
}) {
  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, px: 2, pt: 1.5, pb: 1}}>
      <Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
          <Typography sx={{fontSize: 13, fontWeight: 900, color: '#0F172A', textTransform: 'uppercase'}}>Agentic View</Typography>
          <Chip label="Beta" size="small" sx={{height: 18, fontSize: 10, fontWeight: 900, bgcolor: '#DCFCE7', color: '#15803D'}} />
          {stale && <Chip label="Stale data" size="small" sx={{height: 18, fontSize: 10, fontWeight: 900, bgcolor: '#FEFCE8', color: '#A16207', border: '1px solid #FEF08A'}} />}
        </Box>
        <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)'}}>AI agents analyzing the selected planning path and generating recommendations.</Typography>
        {analysisMessage && (
          <Typography sx={{fontSize: 11, color: loading ? '#1D4ED8' : '#15803D', fontWeight: 800, mt: 0.4}}>
            {analysisMessage}
          </Typography>
        )}
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
        <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 700}}>Last analysis: {data.lastAnalysisAt}</Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<PlayArrowIcon sx={{fontSize: 14}} />}
          onClick={onRun}
          disabled={loading}
          sx={{height: 30, fontSize: 11, fontWeight: 800, textTransform: 'none', bgcolor: '#1D4ED8'}}
        >
          {loading ? 'Running analysis...' : 'Run Agent Analysis'}
        </Button>
      </Box>
    </Box>
  );
}

function AgenticCanvas({
  agents,
  connections,
  recommendation,
  onAgentClick,
  loading,
  successMessage,
  onDismissSuccess,
}: {
  agents: AgentCard[];
  connections: AgentConnection[];
  recommendation: AgenticRecommendation;
  onAgentClick: (agent: AgentCard) => void;
  loading: boolean;
  successMessage?: string;
  onDismissSuccess: () => void;
}) {
  const byId = new Map(agents.map((agent) => [agent.id, agent]));
  const agentOrder = ['demand-signal', 'production', 'material', 'quality', 'maintenance', 'labor', 'sterilization', 'orchestrator'];

  if (!agents.length) {
    return (
      <Box sx={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--planning-text-muted)'}}>
        No agent data is available for the selected demand.
      </Box>
    );
  }

  return (
    <Box sx={{position: 'relative', px: 2, pb: 2, minHeight: 844}}>
      <Box sx={{overflowX: 'auto', overflowY: 'hidden', pb: 1}}>
        <Box
          sx={{
            position: 'relative',
            width: FLOW_VIEWBOX.width,
            height: FLOW_VIEWBOX.height,
            minWidth: FLOW_VIEWBOX.width,
            border: '1px solid var(--planning-border)',
            borderRadius: 2,
            bgcolor: '#FBFDFF',
            boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.9)',
          }}
        >
          {loading && (
            <Box sx={{position: 'absolute', left: 0, right: 0, top: 0, zIndex: 5}}>
              <LinearProgress sx={{height: 3, borderRadius: 3}} />
            </Box>
          )}

          {successMessage && (
            <Box
              role="status"
              sx={{
                position: 'absolute',
                left: 24,
                right: 24,
                top: 12,
                zIndex: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                px: 1.4,
                py: 0.9,
                borderRadius: 1.5,
                border: '1px solid #BBF7D0',
                bgcolor: '#ECFDF3',
                boxShadow: '0 10px 24px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0}}>
                <CheckCircleIcon sx={{fontSize: 17, color: '#16A34A', flexShrink: 0}} />
                <Typography sx={{fontSize: 12, color: '#166534', fontWeight: 900}}>{successMessage}</Typography>
              </Box>
              <IconButton size="small" onClick={onDismissSuccess} aria-label="Dismiss success message" sx={{color: '#15803D'}}>
                <CloseIcon sx={{fontSize: 15}} />
              </IconButton>
            </Box>
          )}

          <AgentConnectorLayer connections={connections} agents={agents} />

          {agentOrder.map((id) => {
            const agent = byId.get(id);
            const placement = FLOW_AGENT_PLACEMENT[id];
            if (!agent || !placement) return null;

            return (
              <Box
                key={id}
                sx={{
                  position: 'absolute',
                  left: placement.left,
                  top: placement.top,
                  width: placement.width,
                  zIndex: 2,
                }}
              >
                <AgentCardView agent={agent} onClick={() => onAgentClick(agent)} />
              </Box>
            );
          })}

        <Paper
          elevation={0}
          sx={{
            position: 'absolute',
            left: 330,
            top: 510,
            width: 340,
            minHeight: 132,
            zIndex: 2,
            border: '1px solid #DBEAFE',
            borderRadius: 2,
            p: 1.3,
            bgcolor: 'var(--planning-surface-muted)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 900}}>Recommended Action</Typography>
          <Typography sx={{fontSize: 12, color: '#0F172A', fontWeight: 800, mt: 0.5}}>
            {recommendation.title}
          </Typography>
          <Button
            size="small"
            endIcon={<OpenInNewIcon sx={{fontSize: 13}} />}
            sx={{alignSelf: 'flex-start', mt: 1, fontSize: 11, fontWeight: 800, textTransform: 'none'}}
          >
            View Recommendation
          </Button>
        </Paper>
        </Box>
      </Box>
    </Box>
  );
}

function ImpactRow({label, value}: {label: string; value: string}) {
  return (
    <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}>
      <Typography sx={{fontSize: 11, color: '#475569', fontWeight: 700}}>{label}</Typography>
      <Typography sx={{fontSize: 12, color: value.startsWith('-') || value.startsWith('+') ? '#059669' : '#334155', fontWeight: 900}}>{value}</Typography>
    </Box>
  );
}

function RecommendationPanel({
  recommendation,
  loadingAlternative,
  onAccept,
  onReject,
  onCompare,
  onAlternative,
  onObjectClick,
}: {
  recommendation: AgenticRecommendation;
  loadingAlternative: boolean;
  onAccept: () => void;
  onReject: () => void;
  onCompare: () => void;
  onAlternative: () => void;
  onObjectClick: (objectId: string) => void;
}) {
  return (
    <Box sx={{width: 330, flexShrink: 0, borderLeft: '1px solid #E2E8F0', bgcolor: '#fff', display: 'flex', flexDirection: 'column', overflowY: 'auto'}}>
      <Box sx={{px: 2, py: 1.5, borderBottom: '1px solid var(--planning-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Typography sx={{fontSize: 12, fontWeight: 900, color: '#0F172A', textTransform: 'uppercase'}}>Agentic Recommendation</Typography>
        <Chip label={recommendation.impactLevel} size="small" sx={{height: 20, fontSize: 10, fontWeight: 900, bgcolor: '#DCFCE7', color: '#15803D'}} />
      </Box>

      {loadingAlternative && <LinearProgress sx={{height: 3}} />}

      <Stack spacing={1.6} sx={{p: 2, flex: 1}}>
        <Box>
          <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', fontWeight: 900}}>Recommended Action</Typography>
          <Typography sx={{fontSize: 16, color: '#0F172A', fontWeight: 900, lineHeight: 1.35, mt: 0.5}}>{recommendation.title}</Typography>
          <Typography sx={{fontSize: 12, color: '#475569', fontWeight: 600, lineHeight: 1.45, mt: 1}}>{recommendation.description}</Typography>
        </Box>

        <Divider />

        <Box>
          <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', fontWeight: 900, mb: 1}}>Expected Impact</Typography>
          <Stack spacing={1}>
            <ImpactRow label="Service Level" value={recommendation.expectedImpact.serviceLevelDelta} />
            <ImpactRow label="Material Risk" value={recommendation.expectedImpact.materialRiskDelta} />
            <ImpactRow label="Capacity Overload Days" value={recommendation.expectedImpact.capacityOverloadDaysDelta} />
            <ImpactRow label="Changeovers" value={recommendation.expectedImpact.changeoversDelta} />
            <ImpactRow label="Sterilization Risk" value={recommendation.expectedImpact.sterilizationRiskDelta} />
          </Stack>
        </Box>

        <Divider />

        <Box>
          <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', fontWeight: 900, mb: 0.8}}>Main Driver</Typography>
          <Box sx={{display: 'flex', gap: 1, alignItems: 'center'}}>
            <WarningAmberIcon sx={{fontSize: 17, color: '#F97316'}} />
            <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{recommendation.mainDriver}</Typography>
          </Box>
        </Box>

        <Box>
          <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', fontWeight: 900, mb: 0.8}}>Impacted Objects ({recommendation.impactedObjects.length})</Typography>
          <Stack spacing={0.8}>
            {recommendation.impactedObjects.map((object) => (
              <Box
                key={object.objectId}
                component="button"
                onClick={() => onObjectClick(object.objectId)}
                sx={{
                  border: 0,
                  bgcolor: 'transparent',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 1,
                  p: 0,
                  cursor: 'pointer',
                }}
              >
                <Typography sx={{fontSize: 12, color: '#1E3A8A', fontWeight: 900}}>{object.objectId}</Typography>
                <Chip label={object.action} size="small" sx={{height: 20, fontSize: 10, fontWeight: 900, bgcolor: 'var(--planning-neutral-bg)', color: '#1D4ED8'}} />
              </Box>
            ))}
          </Stack>
        </Box>

        <Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.8}}>
            <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 900}}>Confidence</Typography>
            <Typography sx={{fontSize: 14, color: '#059669', fontWeight: 900}}>{recommendation.confidence}%</Typography>
          </Box>
          <LinearProgress variant="determinate" value={recommendation.confidence} sx={{height: 6, borderRadius: 999, bgcolor: '#E2E8F0', '& .MuiLinearProgress-bar': {bgcolor: '#059669'}}} />
        </Box>
      </Stack>

      <Box sx={{p: 2, borderTop: '1px solid var(--planning-border)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1}}>
        <Button variant="contained" onClick={onAccept} sx={{fontSize: 11, fontWeight: 900, textTransform: 'none', bgcolor: '#1D4ED8'}}>Accept Recommendation</Button>
        <Button variant="outlined" onClick={onCompare} startIcon={<CompareArrowsIcon sx={{fontSize: 14}} />} sx={{fontSize: 11, fontWeight: 900, textTransform: 'none'}}>Compare Plans</Button>
        <Button variant="outlined" onClick={onReject} endIcon={<KeyboardArrowDownIcon sx={{fontSize: 14}} />} sx={{fontSize: 11, fontWeight: 900, textTransform: 'none'}}>Reject</Button>
        <Button variant="outlined" onClick={onAlternative} startIcon={<SwapHorizIcon sx={{fontSize: 14}} />} disabled={loadingAlternative} sx={{fontSize: 11, fontWeight: 900, textTransform: 'none'}}>
          Request Alternative
        </Button>
      </Box>
    </Box>
  );
}

function SeverityChip({severity}: {severity: RiskItem['severity']}) {
  const color = severity === 'Critical' ? '#DC2626' : severity === 'High' ? '#EF4444' : severity === 'Medium' ? '#F59E0B' : '#2563EB';
  return <Chip label={severity} size="small" sx={{height: 18, fontSize: 10, fontWeight: 900, color, bgcolor: `color-mix(in srgb, ${color} 8%, transparent)`}} />;
}

function BottomPanels({data, scenarioRef}: {data: AgenticViewState; scenarioRef: React.RefObject<HTMLDivElement | null>}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1.15fr 1.65fr', gap: 1.5, p: 1.5, borderTop: '1px solid var(--planning-border)', bgcolor: 'var(--planning-background)'}}>
      <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2, bgcolor: '#fff', overflow: 'hidden'}}>
        <Box sx={{px: 1.5, py: 1, borderBottom: '1px solid var(--planning-border)', display: 'flex', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 11, color: '#0F172A', fontWeight: 900}}>TOP RISKS & ALERTS</Typography>
          <Chip label={data.risks.length} size="small" sx={{height: 18, bgcolor: '#EF4444', color: '#fff', fontSize: 10, fontWeight: 900}} />
        </Box>
        <Stack spacing={0.8} sx={{p: 1.5}}>
          {data.risks.map((risk) => (
            <Box key={risk.id} sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1}}>
              <Box sx={{display: 'flex', gap: 0.8, alignItems: 'center', minWidth: 0}}>
                <ErrorOutlineIcon sx={{fontSize: 15, color: risk.severity === 'Low' ? '#2563EB' : risk.severity === 'Medium' ? '#F59E0B' : '#EF4444', flexShrink: 0}} />
                <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{risk.title}</Typography>
              </Box>
              <SeverityChip severity={risk.severity} />
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2, bgcolor: '#fff', overflow: 'hidden'}}>
        <Box sx={{px: 1.5, py: 1, borderBottom: '1px solid var(--planning-border)', display: 'flex', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 11, color: '#0F172A', fontWeight: 900}}>AGENT ACTIVITY <Box component="span" sx={{color: 'var(--planning-text-secondary)'}}>(Last 2 hours)</Box></Typography>
          <Button size="small" sx={{fontSize: 10, fontWeight: 900, textTransform: 'none'}}>View Full Log</Button>
        </Box>
        <Stack spacing={0.7} sx={{p: 1.5}}>
          {data.activity.map((item) => (
            <Box key={item.id} sx={{display: 'flex', gap: 1}}>
              <Typography sx={{fontSize: 10, color: 'var(--planning-text-secondary)', fontWeight: 700, flexShrink: 0}}>{item.timestamp}</Typography>
              <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 700}}>
                <Box component="span" sx={{fontWeight: 900}}>{item.agentName}</Box> {item.message}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>

      <Paper ref={scenarioRef} elevation={0} sx={{border: '1px solid var(--planning-border)', borderRadius: 2, bgcolor: '#fff', overflow: 'hidden'}}>
        <Box sx={{px: 1.5, py: 1, borderBottom: '1px solid var(--planning-border)', display: 'flex', justifyContent: 'space-between'}}>
          <Typography sx={{fontSize: 11, color: '#0F172A', fontWeight: 900}}>SCENARIO SIMULATION <Box component="span" sx={{color: 'var(--planning-text-secondary)'}}>(Quick Compare)</Box></Typography>
          <Button size="small" sx={{fontSize: 10, fontWeight: 900, textTransform: 'none'}}>View All Scenarios</Button>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{fontSize: 10, color: 'var(--planning-text-secondary)', fontWeight: 900}}>Scenario</TableCell>
              <TableCell sx={{fontSize: 10, color: 'var(--planning-text-secondary)', fontWeight: 900}}>Service Level</TableCell>
              <TableCell sx={{fontSize: 10, color: 'var(--planning-text-secondary)', fontWeight: 900}}>Material Risk</TableCell>
              <TableCell sx={{fontSize: 10, color: 'var(--planning-text-secondary)', fontWeight: 900}}>Capacity Overloaded Days</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.scenarios.map((scenario) => (
              <TableRow key={scenario.id} sx={{bgcolor: scenario.status === 'Recommended' ? '#DCFCE7' : '#fff'}}>
                <TableCell sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 900, py: 0.7}}>{scenario.scenarioName}</TableCell>
                <TableCell sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 900, py: 0.7}}>{scenario.serviceLevel}</TableCell>
                <TableCell sx={{fontSize: 11, color: scenario.materialRisk === 'Low' ? '#16A34A' : scenario.materialRisk === 'Medium' ? '#F59E0B' : '#DC2626', fontWeight: 900, py: 0.7}}>{scenario.materialRisk}</TableCell>
                <TableCell sx={{fontSize: 11, color: 'var(--planning-text-secondary)', fontWeight: 900, py: 0.7}}>{scenario.capacityOverloadDays}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}

function AgentDetailDialog({agent, onClose}: {agent: AgentCard | null; onClose: () => void}) {
  return (
    <Dialog open={Boolean(agent)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{fontSize: 16, fontWeight: 900}}>
        {agent?.name}
        <IconButton onClick={onClose} sx={{position: 'absolute', right: 8, top: 8}}><CloseIcon /></IconButton>
      </DialogTitle>
      {agent && (
        <DialogContent dividers>
          <Stack spacing={2}>
            <Box><Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)'}}>Source Signals</Typography><Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)'}}>{agent.sourceSignals.join(', ')}</Typography></Box>
            <Box><Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)'}}>Data Timestamp</Typography><Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)'}}>{agent.lastUpdated}</Typography></Box>
            <Box><Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)'}}>Insight Details</Typography>{agent.insight.map((line) => <Typography key={line} sx={{fontSize: 13, color: 'var(--planning-text-secondary)'}}>{line}</Typography>)}</Box>
            <Box><Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)'}}>Confidence Explanation</Typography><Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)'}}>{agent.confidenceExplanation}</Typography></Box>
            <Box><Typography sx={{fontSize: 11, fontWeight: 900, color: 'var(--planning-text-secondary)'}}>Impacted Planning Objects</Typography><Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)'}}>{agent.impactedObjects.join(', ')}</Typography></Box>
          </Stack>
        </DialogContent>
      )}
    </Dialog>
  );
}

function ActionDialog({
  mode,
  recommendation,
  reason,
  onReasonChange,
  onClose,
  onConfirm,
}: {
  mode: 'accept' | 'reject' | null;
  recommendation: AgenticRecommendation;
  reason: string;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const isAccept = mode === 'accept';
  return (
    <Dialog open={Boolean(mode)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{fontSize: 16, fontWeight: 900}}>{isAccept ? 'Accept Agentic Recommendation?' : 'Reject Recommendation'}</DialogTitle>
      <DialogContent dividers>
        <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 700, mb: 1.5}}>{recommendation.title}</Typography>
        {isAccept && (
          <Stack spacing={0.5} sx={{mb: 1.5}}>
            {recommendation.impactedObjects.map((object) => (
              <Typography key={object.objectId} sx={{fontSize: 12, color: '#475569'}}>{object.objectId}: {object.action}</Typography>
            ))}
          </Stack>
        )}
        <TextField
          fullWidth
          required
          multiline
          minRows={3}
          label={isAccept ? 'Reason code or comment' : 'Rejection reason'}
          value={reason}
          onChange={(event) => onReasonChange(event.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} sx={{textTransform: 'none'}}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm} disabled={!reason.trim()} sx={{textTransform: 'none', bgcolor: isAccept ? '#1D4ED8' : '#DC2626'}}>
          {isAccept ? 'Confirm' : 'Reject Recommendation'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function createInitialConnections(connections: AgentConnection[]): AgentConnection[] {
  if (!connections.length) return [];

  const blockedIndex = Math.floor(Math.random() * connections.length);
  return connections.map((connection, index) => ({
    ...connection,
    status: index === blockedIndex ? 'blocked' : 'active',
    label: index === blockedIndex ? 'Signal interrupted' : undefined,
  }));
}

function resolveConnections(connections: AgentConnection[]): AgentConnection[] {
  return connections.map((connection) => ({
    ...connection,
    status: connection.status === 'blocked' ? 'resolved' : 'active',
    label: undefined,
  }));
}

function formatActivityTimestamp() {
  return new Date().toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit', second: '2-digit'});
}

function decorateAgentsForConnections(agents: AgentCard[], connections: AgentConnection[]): AgentCard[] {
  const blockedConnection = connections.find((connection) => connection.status === 'blocked');
  const resolvedConnection = connections.find((connection) => connection.status === 'resolved');

  if (!blockedConnection && !resolvedConnection) return agents;

  return agents.map((agent) => {
    if (blockedConnection) {
      if (agent.id === blockedConnection.targetAgentId) {
        return {
          ...agent,
          state: 'Warning',
          status: 'Warning',
          insight: ['Signal interrupted upstream', 'Waiting for agent communication recovery', ...agent.insight.slice(0, 2)],
        };
      }

      if (agent.id === 'orchestrator') {
        return {
          ...agent,
          state: 'Warning',
          status: 'Warning',
          insight: ['Waiting for one agent signal before final synthesis.', 'Partial analysis available, recommendation pending recovery.'],
        };
      }
    }

    if (resolvedConnection) {
      if (agent.id === resolvedConnection.targetAgentId && agent.id !== 'orchestrator') {
        return {
          ...agent,
          state: 'Completed',
          status: 'No Issue',
          insight: ['Signal restored', 'Analysis resumed successfully', ...agent.insight.slice(0, 2)],
        };
      }

      if (agent.id === 'orchestrator') {
        return {
          ...agent,
          state: 'Recommendation Ready',
          status: 'Recommendation Ready',
          insight: ['All agent signals synchronized.', 'Recommendation regenerated with restored communication flow.'],
        };
      }
    }

    return agent;
  });
}

function createCorrectionActivity(connection: AgentConnection, agents: AgentCard[], demandId: string): AgentActivityItem[] {
  const agentsById = new Map(agents.map((agent) => [agent.id, agent]));
  const sourceName = agentsById.get(connection.sourceAgentId)?.name ?? connection.sourceAgentId;
  const targetName = agentsById.get(connection.targetAgentId)?.name ?? connection.targetAgentId;
  const timestamp = formatActivityTimestamp();

  return [
    {id: `${demandId}-flow-1-${Date.now()}`, timestamp, agentName: 'Planning Orchestrator', message: `detected communication issue between ${sourceName} and ${targetName}.`},
    {id: `${demandId}-flow-2-${Date.now()}`, timestamp, agentName: 'Planning Orchestrator', message: 'applied auto-correction to restore agent signal.'},
    {id: `${demandId}-flow-3-${Date.now()}`, timestamp, agentName: targetName, message: 'resumed analysis after signal recovery.'},
    {id: `${demandId}-flow-4-${Date.now()}`, timestamp, agentName: 'Planning Orchestrator', message: 'regenerated recommendation.'},
  ];
}

export default function AgenticView({
  groups,
  initialDemandId,
}: {
  groups: LineageDemandGroup[];
  initialDemandId?: string;
}) {
  const availableDemandIds = useMemo(() => new Set(groups.map((group) => group.id)), [groups]);
  const resolvedInitial = initialDemandId && availableDemandIds.has(initialDemandId)
    ? initialDemandId
    : groups.find((group) => group.id === DEFAULT_AGENTIC_DEMAND_ID)?.id ?? groups[0]?.id ?? '';
  const [selectedDemandId, setSelectedDemandId] = useState(resolvedInitial);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentCard | null>(null);
  const [actionMode, setActionMode] = useState<'accept' | 'reject' | null>(null);
  const [reason, setReason] = useState('');
  const [objectDialog, setObjectDialog] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<AgenticAuditLogItem[]>([]);
  const [showAlternative, setShowAlternative] = useState(false);
  const [loadingAlternative, setLoadingAlternative] = useState(false);
  const [lastRefreshSuffix, setLastRefreshSuffix] = useState('');
  const [analysisMessage, setAnalysisMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [connectionsByDemand, setConnectionsByDemand] = useState<Record<string, AgentConnection[]>>(() => {
    const initialData = AGENTIC_VIEW_BY_DEMAND[resolvedInitial] ?? AGENTIC_VIEW_BY_DEMAND[DEFAULT_AGENTIC_DEMAND_ID];
    return resolvedInitial ? {[resolvedInitial]: createInitialConnections(initialData.connections)} : {};
  });
  const [activityByDemand, setActivityByDemand] = useState<Record<string, AgentActivityItem[]>>({});
  const scenarioRef = useRef<HTMLDivElement | null>(null);
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialDemandId && availableDemandIds.has(initialDemandId)) setSelectedDemandId(initialDemandId);
  }, [initialDemandId, availableDemandIds]);

  useEffect(() => {
    if (!selectedDemandId) return;
    const demandData = AGENTIC_VIEW_BY_DEMAND[selectedDemandId] ?? AGENTIC_VIEW_BY_DEMAND[DEFAULT_AGENTIC_DEMAND_ID];
    setConnectionsByDemand((prev) => (
      prev[selectedDemandId]
        ? prev
        : {...prev, [selectedDemandId]: createInitialConnections(demandData.connections)}
    ));
  }, [selectedDemandId]);

  useEffect(() => () => {
    if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
  }, []);

  if (!groups.length || !selectedDemandId) {
    return (
      <Box sx={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <Typography sx={{fontSize: 14, color: 'var(--planning-text-muted)'}}>No demand group is selected for agent analysis.</Typography>
      </Box>
    );
  }

  const baseData = AGENTIC_VIEW_BY_DEMAND[selectedDemandId] ?? AGENTIC_VIEW_BY_DEMAND[DEFAULT_AGENTIC_DEMAND_ID];
  const liveConnections = connectionsByDemand[selectedDemandId] ?? createInitialConnections(baseData.connections);
  const liveActivity = activityByDemand[selectedDemandId] ?? [];
  const data: AgenticViewState = {
    ...baseData,
    agents: decorateAgentsForConnections(baseData.agents, liveConnections),
    connections: liveConnections,
    recommendation: showAlternative ? baseData.alternativeRecommendation : baseData.recommendation,
    activity: [...liveActivity, ...baseData.activity],
    lastAnalysisAt: lastRefreshSuffix || baseData.lastAnalysisAt,
  };
  const stale = data.lastAnalysisAt.includes('02/06/2026');

  function handleRunAnalysis() {
    const currentDemandId = selectedDemandId;
    const currentBaseData = baseData;
    const currentConnections = liveConnections;
    const blockedConnection = currentConnections.find((connection) => connection.status === 'blocked');

    if (successTimerRef.current) window.clearTimeout(successTimerRef.current);
    setSuccessMessage('');
    setAnalysisMessage('Running agent analysis... validating communication signals and planning constraints.');
    setIsRunning(true);
    window.setTimeout(() => {
      setLastRefreshSuffix(new Date().toLocaleString('en-GB', {day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'}));
      setConnectionsByDemand((prev) => ({
        ...prev,
        [currentDemandId]: resolveConnections(prev[currentDemandId] ?? currentConnections),
      }));
      if (blockedConnection) {
        setActivityByDemand((prev) => ({
          ...prev,
          [currentDemandId]: [
            ...createCorrectionActivity(blockedConnection, currentBaseData.agents, currentDemandId),
            ...(prev[currentDemandId] ?? []),
          ],
        }));
      }
      setAnalysisMessage('Issue detected in agent communication. Auto-correction applied successfully.');
      setSuccessMessage('Agent communication issue resolved. All agents are synchronized and the recommendation is ready.');
      setIsRunning(false);
      successTimerRef.current = window.setTimeout(() => setSuccessMessage(''), 5200);
    }, 1800);
  }

  function handleRequestAlternative() {
    setLoadingAlternative(true);
    window.setTimeout(() => {
      setShowAlternative(true);
      setLoadingAlternative(false);
    }, 1100);
  }

  function handleConfirmAction() {
    if (!actionMode || !reason.trim()) return;
    setAuditLog((prev) => [
      {
        recommendationId: data.recommendation.id,
        action: actionMode === 'accept' ? 'Accepted' : 'Rejected',
        user: 'Production Planner',
        timestamp: new Date().toISOString(),
        reason: reason.trim(),
        selectedDemandId,
        beforePlanId: data.beforePlanId,
        afterPlanId: data.afterPlanId,
      },
      ...prev,
    ]);
    setReason('');
    setActionMode(null);
  }

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden', position: 'relative'}}>
      <Box sx={{display: 'flex', flex: 1, minHeight: 0, overflow: 'auto'}}>
        <DemandPanel
          groups={groups}
          selectedDemandId={selectedDemandId}
          onSelect={(id) => {
            setSelectedDemandId(id);
            setShowAlternative(false);
            setAnalysisMessage('');
            setSuccessMessage('');
          }}
        />

        <Box sx={{flex: '1 0 1040px', minWidth: 0, display: 'flex', flexDirection: 'column', overflow: 'auto', bgcolor: 'var(--planning-background)'}}>
          <CanvasHeader data={data} loading={isRunning} stale={stale} analysisMessage={analysisMessage} onRun={handleRunAnalysis} />
          <AgenticCanvas
            agents={data.agents}
            connections={data.connections}
            recommendation={data.recommendation}
            onAgentClick={setSelectedAgent}
            loading={isRunning}
            successMessage={successMessage}
            onDismissSuccess={() => setSuccessMessage('')}
          />
        </Box>

        <RecommendationPanel
          recommendation={data.recommendation}
          loadingAlternative={loadingAlternative}
          onAccept={() => setActionMode('accept')}
          onReject={() => setActionMode('reject')}
          onCompare={() => scenarioRef.current?.scrollIntoView({behavior: 'smooth', block: 'center'})}
          onAlternative={handleRequestAlternative}
          onObjectClick={setObjectDialog}
        />
      </Box>

      <BottomPanels data={data} scenarioRef={scenarioRef} />

      {auditLog.length > 0 && (
        <Tooltip title={`${auditLog.length} local audit action(s) logged in this session`}>
          <Box sx={{position: 'absolute', right: 356, bottom: 12, bgcolor: '#0F172A', color: '#fff', px: 1.2, py: 0.6, borderRadius: 1, fontSize: 11, fontWeight: 800}}>
            Audit logged
          </Box>
        </Tooltip>
      )}

      <AgentDetailDialog agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      <ActionDialog
        mode={actionMode}
        recommendation={data.recommendation}
        reason={reason}
        onReasonChange={setReason}
        onClose={() => { setActionMode(null); setReason(''); }}
        onConfirm={handleConfirmAction}
      />
      <Dialog open={Boolean(objectDialog)} onClose={() => setObjectDialog(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{fontSize: 16, fontWeight: 900}}>Planning Object</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 700}}>
            {objectDialog} detail behavior will use the existing object page when the backend link is available.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setObjectDialog(null)} sx={{textTransform: 'none'}}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
