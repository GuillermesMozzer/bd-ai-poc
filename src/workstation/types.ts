export type WorkstationWidgetType = 'kpi' | 'chart' | 'action' | 'table' | 'activity';

export type WorkstationLayoutBreakpoint = 'lg' | 'md' | 'sm' | 'xs' | 'xxs';

export type WorkstationMachineStatus = 'Running' | 'Idle' | 'Stopped';

export type WorkstationSelectedItemType = 'work-order' | 'sku' | 'batch' | 'lot';

export type WorkstationAlertSeverity = 'info' | 'warning' | 'critical';

export type WorkstationWidgetSize = 'small' | 'medium' | 'large';

export type WorkstationLayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
};

export type WorkstationResponsiveLayouts = Record<WorkstationLayoutBreakpoint, WorkstationLayoutItem[]>;

export type WorkstationLineSummary = {
  line: string;
  product: string;
  sku: string;
  workOrder: string;
  batch: string;
  shift: string;
  shiftTarget: number;
  dailyTarget: number;
  currentOutput: number;
  shiftElapsedMinutes: number;
  shiftDurationMinutes: number;
  oee: number;
  availability: number;
  performance: number;
  quality: number;
  fpy: number;
  scrapRate: number;
  downtimeMinutes: number;
  mtbfHours: number;
  mttrMinutes: number;
  taktTimeSeconds: number;
  changeoverMinutes: number;
  energyPerUnitKwh: number;
  goodUnits: number;
  rejectedUnits: number;
  reworkUnits: number;
  targetThroughputPerHour: number;
};

export type WorkstationProcess = {
  name: string;
  machine: string;
  throughputPerHour: number;
  cycleTimeSeconds: number;
  oee: number;
  status: WorkstationMachineStatus;
  runningPercent: number;
  idlePercent: number;
  setupPercent: number;
  breakdownPercent: number;
  fpy: number;
  energyKwh: number;
  downtimeMinutes: number;
  lastStopReason: string;
};

export type WorkstationMetricPoint = {
  label: string;
  [key: string]: string | number;
};

export type WorkstationTraceabilityEvent = {
  timestamp: string;
  event: string;
  entity: string;
  id: string;
  quantity: string;
  machine: string;
  status: string;
  statusColor: string;
  statusBackground: string;
};

export type WorkstationMachinePerformanceRow = {
  machine: string;
  status: WorkstationMachineStatus;
  statusColor: string;
  statusBackground: string;
  oee: string;
  cycleTime: string;
  throughput: string;
  downtime: string;
  lastStop: string;
};

export type WorkstationSelectedItemProperty = {
  label: string;
  value: string;
};

export type WorkstationSelectedItemDetail = {
  type: WorkstationSelectedItemType;
  name: string;
  status: string;
  statusColor: string;
  statusBackground: string;
  properties: WorkstationSelectedItemProperty[];
};

export type WorkstationActionTask = {
  title: string;
  dueLabel: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
};

export type WorkstationMeetingTopic = {
  id: string;
  text: string;
  owner: string;
  initials: string;
  avatarBg: string;
  scheduledDate: string;
  createdAt: string;
};

export type WorkstationMaterialRisk = {
  label: string;
  minutesLeft: number;
  timeLabel: string;
  progressPercent: number;
  detail: string;
  tone: string;
  alert: boolean;
};

export type WorkstationEscalationAction = {
  label: string;
  iconKey: 'leader' | 'maintenance' | 'quality' | 'material';
  tone: string;
};

export type WorkstationAlert = {
  severity: WorkstationAlertSeverity;
  title: string;
  message: string;
  activeCount: number;
};

export type WorkstationWidgetDefinition = {
  id: string;
  label: string;
  type: WorkstationWidgetType;
  description: string;
  defaultSize: WorkstationWidgetSize;
  defaultVisible: boolean;
  defaultLayout: {
    w: number;
    h: number;
    minW: number;
    minH: number;
  };
};

export type WorkstationLayoutState = {
  hiddenWidgetIds: string[];
  layouts: WorkstationResponsiveLayouts;
};

export type WorkstationDashboardData = {
  summary: WorkstationLineSummary;
  alert: WorkstationAlert;
  processes: WorkstationProcess[];
  operationalMetrics: WorkstationMetricPoint[];
  outputByProcess: WorkstationMetricPoint[];
  throughputByProcess: WorkstationMetricPoint[];
  machineStateDistribution: WorkstationMetricPoint[];
  outputByShift: WorkstationMetricPoint[];
  defectBreakdown: WorkstationMetricPoint[];
  bottleneckRanking: WorkstationMetricPoint[];
  cycleTimeTrend: WorkstationMetricPoint[];
  qualityByShift: WorkstationMetricPoint[];
  downtimePareto: WorkstationMetricPoint[];
  wipLevels: WorkstationMetricPoint[];
  alarmTrend: WorkstationMetricPoint[];
  processYield: WorkstationMetricPoint[];
  utilitiesByMachine: WorkstationMetricPoint[];
  energyTrend: WorkstationMetricPoint[];
  outputTrend: WorkstationMetricPoint[];
  scrapTrend: WorkstationMetricPoint[];
  traceabilityHistory: WorkstationTraceabilityEvent[];
  machinePerformance: WorkstationMachinePerformanceRow[];
  hourlyOutput: WorkstationMetricPoint[];
  topDowntimeCauses: WorkstationMetricPoint[];
  cycleTimeVsTarget: Record<string, WorkstationMetricPoint[]>;
  selectedItems: Record<WorkstationSelectedItemType, WorkstationSelectedItemDetail>;
  operatorTasks: WorkstationActionTask[];
  materialRisks: WorkstationMaterialRisk[];
  escalationActions: WorkstationEscalationAction[];
};

