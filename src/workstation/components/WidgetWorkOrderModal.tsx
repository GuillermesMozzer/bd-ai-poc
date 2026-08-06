import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  IconButton, Typography, Box, Chip, TextField, Tabs, Tab,
  Button, Checkbox, FormControlLabel, Paper, InputAdornment, Radio,
  Accordion, AccordionSummary, AccordionDetails, MenuItem,
} from '@mui/material';
import {
  Close as CloseIcon,
  Add as AddIcon,
  DeleteOutline as DeleteOutlineIcon,
  Remove as RemoveIcon,
  Warning as WarningIcon,
  Shield as ShieldIcon,
  Circle as CircleIcon,
  CalendarMonth as CalendarMonthIcon,
  LocationOn as LocationOnIcon,
  Inventory2Outlined as InventoryIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  Pause as PauseIcon,
  PlayArrow as PlayArrowIcon,
  Build as BuildIcon,
  ExpandMore as ExpandMoreIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  FactCheck as FactCheckIcon,
  Engineering as EngineeringIcon,
  AccessTime as AccessTimeIcon,
  UploadFile as UploadFileIcon,
  ReportProblem as ReportProblemIcon,
  TaskAlt as TaskAltIcon,
  VerifiedUser as VerifiedUserIcon,
  Science as ScienceIcon,
  AutoAwesome as AutoAwesomeIcon,
  Link as LinkIcon,
  OpenInNew as OpenInNewIcon,
  GridView as GridViewIcon,
} from '@mui/icons-material';
import { useEffect, useMemo, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import { InventoryPartDrawer, findInventoryPartByCode, type InventoryPart } from '../../Maintenance/components/InventoryPartDrawer';

export type WorkOrderType = 'Corrective' | 'Breakdown' | 'Preventive';
export type EquipmentHistoryType = 'CIL' | 'Centerline' | 'Breakdown' | 'Preventive' | 'Corrective';
type EquipmentMaintenanceCondition = '' | 'Stopped / Internal' | 'Running / External';

type SafetyRequirements = {
  equipmentCondition?: EquipmentMaintenanceCondition;
  lotoRequired: boolean;
  lockoutPoint?: string;
  procedure?: string;
  ppe: string[];
  hazards: string[];
  permits?: Array<string | PermitRequirement>;
  safetyNotes?: string;
};

type QualityRequirements = {
  qualityImpacting: boolean;
  requiredValidation: string[];
  evidenceRequired: string[];
  qaApprovalRequired?: boolean;
  qualityNotes?: string;
};

type MoldingCavityStatus = 'Watch' | 'Open' | 'Resolved';

type MoldingCavityDetail = {
  cavity: string;
  position: string;
  issue: string;
  actionTaken: string;
  status: MoldingCavityStatus;
  attachments: string;
  notes: string;
};

type MoldingQualityDetails = {
  inspector: string;
  machineNumber: string;
  moldNumber: string;
  jobNumber: string;
  partNumber: string;
  firstPieceApproved: 'Yes' | 'No';
  newCavityCheck: string;
  overallStatus: 'Pass' | 'Watch' | 'Hold';
  defectType: string;
  affectedCavities: string[];
  cavityDetails: MoldingCavityDetail[];
};

type PermitStatus = 'Pending' | 'Approved' | 'Expired';

type PermitRequirement = {
  type: string;
  status?: PermitStatus;
  number?: string;
  expiration?: string;
};

export type SparePart = {
  id: string;
  name: string;
  location: string;
  available: number;
  total: number;
  quantity?: number;
};

export type FutureAction = {
  id: string;
  date: string;
  type: WorkOrderType;
  activityType: string;
  priority: string;
};

export type LinkedWorkOrder = {
  id: string;
  type: WorkOrderType | 'Maintenance Request';
  title: string;
  description: string;
  scheduledFor: string;
  assignee: string;
  status: string;
  targetWorkOrderId?: string;
};

export type WorkOrderLinkCandidate = LinkedWorkOrder & {
  priority: string;
};

export type EquipmentHistoryEntry = {
  id: string;
  date: string;
  type: EquipmentHistoryType;
  description: string;
  responsible: string;
};

export type AttachedFile = {
  name: string;
  href?: string;
};

export type PreventiveOperation = {
  op: string;
  operation: string;
  description: string;
  spareParts?: {
    name: string;
    stagedInToolCrib: boolean;
  }[];
};

type MaintenanceRequestSummary = {
  id: string;
  equipment: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
};

export type WorkOrder = {
  id: string;
  title: string;
  type: WorkOrderType;
  assignedTo?: string | string[];
  typeColor: string;
  accent: string;
  location: string;
  date: string;
  dueDate?: string;
  equipment: string;
  equipmentCriticality?: string;
  activityType: string;
  priority: string;
  problemDescription: string;
  partsNeeded: SparePart[];
  futureActions: FutureAction[];
  linkedWorkOrders?: LinkedWorkOrder[];
  machineHistory: EquipmentHistoryEntry[];
  attachedFiles: AttachedFile[];
  safetyRequirements: SafetyRequirements;
  qualityRequired: string;
  qualityRequirements?: QualityRequirements;
  moldingQualityDetails?: MoldingQualityDetails;
  preventiveDetails?: {
    pmPlan: string;
    frequency: string;
    plannedDuration: string;
  };
  tasklist?: PreventiveOperation[];
};

type WorkOrderTab = 'parts' | 'molding' | 'future' | 'linked' | 'history' | 'files' | 'tasklist';

interface WidgetWorkOrderModalProps {
  open: boolean;
  onClose: () => void;
  workOrder: WorkOrder | null;
  workOrderCandidates?: WorkOrderLinkCandidate[];
  linkedWorkOrders?: LinkedWorkOrder[];
  onLinkWorkOrder?: (sourceWorkOrderId: string, linkedWorkOrder: LinkedWorkOrder) => void;
  onOpenWorkOrder?: (workOrderId: string) => void;
}

const tabLabels: Record<WorkOrderTab, string> = {
  parts: 'PARTS NEEDED',
  molding: 'CAVITY MAP',
  future: 'FUTURE ACTIONS',
  linked: 'LINKED WORK ORDERS',
  history: 'EQUIPMENT HISTORY',
  files: 'ATTACHED FILES',
  tasklist: 'TASKLIST',
};

const sparePartCatalog: SparePart[] = [
  { id: 'SAP-SEAL-HYD-01', name: 'Hydraulic Cylinder Seal Kit', location: 'TC1-M3-G2', available: 3, total: 10 },
  { id: 'SAP-ORING-VIT-02', name: '10-Ring Set (Viton)', location: 'TC1-M3-G2', available: 0, total: 10 },
  { id: 'SAP-HYD-FLUID-01', name: 'Hydraulic Fluid (1L)', location: 'TC1-M3-G2', available: 0, total: 10 },
  { id: 'SAP-FILTER-HYD-03', name: 'Hydraulic Return Filter', location: 'TC1-M2-B4', available: 0, total: 6 },
  { id: 'SAP-BELT-CV-210', name: 'Conveyor Drive Belt', location: 'TC1-M1-A2', available: 2, total: 5 },
  { id: 'SAP-ENC-CBL-402', name: 'Servo Encoder Cable', location: 'TC1-M4-C1', available: 1, total: 4 },
  { id: 'SAP-GRIP-VAC-00', name: 'Robot Gripper Vacuum Cup Set', location: 'TC1-M4-C2', available: 0, total: 0 },
];

const aiSuggestedParts = sparePartCatalog.slice(0, 3);

const maintenanceRequestCatalog: MaintenanceRequestSummary[] = [
  { id: 'MR 606034610', equipment: 'Conveyor CV-210', title: 'Inspect guide rail wear on discharge side', priority: 'medium' },
  { id: 'MR 606034611', equipment: 'Conveyor CV-210', title: 'Check intermittent noise on tail pulley', priority: 'high' },
  { id: 'MR 606034612', equipment: 'Packaging Robot RB-402', title: 'Review gripper vacuum drop during startup', priority: 'medium' },
  { id: 'MR 606034613', equipment: 'Transfer Pump P-118', title: 'Validate small leak reported near seal housing', priority: 'low' },
  { id: 'MR 606034614', equipment: 'Photoeye Sensor Z2.C20', title: 'Clean and secure sensor bracket after vibration alert', priority: 'low' },
];

type WorkOrderExecutionState = 'idle' | 'running' | 'paused';

type PauseReason =
  | 'Waiting for Parts'
  | 'Waiting for Production Release'
  | 'Waiting for Support'
  | 'Waiting for Safety Clearance'
  | 'Scope Under Review'
  | 'Shift End'
  | 'Resource Unavailable'
  | 'Quality Hold'
  | 'Other';

type WorkOrderPauseEvent = {
  id: string;
  pausedBy: string;
  pausedAt: string;
  reason: PauseReason;
  notes: string;
  expectedResumeAt?: string;
};

type PreventiveTaskState = {
  done: boolean;
  exception: boolean;
  note: string;
};

type SafetyExecutionGateState = {
  lockoutConfirmed: boolean;
  tagoutConfirmed: boolean;
  ppeConfirmed: boolean;
};

const initialSafetyGateState: SafetyExecutionGateState = {
  lockoutConfirmed: false,
  tagoutConfirmed: false,
  ppeConfirmed: false,
};

const pauseReasons: PauseReason[] = [
  'Waiting for Parts',
  'Waiting for Production Release',
  'Waiting for Support',
  'Waiting for Safety Clearance',
  'Scope Under Review',
  'Shift End',
  'Resource Unavailable',
  'Quality Hold',
  'Other',
];

const breakdownFailureModes = [
  'Deterioration',
  'Uncontrolled Stress',
  'Other',
  'Insufficient Strength',
];

const breakdownRcaOptionsByFailureMode: Record<string, string[]> = {
  Deterioration: [
    'Inadequate Compliance with Basic Requirements',
    'Neglected Deterioration',
  ],
  'Uncontrolled Stress': [
    'Non-compliance with usage requirements',
    'Lack of skill',
  ],
  'Insufficient Strength': [
    'Inherent design weaknesses',
  ],
};

const correctiveRcaOptions = [
  'Unsafe Conditions',
  'Minor Flaws',
  'Lack of Base',
  'Hard to Reach Areas Conditions',
  'Sources of Contamination',
  'Quality Defects',
  'Unnecessary Equipment',
  'Other',
];

function formatWorkOrderElapsedTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds}`;
}

function parseDurationMinutes(value?: string) {
  if (!value) return null;
  const numericValue = Number(value.match(/\d+/)?.[0]);
  return Number.isFinite(numericValue) ? numericValue : null;
}

function formatDurationComparison(estimatedDuration: string | undefined, actualDurationMinutes: number, durationDeltaMinutes: number | null) {
  const estimatedLabel = estimatedDuration ?? 'Not defined';
  if (durationDeltaMinutes === null) {
    return `Estimated: ${estimatedLabel} | Actual: ${actualDurationMinutes} min`;
  }
  const deltaLabel = durationDeltaMinutes === 0
    ? 'on time'
    : `${durationDeltaMinutes > 0 ? '+' : ''}${durationDeltaMinutes} min`;
  return `Estimated: ${estimatedLabel} | Actual: ${actualDurationMinutes} min (${deltaLabel})`;
}

function formatPauseTimestamp(date: Date) {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatExpectedResumeDateTime(value?: string) {
  if (!value) return undefined;
  return formatPauseTimestamp(new Date(value));
}

function normalizePermitRequirement(permit: string | PermitRequirement): PermitRequirement {
  if (typeof permit === 'string') {
    return { type: permit, status: 'Pending' };
  }
  return { ...permit, status: permit.status ?? 'Pending' };
}

function getPermitKey(permit: PermitRequirement) {
  return `${permit.type}-${permit.number ?? 'planned'}`;
}

function isQaApprovalRequired(qualityRequirements?: QualityRequirements) {
  if (!qualityRequirements?.qualityImpacting) return false;
  return Boolean(qualityRequirements.qaApprovalRequired)
    || qualityRequirements.requiredValidation.some((item) => item.toLowerCase().includes('qa approval'));
}

function getPlannedQualityRequirements(workOrder: WorkOrder): QualityRequirements {
  return workOrder.qualityRequirements ?? {
    qualityImpacting: Boolean(workOrder.qualityRequired),
    requiredValidation: workOrder.qualityRequired ? [workOrder.qualityRequired] : [],
    evidenceRequired: [],
  };
}

function getCompletionRequirementItems(qualityRequirements: QualityRequirements) {
  if (!qualityRequirements.qualityImpacting) return [];

  const qaApprovalRequired = isQaApprovalRequired(qualityRequirements);
  return [
    ...qualityRequirements.requiredValidation.map((label) => ({ label, type: 'Validation' })),
    ...qualityRequirements.evidenceRequired.map((label) => ({ label, type: 'Evidence' })),
    ...(qaApprovalRequired ? [{ label: 'QA approval / quality release', type: 'Approval' }] : []),
  ];
}

function getSafetyGateBlockMessages(workOrder: WorkOrder, gateState: SafetyExecutionGateState) {
  const messages: string[] = [];
  const { safetyRequirements } = workOrder;
  const permits = (safetyRequirements.permits ?? []).map(normalizePermitRequirement);

  if (safetyRequirements.lotoRequired && (!gateState.lockoutConfirmed || !gateState.tagoutConfirmed)) {
    messages.push('Confirm lockout and tagout before starting execution.');
  }

  if (safetyRequirements.ppe.length > 0 && !gateState.ppeConfirmed) {
    messages.push('Confirm required PPE before starting execution.');
  }

  return messages;
}

export default function WidgetWorkOrderModal({
  open,
  onClose,
  workOrder,
  workOrderCandidates = [],
  linkedWorkOrders,
  onLinkWorkOrder,
  onOpenWorkOrder,
}: WidgetWorkOrderModalProps) {
  const [tabValue, setTabValue] = useState(0);
  const [technicalEvaluation, setTechnicalEvaluation] = useState('');
  const [selectedParts, setSelectedParts] = useState<SparePart[]>([]);
  const [moldingDetails, setMoldingDetails] = useState<MoldingQualityDetails | null>(null);
  const [isAiSuggestionDismissed, setIsAiSuggestionDismissed] = useState(false);
  const [executionState, setExecutionState] = useState<WorkOrderExecutionState>('idle');
  const [executionStartedAt, setExecutionStartedAt] = useState<number | null>(null);
  const [executionStartedDateTime, setExecutionStartedDateTime] = useState('');
  const [executionFinishedDateTime, setExecutionFinishedDateTime] = useState('');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false);
  const [pauseReason, setPauseReason] = useState<PauseReason | ''>('');
  const [pauseNotes, setPauseNotes] = useState('');
  const [expectedResumeAt, setExpectedResumeAt] = useState('');
  const [pauseEvents, setPauseEvents] = useState<WorkOrderPauseEvent[]>([]);
  const [isCompletionStep, setIsCompletionStep] = useState(false);
  const [tasklistState, setTasklistState] = useState<Record<string, PreventiveTaskState>>({});
  const [safetyGateState, setSafetyGateState] = useState<SafetyExecutionGateState>(initialSafetyGateState);

  const tabs = useMemo<WorkOrderTab[]>(() => {
    const baseTabs: WorkOrderTab[] = workOrder?.moldingQualityDetails
      ? ['molding', 'linked', 'history', 'files', 'future']
      : ['parts', 'linked', 'history', 'files', 'future'];
    return workOrder?.type === 'Preventive' ? ['tasklist', ...baseTabs] : baseTabs;
  }, [workOrder?.moldingQualityDetails, workOrder?.type]);

  useEffect(() => {
    setTabValue(0);
    setTechnicalEvaluation('');
    setSelectedParts(workOrder?.partsNeeded.map((part) => ({ ...part, quantity: part.quantity ?? 1 })) ?? []);
    setMoldingDetails(workOrder?.moldingQualityDetails
      ? {
        ...workOrder.moldingQualityDetails,
        newCavityCheck: workOrder.moldingQualityDetails.newCavityCheck ?? '',
        affectedCavities: [...workOrder.moldingQualityDetails.affectedCavities],
        cavityDetails: workOrder.moldingQualityDetails.cavityDetails.map((detail) => ({ ...detail })),
      }
      : null
    );
    setIsAiSuggestionDismissed(false);
    setExecutionState('idle');
    setExecutionStartedAt(null);
    setExecutionStartedDateTime('');
    setExecutionFinishedDateTime('');
    setElapsedSeconds(0);
    setIsPauseDialogOpen(false);
    setPauseReason('');
    setPauseNotes('');
    setExpectedResumeAt('');
    setPauseEvents([]);
    setIsCompletionStep(false);
    setTasklistState({});
    setSafetyGateState(initialSafetyGateState);
  }, [workOrder?.id]);

  useEffect(() => {
    if (executionState !== 'running' || executionStartedAt === null) return;
    const timer = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - executionStartedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [executionStartedAt, executionState]);

  if (!workOrder) return null;

  const activeTab = tabs[tabValue] ?? 'parts';
  const showTechnicalEvaluation = workOrder.type === 'Corrective' || workOrder.type === 'Breakdown';
  const showAiPartsSuggestion = showTechnicalEvaluation
    && !workOrder.moldingQualityDetails
    && technicalEvaluation.trim().length > 0
    && selectedParts.length === 0
    && !isAiSuggestionDismissed;
  const relatedMaintenanceRequests = maintenanceRequestCatalog.filter((request) => request.equipment === workOrder.equipment);
  const isExecutionActive = executionState !== 'idle';
  const showTasklistChecks = workOrder.type === 'Preventive';
  const safetyGateBlockMessages = getSafetyGateBlockMessages(workOrder, safetyGateState);
  const activeLinkedWorkOrders = linkedWorkOrders ?? workOrder.linkedWorkOrders ?? [];
  const linkedWorkOrderIds = new Set(activeLinkedWorkOrders.map((linkedWorkOrder) => linkedWorkOrder.id));

  const startExecution = () => {
    const startedAt = new Date();
    setIsCompletionStep(false);
    setElapsedSeconds(0);
    setExecutionStartedAt(startedAt.getTime());
    setExecutionStartedDateTime(startedAt.toISOString().slice(0, 16));
    setExecutionFinishedDateTime('');
    setExecutionState('running');
  };

  const pauseExecution = () => {
    if (executionState === 'paused') {
      setExecutionStartedAt(Date.now() - elapsedSeconds * 1000);
      setExecutionState('running');
      return;
    }

    setPauseReason('');
    setPauseNotes('');
    setExpectedResumeAt('');
    setIsPauseDialogOpen(true);
  };

  const confirmPauseExecution = () => {
    if (!pauseReason || (pauseReason === 'Other' && !pauseNotes.trim())) return;

    const pausedAt = new Date();
    setElapsedSeconds((currentElapsedSeconds) => {
      const currentStartedAt = executionStartedAt;
      if (currentStartedAt === null) return currentElapsedSeconds;
      return Math.floor((Date.now() - currentStartedAt) / 1000);
    });
    setPauseEvents((currentEvents) => [
      {
        id: `pause-${pausedAt.getTime()}`,
        pausedBy: 'Current Operator',
        pausedAt: formatPauseTimestamp(pausedAt),
        reason: pauseReason,
        notes: pauseNotes.trim(),
        expectedResumeAt: formatExpectedResumeDateTime(expectedResumeAt),
      },
      ...currentEvents,
    ]);
    setExecutionStartedAt(null);
    setExecutionState('paused');
    setIsPauseDialogOpen(false);
  };

  const finishExecution = () => {
    const finishedAt = new Date();
    setElapsedSeconds((currentElapsedSeconds) => {
      if (executionStartedAt === null) return currentElapsedSeconds;
      return Math.floor((finishedAt.getTime() - executionStartedAt) / 1000);
    });
    setExecutionStartedAt(null);
    setExecutionFinishedDateTime(finishedAt.toISOString().slice(0, 16));
    setExecutionState('idle');
    setIsCompletionStep(true);
  };

  return (
    <>
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, minHeight: '80vh', width: { xs: '100%', md: '90%', lg: '85%', xl: '75%' } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2, pb: 1 }}>
        <Typography variant="h6" fontWeight={700} color={tokenBrand.dark}>Work Order</Typography>
        <Chip
          label={isCompletionStep ? 'Completion' : executionState === 'paused' ? 'Paused' : 'New'}
          variant="outlined"
          size="small"
          sx={{
            color: isCompletionStep ? tokenBrand.main : executionState === 'paused' ? tokenWarning.dark : workstationVisuals.tierTextMeta,
            borderColor: isCompletionStep ? tokenBrand.lightest : executionState === 'paused' ? tokenWarning.lighter : tokenNeutral.darker,
            bgcolor: isCompletionStep ? tokenNeutral.lightest : executionState === 'paused' ? tokenNeutral.lightest : 'transparent',
            fontWeight: 600,
          }}
        />
        {executionState === 'paused' && pauseEvents[0] && (
          <Chip
            label={pauseEvents[0].reason}
            size="small"
            sx={{ color: tokenWarning.darker, bgcolor: tokenError.lightest, border: `1px solid ${tokenWarning.lightest}`, fontWeight: 700 }}
          />
        )}
        <IconButton onClick={onClose} sx={{ ml: 'auto', color: tokenBrand.light }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pb: 0 }}>
        {isCompletionStep ? (
          <WorkOrderCompletionScreen
            workOrder={workOrder}
            selectedParts={selectedParts}
            onPartsChange={setSelectedParts}
            elapsedSeconds={elapsedSeconds}
            executionStartedDateTime={executionStartedDateTime}
            executionFinishedDateTime={executionFinishedDateTime}
            pauseEvents={pauseEvents}
            tasklistState={tasklistState}
            moldingQualityDetails={moldingDetails}
            onBack={() => setIsCompletionStep(false)}
          />
        ) : (
        <>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1.5 }}>
          <InfoBox label="Number" value={workOrder.id} />
          <InfoBox label="Type" value={workOrder.type} />
          <InfoBox label="Location" value={workOrder.location} />
          <InfoBox label="Equipment" value={workOrder.equipment} />
          <InfoBox label="Activity Type" value={workOrder.activityType} />
          <InfoBox label="Priority Type" value={workOrder.priority} />
        </Box>

        <InfoBox label="Problem Description" value={workOrder.problemDescription} />
        {workOrder.type === 'Preventive' && <PreventiveFields workOrder={workOrder} />}

        {showTechnicalEvaluation && (
          <TextField
            label="Technical Evaluation"
            value={technicalEvaluation}
            onChange={(event) => setTechnicalEvaluation(event.target.value)}
            InputLabelProps={{ shrink: true }}
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
        )}

        {showAiPartsSuggestion && (
          <AiPartsSuggestion
            onDismiss={() => setIsAiSuggestionDismissed(true)}
            onAdd={() => {
              setSelectedParts(aiSuggestedParts.map((part) => ({ ...part, quantity: 1 })));
              setIsAiSuggestionDismissed(true);
              setTabValue(tabs.indexOf('parts'));
            }}
          />
        )}

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 380px' }, gap: 3, mt: 1, flexGrow: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <Tabs
              value={tabValue}
              onChange={(_, val) => setTabValue(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 44 }}
            >
              {tabs.map((tab) => (
                <Tab key={tab} label={tabLabels[tab]} sx={{ fontWeight: 700, fontSize: '0.8rem', minHeight: 44 }} />
              ))}
            </Tabs>

            <Box sx={{ py: 2.5 }}>
              {activeTab === 'parts' && <PartsNeededTab parts={selectedParts} onPartsChange={setSelectedParts} />}
              {activeTab === 'molding' && moldingDetails && <MoldingCavityFields details={moldingDetails} onChange={setMoldingDetails} />}
              {activeTab === 'future' && (
                <FutureActionsTab
                  futureActions={workOrder.futureActions}
                  maintenanceRequests={relatedMaintenanceRequests}
                  workOrderCandidates={workOrderCandidates}
                  linkedWorkOrderIds={linkedWorkOrderIds}
                  onLinkWorkOrder={(linkedWorkOrder) => onLinkWorkOrder?.(workOrder.id, linkedWorkOrder)}
                />
              )}
              {activeTab === 'linked' && <LinkedWorkOrdersTab linkedWorkOrders={activeLinkedWorkOrders} onOpenWorkOrder={onOpenWorkOrder} />}
              {activeTab === 'history' && <EquipmentHistoryTab items={workOrder.machineHistory} pauseEvents={pauseEvents} />}
              {activeTab === 'files' && <AttachedFilesTab files={workOrder.attachedFiles} />}
              {activeTab === 'tasklist' && (
                <TasklistTab
                  tasks={workOrder.tasklist ?? []}
                  showTaskChecks={showTasklistChecks}
                  taskState={tasklistState}
                  onTaskStateChange={(taskId, patch) => setTasklistState((current) => ({
                    ...current,
                    [taskId]: {
                      done: false,
                      exception: false,
                      note: '',
                      ...current[taskId],
                      ...patch,
                    },
                  }))}
                />
              )}
            </Box>
          </Box>

          <SafetyRequirementsPanel
            workOrder={workOrder}
            gateState={safetyGateState}
            onGateStateChange={setSafetyGateState}
            blockMessages={safetyGateBlockMessages}
          />
        </Box>
        </>
        )}
      </DialogContent>

      {!isCompletionStep && (
      <DialogActions sx={{ p: 2.5, px: 3, pt: 0, gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {!isCompletionStep && isExecutionActive && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1.4, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'grid', gap: 0.1 }}>
              <Typography variant="caption" sx={{ color: workstationVisuals.tierTextMeta, lineHeight: 1 }}>
                Execution Time
              </Typography>
              <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 500, fontSize: '1.15rem', lineHeight: 1.05, letterSpacing: 0 }}>
                {formatWorkOrderElapsedTime(elapsedSeconds)}
              </Typography>
            </Box>
            <Button
              onClick={pauseExecution}
              variant="outlined"
              startIcon={executionState === 'paused' ? <PlayArrowIcon sx={{ fontSize: 15 }} /> : <PauseIcon sx={{ fontSize: 15 }} />}
              sx={{ borderColor: tokenBrand.light, color: tokenBrand.light, fontWeight: 800, fontSize: 11, borderRadius: 999, minHeight: 27, px: 1.5 }}
            >
              {executionState === 'paused' ? 'RESUME EXECUTION' : 'PAUSE EXECUTION'}
            </Button>
            <Button
              onClick={finishExecution}
              variant="contained"
              startIcon={<BuildIcon sx={{ fontSize: 16 }} />}
              sx={{ bgcolor: tokenBrand.main, color: tokenCommon.white, fontWeight: 800, fontSize: 11, borderRadius: 1.2, minHeight: 34, px: 2.2, '&:hover': { bgcolor: tokenBrand.main } }}
            >
              FINISH EXECUTION
            </Button>
          </Box>
        )}
        {!isCompletionStep && !isExecutionActive && (
          <>
            <Button onClick={onClose} variant="outlined" sx={{ borderColor: tokenBrand.light, color: tokenBrand.light, fontWeight: 600, fontSize: '0.8rem', borderRadius: 999, px: 3 }}>CANCEL</Button>
            <Button onClick={startExecution} variant="contained" sx={{ bgcolor: tokenBrand.main, color: tokenCommon.white, fontWeight: 600, fontSize: '0.8rem', borderRadius: 999, px: 3, '&:hover': { bgcolor: tokenBrand.dark } }}>START EXECUTION</Button>
          </>
        )}
      </DialogActions>
      )}
    </Dialog>
    <PauseExecutionDialog
      open={isPauseDialogOpen}
      selectedReason={pauseReason}
      notes={pauseNotes}
      expectedResumeAt={expectedResumeAt}
      onReasonChange={setPauseReason}
      onNotesChange={setPauseNotes}
      onExpectedResumeAtChange={setExpectedResumeAt}
      onCancel={() => setIsPauseDialogOpen(false)}
      onConfirm={confirmPauseExecution}
    />
    </>
  );
}

type CompletionValidationState = {
  equipmentStarted: boolean;
  equipmentOperating: boolean;
  noAbnormalCondition: boolean;
  releasedForProduction: boolean;
  lotoCorrect: boolean;
  areaClean: boolean;
  safetyChecks: boolean;
  visualInspectionCompleted: boolean;
  measurementVerificationRecorded: boolean;
  calibrationCheckCompleted: boolean;
  productionTestExecuted: boolean;
  productQualityVerified: boolean;
};

const initialCompletionValidation: CompletionValidationState = {
  equipmentStarted: false,
  equipmentOperating: false,
  noAbnormalCondition: false,
  releasedForProduction: false,
  lotoCorrect: false,
  areaClean: false,
  safetyChecks: false,
  visualInspectionCompleted: false,
  measurementVerificationRecorded: false,
  calibrationCheckCompleted: false,
  productionTestExecuted: false,
  productQualityVerified: false,
};

function WorkOrderCompletionScreen({
  workOrder,
  selectedParts,
  onPartsChange,
  elapsedSeconds,
  executionStartedDateTime,
  executionFinishedDateTime,
  pauseEvents,
  tasklistState,
  moldingQualityDetails,
  onBack,
}: {
  workOrder: WorkOrder;
  selectedParts: SparePart[];
  onPartsChange: (parts: SparePart[]) => void;
  elapsedSeconds: number;
  executionStartedDateTime: string;
  executionFinishedDateTime: string;
  pauseEvents: WorkOrderPauseEvent[];
  tasklistState: Record<string, PreventiveTaskState>;
  moldingQualityDetails?: MoldingQualityDetails | null;
  onBack: () => void;
}) {
  const [validation, setValidation] = useState<CompletionValidationState>(initialCompletionValidation);
  const [equipmentIssue, setEquipmentIssue] = useState(false);
  const [escalationNote, setEscalationNote] = useState('');
  const [finalComments, setFinalComments] = useState('');
  const [safetyCompletionNotes, setSafetyCompletionNotes] = useState('');
  const [qualityCompletionNotes, setQualityCompletionNotes] = useState('');

  const [problemFound, setProblemFound] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [failureMode, setFailureMode] = useState('');
  const [otherFailureMode, setOtherFailureMode] = useState('');
  const [rcaSummary, setRcaSummary] = useState('');
  const [otherCorrectiveRca, setOtherCorrectiveRca] = useState('');
  const [whyAnswers, setWhyAnswers] = useState<string[]>(['', '', '', '', '']);
  const [preventiveFutureActions, setPreventiveFutureActions] = useState('');
  const [triggerCorrectiveAction, setTriggerCorrectiveAction] = useState(false);
  const [correctiveActionTitle, setCorrectiveActionTitle] = useState('');
  const [correctiveActionDescription, setCorrectiveActionDescription] = useState('');
  const [correctiveActionPriority, setCorrectiveActionPriority] = useState('Medium');
  const [correctiveActionOwner, setCorrectiveActionOwner] = useState('Maintenance Team');
  const [completionStartedAt, setCompletionStartedAt] = useState(executionStartedDateTime);
  const [completionFinishedAt, setCompletionFinishedAt] = useState(executionFinishedDateTime || new Date().toISOString().slice(0, 16));
  const [technicianTeam, setTechnicianTeam] = useState('Current Operator / Maintenance Team');
  const [totalDowntimeMinutes, setTotalDowntimeMinutes] = useState('');
  const [downtimeImpact, setDowntimeImpact] = useState('');
  const [moldingDetails, setMoldingDetails] = useState<MoldingQualityDetails | null>(() => {
    const sourceDetails = moldingQualityDetails ?? workOrder.moldingQualityDetails;
    return sourceDetails
      ? {
        ...sourceDetails,
        newCavityCheck: sourceDetails.newCavityCheck ?? '',
        affectedCavities: [...sourceDetails.affectedCavities],
        cavityDetails: sourceDetails.cavityDetails.map((detail) => ({ ...detail })),
      }
      : null;
  });
  const [taskState, setTaskState] = useState<Record<string, { done: boolean; exception: boolean; note: string }>>(() => (
    Object.fromEntries(
      (workOrder.tasklist ?? []).map((task) => {
        const taskId = getPreventiveTaskId(task);
        return [taskId, { done: Boolean(tasklistState[taskId]?.done), exception: Boolean(tasklistState[taskId]?.exception), note: tasklistState[taskId]?.note ?? '' }];
      })
    )
  ));
  const actualDurationMinutes = useMemo(() => {
    const startedAt = new Date(completionStartedAt).getTime();
    const finishedAt = new Date(completionFinishedAt).getTime();
    if (Number.isNaN(startedAt) || Number.isNaN(finishedAt) || finishedAt < startedAt) {
      return Math.max(1, Math.ceil(elapsedSeconds / 60));
    }
    return Math.max(0, Math.round((finishedAt - startedAt) / 60000));
  }, [completionFinishedAt, completionStartedAt, elapsedSeconds]);
  const estimatedDurationMinutes = parseDurationMinutes(workOrder.preventiveDetails?.plannedDuration);
  const durationDeltaMinutes = estimatedDurationMinutes === null ? null : actualDurationMinutes - estimatedDurationMinutes;
  const breakdownRcaOptions = breakdownRcaOptionsByFailureMode[failureMode] ?? [];
  const plannedQualityRequirements = getPlannedQualityRequirements(workOrder);
  const qaApprovalRequired = isQaApprovalRequired(plannedQualityRequirements);

  const requiredValidationKeys: (keyof CompletionValidationState)[] = [
    'equipmentStarted',
    'equipmentOperating',
    'noAbnormalCondition',
    'releasedForProduction',
    'lotoCorrect',
    'areaClean',
    'safetyChecks',
    'visualInspectionCompleted',
    'measurementVerificationRecorded',
    'calibrationCheckCompleted',
    'productionTestExecuted',
    'productQualityVerified',
  ];

  const completedValidations = requiredValidationKeys.filter((key) => validation[key]).length;
  const isBlockedByEquipment = equipmentIssue || (validation.equipmentOperating === false && escalationNote.trim().length > 0);
  const isMoldingDetailsComplete = !moldingDetails || moldingDetails.newCavityCheck.trim().length > 0;
  const canSubmit = completedValidations === requiredValidationKeys.length
    && !equipmentIssue
    && isMoldingDetailsComplete
    && finalComments.trim().length > 0;

  const toggleValidation = (key: keyof CompletionValidationState) => {
    setValidation((current) => ({ ...current, [key]: !current[key] }));
    if (key === 'equipmentOperating') {
      setEquipmentIssue(false);
      setEscalationNote('');
    }
  };

  const markEquipmentIssue = () => {
    setValidation((current) => ({ ...current, equipmentOperating: false, releasedForProduction: false }));
    setEquipmentIssue(true);
  };

  const updateTask = (taskId: string, patch: Partial<{ done: boolean; exception: boolean; note: string }>) => {
    setTaskState((current) => ({
      ...current,
      [taskId]: {
        done: false,
        exception: false,
        note: '',
        ...current[taskId],
        ...patch,
      },
    }));
  };

  return (
    <Box sx={{ display: 'grid', gap: 2.2, pb: 2 }}>
      <CompletionSection title="Final Execution Details" icon={<AssignmentTurnedInIcon />}>
        <Box sx={{ display: 'grid', gap: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))', xl: 'repeat(5, minmax(0, 1fr))' }, gap: 1.4 }}>
          <TextField label="Equipment" value={workOrder.equipment} required size="small" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} />
          <TextField label="Execution started" type="datetime-local" value={completionStartedAt} onChange={(event) => setCompletionStartedAt(event.target.value)} required size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="Execution finished" type="datetime-local" value={completionFinishedAt} onChange={(event) => setCompletionFinishedAt(event.target.value)} required size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="Actual duration (minutes)" value={String(actualDurationMinutes)} required size="small" InputLabelProps={{ shrink: true }} InputProps={{ readOnly: true }} />
          <TextField label="Technician / team" value={technicianTeam} onChange={(event) => setTechnicianTeam(event.target.value)} required size="small" InputLabelProps={{ shrink: true }} />
        </Box>
          {workOrder.type === 'Preventive' && (
            <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 800 }}>
              Estimated vs Actual: {formatDurationComparison(workOrder.preventiveDetails?.plannedDuration, actualDurationMinutes, durationDeltaMinutes)}
            </Typography>
          )}
        </Box>
      </CompletionSection>

      {workOrder.type === 'Preventive' && (
        <CompletionSection title="Preventive Completion" icon={<TaskAltIcon />}>
          <Box sx={{ display: 'grid', gap: 1.2 }}>
            <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 800, textTransform: 'uppercase' }}>
              Task List Confirmation
            </Typography>
            <Box sx={{ display: 'grid', gap: 0.8 }}>
              {(workOrder.tasklist ?? []).map((task) => {
                const taskId = getPreventiveTaskId(task);
                const current = taskState[taskId] ?? { done: false, exception: false, note: '' };
                return (
                  <Box key={taskId} sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.5, p: 1.1, display: 'grid', gap: 0.8 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'auto minmax(0, 1fr) auto' }, gap: 0.8, alignItems: 'center' }}>
                      <Checkbox checked={current.done} onChange={(event) => updateTask(taskId, { done: event.target.checked })} sx={{ p: 0, color: tokenBrand.main, '&.Mui-checked': { color: tokenSuccess.darkest } }} />
                      <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 800 }}>{task.description}</Typography>
                      <FormControlLabel control={<Checkbox checked={current.exception} onChange={(event) => updateTask(taskId, { exception: event.target.checked })} size="small" />} label={<Typography variant="caption" sx={{ color: tokenWarning.darker, fontWeight: 800 }}>Exception / note</Typography>} sx={{ m: 0 }} />
                    </Box>
                    {current.exception && (
                      <TextField label="Exception notes" value={current.note} onChange={(event) => updateTask(taskId, { note: event.target.value })} required size="small" InputLabelProps={{ shrink: true }} placeholder="Describe variance, skipped step, or observation..." />
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
        </CompletionSection>
      )}

      {workOrder.type === 'Preventive' && (
        <CompletionSection title="Trigger Corrective Action from PM Work Order" icon={<EngineeringIcon />}>
          <Box sx={{ display: 'grid', gap: 1.2 }}>
            <FormControlLabel
              control={<Checkbox checked={triggerCorrectiveAction} onChange={(event) => setTriggerCorrectiveAction(event.target.checked)} sx={{ color: tokenBrand.main, '&.Mui-checked': { color: tokenBrand.main } }} />}
              label={<Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 800 }}>Corrective action required from this PM?</Typography>}
              sx={{ m: 0 }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 170px 220px' }, gap: 1.2 }}>
              <TextField
                label="Corrective action title"
                value={correctiveActionTitle}
                onChange={(event) => setCorrectiveActionTitle(event.target.value)}
                required={triggerCorrectiveAction}
                disabled={!triggerCorrectiveAction}
                size="small"
                InputLabelProps={{ shrink: true }}
                placeholder="Follow-up corrective work order title..."
              />
              <TextField
                select
                label="Priority"
                value={correctiveActionPriority}
                onChange={(event) => setCorrectiveActionPriority(event.target.value)}
                required={triggerCorrectiveAction}
                disabled={!triggerCorrectiveAction}
                size="small"
                InputLabelProps={{ shrink: true }}
              >
                {['High', 'Medium', 'Low'].map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}
              </TextField>
              <TextField
                label="Owner / team"
                value={correctiveActionOwner}
                onChange={(event) => setCorrectiveActionOwner(event.target.value)}
                required={triggerCorrectiveAction}
                disabled={!triggerCorrectiveAction}
                size="small"
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <TextField
              label="Corrective action description"
              value={correctiveActionDescription}
              onChange={(event) => setCorrectiveActionDescription(event.target.value)}
              required={triggerCorrectiveAction}
              disabled={!triggerCorrectiveAction}
              multiline
              minRows={3}
              InputLabelProps={{ shrink: true }}
              placeholder="Describe the finding, risk, and expected corrective follow-up..."
            />
          </Box>
        </CompletionSection>
      )}

      {(workOrder.type === 'Corrective' || workOrder.type === 'Breakdown') && (
        <CompletionSection title={workOrder.type === 'Breakdown' ? 'Breakdown Analysis' : 'Corrective Analysis'} icon={<ReportProblemIcon />}>
          <Box sx={{ display: 'grid', gap: 1.4 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.4 }}>
              <TextField label="Problem Found" value={problemFound} onChange={(event) => setProblemFound(event.target.value)} required multiline minRows={3} InputLabelProps={{ shrink: true }} />
              <TextField label="Actions Taken" value={actionsTaken} onChange={(event) => setActionsTaken(event.target.value)} required multiline minRows={3} InputLabelProps={{ shrink: true }} />
            </Box>
            <Box sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: workOrder.type === 'Breakdown'
                  ? 'repeat(3, minmax(0, 1fr))'
                  : rcaSummary === 'Other'
                    ? 'repeat(2, minmax(0, 1fr))'
                    : '1fr',
              },
              gap: 1.4,
            }}>
              {workOrder.type === 'Breakdown' && (
                <>
                  <TextField
                    select
                    label="Failure Mode"
                    value={failureMode}
                    onChange={(event) => {
                      setFailureMode(event.target.value);
                      setRcaSummary('');
                      setOtherFailureMode('');
                    }}
                    required
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  >
                    {breakdownFailureModes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                  {failureMode === 'Other' && (
                    <TextField label="Other Failure Mode" value={otherFailureMode} onChange={(event) => setOtherFailureMode(event.target.value)} required size="small" InputLabelProps={{ shrink: true }} />
                  )}
                  {failureMode !== 'Other' && (
                    <TextField select label="RCA" value={rcaSummary} onChange={(event) => setRcaSummary(event.target.value)} required size="small" InputLabelProps={{ shrink: true }} disabled={!failureMode}>
                      {breakdownRcaOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                    </TextField>
                  )}
                </>
              )}
              {workOrder.type === 'Corrective' && (
                <>
                  <TextField
                    select
                    label="RCA"
                    value={rcaSummary}
                    onChange={(event) => {
                      setRcaSummary(event.target.value);
                      setOtherCorrectiveRca('');
                    }}
                    required
                    size="small"
                    InputLabelProps={{ shrink: true }}
                  >
                    {correctiveRcaOptions.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </TextField>
                  {rcaSummary === 'Other' && (
                    <TextField label="Other RCA" value={otherCorrectiveRca} onChange={(event) => setOtherCorrectiveRca(event.target.value)} required size="small" InputLabelProps={{ shrink: true }} />
                  )}
                </>
              )}
            </Box>
          </Box>
        </CompletionSection>
      )}

      {workOrder.type === 'Breakdown' && (
        <CompletionSection title="Downtime Capture" icon={<AccessTimeIcon />}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(220px, 0.35fr) minmax(0, 1fr)' }, gap: 1.4 }}>
            <TextField label="Total downtime (minutes)" value={totalDowntimeMinutes} onChange={(event) => setTotalDowntimeMinutes(event.target.value)} required size="small" InputLabelProps={{ shrink: true }} />
            <TextField label="Notes" value={downtimeImpact} onChange={(event) => setDowntimeImpact(event.target.value)} required size="small" InputLabelProps={{ shrink: true }} />
          </Box>
        </CompletionSection>
      )}

      {moldingDetails && (
        <MoldingFirstCheckSection
          details={moldingDetails}
          onChange={setMoldingDetails}
        />
      )}

      {(workOrder.type === 'Corrective' || workOrder.type === 'Breakdown') && (
        <GuidedPanels
          whyAnswers={whyAnswers}
          onWhyAnswerChange={(index, value) => setWhyAnswers((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)))}
          showFutureActions
          futureActionsDefaultExpanded={workOrder.type === 'Breakdown'}
          preventiveFutureActions={preventiveFutureActions}
          onPreventiveFutureActionsChange={setPreventiveFutureActions}
        />
      )}

      <CompletionSection title="Spare Parts Used" icon={<InventoryIcon />}>
        <PartsNeededTab parts={selectedParts} onPartsChange={onPartsChange} enableAiSuggestion={false} />
      </CompletionSection>

      <CompletionSection title="Attachments & Final Comments" icon={<UploadFileIcon />}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '320px minmax(0, 1fr)' }, gap: 1.4 }}>
          <Box sx={{ border: `1px dashed ${tokenBrand.lightest}`, bgcolor: tokenNeutral.lightest, borderRadius: 1.5, p: 1.5, display: 'grid', gap: 0.6, alignContent: 'center' }}>
            <Typography variant="body2" sx={{ color: tokenBrand.main, fontWeight: 900 }}>Add attachment</Typography>
            <Typography variant="caption" sx={{ color: workstationVisuals.textSecondary, fontWeight: 600 }}>Photos, QA evidence, handover files, or signed inspection records.</Typography>
            <Button variant="outlined" startIcon={<UploadFileIcon sx={{ fontSize: 16 }} />} sx={{ width: 'fit-content', borderColor: tokenBrand.light, color: tokenBrand.light, borderRadius: 999, fontWeight: 800, fontSize: 11 }}>UPLOAD FILE</Button>
          </Box>
          <TextField label="Final comments" value={finalComments} onChange={(event) => setFinalComments(event.target.value)} required multiline minRows={4} InputLabelProps={{ shrink: true }} placeholder="Summarize final condition, open risks, and handover notes..." />
        </Box>
      </CompletionSection>

      <CompletionValidationSection
        validation={validation}
        onToggle={toggleValidation}
        equipmentIssue={equipmentIssue}
        onMarkEquipmentIssue={markEquipmentIssue}
        escalationNote={escalationNote}
        onEscalationNoteChange={setEscalationNote}
        qualityImpacting={plannedQualityRequirements.qualityImpacting}
        qaApprovalRequired={qaApprovalRequired}
        safetyNotes={safetyCompletionNotes}
        qualityNotes={qualityCompletionNotes}
        onSafetyNotesChange={setSafetyCompletionNotes}
        onQualityNotesChange={setQualityCompletionNotes}
      />

      {equipmentIssue && (
        <Box sx={{ bgcolor: tokenNeutral.lighter, border: `1px solid ${tokenWarning.lighter}`, borderRadius: 1.5, px: 1.4, py: 1 }}>
          <Typography variant="body2" sx={{ color: tokenError.darkest, fontWeight: 900 }}>
            Completion is blocked until the equipment issue is escalated or a follow-up action is documented.
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onBack} variant="outlined" sx={{ borderColor: tokenBrand.light, color: tokenBrand.light, fontWeight: 800, fontSize: 11, borderRadius: 999, px: 2.4, minHeight: 40 }}>
          BACK TO EXECUTION
        </Button>
        <Button variant="outlined" sx={{ borderColor: tokenBrand.light, color: tokenBrand.light, fontWeight: 800, fontSize: 11, borderRadius: 999, px: 2.4, minHeight: 40 }}>
          SAVE DRAFT
        </Button>
        <Button disabled={!canSubmit || isBlockedByEquipment} variant="contained" startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />} sx={{ bgcolor: tokenBrand.main, color: tokenCommon.white, fontWeight: 900, fontSize: 11, borderRadius: 1.2, px: 2.6, minHeight: 40, '&:hover': { bgcolor: tokenBrand.main } }}>
          SUBMIT WORK ORDER
        </Button>
      </Box>
    </Box>
  );
}

const moldingCavityOptions = Array.from({ length: 96 }, (_, index) => `C${index + 1}`);
const moldingCavityStations = Array.from({ length: 16 }, (_, index) => index + 1);
const moldingCavityPositions = Array.from({ length: 6 }, (_, index) => index + 1);

const moldingCavityPositionAreas: Record<number, string> = {
  1: 'top',
  2: 'upperRight',
  3: 'lowerRight',
  4: 'bottom',
  5: 'lowerLeft',
  6: 'upperLeft',
};

function MoldingFirstCheckSection({
  details,
  onChange,
}: {
  details: MoldingQualityDetails;
  onChange: (details: MoldingQualityDetails) => void;
}) {
  const updateDetails = (patch: Partial<MoldingQualityDetails>) => {
    onChange({ ...details, ...patch });
  };

  return (
    <CompletionSection title="Molding First Piece" icon={<ScienceIcon />}>
      <Box sx={{ display: 'grid', gap: 1.4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 1.2 }}>
          <TextField label="Inspector / Updated by" value={details.inspector} onChange={(event) => updateDetails({ inspector: event.target.value })} required size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="Machine #" value={details.machineNumber} onChange={(event) => updateDetails({ machineNumber: event.target.value })} required size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="Mold #" value={details.moldNumber} onChange={(event) => updateDetails({ moldNumber: event.target.value })} required size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="Work order / Job #" value={details.jobNumber} onChange={(event) => updateDetails({ jobNumber: event.target.value })} required size="small" InputLabelProps={{ shrink: true }} />
          <TextField label="Part number" value={details.partNumber} onChange={(event) => updateDetails({ partNumber: event.target.value })} required size="small" InputLabelProps={{ shrink: true }} />
          <TextField select label="First piece approved?" value={details.firstPieceApproved} onChange={(event) => updateDetails({ firstPieceApproved: event.target.value as MoldingQualityDetails['firstPieceApproved'] })} required size="small" InputLabelProps={{ shrink: true }}>
            {['Yes', 'No'].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
          <TextField label="New cavity check" value={details.newCavityCheck} onChange={(event) => updateDetails({ newCavityCheck: event.target.value })} required size="small" InputLabelProps={{ shrink: true }} placeholder="Enter new cavity check result" />
          <TextField select label="Overall status" value={details.overallStatus} onChange={(event) => updateDetails({ overallStatus: event.target.value as MoldingQualityDetails['overallStatus'] })} required size="small" InputLabelProps={{ shrink: true }}>
            {['Pass', 'Watch', 'Hold'].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
          </TextField>
          <TextField label="Defect type" value={details.defectType} onChange={(event) => updateDetails({ defectType: event.target.value })} required size="small" InputLabelProps={{ shrink: true }} />
        </Box>

        <MoldingCavityFields details={details} onChange={onChange} />
      </Box>
    </CompletionSection>
  );
}

function MoldingCavityFields({
  details,
  onChange,
}: {
  details: MoldingQualityDetails;
  onChange: (details: MoldingQualityDetails) => void;
}) {
  const [isCavityMapOpen, setIsCavityMapOpen] = useState(false);
  const [selectedCavity, setSelectedCavity] = useState(details.affectedCavities[0] ?? 'C14');

  const updateCavityDetail = (cavity: string, patch: Partial<MoldingCavityDetail>) => {
    onChange({
      ...details,
      cavityDetails: details.cavityDetails.map((item) => (
        item.cavity === cavity ? { ...item, ...patch } : item
      )),
    });
  };

  const toggleCavity = (cavity: string) => {
    const isSelected = details.affectedCavities.includes(cavity);
    const affectedCavities = isSelected
      ? details.affectedCavities.filter((item) => item !== cavity)
      : [...details.affectedCavities, cavity].sort((left, right) => Number(left.slice(1)) - Number(right.slice(1)));
    const cavityDetails = isSelected
      ? details.cavityDetails.filter((item) => item.cavity !== cavity)
      : [
        ...details.cavityDetails,
        {
          cavity,
          position: `P${cavity.slice(1)}`,
          issue: '',
          actionTaken: '',
          status: 'Watch' as MoldingCavityStatus,
          attachments: '',
          notes: '',
        },
      ].sort((left, right) => Number(left.cavity.slice(1)) - Number(right.cavity.slice(1)));

    onChange({ ...details, affectedCavities, cavityDetails });
  };

  const clearAffectedCavities = () => {
    onChange({ ...details, affectedCavities: [], cavityDetails: [] });
  };

  return (
    <Box sx={{ display: 'grid', gap: 1.2 }}>
      <Box sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.5, p: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'grid', gap: 0.35 }}>
          <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 900 }}>
            Cavity map
          </Typography>
          <Typography variant="caption" sx={{ color: workstationVisuals.textSecondary, fontWeight: 700 }}>
            {details.affectedCavities.length ? `${details.affectedCavities.join(', ')} selected` : 'No cavities selected'}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<GridViewIcon />}
          onClick={() => setIsCavityMapOpen(true)}
          sx={{ borderRadius: 1.5, fontWeight: 900, textTransform: 'none', color: tokenBrand.main, borderColor: tokenInfo.lightest, bgcolor: tokenCommon.white }}
        >
          Cavity Map
        </Button>
      </Box>

      <Box sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.5, overflowX: 'auto', overflowY: 'hidden' }}>
        <Box sx={{ minWidth: 1020 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '80px 90px minmax(150px, 1fr) minmax(150px, 1fr) 130px minmax(150px, 1fr) minmax(150px, 1fr)', gap: 0.8, px: 1, py: 0.85, bgcolor: tokenNeutral.lightest }}>
            {['Cavity #', 'Position #', 'Issue / Defect', 'Action taken', 'Status', 'Attachments', 'Notes'].map((label) => (
              <Typography key={label} variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 900 }}>
                {label}
              </Typography>
            ))}
          </Box>
          <Box sx={{ display: 'grid', gap: 0.75, p: 1 }}>
            {details.cavityDetails.length === 0 ? (
              <Typography variant="caption" sx={{ color: workstationVisuals.textSecondary, fontWeight: 700 }}>
                Select at least one cavity to record molding details.
              </Typography>
            ) : details.cavityDetails.map((cavityDetail) => (
              <Box key={cavityDetail.cavity} sx={{ display: 'grid', gridTemplateColumns: '80px 90px minmax(150px, 1fr) minmax(150px, 1fr) 130px minmax(150px, 1fr) minmax(150px, 1fr)', gap: 0.8, alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 900 }}>{cavityDetail.cavity}</Typography>
                <Typography variant="body2" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 800 }}>{cavityDetail.position}</Typography>
                <TextField value={cavityDetail.issue} onChange={(event) => updateCavityDetail(cavityDetail.cavity, { issue: event.target.value })} size="small" placeholder="Issue / defect" InputLabelProps={{ shrink: true }} />
                <TextField value={cavityDetail.actionTaken} onChange={(event) => updateCavityDetail(cavityDetail.cavity, { actionTaken: event.target.value })} size="small" placeholder="Action taken" InputLabelProps={{ shrink: true }} />
                <TextField select value={cavityDetail.status} onChange={(event) => updateCavityDetail(cavityDetail.cavity, { status: event.target.value as MoldingCavityStatus })} size="small">
                  {['Watch', 'Open', 'Resolved'].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
                </TextField>
                <TextField value={cavityDetail.attachments} onChange={(event) => updateCavityDetail(cavityDetail.cavity, { attachments: event.target.value })} size="small" placeholder="Attachment file" InputLabelProps={{ shrink: true }} />
                <TextField value={cavityDetail.notes} onChange={(event) => updateCavityDetail(cavityDetail.cavity, { notes: event.target.value })} size="small" placeholder="Notes" InputLabelProps={{ shrink: true }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      <MoldingCavityMapDialog
        open={isCavityMapOpen}
        details={details}
        selectedCavity={selectedCavity}
        onSelectedCavityChange={setSelectedCavity}
        onToggleCavity={toggleCavity}
        onClearSelection={clearAffectedCavities}
        onClose={() => setIsCavityMapOpen(false)}
      />
    </Box>
  );
}

function MoldingCavityMapDialog({
  open,
  details,
  selectedCavity,
  onSelectedCavityChange,
  onToggleCavity,
  onClearSelection,
  onClose,
}: {
  open: boolean;
  details: MoldingQualityDetails;
  selectedCavity: string;
  onSelectedCavityChange: (cavity: string) => void;
  onToggleCavity: (cavity: string) => void;
  onClearSelection: () => void;
  onClose: () => void;
}) {
  const selectedDetail = details.cavityDetails.find((item) => item.cavity === selectedCavity);
  const statusCounts = {
    ok: moldingCavityOptions.length - details.affectedCavities.length,
    ng: details.cavityDetails.filter((item) => item.status === 'Open').length,
    blocked: 0,
    watch: details.cavityDetails.filter((item) => item.status === 'Watch').length,
  };

  const selectCavity = (cavity: string) => {
    onSelectedCavityChange(cavity);
    onToggleCavity(cavity);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl" PaperProps={{ sx: { borderRadius: 1.5, minHeight: '78vh' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.4, borderBottom: `1px solid ${tokenNeutral.main}` }}>
        <Typography sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 900 }}>Molding Occurrence</Typography>
        <GateStatusChip label={details.overallStatus} tone={details.overallStatus === 'Pass' ? 'success' : 'warning'} />
        <Chip label="MO-2026-0142" size="small" sx={{ fontWeight: 900, color: tokenBrand.dark, bgcolor: tokenNeutral.lightest }} />
        <IconButton onClick={onClose} sx={{ ml: 'auto', color: workstationVisuals.textSecondary }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 324px' }, gap: 1.5 }}>
        <Box sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: 1, p: 1.2, display: 'grid', gap: 1.1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Box>
              <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.55, color: workstationVisuals.tierTextHeading, fontWeight: 900 }}>
                <GridViewIcon sx={{ fontSize: 17, color: tokenBrand.main }} /> Cavity Map
              </Typography>
              <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 800 }}>
                Pxx = Position Number · [ ] = Current Cavity Number
              </Typography>
            </Box>
            <Button variant="outlined" size="small" onClick={onClearSelection} sx={{ borderRadius: 1.5, fontWeight: 900, textTransform: 'none' }}>
              Clear Selection
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <GateStatusChip label={`OK: ${statusCounts.ok}`} tone="success" />
            <GateStatusChip label={`NG: ${statusCounts.ng}`} tone="danger" />
            <GateStatusChip label={`Blocked: ${statusCounts.blocked}`} tone="neutral" />
            <GateStatusChip label={`Watch: ${statusCounts.watch}`} tone="warning" />
          </Box>
          <Box sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.2, bgcolor: tokenNeutral.lightest, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(216px, 1fr))', xl: 'repeat(4, minmax(216px, 1fr))' }, gap: 1, p: 1, maxHeight: { xs: 'none', lg: '58vh' }, overflowY: 'auto' }}>
            {moldingCavityStations.map((station) => {
              const cavities = moldingCavityPositions.map((position) => `C${(station - 1) * moldingCavityPositions.length + position}`);
              return (
                <Box key={station} sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.2, minHeight: 142, p: 0.55, display: 'grid', placeItems: 'center', bgcolor: tokenCommon.white, boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)' }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '44px 52px 44px', gridTemplateRows: '40px 42px 40px', gridTemplateAreas: `". top ." "upperLeft center upperRight" "lowerLeft bottom lowerRight"`, gap: 0.7, alignItems: 'center', justifyItems: 'center' }}>
                    {cavities.map((cavity, index) => (
                      <CavityMapDot
                        key={cavity}
                        cavity={cavity}
                        position={index + 1}
                        selectedCavity={selectedCavity}
                        details={details}
                        onSelect={selectCavity}
                      />
                    ))}
                    <Box sx={{ gridArea: 'center', width: 50, height: 50, display: 'grid', placeItems: 'center', border: `1px solid ${tokenNeutral.dark}`, borderRadius: 1.1, bgcolor: tokenNeutral.lightest, color: workstationVisuals.tierTextHeading, fontWeight: 950, fontSize: 18 }}>
                      {station}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: 1, p: 1.2, bgcolor: tokenNeutral.lightest, alignSelf: 'start', display: 'grid', gap: 1 }}>
          <Box>
            <Typography sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 900 }}>Cavity {selectedCavity}</Typography>
            <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 800 }}>
              Position P{selectedCavity.slice(1)} · Mold {details.moldNumber}
            </Typography>
          </Box>
          <GateStatusChip label={`Current status: ${selectedDetail?.status ?? 'OK'}`} tone={selectedDetail?.status === 'Open' ? 'danger' : selectedDetail?.status === 'Watch' ? 'warning' : 'success'} />
          {[
            ['Issue / Defect', selectedDetail?.issue ?? 'No issue recorded'],
            ['Action taken', selectedDetail?.actionTaken ?? 'No action required'],
            ['Status', selectedDetail?.status ?? 'OK'],
            ['Attachments', selectedDetail?.attachments || 'None'],
            ['Notes', selectedDetail?.notes || 'No notes'],
          ].map(([label, value]) => (
            <Box key={label} sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: 2, px: 1.2, py: 0.75, bgcolor: tokenCommon.white }}>
              <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 800 }}>{label}</Typography>
              <Typography sx={{ color: tokenBrand.dark, fontWeight: 700, fontSize: 14 }}>{value}</Typography>
            </Box>
          ))}
          <Button variant="contained" onClick={() => onToggleCavity(selectedCavity)} sx={{ borderRadius: 1.5, fontWeight: 900, textTransform: 'none' }}>
            {details.affectedCavities.includes(selectedCavity) ? 'Remove from Affected' : 'Mark as Affected'}
          </Button>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 2, py: 1.5, borderTop: `1px solid ${tokenNeutral.main}` }}>
        <Button onClick={onClose} sx={{ fontWeight: 900, textTransform: 'none' }}>Cancel</Button>
        <Button variant="contained" onClick={onClose} sx={{ borderRadius: 1.5, fontWeight: 900, textTransform: 'none' }}>Save Occurrence</Button>
      </DialogActions>
    </Dialog>
  );
}

function CavityMapDot({
  cavity,
  position,
  selectedCavity,
  details,
  onSelect,
}: {
  cavity: string;
  position: number;
  selectedCavity: string;
  details: MoldingQualityDetails;
  onSelect: (cavity: string) => void;
}) {
  const cavityDetail = details.cavityDetails.find((item) => item.cavity === cavity);
  const isAffected = details.affectedCavities.includes(cavity);
  const isSelected = selectedCavity === cavity;
  const tone = cavityDetail?.status === 'Open'
    ? { bg: tokenError.lightest, border: tokenError.light, color: tokenError.darkest, solid: tokenError.main }
    : cavityDetail?.status === 'Watch'
      ? { bg: tokenWarning.lightest, border: tokenWarning.main, color: tokenWarning.darkest, solid: tokenWarning.main }
      : { bg: tokenSuccess.lightest, border: tokenSuccess.light, color: tokenSuccess.darker, solid: tokenSuccess.main };

  return (
    <Button
      onClick={() => onSelect(cavity)}
      size="small"
      sx={{
        gridArea: moldingCavityPositionAreas[position],
        minWidth: 0,
        width: 44,
        height: 40,
        justifySelf: 'center',
        alignSelf: 'center',
        p: 0,
        borderRadius: '50%',
        bgcolor: isSelected ? tone.solid : tone.bg,
        border: `2px solid ${isSelected ? tokenBrand.main : isAffected ? tone.border : tone.border}`,
        color: isSelected ? tokenCommon.white : tone.color,
        fontWeight: 900,
        fontSize: 9.5,
        lineHeight: 1,
        display: 'grid',
        placeItems: 'center',
        textAlign: 'center',
        textTransform: 'none',
        boxShadow: isSelected || isAffected ? '0 0 0 3px rgba(37, 99, 235, 0.18)' : 'none',
        '&:hover': { bgcolor: isSelected ? tone.solid : tone.bg, borderColor: tokenBrand.main },
        '&:focus-visible': { boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.28)', borderColor: tokenBrand.main },
        '& .MuiTouchRipple-root': { borderRadius: '50%' },
      }}
    >
      <Box sx={{ color: isSelected ? tokenCommon.white : tone.color }}>
        <Box>{`P${cavity.slice(1)}`}</Box>
        <Box>{`[${cavity.slice(1)}]`}</Box>
      </Box>
    </Button>
  );
}

function CompletionSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Paper variant="outlined" sx={{ borderColor: tokenNeutral.main, borderRadius: 2, p: 1.6, display: 'grid', gap: 1.35 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
        <Box sx={{ color: tokenBrand.main, display: 'inline-flex', '& svg': { fontSize: 19 } }}>{icon}</Box>
        <Typography variant="subtitle2" sx={{ color: tokenBrand.dark, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 0 }}>
          {title}
        </Typography>
        <Typography component="span" sx={{ color: tokenError.darker, fontWeight: 900, fontSize: 14 }}>*</Typography>
      </Box>
      {children}
    </Paper>
  );
}

function GuidedPanels({
  whyAnswers,
  onWhyAnswerChange,
  showFutureActions,
  futureActionsDefaultExpanded,
  preventiveFutureActions,
  onPreventiveFutureActionsChange,
}: {
  whyAnswers: string[];
  onWhyAnswerChange: (index: number, value: string) => void;
  showFutureActions: boolean;
  futureActionsDefaultExpanded?: boolean;
  preventiveFutureActions: string;
  onPreventiveFutureActionsChange: (value: string) => void;
}) {
  return (
    <Box sx={{ display: 'grid', gap: 1 }}>
      <Accordion defaultExpanded disableGutters sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: '8px !important', boxShadow: 'none' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 48 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <FactCheckIcon sx={{ color: tokenBrand.main, fontSize: 18 }} />
            <Typography variant="subtitle2" sx={{ color: tokenBrand.dark, fontWeight: 900 }}>5 Why Analysis</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ display: 'grid', gap: 1 }}>
          {whyAnswers.map((answer, index) => (
            <TextField
              key={`why-${index + 1}`}
              label={`Why ${index + 1}`}
              value={answer}
              onChange={(event) => onWhyAnswerChange(index, event.target.value)}
              required={index < 2}
              size="small"
              InputLabelProps={{ shrink: true }}
              placeholder={index === 0 ? 'What directly caused the issue?' : 'Continue drilling into the cause...'}
            />
          ))}
        </AccordionDetails>
      </Accordion>

      {showFutureActions && (
        <Accordion defaultExpanded={futureActionsDefaultExpanded} disableGutters sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: '8px !important', boxShadow: 'none' }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: 48 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <EngineeringIcon sx={{ color: tokenBrand.main, fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ color: tokenBrand.dark, fontWeight: 900 }}>Preventive Future Actions Analysis</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              label="Future prevention plan"
              value={preventiveFutureActions}
              onChange={(event) => onPreventiveFutureActionsChange(event.target.value)}
              required
              multiline
              minRows={3}
              fullWidth
              InputLabelProps={{ shrink: true }}
              placeholder="Define inspections, PM updates, engineering changes, training, or follow-up work orders..."
            />
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}

function CompletionValidationSection({
  validation,
  onToggle,
  equipmentIssue,
  onMarkEquipmentIssue,
  escalationNote,
  onEscalationNoteChange,
  qualityImpacting,
  qaApprovalRequired,
  safetyNotes,
  qualityNotes,
  onSafetyNotesChange,
  onQualityNotesChange,
}: {
  validation: CompletionValidationState;
  onToggle: (key: keyof CompletionValidationState) => void;
  equipmentIssue: boolean;
  onMarkEquipmentIssue: () => void;
  escalationNote: string;
  onEscalationNoteChange: (value: string) => void;
  qualityImpacting: boolean;
  qaApprovalRequired: boolean;
  safetyNotes: string;
  qualityNotes: string;
  onSafetyNotesChange: (value: string) => void;
  onQualityNotesChange: (value: string) => void;
}) {
  return (
    <CompletionSection title="Completion Validation" icon={<VerifiedUserIcon />}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' }, gap: 1.2 }}>
        <ValidationGroup title="Equipment Status" tone={tokenSuccess.darkest} helper="Confirm the asset is ready and safe for production handback.">
          <ValidationItem label="Equipment properly started" checked={validation.equipmentStarted} onToggle={() => onToggle('equipmentStarted')} required />
          <ValidationItem
            label="Equipment operating correctly"
            checked={validation.equipmentOperating}
            onToggle={() => onToggle('equipmentOperating')}
            required
            actionLabel="Report issue"
            onAction={onMarkEquipmentIssue}
            issue={equipmentIssue}
          />
          <ValidationItem label="No abnormal noise/vibration detected" checked={validation.noAbnormalCondition} onToggle={() => onToggle('noAbnormalCondition')} required />
          <ValidationItem label="Equipment released for production" checked={validation.releasedForProduction} onToggle={() => onToggle('releasedForProduction')} required />
          {equipmentIssue && (
            <TextField
              label="Escalation note or follow-up action"
              value={escalationNote}
              onChange={(event) => onEscalationNoteChange(event.target.value)}
              required
              multiline
              minRows={2}
              size="small"
              InputLabelProps={{ shrink: true }}
              placeholder="Document escalation owner, risk, and immediate follow-up..."
              error={!escalationNote.trim()}
            />
          )}
        </ValidationGroup>

        <ValidationGroup title="Safety & Compliance" tone={tokenWarning.darker} helper="Record safety handback checks before closing the WO.">
          <ValidationItem label="LOTO removed/applied correctly" checked={validation.lotoCorrect} onToggle={() => onToggle('lotoCorrect')} required />
          <ValidationItem label="Area cleaned and organized" checked={validation.areaClean} onToggle={() => onToggle('areaClean')} required />
          <ValidationItem label="Safety checks completed" checked={validation.safetyChecks} onToggle={() => onToggle('safetyChecks')} required />
          <TextField
            label="Safety notes"
            value={safetyNotes}
            onChange={(event) => onSafetyNotesChange(event.target.value)}
            multiline
            minRows={3}
            size="small"
            InputLabelProps={{ shrink: true }}
            placeholder="Record safety observations, residual risks, or handback notes..."
          />
        </ValidationGroup>

        <ValidationGroup title="Production / Quality Validation" tone={tokenBrand.main} helper="Record execution checks only. Any approval or release happens in the external QA flow.">
          <ValidationItem label="Visual inspection completed" checked={validation.visualInspectionCompleted} onToggle={() => onToggle('visualInspectionCompleted')} required />
          <ValidationItem label="Measurement verification recorded" checked={validation.measurementVerificationRecorded} onToggle={() => onToggle('measurementVerificationRecorded')} required />
          <ValidationItem label="Calibration check completed" checked={validation.calibrationCheckCompleted} onToggle={() => onToggle('calibrationCheckCompleted')} required />
          <ValidationItem label="Production test executed" checked={validation.productionTestExecuted} onToggle={() => onToggle('productionTestExecuted')} required />
          <ValidationItem label="Product quality verified" checked={validation.productQualityVerified} onToggle={() => onToggle('productQualityVerified')} required />
          {qualityImpacting && qaApprovalRequired && (
            <Box sx={{ border: `1px solid ${tokenInfo.lightest}`, bgcolor: tokenNeutral.lightest, borderRadius: 1.2, p: 1, display: 'grid', gap: 0.35 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Typography variant="body2" sx={{ color: tokenBrand.main, fontWeight: 900 }}>
                  QA approval / quality release
                </Typography>
                <GateStatusChip label="Pending" tone="warning" />
              </Box>
              <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 600 }}>
                The Work Order can be submitted now. QA approval is required before final closure.
              </Typography>
            </Box>
          )}
          <TextField
            label="Quality notes"
            value={qualityNotes}
            onChange={(event) => onQualityNotesChange(event.target.value)}
            multiline
            minRows={3}
            size="small"
            InputLabelProps={{ shrink: true }}
            placeholder="Record quality observations, measurements, or exceptions..."
          />
        </ValidationGroup>
      </Box>
    </CompletionSection>
  );
}

function ValidationGroup({ title, helper, tone, children }: { title: string; helper: string; tone: string; children: React.ReactNode }) {
  return (
    <Box sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.5, p: 1.2, display: 'grid', gap: 0.8, alignContent: 'start' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
        <Box sx={{ width: 9, height: 9, borderRadius: 99, bgcolor: tone }} />
        <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 900 }}>{title}</Typography>
      </Box>
      <Typography variant="caption" sx={{ color: workstationVisuals.textSecondary, fontWeight: 600, lineHeight: 1.3 }}>{helper}</Typography>
      {children}
    </Box>
  );
}

function ValidationItem({
  label,
  checked,
  onToggle,
  required = false,
  actionLabel,
  onAction,
  issue = false,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
  required?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  issue?: boolean;
}) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: actionLabel ? 'minmax(0, 1fr) auto' : '1fr', gap: 0.7, alignItems: 'center', bgcolor: issue ? tokenNeutral.lighter : checked ? tokenNeutral.lighter : tokenNeutral.lightest, border: `1px solid ${issue ? '${tokenWarning.lighter}' : checked ? '${tokenSuccess.lightest}' : '${tokenNeutral.main}'}`, borderRadius: 1.2, px: 0.8, py: 0.65 }}>
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={onToggle} size="small" sx={{ color: workstationVisuals.textSecondary, '&.Mui-checked': { color: tokenSuccess.darkest }, p: 0.35 }} />}
        label={(
          <Typography variant="caption" sx={{ color: issue ? tokenError.darkest : workstationVisuals.tierTextHeading, fontWeight: 800, lineHeight: 1.2 }}>
            {label}{required && <Box component="span" sx={{ color: tokenError.darker, ml: 0.25 }}>*</Box>}
          </Typography>
        )}
        sx={{ m: 0, gap: 0.4 }}
      />
      {actionLabel && (
        <Button onClick={onAction} size="small" sx={{ color: issue ? tokenError.darkest : tokenBrand.main, fontSize: 10, fontWeight: 900, minWidth: 0, px: 0.8 }}>
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}

function PauseExecutionDialog({
  open,
  selectedReason,
  notes,
  expectedResumeAt,
  onReasonChange,
  onNotesChange,
  onExpectedResumeAtChange,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  selectedReason: PauseReason | '';
  notes: string;
  expectedResumeAt: string;
  onReasonChange: (reason: PauseReason) => void;
  onNotesChange: (notes: string) => void;
  onExpectedResumeAtChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const isOtherSelected = selectedReason === 'Other';
  const isConfirmDisabled = !selectedReason || (isOtherSelected && !notes.trim());

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, pb: 0.5 }}>
        <WarningIcon sx={{ color: tokenWarning.dark, fontSize: 20 }} />
        <Typography variant="subtitle1" sx={{ color: tokenBrand.dark, fontWeight: 800 }}>
          Execution Paused
        </Typography>
        <IconButton onClick={onCancel} sx={{ ml: 'auto', color: tokenBrand.light }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ display: 'grid', gap: 1.5, pt: 1.2 }}>
        <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading }}>
          Select the main reason blocking this Work Order execution.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.85 }}>
          {pauseReasons.map((reason) => {
            const isSelected = selectedReason === reason;

            return (
              <Box
                key={reason}
                onClick={() => onReasonChange(reason)}
                sx={{
                  border: `1px solid ${isSelected ? '${tokenWarning.dark}' : '${tokenNeutral.main}'}`,
                  bgcolor: isSelected ? tokenNeutral.lightest : tokenCommon.white,
                  borderRadius: 1.5,
                  px: 1,
                  py: 0.75,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.6,
                  cursor: 'pointer',
                  minHeight: 42,
                  '&:hover': {
                    borderColor: tokenWarning.lighter,
                    bgcolor: isSelected ? tokenNeutral.lightest : tokenNeutral.lightest,
                  },
                }}
              >
                <Radio
                  checked={isSelected}
                  value={reason}
                  size="small"
                  sx={{ p: 0, color: workstationVisuals.textMuted, '&.Mui-checked': { color: tokenWarning.dark } }}
                />
                <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: isSelected ? 800 : 700, lineHeight: 1.15 }}>
                  {reason}
                </Typography>
              </Box>
            );
          })}
        </Box>

        <TextField
          label={isOtherSelected ? 'Notes required' : 'Notes'}
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          required={isOtherSelected}
          multiline
          minRows={2}
          fullWidth
          InputLabelProps={{ shrink: true }}
          placeholder={isOtherSelected ? 'Describe the pause reason...' : 'Add resume instructions or blocker details...'}
          error={isOtherSelected && !notes.trim()}
          helperText={isOtherSelected && !notes.trim() ? 'Notes are required when Other is selected.' : 'Optional for the selected reason.'}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
        />

        <Box sx={{ display: 'grid', gap: 1.2, alignItems: 'center' }}>
          <TextField
            label="Expected Resume Date / Time"
            type="datetime-local"
            value={expectedResumeAt}
            onChange={(event) => onExpectedResumeAtChange(event.target.value)}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Box>

        <Box sx={{ bgcolor: tokenNeutral.lightest, borderLeft: `4px solid ${tokenWarning.dark}`, borderRadius: 1, px: 1.4, py: 1 }}>
          <Typography variant="caption" sx={{ color: tokenWarning.darker, fontWeight: 700 }}>
            The selected reason will be saved in the Work Order history for downtime and waiting-time analysis.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, pt: 0, gap: 1 }}>
        <Button onClick={onCancel} variant="outlined" startIcon={<CloseIcon sx={{ fontSize: 15 }} />} sx={{ borderColor: tokenBrand.light, color: tokenBrand.light, fontWeight: 700, fontSize: 11, borderRadius: 999, px: 1.8 }}>
          CANCEL
        </Button>
        <Button onClick={onConfirm} disabled={isConfirmDisabled} variant="contained" startIcon={<PauseIcon sx={{ fontSize: 15 }} />} sx={{ bgcolor: tokenBrand.main, color: tokenCommon.white, fontWeight: 800, fontSize: 11, borderRadius: 1.4, px: 2.2, '&:hover': { bgcolor: tokenBrand.main } }}>
          PAUSE EXECUTION
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function BluAiInsight({
  children,
  onDismiss,
  onAdd,
  sx,
}: {
  children: ReactNode;
  onDismiss: () => void;
  onAdd: () => void;
  sx?: object;
}) {
  return (
    <Box sx={{ bgcolor: tokenCommon.white, display: 'grid', gap: 0.85, ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minHeight: 18 }}>
        <AutoAwesomeIcon sx={{ fontSize: 15, color: tokenBrand.main }} />
        <Typography variant="body2" sx={{ color: tokenBrand.dark, fontWeight: 800, lineHeight: 1.1 }}>
          BLU.AI Insight
        </Typography>
      </Box>
      <Box sx={{ bgcolor: tokenNeutral.lighter, border: `1px solid ${tokenNeutral.main}`, borderRadius: 0.8, px: 1.5, py: 1, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.25, flexWrap: 'wrap' }}>
        <Typography variant="body2" sx={{ color: tokenBrand.dark, fontWeight: 700, lineHeight: 1.35, minWidth: 220, flex: '1 1 360px' }}>
          {children}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, flex: '0 0 auto' }}>
          <Button onClick={onDismiss} size="small" sx={{ minHeight: 30, px: 1, color: tokenBrand.main, fontWeight: 800, fontSize: 11 }}>
            NO, THANKS
          </Button>
          <Button onClick={onAdd} size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 15 }} />} sx={{ minHeight: 39, px: 2, borderColor: tokenBrand.main, color: tokenBrand.main, borderRadius: 99, fontWeight: 800, fontSize: 11, bgcolor: tokenCommon.white, '&:hover': { bgcolor: tokenNeutral.lightest, borderColor: tokenBrand.main } }}>
            ADD THIS ITEMS
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function AiPartsSuggestion({ onDismiss, onAdd }: { onDismiss: () => void; onAdd: () => void }) {
  return (
    <BluAiInsight onDismiss={onDismiss} onAdd={onAdd}>
      The actions require parts. Should I add these items?
    </BluAiInsight>
  );
}

function PreventiveFields({ workOrder }: { workOrder: WorkOrder }) {
  if (!workOrder.preventiveDetails) return null;

  return (
    <FieldGroup>
      <InfoBox label="PM Plan" value={workOrder.preventiveDetails.pmPlan} />
      <InfoBox label="Frequency" value={workOrder.preventiveDetails.frequency} />
      <InfoBox label="Planned Duration" value={workOrder.preventiveDetails.plannedDuration} />
    </FieldGroup>
  );
}

function PartsNeededTab({
  parts,
  onPartsChange,
  enableAiSuggestion = true,
}: {
  parts: SparePart[];
  onPartsChange: (parts: SparePart[]) => void;
  enableAiSuggestion?: boolean;
}) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSuggestionDismissed, setIsSuggestionDismissed] = useState(false);
  const [reservedPartIds, setReservedPartIds] = useState<string[]>([]);
  const [requestedPartIds, setRequestedPartIds] = useState<string[]>([]);
  const [selectedInventoryPart, setSelectedInventoryPart] = useState<InventoryPart | null>(null);
  const [requestedInventoryPurchasePartIds, setRequestedInventoryPurchasePartIds] = useState<string[]>([]);

  const filteredParts = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    if (!normalizedTerm) return sparePartCatalog;

    return sparePartCatalog.filter((part) => (
      part.id.toLowerCase().includes(normalizedTerm) || part.name.toLowerCase().includes(normalizedTerm)
    ));
  }, [searchTerm]);

  const availableParts = filteredParts.filter((part) => !parts.some((item) => item.id === part.id));
  const suggestedParts = aiSuggestedParts.filter((part) => !parts.some((item) => item.id === part.id));

  const addPart = (part: SparePart) => {
    const existingPart = parts.find((item) => item.id === part.id);
    if (existingPart) {
      onPartsChange(parts.map((item) => (
        item.id === part.id ? { ...item, quantity: (item.quantity ?? 1) + 1 } : item
      )));
      return;
    }

    onPartsChange([...parts, { ...part, quantity: 1 }]);
  };

  const removePart = (partId: string) => {
    onPartsChange(parts.filter((part) => part.id !== partId));
  };

  const setPartQuantity = (partId: string, quantity: number) => {
    onPartsChange(parts.map((part) => (
      part.id === partId ? { ...part, quantity: Math.max(1, quantity) } : part
    )));
  };

  const requestPart = (partId: string) => {
    setRequestedPartIds((current) => (current.includes(partId) ? current : [...current, partId]));
  };

  const reservePart = (partId: string) => {
    setReservedPartIds((current) => (current.includes(partId) ? current : [...current, partId]));
  };

  const openInventoryPartDrawer = (part: SparePart) => {
    const inventoryPart = findInventoryPartByCode(part.id);
    if (inventoryPart) setSelectedInventoryPart(inventoryPart);
  };

  const requestInventoryPurchase = (partId: string) => {
    setRequestedInventoryPurchasePartIds((current) => (current.includes(partId) ? current : [...current, partId]));
  };

  if (!isSearchOpen && !parts.length) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          No parts added. Click ADD to include items.
        </Typography>
        <Button onClick={() => setIsSearchOpen(true)} startIcon={<AddIcon />} sx={{ fontWeight: 700, fontSize: '0.8rem' }}>ADD</Button>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      {isSearchOpen && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1.5, borderColor: tokenNeutral.main, width: '100%', display: 'grid', gap: 1.15 }}>
          <Box sx={{ display: 'grid', gap: 0.65 }}>
            <Typography variant="body2" sx={{ color: workstationVisuals.textSecondary, fontWeight: 800, lineHeight: 1.1 }}>
              Search to add the item
            </Typography>
          <TextField
            placeholder="Search spare parts..."
            size="small"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            fullWidth
            InputProps={{
              'aria-label': 'Search spare parts',
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon sx={{ fontSize: 20, color: tokenBrand.main }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0.8,
                bgcolor: tokenCommon.white,
              },
              '& .MuiInputBase-input': {
                py: 0.9,
                color: workstationVisuals.tierTextHeading,
                fontWeight: 600,
                '&::placeholder': {
                  color: tokenNeutral.darkest,
                  opacity: 1,
                  fontWeight: 500,
                },
              },
            }}
          />
          </Box>

          {enableAiSuggestion && !isSuggestionDismissed && suggestedParts.length > 0 && (
            <BluAiInsight
              sx={{ mt: 0.15 }}
              onDismiss={() => setIsSuggestionDismissed(true)}
              onAdd={() => {
                onPartsChange([
                  ...parts,
                  ...suggestedParts.map((part) => ({ ...part, quantity: 1 })),
                ]);
                setIsSuggestionDismissed(true);
              }}
            >
              Based on the equipment history, activity type and technical evaluation, here are the suggested spare parts.
            </BluAiInsight>
          )}

          <Typography variant="body2" sx={{ color: workstationVisuals.tierTextMeta, fontWeight: 800, mt: 0.15 }}>
            {availableParts.length} {availableParts.length === 1 ? 'Result' : 'Results'}
          </Typography>

          {availableParts.length ? (
            <Box sx={{ display: 'grid', gap: 0.75 }}>
              {availableParts.map((part) => (
                <AvailablePartRow
                  key={part.id}
                  part={part}
                  onAdd={() => addPart(part)}
                  isRequested={requestedPartIds.includes(part.id)}
                  onRequest={() => requestPart(part.id)}
                  onOpenInventoryPart={() => openInventoryPartDrawer(part)}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              No additional parts found.
            </Typography>
          )}
        </Paper>
      )}

      {parts.length > 0 && (
        <Box sx={{ display: 'grid', gap: 0.65 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {parts.length} {parts.length === 1 ? 'item' : 'items'} added
            </Typography>
            <Button onClick={() => setIsSearchOpen(true)} startIcon={<AddIcon />} sx={{ fontWeight: 700, fontSize: '0.8rem' }}>ADD</Button>
          </Box>
          {parts.map((part) => (
            <SelectedPartCard
              key={part.id}
              part={part}
              onRemove={() => removePart(part.id)}
              onDecrease={() => setPartQuantity(part.id, (part.quantity ?? 1) - 1)}
              onIncrease={() => setPartQuantity(part.id, (part.quantity ?? 1) + 1)}
              isRequested={requestedPartIds.includes(part.id)}
              isReserved={reservedPartIds.includes(part.id)}
              onRequest={() => requestPart(part.id)}
              onReserve={() => reservePart(part.id)}
              onOpenInventoryPart={() => openInventoryPartDrawer(part)}
            />
          ))}
        </Box>
      )}
      <InventoryPartDrawer
        part={selectedInventoryPart}
        open={Boolean(selectedInventoryPart)}
        onClose={() => setSelectedInventoryPart(null)}
        purchaseRequested={selectedInventoryPart ? requestedInventoryPurchasePartIds.includes(selectedInventoryPart.id) : false}
        onRequestPurchase={requestInventoryPurchase}
      />
    </Box>
  );
}

function AvailablePartRow({
  part,
  onAdd,
  isRequested,
  onRequest,
  onOpenInventoryPart,
}: {
  part: SparePart;
  onAdd: () => void;
  isRequested?: boolean;
  onRequest: () => void;
  onOpenInventoryPart?: () => void;
}) {
  const isStockout = part.total === 0;

  return (
    <Box
      onClick={onOpenInventoryPart}
      sx={{
        border: `1px solid ${tokenNeutral.main}`,
        bgcolor: tokenNeutral.lightest,
        borderRadius: 1.5,
        px: 1.25,
        py: 0.95,
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', sm: 'minmax(0, 1fr) auto auto' },
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Box sx={{ minWidth: 0, gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
        <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 800, lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Box component="span" sx={{ color: workstationVisuals.tierTextMeta, mr: 0.5 }}>{part.id}</Box>{part.name}
        </Typography>
      </Box>

      <Box sx={{ justifySelf: { xs: 'start', sm: 'end' }, minWidth: 0 }}>
        <PartMetadata part={part} compact />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, justifySelf: 'end' }}>
        {isRequested ? <SparePartStatusChip label="Requested" tone="requested" /> : null}
        {isStockout && !isRequested ? <StockoutButton onClick={(event) => {
          event.stopPropagation();
          onRequest();
        }} /> : null}
        <IconButton
          onClick={(event) => {
            event.stopPropagation();
            onAdd();
          }}
          size="small"
          disabled={isStockout}
          sx={{ color: tokenBrand.main, p: 0.25 }}
        >
          <AddIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

function SelectedPartCard({
  part,
  onRemove,
  onDecrease,
  onIncrease,
  isRequested,
  isReserved,
  onRequest,
  onReserve,
  onOpenInventoryPart,
}: {
  part: SparePart;
  onRemove: () => void;
  onDecrease: () => void;
  onIncrease: () => void;
  isRequested?: boolean;
  isReserved?: boolean;
  onRequest: () => void;
  onReserve: () => void;
  onOpenInventoryPart?: () => void;
}) {
  const isStockout = part.total === 0;
  const cannotIncrease = isStockout || (part.quantity ?? 1) >= part.total;

  return (
    <Box
      onClick={onOpenInventoryPart}
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) auto', lg: 'minmax(0, 1fr) auto auto' },
        alignItems: 'center',
        gap: 1,
        bgcolor: tokenNeutral.lightest,
        borderRadius: 1.5,
        px: 1.25,
        py: 0.95,
      }}
    >
      <Box sx={{ minWidth: 0, gridColumn: { xs: '1 / -1', sm: '1 / -1', lg: 'auto' } }}>
        <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Box component="span" sx={{ color: tokenNeutral.darkest, mr: 0.6 }}>{part.id}</Box>{part.name}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap', justifySelf: { sm: 'start', lg: 'end' } }}>
        <SelectedPartMetadata part={part} />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, justifySelf: { sm: 'end' } }}>
        {isRequested ? <SparePartStatusChip label="Requested" tone="requested" /> : null}
        {!isRequested && isReserved ? <SparePartStatusChip label="Reserved" tone="reserved" /> : null}
        {isStockout && !isRequested ? <StockoutButton onClick={(event) => {
          event.stopPropagation();
          onRequest();
        }} /> : null}
        {!isStockout && !isRequested && !isReserved ? (
          <Button
            size="small"
            variant="text"
            onClick={(event) => {
              event.stopPropagation();
              onReserve();
            }}
            sx={{
              color: tokenSuccess.darkest,
              borderRadius: 99,
              bgcolor: tokenNeutral.lighter,
              fontSize: 10.5,
              fontWeight: 900,
              lineHeight: 1,
              minWidth: 0,
              px: 0.8,
              '&:hover': {
                bgcolor: tokenNeutral.main,
              },
            }}
          >
            RESERVE
          </Button>
        ) : null}
        <IconButton onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }} size="small" sx={{ color: tokenError.dark, p: 0.3 }}>
          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <IconButton onClick={(event) => {
          event.stopPropagation();
          onDecrease();
        }} size="small" sx={{ color: tokenBrand.main, p: 0.25 }}>
          <RemoveIcon sx={{ fontSize: 16 }} />
        </IconButton>
        <Typography variant="body2" sx={{ color: tokenBrand.main, fontWeight: 900, minWidth: 18, textAlign: 'center' }}>
          {part.quantity ?? 1}
        </Typography>
        <IconButton onClick={(event) => {
          event.stopPropagation();
          onIncrease();
        }} size="small" disabled={cannotIncrease} sx={{ color: tokenBrand.main, p: 0.25 }}>
          <AddIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Box>
    </Box>
  );
}

function SparePartStatusChip({ label, tone }: { label: string; tone: 'reserved' | 'requested' }) {
  const colors = tone === 'requested'
    ? { bgcolor: tokenWarning.lightest, color: tokenWarning.darker, border: tokenWarning.lighter }
    : { bgcolor: tokenNeutral.lighter, color: tokenSuccess.darkest, border: tokenSuccess.lightest };

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 20,
        borderRadius: 99,
        bgcolor: colors.bgcolor,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        fontSize: 10,
        fontWeight: 900,
      }}
    />
  );
}

function StockoutButton({ onClick }: { onClick: (event: ReactMouseEvent<HTMLButtonElement>) => void }) {
  return (
    <Button
      size="small"
      variant="text"
      onClick={onClick}
      sx={{
        color: tokenBrand.dark,
        borderRadius: 99,
        fontWeight: 800,
        fontSize: 10.5,
        px: 0.8,
        minWidth: 0,
        bgcolor: tokenNeutral.lighter,
        '&:hover': {
          bgcolor: tokenNeutral.main,
        },
      }}
    >
      REQUEST
    </Button>
  );
}

function PartMetadata({ part, compact = false }: { part: SparePart; compact?: boolean }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: compact ? 0.7 : 0.8, flexWrap: 'wrap' }}>
      <Typography variant="caption" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
        <CircleIcon sx={{ fontSize: 8, color: tokenBrand.light }} /> {part.location}
      </Typography>
      <Typography variant="caption" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
        <InventoryIcon sx={{ fontSize: 13, color: tokenBrand.light }} />
        {compact ? `${part.available}/${part.total}` : `Avail. ${part.available}/${part.total}`}
      </Typography>
    </Box>
  );
}

function SelectedPartMetadata({ part }: { part: SparePart }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap' }}>
      <Typography variant="caption" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
        <LocationOnIcon sx={{ fontSize: 14, color: tokenBrand.light }} /> {part.location}
      </Typography>
      <Typography variant="caption" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 0.3 }}>
        <InventoryIcon sx={{ fontSize: 13, color: tokenBrand.light }} />
        {`Avail. ${part.quantity ?? 1}/${part.total}`}
      </Typography>
    </Box>
  );
}

function FutureActionsTab({
  futureActions,
  maintenanceRequests,
  workOrderCandidates,
  linkedWorkOrderIds,
  onLinkWorkOrder,
}: {
  futureActions: FutureAction[];
  maintenanceRequests: MaintenanceRequestSummary[];
  workOrderCandidates: WorkOrderLinkCandidate[];
  linkedWorkOrderIds: Set<string>;
  onLinkWorkOrder: (linkedWorkOrder: LinkedWorkOrder) => void;
}) {
  const futureActionWorkOrderCandidates: WorkOrderLinkCandidate[] = futureActions.map((action) => ({
    id: action.id,
    type: action.type,
    title: action.activityType,
    description: `${action.activityType} ${action.type.toLowerCase()} work order scheduled from future actions.`,
    scheduledFor: action.date,
    assignee: 'Unassigned',
    status: `${action.priority} priority`,
    priority: action.priority,
  }));
  const allWorkOrderCandidates = [...futureActionWorkOrderCandidates, ...workOrderCandidates];

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Box sx={{ display: 'none' }}>
        {!futureActions.length ? (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>No future actions defined.</Typography>
        ) : (
          futureActions.map((action) => (
            <Box
              key={action.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) auto' },
                gap: 1,
                alignItems: 'center',
                bgcolor: tokenNeutral.lightest,
                borderRadius: 1.5,
                px: 1.4,
                py: 1,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 700, lineHeight: 1.15 }}>
                  <Box component="span" sx={{ color: tokenNeutral.darkest, mr: 0.7 }}>{action.date}</Box>
                  {action.type}
                </Typography>
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: getPriorityMetaTone(action.priority),
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  textAlign: 'right',
                }}
              >
                {action.activityType} • {action.priority} priority
              </Typography>
            </Box>
          ))
        )}
      </Box>

      <Box sx={{ display: 'grid', gap: 0.85 }}>
        <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.2 }}>
          Work Orders
        </Typography>
        {!allWorkOrderCandidates.length ? (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>No work orders available to link.</Typography>
        ) : (
          allWorkOrderCandidates.map((candidate) => (
            <LinkableWorkOrderRow
              key={candidate.id}
              label={candidate.id.startsWith('fa-') ? candidate.scheduledFor : candidate.id}
              type={candidate.type}
              title={candidate.title}
              priority={candidate.priority}
              isLinked={linkedWorkOrderIds.has(candidate.id)}
              onLink={() => onLinkWorkOrder(candidate)}
            />
          ))
        )}
      </Box>

      <Box sx={{ display: 'grid', gap: 0.85 }}>
        <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.2 }}>
          Maintenance Requests
        </Typography>
        {!maintenanceRequests.length ? (
          <Typography variant="caption" color="text.secondary" fontWeight={600}>No open maintenance requests for this equipment.</Typography>
        ) : (
          maintenanceRequests.map((request) => (
            <Box
              key={request.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: 1,
                alignItems: 'center',
                bgcolor: tokenCommon.white,
                borderBottom: `1px solid ${tokenNeutral.main}`,
                px: 0.2,
                py: 1,
                '&:last-of-type': {
                  borderBottom: 'none',
                },
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 700, lineHeight: 1.2 }}>
                  <Box component="span" sx={{ color: tokenNeutral.darkest, mr: 0.7 }}>{request.id}</Box>
                  {request.title}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: getRequestPriorityTone(request.priority),
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    textAlign: 'right',
                  }}
                >
                  {capitalize(request.priority)} priority
                </Typography>
                <IconButton
                  size="small"
                  title="Open Maintenance Request"
                  sx={{
                    width: 30,
                    height: 30,
                    color: tokenBrand.main,
                    border: `1px solid ${tokenNeutral.main}`,
                    borderRadius: 1,
                    pointerEvents: 'none',
                  }}
                >
                  <OpenInNewIcon sx={{ fontSize: 17 }} />
                </IconButton>
                <Button
                  size="small"
                  variant={linkedWorkOrderIds.has(request.id) ? 'contained' : 'outlined'}
                  startIcon={<LinkIcon sx={{ fontSize: 15 }} />}
                  disabled={linkedWorkOrderIds.has(request.id)}
                  onClick={() => onLinkWorkOrder({
                    id: request.id,
                    type: 'Maintenance Request',
                    title: `${request.id} - ${request.title}`,
                    description: `${request.title} for ${request.equipment}.`,
                    scheduledFor: 'Open',
                    assignee: 'Unassigned',
                    status: `${capitalize(request.priority)} priority`,
                  })}
                  sx={{
                    minWidth: 74,
                    height: 28,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontSize: 11.5,
                    fontWeight: 800,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' },
                  }}
                >
                  {linkedWorkOrderIds.has(request.id) ? 'Linked' : 'Link'}
                </Button>
              </Box>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

function LinkableWorkOrderRow({
  label,
  type,
  title,
  priority,
  isLinked,
  onLink,
}: {
  label: string;
  type?: string;
  title: string;
  priority: string;
  isLinked: boolean;
  onLink: () => void;
}) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) auto' },
        gap: { xs: 0.7, sm: 1 },
        alignItems: 'center',
        bgcolor: tokenCommon.white,
        borderBottom: `1px solid ${tokenNeutral.main}`,
        px: 0.2,
        py: 1,
        '&:last-of-type': {
          borderBottom: 'none',
        },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 700, lineHeight: 1.2 }}>
          <Box component="span" sx={{ color: tokenNeutral.darkest, mr: 0.7 }}>{label}</Box>
          {type && <Box component="span" sx={{ color: workstationVisuals.tierTextHeading, mr: 0.7, fontWeight: 900 }}>{type}</Box>}
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
        <Typography
          variant="caption"
          sx={{
            color: getPriorityMetaTone(priority),
            fontWeight: 700,
            whiteSpace: 'nowrap',
            textAlign: 'right',
          }}
        >
          {priority} priority
        </Typography>
        <IconButton
          size="small"
          title="Open Work Order"
          sx={{
            width: 30,
            height: 30,
            color: tokenBrand.main,
            border: `1px solid ${tokenNeutral.main}`,
            borderRadius: 1,
            pointerEvents: 'none',
          }}
        >
          <OpenInNewIcon sx={{ fontSize: 17 }} />
        </IconButton>
        <Button
          size="small"
          variant={isLinked ? 'contained' : 'outlined'}
          startIcon={<LinkIcon sx={{ fontSize: 15 }} />}
          disabled={isLinked}
          onClick={onLink}
          sx={{
            minWidth: 74,
            height: 28,
            borderRadius: 1,
            textTransform: 'none',
            fontSize: 11.5,
            fontWeight: 800,
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          }}
        >
          {isLinked ? 'Linked' : 'Link'}
        </Button>
      </Box>
    </Box>
  );
}

function LinkedWorkOrdersTab({
  linkedWorkOrders,
  onOpenWorkOrder,
}: {
  linkedWorkOrders: LinkedWorkOrder[];
  onOpenWorkOrder?: (workOrderId: string) => void;
}) {
  if (!linkedWorkOrders.length) {
    return <Typography variant="caption" color="text.secondary" fontWeight={600}>No linked work orders yet.</Typography>;
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: 1.5,
        border: `1px solid ${tokenNeutral.main}`,
        bgcolor: tokenCommon.white,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
        <Box>
          <Typography sx={{ color: workstationVisuals.tierTextHeading, fontSize: 12.5, fontWeight: 900 }}>
            Linked Work Orders
          </Typography>
          <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: 11, fontWeight: 650, mt: 0.15 }}>
            Linked to this work order.
          </Typography>
        </Box>
        <Chip
          label={`${linkedWorkOrders.length} linked`}
          size="small"
          sx={{ height: 20, borderRadius: 99, bgcolor: tokenNeutral.lightest, color: tokenBrand.main, border: `1px solid ${tokenInfo.lightest}`, fontSize: 10, fontWeight: 900 }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {linkedWorkOrders.map((candidate) => {
          const targetWorkOrderId = candidate.targetWorkOrderId;
          const isNavigable = Boolean(targetWorkOrderId && onOpenWorkOrder);

          return (
            <Paper
              key={candidate.id}
              elevation={0}
              onClick={() => {
                if (targetWorkOrderId) onOpenWorkOrder?.(targetWorkOrderId);
              }}
              sx={{
                p: 1,
                borderRadius: 1.2,
                border: `1px solid ${tokenNeutral.dark}`,
                bgcolor: tokenNeutral.lightest,
                cursor: isNavigable ? 'pointer' : 'default',
                transition: 'border-color 0.15s ease, background-color 0.15s ease',
                '&:hover': isNavigable
                  ? {
                      borderColor: tokenInfo.lightest,
                      bgcolor: tokenNeutral.lightest,
                    }
                  : undefined,
              }}
            >
              <Chip
                label={`${candidate.type} - ${candidate.status}`}
                size="small"
                sx={{ height: 20, mb: 0.55, bgcolor: tokenCommon.white, color: workstationVisuals.tierTextHeading, border: `1px solid ${tokenNeutral.dark}`, fontSize: 10, fontWeight: 900 }}
              />
              <Typography sx={{ color: workstationVisuals.textPrimary, fontSize: 12.8, fontWeight: 900, lineHeight: 1.25 }}>
                {candidate.title}
              </Typography>
              <Typography sx={{ color: workstationVisuals.tierTextLabel, fontSize: 11.3, fontWeight: 650, lineHeight: 1.35, mt: 0.35 }}>
                {candidate.description}
              </Typography>
              <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: 11.3, fontWeight: 750, mt: 0.45 }}>
                {candidate.scheduledFor} - {candidate.assignee}
              </Typography>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}

function EquipmentHistoryTab({ items, pauseEvents }: { items: EquipmentHistoryEntry[]; pauseEvents: WorkOrderPauseEvent[] }) {
  if (!items.length && !pauseEvents.length) {
    return <Typography variant="caption" color="text.secondary" fontWeight={600}>No equipment history available.</Typography>;
  }

  return (
    <Box sx={{ display: 'grid', gap: 0.75 }}>
      {pauseEvents.map((event) => (
        <Box
          key={event.id}
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'auto minmax(0, 1fr) auto' },
            gap: { xs: 0.45, sm: 0.8 },
            alignItems: 'center',
            bgcolor: tokenNeutral.lightest,
            border: `1px solid ${tokenWarning.lighter}`,
            borderRadius: 1.5,
            px: 1.1,
            py: 0.9,
          }}
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, minWidth: 0 }}>
            <WarningIcon sx={{ fontSize: 15, color: tokenWarning.dark, flex: '0 0 auto' }} />
            <Typography variant="caption" sx={{ color: tokenWarning.darker, fontWeight: 800, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
              Paused
            </Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" sx={{ color: tokenWarning.darker, fontWeight: 800, lineHeight: 1.2 }}>
              {event.reason}
            </Typography>
            <Typography variant="caption" sx={{ color: tokenWarning.darker, fontWeight: 600, lineHeight: 1.25, display: 'block' }}>
              Paused by {event.pausedBy} on {event.pausedAt}
              {event.notes ? ` - Notes: ${event.notes}` : ''}
              {event.expectedResumeAt ? ` - Expected resume: ${event.expectedResumeAt}` : ''}
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: tokenWarning.dark, fontWeight: 900, justifySelf: { xs: 'start', sm: 'end' }, whiteSpace: 'nowrap' }}>
            Work Order Pause
          </Typography>
        </Box>
      ))}
      {items.map((item) => {
        const isBreakdown = item.type === 'Breakdown';

        return (
          <Box
            key={item.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'auto auto minmax(0, 1fr) auto' },
              gap: { xs: 0.35, sm: 0.65 },
              alignItems: 'center',
              bgcolor: isBreakdown ? tokenNeutral.lighter : tokenNeutral.lightest,
              border: isBreakdown ? `1px solid ${tokenError.light}` : '1px solid transparent',
              borderRadius: 1.5,
              px: 1.1,
              py: 0.75,
            }}
          >
            <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, minWidth: 0 }}>
              <CalendarMonthIcon sx={{ fontSize: 15, color: tokenBrand.light, flex: '0 0 auto' }} />
              <Typography variant="caption" sx={{ color: workstationVisuals.tierTextMeta, fontWeight: 700, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                {item.date}
              </Typography>
            </Box>
            <Typography
              variant="body2"
              sx={{
                color: isBreakdown ? tokenError.dark : workstationVisuals.tierTextHeading,
                fontWeight: isBreakdown ? 700 : 800,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              {item.type}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isBreakdown ? tokenError.dark : workstationVisuals.tierTextMeta,
                fontWeight: 600,
                lineHeight: 1.25,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: { xs: 'normal', sm: 'nowrap' },
              }}
            >
              {item.description}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: isBreakdown ? tokenError.dark : workstationVisuals.tierTextLabel,
                fontWeight: 800,
                lineHeight: 1.2,
                justifySelf: { xs: 'start', sm: 'end' },
                whiteSpace: 'nowrap',
              }}
            >
              {item.responsible}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function AttachedFilesTab({ files }: { files: AttachedFile[] }) {
  const [viewerFile, setViewerFile] = useState<AttachedFile | null>(null);

  if (!files.length) {
    return <Typography variant="caption" color="text.secondary" fontWeight={600}>No attached files.</Typography>;
  }

  return (
    <>
      <Box sx={{ display: 'grid', gap: 1 }}>
        {files.map((file) => (
          <Box key={file.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between', border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.5, p: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <DescriptionIcon sx={{ color: tokenBrand.light, fontSize: 18 }} />
              <Typography variant="body2" sx={{ fontWeight: 700, color: workstationVisuals.tierTextHeading, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</Typography>
            </Box>
            <Button
              onClick={() => setViewerFile(file)}
              size="small"
              disabled={!file.href}
              sx={{ fontWeight: 700 }}
            >
              VIEW
            </Button>
          </Box>
        ))}
      </Box>

      <FileViewerDialog file={viewerFile} onClose={() => setViewerFile(null)} />
    </>
  );
}

function FileViewerDialog({ file, onClose }: { file: AttachedFile | null; onClose: () => void }) {
  return (
    <Dialog
      open={!!file}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, height: { xs: '86vh', md: '88vh' } } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1.25 }}>
        <Typography variant="subtitle1" sx={{ color: tokenBrand.dark, fontWeight: 800, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {file?.name ?? 'File Viewer'}
        </Typography>
        <IconButton onClick={onClose} sx={{ ml: 'auto', color: tokenBrand.light }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ bgcolor: tokenNeutral.lightest, p: 2, minHeight: 0, overflow: 'auto' }}>
        {file?.href && (
          <Box
            component="img"
            src={file.href}
            alt={file.name}
            sx={{
              display: 'block',
              maxWidth: '100%',
              width: 'auto',
              mx: 'auto',
              border: `1px solid ${tokenNeutral.main}`,
              bgcolor: tokenCommon.white,
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function getPreventiveTaskId(task: PreventiveOperation) {
  return `${task.op}-${task.operation}`;
}

function TasklistTab({
  tasks,
  showTaskChecks = false,
  taskState = {},
  onTaskStateChange,
}: {
  tasks: PreventiveOperation[];
  showTaskChecks?: boolean;
  taskState?: Record<string, PreventiveTaskState>;
  onTaskStateChange?: (taskId: string, patch: Partial<PreventiveTaskState>) => void;
}) {
  if (!tasks.length) {
    return <Typography variant="caption" color="text.secondary" fontWeight={600}>No preventive tasklist defined.</Typography>;
  }

  const operationGridColumns = showTaskChecks
    ? '36px minmax(0, 1fr) minmax(180px, 240px) minmax(220px, 280px)'
    : 'minmax(0, 1fr) minmax(180px, 240px)';
  const responsiveOperationGridColumns = showTaskChecks
    ? { xs: 'minmax(0, 1fr)', md: '36px minmax(0, 1fr) minmax(180px, 240px) minmax(220px, 280px)' }
    : { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) minmax(180px, 240px)' };

  return (
    <Box sx={{ display: 'grid', gap: 0.7 }}>
      <Box
        sx={{
          display: { xs: 'none', md: 'grid' },
          gridTemplateColumns: operationGridColumns,
          gap: 1.25,
          alignItems: 'center',
          px: 0.5,
          pb: 0.3,
        }}
      >
        {showTaskChecks && <Box />}
        <Typography variant="caption" sx={{ color: workstationVisuals.tierTextMeta, fontWeight: 900, textTransform: 'uppercase' }}>
          Operation Description
        </Typography>
        <Typography variant="caption" sx={{ color: workstationVisuals.tierTextMeta, fontWeight: 900, textTransform: 'uppercase' }}>
          Spare Parts
        </Typography>
        {showTaskChecks && (
          <Typography variant="caption" sx={{ color: workstationVisuals.tierTextMeta, fontWeight: 900, textTransform: 'uppercase' }}>
            Notes / Exception
          </Typography>
        )}
      </Box>

      {tasks.map((task) => {
        const taskId = getPreventiveTaskId(task);
        const currentTaskState = taskState[taskId] ?? { done: false, exception: false, note: '' };

        return (
          <Box
            key={taskId}
            sx={{
              display: 'grid',
              gridTemplateColumns: responsiveOperationGridColumns,
              gap: 1.25,
              alignItems: 'flex-start',
              px: 0.5,
              py: 0.85,
              borderBottom: `1px solid ${tokenNeutral.lighter}`,
              '&:last-of-type': {
                borderBottom: 'none',
              },
            }}
          >
            {showTaskChecks && (
              <Checkbox
                checked={Boolean(currentTaskState.done)}
                onChange={(event) => onTaskStateChange?.(taskId, { done: event.target.checked })}
                size="small"
                sx={{
                  color: tokenBrand.light,
                  '&.Mui-checked': { color: tokenSuccess.darkest },
                  p: 0,
                  mt: { xs: 0, sm: -0.2 },
                  justifySelf: { xs: 'start', sm: 'center' },
                }}
              />
            )}
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  color: workstationVisuals.tierTextHeading,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  fontSize: 12.5,
                  fontWeight: 700,
                  lineHeight: 1.35,
                  textTransform: 'uppercase',
                  overflowWrap: 'anywhere',
                }}
              >
                {task.description}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'grid',
                gap: 0.35,
                minWidth: 0,
                pt: { xs: 0, sm: 0 },
              }}
            >
              {task.spareParts?.length ? (
                task.spareParts.map((part) => (
                  <Box
                    key={part.name}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '18px minmax(0, 1fr)',
                      gap: 0.5,
                      alignItems: 'start',
                    }}
                  >
                    {part.stagedInToolCrib ? (
                      <CheckCircleOutlineIcon sx={{ color: tokenSuccess.darkest, fontSize: 16, mt: 0.1 }} />
                    ) : (
                      <ErrorOutlineIcon sx={{ color: tokenError.darkest, fontSize: 16, mt: 0.1 }} />
                    )}
                    <Box sx={{ minWidth: 0, display: 'grid', gap: 0.25 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: tokenBrand.dark,
                      fontWeight: 800,
                      lineHeight: 1.25,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {part.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: part.stagedInToolCrib ? tokenSuccess.darkest : tokenError.darkest,
                      fontSize: 10,
                      fontWeight: 900,
                      lineHeight: 1.1,
                    }}
                  >
                    {part.stagedInToolCrib ? 'Staged in Tool Crib' : 'Not staged in Tool Crib'}
                  </Typography>
                    </Box>
                  </Box>
                ))
              ) : (
                <Typography variant="caption" sx={{ color: tokenNeutral.dark, fontWeight: 700 }}>
                  -
                </Typography>
              )}
            </Box>
            {showTaskChecks && (
              <Box sx={{ display: 'grid', gap: 0.65, minWidth: 0 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={Boolean(currentTaskState.exception)}
                      onChange={(event) => onTaskStateChange?.(taskId, { exception: event.target.checked })}
                      size="small"
                      sx={{ color: tokenWarning.darker, '&.Mui-checked': { color: tokenWarning.darker }, p: 0.35 }}
                    />
                  }
                  label={<Typography variant="caption" sx={{ color: tokenWarning.darker, fontWeight: 800 }}>Exception / note</Typography>}
                  sx={{ m: 0, alignItems: 'center' }}
                />
                {currentTaskState.exception && (
                  <TextField
                    label="Task notes"
                    value={currentTaskState.note}
                    onChange={(event) => onTaskStateChange?.(taskId, { note: event.target.value })}
                    required
                    size="small"
                    multiline
                    minRows={2}
                    InputLabelProps={{ shrink: true }}
                    placeholder="Describe exception, skipped step, or observation..."
                  />
                )}
              </Box>
            )}
          </Box>
        );
      })}
    </Box>
  );
}

function SafetyRequirementsPanel({
  workOrder,
  gateState,
  onGateStateChange,
  blockMessages,
}: {
  workOrder: WorkOrder;
  gateState: SafetyExecutionGateState;
  onGateStateChange: (state: SafetyExecutionGateState) => void;
  blockMessages: string[];
}) {
  const { safetyRequirements } = workOrder;
  const qualityRequirements = getPlannedQualityRequirements(workOrder);
  const permits = (safetyRequirements.permits ?? []).map(normalizePermitRequirement);
  const isLotoConfirmed = !safetyRequirements.lotoRequired || (gateState.lockoutConfirmed && gateState.tagoutConfirmed);
  const isPpeConfirmed = safetyRequirements.ppe.length === 0 || gateState.ppeConfirmed;
  const completionRequirementItems = getCompletionRequirementItems(qualityRequirements);
  const visibleCompletionItems = completionRequirementItems.slice(0, 4);
  const completionRequirementTypes = Array.from(new Set(completionRequirementItems.map((item) => item.type)));
  const hasBeforeStartingRequirements = Boolean(safetyRequirements.equipmentCondition) || safetyRequirements.lotoRequired || safetyRequirements.ppe.length > 0 || permits.length > 0;
  const procedureDocuments = getSafetyProcedureDocuments(safetyRequirements);
  const hasAwarenessItems = safetyRequirements.hazards.length > 0
    || Boolean(safetyRequirements.safetyNotes)
    || Boolean(qualityRequirements.qualityNotes || workOrder.qualityRequired);

  const updateGateState = (patch: Partial<SafetyExecutionGateState>) => {
    onGateStateChange({ ...gateState, ...patch });
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.45,
        borderRadius: 2,
        borderColor: tokenNeutral.main,
        bgcolor: tokenCommon.white,
        height: 'fit-content',
        display: 'grid',
        gap: 1.25,
      }}
    >
      <Box sx={{ display: 'grid', gap: 0.75, pb: 0.15 }}>
        <Typography variant="subtitle2" sx={{ color: workstationVisuals.textPrimary, fontWeight: 900, letterSpacing: 0, lineHeight: 1.2 }}>
          Safety & Quality Requirements
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.45, flexWrap: 'wrap' }}>
          <GateStatusChip
            label={blockMessages.length ? 'Attention Needed' : 'Ready to Start'}
            tone={blockMessages.length ? 'warning' : 'success'}
          />
          <GateStatusChip
            label={completionRequirementItems.length ? 'Completion Pending' : 'Ready to Complete'}
            tone={completionRequirementItems.length ? 'warning' : 'success'}
          />
        </Box>
      </Box>

      <RequirementSection
        title="Before Starting"
        icon={<WarningIcon />}
        tone={blockMessages.length ? tokenWarning.darker : workstationVisuals.textSecondary}
        primary
      >
        {!hasBeforeStartingRequirements && (
          <Typography variant="caption" sx={{ color: workstationVisuals.textSecondary, fontWeight: 700 }}>
            No planned start gates.
          </Typography>
        )}

        {safetyRequirements.equipmentCondition && (
          <CompactRequirementRow
            icon={<BuildIcon />}
            label="Equipment Condition"
            value={safetyRequirements.equipmentCondition}
            valueTone="blue"
          >
            <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 700, lineHeight: 1.25 }}>
              Required machine state during maintenance execution.
            </Typography>
          </CompactRequirementRow>
        )}

        {safetyRequirements.lotoRequired && (
          <CompactRequirementRow
            icon={<ReportProblemIcon />}
            label="LOTO Required"
            value={isLotoConfirmed ? 'Confirmed' : 'Pending'}
            valueTone={isLotoConfirmed ? 'neutral' : 'warning'}
          >
            {safetyRequirements.lockoutPoint && (
              <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 700, lineHeight: 1.25 }}>
                Lockout Point: {safetyRequirements.lockoutPoint}
              </Typography>
            )}
            {safetyRequirements.procedure && (
              <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 600, lineHeight: 1.25 }}>
                Procedure: {safetyRequirements.procedure}
              </Typography>
            )}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 0.3, pt: 0.25 }}>
              <FormControlLabel
                control={<Checkbox checked={gateState.lockoutConfirmed} onChange={(event) => updateGateState({ lockoutConfirmed: event.target.checked })} size="small" sx={{ p: 0.35, color: workstationVisuals.textMuted, '&.Mui-checked': { color: workstationVisuals.tierTextLabel } }} />}
                label={<Typography variant="caption" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 800 }}>Lockout confirmation</Typography>}
                sx={{ m: 0, alignItems: 'center' }}
              />
              <FormControlLabel
                control={<Checkbox checked={gateState.tagoutConfirmed} onChange={(event) => updateGateState({ tagoutConfirmed: event.target.checked })} size="small" sx={{ p: 0.35, color: workstationVisuals.textMuted, '&.Mui-checked': { color: workstationVisuals.tierTextLabel } }} />}
                label={<Typography variant="caption" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 800 }}>Tagout confirmation</Typography>}
                sx={{ m: 0, alignItems: 'center' }}
              />
            </Box>
          </CompactRequirementRow>
        )}

        {safetyRequirements.ppe.length > 0 && (
          <SubRequirementGroup>
            <RequirementChipGroup title="Required PPE" icon={<ShieldIcon sx={{ color: workstationVisuals.textSecondary, fontSize: 17 }} />} color={workstationVisuals.tierTextHeading} items={safetyRequirements.ppe} />
            <FormControlLabel
              control={<Checkbox checked={gateState.ppeConfirmed} onChange={(event) => updateGateState({ ppeConfirmed: event.target.checked })} size="small" sx={{ p: 0.35, color: workstationVisuals.textMuted, '&.Mui-checked': { color: workstationVisuals.tierTextLabel } }} />}
              label={<Typography variant="caption" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 800 }}>Required PPE confirmed</Typography>}
              sx={{ m: 0, alignItems: 'center' }}
            />
          </SubRequirementGroup>
        )}

        {permits.length > 0 && (
          <SubRequirementGroup>
            <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 800 }}>
              Required Permits
            </Typography>
            <Box sx={{ display: 'grid', gap: 0.35 }}>
              {permits.map((permit) => (
                <MutedListRow key={getPermitKey(permit)} label={permit.type} />
              ))}
            </Box>
          </SubRequirementGroup>
        )}

        {procedureDocuments.length > 0 && (
          <SubRequirementGroup>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
              <DescriptionIcon sx={{ color: workstationVisuals.textSecondary, fontSize: 17 }} />
              <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 800 }}>
                SOPs & Procedure Documents
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gap: 0.35 }}>
              {procedureDocuments.map((document) => (
                <Box key={document} sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0 }}>
                  <DescriptionIcon sx={{ color: tokenBrand.dark, fontSize: 14, flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: tokenBrand.dark, fontWeight: 700, lineHeight: 1.25, overflowWrap: 'anywhere' }}>
                    {document}
                  </Typography>
                </Box>
              ))}
            </Box>
          </SubRequirementGroup>
        )}

        {blockMessages.length > 0 && (
          <InlineRequirementWarning message={blockMessages[0]} />
        )}
      </RequirementSection>

      <RequirementSection
        title="Before Completing"
        icon={<FactCheckIcon />}
        tone={completionRequirementItems.length ? tokenWarning.darker : tokenSuccess.darkest}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 900, lineHeight: 1.2 }}>
            {completionRequirementItems.length
              ? `${completionRequirementItems.length} completion requirements pending`
              : 'No planned completion gates'}
          </Typography>
          <GateStatusChip label={completionRequirementItems.length ? 'Pending' : 'Ready'} tone={completionRequirementItems.length ? 'warning' : 'success'} />
        </Box>
        {completionRequirementTypes.length > 0 && (
          <Typography variant="caption" sx={{ color: workstationVisuals.textSecondary, fontWeight: 700, lineHeight: 1.25 }}>
            {completionRequirementTypes.join(' / ')}
          </Typography>
        )}
        {visibleCompletionItems.length > 0 && (
          <Box sx={{ display: 'grid', gap: 0.55, pt: 0.15 }}>
            {visibleCompletionItems.map((item) => (
              <MutedListRow key={`${item.type}-${item.label}`} label={item.label} />
            ))}
            {completionRequirementItems.length > visibleCompletionItems.length && (
              <Typography variant="caption" sx={{ color: workstationVisuals.textSecondary, fontWeight: 800, pl: 1.6, lineHeight: 1.35 }}>
                +{completionRequirementItems.length - visibleCompletionItems.length} more in completion flow
              </Typography>
            )}
          </Box>
        )}
      </RequirementSection>

      {hasAwarenessItems && (
        <Accordion disableGutters sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: '6px !important', boxShadow: 'none', bgcolor: tokenNeutral.lightest, '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: 18, color: workstationVisuals.textSecondary }} />} sx={{ minHeight: 38, px: 0.9, '& .MuiAccordionSummary-content': { my: 0.65 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
              <CircleIcon sx={{ color: workstationVisuals.textMuted, fontSize: 12 }} />
              <Typography variant="caption" sx={{ color: workstationVisuals.textSecondary, fontWeight: 800 }}>
                Awareness
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, px: 0.9, pb: 0.9, display: 'grid', gap: 0.75 }}>
            <RequirementChipGroup title="Known Hazards" icon={<WarningIcon sx={{ color: workstationVisuals.textSecondary, fontSize: 17 }} />} color={workstationVisuals.textSecondary} items={safetyRequirements.hazards} />
            {safetyRequirements.safetyNotes && (
              <SecondaryNote label="Safety notes" value={safetyRequirements.safetyNotes} />
            )}
            {(qualityRequirements.qualityNotes || workOrder.qualityRequired) && (
              <SecondaryNote label="Quality notes" value={qualityRequirements.qualityNotes ?? workOrder.qualityRequired} />
            )}
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );
}

function RequirementSection({ title, icon, tone, children, primary = false }: { title: string; icon: React.ReactNode; tone: string; children: React.ReactNode; primary?: boolean }) {
  return (
    <Box sx={{ border: `1px solid ${tokenNeutral.main}`, borderRadius: 1.25, overflow: 'hidden', display: 'grid', bgcolor: tokenCommon.white }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, px: 0.9, py: 0.65, bgcolor: primary ? tokenCommon.white : tokenNeutral.lightest, borderLeft: `3px solid ${tone}` }}>
        <Box sx={{ color: tone, display: 'inline-flex', '& svg': { fontSize: 17 } }}>{icon}</Box>
        <Typography variant="caption" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 900, lineHeight: 1.2 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gap: primary ? 0.95 : 0.75, px: 0.9, py: 0.85 }}>
        {children}
      </Box>
    </Box>
  );
}

function SubRequirementGroup({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gap: 0.5, pl: 1.15, py: 0.15, borderLeft: `2px solid ${tokenNeutral.lighter}` }}>
      {children}
    </Box>
  );
}

function MutedListRow({ label }: { label: string }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: '12px minmax(0, 1fr)', gap: 0.45, alignItems: 'start' }}>
      <CircleIcon sx={{ color: tokenNeutral.dark, fontSize: 7, mt: 0.55 }} />
      <Typography variant="caption" sx={{ color: workstationVisuals.tierTextLabel, fontWeight: 650, lineHeight: 1.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {label}
      </Typography>
    </Box>
  );
}

function CompactRequirementRow({
  icon,
  label,
  value,
  valueTone = 'neutral',
  children,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueTone?: 'neutral' | 'warning' | 'blue';
  children?: React.ReactNode;
}) {
  const valuePalette = {
    neutral: { bg: tokenNeutral.lightest, fg: workstationVisuals.tierTextLabel, border: tokenNeutral.main },
    warning: { bg: tokenNeutral.lightest, fg: tokenWarning.darker, border: tokenWarning.lighter },
    blue: { bg: tokenNeutral.lightest, fg: tokenBrand.dark, border: tokenInfo.lightest },
  }[valueTone];

  return (
    <Box sx={{ display: 'grid', gap: 0.45 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0 }}>
          <Box sx={{ color: workstationVisuals.textSecondary, display: 'inline-flex', '& svg': { fontSize: 17 } }}>{icon}</Box>
          <Typography variant="body2" sx={{ color: workstationVisuals.tierTextHeading, fontWeight: 800, lineHeight: 1.2 }}>
            {label}
          </Typography>
        </Box>
        <Chip
          label={value}
          size="small"
          sx={{ height: 22, bgcolor: valuePalette.bg, border: `1px solid ${valuePalette.border}`, color: valuePalette.fg, fontSize: 10.5, fontWeight: 800 }}
        />
      </Box>
      {children}
    </Box>
  );
}

function InlineRequirementWarning({ message }: { message: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.55, color: tokenWarning.darker, px: 0.75, py: 0.65, bgcolor: tokenNeutral.lightest, borderRadius: 1, border: `1px solid ${tokenWarning.lighter}` }}>
      <WarningIcon sx={{ fontSize: 16, mt: 0.05, flexShrink: 0 }} />
      <Typography variant="caption" sx={{ color: tokenWarning.darker, fontWeight: 800, lineHeight: 1.3 }}>
        {message}
      </Typography>
    </Box>
  );
}

function GateStatusChip({ label, tone }: { label: string; tone: 'danger' | 'warning' | 'success' | 'neutral' }) {
  const palette = {
    danger: { bg: tokenNeutral.lightest, fg: tokenWarning.darker, border: tokenWarning.lighter },
    warning: { bg: tokenNeutral.lightest, fg: tokenWarning.darker, border: tokenWarning.lighter },
    success: { bg: tokenNeutral.lightest, fg: workstationVisuals.tierTextLabel, border: tokenNeutral.main },
    neutral: { bg: tokenCommon.white, fg: workstationVisuals.textSecondary, border: tokenNeutral.main },
  }[tone];

  return (
    <Chip
      label={label}
      size="small"
      sx={{ height: 22, bgcolor: palette.bg, color: palette.fg, border: `1px solid ${palette.border}`, fontSize: 10.5, fontWeight: 900 }}
    />
  );
}

function SecondaryNote({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenNeutral.lighter}`, borderRadius: 1, px: 0.8, py: 0.6 }}>
      <Typography variant="caption" sx={{ color: workstationVisuals.textSecondary, fontWeight: 900, display: 'block', lineHeight: 1.2 }}>
        {label}
      </Typography>
      <Typography variant="caption" sx={{ color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1.35 }}>
        {value}
      </Typography>
    </Box>
  );
}

