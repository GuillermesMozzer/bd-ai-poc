import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Collapse,
  Switch,
  Checkbox,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Close as CloseIcon,
  CloudUpload as UploadIcon,
  Link as LinkIcon,
  ArchiveOutlined as ArchiveIcon,
  Visibility as PreviewIcon,
  SaveOutlined as SaveIcon,
  AutoAwesome as SparkleIcon,
  Inventory2Outlined as InventoryIcon,
  History as HistoryIcon,
  ExpandMore as ExpandMoreIcon,
  DragIndicator as DragIndicatorIcon,
  ChevronRight as ChevronRightIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Add as AddIcon,
  Settings as GearIcon,
  AccessTime as ClockIcon,
  Build as WrenchIcon,
  CheckCircle as CheckCircleIcon,
  PlayArrow as PlayIcon,
  ListAlt as ListIcon,
  Edit as EditIcon,
  ContentCopy as CloneIcon,
  DeleteOutline as DeleteIcon,
  Description as DocumentIcon,
  WarningAmber as WarningIcon,
  Business as PlantIcon,
  AccountTree as HierarchyIcon,
  PrecisionManufacturing as EquipmentIcon,
  VerifiedUser as SafetyIcon,
  FactCheck as QualityIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { activeTheme } from '../../theme';
import { maintenanceLaneData } from '../data';
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

type MaintenancePlanEquipmentNodeType = 'plant' | 'unit' | 'line' | 'equipment' | 'subsystem' | 'component';

type EquipmentSelection = {
  barcode?: string;
  id: string;
  name: string;
  path: string;
  tags: string[];
  type: MaintenancePlanEquipmentNodeType;
};

interface PMPlan {
  id: string;
  assetName: string;
  description?: string;
  zone: string;
  area: string;
  line: string;
  frequencyLabel: string; // e.g. "Daily", "Weekly", "Bi-Weekly"
  criticality: 'A' | 'B' | 'C';
  priority?: 'High' | 'Medium' | 'Low';
  frequencyDays: number;
  strategy: string;
  durationHours: number;
  workCenter: string;
  compliance: 'On Track' | 'At Risk' | 'Overdue';
  lastExecuted: string;
  nextDue: string;
  callHorizon: number;
  callHorizonUnit?: '%' | 'Days';
  executionWindowDays?: number;
  toleranceBeforeDueDays?: number;
  toleranceAfterDueDays?: number;
  status: 'Active' | 'Draft' | 'Paused' | 'Archived' | 'Inactive';
  plannerGroup?: string;
  planningPlant?: string;
  mainWorkCenter?: string;
  notificationType?: string;
  maintenanceActivityType?: string;
  notes?: string;
  attachments?: string[];
  schedulingConfig?: Partial<NewPMSchedulingConfig>;
  maintenanceItems?: NewPMMaintenanceItem[];
  safetyQualityConfig?: NewPMSafetyQualityConfig;
  taskListName?: string;
  taskListDetails?: {
    steps: number;
    parts: number;
    tools: number;
  };
}

type GeneratedWorkOrder = {
  number: string;
  pmPlanId: string;
  dueDate: string;
  status: 'Draft' | 'Open';
};

type TriggerType = 'Time-Based' | 'Usage-Based' | 'Condition-Based';

type NewPMSchedulingConfig = {
  triggerType: '' | TriggerType;
  applySameSchedule: boolean;
  autoGenerateWO: boolean;
  frequencyValue: string;
  frequencyUnit: string;
  startDate: string;
  dueDateDay: string;
  scheduleType: string;
  generateWoBeforeDueDays: string;
  leadTimeDays: string;
  generateBasedOn: string;
  counterMeter: string;
  counterType: string;
  thresholdValue: string;
  unitOfMeasure: string;
  currentCounterReading: string;
  lastMaintenanceCounterReading: string;
  nextDueCounterValue: string;
  estimatedDueDate: string;
  readingSource: string;
  counterResetRule: string;
  toleranceBeforeThreshold: string;
  toleranceAfterThreshold: string;
  generateAtThreshold: boolean;
  generateWithinCallHorizon: boolean;
  allowManualWOBeforeThreshold: boolean;
  conditionSource: string;
  monitoredParameter: string;
  conditionUnitOfMeasure: string;
  currentValue: string;
  warningThreshold: string;
  criticalThreshold: string;
  thresholdRule: string;
  evaluationWindow: string;
  conditionStatus: string;
  requirePlannerConfirmation: boolean;
  alertCondition: string;
  maintenanceGenerationRule: string;
  generateOnWarning: boolean;
  generateOnlyOnCritical: boolean;
  generateNotificationBeforeWO: boolean;
  requireRepeatedBreach: boolean;
  suppressDuplicateWO: boolean;
};

type NewPMSafetyQualityConfig = {
  acceptanceCriteria: string;
  deviationHandling: string;
  evidenceRequired: string;
  hazardControls: string;
  inspectionMethod: string;
  lineClearanceRequired: boolean;
  lotoRequired: boolean;
  permitsRequired: boolean;
  postMaintenanceVerification: boolean;
  ppeRequirements: string[];
  preJobBriefRequired: boolean;
  qaApprovalRole: string;
  qaProcedure: string;
  qaRequired: boolean;
  riskAssessment: string;
  safetyApprovalRole: string;
  safetyPermitType: string;
};

const triggerTypes: TriggerType[] = ['Time-Based', 'Usage-Based', 'Condition-Based'];

const ppeRequirementOptions = ['Safety glasses', 'Cut-resistant gloves', 'Lockout kit', 'Hearing protection', 'Face shield', 'Arc-rated PPE'];

const createDefaultSchedulingConfig = (): NewPMSchedulingConfig => ({
  triggerType: '',
  applySameSchedule: true,
  autoGenerateWO: true,
  frequencyValue: '',
  frequencyUnit: 'Days',
  startDate: '2026-05-21',
  dueDateDay: '',
  scheduleType: 'Fixed Schedule',
  generateWoBeforeDueDays: '7',
  leadTimeDays: '7',
  generateBasedOn: 'Due Date',
  counterMeter: '',
  counterType: '',
  thresholdValue: '',
  unitOfMeasure: '',
  currentCounterReading: '',
  lastMaintenanceCounterReading: '',
  nextDueCounterValue: '',
  estimatedDueDate: '',
  readingSource: '',
  counterResetRule: 'Reset after Work Order completion',
  toleranceBeforeThreshold: '',
  toleranceAfterThreshold: '',
  generateAtThreshold: true,
  generateWithinCallHorizon: true,
  allowManualWOBeforeThreshold: false,
  conditionSource: '',
  monitoredParameter: '',
  conditionUnitOfMeasure: '',
  currentValue: '',
  warningThreshold: '',
  criticalThreshold: '',
  thresholdRule: '',
  evaluationWindow: '',
  conditionStatus: 'Normal',
  requirePlannerConfirmation: false,
  alertCondition: '',
  maintenanceGenerationRule: '',
  generateOnWarning: false,
  generateOnlyOnCritical: true,
  generateNotificationBeforeWO: true,
  requireRepeatedBreach: false,
  suppressDuplicateWO: true,
});

const createDefaultSafetyQualityConfig = (): NewPMSafetyQualityConfig => ({
  acceptanceCriteria: 'Equipment restored to nominal condition with guards, interlocks, and inspection points verified.',
  deviationHandling: 'Open deviation record and require planner plus QA disposition before releasing equipment.',
  evidenceRequired: 'Before/after photos, completed checklist, and measurement readings',
  hazardControls: 'Energy isolation, guarded access, housekeeping check, and controlled restart',
  inspectionMethod: 'Visual inspection and functional verification',
  lineClearanceRequired: true,
  lotoRequired: true,
  permitsRequired: false,
  postMaintenanceVerification: true,
  ppeRequirements: ['Safety glasses', 'Cut-resistant gloves', 'Lockout kit'],
  preJobBriefRequired: true,
  qaApprovalRole: 'QA Technician',
  qaProcedure: 'SOP-QA-214 Preventive Maintenance Release',
  qaRequired: true,
  riskAssessment: 'JSA required before work starts',
  safetyApprovalRole: 'EHS Coordinator',
  safetyPermitType: '',
});

const createDefaultNewPlan = (): Partial<PMPlan> => ({
  id: 'PM-PLAN-022',
  assetName: '',
  zone: 'Z1',
  area: '',
  line: '',
  frequencyLabel: '',
  criticality: 'B',
  frequencyDays: 7,
  strategy: '',
  durationHours: 1.0,
  workCenter: '',
  compliance: 'On Track',
  lastExecuted: 'May 20, 2026',
  nextDue: 'May 27, 2026',
  callHorizon: 80,
  callHorizonUnit: '%',
  executionWindowDays: 7,
  toleranceBeforeDueDays: 3,
  toleranceAfterDueDays: 5,
  status: 'Active',
});

const getPlanSchedulingConfig = (plan: PMPlan): NewPMSchedulingConfig => {
  const triggerType = (plan.schedulingConfig?.triggerType || plan.strategy || 'Time-Based') as '' | TriggerType;
  return {
    ...createDefaultSchedulingConfig(),
    triggerType,
    applySameSchedule: plan.schedulingConfig?.applySameSchedule ?? true,
    autoGenerateWO: plan.schedulingConfig?.autoGenerateWO ?? true,
    frequencyValue: String(plan.frequencyDays || ''),
    frequencyUnit: 'Days',
    generateWoBeforeDueDays: String(plan.callHorizon || 7),
    ...plan.schedulingConfig,
  };
};

const followUpPlanSources = {
  syringePm: maintenanceLaneData.team.scheduled.find((card) => card.id === 'std-5') ?? maintenanceLaneData.team.scheduled[0],
  conveyorPlanning: maintenanceLaneData.team.scheduling.find((card) => card.id === 'sch-1') ?? maintenanceLaneData.team.scheduling[0],
  coolingProgress: maintenanceLaneData.team.progress.find((card) => card.id === 'ip-3') ?? maintenanceLaneData.team.progress[0],
  moldingRequest: maintenanceLaneData.requests.find((card) => card.id === 'mr-8') ?? maintenanceLaneData.requests[0],
};

const formatFollowUpDueForPlan = (due: string) => {
  const normalized = due.replace(/(\d{1,2}):(\d{2})(AM|PM)$/i, '$1:$2 $3');
  const dateOnlyMatch = normalized.match(/^[A-Za-z]{3}\s+\d{1,2}/);
  return dateOnlyMatch ? `${dateOnlyMatch[0]}, 2026` : normalized;
};

const initialPMPlans: PMPlan[] = [
  {
    id: 'PM-PLAN-009',
    assetName: followUpPlanSources.syringePm.title,
    description: followUpPlanSources.syringePm.detail,
    zone: 'Z1',
    area: 'Assembly',
    line: 'Line 10',
    frequencyLabel: 'Weekly',
    criticality: followUpPlanSources.syringePm.equipmentCriticality ?? 'B',
    priority: 'Medium',
    frequencyDays: 7,
    strategy: 'Time-Based',
    durationHours: 1.5,
    workCenter: 'Mechanical',
    compliance: 'On Track',
    lastExecuted: 'Jan 8, 2026',
    nextDue: formatFollowUpDueForPlan(followUpPlanSources.syringePm.due),
    callHorizon: 80,
    callHorizonUnit: '%',
    executionWindowDays: 7,
    toleranceBeforeDueDays: 3,
    toleranceAfterDueDays: 5,
    status: 'Active',
    taskListName: 'General Mechanical Inspection (GTL-001)',
    taskListDetails: {
      steps: 3,
      parts: 1,
      tools: 3,
    },
  },
  {
    id: 'PM-PLAN-010',
    assetName: followUpPlanSources.conveyorPlanning.title,
    description: followUpPlanSources.conveyorPlanning.detail,
    zone: 'Z2',
    area: 'Transfer',
    line: 'Line 20',
    frequencyLabel: 'Weekly',
    criticality: followUpPlanSources.conveyorPlanning.equipmentCriticality ?? 'A',
    priority: 'High',
    frequencyDays: 7,
    strategy: 'Time-Based',
    durationHours: 1.0,
    workCenter: 'Mechanical',
    compliance: 'On Track',
    lastExecuted: 'Jan 6, 2026',
    nextDue: formatFollowUpDueForPlan(followUpPlanSources.conveyorPlanning.due),
    callHorizon: 80,
    callHorizonUnit: '%',
    executionWindowDays: 7,
    toleranceBeforeDueDays: 3,
    toleranceAfterDueDays: 5,
    status: 'Active',
    taskListName: 'Conveyor Preventive Maintenance (TL-CNV-001)',
    taskListDetails: {
      steps: 6,
      parts: 0,
      tools: 3,
    },
  },
  {
    id: 'PM-PLAN-011',
    assetName: followUpPlanSources.coolingProgress.title,
    description: followUpPlanSources.coolingProgress.detail,
    zone: 'Z2',
    area: 'Utilities',
    line: 'Line 20',
    frequencyLabel: 'Weekly',
    criticality: followUpPlanSources.coolingProgress.equipmentCriticality ?? 'C',
    priority: 'Low',
    frequencyDays: 7,
    strategy: 'Condition-Based',
    durationHours: 1.0,
    workCenter: 'Utilities',
    compliance: 'At Risk',
    lastExecuted: 'Jan 6, 2026',
    nextDue: formatFollowUpDueForPlan(followUpPlanSources.coolingProgress.due),
    callHorizon: 75,
    callHorizonUnit: '%',
    executionWindowDays: 7,
    toleranceBeforeDueDays: 3,
    toleranceAfterDueDays: 5,
    status: 'Active',
  },
  {
    id: 'PM-PLAN-012',
    assetName: followUpPlanSources.moldingRequest.title,
    description: followUpPlanSources.moldingRequest.detail,
    zone: 'Z3',
    area: 'Molding',
    line: 'Line 30',
    frequencyLabel: 'Weekly',
    criticality: followUpPlanSources.moldingRequest.equipmentCriticality ?? 'A',
    priority: 'High',
    frequencyDays: 7,
    strategy: 'Time-Based',
    durationHours: 2.0,
    workCenter: 'Mechanical',
    compliance: 'At Risk',
    lastExecuted: 'Jan 6, 2026',
    nextDue: formatFollowUpDueForPlan(followUpPlanSources.moldingRequest.due),
    callHorizon: 80,
    callHorizonUnit: '%',
    executionWindowDays: 7,
    toleranceBeforeDueDays: 3,
    toleranceAfterDueDays: 5,
    status: 'Active',
  },
];

const maintenancePlanHierarchyIdsByPlanId: Record<string, string[]> = {
  'PM-PLAN-009': ['SA-204', 'SA-204-FILL', 'SA-204-FHA', 'SA-204-SERVO', 'SA-204-NOZZLE', 'SA-204-BEARING', 'VI-210', 'VI-210-CAMERA', 'VI-210-LIGHT'],
  'PM-PLAN-010': ['CV-210', 'CV-210-BELT', 'CV-210-ROLLER'],
  'PM-PLAN-011': ['CSA-01', 'CSA-01-RETURN', 'CSA-01-PUMP'],
  'PM-PLAN-012': ['MM-301', 'MM-301-MOLD', 'MM-301-CAVITY-BLOCK', 'M-004'],
};

type MaintenancePlanHierarchyNode = {
  barcode?: string;
  children?: MaintenancePlanHierarchyNode[];
  id: string;
  name: string;
  tags?: string[];
  type: EquipmentSelection['type'];
};

const maintenancePlanSelectableHierarchyTypes = new Set<EquipmentSelection['type']>(['equipment', 'subsystem', 'component']);

const maintenancePlanHierarchyTree: MaintenancePlanHierarchyNode[] = [
  {
    id: 'plant-a',
    name: 'Plant A',
    type: 'plant',
    children: [
      {
        id: 'unit-b',
        name: 'Unit B',
        type: 'unit',
        children: [
          {
            id: 'line-10',
            name: 'Line 10',
            type: 'line',
            children: [
              {
                id: 'SA-204',
                name: 'Syringe Assembly Machine SA-204',
                type: 'equipment',
                barcode: 'BC-SA-204',
                tags: ['SA-204', 'syringe', 'assembly', 'critical'],
                children: [
                  {
                    id: 'SA-204-FILL',
                    name: 'Filling System',
                    type: 'subsystem',
                    barcode: 'BC-SA-204-FILL',
                    tags: ['filling', 'dosing', 'liquid path'],
                    children: [
                      { id: 'SA-204-FHA', name: 'Filling Head Assembly', type: 'component', barcode: 'BC-SA-204-FHA', tags: ['head', 'subassembly', 'filling'] },
                      { id: 'SA-204-SERVO', name: 'Servo Motor', type: 'component', barcode: 'BC-SA-204-SERVO', tags: ['motor', 'drive', 'servo'] },
                      { id: 'SA-204-NOZZLE', name: 'Nozzle Cluster', type: 'component', barcode: 'BC-SA-204-NOZZLE', tags: ['nozzle', 'cluster', 'filling'] },
                      { id: 'SA-204-BEARING', name: 'Drive Bearing', type: 'component', barcode: 'BC-SA-204-BEARING', tags: ['bearing', 'drive', 'rotating'] },
                    ],
                  },
                  { id: 'SA-204-TRANSPORT', name: 'Transport System', type: 'subsystem', barcode: 'BC-SA-204-TRANSPORT', tags: ['transport', 'conveyor', 'indexing'] },
                ],
              },
              {
                id: 'VI-210',
                name: 'Vision Inspection VI-210',
                type: 'equipment',
                barcode: 'BC-VI-210',
                tags: ['VI-210', 'camera', 'inspection', 'vision'],
              },
              {
                id: 'LM-88',
                name: 'Labeling Machine LM-88',
                type: 'equipment',
                barcode: 'BC-LM-88',
                tags: ['LM-88', 'labeler', 'labeling'],
              },
            ],
          },
          {
            id: 'line-30',
            name: 'Line 30 - Molding',
            type: 'line',
            children: [
              {
                id: 'MM-301',
                name: 'Molding Machine MM-301',
                type: 'equipment',
                barcode: 'BC-MM-301',
                tags: ['MM-301', 'molding', 'injection', 'mold cavities'],
                children: [
                  {
                    id: 'MM-301-MOLD',
                    name: 'Mold Tooling',
                    type: 'subsystem',
                    barcode: 'BC-MM-301-MOLD',
                    tags: ['mold', 'tooling', 'cavities', 'molding'],
                    children: [
                      {
                        id: 'MM-301-CAVITY-BLOCK',
                        name: 'Cavity Block',
                        type: 'component',
                        barcode: 'BC-MM-301-CAVITY',
                        tags: ['cavity', 'mold', 'quality', 'molding'],
                      },
                    ],
                  },
                ],
              },
              {
                id: 'M-004',
                name: 'Mold M-004',
                type: 'equipment',
                barcode: 'BC-M-004',
                tags: ['M-004', 'mold', 'molding', 'tooling'],
              },
            ],
          },
          {
            id: 'line-20',
            name: 'Line 20',
            type: 'line',
            children: [
              {
                id: 'CV-210',
                name: 'Conveyor CV-210',
                type: 'equipment',
                barcode: 'BC-CV-210',
                tags: ['CV-210', 'conveyor', 'transfer', 'follow-up'],
                children: [
                  { id: 'CV-210-BELT', name: 'Belt Tracking System', type: 'subsystem', barcode: 'BC-CV-210-BELT', tags: ['belt', 'tracking', 'tension'] },
                  { id: 'CV-210-ROLLER', name: 'Transfer Roller Set', type: 'component', barcode: 'BC-CV-210-ROLLER', tags: ['roller', 'transfer', 'inspection'] },
                ],
              },
              {
                id: 'CSA-01',
                name: 'Cooling System A',
                type: 'equipment',
                barcode: 'BC-CSA-01',
                tags: ['cooling', 'coolant', 'autonomous maintenance'],
                children: [
                  { id: 'CSA-01-RETURN', name: 'Coolant Return Filter', type: 'component', barcode: 'BC-CSA-01-RETURN', tags: ['filter', 'coolant', 'residue'] },
                  { id: 'CSA-01-PUMP', name: 'Coolant Circulation Pump', type: 'subsystem', barcode: 'BC-CSA-01-PUMP', tags: ['pump', 'utilities', 'cooling'] },
                ],
              },
              {
                id: 'PL-B',
                name: 'Packaging Line B',
                type: 'equipment',
                barcode: 'BC-PL-B',
                tags: ['packaging', 'conveyor', 'roller kit'],
              },
              {
                id: 'EX-118',
                name: 'Extrusion Machine EX-118',
                type: 'equipment',
                barcode: 'BC-EX-118',
                tags: ['extrusion', 'seal', 'oil leak'],
              },
            ],
          },
        ],
      },
    ],
  },
];

function getMaintenancePlanHierarchyIcon(type: EquipmentSelection['type']) {
  const iconSx = { fontSize: 17 };

  if (type === 'plant') return <PlantIcon sx={{ ...iconSx, color: activeTheme.textSecondary }} />;
  if (type === 'unit' || type === 'line') return <HierarchyIcon sx={{ ...iconSx, color: activeTheme.textSecondary }} />;
  if (type === 'equipment') return <EquipmentIcon sx={{ ...iconSx, color: activeTheme.primary }} />;
  if (type === 'subsystem') return <GearIcon sx={{ ...iconSx, color: '#0F766E' }} />;
  return <WrenchIcon sx={{ ...iconSx, color: '#7C3AED' }} />;
}

function MaintenancePlanStatusDot({ color }: { color: string }) {
  return <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, display: 'inline-block', flexShrink: 0 }} />;
}

