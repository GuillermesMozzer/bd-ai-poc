import type {
  ScheduledWorkOrder,
  SchedulingTimelineLine,
  SelectedEventTypesState,
  TimelineCategoryConfig,
  TimelineDateRange,
  TimelineEvent,
  TimelineShortcut,
} from './types';
import {formatIsoDateTime, getDateRangeFromShortcut, parseLocalDate, TIMELINE_REFERENCE_DATE} from './utils';

function workOrder(
  id: string,
  woNumber: string,
  productCode: string,
  lineId: string,
  start: string,
  end: string,
  status: ScheduledWorkOrder['status'],
  priority: ScheduledWorkOrder['priority'],
  readinessStatus: ScheduledWorkOrder['readinessStatus'],
  exceptionCount = 0,
): ScheduledWorkOrder {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const rawDuration = (endDate.getTime() - startDate.getTime()) / 3600000;
  return {
    id,
    woNumber,
    batchNumber: `B-${woNumber.replace('WO-', '')}`,
    productCode,
    productDescription: `${productCode} planning batch`,
    productFamily: productCode.split('-')[1] ?? productCode,
    quantity: 8000 + Number(id.replace(/\D/g, '').slice(-2) || '0') * 120,
    uom: 'EA',
    lineId,
    plannedStartDateTime: start,
    plannedEndDateTime: end,
    durationHours: rawDuration <= 0 ? 1 : rawDuration,
    status,
    readinessStatus,
    priority,
    exceptionCount,
    constraintReason: exceptionCount ? 'Constraint detected during planning review.' : '',
    plannerComment: priority === 'Critical' ? 'Protect this slot for customer commitment.' : '',
  };
}

export const timelineViewOptions = [
  {id: 'timeline', label: 'Timeline'},
  {id: 'kanban', label: 'Kanban'},
  {id: 'calendar', label: 'Calendar'},
  {id: 'gantt', label: 'Gantt'},
  {id: 'table', label: 'Table/List'},
] as const;

export const timelineShortcutOptions: Array<{id: TimelineShortcut; label: string}> = [
  {id: 'Today', label: 'Today'},
  {id: 'ThreeDays', label: '3 Days'},
  {id: 'SevenDays', label: '7 Days'},
  {id: 'FifteenDays', label: '15 Days'},
  {id: 'OneMonth', label: '1 Month'},
] as const;

export const demoTimelineLines: SchedulingTimelineLine[] = [
  {id: 'line-10', name: 'Line 10 - Tube Fill & Seal 1', area: 'Liquids', status: 'Running', utilizationPercent: 88, availableHours: 0, plannedHours: 0, currentWorkOrderId: 'WO-100245', riskLevel: 'Medium', riskReason: 'Labeler supply risk', machineCount: 3, notes: 'Primary campaign line'},
  {id: 'line-20', name: 'Line 20 - Tube Fill & Seal 2', area: 'Liquids', status: 'Running', utilizationPercent: 76, availableHours: 0, plannedHours: 0, currentWorkOrderId: 'WO-200104', riskLevel: 'Low', riskReason: '', machineCount: 2, notes: 'Flexible support line'},
  {id: 'line-30', name: 'Line 30 - Assembly Line 1', area: 'Assembly', status: 'AtRisk', utilizationPercent: 81, availableHours: 0, plannedHours: 0, currentWorkOrderId: 'WO-300090', riskLevel: 'High', riskReason: 'Assembly robot down', machineCount: 4, notes: 'Assembly and kitting'},
  {id: 'line-40', name: 'Line 40 - Sterilization Line', area: 'Sterile', status: 'Running', utilizationPercent: 95, availableHours: 0, plannedHours: 0, currentWorkOrderId: 'WO-400021', riskLevel: 'High', riskReason: 'Queue buildup', machineCount: 1, notes: 'Sterilization queue is tight.'},
  {id: 'line-50', name: 'Line 50 - Packaging Line 1', area: 'Packaging', status: 'AtRisk', utilizationPercent: 82, availableHours: 0, plannedHours: 0, currentWorkOrderId: 'WO-500044', riskLevel: 'High', riskReason: 'Checkweigher calibration expired', machineCount: 5, notes: 'Packaging final stage'},
  {id: 'line-60', name: 'Line 60 - Manual / Rework', area: 'Manual Ops', status: 'Idle', utilizationPercent: 45, availableHours: 0, plannedHours: 0, currentWorkOrderId: null, riskLevel: 'Low', riskReason: '', machineCount: 2, notes: 'Manual intervention and rework'},
  {id: 'line-70', name: 'Line 70 - Inspection Line', area: 'Inspection', status: 'Running', utilizationPercent: 79, availableHours: 0, plannedHours: 0, currentWorkOrderId: 'WO-700011', riskLevel: 'Medium', riskReason: 'Final QA queue', machineCount: 3, notes: 'Final inspection and release'},
];

