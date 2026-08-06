import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { activeTheme } from './theme';
import MainLayout from './navigation/MainLayout';
import { AppRoutes } from './navigation/AppRoutes';
import { useActionTrackerContext } from './actionTracker/contexts/ActionTrackerContext';
import { useShiftManagementContext } from './shiftManagement/contexts/ShiftManagementContext';
import { useWorkstationContext } from './workstation/contexts/WorkstationContext';
import { useNotificationContext } from './shopfloor/contexts/NotificationContext';
import { useAiChat } from './aiHome/hooks/useAiChat';
import { type AiPriorityCard } from './aiHome/types';
import { useTechnicianMaintenanceRequestGuide } from './aiHome/hooks/useTechnicianMaintenanceRequestGuide';
import {
  buildTechnicianDrawerIntroMessages,
  buildTechnicianDrawerPriorityCards,
  isMaintenanceRequestIntent,
} from './aiHome/contexts/technicianAssistantIntro';
import {
  shiftMemberProfiles,
  shiftScheduleWeekDays,
  shiftScheduleShiftRows,
  shiftScheduleEntries,
  shiftScheduleAiInsights,
  shiftSchedulePendingSwap,
  staffingSignals,
  shiftLogItems,
  tierMeetingCards,
  actionTrackerItems
} from './data/mockData';
import { teamManagementMembers } from './shiftManagement/data/teamData';
import { getUrgentAiTasks, homeSiteOptions } from './aiHome/data';
import { type ArtifactDetail } from './shopfloor/types';
import { type TeamManagementMember } from './shiftManagement/types/teamTypes';
import { getActiveNavigationKey } from './navigation/navigationConfig';
import { useAiContext } from './aiHome/contexts/AiContext';
import ShiftNavigationHeader from './shiftManagement/components/ShiftNavigationHeader';
import { useAuthContext } from './auth/contexts/AuthContext';
import { shiftLogbookEntries } from './shiftManagement/data/logbookData';
import { readPublishedWorkstations } from './workstation/publishedWorkstations';
import {
  isOperatorWorkstation,
  OPERATOR_WORKSTATION_TOUR_COMPLETE_EVENT,
  startOperatorWorkstationTour,
} from './workstation/onboarding/operatorWorkstationOnboarding';
import { workstationLine10Data } from './workstation/data/workstationMockData';
import {
  MY_TASKS_COMPLETE_TASK_EVENT,
  MY_TASKS_START_TASK_EVENT,
  consolidatedTasks,
} from './workstation/components/MyTasksWidget';

const ShiftEntry = lazy(() => import('./shiftEntry/ShiftEntry'));
const WorkstationSubMenu = lazy(() => import('./workstation/components/WorkstationSubMenu'));
const AppLibraryDrawer = lazy(() => import('./workstation/components/AppLibraryDrawer'));
const ShiftLogbookDrawers = lazy(() => import('./shiftManagement/components/ShiftLogbookDrawers'));
const AiCopilotDrawer = lazy(() => import('./aiHome/components/AiCopilotDrawer'));
const ActionTrackerCreateDrawer = lazy(() => import('./workstation/components/ActionTrackerCreateDrawer'));
const ActionTrackerDetailsDialog = lazy(() => import('./workstation/components/ActionTrackerDetailsDialog'));

type ContextualAiAssistantPayload = {
  contextTitle: string;
  contextSubtitle: string;
  problemFilter?: string;
  openingText: string;
  autoRunActionIndex?: number;
  preserveConversation?: boolean;
  executionGuide?: {
    mode: 'CIL' | 'Centerline' | 'Changeover';
    taskId?: string;
    steps: Array<{
      id: string;
      code: string;
      title: string;
      detail: string;
      unit?: string;
      min?: number;
      target?: number;
      max?: number;
      requiresImageProof?: boolean;
    }>;
  };
  openingCards?: Array<{
    id: string;
    title: string;
    signal: string;
    detail: string;
    rank: number;
    dueDate?: string;
    assignedTo?: string;
    priority?: string;
    accent?: string;
    inputStepId?: string;
    inputCode?: string;
    inputUnit?: string;
    inputPlaceholder?: string;
    inputLabel?: string;
    inputActionLabel?: string;
    rangeLabel?: string;
    evidenceLabel?: string;
  }>;
  quickActions: Array<{
    label: string;
    prompt: string;
    response: string;
    responseCards?: Array<{
      id: string;
      title: string;
      signal: string;
      detail: string;
      rank: number;
      dueDate?: string;
      assignedTo?: string;
      priority?: string;
      accent?: string;
      inputStepId?: string;
      inputCode?: string;
      inputUnit?: string;
      inputPlaceholder?: string;
      inputLabel?: string;
      inputActionLabel?: string;
      rangeLabel?: string;
      evidenceLabel?: string;
    }>;
    followUpActions?: Array<{
      label: string;
      category: string;
      searchTerm?: string;
      mode?: 'logbook' | 'workstation-maintenance-request' | 'execution-comment' | 'execution-open-instructions' | 'execution-complete-step' | 'execution-report-issue';
      description?: string;
      commentText?: string;
      stepId?: string;
    }>;
  }>;
};

