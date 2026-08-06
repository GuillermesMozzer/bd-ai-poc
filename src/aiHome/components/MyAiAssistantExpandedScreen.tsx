import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  IconButton,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArticleOutlined as DocumentIcon,
  AutoAwesome as SparkleIcon,
  BookmarkBorderRounded as FavoritesIcon,
  ChatBubbleOutlineRounded as ChatBubbleIcon,
  CreateNewFolderOutlined as CreateFolderIcon,
  HelpOutlineRounded as HelpIcon,
  PushPinOutlined as PinnedIcon,
  SettingsOutlined as SettingsIcon,
  ShareOutlined as SharedChatsIcon,
  SmartToy as AssistantRobotIcon,
  FolderOutlined as FolderIcon,
  SearchRounded as SearchIcon,
} from '@mui/icons-material';
import {seedTier1NcWorkflowIssue} from '../../workstation/components/workflowIssueStore';
import EquipmentContextDrawer, {type ContextRecord} from './EquipmentContextDrawer';
import AiAssistantComposer from './AiAssistantComposer';
import {
  maintenanceSummaryItems,
  maintenanceContextByAssetId,
  MaintenanceContextRecord,
  MaintenanceContextAssetId
} from './maintenanceSummaryData';
import type {MaintenanceCard, MaintenancePriority} from '../../Maintenance/types';
import {
  buildWorkOrderDraftFromRequest,
  CreateWorkOrderDrawer,
  MaintenanceRequestDrawer,
  type WorkOrderDraft,
  type WorkOrderTab,
} from '../../Maintenance/pages/MaintenanceFollowUpBoardPage';
import {
  ReportProblemOutlined as ReportProblemIcon,
  ChevronRightRounded as ChevronRightIcon,
  PersonOutline as PersonIcon,
  AccessTime as AccessTimeIcon,
  LocationOnOutlined as LocationIcon,
} from '@mui/icons-material';
import {
  buildMyAiAssistantGreeting,
  MY_AI_ASSISTANT_INTRO_COPY,
  MY_AI_ASSISTANT_DIRECTOR_CARD_CONTENT,
  MY_AI_ASSISTANT_OPERATOR_CARD_CONTENT,
  MY_AI_ASSISTANT_TECHNICIAN_CARD_CONTENT,
  MY_AI_ASSISTANT_PLANNER_CARD_CONTENT,
  MY_AI_ASSISTANT_SITE_NEWS_HEADING,
  buildMyAiAssistantSiteContextGreeting,
  buildMyAiAssistantSitePriorityHeading,
  buildMyAiAssistantSitePriorityPrompt,
  buildMyAiAssistantOperatorPriorityHeading,
  buildMyAiAssistantTechnicianPriorityHeading,
  buildMyAiAssistantPlannerPriorityHeading,
  buildMyAiAssistantUrgentTaskContent,
} from '../contexts/myAiAssistantContent';
import { type AppUserRole } from '../../utils/user';
import { tokenBrand, tokenCommon, tokenDivider, tokenText, workstationVisuals } from '../../workstation/theme';
import {BbsReportDrawer, type ReportRow} from '../../shopfloor/components/EsoHubScreen';

const actionTrackerAutoOpenAiFlag = 'action-tracker-open-ai-prioritization';

type PriorityCardDescriptor = {
  title: string;
  detail: string;
  owner: string;
  severity: string;
  color: string;
  action: () => void;
};

type AiMessage = {
  role: 'user' | 'assistant';
  text: string;
  variant?: 'message' | 'action' | 'priority_cards' | 'maintenance_summary' | 'priority_summary' | 'technician_work_orders' | 'planner_priority_queue' | 'team_esos_summary';
  actionLabel?: string;
  accent?: string;
  action?: () => void;
  heading?: string;
  priorityCards?: PriorityCardDescriptor[];
  badge?: string;
  priorityReasons?: Array<{
    label: string;
    detail: string;
    tone: 'critical' | 'warning' | 'info' | 'success';
  }>;
  priorityChanges?: string[];
};

type HomeChatHistoryEntry = {
  label: string;
  meta: string;
  selected: boolean;
};

type AssistantWorkspaceView = 'chat' | 'settings';

type ChatMaintenanceRequestCard = MaintenanceCard & {
  requestContext: {
    requestId: string;
    maintenanceType: string;
    location: string;
    createdBy: string;
    activityType: string;
    downtime: string;
    quality: string;
    ehs: string;
    equipment: string;
  };
};

type TechnicianAssignedWorkOrder = {
  title: string;
  woCode: string;
  type: string;
  line: string;
  equipment: string;
  due: string;
  dueTone: string;
  status: string;
  statusTone: string;
};

type TeamEsoReviewItem = {
  id: string;
  type: string;
  owner: string;
  area: string;
  line: string;
  supervisor: string;
  reportDate: string;
  lastUpdate: string;
  tone: string;
};

type MyAiAssistantExpandedScreenProps = {
  themeMode: 'light' | 'dark';
  homeViewMode: string;
  homeChatScrollRef: React.RefObject<HTMLDivElement | null>;
  aiMessages: AiMessage[];
  currentUserInitials: string;
  currentUserFirstName: string;
  currentUserRole: AppUserRole;
  homeDirectorNewsCards: PriorityCardDescriptor[];
  urgentAiTasks: PriorityCardDescriptor[];
  homeChatShowMore: boolean;
  activeHomePriorityCard: string | null;
  homeAssistantTypingVisible: boolean;
  homeChatInput: string;
  chatFolders: string[];
  homeChatHistoryEntries: HomeChatHistoryEntry[];
  chatShareNotice: string;
  onThemeModeToggle: () => void;
  onSetHomeChatShowMore: React.Dispatch<React.SetStateAction<boolean>>;
  onSetHomeChatInput: React.Dispatch<React.SetStateAction<string>>;
  onHandleAiSend: (message: string, options?: { openDrawer?: boolean }) => void;
  onClearHomeChatAutomation: () => void;
  onSetHomeAssistantTypingVisible: React.Dispatch<React.SetStateAction<boolean>>;
  onSetCurrentScreen: (screen: string) => void;
  onClearSiteContext: () => void;
  onOpenQualityAlert: () => void;
  onSelectSiteContext: (siteName: string) => void;
  onStartNewChat: () => void;
  onShareChat: (mode: 'copy' | 'team' | 'export') => void;
  onSetAiMessages: React.Dispatch<React.SetStateAction<any[]>>;
  onOpenPredefinedWorkstation: (title: string, options?: { seedNcIssue?: boolean }) => void;
};

const maintenancePriorityBySummaryPriority: Record<
  (typeof maintenanceSummaryItems)[number]['priority'],
  MaintenancePriority
> = {
  Critical: 'Emergency',
  High: 'High',
  Medium: 'Medium',
};

function buildChatMaintenanceRequestCard(item: (typeof maintenanceSummaryItems)[number]): ChatMaintenanceRequestCard {
  return {
    id: `mr-chat-${item.assetId}`,
    title: item.title,
    detail: `${item.descriptionPrefix}${item.equipmentName}${item.descriptionSuffix}`,
    assignee: item.reporter,
    due: item.createdAt,
    priority: maintenancePriorityBySummaryPriority[item.priority],
    requestContext: {
      requestId: item.requestId,
      maintenanceType: item.priority === 'Critical' ? 'Breakdown' : 'Corrective',
      location: item.location,
      createdBy: `${item.reporter}, ${item.createdAt}`,
      activityType: item.priority === 'Critical' ? 'Mechanical' : 'Inspection',
      downtime: item.priority === 'Critical' ? 'High' : 'Medium',
      quality: item.priority === 'Critical' ? 'High' : 'Medium',
      ehs: item.priority === 'Medium' ? 'Low' : 'Medium',
      equipment: item.equipmentName,
    },
  };
}

function buildChatWorkOrderRequestCard(workOrder: TechnicianAssignedWorkOrder): MaintenanceCard & {
  requestContext: ChatMaintenanceRequestCard['requestContext'];
} {
  const priority: MaintenancePriority = workOrder.due.includes('Overdue') || workOrder.type === 'Breakdown'
    ? 'High'
    : workOrder.type === 'Emergency'
      ? 'Emergency'
      : 'Medium';

  return {
    id: `chat-${workOrder.woCode.toLowerCase().replace(/\s+/g, '-')}`,
    title: workOrder.title,
    detail: `${workOrder.type} work order for ${workOrder.equipment} on ${workOrder.line}. Current state: ${workOrder.status}.`,
    assignee: 'Maintenance Technician',
    due: workOrder.due,
    priority,
    requestContext: {
      requestId: workOrder.woCode,
      maintenanceType: workOrder.type,
      location: workOrder.line,
      createdBy: 'Maintenance scheduler',
      activityType: workOrder.type === 'Preventive' ? 'Preventive Maintenance' : workOrder.type === 'Breakdown' ? 'Mechanical' : 'Corrective Maintenance',
      downtime: workOrder.due.includes('Overdue') ? 'High' : 'Medium',
      quality: workOrder.type === 'Breakdown' ? 'High' : 'Medium',
      ehs: workOrder.status === 'In Progress' ? 'Medium' : 'Low',
      equipment: workOrder.equipment,
    },
  };
}

const technicianAssignedWorkOrders: TechnicianAssignedWorkOrder[] = [
  {
    title: 'Conveyor drive failure',
    woCode: 'WO 606034603',
    type: 'Breakdown',
    line: 'Autoguard Line 10',
    equipment: 'Conveyor CV-210',
    due: 'Overdue Jan 13',
    dueTone: '#EF4444',
    status: 'In Progress',
    statusTone: '#1D4ED8',
  },
  {
    title: 'Packaging Robot Arm',
    woCode: 'WO 606034604',
    type: 'Corrective',
    line: 'Autoguard Line 10',
    equipment: 'Packaging Robot RB-402',
    due: 'Due Jan 16',
    dueTone: '#2563EB',
    status: 'Scheduled',
    statusTone: '#0F766E',
  },
  {
    title: 'Pump seal inspection',
    woCode: 'WO 606034605',
    type: 'Preventive',
    line: 'Autoguard Line 10',
    equipment: 'Transfer Pump P-118',
    due: 'Overdue Jan 12',
    dueTone: '#EF4444',
    status: 'Scheduled',
    statusTone: '#F97316',
  },
  {
    title: 'Sensor on Z2.C20',
    woCode: 'WO 606034606',
    type: 'Corrective',
    line: 'Autoguard Line 10',
    equipment: 'Photoeye Sensor Z2.C20',
    due: 'Due Feb 12',
    dueTone: '#2563EB',
    status: 'Scheduled',
    statusTone: '#F97316',
  },
];

const plannerPriorityWorkOrders: TechnicianAssignedWorkOrder[] = [
  {
    title: 'Emergency WO readiness check',
    woCode: 'WO 606034607',
    type: 'Emergency',
    line: 'Autoguard Line 10',
    equipment: 'Conveyor CV-210',
    due: 'Due Today',
    dueTone: '#EF4444',
    status: 'Needs Parts',
    statusTone: '#EF4444',
  },
  {
    title: 'PM window conflict',
    woCode: 'WO 606034608',
    type: 'Preventive',
    line: 'Packaging Line 3',
    equipment: 'Packaging Robot RB-402',
    due: 'Due Jan 15',
    dueTone: '#F97316',
    status: 'Reschedule',
    statusTone: '#F97316',
  },
  {
    title: 'Planner approval required',
    woCode: 'WO 606034609',
    type: 'Corrective',
    line: 'Utilities',
    equipment: 'Transfer Pump P-118',
    due: 'Due Jan 16',
    dueTone: '#2563EB',
    status: 'Awaiting Plan',
    statusTone: '#2563EB',
  },
  {
    title: 'Critical sensor follow-up',
    woCode: 'WO 606034610',
    type: 'Condition Based',
    line: 'Autoguard Line 10',
    equipment: 'Photoeye Sensor Z2.C20',
    due: 'Due Jan 17',
    dueTone: '#7C3AED',
    status: 'CBM Signal',
    statusTone: '#7C3AED',
  },
];

const teamEsoReviewItems: TeamEsoReviewItem[] = [
  {
    id: 'ESO-2024-102918',
    type: 'Condition Report',
    owner: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    lastUpdate: 'May 06, 2026 08:09 PM',
    tone: '#FF8A00',
  },
  {
    id: 'ESO-2024-102892',
    type: 'Near Miss',
    owner: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    lastUpdate: 'May 06, 2026 08:09 PM',
    tone: '#E43B46',
  },
  {
    id: 'ESO-2024-102881',
    type: 'Condition Report',
    owner: 'Diana Costa',
    area: 'Warehouse South',
    line: 'Dock 2 pedestrian lane',
    supervisor: 'Rafael Gomez',
    reportDate: 'May 08, 2026 01:26 PM',
    lastUpdate: 'May 08, 2026 04:15 PM',
    tone: '#FF8A00',
  },
];

