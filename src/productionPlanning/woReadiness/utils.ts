import type {
  ExceptionStatus,
  LaborReadinessItem,
  ReadinessAuditEvent,
  ReadinessCategory,
  ReadinessStatus,
  ReadinessSummaryCard,
  RecommendedAction,
  ReleaseRecommendation,
  WorkOrder,
  WorkOrderReadinessCheck,
  WorkOrderReadinessException,
  WoReadinessFilters,
} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export function calculateQuantityRemaining(quantityRequired: number, quantityProduced: number) {
  return Math.max(0, quantityRequired - quantityProduced);
}

export function calculateOverallReadinessStatus(checks: WorkOrderReadinessCheck[]): ReadinessStatus {
  if (checks.length === 0) {
    return 'NotChecked';
  }

  const blockedCount = checks.filter((check) => check.status === 'Blocked').length;
  const warningCount = checks.filter((check) => check.status === 'Warning').length;
  const readyCount = checks.filter((check) => check.status === 'Ready').length;
  const notCheckedCount = checks.filter((check) => check.status === 'NotChecked').length;

  if (blockedCount > 0) {
    return 'Blocked';
  }
  if (warningCount > 0) {
    return 'Warning';
  }
  if (readyCount === checks.length) {
    return 'Ready';
  }
  if (notCheckedCount >= Math.ceil(checks.length * 0.6)) {
    return 'NotChecked';
  }
  return readyCount > 0 ? 'Warning' : 'NotChecked';
}

export function calculateReleaseRecommendation(status: ReadinessStatus): ReleaseRecommendation {
  if (status === 'Ready') {
    return 'Ready to Release';
  }
  if (status === 'Warning') {
    return 'Ready with Warnings';
  }
  if (status === 'Blocked') {
    return 'Do Not Release';
  }
  return 'Readiness Not Checked';
}

export function calculateCategorySummary(checks: WorkOrderReadinessCheck[]) {
  const summary = {
    Ready: 0,
    Warning: 0,
    Blocked: 0,
    NotChecked: 0,
  } as Record<ReadinessStatus, number>;

  for (const check of checks) {
    summary[check.status] += 1;
  }

  return summary;
}

export function calculateReadinessSummary(
  workOrders: WorkOrder[],
  checks: WorkOrderReadinessCheck[],
  exceptions: WorkOrderReadinessException[],
) {
  const openExceptions = exceptions.filter((item) => item.status !== 'Resolved');
  const materialIssues = workOrders.filter((item) => item.materialStatus === 'Warning' || item.materialStatus === 'Blocked').length;
  const machineIssues = workOrders.filter((item) => item.machineStatus === 'Warning' || item.machineStatus === 'Blocked').length;
  const laborIssues = workOrders.filter((item) => item.laborStatus === 'Warning' || item.laborStatus === 'Blocked').length;
  const qualityHolds = workOrders.filter((item) => item.qualityStatus === 'Blocked').length;
  const documentationIssues = workOrders.filter((item) => item.documentationStatus === 'Warning' || item.documentationStatus === 'Blocked').length;

  const counts = {
    Ready: 0,
    Warning: 0,
    Blocked: 0,
    NotChecked: 0,
  } as Record<ReadinessStatus, number>;

  for (const workOrder of workOrders) {
    counts[workOrder.readinessStatus] += 1;
  }

  const cards: ReadinessSummaryCard[] = [
    {key: 'total', label: 'Total WOs', count: workOrders.length, helperText: 'Orders in the readiness pool', tone: 'neutral'},
    {key: 'ready', label: 'Ready', count: counts.Ready, helperText: 'Clear to release', tone: 'good'},
    {key: 'warning', label: 'Warnings', count: counts.Warning, helperText: 'Need planner attention', tone: 'warning'},
    {key: 'blocked', label: 'Blocked', count: counts.Blocked, helperText: 'Cannot be released', tone: 'danger'},
    {key: 'notChecked', label: 'Not Checked', count: counts.NotChecked, helperText: 'Readiness not run yet', tone: 'info'},
    {key: 'materialIssues', label: 'Material Issues', count: materialIssues, helperText: 'Shortage or stock mismatch', tone: 'danger'},
    {key: 'machineIssues', label: 'Machine Issues', count: machineIssues, helperText: 'Downtime or changeover risk', tone: 'warning'},
    {key: 'laborIssues', label: 'Labor Issues', count: laborIssues, helperText: 'Crew or skill constraints', tone: 'warning'},
    {key: 'qualityHolds', label: 'Quality Holds', count: qualityHolds, helperText: 'Hold or dependency on QA', tone: 'danger'},
    {key: 'documentationIssues', label: 'Documentation Issues', count: documentationIssues, helperText: 'Missing or under revision', tone: 'warning'},
  ];

  return {
    cards,
    counts,
    openExceptionsCount: openExceptions.length,
    categorySummary: calculateCategorySummary(checks),
  };
}

