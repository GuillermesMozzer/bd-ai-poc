import {
  Edit as EditIcon,
  BuildCircle as BuildCircleIcon,
  Groups as GroupsIcon,
  Search as SearchIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AutoAwesome as SparkleIcon,
  CalendarMonth as CalendarIcon,
  Description as DocumentIcon,
  Flag as FlagIcon,
  ThumbUp as ThumbUpIcon,
  Timeline as LinearProgressIcon,
  Description as SheetIcon,
  Public as GlobalViewIcon,
  DevicesOutlined as WorkstationIcon,
  PrecisionManufacturing as ProductionPlanningIcon,
  PrecisionManufacturing as SparePartsIcon,
  LocalShipping as LocalShippingIcon,
  FactCheck as FactCheckIcon,
  Science as ScienceIcon,
  Inventory2 as Inventory2Icon,
  ViewInAr as ViewInArIcon,
} from '@mui/icons-material';
import { AiEntryCard, UrgentAiTask, SmartHubKpi, SmartHubDeepInsight, HomeWidgetSize } from './types';

export const defaultHomeWidgetOrder = [
  'Line Performance',
  'Shift Schedule',
  'Doc Manager',
  'Shift Logbook',
  'Control Tower',
  'Maintenance',
  'Action Tracker',
  'Tier 1 Meeting',
  'Tier 1 Overview',
  'ESO',
  'CIL',
  'Smart Search',
  'Operations Entry',
];

export const defaultHomeWidgetSizeMap: Record<string, HomeWidgetSize> = {
  'Line Performance': 'large',
  'Shift Schedule': 'medium',
  'Doc Manager': 'small',
  'Shift Logbook': 'medium',
  'Control Tower': 'small',
  'Maintenance': 'medium',
  'Action Tracker': 'small',
  'Tier 1 Meeting': 'medium',
  'Tier 1 Overview': 'small',
  ESO: 'small',
  CIL: 'medium',
  'Smart Search': 'small',
  'Operations Entry': 'small',
};

export const aiPromptSuggestions = [
  'Summarize Line 10 status',
  'Show urgent document approvals',
  'Create a maintenance note draft',
  'What changed this shift?',
];

export const getAiEntryCards = (setCurrentScreen: (screen: any) => void, openSmartSearch: () => void, setIsDrawerOpen: (open: boolean) => void): AiEntryCard[] => [
  { title: 'Shift Logbook', caption: 'Review handoffs, exceptions, and operator notes.', icon: <EditIcon sx={{ fontSize: 20 }} />, color: '#044ED7', action: () => setCurrentScreen('shift_logbook') },
  { title: 'Maintenance', caption: 'Open equipment context and prepare requests faster.', icon: <BuildCircleIcon sx={{ fontSize: 20 }} />, color: '#0f766e', action: () => setCurrentScreen('maintenance_hub') },
  { title: 'Tier Meeting', caption: 'Walk into daily meetings with the right line summary.', icon: <GroupsIcon sx={{ fontSize: 20 }} />, color: '#9199D8', action: () => setCurrentScreen('tier_meeting') },
  { title: 'Smart Search', caption: 'Ask BLU.AI across documents, workflows, and line history.', icon: <SearchIcon sx={{ fontSize: 20 }} />, color: '#FF6E00', action: () => openSmartSearch() },
  { title: 'Action Tracker', caption: 'See open actions, due dates, and accountability gaps.', icon: <AssignmentTurnedInIcon sx={{ fontSize: 20 }} />, color: '#E43B46', action: () => setCurrentScreen('action_tracker') },
  { title: 'Operations Entry', caption: 'Start a guided entry with AI assistance built in.', icon: <SparkleIcon sx={{ fontSize: 20 }} />, color: '#044ED7', action: () => { setCurrentScreen('ai_assistant'); setIsDrawerOpen(true); } },
];

