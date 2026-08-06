import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  AssignmentOutlined as AssignmentIcon,
  AutoAwesome as AutoAwesomeIcon,
  CalendarMonth as CalendarIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ExpandMore as ExpandMoreIcon,
  InfoOutlined as InfoIcon,
  MoreVert as MoreVertIcon,
  OpenInNew as OpenInNewIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenSuccess,
  tokenWarning,
  tokenInfo,
  tokenNeutral,
  tokenText,
  tokenCommon,
  tokenDivider,
  workstationVisuals,
} from '../theme';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  myTasksNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';
import WidgetShell from './WidgetShell';

type MyTasksWidgetProps = {
  className?: string;
  style?: CSSProperties;
  timeframe?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'shift';
  shift?: string;
  onViewModeChange?: (viewMode: 'graph' | 'table') => void;
  onExpand?: () => void;
  domain?: string;
  onStartTask?: (task: ConsolidatedTask) => void;
  onOpenAiForTask?: (task: ConsolidatedTask) => void;
};

export type TaskKind = 'changeover' | 'cil' | 'centerline';
type TaskStatus = 'pending' | 'in-progress' | 'completed';

export const MY_TASKS_START_TASK_EVENT = 'bd:my-tasks:start-task';
export const MY_TASKS_COMPLETE_TASK_EVENT = 'bd:my-tasks:complete-task';

export type ConsolidatedTask = {
  id: string;
  kind: TaskKind;
  code: 'CO' | 'CIL' | 'CL';
  title: string;
  role: string;
  date: string;
  time: string;
  area: string;
  equipment: string;
  reminderEquipment: string;
  reminderTools: string;
  status: TaskStatus;
};

export const consolidatedTasks: ConsolidatedTask[] = [
  {
    id: 'cl-1',
    kind: 'centerline',
    code: 'CL',
    title: 'Centerline: Zone A Main Indexer',
    role: 'Centerline Operator',
    date: 'May 12, 2026',
    time: '06:00 AM',
    area: 'Zone A',
    equipment: 'Main Indexer Z1',
    reminderEquipment: 'Calibrated pressure gauge, IR thermometer',
    reminderTools: 'HMI access badge',
    status: 'completed',
  },
  {
    id: 'cl-3',
    kind: 'centerline',
    code: 'CL',
    title: 'Centerline: Zone C Press',
    role: 'Centerline Operator',
    date: 'May 12, 2026',
    time: '02:30 PM',
    area: 'Zone C',
    equipment: 'Press Z3',
    reminderEquipment: 'Calibrated pressure gauge, IR thermometer',
    reminderTools: 'HMI access badge',
    status: 'in-progress',
  },
  {
    id: 'cil-1',
    kind: 'cil',
    code: 'CIL',
    title: 'CIL: Zone A Cutter',
    role: 'CIL Operator',
    date: 'May 12, 2026',
    time: '10:00 AM',
    area: 'Zone A',
    equipment: 'Cutter Z1',
    reminderEquipment: 'Flashlight, Inspection mirror',
    reminderTools: 'Clamp plier, 6mm Allen key',
    status: 'pending',
  },
  {
    id: 'cl-2',
    kind: 'centerline',
    code: 'CL',
    title: 'Centerline: Zone B Tipper',
    role: 'Centerline Operator',
    date: 'May 12, 2026',
    time: '06:00 AM',
    area: 'Zone B',
    equipment: 'Tipper Z2',
    reminderEquipment: 'Calibrated pressure gauge, IR thermometer',
    reminderTools: 'HMI access badge',
    status: 'pending',
  },
  {
    id: 'cil-2',
    kind: 'cil',
    code: 'CIL',
    title: 'CIL: Zone D Mixer',
    role: 'CIL Operator',
    date: 'May 12, 2026',
    time: '03:45 PM',
    area: 'Zone D',
    equipment: 'Mixer Z4',
    reminderEquipment: 'Flashlight, Inspection mirror',
    reminderTools: '6mm Allen key',
    status: 'pending',
  },
  {
    id: 'co-1',
    kind: 'changeover',
    code: 'CO',
    title: 'Changeover: SKU A -> SKU B',
    role: 'Equipment Setup Changeover Operator',
    date: 'May 12, 2026',
    time: '08:15 AM',
    area: 'Zone A',
    equipment: 'Changeover Station',
    reminderEquipment: 'Flashlight, PPE kit',
    reminderTools: 'Inspection mirror, Vacuum nozzle',
    status: 'pending',
  },
];

