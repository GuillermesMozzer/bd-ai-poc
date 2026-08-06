import {useEffect, useMemo, useState} from 'react';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Tooltip,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  AddPhotoAlternate as ImageRequiredIcon,
  ArrowOutward as ArrowOutwardIcon,
  CalendarMonth as CalendarMonthIcon,
  Handyman as ToolsRequiredIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowBack as ArrowBackIcon,
  Block as BlockIcon,
  ChatBubbleOutline as CommentIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  DoneAll as DoneAllIcon,
  Place as PlaceIcon,
  PlayArrow as PlayArrowIcon,
  PrecisionManufacturing as EquipmentRequiredIcon,
  Refresh as RefreshIcon,
  ReportGmailerrorred as ReportIssueIcon,
  SaveOutlined as SaveOutlinedIcon,
  Undo as UndoIcon,
  UploadFile as UploadFileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import {
  workstationVisuals,
  tokenBrand,
  tokenSuccess,
  tokenWarning,
  tokenInfo,
  tokenNeutral,
  tokenError,
  tokenCommon,
  tokenText,
  tokenDivider,
  workstationStatusPillSx,
} from '../theme';
import type {WorkstationWidgetProps} from '../types';
import WidgetShell from './WidgetShell';
import {useShiftManagementContext} from '../../shiftManagement/contexts/ShiftManagementContext';
import {appendCilReviewQueueItem} from './cilActivityReviewStore';
import {appendCenterlineReviewQueueItem} from './centerlineActivityReviewStore';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  cilCenterlineNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';

type TaskStatus = 'scheduled' | 'completed' | 'draft' | 'waiting-review' | 'overdue';
type ExecutionStatus = 'pending' | 'completed' | 'na';
type RescheduleShift = 'Shift 1' | 'Shift 2' | 'Shift 3';

type CILTask = {
  id: string;
  type: 'CIL' | 'CL';
  title: string;
  zone: string;
  shortZone: string;
  time: string;
  status: TaskStatus;
};

type ExecutionTask = {
  id: string;
  station: string;
  stepCode: string;
  typeTags: string[];
  machineState: 'RUNNING / EXTERNAL' | 'STOPPED / INTERNAL';
  durationMin: number;
  description: string;
  executionStatus: ExecutionStatus;
  unit?: string;
  target?: number;
  tolerance?: number;
  valueInput?: string;
  recordedValue?: number;
  comments?: string[];
  issue?: string;
  requiresImageProof?: boolean;
  requiredEquipment?: string[];
  requiredTools?: string[];
  uploadedImages?: string[];
  taskStartedAt?: number;
  taskEndedAt?: number;
};

type CompletedFlowSeed = {
  replayId: string;
  mode: 'CIL' | 'CL';
  headerTitle?: string;
  elapsedSeconds?: number;
  comment?: string;
  responsible?: string;
};

type CilCenterlineLauncherRequest = {
  mode: 'CIL' | 'CL';
  taskId?: string;
  nonce: number;
};

type ExecutionChatCommand = {
  action: 'open-instructions' | 'prefill-comment' | 'save-comment' | 'record-value' | 'record-value-complete' | 'complete-active' | 'report-issue';
  stepId?: string;
  value?: string;
  comment?: string;
};

type DraftExecutionSnapshot = {
  mode: 'CIL' | 'CL';
  headerTitle: string;
  typeLabel: 'CIL' | 'CL';
  elapsedSeconds: number;
  tasks: ExecutionTask[];
};

const CILTasks: CILTask[] = [
  {id: 'cil-1', type: 'CIL', title: 'AFA1-10 Zone 1', zone: 'Zone A Cutter', shortZone: 'Z1', time: '10:00', status: 'scheduled'},
  {id: 'cil-line-status-z2', type: 'CIL', title: 'AFA1-10 Zone 2', zone: 'Zone B Tipper', shortZone: 'Z2', time: '11:00', status: 'scheduled'},
  {id: 'cil-2', type: 'CIL', title: 'AFA1-10 Zone 4', zone: 'Zone D Mixer', shortZone: 'Z4', time: '15:45', status: 'scheduled'},
];

const centerlineTasks: CILTask[] = [
  {id: 'cl-1', type: 'CL', title: 'Z1 Main Indexer', zone: 'Zone A Main Indexer', shortZone: 'Z1', time: '06:00', status: 'completed'},
  {id: 'cl-2', type: 'CL', title: 'Z2 Tipper Unit', zone: 'Zone B Tipper', shortZone: 'Z2', time: '06:00', status: 'scheduled'},
  {id: 'cl-3', type: 'CL', title: 'Z3 Assembly Press', zone: 'Zone C Press', shortZone: 'Z3', time: '14:30', status: 'scheduled'},
];

const executionSeedTasks: ExecutionTask[] = [
  {id: 't-1', station: 'Central Pneumatic Air', stepCode: '1.1', typeTags: ['Symbol 1', 'CIL', 'INSPECT'], machineState: 'RUNNING / EXTERNAL', durationMin: 5, description: 'Location: In above area of sealing station. Inspect air pressure gauge main inlet (range 98 to 100 PSI) is set.', executionStatus: 'pending'},
  {id: 't-2', station: 'Central Pneumatic Air', stepCode: '1.2', typeTags: ['Symbol 1', 'CIL', 'INSPECT'], machineState: 'RUNNING / EXTERNAL', durationMin: 4, description: 'Location: In above area of sealing station. Hoses without breaks or bends.', executionStatus: 'pending', requiresImageProof: true, requiredEquipment: ['Flashlight', 'Inspection mirror'], requiredTools: ['Clamp plier']},
  {id: 't-3', station: 'Pneumatic Air Central', stepCode: '2.1', typeTags: ['Symbol 2', 'CIL', 'INSPECT'], machineState: 'RUNNING / EXTERNAL', durationMin: 5, description: 'Location: Below area of marking laser station. Feed train air pressure gauge main inlet (range 96 to 100 PSI).', executionStatus: 'pending'},
  {id: 't-4', station: 'Pneumatic Air Central', stepCode: '2.2', typeTags: ['Symbol 2', 'CIL', 'INSPECT'], machineState: 'RUNNING / EXTERNAL', durationMin: 4, description: 'Location: Below area of marking laser station. Hoses without breaks or bends.', executionStatus: 'pending', requiredEquipment: ['Safety glasses'], requiredTools: ['6mm Allen key']},
];

const centerlineExecutionSeedTasks: ExecutionTask[] = [
  {id: 'clt-1', station: 'Z2 Tipper pneumatic manifold', stepCode: 'CL-1.1', typeTags: ['CENTERLINE', 'PRESSURE'], machineState: 'RUNNING / EXTERNAL', durationMin: 3, description: 'Measure tipper main air pressure at the regulator gauge before releasing the first morning lot.', executionStatus: 'pending', unit: 'bar', target: 5.2, tolerance: 0.3, requiredEquipment: ['Calibrated pressure gauge']},
  {id: 'clt-2', station: 'Z2 Tipper servo drive', stepCode: 'CL-1.2', typeTags: ['CENTERLINE', 'SPEED'], machineState: 'RUNNING / EXTERNAL', durationMin: 3, description: 'Verify tipper cycle speed on the HMI at standard production rate.', executionStatus: 'pending', unit: 'rpm', target: 120, tolerance: 5, requiredTools: ['HMI access badge']},
  {id: 'clt-3', station: 'Z2 Tipper bearing housing', stepCode: 'CL-1.3', typeTags: ['CENTERLINE', 'TEMPERATURE'], machineState: 'RUNNING / EXTERNAL', durationMin: 3, description: 'Measure bearing housing temperature after warm-up and attach the controller screen image.', executionStatus: 'pending', unit: 'C', target: 62, tolerance: 4, requiresImageProof: true, requiredEquipment: ['IR thermometer'], requiredTools: ['HMI access badge']},
];

const centerlineReviewExecutionSeedTasks: ExecutionTask[] = [
  {id: 'clr-1', station: 'Main pneumatic manifold', stepCode: 'CL-R1', typeTags: ['CENTERLINE', 'PRESSURE'], machineState: 'RUNNING / EXTERNAL', durationMin: 3, description: 'Measure main forming air pressure at the manifold gauge.', executionStatus: 'pending', unit: 'bar', target: 5.2, tolerance: 0.3},
  {id: 'clr-2', station: 'Indexer servo drive', stepCode: 'CL-R2', typeTags: ['CENTERLINE', 'SPEED'], machineState: 'RUNNING / EXTERNAL', durationMin: 2, description: 'Validate indexer speed stability on the HMI.', executionStatus: 'pending', unit: 'rpm', target: 120, tolerance: 5},
  {id: 'clr-3', station: 'Pre-heat platen', stepCode: 'CL-R3', typeTags: ['CENTERLINE', 'TEMPERATURE'], machineState: 'RUNNING / EXTERNAL', durationMin: 2, description: 'Confirm pre-heat platen temperature before first production lot.', executionStatus: 'pending', unit: 'C', target: 185, tolerance: 3},
  {id: 'clr-4', station: 'Film feed tensioner', stepCode: 'CL-R4', typeTags: ['CENTERLINE', 'TENSION'], machineState: 'RUNNING / EXTERNAL', durationMin: 2, description: 'Measure bottom-film feed tension after speed ramp-up.', executionStatus: 'pending', unit: 'N', target: 42, tolerance: 4},
];

const scrollableSx = {
  overflowY: 'auto',
} as const;

const compactPanelSx = {
  border: '1px solid rgba(15, 23, 42, 0.06)',
  borderRadius: '8px',
  p: 1.5,
  bgcolor: tokenCommon.white,
} as const;

const sectionHeadingSx = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: workstationVisuals.textPrimary || '#0F172A',
  fontFamily: workstationVisuals.fontFamily,
} as const;

const metricLabelSx = {
  fontSize: '0.72rem',
  color: workstationVisuals.textPrimary || '#0F172A',
  fontWeight: 500,
  lineHeight: 1.2,
  fontFamily: workstationVisuals.fontFamily,
} as const;

const metricNoteSx = {
  fontSize: '0.62rem',
  color: workstationVisuals.textSecondary || '#64748B',
  fontFamily: workstationVisuals.fontFamily,
} as const;

const filterButtonSx = {
  height: 26,
  borderRadius: '8px',
  px: 1.25,
  border: '1px solid rgba(15, 23, 42, 0.08)',
  color: 'rgba(15, 23, 42, 0.7)',
  bgcolor: tokenCommon.white,
  textTransform: 'none',
  fontSize: '0.72rem',
  fontWeight: 500,
  fontFamily: workstationVisuals.fontFamily,
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: tokenNeutral.lightest,
    borderColor: 'rgba(15, 23, 42, 0.16)',
  },
  '& .MuiButton-startIcon': {mr: 0.3, '& svg': {fontSize: 13}},
  '& .MuiButton-endIcon': {ml: 0.2, '& svg': {fontSize: 13}},
} as const;

