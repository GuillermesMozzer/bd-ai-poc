import { useEffect, useState } from 'react';
import { type AppScreen } from '../../navigation/navigationConfig';
import { type HomeSiteScope } from '../../aiHome/types';
import {
  getPresetSnapshotForWorkstationTitle,
  publishCurrentWorkstation,
  readPublishedWorkstations,
} from '../publishedWorkstations';
import {
  hasAppliedWorkstationDefaults,
  hasStoredWorkstationViewState,
  markWorkstationDefaultsApplied,
  restorePublishedWorkstationSnapshot,
} from '../workstationViewState';
import {
  workstationDefaultWorkstreamApps,
  workstationPredefinedApps,
} from '../constants';
import {
  DEFAULT_HEADER_HIERARCHY_SELECTION_ID,
  deriveHomeSiteScopeFromHierarchy,
  findHeaderHierarchyPath,
} from '../../navigation/headerHierarchy';

const headerHierarchySelectionStorageKey = 'bd-header-hierarchy-selection-v1';
const headerHierarchyFavoritesStorageKey = 'bd-header-hierarchy-favorites-v1';
const lastOpenedWorkstationStorageKey = 'bd-last-opened-workstation-v1';
const DEFAULT_WORKSTATION_ID = 'sample-maintenance-technician';
const operatorCristianDefaultsRevision = '20260713-operator-cristian-overview-expanded-no-scroll-layout';

function readStoredLastOpenedWorkstationId() {
  if (typeof window === 'undefined') return DEFAULT_WORKSTATION_ID;
  const raw = window.localStorage.getItem(lastOpenedWorkstationStorageKey);
  return raw && raw.trim().length > 0 ? raw : DEFAULT_WORKSTATION_ID;
}

function readInitialScreenFromUrl(): AppScreen {
  if (typeof window === 'undefined') return 'ai_assistant';

  const normalizedPath = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const screenParam = new URLSearchParams(window.location.search).get('screen');

  if (
    normalizedPath === 'asn-portal'
    || normalizedPath === 'logistic/asn-portal'
    || screenParam === 'external_transfer_portal'
    || screenParam === 'asn_portal'
  ) {
    return 'external_transfer_portal';
  }

  return 'ai_assistant';
}

function readStoredHeaderHierarchySelection() {
  if (typeof window === 'undefined') return DEFAULT_HEADER_HIERARCHY_SELECTION_ID;
  const raw = window.localStorage.getItem(headerHierarchySelectionStorageKey);
  return raw && findHeaderHierarchyPath(raw) ? raw : DEFAULT_HEADER_HIERARCHY_SELECTION_ID;
}

function readStoredHeaderHierarchyFavorites() {
  if (typeof window === 'undefined') return [] as string[];

  try {
    const raw = window.localStorage.getItem(headerHierarchyFavoritesStorageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is string => typeof value === 'string' && Boolean(findHeaderHierarchyPath(value)));
  } catch {
    return [];
  }
}

function hasMisalignedOperatorMaintenanceWidgets(rawSavedLayout: string | null) {
  if (!rawSavedLayout) return false;

  try {
    const parsed = JSON.parse(rawSavedLayout) as { layouts?: { lg?: Array<{ i?: string; y?: number }> } };
    const largeLayout = Array.isArray(parsed.layouts?.lg) ? parsed.layouts.lg : [];
    const equipmentStatusItem = largeLayout.find((item) => item.i === 'equipment-status');
    const maintenanceCalendarItem = largeLayout.find((item) => item.i === 'maintenance-calendarwidget');
    if (typeof equipmentStatusItem?.y !== 'number' || typeof maintenanceCalendarItem?.y !== 'number') {
      return false;
    }

    return maintenanceCalendarItem.y > equipmentStatusItem.y;
  } catch {
    return false;
  }
}