export const timelineCategoryConfig: TimelineCategoryConfig[] = [
  {name: 'Work Orders', color: '#2563EB', eventTypes: ['WO Planned', 'WO Released', 'WO Running', 'WO Completed', 'WO Paused', 'WO Rescheduled', 'WO On Hold', 'WO Cancelled']},
  {name: 'Downtime', color: '#F97316', eventTypes: ['Machine Down', 'Unplanned Downtime', 'Planned Downtime', 'Utility Downtime', 'IT/System Downtime']},
  {name: 'Maintenance', color: '#F59E0B', eventTypes: ['Preventive Maintenance', 'Corrective Maintenance', 'Maintenance Started', 'Maintenance Completed', 'Calibration Due', 'Calibration Expired']},
  {name: 'Changeover / Setup', color: '#10B981', eventTypes: ['Changeover Started', 'Changeover Completed', 'Setup Started', 'Setup Completed', 'Mold Change', 'Line Clearance']},
  {name: 'Material', color: '#EAB308', eventTypes: ['Material Shortage', 'Material Available', 'Material Staged', 'Material Partially Staged', 'Material Blocked', 'Wrong Material Scanned', 'Material Reconciled']},
  {name: 'Labor', color: '#8B5CF6', eventTypes: ['Crew Assigned', 'Labor Shortage', 'Operator Reassigned', 'Shift Started', 'Shift Ended', 'Break', 'Overtime Added', 'Absence Reported']},
  {name: 'Quality', color: '#EC4899', eventTypes: ['Quality Hold', 'IPC Started', 'IPC Completed', 'IPC Failed', 'Inspection Passed', 'Inspection Failed', 'Nonconformance Opened', 'Hold Released']},
  {name: 'Documentation', color: '#64748B', eventTypes: ['DHR Step Completed', 'DHR Missing Entry', 'Document Issue', 'Missing Signature', 'SOP Not Available', 'DHR Approved', 'DHR Rejected']},
  {name: 'Engineering / Validation', color: '#0EA5E9', eventTypes: ['Engineering Trial', 'Validation Run', 'Process Validation', 'Equipment Qualification', 'Test Run']},
  {name: 'Supplier Test', color: '#14B8A6', eventTypes: ['Supplier Test Planned', 'Supplier Test Running', 'Supplier Test Passed', 'Supplier Test Failed', 'Supplier Material Trial', 'Supplier Sample Review']},
  {name: 'Warehouse / Logistics', color: '#3B82F6', eventTypes: ['Material Picked', 'Material Staged', 'Warehouse Delay', 'Stock Mismatch', 'Material Not Found', 'Staging Complete']},
  {name: 'Sterilization', color: '#0F766E', eventTypes: ['Sent to Sterilization', 'Sterilization Running', 'Sterilization Completed', 'Sterilization Hold', 'Sterilization Release Pending']},
  {name: 'Exception / Conflict', color: '#DC2626', eventTypes: ['Capacity Overload', 'Schedule Conflict', 'Material Conflict', 'Labor Conflict', 'Quality Conflict', 'Frozen Period Violation']},
  {name: 'Shift Events', color: '#7C3AED', eventTypes: ['Shift Start', 'Shift End', 'Shift Handover', 'Break Window']},
  {name: 'AI Risk Alerts', color: '#7C2D12', eventTypes: ['AI Due Date Risk', 'AI Capacity Risk', 'AI Material Risk', 'AI Suggested Re-sequence']},
];

