import {lazy, Suspense, useCallback, useEffect, useMemo, useState, type ReactNode} from 'react';
import {
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AutoAwesome as AutoAwesomeIcon,
  AutoGraph as AutoGraphIcon,
  CalendarMonth as CalendarMonthIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  Factory as FactoryIcon,
  GppMaybe as GppMaybeIcon,
  Inventory2 as Inventory2Icon,
  OpenInNew as OpenInNewIcon,
  PlaylistAddCheckCircle as PlaylistAddCheckCircleIcon,
  RocketLaunch as RocketLaunchIcon,
  Schedule as ScheduleIcon,
  TrackChanges as TrackChangesIcon,
  TableRows as TableRowsIcon,
  ThumbDownAltOutlined as ThumbDownAltOutlinedIcon,
  ThumbUpAltOutlined as ThumbUpAltOutlinedIcon,
  Timeline as TimelineIcon,
  ViewColumn as ViewColumnIcon,
  ViewKanban as ViewKanbanIcon,
  ViewTimeline as ViewTimelineIcon,
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
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  initialPlanningAuditEvents,
  initialPlanningRecommendations,
  planningOverviewBriefing,
  planningOverviewKpis,
  planningOverviewStatusCards,
  type PlanningAuditEvent,
  type PlanningKpi,
  type PlanningRecommendation,
  type PlanningStatusCard,
  type ProductionPlanningPageId,
} from './planningOverviewMock';
import {
  initialAiSequence,
  initialApprovedSequence,
  initialSchedulingAuditEvents,
  initialUnscheduledBacklog,
  schedulingDays,
  schedulingLines,
  schedulingReasonCodes,
  schedulingWorkflowLinks,
  type SchedulingAuditEvent,
  type SchedulingDayColumn,
  type SchedulingLine,
  type SchedulingValidationIssue,
  type SchedulingViewMode,
  type SchedulingWorkOrder,
} from './schedulingWorkspaceMock';
import {
  createAiSequenceSimulationMock,
  createAiSimulationSchedulingWorkOrders,
  createAiSimulationTimelineWorkOrders,
} from './aiSequenceSimulationMock';
import TimelinePlanningView, {
  buildSelectedTimelineItem,
  buildTimelinePresentation,
  SchedulingTimelineToolbar,
  TimelineDetailsPanel,
  TimelineLegend,
  TimelineLineLoadSummary,
} from './schedulingWorkspaceTimeline/TimelinePlanningView';
import {
  defaultTimelineDateRange,
  defaultSelectedEventTypes,
  demoTimelineLines,
  initialTimelineAiWorkOrders,
  initialTimelineApprovedWorkOrders,
  timelineEvents as lineTimelineEvents,
  timelineCategoryConfig,
  timelineViewOptions,
} from './schedulingWorkspaceTimeline/mock';
import {schedulingMachinesMock} from './schedulingWorkspaceTimeline/schedulingMachinesMock';
import {schedulingMachineEventsMock, schedulingMachineWorkOrdersMock} from './schedulingWorkspaceTimeline/schedulingMachineWorkOrdersMock';
import type {
  ScheduledWorkOrder as TimelineScheduledWorkOrder,
  SelectedEventTypesState,
  TimelineFiltersState,
  TimelineSelection,
} from './schedulingWorkspaceTimeline/types';
import {
  defaultTimelineFilters,
} from './schedulingWorkspaceTimeline/utils';
import PlanningOverviewV2 from './PlanningOverviewV2';
const CapacityPlanningPage = lazy(() => import('./capacityPlanning/CapacityPlanningPage'));
const MpsCombinedPage = lazy(() => import('./monthlyMps/MpsCombinedPage'));
const MrpCombinedPage = lazy(() => import('./mrp/MrpCombinedPage'));
const WorkOrdersPage = lazy(() => import('./workOrders/WorkOrdersPage'));
const CreateOrdersPage = lazy(() => import('./createOrders/CreateOrdersPage'));
const MaterialAndWarehousePage = lazy(() => import('./materialAndWarehouse/MaterialAndWarehousePage'));
const DemandForecastCombinedPage = lazy(() => import('./demandForecast/DemandForecastCombinedPage'));
const ScheduleOrderCombinedPage = lazy(() => import('./scheduleVersions/ScheduleOrderCombinedPage'));
const PlanningLineagePage = lazy(() => import('./planningLineage/PlanningLineagePage'));

const productionPlanningInitialPageStorageKey = 'bd-production-planning-initial-page';

type WorkflowPage = {
  id: ProductionPlanningPageId;
  title: string;
  subtitle: string;
  icon: ReactNode;
  accent: string;
  summary: string;
  metrics: Array<{label: string; value: string}>;
  focus: string[];
};

type ManualMoveState = {
  workOrderId: string;
  source: 'approved' | 'backlog';
  action: 'schedule' | 'delay' | 'advance';
};

type PlanningMenuGroupId =
  | 'forecasting'
  | 'production-planning'
  | 'order-management'
  | 'quick-actions';

type PlanningMenuGroup = {
  id: PlanningMenuGroupId;
  label: string;
  items: Array<{
    label: string;
    description: string;
    pageId?: ProductionPlanningPageId;
    action?: () => void;
  }>;
};

const workflowPages: WorkflowPage[] = [
  {
    id: 'planning-overview',
    title: 'Planning Overview',
    subtitle: 'AI-guided production planning landing page',
    icon: <AutoGraphIcon sx={{fontSize: 20}} />,
    accent: '#7C3AED',
    summary: 'See AI-generated planning status, cross-functional risks, and decisions that need planner approval before the next release cycle.',
    metrics: [
      {label: 'Pending AI Decisions', value: '4'},
      {label: 'Plan Stability', value: '84%'},
      {label: 'High Risks', value: '2'},
    ],
    focus: ['Review AI-generated planning status.', 'Approve or reject recommended actions locally.', 'Navigate quickly to the workflow that needs attention.'],
  },
  {
    id: 'twelve-month-plan',
    title: 'Demand Forecast',
    subtitle: 'Rolling 12-month MPS feasibility and site commitment',
    icon: <CalendarMonthIcon sx={{fontSize: 20}} />,
    accent: '#8B5CF6',
    summary: 'Review rolling 12-month demand, validate feasibility, adjust site commitments, and release a working planning baseline.',
    metrics: [
      {label: 'Planned Volume', value: '12.4M'},
      {label: 'Peak Month', value: 'Oct'},
      {label: 'Constraint Alerts', value: '4'},
    ],
    focus: ['Balance long-range demand and labor assumptions.', 'Highlight seasonal peaks and line constraints.', 'Prepare scenarios and release decisions locally.'],
  },
  {
    id: 'capacity-planning',
    title: 'Capacity Planning',
    subtitle: 'Capacity balancing across lines and labor constraints',
    icon: <ViewColumnIcon sx={{fontSize: 20}} />,
    accent: '#7C3AED',
    summary: 'Balance line, labor, and campaign capacity before the monthly plan is committed downstream.',
    metrics: [
      {label: 'Critical Constraints', value: '3'},
      {label: 'Utilization Peak', value: '94%'},
      {label: 'Labor Gaps', value: '2'},
    ],
    focus: ['Compare demand against finite line capacity.', 'Surface labor and shift constraints early.', 'Prepare balancing actions before MPS release.'],
  },
  {
    id: 'monthly-mps',
    title: 'Monthly MPS',
    subtitle: 'Master production schedule alignment',
    icon: <ViewTimelineIcon sx={{fontSize: 20}} />,
    accent: '#6D28D9',
    summary: 'Convert the approved plan into a master schedule with stable build sequences and clear supply signals.',
    metrics: [
      {label: 'Frozen Horizon', value: '4 wks'},
      {label: 'Schedule Adherence', value: '91%'},
      {label: 'Release Blocks', value: '5'},
    ],
    focus: ['Freeze the near-term plan with clear assumptions.', 'Validate line sequencing and campaign logic.', 'Confirm supply commitment before release.'],
  },
  {
    id: 'mrp',
    title: 'MRP',
    subtitle: 'Material requirements planning versions',
    icon: <TrackChangesIcon sx={{fontSize: 20}} />,
    accent: '#059669',
    summary: 'Review material requirements planning runs, track official vs simulation versions, and trace each MRP back to its parent MPS baseline.',
    metrics: [
      {label: 'Active Baseline', value: 'MRP-2025-06-001'},
      {label: 'Pending Approval', value: '1'},
      {label: 'Simulation Runs', value: '4'},
    ],
    focus: [
      'Confirm official MRP is tied to an approved MPS baseline.',
      'Review simulation runs against capacity and material constraints.',
      'Trace MRP versions back to parent forecast and MPS.',
    ],
  },
  {
    id: 'scheduling-workspace',
    title: 'Scheduling Workspace',
    subtitle: 'AI-generated short-term production scheduling',
    icon: <ScheduleIcon sx={{fontSize: 20}} />,
    accent: '#7E22CE',
    summary: 'Show the AI-created short-term sequence, review exceptions, compare approved and proposed schedules, and apply planner decisions locally.',
    metrics: [
      {label: 'Lines Scheduled', value: '3'},
      {label: 'Backlog WOs', value: '3'},
      {label: 'AI Sequence Changes', value: '4'},
    ],
    focus: ['Review AI proposed sequencing by line and day.', 'Keep blocked WOs out of the schedule.', 'Apply local schedule decisions with auditability.'],
  },
  {
    id: 'work-orders',
    title: 'Work Orders',
    subtitle: 'Released and planned orders',
    icon: <AssignmentTurnedInIcon sx={{fontSize: 20}} />,
    accent: '#9333EA',
    summary: 'Track the order pool from release through execution, including due dates, priority, and exceptions.',
    metrics: [
      {label: 'Open WOs', value: '126'},
      {label: 'Late Orders', value: '9'},
      {label: 'Critical Today', value: '14'},
    ],
    focus: ['Sort priority orders for the current horizon.', 'Surface blockers before dispatch.', 'Coordinate release timing with schedule stability.'],
  },
  {
    id: 'material-and-warehouse',
    title: 'Material & Warehouse',
    subtitle: 'Supply availability and staging',
    icon: <Inventory2Icon sx={{fontSize: 20}} />,
    accent: '#6B21A8',
    summary: 'Review shortages, staging readiness, and warehouse priorities that affect build execution.',
    metrics: [
      {label: 'Shortages', value: '11'},
      {label: 'Staged Orders', value: '76%'},
      {label: 'Expedites', value: '4'},
    ],
    focus: ['Prioritize shortages against due orders.', 'Coordinate staging by schedule sequence.', 'Protect constrained and sterile materials.'],
  },
  {
    id: 'execution-feedback',
    title: 'Execution Feedback',
    subtitle: 'Closed-loop performance learning',
    icon: <PlaylistAddCheckCircleIcon sx={{fontSize: 20}} />,
    accent: '#8B5CF6',
    summary: 'Capture schedule adherence, misses, and floor feedback so the next plan is more realistic and stable.',
    metrics: [
      {label: 'Adherence', value: '89%'},
      {label: 'Missed Starts', value: '6'},
      {label: 'Recovered Orders', value: '12'},
    ],
    focus: ['Compare plan versus actual execution.', 'Feed misses back into future planning.', 'Improve realism of standards and constraints.'],
  },
];

const moduleCardSx = {
  borderRadius: 4,
  border: '1px solid var(--planning-border)',
  bgcolor: 'var(--planning-surface)',
  boxShadow: 'var(--planning-soft-shadow)',
} as const;