const taskExecutionSteps: Record<TaskKind, string[]> = {
  centerline: [
    'Confirm standard value and acceptable range',
    'Measure current equipment setting',
    'Record reading and adjustment note',
    'Submit centerline check for the shift log',
  ],
  cil: [
    'Confirm lockout and required PPE',
    'Clean, inspect, and lubricate the assigned point',
    'Record abnormality or no-find result',
    'Submit CIL completion evidence',
  ],
  changeover: [
    'Complete pre-changeover readiness check',
    'Perform line clearance and setup for SKU B',
    'Validate centerline settings after setup',
    'Capture ramp-up notes and release the line',
  ],
};

const timeframeFilterLabel: Record<NonNullable<MyTasksWidgetProps['timeframe']>, string> = {
  hourly: 'Today',
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
  shift: 'Today',
};

const dateFilterOptions = ['Today', 'This Week', 'This Month', 'Last 30d'];
const filterOptions: Array<{ label: string; value: 'all' | TaskKind; code?: string }> = [
  { label: 'All', value: 'all' },
  { label: 'CIL', value: 'cil', code: 'CIL' },
  { label: 'Centerline', value: 'centerline', code: 'CL' },
  { label: 'Changeover', value: 'changeover', code: 'CO' },
];

const filterButtonSx = {
  height: 26,
  borderRadius: '8px',
  px: 1.15,
  border: `1px solid ${tokenDivider}`,
  color: tokenText.secondary,
  bgcolor: tokenCommon.white,
  textTransform: 'none',
  fontSize: '0.72rem',
  fontWeight: 500,
  fontFamily: workstationVisuals.fontFamily,
  transition: 'all 0.15s ease',
  '&:hover': {
    bgcolor: tokenNeutral.lightest,
    borderColor: tokenBrand.main,
  },
  '& .MuiButton-startIcon': { mr: 0.3, '& svg': { fontSize: 13 } },
  '& .MuiButton-endIcon': { ml: 0.2, '& svg': { fontSize: 13 } },
} as const;

const tableHeaderSx = {
  color: tokenText.secondary,
  fontSize: '0.7rem',
  fontWeight: 700,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.2,
} as const;

const bodyTextSx = {
  color: tokenText.primary,
  fontSize: '0.74rem',
  fontWeight: 700,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.3,
} as const;

const metaTextSx = {
  color: tokenText.secondary,
  fontSize: '0.66rem',
  fontWeight: 500,
  fontFamily: workstationVisuals.fontFamily,
  lineHeight: 1.35,
} as const;

const taskTableColumns = 'minmax(150px, 1.35fr) 82px minmax(108px, 0.85fr) minmax(126px, 1fr) 104px 128px 28px';

function getKindTone(kind: TaskKind) {
  if (kind === 'changeover') {
    return { color: tokenBrand.main, bg: tokenBrand.softBg, label: 'Changeover' };
  }
  if (kind === 'cil') {
    return { color: tokenInfo.darker, bg: tokenInfo.softBg, label: 'CIL' };
  }
  return { color: tokenWarning.dark, bg: tokenWarning.softBg, label: 'Centerline' };
}

function getStatusMeta(status: TaskStatus) {
  if (status === 'completed') {
    return { label: 'Completed', color: tokenSuccess.darker, bg: tokenSuccess.softBg, icon: <CheckCircleOutlineIcon /> };
  }
  if (status === 'in-progress') {
    return { label: 'In Progress', color: tokenWarning.dark, bg: tokenWarning.softBg, icon: <PlayArrowIcon /> };
  }
  return { label: 'Pending', color: tokenText.secondary, bg: tokenNeutral.lightest, icon: <AccessTimeIcon /> };
}

function getActionLabel(task: ConsolidatedTask) {
  if (task.status === 'completed') return 'View Details';
  if (task.status === 'in-progress') return `Continue ${task.code}`;
  if (task.kind === 'changeover') return 'Start Changeover';
  return `Start ${task.code}`;
}

