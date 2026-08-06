import {useEffect, useMemo, useState} from 'react';
import type {MouseEvent, ReactNode} from 'react';
import {Avatar, Box, Button, ButtonBase, Chip, Dialog, IconButton, Menu, MenuItem, Paper, TextField, Typography} from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome as AutoAwesomeIcon,
  BuildCircle as BuildCircleIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  DashboardCustomizeOutlined as DashboardCustomizeOutlinedIcon,
  FilterList as FilterIcon,
  GridView as GridViewIcon,
  OpenInFull as OpenInFullIcon,
  PlayCircleFilledWhite as PlayCircleFilledWhiteIcon,
  Replay as ReplayIcon,
  ReportProblemOutlined as ReportProblemOutlinedIcon,
  Search as SearchIcon,
  SendRounded as SendRoundedIcon,
  TaskAltOutlined as TaskAltOutlinedIcon,
  ViewColumn as ViewColumnIcon,
} from '@mui/icons-material';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  actionTrackerNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';
import { useActionTrackerContext } from '../../actionTracker/contexts/ActionTrackerContext';
import type {ActionTrackerSummaryFilter} from '../../actionTracker/kpiSections';
import { useWorkstationContext } from '../contexts/WorkstationContext';
import { readEscalationTargetsForSource } from '../allworkstation/connectionPathStore';
import {
  type ActionCategory,
  type ActionPriority,
  type ActionStatus,
  type ActionTrackerItem,
  useActionTrackerItems,
} from './actionTrackerStore';
import {
  escalateWorkflowIssue,
  isWorkflowIssueVisibleForWorkstation,
  type WorkflowIssue,
  useWorkflowIssues,
} from './workflowIssueStore';

const kanbanColumns = [
  {id: 'Open', label: 'NEW', color: '#1D66F2'},
  {id: 'In Progress', label: 'IN PROGRESS', color: '#0F766E'},
  {id: 'Reopened', label: 'REOPENED', color: '#F59E0B'},
  {id: 'Under Approval', label: 'ON HOLD', color: '#090054'},
  {id: 'Completed', label: 'COMPLETED', color: '#45AD55'},
  {id: 'Overdue', label: 'OVERDUE', color: '#D40511'},
  {id: 'Canceled', label: 'FINALIZED', color: '#D9D9D9'},
] as const;

export const actionTrackerKanbanColumns = kanbanColumns;
export type ActionTrackerViewMode = 'dashboard' | 'board' | 'table';
const actionTrackerAutoOpenAiFlag = 'action-tracker-open-ai-prioritization';
export const actionTrackerTableBorderColor = '#DBDDDF';
export const actionTrackerTableCellBorderColor = '#E5EAF2';
export const actionTrackerTableHeaderBg = '#F8FAFC';
export const actionTrackerTableAltRowBg = '#F8FAFC';
export const actionTrackerTableHoverBg = '#EEF4FF';
const actionTrackerWidgetTokens = {
  primary: '#155EEF',
  primarySoft: '#EEF5FF',
  danger: '#E03131',
  dangerSoft: '#FFF2F2',
  success: '#0E8F5A',
  successSoft: '#ECFDF5',
  warning: '#C97A00',
  warningSoft: '#FFF7E6',
  border: '#D8E3F0',
  borderSoft: '#E8EEF6',
  textPrimary: '#0F1F33',
  textSecondary: '#5E718B',
  textMuted: '#8A99AD',
  surface: '#FFFFFF',
  surfaceMuted: '#F7FAFD',
  neutralStrong: '#7A8A9A',
  neutralSoft: '#F1F5F9',
  neutralBorder: '#D7E1EC',
};
export const actionTrackerTableColumns = [
  {id: 'id', label: '#', width: '64px'},
  {id: 'category', label: 'SQDCP', width: '54px'},
  {id: 'source', label: 'Source', width: 'minmax(108px, 0.82fr)'},
  {id: 'dateShift', label: 'Date / Shift', width: 'minmax(138px, 0.9fr)'},
  {id: 'problem', label: 'Problem', width: 'minmax(220px, 1.55fr)'},
  {id: 'suggestedActions', label: 'Suggested Actions', width: 'minmax(300px, 2.15fr)'},
  {id: 'due', label: 'Due Date', width: 'minmax(118px, 0.82fr)'},
  {id: 'assignedTo', label: 'Owner', width: 'minmax(150px, 1.05fr)'},
  {id: 'supportNeeded', label: 'Support Needed', width: 'minmax(152px, 1.1fr)'},
  {id: 'status', label: 'Status', width: '116px'},
] as const;
export const actionTrackerKanbanFieldOptions = [
  {id: 'problem', label: 'Problem'},
  {id: 'date', label: 'Date'},
  {id: 'shift', label: 'Shift'},
  {id: 'dueDate', label: 'Due Date'},
  {id: 'owner', label: 'Owner'},
  {id: 'supportNeeded', label: 'Support Needed'},
  {id: 'priority', label: 'Priority'},
] as const;
export type ActionTrackerKanbanField = typeof actionTrackerKanbanFieldOptions[number]['id'];
export type ActionTrackerTableColumnId = typeof actionTrackerTableColumns[number]['id'];

const statusTone: Record<ActionStatus, {bg: string; color: string}> = {
  Open: {bg: '#145FE8', color: '#FFFFFF'},
  'In Progress': {bg: '#0F766E', color: '#FFFFFF'},
  Reopened: {bg: '#F59E0B', color: '#FFFFFF'},
  'Under Approval': {bg: '#090054', color: '#FFFFFF'},
  Completed: {bg: '#43B252', color: '#FFFFFF'},
  Overdue: {bg: '#D40511', color: '#FFFFFF'},
  Canceled: {bg: '#E6E7EA', color: '#555D68'},
};

export const categoryFilterOrder: ActionCategory[] = ['SAFETY', 'QUALITY', 'DELIVERY', 'COST', 'PEOPLE'];
const defaultActiveCategories: ActionCategory[] = categoryFilterOrder;

const categoryFilterTone: Record<ActionCategory, {label: string; letter: string; color: string; ring: string; tint: string; glow: string}> = {
  SAFETY: {label: 'Safety', letter: 'S', color: '#42AF4B', ring: 'rgba(66, 175, 75, 0.16)', tint: '#F4FBF5', glow: 'rgba(66, 175, 75, 0.10)'},
  QUALITY: {label: 'Quality', letter: 'Q', color: '#E43B46', ring: 'rgba(228, 59, 70, 0.18)', tint: '#FFF3F4', glow: 'rgba(228, 59, 70, 0.12)'},
  DELIVERY: {label: 'Delivery', letter: 'D', color: '#42AF4B', ring: 'rgba(66, 175, 75, 0.16)', tint: '#F4FBF5', glow: 'rgba(66, 175, 75, 0.10)'},
  COST: {label: 'Cost', letter: 'C', color: '#42AF4B', ring: 'rgba(66, 175, 75, 0.16)', tint: '#F4FBF5', glow: 'rgba(66, 175, 75, 0.10)'},
  PEOPLE: {label: 'People', letter: 'P', color: '#42AF4B', ring: 'rgba(66, 175, 75, 0.16)', tint: '#F4FBF5', glow: 'rgba(66, 175, 75, 0.10)'},
};

type MyActionTrackerWidgetProps = {
  defaultIssueView?: IssueWidgetView;
  onExpand?: (viewMode: ActionTrackerViewMode) => void;
  onViewModeChange?: (viewMode: ActionTrackerViewMode) => void;
  viewMode?: ActionTrackerViewMode;
};

type IssueWidgetView = 'openIssues' | 'actionTracker';
type IssueBoardState = 'Open' | 'Delayed' | 'Escalated';
type IssueBoardItem = {
  id: string;
  category: ActionCategory;
  title: string;
  detail: string;
  owner?: string;
  time?: string;
  priority: ActionPriority;
  state: IssueBoardState;
  highlighted?: boolean;
  filled?: boolean;
  flashing?: boolean;
  escalatedFrom?: string;
  escalationFlashing?: boolean;
  actionItem?: ActionTrackerItem;
  originTag?: string;
  workflowIssue?: WorkflowIssue;
  workflowHighlight?: 'outline' | 'solid';
};

function getPriorityTone(priority: ActionPriority) {
  if (priority === 'High') return '#FF4038';
  if (priority === 'Medium') return '#FF9D00';
  return '#34C759';
}

function buildIssueActionSuggestionSeed(issue: IssueBoardItem) {
  if (issue.id === ncRaisedThisMorningIssue.id) {
    return {
      title: 'Contain Line 3 sealing defect NC',
      problem: 'The NC came from Line 3 after a sealing defect was found on Batch B20260412-10. Two lots are already on hold, quality still needs the confirmed owner, and operations should bring containment status, suspected root cause, output impact, and immediate verification checks into Tier 1.',
      category: 'QUALITY',
      machine: 'Packaging 2',
      priority: 'High',
      assignedTo: 'Madison Brooks',
      dueDate: 'May 20, 2026',
      line: 'Line 3',
      area: 'Packaging Line',
      type: 'Corrective',
      reviewer: 'Ethan Walker',
      approver: 'Madison Brooks',
    };
  }

  return {
    title: issue.title,
    problem: issue.detail,
    category: issue.category,
    machine: 'Assembly 1',
    priority: issue.priority,
    assignedTo: issue.owner ?? 'James Miller',
    dueDate: 'May 20, 2026',
    line: 'Line 3',
    area: 'Packaging Line',
    type: 'Corrective',
    reviewer: 'Ethan Walker',
    approver: 'Madison Brooks',
  };
}

const openIssueRows: IssueBoardItem[] = [
  {
    id: 'OI-001',
    category: 'SAFETY',
    title: 'Conveyor Guard Loose',
    detail: 'Two operators from Line 3 in Sick...',
    owner: 'Ronie D elano',
    time: '08:42 AM',
    priority: 'High',
    state: 'Open',
  },
  {
    id: 'OI-002',
    category: 'QUALITY',
    title: 'Particulate Contamination',
    detail: 'During routine quality inspection on...',
    owner: 'Maria Pinna',
    time: '08:42 AM',
    priority: 'High',
    state: 'Escalated',
    highlighted: true,
  },
  {
    id: 'OI-003',
    category: 'QUALITY',
    title: 'Varition in Batch #902',
    detail: 'Color variance detected in the last ...',
    owner: 'Carlos Mendez',
    time: '08:42 AM',
    priority: 'Medium',
    state: 'Open',
  },
  {
    id: 'OI-004',
    category: 'DELIVERY',
    title: 'Operator Absence',
    detail: 'Two operators from Line 3 in Sick...',
    owner: 'John Joshua',
    time: '08:42 AM',
    priority: 'High',
    state: 'Open',
  },
  {
    id: 'OI-005',
    category: 'COST',
    title: 'Scrap Increase on Line 4',
    detail: 'High scrap rate detected on Line 4 dur...',
    owner: 'Maria Pinna',
    time: '08:20 AM',
    priority: 'Medium',
    state: 'Open',
  },
];

function normalizeTierTitle(value: string) {
  const match = value.match(/tier\s*([123])/i);
  return match ? `Tier ${match[1]}` : value;
}

function buildWorkflowIssueFromOpenIssue(issue: IssueBoardItem, activeWorkstationTitle: string): WorkflowIssue {
  const sourceTitle = normalizeTierTitle(activeWorkstationTitle);

  return {
    id: issue.id,
    category: issue.category,
    createdAt: 'Mar 16, 2026',
    creator: issue.owner?.trim() || 'Madison',
    detail: issue.detail,
    highlight: 'solid',
    line: 'Line 1',
    area: 'Assembly Line',
    priority: issue.priority,
    sourceWorkstationTitle: sourceTitle,
    state: 'Open',
    targetWorkstationTitle: sourceTitle,
    title: issue.title,
  };
}

type OperationalActionFilters = {
  category: ActionCategory | '';
  dateFrom: string;
  dateTo: string;
  owner: string;
  priority: ActionPriority | '';
  search: string;
  status: ActionStatus | '';
};
type ActionTrackerWidgetSummaryFilter = 'all' | 'pendingMyAction' | 'pendingApprovals' | 'overdue';

function parseActionDate(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
}

function getOperationalStatus(item: ActionTrackerItem): ActionStatus {
  if (
    item.status === 'Completed'
    || item.status === 'Canceled'
    || item.status === 'Reopened'
    || item.status === 'In Progress'
    || item.status === 'Under Approval'
  ) {
    return item.status;
  }

  const dueAt = parseActionDate(item.dueDate);
  const now = new Date('2026-06-10T00:00:00').getTime();
  return dueAt !== null && dueAt < now ? 'Overdue' : item.status;
}

function isDueSoon(item: ActionTrackerItem) {
  const dueAt = parseActionDate(item.dueDate);
  if (dueAt === null) return false;
  const now = new Date('2026-06-10T00:00:00').getTime();
  const threeDays = 3 * 24 * 60 * 60 * 1000;
  return dueAt >= now && dueAt - now <= threeDays;
}

function actionMatchesFilters(item: ActionTrackerItem, filters: OperationalActionFilters) {
  const operationalStatus = getOperationalStatus(item);
  const search = filters.search.trim().toLowerCase();
  const dueAt = parseActionDate(item.dueDate);
  const fromAt = filters.dateFrom ? parseActionDate(filters.dateFrom) : null;
  const toAt = filters.dateTo ? parseActionDate(filters.dateTo) : null;

  return (
    (!search
      || item.id.toLowerCase().includes(search)
      || item.title.toLowerCase().includes(search)
      || item.problem.toLowerCase().includes(search)
      || item.assignedTo.toLowerCase().includes(search)
      || item.source.toLowerCase().includes(search))
    && (!filters.status || operationalStatus === filters.status)
    && (!filters.category || item.category === filters.category)
    && (!filters.priority || item.priority === filters.priority)
    && (!filters.owner || item.assignedTo === filters.owner)
    && (!fromAt || (dueAt !== null && dueAt >= fromAt))
    && (!toAt || (dueAt !== null && dueAt <= toAt))
  );
}

function getNeedsAttentionScore(item: ActionTrackerItem) {
  const status = getOperationalStatus(item);
  if (status === 'Overdue') return 0;
  if (status === 'Reopened') return 1;
  if (item.priority === 'High') return 2;
  if ((item.dueDateExtensionCount ?? 0) > 0) return 3;
  if ((item.reassignmentCount ?? 0) > 0) return 4;
  if (isDueSoon(item)) return 5;
  return 6;
}

function sortByOperationalPriority(left: ActionTrackerItem, right: ActionTrackerItem) {
  const scoreDiff = getNeedsAttentionScore(left) - getNeedsAttentionScore(right);
  if (scoreDiff !== 0) return scoreDiff;
  const leftDueAt = parseActionDate(left.dueDate) ?? Number.MAX_SAFE_INTEGER;
  const rightDueAt = parseActionDate(right.dueDate) ?? Number.MAX_SAFE_INTEGER;
  return leftDueAt - rightDueAt;
}

function getWidgetAttentionScore(item: ActionTrackerItem, currentUserName: string) {
  const status = getOperationalStatus(item);
  if (status === 'Overdue') return 0;
  if (item.priority === 'High') return 1;
  if (status === 'Under Approval') return 2;
  if (status === 'Reopened') return 3;
  return 4;
}

function sortByWidgetAttention(left: ActionTrackerItem, right: ActionTrackerItem, currentUserName: string) {
  const scoreDiff = getWidgetAttentionScore(left, currentUserName) - getWidgetAttentionScore(right, currentUserName);
  if (scoreDiff !== 0) return scoreDiff;
  return sortByOperationalPriority(left, right);
}

function getCategoryTone(category: ActionCategory) {
  return categoryFilterTone[category] ?? categoryFilterTone.PEOPLE;
}

