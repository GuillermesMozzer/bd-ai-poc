import { useMemo, useState } from 'react';
import { customNotificationRules, notificationAlerts } from '../../data/mockData';
import { type AppScreen } from '../../navigation/navigationConfig';
import { type CustomNotificationRule, type NotificationAlert } from '../types';
import { type AppUserRole } from '../../utils/user';
import {
  createDefaultWidgetNotificationState,
  formatWidgetNotificationFrequency,
  getWidgetNotificationConfigById,
  getWidgetNotificationConfigByLabel,
  summarizeWidgetNotificationScope,
  summarizeWidgetNotificationTrigger,
  writeStoredWidgetNotificationState,
  type WidgetNotificationConfig,
  type WidgetNotificationState,
} from '../../workstation/components/WidgetNotifications';

type AlertsTab = 'inbox' | 'team' | 'configurations';
type AlertPeriod = '24h' | '7d' | '30d' | 'all';
type AlertOrder = 'recent' | 'oldest' | 'severity';

interface AlertFilters {
  assignee: string;
  module: string;
  period: AlertPeriod;
  priority: string;
  search: string;
  site: string;
  status: string;
  team: string;
}

interface UseNotificationActionsProps {
  currentUserName: string;
  currentUserRole: AppUserRole;
  setCurrentScreen: (screen: AppScreen) => void;
}

const defaultFilters: AlertFilters = {
  assignee: 'All',
  module: 'All',
  period: '30d',
  priority: 'All',
  search: '',
  site: 'All',
  status: 'All',
  team: 'All',
};

const severityRank: Record<NotificationAlert['severity'], number> = {
  critical: 0,
  warning: 1,
  info: 2,
  success: 3,
};

const priorityRank: Record<NotificationAlert['priority'], number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

const periodToMs: Record<Exclude<AlertPeriod, 'all'>, number> = {
  '24h': 24 * 60 * 60 * 1000,
  '7d': 7 * 24 * 60 * 60 * 1000,
  '30d': 30 * 24 * 60 * 60 * 1000,
};

const normalize = (value: string) => value.trim().toLowerCase();

const createOptions = (items: string[]) => ['All', ...Array.from(new Set(items.filter(Boolean))).sort((left, right) => left.localeCompare(right))];