function TaskTypeBadge({ task }: { task: ConsolidatedTask }) {
  const tone = getKindTone(task.kind);

  return (
    <Box
      component="span"
      sx={{
        width: 32,
        height: 24,
        borderRadius: '8px',
        bgcolor: tone.bg,
        color: tone.color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.68rem',
        fontWeight: 800,
        fontFamily: workstationVisuals.fontFamily,
        flexShrink: 0,
      }}
    >
      {task.code}
    </Box>
  );
}

function StatusPill({ status }: { status: TaskStatus }) {
  const meta = getStatusMeta(status);

  return (
    <Box
      component="span"
      sx={{
        minWidth: 0,
        px: 0.85,
        py: 0.3,
        borderRadius: '8px',
        bgcolor: meta.bg,
        color: meta.color,
        border: `1px solid ${tokenDivider}`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.4,
        fontSize: '0.66rem',
        fontWeight: 700,
        fontFamily: workstationVisuals.fontFamily,
        whiteSpace: 'nowrap',
        '& svg': { fontSize: 13 },
      }}
    >
      {meta.icon}
      {meta.label}
    </Box>
  );
}

function SummaryMetric({
  icon,
  label,
  value,
  note,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  note: string;
  tone: string;
}) {
  return (
    <Box
      sx={{
        minWidth: 0,
        display: 'grid',
        gridTemplateColumns: '28px minmax(0, 1fr)',
        alignItems: 'center',
        gap: 0.8,
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: '8px',
          bgcolor: tokenNeutral.lightest,
          color: tone,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '& svg': { fontSize: 16 },
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ ...metaTextSx, fontSize: '0.62rem' }} noWrap>{label}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.55, minWidth: 0 }}>
          <Typography sx={{ color: tone, fontSize: '1.05rem', fontWeight: 800, lineHeight: 1, fontFamily: workstationVisuals.fontFamily }}>
            {value}
          </Typography>
          <Typography sx={{ ...metaTextSx, whiteSpace: 'nowrap' }}>{note}</Typography>
        </Box>
      </Box>
    </Box>
  );
}

function TaskActionButton({ task, onClick, compact = false }: { task: ConsolidatedTask; onClick: () => void; compact?: boolean }) {
  const isCompleted = task.status === 'completed';

  return (
    <Button
      variant={isCompleted ? 'outlined' : 'contained'}
      startIcon={isCompleted ? undefined : <PlayArrowIcon sx={{ fontSize: '0.86rem' }} />}
      onClick={onClick}
      sx={{
        width: '100%',
        minWidth: compact ? 104 : 0,
        minHeight: compact ? 28 : 30,
        borderRadius: '8px',
        textTransform: 'none',
        fontSize: compact ? '0.66rem' : '0.68rem',
        fontWeight: 700,
        whiteSpace: 'nowrap',
        boxShadow: 'none',
        px: compact ? 0.9 : 1,
        bgcolor: isCompleted ? tokenCommon.white : tokenBrand.main,
        color: isCompleted ? tokenText.primary : tokenCommon.white,
        borderColor: isCompleted ? tokenDivider : tokenBrand.main,
        '& .MuiButton-startIcon': { mr: 0.3 },
        '&:hover': {
          bgcolor: isCompleted ? tokenNeutral.lightest : tokenBrand.dark,
          borderColor: isCompleted ? tokenDivider : tokenBrand.dark,
          boxShadow: 'none',
        },
      }}
    >
      {getActionLabel(task)}
    </Button>
  );
}