function RequirementChipGroup({ title, icon, color, items }: { title: string; icon: React.ReactNode; color: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <Box sx={{ display: 'grid', gap: 0.35 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
        {icon}
      <Typography variant="caption" color={color} fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.4 }}>
        {items.map((item) => (
          <Chip key={item} label={item} size="small" sx={{ height: 22, bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenNeutral.main}`, color: workstationVisuals.tierTextHeading, fontSize: 10.5, fontWeight: 700 }} />
        ))}
      </Box>
    </Box>
  );
}

function getSafetyProcedureDocuments(safetyRequirements: SafetyRequirements) {
  const documents = [
    safetyRequirements.procedure,
    safetyRequirements.lotoRequired ? 'SOP-LOTO-001' : undefined,
    'WI-MAINT-SAFE-004',
    safetyRequirements.permits?.length ? 'EHS-PERMIT-PROC-002' : undefined,
  ].filter((document): document is string => Boolean(document));

  return Array.from(new Set(documents));
}

function FieldGroup({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 1.5 }}>
      {children}
    </Box>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ bgcolor: tokenNeutral.lighter, p: 1, px: 1.5, borderRadius: 2 }}>
      <Typography variant="caption" color="text.secondary" display="block">{label}</Typography>
      <Typography variant="body2" fontWeight={500} color="text.primary">{value}</Typography>
    </Box>
  );
}

function getPriorityMetaTone(priority: string) {
  const normalized = priority.trim().toLowerCase();
  if (normalized === 'emergency' || normalized === 'high') return tokenWarning.darker;
  if (normalized === 'medium') return tokenWarning.darker;
  return tokenSuccess.darkest;
}

function getRequestPriorityTone(priority: MaintenanceRequestSummary['priority']) {
  if (priority === 'high') return tokenWarning.darker;
  if (priority === 'medium') return tokenWarning.darker;
  return tokenSuccess.darkest;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