export const getUrgentAiTasks = (setCurrentScreen: (screen: any) => void): UrgentAiTask[] => [
  { title: 'WO-2481 Conveyor Verification', detail: 'Due today at 14:30', owner: 'Maintenance', severity: 'Critical', color: '#E43B46', action: () => setCurrentScreen('work_order_hub') },
  { title: 'Employee Handbook E-Signature', detail: 'Approval overdue by 1 day', owner: 'Quality', severity: 'High', color: '#FF6E00', action: () => setCurrentScreen('document_management') },
  { title: 'Tier 1 Action Review', detail: '3 blockers before next handoff', owner: 'Operations', severity: 'Needs Review', color: '#044ED7', action: () => setCurrentScreen('tier_meeting') },
];

export const getAppLibraryItems = (
  setCurrentScreen: (screen: any) => void,
  setIsAppLibraryOpen: (open: boolean) => void,
  openSmartSearch: () => void,
  setHomeViewMode: (mode: 'chatbot' | 'widgets') => void
) => [
    { title: 'Global View', caption: 'Site-wide operational intelligence and map view.', kpi: '7 regions active', icon: <GlobalViewIcon sx={{ fontSize: 22 }} />, color: '#1E40AF', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('global_view'); } },
    { title: 'Blu.AI', caption: 'Your factory assistant for documents and line history.', kpi: 'AI Ready', icon: <SparkleIcon sx={{ fontSize: 22 }} />, color: '#1D74FF', action: () => { setIsAppLibraryOpen(false); setHomeViewMode('chatbot'); setCurrentScreen('ai_assistant'); } },
    { title: 'Shift Schedule', caption: 'See coverage, absences, and handoff timing.', kpi: '2 open swaps', icon: <CalendarIcon sx={{ fontSize: 22 }} />, color: '#0ea5e9', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('shift_schedule'); } },
    { title: 'Production Planning', caption: 'Open planning workflows, sequencing, and scheduling.', kpi: 'Planning ready', icon: <ProductionPlanningIcon sx={{ fontSize: 22 }} />, color: '#7C3AED', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('production_planning'); } },
    { title: 'Doc Manager', caption: 'Search, review, and approve documents.', kpi: '1 new approval', icon: <DocumentIcon sx={{ fontSize: 22 }} />, color: '#044ED7', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('document_management'); } },
    { title: 'Shift Logbook', caption: 'Review handoffs and shift notes.', kpi: '2 shift changes', icon: <EditIcon sx={{ fontSize: 22 }} />, color: '#1D74FF', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('shift_logbook'); } },
    { title: 'Control Tower', caption: 'Watch plant priorities, risks, and live actions.', kpi: '3 live alerts', icon: <FlagIcon sx={{ fontSize: 22 }} />, color: '#9199D8', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('control_tower'); } },
    { title: 'Smart Search', caption: 'Ask across documents, workflows, and line history.', kpi: '4 suggested queries', icon: <SearchIcon sx={{ fontSize: 22 }} />, color: '#FF6E00', action: () => { setIsAppLibraryOpen(false); openSmartSearch(); } },
    { title: 'Action Tracker', caption: 'See due dates, blockers, and ownership.', kpi: '4 open actions', icon: <AssignmentTurnedInIcon sx={{ fontSize: 22 }} />, color: '#E43B46', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('action_tracker'); } },
    { title: 'Maintenance Plan', caption: 'PM frequencies and task lists for preventive maintenance.', kpi: '19 PM Schedules', icon: <CalendarIcon sx={{ fontSize: 22 }} />, color: '#0f766e', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('maintenance_plan'); } },
    { title: 'Maintenance Planner Calendar', caption: 'Review planned maintenance and scheduling conflicts.', kpi: '3 planned items', icon: <CalendarIcon sx={{ fontSize: 22 }} />, color: '#0f766e', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('maintenance_planner'); } },
    { title: 'Maintenance Calendar', caption: 'Review work orders by week with date and filter controls.', kpi: '21 work orders', icon: <CalendarIcon sx={{ fontSize: 22 }} />, color: '#0f766e', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('maintenance_calendar'); } },
    { title: 'Maintenance Follow Up Board', caption: 'Monitor maintenance task progress and closures.', kpi: '5 pending reviews', icon: <AssignmentTurnedInIcon sx={{ fontSize: 22 }} />, color: '#0f766e', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('maintenance_followup'); } },
    { title: 'Spare Parts Management', caption: 'Manage inventory, issue parts, and receive stock replenishment.', kpi: 'Coming Soon', icon: <SparePartsIcon sx={{ fontSize: 22 }} />, color: '#0f766e', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('tool_crib'); } },
    { title: 'Equipment Ledger', caption: 'Centralized record for asset history and specs.', kpi: 'Coming Soon', icon: <SheetIcon sx={{ fontSize: 22 }} />, color: '#0f766e', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('equipment_ledger'); } },
    { title: 'CBM & PdM', caption: 'Monitor equipment health and predictive maintenance alerts.', kpi: '3 active alerts', icon: <BuildCircleIcon sx={{ fontSize: 22 }} />, color: '#0f766e', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('maintenance_cbm_pdm'); } },
    { title: 'Maintenance Analytics', caption: 'Review maintenance KPIs, costs, and reliability metrics.', kpi: '2 overdue', icon: <FlagIcon sx={{ fontSize: 22 }} />, color: '#0f766e', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('maintenance_performance'); } },
    { title: 'ESO', caption: 'Track safety observations and escalations.', kpi: '2 open observations', icon: <ThumbUpIcon sx={{ fontSize: 22 }} />, color: '#FF6E00', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('eso_hub'); } },
    { title: 'Line Performance', caption: 'Follow throughput, downtime, and trend movement.', kpi: '+14% weekly', icon: <LinearProgressIcon sx={{ fontSize: 22 }} />, color: '#00AF95', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('line_performance'); } },
    { title: 'CIL', caption: 'Track clean, inspect, lubricate, and tighten routines.', kpi: 'Abnormalities and execution time', icon: <SheetIcon sx={{ fontSize: 22 }} />, color: '#06b6d4', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('cil_kpis'); } },
    { title: 'Centerline', caption: 'Track parameter checks and process stability trends.', kpi: 'Daily parameter monitoring', icon: <SheetIcon sx={{ fontSize: 22 }} />, color: '#0891b2', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('centerline_kpis'); } },
    { title: 'Equipment Setup Changeover', caption: 'Follow and manage changeover readiness and execution.', kpi: '2 pending changeovers', icon: <BuildCircleIcon sx={{ fontSize: 22 }} />, color: '#0f766e', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('equipment_changeover'); } },
    { title: 'Manage Activities', caption: 'Track work tasks and operator activities in one place.', kpi: '4 active tasks', icon: <AssignmentTurnedInIcon sx={{ fontSize: 22 }} />, color: '#E43B46', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('manage_tasks'); } },
    { title: 'Shift Schedule Operator', caption: 'Dedicated view for operators to manage their shift schedules.', kpi: 'Coming Soon', icon: <CalendarIcon sx={{ fontSize: 22 }} />, color: '#0ea5e9', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('shift_schedule_operator'); } },
    { title: 'Equipment Setup Changeover Operator', caption: 'Focused view for changeover readiness and execution.', kpi: 'Coming Soon', icon: <BuildCircleIcon sx={{ fontSize: 22 }} />, color: '#0f766e', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('equipment_changeover_operator'); } },
    { title: 'CIL Operator', caption: 'Dedicated workspace for CIL task execution.', kpi: 'Coming Soon', icon: <SheetIcon sx={{ fontSize: 22 }} />, color: '#06b6d4', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('cil_operator'); } },
    { title: 'Centerline Operator', caption: 'Dedicated workspace for centerline task execution.', kpi: 'Coming Soon', icon: <SheetIcon sx={{ fontSize: 22 }} />, color: '#0891b2', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('centerline_operator'); } },
    { title: 'All Workstations', caption: 'Manage site hierarchy, connections, and users.', kpi: '6 active sites', icon: <WorkstationIcon sx={{ fontSize: 22 }} />, color: '#1663FF', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('all_workstations'); } },
    { title: 'Ai Assistant', caption: 'Expanded factory assistant for documents and line history.', kpi: 'AI Ready', icon: <SparkleIcon sx={{ fontSize: 22 }} />, color: '#1D74FF', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('ai_assistant'); } },
    {
      title: 'Logistics Control Tower',
      caption: 'Single-screen executive cockpit with macroflow KPIs (IN01–OB03) and progressive drill-down (inbound receiving included).',
      kpi: '6 macroflows · L1 cockpit',
      icon: <LocalShippingIcon sx={{ fontSize: 22 }} />,
      color: '#0B5CAB',
      action: () => { setIsAppLibraryOpen(false); setCurrentScreen('logistics_control_tower'); },
    },
    {
      title: 'Logistics Control Tower V2',
      caption: 'Active decision system: DA queue, SpaceX gating, steril custody, inbound SLA, and ATLAS.AI co-pilot.',
      kpi: 'Decision cockpit · V2',
      icon: <LocalShippingIcon sx={{ fontSize: 22 }} />,
      color: '#0B5CAB',
      action: () => { setIsAppLibraryOpen(false); setCurrentScreen('logistics_control_tower_v2'); },
    },
    { title: 'Quality Release', caption: 'QA hold queues, SQE notifications, and urgency requests.', kpi: 'Human release gate', icon: <FactCheckIcon sx={{ fontSize: 22 }} />, color: '#0B5CAB', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('quality_release'); } },
    { title: 'Shipment Readiness', caption: 'Pledge, 48h, and backorder outbound readiness.', kpi: 'Hazmat gated', icon: <LocalShippingIcon sx={{ fontSize: 22 }} />, color: '#0B5CAB', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('shipment_readiness'); } },
    { title: 'Pallet Load Check', caption: '3D guided pallet verification, checklist, photo evidence, and supervisor queue.', kpi: 'Scan → Ready / Blocked', icon: <ViewInArIcon sx={{ fontSize: 22 }} />, color: '#0B5CAB', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('pallet_verification'); } },
    { title: 'Sterilization Tracker', caption: 'External steril loads and post-steril QA TAT.', kpi: '7-day QA window', icon: <ScienceIcon sx={{ fontSize: 22 }} />, color: '#0B5CAB', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('sterilization_tracker'); } },
    { title: 'WIP Control Tower', caption: 'Traceable WIP objects, scan moves, genealogy, and exceptions.', kpi: 'Plant-wide WIP', icon: <Inventory2Icon sx={{ fontSize: 22 }} />, color: '#0B5CAB', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('wip_control_tower'); } },
    { title: 'Sterilization / Outbound CT', caption: 'Level 2 OB01–OB03 severity board for steril + shipping.', kpi: 'OB01–OB03', icon: <ScienceIcon sx={{ fontSize: 22 }} />, color: '#0B5CAB', action: () => { setIsAppLibraryOpen(false); setCurrentScreen('sterilization_outbound_control_tower'); } },
  ];