function TaskExecutionDialog({
  task,
  open,
  onClose,
}: {
  task: ConsolidatedTask | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!task) return null;

  const tone = getKindTone(task.kind);
  const actionLabel = task.status === 'completed'
    ? 'Done'
    : task.status === 'in-progress'
      ? 'Continue Execution'
      : 'Start Execution';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          border: `1px solid ${tokenDivider}`,
          boxShadow: '0 12px 32px rgba(0, 31, 155, 0.14)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1.25, fontFamily: workstationVisuals.fontFamily }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.65, minWidth: 0 }}>
              <TaskTypeBadge task={task} />
              <Typography sx={{ color: tone.color, fontSize: '0.76rem', fontWeight: 800 }} noWrap>
                {tone.label}
              </Typography>
            </Box>
            <Typography sx={{ color: tokenText.primary, fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.25 }}>
              {task.title}
            </Typography>
            <Typography sx={{ ...metaTextSx, mt: 0.4 }}>
              {task.role} | {task.date} at {task.time}
            </Typography>
          </Box>
          <StatusPill status={task.status} />
        </Box>
      </DialogTitle>

      <DialogContent sx={{ pt: 0 }}>
        <Divider sx={{ mb: 1.5 }} />
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.2, mb: 1.5 }}>
          <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
            <Typography sx={{ ...metaTextSx, fontWeight: 800, color: tokenText.primary }}>Area / Equipment</Typography>
            <Typography sx={{ ...bodyTextSx, mt: 0.45 }}>{task.area}</Typography>
            <Typography sx={metaTextSx}>{task.equipment}</Typography>
          </Box>
          <Box sx={{ p: 1.2, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
            <Typography sx={{ ...metaTextSx, fontWeight: 800, color: tokenText.primary }}>Reminders / Tools</Typography>
            <Typography sx={{ ...metaTextSx, mt: 0.45, color: tokenText.primary }}>Equipment: {task.reminderEquipment}</Typography>
            <Typography sx={metaTextSx}>Tools: {task.reminderTools}</Typography>
          </Box>
        </Box>

        <Box sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '12px', overflow: 'hidden' }}>
          {taskExecutionSteps[task.kind].map((step, index) => {
            const completedStep = task.status === 'completed' || (task.status === 'in-progress' && index === 0);
            return (
              <Box
                key={step}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '24px minmax(0, 1fr)',
                  gap: 1,
                  alignItems: 'center',
                  px: 1.2,
                  py: 1,
                  borderBottom: index === taskExecutionSteps[task.kind].length - 1 ? 'none' : `1px solid ${tokenDivider}`,
                  bgcolor: completedStep ? tokenSuccess.softBg : tokenCommon.white,
                }}
              >
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    borderRadius: '999px',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: completedStep ? tokenSuccess.darker : tokenNeutral.light,
                    color: completedStep ? tokenCommon.white : tokenText.secondary,
                    fontSize: '0.68rem',
                    fontWeight: 800,
                  }}
                >
                  {completedStep ? <CheckCircleOutlineIcon sx={{ fontSize: 15 }} /> : index + 1}
                </Box>
                <Typography sx={{ ...bodyTextSx, fontWeight: 600 }}>{step}</Typography>
              </Box>
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, pt: 0.5 }}>
        <Button onClick={onClose} sx={{ ...filterButtonSx, height: 32 }}>
          Close
        </Button>
        <Button
          variant="contained"
          onClick={onClose}
          startIcon={task.status === 'completed' ? undefined : <PlayArrowIcon />}
          sx={{
            borderRadius: '8px',
            bgcolor: tokenBrand.main,
            color: tokenCommon.white,
            textTransform: 'none',
            fontWeight: 700,
            boxShadow: 'none',
            '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
          }}
        >
          {actionLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function TaskAssistDialog({
  task,
  open,
  onClose,
  onStart,
  onOpenAi,
}: {
  task: ConsolidatedTask | null;
  open: boolean;
  onClose: () => void;
  onStart: (task: ConsolidatedTask) => void;
  onOpenAi?: (task: ConsolidatedTask) => void;
}) {
  if (!task) return null;

  const tone = getKindTone(task.kind);
  const taskLabel = task.kind === 'changeover' ? 'Changeover' : task.code;
  const taskName = task.kind === 'changeover' ? 'changeover' : task.kind === 'centerline' ? 'Centerline' : 'CIL';

  const startTask = (withAi: boolean) => {
    if (withAi) {
      onOpenAi?.(task);
      onClose();
      return;
    }
    onStart(task);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          border: `1px solid ${tokenDivider}`,
          boxShadow: '0 6px 16px rgba(0, 31, 155, 0.12), 0 2px 6px rgba(0, 31, 155, 0.08)',
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 2.4, pb: 1.2, fontFamily: workstationVisuals.fontFamily }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, minWidth: 0 }}>
          <TaskTypeBadge task={task} />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ color: tone.color, fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.3 }}>
              {taskLabel} execution
            </Typography>
            <Typography sx={{ color: tokenText.primary, fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.25, mt: 0.25 }}>
              Start task execution
            </Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.45, mt: 0.6 }}>
              Choose the standard execution modal or a guided BD Atlas AI chat.
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pt: 0 }}>
        <Typography sx={{ ...bodyTextSx, fontWeight: 700 }}>
          {task.title}
        </Typography>
        <Typography sx={{ ...metaTextSx, mt: 0.65, fontSize: '0.8125rem', lineHeight: 1.45 }}>
          Open execution starts the formal modal. BD Atlas AI guides the same {taskName} flow in chat without opening the modal.
        </Typography>
        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: '12px', bgcolor: tokenNeutral.lightest }}>
          {[
            ['Area / Equipment', `${task.area} | ${task.equipment}`],
            ['Tools', task.reminderTools],
          ].map(([label, value]) => (
            <Box key={label} sx={{ display: 'grid', gridTemplateColumns: '104px minmax(0, 1fr)', gap: 1, alignItems: 'baseline', '& + &': { mt: 0.75 } }}>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 700, lineHeight: 1.35 }}>
                {label}
              </Typography>
              <Typography sx={{ color: tokenText.primary, fontSize: '0.8125rem', fontWeight: 500, lineHeight: 1.35, minWidth: 0 }}>
                {value}
              </Typography>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.4, pt: 1.6, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose} sx={{ ...filterButtonSx, height: 34 }}>
          Cancel
        </Button>
        <Button onClick={() => startTask(false)} variant="outlined" sx={{ ...filterButtonSx, height: 34, color: tokenBrand.main, borderColor: tokenBrand.main }}>
          Open execution
        </Button>
        <Button
          onClick={() => startTask(true)}
          variant="contained"
          startIcon={<AutoAwesomeIcon />}
          sx={{
            borderRadius: '8px',
            bgcolor: tokenBrand.main,
            color: tokenCommon.white,
            textTransform: 'none',
            fontWeight: 800,
            boxShadow: 'none',
            '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
          }}
        >
          Open with BD Atlas AI
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function MyTasksWidget({
  className,
  style,
  timeframe,
  onExpand,
  onStartTask,
  onOpenAiForTask,
}: MyTasksWidgetProps) {
  const [dateFilter, setDateFilter] = useState(timeframe ? timeframeFilterLabel[timeframe] : 'Today');
  const [dateAnchor, setDateAnchor] = useState<null | HTMLElement>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | TaskKind>('all');
  const [activeTask, setActiveTask] = useState<ConsolidatedTask | null>(null);
  const [assistTask, setAssistTask] = useState<ConsolidatedTask | null>(null);
  const [taskStatusOverrides, setTaskStatusOverrides] = useState<Record<string, TaskStatus>>({});
  const notifications = useWidgetNotifications(myTasksNotificationConfig);

  const displayedTasks = useMemo(() => consolidatedTasks.map((task) => ({
    ...task,
    status: taskStatusOverrides[task.id] ?? task.status,
  })), [taskStatusOverrides]);

  const filteredTasks = useMemo(() => {
    if (activeFilter === 'all') return displayedTasks;
    return displayedTasks.filter((task) => task.kind === activeFilter);
  }, [activeFilter, displayedTasks]);

  const completedCount = displayedTasks.filter((task) => task.status === 'completed').length;
  const inProgressCount = displayedTasks.filter((task) => task.status === 'in-progress').length;
  const pendingCount = displayedTasks.filter((task) => task.status === 'pending').length;

  useEffect(() => {
    const handleCompleteTask = (event: Event) => {
      const detail = (event as CustomEvent<{taskId?: string}>).detail;
      if (!detail?.taskId) return;
      setTaskStatusOverrides((current) => ({...current, [detail.taskId!]: 'completed'}));
    };
    window.addEventListener(MY_TASKS_COMPLETE_TASK_EVENT, handleCompleteTask);
    return () => window.removeEventListener(MY_TASKS_COMPLETE_TASK_EVENT, handleCompleteTask);
  }, []);

  const openTaskFlow = (task: ConsolidatedTask) => {
    if (onStartTask || onOpenAiForTask) {
      setAssistTask(task);
      return;
    }
    setActiveTask(task);
  };

  const openPrimaryTask = () => {
    const nextTask = filteredTasks.find((task) => task.status === 'in-progress')
      ?? filteredTasks.find((task) => task.status === 'pending')
      ?? filteredTasks[0];
    if (nextTask) {
      openTaskFlow(nextTask);
      return;
    }
    onExpand?.();
  };

  const headerAction = (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <Button
        variant="outlined"
        startIcon={<OpenInNewIcon />}
        onClick={openPrimaryTask}
        sx={filterButtonSx}
      >
        Open
      </Button>
    </Box>
  );

  return (
    <WidgetShell
      title={(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, minWidth: 0 }}>
          <Typography sx={{ fontSize: '0.92rem', fontWeight: 700, color: tokenText.primary, fontFamily: workstationVisuals.fontFamily }}>
            My Tasks
          </Typography>
          <Tooltip title="Consolidates CIL, Centerline, and Changeover operator tasks.">
            <InfoIcon sx={{ fontSize: 15, color: tokenText.secondary }} />
          </Tooltip>
        </Box>
      )}
      action={headerAction}
      className={className}
      style={style}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9, height: '100%', minHeight: 0, p: 0.35 }}>
        <Menu anchorEl={dateAnchor} open={Boolean(dateAnchor)} onClose={() => setDateAnchor(null)}>
          {dateFilterOptions.map((option) => (
            <MenuItem key={option} selected={option === dateFilter} onClick={() => { setDateFilter(option); setDateAnchor(null); }}>
              {option}
            </MenuItem>
          ))}
        </Menu>

        <Box
          sx={{
            border: `1px solid ${tokenDivider}`,
            borderRadius: '12px',
            bgcolor: tokenCommon.white,
            px: 1.15,
            py: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: 1,
            flexShrink: 0,
            '@container (max-width: 660px)': {
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              px: 1,
              py: 0.85,
            },
          }}
        >
          <SummaryMetric icon={<AssignmentIcon />} label="Total Tasks" value={displayedTasks.length} note={dateFilter} tone={tokenBrand.main} />
          <SummaryMetric icon={<CheckCircleOutlineIcon />} label="Completed Today" value={completedCount} note={completedCount === 1 ? 'Task' : 'Tasks'} tone={tokenSuccess.darker} />
          <SummaryMetric icon={<PlayArrowIcon />} label="In Progress" value={inProgressCount} note={inProgressCount === 1 ? 'Task' : 'Tasks'} tone={tokenWarning.main} />
          <SummaryMetric icon={<AccessTimeIcon />} label="Pending" value={pendingCount} note={pendingCount === 1 ? 'Task' : 'Tasks'} tone={tokenText.secondary} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap', flexShrink: 0 }}>
          {filterOptions.map((option) => {
            const selected = activeFilter === option.value;
            const tone = option.value === 'all' ? { color: tokenBrand.main, bg: tokenBrand.softBg } : getKindTone(option.value);
            return (
              <Button
                key={option.value}
                variant="outlined"
                onClick={() => setActiveFilter(option.value)}
                sx={{
                  minWidth: 0,
                  height: 26,
                  borderRadius: '8px',
                  px: 1,
                  gap: 0.5,
                  borderColor: selected ? tokenBrand.main : tokenDivider,
                  bgcolor: selected ? tokenBrand.softBg : tokenCommon.white,
                  color: selected ? tokenBrand.main : tokenText.primary,
                  textTransform: 'none',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  boxShadow: 'none',
                  '&:hover': { borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg },
                }}
              >
                {option.code ? (
                  <Box component="span" sx={{ px: 0.55, py: 0.12, borderRadius: '6px', bgcolor: tone.bg, color: tone.color, fontSize: '0.62rem', fontWeight: 800 }}>
                    {option.code}
                  </Box>
                ) : null}
                {option.label}
              </Button>
            );
          })}
          <Button
            variant="outlined"
            startIcon={<CalendarIcon />}
            endIcon={<ExpandMoreIcon />}
            onClick={(event) => setDateAnchor(event.currentTarget)}
            sx={{ ...filterButtonSx, ml: 'auto' }}
          >
            {dateFilter}
          </Button>
        </Box>

        <Box
          sx={{
            border: `1px solid ${tokenDivider}`,
            borderRadius: '12px',
            bgcolor: tokenCommon.white,
            overflow: 'hidden',
            minHeight: 0,
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              px: 1.2,
              py: 0.85,
              borderBottom: `1px solid ${tokenDivider}`,
              display: 'grid',
              gridTemplateColumns: taskTableColumns,
              alignItems: 'center',
              columnGap: 0.85,
              flexShrink: 0,
              '@container (max-width: 760px)': { display: 'none' },
            }}
          >
            <Typography sx={tableHeaderSx}>Task</Typography>
            <Typography sx={tableHeaderSx}>Scheduled</Typography>
            <Typography sx={tableHeaderSx}>Area / Equipment</Typography>
            <Typography sx={tableHeaderSx}>Reminder / Tools</Typography>
            <Typography sx={tableHeaderSx}>Status</Typography>
            <Typography sx={tableHeaderSx}>Action</Typography>
            <Box />
          </Box>

          <Box sx={{ overflow: 'auto', flex: 1, minHeight: 0 }}>
            {filteredTasks.map((task, index) => (
              <Box key={task.id} sx={{ borderBottom: index === filteredTasks.length - 1 ? 'none' : `1px solid ${tokenDivider}` }}>
                <Box
                  sx={{
                    px: 1.2,
                    py: 0.82,
                    display: 'grid',
                    gridTemplateColumns: taskTableColumns,
                    alignItems: 'center',
                    columnGap: 0.85,
                    '&:hover': { bgcolor: tokenNeutral.lightest },
                    '@container (max-width: 760px)': { display: 'none' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, minWidth: 0 }}>
                    <TaskTypeBadge task={task} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ ...bodyTextSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </Typography>
                      <Typography sx={{ ...metaTextSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={bodyTextSx}>{task.date}</Typography>
                    <Typography sx={metaTextSx}>{task.time}</Typography>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={bodyTextSx}>{task.area}</Typography>
                    <Typography sx={{ ...metaTextSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.equipment}
                    </Typography>
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ ...metaTextSx, color: tokenText.primary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Equipment: {task.reminderEquipment}
                    </Typography>
                    <Typography sx={{ ...metaTextSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Tools: {task.reminderTools}
                    </Typography>
                  </Box>
                  <StatusPill status={task.status} />
                  <TaskActionButton task={task} onClick={() => openTaskFlow(task)} />
                  <Tooltip title="More task actions">
                    <IconButton size="small" sx={{ width: 26, height: 26, color: tokenText.secondary, borderRadius: '8px' }}>
                      <MoreVertIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box
                  sx={{
                    display: 'none',
                    px: 1,
                    py: 0.85,
                    gridTemplateColumns: '32px minmax(0, 1fr) auto',
                    columnGap: 0.75,
                    rowGap: 0.65,
                    alignItems: 'start',
                    '&:hover': { bgcolor: tokenNeutral.lightest },
                    '@container (max-width: 760px)': { display: 'grid' },
                  }}
                >
                  <TaskTypeBadge task={task} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ ...bodyTextSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.title}
                    </Typography>
                    <Typography sx={{ ...metaTextSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {task.date} {task.time} | {task.area} | {task.equipment}
                    </Typography>
                    <Typography sx={{ ...metaTextSx, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      Tools: {task.reminderTools}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'grid', gap: 0.55, justifyItems: 'end' }}>
                    <StatusPill status={task.status} />
                    <TaskActionButton task={task} onClick={() => openTaskFlow(task)} compact />
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <TaskExecutionDialog task={activeTask} open={Boolean(activeTask)} onClose={() => setActiveTask(null)} />
        <TaskAssistDialog
          task={assistTask}
          open={Boolean(assistTask)}
          onClose={() => setAssistTask(null)}
          onOpenAi={onOpenAiForTask}
          onStart={(task) => {
            if (onStartTask) {
              onStartTask(task);
              return;
            }
            setActiveTask(task);
          }}
        />

        <WidgetNotificationsDialog
          active={notifications.active}
          config={myTasksNotificationConfig}
          draftState={notifications.draftState}
          onApplySuggestion={notifications.applySuggestion}
          onClose={notifications.closeDialog}
          onSave={notifications.saveDialog}
          onStateChange={notifications.setDraftState}
          open={notifications.open}
        />
      </Box>
    </WidgetShell>
  );
}
