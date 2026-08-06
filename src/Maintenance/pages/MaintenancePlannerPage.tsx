import {
  Alert,
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Popover,
  Radio,
  RadioGroup,
  Snackbar,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Block as BlockIcon,
  BuildOutlined as BuildOutlinedIcon,
  BuildCircleOutlined as WorkOrderIcon,
  CalendarMonthOutlined as CalendarMonthIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarToday as CalendarIcon,
  Check as CheckIcon,
  Groups as GroupsIcon,
  HandymanOutlined as HandymanOutlinedIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon,
  PlaceOutlined as PlaceIcon,
  Search as SearchIcon,
  AutoAwesome as SparkleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  WarningAmber as WarningAmberIcon,
  InfoOutlined as InfoOutlinedIcon,
  Close as CloseIcon,
  PersonOutline as PersonOutlineIcon,
  SyncAlt as ChangeoverIcon,
  Tune as TuneIcon,
} from '@mui/icons-material';
import { activeTheme } from '../../theme';
import {
  tokenBrand,
  tokenError,
  tokenWarning,
  tokenSuccess,
  tokenInfo,
  tokenNeutral,
  tokenText,
  tokenDivider,
  tokenCommon,
} from '../../workstation/theme';
import {
  CreateWorkOrderDrawer,
  buildWorkOrderDraftFromBoardCard,
  type WorkOrderDraft,
  type WorkOrderTab,
} from './MaintenanceFollowUpBoardPage';
import EquipmentSelector, { type EquipmentSelection } from '../components/EquipmentSelector';
import {
  MaintenanceMonthAggregateDetailsDialog,
  maintenanceMonthAggregateCategoryOrder as monthAggregateCategoryOrder,
  maintenanceMonthAggregateCategoryStyles as monthAggregateCategoryStyles,
  type MaintenanceMonthAggregateCard,
  type MaintenanceMonthAggregateDialogState,
  type MaintenanceMonthPlanItem,
  type MaintenanceMonthWorkOrderItem,
} from '../components/MaintenanceMonthAggregateDetailsDialog';
import { AICascadeConflictMarker } from '../components/ai/AICascadeConflictMarker';
import { PlannerAiShell } from '../components/planner/PlannerAiShell';
import { MaintenancePlannerCopilotSection } from '../components/planner/MaintenancePlannerCopilotSection';
import { buildCascadeApplySuccessMessage, resolvePlannerAiWorkflowStep } from '../components/ai/plannerAiWorkflow';
import { CalendarWorkCardSignalChips } from '../components/planner/CalendarWorkCardSignalChips';
import { findPlannerCardIdForAsset } from '../ai/plannerCardSignals';
import { usePlannerAi } from '../hooks/usePlannerAi';
import { getPlannerStaffSkillMatrix, plannerFallbackSkillMatrix } from '../data/plannerStaffSkills';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import type { DragEvent, Dispatch, ReactNode, SetStateAction } from 'react';
import type {
  PlannerAiAssistantHorizon,
  PlannerAiCopilotSuggestion,
  PlannerAiPlanVariant,
  PlannerAiHorizonProjection,
  PlannerAiQuickPrompt,
  PlannerAiWhatIfScenario,
} from '../ai/types';
import { maintenancePriorityStyles } from '../data';
import type { MaintenanceCard, MaintenancePriority } from '../types';

const planningQueue = [
  {
    type: 'Preventive',
    wo: 'PM-WO-2026-003',
    asset: 'Conveyor CV-101',
    line: 'Line 1',
    zone: 'Autoguard North',
    duration: '1h',
    priority: 'Medium',
    suggestedTechnician: 'Carlos Rodriguez',
    tone: activeTheme.primary,
  },
  {
    type: 'Corrective',
    wo: 'CM-WO-2026-014',
    asset: 'Extrusion Machine',
    line: 'Line 1',
    zone: 'Zone 2',
    duration: '3h',
    priority: 'High',
    suggestedTechnician: 'Ana Martins',
    tone: '#F97316',
  },
  {
    type: 'Preventive',
    wo: 'PM-WO-2026-021',
    asset: 'Assembly A-201',
    line: 'Line 2',
    zone: 'Zone 1',
    duration: '4h',
    priority: 'Low',
    suggestedTechnician: 'Priya Patel',
    tone: '#16A34A',
  },
  {
    type: 'Corrective',
    wo: 'CM-WO-2026-027',
    asset: 'Packaging Robot PK-404',
    line: 'Line 3',
    zone: 'Packaging',
    duration: '2h',
    priority: 'Emergency',
    suggestedTechnician: 'Mike Johnson',
    tone: '#DC2626',
  },
  {
    type: 'Preventive',
    wo: 'PM-WO-2026-032',
    asset: 'Boiler BL-02',
    line: 'Utilities',
    zone: 'Utilities',
    duration: '1h 30min',
    priority: 'High',
    suggestedTechnician: 'Emily Watson',
    tone: '#0EA5E9',
  },
  {
    type: 'Corrective',
    wo: 'CM-WO-2026-036',
    asset: 'Filler FL-118',
    line: 'Line 2',
    zone: 'Zone 1',
    duration: '45min',
    priority: 'Medium',
    suggestedTechnician: 'David Kim',
    tone: '#F59E0B',
  },
  {
    type: 'Preventive',
    wo: 'PM-WO-2026-044',
    asset: 'Compressor CP-07',
    line: 'Utilities',
    zone: 'Utilities',
    duration: '2h',
    priority: 'Low',
    suggestedTechnician: 'Ana Martins',
    tone: '#14B8A6',
  },
  {
    type: 'Corrective',
    wo: 'CM-WO-2026-052',
    asset: 'Labeler LB-210',
    line: 'Line 4',
    zone: 'Packaging',
    duration: '1h',
    priority: 'High',
    suggestedTechnician: 'Carlos Rodriguez',
    tone: '#EA580C',
  },
];

type CalendarPriority = 'Emergency' | 'High' | 'Medium' | 'Low';
type CalendarShift = 'day' | 'night';
const calendarPriorityLegendLevels: MaintenancePriority[] = ['Emergency', 'Immediate', 'High', 'Medium', 'Low', 'Very Low'];
const plannerWorkAreaOptions = ['All', 'Assembly', 'Packaging', 'Utilities'] as const;
const plannerTypeOptions = [
  'Preventive',
  'Corrective',
] as const;
const plannerPriorityOptions = calendarPriorityLegendLevels;
const plannerCriticalityOptions = ['A', 'B', 'C'] as const;
type PlannerWorkArea = typeof plannerWorkAreaOptions[number];
type PlannerType = typeof plannerTypeOptions[number];
type PlannerCriticality = typeof plannerCriticalityOptions[number];
type PlannerFilters = {
  workAreas: PlannerWorkArea[];
  types: PlannerType[];
  priorities: MaintenancePriority[];
  criticalities: PlannerCriticality[];
  assignedToSearch: string;
  assetHierarchy: EquipmentSelection | null;
};
type PlannerFilterChip = {
  key: string;
  label: string;
  onDelete: () => void;
};
type CalendarBlock = {
  shift: CalendarShift;
  day: number;
  label: string;
  objective: string;
  duration?: string;
  timeLabel?: string;
  allDay?: boolean;
  tone: 'var(--paper-border-color)' | '#4B5563';
  compact?: boolean;
};
type CalendarCard = {
  id: string;
  workOrder: string;
  shift: CalendarShift;
  day: number;
  startHour: number;
  startMinute?: number;
  title: string;
  type: 'Preventive' | 'Corrective';
  priority: CalendarPriority;
  duration: string;
  assignee: {
    name: string;
    initials: string;
  };
  assigneeRole?: 'Technician' | 'Operator';
  due?: string;
  preventiveSchedule?: {
    kind: 'floating' | 'fixed';
    windowDays: 3 | 5 | 7 | 12;
  };
  statusOverride?: 'Planning';
};

type StaffAssignmentEntry = {
  name: string;
  load: string;
  workOrderCount: number;
  role?: 'Technician' | 'Operator';
};

type DraggedStaffAssignment = StaffAssignmentEntry & {
  day: number;
};

type PendingTechnicianAssignment = {
  cardId: string;
  technician: DraggedStaffAssignment;
};

type StaffWorkloadDialogState = {
  entry: StaffAssignmentEntry;
  day: number;
};

type AdditionalAssigneeDialogState = {
  day: number;
  staffName?: string;
};

type AdditionalAssigneePerson = {
  id: string;
  name: string;
  initials: string;
  role: 'Technician' | 'Operator';
  context: string;
  workload: string;
  shift: string;
  workloadLevel: 'Low' | 'Medium' | 'High';
  workloadSummary: string;
  recommended?: boolean;
  recommendationReason?: string;
};

const emptyPlannerFilters: PlannerFilters = {
  workAreas: [],
  types: [],
  priorities: [],
  criticalities: [],
  assignedToSearch: '',
  assetHierarchy: null,
};

const CALENDAR_WORK_ORDER_DRAG_TYPE = 'application/x-maintenance-work-order';
const CALENDAR_TECHNICIAN_DRAG_TYPE = 'application/x-maintenance-technician';
const CALENDAR_AI_SUGGESTION_DRAG_TYPE = 'application/x-maintenance-ai-suggestion';

const additionalAssigneePeople: AdditionalAssigneePerson[] = [
  {
    id: 'bruno-arruda',
    name: 'Bruno Arruda',
    initials: 'BA',
    role: 'Technician',
    context: 'Mechanical',
    workload: '2 WO today',
    shift: 'Day shift',
    workloadLevel: 'Low',
    workloadSummary: '1 WO already assigned that day',
    recommended: true,
    recommendationReason: 'lowest workload tomorrow and matching mechanical skill',
  },
  {
    id: 'daniel-ortega',
    name: 'Daniel Ortega',
    initials: 'DO',
    role: 'Technician',
    context: 'Electrical',
    workload: '3 WO today',
    shift: 'Day shift',
    workloadLevel: 'Low',
    workloadSummary: '2 WO already assigned that day',
  },
  {
    id: 'emerson-stanton',
    name: 'Emerson Stanton',
    initials: 'ES',
    role: 'Operator',
    context: 'Zone 1 - Line B',
    workload: 'Lowest workload tomorrow',
    shift: 'Night shift',
    workloadLevel: 'Medium',
    workloadSummary: '2 tasks already assigned that day',
  },
  {
    id: 'mike-johnson',
    name: 'Mike Johnson',
    initials: 'MJ',
    role: 'Technician',
    context: 'Mechanical',
    workload: '4 WO today',
    shift: 'Day shift',
    workloadLevel: 'High',
    workloadSummary: 'Heavy workload that day',
  },
];

const additionalAssigneeWorkloadTone: Record<AdditionalAssigneePerson['workloadLevel'], { bg: string; border: string; color: string }> = {
  Low: { bg: '#ECFDF5', border: '#A7F3D0', color: '#047857' },
  Medium: { bg: '#EFF6FF', border: activeTheme.primaryLight, color: activeTheme.primary },
  High: { bg: '#FFF7ED', border: '#FED7AA', color: '#C2410C' },
};

const calendarAssignmentDayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

const calendarWeekDays = [
  { label: 'Sun', date: 24, production: '10,000 UN.', availability: '92%' },
  { label: 'Mon', date: 25, production: '10,000 UN.', availability: '92%' },
  { label: 'Tue', date: 26, production: '10,000 UN.', availability: '92%', isToday: true },
  { label: 'Wed', date: 27, production: '10,000 UN.', availability: '92%' },
  { label: 'Thu', date: 28, production: '10,000 UN.', availability: '92%' },
  { label: 'Fri', date: 29, production: '10,000 UN.', availability: '92%' },
  { label: 'Sat', date: 30, production: '10,000 UN.', availability: '92%' },
];

type CalendarDayInsightMetric = {
  producedSummary: string;
  producedTarget: string;
  variancePct: number;
  downtimeBreakdown: ReadonlyArray<{
    label: string;
    value: string;
    tone?: 'default' | 'danger';
  }>;
  machineAvailability: ReadonlyArray<{
    machine: string;
    value: number;
  }>;
  shiftAvailability: ReadonlyArray<{
    label: string;
    produced: string;
    availability: string;
  }>;
};

const calendarDayInsights: Record<number, CalendarDayInsightMetric> = {
  0: {
    producedSummary: '9,800',
    producedTarget: '12,000',
    variancePct: 2,
    downtimeBreakdown: [
      { label: 'Planned Maintenance', value: '42 min' },
      { label: 'Changeover', value: '18 min' },
      { label: 'Unplanned Stop', value: '12 min', tone: 'danger' },
    ],
    machineAvailability: [
      { machine: 'Robot Arm RB-405', value: 31.4 },
      { machine: 'Valve Bank V-220', value: 36.9 },
      { machine: 'Molding M-301', value: 42.5 },
      { machine: 'Pump P-205', value: 38.2 },
      { machine: 'Conveyor C-110', value: 49.1 },
      { machine: 'Extruder EX-510', value: 74.8 },
      { machine: 'Cooling Tower CT-44', value: 79.6 },
      { machine: 'Compressor CP-12', value: 83.7 },
      { machine: 'Filler F-230', value: 88.4 },
    ],
    shiftAvailability: [
      { label: 'Day Shift', produced: '5,400', availability: '94%' },
      { label: 'Night Shift', produced: '4,400', availability: '89%' },
    ],
  },
  1: {
    producedSummary: '10,200',
    producedTarget: '12,000',
    variancePct: 3,
    downtimeBreakdown: [
      { label: 'Planned Maintenance', value: '36 min' },
      { label: 'Changeover', value: '24 min' },
      { label: 'Unplanned Stop', value: '10 min', tone: 'danger' },
    ],
    machineAvailability: [
      { machine: 'Molding M-301', value: 32.3 },
      { machine: 'Packaging PK-88', value: 37.1 },
      { machine: 'Extrusion EX-204', value: 43.4 },
      { machine: 'Boiler Feed B-120', value: 40.8 },
      { machine: 'Conveyor C-110', value: 48.5 },
      { machine: 'Dryer DR-77', value: 72.9 },
      { machine: 'Compressor CP-18', value: 76.2 },
      { machine: 'Heat Exchanger HX-14', value: 81.5 },
      { machine: 'Palletizer PL-09', value: 87.3 },
    ],
    shiftAvailability: [
      { label: 'Day Shift', produced: '5,800', availability: '95%' },
      { label: 'Night Shift', produced: '4,400', availability: '90%' },
    ],
  },
  2: {
    producedSummary: '10,000',
    producedTarget: '12,000',
    variancePct: 4,
    downtimeBreakdown: [
      { label: 'Planned Maintenance', value: '45 min' },
      { label: 'Changeover', value: '30 min' },
      { label: 'Unplanned Stop', value: '18 min', tone: 'danger' },
    ],
    machineAvailability: [
      { machine: 'Extrusion Machine', value: 30.6 },
      { machine: 'Valve Bank V-220', value: 36.3 },
      { machine: 'Molding M-301', value: 42.5 },
      { machine: 'Pump P-205', value: 38.2 },
      { machine: 'Conveyor C-110', value: 49.1 },
      { machine: 'Sensor Array S-101', value: 73.4 },
      { machine: 'Chiller CH-08', value: 78.1 },
      { machine: 'Dust Collector DC-16', value: 84.6 },
      { machine: 'Labeler LB-22', value: 89.4 },
    ],
    shiftAvailability: [
      { label: 'Day Shift', produced: '5,800', availability: '94%' },
      { label: 'Night Shift', produced: '4,200', availability: '89%' },
    ],
  },
  3: {
    producedSummary: '9,650',
    producedTarget: '12,000',
    variancePct: -1,
    downtimeBreakdown: [
      { label: 'Planned Maintenance', value: '52 min' },
      { label: 'Changeover', value: '40 min' },
      { label: 'Unplanned Stop', value: '22 min', tone: 'danger' },
    ],
    machineAvailability: [
      { machine: 'Extrusion Machine', value: 33.2 },
      { machine: 'Pump P-205', value: 38.4 },
      { machine: 'Molding M-301', value: 39.7 },
      { machine: 'Packaging PK-88', value: 41.6 },
      { machine: 'Conveyor C-110', value: 47.4 },
      { machine: 'Mixer MX-33', value: 71.8 },
      { machine: 'Dryer DR-80', value: 77.4 },
      { machine: 'Robot Arm RB-410', value: 82.6 },
      { machine: 'Washer WS-11', value: 90.2 },
    ],
    shiftAvailability: [
      { label: 'Day Shift', produced: '5,100', availability: '91%' },
      { label: 'Night Shift', produced: '4,550', availability: '88%' },
    ],
  },
  4: {
    producedSummary: '10,450',
    producedTarget: '12,000',
    variancePct: 5,
    downtimeBreakdown: [
      { label: 'Planned Maintenance', value: '28 min' },
      { label: 'Changeover', value: '16 min' },
      { label: 'Unplanned Stop', value: '8 min', tone: 'danger' },
    ],
    machineAvailability: [
      { machine: 'Extrusion Machine', value: 34.1 },
      { machine: 'Boiler Feed B-120', value: 39.2 },
      { machine: 'Extrusion EX-204', value: 45.2 },
      { machine: 'Pump P-205', value: 41.4 },
      { machine: 'Filler F-120', value: 48.8 },
      { machine: 'Separator SP-07', value: 74.1 },
      { machine: 'Compressor CP-09', value: 78.8 },
      { machine: 'Packer PK-110', value: 85.1 },
      { machine: 'Chiller CH-12', value: 92.4 },
    ],
    shiftAvailability: [
      { label: 'Day Shift', produced: '6,100', availability: '96%' },
      { label: 'Night Shift', produced: '4,350', availability: '91%' },
    ],
  },
  5: {
    producedSummary: '8,900',
    producedTarget: '12,000',
    variancePct: -3,
    downtimeBreakdown: [
      { label: 'Planned Maintenance', value: '60 min' },
      { label: 'Changeover', value: '0 min' },
      { label: 'Unplanned Stop', value: '35 min', tone: 'danger' },
    ],
    machineAvailability: [
      { machine: 'Extrusion Machine', value: 32.8 },
      { machine: 'Pump P-205', value: 36.1 },
      { machine: 'Boiler Feed B-120', value: 34.6 },
      { machine: 'Packaging PK-88', value: 37.5 },
      { machine: 'Conveyor C-110', value: 45.8 },
      { machine: 'Blower BW-21', value: 73.6 },
      { machine: 'Tank Agitator TA-05', value: 79.1 },
      { machine: 'Robot Arm RB-418', value: 84.3 },
      { machine: 'Capper CP-30', value: 88.7 },
    ],
    shiftAvailability: [
      { label: 'Day Shift', produced: '4,900', availability: '88%' },
      { label: 'Night Shift', produced: '4,000', availability: '84%' },
    ],
  },
  6: {
    producedSummary: '9,300',
    producedTarget: '12,000',
    variancePct: 1,
    downtimeBreakdown: [
      { label: 'Planned Maintenance', value: '38 min' },
      { label: 'Changeover', value: '12 min' },
      { label: 'Unplanned Stop', value: '14 min', tone: 'danger' },
    ],
    machineAvailability: [
      { machine: 'Extrusion Machine', value: 34.9 },
      { machine: 'Boiler Feed B-120', value: 38.1 },
      { machine: 'Molding M-301', value: 41.3 },
      { machine: 'Pump P-205', value: 39.8 },
      { machine: 'Filler F-120', value: 47.2 },
      { machine: 'Sensor Array S-104', value: 72.4 },
      { machine: 'Cooling Tower CT-51', value: 77.7 },
      { machine: 'Palletizer PL-14', value: 83.5 },
      { machine: 'Sealer SL-06', value: 91.2 },
    ],
    shiftAvailability: [
      { label: 'Day Shift', produced: '5,000', availability: '92%' },
      { label: 'Night Shift', produced: '4,300', availability: '87%' },
    ],
  },
};

const calendarPriorityStyles: Record<CalendarPriority, { color: string; bg: string; fg: string }> = {
  Emergency: { color: '#FF2E2E', bg: '#FFF1F1', fg: '#DC2626' },
  High: { color: '#EF4444', bg: '#FFF7ED', fg: '#B91C1C' },
  Medium: { color: '#F59E0B', bg: '#FFFBEB', fg: '#92400E' },
  Low: { color: '#22C55E', bg: '#F0FDF4', fg: '#166534' },
};

const initialCalendarCards: ReadonlyArray<CalendarCard> = [
  { id: 'calendar-work-1', workOrder: 'PM-WO-2026-205', shift: 'day', day: 1, startHour: 6, startMinute: 30, title: 'Molding M-301', type: 'Preventive', priority: 'Emergency', duration: '4h', assignee: { name: 'Emily Watson', initials: 'EW' }, due: 'DUE 21H', preventiveSchedule: { kind: 'floating', windowDays: 5 } },
  { id: 'calendar-work-2', workOrder: 'PM-WO-2026-206', shift: 'day', day: 1, startHour: 7, startMinute: 30, title: 'Labeler LB-210', type: 'Preventive', priority: 'Low', duration: '2h', assignee: { name: 'Priya Patel', initials: 'PP' }, due: 'DUE 24H', preventiveSchedule: { kind: 'fixed', windowDays: 3 } },
  { id: 'calendar-work-3', workOrder: 'PM-WO-2026-207', shift: 'day', day: 1, startHour: 11, startMinute: 0, title: 'Conveyor CV-101', type: 'Preventive', priority: 'High', duration: '1h', assignee: { name: 'David Kim', initials: 'DK' }, preventiveSchedule: { kind: 'floating', windowDays: 7 } },
  { id: 'calendar-work-4', workOrder: 'CM-WO-2026-208', shift: 'day', day: 1, startHour: 13, startMinute: 30, title: 'Extrusion Machine', type: 'Corrective', priority: 'Medium', duration: '30min', assignee: { name: 'Mike Johnson', initials: 'MJ' } },
  { id: 'calendar-work-5', workOrder: 'PM-WO-2026-209', shift: 'day', day: 2, startHour: 9, startMinute: 0, title: 'Boiler Feed Pump P-204', type: 'Preventive', priority: 'High', duration: '1h', assignee: { name: 'Emily Watson', initials: 'EW' }, preventiveSchedule: { kind: 'fixed', windowDays: 12 } },
  { id: 'calendar-work-19', workOrder: 'PM-WO-2026-223', shift: 'day', day: 2, startHour: 10, startMinute: 30, title: 'Conveyor CV-101', type: 'Preventive', priority: 'Medium', duration: '45min', assignee: { name: 'Lucas Almeida', initials: 'LA' }, assigneeRole: 'Operator' },
  { id: 'calendar-work-6', workOrder: 'CM-WO-2026-210', shift: 'day', day: 2, startHour: 14, startMinute: 30, title: 'Labeler LB-210', type: 'Corrective', priority: 'Medium', duration: '30min', assignee: { name: 'Priya Patel', initials: 'PP' } },
  { id: 'calendar-work-16', workOrder: 'CM-WO-2026-220', shift: 'night', day: 5, startHour: 20, startMinute: 0, title: 'Boiler Feed Pump P-204', type: 'Corrective', priority: 'High', duration: '1h', assignee: { name: 'Mike Johnson', initials: 'MJ' } },
  { id: 'calendar-work-7', workOrder: 'CM-WO-2026-211', shift: 'day', day: 3, startHour: 8, startMinute: 0, title: 'Extrusion Machine', type: 'Corrective', priority: 'Medium', duration: '30min', assignee: { name: 'David Kim', initials: 'DK' } },
  { id: 'calendar-work-20', workOrder: 'PM-WO-2026-224', shift: 'day', day: 3, startHour: 9, startMinute: 30, title: 'Labeler LB-210', type: 'Preventive', priority: 'Medium', duration: '45min', assignee: { name: 'Marina Costa', initials: 'MC' }, assigneeRole: 'Operator' },
  { id: 'calendar-work-17', workOrder: 'PM-WO-2026-221', shift: 'day', day: 5, startHour: 10, startMinute: 30, title: 'Extrusion Machine', type: 'Preventive', priority: 'Medium', duration: '1h', assignee: { name: 'Emily Watson', initials: 'EW' }, preventiveSchedule: { kind: 'fixed', windowDays: 3 } },
  { id: 'calendar-work-8', workOrder: 'CM-WO-2026-212', shift: 'day', day: 3, startHour: 16, startMinute: 0, title: 'Extrusion Machine', type: 'Corrective', priority: 'Medium', duration: '30min', assignee: { name: 'Mike Johnson', initials: 'MJ' } },
  { id: 'calendar-work-9', workOrder: 'CM-WO-2026-213', shift: 'day', day: 4, startHour: 10, startMinute: 0, title: 'Extrusion Machine', type: 'Corrective', priority: 'Medium', duration: '30min', assignee: { name: 'Emily Watson', initials: 'EW' } },
  { id: 'calendar-work-18', workOrder: 'PM-WO-2026-222', shift: 'day', day: 4, startHour: 11, startMinute: 0, title: 'Conveyor CV-101', type: 'Preventive', priority: 'Medium', duration: '45min', assignee: { name: 'Lucas Almeida', initials: 'LA' }, assigneeRole: 'Operator' },
  { id: 'calendar-work-21', workOrder: 'PM-WO-2026-225', shift: 'day', day: 4, startHour: 12, startMinute: 0, title: 'Boiler Feed Pump P-204', type: 'Preventive', priority: 'Medium', duration: '45min', assignee: { name: 'Rafael Souza', initials: 'RS' }, assigneeRole: 'Operator' },
  { id: 'calendar-work-12', workOrder: 'CM-WO-2026-216', shift: 'night', day: 1, startHour: 19, startMinute: 0, title: 'Extrusion Machine', type: 'Corrective', priority: 'Medium', duration: '30min', assignee: { name: 'Mike Johnson', initials: 'MJ' } },
  { id: 'calendar-work-13', workOrder: 'CM-WO-2026-217', shift: 'night', day: 3, startHour: 21, startMinute: 0, title: 'Extrusion Machine', type: 'Corrective', priority: 'Medium', duration: '30min', assignee: { name: 'Emily Watson', initials: 'EW' } },
  { id: 'calendar-work-14', workOrder: 'CM-WO-2026-218', shift: 'night', day: 4, startHour: 22, startMinute: 0, title: 'Extrusion Machine', type: 'Corrective', priority: 'Medium', duration: '30min', assignee: { name: 'Priya Patel', initials: 'PP' } },
];

const calendarBlocks: ReadonlyArray<CalendarBlock> = [
  { shift: 'day', day: 3, label: 'Changeover', objective: 'Molding Bay Tool Swap', duration: '2h', timeLabel: '10:00 - 12:00', tone: '#4B5563', compact: true },
  { shift: 'day', day: 5, label: 'Shutdown', objective: 'Labor Day', allDay: true, tone: 'var(--paper-border-color)' },
  { shift: 'night', day: 2, label: 'Changeover', objective: 'Compressor Room Overhaul', timeLabel: '19:00 - 23:00', tone: '#4B5563' },
  { shift: 'night', day: 5, label: 'Shutdown', objective: 'Labor Day', allDay: true, tone: 'var(--paper-border-color)' },
];

function parseCalendarDurationToHours(duration: string): number {
  const normalizedDuration = duration.trim().toLowerCase();

  if (normalizedDuration.endsWith('min')) {
    const minutes = Number.parseFloat(normalizedDuration.replace('min', ''));
    return Number.isFinite(minutes) ? minutes / 60 : 0;
  }

  if (normalizedDuration.endsWith('h')) {
    const hours = Number.parseFloat(normalizedDuration.replace('h', ''));
    return Number.isFinite(hours) ? hours : 0;
  }

  return 0;
}

function formatStaffLoad(hours: number): string {
  const roundedHours = Number.isInteger(hours) ? `${hours}` : hours.toFixed(1).replace(/\.0$/, '');
  return `${roundedHours}/8h`;
}

function getCalendarBlockVisualHeight(block: CalendarBlock) {
  return block.compact ? 104 : 246;
}

function parseStaffLoadHours(load: string) {
  const [hours] = load.split('/');
  const numericHours = Number.parseFloat(hours ?? '0');
  return Number.isFinite(numericHours) ? numericHours : 0;
}

function buildAssignedStaffByDay(cards: ReadonlyArray<CalendarCard>) {
  return calendarWeekDays.map((_, dayIndex) => {
    const entriesByStaff = new Map<string, { name: string; loadHours: number; workOrderCount: number; role: 'Technician' | 'Operator' }>();

    cards
      .filter((card) => card.day === dayIndex)
      .forEach((card) => {
        const currentEntry = entriesByStaff.get(card.assignee.name);
        const nextLoad = (currentEntry?.loadHours ?? 0) + parseCalendarDurationToHours(card.duration);
        const nextWorkOrderCount = (currentEntry?.workOrderCount ?? 0) + 1;
        const role = card.assigneeRole ?? 'Technician';

        entriesByStaff.set(card.assignee.name, {
          name: card.assignee.name,
          loadHours: nextLoad,
          workOrderCount: nextWorkOrderCount,
          role: currentEntry?.role === 'Operator' || role === 'Operator' ? 'Operator' : 'Technician',
        });
      });

    return Array.from(entriesByStaff.values()).map((entry): StaffAssignmentEntry => ({
      name: entry.name,
      load: formatStaffLoad(entry.loadHours),
      workOrderCount: entry.workOrderCount,
      role: entry.role,
    }));
  });
}

function buildPlannedDowntimesByDay() {
  return calendarWeekDays.map((_, dayIndex) => {
    const labels = Array.from(
      new Set(
        calendarBlocks
          .filter((block) => block.day === dayIndex)
          .map((block) => formatCalendarBlockTagLabel(block)),
      ),
    );

    return labels.length > 0 ? labels.join(' • ') : null;
  });
}

function formatCalendarBlockTagLabel(block: CalendarBlock) {
  return `${block.label} - ${block.objective}`;
}

function getPlannedDowntimeTagStyle(reason: string) {
  return reason.includes('Changeover')
    ? {
      border: '1px solid #374151',
      backgroundColor: '#4B5563',
      color: activeTheme.backgroundPaper,
    }
    : {
      border: '1px solid #CBD5E1',
      backgroundColor: activeTheme.backgroundDefault,
      color: activeTheme.textSecondary,
    };
}

type MaintenancePlannerPageProps = {
  initialMode?: 'timeline' | 'calendar';
  onOpenMaintenancePlan?: () => void;
  view?: 'planner' | 'calendarOnly';
};

type PlannerSurfaceMode = 'calendar' | 'monthly' | 'gantt' | 'annual';
type PlanningQueueItem = Omit<(typeof planningQueue)[number], 'type'> & {
  type: CalendarCard['type'];
  propagatedHorizons?: PlannerAiAssistantHorizon[];
};

function mapPlannerSurfaceModeToAssistantHorizon(mode: PlannerSurfaceMode): PlannerAiAssistantHorizon {
  switch (mode) {
    case 'monthly':
      return 'monthly';
    case 'gantt':
      return 'quarterly';
    case 'annual':
      return 'annual';
    default:
      return 'weekly';
  }
}

