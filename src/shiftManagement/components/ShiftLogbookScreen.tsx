import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Divider,
  LinearProgress,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  AutoAwesome as SparkleIcon,
  AccessTime as TimeIcon,
  MoreHoriz as MoreIcon,
  ViewColumn as ViewColumnIcon,
  BuildCircle as MaintenanceIcon,
  Description as WorkOrderIcon,
  Troubleshoot as OeeIcon,
  Flag as NonConformanceIcon,
  Edit as ShiftNotesIcon,
  VerifiedUser as EsoIcon,
  Delete as ScrapIcon,
  TrendingUp as PerformanceIcon,
  Download as DownloadIcon,
  StickyNote2 as NoteIcon,
  SpaceDashboard as DashboardIcon,
  WarningAmber as WarningIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  ViewInAr as ViewInArIcon,
  CenterFocusStrong as FocusIcon,
  ErrorOutline as ErrorOutlineIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ChevronRight as ChevronRightIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  PictureAsPdf as PdfIcon,
  TableChart as SpreadsheetIcon,
  PushPin as PinIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RestartAlt as ResetIcon,
  ThreeDRotation as OrbitIcon,
  Pause as PauseIcon,
  PlayArrow as PlayIcon,
  Sensors as SensorsIcon,
  Inventory2Outlined as SparePartsIcon,
  Add as AddIcon,
  AccountTree as RcaIcon,
  SendOutlined as SendIcon,
  EmailOutlined as EmailIcon,
  GroupsOutlined as TeamsIcon,
} from '@mui/icons-material';
import { findHeaderHierarchyPath, type HeaderHierarchyNodeKind } from '../../navigation/headerHierarchy';
import { useOptionalShiftManagementContext } from '../contexts/ShiftManagementContext';
import { shiftLogbookEntries, type ShiftLogbookEntry } from '../data/logbookData';
import { getShiftLogbookTicketTypeIcon } from '../utils/icons';
import type { MaintenanceCard, MaintenancePriority } from '../../Maintenance/types';
import { maintenanceLaneData } from '../../Maintenance/data';
import {
  buildWorkOrderDraftFromBoardCard,
  buildWorkOrderDraftFromRequest,
  CreateWorkOrderDrawer,
  MaintenanceRequestDrawer,
  type WorkOrderDraft,
  type WorkOrderTab,
} from '../../Maintenance/pages/MaintenanceFollowUpBoardPage';
import {
  InventoryPartDrawer as SparePartsInventoryDrawer,
  findSparePartsInventoryPartByCode,
  type SparePartsInventoryPart,
} from '../../Maintenance/pages/SparePartsManagementPage';
import { type ReportRow } from '../../shopfloor/components/EsoHubScreen';
import { SHIFT_LOGBOOK_SIDE_DRAWER_WIDTH } from './shiftLogbookLayout';
import type { WorkstationContextualAiAssistantPayload } from '../../workstation/types';
import {
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenError,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
  workstationVisuals,
} from '../../workstation/theme';

interface ShiftLogbookScreenProps {
  activeTheme: { primary: string };
  onOpenDocumentManagement?: () => void;
  onOpenSparePartsManagement?: (equipmentName: string) => void;
  onOpenAiAssistant?: (payload: {
    contextTitle: string;
    contextSubtitle: string;
    problemFilter?: string;
    openingText: string;
    autoRunActionIndex?: number;
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
        category: DashboardLogbookCategory;
        searchTerm?: string;
      }>;
    }>;
  }) => void;
  selectedHeaderHierarchyId?: string;
}

interface LiveEventItem {
  id: string;
  title: string;
  line: string;
  zone: string;
  ticketType: string;
  tone: string;
  createdAtMs: number;
}

type LogbookMaintenanceCard = MaintenanceCard & {
  requestContext?: {
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

const priorityByRiskLevel: Record<ShiftLogbookEntry['riskLevel'], MaintenancePriority> = {
  High: 'High',
  Medium: 'Medium',
  Low: 'Low',
};

const logbookSideDrawerWidth = SHIFT_LOGBOOK_SIDE_DRAWER_WIDTH;

const shiftLogbookButtonSx = {
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 500,
  boxShadow: 'none',
} as const;

const shiftLogbookContainedButtonSx = {
  ...shiftLogbookButtonSx,
  bgcolor: tokenBrand.main,
  color: tokenBrand.contrast,
  '&:hover': {
    bgcolor: tokenBrand.dark,
    boxShadow: 'none',
  },
} as const;

const shiftLogbookTextButtonSx = {
  minWidth: 0,
  px: 0.5,
  py: 0.2,
  color: tokenText.secondary,
  fontWeight: 700,
  fontSize: '0.75rem',
  lineHeight: 1.1,
  textTransform: 'uppercase',
  '&:hover': {
    bgcolor: 'transparent',
    color: tokenText.primary,
  },
} as const;

const shiftLogbookPanelSx = {
  borderRadius: '12px',
  border: `1px solid ${tokenDivider}`,
  bgcolor: 'background.paper',
  boxShadow: 'none',
  overflow: 'hidden',
} as const;

const shiftLogbookSectionTitleSx = {
  color: tokenText.primary,
  fontWeight: 700,
  fontSize: '0.875rem',
} as const;

const shiftLogbookCompactCardSx = {
  borderRadius: '8px',
  border: `1px solid ${tokenDivider}`,
  bgcolor: 'background.paper',
  boxShadow: 'none',
} as const;

const shiftLogbookSubtleCardSx = {
  ...shiftLogbookCompactCardSx,
  bgcolor: tokenNeutral.lightest,
} as const;

function getLogbookMaintenanceNumber(entry: ShiftLogbookEntry) {
  const numericId = entry.id.replace('SL-', '');
  return entry.category === 'Maintenance Request' ? `MR ${numericId}` : `WO ${numericId}`;
}

function buildMaintenanceCardFromLogbookEntry(entry: ShiftLogbookEntry): LogbookMaintenanceCard {
  const priority = priorityByRiskLevel[entry.riskLevel];
  const equipment = entry.reporterType === 'Equipment' ? entry.reporter : entry.title;
  const location = `${entry.zone} - ${entry.line}`;
  const maintenanceType = entry.riskLevel === 'High' ? 'Breakdown' : 'Corrective';

  return {
    id: `logbook-${entry.category === 'Maintenance Request' ? 'mr' : 'wo'}-${entry.id}`,
    title: equipment,
    detail: entry.title,
    assignee: entry.reporter,
    due: entry.createdAt,
    priority,
    equipmentCriticality: entry.riskLevel === 'High' ? 'A' : entry.riskLevel === 'Medium' ? 'B' : 'C',
    tags: [entry.status, entry.line, entry.zone],
    requestContext: {
      requestId: getLogbookMaintenanceNumber(entry),
      maintenanceType,
      location,
      createdBy: `${entry.reporter}, ${entry.createdAt}`,
      activityType: entry.ticketType === 'Maintenance' ? 'Mechanical' : entry.ticketType,
      downtime: entry.riskLevel === 'High' ? 'High' : 'Low',
      quality: entry.riskLevel === 'High' ? 'High' : 'Medium',
      ehs: entry.riskLevel === 'Low' ? 'Low' : 'Medium',
      equipment,
    },
  };
}

function buildEsoReportFromLogbookEntry(entry: ShiftLogbookEntry): ReportRow {
  const isNearMiss = entry.ticketType === 'Incident';
  const status = entry.status === 'Closed'
    ? 'CLOSED'
    : entry.status === 'In Progress'
      ? 'ACTION IN PROGRESS'
      : 'REVIEW';

  return {
    id: entry.id.startsWith('ESO-') ? entry.id : entry.id.replace('SL-', 'ESO-2024-'),
    type: isNearMiss ? 'Near Miss' : 'Condition Report',
    status,
    observer: entry.reporter,
    area: entry.line,
    line: entry.zone,
    supervisor: entry.reporterType === 'Human' ? entry.reporter : 'Maddison Brooks',
    reportDate: `May 05, 2026 ${entry.createdAt}`,
    occurrenceDate: `May 05, 2026 ${entry.createdAt}`,
    closedDate: entry.status === 'Closed' ? `May 05, 2026 ${entry.createdAt}` : '',
    lastUpdate: `May 05, 2026 ${entry.createdAt}`,
  };
}

const sparePartCodesByLogbookLevel: Record<string, string[]> = {
  zone: [
    'SP-BRG-1001',
    'SP-BRG-1002',
    'SP-VAL-1003',
    'SP-CPL-1003',
  ],
  machine: [
    'SP-BRG-1001',
    'SP-CPL-1003',
    'SP-LUB-1001',
    'SP-SEN-1003',
  ],
};

function getZoneSparePartAvailableStock(part: SparePartsInventoryPart) {
  return Math.max(part.currentStock - part.reservedStock, 0);
}

function getZoneSparePartStatus(part: SparePartsInventoryPart) {
  const availableStock = getZoneSparePartAvailableStock(part);

  if (part.currentStock <= 0 || availableStock <= 0) {
    return { label: 'Out', tone: '#DC2626', bg: '#FEF2F2', border: '#FECACA' };
  }

  if (availableStock <= part.safetyStock || part.currentStock <= part.safetyStock) {
    return { label: 'Low', tone: '#D97706', bg: '#FFF7ED', border: '#FED7AA' };
  }

  return { label: 'Ready', tone: '#15803D', bg: '#ECFDF3', border: '#BBF7D0' };
}

const topCategories = [
  { label: 'Dashboard', icon: <DashboardIcon sx={{ fontSize: 16 }} /> },
  { label: 'All', icon: <ViewColumnIcon sx={{ fontSize: 16 }} /> },
  { label: 'Maintenance Request', icon: <MaintenanceIcon sx={{ fontSize: 16 }} /> },
  { label: 'Maintenance Work Order', icon: <WorkOrderIcon sx={{ fontSize: 16 }} /> },
  { label: 'OEE', icon: <OeeIcon sx={{ fontSize: 16 }} /> },
  { label: 'Quality', icon: <NonConformanceIcon sx={{ fontSize: 16 }} /> },
  { label: 'Shift Notes', icon: <ShiftNotesIcon sx={{ fontSize: 16 }} /> },
  { label: 'ESO', icon: <EsoIcon sx={{ fontSize: 16 }} /> },
  { label: 'RCA', icon: <RcaIcon sx={{ fontSize: 16 }} /> },
  { label: 'CIL / Centerline', icon: <CheckCircleOutlineIcon sx={{ fontSize: 16 }} /> },
  { label: 'Scrap', icon: <ScrapIcon sx={{ fontSize: 16 }} /> },
  { label: 'Performance Output', icon: <PerformanceIcon sx={{ fontSize: 16 }} /> },
];

const lineMetricsByCategory: Record<string, { produced: number; scrapRate: string; downtime: number }> = {
  All: { produced: 4284, scrapRate: '3.2%', downtime: 42 },
  'Maintenance Request': { produced: 4012, scrapRate: '2.8%', downtime: 55 },
  'Maintenance Work Order': { produced: 4186, scrapRate: '2.9%', downtime: 49 },
  OEE: { produced: 3898, scrapRate: '3.5%', downtime: 58 },
  Quality: { produced: 3974, scrapRate: '3.8%', downtime: 51 },
  'Shift Notes': { produced: 4320, scrapRate: '2.4%', downtime: 33 },
  ESO: { produced: 4095, scrapRate: '3.1%', downtime: 46 },
  RCA: { produced: 4118, scrapRate: '3.4%', downtime: 47 },
  'CIL / Centerline': { produced: 4388, scrapRate: '2.3%', downtime: 18 },
  Scrap: { produced: 3726, scrapRate: '5.1%', downtime: 61 },
  'Performance Output': { produced: 4452, scrapRate: '2.6%', downtime: 38 },
};

const logbookHourlyOutputRows = [
  { hour: '06:00', line: 'Line 10', area: 'Zone 01', shift: 'Morning', target: 560, produced: 548, status: 'Recovering', owner: 'Delila Bran', constraint: 'Startup checks' },
  { hour: '07:00', line: 'Line 10', area: 'Zone 01', shift: 'Morning', target: 560, produced: 574, status: 'On Target', owner: 'Delila Bran', constraint: 'Normal run' },
  { hour: '08:00', line: 'Line 4', area: 'Zone 02', shift: 'Morning', target: 540, produced: 503, status: 'At Risk', owner: 'Z4 Vibration Sensor', constraint: 'Spindle vibration' },
  { hour: '09:00', line: 'Line 4', area: 'Zone 02', shift: 'Morning', target: 540, produced: 531, status: 'Recovering', owner: 'Maintenance Lead', constraint: 'Controlled speed' },
  { hour: '10:00', line: 'Line 5', area: 'Zone 02', shift: 'Afternoon', target: 520, produced: 518, status: 'Recovering', owner: 'BLU.AI', constraint: 'Operator balance' },
  { hour: '11:00', line: 'Line 1', area: 'Zone 01', shift: 'Afternoon', target: 560, produced: 579, status: 'On Target', owner: 'Line Leader', constraint: 'Normal run' },
  { hour: '12:00', line: 'Line 10', area: 'Zone 01', shift: 'Afternoon', target: 560, produced: 542, status: 'Recovering', owner: 'Line 10 Team', constraint: 'Material feed check' },
  { hour: '13:00', line: 'Line 2', area: 'Zone 03', shift: 'Afternoon', target: 560, produced: 557, status: 'On Target', owner: 'Cycle Counter Z1', constraint: 'Normal run' },
] as const;

const logbookHourlyScrapRows = [
  { hour: '06:00', line: 'Line 1', area: 'Zone 04', shift: 'Morning', produced: 548, scrap: 11, reason: 'Startup rejects', status: 'Contained', owner: 'Quality Tech' },
  { hour: '07:00', line: 'Line 1', area: 'Zone 04', shift: 'Morning', produced: 574, scrap: 9, reason: 'Label alignment', status: 'Contained', owner: 'Quality Tech' },
  { hour: '08:00', line: 'Line 1', area: 'Zone 04', shift: 'Morning', produced: 503, scrap: 28, reason: 'Sensor drift', status: 'Action Open', owner: 'BLU.AI' },
  { hour: '09:00', line: 'Line 4', area: 'Zone 02', shift: 'Morning', produced: 531, scrap: 16, reason: 'Spindle variation', status: 'Monitoring', owner: 'Maintenance Lead' },
  { hour: '10:00', line: 'Line 5', area: 'Zone 02', shift: 'Afternoon', produced: 518, scrap: 13, reason: 'Operator handoff', status: 'Monitoring', owner: 'Line Leader' },
  { hour: '11:00', line: 'Line 10', area: 'Zone 01', shift: 'Afternoon', produced: 579, scrap: 7, reason: 'Normal variation', status: 'Contained', owner: 'Line 10 Team' },
  { hour: '12:00', line: 'Line 10', area: 'Zone 01', shift: 'Afternoon', produced: 542, scrap: 18, reason: 'Feed consistency', status: 'Action Open', owner: 'Material Handler' },
  { hour: '13:00', line: 'Line 2', area: 'Zone 03', shift: 'Afternoon', produced: 557, scrap: 8, reason: 'Normal variation', status: 'Contained', owner: 'Cycle Counter Z1' },
] as const;

const logbookCilCenterlineRows = [
  { id: 'CIL-Z1.1', type: 'CIL', task: 'Clean outside guarding and inspect fasteners', equipment: 'Zone A Feeder', line: 'Line 10', area: 'Zone 01', shift: 'Morning', scheduled: '10:00', owner: 'Delila Bran', status: 'Scheduled', action: 'cilt' },
  { id: 'CIL-Z1.2', type: 'CIL', task: 'Inspect air gauges and verify readings', equipment: 'Zone A Feeder', line: 'Line 10', area: 'Zone 01', shift: 'Morning', scheduled: '10:15', owner: 'Delila Bran', status: 'In Progress', action: 'cilt' },
  { id: 'CL-1.1', type: 'CL', task: 'Verify main air supply at target', equipment: 'Z1 Main Indexer', line: 'Line 10', area: 'Zone 01', shift: 'Morning', scheduled: '09:30', owner: 'Line 10 Team', status: 'Completed', action: 'centerline' },
  { id: 'CL-1.2', type: 'CL', task: 'Record indexer speed against centerline', equipment: 'Z2 Tipper Unit', line: 'Line 4', area: 'Zone 02', shift: 'Afternoon', scheduled: '11:00', owner: 'Maintenance Lead', status: 'Scheduled', action: 'centerline' },
  { id: 'CL-1.3', type: 'CL', task: 'Confirm heater zone target range', equipment: 'Z3 Assembly Press', line: 'Line 5', area: 'Zone 02', shift: 'Afternoon', scheduled: '14:30', owner: 'Quality Tech', status: 'Scheduled', action: 'centerline' },
] as const;

const productionLines = ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5', 'Line 6'];
const plantCells = [
  { label: 'Line 01', line: 'Line 1', zone: 'Zone 2', top: '74%', left: '29%', attention: false },
  { label: 'Line 02', line: 'Line 2', zone: 'Zone 2', top: '58%', left: '9%', attention: false },
  { label: 'Line 03', line: 'Line 3', zone: 'Zone 1', top: '45%', left: '4%', attention: false },
  { label: 'Line 04', line: 'Line 4', zone: 'Zone 1', top: '61%', left: '63%', attention: false },
  { label: 'Line 05', line: 'Line 5', zone: 'Zone 3', top: '34%', left: '55%', attention: true },
  { label: 'Line 06', line: 'Line 6', zone: 'Zone 2', top: '18%', left: '35%', attention: false },
  { label: 'Line 07', line: 'Line 3', zone: 'Zone 2', top: '9%', left: '20%', attention: false },
  { label: 'Line 08', line: 'Line 1', zone: 'Zone 4', top: '24%', left: '74%', attention: false },
  { label: 'Line 09', line: 'Line 6', zone: 'Zone 3', top: '15%', left: '58%', attention: false },
  { label: 'Line 10', line: 'Line 2', zone: 'Zone 1', top: '2%', left: '45%', attention: false },
];

const dashboardEventLog = [
  {
    category: 'Breakdown',
    age: '12 minutes ago',
    title: 'Line 05, Zone 10 - Bearing failure detected',
    critical: true,
    tone: '#EF4444',
  },
  {
    category: 'Scrap',
    age: '25 minutes ago',
    title: 'Line 09, Zone 11 - Scrap rate reduced after material adjustment',
    critical: false,
    tone: '#22C55E',
  },
  {
    category: 'Production Output',
    age: '30 minutes ago',
    title: 'Line 02, Line 06, Zone 01 - Daily production target achieved ahead of schedule',
    critical: false,
    tone: '#22C55E',
  },
  {
    category: 'Quality',
    age: '35 minutes ago',
    title: 'Line 08, Line 07, Zone 09 - Audit completed successfully',
    critical: false,
    tone: '#22C55E',
  },
  {
    category: 'Non Conformance',
    age: '40 minutes ago',
    title: 'Line 04, Line 12, Zone 05 - Seal misalignment',
    critical: false,
    tone: '#22C55E',
  },
];

const dashboardImpactCards = [
  { value: '-18%', label: 'Production Impact', helper: 'vs last shift', tone: '#EF4444' },
  { value: '+$1.2K', label: 'Cost Impact', helper: 'vs last shift', tone: '#F97316' },
  { value: '2', label: 'Orders at Risk', helper: 'vs last shift', tone: '#3B82F6' },
];

const dashboardDocuments = [
  { title: 'Line 05 Batch Record', meta: 'Updated 1h ago • PDF', type: 'pdf' },
  { title: 'Shift Handover SOP', meta: 'Updated 2h ago • PDF', type: 'pdf' },
  { title: 'Centerline Instructions', meta: 'Updated 1d ago • PDF', type: 'pdf' },
  { title: 'Maintenance Checklist', meta: 'Updated 3h ago • XLSX', type: 'xlsx' },
];

type DrillLevel = 'plant' | 'area' | 'unit' | 'line' | 'zone' | 'machine';
type DashboardDocumentType = 'pdf' | 'xlsx';
type DashboardLogbookCategory = 'All' | 'Maintenance Request' | 'Maintenance Work Order' | 'OEE' | 'Quality' | 'Shift Notes' | 'ESO' | 'RCA' | 'CIL / Centerline' | 'Scrap' | 'Performance Output';
interface DashboardEvent {
  category: string;
  age: string;
  title: string;
  critical: boolean;
  tone: string;
  logbookCategory: DashboardLogbookCategory;
}

interface DashboardImpact {
  value: string;
  label: string;
  helper: string;
  tone: string;
}

interface DashboardDocument {
  title: string;
  meta: string;
  type: DashboardDocumentType;
}

interface DashboardWorkItem {
  label: string;
  detail: string;
  status?: string;
  tone: string;
  logbookCategory: DashboardLogbookCategory;
}

interface HoverMetric {
  label: string;
  value: string;
  helper?: string;
  tone?: string;
}

interface HoverActionRow {
  label: string;
  detail: string;
  status?: string;
  tone?: string;
  logbookCategory: DashboardLogbookCategory;
}

interface BluAiAssistantSuggestion {
  id: string;
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
    category: DashboardLogbookCategory;
    searchTerm?: string;
  }>;
}

interface BluAiAssistantContext {
  title: string;
  subtitle: string;
  accent: string;
  insights: Array<{ title: string; detail: string; tone: string }>;
  suggestions: BluAiAssistantSuggestion[];
}

const dashboardMaintenanceRequestRow = {
  label: 'Maintenance Requests',
  detail: '1 urgent • vibration trend',
  tone: '#F97316',
  logbookCategory: 'Maintenance Request' as DashboardLogbookCategory,
};

type MaintenanceFollowUpStatus = 'Maintenance Request' | 'Planning' | 'Scheduled' | 'In Progress' | 'Done' | 'Closed';

interface LogbookWorkOrderContext {
  workOrderId: string;
  type: 'Corrective' | 'Preventive' | 'Breakdown';
  followUpStatus: MaintenanceFollowUpStatus;
  equipment: string;
  location: string;
  due: string;
  criticality: 'A' | 'B' | 'C';
  parts: 'Parts Reserved' | 'Parts Required' | 'No Parts Required' | 'Awaiting Parts';
  sourceCard?: MaintenanceCard;
}

const followUpStatusTone: Record<MaintenanceFollowUpStatus, string> = {
  'Maintenance Request': '#EF4444',
  Planning: '#2563EB',
  Scheduled: '#7C3AED',
  'In Progress': '#B45309',
  Done: '#22C55E',
  Closed: '#16A34A',
};

const followUpLogbookSamples: Array<{
  id: string;
  card: MaintenanceCard;
  category: 'Maintenance Request' | 'Maintenance Work Order';
  type: LogbookWorkOrderContext['type'];
  followUpStatus: MaintenanceFollowUpStatus;
  workOrderId: string;
  location: string;
  parts: LogbookWorkOrderContext['parts'];
  line: string;
  zone: string;
  tone: string;
}> = [
  {
    id: 'MR-606034603',
    card: maintenanceLaneData.requests[1],
    category: 'Maintenance Request',
    type: 'Breakdown',
    followUpStatus: 'Maintenance Request',
    workOrderId: 'MR 606034603',
    location: 'Autoquard Line 10',
    parts: 'Parts Required',
    line: 'Line 10',
    zone: 'Zone 01',
    tone: '#EF4444',
  },
  {
    id: 'SL-2024-007',
    card: maintenanceLaneData.team.scheduling[0],
    category: 'Maintenance Work Order',
    type: 'Corrective',
    followUpStatus: 'Planning',
    workOrderId: 'WO 606034603',
    location: 'Autoquard Line 10',
    parts: 'Parts Reserved',
    line: 'Line 10',
    zone: 'Zone 01',
    tone: '#2563EB',
  },
  {
    id: 'SL-2024-011',
    card: maintenanceLaneData.team.scheduled[4],
    category: 'Maintenance Work Order',
    type: 'Preventive',
    followUpStatus: 'Scheduled',
    workOrderId: 'WO 606034604',
    location: 'Autoquard Line 10',
    parts: 'Parts Reserved',
    line: 'Line 10',
    zone: 'Zone 02',
    tone: '#7C3AED',
  },
  {
    id: 'WO-606034603-IP',
    card: maintenanceLaneData.team.progress[0],
    category: 'Maintenance Work Order',
    type: 'Corrective',
    followUpStatus: 'In Progress',
    workOrderId: 'WO 606034603',
    location: 'Autoquard Line 10',
    parts: 'No Parts Required',
    line: 'Line 10',
    zone: 'Zone 02',
    tone: '#B45309',
  },
  {
    id: 'WO-606034608-DONE',
    card: maintenanceLaneData.review[0],
    category: 'Maintenance Work Order',
    type: 'Preventive',
    followUpStatus: 'Done',
    workOrderId: 'WO 606034608',
    location: 'Autoquard Line 08',
    parts: 'No Parts Required',
    line: 'Line 08',
    zone: 'Zone 04',
    tone: '#22C55E',
  },
  {
    id: 'SL-2024-023',
    card: maintenanceLaneData.closed[1],
    category: 'Maintenance Work Order',
    type: 'Corrective',
    followUpStatus: 'Closed',
    workOrderId: 'WO 606034609',
    location: 'Autoquard Line 03',
    parts: 'Parts Reserved',
    line: 'Line 03',
    zone: 'Zone 02',
    tone: '#16A34A',
  },
];

const logbookFollowUpEntries: ShiftLogbookEntry[] = followUpLogbookSamples.map((sample) => ({
  id: sample.id,
  title: sample.card.title,
  category: sample.category,
  ticketType: 'Maintenance',
  line: sample.line,
  zone: sample.zone,
  riskLevel: sample.card.priority === 'Emergency' || sample.card.priority === 'Immediate' || sample.card.priority === 'High' ? 'High' : sample.card.priority === 'Medium' ? 'Medium' : 'Low',
  shift: 'Morning',
  status: sample.followUpStatus === 'Closed' || sample.followUpStatus === 'Done' ? 'Closed' : sample.followUpStatus === 'In Progress' ? 'In Progress' : 'Open',
  reporter: sample.card.assignee,
  reporterType: sample.card.assignee === 'BLU.AI' ? 'AI' : 'Human',
  createdAt: sample.card.due,
  dateScope: 'Current Shift',
  tone: sample.tone,
}));

const logbookMaintenanceRequestEntries: ShiftLogbookEntry[] = maintenanceLaneData.requests.map((card, index) => ({
  id: `MR-${String(606034603 + index).padStart(9, '0')}`,
  title: card.title,
  category: 'Maintenance Request',
  ticketType: 'Maintenance',
  line: index % 2 === 0 ? 'Line 10' : 'Line 08',
  zone: index % 3 === 0 ? 'Zone 01' : index % 3 === 1 ? 'Zone 02' : 'Zone 04',
  riskLevel: card.priority === 'Emergency' || card.priority === 'Immediate' || card.priority === 'High' ? 'High' : card.priority === 'Medium' ? 'Medium' : 'Low',
  shift: index < 5 ? 'Morning' : 'Afternoon',
  status: 'Open',
  reporter: card.assignee,
  reporterType: card.assignee === 'BLU.AI' ? 'AI' : 'Human',
  createdAt: card.due,
  dateScope: 'Current Shift',
  tone: card.priority === 'Emergency' || card.priority === 'Immediate' ? '#EF4444' : card.priority === 'High' ? '#F97316' : '#2563EB',
}));

const logbookWorkOrderContextById: Record<string, LogbookWorkOrderContext> = {
  ...followUpLogbookSamples.reduce((contexts, sample) => ({
    ...contexts,
    [sample.id]: {
      workOrderId: sample.workOrderId,
      type: sample.type,
      followUpStatus: sample.followUpStatus,
      equipment: sample.card.title,
      location: sample.location,
      due: sample.card.due.startsWith('Jan') ? `Due ${sample.card.due}` : sample.card.due,
      criticality: sample.card.equipmentCriticality ?? (sample.card.priority === 'High' || sample.card.priority === 'Emergency' || sample.card.priority === 'Immediate' ? 'A' : 'B'),
      parts: sample.parts,
      sourceCard: sample.card,
    },
  }), {} as Record<string, LogbookWorkOrderContext>),
  'SL-2024-007': {
    workOrderId: 'WO 606034603',
    type: 'Corrective',
    followUpStatus: 'Planning',
    equipment: 'Conveyor CV-210',
    location: 'Autoquard Line 10',
    due: 'Due Jan 13',
    criticality: 'A',
    parts: 'Parts Reserved',
    sourceCard: maintenanceLaneData.team.scheduling[0],
  },
  'SL-2024-011': {
    workOrderId: 'WO 606034604',
    type: 'Preventive',
    followUpStatus: 'Scheduled',
    equipment: 'Packaging Robot RB-402',
    location: 'Autoquard Line 10',
    due: 'Due Jan 14',
    criticality: 'B',
    parts: 'No Parts Required',
    sourceCard: maintenanceLaneData.team.scheduled[4],
  },
  'SL-2024-023': {
    workOrderId: 'WO 606034609',
    type: 'Corrective',
    followUpStatus: 'Closed',
    equipment: 'Cooling Circuit Flow',
    location: 'Autoquard Line 03',
    due: 'Closed Jan 20',
    criticality: 'A',
    parts: 'Parts Reserved',
    sourceCard: maintenanceLaneData.closed[1],
  },
};

function getLogbookWorkOrderContext(entry: ShiftLogbookEntry): LogbookWorkOrderContext | null {
  if (logbookWorkOrderContextById[entry.id]) return logbookWorkOrderContextById[entry.id];
  if (entry.category !== 'Maintenance Work Order') return null;

  return logbookWorkOrderContextById[entry.id] ?? {
    workOrderId: entry.id.replace('SL-', 'WO '),
    type: entry.riskLevel === 'High' ? 'Breakdown' : 'Corrective',
    followUpStatus: entry.status === 'Closed' ? 'Closed' : entry.status === 'In Progress' ? 'In Progress' : 'Planning',
    equipment: entry.reporterType === 'Equipment' ? entry.reporter : 'Conveyor CV-210',
    location: `${entry.line} • ${entry.zone}`,
    due: entry.status === 'Closed' ? 'Closed today' : 'Due ASAP',
    criticality: entry.riskLevel === 'High' ? 'A' : 'B',
    parts: entry.riskLevel === 'High' ? 'Parts Required' : 'Parts Reserved',
  };
}

function getDashboardTargetEquipment(targetLabel: string) {
  if (targetLabel.toLowerCase().includes('conveyor')) return 'Conveyor Exit CV-101';
  if (targetLabel.toLowerCase().includes('vision')) return 'Vision Inspect VI-210';
  if (targetLabel.toLowerCase().includes('filling')) return 'Filling System FS-110';
  if (targetLabel.toLowerCase().includes('hmi')) return 'HMI Panel HMI-01';
  return 'Syringe Assembly Module';
}

function buildNewMaintenanceRequestCard(targetLabel: string): LogbookMaintenanceCard {
  const equipment = getDashboardTargetEquipment(targetLabel);

  return {
    id: `logbook-new-mr-${targetLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    title: equipment,
    detail: `${targetLabel} requires maintenance triage from Zone 01 live context.`,
    assignee: 'Jose Rodriguez',
    due: 'Now',
    priority: targetLabel.toLowerCase().includes('conveyor') ? 'High' : 'Medium',
    equipmentCriticality: 'A',
    tags: ['Columbus West', 'Line 10', 'Zone 01'],
    requestContext: {
      requestId: 'New MR',
      maintenanceType: 'Corrective',
      location: 'Columbus West - Line 10 - Zone 01',
      createdBy: 'Jose Rodriguez, now',
      activityType: 'Mechanical',
      downtime: targetLabel.toLowerCase().includes('conveyor') ? 'High' : 'Medium',
      quality: 'Medium',
      ehs: 'Low',
      equipment,
    },
  };
}

interface HoverPreviewContext {
  badge: string;
  product?: string;
  batch: string;
  order: string;
  sku: string;
  tags: Array<{ label: string; tone: string; bg: string }>;
  metrics: HoverMetric[];
  rows: HoverActionRow[];
}

interface DashboardContext {
  overviewTitle: string;
  code: string;
  events: DashboardEvent[];
  impacts: DashboardImpact[];
  documents: DashboardDocument[];
  workItems: DashboardWorkItem[];
  insight: string;
  recommendation: string;
  hover: HoverPreviewContext;
  defaultCategory: DashboardLogbookCategory;
  searchTerm: string;
}

const dashboardContexts: Record<DrillLevel, DashboardContext> = {
  plant: {
    overviewTitle: 'Plant Overview',
    code: '1010-PRD-AUT-AFA10',
    events: dashboardEventLog.map((event, index) => ({
      ...event,
      logbookCategory: index === 0 ? 'Maintenance Work Order' : index === 1 ? 'Scrap' : index === 2 ? 'Performance Output' : index === 3 ? 'Quality' : 'ESO',
    })),
    impacts: dashboardImpactCards,
    documents: dashboardDocuments as DashboardDocument[],
    workItems: [
      { label: 'Work Orders', detail: '8 open • 14 in progress', status: 'Plant-wide', tone: '#EF4444', logbookCategory: 'Maintenance Work Order' },
      { label: 'Maintenance Requests', detail: '12 open • 3 high risk', status: 'Live queue', tone: '#F97316', logbookCategory: 'Maintenance Request' },
      { label: 'ESOs', detail: '5 active • 1 overdue', status: 'Safety', tone: '#2563EB', logbookCategory: 'ESO' },
    ],
    insight: 'Line 05 is the main risk due to the bearing failure. Monitor downstream lines for potential delays and quality impact.',
    recommendation: 'Prioritize Line 05 repair and verify buffer WIP before resuming full speed.',
    hover: {
      badge: 'Plant Live Context',
      product: 'Mixed syringe and GLAMP families',
      batch: 'All production families',
      order: '22 open orders',
      sku: 'Mixed portfolio',
      tags: [
        { label: 'CRITICAL', tone: '#DC2626', bg: '#FEE2E2' },
        { label: 'RUNNING', tone: '#1D4ED8', bg: '#DBEAFE' },
        { label: 'GOOD', tone: '#15803D', bg: '#DCFCE7' },
      ],
      metrics: [
        { label: 'Produced / Target', value: '48,210 / 62,000' },
        { label: 'OEE (Current)', value: '72%', tone: '#2563EB' },
        { label: 'Yield', value: '89%' },
        { label: 'Health', value: 'Watch', tone: '#F97316' },
      ],
      rows: [
        { label: 'Work Orders', detail: '8 open • 14 in progress', logbookCategory: 'Maintenance Work Order' },
        { label: 'ESOs', detail: '5 active • 1 overdue', logbookCategory: 'ESO' },
        { label: 'Shift Notes', detail: 'Latest: plant handover ready for review', logbookCategory: 'Shift Notes' },
        { label: 'Documents', detail: '9 docs • 4 SOPs • 3 work instructions', logbookCategory: 'All' },
      ],
    },
    defaultCategory: 'Maintenance Work Order',
    searchTerm: 'Line 05',
  },
  area: {
    overviewTitle: 'Area A Overview',
    code: 'AREA-A-ASM-010',
    events: [
      { category: 'Maintenance', age: '9 minutes ago', title: 'Unit A - Conveyor vibration trend above control limit', critical: true, tone: '#EF4444', logbookCategory: 'Maintenance Request' },
      { category: 'Shift Notes', age: '18 minutes ago', title: 'Unit B - Operator coverage confirmed for next changeover', critical: false, tone: '#22C55E', logbookCategory: 'Shift Notes' },
      { category: 'Quality', age: '29 minutes ago', title: 'Unit C - Visual inspection sample passed after adjustment', critical: false, tone: '#22C55E', logbookCategory: 'Quality' },
      { category: 'ESO', age: '41 minutes ago', title: 'Unit D - Guarding verification completed', critical: false, tone: '#2563EB', logbookCategory: 'ESO' },
    ],
    impacts: [
      { value: '-9%', label: 'Area Output', helper: 'vs plan', tone: '#F97316' },
      { value: '4', label: 'Open Requests', helper: 'needs owner', tone: '#EF4444' },
      { value: '91%', label: 'Containment', helper: 'current shift', tone: '#2563EB' },
    ],
    documents: [
      { title: 'Area A Handover Pack', meta: 'Updated 24m ago • PDF', type: 'pdf' },
      { title: 'Area A Cleaning SOP', meta: 'Updated 2h ago • PDF', type: 'pdf' },
      { title: 'Unit Routing Matrix', meta: 'Updated 6h ago • XLSX', type: 'xlsx' },
      { title: 'Area Safety Checklist', meta: 'Updated 1d ago • PDF', type: 'pdf' },
    ],
    workItems: [
      { label: 'Maintenance Requests', detail: '4 open • 2 waiting triage', status: 'Area A', tone: '#EF4444', logbookCategory: 'Maintenance Request' },
      { label: 'Work Orders', detail: '3 active • 1 parts hold', status: 'Unit A', tone: '#F97316', logbookCategory: 'Maintenance Work Order' },
      { label: 'ESOs', detail: '2 active • 0 overdue', status: 'Controlled', tone: '#2563EB', logbookCategory: 'ESO' },
    ],
    insight: 'Area A pressure is concentrated in Unit A. Unit B and Unit C are stable enough to absorb short buffer delays.',
    recommendation: 'Keep Unit A under maintenance watch and confirm ownership for the vibration request.',
    hover: {
      badge: 'Area A Live Context',
      product: 'FG-GLAMP-42 syringe assembly kit',
      batch: 'Syringe family',
      order: 'PO-55292',
      sku: 'FG-GLAMP-42',
      tags: [
        { label: 'CRITICAL', tone: '#DC2626', bg: '#FEE2E2' },
        { label: 'RUNNING', tone: '#1D4ED8', bg: '#DBEAFE' },
        { label: 'GOOD', tone: '#15803D', bg: '#DCFCE7' },
      ],
      metrics: [
        { label: 'Produced / Target', value: '18,420 / 24,000' },
        { label: 'OEE (Current)', value: '70%', tone: '#2563EB' },
        { label: 'Yield', value: '84%' },
        { label: 'Health', value: 'At Risk', tone: '#EF4444' },
      ],
      rows: [
        { label: 'Work Orders', detail: '3 active • 1 parts hold', logbookCategory: 'Maintenance Work Order' },
        { label: 'ESOs', detail: '2 active • 0 overdue', logbookCategory: 'ESO' },
        { label: 'Shift Notes', detail: 'Latest: staffing confirmed at 10:15', logbookCategory: 'Shift Notes' },
        { label: 'Documents', detail: '4 docs • 2 SOPs • 1 checklist', logbookCategory: 'All' },
      ],
    },
    defaultCategory: 'Maintenance Request',
    searchTerm: 'Unit A',
  },
  unit: {
    overviewTitle: 'Unit A Overview',
    code: 'UNIT-A-SYR-010',
    events: [
      { category: 'Breakdown', age: '7 minutes ago', title: 'Line 10 - Bearing temperature elevated after restart', critical: true, tone: '#EF4444', logbookCategory: 'Maintenance Work Order' },
      { category: 'Scrap', age: '21 minutes ago', title: 'Nexiva - Reject rate returned below threshold', critical: false, tone: '#22C55E', logbookCategory: 'Scrap' },
      { category: 'Production Output', age: '33 minutes ago', title: 'Line 40 - Catch-up order completed ahead of plan', critical: false, tone: '#22C55E', logbookCategory: 'Performance Output' },
    ],
    impacts: [
      { value: '-14%', label: 'Unit Output', helper: 'vs shift plan', tone: '#EF4444' },
      { value: '3', label: 'Lines at Risk', helper: 'Unit A', tone: '#F97316' },
      { value: '68%', label: 'OEE', helper: 'current', tone: '#2563EB' },
    ],
    documents: [
      { title: 'Unit A Batch Record', meta: 'Updated 42m ago • PDF', type: 'pdf' },
      { title: 'Line 10 Centerline', meta: 'Updated 1h ago • PDF', type: 'pdf' },
      { title: 'Unit Escalation Matrix', meta: 'Updated 4h ago • XLSX', type: 'xlsx' },
      { title: 'Line Clearance SOP', meta: 'Updated 1d ago • PDF', type: 'pdf' },
    ],
    workItems: [
      { label: 'Work Orders', detail: '4 open • 4 in progress', status: 'Line 10 focus', tone: '#EF4444', logbookCategory: 'Maintenance Work Order' },
      { label: 'Maintenance Requests', detail: '2 open • 1 urgent', status: 'Needs triage', tone: '#F97316', logbookCategory: 'Maintenance Request' },
      { label: 'Quality Holds', detail: '1 NC • sample pending', status: 'QA', tone: '#2563EB', logbookCategory: 'Quality' },
    ],
    insight: 'Unit A is constrained by Line 10. The rest of the unit is running, but WIP buffer is dropping.',
    recommendation: 'Protect Line 10 recovery first, then rebalance operators to Nexiva and Line 40.',
    hover: {
      badge: 'Unit A Live Context',
      product: 'FG-GLAMP-42 syringe assembly kit',
      batch: 'B-55292-A10',
      order: 'PO-55292',
      sku: 'FG-GLAMP-42',
      tags: [
        { label: 'CRITICAL', tone: '#DC2626', bg: '#FEE2E2' },
        { label: 'RUNNING', tone: '#1D4ED8', bg: '#DBEAFE' },
        { label: 'GOOD', tone: '#15803D', bg: '#DCFCE7' },
      ],
      metrics: [
        { label: 'Produced / Target', value: '6,041 / 10,024' },
        { label: 'OEE (Current)', value: '68%', tone: '#2563EB' },
        { label: 'Yield', value: '72%' },
        { label: 'Health', value: 'At Risk', tone: '#EF4444' },
      ],
      rows: [
        { label: 'Work Orders', detail: '2 open • 4 in progress', logbookCategory: 'Maintenance Work Order' },
        { label: 'ESOs', detail: '1 open • 1 overdue', logbookCategory: 'ESO' },
        { label: 'Shift Notes', detail: 'Latest: operator adjustment completed at 10:15', logbookCategory: 'Shift Notes' },
        { label: 'Documents', detail: '3 documents • 2 SOPs • 2 work instructions', logbookCategory: 'All' },
      ],
    },
    defaultCategory: 'Maintenance Work Order',
    searchTerm: 'Line 10',
  },
  line: {
    overviewTitle: 'Line 10 Overview',
    code: 'LINE-10-AFA10',
    events: [
      { category: 'Breakdown', age: '4 minutes ago', title: 'Zone 01 - Bearing failure detected at drive assembly', critical: true, tone: '#EF4444', logbookCategory: 'Maintenance Work Order' },
      { category: 'OEE', age: '13 minutes ago', title: 'Zone 02 - Micro-stops trending upward after speed increase', critical: true, tone: '#F97316', logbookCategory: 'OEE' },
      { category: 'Shift Notes', age: '22 minutes ago', title: 'Zone 03 - Operator adjustment completed at 10:15', critical: false, tone: '#22C55E', logbookCategory: 'Shift Notes' },
    ],
    impacts: [
      { value: '-18%', label: 'Line Output', helper: 'vs last shift', tone: '#EF4444' },
      { value: '+$1.2K', label: 'Cost Impact', helper: 'vs last shift', tone: '#F97316' },
      { value: '2', label: 'Orders at Risk', helper: 'Line 10', tone: '#3B82F6' },
    ],
    documents: dashboardDocuments as DashboardDocument[],
    workItems: [
      { label: 'Work Orders', detail: '2 open • 4 in progress', status: 'Line 10', tone: '#EF4444', logbookCategory: 'Maintenance Work Order' },
      { label: 'Maintenance Requests', detail: '1 urgent • vibration', status: 'Zone 01', tone: '#F97316', logbookCategory: 'Maintenance Request' },
      { label: 'ESOs', detail: '1 open • 1 overdue', status: 'Safety lock', tone: '#2563EB', logbookCategory: 'ESO' },
    ],
    insight: 'Line 10 is the current constraint. Zone 01 has the active mechanical risk and Zone 02 is showing secondary OEE loss.',
    recommendation: 'Prioritize Line 10 Zone 01 repair and hold speed increase until the OEE trend stabilizes.',
    hover: {
      badge: 'Line 10 Live Context',
      product: 'FG-GLAMP-42 syringe assembly kit',
      batch: 'B-55292-L10',
      order: 'PO-55292',
      sku: 'FG-GLAMP-42',
      tags: [
        { label: 'CRITICAL', tone: '#DC2626', bg: '#FEE2E2' },
        { label: 'RUNNING', tone: '#1D4ED8', bg: '#DBEAFE' },
        { label: 'GOOD', tone: '#15803D', bg: '#DCFCE7' },
      ],
      metrics: [
        { label: 'Produced / Target', value: '6,041 / 10,024' },
        { label: 'OEE (Current)', value: '68%', tone: '#2563EB' },
        { label: 'Yield', value: '72%' },
        { label: 'Health', value: 'At Risk', tone: '#EF4444' },
      ],
      rows: [
        { label: 'Work Orders', detail: '2 open • 4 in progress', logbookCategory: 'Maintenance Work Order' },
        { label: 'ESOs', detail: '1 open • 1 overdue', logbookCategory: 'ESO' },
        { label: 'Events / Incidents', detail: '2 active • 1 in last 24 hrs', logbookCategory: 'ESO' },
        { label: 'Documents', detail: '3 documents • 2 SOPs • 2 work instructions', logbookCategory: 'All' },
      ],
    },
    defaultCategory: 'Maintenance Work Order',
    searchTerm: 'Zone 01',
  },
  zone: {
    overviewTitle: 'Zone 01 Overview',
    code: 'ZONE-01-SYR-ASM',
    events: [
      { category: 'Maintenance', age: '2 minutes ago', title: 'Syringe Assembly - Main bearing failure confirmed', critical: true, tone: '#EF4444', logbookCategory: 'Maintenance Work Order' },
      { category: 'ESO', age: '10 minutes ago', title: 'Vision Inspect - Guarding check required before restart', critical: true, tone: '#F97316', logbookCategory: 'ESO' },
      { category: 'Quality', age: '26 minutes ago', title: 'Conveyor Exit - Sample tray inspection passed', critical: false, tone: '#22C55E', logbookCategory: 'Quality' },
    ],
    impacts: [
      { value: '-21%', label: 'Zone Output', helper: 'current hour', tone: '#EF4444' },
      { value: '1', label: 'WO Blocking', helper: 'bearing failure', tone: '#F97316' },
      { value: '72%', label: 'Yield', helper: 'current batch', tone: '#3B82F6' },
    ],
    documents: [
      { title: 'Zone 01 Repair SOP', meta: 'Updated 12m ago • PDF', type: 'pdf' },
      { title: 'Syringe Assembly WI', meta: 'Updated 1h ago • PDF', type: 'pdf' },
      { title: 'Bearing PM Checklist', meta: 'Updated 2h ago • XLSX', type: 'xlsx' },
      { title: 'Restart Verification', meta: 'Updated 1d ago • PDF', type: 'pdf' },
    ],
    workItems: [
      { label: 'WO-55292-BRG', detail: 'Bearing replacement • open', status: 'Critical', tone: '#EF4444', logbookCategory: 'Maintenance Work Order' },
      { label: 'MR-8841', detail: 'Noise and vibration request', status: 'Open', tone: '#F97316', logbookCategory: 'Maintenance Request' },
      { label: 'ESO-1107', detail: 'Lockout verification overdue', status: 'Overdue', tone: '#2563EB', logbookCategory: 'ESO' },
    ],
    insight: 'Zone 01 has one blocking work order and one overdue ESO. The equipment-level view should focus on the bearing assembly.',
    recommendation: 'Open WO-55292-BRG, confirm LOTO, then run restart verification before full-speed release.',
    hover: {
      badge: 'Zone 01 Live Context',
      product: 'FG-GLAMP-42 sterile syringe set',
      batch: 'B-55292-Z01',
      order: 'PO-55292',
      sku: 'FG-GLAMP-42',
      tags: [
        { label: 'CRITICAL', tone: '#DC2626', bg: '#FEE2E2' },
        { label: 'RUNNING', tone: '#1D4ED8', bg: '#DBEAFE' },
        { label: 'GOOD', tone: '#15803D', bg: '#DCFCE7' },
      ],
      metrics: [
        { label: 'Produced / Target', value: '2,018 / 3,420' },
        { label: 'OEE (Current)', value: '61%', tone: '#2563EB' },
        { label: 'Yield', value: '72%' },
        { label: 'Health', value: 'Critical', tone: '#EF4444' },
      ],
      rows: [
        { label: 'Work Orders', detail: '1 blocking • 2 in progress', logbookCategory: 'Maintenance Work Order' },
        { label: 'ESOs', detail: '1 open • 1 overdue', logbookCategory: 'ESO' },
        { label: 'Events / Incidents', detail: '2 active • 1 in last 24 hrs', logbookCategory: 'ESO' },
        { label: 'Documents', detail: '4 documents • 2 work instructions', logbookCategory: 'All' },
      ],
    },
    defaultCategory: 'Maintenance Work Order',
    searchTerm: 'Syringe Assembly',
  },
  machine: {
    overviewTitle: 'Syringe Assembly Equipment',
    code: 'EQ-SYR-ASM-05',
    events: [
      { category: 'Breakdown', age: 'Now', title: 'Syringe Assembly - WO-55292-BRG bearing replacement is open', critical: true, tone: '#EF4444', logbookCategory: 'Maintenance Work Order' },
      { category: 'Maintenance Request', age: '6 minutes ago', title: 'HMI Panel - Restart permissive waiting for maintenance sign-off', critical: true, tone: '#F97316', logbookCategory: 'Maintenance Request' },
      { category: 'Shift Notes', age: '14 minutes ago', title: 'Operator adjustment completed; do not exceed ramp speed until QA release', critical: false, tone: '#22C55E', logbookCategory: 'Shift Notes' },
    ],
    impacts: [
      { value: '1', label: 'Blocking WO', helper: 'WO-55292-BRG', tone: '#EF4444' },
      { value: '36m', label: 'Downtime', helper: 'equipment', tone: '#F97316' },
      { value: '2', label: 'Docs Needed', helper: 'restart pack', tone: '#3B82F6' },
    ],
    documents: [
      { title: 'Bearing Replacement WI', meta: 'Updated 8m ago • PDF', type: 'pdf' },
      { title: 'Equipment Restart SOP', meta: 'Updated 21m ago • PDF', type: 'pdf' },
      { title: 'WO-55292-BRG Checklist', meta: 'Updated 34m ago • XLSX', type: 'xlsx' },
      { title: 'HMI Alarm Reference', meta: 'Updated 2h ago • PDF', type: 'pdf' },
    ],
    workItems: [
      { label: 'WO-55292-BRG', detail: 'Bearing replacement • assigned to Maintenance', status: 'Open', tone: '#EF4444', logbookCategory: 'Maintenance Work Order' },
      { label: 'MR-8841', detail: 'HMI restart permissive follow-up', status: 'Open', tone: '#F97316', logbookCategory: 'Maintenance Request' },
      { label: 'ESO-1107', detail: 'LOTO verification before restart', status: 'Overdue', tone: '#2563EB', logbookCategory: 'ESO' },
    ],
    insight: 'The equipment issue is isolated to the syringe assembly bearing train. The exact blocking work order is WO-55292-BRG.',
    recommendation: 'Open WO-55292-BRG, complete the bearing checklist, and attach restart verification before clearing the handover risk.',
    hover: {
      badge: 'Line 05 • Live Context',
      product: 'FG-GLAMP-42 syringe subassembly',
      batch: 'B-55292-EQ05',
      order: 'PO-55292',
      sku: 'FG-GLAMP-42',
      tags: [
        { label: 'CRITICAL', tone: '#DC2626', bg: '#FEE2E2' },
        { label: 'RUNNING', tone: '#1D4ED8', bg: '#DBEAFE' },
        { label: 'GOOD', tone: '#15803D', bg: '#DCFCE7' },
      ],
      metrics: [
        { label: 'Produced / Target', value: '6,041 / 10,024' },
        { label: 'OEE (Current)', value: '68%', tone: '#2563EB' },
        { label: 'Yield', value: '72%' },
        { label: 'Health', value: 'At Risk', tone: '#EF4444' },
      ],
      rows: [
        { label: 'Work Orders', detail: '2 open • 4 in progress', logbookCategory: 'Maintenance Work Order' },
        { label: 'ESOs', detail: '1 open • 1 overdue', logbookCategory: 'ESO' },
        { label: 'Shift Notes', detail: 'Latest: operator adjustment completed at 10:15', logbookCategory: 'Shift Notes' },
        { label: 'Events / Incidents', detail: '2 active • 1 in last 24 hrs', logbookCategory: 'ESO' },
        { label: 'Documents', detail: '3 documents • 2 SOPs • 2 work instructions', logbookCategory: 'All' },
      ],
    },
    defaultCategory: 'Maintenance Work Order',
    searchTerm: 'WO-55292-BRG',
  },
};

const drillLevelOrder: DrillLevel[] = ['plant', 'area', 'unit', 'line', 'zone', 'machine'];

const drillLevelByHierarchyKind: Partial<Record<HeaderHierarchyNodeKind, DrillLevel>> = {
  global: 'plant',
  region: 'plant',
  plant: 'plant',
  area: 'area',
  unit: 'unit',
  line: 'line',
  zone: 'zone',
  system: 'machine',
  asset: 'machine',
};

const drillLevelConfig: Record<DrillLevel, {
  activeLabel: string;
  background: string;
  breadcrumb: string[];
  infoTitle: string;
  infoSubtitle: string;
  nextLabel?: string;
  pulse: { top: string; left: string; width: string; height: string; rotate?: string; radius?: number };
  targets: Array<{
    label: string;
    top: string;
    left: string;
    width: string;
    height: string;
    attention?: boolean;
    next?: DrillLevel;
  }>;
}> = {
  plant: {
    activeLabel: 'Plant',
    background: 'url("/images/shift-logbook-hierarchy/plant.png")',
    breadcrumb: ['Columbus West'],
    infoTitle: 'Area A Assembly',
    infoSubtitle: 'Highest handover activity',
    nextLabel: 'Open area',
    pulse: { top: '22%', left: '37%', width: '30%', height: '24%', rotate: '-5deg', radius: 1.4 },
    targets: [
      { label: 'Assembly', top: '34%', left: '41%', width: '130px', height: '34px', attention: true, next: 'area' },
      { label: 'Warehouse', top: '62%', left: '9%', width: '130px', height: '34px', next: 'area' },
      { label: 'Molding', top: '14%', left: '11%', width: '116px', height: '34px', next: 'area' },
      { label: 'Packaging', top: '65%', left: '49%', width: '126px', height: '34px', next: 'area' },
      { label: 'Quality Lab', top: '78%', left: '72%', width: '132px', height: '34px', next: 'area' },
      { label: 'Maintenance', top: '42%', left: '80%', width: '138px', height: '34px', next: 'area' },
    ],
  },
  area: {
    activeLabel: 'Area',
    background: 'url("/images/shift-logbook-hierarchy/area.png")',
    breadcrumb: ['Columbus West', 'Area A'],
    infoTitle: 'Unit A',
    infoSubtitle: 'Assembly unit focus',
    nextLabel: 'Open unit',
    pulse: { top: '34%', left: '10%', width: '31%', height: '52%', rotate: '-7deg', radius: 1.4 },
    targets: [
      { label: 'Unit A', top: '48%', left: '18%', width: '104px', height: '34px', attention: true, next: 'unit' },
      { label: 'Unit B', top: '38%', left: '39%', width: '104px', height: '34px', next: 'unit' },
      { label: 'Unit C', top: '34%', left: '59%', width: '104px', height: '34px', next: 'unit' },
      { label: 'Unit D', top: '39%', left: '79%', width: '104px', height: '34px', next: 'unit' },
    ],
  },
  unit: {
    activeLabel: 'Unit',
    background: 'url("/images/shift-logbook-hierarchy/unit.png")',
    breadcrumb: ['Columbus West', 'Area A', 'Unit A'],
    infoTitle: 'Line 10',
    infoSubtitle: '1 breakdown',
    nextLabel: 'Open line',
    pulse: { top: '41%', left: '26%', width: '46%', height: '20%', rotate: '-9deg', radius: 1.5 },
    targets: [
      { label: 'Line 10', top: '48%', left: '36%', width: '108px', height: '34px', attention: true, next: 'line' },
      { label: 'Line 40', top: '61%', left: '19%', width: '108px', height: '34px', next: 'line' },
    ],
  },
  line: {
    activeLabel: 'Line',
    background: 'url("/images/shift-logbook-hierarchy/line.png")',
    breadcrumb: ['Columbus West', 'Area A', 'Unit A', 'Line 10'],
    infoTitle: 'Zone 01',
    infoSubtitle: 'Breakdown',
    nextLabel: 'Open zone',
    pulse: { top: '30%', left: '27%', width: '46%', height: '36%', rotate: '-8deg', radius: 1.6 },
    targets: [
      { label: 'Zone 01', top: '48%', left: '31%', width: '112px', height: '34px', attention: true, next: 'zone' },
      { label: 'Zone 02', top: '30%', left: '52%', width: '112px', height: '34px', next: 'zone' },
      { label: 'Zone 03', top: '54%', left: '70%', width: '112px', height: '34px', next: 'zone' },
    ],
  },
  zone: {
    activeLabel: 'Zone',
    background: 'url("/images/shift-logbook-hierarchy/zone.png")',
    breadcrumb: ['Columbus West', 'Area A', 'Unit A', 'Line 10', 'Zone 01'],
    infoTitle: 'Assembly + Conveyor',
    infoSubtitle: '2 active signals',
    nextLabel: 'Open equipment',
    pulse: { top: '13%', left: '18%', width: '58%', height: '70%', rotate: '-6deg', radius: 2 },
    targets: [
      { label: 'Syringe Assembly', top: '43%', left: '36%', width: '166px', height: '34px', attention: true, next: 'machine' },
      { label: 'Filling System', top: '15%', left: '60%', width: '136px', height: '34px', next: 'machine' },
      { label: 'Vision Inspect', top: '62%', left: '15%', width: '138px', height: '34px', next: 'machine' },
      { label: 'Conveyor Exit', top: '66%', left: '68%', width: '138px', height: '34px', attention: true, next: 'machine' },
    ],
  },
  machine: {
    activeLabel: 'Machine',
    background: 'url("/images/shift-logbook-hierarchy/machine.png")',
    breadcrumb: ['Columbus West', 'Area A', 'Unit A', 'Line 10', 'Zone 01', 'Syringe Assembly'],
    infoTitle: 'Syringe Assembly',
    infoSubtitle: 'Breakdown active',
    pulse: { top: '20%', left: '24%', width: '52%', height: '50%', rotate: '-4deg', radius: 1.5 },
    targets: [
      { label: 'HMI Panel', top: '32%', left: '25%', width: '116px', height: '34px', attention: true },
      { label: 'Filling Head', top: '26%', left: '56%', width: '126px', height: '34px' },
      { label: 'Conveyor Exit', top: '63%', left: '64%', width: '136px', height: '34px' },
      { label: 'Filling System', top: '11%', left: '65%', width: '136px', height: '34px' },
    ],
  },
};

export function ShiftLogbook3DHierarchyView({
  compact = false,
  onCreateRecord,
  onOpenAiAssistant,
  onOpenLogbook,
  onSelectionChange,
  selectedHeaderHierarchyId,
}: {
  compact?: boolean;
  onCreateRecord?: (category: DashboardLogbookCategory, targetLabel: string) => void;
  onOpenAiAssistant?: (payload: WorkstationContextualAiAssistantPayload) => void;
  onOpenLogbook?: () => void;
  onSelectionChange?: (label: string) => void;
  selectedHeaderHierarchyId?: string;
}) {
  const [dashboardDrillLevel, setDashboardDrillLevel] = React.useState<DrillLevel>('plant');
  const [hoveredDrillTarget, setHoveredDrillTarget] = React.useState<string | null>(null);
  const [selectedDashboardTarget, setSelectedDashboardTarget] = React.useState<string | null>(null);
  const [isEquipmentFocusMode, setIsEquipmentFocusMode] = React.useState(false);
  const selectedHeaderHierarchyPath = React.useMemo(
    () => selectedHeaderHierarchyId ? findHeaderHierarchyPath(selectedHeaderHierarchyId) : null,
    [selectedHeaderHierarchyId]
  );
  const selectedHeaderHierarchyNode = selectedHeaderHierarchyPath?.at(-1) ?? null;
  const headerDrivenDrillLevel = selectedHeaderHierarchyNode
    ? drillLevelByHierarchyKind[selectedHeaderHierarchyNode.kind] ?? 'plant'
    : 'plant';
  const drillConfig = drillLevelConfig[dashboardDrillLevel];
  const dashboardContext = dashboardContexts[dashboardDrillLevel];
  const isEquipmentFocusAvailable = dashboardDrillLevel === 'zone' || dashboardDrillLevel === 'machine';
  const hoveredDashboardTarget = drillConfig.targets.find((target) => target.label === hoveredDrillTarget);
  const hoverDashboardContext = hoveredDashboardTarget
    ? {
        ...dashboardContext.hover,
        badge: `${hoveredDashboardTarget.label} • Live Context`,
        tags: hoveredDashboardTarget.attention
          ? dashboardContext.hover.tags
          : dashboardContext.hover.tags.map((tag, index) => index === 0 ? { ...tag, label: 'WATCH', tone: '#C2410C', bg: '#FFEDD5' } : tag),
      }
    : null;
  const hoverDashboardRows = hoverDashboardContext
    ? [
        ...hoverDashboardContext.rows,
        ...(hoverDashboardContext.rows.some((row) => row.logbookCategory === 'Maintenance Request')
          ? []
          : [dashboardMaintenanceRequestRow]),
        ...(hoverDashboardContext.rows.some((row) => row.label.toLowerCase().includes('event'))
          ? []
          : [{
              label: 'Events / Incidents',
              detail: `${dashboardContext.events.length} active • latest ${dashboardContext.events[0]?.age ?? 'now'}`,
              logbookCategory: 'ESO' as DashboardLogbookCategory,
            }]),
      ]
    : [];
  const hoverDashboardCards = hoverDashboardContext
    ? [
        ['Product', hoverDashboardContext.product ?? hoverDashboardContext.sku],
        ['Production Order', hoverDashboardContext.order],
        ['Batch', hoverDashboardContext.batch],
      ]
    : [];
  const openCompactBluAiAssistantForHover = React.useCallback((targetLabel: string, context: NonNullable<typeof hoverDashboardContext>) => {
    if (!onOpenAiAssistant) return;

    const rows = [
      ...context.rows,
      ...(context.rows.some((row) => row.logbookCategory === 'Maintenance Request')
        ? []
        : [dashboardMaintenanceRequestRow]),
      ...(context.rows.some((row) => row.label.toLowerCase().includes('event'))
        ? []
        : [{
            label: 'Events / Incidents',
            detail: `${dashboardContext.events.length} active • latest ${dashboardContext.events[0]?.age ?? 'now'}`,
            logbookCategory: 'ESO' as DashboardLogbookCategory,
          }]),
    ];
    const equipment = targetLabel.toLowerCase().includes('conveyor')
      ? 'Conveyor Belt C4'
      : targetLabel.toLowerCase().includes('assembly') || dashboardDrillLevel === 'zone'
        ? 'Syringe Assembly SA-204'
        : targetLabel;
    const primaryRow = rows[0];
    const isAttention = context.tags.some((tag) => ['CRITICAL', 'WATCH', 'ISSUE'].includes(tag.label.toUpperCase()));
    const accent = isAttention ? '#EF4444' : '#2F6BFF';
    const rowCard = (row: HoverActionRow, index: number) => ({
      id: `linked-${index + 1}`,
      title: row.label,
      signal: row.logbookCategory,
      detail: row.detail,
      rank: index + 1,
      dueDate: row.status ?? 'Live',
      assignedTo: equipment,
      priority: row.status ?? (row.tone === '#EF4444' ? 'Critical' : 'Watch'),
      accent: row.tone ?? accent,
    });
    const metricCards = context.metrics.slice(0, 4).map((metric, index) => ({
      id: `metric-${index + 1}`,
      title: metric.label,
      signal: 'Equipment signal',
      detail: `${metric.value}${metric.helper ? ` • ${metric.helper}` : ''}`,
      rank: index + 1,
      dueDate: 'Current shift',
      assignedTo: equipment,
      priority: metric.tone === '#EF4444' ? 'High' : 'Live',
      accent: metric.tone ?? accent,
    }));
    const maintenanceCards = rows
      .filter((row) => row.logbookCategory === 'Maintenance Request' || row.logbookCategory === 'Maintenance Work Order')
      .map(rowCard);
    const esoCards = rows
      .filter((row) => row.logbookCategory === 'ESO')
      .map(rowCard);
    const documentCards = rows
      .filter((row) => row.label.toLowerCase().includes('document'))
      .map(rowCard);
    const availableDocumentCards = documentCards.length ? documentCards : [
      {
        id: 'documents-available',
        title: `${equipment} available documents`,
        signal: 'Documents',
        detail: `SOPs, work instructions, inspection evidence, and restart checklist can be reviewed for ${targetLabel}.`,
        rank: 1,
        dueDate: 'Available',
        assignedTo: equipment,
        priority: 'Ready',
        accent: '#2563EB',
      },
    ];

    onOpenAiAssistant({
      contextTitle: targetLabel,
      contextSubtitle: `${context.badge} • ${equipment}`,
      problemFilter: context.badge,
      openingText: `I am reviewing ${targetLabel} inside your workstation.\n\nEquipment context: ${equipment}. Product: ${context.product ?? context.sku}. Production order: ${context.order}. Batch: ${context.batch}. Primary signal: ${primaryRow?.label ?? 'Live context'}${primaryRow?.detail ? ` • ${primaryRow.detail}` : ''}.\n\nI can help create a maintenance request, create an ESO, or find the available documents for this equipment.`,
      quickActions: [
        {
          label: 'Summarize equipment details',
          prompt: `Summarize equipment details for ${targetLabel}`,
          response: `${equipment} is tied to ${context.order} / ${context.batch}. The live signal is ${primaryRow?.label ?? 'operational monitoring'}${primaryRow?.detail ? ` (${primaryRow.detail})` : ''}. The highest priority is to confirm the red or watch signals before handover and keep linked records updated from the workstation.`,
          responseCards: metricCards,
        },
        {
          label: 'Help me create a maintenance request',
          prompt: `Help me create a maintenance request for ${equipment}`,
          response: `I can prefill a maintenance request for ${equipment} with the current workstation context: location ${targetLabel}, production order ${context.order}, batch ${context.batch}, and the active signal ${primaryRow?.label ?? 'live equipment watch'}. Suggested priority is ${isAttention ? 'High' : 'Medium'} based on the hover context.`,
          responseCards: maintenanceCards.length ? maintenanceCards : metricCards,
          followUpActions: [
            { label: 'Open Maintenance Requests', category: 'Maintenance Request', searchTerm: equipment },
            { label: 'Open Work Orders', category: 'Maintenance Work Order', searchTerm: equipment },
          ],
        },
        {
          label: 'Create an ESO',
          prompt: `Create an ESO for ${targetLabel}`,
          response: `For an ESO, I would capture ${targetLabel}, equipment ${equipment}, the current production order ${context.order}, and the observed condition from the live card. Add any safety exposure, guarding, LOTO, housekeeping, or near-miss detail before submitting.`,
          responseCards: esoCards.length ? esoCards : metricCards,
          followUpActions: [
            { label: 'Open ESO / Events', category: 'ESO', searchTerm: targetLabel },
          ],
        },
        {
          label: 'Consult available documents',
          prompt: `Find available documents for ${equipment}`,
          response: `I found the document path for ${equipment}. Start with SOPs and work instructions, then check inspection evidence and restart checklist if this is tied to maintenance or ESO follow-up.`,
          responseCards: availableDocumentCards,
          followUpActions: [
            { label: 'Open document records', category: 'All', searchTerm: equipment },
          ],
        },
      ],
    });
  }, [dashboardContext.events, dashboardDrillLevel, onOpenAiAssistant]);

  React.useEffect(() => {
    setDashboardDrillLevel(headerDrivenDrillLevel);
    setHoveredDrillTarget(null);
    setSelectedDashboardTarget(drillLevelConfig[headerDrivenDrillLevel].infoTitle);
    setIsEquipmentFocusMode(false);
    onSelectionChange?.(selectedHeaderHierarchyNode?.label ?? drillLevelConfig[headerDrivenDrillLevel].breadcrumb.at(-1) ?? drillLevelConfig[headerDrivenDrillLevel].infoTitle);
  }, [headerDrivenDrillLevel, onSelectionChange, selectedHeaderHierarchyId, selectedHeaderHierarchyNode?.label]);

  const setDashboardLevelByIndex = (index: number) => {
    const nextLevel = drillLevelOrder[index];
    if (!nextLevel) return;
    setDashboardDrillLevel(nextLevel);
    setHoveredDrillTarget(null);
    setSelectedDashboardTarget(drillLevelConfig[nextLevel].infoTitle);
    setIsEquipmentFocusMode(false);
    onSelectionChange?.(drillLevelConfig[nextLevel].infoTitle);
  };

  const drillDownTo = (target: { label: string; next?: DrillLevel }) => {
    setSelectedDashboardTarget(target.label);
    setHoveredDrillTarget(null);
    onSelectionChange?.(target.label);
    if (!target.next) return;
    setDashboardDrillLevel(target.next);
    setSelectedDashboardTarget(drillLevelConfig[target.next].infoTitle);
    setIsEquipmentFocusMode(false);
    onSelectionChange?.(drillLevelConfig[target.next].infoTitle);
  };

  const drillUpOneLevel = () => {
    const currentIndex = drillLevelOrder.indexOf(dashboardDrillLevel);
    if (currentIndex <= 0) return;
    setDashboardLevelByIndex(currentIndex - 1);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: compact ? 300 : 420,
        borderRadius: compact ? 0 : 1.8,
        border: compact ? 0 : '1px solid #CFE0F8',
        overflow: 'hidden',
        backgroundColor: isEquipmentFocusMode ? '#F8FAFC' : '#EAF3FF',
        backgroundImage: isEquipmentFocusMode
          ? 'radial-gradient(circle at 50% 22%, rgba(47,107,255,0.14), transparent 34%), linear-gradient(180deg, #FFFFFF 0%, #EFF5FF 100%)'
          : drillConfig.background,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        boxShadow: compact ? 'none' : 'inset 0 0 0 1px rgba(255,255,255,0.35)',
        '@keyframes logbookHotspotPulse': {
          '0%': { opacity: 0.5, boxShadow: '0 0 0 0 rgba(239,68,68,0.28), 0 0 18px rgba(239,68,68,0.22)' },
          '55%': { opacity: 0.76, boxShadow: '0 0 0 10px rgba(239,68,68,0), 0 0 28px rgba(239,68,68,0.34)' },
          '100%': { opacity: 0.5, boxShadow: '0 0 0 0 rgba(239,68,68,0), 0 0 18px rgba(239,68,68,0.22)' },
        },
      }}
      onMouseLeave={() => setHoveredDrillTarget(null)}
    >
      <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(4,16,38,0.02)' }} />

      {isEquipmentFocusMode ? (
        <EquipmentFocusScene
          onSelectPart={(part) => {
            setSelectedDashboardTarget(part);
            onSelectionChange?.(part);
          }}
        />
      ) : (
        <Box
          sx={{
            position: 'absolute',
            top: drillConfig.pulse.top,
            left: drillConfig.pulse.left,
            width: drillConfig.pulse.width,
            height: drillConfig.pulse.height,
            borderRadius: drillConfig.pulse.radius ?? 1.2,
            transform: drillConfig.pulse.rotate ? `rotate(${drillConfig.pulse.rotate})` : 'none',
            transformOrigin: 'center',
            bgcolor: 'rgba(239,68,68,0.10)',
            border: '2px solid rgba(239,68,68,0.28)',
            animation: 'logbookHotspotPulse 1.8s ease-in-out infinite',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}

      <Paper
        elevation={0}
        sx={{
          position: 'absolute',
          left: compact ? 10 : 20,
          top: compact ? 10 : 18,
          zIndex: 4,
          width: 'fit-content',
          maxWidth: compact ? 'calc(100% - 20px)' : 'calc(100% - 152px)',
          display: 'flex',
          alignItems: 'center',
          gap: 0.55,
          px: compact ? 0.8 : 1.1,
          py: compact ? 0.55 : 0.75,
          borderRadius: 1.2,
          bgcolor: '#071122',
          color: '#FFFFFF',
          boxShadow: '0 10px 24px rgba(3,10,28,0.34)',
          overflowX: 'auto',
        }}
      >
        {drillConfig.breadcrumb.map((crumb, index) => {
          const isLast = index === drillConfig.breadcrumb.length - 1;
          return (
            <React.Fragment key={crumb}>
              {index > 0 ? <Typography sx={{ color: '#9FB0CD', fontSize: compact ? '0.62rem' : '0.76rem' }}>/</Typography> : null}
              <Button
                size="small"
                disabled={isLast}
                onClick={() => setDashboardLevelByIndex(index)}
                onMouseDown={(event) => event.stopPropagation()}
                sx={{
                  minWidth: 0,
                  p: 0,
                  color: '#FFFFFF',
                  fontSize: compact ? '0.64rem' : isLast ? '0.86rem' : '0.75rem',
                  fontWeight: isLast ? 900 : 600,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                  '&.Mui-disabled': { color: '#FFFFFF' },
                }}
              >
                {crumb}
              </Button>
            </React.Fragment>
          );
        })}
      </Paper>

      {dashboardDrillLevel !== 'plant' ? (
        <Button
          size="small"
          onClick={drillUpOneLevel}
          onMouseDown={(event) => event.stopPropagation()}
          sx={{
            position: 'absolute',
            left: compact ? 10 : 20,
            bottom: compact ? 10 : 18,
            zIndex: 5,
            borderRadius: 999,
            px: 1.2,
            py: 0.55,
            bgcolor: 'rgba(7,17,34,0.88)',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.18)',
            textTransform: 'none',
            fontWeight: 800,
            fontSize: compact ? '0.68rem' : '0.8125rem',
            '&:hover': { bgcolor: '#071122' },
          }}
        >
          Drill up
        </Button>
      ) : null}

      {isEquipmentFocusAvailable ? (
        <Button
          size="small"
          startIcon={isEquipmentFocusMode ? <DashboardIcon sx={{ fontSize: 15 }} /> : <ViewInArIcon sx={{ fontSize: 16 }} />}
          onClick={() => setIsEquipmentFocusMode((value) => !value)}
          onMouseDown={(event) => event.stopPropagation()}
          sx={{
            position: 'absolute',
            right: compact ? 10 : 24,
            bottom: compact ? 10 : 18,
            zIndex: 7,
            borderRadius: 999,
            px: 1.25,
            py: 0.58,
            bgcolor: isEquipmentFocusMode ? '#FFFFFF' : '#071122',
            color: isEquipmentFocusMode ? '#173A8F' : '#FFFFFF',
            border: isEquipmentFocusMode ? '1px solid rgba(47,107,255,0.24)' : '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 10px 24px rgba(3,10,28,0.24)',
            textTransform: 'none',
            fontWeight: 900,
            fontSize: compact ? '0.68rem' : '0.8125rem',
            '&:hover': { bgcolor: isEquipmentFocusMode ? '#F3F7FF' : '#0E1F48' },
            '& .MuiButton-startIcon': { mr: 0.45 },
          }}
        >
          {isEquipmentFocusMode ? 'Photo Map' : 'Equipment Views'}
        </Button>
      ) : null}

      {!isEquipmentFocusMode && drillConfig.targets.map((target) => {
        const isHovered = hoveredDrillTarget === target.label;
        return (
          <Button
            key={target.label}
            aria-label={`${target.label}${target.next ? ` ${drillConfig.nextLabel}` : ''}`}
            onClick={() => drillDownTo(target)}
            onMouseEnter={() => setHoveredDrillTarget(target.label)}
            onFocus={() => setHoveredDrillTarget(target.label)}
            onMouseDown={(event) => event.stopPropagation()}
            onPointerEnter={() => setHoveredDrillTarget(target.label)}
            sx={{
              position: 'absolute',
              zIndex: 6,
              top: target.top,
              left: target.left,
              width: compact ? `min(${target.width}, 22%)` : target.width,
              height: compact ? 28 : target.height,
              minWidth: compact ? 82 : 0,
              px: compact ? 0.65 : 1,
              py: 0.45,
              borderRadius: 1.25,
              bgcolor: isHovered ? '#0E1F48' : 'rgba(8,28,67,0.93)',
              color: '#FFFFFF',
              border: `1px solid ${target.attention ? '#EF4444' : '#78A7EC'}`,
              boxShadow: isHovered
                ? '0 10px 22px rgba(3,15,39,0.38), 0 0 0 3px rgba(59,130,246,0.18)'
                : '0 6px 14px rgba(3,15,39,0.26)',
              cursor: target.next ? 'pointer' : 'default',
              transition: 'all 0.18s ease',
              justifyContent: 'flex-start',
              textTransform: 'none',
              '&:hover': {
                bgcolor: '#0E1F48',
                transform: 'translateY(-2px)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0 }}>
              <Box
                sx={{
                  width: compact ? 7 : 8,
                  height: compact ? 7 : 8,
                  borderRadius: 99,
                  flex: '0 0 auto',
                  bgcolor: target.attention ? '#EF4444' : '#22C55E',
                  boxShadow: '0 0 0 4px rgba(255,255,255,0.08)',
                }}
              />
              <Typography sx={{ fontWeight: 900, fontSize: compact ? '0.64rem' : '0.74rem', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {target.label}
              </Typography>
            </Box>
          </Button>
        );
      })}

      {!isEquipmentFocusMode && hoveredDashboardTarget && hoverDashboardContext ? (
        <Paper
          elevation={0}
          onMouseEnter={() => setHoveredDrillTarget(hoveredDashboardTarget.label)}
          sx={{
            position: 'absolute',
            zIndex: 8,
            top: parseFloat(hoveredDashboardTarget.top) >= 48 ? '12px' : `calc(${hoveredDashboardTarget.top} + 42px)`,
            bottom: 'auto',
            left: parseFloat(hoveredDashboardTarget.top) >= 48
              ? (parseFloat(hoveredDashboardTarget.left) > 45 ? 'auto' : `calc(${hoveredDashboardTarget.left} + ${hoveredDashboardTarget.width} + 12px)`)
              : (parseFloat(hoveredDashboardTarget.left) > 58 ? 'auto' : hoveredDashboardTarget.left),
            right: parseFloat(hoveredDashboardTarget.top) >= 48
              ? (parseFloat(hoveredDashboardTarget.left) > 45 ? `calc(100% - ${hoveredDashboardTarget.left} + 12px)` : 'auto')
              : (parseFloat(hoveredDashboardTarget.left) > 58 ? 12 : 'auto'),
            width: compact ? 320 : { xs: 330, md: 438 },
            maxWidth: 'calc(100% - 24px)',
            maxHeight: 'none',
            borderRadius: '12px',
            border: `1px solid ${tokenDivider}`,
            bgcolor: 'background.paper',
            boxShadow: '0 12px 28px rgba(0,31,155,0.16)',
            overflowY: 'visible',
            overflowX: 'hidden',
          }}
        >
          <Box sx={{ height: 2, bgcolor: hoveredDashboardTarget.attention ? tokenError.main : tokenBrand.main }} />
          <Box sx={{ px: 1.05, py: 0.9, display: 'flex', alignItems: 'center', gap: 0.75, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: '6px',
                display: 'grid',
                placeItems: 'center',
                color: hoveredDashboardTarget.attention ? tokenError.main : tokenBrand.main,
                bgcolor: hoveredDashboardTarget.attention ? tokenError.softBg : tokenBrand.softBg,
                border: `1px solid ${tokenDivider}`,
              }}
            >
              {hoveredDashboardTarget.attention ? <WarningIcon sx={{ fontSize: 18 }} /> : <DashboardIcon sx={{ fontSize: 18 }} />}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.86rem', lineHeight: 1.12 }} noWrap>
                {hoverDashboardContext.badge}
              </Typography>
              <Typography sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.6rem', mt: 0.18 }} noWrap>
                Live operational context
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
              {hoverDashboardContext.tags.slice(0, compact ? 1 : 3).map((tag) => (
                <Chip
                  key={tag.label}
                  label={tag.label}
                  size="small"
                  sx={{
                    height: 18,
                    bgcolor: tag.bg,
                    color: tag.tone,
                    fontWeight: 500,
                    borderRadius: '6px',
                    border: `1px solid ${tokenDivider}`,
                    '& .MuiChip-label': { px: 0.55, fontSize: '0.5rem', letterSpacing: 0 },
                  }}
                />
              ))}
              <IconButton size="small" onClick={() => setHoveredDrillTarget(null)} sx={{ width: 24, height: 24, color: tokenText.secondary, ml: 0.1, '&:hover': { bgcolor: tokenBrand.softBg, color: tokenBrand.main } }}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>

          <Box sx={{ p: 0.9, display: 'flex', flexDirection: 'column', gap: 0.65, bgcolor: tokenNeutral.lightest }}>
            <Box
              sx={{
                p: 0.8,
                borderRadius: '8px',
                border: `1px solid ${tokenDivider}`,
                borderLeft: `3px solid ${hoveredDashboardTarget.attention ? tokenError.main : tokenBrand.main}`,
                bgcolor: 'background.paper',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: 1,
                alignItems: 'center',
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.56rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                  Primary context
                </Typography>
                <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700, mt: 0.2 }} noWrap>
                  {hoverDashboardRows[0]?.label ?? 'Operational focus'} • {hoverDashboardRows[0]?.detail ?? hoverDashboardContext.order}
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 0.75,
                  py: 0.32,
                  borderRadius: '6px',
                  bgcolor: hoveredDashboardTarget.attention ? tokenError.softBg : tokenBrand.softBg,
                  color: hoveredDashboardTarget.attention ? tokenError.dark : tokenBrand.main,
                  border: `1px solid ${tokenDivider}`,
                  fontSize: '0.56rem',
                  fontWeight: 500,
                }}
              >
                {hoveredDashboardTarget.attention ? 'Needs action' : 'Monitoring'}
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.48 }}>
              {hoverDashboardCards.map(([label, value]) => (
                <Box key={label} sx={{ minWidth: 0, p: 0.58, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.5rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.35 }}>{label}</Typography>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.67rem', fontWeight: 700, mt: 0.24, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.48 }}>
              {hoverDashboardContext.metrics.map((metric) => (
                <Box
                  key={metric.label}
                  sx={{
                    minWidth: 0,
                    p: 0.58,
                    borderRadius: '8px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'background.paper',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: 2,
                      height: '100%',
                      bgcolor: metric.tone ?? tokenBrand.main,
                      opacity: metric.tone ? 0.78 : 0.48,
                    },
                  }}
                >
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.49rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.35, pl: 0.25 }} noWrap>{metric.label}</Typography>
                  <Typography sx={{ color: metric.tone ?? tokenText.primary, fontSize: compact ? '0.72rem' : '0.88rem', fontWeight: 700, lineHeight: 1.12, mt: 0.22, pl: 0.25 }}>
                    {metric.value}
                  </Typography>
                  {metric.label.includes('OEE') ? (
                    <LinearProgress variant="determinate" value={68} sx={{ height: 4, borderRadius: 99, mt: 0.55, bgcolor: tokenNeutral.main, '& .MuiLinearProgress-bar': { bgcolor: tokenBrand.main } }} />
                  ) : null}
                </Box>
              ))}
            </Box>

            <Box sx={{ border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', borderRadius: '8px', overflow: 'hidden' }}>
              <Box sx={{ px: 0.8, py: 0.56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
                <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700 }}>Open work & records</Typography>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.55rem', fontWeight: 500 }}>{hoverDashboardRows.length} linked</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                {hoverDashboardRows.map((row) => {
                  const canCreate = row.logbookCategory === 'Maintenance Request'
                    || row.logbookCategory === 'Maintenance Work Order'
                    || row.logbookCategory === 'ESO';
                  const rowTone = row.tone
                    ?? (row.label.includes('Event') ? '#044ED7' : row.label.includes('ESO') ? '#7C3AED' : row.label.includes('Request') ? '#F97316' : '#1F2366');
                  const RowIcon = row.label.includes('Event')
                    ? ErrorOutlineIcon
                    : row.label.includes('ESO')
                      ? EsoIcon
                      : row.label.includes('Request')
                        ? MaintenanceIcon
                        : row.label.includes('Document')
                          ? NoteIcon
                          : WorkOrderIcon;

                  return (
                    <Button
                      key={row.label}
                      onClick={(event) => {
                        event.stopPropagation();
                        onOpenLogbook?.();
                      }}
                      onMouseDown={(event) => event.stopPropagation()}
                      sx={{
                        width: '100%',
                        minHeight: 40,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        borderRadius: 0,
                        border: 0,
                        borderBottom: `1px solid ${tokenDivider}`,
                        borderLeft: `2px solid ${rowTone}99`,
                        bgcolor: 'background.paper',
                        px: 0.75,
                        py: 0.48,
                        color: tokenText.primary,
                        textTransform: 'none',
                        overflow: 'hidden',
                        '&:hover': {
                          bgcolor: `${rowTone}08`,
                          '& .dashboard-row-new': {
                            opacity: 1,
                            pointerEvents: 'auto',
                            transform: 'translateX(0)',
                          },
                        },
                        '&:last-of-type': { borderBottom: 0 },
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0, width: '100%' }}>
                        <Box
                          sx={{
                            width: 23,
                            height: 23,
                            borderRadius: '6px',
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: `${rowTone}0D`,
                            color: rowTone,
                            border: `1px solid ${tokenDivider}`,
                            flex: '0 0 auto',
                          }}
                        >
                          <RowIcon sx={{ fontSize: 14 }} />
                        </Box>
                        <Box sx={{ minWidth: 0, flex: 1, textAlign: 'left', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', columnGap: 0.75, alignItems: 'baseline' }}>
                          <Typography sx={{ color: tokenText.primary, fontSize: '0.67rem', fontWeight: 700, lineHeight: 1.08 }} noWrap>
                            {row.label}
                            {row.label.includes('Work Orders') || row.label.startsWith('WO-') ? <SapBadge compact /> : null}
                          </Typography>
                          {row.status ? (
                            <Box
                              sx={{
                                px: 0.55,
                                py: 0.15,
                                borderRadius: '6px',
                                bgcolor: `${rowTone}0F`,
                                color: rowTone,
                                border: `1px solid ${tokenDivider}`,
                                fontSize: '0.49rem',
                                fontWeight: 500,
                                lineHeight: 1.2,
                              }}
                            >
                              {row.status}
                            </Box>
                          ) : null}
                          <Typography sx={{ gridColumn: '1 / -1', color: tokenText.secondary, fontSize: '0.55rem', fontWeight: 400, mt: 0.18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {row.detail}
                          </Typography>
                        </Box>
                        {canCreate ? (
                          <Box
                            component="span"
                            className="dashboard-row-new"
                            onClick={(event) => {
                              event.stopPropagation();
                              if (onCreateRecord) {
                                onCreateRecord(row.logbookCategory, hoveredDashboardTarget.label);
                                return;
                              }
                              onOpenLogbook?.();
                            }}
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 0.25,
                              height: 24,
                              px: 0.72,
                              borderRadius: '6px',
                              border: `1px solid ${tokenDivider}`,
                              bgcolor: 'background.paper',
                              color: tokenBrand.main,
                              fontWeight: 700,
                              fontSize: '0.58rem',
                              lineHeight: 1,
                              opacity: 0,
                              pointerEvents: 'none',
                              transform: 'translateX(4px)',
                              transition: 'opacity 0.14s ease, transform 0.14s ease, background-color 0.14s ease',
                              flex: '0 0 auto',
                              '&:hover': {
                                bgcolor: tokenBrand.softBg,
                                borderColor: tokenBrand.main,
                              },
                            }}
                          >
                            <AddIcon sx={{ fontSize: 14 }} />
                            New
                          </Box>
                        ) : null}
                        <ChevronRightIcon sx={{ color: tokenText.secondary, fontSize: 16, flex: '0 0 auto' }} />
                      </Box>
                    </Button>
                  );
                })}
              </Box>
            </Box>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 0.75,
                position: 'sticky',
                zIndex: 1,
                bottom: 0,
                mx: -0.9,
                mb: -0.9,
                px: 0.9,
                py: 0.75,
                borderTop: `1px solid ${tokenDivider}`,
                bgcolor: 'background.paper',
              }}
            >
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  if (onOpenAiAssistant) {
                    openCompactBluAiAssistantForHover(hoveredDashboardTarget.label, hoverDashboardContext);
                    return;
                  }
                  onOpenLogbook?.();
                }}
                onMouseDown={(event) => event.stopPropagation()}
                startIcon={<SparkleIcon sx={{ fontSize: 16 }} />}
                sx={{
                  minHeight: 32,
                  borderRadius: '8px',
                  bgcolor: tokenBrand.main,
                  color: tokenBrand.contrast,
                  fontWeight: 700,
                  textTransform: 'none',
                  px: 1.1,
                  py: 0.48,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: tokenBrand.dark,
                    boxShadow: 'none',
                  },
                  '& .MuiButton-startIcon': { mr: 0.45 },
                }}
              >
                Ask BLU.AI
              </Button>
            </Box>
          </Box>
        </Paper>
      ) : null}
    </Paper>
  );
}

const ShiftLogbookScreen: React.FC<ShiftLogbookScreenProps> = ({ activeTheme, onOpenDocumentManagement, onOpenSparePartsManagement, onOpenAiAssistant, selectedHeaderHierarchyId }) => {
  const shiftManagementContext = useOptionalShiftManagementContext();
  const logbook = shiftManagementContext?.logbook;

  const [localCategory, setLocalCategory] = React.useState<any>('Dashboard');
  const [localSearch, setLocalSearch] = React.useState('');
  const [selectedCell, setSelectedCell] = React.useState<string>('All Lines');
  const [hoveredCell, setHoveredCell] = React.useState<string | null>(null);
  const [liveEvents, setLiveEvents] = React.useState<LiveEventItem[]>([]);
  const [liveClockMs, setLiveClockMs] = React.useState(() => Date.now());
  const [localFilters, setLocalFilters] = React.useState({
    zone: 'All',
    riskLevel: 'All',
    dateRange: 'All',
    shift: 'All',
    type: 'All',
    assignee: 'All',
    area: 'All',
    status: 'All',
  });
  const [selectedMaintenanceRequestCard, setSelectedMaintenanceRequestCard] = React.useState<MaintenanceCard | null>(null);
  const [maintenanceWorkOrderDraft, setMaintenanceWorkOrderDraft] = React.useState<WorkOrderDraft | null>(null);
  const [maintenanceWorkOrderTab, setMaintenanceWorkOrderTab] = React.useState<WorkOrderTab>('attachments');
  const [maintenanceDrawerToast, setMaintenanceDrawerToast] = React.useState<string | null>(null);
  const [selectedEsoReport, setSelectedEsoReport] = React.useState<ReportRow | null>(null);
  const [selectedEsoReportMode, setSelectedEsoReportMode] = React.useState<'view' | 'edit'>('view');
  const [selectedRcaEntry, setSelectedRcaEntry] = React.useState<ShiftLogbookEntry | null>(null);
  const [selectedSparePartsInventoryPart, setSelectedSparePartsInventoryPart] = React.useState<SparePartsInventoryPart | null>(null);
  const [requestedSparePartsPurchasePartIds, setRequestedSparePartsPurchasePartIds] = React.useState<string[]>([]);

  const shiftLogbookCategory = logbook?.shiftLogbookCategory ?? localCategory;
  const setShiftLogbookCategory = logbook?.setShiftLogbookCategory ?? setLocalCategory;
  const shiftLogbookSearch = logbook?.shiftLogbookSearch ?? localSearch;
  const setShiftLogbookSearch = logbook?.setShiftLogbookSearch ?? setLocalSearch;
  const shiftLogbookFilters = logbook?.shiftLogbookFilters ?? localFilters;
  const setShiftLogbookFilters = logbook?.setShiftLogbookFilters ?? setLocalFilters;
  const handleShiftLogbookTicketSelect = logbook?.handleShiftLogbookTicketSelect ?? (() => {});
  const submittedRcaEntries = (logbook?.shiftLogbookSubmittedRcaEntries ?? []) as ShiftLogbookEntry[];
  const allShiftLogbookEntries = React.useMemo(
    () => [...submittedRcaEntries, ...shiftLogbookEntries],
    [submittedRcaEntries],
  );
  const workOrderLiveFillTimersRef = React.useRef<number[]>([]);
  const clearWorkOrderLiveFillTimers = React.useCallback(() => {
    workOrderLiveFillTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    workOrderLiveFillTimersRef.current = [];
  }, []);
  React.useEffect(() => () => clearWorkOrderLiveFillTimers(), [clearWorkOrderLiveFillTimers]);
  const closeLegacyMaintenanceDrawers = () => {
    logbook?.closeShiftLogbookMaintenanceReview?.();
    logbook?.closeShiftLogbookRcaFlow?.();
    logbook?.closeShiftLogbookFishboneWorkspace?.();
    logbook?.closeShiftLogbookFaultTreeWorkspace?.();
    logbook?.setIsShiftLogbookSourceDrawerOpen?.(false);
    setSelectedRcaEntry(null);
  };
  const closeMaintenanceWorkOrderDrawer = () => {
    clearWorkOrderLiveFillTimers();
    logbook?.setIsShiftLogbookSourceDrawerOpen?.(false);
    setMaintenanceWorkOrderDraft(null);
    setMaintenanceWorkOrderTab('attachments');
  };
  const openLogbookMaintenanceEntry = (entry: ShiftLogbookEntry, fallbackDetails: any) => {
    if (entry.category === 'RCA') {
      closeLegacyMaintenanceDrawers();
      setSelectedMaintenanceRequestCard(null);
      setMaintenanceWorkOrderDraft(null);
      setSelectedEsoReport(null);
      setSelectedRcaEntry(entry);
      return;
    }

    if (entry.category === 'Maintenance Request') {
      closeLegacyMaintenanceDrawers();
      const followUpContext = getLogbookWorkOrderContext(entry);
      setSelectedEsoReport(null);
      setMaintenanceWorkOrderDraft(null);
      setMaintenanceWorkOrderTab('attachments');
      setSelectedMaintenanceRequestCard(followUpContext?.sourceCard ?? buildMaintenanceCardFromLogbookEntry(entry));
      return;
    }

    if (entry.category === 'Maintenance Work Order') {
      closeLegacyMaintenanceDrawers();
      const followUpContext = getLogbookWorkOrderContext(entry);
      const card = followUpContext?.sourceCard ?? buildMaintenanceCardFromLogbookEntry(entry);
      setSelectedEsoReport(null);
      setSelectedMaintenanceRequestCard(null);
      setMaintenanceWorkOrderDraft({
        ...buildWorkOrderDraftFromBoardCard(card, followUpContext?.followUpStatus ?? 'Planning'),
        sourceRequestId: followUpContext?.workOrderId ?? getLogbookMaintenanceNumber(entry),
        drawerTitle: followUpContext?.workOrderId ?? getLogbookMaintenanceNumber(entry),
        statusLabel: followUpContext?.followUpStatus ?? 'Planning',
        equipment: followUpContext?.equipment ?? card.requestContext?.equipment ?? card.title,
        equipmentCriticality: card.equipmentCriticality,
        responsibleName: card.assignee,
        problemDescription: card.detail,
        maintenanceType: followUpContext?.type ?? card.requestContext?.maintenanceType ?? 'Corrective',
        activityType: card.requestContext?.activityType ?? 'Mechanical',
        downtime: card.requestContext?.downtime ?? 'Low',
        quality: card.requestContext?.quality ?? 'Medium',
        ehs: card.requestContext?.ehs ?? 'Medium',
        priority: card.priority,
      });
      setMaintenanceWorkOrderTab('attachments');
      return;
    }

    if (entry.category === 'ESO') {
      closeLegacyMaintenanceDrawers();
      setSelectedMaintenanceRequestCard(null);
      closeMaintenanceWorkOrderDrawer();
      setSelectedEsoReportMode('view');
      setSelectedEsoReport(buildEsoReportFromLogbookEntry(entry));
      return;
    }

    handleShiftLogbookTicketSelect(fallbackDetails);
  };

  const openRcaFromLogbookContext = React.useCallback((
    details: {
      source: 'Maintenance Work Order' | 'ESO' | 'Incident';
      number?: string;
      workOrder?: string;
      title?: string;
      description?: string;
      problemDescription?: string;
      equipment?: string;
      location?: string;
      reporter?: string;
      line?: string;
      zone?: string;
      shift?: string;
      riskLevel?: string;
      status?: string;
    },
  ) => {
    if (!logbook) return;

    const sourceNumber = details.number ?? details.workOrder ?? 'New RCA';
    const problem = details.problemDescription ?? details.description ?? details.title ?? 'Root cause analysis opened from Logbook context.';
    const equipment = details.equipment ?? details.title ?? 'Current equipment';

    logbook.setIsShiftLogbookSourceDrawerOpen?.(true);
    logbook.setShiftLogbookMaintenanceReviewDetails?.({
      ...details,
      number: sourceNumber,
      workOrder: details.workOrder ?? sourceNumber,
      title: details.title ?? equipment,
      description: problem,
      equipment,
      location: details.location ?? `${details.line ?? 'Line 10'} - ${details.zone ?? 'Zone 01'}`,
      reportedBy: details.reporter ?? 'BLU.AI',
      date: 'Live now',
      oee: '68%',
      availability: '91%',
      performance: '74%',
      quality: '96%',
      status: details.status ?? 'In Progress',
    });
    logbook.setShiftLogbookRcaSource?.(details.source);
    logbook.setShiftLogbookRcaNumber?.(sourceNumber);
    logbook.setShiftLogbookFiveWhysProblem?.(problem);
    logbook.setShiftLogbookFiveWhysSteps?.([
      { label: '1. Why did the problem occur?', answer: `${equipment} is showing an abnormal condition in the current Logbook context.` },
      { label: '2. Why? (2nd level)', answer: 'The latest linked maintenance/OEE signals point to drift before the operator intervention.' },
      { label: '3. Why? (3rd level)', answer: 'The standard check did not fully isolate the mechanical contributor during the shift.' },
      { label: '4. Why? (4th level)', answer: 'The team is treating the symptom while related work is still open in the queue.' },
      { label: '5. Why? (Root cause)', answer: 'Preventive confirmation and ownership are not consistently closed before restart.' },
    ]);
    setSelectedRcaEntry(null);
    logbook.openShiftLogbookRcaDrawer?.();
  }, [logbook]);

  const startRcaFromWorkOrderDraft = React.useCallback((draft: WorkOrderDraft) => {
    openRcaFromLogbookContext({
      source: 'Maintenance Work Order',
      number: draft.drawerTitle ?? draft.sourceRequestId ?? draft.sourceCardId ?? 'WO Draft',
      workOrder: draft.drawerTitle ?? draft.sourceRequestId ?? draft.sourceCardId ?? 'WO Draft',
      title: draft.equipment || draft.drawerTitle || 'Work Order',
      description: draft.problemDescription,
      equipment: draft.equipment,
      reporter: draft.responsibleName,
      riskLevel: draft.priority === 'High' || draft.priority === 'Emergency' || draft.priority === 'Immediate' ? 'High' : draft.priority === 'Medium' ? 'Medium' : 'Low',
    });
  }, [openRcaFromLogbookContext]);

  const startRcaFromEsoReport = React.useCallback((report: ReportRow) => {
    const meta = `${report.type} in ${report.area} / ${report.line}`;
    openRcaFromLogbookContext({
      source: report.type === 'Near Miss' ? 'Incident' : 'ESO',
      number: report.id,
      title: meta,
      description: `${report.type} requires RCA review from the Logbook ESO drawer.`,
      equipment: report.area,
      location: `${report.area} - ${report.line}`,
      reporter: report.observer,
      line: report.area,
      zone: report.line,
      riskLevel: report.type === 'Near Miss' ? 'High' : 'Medium',
    });
  }, [openRcaFromLogbookContext]);

  const [entryNotes, setEntryNotes] = React.useState<Record<string, string>>({});
  const [editingNoteId, setEditingNoteId] = React.useState<string | null>(null);
  const [editingNoteValue, setEditingNoteValue] = React.useState('');
  const [isShiftHandoverOpen, setIsShiftHandoverOpen] = React.useState(false);
  const [isHandoverSendDialogOpen, setIsHandoverSendDialogOpen] = React.useState(false);
  const [isHandoverPdfPreviewOpen, setIsHandoverPdfPreviewOpen] = React.useState(false);
  const [handoverStreamStep, setHandoverStreamStep] = React.useState(0);
  const [handoverTopicToggles, setHandoverTopicToggles] = React.useState<Record<string, boolean>>({
    'Production & OEE': true,
    Quality: true,
    Maintenance: false,
    'Safety / ESO': true,
    'Work Orders': false,
    'Events & Issues': true,
    Downtime: true,
    'People / Crew': true,
    'Pending Actions': true,
    'Planned Activities': true,
  });
  const [handoverFocusChips, setHandoverFocusChips] = React.useState<string[]>(['Material Feed Jam', 'OEE Drop', 'Crew Coverage']);
  const [handoverSelectedLines, setHandoverSelectedLines] = React.useState<string[]>(['Line 1', 'Line 2', 'Line 3']);
  const [handoverSendTo, setHandoverSendTo] = React.useState<Record<string, boolean>>({
    'Incoming Shift Lead': true,
    'Maintenance Lead': true,
    'Quality Lead': true,
    'EHS Owner': false,
    'Production Manager': true,
  });
  const [handoverDeliveryChannels, setHandoverDeliveryChannels] = React.useState<Record<string, boolean>>({
    Email: true,
    'Microsoft Teams': true,
    'Shift Logbook': true,
  });
  const [handoverEmailList, setHandoverEmailList] = React.useState('shift.lead@bd.com; maintenance.lead@bd.com; quality.lead@bd.com');
  const [handoverTeamsChannel, setHandoverTeamsChannel] = React.useState('Columbus West / Incoming Shift');
  const [handoverGenerationOptions, setHandoverGenerationOptions] = React.useState<Record<string, boolean>>({
    'Include charts & visuals': true,
    'Auto-summarize long notes': true,
    'Attach open actions': true,
  });
  const [handoverShiftFilter, setHandoverShiftFilter] = React.useState('Current Shift');
  const [handoverDateFilter, setHandoverDateFilter] = React.useState(() => new Date().toISOString().slice(0, 10));
  const [handoverLineTab, setHandoverLineTab] = React.useState('Line 1');
  const [handoverNotes, setHandoverNotes] = React.useState('Line 3 needs restart confirmation after conveyor recovery. Quality to verify label alignment before full-speed release.');
  const [isDraftingHandoverNotes, setIsDraftingHandoverNotes] = React.useState(false);
  const [draftingHandoverSuggestionIndex, setDraftingHandoverSuggestionIndex] = React.useState<number | null>(null);
  const [draftedHandoverSuggestionCount, setDraftedHandoverSuggestionCount] = React.useState(0);
  const [handoverDraftProgress, setHandoverDraftProgress] = React.useState(0);
  const handoverDraftTimerRef = React.useRef<number | null>(null);
  const [dashboardDrillLevel, setDashboardDrillLevel] = React.useState<DrillLevel>('plant');
  const [hoveredDrillTarget, setHoveredDrillTarget] = React.useState<string | null>(null);
  const [selectedDashboardTarget, setSelectedDashboardTarget] = React.useState<string | null>(null);
  const [isEquipmentFocusMode, setIsEquipmentFocusMode] = React.useState(false);
  const [isDashboardFocusMode, setIsDashboardFocusMode] = React.useState(false);
  const [streamedAiInsight, setStreamedAiInsight] = React.useState('');
  const [isLogbookAiInsightTyping, setIsLogbookAiInsightTyping] = React.useState(false);
  const [isLogbookAiPanelExpanded, setIsLogbookAiPanelExpanded] = React.useState(true);
  const [selectedCilLogRow, setSelectedCilLogRow] = React.useState<(typeof logbookCilCenterlineRows)[number] | null>(null);

  const effectiveCategory = shiftLogbookCategory === 'Dashboard' ? 'All' : shiftLogbookCategory;
  React.useEffect(() => {
    setIsLogbookAiInsightTyping(true);
    const timerId = window.setTimeout(() => setIsLogbookAiInsightTyping(false), 900);
    return () => window.clearTimeout(timerId);
  }, [effectiveCategory, selectedCell, shiftLogbookFilters.zone, shiftLogbookFilters.shift, shiftLogbookFilters.riskLevel]);
  React.useEffect(() => () => {
    if (handoverDraftTimerRef.current) window.clearInterval(handoverDraftTimerRef.current);
  }, []);
  const selectedHeaderHierarchyPath = React.useMemo(
    () => selectedHeaderHierarchyId ? findHeaderHierarchyPath(selectedHeaderHierarchyId) : null,
    [selectedHeaderHierarchyId]
  );
  const selectedHeaderHierarchyNode = selectedHeaderHierarchyPath?.at(-1) ?? null;
  const headerDrivenDrillLevel = selectedHeaderHierarchyNode
    ? drillLevelByHierarchyKind[selectedHeaderHierarchyNode.kind] ?? 'plant'
    : 'plant';
  const drillConfig = drillLevelConfig[dashboardDrillLevel];
  const dashboardContext = dashboardContexts[dashboardDrillLevel];
  const selectedDashboardLabel = selectedDashboardTarget ?? drillConfig.infoTitle;
  const isEquipmentFocusAvailable = dashboardDrillLevel === 'zone' || dashboardDrillLevel === 'machine';
  const hoveredDashboardTarget = drillConfig.targets.find((target) => target.label === hoveredDrillTarget);
  const hoverDashboardContext = hoveredDashboardTarget
    ? {
        ...dashboardContext.hover,
        badge: `${hoveredDashboardTarget.label} • Live Context`,
        tags: hoveredDashboardTarget.attention
          ? dashboardContext.hover.tags
          : dashboardContext.hover.tags.map((tag, index) => index === 0 ? { ...tag, label: 'WATCH', tone: '#C2410C', bg: '#FFEDD5' } : tag),
      }
    : null;
  const hoverDashboardRows = hoverDashboardContext
    ? [
        ...hoverDashboardContext.rows,
        ...(hoverDashboardContext.rows.some((row) => row.logbookCategory === 'Maintenance Request')
          ? []
          : [dashboardMaintenanceRequestRow]),
        ...(hoverDashboardContext.rows.some((row) => row.label.toLowerCase().includes('event'))
          ? []
          : [{
              label: 'Events / Incidents',
              detail: `${dashboardContext.events.length} active • latest ${dashboardContext.events[0]?.age ?? 'now'}`,
              logbookCategory: 'ESO' as DashboardLogbookCategory,
            }]),
      ]
    : [];
  const hoverDashboardCards = hoverDashboardContext
    ? [
        ['Product', hoverDashboardContext.product ?? hoverDashboardContext.sku],
        ['Production Order', hoverDashboardContext.order],
        ['Batch', hoverDashboardContext.batch],
      ]
    : [];

  const buildBluAiAssistantContext = React.useCallback((targetLabel: string, context: NonNullable<typeof hoverDashboardContext>, scopeLevel: DrillLevel): BluAiAssistantContext => {
    const rows = context.rows ?? [];
    const events = context.events ?? [];
    const metrics = context.metrics ?? [];
    const latestEvent = events[0];
    const primaryRow = rows[0];
    const isConveyor = targetLabel.toLowerCase().includes('conveyor');
    const isAssembly = targetLabel.toLowerCase().includes('assembly');
    const isZone = scopeLevel === 'zone';
    const isLine = scopeLevel === 'line';
    const isLocalOperatorContext = scopeLevel === 'zone' || scopeLevel === 'machine';
    const scopeName: Record<DrillLevel, string> = {
      plant: 'plant',
      area: 'area',
      unit: 'unit',
      line: 'line',
      zone: 'zone',
      machine: 'equipment',
    };
    const scopeOwner: Record<DrillLevel, string> = {
      plant: 'plant leadership',
      area: 'area lead',
      unit: 'unit lead',
      line: 'line leader',
      zone: 'zone operator',
      machine: 'operator + maintenance',
    };
    const isAttention = context.tags.some((tag) => ['CRITICAL', 'WATCH', 'ISSUE'].includes(tag.label.toUpperCase()));
    const equipment = getDashboardTargetEquipment(targetLabel);
    const accent = isAttention ? '#EF4444' : isConveyor ? '#F97316' : '#2F6BFF';
    const metricSummary = metrics.slice(0, 2).map((metric) => `${metric.label}: ${metric.value}`).join(' • ');
    const operationalRows = rows.filter((row) => !row.label.toLowerCase().includes('document'));
    const rowSummary = operationalRows.map((row) => `${row.label} (${row.detail})`).join(' | ');
    const scopeText = context.badge;
    const actionNavigation = [
      { label: 'Go to OEE events', category: 'OEE' as DashboardLogbookCategory, searchTerm: targetLabel },
      { label: 'Go to Events / Incidents', category: 'ESO' as DashboardLogbookCategory, searchTerm: targetLabel },
      { label: 'Go to Maintenance Requests', category: 'Maintenance Request' as DashboardLogbookCategory, searchTerm: equipment },
      { label: 'Go to Work Orders', category: 'Maintenance Work Order' as DashboardLogbookCategory, searchTerm: equipment },
      { label: 'Go to All Logbook', category: 'All' as DashboardLogbookCategory, searchTerm: targetLabel },
    ];
    const rowCards = operationalRows.map((row, index) => ({
      id: `row-${index + 1}`,
      title: row.label,
      signal: row.logbookCategory === 'All' ? 'Live context' : row.logbookCategory,
      detail: row.detail,
      rank: index + 1,
      dueDate: row.status ?? 'Live',
      assignedTo: equipment,
      priority: row.status ?? (row.tone === '#EF4444' ? 'Critical' : 'Watch'),
      accent: row.tone ?? accent,
    }));
    const sampleLogbookCards = (category: DashboardLogbookCategory | 'All', limit = 3) => {
      const normalizedCategory = category === 'All' ? '' : category.toLowerCase();
      const normalizedEquipment = equipment.toLowerCase();
      const normalizedTarget = targetLabel.toLowerCase();
      const rankedEntries = shiftLogbookEntries
        .filter((entry) => !normalizedCategory || entry.category.toLowerCase() === normalizedCategory)
        .sort((left, right) => {
          const score = (entry: ShiftLogbookEntry) => {
            const searchable = `${entry.title} ${entry.line} ${entry.zone} ${entry.reporter}`.toLowerCase();
            let value = 0;
            if (searchable.includes(normalizedEquipment) || searchable.includes(normalizedTarget)) value -= 4;
            if (entry.riskLevel === 'High') value -= 3;
            if (entry.status !== 'Closed') value -= 2;
            return value;
          };
          return score(left) - score(right);
        });
      return rankedEntries.slice(0, limit).map((entry, index) => ({
        id: `sample-${entry.id}`,
        title: entry.title,
        signal: entry.category,
        detail: `${entry.ticketType} • ${entry.line} • ${entry.zone} • ${entry.status}`,
        rank: index + 1,
        dueDate: entry.createdAt,
        assignedTo: entry.reporter,
        priority: entry.riskLevel,
        accent: entry.tone,
      }));
    };
    const sortSignalCards = <T extends { accent?: string; priority?: string; dueDate?: string; signal?: string; title?: string; rank: number }>(cards: T[]) => (
      cards.slice().sort((left, right) => {
        const score = (card: T) => {
          const searchable = `${card.priority ?? ''} ${card.dueDate ?? ''} ${card.signal ?? ''} ${card.title ?? ''}`.toLowerCase();
          if (card.accent === '#EF4444' || /critical|high|overdue|breakdown|urgent|needs action|watch/.test(searchable)) return 0;
          if (card.accent === '#F97316' || /warning|risk|medium|immediate/.test(searchable)) return 1;
          if (card.accent === '#2563EB' || /live|current/.test(searchable)) return 2;
          return 3;
        };
        return score(left) - score(right);
      }).map((card, index) => ({ ...card, rank: index + 1 }))
    );
    const explicitOeeEvents = events.filter((event) => /oee|micro-stop|microstop|speed|downtime|output|production|availability|performance/i.test(`${event.category} ${event.title}`));
    const oeeMetric = metrics.find((metric) => /oee/i.test(metric.label));
    const outputMetric = metrics.find((metric) => /produced|target|output/i.test(metric.label));
    const yieldMetric = metrics.find((metric) => /yield|quality/i.test(metric.label));
    const derivedOeeCards = [
      oeeMetric ? {
        id: 'oee-current',
        title: `OEE running at ${oeeMetric.value}`,
        signal: 'OEE event',
        detail: `${targetLabel} is below the expected shift recovery curve${oeeMetric.helper ? ` • ${oeeMetric.helper}` : ''}.`,
        rank: 1,
        dueDate: 'Current shift',
        assignedTo: isLocalOperatorContext ? 'Operator + line lead' : 'Line leader',
        priority: isAttention ? 'High' : 'Watch',
        accent: isAttention ? '#EF4444' : '#F97316',
      } : null,
      outputMetric ? {
        id: 'oee-output-gap',
        title: `Output pacing ${outputMetric.value}`,
        signal: 'Output loss event',
        detail: `${targetLabel} needs recovery tracking against target before the next handover window${outputMetric.helper ? ` • ${outputMetric.helper}` : ''}.`,
        rank: 2,
        dueDate: 'Next handover',
        assignedTo: isLocalOperatorContext ? 'Operator' : 'Line leader',
        priority: isAttention ? 'High' : 'Watch',
        accent: isAttention ? '#EF4444' : '#F97316',
      } : null,
      isLocalOperatorContext ? {
        id: 'oee-local-stops',
        title: 'Micro-stop pattern needs confirmation',
        signal: 'Availability event',
        detail: `${equipment} should be checked for short stops, blocked flow, or speed loss before the line escalates.`,
        rank: 3,
        dueDate: 'Now',
        assignedTo: 'Operator',
        priority: 'High',
        accent: '#EF4444',
      } : null,
      yieldMetric ? {
        id: 'oee-quality-loss',
        title: `Quality yield at ${yieldMetric.value}`,
        signal: 'Quality loss event',
        detail: `${targetLabel} may be contributing quality loss into OEE if rejects continue${yieldMetric.helper ? ` • ${yieldMetric.helper}` : ''}.`,
        rank: 4,
        dueDate: 'Current shift',
        assignedTo: isLocalOperatorContext ? 'Operator + quality' : 'Line leader + quality',
        priority: yieldMetric.tone === '#EF4444' ? 'High' : 'Live',
        accent: yieldMetric.tone ?? '#2563EB',
      } : null,
    ].filter(Boolean) as Array<{
      id: string;
      title: string;
      signal: string;
      detail: string;
      rank: number;
      dueDate: string;
      assignedTo: string;
      priority: string;
      accent: string;
    }>;
    const oeeEventCards = sortSignalCards([
      ...sampleLogbookCards('OEE', 3),
      ...explicitOeeEvents.map((event, index) => ({
        id: `event-${index + 1}`,
        title: event.title,
        signal: event.category.toLowerCase().includes('oee') ? 'OEE event' : 'OEE related event',
        detail: `${event.age} • ${targetLabel}`,
        rank: index + 1,
        dueDate: event.age,
        assignedTo: context.badge,
        priority: event.critical ? 'Critical' : 'Watch',
        accent: event.critical ? '#EF4444' : event.tone,
      })),
      ...derivedOeeCards,
    ]).slice(0, 5).map((card, index) => ({ ...card, rank: index + 1 }));
    const linkedWorkCards = rowCards.filter((card) => (
      card.signal === 'Maintenance Request'
      || card.signal === 'Maintenance Work Order'
      || card.signal === 'ESO'
      || card.signal === 'Shift Notes'
    ));
    const summaryCards = sortSignalCards([
      ...sampleLogbookCards('OEE', 2),
      ...sampleLogbookCards('Maintenance Request', 2),
      ...sampleLogbookCards('Maintenance Work Order', 2),
      ...sampleLogbookCards('ESO', 1),
      ...linkedWorkCards.slice(0, 3),
      ...oeeEventCards.slice(0, 3),
      {
        id: 'next-action',
        title: 'Next best action',
        signal: 'Recommendation',
        detail: context.recommendation ?? dashboardContext.recommendation,
        rank: oeeEventCards.length + linkedWorkCards.length + 1,
        dueDate: 'Before handover',
        assignedTo: 'Shift lead + maintenance',
        priority: isAttention ? 'High' : 'Medium',
        accent,
      },
    ]).slice(0, 5).map((card, index) => ({ ...card, rank: index + 1 }));
    const maintenanceCards = sortSignalCards((rowCards.filter((card) => card.signal === 'Maintenance Request' || card.signal === 'Maintenance Work Order').length
      ? [...sampleLogbookCards('Maintenance Request', 3), ...sampleLogbookCards('Maintenance Work Order', 3), ...rowCards.filter((card) => card.signal === 'Maintenance Request' || card.signal === 'Maintenance Work Order')]
      : [
          ...sampleLogbookCards('Maintenance Request', 3),
          ...sampleLogbookCards('Maintenance Work Order', 3),
          {
            id: 'maintenance-1',
            title: equipment,
            signal: 'Maintenance triage',
            detail: rowSummary || `${targetLabel} has a live operational signal. Review linked records before creating duplicate work.`,
            rank: 1,
            dueDate: 'Now',
            assignedTo: 'Maintenance lead',
            priority: isAttention ? 'High' : 'Medium',
            accent,
          },
        ])).slice(0, 5).map((card, index) => ({ ...card, rank: index + 1 }));
    const esoCards = sortSignalCards((rowCards.filter((card) => card.signal === 'ESO').length
      ? [...sampleLogbookCards('ESO', 4), ...rowCards.filter((card) => card.signal === 'ESO')]
      : [
          ...sampleLogbookCards('ESO', 4),
          {
            id: 'eso-context',
            title: 'ESO / safety verification',
            signal: 'ESO',
            detail: isAttention
              ? `${targetLabel} has a live attention signal. Confirm lockout, guarding, and operator safety context before escalation.`
              : `${targetLabel} has no overdue ESO, but the current shift context should be reviewed before handover.`,
            rank: 1,
            dueDate: isAttention ? 'Now' : 'Before handover',
            assignedTo: 'Safety + shift lead',
            priority: isAttention ? 'High' : 'Live',
            accent: isAttention ? '#EF4444' : '#2563EB',
          },
        ])).slice(0, 5).map((card, index) => ({ ...card, rank: index + 1 }));

    const briefingLabel: Record<DrillLevel, string> = {
      plant: 'Brief plant priorities',
      area: 'Brief area priorities',
      unit: 'Brief unit priorities',
      line: 'Brief line leader priorities',
      zone: 'Show zone operator brief',
      machine: 'Show equipment action brief',
    };
    const briefingPrompt = isLocalOperatorContext
      ? `What should I check first at ${targetLabel}?`
      : `What should I prioritize for ${targetLabel}?`;
    const shiftSummaryResponse = isLocalOperatorContext
      ? `${scopeText}: immediate action brief for the operator. Red items are first because they can affect safety, OEE, or handover quality.`
      : `${scopeText}: ${scopeName[scopeLevel]} priority brief for the ${scopeOwner[scopeLevel]}. Red items are first, then recovery signals and linked work to review before handover.`;
    const eventResponse = `${targetLabel}: OEE event trail focused on availability, speed loss, output gap, and quality loss signals.`;
    const maintenanceResponse = isLocalOperatorContext
      ? `${equipment}: local maintenance actions to confirm before creating or escalating work.`
      : `${equipment}: maintenance-facing next steps from the linked work context.`;
    const performanceResponse = `${targetLabel}: current OEE/output risk and where to look next.`;
    const esoResponse = `${targetLabel}: ESO and safety signals for this live context.`;
    const escalationResponse = isLocalOperatorContext
      ? `${targetLabel}: start with the first red card, confirm the local condition, then decide whether to escalate to maintenance or safety.`
      : `${targetLabel}: escalation view for the line leader, ordered by highest operational risk first.`;

    const suggestions: BluAiAssistantSuggestion[] = [
      {
        id: 'shift-summary',
        label: briefingLabel[scopeLevel],
        prompt: briefingPrompt,
        response: shiftSummaryResponse,
        responseCards: summaryCards,
        followUpActions: actionNavigation,
      },
      {
        id: 'latest-events',
        label: 'Show OEE loss events',
        prompt: 'Show the current OEE loss events',
        response: eventResponse,
        responseCards: oeeEventCards,
        followUpActions: [
          { label: 'Go to OEE events', category: 'OEE' as DashboardLogbookCategory, searchTerm: targetLabel },
          { label: 'Go to Events / Incidents', category: 'ESO' as DashboardLogbookCategory, searchTerm: targetLabel },
          { label: 'Go to All Logbook', category: 'All' as DashboardLogbookCategory, searchTerm: targetLabel },
        ],
      },
      {
        id: 'escalation-next',
        label: isLocalOperatorContext ? 'What should I check first?' : 'What should I escalate?',
        prompt: isLocalOperatorContext ? `What should I check first at ${targetLabel}?` : `What should I escalate for ${targetLabel}?`,
        response: escalationResponse,
        responseCards: summaryCards.slice(0, 4).map((card, index) => ({ ...card, rank: index + 1 })),
        followUpActions: [
          { label: 'Go to Maintenance Requests', category: 'Maintenance Request' as DashboardLogbookCategory, searchTerm: equipment },
          { label: 'Go to ESO / Events', category: 'ESO' as DashboardLogbookCategory, searchTerm: targetLabel },
          { label: 'Go to All Logbook', category: 'All' as DashboardLogbookCategory, searchTerm: targetLabel },
        ],
      },
      ...(isConveyor || isAssembly || isZone ? [{
        id: 'maintenance-next',
        label: 'What should maintenance do next?',
        prompt: 'What should maintenance do next?',
        response: maintenanceResponse,
        responseCards: maintenanceCards,
        followUpActions: [
          { label: 'Go to Maintenance Requests', category: 'Maintenance Request' as DashboardLogbookCategory, searchTerm: equipment },
          { label: 'Go to Work Orders', category: 'Maintenance Work Order' as DashboardLogbookCategory, searchTerm: equipment },
          { label: 'Go to All Logbook', category: 'All' as DashboardLogbookCategory, searchTerm: targetLabel },
        ],
      }] : []),
      {
        id: 'performance-risk',
        label: isConveyor ? 'Check conveyor impact on OEE' : 'Explain OEE and output risk',
        prompt: isConveyor ? 'Check conveyor impact on OEE' : 'Explain the OEE and output risk',
        response: performanceResponse,
        responseCards: metrics.slice(0, 5).map((metric, index) => ({
          id: `performance-${index + 1}`,
          title: metric.label,
          signal: 'Performance signal',
          detail: `${metric.value}${metric.helper ? ` • ${metric.helper}` : ''}`,
          rank: index + 1,
          dueDate: 'Current shift',
          assignedTo: targetLabel,
          priority: metric.tone === '#EF4444' ? 'Watch' : 'Live',
          accent: metric.tone ?? '#2F6BFF',
        })),
        followUpActions: [
          { label: 'Go to All Logbook', category: 'All' as DashboardLogbookCategory, searchTerm: targetLabel },
        ],
      },
      {
        id: 'eso-safety',
        label: 'Check ESO / safety signals',
        prompt: 'Review the ESO and safety context',
        response: esoResponse,
        responseCards: esoCards,
        followUpActions: [
          { label: 'Go to ESO / Events', category: 'ESO' as DashboardLogbookCategory, searchTerm: targetLabel },
          { label: 'Go to All Logbook', category: 'All' as DashboardLogbookCategory, searchTerm: targetLabel },
        ],
      },
    ];

    return {
      title: targetLabel,
      subtitle: `I am looking at ${targetLabel} at ${scopeName[scopeLevel]} level. ${isAttention ? 'There is at least one signal that may need action.' : 'The context is being monitored live.'}`,
      accent,
      insights: [
        {
          title: latestEvent ? `Latest event: ${latestEvent.category}` : 'Latest shift activity',
          detail: latestEvent ? `${latestEvent.age}: ${latestEvent.title}` : `${targetLabel} has live operational changes in the current shift.`,
          tone: latestEvent?.tone ?? accent,
        },
        {
          title: primaryRow ? primaryRow.label : 'Open work',
          detail: primaryRow ? primaryRow.detail : 'No blocking record is linked, but BLU.AI is watching live changes.',
          tone: primaryRow?.tone ?? accent,
        },
        {
          title: isAttention ? 'Needs attention' : 'Operating context',
          detail: metricSummary || `Current order ${context.order ?? 'active order'} with ${context.batch ?? 'current batch'}.`,
          tone: isAttention ? '#EF4444' : '#22C55E',
        },
      ],
      suggestions,
    };
  }, [dashboardContext.recommendation]);

  const openBluAiAssistantForHover = React.useCallback((targetLabel: string, context: NonNullable<typeof hoverDashboardContext>) => {
    const target = drillConfig.targets.find((item) => item.label === targetLabel);
    const scopeLevel = target?.next ?? dashboardDrillLevel;
    const nextContext = buildBluAiAssistantContext(targetLabel, context, scopeLevel);
    const scopeLabel = drillLevelConfig[scopeLevel].activeLabel.toLowerCase();
    onOpenAiAssistant?.({
      contextTitle: nextContext.title,
      contextSubtitle: nextContext.subtitle,
      problemFilter: context.badge,
      openingText: `Hello. I am reviewing ${nextContext.title} in the current ${scopeLabel} context.\n\nI can brief the right owner for this level, show OEE loss events, review linked work orders and maintenance requests, explain performance risk, and check ESO/safety signals.`,
      quickActions: nextContext.suggestions.map(({ label, prompt, response, responseCards, followUpActions }) => ({ label, prompt, response, responseCards, followUpActions })),
    });
  }, [buildBluAiAssistantContext, dashboardDrillLevel, drillConfig.targets, onOpenAiAssistant]);
  const dashboardAiNarrative = React.useMemo(() => {
    const scopeLabel = selectedDashboardLabel || dashboardContext.overviewTitle;
    const productionContext: Record<DrillLevel, {
      order: string;
      product: string;
      batch: string;
      takt: string;
      bottleneck: string;
      oee: string;
      scrap: string;
      wip: string;
      note: string;
    }> = {
      plant: {
        order: 'PO-55292 / PO-55318 / PO-55344',
        product: 'mixed syringe and glamp families',
        batch: 'multi-line campaign',
        takt: 'plant cadence holding at 92% of plan',
        bottleneck: 'Area A is consuming the most handover attention',
        oee: '72%',
        scrap: '2.8%',
        wip: 'buffer is sufficient for 42 minutes',
        note: 'prioritize the assembly stream before warehouse escalation becomes production-limiting',
      },
      area: {
        order: 'PO-55292',
        product: 'FG-GLAMP-42 syringe assembly kit',
        batch: 'B-55292-A',
        takt: 'Unit A is pacing 9% below the area plan',
        bottleneck: 'Unit A conveyor vibration is slowing downstream handoff',
        oee: '70%',
        scrap: '3.4%',
        wip: 'buffer trending down but not depleted',
        note: 'keep Unit B and Unit C running as buffer protection while maintenance owns Unit A vibration',
      },
      unit: {
        order: 'PO-55292',
        product: 'FG-GLAMP-42 syringe assembly kit',
        batch: 'B-55292-A10',
        takt: 'Line 10 is pacing 14% below unit plan',
        bottleneck: 'Line 10 is the unit constraint',
        oee: '68%',
        scrap: '4.1%',
        wip: 'WIP buffer is below target for next 30 minutes',
        note: 'rebalance operators only after Line 10 stabilizes, otherwise the unit will keep starving Zone 01',
      },
      line: {
        order: 'PO-55292',
        product: 'FG-GLAMP-42 syringe assembly kit',
        batch: 'B-55292-L10',
        takt: 'line speed is capped during recovery',
        bottleneck: 'Zone 01 bearing train is driving most downtime',
        oee: '68%',
        scrap: '4.7%',
        wip: 'downstream buffer can absorb about 18 minutes',
        note: 'hold the speed increase until Zone 01 restart verification is complete',
      },
      zone: {
        order: 'PO-55292',
        product: 'FG-GLAMP-42 sterile syringe set',
        batch: 'B-55292-Z01',
        takt: 'zone throughput is 21% under current-hour plan',
        bottleneck: 'Syringe Assembly bearing replacement is blocking the cell',
        oee: '61%',
        scrap: '5.6%',
        wip: 'output tray WIP is low and feeder bowl is loaded',
        note: 'finish WO-55292-BRG, verify LOTO, then restart with vision inspection sampling before full release',
      },
      machine: {
        order: 'WO-linked PO-55292',
        product: 'FG-GLAMP-42 syringe subassembly',
        batch: 'B-55292-EQ05',
        takt: 'equipment is in constrained restart mode',
        bottleneck: 'bearing assembly and HMI restart permissive are the blockers',
        oee: 'recovering from 61%',
        scrap: 'watch first-pass rejects after restart',
        wip: 'output tray waiting for QA restart sample',
        note: 'complete bearing checklist and attach restart evidence before clearing the handover risk',
      },
    };

    const context = productionContext[dashboardDrillLevel];
    return `${scopeLabel}: current production order ${context.order}, running ${context.product} (${context.batch}). ${context.takt}; bottleneck is ${context.bottleneck}. OEE is ${context.oee}, scrap index is ${context.scrap}, and ${context.wip}. BLU.AI recommendation: ${context.note}.`;
  }, [dashboardDrillLevel, selectedDashboardLabel]);
  const dashboardAiCards = React.useMemo(() => {
    const cardsByLevel: Record<DrillLevel, Array<{ label: string; value: string; helper: string; tone: string }>> = {
      plant: [
        { label: 'Production Orders', value: '3 active', helper: 'PO-55292 leading', tone: '#173A8F' },
        { label: 'Manufacturing', value: 'Mixed syringe families', helper: 'Assembly + warehouse flow', tone: '#0EA5E9' },
        { label: 'Process Watch', value: 'Area A', helper: 'handover hotspot', tone: '#F97316' },
      ],
      area: [
        { label: 'Production Order', value: 'PO-55292', helper: 'FG-GLAMP-42', tone: '#173A8F' },
        { label: 'Bottleneck', value: 'Unit A', helper: 'conveyor vibration', tone: '#EF4444' },
        { label: 'Quality Signal', value: 'Scrap 3.4%', helper: 'watch first pass yield', tone: '#F97316' },
      ],
      unit: [
        { label: 'Product', value: 'FG-GLAMP-42', helper: 'batch B-55292-A10', tone: '#173A8F' },
        { label: 'Constraint', value: 'Line 10', helper: 'WIP buffer dropping', tone: '#EF4444' },
        { label: 'Performance', value: 'OEE 68%', helper: 'speed capped', tone: '#2563EB' },
      ],
      line: [
        { label: 'Production Order', value: 'PO-55292', helper: 'Line 10 recovery', tone: '#173A8F' },
        { label: 'Bottleneck', value: 'Zone 01', helper: 'bearing train', tone: '#EF4444' },
        { label: 'Scrap Index', value: '4.7%', helper: 'post-adjustment watch', tone: '#F97316' },
      ],
      zone: [
        { label: 'Manufacturing', value: 'FG-GLAMP-42', helper: 'sterile syringe set', tone: '#173A8F' },
        { label: 'Blocking WO', value: 'WO-55292-BRG', helper: 'bearing replacement', tone: '#EF4444' },
        { label: 'Restart Gate', value: 'Vision + LOTO', helper: 'before full release', tone: '#7C3AED' },
      ],
      machine: [
        { label: 'Equipment State', value: 'Constrained', helper: 'restart permissive', tone: '#EF4444' },
        { label: 'SAP Work Order', value: 'WO-55292-BRG', helper: 'maintenance owner', tone: '#0B5CAB' },
        { label: 'QA Gate', value: 'Sample tray', helper: 'first-run inspection', tone: '#2563EB' },
      ],
    };

    return cardsByLevel[dashboardDrillLevel];
  }, [dashboardDrillLevel]);

  React.useEffect(() => {
    if (!isEquipmentFocusAvailable) {
      setIsEquipmentFocusMode(false);
    }
  }, [isEquipmentFocusAvailable]);

  const isWorkOrderLogbookView = effectiveCategory === 'Maintenance Work Order';
  const isMaintenanceRequestLogbookView = effectiveCategory === 'Maintenance Request';
  const logbookListBaseEntries = React.useMemo(() => {
    if (isWorkOrderLogbookView) {
      return logbookFollowUpEntries.filter((entry) => entry.category === 'Maintenance Work Order');
    }
    if (isMaintenanceRequestLogbookView) {
      return logbookMaintenanceRequestEntries;
    }
    return allShiftLogbookEntries.filter((entry) => effectiveCategory === 'All' || entry.category === effectiveCategory);
  }, [allShiftLogbookEntries, effectiveCategory, isMaintenanceRequestLogbookView, isWorkOrderLogbookView]);

  const typeFilterValueForEntry = React.useCallback((entry: ShiftLogbookEntry) => {
    if (effectiveCategory === 'All') return entry.category;
    return getLogbookWorkOrderContext(entry)?.type ?? entry.ticketType;
  }, [effectiveCategory]);

  const activeLogbookFilterKeys = React.useMemo(() => {
    if (effectiveCategory === 'All') return ['type', 'assignee', 'shift', 'area'];
    if (effectiveCategory === 'Maintenance Work Order') return ['type', 'status', 'assignee', 'area'];
    if (effectiveCategory === 'CIL / Centerline') return ['type', 'status', 'assignee', 'shift', 'area'];
    if (effectiveCategory === 'Performance Output' || effectiveCategory === 'Scrap') return ['status', 'assignee', 'shift', 'area'];
    if (effectiveCategory === 'Quality' || effectiveCategory === 'Scrap') return ['riskLevel', 'status', 'shift', 'area'];
    if (effectiveCategory === 'ESO') return ['riskLevel', 'assignee', 'shift', 'area'];
    return ['status', 'assignee', 'shift', 'area'];
  }, [effectiveCategory]);
  const isLogbookFilterActive = React.useCallback(
    (key: string) => activeLogbookFilterKeys.includes(key),
    [activeLogbookFilterKeys],
  );
  const selectedTypeFilter = isLogbookFilterActive('type') ? shiftLogbookFilters.type ?? 'All' : 'All';
  const selectedAssigneeFilter = isLogbookFilterActive('assignee') ? shiftLogbookFilters.assignee ?? 'All' : 'All';
  const selectedAreaFilter = isLogbookFilterActive('area') ? shiftLogbookFilters.area ?? shiftLogbookFilters.zone ?? 'All' : 'All';
  const selectedStatusFilter = isLogbookFilterActive('status') ? shiftLogbookFilters.status ?? 'All' : 'All';
  const selectedRiskFilter = isLogbookFilterActive('riskLevel') ? shiftLogbookFilters.riskLevel ?? 'All' : 'All';
  const selectedShiftFilter = isLogbookFilterActive('shift') ? shiftLogbookFilters.shift ?? 'All' : 'All';
  const selectedDateScopeFilter = isLogbookFilterActive('dateRange') ? shiftLogbookFilters.dateRange ?? 'All' : 'All';

  const matchesLogbookFilters = React.useCallback((entry: ShiftLogbookEntry) => {
    const search = shiftLogbookSearch.trim().toLowerCase();
    const context = getLogbookWorkOrderContext(entry);
    const matchesBaseSearch = !search
      || entry.title.toLowerCase().includes(search)
      || entry.reporter.toLowerCase().includes(search)
      || entry.id.toLowerCase().includes(search)
      || entry.line.toLowerCase().includes(search)
      || entry.zone.toLowerCase().includes(search)
      || entry.category.toLowerCase().includes(search)
      || entry.ticketType.toLowerCase().includes(search);
    const matchesContextSearch = context
      ? context.workOrderId.toLowerCase().includes(search)
        || context.followUpStatus.toLowerCase().includes(search)
        || context.type.toLowerCase().includes(search)
        || context.equipment.toLowerCase().includes(search)
      : false;
    const matchesSearch = !search || matchesBaseSearch || matchesContextSearch;
    const matchesType = selectedTypeFilter === 'All' || typeFilterValueForEntry(entry) === selectedTypeFilter;
    const matchesAssignee = selectedAssigneeFilter === 'All' || entry.reporter === selectedAssigneeFilter;
    const matchesArea = selectedAreaFilter === 'All' || entry.line === selectedAreaFilter || entry.zone === selectedAreaFilter;
    const matchesStatus = selectedStatusFilter === 'All' || entry.status === selectedStatusFilter || context?.followUpStatus === selectedStatusFilter;
    const matchesRisk = selectedRiskFilter === 'All' || entry.riskLevel === selectedRiskFilter;
    const matchesShift = selectedShiftFilter === 'All' || entry.shift === selectedShiftFilter;
    const matchesDateScope = selectedDateScopeFilter === 'All' || entry.dateScope === selectedDateScopeFilter;
    return matchesSearch && matchesType && matchesAssignee && matchesArea && matchesStatus && matchesRisk && matchesShift && matchesDateScope;
  }, [
    selectedAreaFilter,
    selectedAssigneeFilter,
    selectedDateScopeFilter,
    selectedRiskFilter,
    selectedShiftFilter,
    selectedStatusFilter,
    selectedTypeFilter,
    shiftLogbookSearch,
    typeFilterValueForEntry,
  ]);

  const filteredEntries = allShiftLogbookEntries.filter((entry) => {
    const matchesCategory = effectiveCategory === 'All' || entry.category === effectiveCategory;
    return matchesCategory && matchesLogbookFilters(entry);
  });
  const visibleLogbookEntries = logbookListBaseEntries.filter(matchesLogbookFilters);

  const matchesStaticLogbookTableFilters = React.useCallback((values: {
    searchable: string[];
    line: string;
    area: string;
    shift: string;
    status: string;
    owner: string;
    type?: string;
  }) => {
    const search = shiftLogbookSearch.trim().toLowerCase();
    const matchesSearch = !search || values.searchable.some((value) => value.toLowerCase().includes(search));
    const matchesType = selectedTypeFilter === 'All' || values.type === selectedTypeFilter;
    const matchesOwner = selectedAssigneeFilter === 'All' || values.owner === selectedAssigneeFilter;
    const matchesArea = selectedAreaFilter === 'All' || values.line === selectedAreaFilter || values.area === selectedAreaFilter;
    const matchesStatus = selectedStatusFilter === 'All' || values.status === selectedStatusFilter;
    const matchesShift = selectedShiftFilter === 'All' || values.shift === selectedShiftFilter;
    return matchesSearch && matchesType && matchesOwner && matchesArea && matchesStatus && matchesShift;
  }, [selectedAreaFilter, selectedAssigneeFilter, selectedShiftFilter, selectedStatusFilter, selectedTypeFilter, shiftLogbookSearch]);

  const visibleHourlyOutputRows = logbookHourlyOutputRows.filter((row) => matchesStaticLogbookTableFilters({
    searchable: [row.hour, row.line, row.area, row.shift, row.status, row.owner, row.constraint],
    line: row.line,
    area: row.area,
    shift: row.shift,
    status: row.status,
    owner: row.owner,
  }));
  const visibleHourlyScrapRows = logbookHourlyScrapRows.filter((row) => matchesStaticLogbookTableFilters({
    searchable: [row.hour, row.line, row.area, row.shift, row.status, row.owner, row.reason],
    line: row.line,
    area: row.area,
    shift: row.shift,
    status: row.status,
    owner: row.owner,
  }));
  const visibleCilCenterlineRows = logbookCilCenterlineRows.filter((row) => matchesStaticLogbookTableFilters({
    searchable: [row.id, row.type, row.task, row.equipment, row.line, row.area, row.shift, row.status, row.owner],
    line: row.line,
    area: row.area,
    shift: row.shift,
    status: row.status,
    owner: row.owner,
    type: row.type,
  }));

  const logbookFilterOptions = React.useMemo(() => {
    const unique = (values: Array<string | undefined>) => Array.from(new Set(values.filter(Boolean) as string[]))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
    if (effectiveCategory === 'Performance Output') {
      return {
        type: [],
        assignee: unique(logbookHourlyOutputRows.map((row) => row.owner)),
        area: unique(logbookHourlyOutputRows.flatMap((row) => [row.line, row.area])),
        shift: unique(logbookHourlyOutputRows.map((row) => row.shift)),
        status: unique(logbookHourlyOutputRows.map((row) => row.status)),
        riskLevel: [],
        dateRange: [],
      };
    }
    if (effectiveCategory === 'Scrap') {
      return {
        type: [],
        assignee: unique(logbookHourlyScrapRows.map((row) => row.owner)),
        area: unique(logbookHourlyScrapRows.flatMap((row) => [row.line, row.area])),
        shift: unique(logbookHourlyScrapRows.map((row) => row.shift)),
        status: unique(logbookHourlyScrapRows.map((row) => row.status)),
        riskLevel: [],
        dateRange: [],
      };
    }
    if (effectiveCategory === 'CIL / Centerline') {
      return {
        type: unique(logbookCilCenterlineRows.map((row) => row.type)),
        assignee: unique(logbookCilCenterlineRows.map((row) => row.owner)),
        area: unique(logbookCilCenterlineRows.flatMap((row) => [row.line, row.area])),
        shift: unique(logbookCilCenterlineRows.map((row) => row.shift)),
        status: unique(logbookCilCenterlineRows.map((row) => row.status)),
        riskLevel: [],
        dateRange: [],
      };
    }
    return {
      type: unique(logbookListBaseEntries.map((entry) => typeFilterValueForEntry(entry))),
      assignee: unique(logbookListBaseEntries.map((entry) => entry.reporter)),
      area: unique(logbookListBaseEntries.flatMap((entry) => [entry.line, entry.zone])),
      shift: unique(logbookListBaseEntries.map((entry) => entry.shift)),
      status: unique(logbookListBaseEntries.flatMap((entry) => [entry.status, getLogbookWorkOrderContext(entry)?.followUpStatus])),
      riskLevel: unique(logbookListBaseEntries.map((entry) => entry.riskLevel)),
      dateRange: unique(logbookListBaseEntries.map((entry) => entry.dateScope)),
    };
  }, [effectiveCategory, logbookListBaseEntries, typeFilterValueForEntry]);

  const logbookFilterConfigs = React.useMemo(() => {
    const sourceLabel = effectiveCategory === 'OEE' || effectiveCategory === 'Performance Output' ? 'Source' : 'Assignee';
    const configsByCategory: Record<string, Array<{ key: 'type' | 'assignee' | 'shift' | 'area' | 'status' | 'riskLevel' | 'dateRange'; label: string; allLabel: string; options: string[] }>> = {
      All: [
        { key: 'type', label: 'Type', allLabel: 'All types', options: logbookFilterOptions.type },
        { key: 'assignee', label: 'Assignee', allLabel: 'All owners', options: logbookFilterOptions.assignee },
        { key: 'shift', label: 'Shift', allLabel: 'All shifts', options: logbookFilterOptions.shift },
        { key: 'area', label: 'Area', allLabel: 'All areas', options: logbookFilterOptions.area },
      ],
      'Maintenance Request': [
        { key: 'status', label: 'Status', allLabel: 'All status', options: logbookFilterOptions.status },
        { key: 'assignee', label: 'Assignee', allLabel: 'All owners', options: logbookFilterOptions.assignee },
        { key: 'shift', label: 'Shift', allLabel: 'All shifts', options: logbookFilterOptions.shift },
        { key: 'area', label: 'Area', allLabel: 'All areas', options: logbookFilterOptions.area },
      ],
      'Maintenance Work Order': [
        { key: 'type', label: 'Work type', allLabel: 'All work', options: logbookFilterOptions.type },
        { key: 'status', label: 'Status', allLabel: 'All status', options: logbookFilterOptions.status },
        { key: 'assignee', label: 'Assignee', allLabel: 'All owners', options: logbookFilterOptions.assignee },
        { key: 'area', label: 'Area', allLabel: 'All areas', options: logbookFilterOptions.area },
      ],
      Quality: [
        { key: 'riskLevel', label: 'Severity', allLabel: 'All severity', options: logbookFilterOptions.riskLevel },
        { key: 'status', label: 'Status', allLabel: 'All status', options: logbookFilterOptions.status },
        { key: 'shift', label: 'Shift', allLabel: 'All shifts', options: logbookFilterOptions.shift },
        { key: 'area', label: 'Area', allLabel: 'All areas', options: logbookFilterOptions.area },
      ],
      'Performance Output': [
        { key: 'status', label: 'Status', allLabel: 'All status', options: logbookFilterOptions.status },
        { key: 'assignee', label: 'Owner', allLabel: 'All owners', options: logbookFilterOptions.assignee },
        { key: 'shift', label: 'Shift', allLabel: 'All shifts', options: logbookFilterOptions.shift },
        { key: 'area', label: 'Area', allLabel: 'All areas', options: logbookFilterOptions.area },
      ],
      Scrap: [
        { key: 'status', label: 'Status', allLabel: 'All status', options: logbookFilterOptions.status },
        { key: 'assignee', label: 'Owner', allLabel: 'All owners', options: logbookFilterOptions.assignee },
        { key: 'shift', label: 'Shift', allLabel: 'All shifts', options: logbookFilterOptions.shift },
        { key: 'area', label: 'Area', allLabel: 'All areas', options: logbookFilterOptions.area },
      ],
      'CIL / Centerline': [
        { key: 'type', label: 'Type', allLabel: 'All routines', options: logbookFilterOptions.type },
        { key: 'status', label: 'Status', allLabel: 'All status', options: logbookFilterOptions.status },
        { key: 'assignee', label: 'Owner', allLabel: 'All owners', options: logbookFilterOptions.assignee },
        { key: 'shift', label: 'Shift', allLabel: 'All shifts', options: logbookFilterOptions.shift },
        { key: 'area', label: 'Area', allLabel: 'All areas', options: logbookFilterOptions.area },
      ],
      ESO: [
        { key: 'riskLevel', label: 'Severity', allLabel: 'All severity', options: logbookFilterOptions.riskLevel },
        { key: 'assignee', label: 'Owner', allLabel: 'All owners', options: logbookFilterOptions.assignee },
        { key: 'shift', label: 'Shift', allLabel: 'All shifts', options: logbookFilterOptions.shift },
        { key: 'area', label: 'Area', allLabel: 'All areas', options: logbookFilterOptions.area },
      ],
      'Shift Notes': [
        { key: 'assignee', label: 'Reporter', allLabel: 'All reporters', options: logbookFilterOptions.assignee },
        { key: 'shift', label: 'Shift', allLabel: 'All shifts', options: logbookFilterOptions.shift },
        { key: 'area', label: 'Area', allLabel: 'All areas', options: logbookFilterOptions.area },
        { key: 'status', label: 'Status', allLabel: 'All status', options: logbookFilterOptions.status },
      ],
    };
    return configsByCategory[effectiveCategory] ?? [
      { key: 'status', label: 'Status', allLabel: 'All status', options: logbookFilterOptions.status },
      { key: 'assignee', label: sourceLabel, allLabel: sourceLabel === 'Source' ? 'All sources' : 'All owners', options: logbookFilterOptions.assignee },
      { key: 'shift', label: 'Shift', allLabel: 'All shifts', options: logbookFilterOptions.shift },
      { key: 'area', label: 'Area', allLabel: 'All areas', options: logbookFilterOptions.area },
    ];
  }, [effectiveCategory, logbookFilterOptions]);

  const selectedMetrics = lineMetricsByCategory[effectiveCategory] ?? lineMetricsByCategory.All;
  const metricProduced = selectedMetrics.produced;
  const metricScrapRate = selectedMetrics.scrapRate;
  const metricDowntime = selectedMetrics.downtime;
  const hourlyOutputTarget = visibleHourlyOutputRows.reduce((sum, row) => sum + row.target, 0);
  const hourlyOutputProduced = visibleHourlyOutputRows.reduce((sum, row) => sum + row.produced, 0);
  const hourlyOutputVariance = hourlyOutputProduced - hourlyOutputTarget;
  const hourlyOutputAttainment = hourlyOutputTarget ? Math.round((hourlyOutputProduced / hourlyOutputTarget) * 100) : 0;
  const hourlyOutputAtRisk = visibleHourlyOutputRows.filter((row) => row.status === 'At Risk').length;
  const hourlyOutputRecovering = visibleHourlyOutputRows.filter((row) => row.status === 'Recovering').length;
  const hourlyScrapProduced = visibleHourlyScrapRows.reduce((sum, row) => sum + row.produced, 0);
  const hourlyScrapTotal = visibleHourlyScrapRows.reduce((sum, row) => sum + row.scrap, 0);
  const hourlyScrapRate = hourlyScrapProduced ? ((hourlyScrapTotal / hourlyScrapProduced) * 100).toFixed(1) : '0.0';
  const hourlyScrapOpen = visibleHourlyScrapRows.filter((row) => row.status !== 'Contained').length;
  const cilDone = visibleCilCenterlineRows.filter((row) => row.status === 'Completed').length;
  const cilPending = Math.max(visibleCilCenterlineRows.length - cilDone, 0);
  const cilCenterlineCount = visibleCilCenterlineRows.filter((row) => row.type === 'CL').length;
  const cilCompletionRate = visibleCilCenterlineRows.length ? Math.round((cilDone / visibleCilCenterlineRows.length) * 100) : 0;

  const entriesForMetrics = effectiveCategory === 'All'
    ? filteredEntries
    : visibleLogbookEntries;
  const selectedCellMeta = plantCells.find((cell) => cell.label === selectedCell);
  const hoveredCellMeta = plantCells.find((cell) => cell.label === hoveredCell);
  const shouldScopeMetricsToSelectedCell = shiftLogbookCategory === 'Dashboard' && selectedCell !== 'All Lines';
  const scopedEntries = !shouldScopeMetricsToSelectedCell
    ? entriesForMetrics
    : entriesForMetrics.filter((entry) => entry.line === selectedCellMeta?.line || entry.zone === selectedCellMeta?.zone);
  const metricNc = scopedEntries.filter((entry) => entry.category === 'Quality' || entry.ticketType === 'Non-Conformance').length;
  const metricIncident = scopedEntries.filter((entry) => entry.ticketType === 'Safety' || entry.ticketType === 'Production' || entry.ticketType === 'Complaint').length;
  const metricEso = scopedEntries.filter((entry) => entry.category === 'ESO').length;
  const totalOpen = scopedEntries.filter((entry) => entry.status === 'Open').length;
  const totalInProgress = scopedEntries.filter((entry) => entry.status === 'In Progress').length;
  const highRisk = scopedEntries.filter((entry) => entry.riskLevel === 'High').length;
  const mediumRisk = scopedEntries.filter((entry) => entry.riskLevel === 'Medium').length;
  const metricClosed = scopedEntries.filter((entry) => entry.status === 'Closed').length;
  const metricOpenItems = scopedEntries.filter((entry) => entry.status !== 'Closed').length;
  const metricScopeLabel = effectiveCategory === 'All' ? 'All logbook' : effectiveCategory;
  const metricPrimaryLabel = effectiveCategory === 'Maintenance Work Order'
    ? 'Work Orders'
    : effectiveCategory === 'Maintenance Request'
      ? 'Requests'
      : effectiveCategory === 'Performance Output'
        ? 'OEE Events'
        : effectiveCategory;
  const metricFocusCount = effectiveCategory === 'All' ? scopedEntries.length : scopedEntries.filter((entry) => entry.category === effectiveCategory).length;
  const metricRiskLabel = highRisk > 0 ? 'Needs action' : metricOpenItems > 0 ? 'Watch' : 'Stable';
  const containmentRate = scopedEntries.length ? Math.round((scopedEntries.filter((entry) => entry.status === 'Closed').length / scopedEntries.length) * 100) : 0;
  const riskIndex = Math.min(100, highRisk * 9 + totalInProgress * 4);
  const meanResponseMinutes = Math.max(12, 44 - totalOpen * 2);
  const metricUniqueOwners = new Set(scopedEntries.map((entry) => entry.reporter)).size;
  const metricAffectedLines = new Set(scopedEntries.map((entry) => entry.line)).size;
  const metricAiCreated = scopedEntries.filter((entry) => entry.reporterType === 'AI').length;
  const metricHumanCreated = scopedEntries.filter((entry) => entry.reporterType === 'Human').length;
  const metricEquipmentCreated = scopedEntries.filter((entry) => entry.reporterType === 'Equipment').length;
  const metricCurrentShift = scopedEntries.filter((entry) => entry.dateScope === 'Current Shift').length;
  const metricCarryOver = scopedEntries.filter((entry) => entry.dateScope === 'Last Shift').length;
  const workOrderMetricContexts = scopedEntries.map(getLogbookWorkOrderContext).filter(Boolean) as LogbookWorkOrderContext[];
  const workOrdersAwaitingParts = workOrderMetricContexts.filter((context) => context.parts === 'Awaiting Parts' || context.parts === 'Parts Required').length;
  const workOrdersScheduled = workOrderMetricContexts.filter((context) => context.followUpStatus === 'Scheduled' || context.followUpStatus === 'Planning').length;
  const maintenanceRequestWoCandidates = scopedEntries.filter((entry) => {
    const title = entry.title.toLowerCase();
    return entry.status !== 'Closed'
      && (
        entry.riskLevel === 'High'
        || entry.reporterType === 'AI'
        || title.includes('conveyor')
        || title.includes('press')
        || title.includes('mixer')
        || title.includes('cooling')
        || title.includes('oven')
        || title.includes('robot')
        || title.includes('machine')
        || title.includes('packaging')
      );
  }).length;
  const metricRatio = (value: number, total: number) => total ? Math.round((value / total) * 100) : 0;
  const countMetricEntries = (predicate: (entry: ShiftLogbookEntry) => boolean) => scopedEntries.filter(predicate).length;
  const inferEsoType = (entry: ShiftLogbookEntry): 'BBS' | 'Condition Report' | 'Near Miss' => {
    const title = entry.title.toLowerCase();
    if (title.includes('checklist') || title.includes('behavior') || title.includes('observation')) return 'BBS';
    if (title.includes('minor') || title.includes('near miss') || title.includes('almost')) return 'Near Miss';
    return 'Condition Report';
  };
  const metricPanel = (() => {
    const total = scopedEntries.length;
    const toneStyles = {
      brand: { color: tokenBrand.main, bg: tokenBrand.softBg },
      error: { color: tokenError.main, bg: tokenError.softBg },
      warning: { color: tokenWarning.dark, bg: tokenWarning.softBg },
      success: { color: tokenSuccess.darker, bg: tokenSuccess.softBg },
      info: { color: tokenInfo.dark, bg: tokenInfo.softBg },
    };
    const primary = (label: string, value: number | string, helper: string, tone: keyof typeof toneStyles = 'brand') => ({
      label,
      value,
      helper,
      color: toneStyles[tone].color,
      bg: toneStyles[tone].bg,
    });
    const compact = (label: string, value: number | string, color: string) => ({ label, value, color });
    const footer = (label: string, value: number | string) => ({ label, value });
    const breakdown = (label: string, value: number, color: string, bg: string) => ({ label, value, color, bg });
    const base = {
      title: 'Logbook pulse',
      caption: 'All active workstreams',
      primary: [primary('Total logs', total, 'all workstreams'), primary('Needs attention', metricOpenItems, `${highRisk} high risk`, 'error')],
      compact: [compact('Open', totalOpen, tokenError.main), compact('In progress', totalInProgress, tokenWarning.dark), compact('Closed', metricClosed, tokenSuccess.darker)],
      progress: { label: 'SHIFT CLOSURE', value: metricRatio(metricClosed, total), displayValue: `${metricRatio(metricClosed, total)}%`, color: tokenBrand.main },
      footer: [footer('ACTIVE OWNERS', metricUniqueOwners), footer('WORKSTREAMS', new Set(scopedEntries.map((entry) => entry.category)).size)],
      breakdownLabel: 'WORKSTREAM MIX',
      breakdown: [
        breakdown('Maintenance', countMetricEntries((entry) => entry.category === 'Maintenance Request' || entry.category === 'Maintenance Work Order'), tokenBrand.main, tokenBrand.softBg),
        breakdown('OEE / Output', countMetricEntries((entry) => entry.category === 'OEE' || entry.category === 'Performance Output'), tokenInfo.dark, tokenInfo.softBg),
        breakdown('Quality / Scrap', countMetricEntries((entry) => entry.category === 'Quality' || entry.category === 'Scrap'), tokenWarning.dark, tokenWarning.softBg),
        breakdown('ESO', countMetricEntries((entry) => entry.category === 'ESO'), tokenError.main, tokenError.softBg),
        breakdown('Shift Notes', countMetricEntries((entry) => entry.category === 'Shift Notes'), tokenSuccess.darker, tokenSuccess.softBg),
        breakdown('RCA', countMetricEntries((entry) => entry.category === 'RCA'), tokenBrand.dark, tokenBrand.softBg),
      ],
    };

    switch (effectiveCategory) {
      case 'Maintenance Request':
        return {
          title: 'Request triage',
          caption: 'Intake, priority and conversion',
          primary: [
            primary('Open requests', metricOpenItems, `${metricUniqueOwners} owners / ${metricAffectedLines} lines`),
            primary('WO candidates', maintenanceRequestWoCandidates, `${highRisk} high priority`, maintenanceRequestWoCandidates > 0 ? 'warning' : 'success'),
          ],
          compact: [
            compact('Awaiting triage', totalOpen, tokenError.main),
            compact('AI raised', metricAiCreated, tokenBrand.main),
            compact('Equipment-origin', metricEquipmentCreated, tokenWarning.dark),
          ],
          progress: { label: 'PRIORITY PRESSURE', value: metricRatio(highRisk + mediumRisk, total), displayValue: `${highRisk + mediumRisk}/${total}`, color: highRisk > 0 ? tokenError.main : tokenBrand.main },
          footer: [footer('AVG. RESPONSE', `${meanResponseMinutes} min`), footer('REQUEST OWNERS', metricUniqueOwners)],
          breakdownLabel: 'REQUEST INTAKE',
          breakdown: [
            breakdown('Operator', metricHumanCreated, tokenBrand.main, tokenBrand.softBg),
            breakdown('BLU.AI', metricAiCreated, tokenInfo.dark, tokenInfo.softBg),
            breakdown('Equipment', metricEquipmentCreated, tokenWarning.dark, tokenWarning.softBg),
          ],
        };
      case 'Maintenance Work Order':
        return {
          title: 'WO execution',
          caption: 'Plan, parts and closure readiness',
          primary: [primary('Work orders', total, 'in execution scope'), primary('Blocked / parts', workOrdersAwaitingParts, `${workOrdersScheduled} planned`, workOrdersAwaitingParts > 0 ? 'warning' : 'success')],
          compact: [compact('Completed', metricClosed, tokenSuccess.darker), compact('Awaiting parts', workOrdersAwaitingParts, tokenWarning.dark), compact('High priority', highRisk, tokenError.main)],
          progress: { label: 'EXECUTION COMPLETION', value: metricRatio(metricClosed, total), displayValue: `${metricRatio(metricClosed, total)}%`, color: tokenBrand.main },
          footer: [footer('EQUIPMENT / LINES', metricAffectedLines), footer('ASSIGNED OWNERS', metricUniqueOwners)],
          breakdownLabel: 'EXECUTION STAGE',
          breakdown: [
            breakdown('Planning', workOrderMetricContexts.filter((context) => context.followUpStatus === 'Planning').length, tokenBrand.main, tokenBrand.softBg),
            breakdown('Scheduled', workOrderMetricContexts.filter((context) => context.followUpStatus === 'Scheduled').length, tokenInfo.dark, tokenInfo.softBg),
            breakdown('In Progress', workOrderMetricContexts.filter((context) => context.followUpStatus === 'In Progress').length, tokenWarning.dark, tokenWarning.softBg),
            breakdown('Done / Closed', workOrderMetricContexts.filter((context) => context.followUpStatus === 'Done' || context.followUpStatus === 'Closed').length, tokenSuccess.darker, tokenSuccess.softBg),
          ],
        };
      case 'OEE':
        return {
          title: 'OEE recovery',
          caption: 'Loss, downtime and recovery',
          primary: [primary('Loss events', total, 'availability & speed'), primary('Open losses', metricOpenItems, `${totalInProgress} recovering`, 'error')],
          compact: [compact('Recovered', metricClosed, tokenSuccess.darker), compact('Critical loss', highRisk, tokenError.main), compact('Affected lines', metricAffectedLines, tokenBrand.main)],
          progress: { label: 'OEE RECOVERY', value: Math.max(0, 100 - riskIndex), displayValue: `${Math.max(0, 100 - riskIndex)}%`, color: tokenBrand.main },
          footer: [footer('DOWNTIME', `${metricDowntime} min`), footer('OUTPUT', metricProduced)],
          breakdownLabel: 'LOSS CLASSIFICATION',
          breakdown: [
            breakdown('Availability', countMetricEntries((entry) => entry.title.toLowerCase().includes('downtime') || entry.title.toLowerCase().includes('stop')), tokenError.main, tokenError.softBg),
            breakdown('Performance', countMetricEntries((entry) => entry.title.toLowerCase().includes('speed') || entry.title.toLowerCase().includes('output')), tokenWarning.dark, tokenWarning.softBg),
            breakdown('Quality loss', countMetricEntries((entry) => entry.title.toLowerCase().includes('quality') || entry.title.toLowerCase().includes('scrap')), tokenBrand.main, tokenBrand.softBg),
          ],
        };
      case 'Quality':
        return {
          title: 'Quality containment',
          caption: 'Deviation, severity and release',
          primary: [primary('Deviations', total, 'quality records'), primary('Open NCs', metricOpenItems, `${totalInProgress} contained`, 'error')],
          compact: [compact('Contained', metricClosed, tokenSuccess.darker), compact('High severity', highRisk, tokenError.main), compact('AI flagged', metricAiCreated, tokenBrand.main)],
          progress: { label: 'CONTAINMENT', value: containmentRate, displayValue: `${containmentRate}%`, color: tokenSuccess.darker },
          footer: [footer('SCRAP RATE', metricScrapRate), footer('AFFECTED LINES', metricAffectedLines)],
          breakdownLabel: 'QUALITY TYPE',
          breakdown: [
            breakdown('Non-Conformance', countMetricEntries((entry) => entry.ticketType === 'Non-Conformance'), tokenError.main, tokenError.softBg),
            breakdown('Complaint', countMetricEntries((entry) => entry.ticketType === 'Complaint'), tokenWarning.dark, tokenWarning.softBg),
            breakdown('Inspection', countMetricEntries((entry) => entry.ticketType !== 'Non-Conformance' && entry.ticketType !== 'Complaint'), tokenBrand.main, tokenBrand.softBg),
          ],
        };
      case 'Shift Notes':
        return {
          title: 'Shift notes',
          caption: 'Logged context and handover readiness',
          primary: [primary('Shift notes', total, 'handover context'), primary('Current shift', metricCurrentShift, `${metricCarryOver} carried over`, 'error')],
          compact: [compact('Carry-over', metricCarryOver, tokenWarning.dark), compact('Acknowledged', metricClosed, tokenSuccess.darker), compact('AI notes', metricAiCreated, tokenBrand.main)],
          progress: { label: 'HANDOVER READINESS', value: Math.min(100, metricRatio(metricClosed + metricCurrentShift, Math.max(total, 1))), displayValue: `${Math.min(100, metricRatio(metricClosed + metricCurrentShift, Math.max(total, 1)))}%`, color: tokenBrand.main },
          footer: [footer('REPORTERS', metricUniqueOwners), footer('AREAS COVERED', metricAffectedLines)],
          breakdownLabel: 'NOTE CONTEXT',
          breakdown: [
            breakdown('Current Shift', metricCurrentShift, tokenBrand.main, tokenBrand.softBg),
            breakdown('Carry-over', metricCarryOver, tokenWarning.dark, tokenWarning.softBg),
            breakdown('BLU.AI Notes', metricAiCreated, tokenInfo.dark, tokenInfo.softBg),
          ],
        };
      case 'ESO':
        return {
          title: 'Safety controls',
          caption: 'ESO type, risk and verification',
          primary: [primary('ESO reports', total, 'safety scope'), primary('Control gaps', metricOpenItems, `${highRisk} high risk`, metricOpenItems > 0 ? 'error' : 'success')],
          compact: [
            compact('Condition reports', countMetricEntries((entry) => inferEsoType(entry) === 'Condition Report'), tokenWarning.dark),
            compact('BBS', countMetricEntries((entry) => inferEsoType(entry) === 'BBS'), tokenBrand.main),
            compact('Near miss', countMetricEntries((entry) => inferEsoType(entry) === 'Near Miss'), tokenError.main),
          ],
          progress: { label: 'CONTROL VERIFICATION', value: metricRatio(metricClosed, total), displayValue: `${metricRatio(metricClosed, total)}%`, color: tokenSuccess.darker },
          footer: [footer('ACCOUNTABLE OWNERS', metricUniqueOwners), footer('AREAS AFFECTED', metricAffectedLines)],
          breakdownLabel: 'ESO TYPE MIX',
          breakdown: [
            breakdown('BBS', countMetricEntries((entry) => inferEsoType(entry) === 'BBS'), tokenBrand.main, tokenBrand.softBg),
            breakdown('Condition Report', countMetricEntries((entry) => inferEsoType(entry) === 'Condition Report'), tokenWarning.dark, tokenWarning.softBg),
            breakdown('Near Miss', countMetricEntries((entry) => inferEsoType(entry) === 'Near Miss'), tokenError.main, tokenError.softBg),
          ],
        };
      case 'RCA':
        {
          const rcaFishbone = countMetricEntries((entry) => entry.ticketType.toLowerCase().includes('fishbone'));
          const rcaFaultTree = countMetricEntries((entry) => entry.ticketType.toLowerCase().includes('fault tree'));
          const rcaFiveWhys = countMetricEntries((entry) => entry.ticketType.toLowerCase().includes('why')) || Math.max(0, total - rcaFishbone - rcaFaultTree);
        return {
          title: 'RCA pipeline',
          caption: 'Method, cause and action link',
          primary: [primary('Analyses', total, 'RCA records'), primary('In analysis', metricOpenItems, `${totalInProgress} active`, 'error')],
          compact: [compact('Completed', metricClosed, tokenSuccess.darker), compact('High priority', highRisk, tokenError.main), compact('AI assisted', metricAiCreated, tokenBrand.main)],
          progress: { label: 'RCA COMPLETION', value: metricRatio(metricClosed, total), displayValue: `${metricRatio(metricClosed, total)}%`, color: tokenBrand.main },
          footer: [footer('METHODS USED', new Set(scopedEntries.map((entry) => entry.ticketType)).size), footer('LINKED LINES', metricAffectedLines)],
          breakdownLabel: 'RCA METHOD',
          breakdown: [
            breakdown('5 Whys', rcaFiveWhys, tokenBrand.main, tokenBrand.softBg),
            breakdown('Fishbone', rcaFishbone, tokenWarning.dark, tokenWarning.softBg),
            breakdown('Fault Tree', rcaFaultTree, tokenError.main, tokenError.softBg),
          ],
        };
        }
      case 'CIL / Centerline':
        return {
          title: 'CIL / Centerline',
          caption: 'Routine completion and CL checks',
          primary: [primary('Due now', visibleCilCenterlineRows.length, `${cilDone} completed`), primary('Pending', cilPending, `${cilCenterlineCount} centerline`, cilPending > 0 ? 'warning' : 'success')],
          compact: [compact('Completed', cilDone, tokenSuccess.darker), compact('Scheduled', visibleCilCenterlineRows.filter((row) => row.status === 'Scheduled').length, tokenBrand.main), compact('In progress', visibleCilCenterlineRows.filter((row) => row.status === 'In Progress').length, tokenWarning.dark)],
          progress: { label: 'ROUTINE COMPLETION', value: cilCompletionRate, displayValue: `${cilCompletionRate}%`, color: tokenBrand.main },
          footer: [footer('CIL TASKS', visibleCilCenterlineRows.filter((row) => row.type === 'CIL').length), footer('CL CHECKS', cilCenterlineCount)],
          breakdownLabel: 'ROUTINE TYPE',
          breakdown: [
            breakdown('CIL', visibleCilCenterlineRows.filter((row) => row.type === 'CIL').length, tokenBrand.main, tokenBrand.softBg),
            breakdown('Centerline', cilCenterlineCount, tokenWarning.dark, tokenWarning.softBg),
          ],
        };
      case 'Scrap':
        return {
          title: 'Scrap containment',
          caption: 'Hourly quantity and loss source',
          primary: [primary('Scrap qty', hourlyScrapTotal, `${hourlyScrapRate}% rate`, hourlyScrapOpen > 0 ? 'warning' : 'success'), primary('Open actions', hourlyScrapOpen, `${visibleHourlyScrapRows.length} hourly rows`, hourlyScrapOpen > 0 ? 'error' : 'success')],
          compact: [compact('Contained', visibleHourlyScrapRows.filter((row) => row.status === 'Contained').length, tokenSuccess.darker), compact('Monitoring', visibleHourlyScrapRows.filter((row) => row.status === 'Monitoring').length, tokenWarning.dark), compact('Action open', visibleHourlyScrapRows.filter((row) => row.status === 'Action Open').length, tokenError.main)],
          progress: { label: 'SCRAP RATE', value: Math.min(100, Math.round(Number(hourlyScrapRate) * 10)), displayValue: `${hourlyScrapRate}%`, color: tokenWarning.dark },
          footer: [footer('PRODUCED', hourlyScrapProduced), footer('AFFECTED LINES', new Set(visibleHourlyScrapRows.map((row) => row.line)).size)],
          breakdownLabel: 'SCRAP STATUS',
          breakdown: [
            breakdown('Contained', visibleHourlyScrapRows.filter((row) => row.status === 'Contained').length, tokenSuccess.darker, tokenSuccess.softBg),
            breakdown('Monitoring', visibleHourlyScrapRows.filter((row) => row.status === 'Monitoring').length, tokenWarning.dark, tokenWarning.softBg),
            breakdown('Action Open', visibleHourlyScrapRows.filter((row) => row.status === 'Action Open').length, tokenError.main, tokenError.softBg),
          ],
        };
      case 'Performance Output':
        return {
          title: 'Output attainment',
          caption: 'Hourly target, produced and variance',
          primary: [primary('Produced', hourlyOutputProduced, `${hourlyOutputVariance >= 0 ? '+' : ''}${hourlyOutputVariance} vs target`), primary('At risk hours', hourlyOutputAtRisk, `${hourlyOutputRecovering} recovering`, hourlyOutputAtRisk > 0 ? 'error' : 'success')],
          compact: [compact('On target', visibleHourlyOutputRows.filter((row) => row.status === 'On Target').length, tokenSuccess.darker), compact('Recovering', hourlyOutputRecovering, tokenWarning.dark), compact('At risk', hourlyOutputAtRisk, tokenError.main)],
          progress: { label: 'OUTPUT ATTAINMENT', value: Math.min(100, hourlyOutputAttainment), displayValue: `${hourlyOutputAttainment}%`, color: tokenBrand.main },
          footer: [footer('TARGET', hourlyOutputTarget), footer('AFFECTED LINES', new Set(visibleHourlyOutputRows.map((row) => row.line)).size)],
          breakdownLabel: 'OUTPUT STATUS',
          breakdown: [
            breakdown('On Target', visibleHourlyOutputRows.filter((row) => row.status === 'On Target').length, tokenSuccess.darker, tokenSuccess.softBg),
            breakdown('Recovering', hourlyOutputRecovering, tokenWarning.dark, tokenWarning.softBg),
            breakdown('At Risk', hourlyOutputAtRisk, tokenError.main, tokenError.softBg),
          ],
        };
      default:
        return base;
    }
  })();
  const metricPanelBreakdownRawTotal = metricPanel.breakdown.reduce((sum, item) => sum + item.value, 0);
  const metricPanelBreakdownTotal = Math.max(1, metricPanelBreakdownRawTotal);
  const metricPanelBreakdownMax = Math.max(1, ...metricPanel.breakdown.map((item) => item.value));

  const lineSignals = productionLines.map((line) => {
    const lineEntries = entriesForMetrics.filter((entry) => entry.line === line);
    const openCount = lineEntries.filter((entry) => entry.status !== 'Closed').length;
    const highCount = lineEntries.filter((entry) => entry.riskLevel === 'High').length;
    const health = Math.max(58, 100 - highCount * 14 - openCount * 6);
    const state = highCount > 0 ? 'Attention' : openCount > 0 ? 'Watch' : 'Stable';
    return { line, openCount, highCount, health, state };
  });
  const activePreviewCellMeta = hoveredCellMeta ?? selectedCellMeta;
  const activePreviewCellLabel = hoveredCell ?? selectedCell;
  const activePreviewEntries = activePreviewCellMeta
    ? entriesForMetrics.filter((entry) => entry.line === activePreviewCellMeta.line || entry.zone === activePreviewCellMeta.zone)
    : scopedEntries;
  const activePreviewHigh = activePreviewEntries.filter((entry) => entry.riskLevel === 'High').length;
  const activePreviewOpen = activePreviewEntries.filter((entry) => entry.status !== 'Closed').length;
  const activePreviewLatest = activePreviewEntries[0];
  const activePreviewLineSignal = activePreviewCellMeta
    ? lineSignals.find((item) => item.line === activePreviewCellMeta.line)
    : undefined;

  const topImpacts = [...scopedEntries]
    .filter((entry) => entry.riskLevel === 'High' || entry.status !== 'Closed')
    .slice(0, 3);
  const currentScopeEntries = shiftLogbookCategory === 'Dashboard' ? scopedEntries : filteredEntries;
  const timelineEntries = currentScopeEntries.slice(0, 4);
  const continuityPool = currentScopeEntries.length ? currentScopeEntries : allShiftLogbookEntries;
  const scopedLastShiftEntries = continuityPool.filter((entry) => entry.dateScope === 'Last Shift');
  const lastShiftEntries = (scopedLastShiftEntries.length
    ? scopedLastShiftEntries
    : allShiftLogbookEntries.filter((entry) => entry.dateScope === 'Last Shift'))
    .slice(0, 4);
  const lastShiftOpenCarry = lastShiftEntries.filter((entry) => entry.status !== 'Closed').length;
  const currentShiftLabel = shiftLogbookFilters.shift === 'All' ? 'Current Shift' : `${shiftLogbookFilters.shift} Shift`;
  const aiSummaryText = topImpacts[0]
    ? `${topImpacts[0].line} (${topImpacts[0].zone}) is the main risk due to "${topImpacts[0].title}".`
    : 'No critical open risks detected in the current scope.';
  const aiRecommendedActions = [
    {
      title: topImpacts[0] ? `Prioritize ${topImpacts[0].line} recovery` : 'Validate stable process conditions',
      description: topImpacts[0] ? `Resolve ${topImpacts[0].ticketType.toLowerCase()} event and confirm containment.` : 'Confirm controls remain within target range.',
      tone: '#FEE2E2',
      border: '#FCA5A5',
      text: '#B91C1C',
    },
    {
      title: 'Deep dive into defect and scrap trend',
      description: `Current scrap rate is ${metricScrapRate}. Focus on top reject pattern before next shift.`,
      tone: '#F8FAFC',
      border: '#D7E2F0',
      text: '#1F3D7A',
    },
    {
      title: 'Confirm pending handover blockers',
      description: `${totalOpen} open logs and ${totalInProgress} in progress require ownership for the next shift.`,
      tone: '#F8FAFC',
      border: '#D7E2F0',
      text: '#1F3D7A',
    },
  ];
  const scrapContributors = [
    { label: 'Startup scrap', units: 34, color: tokenError.main },
    { label: 'Speed loss', units: 27, color: tokenWarning.dark },
    { label: 'Micro-stops', units: 18, color: tokenWarning.main },
    { label: 'Material starvation', units: 12, color: tokenBrand.main },
  ];
  const maxScrapUnits = Math.max(...scrapContributors.map((item) => item.units), 1);
  const pendingActionsRows = aiRecommendedActions.map((item, index) => ({
    id: index + 1,
    action: item.title,
    owner: index === 0 ? 'Maintenance' : index === 1 ? 'Quality' : 'Shift Lead',
    priority: index === 0 ? 'High' : 'Medium',
  }));
  const shiftTaskActivityRows = [
    { id: 'task-complete-1', task: 'Restart checklist completed', owner: 'Line Lead', status: 'Completed', tone: tokenSuccess.darker },
    { id: 'task-complete-2', task: 'Safety lockout verification completed', owner: 'EHS', status: 'Completed', tone: tokenSuccess.darker },
    { id: 'task-complete-3', task: 'Label alignment inspection completed', owner: 'Quality', status: 'Completed', tone: tokenSuccess.darker },
    { id: 'task-complete-4', task: 'Material feeder adjustment completed', owner: 'Operations', status: 'Completed', tone: tokenSuccess.darker },
    ...pendingActionsRows.slice(0, 2).map((row) => ({
      id: `task-open-${row.id}`,
      task: row.action,
      owner: row.owner,
      status: 'Open',
      tone: row.priority === 'High' ? tokenError.main : tokenWarning.dark,
    })),
  ];
  const presentCount = Math.max(8, 14 - highRisk);
  const absentCount = Math.max(0, 2 + highRisk - metricEso);
  const nextShiftName = shiftLogbookFilters.shift === 'Night' ? 'Morning' : shiftLogbookFilters.shift === 'Morning' ? 'Afternoon' : 'Night';
  const scopedHandoverWorkOrderEntries = continuityPool
    .filter((entry) => entry.category === 'Maintenance Work Order' || entry.category === 'Maintenance Request');
  const handoverWorkOrderEntries = (scopedHandoverWorkOrderEntries.length
    ? scopedHandoverWorkOrderEntries
    : allShiftLogbookEntries.filter((entry) => (
      entry.category === 'Maintenance Work Order' || entry.category === 'Maintenance Request'
    )))
    .slice(0, 5);
  const handoverMaintenanceEntries = handoverWorkOrderEntries.filter((entry) => entry.category === 'Maintenance Request');
  const handoverOnlyWorkOrderEntries = handoverWorkOrderEntries.filter((entry) => entry.category === 'Maintenance Work Order');
  const scopedHandoverEsoEntries = continuityPool.filter((entry) => entry.category === 'ESO');
  const handoverEsoEntries = (scopedHandoverEsoEntries.length
    ? scopedHandoverEsoEntries
    : allShiftLogbookEntries.filter((entry) => entry.category === 'ESO'))
    .slice(0, 4);
  const scopedHandoverQualityEntries = continuityPool
    .filter((entry) => entry.category === 'Quality' || entry.category === 'Scrap' || entry.ticketType === 'Non-Conformance');
  const handoverQualityEntries = (scopedHandoverQualityEntries.length
    ? scopedHandoverQualityEntries
    : allShiftLogbookEntries.filter((entry) => (
      entry.category === 'Quality'
      || entry.category === 'Scrap'
      || entry.ticketType === 'Non-Conformance'
    )))
    .slice(0, 4);
  const handoverDowntimeEntries = continuityPool
    .filter((entry) => entry.category === 'OEE' || entry.category === 'Performance Output' || entry.title.toLowerCase().includes('downtime'))
    .slice(0, 4);
  const handoverEventEntries = allShiftLogbookEntries
    .filter((entry) => entry.status !== 'Closed' || entry.riskLevel !== 'Low')
    .slice(0, 5);
  const handoverShiftLogEntries = [
    ...handoverWorkOrderEntries.slice(0, 2).map((entry) => ({
      id: `shift-log-maintenance-${entry.id}`,
      createdAt: entry.createdAt,
      type: entry.category === 'Maintenance Request' ? 'Maintenance request' : 'Work order',
      title: `${entry.category === 'Maintenance Request' ? 'Maintenance request' : 'Work order'} created`,
      detail: `${getLogbookMaintenanceNumber(entry)} - ${entry.title}`,
      tone: entry.category === 'Maintenance Request' ? tokenWarning.dark : tokenSuccess.darker,
    })),
    ...handoverEsoEntries.slice(0, 1).map((entry) => ({
      id: `shift-log-eso-${entry.id}`,
      createdAt: entry.createdAt,
      type: 'ESO',
      title: 'ESO report created',
      detail: `${entry.id} - ${entry.title}`,
      tone: tokenError.main,
    })),
    {
      id: 'shift-log-quality-record',
      createdAt: '10:42 AM',
      type: 'Quality record',
      title: 'Quality inspection logged',
      detail: 'QA-2041 - Label alignment verification completed',
      tone: tokenSuccess.darker,
    },
    {
      id: 'shift-log-action-record',
      createdAt: '11:05 AM',
      type: 'Action',
      title: 'Corrective action created',
      detail: 'ACT-2048 - Monitor startup scrap recovery',
      tone: tokenWarning.dark,
    },
    {
      id: 'shift-log-cil-record',
      createdAt: '11:26 AM',
      type: 'CIL log',
      title: 'CIL record logged',
      detail: 'CIL-Z1.1 - Guard inspection completed',
      tone: tokenSuccess.darker,
    },
  ].slice(0, 6);
  const handoverTopicCounts: Record<string, number | string> = {
    'Production & OEE': metricProduced,
    Quality: metricNc + handoverQualityEntries.length,
    Maintenance: handoverMaintenanceEntries.length,
    'Safety / ESO': handoverEsoEntries.length,
    'Work Orders': handoverOnlyWorkOrderEntries.length,
    'Events & Issues': handoverEventEntries.length,
    Downtime: `${metricDowntime}m`,
    'People / Crew': presentCount + absentCount,
    'Pending Actions': pendingActionsRows.length,
    'Planned Activities': 4,
  };
  const handoverTopicList = ['Production & OEE', 'Quality', 'Maintenance', 'Safety / ESO', 'Work Orders', 'Events & Issues', 'Downtime', 'People / Crew', 'Pending Actions', 'Planned Activities'];
  const disabledHandoverTopics = new Set<string>();
  const manualHandoverTopics = new Set(['Maintenance', 'Work Orders']);
  const handoverRecipientList = Object.keys(handoverSendTo);
  const selectedHandoverRecipients = handoverRecipientList.filter((recipient) => handoverSendTo[recipient]);
  const handoverDeliveryChannelList = Object.keys(handoverDeliveryChannels);
  const selectedHandoverChannels = handoverDeliveryChannelList.filter((channel) => handoverDeliveryChannels[channel]);
  const handoverOptionList = Object.keys(handoverGenerationOptions);
  const handoverShiftOptions = ['Current Shift', 'Morning Shift', 'Afternoon Shift', 'Night Shift'];
  const activeHandoverTopics = handoverTopicList.filter((topic) => handoverTopicToggles[topic]).length;
  const handoverLineTabs = productionLines.filter((line) => handoverSelectedLines.includes(line));
  const availableHandoverLines = productionLines.filter((line) => !handoverSelectedLines.includes(line));
  const activeHandoverLine = handoverLineTabs.includes(handoverLineTab) ? handoverLineTab : handoverLineTabs[0];
  const activeLineOffset = Math.max(0, productionLines.indexOf(activeHandoverLine));
  const handoverSelectedLinesLabel = `${handoverSelectedLines.length} selected line${handoverSelectedLines.length === 1 ? '' : 's'}`;
  const handoverSummaryDraft = `${activeHandoverLine} on ${handoverDateFilter}, ${handoverShiftFilter}: ${aiSummaryText} Prioritize production recovery, quality containment, and open ownership before the ${nextShiftName.toLowerCase()} shift starts. Report includes ${handoverSelectedLinesLabel}.`;
  const streamedHandoverSummary = handoverStreamStep < 6
    ? handoverSummaryDraft.slice(0, Math.max(42, Math.min(handoverSummaryDraft.length, handoverStreamStep * 72)))
    : handoverSummaryDraft;
  const handoverBuildStatus = handoverStreamStep < 6
    ? 'Drafting summary'
    : handoverStreamStep < 8
      ? 'Building metrics'
      : handoverStreamStep < 10
        ? 'Adding shift details'
        : handoverStreamStep < 12
          ? 'Finalizing handover'
          : 'Ready';
  const handoverHourlyRows = [
    { hour: '06:00', production: 510, target: 540, scrap: 12, scrapRate: '2.4%', oee: '82%', downtime: '6m', state: 'Stable', oeeEvents: [] },
    { hour: '07:00', production: 498, target: 540, scrap: 16, scrapRate: '3.1%', oee: '78%', downtime: '9m', state: 'Watch', oeeEvents: [] },
    { hour: '08:00', production: 452, target: 540, scrap: 29, scrapRate: '5.8%', oee: '69%', downtime: '18m', state: 'Risk', oeeEvents: ['Feeder micro-stop x4', 'Speed loss after material jam'] },
    { hour: '09:00', production: 488, target: 540, scrap: 21, scrapRate: '4.1%', oee: '73%', downtime: '12m', state: 'Recovering', oeeEvents: ['Conveyor restart hold', 'Quality hold for label check'] },
    { hour: '10:00', production: 526, target: 540, scrap: 14, scrapRate: '2.6%', oee: '81%', downtime: '5m', state: 'Stable', oeeEvents: [] },
    { hour: '11:00', production: 541, target: 540, scrap: 11, scrapRate: '2.0%', oee: '86%', downtime: '2m', state: 'On target', oeeEvents: [] },
  ];
  const displayedHandoverHourlyRows = handoverHourlyRows.map((row, index) => {
    if (activeHandoverLine === 'All Lines') return row;
    const productionDelta = activeLineOffset * 9 - (index % 2) * 6;
    const scrapDelta = activeLineOffset + (index === 2 ? 2 : 0);
    const oeeValue = Number(row.oee.replace('%', '')) - activeLineOffset + (index === 5 ? 1 : 0);
    return {
      ...row,
      production: row.production + productionDelta,
      target: row.target - activeLineOffset * 4,
      scrap: Math.max(4, row.scrap + scrapDelta),
      scrapRate: `${Math.max(1.2, Number(row.scrapRate.replace('%', '')) + activeLineOffset * 0.2).toFixed(1)}%`,
      oee: `${Math.max(62, oeeValue)}%`,
      downtime: index === 2 ? `${18 + activeLineOffset * 2}m` : row.downtime,
    };
  });
  const handoverDisplayedOee = activeHandoverLine === 'All Lines'
    ? Math.max(60, 88 - highRisk * 5)
    : Math.max(58, 88 - highRisk * 5 - activeLineOffset);
  const handoverDisplayedProduced = activeHandoverLine === 'All Lines'
    ? metricProduced
    : metricProduced - activeLineOffset * 84;
  const handoverDisplayedScrapRate = activeHandoverLine === 'All Lines'
    ? metricScrapRate
    : `${Math.max(1.8, Number(metricScrapRate.replace('%', '')) + activeLineOffset * 0.2).toFixed(1)}%`;
  const handoverDisplayedDowntime = activeHandoverLine === 'All Lines'
    ? metricDowntime
    : metricDowntime + activeLineOffset * 3;
  const handoverKpiTiles = [
    {
      label: 'Safety',
      value: 'OK',
      helper: 'No safety incidents this shift',
      tone: tokenSuccess.darker,
      bg: tokenSuccess.softBg,
      icon: EsoIcon,
    },
    {
      label: 'Quality',
      value: 'OK',
      helper: 'No NCs in last 24h',
      tone: tokenSuccess.darker,
      bg: tokenSuccess.softBg,
      icon: NonConformanceIcon,
    },
    {
      label: 'Work order',
      value: 'SKU-12548',
      helper: 'Batch 850594-01',
      tone: tokenText.primary,
      bg: tokenWarning.softBg,
      icon: WorkOrderIcon,
    },
    {
      label: 'Production',
      value: `${handoverDisplayedProduced.toLocaleString()} / 10,000`,
      helper: `${Math.round((handoverDisplayedProduced / 10000) * 100)}% vs target`,
      tone: tokenSuccess.darker,
      bg: tokenSuccess.softBg,
      icon: PerformanceIcon,
    },
    {
      label: 'OEE',
      value: `${handoverDisplayedOee}%`,
      helper: handoverDisplayedOee < 75 ? 'Below target' : 'On recovery plan',
      tone: handoverDisplayedOee < 75 ? tokenError.main : tokenSuccess.darker,
      bg: handoverDisplayedOee < 75 ? tokenError.softBg : tokenSuccess.softBg,
      icon: OeeIcon,
    },
    {
      label: 'Scrap',
      value: handoverDisplayedScrapRate,
      helper: '+0.6pp vs target',
      tone: tokenError.main,
      bg: tokenError.softBg,
      icon: ScrapIcon,
    },
    {
      label: 'People',
      value: `${presentCount}/${presentCount + absentCount}`,
      helper: `${absentCount} absence${absentCount === 1 ? '' : 's'}`,
      tone: absentCount ? tokenWarning.dark : tokenSuccess.darker,
      bg: absentCount ? tokenWarning.softBg : tokenSuccess.softBg,
      icon: TeamsIcon,
    },
  ];
  const handoverPlannedActivities = [
    { type: 'CIL', description: 'Filler PM route and guards clean / inspect / lube', line: activeHandoverLine, start: '14:20', duration: '45m', owner: 'Luis M.', tone: tokenSuccess.darker },
    { type: 'Centerline', description: 'Conveyor CV-210 belt tracking centerline verification', line: 'Line 10', start: '15:05', duration: '30m', owner: 'Quality', tone: tokenWarning.dark },
    { type: 'Maintenance PM', description: 'Filter 1 pressure check and motor fan inspection', line: 'Line 1', start: '16:00', duration: '45m', owner: 'Maintenance', tone: tokenWarning.dark },
    { type: 'Communication', description: 'Incoming shift brief: speed cap, scrap watch, QA release', line: 'All Lines', start: '17:45', duration: '15m', owner: 'Javier A.', tone: tokenSuccess.darker },
  ];
  const nextShiftActionRows = [
    ...pendingActionsRows.map((row) => ({
      type: row.priority === 'High' ? 'Action' : 'Follow-up',
      description: row.action,
      line: activeHandoverLine,
      start: row.priority === 'High' ? 'Shift start' : 'Tier 1',
      duration: row.priority === 'High' ? '15m' : '10m',
      owner: row.owner,
      tone: row.priority === 'High' ? tokenError.main : tokenWarning.dark,
    })),
    ...handoverPlannedActivities,
  ].slice(0, 6);
  const shiftCoverageConfidence = 92;
  const shiftCoverageRows = [
    { label: 'Incoming lead', value: 'Javier Ayala', helper: `${nextShiftName} shift`, tone: tokenSuccess.darker },
    { label: 'Operators ready', value: `${presentCount}/${presentCount + absentCount}`, helper: `${Math.max(1, 3 - absentCount)} cross-trained backups`, tone: tokenSuccess.darker },
    { label: 'QA coverage', value: 'Confirmed', helper: 'Release gate assigned', tone: tokenSuccess.darker },
    { label: 'Maintenance support', value: 'On call', helper: 'PM window protected', tone: tokenWarning.dark },
  ];
  const handoverNoteSuggestions = [
    {
      title: 'Recovery watch',
      body: `${activeHandoverLine}: verify conveyor restart, keep maintenance owner assigned, and confirm OEE recovery above 80% before full-speed release.`,
    },
    {
      title: 'Quality containment',
      body: `Quality to check label alignment and startup scrap trend on ${activeHandoverLine}; hold escalation open until two clean hourly samples are logged.`,
    },
    {
      title: 'Next shift focus',
      body: `Incoming shift lead should review open actions, crew coverage, and feeder jam recurrence during the first tier check.`,
    },
  ];
  const handoverSectionCardSx = {
    borderRadius: '12px',
    border: `1px solid ${tokenDivider}`,
    bgcolor: 'background.paper',
    boxShadow: 'none',
    fontFamily: workstationVisuals.fontFamily,
  };
  const handoverMetricCardSx = {
    ...handoverSectionCardSx,
    p: 1.15,
    minHeight: 76,
  };
  const handoverTableHeaderSx = {
    color: tokenText.secondary,
    fontSize: '0.66rem',
    fontWeight: 700,
    textTransform: 'uppercase',
  };
  const handoverTableCellSx = {
    color: tokenText.primary,
    fontSize: '0.74rem',
    fontWeight: 500,
    minWidth: 0,
  };
  const handoverFilterFieldSx = {
    '& .MuiInputBase-root': {
      height: 34,
      borderRadius: '8px',
      bgcolor: 'background.paper',
      fontSize: '0.74rem',
      fontWeight: 500,
      fontFamily: workstationVisuals.fontFamily,
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: tokenDivider,
    },
    '& .MuiInputLabel-root': {
      fontSize: '0.68rem',
      color: tokenText.secondary,
      fontWeight: 500,
      fontFamily: workstationVisuals.fontFamily,
    },
  };
  const handoverToggleSx = (active: boolean) => ({
    width: 30,
    height: 18,
    borderRadius: 999,
    p: '2px',
    bgcolor: active ? tokenBrand.main : tokenNeutral.dark,
    display: 'flex',
    justifyContent: active ? 'flex-end' : 'flex-start',
    alignItems: 'center',
    transition: 'background-color 0.15s ease',
    flexShrink: 0,
  });
  const handoverToggleKnobSx = {
    width: 14,
    height: 14,
    borderRadius: '50%',
    bgcolor: tokenCommon.white,
    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.22)',
  };
  const riskChipSx = (riskLevel: ShiftLogbookEntry['riskLevel']) => ({
    height: 20,
    bgcolor: riskLevel === 'High' ? '#FEE2E2' : riskLevel === 'Medium' ? '#FEF3C7' : '#DCFCE7',
    color: riskLevel === 'High' ? '#B91C1C' : riskLevel === 'Medium' ? '#B45309' : '#166534',
    border: `1px solid ${riskLevel === 'High' ? '#FCA5A5' : riskLevel === 'Medium' ? '#FCD34D' : '#86EFAC'}`,
    '& .MuiChip-label': { px: 0.7, fontSize: '0.62rem', fontWeight: 850 },
  });
  const toggleHandoverTopic = (topic: string) => {
    if (disabledHandoverTopics.has(topic)) return;
    setHandoverTopicToggles((prev) => ({ ...prev, [topic]: !prev[topic] }));
  };
  const addHandoverLine = (line: string) => {
    if (!line) return;
    setHandoverSelectedLines((prev) => {
      setHandoverLineTab(line);
      if (prev.includes(line)) return prev;
      return productionLines.filter((item) => prev.includes(item) || item === line);
    });
  };
  const removeHandoverLine = (line: string) => {
    setHandoverSelectedLines((prev) => {
      if (prev.length === 1) return prev;
      const next = prev.filter((item) => item !== line);
      if (handoverLineTab === line) setHandoverLineTab(next[0]);
      return next;
    });
  };
  const toggleHandoverRecipient = (recipient: string) => {
    setHandoverSendTo((prev) => ({ ...prev, [recipient]: !prev[recipient] }));
  };
  const toggleHandoverDeliveryChannel = (channel: string) => {
    setHandoverDeliveryChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };
  const toggleHandoverGenerationOption = (option: string) => {
    setHandoverGenerationOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };
  const appendHandoverNoteSuggestion = (body: string) => {
    setHandoverNotes((current) => {
      const trimmed = current.trim();
      return trimmed ? `${trimmed}\n\n${body}` : body;
    });
  };
  const replaceHandoverNotesWithAiDraft = () => {
    if (isDraftingHandoverNotes) return;
    const draft = handoverNoteSuggestions.map((suggestion) => suggestion.body).join('\n\n');
    const suggestionEnds = handoverNoteSuggestions.map((_, index) => (
      handoverNoteSuggestions.slice(0, index + 1).map((suggestion) => suggestion.body).join('\n\n').length
    ));
    let cursor = 0;
    setHandoverNotes('');
    setIsDraftingHandoverNotes(true);
    setDraftingHandoverSuggestionIndex(0);
    setDraftedHandoverSuggestionCount(0);
    setHandoverDraftProgress(0);
    if (handoverDraftTimerRef.current) window.clearInterval(handoverDraftTimerRef.current);
    handoverDraftTimerRef.current = window.setInterval(() => {
      cursor = Math.min(draft.length, cursor + 2);
      const activeIndex = suggestionEnds.findIndex((end) => cursor <= end);
      setHandoverNotes(draft.slice(0, cursor));
      setHandoverDraftProgress(Math.round((cursor / draft.length) * 100));
      setDraftingHandoverSuggestionIndex(activeIndex === -1 ? handoverNoteSuggestions.length - 1 : activeIndex);
      setDraftedHandoverSuggestionCount(Math.max(0, activeIndex === -1 ? handoverNoteSuggestions.length : activeIndex));
      if (cursor >= draft.length) {
        if (handoverDraftTimerRef.current) window.clearInterval(handoverDraftTimerRef.current);
        handoverDraftTimerRef.current = null;
        setIsDraftingHandoverNotes(false);
        setDraftingHandoverSuggestionIndex(null);
        setDraftedHandoverSuggestionCount(handoverNoteSuggestions.length);
        setHandoverDraftProgress(100);
      }
    }, 22);
  };
  const addHandoverFocusChip = () => {
    const nextChip = ['Line 3 Recovery', 'Scrap Reduction', 'Setup Verification', 'Work Orders Review', 'ESO Follow-up']
      .find((chip) => !handoverFocusChips.includes(chip));
    if (nextChip) setHandoverFocusChips((prev) => [...prev, nextChip]);
  };
  const removeFocusChip = (chip: string) => {
    setHandoverFocusChips((prev) => prev.filter((item) => item !== chip));
  };
  const toLiveAge = (createdAtMs: number) => {
    const seconds = Math.max(1, Math.floor((liveClockMs - createdAtMs) / 1000));
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  React.useEffect(() => {
    setDashboardDrillLevel(headerDrivenDrillLevel);
    setHoveredDrillTarget(null);
    setSelectedDashboardTarget(drillLevelConfig[headerDrivenDrillLevel].infoTitle);
  }, [headerDrivenDrillLevel, selectedHeaderHierarchyId]);

  React.useEffect(() => {
    if (!isShiftHandoverOpen) {
      setHandoverStreamStep(0);
      return;
    }
    setHandoverStreamStep(1);
    setHandoverTopicToggles(Object.fromEntries(handoverTopicList.map((topic) => [topic, false])));
    const advanceBuild = (step: number, topic?: string) => {
      setHandoverStreamStep(step);
      if (topic && !manualHandoverTopics.has(topic)) setHandoverTopicToggles((current) => ({ ...current, [topic]: true }));
    };
    const timers = [
      window.setTimeout(() => advanceBuild(2, 'Production & OEE'), 500),
      window.setTimeout(() => advanceBuild(3, 'Quality'), 1050),
      window.setTimeout(() => advanceBuild(4), 1600),
      window.setTimeout(() => advanceBuild(5, 'Safety / ESO'), 2150),
      window.setTimeout(() => advanceBuild(6), 2700),
      window.setTimeout(() => advanceBuild(7, 'Events & Issues'), 3150),
      window.setTimeout(() => advanceBuild(8, 'Downtime'), 3600),
      window.setTimeout(() => advanceBuild(9, 'People / Crew'), 4050),
      window.setTimeout(() => advanceBuild(10, 'Pending Actions'), 4500),
      window.setTimeout(() => advanceBuild(11, 'Planned Activities'), 4950),
      window.setTimeout(() => setHandoverStreamStep(12), 5400),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [isShiftHandoverOpen, selectedCell, shiftLogbookCategory, shiftLogbookFilters.shift, shiftLogbookFilters.zone, shiftLogbookSearch]);

  React.useEffect(() => {
    const initial = entriesForMetrics.slice(0, 5).map((entry, idx) => ({
      id: `live-seed-${entry.id}-${idx}`,
      title: entry.title,
      line: entry.line,
      zone: entry.zone,
      ticketType: entry.ticketType,
      tone: entry.tone,
      createdAtMs: Date.now() - (idx + 1) * 70_000,
    }));
    setLiveEvents(initial);
  }, [effectiveCategory, shiftLogbookFilters.zone, shiftLogbookSearch]);

  React.useEffect(() => {
    const clock = window.setInterval(() => setLiveClockMs(Date.now()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  React.useEffect(() => {
    if (!entriesForMetrics.length) return;
    const interval = window.setInterval(() => {
      const seed = entriesForMetrics[Math.floor(Math.random() * entriesForMetrics.length)];
      if (!seed) return;
      const updateVariants = [
        `Update: ${seed.title}`,
        `Follow-up: ${seed.title}`,
        `Status change detected: ${seed.title}`,
      ];
      const event: LiveEventItem = {
        id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: updateVariants[Math.floor(Math.random() * updateVariants.length)],
        line: seed.line,
        zone: seed.zone,
        ticketType: seed.ticketType,
        tone: seed.tone,
        createdAtMs: Date.now(),
      };
      setLiveEvents((prev) => [event, ...prev].slice(0, 24));
    }, 12000);
    return () => window.clearInterval(interval);
  }, [entriesForMetrics]);

  const scopedLiveEvents = (selectedCellMeta
    ? liveEvents.filter((event) => event.line === selectedCellMeta.line || event.zone === selectedCellMeta.zone)
    : liveEvents
  ).slice(0, 8);

  const openNoteEditor = (entry: any) => {
    setEditingNoteId(entry.id);
    setEditingNoteValue(entryNotes[entry.id] ?? entry.note ?? '');
  };

  const saveNote = () => {
    if (!editingNoteId) return;
    setEntryNotes((prev) => ({ ...prev, [editingNoteId]: editingNoteValue.trim() }));
    setEditingNoteId(null);
    setEditingNoteValue('');
  };

  const openDashboardLogbookCategory = (category: DashboardLogbookCategory, searchTerm = dashboardContext.searchTerm) => {
    setShiftLogbookCategory(category as any);
    setShiftLogbookSearch(searchTerm);
  };

  const openNewDashboardMaintenanceRequest = (targetLabel: string) => {
    const card = buildNewMaintenanceRequestCard(targetLabel);
    closeLegacyMaintenanceDrawers();
    setSelectedMaintenanceRequestCard(null);
    closeMaintenanceWorkOrderDrawer();
    setSelectedEsoReport(null);

    if (logbook?.setShiftEntryMode && logbook?.setIsShiftEntryOpen && logbook?.setShiftEntryMaintenancePrefill) {
      logbook.setShiftEntryMaintenancePrefill({
        aiSuggestionText: `BLU.AI matched ${card.requestContext?.equipment ?? card.title} with Zone 01 live context and prefilled equipment, activity type, risk, and priority. Recommended next step: attach a photo or short audio note before submitting.`,
        equipment: card.requestContext?.equipment ?? card.title,
        equipmentId: card.requestContext?.equipment ?? card.title,
        equipmentPath: `${card.requestContext?.location ?? 'Columbus West - Line 10 - Zone 01'} > ${card.requestContext?.equipment ?? card.title}`,
        equipmentTags: ['Criticality A', 'Line 10', 'Zone 01'],
        liveFill: true,
        maintenanceType: 'issue',
        whatHappened: card.detail,
        suggestedActivityType: card.requestContext?.activityType ?? 'Mechanical',
        suggestedRiskAssessment: {
          downtime: card.requestContext?.downtime ?? 'Medium',
          quality: card.requestContext?.quality ?? 'Medium',
          ehs: card.requestContext?.ehs ?? 'Low',
        },
        suggestedPriority: card.priority === 'High' ? '2 - High (3 days)' : '3 - Medium (7 days)',
      });
      logbook.setShiftEntryMode('maintenance');
      logbook.setIsShiftEntryOpen(true);
      return;
    }

    setSelectedMaintenanceRequestCard(card);
  };

  const openNewDashboardWorkOrder = (targetLabel: string) => {
    const equipment = getDashboardTargetEquipment(targetLabel);
    const sourceCard = maintenanceLaneData.team.scheduling[0];
    const sourceDetail = `${targetLabel} requires corrective work order planning from Zone 01 live context.`;
    const isConveyor = targetLabel.toLowerCase().includes('conveyor');
    closeLegacyMaintenanceDrawers();
    setSelectedMaintenanceRequestCard(null);
    setSelectedEsoReport(null);
    clearWorkOrderLiveFillTimers();

    const fullDraft: WorkOrderDraft = {
      ...buildWorkOrderDraftFromBoardCard(
        {
          ...sourceCard,
          title: equipment,
          detail: sourceDetail,
          due: 'Now',
          priority: isConveyor ? 'High' : 'Medium',
          equipmentCriticality: 'A',
          tags: ['Columbus West', 'Line 10', 'Zone 01', ...(sourceCard.tags ?? [])],
        },
        'Planning',
      ),
      drawerTitle: 'Create Work Order',
      statusLabel: 'Planning',
      equipment,
      equipmentCriticality: 'A',
      problemDescription: sourceDetail,
      maintenanceType: 'Corrective',
      activityType: 'Mechanical',
      downtime: isConveyor ? 'High' : 'Medium',
      quality: 'Medium',
      ehs: 'Low',
      priority: isConveyor ? 'High' : 'Medium',
    };

    setMaintenanceWorkOrderDraft({
      ...fullDraft,
      equipment: '',
      problemDescription: '',
      activityType: '',
      downtime: '',
      quality: '',
      ehs: '',
      priority: '',
    });
    setMaintenanceWorkOrderTab('attachments');

    const scheduleDraftStep = (delay: number, updater: (draft: WorkOrderDraft) => WorkOrderDraft) => {
      const timerId = window.setTimeout(() => {
        setMaintenanceWorkOrderDraft((current) => current ? updater(current) : current);
        workOrderLiveFillTimersRef.current = workOrderLiveFillTimersRef.current.filter((id) => id !== timerId);
      }, delay);
      workOrderLiveFillTimersRef.current = [...workOrderLiveFillTimersRef.current, timerId];
    };

    scheduleDraftStep(260, (draft) => ({
      ...draft,
      equipment: fullDraft.equipment,
      equipmentCriticality: fullDraft.equipmentCriticality,
    }));
    scheduleDraftStep(680, (draft) => ({
      ...draft,
      problemDescription: fullDraft.problemDescription,
    }));
    scheduleDraftStep(1080, (draft) => ({
      ...draft,
      activityType: fullDraft.activityType,
    }));
    scheduleDraftStep(1380, (draft) => ({
      ...draft,
      downtime: fullDraft.downtime,
      quality: fullDraft.quality,
      ehs: fullDraft.ehs,
    }));
    scheduleDraftStep(1680, (draft) => ({
      ...draft,
      priority: fullDraft.priority,
    }));
  };

  const openNewDashboardEso = (targetLabel: string) => {
    closeLegacyMaintenanceDrawers();
    setSelectedMaintenanceRequestCard(null);
    closeMaintenanceWorkOrderDrawer();
    setSelectedEsoReport(null);

    if (logbook?.setShiftEntryMode && logbook?.setIsShiftEntryOpen) {
      logbook.setShiftEntryMode('eso');
      logbook.setIsShiftEntryOpen(true);
      return;
    }

    setMaintenanceDrawerToast(`Open Operations Entry > ESO for ${targetLabel}.`);
  };

  const openNewDashboardRecord = (category: DashboardLogbookCategory, targetLabel: string) => {
    if (category === 'Maintenance Request') {
      openNewDashboardMaintenanceRequest(targetLabel);
      return;
    }
    if (category === 'Maintenance Work Order') {
      openNewDashboardWorkOrder(targetLabel);
      return;
    }
    if (category === 'ESO') {
      openNewDashboardEso(targetLabel);
    }
  };

  React.useEffect(() => {
    const pendingAction = logbook?.pendingDashboardRecordAction;
    if (!pendingAction) return;

    logbook?.setPendingDashboardRecordAction?.(null);
    openNewDashboardRecord(pendingAction.category as DashboardLogbookCategory, pendingAction.targetLabel);
  }, [logbook?.pendingDashboardRecordAction]);

  const dashboardSpareParts = React.useMemo(
    () => (sparePartCodesByLogbookLevel[dashboardDrillLevel] ?? [])
      .map((code) => findSparePartsInventoryPartByCode(code))
      .filter((part): part is SparePartsInventoryPart => Boolean(part)),
    [dashboardDrillLevel]
  );
  const dashboardSparePartAlerts = React.useMemo(
    () => dashboardSpareParts.filter((part) => getZoneSparePartStatus(part).label !== 'Ready').length,
    [dashboardSpareParts]
  );
  const requestSparePartsPurchase = React.useCallback((partId: string) => {
    setRequestedSparePartsPurchasePartIds((currentIds) => (
      currentIds.includes(partId) ? currentIds : [...currentIds, partId]
    ));
  }, []);

  const setDashboardLevelByIndex = (index: number) => {
    const nextLevel = drillLevelOrder[index];
    if (!nextLevel) return;
    setDashboardDrillLevel(nextLevel);
    setHoveredDrillTarget(null);
    setSelectedDashboardTarget(drillLevelConfig[nextLevel].infoTitle);
  };

  const drillDownTo = (target: { label: string; next?: DrillLevel }) => {
    setSelectedDashboardTarget(target.label);
    setHoveredDrillTarget(null);
    if (!target.next) {
      openDashboardLogbookCategory(dashboardContext.defaultCategory, target.label);
      return;
    }
    setDashboardDrillLevel(target.next);
    setSelectedDashboardTarget(drillLevelConfig[target.next].infoTitle);
    if (target.next === 'unit') {
      setSelectedCell('Line 05');
    }
  };

  const drillUpOneLevel = () => {
    const currentIndex = drillLevelOrder.indexOf(dashboardDrillLevel);
    if (currentIndex <= 0) return;
    setDashboardLevelByIndex(currentIndex - 1);
  };

  const openLogbookAiAnalysis = React.useCallback((focus: 'risk' | 'workload' | 'handover') => {
    const openEntries = visibleLogbookEntries.filter((entry) => entry.status !== 'Closed');
    const focusEntries = focus === 'risk'
      ? (topImpacts.length ? topImpacts : openEntries).slice(0, 5)
      : focus === 'workload'
        ? openEntries.slice(0, 5)
        : (topImpacts.length ? topImpacts : openEntries).slice(0, 4);
    const responseCards = focusEntries.map((entry, index) => ({
      id: entry.id,
      title: entry.title,
      signal: entry.category,
      detail: `${entry.line} / ${entry.zone} - ${entry.status}. Reported by ${entry.reporter}.`,
      rank: index + 1,
      dueDate: entry.status === 'Closed' ? 'Closed' : 'Before handover',
      assignedTo: entry.reporter,
      priority: entry.riskLevel,
      accent: entry.riskLevel === 'High'
        ? tokenError.main
        : entry.riskLevel === 'Medium'
          ? tokenWarning.main
          : tokenBrand.main,
    }));
    const primaryEntry = focusEntries[0];
    const focusConfig = {
      risk: {
        title: 'Highest-risk log',
        problemFilter: primaryEntry?.title ?? metricScopeLabel,
        openingText: primaryEntry
          ? `I found the highest-risk record in ${metricScopeLabel}: "${primaryEntry.title}" on ${primaryEntry.line} / ${primaryEntry.zone}. I will trace the ownership, linked work, and handover impact now.`
          : `I am reviewing ${metricScopeLabel}. There is no dominant high-risk record, so I will check the remaining open ownership and carry-over exposure.`,
        label: 'Review highest-risk log',
        prompt: primaryEntry
          ? `Review "${primaryEntry.title}" and tell me what must happen before handover.`
          : `Review the highest-risk open records in ${metricScopeLabel}.`,
        response: primaryEntry
          ? `${primaryEntry.title} is the first item to address because it is ${primaryEntry.riskLevel.toLowerCase()} risk and still ${primaryEntry.status.toLowerCase()}. Confirm an owner, verify containment, and update the linked maintenance or quality record before handover.`
          : `No single critical record dominates this scope. The remaining open items should be reviewed for owner, containment evidence, and carry-over notes.`,
        followUpActions: [
          { label: 'Open Maintenance Requests', category: 'Maintenance Request' as DashboardLogbookCategory, searchTerm: primaryEntry?.line },
          { label: 'Open Work Orders', category: 'Maintenance Work Order' as DashboardLogbookCategory, searchTerm: primaryEntry?.line },
        ],
      },
      workload: {
        title: 'Open workload',
        problemFilter: `${metricOpenItems} open items`,
        openingText: `I am reviewing the ${metricOpenItems} open items in ${metricScopeLabel}, including ${totalInProgress} already in progress. I will separate immediate risks from records that can remain in the normal queue.`,
        label: 'Prioritize open workload',
        prompt: `Prioritize the ${metricOpenItems} open Shift Logbook items in this scope.`,
        response: `${metricOpenItems} records remain open and ${totalInProgress} are already in progress. Work high-risk and overdue ownership first, then resolve records missing evidence or a clear next-shift owner.`,
        followUpActions: [
          { label: 'Open Maintenance Requests', category: 'Maintenance Request' as DashboardLogbookCategory },
          { label: 'Open Work Orders', category: 'Maintenance Work Order' as DashboardLogbookCategory },
        ],
      },
      handover: {
        title: 'Next shift focus',
        problemFilter: 'Next shift handover',
        openingText: `I am preparing the next-shift focus from ${metricScopeLabel}. I will connect the highest-risk records, open ownership, downtime exposure, and the notes that must carry forward.`,
        label: 'Prepare next-shift focus',
        prompt: 'Prepare the ordered focus list for the next shift handover.',
        response: `For the next shift, lead with the highest-risk open record, assign owners to the ${metricOpenItems} open items, and document the ${metricDowntime} minutes of downtime exposure plus the current ${metricScrapRate} scrap rate. Keep only unresolved evidence and decisions in carry-over notes.`,
        followUpActions: [
          { label: 'Open Shift Notes', category: 'Shift Notes' as DashboardLogbookCategory },
          { label: 'Open Work Orders', category: 'Maintenance Work Order' as DashboardLogbookCategory, searchTerm: primaryEntry?.line },
        ],
      },
    }[focus];

    onOpenAiAssistant?.({
      contextTitle: focusConfig.title,
      contextSubtitle: shiftLogbookCategory === 'Dashboard' ? selectedDashboardLabel : metricScopeLabel,
      problemFilter: focusConfig.problemFilter,
      openingText: focusConfig.openingText,
      autoRunActionIndex: 0,
      quickActions: [
        {
          label: focusConfig.label,
          prompt: focusConfig.prompt,
          response: focusConfig.response,
          responseCards,
          followUpActions: focusConfig.followUpActions,
        },
        {
          label: 'Explain the priority logic',
          prompt: 'Explain why this order makes sense for the shift.',
          response: `The order combines risk level, open status, downtime exposure, current progress, and whether the record already has a clear owner and containment evidence.`,
          responseCards,
          followUpActions: focusConfig.followUpActions,
        },
        {
          label: 'Show where to continue',
          prompt: 'Show me the Logbook views I should use to continue this work.',
          response: 'Continue from the matching Logbook views below. The selected scope and search context will be carried into the list.',
          followUpActions: focusConfig.followUpActions,
        },
      ],
    });
  }, [metricDowntime, metricOpenItems, metricScopeLabel, metricScrapRate, onOpenAiAssistant, selectedDashboardLabel, shiftLogbookCategory, topImpacts, totalInProgress, visibleLogbookEntries]);

  const logbookAiPanelInsights = [
    {
      title: topImpacts[0] ? 'Highest-risk log needs ownership.' : 'Current scope is stable.',
      detail: topImpacts[0]
        ? `${topImpacts[0].line} / ${topImpacts[0].zone}: ${topImpacts[0].title}`
        : `BLU.AI is monitoring ${metricScopeLabel} for carry-over risk.`,
      severity: topImpacts[0]?.riskLevel === 'High' ? 'high' : 'info',
      highlighted: true,
      onClick: () => openLogbookAiAnalysis('risk'),
    },
    {
      title: `${metricOpenItems} open item${metricOpenItems === 1 ? '' : 's'}`,
      detail: `${totalInProgress} in progress, ${metricDowntime} min downtime exposure, ${metricScrapRate} scrap rate.`,
      severity: metricOpenItems > 0 ? 'info' : 'low',
      highlighted: false,
      onClick: () => openLogbookAiAnalysis('workload'),
    },
    {
      title: 'Next shift focus',
      detail: topImpacts[0]
        ? `Prioritize ${topImpacts[0].category.toLowerCase()} ownership before handover.`
        : 'Keep closure, carry-over notes, and work order links clean.',
      severity: topImpacts[0]?.riskLevel === 'High' ? 'high' : 'info',
      highlighted: false,
      onClick: () => openLogbookAiAnalysis('handover'),
    },
  ];

  const logbookWriterScope = shiftLogbookCategory === 'Dashboard'
    ? selectedDashboardLabel
    : metricScopeLabel;
  const writerFocus = topImpacts[0]
    ? `${topImpacts[0].title} on ${topImpacts[0].line}`
    : 'closure evidence and next-shift continuity';
  const logbookWriterNarrative = ({
    Dashboard: `${logbookWriterScope} is carrying ${metricOpenItems} open items, ${highRisk} high-risk signals, ${metricDowntime} minutes of downtime exposure, and ${metricScrapRate} scrap. Focus first on ${writerFocus} because it connects the plant risk, owner handoff, and recovery path for the next shift.`,
    All: `Across all Logbook streams, ${metricOpenItems} records remain open and ${totalInProgress} are already in progress. Start with ${writerFocus}, then confirm that linked requests, work orders, and shift notes tell the same story.`,
    'Maintenance Request': `${metricOpenItems} maintenance requests remain open in ${logbookWriterScope}. Review request ownership, equipment context, and urgency around ${writerFocus} before deciding which items must become work orders.`,
    'Maintenance Work Order': `${metricOpenItems} work orders still need follow-up and ${totalInProgress} are in progress. Prioritize ${writerFocus}, then verify parts, due date, execution status, and closure evidence for the incoming shift.`,
    OEE: `The OEE view shows ${metricDowntime} minutes of downtime exposure across ${metricFocusCount} relevant records. Investigate ${writerFocus} first and connect the loss to availability, performance, or quality before assigning recovery work.`,
    Quality: `Quality context is carrying ${metricOpenItems} open records with a current scrap rate of ${metricScrapRate}. Focus on ${writerFocus}, confirm containment, and preserve the evidence needed for release and recurrence review.`,
    'Shift Notes': `${metricFocusCount} shift notes are in scope for ${logbookWriterScope}. Keep the handover concise: document the decision, current condition, owner, and next verification step for ${writerFocus}.`,
    ESO: `${metricOpenItems} ESO-related records are still open, including ${highRisk} high-risk signals. Lead with ${writerFocus}, verify immediate controls, and make the accountable owner visible before handover.`,
    RCA: `${metricFocusCount} RCA records are visible in this scope. Use ${writerFocus} as the lead hypothesis, separate symptoms from causes, and link the resulting countermeasures to owners and due dates.`,
    Scrap: `Scrap is currently ${metricScrapRate} with ${metricOpenItems} open follow-ups. Start with ${writerFocus}, compare the repeated pattern by line and shift, and confirm containment before the next production window.`,
    'Performance Output': `Performance output has ${metricProduced} produced units and ${metricDowntime} minutes of downtime exposure in scope. Review ${writerFocus} against target, constraint, and recovery ownership before the next shift.`,
  } as Record<string, string>)[shiftLogbookCategory] ?? `Review ${writerFocus} in ${logbookWriterScope} and confirm ownership before handover.`;

  React.useEffect(() => {
    setStreamedAiInsight('');
    let cursor = 0;
    const intervalId = window.setInterval(() => {
      cursor += 3;
      setStreamedAiInsight(logbookWriterNarrative.slice(0, cursor));
      if (cursor >= logbookWriterNarrative.length) {
        window.clearInterval(intervalId);
      }
    }, 16);

    return () => window.clearInterval(intervalId);
  }, [logbookWriterNarrative]);

  const logbookContextWriter = (
    <Paper
      elevation={0}
      sx={{
        p: 1.2,
        minHeight: shiftLogbookCategory === 'Dashboard' ? 154 : 118,
        borderRadius: '12px',
        bgcolor: tokenNeutral.lightest,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        gap: 0.75,
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0}}>
          <SparkleIcon sx={{fontSize: 15, color: tokenWarning.dark, flexShrink: 0}} />
          <Typography sx={{color: tokenBrand.main, fontSize: '0.75rem', fontWeight: 700}} noWrap>
            BLU.AI insight
          </Typography>
        </Box>
      </Box>
      <Typography
        aria-live="polite"
        sx={{
          color: tokenText.secondary,
          fontSize: '0.74rem',
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: shiftLogbookCategory === 'Dashboard' ? 5 : 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {streamedAiInsight}
        {streamedAiInsight.length < logbookWriterNarrative.length ? (
          <Box component="span" aria-hidden sx={{display: 'inline-block', width: 2, height: 11, ml: 0.25, bgcolor: tokenBrand.main, verticalAlign: 'text-bottom', animation: 'logbookAiPulse 0.8s ease-in-out infinite'}} />
        ) : null}
      </Typography>
    </Paper>
  );

  const tableHeaderCellSx = {
    color: tokenText.secondary,
    fontSize: '0.68rem',
    fontWeight: 600,
    letterSpacing: '0.1px',
    lineHeight: 1.2,
    textTransform: 'uppercase',
  } as const;

  const tableNumberSx = {
    color: tokenText.primary,
    fontSize: '0.95rem',
    fontWeight: 700,
    lineHeight: 1.15,
  } as const;

  const getStaticStatusSx = (status: string) => {
    const normalized = status.toLowerCase();
    const tone = normalized.includes('risk') || normalized.includes('open')
      ? { color: tokenError.dark, bg: tokenError.softBg }
      : normalized.includes('recover') || normalized.includes('monitor') || normalized.includes('progress') || normalized.includes('scheduled')
        ? { color: tokenWarning.dark, bg: tokenWarning.softBg }
        : { color: tokenSuccess.darker, bg: tokenSuccess.softBg };
    return {
      height: 22,
      borderRadius: '999px',
      bgcolor: tone.bg,
      color: tone.color,
      border: `1px solid ${tokenDivider}`,
      fontWeight: 600,
      '& .MuiChip-label': { px: 0.85, fontSize: '0.68rem' },
    } as const;
  };

  const logbookEmptyTable = (message: string) => (
    <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
      <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>No rows match these filters.</Typography>
      <Typography sx={{ color: tokenText.secondary, fontSize: '0.8125rem', mt: 0.4 }}>{message}</Typography>
    </Paper>
  );

  const hourlyOutputTable = (
    <Box sx={{ display: 'grid', gap: 0.8 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '0.7fr 1.1fr 0.85fr 0.9fr 0.9fr 1.45fr', px: 1.2, mb: 0.1, gap: 1 }}>
        {['Hour', 'Line / area', 'Target', 'Produced', 'Variance', 'Status / owner'].map((label) => (
          <Typography key={label} sx={tableHeaderCellSx}>{label}</Typography>
        ))}
      </Box>
      {visibleHourlyOutputRows.map((row) => {
        const variance = row.produced - row.target;
        return (
          <Paper
            key={`${row.hour}-${row.line}`}
            elevation={0}
            sx={{
              p: 1.1,
              borderRadius: '8px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: 'background.paper',
              display: 'grid',
              gridTemplateColumns: '0.7fr 1.1fr 0.85fr 0.9fr 0.9fr 1.45fr',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography sx={{ ...tableNumberSx, color: tokenBrand.main }}>{row.hour}</Typography>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>{row.line}</Typography>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem' }}>{row.area} / {row.shift}</Typography>
            </Box>
            <Typography sx={tableNumberSx}>{row.target.toLocaleString()}</Typography>
            <Typography sx={tableNumberSx}>{row.produced.toLocaleString()}</Typography>
            <Typography sx={{ ...tableNumberSx, color: variance < 0 ? tokenError.main : tokenSuccess.darker }}>
              {variance >= 0 ? '+' : ''}{variance}
            </Typography>
            <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8 }}>
              <Box sx={{ minWidth: 0 }}>
                <Chip label={row.status} size="small" sx={getStaticStatusSx(row.status)} />
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', mt: 0.35 }} noWrap>{row.owner} - {row.constraint}</Typography>
              </Box>
              <MoreIcon sx={{ color: tokenText.secondary, fontSize: 18, flexShrink: 0 }} />
            </Box>
          </Paper>
        );
      })}
      {!visibleHourlyOutputRows.length ? logbookEmptyTable('Broaden the search or shift/area filters to see hourly production output.') : null}
    </Box>
  );

  const hourlyScrapTable = (
    <Box sx={{ display: 'grid', gap: 0.8 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '0.7fr 1.1fr 0.9fr 0.8fr 0.85fr 1.65fr', px: 1.2, mb: 0.1, gap: 1 }}>
        {['Hour', 'Line / area', 'Produced', 'Scrap qty', 'Scrap rate', 'Reason / status'].map((label) => (
          <Typography key={label} sx={tableHeaderCellSx}>{label}</Typography>
        ))}
      </Box>
      {visibleHourlyScrapRows.map((row) => {
        const rate = row.produced ? ((row.scrap / row.produced) * 100).toFixed(1) : '0.0';
        return (
          <Paper
            key={`${row.hour}-${row.line}-${row.reason}`}
            elevation={0}
            sx={{
              p: 1.1,
              borderRadius: '8px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: 'background.paper',
              display: 'grid',
              gridTemplateColumns: '0.7fr 1.1fr 0.9fr 0.8fr 0.85fr 1.65fr',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Typography sx={{ ...tableNumberSx, color: tokenBrand.main }}>{row.hour}</Typography>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>{row.line}</Typography>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem' }}>{row.area} / {row.shift}</Typography>
            </Box>
            <Typography sx={tableNumberSx}>{row.produced.toLocaleString()}</Typography>
            <Typography sx={{ ...tableNumberSx, color: row.scrap >= 18 ? tokenError.main : tokenWarning.dark }}>{row.scrap}</Typography>
            <Typography sx={{ ...tableNumberSx, color: Number(rate) >= 4 ? tokenError.main : tokenText.primary }}>{rate}%</Typography>
            <Box sx={{ minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8 }}>
              <Box sx={{ minWidth: 0 }}>
                <Chip label={row.status} size="small" sx={getStaticStatusSx(row.status)} />
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', mt: 0.35 }} noWrap>{row.reason} - {row.owner}</Typography>
              </Box>
              <MoreIcon sx={{ color: tokenText.secondary, fontSize: 18, flexShrink: 0 }} />
            </Box>
          </Paper>
        );
      })}
      {!visibleHourlyScrapRows.length ? logbookEmptyTable('Broaden the search or shift/area filters to see hourly scrap quantities.') : null}
    </Box>
  );

  const cilCenterlineTable = (
    <Box sx={{ display: 'grid', gap: 0.8 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '0.9fr 1.8fr 1.35fr 1.05fr 1.3fr', px: 1.2, mb: 0.1, gap: 1 }}>
        {['ID', 'Routine', 'Equipment / area', 'Schedule / owner', 'Status / action'].map((label) => (
          <Typography key={label} sx={tableHeaderCellSx}>{label}</Typography>
        ))}
      </Box>
      {visibleCilCenterlineRows.map((row) => (
        <Paper
          key={row.id}
          elevation={0}
          component="button"
          type="button"
          onClick={() => setSelectedCilLogRow(row)}
          sx={{
            appearance: 'none',
            p: 1.1,
            borderRadius: '8px',
            border: `1px solid ${tokenDivider}`,
            bgcolor: 'background.paper',
            display: 'grid',
            gridTemplateColumns: '0.9fr 1.8fr 1.35fr 1.05fr 1.3fr',
            alignItems: 'center',
            gap: 1,
            textAlign: 'left',
            cursor: 'pointer',
            transition: 'background-color 0.18s ease, border-color 0.18s ease',
            '&:hover': { borderColor: tokenBrand.main, bgcolor: tokenBrand.softBg },
            '&:focus-visible': { outline: `2px solid ${tokenBrand.main}`, outlineOffset: 2 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
            <Chip
              label={row.type}
              size="small"
              sx={{
                height: 22,
                borderRadius: '999px',
                bgcolor: row.type === 'CIL' ? tokenBrand.softBg : tokenWarning.softBg,
                color: row.type === 'CIL' ? tokenBrand.main : tokenWarning.dark,
                fontWeight: 700,
                border: `1px solid ${tokenDivider}`,
                '& .MuiChip-label': { px: 0.75, fontSize: '0.68rem' },
              }}
            />
            <Typography sx={{ ...tableNumberSx, color: tokenBrand.main }}>{row.id}</Typography>
          </Box>
          <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.25 }}>{row.task}</Typography>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: tokenText.primary, fontWeight: 600, fontSize: '0.84rem' }} noWrap>{row.equipment}</Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem' }}>{row.line} / {row.area}</Typography>
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>{row.scheduled}</Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem' }} noWrap>{row.owner}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8 }}>
            <Chip label={row.status} size="small" sx={getStaticStatusSx(row.status)} />
            <Button
              size="small"
              variant="outlined"
              startIcon={<NoteIcon sx={{ fontSize: 15 }} />}
              onClick={(event) => {
                event.stopPropagation();
                setSelectedCilLogRow(row);
              }}
              sx={{ ...shiftLogbookButtonSx, minWidth: 0, px: 0.9, fontSize: '0.72rem' }}
            >
              View log
            </Button>
          </Box>
        </Paper>
      ))}
      {!visibleCilCenterlineRows.length ? logbookEmptyTable('Broaden the search or routine filters to see CIL and Centerline work.') : null}
    </Box>
  );

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 1.5, md: 2 } }}>
      <Paper elevation={0} sx={{ borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', overflow: 'hidden' }}>
        <Box sx={{ px: 2, pt: 2, pb: 1.25 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, mb: 1.5 }}>
            <Typography variant="h6" sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '1.25rem', lineHeight: 1.6 }}>
              Shift Logbook
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                startIcon={<SparkleIcon sx={{ fontSize: 16 }} />}
                onClick={() => setIsShiftHandoverOpen(true)}
                variant="contained"
                sx={{ ...shiftLogbookContainedButtonSx, minHeight: 36, px: 1.5, fontSize: '0.8125rem' }}
              >
                Build Handover
              </Button>
              <IconButton size="small" sx={{ width: 34, height: 34, borderRadius: '8px', color: tokenText.secondary, '&:hover': { bgcolor: tokenBrand.softBg, color: tokenBrand.main } }}>
                <MoreIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          </Box>

        </Box>

        <Box sx={{ px: 2, pb: 1.25 }}>
          <Paper
            elevation={0}
            sx={{
              p: isLogbookAiPanelExpanded ? 2 : 1.25,
              borderRadius: '12px',
              border: 'none',
              bgcolor: tokenNeutral.lightest,
              overflow: 'visible',
              minHeight: isLogbookAiPanelExpanded ? 'auto' : 44,
              '@keyframes logbookAiPulse': { '0%': { opacity: 0.48 }, '50%': { opacity: 1 }, '100%': { opacity: 0.48 } },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, px: isLogbookAiPanelExpanded ? 1 : 0.75, minHeight: 24, mb: isLogbookAiPanelExpanded ? 2 : 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                <SparkleIcon sx={{ fontSize: 16, color: tokenWarning.dark }} />
                <Typography sx={{ color: tokenBrand.main, fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.1 }}>
                  BLU.AI analysis
                </Typography>
              </Box>
              <Button size="small" onClick={() => setIsLogbookAiPanelExpanded((current) => !current)} sx={shiftLogbookTextButtonSx}>
                {isLogbookAiPanelExpanded ? 'Collapse' : 'Expand'}
                {isLogbookAiPanelExpanded
                  ? <KeyboardArrowUpIcon sx={{ fontSize: 16, ml: 0.25 }} />
                  : <KeyboardArrowDownIcon sx={{ fontSize: 16, ml: 0.25 }} />}
              </Button>
            </Box>

            {isLogbookAiPanelExpanded && isLogbookAiInsightTyping ? (
              <Box sx={{ display: 'grid', gap: 0.55 }}>
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: '6px', border: `1px solid ${tokenDivider}`, bgcolor: 'rgba(0,0,0,0.03)' }}>
                  <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.75rem', mb: 0.55 }}>
                    BLU.AI is writing the scoped readout...
                  </Typography>
                  {[0, 1, 2].map((row) => (
                    <Box key={row} sx={{ height: row === 2 ? 18 : 22, width: row === 2 ? '72%' : '100%', borderRadius: '6px', bgcolor: tokenBrand.softBg, border: `1px solid ${tokenDivider}`, mb: row === 2 ? 0 : 0.45, animation: 'logbookAiPulse 1.2s ease-in-out infinite' }} />
                  ))}
                </Paper>
              </Box>
            ) : isLogbookAiPanelExpanded ? (
              <Box sx={{ display: 'grid', gap: 0.45 }}>
                {logbookAiPanelInsights.map((item) => (
                  <Box
                    key={item.title}
                    component={item.onClick ? 'button' : 'div'}
                    type={item.onClick ? 'button' : undefined}
                    onClick={item.onClick}
                    sx={{
                      appearance: 'none',
                      border: item.highlighted ? `1px solid ${tokenDivider}` : '1px solid transparent',
                      bgcolor: item.highlighted ? 'rgba(0,0,0,0.025)' : 'transparent',
                      borderRadius: '6px',
                      cursor: item.onClick ? 'pointer' : 'default',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      m: 0,
                      px: item.highlighted ? 1.25 : 1,
                      py: item.highlighted ? 0.85 : 0.5,
                      textAlign: 'left',
                      width: '100%',
                      '&:hover': item.onClick ? { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main } : undefined,
                    }}
                  >
                    {item.severity === 'high' ? (
                      <WarningIcon sx={{ fontSize: 16, color: tokenError.main, mt: 0.15, flexShrink: 0 }} />
                    ) : (
                      <ErrorOutlineIcon sx={{ fontSize: 16, color: tokenBrand.main, mt: 0.15, flexShrink: 0 }} />
                    )}
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.32, flex: 1, minWidth: 0 }}>
                      <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>{item.title}</Box>
                      {' '}- {item.detail}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ) : null}
          </Paper>
        </Box>

        <Box sx={{ px: 2, mb: 1.25 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, overflowX: 'auto', borderBottom: `1px solid ${tokenDivider}` }}>
            {topCategories.map((item) => {
              const isActive = shiftLogbookCategory === item.label;
              return (
                <Box
                  key={item.label}
                  component="button"
                  type="button"
                  onClick={() => setShiftLogbookCategory(item.label as any)}
                  sx={{
                    appearance: 'none',
                    border: 0,
                    bgcolor: 'transparent',
                    borderBottom: isActive ? `2px solid ${tokenBrand.main}` : '2px solid transparent',
                    color: isActive ? tokenText.primary : tokenText.secondary,
                    cursor: 'pointer',
                    flex: '0 0 auto',
                    font: 'inherit',
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 700 : 500,
                    lineHeight: 1.4,
                    m: 0,
                    px: 0,
                    py: 1.5,
                    textTransform: 'uppercase',
                    transition: 'color 0.2s ease, border-color 0.2s ease',
                    '&:hover': { color: tokenBrand.main },
                    '&:focus-visible': { outline: `2px solid ${tokenBrand.main}`, outlineOffset: 2, borderRadius: '6px' },
                  }}
                >
                  {item.label}
                </Box>
              );
            })}
          </Box>
        </Box>

        {shiftLogbookCategory === 'Dashboard' ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2.35fr 1fr' }, gap: 1, px: 2, pb: 2 }}>
            <Paper
              elevation={0}
              sx={{
                position: isDashboardFocusMode ? 'fixed' : 'relative',
                inset: isDashboardFocusMode ? '58px 14px 14px 14px' : 'auto',
                zIndex: isDashboardFocusMode ? 1200 : 'auto',
                minHeight: { xs: 420, md: 560, xl: 620 },
                height: isDashboardFocusMode ? 'auto' : undefined,
                aspectRatio: isDashboardFocusMode ? 'auto' : { xs: 'auto', md: '940 / 617' },
                borderRadius: 1.8,
                border: '1px solid #CFE0F8',
                // Context cards can intentionally extend past the scene edge. Keeping
                // this visible prevents lower-level hover details from being clipped.
                overflow: 'visible',
                backgroundColor: isEquipmentFocusMode ? '#F8FAFC' : '#EAF3FF',
                backgroundImage: isEquipmentFocusMode
                  ? 'radial-gradient(circle at 50% 22%, rgba(47,107,255,0.14), transparent 34%), linear-gradient(180deg, #FFFFFF 0%, #EFF5FF 100%)'
                  : drillConfig.background,
                backgroundSize: 'cover',
                backgroundPosition: 'center center',
                backgroundRepeat: 'no-repeat',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.35)',
                '@keyframes logbookHotspotPulse': {
                  '0%': { opacity: 0.5, boxShadow: '0 0 0 0 rgba(239,68,68,0.28), 0 0 18px rgba(239,68,68,0.22)' },
                  '55%': { opacity: 0.76, boxShadow: '0 0 0 10px rgba(239,68,68,0), 0 0 28px rgba(239,68,68,0.34)' },
                  '100%': { opacity: 0.5, boxShadow: '0 0 0 0 rgba(239,68,68,0), 0 0 18px rgba(239,68,68,0.22)' },
                },
              }}
              onMouseLeave={() => setHoveredDrillTarget(null)}
            >
              <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(4,16,38,0.02)' }} />

              {isEquipmentFocusMode ? (
                <EquipmentFocusScene
                  onSelectPart={(part) => setSelectedDashboardTarget(part)}
                />
              ) : (
                <Box
                  sx={{
                    position: 'absolute',
                    top: drillConfig.pulse.top,
                    left: drillConfig.pulse.left,
                    width: drillConfig.pulse.width,
                    height: drillConfig.pulse.height,
                    borderRadius: drillConfig.pulse.radius ?? 1.2,
                    transform: drillConfig.pulse.rotate ? `rotate(${drillConfig.pulse.rotate})` : 'none',
                    transformOrigin: 'center',
                    bgcolor: 'rgba(239,68,68,0.10)',
                    border: '2px solid rgba(239,68,68,0.28)',
                    animation: 'logbookHotspotPulse 1.8s ease-in-out infinite',
                    pointerEvents: 'none',
                    zIndex: 1,
                  }}
                />
              )}

              <Paper
                elevation={0}
                sx={{
                  position: 'absolute',
                  left: 20,
                  top: 18,
                  zIndex: 4,
                  width: 'fit-content',
                  maxWidth: 'calc(100% - 152px)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.55,
                  px: 1.1,
                  py: 0.75,
                  borderRadius: 1.2,
                  bgcolor: '#071122',
                  color: '#FFFFFF',
                  boxShadow: '0 10px 24px rgba(3,10,28,0.34)',
                }}
              >
                {drillConfig.breadcrumb.map((crumb, index) => {
                  const isLast = index === drillConfig.breadcrumb.length - 1;
                  return (
                    <React.Fragment key={crumb}>
                      {index > 0 ? <Typography sx={{ color: '#9FB0CD', fontSize: '0.76rem' }}>/</Typography> : null}
                      <Button
                        size="small"
                        disabled={isLast}
                        onClick={() => setDashboardLevelByIndex(index)}
                        sx={{
                          minWidth: 0,
                          p: 0,
                          color: '#FFFFFF',
                          fontSize: isLast ? '0.86rem' : '0.75rem',
                          fontWeight: isLast ? 900 : 600,
                          textTransform: 'none',
                          '&.Mui-disabled': { color: '#FFFFFF' },
                        }}
                      >
                        {crumb}
                      </Button>
                    </React.Fragment>
                  );
                })}
              </Paper>

              <Button
                size="small"
                startIcon={<FocusIcon sx={{ fontSize: 15 }} />}
                onClick={() => setIsDashboardFocusMode((value) => !value)}
                sx={{
                  position: 'absolute',
                  top: 22,
                  right: 24,
                  zIndex: 8,
                  px: 1.2,
                  py: 0.72,
                  borderRadius: 1.2,
                  bgcolor: isDashboardFocusMode ? '#FFFFFF' : '#071122',
                  color: isDashboardFocusMode ? '#173A8F' : '#FFFFFF',
                  border: isDashboardFocusMode ? '1px solid rgba(47,107,255,0.24)' : '1px solid rgba(255,255,255,0.16)',
                  boxShadow: '0 10px 24px rgba(3,10,28,0.34)',
                  textTransform: 'none',
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  '&:hover': { bgcolor: isDashboardFocusMode ? '#F3F7FF' : '#0E1F48' },
                  '& .MuiButton-startIcon': { mr: 0.45 },
                }}
              >
                {isDashboardFocusMode ? 'Exit Focus' : 'Focus Mode'}
              </Button>

              {dashboardDrillLevel !== 'plant' ? (
                <Button
                  size="small"
                  onClick={drillUpOneLevel}
                  sx={{
                    position: 'absolute',
                    left: 20,
                    bottom: 18,
                    zIndex: 5,
                    borderRadius: 999,
                    px: 1.2,
                    py: 0.55,
                    bgcolor: 'rgba(7,17,34,0.88)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255,255,255,0.18)',
                    textTransform: 'none',
                    fontWeight: 800,
                    '&:hover': { bgcolor: '#071122' },
                  }}
                >
                  Drill up
                </Button>
              ) : null}

              {isEquipmentFocusAvailable ? (
                <Button
                  size="small"
                  startIcon={isEquipmentFocusMode ? <DashboardIcon sx={{ fontSize: 15 }} /> : <ViewInArIcon sx={{ fontSize: 16 }} />}
                  onClick={() => setIsEquipmentFocusMode((value) => !value)}
                  sx={{
                    position: 'absolute',
                    right: 24,
                    bottom: 18,
                    zIndex: 7,
                    borderRadius: 999,
                    px: 1.25,
                    py: 0.58,
                    bgcolor: isEquipmentFocusMode ? '#FFFFFF' : '#071122',
                    color: isEquipmentFocusMode ? '#173A8F' : '#FFFFFF',
                    border: isEquipmentFocusMode ? '1px solid rgba(47,107,255,0.24)' : '1px solid rgba(255,255,255,0.18)',
                    boxShadow: '0 10px 24px rgba(3,10,28,0.24)',
                    textTransform: 'none',
                    fontWeight: 900,
                    '&:hover': { bgcolor: isEquipmentFocusMode ? '#F3F7FF' : '#0E1F48' },
                    '& .MuiButton-startIcon': { mr: 0.45 },
                  }}
                >
                  {isEquipmentFocusMode ? 'Photo Map' : 'Equipment Views'}
                </Button>
              ) : null}

              {!isEquipmentFocusMode && drillConfig.targets.map((target) => {
                const isHovered = hoveredDrillTarget === target.label;
                return (
                  <Button
                    key={target.label}
                    aria-label={`${target.label}${target.next ? ` ${drillConfig.nextLabel}` : ''}`}
                    onClick={() => drillDownTo(target)}
                    onMouseEnter={() => setHoveredDrillTarget(target.label)}
                    sx={{
                      position: 'absolute',
                      zIndex: 6,
                      top: target.top,
                      left: target.left,
                      width: target.width,
                      height: target.height,
                      minWidth: 0,
                      px: 1,
                      py: 0.45,
                      borderRadius: 1.25,
                      bgcolor: isHovered ? '#0E1F48' : 'rgba(8,28,67,0.93)',
                      color: '#FFFFFF',
                      border: `1px solid ${target.attention ? '#EF4444' : '#78A7EC'}`,
                      boxShadow: isHovered
                        ? '0 10px 22px rgba(3,15,39,0.38), 0 0 0 3px rgba(59,130,246,0.18)'
                        : '0 6px 14px rgba(3,15,39,0.26)',
                      cursor: target.next ? 'pointer' : 'default',
                      transition: 'all 0.18s ease',
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#0E1F48',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0 }}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: 99,
                          flex: '0 0 auto',
                          bgcolor: target.attention ? '#EF4444' : '#22C55E',
                          boxShadow: '0 0 0 4px rgba(255,255,255,0.08)',
                        }}
                      />
                      <Typography sx={{ fontWeight: 900, fontSize: '0.74rem', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {target.label}
                      </Typography>
                    </Box>
                  </Button>
                );
              })}
              {!isEquipmentFocusMode && hoveredDashboardTarget && hoverDashboardContext ? (
                <Paper
                  elevation={0}
                  onMouseEnter={() => setHoveredDrillTarget(hoveredDashboardTarget.label)}
                  sx={{
                    position: 'absolute',
                    zIndex: 8,
                    top: parseFloat(hoveredDashboardTarget.top) >= 48 ? '12px' : `calc(${hoveredDashboardTarget.top} + 42px)`,
                    bottom: 'auto',
                    left: parseFloat(hoveredDashboardTarget.top) >= 48
                      ? (parseFloat(hoveredDashboardTarget.left) > 45 ? 'auto' : `calc(${hoveredDashboardTarget.left} + ${hoveredDashboardTarget.width} + 12px)`)
                      : (parseFloat(hoveredDashboardTarget.left) > 58 ? 'auto' : hoveredDashboardTarget.left),
                    right: parseFloat(hoveredDashboardTarget.top) >= 48
                      ? (parseFloat(hoveredDashboardTarget.left) > 45 ? `calc(100% - ${hoveredDashboardTarget.left} + 12px)` : 'auto')
                      : (parseFloat(hoveredDashboardTarget.left) > 58 ? 16 : 'auto'),
                    width: { xs: 330, md: 438 },
                    maxWidth: 'calc(100% - 32px)',
                    maxHeight: 'none',
                    borderRadius: '12px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: 'background.paper',
                    boxShadow: '0 12px 28px rgba(0,31,155,0.16)',
                    overflowY: 'visible',
                    overflowX: 'hidden',
                  }}
                >
                  <Box sx={{ height: 2, bgcolor: hoveredDashboardTarget.attention ? tokenError.main : tokenBrand.main }} />
                  <Box sx={{ px: 1.05, py: 0.9, display: 'flex', alignItems: 'center', gap: 0.75, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '6px',
                        display: 'grid',
                        placeItems: 'center',
                        color: hoveredDashboardTarget.attention ? tokenError.main : tokenBrand.main,
                        bgcolor: hoveredDashboardTarget.attention ? tokenError.softBg : tokenBrand.softBg,
                        border: `1px solid ${tokenDivider}`,
                      }}
                    >
                      {hoveredDashboardTarget.attention ? <WarningIcon sx={{ fontSize: 18 }} /> : <DashboardIcon sx={{ fontSize: 18 }} />}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.86rem', lineHeight: 1.12 }} noWrap>
                        {hoverDashboardContext.badge}
                      </Typography>
                      <Typography sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.6rem', mt: 0.18 }} noWrap>
                        Live operational context • click rows to open logbook
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      {hoverDashboardContext.tags.map((tag) => (
                        <Chip
                          key={tag.label}
                          label={tag.label}
                          size="small"
                          sx={{
                            height: 18,
                            bgcolor: tag.bg,
                            color: tag.tone,
                            fontWeight: 500,
                            borderRadius: '6px',
                            border: `1px solid ${tokenDivider}`,
                            '& .MuiChip-label': { px: 0.55, fontSize: '0.5rem', letterSpacing: 0 },
                          }}
                        />
                      ))}
                      <IconButton size="small" sx={{ width: 24, height: 24, color: tokenText.secondary, ml: 0.1, '&:hover': { bgcolor: tokenBrand.softBg, color: tokenBrand.main } }}>
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Box sx={{ p: 0.9, display: 'flex', flexDirection: 'column', gap: 0.65, bgcolor: tokenNeutral.lightest }}>
                    <Box
                      sx={{
                        p: 0.8,
                        borderRadius: '8px',
                        border: `1px solid ${tokenDivider}`,
                        borderLeft: `3px solid ${hoveredDashboardTarget.attention ? tokenError.main : tokenBrand.main}`,
                        bgcolor: 'background.paper',
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) auto',
                        gap: 1,
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.56rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.6 }}>
                          Primary context
                        </Typography>
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700, mt: 0.2 }} noWrap>
                          {hoverDashboardRows[0]?.label ?? 'Operational focus'} • {hoverDashboardRows[0]?.detail ?? hoverDashboardContext.order}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          px: 0.75,
                          py: 0.32,
                          borderRadius: '6px',
                          bgcolor: hoveredDashboardTarget.attention ? tokenError.softBg : tokenBrand.softBg,
                          color: hoveredDashboardTarget.attention ? tokenError.dark : tokenBrand.main,
                          border: `1px solid ${tokenDivider}`,
                          fontSize: '0.56rem',
                          fontWeight: 500,
                        }}
                      >
                        {hoveredDashboardTarget.attention ? 'Needs action' : 'Monitoring'}
                      </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.48 }}>
                      {hoverDashboardCards.map(([label, value]) => (
                        <Box
                          key={label}
                          sx={{
                            minWidth: 0,
                            p: 0.58,
                            borderRadius: '8px',
                            border: `1px solid ${tokenDivider}`,
                            bgcolor: 'background.paper',
                          }}
                        >
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.5rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.35 }}>{label}</Typography>
                          <Typography sx={{ color: tokenText.primary, fontSize: '0.67rem', fontWeight: 700, mt: 0.24, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 0.48 }}>
                      {hoverDashboardContext.metrics.map((metric) => (
                        <Box
                          key={metric.label}
                          sx={{
                            minWidth: 0,
                            p: 0.58,
                            borderRadius: '8px',
                            border: `1px solid ${tokenDivider}`,
                            bgcolor: 'background.paper',
                            position: 'relative',
                            overflow: 'hidden',
                            '&:before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: 2,
                              height: '100%',
                              bgcolor: metric.tone ?? tokenBrand.main,
                              opacity: metric.tone ? 0.78 : 0.48,
                            },
                          }}
                        >
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.49rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.35, pl: 0.25 }} noWrap>{metric.label}</Typography>
                          <Typography sx={{ color: metric.tone ?? tokenText.primary, fontSize: '0.88rem', fontWeight: 700, lineHeight: 1.12, mt: 0.22, pl: 0.25 }}>
                            {metric.value}
                          </Typography>
                          {metric.label.includes('OEE') ? (
                            <LinearProgress variant="determinate" value={68} sx={{ height: 4, borderRadius: 99, mt: 0.55, bgcolor: tokenNeutral.main, '& .MuiLinearProgress-bar': { bgcolor: tokenBrand.main } }} />
                          ) : null}
                        </Box>
                      ))}
                    </Box>

                    <Box sx={{ border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', borderRadius: '8px', overflow: 'hidden' }}>
                      <Box sx={{ px: 0.8, py: 0.56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 700 }}>Open work & records</Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.55rem', fontWeight: 500 }}>{hoverDashboardRows.length} linked</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        {hoverDashboardRows.map((row) => {
                          const canCreate = row.logbookCategory === 'Maintenance Request'
                            || row.logbookCategory === 'Maintenance Work Order'
                            || row.logbookCategory === 'ESO';
                          const rowTone = row.tone
                            ?? (row.label.includes('Event') ? '#044ED7' : row.label.includes('ESO') ? '#7C3AED' : row.label.includes('Request') ? '#F97316' : '#1F2366');
                          const RowIcon = row.label.includes('Event')
                            ? ErrorOutlineIcon
                            : row.label.includes('ESO')
                              ? EsoIcon
                              : row.label.includes('Request')
                                ? MaintenanceIcon
                                : row.label.includes('Document')
                                  ? NoteIcon
                                  : WorkOrderIcon;

                          return (
                            <Button
                              key={row.label}
                              onClick={(event) => {
                                event.stopPropagation();
                                openDashboardLogbookCategory(row.logbookCategory, hoveredDashboardTarget.label);
                              }}
                              sx={{
                                minHeight: 40,
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                                borderRadius: 0,
                                border: 0,
                                borderBottom: `1px solid ${tokenDivider}`,
                                borderLeft: `2px solid ${rowTone}99`,
                                bgcolor: 'background.paper',
                                px: 0.75,
                                py: 0.48,
                                color: tokenText.primary,
                                textTransform: 'none',
                                overflow: 'hidden',
                                '&:hover': {
                                  bgcolor: `${rowTone}08`,
                                  '& .dashboard-row-new': {
                                    opacity: 1,
                                    pointerEvents: 'auto',
                                    transform: 'translateX(0)',
                                  },
                                },
                                '&:last-of-type': { borderBottom: 0 },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0, width: '100%' }}>
                                <Box
                                  sx={{
                                    width: 23,
                                    height: 23,
                                    borderRadius: '6px',
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: `${rowTone}0D`,
                                    color: rowTone,
                                    border: `1px solid ${tokenDivider}`,
                                    flex: '0 0 auto',
                                  }}
                                >
                                  <RowIcon sx={{ fontSize: 14 }} />
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1, textAlign: 'left', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', columnGap: 0.75, alignItems: 'baseline' }}>
                                  <Typography sx={{ color: tokenText.primary, fontSize: '0.67rem', fontWeight: 700, lineHeight: 1.08 }} noWrap>
                                    {row.label}
                                    {row.label.includes('Work Orders') || row.label.startsWith('WO-') ? <SapBadge compact /> : null}
                                  </Typography>
                                  {row.status ? (
                                    <Box
                                      sx={{
                                        px: 0.55,
                                        py: 0.15,
                                        borderRadius: '6px',
                                        bgcolor: `${rowTone}0F`,
                                        color: rowTone,
                                        border: `1px solid ${tokenDivider}`,
                                        fontSize: '0.49rem',
                                        fontWeight: 500,
                                        lineHeight: 1.2,
                                      }}
                                    >
                                      {row.status}
                                    </Box>
                                  ) : null}
                                  <Typography sx={{ gridColumn: '1 / -1', color: tokenText.secondary, fontSize: '0.55rem', fontWeight: 400, mt: 0.18, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {row.detail}
                                  </Typography>
                                </Box>
                                {canCreate ? (
                                  <Box
                                    component="span"
                                    className="dashboard-row-new"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      openNewDashboardRecord(row.logbookCategory, hoveredDashboardTarget.label);
                                    }}
                                    sx={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.25,
                                      height: 24,
                                      px: 0.72,
                                      borderRadius: '6px',
                                      border: `1px solid ${tokenDivider}`,
                                      bgcolor: 'background.paper',
                                      color: tokenBrand.main,
                                      fontWeight: 700,
                                      fontSize: '0.58rem',
                                      lineHeight: 1,
                                      opacity: 0,
                                      pointerEvents: 'none',
                                      transform: 'translateX(4px)',
                                      transition: 'opacity 0.14s ease, transform 0.14s ease, background-color 0.14s ease',
                                      flex: '0 0 auto',
                                      '&:hover': {
                                        bgcolor: tokenBrand.softBg,
                                        borderColor: tokenBrand.main,
                                      },
                                    }}
                                  >
                                    <AddIcon sx={{ fontSize: 14 }} />
                                    New
                                  </Box>
                                ) : null}
                                <ChevronRightIcon sx={{ color: tokenText.secondary, fontSize: 16, flex: '0 0 auto' }} />
                              </Box>
                            </Button>
                          );
                        })}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 0.75,
                        position: 'sticky',
                        zIndex: 1,
                        bottom: 0,
                        mx: -0.9,
                        mb: -0.9,
                        px: 0.9,
                        py: 0.75,
                        borderTop: `1px solid ${tokenDivider}`,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Button
                        onClick={(event) => {
                          event.stopPropagation();
                          openBluAiAssistantForHover(hoveredDashboardTarget.label, hoverDashboardContext);
                        }}
                        startIcon={<SparkleIcon sx={{ fontSize: 16 }} />}
                        sx={{
                          minHeight: 32,
                          borderRadius: '8px',
                          bgcolor: tokenBrand.main,
                          color: tokenBrand.contrast,
                          fontWeight: 700,
                          textTransform: 'none',
                          px: 1.1,
                          py: 0.48,
                          boxShadow: 'none',
                          '&:hover': {
                            bgcolor: tokenBrand.dark,
                            boxShadow: 'none',
                          },
                          '& .MuiButton-startIcon': { mr: 0.45 },
                        }}
                      >
                        Ask BLU.AI
                      </Button>
                    </Box>

                  </Box>
                </Paper>
              ) : null}

            </Paper>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              <Paper elevation={0} sx={{ ...shiftLogbookCompactCardSx, overflow: 'hidden' }}>
                <Box sx={{ px: 1.15, py: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.2 }}>
                    <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.98rem' }}>{dashboardContext.overviewTitle}</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontWeight: 500, fontSize: '0.66rem' }}>{dashboardContext.code}</Typography>
                    <Chip
                      size="small"
                      label={selectedDashboardLabel}
                      sx={{ height: 20, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontWeight: 500, '& .MuiChip-label': { px: 0.75, fontSize: '0.62rem' } }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                    <PinIcon sx={{ color: tokenBrand.main, fontSize: 14, transform: 'rotate(35deg)' }} />
                    <Divider orientation="vertical" flexItem sx={{ borderColor: tokenDivider }} />
                    <MoreIcon sx={{ color: tokenText.secondary, fontSize: 16 }} />
                  </Box>
                </Box>

                <Box sx={{ p: 1.05 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.65 }}>
                    <Typography sx={shiftLogbookSectionTitleSx}>Event Log</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
                      <Chip
                        size="small"
                        label="Live"
                        sx={{
                          height: 18,
                          bgcolor: tokenSuccess.softBg,
                          color: tokenSuccess.darker,
                          fontWeight: 500,
                          border: `1px solid ${tokenDivider}`,
                          '& .MuiChip-label': { px: 0.75, fontSize: '0.62rem' },
                        }}
                      />
                      <Button size="small" sx={{ minWidth: 0, p: 0, color: tokenBrand.main, fontWeight: 700, fontSize: '0.68rem', textTransform: 'none' }}>
                        View all
                      </Button>
                    </Box>
                  </Box>

                  <Box sx={{ maxHeight: 198, overflowY: 'auto', pr: 0.35, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {dashboardContext.events.map((event) => (
                      <Box
                        key={event.title}
                        onClick={() => openDashboardLogbookCategory(event.logbookCategory, event.title)}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: '22px 1fr 16px',
                          alignItems: 'center',
                          gap: 0.65,
                          p: 0.72,
                          borderRadius: '8px',
                          border: `1px solid ${tokenDivider}`,
                          bgcolor: event.critical ? tokenError.softBg : 'background.paper',
                          cursor: 'pointer',
                          transition: 'background-color 0.16s ease, border-color 0.16s ease',
                          '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main },
                        }}
                      >
                        {event.critical ? (
                          <ErrorOutlineIcon sx={{ color: event.tone, fontSize: 17 }} />
                        ) : (
                          <CheckCircleOutlineIcon sx={{ color: event.tone, fontSize: 17 }} />
                        )}
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', lineHeight: 1.1 }}>
                            {event.category} • {event.age}
                          </Typography>
                          <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.72rem', lineHeight: 1.22, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.title}
                          </Typography>
                        </Box>
                        <ChevronRightIcon sx={{ color: tokenText.secondary, fontSize: 16 }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ ...shiftLogbookCompactCardSx, p: 0.95 }}>
                <Typography sx={{ ...shiftLogbookSectionTitleSx, mb: 0.65 }}>Top Impacts</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.65 }}>
                  {dashboardContext.impacts.map((impact) => (
                    <Box
                      key={impact.label}
                      sx={{
                        minHeight: 64,
                        p: 0.75,
                        borderRadius: '8px',
                        border: `1px solid ${tokenDivider}`,
                        bgcolor: 'background.paper',
                        borderLeft: `4px solid ${impact.tone}`,
                      }}
                    >
                      <Typography sx={{ color: impact.tone, fontWeight: 700, fontSize: '1.26rem', lineHeight: 1 }}>{impact.value}</Typography>
                      <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.64rem', mt: 0.3, lineHeight: 1.05 }}>{impact.label}</Typography>
                      <Typography sx={{ color: tokenText.secondary, fontSize: '0.58rem', lineHeight: 1.1 }}>{impact.helper}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ ...shiftLogbookCompactCardSx, p: 0.95 }}>
                <Typography sx={{ ...shiftLogbookSectionTitleSx, mb: 0.65 }}>Live Context</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
                  {dashboardContext.workItems.map((item) => (
                    <Button
                      key={item.label}
                      fullWidth
                      onClick={() => openDashboardLogbookCategory(item.logbookCategory, item.label)}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        alignItems: 'center',
                        textAlign: 'left',
                        borderRadius: '8px',
                        border: `1px solid ${tokenDivider}`,
                        bgcolor: 'background.paper',
                        px: 0.8,
                        py: 0.65,
                        textTransform: 'none',
                        '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main },
                      }}
                    >
                      <Box sx={{ minWidth: 0, borderLeft: `3px solid ${item.tone}`, pl: 0.65 }}>
                        <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.7rem', lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.label}
                          {item.label.includes('Work Orders') || item.label.startsWith('WO-') ? <SapBadge compact /> : null}
                        </Typography>
                        <Typography sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.62rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.detail}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                        {item.status ? (
                          <Chip
                            size="small"
                            label={item.status}
                            sx={{ height: 18, bgcolor: `${item.tone}14`, color: item.tone, border: `1px solid ${tokenDivider}`, fontWeight: 500, '& .MuiChip-label': { px: 0.55, fontSize: '0.55rem' } }}
                          />
                        ) : null}
                        <ChevronRightIcon sx={{ color: tokenText.secondary, fontSize: 16 }} />
                      </Box>
                    </Button>
                  ))}
                  <Button
                    fullWidth
                    onClick={() => openDashboardLogbookCategory('ESO', dashboardContext.events[0]?.title ?? selectedDashboardLabel)}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      alignItems: 'center',
                      textAlign: 'left',
                      borderRadius: '8px',
                      border: `1px solid ${tokenDivider}`,
                      bgcolor: 'background.paper',
                      px: 0.8,
                      py: 0.65,
                      textTransform: 'none',
                      '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main },
                    }}
                  >
                    <Box sx={{ minWidth: 0, borderLeft: `3px solid ${tokenBrand.main}`, pl: 0.65 }}>
                      <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.7rem', lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Events / Incidents
                      </Typography>
                      <Typography sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.62rem', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {dashboardContext.events.length} active • latest {dashboardContext.events[0]?.age ?? 'now'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                      <Chip
                        size="small"
                        label="Events"
                        sx={{ height: 18, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontWeight: 500, '& .MuiChip-label': { px: 0.55, fontSize: '0.55rem' } }}
                      />
                      <ChevronRightIcon sx={{ color: tokenText.secondary, fontSize: 16 }} />
                    </Box>
                  </Button>
                </Box>
              </Paper>

              {(dashboardDrillLevel === 'zone' || dashboardDrillLevel === 'machine') && dashboardSpareParts.length > 0 ? (
                <Paper elevation={0} sx={{ ...shiftLogbookCompactCardSx, p: 0.95 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 0.8, mb: 0.7 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0 }}>
                      <Box sx={{ width: 22, height: 22, borderRadius: '6px', display: 'grid', placeItems: 'center', bgcolor: tokenBrand.softBg, color: tokenBrand.main, flexShrink: 0 }}>
                        <SparePartsIcon sx={{ fontSize: 14 }} />
                      </Box>
                      <Typography sx={shiftLogbookSectionTitleSx}>
                        Spare Parts
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, flexShrink: 0 }}>
                      <Button
                        size="small"
                        onClick={() => onOpenSparePartsManagement?.('Filling System')}
                        sx={{ minWidth: 0, p: 0, color: tokenBrand.main, fontWeight: 700, fontSize: '0.68rem', textTransform: 'none' }}
                      >
                        View all
                      </Button>
                      {dashboardSparePartAlerts > 0 ? (
                        <Chip
                          size="small"
                          label={`${dashboardSparePartAlerts} alerts`}
                          sx={{ height: 18, bgcolor: tokenWarning.lightest, color: tokenWarning.dark, border: `1px solid ${tokenDivider}`, fontWeight: 500, '& .MuiChip-label': { px: 0.55, fontSize: '0.55rem' } }}
                        />
                      ) : null}
                      <Chip
                        size="small"
                        label={`${dashboardSpareParts.length} components`}
                        sx={{ height: 18, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontWeight: 500, '& .MuiChip-label': { px: 0.55, fontSize: '0.55rem' } }}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.55 }}>
                    {dashboardSpareParts.map((part) => {
                      const status = getZoneSparePartStatus(part);
                      const availableStock = getZoneSparePartAvailableStock(part);

                      return (
                        <Tooltip
                          key={part.id}
                          arrow
                          placement="left"
                          enterDelay={220}
                          title={(
                            <Box sx={{ width: 238 }}>
                              {part.photoSrc ? (
                              <Box component="img" src={part.photoSrc} alt="" sx={{ width: '100%', height: 118, objectFit: 'cover', borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, mb: 0.75 }} />
                              ) : null}
                              <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.82rem', lineHeight: 1.15 }}>
                                {part.name}
                              </Typography>
                              <Typography sx={{ color: tokenText.secondary, fontWeight: 500, fontSize: '0.62rem', mt: 0.25 }}>
                                {part.sapNumber} • {part.category}
                              </Typography>
                              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.45, mt: 0.75 }}>
                                {[
                                  ['Avail', String(availableStock)],
                                  ['Safety', String(part.safetyStock)],
                                  ['Bin', part.binLocation],
                                ].map(([label, value]) => (
                                  <Box key={label} sx={{ minWidth: 0, p: 0.45, borderRadius: '6px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                                    <Typography sx={{ color: tokenText.secondary, fontWeight: 500, fontSize: '0.48rem', textTransform: 'uppercase' }} noWrap>
                                      {label}
                                    </Typography>
                                    <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.62rem', mt: 0.15 }} noWrap>
                                      {value}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                              <Typography sx={{ color: status.tone, fontWeight: 900, fontSize: '0.6rem', mt: 0.65 }}>
                                {status.label === 'Ready' ? 'Stock ready for this scope' : 'Replenishment attention needed'}
                              </Typography>
                            </Box>
                          )}
                          slotProps={{
                            tooltip: {
                              sx: {
                                bgcolor: tokenCommon.white,
                                color: tokenText.primary,
                                border: `1px solid ${tokenDivider}`,
                                boxShadow: '0 16px 38px rgba(15,23,42,0.18)',
                                p: 0.75,
                                maxWidth: 270,
                              },
                            },
                            arrow: {
                              sx: {
                                color: tokenCommon.white,
                                '&:before': {
                                  border: `1px solid ${tokenDivider}`,
                                },
                              },
                            },
                          }}
                        >
                          <Button
                            fullWidth
                            onClick={() => {
                              closeLegacyMaintenanceDrawers();
                              setSelectedMaintenanceRequestCard(null);
                              closeMaintenanceWorkOrderDrawer();
                              setSelectedEsoReport(null);
                              setSelectedSparePartsInventoryPart(part);
                            }}
                            sx={{
                              minWidth: 0,
                              p: 0.6,
                              borderRadius: '8px',
                              border: `1px solid ${tokenDivider}`,
                              bgcolor: 'background.paper',
                              display: 'grid',
                              gridTemplateColumns: '28px 1fr',
                              columnGap: 0.55,
                              alignItems: 'center',
                              textAlign: 'left',
                              textTransform: 'none',
                              '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main },
                            }}
                          >
                            {part.photoSrc ? (
                              <Box component="img" src={part.photoSrc} alt="" sx={{ width: 28, height: 28, borderRadius: '6px', objectFit: 'cover', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }} />
                            ) : (
                              <Box sx={{ width: 28, height: 28, borderRadius: '6px', display: 'grid', placeItems: 'center', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, color: tokenBrand.main }}>
                                {part.icon}
                              </Box>
                            )}
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.64rem', lineHeight: 1.12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {part.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, mt: 0.25, minWidth: 0 }}>
                                <Typography sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.56rem', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                                  {part.sapNumber} • Bin {part.binLocation}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.4, mt: 0.35 }}>
                                <Typography sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.56rem', lineHeight: 1 }}>
                                  {availableStock} available
                                </Typography>
                                <Chip
                                  size="small"
                                  label={status.label}
                                  sx={{ height: 16, bgcolor: status.bg, color: status.tone, border: `1px solid ${status.border}`, fontWeight: 900, '& .MuiChip-label': { px: 0.45, fontSize: '0.5rem' } }}
                                />
                              </Box>
                            </Box>
                          </Button>
                        </Tooltip>
                      );
                    })}
                  </Box>
                </Paper>
              ) : null}

              <Paper elevation={0} sx={{ ...shiftLogbookCompactCardSx, p: 0.95 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.7 }}>
                  <Typography sx={shiftLogbookSectionTitleSx}>Documents</Typography>
                  <Button
                    size="small"
                    onClick={onOpenDocumentManagement}
                    sx={{ minWidth: 0, p: 0, color: tokenBrand.main, fontWeight: 700, fontSize: '0.68rem', textTransform: 'none' }}
                  >
                    View all
                  </Button>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 0.55 }}>
                  {dashboardContext.documents.map((document) => (
                    <Box
                      key={document.title}
                      onClick={() => openDashboardLogbookCategory('All', document.title)}
                      sx={{
                        minWidth: 0,
                        p: 0.6,
                        borderRadius: '8px',
                        border: `1px solid ${tokenDivider}`,
                        bgcolor: 'background.paper',
                        display: 'grid',
                        gridTemplateColumns: '16px 1fr',
                        columnGap: 0.45,
                        alignItems: 'start',
                        cursor: 'pointer',
                        transition: 'background-color 0.16s ease, border-color 0.16s ease',
                        '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main },
                      }}
                    >
                      {document.type === 'pdf' ? (
                        <PdfIcon sx={{ color: '#EF4444', fontSize: 16, mt: 0.1 }} />
                      ) : (
                        <SpreadsheetIcon sx={{ color: '#16A34A', fontSize: 16, mt: 0.1 }} />
                      )}
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.62rem', lineHeight: 1.15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {document.title}
                        </Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.55rem', lineHeight: 1.2, mt: 0.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {document.meta}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Paper>
              {logbookContextWriter}
            </Box>
          </Box>
        ) : (
          <Box sx={{ px: 2, pb: 2 }}>
          <Grid container spacing={1.5}>

          <Grid size={{ xs: 12, lg: 9.6 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: `minmax(260px, 2fr) repeat(${logbookFilterConfigs.length}, minmax(150px, 1fr))` }, gap: 1, mb: 1.1 }}>
              <TextField
                size="small"
                label="Search"
                placeholder="ID, title, assignee, area..."
                value={shiftLogbookSearch}
                onChange={(e) => setShiftLogbookSearch(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon sx={{ color: tokenBrand.main }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.paper' } }}
              />

              {logbookFilterConfigs.map((config, index) => {
                const selectedValue = shiftLogbookFilters[config.key] ?? 'All';
                return (
                  <FormControl key={config.key} size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px', bgcolor: 'background.paper' } }}>
                    <Select
                      value={selectedValue}
                      onChange={(event) => {
                        const value = String(event.target.value);
                        setShiftLogbookFilters((current: any) => ({
                          ...current,
                          [config.key]: value,
                          ...(config.key === 'area' ? { zone: value.startsWith('Zone') ? value : 'All' } : {}),
                        }));
                      }}
                      displayEmpty
                      startAdornment={index === 0 ? <FilterIcon sx={{ color: tokenText.secondary, mr: 0.5, fontSize: 17 }} /> : undefined}
                      renderValue={(value) => (
                        <Box component="span" sx={{ color: value === 'All' ? tokenText.secondary : tokenText.primary, fontSize: '0.875rem' }}>
                          <Box component="span" sx={{ color: tokenText.secondary }}>{config.label}: </Box>
                          {value === 'All' ? config.allLabel : String(value)}
                        </Box>
                      )}
                    >
                      <MenuItem value="All">{config.allLabel}</MenuItem>
                      {config.options.map((option) => (
                        <MenuItem key={`${config.key}-${option}`} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              })}
            </Box>

            {effectiveCategory === 'Performance Output' ? hourlyOutputTable : effectiveCategory === 'Scrap' ? hourlyScrapTable : effectiveCategory === 'CIL / Centerline' ? cilCenterlineTable : (
            <>
            <Box sx={{ mb: 0.25 }} />

            <Box sx={{ display: 'grid', gridTemplateColumns: isWorkOrderLogbookView ? '2fr 0.95fr 1.1fr 1.35fr 1.2fr' : '2.1fr 1.2fr 1.35fr 1fr 1.1fr', px: 1.2, mb: 0.6 }}>
              {(isWorkOrderLogbookView
                ? ['ID', 'Work Type', 'Follow-up Status', 'Equipment', 'Due / Location']
                : ['ID', 'Type', 'Assignee / Source', 'Shift / Area', 'Created']
              ).map((label) => (
                <Typography key={label} variant="caption" sx={{ fontWeight: 500, color: tokenText.secondary, textTransform: 'uppercase', letterSpacing: '0.1px' }}>{label}</Typography>
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {visibleLogbookEntries.map((entry) => {
                const statusTone = entry.status === 'Open' ? '#EF4444' : entry.status === 'In Progress' ? '#F59E0B' : '#16A34A';
                const workOrderContext = isWorkOrderLogbookView ? getLogbookWorkOrderContext(entry) : null;
                const followUpTone = workOrderContext ? followUpStatusTone[workOrderContext.followUpStatus] : statusTone;
                const mappedDetails = {
                  number: entry.id.replace('SL-', 'WO-'),
                  workOrder: entry.id.replace('SL-', 'WO-'),
                  oee: '91.6%',
                  availability: '94.2%',
                  performance: '93.1%',
                  quality: '98.6%',
                  location: `${entry.zone} • ${entry.line}`,
                  equipment: entry.reporterType === 'Equipment' ? entry.reporter : 'Plastic Extruder E9867-A',
                  title: entry.title,
                  description: entry.title,
                  reportedBy: entry.reporter,
                  date: `14/01/2025, ${entry.createdAt}`,
                  category: entry.category,
                  ticketType: entry.ticketType,
                };
                return (
                <Paper
                  key={entry.id}
                  elevation={0}
                  onClick={() => openLogbookMaintenanceEntry(entry, mappedDetails)}
                  sx={{
                      p: 1.2,
                      borderRadius: '8px',
                      border: `1px solid ${tokenDivider}`,
                      cursor: 'pointer',
                      display: 'grid',
                      gridTemplateColumns: isWorkOrderLogbookView ? '2fr 0.95fr 1.1fr 1.35fr 1.2fr' : '2.1fr 1.2fr 1.35fr 1fr 1.1fr',
                      alignItems: 'center',
                      gap: isWorkOrderLogbookView ? 1 : 0,
                      bgcolor: 'background.paper',
                      transition: 'background-color 0.18s ease, border-color 0.18s ease',
                      '&:hover': {
                        borderColor: tokenBrand.main,
                        bgcolor: tokenBrand.softBg,
                      },
                    }}
                  >
                    <Box sx={{ borderLeft: `3px solid ${entry.tone}`, pl: 1 }}>
                      <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500 }}>{entry.id}</Typography>
                      <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.9375rem', lineHeight: 1.25 }}>{entry.title}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mt: 0.4 }}>
                        <Chip label={workOrderContext?.workOrderId ?? entry.status} size="small" sx={{ height: 20, borderRadius: '999px', fontWeight: 500, bgcolor: workOrderContext ? tokenBrand.softBg : tokenNeutral.lighter, color: workOrderContext ? tokenBrand.main : statusTone, border: `1px solid ${tokenDivider}`, '& .MuiChip-label': { px: 0.9, fontSize: '0.7rem' } }} />
                        <Typography variant="body2" sx={{ color: tokenText.secondary, fontSize: '0.8125rem' }}>{entry.line}</Typography>
                      </Box>
                    </Box>

                    {workOrderContext ? (
                      <>
                        <Box>
                          <Chip label={workOrderContext.type} size="small" sx={{ height: 22, borderRadius: '999px', fontWeight: 500, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, '& .MuiChip-label': { px: 0.9, fontSize: '0.72rem' } }} />
                        </Box>

                        <Box>
                          <Chip label={workOrderContext.followUpStatus} size="small" sx={{ height: 24, borderRadius: '999px', fontWeight: 500, bgcolor: tokenNeutral.lighter, color: followUpTone, border: `1px solid ${tokenDivider}`, '& .MuiChip-label': { px: 0.95, fontSize: '0.72rem' } }} />
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', mt: 0.35, fontWeight: 400 }}>{workOrderContext.parts}</Typography>
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }} noWrap>{workOrderContext.equipment}</Typography>
                          <Box sx={{ display: 'flex', gap: 0.45, alignItems: 'center', mt: 0.35 }}>
                            <Chip label={workOrderContext.criticality} size="small" sx={{ height: 18, minWidth: 20, borderRadius: '999px', fontWeight: 500, bgcolor: workOrderContext.criticality === 'A' ? tokenError.softBg : tokenWarning.softBg, color: workOrderContext.criticality === 'A' ? tokenError.dark : tokenWarning.dark, border: `1px solid ${tokenDivider}`, '& .MuiChip-label': { px: 0.55, fontSize: '0.66rem' } }} />
                            <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400 }} noWrap>Criticality {workOrderContext.criticality}</Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8 }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: tokenBrand.main }}>
                              <TimeIcon sx={{ fontSize: 15 }} />
                              <Typography sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.8125rem' }} noWrap>{workOrderContext.due}</Typography>
                            </Box>
                            <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, mt: 0.2 }} noWrap>{workOrderContext.location}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45 }}>
                            <Button
                              size="small"
                              startIcon={<NoteIcon sx={{ fontSize: 14 }} />}
                              onClick={(event) => {
                                event.stopPropagation();
                                openNoteEditor(entry);
                              }}
                              sx={{ ...shiftLogbookButtonSx, color: tokenBrand.main, minWidth: 0, px: 0.45 }}
                            >
                              {entryNotes[entry.id] || entry.note ? 'View note' : 'Add note'}
                            </Button>
                            <MoreIcon sx={{ color: tokenText.secondary, fontSize: 19 }} />
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, color: entry.tone, fontWeight: 700 }}>
                          {getShiftLogbookTicketTypeIcon(entry.ticketType)}
                          <Typography sx={{ fontWeight: 500, color: entry.tone, fontSize: '0.875rem' }}>{entry.ticketType === 'Non-Conformance' || entry.ticketType === 'Complaint' ? `Quality • ${entry.ticketType}` : entry.category}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Avatar sx={{
                            width: 28,
                            height: 28,
                            bgcolor: entry.reporterType === 'AI' ? tokenBrand.main : entry.reporterType === 'Equipment' ? tokenNeutral.main : tokenWarning.lightest,
                            color: entry.reporterType === 'AI' ? tokenBrand.contrast : entry.reporterType === 'Equipment' ? tokenText.primary : tokenText.primary,
                            fontWeight: 800,
                            fontSize: 11,
                          }}>
                            {entry.reporterType === 'AI'
                              ? <SparkleIcon sx={{ fontSize: 14 }} />
                              : entry.reporterType === 'Equipment'
                                ? <MaintenanceIcon sx={{ fontSize: 14 }} />
                                : entry.reporter.split(' ').map((n) => n[0]).join('')}
                          </Avatar>
                          <Typography sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.875rem' }}>{entry.reporter}</Typography>
                        </Box>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.25 }} noWrap>{entry.shift}</Typography>
                          <Typography sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.75rem', lineHeight: 1.35, mt: 0.25 }} noWrap>
                            {entry.line} / {entry.zone}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, color: tokenBrand.main }}>
                            <TimeIcon sx={{ fontSize: 15 }} />
                            <Typography sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.875rem' }}>{entry.createdAt}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                            <Button
                              size="small"
                              startIcon={<NoteIcon sx={{ fontSize: 14 }} />}
                              onClick={(event) => {
                                event.stopPropagation();
                                openNoteEditor(entry);
                              }}
                              sx={{ ...shiftLogbookButtonSx, color: tokenBrand.main, minWidth: 0, px: 0.6 }}
                            >
                              {entryNotes[entry.id] || entry.note ? 'View note' : 'Add note'}
                            </Button>
                            <MoreIcon sx={{ color: tokenText.secondary, fontSize: 19 }} />
                          </Box>
                        </Box>
                      </>
                    )}
                    {(entryNotes[entry.id] || entry.note) ? (
                      <Box sx={{ gridColumn: '1 / -1', mt: 0.8, p: 0.8, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.78rem', lineHeight: 1.35 }}>
                          {entryNotes[entry.id] || entry.note}
                        </Typography>
                      </Box>
                    ) : null}
                  </Paper>
                );
              })}
              {!visibleLogbookEntries.length ? (
                <Paper elevation={0} sx={{ p: 2, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                  <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>No logbook records match these filters.</Typography>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.8125rem', mt: 0.4 }}>
                    Clear one filter or broaden the search to review the current shift records.
                  </Typography>
                </Paper>
              ) : null}
            </Box>
            </>
            )}
          </Grid>

          <Grid size={{ xs: 12, lg: 2.4 }} sx={{display: 'flex', flexDirection: 'column', gap: 0.9}}>
            <Paper elevation={0} sx={{ p: 0, borderRadius: '12px', border: `1px solid ${tokenDivider}`, mb: 0.9, bgcolor: 'background.paper', overflow: 'hidden' }}>
              <Box sx={{ px: 1.15, py: 0.95, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8, bgcolor: tokenNeutral.lightest, borderBottom: `1px solid ${tokenDivider}` }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem', lineHeight: 1.2 }}>
                    {metricPanel.title}
                  </Typography>
                  <Typography sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.72rem', mt: 0.12 }} noWrap>
                    {metricPanel.caption}
                  </Typography>
                </Box>
                <Chip
                  label={metricRiskLabel}
                  size="small"
                  sx={{
                    height: 21,
                    borderRadius: '999px',
                    bgcolor: highRisk > 0 ? tokenError.softBg : metricOpenItems > 0 ? tokenWarning.softBg : tokenSuccess.softBg,
                    color: highRisk > 0 ? tokenError.dark : metricOpenItems > 0 ? tokenWarning.dark : tokenSuccess.darker,
                    border: `1px solid ${tokenDivider}`,
                    fontWeight: 500,
                    '& .MuiChip-label': { px: 0.75, fontSize: '0.62rem' },
                  }}
                />
              </Box>

              <Box sx={{ p: 0.95, display: 'grid', gap: 0.75 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.65 }}>
                  {metricPanel.primary.map((metric) => (
                    <Box key={metric.label} sx={{ p: 0.82, minHeight: 68, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: metric.bg, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                      <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, letterSpacing: '0.1px', fontSize: '0.625rem', lineHeight: 1 }} noWrap>
                        {metric.label.toUpperCase()}
                      </Typography>
                      <Typography sx={{ color: metric.color, fontWeight: 700, fontSize: '1.35rem', lineHeight: 1, letterSpacing: '-0.03em' }}>{metric.value}</Typography>
                      <Typography sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.68rem', lineHeight: 1.2 }} noWrap>{metric.helper}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ p: 0.75, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', display: 'grid', gap: 0.55 }}>
                  {metricPanel.compact.map((metric) => (
                    <Box key={metric.label} sx={{ display: 'grid', gridTemplateColumns: '8px minmax(0, 1fr) auto', alignItems: 'center', gap: 0.65, minWidth: 0 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '999px', bgcolor: metric.color }} />
                      <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, fontSize: '0.68rem', lineHeight: 1.15 }} noWrap>{metric.label}</Typography>
                      <Typography sx={{ color: metric.color, fontWeight: 700, fontSize: '0.86rem', lineHeight: 1 }}>{metric.value}</Typography>
                    </Box>
                  ))}
                </Box>

                <Box sx={{ p: 0.75, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.45, gap: 0.6 }}>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 500, letterSpacing: '0.1px', fontSize: '0.625rem', lineHeight: 1 }} noWrap>
                      {metricPanel.progress.label}
                    </Typography>
                    <Typography sx={{ color: metricPanel.progress.color, fontWeight: 700, fontSize: '0.75rem', lineHeight: 1 }}>
                      {metricPanel.progress.displayValue}
                    </Typography>
                  </Box>
                  <Box sx={{ height: 8, borderRadius: '999px', bgcolor: tokenNeutral.main, overflow: 'hidden' }}>
                    <Box sx={{ width: `${metricPanel.progress.value}%`, height: '100%', bgcolor: metricPanel.progress.color }} />
                  </Box>
                </Box>

                <Box sx={{ p: 0.75, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.6, mb: 0.5 }}>
                    <Typography sx={{ color: tokenText.secondary, fontWeight: 500, fontSize: '0.625rem', letterSpacing: '0.1px' }}>
                      {metricPanel.breakdownLabel}
                    </Typography>
                    <Typography sx={{ color: tokenText.disabled, fontWeight: 500, fontSize: '0.58rem' }}>
                      {metricPanelBreakdownRawTotal} total
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', height: 8, borderRadius: '999px', bgcolor: tokenNeutral.main, overflow: 'hidden', mb: 0.65 }}>
                    {metricPanel.breakdown.map((item) => (
                      <Box
                        key={item.label}
                        sx={{
                          width: `${Math.max(item.value ? 3 : 0, Math.round((item.value / metricPanelBreakdownTotal) * 100))}%`,
                          bgcolor: item.color,
                        }}
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'grid', gap: 0.5 }}>
                    {metricPanel.breakdown.map((item) => (
                      <Box key={item.label} sx={{ display: 'grid', gridTemplateColumns: 'minmax(84px, 0.8fr) minmax(0, 1fr) 22px', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.62rem', fontWeight: 500, lineHeight: 1.12 }} noWrap>{item.label}</Typography>
                        <Box sx={{ height: 7, borderRadius: '999px', bgcolor: item.bg, overflow: 'hidden' }}>
                          <Box sx={{ width: `${Math.max(item.value ? 8 : 0, Math.round((item.value / metricPanelBreakdownMax) * 100))}%`, height: '100%', bgcolor: item.color }} />
                        </Box>
                        <Typography sx={{ color: item.color, fontSize: '0.68rem', fontWeight: 700, lineHeight: 1, textAlign: 'right' }}>{item.value}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                  {metricPanel.footer.map((item) => (
                    <Box key={item.label} sx={{ p: 0.68, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                      <Typography sx={{ color: tokenText.secondary, fontWeight: 500, fontSize: '0.6rem', lineHeight: 1.1 }}>{item.label}</Typography>
                      <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.95rem', lineHeight: 1.1, mt: 0.15 }}>{item.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Paper>
            {logbookContextWriter}
          </Grid>
        </Grid>
        </Box>
        )}
        {editingNoteId ? (
          <Paper elevation={0} sx={{ position: 'fixed', right: 24, bottom: 24, width: 360, p: 1.3, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', boxShadow: '0 12px 28px rgba(0,31,155,0.16)', zIndex: 1500 }}>
            <Typography sx={{ ...shiftLogbookSectionTitleSx, mb: 0.7 }}>Log Note</Typography>
            <TextField
              size="small"
              fullWidth
              multiline
              minRows={3}
              value={editingNoteValue}
              onChange={(e) => setEditingNoteValue(e.target.value)}
              placeholder="Add handover note..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'background.paper' } }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8, mt: 0.9 }}>
              <Button size="small" onClick={() => setEditingNoteId(null)} sx={shiftLogbookButtonSx}>Cancel</Button>
              <Button size="small" variant="contained" onClick={saveNote} sx={shiftLogbookContainedButtonSx}>Save note</Button>
            </Box>
          </Paper>
        ) : null}
        <Dialog
          open={isShiftHandoverOpen}
          onClose={() => setIsShiftHandoverOpen(false)}
          maxWidth={false}
          fullWidth
          PaperProps={{ sx: { width: 'calc(100vw - 48px)', maxWidth: '1480px', height: 'min(92vh, 980px)', borderRadius: '12px', border: `1px solid ${tokenDivider}`, overflow: 'hidden', bgcolor: 'background.paper', boxShadow: 'none' } }}
        >
          <DialogTitle sx={{ px: 2, py: 1.25, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <SparkleIcon sx={{ fontSize: 20, color: tokenWarning.dark, flexShrink: 0 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: tokenText.primary, fontFamily: workstationVisuals.fontFamily, fontWeight: 700, fontSize: '1rem', lineHeight: 1.2 }}>
                    End Of Shift Summary
                  </Typography>
                  <Typography sx={{ color: tokenText.secondary, fontFamily: workstationVisuals.fontFamily, fontSize: '0.75rem', mt: 0.2 }} noWrap>
                    {handoverSelectedLinesLabel} - {handoverShiftFilter.toLowerCase()} - draft for the incoming {nextShiftName.toLowerCase()} shift
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <Button size="small" variant="outlined" startIcon={<PdfIcon />} onClick={() => setIsHandoverPdfPreviewOpen(true)} sx={{ ...shiftLogbookButtonSx, height: 32, borderColor: tokenBrand.main, color: tokenBrand.main, '&:hover': { borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg } }}>
                  Preview PDF
                </Button>
                <Button size="small" variant="outlined" startIcon={<ResetIcon />} sx={{ ...shiftLogbookButtonSx, height: 32, borderColor: tokenBrand.main, color: tokenBrand.main, '&:hover': { borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg } }}>
                  Regenerate
                </Button>
                <Button size="small" variant="outlined" startIcon={<DownloadIcon />} sx={{ ...shiftLogbookButtonSx, height: 32, borderColor: tokenBrand.main, color: tokenBrand.main, '&:hover': { borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg } }}>
                  Save Draft
                </Button>
                <Button size="small" variant="contained" startIcon={<SendIcon />} onClick={() => setIsHandoverSendDialogOpen(true)} sx={{ ...shiftLogbookContainedButtonSx, height: 32 }}>
                  Send Handover
                </Button>
                <IconButton size="small" onClick={() => setIsShiftHandoverOpen(false)} sx={{ width: 34, height: 34, borderRadius: '8px', color: tokenText.secondary, '&:hover': { bgcolor: tokenBrand.softBg, color: tokenBrand.main } }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 0, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ px: 1.5, py: 1, bgcolor: 'background.paper', borderBottom: `1px solid ${tokenDivider}` }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '170px 160px minmax(320px, 1fr)' }, gap: 0.75, alignItems: 'end' }}>
                <FormControl size="small" sx={handoverFilterFieldSx}>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', mb: 0.3 }}>Shift</Typography>
                  <Select value={handoverShiftFilter} onChange={(event) => setHandoverShiftFilter(event.target.value)}>
                    {handoverShiftOptions.map((option) => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  size="small"
                  type="date"
                  label="Date"
                  value={handoverDateFilter}
                  onChange={(event) => setHandoverDateFilter(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={handoverFilterFieldSx}
                />
                <Box>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', mb: 0.3 }}>Lines included in report</Typography>
                  <Box sx={{ minHeight: 34, px: 0.45, py: 0.35, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 0.4, flexWrap: 'wrap' }}>
                    <FormControl size="small" sx={{ minWidth: 124, '& .MuiInputBase-root': { height: 24, borderRadius: '8px', bgcolor: 'background.paper', fontSize: '0.75rem', fontWeight: 500, fontFamily: workstationVisuals.fontFamily }, '& .MuiOutlinedInput-notchedOutline': { borderColor: tokenDivider } }}>
                      <Select
                        value=""
                        displayEmpty
                        disabled={!availableHandoverLines.length}
                        onChange={(event) => addHandoverLine(event.target.value)}
                        renderValue={() => (availableHandoverLines.length ? '+ Add line' : 'All selected')}
                      >
                        <MenuItem value="" disabled>Add line</MenuItem>
                        {availableHandoverLines.map((line) => (
                          <MenuItem key={line} value={line}>{line}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {handoverLineTabs.map((line) => (
                      <Chip
                        key={line}
                        label={line}
                        onDelete={handoverSelectedLines.length > 1 ? () => removeHandoverLine(line) : undefined}
                        size="small"
                        sx={{
                          height: 24,
                          borderRadius: '8px',
                          bgcolor: tokenBrand.softBg,
                          color: tokenBrand.main,
                          border: `1px solid ${tokenDivider}`,
                          fontWeight: 500,
                          '& .MuiChip-label': { px: 0.8, fontSize: '0.75rem', fontWeight: 500 },
                          '& .MuiChip-deleteIcon': { color: tokenBrand.dark, fontSize: 15, '&:hover': { color: tokenError.main } },
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
              <Box sx={{ mt: 0.85, px: 0.9, py: 0.65, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400 }}>
                  Columbus West - {handoverSelectedLinesLabel} - {handoverShiftFilter} - {handoverDateFilter}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap' }}>
                  <Chip size="small" label={`${activeHandoverTopics}/${handoverTopicList.length} sections`} sx={{ height: 22, borderRadius: '999px', bgcolor: 'background.paper', color: tokenText.primary, border: `1px solid ${tokenDivider}`, fontWeight: 500 }} />
                  <Chip size="small" label="delivery configured on send" sx={{ height: 22, borderRadius: '999px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontWeight: 500 }} />
                </Box>
              </Box>
              <Box sx={{ mt: 0.65, display: 'flex', alignItems: 'center', gap: 0.5, overflowX: 'auto', pb: 0.05 }}>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', mr: 0.15, whiteSpace: 'nowrap' }}>
                  Line reports
                </Typography>
                {handoverLineTabs.map((line) => {
                  const active = activeHandoverLine === line;
                  return (
                    <Button
                      key={line}
                      size="small"
                      variant={active ? 'contained' : 'outlined'}
                      onClick={() => setHandoverLineTab(line)}
                      sx={{
                        height: 28,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontSize: '0.68rem',
                        fontWeight: active ? 700 : 500,
                        boxShadow: 'none',
                        bgcolor: active ? tokenBrand.main : 'background.paper',
                        color: active ? tokenBrand.contrast : tokenText.primary,
                        borderColor: active ? tokenBrand.main : tokenDivider,
                        whiteSpace: 'nowrap',
                        '&:hover': { bgcolor: active ? tokenBrand.dark : tokenBrand.softBg, boxShadow: 'none', borderColor: tokenBrand.main },
                      }}
                    >
                      {line}
                    </Button>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '304px minmax(0, 1fr)' }, gap: 1.1, p: 1.2, overflow: 'hidden', flex: 1 }}>
              <Box sx={{ ...handoverSectionCardSx, overflowY: 'auto', minHeight: 0, p: 1 }}>
                <Box sx={{ display: 'grid', gap: 0.8 }}>
                  <Box sx={{ p: 1, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
                    <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>Draft Controls</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', mt: 0.25 }}>
                      Enable only the handover sections that matter for this shift.
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'grid', gap: 0.45 }}>
                    {handoverTopicList.map((topic, topicIndex) => {
                      const isDisabledTopic = disabledHandoverTopics.has(topic);
                      const isAiActivatingTopic = handoverStreamStep >= 2
                        && handoverStreamStep <= 10
                        && !manualHandoverTopics.has(topic)
                        && topicIndex === handoverStreamStep - 2;
                      return (
                      <Box
                        key={topic}
                        role="button"
                        tabIndex={isDisabledTopic ? -1 : 0}
                        onClick={() => toggleHandoverTopic(topic)}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          event.preventDefault();
                          toggleHandoverTopic(topic);
                        }}
                        sx={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: 0.65, px: 0.8, py: 0.55, borderRadius: '8px', border: `1px solid ${isAiActivatingTopic ? tokenBrand.main : tokenDivider}`, bgcolor: handoverTopicToggles[topic] ? tokenBrand.softBg : 'background.paper', cursor: isDisabledTopic ? 'not-allowed' : 'pointer', opacity: isDisabledTopic ? 0.52 : 1, transition: 'background-color 0.2s ease, border-color 0.2s ease', '&:hover': { bgcolor: isDisabledTopic ? 'background.paper' : tokenBrand.softBg, borderColor: isDisabledTopic ? tokenDivider : tokenBrand.main }, '&:focus-visible': { outline: `2px solid ${tokenBrand.main}`, outlineOffset: 2 } }}
                      >
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 500, minWidth: 0 }} noWrap>{topic}</Typography>
                        {isAiActivatingTopic ? (
                          <SparkleIcon sx={{ color: tokenWarning.dark, fontSize: 14, animation: 'pulse 1s ease-in-out infinite' }} />
                        ) : <Box sx={{ width: 14 }} />}
                        <Chip size="small" label={isDisabledTopic ? 'off' : handoverTopicCounts[topic]} sx={{ height: 20, bgcolor: handoverTopicToggles[topic] ? 'background.paper' : tokenNeutral.lightest, color: handoverTopicToggles[topic] ? tokenBrand.main : tokenText.secondary, '& .MuiChip-label': { px: 0.55, fontSize: '0.625rem', fontWeight: 500 } }} />
                        <Box sx={handoverToggleSx(!isDisabledTopic && handoverTopicToggles[topic])}>
                          <Box sx={handoverToggleKnobSx} />
                        </Box>
                      </Box>
                      );
                    })}
                  </Box>

                  <Divider sx={{ borderColor: tokenDivider }} />

                  <Box>
                    <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem', mb: 0.55 }}>Focus Topics</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.45 }}>
                      {handoverFocusChips.map((chip) => (
                        <Chip key={chip} label={chip} onDelete={() => removeFocusChip(chip)} size="small" sx={{ height: 24, borderRadius: '999px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontWeight: 500 }} />
                      ))}
                      <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addHandoverFocusChip} sx={{ ...shiftLogbookButtonSx, minHeight: 24, height: 24, fontSize: '0.75rem', px: 0.85 }}>
                        Add
                      </Button>
                    </Box>
                  </Box>

                  <Box>
                    <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem', mb: 0.55 }}>Generation Settings</Typography>
                    <Box sx={{ display: 'grid', gap: 0.4 }}>
                      {handoverOptionList.map((option) => (
                        <Box
                          key={option}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleHandoverGenerationOption(option)}
                          onKeyDown={(event) => {
                            if (event.key !== 'Enter' && event.key !== ' ') return;
                            event.preventDefault();
                            toggleHandoverGenerationOption(option);
                          }}
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75, px: 0.8, py: 0.45, borderRadius: '8px', bgcolor: handoverGenerationOptions[option] ? tokenBrand.softBg : 'background.paper', border: `1px solid ${tokenDivider}`, cursor: 'pointer', '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.main } }}
                        >
                          <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 500 }}>{option}</Typography>
                          <Box sx={handoverToggleSx(handoverGenerationOptions[option])}>
                            <Box sx={handoverToggleKnobSx} />
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Box sx={{ overflowY: 'auto', minHeight: 0, pr: 0.25, display: 'grid', gap: 1, alignContent: 'start', '@keyframes handoverCardIn': { from: { opacity: 0, transform: 'translateY(10px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
                <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', border: 'none', bgcolor: tokenNeutral.lightest, boxShadow: 'none' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                      <SparkleIcon sx={{ fontSize: 16, color: tokenWarning.dark, flexShrink: 0 }} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: tokenBrand.main, fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.2 }}>BLU.AI Executive Summary</Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400 }}>
                          BLU.AI drafting from current shift logs, ESO signals, and selected topics
                        </Typography>
                      </Box>
                    </Box>
                    <Chip size="small" label={handoverBuildStatus} sx={{ height: 22, borderRadius: '999px', bgcolor: 'background.paper', color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontWeight: 500 }} />
                  </Box>
                  <Box sx={{ minHeight: 84, p: 1.5, borderRadius: '6px', border: `1px solid ${tokenDivider}`, bgcolor: 'rgba(0,0,0,0.03)' }}>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.8125rem', lineHeight: 1.5, fontWeight: 400 }}>
                      {streamedHandoverSummary}
                      {handoverStreamStep < 6 ? <Box component="span" sx={{ display: 'inline-block', width: 7, height: 15, ml: 0.35, mb: -0.25, bgcolor: tokenBrand.light, animation: 'pulse 0.9s infinite' }} /> : null}
                    </Typography>
                  </Box>
                  {handoverStreamStep < 12 ? (
                    <LinearProgress variant="determinate" value={(handoverStreamStep / 12) * 100} sx={{ height: 5, borderRadius: 999, mt: 0.85, bgcolor: 'rgba(31,99,234,0.1)', '& .MuiLinearProgress-bar': { bgcolor: tokenBrand.main } }} />
                  ) : null}
                </Paper>

                <Box sx={{ display: handoverStreamStep >= 7 ? 'grid' : 'none', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))', xl: 'repeat(7, minmax(0, 1fr))' }, gap: 0.8, animation: 'handoverCardIn 360ms ease both' }}>
                  {handoverKpiTiles.map((tile) => {
                    const TileIcon = tile.icon;
                    return (
                      <Paper key={tile.label} elevation={0} sx={{ ...handoverMetricCardSx, minHeight: 104, display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 0.45 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.7 }}>
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase' }} noWrap>{tile.label}</Typography>
                          <Box sx={{ width: 26, height: 26, borderRadius: '6px', bgcolor: tile.bg, color: tile.tone, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                            <TileIcon sx={{ fontSize: 16 }} />
                          </Box>
                        </Box>
                        <Typography sx={{ color: tile.tone, fontWeight: 850, fontSize: tile.label === 'Production' ? '1rem' : '1.22rem', lineHeight: 1.1, alignSelf: 'center' }} noWrap>
                          {tile.value}
                        </Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 500, lineHeight: 1.25 }}>
                          {tile.helper}
                        </Typography>
                      </Paper>
                    );
                  })}
                </Box>

                <Box sx={{ display: handoverStreamStep >= 8 ? 'grid' : 'none', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1, animation: 'handoverCardIn 360ms ease both' }}>
                  <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                      <Typography sx={{ color: tokenText.primary, fontSize: '0.875rem', fontWeight: 700 }}>Shift Log</Typography>
                      <Chip size="small" label={`${handoverShiftLogEntries.length} records`} sx={{ height: 22, borderRadius: '999px', bgcolor: tokenNeutral.lightest, color: tokenText.secondary, fontWeight: 500 }} />
                    </Box>
                    <Box sx={{ display: 'grid', gap: 0.5 }}>
                      {handoverShiftLogEntries.map((entry) => (
                        <Box key={entry.id} sx={{ display: 'grid', gridTemplateColumns: '56px minmax(0, 1fr) auto', gap: 0.7, alignItems: 'center', p: 0.65, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 700 }}>{entry.createdAt}</Typography>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 700 }} noWrap>{entry.title}</Typography>
                            <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', mt: 0.1 }} noWrap>{entry.detail}</Typography>
                          </Box>
                          <Chip size="small" label={entry.type} sx={{ height: 20, borderRadius: '999px', bgcolor: tokenCommon.white, color: entry.tone, '& .MuiChip-label': { px: 0.55, fontSize: '0.58rem', fontWeight: 700 } }} />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                  <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                      <Typography sx={{ color: tokenText.primary, fontSize: '0.875rem', fontWeight: 700 }}>Shift Task Activity</Typography>
                      <Chip size="small" label={`${shiftTaskActivityRows.filter((row) => row.status === 'Completed').length} done / ${shiftTaskActivityRows.filter((row) => row.status === 'Open').length} open`} sx={{ height: 22, borderRadius: '999px', bgcolor: tokenSuccess.softBg, color: tokenSuccess.darker, fontWeight: 500 }} />
                    </Box>
                    <Box sx={{ display: 'grid', gap: 0.5 }}>
                      {shiftTaskActivityRows.map((row) => (
                        <Box key={row.id} sx={{ display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) auto', alignItems: 'center', gap: 0.65, p: 0.65, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                          <Box sx={{ width: 22, height: 22, borderRadius: '6px', bgcolor: row.status === 'Completed' ? tokenSuccess.softBg : tokenWarning.softBg, color: row.tone, display: 'grid', placeItems: 'center' }}>
                            {row.status === 'Completed' ? <CheckCircleOutlineIcon sx={{ fontSize: 15 }} /> : <WarningIcon sx={{ fontSize: 14 }} />}
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 700 }} noWrap>{row.task}</Typography>
                            <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem' }}>Owner: {row.owner}</Typography>
                          </Box>
                          <Chip size="small" label={row.status} sx={{ height: 20, borderRadius: '999px', bgcolor: row.status === 'Completed' ? tokenSuccess.softBg : tokenWarning.softBg, color: row.status === 'Completed' ? tokenSuccess.darker : tokenWarning.dark, '& .MuiChip-label': { px: 0.55, fontSize: '0.58rem', fontWeight: 800 } }} />
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Box>

                {handoverTopicToggles['Production & OEE'] || handoverTopicToggles.Downtime ? (
                  <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1.2, display: handoverStreamStep >= 8 ? 'block' : 'none', animation: 'handoverCardIn 360ms ease both' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.9 }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.875rem', fontWeight: 700 }}>Production / Scrap / OEE / Downtime Hour By Hour</Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, mt: 0.2 }}>
                          Filtered by {handoverShiftFilter}, {activeHandoverLine}
                        </Typography>
                      </Box>
                      <Chip icon={<SpreadsheetIcon sx={{ fontSize: '14px !important' }} />} size="small" label="6 hours" sx={{ height: 22, borderRadius: '999px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontWeight: 500 }} />
                    </Box>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1fr) 360px' }, gap: 1, alignItems: 'stretch' }}>
                      <Box sx={{ overflowX: 'auto', border: `1px solid ${tokenDivider}`, borderRadius: '8px', height: '100%', bgcolor: 'background.paper' }}>
                        <Box component="table" sx={{ width: '100%', minWidth: 720, borderCollapse: 'collapse', bgcolor: 'background.paper' }}>
                          <Box component="thead" sx={{ bgcolor: tokenNeutral.lightest }}>
                            <Box component="tr">
                              {['Hour', 'Production', 'Scrap', 'OEE', 'Downtime', 'OEE Events', 'Status'].map((header) => (
                                <Box component="th" key={header} sx={{ ...handoverTableHeaderSx, textAlign: 'left', px: 0.8, py: 0.65, borderBottom: `1px solid ${tokenDivider}`, whiteSpace: 'nowrap' }}>
                                  {header}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                          <Box component="tbody">
                            {displayedHandoverHourlyRows.map((row) => {
                              const oeeValue = Number(row.oee.replace('%', ''));
                              const productionVariance = row.production - row.target;
                              const statusTone = row.state === 'Risk'
                                ? { bg: tokenError.softBg, color: tokenError.dark }
                                : row.state === 'Watch' || row.state === 'Recovering'
                                  ? { bg: tokenWarning.softBg, color: tokenWarning.dark }
                                  : { bg: tokenSuccess.softBg, color: tokenSuccess.darker };
                              return (
                                <Box component="tr" key={row.hour} sx={{ '&:hover': { bgcolor: workstationVisuals.tierSurfaceSoft } }}>
                                  <Box component="td" sx={{ px: 0.8, py: 0.68, borderBottom: `1px solid ${workstationVisuals.tierBorder}` }}>
                                    <Typography sx={{ ...handoverTableCellSx, fontWeight: 850 }}>{row.hour}</Typography>
                                  </Box>
                                  <Box component="td" sx={{ px: 0.8, py: 0.68, borderBottom: `1px solid ${workstationVisuals.tierBorder}` }}>
                                    <Typography sx={{ ...handoverTableCellSx, color: tokenSuccess.darker, fontWeight: 850 }}>{row.production} / {row.target}</Typography>
                                    <Typography sx={{ color: productionVariance < 0 ? tokenWarning.dark : tokenSuccess.darker, fontSize: '0.62rem', fontWeight: 750 }}>
                                      {productionVariance >= 0 ? '+' : ''}{productionVariance}
                                    </Typography>
                                  </Box>
                                  <Box component="td" sx={{ px: 0.8, py: 0.68, borderBottom: `1px solid ${workstationVisuals.tierBorder}` }}>
                                    <Typography sx={{ ...handoverTableCellSx, fontWeight: 800 }}>{row.scrap}</Typography>
                                    <Typography sx={{ color: Number(row.scrapRate.replace('%', '')) > 4 ? tokenError.main : workstationVisuals.tierTextMeta, fontSize: '0.62rem', fontWeight: 750 }}>
                                      {row.scrapRate}
                                    </Typography>
                                  </Box>
                                  <Box component="td" sx={{ px: 0.8, py: 0.68, borderBottom: `1px solid ${workstationVisuals.tierBorder}` }}>
                                    <Typography sx={{ ...handoverTableCellSx, fontWeight: 850, color: oeeValue < 72 ? tokenError.main : oeeValue < 80 ? tokenWarning.dark : tokenSuccess.darker }}>
                                      {row.oee}
                                    </Typography>
                                  </Box>
                                  <Box component="td" sx={{ px: 0.8, py: 0.68, borderBottom: `1px solid ${workstationVisuals.tierBorder}` }}>
                                    <Typography sx={{ color: row.downtime === '18m' || row.downtime === '20m' || row.downtime === '22m' ? tokenError.main : workstationVisuals.tierTextMeta, fontSize: '0.62rem', fontWeight: 750 }}>
                                      {row.downtime}
                                    </Typography>
                                  </Box>
                                  <Box component="td" sx={{ px: 0.8, py: 0.68, borderBottom: `1px solid ${workstationVisuals.tierBorder}`, minWidth: 190 }}>
                                    {row.oeeEvents.length ? (
                                      <Box sx={{ display: 'grid', gap: 0.25 }}>
                                        {row.oeeEvents.map((event) => (
                                          <Typography key={event} sx={{ color: workstationVisuals.tierTextLabel, fontSize: '0.66rem', fontWeight: 700, lineHeight: 1.2 }}>
                                            {event}
                                          </Typography>
                                        ))}
                                      </Box>
                                    ) : (
                                      <Typography sx={{ color: workstationVisuals.tierTextMuted, fontSize: '0.66rem', fontWeight: 650 }}>No OEE event</Typography>
                                    )}
                                  </Box>
                                  <Box component="td" sx={{ px: 0.8, py: 0.68, borderBottom: `1px solid ${workstationVisuals.tierBorder}` }}>
                                    <Chip size="small" label={row.state} sx={{ height: 20, borderRadius: '8px', bgcolor: statusTone.bg, color: statusTone.color, '& .MuiChip-label': { px: 0.55, fontSize: '0.6rem', fontWeight: 800 } }} />
                                  </Box>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ minHeight: 0, display: 'grid', gap: 0.75 }}>
                        {handoverTopicToggles['Events & Issues'] ? (
                          <Box sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: 'background.paper', p: 1, display: 'flex', flexDirection: 'column' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.65 }}>
                              <Box>
                                <Typography sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>Key Events & Risks</Typography>
                                <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', mt: 0.1 }}>Open signals requiring shift awareness</Typography>
                              </Box>
                              <Button size="small" sx={shiftLogbookTextButtonSx}>Timeline</Button>
                            </Box>
                            <Box sx={{ display: 'grid', gap: 0.45, flex: 1, alignContent: 'start' }}>
                              {handoverEventEntries.slice(0, 3).map((entry, eventIndex) => (
                                <Box key={entry.id} sx={{ display: 'grid', gridTemplateColumns: '18px 48px minmax(0, 1fr) auto', gap: 0.65, alignItems: 'start', px: eventIndex === 0 ? 1 : 0.75, py: eventIndex === 0 ? 0.8 : 0.55, border: eventIndex === 0 ? `1px solid ${tokenDivider}` : '1px solid transparent', borderRadius: '6px', bgcolor: eventIndex === 0 ? 'rgba(0,0,0,0.03)' : 'transparent' }}>
                                  {entry.riskLevel === 'High' ? (
                                    <WarningIcon sx={{ color: tokenError.main, fontSize: 16, mt: 0.05 }} />
                                  ) : (
                                    <ErrorOutlineIcon sx={{ color: tokenBrand.main, fontSize: 16, mt: 0.05 }} />
                                  )}
                                  <Typography sx={{ color: tokenText.secondary, fontWeight: 500, fontSize: '0.68rem', lineHeight: 1.3 }}>{entry.createdAt}</Typography>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ color: tokenText.primary, fontSize: '0.75rem', fontWeight: 700 }} noWrap>{entry.title}</Typography>
                                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', mt: 0.15 }}>{entry.line} - {entry.zone} - {entry.status}</Typography>
                                  </Box>
                                  <Chip size="small" label={entry.riskLevel} sx={riskChipSx(entry.riskLevel)} />
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        ) : null}
                      </Box>
                    </Box>
                  </Paper>
                ) : null}

                {handoverTopicToggles.Quality || handoverTopicToggles['Safety / ESO'] ? (
                  <Box sx={{ display: handoverStreamStep >= 9 ? 'grid' : 'none', gridTemplateColumns: { xs: '1fr', xl: '1.15fr 0.85fr' }, gap: 1, animation: 'handoverCardIn 360ms ease both' }}>
                    <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography sx={{ color: workstationVisuals.textPrimary, fontSize: '0.88rem', fontWeight: 850 }}>ESO / Safety</Typography>
                        <Chip size="small" label="OK" sx={{ height: 22, borderRadius: '999px', bgcolor: tokenSuccess.softBg, color: tokenSuccess.darker, fontWeight: 800 }} />
                      </Box>
                      <Box sx={{ display: 'grid', gap: 0.55 }}>
                        <Box sx={{ p: 0.75, borderRadius: '8px', bgcolor: tokenSuccess.softBg, border: `1px solid ${tokenDivider}`, display: 'grid', gridTemplateColumns: '24px minmax(0, 1fr) auto', alignItems: 'center', gap: 0.7 }}>
                          <CheckCircleOutlineIcon sx={{ color: tokenSuccess.darker, fontSize: 18 }} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 800 }}>No safety incidents in the last 24h</Typography>
                            <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', mt: 0.1 }}>Guards verified, lockout checklist complete, no open incident blocker.</Typography>
                          </Box>
                          <Chip size="small" label="OK" sx={{ height: 20, borderRadius: '999px', bgcolor: 'background.paper', color: tokenSuccess.darker, '& .MuiChip-label': { px: 0.6, fontSize: '0.6rem', fontWeight: 800 } }} />
                        </Box>
                        {handoverEsoEntries.slice(0, 3).map((entry) => (
                          <Box key={entry.id} sx={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.75, p: 0.7, pl: 1, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, overflow: 'hidden' }}>
                            <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: entry.status === 'Closed' ? tokenSuccess.darker : tokenWarning.dark }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ color: workstationVisuals.textPrimary, fontSize: '0.76rem', fontWeight: 750 }} noWrap>{entry.title}</Typography>
                              <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: '0.64rem', mt: 0.18 }}>{entry.createdAt} - Owner: {entry.reporter}</Typography>
                            </Box>
                            <Chip size="small" label={entry.status} sx={{ height: 20, borderRadius: '999px', bgcolor: entry.status === 'Closed' ? tokenSuccess.softBg : tokenWarning.softBg, color: entry.status === 'Closed' ? tokenSuccess.darker : tokenWarning.dark, '& .MuiChip-label': { px: 0.6, fontSize: '0.6rem', fontWeight: 800 } }} />
                          </Box>
                        ))}
                        {!handoverEsoEntries.length ? (
                          <Box sx={{ minHeight: 112, display: 'grid', placeItems: 'center', p: 2, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: `1px dashed ${tokenDivider}`, textAlign: 'center' }}>
                            <Box>
                              <CheckCircleOutlineIcon sx={{ color: tokenSuccess.darker, fontSize: 24, mb: 0.4 }} />
                              <Typography sx={{ color: tokenText.primary, fontSize: '0.8125rem', fontWeight: 500 }}>No active ESO signals</Typography>
                              <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', mt: 0.2 }}>Safety status is clean for this report scope.</Typography>
                            </Box>
                          </Box>
                        ) : null}
                      </Box>
                    </Paper>
                    <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1, minHeight: 220, display: 'flex', flexDirection: 'column' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                        <Typography sx={{ color: workstationVisuals.textPrimary, fontSize: '0.88rem', fontWeight: 850 }}>Top Scrap / Loss Contributors</Typography>
                        <Button size="small" sx={shiftLogbookTextButtonSx}>View details</Button>
                      </Box>
                      <Box sx={{ display: 'grid', gap: 0.8, flex: 1 }}>
                      {scrapContributors.map((row) => (
                        <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '130px 1fr 42px', alignItems: 'center', gap: 0.85 }}>
                          <Typography sx={{ color: workstationVisuals.textPrimary, fontSize: '0.74rem', fontWeight: 800 }} noWrap>{row.label}</Typography>
                          <Box sx={{ height: 9, borderRadius: 99, bgcolor: workstationVisuals.tierSurfaceMuted, overflow: 'hidden' }}>
                            <Box sx={{ width: `${(row.units / maxScrapUnits) * 100}%`, height: '100%', bgcolor: row.color }} />
                          </Box>
                          <Typography sx={{ color: workstationVisuals.textPrimary, fontSize: '0.74rem', fontWeight: 850, textAlign: 'right' }}>{row.units}</Typography>
                        </Box>
                      ))}
                      </Box>
                      <Box sx={{ mt: 1, p: 0.8, borderRadius: '8px', bgcolor: workstationVisuals.tierSurfaceSoft, border: `1px solid ${workstationVisuals.tierBorder}`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0.75 }}>
                        <Box>
                          <Typography sx={{ color: workstationVisuals.tierTextMeta, fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase' }}>Total Scrap</Typography>
                          <Typography sx={{ color: workstationVisuals.tierTextHeading, fontSize: '0.95rem', fontWeight: 850 }}>{scrapContributors.reduce((sum, item) => sum + item.units, 0)}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ color: workstationVisuals.tierTextMeta, fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase' }}>Top Cause</Typography>
                          <Typography sx={{ color: tokenError.main, fontSize: '0.78rem', fontWeight: 850 }} noWrap>{scrapContributors[0]?.label}</Typography>
                        </Box>
                        <Box>
                          <Typography sx={{ color: workstationVisuals.tierTextMeta, fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase' }}>Action</Typography>
                          <Typography sx={{ color: tokenBrand.main, fontSize: '0.78rem', fontWeight: 850 }} noWrap>Containment</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Box>
                ) : null}

                {handoverTopicToggles['Work Orders'] || handoverTopicToggles.Maintenance ? (
                  <Box sx={{ display: handoverStreamStep >= 10 ? 'grid' : 'none', gridTemplateColumns: { xs: '1fr', lg: handoverTopicToggles['Work Orders'] && handoverTopicToggles.Maintenance ? '1fr 1fr' : '1fr' }, gap: 1, animation: 'handoverCardIn 360ms ease both' }}>
                    {handoverTopicToggles['Work Orders'] ? (
                      <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                          <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, fontSize: '0.88rem' }}>Work Orders</Typography>
                          <Chip icon={<WorkOrderIcon sx={{ fontSize: '14px !important' }} />} size="small" label={`${handoverOnlyWorkOrderEntries.length} open`} sx={{ height: 22, borderRadius: '8px', bgcolor: tokenWarning.softBg, color: tokenWarning.dark, fontWeight: 800 }} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 0.55 }}>
                          {handoverOnlyWorkOrderEntries.map((entry) => (
                            <Box key={entry.id} sx={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.7, p: 0.7, pl: 1, borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.06)', bgcolor: tokenNeutral.lightest, overflow: 'hidden' }}>
                              <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: entry.riskLevel === 'High' ? tokenError.main : tokenWarning.main }} />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ color: workstationVisuals.textPrimary, fontSize: '0.76rem', fontWeight: 750 }} noWrap>{entry.title}</Typography>
                                <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: '0.64rem', mt: 0.18 }}>{entry.createdAt} - {entry.line} / {entry.zone} - {entry.reporter}</Typography>
                              </Box>
                              <Chip size="small" label={entry.status} sx={{ height: 21, borderRadius: '8px', bgcolor: entry.status === 'Open' ? tokenWarning.softBg : entry.status === 'In Progress' ? tokenBrand.softBg : tokenSuccess.softBg, color: entry.status === 'Open' ? tokenWarning.dark : entry.status === 'In Progress' ? tokenBrand.dark : tokenSuccess.darker, '& .MuiChip-label': { px: 0.65, fontSize: '0.62rem', fontWeight: 800 } }} />
                            </Box>
                          ))}
                          {!handoverOnlyWorkOrderEntries.length ? (
                            <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', p: 1, borderRadius: '8px', bgcolor: tokenNeutral.lightest }}>No open work orders for this report scope.</Typography>
                          ) : null}
                        </Box>
                      </Paper>
                    ) : null}

                    {handoverTopicToggles.Maintenance ? (
                      <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                          <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, fontSize: '0.88rem' }}>Maintenance Requests</Typography>
                          <Chip icon={<MaintenanceIcon sx={{ fontSize: '14px !important' }} />} size="small" label={`${handoverMaintenanceEntries.length} open`} sx={{ height: 22, borderRadius: '8px', bgcolor: tokenWarning.softBg, color: tokenWarning.dark, fontWeight: 800 }} />
                        </Box>
                        <Box sx={{ display: 'grid', gap: 0.55 }}>
                          {handoverMaintenanceEntries.map((entry) => (
                            <Box key={entry.id} sx={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.7, p: 0.7, pl: 1, borderRadius: '8px', border: '1px solid rgba(15, 23, 42, 0.06)', bgcolor: tokenNeutral.lightest, overflow: 'hidden' }}>
                              <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, bgcolor: entry.riskLevel === 'High' ? tokenError.main : tokenWarning.main }} />
                              <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ color: workstationVisuals.textPrimary, fontSize: '0.76rem', fontWeight: 750 }} noWrap>{entry.title}</Typography>
                                <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: '0.64rem', mt: 0.18 }}>{entry.createdAt} - {entry.line} / {entry.zone} - {entry.reporter}</Typography>
                              </Box>
                              <Chip size="small" label={entry.status} sx={{ height: 21, borderRadius: '8px', bgcolor: entry.status === 'Open' ? tokenWarning.softBg : tokenSuccess.softBg, color: entry.status === 'Open' ? tokenWarning.dark : tokenSuccess.darker, '& .MuiChip-label': { px: 0.65, fontSize: '0.62rem', fontWeight: 800 } }} />
                            </Box>
                          ))}
                          {!handoverMaintenanceEntries.length ? (
                            <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', p: 1, borderRadius: '8px', bgcolor: tokenNeutral.lightest }}>No open maintenance requests for this report scope.</Typography>
                          ) : null}
                        </Box>
                      </Paper>
                    ) : null}
                  </Box>
                ) : null}

                {handoverTopicToggles['People / Crew'] || handoverTopicToggles['Pending Actions'] || handoverTopicToggles['Planned Activities'] ? (
                  <Box sx={{ display: handoverStreamStep >= 11 ? 'grid' : 'none', gridTemplateColumns: { xs: '1fr', xl: 'minmax(0, 1.35fr) 360px' }, gap: 1, animation: 'handoverCardIn 360ms ease both' }}>
                    <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1.05 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                        <Box>
                          <Typography sx={{ color: tokenText.primary, fontWeight: 850, fontSize: '0.9rem' }}>Pending / Next Shift Actions</Typography>
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', mt: 0.15 }}>Open items and planned work that continue into the next shift</Typography>
                        </Box>
                        <Chip size="small" label={`${nextShiftActionRows.length} items`} sx={{ height: 22, borderRadius: '999px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontWeight: 800 }} />
                      </Box>
                      <Box sx={{ overflowX: 'auto', border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: 'background.paper' }}>
                        <Box component="table" sx={{ width: '100%', minWidth: 780, borderCollapse: 'collapse' }}>
                          <Box component="thead" sx={{ bgcolor: tokenNeutral.lightest }}>
                            <Box component="tr">
                              {['Type', 'Description', 'Line / Equipment', 'Start', 'Duration', 'Owner'].map((header) => (
                                <Box component="th" key={header} sx={{ ...handoverTableHeaderSx, textAlign: 'left', px: 0.9, py: 0.7, borderBottom: `1px solid ${tokenDivider}` }}>
                                  {header}
                                </Box>
                              ))}
                            </Box>
                          </Box>
                          <Box component="tbody">
                            {nextShiftActionRows.map((item) => (
                              <Box component="tr" key={`${item.type}-${item.description}-${item.start}`} sx={{ '&:hover': { bgcolor: tokenNeutral.lightest } }}>
                                <Box component="td" sx={{ px: 0.9, py: 0.72, borderBottom: `1px solid ${tokenDivider}` }}>
                                  <Chip size="small" label={item.type} sx={{ height: 22, borderRadius: '999px', bgcolor: tokenNeutral.lightest, color: item.tone, border: `1px solid ${tokenDivider}`, '& .MuiChip-label': { px: 0.7, fontSize: '0.64rem', fontWeight: 800 } }} />
                                </Box>
                                <Box component="td" sx={{ px: 0.9, py: 0.72, borderBottom: `1px solid ${tokenDivider}` }}>
                                  <Typography sx={{ ...handoverTableCellSx, color: tokenText.primary, fontWeight: 750 }}>{item.description}</Typography>
                                </Box>
                                <Box component="td" sx={{ px: 0.9, py: 0.72, borderBottom: `1px solid ${tokenDivider}` }}>
                                  <Typography sx={handoverTableCellSx}>{item.line}</Typography>
                                </Box>
                                <Box component="td" sx={{ px: 0.9, py: 0.72, borderBottom: `1px solid ${tokenDivider}` }}>
                                  <Typography sx={{ ...handoverTableCellSx, fontWeight: 750 }}>{item.start}</Typography>
                                </Box>
                                <Box component="td" sx={{ px: 0.9, py: 0.72, borderBottom: `1px solid ${tokenDivider}` }}>
                                  <Typography sx={handoverTableCellSx}>{item.duration}</Typography>
                                </Box>
                                <Box component="td" sx={{ px: 0.9, py: 0.72, borderBottom: `1px solid ${tokenDivider}` }}>
                                  <Typography sx={{ ...handoverTableCellSx, color: tokenText.primary, fontWeight: 750 }}>{item.owner}</Typography>
                                </Box>
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      </Box>
                    </Paper>
                    <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1.05 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                        <Box>
                          <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, fontSize: '0.88rem' }}>Shift Coverage</Typography>
                          <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: '0.68rem', mt: 0.15 }}>Incoming {nextShiftName.toLowerCase()} readiness</Typography>
                        </Box>
                        <Chip size="small" label={`${shiftCoverageConfidence}%`} sx={{ height: 22, borderRadius: '999px', bgcolor: tokenWarning.softBg, color: tokenWarning.dark, fontWeight: 850 }} />
                      </Box>
                      <Box sx={{ height: 9, borderRadius: 99, bgcolor: tokenNeutral.lighter, overflow: 'hidden', mb: 0.85 }}>
                        <Box sx={{ width: `${shiftCoverageConfidence}%`, height: '100%', bgcolor: tokenWarning.main }} />
                      </Box>
                      <Box sx={{ display: 'grid', gap: 0.6 }}>
                        {shiftCoverageRows.map((row) => (
                          <Box key={row.label} sx={{ p: 0.75, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.75 }}>
                            <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ color: tokenText.secondary, fontSize: '0.64rem', fontWeight: 800, textTransform: 'uppercase' }}>{row.label}</Typography>
                              <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 850, mt: 0.1 }} noWrap>{row.value}</Typography>
                            </Box>
                            <Typography sx={{ color: row.tone, fontSize: '0.68rem', fontWeight: 800, alignSelf: 'center', textAlign: 'right' }}>{row.helper}</Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Box>
                ) : null}

                <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1.05, display: handoverStreamStep >= 12 ? 'block' : 'none', animation: 'handoverCardIn 360ms ease both' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                    <Box>
                      <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, fontSize: '0.88rem' }}>Handover Notes</Typography>
                      <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: '0.66rem', fontWeight: 650, mt: 0.15 }}>
                        Type freely or use BLU.AI suggestions
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <Button size="small" variant="outlined" disabled={isDraftingHandoverNotes} startIcon={<SparkleIcon sx={{ fontSize: '14px !important' }} />} onClick={replaceHandoverNotesWithAiDraft} sx={{ height: 28, borderRadius: '8px', textTransform: 'none', fontSize: '0.68rem', fontWeight: 850, borderColor: tokenBrand.lightest }}>
                        {isDraftingHandoverNotes ? 'Drafting...' : 'Draft with AI'}
                      </Button>
                      <Chip size="small" label={activeHandoverLine} sx={{ height: 22, borderRadius: '8px', bgcolor: tokenBrand.softBg, color: tokenBrand.dark, fontWeight: 800 }} />
                    </Box>
                  </Box>
                  {isDraftingHandoverNotes && draftingHandoverSuggestionIndex !== null ? (
                    <Box sx={{ mb: 0.75, px: 0.9, py: 0.65, borderRadius: '8px', bgcolor: tokenBrand.softBg, border: `1px solid ${tokenBrand.lightest}`, display: 'flex', alignItems: 'center', gap: 0.7, '@keyframes aiTypingDot': { '0%, 60%, 100%': { opacity: 0.25, transform: 'translateY(0)' }, '30%': { opacity: 1, transform: 'translateY(-2px)' } } }}>
                      <SparkleIcon sx={{ color: tokenBrand.main, fontSize: 15, animation: 'pulse 1s ease-in-out infinite' }} />
                      <Typography sx={{ color: tokenBrand.dark, fontSize: '0.68rem', fontWeight: 850 }}>
                        BLU.AI typing: {handoverNoteSuggestions[draftingHandoverSuggestionIndex].title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.28, ml: 0.1 }}>
                        {[0, 1, 2].map((dot) => <Box key={dot} sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: tokenBrand.main, animation: `aiTypingDot 1s ${dot * 160}ms infinite` }} />)}
                      </Box>
                      <Typography sx={{ color: tokenBrand.main, fontSize: '0.64rem', fontWeight: 850, ml: 'auto' }}>{handoverDraftProgress}%</Typography>
                    </Box>
                  ) : null}
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 300px' }, gap: 1, alignItems: 'stretch' }}>
                    <TextField
                      multiline
                      minRows={7}
                      maxRows={8}
                      fullWidth
                      size="small"
                      value={handoverNotes}
                      onChange={(event) => {
                        setHandoverNotes(event.target.value);
                        setDraftedHandoverSuggestionCount(0);
                      }}
                      placeholder="Add notes for the incoming shift..."
                      inputProps={{ spellCheck: false, readOnly: isDraftingHandoverNotes }}
                      sx={{
                        '& .MuiInputBase-root': {
                          height: '100%',
                          alignItems: 'flex-start',
                          bgcolor: isDraftingHandoverNotes ? tokenBrand.softBg : tokenCommon.white,
                          borderRadius: '8px',
                          fontSize: '0.76rem',
                          fontWeight: 650,
                          fontFamily: workstationVisuals.fontFamily,
                        },
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: isDraftingHandoverNotes ? tokenBrand.main : workstationVisuals.tierBorder, borderWidth: isDraftingHandoverNotes ? 2 : 1 },
                      }}
                    />
                    <Box sx={{ border: `1px solid ${workstationVisuals.tierBorder}`, borderRadius: '8px', bgcolor: workstationVisuals.tierSurfaceSoft, p: 0.85, display: 'grid', gap: 0.65, '@keyframes aiInsightActive': { '0%, 100%': { boxShadow: `0 0 0 1px ${tokenBrand.lightest}` }, '50%': { boxShadow: `0 0 0 3px ${tokenBrand.softBg}` } } }}>
                      <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, fontSize: '0.78rem' }}>Suggested Inserts</Typography>
                      {handoverNoteSuggestions.map((suggestion, suggestionIndex) => {
                        const isActiveSuggestion = draftingHandoverSuggestionIndex === suggestionIndex;
                        const isCompletedSuggestion = draftedHandoverSuggestionCount > suggestionIndex;
                        return (
                        <Box key={suggestion.title} sx={{ p: 0.65, borderRadius: '8px', bgcolor: isActiveSuggestion ? tokenBrand.softBg : isCompletedSuggestion ? tokenSuccess.softBg : tokenCommon.white, border: `1px solid ${isActiveSuggestion ? tokenBrand.main : isCompletedSuggestion ? tokenSuccess.light : workstationVisuals.tierBorder}`, opacity: isDraftingHandoverNotes && !isActiveSuggestion && !isCompletedSuggestion ? 0.62 : 1, transform: isActiveSuggestion ? 'translateX(-2px)' : 'none', animation: isActiveSuggestion ? 'aiInsightActive 1.15s ease-in-out infinite' : 'none', transition: 'background-color 220ms ease, border-color 220ms ease, opacity 220ms ease, transform 220ms ease' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                            <Typography sx={{ color: isActiveSuggestion ? tokenBrand.dark : workstationVisuals.textPrimary, fontSize: '0.69rem', fontWeight: 850 }}>{suggestion.title}</Typography>
                            {isActiveSuggestion ? <Chip size="small" label="AI typing" sx={{ height: 18, bgcolor: tokenCommon.white, color: tokenBrand.main, '& .MuiChip-label': { px: 0.5, fontSize: '0.54rem', fontWeight: 900 } }} /> : null}
                            {isCompletedSuggestion ? <CheckCircleOutlineIcon sx={{ color: tokenSuccess.darker, fontSize: 15 }} /> : null}
                          </Box>
                          <Typography sx={{ color: workstationVisuals.tierTextLabel, fontSize: '0.62rem', fontWeight: 650, lineHeight: 1.3, mt: 0.2 }}>
                            {suggestion.body}
                          </Typography>
                          <Button size="small" disabled={isDraftingHandoverNotes} onClick={() => appendHandoverNoteSuggestion(suggestion.body)} sx={{ mt: 0.35, minWidth: 0, height: 22, textTransform: 'none', fontSize: '0.62rem', fontWeight: 850, px: 0 }}>
                            Insert
                          </Button>
                        </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
            <Box sx={{ px: 1.25, py: 0.9, borderTop: '1px solid rgba(15, 23, 42, 0.08)', bgcolor: tokenCommon.white, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
              <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: '0.72rem', fontWeight: 700 }}>
                BLU.AI draft uses current shift logs, last shift carryover, selected toggles, and focus topics.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
                <Button variant="outlined" onClick={() => setIsShiftHandoverOpen(false)} sx={{ height: 34, borderRadius: '8px', textTransform: 'none', fontWeight: 750, color: tokenBrand.dark, borderColor: tokenNeutral.dark }}>Cancel</Button>
                <Button variant="outlined" sx={{ height: 34, borderRadius: '8px', textTransform: 'none', fontWeight: 750, color: tokenBrand.main, borderColor: tokenBrand.lightest }}>Edit Before Sending</Button>
                <Button variant="contained" startIcon={<SendIcon />} onClick={() => setIsHandoverSendDialogOpen(true)} sx={{ height: 34, borderRadius: '8px', textTransform: 'none', fontWeight: 850, bgcolor: tokenBrand.main, boxShadow: 'none', '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' } }}>Send Handover</Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isHandoverPdfPreviewOpen}
          onClose={() => setIsHandoverPdfPreviewOpen(false)}
          maxWidth={false}
          fullWidth
          PaperProps={{ sx: { width: 'min(1180px, calc(100vw - 56px))', maxHeight: 'calc(100vh - 48px)', borderRadius: '8px', border: `1px solid ${workstationVisuals.tierBorder}`, bgcolor: tokenNeutral.lightest, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ px: 1.5, py: 1.1, bgcolor: tokenCommon.white, borderBottom: `1px solid ${workstationVisuals.tierBorder}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 900, fontSize: '1rem', lineHeight: 1.15 }}>PDF Preview</Typography>
                <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: '0.72rem', mt: 0.2 }} noWrap>
                  PDF preview - {handoverDateFilter} - {handoverShiftFilter} - {handoverSelectedLines.join(', ')}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setIsHandoverPdfPreviewOpen(false)} sx={{ color: workstationVisuals.textSecondary }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 1.25, bgcolor: tokenNeutral.lightest }}>
            <Box sx={{ width: '100%', mx: 'auto', p: 1.25, borderRadius: '8px', bgcolor: tokenCommon.white, border: `1px solid ${tokenDivider}`, fontFamily: workstationVisuals.fontFamily }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 1, alignItems: 'start', pb: 1, borderBottom: `1px solid ${tokenDivider}` }}>
                <Box>
                  <Typography sx={{ color: tokenText.primary, fontSize: '1.35rem', fontWeight: 900, lineHeight: 1.1 }}>End Of Shift Summary</Typography>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.78rem', mt: 0.35 }}>
                    {activeHandoverLine} - {handoverShiftFilter} - generated from shift log, pending tasks, production, scrap and ESO signals.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Chip size="small" label="Safety OK" sx={{ height: 24, borderRadius: '999px', bgcolor: tokenSuccess.softBg, color: tokenSuccess.darker, fontWeight: 850 }} />
                  <Chip size="small" label="Quality OK" sx={{ height: 24, borderRadius: '999px', bgcolor: tokenSuccess.softBg, color: tokenSuccess.darker, fontWeight: 850 }} />
                  <Chip size="small" label={`${shiftCoverageConfidence}% coverage`} sx={{ height: 24, borderRadius: '999px', bgcolor: tokenWarning.softBg, color: tokenWarning.dark, fontWeight: 850 }} />
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(6, minmax(0, 1fr))' }, gap: 0.75, py: 1 }}>
                {handoverKpiTiles.filter((tile) => tile.label !== 'Work order').map((tile) => {
                  const Icon = tile.icon;
                  return (
                    <Box key={tile.label} sx={{ p: 0.8, borderRadius: '8px', bgcolor: tile.bg, border: `1px solid ${tokenDivider}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.6 }}>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.62rem', fontWeight: 850, textTransform: 'uppercase' }}>{tile.label}</Typography>
                        <Icon sx={{ color: tile.tone, fontSize: 16 }} />
                      </Box>
                      <Typography sx={{ color: tile.tone, fontSize: '1rem', fontWeight: 900, mt: 0.35 }}>{tile.value}</Typography>
                      <Typography sx={{ color: tokenText.secondary, fontSize: '0.65rem', mt: 0.15 }}>{tile.helper}</Typography>
                    </Box>
                  );
                })}
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1 }}>
                <Box sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <Box sx={{ px: 0.9, py: 0.65, bgcolor: tokenNeutral.lightest, borderBottom: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75 }}>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 850 }}>Shift Log</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.62rem', fontWeight: 800 }}>{handoverShiftLogEntries.length} records</Typography>
                  </Box>
                  <Box sx={{ display: 'grid' }}>
                    {handoverShiftLogEntries.map((entry) => (
                      <Box key={entry.id} sx={{ display: 'grid', gridTemplateColumns: '54px minmax(0, 1fr) auto', gap: 0.75, px: 0.9, py: 0.55, borderBottom: `1px solid ${tokenDivider}` }}>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 750 }}>{entry.createdAt}</Typography>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: tokenText.primary, fontSize: '0.76rem', fontWeight: 800 }} noWrap>{entry.title}</Typography>
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', mt: 0.1 }} noWrap>{entry.detail}</Typography>
                        </Box>
                        <Chip size="small" label={entry.type} sx={{ height: 21, borderRadius: '999px', bgcolor: tokenNeutral.lightest, color: entry.tone, '& .MuiChip-label': { px: 0.6, fontSize: '0.58rem', fontWeight: 800 } }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <Box sx={{ px: 0.9, py: 0.65, bgcolor: tokenNeutral.lightest, borderBottom: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.75 }}>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 850 }}>Shift Task Activity</Typography>
                    <Typography sx={{ color: tokenSuccess.darker, fontSize: '0.62rem', fontWeight: 850 }}>4 done / 2 open</Typography>
                  </Box>
                  <Box sx={{ display: 'grid' }}>
                    {shiftTaskActivityRows.map((row) => (
                      <Box key={row.id} sx={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 0.75, px: 0.9, py: 0.55, borderBottom: `1px solid ${tokenDivider}` }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: tokenText.primary, fontSize: '0.76rem', fontWeight: 800 }} noWrap>{row.task}</Typography>
                          <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', mt: 0.1 }}>Owner: {row.owner}</Typography>
                        </Box>
                        <Chip size="small" label={row.status} sx={{ height: 21, borderRadius: '999px', bgcolor: row.status === 'Completed' ? tokenSuccess.softBg : tokenWarning.softBg, color: row.status === 'Completed' ? tokenSuccess.darker : tokenWarning.dark, '& .MuiChip-label': { px: 0.6, fontSize: '0.58rem', fontWeight: 800 } }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.25fr 0.75fr' }, gap: 1, mt: 1 }}>
                <Box sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <Box sx={{ px: 0.9, py: 0.65, bgcolor: tokenNeutral.lightest, borderBottom: `1px solid ${tokenDivider}` }}>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 850 }}>Production / Scrap / OEE / Downtime Hour By Hour</Typography>
                  </Box>
                  <Box component="table" sx={{ width: '100%', borderCollapse: 'collapse' }}>
                    <Box component="thead" sx={{ bgcolor: tokenCommon.white }}>
                      <Box component="tr">
                        {['Hour', 'Output', 'Scrap', 'OEE', 'Downtime', 'Status'].map((header) => (
                          <Box component="th" key={header} sx={{ ...handoverTableHeaderSx, textAlign: 'left', px: 0.8, py: 0.58, borderBottom: `1px solid ${tokenDivider}` }}>{header}</Box>
                        ))}
                      </Box>
                    </Box>
                    <Box component="tbody">
                      {handoverHourlyRows.slice(0, 6).map((row) => {
                        const oeeValue = Number(row.oee.replace('%', ''));
                        const statusTone = row.state === 'Stable' || row.state === 'On target'
                          ? { bg: tokenSuccess.softBg, color: tokenSuccess.darker }
                          : row.state === 'Watch' || row.state === 'Recovering'
                            ? { bg: tokenWarning.softBg, color: tokenWarning.dark }
                            : { bg: tokenError.softBg, color: tokenError.dark };
                        return (
                          <Box component="tr" key={`pdf-${row.hour}`}>
                            <Box component="td" sx={{ px: 0.8, py: 0.58, borderBottom: `1px solid ${tokenDivider}` }}><Typography sx={handoverTableCellSx}>{row.hour}</Typography></Box>
                            <Box component="td" sx={{ px: 0.8, py: 0.58, borderBottom: `1px solid ${tokenDivider}` }}><Typography sx={{ ...handoverTableCellSx, color: tokenSuccess.darker, fontWeight: 850 }}>{row.produced}/{row.target}</Typography></Box>
                            <Box component="td" sx={{ px: 0.8, py: 0.58, borderBottom: `1px solid ${tokenDivider}` }}><Typography sx={{ ...handoverTableCellSx, color: Number(row.scrapRate.replace('%', '')) > 4 ? tokenError.main : tokenText.primary, fontWeight: 800 }}>{row.scrapRate}</Typography></Box>
                            <Box component="td" sx={{ px: 0.8, py: 0.58, borderBottom: `1px solid ${tokenDivider}` }}><Typography sx={{ ...handoverTableCellSx, color: oeeValue < 72 ? tokenError.main : oeeValue < 80 ? tokenWarning.dark : tokenSuccess.darker, fontWeight: 850 }}>{row.oee}</Typography></Box>
                            <Box component="td" sx={{ px: 0.8, py: 0.58, borderBottom: `1px solid ${tokenDivider}` }}><Typography sx={{ ...handoverTableCellSx, color: Number(row.downtime.replace('m', '')) >= 15 ? tokenError.main : tokenText.primary, fontWeight: 800 }}>{row.downtime}</Typography></Box>
                            <Box component="td" sx={{ px: 0.8, py: 0.58, borderBottom: `1px solid ${tokenDivider}` }}><Chip size="small" label={row.state} sx={{ height: 20, borderRadius: '999px', bgcolor: statusTone.bg, color: statusTone.color, '& .MuiChip-label': { px: 0.55, fontSize: '0.58rem', fontWeight: 800 } }} /></Box>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', p: 0.9 }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 850, mb: 0.65 }}>Key Events & Risks</Typography>
                  <Box sx={{ display: 'grid', gap: 0.55 }}>
                    {handoverEventEntries.slice(0, 3).map((entry) => (
                      <Box key={`risk-${entry.id}`} sx={{ p: 0.65, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.72rem', fontWeight: 850 }} noWrap>{entry.title}</Typography>
                        <Typography sx={{ color: tokenText.secondary, fontSize: '0.64rem', mt: 0.12 }}>{entry.status} - {entry.riskLevel}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr 0.75fr' }, gap: 1, mt: 1 }}>
                <Box sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', p: 0.9 }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 850, mb: 0.65 }}>Top Scrap / Loss Contributors</Typography>
                  <Box sx={{ display: 'grid', gap: 0.55 }}>
                    {scrapContributors.slice(0, 4).map((row) => (
                      <Box key={`pdf-${row.label}`} sx={{ display: 'grid', gridTemplateColumns: '112px 1fr 36px', alignItems: 'center', gap: 0.7 }}>
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.68rem', fontWeight: 800 }} noWrap>{row.label}</Typography>
                        <Box sx={{ height: 8, borderRadius: 99, bgcolor: tokenNeutral.lighter, overflow: 'hidden' }}><Box sx={{ width: `${(row.units / maxScrapUnits) * 100}%`, height: '100%', bgcolor: row.color }} /></Box>
                        <Typography sx={{ color: tokenText.primary, fontSize: '0.68rem', fontWeight: 850, textAlign: 'right' }}>{row.units}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
                <Box sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', overflow: 'hidden' }}>
                  <Box sx={{ px: 0.9, py: 0.65, bgcolor: tokenNeutral.lightest, borderBottom: `1px solid ${tokenDivider}`, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 850 }}>Pending / Next Shift Actions</Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', fontWeight: 800 }}>{nextShiftActionRows.length} items</Typography>
                  </Box>
                  {nextShiftActionRows.slice(0, 6).map((item) => (
                    <Box key={`pdf-action-${item.type}-${item.description}`} sx={{ display: 'grid', gridTemplateColumns: '86px minmax(0,1fr) 76px', gap: 0.65, px: 0.9, py: 0.62, borderBottom: `1px solid ${tokenDivider}` }}>
                      <Typography sx={{ color: item.tone, fontSize: '0.66rem', fontWeight: 850 }}>{item.type}</Typography>
                      <Typography sx={{ color: tokenText.primary, fontSize: '0.7rem', fontWeight: 750 }} noWrap>{item.description}</Typography>
                      <Typography sx={{ color: tokenText.secondary, fontSize: '0.66rem', fontWeight: 750 }} noWrap>{item.owner}</Typography>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', p: 0.9 }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 850, mb: 0.5 }}>Shift Coverage</Typography>
                  <Typography sx={{ color: tokenWarning.dark, fontSize: '1.25rem', fontWeight: 900 }}>{shiftCoverageConfidence}%</Typography>
                  <Box sx={{ height: 8, borderRadius: 99, bgcolor: tokenNeutral.lighter, overflow: 'hidden', my: 0.55 }}>
                    <Box sx={{ width: `${shiftCoverageConfidence}%`, height: '100%', bgcolor: tokenWarning.main }} />
                  </Box>
                  {shiftCoverageRows.slice(0, 3).map((row) => (
                    <Typography key={`pdf-${row.label}`} sx={{ color: tokenText.secondary, fontSize: '0.66rem', fontWeight: 750, mt: 0.32 }}>
                      {row.label}: <Box component="span" sx={{ color: tokenText.primary, fontWeight: 850 }}>{row.value}</Box>
                    </Typography>
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 1, mt: 1 }}>
                <Box sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', p: 0.9, bgcolor: tokenNeutral.lightest }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 850, mb: 0.5 }}>Notes</Typography>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', lineHeight: 1.45 }}>
                    {handoverNotes || `Maintain speed cap until ${activeHandoverLine} clears two clean hourly samples. Incoming lead to confirm pending actions during first tier check.`}
                  </Typography>
                </Box>
                <Box sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '8px', p: 0.9, bgcolor: tokenBrand.softBg }}>
                  <Typography sx={{ color: tokenBrand.dark, fontSize: '0.82rem', fontWeight: 850, mb: 0.5 }}>AI Suggestions</Typography>
                  <Box sx={{ display: 'grid', gap: 0.42 }}>
                    {handoverNoteSuggestions.slice(0, 2).map((suggestion) => (
                      <Typography key={`pdf-${suggestion.title}`} sx={{ color: tokenText.secondary, fontSize: '0.7rem', lineHeight: 1.35 }}>
                        <Box component="span" sx={{ color: tokenText.primary, fontWeight: 850 }}>{suggestion.title}:</Box> {suggestion.body}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
        <Dialog
          open={isHandoverSendDialogOpen}
          onClose={() => setIsHandoverSendDialogOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: '8px', border: `1px solid ${workstationVisuals.tierBorder}`, bgcolor: tokenNeutral.lightest, overflow: 'hidden' } }}
        >
          <DialogTitle sx={{ px: 1.5, py: 1.1, bgcolor: tokenCommon.white, borderBottom: `1px solid ${workstationVisuals.tierBorder}` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85, minWidth: 0 }}>
                <Box sx={{ width: 30, height: 30, borderRadius: '8px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <SendIcon sx={{ fontSize: 18 }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, fontSize: '0.98rem', lineHeight: 1.15 }}>Send Handover</Typography>
                  <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: '0.68rem', mt: 0.18 }} noWrap>
                    Configure recipients and delivery channels before sending the report.
                  </Typography>
                </Box>
              </Box>
              <IconButton size="small" onClick={() => setIsHandoverSendDialogOpen(false)} sx={{ color: workstationVisuals.textSecondary }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 1.25, bgcolor: tokenNeutral.lightest }}>
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1 }}>
                <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, fontSize: '0.84rem', mb: 0.7 }}>Report Content</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                  <Chip size="small" label={handoverSelectedLines.join(', ')} sx={{ height: 24, borderRadius: '8px', bgcolor: tokenBrand.softBg, color: tokenBrand.dark, fontWeight: 800 }} />
                  <Chip size="small" label={handoverShiftFilter} sx={{ height: 24, borderRadius: '8px', bgcolor: tokenCommon.white, color: workstationVisuals.tierTextLabel, border: `1px solid ${workstationVisuals.tierBorder}`, fontWeight: 800 }} />
                  <Chip size="small" label={handoverDateFilter} sx={{ height: 24, borderRadius: '8px', bgcolor: tokenCommon.white, color: workstationVisuals.tierTextLabel, border: `1px solid ${workstationVisuals.tierBorder}`, fontWeight: 800 }} />
                  <Chip size="small" label={`${activeHandoverTopics}/${handoverTopicList.length} sections`} sx={{ height: 24, borderRadius: '8px', bgcolor: tokenCommon.white, color: workstationVisuals.tierTextLabel, border: `1px solid ${workstationVisuals.tierBorder}`, fontWeight: 800 }} />
                </Box>
              </Paper>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1 }}>
                <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1 }}>
                  <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, fontSize: '0.84rem', mb: 0.7 }}>Recipients</Typography>
                  <Box sx={{ display: 'grid', gap: 0.45 }}>
                    {handoverRecipientList.map((recipient) => (
                      <Box
                        key={recipient}
                        role="button"
                        tabIndex={0}
                        onClick={() => toggleHandoverRecipient(recipient)}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          event.preventDefault();
                          toggleHandoverRecipient(recipient);
                        }}
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8, px: 0.8, py: 0.52, borderRadius: '8px', bgcolor: handoverSendTo[recipient] ? tokenBrand.softBg : tokenCommon.white, border: '1px solid rgba(15, 23, 42, 0.06)', cursor: 'pointer', '&:hover': { bgcolor: handoverSendTo[recipient] ? tokenBrand.softBg : tokenNeutral.lightest } }}
                      >
                        <Typography sx={{ color: workstationVisuals.textPrimary, fontSize: '0.72rem', fontWeight: 750 }}>{recipient}</Typography>
                        <Box sx={handoverToggleSx(handoverSendTo[recipient])}>
                          <Box sx={handoverToggleKnobSx} />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1 }}>
                  <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, fontSize: '0.84rem', mb: 0.7 }}>Delivery Channels</Typography>
                  <Box sx={{ display: 'grid', gap: 0.45 }}>
                    {handoverDeliveryChannelList.map((channel) => {
                      const active = handoverDeliveryChannels[channel];
                      const icon = channel === 'Email' ? <EmailIcon sx={{ fontSize: 15 }} /> : channel === 'Microsoft Teams' ? <TeamsIcon sx={{ fontSize: 15 }} /> : <ShiftNotesIcon sx={{ fontSize: 15 }} />;
                      return (
                        <Box
                          key={channel}
                          role="button"
                          tabIndex={0}
                          onClick={() => toggleHandoverDeliveryChannel(channel)}
                          onKeyDown={(event) => {
                            if (event.key !== 'Enter' && event.key !== ' ') return;
                            event.preventDefault();
                            toggleHandoverDeliveryChannel(channel);
                          }}
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8, px: 0.8, py: 0.52, borderRadius: '8px', bgcolor: active ? tokenSuccess.softBg : tokenCommon.white, border: '1px solid rgba(15, 23, 42, 0.06)', cursor: 'pointer', '&:hover': { bgcolor: active ? tokenSuccess.softBg : tokenNeutral.lightest } }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0, color: active ? tokenSuccess.darker : workstationVisuals.textSecondary }}>
                            {icon}
                            <Typography sx={{ color: workstationVisuals.textPrimary, fontSize: '0.72rem', fontWeight: 750 }}>{channel}</Typography>
                          </Box>
                          <Box sx={handoverToggleSx(active)}>
                            <Box sx={handoverToggleKnobSx} />
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                </Paper>
              </Box>

              <Paper elevation={0} sx={{ ...handoverSectionCardSx, p: 1 }}>
                <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, fontSize: '0.84rem', mb: 0.75 }}>Destination Details</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0.85 }}>
                  <TextField
                    label="Email recipients"
                    size="small"
                    fullWidth
                    value={handoverEmailList}
                    onChange={(event) => setHandoverEmailList(event.target.value)}
                    sx={handoverFilterFieldSx}
                  />
                  <TextField
                    label="Teams channel"
                    size="small"
                    fullWidth
                    value={handoverTeamsChannel}
                    onChange={(event) => setHandoverTeamsChannel(event.target.value)}
                    sx={handoverFilterFieldSx}
                  />
                </Box>
              </Paper>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: 1.15, flexWrap: 'wrap' }}>
              <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: '0.7rem', fontWeight: 700 }}>
                {selectedHandoverRecipients.length} recipient groups, {selectedHandoverChannels.length} delivery channels.
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <Button variant="outlined" onClick={() => setIsHandoverSendDialogOpen(false)} sx={{ height: 34, borderRadius: '8px', textTransform: 'none', fontWeight: 750, color: tokenBrand.dark, borderColor: tokenNeutral.dark }}>Back</Button>
                <Button
                  variant="contained"
                  startIcon={<SendIcon />}
                  disabled={!selectedHandoverRecipients.length || !selectedHandoverChannels.length}
                  onClick={() => {
                    setIsHandoverSendDialogOpen(false);
                    setIsShiftHandoverOpen(false);
                  }}
                  sx={{ height: 34, borderRadius: '8px', textTransform: 'none', fontWeight: 850, bgcolor: tokenBrand.main, boxShadow: 'none', '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' } }}
                >
                  Send Report
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </Paper>
      <SparePartsInventoryDrawer
        part={selectedSparePartsInventoryPart}
        open={Boolean(selectedSparePartsInventoryPart)}
        onClose={() => setSelectedSparePartsInventoryPart(null)}
        purchaseRequested={selectedSparePartsInventoryPart ? requestedSparePartsPurchasePartIds.includes(selectedSparePartsInventoryPart.id) : false}
        onRequestPurchase={requestSparePartsPurchase}
      />
      <MaintenanceRequestDrawer
        open={Boolean(selectedMaintenanceRequestCard)}
        card={selectedMaintenanceRequestCard}
        onClose={() => {
          logbook?.setIsShiftLogbookSourceDrawerOpen?.(false);
          setSelectedMaintenanceRequestCard(null);
        }}
        onAcceptToPlanning={(card) => {
          setMaintenanceDrawerToast(`${card.requestContext?.requestId ?? card.id} accepted to planning.`);
          setSelectedMaintenanceRequestCard(null);
        }}
        onPlanNow={(card) => {
          setSelectedMaintenanceRequestCard(null);
          setMaintenanceWorkOrderDraft(buildWorkOrderDraftFromRequest(card));
          setMaintenanceWorkOrderTab('attachments');
        }}
        onLinkToExistingWork={(card) => {
          setMaintenanceDrawerToast(`${card.requestContext?.requestId ?? card.id} linked to existing work.`);
          setSelectedMaintenanceRequestCard(null);
        }}
        onReject={(card) => {
          setMaintenanceDrawerToast(`${card.requestContext?.requestId ?? card.id} rejected.`);
          setSelectedMaintenanceRequestCard(null);
        }}
      />
      <CreateWorkOrderDrawer
        open={Boolean(maintenanceWorkOrderDraft)}
        activeTab={maintenanceWorkOrderTab}
        initialDraft={maintenanceWorkOrderDraft}
        onTabChange={setMaintenanceWorkOrderTab}
        onClose={closeMaintenanceWorkOrderDrawer}
        onSubmit={(draft) => {
          setMaintenanceDrawerToast(`${draft.drawerTitle ?? draft.sourceRequestId ?? draft.sourceCardId ?? 'Work Order'} updated.`);
          closeMaintenanceWorkOrderDrawer();
        }}
        footerExtraActions={(draft) => (
          <Button
            variant="outlined"
            onClick={() => startRcaFromWorkOrderDraft(draft)}
            sx={{
              ...shiftLogbookButtonSx,
              height: 38,
              color: tokenBrand.main,
              borderColor: tokenBrand.main,
              bgcolor: 'background.paper',
              fontSize: 13,
              px: 2,
              '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.dark },
            }}
          >
            Start RCA
          </Button>
        )}
      />
      {selectedEsoReport ? (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: { xs: '100%', sm: logbookSideDrawerWidth },
            zIndex: 1402,
            bgcolor: 'background.paper',
            borderLeft: `1px solid ${tokenDivider}`,
            boxShadow: '-12px 0 28px rgba(0,31,155,0.12)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ px: 2, py: 1.35, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
            <Box sx={{ minWidth: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, minWidth: 0 }}>
                <Typography sx={{ color: tokenText.primary, fontSize: '1.08rem', fontWeight: 700 }} noWrap>
                  Condition Report
                </Typography>
                <Chip label={selectedEsoReport.id} size="small" sx={{ height: 22, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontWeight: 500, '& .MuiChip-label': { px: 0.8, fontSize: '0.62rem' } }} />
              </Box>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', mt: 0.25 }} noWrap>
                {selectedEsoReport.type} • {selectedEsoReport.area} / {selectedEsoReport.line}
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => {
                logbook?.setIsShiftLogbookSourceDrawerOpen?.(false);
                setSelectedEsoReport(null);
                setSelectedEsoReportMode('view');
              }}
              sx={{ color: tokenBrand.main, '&:hover': { bgcolor: tokenBrand.softBg } }}
            >
              <CloseIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>

          <Box sx={{ px: 1.75, py: 1.35, overflowY: 'auto', flex: 1, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', gap: 1.05 }}>
            <Paper elevation={0} sx={{ ...shiftLogbookCompactCardSx, p: 1.25 }}>
              <Typography sx={{ color: tokenText.primary, fontSize: '1rem', fontWeight: 700, mb: 1 }}>
                {selectedEsoReport.area}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75 }}>
                {[
                  ['ESO type', selectedEsoReport.type],
                  ['Status', selectedEsoReport.status],
                  ['Observer', selectedEsoReport.observer],
                  ['Supervisor', selectedEsoReport.supervisor],
                  ['Location', `${selectedEsoReport.area} - ${selectedEsoReport.line}`],
                  ['Occurrence', selectedEsoReport.occurrenceDate],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ p: 0.8, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.57rem', fontWeight: 500, textTransform: 'uppercase' }}>{label}</Typography>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.76rem', fontWeight: 700, mt: 0.25 }} noWrap>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ ...shiftLogbookCompactCardSx, p: 1.25 }}>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', mb: 0.45 }}>What happened</Typography>
              <Typography sx={{ color: tokenText.primary, fontSize: '0.82rem', fontWeight: 400, lineHeight: 1.45 }}>
                {selectedEsoReport.type === 'Near Miss'
                  ? 'Near miss recorded during the shift. Review containment, corrective follow-up, and operator handoff before closure.'
                  : selectedEsoReport.status === 'CLOSED'
                    ? 'Condition report was reviewed and contained. Closure evidence is available in the Logbook context.'
                    : 'Oil spill / unsafe condition requires review, containment confirmation, and owner assignment before handover.'}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ ...shiftLogbookSubtleCardSx, p: 1.25 }}>
              <Typography sx={{ color: tokenBrand.main, fontSize: '0.83rem', fontWeight: 700, mb: 0.75 }}>
                <SparkleIcon sx={{ color: tokenWarning.dark, fontSize: 15, mr: 0.35, verticalAlign: '-2px' }} />
                BLU.AI readout
              </Typography>
              <Box sx={{ display: 'grid', gap: 0.65 }}>
                {[
                  ['Safety signal', selectedEsoReport.status === 'CLOSED' ? 'Closure is documented; keep the item visible for shift handover.' : 'Open safety signal should be reviewed before releasing the area.'],
                  ['Linked work', 'Check related maintenance requests and confirm no duplicate corrective work is being opened.'],
                  ['Next best step', selectedEsoReport.status === 'CLOSED' ? 'Validate the record with the shift lead.' : 'Start RCA if this condition is repeated or materially impacts the line.'],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ p: 0.8, borderRadius: '8px', bgcolor: 'background.paper', border: `1px solid ${tokenDivider}` }}>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.58rem', fontWeight: 500, textTransform: 'uppercase' }}>{label}</Typography>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.74rem', fontWeight: 400, lineHeight: 1.35, mt: 0.2 }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ ...shiftLogbookCompactCardSx, p: 1.25 }}>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.62rem', fontWeight: 500, textTransform: 'uppercase', mb: 0.75 }}>Media captured</Typography>
              {['Video_04.mp4', 'IMG_0123.jpg'].map((file) => (
                <Box key={file} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.45 }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.78rem', fontWeight: 700 }}>{file}</Typography>
                  <CheckCircleOutlineIcon sx={{ color: tokenSuccess.darker, fontSize: 18 }} />
                </Box>
              ))}
            </Paper>
          </Box>

          <Box sx={{ px: 1.75, py: 1.15, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, borderTop: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
            <Button
              variant="outlined"
              onClick={() => startRcaFromEsoReport(selectedEsoReport)}
              disabled={Boolean(logbook?.isShiftLogbookRcaDrawerOpen || logbook?.isShiftLogbookFiveWhysDrawerOpen || logbook?.isShiftLogbookFishboneOpen || logbook?.isShiftLogbookFaultTreeOpen)}
              sx={{ ...shiftLogbookButtonSx, height: 38, color: tokenBrand.main, borderColor: tokenBrand.main, fontSize: 13, px: 2, '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.dark } }}
            >
              Start RCA
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setSelectedEsoReport(null);
                setSelectedEsoReportMode('view');
              }}
              sx={{ ...shiftLogbookContainedButtonSx, height: 38, fontSize: 13, px: 2.3 }}
            >
              Done
            </Button>
          </Box>
        </Box>
      ) : null}
      {selectedRcaEntry ? (() => {
        const linkedItem = selectedRcaEntry.title.includes('Syringe')
          ? { type: 'Maintenance Work Order', id: 'WO-55292-BRG', equipment: 'Syringe Assembly Module', owner: 'Daniel Ortega' }
          : selectedRcaEntry.title.includes('cooling')
            ? { type: 'Maintenance Work Order', id: 'WO 606034609', equipment: 'Cooling Circuit Flow', owner: 'Carlos Mendez' }
            : { type: 'Maintenance Work Order', id: 'WO 606034603', equipment: 'Conveyor CV-210', owner: selectedRcaEntry.reporter };
        const methodLabel = selectedRcaEntry.ticketType === 'RCA' ? 'Submitted RCA' : selectedRcaEntry.ticketType;
        const statusTone = selectedRcaEntry.status === 'Closed' ? '#16A34A' : selectedRcaEntry.status === 'In Progress' ? '#F59E0B' : '#EF4444';
        const rcaMethodDetails = selectedRcaEntry.ticketType === '5 Whys'
          ? {
            title: '5 Whys draft',
            rows: [
              ['1. Why?', 'Belt drift was detected near the transfer point.'],
              ['2. Why?', 'Roller alignment is not holding after speed changes.'],
              ['3. Why?', 'Inspection confirmation was skipped after adjustment.'],
              ['4. Why?', 'Shift handoff did not flag the repeat drift pattern.'],
              ['5. Root cause', 'Alignment verification is not embedded in restart standard work.'],
            ],
          }
          : selectedRcaEntry.ticketType === 'Fishbone'
            ? {
              title: 'Fishbone captured causes',
              rows: [
                ['People', 'Handoff did not confirm lubrication check ownership.'],
                ['Machine', 'Syringe Assembly module shows lubrication variation.'],
                ['Process', 'PM inspection cadence does not catch the gap early.'],
                ['Material', 'Seal kit variability may be contributing to repeat friction.'],
                ['Measurement', 'OEE and maintenance notes show repeat drift after restart.'],
              ],
            }
            : selectedRcaEntry.ticketType === 'Fault Tree Analysis'
              ? {
                title: 'Fault tree branches',
                rows: [
                  ['Top event', 'Conveyor CV-210 RCA event'],
                  ['Branch 1', 'Lubrication Failure: low oil level, incorrect lubricant, missed PM.'],
                  ['Branch 2', 'Mechanical Misalignment: loose coupling, motor-shaft offset, improper installation.'],
                  ['Branch 3', 'Component Wear: bearing wear, seal degradation, vibration history.'],
                  ['Recommended checks', 'Inspect lubrication schedule, verify shaft alignment, inspect bearing wear pattern.'],
                ],
              }
            : {
              title: 'Submitted RCA summary',
              rows: [
                ['Method', 'RCA submitted and linked to closure evidence.'],
                ['Root cause', 'Cooling circuit flow instability was traced to partial blockage.'],
                ['Containment', 'Flow check completed and downstream buffer monitored.'],
                ['Verification', 'Closure confirmed by maintenance lead and production owner.'],
              ],
            };
        const fiveWhysReviewSteps = rcaMethodDetails.rows.map(([label, value]) => ({
          label,
          answer: value,
        }));
        const fishboneReviewRows = {
          People: [rcaMethodDetails.rows.find(([label]) => label === 'People')?.[1] ?? 'Handoff and ownership review pending.'],
          Machine: [rcaMethodDetails.rows.find(([label]) => label === 'Machine')?.[1] ?? `${linkedItem.equipment} requires equipment-side confirmation.`],
          Process: [rcaMethodDetails.rows.find(([label]) => label === 'Process')?.[1] ?? 'Process verification must be confirmed before closure.'],
          Material: [rcaMethodDetails.rows.find(([label]) => label === 'Material')?.[1] ?? 'Material contribution not confirmed.'],
          Environment: [rcaMethodDetails.rows.find(([label]) => label === 'Environment')?.[1] ?? 'Environment contribution not confirmed.'],
          Measurement: [rcaMethodDetails.rows.find(([label]) => label === 'Measurement')?.[1] ?? 'Measurement/OEE trend must be reviewed.'],
        };
        const openSelectedRcaWorkspace = () => {
          if (!logbook) return;

          logbook.setIsShiftLogbookSourceDrawerOpen?.(true);
          logbook.setShiftLogbookMaintenanceReviewDetails?.({
            source: linkedItem.type,
            number: selectedRcaEntry.id,
            workOrder: linkedItem.id,
            title: selectedRcaEntry.title,
            description: selectedRcaEntry.title,
            problemDescription: selectedRcaEntry.title,
            equipment: linkedItem.equipment,
            location: `${selectedRcaEntry.line} - ${selectedRcaEntry.zone}`,
            reportedBy: selectedRcaEntry.reporter,
            line: selectedRcaEntry.line,
            zone: selectedRcaEntry.zone,
            shift: selectedRcaEntry.shift,
            riskLevel: selectedRcaEntry.riskLevel,
            status: selectedRcaEntry.status,
            date: selectedRcaEntry.createdAt,
            rcaReviewMode: true,
            rcaMethod: selectedRcaEntry.ticketType,
            rcaFishboneRows: fishboneReviewRows,
          });
          logbook.setShiftLogbookRcaSource?.('Maintenance Work Order');
          logbook.setShiftLogbookRcaNumber?.(selectedRcaEntry.id);
          logbook.setShiftLogbookFiveWhysProblem?.(selectedRcaEntry.title);
          logbook.setShiftLogbookFiveWhysSteps?.(fiveWhysReviewSteps);
          setSelectedRcaEntry(null);

          if (selectedRcaEntry.ticketType === 'Fishbone') {
            logbook.openShiftLogbookFishboneWorkspace?.();
            return;
          }
          if (selectedRcaEntry.ticketType === 'Fault Tree Analysis') {
            logbook.openShiftLogbookFaultTreeWorkspace?.();
            return;
          }
          logbook.openShiftLogbookFiveWhysDrawer?.();
        };

        return (
          <Box
            sx={{
              position: 'fixed',
              top: 48,
              right: 0,
              bottom: 0,
              width: { xs: '100%', sm: logbookSideDrawerWidth },
              zIndex: 1404,
              bgcolor: 'background.paper',
              borderLeft: `1px solid ${tokenDivider}`,
              boxShadow: '-12px 0 28px rgba(0,31,155,0.12)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Box sx={{ px: 2, py: 1.35, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
              <Box sx={{ minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65, minWidth: 0 }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '1.08rem', fontWeight: 700 }} noWrap>
                    {selectedRcaEntry.id}
                  </Typography>
                  <Chip label={methodLabel} size="small" sx={{ height: 22, bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenDivider}`, fontWeight: 500, '& .MuiChip-label': { px: 0.8, fontSize: '0.62rem' } }} />
                </Box>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', mt: 0.2 }} noWrap>
                  RCA detail linked to {linkedItem.id}
                </Typography>
              </Box>
              <IconButton size="small" onClick={() => setSelectedRcaEntry(null)} sx={{ color: tokenBrand.main, '&:hover': { bgcolor: tokenBrand.softBg } }}>
                <CloseIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Box>

            <Box sx={{ px: 1.55, py: 1.35, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1.05, flex: 1, bgcolor: 'background.default' }}>
              <Paper elevation={0} sx={{ ...shiftLogbookCompactCardSx, p: 1.1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mb: 0.85 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: tokenText.primary, fontSize: '1rem', fontWeight: 700, lineHeight: 1.18 }}>
                      {selectedRcaEntry.title}
                    </Typography>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', mt: 0.35 }}>
                      {selectedRcaEntry.line} • {selectedRcaEntry.zone} • {selectedRcaEntry.shift}
                    </Typography>
                  </Box>
                  <Chip label={selectedRcaEntry.status} size="small" sx={{ height: 22, bgcolor: `${statusTone}12`, color: statusTone, border: `1px solid ${tokenDivider}`, fontWeight: 500, '& .MuiChip-label': { px: 0.8, fontSize: '0.66rem' } }} />
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.65 }}>
                  {[
                    ['Method', methodLabel],
                    ['Status', selectedRcaEntry.status],
                    ['Risk', selectedRcaEntry.riskLevel],
                    ['Owner', selectedRcaEntry.reporter],
                    ['Created', selectedRcaEntry.createdAt],
                  ].map(([label, value]) => (
                    <Box key={label} sx={{ p: 0.75, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                      <Typography sx={{ color: tokenText.secondary, fontSize: '0.56rem', fontWeight: 500, textTransform: 'uppercase' }}>{label}</Typography>
                      <Typography sx={{ color: tokenText.primary, fontSize: '0.76rem', fontWeight: 700, mt: 0.25 }} noWrap>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ ...shiftLogbookCompactCardSx, p: 1.1 }}>
                <Typography sx={{ ...shiftLogbookSectionTitleSx, mb: 0.75 }}>Associated item</Typography>
                <Box sx={{ p: 0.9, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}`, borderLeft: `3px solid ${tokenBrand.main}` }}>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.6rem', fontWeight: 500, textTransform: 'uppercase' }}>{linkedItem.type}</Typography>
                  <Typography sx={{ color: tokenText.primary, fontSize: '0.9rem', fontWeight: 700, mt: 0.15 }}>{linkedItem.equipment}</Typography>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.72rem', mt: 0.15 }}>{linkedItem.id} • Owner: {linkedItem.owner}</Typography>
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ ...shiftLogbookCompactCardSx, p: 1.1 }}>
                <Typography sx={{ ...shiftLogbookSectionTitleSx, mb: 0.75 }}>{rcaMethodDetails.title}</Typography>
                <Box sx={{ display: 'grid', gap: 0.55 }}>
                  {rcaMethodDetails.rows.map(([label, value]) => (
                    <Box key={label} sx={{ p: 0.72, borderRadius: '8px', bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenDivider}` }}>
                      <Typography sx={{ color: tokenText.secondary, fontSize: '0.58rem', fontWeight: 500, textTransform: 'uppercase' }}>{label}</Typography>
                      <Typography sx={{ color: tokenText.primary, fontSize: '0.73rem', fontWeight: 400, lineHeight: 1.3, mt: 0.2 }}>{value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ ...shiftLogbookSubtleCardSx, p: 1.1 }}>
                <Typography sx={{ color: tokenBrand.main, fontSize: '0.82rem', fontWeight: 700, mb: 0.6 }}>
                  <SparkleIcon sx={{ color: tokenWarning.dark, fontSize: 15, mr: 0.35, verticalAlign: '-2px' }} />
                  BLU.AI RCA readout
                </Typography>
                <Typography sx={{ color: tokenText.secondary, fontSize: '0.76rem', lineHeight: 1.45 }}>
                  RCA is tied to {linkedItem.equipment}. Review linked work history, latest logbook notes, and the method draft before closing the corrective loop.
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ px: 1.6, py: 1.15, display: 'flex', justifyContent: 'space-between', gap: 1, borderTop: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setShiftLogbookCategory('Maintenance Work Order');
                  setShiftLogbookSearch(linkedItem.equipment);
                  setSelectedRcaEntry(null);
                }}
                sx={{ ...shiftLogbookButtonSx, height: 36, color: tokenBrand.main, borderColor: tokenBrand.main, bgcolor: 'background.paper', px: 1.8, '&:hover': { bgcolor: tokenBrand.softBg, borderColor: tokenBrand.dark } }}
              >
                Open linked item
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 17 }} />}
                onClick={openSelectedRcaWorkspace}
                sx={{
                  ...shiftLogbookContainedButtonSx,
                  height: 36,
                  fontSize: 13,
                  px: 2.3,
                  '& .MuiButton-startIcon': { color: 'inherit' },
                }}
              >
                {selectedRcaEntry.status === 'Closed' ? 'Review RCA' : 'Continue RCA'}
              </Button>
            </Box>
          </Box>
        );
      })() : null}
      <Dialog
        open={Boolean(selectedCilLogRow)}
        onClose={() => setSelectedCilLogRow(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: '8px', border: `1px solid ${tokenDivider}`, boxShadow: 'none' } }}
      >
        {selectedCilLogRow ? (
          <>
            <DialogTitle sx={{ px: 2, py: 1.4, borderBottom: `1px solid ${tokenDivider}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: tokenText.primary, fontSize: '1rem', fontWeight: 700 }}>
                    {selectedCilLogRow.type === 'CIL' ? 'CIL log' : 'Centerline log'}
                  </Typography>
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', mt: 0.15 }}>{selectedCilLogRow.id}</Typography>
                </Box>
                <IconButton size="small" onClick={() => setSelectedCilLogRow(null)}><CloseIcon fontSize="small" /></IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 2 }}>
              <Typography sx={{ color: tokenText.primary, fontSize: '0.95rem', fontWeight: 700, mb: 1.25 }}>{selectedCilLogRow.task}</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', borderTop: `1px solid ${tokenDivider}`, borderLeft: `1px solid ${tokenDivider}` }}>
                {[
                  ['Equipment', selectedCilLogRow.equipment],
                  ['Location', `${selectedCilLogRow.line} / ${selectedCilLogRow.area}`],
                  ['Logged time', selectedCilLogRow.scheduled],
                  ['Shift', selectedCilLogRow.shift],
                  ['Responsible', selectedCilLogRow.owner],
                  ['Status', selectedCilLogRow.status],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ p: 1, borderRight: `1px solid ${tokenDivider}`, borderBottom: `1px solid ${tokenDivider}`, bgcolor: tokenCommon.white }}>
                    <Typography sx={{ color: tokenText.secondary, fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</Typography>
                    <Typography sx={{ color: tokenText.primary, fontSize: '0.8rem', fontWeight: 600, mt: 0.25 }}>{value}</Typography>
                  </Box>
                ))}
              </Box>
              <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', lineHeight: 1.45, mt: 1.25 }}>
                Read-only shift record. Execution and scheduling changes are managed in the CIL and Centerline workspaces.
              </Typography>
            </DialogContent>
          </>
        ) : null}
      </Dialog>
      <Snackbar open={Boolean(maintenanceDrawerToast)} autoHideDuration={3000} onClose={() => setMaintenanceDrawerToast(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setMaintenanceDrawerToast(null)} severity="success" variant="filled" sx={{ borderRadius: 2 }}>
          {maintenanceDrawerToast}
        </Alert>
      </Snackbar>
    </Box>
  );
};

function SapBadge({ compact = false }: { compact?: boolean }) {
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        ml: 0.45,
        px: compact ? 0.42 : 0.55,
        height: compact ? 14 : 18,
        minWidth: compact ? 24 : 30,
        borderRadius: 0.45,
        background: 'linear-gradient(135deg, #00A1E0 0%, #0B5CAB 100%)',
        color: '#FFFFFF',
        fontSize: compact ? '0.48rem' : '0.56rem',
        fontWeight: 950,
        lineHeight: 1,
        letterSpacing: 0,
        verticalAlign: '1px',
        boxShadow: '0 3px 7px rgba(11,92,171,0.20)',
      }}
    >
      SAP
    </Box>
  );
}

type EquipmentViewAsset = {
  key: string;
  label: string;
  title: string;
  src: string;
  type: 'view' | 'detail';
  part: string;
  note: string;
  orbitFrame?: number;
  yaw?: string;
};

const equipmentViewAssets: readonly EquipmentViewAsset[] = [
  { key: 'orbit-iso-left', label: '-45°', title: 'Machine view - isometric', src: '/images/shift-logbook-equipment-twin/twin-orbit-01.png', type: 'view', part: 'Main_Frame', note: 'Interactive orbit frame generated from the uploaded equipment angle.', orbitFrame: 0, yaw: '-45°' },
  { key: 'orbit-front', label: '0°', title: 'Machine view - front', src: '/images/shift-logbook-equipment-twin/twin-orbit-02.png', type: 'view', part: 'Main_Frame', note: 'Front orbit frame with the equipment isolated from the studio background.', orbitFrame: 1, yaw: '0°' },
  { key: 'orbit-front-right', label: '20°', title: 'Machine view - right', src: '/images/shift-logbook-equipment-twin/twin-orbit-03.png', type: 'view', part: 'Conveyor_Exit', note: 'Right-hand orbit frame for conveyor and tray context.', orbitFrame: 2, yaw: '20°' },
  { key: 'orbit-wide-front', label: '35°', title: 'Machine view - wide', src: '/images/shift-logbook-equipment-twin/twin-orbit-04.png', type: 'view', part: 'Safety_Guarding', note: 'Wide orbit frame showing full guarding, HMI and filling system.', orbitFrame: 3, yaw: '35°' },
  { key: 'orbit-top', label: 'Top', title: 'Machine view - top', src: '/images/shift-logbook-equipment-twin/twin-orbit-05.png', type: 'view', part: 'Conveyor_Belts', note: 'Top orbit frame for belt routing, filling system and tray exit.', orbitFrame: 4, yaw: 'Top' },
  { key: 'map', label: 'Map', title: 'Machine Map', src: '/images/shift-logbook-equipment-views/00_original_reference_with_hotspots.png', type: 'view', part: 'Main_Frame', note: 'Live equipment photo map with the key machine stations.' },
  { key: 'feeder', label: 'Filling', title: 'Filling system close-up', src: '/images/shift-logbook-equipment-views/07_feeder_bowl_closeup.png', type: 'detail', part: 'Feeder_Bowl', note: 'Filling system context tied to the spare parts list.' },
  { key: 'assembly', label: 'Assembly', title: 'Syringe assembly close-up', src: '/images/shift-logbook-equipment-views/08_syringe_assembly_closeup.png', type: 'detail', part: 'Syringe_Assembly', note: 'Assembly station tied to WO-55292-BRG bearing replacement.' },
  { key: 'vision', label: 'Vision', title: 'Vision inspect close-up', src: '/images/shift-logbook-equipment-views/09_vision_inspect_closeup.png', type: 'detail', part: 'Vision_Inspect', note: 'Camera inspection and post-restart QA gate.' },
  { key: 'conveyor', label: 'Exit', title: 'Conveyor exit close-up', src: '/images/shift-logbook-equipment-views/10_conveyor_exit_closeup.png', type: 'detail', part: 'Conveyor_Exit', note: 'Exit station feeding the output tray.' },
  { key: 'tray', label: 'Tray', title: 'Output tray close-up', src: '/images/shift-logbook-equipment-views/11_output_tray_closeup.png', type: 'detail', part: 'Output_Tray', note: 'Output tray waiting for restart sample release.' },
  { key: 'hmi', label: 'HMI', title: 'HMI panel close-up', src: '/images/shift-logbook-equipment-views/12_hmi_panel_closeup.png', type: 'detail', part: 'HMI_Panel', note: 'HMI permissive and restart controls.' },
];

const equipmentPartLabels: Record<string, string> = {
  Feeder_Bowl: 'Filling System',
  Vision_Inspect: 'Vision Inspect',
  Syringe_Assembly: 'Syringe Assembly',
  Conveyor_Exit: 'Conveyor Exit',
  Output_Tray: 'Output Tray',
  Safety_Guarding: 'Safety Guarding',
  Main_Frame: 'Main Frame',
  HMI_Panel: 'HMI Panel',
  Conveyor_Belts: 'Conveyor Belts',
};

const equipmentPartTelemetry: Record<string, { status: string; speed: string; oee: string; scrap: string; signal: string; tone: string }> = {
  Feeder_Bowl: { status: 'Running', speed: '42 ppm', oee: '91%', scrap: '0.4%', signal: 'Filling flow stable', tone: '#22C55E' },
  Vision_Inspect: { status: 'Watch', speed: '38 ppm', oee: '78%', scrap: '1.1%', signal: 'Camera gate pending restart check', tone: '#F97316' },
  Syringe_Assembly: { status: 'Critical', speed: '24 ppm', oee: '61%', scrap: '2.8%', signal: 'Bearing WO blocking full-speed release', tone: '#EF4444' },
  Conveyor_Exit: { status: 'Watch', speed: '31 ppm', oee: '74%', scrap: '1.2%', signal: 'Intermittent belt tracking vibration', tone: '#F97316' },
  Output_Tray: { status: 'Hold', speed: '0 trays', oee: '72%', scrap: '0.9%', signal: 'Restart sample waiting QA release', tone: '#2563EB' },
  Safety_Guarding: { status: 'Verified', speed: 'Closed', oee: '100%', scrap: '0%', signal: 'Guarding permissive healthy', tone: '#22C55E' },
  Main_Frame: { status: 'Watch', speed: '38 ppm', oee: '68%', scrap: '1.6%', signal: 'Line constrained by assembly module', tone: '#F97316' },
  HMI_Panel: { status: 'Needs ack', speed: '3 alarms', oee: '68%', scrap: '1.6%', signal: 'Restart checklist open', tone: '#F97316' },
  Conveyor_Belts: { status: 'Running', speed: '38 ppm', oee: '84%', scrap: '0.8%', signal: 'Micro-stops trending down', tone: '#22C55E' },
};

const equipmentHotspots = [
  { part: 'Feeder_Bowl', assetKey: 'feeder', top: '20%', left: '64%', tone: '#22C55E' },
  { part: 'Syringe_Assembly', assetKey: 'assembly', top: '47%', left: '43%', tone: '#EF4444' },
  { part: 'Vision_Inspect', assetKey: 'vision', top: '64%', left: '19%', tone: '#2563EB' },
  { part: 'Conveyor_Exit', assetKey: 'conveyor', top: '70%', left: '74%', tone: '#F97316' },
  { part: 'Output_Tray', assetKey: 'tray', top: '76%', left: '86%', tone: '#2563EB' },
  { part: 'HMI_Panel', assetKey: 'hmi', top: '55%', left: '48%', tone: '#F97316' },
] as const;

const equipmentPartFocus: Record<string, { frameKey: string; zoom: number; tilt: number }> = {
  Feeder_Bowl: { frameKey: 'orbit-top', zoom: 1.42, tilt: -8 },
  Syringe_Assembly: { frameKey: 'orbit-iso-left', zoom: 1.34, tilt: 3 },
  Vision_Inspect: { frameKey: 'orbit-front', zoom: 1.36, tilt: 2 },
  Conveyor_Exit: { frameKey: 'orbit-front-right', zoom: 1.32, tilt: 1 },
  Output_Tray: { frameKey: 'orbit-front-right', zoom: 1.48, tilt: 0 },
  HMI_Panel: { frameKey: 'orbit-iso-left', zoom: 1.44, tilt: 1 },
  Conveyor_Belts: { frameKey: 'orbit-top', zoom: 1.22, tilt: -7 },
  Safety_Guarding: { frameKey: 'orbit-wide-front', zoom: 1.12, tilt: 0 },
  Main_Frame: { frameKey: 'orbit-iso-left', zoom: 1, tilt: 0 },
};

export function EquipmentFocusScene({
  onSelectPart,
}: {
  onSelectPart: (part: string) => void;
}) {
  const orbitAssets = equipmentViewAssets.filter((asset) => asset.type === 'view' && asset.orbitFrame !== undefined);
  const [activeAssetKey, setActiveAssetKey] = React.useState(orbitAssets[0]?.key ?? 'map');
  const [activePart, setActivePart] = React.useState('Main_Frame');
  const [zoom, setZoom] = React.useState(1);
  const [tilt, setTilt] = React.useState(0);
  const [isDragging, setIsDragging] = React.useState(false);
  const [motionOn, setMotionOn] = React.useState(true);
  const [isFocusMode, setIsFocusMode] = React.useState(false);
  const [hoveredPart, setHoveredPart] = React.useState<string | null>(null);
  const [hoveredPartAnchor, setHoveredPartAnchor] = React.useState<{ left: number; top: number } | null>(null);
  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const dragStartRef = React.useRef({ pointerX: 0, pointerY: 0, frameIndex: 0, tilt: 0 });
  const activeAsset = equipmentViewAssets.find((asset) => asset.key === activeAssetKey) ?? orbitAssets[0] ?? equipmentViewAssets[0];
  const activeOrbitIndex = Math.max(0, orbitAssets.findIndex((asset) => asset.key === activeAsset.key));
  const viewAssets = orbitAssets;
  const detailAssets = equipmentViewAssets.filter((asset) => asset.type === 'detail');
  const activePartLabel = equipmentPartLabels[activePart] ?? activePart;
  const activeTelemetry = equipmentPartTelemetry[activePart] ?? equipmentPartTelemetry.Main_Frame;
  const showHotspots = activeAsset.type === 'view';
  const hoveredHotspot = hoveredPart ? equipmentHotspots.find((hotspot) => hotspot.part === hoveredPart) : undefined;
  const hoveredPartLabel = hoveredPart ? equipmentPartLabels[hoveredPart] ?? hoveredPart : '';
  const hoveredTelemetry = hoveredPart ? equipmentPartTelemetry[hoveredPart] ?? equipmentPartTelemetry.Main_Frame : undefined;

  const showEquipmentHover = (part: string, element: HTMLElement) => {
    const viewportRect = viewportRef.current?.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();
    if (!viewportRect) {
      setHoveredPart(part);
      setHoveredPartAnchor(null);
      return;
    }

    const cardWidth = 246;
    const cardHeight = 126;
    const rawLeft = elementRect.left - viewportRect.left + 14;
    const rawTop = elementRect.bottom - viewportRect.top + 8;
    setHoveredPart(part);
    setHoveredPartAnchor({
      left: Math.min(Math.max(rawLeft, 12), Math.max(12, viewportRect.width - cardWidth - 12)),
      top: rawTop > viewportRect.height - cardHeight - 12
        ? Math.max(12, elementRect.top - viewportRect.top - cardHeight - 8)
        : Math.max(12, rawTop),
    });
  };

  const hideEquipmentHover = () => {
    setHoveredPart(null);
    setHoveredPartAnchor(null);
  };

  const selectAsset = (asset: typeof equipmentViewAssets[number]) => {
    setActiveAssetKey(asset.key);
    setZoom(1);
    setTilt(asset.key === 'orbit-top' ? -7 : 0);
  };

  const focusPart = (part: string) => {
    const focus = equipmentPartFocus[part] ?? equipmentPartFocus.Main_Frame;
    setActivePart(part);
    setActiveAssetKey(focus.frameKey);
    setZoom(focus.zoom);
    setTilt(focus.tilt);
    onSelectPart(equipmentPartLabels[part] ?? part);
  };

  const adjustZoom = (delta: number) => {
    setZoom((value) => Math.min(3.8, Math.max(0.72, Number((value + delta).toFixed(2)))));
  };

  const resetCamera = () => {
    setActivePart('Main_Frame');
    setZoom(1);
    setTilt(activeAsset.key === 'orbit-top' ? -7 : 0);
    onSelectPart(equipmentPartLabels.Main_Frame);
  };

  const onViewportWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = viewportRef.current?.getBoundingClientRect();
    const nextZoom = Math.min(3.8, Math.max(0.72, Number((zoom + (event.deltaY > 0 ? -0.16 : 0.16)).toFixed(2))));
    if (!rect) {
      setZoom(nextZoom);
      return;
    }

    setZoom(nextZoom);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      frameIndex: activeOrbitIndex < 0 ? 0 : activeOrbitIndex,
      tilt,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const dragStart = dragStartRef.current;
    const deltaX = event.clientX - dragStart.pointerX;
    const deltaY = event.clientY - dragStart.pointerY;
    const frameShift = Math.round(deltaX / 92);
    const nextIndex = ((dragStart.frameIndex + frameShift) % orbitAssets.length + orbitAssets.length) % orbitAssets.length;
    const nextAsset = orbitAssets[nextIndex];
    if (nextAsset && activeAssetKey !== nextAsset.key) {
      setActiveAssetKey(nextAsset.key);
    }
    setTilt(Math.max(-12, Math.min(10, Number((dragStart.tilt - deltaY / 26).toFixed(1)))));
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return (
    <Box
      sx={{
        position: isFocusMode ? 'fixed' : 'absolute',
        inset: isFocusMode ? '44px 0 0 0' : 0,
        zIndex: isFocusMode ? 1250 : 2,
        overflow: 'hidden',
        bgcolor: '#EEF4FF',
        '@keyframes equipmentTwinPulse': {
          '0%': { transform: 'scale(0.92)', opacity: 0.62 },
          '50%': { transform: 'scale(1.16)', opacity: 1 },
          '100%': { transform: 'scale(0.92)', opacity: 0.62 },
        },
      }}
    >
      <Box sx={{ position: 'absolute', left: isFocusMode ? 22 : 24, top: isFocusMode ? 16 : 76, right: isFocusMode ? 22 : 24, zIndex: 7, display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.35,
            p: 0.35,
            borderRadius: 1.1,
            border: '1px solid rgba(47,107,255,0.18)',
            bgcolor: 'rgba(255,255,255,0.92)',
            boxShadow: '0 10px 22px rgba(15,23,42,0.10)',
          }}
        >
          {viewAssets.map((asset) => (
            <Button
              key={asset.key}
              size="small"
              onClick={() => selectAsset(asset)}
              sx={{
                minWidth: 0,
                px: 0.85,
                py: 0.38,
                borderRadius: 0.8,
                bgcolor: activeAsset.key === asset.key ? '#0B5CFF' : 'transparent',
                color: activeAsset.key === asset.key ? '#FFFFFF' : '#173A8F',
                textTransform: 'none',
                fontWeight: 900,
                fontSize: '0.62rem',
                '&:hover': { bgcolor: activeAsset.key === asset.key ? '#0848D8' : '#EEF4FF' },
              }}
            >
              {asset.label}
            </Button>
          ))}
        </Paper>

        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.2,
            p: 0.35,
            borderRadius: 1.1,
            border: '1px solid rgba(47,107,255,0.18)',
            bgcolor: 'rgba(255,255,255,0.92)',
            boxShadow: '0 10px 22px rgba(15,23,42,0.10)',
          }}
        >
          {[
            { icon: <ZoomOutIcon sx={{ fontSize: 16 }} />, action: () => adjustZoom(-0.18), label: 'Zoom out' },
            { icon: <ZoomInIcon sx={{ fontSize: 16 }} />, action: () => adjustZoom(0.18), label: 'Zoom in' },
            { icon: <ResetIcon sx={{ fontSize: 16 }} />, action: resetCamera, label: 'Reset camera' },
          ].map((control) => (
            <IconButton
              key={control.label}
              aria-label={control.label}
              size="small"
              onClick={control.action}
              sx={{ width: 26, height: 26, borderRadius: 0.8, color: '#173A8F', '&:hover': { bgcolor: '#EEF4FF' } }}
            >
              {control.icon}
            </IconButton>
          ))}
          <Typography sx={{ px: 0.45, color: '#173A8F', fontWeight: 900, fontSize: '0.58rem' }}>{Math.round(zoom * 100)}%</Typography>
          {[1, 1.6, 2.3].map((preset) => (
            <Button
              key={preset}
              size="small"
              onClick={() => {
                setZoom(preset);
                setTilt(activeAsset.key === 'orbit-top' ? -7 : 0);
              }}
              sx={{
                minWidth: 0,
                px: 0.45,
                py: 0.2,
                borderRadius: 0.65,
                color: Math.abs(zoom - preset) < 0.03 ? '#FFFFFF' : '#173A8F',
                bgcolor: Math.abs(zoom - preset) < 0.03 ? '#0B5CFF' : 'transparent',
                fontWeight: 950,
                fontSize: '0.52rem',
                '&:hover': { bgcolor: Math.abs(zoom - preset) < 0.03 ? '#0848D8' : '#EEF4FF' },
              }}
            >
              {preset}x
            </Button>
          ))}
        </Paper>

        <Button
          size="small"
          startIcon={motionOn ? <PauseIcon sx={{ fontSize: 15 }} /> : <PlayIcon sx={{ fontSize: 15 }} />}
          onClick={() => setMotionOn((value) => !value)}
          sx={{
            px: 0.95,
            py: 0.45,
            borderRadius: 1.1,
            bgcolor: '#FFFFFF',
            color: '#173A8F',
            border: '1px solid rgba(47,107,255,0.18)',
            boxShadow: '0 10px 22px rgba(15,23,42,0.10)',
            textTransform: 'none',
            fontWeight: 900,
            fontSize: '0.62rem',
            '&:hover': { bgcolor: '#EEF4FF' },
            '& .MuiButton-startIcon': { mr: 0.45 },
          }}
        >
          {motionOn ? 'Pause motion' : 'Play motion'}
        </Button>

        <Button
          size="small"
          startIcon={<FocusIcon sx={{ fontSize: 15 }} />}
          onClick={() => setIsFocusMode((value) => !value)}
          sx={{
            px: 0.95,
            py: 0.45,
            borderRadius: 1.1,
            bgcolor: isFocusMode ? '#071122' : '#FFFFFF',
            color: isFocusMode ? '#FFFFFF' : '#173A8F',
            border: '1px solid rgba(47,107,255,0.18)',
            boxShadow: '0 10px 22px rgba(15,23,42,0.10)',
            textTransform: 'none',
            fontWeight: 900,
            fontSize: '0.62rem',
            '&:hover': { bgcolor: isFocusMode ? '#0E1F48' : '#EEF4FF' },
            '& .MuiButton-startIcon': { mr: 0.45 },
          }}
        >
          {isFocusMode ? 'Exit focus' : 'Focus mode'}
        </Button>
      </Box>

      <Box
        ref={viewportRef}
        sx={{
          position: 'absolute',
          inset: isFocusMode ? '62px 22px 22px 22px' : '112px 24px 116px 24px',
          borderRadius: 1.4,
          bgcolor: '#FFFFFF',
          border: '1px solid #D7E5F8',
          boxShadow: '0 18px 42px rgba(15,23,42,0.10)',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
          touchAction: 'none',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onWheel={onViewportWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setIsDragging(false)}
        onDoubleClick={resetCamera}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(47,107,255,0.045) 1px, transparent 1px), linear-gradient(90deg, rgba(47,107,255,0.045) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            display: 'grid',
            placeItems: 'center',
            transform: `scale(${zoom}) perspective(1200px) rotateX(${tilt}deg)`,
            transition: isDragging ? 'none' : 'transform 0.16s ease',
            transformOrigin: 'center center',
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              display: 'grid',
              placeItems: 'center',
              transformStyle: 'preserve-3d',
              animation: 'none',
            }}
          >
            <Box
              component="img"
              src={activeAsset.src}
              alt={activeAsset.title}
              draggable={false}
              sx={{
                width: 'auto',
                height: 'auto',
                maxWidth: 'calc(100% - 18px)',
                maxHeight: 'calc(100% - 18px)',
                objectFit: 'contain',
                userSelect: 'none',
                filter: 'drop-shadow(0 18px 28px rgba(15,23,42,0.16)) saturate(1.04)',
                transition: 'filter 0.18s ease',
              }}
            />
            {showHotspots ? equipmentHotspots.map((hotspot) => {
              const label = equipmentPartLabels[hotspot.part];
              const isActive = activePart === hotspot.part;
              return (
                <Button
                  key={hotspot.part}
                  size="small"
                  onPointerDown={(event) => event.stopPropagation()}
                  onMouseEnter={(event) => showEquipmentHover(hotspot.part, event.currentTarget)}
                  onMouseLeave={hideEquipmentHover}
                  onFocus={(event) => showEquipmentHover(hotspot.part, event.currentTarget)}
                  onBlur={hideEquipmentHover}
                  onClick={() => focusPart(hotspot.part)}
                  sx={{
                    position: 'absolute',
                    top: hotspot.top,
                    left: hotspot.left,
                    zIndex: 3,
                    minWidth: 0,
                    px: 0.7,
                    py: 0.34,
                    borderRadius: 0.9,
                    bgcolor: isActive ? '#071122' : 'rgba(7,17,34,0.90)',
                    color: '#FFFFFF',
                    border: `1px solid ${hotspot.tone}`,
                    boxShadow: `0 8px 20px rgba(15,23,42,0.24), 0 0 0 3px ${hotspot.tone}18`,
                    textTransform: 'none',
                    fontWeight: 950,
                    fontSize: '0.56rem',
                    '&:hover': { bgcolor: '#0E1F48', transform: 'translateY(-1px)' },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      width: 7,
                      height: 7,
                      mr: 0.45,
                      borderRadius: 99,
                      bgcolor: hotspot.tone,
                      animation: motionOn ? 'equipmentTwinPulse 1.6s ease-in-out infinite' : 'none',
                    }}
                  />
                  {label}
                </Button>
              );
            }) : null}
          </Box>
        </Box>
        {showHotspots && hoveredHotspot && hoveredTelemetry ? (
          <Paper
            elevation={0}
            sx={{
              position: 'absolute',
              zIndex: 8,
              top: hoveredPartAnchor ? hoveredPartAnchor.top : parseFloat(hoveredHotspot.top) > 64 ? `calc(${hoveredHotspot.top} - 122px)` : `calc(${hoveredHotspot.top} + 34px)`,
              left: hoveredPartAnchor ? hoveredPartAnchor.left : parseFloat(hoveredHotspot.left) > 62 ? 'auto' : `calc(${hoveredHotspot.left} + 18px)`,
              right: hoveredPartAnchor ? 'auto' : parseFloat(hoveredHotspot.left) > 62 ? `calc(100% - ${hoveredHotspot.left})` : 'auto',
              width: 246,
              maxWidth: 'calc(100% - 28px)',
              p: 0.85,
              borderRadius: 1,
              border: '1px solid #D8E2F0',
              bgcolor: '#FFFFFF',
              boxShadow: '0 14px 30px rgba(15,23,42,0.16)',
              pointerEvents: 'none',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.7 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 0.8,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: `${hoveredTelemetry.tone}12`,
                  border: `1px solid ${hoveredTelemetry.tone}26`,
                  color: hoveredTelemetry.tone,
                  flex: '0 0 auto',
                }}
              >
                <SensorsIcon sx={{ fontSize: 16 }} />
              </Box>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ color: '#1F2366', fontWeight: 700, fontSize: '0.76rem', lineHeight: 1.14 }} noWrap>
                  {hoveredPartLabel}
                </Typography>
                <Typography sx={{ color: '#626465', fontWeight: 500, fontSize: '0.58rem', mt: 0.16 }} noWrap>
                  {hoveredTelemetry.signal}
                </Typography>
              </Box>
              <Box
                sx={{
                  px: 0.6,
                  py: 0.18,
                  borderRadius: 0.65,
                  bgcolor: `${hoveredTelemetry.tone}10`,
                  color: hoveredTelemetry.tone,
                  border: `1px solid ${hoveredTelemetry.tone}24`,
                  fontSize: '0.52rem',
                  fontWeight: 700,
                  lineHeight: 1.25,
                  flex: '0 0 auto',
                }}
              >
                {hoveredTelemetry.status}
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.45, mt: 0.75 }}>
              {[
                ['Speed', hoveredTelemetry.speed],
                ['OEE', hoveredTelemetry.oee],
                ['Scrap', hoveredTelemetry.scrap],
              ].map(([label, value]) => (
                <Box key={label} sx={{ minWidth: 0, p: 0.5, borderRadius: 0.75, border: '1px solid #E1E8F2', bgcolor: '#FAFBFD' }}>
                  <Typography sx={{ color: '#626465', fontSize: '0.48rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }} noWrap>
                    {label}
                  </Typography>
                  <Typography sx={{ color: label === 'OEE' ? hoveredTelemetry.tone : '#1F2366', fontSize: '0.64rem', fontWeight: 700, mt: 0.16 }} noWrap>
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        ) : null}
        <Box sx={{ position: 'absolute', left: 12, top: 12, maxWidth: 320, px: 0.75, py: 0.4, borderRadius: 0.85, bgcolor: '#071122', color: '#FFFFFF', boxShadow: '0 8px 18px rgba(15,23,42,0.18)' }}>
          <Typography sx={{ fontWeight: 900, fontSize: '0.68rem' }}>{activePartLabel}</Typography>
          <Typography sx={{ color: '#BFD3F2', fontWeight: 750, fontSize: '0.52rem', mt: 0.15 }}>
            <OrbitIcon sx={{ fontSize: 11, verticalAlign: '-2px', mr: 0.25 }} />Drag to orbit • scroll zoom • double click reset
            {activeAsset.yaw ? ` • yaw ${activeAsset.yaw}` : ''}
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            left: isFocusMode ? 360 : 348,
            right: 12,
            top: 12,
            zIndex: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 0.55,
            px: 0.75,
            py: 0.5,
            borderRadius: 0.9,
            bgcolor: 'rgba(7,17,34,0.82)',
            color: '#FFFFFF',
            boxShadow: '0 10px 20px rgba(15,23,42,0.20)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <SensorsIcon sx={{ color: activeTelemetry.tone, fontSize: 15 }} />
          <Typography sx={{ fontWeight: 950, fontSize: '0.62rem' }}>{activePartLabel}</Typography>
          <Box sx={{ width: 5, height: 5, borderRadius: 99, bgcolor: activeTelemetry.tone }} />
          <Typography sx={{ color: '#D7E5F8', fontWeight: 800, fontSize: '0.58rem' }}>{activeTelemetry.status}</Typography>
          <Typography sx={{ color: '#AFC4E8', fontWeight: 700, fontSize: '0.56rem', ml: 'auto' }}>
            {activeTelemetry.signal} • {activeTelemetry.speed} • OEE {activeTelemetry.oee} • Scrap {activeTelemetry.scrap}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          left: 114,
          right: 24,
          bottom: 18,
          zIndex: 5,
          display: 'grid',
          gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
          gap: 0.55,
        }}
      >
        {detailAssets.map((asset) => {
          const isActive = activePart === asset.part;
          return (
            <Box
              key={asset.key}
              onMouseEnter={(event) => showEquipmentHover(asset.part, event.currentTarget)}
              onMouseLeave={hideEquipmentHover}
              onFocus={(event) => showEquipmentHover(asset.part, event.currentTarget)}
              onBlur={hideEquipmentHover}
              onClick={() => focusPart(asset.part)}
              tabIndex={0}
              sx={{
                minWidth: 0,
                height: 72,
                borderRadius: 0.9,
                border: isActive ? '2px solid #0B5CFF' : '1px solid #D7E5F8',
                bgcolor: '#FFFFFF',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: isActive ? '0 8px 18px rgba(11,92,255,0.18)' : '0 6px 14px rgba(15,23,42,0.08)',
                position: 'relative',
                '&:hover': { borderColor: '#0B5CFF' },
              }}
            >
              <Box component="img" src={asset.src} alt={asset.title} sx={{ width: '100%', height: '100%', objectFit: 'contain', bgcolor: '#FFFFFF' }} />
              <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, px: 0.45, py: 0.25, bgcolor: 'rgba(7,17,34,0.82)', color: '#FFFFFF' }}>
                <Typography sx={{ fontSize: '0.55rem', fontWeight: 900 }} noWrap>{asset.label}</Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

export default ShiftLogbookScreen;
