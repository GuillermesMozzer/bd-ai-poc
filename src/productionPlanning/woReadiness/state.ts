import {createWoReadinessDemoBundle} from './mocks';
import type {
  RecommendedActionStatus,
  WoReadinessFilters,
  WoReadinessState,
} from './types';
import {
  buildRecommendedActions,
  calculateOverallReadinessStatus,
  createReadinessAuditEvent,
  hydrateWorkOrders,
} from './utils';

export const defaultWoReadinessFilters: WoReadinessFilters = {
  line: 'All',
  readinessStatus: 'All',
  priority: 'All',
  search: '',
  dueDateFrom: '',
  dueDateTo: '',
  issueCategory: 'All',
  showOnlyBlockers: false,
  showOnlyWarnings: false,
};

export function createInitialWoReadinessState(): WoReadinessState {
  return {
    ...createWoReadinessDemoBundle(),
    filters: defaultWoReadinessFilters,
    activeDetailTab: 'Overview',
    releaseDialogOpen: false,
    commentDialogOpen: false,
  };
}

function refreshState(state: WoReadinessState, overrides?: Partial<WoReadinessState>): WoReadinessState {
  const next = {
    ...state,
    ...overrides,
  };

  const workOrders = hydrateWorkOrders(next.workOrders, next.readinessChecks, next.exceptions);
  const recommendedActions = workOrders.flatMap((workOrder) =>
    buildRecommendedActions({
      workOrder,
      checks: next.readinessChecks.filter((item) => item.workOrderId === workOrder.id),
      exceptions: next.exceptions,
    }),
  );

  return {
    ...next,
    workOrders,
    recommendedActions,
  };
}

export function selectWorkOrder(state: WoReadinessState, workOrderId: string, user = 'Planner User') {
  const auditEvent = createReadinessAuditEvent({
    workOrderId,
    timestamp: state.referenceNow,
    user,
    eventType: 'WorkOrderSelected',
    previousValue: state.selectedWorkOrderId,
    newValue: workOrderId,
    comment: `Selected ${workOrderId} locally.`,
  });

  return {
    ...state,
    selectedWorkOrderId: workOrderId,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function setFilters(state: WoReadinessState, filters: Partial<WoReadinessFilters>) {
  return {
    ...state,
    filters: {
      ...state.filters,
      ...filters,
    },
  };
}

export function resetFilters(state: WoReadinessState) {
  return {
    ...state,
    filters: defaultWoReadinessFilters,
  };
}

export function setActiveDetailTab(state: WoReadinessState, activeDetailTab: WoReadinessState['activeDetailTab']) {
  return {
    ...state,
    activeDetailTab,
  };
}

export function runSelectedReadinessCheck(state: WoReadinessState, user = 'Planner User') {
  const readinessChecks = state.readinessChecks.map((check) =>
    check.workOrderId === state.selectedWorkOrderId
      ? {
          ...check,
          lastCheckedAt: state.referenceNow,
        }
      : check,
  );

  const selectedChecks = readinessChecks.filter((check) => check.workOrderId === state.selectedWorkOrderId);
  const nextStatus = calculateOverallReadinessStatus(selectedChecks);

  const workOrders = state.workOrders.map((workOrder) =>
    workOrder.id === state.selectedWorkOrderId
      ? {
          ...workOrder,
          readinessStatus: nextStatus,
          lastCheckedAt: state.referenceNow,
        }
      : workOrder,
  );

  const auditEvent = createReadinessAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    timestamp: state.referenceNow,
    user,
    eventType: 'ReadinessCheckRun',
    previousValue: nextStatus,
    newValue: nextStatus,
    comment: 'Local readiness check recalculated.',
  });

  return refreshState(state, {
    workOrders,
    readinessChecks,
    auditEvents: [auditEvent, ...state.auditEvents],
  });
}

export function runAllReadinessChecks(state: WoReadinessState, user = 'Planner User') {
  const readinessChecks = state.readinessChecks.map((check) => ({
    ...check,
    lastCheckedAt: state.referenceNow,
  }));

  const auditEvent = createReadinessAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    timestamp: state.referenceNow,
    user,
    eventType: 'RunAllChecks',
    previousValue: 'Pool',
    newValue: 'Pool',
    comment: 'All demo work orders were recalculated locally.',
  });

  return refreshState(state, {
    readinessChecks,
    auditEvents: [auditEvent, ...state.auditEvents],
  });
}

export function acknowledgeWarnings(state: WoReadinessState, user = 'Planner User') {
  const exceptions = state.exceptions.map((item) =>
    item.workOrderId === state.selectedWorkOrderId && item.severity === 'Warning' && item.status === 'Open'
      ? {
          ...item,
          status: 'Acknowledged' as const,
        }
      : item,
  );

  const auditEvent = createReadinessAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    timestamp: state.referenceNow,
    user,
    eventType: 'WarningsAcknowledged',
    previousValue: 'Open',
    newValue: 'Acknowledged',
    comment: 'Warning exceptions acknowledged locally.',
  });

  return refreshState(state, {
    exceptions,
    auditEvents: [auditEvent, ...state.auditEvents],
  });
}