type SchedulingAssistantSlot = {
  load: string;
  capacity: string;
  muted?: boolean;
};
type SchedulingAssistantTechnician = {
  name: string;
  shift: string;
  free: string;
  slots: SchedulingAssistantSlot[];
};
type MonthEventTone = 'neutral' | 'warning';
type MonthPreventiveSchedule = 'annual' | 'quarterly' | 'monthly' | 'biweekly';
type MonthCalendarEvent = {
  title: string;
  tone?: MonthEventTone;
  kind?: 'maintenance' | 'corrective' | 'calendarBlock';
  preventiveSchedule?: MonthPreventiveSchedule;
  blockTone?: 'var(--paper-border-color)' | '#4B5563';
  metaLabel?: string;
};
type MonthWorkOrderItem = MaintenanceMonthWorkOrderItem;
type MonthMaintenancePlanItem = MaintenanceMonthPlanItem;
type MonthAggregateCard = MaintenanceMonthAggregateCard;
type MonthAggregateDialogState = MaintenanceMonthAggregateDialogState;

const schedulingAssistantComparePeople = ['Mike Johnson', 'Sarah Chen', 'Carlos Rodriguez', 'Emily Watson', 'David Kim'] as const;
const schedulingAssistantDays = [
  { label: 'Today', date: 'May 26' },
  { label: 'Tomorrow', date: 'May 27' },
  { label: 'Thu', date: 'May 28' },
] as const;
const schedulingAssistantTechnicians: ReadonlyArray<SchedulingAssistantTechnician> = [
  {
    name: 'Mike Johnson',
    shift: 'Shift A',
    free: '2 free',
    slots: [
      { load: '1.5h', capacity: 'of 12h' },
      { load: '2h', capacity: 'of 12h' },
      { load: '0.5h', capacity: 'of 12h', muted: true },
      { load: '3h', capacity: 'of 12h' },
      { load: '2h', capacity: 'of 12h' },
      { load: '1h', capacity: 'of 12h' },
    ],
  },
  {
    name: 'Sarah Chen',
    shift: 'Shift A',
    free: '1 free',
    slots: [
      { load: '0h', capacity: 'of 12h', muted: true },
      { load: '1.5h', capacity: 'of 12h' },
      { load: '2h', capacity: 'of 12h' },
      { load: '0.5h', capacity: 'of 12h', muted: true },
      { load: '1h', capacity: 'of 12h' },
      { load: '2.5h', capacity: 'of 12h' },
    ],
  },
  {
    name: 'Carlos Rodriguez',
    shift: 'Shift B',
    free: '3 free',
    slots: [
      { load: '2.5h', capacity: 'of 12h' },
      { load: '0h', capacity: 'of 12h', muted: true },
      { load: '1h', capacity: 'of 12h' },
      { load: '1.5h', capacity: 'of 12h' },
      { load: '0h', capacity: 'of 12h', muted: true },
      { load: '3h', capacity: 'of 12h' },
    ],
  },
  {
    name: 'Emily Watson',
    shift: 'Shift C',
    free: '4 free',
    slots: [
      { load: '3h', capacity: 'of 12h' },
      { load: '1h', capacity: 'of 12h' },
      { load: '0h', capacity: 'of 12h', muted: true },
      { load: '2h', capacity: 'of 12h' },
      { load: '1.5h', capacity: 'of 12h' },
      { load: '0.5h', capacity: 'of 12h', muted: true },
    ],
  },
  {
    name: 'David Kim',
    shift: 'Shift D',
    free: '2 free',
    slots: [
      { load: '1h', capacity: 'of 12h' },
      { load: '2.5h', capacity: 'of 12h' },
      { load: '2h', capacity: 'of 12h' },
      { load: '0h', capacity: 'of 12h', muted: true },
      { load: '0.5h', capacity: 'of 12h', muted: true },
      { load: '1h', capacity: 'of 12h' },
    ],
  },
] as const;

const monthWeekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const monthViewReferenceDate = new Date(2026, 4, 1);
const monthWorkOrderMap: Record<string, ReadonlyArray<MonthWorkOrderItem>> = {
  '2026-05-01': [
    { woCode: 'PM-WO-2026-301', category: 'Preventive', equipment: 'Hydraulic Press #2', location: 'Assembly / Line 1', scheduledDate: 'May 01, 2026', duration: '2h', assignedTechnician: 'Emily Watson', priority: 'Medium' },
    { woCode: 'CM-WO-2026-341', category: 'Corrective', equipment: 'Cooling Tower CT-44', location: 'Utilities', scheduledDate: 'May 01, 2026', duration: '1h 30min', assignedTechnician: 'David Kim', priority: 'High' },
  ],
  '2026-05-04': [
    { woCode: 'PM-WO-2026-302', category: 'Preventive', equipment: 'Conveyor CV-101', location: 'Packaging / Line 3', scheduledDate: 'May 04, 2026', duration: '1h', assignedTechnician: 'Carlos Rodriguez', priority: 'Low' },
    { woCode: 'PM-WO-2026-303', category: 'Preventive', equipment: 'Filler F-230', location: 'Packaging / Line 3', scheduledDate: 'May 04, 2026', duration: '45min', assignedTechnician: 'Priya Patel', priority: 'Medium' },
    { woCode: 'PM-WO-2026-351', category: 'Preventive', equipment: 'Assembly A-201', location: 'Assembly / Zone 1', scheduledDate: 'May 04, 2026', duration: '30min', assignedTechnician: 'Lucas Almeida', priority: 'Medium' },
  ],
  '2026-05-06': [
    { woCode: 'CM-WO-2026-342', category: 'Corrective', equipment: 'Extrusion Machine', location: 'Line 1 / Zone 2', scheduledDate: 'May 06, 2026', duration: '3h', assignedTechnician: 'Ana Martins', priority: 'High' },
  ],
  '2026-05-08': [
    { woCode: 'PM-WO-2026-304', category: 'Preventive', equipment: 'Boiler Feed Pump', location: 'Utilities', scheduledDate: 'May 08, 2026', duration: '2h', assignedTechnician: 'Emily Watson', priority: 'High' },
    { woCode: 'CM-WO-2026-343', category: 'Corrective', equipment: 'Labeler LB-210', location: 'Packaging / Line 4', scheduledDate: 'May 08, 2026', duration: '1h', assignedTechnician: 'Carlos Rodriguez', priority: 'Medium' },
  ],
  '2026-05-12': [
    { woCode: 'PM-WO-2026-305', category: 'Preventive', equipment: 'Compressor CP-07', location: 'Utilities', scheduledDate: 'May 12, 2026', duration: '1h 30min', assignedTechnician: 'Ana Martins', priority: 'Low' },
    { woCode: 'PM-WO-2026-306', category: 'Preventive', equipment: 'Robot Arm RB-405', location: 'Assembly / Line 2', scheduledDate: 'May 12, 2026', duration: '2h', assignedTechnician: 'David Kim', priority: 'Medium' },
    { woCode: 'CM-WO-2026-344', category: 'Corrective', equipment: 'Valve Bank V-220', location: 'Assembly / Zone 1', scheduledDate: 'May 12, 2026', duration: '1h', assignedTechnician: 'Priya Patel', priority: 'High' },
  ],
  '2026-05-15': [
    { woCode: 'PM-WO-2026-352', category: 'Preventive', equipment: 'Molding M-301', location: 'Assembly / Line 2', scheduledDate: 'May 15, 2026', duration: '45min', assignedTechnician: 'Marina Costa', priority: 'Medium' },
  ],
  '2026-05-19': [
    { woCode: 'PM-WO-2026-307', category: 'Preventive', equipment: 'Dust Collector DC-16', location: 'Utilities', scheduledDate: 'May 19, 2026', duration: '1h', assignedTechnician: 'Emily Watson', priority: 'Medium' },
    { woCode: 'CM-WO-2026-345', category: 'Corrective', equipment: 'Dryer DR-77', location: 'Line 2 / Zone 1', scheduledDate: 'May 19, 2026', duration: '2h', assignedTechnician: 'David Kim', priority: 'High' },
    { woCode: 'CM-WO-2026-346', category: 'Corrective', equipment: 'Palletizer PL-09', location: 'Packaging', scheduledDate: 'May 19, 2026', duration: '1h 15min', assignedTechnician: 'Carlos Rodriguez', priority: 'Medium' },
  ],
  '2026-05-22': [
    { woCode: 'PM-WO-2026-308', category: 'Preventive', equipment: 'Chiller CH-08', location: 'Utilities', scheduledDate: 'May 22, 2026', duration: '2h', assignedTechnician: 'Ana Martins', priority: 'Low' },
  ],
  '2026-05-26': [
    { woCode: 'PM-WO-2026-309', category: 'Preventive', equipment: 'Mixer MX-33', location: 'Line 2 / Zone 1', scheduledDate: 'May 26, 2026', duration: '1h', assignedTechnician: 'Priya Patel', priority: 'Medium' },
    { woCode: 'CM-WO-2026-347', category: 'Corrective', equipment: 'Capper CP-30', location: 'Packaging / Line 4', scheduledDate: 'May 26, 2026', duration: '1h 45min', assignedTechnician: 'Carlos Rodriguez', priority: 'High' },
    { woCode: 'PM-WO-2026-353', category: 'Preventive', equipment: 'Washer WS-11', location: 'Line 2', scheduledDate: 'May 26, 2026', duration: '30min', assignedTechnician: 'Rafael Souza', priority: 'Low' },
  ],
  '2026-05-28': [
    { woCode: 'PM-WO-2026-310', category: 'Preventive', equipment: 'Heat Exchanger HX-14', location: 'Utilities', scheduledDate: 'May 28, 2026', duration: '2h 30min', assignedTechnician: 'Emily Watson', priority: 'High' },
    { woCode: 'CM-WO-2026-348', category: 'Corrective', equipment: 'Sensor Array S-101', location: 'Assembly / Line 1', scheduledDate: 'May 28, 2026', duration: '1h', assignedTechnician: 'David Kim', priority: 'Medium' },
  ],
};

const monthMaintenancePlanMap: Record<string, ReadonlyArray<MonthMaintenancePlanItem>> = {
  '2026-05-25': [
    { planName: 'Quarterly Inspection - CV 101', equipment: 'Conveyor CV-101', frequency: 'Quarterly', nextScheduledDate: 'May 25, 2026', responsible: 'Sarah Chen' },
    { planName: 'Lubrication Route - Line 1', equipment: 'Assembly A-201', frequency: 'Monthly', nextScheduledDate: 'May 25, 2026', responsible: 'Carlos Rodriguez' },
  ],
  '2026-05-27': [
    { planName: 'Boiler Feed Pump Inspection', equipment: 'Boiler Feed Pump', frequency: 'Annual', nextScheduledDate: 'May 27, 2026', responsible: 'Emily Watson' },
  ],
  '2026-05-29': [
    { planName: 'Packaging Robot Calibration', equipment: 'Packaging Robot PK-404', frequency: 'Biweekly', nextScheduledDate: 'May 29, 2026', responsible: 'Ana Martins' },
    { planName: 'Utilities Safety Review', equipment: 'Compressor CP-07', frequency: 'Monthly', nextScheduledDate: 'May 29, 2026', responsible: 'David Kim' },
  ],
};

const monthPreventiveScheduleStyles: Record<MonthPreventiveSchedule, { label: string; bg: string; border: string; accent: string; fg: string }> = {
  annual: { label: 'Annual', bg: '#EAF2FF', border: '#7DA6FF', accent: activeTheme.primary, fg: '#1E3A8A' },
  quarterly: { label: 'Quarterly', bg: '#EAF8EF', border: '#B3E2C1', accent: '#16A34A', fg: '#166534' },
  monthly: { label: 'Monthly', bg: '#F1ECFF', border: '#C7B8FF', accent: '#8B5CF6', fg: '#5B21B6' },
  biweekly: { label: 'Biweekly', bg: '#FEF9C3', border: '#FACC15', accent: '#CA8A04', fg: '#713F12' },
};
const monthCorrectiveStyle = { label: 'Corrective', bg: '#FFF3E8', border: '#FDBA74', fg: '#C2410C' };

function formatMonthDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function buildMonthCalendarBlockMap(referenceDate: Date) {
  return calendarBlocks.reduce<Record<string, MonthCalendarEvent[]>>((accumulator, block) => {
    const weekDay = calendarWeekDays[block.day];

    if (!weekDay) {
      return accumulator;
    }

    const key = formatMonthDateKey(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), weekDay.date));

    accumulator[key] ??= [];
    const metaLabel = block.allDay ? 'All day' : block.timeLabel;

    if (block.label === 'Shutdown' && block.allDay) {
      return accumulator;
    }

    accumulator[key].push({
      title: block.label,
      kind: 'calendarBlock',
      blockTone: block.tone,
      metaLabel,
    });

    return accumulator;
  }, {});
}

function buildMonthViewCells(referenceDate: Date) {
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - monthStart.getDay());
  const monthCalendarBlockMap = buildMonthCalendarBlockMap(referenceDate);
  const shutdownDateKeys = new Set(
    calendarBlocks
      .filter((block) => block.label === 'Shutdown' && block.allDay)
      .map((block) => {
        const weekDay = calendarWeekDays[block.day];
        return weekDay ? formatMonthDateKey(new Date(referenceDate.getFullYear(), referenceDate.getMonth(), weekDay.date)) : null;
      })
      .filter((key): key is string => Boolean(key)),
  );

  return Array.from({ length: 42 }, (_, cellIndex) => {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + cellIndex);
    const key = formatMonthDateKey(date);

    return {
      key,
      dayLabel: `${date.getDate()}`.padStart(2, '0'),
      isCurrentMonth: date.getMonth() === referenceDate.getMonth(),
      isShutdown: shutdownDateKeys.has(key),
      events: monthCalendarBlockMap[key] ?? [],
      aggregates: buildMonthAggregateCards(key),
    };
  });
}

function buildMonthAggregateCards(dateKey: string): MonthAggregateCard[] {
  const workOrders = monthWorkOrderMap[dateKey] ?? [];
  const plans = monthMaintenancePlanMap[dateKey] ?? [];

  return monthAggregateCategoryOrder
    .map((category) => {
      if (category === 'Maintenance Plan') {
        return {
          category,
          count: plans.length,
          workOrders: [],
          plans: [...plans],
        };
      }

      const categoryWorkOrders = workOrders.filter((workOrder) => {
        const normalizedCategory = workOrder.category;
        return normalizedCategory === category;
      });

      return {
        category,
        count: categoryWorkOrders.length,
        workOrders: categoryWorkOrders,
        plans: [],
      };
    })
    .filter((aggregate) => aggregate.count > 0);
}

function getMonthlyHoverScheduleKind(schedule: MonthPreventiveSchedule): AnnualScheduleKind {
  return schedule === 'biweekly' ? 'weekly' : schedule;
}

