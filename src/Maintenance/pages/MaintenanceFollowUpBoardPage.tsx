import {
  Add as AddIcon,
  AccessTime as AccessTimeIcon,
  AutoAwesome as SparkleIcon,
  CalendarToday as CalendarIcon,
  AssessmentOutlined as KpiIcon,
  ArticleOutlined as DocumentIcon,
  DescriptionOutlined as GenericFileIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  CloudUpload as CloudUploadIcon,
  CenterFocusStrong as FocusIcon,
  DeleteOutline as DeleteIcon,
  ErrorOutline as ErrorOutlineIcon,
  FormatListBulleted as ListIcon,
  FullscreenExit as FocusExitIcon,
  GridOn as GridOnIcon,
  InfoOutlined as InfoOutlinedIcon,
  InsertDriveFileOutlined as FileIcon,
  Inventory2Outlined as InventoryDrawerIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Label as LabelIcon,
  LockOutlined as LockIcon,
  LocationOn as LocationIcon,
  Mic as MicIcon,
  OpenInNew as OpenInNewIcon,
  PauseCircleOutline as PauseCircleIcon,
  PersonOutline as PersonOutlineIcon,
  Remove as RemoveIcon,
  Search as SearchIcon,
  SecurityOutlined as SecurityIcon,
  SchoolOutlined as TrainingIcon,
  NotificationsNoneRounded as NotificationIcon,
  ShowChartOutlined as TimeseriesIcon,
  Tune as TuneIcon,
  ViewInArOutlined as ViewInArIcon,
  ViewColumn as BoardIcon,
  WarningAmberOutlined as WarningAmberIcon,
  Build as WrenchIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  ClickAwayListener,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  InputAdornment,
  IconButton,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { Fragment, useEffect, useRef, useState, type ChangeEvent, type DragEvent as ReactDragEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import EquipmentSelector, { EquipmentSelection } from '../components/EquipmentSelector';
import { InventoryPartDrawer, findInventoryPartByCode, type InventoryPart } from '../components/InventoryPartDrawer';
import { PlanningAgentChatDrawer } from '../components/ai/PlanningAgentChatDrawer';
import { BulkAnalysisDrawer } from '../components/ai/BulkAnalysisDrawer';
import {
  buildDemoSa204PlanningContext,
  buildPlanningAgentContext,
} from '../ai/planningAgent/buildPlanningAgentContext';
import { analyzeBulkRequests, type BulkAnalysisResult, type BulkExistingWork, type BulkPmCandidate, type BulkRecommendation } from '../ai/planningAgent/bulkAnalysis';
import type { PlannedWorkOrder, PlanningAgentContext, PlanningAgentSource } from '../ai/planningAgent/types';
import { getPlannerStaffSkillMatrix } from '../data/plannerStaffSkills';
import type { MaintenanceCard, MaintenancePriority, MaintenancePriorityStyle } from '../types';
import WidgetWorkOrderModal, { type LinkedWorkOrder, type WorkOrder, type WorkOrderLinkCandidate } from '../../workstation/components/WidgetWorkOrderModal';

type MaintenanceLaneData = {
  requests: MaintenanceCard[];
  autonomous: MaintenanceCard[];
  review: MaintenanceCard[];
  closed: MaintenanceCard[];
  team: {
    scheduling: MaintenanceCard[];
    scheduled: MaintenanceCard[];
    progress: MaintenanceCard[];
  };
};

type LaneExpandedState = {
  requests: boolean;
  planning: boolean;
  scheduled: boolean;
  progress: boolean;
  review: boolean;
  closed: boolean;
};

type LaneKey = keyof LaneExpandedState;

type LaneDefinition = {
  key: LaneKey;
  title: string;
  cards: MaintenanceCard[];
};

type MaintenanceListStatusTone = 'neutral' | 'blue' | 'sky' | 'green' | 'gray';

type MaintenanceRejectionReason =
  | 'Should be ESO'
  | 'Should be Incident'
  | 'Should be General Notes'
  | 'Should be Non-Conformance'
  | 'Should be Scrap'
  | 'Should be Production Output'
  | 'Opened by mistake'
  | 'Duplicate request'
  | 'Insufficient information'
  | 'Other';

type MaintenanceRejectionAudit = {
  requestId: string;
  cardId: string;
  reason: MaintenanceRejectionReason;
  comment: string;
  user: string;
  rejectedAt: string;
};

type MaintenanceLinkedWorkCandidate = {
  id: string;
  type: 'Preventive' | 'Corrective' | 'Breakdown' | 'Work Order';
  title: string;
  description: string;
  scheduledFor: string;
  assignee: string;
  status: string;
};

type MaintenanceLinkedRequest = {
  requestId: string;
  cardId: string;
  candidate: MaintenanceLinkedWorkCandidate;
};

type MaintenanceListRow = {
  card: MaintenanceCard;
  laneKey: LaneKey;
  order: number;
  source: 'MR' | 'WO';
  requestId: string;
  location: string;
  type: string;
  reporter: string;
  createdAt: string;
  status: string;
  statusTone: MaintenanceListStatusTone;
  assignee: string;
  executionIn: string;
  accent: string;
  highlighted?: boolean;
};

type MaintenanceContextualizationKind = 'asset' | 'mr' | 'wo';

type MaintenanceContextualization = {
  kind: MaintenanceContextualizationKind;
  title: string;
  contextId: string;
  location: string;
  equipment: string;
  user: string;
  mrNumber: string;
  woNumber: string;
  openedAt: string;
  summary: string;
  recommendation: string;
  counts: Array<{ label: string; value: string }>;
  actions: string[];
};

type MaintenanceContextDetailView =
  | 'Documents'
  | '3D View'
  | 'ESOs'
  | 'Event log'
  | 'Main KPIs'
  | 'Notifications'
  | 'Properties'
  | 'Related work'
  | 'Spare parts'
  | 'Timeseries'
  | 'Training';

type MaintenanceDocumentCategory = 'Manuals' | 'Electrical' | 'Structural' | 'Mechanical' | 'Procedures' | 'Quality' | 'Safety' | 'Photos';

const maintenanceContextCounts: Array<{ label: MaintenanceContextDetailView; value: string }> = [
  { label: 'Documents', value: '848' },
  { label: '3D View', value: '1' },
  { label: 'ESOs', value: '2' },
  { label: 'Event log', value: '1' },
  { label: 'Main KPIs', value: '6' },
  { label: 'Notifications', value: '7' },
  { label: 'Properties', value: '51' },
  { label: 'Related work', value: '5' },
  { label: 'Spare parts', value: '8' },
  { label: 'Timeseries', value: '6' },
  { label: 'Training', value: '4' },
];

const maintenanceDocumentCategories: Array<{ label: MaintenanceDocumentCategory; count: number }> = [
  { label: 'Manuals', count: 16 },
  { label: 'Electrical', count: 349 },
  { label: 'Structural', count: 103 },
  { label: 'Mechanical', count: 184 },
  { label: 'Procedures', count: 42 },
  { label: 'Quality', count: 67 },
  { label: 'Safety', count: 29 },
  { label: 'Photos', count: 58 },
];

const maintenanceDocumentFiles: Record<MaintenanceDocumentCategory, Array<{ name: string; format: string; size: string; updated: string }>> = {
  Manuals: [
    { name: 'Conveyor C4 operation and maintenance manual', format: 'PDF', size: '8.4 MB', updated: 'Updated Jun 12' },
    { name: 'Belt tensioning procedure', format: 'DOCX', size: '1.2 MB', updated: 'Updated May 28' },
    { name: 'OEM recommended spare parts', format: 'XLSX', size: '684 KB', updated: 'Updated Apr 19' },
    { name: 'Operator quick reference', format: 'PPTX', size: '3.1 MB', updated: 'Updated Mar 08' },
  ],
  Electrical: [
    { name: 'C4 main control cabinet schematic', format: 'PDF', size: '4.8 MB', updated: 'Updated Jun 20' },
    { name: 'Drive motor wiring schedule', format: 'XLSX', size: '920 KB', updated: 'Updated Jun 02' },
    { name: 'VFD parameter backup', format: 'CSV', size: '112 KB', updated: 'Updated May 16' },
  ],
  Structural: [
    { name: 'Transfer frame assembly drawing', format: 'PDF', size: '12.1 MB', updated: 'Updated Mar 30' },
    { name: 'Guarding inspection checklist', format: 'DOCX', size: '744 KB', updated: 'Updated Feb 18' },
  ],
  Mechanical: [
    { name: 'Drive roller assembly drawing', format: 'PDF', size: '7.6 MB', updated: 'Updated Jun 14' },
    { name: 'Bearing and shaft tolerances', format: 'XLSX', size: '486 KB', updated: 'Updated May 09' },
    { name: 'Gearmotor coupling model', format: 'DWG', size: '9.2 MB', updated: 'Updated Apr 11' },
  ],
  Procedures: [
    { name: 'Belt replacement work instruction', format: 'PDF', size: '3.8 MB', updated: 'Updated Jun 18' },
    { name: 'Alignment verification checklist', format: 'DOCX', size: '628 KB', updated: 'Updated Jun 03' },
  ],
  Quality: [
    { name: 'Transfer accuracy inspection standard', format: 'PDF', size: '2.1 MB', updated: 'Updated Jun 22' },
    { name: 'C4 deviation history', format: 'XLSX', size: '1.8 MB', updated: 'Updated Jun 20' },
  ],
  Safety: [
    { name: 'Conveyor lockout tagout procedure', format: 'PDF', size: '1.9 MB', updated: 'Updated Jun 11' },
    { name: 'Machine guarding risk assessment', format: 'DOCX', size: '964 KB', updated: 'Updated Apr 27' },
  ],
  Photos: [
    { name: 'Lane transfer inspection - June', format: 'JPG', size: '5.6 MB', updated: 'Updated Jun 26' },
    { name: 'Drive-side bearing reference', format: 'PNG', size: '3.2 MB', updated: 'Updated Jun 12' },
  ],
};

const maintenanceEquipmentViews = [
  { label: 'Original view', path: '/images/shift-logbook-equipment-views/00_original_reference_with_hotspots.png' },
  { label: 'Front', path: '/images/shift-logbook-equipment-views/01_front_view.png' },
  { label: 'Right side', path: '/images/shift-logbook-equipment-views/02_right_side_view.png' },
  { label: 'Top', path: '/images/shift-logbook-equipment-views/04_top_view.png' },
  { label: 'Isometric', path: '/images/shift-logbook-equipment-views/05_isometric_view.png' },
  { label: 'Conveyor exit', path: '/images/shift-logbook-equipment-views/10_conveyor_exit_closeup.png' },
];

import {
  maintenanceLaneData,
  maintenancePriorityStyles
} from '../data';
import { activeTheme, lightDrawerPanelSx, lightHeaderIconButtonSx } from '../../theme';
import { tokenBrand, tokenError, tokenText, tokenNeutral, tokenDivider } from '../../workstation/theme';


const drawerButtonBaseSx = {
  minWidth: 72,
  height: 40,
  px: 2,
  borderRadius: '8px',
  fontSize: 13,
  fontWeight: 700,
  textTransform: 'none' as const,
  boxShadow: 'none',
};
const drawerTextButtonSx = {
  ...drawerButtonBaseSx,
  color: tokenBrand.main,
  '&:hover': { bgcolor: tokenBrand.softBg },
};
const drawerOutlinedButtonSx = {
  ...drawerButtonBaseSx,
  minWidth: 104,
  px: 3,
  color: tokenBrand.main,
  borderColor: tokenBrand.main,
  bgcolor: 'transparent',
  '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.dark, boxShadow: 'none' },
  '&.Mui-disabled': { borderColor: tokenDivider, color: tokenText.disabled },
};
const drawerContainedButtonSx = {
  ...drawerButtonBaseSx,
  minWidth: 112,
  px: 3,
  bgcolor: tokenBrand.main,
  color: tokenBrand.contrast,
  '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
  '&.Mui-disabled': { bgcolor: tokenBrand.main, color: 'rgba(255,255,255,0.42)' },
};

const followUpStatusOptions = ['Requested', 'Planning', 'Scheduled', 'In Progress', 'Done', 'Closed'] as const;
const followUpTagOptions = ['Paused', 'Rejected'] as const;
const followUpTypeOptions = [
  'Maintenance Request',
  'Autonomous Maintenance',
  'Preventive',
  'Corrective',
  'Breakdown',
] as const;
const criticalityOptions = ['A', 'B', 'C'] as const;
const assignedToOptions = ['Unassigned', 'Assigned to me'] as const;
const dateFilterOptions = ['Overdue', 'Scheduled Today', 'Scheduled This Week', 'Due This Week', 'Requested Today', 'Custom Range'] as const;

type FollowUpStatus = typeof followUpStatusOptions[number];
type FollowUpTag = typeof followUpTagOptions[number] | string;
type FollowUpType = typeof followUpTypeOptions[number];
type FollowUpCriticality = typeof criticalityOptions[number];
type FollowUpAssignedTo = typeof assignedToOptions[number];
type FollowUpDateOption = typeof dateFilterOptions[number];
type FollowUpDateRange = {
  start: string;
  end: string;
};

type FollowUpBoardFilters = {
  statuses: FollowUpStatus[];
  tags: FollowUpTag[];
  types: FollowUpType[];
  priorities: MaintenancePriority[];
  assetHierarchy: EquipmentSelection | null;
  criticalities: FollowUpCriticality[];
  assignedTo: FollowUpAssignedTo[];
  assignedToSearch: string;
  dates: FollowUpDateOption[];
  dateRange: FollowUpDateRange;
};

type FollowUpFilterChip = {
  key: string;
  label: string;
  onDelete: () => void;
};

const emptyFollowUpBoardFilters: FollowUpBoardFilters = {
  statuses: [],
  tags: [],
  types: [],
  priorities: [],
  assetHierarchy: null,
  criticalities: [],
  assignedTo: [],
  assignedToSearch: '',
  dates: [],
  dateRange: { start: '', end: '' },
};

const listGridTemplateColumns = '340px 180px 180px 190px 180px 180px 180px 190px';
const maintenanceBacklogIntentStorageKey = 'workstation:maintenance-backlog-intent';
type MaintenanceBacklogIntent = {
  mode?: 'requests' | 'workOrders';
  cardId?: string;
  filters?: Partial<FollowUpBoardFilters>;
};

type PrioritySlaDefinition = {
  rank: number;
  label: string;
  dueOffsetHours: number | null;
  accent: string;
};
const prioritySlaDefinitions: Record<MaintenancePriority, PrioritySlaDefinition> = {
  Emergency: { rank: 0, label: '0 - Emergency Breakdown', dueOffsetHours: null, accent: '#FF3B30' },
  Immediate: { rank: 1, label: '1 - Immediate (24 hours)', dueOffsetHours: 24, accent: '#EA580C' },
  High: { rank: 2, label: '2 - High (3 days)', dueOffsetHours: 72, accent: '#A16207' },
  Medium: { rank: 3, label: '3 - Medium (7 days)', dueOffsetHours: 168, accent: '#FACC15' },
  Low: { rank: 4, label: '4 - Low (30 days)', dueOffsetHours: 720, accent: '#34C759' },
  'Very Low': { rank: 5, label: '5 - Very Low (90 days)', dueOffsetHours: 2160, accent: '#0284C7' },
};
const severityLevels = (Object.keys(prioritySlaDefinitions) as MaintenancePriority[]).sort(
  (first, second) => prioritySlaDefinitions[first].rank - prioritySlaDefinitions[second].rank
);
const listPriorityAccents: Record<MaintenancePriority, string> = severityLevels.reduce(
  (accents, priority) => ({
    ...accents,
    [priority]: prioritySlaDefinitions[priority].accent,
  }),
  {} as Record<MaintenancePriority, string>
);
const maintenanceRequestCreatedAtByCard: Record<string, string> = {
  'mr-1': '2026/01/13 - 15:30',
  'mr-2': '2026/01/13 - 10:00',
  'mr-3': '2026/01/13 - 09:10',
  'mr-4': '2026/01/13 - 08:30',
  'mr-5': '2026/01/13 - 08:20',
  'mr-6': '2026/01/12 - 17:30',
  'mr-7': '2026/01/12 - 11:30',
  'mr-8': '2026/01/13 - 14:20',
};
const laneCreatedAtFallbacks: Record<LaneKey, string> = {
  requests: '2026/01/13 - 10:00',
  planning: '2026/01/23',
  scheduled: '2026/01/13',
  progress: '2026/01/13',
  review: '2026/01/13',
  closed: '2026/01/13',
};
const statusToneStyles: Record<MaintenanceListStatusTone, { color: string; border: string; bg: string }> = {
  neutral: { color: '#111827', border: '#CBD5E1', bg: activeTheme.backgroundPaper },
  blue: { color: '#2563EB', border: '#2563EB', bg: '#EFF6FF' },
  sky: { color: '#0284C7', border: '#0EA5E9', bg: '#F0F9FF' },
  green: { color: '#16A34A', border: '#86EFAC', bg: '#F0FDF4' },
  gray: { color: '#4B5563', border: '#D1D5DB', bg: '#F9FAFB' },
};
const safetyRequirementOptions: SafetyRequirementOption[] = [
  { id: 'safety-glasses', label: 'Safety glasses', kind: 'ppe' },
  { id: 'cut-gloves', label: 'Cut gloves', kind: 'ppe' },
  { id: 'face-shield', label: 'Face shield', kind: 'ppe' },
  { id: 'hearing-protection', label: 'Hearing protection', kind: 'ppe' },
  { id: 'electrical', label: 'Electrical energy', kind: 'hazard' },
  { id: 'pinch-point', label: 'Pinch point', kind: 'hazard' },
  { id: 'sharp-edge', label: 'Sharp edge', kind: 'hazard' },
  { id: 'hot-surface', label: 'Hot surface', kind: 'hazard' },
  { id: 'hot-work', label: 'Hot work', kind: 'permit' },
  { id: 'confined-space', label: 'Confined space', kind: 'permit' },
  { id: 'electrical-high-energy', label: 'Electrical / High Energy', kind: 'permit' },
  { id: 'work-at-height', label: 'Work at height', kind: 'permit' },
];
const qualityRequirementOptions: QualityRequirementOption[] = [
  { id: 'visual-inspection', label: 'Visual Inspection', kind: 'validation' },
  { id: 'first-piece-approval', label: 'First Piece Approval', kind: 'validation' },
  { id: 'measurement-verification', label: 'Measurement Verification', kind: 'validation' },
  { id: 'calibration-check', label: 'Calibration Check', kind: 'validation' },
  { id: 'qa-approval-required', label: 'QA Approval Required', kind: 'validation' },
  { id: 'photo', label: 'Photo', kind: 'evidence' },
  { id: 'reading-measurement', label: 'Reading / Measurement', kind: 'evidence' },
  { id: 'document-attachment', label: 'Document Attachment', kind: 'evidence' },
  { id: 'sample-test', label: 'Sample Test', kind: 'evidence' },
];
const equipmentMaintenanceConditionOptions: Exclude<EquipmentMaintenanceCondition, ''>[] = ['Running / External', 'Stopped / Internal'];
const workOrderActivityTypeOptions = [
  'Mechanical',
  'Electrical',
  'Automation / Controls',
  'Utilities',
  'Facilities',
  'Safety / EHS',
  'Other',
] as const;
const riskLevelOptions = ['Low', 'Medium', 'High'].map((option) => ({ value: option, label: option }));

export type WorkOrderTab = 'attachments' | 'spareParts' | 'safetyRequirements' | 'qualityRequirements' | 'assignment';
export type ExecutionDrawerSectionKey = 'assignment' | 'spareParts' | 'safety' | 'quality' | 'linkedWorkOrders' | 'attachments' | 'tasklist' | 'logHistory';
type BoardBadgeTone = 'neutral' | 'red' | 'green' | 'orange';
type SparePartsStatusTag = 'No Parts Required' | 'Parts Reserved' | 'Parts Ready' | 'Requested Missing Parts';
type CompletionReviewSection = 'Second Touch Review' | 'Safety Requirements' | 'Quality Requirements' | 'Completion Notes';
type CompletionReviewDecision = 'confirmed' | 'flagged' | 'clear';
const completionReviewSections: CompletionReviewSection[] = ['Second Touch Review', 'Safety Requirements', 'Quality Requirements', 'Completion Notes'];
type SafetyRequirementKind = 'ppe' | 'hazard' | 'permit';
type SafetyRequirementOption = {
  id: string;
  label: string;
  kind: SafetyRequirementKind;
};
type EquipmentMaintenanceCondition = '' | 'Stopped / Internal' | 'Running / External';
type QualityRequirementKind = 'validation' | 'evidence';
type QualityRequirementOption = {
  id: string;
  label: string;
  kind: QualityRequirementKind;
};
type WorkOrderSafetyRequirementPlan = {
  equipmentCondition: EquipmentMaintenanceCondition;
  lotoRequired: boolean;
  lockoutPoint: string;
  procedure: string;
  selectedRequirementIds: string[];
  safetyNotes: string;
};
type WorkOrderQualityRequirementPlan = {
  qualityImpacting: boolean;
  selectedRequirementIds: string[];
  qualityNotes: string;
};
type AssignmentPersonRole = 'Technician' | 'Operator';
type AssignmentSelectorMode = 'responsible' | 'additional';
type AssignmentDayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type AssignmentWorkloadLevel = 'Low' | 'Medium' | 'High' | 'Full' | 'Off';
type AssignmentScheduledDay = {
  key: AssignmentDayKey;
  shortLabel: string;
  dayNumber: string;
  fullLabel: string;
  ctaLabel: string;
  isoDate?: string;
};
type AssignmentDayWorkload = {
  level: AssignmentWorkloadLevel;
  summary: string;
  workOrders: { id: string; type: string }[];
};
type AssignmentPerson = {
  id: string;
  name: string;
  role: AssignmentPersonRole;
  context: string;
  workload: string;
  weeklyLoad: string;
  priorityMix: string;
  shift?: string;
  recommended?: boolean;
  recommendedDayKey?: AssignmentDayKey;
  recommendationReason?: string;
  weeklyWorkload: Record<AssignmentDayKey, AssignmentDayWorkload>;
};
type SparePartOption = {
  id: string;
  code: string;
  description: string;
  location: string;
  availableQuantity: number;
  defaultRequestedQuantity: number;
};

type SelectedSparePart = SparePartOption & {
  requestedQuantity: number;
  sparePartActionStatus?: 'reserved' | 'requested' | 'picked';
};
const maintenanceRejectionReasons: MaintenanceRejectionReason[] = [
  'Should be ESO',
  'Should be Incident',
  'Should be General Notes',
  'Should be Non-Conformance',
  'Should be Scrap',
  'Should be Production Output',
  'Opened by mistake',
  'Duplicate request',
  'Insufficient information',
  'Other',
];

type BoardDragState = {
  pointerId: number;
  startX: number;
  scrollLeft: number;
};

type WorkOrderPauseContext = {
  reason: string;
  pausedBy: string;
  pausedSince: string;
  expectedResume?: string;
  notes?: string;
  escalation?: string;
};

export type WorkOrderDraft = {
  sourceCardId?: string;
  sourceRequestCardId?: string;
  sourceRequestId?: string;
  drawerTitle?: string;
  statusLabel?: string;
  drawerMode?: 'planning' | 'scheduledExecution' | 'completionReview' | 'closed';
  isMaintenanceTypeLocked?: boolean;
  attachmentSrc?: string;
  isReadyForPickUp?: boolean;
  maintenanceType: string;
  equipment: string;
  equipmentCriticality?: 'A' | 'B' | 'C';
  responsibleName?: string;
  problemDescription: string;
  activityType: string;
  downtime: string;
  quality: string;
  ehs: string;
  priority: string;
  responsibleAssignee?: AssignmentPerson;
  additionalAssignees?: AssignmentPerson[];
  scheduledExecutionDay?: AssignmentScheduledDay;
  selectedSpareParts?: SelectedSparePart[];
  linkedWorkOrders?: MaintenanceLinkedWorkCandidate[];
  safetyRequirementPlan: WorkOrderSafetyRequirementPlan;
  qualityRequirementPlan: WorkOrderQualityRequirementPlan;
  pauseContext?: WorkOrderPauseContext;
  resumeHistory?: string[];
  reviewFeedback?: boolean;
  rejectedReviewSections?: CompletionReviewSection[];
};

type MoldingMaintenanceRequestDetails = {
  equipmentId: string;
  moldId: string;
  productOrPartNumber: string;
  productionBatchNumber: string;
  affectedCavityNumbers: string;
  rejectedQuantity: string;
  issueType: string;
  issueDescription: string;
  rejectionReason: string;
  detectionDateTime: string;
  attachments: string[];
};

const moldingMaintenanceRequestDetailsByCardId: Record<string, MoldingMaintenanceRequestDetails> = {
  'mr-8': {
    equipmentId: 'EQ-MOLD-004',
    moldId: 'MOLD-SYR-24C-118',
    productOrPartNumber: 'PN-SYR-10ML-BARREL',
    productionBatchNumber: 'BATCH-260113-042',
    affectedCavityNumbers: '3, 7',
    rejectedQuantity: '186 units',
    issueType: 'Quality defect - molding',
    issueDescription: 'Parts from cavities 3 and 7 show flash on the flange and intermittent short-shot at the gate area.',
    rejectionReason: 'Dimensional non-conformance after in-process visual and gauge inspection.',
    detectionDateTime: '2026/01/13 - 14:12',
    attachments: ['cavity-3-flash-photo.jpg', 'cavity-7-short-shot-photo.jpg', 'batch-inspection-report.pdf'],
  },
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

const emptySafetyRequirementPlan: WorkOrderSafetyRequirementPlan = {
  equipmentCondition: '',
  lotoRequired: false,
  lockoutPoint: '',
  procedure: '',
  selectedRequirementIds: [],
  safetyNotes: '',
};
const emptyQualityRequirementPlan: WorkOrderQualityRequirementPlan = {
  qualityImpacting: false,
  selectedRequirementIds: [],
  qualityNotes: '',
};
const sparePartsStatusTagStyles: Record<SparePartsStatusTag, { color: string; border: string; bg: string }> = {
  'No Parts Required': { color: '#475569', border: '#CBD5E1', bg: '#F8FAFC' },
  'Parts Reserved': { color: '#047857', border: '#A7F3D0', bg: '#ECFDF5' },
  'Parts Ready': { color: '#0369A1', border: '#7DD3FC', bg: '#F0F9FF' },
  'Requested Missing Parts': { color: '#B91C1C', border: '#FCA5A5', bg: '#FEF2F2' },
};
const laneHelpText: Record<LaneKey, string> = {
  requests: 'Maintenance Requests submitted and waiting for review, validation, or rejection.',
  planning: 'Approved requests being evaluated, scoped, prioritized, and prepared before scheduling.',
  scheduled: 'Work Orders planned with assigned owner, date, resources, and required spare parts.',
  progress: 'Work Orders currently being executed by a technician, operator, or assigned group.',
  review: 'Work Orders with execution finished, waiting for review, completion details, or closure validation.',
  closed: 'Finalized items with no further action required. May include completed or rejected.',
};
const defaultExecutionDrawerSectionsExpanded: Record<ExecutionDrawerSectionKey, boolean> = {
  assignment: false,
  spareParts: false,
  safety: false,
  quality: false,
  linkedWorkOrders: false,
  attachments: false,
  tasklist: false,
  logHistory: false,
};
const maintenanceFollowUpAttachmentSrc = '/images/equi_screw.png';
const schedulingOptimizationAttachmentSrc = '/images/OEE Equipament.png';
const assignmentWeekDays: AssignmentScheduledDay[] = [
  { key: 'mon', shortLabel: 'Mon', dayNumber: '15', fullLabel: 'Mon Feb 15', ctaLabel: 'Mon 15', isoDate: '2027-02-15' },
  { key: 'tue', shortLabel: 'Tue', dayNumber: '16', fullLabel: 'Tue Feb 16', ctaLabel: 'Tue 16', isoDate: '2027-02-16' },
  { key: 'wed', shortLabel: 'Wed', dayNumber: '17', fullLabel: 'Wed Feb 17', ctaLabel: 'Wed 17', isoDate: '2027-02-17' },
  { key: 'thu', shortLabel: 'Thu', dayNumber: '18', fullLabel: 'Thu Feb 18', ctaLabel: 'Thu 18', isoDate: '2027-02-18' },
  { key: 'fri', shortLabel: 'Fri', dayNumber: '19', fullLabel: 'Fri Feb 19', ctaLabel: 'Fri 19', isoDate: '2027-02-19' },
  { key: 'sat', shortLabel: 'Sat', dayNumber: '20', fullLabel: 'Sat Feb 20', ctaLabel: 'Sat 20', isoDate: '2027-02-20' },
  { key: 'sun', shortLabel: 'Sun', dayNumber: '21', fullLabel: 'Sun Feb 21', ctaLabel: 'Sun 21', isoDate: '2027-02-21' },
];
const assignmentWorkloadRank: Record<AssignmentWorkloadLevel, number> = {
  Low: 1,
  Medium: 2,
  High: 3,
  Full: 4,
  Off: 5,
};
const assignmentWorkloadTone: Record<AssignmentWorkloadLevel, { bg: string; border: string; color: string }> = {
  Low: { bg: '#ECFDF5', border: '#A7F3D0', color: '#047857' },
  Medium: { bg: '#EFF6FF', border: '#BFDBFE', color: '#1D4ED8' },
  High: { bg: '#FFF7ED', border: '#FED7AA', color: '#C2410C' },
  Full: { bg: '#FEE2E2', border: '#FCA5A5', color: '#B91C1C' },
  Off: { bg: '#F1F5F9', border: '#CBD5E1', color: '#64748B' },
};
const assignmentWorkloadDefaultCount: Record<AssignmentWorkloadLevel, number> = {
  Low: 1,
  Medium: 3,
  High: 4,
  Full: 5,
  Off: 0,
};
const assignmentWorkOrderTypes = ['Preventive', 'Corrective', 'Breakdown', 'Inspection', 'Lubrication'] as const;
const getAssignmentWorkloadCount = (workload: AssignmentDayWorkload) => workload.workOrders.length;
const getAssignmentWorkloadLabel = (workload: AssignmentDayWorkload) => {
  const workOrderCount = getAssignmentWorkloadCount(workload);
  return workOrderCount ? `${workOrderCount} WO` : 'Off';
};
const getAssignmentWorkloadTooltip = (workload: AssignmentDayWorkload) => {
  if (!workload.workOrders.length) return workload.summary;
  return workload.workOrders.map((workOrder) => `${workOrder.id} - ${workOrder.type}`).join('\n');
};
const assignmentWorkload = (level: AssignmentWorkloadLevel, summary: string): AssignmentDayWorkload => {
  const summaryCount = summary.match(/\d+/)?.[0];
  const workOrderCount = summaryCount ? Number(summaryCount) : assignmentWorkloadDefaultCount[level];

  return {
    level,
    summary,
    workOrders: Array.from({ length: workOrderCount }, (_, index) => ({
      id: `WO ${606034600 + workOrderCount * 10 + index}`,
      type: assignmentWorkOrderTypes[index % assignmentWorkOrderTypes.length],
    })),
  };
};
const assignmentPeopleOptions: AssignmentPerson[] = [
  {
    id: 'bruno-aquino',
    name: 'Bruno Aquino',
    role: 'Technician',
    context: 'Mechanical',
    workload: '2 WO today',
    weeklyLoad: '6 WO this week',
    priorityMix: '1 High, 3 Medium',
    shift: 'Day shift',
    recommended: true,
    recommendedDayKey: 'mon',
    recommendationReason: 'assigned to the scheduled WO and available for the execution window',
    weeklyWorkload: {
      mon: assignmentWorkload('Medium', '2 WO already assigned that day'),
      tue: assignmentWorkload('Low', '1 WO already assigned that day'),
      wed: assignmentWorkload('Medium', '3 WO already assigned that day'),
      thu: assignmentWorkload('High', 'Heavy workload that day'),
      fri: assignmentWorkload('Medium', '3 WO already assigned that day'),
      sat: assignmentWorkload('Off', 'Off shift that day'),
      sun: assignmentWorkload('Off', 'Off shift that day'),
    },
  },
  {
    id: 'bruno-arruda',
    name: 'Bruno Arruda',
    role: 'Technician',
    context: 'Mechanical',
    workload: '2 WO today',
    weeklyLoad: '5 WO this week',
    priorityMix: '1 High, 2 Medium',
    shift: 'Day shift',
    recommended: true,
    recommendedDayKey: 'tue',
    recommendationReason: 'lowest workload tomorrow and matching mechanical skill',
    weeklyWorkload: {
      mon: assignmentWorkload('Low', '2 WO already assigned that day'),
      tue: assignmentWorkload('Low', '1 WO already assigned that day'),
      wed: assignmentWorkload('High', 'Heavy workload that day'),
      thu: assignmentWorkload('Full', 'Full workload that day'),
      fri: assignmentWorkload('Medium', '3 WO already assigned that day'),
      sat: assignmentWorkload('Off', 'Off shift that day'),
      sun: assignmentWorkload('Off', 'Off shift that day'),
    },
  },
  {
    id: 'maria-silva',
    name: 'Maria Silva',
    role: 'Operator',
    context: 'Zone 2 - Line A',
    workload: '1 AM task today',
    weeklyLoad: '3 tasks this week',
    priorityMix: '2 Medium',
    shift: 'Day shift',
    recommended: true,
    recommendedDayKey: 'mon',
    recommendationReason: 'assigned to this zone and available today',
    weeklyWorkload: {
      mon: assignmentWorkload('Low', '1 AM task already assigned that day'),
      tue: assignmentWorkload('Off', 'Off shift that day'),
      wed: assignmentWorkload('Medium', '2 tasks already assigned that day'),
      thu: assignmentWorkload('Medium', '2 tasks already assigned that day'),
      fri: assignmentWorkload('Low', '1 task already assigned that day'),
      sat: assignmentWorkload('Off', 'Off shift that day'),
      sun: assignmentWorkload('Off', 'Off shift that day'),
    },
  },
  {
    id: 'daniel-ortega',
    name: 'Daniel Ortega',
    role: 'Technician',
    context: 'Electrical',
    workload: '3 WO today',
    weeklyLoad: '7 WO this week',
    priorityMix: '1 High, 3 Medium',
    shift: 'Day shift',
    weeklyWorkload: {
      mon: assignmentWorkload('Medium', '3 WO already assigned that day'),
      tue: assignmentWorkload('Low', '2 WO already assigned that day'),
      wed: assignmentWorkload('Medium', '3 WO already assigned that day'),
      thu: assignmentWorkload('High', 'Heavy workload that day'),
      fri: assignmentWorkload('Medium', '3 WO already assigned that day'),
      sat: assignmentWorkload('Low', '1 WO already assigned that day'),
      sun: assignmentWorkload('Off', 'Off shift that day'),
    },
  },
  {
    id: 'kadin-workman',
    name: 'Kadin Workman',
    role: 'Technician',
    context: 'Mechanical',
    workload: 'Heavy workload today',
    weeklyLoad: '9 WO this week',
    priorityMix: '2 High, 4 Medium',
    shift: 'Night shift',
    weeklyWorkload: {
      mon: assignmentWorkload('High', 'Heavy workload that day'),
      tue: assignmentWorkload('Full', 'Full workload that day'),
      wed: assignmentWorkload('High', 'Heavy workload that day'),
      thu: assignmentWorkload('Medium', '2 WO already assigned that day'),
      fri: assignmentWorkload('High', 'Heavy workload that day'),
      sat: assignmentWorkload('Medium', '2 WO already assigned that day'),
      sun: assignmentWorkload('Low', '1 WO already assigned that day'),
    },
  },
  {
    id: 'emerson-stanton',
    name: 'Emerson Stanton',
    role: 'Operator',
    context: 'Zone 1 - Line B',
    workload: 'Lowest workload tomorrow',
    weeklyLoad: '2 tasks this week',
    priorityMix: '1 Medium',
    shift: 'Night shift',
    weeklyWorkload: {
      mon: assignmentWorkload('Off', 'Night shift only'),
      tue: assignmentWorkload('Medium', '2 tasks already assigned that day'),
      wed: assignmentWorkload('Low', '1 task already assigned that day'),
      thu: assignmentWorkload('Low', '1 task already assigned that day'),
      fri: assignmentWorkload('Low', 'Lowest workload that day'),
      sat: assignmentWorkload('Low', '1 task already assigned that day'),
      sun: assignmentWorkload('Medium', '2 tasks already assigned that day'),
    },
  },
];
const sparePartOptions: SparePartOption[] = [
  {
    id: 'sap-seal-hyd-01',
    code: 'PRT-SEAL-HYD-01',
    description: 'Hydraulic Cylinder Seal Kit',
    location: 'TC1-M3-G2',
    availableQuantity: 10,
    defaultRequestedQuantity: 3,
  },
  {
    id: 'sap-oring-vit-02',
    code: 'PRT-ORING-VIT-02',
    description: '10-Ring Set (Viton)',
    location: 'TC1-M3-G2',
    availableQuantity: 10,
    defaultRequestedQuantity: 1,
  },
  {
    id: 'sap-hyd-fluid-01',
    code: 'PRT-HYD-FLUID-01',
    description: '2Hydraulic Fluid (1L)',
    location: 'TC1-M3-G2',
    availableQuantity: 10,
    defaultRequestedQuantity: 1,
  },
  {
    id: 'sap-filter-hyd-03',
    code: 'PRT-FILTER-HYD-03',
    description: 'Hydraulic Return Filter',
    location: 'TC1-M2-B4',
    availableQuantity: 6,
    defaultRequestedQuantity: 2,
  },
  {
    id: 'sap-grip-vac-00',
    code: 'PRT-GRIP-VAC-00',
    description: 'Robot Gripper Vacuum Cup Set',
    location: 'TC1-M4-C2',
    availableQuantity: 0,
    defaultRequestedQuantity: 1,
  },
];

const pauseContextByWorkOrderId: Record<string, WorkOrderPauseContext> = {
  'ip-2': {
    reason: 'Waiting for Parts',
    pausedBy: 'Bruno Aquino',
    pausedSince: '2h ago',
    expectedResume: 'Tomorrow, 08:00',
    notes: 'Awaiting seal kit replacement from tool crib.',
    escalation: 'Tool crib follow-up required',
  },
};

const linkedWorkCandidates: MaintenanceLinkedWorkCandidate[] = [
  {
    id: 'pm-458732',
    type: 'Preventive',
    title: 'PM 458732 - Syringe Assembly monthly service',
    description: 'Monthly service planned to inspect the syringe assembly, replace worn seals, and verify dispensing accuracy.',
    scheduledFor: 'Wed May 27',
    assignee: 'Daniel Ortega',
    status: 'Scheduled',
  },
  {
    id: 'wo-606034592',
    type: 'Corrective',
    title: 'WO 606034592 - Hydraulic leak inspection',
    description: 'Hydraulic oil observed near the actuator guard after cycle start; inspection requested before continued operation.',
    scheduledFor: 'Thu May 28',
    assignee: 'Bruno Aquino',
    status: 'Planning',
  },
  {
    id: 'wo-606034611',
    type: 'Preventive',
    title: 'WO 606034611 - Line A shutdown window',
    description: 'Planned shutdown window to inspect Line A drive components, clean guarded areas, and complete preventive checks.',
    scheduledFor: 'Fri May 29',
    assignee: 'Ronie D\'elano',
    status: 'Scheduled',
  },
];

const preventiveTasklistCardIds = ['std-5'];
const preventiveWorkOrderTasklist = [
  { id: 'pm-task-1', title: 'Review PM procedure and confirm equipment isolation points', completed: false },
  { id: 'pm-task-2', title: 'Lubricate syringe guide rails and inspect seal wear', completed: false },
  { id: 'pm-task-3', title: 'Run sample test and record dispensing accuracy result', completed: false },
  { id: 'pm-task-4', title: 'Confirm guards are reinstalled before handover', completed: false },
];

const scheduledWorkOrderSparePartIds = ['sap-seal-hyd-01', 'sap-oring-vit-02', 'sap-hyd-fluid-01'] as const;
const scheduledWorkOrderSparePartQuantities: Record<typeof scheduledWorkOrderSparePartIds[number], number> = {
  'sap-seal-hyd-01': 2,
  'sap-oring-vit-02': 1,
  'sap-hyd-fluid-01': 1,
};
const scheduledWorkOrderSafetyPlan: WorkOrderSafetyRequirementPlan = {
  equipmentCondition: 'Stopped / Internal',
  lotoRequired: true,
  lockoutPoint: 'Main disconnect panel',
  procedure: 'LOTO-MECH-014',
  selectedRequirementIds: ['safety-glasses', 'cut-gloves', 'electrical', 'pinch-point'],
  safetyNotes: 'Isolate hydraulic power and verify zero pressure before removing the cylinder guard.',
};
const scheduledWorkOrderQualityPlan: WorkOrderQualityRequirementPlan = {
  qualityImpacting: true,
  selectedRequirementIds: ['visual-inspection', 'measurement-verification', 'photo'],
  qualityNotes: 'Capture post-repair inspection evidence and verify no leak after restart.',
};
const scheduledWorkOrderDay: AssignmentScheduledDay = {
  key: 'mon',
  shortLabel: 'Mon',
  dayNumber: '13',
  fullLabel: 'Jan 13',
  ctaLabel: 'Jan 13',
  isoDate: '2026-01-13',
};

function getAssigneeInitials(name: string) {
  if (name === '-' || !name.trim()) return '';
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function getAvatarSx(name: string) {
  if (name === 'BLU.AI') return { bgcolor: '#044ED7', color: '#ffffff' };
  if (name === 'Julia Roberts') return { bgcolor: '#F97316', color: '#ffffff' };
  if (name.includes('Ron')) return { bgcolor: '#FACC15', color: '#1F2937' };
  return { bgcolor: '#3B82F6', color: '#ffffff' };
}

function isBoardDragBlocked(target: EventTarget | null, boardElement: HTMLElement) {
  if (!(target instanceof HTMLElement)) return true;

  const interactiveTarget = target.closest(
    'button, a, input, textarea, select, [role="button"], [data-board-drag-ignore="true"], .MuiButtonBase-root'
  );

  return Boolean(interactiveTarget && boardElement.contains(interactiveTarget));
}

function getPriorityDisplayLabel(priority: string) {
  return priority in prioritySlaDefinitions
    ? prioritySlaDefinitions[priority as MaintenancePriority].label
    : priority;
}

function parseMockDate(value?: string) {
  if (!value) return null;

  const match = value.match(/^(\d{4})\/(\d{2})\/(\d{2})(?:\s+-\s+(\d{1,2}):(\d{2})(?:\s*(AM|PM))?)?$/i);
  if (!match) return null;

  const [, year, month, day, rawHour = '12', rawMinute = '00', period] = match;
  let hour = Number(rawHour);
  if (period?.toUpperCase() === 'PM' && hour < 12) hour += 12;
  if (period?.toUpperCase() === 'AM' && hour === 12) hour = 0;

  return new Date(Number(year), Number(month) - 1, Number(day), hour, Number(rawMinute));
}

function formatPriorityDueDate(date: Date) {
  const hasTime = date.getHours() !== 12 || date.getMinutes() !== 0;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    ...(hasTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  });
}

function getCardCreatedAt(card: MaintenanceCard, laneKey?: LaneKey) {
  return parseMockDate(maintenanceRequestCreatedAtByCard[card.id])
    ?? parseMockDate(laneKey ? laneCreatedAtFallbacks[laneKey] : undefined)
    ?? parseMockDate(laneCreatedAtFallbacks.requests);
}

function getPriorityDueDateLabel(card: MaintenanceCard, laneKey?: LaneKey) {
  const priorityDefinition = prioritySlaDefinitions[card.priority];
  if (!priorityDefinition.dueOffsetHours) return 'ASAP';

  const createdAt = getCardCreatedAt(card, laneKey);
  if (!createdAt) return card.due || 'Due date pending';

  const dueDate = new Date(createdAt);
  dueDate.setHours(dueDate.getHours() + priorityDefinition.dueOffsetHours);
  return formatPriorityDueDate(dueDate);
}

function PriorityMenuItems() {
  return (
    <>
      {severityLevels.map((priority) => (
        <MenuItem key={priority} value={priority}>
          {prioritySlaDefinitions[priority].label}
        </MenuItem>
      ))}
    </>
  );
}

function buildMaintenanceListRows(laneDefinitions: LaneDefinition[]): MaintenanceListRow[] {
  const rowsByLane = laneDefinitions.flatMap((lane, laneIndex) =>
    lane.cards.map((card, cardIndex) => buildMaintenanceListRow(card, lane.key, lane.title, laneIndex * 10 + cardIndex))
  );

  return rowsByLane.sort((a, b) => a.order - b.order);
}

function buildMaintenanceListRow(card: MaintenanceCard, laneKey: LaneKey, laneTitle: string, order: number): MaintenanceListRow {
  const isRequest = card.id.startsWith('mr-');
  const source = isRequest ? 'MR' : 'WO';
  const statusByLane: Record<LaneKey, { label: string; tone: MaintenanceListStatusTone }> = {
    requests: { label: 'MAINTENANCE REQUEST', tone: 'neutral' },
    planning: { label: 'PLANNING', tone: 'sky' },
    scheduled: { label: 'SCHEDULED', tone: 'blue' },
    progress: { label: 'IN PROGRESS', tone: 'blue' },
    review: { label: 'DONE', tone: 'green' },
    closed: { label: 'CLOSED', tone: 'gray' },
  };
  const rowStatus = statusByLane[laneKey];
  const typeByCard: Record<MaintenancePriority, string> = {
    Emergency: 'Breakdown',
    Immediate: 'Corrective',
    High: 'Corrective',
    Medium: 'Preventtive',
    Low: 'Corrective',
    'Very Low': 'Corrective',
  };
  const createdAt = maintenanceRequestCreatedAtByCard[card.id] ?? laneCreatedAtFallbacks[laneKey];

  return {
    card,
    laneKey,
    order,
    source,
    requestId: `${source} 606034603`,
    location: 'Z2',
    type: card.priority === 'Medium' ? 'Preventtive' : typeByCard[card.priority],
    reporter: card.assignee === 'Afoson Davi' ? "Ronie D'elano" : card.assignee,
    createdAt,
    status: card.rejection ? 'REJECTED' : rowStatus.label,
    statusTone: rowStatus.tone,
    assignee: laneKey === 'planning' ? "Ronie D'elano" : laneKey === 'scheduled' || laneKey === 'progress' ? card.assignee : '-',
    executionIn: laneKey === 'planning' || laneKey === 'scheduled' || laneKey === 'progress' || laneKey === 'review' || laneKey === 'closed' ? createdAt : '-',
    accent: listPriorityAccents[card.priority],
    highlighted: card.priority === 'Emergency',
  };
}

const boardCardGradeById: Record<string, 'A' | 'B' | 'C'> = {
  'mr-1': 'A',
  'mr-2': 'A',
  'mr-3': 'C',
  'mr-4': 'C',
  'mr-5': 'B',
  'mr-6': 'C',
  'mr-7': 'C',
  'ap-1': 'C',
  'ap-2': 'B',
  'sch-1': 'A',
  'sch-2': 'B',
  'sch-3': 'A',
  'sch-4': 'C',
  'sch-5': 'B',
  'std-1': 'A',
  'std-2': 'B',
  'std-3': 'B',
  'std-4': 'A',
  'std-5': 'B',
  'ip-1': 'A',
  'ip-2': 'C',
};

const boardCardHierarchyIdsById: Record<string, string[]> = {
  'mr-1': ['plant-a', 'unit-b', 'line-10', 'SA-204', 'SA-204-BEARING'],
  'mr-2': ['plant-a', 'unit-b', 'line-10', 'PC-09', 'PC-09-BELT'],
  'mr-3': ['plant-a', 'unit-b', 'line-10', 'VI-210'],
  'mr-4': ['plant-a', 'unit-b', 'line-20', 'CT-32', 'CT-32-TUCKER'],
  'mr-5': ['plant-a', 'unit-b', 'line-10', 'SA-204', 'SA-204-SERVO'],
  'mr-6': ['plant-a', 'unit-b', 'line-20', 'PC-09', 'PC-09-SENSOR'],
  'mr-7': ['plant-a', 'unit-b', 'line-10', 'SA-204'],
  'ap-1': ['plant-a', 'unit-b', 'line-10', 'SA-204', 'SA-204-FILL'],
  'ap-2': ['plant-a', 'unit-b', 'line-10', 'LM-88', 'LM-88-APPLICATOR'],
  'rv-1': ['plant-a', 'unit-b', 'line-10', 'LM-88', 'LM-88-APPLICATOR'],
  'rv-2': ['plant-a', 'unit-b', 'line-20', 'CT-32'],
  'cl-1': ['plant-a', 'unit-b', 'line-10', 'VI-210', 'VI-210-CAMERA'],
  'cl-2': ['plant-a', 'unit-b', 'line-20', 'PC-09', 'PC-09-BELT'],
  'sch-1': ['plant-a', 'unit-b', 'line-20', 'CT-32'],
  'sch-2': ['plant-a', 'unit-b', 'line-20', 'RJ-11', 'RJ-11-DIVERTER'],
  'sch-3': ['plant-a', 'unit-b', 'line-10', 'DP-14', 'DP-14-SEAL'],
  'sch-4': ['plant-a', 'unit-b', 'line-10', 'VI-210', 'VI-210-CAMERA'],
  'sch-5': ['plant-a', 'unit-b', 'line-20', 'PC-09', 'PC-09-SENSOR'],
  'std-1': ['plant-a', 'unit-b', 'line-20', 'CT-32', 'CT-32-FEED'],
  'std-2': ['plant-a', 'unit-b', 'line-20', 'PC-09'],
  'std-3': ['plant-a', 'unit-b', 'line-10', 'DP-14', 'DP-14-SEAL'],
  'std-4': ['plant-a', 'unit-b', 'line-20', 'PB-02', 'PB-02-ROLLER'],
  'std-5': ['plant-a', 'unit-b', 'line-10', 'SA-204', 'SA-204-SYRINGE'],
  'ip-1': ['plant-a', 'unit-b', 'line-20', 'CT-32'],
  'ip-2': ['plant-a', 'unit-b', 'line-10', 'SA-204', 'SA-204-FILL'],
};

function getEquipmentSelectionCriticality(selection: EquipmentSelection): 'A' | 'B' | 'C' | undefined {
  const entries = Object.entries(boardCardHierarchyIdsById);
  const exactMatch = entries.find(([, hierarchyIds]) => hierarchyIds[hierarchyIds.length - 1] === selection.id);
  const ancestorMatch = entries.find(([, hierarchyIds]) => hierarchyIds.includes(selection.id));
  const matchedCardId = exactMatch?.[0] ?? ancestorMatch?.[0];

  return matchedCardId ? boardCardGradeById[matchedCardId] : undefined;
}

function toggleFilterOption<T>(options: T[], option: T) {
  return options.includes(option) ? options.filter((item) => item !== option) : [...options, option];
}

function hasFollowUpBoardFilters(filters: FollowUpBoardFilters) {
  return Boolean(
    filters.statuses.length ||
      filters.tags.length ||
      filters.types.length ||
      filters.priorities.length ||
      filters.assetHierarchy ||
      filters.criticalities.length ||
      filters.assignedTo.length ||
      filters.assignedToSearch.trim() ||
      filters.dates.length
  );
}

function getFollowUpBoardFilterCount(filters: FollowUpBoardFilters) {
  return (
    filters.statuses.length +
    filters.tags.length +
    filters.types.length +
    filters.priorities.length +
    (filters.assetHierarchy ? 1 : 0) +
    filters.criticalities.length +
    filters.assignedTo.length +
    (filters.assignedToSearch.trim() ? 1 : 0) +
    filters.dates.length
  );
}

function getBoardCardMeta(card: MaintenanceCard) {
  const isRequest = card.id.startsWith('mr-');
  const source = isRequest ? 'MR' : 'WO';
  const isPreventiveWorkOrder = card.id === 'std-5' || card.id === 'std-3';

  return {
    accent: listPriorityAccents[card.priority],
    grade: card.equipmentCriticality ?? boardCardGradeById[card.id] ?? 'A',
    highlighted: card.id === 'mr-2',
    location: card.id === 'mr-8' ? 'Molding' : card.id === 'ap-1' ? 'Z1' : 'Z2',
    requestId: `${source} 606034603`,
    type: isPreventiveWorkOrder ? 'Preventive' : card.id === 'mr-2' ? 'Breakdown' : 'Corrective',
  };
}

function getMaintenanceContextualizationFromCard(
  card: MaintenanceCard,
  kind: MaintenanceContextualizationKind,
  laneKey?: LaneKey,
  laneTitle?: string
): MaintenanceContextualization {
  const cardMeta = getBoardCardMeta(card);
  const details = getMaintenanceRequestDetails(card);
  const isRequest = card.id.startsWith('mr-') && kind !== 'wo';
  const mrNumber = details.requestId.startsWith('MR') ? details.requestId : `MR 606034603`;
  const woNumber = cardMeta.requestId.startsWith('WO') ? cardMeta.requestId : `WO 606034603`;
  const contextId = kind === 'mr' || isRequest ? mrNumber : kind === 'wo' ? woNumber : `${card.title.replace(/\s+/g, '-').toUpperCase()}-${cardMeta.location}`;
  const title = kind === 'mr' ? mrNumber : kind === 'wo' ? woNumber : details.equipment;
  const openedAt = laneKey === 'requests'
    ? maintenanceRequestCreatedAtByCard[card.id] ?? laneCreatedAtFallbacks.requests
    : getPriorityDueDateLabel(card, laneKey);

  return {
    kind,
    title,
    contextId,
    location: details.location,
    equipment: details.equipment,
    user: card.assignee,
    mrNumber,
    woNumber,
    openedAt,
    summary: `${card.detail} ${cardMeta.type} follow-up is currently in ${laneTitle ?? getFollowUpCardStatus(card, laneKey ?? 'requests')}.`,
    recommendation: kind === 'mr'
        ? `${mrNumber} should stay linked to the current asset and any matching WO before planning continues.`
        : kind === 'wo'
          ? `${woNumber} has related asset, owner, MR, parts, and execution context available for review.`
          : `${details.equipment} has active MR/WO context on this board. Review related work before creating duplicate interventions.`,
    counts: maintenanceContextCounts,
    actions: [
      `Open ${woNumber}`,
      `Open ${mrNumber}`,
      `Review ${details.equipment}`,
    ],
  };
}

function getFollowUpCardStatus(card: MaintenanceCard, laneKey: LaneKey, laneTitle?: string): FollowUpStatus {
  if (laneKey === 'requests') return 'Requested';
  if (laneKey === 'planning') return 'Planning';
  if (laneKey === 'scheduled') return 'Scheduled';
  if (laneKey === 'progress') return 'In Progress';
  if (laneKey === 'review') return 'Done';
  return 'Closed';
}

function getFollowUpCardTags(card: MaintenanceCard): FollowUpTag[] {
  return [
    ...(card.tags ?? []),
    ...(isPausedWorkOrder(card) ? ['Paused' as const] : []),
    ...(card.rejection ? ['Rejected' as const] : []),
  ];
}

function getFollowUpCardTypes(card: MaintenanceCard, laneKey: LaneKey): FollowUpType[] {
  const types = new Set<FollowUpType>();
  const cardType = getBoardCardMeta(card).type;

  if (laneKey === 'requests') {
    types.add('Maintenance Request');
  }

  if (cardType === 'Breakdown') types.add('Breakdown');
  if (card.priority === 'Medium') types.add('Preventive');
  if (cardType === 'Corrective' || card.priority === 'Immediate' || card.priority === 'High' || card.priority === 'Low' || card.priority === 'Very Low') types.add('Corrective');

  return [...types];
}

function getFollowUpAssignedToOptions(card: MaintenanceCard): FollowUpAssignedTo[] {
  if (!card.assignee || card.assignee === '-') return ['Unassigned'];

  return card.assignee === 'Bruno Aquino' ? ['Assigned to me'] : [];
}

function getFollowUpDateWindows(card: MaintenanceCard, laneKey: LaneKey, laneTitle?: string): FollowUpDateOption[] {
  const dueIsCurrentMockDay = card.due.includes('Jan 13');
  const isScheduledToday = (laneKey === 'scheduled' || laneKey === 'progress' || laneKey === 'review') && dueIsCurrentMockDay;
  const isScheduledThisWeek = laneKey === 'scheduled' || laneKey === 'progress' || laneKey === 'review';
  const isDueThisWeek = laneKey !== 'requests';
  const isRequestedToday = laneKey === 'requests' && dueIsCurrentMockDay;
  const isOverdue = card.priority === 'Emergency' || card.id === 'mr-2';

  return [
    ...(isOverdue ? ['Overdue' as const] : []),
    ...(isScheduledToday ? ['Scheduled Today' as const] : []),
    ...(isScheduledThisWeek ? ['Scheduled This Week' as const] : []),
    ...(isDueThisWeek ? ['Due This Week' as const] : []),
    ...(isRequestedToday ? ['Requested Today' as const] : []),
    'Custom Range',
  ];
}

function matchesFollowUpBoardFilters(
  card: MaintenanceCard,
  laneKey: LaneKey,
  laneTitle: string | undefined,
  filters: FollowUpBoardFilters
) {
  if (!hasFollowUpBoardFilters(filters)) return true;

  const status = getFollowUpCardStatus(card, laneKey, laneTitle);
  if (filters.statuses.length && !filters.statuses.includes(status)) return false;

  const tags = getFollowUpCardTags(card);
  if (filters.tags.length && !filters.tags.some((tag) => tags.includes(tag))) return false;

  const types = getFollowUpCardTypes(card, laneKey);
  if (filters.types.length && !filters.types.some((type) => types.includes(type))) return false;

  if (filters.priorities.length && !filters.priorities.includes(card.priority)) return false;

  const criticality = card.equipmentCriticality ?? boardCardGradeById[card.id] ?? 'A';
  if (filters.criticalities.length && !filters.criticalities.includes(criticality)) return false;

  const assignedOptions = getFollowUpAssignedToOptions(card);
  if (filters.assignedTo.length && !filters.assignedTo.some((option) => assignedOptions.includes(option))) return false;

  const assignedToSearch = filters.assignedToSearch.trim().toLowerCase();
  if (assignedToSearch && !card.assignee.toLowerCase().includes(assignedToSearch)) return false;

  const hierarchyIds = boardCardHierarchyIdsById[card.id] ?? [];
  if (filters.assetHierarchy && !hierarchyIds.includes(filters.assetHierarchy.id)) return false;

  const dateWindows = getFollowUpDateWindows(card, laneKey, laneTitle);
  return !filters.dates.length || filters.dates.some((option) => dateWindows.includes(option));
}

function isPausedWorkOrder(card: MaintenanceCard) {
  return card.executionState === 'paused';
}

function getRiskAssessmentTone(value?: string): BoardBadgeTone {
  if (value === 'High' || value === 'Emergency' || value === 'Immediate') return 'red';
  if (value === 'Medium') return 'orange';
  if (value === 'Low') return 'green';
  return 'neutral';
}

function getEquipmentCriticalityTone(criticality?: string): BoardBadgeTone {
  if (criticality === 'A') return 'red';
  if (criticality === 'B') return 'orange';
  if (criticality === 'C') return 'green';
  return 'neutral';
}

function normalizeWorkOrderActivityType(activityType?: string) {
  return workOrderActivityTypeOptions.includes(activityType as typeof workOrderActivityTypeOptions[number])
    ? activityType ?? ''
    : activityType
      ? 'Other'
      : '';
}

function getCardRiskAssessment(card: MaintenanceCard) {
  return {
    downtime: card.priority === 'Emergency' ? 'High' : 'Low',
    quality: card.priority === 'Emergency' ? 'High' : 'Medium',
    ehs: card.priority === 'Low' || card.priority === 'Very Low' ? 'Low' : 'Medium',
  };
}

function BoardCardBadge({ label, tone = 'neutral' }: { label: string; tone?: BoardBadgeTone }) {
  const colors = {
    neutral: { color: '#6A6D70', border: '#D7DBDF', bg: activeTheme.backgroundPaper },
    red: { color: '#DC2626', border: '#FCA5A5', bg: '#FEF2F2' },
    green: { color: '#16A34A', border: '#BBF7D0', bg: '#F0FDF4' },
    orange: { color: '#D97706', border: '#FDE68A', bg: '#FFFBEB' },
  }[tone];

  return (
    <Box
      component="span"
      sx={{
        minWidth: 18,
        height: 18,
        px: 0.35,
        borderRadius: 0.8,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bg,
        color: colors.color,
        fontSize: '0.68rem',
        lineHeight: '17px',
        fontWeight: 900,
        textAlign: 'center',
      }}
    >
      {label}
    </Box>
  );
}

function PausedStatusBadge() {
  return (
    <Box
      component="span"
      sx={{
        height: 20,
        px: 0.55,
        borderRadius: 0.8,
        border: '1px solid #F59E0B',
        bgcolor: '#FFFBEB',
        color: '#92400E',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.25,
        fontSize: '0.62rem',
        fontWeight: 950,
        lineHeight: 1,
        letterSpacing: 0,
      }}
    >
      <PauseCircleIcon sx={{ fontSize: 13 }} />
      PAUSED
    </Box>
  );
}

function RejectedStatusBadge() {
  return (
    <Box
      component="span"
      sx={{
        height: 20,
        px: 0.65,
        borderRadius: 999,
        border: '1px solid #FCA5A5',
        bgcolor: '#FEF2F2',
        color: '#B91C1C',
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '0.62rem',
        fontWeight: 950,
        lineHeight: 1,
        letterSpacing: 0,
      }}
    >
      Rejected
    </Box>
  );
}

function isSparePartsStatusTag(label: string): label is SparePartsStatusTag {
  return label in sparePartsStatusTagStyles;
}

function BoardCardTag({ label, variant = 'default' }: { label: string; variant?: 'default' | 'sparePartsStatus' }) {
  const sparePartsStatusColors = variant === 'sparePartsStatus' && isSparePartsStatusTag(label)
    ? sparePartsStatusTagStyles[label]
    : null;
  const colors = sparePartsStatusColors ?? { color: '#0B63E5', border: '#93C5FD', bg: '#EFF6FF' };

  return (
    <Box
      component="span"
      sx={{
        height: 18,
        px: 0.55,
        borderRadius: 0.8,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bg,
        color: colors.color,
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '0.62rem',
        fontWeight: 950,
        lineHeight: 1,
        letterSpacing: 0,
      }}
    >
      {label}
    </Box>
  );
}

function ContextualizationTextLink({
  children,
  onClick,
  color = '#0B63E5',
  fontSize,
  fontWeight = 800,
  noWrap = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  color?: string;
  fontSize?: string | number;
  fontWeight?: number;
  noWrap?: boolean;
}) {
  return (
    <Typography
      component="button"
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      noWrap={noWrap}
      sx={{
        p: 0,
        border: 0,
        bgcolor: 'transparent',
        color,
        font: 'inherit',
        fontSize,
        fontWeight,
        lineHeight: 'inherit',
        textAlign: 'left',
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        cursor: 'pointer',
        minWidth: 0,
        overflow: noWrap ? 'hidden' : undefined,
        textOverflow: noWrap ? 'ellipsis' : undefined,
        whiteSpace: noWrap ? 'nowrap' : undefined,
        '&:hover': { color: '#044ED7' },
        '&:focus-visible': {
          outline: '2px solid #93C5FD',
          outlineOffset: 2,
          borderRadius: 0.5,
        },
      }}
    >
      {children}
    </Typography>
  );
}

function BoardCardMetaItem({ icon, text, onClick }: { icon: ReactNode; text: string; onClick?: () => void }) {
  return (
    <Box sx={{ minWidth: 0, display: 'inline-flex', alignItems: 'center', gap: 0.25, color: '#6C7072' }}>
      {icon}
      {onClick ? (
        <ContextualizationTextLink onClick={onClick} color="#4B5563" fontSize="0.7rem" fontWeight={800} noWrap>
          {text}
        </ContextualizationTextLink>
      ) : (
        <Typography component="span" noWrap sx={{ color: '#6C7072', fontSize: '0.7rem', fontWeight: 700, lineHeight: 1 }}>
          {text}
        </Typography>
      )}
    </Box>
  );
}

function MaintenanceCardItem({
  card,
  laneKey,
  compact = false,
  onClick,
  onOpenContext,
  draggable = false,
  onDragStart,
  onDragEnd,
  onPlanWithAi,
  showPlanWithAi = false,
}: {
  card: MaintenanceCard;
  laneKey?: LaneKey;
  maintenancePriorityStyles: Record<MaintenancePriority, MaintenancePriorityStyle>;
  compact?: boolean;
  onClick?: (card: MaintenanceCard) => void;
  onOpenContext?: (context: MaintenanceContextualization) => void;
  draggable?: boolean;
  onDragStart?: (event: ReactDragEvent<HTMLElement>, card: MaintenanceCard) => void;
  onDragEnd?: () => void;
  onPlanWithAi?: (card: MaintenanceCard) => void;
  showPlanWithAi?: boolean;
}) {
  const cardMeta = getBoardCardMeta(card);
  const isPaused = isPausedWorkOrder(card);
  const isClickable = Boolean(onClick);
  const borderColor = isPaused ? '#D97706' : cardMeta.highlighted ? '#FF3B30' : '#D8DCDD';
  const backgroundColor = isPaused ? '#FFFBEB' : cardMeta.highlighted ? '#FFF0F0' : activeTheme.backgroundPaper;
  const primaryTextColor = isPaused ? '#4B5563' : cardMeta.highlighted ? '#E02020' : '#232628';
  const mutedTextColor = isPaused ? '#78716C' : '#6D7072';
  const riskAssessment = getCardRiskAssessment(card);
  const showsSparePartsStatusTags = laneKey === 'planning' || laneKey === 'scheduled';
  const visibleTags = showsSparePartsStatusTags
    ? card.tags?.filter(isSparePartsStatusTag)
    : card.tags?.filter((tag) => !isSparePartsStatusTag(tag));
  const dueDateLabel = getPriorityDueDateLabel(card, laneKey);

  return (
    <Paper
      elevation={0}
      component="div"
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      draggable={draggable}
      onClick={isClickable ? () => onClick?.(card) : undefined}
      onKeyDown={isClickable ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick?.(card);
        }
      } : undefined}
      onDragStart={draggable ? (event) => onDragStart?.(event, card) : undefined}
      onDragEnd={draggable ? onDragEnd : undefined}
      sx={{
        position: 'relative',
        width: '100%',
        textAlign: 'left',
        minHeight: compact ? 86 : 88,
        px: 1,
        py: 0.75,
        pl: 2.65,
        borderRadius: 1,
        border: isPaused ? `1px dashed ${borderColor}` : `1px solid ${borderColor}`,
        bgcolor: backgroundColor,
        boxShadow: isPaused ? '0 1px 1px rgba(146, 64, 14, 0.08)' : '0 1px 2px rgba(15, 23, 42, 0.16)',
        overflow: 'hidden',
        cursor: draggable ? 'grab' : isClickable ? 'pointer' : 'default',
        font: 'inherit',
        '&:hover': isClickable
          ? {
              borderColor: isPaused ? '#B45309' : cardMeta.highlighted ? '#D91F1F' : '#9DBBFF',
              boxShadow: isPaused ? '0 2px 5px rgba(146, 64, 14, 0.14)' : '0 3px 8px rgba(15, 23, 42, 0.18)',
            }
          : undefined,
        '&:focus-visible': isClickable
          ? {
              outline: '2px solid #1D74FF',
              outlineOffset: 2,
            }
          : undefined,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 9,
          top: 10,
          bottom: 12,
          width: 4,
          borderRadius: 99,
          bgcolor: isPaused ? '#D97706' : cardMeta.accent,
          opacity: isPaused ? 0.85 : 1,
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.8, mb: 0.2, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0 }}>
          <BoardCardBadge label={cardMeta.grade} tone={getEquipmentCriticalityTone(cardMeta.grade)} />
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              fontWeight: 900,
              color: primaryTextColor,
              lineHeight: 1.15,
              fontSize: compact ? '0.83rem' : '0.88rem',
              minWidth: 0,
              textTransform: 'none',
            }}
          >
            <ContextualizationTextLink
              onClick={() => onOpenContext?.(getMaintenanceContextualizationFromCard(card, 'asset', laneKey))}
              color={primaryTextColor}
              fontSize="inherit"
              fontWeight={900}
              noWrap
            >
              {card.title}
            </ContextualizationTextLink>
          </Typography>
        </Box>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35, flexShrink: 0, pt: 0.05 }}>
          {showPlanWithAi && onPlanWithAi ? (
            <Tooltip
              title="Plan with BLU.AI"
              placement="top"
              disableInteractive
              enterDelay={400}
              slotProps={{
                popper: {
                  modifiers: [{ name: 'offset', options: { offset: [0, 8] } }],
                  sx: { pointerEvents: 'none' },
                },
              }}
            >
              <Box
                component="span"
                role="button"
                tabIndex={0}
                aria-label="Plan with BLU.AI"
                data-board-drag-ignore="true"
                onPointerDown={(event) => event.stopPropagation()}
                onMouseDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onPlanWithAi(card);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    event.stopPropagation();
                    onPlanWithAi(card);
                  }
                }}
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  color: activeTheme.primary,
                  bgcolor: '#EAF2FF',
                  border: '1px solid #B6D4FF',
                  transition: 'background-color 120ms ease',
                  '&:hover': { bgcolor: '#DBE9FF' },
                  '&:focus-visible': { outline: '2px solid #1D74FF', outlineOffset: 1 },
                }}
              >
                <SparkleIcon sx={{ fontSize: 13 }} />
              </Box>
            </Tooltip>
          ) : null}
          {isPaused ? <PausedStatusBadge /> : null}
          {card.rejection ? <RejectedStatusBadge /> : null}
          {visibleTags?.map((tag) => (
            <BoardCardTag
              key={tag}
              label={tag}
              variant={showsSparePartsStatusTags ? 'sparePartsStatus' : 'default'}
            />
          ))}
          <BoardCardBadge label="D" tone={getRiskAssessmentTone(riskAssessment.downtime)} />
          <BoardCardBadge label="Q" tone={getRiskAssessmentTone(riskAssessment.quality)} />
          <BoardCardBadge label="E" tone={getRiskAssessmentTone(riskAssessment.ehs)} />
        </Box>
      </Box>

      <Typography
        variant="body2"
        sx={{
          color: mutedTextColor,
          fontSize: compact ? '0.72rem' : '0.76rem',
          fontWeight: 600,
          lineHeight: 1.18,
          mb: 0.35,
          display: '-webkit-box',
          WebkitBoxOrient: 'vertical',
          WebkitLineClamp: 2,
          overflow: 'hidden',
        }}
      >
        {card.detail}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0, mb: 0.45 }}>
        <BoardCardMetaItem
          icon={<LabelIcon sx={{ fontSize: 13 }} />}
          text={cardMeta.requestId}
          onClick={() => onOpenContext?.(getMaintenanceContextualizationFromCard(card, cardMeta.requestId.startsWith('MR') ? 'mr' : 'wo', laneKey))}
        />
        <BoardCardMetaItem icon={<LocationIcon sx={{ fontSize: 13 }} />} text={cardMeta.location} />
        <BoardCardMetaItem icon={<WrenchIcon sx={{ fontSize: 13 }} />} text={cardMeta.type} />
      </Box>

      <Divider sx={{ borderColor: isPaused ? '#FDE68A' : cardMeta.highlighted ? '#F4CACA' : '#E5E7E8', mb: 0.45 }} />

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0 }}>
          <Avatar sx={{ width: 19, height: 19, fontSize: 10, fontWeight: 900, ...getAvatarSx(card.assignee) }}>
            {getAssigneeInitials(card.assignee)}
          </Avatar>
          <Typography noWrap sx={{ color: '#6C7072', fontSize: '0.72rem', fontWeight: 700, lineHeight: 1 }}>
            {card.assignee}
          </Typography>
        </Box>
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.25, color: '#6C7072', flexShrink: 0 }}>
          <CalendarIcon sx={{ fontSize: 12 }} />
          <Typography component="span" noWrap sx={{ color: '#6C7072', fontSize: '0.7rem', fontWeight: 700, lineHeight: 1 }}>
            Due {dueDateLabel}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function ListHeaderCell({ label }: { label: string }) {
  return (
    <Typography variant="caption" sx={{ color: '#626465', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 0.25 }}>
      {label}
      <KeyboardArrowDownIcon sx={{ color: '#9CA3AF', fontSize: 14 }} />
    </Typography>
  );
}

function QualityBadge({ label, tone = 'neutral' }: { label: string; tone?: BoardBadgeTone }) {
  const colors = {
    neutral: { color: '#626465', border: '#D1D5DB', bg: activeTheme.backgroundPaper },
    red: { color: '#DC2626', border: '#FCA5A5', bg: '#FEF2F2' },
    orange: { color: '#D97706', border: '#FDE68A', bg: '#FFFBEB' },
    green: { color: '#16A34A', border: '#BBF7D0', bg: '#F0FDF4' },
  }[tone];

  return (
    <Box
      component="span"
      sx={{
        minWidth: 15,
        height: 16,
        px: 0.25,
        borderRadius: 0.45,
        border: `1px solid ${colors.border}`,
        bgcolor: colors.bg,
        color: colors.color,
        fontSize: '0.62rem',
        lineHeight: '14px',
        fontWeight: 900,
        textAlign: 'center',
      }}
    >
      {label}
    </Box>
  );
}

function PersonCell({ name, muted = false, onClick }: { name: string; muted?: boolean; onClick?: () => void }) {
  if (name === '-') {
    return (
      <Typography variant="body2" sx={{ color: '#626465' }}>
        -
      </Typography>
    );
  }

  return (
    <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.55 }}>
      <Avatar sx={{ width: 24, height: 24, fontSize: 12, fontWeight: 800, ...getAvatarSx(name) }}>{getAssigneeInitials(name)}</Avatar>
      {onClick ? (
        <ContextualizationTextLink onClick={onClick} color={muted ? '#626465' : '#4B4D4F'} fontSize="0.875rem" fontWeight={650} noWrap>
          {name}
        </ContextualizationTextLink>
      ) : (
        <Typography variant="body2" noWrap sx={{ color: muted ? '#626465' : '#4B4D4F', fontWeight: 500 }}>
          {name}
        </Typography>
      )}
    </Box>
  );
}

function IconTextCell({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.35, color: '#626465' }}>
      {icon}
      <Typography variant="body2" noWrap sx={{ color: '#626465' }}>
        {text}
      </Typography>
    </Box>
  );
}

function MaintenanceListView({
  rows,
  focusMode = false,
  onOpenContext,
}: {
  rows: MaintenanceListRow[];
  focusMode?: boolean;
  onOpenContext?: (context: MaintenanceContextualization) => void;
}) {
  return (
    <Box sx={{ height: focusMode ? '100%' : undefined, overflowX: 'auto', overflowY: focusMode ? 'auto' : 'visible', pb: 1 }}>
      <Box sx={{ minWidth: 1420 }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: listGridTemplateColumns,
            alignItems: 'center',
            px: 2,
            pb: 0.65,
          }}
        >
          {['ID', 'Location', 'Type', 'Reporter', 'Creation', 'Status', 'Assignee', 'Execution in'].map((label) => (
            <ListHeaderCell key={label} label={label} />
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
          {rows.map((row) => {
            const statusTone = statusToneStyles[row.statusTone];
            const riskAssessment = getCardRiskAssessment(row.card);
            const equipmentCriticality = getBoardCardMeta(row.card).grade;

            return (
              <Paper
                key={`${row.laneKey}-${row.card.id}`}
                elevation={0}
                sx={{
                  position: 'relative',
                  minHeight: 58,
                  borderRadius: 1,
                  border: `1px solid ${row.highlighted ? '#FF3B30' : '#DBDDDF'}`,
                  bgcolor: row.highlighted ? '#FFF5F5' : activeTheme.backgroundPaper,
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ position: 'absolute', left: 8, top: 9, bottom: 12, width: 4, borderRadius: 99, bgcolor: row.accent }} />
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: listGridTemplateColumns,
                    alignItems: 'center',
                    minHeight: 58,
                    pl: 2.5,
                    pr: 2,
                    columnGap: 0,
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mb: 0.1, color: '#626465' }}>
                      <LabelIcon sx={{ fontSize: 14 }} />
                      <ContextualizationTextLink
                        onClick={() => onOpenContext?.(getMaintenanceContextualizationFromCard(row.card, row.source === 'MR' ? 'mr' : 'wo', row.laneKey, row.status))}
                        color="#626465"
                        fontSize="0.75rem"
                        fontWeight={750}
                        noWrap
                      >
                        {row.requestId}
                      </ContextualizationTextLink>
                    </Box>
                    <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.45 }}>
                      <ContextualizationTextLink
                        onClick={() => onOpenContext?.(getMaintenanceContextualizationFromCard(row.card, 'asset', row.laneKey, row.status))}
                        color={row.highlighted ? '#B91C1C' : '#111827'}
                        fontSize="0.875rem"
                        fontWeight={850}
                        noWrap
                      >
                        {row.card.title}
                      </ContextualizationTextLink>
                      <QualityBadge label={equipmentCriticality} tone={getEquipmentCriticalityTone(equipmentCriticality)} />
                      <QualityBadge label="D" tone={getRiskAssessmentTone(riskAssessment.downtime)} />
                      <QualityBadge label="Q" tone={getRiskAssessmentTone(riskAssessment.quality)} />
                      <QualityBadge label="E" tone={getRiskAssessmentTone(riskAssessment.ehs)} />
                      {row.card.rejection ? <RejectedStatusBadge /> : null}
                    </Box>
                  </Box>
                  <IconTextCell icon={<LocationIcon sx={{ fontSize: 18 }} />} text={row.location} />
                  <IconTextCell icon={<WrenchIcon sx={{ fontSize: 17 }} />} text={row.type} />
                  <PersonCell name={row.reporter} muted />
                  <IconTextCell icon={<CalendarIcon sx={{ fontSize: 15 }} />} text={row.createdAt} />
                  <Box>
                    <Chip
                      label={row.status}
                      size="small"
                      sx={{
                        height: 18,
                        borderRadius: 99,
                        bgcolor: statusTone.bg,
                        color: statusTone.color,
                        border: `1px solid ${statusTone.border}`,
                        fontSize: '0.62rem',
                        fontWeight: 900,
                        '& .MuiChip-label': { px: 1 },
                      }}
                    />
                  </Box>
                  <PersonCell name={row.assignee} muted />
                  <IconTextCell icon={<AccessTimeIcon sx={{ fontSize: 15 }} />} text={row.executionIn} />
                </Box>
              </Paper>
            );
          })}
          {!rows.length ? (
            <Paper elevation={0} sx={{ p: 2, borderRadius: 1, border: '1px solid #DBDDDF', color: '#626465' }}>
              <Typography variant="body2">No rows match the current filters.</Typography>
            </Paper>
          ) : null}
        </Box>
      </Box>
    </Box>
  );
}

function InsightLink({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <Box
      component={onClick ? 'button' : 'span'}
      type={onClick ? 'button' : undefined}
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
      sx={{
        p: 0,
        border: 0,
        bgcolor: 'transparent',
        font: 'inherit',
        color: '#0B63E5',
        fontWeight: 500,
        textDecoration: 'underline',
        textUnderlineOffset: '2px',
        cursor: onClick ? 'pointer' : 'inherit',
        '&:hover': onClick ? { color: '#044ED7' } : undefined,
      }}
    >
      {children}
    </Box>
  );
}

function MaintenanceAiInsights({
  onSchedulingInsightClick,
  onOpenContext,
  onAnalyzeAllClick,
  requestCount,
}: {
  onSchedulingInsightClick: () => void;
  onOpenContext?: (context: MaintenanceContextualization) => void;
  onAnalyzeAllClick: () => void;
  requestCount: number;
}) {
  const [expanded, setExpanded] = useState(true);
  const openInsightContext = (context: MaintenanceContextualization) => onOpenContext?.(context);
  const duplicateCard = maintenanceLaneData.requests.find((card) => card.id === 'mr-1') ?? maintenanceLaneData.requests[0];
  const extrusionCard = maintenanceLaneData.team.scheduled[0];
  const packagingCard = maintenanceLaneData.team.scheduled.find((card) => card.id === 'std-4') ?? maintenanceLaneData.team.scheduled[0];
  const insights: Array<{
    icon?: ReactNode;
    iconBg?: string;
    title: string;
    body: ReactNode;
    highlighted?: boolean;
    onClick?: () => void;
    actionLabel?: string;
    onAction?: () => void;
  }> = [
    {
      title: `BLU.AI found an opportunity to optimize ${requestCount} maintenance request${requestCount === 1 ? '' : 's'}`,
      body: (
        <>
          Several open requests can be grouped by production line, linked to existing Work Orders, or absorbed into upcoming preventive maintenance to cut duplicate work and downtime.
        </>
      ),
      highlighted: true,
      actionLabel: 'Analyze all requests',
      onAction: onAnalyzeAllClick,
    },
    {
      icon: <ErrorOutlineIcon sx={{ fontSize: 13, color: '#EF4444' }} />,
      iconBg: '#FEE2E2',
      title: 'You have 1 potential duplicate intervention',
      body: (
        <>
          <InsightLink onClick={() => openInsightContext(getMaintenanceContextualizationFromCard(duplicateCard, 'mr', 'requests', 'Maintenance Request'))}>MR 606034670</InsightLink> was submitted for{' '}
          <InsightLink onClick={() => openInsightContext(getMaintenanceContextualizationFromCard(duplicateCard, 'asset', 'requests', 'Maintenance Request'))}>Syringe Assembly Machine SA-204</InsightLink>, but{' '}
          <InsightLink onClick={() => openInsightContext(getMaintenanceContextualizationFromCard(duplicateCard, 'wo', 'scheduled', 'Scheduled'))}>WO 606034592</InsightLink> is already scheduled for the same equipment. Consider consolidating into a single intervention.
        </>
      ),
      highlighted: true,
      onClick: onSchedulingInsightClick,
    },
    {
      icon: <InfoOutlinedIcon sx={{ fontSize: 13, color: '#1D4ED8' }} />,
      iconBg: '#E0ECFF',
      title: 'Recurring failures have been identified',
      body: (
        <>
          Recurring issues detected on <InsightLink onClick={() => openInsightContext(getMaintenanceContextualizationFromCard(extrusionCard, 'asset', 'scheduled', 'Scheduled'))}>Extrusion Machine EX-118</InsightLink> (
          <InsightLink onClick={() => openInsightContext(getMaintenanceContextualizationFromCard(extrusionCard, 'wo', 'scheduled', 'Scheduled'))}>WO 606034510</InsightLink>,{' '}
          <InsightLink onClick={() => openInsightContext(getMaintenanceContextualizationFromCard(extrusionCard, 'wo', 'progress', 'In Progress'))}>WO 606034522</InsightLink>,{' '}
          <InsightLink onClick={() => openInsightContext(getMaintenanceContextualizationFromCard(extrusionCard, 'wo', 'review', 'Done'))}>WO 606034538</InsightLink>). Consider reviewing the maintenance strategy to prevent future occurrences.
        </>
      ),
    },
    {
      icon: <InfoOutlinedIcon sx={{ fontSize: 13, color: '#1D4ED8' }} />,
      iconBg: '#E0ECFF',
      title: 'A maintenance request may be under-prioritized',
      body: (
        <>
          <InsightLink onClick={() => openInsightContext(getMaintenanceContextualizationFromCard(packagingCard, 'mr', 'scheduled', 'Scheduled'))}>MR 606034705</InsightLink> for{' '}
          <InsightLink onClick={() => openInsightContext(getMaintenanceContextualizationFromCard(packagingCard, 'asset', 'scheduled', 'Scheduled'))}>Packaging Line PL-009</InsightLink> may be under-prioritized based on similar cases. Review suggested priority.
        </>
      ),
    },
  ];

  return (
    <Box
      sx={{
        mb: 1.25,
        p: 2,
        borderRadius: '12px',
        bgcolor: tokenNeutral.lightest,
        border: 'none',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: expanded ? 2 : 0, px: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SparkleIcon sx={{ fontSize: 16, color: '#F97316' }} />
          <Typography sx={{ color: tokenBrand.main, fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.1 }}>
            BLU.AI analysis
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={() => setExpanded((current) => !current)}
          sx={{
            color: tokenText.secondary,
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            minWidth: 0,
            px: 0.5,
            py: 0,
          }}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </Box>

      {expanded ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45 }}>
          {insights.map((insight) => (
            <Box
              key={insight.title}
              component={insight.onClick ? 'button' : 'div'}
              type={insight.onClick ? 'button' : undefined}
              onClick={insight.onClick}
              sx={{
                px: insight.highlighted ? 2 : 1,
                py: insight.highlighted ? 1.5 : 0.5,
                borderRadius: '6px',
                border: insight.highlighted ? `1px solid ${tokenDivider}` : '1px solid transparent',
                bgcolor: insight.highlighted ? 'rgba(0,0,0,0.03)' : 'transparent',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                minWidth: 0,
                width: '100%',
                textAlign: 'left',
                font: 'inherit',
                cursor: insight.onClick ? 'pointer' : 'default',
                transition: 'border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease',
                '&:hover': insight.onClick
                  ? {
                      bgcolor: 'rgba(0,0,0,0.06)',
                      borderColor: tokenDivider,
                      boxShadow: '0 1px 4px rgba(15, 23, 42, 0.12)',
                    }
                  : undefined,
                '&:focus-visible': insight.onClick
                  ? {
                      outline: '2px solid #1D74FF',
                      outlineOffset: 2,
                    }
                  : undefined,
              }}
            >
              {insight.onAction ? (
                <SparkleIcon sx={{ fontSize: 16, color: '#F97316', mt: 0.15, flexShrink: 0 }} />
              ) : insight.highlighted ? (
                <WarningAmberIcon sx={{ fontSize: 16, color: tokenError.main, mt: 0.15, flexShrink: 0 }} />
              ) : (
                <InfoOutlinedIcon sx={{ fontSize: 16, color: tokenBrand.main, mt: 0.15, flexShrink: 0 }} />
              )}
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.32, flex: 1, minWidth: 0 }}>
                <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                  {insight.title}
                </Box>{' '}
                - {insight.body}
              </Typography>
              {insight.onAction ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<SparkleIcon sx={{ fontSize: 15 }} />}
                  onClick={insight.onAction}
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.78rem',
                    fontWeight: 500,
                    borderRadius: 1,
                    px: 1.5,
                    py: 0.5,
                    color: activeTheme.primary,
                    borderColor: activeTheme.primary,
                    bgcolor: activeTheme.backgroundPaper,
                    boxShadow: 'none',
                    flexShrink: 0,
                    alignSelf: 'center',
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      borderColor: activeTheme.primary,
                      bgcolor: 'rgba(29, 116, 255, 0.06)',
                    },
                  }}
                >
                  {insight.actionLabel}
                </Button>
              ) : null}
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

type AiChatRole = 'assistant' | 'lineLeader';
type AiChatStepKind = 'message' | 'details' | 'options' | 'availability' | 'success' | 'chips';

type AiChatStep = {
  id: string;
  role: AiChatRole;
  kind: AiChatStepKind;
  content?: ReactNode;
};

const scheduledWednesdayLabel = '27/05/2026';

const schedulingOptions = [
  {
    id: 'option1',
    title: 'Wednesday together with WO #458732',
    description: 'Lowest downtime impact.',
  },
  {
    id: 'option2',
    title: 'Immediate intervention with Daniel Davidson',
    description: 'Fastest response.',
  },
  {
    id: 'option3',
    title: 'Tomorrow during lower production load',
    description: 'Lowest production impact.',
  },
];

const technicianAvailability = [
  { name: 'Daniel Davidson', status: '50% available', value: 50, recommended: true },
  { name: 'Carlos Gomez', status: '23% available', value: 23 },
  { name: 'Agnes Rocha', status: 'assigned to WO #458732', value: 100, assigned: true },
];

function AiChatBubble({ role, children }: { role: AiChatRole; children: ReactNode }) {
  const isLeader = role === 'lineLeader';

  return (
    <Box sx={{ display: 'flex', justifyContent: isLeader ? 'flex-end' : 'flex-start' }}>
      <Box
        sx={{
          maxWidth: isLeader ? '82%' : '92%',
          px: 1.2,
          py: 0.9,
          borderRadius: 1.6,
          borderTopRightRadius: isLeader ? 0.4 : 1.6,
          borderTopLeftRadius: isLeader ? 1.6 : 0.4,
          bgcolor: isLeader ? '#0B63E5' : activeTheme.backgroundPaper,
          color: isLeader ? '#FFFFFF' : '#1F2937',
          border: isLeader ? '1px solid #0B63E5' : '1px solid #D8DEE8',
          boxShadow: isLeader ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.08)',
        }}
      >
        <Typography sx={{ fontSize: '0.78rem', fontWeight: 650, lineHeight: 1.38 }}>
          {children}
        </Typography>
      </Box>
    </Box>
  );
}

function AiTypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, pl: 0.4 }}>
      {[0, 1, 2].map((item) => (
        <Box
          key={item}
          sx={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            bgcolor: '#9CA3AF',
            animation: 'aiChatPulse 900ms infinite ease-in-out',
            animationDelay: `${item * 120}ms`,
            '@keyframes aiChatPulse': {
              '0%, 80%, 100%': { opacity: 0.35, transform: 'translateY(0)' },
              '40%': { opacity: 1, transform: 'translateY(-2px)' },
            },
          }}
        />
      ))}
    </Box>
  );
}

function MaintenanceRequestDetailsCard() {
  const [expanded, setExpanded] = useState(true);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);

  return (
    <>
      <Paper elevation={0} sx={{ borderRadius: 1.4, border: '1px solid #D8DEE8', overflow: 'hidden', bgcolor: activeTheme.backgroundPaper }}>
        <Box
          component="button"
          type="button"
          onClick={() => setExpanded((current) => !current)}
          sx={{
            width: '100%',
            border: 0,
            bgcolor: '#F8FAFC',
            px: 1.2,
            py: 0.9,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            cursor: 'pointer',
            font: 'inherit',
            textAlign: 'left',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#111827', fontSize: '0.78rem', fontWeight: 900, lineHeight: 1.15 }}>
              MR 606034670 details
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.66rem', fontWeight: 700, mt: 0.15 }}>
              High Priority • Syringe Assembly Machine SA-204
            </Typography>
          </Box>
          <KeyboardArrowUpIcon sx={{ fontSize: 18, color: '#64748B', transform: expanded ? 'none' : 'rotate(180deg)' }} />
        </Box>

        {expanded ? (
          <Box sx={{ p: 1.2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8, mb: 1 }}>
              {[
                ['Submitted by', 'Maria Silva'],
                ['Equipment', 'Syringe Assembly Machine SA-204 (Criticality A)'],
                ['Priority', getPriorityDisplayLabel('High')],
                ['Attachment', 'Image available'],
              ].map(([label, value]) => (
                <Box key={label} sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: '#64748B', fontSize: '0.61rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.1 }}>
                    {label}
                  </Typography>
                  <Typography sx={{ color: '#111827', fontSize: '0.72rem', fontWeight: 750, lineHeight: 1.25 }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
              {[
                ['Downtime', 'High', '#DC2626', '#FEF2F2'],
                ['Quality', 'Medium', '#D97706', '#FFFBEB'],
                ['EHS', 'Low', '#16A34A', '#F0FDF4'],
              ].map(([label, value, color, bg]) => (
                <Chip
                  key={label}
                  size="small"
                  label={`${label}: ${value}`}
                  sx={{
                    height: 21,
                    borderRadius: 1,
                    bgcolor: bg,
                    color,
                    border: `1px solid ${color}`,
                    fontSize: '0.62rem',
                    fontWeight: 850,
                    '& .MuiChip-label': { px: 0.7 },
                  }}
                />
              ))}
            </Box>

            <Typography sx={{ color: '#64748B', fontSize: '0.61rem', fontWeight: 900, textTransform: 'uppercase', mb: 0.25 }}>
              Detailed Description
            </Typography>
            <Typography sx={{ color: '#374151', fontSize: '0.72rem', fontWeight: 600, lineHeight: 1.4 }}>
              During the last production run, the equipment stopped three times due to abnormal vibration in the assembly head. Increased noise and slight
              misalignment were observed, especially at higher speeds, affecting plunger insertion into syringe barrels.
            </Typography>

            <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.6 }}>
              <Chip
                component="button"
                type="button"
                clickable
                size="small"
                icon={<CloudUploadIcon sx={{ fontSize: 14 }} />}
                label="Image attachment available"
                onClick={() => setIsAttachmentOpen(true)}
                sx={{
                  height: 22,
                  borderRadius: 1,
                  bgcolor: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1px solid #BFDBFE',
                  fontSize: '0.64rem',
                  fontWeight: 850,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: '#DBEAFE' },
                  '&:focus-visible': { outline: '2px solid #1D74FF', outlineOffset: 2 },
                }}
              />
            </Box>
          </Box>
        ) : null}
      </Paper>

      <Dialog open={isAttachmentOpen} onClose={() => setIsAttachmentOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, pr: 1.2 }}>
          <Box>
            <Typography sx={{ color: '#111827', fontSize: '0.95rem', fontWeight: 900, lineHeight: 1.15 }}>
              MR 606034670 image attachment
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: '0.7rem', fontWeight: 700, mt: 0.25 }}>
              Syringe Assembly Machine SA-204
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setIsAttachmentOpen(false)} aria-label="Close image attachment">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 2 }}>
          <Box
            component="img"
            src={maintenanceFollowUpAttachmentSrc}
            alt="Maintenance request attachment"
            sx={{
              width: '100%',
              maxHeight: '72vh',
              objectFit: 'contain',
              display: 'block',
              borderRadius: 1.2,
              border: '1px solid #D8DEE8',
              bgcolor: '#F8FAFC',
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

function SchedulingOptionsCards({
  selectedOption,
  onOptionSelect,
}: {
  selectedOption: string;
  onOptionSelect: (optionId: string) => void;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.65 }}>
      {schedulingOptions.map((option, index) => {
        const selected = selectedOption === option.id;
        return (
          <Box
            key={option.id}
            component="button"
            type="button"
            onClick={() => onOptionSelect(option.id)}
            sx={{
              width: '100%',
              p: 0.9,
              borderRadius: 1.2,
              border: selected ? '1px solid #1D74FF' : '1px solid #D8DEE8',
              bgcolor: selected ? '#EFF6FF' : activeTheme.backgroundPaper,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 0.8,
              textAlign: 'left',
              cursor: 'pointer',
              font: 'inherit',
              boxShadow: selected ? '0 0 0 2px rgba(29, 116, 255, 0.1)' : 'none',
              '&:hover': { borderColor: '#9DBBFF', bgcolor: '#F8FBFF' },
              '&:focus-visible': { outline: '2px solid #1D74FF', outlineOffset: 2 },
            }}
          >
            <Box
              sx={{
                width: 21,
                height: 21,
                borderRadius: '50%',
                bgcolor: selected ? '#1D74FF' : '#E5EAF2',
                color: selected ? '#FFFFFF' : '#475569',
                display: 'grid',
                placeItems: 'center',
                fontSize: '0.68rem',
                fontWeight: 900,
                flexShrink: 0,
              }}
            >
              {index + 1}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: '#111827', fontSize: '0.76rem', fontWeight: 900, lineHeight: 1.18 }}>
                {option.title}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 700, mt: 0.15, lineHeight: 1.25 }}>
                {option.description}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}

function TechnicianAvailabilityRows() {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: 1.3, border: '1px solid #D8DEE8', bgcolor: activeTheme.backgroundPaper }}>
      <Typography sx={{ color: '#111827', fontSize: '0.76rem', fontWeight: 900, mb: 0.7 }}>
        Wednesday technician availability
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {technicianAvailability.map((technician) => (
          <Box key={technician.name} sx={{ display: 'grid', gridTemplateColumns: '1fr 76px', gap: 0.8, alignItems: 'center' }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0 }}>
                <Typography noWrap sx={{ color: '#111827', fontSize: '0.72rem', fontWeight: 850, lineHeight: 1 }}>
                  {technician.name}
                </Typography>
                {technician.recommended ? (
                  <Chip
                    size="small"
                    label="Recommended"
                    sx={{ height: 17, borderRadius: 1, bgcolor: '#DCFCE7', color: '#15803D', fontSize: '0.55rem', fontWeight: 900, '& .MuiChip-label': { px: 0.5 } }}
                  />
                ) : null}
              </Box>
              <Box sx={{ mt: 0.45, height: 5, borderRadius: 99, bgcolor: '#E5E7EB', overflow: 'hidden' }}>
                <Box
                  sx={{
                    width: `${technician.value}%`,
                    height: '100%',
                    bgcolor: technician.assigned ? '#94A3B8' : technician.recommended ? '#16A34A' : '#F59E0B',
                  }}
                />
              </Box>
            </Box>
            <Typography sx={{ color: technician.assigned ? '#64748B' : '#111827', fontSize: '0.64rem', fontWeight: 800, lineHeight: 1.15 }}>
              {technician.status}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={{ color: '#1D4ED8', fontSize: '0.7rem', fontWeight: 850, mt: 0.85 }}>
        Recommended assignment: Daniel Davidson.
      </Typography>
    </Paper>
  );
}

function MaintenanceAiChatDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [visibleStepCount, setVisibleStepCount] = useState(0);
  const [selectedOption, setSelectedOption] = useState('option1');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const aiChatSteps: AiChatStep[] = [
    {
      id: 'announce',
      role: 'assistant',
      kind: 'message',
      content: 'A new High Priority Maintenance Request was submitted for Syringe Assembly Machine SA-204.',
    },
    {
      id: 'summary',
      role: 'assistant',
      kind: 'message',
      content: 'Issue summary: Intermittent stoppages with abnormal vibration and assembly head misalignment.',
    },
    {
      id: 'details',
      role: 'assistant',
      kind: 'details',
    },
    {
      id: 'options',
      role: 'assistant',
      kind: 'options',
      content: 'I found an existing planned work order and lower-load windows. Here are the scheduling options:',
    },
    {
      id: 'ask-recommendation',
      role: 'lineLeader',
      kind: 'message',
      content: 'Which option is recommended?',
    },
    {
      id: 'recommendation',
      role: 'assistant',
      kind: 'message',
      content: 'Option 1 is recommended because it combines this intervention with an already planned WO, reducing downtime and avoiding duplicate work.',
    },
    {
      id: 'proceed',
      role: 'lineLeader',
      kind: 'message',
      content: 'Proceed with option 1.',
    },
    {
      id: 'availability',
      role: 'assistant',
      kind: 'availability',
      content: 'I checked technician coverage for Wednesday.',
    },
    {
      id: 'assign',
      role: 'lineLeader',
      kind: 'message',
      content: 'Assign Daniel and create the WO.',
    },
    {
      id: 'success',
      role: 'assistant',
      kind: 'success',
    },
    {
      id: 'chips',
      role: 'assistant',
      kind: 'chips',
    },
  ];

  useEffect(() => {
    if (!open) {
      setVisibleStepCount(0);
      setSelectedOption('option1');
      return;
    }

    const timers = aiChatSteps.map((_, index) =>
      window.setTimeout(() => {
        setVisibleStepCount(index + 1);
      }, 260 + index * 720)
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [visibleStepCount]);

  const renderStep = (step: AiChatStep) => {
    if (step.kind === 'details') {
      return (
        <Box key={step.id} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Box sx={{ maxWidth: '94%', width: '100%' }}>
            <MaintenanceRequestDetailsCard />
          </Box>
        </Box>
      );
    }

    if (step.kind === 'options') {
      return (
        <Box key={step.id} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Box sx={{ maxWidth: '94%', width: '100%' }}>
            <AiChatBubble role="assistant">{step.content}</AiChatBubble>
            <Box sx={{ mt: 0.75 }}>
              <SchedulingOptionsCards selectedOption={selectedOption} onOptionSelect={setSelectedOption} />
            </Box>
          </Box>
        </Box>
      );
    }

    if (step.kind === 'availability') {
      return (
        <Box key={step.id} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Box sx={{ maxWidth: '94%', width: '100%' }}>
            <AiChatBubble role="assistant">{step.content}</AiChatBubble>
            <Box sx={{ mt: 0.75 }}>
              <TechnicianAvailabilityRows />
            </Box>
          </Box>
        </Box>
      );
    }

    if (step.kind === 'success') {
      return (
        <Box key={step.id} sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <Paper
            elevation={0}
            sx={{
              maxWidth: '94%',
              width: '100%',
              p: 1.2,
              borderRadius: 1.5,
              border: '1px solid #86EFAC',
              bgcolor: '#F0FDF4',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: '#16A34A',
                  color: '#FFFFFF',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckIcon sx={{ fontSize: 16 }} />
              </Box>
              <Box>
                <Typography sx={{ color: '#166534', fontSize: '0.8rem', fontWeight: 950, lineHeight: 1.25 }}>
                  WO created successfully.
                </Typography>
                <Typography sx={{ color: '#166534', fontSize: '0.72rem', fontWeight: 750, lineHeight: 1.35, mt: 0.3 }}>
                  Scheduled for Wednesday ({scheduledWednesdayLabel}), linked to WO #458732 and assigned to Daniel Davidson.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      );
    }

    if (step.kind === 'chips') {
      return (
        <Box key={step.id} sx={{ display: 'flex', gap: 0.6, flexWrap: 'wrap', pl: 0.2 }}>
          {['Predictive maintenance alerts', 'Shift schedule impact'].map((label) => (
            <Chip
              key={label}
              label={label}
              clickable
              size="small"
              sx={{
                height: 28,
                borderRadius: 999,
                bgcolor: activeTheme.backgroundPaper,
                color: '#0B63E5',
                border: '1px solid #B8D4FF',
                fontSize: '0.7rem',
                fontWeight: 850,
                '&:hover': { bgcolor: '#EFF6FF' },
              }}
            />
          ))}
        </Box>
      );
    }

    return (
      <AiChatBubble key={step.id} role={step.role}>
        {step.content}
      </AiChatBubble>
    );
  };

  const visibleSteps = aiChatSteps.slice(0, visibleStepCount);
  const isTyping = open && visibleStepCount > 0 && visibleStepCount < aiChatSteps.length;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 430 },
          maxWidth: '100%',
          bgcolor: '#F5F7FA',
          borderLeft: '1px solid #D8DEE8',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            px: 1.6,
            py: 1.35,
            borderBottom: '1px solid #D8DEE8',
            bgcolor: activeTheme.backgroundPaper,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
              <SparkleIcon sx={{ color: '#FF8A00', fontSize: 19 }} />
              <Typography sx={{ color: '#0B63E5', fontSize: '0.95rem', fontWeight: 900, lineHeight: 1 }}>
                BLU.AI Assistant
              </Typography>
            </Box>
            <Typography sx={{ color: '#64748B', fontSize: '0.68rem', fontWeight: 750, mt: 0.4 }}>
              Context: MR 606034670 • SA-204
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close AI chat">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1.4, py: 1.3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
            {visibleSteps.map(renderStep)}
            {visibleStepCount === 0 ? <AiTypingIndicator /> : null}
            {isTyping ? <AiTypingIndicator /> : null}
            <Box ref={messagesEndRef} />
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}

function SeverityLegend({
  maintenancePriorityStyles,
  selectedPriorities,
  onPriorityToggle,
}: {
  maintenancePriorityStyles: Record<MaintenancePriority, MaintenancePriorityStyle>;
  selectedPriorities: MaintenancePriority[];
  onPriorityToggle: (severity: MaintenancePriority) => void;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.4, flexWrap: 'wrap' }}>
      {severityLevels.map((level) => {
        const selected = selectedPriorities.includes(level);

        return (
          <Box
            key={level}
            component="button"
            type="button"
            onClick={() => onPriorityToggle(level)}
            aria-pressed={selected}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.45,
              border: '1px solid',
              borderColor: selected ? maintenancePriorityStyles[level].border : 'transparent',
              borderRadius: 0.75,
              bgcolor: selected ? maintenancePriorityStyles[level].bg : 'transparent',
              px: 0.45,
              py: 0.2,
              cursor: 'pointer',
            }}
          >
            <Box
              sx={{
                width: 9,
                height: 9,
                bgcolor: maintenancePriorityStyles[level].fg,
                border: `1px solid ${maintenancePriorityStyles[level].border}`,
              }}
            />
            <Typography variant="caption" sx={{ color: '#1F2937', fontWeight: 700 }}>
              {level}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

const filterSelectMenuProps = {
  PaperProps: {
    sx: {
      mt: 0.4,
      borderRadius: 1,
      border: '1px solid #D8DEE8',
      boxShadow: '0 14px 32px rgba(15, 23, 42, 0.16)',
      maxHeight: 300,
    },
  },
};

const drawerSelectMenuProps = {
  disablePortal: true,
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
  PaperProps: {
    sx: {
      mt: 0.4,
      borderRadius: 1.2,
      border: '1px solid #D8DEE8',
      boxShadow: '0 14px 32px rgba(15, 23, 42, 0.16)',
      maxHeight: 300,
    },
  },
};

function formatFilterSummary(selectedOptions: readonly string[], emptyLabel = 'All') {
  if (!selectedOptions.length) return emptyLabel;
  if (selectedOptions.length <= 2) return selectedOptions.join(', ');
  return `${selectedOptions[0]}, ${selectedOptions[1]} +${selectedOptions.length - 2}`;
}

function FilterMultiSelect<T extends string>({
  label,
  options,
  selectedOptions,
  onChange,
  emptyLabel = 'All',
}: {
  label: string;
  options: readonly T[];
  selectedOptions: T[];
  onChange: (options: T[]) => void;
  emptyLabel?: string;
}) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        multiple
        displayEmpty
        label={label}
        value={selectedOptions}
        renderValue={(selected) => formatFilterSummary(selected as string[], emptyLabel)}
        onChange={(event) => {
          const value = event.target.value;
          onChange((typeof value === 'string' ? value.split(',') : value) as T[]);
        }}
        MenuProps={filterSelectMenuProps}
        sx={{
          bgcolor: '#F8FAFC',
          borderRadius: 1,
          '& .MuiSelect-select': {
            minHeight: 23,
            py: 1,
            color: selectedOptions.length ? '#111827' : '#6B7280',
            fontSize: '0.82rem',
            fontWeight: 800,
          },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D8DEE8' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#044ED7' },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option} sx={{ minHeight: 34, gap: 0.7 }}>
            <Checkbox
              size="small"
              checked={selectedOptions.includes(option)}
              sx={{ p: 0.2, color: '#94A3B8', '&.Mui-checked': { color: '#044ED7' } }}
            />
            <Typography sx={{ color: '#334155', fontSize: '0.78rem', fontWeight: selectedOptions.includes(option) ? 850 : 650 }}>
              {option}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function FilterSingleSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  getOptionLabel = (option) => option,
  emptyLabel = 'Select',
  allowEmpty = false,
}: {
  label: string;
  options: readonly T[];
  value: T | '';
  onChange: (value: T | '') => void;
  getOptionLabel?: (option: T) => string;
  emptyLabel?: string;
  allowEmpty?: boolean;
}) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel shrink>{label}</InputLabel>
      <Select
        displayEmpty
        label={label}
        value={value}
        renderValue={(selected) => (selected ? getOptionLabel(selected as T) : emptyLabel)}
        onChange={(event) => onChange(event.target.value as T | '')}
        MenuProps={filterSelectMenuProps}
        sx={{
          bgcolor: '#F8FAFC',
          borderRadius: 1,
          '& .MuiSelect-select': {
            minHeight: 23,
            py: 1,
            color: '#111827',
            fontSize: '0.82rem',
            fontWeight: 800,
          },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D8DEE8' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#044ED7' },
        }}
      >
        {allowEmpty ? (
          <MenuItem value="" sx={{ color: '#64748B', fontSize: '0.8rem', fontWeight: 750 }}>
            {emptyLabel}
          </MenuItem>
        ) : null}
        {options.map((option) => (
          <MenuItem key={option} value={option} sx={{ fontSize: '0.8rem', fontWeight: 750 }}>
            {getOptionLabel(option)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function FollowUpBoardFilterPanel({
  anchorEl,
  open,
  filters,
  onClose,
  onClearAll,
  onApply,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  filters: FollowUpBoardFilters;
  onClose: () => void;
  onClearAll: () => void;
  onApply: (filters: FollowUpBoardFilters) => void;
}) {
  const [draftFilters, setDraftFilters] = useState<FollowUpBoardFilters>(filters);
  const customRangeSelected = draftFilters.dates.includes('Custom Range');
  const hasFilters = hasFollowUpBoardFilters(draftFilters);

  useEffect(() => {
    if (!open) return;

    setDraftFilters(filters);
  }, [filters, open]);

  const updateDraftList = <T extends string,>(key: 'statuses' | 'tags' | 'types' | 'priorities' | 'criticalities' | 'assignedTo', value: T[]) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const handleDatePeriodChange = (option: FollowUpDateOption | '') => {
    setDraftFilters((current) => ({
      ...current,
      dates: option ? [option] : [],
      dateRange: option === 'Custom Range' ? current.dateRange : { start: '', end: '' },
    }));
  };

  const handleDateRangeChange = (field: keyof FollowUpDateRange, value: string) => {
    setDraftFilters((current) => ({
      ...current,
      dateRange: {
        ...current.dateRange,
        [field]: value,
      },
      dates: ['Custom Range'],
    }));
  };

  const handleClearAll = () => {
    setDraftFilters(emptyFollowUpBoardFilters);
    onClearAll();
  };

  const handleApply = () => {
    onApply(draftFilters);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      slotProps={{
        paper: {
          sx: {
            mt: 0.8,
            width: { xs: 'calc(100vw - 32px)', sm: 390 },
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 'min(760px, calc(100vh - 120px))',
            borderRadius: 1,
            border: '1px solid #D8DEE8',
            boxShadow: '0 20px 44px rgba(15, 23, 42, 0.18)',
            overflow: 'auto',
          },
        },
      }}
    >
      <Box sx={{ p: 1.55, bgcolor: activeTheme.backgroundPaper }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.35 }}>
          <Typography sx={{ color: '#044ED7', fontSize: '0.92rem', fontWeight: 950, lineHeight: 1 }}>
            Filters
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gap: 1.35 }}>
          <FilterMultiSelect
            label="State"
            options={followUpStatusOptions}
            selectedOptions={draftFilters.statuses}
            onChange={(value) => updateDraftList('statuses', value)}
          />
          <FilterMultiSelect
            label="Type"
            options={followUpTypeOptions}
            selectedOptions={draftFilters.types}
            onChange={(value) => updateDraftList('types', value)}
          />
          <FilterMultiSelect
            label="Priority"
            options={severityLevels}
            selectedOptions={draftFilters.priorities}
            onChange={(value) => updateDraftList('priorities', value)}
          />
          <FilterMultiSelect
            label="Tags"
            options={followUpTagOptions}
            selectedOptions={draftFilters.tags}
            onChange={(value) => updateDraftList('tags', value)}
            emptyLabel="Select tags"
          />
          <FilterMultiSelect
            label="Asset Criticality"
            options={criticalityOptions}
            selectedOptions={draftFilters.criticalities}
            onChange={(value) => updateDraftList('criticalities', value)}
          />

          <Box sx={{ display: 'grid', gap: 0.8 }}>
            <TextField
              size="small"
              label="Assigned To"
              placeholder="Search assignee"
              value={draftFilters.assignedToSearch}
              onChange={(event) => setDraftFilters((current) => ({ ...current, assignedToSearch: event.target.value }))}
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 17, color: '#64748B' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  bgcolor: activeTheme.backgroundPaper,
                  '& fieldset': { borderColor: '#D8DEE8' },
                  '&:hover fieldset': { borderColor: '#94A3B8' },
                  '&.Mui-focused fieldset': { borderColor: '#044ED7' },
                },
                '& .MuiInputBase-input': { fontSize: '0.82rem', fontWeight: 800 },
              }}
            />
          </Box>

          <Paper elevation={0} sx={{ p: 1, border: '1px solid #E2E8F0', borderRadius: 1, bgcolor: '#F8FAFC' }}>
            <EquipmentSelector
              value={draftFilters.assetHierarchy}
              onChange={(selection) => setDraftFilters((current) => ({ ...current, assetHierarchy: selection }))}
              label="Area > Unit > Line > Zone > Equipment"
              placeholder="Select asset hierarchy"
            />
            {draftFilters.assetHierarchy ? (
              <Button
                size="small"
                onClick={() => setDraftFilters((current) => ({ ...current, assetHierarchy: null }))}
                startIcon={<CloseIcon sx={{ fontSize: 15 }} />}
                sx={{ mt: -0.35, minHeight: 24, fontWeight: 850 }}
              >
                Clear hierarchy
              </Button>
            ) : null}
          </Paper>

          <Box sx={{ display: 'grid', gap: 1 }}>
            <FilterSingleSelect
              label="Date"
              options={dateFilterOptions}
              value={draftFilters.dates[0] ?? ''}
              onChange={handleDatePeriodChange}
              emptyLabel="Select date filter"
              allowEmpty
            />
            {customRangeSelected ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8 }}>
                <TextField
                  size="small"
                  label="From"
                  type="date"
                  value={draftFilters.dateRange.start}
                  onChange={(event) => handleDateRangeChange('start', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiInputBase-input': { fontSize: '0.78rem', fontWeight: 800 } }}
                />
                <TextField
                  size="small"
                  label="To"
                  type="date"
                  value={draftFilters.dateRange.end}
                  onChange={(event) => handleDateRangeChange('end', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ '& .MuiInputBase-input': { fontSize: '0.78rem', fontWeight: 800 } }}
                />
              </Box>
            ) : null}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8, mt: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClearAll}
            disabled={!hasFilters}
            sx={{ minWidth: 78, fontWeight: 900, borderColor: '#CBD5E1', color: '#475569' }}
          >
            Clear All
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleApply}
            sx={{ minWidth: 78, bgcolor: '#044ED7', color: '#FFFFFF', fontWeight: 950, boxShadow: 'none', '&:hover': { bgcolor: '#003DAA', boxShadow: 'none' } }}
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}

function CollapsedLaneTab({
  title,
  count,
  onExpand,
}: {
  title: string;
  count: number;
  onExpand: () => void;
}) {
  return (
    <Tooltip title={`Expand ${title}`} placement="right">
      <Paper
        component="button"
        type="button"
        elevation={0}
        onClick={onExpand}
        sx={{
          width: 40,
          minHeight: { xs: 150, md: 220 },
          border: '1px solid #CBD5E1',
          borderRadius: 1.5,
          bgcolor: '#EFF3F6',
          color: '#044ED7',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.8,
          p: 0.65,
          cursor: 'pointer',
          '&:hover': { bgcolor: '#E7EEF8', borderColor: '#93B8F2' },
        }}
      >
        <KeyboardArrowRightIcon sx={{ fontSize: 18, color: '#111827' }} />
        <Typography
          variant="caption"
          sx={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            color: '#044ED7',
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: 0.1,
          }}
        >
          {title}
        </Typography>
        <Box
          component="span"
          sx={{
            minWidth: 20,
            height: 20,
            px: 0.45,
            borderRadius: 999,
            bgcolor: activeTheme.backgroundPaper,
            color: '#1F2366',
            border: '1px solid #DBDDDF',
            fontSize: '0.68rem',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {count}
        </Box>
      </Paper>
    </Tooltip>
  );
}

function LaneShell({
  laneKey,
  title,
  count,
  focusMode = false,
  dropActive = false,
  onDragOver,
  onDragLeave,
  onDrop,
  onCollapse,
  children,
}: {
  laneKey: LaneKey;
  title: string;
  count: number;
  focusMode?: boolean;
  dropActive?: boolean;
  onDragOver?: (event: ReactDragEvent<HTMLDivElement>) => void;
  onDragLeave?: () => void;
  onDrop?: (event: ReactDragEvent<HTMLDivElement>) => void;
  onCollapse: () => void;
  children: ReactNode;
}) {
  const helpText = laneHelpText[laneKey];

  return (
    <Paper
      elevation={0}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      sx={{
        width: focusMode ? 'auto' : 370,
        minWidth: focusMode ? 0 : 370,
        flex: focusMode ? '1 1 0' : '0 0 auto',
        borderRadius: 2,
        border: dropActive ? '1px solid #0B63E5' : '1px solid var(--paper-border-color)',
        bgcolor: dropActive ? 'var(--token-brand-soft-bg)' : activeTheme.backgroundDefault,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          minHeight: 44,
          px: 1.15,
          py: 0.75,
          borderBottom: '1px solid var(--paper-border-color)',
          bgcolor: activeTheme.backgroundPaper,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0, userSelect: 'none' }}>
          <Typography variant="subtitle2" sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </Typography>
          <Tooltip title={helpText} arrow placement="top">
            <IconButton
              size="small"
              aria-label={`${title} column information`}
              sx={{
                width: 20,
                height: 20,
                p: 0,
                color: activeTheme.textSecondary,
                '&:hover': { bgcolor: 'var(--token-brand-soft-bg)', color: activeTheme.primary },
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 15 }} />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0, userSelect: 'none' }}>
          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 700 }}>
            {count} cards
          </Typography>
          {focusMode ? null : (
            <IconButton
              size="small"
              onClick={onCollapse}
              sx={{
                border: '1px solid var(--paper-border-color)',
                bgcolor: activeTheme.backgroundDefault,
                color: activeTheme.textPrimary,
              }}
            >
              <KeyboardArrowDownIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
      <Box sx={{ p: 1, minHeight: 420 }}>{children}</Box>
    </Paper>
  );
}

function BoardLane({
  laneKey,
  title,
  cards,
  onCollapse,
  maintenancePriorityStyles,
  focusMode = false,
  dropActive = false,
  onRequestCardClick,
  onWorkOrderCardClick,
  onOpenContext,
  onRequestDragStart,
  onRequestDragEnd,
  onRequestDragOver,
  onRequestDrop,
  onPlanWithAi,
}: {
  laneKey: LaneKey;
  title: string;
  cards: MaintenanceCard[];
  onCollapse: () => void;
  maintenancePriorityStyles: Record<MaintenancePriority, MaintenancePriorityStyle>;
  focusMode?: boolean;
  dropActive?: boolean;
  onRequestCardClick?: (card: MaintenanceCard) => void;
  onWorkOrderCardClick?: (card: MaintenanceCard, laneTitle: string) => void;
  onOpenContext?: (context: MaintenanceContextualization) => void;
  onRequestDragStart?: (event: ReactDragEvent<HTMLElement>, card: MaintenanceCard) => void;
  onRequestDragEnd?: () => void;
  onRequestDragOver?: (laneKey: LaneKey) => void;
  onRequestDrop?: (laneKey: LaneKey, event: ReactDragEvent<HTMLDivElement>) => void;
  onPlanWithAi?: (card: MaintenanceCard, source: PlanningAgentSource) => void;
}) {
  const canAcceptRequestDrop = laneKey === 'planning' || laneKey === 'scheduled';

  return (
    <LaneShell
      laneKey={laneKey}
      title={title}
      count={cards.length}
      focusMode={focusMode}
      dropActive={dropActive}
      onCollapse={onCollapse}
      onDragOver={
        canAcceptRequestDrop
          ? (event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = laneKey === 'planning' ? 'move' : 'copy';
              onRequestDragOver?.(laneKey);
            }
          : undefined
      }
      onDrop={canAcceptRequestDrop ? (event) => onRequestDrop?.(laneKey, event) : undefined}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {cards.map((card) => {
          const handleWorkOrderCardClick =
            laneKey === 'planning' || laneKey === 'scheduled' || laneKey === 'progress' || laneKey === 'review' || laneKey === 'closed'
              ? () => onWorkOrderCardClick?.(card, title)
              : undefined;

          return (
            <MaintenanceCardItem
              key={card.id}
              card={card}
              laneKey={laneKey}
              maintenancePriorityStyles={maintenancePriorityStyles}
              onClick={onRequestCardClick ?? handleWorkOrderCardClick}
              onOpenContext={(context) => onOpenContext?.({ ...context, openedAt: context.openedAt || getPriorityDueDateLabel(card, laneKey) })}
              draggable={laneKey === 'requests'}
              onDragStart={onRequestDragStart}
              onDragEnd={onRequestDragEnd}
              showPlanWithAi={laneKey === 'requests' || laneKey === 'planning'}
              onPlanWithAi={onPlanWithAi ? (planCard) => onPlanWithAi(planCard, laneKey === 'requests' ? 'request' : 'planning') : undefined}
            />
          );
        })}
        {!cards.length ? (
          <Typography variant="body2" sx={{ color: '#626465', p: 1 }}>
            No cards match the current filters.
          </Typography>
        ) : null}
      </Box>
    </LaneShell>
  );
}

function WorkOrderSelect({
  label,
  value,
  onChange,
  options,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuOptions = [{ value: '', label: 'Select...' }, ...options];
  const selectedLabel = label === 'Priority *' ? getPriorityDisplayLabel(value) : value;

  return (
    <ClickAwayListener onClickAway={() => setOpen(false)}>
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Typography
          component="span"
          sx={{
            position: 'absolute',
            top: -7,
            left: 11,
            px: 0.4,
            bgcolor: activeTheme.backgroundPaper,
            color: open ? '#0B63E5' : '#64748B',
            fontSize: 10.5,
            fontWeight: 700,
            lineHeight: 1,
            zIndex: 1,
          }}
        >
          {label}
        </Typography>
        <Box
          component="button"
          type="button"
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          sx={{
            width: '100%',
            height: 40,
            borderRadius: 1.2,
            border: '1px solid',
            borderColor: open ? '#0B63E5' : '#CBD5E1',
            bgcolor: disabled ? '#F8FAFC' : activeTheme.backgroundPaper,
            color: value ? '#1F2937' : '#64748B',
            fontSize: 13.5,
            fontWeight: 600,
            px: 1.5,
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: disabled ? 'default' : 'pointer',
            outline: 'none',
            boxShadow: open ? '0 0 0 1px #0B63E5 inset' : 'none',
            '&:hover': { borderColor: disabled ? '#CBD5E1' : '#93B4E7' },
          }}
        >
          <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', pr: 1 }}>
            {selectedLabel || 'Select...'}
          </Box>
          <KeyboardArrowDownIcon sx={{ color: '#64748B', fontSize: 20, transform: open ? 'rotate(180deg)' : 'none' }} />
        </Box>

        {open ? (
          <Paper
            elevation={0}
            sx={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              zIndex: 1800,
              borderRadius: 1.2,
              border: '1px solid #D8DEE8',
              boxShadow: '0 14px 32px rgba(15, 23, 42, 0.16)',
              overflow: 'hidden',
              bgcolor: activeTheme.backgroundPaper,
            }}
          >
            {menuOptions.map((option) => (
              <Box
                key={option.value || '__empty'}
                component="button"
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                sx={{
                  width: '100%',
                  minHeight: 36,
                  px: 1.5,
                  border: 0,
                  appearance: 'none',
                  bgcolor: option.value === value ? '#EAF1FF' : activeTheme.backgroundPaper,
                  color: option.value === value ? '#0B63E5' : '#1F2937',
                  fontSize: 13.5,
                  fontWeight: option.value === value ? 800 : 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline: 'none',
                  '&:hover': { bgcolor: '#EFF6FF' },
                  '&:focus': { bgcolor: option.value === value ? '#EAF1FF' : activeTheme.backgroundPaper },
                  '&:focus-visible': {
                    bgcolor: '#EFF6FF',
                    boxShadow: 'inset 3px 0 0 #0B63E5',
                  },
                }}
              >
                {option.label}
              </Box>
            ))}
          </Paper>
        ) : null}
      </Box>
    </ClickAwayListener>
  );
}

function WorkOrderSparePartsTab({
  selectedParts,
  onSelectedPartsChange,
  onOpenInventoryPart,
  isReadyForPickUp = false,
  onPickUp,
}: {
  selectedParts: SelectedSparePart[];
  onSelectedPartsChange: (parts: SelectedSparePart[]) => void;
  onOpenInventoryPart?: (part: SparePartOption | SelectedSparePart) => void;
  isReadyForPickUp?: boolean;
  onPickUp?: () => void;
}) {
  const [partSearch, setPartSearch] = useState('');
  const normalizedSearch = partSearch.trim().toLowerCase();
  const filteredParts = sparePartOptions.filter((part) =>
    normalizedSearch && `${part.code} ${part.description} ${part.location}`.toLowerCase().includes(normalizedSearch)
  );
  const selectedPartIds = new Set(selectedParts.map((part) => part.id));

  const addPart = (part: SparePartOption) => {
    if (selectedPartIds.has(part.id) || part.availableQuantity === 0) return;
    onSelectedPartsChange([
      ...selectedParts,
      {
        ...part,
        requestedQuantity: Math.min(part.defaultRequestedQuantity, part.availableQuantity),
      },
    ]);
  };

  const requestUnavailablePart = (part: SparePartOption) => {
    if (selectedPartIds.has(part.id) || part.availableQuantity > 0) return;
    onSelectedPartsChange([
      ...selectedParts,
      {
        ...part,
        requestedQuantity: 0,
        sparePartActionStatus: 'requested',
      },
    ]);
  };

  const reservePart = (partId: string) => {
    onSelectedPartsChange(
      selectedParts.map((part) =>
        part.id === partId
          ? { ...part, sparePartActionStatus: 'reserved' }
          : part
      )
    );
  };

  const removePart = (partId: string) => {
    onSelectedPartsChange(selectedParts.filter((part) => part.id !== partId));
  };

  const changeRequestedQuantity = (partId: string, direction: 1 | -1) => {
    onSelectedPartsChange(
      selectedParts.map((part) =>
        part.id === partId
          ? {
              ...part,
              requestedQuantity: Math.max(1, Math.min(part.availableQuantity, part.requestedQuantity + direction)),
            }
          : part
      )
    );
  };

  const renderPartRow = (part: SparePartOption | SelectedSparePart, options?: { selected?: boolean; showQuantityControls?: boolean; rowStatusLabel?: string }) => {
    const isSelected = options?.selected ?? false;
    const showQuantityControls = options?.showQuantityControls ?? false;
    const requestedQuantity = 'requestedQuantity' in part ? part.requestedQuantity : 0;
    const isUnavailable = part.availableQuantity === 0;
    const selectedPart = selectedParts.find((selectedItem) => selectedItem.id === part.id);
    const status = ('sparePartActionStatus' in part && part.sparePartActionStatus) || selectedPart?.sparePartActionStatus;
    const statusStyles = status === 'requested'
      ? { label: 'Requested', bgcolor: '#FEF3C7', color: '#92400E', border: '#FCD34D' }
      : status === 'reserved'
        ? (isReadyForPickUp
          ? null
          : { label: 'Reserved', bgcolor: '#ECFDF5', color: '#047857', border: '#A7F3D0' })
        : status === 'picked'
          ? { label: 'Picked', bgcolor: '#ECFDF5', color: '#047857', border: '#A7F3D0' }
          : null;

    return (
      <Paper
        key={part.id}
        elevation={0}
        onClick={() => onOpenInventoryPart?.(part)}
        sx={{
          minHeight: 36,
          px: 1.1,
          py: 0.7,
          borderRadius: 1.35,
          border: `1px solid ${isSelected ? '#C9DAF8' : '#D9E2EC'}`,
          bgcolor: isSelected ? '#F8FBFF' : '#F7F9FC',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          columnGap: 1,
        }}
      >
        <Typography
          noWrap
          sx={{
            color: '#4B5563',
            fontSize: 13,
            fontWeight: 800,
            lineHeight: 1.2,
            minWidth: 0,
          }}
        >
          <Box component="span" sx={{ color: '#6B7280' }}>
            {part.code}
          </Box>{' '}
          {part.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, flexShrink: 0 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#2563EB', flexShrink: 0 }} />
            <Typography sx={{ color: '#374151', fontSize: 12, fontWeight: 800, lineHeight: 1 }}>
              {part.location}
            </Typography>
          </Box>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.35 }}>
            <InventoryDrawerIcon sx={{ fontSize: 13, color: '#2563EB' }} />
            <Typography sx={{ color: '#374151', fontSize: 12, fontWeight: 800, lineHeight: 1 }}>
              {showQuantityControls ? `${requestedQuantity}/${part.availableQuantity}` : `0/${part.availableQuantity}`}
            </Typography>
          </Box>
          {statusStyles ? (
            <Chip
              label={statusStyles.label}
              size="small"
              sx={{ height: 20, borderRadius: 99, bgcolor: statusStyles.bgcolor, color: statusStyles.color, border: `1px solid ${statusStyles.border}`, fontSize: 10, fontWeight: 900 }}
            />
          ) : null}

          {isUnavailable && isSelected ? (
            <Tooltip title="Remove part">
              <IconButton
                size="small"
                onClick={(event) => {
                  event.stopPropagation();
                  removePart(part.id);
                }}
                aria-label={`Remove ${part.code}`}
                sx={{ color: '#EF4444', p: 0.2, ml: 0.15 }}
              >
                <DeleteIcon sx={{ fontSize: 15 }} />
              </IconButton>
            </Tooltip>
          ) : isUnavailable ? (
            <Button
              size="small"
              variant="text"
              onClick={(event) => {
                event.stopPropagation();
                requestUnavailablePart(part);
              }}
              sx={{
                color: '#0B63E5',
                borderRadius: 99,
                bgcolor: '#EFF6FF',
                fontSize: 10.5,
                fontWeight: 900,
                lineHeight: 1,
                minWidth: 0,
                px: 0.9,
                py: 0.45,
                '&:hover': { bgcolor: '#DBEAFE' },
              }}
            >
              REQUEST
            </Button>
          ) : showQuantityControls ? (
            <>
              {isReadyForPickUp && status === 'reserved' ? (
                <Button
                  size="small"
                  variant="text"
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectedPartsChange(
                      selectedParts.map((p) =>
                        p.id === part.id ? { ...p, sparePartActionStatus: 'picked' } : p
                      )
                    );
                    onPickUp?.();
                  }}
                  sx={{
                    color: '#0B63E5',
                    borderRadius: 99,
                    bgcolor: '#EFF6FF',
                    fontSize: 10.5,
                    fontWeight: 900,
                    lineHeight: 1,
                    minWidth: 0,
                    px: 0.9,
                    py: 0.45,
                    '&:hover': { bgcolor: '#DBEAFE' },
                  }}
                >
                  PICK UP
                </Button>
              ) : !statusStyles && !isReadyForPickUp ? (
                <Button
                  size="small"
                  variant="text"
                  onClick={(event) => {
                    event.stopPropagation();
                    reservePart(part.id);
                  }}
                  sx={{
                    color: '#047857',
                    borderRadius: 99,
                    bgcolor: '#ECFDF5',
                    fontSize: 10.5,
                    fontWeight: 900,
                    lineHeight: 1,
                    minWidth: 0,
                    px: 0.9,
                    py: 0.45,
                    '&:hover': { bgcolor: '#D1FAE5' },
                  }}
                >
                  RESERVE
                </Button>
              ) : null}
              <Tooltip title="Remove part">
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    removePart(part.id);
                  }}
                  aria-label={`Remove ${part.code}`}
                  sx={{ color: '#EF4444', p: 0.2, ml: 0.15 }}
                >
                  <DeleteIcon sx={{ fontSize: 15 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Decrease quantity">
                <span>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      changeRequestedQuantity(part.id, -1);
                    }}
                    disabled={requestedQuantity <= 1}
                    aria-label={`Decrease ${part.code} quantity`}
                    sx={{ color: '#0B63E5', p: 0.15, '&.Mui-disabled': { color: '#9CA3AF' } }}
                  >
                    <RemoveIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title="Increase quantity">
                <span>
                  <IconButton
                    size="small"
                    onClick={(event) => {
                      event.stopPropagation();
                      changeRequestedQuantity(part.id, 1);
                    }}
                    disabled={requestedQuantity >= part.availableQuantity}
                    aria-label={`Increase ${part.code} quantity`}
                    sx={{ color: '#0B63E5', p: 0.15, '&.Mui-disabled': { color: '#9CA3AF' } }}
                  >
                    <AddIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </span>
              </Tooltip>
            </>
          ) : (
            <Tooltip title={isSelected ? 'Already added' : 'Add part'}>
              <span>
                <IconButton
                  size="small"
                  onClick={(event) => {
                    event.stopPropagation();
                    addPart(part);
                  }}
                  disabled={isSelected || isUnavailable}
                  aria-label={`Add ${part.code}`}
                  sx={{ color: '#0B63E5', p: 0.15, ml: 0.15, '&.Mui-disabled': { color: '#9CA3AF' } }}
                >
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      </Paper>
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
      <Box>
        <Typography sx={{ color: '#626465', fontSize: 11.5, fontWeight: 700, mb: 0.45 }}>
          Search to add the item
        </Typography>
        <TextField
          size="small"
          placeholder="Part Number or Description"
          value={partSearch}
          onChange={(event) => setPartSearch(event.target.value)}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 40,
              borderRadius: 1.35,
              bgcolor: activeTheme.backgroundPaper,
              fontSize: 13,
              '& fieldset': { borderColor: '#CBD5E1' },
            },
            '& .MuiInputBase-input::placeholder': { color: '#9CA3AF', opacity: 1 },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ fontSize: 20, color: '#0B63E5' }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {selectedParts.length ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.65 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Typography sx={{ color: '#626465', fontSize: 12, fontWeight: 700 }}>
              {selectedParts.length} {selectedParts.length === 1 ? 'item' : 'items'} added
            </Typography>
          </Box>
          {selectedParts.map((part) => renderPartRow(part, { selected: true, showQuantityControls: true }))}
        </Box>
      ) : null}

      {normalizedSearch ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45 }}>
          <Typography sx={{ color: '#626465', fontSize: 12, fontWeight: 700 }}>
            {filteredParts.length} {filteredParts.length === 1 ? 'Result' : 'Results'}
          </Typography>
          {filteredParts.map((part) => renderPartRow(part, { selected: selectedPartIds.has(part.id) }))}
          {!filteredParts.length ? (
            <Paper elevation={0} sx={{ p: 1.4, borderRadius: 1, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
              <Typography sx={{ color: '#626465', fontSize: 12, fontWeight: 700 }}>
                No spare parts found.
              </Typography>
            </Paper>
          ) : null}
        </Box>
      ) : null}
    </Box>
  );
}

function RequirementPlanChip({
  label,
  kind,
  selected,
  onToggle,
}: {
  label: string;
  kind: SafetyRequirementKind | QualityRequirementKind;
  selected: boolean;
  onToggle: () => void;
}) {
  const tone = {
    ppe: { color: '#0B63E5', border: '#BFDBFE', bg: '#EFF6FF' },
    hazard: { color: '#B45309', border: '#FED7AA', bg: '#FFF7ED' },
    permit: { color: '#475569', border: '#CBD5E1', bg: '#F8FAFC' },
    validation: { color: '#047857', border: '#A7F3D0', bg: '#ECFDF5' },
    evidence: { color: '#6D28D9', border: '#DDD6FE', bg: '#F5F3FF' },
  }[kind];

  return (
    <Button
      variant="outlined"
      onClick={onToggle}
      startIcon={
        selected ? (
          <CheckIcon sx={{ fontSize: 15 }} />
        ) : kind === 'hazard' ? (
          <WarningAmberIcon sx={{ fontSize: 15 }} />
        ) : kind === 'ppe' ? (
          <SecurityIcon sx={{ fontSize: 15 }} />
        ) : (
          <InfoOutlinedIcon sx={{ fontSize: 15 }} />
        )
      }
      sx={{
        minHeight: 32,
        justifyContent: 'flex-start',
        borderRadius: 1.2,
        borderColor: selected ? tone.color : tone.border,
        bgcolor: selected ? tone.bg : activeTheme.backgroundPaper,
        color: selected ? tone.color : '#475569',
        fontSize: 11.5,
        fontWeight: 850,
        textTransform: 'none',
        px: 1,
        '& .MuiButton-startIcon': { mr: 0.45 },
        '&:hover': { borderColor: tone.color, bgcolor: tone.bg },
      }}
    >
      {label}
    </Button>
  );
}

function WorkOrderSafetyRequirementsTab({
  safetyPlan,
  onSafetyPlanChange,
}: {
  safetyPlan: WorkOrderSafetyRequirementPlan;
  onSafetyPlanChange: (plan: WorkOrderSafetyRequirementPlan) => void;
}) {
  const selectedRequirements = safetyRequirementOptions.filter((option) => safetyPlan.selectedRequirementIds.includes(option.id));
  const selectedPpeCount = selectedRequirements.filter((option) => option.kind === 'ppe').length;
  const selectedHazardCount = selectedRequirements.filter((option) => option.kind === 'hazard').length;
  const selectedPermitCount = selectedRequirements.filter((option) => option.kind === 'permit').length;

  const toggleSafetyRequirement = (optionId: string) => {
    const selectedRequirementIds = safetyPlan.selectedRequirementIds.includes(optionId)
      ? safetyPlan.selectedRequirementIds.filter((id) => id !== optionId)
      : [...safetyPlan.selectedRequirementIds, optionId];
    onSafetyPlanChange({ ...safetyPlan, selectedRequirementIds });
  };

  const renderRequirementGroup = (kind: SafetyRequirementKind, label: string) => (
    <Box sx={{ display: 'grid', gap: 0.65 }}>
      <Typography sx={{ color: '#334155', fontSize: 11.5, fontWeight: 900 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.65 }}>
        {safetyRequirementOptions
          .filter((option) => option.kind === kind)
          .map((option) => (
            <RequirementPlanChip
              key={option.id}
              label={option.label}
              kind={option.kind}
              selected={safetyPlan.selectedRequirementIds.includes(option.id)}
              onToggle={() => toggleSafetyRequirement(option.id)}
            />
          ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
      <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.5, border: '1px solid #D8E4F2', bgcolor: activeTheme.backgroundPaper }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1, alignItems: 'start', mb: 1.1 }}>
          <Box>
            <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 900 }}>
              Safety Requirements
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 650, mt: 0.15 }}>
              Planned controls required during execution.
            </Typography>
          </Box>
          <Box sx={{ display: 'inline-flex', gap: 0.45, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Chip label={`${selectedPpeCount} PPE`} size="small" sx={{ height: 20, borderRadius: 99, bgcolor: '#EFF6FF', color: '#0B63E5', border: '1px solid #BFDBFE', fontSize: 10, fontWeight: 900 }} />
            <Chip label={`${selectedHazardCount} Hazards`} size="small" sx={{ height: 20, borderRadius: 99, bgcolor: '#FFF7ED', color: '#B45309', border: '1px solid #FED7AA', fontSize: 10, fontWeight: 900 }} />
            <Chip label={`${selectedPermitCount} Permits`} size="small" sx={{ height: 20, borderRadius: 99, bgcolor: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1', fontSize: 10, fontWeight: 900 }} />
          </Box>
        </Box>

        <Box
          sx={{
            p: 1,
            mb: 1.15,
            borderRadius: 1.3,
            border: '1px solid #BFDBFE',
            bgcolor: '#EFF6FF',
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) 210px' },
            gap: 1,
            alignItems: 'center',
          }}
        >
          <Box>
            <Typography sx={{ color: '#1D4ED8', fontSize: 12.5, fontWeight: 900 }}>
              Equipment condition
            </Typography>
            <Typography sx={{ color: '#475569', fontSize: 11, fontWeight: 650, mt: 0.15 }}>
              Machine state required during maintenance.
            </Typography>
          </Box>
          <FormControl size="small" fullWidth>
            <Select
              value={safetyPlan.equipmentCondition}
              displayEmpty
              onChange={(event) => onSafetyPlanChange({ ...safetyPlan, equipmentCondition: event.target.value as EquipmentMaintenanceCondition })}
              sx={{ bgcolor: activeTheme.backgroundPaper, borderRadius: 1.1, fontSize: 12.5, fontWeight: 800, '& .MuiSelect-select': { py: 1.05, display: 'flex', alignItems: 'center' } }}
              renderValue={(selected) => selected || <Typography component="span" sx={{ color: '#94A3B8', fontSize: 12.5, fontWeight: 800 }}>Select condition</Typography>}
            >
              <MenuItem value="">
                <em>Select condition</em>
              </MenuItem>
              {equipmentMaintenanceConditionOptions.map((condition) => (
                <MenuItem key={condition} value={condition}>
                  {condition}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            p: 1,
            borderRadius: 1.3,
            border: safetyPlan.lotoRequired ? '1px solid #FCA5A5' : '1px solid #D1D5DB',
            borderLeft: safetyPlan.lotoRequired ? '4px solid #EF4444' : '4px solid #94A3B8',
            bgcolor: safetyPlan.lotoRequired ? '#FEF2F2' : '#F8FAFC',
            mb: 1.15,
          }}
        >
          <FormControlLabel
            control={<Checkbox checked={safetyPlan.lotoRequired} onChange={(event) => onSafetyPlanChange({ ...safetyPlan, lotoRequired: event.target.checked })} size="small" sx={{ color: '#EF4444', '&.Mui-checked': { color: '#EF4444' } }} />}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
                <LockIcon sx={{ color: safetyPlan.lotoRequired ? '#B91C1C' : '#64748B', fontSize: 17 }} />
                <Typography sx={{ color: safetyPlan.lotoRequired ? '#B91C1C' : '#475569', fontSize: 12.5, fontWeight: 900 }}>
                  LOTO Required
                </Typography>
              </Box>
            }
            sx={{ m: 0, mb: safetyPlan.lotoRequired ? 0.85 : 0 }}
          />
          {safetyPlan.lotoRequired ? (
            <Grid container spacing={0.8}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField size="small" label="Lockout Point" value={safetyPlan.lockoutPoint} onChange={(event) => onSafetyPlanChange({ ...safetyPlan, lockoutPoint: event.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { height: 38, borderRadius: 1.1, bgcolor: activeTheme.backgroundPaper, fontSize: 12.5 } }} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField size="small" label="Procedure" value={safetyPlan.procedure} onChange={(event) => onSafetyPlanChange({ ...safetyPlan, procedure: event.target.value })} fullWidth sx={{ '& .MuiOutlinedInput-root': { height: 38, borderRadius: 1.1, bgcolor: activeTheme.backgroundPaper, fontSize: 12.5 } }} />
              </Grid>
            </Grid>
          ) : null}
        </Box>

        <Box sx={{ display: 'grid', gap: 1.1 }}>
          {renderRequirementGroup('ppe', 'Required PPE')}
          {renderRequirementGroup('hazard', 'Known Hazards')}
          {renderRequirementGroup('permit', 'Permits Required')}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.5, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
        <TextField
          size="small"
          label="Safety notes"
          placeholder="Add isolation, access, or hazard details"
          value={safetyPlan.safetyNotes}
          onChange={(event) => onSafetyPlanChange({ ...safetyPlan, safetyNotes: event.target.value })}
          multiline
          minRows={2}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.2,
              bgcolor: activeTheme.backgroundPaper,
              fontSize: 13,
              '& fieldset': { borderColor: '#CBD5E1' },
            },
          }}
        />
      </Paper>
    </Box>
  );
}

function WorkOrderQualityRequirementsTab({
  qualityPlan,
  onQualityPlanChange,
}: {
  qualityPlan: WorkOrderQualityRequirementPlan;
  onQualityPlanChange: (plan: WorkOrderQualityRequirementPlan) => void;
}) {
  const selectedQualityRequirements = qualityRequirementOptions.filter((option) => qualityPlan.selectedRequirementIds.includes(option.id));
  const selectedValidationCount = selectedQualityRequirements.filter((option) => option.kind === 'validation').length;
  const selectedEvidenceCount = selectedQualityRequirements.filter((option) => option.kind === 'evidence').length;

  const toggleQualityRequirement = (optionId: string) => {
    const selectedRequirementIds = qualityPlan.selectedRequirementIds.includes(optionId)
      ? qualityPlan.selectedRequirementIds.filter((id) => id !== optionId)
      : [...qualityPlan.selectedRequirementIds, optionId];
    onQualityPlanChange({ ...qualityPlan, selectedRequirementIds });
  };

  const renderQualityRequirementGroup = (kind: QualityRequirementKind, label: string) => (
    <Box sx={{ display: 'grid', gap: 0.65 }}>
      <Typography sx={{ color: '#334155', fontSize: 11.5, fontWeight: 900 }}>
        {label}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.65 }}>
        {qualityRequirementOptions
          .filter((option) => option.kind === kind)
          .map((option) => (
            <RequirementPlanChip
              key={option.id}
              label={option.label}
              kind={option.kind}
              selected={qualityPlan.selectedRequirementIds.includes(option.id)}
              onToggle={() => toggleQualityRequirement(option.id)}
            />
          ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
      <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.5, border: '1px solid #D8E4F2', bgcolor: activeTheme.backgroundPaper }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 1, alignItems: 'start', mb: 1 }}>
          <Box>
            <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 900 }}>
              Quality Requirements
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 650, mt: 0.15 }}>
              Planned validation and evidence requirements.
            </Typography>
          </Box>
          <Box sx={{ display: 'inline-flex', gap: 0.45, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Chip label={`${selectedValidationCount} Validations`} size="small" sx={{ height: 20, borderRadius: 99, bgcolor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontSize: 10, fontWeight: 900 }} />
            <Chip label={`${selectedEvidenceCount} Evidence`} size="small" sx={{ height: 20, borderRadius: 99, bgcolor: '#F5F3FF', color: '#6D28D9', border: '1px solid #DDD6FE', fontSize: 10, fontWeight: 900 }} />
          </Box>
        </Box>

        <Box
          sx={{
            p: 1,
            borderRadius: 1.3,
            border: qualityPlan.qualityImpacting ? '1px solid #A7F3D0' : '1px solid #D1D5DB',
            borderLeft: qualityPlan.qualityImpacting ? '4px solid #10B981' : '4px solid #94A3B8',
            bgcolor: qualityPlan.qualityImpacting ? '#ECFDF5' : '#F8FAFC',
            mb: 1.1,
          }}
        >
          <FormControlLabel
            control={<Checkbox checked={qualityPlan.qualityImpacting} onChange={(event) => onQualityPlanChange({ ...qualityPlan, qualityImpacting: event.target.checked })} size="small" sx={{ color: '#10B981', '&.Mui-checked': { color: '#10B981' } }} />}
            label={
              <Typography sx={{ color: qualityPlan.qualityImpacting ? '#047857' : '#475569', fontSize: 12.5, fontWeight: 900 }}>
                Quality Impacting
              </Typography>
            }
            sx={{ m: 0 }}
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 1.1 }}>
          {renderQualityRequirementGroup('validation', 'Required Validation')}
          {renderQualityRequirementGroup('evidence', 'Evidence Required')}
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.5, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
        <TextField
          size="small"
          label="Quality notes"
          placeholder="Add optional quality planning notes"
          value={qualityPlan.qualityNotes}
          onChange={(event) => onQualityPlanChange({ ...qualityPlan, qualityNotes: event.target.value })}
          multiline
          minRows={2}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.2,
              bgcolor: activeTheme.backgroundPaper,
              fontSize: 13,
              '& fieldset': { borderColor: '#CBD5E1' },
            },
          }}
        />
      </Paper>
    </Box>
  );
}

function MaintenanceRequestMetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ color: '#64748B', fontSize: 10.5, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>
        {label}
      </Typography>
      <Typography noWrap sx={{ color: '#111827', fontSize: 12.8, fontWeight: 900, lineHeight: 1.25, mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

function MaintenanceRequestSummaryCard({
  details,
  whatHappened,
}: {
  details: ReturnType<typeof getMaintenanceRequestDetails>;
  whatHappened: string;
}) {
  const [isCavityCheckOpen, setIsCavityCheckOpen] = useState(false);
  const moldingDetails = details.moldingDetails;

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mb: 1.4,
          p: 1.35,
          borderRadius: 1.5,
          border: '1px solid #D8E4F2',
          bgcolor: activeTheme.backgroundPaper,
        }}
      >
        <Box sx={{ mb: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#111827', fontSize: 17, fontWeight: 950, lineHeight: 1.15 }}>
              {details.equipment}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1, mb: 1.05 }}>
          <MaintenanceRequestMetaItem label="Maintenance type" value={details.maintenanceType} />
          <MaintenanceRequestMetaItem label="Location" value={details.location} />
          <MaintenanceRequestMetaItem label="Created by" value={details.createdBy} />
          <MaintenanceRequestMetaItem label="Activity" value={details.activityType} />
        </Box>

        {moldingDetails ? (
          <Box sx={{ mt: 1.2, mb: 1.05, p: 1.2, border: '1px solid #DBEAFE', borderRadius: 1.5, bgcolor: '#F8FAFC' }}>
            <Typography sx={{ fontSize: 13, fontWeight: 900, color: '#1D4ED8', mb: 1 }}>
              Molding Details
            </Typography>
            <MoldingRequestReadOnlyField label="Equipment ID" value={moldingDetails.equipmentId} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
              <MoldingRequestReadOnlyField label="Mold ID" value={moldingDetails.moldId} />
              <MoldingRequestReadOnlyField label="Product or part number" value={moldingDetails.productOrPartNumber} />
            </Box>
            <MoldingRequestReadOnlyField label="Production batch number" value={moldingDetails.productionBatchNumber} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.3fr 0.7fr' }, gap: 1 }}>
              <MoldingCavityField value={moldingDetails.affectedCavityNumbers} onCavityCheckClick={() => setIsCavityCheckOpen(true)} />
              <MoldingRequestReadOnlyField label="Rejected quantity" value={moldingDetails.rejectedQuantity} />
            </Box>
            <MoldingRequestReadOnlyField label="Issue type" value={moldingDetails.issueType} />
            <MoldingRequestReadOnlyField label="Issue description" value={moldingDetails.issueDescription} multiline />
            <MoldingRequestReadOnlyField label="Rejection reason" value={moldingDetails.rejectionReason} />
            <MoldingRequestReadOnlyField label="Detection date and time" value={moldingDetails.detectionDateTime} />
            <MoldingAttachmentsDropzone attachments={moldingDetails.attachments} />
          </Box>
        ) : null}

        <Box sx={{ p: 1, borderRadius: 1.2, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
          <Typography sx={{ color: '#64748B', fontSize: 10.5, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>
            What happened
          </Typography>
          <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 750, lineHeight: 1.35, mt: 0.35 }}>
            {whatHappened}
          </Typography>
        </Box>
      </Paper>
      {moldingDetails ? (
        <MoldingCavityCheckDialog
          open={isCavityCheckOpen}
          details={moldingDetails}
          onClose={() => setIsCavityCheckOpen(false)}
        />
      ) : null}
    </>
  );
}

function MoldingRequestReadOnlyField({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <Box sx={{ position: 'relative', mt: 0.8, border: '1px solid #CBD5E1', borderRadius: 1, bgcolor: activeTheme.backgroundPaper, px: 1.2, py: multiline ? 1.15 : 0.9, minHeight: multiline ? 74 : 40 }}>
      <Typography
        component="span"
        sx={{
          position: 'absolute',
          top: -8,
          left: 10,
          px: 0.45,
          bgcolor: '#F8FAFC',
          color: '#64748B',
          fontSize: 10,
          fontWeight: 750,
          lineHeight: 1,
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ color: '#111827', fontSize: 13, fontWeight: 750, lineHeight: 1.35, whiteSpace: multiline ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {value}
      </Typography>
    </Box>
  );
}

function MoldingCavityField({ value, onCavityCheckClick }: { value: string; onCavityCheckClick: () => void }) {
  return (
    <Box sx={{ position: 'relative', mt: 0.8, border: '1px solid #2563EB', borderRadius: 1, bgcolor: activeTheme.backgroundPaper, px: 0.6, py: 0.45, minHeight: 40, boxShadow: '0 0 0 1px rgba(37, 99, 235, 0.12)' }}>
      <Typography component="span" sx={{ position: 'absolute', top: -8, left: 10, px: 0.45, bgcolor: '#F8FAFC', color: '#64748B', fontSize: 10, fontWeight: 750, lineHeight: 1 }}>
        Affected Cavity number
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', alignItems: 'center', gap: 0.7 }}>
        <Typography sx={{ color: '#111827', fontSize: 13, fontWeight: 750, px: 0.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {value}
        </Typography>
        <Button
          variant="outlined"
          onClick={onCavityCheckClick}
          startIcon={<GridOnIcon sx={{ fontSize: 15 }} />}
          sx={{
            height: 30,
            minWidth: 116,
            borderRadius: 1,
            borderColor: '#86EFAC',
            bgcolor: '#F0FDF4',
            color: '#15803D',
            fontSize: 11,
            fontWeight: 800,
            textTransform: 'none',
            px: 1.2,
            '&:hover': { borderColor: '#4ADE80', bgcolor: '#DCFCE7' },
          }}
        >
          Cavity Check
        </Button>
      </Box>
    </Box>
  );
}

function MoldingAttachmentsDropzone({ attachments }: { attachments: string[] }) {
  return (
    <Box sx={{ mt: 1.2 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 900, color: '#374151', mb: 0.7 }}>
        Attachments
      </Typography>
      <Box sx={{ minHeight: 92, border: '1px dashed #CBD5E1', borderRadius: 1.2, bgcolor: '#F9FAFB', display: 'grid', placeItems: 'center', px: 1.5, py: 1.2, textAlign: 'center' }}>
        <CloudUploadIcon sx={{ color: '#94A3B8', fontSize: 29, mb: 0.3 }} />
        <Typography sx={{ color: '#2563EB', fontSize: 11.5, fontWeight: 900 }}>
          {attachments.join(', ')}
        </Typography>
        <Typography sx={{ color: '#64748B', fontSize: 10.5, fontWeight: 650, mt: 0.25 }}>
          PDF, DOC, JPG, PNG
        </Typography>
      </Box>
    </Box>
  );
}

function MoldingCavityCheckDialog({ open, details, onClose }: { open: boolean; details: MoldingMaintenanceRequestDetails; onClose: () => void }) {
  const selectedCavities = details.affectedCavityNumbers.split(',').map((item) => item.trim()).filter(Boolean);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: '#111827', fontSize: 16, fontWeight: 900 }}>
        <GridOnIcon sx={{ fontSize: 18, color: '#16A34A' }} />
        Cavity Check
      </DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1, mb: 1.2 }}>
          <MoldingRequestReadOnlyField label="Mold Number" value={details.moldId} />
          <MoldingRequestReadOnlyField label="Machine #" value={details.equipmentId} />
        </Box>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.8 }}>
          {Array.from({ length: 8 }, (_, index) => String(index + 1)).map((cavity) => {
            const selected = selectedCavities.includes(cavity);
            return (
              <Box
                key={cavity}
                sx={{
                  height: 42,
                  borderRadius: 1,
                  border: `1px solid ${selected ? '#16A34A' : '#CBD5E1'}`,
                  bgcolor: selected ? '#F0FDF4' : activeTheme.backgroundPaper,
                  color: selected ? '#15803D' : '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                Cavity {cavity}
              </Box>
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid #E5EAF2' }}>
        <Button onClick={onClose} sx={{ color: '#2563EB', fontWeight: 900, textTransform: 'none' }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function MaintenanceRequestSelectField({ label, value }: { label: string; value: string }) {
  return (
    <FormControl size="small" fullWidth>
      <InputLabel>{label}</InputLabel>
      <Select
        label={label}
        value={value}
        MenuProps={drawerSelectMenuProps}
        sx={{
          height: 32,
          borderRadius: 1,
          bgcolor: activeTheme.backgroundPaper,
          color: '#374151',
          fontSize: 12,
          '& .MuiSelect-select': { fontWeight: 700, py: 0.7 },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
        }}
      >
        <MenuItem value={value}>{value}</MenuItem>
      </Select>
    </FormControl>
  );
}

function MaintenanceAttachmentPreview() {
  return (
    <Box
      component="img"
      src={maintenanceFollowUpAttachmentSrc}
      alt="Maintenance request attachment"
      sx={{
        width: '100%',
        height: 208,
        borderRadius: 1,
        border: '1px solid #D1D5DB',
        objectFit: 'cover',
        display: 'block',
      }}
    />
  );
}

type MaintenanceRequestCardContext = Partial<{
  requestId: string;
  maintenanceType: string;
  location: string;
  createdBy: string;
  activityType: string;
  downtime: string;
  quality: string;
  ehs: string;
  equipment: string;
}>;

function getMaintenanceRequestDetails(card: MaintenanceCard) {
  const cardMeta = getBoardCardMeta(card);
  const moldingDetails = moldingMaintenanceRequestDetailsByCardId[card.id];
  const requestContext = (card as MaintenanceCard & { requestContext?: MaintenanceRequestCardContext }).requestContext;

  return {
    requestId: requestContext?.requestId ?? (card.id === 'mr-1' ? 'MR 123456789' : cardMeta.requestId),
    maintenanceType: requestContext?.maintenanceType ?? cardMeta.type,
    location: requestContext?.location ?? (cardMeta.location === 'Molding' ? 'Molding' : cardMeta.location === 'Z2' ? 'Zone 2 - Line A' : 'Zone 1 - Line A'),
    priority: card.priority,
    equipment: requestContext?.equipment ?? `${card.title}${card.id === 'mr-1' ? ' - A' : ''}`,
    state: 'Maintenance Request',
    createdBy: requestContext?.createdBy ?? `${card.assignee}, ${maintenanceRequestCreatedAtByCard[card.id] ?? laneCreatedAtFallbacks.requests}`,
    activityType: requestContext?.activityType ?? (card.id === 'mr-1' ? 'Mechanical' : card.priority === 'Emergency' ? 'Mechanical' : 'Inspection'),
    downtime: requestContext?.downtime ?? (card.priority === 'Emergency' ? 'High' : 'Low'),
    quality: requestContext?.quality ?? (card.id === 'mr-1' ? 'Medium' : card.priority === 'Emergency' ? 'High' : 'Medium'),
    ehs: requestContext?.ehs ?? (card.priority === 'Low' || card.priority === 'Very Low' ? 'Low' : 'Medium'),
    moldingDetails,
  };
}

const planningAgentSafetyPlan = {
  ...scheduledWorkOrderSafetyPlan,
  requirements: ['Safety glasses', 'Cut-resistant gloves', 'Electrical PPE', 'Pinch point awareness'],
};

const planningAgentQualityPlan = {
  ...scheduledWorkOrderQualityPlan,
  requirements: ['Visual inspection', 'Measurement verification', 'Photo evidence'],
};

function resolvePlanningSourceRequestCardId(card: MaintenanceCard) {
  if (card.id.startsWith('wo-planning-')) {
    return card.id.replace('wo-planning-', '');
  }
  return undefined;
}

function resolveRequestCardForPlanning(card: MaintenanceCard, source: PlanningAgentSource) {
  if (source === 'request') return card;
  const sourceRequestCardId = resolvePlanningSourceRequestCardId(card);
  if (!sourceRequestCardId) return undefined;
  return maintenanceLaneData.requests.find((requestCard) => requestCard.id === sourceRequestCardId);
}

function buildBoardPlanningAgentContext(card: MaintenanceCard, source: PlanningAgentSource): PlanningAgentContext {
  const requestCard = resolveRequestCardForPlanning(card, source) ?? card;
  const details = getMaintenanceRequestDetails(requestCard);
  const technicianSkills = Object.fromEntries(
    assignmentPeopleOptions.map((person) => [
      person.name,
      getPlannerStaffSkillMatrix(person.name).flatMap((category) => category.skills.map((skill) => skill.skill)),
    ]),
  );

  return buildPlanningAgentContext({
    card,
    source,
    requestCardId: requestCard.id,
    requestDetails: {
      ...details,
      problemDescription: requestCard.detail,
    },
    equipmentCriticality: card.equipmentCriticality ?? boardCardGradeById[card.id] ?? boardCardGradeById[requestCard.id] ?? 'B',
    linkedWorkCandidates,
    technicianAvailability,
    sparePartOptions,
    defaultSafetyPlan: planningAgentSafetyPlan,
    defaultQualityPlan: planningAgentQualityPlan,
    defaultExecutionDay: scheduledWorkOrderDay,
    technicianSkills,
  });
}

function buildBoardDemoPlanningAgentContext(): PlanningAgentContext {
  const technicianSkills = Object.fromEntries(
    assignmentPeopleOptions.map((person) => [
      person.name,
      getPlannerStaffSkillMatrix(person.name).flatMap((category) => category.skills.map((skill) => skill.skill)),
    ]),
  );

  return buildDemoSa204PlanningContext({
    linkedWorkCandidates,
    technicianAvailability,
    sparePartOptions,
    defaultSafetyPlan: planningAgentSafetyPlan,
    defaultQualityPlan: planningAgentQualityPlan,
    defaultExecutionDay: scheduledWorkOrderDay,
    technicianSkills,
  });
}

function mapPlanningTechnicianToAssignee(technicianName: string) {
  return assignmentPeopleOptions.find((person) => person.name === technicianName);
}

function buildWorkOrderDraftFromPlannedWorkOrder(plan: PlannedWorkOrder, baseDraft: WorkOrderDraft): WorkOrderDraft {
  const assignee = plan.technician ? mapPlanningTechnicianToAssignee(plan.technician.name) : undefined;

  return {
    ...baseDraft,
    maintenanceType: plan.maintenanceType,
    equipment: plan.equipment,
    equipmentCriticality: plan.equipmentCriticality,
    problemDescription: plan.description,
    activityType: baseDraft.activityType || 'Mechanical',
    downtime: plan.riskAssessment.downtime,
    quality: plan.riskAssessment.quality,
    ehs: plan.riskAssessment.ehs,
    priority: plan.priority,
    responsibleAssignee: assignee,
    scheduledExecutionDay: plan.executionDay,
    selectedSpareParts: plan.spareParts.map((part) => ({
      id: part.id,
      code: part.code,
      description: part.description,
      location: part.location,
      availableQuantity: part.availableQuantity,
      defaultRequestedQuantity: part.requestedQuantity,
      requestedQuantity: part.requestedQuantity,
    })),
    linkedWorkOrders: plan.linkedWorkOrderOrPm ? [plan.linkedWorkOrderOrPm] : [],
    safetyRequirementPlan: {
      equipmentCondition: plan.safetyRequirements.equipmentCondition as WorkOrderSafetyRequirementPlan['equipmentCondition'],
      lotoRequired: plan.safetyRequirements.lotoRequired,
      lockoutPoint: plan.safetyRequirements.lockoutPoint,
      procedure: plan.safetyRequirements.procedure,
      selectedRequirementIds: plan.safetyRequirements.selectedRequirementIds,
      safetyNotes: plan.safetyRequirements.safetyNotes,
    },
    qualityRequirementPlan: {
      qualityImpacting: plan.qualityRequirements.qualityImpacting,
      selectedRequirementIds: plan.qualityRequirements.selectedRequirementIds,
      qualityNotes: plan.qualityRequirements.qualityNotes,
    },
  };
}

const emptyWorkOrderDraft: WorkOrderDraft = {
  sourceCardId: undefined,
  sourceRequestCardId: undefined,
  sourceRequestId: undefined,
  drawerTitle: undefined,
  statusLabel: undefined,
  drawerMode: 'planning',
  isMaintenanceTypeLocked: false,
  attachmentSrc: undefined,
  maintenanceType: 'Corrective',
  equipment: '',
  equipmentCriticality: undefined,
  responsibleName: undefined,
  problemDescription: '',
  activityType: '',
  downtime: '',
  quality: '',
  ehs: '',
  priority: '',
  responsibleAssignee: undefined,
  additionalAssignees: [],
  scheduledExecutionDay: undefined,
  selectedSpareParts: [],
  linkedWorkOrders: [],
  safetyRequirementPlan: emptySafetyRequirementPlan,
  qualityRequirementPlan: emptyQualityRequirementPlan,
  pauseContext: undefined,
  resumeHistory: [],
};

export function buildWorkOrderDraftFromRequest(card: MaintenanceCard): WorkOrderDraft {
  const details = getMaintenanceRequestDetails(card);

  return {
    sourceRequestCardId: card.id,
    sourceRequestId: details.requestId,
    attachmentSrc: maintenanceFollowUpAttachmentSrc,
    maintenanceType: details.maintenanceType,
    equipment: details.equipment,
    equipmentCriticality: card.equipmentCriticality ?? boardCardGradeById[card.id] ?? 'A',
    responsibleName: card.assignee,
    problemDescription: card.detail,
    activityType: details.activityType,
    downtime: details.downtime,
    quality: details.quality,
    ehs: details.ehs,
    priority: details.priority,
    additionalAssignees: [],
    safetyRequirementPlan: emptySafetyRequirementPlan,
    qualityRequirementPlan: emptyQualityRequirementPlan,
  };
}

function buildPlanningWorkOrderFromRequest(card: MaintenanceCard): MaintenanceCard {
  return {
    ...card,
    id: `wo-planning-${card.id}`,
    assignee: '-',
    due: 'Awaiting planning',
  };
}

function buildScheduledWorkOrderFromDraft(draft: WorkOrderDraft): MaintenanceCard {
  const equipmentConditionTags = draft.safetyRequirementPlan.equipmentCondition ? [draft.safetyRequirementPlan.equipmentCondition] : [];

  return {
    id: `wo-scheduled-${draft.sourceRequestCardId ?? Date.now()}`,
    title: draft.equipment || 'New Work Order',
    detail: draft.problemDescription,
    assignee: draft.responsibleAssignee?.name ?? '-',
    due: draft.scheduledExecutionDay?.fullLabel ?? 'Scheduled',
    priority: (draft.priority as MaintenancePriority) || 'Medium',
    equipmentCriticality: draft.equipmentCriticality,
    tags: equipmentConditionTags,
  };
}

function buildScheduledWorkOrderSpareParts(): SelectedSparePart[] {
  return scheduledWorkOrderSparePartIds
    .map((partId) => {
      const part = sparePartOptions.find((option) => option.id === partId);
      return part
        ? {
            ...part,
            requestedQuantity: scheduledWorkOrderSparePartQuantities[partId],
          }
        : undefined;
    })
    .filter((part): part is SelectedSparePart => Boolean(part));
}

function buildLinkedWorkOrdersForScheduledCard(card: MaintenanceCard): MaintenanceLinkedWorkCandidate[] {
  const linkedCardId = card.id === 'std-1' ? 'std-2' : card.id === 'std-2' ? 'std-1' : undefined;
  const linkedCard = linkedCardId
    ? maintenanceLaneData.team.scheduled.find((scheduledCard) => scheduledCard.id === linkedCardId)
    : undefined;

  if (!linkedCard) return [];

  return [
    {
      id: linkedCard.id,
      type: 'Corrective',
      title: `${getBoardCardMeta(linkedCard).requestId} - ${linkedCard.title}`,
      description: linkedCard.detail,
      scheduledFor: getPriorityDueDateLabel(linkedCard, 'scheduled'),
      assignee: linkedCard.assignee,
      status: 'Scheduled',
    },
  ];
}

function buildLinkedWorkOrdersForPlanningCard(card: MaintenanceCard): MaintenanceLinkedWorkCandidate[] {
  const cardMeta = getBoardCardMeta(card);
  const linkedType = cardMeta.type === 'Breakdown' ? 'Breakdown' : 'Corrective';

  return [
    {
      id: `${card.id}-linked-same-day`,
      type: linkedType,
      title: `${cardMeta.requestId} - ${card.title}`,
      description: card.detail,
      scheduledFor: getPriorityDueDateLabel(card, 'planning'),
      assignee: card.assignee && card.assignee !== '-' ? card.assignee : 'Bruno Aquino',
      status: 'Scheduled',
    },
  ];
}

function normalizeWidgetWorkOrderType(type: string): WorkOrder['type'] {
  return type === 'Breakdown' || type === 'Preventive' ? type : 'Corrective';
}

function buildWidgetSpareParts(selectedParts: SelectedSparePart[]): WorkOrder['partsNeeded'] {
  return selectedParts.map((part) => ({
    id: part.code,
    name: part.description,
    location: part.location,
    available: part.availableQuantity,
    total: Math.max(part.availableQuantity, part.requestedQuantity),
    quantity: part.requestedQuantity,
  }));
}

function buildWidgetLinkedWorkOrders(linkedWorkOrders: MaintenanceLinkedWorkCandidate[]): LinkedWorkOrder[] {
  return linkedWorkOrders.map((linkedWorkOrder) => ({
    id: linkedWorkOrder.title.match(/WO\s+\d+/)?.[0] ?? linkedWorkOrder.id,
    type: normalizeWidgetWorkOrderType(linkedWorkOrder.type),
    title: linkedWorkOrder.title,
    description: linkedWorkOrder.description,
    scheduledFor: linkedWorkOrder.scheduledFor,
    assignee: linkedWorkOrder.assignee,
    status: linkedWorkOrder.status,
    targetWorkOrderId: linkedWorkOrder.title.match(/WO\s+\d+/)?.[0],
  }));
}

function buildWidgetWorkOrderCandidates(linkedWorkOrders: MaintenanceLinkedWorkCandidate[]): WorkOrderLinkCandidate[] {
  return buildWidgetLinkedWorkOrders(linkedWorkOrders).map((linkedWorkOrder) => ({
    ...linkedWorkOrder,
    priority: 'Medium',
  }));
}

function buildWidgetSafetyRequirements(safetyPlan: WorkOrderSafetyRequirementPlan): WorkOrder['safetyRequirements'] {
  const selectedOptions = safetyRequirementOptions.filter((option) => safetyPlan.selectedRequirementIds.includes(option.id));

  return {
    equipmentCondition: safetyPlan.equipmentCondition,
    lotoRequired: safetyPlan.lotoRequired,
    lockoutPoint: safetyPlan.lockoutPoint,
    procedure: safetyPlan.procedure,
    ppe: selectedOptions.filter((option) => option.kind === 'ppe').map((option) => option.label),
    hazards: selectedOptions.filter((option) => option.kind === 'hazard').map((option) => option.label),
    permits: selectedOptions.filter((option) => option.kind === 'permit').map((option) => option.label),
    safetyNotes: safetyPlan.safetyNotes,
  };
}

function buildWidgetQualityRequirements(qualityPlan: WorkOrderQualityRequirementPlan): NonNullable<WorkOrder['qualityRequirements']> {
  const selectedOptions = qualityRequirementOptions.filter((option) => qualityPlan.selectedRequirementIds.includes(option.id));

  return {
    qualityImpacting: qualityPlan.qualityImpacting,
    requiredValidation: selectedOptions.filter((option) => option.kind === 'validation').map((option) => option.label),
    evidenceRequired: selectedOptions.filter((option) => option.kind === 'evidence').map((option) => option.label),
    qaApprovalRequired: qualityPlan.selectedRequirementIds.includes('qa-approval-required'),
    qualityNotes: qualityPlan.qualityNotes,
  };
}

function buildWidgetWorkOrderFromDraft(draft: WorkOrderDraft, selectedParts: SelectedSparePart[]): WorkOrder {
  const workOrderId = draft.drawerTitle ?? draft.sourceRequestId ?? draft.sourceCardId ?? 'WO Draft';
  const qualityRequirements = buildWidgetQualityRequirements(draft.qualityRequirementPlan);

  return {
    id: workOrderId,
    title: draft.equipment || workOrderId,
    type: normalizeWidgetWorkOrderType(draft.maintenanceType),
    typeColor: draft.maintenanceType === 'Breakdown' ? '#EF343D' : '#2878FF',
    accent: draft.maintenanceType === 'Breakdown' ? '#EF343D' : '#2878FF',
    location: 'Autoguard Line 10',
    date: draft.scheduledExecutionDay?.fullLabel ?? 'Scheduled',
    equipment: draft.equipment || 'Equipment not selected',
    equipmentCriticality: draft.equipmentCriticality ?? (draft.priority === 'Emergency' || draft.priority === 'Immediate' ? 'A' : 'B'),
    activityType: draft.activityType || 'Mechanical',
    priority: getPriorityDisplayLabel(draft.priority || 'Medium'),
    problemDescription: draft.problemDescription,
    partsNeeded: buildWidgetSpareParts(selectedParts),
    futureActions: [],
    linkedWorkOrders: buildWidgetLinkedWorkOrders(draft.linkedWorkOrders ?? []),
    machineHistory: [
      {
        id: `${workOrderId}-history-request`,
        date: '2026-01-13 08:30',
        type: normalizeWidgetWorkOrderType(draft.maintenanceType),
        description: draft.problemDescription || 'Work order created from maintenance follow-up board.',
        responsible: draft.responsibleAssignee?.name ?? 'Maintenance Team',
      },
    ],
    attachedFiles: draft.attachmentSrc ? [{ name: 'Maintenance request image', href: draft.attachmentSrc }] : [],
    safetyRequirements: buildWidgetSafetyRequirements(draft.safetyRequirementPlan),
    qualityRequired: qualityRequirements.qualityNotes || (qualityRequirements.qualityImpacting ? 'Quality impacting work' : 'No quality impact marked'),
    qualityRequirements,
  };
}

function getAssignmentPersonByName(name: string) {
  return assignmentPeopleOptions.find((person) => person.name === name);
}

export function buildWorkOrderDraftFromBoardCard(card: MaintenanceCard, laneTitle?: string): WorkOrderDraft {
  const cardMeta = getBoardCardMeta(card);
  const reviewFeedback = Boolean(card.tags?.includes('Feedback Review'));
  const isCompletionReviewWorkOrder = laneTitle === 'Done';
  const isClosedWorkOrder = laneTitle === 'Closed';
  const isExecutionWorkOrder = laneTitle === 'Scheduled' || laneTitle === 'In Progress';
  const isLockedCorrectiveWorkOrder = laneTitle === 'Planning' || laneTitle === 'Done' || isClosedWorkOrder || isPausedWorkOrder(card);
  const responsibleAssignee = getAssignmentPersonByName(card.assignee);
  const sourceRequestCardId = card.id.startsWith('wo-planning-') ? card.id.replace('wo-planning-', '') : undefined;
  const sourceRequestDetails = sourceRequestCardId ? getMaintenanceRequestDetails({ ...card, id: sourceRequestCardId }) : undefined;
  const resolvedMaintenanceType = sourceRequestDetails?.maintenanceType ?? cardMeta.type;
  const drawerMode = isCompletionReviewWorkOrder
    ? 'completionReview'
    : isClosedWorkOrder
      ? 'closed'
      : isExecutionWorkOrder
      ? 'scheduledExecution'
      : 'planning';

  return {
    sourceCardId: card.id,
    sourceRequestCardId,
    sourceRequestId: sourceRequestDetails?.requestId ?? cardMeta.requestId,
    drawerTitle: sourceRequestDetails?.requestId ?? cardMeta.requestId,
    statusLabel: isPausedWorkOrder(card) ? 'Paused' : reviewFeedback ? 'Feedback Review' : laneTitle,
    drawerMode,
    isMaintenanceTypeLocked: isLockedCorrectiveWorkOrder,
    attachmentSrc: maintenanceFollowUpAttachmentSrc,
    maintenanceType: resolvedMaintenanceType,
    equipment: card.title,
    equipmentCriticality: card.equipmentCriticality ?? boardCardGradeById[card.id] ?? 'A',
    responsibleName: card.assignee,
    problemDescription: card.detail,
    activityType: card.priority === 'Emergency' ? 'Mechanical' : 'Mechanical',
    downtime: card.priority === 'Emergency' ? 'High' : 'Low',
    quality: card.priority === 'Emergency' ? 'High' : 'Medium',
    ehs: card.priority === 'Low' || card.priority === 'Very Low' ? 'Low' : 'Medium',
    priority: card.priority,
    responsibleAssignee: isExecutionWorkOrder || isCompletionReviewWorkOrder || isClosedWorkOrder ? responsibleAssignee : undefined,
    additionalAssignees: [],
    scheduledExecutionDay: isExecutionWorkOrder || isCompletionReviewWorkOrder || isClosedWorkOrder
      ? scheduledWorkOrderDay
      : undefined,
    selectedSpareParts: isExecutionWorkOrder || isCompletionReviewWorkOrder || isClosedWorkOrder ? buildScheduledWorkOrderSpareParts() : [],
    linkedWorkOrders: isExecutionWorkOrder ? buildLinkedWorkOrdersForScheduledCard(card) : drawerMode === 'planning' ? buildLinkedWorkOrdersForPlanningCard(card) : [],
    safetyRequirementPlan: isExecutionWorkOrder || isCompletionReviewWorkOrder || isClosedWorkOrder ? scheduledWorkOrderSafetyPlan : emptySafetyRequirementPlan,
    qualityRequirementPlan: isExecutionWorkOrder || isCompletionReviewWorkOrder || isClosedWorkOrder ? scheduledWorkOrderQualityPlan : emptyQualityRequirementPlan,
    pauseContext: isPausedWorkOrder(card) ? pauseContextByWorkOrderId[card.id] : undefined,
    resumeHistory: [],
    reviewFeedback,
    rejectedReviewSections: [],
  };
}

function PauseDetail({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ color: '#92400E', fontSize: 10.5, fontWeight: 900, lineHeight: 1.1, textTransform: 'uppercase' }}>
        {label}
      </Typography>
      <Typography sx={{ color: '#3F3F46', fontSize: 12.5, fontWeight: 750, lineHeight: 1.25, mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

function PausedWorkOrderBlock({
  pauseContext,
  resumeHistory = [],
  onViewHistory,
  onResume,
}: {
  pauseContext: WorkOrderPauseContext;
  resumeHistory?: string[];
  onViewHistory: () => void;
  onResume: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 1.65,
        p: 1.35,
        borderRadius: 1.5,
        border: '1px solid #F59E0B',
        borderLeft: '4px solid #D97706',
        bgcolor: '#FFFBEB',
        boxShadow: '0 8px 22px rgba(146, 64, 14, 0.08)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.1, mb: 1.05 }}>
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, mb: 0.45, flexWrap: 'wrap' }}>
            <PausedStatusBadge />
            {pauseContext.escalation ? (
              <Box
                component="span"
                sx={{
                  height: 20,
                  px: 0.7,
                  borderRadius: 999,
                  border: '1px solid #FDBA74',
                  bgcolor: '#FFF7ED',
                  color: '#9A3412',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '0.62rem',
                  fontWeight: 900,
                  lineHeight: 1,
                }}
              >
                ESCALATED
              </Box>
            ) : null}
          </Box>
          <Typography sx={{ color: '#78350F', fontSize: 16, fontWeight: 900, lineHeight: 1.15 }}>
            Execution Paused
          </Typography>
        </Box>
        <PauseCircleIcon sx={{ color: '#D97706', fontSize: 26, mt: 0.1, flexShrink: 0 }} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1, mb: pauseContext.notes ? 1 : 1.2 }}>
        <PauseDetail label="Reason" value={pauseContext.reason} />
        <PauseDetail label="Paused by" value={pauseContext.pausedBy} />
        <PauseDetail label="Paused since" value={pauseContext.pausedSince} />
        <PauseDetail label="Expected resume" value={pauseContext.expectedResume} />
      </Box>

      {pauseContext.notes ? (
        <Box sx={{ borderTop: '1px solid #FDE68A', pt: 0.85, mb: 1.15 }}>
          <Typography sx={{ color: '#92400E', fontSize: 10.5, fontWeight: 900, lineHeight: 1.1, textTransform: 'uppercase' }}>
            Notes
          </Typography>
          <Typography sx={{ color: '#3F3F46', fontSize: 12.5, fontWeight: 650, lineHeight: 1.35, mt: 0.35 }}>
            {pauseContext.notes}
          </Typography>
        </Box>
      ) : null}

      {pauseContext.escalation ? (
        <Box sx={{ mb: 1.15, display: 'flex', alignItems: 'center', gap: 0.45, color: '#9A3412' }}>
          <AccessTimeIcon sx={{ fontSize: 15 }} />
          <Typography sx={{ color: '#9A3412', fontSize: 11.5, fontWeight: 850, lineHeight: 1.25 }}>
            {pauseContext.escalation}
          </Typography>
        </Box>
      ) : null}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8, flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant="outlined"
          onClick={onViewHistory}
          sx={{
            height: 32,
            borderRadius: 999,
            borderColor: '#F59E0B',
            color: '#92400E',
            bgcolor: activeTheme.backgroundPaper,
            fontSize: 12,
            fontWeight: 850,
            textTransform: 'none',
            '&:hover': { borderColor: '#D97706', bgcolor: '#FFF7ED' },
          }}
        >
          View Pause History{resumeHistory.length ? ` (${resumeHistory.length})` : ''}
        </Button>
        <Button
          size="small"
          variant="contained"
          startIcon={<CheckIcon sx={{ fontSize: 16 }} />}
          onClick={onResume}
          sx={{
            height: 32,
            borderRadius: 999,
            bgcolor: '#D97706',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 900,
            textTransform: 'none',
            boxShadow: 'none',
            '&:hover': { bgcolor: '#B45309', boxShadow: 'none' },
          }}
        >
          Resume Execution
        </Button>
      </Box>
    </Paper>
  );
}

function MaintenanceRequestRejectDialog({
  open,
  requestId,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  requestId: string;
  onCancel: () => void;
  onConfirm: (reason: MaintenanceRejectionReason, comment: string) => void;
}) {
  const [reason, setReason] = useState<MaintenanceRejectionReason | ''>('');
  const [comment, setComment] = useState('');
  const canConfirm = Boolean(reason && comment.trim());

  useEffect(() => {
    if (!open) {
      setReason('');
      setComment('');
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          border: '1px solid #DDE7F4',
          boxShadow: '0 24px 70px rgba(15, 23, 42, 0.22)',
        },
      }}
    >
      <DialogTitle sx={{ px: 2.4, pt: 2.2, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#111827', fontSize: 18, fontWeight: 900, lineHeight: 1.2 }}>
              Reject Maintenance Request
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 13, fontWeight: 600, lineHeight: 1.35, mt: 0.65 }}>
              Use this action when the request was opened incorrectly or should be handled as another Shift Entry type.
            </Typography>
          </Box>
          <IconButton onClick={onCancel} size="small" aria-label="Close rejection confirmation" sx={{ color: '#0B63E5', mt: -0.4 }}>
            <CloseIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ px: 2.4, pt: 0.6, pb: 1.4 }}>
        <Box
          sx={{
            mb: 1.5,
            px: 1.25,
            py: 1,
            borderRadius: 1.2,
            border: '1px solid #D6E3F5',
            bgcolor: '#F8FBFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography sx={{ color: '#64748B', fontSize: 12, fontWeight: 800 }}>
            Maintenance Request ID
          </Typography>
          <Chip
            label={requestId}
            size="small"
            sx={{
              height: 24,
              borderRadius: 99,
              bgcolor: '#EFF6FF',
              color: '#044ED7',
              border: '1px solid #BFDBFE',
              fontWeight: 900,
              fontSize: 11,
            }}
          />
        </Box>

        <FormControl size="small" fullWidth required sx={{ mb: 1.35 }}>
          <InputLabel>Rejection reason</InputLabel>
          <Select
            label="Rejection reason"
            value={reason}
            onChange={(event) => setReason(event.target.value as MaintenanceRejectionReason)}
            sx={{
              borderRadius: 1.2,
              bgcolor: activeTheme.backgroundPaper,
              '& .MuiSelect-select': { fontWeight: 700 },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#CBD5E1' },
            }}
          >
            {maintenanceRejectionReasons.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Rejection comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          required
          multiline
          minRows={4}
          fullWidth
          sx={{
            mb: 1.2,
            '& .MuiInputLabel-root': { color: '#64748B', fontWeight: 700 },
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.2,
              bgcolor: activeTheme.backgroundPaper,
              fontSize: 13,
              '& fieldset': { borderColor: '#CBD5E1' },
            },
          }}
        />

        <Typography sx={{ color: '#64748B', fontSize: 12, fontWeight: 650, lineHeight: 1.35 }}>
          Rejected requests will be closed on the board but remain tagged as Rejected in history and audit trail. The reporter will be notified so they can reassess the entry.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 2.4, py: 1.6, borderTop: '1px solid #E5EAF2', gap: 1 }}>
        <Button variant="text" onClick={onCancel} sx={{ color: '#2563EB', fontSize: 12, fontWeight: 900, textTransform: 'none' }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={!canConfirm}
          onClick={() => {
            if (!reason) return;
            onConfirm(reason, comment.trim());
          }}
          sx={{
            height: 36,
            borderRadius: 999,
            bgcolor: '#DC2626',
            color: '#FFFFFF',
            fontSize: 12,
            fontWeight: 900,
            textTransform: 'none',
            boxShadow: 'none',
            px: 2.2,
            '&:hover': { bgcolor: '#B91C1C', boxShadow: 'none' },
            '&.Mui-disabled': { bgcolor: '#FCA5A5', color: 'rgba(255,255,255,0.72)' },
          }}
        >
          Confirm rejection
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function MaintenanceRequestDrawer({
  card,
  open,
  onClose,
  onAcceptToPlanning,
  onPlanNow,
  onLinkToExistingWork,
  onReject,
}: {
  card: MaintenanceCard | null;
  open: boolean;
  onClose: () => void;
  onAcceptToPlanning: (card: MaintenanceCard) => void;
  onPlanNow: (card: MaintenanceCard) => void;
  onLinkToExistingWork: (card: MaintenanceCard, candidate: MaintenanceLinkedWorkCandidate) => void;
  onReject: (card: MaintenanceCard, reason: MaintenanceRejectionReason, comment: string) => void;
}) {
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setIsRejectDialogOpen(false);
      setIsLinkDialogOpen(false);
    }
  }, [open]);

  if (!card) return null;

  const details = getMaintenanceRequestDetails(card);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 500 },
          maxWidth: '100vw',
          bgcolor: '#F8FAFC',
          borderLeft: '1px solid #DDE7F4',
          boxShadow: '-18px 0 42px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box
          sx={{
            px: 2.25,
            pt: 2,
            pb: 1.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            bgcolor: activeTheme.backgroundPaper,
            borderBottom: '1px solid #E5EAF2',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Typography sx={{ color: '#044ED7', fontSize: 16, fontWeight: 900 }}>
              Maintenance Request
            </Typography>
            <Chip
              label={details.requestId}
              size="small"
              sx={{
                height: 22,
                borderRadius: 99,
                bgcolor: '#EFF6FF',
                color: '#044ED7',
                border: '1px solid #BFDBFE',
                fontWeight: 900,
                fontSize: 10,
                '& .MuiChip-label': { px: 0.9 },
              }}
            />
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ ...lightHeaderIconButtonSx, flexShrink: 0 }} aria-label="Close maintenance request">
            <CloseIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 2.25, pt: 1.8, pb: 2.2 }}>
          <MaintenanceRequestSummaryCard details={details} whatHappened={card.detail} />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<MicIcon sx={{ fontSize: 18 }} />}
              sx={{
                height: 32,
                borderRadius: 999,
                color: '#2563EB',
                borderColor: '#BFDBFE',
                bgcolor: '#EFF6FF',
                fontSize: 10.5,
                fontWeight: 700,
                textTransform: 'uppercase',
                px: 2,
                '&:hover': { bgcolor: '#DBEAFE', borderColor: '#93C5FD' },
              }}
            >
              Audio Description
            </Button>
          </Box>

          <Box sx={{ mb: 1.4 }}>
            <MaintenanceRequestSelectField label="Activity type" value={details.activityType} />
          </Box>

          <Typography sx={{ color: '#374151', fontSize: 13, fontWeight: 900, mb: 0.8 }}>
            Risk Assessment *
          </Typography>
          <Grid container spacing={1} sx={{ mb: 1.6 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <MaintenanceRequestSelectField label="Downtime" value={details.downtime} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <MaintenanceRequestSelectField label="Quality" value={details.quality} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <MaintenanceRequestSelectField label="EHS" value={details.ehs} />
            </Grid>
          </Grid>
          <Box sx={{ mb: 1.6 }}>
            <MaintenanceRequestSelectField label="Priority *" value={getPriorityDisplayLabel(details.priority)} />
          </Box>

          <Typography sx={{ color: '#374151', fontSize: 13, fontWeight: 900, mb: 1 }}>
            Attachments
          </Typography>
          <Box
            sx={{
              p: 0.8,
              borderRadius: 2,
              border: '1px dashed #CBD5E1',
              bgcolor: '#F9FAFB',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.8,
            }}
          >
            <MaintenanceAttachmentPreview />
          </Box>

          <Paper
            elevation={0}
            sx={{
              mt: 1,
              p: 1.15,
              borderRadius: '12px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: tokenNeutral.lightest,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, mb: 0.45 }}>
              <SparkleIcon sx={{ fontSize: 18, color: '#FF8A00' }} />
              <Typography sx={{ color: tokenBrand.main, fontSize: '14px', fontWeight: 700, lineHeight: 1.1 }}>
                BLU.AI Insight
              </Typography>
            </Box>
            <Typography sx={{ color: tokenText.primary, fontSize: '13px', fontWeight: 700, mb: 0.35 }}>
              Related work found for this equipment
            </Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: '12px', fontWeight: 400, lineHeight: 1.35 }}>
              Review preventive or corrective work already planned before creating a separate Work Order.
            </Typography>
            <Button
              size="small"
              variant="text"
              onClick={() => setIsLinkDialogOpen(true)}
              sx={{
                mt: 0.6,
                px: 0,
                minWidth: 0,
                height: 32,
                color: tokenBrand.main,
                fontSize: '13px',
                fontWeight: 700,
                textTransform: 'none',
                '&:hover': {
                  color: tokenBrand.dark,
                  bgcolor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              Review related work
            </Button>
          </Paper>
        </Box>

        <Box sx={{ px: 2.25, py: 1.5, borderTop: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, bgcolor: activeTheme.backgroundPaper }}>
          <Button
            variant="text"
            onClick={onClose}
            sx={{ height: 40, px: 2, borderRadius: '8px', color: tokenBrand.main, fontSize: 13, fontWeight: 700, textTransform: 'none', '&:hover': { bgcolor: tokenBrand.softBg } }}
          >
            Cancel
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Button
              variant="outlined"
              onClick={() => setIsRejectDialogOpen(true)}
              sx={{ height: 40, px: 3, minWidth: 104, borderRadius: '8px', color: tokenError.main, borderColor: tokenError.main, fontSize: 13, fontWeight: 700, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: tokenError.softBg, borderColor: tokenError.main, boxShadow: 'none' } }}
            >
              Reject
            </Button>
            <Button
              variant="outlined"
              onClick={() => onAcceptToPlanning(card)}
              sx={{ height: 40, px: 3, minWidth: 104, borderRadius: '8px', color: tokenBrand.main, borderColor: tokenBrand.main, fontSize: 13, fontWeight: 700, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.dark, boxShadow: 'none' } }}
            >
              Plan Later
            </Button>
            <Button
              variant="contained"
              onClick={() => onPlanNow(card)}
              sx={{ height: 40, px: 3, minWidth: 104, borderRadius: '8px', bgcolor: tokenBrand.main, color: '#FFFFFF', fontSize: 13, fontWeight: 700, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' } }}
            >
              Plan Now
            </Button>
          </Box>
        </Box>
      </Box>
      <Dialog open={isLinkDialogOpen} onClose={() => setIsLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: '#111827', fontSize: 18, fontWeight: 900, pb: 1 }}>
          Link to existing work
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
          {linkedWorkCandidates.map((candidate) => (
            <Paper
              key={candidate.id}
              elevation={0}
              sx={{
                p: 1.2,
                borderRadius: 1.5,
                border: '1px solid #D8DEE8',
                bgcolor: activeTheme.backgroundPaper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.2,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Chip
                  label={`${candidate.type} - ${candidate.status}`}
                  size="small"
                  sx={{ height: 21, mb: 0.6, bgcolor: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', fontSize: 10, fontWeight: 900 }}
                />
                <Typography sx={{ color: '#111827', fontSize: 13, fontWeight: 900, lineHeight: 1.25 }}>
                  {candidate.title}
                </Typography>
                <Typography sx={{ color: '#475569', fontSize: 11.5, fontWeight: 650, lineHeight: 1.35, mt: 0.45 }}>
                  {candidate.description}
                </Typography>
                <Typography sx={{ color: '#64748B', fontSize: 11.5, fontWeight: 700, mt: 0.3 }}>
                  {candidate.scheduledFor} - {candidate.assignee}
                </Typography>
              </Box>
              <Button
                size="small"
                variant="contained"
                onClick={() => onLinkToExistingWork(card, candidate)}
                sx={{ flexShrink: 0, borderRadius: 999, fontSize: 11.5, fontWeight: 900, textTransform: 'none', boxShadow: 'none' }}
              >
                Link
              </Button>
            </Paper>
          ))}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid #E5EAF2' }}>
          <Button onClick={() => setIsLinkDialogOpen(false)} sx={{ color: '#2563EB', fontWeight: 900, textTransform: 'none' }}>
            Keep separate
          </Button>
        </DialogActions>
      </Dialog>
      <MaintenanceRequestRejectDialog
        open={isRejectDialogOpen}
        requestId={details.requestId}
        onCancel={() => setIsRejectDialogOpen(false)}
        onConfirm={(reason, comment) => onReject(card, reason, comment)}
      />
    </Drawer>
  );
}

function AssignmentAvatar({ person, size = 32 }: { person: AssignmentPerson; size?: number }) {
  return (
    <Avatar
      sx={{
        width: size,
        height: size,
        fontSize: size > 32 ? 15 : 12,
        fontWeight: 900,
        ...getAvatarSx(person.name),
      }}
    >
      {getAssigneeInitials(person.name)}
    </Avatar>
  );
}

function getAssignmentDay(dayKey?: AssignmentDayKey) {
  return assignmentWeekDays.find((day) => day.key === dayKey);
}

const assignmentDayKeyByDateIndex: AssignmentDayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function buildAssignmentScheduledDayFromIsoDate(isoDate: string): AssignmentScheduledDay | undefined {
  const [year, month, day] = isoDate.split('-').map(Number);
  if (!year || !month || !day) return undefined;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return undefined;

  const shortLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
  const monthLabel = date.toLocaleDateString('en-US', { month: 'short' });
  const dayNumber = String(date.getDate());
  const shortDateLabel = `${monthLabel} ${dayNumber}`;

  return {
    key: assignmentDayKeyByDateIndex[date.getDay()],
    shortLabel,
    dayNumber,
    fullLabel: shortDateLabel,
    ctaLabel: shortDateLabel,
    isoDate,
  };
}

function getAssignmentWorkload(person: AssignmentPerson, day?: AssignmentScheduledDay) {
  return day ? person.weeklyWorkload[day.key] : undefined;
}

function isAssignmentWorkloadSelectable(workload?: AssignmentDayWorkload) {
  return Boolean(workload && workload.level !== 'Full' && workload.level !== 'Off');
}

function AssignmentWorkloadChip({ workload }: { workload: AssignmentDayWorkload }) {
  const tone = assignmentWorkloadTone[workload.level];

  return (
    <Tooltip title={<Box sx={{ whiteSpace: 'pre-line' }}>{getAssignmentWorkloadTooltip(workload)}</Box>} arrow>
      <Chip
        label={getAssignmentWorkloadLabel(workload)}
        size="small"
        sx={{
          height: 20,
          borderRadius: 99,
          bgcolor: tone.bg,
          color: tone.color,
          border: `1px solid ${tone.border}`,
          fontSize: 10,
          fontWeight: 900,
          '& .MuiChip-label': { px: 0.7 },
        }}
      />
    </Tooltip>
  );
}

function getRecommendedAssignmentDay(person: AssignmentPerson) {
  const configuredDay = getAssignmentDay(person.recommendedDayKey);
  if (configuredDay && isAssignmentWorkloadSelectable(person.weeklyWorkload[configuredDay.key])) return configuredDay;

  return assignmentWeekDays.find((day) => isAssignmentWorkloadSelectable(person.weeklyWorkload[day.key]));
}

function AssignmentWeeklyLoadCell({
  workload,
  selected = false,
  disabled = false,
  onClick,
}: {
  workload: AssignmentDayWorkload;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const tone = assignmentWorkloadTone[workload.level];

  return (
    <Tooltip title={<Box sx={{ whiteSpace: 'pre-line' }}>{getAssignmentWorkloadTooltip(workload)}</Box>} arrow>
      <span>
        <Button
          onClick={onClick}
          disabled={disabled}
          sx={{
            minWidth: 0,
            width: 34,
            height: 42,
            px: 0.35,
            borderRadius: 1.1,
            border: `1px solid ${selected ? '#0B63E5' : tone.border}`,
            bgcolor: selected ? '#DBEAFE' : tone.bg,
            color: tone.color,
            fontSize: 10.2,
            fontWeight: 900,
            lineHeight: 1.05,
            textTransform: 'none',
            boxShadow: selected ? 'inset 0 0 0 1px #0B63E5' : 'none',
            '&:hover': {
              bgcolor: selected ? '#DBEAFE' : tone.bg,
              borderColor: selected ? '#0B63E5' : tone.border,
            },
            '&.Mui-disabled': {
              bgcolor: tone.bg,
              color: tone.color,
              opacity: 0.62,
            },
          }}
        >
          {getAssignmentWorkloadLabel(workload)}
        </Button>
      </span>
    </Tooltip>
  );
}

function ResponsibleAssignmentGrid({
  selectedCell,
  onCellSelect,
}: {
  selectedCell: { personId: string; dayKey: AssignmentDayKey } | null;
  onCellSelect: (person: AssignmentPerson, day: AssignmentScheduledDay) => void;
}) {
  const workloadGridRef = useRef<HTMLDivElement | null>(null);
  const scrollWorkloadDays = (direction: 'previous' | 'next') => {
    workloadGridRef.current?.scrollBy({
      left: direction === 'next' ? 120 : -120,
      behavior: 'smooth',
    });
  };

  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: 1.4, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper, overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.25 }}>
        <Typography sx={{ color: '#334155', fontSize: 11.5, fontWeight: 900 }}>
          Weekly workload
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => scrollWorkloadDays('previous')}
            aria-label="Previous workload days"
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1,
              color: '#64748B',
              bgcolor: '#F1F5F9',
              '&:hover': { bgcolor: '#E2E8F0' },
            }}
          >
            <KeyboardArrowLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => scrollWorkloadDays('next')}
            aria-label="Next workload days"
            sx={{
              width: 24,
              height: 24,
              borderRadius: 1,
              color: '#64748B',
              bgcolor: '#F1F5F9',
              '&:hover': { bgcolor: '#E2E8F0' },
            }}
          >
            <KeyboardArrowRightIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>
      <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 700, mb: 0.9 }}>
        Select one person and execution day.
      </Typography>
      <Box
        ref={workloadGridRef}
        sx={{
          display: 'grid',
          gridTemplateColumns: '112px repeat(7, 34px)',
          gap: 0.45,
          alignItems: 'center',
          overflowX: 'auto',
          overflowY: 'hidden',
          pb: 0.4,
        }}
      >
        <Box />
        {assignmentWeekDays.map((day) => (
          <Box key={day.key} sx={{ textAlign: 'center' }}>
            <Typography sx={{ color: '#334155', fontSize: 10.5, fontWeight: 900, lineHeight: 1 }}>
              {day.shortLabel}
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 9.5, fontWeight: 800 }}>
              {day.dayNumber}
            </Typography>
          </Box>
        ))}

        {assignmentPeopleOptions.map((person) => (
          <Fragment key={person.id}>
            <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.65, py: 0.45 }}>
              <AssignmentAvatar person={person} size={28} />
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ color: '#111827', fontSize: 11.5, fontWeight: 850, lineHeight: 1.2 }}>
                  {person.name}
                </Typography>
                <Typography noWrap sx={{ color: '#64748B', fontSize: 10.5, fontWeight: 750, lineHeight: 1.2 }}>
                  {person.role} • {person.context}
                </Typography>
              </Box>
            </Box>
            {assignmentWeekDays.map((day) => {
              const workload = person.weeklyWorkload[day.key];
              const disabled = !isAssignmentWorkloadSelectable(workload);
              const selected = selectedCell?.personId === person.id && selectedCell.dayKey === day.key;

              return (
                <AssignmentWeeklyLoadCell
                  key={`${person.id}-${day.key}`}
                  workload={workload}
                  selected={selected}
                  disabled={disabled}
                  onClick={() => onCellSelect(person, day)}
                />
              );
            })}
          </Fragment>
        ))}
      </Box>
    </Paper>
  );
}

function AdditionalAssignmentDayList({
  people,
  scheduledDay,
  selectedIds,
  onToggle,
}: {
  people: AssignmentPerson[];
  scheduledDay?: AssignmentScheduledDay;
  selectedIds: string[];
  onToggle: (person: AssignmentPerson) => void;
}) {
  return (
    <Paper elevation={0} sx={{ p: 1, borderRadius: 1.4, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
      <Typography sx={{ color: '#334155', fontSize: 11.5, fontWeight: 900, mb: 0.25 }}>
        People for {scheduledDay?.fullLabel ?? 'selected day'}
      </Typography>
      <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 700, mb: 0.9 }}>
        Additional assignees use the same scheduled day.
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {people.map((person) => {
          const workload = scheduledDay ? person.weeklyWorkload[scheduledDay.key] : undefined;
          const disabled = !isAssignmentWorkloadSelectable(workload);
          const selected = selectedIds.includes(person.id);

          return (
            <Box
              key={person.id}
              onClick={() => {
                if (!disabled) onToggle(person);
              }}
              sx={{
                p: 0.9,
                borderRadius: 1.2,
                border: `1px solid ${selected ? '#0B63E5' : '#E2E8F0'}`,
                bgcolor: selected ? '#EFF6FF' : '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                gap: 0.9,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.62 : 1,
              }}
            >
              <Checkbox
                checked={selected}
                disabled={disabled}
                size="small"
                sx={{ p: 0.2, color: '#94A3B8', '&.Mui-checked': { color: '#0B63E5' } }}
              />
              <AssignmentAvatar person={person} size={30} />
              <AssignmentPersonSummary person={person} compact />
              {workload ? (
                <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.35 }}>
                  <AssignmentWorkloadChip workload={workload} />
                  <Typography sx={{ color: '#64748B', fontSize: 10.5, fontWeight: 750, textAlign: 'right' }}>
                    {workload.summary}
                  </Typography>
                </Box>
              ) : null}
            </Box>
          );
          })}
      </Box>
    </Paper>
  );
}

function AssignmentWeeklyLoadPreview() {
  return (
    <Paper elevation={0} sx={{ mt: 0.7, p: 1, borderRadius: 1.4, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(110px, 1fr) repeat(7, 32px)',
          gap: 0.45,
          alignItems: 'center',
        }}
      >
        <Box />
        {assignmentWeekDays.map((day) => (
          <Typography key={day.key} sx={{ color: '#64748B', fontSize: 9.5, fontWeight: 900, textAlign: 'center' }}>
            {day.shortLabel}
          </Typography>
        ))}
        {assignmentPeopleOptions.map((person) => (
          <Fragment key={`weekly-${person.id}`}>
            <Typography noWrap sx={{ color: '#334155', fontSize: 11.5, fontWeight: 850 }}>
              {person.name}
            </Typography>
            {assignmentWeekDays.map((day) => {
              const workload = person.weeklyWorkload[day.key];
              const tone = assignmentWorkloadTone[workload.level];

              return (
                <Tooltip key={`${person.id}-${day.key}-preview`} title={<Box sx={{ whiteSpace: 'pre-line' }}>{getAssignmentWorkloadTooltip(workload)}</Box>} arrow>
                  <Box
                    sx={{
                      height: 24,
                      borderRadius: 0.8,
                      bgcolor: tone.bg,
                      border: `1px solid ${tone.border}`,
                      color: tone.color,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 8.5,
                      fontWeight: 900,
                    }}
                  >
                    {getAssignmentWorkloadLabel(workload)}
                  </Box>
                </Tooltip>
              );
            })}
          </Fragment>
        ))}
      </Box>
    </Paper>
  );
}

function AssignmentPersonSummary({ person, compact = false }: { person: AssignmentPerson; compact?: boolean }) {
  return (
    <Box sx={{ minWidth: 0, flex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
        <Typography sx={{ color: '#111827', fontSize: compact ? 12.5 : 13.5, fontWeight: 850, lineHeight: 1.2 }}>
          {person.name}
        </Typography>
        {person.recommended ? (
          <Chip
            label="BLU.AI"
            size="small"
            sx={{
              height: 18,
              borderRadius: 99,
              bgcolor: '#EFF6FF',
              color: '#0B63E5',
              border: '1px solid #BFDBFE',
              fontSize: 9,
              fontWeight: 900,
              '& .MuiChip-label': { px: 0.6 },
            }}
          />
        ) : null}
      </Box>
      <Typography sx={{ color: '#64748B', fontSize: compact ? 11 : 11.5, fontWeight: 750, lineHeight: 1.25, mt: 0.15 }}>
        {person.role} • {person.context}
      </Typography>
      <Typography sx={{ color: '#334155', fontSize: compact ? 11 : 11.5, fontWeight: 800, lineHeight: 1.25, mt: 0.35 }}>
        {person.workload}
        {person.shift ? ` • ${person.shift}` : ''}
      </Typography>
    </Box>
  );
}

function WorkOrderAssignmentTab({
  responsibleAssignee,
  additionalAssignees,
  scheduledExecutionDay,
  onOpenSelector,
  onScheduleDateChange,
  onRemoveResponsible,
  onRemoveAdditional,
}: {
  responsibleAssignee?: AssignmentPerson;
  additionalAssignees: AssignmentPerson[];
  scheduledExecutionDay?: AssignmentScheduledDay;
  onOpenSelector: (mode: AssignmentSelectorMode) => void;
  onScheduleDateChange: (scheduledDay: AssignmentScheduledDay) => void;
  onRemoveResponsible: () => void;
  onRemoveAdditional: (personId: string) => void;
}) {
  const responsibleWorkload = responsibleAssignee ? getAssignmentWorkload(responsibleAssignee, scheduledExecutionDay) : undefined;
  const scheduledDateInputValue = scheduledExecutionDay?.isoDate ?? '';

  const handleScheduleDateInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextScheduledDay = buildAssignmentScheduledDayFromIsoDate(event.target.value);
    if (nextScheduledDay) onScheduleDateChange(nextScheduledDay);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
      <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.5, border: '1px solid #D8E4F2', bgcolor: activeTheme.backgroundPaper }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
          <Box>
            <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 900 }}>
              Responsible Assignee *
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 650, mt: 0.15 }}>
              Main accountable person for the Work Order flow.
            </Typography>
          </Box>
          <Button
            size="small"
            variant={responsibleAssignee ? 'text' : 'outlined'}
            startIcon={responsibleAssignee ? undefined : <PersonOutlineIcon sx={{ fontSize: 17 }} />}
            onClick={() => onOpenSelector('responsible')}
            sx={{
              minWidth: responsibleAssignee ? 0 : 94,
              height: responsibleAssignee ? 30 : 34,
              borderRadius: 999,
              color: '#0B63E5',
              borderColor: '#BFDBFE',
              bgcolor: responsibleAssignee ? 'transparent' : activeTheme.backgroundPaper,
              fontSize: responsibleAssignee ? 11 : 12,
              fontWeight: 900,
              textTransform: 'none',
              px: responsibleAssignee ? 0.8 : 1.25,
              '& .MuiButton-startIcon': { mr: 0.45 },
              '&:hover': { borderColor: '#93C5FD', bgcolor: '#EFF6FF' },
            }}
          >
            {responsibleAssignee ? 'Change' : 'Assign'}
          </Button>
        </Box>

        {responsibleAssignee ? (
          <Box
            sx={{
              p: 1,
              borderRadius: 1.3,
              border: '1px solid #BFDBFE',
              bgcolor: '#F8FBFF',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <AssignmentAvatar person={responsibleAssignee} size={36} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
                <Typography sx={{ color: '#111827', fontSize: 13.5, fontWeight: 850, lineHeight: 1.2 }}>
                  {responsibleAssignee.name}
                </Typography>
                {responsibleAssignee.recommended ? (
                  <Chip
                    label="BLU.AI"
                    size="small"
                    sx={{
                      height: 18,
                      borderRadius: 99,
                      bgcolor: '#EFF6FF',
                      color: '#0B63E5',
                      border: '1px solid #BFDBFE',
                      fontSize: 9,
                      fontWeight: 900,
                      '& .MuiChip-label': { px: 0.6 },
                    }}
                  />
                ) : null}
              </Box>
              <Typography sx={{ color: '#64748B', fontSize: 11.5, fontWeight: 750, lineHeight: 1.25, mt: 0.15 }}>
                {responsibleAssignee.role} • {responsibleAssignee.context}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap', mt: 0.6 }}>
                <Typography sx={{ color: '#334155', fontSize: 11.5, fontWeight: 900 }}>
                  Scheduled for:
                </Typography>
                <Typography sx={{ color: '#0B63E5', fontSize: 11.5, fontWeight: 900 }}>
                  {scheduledExecutionDay?.fullLabel ?? 'Not scheduled'}
                </Typography>
                {responsibleWorkload ? <AssignmentWorkloadChip workload={responsibleWorkload} /> : null}
              </Box>
              {responsibleWorkload ? (
                <Typography sx={{ color: '#475569', fontSize: 11.2, fontWeight: 750, lineHeight: 1.25, mt: 0.35 }}>
                  {responsibleWorkload.summary}
                </Typography>
              ) : null}
              <TextField
                size="small"
                type="date"
                label="Scheduled date"
                value={scheduledDateInputValue}
                onChange={handleScheduleDateInputChange}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon sx={{ fontSize: 15, color: '#64748B' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mt: 0.9,
                  maxWidth: 190,
                  '& .MuiInputLabel-root': { color: '#64748B', fontSize: 11, fontWeight: 800 },
                  '& .MuiOutlinedInput-root': {
                    height: 34,
                    borderRadius: 1,
                    bgcolor: activeTheme.backgroundPaper,
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#334155',
                    '& fieldset': { borderColor: '#CBD5E1' },
                    '&:hover fieldset': { borderColor: '#93C5FD' },
                    '&.Mui-focused fieldset': { borderColor: '#0B63E5', borderWidth: 1.2 },
                  },
                }}
              />
            </Box>
            <Button
              size="small"
              onClick={onRemoveResponsible}
              sx={{ minWidth: 0, color: '#64748B', fontSize: 11, fontWeight: 850, textTransform: 'none' }}
            >
              Remove
            </Button>
          </Box>
        ) : (
          <Box
            sx={{
              p: 1.4,
              borderRadius: 1.3,
              border: '1px dashed #CBD5E1',
              bgcolor: '#F8FAFC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              minHeight: 62,
            }}
          >
            <Typography sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 700 }}>
              Select one Technician or Operator before submitting.
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.5, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
          <Box>
            <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 900 }}>
              Additional Assignees
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 650, mt: 0.15 }}>
              {scheduledExecutionDay ? `Optional support for ${scheduledExecutionDay.fullLabel}.` : 'Optional support uses the selected scheduled day.'}
            </Typography>
          </Box>
          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 16 }} />}
            onClick={() => onOpenSelector('additional')}
            disabled={!scheduledExecutionDay}
            sx={{ color: '#0B63E5', fontSize: 11, fontWeight: 900, textTransform: 'none' }}
          >
            Add people
          </Button>
        </Box>

        {additionalAssignees.length ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
            {additionalAssignees.map((person) => (
              <Box
                key={person.id}
                sx={{
                  p: 0.9,
                  borderRadius: 1.2,
                  border: '1px solid #E2E8F0',
                  bgcolor: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.9,
                }}
              >
                <AssignmentAvatar person={person} size={30} />
                <AssignmentPersonSummary person={person} compact />
                <IconButton size="small" onClick={() => onRemoveAdditional(person.id)} aria-label={`Remove ${person.name}`}>
                  <DeleteIcon sx={{ fontSize: 18, color: '#64748B' }} />
                </IconButton>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ p: 1.3, borderRadius: 1.2, bgcolor: '#F8FAFC', border: '1px dashed #D8DEE8', textAlign: 'center', minHeight: 64, display: 'grid', placeItems: 'center' }}>
            <Typography sx={{ color: '#64748B', fontSize: 12.5, fontWeight: 750 }}>
              {scheduledExecutionDay ? 'No additional assignees added' : 'Select a responsible assignee and scheduled day first'}
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

function AssignmentSelectorDrawer({
  open,
  mode,
  responsibleAssignee,
  additionalAssignees,
  scheduledExecutionDay,
  onClose,
  onSelectResponsible,
  onAddPeople,
}: {
  open: boolean;
  mode: AssignmentSelectorMode;
  responsibleAssignee?: AssignmentPerson;
  additionalAssignees: AssignmentPerson[];
  scheduledExecutionDay?: AssignmentScheduledDay;
  onClose: () => void;
  onSelectResponsible: (person: AssignmentPerson, scheduledDay: AssignmentScheduledDay) => void;
  onAddPeople: (people: AssignmentPerson[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedResponsibleCell, setSelectedResponsibleCell] = useState<{ personId: string; dayKey: AssignmentDayKey } | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
      setSelectedResponsibleCell(null);
    }
  }, [open, mode]);

  const isAdditionalMode = mode === 'additional';
  const unavailableIds = new Set([
    ...(responsibleAssignee ? [responsibleAssignee.id] : []),
    ...additionalAssignees.map((person) => person.id),
  ]);
  const selectablePeople = assignmentPeopleOptions
    .filter((person) => !isAdditionalMode || !unavailableIds.has(person.id))
    .sort((a, b) => {
      if (!isAdditionalMode || !scheduledExecutionDay) return 0;

      const aWorkload = a.weeklyWorkload[scheduledExecutionDay.key];
      const bWorkload = b.weeklyWorkload[scheduledExecutionDay.key];
      const aSameContext = responsibleAssignee && a.context === responsibleAssignee.context ? 0 : 1;
      const bSameContext = responsibleAssignee && b.context === responsibleAssignee.context ? 0 : 1;

      return (
        assignmentWorkloadRank[aWorkload.level] - assignmentWorkloadRank[bWorkload.level] ||
        aSameContext - bSameContext ||
        a.name.localeCompare(b.name)
      );
    });
  const suggestedPeople = selectablePeople.filter((person) => {
    if (!person.recommended) return false;
    if (!isAdditionalMode || !scheduledExecutionDay) return true;
    return isAssignmentWorkloadSelectable(person.weeklyWorkload[scheduledExecutionDay.key]);
  });
  const selectedPeople = selectablePeople.filter((person) => selectedIds.includes(person.id));
  const selectedResponsiblePerson = selectedResponsibleCell
    ? assignmentPeopleOptions.find((person) => person.id === selectedResponsibleCell.personId)
    : undefined;
  const selectedResponsibleDay = selectedResponsibleCell ? getAssignmentDay(selectedResponsibleCell.dayKey) : undefined;

  const toggleSelectedPerson = (person: AssignmentPerson) => {
    setSelectedIds((current) =>
      current.includes(person.id) ? current.filter((id) => id !== person.id) : [...current, person.id]
    );
  };

  const confirmSelection = () => {
    if (isAdditionalMode) {
      if (selectedPeople.length) onAddPeople(selectedPeople);
      return;
    }

    if (selectedResponsiblePerson && selectedResponsibleDay) {
      onSelectResponsible(selectedResponsiblePerson, selectedResponsibleDay);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: { xs: 'calc(100vw - 24px)', sm: 470 },
          maxWidth: '100vw',
          maxHeight: { xs: 'calc(100dvh - 24px)', sm: 'calc(100dvh - 48px)' },
          bgcolor: '#F8FAFC',
          borderRadius: 3,
          border: '1px solid #DDE7F4',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.24)',
          overflow: 'hidden',
          m: 0,
        },
      }}
    >
      <Box sx={{ height: { xs: 'calc(100dvh - 24px)', sm: 'min(860px, calc(100dvh - 48px))' }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box
          sx={{
            px: 2.1,
            py: 1.65,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            bgcolor: activeTheme.backgroundPaper,
            borderBottom: '1px solid #E5EAF2',
          }}
        >
          <Box>
            <Typography sx={{ color: '#111827', fontSize: 16, fontWeight: 900, lineHeight: 1.15 }}>
              Assignment
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 11.5, fontWeight: 700, mt: 0.25 }}>
              {isAdditionalMode && scheduledExecutionDay ? `Additional Assignees for ${scheduledExecutionDay.fullLabel}` : 'Choose who and when'}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={lightHeaderIconButtonSx} aria-label="Close assignment selector">
            <CloseIcon sx={{ fontSize: 19 }} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1.4 }}>
          {suggestedPeople.length ? (
            <Box sx={{ mb: 1.2 }}>
              <Typography sx={{ color: '#0B63E5', fontSize: 11.5, fontWeight: 900, mb: 0.7 }}>
                BLU.AI Suggestions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                {suggestedPeople.map((person) => {
                  const recommendedDay = isAdditionalMode ? scheduledExecutionDay : getRecommendedAssignmentDay(person);
                  const recommendationWorkload = recommendedDay ? person.weeklyWorkload[recommendedDay.key] : undefined;
                  if (!recommendedDay || !recommendationWorkload) return null;

                  return (
                    <Paper key={person.id} elevation={0} sx={{ p: 1, borderRadius: 1.4, border: '1px solid #BFDBFE', bgcolor: '#EFF6FF' }}>
                      <Box sx={{ display: 'flex', gap: 0.9, alignItems: 'flex-start' }}>
                        <AssignmentAvatar person={person} />
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <AssignmentPersonSummary person={person} compact />
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mt: 0.5, flexWrap: 'wrap' }}>
                            <Typography sx={{ color: '#0F172A', fontSize: 11, fontWeight: 900 }}>
                              {recommendedDay.fullLabel}
                            </Typography>
                            <AssignmentWorkloadChip workload={recommendationWorkload} />
                          </Box>
                          <Typography sx={{ color: '#475569', fontSize: 11, fontWeight: 650, lineHeight: 1.3, mt: 0.45 }}>
                            {recommendationWorkload.summary}. {person.recommendationReason}
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        size="small"
                        fullWidth
                        onClick={() => {
                          if (isAdditionalMode) {
                            onAddPeople([person]);
                          } else {
                            onSelectResponsible(person, recommendedDay);
                          }
                        }}
                        sx={{ mt: 0.8, borderRadius: 999, color: '#0B63E5', fontSize: 11, fontWeight: 900, textTransform: 'none' }}
                      >
                        {isAdditionalMode ? 'Add to Assignment' : `Assign for ${recommendedDay.ctaLabel}`}
                      </Button>
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          ) : null}

          {isAdditionalMode ? (
            <AdditionalAssignmentDayList
              people={selectablePeople}
              scheduledDay={scheduledExecutionDay}
              selectedIds={selectedIds}
              onToggle={toggleSelectedPerson}
            />
          ) : (
            <ResponsibleAssignmentGrid
              selectedCell={selectedResponsibleCell}
              onCellSelect={(person, day) => setSelectedResponsibleCell({ personId: person.id, dayKey: day.key })}
            />
          )}

          {false ? (
            <Paper elevation={0} sx={{ mt: 0.7, p: 1, borderRadius: 1.4, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
              {assignmentPeopleOptions.map((person) => (
                <Box
                  key={`weekly-${person.id}`}
                  sx={{
                    py: 0.7,
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                    gap: 1,
                    borderBottom: '1px solid #EEF2F7',
                    '&:last-of-type': { borderBottom: 0 },
                  }}
                >
                  <Typography sx={{ color: '#334155', fontSize: 11.5, fontWeight: 800 }}>
                    {person.name}
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontSize: 11.5, fontWeight: 750 }}>
                    {person.weeklyLoad} • {person.priorityMix}
                  </Typography>
                </Box>
              ))}
            </Paper>
          ) : null}
        </Box>

        <Box sx={{ px: 1.5, py: 1.4, borderTop: `1px solid ${tokenDivider}`, display: 'flex', justifyContent: 'flex-end', gap: 1, bgcolor: activeTheme.backgroundPaper }}>
          <Button variant="text" onClick={onClose} sx={drawerTextButtonSx}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={isAdditionalMode ? !selectedPeople.length : !selectedResponsibleCell}
            onClick={confirmSelection}
            sx={{ ...drawerContainedButtonSx, minWidth: 110 }}
          >
            {isAdditionalMode ? 'Add People' : 'Confirm'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

function LinkedWorkOrdersSection({ linkedWorkOrders }: { linkedWorkOrders?: MaintenanceLinkedWorkCandidate[] }) {
  if (!linkedWorkOrders?.length) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 1.6,
        p: 1.25,
        borderRadius: 1.5,
        border: '1px solid #D8E4F2',
        bgcolor: activeTheme.backgroundPaper,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
        <Box>
          <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 900 }}>
            Linked Work Orders
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 650, mt: 0.15 }}>
            Scheduled for the same execution day.
          </Typography>
        </Box>
        <Chip
          label={`${linkedWorkOrders.length} linked`}
          size="small"
          sx={{ height: 20, borderRadius: 99, bgcolor: '#EFF6FF', color: '#0B63E5', border: '1px solid #BFDBFE', fontSize: 10, fontWeight: 900 }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {linkedWorkOrders.map((candidate) => (
          <Paper
            key={candidate.id}
            elevation={0}
            sx={{
              p: 1,
              borderRadius: 1.2,
              border: '1px solid #D8DEE8',
              bgcolor: '#F8FAFC',
            }}
          >
            <Chip
              label={`${candidate.type} - ${candidate.status}`}
              size="small"
              sx={{ height: 20, mb: 0.55, bgcolor: activeTheme.backgroundPaper, color: '#334155', border: '1px solid #CBD5E1', fontSize: 10, fontWeight: 900 }}
            />
            <Typography sx={{ color: '#111827', fontSize: 12.8, fontWeight: 900, lineHeight: 1.25 }}>
              {candidate.title}
            </Typography>
            <Typography sx={{ color: '#475569', fontSize: 11.3, fontWeight: 650, lineHeight: 1.35, mt: 0.35 }}>
              {candidate.description}
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 11.3, fontWeight: 750, mt: 0.45 }}>
              {candidate.scheduledFor} - {candidate.assignee}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Paper>
  );
}

function LinkedWorkOrdersList({ linkedWorkOrders }: { linkedWorkOrders: MaintenanceLinkedWorkCandidate[] }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {linkedWorkOrders.map((candidate) => (
        <Paper
          key={candidate.id}
          elevation={0}
          sx={{
            p: 1,
            borderRadius: 1.2,
            border: '1px solid #D8DEE8',
            bgcolor: '#F8FAFC',
          }}
        >
          <Chip
            label={`${candidate.type} - ${candidate.status}`}
            size="small"
            sx={{ height: 20, mb: 0.55, bgcolor: activeTheme.backgroundPaper, color: '#334155', border: '1px solid #CBD5E1', fontSize: 10, fontWeight: 900 }}
          />
          <Typography sx={{ color: '#111827', fontSize: 12.8, fontWeight: 900, lineHeight: 1.25 }}>
            {candidate.title}
          </Typography>
          <Typography sx={{ color: '#475569', fontSize: 11.3, fontWeight: 650, lineHeight: 1.35, mt: 0.35 }}>
            {candidate.description}
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: 11.3, fontWeight: 750, mt: 0.45 }}>
            {candidate.scheduledFor} - {candidate.assignee}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

function WorkOrderAttachmentPanel({ draft }: { draft: WorkOrderDraft }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: draft.attachmentSrc ? 0.9 : 2.4,
        borderRadius: 1.5,
        border: '1px dashed #B8C7DC',
        bgcolor: activeTheme.backgroundPaper,
        textAlign: 'center',
        minHeight: draft.attachmentSrc ? 0 : 240,
        display: 'grid',
        gap: draft.attachmentSrc ? 0.85 : 0,
        placeItems: 'center',
        boxShadow: '0 10px 26px rgba(15, 23, 42, 0.04)',
      }}
    >
      {draft.attachmentSrc ? (
        <>
          <Box
            component="img"
            src={draft.attachmentSrc}
            alt={draft.sourceRequestId ? `Attachment from ${draft.sourceRequestId}` : 'Work order attachment'}
            sx={{
              width: '100%',
              height: 208,
              borderRadius: 1.1,
              border: '1px solid #D1D5DB',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <Button
            component="label"
            size="small"
            variant="outlined"
            startIcon={<CloudUploadIcon sx={{ fontSize: 17 }} />}
            sx={{
              justifySelf: 'stretch',
              height: 34,
              borderRadius: 1.2,
              color: '#0B63E5',
              borderColor: '#BFDBFE',
              bgcolor: '#F8FAFC',
              fontSize: 12,
              fontWeight: 850,
              textTransform: 'none',
              '&:hover': { bgcolor: '#EFF6FF', borderColor: '#93C5FD' },
            }}
          >
            Add new attachment
            <Box component="input" type="file" multiple sx={{ display: 'none' }} />
          </Button>
        </>
      ) : (
        <Box component="label" sx={{ cursor: 'pointer' }}>
          <CloudUploadIcon sx={{ fontSize: 34, color: '#94A3B8', mb: 0.7 }} />
          <Typography sx={{ color: '#1D74FF', fontSize: 13, fontWeight: 850 }}>
            Click to upload or drag and drop
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 700, mt: 0.25 }}>
            PDF, DOC, JPG, PNG (max 10MB each)
          </Typography>
          <Box component="input" type="file" multiple sx={{ display: 'none' }} />
        </Box>
      )}
    </Paper>
  );
}

function getWorkOrderLogHistory(draft: WorkOrderDraft) {
  if (!draft.sourceCardId) return [];

  const workOrderId = draft.sourceRequestId ?? draft.drawerTitle ?? draft.sourceCardId;
  const statusLabel = draft.statusLabel ?? 'Planning';
  const baseHistory = [
    { id: `${draft.sourceCardId}-created`, timestamp: 'Jan 13, 08:30', actor: 'BLU.AI', action: `${workOrderId} created from maintenance intake.` },
    { id: `${draft.sourceCardId}-planned`, timestamp: 'Jan 13, 09:05', actor: 'Ronie D\'elano', action: 'Scope reviewed and work order moved to Planning.' },
  ];

  if (statusLabel === 'Planning') {
    return [
      ...baseHistory,
      { id: `${draft.sourceCardId}-parts`, timestamp: 'Jan 13, 09:22', actor: 'Tool Crib', action: 'Parts reservation check completed.' },
    ];
  }

  if (statusLabel === 'Scheduled') {
    return [
      ...baseHistory,
      { id: `${draft.sourceCardId}-assignment`, timestamp: 'Jan 13, 10:10', actor: 'Bruno Aquino', action: 'Responsible technician and execution date assigned.' },
      { id: `${draft.sourceCardId}-scheduled`, timestamp: 'Jan 13, 10:18', actor: 'Maintenance Planner', action: 'Work order moved to Scheduled.' },
    ];
  }

  if (statusLabel === 'In Progress' || statusLabel === 'Paused' || statusLabel === 'Feedback Review') {
    return [
      ...baseHistory,
      { id: `${draft.sourceCardId}-scheduled`, timestamp: 'Jan 13, 10:18', actor: 'Maintenance Planner', action: 'Work order moved to Scheduled.' },
      { id: `${draft.sourceCardId}-started`, timestamp: 'Jan 13, 13:00', actor: draft.responsibleAssignee?.name ?? 'Maintenance Team', action: 'Execution started.' },
      ...(draft.pauseContext ? [{ id: `${draft.sourceCardId}-paused`, timestamp: 'Jan 13, 15:10', actor: draft.pauseContext.pausedBy, action: `Execution paused: ${draft.pauseContext.reason}.` }] : []),
      ...(draft.resumeHistory ?? []).map((entry, index) => ({ id: `${draft.sourceCardId}-resume-${index}`, timestamp: 'Just now', actor: 'Bruno Aquino', action: entry })),
    ];
  }

  if (statusLabel === 'Done') {
    return [
      ...baseHistory,
      { id: `${draft.sourceCardId}-started`, timestamp: 'Jan 13, 13:00', actor: draft.responsibleAssignee?.name ?? 'Maintenance Team', action: 'Execution started.' },
      { id: `${draft.sourceCardId}-completed`, timestamp: 'Jan 13, 16:40', actor: draft.responsibleAssignee?.name ?? 'Maintenance Team', action: 'Execution completed and submitted for review.' },
    ];
  }

  if (statusLabel === 'Closed') {
    return [
      ...baseHistory,
      { id: `${draft.sourceCardId}-completed`, timestamp: 'Jan 13, 16:40', actor: 'Maintenance Team', action: 'Execution completed and submitted for review.' },
      { id: `${draft.sourceCardId}-closed`, timestamp: 'Jan 13, 17:25', actor: 'Supervisor', action: 'Review accepted and work order closed.' },
    ];
  }

  return baseHistory;
}

function WorkOrderLogHistorySection({ draft }: { draft: WorkOrderDraft }) {
  const history = getWorkOrderLogHistory(draft);

  if (!history.length) return null;

  return (
    <Box sx={{ display: 'grid', gap: 0.65 }}>
      {history.map((entry) => (
        <Paper
          key={entry.id}
          elevation={0}
          sx={{
            p: 0.9,
            borderRadius: 1.2,
            border: '1px solid #D8E4F2',
            bgcolor: activeTheme.backgroundPaper,
            display: 'grid',
            gridTemplateColumns: '86px minmax(0, 1fr)',
            gap: 0.85,
            alignItems: 'start',
          }}
        >
          <Typography sx={{ color: '#64748B', fontSize: 10.5, fontWeight: 900, lineHeight: 1.2 }}>
            {entry.timestamp}
          </Typography>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#111827', fontSize: 12.2, fontWeight: 900, lineHeight: 1.2 }}>
              {entry.actor}
            </Typography>
            <Typography sx={{ color: '#475569', fontSize: 11.4, fontWeight: 700, lineHeight: 1.35, mt: 0.2 }}>
              {entry.action}
            </Typography>
          </Box>
        </Paper>
      ))}
    </Box>
  );
}

function getPreventiveWorkOrderTasklist(draft: WorkOrderDraft) {
  const isPreventiveScheduledWorkOrder =
    Boolean(draft.sourceCardId && preventiveTasklistCardIds.includes(draft.sourceCardId)) &&
    draft.statusLabel === 'Scheduled' &&
    draft.maintenanceType === 'Preventive';

  return isPreventiveScheduledWorkOrder ? preventiveWorkOrderTasklist : [];
}

function PreventiveTasklistSection({ draft }: { draft: WorkOrderDraft }) {
  const tasklist = getPreventiveWorkOrderTasklist(draft);

  if (!tasklist.length) return null;

  return (
    <Box sx={{ display: 'grid', gap: 0.65 }}>
      {tasklist.map((task) => (
        <Paper
          key={task.id}
          elevation={0}
          sx={{
            p: 0.9,
            borderRadius: 1.2,
            border: '1px solid #D8E4F2',
            bgcolor: task.completed ? '#F0FDF4' : activeTheme.backgroundPaper,
            display: 'grid',
            gridTemplateColumns: 'auto minmax(0, 1fr)',
            gap: 0.75,
            alignItems: 'center',
          }}
        >
          <Checkbox
            size="small"
            checked={task.completed}
            disabled
            sx={{
              p: 0,
              color: '#94A3B8',
              '&.Mui-checked': { color: '#16A34A' },
            }}
          />
          <Typography sx={{ color: task.completed ? '#166534' : '#334155', fontSize: 12.2, fontWeight: 850, lineHeight: 1.25 }}>
            {task.title}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}

function ExecutionDrawerCollapsibleSection({
  title,
  subtitle,
  badge,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <Box sx={{ mb: 1.25 }}>
      <Paper
        elevation={0}
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onToggle();
          }
        }}
        sx={{
          p: 1.15,
          borderRadius: 1.5,
          border: '1px solid #D8E4F2',
          bgcolor: activeTheme.backgroundPaper,
          cursor: 'pointer',
          outline: 'none',
          '&:focus-visible': { boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.18)' },
        }}
      >
        <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', gap: 0.8, alignItems: 'center' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#334155', fontSize: 12.8, fontWeight: 950, lineHeight: 1.15 }}>
              {title}
            </Typography>
            {subtitle ? (
              <Typography sx={{ color: '#64748B', fontSize: 11.2, fontWeight: 650, lineHeight: 1.25, mt: 0.2 }}>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
          {badge ? <Box sx={{ display: 'inline-flex', justifyContent: 'flex-end', minWidth: 0 }}>{badge}</Box> : null}
          <IconButton
            size="small"
            aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
            onClick={(event) => {
              event.stopPropagation();
              onToggle();
            }}
            sx={{ color: '#2563EB', p: 0.4 }}
          >
            {open ? <KeyboardArrowUpIcon sx={{ fontSize: 20 }} /> : <KeyboardArrowDownIcon sx={{ fontSize: 20 }} />}
          </IconButton>
        </Box>
      </Paper>
      {open ? (
        <Box
          sx={{
            mt: 0.75,
            p: 0.85,
            borderRadius: 1.5,
            border: '1px solid #DDE7F4',
            bgcolor: '#EEF4FB',
            display: 'grid',
            gap: 0.85,
          }}
        >
          {children}
        </Box>
      ) : null}
    </Box>
  );
}

function ExecutionSectionBadge({ label, tone = 'blue' }: { label: string; tone?: 'blue' | 'green' | 'red' | 'gray' | 'orange' }) {
  const toneStyles = {
    blue: { bg: '#EFF6FF', color: '#0B63E5', border: '#BFDBFE' },
    green: { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' },
    red: { bg: '#FEF2F2', color: '#B91C1C', border: '#FCA5A5' },
    gray: { bg: '#F8FAFC', color: '#475569', border: '#CBD5E1' },
    orange: { bg: '#FFF7ED', color: '#B45309', border: '#FED7AA' },
  }[tone];

  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 20,
        borderRadius: 99,
        bgcolor: toneStyles.bg,
        color: toneStyles.color,
        border: `1px solid ${toneStyles.border}`,
        fontSize: 10,
        fontWeight: 900,
      }}
    />
  );
}

function ExecutionSparePartsSectionContent({
  selectedParts,
  onSelectedPartsChange,
  onOpenInventoryPart,
  isReadyForPickUp = false,
  onPickUp,
}: {
  selectedParts: SelectedSparePart[];
  onSelectedPartsChange: (parts: SelectedSparePart[]) => void;
  onOpenInventoryPart?: (part: SparePartOption | SelectedSparePart) => void;
  isReadyForPickUp?: boolean;
  onPickUp?: () => void;
}) {
  return (
    <Box sx={{ display: 'grid', gap: 0.85 }}>
      <Box sx={{ p: 1, borderRadius: 1.2, border: '1px solid #D8E4F2', bgcolor: '#F8FAFC' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 900 }}>
              Material Readiness
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 650, mt: 0.15 }}>
              {selectedParts.length ? 'Spare parts reserved before execution.' : 'Search and add spare parts required for execution.'}
            </Typography>
          </Box>
          <Chip
            label={selectedParts.length ? 'Reserved in Tool Crib' : 'No parts selected'}
            size="small"
            sx={{
              height: 20,
              borderRadius: 99,
              bgcolor: selectedParts.length ? '#ECFDF5' : '#F8FAFC',
              color: selectedParts.length ? '#047857' : '#475569',
              border: `1px solid ${selectedParts.length ? '#A7F3D0' : '#CBD5E1'}`,
              fontSize: 10,
              fontWeight: 900,
            }}
          />
        </Box>
      </Box>
      <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.2, border: '1px solid #D8E4F2', bgcolor: activeTheme.backgroundPaper }}>
        <WorkOrderSparePartsTab
          selectedParts={selectedParts}
          onSelectedPartsChange={onSelectedPartsChange}
          onOpenInventoryPart={onOpenInventoryPart}
          isReadyForPickUp={isReadyForPickUp}
          onPickUp={onPickUp}
        />
      </Paper>
    </Box>
  );
}

function WorkOrderSparePartsSectionContent({
  selectedParts,
  onSelectedPartsChange,
  onOpenInventoryPart,
  isReadyForPickUp = false,
  onPickUp,
}: {
  selectedParts: SelectedSparePart[];
  onSelectedPartsChange: (parts: SelectedSparePart[]) => void;
  onOpenInventoryPart?: (part: SparePartOption | SelectedSparePart) => void;
  isReadyForPickUp?: boolean;
  onPickUp?: () => void;
}) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.2, border: '1px solid #D8E4F2', bgcolor: activeTheme.backgroundPaper }}>
      <WorkOrderSparePartsTab
        selectedParts={selectedParts}
        onSelectedPartsChange={onSelectedPartsChange}
        onOpenInventoryPart={onOpenInventoryPart}
        isReadyForPickUp={isReadyForPickUp}
        onPickUp={onPickUp}
      />
    </Paper>
  );
}

function RelatedWorkInsight({ onReview }: { onReview: () => void }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.15,
        borderRadius: 1.5,
        border: '1px solid #BFDBFE',
        bgcolor: '#F4F8FB',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, mb: 0.45 }}>
        <SparkleIcon sx={{ fontSize: 18, color: '#FF8A00' }} />
        <Typography sx={{ color: '#1663FF', fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}>
          BLU.AI Insight
        </Typography>
      </Box>
      <Typography sx={{ color: '#1E3A8A', fontSize: 12.5, fontWeight: 900, mb: 0.35 }}>
        Related work found for this equipment
      </Typography>
      <Typography sx={{ color: '#1D4ED8', fontSize: 11.5, fontWeight: 700, lineHeight: 1.35 }}>
        Review preventive or corrective work already planned before creating a separate Work Order.
      </Typography>
      <Button
        size="small"
        variant="text"
        onClick={onReview}
        sx={{ mt: 0.6, px: 0, color: '#0B63E5', fontSize: 11.5, fontWeight: 900, textTransform: 'none' }}
      >
        Review related work
      </Button>
    </Paper>
  );
}

function RelatedWorkDialog({
  open,
  onClose,
  onLink,
}: {
  open: boolean;
  onClose: () => void;
  onLink?: (candidate: MaintenanceLinkedWorkCandidate) => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#111827', fontSize: 18, fontWeight: 900, pb: 1 }}>
        Link to existing work
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
        {linkedWorkCandidates.map((candidate) => (
          <Paper
            key={candidate.id}
            elevation={0}
            sx={{
              p: 1.2,
              borderRadius: 1.5,
              border: '1px solid #D8DEE8',
              bgcolor: activeTheme.backgroundPaper,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Chip
                label={`${candidate.type} - ${candidate.status}`}
                size="small"
                sx={{ height: 21, mb: 0.6, bgcolor: '#F8FAFC', color: '#334155', border: '1px solid #CBD5E1', fontSize: 10, fontWeight: 900 }}
              />
              <Typography sx={{ color: '#111827', fontSize: 13, fontWeight: 900, lineHeight: 1.25 }}>
                {candidate.title}
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: 11.5, fontWeight: 650, lineHeight: 1.35, mt: 0.45 }}>
                {candidate.description}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: 11.5, fontWeight: 700, mt: 0.3 }}>
                {candidate.scheduledFor} - {candidate.assignee}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="contained"
              onClick={() => onLink?.(candidate)}
              disabled={!onLink}
              sx={{ flexShrink: 0, borderRadius: 999, fontSize: 11.5, fontWeight: 900, textTransform: 'none', boxShadow: 'none' }}
            >
              Link
            </Button>
          </Paper>
        ))}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 1.5, borderTop: '1px solid #E5EAF2' }}>
        <Button onClick={onClose} sx={{ color: '#2563EB', fontWeight: 900, textTransform: 'none' }}>
          Keep separate
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function ExecutionSummaryField({ label, value }: { label: string; value?: string }) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ color: '#64748B', fontSize: 10.5, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>
        {label}
      </Typography>
      <Typography sx={{ color: '#111827', fontSize: 12.5, fontWeight: 850, lineHeight: 1.25, mt: 0.25 }}>
        {value || '-'}
      </Typography>
    </Box>
  );
}

function RiskAssessmentSummary({ draft }: { draft: WorkOrderDraft }) {
  const items = [
    { key: 'D', label: 'Downtime', value: draft.downtime },
    { key: 'Q', label: 'Quality', value: draft.quality },
    { key: 'E', label: 'EHS', value: draft.ehs },
  ];
  const toneStyles: Record<BoardBadgeTone, { color: string; border: string; bg: string }> = {
    neutral: { color: '#64748B', border: '#CBD5E1', bg: activeTheme.backgroundPaper },
    red: { color: '#DC2626', border: '#FCA5A5', bg: '#FEF2F2' },
    orange: { color: '#D97706', border: '#FDE68A', bg: '#FFFBEB' },
    green: { color: '#16A34A', border: '#BBF7D0', bg: '#F0FDF4' },
  };

  return (
    <Box sx={{ minWidth: 0, gridColumn: { xs: '1', sm: '1 / -1' } }}>
      <Typography sx={{ color: '#64748B', fontSize: 10.5, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>
        Risk Assessment
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 0.7, mt: 0.55 }}>
        {items.map((item) => {
          const tone = getRiskAssessmentTone(item.value);
          const colors = toneStyles[tone];

          return (
            <Box
              key={item.key}
              sx={{
                minWidth: 0,
                p: 0.75,
                borderRadius: 1,
                border: `1px solid ${colors.border}`,
                bgcolor: colors.bg,
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0, 1fr)',
                gap: 0.65,
                alignItems: 'center',
              }}
            >
              <Box
                component="span"
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: 0.8,
                  bgcolor: activeTheme.backgroundPaper,
                  border: `1px solid ${colors.border}`,
                  color: colors.color,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 950,
                  lineHeight: 1,
                }}
              >
                {item.key}
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ color: colors.color, fontSize: 11.5, fontWeight: 950, lineHeight: 1.1 }}>
                  {item.value || '-'}
                </Typography>
                <Typography noWrap sx={{ color: '#475569', fontSize: 10.5, fontWeight: 750, lineHeight: 1.1, mt: 0.15 }}>
                  {item.label}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

function ExecutionSummarySection({
  draft,
  dateLabel = 'Scheduled',
  sticky = false,
}: {
  draft: WorkOrderDraft;
  dateLabel?: string;
  sticky?: boolean;
}) {
  const isMaintenanceRequestSummary = draft.maintenanceType === 'Maintenance Request' || draft.statusLabel === 'Maintenance Request';
  const showRiskAssessment = draft.statusLabel === 'Scheduled' || draft.statusLabel === 'In Progress' || draft.statusLabel === 'Closed';
  const equipmentCriticality = draft.equipmentCriticality;

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 1.4,
        p: 1.35,
        borderRadius: 1.5,
        border: '1px solid #D8E4F2',
        bgcolor: activeTheme.backgroundPaper,
        ...(sticky
          ? {
            position: 'sticky',
            top: 0,
            zIndex: 2,
            boxShadow: '0 8px 18px rgba(15, 23, 42, 0.08)',
          }
          : {}),
      }}
    >
      <Box sx={{ mb: 1.1 }}>
        <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
          <Typography sx={{ color: '#111827', fontSize: 17, fontWeight: 950, lineHeight: 1.15 }}>
            {draft.equipment}
          </Typography>
          {equipmentCriticality ? (
            <BoardCardBadge label={equipmentCriticality} tone={getEquipmentCriticalityTone(equipmentCriticality)} />
          ) : null}
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1, mb: 1.05 }}>
        <ExecutionSummaryField label="Maintenance Type" value={draft.maintenanceType} />
        <ExecutionSummaryField label={dateLabel} value={draft.scheduledExecutionDay?.fullLabel ?? draft.statusLabel} />
        <ExecutionSummaryField label="Responsible" value={draft.responsibleAssignee?.name ?? draft.responsibleName} />
        <ExecutionSummaryField label="Priority" value={getPriorityDisplayLabel(draft.priority)} />
        <ExecutionSummaryField label="Activity" value={draft.activityType} />
        {showRiskAssessment ? (
          <RiskAssessmentSummary draft={draft} />
        ) : null}
      </Box>

      <Box sx={{ p: 1, borderRadius: 1.2, border: '1px solid #E2E8F0', bgcolor: '#F8FAFC' }}>
        <Typography sx={{ color: '#64748B', fontSize: 10.5, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.1 }}>
          {isMaintenanceRequestSummary ? 'What Happened' : 'Problem Description'}
        </Typography>
        <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 750, lineHeight: 1.35, mt: 0.35 }}>
          {draft.problemDescription}
        </Typography>
      </Box>
    </Paper>
  );
}

function MaterialReadinessSection({ selectedParts }: { selectedParts: SelectedSparePart[] }) {
  if (!selectedParts.length) return null;

  return (
    <Paper elevation={0} sx={{ mb: 1.4, p: 1.35, borderRadius: 1.5, border: '1px solid #D8E4F2', bgcolor: activeTheme.backgroundPaper }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
        <Box>
          <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 900 }}>
            Material Readiness
          </Typography>
          <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 650, mt: 0.15 }}>
            Spare parts reserved before execution.
          </Typography>
        </Box>
        <Chip
          label="Reserved in Tool Crib"
          size="small"
          sx={{ height: 20, borderRadius: 99, bgcolor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontSize: 10, fontWeight: 900 }}
        />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.65 }}>
        {selectedParts.map((part) => (
          <Box
            key={`readiness-${part.id}`}
            sx={{
              p: 0.9,
              borderRadius: 1.2,
              border: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography noWrap sx={{ color: '#111827', fontSize: 12.3, fontWeight: 900 }}>
                {part.code} - {part.description}
              </Typography>
              <Typography sx={{ color: '#64748B', fontSize: 11.2, fontWeight: 750, mt: 0.2 }}>
                {part.location} - Qty {part.requestedQuantity}/{part.availableQuantity}
              </Typography>
            </Box>
            <Chip
              label="Reserved"
              size="small"
              sx={{ height: 20, borderRadius: 99, bgcolor: '#ECFDF5', color: '#047857', border: '1px solid #A7F3D0', fontSize: 10, fontWeight: 900 }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

function ExecutionRequirementsSection({
  safetyPlan,
  qualityPlan,
}: {
  safetyPlan: WorkOrderSafetyRequirementPlan;
  qualityPlan: WorkOrderQualityRequirementPlan;
}) {
  const safetyLabels = safetyRequirementOptions
    .filter((option) => safetyPlan.selectedRequirementIds.includes(option.id))
    .map((option) => option.label);
  const qualityLabels = qualityRequirementOptions
    .filter((option) => qualityPlan.selectedRequirementIds.includes(option.id))
    .map((option) => option.label);

  return (
    <Paper elevation={0} sx={{ mb: 1.4, p: 1.35, borderRadius: 1.5, border: '1px solid #D8E4F2', bgcolor: activeTheme.backgroundPaper }}>
      <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 900, mb: 1 }}>
        Execution Requirements
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 0.9 }}>
        <Box sx={{ p: 1, borderRadius: 1.2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2' }}>
          <Typography sx={{ color: '#B91C1C', fontSize: 11.5, fontWeight: 950, mb: 0.45 }}>
            Safety
          </Typography>
          <Typography sx={{ color: '#7F1D1D', fontSize: 11.2, fontWeight: 750, lineHeight: 1.35 }}>
            {safetyPlan.lotoRequired ? `LOTO required - ${safetyPlan.lockoutPoint} - ${safetyPlan.procedure}` : 'LOTO not required'}
          </Typography>
          <Typography sx={{ color: '#475569', fontSize: 11, fontWeight: 700, lineHeight: 1.35, mt: 0.45 }}>
            {safetyLabels.join(', ') || 'No safety requirements selected'}
          </Typography>
        </Box>
        <Box sx={{ p: 1, borderRadius: 1.2, border: '1px solid #A7F3D0', bgcolor: '#ECFDF5' }}>
          <Typography sx={{ color: '#047857', fontSize: 11.5, fontWeight: 950, mb: 0.45 }}>
            Quality
          </Typography>
          <Typography sx={{ color: '#065F46', fontSize: 11.2, fontWeight: 750, lineHeight: 1.35 }}>
            {qualityPlan.qualityImpacting ? 'Quality impacting work' : 'No quality impact marked'}
          </Typography>
          <Typography sx={{ color: '#475569', fontSize: 11, fontWeight: 700, lineHeight: 1.35, mt: 0.45 }}>
            {qualityLabels.join(', ') || 'No quality requirements selected'}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

function ReviewSectionDecisionControls({
  section,
  confirmedSections,
  rejectedSections,
  onDecision,
}: {
  section: CompletionReviewSection;
  confirmedSections: CompletionReviewSection[];
  rejectedSections: CompletionReviewSection[];
  onDecision: (section: CompletionReviewSection, decision: CompletionReviewDecision) => void;
}) {
  const confirmed = confirmedSections.includes(section);
  const rejected = rejectedSections.includes(section);

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.1, flexWrap: 'wrap' }}>
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={confirmed}
            onChange={(event) => onDecision(section, event.target.checked ? 'confirmed' : 'clear')}
            sx={{
              p: 0.35,
              color: '#86EFAC',
              '&.Mui-checked': { color: '#15803D' },
            }}
          />
        }
        label="Confirm"
        sx={{
          m: 0,
          color: confirmed ? '#15803D' : '#475569',
          '& .MuiFormControlLabel-label': {
            fontSize: 11,
            fontWeight: 900,
          },
        }}
      />
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={rejected}
            onChange={(event) => onDecision(section, event.target.checked ? 'flagged' : 'clear')}
            sx={{
              p: 0.35,
              color: '#FCA5A5',
              '&.Mui-checked': { color: '#B91C1C' },
            }}
          />
        }
        label="Flag"
        sx={{
          m: 0,
          color: rejected ? '#B91C1C' : '#475569',
          '& .MuiFormControlLabel-label': {
            fontSize: 11,
            fontWeight: 900,
          },
        }}
      />
    </Box>
  );
}

function WorkOrderCompletionReview({
  draft,
  confirmedSections,
  rejectedSections,
  onSectionDecision,
}: {
  draft: WorkOrderDraft;
  confirmedSections: CompletionReviewSection[];
  rejectedSections: CompletionReviewSection[];
  onSectionDecision: (section: CompletionReviewSection, decision: CompletionReviewDecision) => void;
}) {
  const [actionsTaken, setActionsTaken] = useState(() => (
    `Inspected ${draft.equipment}, corrected the reported condition, replaced worn sealing components, and verified operation after restart.`
  ));
  const [rcaSummary, setRcaSummary] = useState('Minor Flaws');
  const [otherRca, setOtherRca] = useState('');
  const [completionNotes, setCompletionNotes] = useState(() => (
    `${draft.equipment} returned to service. No abnormal leak, noise, or vibration observed during verification.`
  ));
  const safetyLabels = safetyRequirementOptions
    .filter((option) => draft.safetyRequirementPlan.selectedRequirementIds.includes(option.id))
    .map((option) => option.label);
  const qualityLabels = qualityRequirementOptions
    .filter((option) => draft.qualityRequirementPlan.selectedRequirementIds.includes(option.id))
    .map((option) => option.label);

  return (
    <Box sx={{ display: 'grid', gap: 1.2 }}>
      <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.5, border: '1px solid #D8E4F2', bgcolor: activeTheme.backgroundPaper }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.1, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 900 }}>
              Second Touch Review
            </Typography>
            <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 650, mt: 0.15 }}>
              Capture corrective completion details before closure.
            </Typography>
          </Box>
          <Chip
            label="Corrective WO"
            size="small"
            sx={{ height: 22, borderRadius: 99, bgcolor: '#EFF6FF', color: '#0B63E5', border: '1px solid #BFDBFE', fontSize: 10, fontWeight: 900 }}
          />
        </Box>

        <Box sx={{ display: 'grid', gap: 1.1 }}>
          <TextField
            size="small"
            label="Actions Taken"
            value={actionsTaken}
            onChange={(event) => setActionsTaken(event.target.value)}
            multiline
            minRows={3}
            fullWidth
            InputLabelProps={{ shrink: true }}
            placeholder="Summarize the corrective work performed..."
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: 13 } }}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: rcaSummary === 'Other' ? '1fr 1fr' : '1fr' }, gap: 1 }}>
            <TextField
              select
              size="small"
              label="Root Cause Analysis (RCA)"
              value={rcaSummary}
              onChange={(event) => {
                setRcaSummary(event.target.value);
                setOtherRca('');
              }}
              InputLabelProps={{ shrink: true }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: 13 } }}
            >
              {correctiveRcaOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            {rcaSummary === 'Other' ? (
              <TextField
                size="small"
                label="Other RCA"
                value={otherRca}
                onChange={(event) => setOtherRca(event.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: 13 } }}
              />
            ) : null}
          </Box>
          <ReviewSectionDecisionControls
            section="Second Touch Review"
            confirmedSections={confirmedSections}
            rejectedSections={rejectedSections}
            onDecision={onSectionDecision}
          />
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.5, border: '1px solid #D8E4F2', bgcolor: activeTheme.backgroundPaper }}>
        <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 900, mb: 0.9 }}>
          Safety Requirements Confirmation
        </Typography>
        <Box sx={{ p: 1, borderRadius: 1.2, border: '1px solid #FCA5A5', bgcolor: '#FEF2F2', mb: 0.85 }}>
          <Typography sx={{ color: '#B91C1C', fontSize: 11.5, fontWeight: 950, mb: 0.45 }}>
            {draft.safetyRequirementPlan.lotoRequired ? `LOTO required - ${draft.safetyRequirementPlan.lockoutPoint} - ${draft.safetyRequirementPlan.procedure}` : 'LOTO not required'}
          </Typography>
          {draft.safetyRequirementPlan.equipmentCondition ? (
            <Typography sx={{ color: '#1D4ED8', fontSize: 11, fontWeight: 850, lineHeight: 1.35, mb: 0.35 }}>
              Equipment condition: {draft.safetyRequirementPlan.equipmentCondition}
            </Typography>
          ) : null}
          <Typography sx={{ color: '#475569', fontSize: 11, fontWeight: 700, lineHeight: 1.35 }}>
            {safetyLabels.join(', ') || 'No safety requirements selected'}
          </Typography>
        </Box>
        <ReviewSectionDecisionControls
          section="Safety Requirements"
          confirmedSections={confirmedSections}
          rejectedSections={rejectedSections}
          onDecision={onSectionDecision}
        />
      </Paper>

      <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.5, border: '1px solid #D8E4F2', bgcolor: activeTheme.backgroundPaper }}>
        <Typography sx={{ color: '#334155', fontSize: 12.5, fontWeight: 900, mb: 0.9 }}>
          Quality Requirements Confirmation
        </Typography>
        <Box sx={{ p: 1, borderRadius: 1.2, border: '1px solid #A7F3D0', bgcolor: '#ECFDF5', mb: 0.85 }}>
          <Typography sx={{ color: '#047857', fontSize: 11.5, fontWeight: 950, mb: 0.45 }}>
            {draft.qualityRequirementPlan.qualityImpacting ? 'Quality impacting work' : 'No quality impact marked'}
          </Typography>
          <Typography sx={{ color: '#475569', fontSize: 11, fontWeight: 700, lineHeight: 1.35 }}>
            {qualityLabels.join(', ') || 'No quality requirements selected'}
          </Typography>
        </Box>
        <ReviewSectionDecisionControls
          section="Quality Requirements"
          confirmedSections={confirmedSections}
          rejectedSections={rejectedSections}
          onDecision={onSectionDecision}
        />
      </Paper>

      <Paper elevation={0} sx={{ p: 1.35, borderRadius: 1.5, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
        <TextField
          size="small"
          label="Completion Notes"
          value={completionNotes}
          onChange={(event) => setCompletionNotes(event.target.value)}
          multiline
          minRows={3}
          fullWidth
          InputLabelProps={{ shrink: true }}
          placeholder="Record final condition, handoff notes, or items to verify before closure..."
          sx={{ mb: 0.85, '& .MuiOutlinedInput-root': { borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: 13 } }}
        />
        <ReviewSectionDecisionControls
          section="Completion Notes"
          confirmedSections={confirmedSections}
          rejectedSections={rejectedSections}
          onDecision={onSectionDecision}
        />
      </Paper>
    </Box>
  );
}

export function CreateWorkOrderDrawer({
  open,
  activeTab,
  initialDraft,
  initialExpandedSections,
  onTabChange,
  onClose,
  onSubmit,
  onResumePausedWorkOrder,
  onLinkToExistingWork,
  onRejectCompletionReview,
  onAcceptCompletionReview,
  onSelectedSparePartsChange,
  footerExtraActions,
}: {
  open: boolean;
  activeTab: WorkOrderTab;
  initialDraft?: WorkOrderDraft | null;
  initialExpandedSections?: Partial<Record<ExecutionDrawerSectionKey, boolean>>;
  onTabChange: (tab: WorkOrderTab) => void;
  onClose: () => void;
  onSubmit?: (draft: WorkOrderDraft) => void;
  onResumePausedWorkOrder?: (cardId: string) => string;
  onLinkToExistingWork?: (card: MaintenanceCard, candidate: MaintenanceLinkedWorkCandidate) => void;
  onRejectCompletionReview?: (draft: WorkOrderDraft) => void;
  onAcceptCompletionReview?: (draft: WorkOrderDraft) => void;
  onSelectedSparePartsChange?: (parts: SelectedSparePart[], draft: WorkOrderDraft) => void;
  footerExtraActions?: (draft: WorkOrderDraft) => ReactNode;
}) {
  const [draft, setDraft] = useState<WorkOrderDraft>(emptyWorkOrderDraft);
  const [selectedSpareParts, setSelectedSpareParts] = useState<SelectedSparePart[]>([]);
  const [selectedInventoryPart, setSelectedInventoryPart] = useState<InventoryPart | null>(null);
  const [requestedInventoryPurchasePartIds, setRequestedInventoryPurchasePartIds] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentSelection | null>(null);
  const [assignmentSelectorMode, setAssignmentSelectorMode] = useState<AssignmentSelectorMode>('responsible');
  const [isAssignmentSelectorOpen, setIsAssignmentSelectorOpen] = useState(false);
  const [isRelatedWorkDialogOpen, setIsRelatedWorkDialogOpen] = useState(false);
  const [selectedFullWorkOrder, setSelectedFullWorkOrder] = useState<WorkOrder | null>(null);
  const [executionSectionsExpanded, setExecutionSectionsExpanded] = useState<Record<ExecutionDrawerSectionKey, boolean>>(defaultExecutionDrawerSectionsExpanded);
  const [confirmedReviewSections, setConfirmedReviewSections] = useState<CompletionReviewSection[]>([]);
  const [rejectedReviewSections, setRejectedReviewSections] = useState<CompletionReviewSection[]>([]);

  useEffect(() => {
    if (open) {
      const nextDraft = initialDraft ?? emptyWorkOrderDraft;
      setDraft({
        ...nextDraft,
        activityType: normalizeWorkOrderActivityType(nextDraft.activityType),
      });
      setSelectedEquipment(null);
      setSelectedSpareParts(initialDraft?.selectedSpareParts ?? []);
      setSelectedInventoryPart(null);
      setIsAssignmentSelectorOpen(false);
      setIsRelatedWorkDialogOpen(false);
      setSelectedFullWorkOrder(null);
      setExecutionSectionsExpanded({ ...defaultExecutionDrawerSectionsExpanded, ...initialExpandedSections });
      setConfirmedReviewSections([]);
      setRejectedReviewSections(initialDraft?.rejectedReviewSections ?? []);
    }
  }, [initialDraft, initialExpandedSections, open]);

  const updateDraft = (field: keyof WorkOrderDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSelectedSparePartsChange = (parts: SelectedSparePart[]) => {
    setSelectedSpareParts(parts);
    onSelectedSparePartsChange?.(parts, draft);
  };

  const handleEquipmentChange = (selection: EquipmentSelection) => {
    const equipmentCriticality = getEquipmentSelectionCriticality(selection)
      ?? (draft.priority === 'Emergency' || draft.priority === 'Immediate' ? 'A' : 'B');

    setSelectedEquipment(selection);
    setDraft((current) => ({
      ...current,
      equipment: selection.name,
      equipmentCriticality,
    }));
  };

  const handleViewPauseHistory = () => {
    if (!draft.pauseContext) return;

    const historyLines = [
      `Paused by ${draft.pauseContext.pausedBy}: ${draft.pauseContext.reason}`,
      draft.pauseContext.notes ? `Notes: ${draft.pauseContext.notes}` : undefined,
      ...(draft.resumeHistory ?? []),
    ].filter(Boolean);

    window.alert(historyLines.join('\n'));
  };

  const handleResumeExecution = () => {
    if (!draft.sourceCardId || !draft.pauseContext) return;

    const confirmed = window.confirm('Resume execution for this Work Order? This will return it to active In Progress.');
    if (!confirmed) return;

    const resumeEvent = onResumePausedWorkOrder?.(draft.sourceCardId) ?? 'Execution resumed by current user just now.';
    setDraft((current) => ({
      ...current,
      pauseContext: undefined,
      resumeHistory: [...(current.resumeHistory ?? []), resumeEvent],
    }));
  };

  const canSubmit = Boolean(
    draft.maintenanceType &&
    draft.equipment.trim() &&
    draft.problemDescription.trim() &&
    draft.activityType &&
    draft.downtime &&
    draft.quality &&
    draft.ehs &&
    draft.priority &&
    draft.responsibleAssignee &&
    draft.scheduledExecutionDay
  );
  const drawerTitle = draft.drawerTitle ?? 'Create Work Order';
  const headerChipLabel = draft.sourceCardId ? draft.statusLabel : draft.sourceRequestId ? `From ${draft.sourceRequestId}` : undefined;
  const isMaintenanceTypeLocked = Boolean(draft.isMaintenanceTypeLocked);
  const isScheduledExecution = draft.drawerMode === 'scheduledExecution';
  const isCompletionReview = draft.drawerMode === 'completionReview';
  const isClosedWorkOrder = draft.drawerMode === 'closed';
  const isReadOnlyWorkOrder = isClosedWorkOrder || draft.statusLabel === 'Closed';
  const canOpenFullWorkOrder = isScheduledExecution || isCompletionReview;
  const isTypedWorkOrder = Boolean(draft.sourceCardId || draft.sourceRequestId || isMaintenanceTypeLocked);
  const additionalAssignees = draft.additionalAssignees ?? [];
  const assignedPeopleCount = (draft.responsibleAssignee ? 1 : 0) + additionalAssignees.length;
  const safetyRequirementCount = draft.safetyRequirementPlan.selectedRequirementIds.length;
  const qualityRequirementCount = draft.qualityRequirementPlan.selectedRequirementIds.length;
  const linkedWorkOrders = draft.linkedWorkOrders ?? [];
  const linkedWorkOrderCount = linkedWorkOrders.length;
  const logHistoryCount = getWorkOrderLogHistory(draft).length;
  const preventiveTasklist = getPreventiveWorkOrderTasklist(draft);
  const preventiveTasklistDoneCount = preventiveTasklist.filter((task) => task.completed).length;
  const isPlanningBoardWorkOrder = draft.drawerMode === 'planning' && (draft.statusLabel === 'Planning' || Boolean(draft.sourceCardId?.startsWith('wo-planning-')));
  const canAcceptCompletionReview = completionReviewSections.every((section) => confirmedReviewSections.includes(section)) && !rejectedReviewSections.length;
  const readOnlyContentSx = isReadOnlyWorkOrder
    ? {
      pointerEvents: 'none',
      '& .MuiInputBase-root': { bgcolor: activeTheme.backgroundPaper },
      '& .Mui-disabled': {
        color: '#1F2937',
        WebkitTextFillColor: '#1F2937',
      },
      '& .MuiInputLabel-root.Mui-disabled': {
        color: '#64748B',
      },
    }
    : undefined;

  const toggleExecutionSection = (sectionKey: ExecutionDrawerSectionKey) => {
    setExecutionSectionsExpanded((current) => ({
      ...current,
      [sectionKey]: !current[sectionKey],
    }));
  };

  const linkPlanningWorkOrderToExistingWork = (candidate: MaintenanceLinkedWorkCandidate) => {
    if (!draft.sourceRequestCardId || !onLinkToExistingWork) return;

    onLinkToExistingWork(
      {
        id: draft.sourceRequestCardId,
        title: draft.equipment || 'Planning Work Order',
        detail: draft.problemDescription,
        assignee: draft.responsibleAssignee?.name ?? '-',
        due: draft.scheduledExecutionDay?.fullLabel ?? 'Awaiting planning',
        priority: (draft.priority as MaintenancePriority) || 'Medium',
      },
      candidate
    );
    setIsRelatedWorkDialogOpen(false);
    onClose();
  };

  const openAssignmentSelector = (mode: AssignmentSelectorMode) => {
    setAssignmentSelectorMode(mode);
    setIsAssignmentSelectorOpen(true);
  };

  const selectResponsibleAssignee = (person: AssignmentPerson, scheduledDay: AssignmentScheduledDay) => {
    setDraft((current) => ({
      ...current,
      responsibleAssignee: person,
      scheduledExecutionDay: scheduledDay,
      additionalAssignees: (current.additionalAssignees ?? []).filter((assignee) => assignee.id !== person.id),
    }));
    setIsAssignmentSelectorOpen(false);
  };

  const addAdditionalAssignees = (people: AssignmentPerson[]) => {
    setDraft((current) => {
      const currentAdditional = current.additionalAssignees ?? [];
      const mergedPeople = people.filter(
        (person) => person.id !== current.responsibleAssignee?.id && !currentAdditional.some((assignee) => assignee.id === person.id)
      );

      return {
        ...current,
        additionalAssignees: [...currentAdditional, ...mergedPeople],
      };
    });
    setIsAssignmentSelectorOpen(false);
  };

  const updateScheduledExecutionDay = (scheduledExecutionDay: AssignmentScheduledDay) => {
    setDraft((current) => ({
      ...current,
      scheduledExecutionDay,
    }));
  };

  const removeResponsibleAssignee = () => {
    setDraft((current) => ({
      ...current,
      responsibleAssignee: undefined,
      scheduledExecutionDay: undefined,
      additionalAssignees: [],
    }));
  };

  const removeAdditionalAssignee = (personId: string) => {
    setDraft((current) => ({
      ...current,
      additionalAssignees: (current.additionalAssignees ?? []).filter((person) => person.id !== personId),
    }));
  };

  const submitWorkOrder = () => {
    if (!canSubmit) return;
    onSubmit?.({ ...draft, selectedSpareParts });
  };

  const rejectCompletionReview = () => {
    if (!rejectedReviewSections.length) return;
    onRejectCompletionReview?.({ ...draft, selectedSpareParts, rejectedReviewSections });
  };

  const acceptCompletionReview = () => {
    if (!canAcceptCompletionReview) return;
    onAcceptCompletionReview?.({ ...draft, selectedSpareParts, rejectedReviewSections });
  };

  const setReviewSectionDecision = (section: CompletionReviewSection, decision: CompletionReviewDecision) => {
    if (decision === 'clear') {
      setConfirmedReviewSections((current) => current.filter((item) => item !== section));
      setRejectedReviewSections((current) => current.filter((item) => item !== section));
      return;
    }

    if (decision === 'confirmed') {
      setConfirmedReviewSections((current) => (current.includes(section) ? current : [...current, section]));
      setRejectedReviewSections((current) => current.filter((item) => item !== section));
      return;
    }

    setRejectedReviewSections((current) => (current.includes(section) ? current : [...current, section]));
    setConfirmedReviewSections((current) => current.filter((item) => item !== section));
  };

  const openFullWorkOrder = () => {
    setSelectedFullWorkOrder(buildWidgetWorkOrderFromDraft(draft, selectedSpareParts));
  };

  const openInventoryPartDrawer = (part: SparePartOption | SelectedSparePart) => {
    const inventoryPart = findInventoryPartByCode(part.code) ?? findInventoryPartByCode(part.id);
    if (inventoryPart) setSelectedInventoryPart(inventoryPart);
  };

  const requestInventoryPurchase = (partId: string) => {
    setRequestedInventoryPurchasePartIds((current) => (current.includes(partId) ? current : [...current, partId]));
  };

  if (!open) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520 },
          maxWidth: '100vw',
          bgcolor: '#F8FAFC',
          borderLeft: '1px solid #DDE7F4',
          boxShadow: '-18px 0 42px rgba(15, 23, 42, 0.16)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box
          sx={{
            px: 2.25,
            pt: 2,
            pb: 1.6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            bgcolor: activeTheme.backgroundPaper,
            borderBottom: '1px solid #E5EAF2',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Typography sx={{ color: '#044ED7', fontSize: 18, fontWeight: 850, lineHeight: 1.15 }}>
              {drawerTitle}
            </Typography>
            {headerChipLabel ? (
              <Chip
                label={headerChipLabel}
                size="small"
                sx={{
                  height: 22,
                  borderRadius: 99,
                  bgcolor: '#EFF6FF',
                  color: '#044ED7',
                  border: '1px solid #BFDBFE',
                  fontWeight: 900,
                  fontSize: 10,
                  '& .MuiChip-label': { px: 0.9 },
                }}
              />
            ) : null}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
            {canOpenFullWorkOrder ? (
              <Tooltip title="Open full Work Order">
                <IconButton onClick={openFullWorkOrder} size="small" sx={{ ...lightHeaderIconButtonSx, flexShrink: 0 }} aria-label="Open full Work Order">
                  <OpenInNewIcon sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            ) : null}
            <IconButton onClick={onClose} size="small" sx={{ ...lightHeaderIconButtonSx, flexShrink: 0 }} aria-label="Close create work order">
              <CloseIcon sx={{ fontSize: 19 }} />
            </IconButton>
          </Box>
        </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', px: 2.25, pt: 1.8, pb: 2.2 }}>
        {draft.pauseContext ? (
          <PausedWorkOrderBlock
            pauseContext={draft.pauseContext}
            resumeHistory={draft.resumeHistory}
            onViewHistory={handleViewPauseHistory}
            onResume={handleResumeExecution}
          />
        ) : null}

        {isCompletionReview ? (
          <>
            <ExecutionSummarySection draft={draft} />
            <WorkOrderCompletionReview
              draft={draft}
              confirmedSections={confirmedReviewSections}
              rejectedSections={rejectedReviewSections}
              onSectionDecision={setReviewSectionDecision}
            />
            {logHistoryCount ? (
              <ExecutionDrawerCollapsibleSection
                title="Log History"
                subtitle="Card updates and status changes."
                badge={<ExecutionSectionBadge label={`${logHistoryCount} changes`} tone="gray" />}
                open={executionSectionsExpanded.logHistory}
                onToggle={() => toggleExecutionSection('logHistory')}
              >
                <WorkOrderLogHistorySection draft={draft} />
              </ExecutionDrawerCollapsibleSection>
            ) : null}
          </>
        ) : isScheduledExecution ? (
          <>
            <ExecutionSummarySection draft={draft} />
            <ExecutionDrawerCollapsibleSection
              title="Assignment & Schedule"
              subtitle={draft.scheduledExecutionDay ? `Scheduled for ${draft.scheduledExecutionDay.fullLabel}` : 'Assign responsible and schedule execution.'}
              badge={<ExecutionSectionBadge label={assignedPeopleCount ? `${assignedPeopleCount} assigned` : 'Unassigned'} tone={assignedPeopleCount ? 'blue' : 'gray'} />}
              open={executionSectionsExpanded.assignment}
              onToggle={() => toggleExecutionSection('assignment')}
            >
              <WorkOrderAssignmentTab
                responsibleAssignee={draft.responsibleAssignee}
                additionalAssignees={additionalAssignees}
                scheduledExecutionDay={draft.scheduledExecutionDay}
                onOpenSelector={openAssignmentSelector}
                onScheduleDateChange={updateScheduledExecutionDay}
                onRemoveResponsible={removeResponsibleAssignee}
                onRemoveAdditional={removeAdditionalAssignee}
              />
            </ExecutionDrawerCollapsibleSection>

            <ExecutionDrawerCollapsibleSection
              title="Spare Parts"
              subtitle="Material readiness and reserved items for execution."
              badge={<ExecutionSectionBadge label={`${selectedSpareParts.length} ${selectedSpareParts.length === 1 ? 'part' : 'parts'}`} tone={selectedSpareParts.length ? 'green' : 'gray'} />}
              open={executionSectionsExpanded.spareParts}
              onToggle={() => toggleExecutionSection('spareParts')}
            >
              <ExecutionSparePartsSectionContent
                selectedParts={selectedSpareParts}
                onSelectedPartsChange={handleSelectedSparePartsChange}
                onOpenInventoryPart={openInventoryPartDrawer}
                isReadyForPickUp={draft.isReadyForPickUp}
                onPickUp={() => {
                  if (!draft.responsibleAssignee) {
                    const defaultPerson = assignmentPeopleOptions.find(p => p.name === 'Bruno Aquino') || assignmentPeopleOptions[0];
                    const defaultDay = assignmentWeekDays.find(d => d.key === 'mon') || assignmentWeekDays[0];
                    setDraft(prev => ({
                      ...prev,
                      responsibleAssignee: defaultPerson,
                      scheduledExecutionDay: defaultDay
                    }));
                  }
                }}
              />
            </ExecutionDrawerCollapsibleSection>

            <ExecutionDrawerCollapsibleSection
              title="Safety Requirements"
              subtitle={`${draft.safetyRequirementPlan.equipmentCondition ? `${draft.safetyRequirementPlan.equipmentCondition} - ` : ''}${draft.safetyRequirementPlan.lotoRequired ? `LOTO required - ${draft.safetyRequirementPlan.lockoutPoint}` : 'LOTO not required'}`}
              badge={<ExecutionSectionBadge label={`${safetyRequirementCount} selected`} tone={draft.safetyRequirementPlan.lotoRequired ? 'red' : 'gray'} />}
              open={executionSectionsExpanded.safety}
              onToggle={() => toggleExecutionSection('safety')}
            >
              <WorkOrderSafetyRequirementsTab
                safetyPlan={draft.safetyRequirementPlan}
                onSafetyPlanChange={(safetyRequirementPlan) => setDraft((current) => ({ ...current, safetyRequirementPlan }))}
              />
            </ExecutionDrawerCollapsibleSection>

            <ExecutionDrawerCollapsibleSection
              title="Quality Requirements"
              subtitle={draft.qualityRequirementPlan.qualityImpacting ? 'Quality impacting work' : 'No quality impact marked'}
              badge={<ExecutionSectionBadge label={`${qualityRequirementCount} selected`} tone={draft.qualityRequirementPlan.qualityImpacting ? 'green' : 'gray'} />}
              open={executionSectionsExpanded.quality}
              onToggle={() => toggleExecutionSection('quality')}
            >
              <WorkOrderQualityRequirementsTab
                qualityPlan={draft.qualityRequirementPlan}
                onQualityPlanChange={(qualityRequirementPlan) => setDraft((current) => ({ ...current, qualityRequirementPlan }))}
              />
            </ExecutionDrawerCollapsibleSection>

            {linkedWorkOrderCount ? (
              <ExecutionDrawerCollapsibleSection
                title="Linked Work Orders"
                subtitle="Scheduled for the same execution day."
                badge={<ExecutionSectionBadge label={`${linkedWorkOrderCount} linked`} tone="blue" />}
                open={executionSectionsExpanded.linkedWorkOrders}
                onToggle={() => toggleExecutionSection('linkedWorkOrders')}
              >
                <LinkedWorkOrdersList linkedWorkOrders={linkedWorkOrders} />
              </ExecutionDrawerCollapsibleSection>
            ) : null}

            <ExecutionDrawerCollapsibleSection
              title="Attachments"
              subtitle={draft.attachmentSrc ? 'Image available for this Work Order.' : 'Attach supporting files for execution.'}
              badge={<ExecutionSectionBadge label={draft.attachmentSrc ? 'Available' : 'No attachment'} tone={draft.attachmentSrc ? 'blue' : 'gray'} />}
              open={executionSectionsExpanded.attachments}
              onToggle={() => toggleExecutionSection('attachments')}
            >
              <WorkOrderAttachmentPanel draft={draft} />
            </ExecutionDrawerCollapsibleSection>

            {preventiveTasklist.length ? (
              <ExecutionDrawerCollapsibleSection
                title="Tasklist"
                subtitle="Preventive execution checklist, read only."
                badge={<ExecutionSectionBadge label={`${preventiveTasklistDoneCount}/${preventiveTasklist.length} done`} tone="green" />}
                open={executionSectionsExpanded.tasklist}
                onToggle={() => toggleExecutionSection('tasklist')}
              >
                <PreventiveTasklistSection draft={draft} />
              </ExecutionDrawerCollapsibleSection>
            ) : null}

            {logHistoryCount ? (
              <ExecutionDrawerCollapsibleSection
                title="Log History"
                subtitle="Card updates and status changes."
                badge={<ExecutionSectionBadge label={`${logHistoryCount} changes`} tone="gray" />}
                open={executionSectionsExpanded.logHistory}
                onToggle={() => toggleExecutionSection('logHistory')}
              >
                <WorkOrderLogHistorySection draft={draft} />
              </ExecutionDrawerCollapsibleSection>
            ) : null}
          </>
        ) : (
          <>
            {isReadOnlyWorkOrder ? (
              <ExecutionSummarySection draft={draft} dateLabel="Closed" sticky />
            ) : null}

            {!isReadOnlyWorkOrder ? (
              <>
                {isTypedWorkOrder ? (
                  <Box sx={{ mb: 1.7 }}>
                    <Typography sx={{ color: '#334155', fontSize: 13, fontWeight: 800, mb: 0.7 }}>
                      Maintenance type *
                    </Typography>
                    <Chip
                      label={draft.maintenanceType || 'Corrective'}
                      size="small"
                      sx={{
                        height: 28,
                        borderRadius: 99,
                        bgcolor: '#EFF6FF',
                        color: '#044ED7',
                        border: '1px solid #BFDBFE',
                        fontSize: 12,
                        fontWeight: 900,
                        '& .MuiChip-label': { px: 1.2 },
                      }}
                    />
                  </Box>
                ) : (
                  <>
                    <Typography sx={{ color: '#334155', fontSize: 13, fontWeight: 800, mb: 1 }}>
                      Maintenance type *
                    </Typography>
                    <RadioGroup
                      row
                      value={draft.maintenanceType}
                      onChange={(event) => updateDraft('maintenanceType', event.target.value)}
                      sx={{ mb: 1.7, gap: 1.2 }}
                    >
                      <FormControlLabel value="Corrective" control={<Radio size="small" sx={{ color: '#64748B', '&.Mui-checked': { color: '#0B63E5' } }} />} label="Corrective" sx={{ m: 0, '& .MuiFormControlLabel-label': { color: '#334155', fontSize: 13.5, fontWeight: 600 } }} />
                      <FormControlLabel value="Breakdown" control={<Radio size="small" sx={{ color: '#64748B', '&.Mui-checked': { color: '#0B63E5' } }} />} label="Breakdown" sx={{ m: 0, '& .MuiFormControlLabel-label': { color: '#334155', fontSize: 13.5, fontWeight: 600 } }} />
                    </RadioGroup>
                  </>
                )}

                <Box sx={readOnlyContentSx}>
                  <EquipmentSelector
                    value={selectedEquipment}
                    onChange={handleEquipmentChange}
                    fallbackValue={draft.equipment}
                    criticality={draft.equipmentCriticality}
                  />
                </Box>

                <TextField
                  size="small"
                  label="Problem Description *"
                  value={draft.problemDescription}
                  onChange={(event) => updateDraft('problemDescription', event.target.value)}
                  multiline
                  minRows={2}
                  fullWidth
                  sx={{
                    mb: 1,
                    '& .MuiInputLabel-root': { color: '#64748B', fontSize: 13, fontWeight: 700 },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#0B63E5' },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 1.2,
                      bgcolor: activeTheme.backgroundPaper,
                      fontSize: 13.5,
                      color: '#1F2937',
                      '& fieldset': { borderColor: '#CBD5E1' },
                      '&:hover fieldset': { borderColor: '#93B4E7' },
                      '&.Mui-focused fieldset': { borderColor: '#0B63E5', borderWidth: 1.5 },
                    },
                  }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.7 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<MicIcon sx={{ fontSize: 18 }} />}
                    sx={{
                      height: 34,
                      borderRadius: 999,
                      color: '#2563EB',
                      borderColor: '#BFDBFE',
                      bgcolor: '#EFF6FF',
                      fontSize: 11,
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      px: 2,
                      '&:hover': { bgcolor: '#DBEAFE', borderColor: '#93C5FD' },
                    }}
                  >
                    Audio Description
                  </Button>
                </Box>

                <Box sx={{ mb: 1.7 }}>
                  <WorkOrderSelect
                    label="Activity Type *"
                    value={draft.activityType}
                    onChange={(value) => updateDraft('activityType', value)}
                    options={workOrderActivityTypeOptions.map((option) => ({ value: option, label: option }))}
                  />
                </Box>

                <Typography sx={{ color: '#334155', fontSize: 13, fontWeight: 800, mb: 0.8 }}>
                  Risk Assessment *
                </Typography>
                <Grid container spacing={1} sx={{ mb: 1.7 }}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <WorkOrderSelect label="Downtime" value={draft.downtime} onChange={(value) => updateDraft('downtime', value)} options={riskLevelOptions} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <WorkOrderSelect label="Quality" value={draft.quality} onChange={(value) => updateDraft('quality', value)} options={riskLevelOptions} />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <WorkOrderSelect label="EHS" value={draft.ehs} onChange={(value) => updateDraft('ehs', value)} options={riskLevelOptions} />
                  </Grid>
                </Grid>

                <Box sx={{ mb: 1.8 }}>
                  <WorkOrderSelect
                    label="Priority *"
                    value={draft.priority}
                    onChange={(value) => updateDraft('priority', value)}
                    options={severityLevels.map((priority) => ({ value: priority, label: prioritySlaDefinitions[priority].label }))}
                  />
                </Box>
              </>
            ) : null}
          </>
        )}

        {!isCompletionReview && !isScheduledExecution ? (
          <>
            {isPlanningBoardWorkOrder ? (
              <Box sx={{ mb: 1.25 }}>
                <RelatedWorkInsight onReview={() => setIsRelatedWorkDialogOpen(true)} />
              </Box>
            ) : null}

            <ExecutionDrawerCollapsibleSection
              title="Assignment & Schedule"
              subtitle={draft.scheduledExecutionDay ? `Scheduled for ${draft.scheduledExecutionDay.fullLabel}` : 'Assign responsible and schedule execution.'}
              badge={<ExecutionSectionBadge label={assignedPeopleCount ? `${assignedPeopleCount} assigned` : 'Unassigned'} tone={assignedPeopleCount ? 'blue' : 'gray'} />}
              open={executionSectionsExpanded.assignment}
              onToggle={() => toggleExecutionSection('assignment')}
            >
              <Box sx={readOnlyContentSx}>
                <WorkOrderAssignmentTab
                  responsibleAssignee={draft.responsibleAssignee}
                  additionalAssignees={additionalAssignees}
                  scheduledExecutionDay={draft.scheduledExecutionDay}
                  onOpenSelector={openAssignmentSelector}
                  onScheduleDateChange={updateScheduledExecutionDay}
                  onRemoveResponsible={removeResponsibleAssignee}
                  onRemoveAdditional={removeAdditionalAssignee}
                />
              </Box>
            </ExecutionDrawerCollapsibleSection>

            <ExecutionDrawerCollapsibleSection
              title="Spare Parts"
              subtitle="Search and add required spare parts before scheduling."
              badge={<ExecutionSectionBadge label={`${selectedSpareParts.length} ${selectedSpareParts.length === 1 ? 'part' : 'parts'}`} tone={selectedSpareParts.length ? 'green' : 'gray'} />}
              open={executionSectionsExpanded.spareParts}
              onToggle={() => toggleExecutionSection('spareParts')}
            >
              <Box sx={readOnlyContentSx}>
                <WorkOrderSparePartsSectionContent
                  selectedParts={selectedSpareParts}
                  onSelectedPartsChange={handleSelectedSparePartsChange}
                  onOpenInventoryPart={openInventoryPartDrawer}
                  isReadyForPickUp={draft.isReadyForPickUp}
                  onPickUp={() => {
                    if (!draft.responsibleAssignee) {
                      const defaultPerson = assignmentPeopleOptions.find(p => p.name === 'Bruno Aquino') || assignmentPeopleOptions[0];
                      const defaultDay = assignmentWeekDays.find(d => d.key === 'mon') || assignmentWeekDays[0];
                      setDraft(prev => ({
                        ...prev,
                        responsibleAssignee: defaultPerson,
                        scheduledExecutionDay: defaultDay
                      }));
                    }
                  }}
                />
              </Box>
            </ExecutionDrawerCollapsibleSection>

            <ExecutionDrawerCollapsibleSection
              title="Safety Requirements"
              subtitle={`${draft.safetyRequirementPlan.equipmentCondition ? `${draft.safetyRequirementPlan.equipmentCondition} - ` : ''}${draft.safetyRequirementPlan.lotoRequired ? `LOTO required - ${draft.safetyRequirementPlan.lockoutPoint || 'Lockout point not set'}` : 'No safety requirements selected'}`}
              badge={<ExecutionSectionBadge label={`${safetyRequirementCount} selected`} tone={draft.safetyRequirementPlan.lotoRequired ? 'red' : 'gray'} />}
              open={executionSectionsExpanded.safety}
              onToggle={() => toggleExecutionSection('safety')}
            >
              <Box sx={readOnlyContentSx}>
                <WorkOrderSafetyRequirementsTab
                  safetyPlan={draft.safetyRequirementPlan}
                  onSafetyPlanChange={(safetyRequirementPlan) => setDraft((current) => ({ ...current, safetyRequirementPlan }))}
                />
              </Box>
            </ExecutionDrawerCollapsibleSection>

            <ExecutionDrawerCollapsibleSection
              title="Quality Requirements"
              subtitle={draft.qualityRequirementPlan.qualityImpacting ? 'Quality impacting work' : 'No quality requirements selected'}
              badge={<ExecutionSectionBadge label={`${qualityRequirementCount} selected`} tone={draft.qualityRequirementPlan.qualityImpacting ? 'green' : 'gray'} />}
              open={executionSectionsExpanded.quality}
              onToggle={() => toggleExecutionSection('quality')}
            >
              <Box sx={readOnlyContentSx}>
                <WorkOrderQualityRequirementsTab
                  qualityPlan={draft.qualityRequirementPlan}
                  onQualityPlanChange={(qualityRequirementPlan) => setDraft((current) => ({ ...current, qualityRequirementPlan }))}
                />
              </Box>
            </ExecutionDrawerCollapsibleSection>

            {!isPlanningBoardWorkOrder && linkedWorkOrderCount ? (
              <ExecutionDrawerCollapsibleSection
                title="Linked Work Orders"
                subtitle="Scheduled for the same execution day."
                badge={<ExecutionSectionBadge label={`${linkedWorkOrderCount} linked`} tone="blue" />}
                open={executionSectionsExpanded.linkedWorkOrders}
                onToggle={() => toggleExecutionSection('linkedWorkOrders')}
              >
                <LinkedWorkOrdersList linkedWorkOrders={linkedWorkOrders} />
              </ExecutionDrawerCollapsibleSection>
            ) : null}

            <ExecutionDrawerCollapsibleSection
              title="Attachments"
              subtitle={draft.attachmentSrc ? 'Image available for this Work Order.' : 'Attach supporting files for planning.'}
              badge={<ExecutionSectionBadge label={draft.attachmentSrc ? 'Available' : 'No attachment'} tone={draft.attachmentSrc ? 'blue' : 'gray'} />}
              open={executionSectionsExpanded.attachments}
              onToggle={() => toggleExecutionSection('attachments')}
            >
              <WorkOrderAttachmentPanel draft={draft} />
            </ExecutionDrawerCollapsibleSection>

            {logHistoryCount ? (
              <ExecutionDrawerCollapsibleSection
                title="Log History"
                subtitle="Card updates and status changes."
                badge={<ExecutionSectionBadge label={`${logHistoryCount} changes`} tone="gray" />}
                open={executionSectionsExpanded.logHistory}
                onToggle={() => toggleExecutionSection('logHistory')}
              >
                <WorkOrderLogHistorySection draft={draft} />
              </ExecutionDrawerCollapsibleSection>
            ) : null}
          </>
        ) : null}
      </Box>

      <Box sx={{ px: 2.25, py: 1.5, borderTop: `1px solid ${tokenDivider}`, display: 'flex', justifyContent: 'flex-end', gap: 1, bgcolor: activeTheme.backgroundPaper }}>
        {isCompletionReview ? (
          <>
            <Button variant="text" onClick={onClose} sx={drawerTextButtonSx}>
              Close
            </Button>
            <Button
              variant="outlined"
              disabled={!rejectedReviewSections.length}
              onClick={rejectCompletionReview}
              sx={{
                ...drawerOutlinedButtonSx,
                color: tokenError.main,
                borderColor: tokenError.main,
                '&:hover': { bgcolor: tokenError.softBg, borderColor: tokenError.main, boxShadow: 'none' },
              }}
            >
              Reject
            </Button>
            <Button
              variant="contained"
              disabled={!canAcceptCompletionReview}
              onClick={acceptCompletionReview}
              sx={{ ...drawerContainedButtonSx, minWidth: 126 }}
            >
              Accept
            </Button>
          </>
        ) : (
          <>
            {!isReadOnlyWorkOrder ? footerExtraActions?.(draft) : null}
            <Button variant="text" onClick={onClose} sx={drawerTextButtonSx}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!canSubmit || isReadOnlyWorkOrder}
              onClick={submitWorkOrder}
              sx={drawerContainedButtonSx}
            >
              Submit
            </Button>
          </>
        )}
      </Box>
      </Box>
      <RelatedWorkDialog
        open={isRelatedWorkDialogOpen}
        onClose={() => setIsRelatedWorkDialogOpen(false)}
        onLink={draft.sourceRequestCardId && onLinkToExistingWork ? linkPlanningWorkOrderToExistingWork : undefined}
      />
      <AssignmentSelectorDrawer
        open={isAssignmentSelectorOpen}
        mode={assignmentSelectorMode}
        responsibleAssignee={draft.responsibleAssignee}
        additionalAssignees={additionalAssignees}
        scheduledExecutionDay={draft.scheduledExecutionDay}
        onClose={() => setIsAssignmentSelectorOpen(false)}
        onSelectResponsible={selectResponsibleAssignee}
        onAddPeople={addAdditionalAssignees}
      />
      <InventoryPartDrawer
        part={selectedInventoryPart}
        open={Boolean(selectedInventoryPart)}
        onClose={() => setSelectedInventoryPart(null)}
        purchaseRequested={selectedInventoryPart ? requestedInventoryPurchasePartIds.includes(selectedInventoryPart.id) : false}
        onRequestPurchase={requestInventoryPurchase}
      />
      <WidgetWorkOrderModal
        open={Boolean(selectedFullWorkOrder)}
        onClose={() => setSelectedFullWorkOrder(null)}
        workOrder={selectedFullWorkOrder}
        workOrderCandidates={buildWidgetWorkOrderCandidates(linkedWorkOrders)}
        linkedWorkOrders={selectedFullWorkOrder?.linkedWorkOrders ?? []}
      />
    </Drawer>
  );
}

function ContextInfoField({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0, p: 0.85, borderRadius: 1, bgcolor: '#F1F5F9', border: '1px solid #E2E8F0' }}>
      <Typography sx={{ color: '#64748B', fontSize: 9.5, fontWeight: 850, lineHeight: 1.1 }}>
        {label}
      </Typography>
      <Typography noWrap sx={{ color: '#111827', fontSize: 12, fontWeight: 850, lineHeight: 1.2, mt: 0.25 }}>
        {value}
      </Typography>
    </Box>
  );
}

function getContextDetailIcon(label: MaintenanceContextDetailView) {
  const icons: Record<MaintenanceContextDetailView, ReactNode> = {
    Documents: <DocumentIcon sx={{ fontSize: 19 }} />,
    '3D View': <ViewInArIcon sx={{ fontSize: 19 }} />,
    ESOs: <CheckIcon sx={{ fontSize: 18 }} />,
    'Event log': <GenericFileIcon sx={{ fontSize: 19 }} />,
    'Main KPIs': <KpiIcon sx={{ fontSize: 19 }} />,
    Notifications: <NotificationIcon sx={{ fontSize: 19 }} />,
    Properties: <InfoOutlinedIcon sx={{ fontSize: 19 }} />,
    'Related work': <WrenchIcon sx={{ fontSize: 19 }} />,
    'Spare parts': <InventoryDrawerIcon sx={{ fontSize: 19 }} />,
    Timeseries: <TimeseriesIcon sx={{ fontSize: 19 }} />,
    Training: <TrainingIcon sx={{ fontSize: 19 }} />,
  };

  return icons[label];
}

function getContextDetailCount(label: MaintenanceContextDetailView, context: MaintenanceContextualization) {
  return context.counts.find((item) => item.label === label)?.value ?? '0';
}

function getFileTypeIcon(format: string) {
  const color = format === 'PDF' ? '#EF4444' : format === 'XLSX' || format === 'CSV' ? '#16A34A' : format === 'PPTX' ? '#F59E0B' : '#2563EB';
  return <FileIcon sx={{ fontSize: 24, color }} />;
}

function ContextSectionRow({
  label,
  count,
  onOpen,
}: {
  label: MaintenanceContextDetailView;
  count: string;
  onOpen: () => void;
}) {

  return (
    <Box sx={{ borderTop: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
      <Box
        component="button"
        type="button"
        onClick={onOpen}
        sx={{
          width: '100%',
          border: 0,
          bgcolor: 'transparent',
          px: 1.2,
          py: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto auto',
          alignItems: 'center',
          gap: 0.8,
          textAlign: 'left',
          cursor: 'pointer',
          '&:hover': { bgcolor: '#F8FAFC' },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, minWidth: 0 }}>
          <Box sx={{ width: 22, color: '#475569', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {getContextDetailIcon(label)}
          </Box>
          <Typography sx={{ color: '#111827', fontSize: 12.5, fontWeight: 750, lineHeight: 1.2 }}>
            {label}
          </Typography>
        </Box>
        <Chip label={count} size="small" sx={{ height: 19, bgcolor: '#F1F5F9', color: '#64748B', fontSize: 10, fontWeight: 850 }} />
        <KeyboardArrowRightIcon sx={{ color: '#64748B', fontSize: 18 }} />
      </Box>
    </Box>
  );
}

function MaintenanceContextualizationDrawer({
  context,
  open,
  onClose,
  onCreateWorkOrder,
}: {
  context: MaintenanceContextualization | null;
  open: boolean;
  onClose: () => void;
  onCreateWorkOrder?: () => void;
}) {
  const [analysisExpanded, setAnalysisExpanded] = useState(true);
  const [detailView, setDetailView] = useState<MaintenanceContextDetailView | null>(null);
  const [documentCategory, setDocumentCategory] = useState<MaintenanceDocumentCategory | null>(null);
  const [selectedEquipmentView, setSelectedEquipmentView] = useState(2);
  const title = context?.title ?? 'Contextualization';
  const subtitle = context
    ? `${context.contextId} - ${context.location} - Opened ${context.openedAt}`
    : '';

  useEffect(() => {
    if (!open) {
      setDetailView(null);
      setDocumentCategory(null);
      setSelectedEquipmentView(2);
      setAnalysisExpanded(true);
    }
  }, [open]);

  const closeSubScreen = () => {
    if (documentCategory) {
      setDocumentCategory(null);
      return;
    }
    if (detailView) {
      setDetailView(null);
      return;
    }
    onClose();
  };

  const detailTitle = context && detailView
    ? documentCategory ?? `${detailView} ${getContextDetailCount(detailView, context)}`
    : title;
  const detailSubtitle = context && detailView ? `${context.equipment} - ${context.location}` : subtitle;

  const renderDetailContent = () => {
    if (!context || !detailView) return null;

    if (detailView === 'Documents') {
      if (documentCategory) {
        return (
          <Box sx={{ p: 1.3, display: 'grid', gap: 1 }}>
            {maintenanceDocumentFiles[documentCategory].map((file) => (
              <Box key={file.name} component="button" type="button" sx={{ p: 1.35, minHeight: 74, display: 'grid', gridTemplateColumns: '28px minmax(0, 1fr) auto auto', alignItems: 'center', gap: 1.2, textAlign: 'left', border: '1px solid #E5E7EB', borderRadius: 1.5, bgcolor: activeTheme.backgroundPaper, cursor: 'pointer', '&:hover': { borderColor: '#0B63E5', bgcolor: '#F8FAFC' } }}>
                {getFileTypeIcon(file.format)}
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: '#111827', fontSize: 12.8, fontWeight: 800, lineHeight: 1.25 }}>{file.name}</Typography>
                  <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 650, mt: 0.45 }}>{file.size} - {file.updated}</Typography>
                </Box>
                <Chip label={file.format} size="small" sx={{ height: 22, bgcolor: '#EFF6FF', color: '#1663FF', fontSize: 9, fontWeight: 900 }} />
                <KeyboardArrowRightIcon sx={{ color: '#1663FF', fontSize: 18 }} />
              </Box>
            ))}
          </Box>
        );
      }

      return (
        <Box sx={{ bgcolor: activeTheme.backgroundPaper }}>
          {maintenanceDocumentCategories.map((item) => (
            <Box key={item.label} component="button" type="button" onClick={() => setDocumentCategory(item.label)} sx={{ width: '100%', px: 1.4, py: 1.25, display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) auto auto', alignItems: 'center', gap: 0.9, border: 0, borderBottom: '1px solid #E5E7EB', bgcolor: 'transparent', textAlign: 'left', cursor: 'pointer', '&:hover': { bgcolor: '#EFF6FF' } }}>
              <DocumentIcon sx={{ color: '#1663FF', fontSize: 18 }} />
              <Typography sx={{ color: '#111827', fontSize: 12.8, fontWeight: 750 }}>{item.label}</Typography>
              <Typography sx={{ color: '#64748B', fontSize: 11, fontWeight: 650 }}>{item.count}</Typography>
              <KeyboardArrowRightIcon sx={{ color: '#1663FF', fontSize: 18 }} />
            </Box>
          ))}
        </Box>
      );
    }

    if (detailView === '3D View') {
      const selected = maintenanceEquipmentViews[selectedEquipmentView] ?? maintenanceEquipmentViews[0];
      return (
        <Box sx={{ p: 1.3 }}>
          <Paper elevation={0} sx={{ p: 1.25, borderRadius: 1.4, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              <Typography sx={{ color: '#111827', fontSize: 12.6, fontWeight: 900 }}>{selected.label}</Typography>
              <Typography sx={{ color: '#64748B', fontSize: 10.5, fontWeight: 700 }}>View {selectedEquipmentView + 1} of {maintenanceEquipmentViews.length}</Typography>
            </Box>
            <Typography sx={{ color: '#64748B', fontSize: 11.2, fontWeight: 650, lineHeight: 1.35, mt: 0.55 }}>
              Select another angle below to inspect the equipment from a different perspective.
            </Typography>
          </Paper>
          <Box component="img" src={selected.path} alt={selected.label} sx={{ mt: 1.2, width: '100%', height: 188, objectFit: 'contain', borderRadius: 1.4, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }} />
          <Box sx={{ mt: 1.2, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.85 }}>
            {maintenanceEquipmentViews.map((view, index) => (
              <Box key={view.label} component="button" type="button" onClick={() => setSelectedEquipmentView(index)} sx={{ p: 0.45, borderRadius: 1, border: `2px solid ${index === selectedEquipmentView ? '#1663FF' : 'transparent'}`, bgcolor: activeTheme.backgroundPaper, cursor: 'pointer' }}>
                <Box component="img" src={view.path} alt="" sx={{ display: 'block', width: '100%', height: 56, objectFit: 'cover', borderRadius: 0.8 }} />
                <Typography sx={{ color: '#111827', fontSize: 10.5, fontWeight: index === selectedEquipmentView ? 900 : 700, lineHeight: 1.15, mt: 0.45 }}>{view.label}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      );
    }

    if (detailView === 'Event log') {
      const events = [
        { time: '08:42', title: 'Tracking deviation detected', detail: 'Vision inspection measured 2.4 mm lateral drift.', tone: '#EF4444', status: 'CRITICAL' },
        { time: '08:36', title: 'Roller drag increased', detail: 'Motor current exceeded its 7-day baseline by 8%.', tone: '#F59E0B', status: 'WARNING' },
        { time: '08:30', title: 'Maintenance request opened', detail: `${context.mrNumber} created automatically by BLU.AI.`, tone: '#2563EB', status: 'INFORMATION' },
        { time: 'Yesterday', title: 'Operator inspection completed', detail: 'No visible belt damage recorded during shift handoff.', tone: '#16A34A', status: 'COMPLETED' },
      ];

      return (
        <Box sx={{ p: 1.5, display: 'grid', gap: 1.7 }}>
          {events.map((event) => (
            <Box key={`${event.time}-${event.title}`} sx={{ display: 'grid', gridTemplateColumns: '54px 13px minmax(0, 1fr)', gap: 0.9 }}>
              <Typography sx={{ color: '#64748B', fontSize: 11.2, fontWeight: 650 }}>{event.time}</Typography>
              <Box sx={{ mt: 0.25, width: 8, height: 8, borderRadius: 999, bgcolor: event.tone }} />
              <Box>
                <Typography sx={{ color: '#111827', fontSize: 12.7, fontWeight: 850 }}>{event.title}</Typography>
                <Typography sx={{ color: '#64748B', fontSize: 11.2, fontWeight: 650, lineHeight: 1.35, mt: 0.45 }}>{event.detail}</Typography>
                <Typography sx={{ color: '#94A3B8', fontSize: 10.2, fontWeight: 850, mt: 0.55 }}>{event.status}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      );
    }

    const assetPropertyRows = [
      'Asset class: Conveyor',
      `Location: ${context.location}`,
      'Criticality: A',
      'Area: Molding',
      'Manufacturer: BD standard asset profile',
      ...Array.from({ length: 46 }, (_, index) => `Technical property ${String(index + 6).padStart(2, '0')}`),
    ];
    const detailRows: Record<Exclude<MaintenanceContextDetailView, 'Documents' | '3D View' | 'Event log'>, string[]> = {
      ESOs: ['Open safety observation linked to access area', 'Historical lubrication observation'],
      'Main KPIs': ['Downtime risk: Medium', 'Quality risk: Medium', 'EHS risk: Low', 'Availability: 96.8%', 'Jam frequency: 1.2 / hr', 'Motor current: 8.4 A'],
      Notifications: ['Belt drift threshold exceeded', `${context.mrNumber} assigned to Line Maintenance`, 'Transfer accuracy below 95% target', 'Spare belt stock reached reorder level', `${context.woNumber} moved to In Progress`, 'Vibration reading attached', 'Quarterly conveyor inspection completed'],
      Properties: assetPropertyRows,
      'Related work': [`${context.woNumber} active flow`, `${context.mrNumber} originating request`, `Similar work on ${context.equipment}`, 'Preventive inspection candidate', 'Past corrective action'],
      'Spare parts': ['Polyurethane conveyor belt', 'Flange bearing', 'Vibration sensor', 'Timing belt', 'Photoelectric sensor', 'Gearmotor assembly', 'Safety interlock switch', 'Drive roller chain'],
      Timeseries: ['Availability', 'Jam frequency', 'Motor current', 'Health score', 'Drive bearing vibration', 'Belt lateral deviation'],
      Training: ['Conveyor belt tracking fundamentals', 'Lockout/tagout for conveyor maintenance', 'Transfer roller inspection standard', 'Belt tension measurement guide'],
    };

    return (
      <Box sx={{ p: 1.3, display: 'grid', gap: 0.75 }}>
        {detailRows[detailView].map((detail) => (
          <Box key={detail} sx={{ px: 1.15, py: 1, display: 'grid', gridTemplateColumns: '22px minmax(0, 1fr) auto', alignItems: 'center', gap: 0.85, borderRadius: 1, border: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
            <Box sx={{ color: '#475569', display: 'inline-flex' }}>{getContextDetailIcon(detailView)}</Box>
            <Typography sx={{ color: '#111827', fontSize: 12.3, fontWeight: 750, lineHeight: 1.25 }}>{detail}</Typography>
            <KeyboardArrowRightIcon sx={{ color: '#1663FF', fontSize: 17 }} />
          </Box>
        ))}
      </Box>
    );
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          width: { xs: '100vw', sm: 430 },
          maxWidth: '100vw',
          bgcolor: '#F8FAFC',
          boxShadow: '-18px 0 42px rgba(15, 23, 42, 0.18)',
        },
      }}
    >
      <Box sx={{ height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ px: 1.4, py: 1.1, display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', gap: 0.8, alignItems: 'center', borderBottom: '1px solid #E5E7EB' }}>
          <IconButton size="small" onClick={closeSubScreen} sx={lightHeaderIconButtonSx} aria-label={detailView ? 'Back' : 'Close contextualization'}>
            <KeyboardArrowLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ color: '#111827', fontSize: 14.5, fontWeight: 900, lineHeight: 1.1 }}>
              {detailTitle}
            </Typography>
            <Typography noWrap sx={{ color: '#64748B', fontSize: 10.8, fontWeight: 650, mt: 0.2 }}>
              {detailSubtitle}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} sx={lightHeaderIconButtonSx} aria-label="Close contextualization">
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {context && detailView ? (
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', bgcolor: '#F8FAFC' }}>
            {renderDetailContent()}
          </Box>
        ) : context ? (
          <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', bgcolor: '#F8FAFC' }}>
            <Box sx={{ p: 1.3 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mb: 0.75 }}>
                <ContextInfoField label="Context ID" value={context.contextId} />
                <ContextInfoField label="Location" value={context.location} />
              </Box>
              <ContextInfoField label="Equipment" value={context.equipment} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mt: 0.75 }}>
                <ContextInfoField label="MR Number" value={context.mrNumber} />
                <ContextInfoField label="WO Number" value={context.woNumber} />
              </Box>
              <Box sx={{ mt: 0.75 }}>
                <ContextInfoField label="Context type" value={context.kind.toUpperCase()} />
              </Box>

              <Alert severity="warning" sx={{ mt: 1.2, borderRadius: 1.2, border: '1px solid #FED7AA', bgcolor: '#FFF7ED', color: '#7C2D12', fontSize: 11.5, fontWeight: 700 }}>
                {context.summary}
              </Alert>

              <Paper elevation={0} sx={{ mt: 1.2, p: 1.2, borderRadius: 1.3, border: '1px solid #D8E4F2', bgcolor: activeTheme.backgroundPaper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.8 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
                    <SparkleIcon sx={{ color: '#FF8A00', fontSize: 18 }} />
                    <Typography sx={{ color: '#1663FF', fontSize: 12.8, fontWeight: 900 }}>
                      BLU.AI analysis
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => setAnalysisExpanded((current) => !current)}
                    endIcon={<KeyboardArrowUpIcon sx={{ fontSize: 14, transform: analysisExpanded ? 'none' : 'rotate(180deg)' }} />}
                    sx={{ minWidth: 0, px: 0.4, py: 0, color: '#64748B', fontSize: 9.5, fontWeight: 850, textTransform: 'uppercase' }}
                  >
                    {analysisExpanded ? 'Collapse' : 'Expand'}
                  </Button>
                </Box>
                {analysisExpanded ? (
                  <>
                    <Typography sx={{ color: '#111827', fontSize: 12.5, fontWeight: 900, mb: 0.35 }}>
                      Contextual Maintenance Review
                    </Typography>
                    <Typography sx={{ color: '#475569', fontSize: 11.5, fontWeight: 650, lineHeight: 1.35 }}>
                      {context.recommendation}
                    </Typography>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<WrenchIcon sx={{ fontSize: 17 }} />}
                      onClick={onCreateWorkOrder}
                      sx={{ mt: 1, height: 34, borderRadius: 1, bgcolor: '#0B63E5', fontSize: 12, fontWeight: 900, textTransform: 'none', boxShadow: 'none' }}
                    >
                      Create work order
                    </Button>
                  </>
                ) : null}
              </Paper>
            </Box>

            <Box sx={{ borderTop: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundPaper }}>
              {context.counts.map((item) => (
                <ContextSectionRow
                  key={item.label}
                  label={item.label as MaintenanceContextDetailView}
                  count={item.value}
                  onOpen={() => setDetailView(item.label as MaintenanceContextDetailView)}
                />
              ))}
            </Box>
          </Box>
        ) : null}
      </Box>
    </Drawer>
  );
}

export default function MaintenanceFollowUpBoardPage() {
  const [maintenanceViewMode, setMaintenanceViewMode] = useState<'list' | 'card'>('card');
  const [maintenanceSearch, setMaintenanceSearch] = useState('');
  const [maintenanceFocusMode, setMaintenanceFocusMode] = useState(false);
  const [filtersAnchorEl, setFiltersAnchorEl] = useState<HTMLElement | null>(null);
  const [boardFilters, setBoardFilters] = useState<FollowUpBoardFilters>(emptyFollowUpBoardFilters);
  const boardDragStateRef = useRef<BoardDragState | null>(null);
  const [isBoardDragging, setIsBoardDragging] = useState(false);
  const [maintenanceLaneExpanded, setMaintenanceLaneExpanded] = useState<LaneExpandedState>({
    requests: true,
    planning: true,
    scheduled: true,
    progress: true,
    review: true,
    closed: true,
  });
  const [resumedWorkOrderIds, setResumedWorkOrderIds] = useState<string[]>([]);
  const [resumeHistoryByCardId, setResumeHistoryByCardId] = useState<Record<string, string[]>>({});
  const [rejectedRequestsById, setRejectedRequestsById] = useState<Record<string, MaintenanceCard>>({});
  const [planningWorkOrdersByRequestId, setPlanningWorkOrdersByRequestId] = useState<Record<string, MaintenanceCard>>({});
  const [scheduledWorkOrdersByRequestId, setScheduledWorkOrdersByRequestId] = useState<Record<string, MaintenanceCard>>({});
  const [reviewFeedbackWorkOrdersById, setReviewFeedbackWorkOrdersById] = useState<Record<string, MaintenanceCard>>({});
  const [closedReviewWorkOrdersById, setClosedReviewWorkOrdersById] = useState<Record<string, MaintenanceCard>>({});
  const [linkedRequestsById, setLinkedRequestsById] = useState<Record<string, MaintenanceLinkedRequest>>({});
  const [draggedRequestCardId, setDraggedRequestCardId] = useState<string | null>(null);
  const [dragOverLane, setDragOverLane] = useState<LaneKey | null>(null);
  const [, setRejectionAuditTrail] = useState<MaintenanceRejectionAudit[]>([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'info' });
  const [hiddenNativePlanningCardIds, setHiddenNativePlanningCardIds] = useState<string[]>([]);
  const [isPlanningAgentOpen, setIsPlanningAgentOpen] = useState(false);
  const [planningAgentContext, setPlanningAgentContext] = useState<PlanningAgentContext | null>(null);
  const [isBulkAnalysisOpen, setIsBulkAnalysisOpen] = useState(false);
  const [bulkAnalysisResult, setBulkAnalysisResult] = useState<BulkAnalysisResult | null>(null);

  const getCurrentMaintenanceCard = (card: MaintenanceCard): MaintenanceCard =>
    resumedWorkOrderIds.includes(card.id) && isPausedWorkOrder(card) ? { ...card, executionState: 'active' } : card;

  const getVisibleMaintenanceCards = (cards: MaintenanceCard[], laneKey: LaneKey, laneTitle?: string) => {
    const query = maintenanceSearch.trim().toLowerCase();
    return cards
      .map(getCurrentMaintenanceCard)
      .filter((card) => matchesFollowUpBoardFilters(card, laneKey, laneTitle, boardFilters))
      .filter((card) => !query || `${card.title} ${card.detail} ${isPausedWorkOrder(card) ? 'paused' : ''}`.toLowerCase().includes(query));
  };

  const getFocusMaintenanceCards = (cards: MaintenanceCard[], laneKey: LaneKey, laneTitle?: string) => {
    const query = maintenanceSearch.trim().toLowerCase();
    return cards
      .map(getCurrentMaintenanceCard)
      .filter((card) => matchesFollowUpBoardFilters(card, laneKey, laneTitle, boardFilters))
      .filter((card) => !query || `${card.title} ${card.detail} ${isPausedWorkOrder(card) ? 'paused' : ''}`.toLowerCase().includes(query));
  };

  const [isWorkOrderDrawerOpen, setIsWorkOrderDrawerOpen] = useState(false);
  const [selectedRequestCard, setSelectedRequestCard] = useState<MaintenanceCard | null>(null);
  const [workOrderDraft, setWorkOrderDraft] = useState<WorkOrderDraft | null>(null);
  const [workOrderTab, setWorkOrderTab] = useState<WorkOrderTab>('attachments');
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [selectedContextualization, setSelectedContextualization] = useState<MaintenanceContextualization | null>(null);
  const requestCardsRemovedFromQueue = new Set([
    ...Object.keys(rejectedRequestsById),
    ...Object.keys(planningWorkOrdersByRequestId),
    ...Object.keys(scheduledWorkOrdersByRequestId),
    ...Object.keys(linkedRequestsById),
  ]);
  const activeRequestCards = maintenanceLaneData.requests.filter((card) => !requestCardsRemovedFromQueue.has(card.id));
  const reviewCardsMovedFromDone = new Set([
    ...Object.keys(reviewFeedbackWorkOrdersById),
    ...Object.keys(closedReviewWorkOrdersById),
  ]);
  const doneCards = maintenanceLaneData.review.filter((card) => !reviewCardsMovedFromDone.has(card.id));
  const closedCards = [...Object.values(rejectedRequestsById), ...Object.values(closedReviewWorkOrdersById), ...maintenanceLaneData.closed];
  const activePlanningCards = maintenanceLaneData.team.scheduling.filter((card) => !hiddenNativePlanningCardIds.includes(card.id));
  const laneDefinitions: LaneDefinition[] = [
    { key: 'requests', title: 'Maintenance Request', cards: getVisibleMaintenanceCards(activeRequestCards, 'requests') },
    { key: 'planning', title: 'Planning', cards: getVisibleMaintenanceCards([...Object.values(planningWorkOrdersByRequestId), ...activePlanningCards], 'planning', 'Planning') },
    { key: 'scheduled', title: 'Scheduled', cards: getVisibleMaintenanceCards([...Object.values(scheduledWorkOrdersByRequestId), ...maintenanceLaneData.team.scheduled], 'scheduled', 'Scheduled') },
    { key: 'progress', title: 'In Progress', cards: getVisibleMaintenanceCards([...Object.values(reviewFeedbackWorkOrdersById), ...maintenanceLaneData.team.progress], 'progress', 'In Progress') },
    { key: 'review', title: 'Done', cards: getVisibleMaintenanceCards(doneCards, 'review') },
    { key: 'closed', title: 'Closed', cards: getVisibleMaintenanceCards(closedCards, 'closed') },
  ];
  const focusLaneDefinitions: LaneDefinition[] = [
    { key: 'requests', title: 'Maintenance Request', cards: getFocusMaintenanceCards(activeRequestCards, 'requests') },
    { key: 'progress', title: 'In Progress', cards: getFocusMaintenanceCards([...Object.values(reviewFeedbackWorkOrdersById), ...maintenanceLaneData.team.progress], 'progress', 'In Progress') },
    { key: 'review', title: 'Done', cards: getFocusMaintenanceCards(doneCards, 'review') },
  ];
  const boardLaneDefinitions = maintenanceFocusMode ? focusLaneDefinitions : laneDefinitions;
  const maintenanceListRows = buildMaintenanceListRows(laneDefinitions);
  const allCollapsed = laneDefinitions.every((lane) => !maintenanceLaneExpanded[lane.key]);
  const filtersOpen = Boolean(filtersAnchorEl);
  const activeFilterCount = getFollowUpBoardFilterCount(boardFilters);
  const hasActiveFilters = hasFollowUpBoardFilters(boardFilters);

  const openContextualization = (context: MaintenanceContextualization) => {
    setSelectedContextualization(context);
  };

  const clearFollowUpBoardFilters = () => {
    setBoardFilters(emptyFollowUpBoardFilters);
  };

  const toggleStatusFilter = (status: FollowUpStatus) => {
    setBoardFilters((current) => ({ ...current, statuses: toggleFilterOption(current.statuses, status) }));
  };

  const toggleTagFilter = (tag: FollowUpTag) => {
    setBoardFilters((current) => ({ ...current, tags: toggleFilterOption(current.tags, tag) }));
  };

  const toggleTypeFilter = (type: FollowUpType) => {
    setBoardFilters((current) => ({ ...current, types: toggleFilterOption(current.types, type) }));
  };

  const togglePriorityFilter = (priority: MaintenancePriority) => {
    setBoardFilters((current) => ({ ...current, priorities: toggleFilterOption(current.priorities, priority) }));
  };

  const toggleCriticalityFilter = (criticality: FollowUpCriticality) => {
    setBoardFilters((current) => ({ ...current, criticalities: toggleFilterOption(current.criticalities, criticality) }));
  };

  const toggleAssignedToFilter = (assignedTo: FollowUpAssignedTo) => {
    setBoardFilters((current) => ({ ...current, assignedTo: toggleFilterOption(current.assignedTo, assignedTo) }));
  };

  const clearAssetHierarchyFilter = () => {
    setBoardFilters((current) => ({ ...current, assetHierarchy: null }));
  };

  const removeDateFilter = (option: FollowUpDateOption) => {
    setBoardFilters((current) => ({
      ...current,
      dates: current.dates.filter((item) => item !== option),
      dateRange: option === 'Custom Range' ? { start: '', end: '' } : current.dateRange,
    }));
  };

  const activeFilterChips: FollowUpFilterChip[] = [
    ...boardFilters.statuses.map((status) => ({ key: `status-${status}`, label: `State: ${status}`, onDelete: () => toggleStatusFilter(status) })),
    ...boardFilters.tags.map((tag) => ({ key: `tag-${tag}`, label: `Tag: ${tag}`, onDelete: () => toggleTagFilter(tag) })),
    ...boardFilters.types.map((type) => ({ key: `type-${type}`, label: `Type: ${type}`, onDelete: () => toggleTypeFilter(type) })),
    ...boardFilters.priorities.map((priority) => ({ key: `priority-${priority}`, label: `Priority: ${priority}`, onDelete: () => togglePriorityFilter(priority) })),
    ...(boardFilters.assetHierarchy
      ? [
          {
            key: `asset-${boardFilters.assetHierarchy.id}`,
            label: `Asset: ${boardFilters.assetHierarchy.name}`,
            onDelete: clearAssetHierarchyFilter,
          },
        ]
      : []),
    ...boardFilters.criticalities.map((criticality) => ({
      key: `criticality-${criticality}`,
      label: `Asset Criticality: ${criticality}`,
      onDelete: () => toggleCriticalityFilter(criticality),
    })),
    ...(boardFilters.assignedToSearch.trim()
      ? [
          {
            key: 'assigned-search',
            label: `Assigned: ${boardFilters.assignedToSearch.trim()}`,
            onDelete: () => setBoardFilters((current) => ({ ...current, assignedToSearch: '' })),
          },
        ]
      : []),
    ...boardFilters.assignedTo.map((assignedTo) => ({
      key: `assigned-${assignedTo}`,
      label: `Assigned: ${assignedTo}`,
      onDelete: () => toggleAssignedToFilter(assignedTo),
    })),
    ...boardFilters.dates.map((option) => ({
      key: `date-${option}`,
      label:
        option === 'Custom Range' && (boardFilters.dateRange.start || boardFilters.dateRange.end)
          ? `Date: ${boardFilters.dateRange.start || 'Start'} - ${boardFilters.dateRange.end || 'End'}`
          : `Date: ${option}`,
      onDelete: () => removeDateFilter(option),
    })),
  ];

  const setAllLanesExpanded = (expanded: boolean) => {
    laneDefinitions.forEach((lane) => setMaintenanceLaneExpanded(prev => ({ ...prev, [lane.key]: expanded })));
  };

  const openBlankWorkOrderDrawer = () => {
    setWorkOrderDraft(null);
    setWorkOrderTab('attachments');
    setIsWorkOrderDrawerOpen(true);
  };

  const openWorkOrderDrawerFromRequest = (card: MaintenanceCard) => {
    setWorkOrderDraft(buildWorkOrderDraftFromRequest(card));
    setWorkOrderTab('attachments');
    setSelectedRequestCard(null);
    setIsWorkOrderDrawerOpen(true);
  };

  const acceptRequestToPlanning = (card: MaintenanceCard) => {
    const details = getMaintenanceRequestDetails(card);
    setPlanningWorkOrdersByRequestId((current) => ({
      ...current,
      [card.id]: buildPlanningWorkOrderFromRequest(card),
    }));
    setScheduledWorkOrdersByRequestId((current) => {
      const next = { ...current };
      delete next[card.id];
      return next;
    });
    setLinkedRequestsById((current) => {
      const next = { ...current };
      delete next[card.id];
      return next;
    });
    setSelectedRequestCard(null);
    setSnackbar({
      open: true,
      message: `${details.requestId} accepted and moved to Planning.`,
      severity: 'success',
    });
  };

  const linkRequestToExistingWork = (card: MaintenanceCard, candidate: MaintenanceLinkedWorkCandidate) => {
    const details = getMaintenanceRequestDetails(card);
    setLinkedRequestsById((current) => ({
      ...current,
      [card.id]: {
        requestId: details.requestId,
        cardId: card.id,
        candidate,
      },
    }));
    setPlanningWorkOrdersByRequestId((current) => {
      const next = { ...current };
      delete next[card.id];
      return next;
    });
    setScheduledWorkOrdersByRequestId((current) => {
      const next = { ...current };
      delete next[card.id];
      return next;
    });
    setSelectedRequestCard(null);
    setSnackbar({
      open: true,
      message: `${details.requestId} attached to ${candidate.title}.`,
      severity: 'success',
    });
  };

  const submitWorkOrder = (draft: WorkOrderDraft) => {
    if (draft.sourceRequestCardId) {
      setScheduledWorkOrdersByRequestId((current) => ({
        ...current,
        [draft.sourceRequestCardId!]: buildScheduledWorkOrderFromDraft(draft),
      }));
      setPlanningWorkOrdersByRequestId((current) => {
        const next = { ...current };
        delete next[draft.sourceRequestCardId!];
        return next;
      });
      setSnackbar({
        open: true,
        message: `${draft.sourceRequestId ?? 'Maintenance Request'} planned and moved to Scheduled.`,
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Work Order submitted successfully.',
        severity: 'success',
      });
    }

    closeWorkOrderDrawer();
  };

  const openPlanningAgent = (card: MaintenanceCard, source: PlanningAgentSource) => {
    setPlanningAgentContext(buildBoardPlanningAgentContext(card, source));
    setIsPlanningAgentOpen(true);
  };

  const openDemoPlanningAgent = () => {
    setPlanningAgentContext(buildBoardDemoPlanningAgentContext());
    setIsPlanningAgentOpen(true);
  };

  const openBulkAnalysis = () => {
    const requestItems = activeRequestCards.map((card) => {
      const details = getMaintenanceRequestDetails(card);
      const hierarchy = boardCardHierarchyIdsById[card.id];
      return {
        cardId: card.id,
        requestId: details.requestId,
        title: card.title,
        detail: card.detail,
        priority: card.priority,
        criticality: card.equipmentCriticality ?? boardCardGradeById[card.id],
        hierarchy,
        lineId: hierarchy?.[2],
      };
    });
    const existingWork: BulkExistingWork[] = [
      ...activePlanningCards.map((card) => ({
        cardId: card.id,
        title: card.title,
        status: 'Planning',
        lane: 'planning' as const,
        type: 'Work Order' as const,
      })),
      ...maintenanceLaneData.team.scheduled.map((card) => ({
        cardId: card.id,
        title: card.title,
        status: 'Scheduled',
        lane: 'scheduled' as const,
        type: card.title.toLowerCase().includes('pm') ? ('Preventive' as const) : ('Work Order' as const),
      })),
    ];
    const pmCandidates: BulkPmCandidate[] = linkedWorkCandidates
      .filter((candidate) => candidate.type === 'Preventive')
      .map((candidate) => ({
        id: candidate.id,
        title: candidate.title,
        description: candidate.description,
        scheduledFor: candidate.scheduledFor,
        assignee: candidate.assignee,
        status: candidate.status,
        type: 'Preventive' as const,
      }));
    setBulkAnalysisResult(analyzeBulkRequests({ requests: requestItems, existingWork, pmCandidates }));
    setIsBulkAnalysisOpen(true);
  };

  const applyBulkRecommendation = (recommendation: BulkRecommendation) => {
    recommendation.requests.forEach((requestItem) => {
      const card = maintenanceLaneData.requests.find((requestCard) => requestCard.id === requestItem.cardId);
      if (!card) return;

      if ((recommendation.action === 'link' || recommendation.action === 'absorb-pm') && recommendation.linkedTarget) {
        const target = recommendation.linkedTarget;
        const targetId = 'cardId' in target ? target.cardId : target.id;
        linkRequestToExistingWork(card, {
          id: targetId,
          type: recommendation.action === 'absorb-pm' ? 'Preventive' : 'Work Order',
          title: target.title,
          description: card.detail,
          scheduledFor: 'scheduledFor' in target ? target.scheduledFor : 'Planned',
          assignee: 'assignee' in target ? target.assignee : '-',
          status: target.status,
        });
        return;
      }

      acceptRequestToPlanning(card);
    });

    const savingsNote =
      recommendation.sharedParts?.length
        ? ` Shared spare parts batched: ${recommendation.sharedParts.join(', ')}.`
        : '';

    const actionLabel =
      recommendation.action === 'absorb-pm'
        ? `Absorbed ${recommendation.requests.length} request${recommendation.requests.length > 1 ? 's' : ''} into ${recommendation.linkedTarget?.title ?? 'upcoming PM'}.${savingsNote}`
        : recommendation.action === 'group-line'
          ? `Batched ${recommendation.requests.length} requests on the same production line into one shutdown window.${savingsNote}`
          : recommendation.action === 'group'
            ? `Grouped ${recommendation.requests.length} requests into one Work Order in Planning.${savingsNote}`
            : recommendation.action === 'link'
              ? `Linked ${recommendation.requests.length} request${recommendation.requests.length > 1 ? 's' : ''} to ${recommendation.linkedTarget?.title ?? 'existing work'}.${savingsNote}`
              : `${recommendation.requests[0]?.title ?? 'Request'} moved to Planning as a new Work Order.`;
    setSnackbar({ open: true, message: actionLabel, severity: 'success' });
  };

  const applyAllBulkRecommendations = (recommendations: BulkRecommendation[]) => {
    recommendations.forEach(applyBulkRecommendation);
    setSnackbar({
      open: true,
      message: `Applied ${recommendations.length} BLU.AI recommendation${recommendations.length > 1 ? 's' : ''}.`,
      severity: 'success',
    });
  };

  const commitPlannedWorkOrder = (plan: PlannedWorkOrder) => {
    if (plan.linkedRequestCardId === 'mr-demo-sa204') {
      const demoDraft = buildWorkOrderDraftFromPlannedWorkOrder(plan, {
        ...emptyWorkOrderDraft,
        sourceRequestCardId: 'mr-demo-sa204',
        sourceRequestId: plan.linkedRequestId,
        equipment: plan.equipment,
        problemDescription: plan.description,
        maintenanceType: plan.maintenanceType,
        priority: plan.priority,
      });
      setScheduledWorkOrdersByRequestId((current) => ({
        ...current,
        'mr-demo-sa204': buildScheduledWorkOrderFromDraft(demoDraft),
      }));
      setSnackbar({
        open: true,
        message: `${plan.linkedRequestId} planned by BLU.AI and moved to Scheduled.`,
        severity: 'success',
      });
      return;
    }

    const requestCard = maintenanceLaneData.requests.find((card) => card.id === plan.linkedRequestCardId);

    if ((plan.action === 'link-pm' || plan.action === 'merge') && plan.linkedWorkOrderOrPm && requestCard) {
      linkRequestToExistingWork(requestCard, plan.linkedWorkOrderOrPm);
      return;
    }

    let baseDraft: WorkOrderDraft;
    if (requestCard) {
      baseDraft = buildWorkOrderDraftFromRequest(requestCard);
    } else {
      const nativePlanningCard =
        Object.values(planningWorkOrdersByRequestId).find((card) => card.id === planningAgentContext?.cardId) ??
        activePlanningCards.find((card) => card.id === planningAgentContext?.cardId);
      baseDraft = nativePlanningCard
        ? buildWorkOrderDraftFromBoardCard(nativePlanningCard, 'Planning')
        : {
            ...emptyWorkOrderDraft,
            sourceRequestCardId: plan.linkedRequestCardId,
            sourceRequestId: plan.linkedRequestId,
          };
    }

    const draft = buildWorkOrderDraftFromPlannedWorkOrder(plan, baseDraft);

    if (requestCard) {
      submitWorkOrder({ ...draft, sourceRequestCardId: requestCard.id, sourceRequestId: plan.linkedRequestId });
      return;
    }

    const nativePlanningCard = activePlanningCards.find((card) => card.id === planningAgentContext?.cardId);
    if (nativePlanningCard) {
      const scheduledCard = buildScheduledWorkOrderFromDraft({
        ...draft,
        sourceRequestCardId: `plan-${nativePlanningCard.id}`,
        sourceRequestId: plan.linkedRequestId,
      });
      setHiddenNativePlanningCardIds((current) => [...current, nativePlanningCard.id]);
      setScheduledWorkOrdersByRequestId((current) => ({
        ...current,
        [`plan-${nativePlanningCard.id}`]: scheduledCard,
      }));
      setSnackbar({
        open: true,
        message: `${nativePlanningCard.title} planned by BLU.AI and moved to Scheduled.`,
        severity: 'success',
      });
      return;
    }

    setSnackbar({
      open: true,
      message: `${plan.linkedRequestId} planned by BLU.AI and moved to Scheduled.`,
      severity: 'success',
    });
  };

  const rejectCompletionReview = (draft: WorkOrderDraft) => {
    if (!draft.sourceCardId) return;

    const sourceCard = maintenanceLaneData.review.find((card) => card.id === draft.sourceCardId) ?? reviewFeedbackWorkOrdersById[draft.sourceCardId];
    if (!sourceCard) return;
    const rejectedSections = draft.rejectedReviewSections ?? [];

    setReviewFeedbackWorkOrdersById((current) => ({
      ...current,
      [sourceCard.id]: {
        ...sourceCard,
        detail: draft.problemDescription || sourceCard.detail,
        tags: ['Feedback Review'],
      },
    }));
    setClosedReviewWorkOrdersById((current) => {
      const next = { ...current };
      delete next[sourceCard.id];
      return next;
    });
    setSnackbar({
      open: true,
      message: `${draft.sourceRequestId ?? 'Work Order'} returned to In Progress for ${rejectedSections.join(', ') || 'feedback review'}.`,
      severity: 'info',
    });
    closeWorkOrderDrawer();
  };

  const acceptCompletionReview = (draft: WorkOrderDraft) => {
    if (!draft.sourceCardId) return;

    const sourceCard = reviewFeedbackWorkOrdersById[draft.sourceCardId] ?? maintenanceLaneData.review.find((card) => card.id === draft.sourceCardId);
    if (!sourceCard) return;

    setClosedReviewWorkOrdersById((current) => ({
      ...current,
      [sourceCard.id]: {
        ...sourceCard,
        detail: draft.problemDescription || sourceCard.detail,
        tags: (sourceCard.tags ?? []).filter((tag) => !['Feedback Review', 'Second Touch', 'Safety Review', 'Quality Review', 'Notes Review'].includes(tag)),
      },
    }));
    setReviewFeedbackWorkOrdersById((current) => {
      const next = { ...current };
      delete next[sourceCard.id];
      return next;
    });
    setSnackbar({
      open: true,
      message: `${draft.sourceRequestId ?? 'Work Order'} accepted and moved to Closed.`,
      severity: 'success',
    });
    closeWorkOrderDrawer();
  };

  const startRequestDrag = (event: ReactDragEvent<HTMLElement>, card: MaintenanceCard) => {
    setDraggedRequestCardId(card.id);
    event.dataTransfer.effectAllowed = 'copyMove';
    event.dataTransfer.setData('text/plain', card.id);
  };

  const endRequestDrag = () => {
    setDraggedRequestCardId(null);
    setDragOverLane(null);
  };

  const dropRequestOnLane = (laneKey: LaneKey, event: ReactDragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const requestCardId = event.dataTransfer.getData('text/plain') || draggedRequestCardId;
    const card = maintenanceLaneData.requests.find((requestCard) => requestCard.id === requestCardId);
    endRequestDrag();

    if (!card || requestCardsRemovedFromQueue.has(card.id)) return;

    if (laneKey === 'planning') {
      acceptRequestToPlanning(card);
      return;
    }

    if (laneKey === 'scheduled') {
      openWorkOrderDrawerFromRequest(card);
    }
  };

  const openWorkOrderDrawerFromBoardCard = (card: MaintenanceCard, laneTitle?: string) => {
    const nextDraft = {
      ...buildWorkOrderDraftFromBoardCard(card, laneTitle),
      resumeHistory: resumeHistoryByCardId[card.id] ?? [],
    };
    setWorkOrderDraft({
      ...nextDraft,
    });
    setWorkOrderTab(nextDraft.drawerMode === 'scheduledExecution' ? 'spareParts' : 'attachments');
    setSelectedRequestCard(null);
    setIsWorkOrderDrawerOpen(true);
  };

  const resumePausedWorkOrder = (cardId: string) => {
    const resumeEvent = `Execution resumed by Bruno Aquino just now.`;
    setResumedWorkOrderIds((current) => (current.includes(cardId) ? current : [...current, cardId]));
    setResumeHistoryByCardId((current) => ({
      ...current,
      [cardId]: [...(current[cardId] ?? []), resumeEvent],
    }));
    return resumeEvent;
  };

  const closeWorkOrderDrawer = () => {
    setIsWorkOrderDrawerOpen(false);
    setWorkOrderDraft(null);
    setWorkOrderTab('attachments');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const rawIntent = window.sessionStorage.getItem(maintenanceBacklogIntentStorageKey);
    if (!rawIntent) return;

    window.sessionStorage.removeItem(maintenanceBacklogIntentStorageKey);

    let intent: MaintenanceBacklogIntent;
    try {
      intent = JSON.parse(rawIntent) as MaintenanceBacklogIntent;
    } catch {
      return;
    }

    if (intent.filters) {
      setBoardFilters((current) => ({
        ...current,
        ...intent.filters,
        dateRange: {
          ...current.dateRange,
          ...intent.filters?.dateRange,
        },
      }));

      const statuses = intent.filters.statuses ?? [];
      setMaintenanceLaneExpanded((current) => ({
        ...current,
        requests: statuses.includes('Requested') ? true : current.requests,
        planning: statuses.includes('Planning') ? true : current.planning,
        scheduled: statuses.includes('Scheduled') ? true : current.scheduled,
        progress: statuses.includes('In Progress') ? true : current.progress,
      }));
      return;
    }

    if (intent.mode === 'requests') {
      setBoardFilters((current) => ({
        ...current,
        statuses: ['Requested'],
        types: ['Maintenance Request'],
      }));
      setMaintenanceLaneExpanded((current) => ({...current, requests: true}));

      if (intent.cardId) {
        const requestCard = maintenanceLaneData.requests.find((card) => card.id === intent.cardId);
        if (requestCard) {
          setSelectedRequestCard(requestCard);
        }
      }
      return;
    }

    if (intent.mode === 'workOrders') {
      setBoardFilters((current) => ({
        ...current,
        statuses: ['Planning'],
      }));
      setMaintenanceLaneExpanded((current) => ({...current, planning: true}));

      if (intent.cardId) {
        const planningCards = [...Object.values(planningWorkOrdersByRequestId), ...maintenanceLaneData.team.scheduling];
        const planningCard = planningCards.find((card) => card.id === intent.cardId);
        if (planningCard) {
          openWorkOrderDrawerFromBoardCard(planningCard, 'Planning');
        }
      }
    }
  }, []);

  const rejectMaintenanceRequest = (card: MaintenanceCard, reason: MaintenanceRejectionReason, comment: string) => {
    const details = getMaintenanceRequestDetails(card);
    const rejectedAt = new Date().toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    const auditEntry: MaintenanceRejectionAudit = {
      requestId: details.requestId,
      cardId: card.id,
      reason,
      comment,
      user: 'Bruno Aquino',
      rejectedAt,
    };

    setRejectedRequestsById((current) => ({
      ...current,
      [card.id]: {
        ...card,
        rejection: {
          reason,
          comment,
          user: auditEntry.user,
          rejectedAt,
        },
      },
    }));
    setRejectionAuditTrail((current) => [auditEntry, ...current]);
    setSelectedRequestCard(null);
    setSnackbar({
      open: true,
      message: `${details.requestId} rejected and moved to Closed.`,
      severity: 'success',
    });
  };

  const handleBoardPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (isBoardDragBlocked(event.target, event.currentTarget)) return;

    boardDragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: event.currentTarget.scrollLeft,
    };
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleBoardPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = boardDragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    const dragDistance = event.clientX - dragState.startX;
    event.preventDefault();
    event.currentTarget.scrollLeft = dragState.scrollLeft - dragDistance;

    if (!isBoardDragging && Math.abs(dragDistance) > 3) {
      setIsBoardDragging(true);
    }
  };

  const endBoardDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = boardDragStateRef.current;
    if (!dragState || dragState.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    boardDragStateRef.current = null;
    setIsBoardDragging(false);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        overflowY: maintenanceFocusMode ? 'hidden' : 'visible',
        bgcolor: 'background.default',
        p: { xs: 2, md: 3 },
        ...(maintenanceFocusMode
          ? {
            position: 'fixed',
            inset: 0,
            zIndex: (theme) => theme.zIndex.modal + 1,
            height: '100dvh',
            overflow: 'hidden',
            bgcolor: '#F8FAFC',
            p: { xs: 1.2, md: 1.8 },
            display: 'flex',
            flexDirection: 'column',
          }
          : {}),
      }}
    >
      {!maintenanceFocusMode && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2.2,
            px: 1,
          }}
        >
          <Typography variant="h5" sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1.334 }}>
            Maintenance Follow Up Board
          </Typography>
        </Box>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: '12px',
          border: `1px solid ${tokenDivider}`,
          bgcolor: activeTheme.backgroundPaper,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
        }}
      >

        <Paper
          elevation={0}
          sx={{
            mb: maintenanceFocusMode ? 1 : 1.2,
            p: maintenanceFocusMode ? { xs: 1, md: 1.1 } : { xs: 1.4, md: 1.6 },
            borderRadius: maintenanceFocusMode ? 1.5 : 2.5,
            border: '1px solid #D8DEE8',
            bgcolor: activeTheme.backgroundPaper,
            flexShrink: 0,
          }}
        >
          {!maintenanceFocusMode ? (
            <>
              <MaintenanceAiInsights
                onSchedulingInsightClick={() => setIsAiChatOpen(true)}
                onOpenContext={openContextualization}
                onAnalyzeAllClick={openBulkAnalysis}
                requestCount={activeRequestCards.length}
              />
            </>
          ) : null}

          {hasActiveFilters ? (
            <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
              {activeFilterChips.map((chip) => (
                <Chip
                  key={chip.key}
                  label={chip.label}
                  size="small"
                  onDelete={chip.onDelete}
                  sx={{
                    height: 24,
                    borderRadius: 1,
                    bgcolor: '#F8FAFC',
                    color: '#334155',
                    border: '1px solid #D8DEE8',
                    fontSize: '0.66rem',
                    fontWeight: 800,
                    '& .MuiChip-label': { px: 0.8 },
                    '& .MuiChip-deleteIcon': { fontSize: 16, color: '#64748B' },
                  }}
                />
              ))}
              <Button size="small" onClick={clearFollowUpBoardFilters} sx={{ minHeight: 24, py: 0, fontWeight: 850 }}>
                Clear all
              </Button>
            </Box>
          ) : null}

          <Grid container spacing={1} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <ToggleButtonGroup size="small" exclusive value={maintenanceViewMode} onChange={(_, value) => value && setMaintenanceViewMode(value)}>
                  <ToggleButton value="card" aria-label="Board view" sx={{ px: 1 }}>
                    <BoardIcon fontSize="small" />
                  </ToggleButton>
                  <ToggleButton value="list" aria-label="List view" sx={{ px: 1 }}>
                    <ListIcon fontSize="small" />
                  </ToggleButton>
                </ToggleButtonGroup>
                <TextField
                  size="small"
                  label="Search"
                  value={maintenanceSearch}
                  onChange={(event) => setMaintenanceSearch(event.target.value)}
                  sx={{ minWidth: { xs: 0, sm: 280 }, flexGrow: 1 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <SearchIcon sx={{ fontSize: 18, color: activeTheme.primary }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  size="small"
                  variant={hasActiveFilters ? 'contained' : 'outlined'}
                  startIcon={<TuneIcon />}
                  endIcon={<KeyboardArrowDownIcon />}
                  onClick={(event) => setFiltersAnchorEl(event.currentTarget)}
                  aria-expanded={filtersOpen}
                  sx={{ whiteSpace: 'nowrap', fontWeight: 800, boxShadow: 'none' }}
                >
                  {activeFilterCount ? `Filters (${activeFilterCount})` : 'Filters'}
                </Button>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
                {severityLevels.map((level) => (
                  <Chip
                    key={level}
                    label={level}
                    size="small"
                    clickable
                    onClick={() => togglePriorityFilter(level)}
                    sx={{
                      display: { xs: 'inline-flex', lg: 'none' },
                      fontWeight: 800,
                      bgcolor: boardFilters.priorities.includes(level) ? maintenancePriorityStyles[level].bg : activeTheme.backgroundPaper,
                      color: boardFilters.priorities.includes(level) ? maintenancePriorityStyles[level].fg : activeTheme.textSecondary,
                      border: `1px solid ${boardFilters.priorities.includes(level) ? maintenancePriorityStyles[level].border : '#DBDDDF'}`,
                    }}
                  />
                ))}
                {maintenanceViewMode === 'card' ? (
                  <Button
                    size="small"
                    variant="text"
                    endIcon={allCollapsed ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
                    onClick={() => setAllLanesExpanded(allCollapsed)}
                    sx={{ color: tokenBrand.main, fontWeight: 700, textTransform: 'none', mr: 1 }}
                  >
                    {allCollapsed ? 'Expand' : 'Collapse'}
                  </Button>
                ) : null}
                <Button
                  size="small"
                  variant={maintenanceFocusMode ? 'contained' : 'outlined'}
                  startIcon={maintenanceFocusMode ? <FocusExitIcon /> : <FocusIcon />}
                  aria-pressed={maintenanceFocusMode}
                  onClick={() => setMaintenanceFocusMode(!maintenanceFocusMode)}
                  sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
                >
                  {maintenanceFocusMode ? 'Exit Focus' : 'Focus Mode'}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openBlankWorkOrderDrawer}
                  sx={{ fontWeight: 800, whiteSpace: 'nowrap' }}
                >
                  Create Work Order
                </Button>
              </Box>
            </Grid>
          </Grid>
          <FollowUpBoardFilterPanel
            anchorEl={filtersAnchorEl}
            open={filtersOpen}
            filters={boardFilters}
            onClose={() => setFiltersAnchorEl(null)}
            onClearAll={clearFollowUpBoardFilters}
            onApply={setBoardFilters}
          />
        </Paper>

        <Box sx={{ flexGrow: maintenanceFocusMode ? 1 : undefined, minHeight: maintenanceFocusMode ? 0 : undefined, overflow: maintenanceFocusMode ? 'hidden' : undefined }}>
          {maintenanceViewMode === 'list' ? (
            <MaintenanceListView rows={maintenanceListRows} focusMode={maintenanceFocusMode} onOpenContext={openContextualization} />
          ) : (
            <Box
              onPointerDown={handleBoardPointerDown}
              onPointerMove={handleBoardPointerMove}
              onPointerUp={endBoardDrag}
              onPointerCancel={endBoardDrag}
              sx={{
                height: maintenanceFocusMode ? '100%' : undefined,
                minHeight: maintenanceFocusMode ? 0 : 470,
                overflowX: maintenanceFocusMode ? 'hidden' : 'auto',
                overflowY: maintenanceFocusMode ? 'auto' : 'visible',
                pb: 1,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                width: '100%',
                cursor: isBoardDragging ? 'grabbing' : 'grab',
                touchAction: 'pan-y',
                userSelect: isBoardDragging ? 'none' : undefined,
                '& button, & .MuiButtonBase-root': {
                  cursor: 'pointer',
                },
                '& input, & textarea': {
                  cursor: 'text',
                },
              }}
            >
              {boardLaneDefinitions.map((lane) =>
                maintenanceFocusMode || maintenanceLaneExpanded[lane.key] ? (
                  <BoardLane
                    key={lane.key}
                    laneKey={lane.key}
                    title={lane.title}
                    cards={lane.cards}
                    onCollapse={() => setMaintenanceLaneExpanded(prev => ({ ...prev, [lane.key]: false }))}
                    maintenancePriorityStyles={maintenancePriorityStyles}
                    focusMode={maintenanceFocusMode}
                    dropActive={dragOverLane === lane.key}
                    onRequestCardClick={lane.key === 'requests' ? setSelectedRequestCard : undefined}
                    onWorkOrderCardClick={openWorkOrderDrawerFromBoardCard}
                    onOpenContext={openContextualization}
                    onRequestDragStart={startRequestDrag}
                    onRequestDragEnd={endRequestDrag}
                    onRequestDragOver={setDragOverLane}
                    onRequestDrop={dropRequestOnLane}
                    onPlanWithAi={openPlanningAgent}
                  />
                ) : (
                  <CollapsedLaneTab
                    key={lane.key}
                    title={lane.title}
                    count={lane.cards.length}
                    onExpand={() => setMaintenanceLaneExpanded(prev => ({ ...prev, [lane.key]: true }))}
                  />
                )
              )}
            </Box>
          )}
        </Box>
        {!maintenanceFocusMode ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5, mt: 1, borderTop: `1px solid ${tokenDivider}` }}>
            <SeverityLegend
              maintenancePriorityStyles={maintenancePriorityStyles}
              selectedPriorities={boardFilters.priorities}
              onPriorityToggle={togglePriorityFilter}
            />
          </Box>
        ) : null}
      </Paper>
      <CreateWorkOrderDrawer
        open={isWorkOrderDrawerOpen}
        activeTab={workOrderTab}
        initialDraft={workOrderDraft}
        onTabChange={setWorkOrderTab}
        onClose={closeWorkOrderDrawer}
        onSubmit={submitWorkOrder}
        onResumePausedWorkOrder={resumePausedWorkOrder}
        onLinkToExistingWork={linkRequestToExistingWork}
        onRejectCompletionReview={rejectCompletionReview}
        onAcceptCompletionReview={acceptCompletionReview}
      />
      <MaintenanceRequestDrawer
        open={Boolean(selectedRequestCard)}
        card={selectedRequestCard}
        onClose={() => setSelectedRequestCard(null)}
        onAcceptToPlanning={acceptRequestToPlanning}
        onPlanNow={openWorkOrderDrawerFromRequest}
        onLinkToExistingWork={linkRequestToExistingWork}
        onReject={rejectMaintenanceRequest}
      />
      <MaintenanceAiChatDrawer open={isAiChatOpen} onClose={() => setIsAiChatOpen(false)} />
      <MaintenanceContextualizationDrawer
        open={Boolean(selectedContextualization)}
        context={selectedContextualization}
        onClose={() => setSelectedContextualization(null)}
        onCreateWorkOrder={() => {
          setSelectedContextualization(null);
          openBlankWorkOrderDrawer();
        }}
      />
      <PlanningAgentChatDrawer
        open={isPlanningAgentOpen}
        context={planningAgentContext}
        onClose={() => setIsPlanningAgentOpen(false)}
        onCommit={commitPlannedWorkOrder}
      />
      <BulkAnalysisDrawer
        open={isBulkAnalysisOpen}
        result={bulkAnalysisResult}
        onClose={() => setIsBulkAnalysisOpen(false)}
        onApply={applyBulkRecommendation}
        onApplyAll={applyAllBulkRecommendations}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
          sx={{ width: '100%', borderRadius: 1.4, fontWeight: 700 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