function hasMisalignedMaintenanceLeaderWidgets(rawSavedLayout: string | null) {
  if (!rawSavedLayout) return false;

  try {
    const parsed = JSON.parse(rawSavedLayout) as { layouts?: Record<string, Array<{ i?: string; x?: number; y?: number; w?: number; h?: number }> | undefined> };
    return ['lg', 'md'].some((breakpoint) => {
      const layout = Array.isArray(parsed.layouts?.[breakpoint]) ? parsed.layouts[breakpoint] : [];
      const maintenanceCalendarItem = layout.find((item) => item.i === 'maintenance-calendarwidget');
      const maintenanceAnalyticsItem = layout.find((item) => item.i === 'maintenance-analytics');
      if (
        typeof maintenanceCalendarItem?.x !== 'number'
        || typeof maintenanceCalendarItem?.y !== 'number'
        || typeof maintenanceCalendarItem?.w !== 'number'
        || typeof maintenanceCalendarItem?.h !== 'number'
        || typeof maintenanceAnalyticsItem?.x !== 'number'
        || typeof maintenanceAnalyticsItem?.y !== 'number'
        || typeof maintenanceAnalyticsItem?.w !== 'number'
        || typeof maintenanceAnalyticsItem?.h !== 'number'
      ) {
        return false;
      }

      return maintenanceCalendarItem.x !== 0
        || maintenanceCalendarItem.y !== 9
        || maintenanceCalendarItem.w !== 6
        || maintenanceCalendarItem.h !== 14
        || maintenanceAnalyticsItem.x !== 6
        || maintenanceAnalyticsItem.y !== 9
        || maintenanceAnalyticsItem.w !== 6
        || maintenanceAnalyticsItem.h !== 14;
    });
  } catch {
    return false;
  }
}

function hasLegacyMaintenancePlannerLayout(rawSavedLayout: string | null) {
  if (!rawSavedLayout) return false;

  try {
    const parsed = JSON.parse(rawSavedLayout) as { layouts?: Record<string, Array<{ i?: string }> | undefined> };
    const layouts = Object.values(parsed.layouts ?? {});
    const hasShiftSchedule = layouts.some((layout) => (
      Array.isArray(layout) && layout.some((item) => item.i === 'shift-schedule')
    ));
    const hasSparePartsMonitor = layouts.some((layout) => (
      Array.isArray(layout) && layout.some((item) => item.i === 'spare-parts-monitor')
    ));
    return hasShiftSchedule || !hasSparePartsMonitor;
  } catch {
    return false;
  }
}

function hasMisalignedOperatorCristianWidgets(rawSavedLayout: string | null) {
  if (!rawSavedLayout) return false;

  try {
    const parsed = JSON.parse(rawSavedLayout) as {
      hiddenWidgetIds?: unknown;
      layouts?: { lg?: Array<{ i?: string; x?: number; y?: number; w?: number; h?: number }> };
    };
    const hiddenWidgetIds = Array.isArray(parsed.hiddenWidgetIds) ? parsed.hiddenWidgetIds : [];
    const requiredWidgetIds = [
      'text-box-main',
      'line-status-overview',
      'text-box-cockpit',
      'safety-operator',
      'quality-operator',
      'oee-line-overview',
      'shift-schedule',
      'my-tasks',
      'my-activities-kpis',
      'oee-top-losses',
      'quick-actions',
      'three-d-view',
      'shift-logbook',
    ];
    if (requiredWidgetIds.some((widgetId) => hiddenWidgetIds.includes(widgetId))) {
      return true;
    }

    const largeLayout = Array.isArray(parsed.layouts?.lg) ? parsed.layouts.lg : [];
    const layoutById = new Map(largeLayout.map((item) => [item.i, item]));
    if (requiredWidgetIds.some((widgetId) => !layoutById.has(widgetId))) {
      return true;
    }

    return false;
  } catch {
    return true;
  }
}