function getMonthlyHoverContext(dateKey: string, equipment: string, scheduleLabel: string): AnnualCalendarTagContext {
  const [yearLabel, monthLabel, dayLabel] = dateKey.split('-');
  const date = new Date(Number(yearLabel), Number(monthLabel) - 1, Number(dayLabel));
  const calendarDayOffset = date.getDate() - 2;

  return {
    equipment,
    zone: `${scheduleLabel} PM - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
    month: date.getMonth(),
    week: 0,
    day: calendarDayOffset,
  };
}

function parseCalendarTimeLabelRange(timeLabel: string) {
  const [startLabel, endLabel] = timeLabel.split('-').map((segment) => segment.trim());

  if (!startLabel || !endLabel) {
    return null;
  }

  const parseTime = (value: string) => {
    const [hourLabel, minuteLabel = '0'] = value.split(':');
    const hour = Number.parseInt(hourLabel ?? '', 10);
    const minute = Number.parseInt(minuteLabel ?? '', 10);

    if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
      return null;
    }

    return { hour, minute };
  };

  const start = parseTime(startLabel);
  const end = parseTime(endLabel);

  if (!start || !end) {
    return null;
  }

  return {
    startHour: start.hour,
    startMinute: start.minute,
    endHour: end.hour,
    endMinute: end.minute,
  };
}

function getCalendarBlockAvailabilityLabel(block: CalendarBlock) {
  return block.label === 'Changeover'
    ? 'Unavailable time for Maintenance'
    : 'Available time for Maintenance';
}

function getCalendarBlockTimelineRange(block: CalendarBlock) {
  const shiftConfig = getCalendarShiftConfig(block.shift);

  if (block.allDay) {
    return {
      startHour: shiftConfig.startHour,
      startMinute: 0,
      endHour: shiftConfig.endHour,
      endMinute: 0,
    };
  }

  if (block.timeLabel) {
    const parsedRange = parseCalendarTimeLabelRange(block.timeLabel);

    if (parsedRange) {
      return parsedRange;
    }
  }

  const durationMinutes = parseCalendarDurationToMinutes(block.duration ?? '');

  return {
    startHour: shiftConfig.startHour,
    startMinute: 0,
    endHour: shiftConfig.startHour + Math.floor(durationMinutes / 60),
    endMinute: durationMinutes % 60,
  };
}

function getCalendarBlockTimelineStyle(block: CalendarBlock) {
  const isUnavailable = block.label === 'Changeover';

  return isUnavailable
    ? {
      borderColor: '#4B5563',
      leftBorderColor: activeTheme.textPrimary,
      backgroundColor: 'rgba(75,85,99,0.14)',
      titleColor: activeTheme.textPrimary,
      captionColor: '#374151',
      badgeBackground: activeTheme.textPrimary,
      badgeColor: activeTheme.backgroundPaper,
    }
    : {
      borderColor: 'var(--paper-border-color)',
      leftBorderColor: activeTheme.textSecondary,
      backgroundColor: activeTheme.backgroundDefault,
      titleColor: activeTheme.textPrimary,
      captionColor: activeTheme.textSecondary,
      badgeBackground: 'var(--paper-border-color)',
      badgeColor: activeTheme.textSecondary,
    };
}

function getStaffAssignedCards(cards: ReadonlyArray<CalendarCard>, staffName: string, day: number) {
  return cards.filter((card) => {
    if (card.day !== day) {
      return false;
    }

    return card.assignee.name.split(' + ').some((assigneeName) => assigneeName.trim() === staffName);
  });
}

function parseCalendarDurationToMinutes(duration: string): number {
  return Math.round(parseCalendarDurationToHours(duration) * 60);
}

const rescheduleReasonOptions = [
  'Resource conflict',
  'Production schedule change',
  'Equipment unavailable',
  'Parts not available',
  'Priority change',
  'Other',
] as const;

type RescheduleReasonOption = (typeof rescheduleReasonOptions)[number];

const revertPlanningReasonOptions = [
  'Rescheduling needed, but new date is not yet defined',
  'Required spare part became unexpectedly unavailable',
  'Assigned technician(s) became unexpectedly unavailable',
  'Scheduled shift has passed while WO is still in Scheduled status',
  'Other',
] as const;

type RevertPlanningReasonOption = (typeof revertPlanningReasonOptions)[number];

type PendingRescheduleState = {
  cardId: string;
  fromShift: CalendarShift;
  fromDay: number;
  toShift: CalendarShift;
  toDay: number;
};

type ComplianceMemoFields = {
  complianceJustification: string;
  containmentPlan: string;
  productRiskAssessment: string;
};

type PmComplianceExtensionInfo = {
  scheduledDate: Date;
  allowedDate: Date;
  targetDate: Date;
  scheduleKind: 'fixed' | 'floating';
};

type BlockedDropNoticeState = PendingRescheduleState & {
  blockLabel: string;
};

const emptyComplianceMemoFields: ComplianceMemoFields = {
  complianceJustification: '',
  containmentPlan: '',
  productRiskAssessment: '',
};

function formatCalendarDate(dayIndex: number) {
  const day = calendarWeekDays[dayIndex];

  if (!day) {
    return '';
  }

  return new Date(2026, 4, day.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCalendarScheduledAt(card: CalendarCard) {
  const day = calendarWeekDays[card.day];

  if (!day) {
    return '';
  }

  return new Date(2026, 4, day.date, card.shift === 'day' ? 8 : 20, 0).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function getCalendarCardBaseDate(card: CalendarCard) {
  const day = calendarWeekDays[card.day];

  return new Date(2026, 4, day?.date ?? 1, card.shift === 'day' ? 8 : 20, 0);
}

function formatCalendarShortDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function getPreventiveScheduleRange(card: CalendarCard) {
  if (card.type !== 'Preventive' || !card.preventiveSchedule) {
    return null;
  }

  const scheduledDate = getCalendarCardBaseDate(card);
  const daysBefore = Math.floor((card.preventiveSchedule.windowDays - 1) / 2);
  const daysAfter = card.preventiveSchedule.windowDays - daysBefore - 1;
  const earliestDate = new Date(scheduledDate);
  const latestDate = new Date(scheduledDate);

  earliestDate.setDate(scheduledDate.getDate() - daysBefore);
  latestDate.setDate(scheduledDate.getDate() + daysAfter);

  return {
    scheduledDate,
    earliestDate,
    latestDate,
    progress:
      card.preventiveSchedule.windowDays <= 1
        ? 0.5
        : daysBefore / (card.preventiveSchedule.windowDays - 1),
  };
}

function getCalendarCardFrequency(card: CalendarCard) {
  if (card.type === 'Preventive') {
    return card.priority === 'Emergency' ? 'Ad hoc' : 'Weekly';
  }

  return 'As needed';
}

function getCalendarFloatingScheduleLatestDateLabel(card: CalendarCard) {
  if (card.type !== 'Preventive' || card.preventiveSchedule?.kind !== 'floating') {
    return null;
  }

  const range = getPreventiveScheduleRange(card);

  if (!range) {
    return null;
  }

  return formatCalendarShortDate(range.latestDate);
}

function getCalendarDateForDay(dayIndex: number) {
  const day = calendarWeekDays[dayIndex];

  if (!day) {
    return null;
  }

  return new Date(2026, 4, day.date);
}

function getPmComplianceExtensionInfo(card: CalendarCard | null, pendingReschedule: PendingRescheduleState | null): PmComplianceExtensionInfo | null {
  if (!card || !pendingReschedule || card.type !== 'Preventive' || !card.preventiveSchedule) {
    return null;
  }

  const range = getPreventiveScheduleRange(card);
  const targetDate = getCalendarDateForDay(pendingReschedule.toDay);

  if (!range || !targetDate) {
    return null;
  }

  const allowedDate = card.preventiveSchedule.kind === 'floating' ? range.latestDate : range.scheduledDate;

  if (targetDate.getTime() <= allowedDate.getTime()) {
    return null;
  }

  return {
    scheduledDate: range.scheduledDate,
    allowedDate,
    targetDate,
    scheduleKind: card.preventiveSchedule.kind,
  };
}

function areComplianceMemoFieldsComplete(fields: ComplianceMemoFields) {
  return Boolean(
    fields.complianceJustification.trim() &&
    fields.containmentPlan.trim() &&
    fields.productRiskAssessment.trim(),
  );
}

function getCalendarCardStatus(card: CalendarCard): 'Planning' | 'Scheduled' | 'In Progress' | 'Done' {
  if (card.statusOverride) {
    return card.statusOverride;
  }

  const todayIndex = calendarWeekDays.findIndex((day) => day.isToday);

  if (todayIndex === -1) {
    return 'Scheduled';
  }

  if (card.day < todayIndex) {
    return 'Done';
  }

  if (card.day === todayIndex) {
    return 'In Progress';
  }

  return 'Scheduled';
}

function getCalendarCardTypeBadge(card: CalendarCard) {
  return card.type === 'Preventive' ? 'PM' : 'CM';
}

function getCalendarCardTypeTone(card: CalendarCard) {
  if (card.type === 'Preventive') {
    return activeTheme.primary;
  }

  return '#F97316';
}

function getCalendarCardTypeIcon(card: CalendarCard) {
  return card.type === 'Preventive' ? HandymanOutlinedIcon : WorkOrderIcon;
}

function getCalendarCardTypeLabel(card: CalendarCard) {
  return card.type;
}

function formatCalendarWorkOrderLabel(workOrder: string) {
  const segments = workOrder.split('-');

  if (segments.length >= 4) {
    return `WO ${segments[2]}${segments[3]}`;
  }

  return workOrder;
}

function mapCalendarCardToPlanningQueueItem(card: CalendarCard): PlanningQueueItem {
  return {
    type: card.type,
    wo: card.workOrder,
    asset: card.title,
    line: `Line ${card.day + 1}`,
    zone: 'Zone 2',
    duration: card.duration,
    priority: card.priority,
    suggestedTechnician: card.assignee.name,
    tone: getCalendarCardTypeTone(card),
  };
}

function getCalendarPersonInitials(name: string) {
  return name
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map((segment) => segment[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatCalendarAssignmentDateTime(card: CalendarCard) {
  const day = calendarWeekDays[card.day];
  const startLabel = formatCalendarTimelineTime(card.startHour, card.startMinute ?? 0);

  if (!day) {
    return card.type === 'Corrective' ? startLabel : `${startLabel} - ${card.duration}`;
  }

  const dateLabel = new Date(2026, 4, day.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return card.type === 'Corrective' ? `${dateLabel} - ${startLabel}` : `${dateLabel} - ${startLabel} - ${card.duration}`;
}

function CalendarPreventiveScheduleSection({ card }: { card: CalendarCard }) {
  if (card.type !== 'Preventive' || !card.preventiveSchedule) {
    return null;
  }

  const range = getPreventiveScheduleRange(card);

  if (!range) {
    return null;
  }

  const isFloating = card.preventiveSchedule.kind === 'floating';

  return (
    <Box
      sx={{
        borderRadius: 2.5,
        border: `1px solid ${isFloating ? '#BFD3FF' : '#F4C98B'}`,
        bgcolor: isFloating ? 'rgba(37,99,235,0.14)' : 'rgba(245,158,11,0.14)',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 1.4,
          py: 1.25,
          bgcolor: isFloating ? 'rgba(37,99,235,0.06)' : 'rgba(245,158,11,0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.75 }}>
          {isFloating ? (
            <CalendarIcon sx={{ fontSize: 16, color: activeTheme.primary }} />
          ) : (
            <WarningAmberIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
          )}
          <Typography variant="body2" sx={{ color: isFloating ? activeTheme.primary : '#F59E0B', fontWeight: 900 }}>
            {isFloating ? 'Floating Schedule' : 'Fixed Schedule'}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ color: activeTheme.textSecondary, lineHeight: 1.55 }}>
          {isFloating
            ? `This Preventive Maintenance is scheduled for ${formatCalendarShortDate(range.scheduledDate)}, with a ${card.preventiveSchedule.windowDays}-day window that allows execution between ${formatCalendarShortDate(range.earliestDate)} and ${formatCalendarShortDate(range.latestDate)} without requiring approval.`
            : `This Preventive Maintenance Work Order must be executed on ${formatCalendarShortDate(range.scheduledDate)}. It cannot be advanced or postponed without prior Quality Department approval through the reschedule process.`}
        </Typography>
      </Box>

      {isFloating ? (
        <Box
          sx={{
            mx: 1.2,
            my: 1.1,
            px: 1.2,
            py: 1,
            borderRadius: 2,
            bgcolor: activeTheme.backgroundPaper,
            border: '1px solid rgba(191,211,255,0.7)',
          }}
        >
          <Box sx={{ position: 'relative', px: 0.2, py: 1.15 }}>
            <Box sx={{ height: 2, borderRadius: 999, bgcolor: '#BFD3FF' }} />
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: `${range.progress * 100}%`,
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: activeTheme.primary,
                border: '2px solid var(--paper-border-color)',
                boxShadow: '0 6px 14px rgba(37,99,235,0.22)',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Box>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block' }}>
                Earliest
              </Typography>
              <Typography variant="body2" sx={{ color: activeTheme.textSecondary, fontWeight: 700 }}>
                {formatCalendarShortDate(range.earliestDate)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block' }}>
                Scheduled
              </Typography>
              <Typography variant="body2" sx={{ color: activeTheme.primary, fontWeight: 800 }}>
                {formatCalendarShortDate(range.scheduledDate)}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, display: 'block' }}>
                Latest
              </Typography>
              <Typography variant="body2" sx={{ color: activeTheme.textSecondary, fontWeight: 700 }}>
                {formatCalendarShortDate(range.latestDate)}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

type GanttMarkerKind = 'pm' | 'cm' | 'maintPlan';
type GanttWindowKind = 'blackout' | 'changeover' | 'today';
type GanttWorkOrderTone = 'green' | 'purple' | 'red';
type GanttRowItem = {
  label: string;
  type: 'asset';
  markers?: ReadonlyArray<{ day: number; kind: GanttMarkerKind }>;
  windows?: ReadonlyArray<{ startDay: number; endDay: number; kind: GanttWindowKind }>;
  workOrders?: ReadonlyArray<{ startDay: number; endDay: number; tone: GanttWorkOrderTone; scheduleKind?: AnnualScheduleKind; overdueState?: AnnualOverdueState }>;
};
type GanttRowGroup = {
  id: string;
  label: string;
  workOrders: number;
  children?: GanttRowItem[];
  defaultExpanded?: boolean;
};

const initialGanttMonthWindowDate = new Date(2026, 3, 1);
const ganttBaseDayWidth = 14;
const ganttBaseLabelWidth = 160;
const defaultGanttWindows: ReadonlyArray<{ startDay: number; endDay: number; kind: GanttWindowKind }> = [
  { startDay: 2, endDay: 4, kind: 'changeover' },
  { startDay: 5, endDay: 9, kind: 'blackout' },
  { startDay: 12, endDay: 13, kind: 'changeover' },
  { startDay: 30, endDay: 31, kind: 'blackout' },
  { startDay: 43, endDay: 46, kind: 'changeover' },
  { startDay: 57, endDay: 57, kind: 'today' },
  { startDay: 59, endDay: 61, kind: 'changeover' },
];

function buildVisibleGanttMonths(startDate: Date) {
  return Array.from({ length: 3 }, (_, monthIndex) => {
    const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + monthIndex, 1);

    return {
      label: monthDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
      days: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate(),
    };
  });
}

const ganttGroups: ReadonlyArray<GanttRowGroup> = [
  {
    id: 'assembly',
    label: 'ASSEMBLY',
    workOrders: 7,
    defaultExpanded: true,
    children: [
      {
        label: 'Molding M-301',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 22, kind: 'pm' },
          { day: 55, kind: 'pm' },
          { day: 63, kind: 'maintPlan' },
        ],
        workOrders: [{ startDay: 20, endDay: 24, tone: 'green' }],
      },
      {
        label: 'Robot Arm RB-405',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 28, kind: 'pm' },
          { day: 70, kind: 'maintPlan' },
        ],
        workOrders: [{ startDay: 27, endDay: 29, tone: 'green' }],
      },
    ],
  },
  {
    id: 'extrusion',
    label: 'EXTRUSION',
    workOrders: 3,
    defaultExpanded: true,
    children: [
      {
        label: 'Assembly A-201',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 27, kind: 'cm' },
          { day: 77, kind: 'maintPlan' },
        ],
      },
      {
        label: 'Conveyor CV-103',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 30, kind: 'pm' },
          { day: 84, kind: 'maintPlan' },
        ],
        workOrders: [{ startDay: 29, endDay: 32, tone: 'purple' }],
      },
      {
        label: 'Conveyor CV-108',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 29, kind: 'pm' },
          { day: 90, kind: 'maintPlan' },
        ],
        workOrders: [{ startDay: 28, endDay: 31, tone: 'purple' }],
      },
    ],
  },
  {
    id: 'molding',
    label: 'MOLDING',
    workOrders: 12,
    defaultExpanded: true,
    children: [
      {
        label: 'Conveyor CV-101',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 8, kind: 'pm' },
          { day: 36, kind: 'pm' },
          { day: 62, kind: 'maintPlan' },
        ],
      },
      {
        label: 'Conveyor CV-102',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 15, kind: 'cm' },
          { day: 41, kind: 'cm' },
          { day: 68, kind: 'maintPlan' },
        ],
      },
      {
        label: 'Pump P-205',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 28, kind: 'pm' },
          { day: 74, kind: 'maintPlan' },
        ],
        workOrders: [{ startDay: 26, endDay: 29, tone: 'red' }],
      },
      {
        label: 'Sensor Array S-101',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 21, kind: 'cm' },
          { day: 50, kind: 'cm' },
          { day: 82, kind: 'maintPlan' },
        ],
      },
      {
        label: 'Sensor Array S-102',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 28, kind: 'cm' },
          { day: 88, kind: 'maintPlan' },
        ],
      },
      {
        label: 'Valve Bank V-220',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 27, kind: 'pm' },
          { day: 66, kind: 'maintPlan' },
        ],
        workOrders: [{ startDay: 26, endDay: 28, tone: 'red' }],
      },
    ],
  },
  {
    id: 'motor-room',
    label: 'MOTOR ROOM',
    workOrders: 5,
    defaultExpanded: true,
    children: [
      {
        label: 'Motor MT-501',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 6, kind: 'pm' },
          { day: 34, kind: 'pm' },
          { day: 79, kind: 'maintPlan' },
        ],
        workOrders: [
          { startDay: 4, endDay: 8, tone: 'purple' },
          { startDay: 34, endDay: 37, tone: 'purple' },
        ],
      },
    ],
  },
  {
    id: 'packaging',
    label: 'PACKAGING',
    workOrders: 4,
    defaultExpanded: true,
    children: [
      {
        label: 'Packaging P-501',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 17, kind: 'pm' },
          { day: 49, kind: 'pm' },
          { day: 65, kind: 'maintPlan' },
        ],
      },
      {
        label: 'Packaging PK-510',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 29, kind: 'cm' },
          { day: 86, kind: 'maintPlan' },
        ],
      },
    ],
  },
  {
    id: 'sterilization',
    label: 'STERILIZATION',
    workOrders: 4,
    defaultExpanded: true,
    children: [
      {
        label: 'Heat Exchanger HX-101',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 9, kind: 'cm' },
          { day: 35, kind: 'cm' },
          { day: 71, kind: 'maintPlan' },
        ],
      },
      {
        label: 'Heat Exchanger HX-102',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 26, kind: 'cm' },
          { day: 89, kind: 'maintPlan' },
        ],
      },
    ],
  },
  {
    id: 'utilities',
    label: 'UTILITIES',
    workOrders: 7,
    defaultExpanded: true,
    children: [
      {
        label: 'Air Handler AH-201',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 64, kind: 'maintPlan' },
        ],
      },
      {
        label: 'Compressor CMP-201',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 13, kind: 'pm' },
          { day: 42, kind: 'pm' },
          { day: 76, kind: 'maintPlan' },
        ],
      },
      {
        label: 'Compressor CMP-310',
        type: 'asset',
        windows: defaultGanttWindows,
        markers: [
          { day: 26, kind: 'pm' },
          { day: 83, kind: 'maintPlan' },
        ],
        workOrders: [{ startDay: 25, endDay: 28, tone: 'purple' }],
      },
    ],
  },
];

function buildPlanningPanelMaintenanceCard(item: PlanningQueueItem): MaintenanceCard {
  return {
    id: `planner-${item.wo}`,
    title: item.asset,
    detail: `${item.type} maintenance planning for ${item.asset} in ${item.zone}.`,
    assignee: '-',
    due: 'Awaiting planning',
    priority: item.priority as MaintenancePriority,
    tags: [item.type],
  };
}

function buildPlanningPanelWorkOrderDraft(item: PlanningQueueItem): WorkOrderDraft {
  const card = buildPlanningPanelMaintenanceCard(item);
  const draft = buildWorkOrderDraftFromBoardCard(card, 'Planning');

  return {
    ...draft,
    sourceCardId: `wo-planning-${card.id}`,
    drawerTitle: item.wo,
    sourceRequestId: item.wo,
    statusLabel: 'Planning',
    maintenanceType: item.type === 'Preventive' ? 'Preventive' : 'Corrective',
    equipment: item.asset,
    problemDescription: `${item.type} maintenance planning for ${item.asset} in ${item.zone}.`,
    activityType: item.type === 'Preventive' ? 'Inspection' : 'Mechanical',
    priority: item.priority,
  };
}

function buildCalendarWorkOrderDraft(card: CalendarCard): WorkOrderDraft {
  const assignedWorkOrderType = card.type === 'Corrective' ? 'Corrective' : 'Preventive';
  const responsibleAssignee: NonNullable<WorkOrderDraft['responsibleAssignee']> = {
    id: card.assignee.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || card.id,
    name: card.assignee.name,
    role: card.assigneeRole ?? 'Technician',
    context: card.type === 'Corrective' ? 'Mechanical' : 'Inspection',
    workload: 'Scheduled WO',
    weeklyLoad: 'Calendar assignment',
    priorityMix: `${card.priority} priority`,
    shift: card.shift === 'day' ? 'Day shift' : 'Night shift',
    recommended: true,
    recommendedDayKey: 'tue',
    recommendationReason: 'assigned to this scheduled calendar WO',
    weeklyWorkload: {
      mon: { level: 'Medium', summary: 'Calendar assignment', workOrders: [] },
      tue: { level: 'Low', summary: 'Assigned to this scheduled WO', workOrders: [{ id: formatCalendarWorkOrderLabel(card.workOrder), type: assignedWorkOrderType }] },
      wed: { level: 'Medium', summary: 'Calendar assignment', workOrders: [] },
      thu: { level: 'Medium', summary: 'Calendar assignment', workOrders: [] },
      fri: { level: 'Medium', summary: 'Calendar assignment', workOrders: [] },
      sat: { level: 'Off', summary: 'Off shift that day', workOrders: [] },
      sun: { level: 'Off', summary: 'Off shift that day', workOrders: [] },
    },
  };
  const maintenanceCard: MaintenanceCard = {
    id: card.id,
    title: card.title,
    detail: getScheduledWorkOrderProblemDescription(card),
    assignee: card.assignee.name,
    due: formatCalendarShortDate(getCalendarCardBaseDate(card)),
    priority: card.priority,
    tags: [card.type],
  };
  const draft = buildWorkOrderDraftFromBoardCard(maintenanceCard, 'Scheduled');

  const weekDay = calendarWeekDays[card.day];
  const dayKey = calendarAssignmentDayKeys[card.day] ?? 'tue';
  const dayNumber = String(weekDay?.date ?? 1).padStart(2, '0');

  return {
    ...draft,
    sourceCardId: card.id,
    drawerTitle: formatCalendarWorkOrderLabel(card.workOrder),
    sourceRequestId: formatCalendarWorkOrderLabel(card.workOrder),
    drawerMode: 'scheduledExecution',
    statusLabel: 'Scheduled',
    maintenanceType: card.type === 'Corrective' ? 'Corrective' : 'Preventive',
    equipment: card.title,
    problemDescription: getScheduledWorkOrderProblemDescription(card),
    activityType: card.type === 'Corrective' ? 'Mechanical' : 'Inspection',
    priority: card.priority,
    responsibleAssignee,
    scheduledExecutionDay: {
      key: dayKey,
      shortLabel: `${weekDay?.label ?? 'Tue'} ${dayNumber}`,
      dayNumber,
      fullLabel: `${formatCalendarDate(card.day)} - ${formatCalendarTimelineTime(card.startHour, card.startMinute ?? 0)}`,
      ctaLabel: `${weekDay?.label ?? 'Tue'} ${dayNumber}`,
      isoDate: `2026-05-${dayNumber}`,
    },
  };
}

function PlanningPanel({ items }: { items: PlanningQueueItem[] }) {
  const [selectedPlanningDraft, setSelectedPlanningDraft] = useState<WorkOrderDraft | null>(null);
  const [activeWorkOrderTab, setActiveWorkOrderTab] = useState<WorkOrderTab>('assignment');
  const [showPreventive, setShowPreventive] = useState(true);
  const [showCorrective, setShowCorrective] = useState(true);

  const filteredItems = items.filter((item) => {
    if (item.type === 'Preventive') {
      return showPreventive;
    }

    return showCorrective;
  });

  const handleOpenWorkOrderDrawer = (item: PlanningQueueItem) => {
    setSelectedPlanningDraft(buildPlanningPanelWorkOrderDraft(item));
    setActiveWorkOrderTab('assignment');
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          minHeight: 220,
          borderRadius: 1.2,
          border: '1px solid #DBDDDF',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ height: 40, px: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ color: activeTheme.textPrimary, fontWeight: 800, lineHeight: 1 }}>
            Planning
            <Box component="span" sx={{ ml: 0.65, color: activeTheme.textSecondary, fontSize: '0.82rem', fontWeight: 700 }}>
              {filteredItems.length}
            </Box>
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
            <Chip
              label="Preventive"
              size="small"
              clickable
              onClick={() => setShowPreventive((current) => !current)}
              sx={{
                height: 22,
                bgcolor: showPreventive ? activeTheme.primary : activeTheme.backgroundPaper,
                color: showPreventive ? activeTheme.backgroundPaper : activeTheme.textSecondary,
                border: '1px solid',
                borderColor: showPreventive ? activeTheme.primary : 'var(--paper-border-color)',
                fontWeight: 700,
                '& .MuiChip-label': { px: 1 },
              }}
            />
            <Chip
              label="Corrective"
              size="small"
              clickable
              onClick={() => setShowCorrective((current) => !current)}
              sx={{
                height: 22,
                bgcolor: showCorrective ? activeTheme.primary : activeTheme.backgroundPaper,
                color: showCorrective ? activeTheme.backgroundPaper : activeTheme.textSecondary,
                border: '1px solid',
                borderColor: showCorrective ? activeTheme.primary : 'var(--paper-border-color)',
                fontWeight: 700,
                '& .MuiChip-label': { px: 1 },
              }}
            />
          </Box>
        </Box>
        <Box
          sx={{
            px: 1.1,
            pb: 1.1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            alignContent: 'start',
            gap: 0.8,
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          {filteredItems.map((item) => (
            <Box
              key={item.wo}
              onClick={() => handleOpenWorkOrderDrawer(item)}
              sx={{
                minHeight: 82,
                borderRadius: 1.2,
                border: '1px solid #D8E2F2',
                bgcolor: activeTheme.backgroundPaper,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                gap: 0.7,
                p: 1,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
                transition: 'border-color 120ms ease, box-shadow 120ms ease, transform 120ms ease',
                '&:hover': {
                  borderColor: activeTheme.primaryLight,
                  boxShadow: '0 10px 22px rgba(15,23,42,0.08)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.8, width: '100%' }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, display: 'block', lineHeight: 1.15 }}>
                    {item.wo}
                  </Typography>
                  <Typography variant="body2" sx={{ color: activeTheme.textPrimary, fontWeight: 850, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', mt: 0.25 }}>
                    {item.asset}
                  </Typography>
                </Box>
                <Chip
                  label={item.type}
                  size="small"
                  sx={{
                    height: 18,
                    borderRadius: 99,
                    bgcolor: '#EFF6FF',
                    color: '#315A8C',
                    border: '1px solid #C7DAF5',
                    fontSize: '0.58rem',
                    fontWeight: 900,
                    lineHeight: 1,
                    flexShrink: 0,
                    '& .MuiChip-label': { px: 0.65 },
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, color: activeTheme.textSecondary, flexWrap: 'wrap' }}>
                {item.propagatedHorizons?.length ? (
                  <Chip
                    label={`Propagated ${item.propagatedHorizons.join(' · ')}`}
                    size="small"
                    sx={{
                      height: 18,
                      borderRadius: 99,
                      bgcolor: '#ECFDF3',
                      color: '#166534',
                      border: '1px solid #BBF7D0',
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      '& .MuiChip-label': { px: 0.65 },
                    }}
                  />
                ) : null}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                  <TimeIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                  <Typography variant="caption" sx={{ fontWeight: 750 }}>
                    {item.duration}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                  <PlaceIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                  <Typography variant="caption" sx={{ fontWeight: 750 }}>
                    {item.line}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      <CreateWorkOrderDrawer
        open={Boolean(selectedPlanningDraft)}
        activeTab={activeWorkOrderTab}
        initialDraft={selectedPlanningDraft}
        initialExpandedSections={{ assignment: true }}
        onTabChange={setActiveWorkOrderTab}
        onClose={() => setSelectedPlanningDraft(null)}
        onSubmit={() => setSelectedPlanningDraft(null)}
      />
    </>
  );
}

function PlannerSurfaceSwitcher({
  mode,
  onChange,
  horizonProjections = [],
}: {
  mode: PlannerSurfaceMode;
  onChange: (nextMode: PlannerSurfaceMode) => void;
  horizonProjections?: PlannerAiHorizonProjection[];
}) {
  const options: Array<{ id: PlannerSurfaceMode; label: string; horizon: PlannerAiHorizonProjection['horizon'] }> = [
    { id: 'calendar', label: 'Weekly', horizon: 'weekly' },
    { id: 'monthly', label: 'Monthly', horizon: 'monthly' },
    { id: 'gantt', label: 'Quarterly', horizon: 'quarterly' },
    { id: 'annual', label: 'Annual', horizon: 'annual' },
  ];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 3,
        maxWidth: '100%',
        borderBottom: `1px solid ${tokenDivider}`,
        pb: 1,
      }}
    >
      {options.map((option) => {
        const isActive = mode === option.id;

        return (
          <Box
            key={option.id}
            onClick={() => onChange(option.id)}
            sx={{
              py: 1,
              cursor: 'pointer',
              borderBottom: isActive ? `2px solid ${tokenBrand.main}` : '2px solid transparent',
              color: isActive ? tokenText.primary : tokenText.secondary,
              fontWeight: isActive ? 700 : 500,
              fontSize: '0.875rem',
              letterSpacing: '0.1px',
              transition: 'all 0.2s ease',
              '&:hover': { color: tokenBrand.main },
              userSelect: 'none',
            }}
          >
            {option.label}
            <AICascadeConflictMarker projections={horizonProjections} label={option.label} />
          </Box>
        );
      })}
    </Box>
  );
}

type AnnualScheduleKind = 'annual' | 'quarterly' | 'monthly' | 'weekly';
type AnnualEventKind = 'blackout' | 'changeover';
type AnnualCalendarTagKind = AnnualScheduleKind | AnnualEventKind;
type AnnualOverdueState = 'needs-execute-or-reschedule' | 'executed-overdue';
type AnnualCalendarEntry = {
  month: number;
  week: number;
  day: number;
  kind: AnnualCalendarTagKind;
  overdueState?: AnnualOverdueState;
};
type AnnualCalendarTagContext = {
  equipment: string;
  zone: string;
  month: number;
  week: number;
  day: number;
  overdueState?: AnnualOverdueState;
};

const annualMonths = [
  { label: 'Jan', weeks: 4 },
  { label: 'Feb', weeks: 4 },
  { label: 'Mar', weeks: 5 },
  { label: 'Apr', weeks: 4 },
  { label: 'May', weeks: 4 },
  { label: 'Jun', weeks: 5 },
  { label: 'Jul', weeks: 4 },
  { label: 'Aug', weeks: 5 },
  { label: 'Sep', weeks: 4 },
  { label: 'Oct', weeks: 4 },
  { label: 'Nov', weeks: 5 },
  { label: 'Dec', weeks: 4 },
] as const;
const annualWeekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const annualTotalWeeks = annualMonths.reduce((total, month) => total + month.weeks, 0);
const annualEquipmentRows = [
  { name: 'Sensor Array S-101', zone: 'Z1 - Autoguard North' },
  { name: 'Conveyor CV-102', zone: 'Z2 - Molding Bay' },
  { name: 'Pump P-206', zone: 'Z2 - Molding Bay' },
  { name: 'Pump P-205', zone: 'Z2 - Molding Bay' },
  { name: 'Conveyor CV-101', zone: 'Z1 - Autoguard North' },
] as const;

const annualScheduleStyles: Record<AnnualScheduleKind, { label: string; bg: string; border: string }> = {
  annual: { label: 'Annual', bg: activeTheme.primary, border: activeTheme.primary },
  quarterly: { label: 'Quarterly', bg: '#A855F7', border: '#9333EA' },
  monthly: { label: 'Monthly', bg: '#2FA84F', border: '#16A34A' },
  weekly: { label: 'Weekly', bg: '#FACC15', border: '#EAB308' },
};
const annualEventStyles: Record<AnnualEventKind, { label: string; bg: string; border: string; fg: string }> = {
  blackout: { label: 'Shutdown', bg: 'var(--paper-border-color)', border: 'var(--paper-border-color)', fg: activeTheme.textSecondary },
  changeover: { label: 'Changeover', bg: '#2F3338', border: activeTheme.textPrimary, fg: activeTheme.backgroundPaper },
};
const annualOverdueStyle = {
  bg: '#DC2626',
  border: '#B91C1C',
  softBg: '#FEF2F2',
  softBorder: '#FCA5A5',
  tone: '#DC2626',
} as const;
const annualOverdueLabels: Record<AnnualOverdueState, string> = {
  'needs-execute-or-reschedule': 'Overdue - Needs execute or reschedule',
  'executed-overdue': 'Executed overdue',
};

function getAnnualWeekStart(monthIndex: number) {
  return annualMonths.slice(0, monthIndex).reduce((total, month) => total + month.weeks, 0);
}

function getAnnualCalendarTagLabel(kind: AnnualCalendarTagKind) {
  return kind in annualScheduleStyles
    ? annualScheduleStyles[kind as AnnualScheduleKind].label
    : annualEventStyles[kind as AnnualEventKind].label;
}

function getAnnualScheduledDateLabel(monthIndex: number, weekIndex: number, dayIndex: number, offsetDays = 0) {
  const date = new Date(2026, monthIndex, weekIndex * 7 + dayIndex + 2 + offsetDays);

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getAnnualScheduleMode(kind: AnnualScheduleKind, context: AnnualCalendarTagContext) {
  if (kind === 'weekly' || (kind === 'monthly' && (context.month + context.week + context.day) % 2 === 0)) {
    return 'fixed';
  }

  return 'floating';
}

function getAnnualContextFromGanttDay(
  visibleMonthWindowStart: Date,
  dayOffset: number,
  equipment: string,
  zone: string,
  overdueState?: AnnualOverdueState,
): AnnualCalendarTagContext {
  const scheduledDate = new Date(
    visibleMonthWindowStart.getFullYear(),
    visibleMonthWindowStart.getMonth(),
    dayOffset + 1,
  );
  const weekday = scheduledDate.getDay();

  return {
    equipment,
    zone,
    month: scheduledDate.getMonth(),
    week: Math.floor((scheduledDate.getDate() - 1) / 7),
    day: weekday === 0 ? 6 : weekday - 1,
    overdueState,
  };
}

function buildAnnualEquipmentEntries(rowIndex: number): AnnualCalendarEntry[] {
  const entries: AnnualCalendarEntry[] = [];

  annualMonths.forEach((month, monthIndex) => {
    entries.push({ month: monthIndex, week: (rowIndex + monthIndex) % month.weeks, day: 2, kind: 'monthly' });

    if (monthIndex % 2 === rowIndex % 2) {
      entries.push({ month: monthIndex, week: Math.min(month.weeks - 1, (rowIndex + 1) % month.weeks), day: 3, kind: 'weekly' });
    }

    if ([1, 7].includes(monthIndex)) {
      entries.push({
        month: monthIndex,
        week: (rowIndex + 1) % month.weeks,
        day: 1,
        kind: 'quarterly',
        overdueState: rowIndex === 0 && monthIndex === 1 ? 'needs-execute-or-reschedule' : undefined,
      });
    }

    if (monthIndex === 5 && rowIndex % 2 === 0) {
      entries.push({
        month: monthIndex,
        week: Math.min(1, month.weeks - 1),
        day: 0,
        kind: 'annual',
        overdueState: rowIndex === 0 ? 'executed-overdue' : undefined,
      });
    }
  });

  entries.push(
    { month: 2, week: 1, day: 2, kind: 'changeover' },
    { month: 3, week: 3, day: 4, kind: rowIndex % 2 === 0 ? 'blackout' : 'changeover' },
    { month: 6, week: 2, day: 2, kind: 'changeover' },
    { month: 8, week: 1, day: 4, kind: 'changeover' },
    { month: 10, week: rowIndex % 3, day: 2, kind: 'changeover' },
    { month: 10, week: 3, day: 4, kind: 'blackout' },
    { month: 11, week: 3, day: 3, kind: 'blackout' },
    { month: 11, week: 3, day: 4, kind: 'blackout' },
  );

  return entries;
}

function AnnualScheduleHoverCard({
  context,
  kind,
  title,
  accentColor,
  icon,
  showScheduleDetails = true,
}: {
  context: AnnualCalendarTagContext;
  kind: AnnualScheduleKind;
  title?: string;
  accentColor?: string;
  icon?: ReactNode;
  showScheduleDetails?: boolean;
}) {
  const scheduleStyle = annualScheduleStyles[kind];
  const cardAccentColor = accentColor ?? scheduleStyle.bg;
  const scheduleMode = getAnnualScheduleMode(kind, context);
  const scheduledDateLabel = getAnnualScheduledDateLabel(context.month, context.week, context.day);
  const earliestDateLabel = getAnnualScheduledDateLabel(context.month, context.week, context.day, -2);
  const latestDateLabel = getAnnualScheduledDateLabel(context.month, context.week, context.day, 2);
  const overdueLabel = context.overdueState ? annualOverdueLabels[context.overdueState] : null;

  return (
    <Paper
      elevation={4}
      className="annual-schedule-hover-card"
      sx={{
        position: 'absolute',
        left: '50%',
        bottom: 'calc(100% + 8px)',
        transform: 'translateX(-50%) translateY(4px)',
        width: 256,
        borderRadius: '12px', // borderRadius/Medium
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
        boxShadow: '0 16px 34px rgba(15,23,42,0.16)',
        opacity: 0,
        pointerEvents: 'none',
        transition: 'opacity 0.16s ease, transform 0.16s ease',
        zIndex: 40,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 1.15, pt: 1, pb: 0.85 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mb: 0.5, minWidth: 0 }}>
          <Box
            sx={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              bgcolor: overdueLabel ? annualOverdueStyle.tone : cardAccentColor,
              color: activeTheme.backgroundPaper,
              display: 'grid',
              placeItems: 'center',
              flexShrink: 0,
            }}
          >
            {icon ?? <HandymanOutlinedIcon sx={{ fontSize: 8.5 }} />}
          </Box>
          <Typography variant="subtitle2" sx={{ color: activeTheme.textPrimary, fontWeight: 900, fontSize: '0.78rem', lineHeight: 1.05 }}>
            {title ?? `${scheduleStyle.label} PM`}
          </Typography>
        </Box>
        {overdueLabel ? (
          <Box
            sx={{
              mb: 0.8,
              px: 0.85,
              py: 0.65,
              borderRadius: 1.4,
              border: `1px solid ${annualOverdueStyle.softBorder}`,
              bgcolor: annualOverdueStyle.softBg,
              display: 'flex',
              alignItems: 'center',
              gap: 0.55,
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: annualOverdueStyle.tone, flexShrink: 0 }} />
            <Typography variant="caption" sx={{ color: annualOverdueStyle.tone, fontWeight: 900, fontSize: '0.58rem', lineHeight: 1.35, textTransform: 'uppercase' }}>
              {overdueLabel}
            </Typography>
          </Box>
        ) : null}
        <Typography variant="caption" sx={{ display: 'block', color: activeTheme.textPrimary, fontWeight: 800, fontSize: '0.72rem', lineHeight: 1.2 }}>
          {context.equipment}
        </Typography>
        <Typography variant="caption" sx={{ display: 'block', color: activeTheme.textSecondary, fontWeight: 700, fontSize: '0.6rem', lineHeight: 1.2, mt: 0.25 }}>
          {context.zone}
        </Typography>
      </Box>

      {showScheduleDetails ? (
        <Box sx={{ borderTop: `1px solid ${tokenDivider}`, px: 1.15, py: 0.8 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.55 }}>
            <Typography variant="caption" sx={{ color: activeTheme.primary, fontWeight: 900, fontSize: '0.6rem', textTransform: 'uppercase' }}>
              {scheduleMode === 'floating' ? 'Floating Schedule' : 'Fixed Schedule'}
            </Typography>
            <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 700, fontSize: '0.58rem' }}>
              {scheduleMode === 'floating' ? 'Execution window' : 'Execution date'}
            </Typography>
          </Box>

          {scheduleMode === 'floating' ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.55, textAlign: 'center' }}>
              {[
                { label: 'Earliest', value: earliestDateLabel },
                { label: 'Scheduled', value: scheduledDateLabel, active: true },
                { label: 'Latest', value: latestDateLabel },
              ].map((item) => (
                <Box key={item.label} sx={{ py: 0.4, borderRadius: 1.1, bgcolor: item.active ? '#F1F5F9' : 'transparent' }}>
                  <Typography variant="caption" sx={{ display: 'block', color: item.active ? activeTheme.primary : activeTheme.textSecondary, fontWeight: 900, fontSize: '0.52rem', lineHeight: 1, textTransform: 'uppercase' }}>
                    {item.label}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: activeTheme.textPrimary, fontWeight: 800, fontSize: '0.68rem', lineHeight: 1.2, mt: 0.3 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ borderRadius: 1.2, bgcolor: '#F1F5F9', py: 0.85, textAlign: 'center' }}>
              <Typography variant="caption" sx={{ display: 'block', color: activeTheme.primary, fontWeight: 900, fontSize: '0.52rem', lineHeight: 1, textTransform: 'uppercase' }}>
                Scheduled
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: activeTheme.textPrimary, fontWeight: 900, fontSize: '0.72rem', lineHeight: 1.2, mt: 0.3 }}>
                {scheduledDateLabel}
              </Typography>
            </Box>
          )}
        </Box>
      ) : null}
    </Paper>
  );
}

function AnnualCalendarTag({ kind, context }: { kind: AnnualCalendarTagKind; context?: AnnualCalendarTagContext }) {
  const isSchedule = kind in annualScheduleStyles;
  const scheduleStyle = isSchedule ? annualScheduleStyles[kind as AnnualScheduleKind] : null;
  const eventStyle = isSchedule ? null : annualEventStyles[kind as AnnualEventKind];
  const Icon = isSchedule ? HandymanOutlinedIcon : kind === 'changeover' ? BlockIcon : ChangeoverIcon;
  const label = getAnnualCalendarTagLabel(kind);
  const isOverdueSchedule = Boolean(isSchedule && context?.overdueState);

  return (
    <Box
      title={isSchedule ? undefined : label}
      aria-label={label}
      sx={{
        position: 'relative',
        width: 16,
        height: 15,
        display: 'grid',
        placeItems: 'center',
        mx: 'auto',
        bgcolor: isOverdueSchedule ? annualOverdueStyle.bg : scheduleStyle?.bg ?? eventStyle?.bg,
        border: `1px solid ${isOverdueSchedule ? annualOverdueStyle.border : scheduleStyle?.border ?? eventStyle?.border}`,
        color: scheduleStyle ? activeTheme.backgroundPaper : eventStyle?.fg,
        boxShadow: '0 1px 2px rgba(15,23,42,0.08)',
        cursor: isSchedule ? 'default' : 'inherit',
        '&:hover .annual-schedule-hover-card': {
          opacity: 1,
          transform: 'translateX(-50%) translateY(0)',
        },
      }}
    >
      <Icon sx={{ fontSize: 10 }} />
      {isSchedule && context ? <AnnualScheduleHoverCard kind={kind as AnnualScheduleKind} context={context} /> : null}
    </Box>
  );
}

function AnnualCalendarLegend() {
  const legendLabelSx = { color: activeTheme.textSecondary, fontWeight: 700, fontSize: '0.64rem', lineHeight: 1.1 } as const;
  const legendGroupSx = { display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 0.9, rowGap: 0.55, minWidth: 0 } as const;
  const legendItemSx = { display: 'inline-flex', alignItems: 'center', gap: 0.42, flexShrink: 0 } as const;

  return (
    <Box sx={{ px: 1.4, py: 1.05, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', columnGap: 1.2, rowGap: 0.8, borderTop: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
      <Box sx={legendGroupSx}>
        <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, letterSpacing: '0.04em', fontSize: '0.66rem' }}>
          SCHEDULES
        </Typography>
        {(Object.keys(annualScheduleStyles) as AnnualScheduleKind[]).map((kind) => (
          <Box key={kind} sx={legendItemSx}>
            <AnnualCalendarTag kind={kind} />
            <Typography variant="caption" sx={legendLabelSx}>
              {annualScheduleStyles[kind].label}
            </Typography>
          </Box>
        ))}
        <Box sx={legendItemSx}>
          <AnnualCalendarTag kind="annual" context={{ equipment: '', zone: '', month: 0, week: 0, day: 0, overdueState: 'needs-execute-or-reschedule' }} />
          <Typography variant="caption" sx={legendLabelSx}>
            Overdue
          </Typography>
        </Box>
      </Box>
      <Box sx={{ width: 1, height: 18, bgcolor: 'var(--paper-border-color)', maxWidth: '1px', alignSelf: 'stretch' }} />
      <Box sx={legendGroupSx}>
        <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, letterSpacing: '0.04em', fontSize: '0.66rem' }}>
          EVENTS
        </Typography>
        {(Object.keys(annualEventStyles) as AnnualEventKind[]).map((kind) => (
          <Box key={kind} sx={legendItemSx}>
            <AnnualCalendarTag kind={kind} />
            <Typography variant="caption" sx={legendLabelSx}>
              {annualEventStyles[kind].label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

type AnnualEquipmentDisplayRow = {
  name: string;
  zone: string;
};

type AnnualGroupedRows = ReadonlyArray<{
  group: GanttRowGroup;
  rows: AnnualEquipmentDisplayRow[];
}>;

const annualEquipmentZoneByName = new Map<string, string>(annualEquipmentRows.map((row) => [row.name, row.zone]));

const AnnualEquipmentCalendarRow = memo(function AnnualEquipmentCalendarRow({
  equipment,
  entries,
  equipmentWidth,
  dayWidth,
  rowHeight,
}: {
  equipment: AnnualEquipmentDisplayRow;
  entries: AnnualCalendarEntry[];
  equipmentWidth: number;
  dayWidth: number;
  rowHeight: number;
}) {
  const entryByCell = useMemo(() => {
    const nextEntryByCell = new Map<string, AnnualCalendarEntry>();

    entries.forEach((entry) => {
      nextEntryByCell.set(`${getAnnualWeekStart(entry.month) + entry.week}-${entry.day}`, entry);
    });

    return nextEntryByCell;
  }, [entries]);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: `${equipmentWidth}px ${dayWidth}px minmax(0, 1fr)`, borderBottom: `1px solid ${tokenDivider}` }}>
      <Box sx={{ minHeight: rowHeight * annualWeekdays.length, px: 0.8, borderRight: `1px solid ${tokenDivider}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Typography variant="caption" sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.66rem', lineHeight: 1.1 }}>
          {equipment.name}
        </Typography>
        <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.56rem', lineHeight: 1.15, mt: 0.2 }}>
          {equipment.zone}
        </Typography>
      </Box>
      <Box sx={{ borderRight: `1px solid ${tokenDivider}` }}>
        {annualWeekdays.map((dayLabel, dayIndex) => (
          <Box key={dayLabel} sx={{ height: rowHeight, display: 'grid', placeItems: 'center', borderBottom: dayIndex === annualWeekdays.length - 1 ? 'none' : '1px solid #DCE3EC', color: dayIndex < 2 ? '#A7B0BE' : activeTheme.textPrimary, fontSize: '0.54rem', fontWeight: dayIndex < 2 ? 600 : 800 }}>
            {dayLabel}
          </Box>
        ))}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        {annualWeekdays.map((dayLabel, dayIndex) => (
          <Box key={`${equipment.name}-${dayLabel}`} sx={{ display: 'flex', height: rowHeight }}>
            {Array.from({ length: annualTotalWeeks }, (_, weekIndex) => {
              const entry = entryByCell.get(`${weekIndex}-${dayIndex}`);

              return (
                <Box
                  key={`${equipment.name}-${dayLabel}-${weekIndex}`}
                  sx={{
                    flex: '1 1 0',
                    minWidth: 0,
                    height: rowHeight,
                    display: 'grid',
                    placeItems: 'center',
                    borderRight: '1px solid #E9EEF6',
                    borderBottom: dayIndex === annualWeekdays.length - 1 ? 'none' : '1px solid #DCE3EC',
                    bgcolor: activeTheme.backgroundPaper,
                  }}
                >
                  {entry ? (
                    <AnnualCalendarTag
                      kind={entry.kind}
                      context={{
                        equipment: equipment.name,
                        zone: equipment.zone,
                        month: entry.month,
                        week: entry.week,
                        day: entry.day,
                        overdueState: entry.overdueState,
                      }}
                    />
                  ) : null}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
});

function AnnualCalendarBoard() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () =>
      ganttGroups.reduce<Record<string, boolean>>((accumulator, group) => {
        accumulator[group.id] = group.defaultExpanded ?? false;
        return accumulator;
      }, {}),
  );
  const [zoneFilter, setZoneFilter] = useState('All Zones');
  const [lineFilter, setLineFilter] = useState('All Lines');
  const equipmentWidth = 118;
  const dayWidth = 76;
  const rowHeight = 17;
  const annualGroupedRows = useMemo<AnnualGroupedRows>(
    () =>
      ganttGroups
        .map((group) => ({
          group,
          rows: (group.children ?? [])
            .map((equipment) => ({
              name: equipment.label,
              zone: annualEquipmentZoneByName.get(equipment.label) ?? group.label,
            }))
            .filter((equipment) => zoneFilter === 'All Zones' || equipment.zone.startsWith(zoneFilter)),
        }))
        .filter(({ rows }) => rows.length > 0),
    [zoneFilter],
  );
  const annualVisibleRowIndexes = useMemo(() => {
    const nextVisibleRowIndexes = new Map<string, number>();

    annualGroupedRows.forEach(({ group, rows }) => {
      if (!expandedGroups[group.id]) {
        return;
      }

      rows.forEach((equipment) => {
        nextVisibleRowIndexes.set(`${group.id}-${equipment.name}`, nextVisibleRowIndexes.size);
      });
    });

    return nextVisibleRowIndexes;
  }, [annualGroupedRows, expandedGroups]);
  const annualEntriesByRowIndex = useMemo(() => {
    const nextEntriesByRowIndex = new Map<number, AnnualCalendarEntry[]>();

    annualVisibleRowIndexes.forEach((rowIndex) => {
      nextEntriesByRowIndex.set(rowIndex, buildAnnualEquipmentEntries(rowIndex));
    });

    return nextEntriesByRowIndex;
  }, [annualVisibleRowIndexes]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  return (
    <Paper elevation={0} sx={{ border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: 'background.paper', overflow: 'visible', boxShadow: '0 14px 34px rgba(15,23,42,0.06)' }}>
      <Box sx={{ px: 1.3, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
        <Typography variant="subtitle2" sx={{ color: activeTheme.textPrimary, fontWeight: 800 }}>
          Annual PM Plan - 2026
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
          {[
            { value: zoneFilter, onChange: setZoneFilter, options: ['All Zones', 'Z1', 'Z2'] },
            { value: lineFilter, onChange: setLineFilter, options: ['All Lines', 'Line 1', 'Line 2'] },
          ].map((filter) => (
            <Select
              key={filter.options[0]}
              size="small"
              value={filter.value}
              onChange={(event) => filter.onChange(event.target.value)}
              IconComponent={KeyboardArrowDownIcon}
              sx={{
                minWidth: 118,
                height: 26,
                borderRadius: 2,
                bgcolor: activeTheme.backgroundDefault,
                color: activeTheme.textSecondary,
                fontSize: '0.66rem',
                fontWeight: 700,
                '& fieldset': { borderColor: 'var(--paper-border-color)' },
                '& .MuiSelect-select': { py: 0.25 },
              }}
            >
              {filter.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          ))}
        </Box>
      </Box>
      <Box sx={{ overflow: 'visible', bgcolor: activeTheme.backgroundPaper }}>
        <Box sx={{ width: '100%', minWidth: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: `${equipmentWidth}px ${dayWidth}px minmax(0, 1fr)`, borderBottom: `1px solid ${tokenDivider}` }}>
            <Box sx={{ px: 0.9, py: 0.75, borderRight: `1px solid ${tokenDivider}`, color: tokenText.primary, fontSize: '0.66rem', fontWeight: 700 }}>
              Equipment
            </Box>
            <Box sx={{ px: 0.9, py: 0.75, borderRight: `1px solid ${tokenDivider}`, color: tokenText.primary, fontSize: '0.66rem', fontWeight: 700, textAlign: 'center' }}>
              Days
            </Box>
            <Box sx={{ display: 'flex', minWidth: 0 }}>
              {annualMonths.map((month) => (
                <Box key={month.label} sx={{ flex: `${month.weeks} 1 0`, minWidth: 0, py: 0.75, borderRight: `1px solid ${tokenDivider}`, color: tokenText.primary, fontSize: '0.66rem', fontWeight: 700, textAlign: 'center' }}>
                  {month.label}
                </Box>
              ))}
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: `${equipmentWidth}px ${dayWidth}px minmax(0, 1fr)`, borderBottom: `1px solid ${tokenDivider}` }}>
            <Box sx={{ borderRight: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }} />
            <Box sx={{ borderRight: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }} />
            <Box sx={{ display: 'flex', minWidth: 0 }}>
              {annualMonths.flatMap((month) =>
                Array.from({ length: month.weeks }, (_, weekIndex) => (
                  <Box key={`${month.label}-${weekIndex}`} sx={{ flex: '1 1 0', minWidth: 0, height: 20, borderRight: '1px solid #E9EEF6', display: 'grid', placeItems: 'center', color: activeTheme.textSecondary, fontSize: '0.54rem', fontWeight: 700 }}>
                    W{weekIndex + 1}
                  </Box>
                )),
              )}
            </Box>
          </Box>
          {annualGroupedRows.map(({ group, rows }) => {
            const isExpanded = expandedGroups[group.id];
            const hasChildren = rows.length > 0;

            return (
              <Box key={group.id}>
                <Box sx={{ display: 'grid', gridTemplateColumns: `${equipmentWidth + dayWidth}px minmax(0, 1fr)`, minHeight: 32, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
                  <Button
                    onClick={() => hasChildren && toggleGroup(group.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      px: 1.2,
                      py: 0.6,
                      borderRadius: 0,
                      borderRight: `1px solid ${tokenDivider}`,
                      color: activeTheme.textSecondary,
                      textTransform: 'none',
                      fontWeight: 800,
                      gap: 0.55,
                    }}
                  >
                    {hasChildren ? (isExpanded ? <KeyboardArrowDownIcon sx={{ fontSize: 16 }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />) : <KeyboardArrowRightIcon sx={{ fontSize: 16, opacity: 0.5 }} />}
                    <Typography variant="caption" sx={{ fontWeight: 800, color: activeTheme.textSecondary, fontSize: '0.66rem' }}>
                      {group.label}
                    </Typography>
                    <Chip
                      label={`${group.workOrders} WOs`}
                      size="small"
                      sx={{
                        ml: 0.35,
                        height: 18,
                        bgcolor: activeTheme.backgroundDefault,
                        border: `1px solid ${tokenDivider}`,
                        color: activeTheme.textSecondary,
                        '& .MuiChip-label': { px: 0.7, fontSize: '0.62rem', fontWeight: 700 },
                      }}
                    />
                  </Button>
                  <Box sx={{ minHeight: 32, bgcolor: activeTheme.backgroundDefault }} />
                </Box>

                {hasChildren && isExpanded
                  ? rows.map((equipment) => {
                    const rowIndex = annualVisibleRowIndexes.get(`${group.id}-${equipment.name}`) ?? 0;
                    const entries = annualEntriesByRowIndex.get(rowIndex) ?? [];

                    return (
                      <AnnualEquipmentCalendarRow
                        key={`${group.id}-${equipment.name}`}
                        equipment={equipment}
                        entries={entries}
                        equipmentWidth={equipmentWidth}
                        dayWidth={dayWidth}
                        rowHeight={rowHeight}
                      />
                    );
                  })
                  : null}
              </Box>
            );
          })}
        </Box>
      </Box>
      <AnnualCalendarLegend />
    </Paper>
  );
}

const plannerFilterSelectMenuProps = {
  PaperProps: {
    sx: {
      mt: 0.4,
      borderRadius: '8px',
      border: `1px solid ${tokenDivider}`,
      boxShadow: '0 14px 32px rgba(15, 23, 42, 0.16)',
      maxHeight: 300,
    },
  },
};

function hasPlannerFilters(filters: PlannerFilters) {
  return Boolean(
    filters.workAreas.length ||
    filters.types.length ||
    filters.priorities.length ||
    filters.criticalities.length ||
    filters.assignedToSearch.trim() ||
    filters.assetHierarchy
  );
}

function getPlannerFilterCount(filters: PlannerFilters) {
  return (
    filters.workAreas.length +
    filters.types.length +
    filters.priorities.length +
    filters.criticalities.length +
    (filters.assignedToSearch.trim() ? 1 : 0) +
    (filters.assetHierarchy ? 1 : 0)
  );
}

function formatPlannerFilterSummary(selectedOptions: readonly string[], emptyLabel = 'All') {
  if (!selectedOptions.length) return emptyLabel;
  if (selectedOptions.length <= 2) return selectedOptions.join(', ');
  return `${selectedOptions[0]}, ${selectedOptions[1]} +${selectedOptions.length - 2}`;
}

function formatPlannerFilterChipValue(selectedOptions: readonly string[]) {
  if (selectedOptions.length <= 2) return selectedOptions.join(' and ');
  return `${selectedOptions.slice(0, -1).join(', ')} and ${selectedOptions[selectedOptions.length - 1]}`;
}

function PlannerFilterMultiSelect<T extends string>({
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
        renderValue={(selected) => formatPlannerFilterSummary(selected as string[], emptyLabel)}
        onChange={(event) => {
          const value = event.target.value;
          onChange((typeof value === 'string' ? value.split(',') : value) as T[]);
        }}
        MenuProps={plannerFilterSelectMenuProps}
        sx={{
          bgcolor: activeTheme.backgroundPaper,
          borderRadius: 1,
          '& .MuiSelect-select': {
            minHeight: 23,
            py: 1,
            color: selectedOptions.length ? activeTheme.textPrimary : activeTheme.textSecondary,
            fontSize: '0.82rem',
            fontWeight: 800,
          },
          '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--paper-border-color)' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#94A3B8' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: activeTheme.primary },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option} sx={{ minHeight: 34, gap: 0.7 }}>
            <Checkbox
              size="small"
              checked={selectedOptions.includes(option)}
              sx={{ p: 0.2, color: '#94A3B8', '&.Mui-checked': { color: activeTheme.primary } }}
            />
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: '0.78rem', fontWeight: selectedOptions.includes(option) ? 850 : 650 }}>
              {option}
            </Typography>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function PlannerFilterPanel({
  anchorEl,
  open,
  filters,
  onClose,
  onClearAll,
  onApply,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  filters: PlannerFilters;
  onClose: () => void;
  onClearAll: () => void;
  onApply: (filters: PlannerFilters) => void;
}) {
  const [draftFilters, setDraftFilters] = useState<PlannerFilters>(filters);
  const hasFilters = hasPlannerFilters(draftFilters);

  useEffect(() => {
    if (!open) return;

    setDraftFilters(filters);
  }, [filters, open]);

  const updateDraftList = <T extends string,>(key: 'workAreas' | 'types' | 'priorities' | 'criticalities', value: T[]) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const handleClearAll = () => {
    setDraftFilters(emptyPlannerFilters);
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
            borderRadius: '12px',
            border: `1px solid ${tokenDivider}`,
            boxShadow: '0 20px 44px rgba(15, 23, 42, 0.18)',
            overflow: 'auto',
          },
        },
      }}
    >
      <Box sx={{ p: 1.55, bgcolor: activeTheme.backgroundPaper }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.35 }}>
          <Typography sx={{ color: activeTheme.primary, fontSize: '0.92rem', fontWeight: 950, lineHeight: 1 }}>
            Filters
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gap: 1.35 }}>
          <PlannerFilterMultiSelect label="Type" options={plannerTypeOptions} selectedOptions={draftFilters.types} onChange={(value) => updateDraftList('types', value)} />
          <PlannerFilterMultiSelect label="Priority" options={plannerPriorityOptions} selectedOptions={draftFilters.priorities} onChange={(value) => updateDraftList('priorities', value)} />
          <PlannerFilterMultiSelect label="Asset Criticality" options={plannerCriticalityOptions} selectedOptions={draftFilters.criticalities} onChange={(value) => updateDraftList('criticalities', value)} />

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
                  <SearchIcon sx={{ fontSize: 17, color: activeTheme.textSecondary }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px', // borderRadius/Medium
                bgcolor: 'background.paper',
                '& fieldset': { borderColor: tokenDivider },
                '&:hover fieldset': { borderColor: tokenBrand.light },
                '&.Mui-focused fieldset': { borderColor: tokenBrand.main, borderWidth: 2 },
              },
              '& .MuiInputLabel-root': { color: tokenText.secondary },
              '& .MuiInputLabel-root.Mui-focused': { color: tokenBrand.main },
              '& .MuiInputBase-input': { fontSize: '0.82rem', fontWeight: 500, color: tokenText.primary },
            }}
          />

          <Paper elevation={0} sx={{ p: 1, border: `1px solid ${tokenDivider}`, borderRadius: '8px', bgcolor: activeTheme.backgroundDefault }}>
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
                sx={{
                  mt: -0.35,
                  minHeight: 24,
                  color: tokenBrand.main,
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  textTransform: 'none',
                  borderRadius: '8px',
                  '&:hover': { bgcolor: tokenBrand.softBg }
                }}
              >
                Clear hierarchy
              </Button>
            ) : null}
          </Paper>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8, mt: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            onClick={handleClearAll}
            disabled={!hasFilters}
            sx={{
              minWidth: 78,
              color: tokenBrand.main,
              borderColor: tokenBrand.main,
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': {
                borderColor: tokenBrand.dark,
                bgcolor: tokenBrand.softBg,
              },
            }}
          >
            Clear All
          </Button>
          <Button
            size="small"
            variant="contained"
            onClick={handleApply}
            sx={{
              minWidth: 78,
              bgcolor: tokenBrand.main,
              color: '#FFFFFF',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: tokenBrand.dark,
                boxShadow: 'none',
              },
            }}
          >
            Apply
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}

