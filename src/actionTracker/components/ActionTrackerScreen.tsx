import {useEffect, useMemo, useRef, useState} from 'react';
import {
  AccessTimeFilled as AccessTimeFilledIcon,
  Apps as AppsIcon,
  ArticleOutlined as DocumentIcon,
  ArrowBack as ArrowBackIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  AutoAwesome as SparkleIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  ChevronLeft as ChevronLeftIcon,
  SettingsOutlined as SettingsOutlinedIcon,
  EditOutlined as EditOutlinedIcon,
  FilterList as FilterListIcon,
  DeleteOutline as DeleteOutlineIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  Search as SearchIcon,
  SwapHorizOutlined as SwapHorizOutlinedIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon,
  TrendingUp as TrendingUpIcon,
  TaskAltOutlined as TaskAltOutlinedIcon,
  TipsAndUpdatesOutlined as TipsAndUpdatesOutlinedIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Popover,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  actionTrackerComments,
} from '../../data/mockData';
import {
  actionTrackerKanbanColumns,
  actionTrackerTableColumns,
  type ActionTrackerKanbanColumnId,
  type ActionTrackerTableColumnId,
} from '../config';
import type {AiMessage, AiPriorityProgressItem} from '../../aiHome/types';
import type {
  ActionTrackerCategory,
  ActionTrackerPriority,
  ActionTrackerRow,
  ActionTrackerStatus,
} from '../types';
import {getActionTrackerVisibleStatus, parseActionTrackerDate, resolveActionTrackerScope} from '../utils';
import {buildActionTrackerKpiSections} from '../kpiSections';
import ActionTrackerDashboardOperationalView from './ActionTrackerDashboardOperationalView';
import type {TierMeetingLaneSettings} from '../../tierMeeting/types';
import {useWorkstationContext} from '../../workstation/contexts/WorkstationContext';
import {
  tokenBrand,
  tokenDivider,
  tokenError,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
} from '../../workstation/theme';

import {useActionTrackerContext} from '../contexts/ActionTrackerContext';

type ActionTrackerScreenProps = {
  activePrimary: string;
  embedded?: boolean;
  initialViewMode?: 'table' | 'kanban';
  lightHeaderIconButtonSx: object;
  onBack?: () => void;
  settings?: TierMeetingLaneSettings;
  setAiMessages?: React.Dispatch<React.SetStateAction<AiMessage[]>>;
  aiProblemFilter?: string;
};

type HeaderView = 'actions' | 'dashboard';
type TableSortDirection = 'asc' | 'desc';
type TableSortState = {
  columnId: ActionTrackerTableColumnId;
  direction: TableSortDirection;
};

type AiPriorityRecommendation = {
  id: string;
  rank: number;
  signal: string;
  reason: string;
  recommendation: string;
};

type ActionTrackerDisplayRow = ActionTrackerRow & {
  scopePlant: string;
  scopeArea: string;
  scopeUnit: string;
  scopeLine: string;
  scopeZone: string;
  aiPriorityRank?: number;
  aiPrioritySignal?: string;
  aiPriorityReason?: string;
  aiPriorityRecommended: boolean;
  aiGeneratedAction: boolean;
  aiGeneratedReason?: string;
  originalPriority: ActionTrackerRow['priority'];
  originalIndex: number;
};

function normalizeProblemScope(value: string) {
  return value.trim().toLowerCase();
}

const getVisibleActionStatus = getActionTrackerVisibleStatus;

function getActionSourceTone(source: string) {
  if (source === 'ESO') {
    return {bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenDivider, rail: tokenSuccess.main};
  }
  if (source === 'Action Tracker') {
    return {bg: tokenBrand.softBg, color: tokenBrand.main, border: tokenDivider, rail: tokenBrand.main};
  }
  if (source === 'Shift Logbook') {
    return {bg: tokenWarning.softBg, color: tokenWarning.darker, border: tokenDivider, rail: tokenWarning.main};
  }
  if (source === 'Maintenance') {
    return {bg: tokenWarning.softBg, color: tokenWarning.darker, border: tokenDivider, rail: tokenWarning.dark};
  }
  if (source === 'BLU.AI') {
    return {bg: tokenBrand.softBg, color: tokenBrand.main, border: tokenDivider, rail: tokenBrand.main};
  }
  if (source === 'TMS 3' || source === 'Tier 3') {
    return {bg: tokenNeutral.lightest, color: tokenText.secondary, border: tokenDivider, rail: tokenText.secondary};
  }
  if (source === 'TMS 2' || source === 'Tier 2') {
    return {bg: tokenNeutral.lightest, color: tokenText.primary, border: tokenDivider, rail: tokenText.secondary};
  }
  if (source === 'TMS 1' || source === 'Tier 1' || source === 'Tier') {
    return {bg: tokenNeutral.lightest, color: tokenText.primary, border: tokenDivider, rail: tokenText.primary};
  }

  return {bg: tokenNeutral.lightest, color: tokenText.primary, border: tokenDivider, rail: tokenNeutral.dark};
}

function matchesProblemScope(row: ActionTrackerRow, problemScope: string) {
  const normalizedScope = normalizeProblemScope(problemScope);
  if (!normalizedScope) return true;

  const scopeTokens = normalizedScope.split(/\s+/).filter(Boolean);
  const searchableText = [
    row.title,
    row.problem,
    row.machine,
    row.plant,
    row.area,
    row.unit,
    row.line,
    row.zone,
    row.location,
    row.source,
    row.category,
  ].join(' ').toLowerCase();

  return scopeTokens.every((token) => searchableText.includes(token));
}

function rankProblemScopedRows(left: ActionTrackerRow, right: ActionTrackerRow) {
  const leftStatus = getVisibleActionStatus(left);
  const rightStatus = getVisibleActionStatus(right);
  const leftOverdue = leftStatus === 'Overdue' ? 1 : 0;
  const rightOverdue = rightStatus === 'Overdue' ? 1 : 0;
  if (leftOverdue !== rightOverdue) return rightOverdue - leftOverdue;

  const priorityDiff = getPrioritySortValue(left.priority) - getPrioritySortValue(right.priority);
  if (priorityDiff !== 0) return priorityDiff;

  const leftDueAt = parseActionTrackerDate(left.dueDate) ?? Number.MAX_SAFE_INTEGER;
  const rightDueAt = parseActionTrackerDate(right.dueDate) ?? Number.MAX_SAFE_INTEGER;
  return leftDueAt - rightDueAt;
}

function buildProblemScopeSummary(problemScope: string, rows: ActionTrackerRow[]) {
  const scopedOpenRows = rows.filter((row) => row.status !== 'Completed' && row.status !== 'Canceled');
  if (!problemScope.trim()) {
    return {
      userPrompt: 'Can you help me prioritize my open actions and bring the riskiest ones to the top?',
      progressDetail: 'Checking due dates, blockers, and repeated patterns.',
      candidateSummary: actionTrackerPriorityCandidateSummary,
      actionPrompt: actionTrackerPriorityActionPrompt,
      liveNarrative: actionTrackerAiCreatedNarrative,
      scopeBadge: '',
    };
  }

  if (!scopedOpenRows.length) {
    return {
      userPrompt: `Focus the prioritization on this problem: ${problemScope}`,
      progressDetail: `Checking actions connected to "${problemScope}".`,
      candidateSummary: `I scoped the review to "${problemScope}", but I do not see any open actions directly tied to that problem or equipment context right now.`,
      actionPrompt: 'You can keep the problem filter active and create a new action from that context if needed.',
      liveNarrative: `No live open actions matched "${problemScope}", so BLU.AI is holding the broader queue until you choose the next step.`,
      scopeBadge: `Scoped to ${problemScope}`,
    };
  }

  const topRows = [...scopedOpenRows].sort(rankProblemScopedRows).slice(0, 3);
  const overdueCount = scopedOpenRows.filter((row) => getVisibleActionStatus(row) === 'Overdue').length;
  const dueSoonCount = scopedOpenRows.filter((row) => {
    const dueAt = parseActionTrackerDate(row.dueDate);
    return dueAt !== null && dueAt >= Date.now() && (dueAt - Date.now()) <= (7 * 24 * 60 * 60 * 1000);
  }).length;
  const actionTitles = topRows.map((row) => `${row.id} (${row.title})`).join(', ');

  return {
    userPrompt: `Focus the prioritization on this problem: ${problemScope}`,
    progressDetail: `Checking actions connected to "${problemScope}".`,
    candidateSummary: `I scoped the queue to "${problemScope}" and found ${scopedOpenRows.length} relevant open action${scopedOpenRows.length === 1 ? '' : 's'}. ${overdueCount ? `${overdueCount} are already overdue. ` : ''}${dueSoonCount ? `${dueSoonCount} more are due within 7 days. ` : ''}The most relevant open actions are ${actionTitles}.`,
    actionPrompt: `I can prioritize the actions tied to "${problemScope}" first, explain why they matter, and keep the action list filtered to that context in the background.`,
    liveNarrative: `BLU.AI is now focusing the queue on "${problemScope}" so the actions, owners, and due dates tied to that problem stay visible together.`,
    scopeBadge: `Scoped to ${problemScope}`,
  };
}

type AiPrioritizationState = {
  hasAcceptedAiPrioritization: boolean;
  isAiPrioritizationApplying: boolean;
  aiPrioritizationVisibleCount: number;
};

const kanbanCategoryFilters: Array<{id: ActionTrackerCategory | ''; label: string; shortLabel: string; color: string; tint: string}> = [
  {id: '', label: 'All', shortLabel: 'All', color: tokenText.primary, tint: tokenNeutral.light},
  {id: 'SAFETY', label: 'Safety', shortLabel: 'S', color: tokenText.primary, tint: tokenNeutral.light},
  {id: 'QUALITY', label: 'Quality', shortLabel: 'Q', color: tokenText.primary, tint: tokenNeutral.light},
  {id: 'DELIVERY', label: 'Delivery', shortLabel: 'D', color: tokenText.primary, tint: tokenNeutral.light},
  {id: 'COST', label: 'Cost', shortLabel: 'C', color: tokenText.primary, tint: tokenNeutral.light},
  {id: 'PEOPLE', label: 'People', shortLabel: 'P', color: tokenText.primary, tint: tokenNeutral.light},
];

const kanbanCategoryTone = {
  SAFETY: {shortLabel: 'S', color: tokenText.secondary, tint: tokenNeutral.lightest},
  QUALITY: {shortLabel: 'Q', color: tokenText.secondary, tint: tokenNeutral.lightest},
  DELIVERY: {shortLabel: 'D', color: tokenText.secondary, tint: tokenNeutral.lightest},
  COST: {shortLabel: 'C', color: tokenText.secondary, tint: tokenNeutral.lightest},
  PEOPLE: {shortLabel: 'P', color: tokenText.secondary, tint: tokenNeutral.lightest},
} as const;

function getKanbanCategoryTone(category: ActionTrackerCategory) {
  return kanbanCategoryTone[category] ?? {
    shortLabel: category?.slice(0, 1).toUpperCase() || '?',
    color: tokenText.secondary,
    tint: tokenNeutral.lightest,
  };
}

function getKanbanStatusTone(status: ReturnType<typeof getVisibleActionStatus>) {
  if (status === 'Completed') return {bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenDivider};
  if (status === 'Reopened') return {bg: tokenWarning.softBg, color: tokenWarning.darker, border: tokenDivider};
  if (status === 'Under Approval') return {bg: tokenWarning.softBg, color: tokenWarning.darker, border: tokenDivider};
  if (status === 'Overdue') return {bg: tokenError.softBg, color: tokenError.main, border: tokenDivider};
  if (status === 'Canceled') return {bg: tokenNeutral.lightest, color: tokenText.secondary, border: tokenDivider};
  return {bg: tokenNeutral.lightest, color: tokenText.primary, border: tokenDivider};
}

function getKanbanSignalTone(row: ActionTrackerRow) {
  const visibleStatus = getVisibleActionStatus(row);
  const dueAt = parseActionTrackerDate(row.dueDate);
  const now = Date.now();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  const isDueSoon = dueAt !== null && dueAt >= now && (dueAt - now) <= threeDaysMs;

  if (visibleStatus === 'Overdue') {
    return {bg: tokenError.softBg, color: tokenError.main, border: tokenDivider};
  }
  if (row.status === 'Under Approval' || isDueSoon) {
    return {bg: tokenWarning.softBg, color: tokenWarning.darker, border: tokenDivider};
  }
  return {bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenDivider};
}

function getPrioritySortValue(priority: ActionTrackerPriority) {
  if (priority === 'High') return 0;
  if (priority === 'Medium') return 1;
  return 2;
}

const actionTrackerAiRecommendations: AiPriorityRecommendation[] = [
  {
    id: 'A8932001',
    rank: 1,
    signal: 'Approval bottleneck',
    reason: 'High-severity corrective action already escalated and waiting for approval.',
    recommendation: 'Resolve approval and close the stability verification first.',
  },
  {
    id: 'A8932006',
    rank: 2,
    signal: 'Repeated quality pattern',
    reason: 'Matches the same quality-risk cluster as other monitoring gaps on Line 3.',
    recommendation: 'Move this into the next active response slot before more validation work stacks up.',
  },
  {
    id: 'A8932002',
    rank: 3,
    signal: 'Compliance due-date risk',
    reason: 'Training action is tied to compliance readiness and is already beyond its target date.',
    recommendation: 'Escalate the training completion plan and assign a check-in today.',
  },
  {
    id: 'A8932004',
    rank: 4,
    signal: 'Open operational exposure',
    reason: 'Supplier audit risk is still open and shares upstream impact with the quality actions above.',
    recommendation: 'Keep this in the top bundle so material risk does not reopen downstream work.',
  },
  {
    id: 'A8932014',
    rank: 5,
    signal: 'Cross-shift containment gap',
    reason: 'Repeated startup scrap, release-comment pressure, and missing ownership point to a new containment action before the next handoff.',
    recommendation: 'Create a focused containment action now and assign a single owner before the next shift inherits the same risk.',
  },
];

const actionTrackerAiRecommendationMap = new Map(actionTrackerAiRecommendations.map((item) => [item.id, item]));
const actionTrackerAiGeneratedActionId = 'A8932014';
const actionTrackerAiGeneratedActionReason =
  'BLU.AI created this action after correlating repeated startup scrap in the Shift Logbook, unresolved release comments in Document Flow, and missing final ownership before handoff.';
const actionTrackerAiGeneratedAction: ActionTrackerRow = {
  id: actionTrackerAiGeneratedActionId,
  creationDate: 'Mar 20, 2026',
  source: 'BLU.AI',
  title: 'Create startup scrap containment plan before packaging handoff',
  problem: 'Startup scrap spike repeated across shifts while release comments and ownership gaps remain open.',
  type: 'Corrective',
  category: 'QUALITY',
  plant: 'TJ1',
  area: 'Assembly',
  unit: 'Assembly Unit 1',
  line: 'Line 2',
  zone: 'Zone 2',
  machine: 'Extrusion 2',
  location: 'Line 2',
  createdBy: 'BLU.AI',
  assignedTo: 'Avery Carter',
  reviewer: 'Ethan Walker',
  approver: 'Madison Brooks',
  dueDate: 'Mar 22, 2026',
  priority: 'High',
  shift: 'Night Shift',
  status: 'Open',
  suggestedActions: 'Lock one owner, confirm containment on the next startup, and close the document/comment loop before handoff.',
  supportNeeded: 'Cross-functional review',
  aiAssisted: true,
};
const actionTrackerPrioritizationReasons = [
  {
    label: '2 are overdue',
    detail: 'Approval and compliance pressure are already late.',
    tone: 'critical' as const,
  },
  {
    label: '3 have approaching due dates',
    detail: 'They cluster in the next 7 days with the same follow-up load.',
    tone: 'warning' as const,
  },
  {
    label: 'High impact on operations',
    detail: 'They tie directly to line stability, supplier risk, and open exposure.',
    tone: 'info' as const,
  },
];
const actionTrackerPrioritizationChanges = [
  'Top 5 moved up.',
  'Recommended items set to High.',
  '1 new AI-created action was added for startup scrap containment.',
  'Original queue preserved below.',
];
const actionTrackerReviewProgress: AiPriorityProgressItem[] = [
  { label: 'Scanning overdue and due-date pressure', state: 'done' },
  { label: 'Comparing approval blockers and repeated patterns', state: 'active' },
  { label: 'Building the priority focus bundle', state: 'pending' },
];
const actionTrackerReadyProgress: AiPriorityProgressItem[] = [
  { label: 'Scanning overdue and due-date pressure', state: 'done' },
  { label: 'Comparing approval blockers and repeated patterns', state: 'done' },
  { label: 'Building the priority focus bundle', state: 'active' },
];
const actionTrackerApplyProgress: AiPriorityProgressItem[] = [
  { label: 'Moving the top actions into focus', state: 'done' },
  { label: 'Promoting recommended items to High', state: 'active' },
  { label: 'Writing the rationale into the queue', state: 'pending' },
];

const actionTrackerPriorityCandidateSummary =
  'I found a top 5 focus bundle.\n2 actions are already overdue, 3 more land inside the next 7 days, and the strongest shared signals are approval blockers, repeated quality follow-up, and one missing containment action BLU.AI should create now.';
const actionTrackerPriorityActionPrompt =
  'I can move those 5 to the top, promote the recommended ones to High, create the missing containment action, and show the reorder live in the tracker.';
const actionTrackerAiCreatedNarrative =
  'I also created action A8932014 because the startup scrap spike repeated across shifts on Line 2, Document Flow still shows unresolved release comments, and the handoff path had no single owner to close the containment loop.';
const actionTrackerPrioritizationMethodNarrative =
  'BLU.AI prioritized your actions by combining overdue pressure, due-date proximity, repeated quality patterns, approval blockers, and operational exposure across the same lines and owners.';
const actionTrackerAutoOpenAiFlag = 'action-tracker-open-ai-prioritization';

const actionTrackerButtonSx = {
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
} as const;

const actionTrackerOutlinedButtonSx = {
  ...actionTrackerButtonSx,
  color: tokenBrand.main,
  borderColor: tokenBrand.main,
  '&:hover': {
    borderColor: tokenBrand.dark,
    bgcolor: tokenBrand.softBg,
    boxShadow: 'none',
  },
} as const;

const actionTrackerContainedButtonSx = {
  ...actionTrackerButtonSx,
  bgcolor: tokenBrand.main,
  color: tokenBrand.contrast,
  '&:hover': {
    bgcolor: tokenBrand.dark,
    boxShadow: 'none',
  },
  '&.Mui-disabled': {
    bgcolor: tokenNeutral.main,
    color: tokenText.disabled,
  },
} as const;

const actionTrackerIconButtonSx = {
  width: 36,
  height: 36,
  borderRadius: '8px',
  border: `1px solid ${tokenDivider}`,
  color: tokenText.secondary,
  bgcolor: 'background.paper',
  '&:hover': {
    color: tokenBrand.main,
    bgcolor: tokenBrand.softBg,
  },
} as const;

const actionTrackerTabButtonSx = (active: boolean) => ({
  py: 1,
  borderRadius: 0,
  cursor: 'pointer',
  color: active ? tokenText.primary : tokenText.secondary,
  borderBottom: active ? `2px solid ${tokenBrand.main}` : '2px solid transparent',
  fontSize: '0.875rem',
  fontWeight: active ? 700 : 500,
  letterSpacing: '0.1px',
  transition: 'all 0.2s ease',
  userSelect: 'none',
  '&:hover': {
    color: tokenBrand.main,
  },
});

const actionTrackerHeaderActionSx = {
  ...actionTrackerContainedButtonSx,
  minHeight: 36,
  px: 1.5,
  fontSize: '0.8125rem',
  letterSpacing: '0.46px',
} as const;

function buildActionTrackerDisplayRows(
  rows: ActionTrackerRow[],
  {
    hasAcceptedAiPrioritization,
    isAiPrioritizationApplying,
    aiPrioritizationVisibleCount,
  }: AiPrioritizationState,
): ActionTrackerDisplayRow[] {
  const shouldShowAiPriorityRows = hasAcceptedAiPrioritization || isAiPrioritizationApplying;
  const sourceRows = shouldShowAiPriorityRows && !rows.some((row) => row.id === actionTrackerAiGeneratedActionId)
    ? [...rows, actionTrackerAiGeneratedAction]
    : rows;

  const enhancedRows = sourceRows.map((row, index) => {
    const resolvedScope = resolveActionTrackerScope(row);
    const recommendation = actionTrackerAiRecommendationMap.get(row.id);
    const aiPriorityRecommended = Boolean(recommendation) && (
      hasAcceptedAiPrioritization
      || (isAiPrioritizationApplying && recommendation.rank <= aiPrioritizationVisibleCount)
    );
    const aiGeneratedAction = row.id === actionTrackerAiGeneratedActionId;

    return {
      ...row,
      scopePlant: resolvedScope.plant,
      scopeArea: resolvedScope.area,
      scopeUnit: resolvedScope.unit,
      scopeLine: resolvedScope.line,
      scopeZone: resolvedScope.zone,
      priority: aiPriorityRecommended ? 'High' : row.priority,
      aiAssisted: aiPriorityRecommended ? true : row.aiAssisted,
      aiPriorityRank: recommendation?.rank,
      aiPrioritySignal: recommendation?.signal,
      aiPriorityReason: recommendation?.reason,
      aiPriorityRecommended,
      aiGeneratedAction,
      aiGeneratedReason: aiGeneratedAction ? actionTrackerAiGeneratedActionReason : undefined,
      originalPriority: row.priority,
      originalIndex: index,
    };
  });

  if (!shouldShowAiPriorityRows) {
    return enhancedRows;
  }

  return [...enhancedRows].sort((left, right) => {
    const leftRank = left.aiPriorityRecommended ? left.aiPriorityRank ?? 999 : 9999;
    const rightRank = right.aiPriorityRecommended ? right.aiPriorityRank ?? 999 : 9999;
    if (leftRank !== rightRank) return leftRank - rightRank;
    return left.originalIndex - right.originalIndex;
  });
}