export const smartHubKpis: SmartHubKpi[] = [
  { label: 'Live Alerts', value: '3', tone: '#E43B46', note: '1 critical maintenance item' },
  { label: 'Shift Changes', value: '2', tone: '#0ea5e9', note: 'coverage still pending' },
  { label: 'Open Actions', value: '4', tone: '#9199D8', note: '1 blocked by approval' },
  { label: 'Doc Approvals', value: '1', tone: '#FF6E00', note: 'overdue e-signature' },
  { label: 'Work Orders', value: '7', tone: '#0f766e', note: '1 due this shift' },
  { label: 'Production Trend', value: '+14%', tone: '#00AF95', note: 'vs last week' },
  { label: 'Tier Blockers', value: '3', tone: '#9199D8', note: '2 need owners' },
  { label: 'ESO Items', value: '2', tone: '#fb923c', note: '1 pending closure' },
];

export const smartHubWorkstreamChart = [
  { stream: 'Shift', value: 4 },
  { stream: 'Docs', value: 2 },
  { stream: 'Maint', value: 7 },
  { stream: 'Tier 1', value: 3 },
  { stream: 'Actions', value: 4 },
  { stream: 'ESO', value: 2 },
];

export const smartHubDeepInsights: SmartHubDeepInsight[] = [
  { title: 'Coverage pressure rising', detail: 'Shift Schedule and Shift Logbook are linked by two changes and one unresolved backup.', tone: '#0ea5e9' },
  { title: 'Maintenance remains the main risk', detail: 'Work Order Hub and Maintenance stream account for the highest near-term operational exposure.', tone: '#E43B46' },
  { title: 'Document flow is slowing action closure', detail: 'The overdue e-signature is now affecting both Smart Search and Action Tracker follow-through.', tone: '#FF6E00' },
  { title: 'Tier 1 needs a stronger update loop', detail: 'Three blockers remain active across Tier 1 Meeting and Tier 1 Overview, but only one has clear ownership.', tone: '#9199D8' },
];