export default function MyAiAssistantExpandedScreen({
  themeMode,
  homeChatScrollRef,
  aiMessages,
  currentUserInitials,
  currentUserFirstName,
  currentUserRole,
  homeDirectorNewsCards,
  urgentAiTasks,
  homeChatShowMore,
  activeHomePriorityCard,
  homeAssistantTypingVisible,
  homeChatInput,
  chatFolders,
  homeChatHistoryEntries,
  chatShareNotice,
  onSetHomeChatShowMore,
  onSetHomeChatInput,
  onHandleAiSend,
  onClearHomeChatAutomation,
  onSetHomeAssistantTypingVisible,
  onSetCurrentScreen,
  onSelectSiteContext,
  onStartNewChat,
  onShareChat,
  onSetAiMessages,
  onOpenPredefinedWorkstation,
}: MyAiAssistantExpandedScreenProps) {
  const simulationStartedRef = React.useRef(false);
  const isAssistantScreenMountedRef = React.useRef(true);
  const [localHomeChatShowMore, setLocalHomeChatShowMore] = React.useState(homeChatShowMore);
  const [localHomeAssistantTypingVisible, setLocalHomeAssistantTypingVisible] = React.useState(homeAssistantTypingVisible);
  const [localHomeChatInput, setLocalHomeChatInput] = React.useState(homeChatInput);
  const [localActiveHomePriorityCard, setLocalActiveHomePriorityCard] = React.useState<string | null>(activeHomePriorityCard);
  const [chatLibraryQuery, setChatLibraryQuery] = React.useState('');
  const [localChatFolders, setLocalChatFolders] = React.useState(chatFolders);
  const [assistantWorkspaceView, setAssistantWorkspaceView] = React.useState<AssistantWorkspaceView>('chat');

  React.useEffect(() => {
    isAssistantScreenMountedRef.current = true;
    return () => {
      isAssistantScreenMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    setLocalHomeChatShowMore(homeChatShowMore);
  }, [homeChatShowMore]);

  React.useEffect(() => {
    setLocalHomeAssistantTypingVisible(homeAssistantTypingVisible);
  }, [homeAssistantTypingVisible]);

  React.useEffect(() => {
    setLocalHomeChatInput(homeChatInput);
  }, [homeChatInput]);

  React.useEffect(() => {
    setLocalActiveHomePriorityCard(activeHomePriorityCard);
  }, [activeHomePriorityCard]);

  React.useEffect(() => {
    setLocalChatFolders(chatFolders);
  }, [chatFolders]);

  const effectiveThemeMode = themeMode;
  const effectiveHomeChatShowMore = localHomeChatShowMore;
  const effectiveHomeAssistantTypingVisible = localHomeAssistantTypingVisible;
  const effectiveHomeChatInput = localHomeChatInput;
  const effectiveActiveHomePriorityCard = localActiveHomePriorityCard;
  const effectiveHomeDirectorNewsCards = homeDirectorNewsCards.length
    ? homeDirectorNewsCards
    : MY_AI_ASSISTANT_DIRECTOR_CARD_CONTENT.map((card) => ({
        title: card.title,
        detail: card.detail,
        owner: card.owner,
        severity: card.severity,
        color: card.color,
        action: () => {},
      }));
  const effectiveUrgentAiTasks = urgentAiTasks.length
    ? urgentAiTasks
    : buildMyAiAssistantUrgentTaskContent().map((task) => ({
        ...task,
        action: () => {},
      }));
  const defaultScopeLabel = currentUserRole === 'leader'
    ? 'Leader'
    : currentUserRole === 'operator'
      ? 'Operator'
      : currentUserRole === 'technician'
        ? 'Technician'
        : currentUserRole === 'planner'
          ? 'Planner'
          : 'Director';

  const updateHomeChatShowMore = (updater: React.SetStateAction<boolean>) => {
    setLocalHomeChatShowMore((prev) => {
      const nextValue = typeof updater === 'function'
        ? (updater as (prevState: boolean) => boolean)(prev)
        : updater;
      onSetHomeChatShowMore(nextValue);
      return nextValue;
    });
  };

  const updateHomeChatInput = (nextValue: string) => {
    setLocalHomeChatInput(nextValue);
    onSetHomeChatInput(nextValue);
  };

  const updateHomeAssistantTypingVisible = (nextValue: boolean) => {
    setLocalHomeAssistantTypingVisible(nextValue);
    onSetHomeAssistantTypingVisible(nextValue);
  };

  const handleOpenGlobalViewFromChat = async () => {
    setLocalActiveHomePriorityCard('Open Global View');
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      { role: 'user', text: 'Take me to the Global View.' },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 900));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'Taking you to Global View so you can scan network risk, top issue sites, and cross-site movement first.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 700));

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
    onClearHomeChatAutomation();
    onSetCurrentScreen('global_view');
  };

  const handleNcGuidedTierPrep = async () => {
    setLocalActiveHomePriorityCard('NC Raised This Morning');
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: 'Can you break down the NC raised this morning and show me what I should bring into Tier 1?',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 950));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'The NC came from Line 3 after a sealing defect was found on Batch B20260412-10. Two lots are already on hold, quality still needs the confirmed owner, and operations should bring a short containment summary with suspected root cause, output impact, and the immediate next checks.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 950));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'I already mapped this into your Tier 1 discussion flow, so you can open the seeded board with the right line context and follow-up path.',
        variant: 'action',
        accent: '#E43B46',
        actionLabel: 'Open Tier 1 workflow',
        action: () => {
          seedTier1NcWorkflowIssue();
          onClearHomeChatAutomation();
          updateHomeAssistantTypingVisible(false);
          onOpenPredefinedWorkstation('Tier 1', { seedNcIssue: true });
        },
      },
    ]);

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
  };

  const handleActionPriorityGuide = async () => {
    setLocalActiveHomePriorityCard('My Action Priorities Today');
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: 'Show me which actions I should focus on first today.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 900));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'BD Atlas AI found a top 5 focus bundle for you. Two actions are already overdue, three more cluster inside the next 7 days, and the strongest shared signals are approval blockers, repeated quality follow-up, and open operational exposure.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 850));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'I can open Action Tracker with the prioritization drawer ready, explain why these five came first, and then reorder the queue live if you want to apply it.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 950));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'Open Action Tracker and I will take you straight into the prioritization flow there.',
        variant: 'action',
        accent: '#4F46E5',
        actionLabel: 'Open Action Tracker',
        action: () => {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(actionTrackerAutoOpenAiFlag, 'true');
          }
          onClearHomeChatAutomation();
          updateHomeAssistantTypingVisible(false);
          setLocalActiveHomePriorityCard(null);
          onSetCurrentScreen('action_tracker');
        },
      },
    ]);

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
  };

  const handleOpenFollowUpBoardFromChat = async (sourceCardTitle: string = 'Maintenance Requests - 24h') => {
    setLocalActiveHomePriorityCard(sourceCardTitle);
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      { role: 'user', text: 'Take me to the Follow-up board.' },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 900));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'Opening the Follow-up board so you can review ownership, aging items, and the next maintenance moves with your team context ready.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 700));

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
    onClearHomeChatAutomation();
    onSetCurrentScreen('maintenance_followup');
  };

  const handleMaintenanceRequestsGuide = async (sourceCardTitle: string = 'Maintenance Requests - 24h') => {
    setLocalActiveHomePriorityCard(sourceCardTitle);
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: 'Show me the maintenance requests from my team.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 900));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'I pulled the maintenance requests that need team follow-up right now. Tap any request to inspect the equipment context, or continue to the Follow-up board for the full queue.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 850));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'These are the maintenance requests I would review first with your team today.',
        variant: 'maintenance_summary',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 950));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'If you want, I can take you straight into the Follow-up board next.',
        variant: 'action',
        accent: '#0F766E',
        actionLabel: 'Open Follow-up board',
        action: () => {
          void handleOpenFollowUpBoardFromChat(sourceCardTitle);
        },
      },
    ]);

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
  };

  const handleTeamEsosGuide = async (sourceCardTitle: string = 'My Team ESOs') => {
    setLocalActiveHomePriorityCard(sourceCardTitle);
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: 'Show me My Team ESOs.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 900));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'I checked your team ESO widget for the current month. Your team submitted 32 of 40 expected ESOs, so target progress is 80%. There are 20 open ESOs, 5 awaiting review, 6 action-in-progress, and 3 SPO near misses. Team participation is 78%, while the contact rate is 1.4 against a 2.3 target.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 850));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'These are the 3 awaiting review ESOs I would open first. Click an item to go to the ESO dashboard with the review context.',
        variant: 'team_esos_summary',
      },
    ]);

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
  };

  const handleOpenOperatorScreen = async (input: {
    cardTitle: string;
    userText: string;
    assistantText: string;
    screen: string;
  }) => {
    setLocalActiveHomePriorityCard(input.cardTitle);
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      { role: 'user', text: input.userText },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 900));

    onSetAiMessages((prev) => [
      ...prev,
      { role: 'assistant', text: input.assistantText },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 700));

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
    onClearHomeChatAutomation();
    onSetCurrentScreen(input.screen);
  };

  const handleBuildOperatorWorkstation = async () => {
    setLocalActiveHomePriorityCard('Build My Workstation');
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: 'Build my workstation with my priorities.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 950));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'I am assembling your operator workstation with CIL, centerline, and changeover in the first view.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 1050));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'Your Operator View is ready. I am taking you there now so you can start from the priorities we just lined up.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 750));

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
    onClearHomeChatAutomation();
    onOpenPredefinedWorkstation('Operator View');
  };

  
  const handleBuildLeaderWorkstation = async () => {
    setLocalActiveHomePriorityCard('Build My Workstation');
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: 'Build my workstation with my team priorities.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 950));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'I am assembling your leader workstation with the maintenance requests opened by your team in the first view.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 1050));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'Your Leader View is ready. I am taking you there now so you can review the queue with context and act faster.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 750));

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
    onClearHomeChatAutomation();
    onOpenPredefinedWorkstation('Leader View');
  };

  const handleContextThenAction = async (input: {
    cardTitle: string;
    userText: string;
    contextText: string;
    actionText: string;
    actionLabel: string;
    accent: string;
    screen: string;
    productionPlanningPageId?: string;
  }) => {
    setLocalActiveHomePriorityCard(input.cardTitle);
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      { role: 'user', text: input.userText },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 900));

    onSetAiMessages((prev) => [
      ...prev,
      { role: 'assistant', text: input.contextText },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 850));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: input.actionText,
        variant: 'action',
        accent: input.accent,
        actionLabel: input.actionLabel,
        action: () => {
          if (input.screen === 'production_planning' && input.productionPlanningPageId && typeof window !== 'undefined') {
            window.sessionStorage.setItem('bd-production-planning-initial-page', input.productionPlanningPageId);
          }
          onClearHomeChatAutomation();
          updateHomeAssistantTypingVisible(false);
          setLocalActiveHomePriorityCard(null);
          onSetCurrentScreen(input.screen);
        },
      },
    ]);

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
  };

  const handleTechnicianWorkOrdersGuide = async () => {
    setLocalActiveHomePriorityCard('My Assigned Work Orders');
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: 'Show the work orders assigned to me.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 900));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'I found 4 work orders assigned to your maintenance queue. Two need attention first because they are overdue, and one is already in progress on Autoguard Line 10.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 850));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'Here is the list I would work from. Click any work order to open its drawer, then use the calendar button when you want to see the schedule around it.',
        variant: 'technician_work_orders',
      },
    ]);

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
  };

  const handleCbmPdmInsightsGuide = async (cardTitle: string = 'CBM & PdM', accent: string = '#E43B46') => {
    setLocalActiveHomePriorityCard(cardTitle);
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: 'Show me CBM and PdM insights.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 900));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'CBM & PdM is flagging two sensor exceptions that need attention before opening the full board: Pump P-205 pressure is at 8.4 versus a 7.5 bar target, and Motor MT-501 vibration is at 4.2 versus a 5 mm/s target. Pump P-205 is the stronger near-term watch item because the pressure deviation is recent and tied to Utilities.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 850));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'My recommendation is to check Pump P-205 first, then review Motor MT-501 trend history. Open CBM & PdM when you want the full monitoring grid, AI recommendations, and request/work-order creation path.',
        variant: 'action',
        accent,
        actionLabel: 'Open CBM & PdM',
        action: () => {
          onClearHomeChatAutomation();
          updateHomeAssistantTypingVisible(false);
          setLocalActiveHomePriorityCard(null);
          onSetCurrentScreen('maintenance_cbm_pdm');
        },
      },
    ]);

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
  };

  const handlePlannerPriorityQueueGuide = async () => {
    setLocalActiveHomePriorityCard('Planner Priority Queue');
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: 'Show my planner priority queue.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 900));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'I found 4 planning items that can block the next release window. The first one needs parts readiness, the second has a PM window conflict, and the CBM signal should be converted into planned work before it becomes emergency maintenance.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 850));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'Here is the planner queue I would review first. Open Production Planning when you want to resolve capacity, MPS, and schedule impact together.',
        variant: 'planner_priority_queue',
      },
    ]);

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
  };

  const handleBuildTechnicianWorkstation = async () => {
    setLocalActiveHomePriorityCard('Build My Workstation');
    updateHomeAssistantTypingVisible(true);

    await new Promise((resolve) => setTimeout(resolve, 650));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'user',
        text: 'Open my maintenance technician workstation.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 950));

    onSetAiMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        text: 'I am opening your Maintenance Technician view with work orders, calendar, equipment status, and spare parts ready.',
      },
    ]);

    await new Promise((resolve) => setTimeout(resolve, 750));

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
    onClearHomeChatAutomation();
    onOpenPredefinedWorkstation('Maintenance Technician');
  };

  const buildOperatorPriorityCards = () => MY_AI_ASSISTANT_OPERATOR_CARD_CONTENT.map((card) => ({
    title: card.title,
    detail: card.detail,
    owner: card.owner,
    severity: card.severity,
    color: card.color,
    action: () => {
      if (card.id === 'operator-cil-task') {
        void handleOpenOperatorScreen({
          cardTitle: card.title,
          userText: 'Open my CIL tasks.',
          assistantText: 'Opening your operator CIL view so you can start the scheduled inspection and execution steps for this shift.',
          screen: 'cil_operator',
        });
        return;
      }

      if (card.id === 'operator-centerline-task') {
        void handleOpenOperatorScreen({
          cardTitle: card.title,
          userText: 'Open my centerline tasks.',
          assistantText: 'Opening your centerline operator view so you can review the next parameter checks and keep the process in range.',
          screen: 'centerline_operator',
        });
        return;
      }

      if (card.id === 'operator-changeover') {
        void handleOpenOperatorScreen({
          cardTitle: card.title,
          userText: "Open today's changeover.",
          assistantText: 'Opening your operator changeover view so you can follow the next setup sequence and timing plan.',
          screen: 'equipment_changeover_operator',
        });
        return;
      }

      if (card.id === 'operator-build-workstation') {
        void handleBuildOperatorWorkstation();
      }
    },
  }));

  const buildTechnicianPriorityCards = () => MY_AI_ASSISTANT_TECHNICIAN_CARD_CONTENT.map((card) => ({
    title: card.title,
    detail: card.detail,
    owner: card.owner,
    severity: card.severity,
    color: card.color,
    action: () => {
      if (card.id === 'technician-assigned-work-orders') {
        void handleTechnicianWorkOrdersGuide();
        return;
      }

      if (card.id === 'technician-maintenance-calendar') {
        void handleContextThenAction({
          cardTitle: card.title,
          userText: 'Open my maintenance calendar.',
          contextText: 'Your maintenance calendar has 3 scheduled work orders today, 2 overdue items, and one active intervention already in progress on Autoguard Line 10. I would check the overdue conveyor and pump seal work before the later PM window.',
          actionText: 'Open the Maintenance Calendar to see the full day/week schedule and rebalance the work from there.',
          actionLabel: 'Open Maintenance Calendar',
          accent: card.color,
          screen: 'maintenance_calendar',
        });
        return;
      }

      if (card.id === 'technician-maintenance-analytics') {
        void handleContextThenAction({
          cardTitle: card.title,
          userText: 'Open maintenance analytics.',
          contextText: 'Maintenance Analytics is flagging PM Compliance at 78%, MTTR at 4.2h, and equipment availability at 87.4%. The biggest driver is conveyor downtime, so I would review MTTR detail before deciding whether to pull another technician into Line 10.',
          actionText: 'Open Maintenance Analytics when you are ready to inspect the KPI detail and reliability drivers.',
          actionLabel: 'Open Maintenance Analytics',
          accent: card.color,
          screen: 'maintenance_performance',
        });
        return;
      }

      if (card.id === 'technician-cbm-pdm') {
        void handleCbmPdmInsightsGuide(card.title, card.color);
        return;
      }

      if (card.id === 'technician-build-workstation') {
        void handleBuildTechnicianWorkstation();
      }
    },
  }));

  const buildPlannerPriorityCards = () => MY_AI_ASSISTANT_PLANNER_CARD_CONTENT.map((card) => ({
    title: card.title,
    detail: card.detail,
    owner: card.owner,
    severity: card.severity,
    color: card.color,
    action: () => {
      if (card.id === 'planner-priority-work-orders') {
        void handlePlannerPriorityQueueGuide();
        return;
      }

      if (card.id === 'planner-capacity-risk') {
        void handleContextThenAction({
          cardTitle: card.title,
          userText: 'Show my capacity risks.',
          contextText: 'Capacity Planning - May-2026 is showing 94% average utilization, 2 overloaded months, and Line 10 as the bottleneck in Mar-2027. The Mar-2027 view shows Line 10 at 118% utilization with a -24,800 hour gap, driven by demand peak plus planned downtime.',
          actionText: 'Open Capacity Planning to review the site capacity viewer, Line 10 detail, and the month-by-line overload table before changing assumptions or recovery scenario.',
          actionLabel: 'Open Capacity Planning',
          accent: card.color,
          screen: 'production_planning',
          productionPlanningPageId: 'capacity-planning',
        });
        return;
      }

      if (card.id === 'planner-mps-approvals') {
        void handleContextThenAction({
          cardTitle: card.title,
          userText: 'Show MPS approval watch.',
          contextText: 'MPS approval watch has one release waiting on readiness confirmation and one demand change pushing capacity above target. I would clear readiness on the emergency WO before approving the next release.',
          actionText: 'Open Production Planning to inspect the MPS approval and release-readiness context.',
          actionLabel: 'Open Production Planning',
          accent: card.color,
          screen: 'production_planning',
        });
        return;
      }

      if (card.id === 'planner-schedule-risk') {
        void handleContextThenAction({
          cardTitle: card.title,
          userText: 'Show schedule and order risk.',
          contextText: 'Schedule Version Control has 2 active baselines, 1 pending approval, and 5 total schedule versions. The current risk is SCHEDULE_W25_V1: it is still Draft with Warning validation for 15/06/2026 - 26/06/2026, while June already has 2 approved versions and 1 pending approval.',
          actionText: 'Open Schedule & Order Planning to review the schedule version table, approval state, linked MPS/MRP snapshots, and the impacted order planning flow.',
          actionLabel: 'Open Schedule & Order Planning',
          accent: card.color,
          screen: 'production_planning',
          productionPlanningPageId: 'schedule-versions',
        });
        return;
      }

      if (card.id === 'planner-lineage') {
        void handleContextThenAction({
          cardTitle: card.title,
          userText: 'Show planning lineage exceptions.',
          contextText: 'Planning lineage shows 3 exceptions: one demand revision, one maintenance dependency, and one capacity override. The maintenance dependency is the only one with immediate schedule risk.',
          actionText: 'Open Production Planning to inspect the lineage and AI reasoning behind the plan change.',
          actionLabel: 'Open Production Planning',
          accent: card.color,
          screen: 'production_planning',
        });
        return;
      }

    },
  }));

  const buildGuidedUrgentTaskCards = () => buildMyAiAssistantUrgentTaskContent().map((task) => ({
    ...task,
    action: () => {
      if (task.id === 'nc-raised-this-morning') {
        handleNcGuidedTierPrep();
        return;
      }

      if (task.id === 'team-maintenance-requests') {
        handleMaintenanceRequestsGuide('My Team Maintenance Requests');
        return;
      }

      if (task.id === 'leader-build-workstation') {
        void handleBuildLeaderWorkstation();
        return;
      }

      if (task.id === 'action-priorities-today') {
        handleActionPriorityGuide();
        return;
      }

      if (task.id === 'team-esos-review') {
        void handleTeamEsosGuide();
        return;
      }

      if (task.id === 'maintenance-requests-24h') {
        handleMaintenanceRequestsGuide();
        return;
      }

      if (task.id === 'shift-coverage-review') {
        onClearHomeChatAutomation();
        updateHomeAssistantTypingVisible(false);
        onSetCurrentScreen(currentUserRole === 'operator' ? 'shift_schedule_operator' : 'shift_schedule');
        return;
      }

      if (task.id === 'tier-1-action-review') {
        onClearHomeChatAutomation();
        updateHomeAssistantTypingVisible(false);
        onSetCurrentScreen('tier_meeting');
      }
    }
  }));

  const assistantQuickActions = currentUserRole === 'operator'
    ? [
        {
          label: 'Open my CIL tasks',
          action: () => {
            void handleOpenOperatorScreen({
              cardTitle: "Today's CIL Task",
              userText: 'Open my CIL tasks.',
              assistantText:
                'Opening your operator CIL view so you can start the scheduled inspection and execution steps for this shift.',
              screen: 'cil_operator',
            });
          },
        },
        {
          label: 'Open centerline tasks',
          action: () => {
            void handleOpenOperatorScreen({
              cardTitle: "Today's Centerline Task",
              userText: 'Open my centerline tasks.',
              assistantText:
                'Opening your centerline operator view so you can review the next parameter checks and keep the process in range.',
              screen: 'centerline_operator',
            });
          },
        },
        {
          label: "Open today's changeover",
          action: () => {
            void handleOpenOperatorScreen({
              cardTitle: "Today's Changeover",
              userText: "Open today's changeover.",
              assistantText:
                'Opening your operator changeover view so you can follow the next setup sequence and timing plan.',
              screen: 'equipment_changeover_operator',
            });
          },
        },
        {
          label: 'Build my workstation',
          action: () => {
            void handleBuildOperatorWorkstation();
          },
        },
      ]
    : currentUserRole === 'technician'
      ? [
          {
            label: 'Show my work orders',
            action: () => {
              void handleTechnicianWorkOrdersGuide();
            },
          },
          {
            label: 'Open Maintenance Calendar',
            action: () => {
              void handleContextThenAction({
                cardTitle: 'Maintenance Calendar',
                userText: 'Open my maintenance calendar.',
                contextText: 'Your calendar has 3 scheduled work orders today and 2 overdue items. I would check the in-progress conveyor work first, then the overdue pump seal inspection.',
                actionText: 'Open Maintenance Calendar to see the full schedule.',
                actionLabel: 'Open Maintenance Calendar',
                accent: '#0F766E',
                screen: 'maintenance_calendar',
              });
            },
          },
          {
            label: 'Open Maintenance Analytics',
            action: () => {
              void handleContextThenAction({
                cardTitle: 'Maintenance Analytics',
                userText: 'Open maintenance analytics.',
                contextText: 'Maintenance Analytics is flagging PM Compliance at 78%, MTTR at 4.2h, and equipment availability at 87.4%. Conveyor downtime is the main driver to inspect.',
                actionText: 'Open Maintenance Analytics for the full KPI detail.',
                actionLabel: 'Open Maintenance Analytics',
                accent: '#F97316',
                screen: 'maintenance_performance',
              });
            },
          },
          {
            label: 'Check CBM insights',
            action: () => {
              void handleCbmPdmInsightsGuide('CBM & PdM', '#E43B46');
            },
          },
          {
            label: 'Open my workstation',
            action: () => {
              void handleBuildTechnicianWorkstation();
            },
          },
        ]
    : currentUserRole === 'leader'
      ? [
          {
            label: 'Show team maintenance requests',
            action: () => {
              void handleMaintenanceRequestsGuide('My Team Maintenance Requests');
            },
          },
          {
            label: 'Open Tier 1 workflow',
            action: () => {
              void handleNcGuidedTierPrep();
            },
          },
          {
            label: 'Show action priorities',
            action: () => {
              void handleActionPriorityGuide();
            },
          },
          {
            label: 'Show My Team ESOs',
            action: () => {
              void handleTeamEsosGuide();
            },
          },
          {
            label: 'Build leader workstation',
            action: () => {
              void handleBuildLeaderWorkstation();
            },
          },
        ]
    : currentUserRole === 'planner'
      ? [
          {
            label: 'Show planner queue',
            action: () => {
              void handlePlannerPriorityQueueGuide();
            },
          },
          {
            label: 'Review capacity risk',
            action: () => {
              buildPlannerPriorityCards()[1].action();
            },
          },
          {
            label: 'Review MPS approvals',
            action: () => {
              buildPlannerPriorityCards()[2].action();
            },
          },
          {
            label: 'Review schedule risk',
            action: () => {
              buildPlannerPriorityCards()[3].action();
            },
          },
        ]
    : [
        {
          label: 'Help me build my workstation',
          action: () => onHandleAiSend('Help me build my workstation', { openDrawer: false }),
        },
        {
          label: 'Open document management',
          action: () => onHandleAiSend('Open document management', { openDrawer: false }),
        },
        {
          label: 'Open maintenance hub',
          action: () => onHandleAiSend('Open maintenance hub', { openDrawer: false }),
        },
        {
          label: 'How are my assets today?',
          action: () => onHandleAiSend('How are my assets today?', { openDrawer: false }),
        },
        {
          label: 'Give me site overview',
          action: () => onHandleAiSend('Give me site overview', { openDrawer: false }),
        },
      ];

  const handleSiteContextSwitch = async (
    siteName: string,
    path: string[] = ['Global', siteName],
    scopeLabel: string = defaultScopeLabel,
  ) => {
    onSelectSiteContext(siteName);
    updateHomeAssistantTypingVisible(true);
    setLocalActiveHomePriorityCard(`${siteName} Tower`);
    
    // Simulate user selecting the site
    onSetAiMessages((prev) => [
      ...prev,
      { role: 'user', text: `Open ${siteName} context` }
    ]);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const siteGreeting = buildMyAiAssistantSiteContextGreeting({
      greetingLabel: 'Good afternoon',
      firstName: currentUserFirstName,
      siteName: siteName,
      scopeLabel: scopeLabel,
      path: path
    });

    onSetAiMessages((prev) => [
      ...prev,
      { role: 'assistant', text: siteGreeting }
    ]);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    const priorityHeading = buildMyAiAssistantSitePriorityHeading(siteName);
    const priorityPrompt = buildMyAiAssistantSitePriorityPrompt(siteName);
    const urgentTasks = buildGuidedUrgentTaskCards();

    onSetAiMessages((prev) => [
      ...prev,
      { 
        role: 'assistant', 
        text: priorityPrompt,
        heading: priorityHeading,
        variant: 'priority_cards',
        priorityCards: urgentTasks,
      }
    ]);

    updateHomeAssistantTypingVisible(false);
    setLocalActiveHomePriorityCard(null);
  };

  React.useEffect(() => {
    if (aiMessages.length === 0 && !simulationStartedRef.current) {
      simulationStartedRef.current = true;
      
      const startSimulation = async () => {
        updateHomeAssistantTypingVisible(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        if (!isAssistantScreenMountedRef.current) return;
        
        const greeting = buildMyAiAssistantGreeting('Good afternoon', currentUserFirstName);

        if (currentUserRole === 'leader') {
          const siteGreeting = buildMyAiAssistantSiteContextGreeting({
            greetingLabel: 'Good afternoon',
            firstName: currentUserFirstName,
            siteName: 'Columbus West',
            scopeLabel: 'Leader',
            path: ['Global', 'Columbus West'],
          });

          onSetAiMessages([{ role: 'assistant', text: siteGreeting }]);

          await new Promise((resolve) => setTimeout(resolve, 1500));
          if (!isAssistantScreenMountedRef.current) return;

          onSetAiMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: buildMyAiAssistantSitePriorityPrompt('Columbus West'),
              heading: buildMyAiAssistantSitePriorityHeading('Columbus West'),
              variant: 'priority_cards',
              priorityCards: buildGuidedUrgentTaskCards(),
            },
          ]);
        } else if (currentUserRole === 'operator') {
          onSetAiMessages([{ role: 'assistant', text: greeting }]);

          await new Promise((resolve) => setTimeout(resolve, 1500));
          if (!isAssistantScreenMountedRef.current) return;

          onSetAiMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: MY_AI_ASSISTANT_INTRO_COPY.operatorSummary,
            },
          ]);

          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (!isAssistantScreenMountedRef.current) return;

          onSetAiMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: MY_AI_ASSISTANT_INTRO_COPY.operatorPriorityPrompt,
              heading: buildMyAiAssistantOperatorPriorityHeading(),
              variant: 'priority_cards',
              priorityCards: buildOperatorPriorityCards(),
            },
          ]);
        } else if (currentUserRole === 'technician') {
          onSetAiMessages([{ role: 'assistant', text: greeting }]);

          await new Promise((resolve) => setTimeout(resolve, 1500));
          if (!isAssistantScreenMountedRef.current) return;

          onSetAiMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: MY_AI_ASSISTANT_INTRO_COPY.technicianSummary,
            },
          ]);

          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (!isAssistantScreenMountedRef.current) return;

          onSetAiMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: MY_AI_ASSISTANT_INTRO_COPY.technicianPriorityPrompt,
              heading: buildMyAiAssistantTechnicianPriorityHeading(),
              variant: 'priority_cards',
              priorityCards: buildTechnicianPriorityCards(),
            },
          ]);
        } else if (currentUserRole === 'planner') {
          onSetAiMessages([{ role: 'assistant', text: greeting }]);

          await new Promise((resolve) => setTimeout(resolve, 1500));
          if (!isAssistantScreenMountedRef.current) return;

          onSetAiMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: MY_AI_ASSISTANT_INTRO_COPY.plannerSummary,
            },
          ]);

          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (!isAssistantScreenMountedRef.current) return;

          onSetAiMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              text: MY_AI_ASSISTANT_INTRO_COPY.plannerPriorityPrompt,
              heading: buildMyAiAssistantPlannerPriorityHeading(),
              variant: 'priority_cards',
              priorityCards: buildPlannerPriorityCards(),
            },
          ]);
        } else {
          onSetAiMessages([{ role: 'assistant', text: greeting }]);

          await new Promise((resolve) => setTimeout(resolve, 1500));
          if (!isAssistantScreenMountedRef.current) return;

          onSetAiMessages((prev) => [
            ...prev,
            { 
              role: 'assistant', 
              text: MY_AI_ASSISTANT_INTRO_COPY.directorSummary 
            },
          ]);

          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (!isAssistantScreenMountedRef.current) return;

          onSetAiMessages((prev) => [
            ...prev,
            { 
              role: 'assistant', 
              text: MY_AI_ASSISTANT_INTRO_COPY.priorityPrompt,
              heading: MY_AI_ASSISTANT_SITE_NEWS_HEADING,
              variant: 'priority_cards',
              priorityCards: effectiveHomeDirectorNewsCards.slice(0, 4).map((card) => ({
                ...card,
                action: () => {
                  if (card.title === 'Open Global View') {
                    handleOpenGlobalViewFromChat();
                    return;
                  }

                  if (card.title.includes('Columbus West')) {
                    handleSiteContextSwitch('Columbus West');
                    return;
                  }

                  if (card.title.includes('Juiz de Fora')) {
                    handleSiteContextSwitch('Juiz de Fora');
                    return;
                  }

                  if (card.title.includes('Fraga')) {
                    handleSiteContextSwitch('Fraga');
                    return;
                  }

                  if (card.title.includes('Sandy')) {
                    handleSiteContextSwitch('Sandy');
                    return;
                  }

                  if (card.title.includes('Temse')) {
                    handleSiteContextSwitch('Temse');
                    return;
                  }

                  if (card.title.includes('Franklin Lakes')) {
                    handleSiteContextSwitch('Franklin Lakes');
                  }
                }
              }))
            },
          ]);
        }
        
        updateHomeAssistantTypingVisible(false);
      };
      
      startSimulation();
    }
  }, [aiMessages.length, currentUserFirstName, currentUserRole]);

  // Auto-scroll to bottom when content changes
  React.useEffect(() => {
    if (homeChatScrollRef && homeChatScrollRef.current) {
      const scrollContainer = homeChatScrollRef.current;
      
      // Use requestAnimationFrame to ensure the DOM has updated and rendered the new content
      // before calculating scrollHeight
      requestAnimationFrame(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [aiMessages, effectiveHomeAssistantTypingVisible, effectiveHomeChatShowMore, homeChatScrollRef]);

  const [isEquipmentDrawerOpen, setIsEquipmentDrawerOpen] = React.useState(false);
  const [selectedEquipmentContext, setSelectedEquipmentContext] = React.useState<MaintenanceContextRecord | null>(null);
  const [selectedEquipmentRequestCard, setSelectedEquipmentRequestCard] = React.useState<ChatMaintenanceRequestCard | null>(null);
  const [selectedMaintenanceRequestCard, setSelectedMaintenanceRequestCard] = React.useState<ChatMaintenanceRequestCard | null>(null);
  const [selectedEsoReport, setSelectedEsoReport] = React.useState<ReportRow | null>(null);
  const [chatWorkOrderDraft, setChatWorkOrderDraft] = React.useState<WorkOrderDraft | null>(null);
  const [chatWorkOrderTab, setChatWorkOrderTab] = React.useState<WorkOrderTab>('attachments');
  const [maintenanceToastMessage, setMaintenanceToastMessage] = React.useState<string | null>(null);

  const handleOpenEquipmentDrawer = (assetId: MaintenanceContextAssetId) => {
    const context = maintenanceContextByAssetId[assetId];
    const item = maintenanceSummaryItems.find((entry) => entry.assetId === assetId);
    if (context) {
      setSelectedEquipmentContext(context);
      setSelectedEquipmentRequestCard(item ? buildChatMaintenanceRequestCard(item) : null);
      setIsEquipmentDrawerOpen(true);
    }
  };

  const handleOpenMaintenanceRequestDrawer = (assetId: MaintenanceContextAssetId) => {
    const item = maintenanceSummaryItems.find((entry) => entry.assetId === assetId);
    if (!item) return;
    setSelectedMaintenanceRequestCard(buildChatMaintenanceRequestCard(item));
  };

  const handleOpenChatWorkOrderDrawer = (workOrder: TechnicianAssignedWorkOrder) => {
    const draft = buildWorkOrderDraftFromRequest(buildChatWorkOrderRequestCard(workOrder));
    setChatWorkOrderDraft({
      ...draft,
      drawerTitle: workOrder.woCode,
      statusLabel: workOrder.status,
      drawerMode: 'scheduledExecution',
      isMaintenanceTypeLocked: true,
    });
    setChatWorkOrderTab('execution');
  };

  const handleOpenContextWorkOrderDrawer = (record: ContextRecord) => {
    handleOpenChatWorkOrderDrawer({
      title: record.title,
      woCode: record.id.replace('-', ' '),
      type: record.priority === 'Routine' ? 'Preventive' : 'Corrective',
      line: selectedEquipmentContext?.location ?? 'Zone 8',
      equipment: selectedEquipmentContext?.equipmentName ?? 'Conveyor Belt C4',
      due: record.meta.split('·')[0].trim(),
      dueTone: record.tone === 'warning' ? '#F97316' : '#2563EB',
      status: record.status,
      statusTone: record.tone === 'success' ? '#0F766E' : '#1D4ED8',
    });
  };

  const handleOpenContextMaintenanceRequestDrawer = (record: ContextRecord) => {
    const base = selectedEquipmentRequestCard ?? buildChatMaintenanceRequestCard(maintenanceSummaryItems[0]);
    setSelectedMaintenanceRequestCard({
      ...base,
      id: `context-${record.id.toLowerCase()}`,
      title: record.title,
      detail: record.description,
      assignee: record.owner,
      due: record.meta.split('·')[0].trim(),
      priority: record.priority === 'High' ? 'High' : 'Medium',
      requestContext: {
        ...base.requestContext,
        requestId: record.id,
        location: selectedEquipmentContext?.location ?? base.requestContext.location,
        equipment: selectedEquipmentContext?.equipmentName ?? base.requestContext.equipment,
      },
    });
  };

  const handleOpenContextEsoDrawer = (record: ContextRecord) => {
    setSelectedEsoReport({
      id: record.id,
      type: record.id.endsWith('218') ? 'Condition Report' : 'BBS',
      status: record.status,
      observer: record.owner,
      area: selectedEquipmentContext?.location ?? 'Zone 8',
      line: 'Conveyor C4',
      supervisor: 'Emily Watson',
      reportDate: 'Jul 1, 2026',
      occurrenceDate: 'Jul 1, 2026',
      closedDate: record.status === 'Approved' ? 'Jul 1, 2026' : '—',
      lastUpdate: record.meta.split('·').at(-1)?.trim() ?? 'Today',
    });
  };

  const internalRenderTechnicianWorkOrdersMessage = (mode: 'light' | 'dark', queueType: 'technician' | 'planner') => {
    const isLight = mode === 'light';
    const workOrders = queueType === 'planner' ? plannerPriorityWorkOrders : technicianAssignedWorkOrders;
    const summaryCards = queueType === 'planner'
      ? [
          { label: 'Priority Items', value: '4', detail: 'Need planner decision', color: '#044ED7' },
          { label: 'Conflicts', value: '2', detail: 'Capacity or PM window', color: '#F97316' },
          { label: 'Release Risk', value: '1', detail: 'Parts readiness blocker', color: '#EF4444' },
        ]
      : [
          { label: 'Scheduled', value: '3', detail: 'Today, Jan 13', color: '#044ED7' },
          { label: 'High Priority', value: '2', detail: 'Emergency or High', color: '#EF4444' },
          { label: 'Overdue', value: '2', detail: 'Past due date', color: '#F97316' },
        ];

    return (
      <Box sx={{ mt: 1.4, display: 'flex', flexDirection: 'column', gap: 1.1 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
            gap: 0.8,
          }}
        >
          {summaryCards.map((summary) => (
            <Paper
              key={summary.label}
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 2,
                border: isLight ? '1px solid #E2E8F0' : `1px solid ${darkBubbleBorder}`,
                bgcolor: isLight ? '#F8FAFC' : 'rgba(15,23,42,0.38)',
              }}
            >
              <Typography sx={{ color: summary.color, fontWeight: 900, fontSize: 19, lineHeight: 1 }}>
                {summary.value}
              </Typography>
              <Typography variant="caption" sx={{ color: isLight ? '#0F172A' : '#E2E8F0', fontWeight: 900 }}>
                {summary.label}
              </Typography>
              <Typography variant="caption" sx={{ color: isLight ? '#64748B' : '#94A3B8', display: 'block' }}>
                {summary.detail}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2.4,
            border: isLight ? '1px solid #D7E3F4' : `1px solid ${darkBubbleBorder}`,
            bgcolor: isLight ? '#FFFFFF' : 'rgba(17,28,50,0.72)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 1.2, py: 0.9, borderBottom: isLight ? '1px solid #E2E8F0' : `1px solid ${darkPanelBorder}`, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="caption" sx={{ color: isLight ? '#0F172A' : '#F8FAFC', fontWeight: 900 }}>
              Scheduled Work Orders
            </Typography>
            <Typography variant="caption" sx={{ color: isLight ? '#64748B' : '#94A3B8', fontWeight: 800 }}>
              {workOrders.length} shown
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {workOrders.map((workOrder) => (
              <Box
                component={queueType === 'technician' ? 'button' : 'div'}
                type={queueType === 'technician' ? 'button' : undefined}
                key={workOrder.woCode}
                onClick={queueType === 'technician' ? () => handleOpenChatWorkOrderDrawer(workOrder) : undefined}
                sx={{
                  width: '100%',
                  px: 1.2,
                  py: 1,
                  borderLeft: `4px solid ${workOrder.dueTone}`,
                  borderTop: 0,
                  borderRight: 0,
                  borderBottom: isLight ? '1px solid #EEF2F7' : `1px solid ${darkPanelBorder}`,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr auto' },
                  gap: 1,
                  alignItems: 'center',
                  textAlign: 'left',
                  cursor: queueType === 'technician' ? 'pointer' : 'default',
                  bgcolor: 'transparent',
                  font: 'inherit',
                  '&:last-child': { borderBottom: 0 },
                  '&:hover': queueType === 'technician'
                    ? {
                        bgcolor: isLight ? '#F8FAFC' : 'rgba(59,130,246,0.08)',
                      }
                    : undefined,
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: isLight ? '#0F172A' : '#F8FAFC', fontWeight: 900, display: 'block' }}>
                    {workOrder.title}
                  </Typography>
                  <Chip
                    label={workOrder.woCode}
                    size="small"
                    sx={{ mt: 0.5, height: 21, bgcolor: '#EAF1FF', color: '#044ED7', border: '1px solid #BFDBFE', fontWeight: 900 }}
                  />
                  <Typography variant="caption" sx={{ color: isLight ? '#64748B' : '#94A3B8', display: 'block', mt: 0.35, fontWeight: 700 }}>
                    {workOrder.type}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: isLight ? '#475569' : '#CBD5E1', display: 'block', fontWeight: 800 }}>
                    {workOrder.line}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isLight ? '#64748B' : '#94A3B8', display: 'block' }}>
                    {workOrder.equipment}
                  </Typography>
                  <Chip
                    label={workOrder.due}
                    size="small"
                    sx={{ mt: 0.45, height: 20, bgcolor: `${workOrder.dueTone}12`, color: workOrder.dueTone, border: `1px solid ${workOrder.dueTone}33`, fontWeight: 900 }}
                  />
                </Box>

                <Chip
                  label={workOrder.status}
                  size="small"
                  sx={{ justifySelf: { xs: 'start', md: 'end' }, bgcolor: `${workOrder.statusTone}12`, color: workOrder.statusTone, border: `1px solid ${workOrder.statusTone}33`, fontWeight: 900 }}
                />
              </Box>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, justifyContent: 'flex-end' }}>
          {queueType === 'planner' ? (
            <Button variant="contained" size="small" onClick={() => onSetCurrentScreen('production_planning')} sx={{ fontWeight: 900, textTransform: 'none', boxShadow: 'none' }}>
              Open Production Planning
            </Button>
          ) : (
            <Button variant="contained" size="small" onClick={() => onSetCurrentScreen('maintenance_calendar')} sx={{ fontWeight: 900, textTransform: 'none', boxShadow: 'none' }}>
              Open Maintenance Calendar
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  const internalRenderTeamEsosMessage = (mode: 'light' | 'dark') => {
    const isLight = mode === 'light';
    const summaryCards = [
      { label: 'Total ESOs', value: '32', detail: '32 / 40 submitted', color: '#044ED7' },
      { label: 'Target', value: '80%', detail: 'Current month', color: '#60BD68' },
      { label: 'Awaiting Review', value: '5', detail: '3 priority items', color: '#FF8A00' },
      { label: 'SPO Near Misses', value: '3', detail: 'Needs visibility', color: '#E43B46' },
    ];

    const openEsoDashboard = () => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('bd-eso-initial-report-status-tab', 'awaitingReview');
      }
      onClearHomeChatAutomation();
      updateHomeAssistantTypingVisible(false);
      setLocalActiveHomePriorityCard(null);
      onSetCurrentScreen('eso_hub');
    };

    return (
      <Box sx={{ mt: 1.4, display: 'flex', flexDirection: 'column', gap: 1.1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 0.8 }}>
          {summaryCards.map((summary) => (
            <Paper
              key={summary.label}
              elevation={0}
              sx={{
                p: 1,
                borderRadius: 2,
                border: isLight ? '1px solid #E2E8F0' : `1px solid ${darkBubbleBorder}`,
                bgcolor: isLight ? '#F8FAFC' : 'rgba(15,23,42,0.38)',
              }}
            >
              <Typography sx={{ color: summary.color, fontWeight: 900, fontSize: 19, lineHeight: 1 }}>
                {summary.value}
              </Typography>
              <Typography variant="caption" sx={{ color: isLight ? '#0F172A' : '#E2E8F0', fontWeight: 900, display: 'block' }}>
                {summary.label}
              </Typography>
              <Typography variant="caption" sx={{ color: isLight ? '#64748B' : '#94A3B8', display: 'block' }}>
                {summary.detail}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 2.4,
            border: isLight ? '1px solid #D7E3F4' : `1px solid ${darkBubbleBorder}`,
            bgcolor: isLight ? '#FFFFFF' : 'rgba(17,28,50,0.72)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 1.2, py: 0.9, borderBottom: isLight ? '1px solid #E2E8F0' : `1px solid ${darkPanelBorder}`, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="caption" sx={{ color: isLight ? '#0F172A' : '#F8FAFC', fontWeight: 900 }}>
              Awaiting Review
            </Typography>
            <Typography variant="caption" sx={{ color: isLight ? '#64748B' : '#94A3B8', fontWeight: 800 }}>
              {teamEsoReviewItems.length} shown
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {teamEsoReviewItems.map((eso) => (
              <Box
                component="button"
                type="button"
                key={eso.id}
                onClick={openEsoDashboard}
                sx={{
                  width: '100%',
                  px: 1.2,
                  py: 1,
                  borderLeft: `4px solid ${eso.tone}`,
                  borderTop: 0,
                  borderRight: 0,
                  borderBottom: isLight ? '1px solid #EEF2F7' : `1px solid ${darkPanelBorder}`,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1.1fr 1.1fr auto' },
                  gap: 1,
                  alignItems: 'center',
                  textAlign: 'left',
                  cursor: 'pointer',
                  bgcolor: 'transparent',
                  font: 'inherit',
                  '&:last-child': { borderBottom: 0 },
                  '&:hover': {
                    bgcolor: isLight ? '#F8FAFC' : 'rgba(59,130,246,0.08)',
                  },
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ color: isLight ? '#0F172A' : '#F8FAFC', fontWeight: 900, display: 'block' }}>
                    {eso.id}
                  </Typography>
                  <Chip
                    label="REVIEW"
                    size="small"
                    sx={{ mt: 0.5, height: 21, bgcolor: '#FFF1DE', color: '#DB7A00', border: '1px solid #FFC076', fontWeight: 900 }}
                  />
                  <Typography variant="caption" sx={{ color: isLight ? '#64748B' : '#94A3B8', display: 'block', mt: 0.35, fontWeight: 700 }}>
                    {eso.type}
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="caption" sx={{ color: isLight ? '#475569' : '#CBD5E1', display: 'block', fontWeight: 800 }}>
                    {eso.area}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isLight ? '#64748B' : '#94A3B8', display: 'block' }}>
                    {eso.line}
                  </Typography>
                  <Typography variant="caption" sx={{ color: isLight ? '#64748B' : '#94A3B8', display: 'block', mt: 0.35 }}>
                    {`${eso.owner} -> ${eso.supervisor}`}
                  </Typography>
                </Box>

                <Box sx={{ justifySelf: { xs: 'start', md: 'end' }, display: 'flex', flexDirection: 'column', gap: 0.45, alignItems: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Typography variant="caption" sx={{ color: isLight ? '#64748B' : '#94A3B8', fontWeight: 800 }}>
                    {eso.reportDate}
                  </Typography>
                  <Chip
                    label="Open dashboard"
                    size="small"
                    sx={{ height: 22, bgcolor: '#EAF1FF', color: '#044ED7', border: '1px solid #BFDBFE', fontWeight: 900 }}
                  />
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, justifyContent: 'flex-end' }}>
          <Button variant="contained" size="small" onClick={openEsoDashboard} sx={{ bgcolor: '#044ED7', fontWeight: 900, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#044ED7', opacity: 0.92 } }}>
            Open ESO Dashboard
          </Button>
        </Box>
      </Box>
    );
  };

  const internalRenderMaintenanceSummaryMessage = (message: AiMessage, mode: 'light' | 'dark') => {
    const isLight = mode === 'light';
    
    return (
      <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.2 }}>
        {maintenanceSummaryItems.map((item, idx) => (
          <Paper
            key={`${item.requestId}-${idx}`}
            elevation={0}
            onClick={() => handleOpenMaintenanceRequestDrawer(item.assetId)}
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: '1px solid #DBDDDF',
              borderLeft: `4px solid ${item.priority === 'Critical' ? '#EF4444' : '#F59E0B'}`,
              bgcolor: isLight ? '#FFFFFF' : '#1e293b',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: item.priority === 'Critical' ? '#EF4444' : '#F59E0B',
                transform: 'translateY(-1px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: item.priority === 'Critical' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                    color: item.priority === 'Critical' ? '#EF4444' : '#F59E0B',
                  }}
                >
                  <ReportProblemIcon sx={{ fontSize: 18 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, color: isLight ? '#0F172A' : '#F8FAFC', fontSize: 14 }}>
                  {item.title}
                </Typography>
              </Box>
              <Chip
                label={item.priority}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 900,
                  bgcolor: item.priority === 'Critical' ? '#EF4444' : '#F59E0B',
                  color: '#FFFFFF',
                }}
              />
            </Box>
            
            <Typography variant="body2" sx={{ color: isLight ? '#475569' : '#CBD5E1', mb: 1.2, fontSize: 13, lineHeight: 1.5 }}>
              {item.descriptionPrefix}
              <Box
                component="span"
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenEquipmentDrawer(item.assetId);
                }}
                sx={{
                  fontWeight: 800,
                  color: '#1D74FF',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                  cursor: 'pointer',
                }}
              >
                {item.equipmentName}
              </Box>
              {item.descriptionSuffix}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PersonIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>{item.reporter}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>{item.createdAt}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationIcon sx={{ fontSize: 14, color: '#94A3B8' }} />
                <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700 }}>{item.location}</Typography>
              </Box>
              <Box
                onClick={(event) => {
                  event.stopPropagation();
                  handleOpenEquipmentDrawer(item.assetId);
                }}
                sx={{ ml: 'auto', display: 'flex', alignItems: 'center', color: '#1D74FF', cursor: 'pointer' }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800 }}>View Context</Typography>
                <ChevronRightIcon sx={{ fontSize: 16 }} />
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  const isHomeChatLightMode = effectiveThemeMode === 'light';
  const darkShellBorder = 'rgba(119,151,190,0.14)';
  const darkPanelBorder = 'rgba(119,151,190,0.12)';
  const darkBubbleBorder = 'rgba(119,151,190,0.18)';
  const darkGlobalSurface = 'rgba(17, 28, 50, 0.88)';
  const darkSoftSurface = 'rgba(17, 28, 50, 0.82)';
  const darkMidSurface = 'rgba(19, 31, 55, 0.9)';
  const darkBubbleSurface = 'rgba(28, 41, 68, 0.9)';
  const normalizedChatLibraryQuery = chatLibraryQuery.trim().toLowerCase();
  const filteredRecentChats = homeChatHistoryEntries.filter((entry) => (
    normalizedChatLibraryQuery.length === 0
      ? true
      : `${entry.label} ${entry.meta}`.toLowerCase().includes(normalizedChatLibraryQuery)
  ));
  const pinnedChats = filteredRecentChats.filter((entry) => entry.selected).slice(0, 3);
  const favoriteChats = filteredRecentChats.slice(0, 3);
  const sharedChats = filteredRecentChats.slice(1, 4);
  const filteredFolders = localChatFolders.filter((folder) => (
    normalizedChatLibraryQuery.length === 0
      ? true
      : folder.toLowerCase().includes(normalizedChatLibraryQuery)
  ));
  const createFolderLabel = `Folder ${localChatFolders.length + 1}`;
  const adminOverviewCards = [
    {label: 'Active Agents', value: '6', detail: 'Atlas, Cognite, Planner, Maintenance, Quality, Shift', accent: '#2563EB'},
    {label: 'Context Windows', value: '12', detail: 'Reusable production, maintenance, site, and equipment contexts', accent: '#0F766E'},
    {label: 'Connected Systems', value: '9', detail: 'SAP, MES, Cognite, DMS, Smart Search, ESO, Training, APIs', accent: '#7C3AED'},
    {label: 'Monthly Tokens', value: '2.8M', detail: 'Across enterprise copilots, routing policies, and tool calls', accent: '#FF8A00'},
  ];
  const settingsSections = [
    {
      title: 'Agent Management',
      description: 'Configure the agent fleet, routing order, and which copilots are available across the factory workspace.',
      badge: 'Routing active',
      items: [
        {label: 'Available Agents', value: 'Atlas, Cognite, Planner Agent, Maintenance Agent, Quality Agent, Shift Agent'},
        {label: 'Default Agent', value: 'BD Atlas AI Operations Copilot'},
        {label: 'Priority & Routing', value: 'Maintenance -> Shift -> Quality -> Atlas fallback'},
      ],
    },
    {
      title: 'Context Windows',
      description: 'Define reusable operational context bundles that determine what data an agent can load into a conversation.',
      badge: '12 windows',
      items: [
        {label: 'Production Context', value: 'Site overview, OEE, line KPIs, notifications, Smart Search indexes'},
        {label: 'Maintenance Context', value: 'Assets, work orders, PM plans, time series, engineering docs'},
        {label: 'Shift & Equipment Context', value: 'Shift notes, crew schedule, line status, equipment hierarchy'},
      ],
    },
    {
      title: 'Data Sources',
      description: 'Control which enterprise systems each agent can query, summarize, or act against.',
      badge: '9 connected',
      items: [
        {label: 'Industrial Platforms', value: 'Cognite, SAP, MES, Historian, Document Management'},
        {label: 'Application Modules', value: 'Smart Search, Shift Schedule, Maintenance, ESO, Training'},
        {label: 'External Integrations', value: 'Custom APIs and federated knowledge bases enabled'},
      ],
    },
    {
      title: 'AI Behavior',
      description: 'Govern prompts, action permissions, safety policies, confidence thresholds, and escalation rules.',
      badge: 'Governed',
      items: [
        {label: 'System Prompt', value: 'Industrial operations copilot with site-aware reasoning and action-first responses'},
        {label: 'Allowed Actions', value: 'Read enterprise context, draft workflow actions, recommend next step'},
        {label: 'Safety & Escalation', value: 'Escalate low-confidence workflow actions to role owner review'},
      ],
    },
    {
      title: 'Memory',
      description: 'Manage session retention, long-term memory, reusable context recall, and conversation history controls.',
      badge: '30-day retention',
      items: [
        {label: 'Conversation Memory', value: 'Current session + prior 30 days for authorized users'},
        {label: 'Long-Term Memory', value: 'Pinned operating preferences and saved organizational instructions'},
        {label: 'Context Window Size', value: 'Adaptive by role, site, and active workflow scope'},
      ],
    },
    {
      title: 'Permissions',
      description: 'Set which roles can access agents, contexts, actions, and tool execution capabilities.',
      badge: `${defaultScopeLabel} policy`,
      items: [
        {label: 'Role Access', value: 'Director, Leader, Operator, Technician, Planner policy sets applied'},
        {label: 'Tool Execution', value: 'Restricted to approved workflow actions and read-only enterprise tools'},
        {label: 'Context Access', value: 'Site, area, line, and equipment contexts scoped by role'},
      ],
    },
    {
      title: 'Prompt Templates',
      description: 'Manage reusable operational prompts, response frameworks, and organizational instruction packs.',
      badge: 'Role templates',
      items: [
        {label: 'Operational Prompts', value: 'Shift handoff, maintenance triage, quality escalation, site summary'},
        {label: 'Response Style', value: 'Executive summary + recommendation + evidence when applicable'},
        {label: 'Suggested Prompts', value: 'Role-based prompt packs shown in assistant home and drawer'},
      ],
    },
    {
      title: 'Monitoring',
      description: 'Monitor usage, token consumption, tool history, and how effectively context windows are being used.',
      badge: 'Live analytics',
      items: [
        {label: 'Usage Analytics', value: '247 conversations, 61 workflows assisted, 89% reuse of prompt templates'},
        {label: 'Token & Cost Controls', value: '2.8M tokens this month with routing and context compression active'},
        {label: 'Execution History', value: 'Tool calls, context utilization, and agent performance trace enabled'},
      ],
    },
  ];
  const sidebarActionItems = [
    {label: 'Shared Chats', icon: <SharedChatsIcon sx={{fontSize: 18}} />, action: () => onShareChat('team')},
    {label: 'Favorites', icon: <FavoritesIcon sx={{fontSize: 18}} />, action: () => undefined},
    {label: 'Pinned Chats', icon: <PinnedIcon sx={{fontSize: 18}} />, action: () => undefined},
    {label: 'Help Center', icon: <HelpIcon sx={{fontSize: 18}} />, action: () => undefined},
    {label: 'Settings', icon: <SettingsIcon sx={{fontSize: 18}} />, action: () => setAssistantWorkspaceView('settings')},
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        flexGrow: 1,
        height: 'calc(100vh - 96px)',
        minHeight: 'calc(100vh - 96px)',
        borderRadius: 3,
        border: `1px solid ${tokenDivider}`,
        bgcolor: workstationVisuals.pageBackground,
        px: { xs: 1, md: 1.5 },
        py: { xs: 1, md: 1.5 },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {xs: '1fr', lg: '280px minmax(0, 1fr)'},
          gap: 1.5,
          height: '100%',
          minHeight: 0,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minWidth: {xs: 0, lg: 280},
            height: '100%',
            minHeight: 0,
            borderRadius: 3,
            border: `1px solid ${tokenDivider}`,
            bgcolor: tokenCommon.white,
            overflow: 'hidden',
          }}
        >
          <Box sx={{p: 1.5, borderBottom: `1px solid ${tokenDivider}`}}>
            <Button
              variant="contained"
              fullWidth
              startIcon={<SparkleIcon sx={{fontSize: 16}} />}
              onClick={() => {
                setAssistantWorkspaceView('chat');
                onStartNewChat();
              }}
              sx={{
                minHeight: 36,
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                boxShadow: 'none',
                bgcolor: tokenBrand.main,
                '&:hover': {bgcolor: tokenBrand.dark, boxShadow: 'none'},
              }}
            >
              New Chat
            </Button>
            <TextField
              size="small"
              fullWidth
              value={chatLibraryQuery}
              onChange={(event) => setChatLibraryQuery(event.target.value)}
              placeholder="Search chats"
              sx={{
                mt: 1,
                '& .MuiOutlinedInput-root': {
                  minHeight: 36,
                  borderRadius: 2.5,
                  bgcolor: workstationVisuals.slateSurface,
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{fontSize: 18, color: tokenText.disabled}} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{flex: 1, minHeight: 0, overflowY: 'auto', p: 1.25, display: 'flex', flexDirection: 'column', gap: 1.25}}>
            <Box>
              <Typography variant="overline" sx={{color: tokenText.disabled, fontWeight: 800, letterSpacing: 0.5}}>
                Recent Chats
              </Typography>
              <Box sx={{mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.4}}>
                {filteredRecentChats.slice(0, 5).map((entry, index) => (
                  <Button
                    key={`${entry.label}-${index}`}
                    variant="text"
                    fullWidth
                    startIcon={<ChatBubbleIcon sx={{fontSize: 16}} />}
                    onClick={() => setAssistantWorkspaceView('chat')}
                    sx={{
                      justifyContent: 'flex-start',
                      minHeight: 34,
                      px: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      color: entry.selected ? tokenBrand.main : tokenText.secondary,
                      bgcolor: entry.selected ? tokenBrand.softBg : 'transparent',
                      border: entry.selected ? `1px solid ${tokenBrand.selectedBg}` : '1px solid transparent',
                      fontWeight: entry.selected ? 700 : 600,
                    }}
                  >
                    <Box sx={{minWidth: 0, textAlign: 'left'}}>
                      <Typography variant="body2" noWrap sx={{fontWeight: 'inherit'}}>
                        {entry.label}
                      </Typography>
                    </Box>
                  </Button>
                ))}
              </Box>
            </Box>

            <Box>
              <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
                <Typography variant="overline" sx={{color: tokenText.disabled, fontWeight: 800, letterSpacing: 0.5}}>
                  Folders
                </Typography>
                <Button
                  size="small"
                  startIcon={<CreateFolderIcon sx={{fontSize: 16}} />}
                  onClick={() => setLocalChatFolders((prev) => [...prev, createFolderLabel])}
                  sx={{
                    minHeight: 28,
                    textTransform: 'none',
                    color: tokenText.secondary,
                    fontWeight: 700,
                  }}
                >
                  Create Folder
                </Button>
              </Box>
              <Box sx={{mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.4}}>
                {filteredFolders.slice(0, 6).map((folder) => (
                  <Button
                    key={folder}
                    variant="text"
                    fullWidth
                    startIcon={<FolderIcon sx={{fontSize: 16}} />}
                    onClick={() => setAssistantWorkspaceView('chat')}
                    sx={{
                      justifyContent: 'flex-start',
                      minHeight: 34,
                      px: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      color: tokenText.secondary,
                      fontWeight: 600,
                    }}
                  >
                    <Typography variant="body2" noWrap sx={{fontWeight: 'inherit'}}>
                      {folder}
                    </Typography>
                  </Button>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="overline" sx={{color: tokenText.disabled, fontWeight: 800, letterSpacing: 0.5}}>
                Workspace
              </Typography>
              <Box sx={{mt: 0.5, display: 'flex', flexDirection: 'column', gap: 0.4}}>
                {sidebarActionItems.map((item) => (
                  <Button
                    key={item.label}
                    variant="text"
                    fullWidth
                    startIcon={item.icon}
                    onClick={item.action}
                    sx={{
                      justifyContent: 'flex-start',
                      minHeight: 34,
                      px: 1,
                      borderRadius: 2,
                      textTransform: 'none',
                      color: tokenText.secondary,
                      fontWeight: 600,
                    }}
                  >
                    <Typography variant="body2" noWrap sx={{fontWeight: 'inherit'}}>
                      {item.label}
                    </Typography>
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{display: 'grid', gap: 0.75}}>
              {[
                {label: 'Favorites', items: favoriteChats, icon: <FavoritesIcon sx={{fontSize: 15}} />},
                {label: 'Pinned Chats', items: pinnedChats, icon: <PinnedIcon sx={{fontSize: 15}} />},
                {label: 'Shared Chats', items: sharedChats, icon: <SharedChatsIcon sx={{fontSize: 15}} />},
              ].map((section) => (
                <Box key={section.label} sx={{border: `1px solid ${tokenDivider}`, borderRadius: 2.5, p: 1}}>
                  <Typography variant="caption" sx={{display: 'flex', alignItems: 'center', gap: 0.6, color: tokenText.secondary, fontWeight: 700}}>
                    {section.icon}
                    {section.label}
                  </Typography>
                  <Box sx={{mt: 0.65, display: 'flex', flexDirection: 'column', gap: 0.45}}>
                    {section.items.length ? section.items.map((entry, index) => (
                      <Typography key={`${section.label}-${entry.label}-${index}`} variant="caption" noWrap sx={{color: tokenText.disabled}}>
                        {entry.label}
                      </Typography>
                    )) : (
                      <Typography variant="caption" sx={{color: tokenText.disabled}}>
                        No chats yet
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

        </Paper>

        <Box
          sx={{
            minWidth: 0,
            height: '100%',
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              border: `1px solid ${tokenDivider}`,
              bgcolor: tokenCommon.white,
              overflow: 'hidden',
              boxShadow: 'none',
              flex: 1,
              minHeight: 0,
              display: 'grid',
              gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
            }}
          >
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1.5, px: {xs: 1.5, md: 2.25}, py: 1.5, borderBottom: `1px solid ${tokenDivider}`}}>
              <Box sx={{ textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.35 }}>
                  <SparkleIcon sx={{ color: tokenBrand.main, fontSize: 22 }} />
                  <Typography sx={{ color: tokenText.primary, fontWeight: 800, letterSpacing: '-0.03em', fontSize: '1.4rem', lineHeight: 1 }}>
                    BD Atlas AI
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ color: tokenText.secondary, fontWeight: 600 }}>
                  {`Good afternoon ${currentUserFirstName}. How can I help you today?`}
                </Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                <Chip
                  label={`${defaultScopeLabel} workspace`}
                  size="small"
                  sx={{
                    height: 26,
                    bgcolor: tokenBrand.softBg,
                    color: tokenBrand.main,
                    border: `1px solid ${tokenBrand.selectedBg}`,
                    fontWeight: 700,
                  }}
                />
                {assistantWorkspaceView === 'settings' ? (
                  <Chip
                    label="BD Atlas AI Settings"
                    size="small"
                    sx={{
                      height: 26,
                      bgcolor: workstationVisuals.slateSurface,
                      color: tokenText.secondary,
                      border: `1px solid ${tokenDivider}`,
                      fontWeight: 700,
                    }}
                  />
                ) : null}
              </Box>
            </Box>

            {assistantWorkspaceView === 'chat' ? (
            <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.75, px: {xs: 1.5, md: 2.25}, py: 1, borderBottom: `1px solid ${tokenDivider}`, bgcolor: workstationVisuals.slateSurface}}>
              {assistantQuickActions.map((quickAction) => (
                <Chip
                  key={quickAction.label}
                  label={quickAction.label}
                  onClick={quickAction.action}
                  size="small"
                  sx={{
                    height: 28,
                    borderRadius: 999,
                    bgcolor: tokenCommon.white,
                    color: tokenText.secondary,
                    border: `1px solid ${tokenDivider}`,
                    fontWeight: 600,
                  }}
                />
              ))}
              {filteredRecentChats.slice(0, 3).map((entry, index) => (
                <Chip
                  key={`${entry.label}-${index}`}
                  label={entry.label}
                  size="small"
                  variant={entry.selected ? 'filled' : 'outlined'}
                  sx={{
                    height: 28,
                    maxWidth: 220,
                    borderRadius: 999,
                    bgcolor: entry.selected ? tokenBrand.softBg : tokenCommon.white,
                    color: entry.selected ? tokenBrand.main : tokenText.secondary,
                    border: `1px solid ${entry.selected ? tokenBrand.selectedBg : tokenDivider}`,
                    fontWeight: entry.selected ? 700 : 600,
                    '& .MuiChip-label': {
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    },
                  }}
                />
              ))}
            </Box>
            ) : null}

            {assistantWorkspaceView === 'chat' ? (
              <Box
                ref={homeChatScrollRef}
                sx={{
                  minHeight: 0,
                  overflowY: 'auto',
                  px: { xs: 1.5, md: 2.25 },
                  py: 1.8,
                  pr: { xs: 1.25, md: 1.6 },
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.25,
                  bgcolor: tokenCommon.white,
                  scrollbarWidth: 'thin',
                }}
              >
                {aiMessages.map((message, index) => (
                  <React.Fragment key={`${message.role}-${index}`}>
                    <Box sx={{ display: 'flex', justifyContent: message.role === 'assistant' ? 'flex-start' : 'flex-end', width: '100%' }}>
                      {message.role === 'assistant' ? (
                        <Box sx={{ width: '100%', py: 1 }}>
                          {/* Assistant Header */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: isHomeChatLightMode ? '#1E3A8A' : '#E2E8F0', fontWeight: 700 }}>
                              BD Atlas AI
                            </Typography>
                            <Typography variant="caption" sx={{ color: isHomeChatLightMode ? '#64748B' : '#7F93B5', fontWeight: 600 }}>
                              {index <= 2 ? '09:21 AM' : '09:22 AM'}
                            </Typography>
                          </Box>
                          {/* Assistant Text */}
                          <Typography variant="body1" sx={{ color: isHomeChatLightMode ? '#334155' : '#E2E8F0', lineHeight: 1.6, pl: 0, pr: 1, whiteSpace: 'pre-line' }}>
                            {message.text}
                          </Typography>
                          {/* Assistant Inner Widgets */}
                          <Box sx={{ pl: 0, mt: 1 }}>
                            {message.variant === 'maintenance_summary' ? internalRenderMaintenanceSummaryMessage(message, isHomeChatLightMode ? 'light' : 'dark') : null}
                            {message.variant === 'technician_work_orders' ? internalRenderTechnicianWorkOrdersMessage(isHomeChatLightMode ? 'light' : 'dark', 'technician') : null}
                            {message.variant === 'planner_priority_queue' ? internalRenderTechnicianWorkOrdersMessage(isHomeChatLightMode ? 'light' : 'dark', 'planner') : null}
                            {message.variant === 'team_esos_summary' ? internalRenderTeamEsosMessage(isHomeChatLightMode ? 'light' : 'dark') : null}
                            {message.variant === 'priority_cards' && message.priorityCards?.length ? (
                              <Box sx={{ mt: 1.35 }}>
                                {(() => {
                                  const isDirectorNewsHeading = message.heading === MY_AI_ASSISTANT_SITE_NEWS_HEADING;
                                  const expandedPriorityCards = isDirectorNewsHeading ? effectiveHomeDirectorNewsCards : effectiveUrgentAiTasks;
                                  const priorityCardsToRender = ((effectiveHomeChatShowMore && (message.heading === 'Recommended priorities right now' || isDirectorNewsHeading)) ? expandedPriorityCards : message.priorityCards) ?? [];
                                  const canExpandPriorityCards = (message.heading === 'Recommended priorities right now' || isDirectorNewsHeading)
                                    && expandedPriorityCards.length > (message.priorityCards?.length ?? 0);
                                  const priorityCardMdSize = priorityCardsToRender.length >= 5 ? 4 : priorityCardsToRender.length >= 4 ? 3 : 4;

                                  return (
                                    <>
                                      <Typography
                                        variant="subtitle2"
                                        sx={{
                                          color: isHomeChatLightMode ? '#94A3B8' : '#F8FAFC',
                                          fontWeight: 800,
                                          mb: 1,
                                          letterSpacing: '0.05em',
                                          textTransform: 'uppercase',
                                          fontSize: '0.8rem',
                                        }}
                                      >
                                        {message.heading}
                                      </Typography>
                                      <Grid container spacing={1.15}>
                                        {priorityCardsToRender.map((task) => {
                                          const isNcCard = task.title === 'NC Raised This Morning';
                                          const isActionPriorityCard = task.title === 'My Action Priorities Today';
                                          const isMaintenanceCard = task.title.includes('Maintenance Requests');
                                          const isActiveCard = effectiveActiveHomePriorityCard === task.title;
                                          const activeStatusLabel = effectiveHomeChatInput
                                            ? 'Writing prompt...'
                                            : effectiveHomeAssistantTypingVisible
                                              ? 'Thinking...'
                                              : 'Opening...';
                                          const cardBorderColor = isHomeChatLightMode
                                            ? (isNcCard ? 'rgba(228,59,70,0.28)' : `${task.color}33`)
                                            : (isNcCard ? 'rgba(228,59,70,0.24)' : 'rgba(148,163,184,0.16)');
                                          const cardBg = isHomeChatLightMode
                                            ? (isNcCard
                                              ? 'linear-gradient(180deg, rgba(255,241,242,0.98) 0%, rgba(255,248,248,1) 100%)'
                                              : isActionPriorityCard
                                                ? 'linear-gradient(180deg, rgba(238,242,255,0.98) 0%, rgba(247,249,255,1) 100%)'
                                              : isMaintenanceCard
                                                ? 'linear-gradient(180deg, rgba(254,249,195,0.98) 0%, rgba(255,251,235,1) 100%)'
                                                : `linear-gradient(180deg, ${task.color}0D 0%, ${task.color}08 100%)`)
                                            : (isNcCard ? 'rgba(61,20,31,0.52)' : isActionPriorityCard ? 'rgba(41,48,94,0.54)' : isMaintenanceCard ? 'rgba(63,49,18,0.4)' : 'rgba(32, 42, 61, 0.82)');
                                          const titleColor = isHomeChatLightMode ? '#0F172A' : '#F8FAFC';
                                          const detailColor = isHomeChatLightMode ? '#475467' : '#C7D2E5';
                                          const ownerColor = isNcCard
                                            ? (isHomeChatLightMode ? '#C2414D' : '#F87171')
                                            : (isHomeChatLightMode ? task.color : '#60A5FA');

                                          return (
                                            <Grid key={task.title} size={{ xs: 12, md: priorityCardMdSize }} sx={{ display: 'flex' }}>
                                              <Paper
                                                elevation={0}
                                                onClick={task.action}
                                                sx={{
                                                  p: 1.25,
                                                  width: '100%',
                                                  minHeight: 92,
                                                  height: '100%',
                                                  display: 'flex',
                                                  flexDirection: 'column',
                                                  justifyContent: 'space-between',
                                                  borderRadius: 2.2,
                                                  position: 'relative',
                                                  overflow: 'hidden',
                                                  border: `1px solid ${cardBorderColor}`,
                                                  borderLeft: `4px solid ${task.color}`,
                                                  bgcolor: cardBg,
                                                  textAlign: 'left',
                                                  cursor: 'pointer',
                                                  boxShadow: isActiveCard
                                                    ? (isHomeChatLightMode
                                                      ? `0 0 0 2px ${task.color}26, 0 18px 36px ${task.color}24`
                                                      : `0 0 0 2px ${task.color}33, 0 18px 36px ${task.color}24`)
                                                    : isActionPriorityCard
                                                      ? (isHomeChatLightMode
                                                        ? '0 12px 24px rgba(79,70,229,0.14)'
                                                        : '0 0 0 1px rgba(129,140,248,0.16), 0 10px 22px rgba(79,70,229,0.14)')
                                                      : isNcCard
                                                        ? (isHomeChatLightMode
                                                          ? '0 10px 24px rgba(248,113,113,0.16)'
                                                          : '0 0 0 1px rgba(248,113,113,0.08), 0 10px 22px rgba(228,59,70,0.12)')
                                                        : (isHomeChatLightMode ? `0 12px 24px ${task.color}14` : `0 0 0 1px ${task.color}1F`),
                                                  animation: isActiveCard
                                                    ? 'homePriorityCardActive 1.45s ease-in-out infinite'
                                                    : isNcCard
                                                      ? 'homeNcPulse 2s ease-in-out infinite'
                                                      : 'none',
                                                  '@keyframes homePriorityCardActive': {
                                                    '0%, 100%': {
                                                      transform: 'translateY(-1px) scale(1.008)',
                                                      boxShadow: isHomeChatLightMode
                                                        ? `0 0 0 2px ${task.color}22, 0 16px 30px ${task.color}20`
                                                        : `0 0 0 2px ${task.color}30, 0 18px 34px ${task.color}24`,
                                                    },
                                                    '50%': {
                                                      transform: 'translateY(-3px) scale(1.018)',
                                                      boxShadow: isHomeChatLightMode
                                                        ? `0 0 0 4px ${task.color}18, 0 24px 42px ${task.color}28`
                                                        : `0 0 0 4px ${task.color}20, 0 24px 42px ${task.color}30`,
                                                    },
                                                  },
                                                  '@keyframes homeNcPulse': {
                                                    '0%, 100%': {
                                                      transform: 'scale(1)',
                                                      boxShadow: isHomeChatLightMode
                                                        ? '0 10px 24px rgba(228,59,70,0.12)'
                                                        : '0 0 0 0 rgba(248,113,113,0), 0 12px 24px rgba(228,59,70,0.14)',
                                                    },
                                                    '50%': {
                                                      transform: 'scale(1.018)',
                                                      boxShadow: isHomeChatLightMode
                                                        ? '0 0 0 6px rgba(248,113,113,0.10), 0 18px 34px rgba(228,59,70,0.18)'
                                                        : '0 0 0 6px rgba(248,113,113,0.08), 0 18px 34px rgba(228,59,70,0.24)',
                                                    },
                                                  },
                                                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                                                  '&::after': isActiveCard ? {
                                                    content: '""',
                                                    position: 'absolute',
                                                    inset: 0,
                                                    pointerEvents: 'none',
                                                    background: `linear-gradient(112deg, transparent 0%, transparent 34%, ${task.color}16 49%, transparent 64%, transparent 100%)`,
                                                    transform: 'translateX(-120%)',
                                                    animation: 'homePriorityCardSweep 1.6s ease-in-out infinite',
                                                  } : undefined,
                                                  '@keyframes homePriorityCardSweep': {
                                                    '0%': { transform: 'translateX(-120%)', opacity: 0 },
                                                    '24%': { opacity: 0.65 },
                                                    '58%': { transform: 'translateX(120%)', opacity: 0.32 },
                                                    '100%': { transform: 'translateX(120%)', opacity: 0 },
                                                  },
                                                  '&:hover': { borderColor: task.color, transform: 'translateY(-2px)' },
                                                }}
                                              >
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, height: '100%' }}>
                                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75 }}>
                                                    <Typography variant="caption" sx={{ color: titleColor, fontWeight: 800, display: 'block', lineHeight: 1.3, pr: 0.6 }}>
                                                      {task.title}
                                                    </Typography>
                                                    <Chip
                                                      label={task.severity}
                                                      size="small"
                                                      sx={{
                                                        height: 22,
                                                        bgcolor: isHomeChatLightMode ? `${task.color}12` : `${task.color}16`,
                                                        color: task.color,
                                                        fontWeight: 800,
                                                        border: `1px solid ${isHomeChatLightMode ? `${task.color}26` : `${task.color}33`}`,
                                                        flexShrink: 0,
                                                      }}
                                                    />
                                                  </Box>
                                                  <Typography variant="caption" sx={{ color: detailColor, display: 'block', lineHeight: 1.45, minHeight: 36 }}>
                                                    {task.detail}
                                                  </Typography>
                                                  <Box sx={{ mt: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0.55 }}>
                                                    <Typography variant="caption" sx={{ color: ownerColor, display: 'block', fontWeight: 800 }}>
                                                      {isNcCard ? 'Open guided Tier 1 prep' : task.owner}
                                                    </Typography>
                                                    {isActiveCard ? (
                                                      <Box
                                                        sx={{
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          gap: 0.55,
                                                          px: 0.72,
                                                          py: 0.32,
                                                          borderRadius: 999,
                                                          bgcolor: isHomeChatLightMode ? `${task.color}12` : `${task.color}18`,
                                                          color: task.color,
                                                          border: `1px solid ${isHomeChatLightMode ? `${task.color}26` : `${task.color}33`}`,
                                                          fontSize: '0.66rem',
                                                          fontWeight: 900,
                                                          lineHeight: 1,
                                                          letterSpacing: '0.01em',
                                                        }}
                                                      >
                                                        <Box
                                                          sx={{
                                                            width: 7,
                                                            height: 7,
                                                            borderRadius: '50%',
                                                            bgcolor: task.color,
                                                            boxShadow: `0 0 0 0 ${task.color}55`,
                                                            animation: 'homePriorityStatusDot 1.1s ease-in-out infinite',
                                                            '@keyframes homePriorityStatusDot': {
                                                              '0%, 100%': { transform: 'scale(0.9)', boxShadow: `0 0 0 0 ${task.color}44` },
                                                              '50%': { transform: 'scale(1.18)', boxShadow: `0 0 0 6px ${task.color}00` },
                                                            },
                                                          }}
                                                        />
                                                        {activeStatusLabel}
                                                      </Box>
                                                    ) : null}
                                                  </Box>
                                                </Box>
                                              </Paper>
                                            </Grid>
                                          );
                                        })}
                                      </Grid>
                                      {canExpandPriorityCards ? (
                                        <Box sx={{ mt: 1.1, display: 'flex', justifyContent: 'flex-end' }}>
                                          <Button variant="text" onClick={() => updateHomeChatShowMore((prev) => !prev)} sx={{ color: '#1D74FF', fontWeight: 800 }}>
                                            {effectiveHomeChatShowMore ? 'Show less' : 'Show more'}
                                          </Button>
                                        </Box>
                                      ) : null}
                                    </>
                                  );
                                })()}
                              </Box>
                            ) : null}
                            {message.variant === 'action' ? (
                              <Box sx={{ mt: 1.35, display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Chip label="Recommended next step" size="small" sx={{ bgcolor: `${message.accent ?? '#044ED7'}16`, color: message.accent ?? '#044ED7', fontWeight: 800, border: `1px solid ${message.accent ?? '#044ED7'}33` }} />
                                <Button
                                  variant="contained"
                                  onClick={message.action}
                                  sx={{
                                    bgcolor: message.accent ?? '#044ED7',
                                    fontWeight: 800,
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: message.accent ?? '#044ED7', opacity: 0.92, boxShadow: 'none' },
                                  }}
                                >
                                  {message.actionLabel}
                                </Button>
                              </Box>
                            ) : null}
                            {message.variant === 'priority_summary' && (message.priorityReasons?.length || message.priorityChanges?.length) ? (
                              <Box sx={{ mt: 1.3, borderRadius: 3, border: '1px solid #D7E3F4', bgcolor: '#FFFFFF', p: 1.35 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
                                  <Typography variant="subtitle2" sx={{ color: '#1F2366', fontWeight: 900 }}>
                                    {message.heading ?? 'AI prioritization is active'}
                                  </Typography>
                                  {message.badge ? (
                                    <Chip label={message.badge} size="small" sx={{ height: 22, bgcolor: '#ECFDF3', color: '#16A34A', border: '1px solid #B7E4C7', fontWeight: 900 }} />
                                  ) : null}
                                </Box>
                                {message.priorityReasons?.length ? (
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: message.priorityChanges?.length ? 1.1 : 0 }}>
                                    {message.priorityReasons.map((reason) => {
                                      const toneColor = reason.tone === 'critical'
                                        ? '#EF4444'
                                        : reason.tone === 'warning'
                                          ? '#F59E0B'
                                          : reason.tone === 'success'
                                            ? '#16A34A'
                                            : '#2563EB';
                                      return (
                                        <Box key={reason.label} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8 }}>
                                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: toneColor, mt: 0.55, boxShadow: `0 0 0 4px ${toneColor}14` }} />
                                          <Box>
                                            <Typography variant="caption" sx={{ color: '#101828', fontWeight: 900, display: 'block' }}>
                                              {reason.label}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: '#667085', lineHeight: 1.45 }}>
                                              {reason.detail}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      );
                                    })}
                                  </Box>
                                ) : null}
                                {message.priorityChanges?.length ? (
                                  <Box sx={{ borderRadius: 2.4, border: '1px solid #E5EAF2', bgcolor: '#F8FAFC', p: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 900, display: 'block', mb: 0.55 }}>
                                      What's changed
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                      {message.priorityChanges.map((item) => (
                                        <Box key={item} sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.65 }}>
                                          <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#16A34A', mt: 0.62 }} />
                                          <Typography variant="caption" sx={{ color: '#60708D', lineHeight: 1.45 }}>
                                            {item}
                                          </Typography>
                                        </Box>
                                      ))}
                                    </Box>
                                  </Box>
                                ) : null}
                              </Box>
                            ) : null}
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            maxWidth: '75%',
                            px: 2,
                            py: 1.2,
                            borderRadius: '18px 18px 4px 18px',
                            bgcolor: isHomeChatLightMode ? '#F3F4F6' : 'rgba(255, 255, 255, 0.08)',
                            color: isHomeChatLightMode ? '#1F2937' : '#F3F4F6',
                            boxShadow: 'none',
                          }}
                        >
                          <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: 'pre-line', fontWeight: 500 }}>
                            {message.text}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </React.Fragment>
                ))}
                {effectiveHomeAssistantTypingVisible ? (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', py: 1, width: '100%' }}>
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: isHomeChatLightMode ? '#1E3A8A' : '#E2E8F0', fontWeight: 700 }}>
                          BD Atlas AI
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, pl: 0 }}>
                        {[0, 1, 2].map((dot) => (
                          <Box
                            key={dot}
                            sx={{
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              bgcolor: isHomeChatLightMode ? '#94A3B8' : '#7F93B5',
                              animation: 'homeTypingPulse 1.1s ease-in-out infinite',
                              animationDelay: `${dot * 0.18}s`,
                              '@keyframes homeTypingPulse': {
                                '0%, 100%': { opacity: 0.35, transform: 'translateY(0)' },
                                '50%': { opacity: 1, transform: 'translateY(-2px)' },
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                ) : null}
              </Box>
            ) : (
              <Box
                sx={{
                  minHeight: 0,
                  overflowY: 'auto',
                  px: { xs: 1.5, md: 2.25 },
                  py: 1.6,
                  display: 'grid',
                  gap: 1.2,
                  alignContent: 'start',
                  bgcolor: tokenCommon.white,
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {xs: '1fr', xl: 'repeat(4, minmax(0, 1fr))'},
                    gap: 1,
                  }}
                >
                  {adminOverviewCards.map((card) => (
                    <Box
                      key={card.label}
                      sx={{
                        border: `1px solid ${tokenDivider}`,
                        borderRadius: 2.5,
                        p: 1.3,
                        bgcolor: tokenCommon.white,
                      }}
                    >
                      <Box sx={{width: 26, height: 3, borderRadius: 999, bgcolor: card.accent, mb: 0.9}} />
                      <Typography variant="caption" sx={{color: tokenText.secondary, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.3}}>
                        {card.label}
                      </Typography>
                      <Typography sx={{color: tokenText.primary, fontWeight: 800, fontSize: '1.4rem', lineHeight: 1.15, mt: 0.3}}>
                        {card.value}
                      </Typography>
                      <Typography variant="caption" sx={{color: tokenText.secondary, lineHeight: 1.45, display: 'block', mt: 0.55}}>
                        {card.detail}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {settingsSections.map((section) => (
                  <Box
                    key={section.title}
                    sx={{
                      border: `1px solid ${tokenDivider}`,
                      borderRadius: 2.5,
                      p: 1.4,
                      bgcolor: tokenCommon.white,
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 0.7, flexWrap: 'wrap'}}>
                      <Box sx={{minWidth: 0}}>
                        <Typography variant="subtitle2" sx={{color: tokenText.primary, fontWeight: 800, mb: 0.25}}>
                          {section.title}
                        </Typography>
                        <Typography variant="body2" sx={{color: tokenText.secondary, lineHeight: 1.55}}>
                          {section.description}
                        </Typography>
                      </Box>
                      <Chip
                        label={section.badge}
                        size="small"
                        sx={{
                          height: 24,
                          borderRadius: 999,
                          bgcolor: tokenBrand.softBg,
                          color: tokenBrand.main,
                          border: `1px solid ${tokenBrand.selectedBg}`,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {xs: '1fr', xl: 'repeat(3, minmax(0, 1fr))'},
                        gap: 0.85,
                      }}
                    >
                      {section.items.map((item) => (
                        <Box
                          key={`${section.title}-${item.label}`}
                          sx={{
                            borderRadius: 2,
                            border: `1px solid ${tokenDivider}`,
                            px: 1,
                            py: 0.95,
                            bgcolor: workstationVisuals.slateSurface,
                          }}
                        >
                          <Typography variant="caption" sx={{color: tokenText.secondary, fontWeight: 800, display: 'block', mb: 0.3}}>
                            {item.label}
                          </Typography>
                          <Typography variant="body2" sx={{color: tokenText.primary, lineHeight: 1.5}}>
                            {item.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}

              {assistantWorkspaceView === 'chat' ? (
                <Box sx={{ px: { xs: 1.25, md: 2 }, py: 1.25, borderTop: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white, position: 'relative', zIndex: 2 }}>
                  <AiAssistantComposer
                    value={effectiveHomeChatInput}
                    onChange={updateHomeChatInput}
                    onSend={(message) => onHandleAiSend(message, { openDrawer: false })}
                    placeholder="Ask BD Atlas AI anything about your line, documents, work, or shift context..."
                  />
                </Box>
              ) : (
                <Box sx={{ px: { xs: 1.5, md: 2.25 }, py: 1.1, borderTop: `1px solid ${tokenDivider}`, bgcolor: workstationVisuals.slateSurface }}>
                  <Typography variant="caption" sx={{color: tokenText.secondary}}>
                    Enterprise AI Administration controls agent routing, reusable context windows, data-source access, memory policy, permissions, prompt templates, and monitoring across industrial operations.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
      </Box>

      <EquipmentContextDrawer
        open={isEquipmentDrawerOpen}
        onClose={() => setIsEquipmentDrawerOpen(false)}
        context={selectedEquipmentContext}
        onOpenEso={() => {
          setIsEquipmentDrawerOpen(false);
          onSetCurrentScreen('eso_hub');
        }}
        onOpenEsoDetails={handleOpenContextEsoDrawer}
        onOpenMaintenanceRequest={() => {
          setIsEquipmentDrawerOpen(false);
          onSetCurrentScreen('maintenance_followup');
        }}
        onOpenMaintenanceRequestDetails={handleOpenContextMaintenanceRequestDrawer}
        onOpenSmartSearch={() => {
          setIsEquipmentDrawerOpen(false);
          onSetCurrentScreen('smart_search');
        }}
        onOpenWorkOrder={() => {
          setIsEquipmentDrawerOpen(false);
          if (selectedEquipmentRequestCard) {
            setChatWorkOrderDraft(buildWorkOrderDraftFromRequest(selectedEquipmentRequestCard));
            setChatWorkOrderTab('attachments');
            return;
          }
          onSetCurrentScreen('work_order_hub');
        }}
        onOpenWorkOrderDetails={handleOpenContextWorkOrderDrawer}
        surface={isHomeChatLightMode ? 'light' : 'dark'}
      />
      <MaintenanceRequestDrawer
        open={Boolean(selectedMaintenanceRequestCard)}
        card={selectedMaintenanceRequestCard}
        onClose={() => setSelectedMaintenanceRequestCard(null)}
        onAcceptToPlanning={(card) => {
          const requestId = (card as ChatMaintenanceRequestCard).requestContext.requestId;
          setMaintenanceToastMessage(`${requestId} accepted to planning.`);
          setSelectedMaintenanceRequestCard(null);
        }}
        onPlanNow={(card) => {
          setSelectedMaintenanceRequestCard(null);
          setChatWorkOrderDraft(buildWorkOrderDraftFromRequest(card));
          setChatWorkOrderTab('attachments');
        }}
        onLinkToExistingWork={(card) => {
          const requestId = (card as ChatMaintenanceRequestCard).requestContext.requestId;
          setMaintenanceToastMessage(`${requestId} linked to existing work.`);
          setSelectedMaintenanceRequestCard(null);
        }}
        onReject={(card) => {
          const requestId = (card as ChatMaintenanceRequestCard).requestContext.requestId;
          setMaintenanceToastMessage(`${requestId} rejected.`);
          setSelectedMaintenanceRequestCard(null);
        }}
      />
      <CreateWorkOrderDrawer
        open={Boolean(chatWorkOrderDraft)}
        activeTab={chatWorkOrderTab}
        initialDraft={chatWorkOrderDraft}
        onTabChange={setChatWorkOrderTab}
        onClose={() => {
          setChatWorkOrderDraft(null);
          setChatWorkOrderTab('attachments');
        }}
        onSubmit={(draft) => {
          setMaintenanceToastMessage(`${draft.sourceRequestId ?? draft.drawerTitle ?? 'Work Order'} updated.`);
          setChatWorkOrderDraft(null);
          setChatWorkOrderTab('attachments');
        }}
      />
      <BbsReportDrawer
        mode="view"
        report={selectedEsoReport}
        onClose={() => setSelectedEsoReport(null)}
      />
      <Snackbar
        open={Boolean(maintenanceToastMessage)}
        autoHideDuration={2800}
        onClose={() => setMaintenanceToastMessage(null)}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
      >
        <Alert onClose={() => setMaintenanceToastMessage(null)} severity="success" variant="filled" sx={{borderRadius: 2}}>
          {maintenanceToastMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
}