function formatSeconds(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function parseNumericInput(rawValue?: string): number | null {
  if (!rawValue) return null;
  const normalized = rawValue.trim().replace(',', '.');
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function hasImageProof(task?: ExecutionTask | null) {
  if (!task) return false;
  if (!task.requiresImageProof) return true;
  return (task.uploadedImages?.length ?? 0) > 0;
}

function hasCommentGate(task?: ExecutionTask | null) {
  if (!task) return false;
  const hasComment = Boolean(task.comments?.length);
  if (!hasComment) return false;
  return hasImageProof(task);
}

function formatMinutesLabel(minutes: number) {
  const totalSeconds = Math.round(minutes * 60);
  const minPart = Math.floor(totalSeconds / 60);
  const secPart = totalSeconds % 60;
  return secPart === 0 ? `${minPart}m` : `${minPart}m ${String(secPart).padStart(2, '0')}s`;
}

function formatDateTimeLabel(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

function sumExpectedMinutes(tasks: ExecutionTask[]) {
  return tasks.reduce((sum, task) => sum + task.durationMin, 0);
}

function sanitizeTaskSnippet(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function createActivityId(prefix: 'ACT' | 'CL') {
  const suffix = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${suffix}`;
}

function StatusChip({status}: {status: TaskStatus}) {
  const isCompleted = status === 'completed';
  const isDraft = status === 'draft';
  const isWaitingReview = status === 'waiting-review';
  const isOverdue = status === 'overdue';
  return <Chip size="small" label={isCompleted ? 'Completed' : isDraft ? 'Draft' : isWaitingReview ? 'Waiting Review' : isOverdue ? 'Overdue' : 'Pending'} sx={{height: 28, borderRadius: 14, fontWeight: 700, bgcolor: isCompleted ? '#E9F8EC' : isDraft ? '#FFF7E6' : isWaitingReview ? '#EFF6FF' : isOverdue ? '#FEE2E2' : tokenNeutral.lightest, color: isCompleted ? '#2EA75A' : isDraft ? '#B45309' : isWaitingReview ? '#1D4ED8' : isOverdue ? '#DC2626' : workstationVisuals.textSecondary, border: `1px solid ${isCompleted ? '#8FD0A3' : isDraft ? '#F2BE8E' : isWaitingReview ? '#93C5FD' : isOverdue ? '#FCA5A5' : tokenDivider}`, fontFamily: workstationVisuals.fontFamily}} />;
}

type KpiTone = 'blue' | 'green' | 'amber' | 'teal' | 'red' | 'neutral';

interface KpiData {
  title: string;
  value: string | number;
  subtitle?: string;
  tone?: KpiTone;
  trendLabel?: string;
  trendPositive?: boolean;
  trendValues: number[];
  trendBars?: boolean;
}

function MiniTrend({values, color = '#1D4ED8', bars = false}: {values: number[]; color?: string; bars?: boolean}) {
  if (bars) {
    return (
      <Box sx={{display: 'flex', alignItems: 'flex-end', gap: 0.28, width: 42, height: 14, flexShrink: 0}}>
        {values.map((value, index) => (
          <Box key={`bar-${index}`} sx={{width: 4, borderRadius: 0.7, height: `${Math.max(22, Math.min(100, value))}%`, bgcolor: color, opacity: 0.2 + index * 0.07}} />
        ))}
      </Box>
    );
  }
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(1, max - min);
  const chartHeight = 12;
  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = chartHeight - ((value - min) / range) * chartHeight;
      return `${x},${y}`;
    })
    .join(' ');
  return (
    <Box component="svg" viewBox="0 0 100 14" preserveAspectRatio="none" sx={{width: 46, height: 14, flexShrink: 0}}>
      <line x1="0" y1="13" x2="100" y2="13" stroke="#E5E7EB" strokeWidth="1" />
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </Box>
  );
}

function TrendTag({label, positive = true}: {label: string; positive?: boolean}) {
  return <Typography sx={{fontSize: '0.62rem', fontWeight: 700, color: positive ? tokenSuccess.main : tokenError.main, fontFamily: workstationVisuals.fontFamily, lineHeight: 1, flexShrink: 0}}>{label}</Typography>;
}

function PerfKpiCard({
  title,
  value,
  subtitle,
  tone = 'neutral',
  trendLabel,
  trendPositive = true,
  trendValues,
  trendBars = false,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  tone?: KpiTone;
  trendLabel?: string;
  trendPositive?: boolean;
  trendValues?: number[];
  trendBars?: boolean;
}) {
  const isOverdueKpi = title.toLowerCase().includes('overdue');
  const toneColor = isOverdueKpi
    ? tokenError.main
    : tone === 'blue'
    ? tokenBrand.main
    : tone === 'green'
      ? tokenSuccess.main
      : tone === 'amber'
        ? tokenWarning.main
        : tone === 'teal'
          ? tokenInfo.main
          : tone === 'red'
            ? tokenError.main
          : workstationVisuals.textPrimary || '#0F172A';

  return (
    <Box sx={{minWidth: 0, p: 0.5, pl: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.55}}>
      <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.8, minWidth: 0}}>
        <Typography sx={{fontSize: '1.25rem', fontWeight: 600, lineHeight: 1, color: toneColor, fontFamily: workstationVisuals.fontFamily, flexShrink: 0}}>{value}</Typography>
        <Typography sx={{...metricLabelSx, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{title}</Typography>
      </Box>
      {subtitle || trendLabel || trendValues?.length ? (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, minHeight: 16, minWidth: 0, overflow: 'hidden'}}>
          {subtitle ? <Typography sx={{...metricNoteSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{subtitle}</Typography> : null}
          {trendLabel ? <TrendTag label={trendLabel} positive={trendPositive} /> : null}
          {trendValues?.length ? <MiniTrend values={trendValues} color={toneColor} bars={trendBars} /> : null}
        </Box>
      ) : null}
    </Box>
  );
}

function CompactTaskRow({
  task,
  actionColor,
  reminderEquipment,
  reminderTools,
  onStart,
}: {
  task: CILTask;
  actionColor: string;
  reminderEquipment: string[];
  reminderTools: string[];
  onStart?: () => void;
}) {
  const taskName = task.type === 'CL' ? 'Centerline' : 'CIL';
  const canStart = task.status === 'scheduled' || task.status === 'draft';

  return (
    <Box sx={{
      ...compactPanelSx,
      display: 'grid',
      gridTemplateColumns: {xs: '1fr', md: 'minmax(0, 1.5fr) minmax(0, 1fr) 112px'},
      gap: 1.2,
      alignItems: 'center',
      p: 1.35,
      flexShrink: 0,
    }}>
      <Box sx={{minWidth: 0}}>
        <Typography sx={sectionHeadingSx}>
          {`Today's ${taskName}`}
        </Typography>
        <Typography sx={{...metricNoteSx, mt: 0.45}}>
          May 12, 2026 - {task.time}
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.75, minWidth: 0, flexWrap: 'wrap'}}>
          <Chip label={task.type} size="small" sx={{height: 22, borderRadius: '8px', bgcolor: task.type === 'CL' ? tokenWarning.lightest : tokenNeutral.lighter, color: task.type === 'CL' ? tokenWarning.dark : tokenBrand.main, fontWeight: 900, '& .MuiChip-label': {px: 0.75, fontSize: '0.68rem'}}} />
          <Typography sx={{fontSize: '0.78rem', color: workstationVisuals.textPrimary || '#0F172A', fontWeight: 700, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
            {task.zone}
          </Typography>
          <Typography sx={{...metricNoteSx, color: workstationVisuals.textSecondary || '#64748B'}}>
            {task.shortZone}
          </Typography>
        </Box>
      </Box>
      <Box sx={{minWidth: 0}}>
        <Typography sx={sectionHeadingSx}>
          Reminder
        </Typography>
        <Typography sx={{...metricNoteSx, mt: 0.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {reminderEquipment.length ? `Equipment: ${reminderEquipment.slice(0, 2).join(', ')}` : 'No equipment required'}
        </Typography>
        <Typography sx={{...metricNoteSx, mt: 0.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {reminderTools.length ? `Tools: ${reminderTools.slice(0, 2).join(', ')}` : 'No tools required'}
        </Typography>
      </Box>
      <Box sx={{
        display: 'flex',
        flexDirection: {xs: 'row', md: 'column'},
        alignItems: {xs: 'center', md: 'flex-end'},
        justifyContent: {xs: 'space-between', md: 'center'},
        gap: 0.75,
        width: {xs: '100%', md: 112},
      }}>
        {task.status === 'scheduled' ? (
          <Box component="span" sx={{...workstationStatusPillSx('neutral'), borderRadius: '8px'}}>
            <AccessTimeIcon sx={{fontSize: 14, mr: 0.4}} />
            Pending
          </Box>
        ) : (
          <StatusChip status={task.status} />
        )}
        {canStart ? (
          <Button
            onClick={onStart}
            variant="contained"
            startIcon={<PlayArrowIcon sx={{fontSize: '0.9rem'}} />}
            sx={{textTransform: 'none', borderRadius: '8px', fontWeight: 600, bgcolor: actionColor, color: tokenCommon.white, minHeight: 30, fontSize: '0.72rem', fontFamily: workstationVisuals.fontFamily, '&:hover': {bgcolor: actionColor, opacity: 0.92}}}
          >
            {task.status === 'draft' ? 'Resume' : task.type === 'CIL' ? 'Start CIL' : 'Start CL'}
          </Button>
        ) : null}
      </Box>
    </Box>
  );
}

function FullTaskRow({task, onStart}: {task: CILTask; onStart?: () => void}) {
  const taskColor = task.type === 'CIL' ? workstationVisuals.blue : workstationVisuals.amber;
  const rowBg = task.status === 'completed' ? '#EDF8F0' : task.status === 'overdue' ? '#FEF2F2' : workstationVisuals.tierSurface;
  const rowBorder = task.status === 'completed' ? '#9FD9B2' : task.status === 'overdue' ? '#FCA5A5' : workstationVisuals.tierBorder;

  return (
    <Paper elevation={0} sx={{borderRadius: 2, border: `1px solid ${rowBorder}`, bgcolor: rowBg, p: 1.6, display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr auto'}, gap: 1, alignItems: 'center'}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0}}>
        <Chip size="small" label={task.type} sx={{height: 28, borderRadius: 14, fontWeight: 800, bgcolor: task.type === 'CIL' ? workstationVisuals.blueSoft : workstationVisuals.amberSoft, color: taskColor, border: `1px solid color-mix(in srgb, ${taskColor} 33%, transparent)`, fontFamily: workstationVisuals.fontFamily}} />
        <Typography sx={{fontWeight: 800, color: workstationVisuals.tierTextHeading, fontFamily: workstationVisuals.fontFamily}}>{task.title}</Typography>
        <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.35, color: workstationVisuals.tierTextMeta}}>
          <PlaceIcon sx={{fontSize: '0.95rem'}} />
          <Typography sx={{fontFamily: workstationVisuals.fontFamily}}>{task.shortZone}</Typography>
        </Box>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.2, flexWrap: 'wrap'}}>
        <Typography sx={{fontWeight: 800, color: workstationVisuals.tierTextHeading, fontFamily: workstationVisuals.fontFamily}}>{task.time}</Typography>
        <StatusChip status={task.status} />
        {task.status === 'scheduled' || task.status === 'draft' ? <Button onClick={onStart} variant="contained" startIcon={<PlayArrowIcon sx={{fontSize: '1rem'}} />} sx={{textTransform: 'none', borderRadius: 2, fontWeight: 800, fontFamily: workstationVisuals.fontFamily, bgcolor: taskColor, color: '#FFFFFF', '&:hover': {bgcolor: taskColor, opacity: 0.92}}}>{task.status === 'draft' ? 'Resume' : task.type === 'CIL' ? 'Start CIL' : 'Start CL'}</Button> : null}
      </Box>
    </Paper>
  );
}

type WorkstationCilCenterlineWidgetProps = WorkstationWidgetProps & {
  completedFlowSeed?: CompletedFlowSeed;
  onBackToCilCenterline?: () => void;
  onExecutionClose?: () => void;
  flowMode?: 'CIL' | 'CL' | 'ALL';
  titleOverride?: string;
  onOpenFullScreen?: () => void;
  reviewMode?: 'line-leader';
  onCompleteReview?: () => void;
  onReturnReview?: () => void;
  pageLayout?: boolean;
  headlessLauncher?: boolean;
  launcherRequest?: CilCenterlineLauncherRequest | null;
};

export default function WorkstationCilCenterlineWidget({
  className,
  completedFlowSeed,
  onBackToCilCenterline,
  onExecutionClose,
  flowMode = 'ALL',
  titleOverride,
  onExpand,
  onOpenFullScreen,
  reviewMode,
  onCompleteReview,
  onReturnReview,
  pageLayout = false,
  headlessLauncher = false,
  launcherRequest,
  style,
}: WorkstationCilCenterlineWidgetProps) {
  const {setIsShiftEntryOpen, setShiftEntryMode, setShiftEntryMaintenancePrefill} = useShiftManagementContext().logbook;
  const notifications = useWidgetNotifications(cilCenterlineNotificationConfig);
  const operatorName = 'Delila Bran';
  const currentDateLabel = new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
  const isLineLeaderReview = reviewMode === 'line-leader';
  const isReplayReadOnly = Boolean(completedFlowSeed) && !isLineLeaderReview;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExecutionOpen, setIsExecutionOpen] = useState(false);
  const [isChatExecutionActive, setIsChatExecutionActive] = useState(false);
  const [executionMode, setExecutionMode] = useState<'CIL' | 'CL'>('CIL');
  const [executionTypeLabel, setExecutionTypeLabel] = useState<'CIL' | 'CL'>('CIL');
  const [executionHeaderTitle, setExecutionHeaderTitle] = useState('CIL Execution - Z1');
  const [executionTasks, setExecutionTasks] = useState<ExecutionTask[]>(executionSeedTasks);
  const [executionStartedAt, setExecutionStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [cilTaskList, setCilTaskList] = useState<CILTask[]>(CILTasks);
  const [centerlineTaskList, setCenterlineTaskList] = useState<CILTask[]>(centerlineTasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [draftSnapshots, setDraftSnapshots] = useState<Record<string, DraftExecutionSnapshot>>({});
  const [commentEditorTaskId, setCommentEditorTaskId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [instructionTask, setInstructionTask] = useState<ExecutionTask | null>(null);
  const [instructionPanelsOpen, setInstructionPanelsOpen] = useState<{documentation: boolean; images: boolean; videos: boolean}>({documentation: true, images: true, videos: true});
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleTaskId, setRescheduleTaskId] = useState<string | null>(null);
  const [rescheduleCurrentDate, setRescheduleCurrentDate] = useState('');
  const [rescheduleNewDate, setRescheduleNewDate] = useState('');
  const [rescheduleShift, setRescheduleShift] = useState<RescheduleShift>('Shift 1');
  const [rescheduleJustification, setRescheduleJustification] = useState('');

  useEffect(() => {
    if (!isExecutionOpen || executionStartedAt === null) return;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - executionStartedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [executionStartedAt, isExecutionOpen]);

  const showCilTasks = flowMode !== 'CL';
  const showCenterlineTasks = flowMode !== 'CIL';
  const cilExpectedTotalMinutes = useMemo(() => sumExpectedMinutes(executionSeedTasks), []);
  const clExpectedTotalMinutes = useMemo(() => sumExpectedMinutes(centerlineExecutionSeedTasks), []);
  const cilReminder = useMemo(() => ({
    equipment: Array.from(new Set(executionSeedTasks.flatMap((task) => task.requiredEquipment ?? []))),
    tools: Array.from(new Set(executionSeedTasks.flatMap((task) => task.requiredTools ?? []))),
  }), []);
  const clReminder = useMemo(() => ({
    equipment: Array.from(new Set(centerlineExecutionSeedTasks.flatMap((task) => task.requiredEquipment ?? []))),
    tools: Array.from(new Set(centerlineExecutionSeedTasks.flatMap((task) => task.requiredTools ?? []))),
  }), []);
  const executionExpectedMinutes = useMemo(() => sumExpectedMinutes(executionTasks), [executionTasks]);
  const cilAverageMinutes = useMemo(() => cilExpectedTotalMinutes / Math.max(1, executionSeedTasks.length), [cilExpectedTotalMinutes]);
  const clAverageMinutes = useMemo(() => clExpectedTotalMinutes / Math.max(1, centerlineExecutionSeedTasks.length), [clExpectedTotalMinutes]);
  const widgetTitle = titleOverride ?? (flowMode === 'CIL' ? 'CIL' : flowMode === 'CL' ? 'Centerline' : 'CIL & Centerline');
  const widgetTaskLabel = flowMode === 'CL' ? 'Centerline Tasks' : flowMode === 'CIL' ? 'CIL Tasks' : 'CIL & Centerline Tasks';
  const visibleTaskCatalog = useMemo(() => {
    if (flowMode === 'CIL') return cilTaskList;
    if (flowMode === 'CL') return centerlineTaskList;
    return [...cilTaskList, ...centerlineTaskList];
  }, [flowMode, cilTaskList, centerlineTaskList]);
  const pendingCount = useMemo(() => visibleTaskCatalog.filter((task) => task.status !== 'completed').length, [visibleTaskCatalog]);
  const doneCount = useMemo(() => visibleTaskCatalog.filter((task) => task.status === 'completed').length, [visibleTaskCatalog]);
  const filteredExecutionTasks = executionTasks;
  const cilCompletedToday = cilTaskList.filter((task) => task.status === 'completed').length;
  const clCompletedToday = centerlineTaskList.filter((task) => task.status === 'completed').length;
  const cilRemainingToday = cilTaskList.filter((task) => task.status !== 'completed').length;
  const clRemainingToday = centerlineTaskList.filter((task) => task.status !== 'completed').length;
  const cilPerfKpis = [
    {title: 'Completed', value: 128 + cilCompletedToday, subtitle: 'vs last month', tone: 'blue' as const, trendLabel: '+12%', trendPositive: true, trendValues: [24, 35, 28, 40, 33, 46, 52], trendBars: true},
    {title: 'Avg. Execution Time', value: formatMinutesLabel(cilAverageMinutes), subtitle: `Expected total: ${cilExpectedTotalMinutes} min`, tone: 'amber' as const, trendLabel: '-3%', trendPositive: false, trendValues: [62, 61, 63, 60, 59, 61, 60]},
    {title: 'On-Time Rate', value: '92%', subtitle: 'vs last month', tone: 'green' as const, trendLabel: '+6%', trendPositive: true, trendValues: [88, 89, 87, 90, 91, 92, 92]},
    {title: 'Remaining Today', value: cilRemainingToday, subtitle: `Total today: ${cilTaskList.length}`, tone: 'teal' as const, trendValues: [80, 70, 60, 50, 45, 35, 25]},
  ];
  const clPerfKpis = [
    {title: 'Completed', value: 84 + clCompletedToday, subtitle: 'vs last month', tone: 'green' as const, trendLabel: '+9%', trendPositive: true, trendValues: [18, 24, 22, 28, 30, 35, 38], trendBars: true},
    {title: 'Avg. Execution Time', value: formatMinutesLabel(clAverageMinutes), subtitle: `Expected total: ${clExpectedTotalMinutes} min`, tone: 'amber' as const, trendLabel: '-2%', trendPositive: false, trendValues: [43, 42, 41, 40, 41, 40, 39]},
    {title: 'On-Time Rate', value: '95%', subtitle: 'vs last month', tone: 'green' as const, trendLabel: '+7%', trendPositive: true, trendValues: [90, 91, 92, 93, 94, 95, 95]},
    {title: 'Remaining Today', value: clRemainingToday, subtitle: `Total today: ${centerlineTaskList.length}`, tone: 'teal' as const, trendValues: [70, 65, 60, 45, 35, 28, 20]},
  ];
  const activeTaskList = flowMode === 'CL'
    ? centerlineTaskList
    : flowMode === 'CIL'
      ? cilTaskList
      : visibleTaskCatalog;
  const activePerformanceKpis = flowMode === 'CL' ? clPerfKpis : cilPerfKpis;
  const activePerformanceTitle = flowMode === 'CL' ? 'Centerline Performance' : 'CIL Performance';
  const activityListTitle = flowMode === 'CL' ? "Today's Centerline Activities" : flowMode === 'CIL' ? "Today's CIL Activities" : "Today's CIL & Centerline Activities";
  const renderPerformanceBlock = (title: string, kpis: KpiData[]) => (
    <Box sx={{...compactPanelSx, flexShrink: 0, overflow: 'hidden'}}>
      <Typography sx={{...sectionHeadingSx, mb: 1}}>
        {title}
      </Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, minHeight: 0}}>
        {kpis.map((kpi, index) => (
          <Box
            key={`${title}-${kpi.title}`}
            sx={{borderRight: index < kpis.length - 1 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none', minWidth: 0}}
          >
            <PerfKpiCard
              title={kpi.title}
              value={kpi.value}
              subtitle={kpi.subtitle}
              tone={kpi.tone}
              trendLabel={kpi.trendLabel}
              trendPositive={kpi.trendPositive}
              trendValues={kpi.trendValues}
              trendBars={kpi.trendBars}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );

  const completedOrCommentedExecution = executionTasks.filter((task) => task.executionStatus === 'completed' || hasCommentGate(task)).length;
  const doneExecution = completedOrCommentedExecution;
  const activeExecutionTask = executionMode === 'CL'
    ? centerlineTaskList.find((task) => task.id === activeTaskId)
    : cilTaskList.find((task) => task.id === activeTaskId);
  const executionEquipmentLabel = activeExecutionTask?.title ?? 'AFA1-10 Zone 1';
  const startExecution = (mode: 'CIL' | 'CL', taskId?: string, openExecutionModal = true) => {
    const isCenterline = mode === 'CL';
    const selectedTask = taskId
      ? (isCenterline ? centerlineTaskList : cilTaskList).find((task) => task.id === taskId)
      : undefined;
    setActiveTaskId(taskId ?? null);
    if (taskId) {
      const snapshot = draftSnapshots[taskId];
      if (snapshot && snapshot.mode === mode) {
        const resumedStart = Date.now() - snapshot.elapsedSeconds * 1000;
        setActiveTaskId(taskId);
        setExecutionMode(snapshot.mode);
        setExecutionTypeLabel(snapshot.typeLabel);
        setExecutionHeaderTitle(snapshot.headerTitle);
        setExecutionTasks(snapshot.tasks);
        setElapsedSeconds(snapshot.elapsedSeconds);
        setExecutionStartedAt(resumedStart);
        setIsExecutionOpen(openExecutionModal);
        setIsChatExecutionActive(!openExecutionModal);
        return;
      }
    }
    setExecutionMode(mode);
    setExecutionTypeLabel(isCenterline ? 'CL' : 'CIL');
    setExecutionHeaderTitle(isCenterline ? `Centerline Verification - ${selectedTask?.shortZone ?? 'Z1'}` : `CIL Execution - ${selectedTask?.shortZone ?? 'Z1'}`);
    const seeded = (isCenterline ? centerlineExecutionSeedTasks : executionSeedTasks).map((task, index) => ({
      ...task,
      executionStatus: 'pending' as ExecutionStatus,
      valueInput: '',
      recordedValue: undefined,
      comments: [],
      uploadedImages: [],
      issue: undefined,
      taskStartedAt: index === 0 ? Date.now() : undefined,
      taskEndedAt: undefined,
    }));
    setExecutionTasks(seeded);
    setElapsedSeconds(0);
    setExecutionStartedAt(Date.now());
    setIsExecutionOpen(openExecutionModal);
    setIsChatExecutionActive(!openExecutionModal);
  };

  useEffect(() => {
    if (!launcherRequest) return;
    startExecution(launcherRequest.mode, launcherRequest.taskId);
  }, [launcherRequest?.nonce]);

  useEffect(() => {
    const handlePrepareChatExecution = (event: Event) => {
      if (!headlessLauncher) return;
      const detail = (event as CustomEvent<{mode?: 'CIL' | 'CL' | 'Changeover'; taskId?: string}>).detail;
      if (detail?.mode !== 'CIL' && detail?.mode !== 'CL') {
        setIsChatExecutionActive(false);
        return;
      }
      startExecution(detail.mode, detail.taskId, false);
    };

    window.addEventListener('workstation:prepare-execution-chat-context', handlePrepareChatExecution);
    return () => window.removeEventListener('workstation:prepare-execution-chat-context', handlePrepareChatExecution);
  }, [centerlineTaskList, cilTaskList, draftSnapshots, headlessLauncher]);

  useEffect(() => {
    if (!completedFlowSeed) return;
    const isCenterline = completedFlowSeed.mode === 'CL';
    const hasLeakComment = (completedFlowSeed.comment ?? '').toLowerCase().includes('vazamento');
    const isLeakMockReplay = completedFlowSeed.replayId === 'cil-review-mock-replay-1';
    const isCenterlineMockReplay = completedFlowSeed.replayId === 'centerline-review-mock-replay-1';
    const now = Date.now();
    const elapsed = Math.max(0, completedFlowSeed.elapsedSeconds ?? 0);
    const startedAt = now - elapsed * 1000;
    const sourceSeedTasks = isCenterline
      ? (isCenterlineMockReplay ? centerlineReviewExecutionSeedTasks : centerlineExecutionSeedTasks)
      : executionSeedTasks;
    const seeded = sourceSeedTasks.map((task, index) => {
      const commentBase = completedFlowSeed.comment
        ? [`Execution note: ${completedFlowSeed.comment}`]
        : ['Execution note: Task completed during operator shift.'];
      const withOwner = completedFlowSeed.responsible
        ? [...commentBase, `Responsible operator: ${completedFlowSeed.responsible}`]
        : commentBase;
      const isCommentOnlyTask = ((hasLeakComment || isLeakMockReplay) && !isCenterline && index === 0)
        || (isCenterlineMockReplay && isCenterline && index === 0);
      return {
        ...task,
        executionStatus: isCommentOnlyTask ? 'pending' as ExecutionStatus : 'completed' as ExecutionStatus,
        valueInput: isCenterline && !isCommentOnlyTask ? String(task.target ?? 1) : '',
        recordedValue: isCenterline && !isCommentOnlyTask ? (task.target ?? 1) : undefined,
        comments: isCommentOnlyTask
          ? [isCenterline
            ? 'Unable to complete pre-heat temperature measurement after pressure and speed were confirmed. Activity must be rescheduled.'
            : 'Unable to execute due to a line leakage. Activity must be rescheduled.']
          : withOwner,
        issue: undefined,
        taskStartedAt: startedAt + index * 15000,
        taskEndedAt: isCommentOnlyTask ? undefined : startedAt + (index + 1) * 15000,
      };
    });
    setExecutionMode(completedFlowSeed.mode);
    setExecutionTypeLabel(isCenterline ? 'CL' : 'CIL');
    setExecutionHeaderTitle(completedFlowSeed.headerTitle ?? (isCenterline ? 'Centerline Verification - Completed' : 'CIL Execution - Completed'));
    setExecutionTasks(seeded);
    setCommentEditorTaskId(null);
    setCommentDrafts({});
    setElapsedSeconds(elapsed);
    setExecutionStartedAt(startedAt);
    setIsExecutionOpen(true);
  }, [completedFlowSeed]);

  const completeTask = (taskId: string) => setExecutionTasks((prev) => {
    const completedAt = Date.now();
    const next = prev.map((task) => task.id === taskId ? {...task, executionStatus: 'completed' as ExecutionStatus, taskEndedAt: completedAt} : task);
    const currentIndex = next.findIndex((task) => task.id === taskId);
    const nextTask = next[currentIndex + 1];
    if (nextTask && nextTask.executionStatus === 'pending' && !nextTask.taskStartedAt) {
      next[currentIndex + 1] = {...nextTask, taskStartedAt: completedAt};
    }
    return next;
  });
  const setValueInput = (taskId: string, valueInput: string) => setExecutionTasks((prev) => prev.map((task) => task.id === taskId ? {...task, valueInput} : task));
  const recordCenterlineTask = (taskId: string) => setExecutionTasks((prev) => {
    const completedAt = Date.now();
    const next = prev.map((task) => {
      if (task.id !== taskId) return task;
      const numericValue = parseNumericInput(task.valueInput);
      if (numericValue === null) return task;
      return {...task, executionStatus: 'completed' as ExecutionStatus, recordedValue: numericValue, taskEndedAt: completedAt};
    });
    const currentIndex = next.findIndex((task) => task.id === taskId);
    const nextTask = next[currentIndex + 1];
    if (nextTask && nextTask.executionStatus === 'pending' && !nextTask.taskStartedAt) {
      next[currentIndex + 1] = {...nextTask, taskStartedAt: completedAt};
    }
    return next;
  });
  const undoTask = (taskId: string) => setExecutionTasks((prev) => prev.map((task) => task.id === taskId ? {...task, executionStatus: 'pending', recordedValue: undefined, taskStartedAt: Date.now(), taskEndedAt: undefined} : task));
  const completeAllTasks = () => setExecutionTasks((prev) => {
    const missingImageSteps = prev.filter((task) => task.executionStatus === 'pending' && task.requiresImageProof && !hasImageProof(task));
    if (missingImageSteps.length) {
      window.alert(`Upload image before completing these steps: ${missingImageSteps.map((task) => task.stepCode).join(', ')}`);
      return prev;
    }
    const completedAt = Date.now();
    return prev.map((task) => {
      if (task.executionStatus !== 'pending') return task;
      const hasCenterlineTarget = executionMode === 'CL' && task.target !== undefined;
      const autoRecordedValue = hasCenterlineTarget ? task.target : task.recordedValue;
      return {
        ...task,
        executionStatus: 'completed',
        taskStartedAt: task.taskStartedAt ?? completedAt,
        taskEndedAt: completedAt,
        valueInput: hasCenterlineTarget ? String(task.target) : task.valueInput,
        recordedValue: autoRecordedValue,
      };
    });
  });

  const openCommentEditor = (task: ExecutionTask) => {
    setCommentEditorTaskId(task.id);
    setCommentDrafts((prev) => ({...prev, [task.id]: ''}));
  };
  const sendComment = (taskId: string) => {
    const comment = (commentDrafts[taskId] ?? '').trim();
    if (!comment) return;
    setExecutionTasks((prev) => prev.map((task) => task.id === taskId ? {...task, comments: [...(task.comments ?? []), comment]} : task));
    setCommentDrafts((prev) => ({...prev, [taskId]: ''}));
  };
  const uploadTaskImages = (taskId: string, files: FileList | null) => {
    if (!files?.length) return;
    const fileNames = Array.from(files).map((file) => file.name);
    setExecutionTasks((prev) => prev.map((task) => task.id === taskId ? {...task, uploadedImages: [...(task.uploadedImages ?? []), ...fileNames]} : task));
  };
  const validateImageRequirementBeforeComplete = (taskId: string) => {
    const targetTask = executionTasks.find((task) => task.id === taskId);
    if (targetTask?.requiresImageProof && !hasImageProof(targetTask)) {
      window.alert(`Image is required before completing step ${targetTask.stepCode}.`);
      return false;
    }
    return true;
  };
  const completeTaskWithChecks = (taskId: string) => {
    if (!validateImageRequirementBeforeComplete(taskId)) return;
    completeTask(taskId);
  };
  const recordCenterlineTaskWithChecks = (taskId: string) => {
    if (!validateImageRequirementBeforeComplete(taskId)) return;
    recordCenterlineTask(taskId);
  };
  const openRescheduleDialog = (task: ExecutionTask) => {
    const todayIso = new Date().toISOString().slice(0, 10);
    setRescheduleTaskId(task.id);
    setRescheduleCurrentDate(todayIso);
    setRescheduleNewDate(todayIso);
    setRescheduleShift('Shift 1');
    setRescheduleJustification('');
    setRescheduleDialogOpen(true);
  };
  const saveReschedule = () => {
    const taskId = rescheduleTaskId;
    const justification = rescheduleJustification.trim();
    if (!taskId || !rescheduleNewDate || !justification) return;
    const nextComment = `Rescheduled to ${rescheduleNewDate} (${rescheduleShift}). Justification: ${justification}`;
    setExecutionTasks((prev) => prev.map((task) => task.id === taskId ? {...task, comments: [...(task.comments ?? []), nextComment]} : task));
    setRescheduleDialogOpen(false);
    setRescheduleTaskId(null);
    setRescheduleJustification('');
  };

  const reportIssueTask = (taskId: string) => {
    const targetTask = executionTasks.find((task) => task.id === taskId);
    setShiftEntryMaintenancePrefill({
      liveFill: true,
      equipment: executionEquipmentLabel,
      equipmentPath: `Columbus West > Area A > Unit A > Line 10 > ${executionEquipmentLabel}`,
      equipmentTags: ['Columbus West', 'Area A', 'Line 10', executionTypeLabel],
      maintenanceType: 'issue',
      priority: '2 - High (3 days)',
      activityType: 'Mechanical',
      riskAssessment: {
        downtime: 'Medium',
        quality: executionMode === 'CL' ? 'High' : 'Medium',
        ehs: 'Low',
      },
      aiSuggestionText: `I prefilled this from the active ${executionTypeLabel} execution step. Review the issue, add evidence, and submit through the existing maintenance request flow.`,
      whatHappened: targetTask
        ? `${executionHeaderTitle} | ${targetTask.stepCode} ${targetTask.station}. Operator reported an abnormal condition while executing: ${targetTask.description}`
        : `${executionHeaderTitle}. Operator reported an abnormal condition during execution.`,
    });
    setShiftEntryMode('maintenance');
    setIsShiftEntryOpen(true);
  };

  const saveDraft = () => {
    if (!activeTaskId) return;
    setDraftSnapshots((prev) => ({
      ...prev,
      [activeTaskId]: {
        mode: executionMode,
        headerTitle: executionHeaderTitle,
        typeLabel: executionTypeLabel,
        elapsedSeconds,
        tasks: executionTasks,
      },
    }));
    if (executionMode === 'CIL') {
      setCilTaskList((prev) => prev.map((task) => task.id === activeTaskId ? {...task, status: 'draft'} : task));
    } else {
      setCenterlineTaskList((prev) => prev.map((task) => task.id === activeTaskId ? {...task, status: 'draft'} : task));
    }
    setIsExecutionOpen(false);
    setCommentEditorTaskId(null);
    setCommentDrafts({});
  };

  const finishExecution = () => {
    if (doneExecution < executionTasks.length) {
      window.alert(`Complete all tasks or add a comment/reschedule before finishing ${executionTypeLabel}.`);
      return;
    }
    const expectedMinutes = executionExpectedMinutes;
    if (!completedFlowSeed) {
      const finishedAt = new Date();
      const avgTimeLabel = `${expectedMinutes} min`;
      const actualTimeLabel = `${Math.max(1, Math.round(elapsedSeconds / 60))} min`;
      const machineState = (executionTasks.some((task) => task.machineState.startsWith('STOPPED'))
        ? 'Stopped / Internal'
        : 'Running / External') as 'Running / External' | 'Stopped / Internal';
      const commentedTasks = executionTasks.filter((task) => (task.comments?.length ?? 0) > 0);
      const firstCommentedTask = commentedTasks[0];
      const issueTasks = executionTasks.filter((task) => Boolean(task.issue));
      const issuePrefix = issueTasks.length > 0 ? `${issueTasks.length} issue(s)` : 'No issues';
      const reviewTaskLabel = firstCommentedTask
        ? `${executionEquipmentLabel} - ${firstCommentedTask.stepCode} ${firstCommentedTask.station}`
        : `${executionEquipmentLabel} - Full Execution`;
      const firstCommentText = firstCommentedTask?.comments?.[0]
        ? sanitizeTaskSnippet(firstCommentedTask.comments[0])
        : '';
      const reviewComment = firstCommentText
        ? `${issuePrefix}. Commented task: ${firstCommentedTask?.stepCode} ${firstCommentedTask?.station} - ${firstCommentText}`
        : `${issuePrefix}. Execution completed by ${operatorName} and pending line leader review.`;
      const queueBase = {
        task: reviewTaskLabel,
        line: 'Line A' as const,
        area: 'Area A' as const,
        equipment: executionEquipmentLabel,
        shift: 'Shift 1' as const,
        avgTime: avgTimeLabel,
        machineState,
        actualTime: actualTimeLabel,
        completedAt: formatDateTimeLabel(finishedAt),
        createdAt: formatDateTimeLabel(finishedAt),
        responsible: operatorName,
        status: 'Waiting Review' as const,
        replayId: `${executionEquipmentLabel}-${Date.now()}`,
        elapsedSeconds,
        comment: reviewComment,
      };
      if (executionMode === 'CIL') {
        appendCilReviewQueueItem({
          activityId: createActivityId('ACT'),
          ...queueBase,
        });
        if (activeTaskId) {
          setCilTaskList((prev) => prev.map((task) => task.id === activeTaskId ? {...task, status: 'waiting-review'} : task));
        }
      } else {
        appendCenterlineReviewQueueItem({
          activityId: createActivityId('CL'),
          ...queueBase,
          parameter: 'Pressure / Speed / Temperature',
          targetRange: '5.2 +/- 0.3 bar | 120 +/- 5 rpm | 185 +/- 3 C',
          actualReading: firstCommentedTask ? 'Not completed - comment logged' : 'Within expected range',
        });
        if (activeTaskId) {
          setCenterlineTaskList((prev) => prev.map((task) => task.id === activeTaskId ? {...task, status: 'waiting-review'} : task));
        }
      }
    }
    setIsExecutionOpen(false);
    onExecutionClose?.();
  };

  const handleExecutionBack = () => {
    setIsExecutionOpen(false);
    onExecutionClose?.();
    if (onBackToCilCenterline) onBackToCilCenterline();
  };

  useEffect(() => {
    const handlePrefillExecutionComment = (event: Event) => {
      if (!isExecutionOpen && !isChatExecutionActive) return;
      const detail = (event as CustomEvent<{stepId?: string; comment?: string}>).detail;
      const targetTask = executionTasks.find((task) => task.id === detail?.stepId) ?? executionTasks[0];
      if (!targetTask) return;
      setCommentEditorTaskId(targetTask.id);
      setCommentDrafts((prev) => ({
        ...prev,
        [targetTask.id]: detail?.comment ?? prev[targetTask.id] ?? '',
      }));
    };

    window.addEventListener('workstation:prefill-execution-comment', handlePrefillExecutionComment);
    return () => window.removeEventListener('workstation:prefill-execution-comment', handlePrefillExecutionComment);
  }, [executionTasks, isChatExecutionActive, isExecutionOpen]);

  useEffect(() => {
    const findCommandTarget = (stepId?: string) => {
      if (stepId) {
        const explicitTask = executionTasks.find((task) => task.id === stepId);
        if (explicitTask) return explicitTask;
      }
      return executionTasks.find((task) => task.executionStatus === 'pending') ?? executionTasks[0];
    };

    const handleExecutionChatCommand = (event: Event) => {
      if (!isExecutionOpen && !isChatExecutionActive) return;
      const detail = (event as CustomEvent<ExecutionChatCommand>).detail;
      const targetTask = findCommandTarget(detail?.stepId);
      if (!targetTask) return;

      if (detail.action === 'open-instructions') {
        setInstructionTask(targetTask);
        return;
      }

      if (detail.action === 'prefill-comment') {
        setCommentEditorTaskId(targetTask.id);
        setCommentDrafts((prev) => ({
          ...prev,
          [targetTask.id]: detail.comment ?? prev[targetTask.id] ?? '',
        }));
        return;
      }

      if (detail.action === 'save-comment') {
        const comment = detail.comment?.trim();
        if (!comment) return;
        setExecutionTasks((prev) => prev.map((task) => task.id === targetTask.id ? {
          ...task,
          comments: [...(task.comments ?? []), comment],
        } : task));
        setCommentEditorTaskId(null);
        setCommentDrafts((prev) => ({...prev, [targetTask.id]: ''}));
        return;
      }

      if (detail.action === 'report-issue') {
        reportIssueTask(targetTask.id);
        return;
      }

      if (detail.action === 'complete-active') {
        if (executionMode === 'CL') {
          const numericValue = parseNumericInput(targetTask.valueInput);
          if (numericValue === null) return;
          recordCenterlineTaskWithChecks(targetTask.id);
          return;
        }
        completeTaskWithChecks(targetTask.id);
        return;
      }

      if (detail.action === 'record-value' || detail.action === 'record-value-complete') {
        const value = detail.value ?? '';
        const numericValue = parseNumericInput(value);
        if (executionMode !== 'CL' || numericValue === null) return;
        const completedAt = Date.now();
        setExecutionTasks((prev) => {
          const next = prev.map((task) => {
            if (task.id !== targetTask.id) return task;
            const canCompleteFromChat = detail.action === 'record-value-complete' && (!task.requiresImageProof || hasImageProof(task));
            return {
              ...task,
              valueInput: value,
              recordedValue: numericValue,
              executionStatus: canCompleteFromChat ? 'completed' as ExecutionStatus : task.executionStatus,
              taskEndedAt: canCompleteFromChat ? completedAt : task.taskEndedAt,
            };
          });
          if (detail.action !== 'record-value-complete' || (targetTask.requiresImageProof && !hasImageProof(targetTask))) return next;
          const currentIndex = next.findIndex((task) => task.id === targetTask.id);
          const nextTask = next[currentIndex + 1];
          if (nextTask && nextTask.executionStatus === 'pending' && !nextTask.taskStartedAt) {
            next[currentIndex + 1] = {...nextTask, taskStartedAt: completedAt};
          }
          return next;
        });
      }
    };

    window.addEventListener('workstation:execution-chat-command', handleExecutionChatCommand);
    return () => window.removeEventListener('workstation:execution-chat-command', handleExecutionChatCommand);
  }, [executionHeaderTitle, executionMode, executionTasks, executionTypeLabel, isChatExecutionActive, isExecutionOpen]);

  useEffect(() => {
    if (instructionTask) {
      setInstructionPanelsOpen({documentation: true, images: true, videos: true});
    }
  }, [instructionTask]);

  return (
    <>
      {!headlessLauncher ? (
        <WidgetShell
          title={widgetTitle}
          fillHeight={!pageLayout}
          action={(
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
              <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
              {!pageLayout ? (
                <Button
                  size="small"
                  startIcon={<ArrowOutwardIcon />}
                  onClick={() => {
                    if (onOpenFullScreen) {
                      onOpenFullScreen();
                      return;
                    }
                    onExpand?.();
                    setIsExpanded(true);
                  }}
                  sx={filterButtonSx}
                >
                  Open
                </Button>
              ) : null}
            </Box>
          )}
          className={className}
          style={style}
        >
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2, height: pageLayout ? 'auto' : '100%', minHeight: pageLayout ? 'calc(100vh - 288px)' : 0, p: 0.5, overflow: pageLayout ? 'visible' : 'hidden'}}>
            <Box sx={{...compactPanelSx, flex: pageLayout ? '1 1 auto' : '1 1 112px', minHeight: pageLayout ? 0 : 112, display: 'flex', flexDirection: 'column', gap: 1, overflow: pageLayout ? 'visible' : 'hidden'}}>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexShrink: 0}}>
                <Typography sx={sectionHeadingSx}>
                  {activityListTitle}
                </Typography>
                <Chip size="small" label={`${activeTaskList.length} ${activeTaskList.length === 1 ? 'task' : 'tasks'}`} sx={{height: 22, fontWeight: 700, bgcolor: tokenNeutral.lighter, color: tokenBrand.main, '& .MuiChip-label': {fontSize: '0.68rem'}}} />
              </Box>
              <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, minHeight: pageLayout ? 'auto' : 0, overflowY: pageLayout ? 'visible' : 'auto', pr: 0.5}}>
                {activeTaskList.map((task) => {
                  const isCenterlineTask = task.type === 'CL';
                  return (
                    <CompactTaskRow
                      key={task.id}
                      task={task}
                      actionColor={isCenterlineTask ? workstationVisuals.amber : workstationVisuals.blue}
                      reminderEquipment={isCenterlineTask ? clReminder.equipment : cilReminder.equipment}
                      reminderTools={isCenterlineTask ? clReminder.tools : cilReminder.tools}
                      onStart={() => {
                        setActiveTaskId(task.id);
                        startExecution(isCenterlineTask ? 'CL' : 'CIL', task.id);
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            {flowMode === 'ALL' ? (
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '1fr 1fr'}, gap: 1.2, flexShrink: 0}}>
                {renderPerformanceBlock('CIL Performance', cilPerfKpis)}
                {renderPerformanceBlock('Centerline Performance', clPerfKpis)}
              </Box>
            ) : (
              renderPerformanceBlock(activePerformanceTitle, activePerformanceKpis)
            )}
          </Box>
        </WidgetShell>
      ) : null}

      <Dialog fullScreen open={isExpanded} onClose={() => setIsExpanded(false)}>
        <Box sx={{height: '100%', bgcolor: '#F7F8FA', display: 'flex', flexDirection: 'column'}}>
          <AppBar position="static" color="transparent" elevation={0} sx={{borderBottom: 'none', bgcolor: workstationVisuals.blue}}>
            <Toolbar sx={{minHeight: '76px !important', px: {xs: 1.5, md: 3}, display: 'flex', justifyContent: 'space-between', gap: 2}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => setIsExpanded(false)} sx={{textTransform: 'none', fontWeight: 700, color: '#FFFFFF'}}>Back</Button>
                <Divider orientation="vertical" flexItem sx={{borderColor: 'rgba(255,255,255,0.35)'}} />
                <Box>
                  <Typography sx={{fontSize: '2rem', lineHeight: 1, fontWeight: 900, color: '#FFFFFF', fontFamily: workstationVisuals.fontFamily}}>{widgetTitle}</Typography>
                  <Typography sx={{color: 'rgba(255,255,255,0.88)', fontFamily: workstationVisuals.fontFamily}}>{`Delila Bran | Zone A | ${widgetTaskLabel}`}</Typography>
                </Box>
              </Box>
              <Paper elevation={0} sx={{px: 2, py: 1, borderRadius: 2, border: '1px solid #D9E1F2', bgcolor: '#FFFFFF', display: 'flex', gap: 2.2}}>
                <Typography sx={{fontWeight: 700, color: '#D97706', fontFamily: workstationVisuals.fontFamily}}>Pending: <Box component="span" sx={{fontWeight: 900}}>{pendingCount}</Box></Typography>
                <Typography sx={{fontWeight: 700, color: '#2EA75A', fontFamily: workstationVisuals.fontFamily}}>Done: <Box component="span" sx={{fontWeight: 900}}>{doneCount}</Box></Typography>
              </Paper>
            </Toolbar>
          </AppBar>

          <Box sx={{p: {xs: 2, md: 3}, display: 'flex', flexDirection: 'column', gap: 2, ...scrollableSx}}>
            {showCilTasks ? (
              <Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1.2}}>
                  <RefreshIcon sx={{fontSize: '1.1rem', color: workstationVisuals.blue}} />
                  <Typography sx={{fontSize: '1.6rem', fontWeight: 800, color: workstationVisuals.tierTextHeading, fontFamily: workstationVisuals.fontFamily}}>Today's CIL Tasks</Typography>
                  <Chip size="small" label={`${cilTaskList.length} tasks`} sx={{fontWeight: 700}} />
                </Box>
                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1}}>{cilTaskList.map((task) => <FullTaskRow key={`full-${task.id}`} task={task} onStart={() => { setActiveTaskId(task.id); startExecution('CIL', task.id); }} />)}</Box>
              </Box>
            ) : null}

            {showCenterlineTasks ? (
              <Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1.2}}>
                  <CheckCircleOutlineIcon sx={{fontSize: '1.1rem', color: workstationVisuals.amber}} />
                  <Typography sx={{fontSize: '1.6rem', fontWeight: 800, color: workstationVisuals.tierTextHeading, fontFamily: workstationVisuals.fontFamily}}>Today's CL Tasks</Typography>
                  <Chip size="small" label={`${centerlineTaskList.length} tasks`} sx={{fontWeight: 700}} />
                </Box>
                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1}}>{centerlineTaskList.map((task) => <FullTaskRow key={`full-${task.id}`} task={task} onStart={() => { setActiveTaskId(task.id); startExecution('CL', task.id); }} />)}</Box>
              </Box>
            ) : null}
          </Box>
        </Box>
      </Dialog>

      <Dialog
        open={isExecutionOpen}
        onClose={handleExecutionBack}
        fullWidth
        maxWidth={false}
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: 'rgba(15, 23, 42, 0.58)',
              backdropFilter: 'blur(1px)',
            },
          },
        }}
        sx={{
          pointerEvents: 'none',
          '& .MuiBackdrop-root': {pointerEvents: 'none'},
          '& .MuiDialog-container': {pointerEvents: 'none', alignItems: 'center', justifyContent: 'center', px: {xs: 1.5, md: 3}},
          '& .MuiDialog-paper': {pointerEvents: 'auto'},
        }}
        PaperProps={{sx: {width: {xs: 'calc(100vw - 24px)', md: 'min(1080px, calc(100vw - 56px))'}, maxWidth: 'none', height: {xs: 'calc(100dvh - 24px)', md: 'min(820px, calc(100dvh - 42px))'}, maxHeight: 'none', m: {xs: '12px', md: 0}, borderRadius: '10px', overflow: 'hidden', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, boxShadow: '0 22px 58px rgba(15, 23, 42, 0.20)'}}}
      >
        <Box sx={{height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column'}}>
          <Box sx={{px: {xs: 2, md: 3.2}, pt: {xs: 2, md: 2.55}, pb: {xs: 1.8, md: 2.15}, bgcolor: 'background.paper', borderBottom: `1px solid ${tokenDivider}`, flexShrink: 0}}>
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.6, flexWrap: {xs: 'wrap', lg: 'nowrap'}}}>
              <Box sx={{minWidth: 0, flex: '1 1 520px'}}>
                <Typography sx={{fontSize: {xs: '1.12rem', md: '1.32rem'}, lineHeight: 1.15, fontWeight: 800, letterSpacing: 0, color: tokenText.primary, fontFamily: workstationVisuals.fontFamily}}>{executionHeaderTitle}</Typography>
                <Typography sx={{mt: 1.05, color: tokenText.secondary, fontSize: {xs: '0.78rem', md: '0.9rem'}, fontWeight: 400, fontFamily: workstationVisuals.fontFamily}}>
                  <Box component="span" sx={{fontWeight: 700, color: tokenText.primary}}>Line:</Box> 10 | <Box component="span" sx={{fontWeight: 700, color: tokenText.primary}}>Equipment:</Box> {executionEquipmentLabel} | <Box component="span" sx={{fontWeight: 700, color: tokenText.primary}}>Shift:</Box> Morning 06:00 | Date: {currentDateLabel} | <Box component="span" sx={{fontWeight: 700, color: tokenText.primary}}>Operator:</Box> {operatorName}
                </Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.8, flex: '1 1 480px', flexWrap: 'wrap'}}>
                <Chip icon={<AccessTimeIcon />} label={`Actual Time ${formatSeconds(elapsedSeconds)}`} sx={{height: 28, fontWeight: 700, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, '& .MuiChip-icon': {ml: 0.8, color: tokenText.secondary}, '& .MuiChip-label': {fontSize: '0.75rem', px: 1}}} />
                <Chip label={`Expected Time ${executionExpectedMinutes} min`} sx={{height: 28, fontWeight: 700, bgcolor: tokenNeutral.lightest, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, '& .MuiChip-label': {fontSize: '0.75rem', px: 1.1}}} />
                <Typography sx={{fontSize: '0.86rem', fontWeight: 800, color: tokenText.primary, fontFamily: workstationVisuals.fontFamily}}>Progress {doneExecution}/{executionTasks.length}</Typography>
                <IconButton aria-label={`Close ${executionTypeLabel} execution`} onClick={handleExecutionBack} sx={{width: 44, height: 44, borderRadius: '8px', color: tokenBrand.main, bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}`, ml: {xs: 0, md: 1}, '&:hover': {bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main}}}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <Box sx={{p: {xs: 1.5, md: 2.35}, display: 'flex', flexDirection: 'column', gap: 1.15, alignContent: 'start', bgcolor: 'background.paper', flex: '1 1 auto', minHeight: 0, pb: {xs: 2, md: 2.6}, ...scrollableSx}}>
            {filteredExecutionTasks.map((task) => {
              const isCompleted = task.executionStatus === 'completed';
              const isDone = isCompleted;
              const hasCommentOnly = !isCompleted && Boolean(task.comments?.length);
              const uploadedImageCount = task.uploadedImages?.length ?? 0;
              const hasUploadedImage = uploadedImageCount > 0;
              const hasTarget = executionMode === 'CL' && task.target !== undefined && task.tolerance !== undefined;
              const minTarget = hasTarget ? task.target! - task.tolerance! : undefined;
              const maxTarget = hasTarget ? task.target! + task.tolerance! : undefined;
              const isInRange = hasTarget && task.recordedValue !== undefined
                ? Math.abs(task.recordedValue - task.target!) <= task.tolerance!
                : false;
              const taskIndex = executionTasks.findIndex((item) => item.id === task.id);
              const previousTask = taskIndex > 0 ? executionTasks[taskIndex - 1] : null;
              const previousTaskHasComment = hasCommentGate(previousTask);
              const canAct = taskIndex === 0 || previousTask?.executionStatus === 'completed' || previousTaskHasComment;
              const taskElapsedSec = task.taskStartedAt ? Math.max(0, Math.floor(((task.taskEndedAt ?? Date.now()) - task.taskStartedAt) / 1000)) : 0;
              return (
                <Paper key={task.id} elevation={0} sx={{p: {xs: 1.4, md: 1.75}, pl: {xs: 1.75, md: 2.1}, borderRadius: '8px', border: `1px solid ${isCompleted ? tokenSuccess.lighter : tokenDivider}`, bgcolor: isCompleted ? tokenNeutral.lightest : 'background.paper', position: 'relative', overflow: 'visible', boxShadow: 'none', flexShrink: 0}}>
                  <Box sx={{position: 'absolute', inset: '0 auto 0 0', width: 5, bgcolor: task.requiresImageProof && !hasUploadedImage ? tokenWarning.main : tokenBrand.main}} />
                  <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mb: 0.85}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap'}}>
                      <Chip size="small" label={task.station} sx={{fontWeight: 800, height: 24, bgcolor: tokenBrand.softBg, color: tokenBrand.darkest, border: `1px solid ${tokenBrand.lightest}`, '& .MuiChip-label': {px: 0.9, fontSize: '0.68rem'}}} />
                      <Typography sx={{fontWeight: 800, color: tokenBrand.main, fontSize: {xs: '1.22rem', md: '1.35rem'}, lineHeight: 1, fontFamily: workstationVisuals.fontFamily}}>{task.stepCode}</Typography>
                      <Chip size="small" label={task.machineState} sx={{height: 24, fontWeight: 800, bgcolor: tokenNeutral.lighter, color: task.machineState.startsWith('RUNNING') ? tokenSuccess.darker : tokenError.main, '& .MuiChip-label': {fontSize: '0.72rem'}}} />
                      <Tooltip title={task.requiresImageProof ? `Image required${uploadedImageCount ? ` (${uploadedImageCount} uploaded)` : ''}` : 'Image not required'}>
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: task.requiresImageProof
                              ? (hasUploadedImage ? tokenNeutral.lighter : tokenNeutral.lightest)
                              : tokenNeutral.lightest,
                            border: `1px solid ${task.requiresImageProof
                              ? (hasUploadedImage ? tokenSuccess.lightest : tokenWarning.lighter)
                              : tokenNeutral.main}`,
                          }}
                        >
                          <ImageRequiredIcon sx={{fontSize: '1.08rem', color: task.requiresImageProof ? (hasUploadedImage ? tokenSuccess.darker : tokenWarning.dark) : tokenText.disabled}} />
                        </Box>
                      </Tooltip>
                      {task.requiresImageProof ? (
                        <Chip
                          size="small"
                          label={hasUploadedImage ? `Image Uploaded (${uploadedImageCount})` : 'Image Pending'}
                          sx={{
                            height: 22,
                            fontWeight: 700,
                            bgcolor: tokenNeutral.lighter,
                            color: hasUploadedImage ? tokenSuccess.darker : tokenWarning.darker,
                            border: `1px solid ${hasUploadedImage ? tokenSuccess.lighter : tokenWarning.lighter}`,
                            '& .MuiChip-label': {px: 0.9, fontSize: '0.68rem'},
                          }}
                        />
                      ) : null}
                      <Tooltip title={task.requiredEquipment?.length ? `Equipment: ${task.requiredEquipment.join(', ')}` : 'No equipment required'}>
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: tokenNeutral.lightest,
                            border: `1px solid ${task.requiredEquipment?.length ? tokenInfo.lightest : tokenNeutral.main}`,
                          }}
                        >
                          <EquipmentRequiredIcon sx={{fontSize: '1.08rem', color: task.requiredEquipment?.length ? tokenBrand.main : tokenText.disabled}} />
                        </Box>
                      </Tooltip>
                      <Tooltip title={task.requiredTools?.length ? `Tools: ${task.requiredTools.join(', ')}` : 'No tools required'}>
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: tokenNeutral.lightest,
                            border: `1px solid ${task.requiredTools?.length ? tokenInfo.lightest : tokenNeutral.main}`,
                          }}
                        >
                          <ToolsRequiredIcon sx={{fontSize: '1.08rem', color: task.requiredTools?.length ? tokenInfo.main : tokenText.disabled}} />
                        </Box>
                      </Tooltip>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap'}}>
                      {hasTarget ? <Typography sx={{fontWeight: 600, color: tokenText.primary, fontSize: '0.82rem'}}>Min: <Box component="span" sx={{fontWeight: 800}}>{minTarget} {task.unit}</Box> | Target: <Box component="span" sx={{fontWeight: 800}}>{task.target} {task.unit}</Box> | Max: <Box component="span" sx={{fontWeight: 800}}>{maxTarget} {task.unit}</Box></Typography> : null}
                      <Chip size="small" icon={<AccessTimeIcon />} label={`${task.durationMin} min`} sx={{height: 24, fontWeight: 800, bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, color: tokenBrand.darkest, '& .MuiChip-icon': {ml: 0.65, color: tokenText.secondary}, '& .MuiChip-label': {fontSize: '0.68rem'}}} />
                      <Chip size="small" label={`Task ${formatSeconds(taskElapsedSec)}`} sx={{height: 24, fontWeight: 800, bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, color: tokenBrand.darkest, '& .MuiChip-label': {fontSize: '0.68rem'}}} />
                      {isCompleted ? <CheckCircleOutlineIcon sx={{color: tokenSuccess.darker}} /> : null}
                    </Box>
                  </Box>

                  <Typography sx={{color: tokenText.primary, fontSize: {xs: '0.92rem', md: '1rem'}, lineHeight: 1.42, fontFamily: workstationVisuals.fontFamily}}>{task.description}</Typography>
                  {executionMode === 'CL' && !isDone && !isReplayReadOnly ? (
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.7, maxWidth: 260, flexWrap: 'wrap'}}>
                      <TextField
                        size="small"
                        placeholder={`Enter value (${task.unit ?? ''})`}
                        value={task.valueInput ?? ''}
                        onChange={(event) => setValueInput(task.id, event.target.value)}
                        sx={{
                          width: 150,
                          '& .MuiInputBase-input': {
                            py: 0.55,
                            fontSize: '0.82rem',
                          },
                        }}
                        disabled={!canAct}
                      />
                      <Typography sx={{fontWeight: 500, color: tokenText.secondary}}>{task.unit}</Typography>
                    </Box>
                  ) : null}
                  {executionMode === 'CL' && isCompleted && task.recordedValue !== undefined ? (
                    <Typography sx={{mt: 1, color: isInRange ? tokenSuccess.darker : tokenError.main, fontWeight: 700, fontFamily: workstationVisuals.fontFamily}}>
                      Recorded: {task.recordedValue} {task.unit} {isInRange ? '(In range)' : '(Out of range)'}
                    </Typography>
                  ) : null}
                  {task.comments?.length ? (
                    <Box sx={{mt: 1, display: 'flex', flexDirection: 'column', gap: 0.3}}>
                      {task.comments.map((comment, index) => (
                        <Typography key={`${task.id}-comment-${index}`} sx={{color: tokenText.secondary, fontStyle: 'italic', fontFamily: workstationVisuals.fontFamily}}>
                          Comment {index + 1}: {comment}
                        </Typography>
                      ))}
                    </Box>
                  ) : null}
                  {task.issue ? <Typography sx={{mt: 0.5, color: tokenError.main, fontWeight: 700, fontFamily: workstationVisuals.fontFamily}}>Issue: {task.issue}</Typography> : null}

                  <Box sx={{display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: 0.9, flexWrap: 'wrap', mt: 1.05, width: '100%', pb: 0.1}}>
                    <Button size="small" variant="outlined" onClick={() => setInstructionTask(task)} sx={{textTransform: 'none', borderRadius: '6px', fontWeight: 800, minHeight: 38, px: 1.8, borderColor: tokenBrand.main, color: tokenBrand.main, '&:hover': {borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg}}}>Instructions</Button>
                    {!isReplayReadOnly ? (
                      <>
                        <Button size="small" variant="outlined" color="error" startIcon={<ReportIssueIcon sx={{fontSize: '0.85rem'}} />} onClick={() => reportIssueTask(task.id)} disabled={!canAct} sx={{textTransform: 'none', borderRadius: '6px', fontWeight: 800, minHeight: 38, px: 1.8}}>Report Issue</Button>
                        {!isDone
                          ? executionMode === 'CL'
                            ? <Button size="small" variant="contained" startIcon={<CheckCircleOutlineIcon sx={{fontSize: '0.85rem'}} />} onClick={() => recordCenterlineTaskWithChecks(task.id)} disabled={!canAct || parseNumericInput(task.valueInput) === null} sx={{textTransform: 'none', borderRadius: '6px', fontWeight: 800, bgcolor: tokenBrand.main, color: tokenBrand.contrast, minHeight: 38, px: 1.8, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}, '&&.Mui-disabled': {background: `${tokenNeutral.main} !important`, backgroundColor: `${tokenNeutral.main} !important`, color: `${tokenText.disabled} !important`, WebkitTextFillColor: tokenText.disabled, opacity: 1}}}>Complete</Button>
                            : <Button size="small" variant="contained" startIcon={<CheckCircleOutlineIcon sx={{fontSize: '0.85rem'}} />} onClick={() => completeTaskWithChecks(task.id)} disabled={!canAct} sx={{textTransform: 'none', borderRadius: '6px', fontWeight: 800, bgcolor: tokenBrand.main, color: tokenBrand.contrast, minHeight: 38, px: 1.8, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}, '&&.Mui-disabled': {background: `${tokenNeutral.main} !important`, backgroundColor: `${tokenNeutral.main} !important`, color: `${tokenText.disabled} !important`, WebkitTextFillColor: tokenText.disabled, opacity: 1}}}>Complete</Button>
                          : <Button size="small" variant="text" startIcon={<UndoIcon sx={{fontSize: '0.85rem'}} />} onClick={() => undoTask(task.id)} sx={{textTransform: 'none', borderRadius: '6px', fontWeight: 800, minHeight: 38, color: tokenBrand.main}}>Undo</Button>}
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={task.comments?.length
                            ? (
                              <Badge
                                badgeContent={task.comments.length}
                                color="warning"
                                overlap="circular"
                                anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                                sx={{
                                  '& .MuiBadge-badge': {
                                    minWidth: 14,
                                    height: 14,
                                    fontSize: '0.62rem',
                                    lineHeight: 1,
                                    fontWeight: 800,
                                    transform: 'translate(45%, -45%)',
                                    px: 0.25,
                                  },
                                }}
                              >
                                <CommentIcon sx={{fontSize: '0.85rem'}} />
                              </Badge>
                            )
                            : <CommentIcon sx={{fontSize: '0.85rem'}} />}
                          onClick={() => openCommentEditor(task)}
                          disabled={!canAct}
                          sx={{textTransform: 'none', borderRadius: '6px', fontWeight: 800, minHeight: 38, px: 1.8}}
                        >
                          Comment
                        </Button>
                        {task.requiresImageProof ? (
                          <Button
                            size="small"
                            variant="outlined"
                            component="label"
                            startIcon={<UploadFileIcon sx={{fontSize: '0.85rem'}} />}
                            disabled={!canAct}
                            sx={{textTransform: 'none', borderRadius: '6px', fontWeight: 800, minHeight: 38, px: 1.8}}
                          >
                            {hasUploadedImage ? `Image Uploaded (${uploadedImageCount})` : 'Upload Image'}
                            <input
                              hidden
                              accept="image/*"
                              type="file"
                              onChange={(event) => {
                                uploadTaskImages(task.id, event.target.files);
                                event.currentTarget.value = '';
                              }}
                            />
                          </Button>
                        ) : null}
                        {isLineLeaderReview && hasCommentOnly ? (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CalendarMonthIcon sx={{fontSize: '0.85rem'}} />}
                            onClick={() => openRescheduleDialog(task)}
                            disabled={!canAct}
                            sx={{textTransform: 'none', borderRadius: '6px', fontWeight: 800, minHeight: 38, px: 1.8}}
                          >
                            Reschedule Activity
                          </Button>
                        ) : null}
                      </>
                    ) : null}
                  </Box>
                  {commentEditorTaskId === task.id ? (
                    <Paper elevation={0} sx={{mt: 0.8, p: 1, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, boxShadow: 'none'}}>
                      <TextField
                        size="small"
                        multiline
                        minRows={3}
                        fullWidth
                        placeholder="Write comment..."
                        value={commentDrafts[task.id] ?? ''}
                        onChange={(event) => setCommentDrafts((prev) => ({...prev, [task.id]: event.target.value}))}
                      />
                      <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 0.8, mt: 0.8}}>
                        <Button size="small" onClick={() => setCommentEditorTaskId(null)} sx={{textTransform: 'none', borderRadius: '8px', color: tokenBrand.main}}>Close</Button>
                        <Button size="small" variant="contained" onClick={() => sendComment(task.id)} sx={{textTransform: 'none', borderRadius: '8px', fontWeight: 500, bgcolor: tokenBrand.main, color: tokenBrand.contrast, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}>Add Comment</Button>
                      </Box>
                    </Paper>
                  ) : null}
                </Paper>
              );
            })}
          </Box>

          <Box sx={{borderTop: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', px: {xs: 1.5, md: 2.6}, py: {xs: 1.25, md: 1.6}, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', flexShrink: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
              {executionMode === 'CL'
                ? <Chip icon={<CheckCircleOutlineIcon />} label={`${doneExecution}/${executionTasks.length} Completed / Commented`} sx={{height: 34, fontWeight: 800, bgcolor: tokenNeutral.lighter, color: tokenSuccess.darker, border: `1px solid ${tokenDivider}`, '& .MuiChip-icon': {color: tokenSuccess.darker}}} />
                : <Chip icon={<CheckCircleOutlineIcon />} label={`${doneExecution}/${executionTasks.length} Completed / Commented`} sx={{height: 34, fontWeight: 800, bgcolor: tokenNeutral.lighter, color: tokenSuccess.darker, border: `1px solid ${tokenDivider}`, '& .MuiChip-icon': {color: tokenSuccess.darker}}} />}
              {!isLineLeaderReview && !isReplayReadOnly ? (
                <Typography sx={{color: tokenWarning.dark, fontWeight: 800, fontFamily: workstationVisuals.fontFamily}}>Complete all tasks or comment/reschedule before submitting</Typography>
              ) : null}
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
              {isLineLeaderReview ? (
                <>
                  <Button variant="outlined" onClick={onReturnReview} sx={{height: 42, textTransform: 'none', borderRadius: '6px', fontWeight: 800, color: tokenBrand.main, borderColor: tokenBrand.main, px: 2.2, '&:hover': {borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg}}}>
                    {`Return ${executionTypeLabel}`}
                  </Button>
                  <Button variant="contained" onClick={onCompleteReview} sx={{height: 42, textTransform: 'none', borderRadius: '6px', fontWeight: 800, bgcolor: tokenBrand.main, color: tokenBrand.contrast, px: 2.2, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}>
                    {`Complete ${executionTypeLabel}`}
                  </Button>
                </>
              ) : !isReplayReadOnly ? (
                <>
                  <Button variant="contained" startIcon={<DoneAllIcon />} onClick={completeAllTasks} sx={{height: 42, textTransform: 'none', borderRadius: '6px', fontWeight: 800, bgcolor: tokenBrand.main, color: tokenBrand.contrast, px: 2.2, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}>Complete All</Button>
                  {executionMode !== 'CL' ? (
                    <Button
                      variant="outlined"
                      startIcon={<SaveOutlinedIcon />}
                      onClick={saveDraft}
                      sx={{height: 42, textTransform: 'none', borderRadius: '6px', fontWeight: 800, color: tokenBrand.main, borderColor: tokenBrand.main, px: 2.2, '&:hover': {borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg}}}
                    >
                      Save As Draft
                    </Button>
                  ) : null}
                  <Button
                    variant="contained"
                    onClick={finishExecution}
                    disabled={doneExecution !== executionTasks.length}
                    sx={{
                      textTransform: 'none',
                      height: 42,
                      borderRadius: '6px',
                      fontWeight: 800,
                      bgcolor: tokenBrand.main,
                      color: tokenBrand.contrast,
                      px: 2.2,
                      boxShadow: 'none',
                      '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'},
                      '&&.Mui-disabled': {
                        background: `${tokenNeutral.main} !important`,
                        backgroundColor: `${tokenNeutral.main} !important`,
                        color: `${tokenText.disabled} !important`,
                        WebkitTextFillColor: tokenText.disabled,
                        opacity: 1,
                      },
                    }}
                  >
                    {'Complete ' + executionTypeLabel}
                  </Button>
                </>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={rescheduleDialogOpen} onClose={() => setRescheduleDialogOpen(false)} maxWidth="sm" fullWidth PaperProps={{sx: {borderRadius: '12px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, boxShadow: 'none'}}}>
        <Box sx={{p: 2.4}}>
          <Typography sx={{fontSize: '1.15rem', fontWeight: 700, color: tokenText.primary, mb: 1}}>
            Reschedule Next Occurrence
          </Typography>
          <Typography sx={{color: tokenText.secondary, mb: 1.3}}>
            You can change the date of the next occurrence for this activity.
          </Typography>
          <TextField size="small" fullWidth label="Current date" value={rescheduleCurrentDate} InputProps={{readOnly: true}} sx={{mb: 1.1}} />
          <TextField size="small" fullWidth type="date" label="New date" value={rescheduleNewDate} onChange={(event) => setRescheduleNewDate(event.target.value)} InputLabelProps={{shrink: true}} sx={{mb: 1.1}} />
          <FormControl size="small" fullWidth sx={{mb: 1.1}}>
            <InputLabel id="reschedule-shift-label">New shift</InputLabel>
            <Select
              labelId="reschedule-shift-label"
              label="New shift"
              value={rescheduleShift}
              onChange={(event) => setRescheduleShift(event.target.value as RescheduleShift)}
            >
              <MenuItem value="Shift 1">Shift 1</MenuItem>
              <MenuItem value="Shift 2">Shift 2</MenuItem>
              <MenuItem value="Shift 3">Shift 3</MenuItem>
            </Select>
          </FormControl>
          <TextField fullWidth multiline minRows={3} label="Justification" value={rescheduleJustification} onChange={(event) => setRescheduleJustification(event.target.value)} />
          <Box sx={{mt: 1.8, display: 'flex', justifyContent: 'flex-end', gap: 1}}>
            <Button variant="outlined" onClick={() => setRescheduleDialogOpen(false)} sx={{textTransform: 'none', borderRadius: '8px', color: tokenBrand.main, borderColor: tokenBrand.main, '&:hover': {borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg}}}>Cancel</Button>
            <Button variant="contained" onClick={saveReschedule} disabled={!rescheduleNewDate || !rescheduleJustification.trim()} sx={{fontWeight: 500, textTransform: 'none', borderRadius: '8px', bgcolor: tokenBrand.main, color: tokenBrand.contrast, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}>
              Save reschedule
            </Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={Boolean(instructionTask)} onClose={() => setInstructionTask(null)} maxWidth="md" fullWidth PaperProps={{sx: {borderRadius: '12px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, boxShadow: 'none'}}}>
        <Box sx={{p: 2.2}}>
          <Typography sx={{fontSize: '1.25rem', fontWeight: 700, color: tokenText.primary}}>
            Instructions - {instructionTask?.stepCode}
          </Typography>
          <Typography sx={{color: tokenText.secondary, mt: 0.35}}>
            {instructionTask?.description}
          </Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.1, mt: 1.2}}>
            <Paper elevation={0} sx={{borderRadius: '12px', border: `1px solid ${tokenDivider}`, overflow: 'hidden', boxShadow: 'none'}}>
              <Button fullWidth onClick={() => setInstructionPanelsOpen((prev) => ({...prev, documentation: !prev.documentation}))} sx={{justifyContent: 'space-between', textTransform: 'none', borderRadius: 0, fontWeight: 500, color: tokenText.primary, px: 1.3, py: 0.9}}>
                Documentation
                <ExpandMoreIcon sx={{transform: instructionPanelsOpen.documentation ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s'}} />
              </Button>
              {instructionPanelsOpen.documentation ? (
                <Box sx={{p: 1.2, borderTop: `1px solid ${tokenDivider}`}}>
                  <Button variant="outlined" href="https://example.com/SOP.pdf" target="_blank" rel="noreferrer" sx={{textTransform: 'none', borderRadius: '8px', fontWeight: 500, color: tokenBrand.main, borderColor: tokenBrand.main, '&:hover': {borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg}}}>
                    Open SOP.pdf
                  </Button>
                </Box>
              ) : null}
            </Paper>
            <Paper elevation={0} sx={{borderRadius: '12px', border: `1px solid ${tokenDivider}`, overflow: 'hidden', boxShadow: 'none'}}>
              <Button fullWidth onClick={() => setInstructionPanelsOpen((prev) => ({...prev, images: !prev.images}))} sx={{justifyContent: 'space-between', textTransform: 'none', borderRadius: 0, fontWeight: 500, color: tokenText.primary, px: 1.3, py: 0.9}}>
                Images
                <ExpandMoreIcon sx={{transform: instructionPanelsOpen.images ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s'}} />
              </Button>
              {instructionPanelsOpen.images ? (
                <Box sx={{display: 'grid', gridTemplateColumns: '1fr', gap: 1, p: 1.2, borderTop: `1px solid ${tokenDivider}`}}>
                  <Box component="img" src="/images/maquina-fabrica.png" alt="Instruction example" sx={{width: {xs: '100%', md: '72%'}, maxWidth: 520, mx: 'auto', borderRadius: '12px', border: `1px solid ${tokenDivider}`}} />
                </Box>
              ) : null}
            </Paper>
            <Paper elevation={0} sx={{borderRadius: '12px', border: `1px solid ${tokenDivider}`, overflow: 'hidden', boxShadow: 'none'}}>
              <Button fullWidth onClick={() => setInstructionPanelsOpen((prev) => ({...prev, videos: !prev.videos}))} sx={{justifyContent: 'space-between', textTransform: 'none', borderRadius: 0, fontWeight: 500, color: tokenText.primary, px: 1.3, py: 0.9}}>
                Videos
                <ExpandMoreIcon sx={{transform: instructionPanelsOpen.videos ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s'}} />
              </Button>
              {instructionPanelsOpen.videos ? (
                <Box sx={{p: 1.2, borderTop: `1px solid ${tokenDivider}`, display: 'flex', justifyContent: 'center'}}>
                  <Box component="video" controls sx={{width: {xs: '100%', md: '72%'}, maxWidth: 520, borderRadius: '12px', border: `1px solid ${tokenDivider}`}}>
                    <source src="/images/6079429-uhd_3840_2160_24fps.mp4" type="video/mp4" />
                  </Box>
                </Box>
              ) : null}
            </Paper>
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 1.4}}>
            <Button variant="contained" onClick={() => setInstructionTask(null)} sx={{textTransform: 'none', borderRadius: '8px', fontWeight: 500, bgcolor: tokenBrand.main, color: tokenBrand.contrast, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}>
              Close
            </Button>
          </Box>
        </Box>
      </Dialog>

      <WidgetNotificationsDialog
        active={notifications.active}
        config={cilCenterlineNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
    </>
  );
}




