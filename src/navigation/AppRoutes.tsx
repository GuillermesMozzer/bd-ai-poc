import React, { Suspense, lazy } from 'react';
import {
  Box,
  Typography,
  Paper,
} from '@mui/material';
import {
  EmailOutlined as EmailOutlinedIcon,
} from '@mui/icons-material';

// Lazy load screens
const AiHomeScreen = lazy(() => import('../aiHome/components/AiHomeScreen').then(m => ({ default: m.AiHomeScreen })));
const SmartSearchScreen = lazy(() => import('../aiHome/components/SmartSearchScreen').then(m => ({ default: m.SmartSearchScreen })));
const MaintenanceFollowUpBoardPage = lazy(() => import('../Maintenance/pages/MaintenanceFollowUpBoardPage'));
const MaintenancePlannerPage = lazy(() => import('../Maintenance/pages/MaintenancePlannerPage'));
const MaintenanceMyTeamPage = lazy(() => import('../Maintenance/pages/MaintenanceMyTeamPage'));
const MaintenancePlan = lazy(() => import('../Maintenance/pages/MaintenancePlan'));
const ActionTrackerScreen = lazy(() => import('../actionTracker/components/ActionTrackerScreen'));
const TierMeetingBoard = lazy(() => import('../tierMeeting/components/TierMeetingBoard'));
const TierOverviewScreen = lazy(() => import('../tierMeeting/components/TierOverviewScreen'));
const GlobalViewScreen = lazy(() => import('../globalView/components/GlobalViewScreen'));
const ControlTowerScreen = lazy(() => import('../controlTower/ControlTowerScreen'));
const WorkstationScreen = lazy(() => import('../workstation/components/WorkstationScreen'));
const WorkstationsLibraryScreen = lazy(() => import('../workstation/components/WorkstationsLibraryScreen'));
const DashboardScreen = lazy(() => import('../shopfloor/components/DashboardScreen'));
const NotificationDashboard = lazy(() => import('../shopfloor/components/NotificationDashboard'));
const ProductionPlanningScreen = lazy(() => import('../productionPlanning/ProductionPlanningScreen'));
const EsoHubScreen = lazy(() => import('../shopfloor/components/EsoHubScreen'));
const LinePerformanceScreen = lazy(() => import('../shopfloor/components/LinePerformanceScreen'));
const CiltKpisScreen = lazy(() => import('../shopfloor/components/CiltKpisScreen'));
const EquipmentChangeoverScreen = lazy(() => import('../shopfloor/components/EquipmentChangeoverScreen'));
const ManageTasksScreen = lazy(() => import('../shopfloor/components/ManageTasksScreen'));
const WorkOrderHubScreen = lazy(() => import('../shopfloor/components/WorkOrderHubScreen'));
const ShiftLogbookScreen = lazy(() => import('../shiftManagement/components/ShiftLogbookScreen'));
const ShiftScheduleScreen = lazy(() => import('../shiftManagement/components/ShiftScheduleScreen'));
const ShiftPlannerScreen = lazy(() => import('../shiftManagement/components/ShiftPlannerScreen'));
const ShiftTeamManagementScreen = lazy(() => import('../shiftManagement/components/ShiftTeamManagementScreen'));
const ShiftSiteOrganogramScreen = lazy(() => import('../shiftManagement/components/ShiftSiteOrganogramScreen'));
const AllWorkstationsPage = lazy(() => import('../workstation/allworkstation/AllWorkstationsPage'));
const SparePartsManagementPage = lazy(() => import('../Maintenance/pages/SparePartsManagementPage'));
const EquipmentLedgerPage = lazy(() => import('../Maintenance/pages/EquipmentLedgerPage'));
const AssetExplorerScreen = lazy(() => import('../otms/AssetExplorer'));
const OtAssetTypeWizardScreen = lazy(() => import('../otms/OtAssetTypeWizardScreen'));
const MaintenanceRequestLogPage = lazy(() => import('../Maintenance/pages/MaintenanceRequestLogPage'));
const MaintenanceCbmPdmPage = lazy(() => import('../Maintenance/pages/MaintenanceCbmPdmPage'));
const MaintenancePerformancePage = lazy(() => import('../Maintenance/pages/MaintenancePerformancePage'));
const ShiftScheduleOperatorPage = lazy(() => import('../shiftManagement/pages/construction/ShiftScheduleOperatorPage'));
const EquipmentChangeoverOperatorPage = lazy(() => import('../shopfloor/components/construction/EquipmentChangeoverOperatorPage'));
const CilCenterLineOperatorPage = lazy(() => import('../shopfloor/components/construction/CilCenterLineOperatorPage'));
const MyAiAssistantExpandedScreen = lazy(() => import('../aiHome/components/MyAiAssistantExpandedScreen'));
const LogisticsMobileOpsPage = lazy(() => import('../logistics/pages/LogisticsMobileOpsPage'));
const LogisticsControlTowerPage = lazy(() => import('../logistics/pages/LogisticsControlTowerPage'));
const QualityReleasePage = lazy(() => import('../logistics/pages/QualityReleasePage'));
const ShipmentReadinessPage = lazy(() => import('../logistics/pages/ShipmentReadinessPage'));
const SterilizationTrackerPage = lazy(() => import('../logistics/pages/SterilizationTrackerPage'));
const ExternalTransferPortalPage = lazy(() => import('../logistics/pages/ExternalTransferPortalPage'));
const GuidedTasksPage = lazy(() => import('../logistics/pages/GuidedTasksPage'));
const JobReadinessPage = lazy(() => import('../logistics/pages/JobReadinessPage'));
const ProductionAlertsPage = lazy(() => import('../logistics/pages/ProductionAlertsPage'));
const MachineStatusPage = lazy(() => import('../logistics/pages/MachineStatusPage'));
const WipControlTowerPage = lazy(() => import('../logistics/pages/WipControlTowerPage'));
const SterilizationOutboundControlTowerPage = lazy(
  () => import('../logistics/pages/SterilizationOutboundControlTowerPage'),
);
const PalletVerificationPage = lazy(() => import('../logistics/pages/PalletVerificationPage'));
// Maintenance data imports removed as pages now handle their own data
import { type AppScreen } from './navigationConfig';
import { ActionTrackerCategory, ActionTrackerRow } from '../actionTracker/types';
import { useActionTrackerContext } from '../actionTracker/contexts/ActionTrackerContext';
import { ArtifactDetail } from '../shopfloor/types';
import { type AppUserRole } from '../utils/user';