export type PersonalWidgetDomain = 'Production' | 'Quality' | 'Safety' | 'Delivery' | 'People' | 'Cost' | 'OEE' | 'Action Management' | 'Maintenance' | 'My Widgets' | 'All';

export type CustomWidgetDataset = 'Production' | 'CIL' | 'Centerline' | 'Equipment Setup Changeover' | 'Quality' | 'Safety' | 'People' | 'Cost' | 'OEE' | 'Energy' | 'Scrap' | 'Downtime' | 'Shift Schedule' | 'Action Tracker';

export type CustomWidgetEditSection = 'Dataset' | 'Metrics' | 'Style' | 'Filters';

export type CustomCreatedWidget = {
  id: string;
  title: string;
  dataset: CustomWidgetDataset;
  metrics: string[];
  visualization: string;
  filters: string[];
};

export type CustomWidgetEditTranscriptItem = {
  id: string;
  role: 'user' | 'assistant' | 'typing' | 'preview';
  text?: string;
  widget?: CustomCreatedWidget;
  showActions?: boolean;
};

export type PersonalWorkstationState = {
  addedCustomWidgetIds: string[];
  customWidgets: CustomCreatedWidget[];
  hiddenWidgetIds: string[];
  layouts: WorkstationResponsiveLayouts;
  lossFocusedMetricIds: string[];
  layoutSchemaVersion: number;
};

export type TextBoxWidgetPreferences = {
  content: string;
  backgroundTone: 'white' | 'neutral' | 'brand' | 'success' | 'warning' | 'error';
  textTone: 'primary' | 'secondary' | 'brand' | 'success' | 'warning' | 'error';
  fontSize: 12 | 14 | 16 | 20 | 24 | 34;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
};

export type WorkstationWidgetPreferences = {
  actionTracker?: {
    viewMode: string;
  };
  textBox?: TextBoxWidgetPreferences;
  textBoxes?: Record<string, TextBoxWidgetPreferences>;
  lossFocusedKpis?: {
    activeMetricIds?: string[];
    chartType?: 'bars' | 'lines';
  };
  cost?: {
    breakdownBy: 'line' | 'department';
    showBreakdown: boolean;
    chartType?: 'bars' | 'lines';
    stackedCharts?: boolean;
    showStackedChartControls?: boolean;
  };
  delivery?: {
    breakdownBy: 'line' | 'department';
    showBreakdown: boolean;
    chartType?: 'bars' | 'lines';
    showCurrentOrderCard?: boolean;
  };
  people?: {
    breakdownBy: 'line' | 'department';
    showBreakdown: boolean;
    chartType?: 'bars' | 'lines';
  };
};

export type MaintenanceOpenTarget = 'hub' | 'followup' | 'planner' | 'calendar' | 'equipment-ledger' | 'cbm-pdm' | 'performance' | 'spareParts';
export type WorkstationContextualizationTarget = 'syringe-assembly-sa-204' | 'conveyor-belt-c4';

export type WorkstationContextualAiAssistantPayload = {
  contextTitle: string;
  contextSubtitle: string;
  problemFilter?: string;
  openingText: string;
  autoRunActionIndex?: number;
  preserveConversation?: boolean;
  executionGuide?: {
    mode: 'CIL' | 'CL' | 'Changeover';
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

export type PersonalWorkstationDashboardProps = {
  data: any;
  layoutStorageKey?: string;
  initialSnapshot?: any;
  chartFilters?: {
    shift: 'All' | 'Shift A' | 'Shift B' | 'Shift C';
    timeframe: 'Today' | 'Yesterday' | 'Last 7 days' | 'Last 30 days';
  };
  hideDeliveryCurrentOrderCard?: boolean;
  useTierSqdcCarousel?: boolean;
  tierOverviewLabel?: string;
  tierOverviewItemPrefix?: string;
  tier1SeriousInjuryIncidentActive?: boolean;
  currentUserName?: string;
  startEmpty?: boolean;
  isEditMode?: boolean;
  setIsEditMode?: (value: boolean) => void;
  tierBoardManualEditMode?: boolean;
  onEditTierWidget?: (widgetId: string) => void;
  tierBoardCostData?: {
    totalScrapProduced: number;
    target: number;
    scrapValues: number[];
  };
  onOpenActionTracker: () => void;
  onOpenSafetyAiReport?: () => void;
  onOpenLineLog: () => void;
  onOpenMaintenance: (target?: MaintenanceOpenTarget) => void;
  onOpenAiAssistant?: (payload: WorkstationContextualAiAssistantPayload) => void;
  onOpenContextualization?: (target: WorkstationContextualizationTarget) => void;
  onOpenEsoEntry?: () => void;
  selectedHeaderHierarchyId?: string;
  onPublish?: () => void;
  onOpenTierMeeting: () => void;
  meetingTopics?: WorkstationMeetingTopic[];
};

export type PublishedWorkstationSnapshot = {
  layoutState: unknown;
  widgetPreferences: WorkstationWidgetPreferences;
};

export interface WorkstationWidgetProps {
  className?: string;
  style?: React.CSSProperties;
  timeframe?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'shift';
  shift?: string;
  onViewModeChange?: (viewMode: 'graph' | 'table') => void;
  onExpand?: () => void;
  domain?: string;
  selectedHeaderHierarchyId?: string;
}