export const timelineMockDataNote = 'Mock dataset: line schedules plus machine drilldown across 7 production lines.';

export function createSelectedEventTypesState(categoryConfig: TimelineCategoryConfig[]) {
  return categoryConfig.reduce<SelectedEventTypesState>((accumulator, category) => {
    accumulator[category.name] = category.eventTypes.reduce<Record<string, boolean>>((eventTypeAccumulator, eventType) => {
      eventTypeAccumulator[eventType] = true;
      return eventTypeAccumulator;
    }, {});
    return accumulator;
  }, {});
}

export const defaultSelectedEventTypes = createSelectedEventTypesState(timelineCategoryConfig);

const durationBands: Record<string, [number, number]> = {
  'Work Orders': [4, 10],
  'Downtime': [0.5, 3],
  'Maintenance': [1, 6],
  'Changeover / Setup': [0.5, 3],
  'Material': [0.5, 2],
  'Labor': [0.5, 4],
  'Quality': [0.75, 4],
  'Documentation': [0.5, 2],
  'Engineering / Validation': [2, 8],
  'Supplier Test': [1, 5],
  'Warehouse / Logistics': [0.5, 3],
  'Sterilization': [3, 12],
  'Exception / Conflict': [0.5, 4],
  'Shift Events': [0.5, 12],
  'AI Risk Alerts': [0.5, 2],
};

const impactedWoCategories = new Set([
  'Material',
  'Warehouse / Logistics',
  'Quality',
  'Documentation',
  'Sterilization',
  'Exception / Conflict',
  'AI Risk Alerts',
]);

function roundToHalfHour(value: number) {
  return Math.round(value * 2) / 2;
}

function buildEventStatus(eventType: string) {
  if (/Completed|Passed|Approved|Released|Available|Reconciled|Picked|Staged|Start$|Started|Running|Assigned|Added/i.test(eventType)) {
    return /Completed|Passed|Approved|Released|Available|Reconciled|Picked|Staged/i.test(eventType) ? 'Completed' : 'Running';
  }
  if (/Failed|Conflict|Violation|Hold|Blocked|Down|Shortage|Mismatch|Missing|Rejected|Expired|Risk/i.test(eventType)) {
    return 'Blocker';
  }
  if (/Paused|On Hold|Delay|Not Found|Issue/i.test(eventType)) {
    return 'Warning';
  }
  return 'Planned';
}

function buildSeverity(eventIndex: number) {
  if (eventIndex === 4) {
    return 'Blocker' as const;
  }
  if (eventIndex === 3) {
    return 'Warning' as const;
  }
  return 'Info' as const;
}

function buildRecommendedActions(category: string, eventType: string) {
  return [
    `Review ${eventType.toLowerCase()} owner and confirm next milestone.`,
    `Validate material, labor, and quality dependencies for ${category.toLowerCase()}.`,
    'Escalate in the planner review if the event remains unresolved by the next shift.',
  ];
}