// Lazy load document management screens
const DocumentManagementScreen = lazy(() => import('../documentManagement/DocumentManagementScreen'));
const DocumentArtifactDetailScreen = lazy(() => import('../documentManagement/DocumentArtifactDetailScreen'));
const DocumentSearchExplorerScreen = lazy(() => import('../documentManagement/DocumentSearchExplorerScreen'));
const DocumentRevisionApprovalScreen = lazy(() => import('../documentManagement/DocumentRevisionApprovalScreen'));
const DocumentReviewFlowScreen = lazy(() => import('../documentManagement/DocumentReviewFlowScreen'));
const DocumentVersionHistoryScreen = lazy(() => import('../documentManagement/DocumentVersionHistoryScreen'));
const DocumentAuditTrailScreen = lazy(() => import('../documentManagement/DocumentAuditTrailScreen'));
const DocumentComplianceDashboard = lazy(() => import('../documentManagement/DocumentComplianceDashboard'));
const DocumentAdvancedSearchScreen = lazy(() => import('../documentManagement/DocumentAdvancedSearchScreen'));
const DocumentOperationsDashboard = lazy(() => import('../documentManagement/DocumentOperationsDashboard'));
const DocumentAIHubScreen = lazy(() => import('../documentManagement/DocumentAIHubScreen'));
const DocumentESignatureScreen = lazy(() => import('../documentManagement/DocumentESignatureScreen'));
const DocumentTemplateSelectionScreen = lazy(() => import('../documentManagement/DocumentTemplateSelectionScreen'));