function PlannerToolbar({
  surfaceMode,
  onSurfaceModeChange,
  selectedPriorities,
  onPriorityFiltersChange,
  showSurfaceSwitcher = true,
  horizonProjections = [],
}: {
  surfaceMode: PlannerSurfaceMode;
  onSurfaceModeChange: (nextMode: PlannerSurfaceMode) => void;
  selectedPriorities: MaintenancePriority[];
  onPriorityFiltersChange: (priorities: MaintenancePriority[]) => void;
  showSurfaceSwitcher?: boolean;
  horizonProjections?: PlannerAiHorizonProjection[];
}) {
  const [filtersAnchorEl, setFiltersAnchorEl] = useState<HTMLElement | null>(null);
  const [plannerFilters, setPlannerFilters] = useState<PlannerFilters>(emptyPlannerFilters);
  const filtersOpen = Boolean(filtersAnchorEl);
  const appliedPlannerFilters = { ...plannerFilters, priorities: selectedPriorities };
  const activeFilterCount = getPlannerFilterCount(appliedPlannerFilters);
  const hasActiveFilters = hasPlannerFilters(appliedPlannerFilters);
  const clearPlannerFilters = () => {
    setPlannerFilters(emptyPlannerFilters);
    onPriorityFiltersChange([]);
  };
  const clearPlannerFilterGroup = (key: 'workAreas' | 'types' | 'criticalities') => {
    setPlannerFilters((current) => ({
      ...current,
      [key]: [],
    }));
  };
  const clearPlannerPriorityFilterGroup = () => {
    setPlannerFilters((current) => ({
      ...current,
      priorities: [],
    }));
    onPriorityFiltersChange([]);
  };
  const clearPlannerAssignedToSearch = () => {
    setPlannerFilters((current) => ({
      ...current,
      assignedToSearch: '',
    }));
  };
  const clearPlannerAssetHierarchy = () => {
    setPlannerFilters((current) => ({
      ...current,
      assetHierarchy: null,
    }));
  };
  const activeFilterChips: PlannerFilterChip[] = [
    ...(appliedPlannerFilters.workAreas.length
      ? [
        {
          key: 'work-area',
          label: `Work Area: ${formatPlannerFilterChipValue(appliedPlannerFilters.workAreas)}`,
          onDelete: () => clearPlannerFilterGroup('workAreas'),
        },
      ]
      : []),
    ...(appliedPlannerFilters.types.length
      ? [
        {
          key: 'type',
          label: `Type: ${formatPlannerFilterChipValue(appliedPlannerFilters.types)}`,
          onDelete: () => clearPlannerFilterGroup('types'),
        },
      ]
      : []),
    ...(appliedPlannerFilters.priorities.length
      ? [
        {
          key: 'priority',
          label: `Priority: ${formatPlannerFilterChipValue(appliedPlannerFilters.priorities)}`,
          onDelete: clearPlannerPriorityFilterGroup,
        },
      ]
      : []),
    ...(appliedPlannerFilters.criticalities.length
      ? [
        {
          key: 'criticality',
          label: `Asset Criticality: ${formatPlannerFilterChipValue(appliedPlannerFilters.criticalities)}`,
          onDelete: () => clearPlannerFilterGroup('criticalities'),
        },
      ]
      : []),
    ...(appliedPlannerFilters.assignedToSearch.trim()
      ? [
        {
          key: 'assigned-to-search',
          label: `Assigned: ${appliedPlannerFilters.assignedToSearch.trim()}`,
          onDelete: clearPlannerAssignedToSearch,
        },
      ]
      : []),
    ...(appliedPlannerFilters.assetHierarchy
      ? [
        {
          key: `asset-${appliedPlannerFilters.assetHierarchy.id}`,
          label: `Asset: ${appliedPlannerFilters.assetHierarchy.name}`,
          onDelete: clearPlannerAssetHierarchy,
        },
      ]
      : []),
  ];
  const calendarFilterFieldSx = {
    minWidth: 0,
    '& .MuiOutlinedInput-root': {
      height: 34,
      minHeight: 34,
      borderRadius: '8px', // borderRadius/Small
      bgcolor: 'background.paper',
      color: tokenText.primary,
      fontSize: '0.78rem',
      '& fieldset': {
        borderColor: tokenDivider,
      },
      '&:hover fieldset': {
        borderColor: tokenBrand.light,
      },
      '&.Mui-focused fieldset': {
        borderColor: tokenBrand.main,
        borderWidth: 1,
      },
    },
    '& .MuiInputLabel-root': {
      color: tokenText.secondary,
      fontSize: '0.7rem',
      fontWeight: 500,
      transform: 'translate(14px, 8px) scale(1)',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: tokenBrand.main,
    },
    '& .MuiInputLabel-shrink': {
      color: tokenBrand.main,
      bgcolor: 'background.paper',
      px: 0.35,
      transform: 'translate(12px, -6px) scale(0.86)',
    },
    '& .MuiSelect-select': {
      display: 'flex',
      alignItems: 'center',
      minHeight: '0 !important',
      py: '6px',
      pl: 1.25,
      pr: '28px !important',
      fontSize: '0.78rem',
    },
    '& .MuiInputBase-input': {
      py: '6px',
      pl: 1.25,
      fontSize: '0.78rem',
    },
    '& .MuiSvgIcon-root': {
      fontSize: 18,
    },
  } as const;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.9,
        flex: '1 1 720px',
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {showSurfaceSwitcher ? (
        <PlannerSurfaceSwitcher
          mode={surfaceMode}
          onChange={onSurfaceModeChange}
          horizonProjections={horizonProjections}
        />
      ) : null}
      {hasActiveFilters ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
          {activeFilterChips.map((chip) => (
            <Chip
              key={chip.key}
              label={chip.label}
              size="small"
              onDelete={chip.onDelete}
              sx={{
                height: 24,
                borderRadius: 1,
                bgcolor: activeTheme.backgroundDefault,
                color: activeTheme.textSecondary,
                border: `1px solid ${tokenDivider}`,
                fontSize: '0.66rem',
                fontWeight: 800,
                '& .MuiChip-label': { px: 0.8 },
                '& .MuiChip-deleteIcon': { fontSize: 16, color: activeTheme.textSecondary },
              }}
            />
          ))}
          <Button
            size="small"
            onClick={clearPlannerFilters}
            sx={{
              minHeight: 24,
              py: 0,
              color: tokenBrand.main,
              fontSize: '0.8125rem',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { bgcolor: tokenBrand.softBg }
            }}
          >
            Clear all
          </Button>
        </Box>
      ) : null}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 144px))',
            lg: '132px 144px 144px',
          },
          gap: 0.55,
          justifyContent: 'start',
          alignItems: 'start',
        }}
      >
        <Button
          size="small"
          variant={hasActiveFilters ? 'contained' : 'outlined'}
          startIcon={<TuneIcon />}
          endIcon={<KeyboardArrowDownIcon />}
          onClick={(event) => setFiltersAnchorEl(event.currentTarget)}
          aria-expanded={filtersOpen}
          sx={{
            height: 34,
            minHeight: 34,
            borderRadius: '8px',
            whiteSpace: 'nowrap',
            fontSize: '0.8125rem',
            fontWeight: 500,
            textTransform: 'none',
            boxShadow: 'none',
            bgcolor: hasActiveFilters ? tokenBrand.main : 'transparent',
            color: hasActiveFilters ? '#FFFFFF' : tokenBrand.main,
            borderColor: hasActiveFilters ? 'transparent' : tokenBrand.main,
            '&:hover': {
              bgcolor: hasActiveFilters ? tokenBrand.dark : tokenBrand.softBg,
              borderColor: hasActiveFilters ? 'transparent' : tokenBrand.dark,
              boxShadow: 'none',
            },
          }}
        >
          {activeFilterCount ? `Filters (${activeFilterCount})` : 'Filters'}
        </Button>
        <TextField
          size="small"
          label="From"
          type="date"
          fullWidth
          sx={calendarFilterFieldSx}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="To"
          type="date"
          fullWidth
          sx={calendarFilterFieldSx}
          InputLabelProps={{ shrink: true }}
        />
      </Box>
      <PlannerFilterPanel
        anchorEl={filtersAnchorEl}
        open={filtersOpen}
        filters={appliedPlannerFilters}
        onClose={() => setFiltersAnchorEl(null)}
        onClearAll={clearPlannerFilters}
        onApply={(nextFilters) => {
          setPlannerFilters(nextFilters);
          onPriorityFiltersChange(nextFilters.priorities);
        }}
      />
    </Box>
  );
}

function PlannerPrimaryAction({ onClick }: { onClick: () => void }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        flex: '0 0 auto',
      }}
    >
      <Button
        variant="contained"
        onClick={onClick}
        sx={{
          minHeight: 40,
          px: 2.5,
          borderRadius: '8px', // borderRadius/Small
          bgcolor: tokenBrand.main,
          color: '#FFFFFF',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            bgcolor: tokenBrand.dark,
            boxShadow: 'none',
          },
        }}
      >
        PM Plans
      </Button>
    </Box>
  );
}