export function generateLineScheduleMockEvents({
  lines,
  categoryConfig,
  startDate,
  daysToGenerate,
  eventsPerEventType,
  workOrders,
}: {
  lines: SchedulingTimelineLine[];
  categoryConfig: TimelineCategoryConfig[];
  startDate: string;
  daysToGenerate: number;
  eventsPerEventType: number;
  workOrders: ScheduledWorkOrder[];
}) {
  const startDateObject = parseLocalDate(startDate);
  const events: TimelineEvent[] = [];

  categoryConfig.forEach((category, categoryIndex) => {
    const [minimumDuration, maximumDuration] = durationBands[category.name];
    const durationStep = (maximumDuration - minimumDuration) / Math.max(1, eventsPerEventType - 1);

    category.eventTypes.forEach((eventType, eventTypeIndex) => {
      for (let eventIndex = 0; eventIndex < eventsPerEventType; eventIndex += 1) {
        const line = lines[(eventTypeIndex + eventIndex) % lines.length];
        const workOrder = workOrders[(categoryIndex * 7 + eventTypeIndex * 5 + eventIndex) % workOrders.length];
        const dayOffset = (eventTypeIndex + eventIndex) % daysToGenerate;
        const startHour = 6 + ((categoryIndex * 2 + eventTypeIndex + (eventIndex % 2 === 0 ? 0 : -1)) % 12);
        const startMinute = eventIndex % 2 === 0 ? 0 : 30;
        const start = new Date(startDateObject);
        start.setDate(start.getDate() + dayOffset);
        start.setHours(startHour, startMinute, 0, 0);

        // Force some deterministic overlap on shared lines and days.
        if ((eventTypeIndex + eventIndex) % 5 === 0) {
          start.setHours(start.getHours() - 1);
        }

        const durationHours = roundToHalfHour(minimumDuration + durationStep * eventIndex);
        const end = new Date(start);
        end.setMinutes(end.getMinutes() + durationHours * 60);

        const shouldAttachWo = category.name === 'Work Orders' || impactedWoCategories.has(category.name);
        events.push({
          id: `event-${categoryIndex + 1}-${eventTypeIndex + 1}-${eventIndex + 1}`,
          lineId: line.id,
          lineName: line.name,
          category: category.name,
          eventType,
          status: buildEventStatus(eventType),
          severity: buildSeverity(eventIndex),
          startDateTime: formatIsoDateTime(start),
          endDateTime: formatIsoDateTime(end),
          description: `${eventType} generated for ${line.name} during the 5-day planning horizon.`,
          source: category.name === 'AI Risk Alerts' ? 'AI Scheduler' : category.name === 'Documentation' ? 'eDHR' : 'MES / Planner Mock',
          reasonCode: `${category.name.slice(0, 3).toUpperCase()}-${String(eventTypeIndex + 1).padStart(2, '0')}`,
          recommendedActions: buildRecommendedActions(category.name, eventType),
          relatedWorkOrderId: shouldAttachWo ? workOrder.woNumber : undefined,
          workOrderId: shouldAttachWo ? workOrder.woNumber : undefined,
          productCode: shouldAttachWo ? workOrder.productCode : undefined,
          productDescription: shouldAttachWo ? workOrder.productDescription : undefined,
          batch: shouldAttachWo ? workOrder.batchNumber : undefined,
          progress: category.name === 'Work Orders' ? Math.min(100, 10 + eventIndex * 20 + eventTypeIndex * 2) : undefined,
        });
      }
    });
  });

  return events;
}