function getOperationalStatusTone(status: ActionStatus) {
  if (status === 'Completed') return {bg: actionTrackerWidgetTokens.successSoft, color: actionTrackerWidgetTokens.success, border: '#CFEFDF'};
  if (status === 'Overdue') return {bg: actionTrackerWidgetTokens.dangerSoft, color: actionTrackerWidgetTokens.danger, border: '#F4CACA'};
  if (status === 'In Progress') return {bg: '#ECFDF5', color: '#0F766E', border: '#A7F3D0'};
  if (status === 'Reopened') return {bg: '#F5F8FC', color: actionTrackerWidgetTokens.textSecondary, border: actionTrackerWidgetTokens.borderSoft};
  if (status === 'Under Approval') return {bg: actionTrackerWidgetTokens.warningSoft, color: actionTrackerWidgetTokens.warning, border: '#F1DDAD'};
  if (status === 'Canceled') return {bg: '#F7FAFD', color: actionTrackerWidgetTokens.textMuted, border: actionTrackerWidgetTokens.borderSoft};
  return {bg: actionTrackerWidgetTokens.primarySoft, color: actionTrackerWidgetTokens.primary, border: '#CFE0FF'};
}

function getPriorityPillTone(priority: ActionPriority) {
  if (priority === 'High') return {bg: '#FFF5F5', color: actionTrackerWidgetTokens.danger, border: '#F6D6D6'};
  if (priority === 'Medium') return {bg: '#FFF9EE', color: actionTrackerWidgetTokens.warning, border: '#F1E2BC'};
  return {bg: '#F6FBF8', color: actionTrackerWidgetTokens.success, border: '#D7ECDD'};
}

function formatCategoryLabel(category: ActionCategory) {
  return getCategoryTone(category).label;
}

function formatStatusLabel(status: ActionStatus | 'In Progress') {
  return status;
}

function buildAiSummary(items: ActionTrackerItem[]) {
  if (!items.length) {
    return 'No actions match the current filters.';
  }

  const overdue = items.filter((item) => getOperationalStatus(item) === 'Overdue').length;
  const inProgress = items.filter((item) => getOperationalStatus(item) === 'In Progress').length;
  const highPriority = items.filter((item) => item.priority === 'High').length;

  const parts = [
    `${items.length} actions in view`,
    overdue ? `${overdue} overdue` : null,
    inProgress ? `${inProgress} in progress` : null,
    highPriority ? `${highPriority} high priority` : null,
  ].filter(Boolean);

  return `${parts.join(', ')}.`;
}

const ncRaisedThisMorningIssue: IssueBoardItem = {
  id: 'OI-NC-001',
  category: 'QUALITY',
  title: 'NC: Line 3 sealing defect',
  detail: 'Batch B20260412-10, two lots on hold',
  owner: 'Quality',
  time: 'This morning',
  priority: 'High',
  state: 'Open',
  highlighted: true,
  flashing: true,
};

export default function MyActionTrackerWidget({defaultIssueView = 'actionTracker', onExpand, onViewModeChange, viewMode: controlledViewMode}: MyActionTrackerWidgetProps) {
  const [uncontrolledViewMode, setUncontrolledViewMode] = useState<ActionTrackerViewMode>(controlledViewMode ?? 'table');
  const [issueWidgetView, setIssueWidgetView] = useState<IssueWidgetView>(defaultIssueView);
  const [selectedOpenIssue, setSelectedOpenIssue] = useState<IssueBoardItem | null>(null);
  const [filterAnchor, setFilterAnchor] = useState<HTMLElement | null>(null);
  const [operationalFilters, setOperationalFilters] = useState<OperationalActionFilters>({
    category: '',
    dateFrom: '',
    dateTo: '',
    owner: '',
    priority: '',
    search: '',
    status: '',
  });
  const [isAiPrioritizing, setIsAiPrioritizing] = useState(false);
  const [isWidgetAiPromptDismissed, setIsWidgetAiPromptDismissed] = useState(false);
  const [activeWidgetSummaryFilter, setActiveWidgetSummaryFilter] = useState<ActionTrackerWidgetSummaryFilter>('all');
  const activeCategories = defaultActiveCategories;
  const {
    currentUserName,
    openActionTrackerScreen,
    setActionCreateSuggestionSeed,
    setIsActionCreateDrawerOpen,
    setSelectedActionTrackerItem,
  } = useActionTrackerContext();
  const {
    activePredefinedWorkstationTitle,
    activeWorkstationId,
    activeTier1NcIssueEscalated,
    activeTier1NcIssueEscalationTarget,
    activeTier1NcIssueSeed,
    openPredefinedWorkstation,
    setActiveTier1NcIssueEscalated,
    setActiveTier1NcIssueEscalationTarget,
  } = useWorkstationContext();
  const notifications = useWidgetNotifications(actionTrackerNotificationConfig);
  const {items} = useActionTrackerItems();
  const workflowIssues = useWorkflowIssues();
  const viewMode = controlledViewMode ?? uncontrolledViewMode;
  const shouldShowNcRaisedIssue = activePredefinedWorkstationTitle === 'Tier 1' && activeTier1NcIssueSeed;
  const shouldShowEscalatedNcIssue = Boolean(
    activeTier1NcIssueEscalated
    && activeTier1NcIssueEscalationTarget
    && activePredefinedWorkstationTitle === activeTier1NcIssueEscalationTarget,
  );

  useEffect(() => {
    if (controlledViewMode) {
      setUncontrolledViewMode(controlledViewMode);
    }
  }, [controlledViewMode]);

  useEffect(() => {
    setIssueWidgetView(defaultIssueView);
  }, [defaultIssueView]);

  useEffect(() => {
    if (shouldShowNcRaisedIssue || shouldShowEscalatedNcIssue) {
      setIssueWidgetView('openIssues');
    }
  }, [shouldShowEscalatedNcIssue, shouldShowNcRaisedIssue]);

  const handleViewModeChange = (nextViewMode: ActionTrackerViewMode) => {
    if (!controlledViewMode) {
      setUncontrolledViewMode(nextViewMode);
    }
    onViewModeChange?.(nextViewMode);
  };

  const filteredOperationalItems = useMemo(
    () => items.filter((item) => actionMatchesFilters(item, operationalFilters)),
    [items, operationalFilters],
  );
  const ownerOptions = useMemo(
    () => Array.from(new Set(items.map((item) => item.assignedTo))).sort(),
    [items],
  );
  const filteredWidgetRows = useMemo(() => {
    const activeItems = filteredOperationalItems.filter((item) => item.status !== 'Completed' && item.status !== 'Canceled');

    if (activeWidgetSummaryFilter === 'pendingMyAction') {
      return activeItems.filter((item) => (
        item.status === 'Under Approval'
          ? item.approver === currentUserName
          : item.assignedTo === currentUserName && (item.status === 'Open' || item.status === 'In Progress' || item.status === 'Reopened')
      ));
    }

    if (activeWidgetSummaryFilter === 'pendingApprovals') {
      return activeItems.filter((item) => item.status === 'Under Approval');
    }

    if (activeWidgetSummaryFilter === 'overdue') {
      return activeItems.filter((item) => getOperationalStatus(item) === 'Overdue');
    }

    return activeItems;
  }, [activeWidgetSummaryFilter, currentUserName, filteredOperationalItems]);
  const needsAttentionRows = useMemo(
    () => filteredWidgetRows
      .slice()
      .sort((left, right) => sortByWidgetAttention(left, right, currentUserName))
      .slice(0, 5),
    [currentUserName, filteredWidgetRows],
  );
  const widgetSummaryCards = useMemo(() => ([
    {id: 'all', label: 'All Actions', value: filteredOperationalItems.length, emphasis: 'primary' as const},
    {id: 'overdue', label: 'Overdue', value: filteredOperationalItems.filter((item) => getOperationalStatus(item) === 'Overdue').length, emphasis: 'danger' as const},
    {id: 'pendingApprovals', label: 'Pending Approvals', value: filteredOperationalItems.filter((item) => item.status === 'Under Approval').length, emphasis: 'default' as const},
    {id: 'pendingMyAction', label: 'Pending My Action', value: filteredOperationalItems.filter((item) => (item.status === 'Under Approval' ? item.approver === currentUserName : item.assignedTo === currentUserName && (item.status === 'Open' || item.status === 'In Progress' || item.status === 'Reopened'))).length, emphasis: 'default' as const},
  ]), [currentUserName, filteredOperationalItems]);
  const widgetStatusOverview = useMemo(() => ([
    {label: 'Open', value: filteredOperationalItems.filter((item) => getOperationalStatus(item) === 'Open').length, color: '#8CA8D8'},
    {label: 'In Progress', value: filteredOperationalItems.filter((item) => item.status === 'In Progress').length, color: '#0F766E'},
    {label: 'Under Approval', value: filteredOperationalItems.filter((item) => item.status === 'Under Approval').length, color: '#090054'},
    {label: 'Completed', value: filteredOperationalItems.filter((item) => item.status === 'Completed').length, color: '#C8D7E8'},
    {label: 'Overdue', value: filteredOperationalItems.filter((item) => getOperationalStatus(item) === 'Overdue').length, color: actionTrackerWidgetTokens.danger},
    {label: 'Reopened', value: filteredOperationalItems.filter((item) => item.status === 'Reopened').length, color: '#D6DEEA'},
  ]), [filteredOperationalItems]);

  const runWidgetAiPrioritization = () => {
    setIsAiPrioritizing(true);
    window.sessionStorage.setItem(actionTrackerAutoOpenAiFlag, 'true');
    window.setTimeout(() => {
      setIsAiPrioritizing(false);
      openActionTrackerScreen({view: 'table'});
    }, 350);
  };

  const handleWidgetSummaryNavigation = (filterId: ActionTrackerWidgetSummaryFilter) => {
    setActiveWidgetSummaryFilter(filterId);
    openActionTrackerScreen({view: 'table', summaryFilter: filterId === 'all' ? null : filterId as ActionTrackerSummaryFilter});
  };

  const actionTrackerBoardRows = useMemo<IssueBoardItem[]>(() => (
    items.map((item) => ({
      id: item.id,
      category: item.category,
      title: item.title,
      detail: item.problem,
      priority: item.priority,
      state: (item.status as string) === 'Under Review' || item.status === 'Under Approval'
        ? 'Delayed'
        : item.status === 'Canceled'
          ? 'Escalated'
          : 'Open',
      highlighted: item.priority === 'High' && item.status !== 'Completed' && item.status !== 'Canceled',
      filled: item.status === 'Canceled',
      actionItem: item,
    }))
  ), [items]);
  const activeWorkstationTitle = activePredefinedWorkstationTitle ?? activeWorkstationId ?? 'Tier 1';
  const workflowBoardRows = useMemo<IssueBoardItem[]>(() => (
    workflowIssues
      .filter((issue) => isWorkflowIssueVisibleForWorkstation(issue, activeWorkstationTitle))
      .map((issue) => ({
        id: issue.id,
        category: issue.category,
        title: issue.title,
        detail: issue.detail,
        owner: issue.creator,
        time: '09:21 AM',
        priority: issue.priority,
        state: issue.state,
        highlighted: true,
        originTag: issue.originTag,
        workflowHighlight: issue.highlight,
        workflowIssue: issue,
      }))
  ), [activeWorkstationTitle, workflowIssues]);
  const boardRows = issueWidgetView === 'openIssues'
    ? [
        ...(shouldShowNcRaisedIssue ? [ncRaisedThisMorningIssue] : []),
        ...(shouldShowEscalatedNcIssue ? [{...ncRaisedThisMorningIssue, escalatedFrom: 'Tier 1', escalationFlashing: true, flashing: false}] : []),
        ...workflowBoardRows,
        ...openIssueRows,
      ]
    : actionTrackerBoardRows;
  const trackerDisplayMode: 'board' | 'table' = viewMode === 'table' ? 'table' : 'board';

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        p: 1.25,
        borderRadius: 1.6,
        bgcolor: '#FFFFFF',
        border: '1px solid #D5DADF',
        boxShadow: 'none',
        overflow: 'hidden',
        containerType: 'inline-size',
      }}
    >
      <Box sx={{display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) 14px', gap: 0.75, height: '100%', minHeight: 0}}>
        <ReferenceTrackerToolbar
          activeCategories={activeCategories}
          issueWidgetView={issueWidgetView}
          onExpand={() => onExpand?.(trackerDisplayMode)}
          onFilterClick={(event) => setFilterAnchor(event.currentTarget)}
          onModeChange={handleViewModeChange}
          onSearchChange={(value) => setOperationalFilters((current) => ({...current, search: value}))}
          onViewChange={setIssueWidgetView}
          searchValue={operationalFilters.search}
          viewMode={trackerDisplayMode}
        />

        {issueWidgetView === 'actionTracker' && trackerDisplayMode === 'board' ? (
          <ReferenceActionTrackerBoard />
        ) : null}
        {issueWidgetView === 'actionTracker' && trackerDisplayMode === 'table' ? (
          <ReferenceActionTrackerTable />
        ) : null}
        {issueWidgetView === 'openIssues' && trackerDisplayMode === 'board' ? (
          <ReferenceOpenIssuesBoard />
        ) : null}
        {issueWidgetView === 'openIssues' && trackerDisplayMode === 'table' ? (
          <ReferenceOpenIssuesTable />
        ) : null}

        <IssueBoardLegend />
      </Box>
      <OpenIssueDetailsDialog
        activeWorkstationTitle={activeWorkstationTitle}
        issue={selectedOpenIssue}
        onClose={() => setSelectedOpenIssue(null)}
        onCreateAction={(issue) => {
          setSelectedOpenIssue(null);
          setActionCreateSuggestionSeed(buildIssueActionSuggestionSeed(issue));
          setIsActionCreateDrawerOpen(true);
        }}
        onEscalate={(issue, target) => {
          setSelectedOpenIssue(null);
          if (issue.id === ncRaisedThisMorningIssue.id || issue.escalatedFrom) {
            setActiveTier1NcIssueEscalated(true);
            setActiveTier1NcIssueEscalationTarget(target);
            openPredefinedWorkstation(target);
            return;
          }
          escalateWorkflowIssue(
            issue.workflowIssue ?? buildWorkflowIssueFromOpenIssue(issue, activeWorkstationTitle),
            target,
          );
        }}
        onEscalated={() => setSelectedOpenIssue(null)}
      />
      <WidgetNotificationsDialog
        active={notifications.active}
        config={actionTrackerNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
      <ActionTrackerWidgetFiltersMenu
        anchorEl={filterAnchor}
        filters={operationalFilters}
        onClose={() => setFilterAnchor(null)}
        onFiltersChange={setOperationalFilters}
        ownerOptions={ownerOptions}
      />
    </Paper>
  );
}

type ReferenceCardItem = {
  accent: string;
  category: ActionCategory;
  date?: string;
  detail?: string;
  owner: string;
  title: string;
};

type ReferenceBoardColumn = {
  cards: ReferenceCardItem[];
  count: number;
  extra?: string;
  title: string;
};

type ReferenceStatusTone = 'blue' | 'green' | 'orange' | 'gray';

type ReferenceTableRow = {
  id: string;
  owner: string;
  status: string;
  statusTone: ReferenceStatusTone;
  suggestedActions?: string;
  support?: string;
  title: string;
  dueDate?: string;
};

