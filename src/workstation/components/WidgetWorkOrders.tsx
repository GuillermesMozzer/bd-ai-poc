import {useMemo, useState} from 'react';
import type {CSSProperties, MouseEvent} from 'react';
import {Box, IconButton, Popover, TextField, Tooltip, Typography} from '@mui/material';
import {
  tokenBrand,
  tokenCommon,
  tokenError,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenWarning,
  workstationSoftBadgeSx,
  workstationStatusPillSx,
  workstationVisuals,
} from '../theme';
import WidgetWorkOrderModal, { type LinkedWorkOrder, type WorkOrder, type WorkOrderLinkCandidate } from './WidgetWorkOrderModal';
import {
  Build as BuildIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  ErrorOutline as ErrorOutlineIcon,
  LocalOffer as LocalOfferIcon,
  LocationOn as LocationIcon,
  NorthEast as NorthEastIcon,
  PrecisionManufacturing as MachineIcon,
  TodayOutlined as CalendarIcon,
} from '@mui/icons-material';
import WidgetShell from './WidgetShell';
import {
  myWorkOrdersNotificationConfig,
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  useWidgetNotifications,
} from './WidgetNotifications';
import type {WorkstationContextualizationTarget} from '../types';

type WidgetWorkOrdersProps = {
  className?: string;
  style?: CSSProperties;
  timeframe?: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'shift';
  shift?: string;
  onViewModeChange?: (viewMode: 'graph' | 'table') => void;
  onExpand?: () => void;
  domain?: string;
  currentUserName?: string;
  onOpenContextualization?: (target: WorkstationContextualizationTarget) => void;
};

type MyWorkOrder = WorkOrder & {
  status: 'Scheduled' | 'In Progress';
};

const sharedSafetyRequirements: WorkOrder['safetyRequirements'] = {
  equipmentCondition: 'Stopped / Internal',
  lotoRequired: true,
  lockoutPoint: 'LP-101 / LP-204 (Main Energy Isolation Points)',
  procedure: 'SOP-LOTO-HYD-001 / SOP-ROBOT-LOCKOUT-014',
  ppe: ['Safety Glasses', 'Nitrile Gloves', 'Steel-Toe Boots', 'Cut-Resistant Gloves'],
  hazards: ['Pinch Points', 'Stored Energy', 'Robot Motion', 'Pressurized Fluid', 'Slippery Surface', 'Moving Conveyor'],
  permits: ['Electrical / High Energy'],
  safetyNotes: 'Verify all stored energy is isolated, hydraulic/pneumatic pressure is relieved, and guards are secured before starting work.',
};

const runningExternalSafetyRequirements: WorkOrder['safetyRequirements'] = {
  ...sharedSafetyRequirements,
  equipmentCondition: 'Running / External',
  lotoRequired: false,
  lockoutPoint: '',
  procedure: 'SOP-RUNNING-EXTERNAL-MAINT-006',
  permits: [],
  safetyNotes: 'Execute while the line remains running. Keep work outside guarded zones and coordinate with the operator before any intervention.',
};

const breakdownSafetyRequirements: WorkOrder['safetyRequirements'] = {
  ...sharedSafetyRequirements,
  equipmentCondition: '',
};

const sharedQualityRequired = 'Complete QA verification, first piece / visual inspection, required measurements, evidence attachment, and QA release before returning Line 10 to production.';

const sharedQualityRequirements: WorkOrder['qualityRequirements'] = {
  qualityImpacting: true,
  requiredValidation: [
    'Visual Inspection',
    'QA Approval Required',
    'First Piece Approval',
    'Measurement Verification',
    'Calibration Check',
  ],
  evidenceRequired: ['Photo', 'Document Attachment', 'Reading / Measurement'],
  qaApprovalRequired: true,
  qualityNotes: sharedQualityRequired,
};

