import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { Box, Button, Chip, Divider, IconButton, LinearProgress, Paper, TextField, Typography } from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome as AutoAwesomeIcon,
  OpenInFull as OpenInFullIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  DeleteOutline as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  DashboardCustomize as CustomizeIcon,
  EditOutlined as EditIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ShareOutlined as ShareIcon,
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';
// @ts-ignore
import { Responsive as ResponsiveGridLayoutBase } from 'react-grid-layout/legacy';
import { createStableWidthProvider, type WidthProviderComponentProps } from './stableWidthProvider';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import type {
  WorkstationDashboardData,
  WorkstationLayoutBreakpoint,
  WorkstationLayoutItem,
  WorkstationResponsiveLayouts,
  WorkstationSelectedItemType,
  PersonalWorkstationDashboardProps,
  PersonalWorkstationState,
  CustomCreatedWidget,
  WorkstationWidgetPreferences,
  CustomWidgetDataset,
  CustomWidgetEditSection,
  CustomWidgetEditTranscriptItem,
  PersonalWidgetDomain,
} from '../types';
import { useWorkstationDetailState } from '../hooks/useWorkstationDetailState';
import { useWorkstationLayout } from '../hooks/useWorkstationLayout';
import WorkstationCycleTimeTargetWidget from './WorkstationCycleTimeTargetWidget';
import WorkstationHourlyOutputWidget from './WorkstationHourlyOutputWidget';
import WorkstationKpiTrendCard from './WorkstationKpiTrendCard';
import WorkstationRankedMetricWidget from './WorkstationRankedMetricWidget';
import WorkstationSelectedItemDetailsWidget from './WorkstationSelectedItemDetailsWidget';
import WorkstationSeriesBarWidget from './WorkstationSeriesBarWidget';
import WorkstationSeriesLineWidget from './WorkstationSeriesLineWidget';
import WorkstationTopDowntimeCausesWidget from './WorkstationTopDowntimeCausesWidget';
import WorkstationAutoChartArea from './WorkstationAutoChartArea';
import MyActionTrackerWidget, { type ActionTrackerViewMode } from './MyActionTrackerWidget';
import MyDowntimeWidget from './MyDowntimeWidget';
import MyDowntimeAnalysisModal from './MyDowntimeAnalysisModal';
import MyEsoExpanded from './MyEsoExpanded';
import MyEsosWidget from './MyEsosWidget';
import MyEsoWidget from './MyEsoWidget';
import MyHourlyScrapWidget from './MyHourlyScrapWidget';
import MyMachineUtilizationExpanded from './MyMachineUtilizationExpanded';
import MyMachineUtilizationWidget from './MyMachineUtilizationWidget';
import MyProductionPlanningExpanded from './MyProductionPlanningExpanded';
import MyProductionPlanningWidget from './MyProductionPlanningWidget';
import MyQualityWidget from './MyQualityWidget';
import MyQualityExpanded from './MyQualityExpanded';
import MySafetyWidget from './MySafetyWidget';
import MySafetyExpanded from './MySafetyExpanded';
import MySeriousInjuryModal from './MySeriousInjuryModal';
import MyScrapWidget from './MyScrapWidget';
import MyShiftOeeExpanded from './MyShiftOeeExpanded';
import MyShiftOeeWidget from './MyShiftOeeWidget';
import MyShiftScheduleWidget from './MyShiftScheduleWidget';
import ShiftScheduleLeaderWidget from './ShiftScheduleLeaderWidget';
import MyShiftProductionWidget from './MyShiftProductionWidget';
import MyTasksWidget, {
  MY_TASKS_START_TASK_EVENT,
  TaskAssistDialog,
  consolidatedTasks,
  type ConsolidatedTask,
} from './MyTasksWidget';
import MyTierManagementWidget from './MyTierManagementWidget';
import MyTopLossesWidget from './MyTopLossesWidget';
import MyThreePTrackingWidget from './MyThreePTrackingWidget';
import MyLossFocusedKpisPage from './MyLossFocusedKpisPage';
import MyLossFocusedKpisWidget from './MyLossFocusedKpisWidget';
import MyZonePerformanceWidget from './MyZonePerformanceWidget';
import WidgetShell from './WidgetShell';
import MyCommunicationWidget from './MyCommunicationWidget';
import MyCostWidget from './MyCostWidget';
import MyCostExpanded from './MyCostExpanded';
import MyDeliveryWidget from './MyDeliveryWidget';
import MyDeliveryExpanded from './MyDeliveryExpanded';
import MyProductionDeliveryModal from './MyProductionDeliveryModal';
import MyPeopleWidget from './MyPeopleWidget';
import MyPeopleExpanded from './MyPeopleExpanded';
import MyRecognitionWidget from './MyRecognitionWidget';
import MyActivitiesKpisWidget from './MyActivitiesKpisWidget';
import MyQuickActionsWidget from './MyQuickActionsWidget';
import MyCiltCenterlineExpanded from './MyCiltCenterlineExpanded';
import MyEquipmentChangeoverExpanded from './MyEquipmentChangeoverExpanded';
import WorkstationCilCenterlineWidget from './WorkstationCilCenterlineWidget';
import WorkstationEquipmentChangeoverWidget from './WorkstationEquipmentChangeoverWidget';
import WidgetWorkOrders from './WidgetWorkOrders';
import {
  InboundSlaWidget,
  ActiveLoadsTimelineWidget,
  LineShortageRiskWidget,
  SpaceXShippingGatingWidget,
  PrioritizedDecisionQueue,
  SpaceXShippingGatingConsole,
  SterilizationLoadsTimelineWidget,
  InboundSlaChartWidget,
  AtlasAiPrescriptivePanel,
} from '../../logistics/widgets';
import MyMaintenanceBacklogWidget from './MyMaintenanceBacklogWidget';
import MaintenanceHubWidget from './MaintenanceHubWidget';
import MaintenancePlannerWidget from './MaintenancePlannerWidget';
import MaintenanceCalendarWidget from './MaintenanceCalendarWidget';
import EquipmentStatusWidget from './EquipmentStatusWidget';
import MaintenanceAnalyticsWidget from './MaintenanceAnalyticsWidget';
import MoldingWidget from './MoldingWidget';
import MaintenanceCbmPdmWidget from './MaintenanceCbmPdmWidget';
import SparePartsMonitorWidget from './SparePartsMonitorWidget';
import ShiftLogBookWidget from './ShiftLogBookWidget';
import TierKpiCustomizeDialog from './TierKpiCustomizeDialog';
import OEEMonitoringWidget from './OEEMonitoringWidget';
import Workstation3DViewComponent from './Workstation3DViewComponent';
import WorkstationLineStatusOverviewWidget from './WorkstationLineStatusOverviewWidget';
import WorkstationSqdcOperatorWidget from './WorkstationSqdcOperatorWidget';
import OEELineOverviewWidget from './OEELineOverviewWidget';
import OEETopLossesWidget from './OEETopLossesWidget';
import TextBoxWidget, {defaultTextBoxPreferences} from './TextBoxWidget';
import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone, workstationTierInsetCardSx, workstationTierChartSx } from '../theme';
import { lossFocusedDefaultMetricIds, lossFocusedMetricCatalogOrder, type LossFocusedMetricId } from './lossFocusedKpisData';
import {
  readWorkstationWidgetPreferences,
  writeWorkstationWidgetPreferences,
  personalLayoutSchemaVersion,
  sanitizePersonalState,
  getInitialPersonalWorkstationState,
  sanitizePersonalWidgetIds,
  createPersonalLayoutItem,
  sanitizePersonalLayoutItems,
  sanitizeCustomCreatedWidgets,
  sanitizeLossFocusedMetricIds,
  sanitizeAddedCustomWidgetIds,
} from '../workstationViewState';
import {
  workstationBreakpoints,
  workstationCols,
  workstationBreakpointKeys,
  personalWidgetDefinitions,
  personalWidgetMap,
  personalWidgetIds,
  personalWidgetCategories,
  personalWidgetDomains,
  defaultPersonalVisibleWidgetIds,
  personalWidgetDomainMap,
  personalWidgetAccentMap,
  workstationAssistantSuggestions,
  customWidgetDatasets,
  customWidgetMetricOptions,
  customWidgetVisualizations,
  customWidgetFilters,
  customWidgetShareSuggestions,
  customWidgetEditSections,
  getPriorityTone,
  getEscalationIcon,
  shellLessWidgetIds,
  isTextBoxWidgetInstanceId,
  textBoxWidgetTemplateId,
  type PersonalWidgetId,
} from '../workstationConstants';
import { useWorkstationContext } from '../contexts/WorkstationContext';
import { useActionTrackerContext } from '../../actionTracker/contexts/ActionTrackerContext';
import { getWorkstationTourTarget } from '../onboarding/operatorWorkstationOnboarding';

const ResponsiveGridLayout = createStableWidthProvider(
  ResponsiveGridLayoutBase as unknown as ComponentType<WidthProviderComponentProps & Record<string, unknown>>,
);
const personalGridMargin: [number, number] = [12, 12];
const personalGridPadding: [number, number] = [0, 0];

type TierKpiDomain = 'Safety' | 'Quality' | 'Delivery' | 'Cost' | 'People';

type CilCenterlineLauncherRequest = {
  mode: 'CIL' | 'CL';
  taskId?: string;
  nonce: number;
};

type ChangeoverLauncherRequest = {
  changeoverId?: string;
  nonce: number;
};

const lineStatusCilActivityTask: ConsolidatedTask = {
  id: 'cil-line-status-z2',
  kind: 'cil',
  code: 'CIL',
  title: 'CIL: Zone 2 Tipper Unit',
  role: 'CIL Operator',
  date: 'May 12, 2026',
  time: '11:00 AM',
  area: 'Zone 2',
  equipment: 'Z2 Tipper Unit',
  reminderEquipment: 'Flashlight, inspection mirror',
  reminderTools: 'Clamp plier, 6mm Allen key',
  status: 'pending',
};

const tierKpiOptions: Record<TierKpiDomain, string[]> = {
  Safety: ['Fatality', 'Serious Injury', 'Minor Injury', 'Near Misses', 'Unsafe Act', 'Submitted ESO', 'ESOs', 'Incidents', 'Gemba Walks Deviations'],
  Quality: ['Field Actions', 'Complaints', 'NCs', 'CAPAs', 'Downtime related to Quality Issues', 'Quality Issues', 'Gemba Walks Deviations'],
  Delivery: ['Monthly Target', 'MTD Actual', 'Daily Actual', 'Changeover Tracking', 'Start-up Tracking', 'Production Output', 'OEE', 'Gemba Walks Deviations', 'Weekly Production Planning'],
  Cost: ['Variance to Scrap Reduction Target', 'Total Spendings', 'Total Scrap Cost', 'Total Downtime Cost', 'Scrap', 'Downtime', 'Gemba Walks Deviations'],
  People: ['Absenteism', 'Training', 'Overtime', 'Absense', 'Recognitions', 'Overtime Hours', 'Gemba Walks Deviations'],
};

function formatCompact(value: number) {
  return Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

function getSelectedItemTypeFromEntity(entity: string): WorkstationSelectedItemType | null {
  const normalizedEntity = entity.toLowerCase();
  if (normalizedEntity === 'work order') return 'work-order';
  if (normalizedEntity === 'sku') return 'sku';
  if (normalizedEntity === 'batch') return 'batch';
  if (normalizedEntity === 'lot') return 'lot';
  return null;
}

function getPersonalWidgetDomain(widgetId: PersonalWidgetId): Exclude<PersonalWidgetDomain, 'All'> {
  const domain = personalWidgetCategories.find((category) => personalWidgetDomainMap[category].includes(widgetId));
  return domain ?? 'Production';
}

function getPersonalWidgetTags(widgetId: PersonalWidgetId) {
  const domain = getPersonalWidgetDomain(widgetId);
  const widget = personalWidgetMap[widgetId];
  if ('tags' in widget && Array.isArray(widget.tags)) return widget.tags;
  if (widgetId === 'my-maintenance-backlog') return ['maintenance', 'backlog', 'requests', 'work orders', 'planning'];
  if (widgetId === 'quick-actions') return ['shortcuts', 'shift entry', 'actions', 'maintenance', 'eso', 'tasks'];
  if (widgetId === 'maintenance-hub') return ['maintenance', 'hub', 'breakdowns', 'work orders', 'PMs'];
  if (widgetId === 'spare-parts-monitor') return ['spare parts', 'inventory', 'maintenance', 'materials'];
  const baseTags = [domain.toLowerCase(), widget.category.toLowerCase()];
  if (domain === 'Production') return [...baseTags, 'shopfloor', 'mes', 'shift', 'production'];
  if (domain === 'Quality') return [...baseTags, 'quality', 'scrap', 'capa'];
  if (domain === 'Safety') return [...baseTags, 'safety', 'sheq', 'incident'];
  if (domain === 'People') return [...baseTags, 'people', 'recognition', 'communication', 'absence', 'shift'];
  if (domain === 'Cost') return [...baseTags, 'cost', 'scrap', 'downtime', 'loss'];
  if (domain === 'OEE') return [...baseTags, 'oee', 'performance', 'downtime'];
  if (domain === 'Maintenance') return [...baseTags, 'maintenance', 'workorder', 'breakdown', 'request'];
  return [...baseTags, 'actions', 'tier', 'escalation'];
}

function AssistantTypingBubble({
  align = 'flex-start',
  label,
}: {
  align?: 'flex-start' | 'flex-end';
  label: string;
}) {
  const isUser = align === 'flex-end';

  return (
    <Box
      sx={{
        alignSelf: align,
        maxWidth: '80%',
        px: 1.4,
        py: 1.05,
        borderRadius: 2.2,
        bgcolor: isUser ? '#0B63E5' : '#FFFFFF',
        border: isUser ? 'none' : '1px solid #E2E8F0',
        boxShadow: isUser ? '0 8px 20px rgba(37, 99, 235, 0.18)' : '0 8px 20px rgba(15, 23, 42, 0.06)',
      }}
    >
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: isUser ? 800 : 900,
          color: isUser ? 'rgba(255,255,255,0.78)' : '#044ED7',
          mb: 0.35,
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: 'flex', gap: 0.45, height: 18, alignItems: 'center' }}>
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              bgcolor: isUser ? '#FFFFFF' : '#0B63E5',
            }}
          />
        ))}
      </Box>
    </Box>
  );
}




function isWorkstationBreakpoint(value: string): value is WorkstationLayoutBreakpoint {
  return workstationBreakpointKeys.includes(value as WorkstationLayoutBreakpoint);
}

function WidgetEditToolbar({
  dragHandleClass,
  onHide,
}: {
  dragHandleClass: string;
  onHide: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 0.45,
        px: 0.35,
        pb: 0.6,
        flexShrink: 0,
      }}
    >
      <Box
        className={dragHandleClass}
        sx={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 2,
          border: `1px solid ${workstationVisuals.tierBorder}`,
          color: workstationVisuals.tierTextMeta,
          bgcolor: 'rgba(255,255,255,0.94)',
          cursor: 'grab',
          boxShadow: workstationVisuals.tierShadow,
          '&:active': { cursor: 'grabbing' },
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <Button
        onClick={onHide}
        sx={{
          minWidth: 32,
          width: 32,
          height: 32,
          p: 0,
          borderRadius: 2,
          border: '1px solid #FECACA',
          color: '#DC2626',
          bgcolor: 'rgba(255,255,255,0.94)',
          boxShadow: workstationVisuals.tierShadow,
        }}
      >
        X
      </Button>
    </Box>
  );
}

function TierManualEditFrame({
  children,
  enabled,
  onEdit,
  widgetId,
}: {
  children: ReactNode;
  enabled: boolean;
  onEdit?: (widgetId: string) => void;
  widgetId: string;
}) {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        minHeight: 0,
        borderRadius: 1.6,
        boxShadow: enabled ? `inset 0 0 0 1px ${tokenBrand.lighter}` : 'none',
        transition: 'box-shadow 160ms ease',
      }}
    >
      {children}
      {enabled ? (
        <IconButton
          aria-label={`Edit ${widgetId}`}
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.(widgetId);
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 5,
            width: 28,
            height: 28,
            bgcolor: tokenCommon.white,
            border: `2px solid ${tokenBrand.main}`,
            color: tokenBrand.main,
            boxShadow: '0 8px 18px rgba(4, 78, 215, 0.18)',
            '&:hover': {
              bgcolor: tokenBrand.softBg,
            },
          }}
        >
          <EditIcon sx={{fontSize: 15}} />
        </IconButton>
      ) : null}
    </Box>
  );
}

function normalizeGridLayout(layout: unknown): WorkstationLayoutItem[] {
  if (!Array.isArray(layout)) return [];

  return layout
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && typeof item.i === 'string')
    .map((item) => ({
      i: item.i as string,
      x: typeof item.x === 'number' ? item.x : 0,
      y: typeof item.y === 'number' ? item.y : 0,
      w: typeof item.w === 'number' ? item.w : 1,
      h: typeof item.h === 'number' ? item.h : 1,
      minW: typeof item.minW === 'number' ? item.minW : undefined,
      minH: typeof item.minH === 'number' ? item.minH : undefined,
      maxW: typeof item.maxW === 'number' ? item.maxW : undefined,
      maxH: typeof item.maxH === 'number' ? item.maxH : undefined,
    }));
}