function MonthCalendarBoard() {
  const monthCells = buildMonthViewCells(monthViewReferenceDate);
  const [selectedAggregate, setSelectedAggregate] = useState<MonthAggregateDialogState | null>(null);

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: activeTheme.backgroundPaper,
        border: '1px solid #DBDDDF',
        borderRadius: 1.2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          minHeight: 48,
          px: 1.1,
          py: 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          bgcolor: activeTheme.backgroundPaper,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2, flex: '1 1 auto' }}>
          <IconButton size="small" sx={{ width: 24, height: 24, color: activeTheme.primary }}>
            <ChevronLeftIcon sx={{ fontSize: 17 }} />
          </IconButton>
          <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800 }}>
            May 2026
          </Typography>
          <IconButton size="small" sx={{ width: 24, height: 24, color: activeTheme.primary }}>
            <ChevronRightIcon sx={{ fontSize: 17 }} />
          </IconButton>
        </Box>
      </Box>
      <Paper elevation={0} sx={{ borderRadius: 0, border: `1px solid ${tokenDivider}`, borderLeft: 0, borderRight: 0, overflow: 'hidden' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: 1540 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(220px, 1fr))', borderBottom: `1px solid ${tokenDivider}`, bgcolor: activeTheme.backgroundDefault }}>
              {monthWeekdayLabels.map((dayLabel, index) => (
                <Box
                  key={dayLabel}
                  sx={{
                    minHeight: 34,
                    px: 1,
                    py: 0.55,
                    borderRight: index === monthWeekdayLabels.length - 1 ? 'none' : `1px solid ${tokenDivider}`,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography variant="caption" sx={{ color: activeTheme.textPrimary, fontWeight: 500, fontSize: '0.72rem', lineHeight: 1 }}>
                    {dayLabel}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(220px, 1fr))' }}>
              {monthCells.map((cell, index) => {
                const isLastColumn = index % 7 === 6;

                return (
                  <Box
                    key={cell.key}
                    sx={{
                      minHeight: 98,
                      borderRight: isLastColumn ? 'none' : `1px solid ${tokenDivider}`,
                      borderBottom: `1px solid ${tokenDivider}`,
                      px: 0.8,
                      py: 0.6,
                      bgcolor: cell.isCurrentMonth ? activeTheme.backgroundPaper : activeTheme.backgroundDefault,
                      backgroundImage: cell.isShutdown
                        ? 'repeating-linear-gradient(135deg, transparent 0, transparent 10px, rgba(100,116,139,0.36) 10px, rgba(100,116,139,0.36) 13px, transparent 13px, transparent 23px)'
                        : 'none',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.45,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.6, mb: 0.15 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: cell.isShutdown ? activeTheme.textSecondary : cell.isCurrentMonth ? activeTheme.primary : '#A8B1C0',
                          fontWeight: cell.isCurrentMonth ? 500 : 400,
                          lineHeight: 1,
                          fontSize: '1.05rem',
                        }}
                      >
                        {cell.dayLabel}
                      </Typography>
                      {cell.isShutdown ? (
                        <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, fontSize: '0.62rem', lineHeight: 1 }}>
                          Shutdown
                        </Typography>
                      ) : null}
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.35 }}>
                      {cell.aggregates.map((aggregate) => {
                        const aggregateStyle = monthAggregateCategoryStyles[aggregate.category];
                        const AggregateIcon = aggregateStyle.icon;
                        const suffix = aggregate.category === 'Maintenance Plan' ? 'Plans' : 'WO';

                        return (
                          <Button
                            key={`${cell.key}-${aggregate.category}`}
                            onClick={() => setSelectedAggregate({ dateKey: cell.key, dayLabel: cell.dayLabel, aggregate })}
                            sx={{
                              width: '100%',
                              minHeight: 24,
                              px: 0.65,
                              py: 0.25,
                              borderRadius: 99,
                              border: `1px solid ${aggregateStyle.border}`,
                              bgcolor: aggregateStyle.bg,
                              color: aggregateStyle.fg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              gap: 0.45,
                              boxShadow: '0 1px 1px rgba(15,23,42,0.05)',
                              textTransform: 'none',
                              minWidth: 0,
                              '&:hover': {
                                bgcolor: aggregateStyle.bg,
                                borderColor: aggregateStyle.fg,
                                boxShadow: '0 3px 8px rgba(15,23,42,0.12)',
                              },
                            }}
                          >
                            <AggregateIcon sx={{ color: aggregateStyle.fg, fontSize: 12, flexShrink: 0 }} />
                            <Typography
                              variant="caption"
                              sx={{
                                color: aggregateStyle.fg,
                                fontSize: '0.64rem',
                                lineHeight: 1.15,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                flex: 1,
                                minWidth: 0,
                                textAlign: 'left',
                                fontWeight: 800,
                              }}
                            >
                              {aggregateStyle.label} · {aggregate.count} {suffix}
                            </Typography>
                          </Button>
                        );
                      })}
                      {cell.events.map((event, eventIndex) => (
                        (() => {
                          return (
                            <Box
                              key={`${cell.key}-${event.title}-${eventIndex}`}
                              sx={{
                                position: 'relative',
                                minHeight: 18,
                                width: '100%',
                                maxWidth: 'none',
                                px: 0.6,
                                borderRadius: 99,
                                border: `1px solid ${event.blockTone}`,
                                bgcolor:
                                  event.blockTone === '#4B5563'
                                    ? 'rgba(75,85,99,0.12)'
                                    : 'rgba(243,244,246,0.95)',
                                color: activeTheme.textPrimary,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.45,
                                boxShadow: '0 1px 1px rgba(15,23,42,0.05)',
                                backgroundImage:
                                  `repeating-linear-gradient(135deg, transparent 0, transparent 15px, ${event.blockTone === '#4B5563' ? 'rgba(148,163,184,0.34)' : 'rgba(148,163,184,0.28)'
                                  } 15px, ${event.blockTone === '#4B5563' ? 'rgba(148,163,184,0.34)' : 'rgba(148,163,184,0.28)'
                                  } 16px, transparent 16px, transparent 29px)`,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: activeTheme.textPrimary,
                                  fontSize: '0.62rem',
                                  lineHeight: 1.15,
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  wordBreak: 'normal',
                                  flex: 1,
                                  minWidth: 0,
                                }}
                              >
                                {event.title}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: activeTheme.textSecondary,
                                  fontSize: '0.58rem',
                                  lineHeight: 1,
                                  flexShrink: 0,
                                }}
                              >
                                {event.metaLabel}
                              </Typography>
                            </Box>
                          );
                        })()
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        </Box>
      </Paper>
      <MonthScheduleLegend />
      <MaintenanceMonthAggregateDetailsDialog
        selection={selectedAggregate}
        onClose={() => setSelectedAggregate(null)}
      />
    </Paper>
  );
}

function MonthScheduleLegend() {
  const eventItems = [
    { label: 'Shutdown', bg: 'var(--paper-border-color)', stripe: 'rgba(100,116,139,0.22)' },
    { label: 'Changeover', bg: '#4B5563', stripe: 'rgba(17,24,39,0.28)' },
  ];
  const legendLabelSx = { color: activeTheme.textSecondary, fontWeight: 700, fontSize: '0.64rem', lineHeight: 1.1 } as const;
  const legendGroupSx = { display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 0.9, rowGap: 0.55, minWidth: 0 } as const;
  const legendItemSx = { display: 'inline-flex', alignItems: 'center', gap: 0.4, flexShrink: 0 } as const;

  return (
    <Box sx={{ px: 1.4, py: 1.1, display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', columnGap: 1.2, rowGap: 0.8, borderTop: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
      <Box sx={legendGroupSx}>
        <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, letterSpacing: '0.04em', fontSize: '0.66rem' }}>
          WORKLOAD
        </Typography>
        {monthAggregateCategoryOrder.map((category) => {
          const style = monthAggregateCategoryStyles[category];
          const Icon = style.icon;

          return (
            <Box key={category} sx={legendItemSx}>
              <Box sx={{ width: 18, height: 18, borderRadius: '50%', border: `1px solid ${style.border}`, bgcolor: style.bg, color: style.fg, display: 'grid', placeItems: 'center' }}>
                <Icon sx={{ fontSize: 11 }} />
              </Box>
              <Typography variant="caption" sx={legendLabelSx}>
                {style.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
      <Box sx={{ width: 1, height: 18, bgcolor: 'var(--paper-border-color)', maxWidth: '1px', alignSelf: 'stretch' }} />
      <Box sx={legendGroupSx}>
        <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, letterSpacing: '0.04em', fontSize: '0.66rem' }}>
          EVENTS
        </Typography>
        {eventItems.map((item) => (
          <Box key={item.label} sx={legendItemSx}>
            <Box
              sx={{
                width: 16,
                height: 9,
                bgcolor: item.bg,
                backgroundImage: `repeating-linear-gradient(45deg, ${item.stripe} 0, ${item.stripe} 2px, transparent 2px, transparent 5px)`,
                border: '1px solid rgba(100,116,139,0.32)',
              }}
            />
            <Typography variant="caption" sx={legendLabelSx}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function CalendarPriorityLegend({
  selectedPriorities,
  onPriorityToggle,
}: {
  selectedPriorities: MaintenancePriority[];
  onPriorityToggle: (priority: MaintenancePriority) => void;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, px: 0.75, py: 0.4, borderRadius: '8px' }}>
      {calendarPriorityLegendLevels.map((priority) => {
        const selected = selectedPriorities.includes(priority);

        return (
          <Box
            key={priority}
            component="button"
            type="button"
            onClick={() => onPriorityToggle(priority)}
            aria-pressed={selected}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.45,
              border: '1px solid',
              borderColor: selected ? maintenancePriorityStyles[priority].border : 'transparent',
              borderRadius: 0.75,
              bgcolor: selected ? maintenancePriorityStyles[priority].bg : 'transparent',
              px: 0.45,
              py: 0.2,
              cursor: 'pointer',
            }}
          >
            <Box sx={{ width: 9, height: 9, bgcolor: maintenancePriorityStyles[priority].fg, border: `1px solid ${maintenancePriorityStyles[priority].border}` }} />
            <Typography variant="caption" sx={{ color: activeTheme.textPrimary, fontWeight: 700, fontSize: '0.67rem' }}>
              {priority}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function CalendarHeaderMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.25 }}>
      <Typography
        variant="caption"
        sx={{
          color: activeTheme.textSecondary,
          fontWeight: 800,
          fontSize: '0.52rem',
          lineHeight: 1,
          letterSpacing: '0.04em',
        }}
      >
        {label}
      </Typography>
      <Box
        sx={{
          minWidth: 42,
          px: 0.55,
          py: 0.18,
          borderRadius: 99,
          bgcolor: 'action.hover',
          color: activeTheme.textSecondary,
          fontSize: '0.5rem',
          fontWeight: 900,
          lineHeight: 1.1,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {value}
      </Box>
    </Box>
  );
}

function formatCalendarDayInsightTitle(dayIndex: number) {
  const day = calendarWeekDays[dayIndex];

  if (!day) {
    return '';
  }

  return new Date(2026, 4, day.date).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCalendarTimelineDayTitle(dayIndex: number) {
  return formatCalendarDayInsightTitle(dayIndex);
}

function formatCalendarTimelineTime(hour: number, minute = 0) {
  return `${`${hour}`.padStart(2, '0')}:${`${minute}`.padStart(2, '0')}`;
}

function normalizeEquipmentLabel(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function extractEquipmentCode(label: string) {
  return label.toUpperCase().match(/[A-Z]+-\d+/)?.[0] ?? null;
}

function isSameEquipmentLabel(firstLabel: string, secondLabel: string) {
  const normalizedFirst = normalizeEquipmentLabel(firstLabel);
  const normalizedSecond = normalizeEquipmentLabel(secondLabel);

  if (!normalizedFirst || !normalizedSecond) {
    return false;
  }

  if (normalizedFirst === normalizedSecond || normalizedFirst.includes(normalizedSecond) || normalizedSecond.includes(normalizedFirst)) {
    return true;
  }

  const firstCode = extractEquipmentCode(firstLabel);
  const secondCode = extractEquipmentCode(secondLabel);

  return firstCode !== null && firstCode === secondCode;
}

function getLowestMachineAvailability(
  machineAvailability: CalendarDayInsightMetric['machineAvailability'],
  cards: ReadonlyArray<CalendarCard>,
) {
  const scheduledEquipment = cards.map((card) => card.title);

  return [...machineAvailability]
    .filter((machine) => !scheduledEquipment.some((equipment) => isSameEquipmentLabel(machine.machine, equipment)))
    .sort((firstMachine, secondMachine) => firstMachine.value - secondMachine.value)
    .slice(0, 3);
}

function getCalendarShiftConfig(shift: CalendarShift) {
  return shift === 'day'
    ? { label: 'Day shift', startHour: 6, endHour: 18 }
    : { label: 'Night shift', startHour: 18, endHour: 24 };
}

function normalizeCardTimeForShift(
  startHour: number,
  startMinute: number,
  shift: CalendarShift,
): { startHour: number; startMinute: number } {
  const shiftConfig = getCalendarShiftConfig(shift);
  const totalMinutes = startHour * 60 + startMinute;
  const shiftStartMinutes = shiftConfig.startHour * 60;
  const shiftEndMinutes = shiftConfig.endHour * 60;

  if (totalMinutes < shiftStartMinutes || totalMinutes >= shiftEndMinutes) {
    return { startHour: shiftConfig.startHour, startMinute: 0 };
  }

  return { startHour, startMinute };
}

function CalendarDayInsightPanel({
  dayIndex,
  cards,
  onClose,
}: {
  dayIndex: number;
  cards: ReadonlyArray<CalendarCard>;
  onClose: () => void;
}) {
  const insight = calendarDayInsights[dayIndex];
  const dayCards = cards.filter((card) => card.day === dayIndex);
  const visibleMachineAvailability = getLowestMachineAvailability(insight.machineAvailability, dayCards);
  const operatorCount = new Set(dayCards.map((card) => card.assignee.name)).size;
  const preventiveTasks = dayCards.filter((card) => card.type === 'Preventive').length;
  const varianceTone = insight.variancePct >= 0 ? '#16A34A' : '#DC2626';

  return (
    <Paper
      elevation={6}
      sx={{
        width: { xs: 'min(92vw, 460px)', sm: 460 },
        borderRadius: '16px', // borderRadius/Large
        border: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
        boxShadow: '0 18px 42px rgba(15,23,42,0.18)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 1.4, py: 1.2, borderBottom: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ color: activeTheme.textPrimary, fontWeight: 900, lineHeight: 1.15 }}>
            Produced - {formatCalendarDayInsightTitle(dayIndex)}
          </Typography>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            mt: -0.35,
            mr: -0.35,
            color: activeTheme.primary,
            width: 28,
            height: 28,
            flexShrink: 0,
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <Box sx={{ p: 1.3, display: 'flex', flexDirection: 'column', gap: 1.05 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1 }}>
          {[
            { value: `${operatorCount}`, suffix: '', label: 'Operators', tone: '#0EA5E9' },
            { value: `${preventiveTasks}`, suffix: '', label: 'PM Tasks', tone: activeTheme.primary },
            { value: `${insight.variancePct >= 0 ? '+' : ''}${insight.variancePct}`, suffix: ' %', label: 'Vs AVG', tone: varianceTone },
          ].map((metric) => (
            <Paper
              key={metric.label}
              elevation={0}
              sx={{
                p: 1.05,
                borderRadius: 1.8,
                border: '1px solid #E2EAF8',
                bgcolor: activeTheme.backgroundDefault,
                boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: metric.tone }} />
              <Typography variant="h4" sx={{ color: activeTheme.textPrimary, fontWeight: 500, lineHeight: 1 }}>
                {metric.value}
                {metric.suffix ? (
                  <Box component="span" sx={{ fontSize: '0.95rem', color: activeTheme.textSecondary, ml: 0.25 }}>
                    {metric.suffix}
                  </Box>
                ) : null}
              </Typography>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 700, display: 'block', mt: 0.35 }}>
                {metric.label}
              </Typography>
            </Paper>
          ))}
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 1.1,
            borderRadius: 1.8,
            border: '1px solid #E2EAF8',
            bgcolor: activeTheme.backgroundDefault,
            boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: '#0EA5E9' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
            <Box>
              <Typography variant="h4" sx={{ color: activeTheme.textPrimary, fontWeight: 500, lineHeight: 1 }}>
                {insight.producedSummary}
                <Box component="span" sx={{ fontSize: '1rem', color: activeTheme.textSecondary, ml: 0.35 }}>
                  Units
                </Box>
              </Typography>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 700, display: 'block', mt: 0.35 }}>
                Produced Summary
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, display: 'block', letterSpacing: '0.04em' }}>
                TARGET
              </Typography>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800 }}>
                ({insight.producedTarget})
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 1.2, borderRadius: 2, border: '1px solid #D8E2F2', bgcolor: activeTheme.backgroundPaper }}>
          <Typography variant="subtitle2" sx={{ color: activeTheme.textPrimary, fontWeight: 800, mb: 1 }}>
            Downtime Mix
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.85 }}>
            {insight.downtimeBreakdown.map((entry) => (
              <Box key={entry.label} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ color: entry.tone === 'danger' ? '#FF3B30' : activeTheme.textSecondary, fontWeight: entry.tone === 'danger' ? 800 : 500 }}>
                  {entry.label}
                </Typography>
                <Typography variant="body2" sx={{ color: entry.tone === 'danger' ? '#FF3B30' : activeTheme.textSecondary, fontWeight: entry.tone === 'danger' ? 800 : 500 }}>
                  {entry.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        <Paper elevation={0} sx={{ p: 1.2, borderRadius: 2, border: '1px solid #D8E2F2', bgcolor: activeTheme.backgroundPaper }}>
          <Typography variant="subtitle2" sx={{ color: activeTheme.textPrimary, fontWeight: 800, mb: 1 }}>
            Machine Availability
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.05,
              maxHeight: 220,
              overflowY: 'auto',
              pr: 0.5,
            }}
          >
            {visibleMachineAvailability.length ? (
              visibleMachineAvailability.map((machine) => (
                <Box key={machine.machine}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 0.35 }}>
                    <Typography variant="body2" sx={{ color: activeTheme.textSecondary, fontWeight: 500 }}>
                      {machine.machine}
                    </Typography>
                    <Typography variant="body2" sx={{ color: activeTheme.textSecondary, fontWeight: 500 }}>
                      {machine.value.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Box sx={{ width: '100%', height: 5, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden' }}>
                    <Box sx={{ width: `${machine.value}%`, height: '100%', borderRadius: 999, bgcolor: tokenBrand.main }} />
                  </Box>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: activeTheme.textSecondary }}>
                No other machine availability for this day.
              </Typography>
            )}
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1 }}>
          {insight.shiftAvailability.map((shift) => (
            <Paper
              key={shift.label}
              elevation={0}
              sx={{
                p: 1.05,
                borderRadius: 1.8,
                border: '1px solid #E2EAF8',
                bgcolor: activeTheme.backgroundDefault,
                boxShadow: '0 1px 2px rgba(15,23,42,0.05)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: '#0EA5E9' }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.8 }}>
                <Box>
                  <Typography variant="h4" sx={{ color: activeTheme.textPrimary, fontWeight: 500, lineHeight: 1 }}>
                    {shift.produced}
                  </Typography>
                  <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 700, display: 'block', mt: 0.35 }}>
                    {shift.label}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, display: 'block', letterSpacing: '0.04em' }}>
                    AVAIL.
                  </Typography>
                  <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800 }}>
                    {shift.availability}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

type CalendarBadgeTone = 'neutral' | 'red' | 'green' | 'orange';

function getCalendarBadgeColors(tone: CalendarBadgeTone) {
  return {
    neutral: { color: '#6A6D70', border: '#D7DBDF', bg: activeTheme.backgroundPaper },
    red: { color: '#DC2626', border: '#FCA5A5', bg: '#FEF2F2' },
    green: { color: '#16A34A', border: '#BBF7D0', bg: '#F0FDF4' },
    orange: { color: '#D97706', border: '#FDE68A', bg: '#FFFBEB' },
  }[tone];
}

function CalendarCardBadge({ label, tone = 'neutral' }: { label: string; tone?: CalendarBadgeTone }) {
  const colors = getCalendarBadgeColors(tone);

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
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.62rem',
        lineHeight: 1,
        fontWeight: 900,
        flexShrink: 0,
      }}
    >
      {label}
    </Box>
  );
}

function CalendarCardTag({ label, color, bg, border }: { label: string; color: string; bg: string; border: string }) {
  return (
    <Box
      component="span"
      sx={{
        height: 18,
        px: 0.55,
        borderRadius: 0.8,
        border: `1px solid ${border}`,
        bgcolor: bg,
        color,
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '0.6rem',
        fontWeight: 950,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {label}
    </Box>
  );
}

function CalendarCardMetaItem({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <Box sx={{ minWidth: 0, display: 'inline-flex', alignItems: 'center', gap: 0.25, color: activeTheme.textSecondary }}>
      {icon}
      <Typography component="span" noWrap sx={{ color: activeTheme.textSecondary, fontSize: '0.62rem', fontWeight: 700, lineHeight: 1 }}>
        {text}
      </Typography>
    </Box>
  );
}

function CalendarWorkCard({
  card,
  isDragging,
  isTechnicianDropTarget,
  isHighlighted,
  canReceiveTechnician,
  onDragStart,
  onDragEnd,
  onTechnicianDragOver,
  onTechnicianDragLeave,
  onTechnicianDrop,
  onClick,
  registerCardRef,
}: {
  card: CalendarCard;
  isDragging: boolean;
  isTechnicianDropTarget: boolean;
  isHighlighted?: boolean;
  canReceiveTechnician: boolean;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  onTechnicianDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onTechnicianDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onTechnicianDrop: (event: DragEvent<HTMLDivElement>) => void;
  onClick?: () => void;
  registerCardRef?: (element: HTMLDivElement | null) => void;
}) {
  const priority = maintenancePriorityStyles[card.priority];
  const floatingScheduleLatestDateLabel = getCalendarFloatingScheduleLatestDateLabel(card);
  const TypeIcon = getCalendarCardTypeIcon(card);
  const scheduleLabel = floatingScheduleLatestDateLabel ?? card.due;
  const showPriorityTag = card.priority === 'Emergency' || card.priority === 'High';

  return (
    <Paper
      elevation={0}
      draggable
      ref={registerCardRef}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onTechnicianDragOver}
      onDragLeave={onTechnicianDragLeave}
      onDrop={onTechnicianDrop}
      onClick={(event) => {
        event.stopPropagation();
        if (!isDragging) {
          onClick?.();
        }
      }}
      sx={{
        position: 'relative',
        borderRadius: '12px',
        border: `1px solid ${isHighlighted ? tokenWarning.main : isTechnicianDropTarget ? tokenBrand.main : tokenDivider}`,
        bgcolor: isHighlighted ? '#FFFBEB' : isTechnicianDropTarget ? tokenBrand.softBg : 'background.paper',
        px: 1,
        py: 0.85,
        pl: 1.75,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        overflow: 'hidden',
        minHeight: 88,
        boxShadow: 'none',
        cursor: 'grab',
        opacity: isDragging ? 0.45 : 1,
        transform: isDragging ? 'scale(0.985)' : 'none',
        transition: 'opacity 120ms ease, transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease',
        '&:active': { cursor: 'grabbing' },
        '&:hover': {
          borderColor: tokenBrand.main,
          bgcolor: tokenBrand.softBg,
          boxShadow: '0 2px 8px rgba(0, 31, 155, 0.10)',
        },
        ...(isHighlighted
          ? {
            outline: `2px solid ${tokenWarning.main}`,
            outlineOffset: 2,
            boxShadow: '0 0 0 4px rgba(245, 158, 11, 0.18)',
          }
          : null),
        ...(canReceiveTechnician
          ? {
            outline: isTechnicianDropTarget ? `2px solid ${tokenBrand.main}` : `1px dashed ${tokenBrand.selectedBg}`,
            outlineOffset: 1,
          }
          : null),
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 7,
          top: 9,
          bottom: 10,
          width: 6,
          borderRadius: 99,
          bgcolor: priority.fg,
        }}
      />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.55, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, minWidth: 0 }}>
          <CalendarCardBadge label="A" tone="red" />
          <Typography
            variant="subtitle2"
            noWrap
            sx={{
              display: 'block',
              color: tokenText.primary,
              fontWeight: 500,
              lineHeight: '22px',
              fontSize: '0.875rem',
              minWidth: 0,
            }}
          >
            {card.title}
          </Typography>
        </Box>
        {showPriorityTag ? (
          <CalendarCardTag label={card.priority} color={priority.fg} bg={priority.bg} border={priority.border} />
        ) : null}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.5, minWidth: 0, flexWrap: 'wrap' }}>
        <CalendarCardMetaItem icon={<WorkOrderIcon sx={{ fontSize: 12 }} />} text={formatCalendarWorkOrderLabel(card.workOrder)} />
        <CalendarCardMetaItem icon={<PlaceIcon sx={{ fontSize: 12 }} />} text="Y22" />
        <CalendarCardMetaItem icon={<TypeIcon sx={{ fontSize: 12 }} />} text={getCalendarCardTypeLabel(card)} />
        <CalendarCardMetaItem icon={<TimeIcon sx={{ fontSize: 12 }} />} text={card.duration} />
      </Box>

      <CalendarWorkCardSignalChips assetTitle={card.title} assigneeName={card.assignee.name} />

      <Box sx={{ mt: 0.6, pt: 0.55, borderTop: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.55, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0 }}>
          <Box sx={{ width: 17, height: 17, borderRadius: '50%', bgcolor: card.assigneeRole === 'Operator' ? '#0EA5E9' : '#2F80ED', color: activeTheme.backgroundPaper, display: 'grid', placeItems: 'center', fontSize: '0.58rem', fontWeight: 900, flexShrink: 0 }}>
            {card.assignee.initials}
          </Box>
          <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontSize: '0.62rem', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {card.assignee.name}
          </Typography>
        </Box>
        {scheduleLabel ? (
          <CalendarCardMetaItem icon={<CalendarIcon sx={{ fontSize: 12 }} />} text={scheduleLabel} />
        ) : null}
      </Box>

      {canReceiveTechnician ? (
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.45,
            color: isTechnicianDropTarget ? activeTheme.primary : '#94A3B8',
            fontWeight: 800,
            fontSize: '0.58rem',
            lineHeight: 1,
          }}
        >
          {isTechnicianDropTarget ? 'Release to assign technician' : 'Drop technician here'}
        </Typography>
      ) : null}
    </Paper>
  );
}

function getScheduledWorkOrderProblemDescription(card: CalendarCard) {
  if (card.title === 'Extrusion Machine') {
    return 'Oil leak detected near main cylinder seal. Requires immediate inspection and seal replacement.';
  }

  if (card.type === 'Preventive') {
    return `${card.title} scheduled preventive maintenance before the next production window.`;
  }

  return `${card.title} corrective work scheduled for the assigned execution window.`;
}

function CalendarRevertPlanningDialog({
  card,
  reason,
  notes,
  onClose,
  onReasonChange,
  onNotesChange,
  onConfirm,
}: {
  card: CalendarCard | null;
  reason: RevertPlanningReasonOption | '';
  notes: string;
  onClose: () => void;
  onReasonChange: (reason: RevertPlanningReasonOption) => void;
  onNotesChange: (notes: string) => void;
  onConfirm: () => void;
}) {
  const isSubmitDisabled = !card || !reason || (reason === 'Other' && !notes.trim());

  return (
    <Dialog
      open={Boolean(card)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px', // borderRadius/Large
          border: `1px solid ${tokenDivider}`,
          boxShadow: '0 24px 48px rgba(15,23,42,0.22)',
          overflow: 'hidden',
          bgcolor: 'background.paper',
          maxWidth: 500,
        },
      }}
    >
      {card ? (
        <Box sx={{ p: { xs: 1.6, md: 1.8 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.2 }}>
            <Typography variant="h6" sx={{ color: activeTheme.textPrimary, fontWeight: 800 }}>
              Return to Planning
            </Typography>
            <IconButton
              onClick={onClose}
              sx={{
                width: 28,
                height: 28,
                color: activeTheme.primary,
                mt: -0.2,
                mr: -0.35,
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', mb: 1.3 }}>
            <Typography variant="body2" sx={{ color: activeTheme.textPrimary }}>
              {`Select the reason for reverting ${formatCalendarWorkOrderLabel(card.workOrder)}`}
            </Typography>
            <Chip
              label={card.title}
              size="small"
              sx={{
                bgcolor: '#F3F4F6',
                color: '#4B5563',
                fontWeight: 500,
                borderRadius: 999,
                height: 24,
              }}
            />
          </Box>

          <Typography variant="body2" sx={{ color: activeTheme.textPrimary, fontWeight: 700, mb: 0.7 }}>
            Justification <Box component="span" sx={{ color: '#DC2626' }}>*</Box>
          </Typography>

          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={reason}
              onChange={(event) => {
                const nextReason = event.target.value as RevertPlanningReasonOption;
                onReasonChange(nextReason);
                if (nextReason !== 'Other') {
                  onNotesChange('');
                }
              }}
              sx={{ gap: 0.2 }}
            >
              {revertPlanningReasonOptions.map((option) => (
                <FormControlLabel
                  key={option}
                  value={option}
                  control={
                    <Radio
                      size="small"
                      sx={{
                        color: activeTheme.textSecondary,
                        '&.Mui-checked': { color: activeTheme.primary },
                      }}
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: '#2F3640' }}>
                      {option}
                    </Typography>
                  }
                  sx={{
                    m: 0,
                    alignItems: 'flex-start',
                    minHeight: 30,
                    '& .MuiFormControlLabel-label': {
                      pt: 0.25,
                    },
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {reason === 'Other' ? (
            <TextField
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              placeholder="Describe the reason..."
              multiline
              minRows={3}
              fullWidth
              sx={{
                mt: 1.2,
                '& .MuiOutlinedInput-root': {
                  alignItems: 'flex-start',
                  borderRadius: 1.7,
                  bgcolor: activeTheme.backgroundPaper,
                },
              }}
            />
          ) : null}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.2, mt: reason === 'Other' ? 1.5 : 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                minWidth: 112,
                minHeight: 34,
                borderRadius: '8px',
                borderColor: tokenBrand.main,
                color: tokenBrand.main,
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  borderColor: tokenBrand.dark,
                  bgcolor: tokenBrand.softBg,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={onConfirm}
              disabled={isSubmitDisabled}
              sx={{
                minWidth: 136,
                minHeight: 34,
                borderRadius: '8px',
                boxShadow: 'none',
                bgcolor: tokenBrand.main,
                color: '#FFFFFF',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: tokenBrand.dark,
                  boxShadow: 'none',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'text.disabled',
                },
              }}
            >
              Confirm Revert
            </Button>
          </Box>
        </Box>
      ) : null}
    </Dialog>
  );
}

function CalendarAssignTechnicianDialog({
  card,
  technician,
  onClose,
  onReplace,
  onAdd,
}: {
  card: CalendarCard | null;
  technician: DraggedStaffAssignment | null;
  onClose: () => void;
  onReplace: () => void;
  onAdd: () => void;
}) {
  return (
    <Dialog
      open={Boolean(card && technician)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px', // borderRadius/Large
          border: `1px solid ${tokenDivider}`,
          boxShadow: '0 24px 48px rgba(15,23,42,0.18)',
          overflow: 'hidden',
          background: 'background.paper',
        },
      }}
    >
      {card && technician ? (
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, mb: 2.1 }}>
            <Box>
              <Typography variant="h6" sx={{ color: activeTheme.textPrimary, fontWeight: 800, letterSpacing: '-0.02em' }}>
                Assign technician to Work Order
              </Typography>
              <Typography variant="body2" sx={{ color: activeTheme.textSecondary, mt: 0.45 }}>
                Choose how to assign this technician to the Work Order.
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                mt: -0.35,
                mr: -0.35,
                color: activeTheme.textSecondary,
                border: '1px solid transparent',
                '&:hover': { bgcolor: activeTheme.backgroundDefault, borderColor: tokenDivider },
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.1 }}>
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: activeTheme.backgroundDefault }}>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Work Order
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mt: 0.45, flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" sx={{ color: activeTheme.textPrimary, fontWeight: 800 }}>
                  {card.workOrder}
                </Typography>
                <Box
                  sx={{
                    minWidth: 34,
                    px: 0.7,
                    py: 0.2,
                    borderRadius: 99,
                    bgcolor: '#F59E0B',
                    color: activeTheme.backgroundPaper,
                    fontSize: '0.7rem',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    textAlign: 'center',
                  }}
                >
                  {getCalendarCardTypeBadge(card)}
                </Box>
              </Box>
              <Typography variant="body2" sx={{ color: activeTheme.textSecondary, mt: 0.35 }}>
                {card.title}. Autoguard North
              </Typography>
              <Typography variant="body2" sx={{ color: activeTheme.textSecondary, mt: 0.45 }}>
                {formatCalendarAssignmentDateTime(card)}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Currently assigned
              </Typography>
              <Typography variant="subtitle1" sx={{ color: activeTheme.textPrimary, fontWeight: 700, mt: 0.45 }}>
                {card.assignee.name}
              </Typography>
            </Paper>

            <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                New technician
              </Typography>
              <Typography variant="subtitle1" sx={{ color: activeTheme.textPrimary, fontWeight: 700, mt: 0.45 }}>
                {technician.name}
              </Typography>
            </Paper>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1.1, mt: 2.2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                minWidth: 76,
                minHeight: 40,
                borderRadius: '8px',
                borderColor: tokenBrand.main,
                color: tokenBrand.main,
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  borderColor: tokenBrand.dark,
                  bgcolor: tokenBrand.softBg,
                },
              }}
            >
              Cancel
            </Button>
            <Box sx={{ display: 'flex', gap: 1.1, flexWrap: 'wrap', justifyContent: 'flex-end', flex: 1 }}>
              <Button
                variant="outlined"
                onClick={onReplace}
                sx={{
                  minHeight: 40,
                  borderRadius: '8px',
                  borderColor: tokenBrand.main,
                  color: tokenBrand.main,
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: tokenBrand.dark,
                    bgcolor: tokenBrand.softBg,
                  },
                }}
              >
                Replace assigned technician
              </Button>
              <Button
                variant="contained"
                onClick={onAdd}
                sx={{
                  minHeight: 40,
                  borderRadius: '8px',
                  px: 2.2,
                  bgcolor: tokenBrand.main,
                  color: '#FFFFFF',
                  fontWeight: 500,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: tokenBrand.dark,
                    boxShadow: 'none',
                  },
                }}
              >
                Add technician
              </Button>
            </Box>
          </Box>
        </Box>
      ) : null}
    </Dialog>
  );
}