export function filterWorkOrders(
  workOrders: WorkOrder[],
  filters: WoReadinessFilters,
  exceptions: WorkOrderReadinessException[],
) {
  const search = filters.search.trim().toLowerCase();

  return workOrders.filter((workOrder) => {
    if (filters.line !== 'All' && workOrder.assignedLineName !== filters.line) {
      return false;
    }
    if (filters.readinessStatus !== 'All' && workOrder.readinessStatus !== filters.readinessStatus) {
      return false;
    }
    if (filters.priority !== 'All' && workOrder.priority !== filters.priority) {
      return false;
    }
    if (filters.dueDateFrom && new Date(workOrder.dueDate).getTime() < new Date(filters.dueDateFrom).getTime()) {
      return false;
    }
    if (filters.dueDateTo && new Date(workOrder.dueDate).getTime() > new Date(filters.dueDateTo).getTime()) {
      return false;
    }
    if (filters.showOnlyBlockers && workOrder.readinessStatus !== 'Blocked') {
      return false;
    }
    if (filters.showOnlyWarnings && workOrder.readinessStatus !== 'Warning') {
      return false;
    }
    if (filters.issueCategory !== 'All') {
      const hasCategoryIssue = exceptions.some(
        (item) =>
          item.workOrderId === workOrder.id &&
          item.status !== 'Resolved' &&
          item.category === filters.issueCategory,
      );
      if (!hasCategoryIssue) {
        return false;
      }
    }
    if (!search) {
      return true;
    }
    return [
      workOrder.woNumber,
      workOrder.batchNumber,
      workOrder.productCode,
      workOrder.productDescription,
    ].some((value) => value.toLowerCase().includes(search));
  });
}