const workOrders: MyWorkOrder[] = [
  {
    id: 'WO 606034603',
    title: 'Conveyor drive failure',
    type: 'Breakdown',
    status: 'In Progress',
    assignedTo: ['Guest User', 'John D.'],
    typeColor: tokenError.dark,
    accent: tokenError.dark,
    location: 'Autoguard Line 10',
    date: 'Jan 13, 08:30AM',
    dueDate: '2026-01-13T08:30:00',
    equipment: 'Conveyor CV-210',
    equipmentCriticality: 'A',
    activityType: 'Mechanical',
    priority: 'Emergency',
    problemDescription: 'Main conveyor stopped during production. Motor protection tripped after abnormal vibration.',
    partsNeeded: [],
    futureActions: [
      { id: 'fa-wo-606034603-1', date: '2026-05-22', type: 'Preventive', activityType: 'Inspection', priority: 'Medium' },
      { id: 'fa-wo-606034603-2', date: '2026-05-24', type: 'Corrective', activityType: 'Mechanical', priority: 'High' },
    ],
    machineHistory: [
      {
        id: 'eh-606034603-1',
        date: '2027-01-09 08:00',
        type: 'CIL',
        description: 'Unable to lubricate point L3. Grease gun not available in the tool crib.',
        responsible: 'Carlos M.',
      },
      {
        id: 'eh-606034603-2',
        date: '2027-01-10 14:30',
        type: 'Preventive',
        description: 'Drive belt inspection completed with tension inside the acceptable range.',
        responsible: 'Amanda R.',
      },
      {
        id: 'eh-606034603-3',
        date: '2027-01-08 16:45',
        type: 'Breakdown',
        description: 'Main conveyor stopped after abnormal vibration and motor protection trip.',
        responsible: 'John D.',
      },
      {
        id: 'eh-606034603-4',
        date: '2027-01-07 10:15',
        type: 'Centerline',
        description: 'Centerline check delayed because the machine was stopped for changeover.',
        responsible: 'Lisa W.',
      },
      {
        id: 'eh-606034603-5',
        date: '2027-01-05 12:30',
        type: 'Corrective',
        description: 'Parameter above centerline at start of shift. Adjusted but drifting again after 30 minutes.',
        responsible: 'Mike T.',
      },
      {
        id: 'eh-606034603-6',
        date: '2027-01-04 06:00',
        type: 'CIL',
        description: 'Inspection of the rear motor area not completed because the guard could not be removed.',
        responsible: 'Carlos M.',
      },
      {
        id: 'eh-606034603-7',
        date: '2027-01-03 21:15',
        type: 'Breakdown',
        description: 'Tail pulley jammed during restart after sanitation.',
        responsible: 'Nina P.',
      },
    ],
    attachedFiles: [
      {
        name: 'Plastic Extruder Maintenance Manual.png',
        href: '/workstation/attachments/Plastic%20Extruder%20Maintenance%20Manual.png',
      },
      { name: 'motor-trip-photo.jpg' },
      { name: 'vibration-reading.pdf' },
    ],
    safetyRequirements: breakdownSafetyRequirements,
    qualityRequired: sharedQualityRequired,
    qualityRequirements: sharedQualityRequirements,
  },
  {
    id: 'WO 606034604',
    title: 'Packaging Robot Arm',
    type: 'Corrective',
    status: 'Scheduled',
    assignedTo: ['Guest User', 'Alex C.'],
    typeColor: tokenBrand.light,
    accent: tokenWarning.dark,
    location: 'Autoguard Line 10',
    date: 'Jan 13, 08:30AM',
    dueDate: '2026-01-16T08:30:00',
    equipment: 'Packaging Robot RB-402',
    equipmentCriticality: 'B',
    activityType: 'Automation / Controls',
    priority: 'High',
    problemDescription: 'Robot arm is drifting outside the expected pick position and causing intermittent rejects.',
    partsNeeded: [],
    futureActions: [
      { id: 'fa-wo-606034604-1', date: '2026-05-22', type: 'Corrective', activityType: 'Automation / Controls', priority: 'High' },
      { id: 'fa-wo-606034604-2', date: '2026-05-26', type: 'Preventive', activityType: 'Calibration', priority: 'Medium' },
    ],
    linkedWorkOrders: [
      {
        id: 'WO 606034605',
        type: 'Preventive',
        title: 'WO 606034605 - Pump seal inspection',
        description: 'Quarterly preventive maintenance for pump seal integrity and lubrication condition.',
        scheduledFor: 'Jan 13',
        assignee: 'Amanda R.',
        status: 'Scheduled',
        targetWorkOrderId: 'WO 606034605',
      },
    ],
    machineHistory: [
      {
        id: 'eh-606034604-1',
        date: '2027-01-10 09:20',
        type: 'Corrective',
        description: 'Axis 2 calibration performed after repeated pick-position drift.',
        responsible: 'Alex C.',
      },
      {
        id: 'eh-606034604-2',
        date: '2027-01-08 13:10',
        type: 'Centerline',
        description: 'Robot path centerline verified; minor offset observed on station 4.',
        responsible: 'Priya S.',
      },
      {
        id: 'eh-606034604-3',
        date: '2027-01-06 07:40',
        type: 'CIL',
        description: 'Vacuum cup inspection completed. Two cups marked for replacement.',
        responsible: 'Carlos M.',
      },
      {
        id: 'eh-606034604-4',
        date: '2027-01-03 17:25',
        type: 'Breakdown',
        description: 'Robot cell paused after gripper failed to release pack at discharge.',
        responsible: 'Megan K.',
      },
      {
        id: 'eh-606034604-5',
        date: '2026-12-28 11:05',
        type: 'Preventive',
        description: 'Gripper vacuum line replaced during planned maintenance window.',
        responsible: 'Amanda R.',
      },
    ],
    attachedFiles: [{ name: 'axis-drift-log.csv' }],
    safetyRequirements: runningExternalSafetyRequirements,
    qualityRequired: sharedQualityRequired,
    qualityRequirements: sharedQualityRequirements,
  },
  {
    id: 'WO 606034605',
    title: 'Pump seal inspection',
    type: 'Preventive',
    status: 'Scheduled',
    assignedTo: ['Guest User', 'Amanda R.'],
    typeColor: tokenSuccess.darker,
    accent: tokenSuccess.darker,
    location: 'Autoguard Line 10',
    date: 'Jan 13, 09:15AM',
    dueDate: '2026-01-12T23:59:00',
    equipment: 'Transfer Pump P-118',
    equipmentCriticality: 'C',
    activityType: 'Mechanical',
    priority: 'Medium',
    problemDescription: 'Quarterly preventive maintenance for pump seal integrity and lubrication condition.',
    partsNeeded: [
      { id: 'SAP-SEAL-HYD-01', name: 'Hydraulic Cylinder Seal Kit', location: 'TC1-M3-G2', available: 3, total: 10, quantity: 1 },
      { id: 'SAP-HYD-FLUID-01', name: 'Hydraulic Fluid (1L)', location: 'TC1-M3-G2', available: 0, total: 10, quantity: 1 },
    ],
    futureActions: [
      { id: 'fa-wo-606034605-1', date: '2026-06-15', type: 'Preventive', activityType: 'Mechanical', priority: 'Medium' },
      { id: 'fa-wo-606034605-2', date: '2026-06-22', type: 'Preventive', activityType: 'Lubrication', priority: 'Low' },
    ],
    linkedWorkOrders: [
      {
        id: 'WO 606034604',
        type: 'Corrective',
        title: 'WO 606034604 - Packaging Robot Arm',
        description: 'Robot arm is drifting outside the expected pick position and causing intermittent rejects.',
        scheduledFor: 'Jan 13',
        assignee: 'Alex C.',
        status: 'Scheduled',
        targetWorkOrderId: 'WO 606034604',
      },
    ],
    machineHistory: [
      {
        id: 'eh-606034605-1',
        date: '2027-01-09 06:30',
        type: 'Preventive',
        description: 'Quarterly pump PM completed with no abnormal seal wear found.',
        responsible: 'Amanda R.',
      },
      {
        id: 'eh-606034605-2',
        date: '2027-01-05 15:50',
        type: 'CIL',
        description: 'Lubrication point P2 cleaned and tagged for follow-up next shift.',
        responsible: 'Carlos M.',
      },
      {
        id: 'eh-606034605-3',
        date: '2026-12-19 10:15',
        type: 'Corrective',
        description: 'Small leak near seal housing corrected by tightening retaining hardware.',
        responsible: 'John D.',
      },
      {
        id: 'eh-606034605-4',
        date: '2026-11-22 08:45',
        type: 'Centerline',
        description: 'Flow and pressure readings confirmed inside centerline limits.',
        responsible: 'Lisa W.',
      },
      {
        id: 'eh-606034605-5',
        date: '2026-10-13 14:20',
        type: 'Preventive',
        description: 'Previous PM completed with no findings.',
        responsible: 'Mike T.',
      },
    ],
    attachedFiles: [{ name: 'pm-checklist-p118.pdf' }, { name: 'seal-specification.pdf' }],
    safetyRequirements: sharedSafetyRequirements,
    qualityRequired: sharedQualityRequired,
    qualityRequirements: sharedQualityRequirements,
    preventiveDetails: {
      pmPlan: 'PM-PUMP-QUARTERLY',
      frequency: 'Quarterly',
      plannedDuration: '30 min',
    },
    tasklist: [
      {
        op: '0010',
        operation: '0060',
        description: 'CHECK TRANSFER PUMP SEAL AREA FOR LEAKS, VERIFY PUMP IS ISOLATED AND DEPRESSURIZED BEFORE INSPECTION.',
      },
      {
        op: '0010',
        operation: '0070',
        description: 'INSPECT SEAL FACE, RETAINING HARDWARE AND O-RINGS FOR WEAR. REPLACE UNIT IF NECESSARY.',
        spareParts: [
          { name: 'SAP-SEAL-HYD-01 - Hydraulic Cylinder Seal Kit', stagedInToolCrib: true },
        ],
      },
      {
        op: '0010',
        operation: '0080',
        description: 'CHECK LUBRICATION CONDITION AND APPLY LUBRICANT ACCORDING TO PM STANDARD. RECORD LUBRICANT LOT NUMBER.',
        spareParts: [
          { name: 'SAP-HYD-FLUID-01 - Hydraulic Fluid (1L)', stagedInToolCrib: true },
        ],
      },
      {
        op: '0010',
        operation: '0090',
        description: 'FOLLOWING MAINTENANCE, ENSURE EQUIPMENT IS CLEAN AND HAS BEEN TESTED WITH PRODUCT FOR FUNCTIONALITY / CORRECT OPERATION.',
      },
    ],
  },
  {
    id: 'WO 606034606',
    title: 'Sensor on Z2.C20',
    type: 'Corrective',
    status: 'Scheduled',
    assignedTo: ['Guest User', 'Priya S.'],
    typeColor: tokenBrand.light,
    accent: tokenWarning.light,
    location: 'Autoguard Line 10',
    date: 'Jan 13, 10:00AM',
    dueDate: '2026-02-12T10:00:00',
    equipment: 'Photoeye Sensor Z2.C20',
    equipmentCriticality: 'B',
    activityType: 'Electrical',
    priority: 'Low',
    problemDescription: 'Sensor signal is unstable and creating false reject events.',
    partsNeeded: [],
    futureActions: [
      { id: 'fa-wo-606034606-1', date: '2026-05-22', type: 'Corrective', activityType: 'Electrical', priority: 'Low' },
    ],
    machineHistory: [
      {
        id: 'eh-606034606-1',
        date: '2027-01-09 12:10',
        type: 'Corrective',
        description: 'Sensor bracket tightened after intermittent false reject events.',
        responsible: 'Priya S.',
      },
      {
        id: 'eh-606034606-2',
        date: '2027-01-07 08:25',
        type: 'CIL',
        description: 'Sensor lens cleaned and inspection mark updated.',
        responsible: 'Carlos M.',
      },
      {
        id: 'eh-606034606-3',
        date: '2027-01-04 16:00',
        type: 'Centerline',
        description: 'Detection distance above centerline; alignment adjusted during shift.',
        responsible: 'Lisa W.',
      },
      {
        id: 'eh-606034606-4',
        date: '2026-12-14 09:35',
        type: 'Breakdown',
        description: 'Reject gate stopped after unstable photoeye signal.',
        responsible: 'Megan K.',
      },
    ],
    attachedFiles: [],
    safetyRequirements: sharedSafetyRequirements,
    qualityRequired: sharedQualityRequired,
    qualityRequirements: sharedQualityRequirements,
  },
  {
    id: 'WO 606034607',
    title: 'Molding first piece check',
    type: 'Corrective',
    status: 'Scheduled',
    assignedTo: ['Guest User', 'L. Almeida'],
    typeColor: tokenBrand.light,
    accent: tokenBrand.main,
    location: 'Molding Bay / Line 30',
    date: 'Jan 13, 11:30AM',
    dueDate: '2026-01-13T16:00:00',
    equipment: 'Molding Machine MM-301',
    equipmentCriticality: 'B',
    activityType: 'Quality / Molding',
    priority: 'High',
    problemDescription: 'First piece inspection found dimensional variation on selected mold cavities. Complete molding check, document affected cavities, and hold samples for QA review.',
    partsNeeded: [],
    futureActions: [
      { id: 'fa-wo-606034607-1', date: '2026-01-14', type: 'Corrective', activityType: 'Quality / Molding', priority: 'High' },
      { id: 'fa-wo-606034607-2', date: '2026-01-16', type: 'Preventive', activityType: 'Mold Inspection', priority: 'Medium' },
    ],
    machineHistory: [
      {
        id: 'eh-606034607-1',
        date: '2027-01-10 07:45',
        type: 'Centerline',
        description: 'Cavity pressure trend reviewed after minor drift on mold MOLD-FH-12.',
        responsible: 'L. Almeida',
      },
      {
        id: 'eh-606034607-2',
        date: '2027-01-08 15:30',
        type: 'Corrective',
        description: 'Samples segregated from cavities C14, C51, and C67 after dimensional variation.',
        responsible: 'Quality Team',
      },
      {
        id: 'eh-606034607-3',
        date: '2027-01-06 09:10',
        type: 'Preventive',
        description: 'Mold visual check completed with no blocked cavities recorded.',
        responsible: 'Marina Costa',
      },
    ],
    attachedFiles: [{ name: 'dimensional-report.pdf' }, { name: 'first-piece-photo.jpg' }],
    safetyRequirements: runningExternalSafetyRequirements,
    qualityRequired: 'Complete molding first piece, affected cavity map, cavity detail rows, dimensional evidence attachment, and QA sign-off before final closure.',
    qualityRequirements: {
      qualityImpacting: true,
      requiredValidation: [
        'First Piece Approval',
        'Cavity Map Review',
        'Dimensional Verification',
        'QA Approval Required',
      ],
      evidenceRequired: ['Dimensional Report', 'Photo', 'Cavity Detail Notes'],
      qaApprovalRequired: true,
      qualityNotes: 'Record machine, mold, part number, first piece decision, new cavity check, affected cavities, action taken, status, attachments, and notes for each cavity.',
    },
    moldingQualityDetails: {
      inspector: 'L. Almeida',
      machineNumber: 'MM-301',
      moldNumber: 'MOLD-FH-12',
      jobNumber: 'WO-2026-3814',
      partNumber: 'PN-SYR-10ML',
      firstPieceApproved: 'No',
      newCavityCheck: '',
      overallStatus: 'Watch',
      defectType: 'Dimensional issue',
      affectedCavities: ['C14', 'C51', 'C67'],
      cavityDetails: [
        {
          cavity: 'C14',
          position: 'P14',
          issue: 'Dimensional variation',
          actionTaken: 'Samples segregated',
          status: 'Watch',
          attachments: 'dimensional-report.pdf',
          notes: 'Awaiting QE sign-off.',
        },
        {
          cavity: 'C51',
          position: 'P51',
          issue: 'Dimensional variation',
          actionTaken: 'Samples segregated',
          status: 'Watch',
          attachments: 'dimensional-report.pdf',
          notes: 'Awaiting QE sign-off.',
        },
        {
          cavity: 'C67',
          position: 'P67',
          issue: 'Dimensional variation',
          actionTaken: 'Samples segregated',
          status: 'Watch',
          attachments: 'dimensional-report.pdf',
          notes: 'Awaiting QE sign-off.',
        },
      ],
    },
  },
];