const severityTone: Record<PlanningStatusCard['severity'], {bg: string; color: string; border: string}> = {
  'On Track': {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  Watch: {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  'High Risk': {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'},
};

const kpiTone: Record<PlanningKpi['tone'], {bg: string; accent: string; text: string}> = {
  neutral: {bg: '#F8FAFC', accent: '#CBD5E1', text: '#334155'},
  good: {bg: '#F0FDF4', accent: '#22C55E', text: '#166534'},
  warning: {bg: '#FFF7ED', accent: '#F97316', text: '#9A3412'},
  critical: {bg: '#FEF2F2', accent: '#EF4444', text: '#991B1B'},
  ai: {bg: '#F5F3FF', accent: '#7C3AED', text: '#5B21B6'},
};

const logbookOverviewStyles = {
  pageBackground: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#FAFCFF',
  surfaceSubtle: '#F7FAFF',
  border: '#D7E0EE',
  borderSoft: '#D7E2F0',
  borderHover: '#C9D7EA',
  title: '#173A8F',
  body: '#4A5F84',
  label: '#7C93BB',
  primary: '#0C4ED8',
  primaryStrong: '#245FDB',
  primarySoft: '#EEF4FF',
  shadow: '0 6px 16px rgba(15,23,42,0.06)',
} as const;

const logbookOverviewChipSx = {
  bgcolor: logbookOverviewStyles.surfaceSubtle,
  color: '#28477D',
  border: `1px solid ${logbookOverviewStyles.border}`,
  fontWeight: 800,
} as const;

const logbookOverviewCardSx = {
  borderRadius: 3,
  border: `1px solid ${logbookOverviewStyles.border}`,
  bgcolor: logbookOverviewStyles.surface,
  boxShadow: logbookOverviewStyles.shadow,
} as const;

const readinessTone = {
  Ready: {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'},
  Warning: {bg: '#FFF7E8', color: '#B54708', border: '#F9DBAF'},
  Blocked: {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'},
} as const;

const riskTone = {
  Low: {bg: '#F0FDF4', color: '#166534'},
  Medium: {bg: '#FFF7ED', color: '#9A3412'},
  High: {bg: '#FEF2F2', color: '#991B1B'},
} as const;

function formatAuditTimestamp() {
  const now = new Date();
  return now.toLocaleString('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).replace(',', '');
}

function buildPlanningAuditEvent(action: string, item: string, details: string): PlanningAuditEvent {
  return {
    id: `AUD-PP-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    timestamp: formatAuditTimestamp(),
    action,
    item,
    actor: 'Maya Planner',
    details,
  };
}

function buildSchedulingAuditEvent(action: string, item: string, details: string): SchedulingAuditEvent {
  return {
    id: `AUD-SCH-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    timestamp: formatAuditTimestamp(),
    action,
    item,
    actor: 'Maya Planner',
    details,
  };
}

function sortScheduleItems(items: SchedulingWorkOrder[]) {
  return [...items].sort((a, b) => {
    const dayCompare = (a.day ?? '9999').localeCompare(b.day ?? '9999');
    if (dayCompare !== 0) {
      return dayCompare;
    }
    const lineCompare = a.line.localeCompare(b.line);
    if (lineCompare !== 0) {
      return lineCompare;
    }
    const machineCompare = a.machine.localeCompare(b.machine);
    if (machineCompare !== 0) {
      return machineCompare;
    }
    return (a.sequenceIndex ?? 999) - (b.sequenceIndex ?? 999);
  });
}

function resequenceSchedule(items: SchedulingWorkOrder[]) {
  const counters = new Map<string, number>();
  return sortScheduleItems(items).map((item) => {
    if (!item.day) {
      return item;
    }
    const key = `${item.day}|${item.line}|${item.machine}`;
    const nextIndex = (counters.get(key) ?? 0) + 1;
    counters.set(key, nextIndex);
    return {...item, sequenceIndex: nextIndex};
  });
}

function getNextDay(dayId: string | null, offset: number) {
  const fallbackIndex = 0;
  const index = dayId ? schedulingDays.findIndex((day) => day.id === dayId) : fallbackIndex;
  const safeIndex = index < 0 ? fallbackIndex : index;
  const next = schedulingDays[Math.max(0, Math.min(schedulingDays.length - 1, safeIndex + offset))];
  return next.id;
}

function isChangeover(previous: SchedulingWorkOrder | undefined, current: SchedulingWorkOrder) {
  if (!previous) {
    return false;
  }
  return previous.family !== current.family || previous.machine !== current.machine;
}

function getLaneItems(items: SchedulingWorkOrder[], dayId: string, line: SchedulingLine, machine: string) {
  return items
    .filter((item) => item.day === dayId && item.line === line.name && item.machine === machine)
    .sort((a, b) => (a.sequenceIndex ?? 999) - (b.sequenceIndex ?? 999));
}

export default function ProductionPlanningScreen() {
  const [activePageId, setActivePageId] = useState<ProductionPlanningPageId>(() => {
    if (typeof window === 'undefined') return 'planning-overview';
    const requestedPage = window.sessionStorage.getItem(productionPlanningInitialPageStorageKey) as ProductionPlanningPageId | null;
    window.sessionStorage.removeItem(productionPlanningInitialPageStorageKey);
    return workflowPages.some((page) => page.id === requestedPage) ? requestedPage : 'planning-overview';
  });
  const [openOrdersAiWorkflow, setOpenOrdersAiWorkflow] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [recommendations, setRecommendations] = useState<PlanningRecommendation[]>(initialPlanningRecommendations);
  const [planningAuditEvents, setPlanningAuditEvents] = useState<PlanningAuditEvent[]>(initialPlanningAuditEvents);
  const [selectedRecommendationId, setSelectedRecommendationId] = useState<string | null>(null);
  const [rejectingRecommendationId, setRejectingRecommendationId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const [lineageInitialVersionId, setLineageInitialVersionId] = useState<string | undefined>(undefined);

  const [approvedSchedule, setApprovedSchedule] = useState<SchedulingWorkOrder[]>(initialApprovedSequence);
  const [aiSchedule, setAiSchedule] = useState<SchedulingWorkOrder[]>(initialAiSequence);
  const [unscheduledBacklog, setUnscheduledBacklog] = useState<SchedulingWorkOrder[]>(initialUnscheduledBacklog);
  const [timelineApprovedWorkOrders, setTimelineApprovedWorkOrders] = useState<TimelineScheduledWorkOrder[]>(initialTimelineApprovedWorkOrders);
  const [timelineAiWorkOrders, setTimelineAiWorkOrders] = useState<TimelineScheduledWorkOrder[]>(initialTimelineAiWorkOrders);
  const [schedulingAuditEvents, setSchedulingAuditEvents] = useState<SchedulingAuditEvent[]>(initialSchedulingAuditEvents);
  const [scheduleViewMode, setScheduleViewMode] = useState<SchedulingViewMode>('timeline');
  const [compareMode, setCompareMode] = useState(false);
  const [validationIssues, setValidationIssues] = useState<SchedulingValidationIssue[]>([]);
  const [manualMoveState, setManualMoveState] = useState<ManualMoveState | null>(null);
  const [manualChangeReasonCode, setManualChangeReasonCode] = useState('');
  const [manualChangeReasonText, setManualChangeReasonText] = useState('');
  const [pendingAiApply, setPendingAiApply] = useState(false);
  const [pendingAiReject, setPendingAiReject] = useState(false);
  const [aiRejectReason, setAiRejectReason] = useState('');
  const [timelineDateRange, setTimelineDateRange] = useState(defaultTimelineDateRange);
  const [timelineFilters, setTimelineFilters] = useState<TimelineFiltersState>(defaultTimelineFilters);
  const [selectedTimelineEventTypes, setSelectedTimelineEventTypes] = useState<SelectedEventTypesState>(defaultSelectedEventTypes);
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineSelection>(null);
  const [expandedLineIds, setExpandedLineIds] = useState<string[]>([]);
  const [showMachineDrilldown, setShowMachineDrilldown] = useState(true);
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
  const [selectedMachineWorkOrderId, setSelectedMachineWorkOrderId] = useState<string | null>(null);
  const aiSimulationProposal = useMemo(() => createAiSequenceSimulationMock(), []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (import.meta.env.PROD) return;

    const {hostname, search} = window.location;
    const isLocalPreview = hostname === '127.0.0.1' || hostname === 'localhost';
    if (!isLocalPreview) return;

    const params = new URLSearchParams(search);
    const previewPage = params.get('codexPlanningPage');
    if (!previewPage) return;

    const targetPage = workflowPages.find((page) => page.id === previewPage)?.id;
    if (!targetPage) return;

    const previewMrpVersion = params.get('codexMrpVersion');
    if (targetPage === 'mrp' && previewMrpVersion) {
      setLineageInitialVersionId(previewMrpVersion);
    }

    setActivePageId(targetPage);
    setOpenOrdersAiWorkflow(false);
    setIsMenuExpanded(false);
  }, []);

  const activePage = workflowPages.find((page) => page.id === activePageId) ?? workflowPages[0];
  const selectedRecommendation = recommendations.find((item) => item.id === selectedRecommendationId) ?? null;
  const rejectingRecommendation = recommendations.find((item) => item.id === rejectingRecommendationId) ?? null;

  const pendingRecommendations = useMemo(() => recommendations.filter((item) => item.status === 'pending'), [recommendations]);
  const recommendationSummary = useMemo(
    () => ({
      accepted: recommendations.filter((item) => item.status === 'accepted').length,
      rejected: recommendations.filter((item) => item.status === 'rejected').length,
      pending: pendingRecommendations.length,
    }),
    [pendingRecommendations.length, recommendations],
  );

  const scheduledApprovedCount = timelineApprovedWorkOrders.length;
  const blockedBacklogCount = timelineApprovedWorkOrders.filter((item) => item.readinessStatus === 'Blocked').length;
  const warningCount = [...timelineApprovedWorkOrders, ...timelineAiWorkOrders].filter((item) => item.readinessStatus === 'Warning').length;
  const aiChangeCount = timelineAiWorkOrders.filter((item) => {
    const match = timelineApprovedWorkOrders.find((approved) => approved.id === item.id);
    return !match || match.plannedStartDateTime !== item.plannedStartDateTime || match.plannedEndDateTime !== item.plannedEndDateTime;
  }).length;
  const timelinePresentation = useMemo(
    () => buildTimelinePresentation(demoTimelineLines, timelineApprovedWorkOrders, lineTimelineEvents, timelineDateRange, timelineFilters, selectedTimelineEventTypes),
    [selectedTimelineEventTypes, timelineApprovedWorkOrders, timelineDateRange, timelineFilters],
  );
  const selectedTimelineDetail = useMemo(
    () => buildSelectedTimelineItem(selectedTimelineItem, [...timelineApprovedWorkOrders, ...timelineAiWorkOrders, ...schedulingMachineWorkOrdersMock], [...lineTimelineEvents, ...schedulingMachineEventsMock], schedulingMachinesMock),
    [selectedTimelineItem, timelineAiWorkOrders, timelineApprovedWorkOrders],
  );
  const handleTimelineSelectionChange = useCallback((value: TimelineSelection) => {
    setSelectedTimelineItem(value);
    if (value?.kind === 'machine') {
      setSelectedMachineId(value.id);
      setSelectedMachineWorkOrderId(null);
      return;
    }
    if (value?.kind === 'workOrder' && schedulingMachineWorkOrdersMock.some((item) => item.id === value.id)) {
      setSelectedMachineId(schedulingMachineWorkOrdersMock.find((item) => item.id === value.id)?.machineId ?? null);
      setSelectedMachineWorkOrderId(value.id);
      return;
    }
    setSelectedMachineId(null);
    setSelectedMachineWorkOrderId(null);
  }, []);

  const setActiveWorkflowPage = useCallback((pageId: ProductionPlanningPageId) => {
    setOpenOrdersAiWorkflow(false);
    setLineageInitialVersionId(undefined);
    setActivePageId(pageId);
    setIsMenuExpanded(false);
  }, []);

  const menuGroups = useMemo<PlanningMenuGroup[]>(() => [
    {
      id: 'forecasting',
      label: 'Forecasting',
      items: [
        {
          label: 'Demand Forecast',
          description: 'Review rolling demand and monthly commitment assumptions.',
          pageId: 'twelve-month-plan',
        },
        {
          label: 'Capacity Planning',
          description: 'Balance line and labor capacity before release decisions.',
          pageId: 'capacity-planning',
        },
      ],
    },
    {
      id: 'production-planning',
      label: 'Production Planning',
      items: [
        {
          label: 'MPS',
          description: 'Stabilize the monthly plan inside the frozen horizon.',
          pageId: 'monthly-mps',
        },
        {
          label: 'MRP',
          description: 'Review material requirements planning versions and baselines.',
          pageId: 'mrp',
        },
      ],
    },
    {
      id: 'order-management',
      label: 'Order Management',
      items: [
        {
          label: 'Schedule & Order Planning',
          description: 'Manage schedule versions and plan, sequence, and monitor production orders.',
          pageId: 'schedule-versions',
        },
        {
          label: 'Orders Management',
          description: 'Track released and planned orders by due date and status.',
          pageId: 'work-orders',
        },
      ],
    },
    {
      id: 'quick-actions',
      label: 'Quick Actions',
      items: [
        {
          label: 'Command Center',
          description: 'Return to the AI-guided planning overview and command center.',
          pageId: 'planning-overview',
        },
        {
          label: 'Production Lineage',
          description: 'Trace demand-to-batch lineage across all planning versions and chains.',
          pageId: 'planning-lineage',
        },
      ],
    },
  ], []);

  const activeMenuGroupId = useMemo<PlanningMenuGroupId | null>(() => {
    for (const group of menuGroups) {
      if (group.items.some((item) => item.pageId === activePageId)) {
        return group.id;
      }
    }
    return null;
  }, [activePageId, menuGroups]);

  const navigateToWorkflow = useCallback((pageId: ProductionPlanningPageId, sourceTitle: string) => {
    setOpenOrdersAiWorkflow(false);
    setActivePageId(pageId);
    if (pageId === 'planning-overview') {
      setPlanningAuditEvents((current) => [
        buildPlanningAuditEvent('Workflow page opened', sourceTitle, `Planner navigated to ${pageId} from Planning Overview.`),
        ...current,
      ]);
      return;
    }
    setSchedulingAuditEvents((current) => [
      buildSchedulingAuditEvent('Workflow page opened', sourceTitle, `Planner navigated to ${pageId} from Scheduling Workspace.`),
      ...current,
    ]);
  }, []);

  function handleLineageNavigate(pageId: string, versionId: string) {
    setLineageInitialVersionId(versionId);
    setActivePageId(pageId as ProductionPlanningPageId);
  }

  const updateRecommendationStatus = (
    recommendationId: string,
    status: PlanningRecommendation['status'],
    details: string,
    rejectionReasonValue?: string,
  ) => {
    const target = recommendations.find((item) => item.id === recommendationId);
    if (!target) {
      return;
    }

    setRecommendations((current) =>
      current.map((item) =>
        item.id === recommendationId
          ? {
              ...item,
              status,
              rejectionReason: status === 'rejected' ? rejectionReasonValue : undefined,
            }
          : item,
      ),
    );

    setPlanningAuditEvents((current) => [
      buildPlanningAuditEvent(
        status === 'accepted' ? 'AI recommendation accepted' : 'AI recommendation rejected',
        target.title,
        details,
      ),
      ...current,
    ]);
  };

  const handleAcceptRecommendation = (recommendationId: string) => {
    updateRecommendationStatus(recommendationId, 'accepted', 'Planner accepted the AI-generated recommendation locally.');
    if (selectedRecommendationId === recommendationId) {
      setSelectedRecommendationId(null);
    }
  };

  const handleOpenRejectDialog = (recommendationId: string) => {
    setRejectingRecommendationId(recommendationId);
    setRejectionReason('');
  };

  const handleConfirmReject = () => {
    if (!rejectingRecommendation || !rejectionReason.trim()) {
      return;
    }
    updateRecommendationStatus(
      rejectingRecommendation.id,
      'rejected',
      `Planner rejected the AI-generated recommendation locally. Reason: ${rejectionReason.trim()}`,
      rejectionReason.trim(),
    );
    if (selectedRecommendationId === rejectingRecommendation.id) {
      setSelectedRecommendationId(null);
    }
    setRejectingRecommendationId(null);
    setRejectionReason('');
  };

  const generateAiSequenceSimulation = () => {
    const simulation = createAiSequenceSimulationMock();
    setAiSchedule(createAiSimulationSchedulingWorkOrders(simulation));
    setTimelineAiWorkOrders(createAiSimulationTimelineWorkOrders(simulation));
    setCompareMode(true);
    setSchedulingAuditEvents((current) => [
      buildSchedulingAuditEvent('AI simulation generated', 'Scheduling Workspace', 'Local AI-generated short-term sequence simulation refreshed.'),
      ...current,
    ]);
  };

  const validateScheduleLocally = () => {
    const issues: SchedulingValidationIssue[] = [];
    const blockedScheduled = approvedSchedule.filter((item) => item.readiness === 'Blocked');
    if (blockedScheduled.length > 0) {
      issues.push({
        id: 'blocked-scheduled',
        severity: 'Error',
        message: `${blockedScheduled.length} blocked WO(s) are scheduled, which is not allowed.`,
      });
    }

    const warningScheduled = approvedSchedule.filter((item) => item.readiness === 'Warning');
    if (warningScheduled.length > 0) {
      issues.push({
        id: 'warning-visible',
        severity: 'Warning',
        message: `${warningScheduled.length} warning WO(s) remain in the approved sequence and need planner review.`,
      });
    }

    const readyBacklog = unscheduledBacklog.filter((item) => item.readiness === 'Ready');
    if (readyBacklog.length > 0) {
      issues.push({
        id: 'ready-backlog',
        severity: 'Info',
        message: `${readyBacklog.length} ready backlog WO(s) could be scheduled if capacity is released.`,
      });
    }

    if (issues.length === 0) {
      issues.push({
        id: 'schedule-valid',
        severity: 'Info',
        message: 'Local validation found no blocked WOs in the approved schedule.',
      });
    }

    setValidationIssues(issues);
    setSchedulingAuditEvents((current) => [
      buildSchedulingAuditEvent('Schedule validated', 'Approved sequence', `Local validation executed with ${issues.length} result(s).`),
      ...current,
    ]);
  };

  const handleApplyAiSequence = useCallback(() => {
    setApprovedSchedule(resequenceSchedule(aiSchedule.map((item) => ({...item, source: 'approved'}))));
    setTimelineApprovedWorkOrders(timelineAiWorkOrders.map((item) => ({...item})));
    const proposedIds = new Set(aiSchedule.map((item) => item.id));
    setUnscheduledBacklog((current) =>
      current.filter((item) => !proposedIds.has(item.id)).concat(
        approvedSchedule
          .filter((item) => !proposedIds.has(item.id))
          .map((item) => ({...item, day: null, sequenceIndex: null, source: 'backlog' as const})),
      ),
    );
    setPendingAiApply(false);
    setCompareMode(false);
    setSchedulingAuditEvents((current) => [
      buildSchedulingAuditEvent('AI sequence applied', 'Approved sequence', 'Planner confirmed and applied the AI-generated sequence locally.'),
      ...current,
    ]);
  }, [aiSchedule, timelineAiWorkOrders, approvedSchedule]);

  const handleRejectAiSequence = useCallback(() => {
    if (!aiRejectReason.trim()) {
      return;
    }
    setPendingAiReject(false);
    setAiRejectReason('');
    setCompareMode(false);
    setSchedulingAuditEvents((current) => [
      buildSchedulingAuditEvent('AI sequence rejected', 'AI proposed sequence', `Planner rejected the AI-generated sequence locally. Reason: ${aiRejectReason.trim()}`),
      ...current,
    ]);
  }, [aiRejectReason]);

  const executeManualMove = () => {
    if (!manualMoveState || !manualChangeReasonCode) {
      return;
    }

    const reasonLabel = schedulingReasonCodes.find((item) => item.code === manualChangeReasonCode)?.label ?? manualChangeReasonCode;
    const details = `${reasonLabel}${manualChangeReasonText.trim() ? ` - ${manualChangeReasonText.trim()}` : ''}`;

    if (manualMoveState.source === 'approved') {
      const target = approvedSchedule.find((item) => item.id === manualMoveState.workOrderId);
      if (!target) {
        return;
      }

      const updated = approvedSchedule.map((item) => {
        if (item.id !== manualMoveState.workOrderId) {
          return item;
        }
        if (manualMoveState.action === 'delay') {
          return {...item, day: getNextDay(item.day, 1)};
        }
        return {...item, day: getNextDay(item.day, -1)};
      });
      setApprovedSchedule(resequenceSchedule(updated));
      setSchedulingAuditEvents((current) => [
        buildSchedulingAuditEvent('Manual schedule move', target.id, `Planner moved WO in approved schedule. Reason: ${details}`),
        ...current,
      ]);
    }

    if (manualMoveState.source === 'backlog') {
      const target = unscheduledBacklog.find((item) => item.id === manualMoveState.workOrderId);
      if (!target || target.readiness === 'Blocked') {
        return;
      }
      setUnscheduledBacklog((current) => current.filter((item) => item.id !== manualMoveState.workOrderId));
      setApprovedSchedule((current) =>
        resequenceSchedule(
          current.concat({
            ...target,
            source: 'approved',
            status: target.status === 'Warning' ? 'Warning' : 'Scheduled',
            day: schedulingDays[0].id,
            sequenceIndex: 1,
          }),
        ),
      );
      setSchedulingAuditEvents((current) => [
        buildSchedulingAuditEvent('Manual schedule add', target.id, `Planner scheduled backlog WO locally. Reason: ${details}`),
        ...current,
      ]);
    }

    setManualMoveState(null);
    setManualChangeReasonCode('');
    setManualChangeReasonText('');
  };

  const renderPlanningOverview = () => (
    <PlanningOverviewV2
      recommendations={recommendations}
      onAccept={handleAcceptRecommendation}
      onRejectOpen={handleOpenRejectDialog}
      onNavigate={navigateToWorkflow}
      recommendationSummary={recommendationSummary}
    />
  );

  const renderPlanningOverviewLegacy = () => (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2, bgcolor: logbookOverviewStyles.pageBackground}}>
      <Paper
        elevation={0}
        sx={{
          ...logbookOverviewCardSx,
          p: {xs: 2, md: 2.4},
          overflow: 'hidden',
          background: `linear-gradient(180deg, ${logbookOverviewStyles.surface} 0%, ${logbookOverviewStyles.surfaceMuted} 100%)`,
        }}
      >
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 1.45fr) minmax(320px, 0.6fr)'}, gap: 2}}>
          <Box>
            <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
              <Chip icon={<AutoAwesomeIcon sx={{fontSize: 16}} />} label={planningOverviewBriefing.label} sx={{...logbookOverviewChipSx, color: logbookOverviewStyles.primary, borderColor: logbookOverviewStyles.borderSoft, fontWeight: 900}} />
            </Stack>
            <Typography sx={{fontSize: {xs: 26, md: 30}, fontWeight: 900, color: logbookOverviewStyles.title, mt: 1.4, letterSpacing: '-0.03em'}}>{planningOverviewBriefing.title}</Typography>
            <Typography sx={{fontSize: 14, color: logbookOverviewStyles.body, mt: 1, lineHeight: 1.7, maxWidth: 860}}>{planningOverviewBriefing.summary}</Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))'}, gap: 1.2, mt: 1.9}}>
              {planningOverviewBriefing.bullets.map((item, index) => (
                <Paper
                  key={item}
                  elevation={0}
                  sx={{
                    ...logbookOverviewCardSx,
                    p: 1.45,
                    borderRadius: 2.7,
                  }}
                >
                  <Box sx={{display: 'flex', gap: 1.1, alignItems: 'flex-start'}}>
                    <Box sx={{width: 34, height: 34, borderRadius: 2.2, bgcolor: logbookOverviewStyles.primarySoft, color: logbookOverviewStyles.primaryStrong, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                      {index === 0 ? <CalendarMonthIcon sx={{fontSize: 18}} /> : index === 1 ? <AutoGraphIcon sx={{fontSize: 18}} /> : <GppMaybeIcon sx={{fontSize: 18}} />}
                    </Box>
                    <Typography sx={{fontSize: 12.8, color: logbookOverviewStyles.body, lineHeight: 1.55, fontWeight: 700}}>{item}</Typography>
                  </Box>
                </Paper>
              ))}
            </Box>
          </Box>
          <Paper
            elevation={0}
            sx={{
              ...logbookOverviewCardSx,
              p: 2,
            }}
          >
            <Box sx={{display: 'flex', gap: 1.1, alignItems: 'center'}}>
              <Box sx={{width: 34, height: 34, borderRadius: 2.2, bgcolor: logbookOverviewStyles.primarySoft, color: logbookOverviewStyles.primaryStrong, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <AssignmentTurnedInIcon sx={{fontSize: 18}} />
              </Box>
              <Typography sx={{fontSize: 12, color: logbookOverviewStyles.title, fontWeight: 900}}>Decision Queue</Typography>
            </Box>
            <Box sx={{display: 'flex', alignItems: 'baseline', gap: 1.2, mt: 1.7}}>
              <Typography sx={{fontSize: 40, lineHeight: 1, fontWeight: 900, color: logbookOverviewStyles.title}}>{recommendationSummary.pending}</Typography>
              <Typography sx={{fontSize: 13.5, color: logbookOverviewStyles.body, maxWidth: 180}}>recommendations pending planner approval</Typography>
            </Box>
            <Divider sx={{my: 1.8, borderColor: logbookOverviewStyles.borderSoft}} />
            <Stack spacing={1}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}><Typography sx={{fontSize: 13, color: logbookOverviewStyles.body}}>Accepted locally</Typography><Typography sx={{fontSize: 13, fontWeight: 900, color: logbookOverviewStyles.title}}>{recommendationSummary.accepted}</Typography></Box>
              <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}><Typography sx={{fontSize: 13, color: logbookOverviewStyles.body}}>Rejected locally</Typography><Typography sx={{fontSize: 13, fontWeight: 900, color: logbookOverviewStyles.title}}>{recommendationSummary.rejected}</Typography></Box>
              <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}><Typography sx={{fontSize: 13, color: logbookOverviewStyles.body}}>Average AI confidence</Typography><Typography sx={{fontSize: 13, fontWeight: 900, color: logbookOverviewStyles.primaryStrong}}>91%</Typography></Box>
            </Stack>
            <Button
              variant="text"
              endIcon={<OpenInNewIcon />}
              onClick={() => setSelectedRecommendationId(pendingRecommendations[0]?.id ?? null)}
              sx={{mt: 1.8, px: 0, textTransform: 'none', fontWeight: 900, color: logbookOverviewStyles.primary, justifyContent: 'flex-start'}}
            >
              View decision queue
            </Button>
          </Paper>
        </Box>
      </Paper>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))'}, gap: 1.4}}>
        {planningOverviewKpis.map((kpi, index) => {
          const tone = kpiTone[kpi.tone];
          const icon =
            index === 0 ? <CheckCircleOutlineIcon sx={{fontSize: 22}} />
              : index === 1 ? <GppMaybeIcon sx={{fontSize: 22}} />
                : index === 2 ? <RocketLaunchIcon sx={{fontSize: 22}} />
                  : index === 3 ? <FactoryIcon sx={{fontSize: 22}} />
                    : index === 4 ? <AutoAwesomeIcon sx={{fontSize: 22}} />
                      : index === 5 ? <TimelineIcon sx={{fontSize: 22}} />
                        : index === 6 ? <ScienceIcon sx={{fontSize: 22}} />
                          : <TrackChangesIcon sx={{fontSize: 22}} />;
          return (
            <Paper
              key={kpi.label}
              elevation={0}
              sx={{
                ...logbookOverviewCardSx,
                p: 1.7,
                display: 'flex',
                gap: 1.25,
                alignItems: 'flex-start',
              }}
            >
              <Box sx={{width: 42, height: 42, borderRadius: 2.4, bgcolor: tone.bg, color: tone.accent, border: `1px solid color-mix(in srgb, ${tone.accent} 13%, transparent)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
                {icon}
              </Box>
              <Box sx={{minWidth: 0}}>
                <Typography sx={{fontSize: 12, color: logbookOverviewStyles.label, fontWeight: 800}}>{kpi.label}</Typography>
                <Typography sx={{fontSize: 26, lineHeight: 1, fontWeight: 900, color: logbookOverviewStyles.title, mt: 0.9}}>{kpi.value}</Typography>
                <Typography sx={{fontSize: 12.5, color: tone.text, fontWeight: 700, mt: 0.8, lineHeight: 1.45}}>{kpi.helper}</Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>

      <Paper elevation={0} sx={{...logbookOverviewCardSx, p: 2.2, background: `linear-gradient(180deg, ${logbookOverviewStyles.surface} 0%, ${logbookOverviewStyles.surfaceMuted} 100%)`}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap'}}>
          <Box>
            <Typography sx={{fontSize: 28, color: logbookOverviewStyles.title, fontWeight: 900, letterSpacing: '-0.03em'}}>Planning Status and Risks</Typography>
            <Typography sx={{fontSize: 14, color: logbookOverviewStyles.body, mt: 0.7}}>Current planning signals across the workflow</Typography>
          </Box>
          <Chip icon={<AutoAwesomeIcon sx={{fontSize: 16}} />} label="AI-generated status interpretation" sx={{...logbookOverviewChipSx, color: logbookOverviewStyles.primaryStrong, borderColor: logbookOverviewStyles.borderSoft, height: 36}} />
        </Box>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))'}, gap: 1.4, mt: 1.8}}>
          {planningOverviewStatusCards.map((card) => {
            const tone = severityTone[card.severity];
            return (
              <Paper key={card.id} elevation={0} sx={{...logbookOverviewCardSx, p: 1.6}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5}}>
                  <Box>
                    <Stack direction="row" spacing={1} sx={{alignItems: 'center', flexWrap: 'wrap'}}>
                      <Chip size="small" label={card.category} sx={{...logbookOverviewChipSx}} />
                      <Chip size="small" label={card.severity} sx={{bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontWeight: 900}} />
                    </Stack>
                    <Typography sx={{fontSize: 17, color: logbookOverviewStyles.title, fontWeight: 900, mt: 1.2}}>{card.title}</Typography>
                    <Typography sx={{fontSize: 13.5, color: logbookOverviewStyles.body, mt: 0.7, lineHeight: 1.55}}>{card.summary}</Typography>
                  </Box>
                  <Paper elevation={0} sx={{px: 1.2, py: 1, borderRadius: 2.4, bgcolor: logbookOverviewStyles.surfaceMuted, border: `1px solid ${logbookOverviewStyles.borderSoft}`, minWidth: 110}}>
                    <Typography sx={{fontSize: 11, color: logbookOverviewStyles.label, fontWeight: 800}}>{card.metricLabel}</Typography>
                    <Typography sx={{fontSize: 22, color: logbookOverviewStyles.title, fontWeight: 900, mt: 0.6}}>{card.metricValue}</Typography>
                  </Paper>
                </Box>
                <Divider sx={{my: 1.5, borderColor: logbookOverviewStyles.borderSoft}} />
                <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', flexWrap: 'wrap'}}>
                  <Box>
                    <Typography sx={{fontSize: 12, color: logbookOverviewStyles.label, fontWeight: 700}}>Current status</Typography>
                    <Typography sx={{fontSize: 13, color: logbookOverviewStyles.title, fontWeight: 800, mt: 0.4}}>{card.status}</Typography>
                  </Box>
                  <Button variant="outlined" endIcon={<OpenInNewIcon />} onClick={() => navigateToWorkflow(card.relatedPageId, card.title)} sx={{borderRadius: 2.5, textTransform: 'none', fontWeight: 800, borderColor: logbookOverviewStyles.border, color: logbookOverviewStyles.body, '&:hover': {borderColor: logbookOverviewStyles.borderHover, bgcolor: logbookOverviewStyles.surfaceSubtle}}}>
                    Open workflow
                  </Button>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{...logbookOverviewCardSx, p: 2.2}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap'}}>
          <Box>
            <Typography sx={{fontSize: 13, color: logbookOverviewStyles.primary, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>AI Recommendations Pending Approval</Typography>
            <Typography sx={{fontSize: 20, color: logbookOverviewStyles.title, fontWeight: 900, mt: 0.8}}>Planner decisions required before the next release cycle</Typography>
          </Box>
          <Chip icon={<AutoAwesomeIcon sx={{fontSize: 16}} />} label={`${pendingRecommendations.length} pending`} sx={{...logbookOverviewChipSx, color: logbookOverviewStyles.primaryStrong, borderColor: logbookOverviewStyles.borderSoft, fontWeight: 900}} />
        </Box>
        <Box sx={{display: 'grid', gap: 1.3, mt: 1.7}}>
          {recommendations.map((recommendation) => {
            const statusTone =
              recommendation.status === 'accepted'
                ? {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'}
                : recommendation.status === 'rejected'
                  ? {bg: '#FEF3F2', color: '#B42318', border: '#FECDCA'}
                  : {bg: '#F5F3FF', color: '#6D28D9', border: '#D8B4FE'};
            return (
              <Paper key={recommendation.id} elevation={0} sx={{...logbookOverviewCardSx, p: 1.6}}>
                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'minmax(0, 1fr) auto'}, gap: 1.6}}>
                  <Box>
                    <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
                      <Chip size="small" icon={<AutoAwesomeIcon sx={{fontSize: 15}} />} label="AI-generated" sx={{...logbookOverviewChipSx, color: logbookOverviewStyles.primaryStrong, borderColor: logbookOverviewStyles.borderSoft}} />
                      <Chip size="small" label={recommendation.recommendationType} sx={{...logbookOverviewChipSx, bgcolor: logbookOverviewStyles.surfaceMuted, color: logbookOverviewStyles.body, borderColor: logbookOverviewStyles.borderSoft}} />
                      <Chip size="small" label={recommendation.status} sx={{bgcolor: statusTone.bg, color: statusTone.color, border: `1px solid ${statusTone.border}`, fontWeight: 900, textTransform: 'capitalize'}} />
                    </Stack>
                    <Typography sx={{fontSize: 18, color: logbookOverviewStyles.title, fontWeight: 900, mt: 1.1}}>{recommendation.title}</Typography>
                    <Typography sx={{fontSize: 13.5, color: logbookOverviewStyles.body, mt: 0.7, lineHeight: 1.55}}>{recommendation.summary}</Typography>
                    <Box sx={{display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1.3}}>
                      <Typography sx={{fontSize: 12.5, color: logbookOverviewStyles.label}}>Confidence <Box component="span" sx={{fontWeight: 900, color: logbookOverviewStyles.primaryStrong}}>{recommendation.confidence}%</Box></Typography>
                      <Typography sx={{fontSize: 12.5, color: logbookOverviewStyles.label}}>Generated <Box component="span" sx={{fontWeight: 800, color: logbookOverviewStyles.body}}>{recommendation.generatedAt}</Box></Typography>
                    </Box>
                    {recommendation.rejectionReason ? (
                      <Paper elevation={0} sx={{mt: 1.3, p: 1.1, borderRadius: 2, border: '1px solid #FECDCA', bgcolor: '#FEF3F2'}}>
                        <Typography sx={{fontSize: 12.5, color: '#B42318', fontWeight: 800}}>Rejection reason: {recommendation.rejectionReason}</Typography>
                      </Paper>
                    ) : null}
                  </Box>
                  <Stack direction={{xs: 'column', sm: 'row', lg: 'column'}} spacing={1} sx={{minWidth: {lg: 188}}}>
                    <Button variant="outlined" onClick={() => setSelectedRecommendationId(recommendation.id)} sx={{borderRadius: 2.5, textTransform: 'none', fontWeight: 800, borderColor: logbookOverviewStyles.border, color: logbookOverviewStyles.body, '&:hover': {borderColor: logbookOverviewStyles.borderHover, bgcolor: logbookOverviewStyles.surfaceSubtle}}}>Open detail</Button>
                    <Button variant="contained" startIcon={<ThumbUpAltOutlinedIcon />} disabled={recommendation.status !== 'pending'} onClick={() => handleAcceptRecommendation(recommendation.id)} sx={{borderRadius: 2.5, textTransform: 'none', fontWeight: 800, bgcolor: logbookOverviewStyles.primaryStrong, '&:hover': {bgcolor: '#1E55D6'}}}>Accept</Button>
                    <Button variant="outlined" color="error" startIcon={<ThumbDownAltOutlinedIcon />} disabled={recommendation.status !== 'pending'} onClick={() => handleOpenRejectDialog(recommendation.id)} sx={{borderRadius: 2.5, textTransform: 'none', fontWeight: 800}}>Reject</Button>
                    <Button variant="text" endIcon={<OpenInNewIcon />} onClick={() => navigateToWorkflow(recommendation.relatedPageId, recommendation.title)} sx={{borderRadius: 2.5, textTransform: 'none', fontWeight: 800, color: logbookOverviewStyles.primary}}>Related workflow</Button>
                  </Stack>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{...logbookOverviewCardSx, p: 2.2}}>
        <Typography sx={{fontSize: 13, color: logbookOverviewStyles.label, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Local Audit Events</Typography>
        <Typography sx={{fontSize: 20, color: logbookOverviewStyles.title, fontWeight: 900, mt: 0.8}}>Planner actions captured in local state</Typography>
        <Box sx={{display: 'grid', gap: 1.1, mt: 1.6}}>
          {planningAuditEvents.slice(0, 6).map((event) => (
            <Paper key={event.id} elevation={0} sx={{p: 1.3, borderRadius: 2.5, border: `1px solid ${logbookOverviewStyles.borderSoft}`, bgcolor: logbookOverviewStyles.surfaceMuted}}>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '180px minmax(0, 1fr) 140px'}, gap: 1.2}}>
                <Typography sx={{fontSize: 12.5, color: logbookOverviewStyles.label, fontWeight: 700}}>{event.timestamp}</Typography>
                <Box>
                  <Typography sx={{fontSize: 13.5, color: logbookOverviewStyles.title, fontWeight: 900}}>{event.action}</Typography>
                  <Typography sx={{fontSize: 12.8, color: 'var(--planning-text-secondary)', mt: 0.35, lineHeight: 1.45}}>{event.item} · {event.details}</Typography>
                </Box>
                <Typography sx={{fontSize: 12.5, color: logbookOverviewStyles.label, fontWeight: 800}}>{event.actor}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );

  const renderWoCard = (
    item: SchedulingWorkOrder,
    scope: 'approved' | 'ai' | 'backlog',
    previous?: SchedulingWorkOrder,
  ) => {
    const readiness = readinessTone[item.readiness];
    const risk = riskTone[item.risk];
    const canMoveManually = scope === 'approved';
    const canScheduleFromBacklog = scope === 'backlog' && item.readiness !== 'Blocked';

    return (
      <Paper
        key={`${scope}-${item.id}-${item.day ?? 'backlog'}`}
        elevation={0}
        sx={{
          p: 1.2,
          borderRadius: 2.4,
          border: '1px solid',
          borderColor: scope === 'ai' ? '#D8B4FE' : '#E2E8F0',
          bgcolor: scope === 'ai' ? '#FCFAFF' : '#FFFFFF',
          boxShadow: scope === 'ai' ? '0 8px 20px rgba(124,58,237,0.08)' : 'none',
        }}
      >
        {isChangeover(previous, item) ? (
          <Chip size="small" label="Changeover" sx={{mb: 1, bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74', fontWeight: 800}} />
        ) : null}
        <Stack direction="row" spacing={0.8} sx={{flexWrap: 'wrap', rowGap: 0.8}}>
          <Chip size="small" label={item.id} sx={{bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', fontWeight: 900}} />
          {scope === 'ai' ? <Chip size="small" icon={<AutoAwesomeIcon sx={{fontSize: 15}} />} label="AI proposed" sx={{bgcolor: '#F4ECFF', color: '#6D28D9', border: '1px solid #D8B4FE', fontWeight: 800}} /> : null}
          <Chip size="small" label={item.status} sx={{bgcolor: readiness.bg, color: readiness.color, border: `1px solid ${readiness.border}`, fontWeight: 800}} />
        </Stack>
        <Typography sx={{fontSize: 15, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 1}}>{item.product}</Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.8, mt: 1}}>
          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>Quantity <Box component="span" sx={{fontWeight: 800}}>{item.quantity.toLocaleString()}</Box></Typography>
          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>Line <Box component="span" sx={{fontWeight: 800}}>{item.line}</Box></Typography>
          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>Machine <Box component="span" sx={{fontWeight: 800}}>{item.machine}</Box></Typography>
          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>AI confidence <Box component="span" sx={{fontWeight: 800}}>{item.aiConfidence}%</Box></Typography>
        </Box>
        <Stack direction="row" spacing={0.8} sx={{mt: 1.1, flexWrap: 'wrap', rowGap: 0.8}}>
          <Chip size="small" label={`Readiness: ${item.readiness}`} sx={{bgcolor: readiness.bg, color: readiness.color, border: `1px solid ${readiness.border}`}} />
          <Chip size="small" label={`Risk: ${item.risk}`} sx={{bgcolor: risk.bg, color: risk.color}} />
        </Stack>
        {canMoveManually ? (
          <Stack direction="row" spacing={1} sx={{mt: 1.2}}>
            <Button size="small" variant="outlined" startIcon={<KeyboardArrowLeftIcon />} onClick={() => setManualMoveState({workOrderId: item.id, source: 'approved', action: 'advance'})} sx={{textTransform: 'none', fontWeight: 800}}>
              Move earlier
            </Button>
            <Button size="small" variant="outlined" endIcon={<KeyboardArrowRightIcon />} onClick={() => setManualMoveState({workOrderId: item.id, source: 'approved', action: 'delay'})} sx={{textTransform: 'none', fontWeight: 800}}>
              Move later
            </Button>
          </Stack>
        ) : null}
        {canScheduleFromBacklog ? (
          <Button size="small" variant="outlined" sx={{mt: 1.2, textTransform: 'none', fontWeight: 800}} onClick={() => setManualMoveState({workOrderId: item.id, source: 'backlog', action: 'schedule'})}>
            Schedule locally
          </Button>
        ) : null}
        {scope === 'backlog' && item.readiness === 'Blocked' ? (
          <Typography sx={{fontSize: 12, color: '#B42318', fontWeight: 800, mt: 1.2}}>Blocked WOs cannot be scheduled.</Typography>
        ) : null}
      </Paper>
    );
  };

  const renderKanbanLikeGrid = (items: SchedulingWorkOrder[], scope: 'approved' | 'ai') => (
    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(4, minmax(0, 1fr))'}, gap: 1.2}}>
      {schedulingDays.map((day) => (
        <Paper key={`${scope}-${day.id}`} elevation={0} sx={{p: 1.2, borderRadius: 2.8, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-primary)', fontWeight: 900}}>{day.shortLabel}</Typography>
          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 0.2}}>{day.label}</Typography>
          <Box sx={{display: 'grid', gap: 1, mt: 1.1}}>
            {schedulingLines.map((line) => (
              <Paper key={`${scope}-${day.id}-${line.id}`} elevation={0} sx={{p: 1, borderRadius: 2.2, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
                <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{line.name}</Typography>
                {line.machines.map((machine) => {
                  const laneItems = getLaneItems(items, day.id, line, machine);
                  return (
                    <Box key={`${scope}-${day.id}-${line.id}-${machine}`} sx={{mt: 0.9}}>
                      <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', fontWeight: 800, mb: 0.7}}>{machine}</Typography>
                      <Stack spacing={0.9}>
                        {laneItems.length > 0 ? laneItems.map((item, index) => renderWoCard(item, scope, laneItems[index - 1])) : <Typography sx={{fontSize: 12, color: '#98A2B3'}}>No WO scheduled</Typography>}
                      </Stack>
                    </Box>
                  );
                })}
              </Paper>
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );

  const renderCalendarView = (items: SchedulingWorkOrder[], scope: 'approved' | 'ai') => (
    <Box sx={{display: 'grid', gap: 1.2}}>
      {schedulingDays.map((day) => (
        <Paper key={`${scope}-calendar-${day.id}`} elevation={0} sx={{p: 1.4, borderRadius: 2.8, border: '1px solid var(--planning-border)', bgcolor: scope === 'ai' ? '#FCFAFF' : '#FFFFFF'}}>
          <Typography sx={{fontSize: 15, color: 'var(--planning-text-primary)', fontWeight: 900}}>{day.label}</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))'}, gap: 1, mt: 1.1}}>
            {schedulingLines.map((line) => (
              <Paper key={`${scope}-calendar-${day.id}-${line.id}`} elevation={0} sx={{p: 1.1, borderRadius: 2.2, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
                <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 900}}>{line.name}</Typography>
                <Stack spacing={0.8} sx={{mt: 0.8}}>
                  {line.machines.map((machine) => {
                    const laneItems = getLaneItems(items, day.id, line, machine);
                    return (
                      <Box key={`${scope}-calendar-${day.id}-${line.id}-${machine}`}>
                        <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', fontWeight: 800, mb: 0.5}}>{machine}</Typography>
                        {laneItems.length > 0 ? laneItems.map((item, index) => renderWoCard(item, scope, laneItems[index - 1])) : <Typography sx={{fontSize: 12, color: '#98A2B3'}}>No WO scheduled</Typography>}
                      </Box>
                    );
                  })}
                </Stack>
              </Paper>
            ))}
          </Box>
        </Paper>
      ))}
    </Box>
  );

  const renderGanttView = (items: SchedulingWorkOrder[], scope: 'approved' | 'ai') => (
    <Paper elevation={0} sx={{p: 1.4, borderRadius: 2.8, border: '1px solid var(--planning-border)', bgcolor: scope === 'ai' ? '#FCFAFF' : '#FFFFFF'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: '210px repeat(4, minmax(0, 1fr))', gap: 0.8}}>
        <Paper elevation={0} sx={{p: 1, borderRadius: 2, bgcolor: 'var(--planning-surface-muted)', border: '1px solid var(--planning-border)'}}>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 800}}>Line / Machine</Typography>
        </Paper>
        {schedulingDays.map((day) => (
          <Paper key={`${scope}-gantt-head-${day.id}`} elevation={0} sx={{p: 1, borderRadius: 2, bgcolor: 'var(--planning-surface-muted)', border: '1px solid var(--planning-border)'}}>
            <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{day.shortLabel}</Typography>
          </Paper>
        ))}
        {schedulingLines.flatMap((line) =>
          line.machines.map((machine) => (
            <Box key={`${scope}-gantt-${line.id}-${machine}`} sx={{display: 'contents'}}>
              <Paper elevation={0} sx={{p: 1, borderRadius: 2, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
                <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-primary)', fontWeight: 900}}>{line.name}</Typography>
                <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 0.3}}>{machine}</Typography>
              </Paper>
              {schedulingDays.map((day) => {
                const laneItems = getLaneItems(items, day.id, line, machine);
                return (
                  <Paper key={`${scope}-gantt-cell-${line.id}-${machine}-${day.id}`} elevation={0} sx={{p: 0.8, minHeight: 114, borderRadius: 2, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
                    <Stack spacing={0.7}>
                      {laneItems.length > 0 ? laneItems.map((item, index) => renderWoCard(item, scope, laneItems[index - 1])) : <Typography sx={{fontSize: 12, color: '#98A2B3'}}>Open capacity</Typography>}
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          )),
        )}
      </Box>
    </Paper>
  );

  const renderTableView = (items: SchedulingWorkOrder[], scope: 'approved' | 'ai') => (
    <Paper elevation={0} sx={{borderRadius: 2.8, border: '1px solid var(--planning-border)', overflow: 'hidden'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 0.8fr 0.8fr 1fr 0.8fr 0.8fr 0.7fr 0.7fr', bgcolor: 'var(--planning-surface-muted)', px: 1.2, py: 1}}>
        {['WO ID', 'Product', 'Day', 'Line', 'Machine', 'Status', 'Readiness', 'Risk', 'AI'].map((label) => (
          <Typography key={`${scope}-${label}`} sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', fontWeight: 900}}>{label}</Typography>
        ))}
      </Box>
      <Stack divider={<Divider flexItem />}>
        {sortScheduleItems(items).map((item) => (
          <Box key={`${scope}-table-${item.id}-${item.day}`} sx={{display: 'grid', gridTemplateColumns: '1.1fr 1.4fr 0.8fr 0.8fr 1fr 0.8fr 0.8fr 0.7fr 0.7fr', px: 1.2, py: 1.1, bgcolor: scope === 'ai' ? '#FCFAFF' : '#FFFFFF'}}>
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-primary)', fontWeight: 800}}>{item.id}</Typography>
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>{item.product}</Typography>
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>{item.day ? schedulingDays.find((day) => day.id === item.day)?.shortLabel : '-'}</Typography>
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>{item.line}</Typography>
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>{item.machine}</Typography>
            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>{item.status}</Typography>
            <Typography sx={{fontSize: 12.5, color: readinessTone[item.readiness].color, fontWeight: 800}}>{item.readiness}</Typography>
            <Typography sx={{fontSize: 12.5, color: riskTone[item.risk].color, fontWeight: 800}}>{item.risk}</Typography>
            <Typography sx={{fontSize: 12.5, color: '#6D28D9', fontWeight: 800}}>{item.aiConfidence}%</Typography>
          </Box>
        ))}
      </Stack>
    </Paper>
  );

  const renderSequenceByView = (items: SchedulingWorkOrder[], scope: 'approved' | 'ai') => {
    if (scheduleViewMode === 'timeline') {
      return (
        <TimelinePlanningView
          lines={demoTimelineLines}
          workOrders={scope === 'ai' ? timelineAiWorkOrders : timelineApprovedWorkOrders}
          events={lineTimelineEvents}
          machines={schedulingMachinesMock}
          machineWorkOrders={schedulingMachineWorkOrdersMock}
          machineEvents={schedulingMachineEventsMock}
          dateRange={timelineDateRange}
          filters={timelineFilters}
          selectedItem={selectedTimelineItem}
          onSelectItem={handleTimelineSelectionChange}
          categoryConfig={timelineCategoryConfig}
          selectedEventTypes={selectedTimelineEventTypes}
          expandedLineIds={expandedLineIds}
          onExpandedLineIdsChange={setExpandedLineIds}
          showMachineDrilldown={showMachineDrilldown}
        />
      );
    }
    if (scheduleViewMode === 'calendar') {
      return renderCalendarView(items, scope);
    }
    if (scheduleViewMode === 'gantt') {
      return renderGanttView(items, scope);
    }
    if (scheduleViewMode === 'table') {
      return renderTableView(items, scope);
    }
    return renderKanbanLikeGrid(items, scope);
  };

  const formatSimulationDateTime = (value: string) => value.replace('T', ' ').slice(0, 16);
  const formatMetricValue = (value: number) => (Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1));

  const renderSimulationMetricGroup = (
    title: string,
    metrics: typeof aiSimulationProposal.metricsBefore,
    tone: {bg: string; border: string; color: string},
  ) => (
    <Paper elevation={0} sx={{p: 1.4, borderRadius: 2.4, border: `1px solid ${tone.border}`, bgcolor: tone.bg}}>
      <Typography sx={{fontSize: 12, color: tone.color, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{title}</Typography>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.8, mt: 1}}>
        {[
          ['Total WOs', metrics.totalWorkOrders],
          ['Planned hours', metrics.totalPlannedHours],
          ['Idle hours', metrics.totalIdleHours],
          ['Changeovers', metrics.totalChangeovers],
          ['Avg utilization %', metrics.averageUtilizationPercent],
          ['Overloaded lines', metrics.overloadedLines],
          ['Late-risk orders', metrics.lateRiskOrders],
          ['Material-risk orders', metrics.materialRiskOrders],
          ['Blocked orders', metrics.readinessBlockedOrders],
          ['Projected throughput', metrics.projectedThroughput],
          ['Downtime hours', metrics.estimatedDowntimeHours],
        ].map(([label, value]) => (
          <Box key={`${title}-${label}`}>
            <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{label}</Typography>
            <Typography sx={{fontSize: 14, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 0.2}}>{formatMetricValue(value as number)}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );

  const renderSimulationList = (title: string, items: string[], tone: {bg: string; border: string; color: string}) => (
    <Paper elevation={0} sx={{p: 1.4, borderRadius: 2.4, border: `1px solid ${tone.border}`, bgcolor: tone.bg}}>
      <Typography sx={{fontSize: 12, color: tone.color, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>{title}</Typography>
      <Box sx={{display: 'grid', gap: 0.8, mt: 1}}>
        {items.map((item) => (
          <Typography key={`${title}-${item}`} sx={{fontSize: 12.8, color: 'var(--planning-text-secondary)', lineHeight: 1.5}}>
            {item}
          </Typography>
        ))}
      </Box>
    </Paper>
  );

  const renderAiSimulationProposalDetails = () => (
    <Box sx={{display: 'grid', gap: 1.2, mt: 1.5}}>
      <Paper elevation={0} sx={{p: 1.5, borderRadius: 2.5, border: '1px solid #E9D5FF', bgcolor: '#FCFAFF'}}>
        <Stack direction="row" spacing={0.8} sx={{flexWrap: 'wrap', rowGap: 0.8}}>
          <Chip size="small" label={`Simulation ID: ${aiSimulationProposal.id}`} sx={{bgcolor: '#F4ECFF', color: '#6D28D9', border: '1px solid #D8B4FE', fontWeight: 900}} />
          <Chip size="small" label={`Status: ${aiSimulationProposal.status}`} sx={{bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', fontWeight: 800}} />
          <Chip size="small" label={`${aiSimulationProposal.confidencePercent}% confidence`} sx={{bgcolor: '#ECFDF3', color: '#027A48', border: '1px solid #ABEFC6', fontWeight: 800}} />
          <Chip size="small" label={`Generated by ${aiSimulationProposal.generatedBy}`} sx={{bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', border: '1px solid var(--planning-border)', fontWeight: 800}} />
        </Stack>
        <Typography sx={{fontSize: 14, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 1.1}}>{aiSimulationProposal.optimizationObjective}</Typography>
        <Typography sx={{fontSize: 12.8, color: 'var(--planning-text-secondary)', mt: 0.7, lineHeight: 1.55}}>{aiSimulationProposal.summary}</Typography>
        <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 0.9}}>
          Horizon {formatSimulationDateTime(aiSimulationProposal.planningHorizonStart)} to {formatSimulationDateTime(aiSimulationProposal.planningHorizonEnd)} · Generated {formatSimulationDateTime(aiSimulationProposal.generatedAt)}
        </Typography>
      </Paper>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 1.2}}>
        {renderSimulationMetricGroup('Metrics Before', aiSimulationProposal.metricsBefore, {bg: '#FFFFFF', border: '#E2E8F0', color: 'var(--planning-text-secondary)'})}
        {renderSimulationMetricGroup('Metrics After', aiSimulationProposal.metricsAfter, {bg: '#F5F3FF', border: '#D8B4FE', color: '#6D28D9'})}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(3, minmax(0, 1fr))'}, gap: 1.2}}>
        <Paper elevation={0} sx={{p: 1.4, borderRadius: 2.4, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>AI Reasoning</Typography>
          <Box sx={{display: 'grid', gap: 0.9, mt: 1}}>
            {aiSimulationProposal.reasoning.map((entry) => (
              <Paper key={entry.id} elevation={0} sx={{p: 1, borderRadius: 2, border: '1px solid #E9D7FE', bgcolor: '#FCFAFF'}}>
                <Stack direction="row" spacing={0.8} sx={{alignItems: 'center', flexWrap: 'wrap', rowGap: 0.6}}>
                  <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-primary)', fontWeight: 900}}>{entry.title}</Typography>
                  <Chip size="small" label={entry.category} sx={{bgcolor: '#F4ECFF', color: '#6D28D9', fontWeight: 800}} />
                  <Chip size="small" label={entry.severity} sx={{bgcolor: entry.severity === 'Critical' ? '#FEF3F2' : entry.severity === 'Warning' ? '#FFF7ED' : '#EFF8FF', color: entry.severity === 'Critical' ? '#B42318' : entry.severity === 'Warning' ? '#C2410C' : '#175CD3', fontWeight: 800}} />
                </Stack>
                <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 0.6, lineHeight: 1.5}}>{entry.description}</Typography>
              </Paper>
            ))}
          </Box>
        </Paper>
        {renderSimulationList('Key Changes', aiSimulationProposal.keyChanges, {bg: '#FFFFFF', border: '#E2E8F0', color: 'var(--planning-text-secondary)'})}
        {renderSimulationList('Risks', aiSimulationProposal.risks, {bg: '#FFF7ED', border: '#FDBA74', color: '#C2410C'})}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'repeat(2, minmax(0, 1fr))'}, gap: 1.2}}>
        {renderSimulationList('Assumptions', aiSimulationProposal.assumptions, {bg: '#F8FAFC', border: '#E2E8F0', color: 'var(--planning-text-secondary)'})}
        <Paper elevation={0} sx={{p: 1.4, borderRadius: 2.4, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
          <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Proposal By Line</Typography>
          <Typography sx={{fontSize: 12.8, color: 'var(--planning-text-secondary)', mt: 0.8, lineHeight: 1.55}}>
            Each line below is a separate AI simulation proposal. The current approved schedule remains unchanged until a planner explicitly applies the proposal.
          </Typography>
        </Paper>
      </Box>

      <Box sx={{display: 'grid', gap: 1.2}}>
        {aiSimulationProposal.lineSequences.map((line) => (
          <Paper key={line.lineId} elevation={0} sx={{p: 1.4, borderRadius: 2.5, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.2, flexWrap: 'wrap'}}>
              <Box>
                <Typography sx={{fontSize: 16, color: 'var(--planning-text-primary)', fontWeight: 900}}>{line.lineName}</Typography>
                <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 0.2}}>{line.area}</Typography>
              </Box>
              <Stack direction="row" spacing={0.8} sx={{flexWrap: 'wrap', rowGap: 0.8}}>
                <Chip size="small" label={`No-gap sequence: ${line.gapFreeSequence ? 'Yes' : 'No'}`} sx={{bgcolor: line.gapFreeSequence ? '#ECFDF3' : '#FEF3F2', color: line.gapFreeSequence ? '#027A48' : '#B42318', border: `1px solid ${line.gapFreeSequence ? '#ABEFC6' : '#FECDCA'}`, fontWeight: 800}} />
                <Chip size="small" label={`Risk: ${line.riskLevel}`} sx={{bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', border: '1px solid var(--planning-border)', fontWeight: 800}} />
                <Chip size="small" label={`Utilization ${line.currentUtilizationPercent}% → ${line.proposedUtilizationPercent}%`} sx={{bgcolor: '#F4ECFF', color: '#6D28D9', border: '1px solid #D8B4FE', fontWeight: 800}} />
              </Stack>
            </Box>
            <Typography sx={{fontSize: 12.8, color: 'var(--planning-text-secondary)', mt: 0.9, lineHeight: 1.55}}>{line.lineReasoning}</Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(4, minmax(0, 1fr))'}, gap: 0.9, mt: 1.1}}>
              {[
                ['Hours', `${line.currentTotalHours} → ${line.proposedTotalHours}`],
                ['Idle hours', `${line.idleTimeBeforeHours} → ${line.idleTimeAfterHours}`],
                ['Changeovers', `${line.changeoverBeforeCount} → ${line.changeoverAfterCount}`],
                ['Sequence items', `${line.sequenceItems.length}`],
              ].map(([label, value]) => (
                <Paper key={`${line.lineId}-${label}`} elevation={0} sx={{p: 1, borderRadius: 2, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
                  <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{label}</Typography>
                  <Typography sx={{fontSize: 14, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 0.25}}>{value}</Typography>
                </Paper>
              ))}
            </Box>
            <Box sx={{display: 'grid', gap: 0.9, mt: 1.2}}>
              {line.sequenceItems.map((item) => (
                <Paper key={`${line.lineId}-${item.workOrderId}`} elevation={0} sx={{p: 1.1, borderRadius: 2, border: '1px solid #E9D7FE', bgcolor: '#FCFAFF'}}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap'}}>
                    <Box>
                      <Stack direction="row" spacing={0.7} sx={{flexWrap: 'wrap', rowGap: 0.7}}>
                        <Chip size="small" label={`#${item.proposedSequenceNumber}`} sx={{bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', fontWeight: 900}} />
                        <Chip size="small" label={item.workOrderId} sx={{bgcolor: '#F4ECFF', color: '#6D28D9', fontWeight: 800}} />
                        <Chip size="small" label={item.priority} sx={{bgcolor: item.priority === 'Critical' ? '#FEF3F2' : item.priority === 'High' ? '#FFF7ED' : '#F8FAFC', color: item.priority === 'Critical' ? '#B42318' : item.priority === 'High' ? '#C2410C' : '#475467', fontWeight: 800}} />
                        <Chip size="small" label={`Readiness: ${item.readinessStatus}`} sx={{bgcolor: item.readinessStatus === 'Blocked' ? '#FEF3F2' : item.readinessStatus === 'Warning' ? '#FFF7ED' : '#ECFDF3', color: item.readinessStatus === 'Blocked' ? '#B42318' : item.readinessStatus === 'Warning' ? '#C2410C' : '#027A48', fontWeight: 800}} />
                      </Stack>
                      <Typography sx={{fontSize: 14, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 0.8}}>{item.productCode} {item.productDescription}</Typography>
                    </Box>
                    <Chip size="small" label={item.changeType} sx={{bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', border: '1px solid var(--planning-border)', fontWeight: 800}} />
                  </Box>
                  <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(4, minmax(0, 1fr))'}, gap: 0.8, mt: 1}}>
                    <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>Qty <Box component="span" sx={{fontWeight: 800}}>{item.quantity.toLocaleString()} {item.uom}</Box></Typography>
                    <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>Start <Box component="span" sx={{fontWeight: 800}}>{formatSimulationDateTime(item.proposedStartDateTime)}</Box></Typography>
                    <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>End <Box component="span" sx={{fontWeight: 800}}>{formatSimulationDateTime(item.proposedEndDateTime)}</Box></Typography>
                    <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)'}}>Duration <Box component="span" sx={{fontWeight: 800}}>{item.durationHours} h</Box></Typography>
                  </Box>
                  <Stack direction="row" spacing={0.7} sx={{mt: 1, flexWrap: 'wrap', rowGap: 0.7}}>
                    <Chip size="small" label={`Material risk: ${item.materialRisk}`} sx={{bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)'}} />
                    <Chip size="small" label={`Quality risk: ${item.qualityRisk}`} sx={{bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)'}} />
                    <Chip size="small" label={`Labor risk: ${item.laborRisk}`} sx={{bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)'}} />
                  </Stack>
                  <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 0.9, lineHeight: 1.5}}>AI reasoning: {item.aiReasoning}</Typography>
                  <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', mt: 0.45, lineHeight: 1.5}}>Expected impact: {item.expectedImpact}</Typography>
                  {item.warningReason ? (
                    <Typography sx={{fontSize: 12.5, color: '#B42318', mt: 0.45, fontWeight: 800}}>{item.warningReason}</Typography>
                  ) : null}
                </Paper>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    </Box>
  );

  const renderSchedulingWorkspace = () => (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      <Paper elevation={0} sx={{...moduleCardSx, p: 2.2}}>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 1.45fr) minmax(320px, 0.9fr)'}, gap: 2}}>
          <Box>
            <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
              <Chip icon={<AutoAwesomeIcon sx={{fontSize: 16}} />} label="AI-generated short-term scheduling" sx={{bgcolor: '#F4ECFF', color: '#6D28D9', border: '1px solid #D8B4FE', fontWeight: 900}} />
              <Chip icon={<GppMaybeIcon sx={{fontSize: 16}} />} label="Local mock state only" sx={{bgcolor: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74', fontWeight: 800}} />
            </Stack>
            <Typography sx={{fontSize: 24, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 1.4}}>AI creates the short-term production schedule and the planner reviews exceptions.</Typography>
            <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', mt: 1, lineHeight: 1.7, maxWidth: 860}}>
              Review production lines, machines, day-by-day slots, WO cards, readiness and risk before accepting or rejecting the AI proposed sequence. Manual schedule changes remain local and always require a reason code.
            </Typography>
            <Stack direction="row" spacing={1} sx={{mt: 1.7, flexWrap: 'wrap', rowGap: 1}}>
              <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={generateAiSequenceSimulation} sx={{textTransform: 'none', fontWeight: 800, borderRadius: 2.5, bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}}}>
                Generate AI sequence simulation
              </Button>
              <Button variant="outlined" onClick={() => setCompareMode((current) => !current)} sx={{textTransform: 'none', fontWeight: 800, borderRadius: 2.5}}>
                Compare current vs AI sequence
              </Button>
              <Button variant="outlined" onClick={validateScheduleLocally} sx={{textTransform: 'none', fontWeight: 800, borderRadius: 2.5}}>
                Validate schedule locally
              </Button>
            </Stack>
          </Box>
          <Paper elevation={0} sx={{p: 1.8, borderRadius: 3, border: '1px solid #E9D5FF', backgroundImage: 'linear-gradient(180deg, #FCFAFF 0%, #F6F0FF 100%)'}}>
            <Typography sx={{fontSize: 12, color: '#7C3AED', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Scheduling KPIs</Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1, mt: 1.2}}>
              {[
                {label: 'Scheduled WOs', value: String(scheduledApprovedCount)},
                {label: 'AI changes', value: String(aiChangeCount)},
                {label: 'Warning WOs', value: String(warningCount)},
                {label: 'Blocked backlog', value: String(blockedBacklogCount)},
              ].map((item) => (
                <Paper key={item.label} elevation={0} sx={{p: 1.1, borderRadius: 2.2, border: '1px solid #E9D5FF', bgcolor: '#FFFFFFAA'}}>
                  <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{item.label}</Typography>
                  <Typography sx={{fontSize: 22, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 0.5}}>{item.value}</Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{...moduleCardSx, p: 1.6}}>
        <Stack direction={{xs: 'column', lg: 'row'}} spacing={1} sx={{justifyContent: 'space-between', alignItems: {lg: 'center'}}}>
          <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
            {timelineViewOptions.map((view) => (
              <Button
                key={view.id}
                variant={scheduleViewMode === view.id ? 'contained' : 'outlined'}
                startIcon={
                  view.id === 'timeline'
                    ? <ViewTimelineIcon sx={{fontSize: 17}} />
                    : view.id === 'kanban'
                      ? <ViewKanbanIcon sx={{fontSize: 17}} />
                      : view.id === 'calendar'
                        ? <ViewColumnIcon sx={{fontSize: 17}} />
                        : view.id === 'gantt'
                          ? <TimelineIcon sx={{fontSize: 17}} />
                          : <TableRowsIcon sx={{fontSize: 17}} />
                }
                onClick={() => setScheduleViewMode(view.id as SchedulingViewMode)}
                data-testid={`${view.id}-view-button`}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: 2.5,
                  bgcolor: scheduleViewMode === view.id ? '#6D28D9' : undefined,
                  '&:hover': {bgcolor: scheduleViewMode === view.id ? '#5B21B6' : undefined},
                }}
              >
                {view.label}
              </Button>
            ))}
          </Stack>
          <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
            {schedulingWorkflowLinks.map((item) => (
              <Button key={item.pageId} variant="text" endIcon={<OpenInNewIcon />} onClick={() => navigateToWorkflow(item.pageId, item.label)} sx={{textTransform: 'none', fontWeight: 800}}>
                {item.label}
              </Button>
            ))}
          </Stack>
        </Stack>
      </Paper>

      <SchedulingTimelineToolbar
        lines={demoTimelineLines}
        machines={schedulingMachinesMock}
        dateRange={timelineDateRange}
        onDateRangeChange={setTimelineDateRange}
        filters={timelineFilters}
        onFiltersChange={setTimelineFilters}
        categoryConfig={timelineCategoryConfig}
        selectedEventTypes={selectedTimelineEventTypes}
        onSelectedEventTypesChange={setSelectedTimelineEventTypes}
        showMachineDrilldown={showMachineDrilldown}
        onShowMachineDrilldownChange={setShowMachineDrilldown}
        expandedLineIds={expandedLineIds}
        onExpandedLineIdsChange={setExpandedLineIds}
      />

      <TimelineLineLoadSummary lines={demoTimelineLines} summary={timelinePresentation.lineSummary} />
      <TimelineLegend categoryConfig={timelineCategoryConfig} selectedEventTypes={selectedTimelineEventTypes} onSelectedEventTypesChange={setSelectedTimelineEventTypes} />

      {validationIssues.length > 0 ? (
        <Paper elevation={0} sx={{...moduleCardSx, p: 1.6}}>
          <Typography sx={{fontSize: 13, color: '#7C3AED', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Local Validation Results</Typography>
          <Stack spacing={1} sx={{mt: 1.1}}>
            {validationIssues.map((issue) => (
              <Paper
                key={issue.id}
                elevation={0}
                sx={{
                  p: 1.1,
                  borderRadius: 2.2,
                  border: '1px solid',
                  borderColor: issue.severity === 'Error' ? '#FECDCA' : issue.severity === 'Warning' ? '#F9DBAF' : '#D8B4FE',
                  bgcolor: issue.severity === 'Error' ? '#FEF3F2' : issue.severity === 'Warning' ? '#FFF7ED' : '#FCFAFF',
                }}
              >
                <Typography sx={{fontSize: 12.8, color: issue.severity === 'Error' ? '#B42318' : issue.severity === 'Warning' ? '#B54708' : '#6D28D9', fontWeight: 800}}>
                  {issue.severity} · {issue.message}
                </Typography>
              </Paper>
            ))}
          </Stack>
        </Paper>
      ) : null}

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: compareMode ? 'repeat(2, minmax(0, 1fr))' : '1fr'}, gap: 2}}>
        <Paper elevation={0} sx={{...moduleCardSx, p: 2}}>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap'}}>
            <Box>
              <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Current Approved Sequence</Typography>
              <Typography sx={{fontSize: 20, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 0.7}}>Planner-approved short-term schedule</Typography>
            </Box>
            <Chip label="Approved schedule" sx={{bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', border: '1px solid var(--planning-border)', fontWeight: 800}} />
          </Box>
          <Box sx={{mt: 1.5}}>{renderSequenceByView(approvedSchedule, 'approved')}</Box>
        </Paper>

        {compareMode ? (
          <Paper elevation={0} sx={{...moduleCardSx, p: 2, border: '1px solid #D8B4FE', bgcolor: '#FFFEFF'}}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap'}}>
              <Box>
                <Typography sx={{fontSize: 13, color: '#7C3AED', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>AI Proposed Sequence</Typography>
                <Typography sx={{fontSize: 20, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 0.7}}>Visually distinct AI-generated short-term schedule</Typography>
              </Box>
              <Chip icon={<AutoAwesomeIcon sx={{fontSize: 15}} />} label="AI proposed schedule" sx={{bgcolor: '#F4ECFF', color: '#6D28D9', border: '1px solid #D8B4FE', fontWeight: 800}} />
            </Box>
            <Stack direction="row" spacing={1} sx={{mt: 1.2, flexWrap: 'wrap', rowGap: 1}}>
              <Button variant="contained" startIcon={<ThumbUpAltOutlinedIcon />} onClick={() => setPendingAiApply(true)} sx={{textTransform: 'none', fontWeight: 800, borderRadius: 2.5, bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}}}>
                Accept AI sequence
              </Button>
              <Button variant="outlined" color="error" startIcon={<ThumbDownAltOutlinedIcon />} onClick={() => setPendingAiReject(true)} sx={{textTransform: 'none', fontWeight: 800, borderRadius: 2.5}}>
                Reject AI sequence
              </Button>
            </Stack>
            <Box sx={{mt: 1.5}}>{renderSequenceByView(aiSchedule, 'ai')}</Box>
            {renderAiSimulationProposalDetails()}
          </Paper>
        ) : null}
      </Box>

      {scheduleViewMode === 'timeline' ? (
        <TimelineDetailsPanel selectedItem={selectedTimelineDetail.item} selectedKind={selectedTimelineDetail.kind} lines={demoTimelineLines} />
      ) : null}

      <Paper elevation={0} sx={{...moduleCardSx, p: 2}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap'}}>
          <Box>
            <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Unscheduled Backlog</Typography>
            <Typography sx={{fontSize: 20, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 0.7}}>Orders not yet placed on the short-term timeline</Typography>
          </Box>
          <Chip label={`${unscheduledBacklog.length} backlog WOs`} sx={{bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', border: '1px solid var(--planning-border)', fontWeight: 800}} />
        </Box>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))'}, gap: 1.2, mt: 1.5}}>
          {unscheduledBacklog.map((item) => renderWoCard(item, 'backlog'))}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{...moduleCardSx, p: 2}}>
        <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Local Scheduling Audit Trail</Typography>
        <Typography sx={{fontSize: 20, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 0.8}}>Simulation, planner actions, and local apply events</Typography>
        <Box sx={{display: 'grid', gap: 1.1, mt: 1.5}}>
          {schedulingAuditEvents.slice(0, 8).map((event) => (
            <Paper key={event.id} elevation={0} sx={{p: 1.2, borderRadius: 2.3, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '170px minmax(0, 1fr) 140px'}, gap: 1}}>
                <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 700}}>{event.timestamp}</Typography>
                <Box>
                  <Typography sx={{fontSize: 13.3, color: 'var(--planning-text-primary)', fontWeight: 900}}>{event.action}</Typography>
                  <Typography sx={{fontSize: 12.8, color: 'var(--planning-text-secondary)', mt: 0.3, lineHeight: 1.45}}>{event.item} · {event.details}</Typography>
                </Box>
                <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{event.actor}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );

  const renderDefaultWorkflowPage = () => (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      <Paper elevation={0} sx={{...moduleCardSx, p: 2.2}}>
        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap'}}>
          <Box sx={{display: 'flex', gap: 1.2, minWidth: 0}}>
            <Box sx={{width: 42, height: 42, borderRadius: 2.4, bgcolor: `color-mix(in srgb, ${activePage.accent} 13%, transparent)`, color: activePage.accent, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{activePage.icon}</Box>
            <Box sx={{minWidth: 0}}>
              <Typography sx={{fontSize: 22, fontWeight: 900, color: 'var(--planning-text-primary)', lineHeight: 1.15}}>{activePage.title}</Typography>
              <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', mt: 0.6}}>{activePage.subtitle}</Typography>
            </Box>
          </Box>
          <Chip icon={<ScheduleIcon sx={{fontSize: 16}} />} label="Workflow Page" sx={{fontWeight: 900, bgcolor: `color-mix(in srgb, ${activePage.accent} 9%, transparent)`, color: activePage.accent, border: `1px solid color-mix(in srgb, ${activePage.accent} 27%, transparent)`}} />
        </Box>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1.2, mt: 1.8}}>
          {activePage.metrics.map((metric) => (
            <Paper key={metric.label} elevation={0} sx={{p: 1.35, borderRadius: 2.2, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
              <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', fontWeight: 800}}>{metric.label}</Typography>
              <Typography sx={{fontSize: 24, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 0.55, lineHeight: 1}}>{metric.value}</Typography>
            </Paper>
          ))}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{...moduleCardSx, p: 2.2}}>
        <Typography sx={{fontSize: 13, color: '#7C3AED', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Focus For This Page</Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(3, minmax(0, 1fr))'}, gap: 1.2, mt: 1.4}}>
          {activePage.focus.map((item) => (
            <Paper key={item} elevation={0} sx={{p: 1.35, borderRadius: 2.2, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface)'}}>
              <Box sx={{display: 'flex', alignItems: 'flex-start', gap: 0.85}}>
                <CheckCircleOutlineIcon sx={{fontSize: 18, color: activePage.accent, mt: 0.1}} />
                <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', lineHeight: 1.55}}>{item}</Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{...moduleCardSx, p: 2.2}}>
        <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Workflow Navigation</Typography>
        <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', mt: 0.9, lineHeight: 1.6}}>
          This module keeps each workflow page separated so planners can move from overview to detailed planning actions without leaving the Production Planning navigation.
        </Typography>
      </Paper>
    </Box>
  );

  return (
    <Box sx={{flexGrow: 1, minHeight: 0, overflowY: 'auto', bgcolor: 'background.default', p: {xs: 2, md: 4}}}>
      <Box sx={{display: 'flex', flexDirection: 'column', gap: 2.5}}>
        <Paper
          elevation={0}
          onMouseEnter={() => setIsMenuExpanded(true)}
          onMouseLeave={() => setIsMenuExpanded(false)}
          sx={{
            ...moduleCardSx,
            p: 0,
            overflow: 'hidden',
            position: {md: 'sticky'},
            top: {md: 0},
            zIndex: 5,
          }}
        >
          <Box
            sx={{
              px: {xs: 1, md: 1.6},
              py: 1.1,
              display: {xs: 'flex', md: 'grid'},
              gridTemplateColumns: {md: 'repeat(4, minmax(0, 1fr))'},
              gap: 0.75,
              overflowX: {xs: 'auto', md: 'visible'},
              borderBottom: isMenuExpanded ? '1px solid #E2E8F0' : 'none',
              bgcolor: '#FBFDFF',
            }}
          >
            {menuGroups.map((group) => {
              const isActiveGroup = activeMenuGroupId === group.id;
              return (
                <Button
                  key={group.id}
                  onMouseEnter={() => setIsMenuExpanded(true)}
                  onFocus={() => setIsMenuExpanded(true)}
                  onClick={() => setIsMenuExpanded((current) => !current)}
                  endIcon={<ChevronRightIcon sx={{fontSize: 16, transform: isMenuExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.18s ease'}} />}
                  sx={{
                    flexShrink: 0,
                    width: '100%',
                    minHeight: 40,
                    px: 1.4,
                    borderRadius: 2.2,
                    justifyContent: 'space-between',
                    color: isMenuExpanded || isActiveGroup ? '#1D4ED8' : '#344054',
                    bgcolor: isMenuExpanded || isActiveGroup ? '#EEF4FF' : 'transparent',
                    border: '1px solid',
                    borderColor: isMenuExpanded || isActiveGroup ? '#D7E3FF' : 'transparent',
                    fontSize: 12.6,
                    fontWeight: 900,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    '&:hover': {
                      bgcolor: '#F5F9FF',
                      borderColor: '#D7E3FF',
                    },
                  }}
                >
                  {group.label}
                </Button>
              );
            })}
          </Box>

          <Collapse in={isMenuExpanded} timeout={180} unmountOnExit>
            <Box sx={{px: {xs: 1.2, md: 1.8}, pb: 1.6, pt: 0.25}}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {xs: '1fr', md: 'repeat(4, minmax(0, 1fr))'},
                  gap: 0,
                  borderRadius: 2.6,
                  bgcolor: 'var(--planning-surface)',
                }}
              >
                {menuGroups.map((group, groupIndex) => (
                  <Box
                    key={group.id}
                    sx={{
                      px: {xs: 0.2, md: 1.5},
                      py: 1.3,
                      borderRight: {md: groupIndex < menuGroups.length - 1 ? '1px solid #E5E7EB' : 'none'},
                    }}
                  >
                    <Typography
                      sx={{
                        px: 1.2,
                        pb: 1.2,
                        fontSize: 13,
                        fontWeight: 900,
                        color: '#1D4ED8',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                      }}
                    >
                    </Typography>
                    <Box sx={{display: 'grid', gap: 0.35}}>
                      {group.items.map((item) => {
                        const isActiveItem = item.pageId === activePageId;
                        return (
                          <Box
                            key={`${group.id}-${item.label}`}
                            component="button"
                            onClick={() => {
                              if (item.pageId) {
                                setActiveWorkflowPage(item.pageId);
                                return;
                              }
                              item.action?.();
                            }}
                            sx={{
                              p: 1.2,
                              borderRadius: 2,
                              border: '1px solid transparent',
                              bgcolor: isActiveItem ? '#EFF6FF' : 'transparent',
                              textAlign: 'left',
                              cursor: 'pointer',
                              transition: 'all 0.18s ease',
                              '&:hover': {
                                borderColor: '#BFDBFE',
                                bgcolor: 'var(--planning-surface-muted)',
                              },
                            }}
                          >
                            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1}}>
                              <Typography sx={{fontSize: 15, fontWeight: 900, color: isActiveItem ? '#1D4ED8' : '#111827', lineHeight: 1.2}}>
                                {item.label}
                              </Typography>
                              <OpenInNewIcon sx={{fontSize: 15, color: isActiveItem ? '#1D4ED8' : '#98A2B3', mt: 0.15}} />
                            </Box>
                            <Typography sx={{fontSize: 12.8, color: 'var(--planning-text-secondary)', mt: 0.55, lineHeight: 1.45}}>
                              {item.description}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Collapse>
        </Paper>

        <Box sx={{display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 2, alignItems: 'start'}}>
          <Suspense fallback={<Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: 320}}><Box sx={{width: 32, height: 32, border: '3px solid #E2E8F0', borderTopColor: '#6D28D9', borderRadius: '50%', animation: 'spin 0.8s linear infinite', '@keyframes spin': {to: {transform: 'rotate(360deg)'}}}} /></Box>}>
            {activePageId === 'planning-overview'
              ? renderPlanningOverview()
              : activePageId === 'twelve-month-plan'
                ? (
                  <DemandForecastCombinedPage
                    initialVersionId={lineageInitialVersionId}
                    onOpenMpsVersion={(mpsVersionId) => {
                      setLineageInitialVersionId(mpsVersionId);
                      setActivePageId('monthly-mps');
                    }}
                  />
                )
                : activePageId === 'capacity-planning'
                  ? <CapacityPlanningPage />
                : activePageId === 'monthly-mps'
                    ? (
                      <MpsCombinedPage
                        initialVersionId={lineageInitialVersionId}
                        onOpenDemandVersion={(forecastVersionId) => {
                          setLineageInitialVersionId(forecastVersionId);
                          setActivePageId('twelve-month-plan');
                        }}
                        onOpenMrpVersion={(mrpVersionId) => {
                          setLineageInitialVersionId(mrpVersionId);
                          setActivePageId('mrp');
                        }}
                      />
                    )
                    : activePageId === 'mrp'
                      ? <MrpCombinedPage initialVersionId={lineageInitialVersionId} />
                    : activePageId === 'schedule-versions'
                      ? <ScheduleOrderCombinedPage initialAssistantOpen={openOrdersAiWorkflow} initialVersionId={lineageInitialVersionId} />
                    : activePageId === 'planning-lineage'
                      ? <PlanningLineagePage onNavigate={handleLineageNavigate} />
                    : activePageId === 'scheduling-workspace'
                      ? renderSchedulingWorkspace()
                      : activePageId === 'work-orders'
                        ? (
                          <WorkOrdersPage
                            onBack={() => setActivePageId('planning-overview')}
                            onOpenBluAiWorkflow={() => {
                              setOpenOrdersAiWorkflow(true);
                              setActivePageId('schedule-versions');
                            }}
                            onCreateOrder={() => setActivePageId('create-orders')}
                          />
                        )
                        : activePageId === 'create-orders'
                          ? <CreateOrdersPage onBack={() => setActivePageId('work-orders')} />
                        : activePageId === 'material-and-warehouse'
                          ? <MaterialAndWarehousePage onBack={() => setActivePageId('planning-overview')} />
                          : renderDefaultWorkflowPage()}
          </Suspense>
        </Box>
      </Box>

      <Dialog open={Boolean(selectedRecommendation)} onClose={() => setSelectedRecommendationId(null)} fullWidth maxWidth="md">
        {selectedRecommendation ? (
          <>
            <DialogTitle sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, pr: 1.2}}>
              <Box>
                <Typography sx={{fontSize: 12, color: '#7C3AED', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>AI Recommendation Detail</Typography>
                <Typography component="div" sx={{fontSize: 22, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 0.8}}>{selectedRecommendation.title}</Typography>
              </Box>
              <Button onClick={() => setSelectedRecommendationId(null)} sx={{minWidth: 0, p: 0.8}}><CloseIcon /></Button>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} sx={{flexWrap: 'wrap', rowGap: 1}}>
                  <Chip icon={<AutoAwesomeIcon sx={{fontSize: 15}} />} label="AI-generated" sx={{bgcolor: '#F4ECFF', color: '#6D28D9', border: '1px solid #D8B4FE', fontWeight: 800}} />
                  <Chip label={selectedRecommendation.recommendationType} sx={{bgcolor: 'var(--planning-surface-muted)', color: 'var(--planning-text-secondary)', border: '1px solid var(--planning-border)', fontWeight: 800}} />
                  <Chip label={`${selectedRecommendation.confidence}% confidence`} sx={{bgcolor: 'var(--planning-ai-accent-bg)', color: '#4338CA', border: '1px solid #C7D2FE', fontWeight: 800}} />
                </Stack>
                <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', lineHeight: 1.7}}>{selectedRecommendation.summary}</Typography>
                <Paper elevation={0} sx={{p: 1.5, borderRadius: 2.5, border: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
                  <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em'}}>Impact</Typography>
                  <Typography sx={{fontSize: 14, color: '#1F2937', lineHeight: 1.6, mt: 0.8}}>{selectedRecommendation.impact}</Typography>
                </Paper>
                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))'}, gap: 2}}>
                  <Paper elevation={0} sx={{p: 1.5, borderRadius: 2.5, border: '1px solid var(--planning-border)'}}>
                    <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em'}}>AI rationale</Typography>
                    <Stack spacing={1} sx={{mt: 1.1}}>
                      {selectedRecommendation.rationale.map((item) => <Typography key={item} sx={{fontSize: 13.5, color: 'var(--planning-text-secondary)', lineHeight: 1.55}}>• {item}</Typography>)}
                    </Stack>
                  </Paper>
                  <Paper elevation={0} sx={{p: 1.5, borderRadius: 2.5, border: '1px solid var(--planning-border)'}}>
                    <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em'}}>Suggested actions</Typography>
                    <Stack spacing={1} sx={{mt: 1.1}}>
                      {selectedRecommendation.actions.map((item) => <Typography key={item} sx={{fontSize: 13.5, color: 'var(--planning-text-secondary)', lineHeight: 1.55}}>• {item}</Typography>)}
                    </Stack>
                  </Paper>
                </Box>
              </Stack>
            </DialogContent>
            <DialogActions sx={{p: 2}}>
              <Button onClick={() => navigateToWorkflow(selectedRecommendation.relatedPageId, selectedRecommendation.title)} endIcon={<OpenInNewIcon />} sx={{textTransform: 'none', fontWeight: 800}}>Open related workflow</Button>
              <Box sx={{flex: 1}} />
              <Button variant="outlined" color="error" disabled={selectedRecommendation.status !== 'pending'} onClick={() => handleOpenRejectDialog(selectedRecommendation.id)} sx={{textTransform: 'none', fontWeight: 800}}>Reject</Button>
              <Button variant="contained" disabled={selectedRecommendation.status !== 'pending'} onClick={() => handleAcceptRecommendation(selectedRecommendation.id)} sx={{textTransform: 'none', fontWeight: 800, bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}}}>Accept</Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>

      <Dialog open={Boolean(rejectingRecommendation)} onClose={() => setRejectingRecommendationId(null)} fullWidth maxWidth="sm">
        {rejectingRecommendation ? (
          <>
            <DialogTitle sx={{fontWeight: 900, color: 'var(--planning-text-primary)'}}>Reject AI recommendation</DialogTitle>
            <DialogContent dividers>
              <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', lineHeight: 1.65}}>A rejection reason is required to create the local audit event for this planner decision.</Typography>
              <Typography sx={{fontSize: 14, color: 'var(--planning-text-primary)', fontWeight: 900, mt: 1.4}}>{rejectingRecommendation.title}</Typography>
              <TextField multiline minRows={4} fullWidth autoFocus label="Rejection reason" placeholder="Explain why this AI-generated recommendation should not be approved." value={rejectionReason} onChange={(event) => setRejectionReason(event.target.value)} error={!rejectionReason.trim()} helperText={!rejectionReason.trim() ? 'Reason is required.' : 'This reason will be stored in local state only.'} sx={{mt: 2}} />
            </DialogContent>
            <DialogActions sx={{p: 2}}>
              <Button onClick={() => setRejectingRecommendationId(null)} sx={{textTransform: 'none', fontWeight: 800}}>Cancel</Button>
              <Button variant="contained" color="error" disabled={!rejectionReason.trim()} onClick={handleConfirmReject} sx={{textTransform: 'none', fontWeight: 800}}>Confirm rejection</Button>
            </DialogActions>
          </>
        ) : null}
      </Dialog>

      <Dialog open={Boolean(manualMoveState)} onClose={() => setManualMoveState(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900, color: 'var(--planning-text-primary)'}}>Manual schedule change</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', lineHeight: 1.65}}>Manual changes require a reason code before the WO can be moved locally.</Typography>
          <TextField
            select
            fullWidth
            label="Reason code"
            value={manualChangeReasonCode}
            onChange={(event) => setManualChangeReasonCode(event.target.value)}
            sx={{mt: 2}}
          >
            {schedulingReasonCodes.map((reason) => <MenuItem key={reason.code} value={reason.code}>{reason.code} · {reason.label}</MenuItem>)}
          </TextField>
          <TextField multiline minRows={3} fullWidth label="Planner note" placeholder="Optional local note for this change." value={manualChangeReasonText} onChange={(event) => setManualChangeReasonText(event.target.value)} sx={{mt: 2}} />
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setManualMoveState(null)} sx={{textTransform: 'none', fontWeight: 800}}>Cancel</Button>
          <Button variant="contained" disabled={!manualChangeReasonCode} onClick={executeManualMove} sx={{textTransform: 'none', fontWeight: 800, bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}}}>Apply local move</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={pendingAiApply} onClose={() => setPendingAiApply(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900, color: 'var(--planning-text-primary)'}}>Confirm AI sequence apply</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', lineHeight: 1.65}}>The AI proposed schedule is visually distinct from the approved schedule. Confirming here will replace the current approved sequence in local state and create a local audit event.</Typography>
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setPendingAiApply(false)} sx={{textTransform: 'none', fontWeight: 800}}>Cancel</Button>
          <Button variant="contained" onClick={handleApplyAiSequence} sx={{textTransform: 'none', fontWeight: 800, bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}}}>Confirm apply</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={pendingAiReject} onClose={() => setPendingAiReject(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{fontWeight: 900, color: 'var(--planning-text-primary)'}}>Reject AI sequence</DialogTitle>
        <DialogContent dividers>
          <Typography sx={{fontSize: 14, color: 'var(--planning-text-secondary)', lineHeight: 1.65}}>A reason is required before rejecting the local AI proposed schedule.</Typography>
          <TextField multiline minRows={4} fullWidth autoFocus label="Rejection reason" value={aiRejectReason} onChange={(event) => setAiRejectReason(event.target.value)} helperText={!aiRejectReason.trim() ? 'Reason is required.' : 'Stored in local audit only.'} error={!aiRejectReason.trim()} sx={{mt: 2}} />
        </DialogContent>
        <DialogActions sx={{p: 2}}>
          <Button onClick={() => setPendingAiReject(false)} sx={{textTransform: 'none', fontWeight: 800}}>Cancel</Button>
          <Button variant="contained" color="error" disabled={!aiRejectReason.trim()} onClick={handleRejectAiSequence} sx={{textTransform: 'none', fontWeight: 800}}>Confirm rejection</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