export const toolInsightMap: Record<string, string> = {
  'Shift Schedule': 'Maria S. is out today and a second-half swap still needs confirmation before 15:00.',
  'Doc Manager': 'The Employee Handbook approval is overdue and still blocking one downstream workflow.',
  'Shift Logbook': 'Two shift changes and one maintenance observation should be carried into handoff.',
  'Control Tower': 'Line 10 and maintenance verification are the top plant priorities right now.',
  'Smart Search': 'The fastest search win is the blocked e-signature and its linked approval trail.',
  'Tier 1 Meeting': 'Three blockers are queued for the next meeting and one quality item needs escalation.',
  'Action Tracker': 'Four actions remain open, with one blocked and another due before handoff.',
  'Tier 1 Overview': 'Safety and quality are the two pillars most likely to move before the next review.',
  'Operations Entry': 'BLU.AI can prefill a handoff draft with the centerlining and maintenance updates.',
  'Maintenance': 'WO-2481 and the hydraulic press inspection are the highest-risk maintenance items.',
  'ESO': 'Two safety observations remain open and one closure needs owner confirmation.',
  'Line Performance': 'Weekly output is trending up, but downtime concentration is still tied to Line 10.',
  'CIL': 'Operator CIL completion is at 45% and two technician abnormalities still need closure.',
};