function isOperatorCristianWorkstationIdentifier(identifier?: string | null) {
  const normalizedIdentifier = (identifier ?? '').trim().toLowerCase();
  return normalizedIdentifier === 'operator-view-cristian'
    || normalizedIdentifier === 'operator view cristian'
    || normalizedIdentifier === 'operator view - cristian';
}

function getOperatorCristianDefaultsRevisionStorageKey(layoutStorageKey: string) {
  return `${layoutStorageKey}::operator-cristian-defaults-revision`;
}

function markOperatorCristianDefaultsRevisionApplied(layoutStorageKey: string) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getOperatorCristianDefaultsRevisionStorageKey(layoutStorageKey), operatorCristianDefaultsRevision);
}

type OpenPredefinedWorkstationOptions = {
  seedNcIssue?: boolean;
};

type SmartSearchLaunchPreset = 'columbus-west-site';

type SmartSearchLaunchState = {
  autoRun?: boolean;
  draftQuery: string;
  focusHierarchyId?: string;
  hierarchySeedId?: string;
  preset?: SmartSearchLaunchPreset;
};

interface UseWorkstationActionsProps {
  setCurrentScreen?: (screen: AppScreen) => void; // Optional now that we handle it internally
  loggedInUserName: string;
}

export const useWorkstationActions = ({
  setCurrentScreen: externalSetCurrentScreen,
  loggedInUserName,
}: UseWorkstationActionsProps) => {
  const [currentScreen, internalSetCurrentScreen] = useState<AppScreen>(readInitialScreenFromUrl);
  const setCurrentScreen = (screen: AppScreen) => {
    internalSetCurrentScreen(screen);
    if (externalSetCurrentScreen) externalSetCurrentScreen(screen);
  };

  const [isSideNavExpanded, setIsSideNavExpanded] = useState(false);
  const [isMobileSideNavOpen, setIsMobileSideNavOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [aiDrawerWidth, setAiDrawerWidth] = useState(430);
  const [homeViewMode, setHomeViewMode] = useState<'widgets' | 'chatbot'>('chatbot');
  const [selectedHeaderHierarchyId, setSelectedHeaderHierarchyIdState] = useState(readStoredHeaderHierarchySelection);
  const [favoriteHeaderHierarchyIds, setFavoriteHeaderHierarchyIds] = useState<string[]>(readStoredHeaderHierarchyFavorites);
  const [homeSiteScope, setHomeSiteScope] = useState<HomeSiteScope>(
    () => deriveHomeSiteScopeFromHierarchy(readStoredHeaderHierarchySelection()),
  );

  const [isWorkstationSubMenuOpen, setIsWorkstationSubMenuOpen] = useState(false);
  const [activeWorkstationLayoutKey, setActiveWorkstationLayoutKey] = useState('workstation-dashboard-layout-v12');
  const [activeWorkstationId, setActiveWorkstationId] = useState<string | null>(null);
  const [isAppLibraryOpen, setIsAppLibraryOpen] = useState(false);
  const [smartSearchLaunchState, setSmartSearchLaunchState] = useState<SmartSearchLaunchState | null>(null);
  const [activePredefinedWorkstationTitle, setActivePredefinedWorkstationTitle] = useState<string | null>(null);
  const [activeTier1NcIssueSeed, setActiveTier1NcIssueSeed] = useState(false);
  const [activeTier1NcIssueEscalated, setActiveTier1NcIssueEscalated] = useState(false);
  const [activeTier1NcIssueEscalationTarget, setActiveTier1NcIssueEscalationTarget] = useState<string | null>(null);
  const [isActiveWorkstationDraftEmpty, setIsActiveWorkstationDraftEmpty] = useState(false);
  const [workstationCreateName, setWorkstationCreateName] = useState('');
  const [workstationCreateStreams, setWorkstationCreateStreams] = useState<string[]>(['Doc Manager', 'Action Tracker']);
  const [lastOpenedWorkstationId, setLastOpenedWorkstationId] = useState<string>(readStoredLastOpenedWorkstationId);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(lastOpenedWorkstationStorageKey, lastOpenedWorkstationId);
  }, [lastOpenedWorkstationId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(headerHierarchySelectionStorageKey, selectedHeaderHierarchyId);
  }, [selectedHeaderHierarchyId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(headerHierarchyFavoritesStorageKey, JSON.stringify(favoriteHeaderHierarchyIds));
  }, [favoriteHeaderHierarchyIds]);

  const setSelectedHeaderHierarchyId = (nodeId: string) => {
    if (!findHeaderHierarchyPath(nodeId)) return;
    setSelectedHeaderHierarchyIdState(nodeId);
    setHomeSiteScope(deriveHomeSiteScopeFromHierarchy(nodeId));
  };

  const toggleFavoriteHeaderHierarchyId = (nodeId: string) => {
    if (!findHeaderHierarchyPath(nodeId)) return;
    setFavoriteHeaderHierarchyIds((current) => (
      current.includes(nodeId) ? current.filter((item) => item !== nodeId) : [nodeId, ...current]
    ));
  };

  const launchSmartSearch = (launchState: SmartSearchLaunchState) => {
    if (launchState.focusHierarchyId && findHeaderHierarchyPath(launchState.focusHierarchyId)) {
      setSelectedHeaderHierarchyId(launchState.focusHierarchyId);
    }
    setSmartSearchLaunchState(launchState);
    setCurrentScreen('smart_search');
  };

  const clearSmartSearchLaunchState = () => {
    setSmartSearchLaunchState(null);
  };

  const openBlankWorkstationDraft = () => {
    const draftKey = `my-workstation-draft-${Date.now()}`;
    setActiveWorkstationLayoutKey(draftKey);
    setActiveWorkstationId(null);
    setActivePredefinedWorkstationTitle(null);
    setActiveTier1NcIssueSeed(false);
    setIsActiveWorkstationDraftEmpty(true);
    setWorkstationCreateStreams(workstationDefaultWorkstreamApps);
    setIsWorkstationSubMenuOpen(false);
    setCurrentScreen('my_workstation');
  };

  const openDefaultPersonalWorkstation = () => {
    setActiveWorkstationLayoutKey('my-workstation-dashboard-layout-v1');
    setActiveWorkstationId(null);
    setActivePredefinedWorkstationTitle(null);
    setActiveTier1NcIssueSeed(false);
    setIsActiveWorkstationDraftEmpty(false);
    setWorkstationCreateStreams(workstationDefaultWorkstreamApps);
    setIsWorkstationSubMenuOpen(false);
    setCurrentScreen('my_workstation');
  };

  const openPredefinedWorkstation = (title: string, options: OpenPredefinedWorkstationOptions = {}) => {
    const normalizedTitle = title
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'blank-template';
    const templateKey = `my-workstation-template-${normalizedTitle}`;
    const presetSnapshot = getPresetSnapshotForWorkstationTitle(title);
    const isPresetTemplate = presetSnapshot !== null;

    if (typeof window !== 'undefined' && isPresetTemplate) {
      const isOperatorCristianTemplate = isOperatorCristianWorkstationIdentifier(title);
      const rawSavedLayout = window.localStorage.getItem(templateKey);
      const shouldRestoreSnapshot = isOperatorCristianTemplate
        ? (!hasAppliedWorkstationDefaults(templateKey) && !hasStoredWorkstationViewState(templateKey))
          || hasMisalignedOperatorCristianWidgets(rawSavedLayout)
        : true;

      if (shouldRestoreSnapshot) {
        restorePublishedWorkstationSnapshot(templateKey, presetSnapshot);
      }
      markWorkstationDefaultsApplied(templateKey);
      if (isOperatorCristianTemplate) {
        markOperatorCristianDefaultsRevisionApplied(templateKey);
      }
    }

    setActiveWorkstationLayoutKey(templateKey);
    setActiveWorkstationId(null);
    setActivePredefinedWorkstationTitle(title);
    setActiveTier1NcIssueSeed(title === 'Tier 1' && Boolean(options.seedNcIssue));
    setIsActiveWorkstationDraftEmpty(false);
    setWorkstationCreateStreams(workstationPredefinedApps[title] ?? workstationDefaultWorkstreamApps);
    setIsWorkstationSubMenuOpen(false);
    setCurrentScreen('my_workstation');
  };

  const createWorkstationFromTopMenu = () => {
    const draftKey = `my-workstation-draft-${Date.now()}`;
    const trimmedTitle = workstationCreateName.trim();
    const title = trimmedTitle || `Workstation ${new Date().toLocaleDateString()}`;
    const normalizedDomains = workstationCreateStreams.map((stream) => stream.toLowerCase().replace(/[^a-z0-9]+/g, '_'));

    const published = publishCurrentWorkstation({
      author: loggedInUserName.trim() || 'BLU.AI User',
      title,
      layoutStorageKey: draftKey,
      domains: normalizedDomains.length ? normalizedDomains : ['shopfloor', 'actions'],
      apps: workstationCreateStreams,
    });

    const restoredKey = `my-workstation-open-${published.id}`;
    if (typeof window !== 'undefined') {
      restorePublishedWorkstationSnapshot(restoredKey, published.snapshot ?? null);
    }

    setActiveWorkstationLayoutKey(restoredKey);
    setActiveWorkstationId(published.id);
    setActivePredefinedWorkstationTitle(null);
    setActiveTier1NcIssueSeed(false);
    setIsActiveWorkstationDraftEmpty(false);
    setIsWorkstationSubMenuOpen(true);
    setIsAppLibraryOpen(false);
    setCurrentScreen('my_workstation');
    setWorkstationCreateName('');
  };

  const openPublishedWorkstation = (workstationId?: string) => {
    if (!workstationId) {
      openDefaultPersonalWorkstation();
      return;
    }

    setLastOpenedWorkstationId(workstationId);

    const workstation = readPublishedWorkstations().find((item) => item.id === workstationId);
    const restoredKey = `my-workstation-open-${workstationId}`;
    if (workstation && typeof window !== 'undefined') {
      const rawSavedLayout = window.localStorage.getItem(restoredKey);
      let shouldRestoreSnapshot = !hasAppliedWorkstationDefaults(restoredKey) && !hasStoredWorkstationViewState(restoredKey);

      if (!shouldRestoreSnapshot && !hasAppliedWorkstationDefaults(restoredKey) && rawSavedLayout) {
        try {
          const parsed = JSON.parse(rawSavedLayout) as { hiddenWidgetIds?: unknown };
          const hiddenWidgetIds = Array.isArray(parsed.hiddenWidgetIds) ? parsed.hiddenWidgetIds : [];
          shouldRestoreSnapshot = hiddenWidgetIds.length >= 23;
        } catch {
          shouldRestoreSnapshot = true;
        }
      }

      if (!shouldRestoreSnapshot && rawSavedLayout) {
        try {
          const parsed = JSON.parse(rawSavedLayout) as { layouts?: { lg?: Array<{ i?: string; h?: number }> } };
          const largeLayout = Array.isArray(parsed.layouts?.lg) ? parsed.layouts.lg : [];
          const actionTrackerItem = largeLayout.find((item) => item.i === 'action-tracker');
          const escalationTagsItem = largeLayout.find((item) => item.i === 'escalation-tags');
          shouldRestoreSnapshot = (actionTrackerItem?.h ?? 0) <= 6 || (escalationTagsItem?.h ?? 0) <= 3;
        } catch {
          shouldRestoreSnapshot = true;
        }
      }

      if (!shouldRestoreSnapshot && workstationId === 'sample-operator-view') {
        shouldRestoreSnapshot = hasMisalignedOperatorMaintenanceWidgets(rawSavedLayout);
      }

      if (!shouldRestoreSnapshot && workstationId === 'sample-maintenance-leader') {
        shouldRestoreSnapshot = hasMisalignedMaintenanceLeaderWidgets(rawSavedLayout);
      }

      if (!shouldRestoreSnapshot && workstationId === 'sample-maintenance-planner') {
        shouldRestoreSnapshot = hasLegacyMaintenancePlannerLayout(rawSavedLayout);
      }

      if (!shouldRestoreSnapshot && workstationId === 'operator-view-cristian') {
        shouldRestoreSnapshot = hasMisalignedOperatorCristianWidgets(rawSavedLayout);
      }

      if (shouldRestoreSnapshot) {
        restorePublishedWorkstationSnapshot(restoredKey, workstation.snapshot ?? null);
      }

      markWorkstationDefaultsApplied(restoredKey);
      if (workstationId === 'operator-view-cristian') {
        markOperatorCristianDefaultsRevisionApplied(restoredKey);
      }
    }

    setActiveWorkstationLayoutKey(restoredKey);
    setActiveWorkstationId(workstationId);
    const resolvedPredefinedTitle = workstation && Object.keys(workstationPredefinedApps).includes(workstation.title)
      ? workstation.title
      : null;
    setActivePredefinedWorkstationTitle(resolvedPredefinedTitle);
    setActiveTier1NcIssueSeed(false);
    setIsActiveWorkstationDraftEmpty(false);
    setWorkstationCreateStreams(workstation?.apps?.length ? workstation.apps : workstationDefaultWorkstreamApps);
    setIsWorkstationSubMenuOpen(true);
    setCurrentScreen('my_workstation');
  };

  const goToLastWorkstation = () => {
    openPublishedWorkstation(lastOpenedWorkstationId || DEFAULT_WORKSTATION_ID);
  };

  const toggleWorkstationCreateStream = (stream: string) => {
    setWorkstationCreateStreams((prev) => (
      prev.includes(stream) ? prev.filter((item) => item !== stream) : [...prev, stream]
    ));
  };

  return {
    isWorkstationSubMenuOpen,
    setIsWorkstationSubMenuOpen,
    activeWorkstationLayoutKey,
    setActiveWorkstationLayoutKey,
    activeWorkstationId,
    setActiveWorkstationId,
    activePredefinedWorkstationTitle,
    setActivePredefinedWorkstationTitle,
    activeTier1NcIssueSeed,
    setActiveTier1NcIssueSeed,
    activeTier1NcIssueEscalated,
    setActiveTier1NcIssueEscalated,
    activeTier1NcIssueEscalationTarget,
    setActiveTier1NcIssueEscalationTarget,
    isActiveWorkstationDraftEmpty,
    setIsActiveWorkstationDraftEmpty,
    workstationCreateName,
    setWorkstationCreateName,
    workstationCreateStreams,
    setWorkstationCreateStreams,
    openPredefinedWorkstation,
    createWorkstationFromTopMenu,
    openPublishedWorkstation,
    goToLastWorkstation,
    lastOpenedWorkstationId,
    openBlankWorkstationDraft,
    toggleWorkstationCreateStream,
    currentScreen,
    setCurrentScreen,
    isSideNavExpanded,
    setIsSideNavExpanded,
    isMobileSideNavOpen,
    setIsMobileSideNavOpen,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    aiDrawerWidth,
    setAiDrawerWidth,
    homeViewMode,
    setHomeViewMode,
    homeSiteScope,
    setHomeSiteScope,
    selectedHeaderHierarchyId,
    setSelectedHeaderHierarchyId,
    favoriteHeaderHierarchyIds,
    toggleFavoriteHeaderHierarchyId,
    isAppLibraryOpen,
    setIsAppLibraryOpen,
    smartSearchLaunchState,
    launchSmartSearch,
    clearSmartSearchLaunchState,
  };
};