function normalizeVisibleTableColumnIds(columnIds?: readonly string[]) {
  const availableColumnIds = actionTrackerTableColumns.map((column) => column.id);
  const normalized = (columnIds ?? [])
    .flatMap((columnId) => columnId === 'location' ? ['plant', 'area', 'unit', 'line'] : [columnId])
    .filter((columnId): columnId is ActionTrackerTableColumnId => availableColumnIds.includes(columnId as ActionTrackerTableColumnId));

  return normalized.length
    ? Array.from(new Set(normalized))
    : actionTrackerTableColumns.filter((column) => column.id !== 'type').map((column) => column.id);
}

export default function ActionTrackerScreen({
  activePrimary,
  embedded = false,
  initialViewMode,
  lightHeaderIconButtonSx,
  onBack,
  settings,
  setAiMessages,
  aiProblemFilter: controlledAiProblemFilter,
}: ActionTrackerScreenProps) {
  const updateAiMessages: React.Dispatch<React.SetStateAction<AiMessage[]>> = typeof setAiMessages === 'function'
    ? setAiMessages
    : () => undefined;
  const {
    actionTrackerItems,
    displayedActionTrackerKpis: kpis,
    applySummaryFilter,
    filteredActionTrackerRows: rows,
    baseFilteredActionTrackerRows,
    actionTrackerView: view,
    setActionTrackerView: onViewChange,
    actionTrackerBoardCategoryFilter: boardCategoryFilter,
    setActionTrackerBoardCategoryFilter,
    isActionFilterModalOpen,
    actionFilterValues,
    setActionFilterValues,
    clearActionFilters,
    setIsActionCreateDrawerOpen,
    setIsActionFilterModalOpen,
    openActionTrackerDetails: onOpenDetails,
    setSelectedActionTrackerItem,
  } = useActionTrackerContext();
  const {setIsAiDrawerOpen, setAiDrawerWidth} = useWorkstationContext();

  const onClearBoardCategoryFilter = () => setActionTrackerBoardCategoryFilter('');
  const onOpenCreateDrawer = () => {
    setSelectedActionTrackerItem(null);
    setIsActionCreateDrawerOpen(true);
  };
  const onOpenFilters = () => setIsActionFilterModalOpen(true);
  const onOpenDocumentOperations = () => {
    // This might need a context too or stay as prop if it's navigation only
  };
  const [headerView, setHeaderView] = useState<HeaderView>('actions');
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);
  const [hasAcceptedAiPrioritization, setHasAcceptedAiPrioritization] = useState(false);
  const [isAiPrioritizationApplying, setIsAiPrioritizationApplying] = useState(false);
  const [aiPrioritizationVisibleCount, setAiPrioritizationVisibleCount] = useState(0);
  const [aiPriorityAnimatingRank, setAiPriorityAnimatingRank] = useState<number | null>(null);
  const [isAiInsightsExpanded, setIsAiInsightsExpanded] = useState(true);
  const aiDrawerSequenceTimeoutsRef = useRef<number[]>([]);
  const visibleComponents = new Set(settings?.visibleComponentIds ?? ['aiInsights', 'kpis', 'quickLinks']);
  const orderedComponents = settings?.componentOrder ?? ['aiInsights', 'kpis', 'quickLinks'];
  const defaultVisibleTableColumnIds = useMemo<ActionTrackerTableColumnId[]>(() => (
    normalizeVisibleTableColumnIds(settings?.visibleTableColumnIds as unknown as string[] | undefined)
  ), [settings?.visibleTableColumnIds]);
  const defaultVisibleKanbanColumnIds = useMemo<ActionTrackerKanbanColumnId[]>(() => (
    settings?.visibleKanbanColumnIds?.length
      ? settings.visibleKanbanColumnIds
      : actionTrackerKanbanColumns.map((column) => column.id)
  ), [settings?.visibleKanbanColumnIds]);
  const [visibleTableColumnIds, setVisibleTableColumnIds] = useState<ActionTrackerTableColumnId[]>(defaultVisibleTableColumnIds);
  const [visibleKanbanColumnIds, setVisibleKanbanColumnIds] = useState<ActionTrackerKanbanColumnId[]>(defaultVisibleKanbanColumnIds);
  const [tableSort, setTableSort] = useState<TableSortState | null>(null);
  const [localAiProblemFilter, setLocalAiProblemFilter] = useState('');
  const aiProblemFilter = controlledAiProblemFilter ?? localAiProblemFilter;
  const visibleTableColumns = actionTrackerTableColumns.filter((column) => visibleTableColumnIds.includes(column.id));
  const visibleKanbanColumns = actionTrackerKanbanColumns.filter((column) => visibleKanbanColumnIds.includes(column.id));
  const tableGridTemplateColumns = visibleTableColumns.map((column) => column.width).join(' ');

  const displayedRows = useMemo<ActionTrackerDisplayRow[]>(() => buildActionTrackerDisplayRows(rows, {
    hasAcceptedAiPrioritization,
    isAiPrioritizationApplying,
    aiPrioritizationVisibleCount,
  }), [aiPrioritizationVisibleCount, hasAcceptedAiPrioritization, isAiPrioritizationApplying, rows]);
  const ownerOptions = useMemo(
    () => Array.from(new Set(baseFilteredActionTrackerRows.map((row) => row.assignedTo))).sort(),
    [baseFilteredActionTrackerRows],
  );
  const createdByOptions = useMemo(
    () => Array.from(new Set(baseFilteredActionTrackerRows.map((row) => row.createdBy))).sort(),
    [baseFilteredActionTrackerRows],
  );
  const sourceOptions = useMemo(
    () => Array.from(new Set(baseFilteredActionTrackerRows.map((row) => row.source))).sort(),
    [baseFilteredActionTrackerRows],
  );
  const categoryOptions = useMemo(
    () => Array.from(new Set(baseFilteredActionTrackerRows.map((row) => row.category))).sort(),
    [baseFilteredActionTrackerRows],
  );
  const statusOptions = useMemo(
    () => ['Open', 'Reopened', 'Under Approval', 'Completed', 'Canceled', 'Overdue'] as ActionTrackerStatus[],
    [],
  );
  const problemScopedRows = useMemo(
    () => baseFilteredActionTrackerRows.filter((row) => matchesProblemScope(row, aiProblemFilter)),
    [aiProblemFilter, baseFilteredActionTrackerRows],
  );
  const problemScopeSummary = useMemo(
    () => buildProblemScopeSummary(aiProblemFilter, problemScopedRows),
    [aiProblemFilter, problemScopedRows],
  );
  const sortedDisplayedRows = useMemo(() => {
    if (!tableSort) return displayedRows;

    const getSortValue = (row: ActionTrackerDisplayRow) => {
      if (tableSort.columnId === 'id') return row.id;
      if (tableSort.columnId === 'creationDate') return parseActionTrackerDate(row.creationDate) ?? 0;
      if (tableSort.columnId === 'source') return row.source.toLowerCase();
      if (tableSort.columnId === 'title') return row.title.toLowerCase();
      if (tableSort.columnId === 'type') return row.type.toLowerCase();
      if (tableSort.columnId === 'category') return row.category.toLowerCase();
      if (tableSort.columnId === 'plant') return row.scopePlant.toLowerCase();
      if (tableSort.columnId === 'area') return row.scopeArea.toLowerCase();
      if (tableSort.columnId === 'unit') return row.scopeUnit.toLowerCase();
      if (tableSort.columnId === 'line') return row.scopeLine.toLowerCase();
      if (tableSort.columnId === 'zone') return row.scopeZone.toLowerCase();
      if (tableSort.columnId === 'machine') return (row.machine ?? '').toLowerCase();
      if (tableSort.columnId === 'createdBy') return row.createdBy.toLowerCase();
      if (tableSort.columnId === 'assignedTo') return row.assignedTo.toLowerCase();
      if (tableSort.columnId === 'dueDate') return parseActionTrackerDate(row.dueDate) ?? 0;
      if (tableSort.columnId === 'priority') return getPrioritySortValue(row.priority);
      return getVisibleActionStatus(row).toLowerCase();
    };

    return [...displayedRows].sort((left, right) => {
      const leftValue = getSortValue(left);
      const rightValue = getSortValue(right);
      if (leftValue < rightValue) return tableSort.direction === 'asc' ? -1 : 1;
      if (leftValue > rightValue) return tableSort.direction === 'asc' ? 1 : -1;
      return left.originalIndex - right.originalIndex;
    });
  }, [displayedRows, tableSort]);
  const priorityFocusCards: any[] = [];
  useEffect(() => {
    setActionFilterValues((current) => {
      const nextSearchTerm = aiProblemFilter.trim();
      return current.searchTerm === nextSearchTerm
        ? current
        : {
            ...current,
            searchTerm: nextSearchTerm,
          };
    });
  }, [aiProblemFilter, setActionFilterValues]);
  const clearAiDrawerSequence = () => {
    aiDrawerSequenceTimeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
    aiDrawerSequenceTimeoutsRef.current = [];
  };

  const buildAiExplanationFollowUpMessage = (): AiMessage => ({
    role: 'assistant',
    text: 'Want to understand the result?',
    variant: 'quick_actions',
    quickActions: [
      {
        label: 'How BLU.AI prioritized',
        icon: <SparkleIcon sx={{fontSize: 16}} />,
        action: () => openAiPrioritizationMethodChat({preserveHistory: true}),
      },
      {
        label: 'Why BLU.AI created action',
        icon: <TipsAndUpdatesOutlinedIcon sx={{fontSize: 16}} />,
        action: () => openAiCreatedActionReasonChat({preserveHistory: true}),
      },
    ],
  });

  const runAiDrawerResponseSequence = (
    userText: string,
    typingHeading: string,
    assistantMessages: AiMessage[],
    options?: {
      preserveHistory?: boolean;
    },
  ) => {
    clearAiDrawerSequence();
    setAiDrawerWidth(430);
    setIsAiDrawerOpen(true);

    const typingMessage: AiMessage = {
      role: 'assistant',
      text: '',
      variant: 'typing',
      heading: typingHeading,
    };

    if (options?.preserveHistory) {
      updateAiMessages((current) => [
        ...current,
        {role: 'user', text: userText},
        typingMessage,
      ]);
    } else {
      updateAiMessages([
        {role: 'user', text: userText},
        typingMessage,
      ]);
    }

    aiDrawerSequenceTimeoutsRef.current = [
      window.setTimeout(() => {
        if (options?.preserveHistory) {
          updateAiMessages((current) => {
            const next = [...current];
            const typingIndex = next.findLastIndex((message) => (
              message.role === 'assistant'
              && message.variant === 'typing'
              && message.heading === typingHeading
            ));

            if (typingIndex !== -1) {
              next.splice(typingIndex, 1);
            }

            return [
              ...next,
              ...assistantMessages,
            ];
          });
          return;
        }

        updateAiMessages([
          {role: 'user', text: userText},
          ...assistantMessages,
        ]);
      }, 900),
    ];
  };

  const acceptAiPrioritizationFromChat = () => {
    clearAiDrawerSequence();
    setHasAcceptedAiPrioritization(false);
    setIsAiPrioritizationApplying(true);
    setAiPrioritizationVisibleCount(0);
    setAiPriorityAnimatingRank(null);
    setAiDrawerWidth(430);
    setIsAiDrawerOpen(true);
    const baseMessages: AiMessage[] = [
      { role: 'user', text: problemScopeSummary.userPrompt },
      {
        role: 'assistant',
        text: aiProblemFilter
          ? `I reviewed the queue with the problem scope "${aiProblemFilter}" applied.`
          : 'I reviewed overdue pressure, approval blockers, repeated quality patterns, and follow-up exposure across this queue.',
        variant: 'priority_progress' as const,
        heading: aiProblemFilter ? 'Problem scope prioritized' : 'Priority bundle identified',
        progressTitle: 'Applying top 5 focus',
        progressDetail: aiProblemFilter
          ? `Reordering and promoting the selected actions tied to "${aiProblemFilter}".`
          : 'Reordering and promoting the selected actions.',
        progressItems: actionTrackerApplyProgress,
      },
    ];

    updateAiMessages([
      ...baseMessages,
      {
        role: 'assistant',
        text: '',
        variant: 'typing',
        heading: 'Applying prioritization',
      },
    ]);

    const sequenceTimeouts = [
      window.setTimeout(() => {
        updateAiMessages(baseMessages);
      }, 600),
      window.setTimeout(() => {
        updateAiMessages([
          ...baseMessages,
          {
            role: 'assistant',
            text: aiProblemFilter
              ? `I am moving the focus bundle for "${aiProblemFilter}" into the queue now so you can watch the riskiest related actions climb first.`
              : 'I am moving the focus bundle into the queue now so you can watch the riskiest actions climb first.',
          },
          {
            role: 'assistant',
            text: '',
            variant: 'typing',
            heading: 'Explaining why these actions moved',
          },
        ]);
      }, 1500),
      window.setTimeout(() => {
        updateAiMessages([
          ...baseMessages,
          {
            role: 'assistant',
            text: problemScopeSummary.candidateSummary,
          },
          {
            role: 'assistant',
            text: aiProblemFilter ? problemScopeSummary.liveNarrative : actionTrackerAiCreatedNarrative,
          },
          {
            role: 'assistant',
            text: '',
            variant: 'typing',
            heading: 'Finishing the queue update',
          },
        ]);
      }, 2450),
      window.setTimeout(() => {
        setIsAiPrioritizationApplying(false);
        setHasAcceptedAiPrioritization(true);
        setAiPriorityAnimatingRank(null);
        updateAiMessages([
          ...baseMessages,
          {
            role: 'assistant',
            text: aiProblemFilter ? problemScopeSummary.liveNarrative : actionTrackerAiCreatedNarrative,
          },
          {
            role: 'assistant',
            text: aiProblemFilter ? `The prioritization for "${aiProblemFilter}" is live.` : 'The prioritization is live.',
            variant: 'priority_summary',
            heading: aiProblemFilter ? 'Problem filter applied' : 'Priority applied',
            badge: problemScopeSummary.scopeBadge || 'Top 5 live',
            priorityReasons: actionTrackerPrioritizationReasons,
            priorityChanges: actionTrackerPrioritizationChanges,
          },
          buildAiExplanationFollowUpMessage(),
        ]);
      }, 3600),
    ];

    actionTrackerAiRecommendations.forEach((recommendation) => {
      sequenceTimeouts.push(
        window.setTimeout(() => {
          setAiPrioritizationVisibleCount(recommendation.rank);
          setAiPriorityAnimatingRank(recommendation.rank);
        }, 850 + (recommendation.rank * 360)),
      );
    });

    actionTrackerAiRecommendations.forEach((recommendation) => {
      sequenceTimeouts.push(
        window.setTimeout(() => {
          setAiPriorityAnimatingRank((current) => (
            current === recommendation.rank ? null : current
          ));
        }, 1180 + (recommendation.rank * 360)),
      );
    });

    aiDrawerSequenceTimeoutsRef.current = sequenceTimeouts;
  };

  const openAiPrioritizationChat = () => {
    clearAiDrawerSequence();
    setAiDrawerWidth(520);
    setIsAiDrawerOpen(true);
    setIsAiPrioritizationApplying(false);
    setAiPriorityAnimatingRank(null);

    const userTypingMessage: AiMessage = {
      role: 'user',
      text: '',
      variant: 'typing',
      heading: 'Typing request',
    };
    const userMessage: AiMessage = {
      role: 'user',
      text: problemScopeSummary.userPrompt,
    };
    const reviewTypingMessage: AiMessage = {
      role: 'assistant',
      text: '',
      variant: 'typing',
      heading: 'Reviewing action queue',
    };
    const nextStepsTypingMessage: AiMessage = {
      role: 'assistant',
      text: '',
      variant: 'typing',
      heading: 'Preparing next steps',
    };
    const reviewMessage: AiMessage = {
      role: 'assistant',
      text: problemScopeSummary.candidateSummary,
      variant: 'priority_summary',
      heading: aiProblemFilter ? 'Problem scope review' : 'Action prioritization review',
      badge: problemScopeSummary.scopeBadge || (hasAcceptedAiPrioritization ? 'Priority applied' : 'Top 5 ready'),
      priorityReasons: actionTrackerPrioritizationReasons,
      priorityChanges: hasAcceptedAiPrioritization ? actionTrackerPrioritizationChanges : undefined,
      priorityCards: actionTrackerAiRecommendations.map((item) => ({
        id: item.id,
        title: item.recommendation,
        signal: item.signal,
        detail: item.reason,
        rank: item.rank,
        priority: 'High',
        accent: tokenBrand.main,
      })),
      compactCards: true,
    };
    const quickActionsMessage: AiMessage = {
      role: 'assistant',
      text: problemScopeSummary.actionPrompt,
      variant: 'quick_actions',
      quickActions: [
        {
          label: hasAcceptedAiPrioritization ? 'Apply again' : 'Apply prioritization',
          icon: <SparkleIcon sx={{fontSize: 16}} />,
          action: acceptAiPrioritizationFromChat,
        },
        {
          label: 'Explain method',
          icon: <TipsAndUpdatesOutlinedIcon sx={{fontSize: 16}} />,
          action: () => openAiPrioritizationMethodChat({preserveHistory: true}),
        },
        {
          label: 'Why new action',
          icon: <DocumentIcon sx={{fontSize: 16}} />,
          action: () => openAiCreatedActionReasonChat({preserveHistory: true}),
        },
      ],
    };

    updateAiMessages([userTypingMessage]);
    aiDrawerSequenceTimeoutsRef.current = [
      window.setTimeout(() => {
        updateAiMessages([userMessage, reviewTypingMessage]);
      }, 650),
      window.setTimeout(() => {
        updateAiMessages([userMessage, reviewMessage, nextStepsTypingMessage]);
      }, 1750),
      window.setTimeout(() => {
        updateAiMessages([userMessage, reviewMessage, quickActionsMessage]);
      }, 2850),
    ];
  };

  const openAiPrioritizationMethodChat = (options?: {preserveHistory?: boolean}) => {
    runAiDrawerResponseSequence(
      'How did BLU.AI prioritize my actions?',
      'Explaining the prioritization logic',
      [
      {
        role: 'assistant',
        text: actionTrackerPrioritizationMethodNarrative,
      },
      {
        role: 'assistant',
        text: 'The main drivers were overdue work first, then actions due soon, then items sharing the same risk cluster or blocked approval path.',
        variant: 'priority_summary',
        heading: 'Prioritization method',
        badge: 'Explained',
        priorityReasons: actionTrackerPrioritizationReasons,
        priorityChanges: actionTrackerPrioritizationChanges,
      },
      ],
      options,
    );
  };

  const openAiCreatedActionReasonChat = (options?: {preserveHistory?: boolean}) => {
    runAiDrawerResponseSequence(
      'Why did BLU.AI create a new action in my top 5?',
      'Explaining why the action was created',
      [
      {
        role: 'assistant',
        text: actionTrackerAiCreatedNarrative,
      },
      {
        role: 'assistant',
        text: 'It was created to force one containment owner across startup scrap, release-comment cleanup, and the next handoff so the same issue does not roll into the next shift.',
      },
      ],
      options,
    );
  };

  useEffect(() => {
    setVisibleTableColumnIds(defaultVisibleTableColumnIds);
  }, [defaultVisibleTableColumnIds]);

  useEffect(() => {
    setVisibleKanbanColumnIds(defaultVisibleKanbanColumnIds);
  }, [defaultVisibleKanbanColumnIds]);

  useEffect(() => {
    if (!initialViewMode || view === initialViewMode) return;
    onViewChange(initialViewMode);
  }, [initialViewMode, onViewChange, view]);

  useEffect(() => {
    return () => clearAiDrawerSequence();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.sessionStorage.getItem(actionTrackerAutoOpenAiFlag) !== 'true') return;

    window.sessionStorage.removeItem(actionTrackerAutoOpenAiFlag);
    const timeoutId = window.setTimeout(() => {
      openAiPrioritizationChat();
    }, 180);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const toggleTableColumn = (columnId: ActionTrackerTableColumnId) => {
    setVisibleTableColumnIds((current) => {
      if (current.includes(columnId)) {
        return current.length === 1 ? current : current.filter((id) => id !== columnId);
      }

      return actionTrackerTableColumns
        .map((column) => column.id)
        .filter((id) => id === columnId || current.includes(id));
    });
  };

  const toggleKanbanColumn = (columnId: ActionTrackerKanbanColumnId) => {
    setVisibleKanbanColumnIds((current) => {
      if (current.includes(columnId)) {
        return current.length === 1 ? current : current.filter((id) => id !== columnId);
      }

      return actionTrackerKanbanColumns
        .map((column) => column.id)
        .filter((id) => id === columnId || current.includes(id));
    });
  };

  const handleTableSort = (columnId: ActionTrackerTableColumnId) => {
    setTableSort((current) => {
      if (!current || current.columnId !== columnId) {
        return {columnId, direction: 'asc'};
      }
      if (current.direction === 'asc') {
        return {columnId, direction: 'desc'};
      }
      return null;
    });
  };

  const sections = orderedComponents.map((componentId) => {
    if (componentId === 'aiInsights' && visibleComponents.has(componentId)) {
      return (
        <Paper
          elevation={0}
          key="aiInsights"
          sx={{
            mb: 1.25,
            p: isAiInsightsExpanded ? 2 : 1.25,
            borderRadius: '12px',
            border: 'none',
            bgcolor: tokenNeutral.lightest,
            overflow: 'visible',
            minHeight: isAiInsightsExpanded ? 'auto' : 44,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: isAiInsightsExpanded ? 1 : 0.75, minHeight: 24, mb: isAiInsightsExpanded ? 2 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                <SparkleIcon sx={{ fontSize: 16, color: tokenWarning.dark }} />
                <Typography sx={{ color: tokenBrand.main, fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.1 }}>
                  BLU.AI analysis
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => setIsAiInsightsExpanded((current) => !current)}
                sx={{
                  color: tokenText.secondary,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  minWidth: 0,
                  px: 0.5,
                  py: 0.2,
                  lineHeight: 1.1,
                  '&:hover': {bgcolor: 'transparent', color: tokenText.primary},
                }}
              >
                {isAiInsightsExpanded ? 'Collapse' : 'Expand'}
                {isAiInsightsExpanded
                  ? <KeyboardArrowUpIcon sx={{fontSize: 16, ml: 0.25}} />
                  : <KeyboardArrowDownIcon sx={{fontSize: 16, ml: 0.25}} />}
              </Button>
            </Box>

            {isAiInsightsExpanded ? (
            <>
            <Box sx={{ display: 'grid', gap: 0.45 }}>
              {[
                {
                  title: hasAcceptedAiPrioritization ? 'Top 5 now in focus.' : 'Find the top 5 first.',
                  detail: hasAcceptedAiPrioritization ? 'The live queue below shows the new order.' : 'AI checks overdue, due dates, blockers, and repeated patterns.',
                  icon: <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 16, color: tokenBrand.main }} />,
                  highlight: true,
                  onClick: openAiPrioritizationChat,
                },
                {
                  title: '3 repeated patterns',
                  detail: 'Related actions share the same operational signals across lines, owners, and sources.',
                  icon: <TipsAndUpdatesOutlinedIcon sx={{ fontSize: 16, color: tokenBrand.main }} />,
                  highlight: false,
                },
                {
                  title: hasAcceptedAiPrioritization ? '5 actions moved' : '2 overdue and approval blockers',
                  detail: hasAcceptedAiPrioritization ? 'The highest-risk actions were moved to the priority group.' : 'Due-date pressure and pending approvals can delay closure if they stay in the current sequence.',
                  icon: <AccessTimeFilledIcon sx={{ fontSize: 16, color: tokenError.main }} />,
                  highlight: false,
                },
              ].map((item) => (
                <Box
                  key={item.title}
                  component={item.onClick ? 'button' : 'div'}
                  type={item.onClick ? 'button' : undefined}
                  onClick={item.onClick}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    px: item.highlight ? 1.25 : 1,
                    py: item.highlight ? 0.85 : 0.5,
                    borderRadius: '6px',
                    border: item.highlight ? `1px solid ${tokenDivider}` : '1px solid transparent',
                    bgcolor: item.highlight ? 'rgba(0,0,0,0.03)' : 'transparent',
                    width: '100%',
                    minWidth: 0,
                    textAlign: 'left',
                    font: 'inherit',
                    cursor: item.onClick ? 'pointer' : 'default',
                    transition: 'border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease',
                    '&:hover': item.onClick
                      ? {
                        bgcolor: 'rgba(0,0,0,0.06)',
                        borderColor: tokenDivider,
                        boxShadow: '0 1px 4px rgba(15, 23, 42, 0.12)',
                      }
                      : undefined,
                    '&:focus-visible': item.onClick
                      ? {
                        outline: `2px solid ${tokenBrand.main}`,
                        outlineOffset: 2,
                      }
                      : undefined,
                  }}
                >
                  <Box sx={{mt: 0.1, flexShrink: 0}}>
                    {item.icon}
                  </Box>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.32, minWidth: 0, flex: 1 }}>
                    <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>{item.title}</Box>
                    {' - '}
                    {item.detail}
                  </Typography>
                </Box>
              ))}
            </Box>

            {hasAcceptedAiPrioritization ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.05fr) minmax(300px, 0.95fr)' },
                  gap: 1,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: '6px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'rgba(0,0,0,0.03)',
                  }}
                >
                  <Typography variant="caption" sx={{ color: tokenText.primary, fontWeight: 700, display: 'block', mb: 0.35 }}>
                    PRIORITY APPLIED
                  </Typography>
                  <Typography variant="body2" sx={{ color: tokenText.secondary, fontWeight: 400, lineHeight: 1.43, mb: 0.85 }}>
                    Top 5 actions moved to the front and now pulse in the live queue below.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65, mb: 0.85 }}>
                    {actionTrackerPrioritizationChanges.map((item) => (
                      <Chip
                        key={item}
                        size="small"
                        label={item}
                        sx={{
                          bgcolor: tokenNeutral.light,
                          color: tokenText.primary,
                          border: 'none',
                          borderRadius: '999px',
                          fontWeight: 400,
                        }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" sx={{ color: tokenText.secondary, lineHeight: 1.3 }}>
                    The original queue stays below the AI focus group so the team can still track everything in order.
                  </Typography>
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    p: 1.5,
                    borderRadius: '6px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Typography variant="caption" sx={{ color: tokenText.primary, fontWeight: 700, display: 'block', mb: 0.35 }}>
                    WHY THESE MOVED
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
                    {actionTrackerPrioritizationReasons.map((reason) => (
                      <Box key={reason.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.7 }}>
                        <Box
                          sx={{
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            bgcolor: reason.tone === 'critical' ? tokenError.main : reason.tone === 'warning' ? tokenWarning.main : tokenBrand.main,
                            mt: 0.55,
                            flexShrink: 0,
                          }}
                        />
                        <Box>
                          <Typography variant="caption" sx={{ color: tokenText.primary, fontWeight: 700, display: 'block' }}>
                            {reason.label}
                          </Typography>
                          <Typography variant="caption" sx={{ color: tokenText.secondary, lineHeight: 1.3 }}>
                            {reason.detail}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Box>
            ) : null}
            </>
            ) : null}

          </Box>
        </Paper>
      );
    }

    if (componentId === 'kpis' && visibleComponents.has(componentId)) {
      const kpiSections = buildActionTrackerKpiSections(kpis);
      return (
        <Box key="kpis" sx={{mb: 1.5}}>
          <Box
            sx={{
              mb: 1.2,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                xl: 'minmax(0, 2fr) minmax(0, 5fr)',
              },
              gap: 1.2,
              alignItems: 'start',
            }}
          >
            {kpiSections.map((section) => (
              <Paper
                key={section.id}
                elevation={0}
                sx={{
                  p: 1.2,
                  borderRadius: '12px',
                  border: `1px solid ${tokenDivider}`,
                  bgcolor: 'background.paper',
                }}
              >
                <Typography sx={{fontSize: '0.875rem', fontWeight: 500, color: tokenText.primary, mb: 0.2}}>
                  {section.title}
                </Typography>
                <Typography sx={{fontSize: '0.75rem', color: tokenText.secondary, mb: 1, lineHeight: 1.3}}>
                  {section.description}
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, minmax(0, 1fr))',
                      md: section.id === 'myActions' ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
                      xl: `repeat(${section.kpis.length}, minmax(0, 1fr))`,
                    },
                    gap: 1.2,
                  }}
                >
                  {section.kpis.map((kpi) => (
                    <Box key={kpi.label}>
                      <Paper
                        elevation={0}
                        role="button"
                        tabIndex={0}
                        aria-pressed={kpi.active}
                        onClick={() => applySummaryFilter(kpi.id)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            applySummaryFilter(kpi.id);
                          }
                        }}
                        sx={{
                          p: {xs: 1.2, xl: 1.6},
                          borderRadius: '12px',
                          border: `1px solid ${kpi.active ? kpi.tone : tokenDivider}`,
                          borderLeft: `4px solid ${kpi.tone}`,
                          bgcolor: kpi.urgent ? tokenError.softBg : kpi.active ? tokenBrand.softBg : 'background.paper',
                          transition: 'border-color 0.2s ease, background-color 0.2s ease',
                          cursor: 'pointer',
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: tokenBrand.softBg,
                            borderColor: kpi.tone,
                          },
                        }}
                      >
                        <Typography variant="h4" sx={{color: kpi.urgent ? tokenError.main : tokenText.primary, fontWeight: 400, lineHeight: 1, fontSize: {xs: '1.25rem', md: '1.5rem', xl: '2.125rem'}, letterSpacing: 0}}>
                          {kpi.value}
                        </Typography>
                        <Typography variant="caption" sx={{color: kpi.urgent ? tokenError.main : tokenText.secondary, fontWeight: 400, mt: 0.5, display: 'block', fontSize: {xs: '0.68rem', md: '0.72rem', xl: '0.75rem'}, lineHeight: 1.3}}>
                          {kpi.label}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      );
    }

    if (componentId === 'quickLinks' && visibleComponents.has(componentId)) {
      return (
        <Paper key="quickLinks" sx={{p: 2.5, mt: 3}}>
          <Typography variant="h6" sx={{fontWeight: 800, mb: 1.5}}>Quick links</Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1}}>
            <Button variant="outlined" onClick={onOpenDocumentOperations}>Open Operations</Button>
          </Box>
        </Paper>
      );
    }

    return null;
  });

  const content = (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '12px',
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {embedded && onBack ? (
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: {xs: 2, md: 3}, py: 1.5, borderBottom: `1px solid ${tokenDivider}`}}>
          <Button
            onClick={onBack}
            startIcon={<ArrowBackIcon sx={{fontSize: 18}} />}
            sx={{...actionTrackerOutlinedButtonSx, minWidth: 0, px: 1.25, color: tokenBrand.main, fontSize: '0.875rem'}}
          >
            Action Tracker
          </Button>
        </Box>
      ) : null}

      {!embedded ? (
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 1.5, md: 2 },
            bgcolor: 'background.paper',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.334, letterSpacing: 0 }}>
              {headerView === 'dashboard' ? 'Action Tracker Dashboard' : 'Action Tracker'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="small"
              sx={actionTrackerHeaderActionSx}
              onClick={onOpenCreateDrawer}
            >
              Add Action
            </Button>
          </Box>
        </Box>
      ) : null}

      {!embedded ? (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 3, px: {xs: 2, md: 3}, pb: 1, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper'}}>
          <Box
            onClick={() => setHeaderView('actions')}
            sx={actionTrackerTabButtonSx(headerView === 'actions')}
          >
            Actions
          </Box>
          <Box
            onClick={() => setHeaderView('dashboard')}
            sx={actionTrackerTabButtonSx(headerView === 'dashboard')}
          >
            Dashboard
          </Box>
        </Box>
      ) : null}

      <Box sx={{p: {xs: 1.25, md: 1.5, xl: 2.5}}}>
      {headerView === 'actions' && boardCategoryFilter ? (
        <Box sx={{display: 'flex', justifyContent: 'flex-end', mb: 1}}>
          <Chip
            label={`Meeting filter: ${boardCategoryFilter}`}
            onDelete={onClearBoardCategoryFilter}
            sx={{borderRadius: '999px', fontWeight: 400, bgcolor: tokenNeutral.light, color: tokenText.primary, border: 'none'}}
          />
        </Box>
      ) : null}

      {headerView === 'actions' ? (
        <>
          {sections.filter((section) => section?.key !== 'quickLinks')}

          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: {xs: 0.7, xl: 1}, mb: 1.2, flexWrap: 'wrap', alignItems: 'center'}}>
            {embedded ? (
              <Button
                variant="outlined"
                sx={{...actionTrackerOutlinedButtonSx, height: 36, fontSize: {xs: '0.72rem', md: '0.76rem', xl: '0.875rem'}}}
                onClick={onOpenCreateDrawer}
              >
                Add Action
              </Button>
            ) : null}
            <Button
              variant="outlined"
              onClick={onOpenFilters}
              sx={{...actionTrackerOutlinedButtonSx, height: 36, fontSize: {xs: '0.72rem', md: '0.76rem', xl: '0.875rem'}, minWidth: {xs: 72, xl: 96}, px: {xs: 1.2, xl: 2}}}
            >
              Filters
            </Button>
            <TextField
              size="small"
              placeholder="Search action items"
              value={actionFilterValues.searchTerm}
              onChange={(event) => setActionFilterValues((current) => ({...current, searchTerm: event.target.value}))}
              sx={{
                minWidth: {xs: 220, md: 250, xl: 330},
                '& .MuiInputBase-root': { borderRadius: '12px', bgcolor: 'background.paper' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: tokenDivider },
                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokenBrand.main },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: tokenBrand.main },
                '& .MuiInputBase-input': {
                  fontSize: {xs: '0.78rem', md: '0.82rem', xl: '1rem'},
                  py: {xs: 0.8, xl: 0.8},
                },
              }}
              InputProps={{endAdornment: <SearchIcon sx={{color: tokenBrand.main, fontSize: 18}} />}}
            />
            <IconButton
              size="small"
              onClick={() => onViewChange('kanban')}
              sx={{
                ...actionTrackerIconButtonSx,
                bgcolor: view === 'kanban' ? tokenBrand.softBg : 'background.paper',
                color: view === 'kanban' ? tokenBrand.main : tokenText.secondary,
                width: 36,
                height: 36,
              }}
            >
              <AppsIcon sx={{fontSize: {xs: 17, xl: 20}}} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onViewChange('table')}
              sx={{
                ...actionTrackerIconButtonSx,
                bgcolor: view === 'table' ? tokenBrand.softBg : 'background.paper',
                color: view === 'table' ? tokenBrand.main : tokenText.secondary,
                width: 36,
                height: 36,
              }}
            >
              <DocumentIcon sx={{fontSize: {xs: 17, xl: 20}}} />
            </IconButton>
            <IconButton
              size="small"
              onClick={(event) => setSettingsAnchor(event.currentTarget)}
              sx={actionTrackerIconButtonSx}
            >
              <SettingsOutlinedIcon sx={{fontSize: {xs: 17, xl: 20}}} />
            </IconButton>
            <Menu anchorEl={settingsAnchor} open={Boolean(settingsAnchor)} onClose={() => setSettingsAnchor(null)}>
              <Typography sx={{px: 2, pt: 1, pb: 0.4, fontSize: 12, fontWeight: 700, color: tokenText.secondary, letterSpacing: '1px', textTransform: 'uppercase'}}>
                Table Columns
              </Typography>
              {actionTrackerTableColumns.map((column) => (
                <MenuItem key={column.id} onClick={() => toggleTableColumn(column.id)} dense>
                  <Checkbox checked={visibleTableColumnIds.includes(column.id)} size="small" sx={{mr: 1}} />
                  <Typography sx={{fontSize: 13}}>{column.label}</Typography>
                </MenuItem>
              ))}
              <Typography sx={{px: 2, pt: 1, pb: 0.4, fontSize: 12, fontWeight: 700, color: tokenText.secondary, letterSpacing: '1px', textTransform: 'uppercase'}}>
                Board Columns
              </Typography>
              {actionTrackerKanbanColumns.map((column) => (
                <MenuItem key={column.id} onClick={() => toggleKanbanColumn(column.id)} dense>
                  <Checkbox checked={visibleKanbanColumnIds.includes(column.id)} size="small" sx={{mr: 1}} />
                  <Typography sx={{fontSize: 13}}>{column.label}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {view === 'kanban' ? (
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 1.2, flexWrap: 'wrap'}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap'}}>
                {kanbanCategoryFilters.map((filter) => {
                  const active = boardCategoryFilter === filter.id;
                  return (
                    <Button
                      key={filter.label}
                      size="small"
                      onClick={() => setActionTrackerBoardCategoryFilter(filter.id)}
                      sx={{
                        minWidth: filter.id ? 30 : 42,
                        width: filter.id ? 30 : 'auto',
                        height: 30,
                        px: filter.id ? 0 : 1.1,
                        borderRadius: '999px',
                        border: 'none',
                        bgcolor: active ? tokenBrand.main : tokenNeutral.light,
                        color: active ? tokenBrand.contrast : tokenText.primary,
                        fontWeight: 400,
                        textTransform: 'none',
                        boxShadow: 'none',
                        '&:hover': {
                          bgcolor: active ? tokenBrand.dark : tokenNeutral.main,
                        },
                      }}
                    >
                      {filter.shortLabel}
                    </Button>
                  );
                })}
              </Box>
              {boardCategoryFilter ? (
                <Chip
                  label={`Category: ${boardCategoryFilter}`}
                  onDelete={onClearBoardCategoryFilter}
                  sx={{borderRadius: '999px', fontWeight: 400, bgcolor: tokenNeutral.light, color: tokenText.primary, border: 'none'}}
                />
              ) : null}
            </Box>
          ) : null}

          {view === 'table' ? (
            <Paper elevation={0} sx={{borderRadius: '12px', border: hasAcceptedAiPrioritization ? `1px solid ${tokenBrand.main}` : `1px solid ${tokenDivider}`, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: hasAcceptedAiPrioritization ? '0 8px 16px rgba(0,31,155,0.10)' : 'none'}}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: tableGridTemplateColumns,
                  columnGap: 1,
                  px: {xs: 0.75, xl: 1.2},
                  py: {xs: 1, xl: 1.5},
                  bgcolor: tokenNeutral.lightest,
                  borderBottom: `1px solid ${tokenDivider}`,
                }}
              >
                {visibleTableColumns.map((column) => (
                  <TableSortLabel
                    key={column.id}
                    active={tableSort?.columnId === column.id}
                    direction={tableSort?.columnId === column.id ? tableSort.direction : 'asc'}
                    onClick={() => handleTableSort(column.id)}
                    sx={{
                      color: `${tokenText.primary} !important`,
                      '& .MuiTableSortLabel-icon': {
                        color: `${tokenText.secondary} !important`,
                        fontSize: 16,
                      },
                    }}
                  >
                    <Typography variant="caption" sx={{color: tokenText.primary, fontWeight: 700, fontSize: {xs: '0.56rem', md: '0.58rem', xl: '0.75rem'}, textTransform: 'uppercase'}}>
                      {column.label}
                    </Typography>
                  </TableSortLabel>
                ))}
              </Box>
              <Box sx={{maxHeight: { xs: 520, xl: 680 }, overflowY: 'auto'}}>
                {sortedDisplayedRows.map((row, idx) => (
                  <Box
                    key={row.id}
                    onClick={() => onOpenDetails(row)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: tableGridTemplateColumns,
                      columnGap: 1,
                      px: {xs: 0.75, xl: 1.2},
                      py: {xs: 1, xl: 1.2},
                      bgcolor: row.aiPriorityRecommended
                          ? tokenBrand.softBg
                          : idx % 2
                            ? tokenNeutral.lightest
                            : 'background.paper',
                      borderBottom: `1px solid ${tokenDivider}`,
                      borderLeft: `3px solid ${getActionSourceTone(row.source).rail}`,
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease, box-shadow 0.2s ease, transform 0.45s ease',
                      animation: row.aiPriorityRecommended
                        ? row.aiPriorityRank === aiPriorityAnimatingRank
                          ? 'aiPriorityLift 0.7s cubic-bezier(0.2, 0.9, 0.2, 1)'
                          : 'aiRowGlow 2.2s ease-in-out infinite'
                        : 'none',
                      '@keyframes aiPriorityLift': {
                        '0%': {
                          transform: 'translateY(16px) scale(0.995)',
                          boxShadow: 'inset 0 0 0 1px rgba(37,99,235,0.12)',
                        },
                        '55%': {
                          transform: 'translateY(-5px) scale(1.004)',
                          boxShadow: '0 12px 26px rgba(37,99,235,0.16)',
                        },
                        '100%': {
                          transform: 'translateY(0px) scale(1)',
                          boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.10)',
                        },
                      },
                      '@keyframes aiRowGlow': {
                        '0%, 100%': {
                          boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.08)',
                          backgroundColor: 'rgba(244,248,255,0.96)',
                        },
                        '50%': {
                          boxShadow: 'inset 0 0 0 1px rgba(59,130,246,0.24)',
                          backgroundColor: 'rgba(229,240,255,0.99)',
                        },
                      },
                      '&:hover': {
                        bgcolor: row.aiPriorityRecommended
                            ? tokenBrand.selectedBg
                            : tokenBrand.softBg,
                      },
                    }}
                  >
                    {visibleTableColumns.map((column) => (
                      <Box key={`${row.id}-${column.id}`} sx={{minWidth: 0}}>
                        {renderTableCell(column.id, row)}
                      </Box>
                    ))}
                  </Box>
                ))}
              </Box>
            </Paper>
          ) : (
            <Paper elevation={0} sx={{borderRadius: '12px', border: `1px solid ${tokenDivider}`, overflow: 'hidden', bgcolor: 'background.paper'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: `repeat(${Math.max(visibleKanbanColumns.length, 1)}, minmax(260px, 1fr))`, gap: 0, borderBottom: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, overflowX: 'auto'}}>
                {visibleKanbanColumns.map((lane) => {
                  const tone = getKanbanStatusTone(lane.id);
                  return (
                  <Box key={lane.id} sx={{px: 1.5, py: 1.5, borderRight: `1px solid ${tokenDivider}`}}>
                    <Chip size="small" label={lane.label} sx={{bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em'}} />
                  </Box>
                )})}
              </Box>
              <Box sx={{display: 'grid', gridTemplateColumns: `repeat(${Math.max(visibleKanbanColumns.length, 1)}, minmax(260px, 1fr))`, overflowX: 'auto'}}>
                {visibleKanbanColumns.map((lane) => (
                  <Box key={lane.id} sx={{p: 1.5, borderRight: `1px solid ${tokenDivider}`, minHeight: 460, bgcolor: 'background.default'}}>
                    <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.2}}>
                      {displayedRows
                        .filter((row) => getVisibleActionStatus(row) === lane.id)
                        .sort((left, right) => {
                          const priorityDiff = getPrioritySortValue(left.priority) - getPrioritySortValue(right.priority);
                          if (priorityDiff !== 0) return priorityDiff;
                          return left.originalIndex - right.originalIndex;
                        })
                        .map((row) => {
                        const signalTone = getKanbanSignalTone(row);
                        return (
                        <Paper
                          key={`${lane.id}-${row.id}`}
                          elevation={0}
                          onClick={() => onOpenDetails(row)}
                          sx={{
                            p: 1.4,
                            pl: 1.75,
                            borderRadius: '12px',
                            border: row.priority === 'High' ? `1px solid ${tokenError.main}` : `1px solid ${tokenDivider}`,
                            bgcolor: row.priority === 'High' ? tokenError.softBg : 'background.paper',
                            cursor: 'pointer',
                            transition: 'border-color 0.2s ease, background-color 0.2s ease',
                            boxShadow: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              inset: '0 auto 0 0',
                              width: 4,
                              bgcolor: getActionSourceTone(row.source).rail,
                            },
                            '&:hover': {
                              bgcolor: tokenBrand.softBg,
                              borderColor: row.priority === 'High' ? tokenError.main : tokenBrand.main,
                            },
                          }}
                        >
                          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1}}>
                            <Typography variant="caption" sx={{color: tokenText.secondary, fontWeight: 400}}>{row.id}</Typography>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                              {!boardCategoryFilter ? (
                                <Box
                                  sx={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: '6px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: signalTone.bg,
                                    color: signalTone.color,
                                    border: `1px solid ${signalTone.border}`,
                                    fontSize: 10,
                                    fontWeight: 600,
                                  }}
                                >
                                  {getKanbanCategoryTone(row.category).shortLabel}
                                </Box>
                              ) : null}
                              {row.aiPriorityRecommended ? (
                                <Chip size="small" icon={<SparkleIcon sx={{ fontSize: '0.8rem !important', color: `${tokenBrand.main} !important` }} />} label={`AI ${row.aiPriorityRank}`} sx={{ bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontWeight: 400, border: `1px solid ${tokenDivider}` }} />
                              ) : null}
                              {row.aiGeneratedAction ? (
                                <Chip size="small" label="AI Created" sx={{ bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontWeight: 400, border: `1px solid ${tokenDivider}` }} />
                              ) : null}
                            </Box>
                          </Box>
                          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mt: 0.6}}>
                            <Typography variant="subtitle2" sx={{fontWeight: 500, color: tokenText.primary, lineHeight: 1.57, pr: 1}}>{row.title}</Typography>
                            <Typography variant="body2" sx={{fontWeight: 500, color: row.priority === 'High' ? tokenError.main : row.priority === 'Medium' ? tokenWarning.main : tokenSuccess.darker}}>
                              {row.priority}
                            </Typography>
                          </Box>
                          {row.aiPriorityRecommended && row.aiPrioritySignal ? (
                            <Typography variant="caption" sx={{display: 'block', mt: 0.9, color: tokenText.secondary, fontWeight: 400}}>
                              BLU.AI: {row.aiPrioritySignal}
                            </Typography>
                          ) : null}
                          {row.aiGeneratedAction ? (
                            <Typography variant="caption" sx={{display: 'block', mt: 0.45, color: tokenText.secondary, fontWeight: 400}}>
                              BLU.AI created this action from repeated startup scrap, document pressure, and missing ownership before handoff.
                            </Typography>
                          ) : null}
                          <Box sx={{mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                              <Avatar sx={{width: 26, height: 26, fontSize: 11, bgcolor: tokenNeutral.lightest, color: tokenText.secondary, border: `1px solid ${tokenDivider}`}}>
                                {row.assignedTo.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                              </Avatar>
                              <Typography variant="body2" sx={{color: tokenText.secondary, fontWeight: 400}}>{row.assignedTo}</Typography>
                            </Box>
                            <Typography variant="caption" sx={{color: tokenText.secondary, fontWeight: 400}}>{row.dueDate}</Typography>
                          </Box>
                        </Paper>
                        )})}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {sections.find((section) => section?.key === 'quickLinks')}
        </>
      ) : headerView === 'dashboard' ? (
        <ActionTrackerDashboardOperationalView
          aiState={{
            hasAcceptedAiPrioritization,
            isAiPrioritizationApplying,
            aiPrioritizationVisibleCount,
          }}
          onOpenPrioritizationMethodChat={openAiPrioritizationMethodChat}
          onOpenCreatedActionReasonChat={openAiCreatedActionReasonChat}
        />
      ) : null}
      </Box>

      <Dialog
        open={isActionFilterModalOpen}
        onClose={() => setIsActionFilterModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{fontWeight: 700, color: tokenText.primary}}>Filters</DialogTitle>
        <DialogContent dividers sx={{display: 'grid', gap: 1.4, pt: 1.5}}>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 1.2}}>
            <TextField
              select
              label="Category"
              value={actionFilterValues.category}
              onChange={(event) => setActionFilterValues((current) => ({...current, category: event.target.value}))}
              size="small"
            >
              <MenuItem value="">All Categories</MenuItem>
              {categoryOptions.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Status"
              value={actionFilterValues.status}
              onChange={(event) => setActionFilterValues((current) => ({...current, status: event.target.value}))}
              size="small"
            >
              <MenuItem value="">All Statuses</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>{status}</MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 1.2}}>
            <TextField
              select
              label="Source"
              value={actionFilterValues.source}
              onChange={(event) => setActionFilterValues((current) => ({...current, source: event.target.value}))}
              size="small"
            >
              <MenuItem value="">All Sources</MenuItem>
              {sourceOptions.map((source) => (
                <MenuItem key={source} value={source}>{source}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Priority"
              value={actionFilterValues.priority}
              onChange={(event) => setActionFilterValues((current) => ({...current, priority: event.target.value}))}
              size="small"
            >
              <MenuItem value="">All Priorities</MenuItem>
              {(['High', 'Medium', 'Low'] as ActionTrackerPriority[]).map((priority) => (
                <MenuItem key={priority} value={priority}>{priority}</MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 1.2}}>
            <TextField
              label="Creation Date From"
              type="date"
              value={actionFilterValues.creationDateFrom}
              onChange={(event) => setActionFilterValues((current) => ({...current, creationDateFrom: event.target.value}))}
              InputLabelProps={{shrink: true}}
              size="small"
            />
            <TextField
              label="Creation Date To"
              type="date"
              value={actionFilterValues.creationDateTo}
              onChange={(event) => setActionFilterValues((current) => ({...current, creationDateTo: event.target.value}))}
              InputLabelProps={{shrink: true}}
              size="small"
            />
          </Box>

          <TextField
            select
            label="Created By"
            value={actionFilterValues.createdBy}
            onChange={(event) => setActionFilterValues((current) => ({...current, createdBy: event.target.value}))}
            size="small"
          >
            <MenuItem value="">All Creators</MenuItem>
            {createdByOptions.map((createdBy) => (
              <MenuItem key={createdBy} value={createdBy}>{createdBy}</MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Owner"
            value={actionFilterValues.assignedTo}
            onChange={(event) => setActionFilterValues((current) => ({...current, assignedTo: event.target.value as unknown as string[]}))}
            SelectProps={{
              multiple: true,
              renderValue: (selected) => (selected as string[]).length ? (selected as string[]).join(', ') : 'All Owners',
            }}
            size="small"
          >
            {ownerOptions.map((owner) => (
              <MenuItem key={owner} value={owner}>
                <Checkbox checked={actionFilterValues.assignedTo.includes(owner)} size="small" sx={{mr: 1}} />
                <Typography sx={{fontSize: 13}}>{owner}</Typography>
              </MenuItem>
            ))}
          </TextField>

          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: '1fr 1fr'}, gap: 1.2}}>
            <TextField
              label="Due Date From"
              type="date"
              value={actionFilterValues.dueDateFrom}
              onChange={(event) => setActionFilterValues((current) => ({...current, dueDateFrom: event.target.value}))}
              InputLabelProps={{shrink: true}}
              size="small"
            />
            <TextField
              label="Due Date To"
              type="date"
              value={actionFilterValues.dueDateTo}
              onChange={(event) => setActionFilterValues((current) => ({...current, dueDateTo: event.target.value}))}
              InputLabelProps={{shrink: true}}
              size="small"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{px: 3, py: 1.5}}>
          <Button
            onClick={() => {
              clearActionFilters();
            }}
            sx={actionTrackerOutlinedButtonSx}
          >
            Reset
          </Button>
          <Button
            variant="contained"
            onClick={() => setIsActionFilterModalOpen(false)}
            sx={actionTrackerContainedButtonSx}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

    </Paper>
  );

  if (embedded) {
    return content;
  }

  return (
    <Box sx={{flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: {xs: 2, md: 3}}}>
      {content}
    </Box>
  );
}

function ActionTrackerSettingsView({activePrimary}: {activePrimary: string}) {
  const [settingsTab, setSettingsTab] = useState<'sub-categories' | 'template'>('sub-categories');
  const subCategories = [
    {name: 'MFG', category: 'Cost'},
    {name: 'Extrusion', category: 'Quality'},
    {name: 'Molding', category: 'Quality'},
  ] as const;
  const templates = [
    {title: 'Template A', description: 'Templates help you create consistent and reusable documents or designs quickly.'},
    {title: 'Template B', description: 'Templates provide a structured format to maintain high standards and uniformity across your work.'},
    {title: 'Template C', description: 'Templates offer a reliable framework to ensure quality and efficiency in your projects.'},
  ] as const;

  return (
    <Box sx={{display: 'grid', gap: 1.1}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1.8, px: 0.1}}>
        <Button
          onClick={() => setSettingsTab('sub-categories')}
          sx={{
            p: 0,
            minWidth: 0,
            borderRadius: 0,
            color: settingsTab === 'sub-categories' ? activePrimary : '#6B7280',
            fontWeight: 900,
            borderBottom: settingsTab === 'sub-categories' ? `2px solid ${activePrimary}` : '2px solid transparent',
            textTransform: 'none',
          }}
        >
          SUB-CATEGORIES
        </Button>
        <Button
          onClick={() => setSettingsTab('template')}
          sx={{
            p: 0,
            minWidth: 0,
            borderRadius: 0,
            color: settingsTab === 'template' ? activePrimary : '#6B7280',
            fontWeight: 900,
            borderBottom: settingsTab === 'template' ? `2px solid ${activePrimary}` : '2px solid transparent',
            textTransform: 'none',
          }}
        >
          TEMPLATE
        </Button>
      </Box>

      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap'}}>
        <TextField
          size="small"
          placeholder={settingsTab === 'template' ? 'Search by template' : 'Search by sub-category'}
          sx={{
            minWidth: 340,
            maxWidth: 520,
            flex: 1,
            '& .MuiInputBase-root': {borderRadius: 1.5},
          }}
          InputProps={{endAdornment: <SearchIcon sx={{color: activePrimary}} />}}
        />
        <Button
          variant="outlined"
          sx={{height: 32, px: 1.4, borderRadius: 1.5, color: activePrimary, borderColor: '#93c5fd', fontWeight: 800, textTransform: 'none'}}
        >
          {settingsTab === 'template' ? 'NEW TEMPLATE' : 'NEW SUB-CATEGORY'}
        </Button>
      </Box>

      <Paper elevation={0} sx={{borderRadius: 2.5, border: '1px solid #D8DEE8', overflow: 'hidden'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: settingsTab === 'template' ? '1fr 2fr 120px' : '1.2fr 1fr 120px', px: 1.2, py: 1.2, bgcolor: '#F8FAFC', borderBottom: '1px solid #D8DEE8'}}>
          <Typography variant="caption" sx={{fontWeight: 800, color: '#6B7280', textTransform: 'uppercase'}}>
            {settingsTab === 'template' ? 'Title' : 'Sub-category'}
          </Typography>
          <Typography variant="caption" sx={{fontWeight: 800, color: '#6B7280', textTransform: 'uppercase'}}>
            {settingsTab === 'template' ? 'Description' : 'Category'}
          </Typography>
          <Box />
        </Box>

        <Box sx={{display: 'grid', gap: 0.75, p: 1}}>
          {(settingsTab === 'template' ? templates : subCategories).map((row) => (
            <Paper key={settingsTab === 'template' ? row.title : row.name} elevation={0} sx={{display: 'grid', gridTemplateColumns: settingsTab === 'template' ? '1fr 2fr 120px' : '1.2fr 1fr 120px', alignItems: 'center', px: 1.2, py: 1.2, borderRadius: 2, border: '1px solid #E5E7EB', bgcolor: '#FFFFFF', transition: 'all 0.2s ease', '&:hover': {borderColor: activePrimary, bgcolor: '#fafdff'}}}>
              <Typography sx={{fontSize: 13.5, color: '#1F2937'}}>
                {settingsTab === 'template' ? row.title : row.name}
              </Typography>
              <Typography sx={{fontSize: 13.5, color: '#1F2937'}}>
                {settingsTab === 'template' ? row.description : row.category}
              </Typography>
              <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 0.3}}>
                <IconButton size="small" sx={{color: activePrimary}}>
                  <EditOutlinedIcon sx={{fontSize: 18}} />
                </IconButton>
                <IconButton size="small" sx={{color: activePrimary}}>
                  <DeleteOutlineIcon sx={{fontSize: 18}} />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

type DashboardDatePreset = 'rolling45' | 'quarterToDate' | 'allActivity' | 'custom';
type DashboardCompareMode = 'previousPeriod' | 'createdVsDue' | 'openVsClosed' | 'lines';
type DashboardAttentionFilter = 'all' | 'open' | 'overdue' | 'completed';
type DashboardStatusKey = ActionTrackerStatus | 'Overdue';
type DashboardOriginGroup = 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Maintenance' | 'Quality' | 'Safety' | 'Other';
type DashboardMetric = {
  id: DashboardAttentionFilter | 'avgResolution' | 'extendedDueDate' | 'reassignedActions';
  label: string;
  value: string;
  unit?: string;
  tone: string;
  note: string;
  active: boolean;
  onClick?: () => void;
};
type DashboardPreparedRow = ActionTrackerDisplayRow & {
  area: string;
  originGroup: DashboardOriginGroup;
  createdAt: number;
  dueAt: number;
  overdue: boolean;
};
type DashboardPlantCell = {
  label: string;
  line: string;
  zone: string;
  top: string;
  left: string;
};

const actionDashboardStatusPalette: Record<DashboardStatusKey, string> = {
  Open: tokenBrand.main,
  Reopened: tokenWarning.dark,
  'Under Approval': tokenInfo.main,
  Completed: tokenSuccess.main,
  Canceled: tokenText.disabled,
  Overdue: tokenError.main,
};

const actionDashboardStatusOrder: DashboardStatusKey[] = ['Open', 'Reopened', 'Under Approval', 'Completed', 'Overdue', 'Canceled'];
const actionDashboardVisibleStatusOrder: DashboardStatusKey[] = ['Open', 'Reopened', 'Under Approval', 'Completed', 'Overdue'];
const actionDashboardAreaOrder = ['Area A', 'Area B', 'Area C', 'Area D', 'Area E'] as const;
const actionDashboardOriginOrder: DashboardOriginGroup[] = ['Tier 1', 'Tier 2', 'Tier 3', 'Maintenance', 'Quality', 'Safety', 'Other'];
const actionDashboardLineColors = [tokenBrand.main, tokenInfo.main, tokenWarning.main, tokenSuccess.main, tokenError.main, tokenText.secondary];
const actionDashboardPanelBorder = tokenDivider;
const actionDashboardSoftBorder = tokenDivider;
const actionDashboardPanelBackground = 'background.paper';
const actionDashboardSectionChipSx = {
  height: 23,
  borderRadius: '999px',
  bgcolor: tokenBrand.softBg,
  color: tokenBrand.main,
  border: `1px solid ${tokenDivider}`,
  fontWeight: 700,
} as const;
const actionDashboardToolbarButtonSx = {
  height: 34,
  minHeight: 34,
  minWidth: 96,
  borderRadius: '8px',
  px: 1.5,
  fontSize: '0.8125rem',
  fontWeight: 500,
  textTransform: 'none',
  borderColor: tokenBrand.main,
  color: tokenBrand.main,
  bgcolor: 'background.paper',
  boxShadow: 'none',
  '&:hover': {
    borderColor: tokenBrand.dark,
    bgcolor: tokenBrand.softBg,
  },
} as const;
const actionDashboardHeaderActionSx = {
  minHeight: 30,
  px: 1.05,
  borderRadius: '8px',
  color: tokenBrand.main,
  fontWeight: 500,
  textTransform: 'none',
  bgcolor: 'background.paper',
  border: `1px solid ${tokenDivider}`,
  '&:hover': {bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main},
} as const;
const actionDashboardViewStorageKey = 'action-tracker-dashboard-view-v2';
const actionDashboardDayMs = 24 * 60 * 60 * 1000;
const actionDashboardPlantCells: DashboardPlantCell[] = [
  {label: 'Line 01', line: 'Line 1', zone: 'Zone 2', top: '74%', left: '29%'},
  {label: 'Line 02', line: 'Line 2', zone: 'Zone 2', top: '58%', left: '9%'},
  {label: 'Line 03', line: 'Line 3', zone: 'Zone 1', top: '45%', left: '4%'},
  {label: 'Line 04', line: 'Line 4', zone: 'Zone 1', top: '61%', left: '63%'},
  {label: 'Line 05', line: 'Line 5', zone: 'Zone 3', top: '34%', left: '55%'},
  {label: 'Line 06', line: 'Line 6', zone: 'Zone 3', top: '15%', left: '58%'},
];

function parseDashboardDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function getActionDashboardArea(row: ActionTrackerRow) {
  if (row.source === 'Action Tracker') return 'Area A';
  if (row.source === 'Tier' || row.source === 'TMS 1') return 'Area A';
  if (row.source === 'TMS 2') return 'Area B';
  if (row.source === 'TMS 3') return 'Area C';
  if (row.source === 'Maintenance') return 'Area D';
  if (row.source === 'Shift Logbook') return 'Area C';
  return 'Area E';
}

function getActionDashboardOriginGroup(row: ActionTrackerRow): DashboardOriginGroup {
  if (row.category === 'SAFETY') return 'Safety';
  if (row.source === 'Maintenance') return 'Maintenance';
  if (row.source === 'Shift Logbook') return 'Operations';
  if (row.source === 'Tier') return 'Tier 1';
  if (row.source === 'TMS 3') return 'Tier 3';
  if (row.source === 'TMS 2') return 'Tier 2';
  if (row.source === 'Action Tracker' && row.category === 'QUALITY') return 'Quality';
  if (row.source === 'Action Tracker') return 'Tier 1';
  return 'Other';
}

function formatDashboardShortDate(value: number) {
  return new Date(value).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

function formatDashboardDateInput(value: number) {
  return new Date(value).toLocaleDateString('en-CA');
}

function parseDashboardDateInput(value: string, endOfDay = false) {
  if (!value.trim()) return null;
  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return endOfDay ? parsed.getTime() + actionDashboardDayMs - 1 : parsed.getTime();
}

function formatDashboardRange(start: number, end: number) {
  return `${formatDashboardShortDate(start)} - ${formatDashboardShortDate(end)}`;
}

function getDashboardQuarterStart(value: number) {
  const date = new Date(value);
  const quarterMonth = Math.floor(date.getMonth() / 3) * 3;
  return new Date(date.getFullYear(), quarterMonth, 1).getTime();
}

function getDashboardStatusKey(row: DashboardPreparedRow): DashboardStatusKey {
  return getVisibleActionStatus(row);
}

function getDashboardTrend(current: number, previous: number, inverse = false) {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return {direction: 'flat' as const, label: 'No comparison'};
  }

  if (previous === 0) {
    if (current === 0) return {direction: 'flat' as const, label: 'No change'};
    return {direction: inverse ? 'down' as const : 'up' as const, label: current.toFixed(1)};
  }

  const delta = ((current - previous) / Math.abs(previous)) * 100;
  if (Math.abs(delta) < 0.1) return {direction: 'flat' as const, label: '0.0%'};
  const direction = delta > 0 ? (inverse ? 'down' : 'up') : (inverse ? 'up' : 'down');
  return {direction, label: `${Math.abs(delta).toFixed(1)}%`};
}

function getResolutionDays(rows: DashboardPreparedRow[]) {
  if (!rows.length) return 0;
  const total = rows.reduce((sum, row) => sum + Math.max(1, Math.round((row.dueAt - row.createdAt) / actionDashboardDayMs)), 0);
  return total / rows.length;
}

function buildDashboardBuckets(start: number, end: number, count = 7) {
  const duration = Math.max(actionDashboardDayMs, end - start + actionDashboardDayMs);
  const bucketSize = Math.max(actionDashboardDayMs, Math.ceil(duration / count));
  return Array.from({length: count}, (_, index) => {
    const bucketStart = start + (index * bucketSize);
    const bucketEnd = index === count - 1 ? end + actionDashboardDayMs : Math.min(end + actionDashboardDayMs, bucketStart + bucketSize);
    return {
      label: formatDashboardShortDate(Math.min(bucketStart, end)),
      start: bucketStart,
      end: bucketEnd,
    };
  });
}

function countRowsInBucket(
  rows: DashboardPreparedRow[],
  buckets: Array<{start: number; end: number}>,
  accessor: (row: DashboardPreparedRow) => number,
  predicate?: (row: DashboardPreparedRow) => boolean,
) {
  return buckets.map((bucket) => rows.filter((row) => {
    if (predicate && !predicate(row)) return false;
    const value = accessor(row);
    return value >= bucket.start && value < bucket.end;
  }).length);
}

function isDashboardRowRelevantToPeriod(
  row: Pick<DashboardPreparedRow, 'createdAt' | 'dueAt'>,
  period: {start: number; end: number},
) {
  if (row.createdAt >= period.start && row.createdAt <= period.end) return true;
  return row.createdAt <= period.end && row.dueAt >= period.start;
}

function getDashboardAttentionReasons(row: DashboardPreparedRow, now: number): DashboardAttentionReason[] {
  const reasons: DashboardAttentionReason[] = [];
  const dueSoon = row.dueAt >= now && row.dueAt <= (now + (3 * actionDashboardDayMs));

  if (row.overdue) reasons.push('Overdue');
  if (row.priority === 'High') reasons.push('High priority');
  if (row.category === 'SAFETY') reasons.push('Safety impact');
  if (row.category === 'QUALITY') reasons.push('Quality impact');
  if (row.category === 'DELIVERY') reasons.push('Delivery impact');
  if (dueSoon) reasons.push('Due soon');
  if (row.status === 'Reopened') reasons.push('Reopened');
  if (row.status === 'Under Approval') reasons.push('Waiting for approval');
  if ((row.dueDateExtensionCount ?? 0) > 0) reasons.push('Due date extended');
  if ((row.reassignmentCount ?? 0) > 0) reasons.push('Recently reassigned');

  return reasons;
}

function getDashboardAttentionScore(row: DashboardPreparedRow, now: number) {
  const dueSoon = row.dueAt >= now && row.dueAt <= (now + (3 * actionDashboardDayMs));
  const dueDistance = Number.isFinite(row.dueAt) ? row.dueAt - now : Number.MAX_SAFE_INTEGER;

  return (
    (row.overdue ? 1000 : 0)
    + (row.priority === 'High' ? 400 : row.priority === 'Medium' ? 180 : 60)
    + (row.category === 'SAFETY' ? 220 : row.category === 'QUALITY' ? 180 : row.category === 'DELIVERY' ? 140 : 80)
    + (dueSoon ? 120 : 0)
    + (row.status === 'Reopened' ? 110 : 0)
    + (row.status === 'Under Approval' ? 90 : 0)
    + ((row.dueDateExtensionCount ?? 0) > 0 ? 70 : 0)
    + ((row.reassignmentCount ?? 0) > 0 ? 45 : 0)
    - Math.min(200, Math.max(0, Math.round(dueDistance / actionDashboardDayMs)))
  );
}

function formatDashboardDuration(days: number) {
  if (!Number.isFinite(days) || days <= 0) return '0.0';
  return days.toFixed(1);
}
function ActionTrackerDashboardView({
  aiState,
  onOpenPrioritizationMethodChat,
  onOpenCreatedActionReasonChat,
}: {
  aiState: AiPrioritizationState;
  onOpenPrioritizationMethodChat: () => void;
  onOpenCreatedActionReasonChat: () => void;
}) {
  const {
    actionTrackerItems,
    actionFilterValues,
    clearActionFilters,
    isActionOverdue,
    openActionTrackerDetails,
    setActionFilterValues,
  } = useActionTrackerContext();
  const [datePreset, setDatePreset] = useState<DashboardDatePreset>('rolling45');
  const [compareMode, setCompareMode] = useState<DashboardCompareMode>('previousPeriod');
  const [areaFilter, setAreaFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');
  const [machineFilter, setMachineFilter] = useState('');
  const [originFilter, setOriginFilter] = useState<DashboardOriginGroup | ''>('');
  const [attentionFilter, setAttentionFilter] = useState<DashboardAttentionFilter>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [savedViewNote, setSavedViewNote] = useState('');
  const [hoveredPlantLine, setHoveredPlantLine] = useState<string | null>(null);
  const [isDashboardAiExpanded, setIsDashboardAiExpanded] = useState(true);
  const [dashboardFiltersAnchor, setDashboardFiltersAnchor] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(actionDashboardViewStorageKey);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        datePreset?: DashboardDatePreset;
        compareMode?: DashboardCompareMode;
        areaFilter?: string;
        unitFilter?: string;
        zoneFilter?: string;
        machineFilter?: string;
        originFilter?: DashboardOriginGroup;
        customDateFrom?: string;
        customDateTo?: string;
      };
      if (parsed.datePreset) setDatePreset(parsed.datePreset);
      if (parsed.compareMode) setCompareMode(parsed.compareMode);
      if (parsed.areaFilter) setAreaFilter(parsed.areaFilter);
      if (parsed.unitFilter) setUnitFilter(parsed.unitFilter);
      if (parsed.zoneFilter) setZoneFilter(parsed.zoneFilter);
      if (parsed.machineFilter) setMachineFilter(parsed.machineFilter);
      if (parsed.originFilter) setOriginFilter(parsed.originFilter);
      if (parsed.customDateFrom) setCustomDateFrom(parsed.customDateFrom);
      if (parsed.customDateTo) setCustomDateTo(parsed.customDateTo);
    } catch {
      window.localStorage.removeItem(actionDashboardViewStorageKey);
    }
  }, []);

  const dashboardRows = useMemo<ActionTrackerDisplayRow[]>(
    () => buildActionTrackerDisplayRows(actionTrackerItems, aiState),
    [actionTrackerItems, aiState],
  );

  const preparedRows = useMemo<DashboardPreparedRow[]>(() => {
    const baseRows = dashboardRows
      .map((row) => {
        const createdAt = typeof row.createdAtMs === 'number' && Number.isFinite(row.createdAtMs)
          ? row.createdAtMs
          : parseDashboardDate(row.creationDate);
        const dueAt = parseDashboardDate(row.dueDate);
        if (createdAt === null || dueAt === null) return null;
        return {
          ...row,
          area: getActionDashboardArea(row),
          originGroup: getActionDashboardOriginGroup(row),
          createdAt,
          dueAt,
          overdue: isActionOverdue(row),
        };
      })
      .filter((row): row is DashboardPreparedRow => Boolean(row));

    if (!baseRows.length) return baseRows;

    const referenceAt = Math.max(...baseRows.map((row) => row.createdAt));
    const demoTitles = [
      'Confirm containment after repeated seal temperature drift',
      'Replace worn guide rail before the next campaign',
      'Close guarding observation from the weekly safety walk',
      'Approve the updated startup checklist for Line 5',
      'Validate changeover material staging standard',
      'Verify labeling at the sanitation point',
      'Assign owner for recurring micro-stop analysis',
      'Confirm lubrication interval after bearing replacement',
      'Review carton code inspection frequency by shift',
      'Investigate intermittent reject sensor fault',
      'Restore centerline marks on the infeed conveyor',
      'Complete lockout verification refresher training',
    ];
    const offsets = [2, 4, 7, 10, 14, 18, 23, 29, 36, 42, 52, 61];
    const statuses: ActionTrackerStatus[] = ['Open', 'Reopened', 'Under Approval', 'Open', 'Completed', 'Open', 'Under Approval', 'Completed', 'Open', 'Completed', 'Completed', 'Completed'];
    const priorities: ActionTrackerPriority[] = ['High', 'High', 'Medium', 'Medium', 'Low', 'High', 'Medium', 'Low', 'Medium', 'High', 'Low', 'Medium'];
    const sources = ['Shift Logbook', 'Maintenance', 'TMS 1', 'Document Flow', 'TMS 2', 'ESO', 'Action Tracker', 'Maintenance', 'TMS 3', 'Shift Logbook', 'CILT', 'Action Tracker'];

    const demoRows = demoTitles.map((title, index) => {
      const seed = baseRows[index % baseRows.length];
      const createdAt = referenceAt - (offsets[index] * actionDashboardDayMs);
      const dueAt = createdAt + ((index % 4) + 3) * actionDashboardDayMs;
      const source = sources[index];
      const status = statuses[index];
      const creationDate = new Date(createdAt).toLocaleDateString('en-US', {month: 'short', day: '2-digit', year: 'numeric'});
      const dueDate = new Date(dueAt).toLocaleDateString('en-US', {month: 'short', day: '2-digit', year: 'numeric'});
      const row = {
        ...seed,
        id: `AT-DEMO-${String(index + 1).padStart(2, '0')}`,
        title,
        creationDate,
        createdAtMs: createdAt,
        dueDate,
        source,
        status,
        priority: priorities[index],
        location: `Line ${(index % 6) + 1}`,
        scopeLine: `Line ${(index % 6) + 1}`,
        line: `Line ${(index % 6) + 1}`,
        createdAt,
        dueAt,
        overdue: status !== 'Completed' && status !== 'Canceled' && dueAt < referenceAt,
        aiPriorityRecommended: false,
        aiGeneratedAction: false,
        originalIndex: baseRows.length + index,
      } as DashboardPreparedRow;

      row.area = getActionDashboardArea(row);
      row.originGroup = getActionDashboardOriginGroup(row);
      return row;
    });

    return [...baseRows, ...demoRows];
  }, [dashboardRows, isActionOverdue]);

  const minCreatedAt = preparedRows.length ? Math.min(...preparedRows.map((row) => row.createdAt)) : Date.now();
  const maxCreatedAt = preparedRows.length ? Math.max(...preparedRows.map((row) => row.createdAt)) : Date.now();

  const currentPeriod = useMemo(() => {
    if (datePreset === 'custom') {
      const parsedFrom = parseDashboardDateInput(customDateFrom);
      const parsedTo = parseDashboardDateInput(customDateTo, true);
      const fallbackStart = minCreatedAt;
      const fallbackEnd = maxCreatedAt;
      const start = parsedFrom ?? fallbackStart;
      const end = parsedTo ?? fallbackEnd;
      if (start > end) {
        return {start: end, end: start};
      }
      return {start, end};
    }
    if (datePreset === 'quarterToDate') {
      return {start: getDashboardQuarterStart(maxCreatedAt), end: maxCreatedAt};
    }
    if (datePreset === 'allActivity') {
      return {start: minCreatedAt, end: maxCreatedAt};
    }
    return {start: Math.max(minCreatedAt, maxCreatedAt - (44 * actionDashboardDayMs)), end: maxCreatedAt};
  }, [customDateFrom, customDateTo, datePreset, maxCreatedAt, minCreatedAt]);

  const previousPeriod = useMemo(() => {
    const duration = Math.max(actionDashboardDayMs, currentPeriod.end - currentPeriod.start);
    return {
      start: currentPeriod.start - duration - actionDashboardDayMs,
      end: currentPeriod.start - actionDashboardDayMs,
    };
  }, [currentPeriod]);

  const rowsAfterSharedFilters = useMemo(() => preparedRows.filter((row) => {
    const matchesLocation = !actionFilterValues.location || row.line === actionFilterValues.location;
    const matchesStatus = !actionFilterValues.status.length || actionFilterValues.status.includes(getVisibleActionStatus(row));
    const matchesPerson = !actionFilterValues.person || row.assignedTo === actionFilterValues.person || row.createdBy === actionFilterValues.person;
    const matchesArea = !areaFilter || row.area === areaFilter;
    const matchesUnit = !unitFilter || row.unit === unitFilter;
    const matchesZone = !zoneFilter || row.zone === zoneFilter;
    const matchesMachine = !machineFilter || row.machine === machineFilter;
    const matchesOrigin = !originFilter || row.originGroup === originFilter;
    const matchesAttention = attentionFilter === 'all'
      || (attentionFilter === 'open' && !row.overdue && (row.status === 'Open' || row.status === 'Under Approval'))
      || (attentionFilter === 'overdue' && row.overdue)
      || (attentionFilter === 'completed' && row.status === 'Completed');

    return matchesLocation
      && matchesStatus
      && matchesPerson
      && matchesArea
      && matchesUnit
      && matchesZone
      && matchesMachine
      && matchesOrigin
      && matchesAttention;
  }), [
    actionFilterValues.location,
    actionFilterValues.person,
    actionFilterValues.status,
    areaFilter,
    unitFilter,
    zoneFilter,
    machineFilter,
    attentionFilter,
    originFilter,
    preparedRows,
  ]);

  const rowsForPlantMap = useMemo(() => preparedRows.filter((row) => {
    const matchesStatus = !actionFilterValues.status.length || actionFilterValues.status.includes(getVisibleActionStatus(row));
    const matchesPerson = !actionFilterValues.person || row.assignedTo === actionFilterValues.person || row.createdBy === actionFilterValues.person;
    const matchesArea = !areaFilter || row.area === areaFilter;
    const matchesUnit = !unitFilter || row.unit === unitFilter;
    const matchesZone = !zoneFilter || row.zone === zoneFilter;
    const matchesMachine = !machineFilter || row.machine === machineFilter;
    const matchesOrigin = !originFilter || row.originGroup === originFilter;
    const matchesAttention = attentionFilter === 'all'
      || (attentionFilter === 'open' && !row.overdue && (row.status === 'Open' || row.status === 'Under Approval'))
      || (attentionFilter === 'overdue' && row.overdue)
      || (attentionFilter === 'completed' && row.status === 'Completed');

    return matchesStatus
      && matchesPerson
      && matchesArea
      && matchesUnit
      && matchesZone
      && matchesMachine
      && matchesOrigin
      && matchesAttention;
  }), [
    actionFilterValues.person,
    actionFilterValues.status,
    areaFilter,
    unitFilter,
    zoneFilter,
    machineFilter,
    attentionFilter,
    originFilter,
    preparedRows,
  ]);

  const currentRows = useMemo(
    () => rowsAfterSharedFilters.filter((row) => isDashboardRowRelevantToPeriod(row, currentPeriod)),
    [currentPeriod, rowsAfterSharedFilters],
  );
  const previousRows = useMemo(
    () => rowsAfterSharedFilters.filter((row) => isDashboardRowRelevantToPeriod(row, previousPeriod)),
    [previousPeriod, rowsAfterSharedFilters],
  );
  const currentPlantRows = useMemo(() => rowsForPlantMap.filter((row) => row.createdAt >= currentPeriod.start && row.createdAt <= currentPeriod.end), [currentPeriod.end, currentPeriod.start, rowsForPlantMap]);

  const sourceOptions = useMemo(() => Array.from(new Set(preparedRows.map((row) => row.source))).sort(), [preparedRows]);
  const areaOptions = useMemo(() => actionDashboardAreaOrder.filter((area) => preparedRows.some((row) => row.area === area)), [preparedRows]);
  const unitOptions = useMemo(
    () => Array.from(new Set(
      preparedRows
        .filter((row) => !areaFilter || row.area === areaFilter)
        .map((row) => row.unit)
        .filter(Boolean),
    )).sort(),
    [areaFilter, preparedRows],
  );
  const lineOptions = useMemo(
    () => Array.from(new Set(
      preparedRows
        .filter((row) => (!areaFilter || row.area === areaFilter) && (!unitFilter || row.unit === unitFilter))
        .map((row) => row.line)
        .filter(Boolean),
    )).sort(),
    [areaFilter, preparedRows, unitFilter],
  );
  const zoneOptions = useMemo(
    () => Array.from(new Set(
      preparedRows
        .filter((row) => (
          (!areaFilter || row.area === areaFilter)
          && (!unitFilter || row.unit === unitFilter)
          && (!actionFilterValues.location || row.line === actionFilterValues.location)
        ))
        .map((row) => row.zone)
        .filter(Boolean),
    )).sort(),
    [actionFilterValues.location, areaFilter, preparedRows, unitFilter],
  );
  const machineOptions = useMemo(
    () => Array.from(new Set(
      preparedRows
        .filter((row) => (
          (!areaFilter || row.area === areaFilter)
          && (!unitFilter || row.unit === unitFilter)
          && (!actionFilterValues.location || row.line === actionFilterValues.location)
          && (!zoneFilter || row.zone === zoneFilter)
        ))
        .map((row) => row.machine)
        .filter(Boolean),
    )).sort(),
    [actionFilterValues.location, areaFilter, preparedRows, unitFilter, zoneFilter],
  );
  const originOptions = useMemo(() => actionDashboardOriginOrder.filter((origin) => preparedRows.some((row) => row.originGroup === origin)), [preparedRows]);
  const personOptions = useMemo(() => Array.from(new Set(preparedRows.flatMap((row) => [row.createdBy, row.assignedTo]))).sort(), [preparedRows]);

  useEffect(() => {
    if (unitFilter && !unitOptions.includes(unitFilter)) {
      setUnitFilter('');
    }
  }, [unitFilter, unitOptions]);

  useEffect(() => {
    if (actionFilterValues.location && !lineOptions.includes(actionFilterValues.location)) {
      handleDashboardFilterChange({location: ''});
    }
  }, [actionFilterValues.location, lineOptions]);

  useEffect(() => {
    if (zoneFilter && !zoneOptions.includes(zoneFilter)) {
      setZoneFilter('');
    }
  }, [zoneFilter, zoneOptions]);

  useEffect(() => {
    if (machineFilter && !machineOptions.includes(machineFilter)) {
      setMachineFilter('');
    }
  }, [machineFilter, machineOptions]);

  const lineBuckets = useMemo(() => buildDashboardBuckets(currentPeriod.start, currentPeriod.end), [currentPeriod.end, currentPeriod.start]);
  const previousBuckets = useMemo(() => buildDashboardBuckets(previousPeriod.start, previousPeriod.end, lineBuckets.length), [lineBuckets.length, previousPeriod.end, previousPeriod.start]);

  const lineData = useMemo(() => {
    const currentCreated = countRowsInBucket(currentRows, lineBuckets, (row) => row.createdAt);
    const previousCreated = countRowsInBucket(previousRows, previousBuckets, (row) => row.createdAt);
    const dueSeries = countRowsInBucket(currentRows, lineBuckets, (row) => row.dueAt);
    const openSeries = countRowsInBucket(currentRows, lineBuckets, (row) => row.createdAt, (row) => row.status === 'Open' || row.status === 'Under Approval');
    const closedSeries = countRowsInBucket(currentRows, lineBuckets, (row) => row.createdAt, (row) => row.status === 'Completed' || row.status === 'Canceled');
    const lineSeries = Object.fromEntries(lineOptions.map((line) => [
      line,
      countRowsInBucket(currentRows, lineBuckets, (row) => row.createdAt, (row) => row.line === line),
    ]));

    return lineBuckets.map((bucket, index) => ({
      label: bucket.label,
      current: currentCreated[index] ?? 0,
      previous: previousCreated[index] ?? 0,
      dueDates: dueSeries[index] ?? 0,
      openFlow: openSeries[index] ?? 0,
      closedFlow: closedSeries[index] ?? 0,
      ...Object.fromEntries(lineOptions.map((line) => [line, (lineSeries[line]?.[index] ?? 0)])),
    }));
  }, [currentRows, lineBuckets, lineOptions, previousBuckets, previousRows]);

  const originData = useMemo(() => originOptions.map((origin) => {
    const rows = currentRows.filter((row) => row.originGroup === origin);
    return actionDashboardStatusOrder.reduce((acc, key) => {
      const count = rows.filter((row) => getDashboardStatusKey(row) === key).length;
      return {
        ...acc,
        [key]: count,
        total: (acc.total as number) + count,
      };
    }, {origin, total: 0} as Record<string, string | number>);
  }).sort((left, right) => Number(right.total) - Number(left.total)), [currentRows, originOptions]);

  const lineComparisonData = useMemo(() => areaOptions.map((area) => (
    lineOptions.reduce((acc, line) => ({
      ...acc,
      [line]: currentRows.filter((row) => row.area === area && row.line === line).length,
      total: Number(acc.total) + currentRows.filter((row) => row.area === area && row.line === line).length,
    }), {area, total: 0} as Record<string, string | number>)
  )), [areaOptions, currentRows, lineOptions]);

  const assigneeData = useMemo(() => personOptions.map((person) => {
    const rows = currentRows.filter((row) => row.assignedTo === person || row.createdBy === person);
    const statusValues = Object.fromEntries(actionDashboardVisibleStatusOrder.map((status) => [
      status,
      rows.filter((row) => getDashboardStatusKey(row) === status).length,
    ]));
    return {
      assignee: person,
      total: rows.length,
      ...statusValues,
    };
  }).filter((row) => row.total > 0).sort((left, right) => right.total - left.total).slice(0, 6), [currentRows, personOptions]);

  const statusBreakdown = useMemo(() => actionDashboardVisibleStatusOrder.map((status) => ({
    name: status,
    value: currentRows.filter((row) => getDashboardStatusKey(row) === status).length,
    fill: actionDashboardStatusPalette[status],
  })).filter((item) => item.value > 0), [currentRows]);

  const attentionRows = useMemo(() => {
    const hasAiPriorityRows = currentRows.some((row) => row.aiPriorityRecommended);

    return [...currentRows]
      .sort((left, right) => {
        if (hasAiPriorityRows) {
          const leftRank = left.aiPriorityRecommended ? left.aiPriorityRank ?? 999 : 9999;
          const rightRank = right.aiPriorityRecommended ? right.aiPriorityRank ?? 999 : 9999;
          if (leftRank !== rightRank) return leftRank - rightRank;
        }
        if (left.overdue !== right.overdue) return left.overdue ? -1 : 1;
        if (left.dueAt !== right.dueAt) return left.dueAt - right.dueAt;
        const priorityRank = {High: 3, Medium: 2, Low: 1};
        return priorityRank[right.priority] - priorityRank[left.priority];
      })
      .slice(0, 5);
  }, [currentRows]);
  const plantLineSignals = useMemo(() => actionDashboardPlantCells.map((cell) => {
    const lineRows = currentPlantRows.filter((row) => row.line === cell.line);
    const openCount = lineRows.filter((row) => row.status === 'Open' || row.status === 'Under Approval').length;
    const overdueCount = lineRows.filter((row) => row.overdue).length;
    const highPriorityCount = lineRows.filter((row) => row.priority === 'High').length;
    const completedCount = lineRows.filter((row) => row.status === 'Completed').length;
    const score = (overdueCount * 3) + (highPriorityCount * 2) + openCount;
    const health = Math.max(52, 100 - (overdueCount * 18) - (highPriorityCount * 10) - (openCount * 6));
    const topAction = [...lineRows].sort((left, right) => {
      if (left.overdue !== right.overdue) return left.overdue ? -1 : 1;
      if (left.dueAt !== right.dueAt) return left.dueAt - right.dueAt;
      return right.createdAt - left.createdAt;
    })[0];

    return {
      ...cell,
      rows: lineRows,
      openCount,
      overdueCount,
      highPriorityCount,
      completedCount,
      score,
      health,
      topAction,
    };
  }), [currentPlantRows]);
  const maxPlantScore = Math.max(1, ...plantLineSignals.map((cell) => cell.score));
  const selectedPlantLine = actionFilterValues.location || 'All Lines';
  const hoveredPlantCell = plantLineSignals.find((cell) => cell.line === hoveredPlantLine);
  const selectedPlantCell = plantLineSignals.find((cell) => cell.line === actionFilterValues.location);
  const activePlantCell = hoveredPlantCell ?? selectedPlantCell;
  const activePlantRows = activePlantCell?.rows ?? currentPlantRows;
  const activePlantOpen = activePlantRows.filter((row) => row.status === 'Open' || row.status === 'Under Approval').length;
  const activePlantOverdue = activePlantRows.filter((row) => row.overdue).length;
  const activePlantHighPriority = activePlantRows.filter((row) => row.priority === 'High').length;
  const activePlantContainment = activePlantRows.length
    ? Math.round((activePlantRows.filter((row) => row.status === 'Completed' || row.status === 'Canceled').length / activePlantRows.length) * 100)
    : 0;
  const activePlantRiskIndex = Math.min(100, (activePlantOverdue * 24) + (activePlantHighPriority * 14) + (activePlantOpen * 8));
  const activePlantTopAction = [...activePlantRows].sort((left, right) => {
    if (left.overdue !== right.overdue) return left.overdue ? -1 : 1;
    if (left.dueAt !== right.dueAt) return left.dueAt - right.dueAt;
    return right.createdAt - left.createdAt;
  })[0];

  const handleDashboardFilterChange = (patch: Partial<typeof actionFilterValues>) => {
    setActionFilterValues((previous) => ({...previous, ...patch}));
  };

  const handleDashboardAreaChange = (value: string) => {
    setAreaFilter(value);
    setUnitFilter('');
    setZoneFilter('');
    setMachineFilter('');
    handleDashboardFilterChange({location: ''});
  };

  const handleDashboardUnitChange = (value: string) => {
    setUnitFilter(value);
    setZoneFilter('');
    setMachineFilter('');
    handleDashboardFilterChange({location: ''});
  };

  const handleDashboardLineChange = (value: string) => {
    setZoneFilter('');
    setMachineFilter('');
    handleDashboardFilterChange({location: value});
  };

  const handleDashboardZoneChange = (value: string) => {
    setZoneFilter(value);
    setMachineFilter('');
  };

  const handleReset = () => {
    clearActionFilters();
    setAreaFilter('');
    setUnitFilter('');
    setZoneFilter('');
    setMachineFilter('');
    setOriginFilter('');
    setAttentionFilter('all');
    setDatePreset('rolling45');
    setCustomDateFrom('');
    setCustomDateTo('');
    setCompareMode('previousPeriod');
    setSavedViewNote('');
  };

  const handleSaveView = () => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(actionDashboardViewStorageKey, JSON.stringify({
      areaFilter,
      compareMode,
      customDateFrom,
      customDateTo,
      datePreset,
      machineFilter,
      originFilter,
      unitFilter,
      zoneFilter,
    }));
    setSavedViewNote(`Saved ${new Date().toLocaleTimeString('en-US', {hour: 'numeric', minute: '2-digit'})}`);
  };

  const handleExport = () => {
    if (typeof window === 'undefined') return;
    const csvLines = [
      ['ID', 'Title', 'Area', 'Line', 'Source', 'Created By', 'Assigned To', 'Due Date', 'Status'],
      ...currentRows.map((row) => [
        row.id,
        row.title,
        row.area,
        row.line,
        row.source,
        row.createdBy,
        row.assignedTo,
        row.dueDate,
        getDashboardStatusKey(row),
      ]),
    ];
    const csv = csvLines.map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'action-tracker-dashboard.csv';
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDatePresetChange = (value: DashboardDatePreset | '') => {
    const nextPreset = (value || 'rolling45') as DashboardDatePreset;
    if (nextPreset === 'custom' && (!customDateFrom || !customDateTo)) {
      setCustomDateFrom(formatDashboardDateInput(currentPeriod.start));
      setCustomDateTo(formatDashboardDateInput(currentPeriod.end));
    }
    setDatePreset(nextPreset);
  };

  const totalTrend = getDashboardTrend(currentRows.length, previousRows.length);
  const openTrend = getDashboardTrend(
    currentRows.filter((row) => row.status === 'Open' || row.status === 'Under Approval').length,
    previousRows.filter((row) => row.status === 'Open' || row.status === 'Under Approval').length,
    true,
  );
  const overdueTrend = getDashboardTrend(
    currentRows.filter((row) => row.overdue).length,
    previousRows.filter((row) => row.overdue).length,
    true,
  );
  const completedTrend = getDashboardTrend(
    currentRows.filter((row) => row.status === 'Completed').length,
    previousRows.filter((row) => row.status === 'Completed').length,
  );
  const extendedDueDateCount = currentRows.filter((row) => (row.dueDateExtensionCount ?? 0) > 0).length;
  const previousExtendedDueDateCount = previousRows.filter((row) => (row.dueDateExtensionCount ?? 0) > 0).length;
  const extendedDueDateTrend = getDashboardTrend(extendedDueDateCount, previousExtendedDueDateCount, true);
  const reassignedActionsCount = currentRows.filter((row) => (row.reassignmentCount ?? 0) > 0).length;
  const previousReassignedActionsCount = previousRows.filter((row) => (row.reassignmentCount ?? 0) > 0).length;
  const reassignedActionsTrend = getDashboardTrend(reassignedActionsCount, previousReassignedActionsCount, true);
  const avgResolution = getResolutionDays(currentRows);
  const previousResolution = getResolutionDays(previousRows);
  const resolutionTrend = getDashboardTrend(avgResolution, previousResolution, true);

  const metrics: DashboardMetric[] = [
    {
      id: 'all',
      label: 'Total Actions',
      value: String(currentRows.length),
      tone: '#2563EB',
      note: `${totalTrend.label} vs previous period`,
      active: attentionFilter === 'all',
      onClick: () => setAttentionFilter('all'),
    },
    {
      id: 'open',
      label: 'Open',
      value: String(currentRows.filter((row) => row.status === 'Open' || row.status === 'Under Approval').length),
      tone: '#2563EB',
      note: `${openTrend.label} less backlog pressure`,
      active: attentionFilter === 'open',
      onClick: () => setAttentionFilter((current) => current === 'open' ? 'all' : 'open'),
    },
    {
      id: 'overdue',
      label: 'Overdue',
      value: String(currentRows.filter((row) => row.overdue).length),
      tone: '#EF5A6F',
      note: `${overdueTrend.label} better than previous period`,
      active: attentionFilter === 'overdue',
      onClick: () => setAttentionFilter((current) => current === 'overdue' ? 'all' : 'overdue'),
    },
    {
      id: 'completed',
      label: 'Completed',
      value: String(currentRows.filter((row) => row.status === 'Completed').length),
      tone: '#59C36A',
      note: `${completedTrend.label} throughput vs previous period`,
      active: attentionFilter === 'completed',
      onClick: () => setAttentionFilter((current) => current === 'completed' ? 'all' : 'completed'),
    },
    {
      id: 'extendedDueDate',
      label: 'Extended Due Date',
      value: String(extendedDueDateCount),
      tone: '#F59E0B',
      note: `${extendedDueDateTrend.label} versus previous period`,
      active: false,
    },
    {
      id: 'reassignedActions',
      label: 'Reassigned Actions',
      value: String(reassignedActionsCount),
      tone: '#0F766E',
      note: `${reassignedActionsTrend.label} versus previous period`,
      active: false,
    },
    {
      id: 'avgResolution',
      label: 'Avg. Resolution Time',
      value: avgResolution.toFixed(1),
      unit: 'days',
      tone: '#8B5CF6',
      note: `${resolutionTrend.label} faster than previous period`,
      active: false,
    },
  ];

  const activeChips = [
    areaFilter ? `Area: ${areaFilter}` : '',
    unitFilter ? `Unit: ${unitFilter}` : '',
    actionFilterValues.location ? `Line: ${actionFilterValues.location}` : '',
    zoneFilter ? `Zone: ${zoneFilter}` : '',
    machineFilter ? `Machine: ${machineFilter}` : '',
    actionFilterValues.person ? `Person: ${actionFilterValues.person}` : '',
    originFilter ? `Origin: ${originFilter}` : '',
    actionFilterValues.source.length ? `Source: ${actionFilterValues.source.join(', ')}` : '',
    actionFilterValues.status.length ? `Status: ${actionFilterValues.status.map((status) => formatStatusLabel(status as ActionTrackerStatus)).join(', ')}` : '',
    attentionFilter !== 'all' ? `Focus: ${attentionFilter}` : '',
  ].filter(Boolean);
  const activeAdvancedFilterCount = activeChips.length;

  return (
    <Box sx={{display: 'grid', gap: 1.3}}>
      <Paper
        elevation={0}
        sx={{
          p: isDashboardAiExpanded ? 2 : 1.25,
          minHeight: isDashboardAiExpanded ? 'auto' : 44,
          borderRadius: '12px',
          border: 'none',
          bgcolor: tokenNeutral.lightest,
          overflow: 'visible',
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: isDashboardAiExpanded ? 1 : 0.75, minHeight: 24, mb: isDashboardAiExpanded ? 2 : 0}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0}}>
            <SparkleIcon sx={{fontSize: 16, color: tokenWarning.dark}} />
            <Typography sx={{color: tokenBrand.main, fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.1}}>
              BLU.AI analysis
            </Typography>
          </Box>
          <Button
            size="small"
            onClick={() => setIsDashboardAiExpanded((current) => !current)}
            sx={{color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', minWidth: 0, px: 0.5, py: 0.2, lineHeight: 1.1, '&:hover': {bgcolor: 'transparent', color: tokenText.primary}}}
          >
            {isDashboardAiExpanded ? 'Collapse' : 'Expand'}
            {isDashboardAiExpanded
              ? <KeyboardArrowUpIcon sx={{fontSize: 16, ml: 0.25}} />
              : <KeyboardArrowDownIcon sx={{fontSize: 16, ml: 0.25}} />}
          </Button>
        </Box>
        {isDashboardAiExpanded ? (
          <Box sx={{display: 'grid', gap: 0.45}}>
            {[
              {
                title: attentionRows[0] ? `${attentionRows[0].id} needs attention first.` : 'The current queue is stable.',
                detail: attentionRows[0] ? `${attentionRows[0].title} has the strongest combined due-date, priority, and workflow signal.` : 'No critical ownership or due-date signal is active in this view.',
                severity: attentionRows[0]?.overdue ? 'high' : 'info',
                highlighted: true,
                onClick: attentionRows[0] ? () => openActionTrackerDetails(attentionRows[0]) : onOpenPrioritizationMethodChat,
              },
              {
                title: `${currentRows.filter((row) => row.overdue).length} overdue actions in this scope`,
                detail: 'Focus the dashboard on due-date pressure and the owners carrying the recovery work.',
                severity: 'high',
                highlighted: false,
                onClick: () => setAttentionFilter((current) => current === 'overdue' ? 'all' : 'overdue'),
              },
              {
                title: aiState.hasAcceptedAiPrioritization ? 'BLU.AI priority is active' : 'Review the prioritization logic',
                detail: aiState.hasAcceptedAiPrioritization ? 'The charts and focus list now reflect the accepted top-five sequence.' : 'See how overdue pressure, approvals, repeated patterns, and ownership shape the recommended order.',
                severity: 'info',
                highlighted: false,
                onClick: onOpenPrioritizationMethodChat,
              },
            ].map((item) => (
              <Box
                key={item.title}
                component="button"
                type="button"
                onClick={item.onClick}
                sx={{appearance: 'none', display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%', m: 0, px: item.highlighted ? 1.25 : 1, py: item.highlighted ? 0.85 : 0.5, borderRadius: '6px', border: item.highlighted ? `1px solid ${tokenDivider}` : '1px solid transparent', bgcolor: item.highlighted ? 'rgba(0,0,0,0.025)' : 'transparent', textAlign: 'left', cursor: 'pointer', '&:hover': {bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main}}}
              >
                {item.severity === 'high'
                  ? <ReportProblemOutlinedIcon sx={{fontSize: 16, color: tokenError.main, mt: 0.15, flexShrink: 0}} />
                  : <TipsAndUpdatesOutlinedIcon sx={{fontSize: 16, color: tokenBrand.main, mt: 0.15, flexShrink: 0}} />}
                <Typography sx={{color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.32, flex: 1, minWidth: 0}}>
                  <Box component="span" sx={{color: tokenText.primary, fontWeight: 700}}>{item.title}</Box>
                  {' - '}{item.detail}
                </Typography>
              </Box>
            ))}
          </Box>
        ) : null}
      </Paper>

      <Paper elevation={0} sx={{p: {xs: 1.25, md: 1.5}, borderRadius: '12px', border: `1px solid ${actionDashboardPanelBorder}`, bgcolor: 'background.paper', backgroundImage: 'none', boxShadow: 'none'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, width: '100%', overflowX: 'auto', pb: 0.25}}>
          <Box sx={{width: 260, minWidth: 220, flex: '0 1 260px'}}>
            <DashboardSelectField
              label="Date Range"
              value={datePreset}
              onChange={handleDatePresetChange}
              options={[
                {label: `Rolling 45 days (${formatDashboardRange(currentPeriod.start, currentPeriod.end)})`, value: 'rolling45'},
                {label: 'Quarter to date', value: 'quarterToDate'},
                {label: 'All activity', value: 'allActivity'},
                {label: 'Custom range', value: 'custom'},
              ]}
            />
          </Box>
          <Box sx={{width: 190, minWidth: 170, flex: '0 1 190px'}}>
            <DashboardSelectField
              label="Compare By"
              value={compareMode}
              onChange={(value) => setCompareMode((value || 'previousPeriod') as DashboardCompareMode)}
              options={[
                {label: 'Previous period', value: 'previousPeriod'},
                {label: 'Created vs due date', value: 'createdVsDue'},
                {label: 'Open vs closed flow', value: 'openVsClosed'},
                {label: 'Compare by lines', value: 'lines'},
              ]}
            />
          </Box>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon sx={{fontSize: 17}} />}
            onClick={(event) => setDashboardFiltersAnchor(event.currentTarget)}
            sx={{...actionDashboardToolbarButtonSx, minWidth: 104, flexShrink: 0}}
          >
            Filters{activeAdvancedFilterCount ? ` (${activeAdvancedFilterCount})` : ''}
          </Button>
          <Box sx={{flex: 1, minWidth: 12}} />
          <Button variant="outlined" onClick={handleSaveView} sx={{...actionDashboardToolbarButtonSx, flexShrink: 0}}>
            Save View
          </Button>
          <Button variant="outlined" onClick={handleExport} sx={{...actionDashboardToolbarButtonSx, flexShrink: 0}}>
            Export
          </Button>
        </Box>

        <Popover
          open={Boolean(dashboardFiltersAnchor)}
          anchorEl={dashboardFiltersAnchor}
          onClose={() => setDashboardFiltersAnchor(null)}
          anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
          transformOrigin={{vertical: 'top', horizontal: 'left'}}
          slotProps={{paper: {sx: {mt: 0.75, p: 1.5, width: {xs: 'calc(100vw - 32px)', sm: 560}, maxWidth: 'calc(100vw - 32px)', borderRadius: '8px', border: `1px solid ${tokenDivider}`, boxShadow: '0 10px 28px rgba(15, 23, 42, 0.14)'}}}}
        >
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))'}, gap: 1}}>
            <DashboardSelectField label="Area" value={areaFilter} onChange={handleDashboardAreaChange} allLabel="All Areas" options={areaOptions.map((option) => ({label: option, value: option}))} />
            <DashboardSelectField label="Unit" value={unitFilter} onChange={handleDashboardUnitChange} allLabel="All Units" options={unitOptions.map((option) => ({label: option, value: option}))} />
            <DashboardSelectField label="Line" value={actionFilterValues.location} onChange={handleDashboardLineChange} allLabel="All Lines" options={lineOptions.map((option) => ({label: option, value: option}))} />
            <DashboardSelectField label="Zone" value={zoneFilter} onChange={handleDashboardZoneChange} allLabel="All Zones" options={zoneOptions.map((option) => ({label: option, value: option}))} />
            <DashboardSelectField label="Machine" value={machineFilter} onChange={setMachineFilter} allLabel="All Machines" options={machineOptions.map((option) => ({label: option, value: option}))} />
            <DashboardSelectField label="Created By / Assigned To" value={actionFilterValues.person} onChange={(value) => handleDashboardFilterChange({person: value})} allLabel="All People" options={personOptions.map((option) => ({label: option, value: option}))} />
            <DashboardSelectField label="Source / Origin" value={originFilter} onChange={(value) => setOriginFilter(value as DashboardOriginGroup | '')} allLabel="All Sources" options={originOptions.map((option) => ({label: option, value: option}))} />
            <DashboardSelectField label="Status" value={actionFilterValues.status[0] ?? ''} onChange={(value) => handleDashboardFilterChange({status: value ? [value] : []})} allLabel="All Statuses" options={(['Open', 'Reopened', 'Under Approval', 'Completed', 'Canceled', 'Overdue'] as ActionTrackerStatus[]).map((option) => ({label: option, value: option}))} />
            {datePreset === 'custom' ? <DashboardDateField label="From" value={customDateFrom} onChange={setCustomDateFrom} /> : null}
            {datePreset === 'custom' ? <DashboardDateField label="To" value={customDateTo} onChange={setCustomDateTo} /> : null}
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mt: 1.5, pt: 1.25, borderTop: `1px solid ${tokenDivider}`}}>
            <Button variant="text" onClick={handleReset} sx={{...actionDashboardToolbarButtonSx, minWidth: 0, border: 'none', px: 0.5}}>
              Reset filters
            </Button>
            <Button variant="contained" onClick={() => setDashboardFiltersAnchor(null)} sx={{height: 34, borderRadius: '8px', px: 2, textTransform: 'none', boxShadow: 'none'}}>
              Apply
            </Button>
          </Box>
        </Popover>
        {savedViewNote || activeChips.length ? (
          <Box sx={{display: 'flex', gap: 0.8, flexWrap: 'wrap', mt: 1.4}}>
            {savedViewNote ? <Chip size="small" label={savedViewNote} sx={{bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontWeight: 400, borderRadius: '999px'}} /> : null}
            {activeChips.map((chip) => (
              <Chip key={chip} size="small" label={chip} sx={{bgcolor: tokenNeutral.light, color: tokenText.primary, border: 'none', fontWeight: 400, borderRadius: '999px'}} />
            ))}
          </Box>
        ) : null}
      </Paper>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(7, minmax(0, 1fr))'}, gap: 1.2}}>
        {metrics.map((metric) => {
          const trend = metric.id === 'all'
            ? totalTrend
            : metric.id === 'open'
              ? openTrend
              : metric.id === 'overdue'
                ? overdueTrend
                : metric.id === 'completed'
                  ? completedTrend
                  : metric.id === 'extendedDueDate'
                    ? extendedDueDateTrend
                    : metric.id === 'reassignedActions'
                      ? reassignedActionsTrend
                  : resolutionTrend;
          const TrendIcon = trend.direction === 'up'
            ? TrendingUpIcon
            : trend.direction === 'down'
              ? TrendingDownIcon
              : TrendingFlatIcon;

          return (
            <Paper
              key={metric.label}
              elevation={0}
              onClick={metric.onClick}
              sx={{
                p: 1.7,
                borderRadius: '12px',
                border: metric.active ? `1px solid ${metric.tone}` : `1px solid ${actionDashboardPanelBorder}`,
                bgcolor: metric.active ? tokenBrand.softBg : 'background.paper',
                cursor: metric.onClick ? 'pointer' : 'default',
                boxShadow: 'none',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': metric.onClick ? {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 10px rgba(0,31,155,0.12)',
                } : undefined,
              }}
            >
              <Box sx={{position: 'absolute', inset: '0 auto 0 0', width: 4, bgcolor: metric.tone}} />
              <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1}}>
                <Box sx={{width: 40, height: 40, borderRadius: '8px', display: 'grid', placeItems: 'center', bgcolor: tokenNeutral.lighter, color: metric.tone}}>
                  {metric.id === 'overdue'
                    ? <ReportProblemOutlinedIcon />
                    : metric.id === 'completed'
                      ? <TaskAltOutlinedIcon />
                      : metric.id === 'avgResolution'
                        ? <AccessTimeFilledIcon />
                        : metric.id === 'extendedDueDate'
                          ? <CalendarMonthOutlinedIcon />
                          : metric.id === 'reassignedActions'
                            ? <SwapHorizOutlinedIcon />
                            : <AppsIcon />}
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, color: trend.direction === 'down' && metric.id !== 'avgResolution' ? tokenError.main : tokenSuccess.darker}}>
                  <TrendIcon sx={{fontSize: 16}} />
                  <Typography sx={{fontSize: 12, fontWeight: 500}}>
                    {trend.label}
                  </Typography>
                </Box>
              </Box>
              <Typography sx={{mt: 1.5, fontSize: 14, fontWeight: 500, color: tokenText.primary}}>
                {metric.label}
              </Typography>
              <Typography sx={{mt: 0.4, fontSize: 24, fontWeight: 400, color: tokenText.primary, lineHeight: 1}}>
                {metric.value} {metric.unit ? <Box component="span" sx={{fontSize: 14, color: tokenText.secondary}}>{metric.unit}</Box> : null}
              </Typography>
              <Typography sx={{mt: 0.8, fontSize: 12, color: tokenText.secondary, fontWeight: 400}}>
                {metric.note}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1.35fr 1fr'}, gap: 1.2}}>
        <DashboardPanel title="Actions Over Time" subtitle={`${formatDashboardRange(currentPeriod.start, currentPeriod.end)} compared by ${compareMode === 'previousPeriod' ? 'previous period' : compareMode === 'createdVsDue' ? 'created vs due dates' : compareMode === 'openVsClosed' ? 'open vs closed flow' : 'lines'}`}>
          <DashboardChartSurface
            label="Trend Analysis"
            detail={compareMode === 'lines' ? 'Compare movement by line' : compareMode === 'openVsClosed' ? 'See backlog versus completion flow' : 'Track action volume over time'}
            height={280}
            action={<Chip size="small" label={compareMode === 'lines' ? `${lineOptions.length} lines` : 'Live trend'} sx={actionDashboardSectionChipSx} />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{top: 8, right: 18, left: 0, bottom: 0}}>
                <CartesianGrid stroke="#DCE6F4" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tick={{fontSize: 11, fill: '#6B7A90'}} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{fontSize: 11, fill: '#6B7A90'}} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<DashboardChartTooltip />} />
                <Legend wrapperStyle={{paddingTop: 12, fontSize: 11, color: '#48607D'}} iconType="circle" />
                {compareMode !== 'lines' ? <Line type="monotone" dataKey="current" name="Current Period" stroke="#1D4ED8" strokeWidth={3} dot={{r: 0}} activeDot={{r: 5}} /> : null}
                {compareMode === 'previousPeriod' ? <Line type="monotone" dataKey="previous" name="Previous Period" stroke="#8DB8FF" strokeWidth={2.5} strokeDasharray="5 5" dot={{r: 0}} /> : null}
                {compareMode === 'createdVsDue' ? <Line type="monotone" dataKey="dueDates" name="Due Dates" stroke="#7C6CF2" strokeWidth={2.5} dot={{r: 0}} /> : null}
                {compareMode === 'openVsClosed' ? <Line type="monotone" dataKey="openFlow" name="Open Flow" stroke="#F59E0B" strokeWidth={2.5} dot={{r: 0}} /> : null}
                {compareMode === 'openVsClosed' ? <Line type="monotone" dataKey="closedFlow" name="Closed Flow" stroke="#22C55E" strokeWidth={2.5} dot={{r: 0}} /> : null}
                {compareMode === 'lines' ? lineOptions.map((line, index) => (
                  <Line key={line} type="monotone" dataKey={line} name={line} stroke={actionDashboardLineColors[index % actionDashboardLineColors.length]} strokeWidth={2.5} dot={{r: 0}} />
                )) : null}
              </LineChart>
            </ResponsiveContainer>
          </DashboardChartSurface>
        </DashboardPanel>

        <DashboardPanel title="Actions by Origin" subtitle="Click a segment to drill into source and status">
          <DashboardChartSurface
            label="Source Mix"
            detail="Stacked by workflow state so source pressure stays readable"
            height={280}
            action={<Chip size="small" label={`${originData.length} groups`} sx={actionDashboardSectionChipSx} />}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={originData} layout="vertical" margin={{top: 8, right: 24, left: 12, bottom: 0}}>
                <CartesianGrid stroke="#DCE6F4" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{fontSize: 11, fill: '#6B7A90'}} axisLine={false} tickLine={false} />
                <YAxis dataKey="origin" type="category" width={92} tick={{fontSize: 11, fill: '#334155'}} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<DashboardChartTooltip />} />
                <Legend wrapperStyle={{paddingTop: 12, fontSize: 11, color: '#48607D'}} iconType="circle" />
                {actionDashboardStatusOrder.map((status) => (
                  <Bar
                    key={status}
                    dataKey={status}
                    stackId="origin"
                    fill={actionDashboardStatusPalette[status]}
                    radius={status === 'Canceled' ? [0, 8, 8, 0] : status === 'Open' ? [8, 0, 0, 8] : 0}
                    onClick={(data: any) => {
                      if (!data?.origin) return;
                      setOriginFilter(data.origin as DashboardOriginGroup);
                      handleDashboardFilterChange({status: status === 'Overdue' ? [] : [status]});
                      if (status === 'Overdue') setAttentionFilter('overdue');
                    }}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </DashboardChartSurface>
        </DashboardPanel>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1fr 1fr 0.9fr'}, gap: 1.2}}>
        <DashboardPanel title="Area vs Line Comparison" subtitle="Click a bar to isolate a line">
          <DashboardChartSurface
            label="Coverage Map"
            detail="Use line density to spot where volume clusters by area"
            height={250}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={lineComparisonData} layout="vertical" margin={{top: 8, right: 16, left: 8, bottom: 0}}>
                <CartesianGrid stroke="#DCE6F4" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{fontSize: 11, fill: '#6B7A90'}} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="area" width={64} tick={{fontSize: 11, fill: '#334155'}} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<DashboardChartTooltip />} />
                <Legend wrapperStyle={{paddingTop: 12, fontSize: 11, color: '#48607D'}} iconType="circle" />
                {lineOptions.map((line, index) => (
                  <Bar
                    key={line}
                    dataKey={line}
                    fill={['#1D4ED8', '#6EA4FF', '#C0D8FF'][index % 3]}
                    radius={[8, 8, 8, 8]}
                    onClick={() => handleDashboardFilterChange({location: line})}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </DashboardChartSurface>
        </DashboardPanel>

        <DashboardPanel title="Actions by Assignee" subtitle="Top owners with status split, so the queue stays readable">
          <DashboardChartSurface
            label="Ownership Load"
            detail="See who is carrying open pressure and where state stacks"
            height={250}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={assigneeData} layout="vertical" margin={{top: 8, right: 16, left: 36, bottom: 0}}>
                <CartesianGrid stroke="#DCE6F4" strokeDasharray="4 4" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{fontSize: 11, fill: '#6B7A90'}} axisLine={false} tickLine={false} />
                <YAxis dataKey="assignee" type="category" width={96} tick={{fontSize: 11, fill: '#334155'}} axisLine={false} tickLine={false} />
                <RechartsTooltip content={<DashboardChartTooltip />} />
                <Legend wrapperStyle={{paddingTop: 12, fontSize: 11, color: '#48607D'}} iconType="circle" />
                {actionDashboardVisibleStatusOrder.map((status) => (
                  <Bar
                    key={status}
                    dataKey={status}
                    stackId="assignee"
                    fill={actionDashboardStatusPalette[status]}
                    radius={status === 'Overdue' ? [0, 8, 8, 0] : status === 'Open' ? [8, 0, 0, 8] : 0}
                    onClick={(data: any) => {
                      handleDashboardFilterChange({person: data?.assignee as string, status: status === 'Overdue' ? [] : [status]});
                      if (status === 'Overdue') setAttentionFilter('overdue');
                    }}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </DashboardChartSurface>
        </DashboardPanel>

        <DashboardPanel title="Status Breakdown" subtitle="Tap a slice to filter the dashboard">
          <DashboardChartSurface
            label="Status Mix"
            detail="Tap any slice to focus the dashboard on that queue state"
            height={250}
            action={<Chip size="small" label="Click to filter" sx={actionDashboardSectionChipSx} />}
          >
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: {xs: 'wrap', md: 'nowrap'}, minHeight: 250}}>
            <Box sx={{position: 'relative', width: {xs: '100%', md: 220}, height: 220, flex: '0 0 auto'}}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusBreakdown}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={54}
                    outerRadius={84}
                    paddingAngle={2}
                    onClick={(data: any) => {
                      if (!data?.name) return;
                      if (data.name === 'Overdue') {
                        setAttentionFilter((current) => current === 'overdue' ? 'all' : 'overdue');
                        handleDashboardFilterChange({status: []});
                        return;
                      }
                      handleDashboardFilterChange({status: actionFilterValues.status.includes(data.name) ? [] : [data.name]});
                    }}
                  >
                    {statusBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<DashboardChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none'}}>
                <Box sx={{textAlign: 'center'}}>
                  <Typography sx={{fontSize: 30, fontWeight: 900, color: '#13233E', lineHeight: 1}}>
                    {currentRows.length}
                  </Typography>
                  <Typography sx={{fontSize: 12, color: '#6B7A90', fontWeight: 700}}>
                    Total
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{display: 'grid', gap: 0.7, flex: 1, minWidth: 220}}>
              {statusBreakdown.map((item) => (
                <Box key={item.name} sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
                    <Box sx={{width: 10, height: 10, borderRadius: '50%', bgcolor: item.fill}} />
                    <Typography sx={{fontSize: 12, color: '#334155', fontWeight: 700}}>{item.name}</Typography>
                  </Box>
                  <Typography sx={{fontSize: 12, color: '#6B7A90', fontWeight: 800}}>
                    {item.value} ({currentRows.length ? ((item.value / currentRows.length) * 100).toFixed(1) : '0.0'}%)
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
          </DashboardChartSurface>
        </DashboardPanel>
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', xl: '1fr 1.15fr'}, gap: 1.2}}>
        <DashboardPanel title="Plant Heat Map" subtitle="Shift Logbook-style plant view driven by action pressure and due-date risk">
          <Box sx={{display: 'grid', gap: 0.9}}>
            <Paper
              elevation={0}
              sx={{
                position: 'relative',
                minHeight: 540,
                borderRadius: 2.2,
                border: '1px solid #CFE0F8',
                overflow: 'hidden',
                bgcolor: '#EEF5FF',
              }}
              onMouseLeave={() => setHoveredPlantLine(null)}
            >
              <Box
                component="img"
                src="/images/site-view.png"
                alt="Plant overview"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  pointerEvents: 'none',
                  userSelect: 'none',
                }}
              />
              <Box sx={{position: 'absolute', inset: 0, bgcolor: 'transparent'}} />
              <Box sx={{position: 'absolute', top: 14, left: 14, bgcolor: '#081C43', color: '#FFFFFF', px: 1.2, py: 0.6, borderRadius: 1.4, fontWeight: 800, fontSize: '0.82rem', zIndex: 2}}>
                Plant
              </Box>
              <Paper elevation={0} sx={{position: 'absolute', left: 14, top: 56, zIndex: 2, px: 0.9, py: 0.55, borderRadius: 1.1, bgcolor: 'rgba(8,28,67,0.78)', border: '1px solid rgba(148,180,236,0.5)'}}>
                <Typography sx={{color: '#DAE8FF', fontWeight: 800, fontSize: '0.72rem'}}>
                  Hover a line to preview action pressure
                </Typography>
              </Paper>
              {plantLineSignals.map((cell) => {
                const intensity = cell.score / maxPlantScore;
                const isSelected = selectedPlantLine === cell.line;
                const isHovered = hoveredPlantLine === cell.line;
                const tone = cell.overdueCount > 0 ? '#EF4444' : cell.openCount > 0 ? '#F59E0B' : '#22C55E';

                return (
                  <Button
                    key={cell.label}
                    onClick={() => handleDashboardFilterChange({location: isSelected ? '' : cell.line})}
                    onMouseEnter={() => setHoveredPlantLine(cell.line)}
                    sx={{
                      position: 'absolute',
                      top: cell.top,
                      left: cell.left,
                      textTransform: 'none',
                      borderRadius: 1.6,
                      px: 1.1,
                      py: 0.45,
                      minWidth: 126,
                      justifyContent: 'flex-start',
                      bgcolor: isSelected || isHovered ? '#0E1F48' : `rgba(17,42,95,${0.88 + (intensity * 0.12)})`,
                      color: '#FFFFFF',
                      border: isSelected || isHovered ? `1px solid ${tone}` : '1px solid rgba(45,76,132,0.95)',
                      boxShadow: isSelected || isHovered ? `0 0 0 2px ${tone}33, 0 10px 20px rgba(3,15,39,0.35)` : '0 5px 10px rgba(3,15,39,0.2)',
                      transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                      transition: 'all 0.22s ease',
                      '&:hover': {bgcolor: '#0E1F48'},
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65}}>
                      <Box sx={{width: 8, height: 8, borderRadius: 99, bgcolor: tone, boxShadow: '0 0 0 4px rgba(255,255,255,0.08)'}} />
                      <Box sx={{textAlign: 'left'}}>
                        <Typography sx={{fontWeight: 800, fontSize: '0.83rem', lineHeight: 1.05}}>{cell.label}</Typography>
                        <Typography sx={{fontWeight: 700, fontSize: '0.64rem', color: '#C7D8F8', mt: 0.15}}>
                          {cell.openCount} open • {cell.overdueCount} overdue
                        </Typography>
                      </Box>
                    </Box>
                  </Button>
                );
              })}
              {hoveredPlantCell ? (
                <Paper
                  elevation={0}
                  sx={{
                    position: 'absolute',
                    top: `calc(${hoveredPlantCell.top} - 96px)`,
                    left: `calc(${hoveredPlantCell.left} + 16px)`,
                    zIndex: 3,
                    p: 0.8,
                    minWidth: 228,
                    borderRadius: 1.4,
                    bgcolor: 'rgba(8,28,67,0.92)',
                    border: '1px solid rgba(123,173,255,0.62)',
                    boxShadow: '0 14px 24px rgba(2,12,35,0.45)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Typography sx={{color: '#E8F1FF', fontWeight: 900, fontSize: '0.8rem'}}>{hoveredPlantCell.label} · {hoveredPlantCell.line}</Typography>
                  <Typography sx={{color: '#AFC8ED', fontSize: '0.72rem', mt: 0.15}}>Zone: {hoveredPlantCell.zone}</Typography>
                  <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5, mt: 0.55}}>
                    <Box sx={{p: 0.45, borderRadius: 0.9, bgcolor: 'rgba(255,255,255,0.06)'}}>
                      <Typography sx={{color: '#9FC4FF', fontSize: '0.62rem', fontWeight: 800}}>OPEN</Typography>
                      <Typography sx={{color: '#FFFFFF', fontSize: '0.92rem', fontWeight: 900}}>{hoveredPlantCell.openCount}</Typography>
                    </Box>
                    <Box sx={{p: 0.45, borderRadius: 0.9, bgcolor: 'rgba(255,255,255,0.06)'}}>
                      <Typography sx={{color: '#9FC4FF', fontSize: '0.62rem', fontWeight: 800}}>OVERDUE</Typography>
                      <Typography sx={{color: '#FCA5A5', fontSize: '0.92rem', fontWeight: 900}}>{hoveredPlantCell.overdueCount}</Typography>
                    </Box>
                  </Box>
                  <Typography sx={{color: '#D5E7FF', fontSize: '0.68rem', mt: 0.55, lineHeight: 1.35}}>
                    {hoveredPlantCell.topAction ? `Top action: ${hoveredPlantCell.topAction.title}` : 'No active action in this line scope.'}
                  </Typography>
                </Paper>
              ) : null}
              <Button
                onClick={() => handleDashboardFilterChange({location: ''})}
                sx={{
                  position: 'absolute',
                  right: 14,
                  top: 14,
                  textTransform: 'none',
                  bgcolor: selectedPlantLine === 'All Lines' ? '#0E1F48' : '#FFFFFFCC',
                  color: selectedPlantLine === 'All Lines' ? '#FFFFFF' : '#163467',
                  borderRadius: 1.2,
                  px: 1.2,
                  py: 0.45,
                  fontWeight: 800,
                  border: '1px solid #C7D7EE',
                  '&:hover': {bgcolor: selectedPlantLine === 'All Lines' ? '#0B1A3B' : '#FFFFFF'},
                }}
              >
                {selectedPlantLine}
              </Button>
            </Paper>

            <Box sx={{display: 'grid', gridTemplateColumns: {xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))'}, gap: 0.7}}>
              {[
                {label: 'Open Actions', value: activePlantOpen, tone: '#0B63E5'},
                {label: 'Overdue', value: activePlantOverdue, tone: '#EF5A6F'},
                {label: 'High Priority', value: activePlantHighPriority, tone: '#F59E0B'},
                {label: 'Containment', value: `${activePlantContainment}%`, tone: '#16A34A'},
              ].map((item) => (
                <Paper key={item.label} elevation={0} sx={{p: 1, borderRadius: 1.8, border: '1px solid #D8E4F0', bgcolor: '#F8FBFF'}}>
                  <Typography sx={{fontSize: 11, fontWeight: 800, color: '#6B7A90', textTransform: 'uppercase'}}>{item.label}</Typography>
                  <Typography sx={{mt: 0.35, fontSize: 22, fontWeight: 900, color: item.tone, lineHeight: 1}}>{item.value}</Typography>
                </Paper>
              ))}
            </Box>

            <Paper elevation={0} sx={{p: 1.1, borderRadius: 1.8, border: '1px solid #D8E4F0', bgcolor: '#FFFFFF'}}>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
                <Typography sx={{fontSize: 14, fontWeight: 900, color: '#13233E'}}>
                  {activePlantCell ? `${activePlantCell.line} focus` : 'All lines focus'}
                </Typography>
                <Chip
                  size="small"
                  label={`Risk index ${activePlantRiskIndex}`}
                  sx={{bgcolor: '#EEF7FF', color: '#0B63E5', fontWeight: 900}}
                />
              </Box>
              <Typography sx={{mt: 0.6, fontSize: 12.5, color: '#5B6B81', lineHeight: 1.45}}>
                {activePlantTopAction
                  ? `${activePlantTopAction.title} is the main pressure point in ${activePlantCell?.line ?? 'the current scope'}, owned by ${activePlantTopAction.assignedTo}, due ${activePlantTopAction.dueDate}.`
                  : 'No critical actions match the current dashboard slice for this plant view.'}
              </Typography>
            </Paper>
          </Box>
        </DashboardPanel>

        <DashboardPanel
          title="Actions Requiring Attention"
          subtitle="Prioritized from the current dashboard slice"
          actions={(
            <Box sx={{display: 'flex', gap: 0.35, flexWrap: 'wrap', justifyContent: {xs: 'flex-start', md: 'flex-end'}}}>
              <Button
                size="small"
                onClick={onOpenPrioritizationMethodChat}
                sx={actionDashboardHeaderActionSx}
              >
                How BLU.AI prioritized
              </Button>
              <Button
                size="small"
                onClick={onOpenCreatedActionReasonChat}
                sx={actionDashboardHeaderActionSx}
              >
                Why it created an action
              </Button>
            </Box>
          )}
        >
          <Box sx={{display: 'grid', gap: 0.8}}>
            {attentionRows.length ? (
              <Box sx={{display: {xs: 'none', md: 'grid'}, gridTemplateColumns: '42px minmax(0, 1.65fr) minmax(170px, 0.95fr) 132px 112px 120px', gap: 1, px: 1.2, py: 0.2}}>
                {['', 'Action', 'Source / Plant / Area / Unit / Line', 'Owner', 'Due Date', 'Status / Priority'].map((label, index) => (
                  <Typography key={label} sx={{fontSize: 10.5, letterSpacing: 0.7, textTransform: 'uppercase', color: '#7A8BA8', fontWeight: 900}}>
                    {index === 0 ? 'Rank' : label}
                  </Typography>
                ))}
              </Box>
            ) : null}
            {attentionRows.map((row) => (
              <Paper
                key={row.id}
                onClick={() => openActionTrackerDetails(row)}
                sx={{
                  p: 1.2,
                  borderRadius: 2,
                  border: row.aiPriorityRecommended ? '1px solid #D6E4FF' : '1px solid #E6EEF7',
                  bgcolor: row.aiPriorityRecommended ? '#FBFDFF' : '#FFFFFF',
                  cursor: 'pointer',
                  transition: 'border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease',
                  '&:hover': {
                    borderColor: '#C7D7EE',
                    boxShadow: '0 10px 24px rgba(15,23,42,0.06)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '42px minmax(0, 1.65fr) minmax(170px, 0.95fr) 132px 112px 120px'}, gap: 1.1, alignItems: 'center'}}>
                  <Box sx={{display: 'flex', justifyContent: {xs: 'flex-start', md: 'center'}, alignSelf: 'flex-start'}}>
                    {row.aiPriorityRecommended && row.aiPriorityRank ? (
                      <Box sx={{width: 28, height: 28, borderRadius: '50%', bgcolor: '#2563EB', color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 900, boxShadow: '0 8px 18px rgba(37,99,235,0.22)'}}>
                        {row.aiPriorityRank}
                      </Box>
                    ) : (
                      <Box sx={{width: 28, height: 28, borderRadius: '50%', bgcolor: '#EEF2FF', color: '#64748B', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 900}}>
                        !
                      </Box>
                    )}
                  </Box>

                  <Box sx={{minWidth: 0}}>
                    <Typography sx={{fontSize: 12, fontWeight: 700, color: '#64748B'}}>{row.id}</Typography>
                    <Typography sx={{mt: 0.15, fontSize: 14, fontWeight: 800, color: '#13233E', lineHeight: 1.3}}>
                      {row.title}
                    </Typography>
                    {row.aiPriorityRecommended ? (
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, mt: 0.55}}>
                        <SparkleIcon sx={{fontSize: 12, color: '#2563EB'}} />
                        <Typography sx={{fontSize: 11.5, color: '#2563EB', fontWeight: 700, lineHeight: 1.2}}>
                          Prioritized by BLU.AI
                        </Typography>
                      </Box>
                    ) : null}
                    {row.aiGeneratedAction ? (
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, mt: 0.3}}>
                        <SparkleIcon sx={{fontSize: 12, color: '#0F766E'}} />
                        <Typography sx={{fontSize: 11.5, color: '#0F766E', fontWeight: 700, lineHeight: 1.2}}>
                          Created by BLU.AI from startup scrap, document pressure, and ownership gap
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>

                  <Box sx={{display: 'grid', gap: 0.45, minWidth: 0}}>
                    <Chip size="small" label={row.source} sx={{width: 'fit-content', bgcolor: '#FFFFFF', color: '#516173', border: '1px solid #D8E4F0', fontWeight: 800}} />
                    <Typography sx={{fontSize: 12.5, color: '#516173', fontWeight: 700}}>
                      {row.scopePlant || '—'} / {row.scopeArea || '—'} / {row.scopeUnit || '—'} / {row.scopeLine || '—'}
                    </Typography>
                    {row.scopeZone || row.machine ? (
                      <Typography sx={{fontSize: 11.5, color: '#7A8BA8'}}>
                        {[row.scopeZone, row.machine].filter(Boolean).join(' / ')}
                      </Typography>
                    ) : null}
                  </Box>

                  <Box sx={{display: 'grid', gap: 0.75, justifyItems: {xs: 'start', md: 'start'}}}>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65}}>
                      <Avatar sx={{width: 24, height: 24, fontSize: 10, bgcolor: row.aiGeneratedAction ? '#EEF7FF' : '#dbeafe', color: row.aiGeneratedAction ? '#0F766E' : '#1d4ed8'}}>
                        {row.aiGeneratedAction ? <SparkleIcon sx={{fontSize: 12}} /> : row.createdBy.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </Avatar>
                      <Typography sx={{fontSize: 12, color: '#334155'}}>{row.assignedTo}</Typography>
                    </Box>
                    <Typography sx={{fontSize: 11.5, color: '#7A8BA8'}}>
                      Created by {row.createdBy}
                    </Typography>
                  </Box>

                  <Typography sx={{fontSize: 12.5, color: row.overdue ? '#EF5A6F' : '#D97706', fontWeight: 800}}>
                    {row.dueDate}
                  </Typography>

                  <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, flexWrap: 'wrap', justifyContent: {xs: 'flex-start', md: 'flex-start'}}}>
                    <Chip size="small" label={getDashboardStatusKey(row)} sx={{bgcolor: `${actionDashboardStatusPalette[getDashboardStatusKey(row)]}1A`, color: actionDashboardStatusPalette[getDashboardStatusKey(row)], fontWeight: 900}} />
                    <Typography sx={{fontSize: 12.5, color: row.priority === 'High' ? '#EF4444' : row.priority === 'Medium' ? '#F59E0B' : '#16A34A', fontWeight: 900}}>
                      {row.priority}
                    </Typography>
                    {row.aiPriorityRecommended ? (
                      <Chip size="small" icon={<SparkleIcon sx={{ fontSize: '0.78rem !important', color: '#2563EB !important' }} />} label="AI" sx={{height: 19, bgcolor: '#F4F8FF', color: '#2563EB', border: '1px solid #D6E4FF', fontWeight: 800}} />
                    ) : null}
                    {row.aiGeneratedAction ? (
                      <Chip size="small" label="Created" sx={{height: 19, bgcolor: '#ECFDF5', color: '#0F766E', border: '1px solid #A7F3D0', fontWeight: 800}} />
                    ) : null}
                  </Box>
                </Box>
              </Paper>
            ))}
            {!attentionRows.length ? (
              <Typography sx={{py: 2.5, textAlign: 'center', color: '#6B7A90', fontSize: 13}}>
                No actions match the current dashboard filters.
              </Typography>
            ) : null}
          </Box>
        </DashboardPanel>
      </Box>
    </Box>
  );
}

function DashboardPanel({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Paper elevation={0} sx={{p: 1.7, borderRadius: '12px', border: `1px solid ${actionDashboardPanelBorder}`, bgcolor: 'background.paper', boxShadow: 'none'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1.2, alignItems: 'flex-start', mb: 1.25}}>
        <Box>
          <Typography sx={{fontSize: 14, fontWeight: 500, color: tokenText.primary}}>
            {title}
          </Typography>
          <Typography sx={{fontSize: 12, color: tokenText.secondary, mt: 0.35}}>
            {subtitle}
          </Typography>
        </Box>
        {actions ? (
          <Box sx={{flexShrink: 0, pt: 0.15}}>
            {actions}
          </Box>
        ) : null}
      </Box>
      {children}
    </Paper>
  );
}

function DashboardChartSurface({
  label,
  detail,
  height,
  children,
  action,
}: {
  label: string;
  detail: string;
  height: number;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Box sx={{p: 1.05, borderRadius: '12px', border: `1px solid ${actionDashboardSoftBorder}`, bgcolor: actionDashboardPanelBackground, boxShadow: 'none'}}>
      <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap'}}>
        <Box>
          <Typography sx={{fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', color: tokenText.secondary, fontWeight: 700}}>
            {label}
          </Typography>
          <Typography sx={{fontSize: 14, color: tokenText.primary, fontWeight: 400, mt: 0.28}}>
            {detail}
          </Typography>
        </Box>
        {action ?? <Chip size="small" label="Interactive" sx={actionDashboardSectionChipSx} />}
      </Box>
      <Box sx={{height, mt: 1.15}}>
        {children}
      </Box>
    </Box>
  );
}

function DashboardChartTooltip({active, payload, label}: {active?: boolean; payload?: Array<{name?: string; value?: number | string; color?: string; payload?: Record<string, unknown>}>; label?: string}) {
  if (!active || !payload?.length) return null;

  return (
    <Paper elevation={0} sx={{minWidth: 164, px: 1.1, py: 0.9, borderRadius: '8px', border: `1px solid ${actionDashboardSoftBorder}`, bgcolor: 'background.paper', boxShadow: '0 4px 10px rgba(0,31,155,0.12)'}}>
      {label ? (
        <Typography sx={{fontSize: 11, color: tokenText.secondary, fontWeight: 700, mb: 0.55}}>
          {label}
        </Typography>
      ) : null}
      <Box sx={{display: 'grid', gap: 0.45}}>
        {payload.map((entry) => (
          <Box key={`${entry.name}-${entry.value}`} sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0}}>
              <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color ?? '#2156C9', flexShrink: 0}} />
              <Typography sx={{fontSize: 11.5, color: tokenText.primary, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {entry.name}
              </Typography>
            </Box>
            <Typography sx={{fontSize: 11.5, color: tokenText.primary, fontWeight: 700}}>
              {entry.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function DashboardSelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  allLabel,
  action,
}: {
  label: string;
  value: T | '';
  onChange: (value: T | '') => void;
  options: Array<{label: string; value: T}>;
  allLabel?: string;
  action?: React.ReactNode;
}) {
  if (action) {
    return (
      <Box sx={{display: 'grid', width: '100%', minWidth: 0}}>
        {action}
      </Box>
    );
  }

  return (
    <TextField
      select
      size="small"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value as T | '')}
      sx={{
        width: '100%',
        minWidth: 0,
        '& .MuiInputBase-root': {
          height: 34,
          minHeight: 34,
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'none',
        },
        '& .MuiInputBase-input': {
          py: 0.7,
          fontSize: '0.875rem',
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.75rem',
          lineHeight: 1,
          fontWeight: 400,
          color: tokenText.secondary,
          maxWidth: 'calc(100% - 28px)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: actionDashboardPanelBorder,
        },
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: tokenBrand.main,
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: tokenBrand.main,
          borderWidth: 2,
        },
      }}
    >
      <MenuItem value="">{allLabel ?? 'All'}</MenuItem>
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

function DashboardDateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <TextField
      type="date"
      size="small"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      InputLabelProps={{shrink: true}}
      sx={{
        width: {xs: '100%', sm: 116},
        flex: {xs: '1 1 100%', sm: '0 0 auto'},
        '& .MuiInputBase-root': {
          height: 34,
          minHeight: 34,
          borderRadius: '8px',
          bgcolor: 'background.paper',
          boxShadow: 'none',
        },
        '& .MuiInputBase-input': {
          py: 0.7,
          fontSize: '0.875rem',
        },
        '& .MuiInputLabel-root': {
          fontSize: '0.75rem',
          lineHeight: 1,
          fontWeight: 400,
          color: tokenText.secondary,
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: actionDashboardPanelBorder,
        },
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: tokenBrand.main,
        },
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: tokenBrand.main,
          borderWidth: 2,
        },
      }}
    />
  );
}