export const toolMetricMap: Record<string, Array<{ label: string; value: string; tone: string }>> = {
  'Shift Schedule': [
    { label: 'Absences', value: '1', tone: '#0ea5e9' },
    { label: 'Open swaps', value: '2', tone: '#044ED7' },
  ],
  'Doc Manager': [
    { label: 'New files', value: '7', tone: '#044ED7' },
    { label: 'Overdue', value: '1', tone: '#FF6E00' },
  ],
  'Shift Logbook': [
    { label: 'Handoffs', value: '3', tone: '#1D74FF' },
    { label: 'Exceptions', value: '2', tone: '#FF6E00' },
  ],
  'Control Tower': [
    { label: 'Live alerts', value: '3', tone: '#9199D8' },
    { label: 'Critical', value: '1', tone: '#E43B46' },
  ],
  'Smart Search': [
    { label: 'Indexed sources', value: '10', tone: '#FF6E00' },
    { label: 'Connected records', value: '60+', tone: '#044ED7' },
  ],
  'Tier 1 Meeting': [
    { label: 'Blockers', value: '3', tone: '#9199D8' },
    { label: 'Escalations', value: '1', tone: '#E43B46' },
  ],
  'Action Tracker': [
    { label: 'Open', value: '4', tone: '#E43B46' },
    { label: 'Due today', value: '2', tone: '#FF6E00' },
  ],
  'Tier 1 Overview': [
    { label: 'Pillars', value: '4', tone: '#9199D8' },
    { label: 'At risk', value: '1', tone: '#E43B46' },
  ],
  'Operations Entry': [
    { label: 'Drafts', value: '1', tone: '#044ED7' },
    { label: 'Ready', value: '3', tone: '#00AF95' },
  ],
  'Maintenance': [
    { label: 'Work orders', value: '7', tone: '#0f766e' },
    { label: 'Due now', value: '1', tone: '#E43B46' },
  ],
  'ESO': [
    { label: 'Open obs', value: '2', tone: '#FF6E00' },
    { label: 'Escalated', value: '1', tone: '#E43B46' },
  ],
  'Line Performance': [
    { label: 'Output', value: '+14%', tone: '#00AF95' },
    { label: 'Downtime', value: '-6%', tone: '#044ED7' },
  ],
  'CIL': [
    { label: 'Operator progress', value: '45%', tone: '#06b6d4' },
    { label: 'Tech follow-up', value: '29%', tone: '#FF6E00' },
  ],
};