const referenceActionTrackerColumns: ReferenceBoardColumn[] = [
  {
    title: 'Open',
    count: 11,
    extra: '+9',
    cards: [
      {title: 'Conduct staff training on compliance and SOP adherence', owner: 'Carlos Mendez', date: 'Mar 16, 2026', category: 'SAFETY', accent: '#FF8A00'},
      {title: 'Visual inspection reveals defects in painted surfaces', owner: "Ronie D'elano", date: 'Mar 16, 2026', category: 'SAFETY', accent: '#FF8A00'},
    ],
  },
  {
    title: 'Under Approval',
    count: 2,
    cards: [
      {title: 'Component alignment out of specification noted in recent insp...', owner: 'Maria Pinna', date: 'Mar 16, 2026', category: 'DELIVERY', accent: '#EF373D'},
      {title: 'Discrepancies in devices dimension calibration', owner: 'John Joshua', date: 'Mar 16, 2026', category: 'PEOPLE', accent: '#EF373D'},
    ],
  },
  {
    title: 'Completed',
    count: 13,
    extra: '+11',
    cards: [
      {title: 'Hydraulic press leak detected during routine inspection', owner: "Ronie D'elano", date: 'Mar 16, 2026', category: 'COST', accent: '#FF8A00'},
      {title: 'Surface imperfections recorded on batch #4521', owner: 'Carlos Mendez', date: 'Mar 16, 2026', category: 'SAFETY', accent: '#4DB66A'},
    ],
  },
  {
    title: 'Overdue',
    count: 3,
    extra: '+1',
    cards: [
      {title: 'Noise levels higher than acceptable thresholds in the Unit', owner: 'Maria Pinna', date: 'Mar 16, 2026', category: 'DELIVERY', accent: '#EF373D'},
      {title: 'Dimensional drift every morning on CNC Station 44', owner: "Ronie D'elano", date: 'Mar 16, 2026', category: 'QUALITY', accent: '#4DB66A'},
    ],
  },
  {
    title: 'Canceled',
    count: 1,
    cards: [
      {title: 'Calibration discrepancies found in measurement devices', owner: "Ronie D'elano", date: 'Mar 16, 2026', category: 'SAFETY', accent: '#4DB66A'},
    ],
  },
];

const referenceOpenIssueColumns: ReferenceBoardColumn[] = [
  {
    title: 'Open',
    count: 19,
    extra: '+17',
    cards: [
      {title: 'Conveyor Guard Loose', detail: 'Two operators from Line 3 are on sick leave, creating a staffing g...', owner: 'Carlos Mendez', date: 'Mar 16, 2026', category: 'SAFETY', accent: '#FF8A00'},
      {title: 'Particulate Contamination', detail: 'During a routine quality inspection on Syringe Line 2, dimensiona...', owner: "Ronie D'elano", date: 'Mar 16, 2026', category: 'PEOPLE', accent: '#4DB66A'},
    ],
  },
  {
    title: 'In Progress',
    count: 2,
    extra: '+17',
    cards: [
      {title: 'Variation in Batch #902', detail: 'Color variance was detected in the last production batch, and aff...', owner: 'Carlos Mendez', date: 'Mar 16, 2026', category: 'DELIVERY', accent: '#EF373D'},
      {title: 'Operator Absence', detail: 'Two operators from Line 3 are on sick leave, requiring temporary...', owner: "Ronie D'elano", date: 'Mar 16, 2026', category: 'COST', accent: '#4DB66A'},
    ],
  },
  {
    title: 'Closed',
    count: 16,
    extra: '+12',
    cards: [
      {title: 'Scrap Increase on Line 4', detail: 'High scrap rate detected on Line 4 during the current shift, primar...', owner: "Ronie D'elano", date: 'Mar 16, 2026', category: 'SAFETY', accent: '#EF373D'},
      {title: 'Particulate Contamination', detail: 'During a routine quality inspection on Adapter Conveyor Line 1, a...', owner: 'Carlos Mendez', date: 'Mar 16, 2026', category: 'QUALITY', accent: '#FF8A00'},
    ],
  },
];

const referenceActionRows: ReferenceTableRow[] = [
  {id: 'A8932002', title: 'Conduct staff training on compliance and SOP adherence', suggestedActions: 'Belt Replace', owner: 'James Miller', dueDate: 'Mar 16, 2026', support: 'No', status: 'UNDER REVIEW', statusTone: 'orange'},
  {id: 'A8932003', title: 'Review and update quality control procedures', suggestedActions: 'Belt Replace', owner: 'Olivia Martin', dueDate: 'Mar 16, 2026', support: 'No', status: 'COMPLETED', statusTone: 'green'},
  {id: 'A8932004', title: 'Initiate a supplier audit and assess materials quality', suggestedActions: 'Belt Replace', owner: 'James Miller', dueDate: 'Mar 19, 2026', support: 'No', status: 'OPEN', statusTone: 'blue'},
  {id: 'A8932005', title: 'Schedule maintenance for equipment to prevent failures', suggestedActions: 'Belt Replace', owner: 'Gracie Walker', dueDate: 'Mar 16, 2026', support: 'Yes', status: 'CANCELED', statusTone: 'gray'},
];

const referenceOpenIssueRows: ReferenceTableRow[] = [
  {id: 'A8932002', title: 'Conveyor Guard Loose - Two operators from Line 3 are on sick leave, creating a staffing g...', owner: 'Carlos Mendez', status: 'OPEN', statusTone: 'blue'},
  {id: 'A8932002', title: 'Particulate Contamination - During a routine quality inspection on Syringe Line 2, dimensiona...', owner: "Ronie D'elano", status: 'OPEN', statusTone: 'blue'},
  {id: 'A8932002', title: 'Variation in Batch #902 - Color variance was detected in the last production batch, and aff...', owner: 'Carlos Mendez', status: 'IN PROGRESS', statusTone: 'orange'},
  {id: 'A8932002', title: 'Scrap Increase on Line 4 - High scrap rate detected on Line 4 during the current shift, primar...', owner: "Ronie D'elano", status: 'CLOSED', statusTone: 'green'},
];

function ReferenceTrackerToolbar({
  activeCategories,
  issueWidgetView,
  onExpand,
  onFilterClick,
  onModeChange,
  onSearchChange,
  onViewChange,
  searchValue,
  viewMode,
}: {
  activeCategories: ActionCategory[];
  issueWidgetView: IssueWidgetView;
  onExpand: () => void;
  onFilterClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onModeChange: (mode: ActionTrackerViewMode) => void;
  onSearchChange: (value: string) => void;
  onViewChange: (view: IssueWidgetView) => void;
  searchValue: string;
  viewMode: 'board' | 'table';
}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: 'auto auto minmax(240px, 1fr) auto auto 1fr auto', alignItems: 'center', gap: 0.8, minWidth: 0}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 1.6, minWidth: 250}}>
        <ReferenceTab active={issueWidgetView === 'openIssues'} label="OPEN ISSUES" onClick={() => onViewChange('openIssues')} />
        <ReferenceTab active={issueWidgetView === 'actionTracker'} label="ACTION TRACKER" onClick={() => onViewChange('actionTracker')} />
      </Box>
      <Box sx={{display: 'inline-flex', border: '1px solid #CDD3DB', borderRadius: 0.6, overflow: 'hidden', bgcolor: '#FFFFFF'}}>
        <IconButton onClick={() => onModeChange('board')} size="small" sx={{width: 34, height: 34, borderRadius: 0, bgcolor: viewMode === 'board' ? '#EEF0F2' : '#FFFFFF', color: viewMode === 'board' ? '#0B63E5' : '#9DBCF5'}}>
          <GridViewIcon sx={{fontSize: 20}} />
        </IconButton>
        <IconButton onClick={() => onModeChange('table')} size="small" sx={{width: 34, height: 34, borderLeft: '1px solid #CDD3DB', borderRadius: 0, bgcolor: viewMode === 'table' ? '#EEF0F2' : '#FFFFFF', color: viewMode === 'table' ? '#0B63E5' : '#9DBCF5'}}>
          <ViewColumnIcon sx={{fontSize: 20}} />
        </IconButton>
      </Box>
      <TextField
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search action items"
        size="small"
        InputProps={{endAdornment: <SearchIcon sx={{fontSize: 24, color: '#0B63E5'}} />}}
        sx={{
          minWidth: 240,
          '& .MuiInputBase-root': {height: 34, borderRadius: 1.2, bgcolor: '#FFFFFF', fontSize: 16},
          '& .MuiOutlinedInput-notchedOutline': {borderColor: '#B7BDC6'},
        }}
      />
      <Button variant="outlined" startIcon={<FilterIcon sx={{fontSize: 17}} />} onClick={onFilterClick} sx={{height: 34, px: 1.4, borderRadius: 1.2, color: '#0B63E5', borderColor: '#7FB0FF', fontSize: 14, fontWeight: 850, textTransform: 'uppercase'}}>
        Filters
      </Button>
      <Box sx={{display: 'flex', gap: 0.55, alignItems: 'center'}}>
        <ReferenceCategoryChip active label="All" />
        {categoryFilterOrder.map((category) => (
          <ReferenceCategoryChip key={category} active={activeCategories.includes(category)} label={categoryFilterTone[category].letter} />
        ))}
      </Box>
      <Box />
      <Box sx={{display: 'flex', gap: 0.8, alignItems: 'center', justifyContent: 'flex-end'}}>
        <AutoAwesomeIcon sx={{fontSize: 19, color: '#E2E8F0'}} />
        <IconButton size="small" onClick={onExpand} sx={{width: 28, height: 28, color: '#0B63E5'}}>
          <OpenInFullIcon sx={{fontSize: 18}} />
        </IconButton>
      </Box>
    </Box>
  );
}

function ReferenceTab({active, label, onClick}: {active: boolean; label: string; onClick: () => void}) {
  return (
    <Button onClick={onClick} sx={{height: 34, minWidth: 0, px: 0, borderRadius: 0, borderBottom: active ? '2px solid #0B63E5' : '2px solid transparent', color: active ? '#0B63E5' : '#5F6368', fontSize: 14, fontWeight: 800, textTransform: 'uppercase'}}>
      {label}
    </Button>
  );
}

function ReferenceCategoryChip({active, label}: {active: boolean; label: string}) {
  return (
    <Box sx={{minWidth: label === 'All' ? 38 : 25, height: 25, px: label === 'All' ? 1.1 : 0, display: 'grid', placeItems: 'center', borderRadius: 999, border: active && label !== 'All' ? '1px solid #61A0FF' : 'none', bgcolor: label === 'All' ? '#61A0FF' : '#FFFFFF', color: label === 'All' ? '#FFFFFF' : '#0B63E5', fontSize: 14, lineHeight: 1, fontWeight: 750}}>
      {label}
    </Box>
  );
}

function ReferenceActionTrackerBoard() {
  return <ReferenceBoard columns={referenceActionTrackerColumns} />;
}

function ReferenceOpenIssuesBoard() {
  return <ReferenceBoard columns={referenceOpenIssueColumns} />;
}