export function sortWorkOrdersByReadinessRisk(workOrders: WorkOrder[]) {
  const priorityScore = {Critical: 4, High: 3, Medium: 2, Low: 1};
  const readinessScore = {Blocked: 4, Warning: 3, NotChecked: 2, Ready: 1};
  return [...workOrders].sort((a, b) => {
    const scoreA = priorityScore[a.priority] * 100 + readinessScore[a.readinessStatus] * 25 + a.exceptionCount;
    const scoreB = priorityScore[b.priority] * 100 + readinessScore[b.readinessStatus] * 25 + b.exceptionCount;
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
}

export function buildReadinessExceptions(input: {
  workOrders: WorkOrder[];
  checks: WorkOrderReadinessCheck[];
  existingExceptions?: WorkOrderReadinessException[];
}) {
  if (input.existingExceptions && input.existingExceptions.length > 0) {
    return input.existingExceptions;
  }

  return input.checks
    .filter((check) => check.status === 'Warning' || check.status === 'Blocked')
    .map((check) => ({
      id: `exc-${check.id}`,
      workOrderId: check.workOrderId,
      category: check.category,
      severity: check.status === 'Blocked' ? 'Blocker' : 'Warning',
      reason: check.description,
      suggestedAction: check.requiredAction,
      owner: check.owner,
      ageMinutes: 30,
      status: 'Open' as ExceptionStatus,
    }));
}

export function buildRecommendedActions(input: {
  workOrder: WorkOrder;
  checks: WorkOrderReadinessCheck[];
  exceptions: WorkOrderReadinessException[];
}) {
  const actions: RecommendedAction[] = [];

  for (const exception of input.exceptions.filter((item) => item.workOrderId === input.workOrder.id && item.status !== 'Resolved')) {
    const category =
      exception.category === 'Material'
        ? exception.reason.toLowerCase().includes('physically')
          ? 'ConfirmPhysicalStock'
          : 'ExpediteMaterial'
        : exception.category === 'Machine'
          ? 'MoveToAlternativeLine'
          : exception.category === 'Labor'
            ? 'AdjustLaborPlan'
            : exception.category === 'Quality'
              ? 'RequestQualityRelease'
              : exception.category === 'Documentation'
                ? 'UpdateDocumentation'
                : exception.category === 'WarehouseStaging'
                  ? 'StageMaterials'
                  : exception.category === 'Schedule'
                    ? 'ReviewSchedule'
                    : 'HoldWorkOrder';

    actions.push({
      id: `action-${exception.id}`,
      workOrderId: input.workOrder.id,
      title: exception.suggestedAction,
      description: exception.reason,
      category,
      priority: exception.severity === 'Blocker' ? 'Critical' : exception.severity === 'Warning' ? 'High' : 'Medium',
      effort: exception.severity === 'Blocker' ? 'High' : 'Medium',
      expectedImpact: `Reduce ${exception.category.toLowerCase()} release risk for ${input.workOrder.woNumber}.`,
      status: 'Open',
    });
  }

  if (input.workOrder.readinessStatus === 'Ready') {
    actions.push({
      id: `action-release-${input.workOrder.id}`,
      workOrderId: input.workOrder.id,
      title: 'Proceed to release',
      description: 'All readiness checks are clear for this work order.',
      category: 'ProceedToRelease',
      priority: 'Medium',
      effort: 'Low',
      expectedImpact: 'Moves the order into the release decision flow.',
      status: 'Open',
    });
  }

  return actions;
}

export function createReadinessAuditEvent(input: {
  workOrderId: string;
  timestamp?: string;
  user: string;
  eventType: string;
  previousValue: string;
  newValue: string;
  comment: string;
}): ReadinessAuditEvent {
  return {
    id: `audit-${Math.random().toString(36).slice(2, 10)}`,
    workOrderId: input.workOrderId,
    timestamp: input.timestamp ?? new Date().toISOString(),
    user: input.user,
    eventType: input.eventType,
    previousValue: input.previousValue,
    newValue: input.newValue,
    comment: input.comment,
  };
}

export function calculateLaborCapacitySupportedPercent(item: LaborReadinessItem) {
  if (item.requiredCrew <= 0 || item.requiredQualifiedOperators <= 0) {
    return 0;
  }
  const crewCoverage = (item.availableCrew / item.requiredCrew) * 100;
  const skillCoverage = (item.availableQualifiedOperators / item.requiredQualifiedOperators) * 100;
  return Math.max(0, Math.min(100, Math.round(Math.min(crewCoverage, skillCoverage))));
}

export function formatDateTime(value: string | null) {
  if (!value) {
    return 'Not checked';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatAgeMinutes(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  if (minutes < 24 * 60) {
    return `${Math.round(minutes / 60)} h`;
  }
  return `${Math.round(minutes / (24 * 60))} d`;
}

export function getMainIssueText(workOrder: WorkOrder, exceptions: WorkOrderReadinessException[]) {
  const topException = exceptions.find((item) => item.workOrderId === workOrder.id && item.status !== 'Resolved');
  if (topException) {
    return topException.reason;
  }
  if (workOrder.readinessStatus === 'Ready') {
    return 'No active blockers or warnings';
  }
  if (workOrder.readinessStatus === 'NotChecked') {
    return 'Readiness checks have not been run';
  }
  return 'Planner review required';
}

export function hydrateWorkOrders(
  workOrders: WorkOrder[],
  checks: WorkOrderReadinessCheck[],
  exceptions: WorkOrderReadinessException[],
) {
  return workOrders.map((workOrder) => {
    const workOrderChecks = checks.filter((check) => check.workOrderId === workOrder.id);
    const workOrderExceptions = exceptions.filter((item) => item.workOrderId === workOrder.id && item.status !== 'Resolved');
    const mapStatus = (category: ReadinessCategory) =>
      workOrderChecks.find((check) => check.category === category)?.status ?? 'NotChecked';

    return {
      ...workOrder,
      quantityRemaining: calculateQuantityRemaining(workOrder.quantityRequired, workOrder.quantityProduced),
      readinessStatus: calculateOverallReadinessStatus(workOrderChecks),
      materialStatus: mapStatus('Material'),
      machineStatus: mapStatus('Machine'),
      laborStatus: mapStatus('Labor'),
      qualityStatus: mapStatus('Quality'),
      documentationStatus: mapStatus('Documentation'),
      toolingStatus: mapStatus('Tooling'),
      warehouseStatus: mapStatus('WarehouseStaging'),
      scheduleStatus: mapStatus('Schedule'),
      exceptionCount: workOrderExceptions.length,
      lastCheckedAt: workOrderChecks.some((item) => item.lastCheckedAt) ? workOrderChecks.reduce<string | null>((latest, item) => {
        if (!item.lastCheckedAt) {
          return latest;
        }
        if (!latest) {
          return item.lastCheckedAt;
        }
        return new Date(item.lastCheckedAt).getTime() > new Date(latest).getTime() ? item.lastCheckedAt : latest;
      }, null) : null,
    };
  });
}

export function resolveExceptionImpact(
  workOrders: WorkOrder[],
  checks: WorkOrderReadinessCheck[],
  exceptions: WorkOrderReadinessException[],
) {
  return hydrateWorkOrders(workOrders, checks, exceptions);
}

export function isWithinNextDays(date: string, now: string, days: number) {
  const diff = new Date(date).getTime() - new Date(now).getTime();
  return diff <= days * DAY_MS && diff >= 0;
}
