import { useState, useMemo, useCallback } from 'react';
import { useActionTrackerItems } from '../../workstation/components/actionTrackerStore';
import { type ActionTrackerRow, type ActionTrackerCategory, type ActionTrackerCreateContext } from '../types';
import { type AppScreen } from '../../navigation/navigationConfig';
import {
  actionTrackerReferenceDate,
  getActionTrackerVisibleStatus,
  isActionTrackerOverdue,
  isActionTrackerPendingMyAction,
} from '../utils';
import {toggleActionTrackerSummaryFilter, type ActionTrackerSummaryFilter} from '../kpiSections';

interface UseActionTrackerActionsProps {
  setCurrentScreen: (screen: AppScreen) => void;
  currentUserName: string;
}

type OpenActionTrackerScreenOptions = {
  summaryFilter?: ActionTrackerSummaryFilter | null;
  view?: 'table' | 'kanban';
};

export const useActionTrackerActions = ({ setCurrentScreen, currentUserName }: UseActionTrackerActionsProps) => {
  const {items, createAction} = useActionTrackerItems(currentUserName);
  const [isActionFilterModalOpen, setIsActionFilterModalOpen] = useState(false);
  const [actionTrackerView, setActionTrackerView] = useState<'table' | 'kanban'>('table');
  const [isActionCreateDrawerOpen, setIsActionCreateDrawerOpen] = useState(false);
  const [selectedActionTrackerItem, setSelectedActionTrackerItem] = useState<ActionTrackerRow | null>(null);
  const [isActionExtendDialogOpen, setIsActionExtendDialogOpen] = useState(false);
  const [actionExtendDueDate, setActionExtendDueDate] = useState('Apr 04, 2026');
  const [actionExtendJustification, setActionExtendJustification] = useState('');
  const [isActionReassignDialogOpen, setIsActionReassignDialogOpen] = useState(false);
  const [actionReassignAssignee, setActionReassignAssignee] = useState('Ethan Walker');
  const [actionReassignJustification, setActionReassignJustification] = useState('');
  const [actionTrackerCommentInput, setActionTrackerCommentInput] = useState('');
  const [actionTrackerBoardCategoryFilter, setActionTrackerBoardCategoryFilter] = useState<ActionTrackerCategory | ''>('');
  const [actionCreateSuggestionSeed, setActionCreateSuggestionSeed] = useState<any>(null);
  const [actionCreateContext, setActionCreateContext] = useState<ActionTrackerCreateContext | null>(null);
  const [activeSummaryFilter, setActiveSummaryFilter] = useState<ActionTrackerSummaryFilter>(null);

  const [actionCreateForm, setActionCreateForm] = useState({
    title: '',
    problem: '',
    source: '',
    type: '',
    category: '',
    priority: '',
    machine: '',
    location: '',
    dueDate: '',
    assignedTo: '',
    approvers: '',
    supportNeeded: false,
  });

  const [actionFilterValues, setActionFilterValues] = useState({
    searchTerm: '',
    name: '',
    title: '',
    source: [] as string[],
    status: [] as string[],
    priority: '',
    type: '',
    category: [] as string[],
    plant: [] as string[],
    area: [] as string[],
    unit: [] as string[],
    line: [] as string[],
    zone: [] as string[],
    machine: [] as string[],
    location: '',
    assignedTo: [] as string[],
    createdBy: '',
    person: '',
    creationDateFrom: '',
    creationDateTo: '',
    dueDateFrom: '',
    dueDateTo: '',
  });

  const resetActionCreateForm = useCallback(() => {
    setActionCreateForm({
      title: '',
      problem: '',
      source: '',
      type: '',
      category: '',
      priority: '',
      machine: '',
      location: '',
      dueDate: '',
      assignedTo: '',
      approvers: '',
      supportNeeded: false,
    });
  }, []);

  const closeActionCreateDrawer = useCallback(() => {
    setIsActionCreateDrawerOpen(false);
    setActionCreateContext(null);
    resetActionCreateForm();
  }, [resetActionCreateForm]);

  const saveActionFromDrawer = useCallback((draft?: any) => {
    const finalTitle = draft?.title || actionCreateForm.title;
    if (!finalTitle.trim()) return;
    if (draft) {
      createAction(draft, actionCreateContext);
    }
    closeActionCreateDrawer();
  }, [actionCreateContext, actionCreateForm.title, closeActionCreateDrawer, createAction]);

  const openIntegratedActionCreateDrawer = useCallback((context: ActionTrackerCreateContext) => {
    setSelectedActionTrackerItem(null);
    setActionCreateSuggestionSeed(null);
    setActionCreateContext(context);
    setIsActionCreateDrawerOpen(true);
  }, []);

  const clearActionFilters = useCallback(() => {
    setActionFilterValues({
      searchTerm: '',
      name: '',
      title: '',
      source: [],
      status: [],
      priority: '',
      type: '',
      category: [],
      plant: [],
      area: [],
      unit: [],
      line: [],
      zone: [],
      machine: [],
      location: '',
      assignedTo: [],
      createdBy: '',
      person: '',
      creationDateFrom: '',
      creationDateTo: '',
      dueDateFrom: '',
      dueDateTo: '',
    });
  }, []);

  const isActionOverdue = useCallback((row: ActionTrackerRow) => {
    return isActionTrackerOverdue(row, actionTrackerReferenceDate);
  }, [actionTrackerReferenceDate]);

  const parseActionFilterDate = useCallback((value: string) => {
    if (!value.trim()) return null;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.getTime();
  }, []);

  const baseFilteredActionTrackerRows = useMemo(() => {
    const normalizedSearch = actionFilterValues.searchTerm.trim().toLowerCase();
    const normalizedName = actionFilterValues.name.trim().toLowerCase();
    const normalizedTitle = actionFilterValues.title.trim().toLowerCase();

    return items.filter((row) => {
      const matchesBoardCategory = !actionTrackerBoardCategoryFilter || row.category === actionTrackerBoardCategoryFilter;
      const matchesSearch = !normalizedSearch
        || row.id.toLowerCase().includes(normalizedSearch)
        || (row.externalId ?? '').toLowerCase().includes(normalizedSearch)
        || row.title.toLowerCase().includes(normalizedSearch)
        || row.problem.toLowerCase().includes(normalizedSearch)
        || row.plant.toLowerCase().includes(normalizedSearch)
        || row.area.toLowerCase().includes(normalizedSearch)
        || row.unit.toLowerCase().includes(normalizedSearch)
        || row.line.toLowerCase().includes(normalizedSearch)
        || row.zone?.toLowerCase().includes(normalizedSearch)
        || row.machine?.toLowerCase().includes(normalizedSearch)
        || row.location.toLowerCase().includes(normalizedSearch)
        || row.createdBy.toLowerCase().includes(normalizedSearch)
        || row.assignedTo.toLowerCase().includes(normalizedSearch)
        || row.reviewer.toLowerCase().includes(normalizedSearch)
        || row.approver.toLowerCase().includes(normalizedSearch)
        || row.source.toLowerCase().includes(normalizedSearch)
        || row.suggestedActions.toLowerCase().includes(normalizedSearch)
        || row.supportNeeded.toLowerCase().includes(normalizedSearch);
      const matchesName = !normalizedName
        || row.createdBy.toLowerCase().includes(normalizedName)
        || row.assignedTo.toLowerCase().includes(normalizedName);
      const matchesTitle = !normalizedTitle || row.title.toLowerCase().includes(normalizedTitle);
      const visibleStatus = getActionTrackerVisibleStatus(row, actionTrackerReferenceDate);
      const matchesSource = !actionFilterValues.source.length || actionFilterValues.source.includes(row.source);
      const matchesStatus = !actionFilterValues.status.length || actionFilterValues.status.includes(visibleStatus);
      const matchesPriority = !actionFilterValues.priority || row.priority === actionFilterValues.priority;
      const matchesType = !actionFilterValues.type || row.type === actionFilterValues.type;
      const matchesCategory = !actionFilterValues.category.length || actionFilterValues.category.includes(row.category);
      const matchesPlant = !actionFilterValues.plant.length || actionFilterValues.plant.includes(row.plant ?? '');
      const matchesArea = !actionFilterValues.area.length || actionFilterValues.area.includes(row.area ?? '');
      const matchesUnit = !actionFilterValues.unit.length || actionFilterValues.unit.includes(row.unit ?? '');
      const matchesLine = !actionFilterValues.line.length || actionFilterValues.line.includes(row.line ?? '');
      const matchesZone = !actionFilterValues.zone.length || actionFilterValues.zone.includes(row.zone ?? '');
      const matchesMachine = !actionFilterValues.machine.length || actionFilterValues.machine.includes(row.machine ?? '');
      const matchesLocation = !actionFilterValues.location || row.line.toLowerCase().includes(actionFilterValues.location.toLowerCase());
      const matchesAssignedTo = !actionFilterValues.assignedTo.length || actionFilterValues.assignedTo.includes(row.assignedTo);
      const matchesCreatedBy = !actionFilterValues.createdBy || row.createdBy === actionFilterValues.createdBy;

      const creationDate = parseActionFilterDate(row.creationDate);
      const creationDateFrom = parseActionFilterDate(actionFilterValues.creationDateFrom);
      const creationDateTo = parseActionFilterDate(actionFilterValues.creationDateTo);
      const dueDate = parseActionFilterDate(row.dueDate);
      const dueDateFrom = parseActionFilterDate(actionFilterValues.dueDateFrom);
      const dueDateTo = parseActionFilterDate(actionFilterValues.dueDateTo);

      const matchesCreationDate = (!creationDateFrom || (creationDate !== null && creationDate >= creationDateFrom))
        && (!creationDateTo || (creationDate !== null && creationDate <= creationDateTo));
      const matchesDueDate = (!dueDateFrom || (dueDate !== null && dueDate >= dueDateFrom))
        && (!dueDateTo || (dueDate !== null && dueDate <= dueDateTo));

      return (
        matchesBoardCategory
        && matchesSearch
        && matchesName
        && matchesTitle
        && matchesSource
        && matchesStatus
        && matchesPriority
        && matchesType
        && matchesCategory
        && matchesPlant
        && matchesArea
        && matchesUnit
        && matchesLine
        && matchesZone
        && matchesMachine
        && matchesLocation
        && matchesAssignedTo
        && matchesCreatedBy
        && matchesCreationDate
        && matchesDueDate
      );
    });
  }, [actionFilterValues, actionTrackerBoardCategoryFilter, items, parseActionFilterDate]);

  const filteredActionTrackerRows = useMemo(() => {
    return baseFilteredActionTrackerRows.filter((row) => {
      if (activeSummaryFilter === 'pendingMyAction') return isActionTrackerPendingMyAction(row, currentUserName);
      if (activeSummaryFilter === 'related') return row.createdBy === currentUserName || row.assignedTo === currentUserName;
      if (activeSummaryFilter === 'open') return getActionTrackerVisibleStatus(row, actionTrackerReferenceDate) === 'Open';
      if (activeSummaryFilter === 'inProgress') return row.status === 'In Progress';
      if (activeSummaryFilter === 'pendingApprovals') return row.status === 'Under Approval';
      if (activeSummaryFilter === 'completed') return row.status === 'Completed';
      if (activeSummaryFilter === 'overdue') return isActionOverdue(row);
      if (activeSummaryFilter === 'reopened') return row.status === 'Reopened';
      if (activeSummaryFilter === 'canceled') return row.status === 'Canceled';
      return true;
    });
  }, [activeSummaryFilter, baseFilteredActionTrackerRows, currentUserName, isActionOverdue]);

  const displayedActionTrackerKpis = useMemo(() => [
    { id: 'all', label: 'All Actions', value: baseFilteredActionTrackerRows.length, tone: '#60a5fa', urgent: false, active: activeSummaryFilter === 'all' || activeSummaryFilter === null },
    { id: 'pendingMyAction', label: 'Pending My Action', value: baseFilteredActionTrackerRows.filter((row) => isActionTrackerPendingMyAction(row, currentUserName)).length, tone: '#60a5fa', urgent: false, active: activeSummaryFilter === 'pendingMyAction' },
    { id: 'related', label: 'Involving Me', value: baseFilteredActionTrackerRows.filter((row) => row.createdBy === currentUserName || row.assignedTo === currentUserName).length, tone: '#60a5fa', urgent: false, active: activeSummaryFilter === 'related' },
    { id: 'open', label: 'Open', value: baseFilteredActionTrackerRows.filter((row) => row.status === 'Open').length, tone: '#60a5fa', urgent: false, active: activeSummaryFilter === 'open' },
    { id: 'inProgress', label: 'In Progress', value: baseFilteredActionTrackerRows.filter((row) => row.status === 'In Progress').length, tone: '#0f766e', urgent: false, active: activeSummaryFilter === 'inProgress' },
    { id: 'pendingApprovals', label: 'Under Approval', value: baseFilteredActionTrackerRows.filter((row) => row.status === 'Under Approval').length, tone: '#fb923c', urgent: false, active: activeSummaryFilter === 'pendingApprovals' },
    { id: 'completed', label: 'Completed', value: baseFilteredActionTrackerRows.filter((row) => row.status === 'Completed').length, tone: '#22c55e', urgent: false, active: activeSummaryFilter === 'completed' },
    { id: 'overdue', label: 'Overdue', value: baseFilteredActionTrackerRows.filter((row) => isActionOverdue(row)).length, tone: '#ef4444', urgent: true, active: activeSummaryFilter === 'overdue' },
    { id: 'reopened', label: 'Reopened', value: baseFilteredActionTrackerRows.filter((row) => row.status === 'Reopened').length, tone: '#f59e0b', urgent: false, active: activeSummaryFilter === 'reopened' },
    { id: 'canceled', label: 'Canceled', value: baseFilteredActionTrackerRows.filter((row) => row.status === 'Canceled').length, tone: '#64748b', urgent: false, active: activeSummaryFilter === 'canceled' },
  ] as const, [activeSummaryFilter, baseFilteredActionTrackerRows, currentUserName, isActionOverdue]);

  const applySummaryFilter = useCallback((filterId: ActionTrackerSummaryFilter) => {
    setActiveSummaryFilter((current) => toggleActionTrackerSummaryFilter(current, filterId));
  }, []);

  const openActionTrackerDetails = useCallback((row: ActionTrackerRow) => {
    setIsActionCreateDrawerOpen(false);
    setSelectedActionTrackerItem(row);
    setActionTrackerCommentInput('');
  }, []);

  const closeActionTrackerDetails = useCallback(() => {
    setSelectedActionTrackerItem(null);
    setActionTrackerCommentInput('');
  }, []);

  const openActionTrackerFromBoard = useCallback((category?: ActionTrackerCategory) => {
    setActionTrackerBoardCategoryFilter(category ?? '');
    setSelectedActionTrackerItem(null);
    setCurrentScreen('action_tracker');
  }, [setCurrentScreen]);

  const openActionTrackerScreen = useCallback((options?: OpenActionTrackerScreenOptions) => {
    if (options?.view) {
      setActionTrackerView(options.view === 'kanban' ? 'kanban' : 'table');
    }
    setActiveSummaryFilter(options?.summaryFilter ?? null);
    setSelectedActionTrackerItem(null);
    setCurrentScreen('action_tracker');
  }, [setCurrentScreen]);

  const openActionExtendDialog = useCallback(() => {
    setActionExtendDueDate('Apr 04, 2026');
    setActionExtendJustification('');
    setIsActionExtendDialogOpen(true);
  }, []);

  const openActionReassignDialog = useCallback(() => {
    setActionReassignAssignee('Ethan Walker');
    setActionReassignJustification('');
    setIsActionReassignDialogOpen(true);
  }, []);

  return {
    actionTrackerItems: items,
    currentUserName,
    isActionFilterModalOpen,
    setIsActionFilterModalOpen,
    actionTrackerView,
    setActionTrackerView,
    isActionCreateDrawerOpen,
    setIsActionCreateDrawerOpen,
    selectedActionTrackerItem,
    setSelectedActionTrackerItem,
    isActionExtendDialogOpen,
    setIsActionExtendDialogOpen,
    actionExtendDueDate,
    setActionExtendDueDate,
    actionExtendJustification,
    setActionExtendJustification,
    isActionReassignDialogOpen,
    setIsActionReassignDialogOpen,
    actionReassignAssignee,
    setActionReassignAssignee,
    actionReassignJustification,
    setActionReassignJustification,
    actionTrackerCommentInput,
    setActionTrackerCommentInput,
    actionTrackerBoardCategoryFilter,
    setActionTrackerBoardCategoryFilter,
    activeSummaryFilter,
    setActiveSummaryFilter,
    actionCreateSuggestionSeed,
    setActionCreateSuggestionSeed,
    actionCreateContext,
    setActionCreateContext,
    actionCreateForm,
    setActionCreateForm,
    actionFilterValues,
    setActionFilterValues,
    resetActionCreateForm,
    closeActionCreateDrawer,
    saveActionFromDrawer,
    clearActionFilters,
    isActionOverdue,
    baseFilteredActionTrackerRows,
    filteredActionTrackerRows,
    displayedActionTrackerKpis,
    applySummaryFilter,
    openActionTrackerDetails,
    closeActionTrackerDetails,
    openActionTrackerFromBoard,
    openActionTrackerScreen,
    openIntegratedActionCreateDrawer,
    openActionExtendDialog,
    openActionReassignDialog,
  };
};