function MaintenancePlanHierarchyRow({
  depth,
  expandedIds,
  node,
  onSelect,
  onToggle,
  path,
  selectedId,
}: {
  depth: number;
  expandedIds: Set<string>;
  node: MaintenancePlanHierarchyNode;
  onSelect: (selection: EquipmentSelection) => void;
  onToggle: (nodeId: string) => void;
  path: string[];
  selectedId?: string;
}) {
  const hasChildren = Boolean(node.children?.length);
  const isExpanded = expandedIds.has(node.id);
  const isSelectable = maintenancePlanSelectableHierarchyTypes.has(node.type);
  const isSelected = selectedId === node.id;
  const nextPath = [...path, node.name];
  const handleSelect = () => {
    if (!isSelectable) {
      if (hasChildren) onToggle(node.id);
      return;
    }

    onSelect({
      id: node.id,
      name: node.name,
      type: node.type,
      path: nextPath.join(' > '),
      tags: node.tags ?? [],
      barcode: node.barcode,
    });
  };

  return (
    <Box>
      <Box
        role="button"
        tabIndex={0}
        onClick={handleSelect}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleSelect();
          }
        }}
        sx={{
          mx: 1,
          minHeight: 44,
          display: 'grid',
          gridTemplateColumns: '18px 18px minmax(0, 1fr) auto',
          alignItems: 'center',
          columnGap: 0.75,
          pl: `${0.35 + depth * 0.42}rem`,
          pr: 1,
          py: 0.7,
          borderRadius: '8px',
          bgcolor: isSelected ? tokenBrand.selectedBg : 'transparent',
          border: isSelected ? `1px solid ${tokenBrand.main}` : '1px solid transparent',
          color: isSelected ? tokenBrand.main : tokenText.primary,
          fontWeight: isSelected ? 700 : 500,
          cursor: isSelectable || hasChildren ? 'pointer' : 'default',
          overflow: 'hidden',
          '&:hover': { bgcolor: isSelected ? tokenBrand.selectedBg : tokenNeutral.lightest },
          '&:focus-visible': { outline: `2px solid ${tokenBrand.main}`, outlineOffset: 1 },
        }}
      >
        {hasChildren ? (
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              onToggle(node.id);
            }}
            onKeyDown={(event) => event.stopPropagation()}
            sx={{
              width: 20,
              height: 20,
              color: '#94A3B8',
              '&:hover': { bgcolor: tokenBrand.softBg, color: tokenBrand.main },
            }}
            aria-label={isExpanded ? `Collapse ${node.name}` : `Expand ${node.name}`}
          >
            {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 15 }} /> : <ChevronRightIcon sx={{ fontSize: 15 }} />}
          </IconButton>
        ) : (
          <Box sx={{ width: 20, height: 20 }} />
        )}
        {getMaintenancePlanHierarchyIcon(node.type)}
        <Typography
          title={node.name}
          variant="body2"
          sx={{
            minWidth: 0,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 2,
            fontSize: '0.8125rem',
            lineHeight: 1.25,
            fontWeight: 'inherit',
            color: isSelected ? tokenBrand.main : isSelectable ? tokenText.primary : tokenText.secondary,
            letterSpacing: 0,
          }}
        >
          {node.name}
        </Typography>
        <Chip
          label={node.id}
          size="small"
          sx={{
            height: 20,
            maxWidth: 76,
            justifySelf: 'end',
            bgcolor: tokenCommon.white,
            border: `1px solid ${tokenDivider}`,
            color: tokenText.secondary,
            borderRadius: '999px',
            fontSize: '0.625rem',
            fontWeight: 700,
            '& .MuiChip-label': { px: 0.75, overflow: 'hidden', textOverflow: 'ellipsis' },
          }}
        />
      </Box>
      {hasChildren && isExpanded ? (
        <Box>
          {node.children!.map((child) => (
            <MaintenancePlanHierarchyRow
              key={child.id}
              depth={depth + 1}
              expandedIds={expandedIds}
              node={child}
              onSelect={onSelect}
              onToggle={onToggle}
              path={nextPath}
              selectedId={selectedId}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

function getMaintenancePlanHierarchyNodeMatchesSearch(node: MaintenancePlanHierarchyNode, normalizedSearch: string): boolean {
  if (!normalizedSearch) return true;

  const ownText = [node.id, node.name, node.barcode, ...(node.tags ?? [])].filter(Boolean).join(' ').toLowerCase();
  return ownText.includes(normalizedSearch) || Boolean(node.children?.some((child) => getMaintenancePlanHierarchyNodeMatchesSearch(child, normalizedSearch)));
}

function getFilteredMaintenancePlanHierarchyTree(nodes: MaintenancePlanHierarchyNode[], search: string): MaintenancePlanHierarchyNode[] {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return nodes;

  return nodes
    .filter((node) => getMaintenancePlanHierarchyNodeMatchesSearch(node, normalizedSearch))
    .map((node) => ({
      ...node,
      children: node.children ? getFilteredMaintenancePlanHierarchyTree(node.children, search) : undefined,
    }));
}
const getNextPMPlanId = (plans: PMPlan[]) => {
  const nextNumber = plans.reduce((highest, plan) => {
    const match = plan.id.match(/^PM-PLAN-(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0) + 1;

  return `PM-PLAN-${String(nextNumber).padStart(3, '0')}`;
};

const getNextWorkOrderNumber = (workOrders: GeneratedWorkOrder[]) => {
  const nextNumber = workOrders.reduce((highest, workOrder) => {
    const match = workOrder.number.match(/^WO-(\d+)$/);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 700000) + 1;

  return `WO-${nextNumber}`;
};

const criticalityToPriority = (criticality: PMPlan['criticality']): NonNullable<PMPlan['priority']> => {
  if (criticality === 'A') return 'High';
  if (criticality === 'C') return 'Low';
  return 'Medium';
};

const parsePMDate = (value: string) => {
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

const formatWODate = (date: Date | null) => {
  if (!date) return '-';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const addDays = (date: Date, days: number) => {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
};

const formatCallHorizon = (plan: Pick<PMPlan, 'callHorizon' | 'callHorizonUnit'>) => {
  return `${plan.callHorizon}${plan.callHorizonUnit === 'Days' ? ' days' : '%'}`;
};

const isPlanInsideCallHorizon = (plan: PMPlan) => {
  const nextDueDate = parsePMDate(plan.nextDue);
  if (!nextDueDate || !plan.frequencyDays || !plan.callHorizon) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  nextDueDate.setHours(0, 0, 0, 0);

  const daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const callHorizonDays = plan.callHorizonUnit === 'Days'
    ? plan.callHorizon
    : Math.ceil(plan.frequencyDays * (plan.callHorizon / 100));

  return daysUntilDue <= callHorizonDays;
};

type TaskListExample = {
  id: string;
  scope: 'G' | 'E' | 'F';
  group: string;
  counter: string;
  title: string;
  itemDescription: string;
  defaultWorkCenter: string;
  activityType: string;
  estimatedDuration: string;
  durationUnit: 'Hours' | 'Minutes';
  requiredSkill: string;
  totalDuration: string;
  operations: TaskListOperation[];
};

type TaskListOperation = {
  op: string;
  description: string;
  workCenter: string;
  duration: string;
  skill: string;
  subOperations?: TaskListOperation[];
};

type NewPMMaintenanceItem = {
  attachments: string[];
  equipment: string;
  id: string;
  operationTaskListIds?: string[];
  operations?: TaskListOperation[];
  referenceObjectId: string;
  referenceObjectPath: string;
  taskListId: string;
};

const createBlankMaintenanceItem = (id = '001'): NewPMMaintenanceItem => ({
  id,
  taskListId: '',
  equipment: '',
  attachments: [],
  referenceObjectId: '',
  referenceObjectPath: '',
});

const cloneTaskListOperation = (operation: TaskListOperation): TaskListOperation => ({
  ...operation,
  subOperations: operation.subOperations?.map(cloneTaskListOperation),
});

type NewPMReferenceObjectNode = {
  children?: NewPMReferenceObjectNode[];
  id: string;
  kind: 'area' | 'unit' | 'line' | 'zone' | 'equipment' | 'system' | 'assembly' | 'component';
  label: string;
};

const newPMReferenceObjectTree: NewPMReferenceObjectNode = {
  id: 'area-a',
  kind: 'area',
  label: 'Area A',
  children: [
    {
      id: 'unit-a',
      kind: 'unit',
      label: 'Unit A',
      children: [
        {
          id: 'line-10',
          kind: 'line',
          label: 'Line 10',
          children: [
            {
              id: 'zone-1',
              kind: 'zone',
              label: 'Zone 1',
              children: [
                {
                  id: 'syringe-assembly-machine-s-101',
                  kind: 'equipment',
                  label: 'Syringe Assembly Machine S-101',
                  children: [
                    {
                      id: 'filling-system',
                      kind: 'system',
                      label: 'Filling System',
                      children: [
                        {
                          id: 'filling-head-assembly',
                          kind: 'assembly',
                          label: 'Filling Head Assembly',
                          children: [
                            { id: 'servo-motor', kind: 'component', label: 'Servo Motor' },
                            { id: 'nozzle-cluster', kind: 'component', label: 'Nozzle Cluster' },
                            { id: 'drive-bearing', kind: 'component', label: 'Drive Bearing' },
                          ],
                        },
                        { id: 'dosing-pump-module', kind: 'assembly', label: 'Dosing Pump Module' },
                      ],
                    },
                    { id: 'transport-system', kind: 'system', label: 'Transport System' },
                  ],
                },
                { id: 'conveyor-cv-102', kind: 'equipment', label: 'Conveyor CV-102' },
                { id: 'sensor-array-s-101', kind: 'equipment', label: 'Sensor Array S-101' },
                { id: 'vision-inspection-vi-210', kind: 'equipment', label: 'Vision Inspection VI-210' },
                { id: 'labeling-machine-lm-88', kind: 'equipment', label: 'Labeling Machine LM-88' },
                { id: 'cartoner-ct-32', kind: 'equipment', label: 'Cartoner CT-32' },
                { id: 'reject-station-rj-11', kind: 'equipment', label: 'Reject Station RJ-11' },
              ],
            },
          ],
        },
      ],
    },
  ],
};

const findNewPMReferenceObjectPath = (
  nodeId: string,
  node: NewPMReferenceObjectNode = newPMReferenceObjectTree,
  trail: NewPMReferenceObjectNode[] = [],
): NewPMReferenceObjectNode[] | null => {
  const nextTrail = [...trail, node];
  if (node.id === nodeId) return nextTrail;

  for (const child of node.children ?? []) {
    const found = findNewPMReferenceObjectPath(nodeId, child, nextTrail);
    if (found) return found;
  }

  return null;
};

const taskListExamples: TaskListExample[] = [
  {
    id: 'GTL-001',
    scope: 'G',
    group: 'GEN-MECH',
    counter: '01',
    title: 'General Mechanical Inspection',
    itemDescription: 'Inspect mechanical condition, fasteners, guards, and wear points',
    defaultWorkCenter: 'MEC-01',
    activityType: 'Inspection',
    estimatedDuration: '1.5',
    durationUnit: 'Hours',
    requiredSkill: 'Mechanical',
    totalDuration: '1.5 h',
    operations: [
      { op: '0010', description: 'Check guards and fasteners', workCenter: 'MEC-01', duration: '20 min', skill: 'Mechanical' },
      { op: '0020', description: 'Inspect bearings and coupling', workCenter: 'MEC-01', duration: '45 min', skill: 'Mechanical' },
      { op: '0030', description: 'Record abnormal vibration or noise', workCenter: 'MEC-01', duration: '25 min', skill: 'Mechanical' },
    ],
  },
  {
    id: 'GTL-002',
    scope: 'G',
    group: 'GEN-ELEC',
    counter: '01',
    title: 'Electrical Preventive Maintenance',
    itemDescription: 'Verify LOTO, inspect panel connections, thermography, and protective devices',
    defaultWorkCenter: 'ELE-01',
    activityType: 'Condition-Based',
    estimatedDuration: '2',
    durationUnit: 'Hours',
    requiredSkill: 'Electrical',
    totalDuration: '2 h',
    operations: [
      { op: '0010', description: 'Verify LOTO and isolation', workCenter: 'ELE-01', duration: '15 min', skill: 'Electrical' },
      { op: '0020', description: 'Inspect panel and connections', workCenter: 'ELE-01', duration: '45 min', skill: 'Electrical' },
      { op: '0030', description: 'Thermography of busbars and terminals', workCenter: 'ELE-01', duration: '30 min', skill: 'Electrical' },
      { op: '0040', description: 'Test protective devices', workCenter: 'ELE-01', duration: '30 min', skill: 'Electrical' },
    ],
  },
  {
    id: 'GTL-003',
    scope: 'G',
    group: 'GEN-LUB',
    counter: '01',
    title: 'Lubrication Standard Tasks',
    itemDescription: 'Lubricate bearings, chains, slides, and inspect lubricant condition',
    defaultWorkCenter: 'MEC-02',
    activityType: 'Lubrication',
    estimatedDuration: '45',
    durationUnit: 'Minutes',
    requiredSkill: 'Mechanical',
    totalDuration: '45 min',
    operations: [
      { op: '0010', description: 'Clean lubrication points', workCenter: 'MEC-02', duration: '10 min', skill: 'Mechanical' },
      { op: '0020', description: 'Apply approved lubricant', workCenter: 'MEC-02', duration: '25 min', skill: 'Mechanical' },
      { op: '0030', description: 'Check for leaks and residue', workCenter: 'MEC-02', duration: '10 min', skill: 'Mechanical' },
    ],
  },
  {
    id: 'GTL-004',
    scope: 'G',
    group: 'GEN-EHS',
    counter: '01',
    title: 'Safety Inspection Checklist',
    itemDescription: 'Inspect safety devices, labels, guards, and emergency stop access',
    defaultWorkCenter: 'EHS-01',
    activityType: 'Safety Inspection',
    estimatedDuration: '1',
    durationUnit: 'Hours',
    requiredSkill: 'EHS',
    totalDuration: '1 h',
    operations: [
      { op: '0010', description: 'Inspect guards and access points', workCenter: 'EHS-01', duration: '20 min', skill: 'EHS' },
      { op: '0020', description: 'Verify emergency stops', workCenter: 'EHS-01', duration: '20 min', skill: 'EHS' },
      { op: '0030', description: 'Check safety labels and signage', workCenter: 'EHS-01', duration: '20 min', skill: 'EHS' },
    ],
  },
  {
    id: 'TL-MTR-001',
    scope: 'E',
    group: 'EQ-MOTO',
    counter: '01',
    title: 'Motor Preventive Maintenance',
    itemDescription: 'Inspect motor housing, cooling fan, terminals, and operating condition',
    defaultWorkCenter: 'ELE-02',
    activityType: 'Inspection',
    estimatedDuration: '1',
    durationUnit: 'Hours',
    requiredSkill: 'Electrical',
    totalDuration: '1 h',
    operations: [
      { op: '0010', description: 'Inspect motor exterior and fan', workCenter: 'ELE-02', duration: '20 min', skill: 'Electrical' },
      { op: '0020', description: 'Check terminal box condition', workCenter: 'ELE-02', duration: '25 min', skill: 'Electrical' },
      { op: '0030', description: 'Record current and temperature', workCenter: 'ELE-02', duration: '15 min', skill: 'Electrical' },
    ],
  },
  {
    id: 'TL-PMP-001',
    scope: 'E',
    group: 'EQ-PUMP',
    counter: '02',
    title: 'Pump Preventive Maintenance',
    itemDescription: 'Inspect pump seals, coupling, baseplate, and abnormal noise',
    defaultWorkCenter: 'MEC-03',
    activityType: 'Inspection',
    estimatedDuration: '1',
    durationUnit: 'Hours',
    requiredSkill: 'Mechanical',
    totalDuration: '1 h',
    operations: [
      { op: '0010', description: 'Inspect seals and leakage', workCenter: 'MEC-03', duration: '20 min', skill: 'Mechanical' },
      { op: '0020', description: 'Check coupling and alignment', workCenter: 'MEC-03', duration: '25 min', skill: 'Mechanical' },
      { op: '0030', description: 'Record pump noise and vibration', workCenter: 'MEC-03', duration: '15 min', skill: 'Mechanical' },
    ],
  },
  {
    id: 'TL-CNV-001',
    scope: 'E',
    group: 'EQ-CONV',
    counter: '03',
    title: 'Conveyor Preventive Maintenance',
    itemDescription: 'Inspect belt tracking, rollers, guards, drive chain, and lubrication points',
    defaultWorkCenter: 'MEC-01',
    activityType: 'Inspection',
    estimatedDuration: '1',
    durationUnit: 'Hours',
    requiredSkill: 'Mechanical',
    totalDuration: '1 h',
    operations: [
      { op: '0010', description: 'Inspect belt tracking and tension', workCenter: 'MEC-01', duration: '20 min', skill: 'Mechanical' },
      { op: '0020', description: 'Check rollers and guards', workCenter: 'MEC-01', duration: '20 min', skill: 'Mechanical' },
      { op: '0030', description: 'Lubricate drive chain', workCenter: 'MEC-01', duration: '20 min', skill: 'Mechanical' },
    ],
  },
  {
    id: 'TL-MLD-001',
    scope: 'E',
    group: 'EQ-MOLD',
    counter: '04',
    title: 'Molding Machine Preventive Maintenance',
    itemDescription: 'Inspect mold area, clamps, hydraulic leaks, and safety interlocks',
    defaultWorkCenter: 'MEC-04',
    activityType: 'Inspection',
    estimatedDuration: '2',
    durationUnit: 'Hours',
    requiredSkill: 'Mechanical',
    totalDuration: '2 h',
    operations: [
      { op: '0010', description: 'Inspect clamps and guides', workCenter: 'MEC-04', duration: '35 min', skill: 'Mechanical' },
      { op: '0020', description: 'Check hydraulic leaks', workCenter: 'MEC-04', duration: '35 min', skill: 'Mechanical' },
      { op: '0030', description: 'Test safety interlocks', workCenter: 'MEC-04', duration: '50 min', skill: 'Mechanical' },
    ],
  },
  {
    id: 'FTL-001',
    scope: 'F',
    group: 'FL-Z1',
    counter: '01',
    title: 'Z1 Press Area Routine Maintenance',
    itemDescription: 'Inspect press area utilities, access points, guarding, and housekeeping',
    defaultWorkCenter: 'FAC-01',
    activityType: 'Routine',
    estimatedDuration: '1',
    durationUnit: 'Hours',
    requiredSkill: 'Facilities',
    totalDuration: '1 h',
    operations: [
      { op: '0010', description: 'Inspect access and housekeeping', workCenter: 'FAC-01', duration: '20 min', skill: 'Facilities' },
      { op: '0020', description: 'Check local utilities', workCenter: 'FAC-01', duration: '20 min', skill: 'Facilities' },
      { op: '0030', description: 'Verify area signage', workCenter: 'FAC-01', duration: '20 min', skill: 'Facilities' },
    ],
  },
];

type GeneralTaskListSummary = {
  id: string;
  title: string;
  status: 'Active' | 'Approved' | 'Draft' | 'Archived';
  ops: number;
  eq: number;
  date: string;
};

type GeneralTaskListSparePart = {
  availability: string;
  criticality: string;
  description: string;
  linkedTaskList: string;
  partNumber: string;
  quantity: string;
  uom: string;
};

const generalTaskLists: GeneralTaskListSummary[] = [
  {
    id: 'GRP-PUMP-001',
    title: 'Centrifugal Pump - Quarterly Preventive Maintenance',
    status: 'Active',
    ops: 5,
    eq: 3,
    date: '2026-04-12',
  },
  {
    id: 'GRP-CONV-002',
    title: 'Conveyor Belt System - Monthly Inspection (Siemens)',
    status: 'Approved',
    ops: 0,
    eq: 1,
    date: '2026-03-28',
  },
  {
    id: 'GRP-COMP-005',
    title: 'Air Compressor - Annual Overhaul',
    status: 'Draft',
    ops: 0,
    eq: 0,
    date: '2026-02-14',
  },
];

function statusChipSx(status: string) {
  if (status === 'Active') return { bgcolor: '#DCFCE7', color: '#16A34A', borderColor: '#BBF7D0' };
  if (status === 'Approved') return { bgcolor: '#E0E7FF', color: activeTheme.primary, borderColor: '#C7D2FE' };
  return { bgcolor: '#F1F5F9', color: activeTheme.textSecondary, borderColor: 'var(--paper-border-color)' };
}

function GeneralTaskListScreen({
  onBack,
  onNotify,
  initialMode = 'browse',
}: {
  onBack: () => void;
  onNotify: (message: string, severity?: 'success' | 'info' | 'warning') => void;
  initialMode?: 'browse' | 'create';
}) {
  const [taskLists, setTaskLists] = useState<GeneralTaskListSummary[]>(generalTaskLists);
  const [isCreatingTaskList, setIsCreatingTaskList] = useState(initialMode === 'create');
  const [selectedListId, setSelectedListId] = useState(generalTaskLists[0].id);
  const [taskSearch, setTaskSearch] = useState('');
  const [openTaskListSections, setOpenTaskListSections] = useState<Record<string, boolean>>(
    initialMode === 'create' ? { information: true, operations: true } : {},
  );
  const [newTaskList, setNewTaskList] = useState<GeneralTaskListSummary>({
    id: 'GRP-NEW-001',
    title: '',
    status: 'Draft',
    ops: 0,
    eq: 0,
    date: '2026-05-22',
  });
  const [operationRowsByListId, setOperationRowsByListId] = useState<Record<string, TaskListOperation[]>>({
    'GRP-PUMP-001': [
      { op: '0010', description: 'Lockout/Tagout pump', workCenter: 'MECH-0', duration: '0.5h', skill: 'Mechanical L1' },
      { op: '0020', description: 'Inspect mechanical seal', workCenter: 'MECH-0', duration: '1.0h', skill: 'Mechanical L1' },
      { op: '0030', description: 'Lubricate bearings', workCenter: 'MECH-0', duration: '0.5h', skill: 'Mechanical L1' },
      { op: '0040', description: 'Vibration analysis - drive end', workCenter: 'PDM-01', duration: '0.75h', skill: 'PdM Technician' },
      { op: '0050', description: 'Restore service, record results', workCenter: 'MECH-0', duration: '0.5h', skill: 'Mechanical L2' },
    ],
    'GRP-CONV-002': [],
    'GRP-COMP-005': [],
  });
  const [newOperationRows, setNewOperationRows] = useState<TaskListOperation[]>([]);
  const [sparePartRowsByListId, setSparePartRowsByListId] = useState<Record<string, GeneralTaskListSparePart[]>>({
    'GRP-PUMP-001': [
      { partNumber: 'SEAL-MEC-35', description: 'Mechanical Seal 35mm', quantity: '1', uom: 'pcs', linkedTaskList: '0020', criticality: 'A', availability: 'In Stock' },
      { partNumber: 'GRS-EP2-1KG', description: 'Grease EP2 cartridge', quantity: '1', uom: 'kg', linkedTaskList: '0030', criticality: 'B', availability: 'Low Stock' },
    ],
    'GRP-CONV-002': [],
    'GRP-COMP-005': [],
  });
  const [newSparePartRows, setNewSparePartRows] = useState<GeneralTaskListSparePart[]>([]);
  const [sparePartDraft, setSparePartDraft] = useState<GeneralTaskListSparePart>({
    partNumber: '',
    description: '',
    quantity: '1',
    uom: 'pcs',
    linkedTaskList: '',
    criticality: 'B',
    availability: 'In Stock',
  });
  const [draggedOperationId, setDraggedOperationId] = useState<string | null>(null);
  const selectedList = taskLists.find((item) => item.id === selectedListId) || taskLists[0];
  const activeTaskList = isCreatingTaskList ? newTaskList : selectedList;
  const activeTaskListCode = isCreatingTaskList ? (newTaskList.id.trim().toUpperCase() || 'NEW-OPERATION') : activeTaskList.id;
  const activeOperationRows = isCreatingTaskList ? newOperationRows : operationRowsByListId[activeTaskList.id] ?? [];
  const activeTaskListCount = activeOperationRows.reduce((total, operation) => total + 1 + (operation.subOperations?.length ?? 0), 0);
  const activeSparePartRows = isCreatingTaskList ? newSparePartRows : sparePartRowsByListId[activeTaskList.id] ?? [];

  const filteredTaskLists = taskLists.filter((item) => {
    const query = taskSearch.toLowerCase();
    return item.id.toLowerCase().includes(query) || item.title.toLowerCase().includes(query);
  });

  const handleStartCreateTaskList = () => {
    setIsCreatingTaskList(true);
    setNewOperationRows([]);
    setNewSparePartRows([]);
    setSparePartDraft((prev) => ({ ...prev, partNumber: '', description: '', linkedTaskList: '' }));
    setOpenTaskListSections((prev) => ({ ...prev, information: true, operations: true, spareParts: true }));
  };

  const handleSelectTaskList = (id: string) => {
    setSelectedListId(id);
    setIsCreatingTaskList(false);
  };

  const handleSaveTaskList = () => {
    if (isCreatingTaskList) {
      if (!newTaskList.id.trim() || !newTaskList.title.trim()) {
        onNotify('Please enter an operations group and description before creating.', 'warning');
        return;
      }

      const taskListToCreate: GeneralTaskListSummary = {
        ...newTaskList,
        id: newTaskList.id.trim().toUpperCase(),
        title: newTaskList.title.trim(),
        date: '2026-05-22',
      };

      setTaskLists((prev) => [taskListToCreate, ...prev.filter((item) => item.id !== taskListToCreate.id)]);
      setOperationRowsByListId((prev) => ({ ...prev, [taskListToCreate.id]: newOperationRows }));
      setSparePartRowsByListId((prev) => ({ ...prev, [taskListToCreate.id]: newSparePartRows }));
      setSelectedListId(taskListToCreate.id);
      setIsCreatingTaskList(false);
      onNotify(`Operations ${taskListToCreate.id} created.`, 'success');
      return;
    }

    onNotify('General operations saved as template.', 'success');
  };

  const getNextOperationId = (operations: TaskListOperation[]) => {
    const nextNumber = operations.reduce((highest, operation) => Math.max(highest, Number(operation.op) || 0), 0) + 10;
    return String(nextNumber).padStart(4, '0');
  };

  const handleAddGeneralTaskListOperation = () => {
    const updateRows = (prev: TaskListOperation[]) => [
      ...prev,
      {
        op: getNextOperationId(prev),
        description: '',
        workCenter: 'MECH-0',
        duration: '15 min',
        skill: 'Mechanical L1',
      },
    ];

    if (isCreatingTaskList) {
      setNewOperationRows(updateRows);
      return;
    }

    setOperationRowsByListId((prev) => ({
      ...prev,
      [activeTaskList.id]: updateRows(prev[activeTaskList.id] ?? []),
    }));
  };

  const handleAddGeneralSparePart = () => {
    const partNumber = sparePartDraft.partNumber.trim().toUpperCase();
    const description = sparePartDraft.description.trim();
    if (!partNumber || !description) {
      onNotify('Please enter a part number and description before adding a spare part.', 'warning');
      return;
    }

    const newPart: GeneralTaskListSparePart = {
      ...sparePartDraft,
      partNumber,
      description,
      quantity: sparePartDraft.quantity.trim() || '1',
      uom: sparePartDraft.uom.trim() || 'pcs',
      linkedTaskList: sparePartDraft.linkedTaskList || activeOperationRows[0]?.op || '-',
    };

    const addPart = (rows: GeneralTaskListSparePart[]) => [...rows, newPart];
    if (isCreatingTaskList) {
      setNewSparePartRows(addPart);
    } else {
      setSparePartRowsByListId((prev) => ({
        ...prev,
        [activeTaskList.id]: addPart(prev[activeTaskList.id] ?? []),
      }));
    }

    setSparePartDraft((prev) => ({ ...prev, partNumber: '', description: '', quantity: '1', linkedTaskList: activeOperationRows[0]?.op || '' }));
    setOpenTaskListSections((prev) => ({ ...prev, spareParts: true }));
    onNotify(`Spare part ${partNumber} added.`, 'success');
  };

  const handleAddGeneralSubOperation = (operationId: string) => {
    const updateRows = (rows: TaskListOperation[]) => rows.map((operation) => {
      if (operation.op !== operationId) return operation;
      const nextSubOperationNumber = (operation.subOperations?.length ?? 0) + 1;
      return {
        ...operation,
        subOperations: [
          ...(operation.subOperations ?? []),
          {
            op: `${operation.op}.${nextSubOperationNumber}`,
            description: 'New suboperation',
            workCenter: operation.workCenter,
            duration: '10 min',
            skill: operation.skill,
          },
        ],
      };
    });

    if (isCreatingTaskList) {
      setNewOperationRows(updateRows);
      return;
    }

    setOperationRowsByListId((prev) => ({
      ...prev,
      [activeTaskList.id]: updateRows(prev[activeTaskList.id] ?? []),
    }));
  };

  const handleRemoveGeneralSubOperation = (operationId: string, subOperationId: string) => {
    const updateRows = (rows: TaskListOperation[]) => rows.map((operation) => (
      operation.op === operationId
        ? { ...operation, subOperations: operation.subOperations?.filter((subOperation) => subOperation.op !== subOperationId) }
        : operation
    ));

    if (isCreatingTaskList) {
      setNewOperationRows(updateRows);
      return;
    }

    setOperationRowsByListId((prev) => ({
      ...prev,
      [activeTaskList.id]: updateRows(prev[activeTaskList.id] ?? []),
    }));
  };

  const handleRemoveGeneralTaskListOperation = (operationId: string) => {
    const updateRows = (rows: TaskListOperation[]) => rows.filter((operation) => operation.op !== operationId);

    if (isCreatingTaskList) {
      setNewOperationRows(updateRows);
      return;
    }

    setOperationRowsByListId((prev) => ({
      ...prev,
      [activeTaskList.id]: updateRows(prev[activeTaskList.id] ?? []),
    }));
  };

  const moveGeneralTaskListOperation = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    const reorderRows = (rows: TaskListOperation[]) => {
      const sourceIndex = rows.findIndex((operation) => operation.op === sourceId);
      const targetIndex = rows.findIndex((operation) => operation.op === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return rows;

      const nextRows = [...rows];
      const [movedOperation] = nextRows.splice(sourceIndex, 1);
      nextRows.splice(targetIndex, 0, movedOperation);
      return nextRows;
    };

    if (isCreatingTaskList) {
      setNewOperationRows(reorderRows);
      return;
    }

    setOperationRowsByListId((prev) => ({
      ...prev,
      [activeTaskList.id]: reorderRows(prev[activeTaskList.id] ?? []),
    }));
  };

  const actionButtonSx = {
    height: 34,
    px: 1.4,
    borderRadius: '8px',
    borderColor: tokenDivider,
    color: tokenBrand.main,
    bgcolor: 'transparent',
    textTransform: 'none',
    fontWeight: 500,
    fontSize: '0.8125rem',
    whiteSpace: 'nowrap',
    boxShadow: 'none',
    '&:hover': {
      bgcolor: tokenBrand.softBg,
      borderColor: tokenBrand.dark,
      boxShadow: 'none',
    },
  } as const;

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      height: 34,
      borderRadius: '8px',
      bgcolor: activeTheme.backgroundPaper,
      color: tokenText.primary,
      fontSize: '0.82rem',
      '& fieldset': { borderColor: tokenDivider },
      '&:hover fieldset': { borderColor: tokenBrand.light },
      '&.Mui-focused fieldset': { borderColor: tokenBrand.main, borderWidth: 1 },
      '&.Mui-disabled': {
        bgcolor: activeTheme.backgroundDefault,
        color: tokenText.disabled,
        '& fieldset': { borderColor: tokenDivider },
      },
    },
    '& .MuiOutlinedInput-input': { py: 0.75, px: 1.1, fontWeight: 400, letterSpacing: '0.15px' },
    '& .MuiOutlinedInput-input.Mui-disabled': {
      WebkitTextFillColor: tokenText.disabled,
    },
    '& .MuiSelect-select': { py: 0.75, px: 1.1, fontWeight: 400, letterSpacing: '0.15px' },
    '& .MuiSelect-select.Mui-disabled': {
      WebkitTextFillColor: tokenText.disabled,
    },
  } as const;

  const fieldLabelSx = {
    color: tokenText.secondary,
    fontWeight: 700,
    fontSize: '0.72rem',
    lineHeight: 1.2,
    mb: 0.55,
  } as const;

  const tableHeaderSx = {
    color: tokenText.secondary,
    fontWeight: 500,
    fontSize: '0.875rem',
    px: 1,
    py: 0.8,
    borderBottom: `1px solid ${tokenDivider}`,
    whiteSpace: 'nowrap',
  } as const;

  const tableCellSx = {
    color: tokenText.primary,
    fontWeight: 500,
    fontSize: '0.72rem',
    px: 1,
    py: 0.7,
    borderBottom: `1px solid ${tokenDivider}`,
    minWidth: 0,
  } as const;

  const operationGridColumns = '28px 78px 220px 100px 80px 150px 170px 230px 190px 120px 142px 48px';
  const operationTableHeaders = ['', 'Task List #', 'Description', 'Duration', 'Tech #', 'Skill', 'Tools', 'Inspection Points', 'Notes', 'Attachments', 'Supplier Source', ''];
  const getVisibleOperationCells = (operation: TaskListOperation) => [
    operation.description,
    operation.duration,
    '1',
    operation.skill,
    'Manual tools',
    'Inspection required',
    '',
    'Manual',
  ];

  const versionRowsByListId: Record<string, string[][]> = {
    'GRP-PUMP-001': [
      ['v3.2', 'Updated frequency from 6M → Quarterly per supplier revision B', 'AI Extraction', '2026-04-12'],
      ['v3.1', 'Added vibration analysis task list (0040)', 'M. Rivera', '2026-02-08'],
      ['v3.0', 'Initial import from Grundfos_CR15_Manual.pdf rev. A', 'Supplier Import', '2025-11-15'],
      ['v2.4', 'Linked to assets EQ-1023, EQ-1041', 'J. Tan', '2025-08-03'],
    ],
    'GRP-CONV-002': [],
    'GRP-COMP-005': [],
  };

  const activeVersionRows = isCreatingTaskList ? [] : versionRowsByListId[activeTaskList.id] ?? [];
  const getLinkedTaskListLabel = (operationId: string) => {
    const linkedOperation = activeOperationRows.find((operation) => operation.op === operationId);
    return linkedOperation?.description ? `${operationId} - ${linkedOperation.description}` : operationId;
  };

  const sectionRows: Array<{
    key: string;
    icon: React.ReactNode;
    title: string;
    value: string;
    helper?: string;
  }> = [
      { key: 'information', icon: <DocumentIcon sx={{ fontSize: 16 }} />, title: 'General Operations Information', value: '12 fields' },
      { key: 'operations', icon: <ListIcon sx={{ fontSize: 16 }} />, title: `Task List for ${activeTaskListCode}`, value: String(activeTaskListCount) },
      { key: 'spareParts', icon: <InventoryIcon sx={{ fontSize: 16 }} />, title: `Required Spare Parts for ${activeTaskListCode}`, value: String(activeSparePartRows.length), helper: "Aggregated from this operation's task lists" },
      { key: 'history', icon: <HistoryIcon sx={{ fontSize: 16 }} />, title: `Version History for ${activeTaskListCode}`, value: String(activeVersionRows.length) },
    ];

  return (
    <Box sx={{ height: '100%', minHeight: 'calc(100vh - 132px)', bgcolor: tokenNeutral.lighter, display: 'flex', gap: 2, fontFamily: '"Roboto", "Inter", "Segoe UI", sans-serif' }}>
      <Box
        sx={{
          width: { xs: '100%', md: 276 },
          flexShrink: 0,
          border: `1px solid ${tokenDivider}`,
          borderRadius: '16px',
          bgcolor: activeTheme.backgroundPaper,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          p: 1.25,
          gap: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.4, py: 0.6 }}>
          <Typography variant="subtitle2" sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.875rem', letterSpacing: '0.1px' }}>Operations</Typography>
          <Typography variant="caption" sx={{ color: tokenBrand.main, fontWeight: 700 }}>{taskLists.length}</Typography>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleStartCreateTaskList}
          sx={{
            minHeight: 32,
            borderRadius: '8px',
            bgcolor: tokenBrand.main,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.8125rem',
            boxShadow: 'none',
            '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
          }}
        >
          Create Operations
        </Button>

        <TextField
          size="small"
          value={taskSearch}
          onChange={(event) => setTaskSearch(event.target.value)}
          placeholder="Search group or description..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: activeTheme.textSecondary, fontSize: 17 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              height: 34,
              borderRadius: '8px',
              bgcolor: activeTheme.backgroundDefault,
              fontSize: '0.8rem',
              '& fieldset': { borderColor: tokenDivider },
            },
          }}
        />

        <FormControl size="small" fullWidth>
          <Select
            value="All statuses"
            IconComponent={ExpandMoreIcon}
            sx={{
              height: 32,
              borderRadius: '8px',
              bgcolor: activeTheme.backgroundPaper,
              color: tokenText.primary,
              fontSize: '0.78rem',
              '& fieldset': { borderColor: tokenDivider },
              '& .MuiSelect-select': { py: 0.6 },
            }}
          >
            <MenuItem value="All statuses">All statuses</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 0.5 }}>
          {filteredTaskLists.map((item) => {
            const isSelected = item.id === selectedListId;
            const itemTaskCount = (operationRowsByListId[item.id] ?? []).reduce((total, operation) => total + 1 + (operation.subOperations?.length ?? 0), 0);
            const itemSparePartCount = sparePartRowsByListId[item.id]?.length ?? 0;
            const itemVersionCount = versionRowsByListId[item.id]?.length ?? 0;
            return (
              <Paper
                key={item.id}
                elevation={0}
                onClick={() => handleSelectTaskList(item.id)}
                sx={{
                  p: 1.1,
                  minHeight: 98,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  border: isSelected ? `1px solid ${tokenBrand.main}` : `1px solid ${tokenDivider}`,
                  bgcolor: isSelected ? tokenBrand.softBg : activeTheme.backgroundPaper,
                  boxShadow: 'none',
                  transition: 'background-color 180ms ease, border-color 180ms ease',
                  '&:hover': { bgcolor: isSelected ? tokenBrand.softBg : activeTheme.backgroundDefault },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.6 }}>
                  <Typography variant="caption" sx={{ color: isSelected ? tokenBrand.main : activeTheme.textSecondary, fontWeight: 700, letterSpacing: 0 }}>{item.id}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isSelected ? (
                      <Chip label="Selected" size="small" sx={{ height: 19, borderRadius: 999, fontSize: '0.62rem', fontWeight: 700, bgcolor: tokenBrand.main, color: tokenBrand.contrast }} />
                    ) : null}
                    <Chip label={item.status} size="small" sx={{ height: 19, borderRadius: 999, fontSize: '0.63rem', fontWeight: 700, ...statusChipSx(item.status) }} />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 400, fontSize: '0.875rem', lineHeight: 1.43, letterSpacing: '0.17px' }}>
                  {item.title}
                </Typography>
                <Box sx={{ mt: 0.85, display: 'flex', alignItems: 'center', gap: 0.65, flexWrap: 'wrap' }}>
                  <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 700, fontSize: '0.66rem' }}>
                    {itemTaskCount} tasks
                  </Typography>
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: tokenNeutral.darkest }} />
                  <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 700, fontSize: '0.66rem' }}>
                    {itemSparePartCount} spare parts
                  </Typography>
                  <Box sx={{ width: 3, height: 3, borderRadius: '50%', bgcolor: tokenNeutral.darkest }} />
                  <Typography variant="caption" sx={{ color: activeTheme.textSecondary, fontWeight: 700, fontSize: '0.66rem' }}>
                    {itemVersionCount} versions
                  </Typography>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        <Paper
          elevation={0}
          sx={{
            mb: 1.5,
            px: 2,
            py: 1.7,
            border: `1px solid ${tokenDivider}`,
            borderRadius: '16px',
            bgcolor: activeTheme.backgroundPaper,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 1.4,
            flexWrap: 'wrap',
            boxShadow: 'none',
          }}
        >
          <Box sx={{ minWidth: 260, flex: '1 1 420px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap', mb: 0.55 }}>
              <Typography variant="subtitle2" sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.875rem', letterSpacing: '0.1px' }}>
                Operation: {activeTaskListCode} / Counter 1
              </Typography>
              <Chip label={activeTaskList.status} size="small" sx={{ height: 22, borderRadius: 999, fontSize: '0.66rem', fontWeight: 700, ...statusChipSx(activeTaskList.status) }} />
            </Box>
            <Typography variant="body2" sx={{ color: tokenText.primary, fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.43, letterSpacing: '0.17px', mb: 0.6 }}>
              {activeTaskList.title || 'New operation description'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexWrap: 'wrap' }}>
              {[
                activeTaskList.status,
                `${activeTaskListCount} task lists`,
                `${activeSparePartRows.length} spare parts`,
                `${activeVersionRows.length} version history entries`,
                `Updated ${activeTaskList.date}`,
              ].map((item, index) => (
                <React.Fragment key={item}>
                  {index > 0 ? <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: tokenNeutral.darkest }} /> : null}
                  <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.3, letterSpacing: '0.4px' }}>
                    {item}
                  </Typography>
                </React.Fragment>
              ))}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button variant="outlined" size="small" startIcon={<UploadIcon />} onClick={() => onNotify('Supplier file upload opened.')} sx={actionButtonSx}>Upload Supplier File</Button>
            <Button variant="outlined" size="small" startIcon={<LinkIcon />} onClick={() => onNotify('Reference equipment linker opened.')} sx={actionButtonSx}>Link Reference Equipment <Box component="span" sx={{ color: activeTheme.textSecondary, ml: 0.4 }}>(optional)</Box></Button>
            <Button variant="outlined" size="small" startIcon={<CloneIcon />} onClick={() => onNotify('Operations duplicated.', 'success')} sx={actionButtonSx}>Duplicate</Button>
            <Button variant="outlined" size="small" startIcon={<ArchiveIcon />} onClick={() => onNotify('Operations archived.')} sx={actionButtonSx}>Archive</Button>
            <Button variant="outlined" size="small" startIcon={<PreviewIcon />} onClick={() => onNotify('Preview opened.')} sx={actionButtonSx}>Show Preview</Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<SaveIcon />}
              onClick={handleSaveTaskList}
              sx={{
                height: 36,
                borderRadius: '8px',
                px: 1.6,
                bgcolor: tokenBrand.main,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.8125rem',
                boxShadow: 'none',
                '&:hover': { bgcolor: tokenBrand.dark, boxShadow: 'none' },
              }}
            >
              {isCreatingTaskList ? 'Create Operations' : 'Save as Template'}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={onBack}
              sx={{ ...actionButtonSx, bgcolor: activeTheme.backgroundPaper }}
            >
              Back
            </Button>
          </Box>
        </Paper>

        <Box sx={{ pb: 2 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: activeTheme.backgroundPaper,
              overflow: 'hidden',
              boxShadow: 'none',
            }}
          >
            <Box
              sx={{
                px: 1.4,
                py: 1.1,
                borderBottom: `1px solid ${tokenDivider}`,
                bgcolor: activeTheme.backgroundPaper,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                flexWrap: 'wrap',
              }}
            >
              <Box>
                <Typography variant="subtitle2" sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.875rem', letterSpacing: '0.1px' }}>
                  Selected Operation Details
                </Typography>
                <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.75rem', mt: 0.25, display: 'block', letterSpacing: '0.4px' }}>
                  All sections below are scoped to {activeTaskListCode}
                </Typography>
              </Box>
              <Chip label={`${activeTaskListCount + activeSparePartRows.length + activeVersionRows.length} related records`} size="small" sx={{ height: 24, borderRadius: 999, bgcolor: activeTheme.backgroundDefault, color: activeTheme.textSecondary, border: `1px solid ${tokenDivider}`, fontWeight: 700, fontSize: '0.68rem' }} />
            </Box>

            <Box sx={{ p: 2, bgcolor: activeTheme.backgroundDefault }}>
              <Box
                sx={{
                  px: 2,
                  py: 1.5,
                  mb: 1.5,
                  minHeight: 76,
                  borderRadius: '12px',
                  bgcolor: tokenNeutral.lightest,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <SparkleIcon sx={{ color: tokenBrand.main, fontSize: 16 }} />
                  <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '0.875rem' }}>BD Atlas IA</Typography>
                  <Typography variant="caption" sx={{ color: tokenText.disabled, fontSize: '0.75rem', fontWeight: 400 }}>
                    From Grundfos_CR15_Maintenance_Manual.pdf
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[
                    'Add lubrication interval @ 500h runtime',
                    "Required skill: Add 'Certified Pump Tech'",
                    'Spare part SEAL-MEC-35 typically replaced every 2 cycles',
                    'Safety: include hot-work permit if temperature > 60°C',
                  ].map((recommendation) => (
                    <Chip
                      key={recommendation}
                      label={recommendation}
                      clickable
                      onClick={() => onNotify(`BD Atlas IA action applied: ${recommendation}`, 'success')}
                      onDelete={() => onNotify('BD Atlas IA recommendation dismissed.')}
                      size="small"
                      sx={{
                        height: 27,
                        borderRadius: '6px',
                        bgcolor: 'rgba(0,0,0,0.03)',
                        color: tokenText.secondary,
                        fontSize: '0.75rem',
                        border: `1px solid ${tokenDivider}`,
                        fontWeight: 400,
                        cursor: 'pointer',
                        transition: 'background-color 180ms ease, border-color 180ms ease',
                        '&:hover': {
                          bgcolor: tokenBrand.softBg,
                          borderColor: tokenBrand.main,
                        },
                        '& .MuiChip-deleteIcon': { fontSize: 15, color: activeTheme.textSecondary },
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.9 }}>
            {sectionRows.map((section) => {
              const isOpen = !!openTaskListSections[section.key];

              return (
              <Paper
                key={section.key}
                elevation={0}
                sx={{
                  borderRadius: '8px',
                  border: `1px solid ${tokenDivider}`,
                  bgcolor: activeTheme.backgroundPaper,
                  overflow: 'hidden',
                  boxShadow: 'none',
                  transition: 'background-color 180ms ease, border-color 180ms ease',
                }}
              >
                <Box
                  onClick={() => setOpenTaskListSections((prev) => ({ ...prev, [section.key]: !prev[section.key] }))}
                  sx={{
                    minHeight: 48,
                    px: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    cursor: 'pointer',
                    bgcolor: activeTheme.backgroundPaper,
                    '&:hover': { bgcolor: activeTheme.backgroundDefault },
                    '&:focus-visible': { outline: `2px solid ${tokenBrand.main}`, outlineOffset: -2 },
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setOpenTaskListSections((prev) => ({ ...prev, [section.key]: !prev[section.key] }));
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    {isOpen ? (
                      <ExpandMoreIcon sx={{ color: tokenText.secondary, fontSize: 18 }} />
                    ) : (
                      <ChevronRightIcon sx={{ color: tokenText.secondary, fontSize: 18 }} />
                    )}
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: '6px',
                        bgcolor: activeTheme.backgroundDefault,
                        color: isOpen ? tokenBrand.main : tokenText.secondary,
                        display: 'grid',
                        placeItems: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {section.icon}
                    </Box>
                    <Typography variant="subtitle2" sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.875rem', letterSpacing: '0.1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {section.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.4px' }}>
                      {section.value}
                    </Typography>
                  </Box>
                  {section.helper ? (
                    <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, display: { xs: 'none', sm: 'block' } }}>
                      {section.helper}
                    </Typography>
                  ) : null}
                </Box>

                <Collapse in={!!openTaskListSections[section.key]} timeout="auto" unmountOnExit>
                  {section.key === 'information' ? (
                    <Box sx={{ borderTop: `1px solid ${tokenDivider}`, p: 2, bgcolor: activeTheme.backgroundDefault }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 1.2,
                          flexWrap: 'wrap',
                          mb: 1.3,
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.57, letterSpacing: '0.1px' }}>
                            General operation master data
                          </Typography>
                          <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.75rem', mt: 0.25, display: 'block', letterSpacing: '0.4px' }}>
                            Core SAP-style fields scoped to {activeTaskListCode}
                          </Typography>
                        </Box>
                        <Chip
                          label={isCreatingTaskList ? 'Editable draft' : 'Template source'}
                          size="small"
                          sx={{
                            height: 24,
                            borderRadius: 999,
                            bgcolor: activeTheme.backgroundPaper,
                            color: activeTheme.textSecondary,
                            border: `1px solid ${tokenDivider}`,
                            fontWeight: 500,
                            fontSize: '0.75rem',
                          }}
                        />
                      </Box>
                      <Paper elevation={0} sx={{ p: 2, border: `1px solid ${tokenDivider}`, borderRadius: '12px', bgcolor: activeTheme.backgroundPaper }}>
                      <Grid container spacing={1.4}>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={fieldLabelSx}>Group <Box component="span" sx={{ color: tokenError.main }}>*</Box></Typography>
                          <TextField
                            fullWidth
                            size="small"
                            value={activeTaskList.id}
                            onChange={(event) => setNewTaskList((prev) => ({ ...prev, id: event.target.value }))}
                            disabled={!isCreatingTaskList}
                            sx={inputSx}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={fieldLabelSx}>Group Counter <Box component="span" sx={{ color: tokenError.main }}>*</Box></Typography>
                          <TextField fullWidth size="small" value="1" disabled sx={inputSx} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }} />
                        <Grid size={{ xs: 12, md: 8 }}>
                          <Typography sx={fieldLabelSx}>
                            Operations Description <Box component="span" sx={{ color: tokenError.main }}>*</Box>
                            <Chip label="Supplier" size="small" variant="outlined" sx={{ ml: 0.6, height: 18, borderRadius: 999, fontSize: '0.62rem', fontWeight: 700 }} />
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            value={activeTaskList.title}
                            placeholder="Describe the maintenance operations"
                            onChange={(event) => setNewTaskList((prev) => ({ ...prev, title: event.target.value }))}
                            disabled={!isCreatingTaskList}
                            sx={inputSx}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={fieldLabelSx}>Planning Plant</Typography>
                          <TextField fullWidth size="small" value="PL-SD-01" disabled sx={inputSx} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={fieldLabelSx}>Work Center <Box component="span" sx={{ color: tokenError.main }}>*</Box></Typography>
                          <TextField fullWidth size="small" value="MECH-01" disabled sx={inputSx} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={fieldLabelSx}>Usage</Typography>
                          <TextField fullWidth size="small" value="4 - Plant Maintenance" disabled sx={inputSx} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={fieldLabelSx}>Planner Group</Typography>
                          <TextField fullWidth size="small" value="PG-MEC" disabled sx={inputSx} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={fieldLabelSx}>System Condition</Typography>
                          <TextField fullWidth size="small" value="0 - Shutdown" disabled sx={inputSx} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={fieldLabelSx}>
                            Maintenance Strategy
                            <Chip label="Supplier" size="small" variant="outlined" sx={{ ml: 0.6, height: 18, borderRadius: 999, fontSize: '0.62rem', fontWeight: 700 }} />
                          </Typography>
                          <TextField fullWidth size="small" value="QUARTERLY" disabled sx={inputSx} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={fieldLabelSx}>
                            Assembly
                            <Chip label="Supplier" size="small" variant="outlined" sx={{ ml: 0.6, height: 18, borderRadius: 999, fontSize: '0.62rem', fontWeight: 700 }} />
                          </Typography>
                          <TextField fullWidth size="small" value="PUMP-CENTRIF-100" disabled sx={inputSx} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                          <Typography sx={fieldLabelSx}>Status</Typography>
                          <FormControl fullWidth size="small" sx={inputSx}>
                            <Select
                              value={activeTaskList.status}
                              IconComponent={ExpandMoreIcon}
                              disabled={!isCreatingTaskList}
                              onChange={(event) => setNewTaskList((prev) => ({ ...prev, status: event.target.value as GeneralTaskListSummary['status'] }))}
                            >
                              <MenuItem value="Active">Active</MenuItem>
                              <MenuItem value="Draft">Draft</MenuItem>
                              <MenuItem value="Archived">Archived</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', alignItems: 'flex-end' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, height: 37 }}>
                            <Checkbox disabled size="small" sx={{ p: 0 }} />
                            <Typography variant="body2" sx={{ color: activeTheme.textSecondary, fontSize: '0.78rem', fontWeight: 500 }}>Deletion Flag</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                      </Paper>
                    </Box>
                  ) : null}

                  {section.key === 'operations' ? (
                    <Box sx={{ borderTop: `1px solid ${tokenDivider}`, bgcolor: activeTheme.backgroundPaper }}>
                      <Box sx={{ px: 1.2, py: 0.9, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap', bgcolor: activeTheme.backgroundDefault, borderBottom: `1px solid ${tokenDivider}` }}>
                        <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap' }}>
                          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddGeneralTaskListOperation} sx={actionButtonSx}>Add Task List</Button>
                          <Button variant="outlined" size="small" startIcon={<UploadIcon />} sx={actionButtonSx}>Import from Supplier File</Button>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4, flexWrap: 'wrap' }}>
                          {[
                            ['Supplier', tokenText.secondary],
                            ['BD Atlas IA', tokenBrand.main],
                            ['Manual', tokenText.secondary],
                          ].map(([label, color]) => (
                            <Box key={label} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
                              <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400 }}>
                                {label}
                              </Typography>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ overflowX: 'auto' }}>
                        <Box sx={{ minWidth: 1320 }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: operationGridColumns, bgcolor: activeTheme.backgroundDefault }}>
                            {operationTableHeaders.map((label) => (
                              <Box key={label} sx={tableHeaderSx}>{label}</Box>
                            ))}
                          </Box>
                          {activeOperationRows.map((operation) => (
                            <React.Fragment key={operation.op}>
                              <Box
                                draggable
                                onDragStart={(event) => {
                                  setDraggedOperationId(operation.op);
                                  event.dataTransfer.effectAllowed = 'move';
                                  event.dataTransfer.setData('text/plain', operation.op);
                                }}
                                onDragEnd={() => setDraggedOperationId(null)}
                                onDragOver={(event) => {
                                  if (!draggedOperationId || draggedOperationId === operation.op) return;
                                  event.preventDefault();
                                  event.dataTransfer.dropEffect = 'move';
                                }}
                                onDrop={(event) => {
                                  event.preventDefault();
                                  const sourceId = event.dataTransfer.getData('text/plain') || draggedOperationId;
                                  if (sourceId) moveGeneralTaskListOperation(sourceId, operation.op);
                                  setDraggedOperationId(null);
                                }}
                                sx={{
                                  display: 'grid',
                                  gridTemplateColumns: operationGridColumns,
                                  alignItems: 'center',
                                  cursor: 'grab',
                                  opacity: draggedOperationId === operation.op ? 0.56 : 1,
                                  bgcolor: draggedOperationId === operation.op ? tokenBrand.softBg : 'transparent',
                                  '&:nth-of-type(odd)': { bgcolor: draggedOperationId === operation.op ? tokenBrand.softBg : activeTheme.backgroundDefault },
                                  '&:active': { cursor: 'grabbing' },
                                }}
                              >
                                <Box sx={{ ...tableCellSx, color: tokenText.disabled, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DragIndicatorIcon sx={{ fontSize: 16 }} /></Box>
                                <Box sx={tableCellSx}><Chip label={operation.op} size="small" sx={{ height: 24, borderRadius: '6px', bgcolor: tokenNeutral.lighter, color: tokenText.primary, fontSize: '0.75rem', fontWeight: 500 }} /></Box>
                                {getVisibleOperationCells(operation).map((value, index) => (
                                  <Box key={`${operation.op}-${index}`} sx={tableCellSx}>
                                    <Chip
                                      label={value || '-'}
                                      size="small"
                                      sx={{
                                        maxWidth: '100%',
                                        height: 24,
                                        borderRadius: '6px',
                                        bgcolor: activeTheme.backgroundDefault,
                                        color: tokenText.secondary,
                                        fontSize: '0.75rem',
                                        fontWeight: 400,
                                        '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                                      }}
                                    />
                                  </Box>
                                ))}
                                <Box sx={tableCellSx}>
                                  <Button
                                    size="small"
                                    startIcon={<AddIcon sx={{ fontSize: 15 }} />}
                                    onClick={() => handleAddGeneralSubOperation(operation.op)}
                                    sx={{ minWidth: 0, px: 0.7, color: tokenBrand.main, fontSize: '0.8125rem', fontWeight: 500, textTransform: 'none', borderRadius: '8px', '&:hover': { bgcolor: tokenBrand.softBg } }}
                                  >
                                    Suboperation
                                  </Button>
                                </Box>
                                <Box sx={{ ...tableCellSx, color: activeTheme.textSecondary }}>
                                  <IconButton
                                    aria-label={`Delete task list ${operation.op}`}
                                    size="small"
                                    onClick={() => handleRemoveGeneralTaskListOperation(operation.op)}
                                    sx={{ width: 26, height: 26, color: tokenError.main, '&:hover': { bgcolor: tokenError.softBg } }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Box>
                              </Box>
                              {operation.subOperations?.map((subOperation) => (
                                <Box key={subOperation.op} sx={{ display: 'grid', gridTemplateColumns: operationGridColumns, alignItems: 'center', bgcolor: activeTheme.backgroundDefault }}>
                                  <Box sx={{ ...tableCellSx, color: tokenText.disabled, pl: 2 }}><ChevronRightIcon sx={{ fontSize: 16 }} /></Box>
                                  <Box sx={tableCellSx}><Chip label={subOperation.op} size="small" sx={{ height: 24, borderRadius: '6px', bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontSize: '0.75rem', fontWeight: 500 }} /></Box>
                                  {getVisibleOperationCells(subOperation).map((value, index) => (
                                    <Box key={`${subOperation.op}-${index}`} sx={tableCellSx}>
                                      <Chip
                                        label={value || '-'}
                                        size="small"
                                        sx={{
                                          maxWidth: '100%',
                                          height: 24,
                                          borderRadius: '6px',
                                          bgcolor: activeTheme.backgroundPaper,
                                          color: activeTheme.textSecondary,
                                          fontSize: '0.75rem',
                                          fontWeight: 400,
                                          '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                                        }}
                                      />
                                    </Box>
                                  ))}
                                  <Box sx={tableCellSx}>
                                    <Chip label="Suboperation" size="small" sx={{ height: 22, borderRadius: 999, bgcolor: tokenNeutral.lighter, color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400 }} />
                                  </Box>
                                  <Box sx={{ ...tableCellSx, color: activeTheme.textSecondary }}>
                                    <IconButton size="small" onClick={() => handleRemoveGeneralSubOperation(operation.op, subOperation.op)} sx={{ width: 26, height: 26, color: tokenError.main, '&:hover': { bgcolor: tokenError.softBg } }}>
                                      <DeleteIcon sx={{ fontSize: 16 }} />
                                    </IconButton>
                                  </Box>
                                </Box>
                              ))}
                            </React.Fragment>
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  ) : null}

                  {section.key === 'spareParts' ? (
                    <Box sx={{ borderTop: `1px solid ${tokenDivider}` }}>
                      <Box sx={{ px: 1.2, py: 0.9, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.4fr 90px 90px 160px 130px 150px auto' }, gap: 0.8, alignItems: 'end', bgcolor: activeTheme.backgroundDefault, borderBottom: `1px solid ${tokenDivider}` }}>
                        <TextField
                          size="small"
                          label="Part #"
                          value={sparePartDraft.partNumber}
                          onChange={(event) => setSparePartDraft((prev) => ({ ...prev, partNumber: event.target.value }))}
                          sx={inputSx}
                        />
                        <TextField
                          size="small"
                          label="Description"
                          value={sparePartDraft.description}
                          onChange={(event) => setSparePartDraft((prev) => ({ ...prev, description: event.target.value }))}
                          sx={inputSx}
                        />
                        <TextField
                          size="small"
                          label="Qty"
                          value={sparePartDraft.quantity}
                          onChange={(event) => setSparePartDraft((prev) => ({ ...prev, quantity: event.target.value }))}
                          sx={inputSx}
                        />
                        <TextField
                          size="small"
                          label="UoM"
                          value={sparePartDraft.uom}
                          onChange={(event) => setSparePartDraft((prev) => ({ ...prev, uom: event.target.value }))}
                          sx={inputSx}
                        />
                        <FormControl size="small" sx={inputSx}>
                          <InputLabel>Linked Task</InputLabel>
                          <Select
                            label="Linked Task"
                            value={sparePartDraft.linkedTaskList}
                            onChange={(event) => setSparePartDraft((prev) => ({ ...prev, linkedTaskList: event.target.value }))}
                            IconComponent={ExpandMoreIcon}
                          >
                            <MenuItem value="">First task list</MenuItem>
                            {activeOperationRows.map((operation) => (
                              <MenuItem key={operation.op} value={operation.op}>{operation.op}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={inputSx}>
                          <InputLabel>Criticality</InputLabel>
                          <Select
                            label="Criticality"
                            value={sparePartDraft.criticality}
                            onChange={(event) => setSparePartDraft((prev) => ({ ...prev, criticality: event.target.value }))}
                            IconComponent={ExpandMoreIcon}
                          >
                            <MenuItem value="A">A</MenuItem>
                            <MenuItem value="B">B</MenuItem>
                            <MenuItem value="C">C</MenuItem>
                          </Select>
                        </FormControl>
                        <FormControl size="small" sx={inputSx}>
                          <InputLabel>Availability</InputLabel>
                          <Select
                            label="Availability"
                            value={sparePartDraft.availability}
                            onChange={(event) => setSparePartDraft((prev) => ({ ...prev, availability: event.target.value }))}
                            IconComponent={ExpandMoreIcon}
                          >
                            <MenuItem value="In Stock">In Stock</MenuItem>
                            <MenuItem value="Low Stock">Low Stock</MenuItem>
                            <MenuItem value="Out of Stock">Out of Stock</MenuItem>
                          </Select>
                        </FormControl>
                        <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddGeneralSparePart} sx={{ ...actionButtonSx, height: 37 }}>
                          Add Spare Part
                        </Button>
                      </Box>
                      <Box sx={{ overflowX: 'auto' }}>
                      <Box sx={{ minWidth: 1120 }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr 0.45fr 0.55fr 1.45fr 0.75fr 0.85fr', bgcolor: activeTheme.backgroundDefault }}>
                          {['Part #', 'Description', 'Qty', 'UoM', 'Linked Task List', 'Criticality', 'Availability'].map((label) => (
                            <Box key={label} sx={tableHeaderSx}>{label}</Box>
                          ))}
                        </Box>
                        {activeSparePartRows.map((row) => (
                          <Box key={row.partNumber} sx={{ display: 'grid', gridTemplateColumns: '1.1fr 1.6fr 0.45fr 0.55fr 1.45fr 0.75fr 0.85fr', alignItems: 'center' }}>
                            <Box sx={tableCellSx}>{row.partNumber}</Box>
                            <Box sx={tableCellSx}>{row.description}</Box>
                            <Box sx={tableCellSx}>{row.quantity}</Box>
                            <Box sx={tableCellSx}>{row.uom}</Box>
                            <Box sx={tableCellSx}><Chip label={getLinkedTaskListLabel(row.linkedTaskList)} size="small" sx={{ maxWidth: '100%', height: 22, borderRadius: '6px', bgcolor: tokenNeutral.lighter, color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} /></Box>
                            <Box sx={tableCellSx}>
                              <Chip
                                label={row.criticality}
                                size="small"
                                variant="outlined"
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  color: row.criticality === 'A' ? tokenError.main : tokenWarning.main,
                                  borderColor: row.criticality === 'A' ? tokenError.lightest : tokenWarning.lighter,
                                  bgcolor: row.criticality === 'A' ? tokenError.lightest : tokenWarning.lightest,
                                  '& .MuiChip-label': { px: 0 },
                                }}
                              />
                            </Box>
                            <Box sx={tableCellSx}>
                              <Chip
                                label={row.availability}
                                size="small"
                                sx={{
                                  height: 24,
                                  borderRadius: 999,
                                  color: row.availability === 'In Stock' ? tokenSuccess.darker : tokenWarning.dark,
                                  bgcolor: row.availability === 'In Stock' ? tokenSuccess.lightest : tokenWarning.lightest,
                                  fontWeight: 500,
                                  fontSize: '0.75rem',
                                }}
                              />
                            </Box>
                          </Box>
                        ))}
                      </Box>
                      </Box>
                    </Box>
                  ) : null}

                  {section.key === 'history' ? (
                    <Box sx={{ borderTop: `1px solid ${tokenDivider}`, p: 2, bgcolor: activeTheme.backgroundDefault, display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {activeVersionRows.map((row) => (
                        <Paper key={row[0]} elevation={0} sx={{ minHeight: 58, border: `1px solid ${tokenDivider}`, borderRadius: '12px', px: 2, py: 1.25, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, bgcolor: activeTheme.backgroundPaper }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                            <Chip label={row[0]} size="small" variant="outlined" sx={{ height: 25, borderRadius: 999, color: tokenText.primary, fontWeight: 500, bgcolor: activeTheme.backgroundPaper }} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 400, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{row[1]}</Typography>
                              <Typography variant="caption" sx={{ color: tokenText.secondary, fontWeight: 400, fontSize: '0.75rem', mt: 0.25, display: 'block' }}>{row[2]} - {row[3]}</Typography>
                            </Box>
                          </Box>
                          <Button size="small" onClick={() => onNotify(`${row[0]} restore selected.`)} sx={{ color: tokenBrand.main, textTransform: 'none', fontWeight: 500, fontSize: '0.8125rem' }}>
                            Restore
                          </Button>
                        </Paper>
                      ))}
                    </Box>
                  ) : null}
                </Collapse>
              </Paper>
              );
            })}
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

type MaintenancePlanProps = {
  initialAddDialogOpen?: boolean;
  onInitialAddDialogConsumed?: () => void;
  addDialogHostOnly?: boolean;
  addDialogOpen?: boolean;
  onAddDialogClose?: () => void;
  onNavigateToPlanner?: () => void;
};

export default function MaintenancePlan({
  initialAddDialogOpen = false,
  onInitialAddDialogConsumed,
  addDialogHostOnly = false,
  addDialogOpen,
  onAddDialogClose,
  onNavigateToPlanner,
}: MaintenancePlanProps) {
  const [plans, setPlans] = useState<PMPlan[]>(initialPMPlans);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Active');
  const [frequencyFilter, setFrequencyFilter] = useState('All');
  const [criticalityFilter, setCriticalityFilter] = useState('All');
  const [assetHierarchyFilter, setAssetHierarchyFilter] = useState<EquipmentSelection | null>(null);
  const [assetHierarchySearch, setAssetHierarchySearch] = useState('');
  const [expandedAssetHierarchyIds, setExpandedAssetHierarchyIds] = useState<Set<string>>(
    () => new Set(['plant-a', 'unit-b', 'line-10', 'SA-204', 'SA-204-FILL']),
  );
  const visibleMaintenancePlanHierarchyTree = useMemo(
    () => getFilteredMaintenancePlanHierarchyTree(maintenancePlanHierarchyTree, assetHierarchySearch),
    [assetHierarchySearch],
  );
  const [isGeneralTaskListOpen, setIsGeneralTaskListOpen] = useState(false);
  const [generalTaskListInitialMode, setGeneralTaskListInitialMode] = useState<'browse' | 'create'>('browse');
  const [newPlanStep, setNewPlanStep] = useState(1);
  const [newPlanItems, setNewPlanItems] = useState<NewPMMaintenanceItem[]>([
    createBlankMaintenanceItem(),
  ]);
  const [activeNewPlanItemId, setActiveNewPlanItemId] = useState('001');
  const [expandedNewPMReferenceObjectIds, setExpandedNewPMReferenceObjectIds] = useState<Set<string>>(
    () => new Set(['area-a', 'unit-a', 'line-10', 'zone-1', 'syringe-assembly-machine-s-101', 'filling-system', 'filling-head-assembly']),
  );
  const [addItemPlan, setAddItemPlan] = useState<PMPlan | null>(null);
  const [planMaintenanceItemDraft, setPlanMaintenanceItemDraft] = useState<NewPMMaintenanceItem>(() => createBlankMaintenanceItem());
  const [planMaintenanceOperationSelectId, setPlanMaintenanceOperationSelectId] = useState('');
  const [newPlanOperationSelectId, setNewPlanOperationSelectId] = useState('');
  const [expandedPlanItemReferenceObjectIds, setExpandedPlanItemReferenceObjectIds] = useState<Set<string>>(
    () => new Set(['area-a', 'unit-a', 'line-10', 'zone-1', 'syringe-assembly-machine-s-101', 'filling-system', 'filling-head-assembly']),
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PMPlan | null>(null);
  const [deleteArchivePlan, setDeleteArchivePlan] = useState<PMPlan | null>(null);
  const [deleteArchiveAction, setDeleteArchiveAction] = useState<'Archive' | 'Delete'>('Archive');
  const [generateWOPlan, setGenerateWOPlan] = useState<PMPlan | null>(null);
  const [generateWONotes, setGenerateWONotes] = useState('');
  const [generatedWorkOrders, setGeneratedWorkOrders] = useState<GeneratedWorkOrder[]>([]);
  const activeNewPlanItem = newPlanItems.find((item) => item.id === activeNewPlanItemId) || newPlanItems[0];
  const selectedTaskListId = activeNewPlanItem?.taskListId || '';
  const selectedEquipment = activeNewPlanItem?.equipment || '';
  const selectedReferenceObjectId = activeNewPlanItem?.referenceObjectId || '';
  const selectedTaskList = taskListExamples.find((taskList) => taskList.id === selectedTaskListId);
  const selectedTaskListOperations = activeNewPlanItem?.operations ?? selectedTaskList?.operations ?? [];
  const selectedNewPlanTaskListIds = activeNewPlanItem?.operationTaskListIds?.length
    ? activeNewPlanItem.operationTaskListIds
    : selectedTaskListId ? [selectedTaskListId] : [];
  const selectedNewPlanTaskLists = selectedNewPlanTaskListIds
    .map((taskListId) => taskListExamples.find((taskList) => taskList.id === taskListId))
    .filter((taskList): taskList is TaskListExample => Boolean(taskList));
  const selectedPlanItemTaskList = taskListExamples.find((taskList) => taskList.id === planMaintenanceItemDraft.taskListId);
  const selectedPlanItemTaskListIds = planMaintenanceItemDraft.operationTaskListIds?.length
    ? planMaintenanceItemDraft.operationTaskListIds
    : planMaintenanceItemDraft.taskListId ? [planMaintenanceItemDraft.taskListId] : [];
  const selectedPlanItemTaskLists = selectedPlanItemTaskListIds
    .map((taskListId) => taskListExamples.find((taskList) => taskList.id === taskListId))
    .filter((taskList): taskList is TaskListExample => Boolean(taskList));

  const getMaintenanceItemOperations = (maintenanceItem: NewPMMaintenanceItem) => {
    const itemTaskList = taskListExamples.find((taskList) => taskList.id === maintenanceItem.taskListId);
    return maintenanceItem.operations ?? itemTaskList?.operations ?? [];
  };

  const getMaintenanceItemsOperationCount = (items: NewPMMaintenanceItem[]) => (
    items.reduce((total, item) => total + getMaintenanceItemOperations(item).length, 0)
  );

  // Expanded maintenance items panel states per plan ID
  const [expandedMaintenanceItems, setExpandedMaintenanceItems] = useState<Record<string, boolean>>({
    'PM-PLAN-010': true, // Open by default for CV-102 matching the mockup
  });

  // Dialog state for adding a new plan
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(initialAddDialogOpen);
  const effectiveAddDialogOpen = addDialogOpen ?? isAddDialogOpen;
  const isPlanFormOpen = effectiveAddDialogOpen || isEditDialogOpen;
  const isEditingPlanForm = Boolean(editingPlan);
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
    onAddDialogClose?.();
  };
  const closePlanFormDialog = () => {
    if (effectiveAddDialogOpen) {
      closeAddDialog();
    } else {
      setIsAddDialogOpen(false);
    }
    setIsEditDialogOpen(false);
    setEditingPlan(null);
  };
  const [newPlan, setNewPlan] = useState<Partial<PMPlan>>(createDefaultNewPlan);
  const [newPlanSchedule, setNewPlanSchedule] = useState<NewPMSchedulingConfig>(createDefaultSchedulingConfig);
  const [newPlanItemSchedule, setNewPlanItemSchedule] = useState<NewPMSchedulingConfig>(() => ({
    ...createDefaultSchedulingConfig(),
    triggerType: 'Time-Based',
  }));
  const [newPlanSafetyQuality, setNewPlanSafetyQuality] = useState<NewPMSafetyQualityConfig>(createDefaultSafetyQualityConfig);
  const [showTriggerTypeWarning, setShowTriggerTypeWarning] = useState(false);

  // Notification state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'info' | 'warning'; workOrderNumber?: string; pmPlanId?: string }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const resetNewPlanForm = () => {
    setNewPlan(createDefaultNewPlan());
    setNewPlanSchedule(createDefaultSchedulingConfig());
    setNewPlanItemSchedule({
      ...createDefaultSchedulingConfig(),
      triggerType: 'Time-Based',
    });
    setNewPlanSafetyQuality(createDefaultSafetyQualityConfig());
    setNewPlanItems([createBlankMaintenanceItem()]);
    setActiveNewPlanItemId('001');
    setNewPlanOperationSelectId('');
    setNewPlanStep(1);
    setShowTriggerTypeWarning(false);
  };

  useEffect(() => {
    if (initialAddDialogOpen) {
      onInitialAddDialogConsumed?.();
    }
  }, [initialAddDialogOpen, onInitialAddDialogConsumed]);

  useEffect(() => {
    if (addDialogOpen) {
      resetNewPlanForm();
      setEditingPlan(null);
      setIsEditDialogOpen(false);
      setIsAddDialogOpen(true);
    }
  }, [addDialogOpen]);

  const getNextDueCounterValue = (config: NewPMSchedulingConfig) => {
    const threshold = Number(config.thresholdValue);
    const current = Number(config.currentCounterReading);
    const lastMaintenance = Number(config.lastMaintenanceCounterReading);
    if (!threshold || Number.isNaN(threshold) || Number.isNaN(current)) return config.nextDueCounterValue;
    if (!Number.isNaN(lastMaintenance) && lastMaintenance > 0) return String(lastMaintenance + threshold);
    return String(Math.ceil((current + 1) / threshold) * threshold);
  };

  const normalizeScheduleForTrigger = (config: NewPMSchedulingConfig, triggerType: '' | TriggerType): NewPMSchedulingConfig => ({
    ...config,
    triggerType,
    generateBasedOn:
      triggerType === 'Usage-Based' ? 'Counter Threshold' :
        triggerType === 'Condition-Based' ? 'Condition Threshold' :
          'Due Date',
  });

  const handleScheduleFieldChange = <Key extends keyof NewPMSchedulingConfig>(
    field: Key,
    value: NewPMSchedulingConfig[Key],
    scope: 'plan' | 'item' = 'plan',
  ) => {
    const setSchedule = scope === 'plan' ? setNewPlanSchedule : setNewPlanItemSchedule;
    setSchedule((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'thresholdValue' || field === 'currentCounterReading' || field === 'lastMaintenanceCounterReading') {
        next.nextDueCounterValue = getNextDueCounterValue(next);
      }
      return next;
    });
  };

  const handleTriggerTypeChange = (triggerType: '' | TriggerType, scope: 'plan' | 'item' = 'plan') => {
    const setSchedule = scope === 'plan' ? setNewPlanSchedule : setNewPlanItemSchedule;
    setSchedule((prev) => normalizeScheduleForTrigger(prev, triggerType));
    if (scope === 'plan') {
      setNewPlan((prev) => ({ ...prev, strategy: triggerType }));
    }
    setShowTriggerTypeWarning(Boolean(triggerType));
  };

  const handleSafetyQualityFieldChange = <Key extends keyof NewPMSafetyQualityConfig>(
    field: Key,
    value: NewPMSafetyQualityConfig[Key],
  ) => {
    setNewPlanSafetyQuality((prev) => ({ ...prev, [field]: value }));
  };

  const handlePpeRequirementToggle = (requirement: string) => {
    setNewPlanSafetyQuality((prev) => ({
      ...prev,
      ppeRequirements: prev.ppeRequirements.includes(requirement)
        ? prev.ppeRequirements.filter((item) => item !== requirement)
        : [...prev.ppeRequirements, requirement],
    }));
  };

  const updateActiveNewPlanItem = (updates: Partial<NewPMMaintenanceItem>) => {
    setNewPlanItems((prev) => (
      prev.map((item) => (item.id === activeNewPlanItemId ? { ...item, ...updates } : item))
    ));
  };

  const handleSelectNewPlanTaskList = (taskListId: string) => {
    const taskList = taskListExamples.find((item) => item.id === taskListId);
    updateActiveNewPlanItem({
      taskListId,
      operationTaskListIds: taskListId ? [taskListId] : [],
      operations: taskList ? taskList.operations.map(cloneTaskListOperation) : undefined,
    });
  };

  const handleAddNewPlanOperation = () => {
    if (!activeNewPlanItem) return;

    const taskList = taskListExamples.find((item) => item.id === newPlanOperationSelectId);
    if (!taskList) return;

    const currentTaskListIds = activeNewPlanItem.operationTaskListIds?.length
      ? activeNewPlanItem.operationTaskListIds
      : activeNewPlanItem.taskListId ? [activeNewPlanItem.taskListId] : [];
    if (currentTaskListIds.includes(taskList.id)) return;

    const nextTaskListIds = [...currentTaskListIds, taskList.id];
    updateActiveNewPlanItem({
      taskListId: nextTaskListIds[0],
      operationTaskListIds: nextTaskListIds,
      operations: [
        ...(activeNewPlanItem.operations?.map(cloneTaskListOperation) ?? []),
        ...taskList.operations.map(cloneTaskListOperation),
      ],
    });
    setNewPlanOperationSelectId('');
  };

  const handleRemoveNewPlanOperation = (taskListId: string) => {
    if (!activeNewPlanItem) return;

    const currentTaskListIds = activeNewPlanItem.operationTaskListIds?.length
      ? activeNewPlanItem.operationTaskListIds
      : activeNewPlanItem.taskListId ? [activeNewPlanItem.taskListId] : [];
    const nextTaskListIds = currentTaskListIds.filter((id) => id !== taskListId);
    const nextTaskLists = nextTaskListIds
      .map((id) => taskListExamples.find((taskList) => taskList.id === id))
      .filter((taskList): taskList is TaskListExample => Boolean(taskList));

    updateActiveNewPlanItem({
      taskListId: nextTaskListIds[0] || '',
      operationTaskListIds: nextTaskListIds,
      operations: nextTaskLists.length
        ? nextTaskLists.flatMap((taskList) => taskList.operations.map(cloneTaskListOperation))
        : undefined,
    });
  };

  const getNextTaskListOperationId = (operations: TaskListOperation[]) => {
    const nextNumber = operations.reduce((highest, operation) => Math.max(highest, Number(operation.op) || 0), 0) + 10;
    return String(nextNumber).padStart(4, '0');
  };

  const handleAddTaskListOperation = () => {
    if (!activeNewPlanItem) return;

    const currentOperations = activeNewPlanItem.operations ?? selectedTaskList?.operations ?? [];
    const workCenter = selectedTaskList?.defaultWorkCenter || newPlan.workCenter || 'MEC-01';
    const skill = selectedTaskList?.requiredSkill || 'Mechanical';

    updateActiveNewPlanItem({
      operations: [
        ...currentOperations.map((operation) => ({ ...operation })),
        {
          op: getNextTaskListOperationId(currentOperations),
          description: '',
          workCenter,
          duration: '15 min',
          skill,
        },
      ],
    });
  };

  const handleUpdateTaskListOperation = (
    operationId: string,
    field: keyof Pick<TaskListOperation, 'description' | 'workCenter' | 'duration' | 'skill'>,
    value: string,
  ) => {
    if (!activeNewPlanItem) return;

    const currentOperations = activeNewPlanItem.operations ?? selectedTaskList?.operations ?? [];
    updateActiveNewPlanItem({
      operations: currentOperations.map((operation) => (
        operation.op === operationId ? { ...operation, [field]: value } : { ...operation }
      )),
    });
  };

  const handleRemoveTaskListOperation = (operationId: string) => {
    if (!activeNewPlanItem) return;

    const currentOperations = activeNewPlanItem.operations ?? selectedTaskList?.operations ?? [];
    updateActiveNewPlanItem({
      operations: currentOperations.filter((operation) => operation.op !== operationId),
    });
  };

  const handleAddTaskListSubOperation = (operationId: string) => {
    if (!activeNewPlanItem) return;

    const currentOperations = activeNewPlanItem.operations ?? selectedTaskList?.operations ?? [];
    updateActiveNewPlanItem({
      operations: currentOperations.map((operation) => {
        if (operation.op !== operationId) return cloneTaskListOperation(operation);
        const nextSubOperationNumber = (operation.subOperations?.length ?? 0) + 1;
        return {
          ...cloneTaskListOperation(operation),
          subOperations: [
            ...(operation.subOperations?.map(cloneTaskListOperation) ?? []),
            {
              op: `${operation.op}.${nextSubOperationNumber}`,
              description: '',
              workCenter: operation.workCenter,
              duration: '10 min',
              skill: operation.skill,
            },
          ],
        };
      }),
    });
  };

  const handleUpdateTaskListSubOperation = (
    operationId: string,
    subOperationId: string,
    field: keyof Pick<TaskListOperation, 'description' | 'workCenter' | 'duration' | 'skill'>,
    value: string,
  ) => {
    if (!activeNewPlanItem) return;

    const currentOperations = activeNewPlanItem.operations ?? selectedTaskList?.operations ?? [];
    updateActiveNewPlanItem({
      operations: currentOperations.map((operation) => (
        operation.op === operationId
          ? {
            ...cloneTaskListOperation(operation),
            subOperations: operation.subOperations?.map((subOperation) => (
              subOperation.op === subOperationId ? { ...subOperation, [field]: value } : cloneTaskListOperation(subOperation)
            )),
          }
          : cloneTaskListOperation(operation)
      )),
    });
  };

  const handleRemoveTaskListSubOperation = (operationId: string, subOperationId: string) => {
    if (!activeNewPlanItem) return;

    const currentOperations = activeNewPlanItem.operations ?? selectedTaskList?.operations ?? [];
    updateActiveNewPlanItem({
      operations: currentOperations.map((operation) => (
        operation.op === operationId
          ? {
            ...cloneTaskListOperation(operation),
            subOperations: operation.subOperations?.filter((subOperation) => subOperation.op !== subOperationId).map(cloneTaskListOperation),
          }
          : cloneTaskListOperation(operation)
      )),
    });
  };

  const handleSelectNewPMReferenceObject = (node: NewPMReferenceObjectNode) => {
    const path = findNewPMReferenceObjectPath(node.id) || [node];
    updateActiveNewPlanItem({
      equipment: node.label,
      referenceObjectId: node.id,
      referenceObjectPath: path.map((pathNode) => pathNode.label).join(' / '),
    });
  };

  const toggleNewPMReferenceObjectExpanded = (nodeId: string) => {
    setExpandedNewPMReferenceObjectIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const getNextNewPlanItemId = (items: NewPMMaintenanceItem[]) => {
    const nextNumber = items.reduce((highest, item) => Math.max(highest, Number(item.id) || 0), 0) + 1;
    return String(nextNumber).padStart(3, '0');
  };

  const handleAddMaintenanceItem = () => {
    const nextItem = createBlankMaintenanceItem(getNextNewPlanItemId(newPlanItems));
    setNewPlanItems((prev) => [...prev, nextItem]);
    setActiveNewPlanItemId(nextItem.id);
    setNewPlanOperationSelectId('');
  };

  const handleCloneMaintenanceItem = (itemToClone: NewPMMaintenanceItem) => {
    const clonedItem = {
      ...itemToClone,
      id: getNextNewPlanItemId(newPlanItems),
      operations: itemToClone.operations?.map(cloneTaskListOperation),
    };
    setNewPlanItems((prev) => {
      const originalIndex = prev.findIndex((item) => item.id === itemToClone.id);
      const nextItems = [...prev];
      nextItems.splice(originalIndex + 1, 0, clonedItem);
      return nextItems;
    });
    setActiveNewPlanItemId(clonedItem.id);
  };

  const handleDeleteMaintenanceItem = (itemId: string) => {
    const nextActiveItemId = activeNewPlanItemId === itemId
      ? newPlanItems.find((item) => item.id !== itemId)?.id || '001'
      : activeNewPlanItemId;

    setNewPlanItems((prev) => {
      if (prev.length === 1) {
        return [createBlankMaintenanceItem()];
      }

      return prev.filter((item) => item.id !== itemId);
    });
    setActiveNewPlanItemId(nextActiveItemId);
  };

  const handleOpenAddPlanMaintenanceItem = (plan: PMPlan) => {
    const nextItemId = getNextNewPlanItemId(plan.maintenanceItems || []);
    setAddItemPlan(plan);
    setPlanMaintenanceItemDraft(createBlankMaintenanceItem(nextItemId));
    setPlanMaintenanceOperationSelectId('');
  };

  const handleCloseAddPlanMaintenanceItem = () => {
    setAddItemPlan(null);
    setPlanMaintenanceItemDraft(createBlankMaintenanceItem());
    setPlanMaintenanceOperationSelectId('');
  };

  const handleSelectPlanItemReferenceObject = (node: NewPMReferenceObjectNode) => {
    const path = findNewPMReferenceObjectPath(node.id) || [node];
    setPlanMaintenanceItemDraft((prev) => ({
      ...prev,
      equipment: node.label,
      referenceObjectId: node.id,
      referenceObjectPath: path.map((pathNode) => pathNode.label).join(' / '),
    }));
  };

  const togglePlanItemReferenceObjectExpanded = (nodeId: string) => {
    setExpandedPlanItemReferenceObjectIds((current) => {
      const next = new Set(current);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleAddPlanMaintenanceOperation = () => {
    const taskList = taskListExamples.find((item) => item.id === planMaintenanceOperationSelectId);
    if (!taskList) return;

    setPlanMaintenanceItemDraft((prev) => {
      const currentTaskListIds = prev.operationTaskListIds?.length
        ? prev.operationTaskListIds
        : prev.taskListId ? [prev.taskListId] : [];
      if (currentTaskListIds.includes(taskList.id)) return prev;

      const nextTaskListIds = [...currentTaskListIds, taskList.id];
      const nextOperations = [
        ...(prev.operations?.map(cloneTaskListOperation) ?? []),
        ...taskList.operations.map(cloneTaskListOperation),
      ];

      return {
        ...prev,
        taskListId: nextTaskListIds[0],
        operationTaskListIds: nextTaskListIds,
        operations: nextOperations,
      };
    });
    setPlanMaintenanceOperationSelectId('');
  };

  const handleRemovePlanMaintenanceOperation = (taskListId: string) => {
    setPlanMaintenanceItemDraft((prev) => {
      const currentTaskListIds = prev.operationTaskListIds?.length
        ? prev.operationTaskListIds
        : prev.taskListId ? [prev.taskListId] : [];
      const nextTaskListIds = currentTaskListIds.filter((id) => id !== taskListId);
      const nextTaskLists = nextTaskListIds
        .map((id) => taskListExamples.find((taskList) => taskList.id === id))
        .filter((taskList): taskList is TaskListExample => Boolean(taskList));

      return {
        ...prev,
        taskListId: nextTaskListIds[0] || '',
        operationTaskListIds: nextTaskListIds,
        operations: nextTaskLists.length
          ? nextTaskLists.flatMap((taskList) => taskList.operations.map(cloneTaskListOperation))
          : undefined,
      };
    });
  };

  const handleSavePlanMaintenanceItem = () => {
    if (!addItemPlan) return;
    if (!planMaintenanceItemDraft.equipment || !planMaintenanceItemDraft.taskListId) {
      setSnackbar({
        open: true,
        message: 'Please select a Reference Object and Task List before adding the maintenance item.',
        severity: 'warning',
      });
      return;
    }

    const selectedTaskListForDraft = taskListExamples.find((taskList) => taskList.id === planMaintenanceItemDraft.taskListId);

    setPlans((prev) => prev.map((plan) => {
      if (plan.id !== addItemPlan.id) return plan;

      const maintenanceItems = [...(plan.maintenanceItems || []), planMaintenanceItemDraft];
      return {
        ...plan,
        maintenanceItems,
        taskListName: plan.taskListName || (selectedTaskListForDraft ? `${selectedTaskListForDraft.title} (${selectedTaskListForDraft.id})` : undefined),
        taskListDetails: {
          steps: maintenanceItems.length,
          parts: plan.taskListDetails?.parts ?? 0,
          tools: plan.taskListDetails?.tools ?? 2,
        },
      };
    }));
    setExpandedMaintenanceItems((prev) => ({ ...prev, [addItemPlan.id]: true }));
    setSnackbar({
      open: true,
      message: `Maintenance item ${planMaintenanceItemDraft.id} added to ${addItemPlan.id}.`,
      severity: 'success',
    });
    handleCloseAddPlanMaintenanceItem();
  };

  const activeSchedule = newPlanSchedule.applySameSchedule
    ? newPlanSchedule
    : { ...newPlanItemSchedule, applySameSchedule: false };

  const getSchedulingValidationMessage = (config: NewPMSchedulingConfig) => {
    if (!config.triggerType) return 'Please select a Trigger Type before continuing.';

    if (config.triggerType === 'Time-Based') {
      if (!config.frequencyValue) return 'Frequency Value is required for Time-Based plans.';
      if (!config.frequencyUnit) return 'Frequency Unit is required for Time-Based plans.';
      if (!config.startDate) return 'Start Date is required for Time-Based plans.';
      if (!config.scheduleType) return 'Schedule Type is required for Time-Based plans.';
      if (config.autoGenerateWO && !newPlan.callHorizon) return 'Call Horizon is required when auto-generation is enabled.';
    }

    if (config.triggerType === 'Usage-Based') {
      if (!config.counterMeter) return 'Counter / Meter is required for Usage-Based plans.';
      if (!config.counterType) return 'Counter Type is required for Usage-Based plans.';
      if (!config.thresholdValue) return 'Threshold Value is required for Usage-Based plans.';
      if (!config.unitOfMeasure) return 'Unit of Measure is required for Usage-Based plans.';
      if (!config.readingSource) return 'Reading Source is required for Usage-Based plans.';
    }

    if (config.triggerType === 'Condition-Based') {
      if (!config.conditionSource) return 'Condition Source is required for Condition-Based plans.';
      if (!config.monitoredParameter) return 'Monitored Parameter is required for Condition-Based plans.';
      if (!config.criticalThreshold) return 'Critical Threshold is required for Condition-Based plans.';
      if (!config.thresholdRule) return 'Threshold Rule is required for Condition-Based plans.';
      if (!config.readingSource) return 'Reading Source is required for Condition-Based plans.';
    }

    return '';
  };

  const getRelevantSchedulingConfig = (config: NewPMSchedulingConfig): Partial<NewPMSchedulingConfig> => {
    const common = {
      triggerType: config.triggerType,
      applySameSchedule: config.applySameSchedule,
      autoGenerateWO: config.autoGenerateWO,
      generateBasedOn: config.generateBasedOn,
    };

    if (config.triggerType === 'Usage-Based') {
      return {
        ...common,
        counterMeter: config.counterMeter,
        counterType: config.counterType,
        thresholdValue: config.thresholdValue,
        unitOfMeasure: config.unitOfMeasure,
        currentCounterReading: config.currentCounterReading,
        lastMaintenanceCounterReading: config.lastMaintenanceCounterReading,
        nextDueCounterValue: config.nextDueCounterValue,
        estimatedDueDate: config.estimatedDueDate,
        readingSource: config.readingSource,
        counterResetRule: config.counterResetRule,
        toleranceBeforeThreshold: config.toleranceBeforeThreshold,
        toleranceAfterThreshold: config.toleranceAfterThreshold,
        generateAtThreshold: config.generateAtThreshold,
        generateWithinCallHorizon: config.generateWithinCallHorizon,
        allowManualWOBeforeThreshold: config.allowManualWOBeforeThreshold,
        leadTimeDays: config.leadTimeDays,
      };
    }

    if (config.triggerType === 'Condition-Based') {
      return {
        ...common,
        conditionSource: config.conditionSource,
        monitoredParameter: config.monitoredParameter,
        conditionUnitOfMeasure: config.conditionUnitOfMeasure,
        currentValue: config.currentValue,
        warningThreshold: config.warningThreshold,
        criticalThreshold: config.criticalThreshold,
        thresholdRule: config.thresholdRule,
        evaluationWindow: config.evaluationWindow,
        conditionStatus: config.conditionStatus,
        readingSource: config.readingSource,
        requirePlannerConfirmation: config.requirePlannerConfirmation,
        alertCondition: config.alertCondition,
        maintenanceGenerationRule: config.maintenanceGenerationRule,
        generateOnWarning: config.generateOnWarning,
        generateOnlyOnCritical: config.generateOnlyOnCritical,
        generateNotificationBeforeWO: config.generateNotificationBeforeWO,
        requireRepeatedBreach: config.requireRepeatedBreach,
        suppressDuplicateWO: config.suppressDuplicateWO,
        leadTimeDays: config.leadTimeDays,
      };
    }

    return {
      ...common,
      frequencyValue: config.frequencyValue,
      frequencyUnit: config.frequencyUnit,
      startDate: config.startDate,
      dueDateDay: config.dueDateDay,
      scheduleType: config.scheduleType,
      generateWoBeforeDueDays: config.generateWoBeforeDueDays,
      leadTimeDays: config.leadTimeDays,
    };
  };

  // Filter logic
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      const matchesSearch =
        plan.id.toLowerCase().includes(search.toLowerCase()) ||
        plan.assetName.toLowerCase().includes(search.toLowerCase()) ||
        plan.area.toLowerCase().includes(search.toLowerCase()) ||
        plan.line.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' || plan.status === statusFilter;

      const matchesFrequency =
        frequencyFilter === 'All' || plan.frequencyLabel === frequencyFilter;

      const matchesCriticality =
        criticalityFilter === 'All' || plan.criticality === criticalityFilter;

      const hierarchyIds = maintenancePlanHierarchyIdsByPlanId[plan.id] ?? [];
      const matchesAssetHierarchy =
        !assetHierarchyFilter || hierarchyIds.includes(assetHierarchyFilter.id);

      return matchesSearch && matchesStatus && matchesFrequency && matchesCriticality && matchesAssetHierarchy;
    });
  }, [plans, search, statusFilter, frequencyFilter, criticalityFilter, assetHierarchyFilter]);

  const handleToggleMaintenanceItems = (planId: string) => {
    setExpandedMaintenanceItems((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const handleOpenGeneralTaskList = (mode: 'browse' | 'create') => {
    setGeneralTaskListInitialMode(mode);
    setIsGeneralTaskListOpen(true);
  };

  const handleGenerateWorkOrder = (planId: string, assetName: string) => {
    const selectedPlan = plans.find((plan) => plan.id === planId);
    if (!selectedPlan) {
      setSnackbar({
        open: true,
        message: `PM plan ${planId} was not found.`,
        severity: 'warning',
      });
      return;
    }

    setGenerateWOPlan(selectedPlan);
    setGenerateWONotes(selectedPlan.notes || `Preventive maintenance work order for ${assetName}.`);
  };

  const handleCloseGenerateWorkOrder = () => {
    setGenerateWOPlan(null);
    setGenerateWONotes('');
  };

  const getGenerateWOValidation = (plan: PMPlan) => {
    const nextDueDate = parsePMDate(plan.nextDue);
    const hasReferenceObject = Boolean(plan.assetName?.trim() || plan.area?.trim() || plan.line?.trim());
    const duplicateWorkOrder = generatedWorkOrders.find((workOrder) => (
      workOrder.pmPlanId === plan.id &&
      workOrder.dueDate === plan.nextDue &&
      workOrder.status === 'Open'
    ));

    const blockingIssues = [
      plan.status !== 'Active' ? 'PM Plan must be Active.' : '',
      !hasReferenceObject ? 'PM Plan must have Equipment or Functional Location.' : '',
      !plan.taskListName ? 'PM Plan must have a linked Task List.' : '',
      !nextDueDate ? 'PM Plan must have a valid Next Due date.' : '',
      !plan.workCenter?.trim() ? 'PM Plan must have Work Center.' : '',
    ].filter(Boolean);

    return {
      nextDueDate,
      basicStartDate: nextDueDate ? addDays(nextDueDate, -1) : null,
      basicFinishDate: nextDueDate,
      duplicateWorkOrder,
      isInsideCallHorizon: isPlanInsideCallHorizon(plan),
      blockingIssues,
      canGenerate: blockingIssues.length === 0 && !duplicateWorkOrder,
    };
  };

  const handleCreateWorkOrder = (mode: 'Draft' | 'Open') => {
    if (!generateWOPlan) return;

    const validation = getGenerateWOValidation(generateWOPlan);
    if (!validation.canGenerate) return;

    const workOrderNumber = getNextWorkOrderNumber(generatedWorkOrders);
    setGeneratedWorkOrders((prev) => [
      ...prev,
      {
        number: workOrderNumber,
        pmPlanId: generateWOPlan.id,
        dueDate: generateWOPlan.nextDue,
        status: mode,
      },
    ]);
    handleCloseGenerateWorkOrder();
    setSnackbar({
      open: true,
      message: 'Work Order generated successfully.',
      severity: 'success',
      workOrderNumber,
      pmPlanId: generateWOPlan.id,
    });
  };

  const handleClonePlan = (planToClone: PMPlan) => {
    const clonedPlanId = getNextPMPlanId(plans);
    const clonedPlan: PMPlan = {
      ...planToClone,
      id: clonedPlanId,
      assetName: `${planToClone.assetName} (Copy)`,
    };

    setPlans((prev) => {
      const originalIndex = prev.findIndex((plan) => plan.id === planToClone.id);
      if (originalIndex === -1) {
        return [clonedPlan, ...prev];
      }

      const nextPlans = [...prev];
      nextPlans.splice(originalIndex + 1, 0, clonedPlan);
      return nextPlans;
    });

    if (expandedMaintenanceItems[planToClone.id]) {
      setExpandedMaintenanceItems((prev) => ({
        ...prev,
        [clonedPlanId]: true,
      }));
    }

    setSnackbar({
      open: true,
      message: `PM plan ${planToClone.id} cloned as ${clonedPlanId}.`,
      severity: 'success',
    });
  };

  const handleOpenEditPlan = (plan: PMPlan) => {
    const planItems = plan.maintenanceItems?.length ? plan.maintenanceItems : [createBlankMaintenanceItem()];
    const schedule = getPlanSchedulingConfig(plan);
    setEditingPlan(plan);
    setNewPlan({
      ...createDefaultNewPlan(),
      ...plan,
      taskListName: plan.description || plan.taskListName || '',
    });
    setNewPlanItems(planItems);
    setActiveNewPlanItemId(planItems[0]?.id || '001');
    setNewPlanSchedule(schedule);
    setNewPlanItemSchedule({
      ...createDefaultSchedulingConfig(),
      triggerType: schedule.triggerType || 'Time-Based',
    });
    setNewPlanSafetyQuality({
      ...createDefaultSafetyQualityConfig(),
      ...plan.safetyQualityConfig,
    });
    setNewPlanStep(1);
    setShowTriggerTypeWarning(false);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditPlan = () => {
    if (!editingPlan || !newPlan.id || !newPlan.assetName) {
      setSnackbar({
        open: true,
        message: 'Please fill in both the Plan ID and Asset Name.',
        severity: 'warning',
      });
      return;
    }

    const schedulingValidationMessage = getSchedulingValidationMessage(activeSchedule);
    if (schedulingValidationMessage) {
      setSnackbar({
        open: true,
        message: schedulingValidationMessage,
        severity: 'warning',
      });
      setNewPlanStep(2);
      return;
    }

    let days = Number(newPlan.frequencyDays) || 7;
    if (newPlan.frequencyLabel === 'Daily') days = 1;
    if (newPlan.frequencyLabel === 'Bi-Weekly') days = 14;

    const primaryMaintenanceItem = newPlanItems.find((item) => item.taskListId) || newPlanItems[0];
    const primaryTaskList = taskListExamples.find((taskList) => taskList.id === primaryMaintenanceItem?.taskListId);

    const savedMaintenanceItems = newPlanItems.filter((item) => item.taskListId || item.equipment);
    const savedOperationCount = getMaintenanceItemsOperationCount(savedMaintenanceItems);

    const updatedPlan: PMPlan = {
      ...editingPlan,
      id: newPlan.id.toUpperCase(),
      assetName: newPlan.assetName,
      description: newPlan.taskListName || editingPlan.description,
      zone: newPlan.zone || editingPlan.zone,
      area: newPlan.area || editingPlan.area,
      line: newPlan.line || editingPlan.line,
      frequencyLabel: newPlan.frequencyLabel || editingPlan.frequencyLabel,
      criticality: (newPlan.criticality || editingPlan.criticality || 'B') as PMPlan['criticality'],
      frequencyDays: days,
      strategy: activeSchedule.triggerType || editingPlan.strategy,
      durationHours: Number(newPlan.durationHours) || editingPlan.durationHours || 1.0,
      workCenter: newPlan.workCenter || editingPlan.workCenter,
      compliance: editingPlan.compliance,
      lastExecuted: newPlan.lastExecuted || editingPlan.lastExecuted,
      nextDue: newPlan.nextDue || editingPlan.nextDue,
      callHorizon: Number(newPlan.callHorizon) || editingPlan.callHorizon,
      callHorizonUnit: newPlan.callHorizonUnit || editingPlan.callHorizonUnit,
      executionWindowDays: Number(newPlan.executionWindowDays) || editingPlan.executionWindowDays,
      toleranceBeforeDueDays: Number(newPlan.toleranceBeforeDueDays) || editingPlan.toleranceBeforeDueDays,
      toleranceAfterDueDays: Number(newPlan.toleranceAfterDueDays) || editingPlan.toleranceAfterDueDays,
      status: (newPlan.status || editingPlan.status) as PMPlan['status'],
      schedulingConfig: getRelevantSchedulingConfig(activeSchedule),
      maintenanceItems: savedMaintenanceItems,
      safetyQualityConfig: newPlanSafetyQuality,
      taskListName: primaryTaskList ? `${primaryTaskList.title} (${primaryTaskList.id})` : editingPlan.taskListName,
      taskListDetails: primaryTaskList ? {
        steps: savedOperationCount || newPlanItems.filter((item) => item.taskListId).length || 1,
        parts: editingPlan.taskListDetails?.parts ?? 0,
        tools: editingPlan.taskListDetails?.tools ?? 2,
      } : editingPlan.taskListDetails,
    };

    setPlans((prev) => prev.map((plan) => (plan.id === editingPlan.id ? updatedPlan : plan)));
    closePlanFormDialog();
    setSnackbar({
      open: true,
      message: `PM plan ${updatedPlan.id} updated successfully.`,
      severity: 'success',
    });
  };

  const handleOpenDeleteArchivePlan = (plan: PMPlan) => {
    setDeleteArchivePlan(plan);
    setDeleteArchiveAction('Archive');
  };

  const handleCloseDeleteArchivePlan = () => {
    setDeleteArchivePlan(null);
    setDeleteArchiveAction('Archive');
  };

  const handleConfirmDeleteArchivePlan = () => {
    if (!deleteArchivePlan) return;

    if (deleteArchiveAction === 'Delete') {
      setPlans((prev) => prev.filter((plan) => plan.id !== deleteArchivePlan.id));
      setExpandedMaintenanceItems((prev) => {
        const next = { ...prev };
        delete next[deleteArchivePlan.id];
        return next;
      });
      setSnackbar({
        open: true,
        message: `PM plan ${deleteArchivePlan.id} deleted.`,
        severity: 'success',
      });
      handleCloseDeleteArchivePlan();
      return;
    }

    setPlans((prev) => prev.map((plan) => (
      plan.id === deleteArchivePlan.id ? { ...plan, status: 'Archived' } : plan
    )));
    setSnackbar({
      open: true,
      message: `PM plan ${deleteArchivePlan.id} archived.`,
      severity: 'success',
    });
    handleCloseDeleteArchivePlan();
  };

  const handleAddPlanSubmit = () => {
    if (!newPlan.id || !newPlan.assetName) {
      setSnackbar({
        open: true,
        message: 'Please fill in both the Plan ID and Asset Name.',
        severity: 'warning',
      });
      return;
    }

    const schedulingValidationMessage = getSchedulingValidationMessage(activeSchedule);
    if (schedulingValidationMessage) {
      setSnackbar({
        open: true,
        message: schedulingValidationMessage,
        severity: 'warning',
      });
      setNewPlanStep(2);
      return;
    }

    // Set frequency days based on label
    let days = 7;
    if (newPlan.frequencyLabel === 'Daily') days = 1;
    if (newPlan.frequencyLabel === 'Bi-Weekly') days = 14;

    const primaryMaintenanceItem = newPlanItems.find((item) => item.taskListId) || newPlanItems[0];
    const primaryTaskList = taskListExamples.find((taskList) => taskList.id === primaryMaintenanceItem?.taskListId);

    const savedMaintenanceItems = newPlanItems.filter((item) => item.taskListId || item.equipment);
    const savedOperationCount = getMaintenanceItemsOperationCount(savedMaintenanceItems);

    const completedPlan: PMPlan = {
      id: newPlan.id.toUpperCase(),
      assetName: newPlan.assetName,
      zone: newPlan.zone || 'Z1',
      area: newPlan.area || 'Production',
      line: newPlan.line || 'Line 10',
      frequencyLabel: newPlan.frequencyLabel || 'Weekly',
      criticality: (newPlan.criticality || 'B') as 'A' | 'B' | 'C',
      frequencyDays: days,
      strategy: activeSchedule.triggerType || 'Time-Based',
      durationHours: Number(newPlan.durationHours) || 1.0,
      workCenter: newPlan.workCenter || 'Mechanical',
      compliance: 'On Track',
      lastExecuted: newPlan.lastExecuted || 'May 20, 2026',
      nextDue: newPlan.nextDue || 'May 27, 2026',
      callHorizon: Number(newPlan.callHorizon) || 80,
      callHorizonUnit: newPlan.callHorizonUnit || '%',
      executionWindowDays: Number(newPlan.executionWindowDays) || 7,
      toleranceBeforeDueDays: Number(newPlan.toleranceBeforeDueDays) || 3,
      toleranceAfterDueDays: Number(newPlan.toleranceAfterDueDays) || 5,
      status: 'Active',
      schedulingConfig: getRelevantSchedulingConfig(activeSchedule),
      maintenanceItems: savedMaintenanceItems,
      safetyQualityConfig: newPlanSafetyQuality,
      taskListName: primaryTaskList ? `${primaryTaskList.title} (${primaryTaskList.id})` : undefined,
      taskListDetails: primaryTaskList ? {
        steps: savedOperationCount || newPlanItems.filter((item) => item.taskListId).length || 1,
        parts: 0,
        tools: 2,
      } : undefined,
    };

    setPlans((prev) => [completedPlan, ...prev]);
    closeAddDialog();
    setSnackbar({
      open: true,
      message: `New Preventive Maintenance plan ${completedPlan.id} added successfully!`,
      severity: 'success',
    });

    // Reset Form
    resetNewPlanForm();
  };

  const handleActionMock = (action: string, planId: string) => {
    setSnackbar({
      open: true,
      message: `${action} action clicked for plan ${planId}.`,
      severity: 'info',
    });
  };

  const getFrequencyPillStyle = (freq: string) => {
    switch (freq) {
      case 'Daily':
        return { bg: tokenBrand.softBg, color: tokenBrand.main, label: 'Daily' };
      case 'Weekly':
        return { bg: tokenWarning.softBg, color: tokenWarning.main, label: 'Weekly' };
      case 'Bi-Weekly':
        return { bg: tokenSuccess.softBg, color: tokenSuccess.main, label: 'Bi-Weekly' };
      default:
        return { bg: tokenNeutral.lighter, color: tokenText.secondary, label: freq };
    }
  };

  const getCriticalityPillStyle = (crit: string) => {
    switch (crit) {
      case 'A':
        return { bg: tokenError.softBg, color: tokenError.main };
      case 'B':
        return { bg: tokenWarning.softBg, color: tokenWarning.main };
      case 'C':
        return { bg: tokenNeutral.lighter, color: tokenText.secondary };
      default:
        return { bg: tokenNeutral.lighter, color: tokenText.secondary };
    }
  };

  const getTriggerHelperText = (triggerType: '' | TriggerType) => {
    if (triggerType === 'Usage-Based') {
      return {
        short: 'Best for maintenance based on production count, runtime, or machine cycles.',
        detail: 'Usage-Based plans generate maintenance based on production or equipment usage, such as every 10,000 produced parts or every 500 runtime hours.',
        preview: `Generate maintenance every ${activeSchedule.thresholdValue || '10,000'} ${activeSchedule.unitOfMeasure || 'produced parts'}.`,
      };
    }
    if (triggerType === 'Condition-Based') {
      return {
        short: 'Best for sensor, inspection, or threshold-driven maintenance.',
        detail: 'Condition-Based plans generate maintenance when a monitored condition crosses a defined threshold, such as high vibration, temperature, or pressure.',
        preview: `Generate maintenance when ${activeSchedule.monitoredParameter || 'vibration'} is ${activeSchedule.thresholdRule || 'greater than'} ${activeSchedule.criticalThreshold || '7'} ${activeSchedule.conditionUnitOfMeasure || 'mm/s'}${activeSchedule.evaluationWindow ? ` ${activeSchedule.evaluationWindow}` : ' for 30 minutes'}.`,
      };
    }
    return {
      short: 'Best for calendar-driven preventive work.',
      detail: 'Time-Based plans generate maintenance based on calendar frequency, such as every 7 days or every 3 months.',
      preview: '',
    };
  };

  const renderSwitchRow = (
    label: string,
    checked = true,
    onChange?: (checked: boolean) => void,
    gridSize: { xs: number; md?: number } = { xs: 12, md: 6 },
  ) => (
    <Grid key={label} size={gridSize}>
      <Paper elevation={0} sx={{ px: 1.5, py: 0.8, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: activeTheme.backgroundDefault, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography sx={{ color: '#303744', fontWeight: 800, fontSize: '0.9rem' }}>{label}</Typography>
        {onChange ? (
          <Switch checked={checked} onChange={(event) => onChange(event.target.checked)} />
        ) : (
          <Switch defaultChecked={checked} />
        )}
      </Paper>
    </Grid>
  );

  const renderTriggerFields = (config: NewPMSchedulingConfig, scope: 'plan' | 'item') => {
    if (config.triggerType === 'Usage-Based') {
      return (
        <>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Counter / Meter *</InputLabel>
            <TextField fullWidth placeholder="e.g. Main production counter" value={config.counterMeter} onChange={(e) => handleScheduleFieldChange('counterMeter', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Counter Type *</InputLabel>
            <FormControl fullWidth>
              <Select value={config.counterType} onChange={(e) => handleScheduleFieldChange('counterType', e.target.value, scope)} displayEmpty renderValue={(value) => value || 'Select counter type'}>
                <MenuItem value="">Select counter type</MenuItem>
                {['Produced Parts', 'Runtime Hours', 'Machine Cycles', 'Distance', 'Energy Consumption', 'Custom Counter'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Threshold Value *</InputLabel>
            <TextField fullWidth type="number" placeholder="e.g. 10000" value={config.thresholdValue} onChange={(e) => handleScheduleFieldChange('thresholdValue', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Unit of Measure *</InputLabel>
            <TextField fullWidth placeholder="parts, hours, cycles, km, kWh" value={config.unitOfMeasure} onChange={(e) => handleScheduleFieldChange('unitOfMeasure', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Current Counter Reading</InputLabel>
            <TextField fullWidth type="number" value={config.currentCounterReading} onChange={(e) => handleScheduleFieldChange('currentCounterReading', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Last Maintenance Counter Reading</InputLabel>
            <TextField fullWidth type="number" value={config.lastMaintenanceCounterReading} onChange={(e) => handleScheduleFieldChange('lastMaintenanceCounterReading', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Next Due Counter Value</InputLabel>
            <TextField fullWidth value={config.nextDueCounterValue} onChange={(e) => handleScheduleFieldChange('nextDueCounterValue', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Estimated Due Date</InputLabel>
            <TextField fullWidth placeholder="Optional" value={config.estimatedDueDate} onChange={(e) => handleScheduleFieldChange('estimatedDueDate', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Reading Source *</InputLabel>
            <FormControl fullWidth>
              <Select value={config.readingSource} onChange={(e) => handleScheduleFieldChange('readingSource', e.target.value, scope)} displayEmpty renderValue={(value) => value || 'Select reading source'}>
                <MenuItem value="">Select reading source</MenuItem>
                {['Manual Entry', 'Machine Integration', 'MES', 'Sensor', 'IoT Platform'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Counter Reset Rule</InputLabel>
            <FormControl fullWidth>
              <Select value={config.counterResetRule} onChange={(e) => handleScheduleFieldChange('counterResetRule', e.target.value, scope)}>
                {['Reset after Work Order completion', 'Continue cumulative counter', 'Manual reset only'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        </>
      );
    }

    if (config.triggerType === 'Condition-Based') {
      return (
        <>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Condition Source *</InputLabel>
            <FormControl fullWidth>
              <Select value={config.conditionSource} onChange={(e) => handleScheduleFieldChange('conditionSource', e.target.value, scope)} displayEmpty renderValue={(value) => value || 'Select condition source'}>
                <MenuItem value="">Select condition source</MenuItem>
                {['Sensor', 'Inspection', 'Manual Input', 'Quality Check', 'IoT Platform', 'Predictive Model'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Monitored Parameter *</InputLabel>
            <FormControl fullWidth>
              <Select value={config.monitoredParameter} onChange={(e) => handleScheduleFieldChange('monitoredParameter', e.target.value, scope)} displayEmpty renderValue={(value) => value || 'Select parameter'}>
                <MenuItem value="">Select parameter</MenuItem>
                {['Temperature', 'Vibration', 'Pressure', 'Oil Quality', 'Noise', 'Wear Level', 'Custom Parameter'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Unit of Measure</InputLabel>
            <TextField fullWidth placeholder="°C, mm/s, bar, %" value={config.conditionUnitOfMeasure} onChange={(e) => handleScheduleFieldChange('conditionUnitOfMeasure', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Current Value</InputLabel>
            <TextField fullWidth value={config.currentValue} onChange={(e) => handleScheduleFieldChange('currentValue', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Warning Threshold</InputLabel>
            <TextField fullWidth value={config.warningThreshold} onChange={(e) => handleScheduleFieldChange('warningThreshold', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Critical Threshold *</InputLabel>
            <TextField fullWidth value={config.criticalThreshold} onChange={(e) => handleScheduleFieldChange('criticalThreshold', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Threshold Rule *</InputLabel>
            <FormControl fullWidth>
              <Select value={config.thresholdRule} onChange={(e) => handleScheduleFieldChange('thresholdRule', e.target.value, scope)} displayEmpty renderValue={(value) => value || 'Select rule'}>
                <MenuItem value="">Select rule</MenuItem>
                {['Greater than', 'Greater than or equal to', 'Less than', 'Less than or equal to', 'Outside range', 'Equals'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Evaluation Window</InputLabel>
            <TextField fullWidth placeholder="for 30 minutes" value={config.evaluationWindow} onChange={(e) => handleScheduleFieldChange('evaluationWindow', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Condition Status</InputLabel>
            <FormControl fullWidth>
              <Select value={config.conditionStatus} onChange={(e) => handleScheduleFieldChange('conditionStatus', e.target.value, scope)}>
                {['Normal', 'Warning', 'Critical', 'Maintenance Required'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Reading Source *</InputLabel>
            <TextField fullWidth placeholder="e.g. Sensor tag or inspection form" value={config.readingSource} onChange={(e) => handleScheduleFieldChange('readingSource', e.target.value, scope)} />
          </Grid>
        </>
      );
    }

    return (
      <>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel>Frequency Value *</InputLabel>
          <TextField fullWidth placeholder="e.g. 30" value={config.frequencyValue} onChange={(e) => handleScheduleFieldChange('frequencyValue', e.target.value, scope)} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel>Frequency Unit *</InputLabel>
          <FormControl fullWidth>
            <Select value={config.frequencyUnit} onChange={(e) => handleScheduleFieldChange('frequencyUnit', e.target.value, scope)}>
              {['Days', 'Weeks', 'Months', 'Years'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel>Start Date *</InputLabel>
          <TextField fullWidth value={config.startDate} onChange={(e) => handleScheduleFieldChange('startDate', e.target.value, scope)} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel>Schedule Type *</InputLabel>
          <FormControl fullWidth>
            <Select value={config.scheduleType} onChange={(e) => handleScheduleFieldChange('scheduleType', e.target.value, scope)}>
              <MenuItem value="Fixed Schedule">Fixed Schedule</MenuItem>
              <MenuItem value="Floating Schedule">Floating Schedule</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel>Due Date</InputLabel>
          <TextField
            fullWidth
            type="number"
            placeholder="e.g. 28"
            value={config.dueDateDay}
            onChange={(e) => handleScheduleFieldChange('dueDateDay', e.target.value, scope)}
            inputProps={{ min: 1, max: 31 }}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel>Execution Window (days)</InputLabel>
          <TextField fullWidth type="number" value={newPlan.executionWindowDays ?? 7} onChange={(e) => setNewPlan((prev) => ({ ...prev, executionWindowDays: Number(e.target.value) }))} inputProps={{ min: 0 }} />
        </Grid>
      </>
    );
  };

  const renderRulesSection = (config: NewPMSchedulingConfig, scope: 'plan' | 'item') => {
    if (config.triggerType === 'Usage-Based') {
      return (
        <>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Tolerance Before Threshold</InputLabel>
            <TextField fullWidth value={config.toleranceBeforeThreshold} onChange={(e) => handleScheduleFieldChange('toleranceBeforeThreshold', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Tolerance After Threshold</InputLabel>
            <TextField fullWidth value={config.toleranceAfterThreshold} onChange={(e) => handleScheduleFieldChange('toleranceAfterThreshold', e.target.value, scope)} />
          </Grid>
          {renderSwitchRow('Generate when counter reaches threshold', config.generateAtThreshold, (checked) => handleScheduleFieldChange('generateAtThreshold', checked, scope))}
          {renderSwitchRow('Generate when counter is within call horizon', config.generateWithinCallHorizon, (checked) => handleScheduleFieldChange('generateWithinCallHorizon', checked, scope))}
          {renderSwitchRow('Allow manual WO generation before threshold', config.allowManualWOBeforeThreshold, (checked) => handleScheduleFieldChange('allowManualWOBeforeThreshold', checked, scope), { xs: 12 })}
        </>
      );
    }

    if (config.triggerType === 'Condition-Based') {
      return (
        <>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Alert Condition</InputLabel>
            <TextField fullWidth value={config.alertCondition} onChange={(e) => handleScheduleFieldChange('alertCondition', e.target.value, scope)} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Maintenance Generation Rule</InputLabel>
            <TextField fullWidth value={config.maintenanceGenerationRule} onChange={(e) => handleScheduleFieldChange('maintenanceGenerationRule', e.target.value, scope)} />
          </Grid>
          {renderSwitchRow('Generate WO when warning threshold is reached', config.generateOnWarning, (checked) => handleScheduleFieldChange('generateOnWarning', checked, scope))}
          {renderSwitchRow('Generate WO only when critical threshold is reached', config.generateOnlyOnCritical, (checked) => handleScheduleFieldChange('generateOnlyOnCritical', checked, scope))}
          {renderSwitchRow('Generate notification before Work Order', config.generateNotificationBeforeWO, (checked) => handleScheduleFieldChange('generateNotificationBeforeWO', checked, scope))}
          {renderSwitchRow('Require repeated breach before generation', config.requireRepeatedBreach, (checked) => handleScheduleFieldChange('requireRepeatedBreach', checked, scope))}
          {renderSwitchRow('Suppress duplicate WO while one is open', config.suppressDuplicateWO, (checked) => handleScheduleFieldChange('suppressDuplicateWO', checked, scope), { xs: 12 })}
        </>
      );
    }

    return (
      <>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel>Tolerance Before Due (days)</InputLabel>
          <TextField fullWidth type="number" value={newPlan.toleranceBeforeDueDays ?? 3} onChange={(e) => setNewPlan((prev) => ({ ...prev, toleranceBeforeDueDays: Number(e.target.value) }))} inputProps={{ min: 0 }} />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel>Tolerance After Due (days)</InputLabel>
          <TextField fullWidth type="number" value={newPlan.toleranceAfterDueDays ?? 5} onChange={(e) => setNewPlan((prev) => ({ ...prev, toleranceAfterDueDays: Number(e.target.value) }))} inputProps={{ min: 0 }} />
        </Grid>
      </>
    );
  };

  const renderAutoGenerationSection = (config: NewPMSchedulingConfig, scope: 'plan' | 'item') => {
    const isUsage = config.triggerType === 'Usage-Based';
    const isCondition = config.triggerType === 'Condition-Based';

    return (
      <Grid container spacing={{ xs: 1.8, md: 2.2 }}>
        {!isCondition && (
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>{isUsage ? 'Call Horizon based on counter percentage' : 'Call Horizon *'}</InputLabel>
            <Grid container spacing={1}>
              <Grid size={{ xs: 7, md: 8 }}>
                <TextField fullWidth type="number" value={newPlan.callHorizon ?? 80} onChange={(e) => setNewPlan((prev) => ({ ...prev, callHorizon: Number(e.target.value) }))} inputProps={{ min: 1 }} />
              </Grid>
              <Grid size={{ xs: 5, md: 4 }}>
                <FormControl fullWidth>
                  <Select value={isUsage ? '%' : newPlan.callHorizonUnit || '%'} onChange={(e) => setNewPlan((prev) => ({ ...prev, callHorizonUnit: e.target.value as '%' | 'Days' }))} disabled={isUsage}>
                    <MenuItem value="%">%</MenuItem>
                    {!isUsage && <MenuItem value="Days">Days</MenuItem>}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        )}
        {isUsage && (
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Generate WO X units before threshold</InputLabel>
            <TextField fullWidth value={config.generateWoBeforeDueDays} onChange={(e) => handleScheduleFieldChange('generateWoBeforeDueDays', e.target.value, scope)} />
          </Grid>
        )}
        {!isUsage && !isCondition && (
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Generate WO X days before due</InputLabel>
            <TextField fullWidth value={config.generateWoBeforeDueDays} onChange={(e) => handleScheduleFieldChange('generateWoBeforeDueDays', e.target.value, scope)} />
          </Grid>
        )}
        {!isCondition && (
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Lead Time (days){isUsage ? ', optional' : ''}</InputLabel>
            <TextField fullWidth value={config.leadTimeDays} onChange={(e) => handleScheduleFieldChange('leadTimeDays', e.target.value, scope)} />
          </Grid>
        )}
        {isCondition && (
          <Grid size={{ xs: 12, md: 6 }}>
            <InputLabel>Lead Time (days)</InputLabel>
            <TextField fullWidth placeholder="Optional planning preparation time" value={config.leadTimeDays} onChange={(e) => handleScheduleFieldChange('leadTimeDays', e.target.value, scope)} />
          </Grid>
        )}
        <Grid size={{ xs: 12, md: 6 }}>
          <InputLabel>Generate Based On</InputLabel>
          <TextField fullWidth value={config.generateBasedOn} InputProps={{ readOnly: true }} />
        </Grid>
        {renderSwitchRow('Generate only if previous WO is completed')}
        {renderSwitchRow('Create Notification on generation')}
        {renderSwitchRow('Completion required to close cycle', true, undefined, { xs: 12, md: isCondition ? 6 : 12 })}
        {isCondition && renderSwitchRow('Require planner confirmation before official WO generation', config.requirePlannerConfirmation, (checked) => handleScheduleFieldChange('requirePlannerConfirmation', checked, scope), { xs: 12, md: 6 })}
      </Grid>
    );
  };

  const renderSchedulingCard = (config: NewPMSchedulingConfig, scope: 'plan' | 'item') => {
    const helper = getTriggerHelperText(config.triggerType);
    const triggerTitle = config.triggerType === 'Usage-Based' ? 'USAGE TRIGGER' : config.triggerType === 'Condition-Based' ? 'CONDITION TRIGGER' : 'TRIGGER TYPE';
    const rulesTitle = config.triggerType === 'Usage-Based' ? 'USAGE RULES' : config.triggerType === 'Condition-Based' ? 'CONDITION RULES' : 'FREQUENCY RULES';

    return (
      <>
        <Paper elevation={0} sx={{ p: 1.8, mb: 2.4, border: '1px solid #C7D2FE', borderRadius: 2, bgcolor: activeTheme.backgroundDefault }}>
          <Typography sx={{ color: activeTheme.primary, fontWeight: 900, letterSpacing: '0.08em', mb: 1.5 }}>
            {triggerTitle}
          </Typography>
          <FormControl fullWidth sx={{ mb: 1.2 }}>
            <Select value={config.triggerType} onChange={(e) => handleTriggerTypeChange(e.target.value as '' | TriggerType, scope)} displayEmpty renderValue={(value) => value || 'Select trigger type'}>
              <MenuItem value="">Select trigger type</MenuItem>
              {triggerTypes.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
            </Select>
          </FormControl>
          {config.triggerType && (
            <Typography sx={{ color: '#667085', mb: 1.8, fontSize: '0.88rem', lineHeight: 1.35 }}>
              {helper.short} {helper.detail}
            </Typography>
          )}
          {showTriggerTypeWarning && (
            <Alert severity="warning" variant="outlined" sx={{ mb: 1.8, borderRadius: 2, bgcolor: '#FFFBEB', color: '#92400E' }}>
              Changing the trigger type will change which scheduling fields are required for this PM Plan.
            </Alert>
          )}
          <Grid container spacing={{ xs: 1.8, md: 2.2 }}>
            {renderTriggerFields(config, scope)}
          </Grid>
          {helper.preview && (
            <Typography sx={{ color: activeTheme.primary, mt: 1.5, fontSize: '0.9rem', fontWeight: 850 }}>
              {helper.preview}
            </Typography>
          )}
        </Paper>

        <Paper elevation={0} sx={{ p: 1.8, mb: 2.4, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: activeTheme.backgroundDefault }}>
          <Typography sx={{ color: '#667085', fontWeight: 900, letterSpacing: '0.08em', mb: 1.5 }}>
            {rulesTitle}
          </Typography>
          <Grid container spacing={{ xs: 1.8, md: 2.2 }}>
            {renderRulesSection(config, scope)}
          </Grid>
          {config.triggerType === 'Time-Based' && (
            <Typography sx={{ color: '#667085', mt: 1.5, fontSize: '0.88rem' }}>
              Fixed Schedule: next due date is anchored on the planned date regardless of completion.
            </Typography>
          )}
        </Paper>

        <Paper elevation={0} sx={{ p: 1.8, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: activeTheme.backgroundDefault }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.8 }}>
            <Typography sx={{ color: '#667085', fontWeight: 900, letterSpacing: '0.08em' }}>
              WORK ORDER AUTO-GENERATION
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography sx={{ color: '#303744', fontWeight: 850, fontSize: '0.95rem' }}>
                Enable auto-generation
              </Typography>
              <Switch checked={config.autoGenerateWO} onChange={(event) => handleScheduleFieldChange('autoGenerateWO', event.target.checked, scope)} />
            </Box>
          </Box>
          {renderAutoGenerationSection(config, scope)}
        </Paper>
      </>
    );
  };

  const renderSafetyQualityStep = () => (
    <Box
      sx={{
        '& .MuiInputLabel-root': {
          color: '#303744',
          fontWeight: 800,
          fontSize: { xs: '0.86rem', md: '0.95rem' },
          transform: 'none',
          position: 'static',
          mb: 0.75,
        },
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          bgcolor: activeTheme.backgroundDefault,
          fontSize: { xs: '0.9rem', md: '0.98rem' },
          color: '#2F3746',
          minHeight: { xs: 48, md: 54 },
          '& fieldset': { borderColor: '#D9DDE5', borderWidth: 1.5 },
          '&:hover fieldset': { borderColor: '#C7CEDA' },
          '&.Mui-focused fieldset': { borderColor: activeTheme.primaryLight, borderWidth: 2 },
        },
        '& .MuiOutlinedInput-input': {
          py: { xs: 1.2, md: 1.45 },
          px: { xs: 1.4, md: 1.65 },
        },
        '& .MuiSelect-select': {
          py: { xs: 1.2, md: 1.45 },
          px: { xs: 1.4, md: 1.65 },
        },
      }}
    >
      <Box sx={{ mb: 2.4 }}>
        <Typography variant="h6" sx={{ color: '#303744', fontWeight: 850, fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: 1.1 }}>
          Safety & Quality Assurance
        </Typography>
        <Typography sx={{ color: '#667085', mt: 0.35, fontSize: { xs: '0.84rem', md: '0.92rem' }, lineHeight: 1.35 }}>
          Define the safety controls, quality checkpoints, evidence, and release requirements for this maintenance plan.
        </Typography>
      </Box>

      <Grid container spacing={{ xs: 1.8, md: 2.2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 1.8, height: '100%', border: '1px solid #D9DDE5', borderRadius: 2, bgcolor: activeTheme.backgroundPaper }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.6 }}>
              <SafetyIcon sx={{ color: '#0F766E', fontSize: 22 }} />
              <Typography sx={{ color: '#0F766E', fontWeight: 900, letterSpacing: '0.06em' }}>
                SAFETY CONTROLS
              </Typography>
            </Box>
            <Grid container spacing={{ xs: 1.6, md: 1.8 }}>
              {renderSwitchRow('LOTO required', newPlanSafetyQuality.lotoRequired, (checked) => handleSafetyQualityFieldChange('lotoRequired', checked), { xs: 12, md: 6 })}
              {renderSwitchRow('Permit required', newPlanSafetyQuality.permitsRequired, (checked) => handleSafetyQualityFieldChange('permitsRequired', checked), { xs: 12, md: 6 })}
              <Grid size={{ xs: 12, md: 6 }}>
                <InputLabel>Permit Type</InputLabel>
                <FormControl fullWidth>
                  <Select
                    value={newPlanSafetyQuality.safetyPermitType}
                    onChange={(event) => handleSafetyQualityFieldChange('safetyPermitType', event.target.value)}
                    displayEmpty
                    renderValue={(value) => value || 'Select permit type'}
                    disabled={!newPlanSafetyQuality.permitsRequired}
                  >
                    <MenuItem value="">Select permit type</MenuItem>
                    {['Hot Work', 'Confined Space', 'Electrical Work', 'Work at Height', 'Line Break'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <InputLabel>Safety Approval Role</InputLabel>
                <FormControl fullWidth>
                  <Select value={newPlanSafetyQuality.safetyApprovalRole} onChange={(event) => handleSafetyQualityFieldChange('safetyApprovalRole', event.target.value)}>
                    {['EHS Coordinator', 'Maintenance Supervisor', 'Area Owner', 'No approval required'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InputLabel>PPE Requirements</InputLabel>
                <Paper elevation={0} sx={{ p: 1, border: '1px solid #D9DDE5', borderRadius: 2, bgcolor: activeTheme.backgroundDefault, display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {ppeRequirementOptions.map((item) => {
                    const checked = newPlanSafetyQuality.ppeRequirements.includes(item);
                    return (
                      <Chip
                        key={item}
                        icon={<Checkbox checked={checked} sx={{ p: 0, color: '#94A3B8', '&.Mui-checked': { color: '#0F766E' } }} />}
                        label={item}
                        onClick={() => handlePpeRequirementToggle(item)}
                        variant="outlined"
                        sx={{
                          height: 34,
                          borderRadius: 999,
                          color: checked ? '#0F766E' : '#303744',
                          borderColor: checked ? '#99F6E4' : '#D9DDE5',
                          bgcolor: checked ? '#ECFDF5' : activeTheme.backgroundPaper,
                          fontWeight: 850,
                          cursor: 'pointer',
                        }}
                      />
                    );
                  })}
                </Paper>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InputLabel>Hazard Controls</InputLabel>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={newPlanSafetyQuality.hazardControls}
                  onChange={(event) => handleSafetyQualityFieldChange('hazardControls', event.target.value)}
                  placeholder="Energy isolation, guarding, housekeeping, controlled restart..."
                  sx={{ '& .MuiOutlinedInput-root': { alignItems: 'flex-start' } }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <InputLabel>Risk Assessment</InputLabel>
                <FormControl fullWidth>
                  <Select value={newPlanSafetyQuality.riskAssessment} onChange={(event) => handleSafetyQualityFieldChange('riskAssessment', event.target.value)}>
                    {['JSA required before work starts', 'Use existing JSA', 'Dynamic risk assessment', 'Not required'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              {renderSwitchRow('Pre-job brief required', newPlanSafetyQuality.preJobBriefRequired, (checked) => handleSafetyQualityFieldChange('preJobBriefRequired', checked), { xs: 12, md: 6 })}
            </Grid>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper elevation={0} sx={{ p: 1.8, height: '100%', border: '1px solid #D9DDE5', borderRadius: 2, bgcolor: activeTheme.backgroundPaper }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.6 }}>
              <QualityIcon sx={{ color: activeTheme.primary, fontSize: 22 }} />
              <Typography sx={{ color: activeTheme.primary, fontWeight: 900, letterSpacing: '0.06em' }}>
                QUALITY ASSURANCE
              </Typography>
            </Box>
            <Grid container spacing={{ xs: 1.6, md: 1.8 }}>
              {renderSwitchRow('QA checkpoint required', newPlanSafetyQuality.qaRequired, (checked) => handleSafetyQualityFieldChange('qaRequired', checked), { xs: 12, md: 6 })}
              {renderSwitchRow('Line clearance required', newPlanSafetyQuality.lineClearanceRequired, (checked) => handleSafetyQualityFieldChange('lineClearanceRequired', checked), { xs: 12, md: 6 })}
              <Grid size={{ xs: 12, md: 6 }}>
                <InputLabel>QA Procedure</InputLabel>
                <TextField
                  fullWidth
                  value={newPlanSafetyQuality.qaProcedure}
                  onChange={(event) => handleSafetyQualityFieldChange('qaProcedure', event.target.value)}
                  placeholder="e.g. SOP-QA-214"
                />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <InputLabel>QA Approval Role</InputLabel>
                <FormControl fullWidth>
                  <Select value={newPlanSafetyQuality.qaApprovalRole} onChange={(event) => handleSafetyQualityFieldChange('qaApprovalRole', event.target.value)}>
                    {['QA Technician', 'Quality Engineer', 'Area QA Lead', 'Maintenance Supervisor', 'No approval required'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <InputLabel>Inspection Method</InputLabel>
                <FormControl fullWidth>
                  <Select value={newPlanSafetyQuality.inspectionMethod} onChange={(event) => handleSafetyQualityFieldChange('inspectionMethod', event.target.value)}>
                    {['Visual inspection and functional verification', 'Dimensional check', 'Calibration verification', 'Sample inspection', 'No QA inspection'].map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              {renderSwitchRow('Post-maintenance verification', newPlanSafetyQuality.postMaintenanceVerification, (checked) => handleSafetyQualityFieldChange('postMaintenanceVerification', checked), { xs: 12, md: 6 })}
              <Grid size={{ xs: 12 }}>
                <InputLabel>Acceptance Criteria</InputLabel>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={newPlanSafetyQuality.acceptanceCriteria}
                  onChange={(event) => handleSafetyQualityFieldChange('acceptanceCriteria', event.target.value)}
                  placeholder="Expected measurable condition before equipment release"
                  sx={{ '& .MuiOutlinedInput-root': { alignItems: 'flex-start' } }}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InputLabel>Evidence Required</InputLabel>
                <TextField
                  fullWidth
                  value={newPlanSafetyQuality.evidenceRequired}
                  onChange={(event) => handleSafetyQualityFieldChange('evidenceRequired', event.target.value)}
                  placeholder="Photos, checklist, measurements, QA sign-off..."
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <InputLabel>Deviation Handling</InputLabel>
                <TextField
                  fullWidth
                  multiline
                  minRows={3}
                  value={newPlanSafetyQuality.deviationHandling}
                  onChange={(event) => handleSafetyQualityFieldChange('deviationHandling', event.target.value)}
                  placeholder="What happens if inspection fails or a nonconformance is found"
                  sx={{ '& .MuiOutlinedInput-root': { alignItems: 'flex-start' } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const getSafetyQualityReviewRows = () => [
    ['LOTO REQUIRED', newPlanSafetyQuality.lotoRequired ? 'Yes' : 'No'],
    ['PERMIT REQUIRED', newPlanSafetyQuality.permitsRequired ? (newPlanSafetyQuality.safetyPermitType || 'Yes') : 'No'],
    ['PPE REQUIREMENTS', newPlanSafetyQuality.ppeRequirements.length ? newPlanSafetyQuality.ppeRequirements.join(', ') : '-'],
    ['RISK ASSESSMENT', newPlanSafetyQuality.riskAssessment || '-'],
    ['SAFETY APPROVER', newPlanSafetyQuality.safetyApprovalRole || '-'],
    ['QA CHECKPOINT', newPlanSafetyQuality.qaRequired ? 'Required' : 'Not required'],
    ['QA PROCEDURE', newPlanSafetyQuality.qaProcedure || '-'],
    ['QA APPROVER', newPlanSafetyQuality.qaApprovalRole || '-'],
    ['INSPECTION METHOD', newPlanSafetyQuality.inspectionMethod || '-'],
    ['LINE CLEARANCE', newPlanSafetyQuality.lineClearanceRequired ? 'Required' : 'Not required'],
    ['EVIDENCE REQUIRED', newPlanSafetyQuality.evidenceRequired || '-'],
    ['DEVIATION HANDLING', newPlanSafetyQuality.deviationHandling || '-'],
  ];

  const getReviewRows = () => {
    const config = activeSchedule;
    if (config.triggerType === 'Usage-Based') {
      return [
        ['TRIGGER TYPE', config.triggerType || '-'],
        ['COUNTER / METER', config.counterMeter || '-'],
        ['COUNTER TYPE', config.counterType || '-'],
        ['THRESHOLD VALUE', config.thresholdValue || '-'],
        ['UNIT OF MEASURE', config.unitOfMeasure || '-'],
        ['CURRENT COUNTER READING', config.currentCounterReading || '-'],
        ['NEXT DUE COUNTER VALUE', config.nextDueCounterValue || '-'],
        ...(config.estimatedDueDate ? [['ESTIMATED DUE DATE', config.estimatedDueDate]] : []),
        ['READING SOURCE', config.readingSource || '-'],
        ['COUNTER RESET RULE', config.counterResetRule || '-'],
        ['CALL HORIZON BASED ON COUNTER', `${newPlan.callHorizon ?? 80}%`],
      ];
    }

    if (config.triggerType === 'Condition-Based') {
      return [
        ['TRIGGER TYPE', config.triggerType || '-'],
        ['CONDITION SOURCE', config.conditionSource || '-'],
        ['MONITORED PARAMETER', config.monitoredParameter || '-'],
        ['CURRENT VALUE', config.currentValue || '-'],
        ['WARNING THRESHOLD', config.warningThreshold || '-'],
        ['CRITICAL THRESHOLD', config.criticalThreshold || '-'],
        ['THRESHOLD RULE', config.thresholdRule || '-'],
        ['EVALUATION WINDOW', config.evaluationWindow || '-'],
        ['CONDITION STATUS', config.conditionStatus || '-'],
        ['MAINTENANCE GENERATION RULE', config.maintenanceGenerationRule || '-'],
        ['PLANNER CONFIRMATION REQUIRED', config.requirePlannerConfirmation ? 'Yes' : 'No'],
      ];
    }

    return [
      ['TRIGGER TYPE', config.triggerType || '-'],
      ['FREQUENCY', `${config.frequencyValue || '-'} ${config.frequencyUnit || ''}`.trim()],
      ['START DATE', config.startDate || '-'],
      ['DUE DATE', config.dueDateDay ? `Day ${config.dueDateDay}` : '-'],
      ['SCHEDULE TYPE', config.scheduleType || '-'],
      ['EXECUTION WINDOW', `${newPlan.executionWindowDays ?? 7} days`],
      ['TOLERANCE BEFORE / AFTER DUE', `${newPlan.toleranceBeforeDueDays ?? 3} / ${newPlan.toleranceAfterDueDays ?? 5} days`],
      ['CALL HORIZON', formatCallHorizon({ callHorizon: newPlan.callHorizon ?? 80, callHorizonUnit: newPlan.callHorizonUnit || '%' })],
      ['GENERATE WO X DAYS BEFORE DUE', config.generateWoBeforeDueDays || '-'],
    ];
  };

  const renderReferenceObjectNode = (
    node: NewPMReferenceObjectNode,
    selectedId: string,
    expandedIds: Set<string>,
    onSelect: (node: NewPMReferenceObjectNode) => void,
    onToggleExpanded: (nodeId: string) => void,
    depth = 0,
  ): React.ReactNode => {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = selectedId === node.id;
    const iconSx = { fontSize: 20, color: isSelected ? activeTheme.primary : activeTheme.textSecondary };
    const nodeIcon = node.kind === 'component'
      ? <Typography sx={{ width: 20, color: isSelected ? activeTheme.primary : activeTheme.textSecondary, fontSize: 24, fontWeight: 700, lineHeight: 1 }}>#</Typography>
      : node.kind === 'equipment'
        ? <InventoryIcon sx={iconSx} />
        : node.kind === 'system'
          ? <WrenchIcon sx={iconSx} />
          : node.kind === 'assembly'
            ? <GearIcon sx={iconSx} />
            : <ListIcon sx={iconSx} />;

    return (
      <Box key={node.id}>
        <Box
          onClick={() => onSelect(node)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            minHeight: 42,
            pl: 1 + depth * 3,
            pr: 1.2,
            borderRadius: 2,
            cursor: 'pointer',
            bgcolor: isSelected ? '#EEF3FF' : 'transparent',
            color: isSelected ? activeTheme.primary : '#303744',
            '&:hover': {
              bgcolor: isSelected ? '#EEF3FF' : activeTheme.backgroundDefault,
            },
          }}
        >
          {hasChildren ? (
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                onToggleExpanded(node.id);
              }}
              sx={{ p: 0.1, color: activeTheme.textSecondary }}
            >
              {isExpanded ? <ExpandMoreIcon fontSize="small" /> : <ChevronRightIcon fontSize="small" />}
            </IconButton>
          ) : (
            <Box sx={{ width: 24 }} />
          )}
          {nodeIcon}
          <Typography
            sx={{
              flex: 1,
              minWidth: 0,
              fontSize: { xs: '0.92rem', md: '1rem' },
              fontWeight: isSelected ? 900 : 760,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {node.label}
          </Typography>
        </Box>
        {hasChildren && isExpanded ? (
          <Box>
            {node.children?.map((child) => renderReferenceObjectNode(child, selectedId, expandedIds, onSelect, onToggleExpanded, depth + 1))}
          </Box>
        ) : null}
      </Box>
    );
  };

  const renderNewPMReferenceObjectNode = (node: NewPMReferenceObjectNode, depth = 0): React.ReactNode => (
    renderReferenceObjectNode(
      node,
      selectedReferenceObjectId,
      expandedNewPMReferenceObjectIds,
      handleSelectNewPMReferenceObject,
      toggleNewPMReferenceObjectExpanded,
      depth,
    )
  );

  const generateWOValidation = generateWOPlan ? getGenerateWOValidation(generateWOPlan) : null;
  const generateWOTaskListId = generateWOPlan?.taskListName?.match(/\(([^)]+)\)/)?.[1] || '';
  const generateWOTaskList = taskListExamples.find((taskList) => taskList.id === generateWOTaskListId);
  const generateWORequiredSkills = generateWOTaskList
    ? Array.from(new Set(generateWOTaskList.operations.map((operation) => operation.skill))).join(', ')
    : generateWOPlan?.workCenter || '-';
  const generateWOTotalDuration = generateWOTaskList?.totalDuration || `${generateWOPlan?.durationHours || 0}h`;
  const generateWOSparePartsCount = generateWOPlan?.taskListDetails?.parts ?? 0;
  const generateWOSafetyNotes = generateWOPlan?.notes || 'No safety notes available.';

  if (isGeneralTaskListOpen) {
    return (
      <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
        <GeneralTaskListScreen
          onBack={() => setIsGeneralTaskListOpen(false)}
          onNotify={(message, severity = 'info') => setSnackbar({ open: true, message, severity })}
          initialMode={generalTaskListInitialMode}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
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

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: tokenNeutral.lighter, p: addDialogHostOnly ? 0 : { xs: 2, md: 3 } }}>
      {!addDialogHostOnly && (
        <>
          {/* Header */}
          <Box
            sx={{
              mb: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  color: tokenText.primary,
                  fontWeight: 700,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  lineHeight: 1.334,
                }}
              >
                Maintenance Plan
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {onNavigateToPlanner ? (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CalendarTodayIcon />}
                  onClick={onNavigateToPlanner}
                  sx={{
                    color: tokenBrand.main,
                    borderColor: tokenBrand.main,
                    textTransform: 'none',
                    fontWeight: 500,
                    borderRadius: '8px',
                    px: 1.8,
                    py: 0.8,
                    '&:hover': {
                      borderColor: tokenBrand.dark,
                      bgcolor: tokenBrand.softBg,
                    },
                  }}
                >
                  Planner Calendar
                </Button>
              ) : null}
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => handleOpenGeneralTaskList('browse')}
                sx={{
                  bgcolor: tokenBrand.main,
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: '8px',
                  px: 1.8,
                  py: 0.8,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: tokenBrand.dark,
                    boxShadow: 'none',
                  },
                }}
              >
                General Operations
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  resetNewPlanForm();
                  setEditingPlan(null);
                  setIsEditDialogOpen(false);
                  setIsAddDialogOpen(true);
                }}
                sx={{
                  bgcolor: tokenBrand.main,
                  color: '#FFFFFF',
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: '8px',
                  px: 2,
                  py: 0.8,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: tokenBrand.dark,
                    boxShadow: 'none',
                  },
                }}
              >
                New PM Plan
              </Button>
            </Box>
          </Box>

          {/* Main Card Container */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: `1px solid ${tokenDivider}`,
              bgcolor: 'background.paper',
            }}
          >

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '360px minmax(0, 1fr)', xl: '380px minmax(0, 1fr)' }, gap: 1.8 }}>
              <Paper
                elevation={0}
                sx={{
                  border: `1px solid ${tokenDivider}`,
                  borderRadius: '16px',
                  bgcolor: 'background.paper',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ px: 1.5, py: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                    <Typography variant="subtitle1" sx={{ color: tokenText.primary, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <HierarchyIcon sx={{ color: tokenBrand.main, fontSize: 19 }} />
                      Asset Hierarchy
                    </Typography>
                    {assetHierarchyFilter ? (
                      <IconButton
                        size="small"
                        onClick={() => setAssetHierarchyFilter(null)}
                        aria-label="Clear hierarchy"
                        sx={{ width: 28, height: 28, color: tokenText.secondary, '&:hover': { bgcolor: tokenBrand.softBg, color: tokenBrand.main } }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    ) : null}
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search asset..."
                    value={assetHierarchySearch}
                    onChange={(event) => setAssetHierarchySearch(event.target.value)}
                    sx={{ mt: 1.1, '& .MuiOutlinedInput-root': { height: 32, borderRadius: '8px', bgcolor: 'background.paper' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: tokenDivider }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: tokenBrand.main }, '& .MuiInputBase-input': { fontSize: '0.875rem' } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: tokenText.secondary, fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mt: 1.1 }}>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'flex', alignItems: 'center', gap: 0.45 }}>
                      <MaintenancePlanStatusDot color={tokenSuccess.main} /> Healthy
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'flex', alignItems: 'center', gap: 0.45 }}>
                      <MaintenancePlanStatusDot color={tokenWarning.main} /> Warning
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokenText.secondary, display: 'flex', alignItems: 'center', gap: 0.45 }}>
                      <MaintenancePlanStatusDot color={tokenError.main} /> Critical
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ borderTop: `1px solid ${tokenDivider}`, py: 1, pr: 1, flex: 1, maxHeight: { xs: 360, lg: 'none' }, overflowY: 'auto' }}>
                  {visibleMaintenancePlanHierarchyTree.map((node) => (
                    <MaintenancePlanHierarchyRow
                      key={node.id}
                      depth={0}
                      expandedIds={expandedAssetHierarchyIds}
                      node={node}
                      onSelect={setAssetHierarchyFilter}
                      onToggle={(nodeId) => {
                        setExpandedAssetHierarchyIds((current) => {
                          const next = new Set(current);
                          if (next.has(nodeId)) {
                            next.delete(nodeId);
                          } else {
                            next.add(nodeId);
                          }
                          return next;
                        });
                      }}
                      path={[]}
                      selectedId={assetHierarchyFilter?.id}
                    />
                  ))}
                </Box>
              </Paper>
              <Box sx={{ minWidth: 0 }}>
                {/* Filter Toolbar */}
                <Paper
                  elevation={0}
                  sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: '12px',
                    border: `1px solid ${tokenDivider}`,
                    bgcolor: tokenNeutral.lightest,
                  }}
                >
                  <Grid container spacing={1.5} alignItems="center">
                    {/* Search Input */}
                    <Grid size={{ xs: 12, md: 4 }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        label="Search"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <SearchIcon sx={{ color: tokenText.secondary, fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                          },
                        }}
                      />
                    </Grid>

                    {/* Dropdown filters */}
                    <Grid size={{ xs: 6, sm: 2.5, md: 2 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={statusFilter}
                          label="Status"
                          onChange={(e) => setStatusFilter(e.target.value)}
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value="All">All Statuses</MenuItem>
                          <MenuItem value="Active">Active</MenuItem>
                          <MenuItem value="Draft">Draft</MenuItem>
                          <MenuItem value="Paused">Paused</MenuItem>
                          <MenuItem value="Archived">Archived</MenuItem>
                          <MenuItem value="Inactive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 2.5, md: 2 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Frequency</InputLabel>
                        <Select
                          value={frequencyFilter}
                          label="Frequency"
                          onChange={(e) => setFrequencyFilter(e.target.value)}
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value="All">All Frequencies</MenuItem>
                          <MenuItem value="Daily">Daily</MenuItem>
                          <MenuItem value="Weekly">Weekly</MenuItem>
                          <MenuItem value="Bi-Weekly">Bi-Weekly</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 6, sm: 2.5, md: 2 }}>
                      <FormControl size="small" fullWidth>
                        <InputLabel>Criticality</InputLabel>
                        <Select
                          value={criticalityFilter}
                          label="Criticality"
                          onChange={(e) => setCriticalityFilter(e.target.value)}
                          sx={{ borderRadius: '12px' }}
                        >
                          <MenuItem value="All">All Criticality</MenuItem>
                          <MenuItem value="A">Criticality A</MenuItem>
                          <MenuItem value="B">Criticality B</MenuItem>
                          <MenuItem value="C">Criticality C</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    {/* Badge/Count */}
                    <Grid size={{ xs: 6, sm: 2.5, md: 2 }} sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                      <Chip
                        label={`${filteredPlans.length} PM Schedules`}
                        sx={{
                          bgcolor: tokenNeutral.lighter,
                          color: tokenText.primary,
                          fontWeight: 600,
                          fontSize: '0.78rem',
                          borderRadius: '999px',
                          border: `1px solid ${tokenDivider}`,
                          height: 36,
                        }}
                      />
                    </Grid>


                  </Grid>
                </Paper>

                {/* PM Cards List */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {filteredPlans.map((plan) => {
                    const freqStyle = getFrequencyPillStyle(plan.frequencyLabel);
                    const critStyle = getCriticalityPillStyle(plan.criticality);
                    const isMaintenanceItemsOpen = !!expandedMaintenanceItems[plan.id];
                    const planMaintenanceItems = plan.maintenanceItems || [];

                    return (
                      <Paper
                        key={plan.id}
                        elevation={0}
                        sx={{
                          p: 2.2,
                          borderRadius: '12px',
                          border: `1px solid ${tokenDivider}`,
                          bgcolor: 'background.paper',
                          boxShadow: 'none',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: tokenNeutral.lightest,
                          },
                        }}
                      >
                        {/* Card Header */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          {/* Left: Gear Icon & Title */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.4 }}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                bgcolor: tokenNeutral.lighter,
                                color: tokenBrand.main,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <GearIcon sx={{ fontSize: 18 }} />
                            </Box>
                            <Box>
                              <Typography variant="subtitle2" sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.875rem', lineHeight: 1.2 }}>
                                {plan.id} • {plan.assetName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.74rem' }}>
                                {plan.zone} • {plan.area} • {plan.line}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Right: Badges */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={freqStyle.label}
                              size="small"
                              sx={{
                                bgcolor: freqStyle.bg,
                                color: freqStyle.color,
                                borderColor: 'transparent',
                                fontSize: '0.7rem',
                                height: 22,
                                borderRadius: '999px',
                                fontWeight: 600,
                              }}
                            />
                            <Chip
                              label={plan.criticality}
                              size="small"
                              sx={{
                                bgcolor: critStyle.bg,
                                color: critStyle.color,
                                borderColor: tokenDivider,
                                fontSize: '0.7rem',
                                height: 22,
                                width: 26,
                                minWidth: 26,
                                borderRadius: '999px',
                                '& .MuiChip-label': { px: 0, textAlign: 'center' },
                                fontWeight: 600,
                              }}
                            />
                            <CheckCircleIcon sx={{ color: tokenSuccess.main, fontSize: 18 }} />
                          </Box>
                        </Box>

                        {/* Card Parameters Grid */}
                        <Grid container spacing={1.5} sx={{ mb: 2, pb: 1.8, borderBottom: `1px solid ${tokenDivider}` }}>
                          {/* Parameter: Frequency */}
                          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ClockIcon sx={{ color: tokenText.secondary, fontSize: 16 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.66rem', display: 'block', textTransform: 'uppercase', fontWeight: 500 }}>
                                  Frequency
                                </Typography>
                                <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 400, fontSize: '0.8rem' }}>
                                  Every {plan.frequencyDays} days
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          {/* Parameter: Strategy */}
                          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <GearIcon sx={{ color: tokenText.secondary, fontSize: 16 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.66rem', display: 'block', textTransform: 'uppercase', fontWeight: 500 }}>
                                  Strategy
                                </Typography>
                                <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 400, fontSize: '0.8rem' }}>
                                  {plan.strategy}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          {/* Parameter: Duration */}
                          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <WrenchIcon sx={{ color: tokenText.secondary, fontSize: 16 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.66rem', display: 'block', textTransform: 'uppercase', fontWeight: 500 }}>
                                  Duration
                                </Typography>
                                <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 400, fontSize: '0.8rem' }}>
                                  {plan.durationHours}h
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          {/* Parameter: Work Center */}
                          <Grid size={{ xs: 6, sm: 4, md: 2.4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <GearIcon sx={{ color: tokenText.secondary, fontSize: 16 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.66rem', display: 'block', textTransform: 'uppercase', fontWeight: 500 }}>
                                  Work Center
                                </Typography>
                                <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 400, fontSize: '0.8rem' }}>
                                  {plan.workCenter}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>

                          {/* Parameter: Compliance */}
                          <Grid size={{ xs: 12, sm: 4, md: 2.4 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {plan.compliance === 'On Track' ? (
                                <CheckCircleIcon sx={{ color: tokenSuccess.main, fontSize: 16 }} />
                              ) : (
                                <WarningIcon sx={{ color: plan.compliance === 'At Risk' ? tokenWarning.main : tokenError.main, fontSize: 16 }} />
                              )}
                              <Box>
                                <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.66rem', display: 'block', textTransform: 'uppercase', fontWeight: 500 }}>
                                  Compliance
                                </Typography>
                                <Typography variant="body2" sx={{ color: plan.compliance === 'On Track' ? tokenSuccess.main : plan.compliance === 'At Risk' ? tokenWarning.main : tokenError.main, fontWeight: 600, fontSize: '0.8rem' }}>
                                  {plan.compliance}
                                </Typography>
                              </Box>
                            </Box>
                          </Grid>
                        </Grid>

                        {/* Date / Horizon Details */}
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 3,
                            flexWrap: 'wrap',
                            mb: plan.taskListName ? 1.5 : 2,
                            color: tokenText.secondary,
                          }}
                        >
                          <Typography variant="caption" sx={{ fontSize: '0.74rem' }}>
                            Last Executed: <Box component="span" sx={{ color: tokenText.primary, fontWeight: 500 }}>{plan.lastExecuted}</Box>
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.74rem' }}>
                            Next Due: <Box component="span" sx={{ color: tokenText.primary, fontWeight: 500 }}>{plan.nextDue}</Box>
                          </Typography>
                          <Typography variant="caption" sx={{ fontSize: '0.74rem' }}>
                            Call Horizon: <Box component="span" sx={{ color: tokenText.primary, fontWeight: 500 }}>{formatCallHorizon(plan)}</Box>
                          </Typography>
                        </Box>

                        {/* Nested Maintenance Items Panel (Expandable) */}
                        {(planMaintenanceItems.length > 0 || plan.taskListName) && (
                          <Collapse in={isMaintenanceItemsOpen}>
                            <Box
                              sx={{
                                mb: 2,
                                p: 1.5,
                                borderRadius: '12px',
                                bgcolor: tokenNeutral.lighter,
                                border: `1px solid ${tokenDivider}`,
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: planMaintenanceItems.length > 0 ? 1.5 : 0 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <InventoryIcon sx={{ color: tokenText.secondary, fontSize: 16 }} />
                                  <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 600, fontSize: '0.76rem' }}>
                                    Maintenance Items
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1.5 }}>
                                  <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.74rem' }}>
                                    <Box component="span" sx={{ fontWeight: 600, color: tokenText.primary }}>{planMaintenanceItems.length || plan.taskListDetails?.steps || 1}</Box> items
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: tokenText.secondary, fontSize: '0.74rem' }}>
                                    <Box component="span" sx={{ fontWeight: 600, color: tokenText.primary }}>{plan.taskListDetails?.steps ?? getMaintenanceItemsOperationCount(planMaintenanceItems)}</Box> operations
                                  </Typography>
                                </Box>
                              </Box>
                              {planMaintenanceItems.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  {planMaintenanceItems.map((maintenanceItem) => {
                                    const itemTaskList = taskListExamples.find((taskList) => taskList.id === maintenanceItem.taskListId);
                                    const itemOperations = getMaintenanceItemOperations(maintenanceItem);
                                    return (
                                      <Box
                                        key={maintenanceItem.id}
                                        sx={{
                                          p: 1.5,
                                          borderRadius: '8px',
                                          border: `1px solid ${tokenDivider}`,
                                          bgcolor: 'background.paper',
                                        }}
                                      >
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1, flexWrap: 'wrap', mb: 1.25 }}>
                                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, minWidth: 0 }}>
                                            <Chip
                                              size="small"
                                              label={`Item ${maintenanceItem.id}`}
                                              sx={{ bgcolor: tokenBrand.softBg, color: tokenBrand.main, fontWeight: 600, fontSize: '0.68rem', borderRadius: '999px', flexShrink: 0 }}
                                            />
                                            <Box sx={{ minWidth: 0 }}>
                                              <Typography sx={{ color: tokenText.primary, fontWeight: 600, fontSize: '0.78rem', lineHeight: 1.25 }}>
                                                {maintenanceItem.equipment || 'No reference object selected'}
                                              </Typography>
                                              <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', lineHeight: 1.35, mt: 0.25 }}>
                                                {maintenanceItem.referenceObjectPath || plan.assetName}
                                              </Typography>
                                            </Box>
                                          </Box>
                                          <Chip
                                            size="small"
                                            label={itemTaskList?.activityType || plan.strategy || 'Maintenance'}
                                            sx={{ bgcolor: tokenSuccess.softBg, color: tokenSuccess.darker, fontWeight: 600, fontSize: '0.68rem', borderRadius: '999px' }}
                                          />
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8, minWidth: 0, mb: 1.25 }}>
                                          <DocumentIcon sx={{ color: tokenText.secondary, fontSize: 15, flexShrink: 0 }} />
                                          <Box sx={{ minWidth: 0 }}>
                                            <Typography sx={{ color: tokenText.secondary, fontWeight: 500, fontSize: '0.72rem', lineHeight: 1.3 }}>
                                              {itemTaskList ? `${itemTaskList.id} · ${itemTaskList.group}/${itemTaskList.counter} · ${itemTaskList.title}` : maintenanceItem.taskListId || 'No task list selected'}
                                            </Typography>
                                            <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', lineHeight: 1.35, mt: 0.25 }}>
                                              {itemTaskList?.itemDescription || 'No task list details available for this item.'}
                                            </Typography>
                                          </Box>
                                        </Box>
                                        <Grid container spacing={1} sx={{ mb: itemOperations.length ? 1.5 : 0 }}>
                                          {[
                                            ['Work Center', itemTaskList?.defaultWorkCenter || plan.mainWorkCenter || plan.workCenter],
                                            ['Required Skill', itemTaskList?.requiredSkill || plan.workCenter],
                                            ['Duration', itemTaskList?.totalDuration || `${plan.durationHours}h`],
                                            ['Operations', itemOperations.length],
                                            ['Attachments', maintenanceItem.attachments.length],
                                          ].map(([label, value]) => (
                                            <Grid key={`${maintenanceItem.id}-${label}`} size={{ xs: 6, sm: 4, md: 2.4 }}>
                                              <Typography sx={{ color: tokenText.secondary, fontWeight: 500, fontSize: '0.62rem', textTransform: 'uppercase', lineHeight: 1.2 }}>
                                                {label}
                                              </Typography>
                                              <Typography sx={{ color: tokenText.primary, fontWeight: 400, fontSize: '0.72rem', lineHeight: 1.3, mt: 0.25 }}>
                                                {value || '-'}
                                              </Typography>
                                            </Grid>
                                          ))}
                                        </Grid>
                                        {itemOperations.length ? (
                                          <Box sx={{ mt: 1.25, pt: 1.25, borderTop: `1px solid ${tokenDivider}` }}>
                                            <Typography sx={{ color: tokenText.secondary, fontWeight: 600, fontSize: '0.64rem', letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1 }}>
                                              Operations
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.65 }}>
                                              {itemOperations.map((operation) => (
                                                <Box
                                                  key={`${maintenanceItem.id}-${operation.op}`}
                                                  sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: { xs: '44px 1fr', md: '44px 1fr 86px 92px' },
                                                    gap: 0.8,
                                                    alignItems: 'center',
                                                  }}
                                                >
                                                  <Typography sx={{ color: tokenBrand.main, fontWeight: 600, fontSize: '0.68rem' }}>
                                                    {operation.op}
                                                  </Typography>
                                                  <Typography sx={{ color: tokenText.primary, fontSize: '0.7rem', lineHeight: 1.3 }}>
                                                    {operation.description}
                                                  </Typography>
                                                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', display: { xs: 'none', md: 'block' } }}>
                                                    {operation.workCenter}
                                                  </Typography>
                                                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.68rem', display: { xs: 'none', md: 'block' } }}>
                                                    {operation.duration}
                                                  </Typography>
                                                </Box>
                                              ))}
                                            </Box>
                                          </Box>
                                        ) : null}
                                      </Box>
                                    );
                                  })}
                                </Box>
                              ) : (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <DocumentIcon sx={{ color: tokenText.secondary, fontSize: 16 }} />
                                  <Typography variant="body2" sx={{ color: tokenText.primary, fontWeight: 500, fontSize: '0.76rem' }}>
                                    {plan.taskListName}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Collapse>
                        )}

                        {/* Actions Toolbar */}
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 1.5,
                          }}
                        >
                          {/* Left: Secondary actions */}
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<AddIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleOpenAddPlanMaintenanceItem(plan)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontSize: '0.74rem',
                                fontWeight: 500,
                                py: 0.6,
                                px: 1.3,
                                borderColor: tokenBrand.main,
                                color: tokenBrand.main,
                                '&:hover': {
                                  borderColor: tokenBrand.dark,
                                  bgcolor: tokenBrand.softBg,
                                },
                              }}
                            >
                              Add Maintenance Item
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ListIcon sx={{ fontSize: 14 }} />}
                              onClick={() => (planMaintenanceItems.length > 0 || plan.taskListName) ? handleToggleMaintenanceItems(plan.id) : handleActionMock('View Maintenance Items', plan.id)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontSize: '0.74rem',
                                fontWeight: 500,
                                py: 0.6,
                                px: 1.3,
                                borderColor: tokenDivider,
                                color: tokenText.secondary,
                                '&:hover': {
                                  borderColor: tokenText.primary,
                                  bgcolor: tokenNeutral.lighter,
                                },
                              }}
                            >
                              {(planMaintenanceItems.length > 0 || plan.taskListName) ? (isMaintenanceItemsOpen ? 'Hide Maintenance Items' : 'View Maintenance Items') : 'View Maintenance Items'}
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<EditIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleOpenEditPlan(plan)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontSize: '0.74rem',
                                fontWeight: 500,
                                py: 0.6,
                                px: 1.3,
                                borderColor: tokenDivider,
                                color: tokenText.secondary,
                                '&:hover': {
                                  borderColor: tokenText.primary,
                                  bgcolor: tokenNeutral.lighter,
                                },
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<CloneIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleClonePlan(plan)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontSize: '0.74rem',
                                fontWeight: 500,
                                py: 0.6,
                                px: 1.3,
                                borderColor: tokenDivider,
                                color: tokenText.secondary,
                                '&:hover': {
                                  borderColor: tokenText.primary,
                                  bgcolor: tokenNeutral.lighter,
                                },
                              }}
                            >
                              Clone
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<DeleteIcon sx={{ fontSize: 14 }} />}
                              onClick={() => handleOpenDeleteArchivePlan(plan)}
                              sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                fontSize: '0.74rem',
                                fontWeight: 500,
                                py: 0.6,
                                px: 1.3,
                                borderColor: tokenError.main,
                                color: tokenError.main,
                                '&:hover': {
                                  borderColor: tokenError.dark,
                                  bgcolor: tokenError.softBg,
                                },
                              }}
                            >
                              Delete/Archive
                            </Button>
                          </Box>

                          {/* Right: Action Trigger */}
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<PlayIcon />}
                            onClick={() => handleGenerateWorkOrder(plan.id, plan.assetName)}
                            sx={{
                              textTransform: 'none',
                              borderRadius: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 500,
                              py: 0.75,
                              px: 2,
                              bgcolor: tokenBrand.main,
                              color: '#FFFFFF',
                              boxShadow: 'none',
                              '&:hover': {
                                bgcolor: tokenBrand.dark,
                                boxShadow: 'none',
                              },
                            }}
                          >
                            Generate WO
                          </Button>
                        </Box>
                      </Paper>
                    );
                  })}

                  {filteredPlans.length === 0 && (
                    <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        border: '1px dashed #CBD5E1',
                        borderRadius: 3.5,
                      }}
                    >
                      <WarningIcon sx={{ color: '#F59E0B', fontSize: 32, mb: 1 }} />
                      <Typography variant="h6" sx={{ color: activeTheme.textPrimary, fontWeight: 800 }}>
                        No PM plans found
                      </Typography>
                      <Typography variant="body2" sx={{ color: activeTheme.textSecondary, mt: 0.5 }}>
                        Try adjusting your search criteria or filter selections.
                      </Typography>
                    </Paper>
                  )}
                </Box>
              </Box>
            </Box>
          </Paper>
        </>
      )}

      {/* Generate Work Order Review Dialog */}
      <Dialog
        open={!!generateWOPlan}
        onClose={handleCloseGenerateWorkOrder}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            bgcolor: activeTheme.backgroundDefault,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, md: 3 },
            pt: { xs: 2, md: 2.4 },
            pb: 1.6,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: '1px solid #D9DDE5',
            bgcolor: activeTheme.backgroundPaper,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PlayIcon sx={{ color: activeTheme.primary, fontSize: 25 }} />
              <Typography variant="h5" sx={{ color: '#2F3746', fontWeight: 850, fontSize: { xs: '1.3rem', md: '1.6rem' }, lineHeight: 1.1 }}>
                Generate Work Order
              </Typography>
            </Box>
            <Typography sx={{ color: '#667085', mt: 0.65, fontSize: { xs: '0.86rem', md: '0.98rem' }, fontWeight: 600 }}>
              Review the preventive maintenance work order before generation.
            </Typography>
          </Box>
          <IconButton
            aria-label="Close generate work order dialog"
            onClick={handleCloseGenerateWorkOrder}
            sx={{ color: '#606978', mt: -1, mr: -1 }}
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.6 }, bgcolor: activeTheme.backgroundDefault }}>
          {generateWOPlan && generateWOValidation ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
              {generateWOValidation.duplicateWorkOrder ? (
                <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2, bgcolor: '#FFF7ED', fontWeight: 800 }}>
                  An open Work Order already exists for this PM cycle.
                </Alert>
              ) : generateWOValidation.blockingIssues.length > 0 ? (
                <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2, bgcolor: '#FFFBEB' }}>
                  <Typography sx={{ fontWeight: 850, fontSize: '0.88rem', mb: 0.4 }}>
                    Resolve validation issues before generating.
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2.2 }}>
                    {generateWOValidation.blockingIssues.map((issue) => (
                      <Box key={issue} component="li" sx={{ fontSize: '0.82rem', fontWeight: 700 }}>
                        {issue}
                      </Box>
                    ))}
                  </Box>
                </Alert>
              ) : generateWOValidation.isInsideCallHorizon ? (
                <Alert severity="success" variant="outlined" sx={{ borderRadius: 2, bgcolor: '#F0FDF4', fontWeight: 850 }}>
                  Ready to generate. This work order is within the call horizon.
                </Alert>
              ) : (
                <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2, bgcolor: '#FFF7ED', fontWeight: 850 }}>
                  This work order is not yet inside the call horizon. Manual generation requires confirmation.
                </Alert>
              )}

              <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper elevation={0} sx={{ height: '100%', p: 1.8, border: '1px solid #D9DDE5', borderRadius: 2, bgcolor: activeTheme.backgroundPaper }}>
                    <Typography sx={{ color: activeTheme.primary, fontWeight: 900, letterSpacing: '0.08em', fontSize: '0.75rem', mb: 1.4 }}>
                      PM PLAN SUMMARY
                    </Typography>
                    <Grid container spacing={1.2}>
                      {[
                        ['PM Plan ID', generateWOPlan.id],
                        ['Asset / Equipment name', generateWOPlan.assetName],
                        ['Functional Location or area', `${generateWOPlan.zone} / ${generateWOPlan.area} / ${generateWOPlan.line}`],
                        ['Frequency', generateWOPlan.frequencyLabel],
                        ['Strategy', generateWOPlan.strategy],
                        ['Work Center', generateWOPlan.workCenter],
                        ['Estimated Duration', `${generateWOPlan.durationHours}h`],
                        ['Priority', generateWOPlan.priority || criticalityToPriority(generateWOPlan.criticality)],
                        ['Compliance status', generateWOPlan.compliance],
                        ['Last Executed date', generateWOPlan.lastExecuted],
                        ['Next Due date', generateWOPlan.nextDue],
                        ['Call Horizon', formatCallHorizon(generateWOPlan)],
                      ].map(([label, value]) => (
                        <Grid key={label} size={{ xs: 12, sm: 6 }}>
                          <Typography sx={{ color: activeTheme.textSecondary, fontWeight: 850, fontSize: '0.7rem', textTransform: 'uppercase', lineHeight: 1.2 }}>
                            {label}
                          </Typography>
                          <Typography sx={{ color: '#303744', fontWeight: 850, fontSize: '0.88rem', lineHeight: 1.35, mt: 0.25 }}>
                            {value || '-'}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Paper elevation={0} sx={{ height: '100%', p: 1.8, border: '1px solid #D9DDE5', borderRadius: 2, bgcolor: activeTheme.backgroundPaper }}>
                    <Typography sx={{ color: activeTheme.primary, fontWeight: 900, letterSpacing: '0.08em', fontSize: '0.75rem', mb: 1.4 }}>
                      WORK ORDER DETAILS
                    </Typography>
                    <Grid container spacing={1.2}>
                      {[
                        ['Work Order Type', 'Preventive Maintenance'],
                        ['Priority', generateWOPlan.priority || criticalityToPriority(generateWOPlan.criticality)],
                        ['Basic Start Date', formatWODate(generateWOValidation.basicStartDate)],
                        ['Basic Finish Date', formatWODate(generateWOValidation.basicFinishDate)],
                        ['Due Date', formatWODate(generateWOValidation.nextDueDate)],
                        ['Assigned Work Center', generateWOPlan.mainWorkCenter || generateWOPlan.workCenter],
                        ['Planner Group', generateWOPlan.plannerGroup || generateWOPlan.line || '-'],
                      ].map(([label, value]) => (
                        <Grid key={label} size={{ xs: 12, sm: 6 }}>
                          <Typography sx={{ color: activeTheme.textSecondary, fontWeight: 850, fontSize: '0.7rem', textTransform: 'uppercase', lineHeight: 1.2 }}>
                            {label}
                          </Typography>
                          <Typography sx={{ color: '#303744', fontWeight: 850, fontSize: '0.88rem', lineHeight: 1.35, mt: 0.25 }}>
                            {value || '-'}
                          </Typography>
                        </Grid>
                      ))}
                      <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          multiline
                          minRows={3}
                          label="Notes"
                          value={generateWONotes}
                          onChange={(event) => setGenerateWONotes(event.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            mt: 0.8,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              bgcolor: activeTheme.backgroundDefault,
                              '& fieldset': { borderColor: '#D9DDE5' },
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Paper elevation={0} sx={{ p: 1.8, border: '1px solid #D9DDE5', borderRadius: 2, bgcolor: activeTheme.backgroundPaper }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.4, flexWrap: 'wrap', mb: 1.4 }}>
                      <Typography sx={{ color: activeTheme.primary, fontWeight: 900, letterSpacing: '0.08em', fontSize: '0.75rem' }}>
                        TASK LIST PREVIEW
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ListIcon />}
                        disabled={!generateWOPlan.taskListName}
                        onClick={() => {
                          setExpandedMaintenanceItems((prev) => ({ ...prev, [generateWOPlan.id]: true }));
                          setSnackbar({ open: true, message: 'Maintenance items opened on the PM Plan card.', severity: 'info' });
                        }}
                        sx={{
                          textTransform: 'none',
                          borderRadius: 2,
                          borderColor: '#D9DDE5',
                          color: '#303744',
                          fontWeight: 850,
                        }}
                      >
                        View Maintenance Items
                      </Button>
                    </Box>
                    <Grid container spacing={1.2}>
                      {[
                        ['Linked Task List name or ID', generateWOPlan.taskListName || '-'],
                        ['Number of operations', generateWOPlan.taskListDetails?.steps ?? generateWOTaskList?.operations.length ?? 0],
                        ['Total estimated duration', generateWOTotalDuration],
                        ['Required skills', generateWORequiredSkills],
                        ['Required spare parts count', generateWOSparePartsCount],
                        ['Safety notes', generateWOSafetyNotes],
                      ].map(([label, value]) => (
                        <Grid key={label} size={{ xs: 12, md: label === 'Safety notes' ? 12 : 4 }}>
                          <Typography sx={{ color: activeTheme.textSecondary, fontWeight: 850, fontSize: '0.7rem', textTransform: 'uppercase', lineHeight: 1.2 }}>
                            {label}
                          </Typography>
                          <Typography sx={{ color: '#303744', fontWeight: 850, fontSize: '0.88rem', lineHeight: 1.35, mt: 0.25 }}>
                            {value || '-'}
                          </Typography>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          ) : null}
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 1.4, md: 1.7 },
            borderTop: '1px solid #D9DDE5',
            bgcolor: activeTheme.backgroundPaper,
            gap: 1,
          }}
        >
          <Button
            onClick={handleCloseGenerateWorkOrder}
            sx={{ color: '#303744', textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', px: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleCreateWorkOrder('Draft')}
            variant="outlined"
            disabled={!generateWOValidation?.canGenerate}
            sx={{
              color: '#303744',
              borderColor: '#D9DDE5',
              textTransform: 'none',
              fontWeight: 850,
              borderRadius: 2,
              px: 2.3,
              py: 0.9,
              fontSize: '0.95rem',
            }}
          >
            Generate Draft WO
          </Button>
          <Button
            onClick={() => handleCreateWorkOrder('Open')}
            variant="contained"
            startIcon={<PlayIcon />}
            disabled={!generateWOValidation?.canGenerate}
            sx={{
              bgcolor: activeTheme.primary,
              color: activeTheme.backgroundPaper,
              textTransform: 'none',
              fontWeight: 850,
              borderRadius: 2,
              px: 2.5,
              py: 0.95,
              fontSize: '0.95rem',
              '&:hover': {
                bgcolor: activeTheme.primaryLight,
              },
            }}
          >
            Generate Work Order
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete / Archive Confirmation Dialog */}
      <Dialog
        open={!!deleteArchivePlan}
        onClose={handleCloseDeleteArchivePlan}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            bgcolor: activeTheme.backgroundPaper,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, md: 3 },
            pt: { xs: 2, md: 2.4 },
            pb: 1.4,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: '1px solid #FEE2E2',
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DeleteIcon sx={{ color: '#DC2626', fontSize: 24 }} />
              <Typography variant="h5" sx={{ color: '#2F3746', fontWeight: 850, fontSize: { xs: '1.18rem', md: '1.42rem' }, lineHeight: 1.1 }}>
                Delete or Archive PM Plan?
              </Typography>
            </Box>
            <Typography sx={{ color: '#667085', mt: 0.65, fontSize: { xs: '0.84rem', md: '0.94rem' }, fontWeight: 600 }}>
              Are you sure you want to continue with {deleteArchivePlan?.id || 'this PM plan'}?
            </Typography>
          </Box>
          <IconButton
            aria-label="Close delete or archive confirmation dialog"
            onClick={handleCloseDeleteArchivePlan}
            sx={{ color: '#606978', mt: -1, mr: -1 }}
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.4 }, bgcolor: activeTheme.backgroundPaper }}>
          <Typography sx={{ color: '#303744', fontWeight: 800, fontSize: '0.96rem', mb: 0.6 }}>
            Choose what you want to do:
          </Typography>
          <Typography sx={{ color: '#667085', fontSize: '0.88rem', lineHeight: 1.45, mb: 2 }}>
            Archive keeps the PM plan available for history and filtering. Delete removes it from this list.
          </Typography>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.4 }}>
            {[
              {
                action: 'Archive' as const,
                title: 'Archive',
                body: 'Keep this plan as an archived record.',
                color: activeTheme.textSecondary,
                border: 'var(--paper-border-color)',
                selectedBg: '#F1F5F9',
              },
              {
                action: 'Delete' as const,
                title: 'Delete',
                body: 'Remove this plan from the active data set.',
                color: '#DC2626',
                border: '#FCA5A5',
                selectedBg: '#FEF2F2',
              },
            ].map((option) => {
              const isSelected = deleteArchiveAction === option.action;
              return (
                <Button
                  key={option.action}
                  variant="outlined"
                  onClick={() => setDeleteArchiveAction(option.action)}
                  sx={{
                    minHeight: 98,
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    borderRadius: 2,
                    p: 1.5,
                    borderColor: isSelected ? option.border : 'var(--paper-border-color)',
                    bgcolor: isSelected ? option.selectedBg : activeTheme.backgroundPaper,
                    color: option.color,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: option.border,
                      bgcolor: option.selectedBg,
                    },
                  }}
                >
                  <Box>
                    <Typography sx={{ color: option.color, fontWeight: 900, fontSize: '0.95rem', lineHeight: 1.2 }}>
                      {option.title}
                    </Typography>
                    <Typography sx={{ color: '#667085', fontWeight: 650, fontSize: '0.78rem', lineHeight: 1.35, mt: 0.55 }}>
                      {option.body}
                    </Typography>
                  </Box>
                </Button>
              );
            })}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 1.4, md: 1.7 },
            borderTop: '1px solid #E2E8F0',
            bgcolor: activeTheme.backgroundDefault,
          }}
        >
          <Button
            onClick={handleCloseDeleteArchivePlan}
            sx={{ color: '#303744', textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', px: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeleteArchivePlan}
            variant="contained"
            startIcon={deleteArchiveAction === 'Delete' ? <DeleteIcon /> : <ArchiveIcon />}
            sx={{
              bgcolor: deleteArchiveAction === 'Delete' ? '#DC2626' : activeTheme.primary,
              color: activeTheme.backgroundPaper,
              textTransform: 'none',
              fontWeight: 850,
              borderRadius: 2,
              px: 2.4,
              py: 0.9,
              fontSize: '0.95rem',
              '&:hover': {
                bgcolor: deleteArchiveAction === 'Delete' ? '#B91C1C' : activeTheme.primaryLight,
              },
            }}
          >
            {deleteArchiveAction === 'Delete' ? 'Delete PM Plan' : 'Archive PM Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Maintenance Item to Existing Plan Dialog */}
      <Dialog
        open={!!addItemPlan}
        onClose={handleCloseAddPlanMaintenanceItem}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2.5,
            bgcolor: activeTheme.backgroundDefault,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, md: 3 },
            pt: { xs: 2, md: 2.4 },
            pb: 1.6,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            borderBottom: '1px solid #D9DDE5',
            bgcolor: activeTheme.backgroundPaper,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AddIcon sx={{ color: activeTheme.primary, fontSize: 25 }} />
              <Typography variant="h5" sx={{ color: '#2F3746', fontWeight: 850, fontSize: { xs: '1.3rem', md: '1.6rem' }, lineHeight: 1.1 }}>
                Add Maintenance Item
              </Typography>
            </Box>
            <Typography sx={{ color: '#667085', mt: 0.65, fontSize: { xs: '0.86rem', md: '0.98rem' }, fontWeight: 600 }}>
              {addItemPlan ? `${addItemPlan.id} · ${addItemPlan.assetName}` : 'Add item to PM plan'}
            </Typography>
          </Box>
          <IconButton
            aria-label="Close add maintenance item dialog"
            onClick={handleCloseAddPlanMaintenanceItem}
            sx={{ color: '#606978', mt: -1, mr: -1 }}
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 2, md: 2.6 },
            '& .MuiInputLabel-root': {
              color: '#303744',
              fontWeight: 800,
              fontSize: { xs: '0.86rem', md: '0.95rem' },
              transform: 'none',
              position: 'static',
              mb: 0.75,
            },
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              bgcolor: activeTheme.backgroundPaper,
              fontSize: { xs: '0.9rem', md: '0.98rem' },
              color: '#2F3746',
              '& fieldset': { borderColor: '#D9DDE5', borderWidth: 1.5 },
              '&:hover fieldset': { borderColor: '#C7CEDA' },
              '&.Mui-focused fieldset': { borderColor: activeTheme.primaryLight, borderWidth: 2 },
            },
            '& .MuiOutlinedInput-input': {
              py: { xs: 1.2, md: 1.45 },
              px: { xs: 1.4, md: 1.65 },
            },
            '& .MuiSelect-select': {
              py: { xs: 1.2, md: 1.45 },
              px: { xs: 1.4, md: 1.65 },
            },
          }}
        >
          <Paper elevation={0} sx={{ border: '1px solid #93C5FD', borderRadius: 2, bgcolor: activeTheme.backgroundPaper, overflow: 'hidden' }}>
            <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.6, borderBottom: '1px solid #E5E7EB' }}>
              <Chip
                label={planMaintenanceItemDraft.id}
                variant="outlined"
                sx={{ height: 30, minWidth: 62, borderRadius: 999, color: '#303744', fontFamily: 'monospace', fontWeight: 900 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: '#303744', fontWeight: 850, fontSize: '1rem', lineHeight: 1.2 }}>
                  New Maintenance Item {planMaintenanceItemDraft.id}
                </Typography>
                <Typography sx={{ color: '#667085', fontSize: '0.88rem', lineHeight: 1.3 }}>
                  {selectedPlanItemTaskList ? `${selectedPlanItemTaskList.id} · ${selectedPlanItemTaskList.title}` : 'No task list selected'}
                </Typography>
              </Box>
              <Chip
                icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                label={planMaintenanceItemDraft.taskListId && planMaintenanceItemDraft.equipment ? 'Complete' : 'Incomplete'}
                variant="outlined"
                sx={{
                  height: 30,
                  borderRadius: 999,
                  color: planMaintenanceItemDraft.taskListId && planMaintenanceItemDraft.equipment ? '#16A34A' : '#B45309',
                  borderColor: planMaintenanceItemDraft.taskListId && planMaintenanceItemDraft.equipment ? '#BBE7C5' : '#FCD34D',
                  bgcolor: planMaintenanceItemDraft.taskListId && planMaintenanceItemDraft.equipment ? '#F0FDF4' : '#FFFBEB',
                  fontWeight: 850,
                }}
              />
            </Box>

            <Box sx={{ p: 2 }}>
              <Typography sx={{ color: '#667085', fontWeight: 900, letterSpacing: '0.08em', mb: 1.5 }}>
                REFERENCE OBJECT
              </Typography>
              <Paper elevation={0} sx={{ border: '1px solid #D9DDE5', borderRadius: 2, bgcolor: activeTheme.backgroundPaper, overflow: 'hidden', mb: 2.4 }}>
                <Box sx={{ px: 1.6, py: 1.25, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ color: '#303744', fontWeight: 850, fontSize: '0.98rem', lineHeight: 1.2 }}>
                      Equipment Hierarchy
                    </Typography>
                    <Typography sx={{ color: '#667085', mt: 0.25, fontSize: '0.84rem', lineHeight: 1.3 }}>
                      Select the exact equipment, assembly, or component for this maintenance item.
                    </Typography>
                  </Box>
                  {planMaintenanceItemDraft.equipment ? (
                    <Chip label={planMaintenanceItemDraft.equipment} size="small" sx={{ height: 28, borderRadius: 999, color: activeTheme.primary, bgcolor: '#EEF3FF', fontWeight: 850, maxWidth: 220 }} />
                  ) : null}
                </Box>
                <Box sx={{ p: 1, maxHeight: 300, overflowY: 'auto' }}>
                  {renderReferenceObjectNode(
                    newPMReferenceObjectTree,
                    planMaintenanceItemDraft.referenceObjectId,
                    expandedPlanItemReferenceObjectIds,
                    handleSelectPlanItemReferenceObject,
                    togglePlanItemReferenceObjectExpanded,
                  )}
                </Box>
                <Box sx={{ px: 1.6, py: 1.2, borderTop: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundDefault }}>
                  <Typography sx={{ color: '#667085', fontSize: '0.78rem', fontWeight: 850, letterSpacing: '0.06em' }}>
                    SELECTED PATH
                  </Typography>
                  <Typography sx={{ color: planMaintenanceItemDraft.referenceObjectPath ? '#303744' : '#98A2B3', mt: 0.35, fontSize: '0.92rem', fontWeight: 760, lineHeight: 1.35 }}>
                    {planMaintenanceItemDraft.referenceObjectPath || 'No reference object selected'}
                  </Typography>
                </Box>
              </Paper>

              <Paper elevation={0} sx={{ p: 1.8, mb: 2.4, border: '1px solid #C7D2FE', borderRadius: 2, bgcolor: activeTheme.backgroundPaper }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.4, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ListIcon sx={{ color: activeTheme.primary, fontSize: 22 }} />
                    <Typography sx={{ color: activeTheme.primary, fontWeight: 900, letterSpacing: '0.02em' }}>
                      OPERATIONS
                    </Typography>
                  </Box>
                  <Typography sx={{ color: '#667085', fontSize: '0.88rem', fontWeight: 650 }}>
                    Select Operations to auto-populate related fields
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                  <Typography sx={{ color: '#303744', fontWeight: 800, fontSize: '0.95rem' }}>
                    Operation
                  </Typography>
                  <Chip label="Manual input" variant="outlined" size="small" sx={{ height: 24, borderRadius: 999, color: '#667085', fontWeight: 800 }} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 1, alignItems: 'center' }}>
                  <FormControl fullWidth>
                    <Select
                      value={planMaintenanceOperationSelectId}
                      onChange={(event) => setPlanMaintenanceOperationSelectId(event.target.value)}
                      displayEmpty
                      renderValue={(value) => {
                        const taskList = taskListExamples.find((item) => item.id === value);
                        return taskList ? `${taskList.id} · ${taskList.group}/${taskList.counter} · ${taskList.title}` : 'Search operation by ID, group, or description';
                      }}
                    >
                      <MenuItem value="">Search operation by ID, group, or description</MenuItem>
                      {taskListExamples.map((taskList) => (
                        <MenuItem key={taskList.id} value={taskList.id} disabled={selectedPlanItemTaskListIds.includes(taskList.id)}>
                          {taskList.id} · {taskList.group}/{taskList.counter} · {taskList.title}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddPlanMaintenanceOperation}
                    disabled={!planMaintenanceOperationSelectId || selectedPlanItemTaskListIds.includes(planMaintenanceOperationSelectId)}
                    sx={{ height: 42, textTransform: 'none', borderRadius: 2, fontWeight: 850, whiteSpace: 'nowrap' }}
                  >
                    Add operation
                  </Button>
                </Box>

                {selectedPlanItemTaskLists.length ? (
                  <Box sx={{ mt: 1.4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedPlanItemTaskLists.map((taskList) => (
                      <Paper key={taskList.id} elevation={0} sx={{ p: 1.6, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: activeTheme.backgroundPaper }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.4, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography sx={{ color: '#667085', fontWeight: 900, letterSpacing: '0.08em', mr: 0.5 }}>
                              OPERATION DETAILS
                            </Typography>
                            <Chip label={taskList.id} variant="outlined" size="small" sx={{ height: 24, color: activeTheme.primary, borderColor: '#AFC2FF', fontWeight: 850 }} />
                            <Chip label="Locked" variant="outlined" size="small" sx={{ height: 24, color: '#667085', fontWeight: 850 }} />
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemovePlanMaintenanceOperation(taskList.id)}
                            aria-label={`Remove ${taskList.id}`}
                            sx={{ width: 30, height: 30, border: '1px solid #E5E7EB', color: '#667085' }}
                          >
                            <CloseIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                        <Grid container spacing={1.6}>
                          {[
                            ['Operation Group', taskList.group],
                            ['Group Counter', taskList.counter],
                            ['Description', taskList.title],
                            ['# Task List Items', String(taskList.operations.length)],
                            ['Total Est. Duration', taskList.totalDuration],
                            ['Default Work Center', taskList.defaultWorkCenter],
                            ['Required Skill / Trade', taskList.requiredSkill],
                            ['Maintenance Strategy', 'Time-Based'],
                          ].map(([label, value]) => (
                            <Grid key={`${taskList.id}-${label}-${value}`} size={{ xs: 12, sm: 6, md: 3 }}>
                              <Typography sx={{ color: '#667085', fontSize: '0.78rem', fontWeight: 750, lineHeight: 1.2 }}>
                                {label}
                              </Typography>
                              <Typography sx={{ color: '#303744', fontSize: '0.92rem', fontWeight: 850, lineHeight: 1.25, mt: 0.25 }}>
                                {value}
                              </Typography>
                            </Grid>
                          ))}
                        </Grid>
                      </Paper>
                    ))}
                  </Box>
                ) : null}
              </Paper>

              <Typography sx={{ color: '#667085', fontWeight: 900, letterSpacing: '0.08em', mb: 1.5 }}>
                MAINTENANCE ITEM HEADER
              </Typography>
              <Grid container spacing={{ xs: 1.8, md: 2.2 }}>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                    <Typography sx={{ color: '#303744', fontWeight: 800, fontSize: '0.95rem' }}>
                      Maintenance Item Description
                    </Typography>
                    <Chip label="Manual input" variant="outlined" size="small" sx={{ height: 24, borderRadius: 999, color: '#667085', fontWeight: 800 }} />
                  </Box>
                  <TextField
                    fullWidth
                    placeholder="e.g. Inspect bearing alignment and lubricate"
                    value={selectedPlanItemTaskList?.itemDescription || ''}
                    InputProps={{ readOnly: !!selectedPlanItemTaskList }}
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                    <Typography sx={{ color: '#303744', fontWeight: 800, fontSize: '0.95rem' }}>
                      File Attachments
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      onClick={() => setSnackbar({ open: true, message: 'Attach file selected.', severity: 'info' })}
                      sx={{ textTransform: 'none', borderRadius: 2, borderColor: '#D9DDE5', color: '#303744', fontWeight: 800 }}
                    >
                      Add attachment
                    </Button>
                  </Box>
                </Grid>
              </Grid>

            </Box>
          </Paper>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 1.4, md: 1.7 },
            borderTop: '1px solid #D9DDE5',
            bgcolor: activeTheme.backgroundPaper,
          }}
        >
          <Button
            onClick={handleCloseAddPlanMaintenanceItem}
            sx={{ color: '#303744', textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', px: 2 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePlanMaintenanceItem}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              bgcolor: activeTheme.primary,
              color: activeTheme.backgroundPaper,
              textTransform: 'none',
              fontWeight: 850,
              borderRadius: 2,
              px: 2.5,
              py: 0.95,
              fontSize: '0.95rem',
              '&:hover': {
                bgcolor: activeTheme.primaryLight,
              },
            }}
          >
            Add Maintenance Item
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add New Plan Dialog */}
      <Dialog
        open={isPlanFormOpen}
        onClose={closePlanFormDialog}
        maxWidth={false}
        fullWidth
        PaperProps={{
          sx: {
            width: { xs: 'calc(100vw - 24px)', md: 'calc(100vw - 64px)' },
            maxWidth: 1240,
            height: { xs: 'calc(100vh - 24px)', md: 'calc(100vh - 64px)' },
            maxHeight: 880,
            borderRadius: 2.5,
            bgcolor: activeTheme.backgroundDefault,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, md: 3 },
            pt: { xs: 2, md: 2.4 },
            pb: 0,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon sx={{ color: activeTheme.primary, fontSize: 26 }} />
              <Typography variant="h5" sx={{ color: '#2F3746', fontWeight: 850, fontSize: { xs: '1.35rem', md: '1.65rem' }, lineHeight: 1.05 }}>
                {isEditingPlanForm ? 'Edit PM Plan' : 'New PM Plan'}
              </Typography>
            </Box>
            <Typography sx={{ color: '#667085', mt: 0.7, fontSize: { xs: '0.88rem', md: '1rem' }, fontWeight: 500, lineHeight: 1.3 }}>
              {isEditingPlanForm ? `${editingPlan?.id || 'PM Plan'} - edit the same fields used when creating a plan` : 'Create a preventive maintenance plan with one or more maintenance items'}
            </Typography>
          </Box>
          <IconButton
            aria-label={isEditingPlanForm ? 'Close edit PM plan dialog' : 'Close new PM plan dialog'}
            onClick={closePlanFormDialog}
            sx={{ color: '#606978', mt: -1, mr: -1 }}
          >
            <CloseIcon sx={{ fontSize: 24 }} />
          </IconButton>
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 2, md: 3 },
            pt: { xs: 2.4, md: 3 },
            pb: 3,
            overflowY: 'auto',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.8, md: 1.2 }, flexWrap: 'wrap', mb: { xs: 2.8, md: 3.5 } }}>
            {[
              { step: 1, label: 'Plan' },
              { step: 2, label: 'Scheduling' },
              { step: 3, label: 'Maintenance Items' },
              { step: 4, label: 'Safety & QA' },
              { step: 5, label: 'Review' },
            ].map((item, index, items) => (
              <React.Fragment key={item.step}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 1.5 } }}>
                  <Box
                    sx={{
                      width: { xs: 34, md: 40 },
                      height: { xs: 34, md: 40 },
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: item.step < newPlanStep ? '#3DB65D' : item.step === newPlanStep ? activeTheme.primary : '#EFF2F6',
                      color: item.step <= newPlanStep ? activeTheme.backgroundPaper : '#5E6673',
                      fontWeight: 900,
                      fontSize: { xs: '0.9rem', md: '1rem' },
                    }}
                  >
                    {item.step < newPlanStep ? <CheckCircleIcon sx={{ fontSize: 20 }} /> : item.step}
                  </Box>
                  <Typography sx={{ color: item.step === newPlanStep ? '#303744' : '#626B79', fontSize: { xs: '0.88rem', md: '1rem' }, fontWeight: 850 }}>
                    {item.label}
                  </Typography>
                </Box>
                {index < items.length - 1 ? <ChevronRightIcon sx={{ color: '#667085', fontSize: { xs: 20, md: 24 } }} /> : null}
              </React.Fragment>
            ))}
          </Box>

          {newPlanStep === 1 || newPlanStep === 3 ? (
            <>
              <Box sx={{ display: newPlanStep === 1 ? 'block' : 'none', mb: { xs: 2.8, md: 3.4 } }}>
                <Typography variant="h6" sx={{ color: '#303744', fontWeight: 850, fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: 1.1 }}>
                  Plan Header
                </Typography>
                <Typography sx={{ color: '#667085', mt: 0.35, fontSize: { xs: '0.84rem', md: '0.92rem' }, lineHeight: 1.35 }}>
                  General attributes that apply to the whole maintenance plan.
                </Typography>
              </Box>

              <Grid
                container
                spacing={{ xs: 1.8, md: 2.2 }}
                sx={{
                  '& .MuiInputLabel-root': {
                    color: '#303744',
                    fontWeight: 800,
                    fontSize: { xs: '0.86rem', md: '0.95rem' },
                    transform: 'none',
                    position: 'static',
                    mb: 0.75,
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    bgcolor: activeTheme.backgroundDefault,
                    fontSize: { xs: '0.9rem', md: '0.98rem' },
                    color: '#2F3746',
                    minHeight: { xs: 48, md: 54 },
                    '& fieldset': { borderColor: '#D9DDE5', borderWidth: 1.5 },
                    '&:hover fieldset': { borderColor: '#C7CEDA' },
                    '&.Mui-focused fieldset': { borderColor: activeTheme.primaryLight, borderWidth: 2 },
                  },
                  '& .MuiOutlinedInput-input': {
                    py: { xs: 1.2, md: 1.45 },
                    px: { xs: 1.4, md: 1.65 },
                  },
                  '& .MuiSelect-select': {
                    py: { xs: 1.2, md: 1.45 },
                    px: { xs: 1.4, md: 1.65 },
                  },
                }}
              >
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: newPlanStep === 1 ? 'block' : 'none' }}>
                  <TextField
                    fullWidth
                    label="Plan ID"
                    value={newPlan.id}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setNewPlan((prev) => ({ ...prev, id: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: newPlanStep === 1 ? 'block' : 'none' }}>
                  <TextField
                    fullWidth
                    label="Plan Name *"
                    placeholder="e.g. Quarterly Inspection — Press Line"
                    value={newPlan.assetName}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setNewPlan((prev) => ({ ...prev, assetName: e.target.value }))}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: newPlanStep === 1 ? 'block' : 'none' }}>
                  <FormControl fullWidth>
                    <InputLabel>Main Work Center *</InputLabel>
                    <Select
                      value={newPlan.workCenter || ''}
                      onChange={(e) => setNewPlan((prev) => ({ ...prev, workCenter: e.target.value }))}
                      displayEmpty
                      renderValue={(value) => value || 'Select work center'}
                    >
                      <MenuItem value="">Select work center</MenuItem>
                      <MenuItem value="Mechanical">Mechanical</MenuItem>
                      <MenuItem value="Instrumentation">Instrumentation</MenuItem>
                      <MenuItem value="HVAC">HVAC</MenuItem>
                      <MenuItem value="Electrical">Electrical</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }} sx={{ display: newPlanStep === 1 ? 'block' : 'none' }}>
                  <FormControl fullWidth>
                    <InputLabel>Priority</InputLabel>
                    <Select
                      value={newPlan.criticality}
                      onChange={(e) => setNewPlan((prev) => ({ ...prev, criticality: e.target.value as any }))}
                      renderValue={(value) => (value === 'A' ? 'High' : value === 'C' ? 'Low' : 'Medium')}
                    >
                      <MenuItem value="A">High</MenuItem>
                      <MenuItem value="B">Medium</MenuItem>
                      <MenuItem value="C">Low</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12 }} sx={{ display: newPlanStep === 1 ? 'block' : 'none' }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Short Description"
                    placeholder="Optional context for the plan"
                    value={newPlan.taskListName || ''}
                    InputLabelProps={{ shrink: true }}
                    onChange={(e) => setNewPlan((prev) => ({ ...prev, taskListName: e.target.value || undefined }))}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        alignItems: 'flex-start',
                      },
                    }}
                  />
                </Grid>

                <Grid size={{ xs: 12 }} sx={{ display: newPlanStep === 3 ? 'block' : 'none' }}>
                  <Box sx={{ mt: 1.6, pt: 2, borderTop: '1px solid #D9DDE5' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, mb: 1.6 }}>
                      <Box>
                        <Typography variant="h6" sx={{ color: '#303744', fontWeight: 850, fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: 1.1 }}>
                          Maintenance Items
                        </Typography>
                        <Typography sx={{ color: '#667085', mt: 0.35, fontSize: { xs: '0.84rem', md: '0.92rem' }, lineHeight: 1.35 }}>
                          Maintenance items define what will be maintained, where it is located, and which task list should be executed.
                        </Typography>
                      </Box>
                      <Chip
                        label={`${newPlanItems.filter((item) => item.taskListId && item.equipment).length}/${newPlanItems.length} complete`}
                        variant="outlined"
                        sx={{ height: 30, borderRadius: 999, color: '#303744', fontWeight: 850, bgcolor: activeTheme.backgroundDefault, flexShrink: 0 }}
                      />
                    </Box>

                    {newPlanItems.map((maintenanceItem) => {
                      const itemTaskList = taskListExamples.find((taskList) => taskList.id === maintenanceItem.taskListId);
                      const isActiveItem = maintenanceItem.id === activeNewPlanItemId;
                      const isCompleteItem = Boolean(maintenanceItem.taskListId && maintenanceItem.equipment);

                      return (
                        <Paper key={maintenanceItem.id} elevation={0} sx={{ border: isActiveItem ? '1px solid #93C5FD' : '1px solid #D9DDE5', borderRadius: 2, bgcolor: activeTheme.backgroundPaper, overflow: 'hidden', mb: 1.4 }}>
                          <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.6, borderBottom: '1px solid #E5E7EB' }}>
                            <Chip
                              label={maintenanceItem.id}
                              variant="outlined"
                              sx={{ height: 30, minWidth: 62, borderRadius: 999, color: '#303744', fontFamily: 'monospace', fontWeight: 900 }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography sx={{ color: '#303744', fontWeight: 850, fontSize: '1rem', lineHeight: 1.2 }}>
                                New Maintenance Item {maintenanceItem.id}
                              </Typography>
                              <Typography sx={{ color: '#667085', fontSize: '0.88rem', lineHeight: 1.3 }}>
                                {itemTaskList ? `${itemTaskList.id} · ${itemTaskList.title}` : 'No task list selected'}
                              </Typography>
                            </Box>
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
                              label={isCompleteItem ? 'Complete' : 'Incomplete'}
                              variant="outlined"
                              sx={{
                                height: 30,
                                borderRadius: 999,
                                color: isCompleteItem ? '#16A34A' : '#B45309',
                                borderColor: isCompleteItem ? '#BBE7C5' : '#FCD34D',
                                bgcolor: isCompleteItem ? '#F0FDF4' : '#FFFBEB',
                                fontWeight: 850,
                              }}
                            />
                            <IconButton size="small" onClick={() => handleCloneMaintenanceItem(maintenanceItem)} sx={{ color: '#303744' }}>
                              <CloneIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDeleteMaintenanceItem(maintenanceItem.id)} sx={{ color: '#FCA5A5' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={() => setActiveNewPlanItemId(maintenanceItem.id)} sx={{ color: '#303744' }}>
                              <KeyboardArrowUpIcon fontSize="small" />
                            </IconButton>
                          </Box>

                          {isActiveItem ? (
                            <Box sx={{ p: 2 }}>
                              <Typography sx={{ color: '#667085', fontWeight: 900, letterSpacing: '0.08em', mb: 1.5 }}>
                                REFERENCE OBJECT
                              </Typography>
                              <Paper elevation={0} sx={{ border: '1px solid #D9DDE5', borderRadius: 2, bgcolor: activeTheme.backgroundPaper, overflow: 'hidden', mb: 2.4 }}>
                                <Box sx={{ px: 1.6, py: 1.25, borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ color: '#303744', fontWeight: 850, fontSize: '0.98rem', lineHeight: 1.2 }}>
                                      Equipment Hierarchy
                                    </Typography>
                                    <Typography sx={{ color: '#667085', mt: 0.25, fontSize: '0.84rem', lineHeight: 1.3 }}>
                                      Select the exact equipment, assembly, or component for this maintenance item.
                                    </Typography>
                                  </Box>
                                  {selectedEquipment ? (
                                    <Chip label={selectedEquipment} size="small" sx={{ height: 28, borderRadius: 999, color: activeTheme.primary, bgcolor: '#EEF3FF', fontWeight: 850, maxWidth: 220 }} />
                                  ) : null}
                                </Box>
                                <Box sx={{ p: 1, maxHeight: 390, overflowY: 'auto' }}>
                                  {renderNewPMReferenceObjectNode(newPMReferenceObjectTree)}
                                </Box>
                                <Box sx={{ px: 1.6, py: 1.2, borderTop: '1px solid #E5E7EB', bgcolor: activeTheme.backgroundDefault }}>
                                  <Typography sx={{ color: '#667085', fontSize: '0.78rem', fontWeight: 850, letterSpacing: '0.06em' }}>
                                    SELECTED PATH
                                  </Typography>
                                  <Typography sx={{ color: activeNewPlanItem?.referenceObjectPath ? '#303744' : '#98A2B3', mt: 0.35, fontSize: '0.92rem', fontWeight: 760, lineHeight: 1.35 }}>
                                    {activeNewPlanItem?.referenceObjectPath || 'No reference object selected'}
                                  </Typography>
                                </Box>
                              </Paper>

                              <Paper elevation={0} sx={{ p: 1.8, mb: 2.4, border: '1px solid #C7D2FE', borderRadius: 2, bgcolor: activeTheme.backgroundPaper }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1.4, flexWrap: 'wrap' }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ListIcon sx={{ color: activeTheme.primary, fontSize: 22 }} />
                                    <Typography sx={{ color: activeTheme.primary, fontWeight: 900, letterSpacing: '0.02em' }}>
                                      OPERATIONS
                                    </Typography>
                                  </Box>
                                  <Typography sx={{ color: '#667085', fontSize: '0.88rem', fontWeight: 650 }}>
                                    Select Operations to auto-populate related fields
                                  </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                                  <Typography sx={{ color: '#303744', fontWeight: 800, fontSize: '0.95rem' }}>
                                    Operation
                                  </Typography>
                                  <Chip label="Manual input" variant="outlined" size="small" sx={{ height: 24, borderRadius: 999, color: '#667085', fontWeight: 800 }} />
                                </Box>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr auto' }, gap: 1, alignItems: 'center' }}>
                                  <FormControl fullWidth>
                                    <Select
                                      value={newPlanOperationSelectId}
                                      onChange={(event) => setNewPlanOperationSelectId(event.target.value)}
                                      displayEmpty
                                      renderValue={(value) => {
                                        const taskList = taskListExamples.find((item) => item.id === value);
                                        return taskList ? `${taskList.id} · ${taskList.group}/${taskList.counter} · ${taskList.title}` : 'Search operation by ID, group, or description';
                                      }}
                                    >
                                      <MenuItem value="">Search operation by ID, group, or description</MenuItem>
                                      {taskListExamples.map((taskList) => (
                                        <MenuItem key={taskList.id} value={taskList.id} disabled={selectedNewPlanTaskListIds.includes(taskList.id)}>
                                          {taskList.id} · {taskList.group}/{taskList.counter} · {taskList.title}
                                        </MenuItem>
                                      ))}
                                    </Select>
                                  </FormControl>
                                  <Button
                                    variant="outlined"
                                    startIcon={<AddIcon />}
                                    onClick={handleAddNewPlanOperation}
                                    disabled={!newPlanOperationSelectId || selectedNewPlanTaskListIds.includes(newPlanOperationSelectId)}
                                    sx={{ height: 42, textTransform: 'none', borderRadius: 2, fontWeight: 850, whiteSpace: 'nowrap' }}
                                  >
                                    Add operation
                                  </Button>
                                </Box>

                                {selectedNewPlanTaskLists.length ? (
                                  <Box sx={{ mt: 1.4, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {selectedNewPlanTaskLists.map((taskList) => (
                                      <Paper key={taskList.id} elevation={0} sx={{ p: 1.6, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: activeTheme.backgroundPaper }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.4, flexWrap: 'wrap' }}>
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                            <Typography sx={{ color: '#667085', fontWeight: 900, letterSpacing: '0.08em', mr: 0.5 }}>
                                              OPERATION DETAILS
                                            </Typography>
                                            <Chip label={taskList.id} variant="outlined" size="small" sx={{ height: 24, color: activeTheme.primary, borderColor: '#AFC2FF', fontWeight: 850 }} />
                                            <Chip label="Locked" variant="outlined" size="small" sx={{ height: 24, color: '#667085', fontWeight: 850 }} />
                                          </Box>
                                          <IconButton
                                            size="small"
                                            onClick={() => handleRemoveNewPlanOperation(taskList.id)}
                                            aria-label={`Remove ${taskList.id}`}
                                            sx={{ width: 30, height: 30, border: '1px solid #E5E7EB', color: '#667085' }}
                                          >
                                            <CloseIcon sx={{ fontSize: 16 }} />
                                          </IconButton>
                                        </Box>
                                        <Grid container spacing={1.6}>
                                          {[
                                            ['Operation Group', taskList.group],
                                            ['Group Counter', taskList.counter],
                                            ['Description', taskList.title],
                                            ['# Task List Items', String(taskList.operations.length)],
                                            ['Total Est. Duration', taskList.totalDuration],
                                            ['Default Work Center', taskList.defaultWorkCenter],
                                            ['Required Skill / Trade', taskList.requiredSkill],
                                            ['Maintenance Strategy', 'Time-Based'],
                                          ].map(([label, value]) => (
                                            <Grid key={`${taskList.id}-${label}-${value}`} size={{ xs: 12, sm: 6, md: 3 }}>
                                              <Typography sx={{ color: '#667085', fontSize: '0.78rem', fontWeight: 750, lineHeight: 1.2 }}>
                                                {label}
                                              </Typography>
                                              <Typography sx={{ color: '#303744', fontSize: '0.92rem', fontWeight: 850, lineHeight: 1.25, mt: 0.25 }}>
                                                {value}
                                              </Typography>
                                            </Grid>
                                          ))}
                                        </Grid>
                                      </Paper>
                                    ))}
                                  </Box>
                                ) : null}

                                {false ? (
                                  <Box sx={{ mt: 1.8, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    {selectedTaskList ? (
                                      <Paper elevation={0} sx={{ p: 1.6, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: activeTheme.backgroundPaper }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.4, flexWrap: 'wrap' }}>
                                          <Typography sx={{ color: '#667085', fontWeight: 900, letterSpacing: '0.08em', mr: 0.5 }}>
                                            OPERATIONS DETAILS
                                          </Typography>
                                          <Chip label="Auto-filled from operations" variant="outlined" size="small" sx={{ height: 24, color: activeTheme.primary, borderColor: '#AFC2FF', fontWeight: 850 }} />
                                          <Chip label="Task list editable" variant="outlined" size="small" sx={{ height: 24, color: '#667085', fontWeight: 850 }} />
                                          <Chip label="General" variant="outlined" size="small" sx={{ height: 26, ml: 'auto', borderRadius: 999, color: '#303744', fontWeight: 850 }} />
                                        </Box>
                                        <Grid container spacing={1.6}>
                                          {[
                                            ['Operations Group', selectedTaskList.group],
                                            ['Group Counter', selectedTaskList.counter],
                                            ['Description', selectedTaskList.title],
                                            ['# Task List', String(selectedTaskListOperations.length)],
                                            ['Total Est. Duration', selectedTaskList.totalDuration],
                                            ['Default Work Center', selectedTaskList.defaultWorkCenter],
                                            ['Required Skill / Trade', selectedTaskList.requiredSkill],
                                            ['Required Spare Parts', '2'],
                                            ['Maintenance Strategy', selectedTaskList.activityType],
                                            ['Safety Notes', 'Missing from Operations'],
                                            ['Last Updated', '2026-02-12'],
                                            ['Status', 'Approved'],
                                          ].map(([label, value]) => (
                                            <Grid key={`${label}-${value}`} size={{ xs: 12, sm: 6, md: 3 }}>
                                              <Typography sx={{ color: '#667085', fontSize: '0.78rem', fontWeight: 750, lineHeight: 1.2 }}>
                                                {label}
                                              </Typography>
                                              <Typography sx={{ color: '#303744', fontSize: '0.92rem', fontWeight: 850, lineHeight: 1.25, mt: 0.25 }}>
                                                {value}
                                              </Typography>
                                            </Grid>
                                          ))}
                                        </Grid>
                                      </Paper>
                                    ) : null}

                                    <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: activeTheme.backgroundPaper, overflow: 'hidden' }}>
                                      <Box sx={{ px: 1.6, py: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, borderBottom: '1px solid #E5E7EB', flexWrap: 'wrap' }}>
                                        <Typography sx={{ color: '#667085', fontWeight: 900, letterSpacing: '0.08em' }}>
                                          TASK LIST
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
                                          <Typography sx={{ color: '#667085', fontWeight: 750, fontSize: '0.86rem', whiteSpace: 'nowrap' }}>
                                            {selectedTaskListOperations.length} task list entries
                                          </Typography>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            startIcon={<AddIcon />}
                                            onClick={handleAddTaskListOperation}
                                            sx={{
                                              minHeight: 30,
                                              borderRadius: 1.5,
                                              borderColor: '#C7D2FE',
                                              color: activeTheme.primary,
                                              fontWeight: 850,
                                              textTransform: 'none',
                                              '&:hover': { borderColor: activeTheme.primary, bgcolor: '#EEF3FF' },
                                            }}
                                          >
                                            Add task list
                                          </Button>
                                        </Box>
                                      </Box>
                                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '70px 1fr 112px', md: '90px 1fr 150px 120px 140px 178px' }, px: 1.6, py: 0.9, borderBottom: '1px solid #E5E7EB', color: '#667085', fontWeight: 850, fontSize: '0.82rem', alignItems: 'center' }}>
                                        <Box>Op #</Box>
                                        <Box>Short Description</Box>
                                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>Work Center</Box>
                                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>Duration</Box>
                                        <Box sx={{ display: { xs: 'none', md: 'block' } }}>Skill</Box>
                                        <Box sx={{ textAlign: 'right' }}>Actions</Box>
                                      </Box>
                                      {selectedTaskListOperations.map((operation) => (
                                        <React.Fragment key={operation.op}>
                                          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '70px 1fr 112px', md: '90px 1fr 150px 120px 140px 178px' }, gap: 1, px: 1.6, py: 1, borderBottom: '1px solid #EEF2F7', alignItems: 'center' }}>
                                            <Typography sx={{ color: '#303744', fontFamily: 'monospace', fontWeight: 800 }}>{operation.op}</Typography>
                                            <TextField
                                              size="small"
                                              value={operation.description}
                                              onChange={(event) => handleUpdateTaskListOperation(operation.op, 'description', event.target.value)}
                                              placeholder="Write task description"
                                              fullWidth
                                              sx={{
                                                '& .MuiOutlinedInput-root': { height: 34, borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: '0.82rem', fontWeight: 700 },
                                                '& .MuiOutlinedInput-input': { px: 1, py: 0.7 },
                                              }}
                                            />
                                            <TextField
                                              size="small"
                                              value={operation.workCenter}
                                              onChange={(event) => handleUpdateTaskListOperation(operation.op, 'workCenter', event.target.value)}
                                              placeholder="Work center"
                                              sx={{
                                                display: { xs: 'none', md: 'block' },
                                                '& .MuiOutlinedInput-root': { height: 34, borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: '0.82rem', fontWeight: 700 },
                                                '& .MuiOutlinedInput-input': { px: 1, py: 0.7 },
                                              }}
                                            />
                                            <TextField
                                              size="small"
                                              value={operation.duration}
                                              onChange={(event) => handleUpdateTaskListOperation(operation.op, 'duration', event.target.value)}
                                              placeholder="Duration"
                                              sx={{
                                                display: { xs: 'none', md: 'block' },
                                                '& .MuiOutlinedInput-root': { height: 34, borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: '0.82rem', fontWeight: 700 },
                                                '& .MuiOutlinedInput-input': { px: 1, py: 0.7 },
                                              }}
                                            />
                                            <TextField
                                              size="small"
                                              value={operation.skill}
                                              onChange={(event) => handleUpdateTaskListOperation(operation.op, 'skill', event.target.value)}
                                              placeholder="Skill"
                                              sx={{
                                                display: { xs: 'none', md: 'block' },
                                                '& .MuiOutlinedInput-root': { height: 34, borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: '0.82rem', fontWeight: 700 },
                                                '& .MuiOutlinedInput-input': { px: 1, py: 0.7 },
                                              }}
                                            />
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.4 }}>
                                              <Button
                                                aria-label={`Add suboperation to operation ${operation.op}`}
                                                size="small"
                                                variant="outlined"
                                                startIcon={<AddIcon sx={{ fontSize: 16 }} />}
                                                onClick={() => handleAddTaskListSubOperation(operation.op)}
                                                sx={{
                                                  minWidth: 0,
                                                  height: 30,
                                                  px: { xs: 0.75, md: 1 },
                                                  borderRadius: 1.2,
                                                  borderColor: '#C7D2FE',
                                                  color: activeTheme.primary,
                                                  fontSize: '0.72rem',
                                                  fontWeight: 850,
                                                  textTransform: 'none',
                                                  whiteSpace: 'nowrap',
                                                  '& .MuiButton-startIcon': { mr: { xs: 0, md: 0.45 } },
                                                  '&:hover': { borderColor: activeTheme.primary, bgcolor: '#EEF3FF' },
                                                }}
                                              >
                                                <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                                                  Add suboperation
                                                </Box>
                                              </Button>
                                              <IconButton
                                                aria-label={`Remove operation ${operation.op}`}
                                                size="small"
                                                onClick={() => handleRemoveTaskListOperation(operation.op)}
                                                sx={{
                                                  width: 30,
                                                  height: 30,
                                                  color: '#EF4444',
                                                  '&:hover': { bgcolor: '#FEF2F2' },
                                                }}
                                              >
                                                <DeleteIcon sx={{ fontSize: 18 }} />
                                              </IconButton>
                                            </Box>
                                          </Box>
                                          {operation.subOperations?.map((subOperation) => (
                                            <Box key={subOperation.op} sx={{ display: 'grid', gridTemplateColumns: { xs: '70px 1fr 112px', md: '90px 1fr 150px 120px 140px 178px' }, gap: 1, px: 1.6, py: 1, pl: { xs: 2.4, md: 4.5 }, borderBottom: '1px solid #EEF2F7', alignItems: 'center', bgcolor: activeTheme.backgroundDefault }}>
                                              <Typography sx={{ color: activeTheme.primary, fontFamily: 'monospace', fontWeight: 850 }}>{subOperation.op}</Typography>
                                              <TextField
                                                size="small"
                                                value={subOperation.description}
                                                onChange={(event) => handleUpdateTaskListSubOperation(operation.op, subOperation.op, 'description', event.target.value)}
                                                placeholder="Write suboperation"
                                                fullWidth
                                                sx={{
                                                  '& .MuiOutlinedInput-root': { height: 32, borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: '0.8rem', fontWeight: 700 },
                                                  '& .MuiOutlinedInput-input': { px: 1, py: 0.65 },
                                                }}
                                              />
                                              <TextField
                                                size="small"
                                                value={subOperation.workCenter}
                                                onChange={(event) => handleUpdateTaskListSubOperation(operation.op, subOperation.op, 'workCenter', event.target.value)}
                                                sx={{ display: { xs: 'none', md: 'block' }, '& .MuiOutlinedInput-root': { height: 32, borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: '0.8rem', fontWeight: 700 }, '& .MuiOutlinedInput-input': { px: 1, py: 0.65 } }}
                                              />
                                              <TextField
                                                size="small"
                                                value={subOperation.duration}
                                                onChange={(event) => handleUpdateTaskListSubOperation(operation.op, subOperation.op, 'duration', event.target.value)}
                                                sx={{ display: { xs: 'none', md: 'block' }, '& .MuiOutlinedInput-root': { height: 32, borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: '0.8rem', fontWeight: 700 }, '& .MuiOutlinedInput-input': { px: 1, py: 0.65 } }}
                                              />
                                              <TextField
                                                size="small"
                                                value={subOperation.skill}
                                                onChange={(event) => handleUpdateTaskListSubOperation(operation.op, subOperation.op, 'skill', event.target.value)}
                                                sx={{ display: { xs: 'none', md: 'block' }, '& .MuiOutlinedInput-root': { height: 32, borderRadius: 1.2, bgcolor: activeTheme.backgroundPaper, fontSize: '0.8rem', fontWeight: 700 }, '& .MuiOutlinedInput-input': { px: 1, py: 0.65 } }}
                                              />
                                              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <IconButton
                                                  aria-label={`Remove suboperation ${subOperation.op}`}
                                                  size="small"
                                                  onClick={() => handleRemoveTaskListSubOperation(operation.op, subOperation.op)}
                                                  sx={{ width: 30, height: 30, color: '#EF4444', '&:hover': { bgcolor: '#FEF2F2' } }}
                                                >
                                                  <DeleteIcon sx={{ fontSize: 18 }} />
                                                </IconButton>
                                              </Box>
                                            </Box>
                                          ))}
                                        </React.Fragment>
                                      ))}
                                      {!selectedTaskListOperations.length ? (
                                        <Box sx={{ px: 1.6, py: 2, color: '#98A2B3', fontWeight: 750, fontSize: '0.9rem', textAlign: 'center' }}>
                                          No operations added.
                                        </Box>
                                      ) : null}
                                    </Paper>
                                  </Box>
                                ) : null}
                              </Paper>

                              <Typography sx={{ color: '#667085', fontWeight: 900, letterSpacing: '0.08em', mb: 1.5 }}>
                                MAINTENANCE ITEM HEADER
                              </Typography>
                              <Grid container spacing={{ xs: 1.8, md: 2.2 }}>
                                <Grid size={{ xs: 12 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
                                    <Typography sx={{ color: '#303744', fontWeight: 800, fontSize: '0.95rem' }}>
                                      Maintenance Item Description
                                    </Typography>
                                    <Chip label="Manual input" variant="outlined" size="small" sx={{ height: 24, borderRadius: 999, color: '#667085', fontWeight: 800 }} />
                                  </Box>
                                  <TextField
                                    fullWidth
                                    placeholder="e.g. Inspect bearing alignment and lubricate"
                                    value={selectedTaskList?.itemDescription || ''}
                                    InputProps={{ readOnly: !!selectedTaskList }}
                                  />
                                </Grid>
                                <Grid size={{ xs: 12 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.75 }}>
                                    <Typography sx={{ color: '#303744', fontWeight: 800, fontSize: '0.95rem' }}>
                                      File Attachments
                                    </Typography>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<UploadIcon />}
                                      onClick={() => setSnackbar({ open: true, message: 'Attach file selected.', severity: 'info' })}
                                      sx={{
                                        textTransform: 'none',
                                        borderRadius: 2,
                                        borderColor: '#D9DDE5',
                                        color: '#303744',
                                        fontWeight: 800,
                                      }}
                                    >
                                      Add attachment
                                    </Button>
                                  </Box>
                                </Grid>
                              </Grid>

                            </Box>
                          ) : null}
                        </Paper>
                      );
                    })}

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddMaintenanceItem}
                      sx={{
                        mt: 1.6,
                        height: 52,
                        borderColor: '#D9DDE5',
                        color: '#303744',
                        bgcolor: activeTheme.backgroundDefault,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 850,
                        fontSize: '1rem',
                        '&:hover': {
                          borderColor: 'var(--paper-border-color)',
                          bgcolor: '#F1F5F9',
                        },
                      }}
                    >
                      Add Maintenance Item
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </>
          ) : newPlanStep === 2 ? (
            <Box
              sx={{
                '& .MuiInputLabel-root': {
                  color: '#303744',
                  fontWeight: 800,
                  fontSize: { xs: '0.86rem', md: '0.95rem' },
                  transform: 'none',
                  position: 'static',
                  mb: 0.75,
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: activeTheme.backgroundDefault,
                  fontSize: { xs: '0.9rem', md: '0.98rem' },
                  color: '#2F3746',
                  minHeight: { xs: 48, md: 54 },
                  '& fieldset': { borderColor: '#D9DDE5', borderWidth: 1.5 },
                  '&:hover fieldset': { borderColor: '#C7CEDA' },
                  '&.Mui-focused fieldset': { borderColor: activeTheme.primaryLight, borderWidth: 2 },
                },
                '& .MuiOutlinedInput-input': {
                  py: { xs: 1.2, md: 1.45 },
                  px: { xs: 1.4, md: 1.65 },
                },
                '& .MuiSelect-select': {
                  py: { xs: 1.2, md: 1.45 },
                  px: { xs: 1.4, md: 1.65 },
                },
              }}
            >
              <Box sx={{ mb: 2.4 }}>
                <Typography variant="h6" sx={{ color: '#303744', fontWeight: 850, fontSize: { xs: '1.05rem', md: '1.15rem' }, lineHeight: 1.1 }}>
                  Plan Scheduling
                </Typography>
                <Typography sx={{ color: '#667085', mt: 0.35, fontSize: { xs: '0.84rem', md: '0.92rem' }, lineHeight: 1.35 }}>
                  Configure trigger type, frequency rules and Work Order auto-generation. These fields are <Box component="span" sx={{ color: '#303744', fontWeight: 850 }}>defined in the PM Plan</Box> - they do not come from the General Task List.
                </Typography>
              </Box>

              <Paper elevation={0} sx={{ px: 1.8, py: 1.25, mb: 2.4, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: activeTheme.backgroundDefault, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                <Typography sx={{ color: '#303744', fontWeight: 850, fontSize: '0.95rem' }}>
                  Apply the same schedule to all maintenance items
                </Typography>
                <Switch
                  checked={newPlanSchedule.applySameSchedule}
                  onChange={(event) => {
                    handleScheduleFieldChange('applySameSchedule', event.target.checked);
                    setNewPlanItemSchedule((prev) => normalizeScheduleForTrigger(prev, newPlanSchedule.triggerType || 'Time-Based'));
                  }}
                />
              </Paper>

              {newPlanSchedule.applySameSchedule ? (
                renderSchedulingCard(newPlanSchedule, 'plan')
              ) : (
                <Paper elevation={0} sx={{ p: 1.8, border: '1px solid #D9DDE5', borderRadius: 2, bgcolor: activeTheme.backgroundPaper }}>
                  <Typography sx={{ color: '#303744', fontWeight: 900, mb: 1.5 }}>
                    Maintenance Item Scheduling
                  </Typography>
                  {renderSchedulingCard(newPlanItemSchedule, 'item')}
                </Paper>
              )}
            </Box>
          ) : newPlanStep === 4 ? (
            renderSafetyQualityStep()
          ) : (
            <Box>
              <Paper elevation={0} sx={{ border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: activeTheme.backgroundDefault, overflow: 'hidden', mb: 2.6 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '58px 1fr', md: '80px 1.4fr 1fr 1.4fr 1fr 1fr' }, px: 2, py: 1.5, borderBottom: '1px solid #D9DDE5', color: '#667085', fontWeight: 900 }}>
                  <Box>#</Box>
                  <Box>Equipment</Box>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>Activity</Box>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>Task List</Box>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>Skill</Box>
                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>Duration</Box>
                </Box>
                {newPlanItems.map((maintenanceItem) => {
                  const itemTaskList = taskListExamples.find((taskList) => taskList.id === maintenanceItem.taskListId);

                  return (
                    <Box key={maintenanceItem.id} sx={{ display: 'grid', gridTemplateColumns: { xs: '58px 1fr', md: '80px 1.4fr 1fr 1.4fr 1fr 1fr' }, px: 2, py: 1.9, alignItems: 'center', color: '#303744', fontWeight: 800, borderBottom: '1px solid #EEF2F7' }}>
                      <Box sx={{ fontFamily: 'monospace' }}>{maintenanceItem.id}</Box>
                      <Box>{maintenanceItem.equipment || '-'}</Box>
                      <Box sx={{ display: { xs: 'none', md: 'block' } }}>{itemTaskList?.activityType || '-'}</Box>
                      <Box sx={{ display: { xs: 'none', md: 'block' } }}>{itemTaskList ? `${itemTaskList.id} · ${itemTaskList.title}` : '-'}</Box>
                      <Box sx={{ display: { xs: 'none', md: 'block' } }}>{itemTaskList?.requiredSkill || '-'}</Box>
                      <Box sx={{ display: { xs: 'none', md: 'block' } }}>{itemTaskList ? `${itemTaskList.estimatedDuration} ${itemTaskList.durationUnit.toLowerCase()}` : '-'}</Box>
                    </Box>
                  );
                })}
              </Paper>

              <Typography variant="h6" sx={{ color: '#303744', fontWeight: 850, fontSize: { xs: '1.05rem', md: '1.15rem' }, mb: 1.3 }}>
                Scheduling
              </Typography>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: activeTheme.backgroundDefault }}>
                <Grid container spacing={2.2}>
                  {getReviewRows().map(([label, value]) => (
                    <Grid key={label} size={{ xs: 12, md: label === 'APPLY TO ALL ITEMS' ? 12 : 6 }}>
                      <Typography sx={{ color: '#667085', fontSize: '0.82rem', fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1.2 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ color: '#303744', mt: 0.35, fontSize: '1rem', fontWeight: 850, lineHeight: 1.3 }}>
                        {value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Paper>

              <Typography variant="h6" sx={{ color: '#303744', fontWeight: 850, fontSize: { xs: '1.05rem', md: '1.15rem' }, mt: 2.6, mb: 1.3 }}>
                Safety & Quality Assurance
              </Typography>
              <Paper elevation={0} sx={{ p: 2, border: '1px solid #E5E7EB', borderRadius: 2, bgcolor: activeTheme.backgroundDefault }}>
                <Grid container spacing={2.2}>
                  {getSafetyQualityReviewRows().map(([label, value]) => (
                    <Grid key={label} size={{ xs: 12, md: label === 'EVIDENCE REQUIRED' || label === 'DEVIATION HANDLING' ? 12 : 6 }}>
                      <Typography sx={{ color: '#667085', fontSize: '0.82rem', fontWeight: 900, letterSpacing: '0.08em', lineHeight: 1.2 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ color: '#303744', mt: 0.35, fontSize: '1rem', fontWeight: 850, lineHeight: 1.3 }}>
                        {value}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, md: 3 },
            py: { xs: 1.4, md: 1.7 },
            borderTop: '1px solid #D9DDE5',
            bgcolor: activeTheme.backgroundDefault,
            justifyContent: newPlanStep === 5 ? 'space-between' : 'flex-end',
            gap: 2,
          }}
        >
          {newPlanStep === 5 ? (
            <>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => setNewPlanStep(4)}
                variant="outlined"
                sx={{ color: '#303744', borderColor: '#D9DDE5', textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', borderRadius: 2, px: 2.4, py: 0.9 }}
              >
                Back
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Button
                  onClick={closePlanFormDialog}
                  sx={{ color: '#303744', textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', px: 2 }}
                >
                  Cancel
                </Button>
                {!isEditingPlanForm ? (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      closePlanFormDialog();
                      setSnackbar({ open: true, message: 'PM Plan draft saved.', severity: 'info' });
                    }}
                    sx={{ color: '#303744', borderColor: '#D9DDE5', textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', borderRadius: 2, px: 2.4, py: 0.9 }}
                  >
                    Save as Draft
                  </Button>
                ) : null}
                <Button
                  onClick={isEditingPlanForm ? handleSaveEditPlan : handleAddPlanSubmit}
                  variant="contained"
                  sx={{
                    bgcolor: activeTheme.primary,
                    color: activeTheme.backgroundPaper,
                    textTransform: 'none',
                    fontWeight: 800,
                    borderRadius: 2,
                    px: 2.8,
                    py: 0.95,
                    fontSize: '0.95rem',
                    '&:hover': {
                      bgcolor: activeTheme.primaryLight,
                    },
                  }}
                >
                  {isEditingPlanForm ? 'Save Changes' : 'Create PM Plan'}
                </Button>
              </Box>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  if (newPlanStep > 1) {
                    setNewPlanStep((step) => step - 1);
                    return;
                  }
                  closePlanFormDialog();
                }}
                sx={{ color: '#303744', textTransform: 'none', fontWeight: 800, fontSize: '0.95rem', px: 2 }}
              >
                {newPlanStep > 1 ? 'Back' : 'Cancel'}
              </Button>
              <Button
                onClick={() => {
                  if (newPlanStep === 2) {
                    const validationMessage = getSchedulingValidationMessage(activeSchedule);
                    if (validationMessage) {
                      setSnackbar({ open: true, message: validationMessage, severity: 'warning' });
                      return;
                    }
                  }
                  setNewPlanStep((step) => step + 1);
                }}
                variant="contained"
                endIcon={<ChevronRightIcon />}
                sx={{
                  bgcolor: activeTheme.primary,
                  color: activeTheme.backgroundPaper,
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: 2,
                  px: { xs: 2.2, md: 2.6 },
                  py: { xs: 0.9, md: 1.05 },
                  fontSize: '0.95rem',
                  minWidth: { xs: 108, md: 128 },
                  '&:hover': {
                    bgcolor: activeTheme.primaryLight,
                  },
                }}
              >
                {newPlanStep === 4 ? 'Review' : 'Next'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Success Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.workOrderNumber ? 7000 : 4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          action={snackbar.workOrderNumber ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
              <Button
                color="inherit"
                size="small"
                onClick={() => setSnackbar({ open: true, message: `Opening ${snackbar.workOrderNumber}.`, severity: 'info' })}
                sx={{ textTransform: 'none', fontWeight: 900, whiteSpace: 'nowrap' }}
              >
                Open Work Order
              </Button>
              <Button
                color="inherit"
                size="small"
                onClick={() => {
                  setSearch(snackbar.pmPlanId || '');
                  setSnackbar((prev) => ({ ...prev, open: false }));
                }}
                sx={{ textTransform: 'none', fontWeight: 900, whiteSpace: 'nowrap' }}
              >
                View PM Plan
              </Button>
            </Box>
          ) : undefined}
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          {snackbar.workOrderNumber ? `${snackbar.message} ${snackbar.workOrderNumber}` : snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