const UnderConstructionScreen = ({ title, activeTheme }: { title: string; activeTheme: any }) => (
  <Box
    sx={{
      flexGrow: 1,
      minHeight: 'calc(100vh - 112px)',
      overflowY: 'auto',
      bgcolor: 'background.default',
      p: { xs: 2, md: 4 },
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Paper
      elevation={0}
      sx={{
        width: 'min(720px, 100%)',
        p: { xs: 3, md: 4 },
        borderRadius: '12px',
        border: '1px solid var(--token-divider)',
        textAlign: 'center',
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="overline" sx={{ color: activeTheme.primary, fontWeight: 800, letterSpacing: 0 }}>
        Workstream App
      </Typography>
      <Typography variant="h4" sx={{ mt: 1, fontWeight: 800, color: activeTheme.textPrimary }}>
        {title}
      </Typography>
      <Typography variant="h6" sx={{ mt: 1.2, color: activeTheme.textSecondary, fontWeight: 700 }}>
        Under Construction
      </Typography>
      <Typography variant="body2" sx={{ mt: 1.1, color: activeTheme.textSecondary }}>
        This view is being refined and will be available soon.
      </Typography>
    </Paper>
  </Box>
);

const documentScreenFallback = (
  <Box sx={{ p: 4, textAlign: 'center' }}>
    <Typography>Loading Document Module...</Typography>
  </Box>
);

interface AppRoutesProps {
  currentScreen: AppScreen;
  activeTheme: any;
  setCurrentScreen: (screen: AppScreen) => void;
  openSmartSearch: () => void;
  setIsDrawerOpen: (open: boolean) => void;
  setIsAiDrawerOpen: (open: boolean) => void;
  handleAiSend: (message: string, options?: any) => void;
  currentUserName: string;
  currentUserFirstName: string;
  currentUserRole: AppUserRole;
  aiMessages: any[];
  setIsAppLibraryOpen: (open: boolean) => void;

  // Specialized props (remaining ones not yet in context)
  openMainAiForDocument: (doc: any) => void;
  openMainAiForWorkflow: (wf: any) => void;
  setSelectedDocument: (doc: any) => void;
  selectedDocument: any;
  setSelectedArtifact: (art: any) => void;
  selectedArtifact: ArtifactDetail | null;
  setSetupOptions: (opts: any) => void;
  maintenanceKpis: any;
  maintenanceAssets: any[];
  maintenanceWorkOrders: any[];
  productionImprovementData: any;
  workstationSignals: any[];
  workstationInsights: any[];

  // Handlers
  openWorkOrderHub: () => void;
  openMaintenanceRequestEntry: () => void;
  onEsoSaved: (payload: any) => void;
  onOpenWorkstations: (publishedWorkstation?: any) => void;
  openPredefinedWorkstation: (title: string, options?: { seedNcIssue?: boolean }) => void;
  onCreateBlankWorkstation: () => void;
  openWorkstationAppFromSubmenu: (appName: string) => void;
  openAlertsPreview: (event: React.MouseEvent<HTMLElement>) => void;
  tierMeetingCards: any[];

  // Remaining Shift/Workstation State
  orgChartDraft: any;
  activeWorkstationLayoutKey: string;
  isActiveWorkstationDraftEmpty: boolean;
  workstationCreateStreams: string[];
  lightHeaderIconButtonSx: object;
  homeViewMode: string;
  setHomeViewMode: (mode: string) => void;
  homeSiteScope: string;
  setHomeSiteScope: (scope: string) => void;
  handleStartNewChat: () => void;
  handleShareChat: (mode: 'copy' | 'team' | 'export') => void;
  chatShareNotice: string;
  setAiMessages: React.Dispatch<React.SetStateAction<any[]>>;
  openContextualAiAssistant: (payload: {
    contextTitle: string;
    contextSubtitle: string;
    problemFilter?: string;
    openingText: string;
    autoRunActionIndex?: number;
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
      }>;
      followUpActions?: Array<{
        label: string;
        category: string;
        searchTerm?: string;
        mode?: 'logbook' | 'workstation-maintenance-request' | 'execution-comment';
        description?: string;
        commentText?: string;
        stepId?: string;
      }>;
    }>;
  }) => void;
  homeChatInput: string;
  productionPlanningResetKey?: number;
  selectedHeaderHierarchyId: string;
  selectHeaderHierarchy: (nodeId: string) => void;
  openColumbusWestLogbook3D?: () => void;
  aiProblemFilter: string;
}

export const AppRoutes = React.memo((props: AppRoutesProps) => {
  const {
    currentScreen,
    activeTheme,
    setCurrentScreen,
    openSmartSearch,
    setIsDrawerOpen,
    setIsAiDrawerOpen,
    handleAiSend,
    currentUserName,
    currentUserFirstName,
    currentUserRole,
    aiMessages,
    setIsAppLibraryOpen,
  } = props;
  const {
    displayedActionTrackerKpis,
    filteredActionTrackerRows,
    actionTrackerBoardCategoryFilter,
    actionTrackerView,
    setActionTrackerView,
    setIsActionFilterModalOpen,
    setActionTrackerBoardCategoryFilter,
    openActionTrackerFromBoard,
    openActionTrackerDetails,
    openIntegratedActionCreateDrawer,
  } = useActionTrackerContext();
  const [sparePartsInitialEquipmentFilter, setSparePartsInitialEquipmentFilter] = React.useState<{ name: string; nonce: number } | null>(null);
  const openSparePartsWithEquipmentFilter = React.useCallback((equipmentName: string) => {
    setSparePartsInitialEquipmentFilter({ name: equipmentName, nonce: Date.now() });
    setCurrentScreen('tool_crib');
  }, [setCurrentScreen]);
  const homeChatHistoryEntries = aiMessages
    .filter((message) => message.role === 'user')
    .slice(-6)
    .reverse()
    .map((message, index) => ({
      label: message.text.length > 42 ? `${message.text.slice(0, 42).trim()}...` : message.text,
      meta: index === 0 ? 'Latest' : 'Recent',
      selected: index === 0,
    }));

  const openSafetyAiReport = () => {
    const reportLines = [
      'Safety report generated for the current Tier board.',
      '',
      'BLU.AI detected a rising safety risk on Line 3. Serious Injury is above target, Minor Injury remains elevated, and the latest calendar signal points to a guard-bypass pattern around Machine 12.',
      '',
      'Recommended focus: review the Line 3 guard interlock, verify operator coaching completion, and open a containment action before the next tier meeting.',
    ];
    const reportText = reportLines.join('\n');

    props.setAiMessages([
      {
        role: 'user',
        text: 'Generate a Safety AI report for the current Tier board.',
      },
      {
        role: 'assistant',
        text: reportText,
        variant: 'quick_actions',
        quickActions: [
          {
            label: 'Open Action Tracker',
            action: () => setCurrentScreen('action_tracker'),
          },
          {
            label: 'Open ESO Hub',
            action: () => setCurrentScreen('eso_hub'),
          },
          {
            label: 'Send by email',
            icon: <EmailOutlinedIcon fontSize="small" />,
            action: () => {
              const subject = encodeURIComponent('Safety AI report - current Tier board');
              const body = encodeURIComponent(reportText);
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            },
          },
        ],
      },
      {
        role: 'assistant',
        text: 'I can also turn this into a leadership-ready summary with owners, due dates, and escalation language.',
      },
    ]);
    setIsAiDrawerOpen(true);
  };

  const openSmartSearchAtlas = (context: string) => {
    const question = context.split(' Use the current Smart Search context')[0].trim();
    const normalizedQuestion = question.toLowerCase();
    const response = normalizedQuestion.includes('area a')
      ? 'Area A is the current focus because the latest connected signals converge there: work-order activity and shift entries increased around Line 10, while the next inspection window is still several days away. The practical next step is to validate the active work order and inspect the bearing condition before the risk window widens.'
      : normalizedQuestion.includes('work order')
        ? 'The Line 10 conveyor-bearing work order needs attention first. It has the strongest combination of recent activity, repeated log entries, and near-term operational exposure. I would confirm ownership, review the last vibration reading, and decide whether containment is needed during this shift.'
        : normalizedQuestion.includes('leadership')
          ? 'Leadership should monitor three things today: the Line 10 vibration trend, whether the priority work order receives an owner and response time, and whether the planned inspection is brought forward. Those signals will show whether the issue is stabilizing or moving toward an interruption.'
          : normalizedQuestion.includes('site performance')
            ? 'Columbus West remains broadly stable, but the current Area A signal deserves attention. Availability is still high while maintenance activity and related entries are rising, so the best move is to investigate early without treating the whole site as degraded.'
            : 'I connected the current hierarchy, work orders, shift entries, inspections, and performance signals. The strongest actionable pattern is concentrated in Area A around Line 10; I recommend reviewing the recent maintenance evidence first, then validating the inspection timing and owner.';

    props.openContextualAiAssistant({
      contextTitle: 'Smart Search · Columbus West',
      contextSubtitle: 'Live operational context from the current search',
      problemFilter: 'Smart Search · Area A / Line 10',
      openingText: 'I connected the current Smart Search scope to the operational signals behind this result.',
      autoRunActionIndex: 0,
      quickActions: [{
        label: question,
        prompt: question,
        response,
      }],
    });
  };

  return (
    <Suspense fallback={documentScreenFallback}>
      {(() => {
        switch (currentScreen) {
          case 'dashboard':
            return (
              <DashboardScreen
                setCurrentScreen={setCurrentScreen}
                openSmartSearch={openSmartSearch}
                setIsDrawerOpen={setIsDrawerOpen}
                setIsAiDrawerOpen={setIsAiDrawerOpen}
              />
            );

          case 'smart_search':
            return (
              <SmartSearchScreen
                activeTheme={activeTheme}
                currentUserName={currentUserName}
                setCurrentScreen={setCurrentScreen}
                openSmartSearchChat={openSmartSearchAtlas}
              />
            );

          case 'ai_home':
            return (
              <AiHomeScreen
                currentUserFirstName={currentUserFirstName}
                aiMessages={aiMessages}
                handleAiSend={handleAiSend}
                setCurrentScreen={setCurrentScreen}
              />
            );
          
          case 'ai_assistant':
            return (
              <MyAiAssistantExpandedScreen
                themeMode="light"
                homeViewMode={props.homeViewMode}
                homeChatScrollRef={{ current: null }}
                aiMessages={aiMessages}
                currentUserInitials={currentUserName.split(' ').map(n => n[0]).join('').toUpperCase()}
                currentUserFirstName={props.currentUserFirstName}
                currentUserRole={currentUserRole}
                homeDirectorNewsCards={[]}
                urgentAiTasks={[]}
                homeChatShowMore={false}
                activeHomePriorityCard={null}
                homeAssistantTypingVisible={false}
                homeChatInput={props.homeChatInput || ''}
                chatFolders={['Main', 'Projects', 'Archives']}
                homeChatHistoryEntries={homeChatHistoryEntries}
                chatShareNotice={props.chatShareNotice || ''}
                onThemeModeToggle={() => {}}
                onSetHomeChatShowMore={() => {}}
                onSetHomeChatInput={() => {}}
                onHandleAiSend={handleAiSend}
                onClearHomeChatAutomation={() => {}}
                onSetHomeAssistantTypingVisible={() => {}}
                onSetCurrentScreen={setCurrentScreen}
                onClearSiteContext={() => {}}
                onOpenQualityAlert={() => {}}
                onSelectSiteContext={() => {}}
                onStartNewChat={props.handleStartNewChat}
                onShareChat={props.handleShareChat}
                onSetAiMessages={props.setAiMessages}
                onOpenPredefinedWorkstation={props.openPredefinedWorkstation}
              />
            );

          case 'maintenance_hub':
          case 'maintenance_planner':
            return (
              <MaintenancePlannerPage onOpenMaintenancePlan={() => setCurrentScreen('maintenance_plan')} />
            );
          
          case 'maintenance_plan':
            return (
              <MaintenancePlan onNavigateToPlanner={() => setCurrentScreen('maintenance_planner')} />
            );
          
          case 'maintenance_my_team':
            return (
              <MaintenanceMyTeamPage />
            );

          case 'maintenance_calendar':
            return (
              <MaintenancePlannerPage initialMode="calendar" view="calendarOnly" onOpenMaintenancePlan={() => setCurrentScreen('maintenance_plan')} />
            );

          case 'maintenance_followup':
            return (
              <MaintenanceFollowUpBoardPage />
            );

          case 'tool_crib':
            return (
              <SparePartsManagementPage
                initialEquipmentFilterName={sparePartsInitialEquipmentFilter?.name}
                initialEquipmentFilterNonce={sparePartsInitialEquipmentFilter?.nonce}
                onInitialEquipmentFilterApplied={() => setSparePartsInitialEquipmentFilter(null)}
              />
            );

          case 'equipment_ledger':
            return (
              <EquipmentLedgerPage />
            );

          case 'asset_explorer':
            return (
              <AssetExplorerScreen setCurrentScreen={setCurrentScreen} />
            );

          case 'ot_asset_type_wizard':
            return (
              <OtAssetTypeWizardScreen setCurrentScreen={setCurrentScreen} />
            );

          case 'maintenance_request_log':
            return (
              <MaintenanceRequestLogPage />
            );

          case 'maintenance_cbm_pdm':
            return (
              <MaintenanceCbmPdmPage onOpenMaintenanceRequestEntry={props.openMaintenanceRequestEntry} />
            );

          case 'maintenance_performance':
            return (
              <MaintenancePerformancePage />
            );

          case 'logistics_mobile_ops':
            return <LogisticsMobileOpsPage />;

          case 'logistics_control_tower':
            return <LogisticsControlTowerPage />;

          case 'receiving_control_tower':
            // Receiving is merged into Logistics Control Tower (L2 inbound layer).
            return <LogisticsControlTowerPage />;

          case 'quality_release':
            return <QualityReleasePage />;

          case 'shipment_readiness':
            return <ShipmentReadinessPage />;

          case 'sterilization_tracker':
            return <SterilizationTrackerPage />;

          case 'external_transfer_portal':
            return <ExternalTransferPortalPage />;

          case 'guided_tasks':
            return <GuidedTasksPage />;

          case 'job_readiness':
            return <JobReadinessPage />;

          case 'production_alerts':
            return <ProductionAlertsPage />;

          case 'machine_status':
            return <MachineStatusPage />;

          case 'wip_control_tower':
            return <WipControlTowerPage />;

          case 'sterilization_outbound_control_tower':
            return <SterilizationOutboundControlTowerPage />;

          case 'pallet_verification':
            return <PalletVerificationPage />;

          case 'work_order_hub':
            return (
              <WorkOrderHubScreen
                onAskAi={() => props.setIsAiDrawerOpen(true)}
                onOpenOperations={() => setCurrentScreen('document_management')}
                onOpenActionTracker={() => setCurrentScreen('action_tracker')}
              />
            );

          case 'action_tracker':
            return (
              <ActionTrackerScreen
                activePrimary={activeTheme.primary}
                lightHeaderIconButtonSx={props.lightHeaderIconButtonSx}
                setAiMessages={props.setAiMessages}
                aiProblemFilter={props.aiProblemFilter}
              />
            );

          case 'shift_logbook':
            return (
              <ShiftLogbookScreen
                activeTheme={activeTheme}
                onOpenDocumentManagement={() => setCurrentScreen('document_management')}
                onOpenSparePartsManagement={openSparePartsWithEquipmentFilter}
                onOpenAiAssistant={props.openContextualAiAssistant}
                selectedHeaderHierarchyId={props.selectedHeaderHierarchyId}
              />
            );
          case 'tier_meeting':
            return (
              <TierMeetingBoard
                actionRows={filteredActionTrackerRows}
                actionTrackerKpis={displayedActionTrackerKpis}
                actionTrackerBoardCategoryFilter={actionTrackerBoardCategoryFilter}
                actionTrackerRows={filteredActionTrackerRows}
                actionTrackerView={actionTrackerView}
                lightHeaderIconButtonSx={props.lightHeaderIconButtonSx}
                onActionTrackerViewChange={setActionTrackerView}
                onClearActionTrackerBoardCategoryFilter={() => setActionTrackerBoardCategoryFilter('')}
                onOpenActionCreateDrawer={() => openIntegratedActionCreateDrawer({
                  source: 'Tier',
                  tierLevel: 'Tier 1',
                  meetingDate: new Date().toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  }),
                  originRecordId: 'tier-board',
                  originRecordLabel: 'Tier Board',
                  originScreen: 'tier_meeting',
                })}
                onOpenActionFilters={() => setIsActionFilterModalOpen(true)}
                onOpenActionTracker={openActionTrackerFromBoard}
                onOpenActionDetails={openActionTrackerDetails}
                onOpenDocumentOperations={() => setCurrentScreen('document_operations')}
                onStartMeeting={() => {}}
              />
            );

          case 'tier_overview':
            return (
              <TierOverviewScreen
                tierMeetingCards={props.tierMeetingCards}
              />
            );

          case 'global_view':
            return (
              <GlobalViewScreen
                selectHeaderHierarchy={props.selectHeaderHierarchy}
                setCurrentScreen={setCurrentScreen}
                onOpenColumbusLogbook3D={props.openColumbusWestLogbook3D}
              />
            );

          case 'control_tower':
            return (
              <ControlTowerScreen
                onOpenAiAssistant={() => props.setIsAiDrawerOpen(true)}
                onOpenAppLibrary={() => props.setIsAppLibraryOpen(true)}
                onOpenSmartSearch={props.openSmartSearch}
              />
            );

          case 'my_workstation':
          case 'workstation':
            return (
              <WorkstationScreen
                currentUserName={currentUserName}
                layoutStorageKey={props.activeWorkstationLayoutKey}
                startEmpty={props.isActiveWorkstationDraftEmpty}
                workstationCreateStreams={props.workstationCreateStreams}
                personalMode={currentScreen === 'my_workstation'}
                onAskAi={() => setIsAiDrawerOpen(true)}
                onOpenActionTracker={() => setCurrentScreen('action_tracker')}
                onOpenSafetyAiReport={openSafetyAiReport}
                onOpenLineLog={() => setCurrentScreen('shift_logbook')}
                onOpenAiAssistant={props.openContextualAiAssistant}
                onOpenMaintenance={(target) => {
                  if (target === 'followup') {
                    setCurrentScreen('maintenance_followup');
                    return;
                  }
                  if (target === 'calendar') {
                    setCurrentScreen('maintenance_calendar');
                    return;
                  }
                  if (target === 'planner') {
                    setCurrentScreen('maintenance_planner');
                    return;
                  }
                  if (target === 'equipment-ledger') {
                    setCurrentScreen('equipment_ledger');
                    return;
                  }
                  if (target === 'cbm-pdm') {
                    setCurrentScreen('maintenance_cbm_pdm');
                    return;
                  }
                  if (target === 'performance') {
                    setCurrentScreen('maintenance_performance');
                    return;
                  }
                  if (target === 'spareParts') {
                    setCurrentScreen('tool_crib');
                    return;
                  }
                  setCurrentScreen('maintenance_hub');
                }}
                onOpenTierMeeting={() => setCurrentScreen('tier_meeting')}
                onEsoSaved={props.onEsoSaved}
                onOpenWorkstations={props.onOpenWorkstations}
                selectedHeaderHierarchyId={props.selectedHeaderHierarchyId}
              />
            );

          case 'workstations':
            return (
              <WorkstationsLibraryScreen
                onCreateNew={props.onCreateBlankWorkstation}
                onOpenWorkstation={props.onOpenWorkstations}
                onOpenPredefined={props.openPredefinedWorkstation}
                onOpenApp={props.openWorkstationAppFromSubmenu}
              />
            );

          case 'notification_dashboard':
            return (
              <NotificationDashboard />
            );

          case 'production_planning':
            return (
              <ProductionPlanningScreen key={props.productionPlanningResetKey} />
            );

          // Document Management Screens
          case 'document_management':
          case 'artifact_detail':
          case 'document_search_hierarchy':
          case 'approval_dashboard':
          case 'review_flow':
          case 'version_history':
          case 'audit_trail':
          case 'compliance':
          case 'advanced_search':
          case 'workflow_engine':
          case 'document_operations':
          case 'ai_hub':
          case 'esignature':
          case 'template_selection':
            return (
              <>
                {currentScreen === 'document_management' && (
                  <DocumentManagementScreen
                    onBack={() => setCurrentScreen('dashboard')}
                    initialWorkspace="Inbox"
                    onCreateNewFileClick={() => setCurrentScreen('template_selection')}
                    onApprovePriorityClick={() => setCurrentScreen('approval_dashboard')}
                    onOpenMainAiForDocument={props.openMainAiForDocument}
                    onStartWorkflowWithAi={props.openMainAiForWorkflow}
                    onVersionHistoryClick={(doc: any) => {
                      props.setSelectedDocument({ name: doc.name, id: `DOC-${doc.id}` });
                      setCurrentScreen('version_history');
                    }}
                    onAuditTrailClick={() => setCurrentScreen('audit_trail')}
                    onComplianceClick={() => setCurrentScreen('compliance')}
                    onOperationsClick={() => setCurrentScreen('document_operations')}
                    onAIHubClick={() => setCurrentScreen('ai_hub')}
                    onOpenArtifactClick={(artifact: any) => {
                      props.setSelectedArtifact({
                        id: `ART-${artifact.id}`,
                        name: artifact.name,
                        type: artifact.type,
                        status: artifact.status,
                        version: artifact.version,
                        owner: artifact.owner,
                        approver: artifact.approver,
                        modified: artifact.modified,
                        modifiedBy: artifact.modifiedBy,
                        reviewDate: artifact.reviewDate,
                        site: artifact.site,
                        line: artifact.line,
                        asset: artifact.asset,
                      });
                      setCurrentScreen('artifact_detail');
                    }}
                  />
                )}
                {currentScreen === 'artifact_detail' && (
                  <DocumentArtifactDetailScreen
                    artifact={props.selectedArtifact}
                    onBack={() => setCurrentScreen('document_management')}
                  />
                )}
                {currentScreen === 'document_search_hierarchy' && (
                  <DocumentSearchExplorerScreen
                    onBack={() => setCurrentScreen('document_management')}
                    onCreateNewFileClick={() => setCurrentScreen('template_selection')}
                  />
                )}
                {currentScreen === 'approval_dashboard' && (
                  <DocumentRevisionApprovalScreen
                    onBack={() => setCurrentScreen('document_management')}
                    onReviewClick={() => setCurrentScreen('review_flow')}
                    onViewFile={() => setCurrentScreen('review_flow')}
                  />
                )}
                {currentScreen === 'review_flow' && (
                  <DocumentReviewFlowScreen
                    onBack={() => setCurrentScreen('approval_dashboard')}
                  />
                )}
                {currentScreen === 'version_history' && (
                  <DocumentVersionHistoryScreen
                    onBack={() => setCurrentScreen('document_management')}
                    documentName={props.selectedDocument?.name}
                    documentId={props.selectedDocument?.id}
                    onSignClick={() => setCurrentScreen('esignature')}
                  />
                )}
                {currentScreen === 'audit_trail' && (
                  <DocumentAuditTrailScreen
                    onBack={() => setCurrentScreen('document_management')}
                  />
                )}
                {currentScreen === 'compliance' && (
                  <DocumentComplianceDashboard
                    onBack={() => setCurrentScreen('document_management')}
                    onAuditTrailClick={() => setCurrentScreen('audit_trail')}
                  />
                )}
                {currentScreen === 'advanced_search' && (
                  <DocumentAdvancedSearchScreen
                    onBack={() => setCurrentScreen('document_management')}
                  />
                )}
                {currentScreen === 'workflow_engine' && (
                  <DocumentManagementScreen
                    onBack={() => setCurrentScreen('document_management')}
                    initialWorkspace="WorkflowPlanner"
                    onCreateNewFileClick={() => setCurrentScreen('template_selection')}
                    onApprovePriorityClick={() => setCurrentScreen('approval_dashboard')}
                    onOpenMainAiForDocument={props.openMainAiForDocument}
                    onStartWorkflowWithAi={props.openMainAiForWorkflow}
                    onVersionHistoryClick={(doc: any) => {
                      props.setSelectedDocument({ name: doc.name, id: `DOC-${doc.id}` });
                      setCurrentScreen('version_history');
                    }}
                    onAuditTrailClick={() => setCurrentScreen('audit_trail')}
                    onComplianceClick={() => setCurrentScreen('compliance')}
                    onOperationsClick={() => setCurrentScreen('document_operations')}
                    onAIHubClick={() => setCurrentScreen('ai_hub')}
                    onOpenArtifactClick={(artifact: any) => {
                      props.setSelectedArtifact({
                        id: `ART-${artifact.id}`,
                        name: artifact.name,
                        type: artifact.type,
                        status: artifact.status,
                        version: artifact.version,
                        owner: artifact.owner,
                        approver: artifact.approver,
                        modified: artifact.modified,
                        modifiedBy: artifact.modifiedBy,
                        reviewDate: artifact.reviewDate,
                        site: artifact.site,
                        line: artifact.line,
                        asset: artifact.asset,
                      });
                      setCurrentScreen('artifact_detail');
                    }}
                  />
                )}
                {currentScreen === 'document_operations' && (
                  <DocumentOperationsDashboard
                    onBack={() => setCurrentScreen('document_management')}
                  />
                )}
                {currentScreen === 'ai_hub' && (
                  <DocumentAIHubScreen
                    onBack={() => setCurrentScreen('document_management')}
                  />
                )}
                {currentScreen === 'esignature' && (
                  <DocumentESignatureScreen
                    onBack={() => setCurrentScreen('version_history')}
                    documentName={props.selectedDocument?.name}
                    documentId={props.selectedDocument?.id}
                  />
                )}
                {currentScreen === 'template_selection' && (
                  <DocumentTemplateSelectionScreen
                    onBack={() => setCurrentScreen('document_management')}
                    onNavigateToSetup={(prefill: any) => {
                      props.setSetupOptions(prefill);
                      setCurrentScreen('approval_dashboard');
                    }}
                  />
                )}
              </>
            );

          case 'eso_hub':
            return (
              <EsoHubScreen
                onOpenDashboard={() => {}}
                onOpenEntry={() => {}}
                selectedHeaderHierarchyId={props.selectedHeaderHierarchyId}
              />
            );

          case 'line_performance':
            return <LinePerformanceScreen />;

          case 'cilt_kpis':
            return <CiltKpisScreen />;
          case 'cil_kpis':
            return <CiltKpisScreen discipline="CIL" />;
          case 'centerline_kpis':
            return <CiltKpisScreen discipline="Centerline" />;

          case 'equipment_changeover':
            return <EquipmentChangeoverScreen />;

          case 'manage_tasks':
            return <ManageTasksScreen />;

          case 'equipment_changeover_operator':
            return (
              <EquipmentChangeoverOperatorPage />
            );

          case 'cil_operator':
            return (
              <CilCenterLineOperatorPage discipline="CIL" />
            );

          case 'centerline_operator':
            return (
              <CilCenterLineOperatorPage discipline="Centerline" />
            );

          case 'cil_centerline_operator':
            return (
              <CilCenterLineOperatorPage />
            );

          case 'shift_schedule_overview':
            return (
              <ShiftScheduleScreen initialViewMode="crewPatternOverview" />
            );

          case 'shift_schedule':
            return (
              <ShiftScheduleScreen initialViewMode="crewPatternOverview" />
            );

          case 'shift_schedule_summary':
            return (
              <ShiftScheduleScreen />
            );
          case 'shift_schedule_settings':
            return (
              <ShiftPlannerScreen />
            );

          case 'shift_schedule_operator':
            return (
              <ShiftScheduleOperatorPage />
            );

          case 'team_management':
            return (
              <ShiftTeamManagementScreen />
            );

          case 'site_organogram':
            return (
              <ShiftSiteOrganogramScreen
                orgChartDraft={props.orgChartDraft}
              />
            );

          case 'all_workstations':
            return <AllWorkstationsPage />;

          default:
            return <UnderConstructionScreen title={currentScreen} activeTheme={activeTheme} />;
        }
      })()}
    </Suspense>
  );
});