export function resolveException(state: WoReadinessState, exceptionId: string, user = 'Planner User') {
  const target = state.exceptions.find((item) => item.id === exceptionId);
  if (!target) {
    return state;
  }

  const exceptions = state.exceptions.map((item) =>
    item.id === exceptionId
      ? {
          ...item,
          status: 'Resolved' as const,
        }
      : item,
  );

  const readinessChecks = state.readinessChecks.map((check) =>
    check.workOrderId === target.workOrderId &&
    check.category === target.category &&
    (check.status === 'Blocked' || check.status === 'Warning')
      ? {
          ...check,
          status: 'Ready' as const,
          description: `${check.category} issue resolved locally.`,
          details: `${check.category} issue resolved locally.`,
          requiredAction: 'No action required',
          lastCheckedAt: state.referenceNow,
        }
      : check,
  );

  const auditEvent = createReadinessAuditEvent({
    workOrderId: target.workOrderId,
    timestamp: state.referenceNow,
    user,
    eventType: 'ExceptionResolved',
    previousValue: target.status,
    newValue: 'Resolved',
    comment: target.reason,
  });

  return refreshState(state, {
    exceptions,
    readinessChecks,
    auditEvents: [auditEvent, ...state.auditEvents],
  });
}

export function acknowledgeException(state: WoReadinessState, exceptionId: string, user = 'Planner User') {
  const target = state.exceptions.find((item) => item.id === exceptionId);
  if (!target) {
    return state;
  }

  const exceptions = state.exceptions.map((item) =>
    item.id === exceptionId
      ? {
          ...item,
          status: 'Acknowledged' as const,
        }
      : item,
  );

  const auditEvent = createReadinessAuditEvent({
    workOrderId: target.workOrderId,
    timestamp: state.referenceNow,
    user,
    eventType: 'ExceptionAcknowledged',
    previousValue: target.status,
    newValue: 'Acknowledged',
    comment: target.reason,
  });

  return refreshState(state, {
    exceptions,
    auditEvents: [auditEvent, ...state.auditEvents],
  });
}

export function addCommentToSelectedWorkOrder(state: WoReadinessState, comment: string, user = 'Planner User') {
  const workOrders = state.workOrders.map((workOrder) =>
    workOrder.id === state.selectedWorkOrderId
      ? {
          ...workOrder,
          plannerComment: comment,
        }
      : workOrder,
  );

  const auditEvent = createReadinessAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    timestamp: state.referenceNow,
    user,
    eventType: 'CommentAdded',
    previousValue: 'Planner comment',
    newValue: comment,
    comment,
  });

  return refreshState(state, {
    workOrders,
    auditEvents: [auditEvent, ...state.auditEvents],
  });
}

export function holdSelectedWorkOrder(state: WoReadinessState, user = 'Planner User') {
  const previousStatus = state.workOrders.find((item) => item.id === state.selectedWorkOrderId)?.status ?? 'Planned';
  const workOrders = state.workOrders.map((workOrder) =>
    workOrder.id === state.selectedWorkOrderId
      ? {
          ...workOrder,
          status: 'Blocked' as const,
        }
      : workOrder,
  );

  const auditEvent = createReadinessAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    timestamp: state.referenceNow,
    user,
    eventType: 'HoldWorkOrder',
    previousValue: previousStatus,
    newValue: 'Blocked',
    comment: 'WO held locally from readiness page.',
  });

  return refreshState(state, {
    workOrders,
    auditEvents: [auditEvent, ...state.auditEvents],
  });
}

export function updateRecommendedActionStatus(
  state: WoReadinessState,
  actionId: string,
  status: RecommendedActionStatus,
  user = 'Planner User',
) {
  const target = state.recommendedActions.find((item) => item.id === actionId);
  if (!target) {
    return state;
  }

  const recommendedActions = state.recommendedActions.map((item) =>
    item.id === actionId
      ? {
          ...item,
          status,
        }
      : item,
  );

  const auditEvent = createReadinessAuditEvent({
    workOrderId: target.workOrderId,
    timestamp: state.referenceNow,
    user,
    eventType: 'RecommendedActionUpdated',
    previousValue: target.status,
    newValue: status,
    comment: target.title,
  });

  return {
    ...state,
    recommendedActions,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function openReleaseDialog(state: WoReadinessState) {
  return {
    ...state,
    releaseDialogOpen: true,
  };
}

export function closeReleaseDialog(state: WoReadinessState) {
  return {
    ...state,
    releaseDialogOpen: false,
  };
}

export function openCommentDialog(state: WoReadinessState) {
  return {
    ...state,
    commentDialogOpen: true,
  };
}

export function closeCommentDialog(state: WoReadinessState) {
  return {
    ...state,
    commentDialogOpen: false,
  };
}
