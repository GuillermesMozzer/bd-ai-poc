import type {
  CreateWorkOrderInput,
  WorkOrder,
  WorkOrderAuditEvent,
  WorkOrderDueDateCategory,
  WorkOrderException,
  WorkOrderExceptionSummary,
  WorkOrderExceptionType,
  WorkOrderReadinessCheck,
  WorkOrderReadinessStatus,
  WorkOrdersFilters,
  WorkOrdersSummary,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function calculateWorkOrderProgress(quantityRequired: number, quantityProduced: number) {
  if (quantityRequired <= 0) {
    return 0;
  }
  return Number(Math.min(100, (quantityProduced / quantityRequired) * 100).toFixed(1));
}

export function calculateQuantityRemaining(quantityRequired: number, quantityProduced: number) {
  return Math.max(0, quantityRequired - quantityProduced);
}

export function deriveScheduleStatus(
  dueDate: string,
  status: WorkOrder['status'],
  now: string | Date,
): WorkOrder['scheduleStatus'] {
  if (status === 'Completed' || status === 'Closed') {
    return 'OnTime';
  }

  const due = new Date(dueDate).getTime();
  const current = typeof now === 'string' ? new Date(now).getTime() : now.getTime();

  if (due < current) {
    return 'Late';
  }
  if (due - current <= DAY_MS * 2) {
    return 'AtRisk';
  }
  return 'OnTime';
}

export function deriveDueDateCategory(dueDate: string, now: string | Date): WorkOrderDueDateCategory {
  const due = new Date(dueDate).getTime();
  const currentDate = typeof now === 'string' ? new Date(now) : now;
  const current = currentDate.getTime();
  const next24h = current + DAY_MS;
  const next48h = current + DAY_MS * 2;
  const currentDayKey = currentDate.toDateString();

  if (due < current) {
    return 'Late';
  }
  if (new Date(dueDate).toDateString() === currentDayKey) {
    return 'Due Today';
  }
  if (due <= next24h) {
    return 'Due in 24h';
  }
  if (due <= next48h) {
    return 'Due in 48h';
  }
  return 'Future';
}

export function deriveReadinessStatusFromChecks(
  checks: WorkOrderReadinessCheck[],
): WorkOrderReadinessStatus {
  if (checks.some((check) => check.status === 'Blocked')) {
    return 'Blocked';
  }
  if (checks.some((check) => check.status === 'Warning')) {
    return 'Warning';
  }
  return 'Ready';
}

export function calculateWorkOrderSummary(
  workOrders: WorkOrder[],
  exceptions: WorkOrderException[],
  now: string | Date,
): WorkOrdersSummary {
  const byStatus = {
    Planned: 0,
    Ready: 0,
    Released: 0,
    Running: 0,
    Paused: 0,
    Interrupted: 0,
    Completed: 0,
    Blocked: 0,
    Closed: 0,
    Cancelled: 0,
  } as WorkOrdersSummary['byStatus'];

  const byPriority = {
    Critical: 0,
    High: 0,
    Medium: 0,
    Low: 0,
  } as WorkOrdersSummary['byPriority'];

  const byDueDateCategory = {
    Late: 0,
    'Due Today': 0,
    'Due in 24h': 0,
    'Due in 48h': 0,
    Future: 0,
  } as WorkOrdersSummary['byDueDateCategory'];

  const readinessCounts = {
    Ready: 0,
    Warning: 0,
    Blocked: 0,
  } as WorkOrdersSummary['readinessCounts'];

  for (const workOrder of workOrders) {
    byStatus[workOrder.status] += 1;
    byPriority[workOrder.priority] += 1;
    byDueDateCategory[deriveDueDateCategory(workOrder.dueDate, now)] += 1;
    readinessCounts[workOrder.readinessStatus] += 1;
  }

  const openExceptions = exceptions.filter((exception) => exception.status !== 'Resolved').length;

  return {
    cards: [
      {key: 'total', label: 'Total Work Orders', value: workOrders.length, helperText: 'All statuses', tone: 'neutral'},
      {key: 'ready', label: 'Ready', value: readinessCounts.Ready, helperText: 'Ready to release', tone: 'good'},
      {key: 'warning', label: 'Warning', value: readinessCounts.Warning, helperText: 'Proceed with caution', tone: 'warning'},
      {key: 'blocked', label: 'Blocked', value: readinessCounts.Blocked, helperText: 'Require attention', tone: 'danger'},
      {key: 'released', label: 'Released', value: byStatus.Released, helperText: 'Sent to shopfloor', tone: 'info'},
      {key: 'running', label: 'Running', value: byStatus.Running, helperText: 'In execution', tone: 'info'},
      {key: 'late', label: 'Late', value: byDueDateCategory.Late, helperText: 'Past due date', tone: 'danger'},
      {key: 'due24h', label: 'Due in 24h', value: byDueDateCategory['Due in 24h'], helperText: 'Needs focus now', tone: 'warning'},
      {key: 'exceptions', label: 'Exceptions', value: openExceptions, helperText: 'Active issues', tone: 'danger'},
    ],
    byStatus,
    byPriority,
    byDueDateCategory,
    readinessCounts,
    openExceptions,
  };
}

export function buildWorkOrderExceptionsSummary(
  exceptions: WorkOrderException[],
): WorkOrderExceptionSummary {
  const byType = {
    MaterialShortage: 0,
    MaterialBlocked: 0,
    MachineUnavailable: 0,
    LaborUnavailable: 0,
    QualityHold: 0,
    MissingDocumentation: 0,
    ScheduleConflict: 0,
    LateOrder: 0,
    QuantityDiscrepancy: 0,
    ScrapOrNonconformance: 0,
    WarehouseStagingIssue: 0,
    FrozenPeriodChange: 0,
    ExecutionInterruption: 0,
    ChangeoverDelay: 0,
  } as Record<WorkOrderExceptionType, number>;

  const bySeverity = {
    Info: 0,
    Warning: 0,
    Blocker: 0,
  } as WorkOrderExceptionSummary['bySeverity'];

  for (const exception of exceptions) {
    if (exception.status === 'Resolved') {
      continue;
    }
    byType[exception.type] += 1;
    bySeverity[exception.severity] += 1;
  }

  return {byType, bySeverity};
}

export function filterWorkOrders(
  workOrders: WorkOrder[],
  filters: WorkOrdersFilters,
  exceptions: WorkOrderException[],
  now: string | Date,
) {
  const searchTerm = filters.search.trim().toLowerCase();

  return workOrders.filter((workOrder) => {
    if (filters.line !== 'All' && workOrder.assignedLineName !== filters.line) {
      return false;
    }
    if (filters.status !== 'All' && workOrder.status !== filters.status) {
      return false;
    }
    if (filters.readiness !== 'All' && workOrder.readinessStatus !== filters.readiness) {
      return false;
    }
    if (filters.priority !== 'All' && workOrder.priority !== filters.priority) {
      return false;
    }
    if (filters.dueDateCategory !== 'All' && deriveDueDateCategory(workOrder.dueDate, now) !== filters.dueDateCategory) {
      return false;
    }
    if (filters.exceptionType !== 'All') {
      const hasMatchingException = exceptions.some(
        (exception) =>
          exception.workOrderId === workOrder.id &&
          exception.status !== 'Resolved' &&
          exception.type === filters.exceptionType,
      );
      if (!hasMatchingException) {
        return false;
      }
    }
    if (!searchTerm) {
      return true;
    }
    return [
      workOrder.productCode,
      workOrder.productDescription,
      workOrder.woNumber,
      workOrder.batchNumber,
    ].some((value) => value.toLowerCase().includes(searchTerm));
  });
}

export function sortWorkOrdersByRisk(workOrders: WorkOrder[]) {
  const priorityScore = {Critical: 4, High: 3, Medium: 2, Low: 1};
  const readinessScore = {Blocked: 3, Warning: 2, Ready: 1};
  const scheduleScore = {Late: 3, AtRisk: 2, OnTime: 1};
  const statusScore = {
    Blocked: 4,
    Interrupted: 3,
    Paused: 3,
    Running: 2,
    Released: 2,
    Ready: 2,
    Planned: 1,
    Completed: 0,
    Closed: 0,
    Cancelled: 0,
  } as Record<WorkOrder['status'], number>;

  return [...workOrders].sort((a, b) => {
    const scoreA =
      priorityScore[a.priority] * 100 +
      scheduleScore[a.scheduleStatus] * 25 +
      readinessScore[a.readinessStatus] * 15 +
      statusScore[a.status] * 10 +
      a.exceptionCount;
    const scoreB =
      priorityScore[b.priority] * 100 +
      scheduleScore[b.scheduleStatus] * 25 +
      readinessScore[b.readinessStatus] * 15 +
      statusScore[b.status] * 10 +
      b.exceptionCount;

    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export function createWorkOrderAuditEvent(input: {
  workOrderId: string;
  user: string;
  eventType: string;
  previousValue: string;
  newValue: string;
  comment: string;
  timestamp?: string;
}): WorkOrderAuditEvent {
  return {
    id: `wo-audit-${Math.random().toString(36).slice(2, 10)}`,
    workOrderId: input.workOrderId,
    timestamp: input.timestamp ?? new Date().toISOString(),
    user: input.user,
    eventType: input.eventType,
    previousValue: input.previousValue,
    newValue: input.newValue,
    comment: input.comment,
  };
}

export function hydrateWorkOrders(
  workOrders: WorkOrder[],
  readinessChecks: WorkOrderReadinessCheck[],
  exceptions: WorkOrderException[],
  now: string | Date,
) {
  return workOrders.map((workOrder) => {
    const workOrderChecks = readinessChecks.filter((check) => check.workOrderId === workOrder.id);
    const openExceptions = exceptions.filter(
      (exception) => exception.workOrderId === workOrder.id && exception.status !== 'Resolved',
    );

    return {
      ...workOrder,
      quantityRemaining: calculateQuantityRemaining(workOrder.quantityRequired, workOrder.quantityProduced),
      progressPercent: calculateWorkOrderProgress(workOrder.quantityRequired, workOrder.quantityProduced),
      readinessStatus: deriveReadinessStatusFromChecks(workOrderChecks),
      scheduleStatus: deriveScheduleStatus(workOrder.dueDate, workOrder.status, now),
      exceptionCount: openExceptions.length,
    };
  });
}

export function buildLocalWorkOrderFromInput(
  input: CreateWorkOrderInput,
  referenceNow: string,
): WorkOrder {
  return {
    id: input.woNumber.toLowerCase(),
    woNumber: input.woNumber,
    batchNumber: input.batchNumber,
    productCode: input.productCode,
    productDescription: input.productDescription,
    productFamily: input.productFamily,
    quantityRequired: input.quantityRequired,
    quantityProduced: 0,
    quantityRemaining: input.quantityRequired,
    uom: 'PCS',
    dueDate: input.dueDate,
    plannedStartDate: input.plannedStartDate,
    plannedEndDate: input.plannedEndDate,
    actualStartDate: null,
    actualEndDate: null,
    assignedLineId: input.assignedLineId,
    assignedLineName: input.assignedLineName,
    shift: input.shift,
    crew: input.crew,
    priority: input.priority,
    status: 'Planned',
    readinessStatus: 'Warning',
    materialStatus: 'Available',
    qualityStatus: 'InspectionRequired',
    scheduleStatus: deriveScheduleStatus(input.dueDate, 'Planned', referenceNow),
    exceptionCount: 0,
    owner: input.owner,
    lastUpdatedAt: referenceNow,
    plannerComment: 'Created locally from the Work Orders page.',
    progressPercent: 0,
  };
}

export function formatRelativeMinutes(timestamp: string, now: string | Date) {
  const current = typeof now === 'string' ? new Date(now).getTime() : now.getTime();
  const value = Math.max(1, Math.round((current - new Date(timestamp).getTime()) / 60000));

  if (value < 60) {
    return `${value} min ago`;
  }
  const hours = Math.round(value / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}