export const toolOpsMetaMap: Record<string, { status: 'On Track' | 'Watch' | 'Critical'; owner: string; updated: string; progress: number; attention: boolean }> = {
  'Shift Schedule': { status: 'Watch', owner: 'Ops Lead', updated: '5 min ago', progress: 72, attention: true },
  'Doc Manager': { status: 'Watch', owner: 'Quality', updated: '3 min ago', progress: 65, attention: true },
  'Shift Logbook': { status: 'On Track', owner: 'Line 10', updated: '2 min ago', progress: 84, attention: false },
  'Control Tower': { status: 'Critical', owner: 'Control Team', updated: '1 min ago', progress: 48, attention: true },
  'Smart Search': { status: 'On Track', owner: 'BLU.AI', updated: 'Live', progress: 88, attention: false },
  'Tier 1 Meeting': { status: 'Watch', owner: 'Tier Coach', updated: '10 min ago', progress: 61, attention: true },
  'Action Tracker': { status: 'Critical', owner: 'Ops Manager', updated: '4 min ago', progress: 43, attention: true },
  'Tier 1 Overview': { status: 'Watch', owner: 'Performance', updated: '8 min ago', progress: 67, attention: true },
  'Operations Entry': { status: 'On Track', owner: 'Supervisor', updated: '11 min ago', progress: 79, attention: false },
  'Maintenance': { status: 'Critical', owner: 'Maintenance', updated: '2 min ago', progress: 41, attention: true },
  'ESO': { status: 'Watch', owner: 'Safety', updated: '6 min ago', progress: 58, attention: true },
  'Line Performance': { status: 'On Track', owner: 'Line Lead', updated: 'Live', progress: 90, attention: false },
  'CIL': { status: 'Watch', owner: 'CIL Team', updated: '7 min ago', progress: 54, attention: true },
};

import { getGlobalCatalogStats, getGlobalSearchCatalog } from './smartSearch/globalCatalog';

export const smartSearchSuggestedQueries = [
  'Conveyor bearing vibration trend Station 12',
  'What is blocking WO-2481 closure?',
  'What documents explain bearing escalation?',
  'Show operator training for bearing inspection',
  'Maintenance manual for hydraulic press #4',
  'Last 3 shift exceptions on Line A3',
];

export const getSmartSearchCatalogStats = (currentUserName = 'Operator') => getGlobalCatalogStats(currentUserName);

const defaultCatalog = getGlobalSearchCatalog('Operator');

export const smartSearchAssets = defaultCatalog.Assets;

export const smartSearchCategories = ['All', 'Documents', 'Tasks & Work Orders', 'Notifications', 'Trainings', 'Assets', 'Time Series', '3D', 'Action Tracking', 'ESO', 'Shift Notes'] as const;

export const homeSiteOptions = ['Global', 'Sandy', 'Europe', 'Asia', 'Campinas', 'Tijuana', 'Plymouth'] as const;

export const smartSearchTimeSeries = defaultCatalog['Time Series'];
export const smartSearch3DAssets = defaultCatalog['3D'];
export const smartSearchDocuments = defaultCatalog.Documents;
export const smartSearchTasks = (currentUserName: string) => getGlobalSearchCatalog(currentUserName)['Tasks & Work Orders'];
export const smartSearchNotifications = defaultCatalog.Notifications;
export const smartSearchActionTracking = defaultCatalog['Action Tracking'];
export const smartSearchEsoItems = defaultCatalog.ESO;
export const smartSearchShiftNotes = defaultCatalog['Shift Notes'];
export const smartSearchTrainings = defaultCatalog.Trainings;

export const staffingSignals = [
  { operator: 'Maria S.', status: 'Out today', area: 'Line 10 packaging', nextNeed: 'Shift swap needed before 15:00', backup: 'Andre P.' },
  { operator: 'Julio R.', status: 'Training overlap', area: 'Press cell', nextNeed: 'Coverage check for second shift', backup: 'Pending lead confirmation' },
];

export const workflowRecommendations = [
  {
    title: 'Cover Maria on Line 10',
    detail: `${staffingSignals[0].operator} is ${staffingSignals[0].status.toLowerCase()} in ${staffingSignals[0].area}, and ${staffingSignals[0].nextNeed.toLowerCase()}. BLU.AI recommends starting a shift swap and notifying ${staffingSignals[0].backup}.`,
  },
];