const sqdcpLetters = [
  {label: 'D', color: tokenSuccess.darker},
  {label: 'Q', color: tokenWarning.dark},
  {label: 'S', color: tokenSuccess.darker},
] as const;

const workOrderDays = ['Yesterday', 'Today, Jan 13', 'Tomorrow'] as const;
const workOrderDayDates = ['2026-01-12', '2026-01-13', '2026-01-14'] as const;

const insetCardSx = {
  border: `1px solid ${workstationVisuals.tierBorder}`,
  borderRadius: '8px',
  bgcolor: 'background.paper',
} as const;

const dateNavigatorSx = {
  height: 26,
  borderRadius: '8px',
  border: `1px solid ${workstationVisuals.tierBorder}`,
  bgcolor: 'background.paper',
  fontFamily: workstationVisuals.fontFamily,
  transition: 'all 0.15s ease',
  display: 'inline-flex',
  alignItems: 'center',
  overflow: 'hidden',
  '&:hover': {
    bgcolor: tokenNeutral.lightest,
    borderColor: tokenNeutral.dark,
  },
} as const;

const getWorkOrderDay = (date: string) => date.split(',')[0] ?? date;

const criticalityColorByLevel = {
  A: tokenError.dark,
  B: tokenWarning.main,
  C: tokenSuccess.darker,
} as const;

