import {
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  WarningAmber as WarningAmberIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Block as BlockIcon,
  CheckBox as CheckBoxIcon,
  DoneAll as DoneAllIcon,
  Fullscreen as FullscreenIcon,
  FullscreenExit as FullscreenExitIcon,
  LockOutlined as LockOutlinedIcon,
  Replay as ReplayIcon,
  Science as ScienceIcon,
  SwapHoriz as SwapHorizIcon,
  SwapVert as SwapVertIcon,
  Tune as TuneIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import {type ReactNode, useEffect, useMemo, useRef, useState} from 'react';
import {
  AI_TIMELINE_INITIAL_WOS,
  AI_TIMELINE_FINAL_WOS,
  aiTimelineLines,
  aiTimelineSlots,
  AI_TIMELINE_CATEGORIES,
  interpolateTimelineWOs,
} from '../aiTimelineMock';
import V2Timeline from './V2Timeline';

type Props = {
  open: boolean;
  onClose: () => void;
  onComplete?: () => void;
};

type ProgressStep = {label: string};

type OptionConfig = {
  label: string;
  userText: string;
  action: (state: WorkspaceState) => WorkspaceState;
  nextStepIndex?: number;
  detailMessage?: string;
};

type AssistantStage = {
  title: string;
  body: string[];
  options: OptionConfig[];
};

type ChatMessage = {
  id: string;
  role: 'assistant' | 'user';
  title?: string;
  body: string;
  kind?: 'message' | 'reasoning' | 'status';
  options?: OptionConfig[];
};

type ScheduleRow = {
  woNumber: string;
  product: string;
  line: string;
  shift: string;
  priority: string;
  priorityColor: string;
  status: string;
  statusColor: string;
  statusBg: string;
  durationHrs: number;
};

type ExceptionRow = {
  id: string;
  woNumber: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium';
  description: string;
  resolved: boolean;
};

type QueueRow = {
  woNumber: string;
  product: string;
  priority: string;
  priorityColor: string;
  dueDate: string;
  readiness: 'Ready' | 'Warning' | 'Blocked';
  blocker: string;
  eligibleLine: string;
};

type WorkspaceState = {
  currentStepIndex: number;
  currentIterationIndex: number;
  planningHorizon: string | null;
  selectedStrategy: string | null;
  selectedOptimizationPreference: string;
  iterationReviewStatus: string;
  scheduleStatus: string;
  scheduledCount: number;
  unscheduledCount: number;
  blockedCount: number;
  utilizationPercent: number;
  changeoversHours: number;
  exceptionsCount: number;
  resolvedExceptions: number;
  approvalComment: string;
  submitted: boolean;
  showDetailedChanges: boolean;
  recentDecisions: {label: string; by: string; time: string}[];
  auditTrail: DecisionAuditEntry[];
  scheduleRows: ScheduleRow[];
  exceptions: ExceptionRow[];
};

type IterationMetrics = {
  scheduledWos: number;
  unscheduledWos: number;
  delayedWos: number;
  averageUtilizationPct: number;
  remainingCapacityHrs: number;
  overloadedLines: number;
  overloadHours: number;
  productiveTimeHrs: number;
  effectiveUtilizationPct: number;
  totalChangeoverHrs: number;
  changeovers: number;
  longChangeovers: number;
  totalIdleTimeHrs: number;
  idleMaterialHrs: number;
  idleQualityHrs: number;
  idleNoEligibleHrs: number;
  oeeAdjustedFeasibilityPct: number;
  downtimeConflicts: number;
  eoRiskItems: number;
  atRiskQuantityK: number;
};

type IdleReasonBreakdown = {
  plannedIdleHrs: number;
  maintenanceDowntimeHrs: number;
  materialShortageHrs: number;
  qualityHoldHrs: number;
  noEligibleWoHrs: number;
  laborGapHrs: number;
  warehouseReadinessHrs: number;
  sterilizationConstraintHrs: number;
};

type LineImpactRow = {
  line: string;
  previousUtilizationPct: number;
  newUtilizationPct: number;
  remainingCapacityHrs: number;
  oeePct: number;
  downtimeConflict: string;
  idleTimeHrs: number;
  changeoverTimeHrs: number;
  status: string;
};

type InventoryRiskRow = {
  family: string;
  plannedQuantityK: number;
  demandRequiredK: number;
  inventoryAfterPlan: string;
  minMaxStatus: string;
  shelfLifeRisk: string;
  eoRisk: string;
  aiDecision: string;
};

type WoMovementRow = {
  wo: string;
  previousSlot: string;
  newSlot: string;
  reason: string;
  impact: string;
};

type OpenExceptionRow = {
  exception: string;
  impact: string;
  recommendedAction: string;
};

type ChangeoverMetricRow = {
  metric: string;
  previous: string;
  current: string;
  impact: string;
  tone: 'positive' | 'negative' | 'neutral';
};

type PlanningIteration = {
  iterationNumber: number;
  totalIterations: number;
  strategy: string;
  status: string;
  lastUpdated: string;
  summaryChanges: string[];
  previousMetrics: IterationMetrics;
  currentMetrics: IterationMetrics;
  previousIdleBreakdown: IdleReasonBreakdown;
  currentIdleBreakdown: IdleReasonBreakdown;
  efficiencyExplanation: string;
  lineImpact: LineImpactRow[];
  changeoverImpact: ChangeoverMetricRow[];
  changeoverExplanation: string;
  inventoryRisk: InventoryRiskRow[];
  inventoryExplanation: string;
  woMovements: WoMovementRow[];
  openExceptions: OpenExceptionRow[];
  affectedWos: number;
  openConstraintCount: number;
};

type AuditSnapshot = {
  scheduledWos: number;
  unscheduledWos: number;
  overloadHours: number;
  totalChangeoverHrs: number;
  totalIdleTimeHrs: number;
  eoRiskItems: number;
};

type DecisionAuditEntry = {
  user: string;
  timestamp: string;
  iterationNumber: number;
  optimizationStrategy: string;
  selectedAction: string;
  beforeValues: AuditSnapshot;
  afterValues: AuditSnapshot;
  comment?: string;
};

type CopilotAction = {
  id: string;
  title: string;
  body: string;
  targetStepIndex: number;
  progress: number;
};

type CopilotRunState = {
  isRunning: boolean;
  currentActionIndex: number;
  pendingActions: CopilotAction[];
  baselineIteration: PlanningIteration | null;
  targetIterationIndex: number;
  requestText: string;
};

const PROGRESS_STEPS: ProgressStep[] = [
  {label: 'Planning\nHorizon'},
  {label: 'Load\nQueue'},
  {label: 'Filter\nQueue'},
  {label: 'Select\nWOs'},
  {label: 'Planning\nStrategy'},
  {label: 'Generate\nSchedule'},
  {label: 'Draft\nSchedule'},
  {label: 'Review\nExceptions'},
  {label: 'Resolve\nExceptions'},
  {label: 'Recalculate\nImpact'},
  {label: 'Review\nSchedule'},
  {label: 'Final\nSummary'},
  {label: 'Confirm\nSchedule'},
  {label: 'Save\n& Log'},
  {label: 'Publish\nExecution'},
  {label: 'Done'},
];

const BASE_SCHEDULE_ROWS: ScheduleRow[] = [
  {woNumber: 'WO-100310', product: 'FG-3301 — Sterile Solution 500ml', line: 'Line 10', shift: 'Day', priority: 'Critical', priorityColor: '#B42318', status: 'Scheduled', statusColor: '#027A48', statusBg: '#ECFDF3', durationHrs: 8},
  {woNumber: 'WO-200410', product: 'FG-5502 — Injectable 250ml', line: 'Line 20', shift: 'Night', priority: 'High', priorityColor: '#B54708', status: 'Scheduled', statusColor: '#027A48', statusBg: '#ECFDF3', durationHrs: 12},
  {woNumber: 'WO-300110', product: 'FG-7740 — Oral Solution 1L', line: 'Line 30', shift: 'Day', priority: 'Medium', priorityColor: '#344054', status: 'Scheduled', statusColor: '#027A48', statusBg: '#ECFDF3', durationHrs: 6},
  {woNumber: 'WO-600210', product: 'FG-1102 — Tablet Coating 200mg', line: 'Line 10', shift: 'Night', priority: 'High', priorityColor: '#B54708', status: 'Scheduled', statusColor: '#027A48', statusBg: '#ECFDF3', durationHrs: 10},
  {woNumber: 'WO-700310', product: 'FG-4401 — Powder Blend 5kg', line: 'Line 40', shift: 'Day', priority: 'Medium', priorityColor: '#344054', status: 'Scheduled', statusColor: '#027A48', statusBg: '#ECFDF3', durationHrs: 7},
  {woNumber: 'WO-400210', product: 'FG-2201 — Cream Base 200g', line: 'Line 40', shift: 'Day', priority: 'Critical', priorityColor: '#B42318', status: 'Blocked', statusColor: '#B42318', statusBg: '#FEF2F2', durationHrs: 9},
  {woNumber: 'WO-500110', product: 'FG-8810 — Gel 100ml', line: '—', shift: '—', priority: 'High', priorityColor: '#B54708', status: 'Unscheduled', statusColor: '#B54708', statusBg: '#FFFBEB', durationHrs: 5},
];

const BASE_EXCEPTIONS: ExceptionRow[] = [
  {id: 'ex-1', woNumber: 'WO-400210', type: 'Material Shortage', severity: 'Critical', description: 'RM-301656 not available until May 18. WO requires material on May 16.', resolved: false},
  {id: 'ex-2', woNumber: 'WO-500110', type: 'Quality Hold', severity: 'High', description: 'Batch BR-4408 pending quality release. Expected clearance May 17.', resolved: false},
  {id: 'ex-3', woNumber: 'WO-200410', type: 'Capacity Conflict', severity: 'Medium', description: 'Line 20 night shift at 103% utilization. 2.5 hrs overlap with maintenance window.', resolved: false},
  {id: 'ex-4', woNumber: 'General', type: 'Sterilization Risk', severity: 'High', description: '3 batches may exceed dwell-time threshold if production delayed beyond Day 2.', resolved: false},
];

const BASE_QUEUE_ROWS: QueueRow[] = [
  {woNumber: 'WO-100310', product: 'FG-3301 — Sterile Solution 500ml', priority: 'Critical', priorityColor: '#B42318', dueDate: 'May 16', readiness: 'Ready', blocker: '—', eligibleLine: 'Line 10, Line 20'},
  {woNumber: 'WO-200410', product: 'FG-5502 — Injectable 250ml', priority: 'High', priorityColor: '#B54708', dueDate: 'May 17', readiness: 'Warning', blocker: 'Quality pending', eligibleLine: 'Line 20, Line 40'},
  {woNumber: 'WO-300110', product: 'FG-7740 — Oral Solution 1L', priority: 'Medium', priorityColor: '#344054', dueDate: 'May 18', readiness: 'Ready', blocker: '—', eligibleLine: 'Line 30'},
  {woNumber: 'WO-400210', product: 'FG-2201 — Cream Base 200g', priority: 'Critical', priorityColor: '#B42318', dueDate: 'May 16', readiness: 'Blocked', blocker: 'RM-301656 shortage', eligibleLine: 'Line 10'},
  {woNumber: 'WO-500110', product: 'FG-8810 — Gel 100ml', priority: 'High', priorityColor: '#B54708', dueDate: 'May 17', readiness: 'Warning', blocker: 'Quality hold', eligibleLine: 'Line 10, Line 30'},
  {woNumber: 'WO-600210', product: 'FG-1102 — Tablet Coating 200mg', priority: 'High', priorityColor: '#B54708', dueDate: 'May 18', readiness: 'Ready', blocker: '—', eligibleLine: 'Line 10, Line 40'},
  {woNumber: 'WO-700310', product: 'FG-4401 — Powder Blend 5kg', priority: 'Medium', priorityColor: '#344054', dueDate: 'May 19', readiness: 'Ready', blocker: '—', eligibleLine: 'Line 40'},
];

const ITERATION_OPTIMIZATION_OPTIONS = [
  'Prioritize due dates',
  'Minimize changeover',
  'Reduce idle time',
  'Avoid overtime',
  'Reduce E&O risk',
  'Maximize utilization',
  'Protect high-priority WOs',
  'Lock current accepted sequence and optimize the rest',
];

const AI_ITERATIONS: PlanningIteration[] = [
  {
    iterationNumber: 1,
    totalIterations: 5,
    strategy: 'Stabilize due dates and recover line overloads',
    status: 'Draft generated',
    lastUpdated: '10:18',
    summaryChanges: [
      '8 WOs resequenced',
      '1 WO moved to alternate line',
      '4 WOs kept unscheduled due to material and QA blockers',
      'Changeover reduced by 1.5 hrs',
      'Idle time reduced by 4.0 hrs',
      'Capacity overload reduced but still open on Line 20',
      'E&O risk reduced for Family B',
    ],
    previousMetrics: {
      scheduledWos: 42,
      unscheduledWos: 12,
      delayedWos: 8,
      averageUtilizationPct: 89,
      remainingCapacityHrs: 86,
      overloadedLines: 2,
      overloadHours: 6,
      productiveTimeHrs: 126,
      effectiveUtilizationPct: 84,
      totalChangeoverHrs: 18.5,
      changeovers: 12,
      longChangeovers: 4,
      totalIdleTimeHrs: 22,
      idleMaterialHrs: 8,
      idleQualityHrs: 4,
      idleNoEligibleHrs: 10,
      oeeAdjustedFeasibilityPct: 87,
      downtimeConflicts: 3,
      eoRiskItems: 5,
      atRiskQuantityK: 310,
    },
    currentMetrics: {
      scheduledWos: 44,
      unscheduledWos: 10,
      delayedWos: 7,
      averageUtilizationPct: 91,
      remainingCapacityHrs: 71,
      overloadedLines: 1,
      overloadHours: 3.5,
      productiveTimeHrs: 130.5,
      effectiveUtilizationPct: 87,
      totalChangeoverHrs: 17,
      changeovers: 11,
      longChangeovers: 3,
      totalIdleTimeHrs: 18,
      idleMaterialHrs: 6,
      idleQualityHrs: 3.5,
      idleNoEligibleHrs: 8.5,
      oeeAdjustedFeasibilityPct: 90,
      downtimeConflicts: 2,
      eoRiskItems: 4,
      atRiskQuantityK: 250,
    },
    previousIdleBreakdown: {
      plannedIdleHrs: 2,
      maintenanceDowntimeHrs: 3,
      materialShortageHrs: 8,
      qualityHoldHrs: 4,
      noEligibleWoHrs: 10,
      laborGapHrs: 2,
      warehouseReadinessHrs: 1,
      sterilizationConstraintHrs: 1,
    },
    currentIdleBreakdown: {
      plannedIdleHrs: 2,
      maintenanceDowntimeHrs: 2.5,
      materialShortageHrs: 6,
      qualityHoldHrs: 3.5,
      noEligibleWoHrs: 8.5,
      laborGapHrs: 1.5,
      warehouseReadinessHrs: 1,
      sterilizationConstraintHrs: 0.8,
    },
    efficiencyExplanation: 'AI grouped compatible sterile and coating orders first, then shifted one WO away from the overloaded night slot to reduce both changeover exposure and avoidable idle gaps.',
    lineImpact: [
      {line: 'Line 10', previousUtilizationPct: 112, newUtilizationPct: 101, remainingCapacityHrs: 2, oeePct: 82, downtimeConflict: 'None', idleTimeHrs: 3.5, changeoverTimeHrs: 5, status: 'At risk'},
      {line: 'Line 20', previousUtilizationPct: 103, newUtilizationPct: 99, remainingCapacityHrs: 1, oeePct: 79, downtimeConflict: '1 overlap left', idleTimeHrs: 4.5, changeoverTimeHrs: 4.5, status: 'Review'},
      {line: 'Line 30', previousUtilizationPct: 74, newUtilizationPct: 82, remainingCapacityHrs: 18, oeePct: 78, downtimeConflict: 'None', idleTimeHrs: 5, changeoverTimeHrs: 3.5, status: 'Feasible'},
      {line: 'Line 40', previousUtilizationPct: 83, newUtilizationPct: 87, remainingCapacityHrs: 12, oeePct: 81, downtimeConflict: 'None', idleTimeHrs: 5, changeoverTimeHrs: 4, status: 'Feasible'},
    ],
    changeoverImpact: [
      {metric: 'Total changeover hours', previous: '18.5 hrs', current: '17.0 hrs', impact: '-1.5 hrs', tone: 'positive'},
      {metric: 'Number of changeovers', previous: '12', current: '11', impact: '-1', tone: 'positive'},
      {metric: 'Long changeovers', previous: '4', current: '3', impact: '-1', tone: 'positive'},
      {metric: 'Product family switches', previous: '11', current: '9', impact: 'Reduced', tone: 'positive'},
      {metric: 'Campaign grouping score', previous: '72%', current: '79%', impact: 'Improved', tone: 'positive'},
    ],
    changeoverExplanation: 'AI merged adjacent Family A runs on Line 10 before shifting the remaining Family B order, cutting one major setup while still holding due-date coverage.',
    inventoryRisk: [
      {family: 'Family A', plannedQuantityK: 520, demandRequiredK: 510, inventoryAfterPlan: 'Within max', minMaxStatus: 'Within target', shelfLifeRisk: 'Low', eoRisk: 'Low', aiDecision: 'Keep'},
      {family: 'Family B', plannedQuantityK: 610, demandRequiredK: 430, inventoryAfterPlan: 'Above max', minMaxStatus: 'Above max', shelfLifeRisk: 'Medium', eoRisk: 'High', aiDecision: 'Reduced batch'},
      {family: 'Family C', plannedQuantityK: 300, demandRequiredK: 310, inventoryAfterPlan: 'Within target', minMaxStatus: 'Within target', shelfLifeRisk: 'Low', eoRisk: 'Low', aiDecision: 'Pull forward'},
    ],
    inventoryExplanation: 'AI trimmed one Family B campaign because a full batch sequence would still leave excess inventory above the max target.',
    woMovements: [
      {wo: 'WO-350021', previousSlot: 'Line 10 Mon AM', newSlot: 'Line 10 Tue AM', reason: 'Material available Tuesday', impact: 'Removes blocker'},
      {wo: 'WO-350087', previousSlot: 'Line 20 Wed PM', newSlot: 'Line 40 Wed AM', reason: 'Alternate line available', impact: 'Cuts overload by 1.5 hrs'},
      {wo: 'WO-350145', previousSlot: 'Unscheduled', newSlot: 'Line 30 Thu AM', reason: 'Capacity window opened', impact: 'Adds commitment coverage'},
    ],
    openExceptions: [
      {exception: 'RM-301656 still not confirmed', impact: '2 WOs at risk', recommendedAction: 'Request material update'},
      {exception: 'Quality release pending', impact: '1 WO warning', recommendedAction: 'Confirm QA release date'},
      {exception: 'Sterilization slot not confirmed', impact: '3 batches', recommendedAction: 'Reserve slot'},
    ],
    affectedWos: 9,
    openConstraintCount: 3,
  },
  {
    iterationNumber: 2,
    totalIterations: 5,
    strategy: 'Minimize changeover and absorb available capacity windows',
    status: 'Review required',
    lastUpdated: '10:27',
    summaryChanges: [
      '11 WOs resequenced',
      '2 WOs moved to alternate line',
      '3 WOs kept unscheduled due to confirmed blockers',
      'Changeover reduced by 3.0 hrs',
      'Idle time reduced by 8.5 hrs',
      'Capacity overload removed from Line 20',
      'E&O risk reduced for Family B and Family D',
    ],
    previousMetrics: {
      scheduledWos: 44,
      unscheduledWos: 10,
      delayedWos: 7,
      averageUtilizationPct: 91,
      remainingCapacityHrs: 71,
      overloadedLines: 1,
      overloadHours: 3.5,
      productiveTimeHrs: 130.5,
      effectiveUtilizationPct: 87,
      totalChangeoverHrs: 17,
      changeovers: 11,
      longChangeovers: 3,
      totalIdleTimeHrs: 18,
      idleMaterialHrs: 6,
      idleQualityHrs: 3.5,
      idleNoEligibleHrs: 8.5,
      oeeAdjustedFeasibilityPct: 90,
      downtimeConflicts: 2,
      eoRiskItems: 4,
      atRiskQuantityK: 250,
    },
    currentMetrics: {
      scheduledWos: 46,
      unscheduledWos: 8,
      delayedWos: 5,
      averageUtilizationPct: 93,
      remainingCapacityHrs: 55,
      overloadedLines: 0,
      overloadHours: 0,
      productiveTimeHrs: 134,
      effectiveUtilizationPct: 90,
      totalChangeoverHrs: 14,
      changeovers: 9,
      longChangeovers: 2,
      totalIdleTimeHrs: 13.5,
      idleMaterialHrs: 3.5,
      idleQualityHrs: 2.5,
      idleNoEligibleHrs: 7.5,
      oeeAdjustedFeasibilityPct: 93,
      downtimeConflicts: 1,
      eoRiskItems: 3,
      atRiskQuantityK: 180,
    },
    previousIdleBreakdown: {
      plannedIdleHrs: 2,
      maintenanceDowntimeHrs: 2.5,
      materialShortageHrs: 6,
      qualityHoldHrs: 3.5,
      noEligibleWoHrs: 8.5,
      laborGapHrs: 1.5,
      warehouseReadinessHrs: 1,
      sterilizationConstraintHrs: 0.8,
    },
    currentIdleBreakdown: {
      plannedIdleHrs: 1.8,
      maintenanceDowntimeHrs: 2.2,
      materialShortageHrs: 3.5,
      qualityHoldHrs: 2.5,
      noEligibleWoHrs: 7.5,
      laborGapHrs: 1.1,
      warehouseReadinessHrs: 0.8,
      sterilizationConstraintHrs: 0.6,
    },
    efficiencyExplanation: 'AI filled stable windows on Line 30 and Line 40, then re-sequenced remaining demand to eliminate overload without pushing work into maintenance blocks.',
    lineImpact: [
      {line: 'Line 10', previousUtilizationPct: 101, newUtilizationPct: 98, remainingCapacityHrs: 5, oeePct: 82, downtimeConflict: 'None', idleTimeHrs: 3, changeoverTimeHrs: 4.5, status: 'Feasible'},
      {line: 'Line 20', previousUtilizationPct: 99, newUtilizationPct: 94, remainingCapacityHrs: 7, oeePct: 80, downtimeConflict: 'Removed', idleTimeHrs: 3.5, changeoverTimeHrs: 3.5, status: 'Feasible'},
      {line: 'Line 30', previousUtilizationPct: 82, newUtilizationPct: 88, remainingCapacityHrs: 16, oeePct: 79, downtimeConflict: 'None', idleTimeHrs: 4, changeoverTimeHrs: 3, status: 'Feasible'},
      {line: 'Line 40', previousUtilizationPct: 87, newUtilizationPct: 92, remainingCapacityHrs: 11, oeePct: 82, downtimeConflict: 'None', idleTimeHrs: 3, changeoverTimeHrs: 3, status: 'Feasible'},
    ],
    changeoverImpact: [
      {metric: 'Total changeover hours', previous: '17.0 hrs', current: '14.0 hrs', impact: '-3.0 hrs', tone: 'positive'},
      {metric: 'Number of changeovers', previous: '11', current: '9', impact: '-2', tone: 'positive'},
      {metric: 'Long changeovers', previous: '3', current: '2', impact: '-1', tone: 'positive'},
      {metric: 'Product family switches', previous: '9', current: '7', impact: 'Reduced', tone: 'positive'},
      {metric: 'Campaign grouping score', previous: '79%', current: '85%', impact: 'Improved', tone: 'positive'},
    ],
    changeoverExplanation: 'AI grouped Family A and Family C campaigns more aggressively after confirming open windows on Line 40.',
    inventoryRisk: [
      {family: 'Family A', plannedQuantityK: 520, demandRequiredK: 510, inventoryAfterPlan: 'Within max', minMaxStatus: 'Within target', shelfLifeRisk: 'Low', eoRisk: 'Low', aiDecision: 'Keep'},
      {family: 'Family B', plannedQuantityK: 560, demandRequiredK: 430, inventoryAfterPlan: 'Near max', minMaxStatus: 'Monitor max', shelfLifeRisk: 'Medium', eoRisk: 'Medium', aiDecision: 'Reduced batch'},
      {family: 'Family C', plannedQuantityK: 320, demandRequiredK: 310, inventoryAfterPlan: 'Within target', minMaxStatus: 'Within target', shelfLifeRisk: 'Low', eoRisk: 'Low', aiDecision: 'Pull forward'},
    ],
    inventoryExplanation: 'AI still protected Family B against overproduction while safely pulling Family C to absorb freed capacity.',
    woMovements: [
      {wo: 'WO-350021', previousSlot: 'Line 10 Tue AM', newSlot: 'Line 10 Tue PM', reason: 'Campaign alignment', impact: 'Saves 0.5 hrs'},
      {wo: 'WO-350087', previousSlot: 'Line 40 Wed AM', newSlot: 'Line 30 Wed AM', reason: 'Lower setup path', impact: 'Saves 1.0 hr'},
      {wo: 'WO-350201', previousSlot: 'Unscheduled', newSlot: 'Line 40 Thu PM', reason: 'Recovered capacity', impact: 'Improves coverage'},
    ],
    openExceptions: [
      {exception: 'RM-301656 ETA still pending', impact: '1 WO at risk', recommendedAction: 'Escalate supplier confirmation'},
      {exception: 'Quality release pending', impact: '1 WO warning', recommendedAction: 'Confirm QA release date'},
      {exception: 'Warehouse readiness check pending', impact: '1 WO warning', recommendedAction: 'Validate outbound staging'},
    ],
    affectedWos: 13,
    openConstraintCount: 3,
  },
  {
    iterationNumber: 3,
    totalIterations: 5,
    strategy: 'Minimize changeover + protect due dates',
    status: 'Review required',
    lastUpdated: '10:42',
    summaryChanges: [
      '14 WOs resequenced',
      '3 WOs moved to alternate line',
      '2 WOs kept unscheduled due to material blockers',
      'Changeover reduced by 4.5 hrs',
      'Idle time reduced by 12.5 hrs',
      'Capacity overload removed from Line 10',
      'E&O risk reduced for Family B',
    ],
    previousMetrics: {
      scheduledWos: 42,
      unscheduledWos: 12,
      delayedWos: 8,
      averageUtilizationPct: 89,
      remainingCapacityHrs: 86,
      overloadedLines: 2,
      overloadHours: 6,
      productiveTimeHrs: 126,
      effectiveUtilizationPct: 84,
      totalChangeoverHrs: 18.5,
      changeovers: 12,
      longChangeovers: 4,
      totalIdleTimeHrs: 22,
      idleMaterialHrs: 8,
      idleQualityHrs: 4,
      idleNoEligibleHrs: 10,
      oeeAdjustedFeasibilityPct: 87,
      downtimeConflicts: 3,
      eoRiskItems: 5,
      atRiskQuantityK: 310,
    },
    currentMetrics: {
      scheduledWos: 48,
      unscheduledWos: 6,
      delayedWos: 3,
      averageUtilizationPct: 94,
      remainingCapacityHrs: 42,
      overloadedLines: 0,
      overloadHours: 0,
      productiveTimeHrs: 137,
      effectiveUtilizationPct: 92,
      totalChangeoverHrs: 14,
      changeovers: 8,
      longChangeovers: 1,
      totalIdleTimeHrs: 9.5,
      idleMaterialHrs: 2,
      idleQualityHrs: 1.5,
      idleNoEligibleHrs: 6,
      oeeAdjustedFeasibilityPct: 96,
      downtimeConflicts: 0,
      eoRiskItems: 2,
      atRiskQuantityK: 95,
    },
    previousIdleBreakdown: {
      plannedIdleHrs: 2,
      maintenanceDowntimeHrs: 3,
      materialShortageHrs: 8,
      qualityHoldHrs: 4,
      noEligibleWoHrs: 10,
      laborGapHrs: 2,
      warehouseReadinessHrs: 1,
      sterilizationConstraintHrs: 1,
    },
    currentIdleBreakdown: {
      plannedIdleHrs: 1.5,
      maintenanceDowntimeHrs: 1.5,
      materialShortageHrs: 2,
      qualityHoldHrs: 1.5,
      noEligibleWoHrs: 6,
      laborGapHrs: 0.7,
      warehouseReadinessHrs: 0.5,
      sterilizationConstraintHrs: 0.4,
    },
    efficiencyExplanation: 'AI reduced changeover by grouping compatible product families and reduced idle time by filling available capacity windows without scheduling into downtime or material-blocked periods.',
    lineImpact: [
      {line: 'Line 10', previousUtilizationPct: 112, newUtilizationPct: 96, remainingCapacityHrs: 8, oeePct: 82, downtimeConflict: 'None', idleTimeHrs: 2.5, changeoverTimeHrs: 4, status: 'Feasible'},
      {line: 'Line 07', previousUtilizationPct: 74, newUtilizationPct: 88, remainingCapacityHrs: 16, oeePct: 79, downtimeConflict: 'None', idleTimeHrs: 3, changeoverTimeHrs: 5.5, status: 'Feasible'},
      {line: 'Line 03', previousUtilizationPct: 103, newUtilizationPct: 91, remainingCapacityHrs: 12, oeePct: 85, downtimeConflict: 'Removed', idleTimeHrs: 4, changeoverTimeHrs: 4.5, status: 'Feasible'},
    ],
    changeoverImpact: [
      {metric: 'Total changeover hours', previous: '18.5 hrs', current: '14.0 hrs', impact: '-4.5 hrs', tone: 'positive'},
      {metric: 'Number of changeovers', previous: '12', current: '8', impact: '-4', tone: 'positive'},
      {metric: 'Long changeovers', previous: '4', current: '1', impact: '-3', tone: 'positive'},
      {metric: 'Product family switches', previous: '11', current: '6', impact: 'Reduced', tone: 'positive'},
      {metric: 'Campaign grouping score', previous: '72%', current: '89%', impact: 'Improved', tone: 'positive'},
    ],
    changeoverExplanation: 'AI grouped Family A WOs before Family B on Line 10, reducing two long changeovers while keeping due dates protected.',
    inventoryRisk: [
      {family: 'Family A', plannedQuantityK: 520, demandRequiredK: 510, inventoryAfterPlan: 'Within max', minMaxStatus: 'Within target', shelfLifeRisk: 'Low', eoRisk: 'Low', aiDecision: 'Keep'},
      {family: 'Family B', plannedQuantityK: 680, demandRequiredK: 430, inventoryAfterPlan: 'Above max', minMaxStatus: 'Above max', shelfLifeRisk: 'Medium', eoRisk: 'High', aiDecision: 'Reduced batch'},
      {family: 'Family C', plannedQuantityK: 300, demandRequiredK: 310, inventoryAfterPlan: 'Within target', minMaxStatus: 'Within target', shelfLifeRisk: 'Low', eoRisk: 'Low', aiDecision: 'Pull forward'},
    ],
    inventoryExplanation: 'AI avoided grouping all Family B WOs into one campaign because it would exceed the max inventory target and increase E&O risk.',
    woMovements: [
      {wo: 'WO-350021', previousSlot: 'Line 10 Mon AM', newSlot: 'Line 10 Tue AM', reason: 'Material available Tuesday', impact: 'Removes blocker'},
      {wo: 'WO-350087', previousSlot: 'Line 07 Wed PM', newSlot: 'Line 03 Wed AM', reason: 'Lower changeover', impact: 'Saves 1.5 hrs'},
      {wo: 'WO-350145', previousSlot: 'Unscheduled', newSlot: 'Line 05 Thu AM', reason: 'Capacity available', impact: 'Adds commitment coverage'},
    ],
    openExceptions: [
      {exception: 'RM-301656 still not confirmed', impact: '2 WOs at risk', recommendedAction: 'Request material update'},
      {exception: 'Quality release pending', impact: '1 WO warning', recommendedAction: 'Confirm QA release date'},
      {exception: 'Sterilization slot not confirmed', impact: '3 batches', recommendedAction: 'Reserve slot'},
    ],
    affectedWos: 17,
    openConstraintCount: 3,
  },
  {
    iterationNumber: 4,
    totalIterations: 5,
    strategy: 'Reduce idle time and protect high-priority WOs',
    status: 'Awaiting planner decision',
    lastUpdated: '10:55',
    summaryChanges: [
      '16 WOs resequenced',
      '4 WOs moved to alternate line',
      '2 WOs kept unscheduled due to hard constraints',
      'Changeover reduced by 4.9 hrs',
      'Idle time reduced by 13.8 hrs',
      'No overloads remain across constrained lines',
      'High-priority WO due-date coverage increased',
    ],
    previousMetrics: {
      scheduledWos: 48,
      unscheduledWos: 6,
      delayedWos: 3,
      averageUtilizationPct: 94,
      remainingCapacityHrs: 42,
      overloadedLines: 0,
      overloadHours: 0,
      productiveTimeHrs: 137,
      effectiveUtilizationPct: 92,
      totalChangeoverHrs: 14,
      changeovers: 8,
      longChangeovers: 1,
      totalIdleTimeHrs: 9.5,
      idleMaterialHrs: 2,
      idleQualityHrs: 1.5,
      idleNoEligibleHrs: 6,
      oeeAdjustedFeasibilityPct: 96,
      downtimeConflicts: 0,
      eoRiskItems: 2,
      atRiskQuantityK: 95,
    },
    currentMetrics: {
      scheduledWos: 49,
      unscheduledWos: 5,
      delayedWos: 2,
      averageUtilizationPct: 95,
      remainingCapacityHrs: 38,
      overloadedLines: 0,
      overloadHours: 0,
      productiveTimeHrs: 138.2,
      effectiveUtilizationPct: 93,
      totalChangeoverHrs: 13.6,
      changeovers: 8,
      longChangeovers: 1,
      totalIdleTimeHrs: 8.2,
      idleMaterialHrs: 1.8,
      idleQualityHrs: 1.2,
      idleNoEligibleHrs: 4.5,
      oeeAdjustedFeasibilityPct: 97,
      downtimeConflicts: 0,
      eoRiskItems: 2,
      atRiskQuantityK: 88,
    },
    previousIdleBreakdown: {
      plannedIdleHrs: 1.5,
      maintenanceDowntimeHrs: 1.5,
      materialShortageHrs: 2,
      qualityHoldHrs: 1.5,
      noEligibleWoHrs: 6,
      laborGapHrs: 0.7,
      warehouseReadinessHrs: 0.5,
      sterilizationConstraintHrs: 0.4,
    },
    currentIdleBreakdown: {
      plannedIdleHrs: 1.5,
      maintenanceDowntimeHrs: 1.4,
      materialShortageHrs: 1.8,
      qualityHoldHrs: 1.2,
      noEligibleWoHrs: 4.5,
      laborGapHrs: 0.6,
      warehouseReadinessHrs: 0.4,
      sterilizationConstraintHrs: 0.3,
    },
    efficiencyExplanation: 'AI prioritized filling idle windows around maintenance while protecting already accepted high-priority sequence blocks.',
    lineImpact: [
      {line: 'Line 10', previousUtilizationPct: 96, newUtilizationPct: 97, remainingCapacityHrs: 6, oeePct: 83, downtimeConflict: 'None', idleTimeHrs: 2.2, changeoverTimeHrs: 3.8, status: 'Feasible'},
      {line: 'Line 07', previousUtilizationPct: 88, newUtilizationPct: 90, remainingCapacityHrs: 14, oeePct: 80, downtimeConflict: 'None', idleTimeHrs: 2.4, changeoverTimeHrs: 5.1, status: 'Feasible'},
      {line: 'Line 03', previousUtilizationPct: 91, newUtilizationPct: 93, remainingCapacityHrs: 10, oeePct: 85, downtimeConflict: 'None', idleTimeHrs: 3.6, changeoverTimeHrs: 4.1, status: 'Feasible'},
    ],
    changeoverImpact: [
      {metric: 'Total changeover hours', previous: '14.0 hrs', current: '13.6 hrs', impact: '-0.4 hrs', tone: 'positive'},
      {metric: 'Number of changeovers', previous: '8', current: '8', impact: 'Flat', tone: 'neutral'},
      {metric: 'Long changeovers', previous: '1', current: '1', impact: 'Flat', tone: 'neutral'},
      {metric: 'Product family switches', previous: '6', current: '6', impact: 'Stable', tone: 'neutral'},
      {metric: 'Campaign grouping score', previous: '89%', current: '90%', impact: 'Improved', tone: 'positive'},
    ],
    changeoverExplanation: 'This pass focused more on filling idle windows than aggressive resequencing, so changeover gains are smaller but due-date protection improved.',
    inventoryRisk: [
      {family: 'Family A', plannedQuantityK: 520, demandRequiredK: 510, inventoryAfterPlan: 'Within max', minMaxStatus: 'Within target', shelfLifeRisk: 'Low', eoRisk: 'Low', aiDecision: 'Keep'},
      {family: 'Family B', plannedQuantityK: 655, demandRequiredK: 430, inventoryAfterPlan: 'Near max', minMaxStatus: 'Monitor max', shelfLifeRisk: 'Medium', eoRisk: 'Medium', aiDecision: 'Cap campaign'},
      {family: 'Family C', plannedQuantityK: 315, demandRequiredK: 310, inventoryAfterPlan: 'Within target', minMaxStatus: 'Within target', shelfLifeRisk: 'Low', eoRisk: 'Low', aiDecision: 'Keep'},
    ],
    inventoryExplanation: 'AI preserved the Family B cap while improving service on high-priority WOs with minimal additional risk.',
    woMovements: [
      {wo: 'WO-350198', previousSlot: 'Line 07 Thu PM', newSlot: 'Line 10 Thu AM', reason: 'Protect priority due date', impact: 'Avoids delay'},
      {wo: 'WO-350201', previousSlot: 'Line 40 Thu PM', newSlot: 'Line 07 Thu PM', reason: 'Accepted sequence lock respected', impact: 'Maintains grouping'},
      {wo: 'WO-350240', previousSlot: 'Unscheduled', newSlot: 'Line 03 Fri AM', reason: 'Idle window recovered', impact: 'Improves fill rate'},
    ],
    openExceptions: [
      {exception: 'Material ETA still open for RM-301656', impact: '1 WO at risk', recommendedAction: 'Request expedited confirmation'},
      {exception: 'Sterilization slot pending approval', impact: '2 batches', recommendedAction: 'Reserve slot'},
    ],
    affectedWos: 19,
    openConstraintCount: 2,
  },
  {
    iterationNumber: 5,
    totalIterations: 5,
    strategy: 'Balanced final proposal',
    status: 'Ready for acceptance',
    lastUpdated: '11:06',
    summaryChanges: [
      '17 WOs resequenced',
      '4 WOs moved to alternate line',
      '2 WOs kept unscheduled due to external blockers',
      'Changeover reduced by 5.2 hrs',
      'Idle time reduced by 14.4 hrs',
      'No overloads or downtime conflicts remain',
      'E&O risk held within monitored thresholds',
    ],
    previousMetrics: {
      scheduledWos: 49,
      unscheduledWos: 5,
      delayedWos: 2,
      averageUtilizationPct: 95,
      remainingCapacityHrs: 38,
      overloadedLines: 0,
      overloadHours: 0,
      productiveTimeHrs: 138.2,
      effectiveUtilizationPct: 93,
      totalChangeoverHrs: 13.6,
      changeovers: 8,
      longChangeovers: 1,
      totalIdleTimeHrs: 8.2,
      idleMaterialHrs: 1.8,
      idleQualityHrs: 1.2,
      idleNoEligibleHrs: 4.5,
      oeeAdjustedFeasibilityPct: 97,
      downtimeConflicts: 0,
      eoRiskItems: 2,
      atRiskQuantityK: 88,
    },
    currentMetrics: {
      scheduledWos: 50,
      unscheduledWos: 4,
      delayedWos: 1,
      averageUtilizationPct: 95,
      remainingCapacityHrs: 36,
      overloadedLines: 0,
      overloadHours: 0,
      productiveTimeHrs: 139,
      effectiveUtilizationPct: 94,
      totalChangeoverHrs: 13.3,
      changeovers: 7,
      longChangeovers: 1,
      totalIdleTimeHrs: 7.6,
      idleMaterialHrs: 1.5,
      idleQualityHrs: 1,
      idleNoEligibleHrs: 4,
      oeeAdjustedFeasibilityPct: 98,
      downtimeConflicts: 0,
      eoRiskItems: 1,
      atRiskQuantityK: 72,
    },
    previousIdleBreakdown: {
      plannedIdleHrs: 1.5,
      maintenanceDowntimeHrs: 1.4,
      materialShortageHrs: 1.8,
      qualityHoldHrs: 1.2,
      noEligibleWoHrs: 4.5,
      laborGapHrs: 0.6,
      warehouseReadinessHrs: 0.4,
      sterilizationConstraintHrs: 0.3,
    },
    currentIdleBreakdown: {
      plannedIdleHrs: 1.4,
      maintenanceDowntimeHrs: 1.3,
      materialShortageHrs: 1.5,
      qualityHoldHrs: 1,
      noEligibleWoHrs: 4,
      laborGapHrs: 0.5,
      warehouseReadinessHrs: 0.3,
      sterilizationConstraintHrs: 0.2,
    },
    efficiencyExplanation: 'The final pass keeps the accepted sequencing backbone and uses only low-risk pulls to improve feasibility, utilization, and open-risk coverage.',
    lineImpact: [
      {line: 'Line 10', previousUtilizationPct: 97, newUtilizationPct: 97, remainingCapacityHrs: 6, oeePct: 83, downtimeConflict: 'None', idleTimeHrs: 2, changeoverTimeHrs: 3.7, status: 'Feasible'},
      {line: 'Line 07', previousUtilizationPct: 90, newUtilizationPct: 91, remainingCapacityHrs: 13, oeePct: 80, downtimeConflict: 'None', idleTimeHrs: 2.2, changeoverTimeHrs: 4.9, status: 'Feasible'},
      {line: 'Line 03', previousUtilizationPct: 93, newUtilizationPct: 94, remainingCapacityHrs: 9, oeePct: 86, downtimeConflict: 'None', idleTimeHrs: 3.4, changeoverTimeHrs: 3.9, status: 'Feasible'},
    ],
    changeoverImpact: [
      {metric: 'Total changeover hours', previous: '13.6 hrs', current: '13.3 hrs', impact: '-0.3 hrs', tone: 'positive'},
      {metric: 'Number of changeovers', previous: '8', current: '7', impact: '-1', tone: 'positive'},
      {metric: 'Long changeovers', previous: '1', current: '1', impact: 'Flat', tone: 'neutral'},
      {metric: 'Product family switches', previous: '6', current: '5', impact: 'Reduced', tone: 'positive'},
      {metric: 'Campaign grouping score', previous: '90%', current: '92%', impact: 'Improved', tone: 'positive'},
    ],
    changeoverExplanation: 'The final pass removes one residual family switch while preserving the planner-reviewed sequence.',
    inventoryRisk: [
      {family: 'Family A', plannedQuantityK: 520, demandRequiredK: 510, inventoryAfterPlan: 'Within max', minMaxStatus: 'Within target', shelfLifeRisk: 'Low', eoRisk: 'Low', aiDecision: 'Keep'},
      {family: 'Family B', plannedQuantityK: 640, demandRequiredK: 430, inventoryAfterPlan: 'Near max', minMaxStatus: 'Monitor max', shelfLifeRisk: 'Medium', eoRisk: 'Medium', aiDecision: 'Hold'},
      {family: 'Family C', plannedQuantityK: 315, demandRequiredK: 310, inventoryAfterPlan: 'Within target', minMaxStatus: 'Within target', shelfLifeRisk: 'Low', eoRisk: 'Low', aiDecision: 'Keep'},
    ],
    inventoryExplanation: 'AI finishes with one monitored Family B exposure rather than chasing extra utilization at the cost of higher E&O risk.',
    woMovements: [
      {wo: 'WO-350255', previousSlot: 'Line 03 Fri PM', newSlot: 'Line 07 Fri AM', reason: 'Final family grouping', impact: 'Saves 0.3 hrs'},
      {wo: 'WO-350240', previousSlot: 'Line 03 Fri AM', newSlot: 'Line 03 Thu PM', reason: 'Earlier feasible slot', impact: 'Protects due date'},
      {wo: 'WO-350301', previousSlot: 'Unscheduled', newSlot: 'Line 10 Fri PM', reason: 'Recovered micro-window', impact: 'Adds 1 WO'},
    ],
    openExceptions: [
      {exception: 'RM-301656 external confirmation pending', impact: '1 WO contingency', recommendedAction: 'Keep supplier follow-up open'},
      {exception: 'Sterilization slot pending final booking', impact: '1 batch monitor', recommendedAction: 'Reserve slot'},
    ],
    affectedWos: 20,
    openConstraintCount: 2,
  },
];

const INTEGER_METRICS: Array<keyof IterationMetrics> = [
  'scheduledWos',
  'unscheduledWos',
  'delayedWos',
  'averageUtilizationPct',
  'overloadedLines',
  'changeovers',
  'longChangeovers',
  'effectiveUtilizationPct',
  'oeeAdjustedFeasibilityPct',
  'downtimeConflicts',
  'eoRiskItems',
  'atRiskQuantityK',
];

const INITIAL_COPILOT_RUN_STATE: CopilotRunState = {
  isRunning: false,
  currentActionIndex: 0,
  pendingActions: [],
  baselineIteration: null,
  targetIterationIndex: 0,
  requestText: '',
};

function cloneMetrics(metrics: IterationMetrics): IterationMetrics {
  return {...metrics};
}

function cloneIdleBreakdown(idle: IdleReasonBreakdown): IdleReasonBreakdown {
  return {...idle};
}

function cloneOpenExceptions(exceptions: OpenExceptionRow[]): OpenExceptionRow[] {
  return exceptions.map((item) => ({...item}));
}

function neutralizeChangeoverImpact(rows: ChangeoverMetricRow[]): ChangeoverMetricRow[] {
  return rows.map((row) => ({...row, current: row.previous, impact: '0', tone: 'neutral'}));
}

function createNeutralIteration(iteration: PlanningIteration): PlanningIteration {
  return {
    ...iteration,
    previousMetrics: cloneMetrics(iteration.currentMetrics),
    currentMetrics: cloneMetrics(iteration.currentMetrics),
    previousIdleBreakdown: cloneIdleBreakdown(iteration.currentIdleBreakdown),
    currentIdleBreakdown: cloneIdleBreakdown(iteration.currentIdleBreakdown),
    changeoverImpact: neutralizeChangeoverImpact(iteration.changeoverImpact),
    summaryChanges: [],
    efficiencyExplanation: 'Waiting for a new copilot instruction.',
    changeoverExplanation: 'Waiting for a new copilot instruction.',
    inventoryExplanation: 'Waiting for a new copilot instruction.',
    woMovements: [],
    openExceptions: [],
    affectedWos: 0,
    openConstraintCount: 0,
  };
}

function interpolateNumber(previous: number, current: number, progress: number, roundToInteger = false): number {
  const value = previous + ((current - previous) * progress);
  if (roundToInteger) return Math.round(value);
  return Math.round(value * 10) / 10;
}

function interpolateMetrics(previous: IterationMetrics, current: IterationMetrics, progress: number): IterationMetrics {
  const nextMetrics = {} as IterationMetrics;
  (Object.keys(previous) as Array<keyof IterationMetrics>).forEach((key) => {
    nextMetrics[key] = interpolateNumber(previous[key], current[key], progress, INTEGER_METRICS.includes(key));
  });
  return nextMetrics;
}

function interpolateIdleBreakdown(previous: IdleReasonBreakdown, current: IdleReasonBreakdown, progress: number): IdleReasonBreakdown {
  const nextBreakdown = {} as IdleReasonBreakdown;
  (Object.keys(previous) as Array<keyof IdleReasonBreakdown>).forEach((key) => {
    nextBreakdown[key] = interpolateNumber(previous[key], current[key], progress);
  });
  return nextBreakdown;
}

function interpolateLineImpact(rows: LineImpactRow[], progress: number): LineImpactRow[] {
  return rows.map((row) => ({
    ...row,
    newUtilizationPct: interpolateNumber(row.previousUtilizationPct, row.newUtilizationPct, progress, true),
    remainingCapacityHrs: interpolateNumber(row.previousUtilizationPct > row.newUtilizationPct ? 0 : row.remainingCapacityHrs, row.remainingCapacityHrs, progress),
    idleTimeHrs: interpolateNumber(row.idleTimeHrs + 1.2, row.idleTimeHrs, progress),
    changeoverTimeHrs: interpolateNumber(row.changeoverTimeHrs + 0.8, row.changeoverTimeHrs, progress),
    status: progress >= 0.7 ? row.status : 'Recalculating',
  }));
}

function interpolateChangeoverImpact(rows: ChangeoverMetricRow[], progress: number): ChangeoverMetricRow[] {
  return rows.map((row) => ({
    ...row,
    current: progress >= 0.99 ? row.current : row.previous,
    impact: progress >= 0.99 ? row.impact : '0',
    tone: progress >= 0.99 ? row.tone : 'neutral',
  }));
}

function interpolateInventoryRisk(rows: InventoryRiskRow[], progress: number): InventoryRiskRow[] {
  return rows.slice(0, Math.max(1, Math.ceil(rows.length * progress))).map((row) => ({...row}));
}

function interpolateWoMovements(rows: WoMovementRow[], progress: number): WoMovementRow[] {
  return rows.slice(0, Math.max(1, Math.ceil(rows.length * progress))).map((row) => ({...row}));
}

function buildLiveIterationSnapshot(baseIteration: PlanningIteration, targetIteration: PlanningIteration, progress: number): PlanningIteration {
  const clampedProgress = Math.max(0, Math.min(progress, 1));
  return {
    ...targetIteration,
    previousMetrics: cloneMetrics(baseIteration.currentMetrics),
    currentMetrics: interpolateMetrics(baseIteration.currentMetrics, targetIteration.currentMetrics, clampedProgress),
    previousIdleBreakdown: cloneIdleBreakdown(baseIteration.currentIdleBreakdown),
    currentIdleBreakdown: interpolateIdleBreakdown(baseIteration.currentIdleBreakdown, targetIteration.currentIdleBreakdown, clampedProgress),
    summaryChanges: targetIteration.summaryChanges.slice(0, Math.max(1, Math.ceil(targetIteration.summaryChanges.length * clampedProgress))),
    efficiencyExplanation: clampedProgress >= 0.5 ? targetIteration.efficiencyExplanation : 'Scanning overloads, available windows, and due-date pressure before changing the schedule.',
    lineImpact: interpolateLineImpact(targetIteration.lineImpact, clampedProgress),
    changeoverImpact: interpolateChangeoverImpact(targetIteration.changeoverImpact, clampedProgress),
    changeoverExplanation: clampedProgress >= 0.75 ? targetIteration.changeoverExplanation : 'Rebuilding compatible production campaigns to cut avoidable setups.',
    inventoryRisk: interpolateInventoryRisk(targetIteration.inventoryRisk, clampedProgress),
    inventoryExplanation: clampedProgress >= 0.9 ? targetIteration.inventoryExplanation : 'Balancing service level gains against inventory and shelf-life exposure.',
    woMovements: interpolateWoMovements(targetIteration.woMovements, clampedProgress),
    openExceptions: cloneOpenExceptions(targetIteration.openExceptions.slice(0, Math.max(1, Math.ceil(targetIteration.openExceptions.length * clampedProgress)))),
    affectedWos: interpolateNumber(0, targetIteration.affectedWos, clampedProgress, true),
    openConstraintCount: interpolateNumber(baseIteration.openConstraintCount, targetIteration.openConstraintCount, clampedProgress, true),
  };
}

function buildCopilotActions(requestText: string, targetIteration: PlanningIteration): CopilotAction[] {
  const stepNarratives = [
    `I interpreted "${requestText}" as a continuous replanning request and started by setting the planning horizon and loading the queue.`,
    'I filtered the queue for due-date pressure, readiness, and blocked orders before touching the schedule.',
    'I selected the WO set with the highest service-level impact so the next passes work on the critical subset first.',
    `I applied the "${targetIteration.strategy}" objective and started generating the AI-backed draft sequence.`,
    'I drafted the schedule, checked exceptions, and began resolving the blockers that can be treated automatically.',
    'I recalculated impact, compared the emerging KPI deltas, and prepared the summary for the final proposal.',
    `I finished AI Iteration ${targetIteration.iterationNumber} and pushed the final deltas into the planning panel for review.`,
  ];

  const targetSteps = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const finalStepIndex = targetSteps.length - 1;

  return targetSteps.map((stepIndex, index) => {
    const narrativeIndex = Math.min(stepNarratives.length - 1, Math.floor((index / finalStepIndex) * (stepNarratives.length - 1)));
    const progress = Number(((index + 1) / targetSteps.length).toFixed(2));
    return {
      id: `step-${stepIndex + 1}`,
      title: `Step ${stepIndex + 1} of 13 in progress`,
      body: stepNarratives[narrativeIndex],
      targetStepIndex: stepIndex,
      progress,
    };
  });
}

const INITIAL_STATE: WorkspaceState = {
  currentStepIndex: -1,
  currentIterationIndex: 0,
  planningHorizon: null,
  selectedStrategy: null,
  selectedOptimizationPreference: ITERATION_OPTIMIZATION_OPTIONS[0],
  iterationReviewStatus: AI_ITERATIONS[0].status,
  scheduleStatus: 'Not Started',
  scheduledCount: AI_ITERATIONS[0].currentMetrics.scheduledWos,
  unscheduledCount: AI_ITERATIONS[0].currentMetrics.unscheduledWos,
  blockedCount: 3,
  utilizationPercent: AI_ITERATIONS[0].currentMetrics.averageUtilizationPct,
  changeoversHours: AI_ITERATIONS[0].currentMetrics.totalChangeoverHrs,
  exceptionsCount: AI_ITERATIONS[0].openExceptions.length,
  resolvedExceptions: 0,
  approvalComment: '',
  submitted: false,
  showDetailedChanges: true,
  recentDecisions: [],
  auditTrail: [],
  scheduleRows: BASE_SCHEDULE_ROWS,
  exceptions: BASE_EXCEPTIONS,
};

function buildAssistantStages(): AssistantStage[] {
  return [
    {
      title: 'Step 1 of 16 — Select Planning Horizon',
      body: [
        'Let\'s define the planning window for this execution cycle.',
        'Select the horizon you want to plan:',
        '• Today — schedule for the current shift and day',
        '• Tomorrow — plan the next production day',
        '• This week — full 5-day horizon',
        '• Custom range — define start and end date',
      ],
      options: [
        {
          label: 'Today',
          userText: 'Plan for today.',
          nextStepIndex: 1,
          action: (state) => ({...state, currentStepIndex: 1, planningHorizon: 'Today', recentDecisions: [...state.recentDecisions, {label: 'Planning horizon set to Today.', by: 'By You', time: '08:01'}]}),
        },
        {
          label: 'Tomorrow',
          userText: 'Plan for tomorrow.',
          nextStepIndex: 1,
          action: (state) => ({...state, currentStepIndex: 1, planningHorizon: 'Tomorrow', recentDecisions: [...state.recentDecisions, {label: 'Planning horizon set to Tomorrow.', by: 'By You', time: '08:01'}]}),
        },
        {
          label: 'This week',
          userText: 'Plan for this week.',
          nextStepIndex: 1,
          action: (state) => ({...state, currentStepIndex: 1, planningHorizon: 'This week', recentDecisions: [...state.recentDecisions, {label: 'Planning horizon set to This week.', by: 'By You', time: '08:01'}]}),
        },
        {
          label: 'Custom range',
          userText: 'Set a custom date range.',
          nextStepIndex: 1,
          action: (state) => ({...state, currentStepIndex: 1, planningHorizon: 'Custom', recentDecisions: [...state.recentDecisions, {label: 'Planning horizon set to custom range.', by: 'By You', time: '08:02'}]}),
        },
      ],
    },
    {
      title: 'Step 2 of 16 — Load WO Planning Queue',
      body: [
        'I loaded the Work Order planning queue for the selected horizon.',
        'Queue summary:',
        '✓ 22 Work Orders in scope for this horizon.',
        '• 14 Ready — all constraints satisfied',
        '⚠ 5 Warning — minor blockers, partially ready',
        '✗ 3 Blocked — cannot be planned yet',
        'Top blocker: RM-301656 shortage affecting 2 WOs.',
        'How would you like to proceed?',
      ],
      options: [
        {
          label: 'View the queue',
          userText: 'Show me the queue.',
          detailMessage: 'Queue loaded: 22 WOs total. Top priorities: WO-100310 (Critical, May 16), WO-400210 (Critical, May 16 — Blocked). Switch to the Queue tab on the right for full details.',
          action: (state) => state,
        },
        {
          label: 'Filter the queue now',
          userText: 'Filter the queue.',
          nextStepIndex: 2,
          action: (state) => ({...state, currentStepIndex: 2}),
        },
        {
          label: 'Show main blockers',
          userText: 'Show main blockers.',
          detailMessage: 'Main blockers: (1) WO-400210 — RM-301656 shortage, delivery May 18. (2) WO-500110 — Quality hold BR-4408, release expected May 17. (3) WO-800220 — Sterilization slot not confirmed.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 3 of 16 — Filter the Queue',
      body: [
        'Apply filters to narrow down what you want to plan.',
        'Available filters:',
        '• Readiness: Ready / Warning / Blocked',
        '• Priority: Critical / High / Medium / Low',
        '• Due date: Today / Tomorrow / This week',
        '• Material available / Quality released',
        'Which filter set do you want to apply?',
      ],
      options: [
        {
          label: 'Ready WOs only',
          userText: 'Show ready WOs only.',
          nextStepIndex: 3,
          action: (state) => ({...state, currentStepIndex: 3, recentDecisions: [...state.recentDecisions, {label: 'Filtered queue to Ready WOs only.', by: 'By You', time: '08:05'}]}),
        },
        {
          label: 'Ready + Warning',
          userText: 'Show ready and warning WOs.',
          nextStepIndex: 3,
          action: (state) => ({...state, currentStepIndex: 3, recentDecisions: [...state.recentDecisions, {label: 'Filtered queue to Ready and Warning WOs.', by: 'By You', time: '08:05'}]}),
        },
        {
          label: 'All WOs including blocked',
          userText: 'Show all WOs including blocked.',
          nextStepIndex: 3,
          action: (state) => ({...state, currentStepIndex: 3}),
        },
      ],
    },
    {
      title: 'Step 4 of 16 — Select Work Orders',
      body: [
        'Select the Work Orders you want to schedule.',
        'Filtered queue: 14 Ready, 5 Warning (19 total eligible).',
        'Options:',
        '• Select all Ready WOs (14) — fastest path',
        '• Select top priority — Critical + High due today',
        '• Manual select — pick individual WOs from the Queue tab',
        'Blocked WOs are automatically excluded from selection.',
      ],
      options: [
        {
          label: 'Select all ready WOs',
          userText: 'Select all ready WOs.',
          nextStepIndex: 4,
          action: (state) => ({
            ...state,
            currentStepIndex: 4,
            recentDecisions: [...state.recentDecisions, {label: 'Selected all 14 ready WOs for scheduling.', by: 'By You', time: '08:07'}],
          }),
        },
        {
          label: 'Select top priority WOs',
          userText: 'Select top priority WOs.',
          nextStepIndex: 4,
          action: (state) => ({
            ...state,
            currentStepIndex: 4,
            recentDecisions: [...state.recentDecisions, {label: 'Selected Critical and High priority WOs due today.', by: 'By You', time: '08:07'}],
          }),
        },
        {
          label: 'Manual selection',
          userText: 'I\'ll select WOs manually from the queue.',
          detailMessage: 'Switch to the Queue tab on the right panel to review and select individual Work Orders. Come back here when ready.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 5 of 16 — Choose Planning Strategy',
      body: [
        'Select the strategy the system will use to sequence and assign Work Orders.',
        '• Due date first — prioritize WOs expiring soonest',
        '• Minimize changeover — group similar products to reduce setup time',
        '• Maximize line utilization — fill available capacity gaps',
        '• Campaign planning — group by product family or batch',
        'You can combine strategies or apply a secondary one after generation.',
      ],
      options: [
        {
          label: 'Due date first',
          userText: 'Use due date first strategy.',
          nextStepIndex: 5,
          action: (state) => ({
            ...state,
            currentStepIndex: 5,
            selectedStrategy: 'Due date first',
            recentDecisions: [...state.recentDecisions, {label: 'Planning strategy set to Due date first.', by: 'By You', time: '08:09'}],
          }),
        },
        {
          label: 'Minimize changeover',
          userText: 'Use minimize changeover strategy.',
          nextStepIndex: 5,
          action: (state) => ({
            ...state,
            currentStepIndex: 5,
            selectedStrategy: 'Minimize changeover',
            recentDecisions: [...state.recentDecisions, {label: 'Planning strategy set to Minimize changeover.', by: 'By You', time: '08:09'}],
            changeoversHours: Math.round(state.changeoversHours * 0.7 * 10) / 10,
          }),
        },
        {
          label: 'Maximize utilization',
          userText: 'Use maximize line utilization strategy.',
          nextStepIndex: 5,
          action: (state) => ({
            ...state,
            currentStepIndex: 5,
            selectedStrategy: 'Maximize utilization',
            recentDecisions: [...state.recentDecisions, {label: 'Planning strategy set to Maximize utilization.', by: 'By You', time: '08:09'}],
            utilizationPercent: Math.min(99, state.utilizationPercent + 5),
          }),
        },
        {
          label: 'Campaign planning',
          userText: 'Use campaign planning strategy.',
          nextStepIndex: 5,
          action: (state) => ({
            ...state,
            currentStepIndex: 5,
            selectedStrategy: 'Campaign planning',
            recentDecisions: [...state.recentDecisions, {label: 'Planning strategy set to Campaign planning.', by: 'By You', time: '08:09'}],
          }),
        },
      ],
    },
    {
      title: 'Step 6 of 16 — Generate Draft Schedule',
      body: [
        'Ready to generate the draft schedule.',
        `Strategy: ${'{strategy}'}`,
        'The system will:',
        '✓ Assign WOs to eligible lines/machines',
        '✓ Sequence based on selected strategy',
        '✓ Respect maintenance windows and constraints',
        '✓ Check material, quality, and labor readiness',
        'Generating may take a few seconds.',
      ],
      options: [
        {
          label: 'Generate now',
          userText: 'Generate the draft schedule.',
          nextStepIndex: 6,
          action: (state) => ({
            ...state,
            currentStepIndex: 6,
            scheduleStatus: 'Draft',
            recentDecisions: [...state.recentDecisions, {label: `Draft schedule generated using ${state.selectedStrategy ?? 'Due date first'} strategy.`, by: 'System', time: '08:11'}],
          }),
        },
        {
          label: 'Change strategy first',
          userText: 'Let me change the strategy first.',
          nextStepIndex: 4,
          action: (state) => ({...state, currentStepIndex: 4}),
        },
        {
          label: 'Show scheduling constraints',
          userText: 'Show the active scheduling constraints.',
          detailMessage: 'Active constraints: Maintenance window Line 20 (May 16, 22:00–02:00). Quality hold WO-500110. RM-301656 not available until May 18. Labor shift limits: max 12 hrs/line/shift.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 7 of 16 — Draft Schedule Created',
      body: [
        '✓ Draft schedule created successfully.',
        'Summary:',
        '• 18 WOs scheduled across 4 lines',
        '• 4 WOs unscheduled (constraints)',
        '• 3 WOs blocked (awaiting resolution)',
        '• Avg line utilization: 87%',
        '• Changeover hours: 12.5',
        '• 7 exceptions detected — review recommended.',
        'Review the Schedule tab on the right for details.',
      ],
      options: [
        {
          label: 'View schedule details',
          userText: 'Show me the schedule details.',
          detailMessage: 'Schedule loaded in the right panel. 5 WOs assigned to Day shift, 2 to Night shift. Line 20 is the most loaded at 103% — flagged as exception. See the Schedule tab for full breakdown.',
          action: (state) => state,
        },
        {
          label: 'Show exceptions',
          userText: 'Show exceptions.',
          nextStepIndex: 7,
          action: (state) => ({...state, currentStepIndex: 7}),
        },
        {
          label: 'Approve all & confirm',
          userText: 'Approve all scheduled WOs.',
          nextStepIndex: 12,
          action: (state) => ({
            ...state,
            currentStepIndex: 12,
            scheduleStatus: 'Pending Approval',
            resolvedExceptions: state.exceptionsCount,
            exceptions: state.exceptions.map((ex) => ({...ex, resolved: true})),
            exceptionsCount: 0,
            recentDecisions: [...state.recentDecisions, {label: 'All scheduled WOs approved. Skipped to confirm step.', by: 'By You', time: '08:12'}],
          }),
        },
      ],
    },
    {
      title: 'Step 8 of 16 — Review Exceptions',
      body: [
        '7 exceptions detected in the draft schedule.',
        'Breakdown:',
        '• 1 Critical — Material shortage (WO-400210)',
        '• 2 High — Quality hold, sterilization risk',
        '• 4 Medium — Capacity conflicts, gaps',
        'Unresolved exceptions will remain visible in the execution view.',
        'Open exception details to understand root causes and options.',
      ],
      options: [
        {
          label: 'Open exception details',
          userText: 'Open exception details.',
          detailMessage: 'Exceptions panel updated in the Schedule tab. Each exception shows root cause, affected WOs, and resolution options. Expand each row to act.',
          action: (state) => state,
        },
        {
          label: 'See AI recommendations',
          userText: 'What do you recommend for each exception?',
          detailMessage: 'AI recommendations: (1) WO-400210 — move to May 18 when RM-301656 arrives or replace with WO-800220. (2) WO-500110 — keep unscheduled, monitor quality release. (3) Line 20 overload — shift WO-200410 Night to Line 40.',
          action: (state) => state,
        },
        {
          label: 'Continue to resolve',
          userText: 'Let\'s resolve exceptions.',
          nextStepIndex: 8,
          action: (state) => ({...state, currentStepIndex: 8}),
        },
      ],
    },
    {
      title: 'Step 9 of 16 — Resolve Exceptions',
      body: [
        'Resolve each exception to finalize the schedule.',
        'Exception 1/4: WO-400210 — Material shortage (RM-301656)',
        'Root cause: Material not available until May 18.',
        'Options:',
        '• Move WO after material availability (May 18)',
        '• Replace with next eligible WO',
        '• Change to a line with available stock',
        '• Keep unscheduled — escalate blocker',
      ],
      options: [
        {
          label: 'Move WO to May 18',
          userText: 'Move WO-400210 after material availability.',
          nextStepIndex: 9,
          action: (state) => ({
            ...state,
            currentStepIndex: 9,
            exceptionsCount: Math.max(0, state.exceptionsCount - 1),
            resolvedExceptions: state.resolvedExceptions + 1,
            exceptions: state.exceptions.map((ex) => ex.id === 'ex-1' ? {...ex, resolved: true} : ex),
            recentDecisions: [...state.recentDecisions, {label: 'WO-400210 moved to May 18 (post material arrival).', by: 'By You', time: '08:15'}],
          }),
        },
        {
          label: 'Replace with next eligible WO',
          userText: 'Replace WO-400210 with next eligible WO.',
          nextStepIndex: 9,
          action: (state) => ({
            ...state,
            currentStepIndex: 9,
            exceptionsCount: Math.max(0, state.exceptionsCount - 1),
            resolvedExceptions: state.resolvedExceptions + 1,
            exceptions: state.exceptions.map((ex) => ex.id === 'ex-1' ? {...ex, resolved: true} : ex),
            recentDecisions: [...state.recentDecisions, {label: 'WO-400210 replaced with next eligible WO on Line 40.', by: 'By You', time: '08:15'}],
          }),
        },
        {
          label: 'Keep unscheduled — escalate',
          userText: 'Keep WO-400210 unscheduled and escalate blocker.',
          nextStepIndex: 9,
          action: (state) => ({
            ...state,
            currentStepIndex: 9,
            blockedCount: state.blockedCount + 1,
            recentDecisions: [...state.recentDecisions, {label: 'WO-400210 kept unscheduled. Blocker escalated.', by: 'By You', time: '08:15'}],
          }),
        },
      ],
    },
    {
      title: 'Step 10 of 16 — Recalculate Impact',
      body: [
        'Exception resolutions applied. Recalculating schedule impact.',
        'Updated metrics:',
        '✓ Capacity utilization recalculated per line',
        '✓ Completion rate updated',
        '✓ Changeover hours adjusted',
        '✓ Delayed WOs reassessed',
        'Confirm recalculation to apply all changes.',
      ],
      options: [
        {
          label: 'Recalculate now',
          userText: 'Recalculate schedule impact.',
          nextStepIndex: 10,
          action: (state) => ({
            ...state,
            currentStepIndex: 10,
            scheduledCount: state.scheduledCount + 1,
            unscheduledCount: Math.max(0, state.unscheduledCount - 1),
            exceptionsCount: Math.max(0, state.exceptionsCount - 2),
            recentDecisions: [...state.recentDecisions, {label: 'Schedule impact recalculated after exception resolution.', by: 'System', time: '08:18'}],
          }),
        },
        {
          label: 'Accept current without recalculating',
          userText: 'Accept current values without recalculating.',
          nextStepIndex: 10,
          action: (state) => ({...state, currentStepIndex: 10}),
        },
        {
          label: 'Show changes summary',
          userText: 'Show what changed after resolution.',
          detailMessage: 'Changes: +1 WO scheduled (replacement), -1 exception (material shortage resolved), Line 40 utilization increased to 91%. Changeover hours unchanged.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 11 of 16 — Review Updated Schedule',
      body: [
        'Updated schedule is ready for review.',
        '• Scheduled WOs: 19 (was 18)',
        '• Unscheduled: 3 (was 4)',
        '• Remaining exceptions: 5',
        'Visualizations in the Schedule tab:',
        '• Grouped campaign blocks shown first',
        '• Line utilization bars updated',
        '• Gaps and overloads highlighted',
        'Review before generating the final summary.',
      ],
      options: [
        {
          label: 'View summary',
          userText: 'View the updated schedule summary.',
          nextStepIndex: 11,
          action: (state) => ({...state, currentStepIndex: 11}),
        },
        {
          label: 'Show gaps',
          userText: 'Show scheduling gaps.',
          detailMessage: 'Gaps detected: Line 30 — 4 hrs free on Day shift (May 16). Line 10 — 2.5 hrs free on Night shift (May 16). These slots can absorb additional WOs if needed.',
          action: (state) => state,
        },
        {
          label: 'Show overloads',
          userText: 'Show overloaded slots.',
          detailMessage: 'Overloads: Line 20 Night shift — 103% utilization (2.5 hrs over limit). Recommendation: shift 1 WO to Line 40 Day shift.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 12 of 16 — Review Final Summary',
      body: [
        'Final schedule summary before confirmation:',
        '• WOs scheduled: 19',
        '• WOs unscheduled: 3',
        '• WOs blocked: 3',
        '• Avg capacity utilization: 89%',
        '• Changeover hours: 11.2',
        '• Material risks: 1 (RM-301656 on May 18)',
        '• Quality risks: 1 (BR-4408 pending)',
        '• Expected completion: 91% of horizon demand',
      ],
      options: [
        {
          label: 'View capacity details',
          userText: 'Show capacity utilization details.',
          detailMessage: 'Line 10: 92%, Line 20: 103% (⚠ overload), Line 30: 78%, Line 40: 91%. Overall average: 89%.',
          action: (state) => state,
        },
        {
          label: 'View material risks',
          userText: 'Show material risk details.',
          detailMessage: 'Material risk: RM-301656 — WO-400210 rescheduled to May 18. Monitor delivery confirmation from supplier. No other material risks in scope.',
          action: (state) => state,
        },
        {
          label: 'Proceed to confirm',
          userText: 'Proceed to confirm the schedule.',
          nextStepIndex: 12,
          action: (state) => ({...state, currentStepIndex: 12, scheduleStatus: 'Pending Approval'}),
        },
      ],
    },
    {
      title: 'Step 13 of 16 — Confirm Schedule',
      body: [
        'Confirm the schedule before it is applied.',
        'This will NOT automatically start any Work Orders.',
        'You may add a comment explaining the planning decisions made.',
        'Once confirmed, the schedule will be visible to execution teams.',
        'Do you want to confirm this schedule?',
      ],
      options: [
        {
          label: 'Add comment & confirm',
          userText: 'Add comment: Schedule confirmed. Line 20 overload monitored. WO-400210 deferred to May 18.',
          nextStepIndex: 13,
          action: (state) => ({
            ...state,
            currentStepIndex: 13,
            approvalComment: 'Schedule confirmed. Line 20 overload monitored. WO-400210 deferred to May 18.',
            scheduleStatus: 'Confirmed',
            recentDecisions: [...state.recentDecisions, {label: 'Schedule confirmed with planner comment.', by: 'By You', time: '08:22'}],
          }),
        },
        {
          label: 'Confirm without comment',
          userText: 'Confirm the schedule without a comment.',
          nextStepIndex: 13,
          action: (state) => ({
            ...state,
            currentStepIndex: 13,
            scheduleStatus: 'Confirmed',
            recentDecisions: [...state.recentDecisions, {label: 'Schedule confirmed without comment.', by: 'By You', time: '08:22'}],
          }),
        },
        {
          label: 'Go back to review',
          userText: 'Let me review the summary again.',
          nextStepIndex: 11,
          action: (state) => ({...state, currentStepIndex: 11}),
        },
      ],
    },
    {
      title: 'Step 14 of 16 — Save & Log Schedule',
      body: [
        'The schedule is confirmed. Saving now.',
        'The system will log:',
        '• Previous schedule (if any)',
        '• New confirmed schedule',
        '• User and timestamp',
        `• Planning strategy used`,
        '• Exceptions resolved and remaining',
        '• Planner comment (if added)',
        'This creates a full audit trail.',
      ],
      options: [
        {
          label: 'Confirm save',
          userText: 'Save and log the schedule.',
          nextStepIndex: 14,
          action: (state) => ({
            ...state,
            currentStepIndex: 14,
            recentDecisions: [...state.recentDecisions, {label: 'Schedule saved and logged to audit trail.', by: 'System', time: '08:23'}],
          }),
        },
        {
          label: 'View audit log',
          userText: 'Show me the audit log entry.',
          detailMessage: 'Audit entry: Schedule ID: SCH-20260516-001. User: Gustavo.Costa. Strategy: Due date first. WOs confirmed: 19. Exceptions resolved: 2/7. Comment logged. Previous schedule: SCH-20260515-003.',
          action: (state) => state,
        },
        {
          label: 'Show diff from previous',
          userText: 'Show what changed vs previous schedule.',
          detailMessage: 'Changes from previous schedule: +3 WOs added (WO-600210, WO-700310, WO-300110). WO-400210 moved from May 16 to May 18. Line 30 utilization increased from 68% to 78%.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 15 of 16 — Publish for Execution',
      body: [
        'Schedule saved. Ready to publish for execution teams.',
        'Publishing will:',
        '✓ Update WO planned sequence on lines',
        '✓ Update line/machine schedule in the timeline',
        '✓ Show "Confirmed" status to execution teams',
        '✓ Keep full audit history',
        'This does not auto-start WOs — operators must confirm each WO.',
      ],
      options: [
        {
          label: 'Publish now',
          userText: 'Publish the schedule for execution.',
          action: (state) => ({
            ...state,
            currentStepIndex: 15,
            submitted: true,
            scheduleStatus: 'Published',
            recentDecisions: [...state.recentDecisions, {label: 'Schedule published for execution.', by: 'By You', time: '08:25'}],
          }),
        },
        {
          label: 'Save as draft only',
          userText: 'Save as draft — do not publish yet.',
          detailMessage: 'Draft saved. Execution teams will not see this schedule until it is published. You can return and publish at any time.',
          action: (state) => state,
        },
        {
          label: 'Preview confirmed schedule',
          userText: 'Preview the confirmed schedule view.',
          detailMessage: 'Confirmed schedule: 19 WOs visible in timeline. 3 unscheduled shown with reason. Lines color-coded by utilization. Maintenance windows locked. Status badge: Confirmed.',
          action: (state) => state,
        },
      ],
    },
    {
      title: 'Step 16 of 16 — Done',
      body: [
        '✓ Execution schedule published successfully.',
        'What\'s available now:',
        '• Timeline updated with confirmed schedule',
        '• WO planned sequence set per line',
        '• Audit log recorded',
        '• Execution teams can see the confirmed plan',
        'You can start a new planning session at any time.',
      ],
      options: [
        {
          label: 'Start new planning session',
          userText: 'Start a new planning session.',
          nextStepIndex: 0,
          action: (state) => ({...INITIAL_STATE, currentStepIndex: 0, recentDecisions: []}),
        },
        {
          label: 'Close assistant',
          userText: 'Close the assistant.',
          action: (state) => ({...state, submitted: true}),
        },
      ],
    },
  ];
}

function createInitialMessages(): ChatMessage[] {
  return [
    {
      id: 'assistant-intro',
      role: 'assistant',
      title: 'Execution Planning Assistant',
      body: "I'm ready to run continuous order replanning.\nSend a request in the chat and I'll execute the copilot flow automatically, expose the reasoning, and update the iteration KPIs live.",
      kind: 'status',
      options: [
        {
          label: 'Start planning',
          userText: 'Start a continuous planning session.',
          nextStepIndex: 0,
          action: (state) => ({...state, currentStepIndex: 0, scheduleStatus: 'Ready for copilot input'}),
        },
      ],
    },
  ];
}

function buildStageMessage(stage: AssistantStage, id: string, state: WorkspaceState): ChatMessage {
  const body = stage.body
    .map((line) => line.replace('{strategy}', state.selectedStrategy ?? 'Due date first'))
    .join('\n');
  return {id, role: 'assistant', title: stage.title, body, options: stage.options};
}

const AI_FREE_RESPONSES = [
  'Noted. I\'ve updated the schedule analysis based on your input. Check the Schedule tab for the latest figures.',
  'Got it. The schedule has been recalculated with your latest decision. Review the right panel for updated values.',
  'Understood. I\'ve integrated your input into the current execution plan. Updated metrics are now reflected.',
  'I\'ve processed your input and refreshed the schedule data. The utilization chart shows the recalculated values.',
  'Thank you. The execution plan has been updated. The Schedule tab reflects the latest changes.',
  'Input received. I\'ve re-run the scheduling simulation — updated results are now visible across all panels.',
];

function buildJumpOptions(currentStepIdx: number, stages: AssistantStage[], state: WorkspaceState): OptionConfig[] {
  const after = stages.map((_, i) => i).filter(i => i > currentStepIdx);
  const before = stages.map((_, i) => i).filter(i => i < currentStepIdx);
  const ordered = [...after, ...before];
  return ordered.slice(0, 4).map(idx => ({
    label: `Step ${idx + 1}: ${PROGRESS_STEPS[idx].label.replace('\n', ' ')}`,
    userText: `Jump to Step ${idx + 1} — ${PROGRESS_STEPS[idx].label.replace('\n', ' ')}.`,
    nextStepIndex: idx,
    action: (_s: WorkspaceState): WorkspaceState => ({...state, currentStepIndex: idx}),
  }));
}

function deriveIterationIndexFromStep(stepIndex: number): number {
  if (stepIndex >= 13) return 4;
  if (stepIndex >= 11) return 3;
  if (stepIndex >= 9) return 2;
  if (stepIndex >= 5) return 1;
  return 0;
}

function formatMetricValue(metric: keyof IterationMetrics, value: number): string {
  if (metric === 'averageUtilizationPct' || metric === 'effectiveUtilizationPct' || metric === 'oeeAdjustedFeasibilityPct') return `${value}%`;
  if (metric === 'remainingCapacityHrs' || metric === 'overloadHours' || metric === 'productiveTimeHrs' || metric === 'totalChangeoverHrs' || metric === 'totalIdleTimeHrs' || metric === 'idleMaterialHrs' || metric === 'idleQualityHrs' || metric === 'idleNoEligibleHrs') return `${value.toFixed(1)} hrs`;
  if (metric === 'atRiskQuantityK') return `${value}k`;
  return String(value);
}

function getDeltaTone(current: number, previous: number, higherIsBetter: boolean): 'positive' | 'negative' | 'neutral' {
  if (current === previous) return 'neutral';
  return (higherIsBetter ? current > previous : current < previous) ? 'positive' : 'negative';
}

function formatDelta(metric: keyof IterationMetrics, previous: number, current: number): string {
  const delta = current - previous;
  if (delta === 0) return '0';
  if (metric === 'averageUtilizationPct' || metric === 'effectiveUtilizationPct' || metric === 'oeeAdjustedFeasibilityPct') return `${delta > 0 ? '+' : ''}${delta}%`;
  if (metric === 'remainingCapacityHrs' || metric === 'overloadHours' || metric === 'productiveTimeHrs' || metric === 'totalChangeoverHrs' || metric === 'totalIdleTimeHrs' || metric === 'idleMaterialHrs' || metric === 'idleQualityHrs' || metric === 'idleNoEligibleHrs') return `${delta > 0 ? '+' : ''}${delta.toFixed(1)} hrs`;
  if (metric === 'atRiskQuantityK') return `${delta > 0 ? '+' : ''}${delta}k`;
  return `${delta > 0 ? '+' : ''}${delta}`;
}

function buildKpiRows(previousMetrics: IterationMetrics, currentMetrics: IterationMetrics) {
  const metricRows: {label: string; key: keyof IterationMetrics; higherIsBetter: boolean}[] = [
    {label: 'Scheduled WOs', key: 'scheduledWos', higherIsBetter: true},
    {label: 'Unscheduled WOs', key: 'unscheduledWos', higherIsBetter: false},
    {label: 'Delayed WOs', key: 'delayedWos', higherIsBetter: false},
    {label: 'Average utilization', key: 'averageUtilizationPct', higherIsBetter: true},
    {label: 'Remaining capacity', key: 'remainingCapacityHrs', higherIsBetter: false},
    {label: 'Overloaded lines', key: 'overloadedLines', higherIsBetter: false},
    {label: 'Overload hours', key: 'overloadHours', higherIsBetter: false},
    {label: 'Productive time', key: 'productiveTimeHrs', higherIsBetter: true},
    {label: 'Effective utilization', key: 'effectiveUtilizationPct', higherIsBetter: true},
    {label: 'Total changeover time', key: 'totalChangeoverHrs', higherIsBetter: false},
    {label: 'Number of changeovers', key: 'changeovers', higherIsBetter: false},
    {label: 'Long changeovers', key: 'longChangeovers', higherIsBetter: false},
    {label: 'Total idle time', key: 'totalIdleTimeHrs', higherIsBetter: false},
    {label: 'Idle time due to material', key: 'idleMaterialHrs', higherIsBetter: false},
    {label: 'Idle time due to quality', key: 'idleQualityHrs', higherIsBetter: false},
    {label: 'Idle time due to no eligible WO', key: 'idleNoEligibleHrs', higherIsBetter: false},
    {label: 'OEE-adjusted feasibility', key: 'oeeAdjustedFeasibilityPct', higherIsBetter: true},
    {label: 'Downtime conflicts', key: 'downtimeConflicts', higherIsBetter: false},
    {label: 'E&O risk items', key: 'eoRiskItems', higherIsBetter: false},
    {label: 'At-risk quantity', key: 'atRiskQuantityK', higherIsBetter: false},
  ];

  return metricRows.map((row) => {
    const previous = previousMetrics[row.key];
    const current = currentMetrics[row.key];
    return {
      label: row.label,
      previous: formatMetricValue(row.key, previous),
      current: formatMetricValue(row.key, current),
      delta: formatDelta(row.key, previous, current),
      tone: getDeltaTone(current, previous, row.higherIsBetter),
    };
  });
}

function formatIdleDelta(previous: number, current: number): string {
  const delta = current - previous;
  if (delta === 0) return '0';
  return `${delta > 0 ? '+' : ''}${delta.toFixed(1)} hrs`;
}

function buildAuditSnapshot(metrics: IterationMetrics): AuditSnapshot {
  return {
    scheduledWos: metrics.scheduledWos,
    unscheduledWos: metrics.unscheduledWos,
    overloadHours: metrics.overloadHours,
    totalChangeoverHrs: metrics.totalChangeoverHrs,
    totalIdleTimeHrs: metrics.totalIdleTimeHrs,
    eoRiskItems: metrics.eoRiskItems,
  };
}

function syncWorkspaceWithIteration(state: WorkspaceState, iterationIndex: number): WorkspaceState {
  const clampedIndex = Math.max(0, Math.min(iterationIndex, AI_ITERATIONS.length - 1));
  const iteration = AI_ITERATIONS[clampedIndex];
  return {
    ...state,
    currentIterationIndex: clampedIndex,
    iterationReviewStatus: iteration.status,
    scheduledCount: iteration.currentMetrics.scheduledWos,
    unscheduledCount: iteration.currentMetrics.unscheduledWos,
    utilizationPercent: iteration.currentMetrics.averageUtilizationPct,
    changeoversHours: iteration.currentMetrics.totalChangeoverHrs,
    exceptionsCount: iteration.openExceptions.length,
    blockedCount: Math.max(iteration.openExceptions.length, 1),
    scheduleStatus: state.submitted ? state.scheduleStatus : clampedIndex >= 2 ? 'AI Proposal Ready' : state.scheduleStatus,
  };
}

function appendRecentDecision(state: WorkspaceState, label: string, by = 'By You'): WorkspaceState {
  return {
    ...state,
    recentDecisions: [
      ...state.recentDecisions,
      {label, by, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})},
    ],
  };
}

function appendAuditEntry(state: WorkspaceState, selectedAction: string, comment?: string): WorkspaceState {
  const iteration = AI_ITERATIONS[state.currentIterationIndex];
  const entry: DecisionAuditEntry = {
    user: 'Planner',
    timestamp: new Date().toLocaleString([], {hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit'}),
    iterationNumber: iteration.iterationNumber,
    optimizationStrategy: iteration.strategy,
    selectedAction,
    beforeValues: buildAuditSnapshot(iteration.previousMetrics),
    afterValues: buildAuditSnapshot(iteration.currentMetrics),
    comment,
  };
  return {
    ...state,
    auditTrail: [entry, ...state.auditTrail].slice(0, 8),
  };
}

const READINESS_COLORS: Record<string, {color: string; bg: string}> = {
  Ready: {color: '#027A48', bg: '#ECFDF3'},
  Warning: {color: '#B54708', bg: '#FFFBEB'},
  Blocked: {color: '#B42318', bg: '#FEF2F2'},
};

const SEVERITY_COLORS: Record<string, {color: string; bg: string}> = {
  Critical: {color: '#B42318', bg: '#FEF2F2'},
  High: {color: '#B54708', bg: '#FFFBEB'},
  Medium: {color: 'var(--planning-text-secondary)', bg: '#F8FAFC'},
};

export default function OrdersAiAssistantWorkspace({open, onClose, onComplete}: Props) {
  const stagesRef = useRef<AssistantStage[]>(buildAssistantStages());
  const [workspaceState, setWorkspaceState] = useState(INITIAL_STATE);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => createInitialMessages());
  const [liveIteration, setLiveIteration] = useState<PlanningIteration>(() => createNeutralIteration(AI_ITERATIONS[0]));
  const [copilotRunState, setCopilotRunState] = useState<CopilotRunState>(INITIAL_COPILOT_RUN_STATE);
  const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rightTab, setRightTab] = useState(0);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [chatInput, setChatInput] = useState('');
  const [timelineTransposed, setTimelineTransposed] = useState(true);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const [aiLines, setAiLines] = useState(aiTimelineLines);

  const activeStepIndex = workspaceState.submitted
    ? PROGRESS_STEPS.length - 1
    : workspaceState.currentStepIndex;
  const latestMessageId = chatMessages[chatMessages.length - 1]?.id;
  const showApproveAll = workspaceState.currentStepIndex >= 6 && !workspaceState.submitted && workspaceState.exceptionsCount > 0;
  const currentIteration = liveIteration;
  const kpiRows = buildKpiRows(currentIteration.previousMetrics, currentIteration.currentMetrics);
  const liveTimelineWOs = useMemo(
    () => interpolateTimelineWOs(AI_TIMELINE_INITIAL_WOS, AI_TIMELINE_FINAL_WOS, timelineProgress),
    [timelineProgress],
  );

  useEffect(() => {
    if (!copilotRunState.isRunning || !copilotRunState.baselineIteration) return;

    if (copilotRunState.currentActionIndex >= copilotRunState.pendingActions.length) {
      const finalIteration = AI_ITERATIONS[copilotRunState.targetIterationIndex];
      setWorkspaceState((prev) => {
        const finalState = syncWorkspaceWithIteration({
          ...prev,
          currentStepIndex: Math.max(prev.currentStepIndex, 12),
          selectedStrategy: finalIteration.strategy,
          planningHorizon: prev.planningHorizon ?? 'This week',
          iterationReviewStatus: `AI Iteration ${finalIteration.iterationNumber} ready for review`,
          scheduleStatus: 'Pending Approval',
        }, copilotRunState.targetIterationIndex);
        return appendRecentDecision(finalState, `Continuous copilot run completed for AI Iteration ${finalIteration.iterationNumber}.`, 'By Copilot');
      });
      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          title: 'Copilot run complete',
          body: `AI Iteration ${finalIteration.iterationNumber} is ready. The panel now shows the final KPI deltas against the previous plan.`,
          kind: 'status',
        },
      ]);
      setTimelineProgress(1);
      setCopilotRunState(INITIAL_COPILOT_RUN_STATE);
      setTimeout(() => chatEndRef.current?.scrollIntoView({behavior: 'smooth'}), 80);
      return;
    }

    const action = copilotRunState.pendingActions[copilotRunState.currentActionIndex];
    const timer = window.setTimeout(() => {
      const targetIteration = AI_ITERATIONS[copilotRunState.targetIterationIndex];
      const snapshot = buildLiveIterationSnapshot(copilotRunState.baselineIteration!, targetIteration, action.progress);
      setLiveIteration(snapshot);
      setTimelineProgress(action.progress);
      setWorkspaceState((prev) => ({
        ...prev,
        currentStepIndex: Math.max(prev.currentStepIndex, action.targetStepIndex),
        currentIterationIndex: copilotRunState.targetIterationIndex,
        planningHorizon: prev.planningHorizon ?? 'This week',
        selectedStrategy: targetIteration.strategy,
        iterationReviewStatus: action.title,
        scheduleStatus: action.progress >= 1 ? 'Pending Approval' : 'AI Replanning in progress',
        scheduledCount: snapshot.currentMetrics.scheduledWos,
        unscheduledCount: snapshot.currentMetrics.unscheduledWos,
        blockedCount: Math.max(snapshot.openExceptions.length, 1),
        utilizationPercent: snapshot.currentMetrics.averageUtilizationPct,
        changeoversHours: snapshot.currentMetrics.totalChangeoverHrs,
        exceptionsCount: snapshot.openExceptions.length,
      }));
      setChatMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}-${action.id}`,
          role: 'assistant',
          title: action.title,
          body: action.body,
          kind: 'reasoning',
        },
      ]);
      setCopilotRunState((prev) => ({...prev, currentActionIndex: prev.currentActionIndex + 1}));
      setTimeout(() => chatEndRef.current?.scrollIntoView({behavior: 'smooth'}), 80);
    }, copilotRunState.currentActionIndex === 0 ? 300 : 1200);

    return () => window.clearTimeout(timer);
  }, [copilotRunState]);

  if (!open) return null;

  const handleResetAndClose = () => {
    const wasSubmitted = workspaceState.submitted;
    setWorkspaceState(INITIAL_STATE);
    setChatMessages(createInitialMessages());
    setLiveIteration(createNeutralIteration(AI_ITERATIONS[0]));
    setCopilotRunState(INITIAL_COPILOT_RUN_STATE);
    setTimelineProgress(0);
    setAiLines(aiTimelineLines);
    setExitConfirmOpen(false);
    onClose();
    if (wasSubmitted) onComplete?.();
  };

  const handleRequestClose = () => {
    if (workspaceState.submitted || workspaceState.currentStepIndex < 0) {
      handleResetAndClose();
      return;
    }
    setExitConfirmOpen(true);
  };

  const handleSendMessage = () => {
    const text = chatInput.trim();
    if (!text || workspaceState.submitted || copilotRunState.isRunning) return;
    const targetIterationIndex = Math.min(workspaceState.currentIterationIndex + 1, AI_ITERATIONS.length - 1);
    const targetIteration = AI_ITERATIONS[targetIterationIndex];
    const baselineIteration = createNeutralIteration(liveIteration);
    const actionPlan = buildCopilotActions(text, targetIteration);
    setLiveIteration(baselineIteration);
    setWorkspaceState((prev) => ({
      ...prev,
      planningHorizon: prev.planningHorizon ?? 'This week',
      selectedStrategy: targetIteration.strategy,
      iterationReviewStatus: `Copilot started: ${targetIteration.strategy}`,
      scheduleStatus: 'AI Replanning in progress',
      currentStepIndex: Math.max(prev.currentStepIndex, 0),
      scheduledCount: baselineIteration.currentMetrics.scheduledWos,
      unscheduledCount: baselineIteration.currentMetrics.unscheduledWos,
      blockedCount: Math.max(baselineIteration.openExceptions.length, 1),
      utilizationPercent: baselineIteration.currentMetrics.averageUtilizationPct,
      changeoversHours: baselineIteration.currentMetrics.totalChangeoverHrs,
      exceptionsCount: baselineIteration.openExceptions.length,
    }));
    setChatMessages(prev => [
      ...prev,
      {id: `user-${Date.now()}`, role: 'user', body: text},
      {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        title: 'Continuous copilot started',
        body: `I'm running AI Iteration ${targetIteration.iterationNumber} now. I'll keep moving through the planning steps, explain each decision in the chat, and update the KPI comparison as the plan changes.`,
        kind: 'status',
      },
    ]);
    setCopilotRunState({
      isRunning: true,
      currentActionIndex: 0,
      pendingActions: actionPlan,
      baselineIteration,
      targetIterationIndex,
      requestText: text,
    });
    setChatInput('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({behavior: 'smooth'}), 80);
  };

  const handleOptionClick = (option: OptionConfig) => {
    const assistantMessageId = `assistant-${Date.now()}`;
    let updatedState = option.action(workspaceState);
    const derivedIteration = Math.max(updatedState.currentIterationIndex, deriveIterationIndexFromStep(updatedState.currentStepIndex));
    updatedState = syncWorkspaceWithIteration(updatedState, derivedIteration);
    setLiveIteration(createNeutralIteration(AI_ITERATIONS[derivedIteration]));
    const nextMessages: ChatMessage[] = [
      {id: `user-${Date.now()}`, role: 'user', title: 'Planner', body: option.userText},
    ];

    if (option.detailMessage) {
      const currentStage = stagesRef.current[Math.max(workspaceState.currentStepIndex, 0)];
      nextMessages.push({
        id: assistantMessageId,
        role: 'assistant',
        title: currentStage.title,
        body: option.detailMessage,
        options: currentStage.options,
      });
    } else if (updatedState.submitted) {
      nextMessages.push({
        id: assistantMessageId,
        role: 'assistant',
        title: 'Schedule published',
        body: 'Execution schedule published successfully. The timeline has been updated with the confirmed schedule. Execution teams can now see the plan.',
      });
    } else if (typeof option.nextStepIndex === 'number') {
      const nextStage = stagesRef.current[option.nextStepIndex];
      nextMessages.push(buildStageMessage(nextStage, assistantMessageId, updatedState));
    }

    setWorkspaceState(updatedState);
    setChatMessages((prev) => [...prev, ...nextMessages]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({behavior: 'smooth'}), 80);
  };

  const handleApproveAll = () => {
    const assistantMessageId = `assistant-${Date.now()}`;
    let updatedState: WorkspaceState = {
      ...workspaceState,
      currentStepIndex: 12,
      scheduleStatus: 'Pending Approval',
      resolvedExceptions: workspaceState.exceptionsCount,
      exceptions: workspaceState.exceptions.map((ex) => ({...ex, resolved: true})),
      exceptionsCount: 0,
      recentDecisions: [...workspaceState.recentDecisions, {label: 'All scheduled WOs approved via Approve All. Skipped to confirm step.', by: 'By You', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}],
    };
    updatedState = syncWorkspaceWithIteration(updatedState, Math.max(updatedState.currentIterationIndex, deriveIterationIndexFromStep(updatedState.currentStepIndex)));
    setLiveIteration(createNeutralIteration(AI_ITERATIONS[updatedState.currentIterationIndex]));
    const nextStage = stagesRef.current[12];
    const nextMessages: ChatMessage[] = [
      {id: `user-${Date.now()}`, role: 'user', title: 'Planner', body: 'Approve all scheduled WOs.'},
      buildStageMessage(nextStage, assistantMessageId, updatedState),
    ];
    setWorkspaceState(updatedState);
    setChatMessages((prev) => [...prev, ...nextMessages]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({behavior: 'smooth'}), 80);
  };

  const handleIterationDecision = (action: 'Accept AI Iteration' | 'Reject Iteration' | 'Adjust Constraints' | 'Lock Selected WOs' | 'Show Detailed Changes') => {
    setWorkspaceState((prev) => {
      let nextState = {...prev};
      if (action === 'Show Detailed Changes') {
        nextState = {...nextState, showDetailedChanges: !nextState.showDetailedChanges};
      } else if (action === 'Accept AI Iteration') {
        nextState = {...nextState, iterationReviewStatus: 'Accepted - pending apply', scheduleStatus: 'Pending Approval'};
      } else if (action === 'Reject Iteration') {
        nextState = {...nextState, iterationReviewStatus: 'Rejected by planner'};
      } else if (action === 'Adjust Constraints') {
        nextState = {...nextState, iterationReviewStatus: 'Constraint adjustments requested'};
      } else if (action === 'Lock Selected WOs') {
        nextState = {...nextState, iterationReviewStatus: 'Sequence lock requested'};
      }

      nextState = appendRecentDecision(nextState, `${action} on AI Planning Iteration ${currentIteration.iterationNumber}.`);
      return appendAuditEntry(nextState, action, nextState.approvalComment || undefined);
    });
  };

  const handleRequestNextIteration = () => {
    setWorkspaceState((prev) => {
      const nextIndex = Math.min(prev.currentIterationIndex + 1, AI_ITERATIONS.length - 1);
      let nextState = syncWorkspaceWithIteration({
        ...prev,
        iterationReviewStatus: `Next iteration requested: ${prev.selectedOptimizationPreference}`,
      }, nextIndex);
      nextState = appendRecentDecision(nextState, `Requested AI iteration ${AI_ITERATIONS[nextIndex].iterationNumber} with preference: ${prev.selectedOptimizationPreference}.`);
      return appendAuditEntry(nextState, 'Request Next Iteration', prev.selectedOptimizationPreference);
    });
    setLiveIteration(createNeutralIteration(AI_ITERATIONS[Math.min(workspaceState.currentIterationIndex + 1, AI_ITERATIONS.length - 1)]));
  };

  const handleCreateScenario = () => {
    const timeLabel = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    setWorkspaceState((prev) => {
      let nextState = appendRecentDecision(prev, `Scenario snapshot created from iteration ${AI_ITERATIONS[prev.currentIterationIndex].iterationNumber}.`);
      nextState = appendAuditEntry(nextState, 'Create Scenario', `Scenario snapshot created at ${timeLabel}`);
      return nextState;
    });
    setChatMessages((prev) => [
      ...prev,
      {id: `user-${Date.now()}`, role: 'user', title: 'Planner', body: 'Create a new scenario from the current execution plan.'},
      {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        title: 'Scenario created',
        body: `Scenario snapshot created successfully at ${timeLabel}. You can continue refining this execution plan without ending the current session.`,
      },
    ]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({behavior: 'smooth'}), 80);
  };

  const statusChipColor = workspaceState.submitted
    ? {bg: '#ECFDF3', color: '#027A48', border: '#ABEFC6'}
    : workspaceState.scheduleStatus === 'Confirmed' || workspaceState.scheduleStatus === 'Pending Approval'
    ? {bg: '#FFFBEB', color: '#B54708', border: '#FEC84B'}
    : {bg: '#F8FAFC', color: 'var(--planning-text-secondary)', border: '#E2E8F0'};

  return (
    <>
      <Paper
        variant="outlined"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          bgcolor: '#F4F7FB',
          overflow: 'hidden',
          borderColor: '#D8DEE8',
          boxShadow: 'var(--planning-soft-shadow)',
          ...(isFullscreen
            ? {position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1300, height: '100vh', minHeight: 'unset', borderRadius: 0}
            : {height: 'calc(100vh - 260px)', minHeight: 680, borderRadius: 3}
          ),
        }}
      >
        {/* Top progress bar */}
        <Box sx={{bgcolor: 'var(--planning-surface)', borderBottom: '1px solid var(--planning-border)', px: 2.5, pt: 1.5, pb: 1}}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 1.2}}>
            <Typography sx={{fontSize: 14, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Execution Planning Progress</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {workspaceState.planningHorizon ? (
                <Chip
                  label={`Horizon: ${workspaceState.planningHorizon}`}
                  size="small"
                  sx={{fontWeight: 700, bgcolor: 'var(--planning-neutral-bg)', color: '#1769FF', border: '1px solid #BFDBFE'}}
                />
              ) : null}
              {workspaceState.selectedStrategy ? (
                <Chip
                  label={workspaceState.selectedStrategy}
                  size="small"
                  sx={{fontWeight: 700, bgcolor: 'var(--planning-ai-accent-bg)', color: '#6D28D9', border: '1px solid #DDD6FE'}}
                />
              ) : null}
              <Chip
                label={workspaceState.submitted ? 'Published' : workspaceState.scheduleStatus}
                size="small"
                sx={{
                  fontWeight: 800,
                  bgcolor: statusChipColor.bg,
                  color: statusChipColor.color,
                  border: `1px solid ${statusChipColor.border}`,
                }}
              />
              <Button
                size="small"
                variant="outlined"
                onClick={handleCreateScenario}
                startIcon={<ScienceIcon sx={{fontSize: 14}} />}
                sx={{textTransform: 'none', fontWeight: 800, fontSize: 12}}
              >
                Create Scenario
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={handleRequestClose}
                startIcon={<CloseIcon sx={{fontSize: 14}} />}
                sx={{textTransform: 'none', fontWeight: 800, fontSize: 12}}
              >
                End Session
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => setIsFullscreen(v => !v)}
                sx={{minWidth: 0, px: 0.8, fontWeight: 800, fontSize: 12}}
              >
                {isFullscreen
                  ? <FullscreenExitIcon sx={{fontSize: 18}} />
                  : <FullscreenIcon sx={{fontSize: 18}} />
                }
              </Button>
            </Stack>
          </Stack>
          <Box sx={{overflowX: 'auto', pb: 0.5}}>
            <Stack direction="row" spacing={0} sx={{minWidth: 1200}}>
              {PROGRESS_STEPS.map((step, index) => {
                const completed = workspaceState.submitted || index < activeStepIndex;
                const active = !workspaceState.submitted && index === activeStepIndex;
                return (
                  <Box
                    key={step.label}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      '&::before': index > 0 ? {
                        content: '""',
                        position: 'absolute',
                        top: 13,
                        left: '-50%',
                        right: '50%',
                        height: 2,
                        bgcolor: completed || active ? '#6D28D9' : '#E2E8F0',
                      } : {},
                    }}
                  >
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: completed ? '#6D28D9' : active ? '#6D28D9' : '#E2E8F0',
                        color: completed || active ? '#FFFFFF' : '#94A3B8',
                        fontSize: 11,
                        fontWeight: 900,
                        border: active ? '2px solid #DDD6FE' : 'none',
                        zIndex: 1,
                        position: 'relative',
                      }}
                    >
                      {completed ? <CheckCircleIcon sx={{fontSize: 16}} /> : index + 1}
                    </Box>
                    <Typography
                      sx={{
                        fontSize: 9,
                        fontWeight: active ? 900 : 600,
                        color: active ? '#6D28D9' : completed ? '#1E293B' : '#94A3B8',
                        textAlign: 'center',
                        mt: 0.4,
                        whiteSpace: 'pre-line',
                        lineHeight: 1.2,
                      }}
                    >
                      {step.label}
                    </Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>
        </Box>

        {/* Main content area */}
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: 'minmax(0, 1fr) 320px'}, flex: 1, minHeight: 0}}>
          {/* Right (visually): Chat panel */}
          <Box sx={{display: 'flex', flexDirection: 'column', borderLeft: '1px solid #E2E8F0', minHeight: 0, order: {lg: 2}}}>
            {/* Chat header */}
            <Box
              sx={{
                px: 2,
                py: 1.5,
                background: 'linear-gradient(135deg, #2D1B69 0%, #4C1D95 58%, #6D28D9 100%)',
                flexShrink: 0,
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Avatar sx={{width: 36, height: 36, bgcolor: 'rgba(255,255,255,0.15)', color: '#FFFFFF'}}>
                  <AutoAwesomeIcon sx={{fontSize: 20}} />
                </Avatar>
                <Box>
                  <Typography sx={{fontSize: 15, fontWeight: 900, color: '#FFFFFF'}}>Execution Planning Assistant</Typography>
                  <Typography sx={{fontSize: 11.5, color: 'rgba(255,255,255,0.75)'}}>
                    {copilotRunState.isRunning ? 'Continuous copilot running and updating the plan live' : 'Your AI copilot for production scheduling'}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* Messages */}
            <Box sx={{flex: 1, overflowY: 'auto', px: 1.5, py: 1.5, bgcolor: 'var(--planning-surface)'}}>
              <Stack spacing={1.2}>
                {chatMessages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{display: 'flex', justifyContent: message.role === 'assistant' ? 'flex-start' : 'flex-end'}}
                  >
                    {message.role === 'assistant' ? (
                      <Stack direction="row" spacing={0.8} alignItems="flex-start" sx={{maxWidth: '95%'}}>
                        <Avatar sx={{width: 28, height: 28, bgcolor: '#F3F0FF', color: '#6D28D9', mt: 0.3, flexShrink: 0}}>
                          <AutoAwesomeIcon sx={{fontSize: 15}} />
                        </Avatar>
                        <Box>
                          <Paper
                            variant="outlined"
                            sx={{
                              px: 1.4,
                              py: 1,
                              bgcolor: message.kind === 'reasoning' ? '#F5F3FF' : message.kind === 'status' ? '#EEF6FF' : '#FFFFFF',
                              borderColor: message.kind === 'reasoning' ? '#DDD6FE' : message.kind === 'status' ? '#BFDBFE' : '#E2E8F0',
                              borderRadius: 2.5,
                            }}
                          >
                            {message.title ? (
                              <Typography sx={{fontSize: 11.5, fontWeight: 900, color: '#6D28D9', mb: 0.3}}>
                                {message.title}
                              </Typography>
                            ) : null}
                            <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-secondary)', whiteSpace: 'pre-line', lineHeight: 1.6}}>
                              {message.body}
                            </Typography>
                            {message.options && !workspaceState.submitted && !copilotRunState.isRunning && message.id === latestMessageId ? (
                              <Stack spacing={0.6} sx={{mt: 1}}>
                                {message.options.map((option) => (
                                  <Button
                                    key={`${message.id}-${option.label}`}
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOptionClick(option)}
                                    sx={{
                                      justifyContent: 'flex-start',
                                      textTransform: 'none',
                                      fontWeight: 700,
                                      fontSize: 12,
                                      borderRadius: 2,
                                      borderColor: '#DDD6FE',
                                      color: '#4C1D95',
                                      '&:hover': {borderColor: '#6D28D9', bgcolor: 'var(--planning-ai-accent-bg)'},
                                    }}
                                  >
                                    {option.label}
                                  </Button>
                                ))}
                              </Stack>
                            ) : null}
                          </Paper>
                          <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-muted)', mt: 0.3, ml: 0.5}}>
                            {new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                          </Typography>
                        </Box>
                      </Stack>
                    ) : (
                      <Box sx={{maxWidth: '85%'}}>
                        <Paper
                          variant="outlined"
                          sx={{px: 1.4, py: 1, bgcolor: 'var(--planning-ai-accent-bg)', borderColor: '#DDD6FE', borderRadius: 2.5}}
                        >
                          <Typography sx={{fontSize: 12.5, color: 'var(--planning-text-primary)', lineHeight: 1.5}}>
                            {message.body}
                          </Typography>
                        </Paper>
                        <Typography sx={{fontSize: 10.5, color: 'var(--planning-text-muted)', mt: 0.3, textAlign: 'right'}}>
                          {new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} ✓
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ))}
                <div ref={chatEndRef} />
              </Stack>
            </Box>

            <Divider />
            <Box sx={{p: 1.5, bgcolor: 'var(--planning-surface)', flexShrink: 0}}>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  placeholder={copilotRunState.isRunning ? 'Copilot is running the current iteration...' : 'Type a message...'}
                  size="small"
                  disabled={workspaceState.submitted || copilotRunState.isRunning}
                  sx={{'& .MuiOutlinedInput-root': {borderRadius: 3, fontSize: 13}}}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || workspaceState.submitted || copilotRunState.isRunning}
                  sx={{textTransform: 'none', fontWeight: 800, minWidth: 64, borderRadius: 3, bgcolor: '#6D28D9', '&:hover': {bgcolor: '#5B21B6'}}}
                >
                  {copilotRunState.isRunning ? 'Running' : 'Send'}
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Left (visually): Tabbed workspace */}
          <Box sx={{display: 'flex', flexDirection: 'column', minHeight: 0, overflowY: 'auto', bgcolor: 'var(--planning-surface-muted)', order: {lg: 1}}}>
            <Box sx={{bgcolor: 'var(--planning-surface)', borderBottom: '1px solid var(--planning-border)', px: 2, flexShrink: 0}}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Tabs
                  value={rightTab}
                  onChange={(_, v) => setRightTab(v)}
                  sx={{'& .MuiTab-root': {textTransform: 'none', fontWeight: 800, fontSize: 13}}}
                >
                  <Tab label="Schedule" />
                  <Tab label="WO Queue" />
                  <Tab label="Timeline" />
                </Tabs>
                {showApproveAll && rightTab !== 2 ? (
                  <Button
                    variant="contained"
                    startIcon={<DoneAllIcon sx={{fontSize: 16}} />}
                    onClick={handleApproveAll}
                    sx={{
                      bgcolor: '#027A48',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: 12,
                      textTransform: 'none',
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.5,
                      mr: 1,
                      boxShadow: 'none',
                      '&:hover': {bgcolor: '#015E38', boxShadow: 'none'},
                    }}
                  >
                    Approve All
                  </Button>
                ) : null}
              </Stack>
            </Box>

            {rightTab === 0 ? (
              <Box sx={{p: 2, display: 'flex', flexDirection: 'column', gap: 2}}>
                {/* KPI cards */}
                <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 1.5}}>
                  <KpiCard
                    label="WOs Scheduled"
                    value={String(workspaceState.scheduledCount)}
                    sub="of planned horizon"
                    icon={<CheckBoxIcon sx={{fontSize: 18, color: '#027A48'}} />}
                    iconBg="#ECFDF3"
                    valueColor="#027A48"
                  />
                  <KpiCard
                    label="WOs Unscheduled"
                    value={String(workspaceState.unscheduledCount)}
                    sub="constraints pending"
                    icon={<ScheduleIcon sx={{fontSize: 18, color: '#B54708'}} />}
                    iconBg="#FFFBEB"
                    valueColor="#B54708"
                  />
                  <KpiCard
                    label="WOs Blocked"
                    value={String(workspaceState.blockedCount)}
                    sub="require action"
                    icon={<BlockIcon sx={{fontSize: 18, color: '#B42318'}} />}
                    iconBg="#FEF2F2"
                    valueColor="#B42318"
                  />
                  <KpiCard
                    label="Utilization"
                    value={`${workspaceState.utilizationPercent}%`}
                    sub="avg across lines"
                    icon={<TrendingUpIcon sx={{fontSize: 18, color: '#6D28D9'}} />}
                    iconBg="#F5F3FF"
                  />
                  <KpiCard
                    label="Changeover Hrs"
                    value={`${workspaceState.changeoversHours}`}
                    sub="total setup time"
                    icon={<ScheduleIcon sx={{fontSize: 18, color: 'var(--planning-text-secondary)'}} />}
                    iconBg="#F8FAFC"
                  />
                  <KpiCard
                    label="Exceptions"
                    value={String(workspaceState.exceptionsCount)}
                    sub={workspaceState.resolvedExceptions > 0 ? `${workspaceState.resolvedExceptions} resolved` : 'review required'}
                    icon={<WarningAmberIcon sx={{fontSize: 18, color: workspaceState.exceptionsCount === 0 ? '#027A48' : '#B54708'}} />}
                    iconBg={workspaceState.exceptionsCount === 0 ? '#ECFDF3' : '#FFFBEB'}
                    valueColor={workspaceState.exceptionsCount === 0 ? '#027A48' : '#B54708'}
                  />
                </Box>

                <Paper variant="outlined" sx={{p: 2, bgcolor: 'var(--planning-surface)', borderColor: '#D8DEE8'}}>
                  <Stack spacing={2}>
                    <Stack direction={{xs: 'column', lg: 'row'}} justifyContent="space-between" spacing={2}>
                      <Box sx={{maxWidth: 860}}>
                        <Typography sx={{fontSize: 16, fontWeight: 900, color: 'var(--planning-text-primary)'}}>AI Planning Iteration Panel</Typography>
                      </Box>
                    </Stack>

                    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1.2fr 0.8fr'}, gap: 2}}>
                      <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'var(--planning-surface-muted)'}}>
                        <Typography sx={{fontSize: 12.5, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 1}}>Changes in this iteration</Typography>
                        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gap: 0.8}}>
                          {currentIteration.summaryChanges.map((item) => (
                            <Stack key={item} direction="row" spacing={0.8} alignItems="flex-start">
                              <SwapHorizIcon sx={{fontSize: 14, color: '#6D28D9', mt: 0.2}} />
                              <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', lineHeight: 1.5}}>{item}</Typography>
                            </Stack>
                          ))}
                        </Box>
                      </Paper>

                      <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'var(--planning-surface-muted)'}}>
                        <Typography sx={{fontSize: 12.5, fontWeight: 800, color: 'var(--planning-text-primary)', mb: 1}}>Iteration context</Typography>
                        <Stack spacing={0.8}>
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>Affected WOs: <strong>{currentIteration.affectedWos}</strong></Typography>
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>Open exceptions: <strong>{currentIteration.openExceptions.length}</strong></Typography>
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>Open constraints: <strong>{currentIteration.openConstraintCount}</strong></Typography>
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>Planner confirmation required before any proposal is applied.</Typography>
                        </Stack>
                      </Paper>
                    </Box>

                    <Paper variant="outlined" sx={{overflow: 'hidden'}}>
                      <Box sx={{px: 1.5, py: 1.1, borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
                        <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Before vs After KPI Comparison</Typography>
                      </Box>
                      <Box sx={{overflowX: 'auto'}}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{'& th': {fontSize: 11.5, fontWeight: 800, color: 'var(--planning-text-secondary)', bgcolor: 'var(--planning-surface-muted)'}}}>
                              <TableCell>KPI</TableCell>
                              <TableCell>Previous Plan</TableCell>
                              <TableCell>AI Iteration</TableCell>
                              <TableCell>Change</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {kpiRows.map((row) => (
                              <TableRow key={row.label} sx={{'& td': {fontSize: 11.5, borderColor: '#F1F5F9'}}}>
                                <TableCell sx={{fontWeight: 700, color: 'var(--planning-text-primary)'}}>{row.label}</TableCell>
                                <TableCell>{row.previous}</TableCell>
                                <TableCell>{row.current}</TableCell>
                                <TableCell sx={{fontWeight: 800, color: row.tone === 'positive' ? '#027A48' : row.tone === 'negative' ? '#B42318' : '#475467'}}>{row.delta}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Box>
                    </Paper>

                    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1fr 1fr'}, gap: 2}}>
                      <Paper variant="outlined" sx={{p: 1.5}}>
                        <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Efficiency Impact</Typography>
                        <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 0.4}}>Previous Plan vs AI Iteration</Typography>
                        <Stack spacing={0.7} sx={{mt: 1.2}}>
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>Total changeover time: <strong>{currentIteration.previousMetrics.totalChangeoverHrs.toFixed(1)} hrs</strong> → <strong>{currentIteration.currentMetrics.totalChangeoverHrs.toFixed(1)} hrs</strong></Typography>
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>Total idle time: <strong>{currentIteration.previousMetrics.totalIdleTimeHrs.toFixed(1)} hrs</strong> → <strong>{currentIteration.currentMetrics.totalIdleTimeHrs.toFixed(1)} hrs</strong></Typography>
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>Productive time: <strong>{currentIteration.previousMetrics.productiveTimeHrs.toFixed(1)} hrs</strong> → <strong>{currentIteration.currentMetrics.productiveTimeHrs.toFixed(1)} hrs</strong></Typography>
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>Effective utilization: <strong>{currentIteration.previousMetrics.effectiveUtilizationPct}%</strong> → <strong>{currentIteration.currentMetrics.effectiveUtilizationPct}%</strong></Typography>
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>Capacity remaining: <strong>{currentIteration.previousMetrics.remainingCapacityHrs.toFixed(1)} hrs</strong> → <strong>{currentIteration.currentMetrics.remainingCapacityHrs.toFixed(1)} hrs</strong></Typography>
                          <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)'}}>Overload hours: <strong>{currentIteration.previousMetrics.overloadHours.toFixed(1)} hrs</strong> → <strong>{currentIteration.currentMetrics.overloadHours.toFixed(1)} hrs</strong></Typography>
                        </Stack>
                        <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', mt: 1.3, lineHeight: 1.6}}>
                          AI explanation: "{currentIteration.efficiencyExplanation}"
                        </Typography>
                      </Paper>

                      <Paper variant="outlined" sx={{p: 1.5}}>
                        <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Idle Time by Reason</Typography>
                        <Box sx={{overflowX: 'auto', mt: 1}}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{'& th': {fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', bgcolor: 'var(--planning-surface-muted)'}}}>
                                <TableCell>Reason</TableCell>
                                <TableCell>Previous</TableCell>
                                <TableCell>AI Iteration</TableCell>
                                <TableCell>Change</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {[
                                ['Planned idle time', currentIteration.previousIdleBreakdown.plannedIdleHrs, currentIteration.currentIdleBreakdown.plannedIdleHrs],
                                ['Maintenance / downtime', currentIteration.previousIdleBreakdown.maintenanceDowntimeHrs, currentIteration.currentIdleBreakdown.maintenanceDowntimeHrs],
                                ['Material shortage', currentIteration.previousIdleBreakdown.materialShortageHrs, currentIteration.currentIdleBreakdown.materialShortageHrs],
                                ['Quality hold', currentIteration.previousIdleBreakdown.qualityHoldHrs, currentIteration.currentIdleBreakdown.qualityHoldHrs],
                                ['No eligible WO', currentIteration.previousIdleBreakdown.noEligibleWoHrs, currentIteration.currentIdleBreakdown.noEligibleWoHrs],
                                ['Labor gap', currentIteration.previousIdleBreakdown.laborGapHrs, currentIteration.currentIdleBreakdown.laborGapHrs],
                                ['Warehouse readiness issue', currentIteration.previousIdleBreakdown.warehouseReadinessHrs, currentIteration.currentIdleBreakdown.warehouseReadinessHrs],
                                ['Sterilization constraint', currentIteration.previousIdleBreakdown.sterilizationConstraintHrs, currentIteration.currentIdleBreakdown.sterilizationConstraintHrs],
                              ].map(([label, previous, current]) => (
                                <TableRow key={String(label)} sx={{'& td': {fontSize: 11.5, borderColor: '#F1F5F9'}}}>
                                  <TableCell sx={{fontWeight: 700, color: 'var(--planning-text-primary)'}}>{label}</TableCell>
                                  <TableCell>{Number(previous).toFixed(1)} hrs</TableCell>
                                  <TableCell>{Number(current).toFixed(1)} hrs</TableCell>
                                  <TableCell sx={{fontWeight: 800, color: Number(current) <= Number(previous) ? '#027A48' : '#B42318'}}>
                                    {formatIdleDelta(Number(previous), Number(current))}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Paper>
                    </Box>

                    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1fr 1fr'}, gap: 2}}>
                      <Paper variant="outlined" sx={{overflow: 'hidden'}}>
                        <Box sx={{px: 1.5, py: 1.1, borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
                          <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Line / Machine Impact</Typography>
                        </Box>
                        <Box sx={{overflowX: 'auto'}}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{'& th': {fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', bgcolor: 'var(--planning-surface-muted)'}}}>
                                <TableCell>Line / Machine</TableCell>
                                <TableCell>Previous utilization</TableCell>
                                <TableCell>New utilization</TableCell>
                                <TableCell>Remaining capacity</TableCell>
                                <TableCell>OEE</TableCell>
                                <TableCell>Downtime conflict</TableCell>
                                <TableCell>Idle time</TableCell>
                                <TableCell>Changeover time</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {currentIteration.lineImpact.map((row) => (
                                <TableRow key={row.line} sx={{'& td': {fontSize: 11.5, borderColor: '#F1F5F9'}}}>
                                  <TableCell sx={{fontWeight: 700, color: 'var(--planning-text-primary)'}}>{row.line}</TableCell>
                                  <TableCell>{row.previousUtilizationPct}%</TableCell>
                                  <TableCell>{row.newUtilizationPct}%</TableCell>
                                  <TableCell>{row.remainingCapacityHrs} hrs</TableCell>
                                  <TableCell>{row.oeePct}%</TableCell>
                                  <TableCell>{row.downtimeConflict}</TableCell>
                                  <TableCell>{row.idleTimeHrs.toFixed(1)} hrs</TableCell>
                                  <TableCell>{row.changeoverTimeHrs.toFixed(1)} hrs</TableCell>
                                  <TableCell sx={{fontWeight: 800, color: row.status === 'Feasible' ? '#027A48' : '#B54708'}}>{row.status}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Paper>

                      <Paper variant="outlined" sx={{overflow: 'hidden'}}>
                        <Box sx={{px: 1.5, py: 1.1, borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
                          <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Changeover Optimization Impact</Typography>
                        </Box>
                        <Box sx={{overflowX: 'auto'}}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{'& th': {fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', bgcolor: 'var(--planning-surface-muted)'}}}>
                                <TableCell>Metric</TableCell>
                                <TableCell>Previous</TableCell>
                                <TableCell>AI Iteration</TableCell>
                                <TableCell>Impact</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {currentIteration.changeoverImpact.map((row) => (
                                <TableRow key={row.metric} sx={{'& td': {fontSize: 11.5, borderColor: '#F1F5F9'}}}>
                                  <TableCell sx={{fontWeight: 700, color: 'var(--planning-text-primary)'}}>{row.metric}</TableCell>
                                  <TableCell>{row.previous}</TableCell>
                                  <TableCell>{row.current}</TableCell>
                                  <TableCell sx={{fontWeight: 800, color: row.tone === 'positive' ? '#027A48' : row.tone === 'negative' ? '#B42318' : '#475467'}}>{row.impact}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                        <Typography sx={{px: 1.5, py: 1.2, fontSize: 11.5, color: 'var(--planning-text-secondary)', lineHeight: 1.6}}>
                          AI explanation: "{currentIteration.changeoverExplanation}"
                        </Typography>
                      </Paper>
                    </Box>

                    {workspaceState.showDetailedChanges ? (
                      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1fr 1fr'}, gap: 2}}>
                        <Paper variant="outlined" sx={{overflow: 'hidden'}}>
                          <Box sx={{px: 1.5, py: 1.1, borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
                            <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>E&amp;O / Inventory Risk Impact</Typography>
                          </Box>
                          <Box sx={{overflowX: 'auto'}}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{'& th': {fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', bgcolor: 'var(--planning-surface-muted)'}}}>
                                  <TableCell>Product / Family</TableCell>
                                  <TableCell>Planned quantity</TableCell>
                                  <TableCell>Demand required</TableCell>
                                  <TableCell>Inventory after plan</TableCell>
                                  <TableCell>Min / Max status</TableCell>
                                  <TableCell>Shelf-life risk</TableCell>
                                  <TableCell>E&amp;O risk</TableCell>
                                  <TableCell>AI decision</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {currentIteration.inventoryRisk.map((row) => (
                                  <TableRow key={row.family} sx={{'& td': {fontSize: 11.5, borderColor: '#F1F5F9'}}}>
                                    <TableCell sx={{fontWeight: 700, color: 'var(--planning-text-primary)'}}>{row.family}</TableCell>
                                    <TableCell>{row.plannedQuantityK}k</TableCell>
                                    <TableCell>{row.demandRequiredK}k</TableCell>
                                    <TableCell>{row.inventoryAfterPlan}</TableCell>
                                    <TableCell>{row.minMaxStatus}</TableCell>
                                    <TableCell>{row.shelfLifeRisk}</TableCell>
                                    <TableCell sx={{fontWeight: 800, color: row.eoRisk === 'High' ? '#B42318' : row.eoRisk === 'Medium' ? '#B54708' : '#027A48'}}>{row.eoRisk}</TableCell>
                                    <TableCell>{row.aiDecision}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                          <Typography sx={{px: 1.5, py: 1.2, fontSize: 11.5, color: 'var(--planning-text-secondary)', lineHeight: 1.6}}>
                            AI explanation: "{currentIteration.inventoryExplanation}"
                          </Typography>
                        </Paper>

                        <Paper variant="outlined" sx={{overflow: 'hidden'}}>
                          <Box sx={{px: 1.5, py: 1.1, borderBottom: '1px solid var(--planning-border)', bgcolor: 'var(--planning-surface-muted)'}}>
                            <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>WO Movement Summary</Typography>
                          </Box>
                          <Box sx={{overflowX: 'auto'}}>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{'& th': {fontSize: 11, fontWeight: 800, color: 'var(--planning-text-secondary)', bgcolor: 'var(--planning-surface-muted)'}}}>
                                  <TableCell>WO</TableCell>
                                  <TableCell>Previous slot</TableCell>
                                  <TableCell>New slot</TableCell>
                                  <TableCell>Reason</TableCell>
                                  <TableCell>Impact</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {currentIteration.woMovements.map((row) => (
                                  <TableRow key={row.wo} sx={{'& td': {fontSize: 11.5, borderColor: '#F1F5F9'}}}>
                                    <TableCell sx={{fontWeight: 700, color: 'var(--planning-text-primary)'}}>{row.wo}</TableCell>
                                    <TableCell>{row.previousSlot}</TableCell>
                                    <TableCell>{row.newSlot}</TableCell>
                                    <TableCell>{row.reason}</TableCell>
                                    <TableCell>{row.impact}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        </Paper>
                      </Box>
                    ) : null}                    
                  </Stack>
                </Paper>

                {/* Schedule table */}
                <Paper variant="outlined" sx={{bgcolor: 'var(--planning-surface)', overflow: 'hidden'}}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{px: 2, py: 1.2, borderBottom: '1px solid var(--planning-border)'}}>
                    <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>Draft Schedule</Typography>
                    <Stack direction="row" spacing={1}>
                      <Box sx={{display: 'inline-flex', alignItems: 'center', px: 1, py: 0.3, borderRadius: 1, bgcolor: '#ECFDF3', border: '1px solid #ABEFC6'}}>
                        <Typography sx={{fontSize: 11, fontWeight: 700, color: '#027A48'}}>{workspaceState.scheduledCount} Scheduled</Typography>
                      </Box>
                      <Box sx={{display: 'inline-flex', alignItems: 'center', px: 1, py: 0.3, borderRadius: 1, bgcolor: '#FFFBEB', border: '1px solid #FEC84B'}}>
                        <Typography sx={{fontSize: 11, fontWeight: 700, color: '#B54708'}}>{workspaceState.unscheduledCount} Unscheduled</Typography>
                      </Box>
                      <Box sx={{display: 'inline-flex', alignItems: 'center', px: 1, py: 0.3, borderRadius: 1, bgcolor: '#FEF2F2', border: '1px solid #FECDCA'}}>
                        <Typography sx={{fontSize: 11, fontWeight: 700, color: '#B42318'}}>{workspaceState.blockedCount} Blocked</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                  <Box sx={{overflowX: 'auto'}}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{'& th': {bgcolor: 'var(--planning-surface-muted)', fontWeight: 800, fontSize: 12, color: 'var(--planning-text-secondary)'}}}>
                          <TableCell>WO Number</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell>Line</TableCell>
                          <TableCell>Shift</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Hrs</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {workspaceState.scheduleRows.map((row) => (
                          <TableRow key={row.woNumber} sx={{'& td': {fontSize: 12}}}>
                            <TableCell sx={{fontWeight: 700, color: 'var(--planning-text-primary)'}}>{row.woNumber}</TableCell>
                            <TableCell sx={{color: 'var(--planning-text-secondary)', maxWidth: 180}} title={row.product}>
                              <Typography sx={{fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180}}>
                                {row.product}
                              </Typography>
                            </TableCell>
                            <TableCell>{row.line}</TableCell>
                            <TableCell>{row.shift}</TableCell>
                            <TableCell>
                              <Typography sx={{fontSize: 11.5, fontWeight: 700, color: row.priorityColor}}>{row.priority}</Typography>
                            </TableCell>
                            <TableCell>{row.durationHrs}h</TableCell>
                            <TableCell>
                              <Box sx={{display: 'inline-flex', px: 0.8, py: 0.2, borderRadius: 1, bgcolor: row.statusBg}}>
                                <Typography sx={{fontSize: 11, fontWeight: 700, color: row.statusColor}}>{row.status}</Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>

                {/* Exceptions */}
                <Paper variant="outlined" sx={{bgcolor: 'var(--planning-surface)', overflow: 'hidden'}}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{px: 2, py: 1.2, borderBottom: '1px solid var(--planning-border)'}}>
                    <Typography sx={{fontSize: 13, fontWeight: 800, color: 'var(--planning-text-primary)'}}>
                      Exceptions ({workspaceState.exceptions.filter(e => !e.resolved).length} open)
                    </Typography>
                    {workspaceState.resolvedExceptions > 0 ? (
                      <Chip
                        label={`${workspaceState.resolvedExceptions} resolved`}
                        size="small"
                        sx={{fontWeight: 700, bgcolor: '#ECFDF3', color: '#027A48', border: '1px solid #ABEFC6'}}
                      />
                    ) : null}
                  </Stack>
                  <Stack spacing={0} divider={<Divider />}>
                    {workspaceState.exceptions.map((ex) => {
                      const colors = SEVERITY_COLORS[ex.severity];
                      return (
                        <Box key={ex.id} sx={{px: 2, py: 1.2, bgcolor: ex.resolved ? '#F8FAFC' : '#FFFFFF', opacity: ex.resolved ? 0.6 : 1}}>
                          <Stack direction="row" spacing={1} alignItems="flex-start">
                            {ex.resolved ? (
                              <CheckCircleIcon sx={{fontSize: 16, color: '#027A48', mt: 0.2, flexShrink: 0}} />
                            ) : ex.severity === 'Critical' ? (
                              <ErrorIcon sx={{fontSize: 16, color: '#B42318', mt: 0.2, flexShrink: 0}} />
                            ) : (
                              <WarningAmberIcon sx={{fontSize: 16, color: '#F79009', mt: 0.2, flexShrink: 0}} />
                            )}
                            <Box sx={{flex: 1, minWidth: 0}}>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{mb: 0.3}}>
                                <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-primary)'}}>{ex.woNumber} — {ex.type}</Typography>
                                <Box sx={{px: 0.6, py: 0.15, borderRadius: 0.8, bgcolor: colors.bg}}>
                                  <Typography sx={{fontSize: 10, fontWeight: 800, color: colors.color}}>{ex.severity}</Typography>
                                </Box>
                                {ex.resolved ? (
                                  <Box sx={{px: 0.6, py: 0.15, borderRadius: 0.8, bgcolor: '#ECFDF3'}}>
                                    <Typography sx={{fontSize: 10, fontWeight: 800, color: '#027A48'}}>Resolved</Typography>
                                  </Box>
                                ) : null}
                              </Stack>
                              <Typography sx={{fontSize: 11.5, color: 'var(--planning-text-secondary)', lineHeight: 1.5}}>{ex.description}</Typography>
                            </Box>
                          </Stack>
                        </Box>
                      );
                    })}
                  </Stack>
                </Paper>
              </Box>
            ) : rightTab === 1 ? (
              /* Queue tab */
              <Box sx={{p: 2}}>
                <Paper variant="outlined" sx={{bgcolor: 'var(--planning-surface)', overflow: 'hidden'}}>
                  <Box sx={{px: 2, py: 1.5, borderBottom: '1px solid var(--planning-border)'}}>
                    <Typography sx={{fontSize: 14, fontWeight: 800, color: 'var(--planning-text-primary)'}}>WO Planning Queue</Typography>
                    <Typography sx={{fontSize: 12, color: 'var(--planning-text-secondary)', mt: 0.3}}>
                      Horizon: {workspaceState.planningHorizon ?? 'Not selected'} — 7 Work Orders shown
                    </Typography>
                  </Box>
                  <Box sx={{overflowX: 'auto'}}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{'& th': {bgcolor: 'var(--planning-surface-muted)', fontWeight: 800, fontSize: 12, color: 'var(--planning-text-secondary)', borderBottom: '2px solid #E2E8F0', whiteSpace: 'nowrap'}}}>
                          <TableCell>WO Number</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell>Priority</TableCell>
                          <TableCell>Due Date</TableCell>
                          <TableCell>Readiness</TableCell>
                          <TableCell>Main Blocker</TableCell>
                          <TableCell>Eligible Line</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {BASE_QUEUE_ROWS.map((row, idx) => {
                          const rc = READINESS_COLORS[row.readiness];
                          return (
                            <TableRow
                              key={row.woNumber}
                              sx={{
                                bgcolor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                                '& td': {fontSize: 12, borderColor: '#F1F5F9'},
                              }}
                            >
                              <TableCell sx={{fontWeight: 700, color: 'var(--planning-text-primary)'}}>{row.woNumber}</TableCell>
                              <TableCell sx={{maxWidth: 200}} title={row.product}>
                                <Typography sx={{fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200}}>
                                  {row.product}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{fontSize: 11.5, fontWeight: 700, color: row.priorityColor}}>{row.priority}</Typography>
                              </TableCell>
                              <TableCell sx={{color: 'var(--planning-text-secondary)'}}>{row.dueDate}</TableCell>
                              <TableCell>
                                <Box sx={{display: 'inline-flex', px: 0.8, py: 0.2, borderRadius: 1, bgcolor: rc.bg}}>
                                  <Typography sx={{fontSize: 11, fontWeight: 700, color: rc.color}}>{row.readiness}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell sx={{color: row.blocker === '—' ? '#94A3B8' : '#475467'}}>{row.blocker}</TableCell>
                              <TableCell sx={{color: 'var(--planning-text-secondary)'}}>{row.eligibleLine}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </Box>
                </Paper>
              </Box>
            ) : (
              /* Timeline tab */
              <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0}}>
                <Box sx={{
                  px: 2, py: 0.75,
                  borderBottom: '1px solid var(--planning-border)',
                  bgcolor: 'var(--planning-surface-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0,
                }}>
                  <Typography sx={{fontSize: 12, fontWeight: 700, color: 'var(--planning-text-secondary)'}}>
                    {copilotRunState.isRunning ? 'AI Optimizing — gaps closing...' : 'AI Optimized Timeline'}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SwapVertIcon sx={{fontSize: 14}} />}
                    onClick={() => setTimelineTransposed((v) => !v)}
                    sx={{textTransform: 'none', fontWeight: 700, fontSize: 11, px: 1, py: 0.25, borderRadius: 1.5}}
                  >
                    {timelineTransposed ? 'Column view' : 'Row view'}
                  </Button>
                </Box>
                <Box sx={{flex: 1, minHeight: 0, overflow: 'hidden'}}>
                  <V2Timeline
                    lines={aiLines}
                    slots={aiTimelineSlots}
                    workOrders={liveTimelineWOs}
                    events={[]}
                    categories={AI_TIMELINE_CATEGORIES}
                    transposed={timelineTransposed}
                    isEditMode={false}
                    onToggleLine={(lineId) =>
                      setAiLines((prev) => prev.map((l) => (l.id === lineId ? {...l, expanded: !l.expanded} : l)))
                    }
                    onDropWorkOrder={() => {}}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      <Dialog open={exitConfirmOpen} onClose={() => setExitConfirmOpen(false)}>
        <DialogTitle sx={{fontWeight: 900}}>Exit Planning Session?</DialogTitle>
        <DialogContent>
          <Typography sx={{fontSize: 13, color: 'var(--planning-text-secondary)'}}>
            Current session progress will be lost. The schedule has not been saved.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExitConfirmOpen(false)} sx={{textTransform: 'none'}}>Cancel</Button>
          <Button onClick={handleResetAndClose} color="error" sx={{textTransform: 'none', fontWeight: 800}}>Exit</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

function KpiCard({label, value, sub, icon, iconBg, valueColor}: {label: string; value: string; sub: string; icon: ReactNode; iconBg: string; valueColor?: string}) {
  return (
    <Paper variant="outlined" sx={{p: 1.5, bgcolor: 'var(--planning-surface)'}}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{mb: 0.8}}>
        <Typography sx={{fontSize: 11, fontWeight: 700, color: 'var(--planning-text-secondary)'}}>{label}</Typography>
        <Box sx={{width: 28, height: 28, borderRadius: 1.5, bgcolor: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0}}>
          {icon}
        </Box>
      </Stack>
      <Typography sx={{fontSize: 18, fontWeight: 900, color: valueColor ?? '#1E293B', lineHeight: 1.1}}>{value}</Typography>
      <Typography sx={{fontSize: 11, color: 'var(--planning-text-secondary)', mt: 0.3}}>{sub}</Typography>
    </Paper>
  );
}