export function PersonalWorkstationDashboard({
  data,
  layoutStorageKey = 'workstation-dashboard-layout-v16',
  initialSnapshot,
  chartFilters,
  hideDeliveryCurrentOrderCard,
  useTierSqdcCarousel,
  tierOverviewLabel,
  tierOverviewItemPrefix,
  tier1SeriousInjuryIncidentActive,
  currentUserName,
  startEmpty = false,
  isEditMode: isEditModeProp,
  setIsEditMode: setIsEditModeProp,
  tierBoardManualEditMode = false,
  onEditTierWidget,
  tierBoardCostData,
  onOpenActionTracker,
  onOpenSafetyAiReport,
  onOpenLineLog,
  onOpenMaintenance,
  onOpenAiAssistant,
  onOpenContextualization,
  onOpenEsoEntry,
  selectedHeaderHierarchyId,
  onPublish,
  onOpenTierMeeting,
  meetingTopics = [],
}: PersonalWorkstationDashboardProps) {
  const [isEditModeInternal, setIsEditModeInternal] = useState(false);
  const isEditMode = isEditModeProp ?? isEditModeInternal;
  const setIsEditMode = setIsEditModeProp ?? setIsEditModeInternal;
  const [isAddWidgetPanelOpen, setIsAddWidgetPanelOpen] = useState(false);
  const [isWidgetAssistantCardVisible, setIsWidgetAssistantCardVisible] = useState(true);
  const [isWidgetAssistantOpen, setIsWidgetAssistantOpen] = useState(false);
  const [widgetAssistantStep, setWidgetAssistantStep] = useState(0);
  const [widgetAssistantMode, setWidgetAssistantMode] = useState<'layout' | 'create' | 'edit' | 'share'>('layout');
  const [customWidgetDataset, setCustomWidgetDataset] = useState<CustomWidgetDataset | null>(null);
  const [customWidgetMetrics, setCustomWidgetMetrics] = useState<string[]>([]);
  const [customWidgetVisualization, setCustomWidgetVisualization] = useState<string | null>(null);
  const [customWidgetFiltersSelected, setCustomWidgetFiltersSelected] = useState<string[]>([]);
  const [isCustomWidgetCreated, setIsCustomWidgetCreated] = useState(false);
  const personalStorageKey = layoutStorageKey;
  const [personalState, setPersonalState] = useState<PersonalWorkstationState>(() => getInitialPersonalWorkstationState(personalStorageKey, initialSnapshot, startEmpty));

  useEffect(() => {
    const freshState = getInitialPersonalWorkstationState(personalStorageKey, initialSnapshot, startEmpty);
    setPersonalState(freshState);

    const freshPreferences = readWorkstationWidgetPreferences(personalStorageKey);
    if (Object.keys(freshPreferences).length > 0) {
      setWidgetPreferences(freshPreferences);
    } else if (initialSnapshot?.widgetPreferences) {
      setWidgetPreferences(initialSnapshot.widgetPreferences);
    } else {
      setWidgetPreferences({});
    }

    setCreatedCustomWidgets(freshState.customWidgets);
    setAddedCustomWidgetIds(freshState.addedCustomWidgetIds);
    setIsEditMode(false);
  }, [personalStorageKey, startEmpty, initialSnapshot]);

  const [widgetPreferences, setWidgetPreferences] = useState<WorkstationWidgetPreferences>(() => {
    const fromStorage = readWorkstationWidgetPreferences(personalStorageKey);
    if (Object.keys(fromStorage).length > 0) return fromStorage;
    return initialSnapshot?.widgetPreferences ?? {};
  });
  const [createdCustomWidgets, setCreatedCustomWidgets] = useState<CustomCreatedWidget[]>(() => personalState.customWidgets);
  const [addedCustomWidgetIds, setAddedCustomWidgetIds] = useState<string[]>(() => personalState.addedCustomWidgetIds);
  const [activeCustomWidgetId, setActiveCustomWidgetId] = useState<string | null>(null);
  const [customWidgetEditSection, setCustomWidgetEditSection] = useState<CustomWidgetEditSection | null>(null);
  const [customWidgetEditTranscript, setCustomWidgetEditTranscript] = useState<CustomWidgetEditTranscriptItem[]>([]);
  const [customWidgetShareTarget, setCustomWidgetShareTarget] = useState('');
  const [customWidgetChatStage, setCustomWidgetChatStage] = useState(0);
  const [activePersonalWidgetDomain, setActivePersonalWidgetDomain] = useState<PersonalWidgetDomain>('All');
  const [personalWidgetSearch, setPersonalWidgetSearch] = useState('');

  const {
    selectedCycleTarget,
    selectedItemType,
    setSelectedCycleTarget,
    setSelectedItemType,
  } = useWorkstationDetailState();

  const [activeBreakpoint, setActiveBreakpoint] = useState<WorkstationLayoutBreakpoint>('lg');
  const [isProductionPlanningExpanded, setIsProductionPlanningExpanded] = useState(false);
  const [isShiftOeeExpanded, setIsShiftOeeExpanded] = useState(false);
  const [isMachineUtilizationExpanded, setIsMachineUtilizationExpanded] = useState(false);
  const [isEsoExpanded, setIsEsoExpanded] = useState(false);
  const [isSafetyExpanded, setIsSafetyExpanded] = useState(false);
  const [isSeriousInjuryModalOpen, setIsSeriousInjuryModalOpen] = useState(false);
  const [isProductionDeliveryModalOpen, setIsProductionDeliveryModalOpen] = useState(false);
  const [isDowntimeAnalysisModalOpen, setIsDowntimeAnalysisModalOpen] = useState(false);
  const [isQualityExpanded, setIsQualityExpanded] = useState(false);
  const [isDeliveryExpanded, setIsDeliveryExpanded] = useState(false);
  const [isCostExpanded, setIsCostExpanded] = useState(false);
  const [isPeopleExpanded, setIsPeopleExpanded] = useState(false);
  const [activeTierKpiCustomize, setActiveTierKpiCustomize] = useState<TierKpiDomain | null>(null);
  const [tierShownKpis, setTierShownKpis] = useState<Record<TierKpiDomain, string[]>>(() => ({
    Safety: [...tierKpiOptions.Safety],
    Quality: tierKpiOptions.Quality.filter((kpi) => kpi !== 'Field Actions'),
    Delivery: [...tierKpiOptions.Delivery],
    Cost: [...tierKpiOptions.Cost],
    People: [...tierKpiOptions.People],
  }));
  const [isCiltCenterlineExpanded, setIsCiltCenterlineExpanded] = useState(false);
  const [isEquipmentChangeoverExpanded, setIsEquipmentChangeoverExpanded] = useState(false);
  const [isLossFocusedKpisExpanded, setIsLossFocusedKpisExpanded] = useState(false);
  const [cilCenterlineLauncherRequest, setCilCenterlineLauncherRequest] = useState<CilCenterlineLauncherRequest | null>(null);
  const [changeoverLauncherRequest, setChangeoverLauncherRequest] = useState<ChangeoverLauncherRequest | null>(null);
  const [lineStatusAssistTask, setLineStatusAssistTask] = useState<ConsolidatedTask | null>(null);
  const {
    openActionTrackerScreen,
    setActionCreateContext,
    setActionCreateSuggestionSeed,
    setIsActionCreateDrawerOpen,
  } = useActionTrackerContext();
  const { activePredefinedWorkstationTitle, setCurrentScreen } = useWorkstationContext();

  useEffect(() => {
    writeWorkstationWidgetPreferences(personalStorageKey, widgetPreferences);
  }, [personalStorageKey, widgetPreferences]);

  const {
    alert,
    energyTrend,
    escalationActions,
    machinePerformance,
    machineStateDistribution,
    materialRisks,
    operationalMetrics,
    operatorTasks,
    outputByProcess,
    throughputByProcess,
    hourlyOutput,
    outputByShift,
    outputTrend,
    processYield,
    processes,
    qualityByShift,
    scrapTrend,
    selectedItems,
    summary,
    topDowntimeCauses,
    traceabilityHistory,
    cycleTimeVsTarget,
    utilitiesByMachine,
    wipLevels,
  } = data;

  const shiftProgressPercent = Math.min((summary.currentOutput / summary.shiftTarget) * 100, 100);
  const shiftElapsedPercent = Math.min((summary.shiftElapsedMinutes / summary.shiftDurationMinutes) * 100, 100);
  const projectedShiftOutput = summary.shiftElapsedMinutes > 0
    ? (summary.currentOutput / summary.shiftElapsedMinutes) * summary.shiftDurationMinutes
    : 0;
  const projectedShiftPercent = Math.min((projectedShiftOutput / summary.shiftTarget) * 100, 100);
  const projectedOnTarget = projectedShiftOutput >= summary.shiftTarget;
  const projectedTone = projectedOnTarget ? '#7AD36B' : '#FF5A52';
  const executionOnTarget = shiftProgressPercent >= shiftElapsedPercent;
  const executionBarTone = executionOnTarget ? '#044ED7' : '#FF5A52';
  const scrapGuardrail = scrapTrend.map(() => 2);
  const oeeTrendValues = operationalMetrics.map((item) => Number(item.oee));
  const latestOee = oeeTrendValues[oeeTrendValues.length - 1] ?? summary.oee;
  const previousOee = oeeTrendValues[oeeTrendValues.length - 2] ?? latestOee;
  const oeeTrendDelta = latestOee - previousOee;
  const oeeTarget = 85;
  const oeeOnTarget = latestOee >= oeeTarget;
  const oeeAccent = oeeOnTarget ? '#7AD36B' : '#FF5A52';
  const availabilityTrendValues = operationalMetrics.map((item) => Number(item.availability));
  const latestAvailability = availabilityTrendValues[availabilityTrendValues.length - 1] ?? summary.availability;
  const previousAvailability = availabilityTrendValues[availabilityTrendValues.length - 2] ?? latestAvailability;
  const availabilityDelta = latestAvailability - previousAvailability;
  const availabilityTarget = 90;
  const availabilityOnTarget = latestAvailability >= availabilityTarget;
  const availabilityAccent = availabilityOnTarget ? '#7AD36B' : '#FF5A52';
  const performanceTrendValues = operationalMetrics.map((item) => Number(item.performance));
  const latestPerformance = performanceTrendValues[performanceTrendValues.length - 1] ?? summary.performance;
  const previousPerformance = performanceTrendValues[performanceTrendValues.length - 2] ?? latestPerformance;
  const performanceDelta = latestPerformance - previousPerformance;
  const performanceTarget = 95;
  const performanceOnTarget = latestPerformance >= performanceTarget;
  const performanceAccent = performanceOnTarget ? '#7AD36B' : '#FF5A52';
  const qualityTrendValues = operationalMetrics.map((item) => Number(item.quality));
  const latestQualityMetric = qualityTrendValues[qualityTrendValues.length - 1] ?? summary.quality;
  const previousQualityMetric = qualityTrendValues[qualityTrendValues.length - 2] ?? latestQualityMetric;
  const qualityDelta = latestQualityMetric - previousQualityMetric;
  const qualityTarget = 95;
  const qualityOnTarget = latestQualityMetric >= qualityTarget;
  const qualityAccent = qualityOnTarget ? '#7AD36B' : '#FF5A52';
  const fpyTrendValues = scrapTrend.map((item) => 100 - Number(item.scrap));
  const latestFpy = fpyTrendValues[fpyTrendValues.length - 1] ?? summary.fpy;
  const previousFpy = fpyTrendValues[fpyTrendValues.length - 2] ?? latestFpy;
  const fpyDelta = latestFpy - previousFpy;
  const fpyTarget = 98;
  const fpyOnTarget = latestFpy >= fpyTarget;
  const fpyAccent = fpyOnTarget ? '#7AD36B' : '#FF5A52';

  const scrapTrendValues = scrapTrend.map((item) => Number(item.scrap));
  const latestScrap = scrapTrendValues[scrapTrendValues.length - 1] ?? summary.scrapRate;
  const previousScrap = scrapTrendValues[scrapTrendValues.length - 2] ?? latestScrap;
  const scrapDelta = latestScrap - previousScrap;
  const scrapTarget = 2;
  const scrapOnTarget = latestScrap <= scrapTarget;
  const scrapAccent = scrapOnTarget ? '#7AD36B' : '#FF5A52';

  const downtimeTrendValues = topDowntimeCauses.slice().reverse().map((item) => Number(item.minutes));
  const latestDowntime = downtimeTrendValues[downtimeTrendValues.length - 1] ?? summary.downtimeMinutes;
  const previousDowntime = downtimeTrendValues[downtimeTrendValues.length - 2] ?? latestDowntime;
  const downtimeDelta = latestDowntime - previousDowntime;
  const downtimeTarget = 40;
  const downtimeOnTarget = latestDowntime <= downtimeTarget;
  const downtimeAccent = downtimeOnTarget ? '#7AD36B' : '#FF5A52';

  const energyUnitTrendValues = energyTrend.map((item) => Number(item.energy) / 450);
  const latestEnergyUnit = energyUnitTrendValues[energyUnitTrendValues.length - 1] ?? summary.energyPerUnitKwh;
  const previousEnergyUnit = energyUnitTrendValues[energyUnitTrendValues.length - 2] ?? latestEnergyUnit;
  const energyUnitDelta = latestEnergyUnit - previousEnergyUnit;
  const energyUnitTarget = 0.32;
  const energyUnitOnTarget = latestEnergyUnit <= energyUnitTarget;
  const energyUnitAccent = energyUnitOnTarget ? '#7AD36B' : '#FF5A52';

  const performanceMetricCards: Array<{ widgetId: string; label: string; value: string; tone: string }> = [
    { widgetId: 'oee-kpi', label: 'OEE', value: `${summary.oee}%`, tone: '#044ED7' },
    { widgetId: 'availability-kpi', label: 'Availability', value: `${summary.availability}%`, tone: '#0F766E' },
    { widgetId: 'performance-kpi', label: 'Performance', value: `${summary.performance}%`, tone: '#FF6E00' },
    { widgetId: 'quality-kpi', label: 'Quality', value: `${summary.quality}%`, tone: '#7C3AED' },
  ];

  const summarySupportCards: Array<{ widgetId: string; label: string; value: string; note: string }> = [
    { widgetId: 'downtime-kpi', label: 'Downtime', value: `${summary.downtimeMinutes} min`, note: `MTTR ${summary.mttrMinutes} min` },
    { widgetId: 'fpy-kpi', label: 'FPY', value: `${summary.fpy}%`, note: `Scrap ${summary.scrapRate}%` },
    { widgetId: 'scrap-kpi', label: 'Scrap', value: `${summary.scrapRate}%`, note: `FPY ${summary.fpy}%` },
    { widgetId: 'energy-unit-kpi', label: 'Energy / unit', value: `${summary.energyPerUnitKwh} kWh`, note: `Takt ${summary.taktTimeSeconds}s` },
  ];

  const renderTierMetricCard = ({
    accent,
    label,
    note,
    target,
    value,
  }: {
    accent: string;
    label: string;
    note?: string;
    target?: string;
    value: string;
  }) => (
    <Paper
      elevation={0}
      sx={{
        ...workstationTierInsetCardSx,
        position: 'relative',
        overflow: 'hidden',
        pt: 0.9,
        pr: 1.05,
        pb: 0.75,
        pl: 1.55,
        minHeight: note || target ? 86 : 72,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backgroundImage: workstationVisuals.tierPanelBackground,
      }}
    >
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent }} />
      {target ? (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: workstationVisuals.tierTextMeta, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            Target {target}
          </Typography>
        </Box>
      ) : null}
      <Typography sx={{ fontSize: '0.62rem', fontWeight: 800, color: workstationVisuals.tierTextLabel, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '2rem', color: accent, fontWeight: 900, mt: 0.35, lineHeight: 0.95 }}>
        {value}
      </Typography>
      {note ? (
        <Typography sx={{ fontSize: '0.68rem', fontWeight: 700, color: accent, mt: 0.55 }}>
          {note}
        </Typography>
      ) : null}
    </Paper>
  );

  const renderOeeTrendCard = ({ showScopeLabel = true }: { showScopeLabel?: boolean } = {}) => (
    <WorkstationKpiTrendCard
      accent={oeeAccent}
      comparisonLabel={`${oeeTrendDelta >= 0 ? '+' : ''}${oeeTrendDelta.toFixed(1)} pts vs prior day`}
      label="OEE"
      positive={oeeOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${oeeTarget}%`}
      trendValues={oeeTrendValues}
      value={`${latestOee.toFixed(1)}%`}
    />
  );

  const renderAvailabilityTrendCard = ({ showScopeLabel = true }: { showScopeLabel?: boolean } = {}) => (
    <WorkstationKpiTrendCard
      accent={availabilityAccent}
      comparisonLabel={`${availabilityDelta >= 0 ? '+' : ''}${availabilityDelta.toFixed(1)} pts vs prior day`}
      label="Availability"
      positive={availabilityOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${availabilityTarget}%`}
      trendValues={availabilityTrendValues}
      value={`${latestAvailability.toFixed(1)}%`}
    />
  );

  const renderPerformanceTrendCard = ({ showScopeLabel = true }: { showScopeLabel?: boolean } = {}) => (
    <WorkstationKpiTrendCard
      accent={performanceAccent}
      comparisonLabel={`${performanceDelta >= 0 ? '+' : ''}${performanceDelta.toFixed(1)} pts vs prior day`}
      label="Performance"
      positive={performanceOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${performanceTarget}%`}
      trendValues={performanceTrendValues}
      value={`${latestPerformance.toFixed(1)}%`}
    />
  );

  const renderQualityTrendCard = ({ showScopeLabel = true }: { showScopeLabel?: boolean } = {}) => (
    <WorkstationKpiTrendCard
      accent={qualityAccent}
      comparisonLabel={`${qualityDelta >= 0 ? '+' : ''}${qualityDelta.toFixed(1)} pts vs prior day`}
      label="Quality"
      positive={qualityOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${qualityTarget}%`}
      trendValues={qualityTrendValues}
      value={`${latestQualityMetric.toFixed(1)}%`}
    />
  );

  const renderFpyTrendCard = ({ showScopeLabel = true }: { showScopeLabel?: boolean } = {}) => (
    <WorkstationKpiTrendCard
      accent={fpyAccent}
      comparisonLabel={`${fpyDelta >= 0 ? '+' : ''}${fpyDelta.toFixed(1)} pts vs prior hour`}
      label="FPY"
      positive={fpyOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${fpyTarget}%`}
      trendValues={fpyTrendValues}
      value={`${latestFpy.toFixed(1)}%`}
    />
  );

  const renderDowntimeTrendCard = ({ showScopeLabel = true }: { showScopeLabel?: boolean } = {}) => (
    <WorkstationKpiTrendCard
      accent={downtimeAccent}
      comparisonLabel={`${downtimeDelta >= 0 ? '+' : ''}${downtimeDelta.toFixed(0)} min vs prior cause`}
      label="Downtime"
      positive={downtimeOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${downtimeTarget} min`}
      trendValues={downtimeTrendValues}
      value={`${latestDowntime.toFixed(0)} min`}
    />
  );

  const renderScrapTrendCard = ({ showScopeLabel = true }: { showScopeLabel?: boolean } = {}) => (
    <WorkstationKpiTrendCard
      accent={scrapAccent}
      comparisonLabel={`${scrapDelta >= 0 ? '+' : ''}${scrapDelta.toFixed(1)} pts vs prior hour`}
      label="Scrap"
      positive={scrapOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${scrapTarget}%`}
      trendValues={scrapTrendValues}
      value={`${latestScrap.toFixed(1)}%`}
    />
  );

  const renderEnergyUnitTrendCard = ({ showScopeLabel = true }: { showScopeLabel?: boolean } = {}) => (
    <WorkstationKpiTrendCard
      accent={energyUnitAccent}
      comparisonLabel={`${energyUnitDelta >= 0 ? '+' : ''}${energyUnitDelta.toFixed(2)} kWh vs prior hour`}
      label="Energy / Unit"
      positive={energyUnitOnTarget}
      scopeLabel={summary.line}
      showScopeLabel={showScopeLabel}
      target={`${energyUnitTarget.toFixed(2)} kWh`}
      trendValues={energyUnitTrendValues}
      value={`${latestEnergyUnit.toFixed(2)} kWh`}
    />
  );

  const renderShiftExecutionCard = ({
    compact = false,
    fillHeight = false,
  }: {
    compact?: boolean;
    fillHeight?: boolean;
  } = {}) => (
    <Paper
      elevation={0}
      sx={{
        ...workstationTierInsetCardSx,
        p: compact ? 1 : 1.15,
        borderRadius: 2.6,
        backgroundImage: workstationVisuals.tierPanelBackground,
        minHeight: 0,
        height: fillHeight ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxShadow: workstationVisuals.tierShadow,
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: compact ? 0.45 : 0.7, my: 'auto' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
          <Typography sx={{ fontSize: compact ? '0.82rem' : '0.92rem', fontWeight: 900, color: workstationVisuals.tierTextLabel, lineHeight: 1.05, textTransform: 'uppercase', fontFamily: workstationVisuals.fontFamily }}>
            Shift Execution
          </Typography>
          <Typography sx={{ fontSize: compact ? '0.82rem' : '0.92rem', fontWeight: 900, color: workstationVisuals.tierTextMeta, letterSpacing: '0.08em', textTransform: 'uppercase', textAlign: 'right', lineHeight: 1.1, fontFamily: workstationVisuals.fontFamily }}>
            Target {summary.shiftTarget.toLocaleString()}
          </Typography>
        </Box>
        <Typography sx={{ fontSize: compact ? '2.05rem' : '2.3rem', lineHeight: 0.95, fontWeight: 900, color: projectedTone, fontFamily: workstationVisuals.fontFamily }}>
          {summary.currentOutput.toLocaleString()}
        </Typography>
        <Typography sx={{ fontSize: compact ? '0.66rem' : '0.72rem', fontWeight: 700, color: executionBarTone, fontFamily: workstationVisuals.fontFamily }}>
          {projectedOnTarget ? 'On pace to target' : 'Below pace to target'}
        </Typography>
        <Box sx={{ pt: 0.1 }}>
          <LinearProgress
            variant="determinate"
            value={shiftProgressPercent}
            sx={{
              height: compact ? 12 : 14,
              borderRadius: 999,
              bgcolor: workstationVisuals.tierSurfaceMuted,
              border: `1px solid ${workstationVisuals.tierBorder}`,
              overflow: 'hidden',
              position: 'relative',
              '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: executionBarTone },
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 2,
                bottom: 2,
                left: `${Math.max(projectedShiftPercent - 0.8, 0)}%`,
                width: '3px',
                borderRadius: 999,
                bgcolor: projectedTone,
                boxShadow: `0 0 0 4px color-mix(in srgb, ${projectedTone} 13%, transparent)`,
                zIndex: 2,
              },
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: compact ? 0.5 : 0.65 }}>
            <Typography sx={{ fontSize: compact ? '0.66rem' : '0.72rem', color: workstationVisuals.tierTextLabel, fontWeight: 700, fontFamily: workstationVisuals.fontFamily }}>
              {shiftProgressPercent.toFixed(1)}% to shift target
            </Typography>
            <Typography sx={{ fontSize: compact ? '0.66rem' : '0.72rem', color: workstationVisuals.tierTextLabel, fontWeight: 700, fontFamily: workstationVisuals.fontFamily }}>
              Shift clock {shiftElapsedPercent.toFixed(0)}%
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );

  useEffect(() => {
    const sanitizedCustomWidgets = sanitizeCustomCreatedWidgets(createdCustomWidgets);
    const sanitizedAddedCustomWidgetIds = sanitizeAddedCustomWidgetIds(addedCustomWidgetIds, sanitizedCustomWidgets);

    setPersonalState((prev) => {
      const customWidgetsAreSame = JSON.stringify(prev.customWidgets) === JSON.stringify(sanitizedCustomWidgets);
      const addedIdsAreSame = JSON.stringify(prev.addedCustomWidgetIds) === JSON.stringify(sanitizedAddedCustomWidgetIds);
      if (customWidgetsAreSame && addedIdsAreSame) return prev;

      return {
        ...prev,
        addedCustomWidgetIds: sanitizedAddedCustomWidgetIds,
        customWidgets: sanitizedCustomWidgets,
      };
    });
  }, [addedCustomWidgetIds, createdCustomWidgets]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(personalStorageKey, JSON.stringify(personalState));
  }, [personalState, personalStorageKey]);

  useEffect(() => {
    if (isAddWidgetPanelOpen && !isWidgetAssistantOpen) {
      setIsWidgetAssistantCardVisible(true);
    }
  }, [isAddWidgetPanelOpen, isWidgetAssistantOpen]);

  useEffect(() => {
    if (!isWidgetAssistantOpen) {
      setWidgetAssistantStep(0);
      return;
    }

    setWidgetAssistantStep(0);
    const timers = [
      window.setTimeout(() => setWidgetAssistantStep(1), 650),
      window.setTimeout(() => setWidgetAssistantStep(2), 1050),
      window.setTimeout(() => setWidgetAssistantStep(3), 1850),
      window.setTimeout(() => setWidgetAssistantStep(4), 2350),
    ];

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isWidgetAssistantOpen]);

  const personalVisibleWidgetIds = useMemo(() => {
    const visibleIds = personalWidgetIds.filter((id) => !personalState.hiddenWidgetIds.includes(id));
    const textBoxInstanceIds = Array.from(new Set(
      workstationBreakpointKeys.flatMap((breakpoint) => personalState.layouts[breakpoint]
        .map((item) => item.i)
        .filter((id) => (
          id !== textBoxWidgetTemplateId
          && isTextBoxWidgetInstanceId(id)
          && !personalState.hiddenWidgetIds.includes(id)
        ))),
    ));
    const nextVisibleIds = [...visibleIds, ...textBoxInstanceIds];
    return nextVisibleIds.includes('action-tracker')
      ? nextVisibleIds.filter((id) => (id as string) !== 'escalation-tags')
      : nextVisibleIds;
  }, [personalState.hiddenWidgetIds, personalState.layouts]);

  const normalizedPersonalWidgetSearch = personalWidgetSearch.trim().toLowerCase();
  const filteredPersonalWidgetIds = personalWidgetIds.filter((widgetId) => {
    const widget = personalWidgetMap[widgetId];
    const domain = getPersonalWidgetDomain(widgetId);
    if (activePersonalWidgetDomain !== 'All' && domain !== activePersonalWidgetDomain) return false;
    if (!normalizedPersonalWidgetSearch) return true;
    const searchableText = [
      widget.label,
      widget.description,
      widget.category,
      domain,
      ...getPersonalWidgetTags(widgetId),
    ].join(' ').toLowerCase();
    return searchableText.includes(normalizedPersonalWidgetSearch);
  });
  const filteredCustomWidgets = createdCustomWidgets.filter((widget) => {
    if (activePersonalWidgetDomain !== 'All' && activePersonalWidgetDomain !== 'My Widgets') return false;
    if (!normalizedPersonalWidgetSearch) return true;
    return [
      widget.title,
      widget.dataset,
      widget.visualization,
      ...widget.metrics,
      ...widget.filters,
      'custom',
    ].join(' ').toLowerCase().includes(normalizedPersonalWidgetSearch);
  });
  const filteredWidgetCount = filteredPersonalWidgetIds.length + filteredCustomWidgets.length;
  const customVisibleWidgets = useMemo(() => createdCustomWidgets.filter((widget) => addedCustomWidgetIds.includes(widget.id)), [createdCustomWidgets, addedCustomWidgetIds]);
  const isPersonalBoardEmpty = personalVisibleWidgetIds.length + addedCustomWidgetIds.length === 0;
  const activeLossFocusedMetricIds = sanitizeLossFocusedMetricIds(personalState.lossFocusedMetricIds);
  const activeCustomWidget = createdCustomWidgets.find((widget) => widget.id === activeCustomWidgetId) ?? null;
  const isTierStandardWorkstation = activePredefinedWorkstationTitle === 'Tier 1'
    || activePredefinedWorkstationTitle === 'Tier 2'
    || activePredefinedWorkstationTitle === 'Tier 3';
  const savedActionTrackerViewMode = widgetPreferences.actionTracker?.viewMode;
  const actionTrackerViewMode: ActionTrackerViewMode =
    savedActionTrackerViewMode === 'board' || savedActionTrackerViewMode === 'table' || savedActionTrackerViewMode === 'dashboard'
      ? savedActionTrackerViewMode
      : 'dashboard';
  const displayedActionTrackerViewMode: ActionTrackerViewMode =
    isTierStandardWorkstation && actionTrackerViewMode === 'dashboard'
      ? 'board'
      : actionTrackerViewMode;
  const personalVisibleLayouts = useMemo(() => workstationBreakpointKeys.reduce((layouts, breakpoint) => {
    const cols = workstationCols[breakpoint];
    const visibleItems = personalState.layouts[breakpoint]
      .filter((item) => personalVisibleWidgetIds.includes(item.i as PersonalWidgetId));

    personalVisibleWidgetIds.forEach((widgetId, index) => {
      if (!visibleItems.some((item) => item.i === widgetId)) {
        visibleItems.push(createPersonalLayoutItem(widgetId, cols, index));
      }
    });

    layouts[breakpoint] = visibleItems;
    return layouts;
  }, {} as WorkstationResponsiveLayouts), [personalState.layouts, personalVisibleWidgetIds]);

  const combinedPersonalVisibleLayouts = useMemo(() => workstationBreakpointKeys.reduce((layouts, breakpoint) => {
    const cols = workstationCols[breakpoint];
    layouts[breakpoint] = [
      ...personalVisibleLayouts[breakpoint],
      ...customVisibleWidgets.map((widget, index) => {
        const width = Math.min(cols, cols <= 4 ? cols : 4);
        return {
          i: widget.id,
          x: (index * width) % cols,
          y: 1000 + index * 7,
          w: width,
          h: 6,
          minW: Math.min(cols, 3),
          minH: 4,
        };
      }),
    ];
    return layouts;
  }, {} as WorkstationResponsiveLayouts), [personalVisibleLayouts, customVisibleWidgets]);

  const addTextBoxWidget = () => {
    const widgetId = `${textBoxWidgetTemplateId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    setWidgetPreferences((currentPreferences) => ({
      ...currentPreferences,
      textBoxes: {
        ...currentPreferences.textBoxes,
        [widgetId]: defaultTextBoxPreferences,
      },
    }));

    setPersonalState((prev) => ({
      ...prev,
      hiddenWidgetIds: Array.from(new Set([
        ...prev.hiddenWidgetIds.filter((id) => id !== widgetId),
        textBoxWidgetTemplateId,
      ])),
      layouts: workstationBreakpointKeys.reduce((layouts, breakpoint) => {
        const cols = workstationCols[breakpoint];
        const currentLayout = prev.layouts[breakpoint];
        const nextIndex = currentLayout.length + 1;
        layouts[breakpoint] = sanitizePersonalLayoutItems(
          [
            ...currentLayout.filter((item) => item.i !== widgetId),
            createPersonalLayoutItem(widgetId, cols, nextIndex),
          ],
          breakpoint,
        );
        return layouts;
      }, {} as WorkstationResponsiveLayouts),
    }));
  };

  const addPersonalWidget = (widgetId: PersonalWidgetId) => {
    if (widgetId === textBoxWidgetTemplateId) {
      addTextBoxWidget();
      return;
    }

    setPersonalState((prev) => ({
      ...prev,
      hiddenWidgetIds: prev.hiddenWidgetIds.filter((id) => id !== widgetId),
      layouts: workstationBreakpointKeys.reduce((layouts, breakpoint) => {
        const cols = workstationCols[breakpoint];
        layouts[breakpoint] = sanitizePersonalLayoutItems(
          prev.layouts[breakpoint].map((item) => item.i === widgetId ? createPersonalLayoutItem(widgetId, cols) : item),
          breakpoint,
        );
        return layouts;
      }, {} as WorkstationResponsiveLayouts),
    }));
  };

  const addPersonalWidgets = (widgetIds: PersonalWidgetId[]) => {
    setPersonalState((prev) => ({
      ...prev,
      hiddenWidgetIds: prev.hiddenWidgetIds.filter((id) => !widgetIds.includes(id as PersonalWidgetId)),
      layouts: workstationBreakpointKeys.reduce((layouts, breakpoint) => {
        const cols = workstationCols[breakpoint];
        layouts[breakpoint] = sanitizePersonalLayoutItems(
          prev.layouts[breakpoint].map((item) => widgetIds.includes(item.i as PersonalWidgetId) ? createPersonalLayoutItem(item.i as PersonalWidgetId, cols) : item),
          breakpoint,
        );
        return layouts;
      }, {} as WorkstationResponsiveLayouts),
    }));
  };

  const openCustomWidgetAssistant = () => {
    setWidgetAssistantMode('create');
    setIsWidgetAssistantOpen(true);
    setIsWidgetAssistantCardVisible(false);
    setIsAddWidgetPanelOpen(true);
    setActiveCustomWidgetId(null);
    setCustomWidgetEditSection(null);
    setCustomWidgetEditTranscript([]);
    setCustomWidgetShareTarget('');
    setCustomWidgetDataset(null);
    setCustomWidgetMetrics([]);
    setCustomWidgetVisualization(null);
    setCustomWidgetFiltersSelected([]);
    setIsCustomWidgetCreated(false);
    setCustomWidgetChatStage(0);
  };

  const openCustomWidgetEditAssistant = (widget?: CustomCreatedWidget) => {
    const currentWidget = widget ?? createCustomWidgetPreviewSnapshot();
    const typingId = `edit-typing-${Date.now()}`;
    setWidgetAssistantMode('edit');
    setIsWidgetAssistantOpen(true);
    setIsWidgetAssistantCardVisible(false);
    setIsAddWidgetPanelOpen(true);
    setActiveCustomWidgetId(widget?.id ?? null);
    setCustomWidgetEditSection(null);
    setCustomWidgetShareTarget('');
    setCustomWidgetEditTranscript([
      { id: `edit-user-${Date.now()}`, role: 'user', text: `Edit the configuration for ${currentWidget.title}.` },
      { id: typingId, role: 'typing' },
    ]);
    if (widget) {
      setCustomWidgetDataset(widget.dataset);
      setCustomWidgetMetrics(widget.metrics);
      setCustomWidgetVisualization(widget.visualization);
      setCustomWidgetFiltersSelected(widget.filters);
    }
    setCustomWidgetChatStage(0);
    window.setTimeout(() => {
      setCustomWidgetEditTranscript((prev) => [
        ...prev.filter((item) => item.id !== typingId),
        { id: `edit-assistant-${Date.now()}`, role: 'assistant', text: 'Here is the current widget.' },
        { id: `edit-preview-${Date.now()}`, role: 'preview', widget: currentWidget },
        { id: `edit-question-${Date.now()}`, role: 'assistant', text: 'What do you want to change?' },
      ]);
    }, 720);
  };

  const openCustomWidgetShareAssistant = (widget: CustomCreatedWidget) => {
    setWidgetAssistantMode('share');
    setIsWidgetAssistantOpen(true);
    setIsWidgetAssistantCardVisible(false);
    setIsAddWidgetPanelOpen(true);
    setActiveCustomWidgetId(widget.id);
    setCustomWidgetEditSection(null);
    setCustomWidgetEditTranscript([]);
    setCustomWidgetShareTarget('');
    setCustomWidgetChatStage(0);
    window.setTimeout(() => setCustomWidgetChatStage(1), 420);
    window.setTimeout(() => setCustomWidgetChatStage(2), 980);
  };

  const updateCustomWidget = (widgetId: string, patch: Partial<CustomCreatedWidget>) => {
    setCreatedCustomWidgets((prev) => prev.map((widget) => (
      widget.id === widgetId ? { ...widget, ...patch } : widget
    )));
  };

  const updateCustomWidgetVisualization = (widgetId: string, visualization: string) => {
    updateCustomWidget(widgetId, { visualization });
    setCustomWidgetVisualization(visualization);
    appendCustomWidgetEditExchange(
      `Use ${visualization}.`,
      'Done. I updated the widget style.',
      createCustomWidgetPreviewSnapshot({ visualization }),
    );
  };

  const updateCustomWidgetDataset = (dataset: CustomWidgetDataset) => {
    setCustomWidgetDataset(dataset);
    const nextMetrics = customWidgetMetricOptions[dataset].slice(0, 2);
    setCustomWidgetMetrics(nextMetrics);
    if (activeCustomWidgetId) {
      updateCustomWidget(activeCustomWidgetId, {
        dataset,
        metrics: nextMetrics,
        title: `${dataset} Custom Widget`,
      });
    }
    appendCustomWidgetEditExchange(
      `Use ${dataset}.`,
      'Done. I updated the dataset and refreshed the suggested metrics.',
      createCustomWidgetPreviewSnapshot({ dataset, metrics: nextMetrics, title: `${dataset} Custom Widget` }),
    );
  };

  const toggleEditedCustomMetric = (metric: string) => {
    const nextMetrics = customWidgetMetrics.includes(metric)
      ? customWidgetMetrics.filter((item) => item !== metric)
      : [...customWidgetMetrics, metric];
    setCustomWidgetMetrics(nextMetrics);
    if (activeCustomWidgetId) {
      updateCustomWidget(activeCustomWidgetId, { metrics: nextMetrics });
    }
    appendCustomWidgetEditExchange(
      `Use ${metric}.`,
      'Done. I updated the metrics and refreshed the widget preview.',
      createCustomWidgetPreviewSnapshot({ metrics: nextMetrics }),
    );
  };

  const toggleEditedCustomFilter = (filter: string) => {
    const nextFilters = customWidgetFiltersSelected.includes(filter)
      ? customWidgetFiltersSelected.filter((item) => item !== filter)
      : [...customWidgetFiltersSelected, filter];
    setCustomWidgetFiltersSelected(nextFilters);
    if (activeCustomWidgetId) {
      updateCustomWidget(activeCustomWidgetId, { filters: nextFilters });
    }
    appendCustomWidgetEditExchange(
      `${nextFilters.includes(filter) ? 'Add' : 'Remove'} ${filter}.`,
      'Done. I updated the widget filters.',
      createCustomWidgetPreviewSnapshot({ filters: nextFilters }),
    );
  };

  const selectCustomMetric = (metric: string) => {
    setCustomWidgetMetrics((prev) => prev.includes(metric)
      ? prev.filter((item) => item !== metric)
      : [...prev, metric]);
    setCustomWidgetChatStage(3);
    window.setTimeout(() => setCustomWidgetChatStage(4), 520);
  };

  const selectCustomFilter = (filter: string) => {
    setCustomWidgetFiltersSelected((prev) => prev.includes(filter)
      ? prev.filter((item) => item !== filter)
      : [...prev, filter]);
    setCustomWidgetChatStage(7);
    window.setTimeout(() => setCustomWidgetChatStage(8), 520);
  };

  const createCustomWidget = () => {
    if (!customWidgetDataset || !customWidgetVisualization || !customWidgetFiltersSelected.length) return;
    const customWidget: CustomCreatedWidget = {
      id: `custom-${Date.now()}`,
      title: customWidgetTitle,
      dataset: customWidgetDataset,
      metrics: customWidgetMetrics,
      visualization: customWidgetVisualization,
      filters: customWidgetFiltersSelected,
    };
    setCreatedCustomWidgets((prev) => [customWidget, ...prev]);
    setAddedCustomWidgetIds((prev) => [customWidget.id, ...prev]);
    setActiveCustomWidgetId(customWidget.id);
    setActivePersonalWidgetDomain('My Widgets');
    setPersonalWidgetSearch('');
    setIsCustomWidgetCreated(true);
    window.setTimeout(() => {
      setIsWidgetAssistantOpen(false);
      setWidgetAssistantMode('layout');
      setIsWidgetAssistantCardVisible(true);
      setCustomWidgetDataset(null);
      setCustomWidgetMetrics([]);
      setCustomWidgetVisualization(null);
      setCustomWidgetFiltersSelected([]);
      setIsCustomWidgetCreated(false);
      setCustomWidgetChatStage(0);
    }, 700);
  };

  const deleteCustomWidget = (widgetId: string) => {
    setCreatedCustomWidgets((prev) => prev.filter((widget) => widget.id !== widgetId));
    setAddedCustomWidgetIds((prev) => prev.filter((id) => id !== widgetId));
  };

  const hidePersonalWidget = (widgetId: string) => {
    setPersonalState((prev) => {
      const nextHidden = prev.hiddenWidgetIds.includes(widgetId)
        ? prev.hiddenWidgetIds
        : [...prev.hiddenWidgetIds, widgetId];

      const nextLayouts = workstationBreakpointKeys.reduce((acc, breakpoint) => {
        acc[breakpoint] = prev.layouts[breakpoint].filter((item) => item.i !== widgetId);
        return acc;
      }, {} as WorkstationResponsiveLayouts);

      return {
        ...prev,
        hiddenWidgetIds: nextHidden,
        layouts: nextLayouts,
      };
    });

    if (widgetId !== textBoxWidgetTemplateId && isTextBoxWidgetInstanceId(widgetId)) {
      setWidgetPreferences((currentPreferences) => {
        if (!currentPreferences.textBoxes?.[widgetId]) return currentPreferences;
        const nextTextBoxes = {...currentPreferences.textBoxes};
        delete nextTextBoxes[widgetId];
        return {
          ...currentPreferences,
          textBoxes: Object.keys(nextTextBoxes).length ? nextTextBoxes : undefined,
        };
      });
    }
  };

  const setPersonalWidgetVisible = (widgetId: PersonalWidgetId, isVisible: boolean) => {
    if (isVisible) {
      addPersonalWidget(widgetId);
    } else {
      hidePersonalWidget(widgetId);
    }
  };

  const resetPersonalLayout = () => {
    setPersonalState(sanitizePersonalState(null));
  };

  const commitPersonalBreakpointLayout = (layout: unknown) => {
    const nextLayout = normalizeGridLayout(layout).filter((item) => (
      personalWidgetIds.includes(item.i as PersonalWidgetId)
      || isTextBoxWidgetInstanceId(item.i)
      || createdCustomWidgets.some(cw => cw.id === item.i)
    ));

    setPersonalState((prev) => ({
      ...prev,
      layouts: {
        ...prev.layouts,
        [activeBreakpoint]: sanitizePersonalLayoutItems(nextLayout.filter((it) => (
          personalWidgetIds.includes(it.i as PersonalWidgetId)
          || isTextBoxWidgetInstanceId(it.i)
        )), activeBreakpoint),
      },
    }));
  };

  const resizePersonalWidget = (widgetId: PersonalWidgetId, size: { height: number; width?: number }) => {
    setPersonalState((prev) => ({
      ...prev,
      layouts: workstationBreakpointKeys.reduce((layouts, breakpoint) => {
        const cols = workstationCols[breakpoint];
        layouts[breakpoint] = sanitizePersonalLayoutItems(
          prev.layouts[breakpoint].map((item) => {
            if (item.i !== widgetId) return item;
            const nextWidth = typeof size.width === 'number' ? Math.min(size.width, cols) : item.w;
            return {
              ...item,
              h: Math.max(size.height, item.minH ?? 1),
              w: Math.max(item.minW ?? 1, nextWidth),
            };
          }),
          breakpoint,
        );
        return layouts;
      }, {} as WorkstationResponsiveLayouts),
    }));
  };

  useEffect(() => {
    setWidgetPreferences((currentPreferences) => {
      if (currentPreferences.actionTracker?.viewMode === 'dashboard') return currentPreferences;
      return {
        ...currentPreferences,
        actionTracker: {viewMode: 'dashboard'},
      };
    });
    setPersonalState((prev) => {
      const targetWidth = 12;
      const targetHeight = 12;
      const needsResize = workstationBreakpointKeys.some((breakpoint) => {
        const item = prev.layouts[breakpoint].find((layoutItem) => layoutItem.i === 'action-tracker');
        return !item || item.w !== targetWidth || item.h !== targetHeight;
      });
      if (!needsResize) return prev;

      return {
        ...prev,
        layouts: workstationBreakpointKeys.reduce((layouts, breakpoint) => {
          const cols = workstationCols[breakpoint];
          layouts[breakpoint] = sanitizePersonalLayoutItems(
            prev.layouts[breakpoint].map((item) => {
              if (item.i !== 'action-tracker') return item;
              return {
                ...item,
                h: targetHeight,
                w: targetWidth,
              };
            }),
            breakpoint,
          );
          return layouts;
        }, {} as WorkstationResponsiveLayouts),
      };
    });
  }, [personalStorageKey]);

  const handlePersonalBreakpointChange = useCallback((newBreakpoint: string) => {
    if (!isWorkstationBreakpoint(newBreakpoint)) return;
    setActiveBreakpoint((currentBreakpoint) => (
      currentBreakpoint === newBreakpoint ? currentBreakpoint : newBreakpoint
    ));
  }, []);

  const openMyTaskExecution = (task: ConsolidatedTask) => {
    const nonce = Date.now();
    if (task.kind === 'changeover') {
      setChangeoverLauncherRequest({changeoverId: task.id === 'co-1' ? 'co-1' : undefined, nonce});
      return;
    }

    setCilCenterlineLauncherRequest({
      mode: task.kind === 'centerline' ? 'CL' : 'CIL',
      taskId: task.id,
      nonce,
    });
  };

  const openLineStatusScrapEscalation = () => {
    setActionCreateContext(null);
    setActionCreateSuggestionSeed({
      source: 'BLU.AI',
      title: 'Escalate scrap drift on Line 10',
      problem: 'Scrap is at 3.0%, above the 2.0% target on Line 10. Confirm containment with the operator, verify the recent stop reason, and escalate the follow-up for the current shift.',
      type: 'Corrective',
      category: 'COST',
      plant: 'Columbus West',
      area: 'Area A',
      unit: 'Unit A',
      line: 'Line 10',
      zone: 'Zone 2',
      machine: 'Z2 Tipper Unit',
      location: 'Columbus West / Area A / Unit A / Line 10 / Zone 2 / Z2 Tipper Unit',
      priority: 'High',
      assignedTo: 'Delila Bran',
      approver: 'Shift Leader',
      dueDate: 'May 12, 2026',
      aiAssisted: true,
      originRecordId: 'line-status-scrap-alert',
      originRecordLabel: 'Scrap out of target',
      originScreen: 'Operator Overview',
    });
    setIsActionCreateDrawerOpen(true);
  };

  const openMyTaskAiAssistant = (task: ConsolidatedTask, preserveConversation = false, openExecutionContext = true) => {
    if (!onOpenAiAssistant) return;

    type ExecutionAssistantStep = {
      id: string;
      code?: string;
      title: string;
      detail: string;
      priority: string;
      unit?: string;
      min?: number;
      target?: number;
      max?: number;
      requiresImageProof?: boolean;
    };
    const taskLabel = task.kind === 'changeover' ? 'Changeover' : task.code;
    const taskTypeLabel = task.kind === 'centerline' ? 'Centerline' : task.kind === 'cil' ? 'CIL' : 'Changeover';
    const centerlineExecutionSteps: ExecutionAssistantStep[] = [
      {id: 'clt-1', code: 'CL-1.1', title: 'Measure tipper main air pressure', detail: 'Measure tipper main air pressure at the regulator gauge before releasing the first morning lot.', priority: 'BAR', unit: 'bar', min: 4.9, target: 5.2, max: 5.5},
      {id: 'clt-2', code: 'CL-1.2', title: 'Verify tipper cycle speed', detail: 'Verify tipper cycle speed on the HMI at standard production rate.', priority: 'RPM', unit: 'rpm', min: 115, target: 120, max: 125},
      {id: 'clt-3', code: 'CL-1.3', title: 'Measure bearing housing temperature', detail: 'Measure bearing housing temperature after warm-up and attach the controller screen image.', priority: 'C', unit: 'C', min: 58, target: 62, max: 66, requiresImageProof: true},
    ];
    const executionSteps: ExecutionAssistantStep[] = task.kind === 'changeover'
      ? [
          {id: 'co-pre-1', code: 'CO-1.1', title: 'Pre-changeover readiness', detail: 'Prepare paperwork, materials, tooling, and the new work order before touching the setup.', priority: 'Start'},
          {id: 'lc-1', code: 'CO-2.1', title: 'Line clearance', detail: 'Verify the previous work order is cleared and capture image proof where required.', priority: 'Verification'},
          {id: 'co-down-1', code: 'CO-3.1', title: 'Line-down changeover', detail: 'Purge and complete internal tooling/material changes while the line is stopped.', priority: 'Internal'},
          {id: 'co-cl-1', code: 'CO-4.1', title: 'Centerline validation', detail: 'Measure and confirm the post-changeover settings are inside range.', priority: 'Validate'},
          {id: 'co-post-1', code: 'CO-5.1', title: 'Ramp-up notes', detail: 'Record release notes, issues, and final readiness before closing the changeover.', priority: 'Close'},
        ]
      : task.kind === 'centerline'
        ? centerlineExecutionSteps
        : [
            {id: 't-1', code: 'CIL-1.1', title: 'Central Pneumatic Air', detail: 'Inspect the main inlet pressure gauge and confirm the range is set before recording evidence.', priority: 'BAR', unit: 'bar', min: 4.9, target: 5.2, max: 5.5},
            {id: 't-2', code: 'CIL-1.2', title: 'Central Pneumatic Air hose check', detail: 'Inspect hoses for breaks or bends and upload image proof before completion.', priority: 'Image required', requiresImageProof: true},
            {id: 't-3', code: 'CIL-2.1', title: 'Pneumatic Air Central feed train', detail: 'Inspect the feed train air pressure gauge below the marking laser station.', priority: 'Check'},
            {id: 't-4', code: 'CIL-2.2', title: 'Pneumatic Air Central hose closeout', detail: 'Inspect hoses below the marking laser station and comment if the step cannot be completed.', priority: 'Close'},
          ];
    const firstStep = executionSteps[0];
    const formatStepTitle = (step: ExecutionAssistantStep) => step.code ? `${step.code} ${step.title}` : step.title;
    const formatRange = (step: ExecutionAssistantStep) => step.unit && step.min !== undefined && step.max !== undefined
      ? `Min: ${step.min} ${step.unit} | Target: ${step.target} ${step.unit} | Max: ${step.max} ${step.unit}`
      : '';
    const formatCardDetail = (step: ExecutionAssistantStep) => `${step.detail}${step.requiresImageProof ? ' Image proof is required before completion.' : ''}`;
    const buildStepInputProps = (step: ExecutionAssistantStep) => step.unit ? {
      inputStepId: step.id,
      inputCode: step.code,
      inputUnit: step.unit,
      inputPlaceholder: step.target !== undefined ? `${step.target}` : `Enter ${step.unit}`,
      inputLabel: `Enter ${step.code} ${step.unit}`,
      inputActionLabel: 'Complete',
      rangeLabel: formatRange(step),
      evidenceLabel: step.requiresImageProof ? 'Image Pending' : undefined,
    } : {};
    const buildExecutionCardProps = (step: ExecutionAssistantStep) => ({
      inputStepId: step.id,
      inputCode: step.code ?? step.title,
      ...buildStepInputProps(step),
    });
    const commentDraft = task.kind === 'changeover'
      ? `Pre-changeover readiness started for ${task.equipment}. Tools confirmed: ${task.reminderTools}.`
      : task.kind === 'centerline'
        ? `${firstStep.code} ${firstStep.title} checked for ${task.equipment}. Reading recorded and compared to standard range.`
        : `CIL step 1.1 started for ${task.equipment}. PPE/tools confirmed; inspecting main inlet pressure gauge.`;
    const taskScheduleText = `${task.date} at ${task.time}`;
    const taskOverviewText = `I found ${task.title}. It has ${executionSteps.length} steps and is expected at ${taskScheduleText}.`;
    const centerlineOpeningText = openExecutionContext
      ? `I opened ${task.title} and I am following the active modal step. Complete ${firstStep.code} in the modal or from this card; I will move to the next step only after this one is done.`
      : taskOverviewText;
    const genericOpeningText = openExecutionContext
      ? `I opened the ${taskLabel} execution in Workstation and I am following the active modal step. Work one step at a time here or in the modal; I will keep the guidance aligned with the formal execution record.`
      : taskOverviewText;
    const visibleOpeningSteps = [firstStep];
    const buildExecutionStepCard = (step: ExecutionAssistantStep, index: number) => ({
      id: `${task.id}-step-guide-${step.id}`,
      title: formatStepTitle(step),
      signal: index === 0 ? `Step ${index + 1}${step.unit ? ` - ${step.unit}` : ''}` : `${taskLabel}${step.unit ? ` - ${step.unit}` : ''}`,
      detail: formatCardDetail(step),
      rank: index + 1,
      priority: step.unit ? `Enter ${step.unit}` : step.priority,
      assignedTo: index === 0 ? task.role : undefined,
      accent: index === 0 ? tokenBrand.main : index === 1 ? tokenWarning.main : tokenInfo.main,
      ...buildExecutionCardProps(step),
    });
    const buildFirstStepFollowUpActions = () => [
      {
        label: 'Check instructions',
        category: 'Instructions',
        searchTerm: task.equipment,
        mode: 'execution-open-instructions' as const,
        stepId: firstStep.id,
      },
      {
        label: 'Draft comment for step 1',
        category: 'Comment',
        searchTerm: task.equipment,
        mode: 'execution-comment' as const,
        stepId: firstStep.id,
        commentText: commentDraft,
      },
      {
        label: 'Report issue in existing flow',
        category: 'Maintenance Request',
        searchTerm: task.equipment,
        mode: 'workstation-maintenance-request' as const,
        stepId: firstStep.id,
        description: `Issue found during ${taskLabel} step 1 for ${task.equipment}. Area: ${task.area}. Current task: ${formatStepTitle(firstStep)}. Observation: describe abnormal condition and attach execution evidence if available.`,
      },
    ];

    if (!openExecutionContext) {
      window.dispatchEvent(new CustomEvent('workstation:prepare-execution-chat-context', {
        detail: {
          mode: task.kind === 'changeover' ? 'Changeover' : task.kind === 'centerline' ? 'CL' : 'CIL',
          taskId: task.id,
        },
      }));
    }

    onOpenAiAssistant({
      contextTitle: `${taskTypeLabel} execution`,
      contextSubtitle: `${task.title} | ${task.area} | ${task.equipment}`,
      problemFilter: `${task.code} ${task.area} ${task.equipment}`,
      preserveConversation,
      executionGuide: {
        mode: task.kind === 'changeover' ? 'Changeover' : task.kind === 'centerline' ? 'Centerline' : 'CIL',
        taskId: task.id,
        steps: executionSteps.map((step) => ({
          id: step.id,
          code: step.code ?? step.title,
          title: step.title,
          detail: step.detail,
          unit: step.unit,
          min: step.min,
          target: step.target,
          max: step.max,
          requiresImageProof: step.requiresImageProof,
        })),
      },
      openingText: task.kind === 'centerline' ? centerlineOpeningText : genericOpeningText,
      openingCards: openExecutionContext
        ? visibleOpeningSteps.map((step, index) => buildExecutionStepCard(step, index))
        : [
            {
              id: `${task.id}-task-recap`,
              title: task.title,
              signal: `${taskTypeLabel} - ${task.status === 'in-progress' ? 'In Progress' : 'Pending'}`,
              detail: `${task.area} / ${task.equipment}. Expected: ${taskScheduleText}.`,
              rank: 1,
              dueDate: task.time,
              assignedTo: task.role,
              priority: `${executionSteps.length} steps`,
              accent: task.kind === 'cil' ? tokenInfo.main : task.kind === 'changeover' ? tokenBrand.main : tokenWarning.main,
            },
          ],
      quickActions: [
        {
          label: openExecutionContext ? `Guide ${firstStep.code ?? 'step 1'}` : `Help me perform this ${taskTypeLabel}`,
          prompt: openExecutionContext ? `Guide me through step 1 for ${task.title}.` : `Help me perform ${task.title}.`,
          response: `Let's do ${task.title} one step at a time.\n\nBefore starting: equipment is ${task.reminderEquipment}; tools are ${task.reminderTools}.\n\nStep 1 is ready below. Complete it first; then I will bring Step 2.`,
          responseCards: [
            buildExecutionStepCard(firstStep, 0),
          ],
        },
        {
          label: 'What evidence is needed?',
          prompt: `What evidence should I capture for ${task.title}?`,
          response: `Capture completion status, comments for abnormalities, and any required image proof. If a step cannot be completed, add a comment or report an issue before submitting.`,
          responseCards: [
            {
              id: `${task.id}-evidence`,
              title: 'Evidence checklist',
              signal: 'Execution proof',
              detail: 'Completed steps, abnormality notes, comments, and images when required.',
              rank: 1,
              priority: 'Required before submit',
              accent: tokenSuccess.main,
            },
          ],
        },
        {
          label: 'Report an issue',
          prompt: `Help me report an issue for ${task.title}.`,
          response: `If the condition is abnormal, use the Report Issue action on the active execution step. I can open the existing Maintenance Request entry and prefill task, area, equipment, step, observed condition, line state, and whether production can continue.`,
          responseCards: [
            {
              id: `${task.id}-issue`,
              title: 'Issue note starter',
              signal: task.equipment,
              detail: `Abnormal condition found during ${taskLabel}. Area: ${task.area}. Step: ${firstStep.title}. Tools used: ${task.reminderTools}.`,
              rank: 1,
              priority: 'If abnormal',
              accent: tokenWarning.main,
            },
          ],
          followUpActions: [
            {
              label: 'Report issue in existing flow',
              category: 'Maintenance Request',
              searchTerm: task.equipment,
              mode: 'workstation-maintenance-request',
              stepId: firstStep.id,
              description: `Abnormal condition found during ${taskLabel} for ${task.equipment}. Area: ${task.area}. Step: ${firstStep.title}. Tools used: ${task.reminderTools}. Please inspect and triage.`,
            },
          ],
        },
        {
          label: 'Add a comment',
          prompt: `Draft a comment for ${task.title}.`,
          response: `I drafted a concise execution comment for the active first step. Review it, then insert it on the matching step when it looks right.`,
          responseCards: [
            {
              id: `${task.id}-comment-draft`,
              title: 'Suggested comment',
              signal: firstStep.title,
              detail: commentDraft,
              rank: 1,
              priority: 'Draft',
              accent: tokenBrand.main,
            },
          ],
          followUpActions: [
            {
              label: 'Insert comment draft',
              category: 'Comment',
              searchTerm: task.equipment,
              mode: 'execution-comment',
              stepId: firstStep.id,
              commentText: commentDraft,
            },
          ],
        },
        {
          label: 'Consult documents',
          prompt: `Which documents should I consult for ${task.title}?`,
          response: `Start with the task Instructions button, then check the linked SOP, work instruction, and any images or videos attached to the step.`,
          followUpActions: [
            {label: 'Open Documents', category: 'Documents', searchTerm: task.equipment},
          ],
        },
      ],
    });
  };

  const openQuickActionAssistant = (action: 'support' | 'shift-swap') => {
    if (!onOpenAiAssistant) {
      onOpenLineLog();
      return;
    }

    if (action === 'support') {
      onOpenAiAssistant({
        contextTitle: 'Leader Support Request',
        contextSubtitle: 'Line escalation | Current shift',
        problemFilter: 'leader support escalation',
        openingText: 'I can help structure a concise leader support request with equipment, issue, priority, and next action.',
        autoRunActionIndex: 0,
        quickActions: [
          {
            label: 'Draft request',
            prompt: 'Draft a leader support request for the current line.',
            response: 'Use a short request: what is happening, where it is happening, impact to safety/quality/delivery, and what decision or help is needed from the leader.',
            responseCards: [
              {
                id: 'leader-support-request',
                title: 'Support request starter',
                signal: 'Leader escalation',
                detail: 'Line needs support decision, owner confirmation, or cross-functional help during the current shift.',
                rank: 1,
                priority: 'Now',
                accent: tokenInfo.main,
              },
            ],
          },
          {
            label: 'Set priority',
            prompt: 'Help me decide the priority for this support request.',
            response: 'Mark it urgent when the line is stopped, safety or quality is at risk, or the team needs a decision before the next handoff.',
          },
        ],
      });
      return;
    }

    onOpenAiAssistant({
      contextTitle: 'Shift Swap Request',
      contextSubtitle: 'People coverage | Current schedule',
      problemFilter: 'shift swap coverage',
      openingText: 'I can help prepare a shift swap request with coverage impact, proposed replacement, and approval note.',
      autoRunActionIndex: 0,
      quickActions: [
        {
          label: 'Draft swap note',
          prompt: 'Draft a shift swap request for my leader.',
          response: 'Include your current shift, requested swap date/time, proposed replacement, reason, and whether required skills or line coverage stay protected.',
          responseCards: [
            {
              id: 'shift-swap-request',
              title: 'Shift swap starter',
              signal: 'Coverage request',
              detail: 'Confirm the proposed replacement, required qualifications, and whether the target line remains covered.',
              rank: 1,
              priority: 'Approval needed',
              accent: tokenBrand.main,
            },
          ],
        },
        {
          label: 'Check coverage',
          prompt: 'What should I check before sending the shift swap request?',
          response: 'Verify role qualifications, line assignment, overtime impact, planned training, and any maintenance or changeover windows in the target shift.',
        },
      ],
    });
  };

  useEffect(() => {
    const handleStartMyTask = (event: Event) => {
      const detail = (event as CustomEvent<{
        taskId?: string;
        kind?: ConsolidatedTask['kind'];
        withAi?: boolean;
        preserveAiConversation?: boolean;
        openExecution?: boolean;
      }>).detail;
      const task = consolidatedTasks.find((item) => item.id === detail?.taskId)
        ?? consolidatedTasks.find((item) => item.kind === detail?.kind && item.status !== 'completed')
        ?? consolidatedTasks.find((item) => item.status === 'in-progress')
        ?? consolidatedTasks.find((item) => item.status === 'pending');

      if (!task) return;
      if (detail?.openExecution !== false) {
        openMyTaskExecution(task);
      }
      if (detail?.withAi !== false) {
        openMyTaskAiAssistant(task, Boolean(detail?.preserveAiConversation), detail?.openExecution !== false);
      }
    };

    window.addEventListener(MY_TASKS_START_TASK_EVENT, handleStartMyTask);
    return () => window.removeEventListener(MY_TASKS_START_TASK_EVENT, handleStartMyTask);
  }, [openMyTaskAiAssistant, openMyTaskExecution]);

  const addLossFocusedMetric = (metricId: LossFocusedMetricId) => {
    setPersonalState((prev) => ({
      ...prev,
      lossFocusedMetricIds: prev.lossFocusedMetricIds.includes(metricId)
        ? prev.lossFocusedMetricIds.filter((item) => item !== metricId)
        : lossFocusedMetricCatalogOrder.filter((item) => item === metricId || prev.lossFocusedMetricIds.includes(item)),
    }));
  };

  const renderPersonalWidget = (widgetId: string) => {
    if (widgetId === 'line-status-overview') {
      return (
        <WorkstationLineStatusOverviewWidget
          data={data}
          onEscalateScrapAlert={openLineStatusScrapEscalation}
          onOpenLineLog={onOpenLineLog}
          onOpenNextCilActivity={() => setLineStatusAssistTask(lineStatusCilActivityTask)}
          onStartNextCenterline={() => setCilCenterlineLauncherRequest({mode: 'CL', taskId: 'cl-2', nonce: Date.now()})}
        />
      );
    }
    if (widgetId === 'safety-operator') return <WorkstationSqdcOperatorWidget kind="safety" onExpand={() => setIsSafetyExpanded(true)} />;
    if (widgetId === 'quality-operator') return <WorkstationSqdcOperatorWidget kind="quality" onExpand={() => setIsQualityExpanded(true)} />;
    if (widgetId === 'oee-monitoring') return <OEEMonitoringWidget />;
    if (widgetId === 'three-d-view') return <Workstation3DViewComponent onExpand={onOpenLineLog} onOpenAiAssistant={onOpenAiAssistant} selectedHeaderHierarchyId={selectedHeaderHierarchyId} />;
    if (widgetId === 'oee-line-overview') return <OEELineOverviewWidget />;
    if (widgetId === 'oee-top-losses') return <OEETopLossesWidget onExpand={() => { }} />;
    if (isTextBoxWidgetInstanceId(widgetId)) {
      const textBoxValue = widgetId === textBoxWidgetTemplateId
        ? widgetPreferences.textBox
        : widgetPreferences.textBoxes?.[widgetId];
      return (
        <TextBoxWidget
          value={textBoxValue}
          onChange={(textBox) => {
            setWidgetPreferences((currentPreferences) => {
              if (widgetId === textBoxWidgetTemplateId) {
                return {
                  ...currentPreferences,
                  textBox,
                };
              }

              return {
                ...currentPreferences,
                textBoxes: {
                  ...currentPreferences.textBoxes,
                  [widgetId]: textBox,
                },
              };
            });
          }}
        />
      );
    }
    if (widgetId === 'operator-cil-centerline') return <WorkstationCilCenterlineWidget onOpenFullScreen={() => setCurrentScreen('cil_centerline_operator')} />;
    if (widgetId === 'operator-cil') return <WorkstationCilCenterlineWidget flowMode="CIL" titleOverride="CIL Operator" onOpenFullScreen={() => setCurrentScreen('cil_operator')} />;
    if (widgetId === 'operator-centerline') return <WorkstationCilCenterlineWidget flowMode="CL" titleOverride="Centerline Operator" onOpenFullScreen={() => setCurrentScreen('centerline_operator')} />;
    if (widgetId === 'cil') return <WorkstationCilCenterlineWidget flowMode="CIL" titleOverride="CIL" onOpenFullScreen={() => setCurrentScreen('cil_kpis')} />;
    if (widgetId === 'centerline') return <WorkstationCilCenterlineWidget flowMode="CL" titleOverride="Centerline" onOpenFullScreen={() => setCurrentScreen('centerline_kpis')} />;
    if (widgetId === 'leader-cil') return <WorkstationCilCenterlineWidget flowMode="CIL" titleOverride="CIL Leader" reviewMode="line-leader" />;
    if (widgetId === 'leader-centerline') return <WorkstationCilCenterlineWidget flowMode="CL" titleOverride="Centerline Leader" reviewMode="line-leader" />;
    if (widgetId === 'operator-equipment-changeover') return <WorkstationEquipmentChangeoverWidget titleOverride="Equipment Setup Changeover Operator" onOpenFullScreen={() => setCurrentScreen('equipment_changeover_operator')} />;
    if (widgetId === 'equipment-changeover') return <WorkstationEquipmentChangeoverWidget titleOverride="Equipment Setup Changeover" onOpenFullScreen={() => setCurrentScreen('equipment_changeover')} />;
    if (widgetId === 'leader-equipment-changeover') return <WorkstationEquipmentChangeoverWidget titleOverride="Equipment Setup Changeover Leader" reviewMode="line-leader" />;
    if (widgetId === 'work-orders') return <WidgetWorkOrders currentUserName={currentUserName} onExpand={() => onOpenMaintenance('calendar')} onOpenContextualization={onOpenContextualization} />;
    if (widgetId === 'my-maintenance-backlog') return <MyMaintenanceBacklogWidget onOpenMaintenance={onOpenMaintenance} onOpenContextualization={onOpenContextualization} />;
    if (widgetId === 'maintenance-hub') return <MaintenanceHubWidget onExpand={() => onOpenMaintenance('followup')} />;
    if (widgetId === 'maintenance-planner') return <MaintenancePlannerWidget onExpand={() => onOpenMaintenance('planner')} />;
    if (widgetId === 'maintenance-calendarwidget') return <MaintenanceCalendarWidget currentUserName={currentUserName} onExpand={() => onOpenMaintenance('calendar')} />;
    if (widgetId === 'equipment-status') return <EquipmentStatusWidget onExpand={() => onOpenMaintenance('equipment-ledger')} />;
    if (widgetId === 'maintenance-analytics') return <MaintenanceAnalyticsWidget onExpand={() => onOpenMaintenance('performance')} />;
    if (widgetId === 'molding') return <MoldingWidget onExpand={() => onOpenMaintenance('performance')} />;
    if (widgetId === 'maintenance-cbm-pdm') return <MaintenanceCbmPdmWidget onExpand={() => onOpenMaintenance('cbm-pdm')} />;
    if (widgetId === 'spare-parts-monitor') return <SparePartsMonitorWidget onExpand={() => onOpenMaintenance('spareParts')} />;
    if (widgetId === 'shift-logbook') return <ShiftLogBookWidget onExpand={onOpenLineLog} />;
    if (widgetId === 'production-planning') return <MyProductionPlanningWidget onExpand={() => setIsProductionPlanningExpanded(true)} />;
    if (widgetId === 'shift-schedule') return <MyShiftScheduleWidget />;
    if (widgetId === 'shift-schedule-leader') return <ShiftScheduleLeaderWidget onExpand={onOpenLineLog} />;
    if (widgetId === 'scrap') return <MyScrapWidget />;
    if (widgetId === 'my-tasks') {
      return (
        <MyTasksWidget
          onOpenAiForTask={(task) => {
            openMyTaskAiAssistant(task, false, false);
          }}
          onStartTask={openMyTaskExecution}
        />
      );
    }
    if (widgetId === 'my-activities-kpis') return <MyActivitiesKpisWidget />;
    if (widgetId === 'my-esos') return <MyEsosWidget onCreateEso={onOpenEsoEntry} />;
    if (widgetId === 'shift-production') {
      return <MyShiftProductionWidget onViewModeChange={(viewMode) => resizePersonalWidget('shift-production' as PersonalWidgetId, viewMode === 'table' ? { width: 6, height: 6 } : { width: 5, height: 5 })} />;
    }
    if (widgetId === 'delivery') {
      return (
        <MyDeliveryWidget
          breakdownBy={widgetPreferences.delivery?.breakdownBy ?? 'line'}
          dashboardShift={chartFilters?.shift}
          dashboardTimeframe={chartFilters?.timeframe}
          onExpand={() => setIsDeliveryExpanded(true)}
          onOpenProductionDelivery={() => setIsProductionDeliveryModalOpen(true)}
          onBreakdownByChange={(mode) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              delivery: {
                ...currentPreferences.delivery,
                breakdownBy: mode,
                showBreakdown: currentPreferences.delivery?.showBreakdown ?? true,
                showCurrentOrderCard: currentPreferences.delivery?.showCurrentOrderCard,
              },
            }));
          }}
          onShowBreakdownChange={(show) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              delivery: {
                ...currentPreferences.delivery,
                breakdownBy: currentPreferences.delivery?.breakdownBy ?? 'line',
                showBreakdown: show,
                showCurrentOrderCard: currentPreferences.delivery?.showCurrentOrderCard,
              },
            }));
          }}
          onChartTypeChange={(type) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              delivery: {
                ...currentPreferences.delivery,
                chartType: type,
              },
            }));
          }}
          showBreakdown={widgetPreferences.delivery?.showBreakdown ?? true}
          showCurrentOrderCard={hideDeliveryCurrentOrderCard ? false : widgetPreferences.delivery?.showCurrentOrderCard ?? true}
          tierOverviewLabel={useTierSqdcCarousel ? tierOverviewLabel : undefined}
          overviewItemPrefix={useTierSqdcCarousel ? tierOverviewItemPrefix : undefined}
          enableLineOverviewDrilldown={useTierSqdcCarousel}
          chartType={widgetPreferences.delivery?.chartType}
        />
      );
    }
    if (widgetId === 'shift-oee') return <MyShiftOeeWidget onExpand={() => setIsShiftOeeExpanded(true)} />;
    if (widgetId === 'machine-utilization') return <MyMachineUtilizationWidget onExpand={() => setIsMachineUtilizationExpanded(true)} />;
    if (widgetId === 'hourly-scrap') return <MyHourlyScrapWidget />;
    if (widgetId === 'downtime') return <MyDowntimeWidget onOpenDowntimeAnalysis={() => setIsDowntimeAnalysisModalOpen(true)} />;
    if (widgetId === 'zone-performance') return <MyZonePerformanceWidget />;
    if (widgetId === 'safety') {
      return (
        <MySafetyWidget
          onExpand={() => setIsSafetyExpanded(true)}
          onGenerateAiSafetyReport={onOpenSafetyAiReport}
          onOpenSeriousInjury={() => setIsSeriousInjuryModalOpen(true)}
          useTierCarousel={useTierSqdcCarousel}
          overviewLabel={tierOverviewLabel}
          overviewItemPrefix={tierOverviewItemPrefix}
          tier1SeriousInjuryIncidentActive={tier1SeriousInjuryIncidentActive}
        />
      );
    }
    if (widgetId === 'eso') return <MyEsoWidget onCreateEso={onOpenEsoEntry} onExpand={() => setIsEsoExpanded(true)} />;
    if (widgetId === 'quality') return <MyQualityWidget onExpand={() => setIsQualityExpanded(true)} useTierCarousel={useTierSqdcCarousel} overviewLabel={tierOverviewLabel} overviewItemPrefix={tierOverviewItemPrefix} />;
    if (widgetId === 'quick-actions') {
      return (
        <MyQuickActionsWidget
          onRequestShiftSwap={() => openQuickActionAssistant('shift-swap')}
        />
      );
    }
    if (widgetId === 'action-tracker') {
      return (
        <MyActionTrackerWidget
          onViewModeChange={(viewMode) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              actionTracker: { viewMode },
            }));
            resizePersonalWidget('action-tracker', viewMode === 'dashboard' ? { width: 12, height: 12 } : { width: 12, height: 6 });
          }}
          onExpand={(viewMode) => {
            openActionTrackerScreen({
              view: viewMode === 'board' ? 'kanban' : 'table',
            });
          }}
          viewMode={displayedActionTrackerViewMode}
        />
      );
    }
    if (widgetId === 'top-losses') return <MyTopLossesWidget />;
    if (widgetId === 'three-p-tracking') return <MyThreePTrackingWidget />;
    if (widgetId === 'loss-focused-kpis') {
      return (
        <MyLossFocusedKpisWidget
          activeMetricIds={activeLossFocusedMetricIds}
          chartType={widgetPreferences.lossFocusedKpis?.chartType ?? 'lines'}
          meetingTopics={meetingTopics}
          onChartTypeChange={(chartType) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              lossFocusedKpis: { chartType },
            }));
          }}
          onToggleMetric={addLossFocusedMetric}
          onExpand={() => setIsLossFocusedKpisExpanded(true)}
        />
      );
    }
    if (widgetId === 'communication') return <MyCommunicationWidget />;
    if (widgetId === 'recognition') return <MyRecognitionWidget />;
    if (widgetId === 'people') {
      return (
        <MyPeopleWidget
          breakdownBy={widgetPreferences.people?.breakdownBy ?? 'line'}
          dashboardShift={chartFilters?.shift}
          dashboardTimeframe={chartFilters?.timeframe}
          onExpand={() => setIsPeopleExpanded(true)}
          useTierCarousel={useTierSqdcCarousel}
          overviewLabel={tierOverviewLabel}
          overviewItemPrefix={tierOverviewItemPrefix}
          onBreakdownByChange={(mode) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              people: {
                ...currentPreferences.people,
                breakdownBy: mode,
                showBreakdown: currentPreferences.people?.showBreakdown ?? true,
              },
            }));
          }}
          onShowBreakdownChange={(show) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              people: {
                ...currentPreferences.people,
                breakdownBy: currentPreferences.people?.breakdownBy ?? 'line',
                showBreakdown: show,
              },
            }));
          }}
          onChartTypeChange={(type) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              people: {
                ...currentPreferences.people,
                chartType: type,
              },
            }));
          }}
          showBreakdown={widgetPreferences.people?.showBreakdown ?? true}
          chartType={widgetPreferences.people?.chartType}
        />
      );
    }
    if (widgetId === 'cost') {
      return (
        <MyCostWidget
          breakdownBy={widgetPreferences.cost?.breakdownBy ?? 'line'}
          dashboardShift={chartFilters?.shift}
          dashboardTimeframe={chartFilters?.timeframe}
          onExpand={() => setIsCostExpanded(true)}
          onOpenDowntimeAnalysis={() => setIsDowntimeAnalysisModalOpen(true)}
          onBreakdownByChange={(mode) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              cost: {
                ...currentPreferences.cost,
                breakdownBy: mode,
                showBreakdown: currentPreferences.cost?.showBreakdown ?? true,
              },
            }));
          }}
          onShowBreakdownChange={(show) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              cost: {
                ...currentPreferences.cost,
                breakdownBy: currentPreferences.cost?.breakdownBy ?? 'line',
                showBreakdown: show,
              },
            }));
          }}
          onChartTypeChange={(type) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              cost: {
                ...currentPreferences.cost,
                chartType: type,
              },
            }));
          }}
          showBreakdown={widgetPreferences.cost?.showBreakdown ?? true}
          chartType={widgetPreferences.cost?.chartType}
          stackedCharts={initialSnapshot?.widgetPreferences?.cost?.stackedCharts ?? widgetPreferences.cost?.stackedCharts}
          showChartCarouselControls={useTierSqdcCarousel}
          showStackedChartControls={initialSnapshot?.widgetPreferences?.cost?.showStackedChartControls ?? true}
          totalScrapProducedOverride={tierBoardCostData?.totalScrapProduced}
          targetOverride={tierBoardCostData?.target}
          scrapValuesOverride={tierBoardCostData?.scrapValues}
          tierOverviewLabel={useTierSqdcCarousel ? tierOverviewLabel : undefined}
          overviewItemPrefix={useTierSqdcCarousel ? tierOverviewItemPrefix : undefined}
        />
      );
    }
    if (widgetId === 'escalation-tags') {
      return (
        <MyActionTrackerWidget
          defaultIssueView="openIssues"
          onViewModeChange={(viewMode) => {
            setWidgetPreferences((currentPreferences) => ({
              ...currentPreferences,
              actionTracker: { viewMode },
            }));
          }}
          onExpand={(viewMode) => {
            openActionTrackerScreen({
              view: viewMode === 'board' ? 'kanban' : 'table',
            });
          }}
          viewMode={actionTrackerViewMode}
        />
      );
    }
    if (widgetId === 'tier-management') return <MyTierManagementWidget />;

    // Standard Workstation Widgets
    if (widgetId === 'oee-performance') {
      return (
        <WidgetShell title="OEE Performance" noPadding>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))' }, gap: 1.2 }}>
              {performanceMetricCards.map((item) => (
                <Box key={item.widgetId}>
                  {item.widgetId === 'oee-kpi'
                    ? renderOeeTrendCard()
                    : item.widgetId === 'availability-kpi'
                      ? renderAvailabilityTrendCard()
                      : item.widgetId === 'performance-kpi'
                        ? renderPerformanceTrendCard()
                        : item.widgetId === 'quality-kpi'
                          ? renderQualityTrendCard()
                          : renderTierMetricCard({ accent: item.tone, label: item.label, value: item.value })}
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 0.9fr' }, gap: 2 }}>
              {renderShiftExecutionCard()}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
                {summarySupportCards.map((item) => (
                  <Box key={item.widgetId}>
                    {item.widgetId === 'fpy-kpi'
                      ? renderFpyTrendCard()
                      : item.widgetId === 'scrap-kpi'
                        ? renderScrapTrendCard()
                        : item.widgetId === 'downtime-kpi'
                          ? renderDowntimeTrendCard()
                          : item.widgetId === 'energy-unit-kpi'
                            ? renderEnergyUnitTrendCard()
                            : renderTierMetricCard({ accent: item.widgetId === 'energy-unit-kpi' ? '#044ED7' : '#5CC96B', label: item.label, value: item.value, note: item.note })}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </WidgetShell>
      );
    }

    if (widgetId === 'output-vs-plan') {
      return (
        <WidgetShell title="Output vs Plan">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minHeight: 0, height: '100%' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 1 }}>
              {[
                { label: 'Shift gap', value: `${formatCompact(Math.max(summary.shiftTarget - summary.currentOutput, 0))} units` },
                { label: 'Daily target', value: formatCompact(summary.dailyTarget) },
                { label: 'Throughput target', value: `${formatCompact(summary.targetThroughputPerHour)}/h` },
              ].map((item) => (
                <Paper key={item.label} elevation={0} sx={{ ...workstationTierInsetCardSx, p: 1.05, backgroundImage: workstationVisuals.tierPanelBackground }}>
                  <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    {item.label}
                  </Typography>
                  <Typography sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 900, mt: 0.35 }}>
                    {item.value}
                  </Typography>
                </Paper>
              ))}
            </Box>
            <WorkstationAutoChartArea maxHeight={240}>
              {(chartHeight) => (
                <BarChart
                  height={chartHeight}
                  hideLegend
                  xAxis={[{
                    data: outputByShift.map((item) => item.label),
                    scaleType: 'band',
                    tickLabelStyle: { fill: workstationVisuals.tierAxis, fontSize: 9 },
                  }]}
                  yAxis={[{ tickLabelStyle: { fill: workstationVisuals.tierAxis, fontSize: 9 } }]}
                  series={[
                    { data: outputByShift.map((item) => Number(item.actual)), label: 'Actual', color: workstationChartSemantic.neutral },
                    { data: outputByShift.map((item) => Number(item.planned)), label: 'Planned', color: workstationChartSemantic.target },
                  ] as any}
                  margin={{ top: 12, right: 12, bottom: 24, left: 32 }}
                  grid={{ horizontal: true }}
                  sx={workstationTierChartSx}
                />
              )}
            </WorkstationAutoChartArea>
          </Box>
        </WidgetShell>
      );
    }

    if (widgetId === 'downtime-overview') {
      return (
        <WidgetShell title="Downtime Overview">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
            {renderTierMetricCard({
              accent: '#FF5A52',
              label: 'Active loss',
              value: `${summary.downtimeMinutes} min`,
              note: 'Largest stop is electrode replacement on Welding 3.',
            })}
            {topDowntimeCauses.slice(0, 3).map((cause) => (
              <Box key={cause.label}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.45 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: '#1F2366' }}>{cause.label}</Typography>
                  <Typography variant="caption" sx={{ color: '#626465', fontWeight: 700 }}>{cause.minutes} min</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Number(cause.percentage)}
                  sx={{ height: 8, borderRadius: 999, bgcolor: '#FEE2E2', '& .MuiLinearProgress-bar': { borderRadius: 999, bgcolor: '#EF4444' } }}
                />
              </Box>
            ))}
          </Box>
        </WidgetShell>
      );
    }

    if (widgetId === 'machine-health') {
      return (
        <WidgetShell title="Machine Health">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.8fr 1.4fr', gap: 1, px: 0.4 }}>
              {['Machine', 'Status', 'OEE', 'Downtime', 'Last stop'].map((label) => (
                <Typography key={label} variant="caption" sx={{ color: '#64748B', fontWeight: 800 }}>{label}</Typography>
              ))}
            </Box>
            {machinePerformance.map((row) => (
              <Paper
                key={row.machine}
                elevation={0}
                onClick={() => {
                  if (cycleTimeVsTarget[row.machine]) {
                    setSelectedCycleTarget(row.machine);
                  }
                }}
                sx={{
                  p: 1.2,
                  borderRadius: 2.5,
                  bgcolor: selectedCycleTarget === row.machine ? '#EEF4FF' : '#F8FAFC',
                  border: selectedCycleTarget === row.machine ? '1px solid #DBEAFE' : '1px solid #E2E8F0',
                  cursor: cycleTimeVsTarget[row.machine] ? 'pointer' : 'default',
                }}
              >
                <Box sx={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 0.8fr 0.8fr 1.4fr', gap: 1, alignItems: 'center' }}>
                  <Typography sx={{ fontWeight: 700, color: '#1F2366' }}>{row.machine}</Typography>
                  <Chip size="small" label={row.status} sx={{ fontWeight: 800, bgcolor: row.statusBackground, color: row.statusColor, border: '1px solid #E2E8F0' }} />
                  <Typography variant="body2" sx={{ color: '#334155', fontWeight: 700 }}>{row.oee}</Typography>
                  <Typography variant="body2" sx={{ color: '#334155' }}>{row.downtime}</Typography>
                  <Typography variant="caption" sx={{ color: '#475569' }}>{row.lastStop}</Typography>
                </Box>
              </Paper>
            ))}
          </Box>
        </WidgetShell>
      );
    }

    if (widgetId === 'traceability-preview') {
      return (
        <WidgetShell title="Traceability">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {traceabilityHistory.slice(-5).reverse().map((event, index) => (
              <Box key={`${event.timestamp}-${event.id}`}>
                <Box
                  onClick={() => {
                    const nextItemType = getSelectedItemTypeFromEntity(event.entity);
                    if (nextItemType) setSelectedItemType(nextItemType as any);
                  }}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '88px 1.1fr auto',
                    gap: 1.2,
                    alignItems: 'center',
                    cursor: getSelectedItemTypeFromEntity(event.entity) ? 'pointer' : 'default',
                    borderRadius: 2,
                    px: 0.6,
                    py: 0.4,
                    '&:hover': getSelectedItemTypeFromEntity(event.entity) ? { bgcolor: '#F8FAFC' } : undefined,
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800 }}>{event.timestamp}</Typography>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, color: '#1F2366' }}>{event.event}</Typography>
                    <Typography variant="caption" sx={{ color: '#626465', display: 'block', mt: 0.15 }}>{event.entity} | {event.id} | {event.machine}</Typography>
                  </Box>
                  <Chip size="small" label={event.status} sx={{ fontWeight: 800, bgcolor: event.statusBackground, color: event.statusColor, border: '1px solid #E2E8F0' }} />
                </Box>
                {index < 4 ? <Divider sx={{ mt: 1 }} /> : null}
              </Box>
            ))}
          </Box>
        </WidgetShell>
      );
    }

    if (widgetId === 'operational-metrics') {
      return (
        <WidgetShell title="Operational Metrics">
          <WorkstationSeriesLineWidget
            labels={operationalMetrics.map((item) => String(item.label))}
            series={[
              { id: 'availability', label: 'Availability', color: workstationChartSemantic.good, data: operationalMetrics.map((item) => Number(item.availability)) },
              { id: 'oee', label: 'OEE', color: workstationChartSemantic.neutral, data: operationalMetrics.map((item) => Number(item.oee)) },
              { id: 'quality', label: 'Quality', color: workstationChartSemantic.neutral, data: operationalMetrics.map((item) => Number(item.quality)) },
              { id: 'performance', label: 'Performance', color: workstationChartSemantic.good, data: operationalMetrics.map((item) => Number(item.performance)) },
            ]}
            summaryItems={[
              { label: 'Latest OEE', value: `${summary.oee}%`, tone: workstationChartSemantic.neutral },
              { label: 'Latest availability', value: `${summary.availability}%`, tone: workstationChartSemantic.good },
              { label: 'Latest quality', value: `${summary.quality}%`, tone: workstationChartSemantic.neutral },
            ]}
            yMin={60}
          />
        </WidgetShell>
      );
    }

    if (widgetId === 'shift-execution') return <WidgetShell noPadding><Box sx={{ height: '100%' }}>{renderShiftExecutionCard({ compact: false, fillHeight: true })}</Box></WidgetShell>;
    if (widgetId === 'oee-kpi') return renderOeeTrendCard();
    if (widgetId === 'performance-kpi') return renderPerformanceTrendCard();
    if (widgetId === 'quality-kpi') return renderQualityTrendCard();
    if (widgetId === 'availability-kpi') return renderAvailabilityTrendCard();
    if (widgetId === 'fpy-kpi') return renderFpyTrendCard();
    if (widgetId === 'scrap-kpi') return renderScrapTrendCard();
    if (widgetId === 'downtime-kpi') return renderDowntimeTrendCard();
    if (widgetId === 'energy-unit-kpi') return renderEnergyUnitTrendCard();

    // Fallback for standard widgets that might use common components
    if (widgetId === 'selected-item-details') return <WorkstationSelectedItemDetailsWidget selectedItemType={selectedItemType} selectedItems={selectedItems} traceabilityHistory={traceabilityHistory} onSelectItemType={setSelectedItemType} />;
    if (widgetId === 'cycle-time-target') return <WorkstationCycleTimeTargetWidget cycleTimeVsTarget={cycleTimeVsTarget} selectedTarget={selectedCycleTarget} onSelectTarget={setSelectedCycleTarget} />;
    if (widgetId === 'output-trend-hourly') return <WorkstationHourlyOutputWidget hourlyOutput={hourlyOutput} targetThroughputPerHour={summary.targetThroughputPerHour} />;
    if (widgetId === 'top-downtime-causes') return <WorkstationTopDowntimeCausesWidget topDowntimeCauses={topDowntimeCauses} />;
    if (widgetId === 'operator-tasks') {
      return (
        <WorkstationRankedMetricWidget
          title="Operator Tasks"
          items={operatorTasks.map(t => ({
            label: t.title,
            value: t.dueLabel,
            progress: t.priority === 'HIGH' ? 100 : t.priority === 'MEDIUM' ? 60 : 30,
            tone: t.priority === 'HIGH' ? '#EF4444' : t.priority === 'MEDIUM' ? '#F59E0B' : '#3B82F6'
          }))}
        />
      );
    }
    if (widgetId === 'andon-actions') {
      return (
        <WorkstationRankedMetricWidget
          title="Andon Actions"
          items={escalationActions.map(a => ({
            label: a.label,
            value: 'Active',
            progress: 100,
            tone: a.tone
          }))}
        />
      );
    }
    if (widgetId === 'material-risks') {
      return (
        <WorkstationRankedMetricWidget
          title="Material Risks"
          items={materialRisks.map(r => ({
            label: r.label,
            value: r.timeLabel,
            progress: r.progressPercent,
            tone: r.tone,
            detail: r.detail
          }))}
        />
      );
    }
    if (widgetId === 'output-trend') {
      return (
        <WorkstationSeriesLineWidget
          title="Output Trend"
          labels={outputTrend.map(item => String(item.label))}
          series={[{ id: 'output', label: 'Output', color: workstationChartSemantic.neutral, data: outputTrend.map(item => Number(item.actual)) }]}
          summaryItems={[{ label: 'Current Total', value: summary.currentOutput.toLocaleString(), tone: workstationChartSemantic.neutral }]}
        />
      );
    }
    if (widgetId === 'scrap-trend') {
      return (
        <WorkstationSeriesLineWidget
          title="Scrap Trend"
          labels={scrapTrend.map(item => String(item.label))}
          series={[{ id: 'scrap', label: 'Scrap', color: workstationChartSemantic.bad, data: scrapTrend.map(item => Number(item.scrap)) }]}
          summaryItems={[{ label: 'Latest Rate', value: `${summary.scrapRate}%`, tone: workstationChartSemantic.bad }]}
        />
      );
    }
    if (widgetId === 'inbound_sla_chart') return <InboundSlaWidget />;
    if (widgetId === 'active_loads_timeline') return <ActiveLoadsTimelineWidget />;
    if (widgetId === 'line_shortage_risk') return <LineShortageRiskWidget />;
    if (widgetId === 'spacex_shipping_gating') return <SpaceXShippingGatingWidget />;
    if (widgetId === 'prioritized_decision_queue') return <PrioritizedDecisionQueue />;
    if (widgetId === 'spacex_shipping_gating_console') return <SpaceXShippingGatingConsole />;
    if (widgetId === 'sterilization_loads_timeline') return <SterilizationLoadsTimelineWidget />;
    if (widgetId === 'inbound_sla_chart_v2') return <InboundSlaChartWidget />;
    if (widgetId === 'atlas_ai_prescriptive_panel') return <AtlasAiPrescriptivePanel />;

    return null;
  };

  const customMetricOptions = customWidgetDataset ? customWidgetMetricOptions[customWidgetDataset] : [];
  const customWidgetTitle = customWidgetDataset === 'Production' && customWidgetMetrics.some((metric) => metric.includes('OEE'))
    ? 'Production vs OEE'
    : customWidgetDataset
      ? `${customWidgetDataset} Custom Widget`
      : 'Custom Widget';

  function createCustomWidgetPreviewSnapshot(patch: Partial<CustomCreatedWidget> = {}): CustomCreatedWidget {
    const fallbackDataset: CustomWidgetDataset = customWidgetDataset ?? 'Production';
    const baseWidget = activeCustomWidget ?? {
      id: activeCustomWidgetId ?? 'custom-widget-draft',
      title: customWidgetTitle,
      dataset: fallbackDataset,
      metrics: customWidgetMetrics.length ? customWidgetMetrics : customWidgetMetricOptions[fallbackDataset].slice(0, 2),
      visualization: customWidgetVisualization ?? 'Big Number',
      filters: customWidgetFiltersSelected.length ? customWidgetFiltersSelected : ['Site', 'Line'],
    };

    return {
      ...baseWidget,
      ...patch,
      metrics: patch.metrics ?? baseWidget.metrics,
      filters: patch.filters ?? baseWidget.filters,
    };
  }

  function appendCustomWidgetEditExchange(userText: string, assistantText: string, widget: CustomCreatedWidget) {
    const idBase = `${Date.now()}-${Math.round(Math.random() * 1000)}`;
    const typingId = `edit-typing-${idBase}`;
    const isDraftWidget = !activeCustomWidgetId;
    setCustomWidgetEditTranscript((prev) => [
      ...prev,
      { id: `edit-user-${idBase}`, role: 'user', text: userText },
      { id: typingId, role: 'typing' },
    ]);
    window.setTimeout(() => {
      setCustomWidgetEditTranscript((prev) => [
        ...prev.filter((item) => item.id !== typingId),
        { id: `edit-assistant-${idBase}`, role: 'assistant', text: assistantText },
        { id: `edit-preview-${idBase}`, role: 'preview', widget, showActions: isDraftWidget },
      ]);
    }, 680);
  }

  const renderOptionButton = ({
    isSelected,
    label,
    onClick,
  }: {
    isSelected: boolean;
    label: string;
    onClick: () => void;
  }) => (
    <Button
      key={label}
      size="small"
      variant="outlined"
      onClick={onClick}
      sx={{
        minHeight: 30,
        px: 1.15,
        py: 0.45,
        borderRadius: 999,
        fontSize: 11.5,
        lineHeight: 1.1,
        textTransform: 'none',
        fontWeight: 900,
        bgcolor: isSelected ? '#EAF2FF !important' : '#FFFFFF !important',
        color: isSelected ? '#044ED7 !important' : '#1D4ED8 !important',
        borderColor: isSelected ? '#7EA7FF !important' : '#C9DAFF !important',
        boxShadow: isSelected ? '0 0 0 2px rgba(11, 99, 229, 0.08)' : '0 1px 2px rgba(15, 23, 42, 0.04)',
        '&:hover': {
          bgcolor: isSelected ? '#E0ECFF !important' : '#F7FAFF !important',
          borderColor: '#7EA7FF !important',
          boxShadow: '0 2px 6px rgba(11, 99, 229, 0.10)',
        },
      }}
    >
      {label}
    </Button>
  );

  const renderAssistantMessage = (message: string) => (
    <Box sx={{ alignSelf: 'flex-start', maxWidth: '94%', px: 1.4, py: 1.05, borderRadius: 2.2, bgcolor: '#FFFFFF', color: '#1E293B', border: '1px solid #E2E8F0', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' }}>
      <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#044ED7', mb: 0.35 }}>BD Atlas AI</Typography>
      <Typography sx={{ fontSize: 13, lineHeight: 1.48 }}>{message}</Typography>
    </Box>
  );

  const renderUserMessage = (message: string) => (
    <Box sx={{ alignSelf: 'flex-end', maxWidth: '86%', px: 1.4, py: 1.05, borderRadius: 2.2, bgcolor: '#0B63E5', color: '#FFFFFF', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.18)' }}>
      <Typography sx={{ fontSize: 12, fontWeight: 800, opacity: 0.78, mb: 0.35 }}>You</Typography>
      <Typography sx={{ fontSize: 13, lineHeight: 1.45 }}>{message}</Typography>
    </Box>
  );

  const renderCustomPreviewVisual = (visualization: string | null, metrics = customWidgetMetrics) => {
    if (visualization === 'KPI Card' || visualization === 'Big Number') {
      return (
        <Box sx={{ height: 78, p: 1, borderRadius: 1.2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Typography sx={{ fontSize: 11, color: '#667085', fontWeight: 800 }}>{metrics[0] ?? 'Primary Metric'}</Typography>
          <Typography sx={{ fontSize: 32, lineHeight: 1, color: '#111827', mt: 0.7, fontWeight: 700 }}>29.8k</Typography>
          <Typography sx={{ fontSize: 11, color: '#16A34A', mt: 0.4 }}>+4.2% vs target</Typography>
        </Box>
      );
    }

    if (visualization === 'Table') {
      return (
        <Box sx={{ height: 86, borderRadius: 1.2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          {['Line 10  29.8k  82.4%', 'Line 12  24.1k  79.6%', 'Line 08  31.2k  86.1%'].map((row, index) => (
            <Box key={row} sx={{ height: 28, px: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: index < 2 ? '1px solid #E2E8F0' : 'none', fontSize: 11.5, color: '#334155' }}>
              <Box>{row.split('  ')[0]}</Box>
              <Box>{row.split('  ')[1]}</Box>
              <Box sx={{ color: index === 1 ? '#F97316' : '#16A34A', fontWeight: 900 }}>{row.split('  ')[2]}</Box>
            </Box>
          ))}
        </Box>
      );
    }

    if (visualization === 'Heatmap') {
      return (
        <Box sx={{ height: 86, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0.45, p: 0.45, borderRadius: 1.2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          {Array.from({ length: 15 }).map((_, index) => (
            <Box key={index} sx={{ borderRadius: 0.7, bgcolor: index % 5 === 0 ? '#FECACA' : index % 3 === 0 ? '#FED7AA' : '#BBF7D0' }} />
          ))}
        </Box>
      );
    }

    if (visualization === 'Donut Chart') {
      return (
        <Box sx={{ height: 86, display: 'grid', gridTemplateColumns: '88px 1fr', alignItems: 'center', gap: 1, borderRadius: 1.2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', p: 1 }}>
          <Box sx={{ width: 66, height: 66, borderRadius: '50%', background: 'conic-gradient(#0B63E5 0 68%, #F97316 68% 84%, #22C55E 84% 100%)', position: 'relative', '&::after': { content: '""', position: 'absolute', inset: 14, borderRadius: '50%', bgcolor: '#F8FAFC' } }} />
          <Box sx={{ display: 'grid', gap: 0.35, fontSize: 11, color: '#475467' }}>
            <Box>Production 68%</Box>
            <Box>Losses 16%</Box>
            <Box>Recovered 16%</Box>
          </Box>
        </Box>
      );
    }

    const isLine = visualization === 'Line Chart' || visualization === 'Trend Chart';
    const isCombo = visualization === 'Combo Chart';
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: isLine ? '1fr' : 'repeat(4, 1fr)', alignItems: 'end', gap: 0.65, height: 78, px: 0.3, py: 0.7, borderRadius: 1.2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', position: 'relative', overflow: 'hidden' }}>
        {!isLine ? [42, 64, 52, 74].map((height, index) => (
          <Box key={height} sx={{ height: `${height}%`, borderRadius: '5px 5px 0 0', bgcolor: index === 2 ? '#F97316' : '#60A5FA' }} />
        )) : null}
        {(isLine || isCombo) ? (
          <>
            <Box sx={{ position: 'absolute', left: 12, right: 10, top: 30, height: 2, bgcolor: '#10B981', transform: 'rotate(-8deg)', transformOrigin: 'left center' }} />
            <Box sx={{ position: 'absolute', left: 38, top: 25, width: 7, height: 7, borderRadius: '50%', bgcolor: '#10B981' }} />
            <Box sx={{ position: 'absolute', right: 38, top: 18, width: 7, height: 7, borderRadius: '50%', bgcolor: '#10B981' }} />
          </>
        ) : null}
      </Box>
    );
  };

  const renderCustomWidgetPreviewCard = (widget?: CustomCreatedWidget | null, showActions = false) => {
    const previewTitle = widget?.title ?? customWidgetTitle;
    const previewDataset = widget?.dataset ?? customWidgetDataset;
    const previewMetrics = widget?.metrics ?? customWidgetMetrics;
    const previewVisualization = widget?.visualization ?? customWidgetVisualization;
    const previewFilters = widget?.filters ?? customWidgetFiltersSelected;

    return (
      <Paper elevation={0} sx={{ width: '100%', p: 1.35, borderRadius: 2, bgcolor: '#FFFFFF', border: '1px solid #BCD2FF', boxShadow: '0 12px 28px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(11, 99, 229, 0.04)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
          <Box>
            <Typography sx={{ fontSize: 15, lineHeight: 1.1, fontWeight: 900, color: '#111827' }}>{previewTitle}</Typography>
            <Typography sx={{ fontSize: 11, color: '#667085', mt: 0.25 }}>Dataset: {previewDataset}{previewDataset === 'Production' ? ' + OEE' : ''}</Typography>
          </Box>
          <Box sx={{ width: 30, height: 30, borderRadius: 1.4, display: 'grid', placeItems: 'center', bgcolor: '#EEF4FF', border: '1px solid #D7E5FF' }}>
            <AutoAwesomeIcon sx={{ fontSize: 17, color: '#0B63E5' }} />
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8, mb: 0.9 }}>
          {[
            { label: previewMetrics[0] ?? 'Primary Metric', value: '82.4', accent: '#31B957' },
            { label: previewMetrics[1] ?? 'Target Gap', value: '+4.2', accent: '#FF850D' },
          ].map((metric) => (
            <Paper key={metric.label} elevation={0} sx={{ position: 'relative', minHeight: 50, p: 0.85, pl: 1, borderRadius: 1.15, bgcolor: '#F8FBFF', border: '1px solid #E4EBF3', boxShadow: '0 2px 7px rgba(20, 36, 70, 0.10)', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: metric.accent } }}>
              <Typography sx={{ fontSize: 9.5, color: '#202124', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{metric.label}</Typography>
              <Typography sx={{ fontSize: 25, lineHeight: 1, color: '#202124', fontWeight: 400, mt: 0.3 }}>{metric.value}</Typography>
            </Paper>
          ))}
        </Box>
        <Box sx={{ minHeight: 90 }}>
          {renderCustomPreviewVisual(previewVisualization, previewMetrics)}
        </Box>
        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.45 }}>
          {[...(previewMetrics.slice(0, 2)), previewVisualization ?? 'Style', ...previewFilters.slice(0, 2)].filter(Boolean).map((tag) => (
            <Box key={tag} sx={{ px: 0.7, py: 0.25, borderRadius: 999, bgcolor: '#EEF4FF', color: '#0B63E5', border: '1px solid #D7E5FF', fontSize: 10.5, fontWeight: 850 }}>
              {tag}
            </Box>
          ))}
        </Box>
        {showActions ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8, mt: 1.2 }}>
            <Button variant="contained" startIcon={<AddIcon sx={{ fontSize: 17 }} />} onClick={createCustomWidget} sx={{ height: 36, borderRadius: 1.3, textTransform: 'none', fontWeight: 900, bgcolor: '#0B63E5', boxShadow: '0 8px 16px rgba(11, 99, 229, 0.18)', '&:hover': { bgcolor: '#044ED7', boxShadow: '0 8px 16px rgba(11, 99, 229, 0.18)' } }}>
              Create Widget
            </Button>
            <Button variant="outlined" startIcon={<EditIcon sx={{ fontSize: 17 }} />} onClick={() => openCustomWidgetEditAssistant()} sx={{ height: 36, borderRadius: 1.3, textTransform: 'none', fontWeight: 900, color: '#1F2366', borderColor: '#D5E0F5', bgcolor: '#FFFFFF', '&:hover': { borderColor: '#9DB9F2', bgcolor: '#F8FBFF' } }}>
              Edit Config
            </Button>
          </Box>
        ) : null}
      </Paper>
    );
  };

  const renderCustomWidgetPreview = () => renderCustomWidgetPreviewCard(null, true);

  const renderCreatedCustomWidget = (widget: CustomCreatedWidget) => (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        p: 'clamp(10px, 2cqw, 14px)',
        borderRadius: 1.5,
        bgcolor: '#FFFFFF',
        border: '1px solid #DDE4EF',
        boxShadow: '0 1px 2px rgba(17, 24, 39, 0.08), 0 0 0 1px rgba(31, 91, 255, 0.06)',
        overflow: 'hidden',
        containerType: 'inline-size',
        display: 'grid',
        gridTemplateRows: 'auto auto minmax(0, 1fr) auto',
        gap: 1.05,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 'clamp(14px, 3.2cqw, 17px)', lineHeight: 1.1, fontWeight: 900, color: '#111827' }}>
            {widget.title}
          </Typography>
          <Typography sx={{ fontSize: 'clamp(10px, 2.1cqw, 12px)', color: '#667085', mt: 0.35, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {widget.dataset} Â· {widget.visualization}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
          <IconButton
            aria-label={`Change ${widget.title} visualization`}
            title="Change visualization"
            onClick={() => openCustomWidgetEditAssistant(widget)}
            sx={{ width: 28, height: 28, color: '#0457FF', bgcolor: '#EEF4FF', border: '1px solid #D7E5FF', '&:hover': { bgcolor: '#E0ECFF' } }}
          >
            <EditIcon sx={{ fontSize: 15 }} />
          </IconButton>
          <IconButton
            aria-label={`Share ${widget.title}`}
            title="Share widget"
            onClick={() => openCustomWidgetShareAssistant(widget)}
            sx={{ width: 28, height: 28, color: '#0457FF', bgcolor: '#EEF4FF', border: '1px solid #D7E5FF', '&:hover': { bgcolor: '#E0ECFF' } }}
          >
            <ShareIcon sx={{ fontSize: 15 }} />
          </IconButton>
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.85 }}>
        <Paper elevation={0} sx={{ position: 'relative', p: 0.85, pl: 1.05, minHeight: 52, borderRadius: 1.2, bgcolor: '#F8FBFF', border: '1px solid #E4EBF3', boxShadow: '0 2px 7px rgba(20, 36, 70, 0.10)', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: '#31B957' } }}>
          <Typography sx={{ fontSize: 10, color: '#202124' }}>Primary</Typography>
          <Typography sx={{ fontSize: 'clamp(21px, 5.5cqw, 28px)', lineHeight: 1, color: '#202124', fontWeight: 400 }}>82.4</Typography>
        </Paper>
        <Paper elevation={0} sx={{ position: 'relative', p: 0.85, pl: 1.05, minHeight: 52, borderRadius: 1.2, bgcolor: '#F8FBFF', border: '1px solid #E4EBF3', boxShadow: '0 2px 7px rgba(20, 36, 70, 0.10)', overflow: 'hidden', '&::before': { content: '""', position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: '#FF850D' } }}>
          <Typography sx={{ fontSize: 10, color: '#202124' }}>Target Gap</Typography>
          <Typography sx={{ fontSize: 'clamp(21px, 5.5cqw, 28px)', lineHeight: 1, color: '#202124', fontWeight: 400 }}>+4.2</Typography>
        </Paper>
      </Box>
      {renderCustomPreviewVisual(widget.visualization, widget.metrics)}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        {widget.filters.slice(0, 4).map((filter) => (
          <Box key={filter} sx={{ px: 0.75, py: 0.25, borderRadius: 999, bgcolor: '#EEF4FF', color: '#0B63E5', border: '1px solid #D7E5FF', fontSize: 10.5, fontWeight: 800 }}>
            {filter}
          </Box>
        ))}
        <AutoAwesomeIcon sx={{ ml: 'auto', fontSize: 17, color: '#BBD4FF' }} />
      </Box>
    </Paper>
  );

  const renderCustomWidgetEditAssistant = () => {
    const editMetricOptions = customWidgetDataset ? customWidgetMetricOptions[customWidgetDataset] : [];

    const chooseEditSection = (section: CustomWidgetEditSection) => {
      setCustomWidgetEditSection(section);
      const idBase = `${Date.now()}-${Math.round(Math.random() * 1000)}`;
      const typingId = `edit-typing-${idBase}`;
      const response = section === 'Dataset'
        ? 'Sure. Choose the dataset you want and I will refresh the widget.'
        : section === 'Metrics'
          ? 'Sure. Select the metrics this widget should show.'
          : section === 'Style'
            ? 'Sure. Choose a new visual style.'
            : 'Sure. Choose the filters available inside the widget.';
      setCustomWidgetEditTranscript((prev) => [
        ...prev,
        { id: `edit-user-${idBase}`, role: 'user', text: `Change ${section.toLowerCase()}.` },
        { id: typingId, role: 'typing' },
      ]);
      window.setTimeout(() => {
        setCustomWidgetEditTranscript((prev) => [
          ...prev.filter((item) => item.id !== typingId),
          { id: `edit-assistant-${idBase}`, role: 'assistant', text: response },
        ]);
      }, 620);
    };

    return (
      <>
        {customWidgetEditTranscript.map((item) => {
          if (item.role === 'user' && item.text) return <Box key={item.id} sx={{ display: 'contents' }}>{renderUserMessage(item.text)}</Box>;
          if (item.role === 'assistant' && item.text) return <Box key={item.id} sx={{ display: 'contents' }}>{renderAssistantMessage(item.text)}</Box>;
          if (item.role === 'typing') return <AssistantTypingBubble key={item.id} label="BD Atlas AI" />;
          if (item.role === 'preview') return <Box key={item.id} sx={{ alignSelf: 'stretch', width: '100%' }}>{renderCustomWidgetPreviewCard(item.widget, Boolean(item.showActions))}</Box>;
          return null;
        })}

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
          {customWidgetEditSections.map((section) => renderOptionButton({
            isSelected: customWidgetEditSection === section,
            label: section,
            onClick: () => chooseEditSection(section),
          }))}
        </Box>

        {customWidgetEditSection === 'Dataset' ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
            {customWidgetDatasets.map((dataset) => renderOptionButton({
              isSelected: customWidgetDataset === dataset,
              label: dataset,
              onClick: () => updateCustomWidgetDataset(dataset),
            }))}
          </Box>
        ) : null}
        {customWidgetEditSection === 'Metrics' ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
            {editMetricOptions.map((metric) => renderOptionButton({
              isSelected: customWidgetMetrics.includes(metric),
              label: metric,
              onClick: () => toggleEditedCustomMetric(metric),
            }))}
          </Box>
        ) : null}
        {customWidgetEditSection === 'Style' ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
            {customWidgetVisualizations.map((visualization) => renderOptionButton({
              isSelected: customWidgetVisualization === visualization,
              label: visualization,
              onClick: () => {
                if (activeCustomWidgetId) {
                  updateCustomWidgetVisualization(activeCustomWidgetId, visualization);
                } else {
                  setCustomWidgetVisualization(visualization);
                  appendCustomWidgetEditExchange(
                    `Use ${visualization}.`,
                    'Done. I updated the preview style.',
                    createCustomWidgetPreviewSnapshot({ visualization }),
                  );
                }
              },
            }))}
          </Box>
        ) : null}
        {customWidgetEditSection === 'Filters' ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
            {customWidgetFilters.map((filter) => renderOptionButton({
              isSelected: customWidgetFiltersSelected.includes(filter),
              label: filter,
              onClick: () => toggleEditedCustomFilter(filter),
            }))}
          </Box>
        ) : null}
      </>
    );
  };

  const renderCustomWidgetShareAssistant = () => (
    <>
      {widgetAssistantStep === 0 ? <AssistantTypingBubble align="flex-end" label="You" /> : null}
      {widgetAssistantStep >= 1 && activeCustomWidget ? renderUserMessage(`Share ${activeCustomWidget.title}.`) : null}
      {widgetAssistantStep === 1 ? <AssistantTypingBubble label="BD Atlas AI" /> : null}
      {widgetAssistantStep >= 2 && activeCustomWidget ? (
        <>
          {renderAssistantMessage('Who should receive this widget? Choose a team or enter an email.')}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
            {customWidgetShareSuggestions.map((target) => renderOptionButton({
              isSelected: customWidgetShareTarget === target,
              label: target,
              onClick: () => setCustomWidgetShareTarget(target),
            }))}
          </Box>
          <TextField
            size="small"
            value={customWidgetShareTarget}
            onChange={(event) => setCustomWidgetShareTarget(event.target.value)}
            placeholder="Team name or email"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                height: 38,
                borderRadius: 1.4,
                bgcolor: '#FFFFFF',
                fontSize: 12.5,
                fontWeight: 700,
              },
            }}
          />
          <Button
            variant="contained"
            startIcon={<ShareIcon sx={{ fontSize: 17 }} />}
            disabled={!customWidgetShareTarget.trim()}
            onClick={() => {
              setCustomWidgetChatStage(3);
              window.setTimeout(() => setCustomWidgetChatStage(4), 720);
            }}
            sx={{ height: 36, borderRadius: 1.4, textTransform: 'none', fontWeight: 900, boxShadow: 'none' }}
          >
            Share Widget
          </Button>
        </>
      ) : null}
      {widgetAssistantStep >= 3 && activeCustomWidget ? renderUserMessage(`Send it to ${customWidgetShareTarget}.`) : null}
      {widgetAssistantStep === 3 ? <AssistantTypingBubble label="BD Atlas AI" /> : null}
      {widgetAssistantStep >= 4 && activeCustomWidget ? (
        <>
          <Paper elevation={0} sx={{ alignSelf: 'flex-start', maxWidth: '94%', p: 1.25, borderRadius: 2, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0', boxShadow: '0 8px 18px rgba(16, 185, 129, 0.08)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#047857' }} />
              <Typography sx={{ fontSize: 13, color: '#047857', fontWeight: 900 }}>
                Widget shared successfully.
              </Typography>
            </Box>
            <Typography sx={{ fontSize: 12, color: '#047857', mt: 0.6, lineHeight: 1.4 }}>
              {activeCustomWidget.title} was sent to {customWidgetShareTarget} with its filters and current visualization.
            </Typography>
          </Paper>
        </>
      ) : null}
    </>
  );

  const renderCustomWidgetAssistant = () => (
    <>
      {widgetAssistantStep === 0 ? <AssistantTypingBubble align="flex-end" label="You" /> : null}
      {widgetAssistantStep >= 1 ? renderUserMessage('Help me create a custom widget for my workstation.') : null}
      {widgetAssistantStep === 2 ? <AssistantTypingBubble label="BD Atlas AI" /> : null}
      {widgetAssistantStep >= 3 ? (
        <>
          {renderAssistantMessage('Sure, I can help you create a custom widget. First, choose the dataset you want to use.')}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
            {customWidgetDatasets.map((dataset) => renderOptionButton({
              isSelected: customWidgetDataset === dataset,
              label: dataset,
              onClick: () => {
                setCustomWidgetDataset(dataset);
                setCustomWidgetMetrics([]);
                setCustomWidgetVisualization(null);
                setCustomWidgetFiltersSelected([]);
                setIsCustomWidgetCreated(false);
                setCustomWidgetChatStage(1);
                window.setTimeout(() => setCustomWidgetChatStage(2), 520);
              },
            }))}
          </Box>
        </>
      ) : null}

      {customWidgetDataset && customWidgetChatStage >= 1 ? (
        <>
          {renderUserMessage(`Use the ${customWidgetDataset} dataset.`)}
          {customWidgetChatStage === 1 ? <AssistantTypingBubble label="BD Atlas AI" /> : null}
        </>
      ) : null}

      {customWidgetDataset && customWidgetChatStage >= 2 ? (
        <>
          {renderAssistantMessage(`Great. Select the views or metrics you want from ${customWidgetDataset}.`)}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
            {customMetricOptions.map((metric) => renderOptionButton({
              isSelected: customWidgetMetrics.includes(metric),
              label: metric,
              onClick: () => {
                selectCustomMetric(metric);
                setCustomWidgetVisualization(null);
                setCustomWidgetFiltersSelected([]);
                setIsCustomWidgetCreated(false);
              },
            }))}
          </Box>
        </>
      ) : null}

      {customWidgetMetrics.length && customWidgetChatStage >= 3 ? (
        <>
          {renderUserMessage(`Use ${customWidgetMetrics.slice(0, 3).join(', ')}${customWidgetMetrics.length > 3 ? ', and more' : ''}.`)}
          {customWidgetChatStage === 3 ? <AssistantTypingBubble label="BD Atlas AI" /> : null}
        </>
      ) : null}

      {customWidgetMetrics.length && customWidgetChatStage >= 4 ? (
        <>
          {renderAssistantMessage('How would you like to visualize this widget?')}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
            {customWidgetVisualizations.map((visualization) => renderOptionButton({
              isSelected: customWidgetVisualization === visualization,
              label: visualization,
              onClick: () => {
                setCustomWidgetVisualization(visualization);
                setCustomWidgetFiltersSelected([]);
                setIsCustomWidgetCreated(false);
                setCustomWidgetChatStage(5);
                window.setTimeout(() => setCustomWidgetChatStage(6), 520);
              },
            }))}
          </Box>
        </>
      ) : null}

      {customWidgetVisualization && customWidgetChatStage >= 5 ? (
        <>
          {renderUserMessage(`Show it as a ${customWidgetVisualization}.`)}
          {customWidgetChatStage === 5 ? <AssistantTypingBubble label="BD Atlas AI" /> : null}
        </>
      ) : null}

      {customWidgetVisualization && customWidgetChatStage >= 6 ? (
        <>
          {renderAssistantMessage('Which filters should be available for this widget?')}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65 }}>
            {customWidgetFilters.map((filter) => renderOptionButton({
              isSelected: customWidgetFiltersSelected.includes(filter),
              label: filter,
              onClick: () => {
                selectCustomFilter(filter);
                setIsCustomWidgetCreated(false);
              },
            }))}
          </Box>
        </>
      ) : null}

      {customWidgetFiltersSelected.length && customWidgetChatStage >= 7 ? (
        <>
          {renderUserMessage(`Add filters for ${customWidgetFiltersSelected.join(', ')}.`)}
          {customWidgetChatStage === 7 ? <AssistantTypingBubble label="BD Atlas AI" /> : null}
        </>
      ) : null}

      {customWidgetFiltersSelected.length && customWidgetChatStage >= 8 ? (
        <>
          {renderAssistantMessage('Here is a preview before I create it.')}
          {renderCustomWidgetPreview()}
        </>
      ) : null}

      {isCustomWidgetCreated ? (
        <Paper elevation={0} sx={{ p: 1.25, borderRadius: 2, bgcolor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
          <Typography sx={{ fontSize: 13, color: '#047857', fontWeight: 900 }}>
            Your custom widget has been created and added to the page.
          </Typography>
        </Paper>
      ) : null}
    </>
  );

  if (isDowntimeAnalysisModalOpen) {
    const isTier3DowntimeDrilldown = tierOverviewLabel === 'Unit overview';

    return (
      <MyDowntimeAnalysisModal
        mode={isTier3DowntimeDrilldown ? 'plant' : useTierSqdcCarousel ? 'unit' : 'line'}
        onClose={() => setIsDowntimeAnalysisModalOpen(false)}
        title={isTier3DowntimeDrilldown ? 'Plant Downtime Analysis' : useTierSqdcCarousel ? undefined : 'Line Downtime Analysis'}
      />
    );
  }

  if (isProductionDeliveryModalOpen) {
    return <MyProductionDeliveryModal onClose={() => setIsProductionDeliveryModalOpen(false)} />;
  }

  if (isSeriousInjuryModalOpen) {
    return <MySeriousInjuryModal onClose={() => setIsSeriousInjuryModalOpen(false)} />;
  }

  if (isProductionPlanningExpanded) {
    return <MyProductionPlanningExpanded onBack={() => setIsProductionPlanningExpanded(false)} />;
  }

  if (isShiftOeeExpanded) {
    return <MyShiftOeeExpanded onBack={() => setIsShiftOeeExpanded(false)} />;
  }

  if (isMachineUtilizationExpanded) {
    return <MyMachineUtilizationExpanded onBack={() => setIsMachineUtilizationExpanded(false)} />;
  }

  if (isEsoExpanded) {
    return <MyEsoExpanded onBack={() => setIsEsoExpanded(false)} />;
  }

  const tierCustomizeDialog = (
    <TierKpiCustomizeDialog
      allKpis={activeTierKpiCustomize ? tierKpiOptions[activeTierKpiCustomize] : []}
      domain={activeTierKpiCustomize}
      open={Boolean(activeTierKpiCustomize)}
      shownKpis={activeTierKpiCustomize ? tierShownKpis[activeTierKpiCustomize] : []}
      onClose={() => setActiveTierKpiCustomize(null)}
      onApply={(nextShownKpis) => {
        if (!activeTierKpiCustomize) return;
        setTierShownKpis((current) => ({
          ...current,
          [activeTierKpiCustomize]: nextShownKpis,
        }));
        setActiveTierKpiCustomize(null);
      }}
    />
  );

  if (isSafetyExpanded) {
    return (
      <>
        <MySafetyExpanded
          onBack={() => setIsSafetyExpanded(false)}
          onCustomize={() => setActiveTierKpiCustomize('Safety')}
          visibleKpis={tierShownKpis.Safety}
        />
        {tierCustomizeDialog}
      </>
    );
  }

  if (isQualityExpanded) {
    return (
      <>
        <MyQualityExpanded
          onBack={() => setIsQualityExpanded(false)}
          onCustomize={() => setActiveTierKpiCustomize('Quality')}
          visibleKpis={tierShownKpis.Quality}
        />
        {tierCustomizeDialog}
      </>
    );
  }

  if (isDeliveryExpanded) {
    return (
      <>
        <MyDeliveryExpanded
          onBack={() => setIsDeliveryExpanded(false)}
          onCustomize={() => setActiveTierKpiCustomize('Delivery')}
          visibleKpis={tierShownKpis.Delivery}
        />
        {tierCustomizeDialog}
      </>
    );
  }

  if (isCostExpanded) {
    return (
      <>
        <MyCostExpanded
          onBack={() => setIsCostExpanded(false)}
          onCustomize={() => setActiveTierKpiCustomize('Cost')}
          visibleKpis={tierShownKpis.Cost}
        />
        {tierCustomizeDialog}
      </>
    );
  }

  if (isPeopleExpanded) {
    return (
      <>
        <MyPeopleExpanded
          onBack={() => setIsPeopleExpanded(false)}
          onCustomize={() => setActiveTierKpiCustomize('People')}
          visibleKpis={tierShownKpis.People}
        />
        {tierCustomizeDialog}
      </>
    );
  }

  if (isCiltCenterlineExpanded) {
    return (
      <MyCiltCenterlineExpanded
        onBack={() => setIsCiltCenterlineExpanded(false)}
        onStartCilt={() => {
          setIsCiltCenterlineExpanded(false);
        }}
        onStartCenterline={() => {
          setIsCiltCenterlineExpanded(false);
        }}
      />
    );
  }

  if (isEquipmentChangeoverExpanded) {
    return (
      <MyEquipmentChangeoverExpanded
        onBack={() => setIsEquipmentChangeoverExpanded(false)}
        onStartChangeover={() => {
          setIsEquipmentChangeoverExpanded(false);
        }}
      />
    );
  }

  if (isLossFocusedKpisExpanded) {
    return <MyLossFocusedKpisPage onClose={() => setIsLossFocusedKpisExpanded(false)} />;
  }

  const isTierStandardBoard = isTierStandardWorkstation && !isEditMode && !isPersonalBoardEmpty;

  if (isTierStandardBoard) {
    return (
      <Box
        sx={{
          height: '100%',
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: 'minmax(0, 1fr)',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            minHeight: 0,
            display: 'grid',
            gridTemplateColumns: {xs: '1fr', xl: 'minmax(0, 1fr) 292px'},
            gridTemplateRows: {xs: 'auto auto', xl: 'minmax(0, 1fr)'},
            gap: {xs: 1.2, xl: 1.25},
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              minHeight: 0,
              display: 'grid',
              gridTemplateRows: {xs: 'auto auto', xl: 'minmax(0, 1fr) minmax(205px, 0.36fr)'},
              gap: {xs: 1.2, xl: 1.25},
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                minHeight: 0,
                display: 'grid',
                gridTemplateColumns: {xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))'},
                gap: {xs: 1.2, xl: 1.25},
                overflow: 'hidden',
              }}
            >
              {['safety', 'quality', 'delivery', 'cost', 'people'].map((widgetId) => (
                <Box key={widgetId} sx={{minHeight: {xs: 420, xl: 0}, minWidth: 0}}>
                  <TierManualEditFrame enabled={tierBoardManualEditMode} widgetId={widgetId} onEdit={onEditTierWidget}>
                    {renderPersonalWidget(widgetId)}
                  </TierManualEditFrame>
                </Box>
              ))}
            </Box>

            <Box sx={{minHeight: {xs: 300, xl: 0}, minWidth: 0, overflow: 'hidden'}}>
              <TierManualEditFrame enabled={tierBoardManualEditMode} widgetId="action-tracker" onEdit={onEditTierWidget}>
                {renderPersonalWidget('action-tracker')}
              </TierManualEditFrame>
            </Box>
          </Box>

          <Box
            sx={{
              minHeight: 0,
              display: 'grid',
              gridTemplateRows: {xs: '120px 520px', xl: '126px minmax(0, 1fr)'},
              gap: {xs: 1.2, xl: 1.25},
              overflow: 'hidden',
            }}
          >
            <Box sx={{minHeight: 0}}>
              <TierManualEditFrame enabled={tierBoardManualEditMode} widgetId="three-p-tracking" onEdit={onEditTierWidget}>
                {renderPersonalWidget('three-p-tracking')}
              </TierManualEditFrame>
            </Box>
            <Box sx={{minHeight: 0}}>
              <TierManualEditFrame enabled={tierBoardManualEditMode} widgetId="loss-focused-kpis" onEdit={onEditTierWidget}>
                {renderPersonalWidget('loss-focused-kpis')}
              </TierManualEditFrame>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <WorkstationCilCenterlineWidget
        headlessLauncher
        launcherRequest={cilCenterlineLauncherRequest}
        onExecutionClose={() => setCilCenterlineLauncherRequest(null)}
      />
      <WorkstationEquipmentChangeoverWidget
        autoOpenExecutionFromSeed={false}
        headlessLauncher
        launcherRequest={changeoverLauncherRequest}
        onExecutionClose={() => setChangeoverLauncherRequest(null)}
      />
      <TaskAssistDialog
        task={lineStatusAssistTask}
        open={Boolean(lineStatusAssistTask)}
        onClose={() => setLineStatusAssistTask(null)}
        onStart={(task) => {
          openMyTaskExecution(task);
          setLineStatusAssistTask(null);
        }}
        onOpenAi={(task) => {
          openMyTaskAiAssistant(task, false, false);
          setLineStatusAssistTask(null);
        }}
      />

      {isEditMode && (
        <Paper
          elevation={0}
          sx={{
            p: 1.8,
            borderRadius: 3,
            bgcolor: '#FFFFFF',
            border: '1px solid rgba(148,163,184,0.16)',
            boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#044ED7', fontWeight: 800 }}>
                MY WIDGETS
              </Typography>
              <Typography variant="body2" sx={{ color: '#626465', mt: 0.35 }}>
                Move, resize, remove, and add widgets in this personal workspace.
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={`${personalVisibleWidgetIds.length + addedCustomWidgetIds.length} visible`}
                sx={{ fontWeight: 800, bgcolor: '#EEF4FF', color: '#1D4ED8', border: '1px solid #DBEAFE' }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setIsAddWidgetPanelOpen(true)}
                sx={{ fontWeight: 800 }}
              >
                Add Widget
              </Button>
              <Button
                variant={isEditMode ? 'contained' : 'outlined'}
                startIcon={<CustomizeIcon />}
                onClick={() => setIsEditMode(!isEditMode)}
                sx={{ fontWeight: 800 }}
              >
                {isEditMode ? 'Done Customizing' : 'Customize Board'}
              </Button>
              {onPublish && (
                <Button
                  variant="contained"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={onPublish}
                  sx={{
                    fontWeight: 800,
                    bgcolor: '#044ED7',
                    '&:hover': { bgcolor: '#1D74FF' },
                  }}
                >
                  Publish
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      )}

      {isAddWidgetPanelOpen ? (
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            zIndex: 1400,
            width: { xs: '100%', md: isWidgetAssistantOpen ? 900 : 500 },
            maxWidth: '100%',
            height: '100vh',
            '@media screen and (max-width: 1280px)': {
              height: '133.33vh',
            },
            '@media screen and (min-width: 1281px) and (max-width: 1366px)': {
              height: '128.2vh',
            },
            '@media screen and (min-width: 1367px) and (max-width: 1440px)': {
              height: '120.5vh',
            },
            '@media screen and (min-width: 1441px) and (max-width: 1600px)': {
              height: '111.1vh',
            },
            '@media screen and (min-width: 1601px) and (max-width: 1920px)': {
              height: '105.3vh',
            },
            '@media screen and (min-width: 1921px)': {
              height: '100vh',
            },
            p: 0,
            borderRadius: 0,
            bgcolor: '#FFFFFF',
            borderLeft: '1px solid #DDE7F4',
            boxShadow: '-18px 0 42px rgba(15, 23, 42, 0.18)',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: isWidgetAssistantOpen ? 'minmax(0, 500px) 400px' : '1fr' }, height: '100%', minHeight: 0, overflow: 'hidden' }}>
            {isWidgetAssistantOpen ? (
              <Box sx={{ display: { xs: 'none', md: 'grid' }, gridColumn: { md: 2 }, gridRow: { md: 1 }, gridTemplateRows: 'auto minmax(0, 1fr) auto', borderLeft: '1px solid #E6EDF6', bgcolor: '#F8FBFF', minWidth: 0, minHeight: 0 }}>
                <Box sx={{ p: 2.1, borderBottom: '1px solid #E6EDF6', bgcolor: '#FFFFFF' }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5 }}>
                    <Box>
                      <Typography sx={{ fontSize: 18, fontWeight: 900, color: '#044ED7', display: 'flex', alignItems: 'center', gap: 0.7 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 18, color: '#FF6E00' }} />
                        BD Atlas AI
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#667085', mt: 0.45 }}>
                        {widgetAssistantMode === 'create'
                          ? 'Guided custom widget creation.'
                          : widgetAssistantMode === 'edit'
                            ? 'Change dataset, metrics, style, or filters.'
                            : widgetAssistantMode === 'share'
                              ? 'Share a custom widget with a team or person.'
                              : 'Ask IA Copilot for workstation layout help.'}
                      </Typography>
                    </Box>
                    <IconButton onClick={() => setIsWidgetAssistantOpen(false)} size="small" sx={{ color: '#64748B' }}>
                      <CloseIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>

                <Box sx={{ p: 1.6, minHeight: 0, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', display: 'flex', flexDirection: 'column', gap: 1.35 }}>
                  {widgetAssistantMode === 'create' ? renderCustomWidgetAssistant() : widgetAssistantMode === 'edit' ? renderCustomWidgetEditAssistant() : widgetAssistantMode === 'share' ? renderCustomWidgetShareAssistant() : (
                    <>
                      {widgetAssistantStep === 0 ? (
                        <AssistantTypingBubble align="flex-end" label="You" />
                      ) : null}

                      {widgetAssistantStep >= 1 ? (
                        <Box sx={{ alignSelf: 'flex-end', maxWidth: '86%', px: 1.4, py: 1.05, borderRadius: 2.2, bgcolor: '#0B63E5', color: '#FFFFFF', boxShadow: '0 8px 20px rgba(37, 99, 235, 0.18)' }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 800, opacity: 0.78, mb: 0.35 }}>You</Typography>
                          <Typography sx={{ fontSize: 13, lineHeight: 1.45 }}>
                            Help me build my workstation with the right widgets for my shift and role.
                          </Typography>
                        </Box>
                      ) : null}

                      {widgetAssistantStep === 2 ? (
                        <AssistantTypingBubble label="BD Atlas AI" />
                      ) : null}

                      {widgetAssistantStep >= 3 ? (
                        <Box sx={{ alignSelf: 'flex-start', maxWidth: '92%', px: 1.4, py: 1.05, borderRadius: 2.2, bgcolor: '#FFFFFF', color: '#1E293B', border: '1px solid #E2E8F0', boxShadow: '0 8px 20px rgba(15, 23, 42, 0.06)' }}>
                          <Typography sx={{ fontSize: 12, fontWeight: 900, color: '#044ED7', mb: 0.35 }}>BD Atlas AI</Typography>
                          <Typography sx={{ fontSize: 13, lineHeight: 1.48 }}>
                            Based on your Line 10 workstation, I suggest starting with widget packs by objective. You can accept a pack or add individual widgets.
                          </Typography>
                        </Box>
                      ) : null}

                      {widgetAssistantStep >= 4 ? workstationAssistantSuggestions.map((suggestion) => {
                        const acceptedCount = suggestion.widgetIds.filter((widgetId) => personalVisibleWidgetIds.includes(widgetId)).length;
                        const isAccepted = acceptedCount === suggestion.widgetIds.length;

                        return (
                          <Paper key={suggestion.id} elevation={0} sx={{ p: 1.35, borderRadius: 2, bgcolor: '#FFFFFF', border: `1px solid ${isAccepted ? '#BBF7D0' : '#D7E2F3'}`, boxShadow: '0 8px 18px rgba(15, 23, 42, 0.05)' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                              <Box>
                                <Typography sx={{ fontSize: 14, fontWeight: 900, color: '#111827' }}>{suggestion.title}</Typography>
                                <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#2563EB', mt: 0.25 }}>{suggestion.role}</Typography>
                              </Box>
                              <Chip
                                label={`${acceptedCount}/${suggestion.widgetIds.length}`}
                                sx={{ height: 24, fontSize: 11, fontWeight: 900, bgcolor: isAccepted ? '#ECFDF5' : '#EEF4FF', color: isAccepted ? '#047857' : '#1D4ED8' }}
                              />
                            </Box>
                            <Typography sx={{ fontSize: 12.5, color: '#475467', mt: 0.8, lineHeight: 1.42 }}>{suggestion.reason}</Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.55, mt: 1 }}>
                              {suggestion.widgetIds.map((widgetId) => {
                                const widget = personalWidgetMap[widgetId];
                                const isVisible = personalVisibleWidgetIds.includes(widgetId);

                                return (
                                  <Button
                                    key={widgetId}
                                    size="small"
                                    variant="outlined"
                                    onClick={() => setPersonalWidgetVisible(widgetId, !isVisible)}
                                    sx={{
                                      height: 25,
                                      px: 0.9,
                                      borderRadius: 999,
                                      fontSize: 10.5,
                                      lineHeight: 1,
                                      textTransform: 'none',
                                      fontWeight: 800,
                                      bgcolor: isVisible ? '#F8FBFF !important' : '#FFFFFF !important',
                                      color: isVisible ? '#2458A6 !important' : '#2563EB !important',
                                      borderColor: isVisible ? '#D5E4FF !important' : '#BFDBFE !important',
                                      boxShadow: 'none',
                                      '&:hover': { bgcolor: isVisible ? '#F1F6FF !important' : '#EFF6FF !important', boxShadow: 'none' },
                                    }}
                                  >
                                    {widget.label}
                                  </Button>
                                );
                              })}
                            </Box>
                            <Button
                              fullWidth
                              variant={isAccepted ? 'outlined' : 'contained'}
                              startIcon={isAccepted ? <CheckCircleOutlineIcon sx={{ fontSize: 17 }} /> : <AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                              onClick={() => addPersonalWidgets(suggestion.widgetIds)}
                              sx={{ mt: 1.15, height: 34, borderRadius: 1.4, textTransform: 'none', fontWeight: 900, boxShadow: 'none' }}
                            >
                              {isAccepted ? 'Suggestion applied' : 'Accept suggestion'}
                            </Button>
                          </Paper>
                        );
                      }) : null}
                    </>
                  )}
                </Box>

                <Box sx={{ p: 1.6, borderTop: '1px solid #E6EDF6', bgcolor: '#FFFFFF' }}>
                  <Typography sx={{ fontSize: 12, color: '#667085', lineHeight: 1.4 }}>
                    You can keep adding widgets manually from the catalog on the left.
                  </Typography>
                </Box>
              </Box>
            ) : null}
            <Box sx={{ display: 'grid', gridColumn: { md: 1 }, gridRow: { md: 1 }, gridTemplateRows: 'auto minmax(0, 1fr)', height: '100%', minWidth: 0, minHeight: 0 }}>
              <Box sx={{ p: 2.1, borderBottom: '1px solid #E6EDF6', bgcolor: '#F8FBFF' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: 22, lineHeight: 1, fontWeight: 900, color: '#111827' }}>Add widget</Typography>
                    <Typography sx={{ fontSize: 13, color: '#667085', mt: 0.65, lineHeight: 1.35 }}>
                      Pick a component for this page. Filter by domain or search by name.
                    </Typography>
                  </Box>
                  <IconButton onClick={() => setIsAddWidgetPanelOpen(false)} sx={{ color: '#64748B' }}>
                    <CloseIcon sx={{ fontSize: 19 }} />
                  </IconButton>
                </Box>

                {isWidgetAssistantCardVisible && !isWidgetAssistantOpen ? (
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 1.6,
                      p: 1.2,
                      borderRadius: 1.7,
                      bgcolor: '#EEF4FF',
                      border: '1px solid #D7E5FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1.2,
                    }}
                  >
                    <Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 900, color: '#044ED7', display: 'flex', alignItems: 'center', gap: 0.45 }}>
                        <AutoAwesomeIcon sx={{ fontSize: 15, color: '#FF6E00' }} />
                        BD Atlas AI
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: '#1F4AA8', mt: 0.4 }}>
                        Would you like assistance here?
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <IconButton
                        onClick={() => setIsWidgetAssistantCardVisible(false)}
                        size="small"
                        sx={{ color: '#4388FF' }}
                      >
                        <CloseIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setWidgetAssistantMode('layout');
                          setIsWidgetAssistantOpen(true);
                          setIsWidgetAssistantCardVisible(false);
                        }}
                        size="small"
                        sx={{ color: '#1D74FF' }}
                      >
                        <CheckCircleOutlineIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Box>
                  </Paper>
                ) : null}

                <Box sx={{ position: 'relative', mt: 2.1 }}>
                  <SearchIcon sx={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#64748B' }} />
                  <Box
                    component="input"
                    value={personalWidgetSearch}
                    onChange={(event) => setPersonalWidgetSearch(event.target.value)}
                    placeholder="Search by name, tag, team..."
                    sx={{
                      width: '100%',
                      height: 48,
                      pl: 5,
                      pr: 1.4,
                      borderRadius: 2,
                      border: '1px solid #BFD2F4',
                      outline: 'none',
                      bgcolor: '#FFFFFF',
                      color: '#111827',
                      fontSize: 14,
                      boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.08)',
                      '&:focus': { borderColor: '#2563EB', boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.16)' },
                    }}
                  />
                </Box>

                <Typography sx={{ fontSize: 12, color: '#667085', fontWeight: 900, mt: 2.3, mb: 1, textTransform: 'uppercase', letterSpacing: 0.9 }}>
                  Category
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {personalWidgetDomains.map((domain) => {
                    const isActive = activePersonalWidgetDomain === domain;
                    return (
                      <Button
                        key={domain}
                        variant="outlined"
                        onClick={() => setActivePersonalWidgetDomain(domain)}
                        sx={{
                          height: 34,
                          borderRadius: 999,
                          px: 1.4,
                          fontWeight: 850,
                          textTransform: 'none',
                          bgcolor: isActive ? '#F8FBFF !important' : '#FFFFFF !important',
                          color: isActive ? '#0B4FC7 !important' : '#475467 !important',
                          borderColor: isActive ? '#AFCBFF !important' : '#E2E8F0 !important',
                          boxShadow: 'none',
                          '&:hover': { bgcolor: isActive ? '#F8FBFF !important' : '#F8FAFC !important', borderColor: '#AFCBFF !important', boxShadow: 'none' },
                        }}
                      >
                        {domain}
                      </Button>
                    );
                  })}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5, mt: 2.2 }}>
                  <Typography sx={{ fontSize: 13, color: '#667085' }}>
                    {`${filteredWidgetCount} widgets`}
                  </Typography>
                  <Button
                    variant="text"
                    startIcon={<AddIcon sx={{ fontSize: 17 }} />}
                    onClick={openCustomWidgetAssistant}
                    sx={{
                      height: 36,
                      borderRadius: 999,
                      px: 2,
                      textTransform: 'none',
                      fontWeight: 900,
                      bgcolor: '#F1F6FF !important',
                      color: '#0862E8 !important',
                      boxShadow: 'none',
                      border: '1px solid #E4EDFF',
                      '& .MuiButton-startIcon': { mr: 0.8 },
                      '&:hover': { bgcolor: '#E8F1FF !important', boxShadow: 'none' },
                    }}
                  >
                    Create Widget
                  </Button>
                </Box>
              </Box>

              <Box sx={{ p: 1.8, minHeight: 0, maxHeight: '100%', overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', bgcolor: '#FFFFFF' }}>
                {!filteredWidgetCount ? (
                  <Paper elevation={0} sx={{ minHeight: 260, border: '1px dashed #CBD5E1', borderRadius: 2, display: 'grid', placeItems: 'center', textAlign: 'center', px: 4, bgcolor: '#F8FAFC' }}>
                    <Box>
                      <Typography sx={{ fontSize: 18, fontWeight: 900, color: '#111827' }}>No widgets found</Typography>
                      <Typography sx={{ fontSize: 13, color: '#667085', mt: 0.7 }}>
                        Try another category or search term.
                      </Typography>
                    </Box>
                  </Paper>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
                    {filteredPersonalWidgetIds.map((widgetId) => {
                      const widget = personalWidgetMap[widgetId];
                      const domain = getPersonalWidgetDomain(widgetId);
                      const accent = personalWidgetAccentMap[domain];
                      const isRepeatableTextBox = widgetId === textBoxWidgetTemplateId;
                      const isVisible = !isRepeatableTextBox && personalVisibleWidgetIds.includes(widgetId);
                      const tags = getPersonalWidgetTags(widgetId).slice(0, 4);

                      return (
                        <Paper
                          key={widgetId}
                          elevation={0}
                          sx={{
                            position: 'relative',
                            display: 'grid',
                            gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                            gap: 1.4,
                            alignItems: 'center',
                            p: 1.45,
                            pl: 1.7,
                            borderRadius: 2,
                            border: `1px solid ${isVisible ? '#C7D7FE' : '#E2E8F0'}`,
                            bgcolor: '#FFFFFF',
                            boxShadow: isVisible ? '0 0 0 1px rgba(37, 99, 235, 0.12)' : 'none',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: 4,
                              bgcolor: accent.border,
                            },
                          }}
                        >
                          <Box sx={{ width: 42, height: 42, borderRadius: 1.4, bgcolor: accent.bg, color: accent.fg, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18, border: `1px solid ${accent.border}` }}>
                            {domain[0]}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 16, lineHeight: 1.15, fontWeight: 900, color: '#111827' }}>
                              {widget.label}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#667085', fontWeight: 750, mt: 0.25 }}>
                              {domain}
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: '#475467', mt: 0.8, lineHeight: 1.35 }}>
                              {widget.description}
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.55, mt: 1 }}>
                              {tags.map((tag) => (
                                <Box key={tag} sx={{ px: 0.75, py: 0.25, borderRadius: 0.8, bgcolor: '#F1F5F9', color: '#475467', fontSize: 11, fontWeight: 800 }}>
                                  {tag}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                          <Button
                            variant={isVisible ? 'outlined' : 'contained'}
                            onClick={() => isVisible ? hidePersonalWidget(widgetId) : addPersonalWidget(widgetId)}
                            sx={{
                              minWidth: 74,
                              height: 36,
                              borderRadius: 1.3,
                              fontWeight: 900,
                              textTransform: 'none',
                              bgcolor: isVisible ? '#FFFFFF' : '#5B8CFF',
                              color: isVisible ? '#475467' : '#FFFFFF',
                              borderColor: isVisible ? '#CBD5E1' : '#5B8CFF',
                              '&:hover': { bgcolor: isVisible ? '#F8FAFC' : '#4678F2', borderColor: isVisible ? '#CBD5E1' : '#4678F2' },
                            }}
                          >
                            {isVisible ? 'Remove' : 'Add'}
                          </Button>
                        </Paper>
                      );
                    })}
                    {filteredCustomWidgets.map((widget) => {
                      const accent = personalWidgetAccentMap['My Widgets'];
                      const isVisible = addedCustomWidgetIds.includes(widget.id);
                      const tags = [widget.dataset, widget.visualization, ...widget.filters].slice(0, 4);

                      return (
                        <Paper
                          key={widget.id}
                          elevation={0}
                          sx={{
                            position: 'relative',
                            display: 'grid',
                            gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                            gap: 1.4,
                            alignItems: 'center',
                            p: 1.45,
                            pl: 1.7,
                            borderRadius: 2,
                            border: `1px solid ${isVisible ? '#C7D7FE' : '#E2E8F0'}`,
                            bgcolor: '#FFFFFF',
                            boxShadow: isVisible ? '0 0 0 1px rgba(37, 99, 235, 0.12)' : 'none',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              bottom: 0,
                              width: 4,
                              bgcolor: accent.border,
                            },
                          }}
                        >
                          <Box sx={{ width: 42, height: 42, borderRadius: 1.4, bgcolor: accent.bg, color: accent.fg, display: 'grid', placeItems: 'center', fontWeight: 900, fontSize: 18, border: `1px solid ${accent.border}` }}>
                            C
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: 16, lineHeight: 1.15, fontWeight: 900, color: '#111827' }}>
                              {widget.title}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: '#667085', fontWeight: 750, mt: 0.25 }}>
                              My Widgets
                            </Typography>
                            <Typography sx={{ fontSize: 13, color: '#475467', mt: 0.8, lineHeight: 1.35 }}>
                              {widget.dataset} widget using {widget.metrics.slice(0, 3).join(', ')} as a {widget.visualization}.
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.55, mt: 1 }}>
                              {tags.map((tag) => (
                                <Box key={tag} sx={{ px: 0.75, py: 0.25, borderRadius: 0.8, bgcolor: '#F1F5F9', color: '#475467', fontSize: 11, fontWeight: 800 }}>
                                  {tag}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                          <Box sx={{ display: 'grid', gap: 0.65, justifyItems: 'end' }}>
                            <Button
                              variant={isVisible ? 'outlined' : 'contained'}
                              onClick={() => setAddedCustomWidgetIds((prev) => isVisible ? prev.filter((id) => id !== widget.id) : [widget.id, ...prev])}
                              sx={{
                                minWidth: 74,
                                height: 34,
                                borderRadius: 1.3,
                                fontWeight: 900,
                                textTransform: 'none',
                                bgcolor: isVisible ? '#FFFFFF' : '#5B8CFF',
                                color: isVisible ? '#475467' : '#FFFFFF',
                                borderColor: isVisible ? '#CBD5E1' : '#5B8CFF',
                                '&:hover': { bgcolor: isVisible ? '#F8FAFC' : '#4678F2', borderColor: isVisible ? '#CBD5E1' : '#4678F2' },
                              }}
                            >
                              {isVisible ? 'Remove' : 'Add'}
                            </Button>
                            <Box sx={{ display: 'flex', gap: 0.45 }}>
                              <IconButton
                                aria-label={`Edit ${widget.title}`}
                                title="Edit config"
                                onClick={() => openCustomWidgetEditAssistant(widget)}
                                size="small"
                                sx={{ color: '#0457FF', bgcolor: '#EEF4FF', border: '1px solid #D7E5FF', '&:hover': { bgcolor: '#E0ECFF' } }}
                              >
                                <EditIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                              <IconButton
                                aria-label={`Share ${widget.title}`}
                                title="Share widget"
                                onClick={() => openCustomWidgetShareAssistant(widget)}
                                size="small"
                                sx={{ color: '#0457FF', bgcolor: '#EEF4FF', border: '1px solid #D7E5FF', '&:hover': { bgcolor: '#E0ECFF' } }}
                              >
                                <ShareIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                              <IconButton
                                aria-label={`Delete ${widget.title}`}
                                title="Delete widget"
                                onClick={() => deleteCustomWidget(widget.id)}
                                size="small"
                                sx={{ color: '#DC2626', bgcolor: '#FEF2F2', border: '1px solid #FECACA', '&:hover': { bgcolor: '#FEE2E2' } }}
                              >
                                <DeleteIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                            </Box>
                          </Box>
                        </Paper>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Paper>
      ) : null}

      {isEditMode ? (
        <Paper
          elevation={0}
          sx={{
            p: 1.4,
            borderRadius: 3,
            bgcolor: '#EFF6FF',
            border: '1px solid #BFDBFE',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DragIndicatorIcon sx={{ fontSize: '1rem', color: '#3B82F6' }} />
              <Box>
                <Typography sx={{ fontWeight: 900, color: '#1D4ED8' }}>Customize Board</Typography>
                <Typography variant="body2" sx={{ color: '#626465' }}>
                  Drag the grip icon to move widgets, drag edges to resize, and click X to delete from your view.
                </Typography>
              </Box>
            </Box>
            <Button variant="outlined" onClick={resetPersonalLayout} sx={{ fontWeight: 800, bgcolor: '#FFFFFF' }}>
              Reset Layout
            </Button>
          </Box>
        </Paper>
      ) : null}

      {isPersonalBoardEmpty ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: { xs: 280, md: 360 },
            borderRadius: 3,
            border: '1px dashed #AFCBFF',
            bgcolor: '#F8FBFF',
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            px: 3,
          }}
        >
          <Box sx={{ maxWidth: 420 }}>
            <Box
              sx={{
                width: 50,
                height: 50,
                mx: 'auto',
                mb: 1.35,
                borderRadius: 2,
                bgcolor: '#EEF4FF',
                color: '#0B63E5',
                display: 'grid',
                placeItems: 'center',
                border: '1px solid #D7E5FF',
              }}
            >
              <AddIcon sx={{ fontSize: 25 }} />
            </Box>
            <Typography sx={{ fontSize: 20, lineHeight: 1.15, fontWeight: 900, color: '#1F2366' }}>
              Start building your workstation
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#667085', mt: 0.75, lineHeight: 1.45 }}>
              Add widgets to create the view for this role or shift.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 17 }} />}
              onClick={() => setIsAddWidgetPanelOpen(true)}
              sx={{
                mt: 1.8,
                height: 38,
                borderRadius: 999,
                px: 2.4,
                textTransform: 'none',
                fontWeight: 900,
                boxShadow: 'none',
                bgcolor: '#0B63E5',
                '&:hover': { bgcolor: '#0758CE', boxShadow: 'none' },
              }}
            >
              Add Widget
            </Button>
          </Box>
        </Paper>
      ) : (
        <Box
          sx={{
            width: '100%',
            minWidth: 0,
            overflow: 'hidden',
            '& .react-grid-layout': {
              minHeight: 160,
            },
            '& .react-grid-item': {
              transition: isEditMode ? 'none' : 'transform 180ms ease',
            },
            '& .react-grid-placeholder': {
              backgroundColor: 'rgba(4, 78, 215, 0.10)',
              border: '1px dashed rgba(4, 78, 215, 0.35)',
              borderRadius: 2,
            },
            '& .react-resizable-handle': {
              opacity: isEditMode ? 0.85 : 0,
            },
          }}
        >
          <ResponsiveGridLayout
            key="my-workstation-grid"
            layouts={combinedPersonalVisibleLayouts as unknown as Record<string, unknown[]>}
            onDragStop={(layout) => commitPersonalBreakpointLayout(layout)}
            onResizeStop={(layout) => commitPersonalBreakpointLayout(layout)}
            onBreakpointChange={handlePersonalBreakpointChange}
            breakpoints={workstationBreakpoints}
            cols={workstationCols}
            rowHeight={32}
            margin={personalGridMargin}
            containerPadding={personalGridPadding}
            isDraggable={isEditMode}
            isResizable={isEditMode}
            resizeHandles={['se', 'sw', 's']}
            draggableHandle=".my-workstation-drag-handle"
            compactType="vertical"
            preventCollision={false}
          >
            {personalVisibleWidgetIds.map((widgetId) => (
              <div
                key={widgetId}
                style={{ height: '100%' }}
                data-workstation-tour-target={getWorkstationTourTarget(widgetId)}
              >
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  {isEditMode ? (
                    <WidgetEditToolbar
                      dragHandleClass="my-workstation-drag-handle"
                      onHide={() => hidePersonalWidget(widgetId)}
                    />
                  ) : null}
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    {renderPersonalWidget(widgetId)}
                  </Box>
                </Box>
              </div>
            ))}
            {customVisibleWidgets.map((widget) => (
              <div key={widget.id} style={{ height: '100%' }}>
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  {isEditMode ? (
                    <WidgetEditToolbar
                      dragHandleClass="my-workstation-drag-handle"
                      onHide={() => setAddedCustomWidgetIds((prev) => prev.filter((id) => id !== widget.id))}
                    />
                  ) : null}
                  <Box sx={{ flex: 1, minHeight: 0 }}>
                    {renderCreatedCustomWidget(widget)}
                  </Box>
                </Box>
              </div>
            ))}
          </ResponsiveGridLayout>
        </Box>
      )}
    </Box>
  );
};