function AdditionalAssigneesDialog({
  open,
  dayLabel,
  onClose,
  onAddPeople,
}: {
  open: boolean;
  dayLabel: string;
  onClose: () => void;
  onAddPeople: (people: AdditionalAssigneePerson[]) => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const suggestedPeople = additionalAssigneePeople.filter((person) => person.recommended);
  const selectedPeople = additionalAssigneePeople.filter((person) => selectedIds.includes(person.id));

  useEffect(() => {
    if (open) {
      setSelectedIds([]);
    }
  }, [open]);

  const togglePerson = (person: AdditionalAssigneePerson) => {
    setSelectedIds((current) =>
      current.includes(person.id) ? current.filter((id) => id !== person.id) : [...current, person.id],
    );
  };

  const addSuggestedPerson = (person: AdditionalAssigneePerson) => {
    onAddPeople([person]);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: { xs: 'calc(100vw - 20px)', sm: 470 },
          maxWidth: '100vw',
          maxHeight: { xs: 'calc(100dvh - 20px)', sm: 'calc(100dvh - 48px)' },
          bgcolor: activeTheme.backgroundDefault,
          borderRadius: 3,
          border: '1px solid #DDE7F4',
          boxShadow: '0 24px 60px rgba(15, 23, 42, 0.24)',
          overflow: 'hidden',
          m: 0,
        },
      }}
    >
      <Box sx={{ height: { xs: 'calc(100dvh - 20px)', sm: 'min(860px, calc(100dvh - 48px))' }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Box sx={{ px: 2.1, py: 1.65, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, bgcolor: activeTheme.backgroundPaper, borderBottom: '1px solid #E5EAF2' }}>
          <Box>
            <Typography sx={{ color: activeTheme.textPrimary, fontSize: 20, fontWeight: 900, lineHeight: 1.15 }}>
              Assignment
            </Typography>
            <Typography sx={{ color: activeTheme.textSecondary, fontSize: 13, fontWeight: 800, mt: 0.35 }}>
              Additional Assignees for {dayLabel}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Close assignment selector"
            sx={{ width: 42, height: 42, borderRadius: '50%', color: activeTheme.primary, border: '1px solid #E5EAF2', bgcolor: activeTheme.backgroundPaper }}
          >
            <CloseIcon sx={{ fontSize: 23 }} />
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflowY: 'auto', px: 1.5, py: 1.4 }}>
          <Box sx={{ mb: 1.2 }}>
            <Typography sx={{ color: activeTheme.primary, fontSize: 13, fontWeight: 900, mb: 0.7 }}>
              BLU.AI Suggestions
            </Typography>
            {suggestedPeople.map((person) => {
              const tone = additionalAssigneeWorkloadTone[person.workloadLevel];

              return (
                <Paper key={person.id} elevation={0} sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${tokenBrand.selectedBg}`, bgcolor: tokenBrand.softBg }}>
                  <Box sx={{ display: 'flex', gap: 0.9, alignItems: 'flex-start' }}>
                    <Avatar sx={{ width: 40, height: 40, bgcolor: tokenBrand.main, color: '#FFFFFF', fontSize: 15, fontWeight: 900 }}>
                      {person.initials}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, flexWrap: 'wrap' }}>
                        <Typography sx={{ color: tokenText.primary, fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
                          {person.name}
                        </Typography>
                        <Chip label="BLU.AI" size="small" sx={{ height: 18, borderRadius: '999px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, border: `1px solid ${tokenBrand.selectedBg}`, fontSize: 9, fontWeight: 600, '& .MuiChip-label': { px: 0.6 } }} />
                      </Box>
                      <Typography sx={{ color: tokenText.secondary, fontSize: 13, fontWeight: 400, lineHeight: 1.25, mt: 0.15 }}>
                        {person.role} - {person.context}
                      </Typography>
                      <Typography sx={{ color: tokenText.secondary, fontSize: 13, fontWeight: 500, lineHeight: 1.25, mt: 0.25 }}>
                        {person.workload} - {person.shift}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mt: 0.8, flexWrap: 'wrap' }}>
                        <Typography sx={{ color: tokenText.primary, fontSize: 13, fontWeight: 700 }}>
                          {dayLabel}
                        </Typography>
                        <Chip label={person.workloadLevel} size="small" sx={{ height: 21, borderRadius: '999px', bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontSize: 10, fontWeight: 600, '& .MuiChip-label': { px: 0.7 } }} />
                      </Box>
                      <Typography sx={{ color: tokenText.secondary, fontSize: 13, fontWeight: 400, lineHeight: 1.3, mt: 0.55 }}>
                        {person.workloadSummary}. {person.recommendationReason}
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    fullWidth
                    onClick={() => addSuggestedPerson(person)}
                    sx={{
                      mt: 0.9,
                      borderRadius: '8px',
                      color: tokenBrand.main,
                      fontSize: 13,
                      fontWeight: 500,
                      textTransform: 'none',
                      '&:hover': { bgcolor: tokenBrand.softBg }
                    }}
                  >
                    Add to Assignment
                  </Button>
                </Paper>
              );
            })}
          </Box>

          <Paper elevation={0} sx={{ p: 1.5, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
            <Typography sx={{ color: tokenText.primary, fontSize: 13, fontWeight: 700, mb: 0.25 }}>
              People for {dayLabel}
            </Typography>
            <Typography sx={{ color: tokenText.secondary, fontSize: 12, fontWeight: 400, mb: 0.9 }}>
              Additional assignees use the same scheduled day.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {additionalAssigneePeople.map((person) => {
                const selected = selectedIds.includes(person.id);
                const tone = additionalAssigneeWorkloadTone[person.workloadLevel];

                return (
                  <Box
                    key={person.id}
                    onClick={() => togglePerson(person)}
                    sx={{
                      p: 0.9,
                      borderRadius: '12px',
                      border: `1px solid ${selected ? tokenBrand.main : tokenDivider}`,
                      bgcolor: selected ? tokenBrand.softBg : activeTheme.backgroundDefault,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.9,
                      cursor: 'pointer',
                    }}
                  >
                    <Checkbox checked={selected} size="small" sx={{ p: 0.2, color: tokenText.secondary, '&.Mui-checked': { color: tokenBrand.main } }} />
                    <Avatar sx={{ width: 34, height: 34, bgcolor: tokenBrand.main, color: '#FFFFFF', fontSize: 13, fontWeight: 900, flexShrink: 0 }}>
                      {person.initials}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography sx={{ color: tokenText.primary, fontSize: 13, fontWeight: 700, lineHeight: 1.15 }}>
                        {person.name}
                      </Typography>
                      <Typography sx={{ color: tokenText.secondary, fontSize: 12, fontWeight: 400, lineHeight: 1.25, mt: 0.15 }}>
                        {person.role} - {person.context}
                      </Typography>
                      <Typography sx={{ color: tokenText.secondary, fontSize: 12, fontWeight: 500, lineHeight: 1.25, mt: 0.25 }}>
                        {person.workload} - {person.shift}
                      </Typography>
                    </Box>
                    <Box sx={{ ml: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.35 }}>
                      <Chip label={person.workloadLevel} size="small" sx={{ height: 21, borderRadius: '999px', bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontSize: 10, fontWeight: 600, '& .MuiChip-label': { px: 0.7 } }} />
                      <Typography sx={{ color: tokenText.secondary, fontSize: 11, fontWeight: 400, textAlign: 'right' }}>
                        {person.workloadSummary}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        </Box>

        <Box sx={{ px: 1.5, py: 1.4, borderTop: `1px solid ${tokenDivider}`, display: 'flex', justifyContent: 'flex-end', gap: 1, bgcolor: 'background.paper' }}>
          <Button
            variant="text"
            onClick={onClose}
            sx={{
              color: tokenBrand.main,
              fontSize: 14,
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: '8px',
              '&:hover': { bgcolor: tokenBrand.softBg }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!selectedPeople.length}
            onClick={() => onAddPeople(selectedPeople)}
            sx={{
              minWidth: 136,
              height: 40,
              borderRadius: '8px',
              bgcolor: tokenBrand.main,
              color: '#FFFFFF',
              fontSize: 14,
              fontWeight: 500,
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'text.disabled' },
            }}
          >
            Assign
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

function StaffWorkloadDialog({
  workload,
  cards,
  onClose,
}: {
  workload: StaffWorkloadDialogState | null;
  cards: ReadonlyArray<CalendarCard>;
  onClose: () => void;
}) {
  const assignedCards = workload ? getStaffAssignedCards(cards, workload.entry.name, workload.day) : [];
  const staffRole = workload?.entry.role ?? 'Technician';
  const assignedWorkOrderCount = assignedCards.length;
  const dailyWorkOrderCapacity = staffRole === 'Operator' ? 4 : 6;
  const capacityRemaining = Math.max(0, dailyWorkOrderCapacity - assignedWorkOrderCount);
  const utilization = dailyWorkOrderCapacity > 0 ? Math.min(100, (assignedWorkOrderCount / dailyWorkOrderCapacity) * 100) : 0;
  const capacityStatus =
    assignedWorkOrderCount === 0 ? 'Open'
      : assignedWorkOrderCount >= dailyWorkOrderCapacity ? 'At capacity'
        : assignedWorkOrderCount >= dailyWorkOrderCapacity - 1 ? 'Tight'
          : 'Available';
  const workloadDate = workload
    ? new Date(2026, 4, calendarWeekDays[workload.day]?.date ?? 1).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : '';
  const skillLevelLabels: Record<number, string> = {
    3: 'Independent / Advanced',
    4: 'Expert / Trainer',
  };
  const skillMatrix = workload ? getPlannerStaffSkillMatrix(workload.entry.name) : plannerFallbackSkillMatrix;
  const certifications = [
    { name: 'LOTO', status: 'Current' },
    { name: 'GMP Training', status: 'Current' },
    { name: 'Electrical Safety', status: 'Due soon' },
    { name: 'Confined Space', status: 'Current' },
  ];
  const bestFitTags = ['PM Execution', 'Mechanical Troubleshooting', 'Pneumatics'];

  return (
    <Dialog
      open={Boolean(workload)}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px', // borderRadius/Large
          border: `1px solid ${tokenDivider}`,
          boxShadow: '0 24px 48px rgba(15,23,42,0.22)',
          maxHeight: 'calc(100vh - 32px)',
          overflowY: 'auto',
          background: 'background.paper',
        },
      }}
    >
      {workload ? (
        <Box sx={{ p: { xs: 1.5, md: 1.7 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, mb: 1.5 }}>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" sx={{ color: activeTheme.textPrimary, fontWeight: 900, lineHeight: 1.15 }}>
                {`${workload.entry.name} - Workload for ${workloadDate}`}
              </Typography>
              <Typography variant="caption" sx={{ color: staffRole === 'Operator' ? '#0E7490' : activeTheme.textSecondary, fontWeight: 800 }}>
                {staffRole}
              </Typography>
            </Box>
            <IconButton
              onClick={onClose}
              sx={{
                color: activeTheme.primary,
                mt: -0.2,
                mr: -0.35,
                '&:hover': { bgcolor: '#EFF6FF' },
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 1.15,
              borderRadius: 1.8,
              border: '1px solid #D8E2F2',
              bgcolor: activeTheme.backgroundPaper,
              mb: 1.3,
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1.1fr 1fr 0.9fr' }, gap: 1, mb: 1 }}>
              {[
                { label: 'Assigned Work Orders', value: `${assignedWorkOrderCount} WO` },
                { label: 'Available capacity/status', value: `${capacityStatus} - ${capacityRemaining} WO capacity` },
                { label: 'Shift info', value: 'Day Shift - 8h window' },
              ].map((metric) => (
                <Box key={metric.label} sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, display: 'block', lineHeight: 1.15 }}>
                    {metric.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: activeTheme.textPrimary, fontWeight: 900, mt: 0.25, lineHeight: 1.2 }}>
                    {metric.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.65 }}>
              <Typography variant="body2" sx={{ color: activeTheme.textSecondary, fontWeight: 500 }}>
                Utilization
              </Typography>
              <Typography variant="body2" sx={{ color: activeTheme.textSecondary, fontWeight: 500 }}>
                {`${assignedWorkOrderCount}/${dailyWorkOrderCapacity} WO - ${utilization.toFixed(0)}%`}
              </Typography>
            </Box>
            <Box sx={{ width: '100%', height: 5, borderRadius: 999, bgcolor: '#DCE6F5', overflow: 'hidden' }}>
              <Box sx={{ width: `${utilization}%`, height: '100%', borderRadius: 999, bgcolor: activeTheme.primary }} />
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.2,
              borderRadius: 1.8,
              border: '1px solid #D8E2F2',
              bgcolor: '#EEF2F5',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1.1 }}>
              <WorkOrderIcon sx={{ fontSize: 16, color: activeTheme.textSecondary }} />
              <Typography variant="subtitle2" sx={{ color: activeTheme.textPrimary, fontWeight: 800 }}>
                Assigned Work Orders
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
              {assignedCards.map((card) => (
                <Paper
                  key={card.id}
                  elevation={0}
                  sx={{
                    p: 1.15,
                    borderRadius: 1.5,
                    border: '1px solid #D8E2F2',
                    bgcolor: activeTheme.backgroundPaper,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" sx={{ color: activeTheme.textPrimary, fontWeight: 900 }}>
                        {card.workOrder}
                      </Typography>
                      <Typography variant="body2" sx={{ color: activeTheme.textSecondary, mt: 0.55 }}>
                        {card.title}
                      </Typography>
                    </Box>
                    {card.type !== 'Corrective' ? (
                      <Box
                        sx={{
                          px: 0.75,
                          py: 0.35,
                          borderRadius: 999,
                          bgcolor: 'action.hover',
                          color: activeTheme.textSecondary,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.45,
                          flexShrink: 0,
                        }}
                      >
                        <TimeIcon sx={{ fontSize: 13, color: tokenBrand.main }} />
                        <Typography variant="caption" sx={{ fontWeight: 800, lineHeight: 1 }}>
                          {card.duration}
                        </Typography>
                      </Box>
                    ) : null}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.15, flexWrap: 'wrap', mt: 1.2 }}>
                    <Box sx={{ width: 30, height: 22, borderRadius: 999, bgcolor: card.type === 'Preventive' ? '#F59E0B' : '#FF5A4A', color: activeTheme.textPrimary, display: 'grid', placeItems: 'center', fontSize: '0.68rem', fontWeight: 900 }}>
                      {getCalendarCardTypeBadge(card)}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <PlaceIcon sx={{ fontSize: 13, color: activeTheme.primary }} />
                      <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 500 }}>
                        Sterilization Zone
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <TimeIcon sx={{ fontSize: 13, color: activeTheme.primary }} />
                      <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 500 }}>
                        {formatCalendarTimelineTime(card.startHour, card.startMinute ?? 0)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                      <BuildOutlinedIcon sx={{ fontSize: 13, color: activeTheme.primary }} />
                      <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 500 }}>
                        {getCalendarCardFrequency(card)}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))}

              {assignedCards.length === 0 ? (
                <Box
                  sx={{
                    p: 1.4,
                    borderRadius: 1.5,
                    border: '1px dashed #CBD5E1',
                    bgcolor: activeTheme.backgroundPaper,
                  }}
                >
                  <Typography variant="body2" sx={{ color: activeTheme.textSecondary }}>
                    No assigned work orders for this staff member on the selected day.
                  </Typography>
                </Box>
              ) : null}
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 1.2,
              borderRadius: 1.8,
              border: '1px solid #D8E2F2',
              bgcolor: activeTheme.backgroundPaper,
              mt: 1.1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, mb: 1 }}>
              <HandymanOutlinedIcon sx={{ fontSize: 16, color: activeTheme.textSecondary }} />
              <Typography variant="subtitle2" sx={{ color: activeTheme.textPrimary, fontWeight: 800 }}>
                Skill Matrix
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.45 }}>
                {Object.entries(skillLevelLabels).map(([level, label]) => (
                  <Chip
                    key={level}
                    label={`${level} - ${label}`}
                    size="small"
                    sx={{
                      height: 20,
                      borderRadius: '999px',
                      bgcolor: activeTheme.backgroundDefault,
                      border: `1px solid ${tokenDivider}`,
                      color: activeTheme.textSecondary,
                      '& .MuiChip-label': { px: 0.65, fontSize: '0.58rem', fontWeight: 800 },
                    }}
                  />
                ))}
              </Box>

              {skillMatrix.map((category) => (
                <Box key={category.category}>
                  <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {category.category}
                  </Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 0.65, mt: 0.45 }}>
                    {category.skills.map((skill) => (
                      <Box key={skill.skill} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, p: 0.75, borderRadius: '12px', bgcolor: activeTheme.backgroundDefault, border: `1px solid ${tokenDivider}`, minWidth: 0 }}>
                        <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 700, lineHeight: 1.2 }}>
                          {skill.skill}
                        </Typography>
                        <Tooltip title={skillLevelLabels[skill.level]}>
                          <Box sx={{ width: 24, height: 24, borderRadius: 999, bgcolor: tokenBrand.softBg, color: tokenBrand.main, display: 'grid', placeItems: 'center', flexShrink: 0, fontSize: '0.72rem', fontWeight: 900 }}>
                            {skill.level}
                          </Box>
                        </Tooltip>
                      </Box>
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ mt: 1.1 }}>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Certifications
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6, mt: 0.65 }}>
                {certifications.map((certification) => {
                  const isDueSoon = certification.status === 'Due soon';

                  return (
                    <Chip
                      key={certification.name}
                      label={`${certification.name}: ${certification.status}`}
                      size="small"
                      sx={{
                        height: 22,
                        borderRadius: 99,
                        bgcolor: isDueSoon ? '#FFF7ED' : '#ECFDF5',
                        color: isDueSoon ? '#C2410C' : '#047857',
                        border: `1px solid ${isDueSoon ? '#FED7AA' : '#A7F3D0'}`,
                        fontSize: 10,
                        fontWeight: 900,
                        '& .MuiChip-label': { px: 0.75 },
                      }}
                    />
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Best fit for
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.55, mt: 0.6 }}>
                {bestFitTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      height: 21,
                      borderRadius: '999px',
                      bgcolor: tokenBrand.softBg,
                      color: tokenBrand.main,
                      border: `1px solid ${tokenBrand.selectedBg}`,
                      fontSize: 10,
                      fontWeight: 600,
                      '& .MuiChip-label': { px: 0.7 },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Box>
      ) : null}
    </Dialog>
  );
}

function CalendarBlockedWindow({
  block,
  children,
}: {
  block: CalendarBlock;
  children?: ReactNode;
}) {
  const lineColor = block.tone === '#4B5563' ? 'rgba(148,163,184,0.34)' : 'rgba(148,163,184,0.28)';
  const bgColor = block.tone === '#4B5563' ? 'rgba(75,85,99,0.22)' : 'rgba(148,163,184,0.12)';
  const availabilityLabel = getCalendarBlockAvailabilityLabel(block);

  return (
    <Box
      sx={{
        minHeight: getCalendarBlockVisualHeight(block),
        flex: block.compact ? '0 0 auto' : 1,
        border: `1px solid ${block.tone}`,
        borderRadius: 0.6,
        bgcolor: bgColor,
        backgroundImage: `repeating-linear-gradient(135deg, transparent 0, transparent 15px, ${lineColor} 15px, ${lineColor} 16px, transparent 16px, transparent 29px)`,
        p: 0.65,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.7 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, minWidth: 0 }}>
          <Box sx={{ width: 11, height: 11, borderRadius: '50%', border: `2px solid ${block.tone}`, bgcolor: activeTheme.backgroundPaper, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ color: activeTheme.textPrimary, fontWeight: 800, fontSize: '0.66rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {block.label}
          </Typography>
        </Box>
        {block.duration ? (
          <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 700, fontSize: '0.62rem', flexShrink: 0 }}>
            {block.duration}
          </Typography>
        ) : null}
      </Box>
      <Typography variant="caption" sx={{ display: 'block', mt: 0.55, color: activeTheme.textSecondary, fontWeight: 700, fontSize: '0.62rem', lineHeight: 1.25 }}>
        {availabilityLabel}
      </Typography>
      {block.timeLabel ? (
        <Typography variant="caption" sx={{ display: 'block', mt: 0.35, color: activeTheme.textSecondary, fontSize: '0.6rem', lineHeight: 1.2 }}>
          {block.timeLabel}
        </Typography>
      ) : null}
      {children ? (
        <Box sx={{ mt: 0.75, display: 'flex', flexDirection: 'column', gap: 0.6 }}>
          {children}
        </Box>
      ) : null}
    </Box>
  );
}

function WeeklyCalendarBoard({
  cards,
  setCards,
  setPlanningItems,
  draggedStaffEntry,
  selectedPriorities,
  highlightedCardId,
  onPriorityToggle,
  onAssignTechnicianToCard,
  onOpenReschedule,
  onAssistantSuggestionDrop,
  onAssistantRescheduleReady,
}: {
  cards: CalendarCard[];
  setCards: Dispatch<SetStateAction<CalendarCard[]>>;
  setPlanningItems: Dispatch<SetStateAction<PlanningQueueItem[]>>;
  draggedStaffEntry: DraggedStaffAssignment | null;
  selectedPriorities: MaintenancePriority[];
  highlightedCardId?: string | null;
  onPriorityToggle: (priority: MaintenancePriority) => void;
  onAssignTechnicianToCard: (cardId: string) => void;
  onOpenReschedule: (nextReschedule: PendingRescheduleState) => void;
  onAssistantSuggestionDrop?: (suggestionId: string, shift: CalendarShift, day: number) => void;
  onAssistantRescheduleReady?: (handler: ((cardId: string) => void) | null) => void;
}) {
  const parseCalendarTimeLabelToMinutes = (value: string) => {
    const [hoursText, minutesText = '0'] = value.split(':');
    const hours = Number.parseInt(hoursText ?? '0', 10);
    const minutes = Number.parseInt(minutesText ?? '0', 10);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
      return null;
    }

    return hours * 60 + minutes;
  };

  const doesCardOverlapBlock = (card: CalendarCard, block: CalendarBlock) => {
    if (block.allDay) {
      return true;
    }

    if (!block.timeLabel) {
      return false;
    }

    const [startLabel, endLabel] = block.timeLabel.split(' - ');
    const blockStart = parseCalendarTimeLabelToMinutes(startLabel ?? '');
    const blockEnd = parseCalendarTimeLabelToMinutes(endLabel ?? '');

    if (blockStart === null || blockEnd === null) {
      return false;
    }

    const cardStart = card.startHour * 60 + (card.startMinute ?? 0);
    const cardEnd = cardStart + parseCalendarDurationToHours(card.duration) * 60;

    return cardStart < blockEnd && cardEnd > blockStart;
  };

  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [technicianDropCardId, setTechnicianDropCardId] = useState<string | null>(null);
  const [selectedWorkOrderDraft, setSelectedWorkOrderDraft] = useState<WorkOrderDraft | null>(null);
  const [activeWorkOrderTab, setActiveWorkOrderTab] = useState<WorkOrderTab>('spareParts');
  const cardElementRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!highlightedCardId) {
      return;
    }

    const targetElement = cardElementRefs.current[highlightedCardId];
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }
  }, [highlightedCardId, cards]);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);
  const [timelineSlot, setTimelineSlot] = useState<{ day: number; shift: CalendarShift } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ shift: CalendarShift; day: number } | null>(null);
  const [blockedDropNotice, setBlockedDropNotice] = useState<BlockedDropNoticeState | null>(null);
  const [pendingRevertCardId, setPendingRevertCardId] = useState<string | null>(null);
  const [revertReason, setRevertReason] = useState<RevertPlanningReasonOption | ''>('');
  const [revertNotes, setRevertNotes] = useState('');
  const dayInsightPanelRef = useRef<HTMLDivElement | null>(null);
  const todayIndex = calendarWeekDays.findIndex((day) => day.isToday);

  const visibleCards = selectedPriorities.length
    ? cards.filter((card) => selectedPriorities.includes(card.priority))
    : cards;
  const blockedDropCard = blockedDropNotice ? cards.find((card) => card.id === blockedDropNotice.cardId) ?? null : null;
  const pendingRevertCard = pendingRevertCardId ? cards.find((card) => card.id === pendingRevertCardId) ?? null : null;

  useEffect(() => {
    if (!onAssistantRescheduleReady) {
      return undefined;
    }

    onAssistantRescheduleReady((cardId: string) => {
      const card = cards.find((currentCard) => currentCard.id === cardId);
      if (!card) {
        return;
      }

      onOpenReschedule({
        cardId: card.id,
        fromShift: card.shift,
        fromDay: card.day,
        toShift: card.shift,
        toDay: card.day,
      });
    });

    return () => {
      onAssistantRescheduleReady(null);
    };
  }, [cards, onAssistantRescheduleReady, onOpenReschedule]);

  useEffect(() => {
    if (selectedDayIndex === null) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!dayInsightPanelRef.current?.contains(event.target as Node)) {
        setSelectedDayIndex(null);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [selectedDayIndex]);

  const handleCardDragStart = (event: DragEvent<HTMLDivElement>, cardId: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData(CALENDAR_WORK_ORDER_DRAG_TYPE, cardId);
    event.dataTransfer.setData('text/plain', cardId);
    setDraggedCardId(cardId);
  };

  const handleCardDragEnd = () => {
    setDraggedCardId(null);
    setDropTarget(null);
  };

  const handleTechnicianCardDragOver = (event: DragEvent<HTMLDivElement>, cardId: string) => {
    if (!draggedStaffEntry || !event.dataTransfer.types.includes(CALENDAR_TECHNICIAN_DRAG_TYPE)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'copy';
    setTechnicianDropCardId((currentCardId) => (currentCardId === cardId ? currentCardId : cardId));
  };

  const handleTechnicianCardDragLeave = (event: DragEvent<HTMLDivElement>, cardId: string) => {
    if (!draggedStaffEntry) return;
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setTechnicianDropCardId((currentCardId) => (currentCardId === cardId ? null : currentCardId));
  };

  const handleTechnicianCardDrop = (event: DragEvent<HTMLDivElement>, cardId: string) => {
    if (!draggedStaffEntry || !event.dataTransfer.types.includes(CALENDAR_TECHNICIAN_DRAG_TYPE)) return;
    event.preventDefault();
    event.stopPropagation();
    setTechnicianDropCardId(null);
    onAssignTechnicianToCard(cardId);
  };

  const handleDayDragOver = (event: DragEvent<HTMLDivElement>, shift: CalendarShift, day: number) => {
    const isWorkOrderDrag = Boolean(draggedCardId && event.dataTransfer.types.includes(CALENDAR_WORK_ORDER_DRAG_TYPE));
    const isAssistantSuggestionDrag = event.dataTransfer.types.includes(CALENDAR_AI_SUGGESTION_DRAG_TYPE);
    if (!isWorkOrderDrag && !isAssistantSuggestionDrag) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = isAssistantSuggestionDrag ? 'copy' : 'move';
    setDropTarget((currentTarget) => (currentTarget?.shift === shift && currentTarget.day === day ? currentTarget : { shift, day }));
  };

  const handleDayDragLeave = (event: DragEvent<HTMLDivElement>, shift: CalendarShift, day: number) => {
    if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
    setDropTarget((currentTarget) => (currentTarget?.shift === shift && currentTarget.day === day ? null : currentTarget));
  };

  const handleDayDrop = (event: DragEvent<HTMLDivElement>, targetShift: CalendarShift, targetDay: number) => {
    if (event.dataTransfer.types.includes(CALENDAR_AI_SUGGESTION_DRAG_TYPE)) {
      event.preventDefault();
      const suggestionId = event.dataTransfer.getData(CALENDAR_AI_SUGGESTION_DRAG_TYPE);
      if (suggestionId && onAssistantSuggestionDrop) {
        onAssistantSuggestionDrop(suggestionId, targetShift, targetDay);
      }
      setDraggedCardId(null);
      setDropTarget(null);
      return;
    }

    if (!event.dataTransfer.types.includes(CALENDAR_WORK_ORDER_DRAG_TYPE)) {
      return;
    }

    event.preventDefault();
    const droppedCardId = event.dataTransfer.getData(CALENDAR_WORK_ORDER_DRAG_TYPE) || event.dataTransfer.getData('text/plain') || draggedCardId;
    if (!droppedCardId) return;

    const droppedCard = cards.find((card) => card.id === droppedCardId);
    if (!droppedCard) return;
    if (droppedCard.shift === targetShift && droppedCard.day === targetDay) {
      setDraggedCardId(null);
      setDropTarget(null);
      return;
    }

    const nextReschedule = {
      cardId: droppedCardId,
      fromShift: droppedCard.shift,
      fromDay: droppedCard.day,
      toShift: targetShift,
      toDay: targetDay,
    };
    const blockingChangeover = calendarBlocks.find(
      (block) =>
        block.shift === targetShift &&
        block.day === targetDay &&
        block.label === 'Changeover' &&
        doesCardOverlapBlock({ ...droppedCard, shift: targetShift, day: targetDay }, block),
    );

    if (blockingChangeover) {
      setBlockedDropNotice({
        ...nextReschedule,
        blockLabel: blockingChangeover.label,
      });
      setDraggedCardId(null);
      setDropTarget(null);
      return;
    }

    onOpenReschedule(nextReschedule);
    setDraggedCardId(null);
    setDropTarget(null);
  };

  const handleCloseBlockedDropNotice = () => {
    setBlockedDropNotice(null);
  };

  const handleOpenCardDetails = (cardId: string) => {
    const card = cards.find((currentCard) => currentCard.id === cardId);
    if (!card) {
      return;
    }

    setSelectedWorkOrderDraft(buildCalendarWorkOrderDraft(card));
    setActiveWorkOrderTab('spareParts');
  };

  const handleToggleDayDetails = (dayIndex: number) => {
    setSelectedDayIndex((currentDayIndex) => (currentDayIndex === dayIndex ? null : dayIndex));
  };

  const handleCloseCardDetails = () => {
    setSelectedWorkOrderDraft(null);
  };

  const handleOpenTimelineDay = (dayIndex: number, shift: CalendarShift) => {
    setTimelineSlot({ day: dayIndex, shift });
  };

  const handleCloseTimelineDay = () => {
    setTimelineSlot(null);
  };

  const handleCloseRevertPlanningModal = () => {
    setPendingRevertCardId(null);
    setRevertReason('');
    setRevertNotes('');
  };

  const handleRevertCardToPlanning = (card: CalendarCard) => {
    if (getCalendarCardStatus(card) !== 'Scheduled') {
      return;
    }

    setPendingRevertCardId(card.id);
    setSelectedWorkOrderDraft(null);
  };

  const handleConfirmRevertCardToPlanning = () => {
    if (!pendingRevertCard || !revertReason || (revertReason === 'Other' && !revertNotes.trim())) {
      return;
    }

    if (pendingRevertCard.type === 'Corrective') {
      setCards((currentCards) => currentCards.filter((currentCard) => currentCard.id !== pendingRevertCard.id));
      setPlanningItems((currentItems) =>
        currentItems.some((item) => item.wo === pendingRevertCard.workOrder)
          ? currentItems
          : [mapCalendarCardToPlanningQueueItem(pendingRevertCard), ...currentItems],
      );
    } else {
      setCards((currentCards) =>
        currentCards.map((currentCard) =>
          currentCard.id === pendingRevertCard.id
            ? {
              ...currentCard,
              statusOverride: 'Planning',
            }
            : currentCard,
        ),
      );
    }

    handleCloseRevertPlanningModal();
  };

  return (
    <>
      <Paper elevation={0} sx={{ bgcolor: 'background.paper', border: `1px solid ${tokenDivider}`, borderRadius: '12px', overflow: 'hidden' }}>
        <Box
          sx={{
            minHeight: 48,
            px: 1.1,
            py: 0.7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${tokenDivider}`,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <IconButton size="small" sx={{ width: 24, height: 24, color: tokenBrand.main }}>
              <ChevronLeftIcon sx={{ fontSize: 17 }} />
            </IconButton>
            <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 700 }}>
              May 24 - May 30
            </Typography>
            <IconButton size="small" sx={{ width: 24, height: 24, color: tokenBrand.main }}>
              <ChevronRightIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Box>
        </Box>
        <Paper elevation={0} sx={{ borderRadius: 0, border: `1px solid ${tokenDivider}`, borderLeft: 0, borderRight: 0, overflow: 'visible' }}>
          <Box sx={{ overflowX: 'auto' }}>
            <Box sx={{ minWidth: 1420 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: '78px repeat(7, 1fr)', minHeight: 58, borderBottom: `1px solid ${tokenDivider}` }}>
                <Box sx={{ bgcolor: activeTheme.backgroundDefault, borderRight: `1px solid ${tokenDivider}` }} />
                {calendarWeekDays.map((day, dayIndex) => (
                  <Box
                    key={day.label}
                    sx={{
                      px: 1.1,
                      py: 0.55,
                      bgcolor: day.isToday ? 'var(--token-brand-soft-bg)' : activeTheme.backgroundDefault,
                      borderRight: `1px solid ${tokenDivider}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 0.9,
                      boxShadow: day.isToday ? 'inset 0 -2px 0 #2563EB' : 'none',
                      position: 'relative',
                      zIndex: selectedDayIndex === dayIndex ? 4 : 1,
                      overflow: 'visible',
                    }}
                  >
                    <Box
                      onClick={() => handleToggleDayDetails(dayIndex)}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 0.9,
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ display: 'block', color: day.isToday ? activeTheme.primary : activeTheme.textSecondary, fontWeight: 500, fontSize: '0.72rem', lineHeight: 1 }}>
                          {day.label}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: day.isToday ? activeTheme.primary : activeTheme.textPrimary, fontWeight: 900, lineHeight: 1.1, fontSize: '1.5rem' }}>
                          {day.date}
                        </Typography>
                      </Box>
                      {selectedDayIndex === dayIndex ? null : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.85 }}>
                          <CalendarHeaderMetric
                            label={todayIndex >= 0 && dayIndex > todayIndex ? 'PLAN.' : 'PROD.'}
                            value={day.production}
                          />
                          <CalendarHeaderMetric label="AVAIL." value={day.availability} />
                        </Box>
                      )}
                    </Box>
                    {selectedDayIndex === dayIndex ? (
                      <Box
                        ref={selectedDayIndex === dayIndex ? dayInsightPanelRef : null}
                        sx={{
                          position: 'absolute',
                          top: 'calc(100% + 10px)',
                          left: dayIndex <= 1 ? 8 : '50%',
                          right: dayIndex >= 5 ? 8 : 'auto',
                          transform: dayIndex <= 1 || dayIndex >= 5 ? 'none' : 'translateX(-50%)',
                          zIndex: 12,
                        }}
                      >
                        <CalendarDayInsightPanel
                          dayIndex={dayIndex}
                          cards={cards}
                          onClose={() => setSelectedDayIndex(null)}
                        />
                      </Box>
                    ) : null}
                  </Box>
                ))}
              </Box>
              {[
                { key: 'day' as CalendarShift, title: 'Day shift', time: '06:00 - 18:00' },
                { key: 'night' as CalendarShift, title: 'Night shift', time: '18:00 - 06:00' },
              ].map((shift) => (
                <Box key={shift.key} sx={{ display: 'grid', gridTemplateColumns: '78px repeat(7, 1fr)', minHeight: 300, borderBottom: `1px solid ${tokenDivider}` }}>
                  <Box sx={{ bgcolor: activeTheme.backgroundDefault, borderRight: `1px solid ${tokenDivider}`, px: 0.9, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="body2" sx={{ color: activeTheme.textPrimary, fontWeight: 500 }}>
                      {shift.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontSize: '0.65rem' }}>
                      {shift.time}
                    </Typography>
                  </Box>
                  {calendarWeekDays.map((day, dayIndex) => {
                    const blocks = calendarBlocks.filter((block) => block.shift === shift.key && block.day === dayIndex);
                    const cellCards = visibleCards.filter((card) => card.shift === shift.key && card.day === dayIndex);
                    const cardsInsideBlocks = cellCards.filter((card) =>
                      blocks.some((block) => doesCardOverlapBlock(card, block)),
                    );
                    const standaloneCards = cellCards.filter((card) =>
                      !blocks.some((block) => doesCardOverlapBlock(card, block)),
                    );
                    const isDropTarget = dropTarget?.shift === shift.key && dropTarget.day === dayIndex;

                    return (
                      <Box
                        key={`${shift.key}-${day.label}`}
                        onDragOver={(event: DragEvent<HTMLDivElement>) => handleDayDragOver(event, shift.key, dayIndex)}
                        onDragLeave={(event: DragEvent<HTMLDivElement>) => handleDayDragLeave(event, shift.key, dayIndex)}
                        onDrop={(event: DragEvent<HTMLDivElement>) => handleDayDrop(event, shift.key, dayIndex)}
                        onClick={() => handleOpenTimelineDay(dayIndex, shift.key)}
                        sx={{
                          minHeight: 300,
                          minWidth: 0,
                          borderRight: `1px solid ${tokenDivider}`,
                          bgcolor: isDropTarget ? tokenBrand.softBg : day.isToday ? activeTheme.backgroundDefault : activeTheme.backgroundPaper,
                          p: 0.75,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.75,
                          boxShadow: isDropTarget ? `inset 0 0 0 2px ${tokenBrand.main}` : 'none',
                          transition: 'background-color 120ms ease, box-shadow 120ms ease',
                          cursor: 'pointer',
                        }}
                      >
                        {blocks.map((block) => {
                          const blockCards = cardsInsideBlocks.filter((card) => doesCardOverlapBlock(card, block));

                          return (
                            <CalendarBlockedWindow key={`${block.label}-${shift.key}-${dayIndex}`} block={block}>
                              {blockCards.map((card) => (
                                <CalendarWorkCard
                                  key={card.id}
                                  card={card}
                                  isDragging={draggedCardId === card.id}
                                  isTechnicianDropTarget={technicianDropCardId === card.id}
                                  isHighlighted={highlightedCardId === card.id}
                                  canReceiveTechnician={Boolean(draggedStaffEntry)}
                                  registerCardRef={(element) => {
                                    cardElementRefs.current[card.id] = element;
                                  }}
                                  onDragStart={(event) => handleCardDragStart(event, card.id)}
                                  onDragEnd={handleCardDragEnd}
                                  onTechnicianDragOver={(event) => handleTechnicianCardDragOver(event, card.id)}
                                  onTechnicianDragLeave={(event) => handleTechnicianCardDragLeave(event, card.id)}
                                  onTechnicianDrop={(event) => handleTechnicianCardDrop(event, card.id)}
                                  onClick={() => handleOpenCardDetails(card.id)}
                                />
                              ))}
                            </CalendarBlockedWindow>
                          );
                        })}
                        {standaloneCards.map((card) => (
                          <CalendarWorkCard
                            key={card.id}
                            card={card}
                            isDragging={draggedCardId === card.id}
                            isTechnicianDropTarget={technicianDropCardId === card.id}
                            isHighlighted={highlightedCardId === card.id}
                            canReceiveTechnician={Boolean(draggedStaffEntry)}
                            registerCardRef={(element) => {
                              cardElementRefs.current[card.id] = element;
                            }}
                            onDragStart={(event) => handleCardDragStart(event, card.id)}
                            onDragEnd={handleCardDragEnd}
                            onTechnicianDragOver={(event) => handleTechnicianCardDragOver(event, card.id)}
                            onTechnicianDragLeave={(event) => handleTechnicianCardDragLeave(event, card.id)}
                            onTechnicianDrop={(event) => handleTechnicianCardDrop(event, card.id)}
                            onClick={() => handleOpenCardDetails(card.id)}
                          />
                        ))}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5, borderTop: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
          <CalendarPriorityLegend selectedPriorities={selectedPriorities} onPriorityToggle={onPriorityToggle} />
        </Box>
      </Paper>

      <CreateWorkOrderDrawer
        open={Boolean(selectedWorkOrderDraft)}
        activeTab={activeWorkOrderTab}
        initialDraft={selectedWorkOrderDraft}
        initialExpandedSections={{ spareParts: true, safety: true, quality: true, assignment: true }}
        onTabChange={setActiveWorkOrderTab}
        onClose={handleCloseCardDetails}
        onSubmit={handleCloseCardDetails}
        footerExtraActions={(draft) => {
          const card = draft.sourceCardId ? cards.find((currentCard) => currentCard.id === draft.sourceCardId) : null;

          if (!card || getCalendarCardStatus(card) !== 'Scheduled') {
            return null;
          }

          return (
            <Button
              variant="outlined"
              startIcon={<ChevronLeftIcon sx={{ fontSize: 17 }} />}
              onClick={() => handleRevertCardToPlanning(card)}
              sx={{
                minWidth: 154,
                height: 38,
                borderRadius: '8px',
                borderColor: tokenBrand.main,
                color: tokenBrand.main,
                fontSize: 13,
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': { borderColor: tokenBrand.dark, bgcolor: tokenBrand.softBg },
              }}
            >
              Return to Planning
            </Button>
          );
        }}
      />

      <CalendarDayTimelineDialog
        timelineSlot={timelineSlot}
        cards={cards}
        onClose={handleCloseTimelineDay}
      />

      <CalendarRevertPlanningDialog
        card={pendingRevertCard}
        reason={revertReason}
        notes={revertNotes}
        onClose={handleCloseRevertPlanningModal}
        onReasonChange={setRevertReason}
        onNotesChange={setRevertNotes}
        onConfirm={handleConfirmRevertCardToPlanning}
      />

      <Dialog
        open={Boolean(blockedDropNotice && blockedDropCard)}
        onClose={handleCloseBlockedDropNotice}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px', // borderRadius/Large
            border: `1px solid ${tokenDivider}`,
            boxShadow: '0 24px 48px rgba(15,23,42,0.18)',
            overflow: 'hidden',
            background: 'background.paper',
          },
        }}
      >
        {blockedDropNotice && blockedDropCard ? (
          <Box sx={{ p: { xs: 2, md: 2.4 } }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.1, mb: 1.6 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.6,
                  bgcolor: '#FFF7ED',
                  color: '#B45309',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <WarningAmberIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ color: activeTheme.textPrimary, fontWeight: 800, lineHeight: 1.1 }}>
                  Unavailable time for Maintenance.
                </Typography>
                <Typography variant="body2" sx={{ color: activeTheme.textSecondary, mt: 0.55 }}>
                  {`${formatCalendarWorkOrderLabel(blockedDropCard.workOrder)} cannot be dropped on ${blockedDropNotice.blockLabel}.`}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                onClick={handleCloseBlockedDropNotice}
                sx={{
                  minWidth: 112,
                  borderRadius: '8px',
                  borderColor: tokenBrand.main,
                  color: tokenBrand.main,
                  fontWeight: 500,
                  textTransform: 'none',
                  '&:hover': {
                    borderColor: tokenBrand.dark,
                    bgcolor: tokenBrand.softBg,
                  },
                }}
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<CalendarMonthIcon sx={{ fontSize: 18 }} />}
                onClick={() =>
                  onOpenReschedule({
                    cardId: blockedDropNotice.cardId,
                    fromShift: blockedDropNotice.fromShift,
                    fromDay: blockedDropNotice.fromDay,
                    toShift: blockedDropNotice.toShift,
                    toDay: blockedDropNotice.toDay,
                  })
                }
                sx={{
                  minWidth: 132,
                  borderRadius: '8px',
                  bgcolor: tokenBrand.main,
                  color: '#FFFFFF',
                  fontWeight: 500,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: tokenBrand.dark,
                    boxShadow: 'none',
                  },
                }}
              >
                Reschedule
              </Button>
            </Box>
          </Box>
        ) : null}
      </Dialog>
    </>
  );
}

function CalendarRescheduleDialog({
  pendingReschedule,
  pendingCard,
  rescheduleReason,
  rescheduleNotes,
  complianceMemoFields,
  isSubmitDisabled,
  onClose,
  onPendingRescheduleChange,
  onReasonChange,
  onNotesChange,
  onComplianceMemoFieldsChange,
  onConfirm,
}: {
  pendingReschedule: PendingRescheduleState | null;
  pendingCard: CalendarCard | null;
  rescheduleReason: RescheduleReasonOption | '';
  rescheduleNotes: string;
  complianceMemoFields: ComplianceMemoFields;
  isSubmitDisabled: boolean;
  onClose: () => void;
  onPendingRescheduleChange: Dispatch<SetStateAction<PendingRescheduleState | null>>;
  onReasonChange: (value: RescheduleReasonOption | '') => void;
  onNotesChange: (value: string) => void;
  onComplianceMemoFieldsChange: Dispatch<SetStateAction<ComplianceMemoFields>>;
  onConfirm: () => void;
}) {
  const complianceExtensionInfo = getPmComplianceExtensionInfo(pendingCard, pendingReschedule);
  const updateComplianceMemoField = (field: keyof ComplianceMemoFields, value: string) => {
    onComplianceMemoFieldsChange((current) => ({
      ...current,
      [field]: value,
    }));
  };

  return (
    <Dialog open={Boolean(pendingReschedule && pendingCard)} onClose={onClose} maxWidth="sm" fullWidth>
      {pendingReschedule && pendingCard ? (
        <>
          <DialogTitle sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, pb: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ color: activeTheme.textPrimary, fontWeight: 900 }}>
                Reschedule Work Order
              </Typography>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 700 }}>
                {`${formatCalendarWorkOrderLabel(pendingCard.workOrder)} - ${pendingCard.title}`}
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ pt: 1.2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.2, mb: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', color: activeTheme.textSecondary, fontWeight: 800, mb: 0.45, lineHeight: 1 }}>
                  New date
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={`${pendingReschedule.toDay}`}
                    onChange={(event) =>
                      onPendingRescheduleChange((current) =>
                        current ? { ...current, toDay: Number(event.target.value) } : current,
                      )
                    }
                  >
                    {calendarWeekDays.map((day, dayIndex) => (
                      <MenuItem key={`${day.label}-${day.date}`} value={`${dayIndex}`}>
                        {`${day.label}, ${formatCalendarDate(dayIndex)}`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ display: 'block', color: activeTheme.textSecondary, fontWeight: 800, mb: 0.45, lineHeight: 1 }}>
                  New shift
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={pendingReschedule.toShift}
                    onChange={(event) =>
                      onPendingRescheduleChange((current) =>
                        current ? { ...current, toShift: event.target.value as CalendarShift } : current,
                      )
                    }
                  >
                    <MenuItem value="day">Day shift</MenuItem>
                    <MenuItem value="night">Night shift</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: activeTheme.textSecondary, fontWeight: 800, mb: 0.8 }}>
              Reason
            </Typography>
            <RadioGroup
              value={rescheduleReason}
              onChange={(event) => {
                const nextReason = event.target.value as RescheduleReasonOption;
                onReasonChange(nextReason);
                if (nextReason !== 'Other') {
                  onNotesChange('');
                }
              }}
            >
              {rescheduleReasonOptions.map((reason) => (
                <FormControlLabel
                  key={reason}
                  value={reason}
                  control={<Radio size="small" />}
                  label={reason}
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '0.88rem', color: activeTheme.textPrimary } }}
                />
              ))}
            </RadioGroup>

            {rescheduleReason === 'Other' ? (
              <TextField
                fullWidth
                multiline
                minRows={3}
                placeholder="Describe the reason..."
                value={rescheduleNotes}
                onChange={(event) => onNotesChange(event.target.value)}
                sx={{ mt: 1 }}
              />
            ) : null}

            {complianceExtensionInfo ? (
              <Box
                sx={{
                  mt: 1.8,
                  border: '1px solid #FDBA74',
                  bgcolor: '#FFF7ED',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ px: 1.4, py: 1.25, borderBottom: '1px solid rgba(251,146,60,0.42)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.65 }}>
                    <WarningAmberIcon sx={{ fontSize: 18, color: '#EA580C' }} />
                    <Typography variant="body2" sx={{ color: '#9A3412', fontWeight: 900 }}>
                      PM Compliance Extension Memo
                    </Typography>
                  </Box>
                  <Typography variant="caption" sx={{ display: 'block', color: '#9A3412', fontWeight: 700, lineHeight: 1.45 }}>
                    This Preventive Maintenance will move beyond the allowed execution date. Complete the memo details for electronic signature routing.
                  </Typography>
                </Box>

                <Box sx={{ px: 1.4, py: 1.25 }}>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' },
                      gap: 1,
                      mb: 1.25,
                    }}
                  >
                    {[
                      ['Scheduled PM', formatCalendarShortDate(complianceExtensionInfo.scheduledDate)],
                      [complianceExtensionInfo.scheduleKind === 'floating' ? 'Latest allowed' : 'Due date', formatCalendarShortDate(complianceExtensionInfo.allowedDate)],
                      ['New date', formatCalendarDate(pendingReschedule.toDay)],
                    ].map(([label, value]) => (
                      <Box key={label} sx={{ borderRadius: 1.4, border: '1px solid rgba(251,146,60,0.36)', bgcolor: activeTheme.backgroundPaper, px: 1, py: 0.85 }}>
                        <Typography variant="caption" sx={{ display: 'block', color: '#92400E', fontWeight: 900, lineHeight: 1.15 }}>
                          {label}
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', color: activeTheme.textSecondary, fontWeight: 800, lineHeight: 1.25, mt: 0.25 }}>
                          {value}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ borderRadius: 1.4, border: '1px solid rgba(251,146,60,0.36)', bgcolor: activeTheme.backgroundPaper, px: 1.1, py: 0.9, mb: 1.25 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: '#92400E', fontWeight: 900, lineHeight: 1.2 }}>
                      Approval route
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: activeTheme.textSecondary, fontWeight: 800, lineHeight: 1.35, mt: 0.25 }}>
                      Maintenance Lead, Manufacturing Unit Leader, Quality Engineer
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <TextField
                      fullWidth
                      required
                      multiline
                      minRows={2}
                      label="Background and justification"
                      placeholder="Explain why the PM needs to be extended beyond the allowed date."
                      value={complianceMemoFields.complianceJustification}
                      onChange={(event) => updateComplianceMemoField('complianceJustification', event.target.value)}
                    />
                    <TextField
                      fullWidth
                      required
                      multiline
                      minRows={2}
                      label="Containment controls"
                      placeholder="Describe inspections, checks, temporary controls, or monitoring that will remain in place."
                      value={complianceMemoFields.containmentPlan}
                      onChange={(event) => updateComplianceMemoField('containmentPlan', event.target.value)}
                    />
                    <TextField
                      fullWidth
                      required
                      multiline
                      minRows={2}
                      label="Product risk assessment"
                      placeholder="Summarize the assessed product quality risk while the PM is extended."
                      value={complianceMemoFields.productRiskAssessment}
                      onChange={(event) => updateComplianceMemoField('productRiskAssessment', event.target.value)}
                    />
                  </Box>
                </Box>
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.4 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                borderRadius: '8px',
                borderColor: tokenBrand.main,
                color: tokenBrand.main,
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  borderColor: tokenBrand.dark,
                  bgcolor: tokenBrand.softBg,
                },
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={isSubmitDisabled}
              onClick={onConfirm}
              sx={{
                borderRadius: '8px',
                bgcolor: tokenBrand.main,
                color: '#FFFFFF',
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: tokenBrand.dark,
                  boxShadow: 'none',
                },
                '&.Mui-disabled': {
                  bgcolor: 'action.disabledBackground',
                  color: 'text.disabled',
                },
              }}
            >
              Confirm Reschedule
            </Button>
          </DialogActions>
        </>
      ) : null}
    </Dialog>
  );
}

function CalendarDayTimelineDialog({
  timelineSlot,
  cards,
  onClose,
}: {
  timelineSlot: { day: number; shift: CalendarShift } | null;
  cards: ReadonlyArray<CalendarCard>;
  onClose: () => void;
}) {
  const slotCards = timelineSlot ? cards.filter((card) => card.day === timelineSlot.day && card.shift === timelineSlot.shift) : [];
  const slotBlocks = timelineSlot ? calendarBlocks.filter((block) => block.day === timelineSlot.day && block.shift === timelineSlot.shift) : [];

  return (
    <Dialog open={timelineSlot !== null} onClose={onClose} maxWidth="sm" fullWidth>
      {timelineSlot ? (
        <>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Box>
              <Typography variant="h6" sx={{ color: activeTheme.textPrimary, fontWeight: 900 }}>
                {formatCalendarTimelineDayTitle(timelineSlot.day)}
              </Typography>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800 }}>
                {timelineSlot.shift === 'day' ? 'Day shift' : 'Night shift'}
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2.4 }}>
            {slotBlocks.map((block) => {
              const style = getPlannedDowntimeTagStyle(formatCalendarBlockTagLabel(block));

              return (
                <Box key={`${block.shift}-${block.day}-${block.label}-${block.objective}`} sx={{ p: 1, borderRadius: 1.2, border: style.border, bgcolor: style.backgroundColor }}>
                  <Typography variant="caption" sx={{ display: 'block', color: style.color, fontWeight: 900 }}>
                    {formatCalendarBlockTagLabel(block)}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: style.color, opacity: 0.82, fontWeight: 700 }}>
                    {block.allDay ? 'All day' : block.timeLabel}
                  </Typography>
                </Box>
              );
            })}
            {slotCards.map((card) => (
              <Box key={card.id} sx={{ p: 1, borderRadius: 1.2, border: '1px solid #CBD5E1', bgcolor: activeTheme.backgroundPaper }}>
                <Typography variant="caption" sx={{ display: 'block', color: activeTheme.textSecondary, fontWeight: 800 }}>
                  {`${formatCalendarWorkOrderLabel(card.workOrder)} - ${card.type}`}
                </Typography>
                <Typography variant="body2" sx={{ color: activeTheme.textPrimary, fontWeight: 900 }}>
                  {card.title}
                </Typography>
                <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 700 }}>
                  {`${card.duration} - ${card.assignee.name}`}
                </Typography>
              </Box>
            ))}
            {!slotBlocks.length && !slotCards.length ? (
              <Typography variant="body2" sx={{ color: activeTheme.textSecondary, fontWeight: 700 }}>
                No work orders or planned downtimes in this shift.
              </Typography>
            ) : null}
          </DialogContent>
        </>
      ) : null}
    </Dialog>
  );
}


function CalendarOperationsSummary({
  cards,
  draggedStaffEntry,
  onStaffDragStart,
  onStaffDragEnd,
  onStaffClick,
}: {
  cards: ReadonlyArray<CalendarCard>;
  draggedStaffEntry: DraggedStaffAssignment | null;
  onStaffDragStart: (entry: StaffAssignmentEntry, day: number, event: DragEvent<HTMLDivElement>) => void;
  onStaffDragEnd: () => void;
  onStaffClick: (entry: StaffAssignmentEntry, day: number) => void;
}) {
  const assignedStaffByDay = buildAssignedStaffByDay(cards);
  const plannedDowntimesByDay = calendarWeekDays.map((_, dayIndex) => calendarBlocks.filter((block) => block.day === dayIndex));

  return (
    <Paper
      elevation={0}
      sx={{
        mt: 0,
        bgcolor: activeTheme.backgroundPaper,
        border: '1px solid var(--paper-border-color)',
        borderRadius: 1.2,
        overflow: 'hidden',
        boxShadow: 'inset 0 1px 0 var(--paper-border-color)',
      }}
    >
      <Box sx={{ overflowX: 'auto' }}>
        <Box sx={{ minWidth: 1420 }}>
          {[
            {
              key: 'staff',
              title: 'Staff',
              subtitle: 'Assignment',
              icon: <GroupsIcon sx={{ fontSize: 16 }} />,
              tone: activeTheme.primary,
            },
            {
              key: 'downtime',
              title: 'Planned',
              subtitle: 'Downtimes',
              icon: <BlockIcon sx={{ fontSize: 15 }} />,
              tone: '#F97316',
            },
          ].map((row, rowIndex) => (
            <Box
              key={row.key}
              sx={{
                display: 'grid',
                gridTemplateColumns: '78px repeat(7, 1fr)',
                minHeight: row.key === 'staff' ? 82 : 62,
                borderTop: rowIndex === 0 ? 'none' : '1px solid var(--paper-border-color)',
              }}
            >
              <Box
                sx={{
                  px: 0.55,
                  py: 0.75,
                  bgcolor: activeTheme.backgroundDefault,
                  borderRight: '1px solid var(--paper-border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.45,
                }}
              >
                <Box sx={{ color: row.tone, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  {row.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" sx={{ display: 'block', color: activeTheme.textPrimary, fontWeight: 800, fontSize: '0.66rem', lineHeight: 1.05 }}>
                    {row.title}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: activeTheme.textSecondary, fontWeight: 700, fontSize: '0.61rem', lineHeight: 1.05, mt: 0.2 }}>
                    {row.subtitle}
                  </Typography>
                </Box>
              </Box>

              {calendarWeekDays.map((day, dayIndex) => {
                const staffEntries = assignedStaffByDay[dayIndex] ?? [];
                const downtimeBlocks = plannedDowntimesByDay[dayIndex] ?? [];

                return (
                  <Box
                    key={`${row.key}-${day.label}`}
                    sx={{
                      minHeight: 52,
                      minWidth: 0,
                      px: 0.55,
                      py: 0.55,
                      borderRight: '1px solid var(--paper-border-color)',
                      bgcolor: day.isToday ? activeTheme.backgroundDefault : row.key === 'downtime' ? activeTheme.backgroundDefault : activeTheme.backgroundPaper,
                      display: 'flex',
                      alignItems: 'flex-start',
                    }}
                  >
                    {row.key === 'staff' ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45, width: '100%', minWidth: 0 }}>
                        {staffEntries.map((entry) => {
                          const isDraggingStaff = draggedStaffEntry?.name === entry.name && draggedStaffEntry.day === dayIndex;

                          return (
                            <Box
                              key={entry.name}
                              draggable
                              onDragStart={(event: DragEvent<HTMLDivElement>) => onStaffDragStart(entry, dayIndex, event)}
                              onDragEnd={onStaffDragEnd}
                              onClick={() => onStaffClick(entry, dayIndex)}
                              sx={{
                                minHeight: 20,
                                px: 0.6,
                                width: '100%',
                                minWidth: 0,
                                boxSizing: 'border-box',
                                borderRadius: 0.75,
                                border: isDraggingStaff ? '1px solid #38BDF8' : '1px solid #CBD5E1',
                                bgcolor: isDraggingStaff ? '#E0F2FE' : activeTheme.backgroundDefault,
                                color: activeTheme.textPrimary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 0.7,
                                boxShadow: '0 1px 1px rgba(15,23,42,0.05)',
                                cursor: 'grab',
                                transition: 'border-color 120ms ease, background-color 120ms ease, box-shadow 120ms ease',
                                '&:active': {
                                  cursor: 'grabbing',
                                },
                                '&:hover': {
                                  boxShadow: '0 6px 14px rgba(15,23,42,0.08)',
                                },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0, flex: 1 }}>
                                <Typography variant="caption" sx={{ color: 'inherit', fontWeight: 800, fontSize: '0.65rem', lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {entry.name}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  pl: 0.55,
                                  ml: 0.05,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.45,
                                  flexShrink: 0,
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: activeTheme.primary,
                                    fontWeight: 800,
                                    fontSize: '0.62rem',
                                    lineHeight: 1,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {`${entry.workOrderCount} WO Assigned`}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: activeTheme.textSecondary,
                                    fontWeight: 700,
                                    fontSize: '0.6rem',
                                    lineHeight: 1,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  Day Shift
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : downtimeBlocks.length ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.45, width: '100%', minWidth: 0 }}>
                        {downtimeBlocks.map((block) => {
                          const downtimeTagStyle = getPlannedDowntimeTagStyle(formatCalendarBlockTagLabel(block));

                          return (
                            <Box
                              key={`${block.shift}-${block.label}-${block.objective}`}
                              sx={{
                                minHeight: 34,
                                px: 0.55,
                                py: 0.4,
                                borderRadius: 0.75,
                                border: downtimeTagStyle.border,
                                bgcolor: downtimeTagStyle.backgroundColor,
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                width: '100%',
                                minWidth: 0,
                                boxSizing: 'border-box',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: downtimeTagStyle.color,
                                  fontWeight: 900,
                                  fontSize: '0.58rem',
                                  lineHeight: 1.05,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {`${block.label} - ${block.objective}`}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: downtimeTagStyle.color,
                                  opacity: 0.82,
                                  fontWeight: 700,
                                  fontSize: '0.55rem',
                                  lineHeight: 1.05,
                                  mt: 0.2,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {block.allDay ? 'All day' : block.timeLabel}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : null}
                  </Box>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

function GanttMarker({
  kind,
  scale = 1,
  hoverContext,
}: {
  kind: GanttMarkerKind;
  scale?: number;
  hoverContext?: AnnualCalendarTagContext;
}) {
  const palette: Record<GanttMarkerKind, { border: string; bg: string; fg: string; icon: typeof HandymanOutlinedIcon }> = {
    pm: { border: activeTheme.primaryLight, bg: '#EEF4FF', fg: activeTheme.primary, icon: HandymanOutlinedIcon },
    cm: { border: '#A7E0B8', bg: '#EAF8EF', fg: '#16A34A', icon: BuildOutlinedIcon },
    maintPlan: { border: '#7DA6FF', bg: '#DCE9FF', fg: activeTheme.primary, icon: CalendarMonthIcon },
  };
  const style = palette[kind];
  const Icon = style.icon;
  const size = Math.max(11, 18 * scale);

  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `1px solid ${style.border}`,
        bgcolor: style.bg,
        color: style.fg,
        display: 'grid',
        placeItems: 'center',
        boxShadow: '0 1px 2px rgba(15,23,42,0.08)',
        position: 'relative',
        cursor: hoverContext && (kind === 'pm' || kind === 'cm') ? 'default' : 'inherit',
        '&:hover .annual-schedule-hover-card': {
          opacity: 1,
          transform: 'translateX(-50%) translateY(0)',
        },
      }}
    >
      <Icon sx={{ fontSize: Math.max(8, 11 * scale) }} />
      {hoverContext && kind === 'pm' ? (
        <AnnualScheduleHoverCard kind="quarterly" context={hoverContext} />
      ) : null}
      {hoverContext && kind === 'cm' ? (
        <AnnualScheduleHoverCard
          kind="quarterly"
          context={hoverContext}
          title="Corrective Maintenance"
          accentColor={style.fg}
          icon={<BuildOutlinedIcon sx={{ fontSize: 8.5 }} />}
          showScheduleDetails={false}
        />
      ) : null}
    </Box>
  );
}

function GanttWindow({
  startDay,
  endDay,
  kind,
  dayWidth,
}: {
  startDay: number;
  endDay: number;
  kind: GanttWindowKind;
  dayWidth: number;
}) {
  const left = startDay * dayWidth;
  const width = (endDay - startDay + 1) * dayWidth;
  const windowStyle = kind === 'changeover'
    ? {
      backgroundColor: 'rgba(75,85,99,0.28)',
      backgroundImage: 'repeating-linear-gradient(45deg, rgba(17,24,39,0.18) 0, rgba(17,24,39,0.18) 3px, transparent 3px, transparent 7px)',
    }
    : {
      backgroundColor: 'rgba(209,213,219,0.36)',
      backgroundImage: 'repeating-linear-gradient(45deg, rgba(100,116,139,0.16) 0, rgba(100,116,139,0.16) 3px, transparent 3px, transparent 7px)',
    };

  if (kind === 'today') {
    return (
      <Box
        sx={{
          position: 'absolute',
          left,
          top: 0,
          bottom: 0,
          width: 2,
          bgcolor: '#FF6B6B',
          opacity: 0.8,
          zIndex: 2,
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        position: 'absolute',
        left,
        top: 0,
        bottom: 0,
        width,
        ...windowStyle,
        zIndex: 0,
      }}
    />
  );
}

function GanttWorkOrderBar({
  startDay,
  endDay,
  tone,
  dayWidth,
  scale = 1,
  hoverContext,
  scheduleKind = 'quarterly',
}: {
  startDay: number;
  endDay: number;
  tone: GanttWorkOrderTone;
  dayWidth: number;
  scale?: number;
  hoverContext?: AnnualCalendarTagContext;
  scheduleKind?: AnnualScheduleKind;
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: startDay * dayWidth,
        width: Math.max((endDay - startDay + 1) * dayWidth, Math.max(8, 14 * scale)),
        height: Math.max(2, 3 * scale),
        borderRadius: 99,
        bgcolor: tone === 'green' ? '#2FA84F' : tone === 'purple' ? '#8B5CF6' : '#FACC15',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 3,
        cursor: hoverContext ? 'default' : 'inherit',
        '&:hover .annual-schedule-hover-card': {
          opacity: 1,
          transform: 'translateX(-50%) translateY(0)',
        },
      }}
    >
      {hoverContext ? <AnnualScheduleHoverCard kind={scheduleKind} context={hoverContext} /> : null}
    </Box>
  );
}

function getGanttScheduleKindFromTone(tone: GanttWorkOrderTone): AnnualScheduleKind {
  if (tone === 'purple') {
    return 'monthly';
  }

  if (tone === 'red') {
    return 'weekly';
  }

  return 'quarterly';
}

function GanttLegend() {
  const scheduleItems = [
    { label: 'Annual', color: '#7DA6FF' },
    { label: 'Quarterly', color: '#B3E2C1' },
    { label: 'Monthly', color: '#C7B8FF' },
    { label: 'Biweekly', color: '#FACC15' },
    { label: 'Overdue', color: annualOverdueStyle.bg, border: annualOverdueStyle.border },
  ];
  const eventItems = [
    { label: 'Shutdown', bg: 'var(--paper-border-color)', stripe: 'rgba(100,116,139,0.22)' },
    { label: 'Changeover', bg: '#4B5563', stripe: 'rgba(17,24,39,0.28)' },
  ];
  const legendLabelSx = { color: activeTheme.textSecondary, fontWeight: 700, fontSize: '0.64rem', lineHeight: 1.1 } as const;
  const legendItemSx = { display: 'inline-flex', alignItems: 'center', gap: 0.4, flexShrink: 0 } as const;

  return (
    <Box
      sx={{
        px: 1.4,
        py: 1.1,
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        columnGap: 1.2,
        rowGap: 0.8,
        borderTop: `1px solid ${tokenDivider}`,
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 0.9, rowGap: 0.55, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, letterSpacing: '0.04em', fontSize: '0.66rem' }}>
          WORK ORDERS
        </Typography>
        {[
          { kind: 'pm' as const, label: 'PM' },
          { kind: 'cm' as const, label: 'CM' },
          { kind: 'maintPlan' as const, label: 'Maintenance Plan' },
        ].map((item) => (
          <Box key={item.label} sx={legendItemSx}>
            <GanttMarker kind={item.kind} />
            <Typography variant="caption" sx={legendLabelSx}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ width: 1, height: 18, bgcolor: 'var(--paper-border-color)', maxWidth: '1px', alignSelf: 'stretch' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 0.9, rowGap: 0.55, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, letterSpacing: '0.04em', fontSize: '0.66rem' }}>
          SCHEDULES
        </Typography>
        {scheduleItems.map((item) => (
          <Box key={item.label} sx={legendItemSx}>
            <Box sx={{ width: 18, height: 9, borderRadius: 99, bgcolor: item.color, border: `1px solid ${item.border ?? 'rgba(59,130,246,0.35)'}` }} />
            <Typography variant="caption" sx={legendLabelSx}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ width: 1, height: 18, bgcolor: 'var(--paper-border-color)', maxWidth: '1px', alignSelf: 'stretch' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 0.9, rowGap: 0.55, minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, letterSpacing: '0.04em', fontSize: '0.66rem' }}>
          EVENTS
        </Typography>
        {eventItems.map((item) => (
          <Box key={item.label} sx={legendItemSx}>
            <Box
              sx={{
                width: 16,
                height: 9,
                bgcolor: item.bg,
                backgroundImage: `repeating-linear-gradient(45deg, ${item.stripe} 0, ${item.stripe} 2px, transparent 2px, transparent 5px)`,
                border: '1px solid rgba(100,116,139,0.32)',
              }}
            />
            <Typography variant="caption" sx={legendLabelSx}>
              {item.label}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{ width: 1, height: 18, bgcolor: 'var(--paper-border-color)', maxWidth: '1px', alignSelf: 'stretch' }} />
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', columnGap: 0.9, rowGap: 0.55, minWidth: 0 }}>
        <Box sx={legendItemSx}>
          <Box sx={{ width: 2, height: 12, bgcolor: '#FF6B6B' }} />
          <Typography variant="caption" sx={legendLabelSx}>
            Today
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function GanttBoard() {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    () =>
      ganttGroups.reduce<Record<string, boolean>>((accumulator, group) => {
        accumulator[group.id] = group.defaultExpanded ?? false;
        return accumulator;
      }, {}),
  );
  const [visibleMonthWindowStart, setVisibleMonthWindowStart] = useState(() => new Date(initialGanttMonthWindowDate));
  const [boardScale, setBoardScale] = useState(1);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const visibleMonths = buildVisibleGanttMonths(visibleMonthWindowStart);
  const visibleDays = visibleMonths.reduce((total, month) => total + month.days, 0);

  useEffect(() => {
    const viewport = viewportRef.current;

    if (!viewport) {
      return undefined;
    }

    const updateScale = () => {
      const availableWidth = viewport.clientWidth;

      if (!availableWidth) {
        return;
      }

      const selectedMonthBoardWidth = ganttBaseLabelWidth + visibleDays * ganttBaseDayWidth;
      const nextScale = Math.max(0.52, availableWidth / selectedMonthBoardWidth);
      setBoardScale((current) => (Math.abs(current - nextScale) < 0.01 ? current : nextScale));
    };

    updateScale();

    const resizeObserver = new ResizeObserver(updateScale);
    resizeObserver.observe(viewport);
    window.addEventListener('resize', updateScale);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, [visibleDays]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((current) => ({ ...current, [groupId]: !current[groupId] }));
  };

  const dayWidth = Math.max(7, ganttBaseDayWidth * boardScale);
  const labelWidth = Math.max(118, ganttBaseLabelWidth * boardScale);
  const boardWidth = labelWidth + visibleDays * dayWidth;
  const markerOffset = Math.max(2, dayWidth * 0.18);
  const headerFontSize = `${Math.max(0.74, 0.92 * boardScale)}rem`;
  const dayFontSize = `${Math.max(0.48, 0.62 * boardScale)}rem`;
  const rowFontSize = `${Math.max(0.7, 0.82 * boardScale)}rem`;
  const sectionFontSize = `${Math.max(0.58, 0.72 * boardScale)}rem`;

  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: activeTheme.backgroundPaper,
        border: `1px solid ${tokenDivider}`,
        borderRadius: '12px',
        overflow: 'hidden',
      }}
    >
      <Box ref={viewportRef} sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ width: boardWidth, maxWidth: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: `${labelWidth}px 1fr`, borderBottom: `1px solid ${tokenDivider}`, bgcolor: activeTheme.backgroundDefault }}>
            <Box sx={{ px: 1.6, py: 1.1, borderRight: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 800, letterSpacing: '0.04em', fontSize: sectionFontSize }}>
                EQUIPMENT
              </Typography>
            </Box>
            <Box>
              <Box sx={{ display: 'flex', borderBottom: `1px solid ${tokenDivider}` }}>
                {visibleMonths.map((month, monthIndex) => (
                  <Box
                    key={month.label}
                    sx={{
                      width: month.days * dayWidth,
                      py: 0.35,
                      px: 0.55,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 0.45,
                      color: tokenBrand.main,
                      fontSize: headerFontSize,
                      fontWeight: 800,
                      borderRight: `1px solid ${tokenDivider}`,
                    }}
                  >
                    {monthIndex === 0 ? (
                      <IconButton
                        size="small"
                        onClick={() =>
                          setVisibleMonthWindowStart(
                            (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1),
                          )
                        }
                        aria-label="View previous month"
                        sx={{
                          color: tokenBrand.main,
                          border: `1px solid ${tokenBrand.selectedBg}`,
                          bgcolor: tokenBrand.softBg,
                          '&:hover': { bgcolor: tokenBrand.selectedBg },
                        }}
                      >
                        <ChevronLeftIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    ) : (
                      <Box sx={{ width: 32, flexShrink: 0 }} />
                    )}
                    <Box sx={{ minWidth: 0, flex: 1, textAlign: 'center' }}>
                      {month.label}
                    </Box>
                    {monthIndex === visibleMonths.length - 1 ? (
                      <IconButton
                        size="small"
                        onClick={() =>
                          setVisibleMonthWindowStart(
                            (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1),
                          )
                        }
                        aria-label="View next month"
                        sx={{
                          color: tokenBrand.main,
                          border: `1px solid ${tokenBrand.selectedBg}`,
                          bgcolor: tokenBrand.softBg,
                          '&:hover': { bgcolor: tokenBrand.selectedBg },
                        }}
                      >
                        <ChevronRightIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    ) : (
                      <Box sx={{ width: 32, flexShrink: 0 }} />
                    )}
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex' }}>
                {visibleMonths.map((month) =>
                  Array.from({ length: month.days }, (_, dayIndex) => {
                    const dayLabel = `${dayIndex + 1}`;

                    return (
                      <Box
                        key={`${month.label}-${dayLabel}`}
                        sx={{
                          width: dayWidth,
                          height: 18,
                          borderRight: '1px solid #E9EEF6',
                          color: activeTheme.textSecondary,
                          fontSize: dayFontSize,
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        {dayLabel}
                      </Box>
                    );
                  }),
                )}
              </Box>
            </Box>
          </Box>

          {ganttGroups.map((group) => {
            const isExpanded = expandedGroups[group.id];
            const hasChildren = Boolean(group.children?.length);

            return (
              <Box key={group.id}>
                <Box sx={{ display: 'grid', gridTemplateColumns: `${labelWidth}px 1fr`, minHeight: 32, borderBottom: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
                  <Button
                    onClick={() => hasChildren && toggleGroup(group.id)}
                    sx={{
                      justifyContent: 'flex-start',
                      px: 1.2,
                      py: 0.6,
                      borderRadius: 0,
                      borderRight: `1px solid ${tokenDivider}`,
                      color: activeTheme.textSecondary,
                      textTransform: 'none',
                      fontWeight: 800,
                      gap: 0.55,
                    }}
                  >
                    {hasChildren ? (isExpanded ? <KeyboardArrowDownIcon sx={{ fontSize: 16 }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />) : <KeyboardArrowRightIcon sx={{ fontSize: 16, opacity: 0.5 }} />}
                    <Typography variant="caption" sx={{ fontWeight: 800, color: activeTheme.textSecondary, fontSize: sectionFontSize }}>
                      {group.label}
                    </Typography>
                    <Chip
                      label={`${group.workOrders} WOs`}
                      size="small"
                      sx={{
                        ml: 0.35,
                        height: 18,
                        bgcolor: activeTheme.backgroundDefault,
                        border: `1px solid ${tokenDivider}`,
                        color: activeTheme.textSecondary,
                        '& .MuiChip-label': { px: 0.7, fontSize: '0.62rem', fontWeight: 700 },
                      }}
                    />
                  </Button>
                  <Box sx={{ position: 'relative', minHeight: 32, bgcolor: activeTheme.backgroundDefault }}>
                    {Array.from({ length: visibleDays }).map((_, dayIndex) => (
                      <Box key={`${group.id}-grid-${dayIndex}`} sx={{ position: 'absolute', left: dayIndex * dayWidth, top: 0, bottom: 0, width: dayWidth, borderRight: '1px solid var(--paper-border-color)' }} />
                    ))}
                  </Box>
                </Box>

                {hasChildren && isExpanded
                  ? group.children?.map((item) => (
                    <Box key={`${group.id}-${item.label}`} sx={{ display: 'grid', gridTemplateColumns: `${labelWidth}px 1fr`, minHeight: 36, borderBottom: `1px solid ${tokenDivider}` }}>
                      <Box sx={{ px: 1.6, py: 0.75, borderRight: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', color: activeTheme.textSecondary, fontSize: rowFontSize }}>
                        {item.label}
                      </Box>
                      <Box sx={{ position: 'relative', minHeight: 36, bgcolor: activeTheme.backgroundPaper }}>
                        {Array.from({ length: visibleDays }).map((_, dayIndex) => (
                          <Box key={`${group.id}-${item.label}-day-${dayIndex}`} sx={{ position: 'absolute', left: dayIndex * dayWidth, top: 0, bottom: 0, width: dayWidth, borderRight: '1px solid var(--paper-border-color)' }} />
                        ))}
                        {item.windows?.map((window, index) => (
                          <GanttWindow
                            key={`${group.id}-${item.label}-window-${index}`}
                            startDay={window.startDay}
                            endDay={window.endDay}
                            kind={window.kind}
                            dayWidth={dayWidth}
                          />
                        ))}
                        {item.workOrders?.map((workOrder, index) => (
                          <GanttWorkOrderBar
                            key={`${group.id}-${item.label}-wo-${index}`}
                            startDay={workOrder.startDay}
                            endDay={workOrder.endDay}
                            tone={workOrder.tone}
                            dayWidth={dayWidth}
                            scale={boardScale}
                            scheduleKind={workOrder.scheduleKind ?? getGanttScheduleKindFromTone(workOrder.tone)}
                            hoverContext={getAnnualContextFromGanttDay(
                              visibleMonthWindowStart,
                              workOrder.startDay,
                              item.label,
                              group.label,
                              workOrder.overdueState,
                            )}
                          />
                        ))}
                        {item.markers?.map((marker, index) => (
                          <Box
                            key={`${group.id}-${item.label}-marker-${index}`}
                            sx={{
                              position: 'absolute',
                              left: marker.day * dayWidth + markerOffset,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              zIndex: 4,
                            }}
                          >
                            <GanttMarker
                              kind={marker.kind}
                              scale={boardScale}
                              hoverContext={
                                marker.kind === 'pm' || marker.kind === 'cm'
                                  ? getAnnualContextFromGanttDay(
                                    visibleMonthWindowStart,
                                    marker.day,
                                    item.label,
                                    group.label,
                                  )
                                  : undefined
                              }
                            />
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  ))
                  : null}
              </Box>
            );
          })}
        </Box>
      </Box>
      <GanttLegend />
    </Paper>
  );
}

export default function MaintenancePlannerPage({ initialMode = 'calendar', onOpenMaintenancePlan, view = 'planner' }: MaintenancePlannerPageProps) {
  const isCalendarOnlyView = view === 'calendarOnly';
  const [plannerSurfaceMode, setPlannerSurfaceMode] = useState<PlannerSurfaceMode>(
    initialMode === 'timeline' ? 'gantt' : 'calendar',
  );
  const [cards, setCards] = useState<CalendarCard[]>(() => initialCalendarCards.map((card) => ({ ...card })));
  const [planningItems, setPlanningItems] = useState<PlanningQueueItem[]>(() =>
    planningQueue.map((item) => ({ ...item, type: item.type as CalendarCard['type'] })),
  );
  const [draggedStaffEntry, setDraggedStaffEntry] = useState<DraggedStaffAssignment | null>(null);
  const [pendingTechnicianAssignment, setPendingTechnicianAssignment] = useState<PendingTechnicianAssignment | null>(null);
  const [pendingReschedule, setPendingReschedule] = useState<PendingRescheduleState | null>(null);
  const [rescheduleReason, setRescheduleReason] = useState<RescheduleReasonOption | ''>('');
  const [rescheduleNotes, setRescheduleNotes] = useState('');
  const [complianceMemoFields, setComplianceMemoFields] = useState<ComplianceMemoFields>(emptyComplianceMemoFields);
  const [staffWorkloadDialog, setStaffWorkloadDialog] = useState<StaffWorkloadDialogState | null>(null);
  const [additionalAssigneeDialog, setAdditionalAssigneeDialog] = useState<AdditionalAssigneeDialogState | null>(null);
  const [selectedPriorities, setSelectedPriorities] = useState<MaintenancePriority[]>([]);
  const [assistantRescheduleHandler, setAssistantRescheduleHandler] = useState<((cardId: string) => void) | null>(null);
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const highlightClearTimeoutRef = useRef<number | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const assistantHorizon = mapPlannerSurfaceModeToAssistantHorizon(plannerSurfaceMode);
  const plannerAi = usePlannerAi({
    assistantHorizon,
    cards,
    planningItems,
    setCards,
    setPlanningItems,
  });

  const selectedTechnicianAssignmentCard = pendingTechnicianAssignment
    ? cards.find((card) => card.id === pendingTechnicianAssignment.cardId) ?? null
    : null;
  const pendingRescheduleCard = pendingReschedule ? cards.find((card) => card.id === pendingReschedule.cardId) ?? null : null;
  const pmComplianceExtensionInfo = getPmComplianceExtensionInfo(pendingRescheduleCard, pendingReschedule);
  const isComplianceMemoRequired = Boolean(pmComplianceExtensionInfo);
  const isRescheduleSubmitDisabled =
    !rescheduleReason ||
    (rescheduleReason === 'Other' && !rescheduleNotes.trim()) ||
    (isComplianceMemoRequired && !areComplianceMemoFieldsComplete(complianceMemoFields));
  const visibleSurfaceMode = plannerSurfaceMode;

  const handlePriorityToggle = (priority: MaintenancePriority) => {
    setSelectedPriorities((currentPriorities) =>
      currentPriorities.includes(priority)
        ? currentPriorities.filter((currentPriority) => currentPriority !== priority)
        : [...currentPriorities, priority],
    );
  };

  const handleStaffDragStart = (entry: StaffAssignmentEntry, day: number, event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = 'copy';
    event.dataTransfer.setData(CALENDAR_TECHNICIAN_DRAG_TYPE, JSON.stringify({ name: entry.name, day }));
    event.dataTransfer.setData('text/plain', entry.name);
    setDraggedStaffEntry({ ...entry, day });
  };

  const handleStaffDragEnd = () => {
    setDraggedStaffEntry(null);
  };

  const handleOpenTechnicianAssignment = (cardId: string) => {
    if (!draggedStaffEntry) {
      return;
    }

    setPendingTechnicianAssignment({
      cardId,
      technician: draggedStaffEntry,
    });
    setDraggedStaffEntry(null);
  };

  const handleCloseTechnicianAssignment = () => {
    setPendingTechnicianAssignment(null);
  };

  const handleOpenRescheduleModal = (nextReschedule: PendingRescheduleState) => {
    setPendingReschedule(nextReschedule);
    setRescheduleReason('');
    setRescheduleNotes('');
    setComplianceMemoFields(emptyComplianceMemoFields);
  };

  const handleCloseRescheduleModal = () => {
    setPendingReschedule(null);
    setRescheduleReason('');
    setRescheduleNotes('');
    setComplianceMemoFields(emptyComplianceMemoFields);
  };

  const handleConfirmReschedule = () => {
    if (!pendingReschedule || isRescheduleSubmitDisabled || !pendingRescheduleCard) {
      return;
    }

    plannerAi.previewManualCardMove(
      pendingRescheduleCard,
      pendingReschedule.toDay,
      pendingReschedule.toShift,
      'reschedule-modal',
    );
    handleCloseRescheduleModal();
  };

  const handleOpenStaffWorkload = (entry: StaffAssignmentEntry, day: number) => {
    setStaffWorkloadDialog({ entry, day });
  };

  const handleCloseStaffWorkload = () => {
    setStaffWorkloadDialog(null);
  };

  const handleOpenAdditionalAssignees = (entry: StaffAssignmentEntry, day: number) => {
    setAdditionalAssigneeDialog({ staffName: entry.name, day });
  };

  const handleCloseAdditionalAssignees = () => {
    setAdditionalAssigneeDialog(null);
  };

  const applyTechnicianAssignment = (mode: 'replace' | 'add') => {
    if (!pendingTechnicianAssignment) {
      return;
    }

    setCards((currentCards) =>
      currentCards.map((card) => {
        if (card.id !== pendingTechnicianAssignment.cardId) {
          return card;
        }

        const nextName =
          mode === 'replace'
            ? pendingTechnicianAssignment.technician.name
            : card.assignee.name.includes(pendingTechnicianAssignment.technician.name)
              ? card.assignee.name
              : `${card.assignee.name} + ${pendingTechnicianAssignment.technician.name}`;

        return {
          ...card,
          assignee: {
            name: nextName,
            initials: getCalendarPersonInitials(nextName),
          },
        };
      }),
    );

    setPendingTechnicianAssignment(null);
  };

  const handleAddAdditionalAssignees = (people: AdditionalAssigneePerson[]) => {
    if (!additionalAssigneeDialog || !people.length) {
      return;
    }

    const addedNames = people.map((person) => person.name);

    setCards((currentCards) => {
      const matchingCard = currentCards.find((card) => {
        const isSameDay = card.day === additionalAssigneeDialog.day;
        const hasStaff = additionalAssigneeDialog.staffName
          ? card.assignee.name.split(' + ').some((name) => name.trim() === additionalAssigneeDialog.staffName)
          : true;

        return isSameDay && hasStaff;
      });

      if (!matchingCard) {
        return currentCards;
      }

      return currentCards.map((card) => {
        if (card.id !== matchingCard.id) {
          return card;
        }

        const currentNames = card.assignee.name.split(' + ').map((name) => name.trim()).filter(Boolean);
        const nextNames = [...currentNames, ...addedNames.filter((name) => !currentNames.includes(name))];
        const nextName = nextNames.join(' + ');

        return {
          ...card,
          assignee: {
            name: nextName,
            initials: getCalendarPersonInitials(nextName),
          },
        };
      });
    });

    setSnackbar({
      open: true,
      message: `${addedNames.join(', ')} added to assignment.`,
      severity: 'success',
    });
    setAdditionalAssigneeDialog(null);
  };

  const plannerWorkflowStep = useMemo(
    () =>
      resolvePlannerAiWorkflowStep({
        hasGeneratedPlan: Boolean(plannerAi.generatedPlan || plannerAi.reviewPlan),
        isPreviewOpen: plannerAi.isPreviewOpen,
        isCompareOpen: plannerAi.isCompareOpen,
        isCascadePreviewOpen: plannerAi.isCascadePreviewOpen,
      }),
    [
      plannerAi.generatedPlan,
      plannerAi.isPreviewOpen,
      plannerAi.isCompareOpen,
      plannerAi.isCascadePreviewOpen,
    ],
  );

  useEffect(
    () => () => {
      if (highlightClearTimeoutRef.current !== null) {
        window.clearTimeout(highlightClearTimeoutRef.current);
      }
    },
    [],
  );

  const handleInsightLink = (assetLabel: string, cardId?: string) => {
    setPlannerSurfaceMode('calendar');
    const resolvedCardId = cardId ?? findPlannerCardIdForAsset(cards, assetLabel);

    if (!resolvedCardId) {
      setSnackbar({
        open: true,
        message: `No weekly board card matched "${assetLabel}" in the mock planner data.`,
        severity: 'info',
      });
      return;
    }

    setHighlightedCardId(resolvedCardId);
    if (highlightClearTimeoutRef.current !== null) {
      window.clearTimeout(highlightClearTimeoutRef.current);
    }
    highlightClearTimeoutRef.current = window.setTimeout(() => {
      setHighlightedCardId(null);
      highlightClearTimeoutRef.current = null;
    }, 5000);

    setSnackbar({
      open: true,
      message: `Highlighted ${assetLabel} on the weekly board.`,
      severity: 'info',
    });
  };

  const handleApplyAiPlan = () => {
    plannerAi.openCascadePreview();
  };

  const handleConfirmCascadeApply = () => {
    const previewSnapshot = plannerAi.cascadePreview;
    const applyResult = plannerAi.confirmCascadeApply();
    if (!applyResult.appliedCount) {
      return;
    }

    const highlightIds = [...applyResult.createdCardIds, ...applyResult.updatedCardIds];
    if (highlightIds.length) {
      if (highlightClearTimeoutRef.current) {
        window.clearTimeout(highlightClearTimeoutRef.current);
      }
      setHighlightedCardId(highlightIds[0]);
      highlightClearTimeoutRef.current = window.setTimeout(() => {
        setHighlightedCardId(null);
        highlightClearTimeoutRef.current = null;
      }, 6000);
    }

    if (plannerSurfaceMode !== 'calendar') {
      setPlannerSurfaceMode('calendar');
    }

    setSnackbar({
      open: true,
      message: buildCascadeApplySuccessMessage(applyResult.appliedCount, previewSnapshot),
      severity: 'success',
    });
  };

  const handleUndoLastChange = () => {
    if (!plannerAi.undoLastChange()) {
      return;
    }

    setSnackbar({
      open: true,
      message: 'Last propagated planner change was reverted.',
      severity: 'info',
    });
  };

  const handleAssistantSuggestionDrop = (suggestionId: string, shift: CalendarShift, day: number) => {
    const previewCount = plannerAi.previewCopilotDrag(suggestionId, shift, day);
    if (!previewCount) {
      return;
    }

    setSnackbar({
      open: true,
      message: 'Step 2 opened — review recommendations before continuing to cascade apply.',
      severity: 'info',
    });
  };

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ color: tokenText.primary, fontWeight: 700, lineHeight: 1.334 }}>
          {isCalendarOnlyView ? 'Maintenance Calendar' : 'Maintenance Planner Calendar'}
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: '16px', // borderRadius/Large
          border: `1px solid ${tokenDivider}`,
          bgcolor: 'background.paper',
        }}
      >
        {!isCalendarOnlyView ? (
          <Box sx={{ mb: 0.85 }}>
            <MaintenancePlannerCopilotSection
              assistantHorizon={plannerAi.assistantHorizon}
              workflowStep={plannerWorkflowStep}
              comparisonSession={plannerAi.comparisonSession}
              generatedPlan={plannerAi.generatedPlan}
              reviewPlan={plannerAi.reviewPlan}
              reviewPlanSource={plannerAi.reviewPlanSource}
              followUpBacklogSummary={plannerAi.followUpBacklogSummary}
              selectedActionCount={plannerAi.selectedActionCount}
              selectedActionIds={plannerAi.selectedActionIds}
              isGenerating={plannerAi.isGenerating}
              isCopilotLoading={plannerAi.isCopilotLoading}
              isWhatIfLoading={plannerAi.isWhatIfLoading}
              isPreviewOpen={plannerAi.isPreviewOpen}
              isCompareOpen={plannerAi.isCompareOpen}
              compareDialogTab={plannerAi.compareDialogTab}
              isCascadePreviewOpen={plannerAi.isCascadePreviewOpen}
              messages={plannerAi.copilotMessages}
              insights={plannerAi.copilotInsights}
              proactiveContext={plannerAi.copilotProactiveContext}
              suggestions={plannerAi.copilotSuggestions}
              quickPrompts={plannerAi.quickPrompts}
              whatIfScenarios={plannerAi.whatIfScenarios}
              whatIfResult={plannerAi.whatIfResult}
              draggedSuggestionId={plannerAi.draggedSuggestionId}
              onGeneratePlan={plannerAi.generateAndOpenPlan}
              onReviewPlan={plannerAi.openPreview}
              onComparePlans={plannerAi.openCompare}
              onToggleAction={plannerAi.toggleActionSelection}
              onSelectAllActions={plannerAi.selectAllActions}
              onClearActionSelection={plannerAi.clearActionSelection}
              onApplySelectedActions={handleApplyAiPlan}
              onAskQuestion={plannerAi.askCopilot}
              onRunQuickPrompt={(prompt) => plannerAi.askCopilot(prompt.question)}
              onRunWhatIf={plannerAi.runWhatIfScenario}
              onClearWhatIf={plannerAi.clearWhatIfResult}
              onSuggestionDragStart={(suggestion, event) => {
                if (suggestion.actionType !== 'drag-to-schedule') {
                  return;
                }
                event.dataTransfer.effectAllowed = 'copy';
                event.dataTransfer.setData(CALENDAR_AI_SUGGESTION_DRAG_TYPE, suggestion.id);
                event.dataTransfer.setData('text/plain', suggestion.title);
                plannerAi.startSuggestionDrag(suggestion.id);
              }}
              onSuggestionDragEnd={plannerAi.endSuggestionDrag}
              onReviewSuggestion={(suggestion) => {
                const opened = plannerAi.openSuggestionReview(suggestion.id);
                if (opened) {
                  setSnackbar({
                    open: true,
                    message: 'Step 2 opened — review recommendations before continuing to cascade apply.',
                    severity: 'info',
                  });
                }
              }}
              onAddWhatIfToReview={() => {
                const opened = plannerAi.openWhatIfReview();
                if (opened) {
                  setSnackbar({
                    open: true,
                    message: 'Step 2 opened — what-if actions ready for review before cascade apply.',
                    severity: 'info',
                  });
                }
              }}
              onReschedule={assistantRescheduleHandler ?? undefined}
              onInsightLink={handleInsightLink}
              undoSnapshot={plannerAi.undoSnapshot}
              activeHorizonImpact={plannerAi.activeHorizonImpact}
              onUndoLastChange={handleUndoLastChange}
            />
          </Box>
        ) : null}
        <Box
          sx={{
            mb: 1.2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1.2,
            flexWrap: 'wrap',
          }}
        >
          <PlannerToolbar
            surfaceMode={plannerSurfaceMode}
            onSurfaceModeChange={setPlannerSurfaceMode}
            selectedPriorities={selectedPriorities}
            onPriorityFiltersChange={setSelectedPriorities}
            horizonProjections={plannerAi.horizonProjections}
          />
          {!isCalendarOnlyView ? <PlannerPrimaryAction onClick={onOpenMaintenancePlan ?? (() => { })} /> : null}
        </Box>

        {visibleSurfaceMode === 'annual' ? (
          <AnnualCalendarBoard />
        ) : visibleSurfaceMode === 'gantt' ? (
          <GanttBoard />
        ) : visibleSurfaceMode === 'calendar' ? (
          <>
            <WeeklyCalendarBoard
              cards={cards}
              setCards={setCards}
              setPlanningItems={setPlanningItems}
              draggedStaffEntry={draggedStaffEntry}
              selectedPriorities={selectedPriorities}
              highlightedCardId={highlightedCardId}
              onPriorityToggle={handlePriorityToggle}
              onAssignTechnicianToCard={handleOpenTechnicianAssignment}
              onOpenReschedule={handleOpenRescheduleModal}
              onAssistantSuggestionDrop={handleAssistantSuggestionDrop}
              onAssistantRescheduleReady={setAssistantRescheduleHandler}
            />
            {!isCalendarOnlyView ? (
              <CalendarOperationsSummary
                cards={cards}
                draggedStaffEntry={draggedStaffEntry}
                onStaffDragStart={handleStaffDragStart}
                onStaffDragEnd={handleStaffDragEnd}
                onStaffClick={handleOpenStaffWorkload}
              />
            ) : null}
          </>
        ) : (
          <MonthCalendarBoard />
        )}
        {!isCalendarOnlyView ? (
          <Box sx={{ mt: 1.4 }}>
            <PlanningPanel items={planningItems} />
          </Box>
        ) : null}

        {!isCalendarOnlyView ? (
          <Box sx={{ mt: 1.6 }}>
            <PlannerAiShell
              section="footer"
              plannerAi={plannerAi}
              onApplyAiPlan={handleApplyAiPlan}
              onConfirmCascadeApply={handleConfirmCascadeApply}
            />
          </Box>
        ) : null}


        <CalendarAssignTechnicianDialog
          card={selectedTechnicianAssignmentCard}
          technician={pendingTechnicianAssignment?.technician ?? null}
          onClose={handleCloseTechnicianAssignment}
          onReplace={() => applyTechnicianAssignment('replace')}
          onAdd={() => applyTechnicianAssignment('add')}
        />
        {!isCalendarOnlyView ? (
          <>
            <StaffWorkloadDialog
              workload={staffWorkloadDialog}
              cards={cards}
              onClose={handleCloseStaffWorkload}
            />
            <AdditionalAssigneesDialog
              open={Boolean(additionalAssigneeDialog)}
              dayLabel="Tue Feb 16"
              onClose={handleCloseAdditionalAssignees}
              onAddPeople={handleAddAdditionalAssignees}
            />
          </>
        ) : null}
        <CalendarRescheduleDialog
          pendingCard={pendingRescheduleCard}
          pendingReschedule={pendingReschedule}
          rescheduleReason={rescheduleReason}
          rescheduleNotes={rescheduleNotes}
          complianceMemoFields={complianceMemoFields}
          isSubmitDisabled={isRescheduleSubmitDisabled}
          onClose={handleCloseRescheduleModal}
          onPendingRescheduleChange={setPendingReschedule}
          onReasonChange={setRescheduleReason}
          onNotesChange={setRescheduleNotes}
          onComplianceMemoFieldsChange={setComplianceMemoFields}
          onConfirm={handleConfirmReschedule}
        />
        {!isCalendarOnlyView ? (
          <PlannerAiShell
            section="dialogs"
            plannerAi={plannerAi}
            onApplyAiPlan={handleApplyAiPlan}
            onConfirmCascadeApply={handleConfirmCascadeApply}
          />
        ) : null}
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}


