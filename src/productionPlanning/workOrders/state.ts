import {createWorkOrdersDemoBundle} from './mocks';
import type {
  CreateWorkOrderInput,
  RecommendedAction,
  WorkOrder,
  WorkOrderException,
  WorkOrderExceptionStatus,
  WorkOrderReadinessCheck,
  WorkOrderReadinessCheckStatus,
  WorkOrderReleaseMode,
  WorkOrdersFilters,
  WorkOrdersState,
} from './types';
import {
  buildLocalWorkOrderFromInput,
  calculateReleaseRecommendation,
  createWorkOrderAuditEvent,
  deriveReadinessStatusFromChecks,
  hydrateWorkOrders,
} from './utils';

export const defaultWorkOrdersFilters: WorkOrdersFilters = {
  line: 'All',
  status: 'All',
  readiness: 'All',
  priority: 'All',
  dueDateCategory: 'All',
  search: '',
  exceptionType: 'All',
};

export function createInitialWorkOrdersState(): WorkOrdersState {
  const bundle = createWorkOrdersDemoBundle();
  return {
    workOrders: bundle.workOrders,
    selectedWorkOrderId: bundle.selectedWorkOrderId,
    selectedDetailTab: 'Overview',
    activeMainTab: 'Order Pool',
    filters: defaultWorkOrdersFilters,
    exceptions: bundle.exceptions,
    readinessChecks: bundle.readinessChecks,
    operations: bundle.operations,
    auditEvents: bundle.auditEvents,
    materials: bundle.materials,
    materialReadinessItems: bundle.materialReadinessItems,
    qualityDocs: bundle.qualityDocs,
    releaseImpacts: bundle.releaseImpacts,
    impactedOrders: bundle.impactedOrders,
    recommendedActions: bundle.recommendedActions,
    productionLines: bundle.productionLines,
    siteName: bundle.siteName,
    siteLabel: bundle.siteLabel,
    referenceNow: bundle.referenceNow,
    lastRefreshAt: bundle.referenceNow,
    summaryOffsets: bundle.summaryOffsets,
  };
}

function refreshDerivedState(
  state: WorkOrdersState,
  workOrders: WorkOrder[],
  exceptions: WorkOrderException[],
  readinessChecks: WorkOrderReadinessCheck[],
) {
  return hydrateWorkOrders(workOrders, readinessChecks, exceptions, state.referenceNow);
}

export function selectWorkOrder(state: WorkOrdersState, workOrderId: string): WorkOrdersState {
  return {...state, selectedWorkOrderId: workOrderId};
}

export function setMainTab(state: WorkOrdersState, activeMainTab: WorkOrdersState['activeMainTab']): WorkOrdersState {
  const nextDetailTab =
    activeMainTab === 'WO Readiness'
      ? 'Readiness'
      : activeMainTab === 'WO Release'
        ? 'Release Impact'
        : state.selectedDetailTab;
  return {...state, activeMainTab, selectedDetailTab: nextDetailTab};
}

export function setDetailTab(state: WorkOrdersState, selectedDetailTab: WorkOrdersState['selectedDetailTab']): WorkOrdersState {
  return {...state, selectedDetailTab};
}

export function setFilters(state: WorkOrdersState, filters: Partial<WorkOrdersFilters>): WorkOrdersState {
  return {...state, filters: {...state.filters, ...filters}};
}

export function resetFilters(state: WorkOrdersState): WorkOrdersState {
  return {...state, filters: defaultWorkOrdersFilters};
}

export function refreshPage(state: WorkOrdersState): WorkOrdersState {
  return {...state, lastRefreshAt: state.referenceNow};
}