export const initialTimelineApprovedWorkOrders: ScheduledWorkOrder[] = [
  workOrder('wo-01', 'WO-100245', 'FG-1001', 'line-10', '2026-05-13T07:00', '2026-05-13T11:00', 'Released', 'High', 'Ready'),
  workOrder('wo-02', 'WO-100246', 'FG-2001', 'line-20', '2026-05-13T08:00', '2026-05-13T12:00', 'Planned', 'Medium', 'Ready'),
  workOrder('wo-03', 'WO-100247', 'FG-1002', 'line-10', '2026-05-13T10:30', '2026-05-13T15:00', 'Ready', 'Medium', 'Warning', 1),
  workOrder('wo-04', 'WO-100248', 'FG-3001', 'line-30', '2026-05-13T22:00', '2026-05-14T02:00', 'Running', 'High', 'Ready'),
  workOrder('wo-05', 'WO-100249', 'FG-4001', 'line-40', '2026-05-14T06:00', '2026-05-14T10:00', 'Released', 'Medium', 'Ready'),
  workOrder('wo-06', 'WO-100250', 'FG-5001', 'line-50', '2026-05-14T10:00', '2026-05-14T13:00', 'Planned', 'Low', 'Ready'),
  workOrder('wo-07', 'WO-100251', 'FG-6001', 'line-60', '2026-05-14T09:00', '2026-05-14T12:00', 'Blocked', 'Critical', 'Blocked', 2),
  workOrder('wo-08', 'WO-100252', 'FG-7001', 'line-70', '2026-05-14T07:00', '2026-05-14T13:00', 'Ready', 'High', 'Ready'),
  workOrder('wo-09', 'WO-100253', 'FG-1003', 'line-10', '2026-05-14T14:00', '2026-05-14T18:00', 'Planned', 'Low', 'Ready'),
  workOrder('wo-10', 'WO-100254', 'FG-2002', 'line-20', '2026-05-14T11:00', '2026-05-14T15:00', 'Ready', 'High', 'Warning', 1),
  workOrder('wo-11', 'WO-100255', 'FG-3002', 'line-30', '2026-05-14T03:00', '2026-05-14T07:00', 'Completed', 'Low', 'Ready'),
  workOrder('wo-12', 'WO-100256', 'FG-4002', 'line-40', '2026-05-14T15:00', '2026-05-14T19:00', 'Running', 'High', 'Ready'),
  workOrder('wo-13', 'WO-100257', 'FG-5002', 'line-50', '2026-05-15T06:00', '2026-05-15T11:00', 'Released', 'Critical', 'Ready', 3),
  workOrder('wo-14', 'WO-100258', 'FG-6002', 'line-60', '2026-05-15T12:00', '2026-05-15T17:00', 'Paused', 'Medium', 'Warning', 1),
  workOrder('wo-15', 'WO-100259', 'FG-7002', 'line-70', '2026-05-15T16:00', '2026-05-15T20:00', 'Ready', 'Low', 'Ready'),
  workOrder('wo-16', 'WO-100260', 'FG-1004', 'line-10', '2026-05-15T20:00', '2026-05-16T00:00', 'Planned', 'High', 'Ready'),
  workOrder('wo-17', 'WO-100261', 'FG-2003', 'line-20', '2026-05-16T08:00', '2026-05-16T12:00', 'Running', 'Medium', 'Ready'),
  workOrder('wo-18', 'WO-100262', 'FG-3003', 'line-30', '2026-05-16T12:00', '2026-05-16T16:00', 'Ready', 'Medium', 'Warning', 2),
  workOrder('wo-19', 'WO-100263', 'FG-4003', 'line-40', '2026-05-16T18:00', '2026-05-16T22:00', 'Released', 'High', 'Ready'),
  workOrder('wo-20', 'WO-100264', 'FG-5003', 'line-50', '2026-05-16T21:00', '2026-05-17T01:00', 'Planned', 'Low', 'Ready'),
];

export const initialTimelineAiWorkOrders: ScheduledWorkOrder[] = initialTimelineApprovedWorkOrders.map((item, index) => {
  if (index % 4 === 0) {
    const shiftedStart = new Date(item.plannedStartDateTime);
    shiftedStart.setHours(shiftedStart.getHours() + 1);
    const shiftedEnd = new Date(item.plannedEndDateTime);
    shiftedEnd.setHours(shiftedEnd.getHours() + 1);
    return {...item, plannedStartDateTime: formatIsoDateTime(shiftedStart), plannedEndDateTime: formatIsoDateTime(shiftedEnd)};
  }
  return item;
});

export function createTimelineAiProposal(workOrders: ScheduledWorkOrder[]) {
  return workOrders.map((item, index) => {
    if (index % 5 === 0) {
      const shiftedStart = new Date(item.plannedStartDateTime);
      shiftedStart.setHours(shiftedStart.getHours() + 2);
      const shiftedEnd = new Date(item.plannedEndDateTime);
      shiftedEnd.setHours(shiftedEnd.getHours() + 2);
      return {...item, plannedStartDateTime: formatIsoDateTime(shiftedStart), plannedEndDateTime: formatIsoDateTime(shiftedEnd)};
    }
    return item;
  });
}

export const timelineEvents: TimelineEvent[] = generateLineScheduleMockEvents({
  lines: demoTimelineLines,
  categoryConfig: timelineCategoryConfig,
  startDate: '2026-05-13',
  daysToGenerate: 5,
  eventsPerEventType: 5,
  workOrders: initialTimelineApprovedWorkOrders,
});

export const defaultTimelineDateRange: TimelineDateRange = getDateRangeFromShortcut('SevenDays', TIMELINE_REFERENCE_DATE);