function getCriticalKpiSx(criticality?: 'error' | 'warning') {
  if (criticality === 'error') {
    return {
      bgcolor: tokenError.softBg,
      border: `1px solid ${tokenError.lighter}`,
      borderRadius: '8px',
    } as const;
  }

  if (criticality === 'warning') {
    return {
      bgcolor: tokenWarning.softBg,
      border: `1px solid ${tokenWarning.lighter}`,
      borderRadius: '8px',
    } as const;
  }

  return {} as const;
}

const priorityDueWindowByPriority: Record<string, {code: string; hours: number; label: string}> = {
  emergency: {code: '0', hours: 0, label: 'Emergency'},
  immediate: {code: '1', hours: 24, label: '24h'},
  high: {code: '2', hours: 72, label: '3d'},
  medium: {code: '3', hours: 168, label: '7d'},
  low: {code: '4', hours: 720, label: '30d'},
  'very low': {code: '5', hours: 2160, label: '90d'},
};

const workOrderReferenceDate = new Date('2026-01-13T11:00:00');
const defaultWorkOrderYear = workOrderReferenceDate.getFullYear();

const initialLinkedWorkOrdersById = workOrders.reduce<Record<string, LinkedWorkOrder[]>>((acc, workOrder) => {
  if (workOrder.linkedWorkOrders?.length) {
    acc[workOrder.id] = workOrder.linkedWorkOrders;
  }
  return acc;
}, {});

function buildWorkOrderLinkCandidates(currentWorkOrderId?: string): WorkOrderLinkCandidate[] {
  return workOrders
    .filter((workOrder) => workOrder.id !== currentWorkOrderId && (workOrder.type === 'Corrective' || workOrder.type === 'Preventive'))
    .map((workOrder) => ({
      id: workOrder.id,
      type: workOrder.type,
      title: workOrder.title,
      description: workOrder.problemDescription,
      scheduledFor: getWorkOrderDay(workOrder.date),
      assignee: workOrder.machineHistory[0]?.responsible ?? 'Unassigned',
      status: 'Scheduled',
      targetWorkOrderId: workOrder.id,
      priority: workOrder.priority,
    }));
}