const formatAlertTime = (createdAt: string) => {
  const deltaMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.max(1, Math.round(deltaMs / (60 * 1000)));
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  if (hours < 48) return 'Yesterday';
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const periodMatches = (createdAt: string, period: AlertPeriod) => (
  period === 'all' || Date.now() - new Date(createdAt).getTime() <= periodToMs[period]
);

const alertMatchesFilters = (alert: NotificationAlert, filters: AlertFilters) => {
  const searchTerm = normalize(filters.search);
  const haystack = [
    alert.reference,
    alert.title,
    alert.message,
    alert.source,
    alert.category,
    alert.location,
    alert.owner,
    alert.employee,
    alert.assignee,
    alert.site,
    alert.line,
    alert.team,
    alert.relatedPerson ?? '',
    ...alert.details.map((detail) => `${detail.label} ${detail.value}`),
  ].join(' ').toLowerCase();

  return periodMatches(alert.createdAt, filters.period)
    && (!searchTerm || haystack.includes(searchTerm))
    && (filters.status === 'All' || alert.status === filters.status)
    && (filters.module === 'All' || alert.source === filters.module)
    && (filters.priority === 'All' || alert.priority === filters.priority)
    && (filters.site === 'All' || alert.site === filters.site)
    && (filters.team === 'All' || alert.team === filters.team)
    && (filters.assignee === 'All' || alert.assignee === filters.assignee);
};

const sortAlerts = (alerts: NotificationAlert[], order: AlertOrder) => (
  [...alerts].sort((left, right) => {
    if (order === 'oldest') {
      return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
    }
    if (order === 'severity') {
      const severityDelta = severityRank[left.severity] - severityRank[right.severity];
      if (severityDelta !== 0) return severityDelta;
      const priorityDelta = priorityRank[left.priority] - priorityRank[right.priority];
      if (priorityDelta !== 0) return priorityDelta;
    }
    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  })
);

const buildRuleConfig = (rule: CustomNotificationRule) => (
  (rule.widgetId ? getWidgetNotificationConfigById(rule.widgetId) : undefined)
  ?? getWidgetNotificationConfigByLabel(rule.sourceWidget)
);

const buildRuleDraftState = (rule: CustomNotificationRule, config: WidgetNotificationConfig): WidgetNotificationState => {
  const defaults = createDefaultWidgetNotificationState(config);
  return {
    selectedEventIds: rule.selectedEventIds?.length ? [...rule.selectedEventIds] : defaults.selectedEventIds,
    deliveryIds: rule.deliveryIds?.length ? [...rule.deliveryIds] : defaults.deliveryIds,
    frequency: rule.frequencyId ?? defaults.frequency,
    filters: {
      ...defaults.filters,
      ...rule.filters,
    },
    savedRuleName: rule.name || defaults.savedRuleName,
  };
};

const updateRuleFromDraft = (
  rule: CustomNotificationRule,
  config: WidgetNotificationConfig,
  draftState: WidgetNotificationState,
  status: CustomNotificationRule['status'],
): CustomNotificationRule => ({
  ...rule,
  name: draftState.savedRuleName.trim() || rule.name,
  widgetId: config.widgetId,
  sourceWidget: config.widgetLabel,
  triggerCondition: summarizeWidgetNotificationTrigger(config, draftState),
  scope: summarizeWidgetNotificationScope(draftState.filters),
  frequency: formatWidgetNotificationFrequency(draftState.frequency),
  frequencyId: draftState.frequency,
  status,
  selectedEventIds: [...draftState.selectedEventIds],
  deliveryIds: [...draftState.deliveryIds],
  filters: { ...draftState.filters },
});

export const useNotificationActions = ({
  currentUserName,
  currentUserRole,
  setCurrentScreen,
}: UseNotificationActionsProps) => {
  const [dismissedAlertIds, setDismissedAlertIds] = useState<string[]>([]);
  const [selectedNotificationAlertId, setSelectedNotificationAlertId] = useState<string>('N-4101');
  const [currentAlertsTab, setCurrentAlertsTab] = useState<AlertsTab>('inbox');
  const [alertOrder, setAlertOrder] = useState<AlertOrder>('recent');
  const [expandedAlertIds, setExpandedAlertIds] = useState<string[]>(['N-4101']);
  const [customRules, setCustomRules] = useState<CustomNotificationRule[]>(customNotificationRules);
  const [editingCustomRuleId, setEditingCustomRuleId] = useState<string | null>(null);
  const [editingCustomRuleWidgetId, setEditingCustomRuleWidgetId] = useState<string | null>(null);
  const [editingCustomRuleDraft, setEditingCustomRuleDraft] = useState<WidgetNotificationState | null>(null);
  const [editingCustomRuleStatus, setEditingCustomRuleStatus] = useState<CustomNotificationRule['status']>('Active');
  const [filtersByTab, setFiltersByTab] = useState<Record<AlertsTab, AlertFilters>>({
    inbox: defaultFilters,
    team: defaultFilters,
    configurations: defaultFilters,
  });

  const activeAlerts = useMemo(
    () => notificationAlerts.filter((alert) => !dismissedAlertIds.includes(alert.id)),
    [dismissedAlertIds]
  );

  const currentUserNameNormalized = normalize(currentUserName);
  const hasMyTeamAccess = currentUserRole === 'leader' || currentUserRole === 'director';

  const isAssignedToCurrentUser = (alert: NotificationAlert) =>
    alert.assignedTo.some((assignee) => normalize(assignee) === currentUserNameNormalized)
    || alert.assignedRoles?.includes(currentUserRole)
    || false;

  const inboxAlerts = useMemo(
    () => activeAlerts.filter((alert) => alert.audience === 'inbox' && isAssignedToCurrentUser(alert)),
    [activeAlerts, currentUserRole, currentUserNameNormalized]
  );

  const myTeamAlerts = useMemo(
    () => activeAlerts.filter((alert) => alert.audience === 'team' && hasMyTeamAccess && isAssignedToCurrentUser(alert)),
    [activeAlerts, currentUserRole, currentUserNameNormalized, hasMyTeamAccess]
  );

  const baseAlertsByTab = {
    inbox: inboxAlerts,
    team: myTeamAlerts,
    configurations: [],
  } satisfies Record<AlertsTab, NotificationAlert[]>;

  const currentFilters = filtersByTab[currentAlertsTab];

  const filteredConfigurationRules = useMemo(() => {
    const searchTerm = normalize(currentFilters.search);
    return [...customRules]
      .filter((rule) => {
        const haystack = [
          rule.name,
          rule.sourceWidget,
          rule.triggerCondition,
          rule.scope,
          rule.frequency,
          rule.status,
          rule.createdBy,
          rule.lastTriggered,
        ].join(' ').toLowerCase();

        return (!searchTerm || haystack.includes(searchTerm))
          && (currentFilters.status === 'All' || rule.status === currentFilters.status)
          && (currentFilters.module === 'All' || rule.sourceWidget === currentFilters.module);
      })
      .sort((left, right) => right.createdDate.localeCompare(left.createdDate));
  }, [currentFilters.module, currentFilters.search, currentFilters.status, customRules]);

  const filteredAlerts = useMemo(
    () => sortAlerts(baseAlertsByTab[currentAlertsTab].filter((alert) => alertMatchesFilters(alert, currentFilters)), alertOrder),
    [alertOrder, baseAlertsByTab, currentAlertsTab, currentFilters]
  );

  const selectedNotificationAlert = useMemo(() => {
    if (selectedNotificationAlertId === '') return null;
    return filteredAlerts.find((alert) => alert.id === selectedNotificationAlertId) ?? filteredAlerts[0] ?? null;
  }, [filteredAlerts, selectedNotificationAlertId]);

  const alertsPreviewRows = useMemo(() => sortAlerts(inboxAlerts, 'recent').slice(0, 5), [inboxAlerts]);
  const alertsPreviewCount = inboxAlerts.length;

  const currentTabBaseAlerts = baseAlertsByTab[currentAlertsTab];
  const currentTabFilteredAlerts = currentAlertsTab === 'configurations' ? [] : filteredAlerts;

  const filterOptions = useMemo(() => {
    if (currentAlertsTab === 'configurations') {
      return {
        assignee: ['All'],
        module: createOptions(customRules.map((rule) => rule.sourceWidget)),
        priority: ['All'],
        site: ['All'],
        status: ['All', 'Active', 'Paused'],
        team: ['All'],
      };
    }

    const tabAlerts = currentTabBaseAlerts;
    return {
      assignee: createOptions(tabAlerts.map((alert) => alert.assignee)),
      module: createOptions(tabAlerts.map((alert) => alert.source)),
      priority: ['All', 'High', 'Medium', 'Low'],
      site: createOptions(tabAlerts.map((alert) => alert.site)),
      status: createOptions(tabAlerts.map((alert) => alert.status)),
      team: createOptions(tabAlerts.map((alert) => alert.team)),
    };
  }, [currentTabBaseAlerts]);

  const updateCurrentTabFilter = <K extends keyof AlertFilters>(key: K, value: AlertFilters[K]) => {
    setFiltersByTab((current) => ({
      ...current,
      [currentAlertsTab]: {
        ...current[currentAlertsTab],
        [key]: value,
      },
    }));
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlertIds((current) => (current.includes(alertId) ? current : [...current, alertId]));
    setExpandedAlertIds((current) => current.filter((id) => id !== alertId));
  };

  const toggleAlertExpanded = (alertId: string) => {
    setExpandedAlertIds((current) => (
      current.includes(alertId) ? current.filter((id) => id !== alertId) : [...current, alertId]
    ));
    setSelectedNotificationAlertId(alertId);
  };

  const resetCurrentTabFilters = () => {
    setFiltersByTab((current) => ({
      ...current,
      [currentAlertsTab]: defaultFilters,
    }));
  };

  const setCurrentTab = (tab: AlertsTab) => {
    setCurrentAlertsTab(tab);
    setAlertOrder(tab === 'team' ? 'severity' : 'recent');
  };

  const openAlertFromPreview = (alert: NotificationAlert) => {
    setCurrentTab(alert.audience);
    setFiltersByTab((current) => ({
      ...current,
      [alert.audience]: defaultFilters,
    }));
    setSelectedNotificationAlertId(alert.id);
    setExpandedAlertIds((current) => (current.includes(alert.id) ? current : [...current, alert.id]));
    setCurrentScreen('notification_dashboard');
  };

  const expandAlertsDashboard = () => {
    setCurrentTab('inbox');
    setFiltersByTab((current) => ({
      ...current,
      inbox: defaultFilters,
    }));
    setCurrentScreen('notification_dashboard');
  };

  const openAlertWorkflow = (alert: NotificationAlert) => {
    setCurrentScreen(alert.workflowScreen as AppScreen);
  };

  const toggleCustomNotificationRuleStatus = (ruleId: string) => {
    setCustomRules((current) => current.map((rule) => (
      rule.id === ruleId
        ? { ...rule, status: rule.status === 'Active' ? 'Paused' : 'Active' }
        : rule
    )));
  };

  const deleteCustomNotificationRule = (ruleId: string) => {
    setCustomRules((current) => current.filter((rule) => rule.id !== ruleId));
  };

  const editingCustomRule = useMemo(
    () => customRules.find((rule) => rule.id === editingCustomRuleId) ?? null,
    [customRules, editingCustomRuleId]
  );

  const editingCustomRuleConfig = useMemo(() => {
    if (!editingCustomRule) return null;
    if (editingCustomRuleWidgetId) {
      return getWidgetNotificationConfigById(editingCustomRuleWidgetId) ?? buildRuleConfig(editingCustomRule);
    }
    return buildRuleConfig(editingCustomRule);
  }, [editingCustomRule, editingCustomRuleWidgetId]);

  const openCustomNotificationRuleEditor = (ruleId: string) => {
    const rule = customRules.find((candidate) => candidate.id === ruleId);
    if (!rule) return;
    const config = buildRuleConfig(rule);
    if (!config) return;
    setEditingCustomRuleId(rule.id);
    setEditingCustomRuleWidgetId(config.widgetId);
    setEditingCustomRuleDraft(buildRuleDraftState(rule, config));
    setEditingCustomRuleStatus(rule.status);
  };

  const closeCustomNotificationRuleEditor = () => {
    setEditingCustomRuleId(null);
    setEditingCustomRuleWidgetId(null);
    setEditingCustomRuleDraft(null);
    setEditingCustomRuleStatus('Active');
  };

  const updateEditingCustomRuleWidget = (widgetId: string) => {
    const nextConfig = getWidgetNotificationConfigById(widgetId);
    if (!nextConfig) return;
    setEditingCustomRuleWidgetId(widgetId);
    setEditingCustomRuleDraft((current) => {
      if (!current) return createDefaultWidgetNotificationState(nextConfig);
      const defaults = createDefaultWidgetNotificationState(nextConfig);
      const allowedEventIds = new Set(nextConfig.events.map((event) => event.id));
      const nextSelectedEvents = current.selectedEventIds.filter((eventId) => allowedEventIds.has(eventId));
      return {
        ...current,
        selectedEventIds: nextSelectedEvents.length > 0 ? nextSelectedEvents : defaults.selectedEventIds,
        savedRuleName: current.savedRuleName,
      };
    });
  };

  const applyEditingCustomRuleSuggestion = () => {
    if (!editingCustomRuleConfig) return;
    setEditingCustomRuleDraft((current) => {
      const baseState = current ?? createDefaultWidgetNotificationState(editingCustomRuleConfig);
      return {
        ...baseState,
        selectedEventIds: [...editingCustomRuleConfig.suggestion.eventIds],
        deliveryIds: [...editingCustomRuleConfig.suggestion.deliveryIds],
        frequency: editingCustomRuleConfig.suggestion.frequency,
        filters: {
          ...baseState.filters,
          ...editingCustomRuleConfig.suggestion.filters,
        },
        savedRuleName: editingCustomRuleConfig.suggestion.savedRuleName ?? baseState.savedRuleName,
      };
    });
  };

  const saveEditingCustomRule = () => {
    if (!editingCustomRule || !editingCustomRuleConfig || !editingCustomRuleDraft) return;
    const updatedRule = updateRuleFromDraft(
      editingCustomRule,
      editingCustomRuleConfig,
      editingCustomRuleDraft,
      editingCustomRuleStatus,
    );
    setCustomRules((current) => current.map((rule) => (
      rule.id === updatedRule.id ? updatedRule : rule
    )));
    writeStoredWidgetNotificationState(editingCustomRuleConfig, editingCustomRuleDraft);
    closeCustomNotificationRuleEditor();
  };

  const currentTabKpis = useMemo(() => {
    const alerts = currentTabFilteredAlerts;
    return {
      totalActive: alerts.length,
      criticalAlerts: alerts.filter((alert) => alert.severity === 'critical' || alert.priority === 'High').length,
      pendingApprovals: alerts.filter((alert) => alert.status === 'Pending').length,
      shiftSwapRequests: alerts.filter((alert) => alert.category.toLowerCase().includes('shift') || alert.message.toLowerCase().includes('swap')).length,
      trainingDue: alerts.filter((alert) => alert.source === 'Training').length,
      overdueMaintenance: alerts.filter((alert) => alert.source === 'Maintenance' && alert.status === 'Overdue').length,
      coverageGaps: alerts.filter((alert) => alert.category.toLowerCase().includes('coverage')).length,
      timeOffPending: alerts.filter((alert) => alert.category.toLowerCase().includes('time off') || alert.message.toLowerCase().includes('time off')).length,
    };
  }, [currentTabFilteredAlerts]);

  const highlightedTeamAlerts = useMemo(
    () => sortAlerts(myTeamAlerts, 'severity').slice(0, 3),
    [myTeamAlerts]
  );

  const notificationPriorityBreakdown = useMemo(
    () => ['High', 'Medium', 'Low'].map((priority) => ({
      priority,
      value: inboxAlerts.filter((alert) => alert.priority === priority).length,
    })),
    [inboxAlerts]
  );

  const notificationStatusBreakdown = useMemo(
    () => [
      { status: 'New', value: inboxAlerts.filter((alert) => alert.status === 'New' || alert.status === 'Pending').length },
      { status: 'Resolved', value: dismissedAlertIds.length },
    ],
    [dismissedAlertIds.length, inboxAlerts]
  );

  const notificationSourceChartData = useMemo(() => {
    const sourceMap = inboxAlerts.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.source] = (acc[alert.source] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(sourceMap).map(([source, value]) => ({ source, value }));
  }, [inboxAlerts]);

  const notificationOwnerBreakdown = useMemo(() => {
    const ownerMap = inboxAlerts.reduce<Record<string, number>>((acc, alert) => {
      acc[alert.owner] = (acc[alert.owner] ?? 0) + 1;
      return acc;
    }, {});
    return Object.entries(ownerMap)
      .map(([owner, value]) => ({ owner, value }))
      .sort((left, right) => right.value - left.value);
  }, [inboxAlerts]);

  return {
    activeNotificationAlerts: inboxAlerts,
    alertFilters: currentFilters,
    alertOrder,
    alertsPreviewCount,
    alertsPreviewRows,
    currentAlertsTab,
    currentTabFilteredAlerts,
    currentTabKpis,
    dismissAlert,
    expandAlertsDashboard,
    expandedAlertIds,
    filterOptions,
    filteredAlerts,
    formatAlertTime,
    hasMyTeamAccess,
    highlightedTeamAlerts,
    inboxAlerts,
    myTeamAlerts,
    customNotificationRules: customRules,
    filteredConfigurationRules,
    editingCustomRuleConfig,
    editingCustomRuleDraft,
    editingCustomRuleStatus,
    notificationOwnerBreakdown,
    notificationPriorityBreakdown,
    notificationSourceChartData,
    notificationStatusBreakdown,
    openAlertFromPreview,
    openAlertWorkflow,
    openAlertWorkflowFromId: (alertId: string) => {
      const alert = activeAlerts.find((candidate) => candidate.id === alertId);
      if (alert) openAlertWorkflow(alert);
    },
    resetCurrentTabFilters,
    resolveSelectedNotificationAlert: () => {
      if (selectedNotificationAlert) dismissAlert(selectedNotificationAlert.id);
    },
    resolvedNotificationAlertIds: dismissedAlertIds,
    selectedNotificationAlert,
    selectedNotificationAlertId,
    setAlertOrder,
    setCurrentAlertsTab: setCurrentTab,
    setSelectedNotificationAlertId,
    setEditingCustomRuleDraft,
    setEditingCustomRuleStatus,
    toggleCustomNotificationRuleStatus,
    toggleAlertExpanded,
    updateCurrentTabFilter,
    deleteCustomNotificationRule,
    openCustomNotificationRuleEditor,
    closeCustomNotificationRuleEditor,
    applyEditingCustomRuleSuggestion,
    saveEditingCustomRule,
    updateEditingCustomRuleWidget,
  };
};