export function addCommentToSelectedWorkOrder(state: WorkOrdersState, comment: string, user = 'Danilo Brooks'): WorkOrdersState {
  const workOrders = state.workOrders.map((workOrder) =>
    workOrder.id === state.selectedWorkOrderId
      ? {
          ...workOrder,
          plannerComment: comment,
          lastUpdatedAt: state.referenceNow,
        }
      : workOrder,
  );
  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    user,
    eventType: 'PlannerCommentAdded',
    previousValue: 'Previous comment',
    newValue: comment,
    comment,
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    workOrders,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function pauseSelectedWorkOrder(state: WorkOrdersState, user = 'Danilo Brooks'): WorkOrdersState {
  const previous = state.workOrders.find((workOrder) => workOrder.id === state.selectedWorkOrderId);
  if (!previous) {
    return state;
  }

  const workOrders = refreshDerivedState(
    state,
    state.workOrders.map((workOrder) =>
      workOrder.id === state.selectedWorkOrderId
        ? {
            ...workOrder,
            status: 'Paused',
            lastUpdatedAt: state.referenceNow,
          }
        : workOrder,
    ),
    state.exceptions,
    state.readinessChecks,
  );

  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    user,
    eventType: 'WorkOrderPaused',
    previousValue: previous.status,
    newValue: 'Paused',
    comment: 'Paused locally from quick actions.',
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    workOrders,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function holdSelectedWorkOrder(state: WorkOrdersState, user = 'Danilo Brooks'): WorkOrdersState {
  const previous = state.workOrders.find((workOrder) => workOrder.id === state.selectedWorkOrderId);
  if (!previous) {
    return state;
  }

  const workOrders = refreshDerivedState(
    state,
    state.workOrders.map((workOrder) =>
      workOrder.id === state.selectedWorkOrderId
        ? {
            ...workOrder,
            status: 'Blocked',
            lastUpdatedAt: state.referenceNow,
          }
        : workOrder,
    ),
    state.exceptions,
    state.readinessChecks,
  );

  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    user,
    eventType: 'WorkOrderHeld',
    previousValue: previous.status,
    newValue: 'Blocked',
    comment: 'Held locally from quick actions.',
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    workOrders,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function changeSelectedWorkOrderPriority(
  state: WorkOrdersState,
  priority: WorkOrder['priority'],
  user = 'Danilo Brooks',
): WorkOrdersState {
  const previous = state.workOrders.find((workOrder) => workOrder.id === state.selectedWorkOrderId);
  if (!previous) {
    return state;
  }

  const workOrders = state.workOrders.map((workOrder) =>
    workOrder.id === state.selectedWorkOrderId
      ? {
          ...workOrder,
          priority,
          lastUpdatedAt: state.referenceNow,
        }
      : workOrder,
  );

  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    user,
    eventType: 'PriorityChanged',
    previousValue: previous.priority,
    newValue: priority,
    comment: 'Priority updated locally.',
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    workOrders,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function reassignSelectedWorkOrderLine(
  state: WorkOrdersState,
  lineId: string,
  user = 'Danilo Brooks',
): WorkOrdersState {
  const selectedLine = state.productionLines.find((line) => line.id === lineId);
  const previous = state.workOrders.find((workOrder) => workOrder.id === state.selectedWorkOrderId);
  if (!selectedLine || !previous) {
    return state;
  }

  const workOrders = state.workOrders.map((workOrder) =>
    workOrder.id === state.selectedWorkOrderId
      ? {
          ...workOrder,
          assignedLineId: selectedLine.id,
          assignedLineName: selectedLine.name,
          lastUpdatedAt: state.referenceNow,
        }
      : workOrder,
  );

  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    user,
    eventType: 'LineReassigned',
    previousValue: previous.assignedLineName,
    newValue: selectedLine.name,
    comment: 'Line reassigned locally.',
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    workOrders,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function acknowledgeException(
  state: WorkOrdersState,
  exceptionId: string,
  user = 'Danilo Brooks',
): WorkOrdersState {
  const target = state.exceptions.find((exception) => exception.id === exceptionId);
  if (!target) {
    return state;
  }

  const exceptions = state.exceptions.map((exception) =>
    exception.id === exceptionId
      ? {
          ...exception,
          status: 'Acknowledged' as WorkOrderExceptionStatus,
        }
      : exception,
  );

  const workOrders = refreshDerivedState(state, state.workOrders, exceptions, state.readinessChecks);
  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: target.workOrderId,
    user,
    eventType: 'ExceptionAcknowledged',
    previousValue: target.status,
    newValue: 'Acknowledged',
    comment: 'Exception acknowledged locally.',
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    exceptions,
    workOrders,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function resolveException(
  state: WorkOrdersState,
  exceptionId: string,
  user = 'Danilo Brooks',
): WorkOrdersState {
  const target = state.exceptions.find((exception) => exception.id === exceptionId);
  if (!target) {
    return state;
  }

  const exceptions = state.exceptions.map((exception) =>
    exception.id === exceptionId
      ? {
          ...exception,
          status: 'Resolved' as WorkOrderExceptionStatus,
        }
      : exception,
  );

  const workOrders = refreshDerivedState(state, state.workOrders, exceptions, state.readinessChecks);
  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: target.workOrderId,
    user,
    eventType: 'ExceptionResolved',
    previousValue: target.status,
    newValue: 'Resolved',
    comment: 'Exception resolved locally.',
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    exceptions,
    workOrders,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function runSelectedReadinessCheck(state: WorkOrdersState, user = 'Danilo Brooks'): WorkOrdersState {
  const selectedChecks = state.readinessChecks.filter((check) => check.workOrderId === state.selectedWorkOrderId);
  const nextChecks = state.readinessChecks.map((check) =>
    check.workOrderId === state.selectedWorkOrderId
      ? {
          ...check,
          lastCheckedAt: state.referenceNow,
        }
      : check,
  );
  const nextReadiness = deriveReadinessStatusFromChecks(selectedChecks);

  const workOrders = refreshDerivedState(
    state,
    state.workOrders.map((workOrder) =>
      workOrder.id === state.selectedWorkOrderId
        ? {
            ...workOrder,
            readinessStatus: nextReadiness,
            lastCheckedAt: state.referenceNow,
            lastUpdatedAt: state.referenceNow,
          }
        : workOrder,
    ),
    state.exceptions,
    nextChecks,
  );

  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    user,
    eventType: 'ReadinessCheckRun',
    previousValue: state.workOrders.find((w) => w.id === state.selectedWorkOrderId)?.readinessStatus ?? '',
    newValue: nextReadiness,
    comment: 'Readiness recalculated from local checks.',
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    workOrders,
    readinessChecks: nextChecks,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function runAllReadinessChecks(state: WorkOrdersState, user = 'Danilo Brooks'): WorkOrdersState {
  const nextChecks = state.readinessChecks.map((check) => ({
    ...check,
    lastCheckedAt: state.referenceNow,
  }));

  const workOrders = refreshDerivedState(
    state,
    state.workOrders.map((workOrder) => {
      const woChecks = nextChecks.filter((check) => check.workOrderId === workOrder.id);
      return {
        ...workOrder,
        readinessStatus: deriveReadinessStatusFromChecks(woChecks),
        lastCheckedAt: state.referenceNow,
        lastUpdatedAt: state.referenceNow,
      };
    }),
    state.exceptions,
    nextChecks,
  );

  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: 'ALL',
    user,
    eventType: 'AllReadinessChecksRun',
    previousValue: '',
    newValue: 'Updated',
    comment: 'All readiness checks recalculated from local data.',
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    workOrders,
    readinessChecks: nextChecks,
    lastRefreshAt: state.referenceNow,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function markRecommendedActionDone(
  state: WorkOrdersState,
  actionId: string,
  user = 'Danilo Brooks',
): WorkOrdersState {
  const target = state.recommendedActions.find((action) => action.id === actionId);
  if (!target) {
    return state;
  }

  const recommendedActions = state.recommendedActions.map((action) =>
    action.id === actionId
      ? {...action, status: 'Done' as RecommendedAction['status']}
      : action,
  );

  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: target.workOrderId,
    user,
    eventType: 'RecommendedActionDone',
    previousValue: target.status,
    newValue: 'Done',
    comment: `Action "${target.title}" marked done locally.`,
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    recommendedActions,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function releaseWorkOrderLocal(
  state: WorkOrdersState,
  mode: WorkOrderReleaseMode = 'FullQuantity',
  user = 'Danilo Brooks',
): WorkOrdersState {
  const previous = state.workOrders.find((workOrder) => workOrder.id === state.selectedWorkOrderId);
  if (!previous) {
    return state;
  }

  const workOrders = refreshDerivedState(
    state,
    state.workOrders.map((workOrder) =>
      workOrder.id === state.selectedWorkOrderId
        ? {
            ...workOrder,
            status: 'Released',
            lastUpdatedAt: state.referenceNow,
          }
        : workOrder,
    ),
    state.exceptions,
    state.readinessChecks,
  );

  const releaseImpacts = state.releaseImpacts.map((impact) =>
    impact.workOrderId === state.selectedWorkOrderId
      ? {...impact, releaseMode: mode}
      : impact,
  );

  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    user,
    eventType: 'WorkOrderReleased',
    previousValue: previous.status,
    newValue: 'Released',
    comment: `Work order released locally (mode: ${mode}).`,
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    workOrders,
    releaseImpacts,
    selectedDetailTab: 'Execution',
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function markSelectedWorkOrderComplete(state: WorkOrdersState, user = 'Danilo Brooks'): WorkOrdersState {
  const previous = state.workOrders.find((workOrder) => workOrder.id === state.selectedWorkOrderId);
  if (!previous) {
    return state;
  }

  const workOrders = refreshDerivedState(
    state,
    state.workOrders.map((workOrder) =>
      workOrder.id === state.selectedWorkOrderId
        ? {
            ...workOrder,
            status: 'Completed',
            quantityProduced: workOrder.quantityRequired,
            actualEndDate: state.referenceNow,
            lastUpdatedAt: state.referenceNow,
          }
        : workOrder,
    ),
    state.exceptions,
    state.readinessChecks,
  );

  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: state.selectedWorkOrderId,
    user,
    eventType: 'WorkOrderCompleted',
    previousValue: previous.status,
    newValue: 'Completed',
    comment: 'Order marked complete locally.',
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    workOrders,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}

export function createLocalWorkOrder(state: WorkOrdersState, input: CreateWorkOrderInput, user = 'Danilo Brooks'): WorkOrdersState {
  const createdWorkOrder = buildLocalWorkOrderFromInput(input, state.referenceNow);
  const readinessChecks = [
    ...state.readinessChecks,
    ...(['Material', 'Machine', 'Labor', 'Quality', 'Documentation', 'Tooling', 'WarehouseStaging', 'Schedule', 'BatchLot'] as const).map((category) => ({
      id: `${createdWorkOrder.id}-${category}`,
      workOrderId: createdWorkOrder.id,
      category: category as WorkOrderReadinessCheck['category'],
      status: 'NotChecked' as WorkOrderReadinessCheckStatus,
      issueCount: 0,
      title: `${category} Readiness`,
      description: `${category} readiness not yet checked.`,
      details: `${category} readiness not yet checked.`,
      owner: 'Planner Team',
      lastCheckedAt: state.referenceNow,
      requiredAction: 'Run readiness check to assess status.',
      canOverride: true,
      severity: 'Info' as WorkOrderReadinessCheck['severity'],
    })),
  ];
  const workOrders = refreshDerivedState(
    state,
    [createdWorkOrder, ...state.workOrders],
    state.exceptions,
    readinessChecks,
  );
  const auditEvent = createWorkOrderAuditEvent({
    workOrderId: createdWorkOrder.id,
    user,
    eventType: 'WorkOrderCreated',
    previousValue: 'N/A',
    newValue: createdWorkOrder.woNumber,
    comment: 'Created locally from Work Orders page.',
    timestamp: state.referenceNow,
  });

  return {
    ...state,
    workOrders,
    selectedWorkOrderId: createdWorkOrder.id,
    readinessChecks,
    auditEvents: [auditEvent, ...state.auditEvents],
  };
}