function parseWorkOrderDate(date: string) {
  const parsed = new Date(date.replace(',', `, ${defaultWorkOrderYear}`));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseDueDate(dueDate?: string) {
  if (!dueDate) return null;
  const parsed = new Date(dueDate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDueDate(date: Date) {
  return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

function formatSelectedWorkOrderDate(isoDate: string) {
  const [year, month, day] = isoDate.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  return Number.isNaN(parsed.getTime()) ? 'Select date' : parsed.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

function getDueDateForWorkOrder(order: WorkOrder) {
  const explicitDueDate = parseDueDate(order.dueDate);
  if (order.type === 'Preventive' || explicitDueDate) return explicitDueDate;

  const priorityWindow = priorityDueWindowByPriority[order.priority.trim().toLowerCase()];
  const scheduledDate = parseWorkOrderDate(order.date);
  if (!priorityWindow || !scheduledDate) return null;

  const dueDate = new Date(scheduledDate);
  dueDate.setHours(dueDate.getHours() + priorityWindow.hours);
  return dueDate;
}

function getWorkOrderDueMeta(order: WorkOrder) {
  const dueDate = getDueDateForWorkOrder(order);
  const priorityWindow = priorityDueWindowByPriority[order.priority.trim().toLowerCase()];

  if (!dueDate) {
    return {
      label: priorityWindow ? `P${priorityWindow.code} ${priorityWindow.label}` : 'Due date pending',
      color: workstationVisuals.tierTextLabel,
      bgcolor: tokenNeutral.lightest,
      borderColor: tokenNeutral.main,
      iconColor: workstationVisuals.textSecondary,
    };
  }

  const isOverdue = dueDate.getTime() < workOrderReferenceDate.getTime();
  if (isOverdue) {
    return {
      label: `Overdue ${formatDueDate(dueDate)}`,
      color: tokenError.darkest,
      bgcolor: tokenNeutral.lightest,
      borderColor: tokenWarning.lighter,
      iconColor: tokenError.darker,
    };
  }

  return {
    label: `Due ${formatDueDate(dueDate)}`,
    color: tokenBrand.dark,
    bgcolor: tokenNeutral.lighter,
    borderColor: tokenInfo.lightest,
    iconColor: tokenBrand.light,
  };
}

function normalizePersonName(name: string) {
  return name.trim().toLowerCase();
}

function getWorkOrderAssignees(order: WorkOrder) {
  const assignedTo = order.assignedTo;
  if (Array.isArray(assignedTo)) return assignedTo;
  if (assignedTo) return [assignedTo];
  return [order.machineHistory[0]?.responsible].filter(Boolean);
}

export default function WidgetWorkOrders({className, style, onExpand, currentUserName = 'Guest User', onOpenContextualization}: WidgetWorkOrdersProps) {
  const notifications = useWidgetNotifications(myWorkOrdersNotificationConfig);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>(workOrderDayDates[1]);
  const [datePickerAnchor, setDatePickerAnchor] = useState<HTMLElement | null>(null);
  const [linkedWorkOrdersById, setLinkedWorkOrdersById] = useState<Record<string, LinkedWorkOrder[]>>(initialLinkedWorkOrdersById);

  const assignedWorkOrders = useMemo(() => {
    const normalizedCurrentUser = normalizePersonName(currentUserName);
    if (!normalizedCurrentUser) return workOrders;

    const matchingOrders = workOrders.filter((order) => (
      getWorkOrderAssignees(order).some((assignee) => normalizePersonName(assignee) === normalizedCurrentUser)
    ));

    return matchingOrders.length > 0 ? matchingOrders : workOrders;
  }, [currentUserName]);

  const selectedLinkedWorkOrders = selectedOrder ? linkedWorkOrdersById[selectedOrder.id] ?? [] : [];
  const selectedWorkOrderCandidates = buildWorkOrderLinkCandidates(selectedOrder?.id);
  const overdueCount = assignedWorkOrders.filter((order) => getWorkOrderDueMeta(order).label.startsWith('Overdue')).length;
  const highPriorityCount = assignedWorkOrders.filter((order) => ['Emergency', 'High'].includes(order.priority)).length;
  const scheduledCount = assignedWorkOrders.filter((order) => order.status === 'Scheduled').length;
  const inProgressWorkOrders = assignedWorkOrders.filter((order) => order.status === 'In Progress');
  const scheduledWorkOrders = assignedWorkOrders.filter((order) => order.status === 'Scheduled');
  const selectedPeriodLabel = selectedDate === workOrderDayDates[selectedDayIndex] ? workOrderDays[selectedDayIndex] : formatSelectedWorkOrderDate(selectedDate);
  const renderEquipmentName = (order: MyWorkOrder) => {
    const equipmentTextSx = {
      fontSize: '0.68rem',
      color: workstationVisuals.textSecondary,
      fontWeight: 500,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontFamily: workstationVisuals.fontFamily,
    } as const;

    if (order.equipment === 'Conveyor CV-210' && onOpenContextualization) {
      return (
        <Box
          component="button"
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenContextualization('conveyor-belt-c4');
          }}
          sx={{
            ...equipmentTextSx,
            p: 0,
            border: 0,
            bgcolor: 'transparent',
            color: tokenBrand.main,
            fontWeight: 700,
            textDecoration: 'underline',
            textDecorationThickness: '1px',
            textUnderlineOffset: '2px',
            cursor: 'pointer',
            '&:hover': {color: tokenBrand.dark},
          }}
        >
          {order.equipment}
        </Box>
      );
    }

    return <Typography sx={equipmentTextSx}>{order.equipment}</Typography>;
  };

  const openDatePicker = (event: MouseEvent<HTMLElement>) => {
    setDatePickerAnchor(event.currentTarget);
  };

  const closeDatePicker = () => {
    setDatePickerAnchor(null);
  };

  const linkWorkOrder = (sourceWorkOrderId: string, linkedWorkOrder: LinkedWorkOrder) => {
    setLinkedWorkOrdersById((current) => {
      const currentLinks = current[sourceWorkOrderId] ?? [];
      if (currentLinks.some((item) => item.id === linkedWorkOrder.id)) return current;
      return {
        ...current,
        [sourceWorkOrderId]: [...currentLinks, linkedWorkOrder],
      };
    });
  };

  const openWorkOrder = (workOrderId: string) => {
    const workOrder = workOrders.find((order) => order.id === workOrderId);
    if (workOrder) setSelectedOrder(workOrder);
  };

  const headerAction = (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.75}}>
      <Box sx={dateNavigatorSx}>
        <IconButton
          size="small"
          aria-label="Previous work order day"
          disabled={selectedDayIndex === 0}
          onClick={() => setSelectedDayIndex((current) => {
            const nextIndex = Math.max(0, current - 1);
            setSelectedDate(workOrderDayDates[nextIndex]);
            return nextIndex;
          })}
          sx={{width: 24, height: 24, p: 0, borderRadius: 0, color: 'rgba(15, 23, 42, 0.62)'}}
        >
          <ChevronLeftIcon sx={{fontSize: 16}} />
        </IconButton>
        <Box
          onClick={openDatePicker}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            setDatePickerAnchor(event.currentTarget);
          }}
          sx={{display: 'inline-flex', alignItems: 'center', gap: 0.35, px: 0.75, minWidth: 104, height: 24, justifyContent: 'center', cursor: 'pointer', '&:hover': {bgcolor: tokenNeutral.lightest}}}
        >
          <CalendarIcon sx={{fontSize: 13, color: 'rgba(15, 23, 42, 0.62)'}} />
          <Typography sx={{fontSize: '0.72rem', fontWeight: 500, color: 'rgba(15, 23, 42, 0.7)', lineHeight: 1, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
            {selectedPeriodLabel}
          </Typography>
        </Box>
        <IconButton
          size="small"
          aria-label="Next work order day"
          disabled={selectedDayIndex === workOrderDays.length - 1}
          onClick={() => setSelectedDayIndex((current) => {
            const nextIndex = Math.min(workOrderDays.length - 1, current + 1);
            setSelectedDate(workOrderDayDates[nextIndex]);
            return nextIndex;
          })}
          sx={{width: 24, height: 24, p: 0, borderRadius: 0, color: 'rgba(15, 23, 42, 0.62)'}}
        >
          <ChevronRightIcon sx={{fontSize: 16}} />
        </IconButton>
      </Box>
      <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={24} />
      <IconButton size="small" aria-label="Open Maintenance Calendar" onClick={onExpand} sx={{width: 24, height: 24, p: 0, color: tokenBrand.main}}>
        <NorthEastIcon sx={{fontSize: 18}} />
      </IconButton>
    </Box>
  );

  return (
    <>
      <WidgetShell
        title="My Work Orders"
        action={headerAction}
        className={className}
        style={style}
      >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.2,
          height: '100%',
          minHeight: 0,
          p: 0.5,
          containerType: 'inline-size',
        }}
      >
        <Box
          sx={{
            ...insetCardSx,
            p: 1.5,
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 1,
            flexShrink: 0,
            '@container (max-width: 620px)': {
              gridTemplateColumns: '1fr',
            },
          }}
        >
          <MetricSummary value={String(scheduledCount)} label="Scheduled" note={selectedPeriodLabel} color={tokenBrand.main} />
          <MetricSummary value={String(highPriorityCount)} label="High Priority" note="Emergency or high" color={tokenError.main} criticality="error" />
          <MetricSummary value={String(overdueCount)} label="Overdue" note="Past due date" color={tokenWarning.main} criticality="warning" last />
        </Box>

        <Box sx={{...insetCardSx, p: 1.5, flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexShrink: 0}}>
            <Typography
              sx={{
                color: workstationVisuals.textPrimary,
                fontFamily: workstationVisuals.fontFamily,
                fontSize: '0.82rem',
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              In Progress Work Orders
            </Typography>
            <Typography
              sx={{
                color: workstationVisuals.textSecondary,
                fontFamily: workstationVisuals.fontFamily,
                fontSize: '0.68rem',
                fontWeight: 500,
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
              }}
            >
              {inProgressWorkOrders.length} shown
            </Typography>
          </Box>

          <Box
            sx={{
              maxHeight: 116,
              overflow: 'auto',
              display: 'grid',
              alignContent: 'start',
              gap: 1,
            }}
          >
            {inProgressWorkOrders.map((order) => {
              const dueMeta = getWorkOrderDueMeta(order);

              return (
                <Box
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    minHeight: 74,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(190px, 220px) minmax(132px, max-content)',
                    alignItems: 'start',
                    gap: 1.25,
                    px: 1.1,
                    py: 1,
                    border: `1px solid ${workstationVisuals.tierBorder}`,
                    borderRadius: '8px',
                    transition: 'border-color 0.15s ease, background-color 0.15s ease',
                    '&:hover': {
                      borderColor: tokenNeutral.dark,
                      bgcolor: tokenNeutral.lightest,
                    },
                    '@container (max-width: 620px)': {
                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                      '& .work-order-meta': {
                        gridColumn: '1 / -1',
                        gridRow: 2,
                        justifySelf: 'stretch',
                        gridTemplateColumns: 'repeat(2, minmax(0, max-content))',
                        justifyContent: 'start',
                      },
                    },
                    '@container (max-width: 360px)': {
                      gridTemplateColumns: 'minmax(0, 1fr)',
                      gap: 0.75,
                      '& .work-order-status': {
                        justifySelf: 'start',
                      },
                      '& .work-order-meta': {
                        gridTemplateColumns: 'minmax(0, 1fr)',
                      },
                    },
                  }}
                >
                  <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: order.accent}} />

                  <Box sx={{minWidth: 0, pl: 0.35}}>
                    <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.55, minWidth: 0}}>
                      <Typography sx={{fontSize: '0.78rem', color: workstationVisuals.textPrimary, lineHeight: 1.18, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
                        {order.title}
                      </Typography>
                      <Box sx={{display: 'flex', gap: 0.35, flex: '0 0 auto'}}>
                        {sqdcpLetters.map((letter) => (
                          <Typography key={letter.label} component="span" sx={{fontSize: '0.66rem', color: letter.color, lineHeight: 1, fontWeight: 600, fontFamily: workstationVisuals.fontFamily}}>
                            {letter.label}
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 0.65,
                        mt: 0.65,
                        minWidth: 0,
                      }}
                    >
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35}}>
                        <LocalOfferIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary}} />
                        <Box sx={{...workstationSoftBadgeSx, borderRadius: '8px', fontSize: '0.64rem', fontWeight: 600}}>
                          {order.id}
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.65, minWidth: 0}}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, flex: '0 0 auto'}}>
                        <BuildIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary}} />
                        <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
                          {order.type}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    className="work-order-meta"
                    sx={{
                      display: 'grid',
                      gap: 0.55,
                      justifySelf: 'start',
                      justifyItems: 'start',
                      width: '100%',
                      minWidth: 0,
                      pt: 0.25,
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0}}>
                      <CalendarIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
                      <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
                        {getWorkOrderDay(order.date)}
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.35,
                          height: 20,
                          px: 0.75,
                          borderRadius: '8px',
                          border: `1px solid ${dueMeta.borderColor}`,
                          bgcolor: dueMeta.bgcolor,
                          color: dueMeta.color,
                          fontSize: '0.64rem',
                          fontWeight: 600,
                          lineHeight: 1,
                          fontFamily: workstationVisuals.fontFamily,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <ErrorOutlineIcon sx={{fontSize: 13, color: dueMeta.iconColor}} />
                        {dueMeta.label}
                      </Box>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0}}>
                      <LocationIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
                      <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily}}>
                        {order.location}
                      </Typography>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0, flexWrap: 'wrap'}}>
                      <MachineIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
                      {order.equipmentCriticality ? (
                        <Typography
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 18,
                            height: 18,
                            borderRadius: '8px',
                            border: `1px solid ${criticalityColorByLevel[order.equipmentCriticality]}`,
                            bgcolor: tokenCommon.white,
                            color: criticalityColorByLevel[order.equipmentCriticality],
                            fontSize: '0.66rem',
                            fontWeight: 600,
                            lineHeight: 1,
                            flex: '0 0 auto',
                            fontFamily: workstationVisuals.fontFamily,
                          }}
                        >
                          {order.equipmentCriticality}
                        </Typography>
                      ) : null}
                      {renderEquipmentName(order)}
                    </Box>
                  </Box>

                  <Box className="work-order-status" sx={{display: 'grid', justifyItems: 'end', gap: 0.55, minWidth: 0, '@container (max-width: 360px)': {justifyItems: 'start'}}}>
                    {order.safetyRequirements.equipmentCondition ? (
                      <Box
                        className="work-order-condition"
                        sx={{
                          justifySelf: 'end',
                          display: 'inline-flex',
                          alignItems: 'center',
                          minHeight: 22,
                          maxWidth: 'none',
                          px: 0.75,
                          borderRadius: '8px',
                          border: order.safetyRequirements.equipmentCondition === 'Stopped / Internal' ? `1px solid ${tokenError.lightest}` : `1px solid ${tokenInfo.lightest}`,
                          bgcolor: order.safetyRequirements.equipmentCondition === 'Stopped / Internal' ? tokenNeutral.lighter : tokenNeutral.lightest,
                          color: order.safetyRequirements.equipmentCondition === 'Stopped / Internal' ? tokenError.darkest : tokenBrand.main,
                          fontSize: '0.64rem',
                          fontWeight: 600,
                          lineHeight: 1,
                          fontFamily: workstationVisuals.fontFamily,
                          overflow: 'visible',
                          whiteSpace: 'nowrap',
                          '@container (max-width: 360px)': {justifySelf: 'start'},
                        }}
                      >
                        {order.safetyRequirements.equipmentCondition}
                      </Box>
                    ) : null}
                    <Box
                      className="work-order-status"
                      sx={{...workstationStatusPillSx('neutral'), justifySelf: 'end', borderRadius: '8px', '@container (max-width: 360px)': {justifySelf: 'start'}}}
                    >
                      {order.status}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{...insetCardSx, p: 1.5, minHeight: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 1}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, flexShrink: 0}}>
              <Typography
                sx={{
                  color: workstationVisuals.textPrimary,
                  fontFamily: workstationVisuals.fontFamily,
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  lineHeight: 1.2,
                }}
              >
                Scheduled Work Orders
              </Typography>
              <Typography
                sx={{
                  color: workstationVisuals.textSecondary,
                  fontFamily: workstationVisuals.fontFamily,
                  fontSize: '0.68rem',
                  fontWeight: 500,
                  lineHeight: 1.2,
                  whiteSpace: 'nowrap',
                }}
              >
                {scheduledWorkOrders.length} shown
              </Typography>
          </Box>

          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
              display: 'grid',
              alignContent: 'start',
              gap: 1,
            }}
          >
            {scheduledWorkOrders.map((order) => {
              const dueMeta = getWorkOrderDueMeta(order);

              return (
                <Box
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    minHeight: 74,
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(190px, 220px) minmax(132px, max-content)',
                    alignItems: 'start',
                    gap: 1.25,
                    px: 1.1,
                    py: 1,
                    border: `1px solid ${workstationVisuals.tierBorder}`,
                    borderRadius: '8px',
                    transition: 'border-color 0.15s ease, background-color 0.15s ease',
                    '&:hover': {
                      borderColor: tokenNeutral.dark,
                      bgcolor: tokenNeutral.lightest,
                    },
                    '@container (max-width: 620px)': {
                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                      '& .work-order-meta': {
                        gridColumn: '1 / -1',
                        gridRow: 2,
                        justifySelf: 'stretch',
                        gridTemplateColumns: 'repeat(2, minmax(0, max-content))',
                        justifyContent: 'start',
                      },
                    },
                    '@container (max-width: 360px)': {
                      gridTemplateColumns: 'minmax(0, 1fr)',
                      gap: 0.75,
                      '& .work-order-status': {
                        justifySelf: 'start',
                      },
                      '& .work-order-meta': {
                        gridTemplateColumns: 'minmax(0, 1fr)',
                      },
                    },
                  }}
                >
                  <Box sx={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: order.accent}} />

                  <Box sx={{minWidth: 0, pl: 0.35}}>
                    <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.55, minWidth: 0}}>
                      <Typography sx={{fontSize: '0.78rem', color: workstationVisuals.textPrimary, lineHeight: 1.18, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
                        {order.title}
                      </Typography>
                      <Box sx={{display: 'flex', gap: 0.35, flex: '0 0 auto'}}>
                        {sqdcpLetters.map((letter) => (
                          <Typography key={letter.label} component="span" sx={{fontSize: '0.66rem', color: letter.color, lineHeight: 1, fontWeight: 600, fontFamily: workstationVisuals.fontFamily}}>
                            {letter.label}
                          </Typography>
                        ))}
                      </Box>
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 0.65,
                        mt: 0.65,
                        minWidth: 0,
                      }}
                    >
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35}}>
                        <LocalOfferIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary}} />
                        <Box sx={{...workstationSoftBadgeSx, borderRadius: '8px', fontSize: '0.64rem', fontWeight: 600}}>
                          {order.id}
                        </Box>
                      </Box>
                    </Box>

                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.65, minWidth: 0}}>
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, flex: '0 0 auto'}}>
                        <BuildIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary}} />
                        <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
                          {order.type}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box
                    className="work-order-meta"
                    sx={{
                      display: 'grid',
                      gap: 0.55,
                      justifySelf: 'start',
                      justifyItems: 'start',
                      width: '100%',
                      minWidth: 0,
                      pt: 0.25,
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0}}>
                      <CalendarIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
                      <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', fontFamily: workstationVisuals.fontFamily}}>
                        {getWorkOrderDay(order.date)}
                      </Typography>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.35,
                          height: 20,
                          px: 0.75,
                          borderRadius: '8px',
                          border: `1px solid ${dueMeta.borderColor}`,
                          bgcolor: dueMeta.bgcolor,
                          color: dueMeta.color,
                          fontSize: '0.64rem',
                          fontWeight: 600,
                          lineHeight: 1,
                          fontFamily: workstationVisuals.fontFamily,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <ErrorOutlineIcon sx={{fontSize: 13, color: dueMeta.iconColor}} />
                        {dueMeta.label}
                      </Box>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0}}>
                      <LocationIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
                      <Typography sx={{fontSize: '0.68rem', color: workstationVisuals.textSecondary, fontWeight: 500, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: workstationVisuals.fontFamily}}>
                        {order.location}
                      </Typography>
                    </Box>
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.35, minWidth: 0, flexWrap: 'wrap'}}>
                      <MachineIcon sx={{fontSize: 14, color: workstationVisuals.textSecondary, flex: '0 0 auto'}} />
                      {order.equipmentCriticality ? (
                        <Typography
                          component="span"
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 18,
                            height: 18,
                            borderRadius: '8px',
                            border: `1px solid ${criticalityColorByLevel[order.equipmentCriticality]}`,
                            bgcolor: tokenCommon.white,
                            color: criticalityColorByLevel[order.equipmentCriticality],
                            fontSize: '0.66rem',
                            fontWeight: 600,
                            lineHeight: 1,
                            flex: '0 0 auto',
                            fontFamily: workstationVisuals.fontFamily,
                          }}
                        >
                          {order.equipmentCriticality}
                        </Typography>
                      ) : null}
                      {renderEquipmentName(order)}
                    </Box>
                  </Box>

                  <Box className="work-order-status" sx={{display: 'grid', justifyItems: 'end', gap: 0.55, minWidth: 0, '@container (max-width: 360px)': {justifyItems: 'start'}}}>
                    {order.safetyRequirements.equipmentCondition ? (
                      <Box
                        className="work-order-condition"
                        sx={{
                          justifySelf: 'end',
                          display: 'inline-flex',
                          alignItems: 'center',
                          minHeight: 22,
                          maxWidth: 'none',
                          px: 0.75,
                          borderRadius: '8px',
                          border: order.safetyRequirements.equipmentCondition === 'Stopped / Internal' ? `1px solid ${tokenError.lightest}` : `1px solid ${tokenInfo.lightest}`,
                          bgcolor: order.safetyRequirements.equipmentCondition === 'Stopped / Internal' ? tokenNeutral.lighter : tokenNeutral.lightest,
                          color: order.safetyRequirements.equipmentCondition === 'Stopped / Internal' ? tokenError.darkest : tokenBrand.main,
                          fontSize: '0.64rem',
                          fontWeight: 600,
                          lineHeight: 1,
                          fontFamily: workstationVisuals.fontFamily,
                          overflow: 'visible',
                          whiteSpace: 'nowrap',
                          '@container (max-width: 360px)': {justifySelf: 'start'},
                        }}
                      >
                        {order.safetyRequirements.equipmentCondition}
                      </Box>
                    ) : null}
                    <Box
                      className="work-order-status"
                      sx={{...workstationStatusPillSx('neutral'), justifySelf: 'end', borderRadius: '8px', '@container (max-width: 360px)': {justifySelf: 'start'}}}
                    >
                      {order.status}
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      <WidgetWorkOrderModal 
        open={!!selectedOrder} 
        onClose={() => setSelectedOrder(null)} 
        workOrder={selectedOrder}
        workOrderCandidates={selectedWorkOrderCandidates}
        linkedWorkOrders={selectedLinkedWorkOrders}
        onLinkWorkOrder={linkWorkOrder}
        onOpenWorkOrder={openWorkOrder}
      />
      <Popover
        open={Boolean(datePickerAnchor)}
        anchorEl={datePickerAnchor}
        onClose={closeDatePicker}
        anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        transformOrigin={{vertical: 'top', horizontal: 'center'}}
        PaperProps={{sx: {mt: 0.75, p: 1.25, borderRadius: '8px', boxShadow: '0 12px 28px rgba(15, 23, 42, 0.16)'}}}
      >
        <TextField
          type="date"
          size="small"
          value={selectedDate}
          onChange={(event) => {
            setSelectedDate(event.target.value);
            const matchingIndex = workOrderDayDates.findIndex((date) => date === event.target.value);
            if (matchingIndex >= 0) setSelectedDayIndex(matchingIndex);
          }}
          inputProps={{'aria-label': 'Select work order date'}}
          sx={{
            width: 160,
            '& .MuiInputBase-root': {height: 34, borderRadius: '8px', fontFamily: workstationVisuals.fontFamily, fontSize: '0.78rem'},
          }}
        />
      </Popover>
      </WidgetShell>
      <WidgetNotificationsDialog
        active={notifications.active}
        config={myWorkOrdersNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
    </>
  );
}

function MetricSummary({
  color,
  criticality,
  label,
  last = false,
  note,
  value,
}: {
  color: string;
  criticality?: 'error' | 'warning';
  label: string;
  last?: boolean;
  note: string;
  value: string;
}) {
  return (
    <Box
      sx={{
        p: 0.5,
        pl: 1,
        minWidth: 0,
        borderRight: last ? 'none' : `1px solid ${workstationVisuals.tierBorder}`,
        ...getCriticalKpiSx(criticality),
        '@container (max-width: 620px)': {
          borderRight: 'none',
        },
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'baseline', gap: 0.8, minWidth: 0}}>
        <Typography sx={{fontSize: '1.25rem', color, fontWeight: 600, lineHeight: 1, fontFamily: workstationVisuals.fontFamily, flexShrink: 0}}>
          {value}
        </Typography>
        <Typography sx={{fontSize: '0.72rem', color: workstationVisuals.textPrimary, fontWeight: 500, lineHeight: 1.2, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
          {label}
        </Typography>
      </Box>
      <Typography sx={{fontSize: '0.62rem', color: workstationVisuals.textSecondary, mt: 0.5, fontFamily: workstationVisuals.fontFamily, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
        {note}
      </Typography>
    </Box>
  );
}