export default function AppContent() {
  const {
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
    isAppLibraryOpen,
    setIsAppLibraryOpen,
    homeViewMode,
    setHomeViewMode,
    homeSiteScope,
    setHomeSiteScope,
    selectedHeaderHierarchyId,
    setSelectedHeaderHierarchyId,
    favoriteHeaderHierarchyIds,
    toggleFavoriteHeaderHierarchyId,
    launchSmartSearch,
    activeWorkstationLayoutKey,
    activeWorkstationId,
    isActiveWorkstationDraftEmpty,
    workstationCreateStreams,
    openBlankWorkstationDraft,
    openPublishedWorkstation,
    openPredefinedWorkstation,
    goToLastWorkstation,
  } = useWorkstationContext();

  const openWorkstationAppFromSubmenu = (appName: string) => {
    const map: Record<string, any> = {
      'Doc Manager': 'document_management',
      'Control Tower': 'control_tower',
      'Action Tracker': 'action_tracker',
      'Shift Logbook': 'shift_logbook',
      'Shift Handover': 'shift_logbook',
      'Maintenance': 'maintenance_hub',
      'Maintenance Planner Calendar': 'maintenance_planner',
      'Maintenance Calendar': 'maintenance_calendar',
      'Follow-up board': 'maintenance_followup',
      'Maintenance Follow Up Board': 'maintenance_followup',
      'Spare Parts Management': 'tool_crib',
      'Equipment Ledger': 'equipment_ledger',
      'Smart Search': 'smart_search',
      'Tier 1 Meeting': 'tier_meeting',
      'Shift Schedule': 'shift_schedule_overview',
      'Overview': 'shift_schedule_overview',
      'Production Planning': 'production_planning',
      'Global View': 'global_view',
      'BD Atlas AI': 'ai_assistant',
      'Blu.AI': 'ai_assistant',
      'CBM & PdM': 'maintenance_cbm_pdm',
      'Maintenance Analytics': 'maintenance_performance',
      'Performance': 'maintenance_performance',
      'Shift Schedule Operator': 'shift_schedule_operator',
      'Equipment Setup Changeover Operator': 'equipment_changeover_operator',
      'CIL Operator': 'cil_operator',
      'Centerline Operator': 'centerline_operator',
      'CIL': 'cil_kpis',
      'Centerline': 'centerline_kpis',
      'CIL & Centerline Operator': 'cil_centerline_operator',
      'Ai Assistant': 'ai_assistant',
      'Logistics Control Tower': 'logistics_control_tower',
      'ASN Portal': 'external_transfer_portal',
      'Quality Release': 'quality_release',
      'Shipment Readiness': 'shipment_readiness',
      'Pallet Load Check': 'pallet_verification',
      'Sterilization Tracker': 'sterilization_tracker',
      'Guided Tasks': 'guided_tasks',
      'Job Readiness': 'job_readiness',
      'Production Alerts': 'production_alerts',
      'Machine Material Status': 'machine_status',
      'WIP Control Tower': 'wip_control_tower',
      'Sterilization / Outbound CT': 'sterilization_outbound_control_tower',
    };
    if (map[appName]) {
      if (appName === 'Blu.AI' || appName === 'BD Atlas AI') setHomeViewMode('chatbot');
      setCurrentScreen(map[appName]);
    }
  };

  const {
    logbook: {
      isShiftEntryOpen,
      setIsShiftEntryOpen,
      shiftEntryMode,
      setShiftEntryMode,
      shiftEntryMaintenancePrefill,
      setShiftEntryMaintenancePrefill,
      setShiftLogbookCategory,
      setShiftLogbookSearch,
      closeShiftLogbookMaintenanceReview,
      closeShiftLogbookRcaFlow,
      closeShiftLogbookFishboneWorkspace,
      closeShiftLogbookFaultTreeWorkspace,
      setIsShiftLogbookSourceDrawerOpen,
      handleShiftLogbookEsoSaved,
    },
    teamManagement: {
      teamManagementFilters,
      teamManagementSearch,
      teamManagementLineView,
      selectedTeamManagementMemberName,
      setSelectedTeamManagementMemberName,
      setIsTeamDraftDialogOpen,
    },
    teamShiftDefinitions,
    setRenderShiftSchedulePersistentActions,
    schedule: {
      orgChartDraft,
    },
    settings: {
      createShiftRequest,
    },
  } = useShiftManagementContext();

  useEffect(() => {
    setRenderShiftSchedulePersistentActions(() => () => (
      <ShiftNavigationHeader
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
      />
    ));
  }, [currentScreen, setCurrentScreen, setRenderShiftSchedulePersistentActions]);

  const {
    selectedActionTrackerItem,
    closeActionTrackerDetails,
    closeActionCreateDrawer,
    setActionTrackerBoardCategoryFilter,
  } = useActionTrackerContext();

  const {
    currentUserName,
    currentUserRole,
  } = useAuthContext();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const screen = params.get('screen');
    const chatbot = params.get('chatbot');

    if (screen) {
      setCurrentScreen(screen as any);
    }

    if (chatbot === '1') {
      setHomeViewMode('chatbot');
      setCurrentScreen('ai_assistant');
    }
  }, [setCurrentScreen, setHomeViewMode]);

  const [aiMessages, setAiMessages] = useState<any[]>([]);
  const [homeChatInput, setHomeChatInput] = useState('');
  const [aiProblemFilterInput, setAiProblemFilterInput] = useState('');
  const [aiProblemFilter, setAiProblemFilter] = useState('');
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactDetail | null>(null);
  const [productionPlanningResetKey, setProductionPlanningResetKey] = useState(0);
  const operatorWorkstationIntroRef = useRef<string | null>(null);
  const operatorWorkstationIntroTimersRef = useRef<number[]>([]);
  const executionGuideRef = useRef<(ContextualAiAssistantPayload['executionGuide'] & {currentStepIndex: number}) | null>(null);
  const pendingExecutionCommentRef = useRef<{stepId?: string; code?: string; title?: string} | null>(null);

  const {
    aiInput,
    setAiInput,
    handleAiSend,
    handleStartNewChat,
    handleShareChat,
    chatShareNotice,
  } = useAiChat({
    setCurrentScreen,
    setIsAiDrawerOpen,
    setSelectedArtifact,
    currentUserName,
    aiMessages,
    setAiMessages,
    homeChatInput,
    setHomeChatInput,
  });

  const getExecutionOperatorScheduleContext = useCallback(() => {
    const fallbackProfile = teamManagementMembers.find((member) => member.role === 'Operator' && member.shift === 'Morning')
      ?? teamManagementMembers[0];
    const matchedProfile = teamManagementMembers.find((member) => member.name === currentUserName) ?? fallbackProfile;
    const operatorProfile = {
      ...matchedProfile,
      name: currentUserName?.trim() || matchedProfile.name,
    } as TeamManagementMember;
    const activeShiftRow = shiftScheduleShiftRows.find((row) => row.label === operatorProfile.shift) ?? shiftScheduleShiftRows[0];
    const activeShiftId = activeShiftRow.id;
    const currentDayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][new Date().getDay()] as typeof shiftScheduleWeekDays[number]['key'];
    const todayMeta = shiftScheduleWeekDays.find((day) => day.key === currentDayKey) ?? shiftScheduleWeekDays[1];
    const nextScheduleEntry = operatorProfile.weeklySchedule.find((entry) => entry.day === todayMeta.day)
      ?? operatorProfile.weeklySchedule.find((entry) => !/off/i.test(entry.hours))
      ?? operatorProfile.weeklySchedule[0];
    const scheduleDayMeta = shiftScheduleWeekDays.find((day) => day.day === nextScheduleEntry?.day) ?? todayMeta;
    const scheduledCrew = shiftScheduleEntries[activeShiftId]?.[scheduleDayMeta.key] ?? [];
    const flaggedCrewMembers = scheduledCrew.filter((person) => person.status || person.aiSignal);
    const scheduleCoverageInsight = shiftScheduleAiInsights[`${activeShiftId}-${scheduleDayMeta.key}`]
      ?? shiftScheduleAiInsights['afternoon-wed']
      ?? shiftScheduleAiInsights['afternoon-tue'];

    return {
      operatorProfile,
      activeShiftRow,
      nextScheduleEntry,
      scheduleDayMeta,
      scheduledCrew,
      flaggedCrewMembers,
      scheduleCoverageInsight,
    };
  }, [currentUserName]);

  const getShiftElapsedSummary = useCallback((hours?: string) => {
    const match = hours?.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!match) return undefined;

    const [, startHourText, startMinuteText, endHourText, endMinuteText] = match;
    const startMinutes = Number(startHourText) * 60 + Number(startMinuteText);
    let endMinutes = Number(endHourText) * 60 + Number(endMinuteText);
    if (endMinutes <= startMinutes) endMinutes += 24 * 60;

    const now = new Date();
    let nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (nowMinutes < startMinutes && endMinutes > 24 * 60) {
      nowMinutes += 24 * 60;
    }

    const durationMinutes = endMinutes - startMinutes;
    const elapsedMinutes = Math.min(Math.max(nowMinutes - startMinutes, 0), durationMinutes);
    const remainingMinutes = Math.max(durationMinutes - elapsedMinutes, 0);
    const percent = durationMinutes ? Math.round((elapsedMinutes / durationMinutes) * 100) : 0;

    return {
      elapsedHours: elapsedMinutes / 60,
      durationHours: durationMinutes / 60,
      remainingHours: remainingMinutes / 60,
      percent,
    };
  }, []);

  const buildExecutionShiftReviewCards = useCallback((): AiPriorityCard[] => {
    const {
      operatorProfile,
      activeShiftRow,
      nextScheduleEntry,
      scheduleDayMeta,
      scheduledCrew,
      flaggedCrewMembers,
      scheduleCoverageInsight,
    } = getExecutionOperatorScheduleContext();
    const elapsedSummary = getShiftElapsedSummary(nextScheduleEntry?.hours ?? activeShiftRow.hours);
    const elapsedDetail = elapsedSummary
      ? `${elapsedSummary.elapsedHours.toFixed(1)}h worked of ${elapsedSummary.durationHours.toFixed(1)}h scheduled. About ${elapsedSummary.remainingHours.toFixed(1)}h remaining.`
      : `Scheduled window: ${operatorProfile.timeWindow}.`;

    return [
      {
        id: 'execution-shift-current',
        title: `${operatorProfile.shift} shift - ${operatorProfile.line ? `Line ${operatorProfile.line}` : 'Assigned line'}`,
        signal: operatorProfile.statusDetail,
        detail: `${operatorProfile.name} is assigned to ${operatorProfile.equipment} in ${operatorProfile.zone}. ${operatorProfile.supervisorInsight}`,
        rank: 1,
        dueDate: activeShiftRow.hours,
        priority: 'My shift',
        accent: '#2563EB',
      },
      {
        id: 'execution-shift-hours',
        title: 'Hours worked',
        signal: elapsedSummary ? `${elapsedSummary.percent}% of shift` : 'Shift timing',
        detail: elapsedDetail,
        rank: 2,
        dueDate: nextScheduleEntry?.hours ?? activeShiftRow.hours,
        priority: elapsedSummary && elapsedSummary.percent >= 80 ? 'Near handoff' : 'In progress',
        accent: elapsedSummary && elapsedSummary.percent >= 80 ? '#F59E0B' : '#16A34A',
      },
      {
        id: 'execution-shift-next-block',
        title: `${nextScheduleEntry?.day ?? scheduleDayMeta.day} work block`,
        signal: nextScheduleEntry?.note ?? 'Scheduled work',
        detail: `${operatorProfile.role} coverage for ${operatorProfile.equipment}. Certifications: ${operatorProfile.certifications.map((item) => item.name).join(', ') || operatorProfile.certification}.`,
        rank: 3,
        dueDate: nextScheduleEntry?.hours ?? activeShiftRow.hours,
        priority: 'Current plan',
        accent: '#7C3AED',
      },
      {
        id: 'execution-shift-coverage',
        title: flaggedCrewMembers.length ? `${flaggedCrewMembers.length} crew signal${flaggedCrewMembers.length === 1 ? '' : 's'}` : 'Crew coverage',
        signal: flaggedCrewMembers.length ? 'Schedule watch' : 'Coverage stable',
        detail: flaggedCrewMembers.length
          ? `${flaggedCrewMembers.map((person) => `${person.name}${person.status ? `: ${person.status}` : ''}`).join(' | ')}. ${scheduleCoverageInsight?.detail ?? ''}`.trim()
          : `${scheduledCrew.length || 4} people are planned for this block. ${scheduleCoverageInsight?.title ? `${scheduleCoverageInsight.title}: ${scheduleCoverageInsight.detail}` : 'No critical schedule exception detected.'}`,
        rank: 4,
        dueDate: scheduleDayMeta.day,
        priority: flaggedCrewMembers.length ? 'Watch' : 'Stable',
        accent: flaggedCrewMembers.length ? '#EF4444' : '#16A34A',
      },
    ];
  }, [getExecutionOperatorScheduleContext, getShiftElapsedSummary]);

  const buildExecutionProductionReviewCards = useCallback((): AiPriorityCard[] => {
    const productionSnapshot = workstationLine10Data;
    const productionSummary = productionSnapshot.summary;
    const expectedByNow = Math.round((productionSummary.shiftTarget * productionSummary.shiftElapsedMinutes) / productionSummary.shiftDurationMinutes);
    const outputGap = productionSummary.currentOutput - expectedByNow;
    const latestHourlyOutput = productionSnapshot.hourlyOutput.slice(-3);
    const totalRecentOutput = latestHourlyOutput.reduce((sum, item) => sum + Number(item.output ?? 0), 0);
    const expectedRecentOutput = latestHourlyOutput.length * productionSummary.targetThroughputPerHour;
    const hourlyGap = totalRecentOutput - expectedRecentOutput;
    const latestScrapPoint = productionSnapshot.scrapTrend[productionSnapshot.scrapTrend.length - 1];
    const bottleneckProcess = [...productionSnapshot.processes].sort((left, right) => left.oee - right.oee)[0];

    return [
      {
        id: 'execution-production-running',
        title: `${productionSummary.line} - ${productionSummary.product}`,
        signal: productionSummary.workOrder,
        detail: `Running SKU ${productionSummary.sku}, batch ${productionSummary.batch}, shift ${productionSummary.shift}. Current output is ${productionSummary.currentOutput.toLocaleString()} units toward ${productionSummary.shiftTarget.toLocaleString()}.`,
        rank: 1,
        dueDate: `${productionSummary.oee}% OEE`,
        priority: productionSummary.oee >= 85 ? 'On target' : 'Below target',
        accent: productionSummary.oee >= 85 ? '#16A34A' : '#F59E0B',
      },
      {
        id: 'execution-production-output',
        title: 'Output vs plan',
        signal: outputGap >= 0 ? 'Ahead of plan' : 'Behind plan',
        detail: `${productionSummary.currentOutput.toLocaleString()} produced vs ${expectedByNow.toLocaleString()} expected by now. Last 3 hourly buckets are ${Math.abs(hourlyGap).toLocaleString()} units ${hourlyGap >= 0 ? 'ahead of' : 'behind'} run-rate.`,
        rank: 2,
        dueDate: `${productionSummary.targetThroughputPerHour.toLocaleString()}/h target`,
        priority: outputGap >= 0 ? 'Catching up' : `${Math.abs(outputGap).toLocaleString()} short`,
        accent: outputGap >= 0 ? '#16A34A' : '#EF4444',
      },
      {
        id: 'execution-production-quality',
        title: 'Quality and scrap',
        signal: `${productionSummary.quality}% quality`,
        detail: `${productionSummary.goodUnits.toLocaleString()} good units, ${productionSummary.rejectedUnits.toLocaleString()} rejected, ${productionSummary.reworkUnits.toLocaleString()} rework. Latest scrap point: ${latestScrapPoint?.label ?? 'now'} at ${latestScrapPoint?.scrap ?? productionSummary.scrapRate}%.`,
        rank: 3,
        dueDate: `${productionSummary.scrapRate}% scrap`,
        priority: productionSummary.scrapRate <= 1.5 ? 'In control' : 'Watch',
        accent: productionSummary.scrapRate <= 1.5 ? '#16A34A' : '#F59E0B',
      },
      {
        id: 'execution-production-bottleneck',
        title: bottleneckProcess ? `${bottleneckProcess.machine} bottleneck` : 'Bottleneck check',
        signal: bottleneckProcess?.status ?? 'Line status',
        detail: bottleneckProcess
          ? `${bottleneckProcess.name} is at ${bottleneckProcess.oee.toFixed(1)}% OEE with ${bottleneckProcess.downtimeMinutes} min downtime. Last stop: ${bottleneckProcess.lastStopReason}. ${productionSnapshot.alert.message}`
          : productionSnapshot.alert.message,
        rank: 4,
        dueDate: bottleneckProcess ? `${bottleneckProcess.throughputPerHour.toLocaleString()}/h` : 'Review',
        priority: bottleneckProcess?.status === 'Stopped' ? 'Needs attention' : 'Monitor',
        accent: bottleneckProcess?.status === 'Stopped' ? '#EF4444' : '#2563EB',
      },
    ];
  }, []);

  const showExecutionShiftReview = useCallback(() => {
    const {operatorProfile} = getExecutionOperatorScheduleContext();
    const shiftCards = buildExecutionShiftReviewCards();
    setCurrentScreen('shift_schedule_overview');
    setAiMessages((messages) => [
      ...messages,
      {role: 'user', text: 'Review my shift', badge: 'Operator onboarding'},
      {
        role: 'assistant',
        text: `${operatorProfile.name}, here is the shift context for your current assignment, including timing, coverage, and the next scheduled work block.`,
        variant: 'priority_cards',
        heading: 'My shift snapshot',
        badge: 'Operator onboarding',
        priorityCards: shiftCards,
        compactCards: true,
      },
    ]);
  }, [buildExecutionShiftReviewCards, getExecutionOperatorScheduleContext, setCurrentScreen]);

  const showExecutionProductionReview = useCallback(() => {
    const productionSummary = workstationLine10Data.summary;
    const productionCards = buildExecutionProductionReviewCards();
    setCurrentScreen('my_workstation');
    setAiMessages((messages) => [
      ...messages,
      {role: 'user', text: 'Check production', badge: 'Operator onboarding'},
      {
        role: 'assistant',
        text: `${productionSummary.line} is running ${productionSummary.product} (${productionSummary.sku}). Here is the current production picture with output, quality, and the active bottleneck.`,
        variant: 'priority_cards',
        heading: 'Production pulse',
        badge: 'Operator onboarding',
        priorityCards: productionCards,
        compactCards: true,
      },
    ]);
  }, [buildExecutionProductionReviewCards, setCurrentScreen]);

  const clearOperatorWorkstationIntroTimers = useCallback(() => {
    operatorWorkstationIntroTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    operatorWorkstationIntroTimersRef.current = [];
  }, []);

  useEffect(() => {
    clearOperatorWorkstationIntroTimers();

    if (currentScreen !== 'my_workstation' || !activeWorkstationId) {
      operatorWorkstationIntroRef.current = null;
      return;
    }

    const workstation = readPublishedWorkstations().find((item) => item.id === activeWorkstationId);
    if (!isOperatorWorkstation(workstation) || operatorWorkstationIntroRef.current === activeWorkstationId) return;

    operatorWorkstationIntroRef.current = activeWorkstationId;
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const rawFirstName = currentUserName.trim().split(/\s+/)[0] || '';
    const firstName = /^[A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'-]*$/.test(rawFirstName) ? rawFirstName : 'Cristian';
    const assignment = workstation?.assignmentSummary || 'Columbus West / Area A / Unit A / Line 10';
    const assignmentParts = assignment.split('/').map((part) => part.trim()).filter(Boolean);
    const [siteName = 'Columbus West', areaName = 'Area A', unitName = 'Unit A', lineName = 'Line 10'] = assignmentParts;
    const assignedZone = assignmentParts.find((part) => /zone/i.test(part)) ?? 'Zone 1';
    const assignedStation = /z\d/i.test(assignedZone) ? assignedZone : `${assignedZone} / Z1 Cutter`;
    const greetingMessage = {
      role: 'assistant',
      text: `${greeting}, ${firstName}. Your operator workstation is ready for today.`,
      variant: 'priority_summary',
      badge: 'Operator onboarding',
    };
    const assignmentMessage = {
      role: 'assistant',
      heading: "Today's assignment",
      text: 'You are assigned here today:',
      variant: 'priority_summary',
      badge: 'Operator onboarding',
      bulletItems: [
        {
          label: 'Line',
          value: lineName,
          detail: `${siteName} / ${areaName} / ${unitName}.`,
          accent: '#1F63EA',
        },
        {
          label: 'Zone',
          value: assignedStation,
          detail: 'This is your primary work area for today.',
          accent: '#7C3AED',
        },
      ],
    };
    const changeoverMessage = {
      role: 'assistant',
      heading: 'Next changeover',
      text: 'Heads up: your next changeover is planned later this shift.',
      variant: 'priority_summary',
      badge: 'Operator onboarding',
      bulletItems: [
        {
          label: 'When',
          value: 'In 3h 42m',
          detail: 'Use the time before it starts to prepare line clearance and required tools.',
          accent: '#F59E0B',
        },
        {
          label: 'Activity',
          value: 'AFA1-10 Zone 1',
          detail: 'Batch CO: AU-30 Cannula 30G to AU-30 Cannula 31G.',
          accent: '#F59E0B',
        },
      ],
    };
    const supportMessage = {
      role: 'assistant',
      text: 'I can help you stay on plan today: check the live Operator Overview first, then review Safety, Quality, My Tasks, My Schedule, and the Shift Logbook.',
      variant: 'priority_summary',
      badge: 'Operator onboarding',
    };
    const tourMessage = {
      role: 'assistant',
      text: 'Before you get started, do you want a quick guided tour? I will start with Operator Overview, then walk through Safety, Quality, My Tasks, My Schedule, and Shift Logbook.',
      variant: 'action',
      actionLabel: 'Start AI tour',
      badge: 'Operator onboarding',
      action: () => {
        clearOperatorWorkstationIntroTimers();
        setIsAiDrawerOpen(false);
        window.setTimeout(startOperatorWorkstationTour, 180);
      },
    };
    const typingMessage = (heading: string) => ({
      role: 'assistant',
      text: '',
      variant: 'typing',
      heading,
      badge: 'Operator onboarding',
    });
    const scheduleIntroStage = (delay: number, messages: any[]) => {
      const timerId = window.setTimeout(() => setAiMessages(messages), delay);
      operatorWorkstationIntroTimersRef.current.push(timerId);
    };

    setAiInput('');
    setAiProblemFilterInput('');
    setAiProblemFilter('');
    setAiDrawerWidth(520);
    setAiMessages([typingMessage('Preparing your shift')]);
    setIsAiDrawerOpen(true);

    scheduleIntroStage(700, [greetingMessage, typingMessage('Checking your assignment')]);
    scheduleIntroStage(1850, [greetingMessage, assignmentMessage, typingMessage('Checking upcoming changeover')]);
    scheduleIntroStage(3050, [greetingMessage, assignmentMessage, changeoverMessage, typingMessage('Building your quick start')]);
    scheduleIntroStage(4300, [greetingMessage, assignmentMessage, changeoverMessage, supportMessage, tourMessage]);

    return clearOperatorWorkstationIntroTimers;
  }, [
    activeWorkstationId,
    clearOperatorWorkstationIntroTimers,
    currentScreen,
    currentUserName,
    setAiDrawerWidth,
    setAiInput,
    setIsAiDrawerOpen,
  ]);

  useEffect(() => {
    const handleTourComplete = () => {
      clearOperatorWorkstationIntroTimers();
      setAiInput('');
      setAiDrawerWidth(520);
      setIsAiDrawerOpen(true);

      const baseOperatorScheduleProfile = teamManagementMembers.find((member) => member.name === currentUserName)
        ?? teamManagementMembers.find((member) => member.role === 'Operator' && member.shift === 'Morning')
        ?? teamManagementMembers[0];
      const operatorScheduleProfile = {
        ...baseOperatorScheduleProfile,
        name: currentUserName?.trim() || baseOperatorScheduleProfile.name,
      };
      const activeShiftRow = shiftScheduleShiftRows.find((row) => row.label === operatorScheduleProfile.shift) ?? shiftScheduleShiftRows[0];
      const activeShiftId = activeShiftRow.id;
      const upcomingSchedule = operatorScheduleProfile.weeklySchedule.slice(0, 5);
      const nextScheduleEntry = upcomingSchedule[0];
      const scheduleDayMeta = shiftScheduleWeekDays.find((day) => day.day === nextScheduleEntry?.day) ?? shiftScheduleWeekDays[1];
      const scheduledCrew = shiftScheduleEntries[activeShiftId]?.[scheduleDayMeta.key] ?? [];
      const flaggedCrewMembers = scheduledCrew.filter((person) => person.status || person.aiSignal);
      const scheduleCoverageInsight = shiftScheduleAiInsights[`${activeShiftId}-${scheduleDayMeta.key}`]
        ?? shiftScheduleAiInsights['afternoon-wed']
        ?? shiftScheduleAiInsights['afternoon-tue'];
      const shiftSwapCandidates = teamManagementMembers
        .filter((member) => member.name !== operatorScheduleProfile.name && member.role === operatorScheduleProfile.role)
        .slice(0, 3);
      const fallbackSwapCandidates = shiftSwapCandidates.length ? shiftSwapCandidates : teamManagementMembers.filter((member) => member.name !== operatorScheduleProfile.name).slice(0, 3);
      const shiftLeaderName = orgChartDraft.shiftLeads?.[0] ?? 'Line Lead';
      const productionSnapshot = workstationLine10Data;
      const productionSummary = productionSnapshot.summary;
      const latestHourlyOutput = productionSnapshot.hourlyOutput.slice(-3);
      const totalRecentOutput = latestHourlyOutput.reduce((sum, item) => sum + Number(item.output ?? 0), 0);
      const expectedRecentOutput = latestHourlyOutput.length * productionSummary.targetThroughputPerHour;
      const hourlyGap = totalRecentOutput - expectedRecentOutput;
      const latestScrapPoint = productionSnapshot.scrapTrend[productionSnapshot.scrapTrend.length - 1];
      const bottleneckProcess = [...productionSnapshot.processes].sort((left, right) => left.oee - right.oee)[0];

      const runDrawerNavigation = (screen: 'cil_operator' | 'centerline_operator' | 'equipment_changeover_operator' | 'shift_schedule_overview' | 'my_workstation', prompt: string) => {
        clearOperatorWorkstationIntroTimers();
        const userTypingToken = `operator-navigation-user-${Date.now()}`;
        const assistantTypingToken = `operator-navigation-assistant-${Date.now()}`;

        setAiMessages((current) => [
          ...current,
          {
            role: 'user',
            text: '',
            variant: 'typing',
            badge: 'Operator onboarding',
            operatorFollowUpToken: userTypingToken,
          },
        ]);

        const userMessageTimer = window.setTimeout(() => {
          setAiMessages((current) => [
            ...current.filter((message) => message.operatorFollowUpToken !== userTypingToken),
            {
              role: 'user',
              text: prompt,
              badge: 'Operator onboarding',
            },
            {
              role: 'assistant',
              text: '',
              variant: 'typing',
              heading: 'Opening the flow',
              badge: 'Operator onboarding',
              operatorFollowUpToken: assistantTypingToken,
            },
          ]);
        }, 420);

        const navigationTimer = window.setTimeout(() => {
          setIsAiDrawerOpen(false);
          setCurrentScreen(screen);
        }, 1550);

        operatorWorkstationIntroTimersRef.current.push(userMessageTimer, navigationTimer);
      };

      const buildShiftPlanCards = () => [
        {
          id: 'shift-schedule-current',
          title: `${operatorScheduleProfile.shift} shift • ${operatorScheduleProfile.line ? `Line ${operatorScheduleProfile.line}` : 'Assigned line'}`,
          signal: 'Shift Schedule',
          detail: `${operatorScheduleProfile.name} is scheduled ${operatorScheduleProfile.timeWindow}. Zone ${operatorScheduleProfile.zone}, equipment: ${operatorScheduleProfile.equipment}.`,
          rank: 1,
          dueDate: activeShiftRow.hours,
          priority: 'My shift',
          accent: '#2563EB',
        },
        {
          id: 'shift-schedule-next-assignment',
          title: `${nextScheduleEntry?.day ?? 'Next'} assignment`,
          signal: 'Next scheduled block',
          detail: nextScheduleEntry?.note ?? 'Review your next scheduled work block before starting operator tasks.',
          rank: 2,
          dueDate: nextScheduleEntry?.hours ?? activeShiftRow.hours,
          priority: 'Next up',
          accent: '#F59E0B',
        },
        {
          id: 'shift-schedule-crew-signal',
          title: flaggedCrewMembers.length ? `${flaggedCrewMembers.length} crew signal${flaggedCrewMembers.length > 1 ? 's' : ''} on schedule` : 'Crew coverage check',
          signal: flaggedCrewMembers.length ? 'Schedule alert' : 'Coverage stable',
          detail: flaggedCrewMembers.length
            ? flaggedCrewMembers.map((person) => `${person.name}${person.status ? `: ${person.status}` : ''}`).join(' • ')
            : `${scheduledCrew.length || 4} people are planned on this shift block.`,
          rank: 3,
          dueDate: scheduleDayMeta.day,
          priority: flaggedCrewMembers.length ? 'Watch' : 'Stable',
          accent: flaggedCrewMembers.length ? '#EF4444' : '#16A34A',
        },
        {
          id: 'shift-schedule-swap-signal',
          title: shiftSchedulePendingSwap.title,
          signal: 'Swap workflow',
          detail: `${shiftSchedulePendingSwap.from} → ${shiftSchedulePendingSwap.to}. ${shiftSchedulePendingSwap.note}.`,
          rank: 4,
          dueDate: 'Pending',
          priority: 'Actionable',
          accent: '#7C3AED',
        },
      ];

      const buildProductionLineCards = () => [
        {
          id: 'production-oee',
          title: `${productionSummary.line} OEE`,
          signal: 'Production today',
          detail: `Availability ${productionSummary.availability}% | Performance ${productionSummary.performance}% | Quality ${productionSummary.quality}%.`,
          rank: 1,
          dueDate: `${productionSummary.oee}%`,
          priority: productionSummary.oee >= 85 ? 'On target' : 'Below target',
          accent: productionSummary.oee >= 85 ? '#16A34A' : '#F59E0B',
        },
        {
          id: 'production-output',
          title: 'Production vs plan',
          signal: productionSummary.workOrder,
          detail: `${productionSummary.currentOutput.toLocaleString()} units produced vs ${Math.round((productionSummary.shiftTarget * productionSummary.shiftElapsedMinutes) / productionSummary.shiftDurationMinutes).toLocaleString()} expected by now. Shift target: ${productionSummary.shiftTarget.toLocaleString()}.`,
          rank: 2,
          dueDate: `${productionSummary.targetThroughputPerHour.toLocaleString()}/h target`,
          priority: hourlyGap >= 0 ? 'Catching up' : `${Math.abs(hourlyGap).toLocaleString()} short last 3h`,
          accent: hourlyGap >= 0 ? '#16A34A' : '#EF4444',
        },
        {
          id: 'production-scrap',
          title: 'Scrap / quality',
          signal: 'Quality signal',
          detail: `${productionSummary.rejectedUnits.toLocaleString()} rejected units and ${productionSummary.reworkUnits.toLocaleString()} rework units. Latest scrap point: ${latestScrapPoint?.label ?? 'now'} at ${latestScrapPoint?.scrap ?? productionSummary.scrapRate}%.`,
          rank: 3,
          dueDate: `${productionSummary.scrapRate}% scrap`,
          priority: productionSummary.scrapRate <= 1.5 ? 'In control' : 'Watch',
          accent: productionSummary.scrapRate <= 1.5 ? '#16A34A' : '#F59E0B',
        },
        {
          id: 'production-bottleneck',
          title: bottleneckProcess ? `${bottleneckProcess.machine} bottleneck` : 'Bottleneck check',
          signal: bottleneckProcess?.status ?? 'Line status',
          detail: bottleneckProcess ? `${bottleneckProcess.name} is at ${bottleneckProcess.oee.toFixed(1)}% OEE with ${bottleneckProcess.downtimeMinutes} min downtime. Last stop: ${bottleneckProcess.lastStopReason}.` : productionSnapshot.alert.message,
          rank: 4,
          dueDate: bottleneckProcess ? `${bottleneckProcess.throughputPerHour.toLocaleString()}/h` : 'Review',
          priority: bottleneckProcess?.status === 'Stopped' ? 'Needs attention' : 'Monitor',
          accent: bottleneckProcess?.status === 'Stopped' ? '#EF4444' : '#2563EB',
        },
      ];

      const actionableTask = consolidatedTasks.find((task) => task.status === 'in-progress')
        ?? consolidatedTasks.find((task) => task.status === 'pending')
        ?? consolidatedTasks[0];

      const getTaskStatusLabel = (status: typeof consolidatedTasks[number]['status']) => {
        if (status === 'completed') return 'Completed';
        if (status === 'in-progress') return 'In Progress';
        return 'Pending';
      };

      const getTaskAccent = (task: typeof consolidatedTasks[number]) => {
        if (task.status === 'completed') return '#16A34A';
        if (task.status === 'in-progress') return '#F59E0B';
        if (task.kind === 'cil') return '#0288D1';
        if (task.kind === 'changeover') return '#2563EB';
        return '#FB8C00';
      };

      const getTaskKindLabel = (task: typeof consolidatedTasks[number]) => (
        task.kind === 'changeover' ? 'Changeover' : task.kind === 'centerline' ? 'Centerline' : 'CIL'
      );

      const buildMyTasksCards = () => consolidatedTasks.map((task, index) => {
        const isActionableTask = task.id === actionableTask?.id;
        return {
          id: task.id,
          title: task.title,
          signal: `${getTaskKindLabel(task)} - ${getTaskStatusLabel(task.status)}`,
          detail: `${task.area} / ${task.equipment}. Equipment: ${task.reminderEquipment}. Tools: ${task.reminderTools}.`,
          rank: index + 1,
          dueDate: task.status === 'completed' ? 'Done today' : task.time,
          assignedTo: task.role,
          priority: isActionableTask ? 'Start here' : getTaskStatusLabel(task.status),
          accent: getTaskAccent(task),
        };
      });

      const triggerMyTaskExecutionFromChat = (task = actionableTask) => {
        if (!task) return;
        clearOperatorWorkstationIntroTimers();
        const userTypingToken = `operator-my-task-user-${Date.now()}`;
        const typingToken = `operator-my-task-start-${Date.now()}`;
        const taskVerb = task.status === 'in-progress' ? 'continue' : 'start';

        setAiMessages((current) => [
          ...current,
          {
            role: 'user',
            text: '',
            variant: 'typing',
            badge: 'Operator onboarding',
            operatorFollowUpToken: userTypingToken,
          } as any,
        ]);

        const userTypingTimer = window.setTimeout(() => {
          setAiMessages((current) => [
            ...current.filter((message) => message.operatorFollowUpToken !== userTypingToken),
            { role: 'user', text: `Yes, help me ${taskVerb} ${task.title}`, badge: 'Operator onboarding' },
            {
              role: 'assistant',
              text: '',
              variant: 'typing',
              heading: 'Preparing guided execution',
              badge: 'Operator onboarding',
              operatorFollowUpToken: typingToken,
            },
          ]);
          operatorWorkstationIntroTimersRef.current = operatorWorkstationIntroTimersRef.current.filter((id) => id !== userTypingTimer);
        }, 260);

        operatorWorkstationIntroTimersRef.current.push(userTypingTimer);

        const navigationTimer = window.setTimeout(() => {
          setAiMessages((current) => current.filter((message) => message.operatorFollowUpToken !== typingToken));
          setCurrentScreen('my_workstation');
          const openTaskTimer = window.setTimeout(() => {
            window.dispatchEvent(new CustomEvent(MY_TASKS_START_TASK_EVENT, {
              detail: { taskId: task.id, withAi: true, preserveAiConversation: true, openExecution: false },
            }));
          }, 180);
          operatorWorkstationIntroTimersRef.current.push(openTaskTimer);
        }, 1050);

        operatorWorkstationIntroTimersRef.current.push(navigationTimer);
      };

      const showMyTasksReview = () => {
        clearOperatorWorkstationIntroTimers();
        const typingToken = `operator-my-tasks-review-${Date.now()}`;
        setAiMessages((current) => [
          ...current,
          { role: 'user', text: 'Review My Tasks', badge: 'Operator onboarding' },
          {
            role: 'assistant',
            text: '',
            variant: 'typing',
            heading: 'Reviewing My Tasks',
            badge: 'Operator onboarding',
            operatorFollowUpToken: typingToken,
          },
        ]);

        const answerTimer = window.setTimeout(() => {
          const completedCount = consolidatedTasks.filter((task) => task.status === 'completed').length;
          const inProgressCount = consolidatedTasks.filter((task) => task.status === 'in-progress').length;
          const pendingCount = consolidatedTasks.filter((task) => task.status === 'pending').length;
          const nextTaskText = actionableTask
            ? `I suggest we start with ${actionableTask.title} by ${actionableTask.time}, because it is the first task that still needs execution.`
            : 'Everything in My Tasks is already complete.';

          setAiMessages((current) => [
            ...current.filter((message) => message.operatorFollowUpToken !== typingToken),
            {
              role: 'assistant',
              text: `I reviewed your My Tasks queue: ${completedCount} completed, ${inProgressCount} in progress, ${pendingCount} pending. ${nextTaskText}`,
              heading: 'My Tasks review',
              variant: 'priority_cards',
              badge: 'Operator onboarding',
              priorityCards: buildMyTasksCards(),
              compactCards: true,
            },
            {
              role: 'assistant',
              text: actionableTask
                ? 'Want me to help you start it now? I will guide the active step in BD Atlas AI without opening the execution modal.'
                : 'Your task queue is clean. You can review shift or production next.',
              variant: 'quick_actions',
              badge: 'Operator onboarding',
              quickActions: [
                ...(actionableTask ? [{
                  label: 'Start first task with BD Atlas AI',
                  action: () => triggerMyTaskExecutionFromChat(actionableTask),
                }] : []),
                {
                  label: 'Review my shift',
                  action: () => showTaskHelp({
                    label: 'Review my shift',
                    responseHeading: 'Shift Schedule snapshot',
                    response: `${operatorScheduleProfile.name}'s schedule shows ${operatorScheduleProfile.shift} shift coverage on ${operatorScheduleProfile.line ? `Line ${operatorScheduleProfile.line}` : 'the assigned line'} (${operatorScheduleProfile.timeWindow}). ${scheduleCoverageInsight?.title ? `${scheduleCoverageInsight.title}: ${scheduleCoverageInsight.detail}` : 'I do not see a critical schedule exception on the next block.'}`,
                    visualCards: buildShiftPlanCards(),
                    actionLabel: 'Open Shift Schedule',
                    screen: 'shift_schedule_overview',
                    navigationPrompt: 'Show me my shift plan.',
                  }),
                },
                {
                  label: 'Check production',
                  action: showLineProductionStatus,
                },
              ],
            },
          ]);
        }, 900);
        operatorWorkstationIntroTimersRef.current.push(answerTimer);
      };

      const showLineProductionStatus = () => showTaskHelp({
        label: 'How is production on my line today?',
        responseHeading: `${productionSummary.line} production pulse`,
        response: `${productionSummary.line} is running ${productionSummary.product} (${productionSummary.sku}). OEE is ${productionSummary.oee}% and output is ${productionSummary.currentOutput.toLocaleString()} units so far. Main watchout: ${productionSnapshot.alert.message}`,
        visualCards: buildProductionLineCards(),
        actionLabel: 'Open Line Dashboard',
        screen: 'my_workstation',
        navigationPrompt: 'Show me my line dashboard.',
        followUpPrompt: 'Want the next production detail?',
        followUpQuickActions: [
          {
            label: 'Show hourly output',
            action: () => {
              clearOperatorWorkstationIntroTimers();
              const typingToken = `operator-hourly-output-${Date.now()}`;
              setAiMessages((current) => [
                ...current,
                { role: 'user', text: 'Show hourly output', badge: 'Operator onboarding' },
                {
                  role: 'assistant',
                  text: '',
                  variant: 'typing',
                  heading: 'Reading hour-by-hour output',
                  badge: 'Operator onboarding',
                  operatorFollowUpToken: typingToken,
                },
              ]);

              const hourlyTimer = window.setTimeout(() => {
                setAiMessages((current) => [
                  ...current.filter((message) => message.operatorFollowUpToken !== typingToken),
                  {
                    role: 'assistant',
                    text: `Here is the hour-by-hour output against the ${productionSummary.targetThroughputPerHour.toLocaleString()}/h run-rate target.`,
                    heading: 'Hourly production',
                    variant: 'priority_cards',
                    badge: 'Operator onboarding',
                    priorityCards: productionSnapshot.hourlyOutput.slice(-6).map((item, index) => {
                      const output = Number(item.output ?? 0);
                      const isOnTarget = output >= productionSummary.targetThroughputPerHour;
                      return {
                        id: `hourly-output-${item.label}`,
                        title: `${item.label}: ${output.toLocaleString()} units`,
                        signal: isOnTarget ? 'At / above run-rate' : 'Below run-rate',
                        detail: `${Math.abs(output - productionSummary.targetThroughputPerHour).toLocaleString()} units ${isOnTarget ? 'above' : 'below'} target for this hour.`,
                        rank: index + 1,
                        dueDate: `${productionSummary.targetThroughputPerHour.toLocaleString()}/h`,
                        priority: isOnTarget ? 'OK' : 'Short',
                        accent: isOnTarget ? '#16A34A' : '#EF4444',
                      };
                    }),
                    compactCards: true,
                  },
                ]);
              }, 700);
              operatorWorkstationIntroTimersRef.current.push(hourlyTimer);
            },
          },
          {
            label: 'What should I watch?',
            action: () => {
              clearOperatorWorkstationIntroTimers();
              setAiMessages((current) => [
                ...current,
                { role: 'user', text: 'What should I watch?', badge: 'Operator onboarding' },
                {
                  role: 'assistant',
                  text: `Watch Welding 3 first, then scrap trend. If scrap stays above 2% for another hour, escalate to ${shiftLeaderName} and capture the reason in handoff notes.`,
                  heading: 'Operator watchouts',
                  variant: 'priority_summary',
                  badge: 'Operator onboarding',
                  priorityChanges: [
                    `OEE: ${productionSummary.oee}% vs 85% target`,
                    `Scrap: ${productionSummary.scrapRate}% latest shift rate`,
                    `Downtime: ${productionSummary.downtimeMinutes} min on the line`,
                  ],
                },
              ]);
            },
          },
        ],
      });

      const showChangeoverActivities = () => showTaskHelp({
        label: 'Review changeover activities',
        responseHeading: 'Changeover activities',
        response: 'Your next changeover is not due yet, but preparation should start before the line goes down. Focus on line clearance, tools, setup sequence, and centerline verification.',
        visualCards: [
          {
            id: 'changeover-next-activity',
            title: 'AFA1-10 Zone 1 changeover',
            signal: 'Equipment Setup Changeover',
            detail: 'Batch CO: AU-30 Cannula 30G to AU-30 Cannula 31G. Planned later this shift.',
            rank: 1,
            dueDate: 'In 3h 42m',
            priority: 'Upcoming',
            accent: '#F59E0B',
          },
          {
            id: 'changeover-prep',
            title: 'Pre-changeover prep',
            signal: 'Prepare before start',
            detail: 'Confirm line clearance, required tools, setup materials, and any open handoff notes.',
            rank: 2,
            dueDate: 'Before line down',
            priority: 'Prep',
            accent: '#2563EB',
          },
          {
            id: 'changeover-verification',
            title: 'Centerline verification',
            signal: 'After setup',
            detail: 'Record the required centerline checks after setup and before returning the line to normal production.',
            rank: 3,
            dueDate: 'After setup',
            priority: 'Required',
            accent: '#7C3AED',
          },
        ],
        actionLabel: 'Open Changeover Operator',
        screen: 'equipment_changeover_operator',
        navigationPrompt: 'Take me to the Equipment Setup Changeover Operator.',
      });

      const showShiftSwapFlowLegacy = () => {
        clearOperatorWorkstationIntroTimers();
        const typingToken = `operator-swap-start-${Date.now()}`;
        setAiMessages((current) => [
          ...current,
          { role: 'user', text: 'Request shift swap', badge: 'Operator onboarding' },
          {
            role: 'assistant',
            text: '',
            variant: 'typing',
            heading: 'Checking eligible shifts',
            badge: 'Operator onboarding',
            operatorFollowUpToken: typingToken,
          },
        ]);

        const swapStartTimer = window.setTimeout(() => {
          setAiMessages((current) => [
            ...current.filter((message) => message.operatorFollowUpToken !== typingToken),
            {
              role: 'assistant',
              text: `I can draft the swap request from ${operatorScheduleProfile.name}'s Shift Schedule. Which scheduled block should we try to swap?`,
              heading: 'Shift swap request',
              variant: 'quick_actions',
              badge: 'Operator onboarding',
              quickActions: upcomingSchedule.slice(0, 3).map((entry) => ({
                label: `${entry.day} • ${entry.hours}`,
                action: () => {
                  clearOperatorWorkstationIntroTimers();
                  const candidateTypingToken = `operator-swap-candidate-${Date.now()}`;
                  setAiMessages((candidateCurrent) => [
                    ...candidateCurrent,
                    { role: 'user', text: `${entry.day} ${entry.hours}`, badge: 'Operator onboarding' },
                    {
                      role: 'assistant',
                      text: '',
                      variant: 'typing',
                      heading: 'Finding coverage options',
                      badge: 'Operator onboarding',
                      operatorFollowUpToken: candidateTypingToken,
                    },
                  ]);

                  const candidateTimer = window.setTimeout(() => {
                    setAiMessages((candidateCurrent) => [
                      ...candidateCurrent.filter((message) => message.operatorFollowUpToken !== candidateTypingToken),
                      {
                        role: 'assistant',
                        text: `Best available matches are people with compatible role or coverage experience. Who should I send the swap request to?`,
                        heading: `${entry.day} ${entry.hours}`,
                        variant: 'quick_actions',
                        badge: 'Operator onboarding',
                        quickActions: fallbackSwapCandidates.map((candidate) => ({
                          label: candidate.name,
                          action: () => {
                            clearOperatorWorkstationIntroTimers();
                            const submitTypingToken = `operator-swap-submit-${Date.now()}`;
                            setAiMessages((submitCurrent) => [
                              ...submitCurrent,
                              { role: 'user', text: `Ask ${candidate.name} to swap`, badge: 'Operator onboarding' },
                              {
                                role: 'assistant',
                                text: '',
                                variant: 'typing',
                                heading: 'Submitting swap request',
                                badge: 'Operator onboarding',
                                operatorFollowUpToken: submitTypingToken,
                              },
                            ]);

                            const submitTimer = window.setTimeout(() => {
                              createShiftRequest({
                                type: 'Shift Swap',
                                requestedBy: operatorScheduleProfile.name,
                                startDate: `${entry.day} ${entry.hours}`,
                                endDate: `${entry.day} ${entry.hours}`,
                                reason: `Swap with ${candidate.name}. Requested from BD Atlas AI during shift plan review.`,
                              });
                              setAiMessages((submitCurrent) => [
                                ...submitCurrent.filter((message) => message.operatorFollowUpToken !== submitTypingToken),
                                {
                                  role: 'assistant',
                                  text: `Done — I submitted a shift swap request for ${entry.day} ${entry.hours} with ${candidate.name}. It is now in Requested status for schedule review.`,
                                  heading: 'Swap request submitted',
                                  variant: 'priority_summary',
                                  badge: 'Operator onboarding',
                                  priorityChanges: [
                                    `Requested by: ${operatorScheduleProfile.name}`,
                                    `Swap with: ${candidate.name}`,
                                    `Shift block: ${entry.day} ${entry.hours}`,
                                  ],
                                },
                                {
                                  role: 'assistant',
                                  text: 'You can keep going here, or open Shift Schedule to review the request list.',
                                  variant: 'quick_actions',
                                  badge: 'Operator onboarding',
                                  quickActions: [
                                    {
                                      label: 'Open Shift Schedule',
                                      action: () => runDrawerNavigation('shift_schedule_overview', 'Show me the shift schedule.'),
                                    },
                                  ],
                                },
                              ]);
                            }, 850);
                            operatorWorkstationIntroTimersRef.current.push(submitTimer);
                          },
                        })),
                      },
                    ]);
                  }, 700);
                  operatorWorkstationIntroTimersRef.current.push(candidateTimer);
                },
              })),
            },
          ]);
        }, 750);
        operatorWorkstationIntroTimersRef.current.push(swapStartTimer);
      };

      const showShiftSwapFlow = () => {
        clearOperatorWorkstationIntroTimers();
        const typingToken = `operator-swap-start-${Date.now()}`;

        const submitSwapRequest = (
          entry: typeof upcomingSchedule[number],
          coverageWindow: string,
          coveragePlan: string,
        ) => {
          clearOperatorWorkstationIntroTimers();
          const submitTypingToken = `operator-swap-submit-${Date.now()}`;
          setAiMessages((submitCurrent) => [
            ...submitCurrent,
            { role: 'user', text: `Send to ${shiftLeaderName} for approval`, badge: 'Operator onboarding' },
            {
              role: 'assistant',
              text: '',
              variant: 'typing',
              heading: 'Sending request to leader',
              badge: 'Operator onboarding',
              operatorFollowUpToken: submitTypingToken,
            },
          ]);

          const submitTimer = window.setTimeout(() => {
            createShiftRequest({
              type: 'Shift Swap',
              requestedBy: operatorScheduleProfile.name,
              startDate: `${entry.day} ${coverageWindow}`,
              endDate: `${entry.day} ${coverageWindow}`,
              reason: `${coveragePlan}. Sent to ${shiftLeaderName} from BD Atlas AI. Original schedule block: ${entry.day} ${entry.hours}.`,
            });

            setAiMessages((submitCurrent) => [
              ...submitCurrent.filter((message) => message.operatorFollowUpToken !== submitTypingToken),
              {
                role: 'assistant',
                text: `Done — I sent the shift swap request to ${shiftLeaderName} for approval. It is now in Requested status in Shift Schedule.`,
                heading: 'Swap request sent',
                variant: 'priority_summary',
                badge: 'Operator onboarding',
                priorityChanges: [
                  `Operator: ${operatorScheduleProfile.name}`,
                  `Requested block: ${entry.day} ${coverageWindow}`,
                  coveragePlan,
                  `Approver: ${shiftLeaderName}`,
                ],
              },
              {
                role: 'assistant',
                text: 'You can continue here or open Shift Schedule to track the approval.',
                variant: 'quick_actions',
                badge: 'Operator onboarding',
                quickActions: [
                  {
                    label: 'Open Shift Schedule',
                    action: () => runDrawerNavigation('shift_schedule_overview', 'Show me the shift schedule.'),
                  },
                ],
              },
            ]);
          }, 850);
          operatorWorkstationIntroTimersRef.current.push(submitTimer);
        };

        const confirmSwapRequest = (
          entry: typeof upcomingSchedule[number],
          coverageWindow: string,
          coveragePlan: string,
        ) => {
          clearOperatorWorkstationIntroTimers();
          const confirmTypingToken = `operator-swap-confirm-${Date.now()}`;
          setAiMessages((confirmCurrent) => [
            ...confirmCurrent,
            { role: 'user', text: coveragePlan, badge: 'Operator onboarding' },
            {
              role: 'assistant',
              text: '',
              variant: 'typing',
              heading: 'Preparing leader approval',
              badge: 'Operator onboarding',
              operatorFollowUpToken: confirmTypingToken,
            },
          ]);

          const confirmTimer = window.setTimeout(() => {
            setAiMessages((confirmCurrent) => [
              ...confirmCurrent.filter((message) => message.operatorFollowUpToken !== confirmTypingToken),
              {
                role: 'assistant',
                text: `I will send this to ${shiftLeaderName}. Review the request before I submit it.`,
                heading: 'Confirm shift swap request',
                variant: 'quick_actions',
                badge: 'Operator onboarding',
                priorityCards: [
                  {
                    id: 'swap-review-day',
                    title: `${entry.day} shift swap`,
                    signal: 'My scheduled block',
                    detail: `${entry.hours}. ${entry.note}`,
                    rank: 1,
                    dueDate: entry.day,
                    priority: 'Selected',
                    accent: '#2563EB',
                  },
                  {
                    id: 'swap-review-window',
                    title: coverageWindow,
                    signal: 'Coverage window',
                    detail: coveragePlan,
                    rank: 2,
                    dueDate: 'Needs approval',
                    priority: 'To leader',
                    accent: '#7C3AED',
                  },
                ],
                quickActions: [
                  {
                    label: `Send to ${shiftLeaderName}`,
                    action: () => submitSwapRequest(entry, coverageWindow, coveragePlan),
                  },
                  {
                    label: 'Choose another time',
                    action: showShiftSwapFlow,
                  },
                ],
              },
            ]);
          }, 650);
          operatorWorkstationIntroTimersRef.current.push(confirmTimer);
        };

        const chooseSwapCoverage = (entry: typeof upcomingSchedule[number], coverageWindow: string) => {
          clearOperatorWorkstationIntroTimers();
          const coverageTypingToken = `operator-swap-coverage-${Date.now()}`;
          setAiMessages((coverageCurrent) => [
            ...coverageCurrent,
            { role: 'user', text: coverageWindow, badge: 'Operator onboarding' },
            {
              role: 'assistant',
              text: '',
              variant: 'typing',
              heading: 'Checking coverage options',
              badge: 'Operator onboarding',
              operatorFollowUpToken: coverageTypingToken,
            },
          ]);

          const coverageTimer = window.setTimeout(() => {
            const coverageActions = [
              {
                label: `Let ${shiftLeaderName} assign coverage`,
                action: () => confirmSwapRequest(entry, coverageWindow, `${shiftLeaderName} to assign best available coverage`),
              },
              ...fallbackSwapCandidates.slice(0, 2).map((candidate) => ({
                label: `Suggest ${candidate.name}`,
                action: () => confirmSwapRequest(entry, coverageWindow, `Suggested coverage: ${candidate.name} (${candidate.role}, ${candidate.shift} shift)`),
              })),
            ];

            setAiMessages((coverageCurrent) => [
              ...coverageCurrent.filter((message) => message.operatorFollowUpToken !== coverageTypingToken),
              {
                role: 'assistant',
                text: `Got it. For ${entry.day} ${coverageWindow}, do you want to suggest someone or let ${shiftLeaderName} assign coverage?`,
                heading: 'Who should cover?',
                variant: 'quick_actions',
                badge: 'Operator onboarding',
                quickActions: coverageActions,
              },
            ]);
          }, 650);
          operatorWorkstationIntroTimersRef.current.push(coverageTimer);
        };

        const chooseSwapWindow = (entry: typeof upcomingSchedule[number]) => {
          clearOperatorWorkstationIntroTimers();
          const windowTypingToken = `operator-swap-window-${Date.now()}`;
          setAiMessages((windowCurrent) => [
            ...windowCurrent,
            { role: 'user', text: `${entry.day} ${entry.hours}`, badge: 'Operator onboarding' },
            {
              role: 'assistant',
              text: '',
              variant: 'typing',
              heading: 'Checking shift window',
              badge: 'Operator onboarding',
              operatorFollowUpToken: windowTypingToken,
            },
          ]);

          const [shiftStart = '06:00', shiftEnd = '14:00'] = entry.hours.split(' - ');
          const windowOptions = [
            { label: `Full shift (${entry.hours})`, value: entry.hours },
            { label: `First half (${shiftStart} - 10:00)`, value: `${shiftStart} - 10:00` },
            { label: `Second half (10:00 - ${shiftEnd})`, value: `10:00 - ${shiftEnd}` },
            { label: `Last 2 hours (12:00 - ${shiftEnd})`, value: `12:00 - ${shiftEnd}` },
          ];

          const windowTimer = window.setTimeout(() => {
            setAiMessages((windowCurrent) => [
              ...windowCurrent.filter((message) => message.operatorFollowUpToken !== windowTypingToken),
              {
                role: 'assistant',
                text: `Which part of your ${entry.day} shift do you need to swap?`,
                heading: `${entry.day} shift window`,
                variant: 'quick_actions',
                badge: 'Operator onboarding',
                quickActions: windowOptions.map((option) => ({
                  label: option.label,
                  action: () => chooseSwapCoverage(entry, option.value),
                })),
              },
            ]);
          }, 650);
          operatorWorkstationIntroTimersRef.current.push(windowTimer);
        };

        setAiMessages((current) => [
          ...current,
          { role: 'user', text: 'Request shift swap', badge: 'Operator onboarding' },
          {
            role: 'assistant',
            text: '',
            variant: 'typing',
            heading: 'Checking my scheduled shifts',
            badge: 'Operator onboarding',
            operatorFollowUpToken: typingToken,
          },
        ]);

        const swapStartTimer = window.setTimeout(() => {
          setAiMessages((current) => [
            ...current.filter((message) => message.operatorFollowUpToken !== typingToken),
            {
              role: 'assistant',
              text: `Pick the day/shift you want to swap. After that I will ask the exact time window and send the request to ${shiftLeaderName} for approval.`,
              heading: 'Shift swap request',
              variant: 'quick_actions',
              badge: 'Operator onboarding',
              priorityCards: upcomingSchedule.slice(0, 3).map((entry, index) => ({
                id: `swap-shift-${entry.day}`,
                title: `${entry.day} ${entry.hours}`,
                signal: 'Scheduled shift',
                detail: entry.note,
                rank: index + 1,
                dueDate: operatorScheduleProfile.shift,
                priority: 'Available to request',
                accent: '#2563EB',
              })),
              quickActions: upcomingSchedule.slice(0, 3).map((entry) => ({
                label: `${entry.day} • ${entry.hours}`,
                action: () => chooseSwapWindow(entry),
              })),
            },
          ]);
        }, 750);
        operatorWorkstationIntroTimersRef.current.push(swapStartTimer);
      };

      const showTaskHelp = (input: {
        label: string;
        response: string;
        responseHeading?: string;
        visualCards?: Array<{
          id: string;
          title: string;
          signal: string;
          detail: string;
          rank: number;
          dueDate?: string;
          assignedTo?: string;
          priority?: string;
          accent?: string;
        }>;
        actionLabel: string;
        screen: 'cil_operator' | 'centerline_operator' | 'equipment_changeover_operator' | 'shift_schedule_overview' | 'my_workstation';
        navigationPrompt?: string;
        followUpPrompt?: string;
        followUpQuickActions?: Array<{
          label: string;
          action: () => void;
        }>;
      }) => {
        clearOperatorWorkstationIntroTimers();
        const typingToken = `operator-follow-up-${Date.now()}`;
        setAiMessages((current) => [
          ...current,
          { role: 'user', text: input.label, badge: 'Operator onboarding' },
          {
            role: 'assistant',
            text: '',
            variant: 'typing',
            heading: 'Checking your tasks',
            badge: 'Operator onboarding',
            operatorFollowUpToken: typingToken,
          },
        ]);

        const answerTimer = window.setTimeout(() => {
          setAiMessages((current) => [
            ...current.filter((message) => message.operatorFollowUpToken !== typingToken),
            {
              role: 'assistant',
              text: input.response,
              heading: input.responseHeading,
              variant: input.visualCards?.length ? 'priority_cards' : 'priority_summary',
              priorityCards: input.visualCards,
              compactCards: Boolean(input.visualCards?.length),
              badge: 'Operator onboarding',
            },
            ...(input.followUpQuickActions?.length ? [{
              role: 'assistant',
              text: input.followUpPrompt ?? 'Need to change anything from your schedule?',
              variant: 'quick_actions',
              badge: 'Operator onboarding',
              quickActions: input.followUpQuickActions,
            }] : []),
            {
              role: 'assistant',
              text: 'I can take you directly to the operator flow when you are ready.',
              variant: 'action',
              actionLabel: input.actionLabel,
              badge: 'Operator onboarding',
              action: () => {
                runDrawerNavigation(
                  input.screen,
                  input.navigationPrompt ?? `Take me to ${input.actionLabel.replace(/^Open\s+/i, '')}.`,
                );
              },
            },
          ]);
        }, 900);
        operatorWorkstationIntroTimersRef.current.push(answerTimer);
      };

      const completionMessage = {
        role: 'assistant',
        text: 'Nice work - the quick tour is complete. From here I can review Safety, Quality, Line Status, your My Tasks queue, your schedule, or the Shift Logbook.',
        heading: 'Tour complete',
        variant: 'priority_summary',
        badge: 'Operator onboarding',
      };
      const postTourQuickActions = [
        {
          label: 'Review My Tasks',
          action: showMyTasksReview,
        },
        {
          label: 'Review my shift',
          action: () => showTaskHelp({
            label: 'Review my shift',
            responseHeading: 'Shift Schedule snapshot',
            response: `${operatorScheduleProfile.name}'s schedule shows ${operatorScheduleProfile.shift} shift coverage on ${operatorScheduleProfile.line ? `Line ${operatorScheduleProfile.line}` : 'the assigned line'} (${operatorScheduleProfile.timeWindow}). ${scheduleCoverageInsight?.title ? `${scheduleCoverageInsight.title}: ${scheduleCoverageInsight.detail}` : 'I do not see a critical schedule exception on the next block.'}`,
            visualCards: buildShiftPlanCards(),
            actionLabel: 'Open Shift Schedule',
            screen: 'shift_schedule_overview',
            navigationPrompt: 'Show me my shift plan.',
            followUpQuickActions: [
              {
                label: 'Request shift swap',
                action: showShiftSwapFlow,
              },
              {
                label: 'Open Shift Schedule',
                action: () => runDrawerNavigation('shift_schedule_overview', 'Show me the shift schedule.'),
              },
              {
                label: 'Review My Tasks',
                action: showMyTasksReview,
              },
              {
                label: 'How is production today?',
                action: showLineProductionStatus,
              },
            ],
          }),
        },
        {
          label: 'How is production today?',
          action: showLineProductionStatus,
        },
      ];
      const quickActionsMessage = {
        role: 'assistant',
        text: 'What do you want to review next?',
        variant: 'quick_actions',
        badge: 'Operator onboarding',
        quickActions: postTourQuickActions,
        legacyQuickActions: [
          {
            label: 'Help with my CIL tasks',
            action: () => showTaskHelp({
              label: 'Help with my CIL tasks',
              responseHeading: 'CIL task ready to start',
              response: 'You have 1 CIL activity assigned today. It is still pending, so start with this task and follow the operator sequence step by step.',
              visualCards: [
                {
                  id: 'cil-zone-a-cutter',
                  title: 'Zone A Cutter (Z1)',
                  signal: 'CIL • Pending',
                  detail: 'Clean → Inspect → Lubricate. Tools: flashlight + inspection mirror.',
                  rank: 1,
                  dueDate: 'Due 10:00',
                  assignedTo: 'Zone 1 / Z1 Cutter',
                  priority: 'Next up',
                  accent: '#F59E0B',
                },
              ],
              actionLabel: 'Open CIL Operator',
              screen: 'cil_operator',
              navigationPrompt: 'Take me to the CIL Operator.',
            }),
          },
          {
            label: 'Help with my Centerline tasks',
            action: () => showTaskHelp({
              label: 'Help with my Centerline tasks',
              responseHeading: 'Centerline task queue',
              response: 'You have 3 Centerline checks today. One is complete and two still need your attention.',
              visualCards: [
                {
                  id: 'centerline-zone-a-main-indexer',
                  title: 'Zone A Main Indexer',
                  signal: 'Centerline • Verified',
                  detail: 'Baseline check already completed for this shift.',
                  rank: 1,
                  dueDate: 'Done',
                  priority: 'Complete',
                  accent: '#16A34A',
                },
                {
                  id: 'centerline-zone-b-tipper',
                  title: 'Zone B Tipper',
                  signal: 'Centerline • Pending',
                  detail: 'Start here next, then log the verification result.',
                  rank: 2,
                  dueDate: 'Next',
                  priority: 'Next up',
                  accent: '#F59E0B',
                },
                {
                  id: 'centerline-zone-c-press',
                  title: 'Zone C Press',
                  signal: 'Centerline • Scheduled',
                  detail: 'Complete the verification after the Zone B Tipper check.',
                  rank: 3,
                  dueDate: '2:30 PM',
                  priority: 'Later today',
                  accent: '#2563EB',
                },
              ],
              actionLabel: 'Open Centerline Operator',
              screen: 'centerline_operator',
              navigationPrompt: 'Take me to the Centerline Operator.',
            }),
          },
          {
            label: 'Review my shift plan',
            action: () => showTaskHelp({
              label: 'Review my shift plan',
              responseHeading: 'Shift Schedule snapshot',
              response: `${operatorScheduleProfile.name}'s schedule shows ${operatorScheduleProfile.shift} shift coverage on ${operatorScheduleProfile.line ? `Line ${operatorScheduleProfile.line}` : 'the assigned line'} (${operatorScheduleProfile.timeWindow}). ${scheduleCoverageInsight?.title ? `${scheduleCoverageInsight.title}: ${scheduleCoverageInsight.detail}` : 'I do not see a critical schedule exception on the next block.'}`,
              visualCards: buildShiftPlanCards(),
              actionLabel: 'Open Shift Schedule',
              screen: 'shift_schedule_overview',
              navigationPrompt: 'Show me my shift plan.',
              followUpQuickActions: [
                {
                  label: 'Request shift swap',
                  action: showShiftSwapFlow,
                },
                {
                  label: 'Open Shift Schedule',
                  action: () => runDrawerNavigation('shift_schedule_overview', 'Show me the shift schedule.'),
                },
                {
                  label: 'Review changeover activities',
                  action: showChangeoverActivities,
                },
                {
                  label: 'How is production on my line?',
                  action: showLineProductionStatus,
                },
              ],
            }),
          },
          {
            label: 'How is production on my line?',
            action: showLineProductionStatus,
          },
          {
            label: 'Review changeover activities',
            action: showChangeoverActivities,
          },
        ],
      };

      setAiMessages([{
        role: 'assistant',
        text: '',
        variant: 'typing',
        heading: 'Preparing your next steps',
        badge: 'Operator onboarding',
      }]);

      const completionTimer = window.setTimeout(() => {
        setAiMessages([completionMessage, quickActionsMessage]);
      }, 750);
      operatorWorkstationIntroTimersRef.current.push(completionTimer);
    };

    window.addEventListener(OPERATOR_WORKSTATION_TOUR_COMPLETE_EVENT, handleTourComplete);
    return () => window.removeEventListener(OPERATOR_WORKSTATION_TOUR_COMPLETE_EVENT, handleTourComplete);
  }, [
    clearOperatorWorkstationIntroTimers,
    createShiftRequest,
    currentUserName,
    orgChartDraft.shiftLeads,
    setAiDrawerWidth,
    setAiInput,
    setCurrentScreen,
    setIsAiDrawerOpen,
  ]);

  const contextualAiTimersRef = useRef<number[]>([]);
  const clearContextualAiTimers = useCallback(() => {
    contextualAiTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    contextualAiTimersRef.current = [];
  }, []);
  const registerContextualAiTimer = useCallback((timerId: number) => {
    contextualAiTimersRef.current = [...contextualAiTimersRef.current, timerId];
  }, []);
  const unregisterContextualAiTimer = useCallback((timerId: number) => {
    contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== timerId);
  }, []);

  const buildLogbookNavigationSampleCards = useCallback((category: string, searchTerm?: string) => {
    const normalizedCategory = category === 'All' ? '' : category.toLowerCase();
    const normalizedSearch = (searchTerm ?? '').toLowerCase();
    const candidates = shiftLogbookEntries.filter((entry) => {
      const matchesCategory = !normalizedCategory || entry.category.toLowerCase() === normalizedCategory;
      const searchable = `${entry.title} ${entry.category} ${entry.ticketType} ${entry.line} ${entry.zone} ${entry.reporter}`.toLowerCase();
      const matchesSearch = !normalizedSearch || searchable.includes(normalizedSearch);
      return matchesCategory && matchesSearch;
    });
    const fallback = shiftLogbookEntries.filter((entry) => !normalizedCategory || entry.category.toLowerCase() === normalizedCategory);
    return (candidates.length ? candidates : fallback.length ? fallback : shiftLogbookEntries)
      .slice(0, 5)
      .map((entry, index) => ({
        id: entry.id,
        title: entry.title,
        signal: entry.category,
        detail: `${entry.ticketType} • ${entry.line} • ${entry.zone} • ${entry.status}`,
        rank: index + 1,
        dueDate: entry.createdAt,
        assignedTo: entry.reporter,
        priority: entry.riskLevel,
        accent: entry.tone,
      }));
  }, []);

  useEffect(() => () => clearContextualAiTimers(), [clearContextualAiTimers]);

  const openColumbusWestLogbook3D = useCallback(() => {
    closeShiftLogbookMaintenanceReview?.();
    closeShiftLogbookRcaFlow?.();
    closeShiftLogbookFishboneWorkspace?.();
    closeShiftLogbookFaultTreeWorkspace?.();
    setIsShiftLogbookSourceDrawerOpen?.(false);
    setShiftLogbookCategory('Dashboard' as any);
    setShiftLogbookSearch('');
    setSelectedHeaderHierarchyId('plant-columbus-west');
    setCurrentScreen('shift_logbook');
  }, [
    closeShiftLogbookFaultTreeWorkspace,
    closeShiftLogbookFishboneWorkspace,
    closeShiftLogbookMaintenanceReview,
    closeShiftLogbookRcaFlow,
    setCurrentScreen,
    setIsShiftLogbookSourceDrawerOpen,
    setSelectedHeaderHierarchyId,
    setShiftLogbookCategory,
    setShiftLogbookSearch,
  ]);

  const answerContextualAiQuestion = useCallback((quickAction: ContextualAiAssistantPayload['quickActions'][number]) => {
    clearContextualAiTimers();
    const userTypingToken = `contextual-user-typing-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const typingToken = `contextual-typing-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setAiMessages((current) => [
      ...current,
      {
        role: 'user',
        text: '',
        variant: 'typing',
        contextualTypingToken: userTypingToken,
      } as any,
    ]);

    const userTypingTimerId = window.setTimeout(() => {
      setAiMessages((current) => [
        ...current.filter((message) => message.contextualTypingToken !== userTypingToken),
        {
          role: 'user',
          text: quickAction.prompt,
        },
        {
          role: 'assistant',
          text: '',
          variant: 'typing',
          heading: 'Working live',
          contextualTypingToken: typingToken,
        },
      ]);
      contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== userTypingTimerId);
    }, 260);

    const timerId = window.setTimeout(() => {
      const isExecutionStepStart = Boolean(quickAction.responseCards?.some((card) => card.inputStepId));
      const followUpQuickActions = quickAction.followUpActions?.map((action) => ({
        label: action.label,
        action: () => {
          clearContextualAiTimers();
          if (action.mode === 'workstation-maintenance-request') {
            window.dispatchEvent(new CustomEvent('workstation:execution-chat-command', {
              detail: {
                action: 'report-issue',
                stepId: action.stepId,
              },
            }));
            setAiMessages((current) => [
              ...current,
              {
                role: 'user',
                text: action.label,
              },
              {
                role: 'assistant',
                text: `I opened the existing Maintenance Request entry from the active execution step and prefilled the issue context for ${action.searchTerm ?? 'this task'}.`,
                variant: 'priority_summary',
                heading: 'Report issue opened',
                badge: 'Live answer',
              },
            ]);
            return;
          }

          if (action.mode === 'execution-comment') {
            window.dispatchEvent(new CustomEvent('workstation:prefill-execution-comment', {
              detail: {
                stepId: action.stepId,
                comment: action.commentText ?? action.description ?? '',
              },
            }));
            setAiMessages((current) => [
              ...current,
              {
                role: 'user',
                text: action.label,
              },
              {
                role: 'assistant',
                text: 'I drafted the note for the active execution step. Review it, then add the comment when it looks right.',
                variant: 'priority_summary',
                heading: 'Comment draft ready',
                badge: 'Live answer',
              },
            ]);
            return;
          }

          if (action.mode === 'execution-open-instructions') {
            window.dispatchEvent(new CustomEvent('workstation:execution-chat-command', {
              detail: {
                action: 'open-instructions',
                stepId: action.stepId,
              },
            }));
            setAiMessages((current) => [
              ...current,
              {
                role: 'user',
                text: action.label,
              },
              {
                role: 'assistant',
                text: 'I opened the Instructions panel on the active execution step. Review the SOP context there, then come back here with the reading or any abnormal condition.',
                variant: 'priority_summary',
                heading: 'Instructions opened',
                badge: 'Live answer',
              },
            ]);
            return;
          }

          if (action.mode === 'execution-complete-step') {
            window.dispatchEvent(new CustomEvent('workstation:execution-chat-command', {
              detail: {
                action: 'complete-active',
                stepId: action.stepId,
              },
            }));
            setAiMessages((current) => [
              ...current,
              {
                role: 'user',
                text: action.label,
              },
              {
                role: 'assistant',
                text: 'I completed the active execution step and advanced the flow to the next available step.',
                variant: 'priority_summary',
                heading: 'Step completed',
                badge: 'Live answer',
              },
            ]);
            return;
          }

          const navigationToken = `contextual-nav-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          setAiMessages((current) => [
            ...current,
            {
              role: 'user',
              text: action.label,
            },
            {
              role: 'assistant',
              text: '',
              variant: 'typing',
              heading: 'Opening Logbook',
              contextualTypingToken: navigationToken,
            },
          ]);

          const answerTimerId = window.setTimeout(() => {
            const sampleCards = buildLogbookNavigationSampleCards(action.category, action.searchTerm);
            setAiMessages((current) => current.map((message) => (
              message.contextualTypingToken === navigationToken
                ? {
                    role: 'assistant',
                    text: `Opening ${action.category} in the Logbook with ${action.searchTerm ?? 'the selected'} context. Here are the matching examples I found first.`,
                    variant: 'priority_cards',
                    heading: 'Opening Logbook',
                    badge: 'Logbook context',
                    priorityCards: sampleCards,
                    compactCards: true,
                  }
                : message
            )));
            contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== answerTimerId);
          }, 520);
          const navigateTimerId = window.setTimeout(() => {
            setCurrentScreen('shift_logbook');
            setShiftLogbookCategory(action.category as any);
            setShiftLogbookSearch(action.searchTerm ?? '');
            setIsAiDrawerOpen(false);
            contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== navigateTimerId);
          }, 1180);
          contextualAiTimersRef.current = [...contextualAiTimersRef.current, answerTimerId, navigateTimerId];
        },
      })) ?? [];

      if (isExecutionStepStart) {
        const responseParts = quickAction.response.split('\n\n').filter(Boolean);
        const taskIntroText = responseParts[0] ?? quickAction.response;
        const taskDetailText = responseParts[1] ?? 'I checked the required equipment, tools, and execution context.';
        const readyText = responseParts[2] ?? 'Step 1 is ready below. Complete it first, then I will bring the next step.';
        const detailTypingToken = `contextual-execution-detail-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const readyTypingToken = `contextual-execution-ready-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const firstStepCode = quickAction.responseCards?.[0]?.inputCode ?? 'Step 1';

        setAiMessages((current) => [
          ...current.filter((message) => message.contextualTypingToken !== typingToken),
          {
            role: 'assistant',
            text: taskIntroText,
            variant: 'priority_summary',
            heading: 'Guided execution',
            badge: 'Execution context',
          },
          {
            role: 'assistant',
            text: '',
            variant: 'typing',
            heading: 'Checking task details',
            badge: 'Execution context',
            contextualTypingToken: detailTypingToken,
          } as any,
        ]);
        const detailTimerId = window.setTimeout(() => {
          setAiMessages((current) => [
            ...current.filter((message) => message.contextualTypingToken !== detailTypingToken),
            {
              role: 'assistant',
              text: taskDetailText,
              variant: 'priority_summary',
              heading: 'Task details',
              badge: 'Execution context',
            },
            {
              role: 'assistant',
              text: '',
              variant: 'typing',
              heading: 'Preparing the first step',
              badge: 'Execution context',
              contextualTypingToken: readyTypingToken,
            } as any,
          ]);
          contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== detailTimerId);
        }, 700);
        const readyTimerId = window.setTimeout(() => {
          setAiMessages((current) => [
            ...current.filter((message) => message.contextualTypingToken !== readyTypingToken),
            {
              role: 'assistant',
              text: readyText,
              variant: 'priority_cards',
              heading: `Step 1 - ${firstStepCode}`,
              badge: 'Execution context',
              priorityCards: quickAction.responseCards,
              compactCards: true,
            },
          ]);
          contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== readyTimerId);
        }, 1600);
        contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== timerId);
        contextualAiTimersRef.current = [...contextualAiTimersRef.current, detailTimerId, readyTimerId];
        return;
      }

      setAiMessages((current) => {
        const withoutTyping = current.filter((message) => message.contextualTypingToken !== typingToken);
        const answerMessages = [
          {
            role: 'assistant',
            text: quickAction.response,
            variant: quickAction.responseCards?.length ? 'priority_cards' : 'priority_summary',
            heading: quickAction.label,
            badge: 'Live answer',
            priorityCards: quickAction.responseCards,
            compactCards: Boolean(quickAction.responseCards?.length),
          },
          ...(followUpQuickActions.length ? [{
            role: 'assistant',
            text: quickAction.followUpActions?.some((action) => action.mode?.startsWith('execution') || action.mode === 'workstation-maintenance-request')
              ? 'Use these controls for the active execution step.'
              : 'Open the matching Logbook view from here.',
            variant: 'quick_actions',
            quickActions: followUpQuickActions,
          }] : []),
        ];
        return [...withoutTyping, ...answerMessages];
      });
      contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== timerId);
    }, 1080);
    contextualAiTimersRef.current = [...contextualAiTimersRef.current, userTypingTimerId, timerId];
  }, [buildLogbookNavigationSampleCards, clearContextualAiTimers, setCurrentScreen, setIsAiDrawerOpen, setShiftLogbookCategory, setShiftLogbookSearch]);

  const isExecutionAssistantContext = useCallback(() => {
    const filterText = (aiProblemFilter || '').toLowerCase();
    if (/\b(cl|cil|centerline|changeover)\b/.test(filterText)) return true;
    return aiMessages.some((message) => {
      const text = `${message.heading ?? ''} ${message.text ?? ''} ${message.badge ?? ''}`.toLowerCase();
      return text.includes('execution')
        || text.includes('centerline assistant')
        || text.includes('cil assistant')
        || text.includes('changeover assistant');
    });
  }, [aiMessages, aiProblemFilter]);

  const handleAiSendWithExecutionContext = useCallback((message: string, options?: { openDrawer?: boolean }) => {
    const trimmedMessage = message.trim();
    const normalizedMessage = trimmedMessage.replace(',', '.');
    const stepCodeMatch = normalizedMessage.match(/\b(CL-\d+(?:\.\d+)?)\b/i);
    const guideForParsing = executionGuideRef.current;
    const explicitStepIndex = stepCodeMatch && guideForParsing
      ? guideForParsing.steps.findIndex((step) => step.code.toLowerCase() === stepCodeMatch[1].toLowerCase())
      : -1;
    const messageWithoutStepCode = stepCodeMatch ? normalizedMessage.replace(stepCodeMatch[0], ' ') : normalizedMessage;
    const numericMatch = messageWithoutStepCode.match(/(?:^|\s)(\d+(?:\.\d+)?)(?:\s*(bar|rpm|c|°c))?\b/i);
    const hasExecutionContext = isExecutionAssistantContext();
    const explicitGuideStep = guideForParsing && explicitStepIndex >= 0 ? guideForParsing.steps[explicitStepIndex] : undefined;
    const executionActionMatch = trimmedMessage.match(/^__execution_action__\|([^|]+)\|([^|]*)\|([^|]*)(?:\|([^|]*))?(?:\|([^|]*))?$/);
    const runExecutionChatTurn = ({
      userText,
      heading,
      assistantText,
      beforeAssistant,
      priorityChanges,
      extraAssistantMessages,
    }: {
      userText: string;
      heading: string;
      assistantText: string;
      beforeAssistant?: () => void;
      priorityChanges?: string[];
      extraAssistantMessages?: any[];
    }) => {
      const userTypingToken = `execution-user-typing-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const assistantTypingToken = `execution-assistant-typing-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setAiInput('');
      if (options?.openDrawer !== false) setIsAiDrawerOpen(true);
      setAiMessages((current) => [
        ...current,
        {
          role: 'user',
          text: '',
          variant: 'typing',
          contextualTypingToken: userTypingToken,
        } as any,
      ]);
      const userTimer = window.setTimeout(() => {
        setAiMessages((current) => [
          ...current.filter((item) => item.contextualTypingToken !== userTypingToken),
          {role: 'user', text: userText},
          {
            role: 'assistant',
            text: '',
            variant: 'typing',
            heading,
            badge: 'Execution context',
            contextualTypingToken: assistantTypingToken,
          } as any,
        ]);
        contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== userTimer);
      }, 240);
      const assistantTimer = window.setTimeout(() => {
        beforeAssistant?.();
        setAiMessages((current) => [
          ...current.filter((item) => item.contextualTypingToken !== assistantTypingToken),
          {
            role: 'assistant',
            text: assistantText,
            variant: 'priority_summary',
            heading,
            badge: 'Execution context',
            priorityChanges,
          },
          ...(extraAssistantMessages ?? []),
        ]);
        contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== assistantTimer);
      }, 820);
      contextualAiTimersRef.current = [...contextualAiTimersRef.current, userTimer, assistantTimer];
    };

    if (executionActionMatch && hasExecutionContext) {
      const [, action, stepId, rawLabel, rawValue, rawUnit] = executionActionMatch;
      const guide = executionGuideRef.current;
      const guideStepIndex = guide?.steps.findIndex((step) => step.id === stepId);
      const guideStep = guide && typeof guideStepIndex === 'number' && guideStepIndex >= 0 ? guide.steps[guideStepIndex] : undefined;
      const stepLabel = guideStep?.code ?? rawLabel ?? 'active step';
      const stepTitle = guideStep?.title ?? rawLabel ?? 'active step';

      if (action === 'open-instructions') {
        runExecutionChatTurn({
          userText: `Instructions ${stepLabel}`,
          heading: `Instructions ${stepLabel}`,
          assistantText: `Opened the designed Instructions modal for ${stepLabel}. Review the SOP, images, and video context there, then continue here with BD Atlas AI.`,
          beforeAssistant: () => window.dispatchEvent(new CustomEvent('workstation:execution-chat-command', {
            detail: {action: 'open-instructions', stepId},
          })),
        });
        return;
      }

      if (action === 'comment') {
        runExecutionChatTurn({
          userText: `Comment ${stepLabel}`,
          heading: `Comment ${stepLabel}`,
          assistantText: `Write the comment you want to save on ${stepLabel}. I will add it to that execution step.`,
          beforeAssistant: () => {
            pendingExecutionCommentRef.current = {stepId, code: stepLabel, title: stepTitle};
          },
        });
        return;
      }

      if (action === 'report-issue') {
        runExecutionChatTurn({
          userText: `Report issue ${stepLabel}`,
          heading: `Report issue ${stepLabel}`,
          assistantText: `Opened the existing issue flow for ${stepLabel}. Add the abnormal condition, impact, and whether production can continue.`,
          beforeAssistant: () => window.dispatchEvent(new CustomEvent('workstation:execution-chat-command', {
            detail: {action: 'report-issue', stepId},
          })),
        });
        return;
      }

      if (action === 'complete-active') {
        const buildExecutionStepCard = (step: NonNullable<typeof guideStep>, index: number) => ({
          id: `execution-step-${step.id}-${Date.now()}`,
          title: `${step.code} ${step.title}`,
          signal: `Step ${index + 1}${step.unit ? ` - ${step.unit}` : ''}`,
          detail: `${step.detail}${step.requiresImageProof ? ' Image proof is required before completion.' : ''}`,
          rank: index + 1,
          priority: step.unit ? `Enter ${step.unit}` : 'Complete step',
          accent: index === 0 ? '#2563EB' : index === 1 ? '#F59E0B' : '#0288D1',
          inputStepId: step.id,
          inputCode: step.code,
          inputUnit: step.unit,
          inputPlaceholder: step.target !== undefined ? String(step.target) : `Enter ${step.unit ?? 'value'}`,
          inputLabel: `Enter ${step.code} ${step.unit ?? 'value'}`,
          inputActionLabel: 'Complete',
          rangeLabel: step.min !== undefined && step.max !== undefined && step.unit
            ? `Min: ${step.min} ${step.unit} | Target: ${step.target} ${step.unit} | Max: ${step.max} ${step.unit}`
            : undefined,
          evidenceLabel: step.requiresImageProof ? 'Image Pending' : undefined,
        });
        const buildCompletedStepSummaryCard = (step: NonNullable<typeof guideStep>, index: number) => ({
          id: `execution-completed-${step.id}-${Date.now()}`,
          title: `${step.code} ${step.title}`,
          signal: 'Completed',
          detail: step.requiresImageProof
            ? `${step.detail} Image/evidence requirement reviewed.`
            : step.detail,
          rank: index + 1,
          priority: 'Completed',
          accent: '#16A34A',
        });
        const resolvedStepIndex = guide && typeof guideStepIndex === 'number' && guideStepIndex >= 0
          ? guideStepIndex
          : guide?.currentStepIndex ?? 0;
        const isLastStep = guide ? resolvedStepIndex >= guide.steps.length - 1 : false;
        const nextStepIndex = guide ? (isLastStep ? resolvedStepIndex : resolvedStepIndex + 1) : 0;
        const nextStep = guide && !isLastStep ? guide.steps[nextStepIndex] : undefined;
        const remainingTaskCards = guide && isLastStep
          ? consolidatedTasks
              .filter((task) => task.id !== guide.taskId && task.status !== 'completed')
              .map((task, index) => ({
                id: `remaining-task-${task.id}`,
                title: task.title,
                signal: `${task.code} - ${task.status === 'in-progress' ? 'In Progress' : 'Pending'}`,
                detail: `${task.area} / ${task.equipment}. Tools: ${task.reminderTools}.`,
                rank: index + 1,
                dueDate: task.time,
                priority: index === 0 ? 'Next best task' : 'Upcoming',
                accent: task.kind === 'cil' ? '#0288D1' : task.kind === 'changeover' ? '#2563EB' : '#FB8C00',
              }))
          : [];
        runExecutionChatTurn({
          userText: `Complete ${stepLabel}`,
          heading: `${stepLabel} completed`,
          assistantText: nextStep
            ? `Completed ${stepLabel}. Now continue with Step ${nextStepIndex + 1}: ${nextStep.code} ${nextStep.title}.`
            : `Completed ${stepLabel}. All ${guide?.mode ?? 'execution'} steps are complete. Review the summary below before final confirmation.`,
          beforeAssistant: () => {
            window.dispatchEvent(new CustomEvent('workstation:execution-chat-command', {
              detail: {action: 'complete-active', stepId},
            }));
            if (guide) {
              executionGuideRef.current = {
                ...guide,
                currentStepIndex: nextStepIndex,
              };
              if (isLastStep && guide.taskId) {
                window.dispatchEvent(new CustomEvent(MY_TASKS_COMPLETE_TASK_EVENT, {
                  detail: {taskId: guide.taskId},
                }));
              }
            }
          },
          priorityChanges: [
            `Step completed: ${stepLabel}`,
            nextStep ? `Next step: ${nextStep.code}` : 'Execution steps completed',
          ],
          extraAssistantMessages: nextStep
            ? [{
                role: 'assistant',
                text: `Step ${nextStepIndex + 1} is ready. Use Instructions if you need the SOP, then complete this card before moving on.`,
                variant: 'priority_cards',
                heading: `Step ${nextStepIndex + 1}`,
                badge: 'Execution context',
                priorityCards: [buildExecutionStepCard(nextStep, nextStepIndex)],
                compactCards: true,
              }]
            : [
                {
                  role: 'assistant',
                  text: `Here is the completed step summary for this ${guide?.mode ?? 'execution'} run.`,
                  variant: 'priority_cards',
                  heading: 'Execution summary',
                  badge: 'Execution context',
                  priorityCards: guide?.steps.map((step, index) => buildCompletedStepSummaryCard(step as NonNullable<typeof guideStep>, index)) ?? [],
                  compactCards: true,
                },
                {
                  role: 'assistant',
                  text: 'Execution completed. What do you want to do next?',
                  variant: 'quick_actions',
                  badge: 'Operator onboarding',
                  quickActions: [
                    {
                      label: 'Review remaining tasks',
                      action: () => setAiMessages((messages) => [
                        ...messages,
                        {role: 'user', text: 'Review remaining tasks', badge: 'Operator onboarding'},
                        {
                          role: 'assistant',
                          text: remainingTaskCards.length
                            ? `You still have ${remainingTaskCards.length} visible task${remainingTaskCards.length === 1 ? '' : 's'} to work next. I would start with ${remainingTaskCards[0].title}.`
                            : 'Your visible task queue is clean.',
                          variant: remainingTaskCards.length ? 'priority_cards' : 'priority_summary',
                          heading: 'Remaining tasks',
                          badge: 'Operator onboarding',
                          priorityCards: remainingTaskCards,
                          compactCards: Boolean(remainingTaskCards.length),
                        },
                      ]),
                    },
                    {
                      label: 'Review my shift',
                      action: showExecutionShiftReview,
                    },
                    {
                      label: 'Check production',
                      action: showExecutionProductionReview,
                    },
                  ],
                },
              ],
        });
        return;
      }

      if (action === 'record-value-complete') {
        const valueText = rawValue ?? '';
        const unitText = rawUnit ?? guideStep?.unit ?? '';
        handleAiSendWithExecutionContext(`Reading ${valueText} ${unitText} ${stepLabel}`.trim(), options);
        return;
      }
    }

    const pendingComment = pendingExecutionCommentRef.current;
    if (trimmedMessage && hasExecutionContext && pendingComment) {
      const commentText = trimmedMessage;
      pendingExecutionCommentRef.current = null;
      runExecutionChatTurn({
        userText: commentText,
        heading: `Comment saved ${pendingComment.code ?? ''}`.trim(),
        assistantText: `Saved this comment on ${pendingComment.code ?? 'the active step'}: "${commentText}"`,
        beforeAssistant: () => window.dispatchEvent(new CustomEvent('workstation:execution-chat-command', {
          detail: {action: 'save-comment', stepId: pendingComment.stepId, comment: commentText},
        })),
        priorityChanges: ['Comment added to execution step'],
      });
      return;
    };

    if (trimmedMessage && hasExecutionContext && explicitGuideStep && /\b(instructions?|sop)\b/i.test(trimmedMessage)) {
      runExecutionChatTurn({
        userText: trimmedMessage,
        heading: `Instructions ${explicitGuideStep.code}`,
        assistantText: `Opened the designed Instructions modal for ${explicitGuideStep.code}. Review the SOP, images, and video context there, then continue here.`,
        beforeAssistant: () => window.dispatchEvent(new CustomEvent('workstation:execution-chat-command', {
          detail: {action: 'open-instructions', stepId: explicitGuideStep.id},
        })),
      });
      return;
    }

    if (trimmedMessage && hasExecutionContext && explicitGuideStep && /\b(comment|note|observ)/i.test(trimmedMessage)) {
      runExecutionChatTurn({
        userText: trimmedMessage,
        heading: `Comment ${explicitGuideStep.code}`,
        assistantText: `Write the comment you want to save on ${explicitGuideStep.code}. I will add it to that execution step.`,
        beforeAssistant: () => {
          pendingExecutionCommentRef.current = {
            stepId: explicitGuideStep.id,
            code: explicitGuideStep.code,
            title: explicitGuideStep.title,
          };
        },
      });
      return;
    }

    if (trimmedMessage && hasExecutionContext && explicitGuideStep && /\b(report issue|issue|problem|problema|falha|anomalia)\b/i.test(trimmedMessage)) {
      window.dispatchEvent(new CustomEvent('workstation:execution-chat-command', {
        detail: {action: 'report-issue', stepId: explicitGuideStep.id},
      }));
      setAiInput('');
      if (options?.openDrawer !== false) setIsAiDrawerOpen(true);
      setAiMessages((current) => [
        ...current,
        {role: 'user', text: trimmedMessage},
        {
          role: 'assistant',
          text: `Issue context prepared for ${explicitGuideStep.code}: ${explicitGuideStep.title}. Describe the abnormal condition, impact, and whether production can continue.`,
          variant: 'priority_summary',
          heading: `Report issue ${explicitGuideStep.code}`,
          badge: 'Execution context',
        },
      ]);
      return;
    }

    if (trimmedMessage && hasExecutionContext && numericMatch) {
      const value = numericMatch[1];
      const guide = executionGuideRef.current;
      const activeStepIndex = guide && explicitStepIndex >= 0 ? explicitStepIndex : guide?.currentStepIndex;
      const activeStep = typeof activeStepIndex === 'number' ? guide?.steps[activeStepIndex] : undefined;
      const unit = activeStep?.unit ?? numericMatch[2] ?? (aiProblemFilter.toLowerCase().includes('centerline') || aiProblemFilter.toLowerCase().includes('cl') ? 'bar' : '');
      window.dispatchEvent(new CustomEvent('workstation:execution-chat-command', {
        detail: {
          action: 'record-value-complete',
          stepId: activeStep?.id,
          value,
        },
      }));
      setAiInput('');
      if (options?.openDrawer !== false) setIsAiDrawerOpen(true);

      if (guide && activeStep) {
        const buildExecutionStepCard = (step: typeof activeStep, index: number) => ({
          id: `execution-step-${step.id}-${Date.now()}`,
          title: `${step.code} ${step.title}`,
          signal: `Current step - ${step.unit ?? 'value'}`,
          detail: `${step.detail}${step.requiresImageProof ? ' Image proof is required before completion.' : ''}`,
          rank: index + 1,
          priority: step.unit ? `Enter ${step.unit}` : 'Enter value',
          accent: index === 0 ? '#2563EB' : index === 1 ? '#F59E0B' : '#0288D1',
          inputStepId: step.id,
          inputCode: step.code,
          inputUnit: step.unit,
          inputPlaceholder: step.target !== undefined ? String(step.target) : `Enter ${step.unit ?? 'value'}`,
          inputLabel: `Enter ${step.code} ${step.unit ?? 'value'}`,
          inputActionLabel: 'Complete',
          rangeLabel: step.min !== undefined && step.max !== undefined && step.unit
            ? `Min: ${step.min} ${step.unit} | Target: ${step.target} ${step.unit} | Max: ${step.max} ${step.unit}`
            : undefined,
          evidenceLabel: step.requiresImageProof ? 'Image Pending' : undefined,
        });
        const numericValue = Number(value);
        const hasRange = activeStep.min !== undefined && activeStep.max !== undefined;
        const isOutOfRange = hasRange && (numericValue < activeStep.min! || numericValue > activeStep.max!);
        const rangeText = hasRange
          ? `Expected range: ${activeStep.min}-${activeStep.max} ${unit}${activeStep.target !== undefined ? `, target ${activeStep.target} ${unit}` : ''}.`
          : undefined;
        const resolvedActiveIndex = activeStepIndex ?? guide.currentStepIndex;
        const isLastStep = resolvedActiveIndex >= guide.steps.length - 1;
        const nextStepIndex = isLastStep ? resolvedActiveIndex : resolvedActiveIndex + 1;
        executionGuideRef.current = {
          ...guide,
          currentStepIndex: nextStepIndex,
        };
        const nextStep = isLastStep ? undefined : executionGuideRef.current.steps[nextStepIndex];
        if (isLastStep && guide.taskId) {
          window.dispatchEvent(new CustomEvent(MY_TASKS_COMPLETE_TASK_EVENT, {
            detail: {taskId: guide.taskId},
          }));
        }

        const typingToken = `execution-step-typing-${Date.now()}`;
        setAiMessages((current) => [
          ...current,
          {role: 'user', text: trimmedMessage},
          {
            role: 'assistant',
            text: '',
            variant: 'typing',
            heading: isLastStep ? `Closing ${guide.mode}` : `Moving to ${nextStep?.code ?? 'next step'}`,
            badge: 'Execution context',
            contextualTypingToken: typingToken,
          } as any,
        ]);

        const timerId = window.setTimeout(() => {
          const statusLine = isOutOfRange
            ? `${activeStep.code} recorded as ${value} ${unit} and is OUT OF RANGE.`
            : `${activeStep.code} recorded as ${value} ${unit} and is in range.`;
          const nextText = nextStep
            ? `Done. ${statusLine} Taking you to step ${nextStepIndex + 1}: ${nextStep.code} ${nextStep.title}.`
            : `Done. ${statusLine} All ${guide.mode} steps are complete and I marked the My Tasks item as Completed.`;
          const remainingTaskCards = consolidatedTasks
            .filter((task) => task.id !== guide.taskId && task.status !== 'completed')
            .map((task, index) => ({
              id: `remaining-task-${task.id}`,
              title: task.title,
              signal: `${task.code} - ${task.status === 'in-progress' ? 'In Progress' : 'Pending'}`,
              detail: `${task.area} / ${task.equipment}. Tools: ${task.reminderTools}.`,
              rank: index + 1,
              dueDate: task.time,
              priority: index === 0 ? 'Next best task' : 'Upcoming',
              accent: task.kind === 'cil' ? '#0288D1' : task.kind === 'changeover' ? '#2563EB' : '#FB8C00',
            }));
          const completedStepCards = guide.steps.map((step, index) => ({
            id: `completed-step-${step.id}-${Date.now()}`,
            title: `${step.code} ${step.title}`,
            signal: 'Completed',
            detail: `${step.detail}${step.requiresImageProof ? ' Image/evidence requirement reviewed.' : ''}`,
            rank: index + 1,
            priority: step.id === activeStep.id ? `${value} ${unit}` : 'Completed',
            accent: '#16A34A',
          }));
          setAiMessages((current) => [
            ...current.filter((message) => message.contextualTypingToken !== typingToken),
            {
              role: 'assistant',
              text: `${nextText}${rangeText ? `\n\n${rangeText}` : ''}`,
              variant: 'priority_summary',
              heading: isLastStep ? `${guide.mode} complete` : `${activeStep.code} complete`,
              badge: 'Execution context',
              priorityChanges: [
                `${activeStep.code}: ${value} ${unit}`,
                isOutOfRange ? 'Out of range - consider Report Issue' : 'In range',
                nextStep ? `Next step: ${nextStep.code}` : 'My Tasks updated to Completed',
              ],
            },
            ...(nextStep ? [{
              role: 'assistant',
              text: `Now complete ${nextStep.code}.`,
              variant: 'priority_cards',
              heading: `Step ${nextStepIndex + 1}`,
              badge: 'Execution context',
              priorityCards: [buildExecutionStepCard(nextStep, nextStepIndex)],
              compactCards: true,
            }] : [
              {
                role: 'assistant',
                text: `Here is the completed step summary for this ${guide.mode} run.`,
                variant: 'priority_cards',
                heading: 'Execution summary',
                badge: 'Execution context',
                priorityCards: completedStepCards,
                compactCards: true,
              },
              {
                role: 'assistant',
                text: 'Execution completed. What do you want to do next?',
                variant: 'quick_actions',
                badge: 'Operator onboarding',
                quickActions: [
                  {
                    label: 'Review remaining tasks',
                    action: () => setAiMessages((messages) => [
                      ...messages,
                      {role: 'user', text: 'Review remaining tasks', badge: 'Operator onboarding'},
                      {
                        role: 'assistant',
                        text: remainingTaskCards.length
                          ? `You still have ${remainingTaskCards.length} visible task${remainingTaskCards.length === 1 ? '' : 's'} to work next. I would start with ${remainingTaskCards[0].title}.`
                          : 'Your visible task queue is clean.',
                        variant: 'priority_cards',
                        heading: 'Remaining tasks',
                        badge: 'Operator onboarding',
                        priorityCards: remainingTaskCards,
                        compactCards: true,
                      },
                    ]),
                  },
                  {
                    label: 'Review my shift',
                    action: showExecutionShiftReview,
                  },
                  {
                    label: 'Check production',
                    action: showExecutionProductionReview,
                  },
                ],
              },
            ]),
          ]);
          contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== timerId);
        }, 520);
        contextualAiTimersRef.current = [...contextualAiTimersRef.current, timerId];
        return;
      }

      setAiMessages((current) => [
        ...current,
        {role: 'user', text: trimmedMessage},
        {
          role: 'assistant',
          text: `Recorded ${value}${unit ? ` ${unit}` : ''} on the active step and completed it. Keep working here with BD Atlas AI, or send me the next reading/comment.`,
          variant: 'priority_summary',
          heading: 'Execution step updated',
          badge: 'Execution context',
          priorityChanges: [
            `Reading captured: ${value}${unit ? ` ${unit}` : ''}`,
            'Modal progress advanced to the next step',
          ],
        },
      ]);
      return;
    }

    if (trimmedMessage && hasExecutionContext && /\b(complete|completed|done|feito|conclui|concluir)\b/i.test(trimmedMessage)) {
      window.dispatchEvent(new CustomEvent('workstation:execution-chat-command', {
        detail: {
          action: 'complete-active',
        },
      }));
      setAiInput('');
      if (options?.openDrawer !== false) setIsAiDrawerOpen(true);
      setAiMessages((current) => [
        ...current,
        {role: 'user', text: trimmedMessage},
        {
          role: 'assistant',
          text: 'I completed the active step and advanced the flow to the next step.',
          variant: 'priority_summary',
          heading: 'Step completed',
          badge: 'Execution context',
        },
      ]);
      return;
    }

    handleAiSend(message, options);
  }, [
    aiProblemFilter,
    handleAiSend,
    isExecutionAssistantContext,
    setAiInput,
    setIsAiDrawerOpen,
    showExecutionProductionReview,
    showExecutionShiftReview,
  ]);

  const openContextualAiAssistant = useCallback((payload: ContextualAiAssistantPayload) => {
    clearContextualAiTimers();
    executionGuideRef.current = payload.executionGuide ? {...payload.executionGuide, currentStepIndex: 0} : null;
    setAiInput('');
    setAiDrawerWidth(520);
    setAiProblemFilterInput(payload.problemFilter ?? payload.contextTitle);
    setAiProblemFilter(payload.problemFilter ?? payload.contextTitle);
    const openingTypingToken = `contextual-open-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const openingTypingMessage = {
      role: 'assistant' as const,
      text: '',
      variant: 'typing' as const,
      heading: `Reading ${payload.contextTitle}`,
      badge: 'Logbook context',
      contextualTypingToken: openingTypingToken,
    };
    if (payload.preserveConversation) {
      setAiMessages((current) => [...current, openingTypingMessage]);
    } else {
      setAiMessages([openingTypingMessage]);
    }
    setIsAiDrawerOpen(true);

    const quickActions = payload.quickActions.map((quickAction) => ({
      label: quickAction.label,
      action: () => answerContextualAiQuestion(quickAction),
    }));

    const timerId = window.setTimeout(() => {
      const isExecutionPayload = Boolean(payload.executionGuide);
      const liveContextMessages = [
        {
          role: 'assistant',
          text: payload.openingText,
          variant: payload.openingCards?.length ? 'priority_cards' : 'priority_summary',
          heading: isExecutionPayload ? 'Execution overview' : `Live context: ${payload.contextTitle}`,
          badge: 'Logbook context',
          priorityCards: payload.openingCards,
          compactCards: Boolean(payload.openingCards?.length),
        },
      ] as any[];
      const followUpTypingToken = `contextual-open-followup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const executionGuideMessages = [
        {
          role: 'assistant',
          text: '',
          variant: 'typing',
          heading: 'Preparing step guidance',
          badge: 'Execution context',
          contextualTypingToken: followUpTypingToken,
        },
      ] as any[];
      const followUpMessages = [
        {
          role: 'assistant',
          text: isExecutionPayload
            ? 'When you are ready, I will start Step 1 and keep the step actions inside the card.'
            : 'Pick a question below and I will answer from this live context.',
          variant: 'priority_summary',
          heading: isExecutionPayload ? 'Ready for guided execution' : undefined,
          badge: isExecutionPayload ? 'Execution context' : undefined,
        },
        ...(quickActions.length ? [{
          role: 'assistant',
          text: isExecutionPayload ? 'Choose how BD Atlas AI should help with this execution.' : 'Pick a question below and I will answer from this live context.',
          variant: 'quick_actions',
          quickActions,
        }] : []),
      ] as any[];
      if (payload.preserveConversation) {
        setAiMessages((current) => [
          ...current.filter((message) => message.contextualTypingToken !== openingTypingToken),
          ...liveContextMessages,
          ...(isExecutionPayload ? executionGuideMessages : followUpMessages),
        ]);
      } else {
        setAiMessages([
          ...liveContextMessages,
          ...(isExecutionPayload ? executionGuideMessages : followUpMessages),
        ]);
      }
      if (isExecutionPayload) {
        const followUpTimerId = window.setTimeout(() => {
          setAiMessages((current) => [
            ...current.filter((message) => message.contextualTypingToken !== followUpTypingToken),
            ...followUpMessages,
          ]);
          contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== followUpTimerId);
        }, 760);
        contextualAiTimersRef.current = [...contextualAiTimersRef.current, followUpTimerId];
      }
      const autoRunAction = typeof payload.autoRunActionIndex === 'number'
        ? payload.quickActions[payload.autoRunActionIndex]
        : undefined;
      if (autoRunAction) {
        const autoRunTimerId = window.setTimeout(() => {
          answerContextualAiQuestion(autoRunAction);
        }, 650);
        contextualAiTimersRef.current = [...contextualAiTimersRef.current, autoRunTimerId];
      }
      contextualAiTimersRef.current = contextualAiTimersRef.current.filter((id) => id !== timerId);
    }, 950);
    contextualAiTimersRef.current = [...contextualAiTimersRef.current, timerId];
  }, [answerContextualAiQuestion, clearContextualAiTimers, setAiDrawerWidth, setAiInput, setIsAiDrawerOpen]);

  const isTechnicianUser = currentUserRole === 'technician';

  const {
    startGuideFromChat,
    handleGuideUserMessage,
    isGuideActive,
  } = useTechnicianMaintenanceRequestGuide({
    currentUserName,
    setAiMessages,
    setAiInput,
    setAiDrawerWidth,
    setAiProblemFilter,
    setAiProblemFilterInput,
    setIsAiDrawerOpen,
    setShiftEntryMaintenancePrefill,
    setShiftEntryMode,
    setIsShiftEntryOpen,
    clearTimers: clearContextualAiTimers,
    registerTimer: registerContextualAiTimer,
    unregisterTimer: unregisterContextualAiTimer,
  });

  const openTechnicianAssistantIntro = useCallback(() => {
    const firstName = currentUserName.split(' ')[0] || 'Technician';
    const introMessages = buildTechnicianDrawerIntroMessages(firstName);
    const priorityMessage = introMessages[introMessages.length - 1];

    setAiMessages([
      {
        role: 'assistant',
        text: '',
        variant: 'typing',
        heading: 'Preparing your shift priorities',
      },
    ]);
    setIsAiDrawerOpen(true);

    const introTimerId = window.setTimeout(() => {
      setAiMessages([
        ...introMessages.slice(0, -1),
        {
          ...priorityMessage,
          priorityCards: buildTechnicianDrawerPriorityCards(startGuideFromChat),
        },
      ]);
      unregisterContextualAiTimer(introTimerId);
    }, 950);
    registerContextualAiTimer(introTimerId);
  }, [
    currentUserName,
    registerContextualAiTimer,
    setAiMessages,
    setIsAiDrawerOpen,
    startGuideFromChat,
    unregisterContextualAiTimer,
  ]);

  const handleOpenAiAssistant = useCallback(() => {
    if (isTechnicianUser) {
      if (aiMessages.length === 0) {
        openTechnicianAssistantIntro();
      } else {
        setIsAiDrawerOpen(true);
      }
      return;
    }
    setIsAiDrawerOpen(true);
  }, [aiMessages.length, isTechnicianUser, openTechnicianAssistantIntro, setIsAiDrawerOpen]);

  const handleAiSendWithGuide = useCallback((message: string, options?: { openDrawer?: boolean }) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    if (isGuideActive() && handleGuideUserMessage(trimmedMessage)) {
      return;
    }

    if (isTechnicianUser && isMaintenanceRequestIntent(trimmedMessage) && !isGuideActive()) {
      setAiMessages((current) => [...current, { role: 'user', text: trimmedMessage }]);
      setAiInput('');
      if (options?.openDrawer ?? true) {
        setIsAiDrawerOpen(true);
      }
      startGuideFromChat();
      return;
    }

    handleAiSendWithExecutionContext(trimmedMessage, options);
  }, [
    handleAiSendWithExecutionContext,
    handleGuideUserMessage,
    isGuideActive,
    isTechnicianUser,
    setAiInput,
    setAiMessages,
    setIsAiDrawerOpen,
    startGuideFromChat,
  ]);

  const [shiftReplacementOverrides, setShiftReplacementOverrides] = useState<Record<string, string>>({});
  const [selectedShiftMember, setSelectedShiftMember] = useState<any>(null);

  const [siteMenuAnchorEl, setSiteMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);

  const {
    alertsPreviewCount,
    expandAlertsDashboard,
  } = useNotificationContext();

  const activeNavigationKey = getActiveNavigationKey(currentScreen);
  const currentUserInitials = currentUserName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleItemClick = (item: any) => {
    if (item.screen) {
      if (item.screen === 'production_planning') {
        setProductionPlanningResetKey((k) => k + 1);
      }
      if (item.screen === 'workstations') {
        openPublishedWorkstation('sample-maintenance-technician');
      } else {
        setCurrentScreen(item.screen);
      }
    }
  };

  const openContextualSmartSearch = () => {
    launchSmartSearch({
      draftQuery: 'Show me Columbus West site details with focus on Area A, Line 10, Zone 1.',
      focusHierarchyId: 'plant-columbus-west',
      hierarchySeedId: 'plant-columbus-west',
      preset: 'columbus-west-site',
    });
  };

  const handleOpenSiteMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSiteMenuAnchorEl(event.currentTarget);
  };
  const handleCloseSiteMenu = () => {
    setSiteMenuAnchorEl(null);
  };
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };
  const handleCloseUserMenu = () => {
    setUserMenuAnchorEl(null);
  };

  const openMaintenanceRequestEntry = () => {
    setShiftEntryMode('maintenance');
    setIsShiftEntryOpen(true);
  };

  // Derived calculations
  const teamManagementVisibleMembers = teamManagementMembers.filter((member) => {
    const search = teamManagementSearch.trim().toLowerCase();
    const matchesSearch = !search || `${member.name} ${member.role}`.toLowerCase().includes(search);
    const matchesZone = teamManagementFilters.zone === 'All' || member.zone === teamManagementFilters.zone;
    const matchesEquipment = teamManagementFilters.equipment === 'All' || member.equipment === teamManagementFilters.equipment;
    const matchesCertification = teamManagementFilters.certification === 'All' || member.certification === teamManagementFilters.certification;
    const matchesRole = teamManagementFilters.role === 'All' || member.role === teamManagementFilters.role;
    const matchesLine = teamManagementLineView === 'Combined'
      || member.line === (teamManagementLineView === 'Line A' ? 'A' : 'B');
    return matchesSearch && matchesZone && matchesEquipment && matchesCertification && matchesRole && matchesLine;
  });

  const teamManagementMembersByShift: Record<string, TeamManagementMember[]> = Object.fromEntries(
    teamShiftDefinitions.map((shiftDef) => [
      shiftDef.id,
      teamManagementVisibleMembers.filter((member) => member.shift === shiftDef.id),
    ])
  );

  const urgentAiTasks = getUrgentAiTasks(setCurrentScreen);

  const workflowRecommendations = [
    {
      title: 'Cover Maria on Line 10',
      workflow: 'Shift Logbook',
      detail: `${staffingSignals[0].operator} is ${staffingSignals[0].status.toLowerCase()} in ${staffingSignals[0].area}, and ${staffingSignals[0].nextNeed.toLowerCase()}. BD Atlas AI recommends starting a shift swap and notifying ${staffingSignals[0].backup}.`,
      accent: '#38bdf8',
      actionLabel: 'Open Shift Coverage',
      action: () => setCurrentScreen('shift_logbook'),
    },
    {
      title: urgentAiTasks[0].title,
      workflow: 'Work Order Hub',
      detail: `${urgentAiTasks[0].detail} for ${urgentAiTasks[0].owner}. This is already in the urgent queue, so the fastest next step is the maintenance workflow with a draft note ready to send.`,
      accent: urgentAiTasks[0].color,
      actionLabel: 'Open Work Order Hub',
      action: () => setCurrentScreen('work_order_hub'),
    },
    {
      title: actionTrackerItems[1].title,
      workflow: 'Smart Search',
      detail: `${actionTrackerItems[1].status} in Action Tracker and connected to the document flow. BD Atlas AI can take you into Smart Search to narrow the approval queue immediately.`,
      accent: '#FF6E00',
      actionLabel: 'Open Smart Search',
      action: () => setCurrentScreen('smart_search'),
    },
    {
      title: shiftLogItems[1].title,
      workflow: 'Tier Meeting',
      detail: `${shiftLogItems[1].detail} This should be called out in the next tier review alongside ${tierMeetingCards[1].value.toLowerCase()} on ${tierMeetingCards[1].label.toLowerCase()}.`,
      accent: '#9199D8',
      actionLabel: 'Open Tier Meeting',
      action: () => setCurrentScreen('tier_meeting'),
    },
  ];

  useEffect(() => {
    if (currentScreen !== 'action_tracker') {
      setActionTrackerBoardCategoryFilter('');
      closeActionTrackerDetails();
      closeActionCreateDrawer();
    }
  }, [currentScreen]);

  const isAiDrawerResizingRef = useRef(false);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (!isAiDrawerResizingRef.current) return;
      const viewportWidth = window.innerWidth;
      const nextWidth = viewportWidth - event.clientX;
      const clamped = Math.max(340, Math.min(760, nextWidth));
      setAiDrawerWidth(clamped);
    };

    const onMouseUp = () => {
      isAiDrawerResizingRef.current = false;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  return (
    <MainLayout
      currentScreen={currentScreen}
      activeNavigationKey={activeNavigationKey}
      isSideNavExpanded={isSideNavExpanded}
      setIsSideNavExpanded={setIsSideNavExpanded}
      isMobileSideNavOpen={isMobileSideNavOpen}
      setIsMobileSideNavOpen={setIsMobileSideNavOpen}
      currentUserInitials={currentUserInitials}
      currentUserName={currentUserName}
      onItemClick={handleItemClick}
      onItemHover={() => { }}
      openSmartSearch={openContextualSmartSearch}
      setIsAppLibraryOpen={setIsAppLibraryOpen}
      setIsAiDrawerOpen={setIsAiDrawerOpen}
      onOpenAiAssistant={handleOpenAiAssistant}
      setCurrentScreen={setCurrentScreen}
      goToLastWorkstation={goToLastWorkstation}
      siteMenuAnchorEl={siteMenuAnchorEl}
      openSiteMenu={handleOpenSiteMenu}
      closeSiteMenu={handleCloseSiteMenu}
      selectedHeaderHierarchyId={selectedHeaderHierarchyId}
      favoriteHeaderHierarchyIds={favoriteHeaderHierarchyIds}
      selectHeaderHierarchy={setSelectedHeaderHierarchyId}
      toggleFavoriteHeaderHierarchy={toggleFavoriteHeaderHierarchyId}
      userMenuAnchorEl={userMenuAnchorEl}
      openUserMenu={handleOpenUserMenu}
      closeUserMenu={handleCloseUserMenu}
      alertsPreviewCount={alertsPreviewCount}
      openAlertsPreview={expandAlertsDashboard}
      showWorkstationSubMenu={currentScreen === 'my_workstation' || currentScreen === 'workstation'}
      workstationSubMenu={<WorkstationSubMenu />}
      isControlTowerScreen={currentScreen === 'control_tower'}
    >
      <Suspense fallback={
        <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, px: 3 }}>
          <CircularProgress size={36} />
          <Typography variant="body2" sx={{ color: activeTheme.textSecondary, fontWeight: 600 }}>
            Loading workspace screen...
          </Typography>
        </Box>
      }>
        <AppRoutes
          currentScreen={currentScreen}
          activeTheme={activeTheme}
          setCurrentScreen={setCurrentScreen}
          openSmartSearch={openContextualSmartSearch}
          setIsDrawerOpen={setIsAppLibraryOpen}
          setIsAiDrawerOpen={setIsAiDrawerOpen}
          handleAiSend={handleAiSendWithGuide}
          currentUserName={currentUserName}
          currentUserFirstName={currentUserName.split(' ')[0]}
          currentUserRole={currentUserRole}
          aiMessages={aiMessages}
          setIsAppLibraryOpen={setIsAppLibraryOpen}
          homeViewMode={homeViewMode}
          setHomeViewMode={setHomeViewMode}
          homeSiteScope={homeSiteScope}
          setHomeSiteScope={setHomeSiteScope}
          openMainAiForDocument={() => { }}
          openMainAiForWorkflow={() => { }}
          setSelectedDocument={() => { }}
          selectedDocument={null}
          setSelectedArtifact={setSelectedArtifact}
          selectedArtifact={selectedArtifact}
          setSetupOptions={() => { }}
          maintenanceKpis={{}}
          maintenanceAssets={[]}
          maintenanceWorkOrders={[]}
          productionImprovementData={{}}
          workstationSignals={[]}
          workstationInsights={[]}
          openWorkOrderHub={() => setCurrentScreen('work_order_hub')}
          openMaintenanceRequestEntry={openMaintenanceRequestEntry}
          onEsoSaved={() => { }}
          onOpenWorkstations={openPublishedWorkstation}
          openPredefinedWorkstation={openPredefinedWorkstation}
          onCreateBlankWorkstation={openBlankWorkstationDraft}
          openWorkstationAppFromSubmenu={openWorkstationAppFromSubmenu}
          openAlertsPreview={expandAlertsDashboard}
          tierMeetingCards={tierMeetingCards}
          orgChartDraft={orgChartDraft}
          activeWorkstationLayoutKey={activeWorkstationLayoutKey}
          isActiveWorkstationDraftEmpty={isActiveWorkstationDraftEmpty}
          workstationCreateStreams={workstationCreateStreams}
          lightHeaderIconButtonSx={{}}
          handleStartNewChat={handleStartNewChat}
          handleShareChat={handleShareChat}
          chatShareNotice={chatShareNotice}
          setAiMessages={setAiMessages}
          openContextualAiAssistant={openContextualAiAssistant}
          homeChatInput={homeChatInput}
          productionPlanningResetKey={productionPlanningResetKey}
          selectedHeaderHierarchyId={selectedHeaderHierarchyId}
          selectHeaderHierarchy={setSelectedHeaderHierarchyId}
          openColumbusWestLogbook3D={openColumbusWestLogbook3D}
          aiProblemFilter={aiProblemFilter}
        />
      </Suspense>

      <Suspense fallback={null}>
        <AppLibraryDrawer
          activeTheme={activeTheme}
        />
        <ShiftLogbookDrawers activeTheme={activeTheme} />
        <AiCopilotDrawer
          open={isAiDrawerOpen}
          onClose={() => setIsAiDrawerOpen(false)}
          currentScreen={currentScreen}
          openAiHome={() => {
            setIsAiDrawerOpen(false);
            setCurrentScreen('ai_assistant');
          }}
          aiMessages={aiMessages}
          currentUserInitials={currentUserInitials}
          aiInput={aiInput}
          setAiInput={setAiInput}
          handleAiSend={handleAiSendWithGuide}
          activeTheme={activeTheme}
          drawerHeaderIconButtonSx={{}}
          isAiDrawerResizingRef={isAiDrawerResizingRef}
          aiDrawerWidth={aiDrawerWidth}
          lightDrawerPanelSx={{}}
          aiProblemFilterInput={aiProblemFilterInput}
          setAiProblemFilterInput={setAiProblemFilterInput}
          aiProblemFilter={aiProblemFilter}
          setAiProblemFilter={setAiProblemFilter}
        />
        <ActionTrackerCreateDrawer />
        <ActionTrackerDetailsDialog setAiMessages={setAiMessages} />
        <ShiftEntry
          open={isShiftEntryOpen}
          onClose={() => {
            setIsShiftEntryOpen(false);
            setShiftEntryMaintenancePrefill(null);
          }}
          onOpenDashboard={() => setCurrentScreen('eso_hub')}
          currentUserName={currentUserName}
          initialMode={shiftEntryMode}
          maintenancePrefill={shiftEntryMaintenancePrefill}
        />
      </Suspense>
    </MainLayout>
  );
}