function renderTableCell(columnId: (typeof actionTrackerTableColumns)[number]['id'], row: ActionTrackerDisplayRow) {
  const compactBodySx = {fontSize: {xs: '0.68rem', md: '0.72rem', xl: '0.875rem'}};
  if (columnId === 'id') return <Typography variant="body2" sx={compactBodySx}>{row.id}</Typography>;
  if (columnId === 'creationDate') return <Typography variant="body2" sx={compactBodySx}>{row.creationDate}</Typography>;
  if (columnId === 'source') {
    const tone = getActionSourceTone(row.source);
    return (
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.35}}>
        <Chip
          size="small"
          label={row.source}
          sx={{
            height: 22,
            bgcolor: tone.bg,
            color: tone.color,
            border: `1px solid ${tone.border}`,
            fontWeight: 800,
            '& .MuiChip-label': {px: 0.8},
          }}
        />
        {row.aiGeneratedAction ? (
          <Chip
            size="small"
            icon={<SparkleIcon sx={{ fontSize: '0.78rem !important', color: '#2563EB !important' }} />}
            label="AI Created"
            sx={{height: 19, bgcolor: '#F4F8FF', color: '#2563EB', border: '1px solid #D6E4FF', fontWeight: 800, '& .MuiChip-label': {px: 0.65}}}
          />
        ) : null}
      </Box>
    );
  }
  if (columnId === 'title') {
    const tone = getActionSourceTone(row.source);
    return (
      <Box sx={{minWidth: 0}}>
        <Typography variant="body2" sx={{...compactBodySx, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: row.aiPriorityRecommended ? 800 : 500}}>
          {row.title}
        </Typography>
        {row.originRecordLabel ? (
          <Typography variant="caption" sx={{display: 'block', color: '#64748B', lineHeight: 1.2, mt: 0.22}}>
            Linked to {row.originRecordLabel}
          </Typography>
        ) : null}
        {row.aiPriorityRecommended ? (
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, mt: 0.2}}>
            <SparkleIcon sx={{fontSize: 12, color: '#2563EB'}} />
            <Typography variant="caption" sx={{color: '#2563EB', fontWeight: 700, lineHeight: 1.15}}>
              Prioritized by BLU.AI
            </Typography>
          </Box>
        ) : null}
        {row.aiGeneratedAction ? (
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, mt: 0.2}}>
            <SparkleIcon sx={{fontSize: 12, color: '#0F766E'}} />
            <Typography variant="caption" sx={{color: '#0F766E', fontWeight: 700, lineHeight: 1.15}}>
              Created by BLU.AI from live plant risk signals
            </Typography>
          </Box>
        ) : null}
      </Box>
    );
  }
  if (columnId === 'type') return <Typography variant="body2" sx={compactBodySx}>{row.type}</Typography>;
  if (columnId === 'category') return <Chip size="small" label={row.category} sx={{width: 'fit-content', bgcolor: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', fontWeight: 800, '& .MuiChip-label': {fontSize: {xs: '0.62rem', md: '0.66rem', xl: '0.8125rem'}}}} />;
  if (columnId === 'plant') return <Typography variant="body2" sx={compactBodySx}>{row.scopePlant || '—'}</Typography>;
  if (columnId === 'area') return <Typography variant="body2" sx={compactBodySx}>{row.scopeArea || '—'}</Typography>;
  if (columnId === 'unit') return <Typography variant="body2" sx={compactBodySx}>{row.scopeUnit || '—'}</Typography>;
  if (columnId === 'line') return <Typography variant="body2" sx={compactBodySx}>{row.scopeLine || '—'}</Typography>;
  if (columnId === 'zone') return <Typography variant="body2" sx={compactBodySx}>{row.scopeZone || '—'}</Typography>;
  if (columnId === 'machine') return <Typography variant="body2" sx={compactBodySx}>{row.machine || '—'}</Typography>;
  if (columnId === 'createdBy') {
    return (
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65}}>
        <Avatar sx={{width: {xs: 18, xl: 22}, height: {xs: 18, xl: 22}, fontSize: {xs: 9, xl: 11}, bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1'}}>
          {row.aiGeneratedAction ? <SparkleIcon sx={{fontSize: {xs: 10, xl: 12}}} /> : row.createdBy.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </Avatar>
        <Typography variant="body2" sx={{...compactBodySx, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{row.createdBy}</Typography>
      </Box>
    );
  }
  if (columnId === 'assignedTo') {
    return (
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65}}>
        <Avatar sx={{width: {xs: 18, xl: 22}, height: {xs: 18, xl: 22}, fontSize: {xs: 9, xl: 11}, bgcolor: '#e5e7eb', color: '#374151'}}>
          {row.assignedTo.split(' ').map((n) => n[0]).join('').slice(0, 2)}
        </Avatar>
        <Typography variant="body2" sx={{...compactBodySx, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{row.assignedTo}</Typography>
      </Box>
    );
  }
  if (columnId === 'dueDate') return <Typography variant="body2" sx={compactBodySx}>{row.dueDate}</Typography>;
  if (columnId === 'priority') {
    return (
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.25}}>
        <Typography variant="body2" sx={{...compactBodySx, fontWeight: 800, color: row.priority === 'High' ? '#ef4444' : row.priority === 'Medium' ? '#f59e0b' : '#16a34a'}}>
          {row.priority}
        </Typography>
        {row.aiPriorityRecommended ? (
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, flexWrap: 'wrap'}}>
            <Chip
              size="small"
              icon={<SparkleIcon sx={{ fontSize: '0.78rem !important', color: '#475569 !important' }} />}
              label="AI"
              sx={{height: 19, bgcolor: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', fontWeight: 800, '& .MuiChip-label': {px: 0.65}}}
            />
            {row.aiGeneratedAction ? (
              <Chip
                size="small"
                label="Created"
                sx={{height: 19, bgcolor: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', fontWeight: 800, '& .MuiChip-label': {px: 0.65}}}
              />
            ) : null}
          </Box>
        ) : null}
      </Box>
    );
  }
  return (
    <Chip
      size="small"
      label={getVisibleActionStatus(row)}
      sx={{
        width: 'fit-content',
        bgcolor: getVisibleActionStatus(row) === 'Completed'
          ? '#dcfce7'
          : getVisibleActionStatus(row) === 'Reopened'
            ? '#FFF7E8'
          : getVisibleActionStatus(row) === 'Under Approval'
            ? '#FFF7E8'
            : getVisibleActionStatus(row) === 'Overdue'
              ? '#fee2e2'
              : getVisibleActionStatus(row) === 'Canceled'
                ? '#f3f4f6'
                : '#F8FAFC',
        color: getVisibleActionStatus(row) === 'Completed'
          ? '#15803d'
          : getVisibleActionStatus(row) === 'Reopened'
            ? '#B45309'
          : getVisibleActionStatus(row) === 'Under Approval'
            ? '#B45309'
            : getVisibleActionStatus(row) === 'Overdue'
              ? '#dc2626'
              : getVisibleActionStatus(row) === 'Canceled'
                ? '#4b5563'
                : '#334155',
        border: '1px solid',
        borderColor: getVisibleActionStatus(row) === 'Completed'
          ? '#BBF7D0'
          : getVisibleActionStatus(row) === 'Reopened'
            ? '#FCD34D'
          : getVisibleActionStatus(row) === 'Under Approval'
            ? '#FCD34D'
            : getVisibleActionStatus(row) === 'Overdue'
              ? '#FECACA'
              : '#CBD5E1',
        fontWeight: 800,
        '& .MuiChip-label': {fontSize: {xs: '0.62rem', md: '0.66rem', xl: '0.8125rem'}},
      }}
    />
  );
}