function ReferenceBoard({columns}: {columns: ReferenceBoardColumn[]}) {
  return (
    <Box sx={{minHeight: 0, overflow: 'hidden', border: '1px solid #D3D8DE', borderRadius: 1.2, bgcolor: '#F8FAFB'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))`, height: '100%', minHeight: 0}}>
        {columns.map((column, index) => (
          <Box key={column.title} sx={{display: 'grid', gridTemplateRows: '32px minmax(0, 1fr)', minWidth: 0, borderRight: index === columns.length - 1 ? 'none' : '1px solid #D3D8DE'}}>
            <Box sx={{display: 'flex', alignItems: 'center', px: 1.25, bgcolor: '#FFFFFF', borderBottom: '1px solid #D3D8DE'}}>
              <Typography sx={{fontSize: 16, color: '#202124', fontWeight: 850, lineHeight: 1}}>
                {column.title} <Box component="span" sx={{fontWeight: 500}}>({column.count})</Box>
              </Typography>
            </Box>
            <Box sx={{p: 0.8, display: 'flex', flexDirection: 'column', gap: 0.75, minHeight: 0, overflow: 'hidden'}}>
              {column.cards.map((card) => <ReferenceBoardCard key={`${column.title}-${card.title}`} card={card} />)}
              {column.extra ? (
                <Typography sx={{fontSize: 16, color: '#5F6368', textAlign: 'right', lineHeight: 1.1, mt: 'auto'}}>
                  {column.extra}
                </Typography>
              ) : null}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function ReferenceBoardCard({card}: {card: ReferenceCardItem}) {
  const letter = categoryFilterTone[card.category].letter;
  return (
    <Paper elevation={0} sx={{position: 'relative', minHeight: card.detail ? 62 : 66, p: 0.75, pl: 2.15, borderRadius: 0.8, border: '1px solid #D9E2F2', bgcolor: '#FFFFFF', boxShadow: '0 1px 5px rgba(32, 33, 36, 0.16)', overflow: 'hidden'}}>
      <Box sx={{position: 'absolute', left: 10, top: 9, bottom: 9, width: 4, borderRadius: 999, bgcolor: card.accent}} />
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 0.8, minWidth: 0}}>
        <Box sx={{minWidth: 0}}>
          <Typography sx={{fontSize: 13, color: '#202124', fontWeight: card.detail ? 850 : 500, lineHeight: 1.14}}>
            {card.title}
          </Typography>
          {card.detail ? (
            <Typography sx={{fontSize: 12.5, color: '#202124', lineHeight: 1.08, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
              {card.detail}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{width: 20, height: 20, flexShrink: 0, display: 'grid', placeItems: 'center', border: '1px solid #61A0FF', borderRadius: '50%', color: '#0B63E5', fontSize: 12, fontWeight: 850}}>
          {letter}
        </Box>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: card.detail ? 0.25 : 0.55}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0}}>
          <Avatar sx={{width: 18, height: 18, bgcolor: '#F2B58A', color: '#4A2513', fontSize: 9, fontWeight: 900}}>
            {getInitials(card.owner)}
          </Avatar>
          <Typography sx={{fontSize: 11.5, color: '#5F6368', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {card.owner}
          </Typography>
        </Box>
        <Typography sx={{fontSize: 11.5, color: '#5F6368', whiteSpace: 'nowrap'}}>
          {card.date}
        </Typography>
      </Box>
    </Paper>
  );
}

function ReferenceActionTrackerTable() {
  return (
    <ReferenceTable
      columns={[
        {id: 'id', label: 'ID', width: '100px'},
        {id: 'title', label: 'TITLE', width: 'minmax(300px, 1.45fr)'},
        {id: 'suggestedActions', label: 'SUGGESTED ACTIONS', width: 'minmax(210px, 1fr)'},
        {id: 'owner', label: 'OWNER', width: '200px'},
        {id: 'dueDate', label: 'DUE DATE', width: '150px'},
        {id: 'support', label: 'SUPPORT...', width: '150px'},
        {id: 'status', label: 'STATUS', width: '140px'},
      ]}
      rows={referenceActionRows}
    />
  );
}

function ReferenceOpenIssuesTable() {
  return (
    <ReferenceTable
      columns={[
        {id: 'id', label: 'ID', width: '100px'},
        {id: 'title', label: 'ISSUE', width: 'minmax(540px, 1fr)'},
        {id: 'owner', label: 'OWNER', width: '260px'},
        {id: 'status', label: 'STATUS', width: '150px'},
      ]}
      rows={referenceOpenIssueRows}
      issueTitle
    />
  );
}

function ReferenceTable({
  columns,
  issueTitle = false,
  rows,
}: {
  columns: Array<{id: keyof ReferenceTableRow; label: string; width: string}>;
  issueTitle?: boolean;
  rows: ReferenceTableRow[];
}) {
  const gridColumns = columns.map((column) => column.width).join(' ');
  return (
    <Box sx={{minHeight: 0, overflow: 'hidden', border: '1px solid #D3D8DE', borderRadius: 0.4, bgcolor: '#FFFFFF'}}>
      <Box sx={{minWidth: issueTitle ? 1180 : 1360}}>
        <Box sx={{display: 'grid', gridTemplateColumns: gridColumns, height: 34, alignItems: 'center', bgcolor: '#FFFFFF', borderBottom: '1px solid #D3D8DE'}}>
          {columns.map((column, index) => (
            <Typography key={column.id} sx={{px: 1.1, borderRight: index === columns.length - 1 ? 'none' : '1px solid #E4E8ED', color: '#202124', fontSize: 13, fontWeight: 850, lineHeight: 1}}>
              {column.label}
              <Box component="span" sx={{float: 'right', color: '#A7ADB5', fontSize: 16}}>:</Box>
            </Typography>
          ))}
        </Box>
        {rows.map((row, index) => (
          <Box key={`${row.id}-${index}`} sx={{display: 'grid', gridTemplateColumns: gridColumns, minHeight: 32, alignItems: 'center', bgcolor: index % 2 === 0 ? '#EEF3F5' : '#FFFFFF'}}>
            {columns.map((column, columnIndex) => (
              <Box key={`${row.id}-${index}-${column.id}`} sx={{px: 1.25, minWidth: 0}}>
                <ReferenceTableCell columnId={column.id} isLast={columnIndex === columns.length - 1} issueTitle={issueTitle} row={row} />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function ReferenceTableCell({columnId, issueTitle, row}: {columnId: keyof ReferenceTableRow; isLast: boolean; issueTitle: boolean; row: ReferenceTableRow}) {
  if (columnId === 'owner') {
    return (
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0}}>
        <Avatar sx={{width: 23, height: 23, bgcolor: '#F2B58A', color: '#4A2513', fontSize: 10, fontWeight: 900}}>{getInitials(row.owner)}</Avatar>
        <Typography sx={{fontSize: 14, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{row.owner}</Typography>
      </Box>
    );
  }
  if (columnId === 'status') {
    return <ReferenceStatusPill label={row.status} tone={row.statusTone} />;
  }
  if (columnId === 'title' && issueTitle) {
    const [title, ...details] = row.title.split(' - ');
    return (
      <Typography sx={{fontSize: 14, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
        <Box component="span" sx={{fontWeight: 850}}>{title}</Box>{details.length ? ` - ${details.join(' - ')}` : ''}
      </Typography>
    );
  }
  return (
    <Typography sx={{fontSize: 14, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
      {row[columnId]}
    </Typography>
  );
}

function ReferenceStatusPill({label, tone}: {label: string; tone: ReferenceStatusTone}) {
  const colors: Record<ReferenceStatusTone, {bg: string; color: string; shadow?: string}> = {
    blue: {bg: '#0B6EF3', color: '#FFFFFF', shadow: '0 2px 8px rgba(11,110,243,0.35)'},
    green: {bg: '#54B95D', color: '#021B08'},
    orange: {bg: '#FF9800', color: '#111111'},
    gray: {bg: '#E5E7EB', color: '#202124'},
  };
  return (
    <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 58, height: 18, px: 1, borderRadius: 999, bgcolor: colors[tone].bg, color: colors[tone].color, boxShadow: colors[tone].shadow, fontSize: 9.5, fontWeight: 950, lineHeight: 1}}>
      {label}
    </Box>
  );
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function ActionTrackerOperationalDashboard({
  aiPrioritizedIds,
  aiRunId,
  categorySummary,
  filteredItems,
  isAiPrioritizing,
  kpiCards,
  needsAttentionRows,
  onOpenAction,
  onRunAi,
  prioritySummary,
  statusSummary,
}: {
  aiPrioritizedIds: string[];
  aiRunId: number;
  categorySummary: Array<{category: ActionCategory; color: string; label: string; value: number}>;
  filteredItems: ActionTrackerItem[];
  isAiPrioritizing: boolean;
  kpiCards: Array<{id: string; icon: ReactNode; label: string; tone: string; value: number}>;
  needsAttentionRows: ActionTrackerItem[];
  onOpenAction: (item: ActionTrackerItem) => void;
  onRunAi: () => void;
  prioritySummary: Array<{color: string; label: string; value: number}>;
  statusSummary: Array<{color: string; label: string; value: number}>;
}) {
  const overdueCount = statusSummary.find((item) => item.label === 'Overdue')?.value ?? 0;
  const extendedCount = kpiCards.find((item) => item.id === 'extendedDueDate')?.value ?? 0;
  const reopenedCount = statusSummary.find((item) => item.label === 'Reopened')?.value ?? 0;

  return (
    <Box sx={{minHeight: 0, overflow: 'auto', pr: 0.2}}>
      <Box sx={{display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', gap: 1.05, minHeight: '100%'}}>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(7, minmax(118px, 1fr))', gap: 0.85}}>
          {kpiCards.map((card) => (
            <Paper
              key={card.id}
              elevation={0}
              sx={{
                minHeight: 82,
                p: 1,
                borderRadius: 1.6,
                border: `1px solid ${card.label === 'Overdue' ? '#FECACA' : '#DDE6F3'}`,
                bgcolor: card.label === 'Overdue' ? '#FEF2F2' : '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Box sx={{width: 36, height: 36, borderRadius: '50%', bgcolor: `color-mix(in srgb, ${card.tone} 9%, transparent)`, color: card.tone, display: 'grid', placeItems: 'center', flexShrink: 0}}>
                {card.icon}
              </Box>
              <Box sx={{minWidth: 0}}>
                <Typography sx={{fontSize: 24, lineHeight: 1, fontWeight: 900, color: '#0F172A'}}>
                  {card.value}
                </Typography>
                <Typography sx={{fontSize: 11.5, color: '#334155', fontWeight: 800, lineHeight: 1.15, mt: 0.25}}>
                  {card.label}
                </Typography>
                <Typography sx={{fontSize: 10.5, color: card.value > 0 ? '#15803D' : '#94A3B8', fontWeight: 700, mt: 0.45}}>
                  {card.value > 0 ? 'Live' : 'No change'}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: '1.05fr 1fr 1fr 0.92fr', gap: 1.05, minHeight: 0}}>
          <DashboardCard title="Action Status Overview">
            <Box sx={{display: 'grid', gridTemplateColumns: '118px minmax(0, 1fr)', gap: 1.1, alignItems: 'center', height: '100%'}}>
              <MiniDonutChart items={statusSummary} total={filteredItems.length} />
              <Box sx={{display: 'grid', gap: 0.55}}>
                {statusSummary.map((item) => (
                  <SummaryLegendRow key={item.label} color={item.color} label={item.label} total={filteredItems.length} value={item.value} />
                ))}
              </Box>
            </Box>
          </DashboardCard>

          <DashboardCard title="Priority Distribution">
            <Box sx={{display: 'grid', gap: 1.1, pt: 0.4}}>
              {prioritySummary.map((item) => (
                <HorizontalMetricBar key={item.label} color={item.color} label={item.label} max={Math.max(...prioritySummary.map((entry) => entry.value), 1)} value={item.value} />
              ))}
            </Box>
          </DashboardCard>

          <DashboardCard title="Due Date Risk">
            <Box sx={{display: 'grid', gridTemplateRows: 'auto 1fr', gap: 1, height: '100%'}}>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                <Typography sx={{fontSize: 12, color: '#64748B', fontWeight: 750}}>Next 4 weeks</Typography>
                <Box sx={{display: 'flex', gap: 1}}>
                  <MiniLegend color="#EF4444" label="Overdue" />
                  <MiniLegend color="#F97316" label="Due Soon" />
                </Box>
              </Box>
              <MiniTrendChart overdueCount={overdueCount} dueSoonCount={filteredItems.filter(isDueSoon).length} />
            </Box>
          </DashboardCard>

          <Box sx={{display: 'grid', gridTemplateRows: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 1.05, minHeight: 0}}>
            <DashboardCard title="AI Prioritization">
              <Box sx={{display: 'grid', gap: 0.8}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.85}}>
                  <Box sx={{width: 38, height: 38, borderRadius: '50%', bgcolor: '#EEF4FF', color: '#1457D7', display: 'grid', placeItems: 'center'}}>
                    <AutoAwesomeIcon />
                  </Box>
                  <Box sx={{minWidth: 0}}>
                    <Typography sx={{fontSize: 12.5, color: '#0F172A', fontWeight: 900}}>
                      {aiPrioritizedIds.length ? 'Top focus ready' : 'Ready to prioritize'}
                    </Typography>
                    <Typography sx={{fontSize: 11.5, color: '#64748B', lineHeight: 1.35}}>
                      {aiPrioritizedIds.length ? `${aiPrioritizedIds.length} actions highlighted` : 'Based on current queue data'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={isAiPrioritizing ? undefined : <AutoAwesomeIcon sx={{fontSize: 16}} />}
                  onClick={onRunAi}
                  disabled={isAiPrioritizing}
                  sx={{height: 34, borderRadius: 1.2, bgcolor: '#1457D7', boxShadow: 'none', fontWeight: 900, textTransform: 'none', '&:hover': {bgcolor: '#0F4FBE', boxShadow: 'none'}}}
                >
                  {isAiPrioritizing ? 'Prioritizing...' : aiRunId ? 'Re-do' : 'Prioritize Now'}
                </Button>
                {aiRunId ? (
                  <Typography sx={{fontSize: 11, color: '#64748B'}}>
                    Last run: Jun 10, 2026
                  </Typography>
                ) : null}
              </Box>
            </DashboardCard>

            <DashboardCard title="Top Categories">
              <Box sx={{display: 'grid', gap: 0.5}}>
                {categorySummary.map((item) => (
                  <SummaryLegendRow key={item.category} color={item.color} label={item.label} total={Math.max(filteredItems.length, 1)} value={item.value} />
                ))}
                {!categorySummary.length ? (
                  <Typography sx={{fontSize: 12, color: '#94A3B8'}}>No open category pressure.</Typography>
                ) : null}
              </Box>
            </DashboardCard>
          </Box>

          <Paper elevation={0} sx={{gridColumn: '1 / span 3', minHeight: 0, border: '1px solid #DDE6F3', borderRadius: 1.6, overflow: 'hidden', bgcolor: '#FFFFFF'}}>
            <Box sx={{height: 42, px: 1.1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5EAF2'}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8}}>
                <Typography sx={{fontSize: 16, color: '#0F172A', fontWeight: 900}}>Needs Attention</Typography>
                {['All', 'Overdue', 'Reopened', 'High Priority', 'Due Soon'].map((label) => (
                  <Chip key={label} label={label} size="small" sx={{height: 24, bgcolor: label === 'All' ? '#EEF4FF' : '#FFFFFF', color: label === 'All' ? '#1457D7' : '#64748B', border: '1px solid #DDE6F3', fontWeight: 800}} />
                ))}
              </Box>
              <Typography sx={{fontSize: 12, color: '#1457D7', fontWeight: 900}}>View All Actions</Typography>
            </Box>
            <Box sx={{maxHeight: 300, overflow: 'auto'}}>
              {needsAttentionRows.map((item) => (
                <NeedsAttentionRow
                  key={item.id}
                  aiHighlighted={aiPrioritizedIds.includes(item.id)}
                  item={item}
                  onClick={() => onOpenAction(item)}
                />
              ))}
            </Box>
          </Paper>

          <DashboardCard title="Insights">
            <Box sx={{display: 'grid', gap: 0.7}}>
              <InsightRow color="#EF4444" label={`${overdueCount} actions are overdue`} note="Review blockers before next meeting" />
              <InsightRow color="#F97316" label={`${extendedCount} actions have extended due dates`} note="Validate approval history" />
              <InsightRow color="#7C3AED" label={`${reopenedCount} actions were reopened`} note="Confirm additional work required" />
            </Box>
          </DashboardCard>
        </Box>
      </Box>
    </Box>
  );
}

function CompactActionTrackerWidgetView({
  currentUserName,
  isAiPrioritizing,
  items,
  onOpenAction,
  onOpenExpanded,
  onSelectKpi,
  onRunAi,
}: {
  currentUserName: string;
  isAiPrioritizing: boolean;
  items: ActionTrackerItem[];
  onOpenAction: (item: ActionTrackerItem) => void;
  onOpenExpanded: (options?: {summaryFilter?: ActionTrackerSummaryFilter | null; view?: 'table' | 'kanban'}) => void;
  onSelectKpi: (id: ActionTrackerWidgetSummaryFilter) => void;
  onRunAi: () => void;
}) {
  const [priorityFilter, setPriorityFilter] = useState<ActionPriority | ''>('');
  const [statusFilter, setStatusFilter] = useState<ActionStatus | ''>('');
  const [aiOnly, setAiOnly] = useState(false);
  const [filterMenu, setFilterMenu] = useState<{anchorEl: HTMLElement; kind: 'priority' | 'status'} | null>(null);

  const summaryCards = useMemo(() => ([
    {id: 'all' as const, label: 'All Actions', value: items.length, emphasis: 'primary' as const},
    {id: 'pendingMyAction' as const, label: 'Pending My Action', value: items.filter((item) => (item.status === 'Under Approval' ? item.approver === currentUserName : item.assignedTo === currentUserName && (item.status === 'Open' || item.status === 'In Progress' || item.status === 'Reopened'))).length, emphasis: 'default' as const},
  ]), [currentUserName, items]);

  const statusOverview = useMemo(() => ([
    {status: 'Open' as ActionStatus, label: 'Open', value: items.filter((item) => getOperationalStatus(item) === 'Open').length, color: actionTrackerWidgetTokens.primary},
    {status: 'In Progress' as ActionStatus, label: 'In Progress', value: items.filter((item) => getOperationalStatus(item) === 'In Progress').length, color: '#0F766E'},
    {status: 'Under Approval' as ActionStatus, label: 'Under Approval', value: items.filter((item) => getOperationalStatus(item) === 'Under Approval').length, color: actionTrackerWidgetTokens.warning},
    {status: 'Completed' as ActionStatus, label: 'Completed', value: items.filter((item) => getOperationalStatus(item) === 'Completed').length, color: '#66BB6A'},
    {status: 'Overdue' as ActionStatus, label: 'Overdue', value: items.filter((item) => getOperationalStatus(item) === 'Overdue').length, color: '#FF8A65'},
    {status: 'Reopened' as ActionStatus, label: 'Reopened', value: items.filter((item) => getOperationalStatus(item) === 'Reopened').length, color: '#8CA8D8'},
  ]).filter((item) => item.value > 0), [items]);

  const previewRows = useMemo(() => {
    return items
      .filter((item) => {
        const visibleStatus = getOperationalStatus(item);
        if (priorityFilter && item.priority !== priorityFilter) return false;
        if (statusFilter && visibleStatus !== statusFilter) return false;
        if (!statusFilter && (visibleStatus === 'Completed' || visibleStatus === 'Canceled')) return false;
        if (aiOnly && !item.aiAssisted) return false;
        return true;
      })
      .slice()
      .sort((left, right) => sortByWidgetAttention(left, right, currentUserName))
      .slice(0, 5);
  }, [aiOnly, currentUserName, items, priorityFilter, statusFilter]);

  const totalActions = items.length;
  const aiSummary = buildAiSummary(items);
  const activeFilterCount = Number(Boolean(priorityFilter)) + Number(Boolean(statusFilter)) + Number(aiOnly);

  return (
    <Box
      sx={{
        '--primary': actionTrackerWidgetTokens.primary,
        '--primary-soft': actionTrackerWidgetTokens.primarySoft,
        '--danger': actionTrackerWidgetTokens.danger,
        '--danger-soft': actionTrackerWidgetTokens.dangerSoft,
        '--success': actionTrackerWidgetTokens.success,
        '--success-soft': actionTrackerWidgetTokens.successSoft,
        '--warning': actionTrackerWidgetTokens.warning,
        '--warning-soft': actionTrackerWidgetTokens.warningSoft,
        '--border': actionTrackerWidgetTokens.border,
        '--border-soft': actionTrackerWidgetTokens.borderSoft,
        '--text-primary': actionTrackerWidgetTokens.textPrimary,
        '--text-secondary': actionTrackerWidgetTokens.textSecondary,
        '--text-muted': actionTrackerWidgetTokens.textMuted,
        '--surface': actionTrackerWidgetTokens.surface,
        '--surface-muted': actionTrackerWidgetTokens.surfaceMuted,
        minHeight: 0,
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr)',
        gap: 1.2,
      }}
    >
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(2, minmax(0, 1fr))'}, gap: 1}}>
        {summaryCards.map((card) => (
          <ActionKpiCard
            key={card.id}
            emphasis={card.emphasis}
            label={card.label}
            onClick={() => onSelectKpi(card.id)}
            selected={false}
            value={card.value}
          />
        ))}
      </Box>

      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '0.95fr 1.35fr'}, gap: 1.2, minHeight: 0}}>
          <ActionDonutSummary
            items={statusOverview}
            onSelectStatus={(status) => setStatusFilter((current) => current === status ? '' : status)}
            selectedStatus={statusFilter}
          total={totalActions}
        />

        <Paper elevation={0} sx={{minHeight: 0, p: 1.2, border: `1px solid ${actionTrackerWidgetTokens.borderSoft}`, borderRadius: 1.6, bgcolor: '#FFFFFF', display: 'grid', gridTemplateRows: 'auto auto minmax(0, 1fr)'}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1}}>
            <Typography sx={{fontSize: 17, color: actionTrackerWidgetTokens.textPrimary, fontWeight: 900}}>Action Items</Typography>
            <Typography sx={{fontSize: 11.5, color: actionTrackerWidgetTokens.textSecondary, fontWeight: 800}}>
              Showing {previewRows.length}{activeFilterCount ? ` | ${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''}` : ''}
            </Typography>
          </Box>

          <Box sx={{display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.1}}>
            <Chip
              label={priorityFilter ? `Priority: ${priorityFilter}` : 'Priority'}
              onClick={(event) => setFilterMenu({anchorEl: event.currentTarget, kind: 'priority'})}
              sx={{
                height: 34,
                px: 0.65,
                borderRadius: 999,
                bgcolor: priorityFilter ? actionTrackerWidgetTokens.primary : '#EFEFEF',
                color: priorityFilter ? '#FFFFFF' : '#1F2937',
                fontWeight: 900,
              }}
            />
            <Chip
              label={statusFilter ? `Status: ${formatStatusLabel(statusFilter)}` : 'Status'}
              onClick={(event) => setFilterMenu({anchorEl: event.currentTarget, kind: 'status'})}
              sx={{
                height: 34,
                px: 0.65,
                borderRadius: 999,
                bgcolor: statusFilter ? actionTrackerWidgetTokens.primary : '#EFEFEF',
                color: statusFilter ? '#FFFFFF' : '#1F2937',
                fontWeight: 900,
              }}
            />
            <Chip
              icon={<AutoAwesomeIcon sx={{fontSize: '1rem !important'}} />}
              label="Prioritized by BLU.AI"
              onClick={() => setAiOnly((current) => !current)}
              sx={{
                height: 34,
                px: 0.65,
                borderRadius: 999,
                bgcolor: aiOnly ? actionTrackerWidgetTokens.primary : '#EFEFEF',
                color: aiOnly ? '#FFFFFF' : '#1F2937',
                fontWeight: 900,
              }}
            />
          </Box>

          {statusFilter ? (
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, mb: 1.1}}>
              <Chip
                label={`Status: ${statusOverview.find((item) => item.status === statusFilter)?.label ?? formatStatusLabel(statusFilter)}`}
                onDelete={() => setStatusFilter('')}
                sx={{
                  height: 28,
                  borderRadius: 999,
                  bgcolor: actionTrackerWidgetTokens.primarySoft,
                  color: actionTrackerWidgetTokens.primary,
                  fontWeight: 900,
                  '& .MuiChip-deleteIcon': {color: actionTrackerWidgetTokens.primary},
                }}
              />
            </Box>
          ) : null}

          <Box sx={{display: 'grid', gap: 0.8, alignContent: 'start', overflow: 'auto', pr: 0.2}}>
            {previewRows.length ? previewRows.map((item) => (
              <WidgetActionPreviewRow key={item.id} item={item} onClick={() => onOpenAction(item)} />
            )) : (
              <Box sx={{display: 'grid', placeItems: 'center', minHeight: 180, border: `1px dashed ${actionTrackerWidgetTokens.borderSoft}`, borderRadius: 1.4}}>
                <Box sx={{textAlign: 'center'}}>
                  <Typography sx={{fontSize: 12.5, color: actionTrackerWidgetTokens.textPrimary, fontWeight: 800}}>
                    {statusFilter ? `No actions found for ${statusOverview.find((item) => item.status === statusFilter)?.label ?? formatStatusLabel(statusFilter)}.` : 'No actions match this filter'}
                  </Typography>
                  <Typography sx={{fontSize: 11.5, color: actionTrackerWidgetTokens.textSecondary, mt: 0.35}}>
                    {statusFilter ? 'Clear the status filter or open the full tracker.' : 'Try another chip or open the full tracker.'}
                  </Typography>
                  <Button size="small" onClick={() => onOpenExpanded({view: 'table'})} sx={{mt: 0.7, textTransform: 'none', fontWeight: 800}}>Open Action Tracker</Button>
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      <Menu anchorEl={filterMenu?.anchorEl ?? null} open={Boolean(filterMenu)} onClose={() => setFilterMenu(null)} PaperProps={{sx: {borderRadius: 2, minWidth: 220, p: 0.4}}}>
        {filterMenu?.kind === 'priority' ? (
          <>
            <MenuItem onClick={() => { setPriorityFilter(''); setFilterMenu(null); }}>All priorities</MenuItem>
            {(['High', 'Medium', 'Low'] as ActionPriority[]).map((priority) => (
              <MenuItem key={priority} onClick={() => { setPriorityFilter(priority); setFilterMenu(null); }}>
                {priority}
              </MenuItem>
            ))}
          </>
        ) : (
          <>
            <MenuItem onClick={() => { setStatusFilter(''); setFilterMenu(null); }}>All statuses</MenuItem>
            {(['Open', 'In Progress', 'Under Approval', 'Completed', 'Overdue', 'Reopened'] as ActionStatus[]).map((status) => (
              <MenuItem key={status} onClick={() => { setStatusFilter(status); setFilterMenu(null); }}>
                {formatStatusLabel(status)}
              </MenuItem>
            ))}
          </>
        )}
      </Menu>
    </Box>
  );
}

function DashboardCard({children, title}: {children: ReactNode; title: string}) {
  return (
    <Paper elevation={0} sx={{minHeight: 0, p: 1.15, border: '1px solid #DDE6F3', borderRadius: 1.6, bgcolor: '#FFFFFF', overflow: 'hidden'}}>
      <Typography sx={{fontSize: 15, color: '#0F172A', fontWeight: 900, mb: 1}}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function MiniDonutChart({
  activeLabel,
  compact = false,
  items,
  onSelectSegment,
  total,
}: {
  activeLabel?: string;
  compact?: boolean;
  items: Array<{color: string; label: string; value: number}>;
  onSelectSegment?: (label: string) => void;
  total: number;
}) {
  const safeTotal = Math.max(total, 1);
  let offset = 25;
  const size = compact ? 104 : 208;
  const strokeWidth = compact ? 7 : 7.2;

  return (
    <Box sx={{position: 'relative', width: size, height: size, flexShrink: 0}}>
      <svg viewBox="0 0 42 42" width={size} height={size} style={{overflow: 'visible'}}>
        <circle cx="21" cy="21" r="15.915" fill="transparent" stroke={actionTrackerWidgetTokens.borderSoft} strokeWidth={strokeWidth} />
        {items.map((item) => {
          const dash = (item.value / safeTotal) * 100;
          const circle = (
            <circle
              key={item.label}
              cx="21"
              cy="21"
              r="15.915"
              fill="transparent"
              stroke={item.color}
              onClick={() => onSelectSegment?.(item.label)}
              strokeDasharray={`${dash} ${100 - dash}`}
              strokeDashoffset={offset}
              strokeWidth={activeLabel === item.label ? strokeWidth + 1.8 : strokeWidth}
              style={{
                cursor: onSelectSegment ? 'pointer' : 'default',
                filter: activeLabel === item.label ? 'drop-shadow(0 0 4px rgba(21,94,239,0.28))' : 'none',
              }}
            />
          );
          offset -= dash;
          return circle;
        })}
      </svg>
      <Box sx={{position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center'}}>
        <Box>
          <Typography sx={{fontSize: compact ? 18 : 38, fontWeight: 900, color: actionTrackerWidgetTokens.textPrimary, lineHeight: 1}}>{total}</Typography>
          <Typography sx={{fontSize: compact ? 9.5 : 13, color: actionTrackerWidgetTokens.textMuted, fontWeight: 750}}>Total</Typography>
        </Box>
      </Box>
    </Box>
  );
}

function ActionDonutSummary({
  items,
  onSelectStatus,
  selectedStatus,
  total,
}: {
  items: Array<{color: string; label: string; status: ActionStatus; value: number}>;
  onSelectStatus: (status: ActionStatus) => void;
  selectedStatus: ActionStatus | '';
  total: number;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 0,
        p: 1.5,
        border: `1px solid ${actionTrackerWidgetTokens.borderSoft}`,
        borderRadius: 1.6,
        bgcolor: '#FFFFFF',
      }}
    >
      <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '220px minmax(0, 1fr)'}, gap: 1.5, alignItems: 'center', height: '100%'}}>
        <Box sx={{display: 'grid', placeItems: 'center', minHeight: 0}}>
          <MiniDonutChart
            activeLabel={selectedStatus ? (items.find((item) => item.status === selectedStatus)?.label ?? formatStatusLabel(selectedStatus)) : undefined}
            items={items.map((item) => ({color: item.color, label: item.label, value: item.value}))}
            onSelectSegment={(label) => {
              const selected = items.find((item) => item.label === label);
              if (selected) onSelectStatus(selected.status);
            }}
            total={total}
          />
        </Box>
        <Box sx={{display: 'grid', gap: 0.6, alignContent: 'center'}}>
          {items.map((item) => (
            <ButtonBase
              key={item.status}
              onClick={() => onSelectStatus(item.status)}
              sx={{
                justifyContent: 'flex-start',
                textAlign: 'left',
                borderRadius: 1.2,
                px: 0.7,
                py: 0.6,
                bgcolor: selectedStatus === item.status ? actionTrackerWidgetTokens.primarySoft : 'transparent',
                border: `1px solid ${selectedStatus === item.status ? '#D7E4FF' : 'transparent'}`,
              }}
            >
              <SummaryLegendRow
                color={item.color}
                active={selectedStatus === item.status}
                label={item.label}
                total={Math.max(total, 1)}
                value={item.value}
              />
            </ButtonBase>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

function StatusSummaryBar({
  activeStatusFilter,
  items,
  onSelectStatus,
}: {
  activeStatusFilter: ActionStatus | '';
  items: Array<{color: string; label: string; value: number}>;
  onSelectStatus: (status: ActionStatus | '') => void;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(3, minmax(0, 1fr))',
          lg: 'repeat(5, minmax(0, 1fr))',
        },
        alignItems: 'center',
        minHeight: 38,
        border: `1px solid ${actionTrackerWidgetTokens.borderSoft}`,
        borderRadius: 1.25,
        bgcolor: actionTrackerWidgetTokens.surface,
        overflow: 'hidden',
      }}
    >
      {items.map((item, index) => {
        const isDanger = item.label === 'Overdue';
        const isMuted = item.value === 0;
        return (
          <ButtonBase
            key={item.label}
            onClick={() => {
              const nextStatus = item.label as ActionStatus;
              onSelectStatus(activeStatusFilter === nextStatus ? '' : nextStatus);
            }}
            sx={{
              textAlign: 'left',
              minWidth: 0,
              height: '100%',
              px: 1,
              py: 0.65,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 0.7,
              borderLeft: index === 0 ? 'none' : `1px solid ${actionTrackerWidgetTokens.borderSoft}`,
              bgcolor: activeStatusFilter === item.label ? actionTrackerWidgetTokens.primarySoft : 'transparent',
            }}
          >
            <Typography
              sx={{
                fontSize: 11.5,
                lineHeight: 1.2,
                fontWeight: 700,
                color: actionTrackerWidgetTokens.textMuted,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {item.label}
            </Typography>
            <Typography
              sx={{
                flexShrink: 0,
                fontSize: 14,
                lineHeight: 1,
                fontWeight: 800,
                color: isDanger ? actionTrackerWidgetTokens.danger : isMuted ? actionTrackerWidgetTokens.textMuted : actionTrackerWidgetTokens.textPrimary,
              }}
            >
              {item.value}
            </Typography>
          </ButtonBase>
        );
      })}
    </Box>
  );
}

function ActionKpiCard({
  emphasis,
  label,
  onClick,
  selected = false,
  value,
}: {
  emphasis: 'default' | 'danger' | 'primary';
  label: string;
  onClick: () => void;
  selected?: boolean;
  value: number;
}) {
  const tone = emphasis === 'danger'
    ? {bg: actionTrackerWidgetTokens.dangerSoft, border: '#F1D7D7', label: actionTrackerWidgetTokens.danger, value: actionTrackerWidgetTokens.danger}
    : emphasis === 'primary'
      ? {bg: actionTrackerWidgetTokens.primarySoft, border: '#D7E4FF', label: actionTrackerWidgetTokens.primary, value: actionTrackerWidgetTokens.primary}
      : value === 0
        ? {bg: actionTrackerWidgetTokens.surface, border: actionTrackerWidgetTokens.borderSoft, label: actionTrackerWidgetTokens.textMuted, value: actionTrackerWidgetTokens.textMuted}
        : {bg: actionTrackerWidgetTokens.surface, border: actionTrackerWidgetTokens.border, label: actionTrackerWidgetTokens.textSecondary, value: actionTrackerWidgetTokens.textPrimary};

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        height: '100%',
        borderRadius: 1.4,
        textAlign: 'left',
        overflow: 'hidden',
        '&:focus-visible': {
          outline: `2px solid ${actionTrackerWidgetTokens.primary}`,
          outlineOffset: 2,
        },
      }}
    >
      <Box
        sx={{
          width: '100%',
          minHeight: 74,
          height: '100%',
          px: 1.2,
          py: 1,
          borderRadius: 1.4,
          border: `1px solid ${selected ? actionTrackerWidgetTokens.primary : tone.border}`,
          bgcolor: tone.bg,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 0.55,
          boxShadow: selected ? `inset 0 0 0 1px ${actionTrackerWidgetTokens.primarySoft}` : 'none',
        }}
      >
        <Typography sx={{fontSize: 12, color: tone.label, fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {label}
        </Typography>
        <Typography sx={{mt: 0.1, fontSize: 24, color: tone.value, fontWeight: 800, lineHeight: 1}}>
          {value}
        </Typography>
      </Box>
    </ButtonBase>
  );
}

function StatusPill({label, status}: {label: string; status: ActionStatus}) {
  const tone = getOperationalStatusTone(status);
  return (
    <Chip
      label={label}
      sx={{
        height: 20,
        bgcolor: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        fontWeight: 800,
        borderRadius: 999,
        fontSize: 10.5,
      }}
    />
  );
}

function PriorityPill({priority}: {priority: ActionPriority}) {
  const tone = getPriorityPillTone(priority);
  return (
    <Chip
      label={priority}
      sx={{
        height: 20,
        bgcolor: tone.bg,
        color: tone.color,
        border: `1px solid ${tone.border}`,
        fontWeight: 800,
        borderRadius: 999,
        fontSize: 10.5,
      }}
    />
  );
}

function ActionSourceBadge({source}: {source: string}) {
  return (
    <Chip
      label={source || 'AT'}
      sx={{
        height: 20,
        bgcolor: actionTrackerWidgetTokens.surfaceMuted,
        color: actionTrackerWidgetTokens.textSecondary,
        border: `1px solid ${actionTrackerWidgetTokens.neutralBorder}`,
        fontWeight: 800,
        borderRadius: 999,
        fontSize: 10.5,
        '& .MuiChip-label': {px: 0.9},
      }}
    />
  );
}

function ActionOwner({name}: {name: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0}}>
      <Avatar sx={{width: 22, height: 22, bgcolor: '#E8EEF5', color: actionTrackerWidgetTokens.textSecondary, fontSize: 9.5, fontWeight: 900}}>
        {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
      </Avatar>
      <Typography sx={{fontSize: 12, color: actionTrackerWidgetTokens.textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
        {name}
      </Typography>
    </Box>
  );
}

function ActionAiCallout({
  attentionCount,
  isAiPrioritizing,
  onDismissAiPrompt,
  onRunAi,
}: {
  attentionCount: number;
  isAiPrioritizing: boolean;
  onDismissAiPrompt: () => void;
  onRunAi: () => void;
}) {
  return (
    <Box
      sx={{
        px: 1.05,
        py: 0.8,
        borderRadius: 1.4,
        border: `1px solid ${actionTrackerWidgetTokens.borderSoft}`,
        bgcolor: '#F5FAFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0}}>
        <Box sx={{width: 24, height: 24, borderRadius: '50%', bgcolor: actionTrackerWidgetTokens.primarySoft, color: actionTrackerWidgetTokens.primary, display: 'grid', placeItems: 'center', flexShrink: 0}}>
          <AutoAwesomeIcon sx={{fontSize: 13}} />
        </Box>
        <Typography sx={{fontSize: 12.5, color: actionTrackerWidgetTokens.textPrimary, fontWeight: 700, lineHeight: 1.25}}>
          BLU.AI found {attentionCount} actions needing attention.
        </Typography>
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
        <Button
          variant="contained"
          size="small"
          onClick={onRunAi}
          disabled={isAiPrioritizing}
          sx={{
            height: 28,
            px: 1.05,
            borderRadius: 999,
            textTransform: 'none',
            fontWeight: 800,
            bgcolor: actionTrackerWidgetTokens.primary,
            boxShadow: 'none',
            '&:hover': {bgcolor: '#1555D1', boxShadow: 'none'},
          }}
        >
          {isAiPrioritizing ? 'Running...' : 'Prioritize'}
        </Button>
        <Button size="small" onClick={onDismissAiPrompt} sx={{height: 28, px: 0.9, textTransform: 'none', fontWeight: 700, color: actionTrackerWidgetTokens.textSecondary}}>
          Dismiss
        </Button>
      </Box>
    </Box>
  );
}

function WidgetActionPreviewRow({item, onClick}: {item: ActionTrackerItem; onClick: () => void}) {
  const status = getOperationalStatus(item);
  const statusLabel = formatStatusLabel(status);
  const priorityTone = getPriorityPillTone(item.priority);
  const widgetStatusLabel = statusLabel;

  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        width: '100%',
        p: 1.1,
        borderRadius: 1.35,
        border: `1px solid ${actionTrackerWidgetTokens.borderSoft}`,
        bgcolor: '#FFFFFF',
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        gap: 1,
        alignItems: 'start',
        textAlign: 'left',
      }}
    >
      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 13.5, color: actionTrackerWidgetTokens.textPrimary, fontWeight: 900, lineHeight: 1.35}}>
          {item.title}
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, mt: 0.55, flexWrap: 'wrap'}}>
          <Typography sx={{fontSize: 12, color: priorityTone.color, fontWeight: 900}}>{item.priority}</Typography>
          <Typography sx={{fontSize: 12, color: actionTrackerWidgetTokens.textSecondary}}>• {formatCategoryLabel(item.category)}</Typography>
          <Typography sx={{fontSize: 12, color: actionTrackerWidgetTokens.textSecondary}}>• {item.assignedTo}</Typography>
          <Typography sx={{fontSize: 12, color: actionTrackerWidgetTokens.textSecondary}}>• {item.dueDate}</Typography>
        </Box>
      </Box>
      <StatusPill label={widgetStatusLabel} status={status} />
    </ButtonBase>
  );
}

function SummaryLegendRow({
  active = false,
  color,
  label,
  total,
  value,
}: {
  active?: boolean;
  color: string;
  label: string;
  total: number;
  value: number;
}) {
  const percent = total ? Math.round((value / total) * 100) : 0;
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gap: 0.7, alignItems: 'center', width: '100%'}}>
      <Box sx={{width: 9, height: 9, borderRadius: '50%', bgcolor: color}} />
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, minWidth: 0}}>
        <Typography sx={{fontSize: 12, color: active ? actionTrackerWidgetTokens.primary : '#334155', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {label}
        </Typography>
        <Typography sx={{fontSize: 12, color: '#0F172A', fontWeight: 850, flexShrink: 0}}>
          {value} · {percent}%
        </Typography>
      </Box>
    </Box>
  );
}

function HorizontalMetricBar({color, label, max, value}: {color: string; label: string; max: number; value: number}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: '72px minmax(0, 1fr) 28px', gap: 0.8, alignItems: 'center'}}>
      <Typography sx={{fontSize: 12, color: '#334155', fontWeight: 800}}>{label}</Typography>
      <Box sx={{height: 9, borderRadius: 999, bgcolor: '#E5EAF2', overflow: 'hidden'}}>
        <Box sx={{width: `${Math.max(6, (value / max) * 100)}%`, height: '100%', bgcolor: color, borderRadius: 999}} />
      </Box>
      <Typography sx={{fontSize: 12, color: '#0F172A', fontWeight: 900, textAlign: 'right'}}>{value}</Typography>
    </Box>
  );
}

function MiniLegend({color, label}: {color: string; label: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35}}>
      <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: color}} />
      <Typography sx={{fontSize: 10.5, color: '#64748B', fontWeight: 750}}>{label}</Typography>
    </Box>
  );
}

function MiniTrendChart({dueSoonCount, overdueCount}: {dueSoonCount: number; overdueCount: number}) {
  const max = Math.max(overdueCount + 3, dueSoonCount + 3, 6);
  const overduePoints = [overdueCount, overdueCount + 1, overdueCount + 2, overdueCount + 3];
  const dueSoonPoints = [dueSoonCount, dueSoonCount + 1, dueSoonCount + 1, dueSoonCount + 2];
  const buildPoints = (values: number[]) => values.map((value, index) => `${18 + index * 58},${98 - (value / max) * 78}`).join(' ');

  return (
    <svg viewBox="0 0 210 110" width="100%" height="100%" preserveAspectRatio="none">
      {[20, 45, 70, 95].map((y) => <line key={y} x1="12" x2="202" y1={y} y2={y} stroke="#E5EAF2" strokeDasharray="4 4" />)}
      <polyline points={buildPoints(overduePoints)} fill="none" stroke="#EF4444" strokeWidth="3" />
      <polyline points={buildPoints(dueSoonPoints)} fill="none" stroke="#F97316" strokeWidth="3" />
      {[0, 1, 2, 3].map((index) => <text key={index} x={18 + index * 58} y="108" fill="#64748B" fontSize="9" textAnchor="middle">W{index + 1}</text>)}
    </svg>
  );
}

function NeedsAttentionRow({aiHighlighted, item, onClick}: {aiHighlighted: boolean; item: ActionTrackerItem; onClick: () => void}) {
  const status = getOperationalStatus(item);
  const statusTone = getOperationalStatusTone(status);
  const priorityTone = getPriorityPillTone(item.priority);
  const categoryTone = getCategoryTone(item.category);
  const hasAttachments = (item.attachments?.length ?? 0) > 0;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'grid',
        gridTemplateColumns: '96px minmax(220px, 1.5fr) 106px 132px 116px 108px',
        gap: 1,
        alignItems: 'center',
        minHeight: 52,
        px: 1.1,
        borderBottom: '1px solid #EFF2F6',
        bgcolor: aiHighlighted ? '#F8FBFF' : '#FFFFFF',
        cursor: 'pointer',
        '&:hover': {bgcolor: '#F8FAFC'},
      }}
    >
      <Chip label={item.priority} sx={{height: 25, bgcolor: priorityTone.bg, color: priorityTone.color, border: `1px solid ${priorityTone.border}`, fontWeight: 900}} />
      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 12.5, color: '#0F172A', fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
          {item.title}
        </Typography>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2}}>
          {aiHighlighted || item.aiAssisted ? <AutoAwesomeIcon sx={{fontSize: 13, color: '#1457D7'}} /> : null}
          {hasAttachments ? <TaskAltOutlinedIcon sx={{fontSize: 13, color: '#64748B'}} /> : null}
          <Typography sx={{fontSize: 11, color: status === 'Overdue' ? '#DC2626' : isDueSoon(item) ? '#D97706' : '#64748B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {status === 'Overdue' ? 'Overdue' : isDueSoon(item) ? 'Due soon' : item.problem}
          </Typography>
        </Box>
      </Box>
      <Chip label={formatCategoryLabel(item.category)} sx={{height: 24, bgcolor: categoryTone.tint, color: categoryTone.color, border: `1px solid color-mix(in srgb, ${categoryTone.color} 20%, transparent)`, fontWeight: 850}} />
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0}}>
        <Avatar sx={{width: 24, height: 24, bgcolor: '#E2E8F0', color: '#475569', fontSize: 10, fontWeight: 900}}>
          {item.assignedTo.split(' ').map((part) => part[0]).join('').slice(0, 2)}
        </Avatar>
        <Typography sx={{fontSize: 12, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{item.assignedTo}</Typography>
      </Box>
      <Typography sx={{fontSize: 12, color: status === 'Overdue' ? '#DC2626' : '#334155', fontWeight: 800}}>{item.dueDate}</Typography>
      <Chip label={status} sx={{height: 25, bgcolor: statusTone.bg, color: statusTone.color, border: `1px solid ${statusTone.border}`, fontWeight: 900}} />
    </Box>
  );
}

function WidgetActionTableRow({item, onClick}: {item: ActionTrackerItem; onClick: () => void}) {
  const status = getOperationalStatus(item);
  const categoryTone = getCategoryTone(item.category);
  const ownerLabel = item.assignedTo || 'Unassigned';
  const statusLabel = status;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'grid',
        gridTemplateColumns: '88px minmax(240px, 2.2fr) minmax(124px, 1fr) 104px 92px 108px',
        gap: 0.8,
        alignItems: 'center',
        minHeight: 50,
        px: 1.2,
        py: 0.5,
        borderBottom: `1px solid ${actionTrackerWidgetTokens.borderSoft}`,
        cursor: 'pointer',
        '&:hover': {bgcolor: '#FAFCFF'},
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <ActionSourceBadge source={item.source || 'AT'} />
      </Box>
      <Box sx={{minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.55}}>
        <Typography sx={{fontSize: 12.5, color: actionTrackerWidgetTokens.textPrimary, fontWeight: 800, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0}}>
          {item.title}
        </Typography>
        <Chip
          label={formatCategoryLabel(item.category)}
          sx={{
            height: 20,
            bgcolor: categoryTone.tint,
            color: categoryTone.color,
            border: `1px solid ${categoryTone.color}33`,
            fontWeight: 800,
            borderRadius: 999,
            fontSize: 10.5,
            flexShrink: 0,
          }}
        />
      </Box>
      <ActionOwner name={ownerLabel} />
      <Typography sx={{fontSize: 12, color: status === 'Overdue' ? actionTrackerWidgetTokens.danger : actionTrackerWidgetTokens.textPrimary, fontWeight: 800}}>
        {item.dueDate || 'TBD'}
      </Typography>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <PriorityPill priority={item.priority} />
      </Box>
      <Box sx={{display: 'flex', alignItems: 'center'}}>
        <StatusPill label={statusLabel} status={status} />
      </Box>
    </Box>
  );
}

function InsightRow({color, label, note}: {color: string; label: string; note: string}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: '32px minmax(0, 1fr)', gap: 0.7, alignItems: 'center', p: 0.75, borderRadius: 1.1, bgcolor: '#F8FAFC'}}>
      <Box sx={{width: 30, height: 30, borderRadius: '50%', bgcolor: `color-mix(in srgb, ${color} 8%, transparent)`, color, display: 'grid', placeItems: 'center'}}>
        <ReportProblemOutlinedIcon sx={{fontSize: 17}} />
      </Box>
      <Box sx={{minWidth: 0}}>
        <Typography sx={{fontSize: 12, color: '#0F172A', fontWeight: 900}}>{label}</Typography>
        <Typography sx={{fontSize: 11, color: '#64748B'}}>{note}</Typography>
      </Box>
    </Box>
  );
}

function ActionTrackerWidgetFiltersMenu({
  anchorEl,
  filters,
  onClose,
  onFiltersChange,
  ownerOptions,
}: {
  anchorEl: HTMLElement | null;
  filters: OperationalActionFilters;
  onClose: () => void;
  onFiltersChange: React.Dispatch<React.SetStateAction<OperationalActionFilters>>;
  ownerOptions: string[];
}) {
  const updateFilter = (key: keyof OperationalActionFilters, value: string) => {
    onFiltersChange((current) => ({...current, [key]: value}));
  };

  return (
    <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose} PaperProps={{sx: {width: 320, p: 1.2, borderRadius: 2}}}>
      <Typography sx={{fontSize: 13, color: '#0F172A', fontWeight: 900, mb: 1}}>Action filters</Typography>
      <Box sx={{display: 'grid', gap: 1}}>
        <TextField select size="small" label="Status" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
          <MenuItem value="">All</MenuItem>
          {(['Open', 'In Progress', 'Under Approval', 'Completed', 'Overdue', 'Reopened', 'Canceled'] as ActionStatus[]).map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Category" value={filters.category} onChange={(event) => updateFilter('category', event.target.value)}>
          <MenuItem value="">All</MenuItem>
          {categoryFilterOrder.map((category) => <MenuItem key={category} value={category}>{formatCategoryLabel(category)}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Priority" value={filters.priority} onChange={(event) => updateFilter('priority', event.target.value)}>
          <MenuItem value="">All</MenuItem>
          {(['High', 'Medium', 'Low'] as ActionPriority[]).map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Owner" value={filters.owner} onChange={(event) => updateFilter('owner', event.target.value)}>
          <MenuItem value="">All</MenuItem>
          {ownerOptions.map((owner) => <MenuItem key={owner} value={owner}>{owner}</MenuItem>)}
        </TextField>
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1}}>
          <TextField size="small" label="Due from" type="date" value={filters.dateFrom} onChange={(event) => updateFilter('dateFrom', event.target.value)} InputLabelProps={{shrink: true}} />
          <TextField size="small" label="Due to" type="date" value={filters.dateTo} onChange={(event) => updateFilter('dateTo', event.target.value)} InputLabelProps={{shrink: true}} />
        </Box>
        <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}>
          <Button
            onClick={() => onFiltersChange({category: '', dateFrom: '', dateTo: '', owner: '', priority: '', search: '', status: ''})}
            sx={{fontWeight: 900, textTransform: 'none'}}
          >
            Clear
          </Button>
          <Button variant="contained" onClick={onClose} sx={{fontWeight: 900, textTransform: 'none', boxShadow: 'none'}}>
            Apply
          </Button>
        </Box>
      </Box>
    </Menu>
  );
}

export function ActionTrackerTable({
  activeCategories = categoryFilterOrder,
  compact = false,
  rows,
  visibleColumnIds = actionTrackerTableColumns.map((column) => column.id),
  onRowClick,
}: {
  activeCategories?: ActionCategory[];
  compact?: boolean;
  rows: ActionTrackerItem[];
  visibleColumnIds?: ActionTrackerTableColumnId[];
  onRowClick?: (row: ActionTrackerItem) => void;
}) {
  const filteredRows = useMemo(
    () => rows.filter((row) => activeCategories.includes(row.category)),
    [activeCategories, rows],
  );
  const visibleRows = compact ? filteredRows.slice(0, 7) : filteredRows;
  const visibleColumns = useMemo(
    () => actionTrackerTableColumns.filter((column) => visibleColumnIds.includes(column.id)),
    [visibleColumnIds],
  );
  const tableGridTemplateColumns = visibleColumns.map((column) => column.width).join(' ');
  const sortableColumnIds: ActionTrackerTableColumnId[] = ['source', 'dateShift', 'problem', 'suggestedActions', 'due', 'assignedTo', 'supportNeeded'];

  return (
    <Box sx={{height: '100%', minHeight: 0, overflow: 'auto', borderRadius: 1.6, border: `1px solid ${actionTrackerTableBorderColor}`}}>
      <Box sx={{minWidth: compact ? 1180 : 1360}}>
        <Box sx={{display: 'grid', gridTemplateColumns: tableGridTemplateColumns, height: compact ? 38 : 46, alignItems: 'center', borderBottom: '1px solid #DDE3EC', bgcolor: actionTrackerTableHeaderBg}}>
          {visibleColumns.map((column, index) => (
            <Typography key={column.id} sx={{px: 1.15, borderRight: index === visibleColumns.length - 1 ? 'none' : `1px solid ${actionTrackerTableCellBorderColor}`, color: '#202124', fontSize: compact ? 10.5 : 12, fontWeight: 900, lineHeight: 1}}>
              {column.label.toUpperCase()}
              {sortableColumnIds.includes(column.id) ? (
                <Box component="span" sx={{float: 'right', color: '#A0A8B6', fontSize: 12}}>^</Box>
              ) : null}
            </Typography>
          ))}
        </Box>
        {visibleRows.map((row, index) => (
          <Box
            key={row.id}
            onClick={() => onRowClick?.(row)}
            sx={{
              display: 'grid',
              gridTemplateColumns: tableGridTemplateColumns,
              minHeight: compact ? 46 : 54,
              alignItems: 'center',
              bgcolor: index % 2 ? actionTrackerTableAltRowBg : '#FFFFFF',
              borderBottom: '1px solid #EFF2F6',
              cursor: onRowClick ? 'pointer' : 'default',
              transition: 'background-color 0.16s ease, transform 0.16s ease',
              '&:hover': onRowClick ? {
                bgcolor: actionTrackerTableHoverBg,
              } : undefined,
            }}
          >
            {visibleColumns.map((column, columnIndex) => (
              <Box key={`${row.id}-${column.id}`} sx={{minWidth: 0}}>
                {renderTableColumnCell(column.id, row, compact, columnIndex === visibleColumns.length - 1)}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function IssueCategoryBoard({
  activeCategories,
  completedCount,
  mode,
  onCardClick,
  rows,
}: {
  activeCategories: ActionCategory[];
  completedCount?: number;
  mode: IssueWidgetView;
  onCardClick?: (row: IssueBoardItem) => void;
  rows: IssueBoardItem[];
}) {
  return (
    <Box sx={{minHeight: 0, overflow: 'hidden', border: '1px solid #B8D9FF', borderRadius: 1.4, bgcolor: '#F7F8FA'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', height: '100%', minHeight: 0}}>
        {categoryFilterOrder.map((category) => {
          const columnRows = rows.filter((row) => row.category === category && activeCategories.includes(row.category));
          const tone = categoryFilterTone[category];
          const extraCount = Math.max(0, columnRows.length - 3);

          return (
            <Box key={category} sx={{display: 'grid', gridTemplateRows: '2.125rem minmax(0, 1fr) auto', minWidth: 0, minHeight: 0, borderRight: category === 'PEOPLE' ? 'none' : '1px solid #B8D9FF', bgcolor: '#F7F8FA'}}>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1, minWidth: 0, bgcolor: '#EEF3F6', borderBottom: '1px solid #B8D9FF'}}>
                <Typography sx={{fontSize: '0.8125rem', color: '#202124', fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap'}}>
                  {tone.label} ({columnRows.length})
                </Typography>
                <SearchIcon sx={{fontSize: '1.0625rem', color: '#6EC6FF'}} />
              </Box>
              <Box sx={{p: 0.9, display: 'flex', flexDirection: 'column', gap: 0.55, minWidth: 0, minHeight: 0, overflow: 'hidden'}}>
                {columnRows.slice(0, 3).map((row) => (
                  <IssueBoardCard key={row.id} mode={mode} row={row} onClick={() => onCardClick?.(row)} />
                ))}
                {extraCount > 0 ? (
                  <Typography sx={{fontSize: 13, color: '#202124', lineHeight: 1, textAlign: 'right', mt: mode === 'actionTracker' ? 0.2 : 0}}>
                    +{extraCount}
                  </Typography>
                ) : null}
              </Box>
              {typeof completedCount === 'number' ? (
                <Typography sx={{fontSize: 12, color: '#202124', px: 0.7, pb: 0.45, lineHeight: 1}}>
                  <Box component="span" sx={{fontWeight: 900}}>{completedCount}</Box> Completed
                </Typography>
              ) : <Box sx={{height: 8}} />}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function IssueBoardCard({mode, onClick, row}: {mode: IssueWidgetView; onClick?: () => void; row: IssueBoardItem}) {
  const priorityTone = getPriorityTone(row.priority);
  const borderColor = row.highlighted ? '#FF4038' : '#DDDDDD';
  const showMeta = mode === 'openIssues';
  const isSolidWorkflowIssue = row.workflowHighlight === 'solid';
  const isOutlineWorkflowIssue = row.workflowHighlight === 'outline';
  const cardBackground = row.flashing ? '#FFF7F7' : isSolidWorkflowIssue || row.filled ? '#EF373D' : '#FFFFFF';
  const cardForeground = isSolidWorkflowIssue || row.filled ? '#FFFFFF' : '#202124';

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        minHeight: showMeta ? 58 : 36,
        p: showMeta ? 0.65 : 0.55,
        pl: 1.75,
        borderRadius: 0.8,
        border: row.escalationFlashing ? '2px solid #FF4038' : row.flashing ? '1px solid #F6B2B7' : row.highlighted ? `3px solid ${borderColor}` : `1px solid ${borderColor}`,
        bgcolor: cardBackground,
        color: cardForeground,
        boxShadow: isOutlineWorkflowIssue ? '0 0 0 2px rgba(239,55,61,0.30), 0 1px 2px rgba(0,0,0,0.18)' : row.flashing ? '0 2px 8px rgba(228, 59, 70, 0.12)' : '0 1px 2px rgba(0,0,0,0.18)',
        cursor: onClick ? 'pointer' : 'default',
        animation: row.escalationFlashing
          ? 'issueEscalatedBorderPulse 1s ease-in-out infinite'
          : row.flashing
            ? 'ncOpenIssuePulse 1.35s ease-in-out infinite'
            : isSolidWorkflowIssue
              ? 'workflowIssueSolidPulse 1.1s ease-in-out infinite'
              : isOutlineWorkflowIssue
                ? 'workflowIssueOutlinePulse 1.1s ease-in-out infinite'
                : 'none',
        '@keyframes ncOpenIssuePulse': {
          '0%, 100%': {
            backgroundColor: '#FFFFFF',
            borderColor: '#F6B2B7',
            boxShadow: '0 2px 8px rgba(228, 59, 70, 0.10)',
          },
          '50%': {
            backgroundColor: '#FFE8EA',
            borderColor: '#F39AA2',
            boxShadow: '0 4px 12px rgba(228, 59, 70, 0.16)',
          },
        },
        '@keyframes issueEscalatedBorderPulse': {
          '0%, 100%': {
            borderColor: '#FF4038',
            boxShadow: '0 0 0 0 rgba(255, 64, 56, 0.38), 0 2px 8px rgba(255, 64, 56, 0.18)',
          },
          '50%': {
            borderColor: '#FF8A00',
            boxShadow: '0 0 0 6px rgba(255, 64, 56, 0), 0 8px 16px rgba(255, 64, 56, 0.25)',
          },
        },
        overflow: 'hidden',
        transition: 'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease',
        '&:hover': onClick ? {
          transform: 'translateY(-1px)',
          boxShadow: '0 9px 18px rgba(15,23,42,0.13)',
          borderColor: row.highlighted ? borderColor : '#93C5FD',
        } : undefined,
        '&::before': {
          content: '""',
          position: 'absolute',
          left: row.flashing ? 10 : row.highlighted ? 7 : 10,
          top: showMeta ? 7 : 6,
          bottom: showMeta ? 7 : 6,
          width: 4,
          borderRadius: 999,
          bgcolor: priorityTone,
        },
        '@keyframes workflowIssueSolidPulse': {
          '0%, 100%': {bgcolor: '#EF373D', boxShadow: '0 0 0 0 rgba(239,55,61,0.42), 0 1px 2px rgba(0,0,0,0.18)'},
          '50%': {bgcolor: '#C91F29', boxShadow: '0 0 0 5px rgba(239,55,61,0.18), 0 10px 22px rgba(239,55,61,0.26)'},
        },
        '@keyframes workflowIssueOutlinePulse': {
          '0%, 100%': {borderColor: '#EF373D', boxShadow: '0 0 0 0 rgba(239,55,61,0.26), 0 1px 2px rgba(0,0,0,0.18)'},
          '50%': {borderColor: '#EF373D', boxShadow: '0 0 0 5px rgba(239,55,61,0.16), 0 10px 22px rgba(239,55,61,0.16)'},
        },
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 0.8, pl: 0.35, minWidth: 0}}>
        <Box sx={{minWidth: 0, flex: 1}}>
          <Typography sx={{fontSize: showMeta ? 12 : 12, color: isSolidWorkflowIssue || row.filled ? '#FFFFFF' : '#202124', fontWeight: 900, lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {row.title}
          </Typography>
          <Typography sx={{fontSize: 12, color: isSolidWorkflowIssue || row.filled ? '#FFFFFF' : '#202124', lineHeight: 1.05, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {row.detail}
          </Typography>
        </Box>
        {showMeta ? (
          <Typography sx={{fontSize: 10.5, color: isSolidWorkflowIssue || row.filled ? '#FFE6E8' : '#7B8088', whiteSpace: 'nowrap', lineHeight: 1.1}}>
          {row.time}
          </Typography>
        ) : null}
      </Box>
      {row.originTag ? (
        <Box sx={{display: 'inline-flex', ml: 0.35, mt: 0.35, px: 0.55, py: 0.18, borderRadius: 0.6, bgcolor: isSolidWorkflowIssue ? '#FFFFFF' : '#FFE8EA', color: '#C91F29', fontSize: 9.5, fontWeight: 900, lineHeight: 1}}>
          {row.originTag}
        </Box>
      ) : null}
      {showMeta ? (
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, mt: 0.35, pl: 0.35, minWidth: 0}}>
          <Avatar sx={{width: 15, height: 15, bgcolor: isSolidWorkflowIssue || row.filled ? '#FFFFFF' : '#F5C6A8', color: isSolidWorkflowIssue || row.filled ? '#EF373D' : '#3D2415', fontSize: 8, fontWeight: 900}}>
            {(row.owner ?? '').split(' ').map((part) => part[0]).join('').slice(0, 2)}
          </Avatar>
          <Typography sx={{fontSize: 10.5, color: isSolidWorkflowIssue || row.filled ? '#FFE6E8' : '#8A8D93', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
            {row.owner}
          </Typography>
          {row.escalatedFrom ? (
            <Chip
              label={`Escalated from ${row.escalatedFrom}`}
              size="small"
              sx={{height: 18, ml: 'auto', bgcolor: '#FFF2DE', color: '#B45309', border: '1px solid #FED7AA', fontSize: 9.5, fontWeight: 900}}
            />
          ) : null}
        </Box>
      ) : null}
    </Paper>
  );
}

function OpenIssueDetailsDialog({
  activeWorkstationTitle,
  issue,
  onClose,
  onCreateAction,
  onEscalate,
  onEscalated,
}: {
  activeWorkstationTitle: string;
  issue: IssueBoardItem | null;
  onClose: () => void;
  onCreateAction: (issue: IssueBoardItem) => void;
  onEscalate: (issue: IssueBoardItem, target: string) => void;
  onEscalated: () => void;
}) {
  const [escalateAnchor, setEscalateAnchor] = useState<HTMLElement | null>(null);
  const [commentDraft, setCommentDraft] = useState('');
  const categoryLabel = issue ? categoryFilterTone[issue.category].label : '';
  const creator = issue?.owner?.trim() || 'Madison';
  const escalationSource = issue?.workflowIssue?.targetWorkstationTitle ?? activeWorkstationTitle;
  const escalationTargets = useMemo(() => {
    const targets = readEscalationTargetsForSource(normalizeTierTitle(escalationSource));
    return targets.length ? targets : ['Tier 2'];
  }, [escalationSource]);

  const handleEscalate = (target: string) => {
    if (!issue) return;
    onEscalate(issue, target);
    setEscalateAnchor(null);
    onEscalated();
  };

  useEffect(() => {
    if (!issue) {
      setEscalateAnchor(null);
      setCommentDraft('');
    }
  }, [issue]);

  return (
    <Dialog
      open={Boolean(issue)}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 'min(1210px, calc(100vw - 24px))',
          maxWidth: 'none',
          borderRadius: 1,
          bgcolor: '#F8F9FA',
          border: '1px solid #2B4770',
          boxShadow: '0 24px 70px rgba(15, 23, 42, 0.28)',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{px: 4, py: 2.1, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <Typography sx={{fontSize: 18, color: '#202124', fontWeight: 900}}>Issue</Typography>
        <IconButton onClick={onClose} size="small" sx={{color: '#202124'}}>
          <CloseIcon sx={{fontSize: 22}} />
        </IconButton>
      </Box>
      <Box sx={{px: 4, pb: 3, display: 'grid', gridTemplateColumns: {xs: '1fr', md: 'minmax(0, 1fr) 278px'}, gap: 1.4}}>
        <Paper elevation={0} sx={{minHeight: 440, border: '1px solid #D0D6DC', bgcolor: '#F3F6F7', borderRadius: 1.4, p: 2, display: 'grid', gridTemplateRows: 'auto auto auto auto 1fr auto', gap: 1}}>
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'minmax(0, 1fr) 198px'}, gap: 1}}>
            <IssueDetailField label="Title" value={issue?.title ?? ''} strong />
            <IssueDetailField label="Status" value={issue?.state ?? 'Open'} />
          </Box>
          <IssueDetailField label="Problem" value={buildIssueProblem(issue)} multiline />
          <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', sm: 'repeat(4, minmax(0, 1fr))'}, gap: 1}}>
            <IssueDetailField label="Category" value={categoryLabel} />
            <IssueDetailField label="Creation date" value={issue?.workflowIssue?.createdAt ?? 'Mar 16, 2026'} />
            <IssueDetailField label="Location" value={issue?.workflowIssue?.location ?? 'Line 1'} />
            <IssueDetailField label="Priority" value={issue?.priority ?? 'High'} />
          </Box>
          <IssueDetailField label="Creator" value={creator} avatar />
          <Box />
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap'}}>
            <Button variant="outlined" onClick={onClose} sx={issueOutlineButtonSx}>Close</Button>
            <Button
              variant="outlined"
              onClick={(event) => {
                setEscalateAnchor(event.currentTarget);
              }}
              sx={issueOutlineButtonSx}
            >
              Escalate
            </Button>
            <Button variant="outlined" onClick={() => issue && onCreateAction(issue)} sx={{...issueOutlineButtonSx, minWidth: 146}}>Create Action</Button>
            <Button variant="contained" onClick={onClose} sx={{height: 42, minWidth: 92, borderRadius: 1.2, bgcolor: '#145FE8', fontWeight: 900, textTransform: 'uppercase', boxShadow: '0 6px 14px rgba(20,95,232,0.28)'}}>Close</Button>
          </Box>
          <Menu anchorEl={escalateAnchor} open={Boolean(escalateAnchor)} onClose={() => setEscalateAnchor(null)}>
            {escalationTargets.map((target) => (
              <MenuItem key={target} onClick={() => handleEscalate(target)}>
                {target}
              </MenuItem>
            ))}
          </Menu>
        </Paper>
        <Paper elevation={0} sx={{minHeight: 440, border: '1px solid #D0D6DC', bgcolor: '#F3F6F7', borderRadius: 1.4, p: 2, display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 1}}>
          <Typography sx={{fontSize: 16, color: '#202124', fontWeight: 900}}>Comments</Typography>
          <Box />
          <TextField
            size="small"
            fullWidth
            placeholder="Leave a Comment"
            value={commentDraft}
            onChange={(event) => setCommentDraft(event.target.value)}
            InputProps={{
              endAdornment: <SendRoundedIcon sx={{fontSize: 25, color: '#145FE8'}} />,
            }}
            sx={{'& .MuiOutlinedInput-root': {height: 40, borderRadius: 1.2, bgcolor: '#FFFFFF'}}}
          />
        </Paper>
      </Box>
    </Dialog>
  );
}

const issueOutlineButtonSx = {
  height: 42,
  minWidth: 92,
  borderRadius: 1.2,
  borderColor: '#8BB5FF',
  color: '#145FE8',
  fontWeight: 900,
  textTransform: 'uppercase',
};

function IssueDetailField({
  avatar = false,
  label,
  multiline = false,
  strong = false,
  value,
}: {
  avatar?: boolean;
  label: string;
  multiline?: boolean;
  strong?: boolean;
  value: string;
}) {
  return (
    <Box sx={{minHeight: multiline ? 102 : 62, border: '1px solid #D0D6DC', borderRadius: 1.4, bgcolor: '#EEF3F4', px: 1.4, py: 1, minWidth: 0}}>
      <Typography sx={{fontSize: 12, color: '#848B93', lineHeight: 1.1}}>{label}</Typography>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.45, minWidth: 0}}>
        {avatar ? (
          <Avatar sx={{width: 20, height: 20, bgcolor: '#F5C6A8', color: '#3D2415', fontSize: 9, fontWeight: 900}}>
            {value.split(' ').map((part) => part[0]).join('').slice(0, 2)}
          </Avatar>
        ) : null}
        <Typography sx={{fontSize: strong ? 20 : 14, color: '#202124', fontWeight: strong ? 900 : 400, lineHeight: multiline ? 1.5 : 1.25, overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {value}
        </Typography>
      </Box>
    </Box>
  );
}

function buildIssueProblem(issue: IssueBoardItem | null) {
  if (!issue) return '';
  if (issue.workflowIssue) return issue.detail;
  const details = issue.detail.replace(/\.\.\.$/, '').trim();
  if (issue.id === 'OI-002') {
    return 'Component Tolerance out of specification was noted during the most recent analysis. The evaluation indicated that one or more elements within the component assembly did not meet the expected alignment parameters defined in the current specifications.';
  }
  return `${details} requires review and containment before the next handoff. The team should confirm the expected condition, document the impact, and assign follow-up before closure.`;
}

function IssueBoardLegend() {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.4, flexWrap: 'wrap', color: '#898D94', fontSize: 12}}>
      <LegendPriority color="#34C759" label="Low Priority" />
      <LegendPriority color="#FF9D00" label="Medium Priority" />
      <LegendPriority color="#FF4038" label="High Priority" />
      <LegendStatus label="Open" />
      <LegendStatus active label="Delayed" />
      <LegendStatus outlined label="Escalated" />
    </Box>
  );
}

function LegendPriority({color, label}: {color: string; label: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35}}>
      <Box sx={{width: 4, height: 14, borderRadius: 999, bgcolor: color}} />
      {label}
    </Box>
  );
}

function LegendStatus({active = false, label, outlined = false}: {active?: boolean; label: string; outlined?: boolean}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35}}>
      <Box sx={{width: 19, height: 19, borderRadius: 0.5, border: outlined ? '1px solid #FF4038' : '1px solid #DDDDDD', bgcolor: active ? '#FF5A5F' : '#FFFFFF', color: active ? '#FFFFFF' : outlined ? '#FF4038' : '#898D94', display: 'grid', placeItems: 'center', fontSize: 11, lineHeight: 1}}>
        a
      </Box>
      {label}
    </Box>
  );
}

function renderTableColumnCell(columnId: ActionTrackerTableColumnId, row: ActionTrackerItem, compact: boolean, isLastColumn: boolean) {
  if (columnId === 'id') {
    return <Cell compact={compact} isLastColumn={isLastColumn}>{row.id}</Cell>;
  }

  if (columnId === 'category') {
    return (
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: isLastColumn ? 'none' : `1px solid ${actionTrackerTableCellBorderColor}`, px: 0.6, height: '100%'}}>
        <ActionCategoryBadge category={row.category} />
      </Box>
    );
  }

  if (columnId === 'source') {
    return <Cell compact={compact} isLastColumn={isLastColumn} sx={{fontWeight: 700, color: '#41536E'}}>{row.source}</Cell>;
  }

  if (columnId === 'dateShift') {
    return (
      <Box sx={{px: 1, borderRight: isLastColumn ? 'none' : `1px solid ${actionTrackerTableCellBorderColor}`, minWidth: 0}}>
        <Typography sx={{fontSize: compact ? 11 : 12.5, color: '#202124', fontWeight: 500}}>
          {row.creationDate}
        </Typography>
        <Typography sx={{fontSize: compact ? 10 : 11, color: '#6B7280', fontWeight: 600, lineHeight: 1.2}}>
          {row.shift}
        </Typography>
      </Box>
    );
  }

  if (columnId === 'problem') {
    return <Cell compact={compact} ellipsis isLastColumn={isLastColumn}>{row.problem}</Cell>;
  }

  if (columnId === 'suggestedActions') {
    return <Cell compact={compact} isLastColumn={isLastColumn}>{row.suggestedActions}</Cell>;
  }

  if (columnId === 'due') {
    return <Cell compact={compact} isLastColumn={isLastColumn}>{row.dueDate}</Cell>;
  }

  if (columnId === 'assignedTo') {
    return <PersonCell compact={compact} name={row.assignedTo} isLastColumn={isLastColumn} />;
  }

  if (columnId === 'supportNeeded') {
    return <Cell compact={compact} isLastColumn={isLastColumn}>{row.supportNeeded}</Cell>;
  }

  return (
    <Box sx={{px: 1, display: 'flex', justifyContent: 'center', borderRight: isLastColumn ? 'none' : `1px solid ${actionTrackerTableCellBorderColor}`, height: '100%', alignItems: 'center'}}>
      <StatusChip status={row.status} compact={compact} />
    </Box>
  );
}

function Cell({children, compact, ellipsis = false, isLastColumn = false, sx = {}}: {children: ReactNode; compact: boolean; ellipsis?: boolean; isLastColumn?: boolean; sx?: object}) {
  return (
    <Typography
      sx={{
        px: 1.15,
        borderRight: isLastColumn ? 'none' : `1px solid ${actionTrackerTableCellBorderColor}`,
        fontSize: compact ? 11 : 12.5,
        color: '#202124',
        lineHeight: compact ? 1.35 : 1.45,
        whiteSpace: ellipsis ? 'nowrap' : 'normal',
        overflow: ellipsis ? 'hidden' : 'visible',
        textOverflow: ellipsis ? 'ellipsis' : 'clip',
        minWidth: 0,
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

function PersonCell({compact, name, isLastColumn = false}: {compact: boolean; name: string; isLastColumn?: boolean}) {
  return (
    <Box sx={{px: 1.15, borderRight: isLastColumn ? 'none' : `1px solid ${actionTrackerTableCellBorderColor}`, display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0, height: '100%'}}>
      <Avatar sx={{width: compact ? 19 : 22, height: compact ? 19 : 22, bgcolor: '#F5C6A8', color: '#3D2415', fontSize: 10, fontWeight: 900}}>
        {name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
      </Avatar>
      <Typography sx={{fontSize: compact ? 11 : 12.5, color: '#202124', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>
        {name}
      </Typography>
    </Box>
  );
}

export function CategoryFilterDot({
  active,
  category,
  onClick,
  readOnly = false,
}: {
  active: boolean;
  category: ActionCategory;
  onClick: () => void;
  readOnly?: boolean;
}) {
  const tone = categoryFilterTone[category];
  return (
    <ButtonBase
      onClick={onClick}
      disabled={readOnly}
      sx={{
        width: 30,
        height: 30,
        minWidth: 30,
        borderRadius: '50%',
        border: `1px solid ${active || readOnly ? `color-mix(in srgb, ${tone.color} 33%, transparent)` : '#D9E2EF'}`,
        bgcolor: active || readOnly ? tone.tint : '#FFFFFF',
        color: tone.color,
        opacity: 1,
        cursor: readOnly ? 'default' : 'pointer',
        boxShadow: active || readOnly
          ? `inset 0 0 0 1px ${tone.ring}, 0 6px 12px ${tone.glow}`
          : 'none',
        transition: 'transform 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease, border-color 0.16s ease',
        '&:hover': {
          bgcolor: tone.tint,
          color: tone.color,
          transform: readOnly ? 'none' : 'translateY(-1px)',
          boxShadow: `inset 0 0 0 1px ${tone.ring}, 0 6px 12px ${tone.glow}`,
        },
        '&:disabled': {
          borderColor: `color-mix(in srgb, ${tone.color} 33%, transparent)`,
          color: '#445368',
          opacity: 1,
          bgcolor: tone.tint,
          boxShadow: `inset 0 0 0 1px ${tone.ring}, 0 4px 10px ${tone.glow}`,
        },
      }}
    >
      <Typography
        sx={{
          fontSize: 11.5,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        {tone.letter}
      </Typography>
    </ButtonBase>
  );
}

export function ActionCategoryBadge({category}: {category: ActionCategory}) {
  const tone = categoryFilterTone[category];

  return (
    <Box
      sx={{
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: `linear-gradient(180deg, ${tone.color} 0%, color-mix(in srgb, ${tone.color} 87%, transparent) 100%)`,
        color: '#FFFFFF',
        display: 'grid',
        placeItems: 'center',
        boxShadow: `0 0 0 3px ${tone.ring}`,
      }}
    >
      <Typography sx={{fontSize: 9.5, fontWeight: 900, lineHeight: 1}}>
        {tone.letter}
      </Typography>
    </Box>
  );
}

function StatusChip({status, compact}: {status: ActionStatus; compact: boolean}) {
  const tone = statusTone[status];
  return (
    <Chip
      label={status}
      sx={{
        height: compact ? 22 : 25,
        minWidth: compact ? 58 : 74,
        bgcolor: tone.bg,
        color: tone.color,
        borderRadius: 999,
        fontSize: compact ? 10 : 11,
        fontWeight: 850,
      }}
    />
  );
}

export function ActionTrackerKanbanBoard({
  activeCategories = categoryFilterOrder,
  compact = false,
  rows,
  visibleColumnIds,
  visibleFields = ['problem', 'date', 'owner', 'priority'],
  onRowClick,
}: {
  activeCategories?: ActionCategory[];
  compact?: boolean;
  rows: ActionTrackerItem[];
  visibleColumnIds: string[];
  visibleFields?: ActionTrackerKanbanField[];
  onRowClick?: (row: ActionTrackerItem) => void;
}) {
  const activeColumns = kanbanColumns.filter((column) => visibleColumnIds.includes(column.id));
  const filteredRows = rows.filter((row) => activeCategories.includes(row.category));

  return (
    <Box sx={{height: '100%', minHeight: 0, display: 'grid', gridTemplateRows: 'minmax(0, 1fr)', overflow: 'hidden'}}>
      <Box sx={{display: 'grid', gridTemplateColumns: `repeat(${Math.max(activeColumns.length, 1)}, minmax(190px, 1fr))`, border: '1px solid #DBDDDF', borderRadius: 1.6, overflow: 'auto', minHeight: 0}}>
        {activeColumns.map((column) => (
          <Box key={column.id} sx={{borderRight: '1px solid #E5EAF2', bgcolor: '#FCFDFE'}}>
            <Box sx={{height: compact ? 35 : 38, display: 'flex', alignItems: 'center', px: 1, borderBottom: '1px solid #E5EAF2', bgcolor: '#F8FAFC'}}>
              <Chip label={column.label} sx={{height: 20, bgcolor: `color-mix(in srgb, ${column.color} 13%, transparent)`, color: column.id === 'Canceled' ? '#4B5563' : column.color, fontSize: 10, fontWeight: 800}} />
            </Box>
            <Box sx={{p: 1.1, display: 'flex', flexDirection: 'column', gap: 1.1}}>
              {filteredRows.filter((row) => row.status === column.id).map((row) => {
                const tone = getPriorityTone(row.priority);
                return (
                  <Paper
                    key={`${column.id}-${row.id}-${row.title}`}
                    elevation={0}
                    onClick={() => onRowClick?.(row)}
                    sx={{
                      position: 'relative',
                      minHeight: compact ? 100 : 112,
                      p: 1.25,
                      pl: 1.7,
                      border: '1px solid #DBE3F4',
                      borderRadius: 1.8,
                      bgcolor: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease',
                      '&::before': {content: '""', position: 'absolute', left: 0, top: 12, bottom: 12, width: 3, bgcolor: tone, borderRadius: 3},
                      '&:hover': onRowClick ? {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 10px 24px rgba(15,23,42,0.10)',
                        borderColor: '#93C5FD',
                      } : undefined,
                    }}
                  >
                    <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                        <ActionCategoryBadge category={row.category} />
                        <Typography sx={{fontSize: 9.5, color: '#A3AAB8'}}>{row.id}</Typography>
                      </Box>
                      {visibleFields.includes('priority') ? <Typography sx={{fontSize: 10, color: tone, fontWeight: 800}}>{row.priority}</Typography> : null}
                    </Box>
                    {visibleFields.includes('problem') ? <Typography sx={{fontSize: 12, color: '#111827', fontWeight: 900, lineHeight: 1.35, mt: 0.6}}>{row.title}</Typography> : null}
                    <Typography sx={{fontSize: 10, color: '#64748B', mt: 0.45}}>Source: {row.source}</Typography>
                    {visibleFields.includes('shift') || visibleFields.includes('dueDate') || visibleFields.includes('supportNeeded') ? (
                      <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.8}}>
                        {visibleFields.includes('shift') ? <Typography sx={{fontSize: 10, color: '#64748B'}}>Shift: {row.shift}</Typography> : null}
                        {visibleFields.includes('dueDate') ? <Typography sx={{fontSize: 10, color: '#64748B'}}>Due: {row.dueDate}</Typography> : null}
                        {visibleFields.includes('supportNeeded') ? <Typography sx={{fontSize: 10, color: '#64748B'}}>{row.supportNeeded}</Typography> : null}
                      </Box>
                    ) : null}
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2}}>
                      {visibleFields.includes('owner') ? (
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
                          <Avatar sx={{width: 19, height: 19, fontSize: 9, bgcolor: '#FFE1D5', color: '#7C2D12'}}>{row.assignedTo[0]}</Avatar>
                          <Typography sx={{fontSize: 10.5, color: '#374151'}}>{row.assignedTo}</Typography>
                        </Box>
                      ) : <Box />}
                      {visibleFields.includes('date') ? <Typography sx={{fontSize: 10.5, color: row.priority === 'High' ? '#F04438' : '#111827'}}>{row.creationDate}</Typography> : null}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
