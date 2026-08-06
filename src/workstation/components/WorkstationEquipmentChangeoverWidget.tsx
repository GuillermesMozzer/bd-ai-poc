import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenCommon, tokenText, tokenDivider, workstationStatusPillSx, workstationVisuals } from '../theme';
import {useEffect, useMemo, useState} from 'react';
import {
  AppBar,
  Badge,
  Box,
  Button,
  Chip,
  Dialog,
  Divider,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Toolbar,
  Typography,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
  ArrowOutward as ArrowOutwardIcon,
  CalendarMonth as CalendarMonthIcon,
  ChatBubbleOutline as CommentIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  DoneAll as DoneAllIcon,
  ExpandMore as ExpandMoreIcon,
  Handyman as ToolsRequiredIcon,
  Place as PlaceIcon,
  PlayArrow as PlayArrowIcon,
  PrecisionManufacturing as EquipmentRequiredIcon,
  ReportGmailerrorred as ReportIssueIcon,
  SaveOutlined as SaveOutlinedIcon,
  TrendingFlat as TrendingFlatIcon,
  Undo as UndoIcon,
  UploadFile as UploadFileIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import WidgetShell from './WidgetShell';
import type {WorkstationWidgetProps} from '../types';
import {useShiftManagementContext} from '../../shiftManagement/contexts/ShiftManagementContext';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  equipmentChangeoverNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';

type ChangeoverStatus = 'scheduled' | 'completed' | 'draft' | 'overdue';
type ChangeoverType = 'Batch CO' | 'Physical CO';
type ExecutionStatus = 'pending' | 'completed' | 'na';
type ExecutionTab = 'line_clearance' | 'changeover';
type ExecutionSectionId = 'pre_changeover' | 'line_clearance' | 'line_down_changeover' | 'centerline' | 'ramp_up_adjustments';
type KpiTone = 'blue' | 'green' | 'amber' | 'teal' | 'red' | 'neutral';

type ChangeoverTask = {
  id: string;
  title: string;
  equipment: string;
  shortZone: string;
  time: string;
  type: ChangeoverType;
  status: ChangeoverStatus;
  fromSku: string;
  toSku: string;
  role: string;
  flowName: string;
};

type ChangeoverExecutionTask = {
  id: string;
  tab: ExecutionTab;
  sectionId: ExecutionSectionId;
  group?: string;
  stepCode: string;
  station: string;
  tags: string[];
  description: string;
  executionStatus: ExecutionStatus;
  comments?: string[];
  issue?: string;
  durationMin?: number;
  machineState?: 'RUNNING / EXTERNAL' | 'STOPPED / INTERNAL';
  requiresImageProof?: boolean;
  requiredEquipment?: string[];
  requiredTools?: string[];
  uploadedImages?: string[];
  taskStartedAt?: number;
  taskEndedAt?: number;
  unit?: string;
  target?: number;
  tolerance?: number;
  valueInput?: string;
  recordedValue?: number;
};

type ChangeoverSection = {
  id: ExecutionSectionId;
  title: string;
  subtitle: string;
  tone: 'blue' | 'red' | 'amber';
};

type ChangeoverExecutionSummary = {
  elapsedSeconds: number;
  expectedMinutes: number;
  completedCount: number;
  naCount: number;
  issueCount: number;
  commentCount: number;
  totalTasks: number;
};

type ChangeoverDraftSnapshot = {
  elapsedSeconds: number;
  tasks: ChangeoverExecutionTask[];
};

type CompletedFlowSeed = {
  replayId: string;
  headerTitle?: string;
  elapsedSeconds?: number;
  comment?: string;
  responsible?: string;
};

type ChangeoverLauncherRequest = {
  changeoverId?: string;
  nonce: number;
};

type ExecutionChatCommand = {
  action: 'open-instructions' | 'prefill-comment' | 'save-comment' | 'record-value' | 'record-value-complete' | 'complete-active' | 'report-issue';
  stepId?: string;
  value?: string;
  comment?: string;
};

const todayChangeoversSeed: ChangeoverTask[] = [
  {id: 'co-1', title: 'AFA1-10 Zone 1', equipment: 'AFA1-10 Z1 Cutter', shortZone: 'Z1', time: '14:30', type: 'Batch CO', status: 'scheduled', fromSku: 'AU-30 Cannula 30G', toSku: 'AU-30 Cannula 31G', role: 'Primary Operator - Zone 1', flowName: 'QS3-0148-WI-001 Batch Changeover Flow'},
];

const executionSections: ChangeoverSection[] = [
  {id: 'pre_changeover', title: 'Pre Changeover', subtitle: 'External - Preparation', tone: 'blue'},
  {id: 'line_clearance', title: 'Line Clearance', subtitle: 'Clear previous work order before teardown', tone: 'amber'},
  {id: 'line_down_changeover', title: 'Line Down Changeover', subtitle: 'Internal - While Line is Stopped', tone: 'red'},
  {id: 'centerline', title: 'Centerline', subtitle: 'Validation - Parameter Stabilization', tone: 'blue'},
  {id: 'ramp_up_adjustments', title: 'Ramp Up & Adjustments', subtitle: 'Return to Nominal Production', tone: 'amber'},
];

const executionSeedTasks: ChangeoverExecutionTask[] = [
  {id: 'co-pre-1', tab: 'changeover', sectionId: 'pre_changeover', group: 'Documentation', stepCode: '1.1', station: 'Z1 Cutter', tags: ['Operator'], description: 'Prepare paperwork for new work order', executionStatus: 'pending'},
  {id: 'co-pre-2', tab: 'changeover', sectionId: 'pre_changeover', group: 'Documentation', stepCode: '1.2', station: 'Z1 Cutter', tags: ['Operator', 'QS3-0148-WI-001'], description: 'Scan materials to the new work order', executionStatus: 'pending'},
  {id: 'co-pre-4', tab: 'changeover', sectionId: 'pre_changeover', group: 'Documentation', stepCode: '1.4', station: 'Z1 Cutter', tags: ['Operator'], description: 'Prepare new tubing roller', executionStatus: 'pending'},
  {id: 'co-pre-5', tab: 'changeover', sectionId: 'pre_changeover', group: 'Documentation', stepCode: '1.5', station: 'Z1 Cutter', tags: ['Operator'], description: 'Verify Challege Samples are good and available', executionStatus: 'pending'},
  {id: 'co-pre-6', tab: 'changeover', sectionId: 'pre_changeover', group: 'Documentation', stepCode: '1.6', station: 'Z1 Cutter', tags: ['Operator'], description: 'Ensure tools needed are available', executionStatus: 'pending'},
  {id: 'co-pre-21', tab: 'changeover', sectionId: 'pre_changeover', group: 'Material Prep', stepCode: '2.1', station: 'Z1 Cutter', tags: ['Operator'], description: 'Keep tubing hoppers, wedge and adapter bowls low', executionStatus: 'pending'},
  {id: 'co-pre-22', tab: 'changeover', sectionId: 'pre_changeover', group: 'Material Prep', stepCode: '2.2', station: 'Z1 Cutter', tags: ['Operator'], description: 'Clear old tubing from tubing rollers as per line clearance', executionStatus: 'pending'},
  {id: 'co-pre-23', tab: 'changeover', sectionId: 'pre_changeover', group: 'Material Prep', stepCode: '2.3', station: 'Z1 Cutter', tags: ['Operator'], description: 'Prepare extra pin magazine with correct pin gauge', executionStatus: 'pending'},
  {id: 'co-pre-24', tab: 'changeover', sectionId: 'pre_changeover', group: 'Material Prep', stepCode: '2.4', station: 'Z1 Cutter', tags: ['LM/BLM'], description: 'Estimate remaining quantity from current work order', executionStatus: 'pending'},
  {id: 'co-pre-25', tab: 'changeover', sectionId: 'pre_changeover', group: 'Material Prep', stepCode: '2.5', station: 'Z1 Cutter', tags: ['Operator'], description: 'Empty stationary buffer tray and clear makeup buffer', executionStatus: 'pending'},
  {id: 'lc-1', tab: 'changeover', sectionId: 'line_clearance', stepCode: '2.1', station: 'Z1 Cutter', tags: ['Z1', 'Requires Verification'], description: 'Verify Z1 is purged of previous work order', executionStatus: 'pending', durationMin: 3, machineState: 'STOPPED / INTERNAL', requiresImageProof: true, requiredEquipment: ['Flashlight'], requiredTools: ['Inspection mirror']},
  {id: 'lc-2', tab: 'changeover', sectionId: 'line_clearance', stepCode: '2.2', station: 'Z1 Cutter', tags: ['Z1.C42'], description: 'Empty hopper and ensure drums are clear of cannula from previous work order.', executionStatus: 'pending'},
  {id: 'lc-3', tab: 'changeover', sectionId: 'line_clearance', stepCode: '2.3', station: 'Z1 Cutter', tags: ['Z1'], description: 'Remove all previous work order paperwork and ensure paperwork is ready for next work order.', executionStatus: 'pending'},
  {id: 'lc-4', tab: 'changeover', sectionId: 'line_clearance', stepCode: '2.4', station: 'Z1 Cutter', tags: ['Z1', 'Requires Verification'], description: 'Clean entire Z1.', executionStatus: 'pending', machineState: 'STOPPED / INTERNAL', requiredEquipment: ['PPE kit'], requiredTools: ['Vacuum nozzle']},
  {id: 'lc-5', tab: 'changeover', sectionId: 'line_clearance', stepCode: '2.5', station: 'Z1 Cutter', tags: ['Z1'], description: 'Account for and remove all previous work order challenges (N/A if using same gauge as previous work order).', executionStatus: 'pending'},
  {id: 'co-down-1', tab: 'changeover', sectionId: 'line_down_changeover', group: 'Purge', stepCode: '3.1', station: 'Z1 Cutter', tags: ['Operator', 'AU-30'], description: 'Purge out zone/Record stop time. Keep purge mode until tooling/material changes are done.', executionStatus: 'pending'},
  {id: 'co-down-2', tab: 'changeover', sectionId: 'line_down_changeover', group: 'Purge', stepCode: '3.2', station: 'Z1 Cutter', tags: ['Operator'], description: 'Purge out old pins', executionStatus: 'pending'},
  {id: 'co-down-4', tab: 'changeover', sectionId: 'line_down_changeover', group: 'Tooling', stepCode: '3.4', station: 'Z1 Cutter', tags: ['Operator', '1.11.2, 1.11.18', 'AU-30'], description: 'Empty out adapter bowl and inline', executionStatus: 'pending'},
  {id: 'co-down-5', tab: 'changeover', sectionId: 'line_down_changeover', group: 'Tooling', stepCode: '3.5', station: 'Z1 Cutter', tags: ['Operator', '1.11.4', 'AU-30'], description: 'Empty out old tubing from hoppers', executionStatus: 'pending'},
  {id: 'co-down-6', tab: 'changeover', sectionId: 'line_down_changeover', group: 'Tooling', stepCode: '3.6', station: 'Z1 Cutter', tags: ['Operator', '1.11.6', 'AU-30'], description: 'Remove flare blocks', executionStatus: 'pending'},
  {id: 'co-down-7', tab: 'changeover', sectionId: 'line_down_changeover', group: 'Tooling', stepCode: '3.7', station: 'Z1 Cutter', tags: ['LM/BLM', '1.11.4', 'AU-30'], description: 'Remove tubing drums and vacuum plate', executionStatus: 'pending'},
  {id: 'co-down-8', tab: 'changeover', sectionId: 'line_down_changeover', group: 'Tooling', stepCode: '3.8', station: 'Z1 Cutter', tags: ['Operator', 'S-AU8'], description: 'Perform line clearance/clean zone', executionStatus: 'pending', machineState: 'STOPPED / INTERNAL', requiresImageProof: true, requiredEquipment: ['Line clearance checklist'], requiredTools: ['Label printer']},
  {id: 'co-down-9', tab: 'changeover', sectionId: 'line_down_changeover', group: 'Tooling', stepCode: '3.9', station: 'Z1 Cutter', tags: ['Operator', 'AU-30-WI-011'], description: 'Clean bowls and inlines as necessary', executionStatus: 'pending'},
  {id: 'co-down-12', tab: 'changeover', sectionId: 'line_down_changeover', group: 'Tooling', stepCode: '3.12', station: 'Z1 Cutter', tags: ['Operator', '1.11.1', 'AU-30'], description: 'Load new wedges into the wedge bowl', executionStatus: 'pending'},
  {id: 'co-down-13', tab: 'changeover', sectionId: 'line_down_changeover', group: 'Tooling', stepCode: '3.13', station: 'Z1 Cutter', tags: ['Operator', '1.11.4', 'AU-30'], description: 'Load new tubing into the tubing hoppers', executionStatus: 'pending'},
  {id: 'co-down-14', tab: 'changeover', sectionId: 'line_down_changeover', group: 'Tooling', stepCode: '3.14', station: 'Z1 Cutter', tags: ['LM/BLM', '1.11.23', 'AU-30'], description: 'Install swage blocks as per part type', executionStatus: 'pending'},
  {id: 'co-cl-1', tab: 'changeover', sectionId: 'centerline', group: 'Centerline Checks', stepCode: '4.1', station: 'Z1 Cutter', tags: ['Operator', 'QA'], description: 'Measure equipment temperature and confirm it is within centerline range', executionStatus: 'pending', unit: '°C', target: 98, tolerance: 2},
  {id: 'co-cl-2', tab: 'changeover', sectionId: 'centerline', group: 'Centerline Checks', stepCode: '4.2', station: 'Z1 Cutter', tags: ['Operator'], description: 'Measure pneumatic pressure and compare against centerline target', executionStatus: 'pending', unit: 'bar', target: 5.2, tolerance: 0.2},
  {id: 'co-cl-3', tab: 'changeover', sectionId: 'centerline', group: 'Centerline Checks', stepCode: '4.3', station: 'Z1 Cutter', tags: ['Operator', 'QA'], description: 'Measure equipment speed and verify centerline stability', executionStatus: 'pending', unit: 'rpm', target: 1200, tolerance: 50},
  {id: 'co-post-1', tab: 'changeover', sectionId: 'ramp_up_adjustments', group: 'Closure', stepCode: '5.1', station: 'Z1 Cutter', tags: ['Operator'], description: 'Record end time of the changeover and complete bottom portion of checklist.', executionStatus: 'pending'},
  {id: 'co-post-3', tab: 'changeover', sectionId: 'ramp_up_adjustments', group: 'Closure', stepCode: '5.3', station: 'Z1 Cutter', tags: ['Operator', 'QS3-0148-WI-001'], description: 'Return previous raw materials to Kanban racks', executionStatus: 'pending'},
  {id: 'co-post-4', tab: 'changeover', sectionId: 'ramp_up_adjustments', group: 'Closure', stepCode: '5.4', station: 'Z1 Cutter', tags: ['Operator'], description: 'Return previous work order folder to PCO', executionStatus: 'pending'},
  {id: 'co-post-5', tab: 'changeover', sectionId: 'ramp_up_adjustments', group: 'Closure', stepCode: '5.5', station: 'Z1 Cutter', tags: ['Operator'], description: 'Check with LM for how to help other zones', executionStatus: 'pending'},
];

const invisibleScrollSx = {
  overflowY: 'auto',
  scrollbarWidth: 'none',
  msOverflowStyle: 'none',
  '&::-webkit-scrollbar': {display: 'none'},
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

const sectionHeadingSx = {
  fontSize: '0.82rem',
  fontWeight: 600,
  color: workstationVisuals.textPrimary,
  fontFamily: workstationVisuals.fontFamily,
} as const;

const metricLabelSx = {
  fontSize: '0.72rem',
  color: workstationVisuals.textPrimary,
  fontWeight: 500,
  lineHeight: 1.2,
  fontFamily: workstationVisuals.fontFamily,
} as const;

const metricNoteSx = {
  fontSize: '0.62rem',
  color: workstationVisuals.textSecondary,
  fontFamily: workstationVisuals.fontFamily,
} as const;

function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function hasImageProof(task?: ChangeoverExecutionTask | null) {
  if (!task) return false;
  if (!task.requiresImageProof) return true;
  return (task.uploadedImages?.length ?? 0) > 0;
}

function hasCommentGate(task?: ChangeoverExecutionTask | null) {
  if (!task) return false;
  const hasComment = Boolean(task.comments?.length);
  if (!hasComment) return false;
  return hasImageProof(task);
}

const DEFAULT_CHANGEOVER_STEP_DURATION_MIN = 3;

function getChangeoverTaskDurationMinutes(task: ChangeoverExecutionTask) {
  return task.durationMin ?? DEFAULT_CHANGEOVER_STEP_DURATION_MIN;
}

function sumChangeoverDurationMinutes(tasks: ChangeoverExecutionTask[]) {
  return tasks.reduce((sum, task) => sum + getChangeoverTaskDurationMinutes(task), 0);
}

function getExecutionSection(task: ChangeoverExecutionTask) {
  return executionSections.find((section) => section.id === task.sectionId);
}

function getOperatorScopedExecutionTasks(tasks: ChangeoverExecutionTask[]) {
  return tasks.filter((task) => !task.tags.includes('LM/BLM'));
}

function formatMinutesLabel(minutes: number) {
  const totalSeconds = Math.round(minutes * 60);
  const minPart = Math.floor(totalSeconds / 60);
  const secPart = totalSeconds % 60;
  return secPart === 0 ? `${minPart}m` : `${minPart}m ${String(secPart).padStart(2, '0')}s`;
}

function parseNumericInput(value: string) {
  const normalized = value.replace(',', '.').trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function MiniTrend({values, color = tokenBrand.main, bars = false}: {values: number[]; color?: string; bars?: boolean}) {
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
      <line x1="0" y1="13" x2="100" y2="13" stroke={tokenNeutral.main} strokeWidth="1" />
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
          : workstationVisuals.textPrimary;
  return (
    <Box sx={{minWidth: 0, p: 0.5, pl: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 0.55}}>
      <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.8}}>
        <Typography sx={{fontSize: '1.25rem', fontWeight: 600, lineHeight: 1, color: toneColor, fontFamily: workstationVisuals.fontFamily, flexShrink: 0}}>{value}</Typography>
        <Typography sx={metricLabelSx}>{title}</Typography>
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

function changeoverStatusLabel(status: ChangeoverStatus) {
  if (status === 'draft') return 'Draft';
  if (status === 'completed') return 'Completed';
  if (status === 'overdue') return 'Overdue';
  return 'Pending';
}

function changeoverStatusChipSx(status: ChangeoverStatus) {
  if (status === 'overdue') {
    return {
      fontWeight: 700,
      bgcolor: '#FEE2E2',
      color: tokenError.main,
      border: '1px solid #FCA5A5',
    };
  }
  return {
    fontWeight: 700,
    bgcolor: status === 'draft' ? tokenNeutral.lighter : status === 'completed' ? tokenNeutral.lighter : tokenNeutral.lightest,
    color: status === 'draft' ? tokenWarning.darker : status === 'completed' ? tokenSuccess.darker : workstationVisuals.textSecondary,
  };
}

function typeStyle(type: ChangeoverType) {
  const isBatch = type === 'Batch CO';
  return {
    bg: isBatch ? tokenNeutral.lighter : tokenNeutral.lighter,
    fg: isBatch ? tokenError.main : tokenWarning.dark,
    border: isBatch ? tokenWarning.lighter : tokenWarning.lighter,
  };
}

type WorkstationEquipmentChangeoverWidgetProps = WorkstationWidgetProps & {
  completedFlowSeed?: CompletedFlowSeed;
  reviewMode?: 'line-leader';
  onCompleteReview?: () => void;
  onReturnReview?: () => void;
  onExecutionClose?: () => void;
  autoOpenExecutionFromSeed?: boolean;
  titleOverride?: string;
  onOpenFullScreen?: () => void;
  pageLayout?: boolean;
  headlessLauncher?: boolean;
  launcherRequest?: ChangeoverLauncherRequest | null;
};

export default function WorkstationEquipmentChangeoverWidget({
  className,
  completedFlowSeed,
  onExpand,
  reviewMode,
  onCompleteReview,
  onReturnReview,
  onExecutionClose,
  style,
  autoOpenExecutionFromSeed = true,
  titleOverride,
  onOpenFullScreen,
  pageLayout = false,
  headlessLauncher = false,
  launcherRequest,
}: WorkstationEquipmentChangeoverWidgetProps) {
  const {setIsShiftEntryOpen, setShiftEntryMode} = useShiftManagementContext().logbook;
  const notifications = useWidgetNotifications(equipmentChangeoverNotificationConfig);
  const operatorName = 'Delila Bran';
  const displayOperatorName = completedFlowSeed?.responsible ?? operatorName;
  const currentDateLabel = new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
  const isLineLeaderReview = reviewMode === 'line-leader';
  const isReplayReadOnly = Boolean(completedFlowSeed) && !isLineLeaderReview;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExecutionOpen, setIsExecutionOpen] = useState(false);
  const [isChatExecutionActive, setIsChatExecutionActive] = useState(false);
  const [executionTasks, setExecutionTasks] = useState<ChangeoverExecutionTask[]>(executionSeedTasks);
  const [executionStartedAt, setExecutionStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [executionSummary, setExecutionSummary] = useState<ChangeoverExecutionSummary | null>(null);
  const [todayChangeovers, setTodayChangeovers] = useState<ChangeoverTask[]>(todayChangeoversSeed);
  const [completedExecutionDurationsSec, setCompletedExecutionDurationsSec] = useState<number[]>([
    1620, // 27m00s
    1560, // 26m00s
    1500, // 25m00s
    1470, // 24m30s
    1440, // 24m00s
    1410, // 23m30s
    1380, // 23m00s
  ]);
  const [activeChangeoverId, setActiveChangeoverId] = useState<string | null>(null);
  const [draftSnapshots, setDraftSnapshots] = useState<Record<string, ChangeoverDraftSnapshot>>({});
  const [commentEditorTaskId, setCommentEditorTaskId] = useState<string | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [instructionTask, setInstructionTask] = useState<ChangeoverExecutionTask | null>(null);
  const [instructionPanelsOpen, setInstructionPanelsOpen] = useState<{documentation: boolean; images: boolean; videos: boolean}>({documentation: true, images: true, videos: true});
  const closeExecutionDialog = () => {
    setIsExecutionOpen(false);
    onExecutionClose?.();
  };

  useEffect(() => {
    if (!isExecutionOpen || executionStartedAt === null) return;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - executionStartedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [executionStartedAt, isExecutionOpen]);

  const pendingCount = useMemo(() => todayChangeovers.filter((item) => item.status !== 'completed').length, [todayChangeovers]);
  const doneCount = useMemo(() => todayChangeovers.filter((item) => item.status === 'completed').length, [todayChangeovers]);
  const completedExecutionCount = executionTasks.filter((task) => task.executionStatus === 'completed').length;
  const completedOrSkippedExecutionCount = executionTasks.filter((task) => task.executionStatus !== 'pending').length;
  const activeChangeover = todayChangeovers.find((item) => item.id === activeChangeoverId);
  const executionEquipmentLabel = activeChangeover?.title ?? 'AFA1-10 Zone 1';
  const operatorExecutionSeedTasks = useMemo(() => getOperatorScopedExecutionTasks(executionSeedTasks), []);
  const operatorStageCount = useMemo(() => new Set(executionTasks.map((task) => task.sectionId)).size, [executionTasks]);
  const changeoverExpectedTotalMinutes = useMemo(() => sumChangeoverDurationMinutes(operatorExecutionSeedTasks), [operatorExecutionSeedTasks]);
  const changeoverReminder = useMemo(() => {
    const equipment = Array.from(new Set(operatorExecutionSeedTasks.flatMap((task) => task.requiredEquipment ?? [])));
    const tools = Array.from(new Set(operatorExecutionSeedTasks.flatMap((task) => task.requiredTools ?? [])));
    return {
      equipment,
      tools,
      hasReminder: equipment.length > 0 || tools.length > 0,
    };
  }, [operatorExecutionSeedTasks]);
  const executionExpectedMinutes = useMemo(() => sumChangeoverDurationMinutes(executionTasks), [executionTasks]);
  const changeoverAverageMinutes = useMemo(() => {
    if (completedExecutionDurationsSec.length === 0) return null;
    const totalSeconds = completedExecutionDurationsSec.reduce((sum, value) => sum + value, 0);
    return (totalSeconds / completedExecutionDurationsSec.length) / 60;
  }, [completedExecutionDurationsSec]);
  const changeoverRemainingToday = todayChangeovers.filter((task) => task.status !== 'completed').length;
  const avgExecutionTrendValues = useMemo(() => {
    const lastDurations = completedExecutionDurationsSec.slice(-7).map((value) => Math.max(1, Math.round(value / 60)));
    return lastDurations.length >= 2 ? lastDurations : [27, 25, 24, 23, 22, 21, 20];
  }, [completedExecutionDurationsSec]);
  const changeoverPerfKpis = [
    {title: 'Completed', value: 94 + doneCount, subtitle: 'vs last month', tone: 'blue' as const, trendLabel: '+8%', trendPositive: true, trendValues: [20, 24, 22, 26, 31, 35, 38], trendBars: true},
    {
      title: 'Avg. Execution Time',
      value: changeoverAverageMinutes === null ? '--' : formatMinutesLabel(changeoverAverageMinutes),
      subtitle: completedExecutionDurationsSec.length === 0
        ? 'No completed changeovers yet'
        : `Based on ${completedExecutionDurationsSec.length} completed changeover${completedExecutionDurationsSec.length > 1 ? 's' : ''}`,
      tone: 'amber' as const,
      trendLabel: completedExecutionDurationsSec.length >= 2 ? 'Real trend' : undefined,
      trendPositive: false,
      trendValues: avgExecutionTrendValues,
    },
    {title: 'On-Time Rate', value: '93%', subtitle: 'vs last month', tone: 'green' as const, trendLabel: '+5%', trendPositive: true, trendValues: [88, 89, 90, 91, 92, 93, 93]},
    {title: 'Remaining Today', value: changeoverRemainingToday, subtitle: `Total today: ${todayChangeovers.length}`, tone: 'teal' as const, trendValues: [72, 66, 58, 49, 40, 30, 22]},
  ];

  const startExecution = (changeoverId?: string, openExecutionModal = true) => {
    if (changeoverId) {
      setActiveChangeoverId(changeoverId);
      const snapshot = draftSnapshots[changeoverId];
      if (snapshot) {
        const resumedStart = Date.now() - snapshot.elapsedSeconds * 1000;
        setExecutionTasks(snapshot.tasks);
        setExecutionStartedAt(resumedStart);
        setElapsedSeconds(snapshot.elapsedSeconds);
        setIsExecutionOpen(openExecutionModal);
        setIsChatExecutionActive(!openExecutionModal);
        return;
      }
    }
    setExecutionTasks(operatorExecutionSeedTasks.map((task, index) => ({...task, executionStatus: 'pending', comments: [], uploadedImages: [], issue: undefined, machineState: task.machineState ?? 'RUNNING / EXTERNAL', taskStartedAt: index === 0 ? Date.now() : undefined, taskEndedAt: undefined, valueInput: task.sectionId === 'centerline' ? '' : task.valueInput, recordedValue: undefined})));
    setExecutionStartedAt(Date.now());
    setElapsedSeconds(0);
    setIsExecutionOpen(openExecutionModal);
    setIsChatExecutionActive(!openExecutionModal);
  };

  useEffect(() => {
    if (!launcherRequest) return;
    startExecution(launcherRequest.changeoverId);
  }, [launcherRequest?.nonce]);

  useEffect(() => {
    const handlePrepareChatExecution = (event: Event) => {
      if (!headlessLauncher) return;
      const detail = (event as CustomEvent<{mode?: 'CIL' | 'CL' | 'Changeover'; taskId?: string}>).detail;
      if (detail?.mode !== 'Changeover') {
        setIsChatExecutionActive(false);
        return;
      }
      startExecution(detail.taskId, false);
    };

    window.addEventListener('workstation:prepare-execution-chat-context', handlePrepareChatExecution);
    return () => window.removeEventListener('workstation:prepare-execution-chat-context', handlePrepareChatExecution);
  }, [draftSnapshots, headlessLauncher, todayChangeovers]);

  useEffect(() => {
    if (!completedFlowSeed || !autoOpenExecutionFromSeed) return;
    const elapsed = Math.max(60, completedFlowSeed.elapsedSeconds ?? Math.round(changeoverExpectedTotalMinutes * 60));
    const startedAt = Date.now() - elapsed * 1000;
    const baseComment = completedFlowSeed.comment
      ? `Execution note: ${completedFlowSeed.comment}`
      : 'Execution note: Changeover executed and submitted for line leader validation.';
    const ownerComment = completedFlowSeed.responsible
      ? `Responsible operator: ${completedFlowSeed.responsible}`
      : null;
    const seededTasks = operatorExecutionSeedTasks.map((task, index) => {
      const stageLabel = task.sectionId === 'pre_changeover'
        ? 'Pre Changeover'
        : task.sectionId === 'line_clearance'
          ? 'Line Clearance'
          : task.sectionId === 'line_down_changeover'
            ? 'Line Down Changeover'
            : task.sectionId === 'centerline'
              ? 'Centerline Verification'
              : 'Ramp Up & Adjustments';
      return {
        ...task,
        executionStatus: 'completed' as ExecutionStatus,
        comments: [
          `Stage note: ${stageLabel} completed.`,
          baseComment,
          ...(ownerComment ? [ownerComment] : []),
        ],
        uploadedImages: task.requiresImageProof ? [`${task.stepCode}-evidence.jpg`] : [],
        issue: undefined,
        taskStartedAt: startedAt + index * 15000,
        taskEndedAt: startedAt + (index + 1) * 15000,
        valueInput: task.target !== undefined ? String(task.target) : task.valueInput,
        recordedValue: task.target,
      };
    });
    setExecutionTasks(seededTasks);
    setExecutionStartedAt(startedAt);
    setElapsedSeconds(elapsed);
    setCommentEditorTaskId(null);
    setCommentDrafts({});
    setIsExecutionOpen(true);
  }, [autoOpenExecutionFromSeed, completedFlowSeed, changeoverExpectedTotalMinutes, operatorExecutionSeedTasks]);

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
  const undoTask = (taskId: string) => setExecutionTasks((prev) => prev.map((task) => task.id === taskId ? {...task, executionStatus: 'pending' as ExecutionStatus, taskStartedAt: Date.now(), taskEndedAt: undefined, recordedValue: undefined} : task));
  const completeAllTasks = () => setExecutionTasks((prev) => {
    const missingImageSteps = prev.filter((task) => task.executionStatus === 'pending' && task.requiresImageProof && !hasImageProof(task));
    if (missingImageSteps.length) {
      window.alert(`Upload image before completing these steps: ${missingImageSteps.map((task) => task.stepCode).join(', ')}`);
      return prev;
    }
    const completedAt = Date.now();
    return prev.map((task) => task.executionStatus === 'pending' ? {...task, executionStatus: 'completed' as ExecutionStatus, taskStartedAt: task.taskStartedAt ?? completedAt, taskEndedAt: completedAt} : task);
  });
  const openCommentEditor = (task: ChangeoverExecutionTask) => {
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
  const setValueInput = (taskId: string, valueInput: string) => {
    setExecutionTasks((prev) => prev.map((task) => task.id === taskId ? {...task, valueInput} : task));
  };
  const recordCenterlineTask = (taskId: string) => {
    const completedAt = Date.now();
    setExecutionTasks((prev) => {
      const next = prev.map((task) => {
        if (task.id !== taskId) return task;
        const parsedValue = parseNumericInput(task.valueInput ?? '');
        if (parsedValue === null) return task;
        return {...task, executionStatus: 'completed' as ExecutionStatus, recordedValue: parsedValue, taskEndedAt: completedAt};
      });
      const currentIndex = next.findIndex((task) => task.id === taskId);
      const nextTask = next[currentIndex + 1];
      if (nextTask && nextTask.executionStatus === 'pending' && !nextTask.taskStartedAt) {
        next[currentIndex + 1] = {...nextTask, taskStartedAt: completedAt};
      }
      return next;
    });
  };
  const recordCenterlineTaskWithChecks = (taskId: string) => {
    if (!validateImageRequirementBeforeComplete(taskId)) return;
    const centerlineTask = executionTasks.find((task) => task.id === taskId);
    const parsedValue = parseNumericInput(centerlineTask?.valueInput ?? '');
    if (parsedValue === null) {
      window.alert('Enter a valid numeric value before completing this centerline step.');
      return;
    }
    recordCenterlineTask(taskId);
  };
  const reportIssueTask = (_taskId: string) => {
    setShiftEntryMode('maintenance');
    setIsShiftEntryOpen(true);
  };
  const saveDraft = () => {
    if (!activeChangeoverId) return;
    setDraftSnapshots((prev) => ({
      ...prev,
      [activeChangeoverId]: {
        elapsedSeconds,
        tasks: executionTasks,
      },
    }));
    setTodayChangeovers((prev) => prev.map((item) => item.id === activeChangeoverId ? {...item, status: 'draft'} : item));
    setIsExecutionOpen(false);
    setCommentEditorTaskId(null);
    setCommentDrafts({});
  };
  const finishExecution = () => {
    const allDone = executionTasks.every((task) => task.executionStatus !== 'pending');
    if (!allDone) {
      window.alert('Complete all tasks or mark them as N/A before finishing changeover.');
      return;
    }
    const expectedMinutes = executionExpectedMinutes;
    const issueCount = executionTasks.filter((task) => Boolean(task.issue)).length;
    const commentCount = executionTasks.reduce((sum, task) => sum + (task.comments?.length ?? 0), 0);
    setExecutionSummary({
      elapsedSeconds,
      expectedMinutes,
      completedCount: executionTasks.filter((task) => task.executionStatus === 'completed').length,
      naCount: 0,
      issueCount,
      commentCount,
      totalTasks: executionTasks.length,
    });
    if (activeChangeoverId) {
      setTodayChangeovers((prev) => prev.map((item) => item.id === activeChangeoverId ? {...item, status: 'completed'} : item));
      setDraftSnapshots((prev) => {
        if (!prev[activeChangeoverId]) return prev;
        const next = {...prev};
        delete next[activeChangeoverId];
        return next;
      });
    }
    setCompletedExecutionDurationsSec((prev) => [...prev, elapsedSeconds]);
    setIsSummaryOpen(true);
  };

  const closeSummary = () => {
    setIsSummaryOpen(false);
    setExecutionSummary(null);
    setIsExecutionOpen(false);
  };

  useEffect(() => {
    if (instructionTask) {
      setInstructionPanelsOpen({documentation: true, images: true, videos: true});
    }
  }, [instructionTask]);

  const sectionTone = (tone: ChangeoverSection['tone']) => {
    if (tone === 'blue') return {border: tokenBrand.lightest, bg: tokenNeutral.lighter, color: tokenBrand.main};
    if (tone === 'red') return {border: tokenWarning.lighter, bg: tokenNeutral.lightest, color: tokenError.main};
    return {border: tokenWarning.lighter, bg: tokenNeutral.lightest, color: tokenWarning.dark};
  };

  const renderTaskCard = (task: ChangeoverExecutionTask, operatorTaskNumber?: number) => {
    const section = getExecutionSection(task);
    const tone = sectionTone(section?.tone ?? 'blue');
    const isCompleted = task.executionStatus === 'completed';
    const isDone = isCompleted;
    const uploadedImageCount = task.uploadedImages?.length ?? 0;
    const hasUploadedImage = uploadedImageCount > 0;
    const taskIndex = executionTasks.findIndex((item) => item.id === task.id);
    const previousTask = taskIndex > 0 ? executionTasks[taskIndex - 1] : null;
    const previousTaskHasComment = hasCommentGate(previousTask);
    const canAct = taskIndex === 0 || previousTask?.executionStatus === 'completed' || previousTaskHasComment;
    const taskElapsedSec = task.taskStartedAt ? Math.max(0, Math.floor(((task.taskEndedAt ?? Date.now()) - task.taskStartedAt) / 1000)) : 0;
    const isCenterlineTask = task.sectionId === 'centerline' && typeof task.target === 'number' && typeof task.tolerance === 'number';
    const minValue = isCenterlineTask ? task.target - task.tolerance : null;
    const maxValue = isCenterlineTask ? task.target + task.tolerance : null;
    const parsedInput = parseNumericInput(task.valueInput ?? '');
    const hasValidCenterlineInput = parsedInput !== null;
    const isRecordedInRange = isCenterlineTask && task.recordedValue !== undefined && minValue !== null && maxValue !== null
      ? task.recordedValue >= minValue && task.recordedValue <= maxValue
      : null;
    return (
      <Paper key={task.id} elevation={0} sx={{p: {xs: 1.4, md: 1.75}, pl: {xs: 1.75, md: 2.1}, borderRadius: '8px', border: `1px solid ${isCompleted ? tokenSuccess.lighter : tokenDivider}`, bgcolor: isCompleted ? tokenNeutral.lightest : 'background.paper', position: 'relative', overflow: 'visible', boxShadow: 'none', flexShrink: 0}}>
        <Box sx={{position: 'absolute', inset: '0 auto 0 0', width: 5, bgcolor: task.requiresImageProof && !hasUploadedImage ? tokenWarning.main : tokenBrand.main}} />
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mb: 0.85}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap'}}>
            <Chip size="small" label={task.station} sx={{fontWeight: 800, height: 24, bgcolor: tokenBrand.softBg, color: tokenBrand.darkest, border: `1px solid ${tokenBrand.lightest}`, '& .MuiChip-label': {px: 0.9, fontSize: '0.68rem'}}} />
            <Chip size="small" label={section?.title ?? 'Changeover'} sx={{fontWeight: 800, height: 24, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, '& .MuiChip-label': {px: 0.9, fontSize: '0.68rem'}}} />
            <Typography sx={{fontWeight: 800, color: tokenBrand.main, fontSize: {xs: '1.22rem', md: '1.35rem'}, lineHeight: 1, fontFamily: workstationVisuals.fontFamily}}>{operatorTaskNumber ?? task.stepCode}</Typography>
            <Chip size="small" label={task.machineState ?? 'RUNNING / EXTERNAL'} sx={{height: 24, fontWeight: 800, bgcolor: tokenNeutral.lighter, color: (task.machineState ?? 'RUNNING / EXTERNAL').startsWith('RUNNING') ? tokenSuccess.darker : tokenError.main, '& .MuiChip-label': {fontSize: '0.72rem'}}} />
            {task.requiresImageProof ? (
              <Chip
                size="small"
                label={hasUploadedImage ? `Image Uploaded (${uploadedImageCount})` : 'Image Pending'}
                sx={{
                  height: 22,
                  fontWeight: 700,
                  bgcolor: hasUploadedImage ? tokenNeutral.lighter : tokenNeutral.lighter,
                  color: hasUploadedImage ? tokenSuccess.darkest : tokenWarning.darker,
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
                  bgcolor: task.requiredEquipment?.length ? tokenNeutral.lightest : tokenNeutral.lightest,
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
                  bgcolor: task.requiredTools?.length ? tokenNeutral.lightest : tokenNeutral.lightest,
                  border: `1px solid ${tokenNeutral.main}`,
                }}
              >
                <ToolsRequiredIcon sx={{fontSize: '1.08rem', color: task.requiredTools?.length ? tokenInfo.main : tokenText.disabled}} />
              </Box>
            </Tooltip>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
            {isCenterlineTask && minValue !== null && maxValue !== null ? (
              <Typography sx={{fontWeight: 500, color: tokenText.primary, fontSize: '0.82rem'}}>
                Min: <Box component="span" sx={{fontWeight: 800}}>{minValue.toFixed(2)} {task.unit}</Box>
                {' | '}
                Target: <Box component="span" sx={{fontWeight: 800}}>{task.target?.toFixed(2)} {task.unit}</Box>
                {' | '}
                Max: <Box component="span" sx={{fontWeight: 800}}>{maxValue.toFixed(2)} {task.unit}</Box>
              </Typography>
            ) : null}
            <Chip size="small" icon={<AccessTimeIcon />} label={`${getChangeoverTaskDurationMinutes(task)} min`} sx={{height: 24, fontWeight: 800, bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, color: tokenBrand.darkest, '& .MuiChip-icon': {ml: 0.65, color: tokenText.secondary}, '& .MuiChip-label': {fontSize: '0.68rem'}}} />
            <Chip size="small" label={`Task ${formatSeconds(taskElapsedSec)}`} sx={{height: 24, fontWeight: 800, bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, color: tokenBrand.darkest, '& .MuiChip-label': {fontSize: '0.68rem'}}} />
          </Box>
        </Box>
        <Typography sx={{color: tokenText.primary, fontSize: {xs: '0.92rem', md: '1rem'}, lineHeight: 1.42, fontFamily: workstationVisuals.fontFamily}}>{task.description}</Typography>
        {isCenterlineTask && !isDone && !isReplayReadOnly ? (
          <Box sx={{mt: 0.9, maxWidth: 250}}>
            <TextField
              size="small"
              type="text"
              label={`Measured Value${task.unit ? ` (${task.unit})` : ''}`}
              value={task.valueInput ?? ''}
              onChange={(event) => setValueInput(task.id, event.target.value)}
              disabled={!canAct}
              error={Boolean((task.valueInput ?? '').trim()) && !hasValidCenterlineInput}
              helperText={Boolean((task.valueInput ?? '').trim()) && !hasValidCenterlineInput ? 'Enter a numeric value' : ' '}
              sx={{'& .MuiInputBase-root': {bgcolor: 'background.paper'}}}
            />
          </Box>
        ) : null}
        {isCenterlineTask && isDone && task.recordedValue !== undefined ? (
          <Typography sx={{mt: 0.6, color: isRecordedInRange ? tokenSuccess.darkest : tokenWarning.darker, fontWeight: 800, fontFamily: workstationVisuals.fontFamily}}>
            Recorded: {task.recordedValue.toFixed(2)} {task.unit ?? ''} ({isRecordedInRange ? 'In range' : 'Out of range'})
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
              {!isDone ? <Button size="small" variant="contained" startIcon={<CheckCircleOutlineIcon sx={{fontSize: '0.85rem'}} />} onClick={() => isCenterlineTask ? recordCenterlineTaskWithChecks(task.id) : completeTaskWithChecks(task.id)} disabled={!canAct || (isCenterlineTask && !hasValidCenterlineInput)} sx={{textTransform: 'none', borderRadius: '6px', fontWeight: 800, bgcolor: tokenBrand.main, color: tokenBrand.contrast, minHeight: 38, px: 1.8, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}, '&&.Mui-disabled': {background: `${tokenNeutral.main} !important`, backgroundColor: `${tokenNeutral.main} !important`, color: `${tokenText.disabled} !important`, WebkitTextFillColor: tokenText.disabled, opacity: 1}}}>Complete</Button> : <Button size="small" variant="text" startIcon={<UndoIcon sx={{fontSize: '0.85rem'}} />} onClick={() => undoTask(task.id)} sx={{textTransform: 'none', borderRadius: '6px', fontWeight: 800, minHeight: 38, color: tokenBrand.main}}>Undo</Button>}
              <Button
                size="small"
                variant="outlined"
                startIcon={
                  task.comments?.length
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
                    : <CommentIcon sx={{fontSize: '0.85rem'}} />
                }
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
            </>
          ) : null}
        </Box>
        {!isReplayReadOnly && commentEditorTaskId === task.id ? (
          <Paper elevation={0} sx={{mt: 0.8, p: 1, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, boxShadow: 'none'}}>
            <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.8}}>
              <textarea
                value={commentDrafts[task.id] ?? ''}
                onChange={(event) => setCommentDrafts((prev) => ({...prev, [task.id]: event.target.value}))}
                rows={4}
                style={{resize: 'vertical', borderRadius: 8, border: `1px solid ${tokenNeutral.dark}`, padding: 8, fontFamily: 'inherit'}}
              />
              <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 0.8}}>
                <Button size="small" onClick={() => setCommentEditorTaskId(null)} sx={{textTransform: 'none', borderRadius: '8px', color: tokenBrand.main}}>Close</Button>
                <Button size="small" variant="contained" onClick={() => sendComment(task.id)} sx={{textTransform: 'none', borderRadius: '8px', fontWeight: 500, bgcolor: tokenBrand.main, color: tokenBrand.contrast, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}>Add Comment</Button>
              </Box>
            </Box>
          </Paper>
        ) : null}
      </Paper>
    );
  };

  const renderChangeoverActivityCard = (task: ChangeoverTask, layout: 'row' | 'card' = 'row') => {
    const tone = typeStyle(task.type);
    const isCardLayout = layout === 'card';
    const reminderEquipment = changeoverReminder.equipment.length ? changeoverReminder.equipment.slice(0, 2).join(', ') : 'No PPE/equipment required';
    const reminderTools = changeoverReminder.tools.length ? changeoverReminder.tools.slice(0, 2).join(', ') : 'No tools required';

    return (
      <Paper
        key={task.id}
        elevation={0}
        sx={{
          borderRadius: 2,
          border: `1px solid ${task.status === 'overdue' ? '#FCA5A5' : workstationVisuals.tierBorder}`,
          bgcolor: task.status === 'overdue' ? '#FEF2F2' : workstationVisuals.tierSurface,
          p: {xs: 1.5, md: 1.9},
          display: 'grid',
          gridTemplateColumns: isCardLayout ? '1fr' : {xs: '1fr', lg: 'minmax(0, 1.55fr) minmax(300px, 0.9fr) 132px'},
          gap: {xs: 1.25, md: 1.6},
          alignItems: isCardLayout ? 'stretch' : 'center',
          minHeight: isCardLayout ? 220 : 178,
        }}
      >
        <Box sx={{minWidth: 0}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap'}}>
            <Chip size="small" label={task.type === 'Batch CO' ? 'CO' : task.type} sx={{height: 24, borderRadius: 12, fontWeight: 800, bgcolor: tone.bg, color: tone.fg, border: `1px solid ${tone.border}`, '& .MuiChip-label': {px: 0.9, fontSize: '0.68rem'}}} />
            <Typography sx={{fontWeight: 800, fontSize: '1rem', lineHeight: 1.2, color: workstationVisuals.tierTextHeading}}>{task.title}</Typography>
          </Box>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))'}, gap: 0.75, mt: 1.1}}>
            <Typography sx={{...metricNoteSx, fontSize: '0.76rem'}}><Box component="span" sx={{fontWeight: 800, color: workstationVisuals.tierTextHeading}}>Equipment:</Box> {task.equipment}</Typography>
            <Typography sx={{...metricNoteSx, fontSize: '0.76rem'}}><Box component="span" sx={{fontWeight: 800, color: workstationVisuals.tierTextHeading}}>Your role:</Box> {task.role}</Typography>
            <Typography sx={{...metricNoteSx, fontSize: '0.76rem'}}><Box component="span" sx={{fontWeight: 800, color: workstationVisuals.tierTextHeading}}>From:</Box> {task.fromSku}</Typography>
            <Typography sx={{...metricNoteSx, fontSize: '0.76rem'}}><Box component="span" sx={{fontWeight: 800, color: workstationVisuals.tierTextHeading}}>To:</Box> {task.toSku}</Typography>
          </Box>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 0.8, color: workstationVisuals.tierTextMeta, flexWrap: 'wrap'}}>
            <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.35}}>
              <PlaceIcon sx={{fontSize: '0.9rem'}} />
              <Typography sx={metricNoteSx}>{task.shortZone}</Typography>
            </Box>
            <Typography sx={{...metricNoteSx, fontWeight: 800, color: workstationVisuals.tierTextHeading}}>{task.time}</Typography>
          </Box>
        </Box>

        <Box sx={{minWidth: 0, alignSelf: 'stretch', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
          <Typography sx={sectionHeadingSx}>Reminder</Typography>
          <Typography sx={{...metricNoteSx, mt: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            PPE/Equipment: {reminderEquipment}
          </Typography>
          <Typography sx={{...metricNoteSx, mt: 0.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            Tools: {reminderTools}
          </Typography>
        </Box>

        <Box sx={{display: 'flex', flexDirection: 'column', alignItems: isCardLayout ? 'flex-start' : {xs: 'flex-start', lg: 'flex-end'}, justifyContent: 'center', gap: 0.75}}>
          <Chip size="small" label={changeoverStatusLabel(task.status)} sx={changeoverStatusChipSx(task.status)} />
          <Chip size="small" icon={<AccessTimeIcon sx={{fontSize: '0.8rem'}} />} label={`${changeoverExpectedTotalMinutes} min`} sx={{fontWeight: 700, bgcolor: tokenNeutral.lightest, color: tokenBrand.main}} />
          <Button onClick={() => startExecution(task.id)} variant="contained" startIcon={<PlayArrowIcon sx={{fontSize: '0.9rem'}} />} sx={{textTransform: 'none', borderRadius: 2, fontWeight: 800, bgcolor: workstationVisuals.blue, color: tokenCommon.white, py: 0.5, fontSize: '0.78rem', minHeight: 34, minWidth: 92}}>{task.status === 'draft' ? 'Resume' : 'Start'}</Button>
        </Box>
      </Paper>
    );
  };

  useEffect(() => {
    const handlePrefillExecutionComment = (event: Event) => {
      if (!isExecutionOpen && !isChatExecutionActive) return;
      const detail = (event as CustomEvent<{stepId?: string; comment?: string}>).detail;
      const targetTask = executionTasks.find((task) => task.id === detail?.stepId) ?? executionTasks[0];
      if (!targetTask) return;
      setExpandedSectionId(targetTask.sectionId);
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
        setExpandedSectionId(targetTask.sectionId);
        setInstructionTask(targetTask);
        return;
      }

      if (detail.action === 'prefill-comment') {
        setExpandedSectionId(targetTask.sectionId);
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
        if (targetTask.sectionId === 'centerline' && targetTask.unit) {
          recordCenterlineTaskWithChecks(targetTask.id);
          return;
        }
        completeTaskWithChecks(targetTask.id);
        return;
      }

      if (detail.action === 'record-value' || detail.action === 'record-value-complete') {
        const value = detail.value ?? '';
        setValueInput(targetTask.id, value);
        if (detail.action === 'record-value-complete') {
          window.setTimeout(() => recordCenterlineTaskWithChecks(targetTask.id), 0);
        }
      }
    };

    window.addEventListener('workstation:execution-chat-command', handleExecutionChatCommand);
    return () => window.removeEventListener('workstation:execution-chat-command', handleExecutionChatCommand);
  }, [executionTasks, isChatExecutionActive, isExecutionOpen]);

  return (
    <>
      {!headlessLauncher ? (
        <WidgetShell
          title={titleOverride ?? 'Equipment Changeover'}
          fillHeight={!pageLayout}
          action={pageLayout ? undefined : (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
              <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
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
            </Box>
          )}
          className={className}
          style={style}
        >
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2, height: pageLayout ? 'auto' : '100%', minHeight: pageLayout ? 'calc(100vh - 288px)' : 0, p: 0.5, overflow: pageLayout ? 'visible' : 'hidden'}}>
            <Box sx={{
              border: '1px solid rgba(15, 23, 42, 0.06)',
              borderRadius: '8px',
              p: 1.5,
              bgcolor: tokenCommon.white,
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr) auto',
              gap: 1.2,
              alignItems: 'center',
              flex: pageLayout ? '1 1 auto' : '1 1 112px',
              minHeight: pageLayout ? 0 : 112,
              overflow: pageLayout ? 'visible' : 'hidden',
              ...(pageLayout
                ? {
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                  }
                : {}),
            }}>
              {pageLayout ? (
                <>
                  <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
                    <Typography sx={sectionHeadingSx}>
                      Today's Changeover Activities
                    </Typography>
                    <Chip size="small" label={`${todayChangeovers.length} ${todayChangeovers.length === 1 ? 'task' : 'tasks'}`} sx={{height: 22, fontWeight: 700, bgcolor: tokenNeutral.lighter, color: tokenBrand.main, '& .MuiChip-label': {fontSize: '0.68rem'}}} />
                  </Box>
                  <Box sx={{display: 'flex', flexDirection: 'column', gap: 1, minHeight: 'auto', overflowY: 'visible', pr: 0.5}}>
                    {todayChangeovers.map((task) => renderChangeoverActivityCard(task))}
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{minWidth: 0}}>
                    <Typography sx={sectionHeadingSx}>
                      Today's Changeover
                    </Typography>
                    <Typography sx={{...metricNoteSx, mt: 0.45}}>
                      May 12, 2026 - 08:15 AM
                    </Typography>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.75, minWidth: 0}}>
                      <Box sx={{...workstationStatusPillSx('neutral'), borderRadius: '8px'}}>SKU A</Box>
                      <TrendingFlatIcon sx={{fontSize: '0.95rem', color: workstationVisuals.textSecondary, flexShrink: 0}} />
                      <Box sx={{...workstationStatusPillSx('success'), borderRadius: '8px'}}>SKU B</Box>
                    </Box>
                  </Box>
                  <Box sx={{minWidth: 0}}>
                    <Typography sx={sectionHeadingSx}>
                      Reminder
                    </Typography>
                    <Typography sx={{...metricNoteSx, mt: 0.45, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {changeoverReminder.equipment.length ? `Equipment: ${changeoverReminder.equipment.slice(0, 2).join(', ')}` : 'No equipment required'}
                    </Typography>
                    <Typography sx={{...metricNoteSx, mt: 0.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {changeoverReminder.tools.length ? `Tools: ${changeoverReminder.tools.slice(0, 2).join(', ')}` : 'No tools required'}
                    </Typography>
                  </Box>
                  <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.75}}>
                    <Box sx={{...workstationStatusPillSx('neutral'), borderRadius: '8px'}}>
                      <AccessTimeIcon sx={{fontSize: 14, mr: 0.4}} />
                      Pending
                    </Box>
                    <Button onClick={() => startExecution()} variant="contained" startIcon={<PlayArrowIcon sx={{fontSize: '0.9rem'}} />} sx={{textTransform: 'none', borderRadius: '8px', fontWeight: 600, bgcolor: tokenBrand.main, color: tokenCommon.white, minHeight: 30, fontSize: '0.72rem', fontFamily: workstationVisuals.fontFamily}}>
                      Start Changeover
                    </Button>
                  </Box>
                </>
              )}
            </Box>

            <Box sx={{
              border: '1px solid rgba(15, 23, 42, 0.06)',
              borderRadius: '8px',
              p: 1.5,
              bgcolor: tokenCommon.white,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              flex: pageLayout ? '0 0 auto' : 1,
              minHeight: 0,
              overflow: 'hidden',
              flexShrink: 0,
            }}>
              <Typography sx={sectionHeadingSx}>
                Changeover Performance
              </Typography>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1, minHeight: 0}}>
                {changeoverPerfKpis.map((kpi, index) => (
                  <Box
                    key={`changeover-${kpi.title}`}
                    sx={{borderRight: index < changeoverPerfKpis.length - 1 ? '1px solid rgba(15, 23, 42, 0.06)' : 'none'}}
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
          </Box>
        </WidgetShell>
      ) : null}

      <Dialog fullScreen open={isExpanded} onClose={() => setIsExpanded(false)}>
        <Box sx={{height: '100%', bgcolor: tokenNeutral.lightest, display: 'flex', flexDirection: 'column'}}>
          <AppBar position="static" color="transparent" elevation={0} sx={{borderBottom: 'none', bgcolor: workstationVisuals.blue}}>
            <Toolbar sx={{minHeight: '76px !important', px: {xs: 1.5, md: 3}, display: 'flex', justifyContent: 'space-between', gap: 2}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1.5}}>
                <Button startIcon={<ArrowBackIcon sx={{color: tokenCommon.white}} />} onClick={() => setIsExpanded(false)} sx={{textTransform: 'none', fontWeight: 700, color: tokenCommon.white}}>Back</Button>
                <Divider orientation="vertical" flexItem sx={{borderColor: 'rgba(255,255,255,0.35)'}} />
                <Typography sx={{fontSize: '2rem', lineHeight: 1, fontWeight: 900, color: tokenCommon.white, fontFamily: workstationVisuals.fontFamily}}>{titleOverride ?? 'Equipment Changeover'}</Typography>
              </Box>
              <Paper elevation={0} sx={{px: 2, py: 1, borderRadius: 2, border: `1px solid ${tokenNeutral.dark}`, bgcolor: tokenCommon.white, display: 'flex', gap: 2.2}}>
                <Typography sx={{fontWeight: 700, color: tokenWarning.dark}}>Pending: <Box component="span" sx={{fontWeight: 900}}>{pendingCount}</Box></Typography>
                <Typography sx={{fontWeight: 700, color: tokenSuccess.darker}}>Done: <Box component="span" sx={{fontWeight: 900}}>{doneCount}</Box></Typography>
              </Paper>
            </Toolbar>
          </AppBar>

          <Box sx={{p: {xs: 2, md: 3}, display: 'flex', flexDirection: 'column', gap: 2, ...invisibleScrollSx}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 0.25}}>
              <CalendarMonthIcon sx={{fontSize: '1.15rem', color: workstationVisuals.tierTextMeta}} />
              <Typography sx={{fontSize: '1.6rem', fontWeight: 800}}>Today's Changeover Activities</Typography>
            </Box>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1}}>
              {todayChangeovers.map((task) => renderChangeoverActivityCard(task, 'card'))}
            </Box>
          </Box>
        </Box>
      </Dialog>

      <Dialog
        open={isExecutionOpen}
        onClose={closeExecutionDialog}
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
        sx={{'& .MuiDialog-container': {alignItems: 'center'}}}
        PaperProps={{sx: {width: {xs: 'calc(100vw - 24px)', md: 'min(1500px, calc(100vw - 36px))'}, maxWidth: 'none', maxHeight: 'none', height: {xs: 'calc(100dvh - 24px)', md: 'min(860px, calc(100dvh - 42px))'}, m: {xs: '12px', md: 0}, borderRadius: '10px', overflow: 'hidden', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, boxShadow: '0 22px 58px rgba(15, 23, 42, 0.20)'}}}
      >
        <Box sx={{height: '100%', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column'}}>
          <Box sx={{px: {xs: 2, md: 3.2}, pt: {xs: 2, md: 2.55}, pb: {xs: 1.8, md: 2.15}, bgcolor: 'background.paper', borderBottom: `1px solid ${tokenDivider}`, flexShrink: 0}}>
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.6, flexWrap: {xs: 'wrap', lg: 'nowrap'}}}>
              <Box sx={{minWidth: 0, flex: '1 1 520px'}}>
                <Typography sx={{fontSize: {xs: '1.12rem', md: '1.32rem'}, lineHeight: 1.15, fontWeight: 800, letterSpacing: 0, color: tokenText.primary, fontFamily: workstationVisuals.fontFamily}}>
                  {completedFlowSeed?.headerTitle ?? 'Changeover'}
                </Typography>
                <Typography sx={{mt: 1.05, color: tokenText.secondary, fontSize: {xs: '0.78rem', md: '0.9rem'}, fontWeight: 400, fontFamily: workstationVisuals.fontFamily}}>
                  <Box component="span" sx={{fontWeight: 700, color: tokenText.primary}}>Line:</Box> 10 | <Box component="span" sx={{fontWeight: 700, color: tokenText.primary}}>Equipment:</Box> {executionEquipmentLabel} | Date: {currentDateLabel} | <Box component="span" sx={{fontWeight: 700, color: tokenText.primary}}>Operator:</Box> {displayOperatorName}
                </Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.8, flex: '1 1 480px', flexWrap: 'wrap'}}>
                <Chip icon={<AccessTimeIcon />} label={`Actual Time ${formatSeconds(elapsedSeconds)}`} sx={{height: 28, fontWeight: 700, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, '& .MuiChip-icon': {ml: 0.8, color: tokenText.secondary}, '& .MuiChip-label': {fontSize: '0.75rem', px: 1}}} />
                <Chip label={`Expected Time ${executionExpectedMinutes} min`} sx={{height: 28, fontWeight: 700, bgcolor: tokenNeutral.lightest, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, '& .MuiChip-label': {fontSize: '0.75rem', px: 1.1}}} />
                <Typography sx={{fontSize: '0.86rem', fontWeight: 800, color: tokenText.primary, fontFamily: workstationVisuals.fontFamily}}>Progress {completedOrSkippedExecutionCount}/{executionTasks.length}</Typography>
                <IconButton aria-label="Close Changeover execution" onClick={closeExecutionDialog} sx={{width: 44, height: 44, borderRadius: '8px', color: tokenBrand.main, bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}`, ml: {xs: 0, md: 1}, '&:hover': {bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main}}}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </Box>
          </Box>

          <Box sx={{p: {xs: 1.5, md: 2.35}, display: 'flex', flexDirection: 'column', gap: 1.05, alignContent: 'start', bgcolor: 'background.paper', flex: '1 1 auto', minHeight: 0, pb: {xs: 2, md: 2.6}, ...invisibleScrollSx}}>
            <Paper elevation={0} sx={{p: {xs: 1.25, md: 1.55}, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}`, boxShadow: 'none', flexShrink: 0}}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
                <Box>
                  <Typography sx={{fontWeight: 800, color: tokenText.primary, fontFamily: workstationVisuals.fontFamily}}>
                    Activities assigned to {displayOperatorName}
                  </Typography>
                  <Typography sx={{mt: 0.25, color: tokenText.secondary, fontSize: '0.84rem', fontFamily: workstationVisuals.fontFamily}}>
                    {activeChangeover?.role ?? 'Primary Operator - Zone 1'} | {executionEquipmentLabel}
                  </Typography>
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap'}}>
                  <Chip size="small" label={`${executionTasks.length} activities`} sx={{height: 26, fontWeight: 800, bgcolor: 'background.paper', color: tokenBrand.main, border: `1px solid ${tokenDivider}`}} />
                  <Chip size="small" label={`${operatorStageCount} stages referenced`} sx={{height: 26, fontWeight: 800, bgcolor: 'background.paper', color: tokenText.secondary, border: `1px solid ${tokenDivider}`}} />
                </Box>
              </Box>
            </Paper>
            {executionTasks.map((task, index) => renderTaskCard(task, index + 1))}
          </Box>

          <Box sx={{borderTop: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', px: {xs: 1.5, md: 2.6}, py: {xs: 1.25, md: 1.6}, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', flexShrink: 0}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
              <Chip icon={<CheckCircleOutlineIcon />} label={`${completedExecutionCount}/${executionTasks.length} Completed`} sx={{height: 34, fontWeight: 800, bgcolor: tokenNeutral.lighter, color: tokenSuccess.darker, border: `1px solid ${tokenDivider}`, '& .MuiChip-icon': {color: tokenSuccess.darker}}} />
              {!isLineLeaderReview && !isReplayReadOnly ? <Typography sx={{color: tokenWarning.dark, fontWeight: 800, fontFamily: workstationVisuals.fontFamily}}>Complete all tasks</Typography> : null}
            </Box>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap'}}>
              {isLineLeaderReview ? (
                <>
                  <Button variant="outlined" onClick={onReturnReview} sx={{height: 42, textTransform: 'none', borderRadius: '6px', fontWeight: 800, color: tokenBrand.main, borderColor: tokenBrand.main, px: 2.2, '&:hover': {borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg}}}>
                    Return Changeover
                  </Button>
                  <Button variant="contained" onClick={onCompleteReview} sx={{height: 42, textTransform: 'none', borderRadius: '6px', fontWeight: 800, bgcolor: tokenBrand.main, color: tokenBrand.contrast, px: 2.2, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}>
                    Complete Changeover
                  </Button>
                </>
              ) : !isReplayReadOnly ? (
                <>
                  <Button variant="contained" startIcon={<DoneAllIcon />} onClick={completeAllTasks} sx={{height: 42, textTransform: 'none', borderRadius: '6px', fontWeight: 800, bgcolor: tokenBrand.main, color: tokenBrand.contrast, px: 2.2, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}>Complete All</Button>
                  <Button variant="outlined" startIcon={<SaveOutlinedIcon />} onClick={saveDraft} sx={{height: 42, textTransform: 'none', borderRadius: '6px', fontWeight: 800, color: tokenBrand.main, borderColor: tokenBrand.main, px: 2.2, '&:hover': {borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg}}}>Save As Draft</Button>
                  <Button variant="contained" onClick={finishExecution} disabled={!executionTasks.every((task) => task.executionStatus !== 'pending')} sx={{height: 42, textTransform: 'none', borderRadius: '6px', fontWeight: 800, bgcolor: tokenBrand.main, color: tokenBrand.contrast, px: 2.2, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}, '&&.Mui-disabled': {background: `${tokenNeutral.main} !important`, backgroundColor: `${tokenNeutral.main} !important`, color: `${tokenText.disabled} !important`, WebkitTextFillColor: tokenText.disabled, opacity: 1}}}>Complete Changeover</Button>
                </>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={isSummaryOpen} onClose={closeSummary} maxWidth="md" fullWidth PaperProps={{sx: {borderRadius: '12px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, boxShadow: 'none'}}}>
        <Box sx={{p: {xs: 2, md: 2.4}}}>
          <Box sx={{display: 'flex', justifyContent: 'center', mb: 1}}>
            <Box sx={{width: 72, height: 72, borderRadius: '50%', bgcolor: tokenNeutral.main, border: `1px solid ${tokenSuccess.lightest}`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <CheckCircleOutlineIcon sx={{fontSize: 40, color: tokenSuccess.darker}} />
            </Box>
          </Box>
          <Typography sx={{textAlign: 'center', fontSize: '1.5rem', fontWeight: 700, color: tokenText.primary}}>
            Changeover Completed
          </Typography>
          <Typography sx={{textAlign: 'center', color: tokenText.secondary, mt: 0.45, mb: 1.4}}>
            All planned stages were finalized. Review execution outcomes below.
          </Typography>

          <Paper elevation={0} sx={{p: 1.25, borderRadius: '12px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}`, boxShadow: 'none'}}>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 1}}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.2}}>
                <Typography variant="body2" sx={{color: tokenText.secondary}}>Line / Zone</Typography>
                <Typography sx={{fontWeight: 700, color: tokenText.primary}}>Line 10 | Z1</Typography>
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.2}}>
                <Typography variant="body2" sx={{color: tokenText.secondary}}>Duration</Typography>
                <Typography sx={{fontWeight: 700, color: tokenText.primary}}>{formatSeconds(executionSummary?.elapsedSeconds ?? 0)}</Typography>
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.2}}>
                <Typography variant="body2" sx={{color: tokenText.secondary}}>Expected Time</Typography>
                <Typography sx={{fontWeight: 700, color: tokenText.primary}}>{executionSummary?.expectedMinutes ?? 0} min</Typography>
              </Box>
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.2}}>
                <Typography variant="body2" sx={{color: tokenText.secondary}}>Time Status</Typography>
                <Typography sx={{fontWeight: 700, color: ((executionSummary?.elapsedSeconds ?? 0) / 60) > (executionSummary?.expectedMinutes ?? 0) ? tokenError.main : tokenSuccess.darker}}>
                  {((executionSummary?.elapsedSeconds ?? 0) / 60) > (executionSummary?.expectedMinutes ?? 0) ? 'Over expected' : 'Within expected'}
                </Typography>
              </Box>
            </Box>
          </Paper>

          <Box sx={{mt: 1.2}}>
            <Typography sx={{fontWeight: 700, color: tokenText.primary, mb: 0.7}}>Task Results</Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr 1fr 1fr 1fr'}, gap: 0.9}}>
              <Paper elevation={0} sx={{p: 1.05, borderRadius: '12px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}`, boxShadow: 'none'}}>
                <Typography variant="caption">Total</Typography>
                <Typography sx={{fontWeight: 700}}>{executionSummary?.totalTasks ?? 0}</Typography>
              </Paper>
              <Paper elevation={0} sx={{p: 1.05, borderRadius: '12px', bgcolor: tokenNeutral.lighter, border: `1px solid ${tokenSuccess.lighter}`, boxShadow: 'none'}}>
                <Typography variant="caption">Completed</Typography>
                <Typography sx={{fontWeight: 700}}>{executionSummary?.completedCount ?? 0}</Typography>
              </Paper>
              <Paper elevation={0} sx={{p: 1.05, borderRadius: '12px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenWarning.lighter}`, boxShadow: 'none'}}>
                <Typography variant="caption">N/A</Typography>
                <Typography sx={{fontWeight: 700}}>{executionSummary?.naCount ?? 0}</Typography>
              </Paper>
              <Paper elevation={0} sx={{p: 1.05, borderRadius: '12px', bgcolor: tokenNeutral.lighter, border: `1px solid ${tokenWarning.lighter}`, boxShadow: 'none'}}>
                <Typography variant="caption">Issues</Typography>
                <Typography sx={{fontWeight: 700}}>{executionSummary?.issueCount ?? 0}</Typography>
              </Paper>
              <Paper elevation={0} sx={{p: 1.05, borderRadius: '12px', bgcolor: tokenNeutral.lighter, border: `1px solid ${tokenBrand.lightest}`, boxShadow: 'none'}}>
                <Typography variant="caption">Comments</Typography>
                <Typography sx={{fontWeight: 700}}>{executionSummary?.commentCount ?? 0}</Typography>
              </Paper>
            </Box>
          </Box>

          <Box sx={{mt: 1.7}}>
            <Button fullWidth variant="contained" onClick={closeSummary} sx={{textTransform: 'none', fontWeight: 500, borderRadius: '8px', bgcolor: tokenBrand.main, color: tokenBrand.contrast, boxShadow: 'none', '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'}}}>
              Done
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
        config={equipmentChangeoverNotificationConfig}
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

