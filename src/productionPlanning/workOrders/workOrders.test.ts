import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import WorkOrdersPage from './WorkOrdersPage';
import {createWorkOrdersDemoBundle} from './mocks';
import {
  acknowledgeException,
  addCommentToSelectedWorkOrder,
  changeSelectedWorkOrderPriority,
  createInitialWorkOrdersState,
  markSelectedWorkOrderComplete,
  pauseSelectedWorkOrder,
  reassignSelectedWorkOrderLine,
  selectWorkOrder,
  setFilters,
  setMainTab,
  setDetailTab,
} from './state';
import {
  buildWorkOrderExceptionsSummary,
  calculateQuantityRemaining,
  calculateWorkOrderProgress,
  calculateWorkOrderSummary,
  deriveReadinessStatusFromChecks,
  deriveScheduleStatus,
  filterWorkOrders,
  sortWorkOrdersByRisk,
} from './utils';

function runTests() {
  const bundle = createWorkOrdersDemoBundle();

  assert.equal(calculateQuantityRemaining(32000, 18500), 13500, 'quantityRemaining should be calculated correctly');
  assert.equal(calculateWorkOrderProgress(32000, 18500), 57.8, 'progressPercent should be calculated correctly');
  assert.equal(
    deriveScheduleStatus('2026-05-12T10:00:00.000Z', 'Running', bundle.referenceNow),
    'Late',
    'Late schedule status should be derived correctly',
  );
  assert.equal(
    deriveScheduleStatus('2026-05-14T05:00:00.000Z', 'Running', bundle.referenceNow),
    'AtRisk',
    'AtRisk should be derived for orders due within 48h',
  );

  const blockedChecks = bundle.readinessChecks.filter((check) => check.workOrderId === 'wo-100246');
  assert.equal(
    deriveReadinessStatusFromChecks(blockedChecks),
    'Blocked',
    'readinessStatus should be Blocked when any readiness check is blocked',
  );
  const warningChecks = bundle.readinessChecks.filter((check) => check.workOrderId === 'wo-100249');
  assert.equal(
    deriveReadinessStatusFromChecks(warningChecks),
    'Warning',
    'readinessStatus should be Warning when warnings exist and no blockers exist',
  );

  const summary = calculateWorkOrderSummary(bundle.workOrders, bundle.exceptions, bundle.referenceNow);
  assert.equal(summary.byStatus.Running, 2, 'summary cards should count running statuses correctly');
  assert.equal(summary.readinessCounts.Blocked, 2, 'summary cards should count blocked readiness correctly');

  const exceptionSummary = buildWorkOrderExceptionsSummary(bundle.exceptions);
  assert.equal(exceptionSummary.byType.MaterialShortage, 1, 'exception count should be calculated from open exceptions');

  const filtered = filterWorkOrders(
    bundle.workOrders,
    {...createInitialWorkOrdersState().filters, status: 'Running', search: 'FG-1001'},
    bundle.exceptions,
    bundle.referenceNow,
  );
  assert.equal(filtered.length, 2, 'filters should reduce visible work orders correctly');

  const sorted = sortWorkOrdersByRisk(bundle.workOrders);
  assert.equal(sorted[0]?.woNumber, 'WO-100246', 'sort by risk should prioritize critical, late, and blocked orders');

  let state = createInitialWorkOrdersState();
  state = markSelectedWorkOrderComplete(state);
  const completed = state.workOrders.find((workOrder) => workOrder.id === state.selectedWorkOrderId);
  assert.equal(completed?.status, 'Completed', 'mark complete should update selected order status');
  assert.equal(
    completed?.quantityProduced,
    completed?.quantityRequired,
    'mark complete should set quantity produced to required quantity',
  );

  state = createInitialWorkOrdersState();
  state = acknowledgeException(state, 'exc-100246-1');
  assert.equal(
    state.exceptions.find((exception) => exception.id === 'exc-100246-1')?.status,
    'Acknowledged',
    'acknowledge exception should change local exception status',
  );

  const html = renderToStaticMarkup(React.createElement(WorkOrdersPage));
  assert.ok(html.includes('Work Orders'), 'page should render title');
  assert.ok(html.includes('Track the order pool from release through execution'), 'page should render subtitle');
  assert.ok(html.includes('Total Work Orders'), 'summary cards should render');
  assert.ok(html.includes('WO-100245'), 'work orders table should render demo rows');

  let interactionState = createInitialWorkOrdersState();
  interactionState = selectWorkOrder(interactionState, 'wo-100246');
  assert.equal(interactionState.selectedWorkOrderId, 'wo-100246', 'selecting a row should update the detail panel selection');

  interactionState = setFilters(interactionState, {status: 'Blocked'});
  const blockedVisible = filterWorkOrders(interactionState.workOrders, interactionState.filters, interactionState.exceptions, interactionState.referenceNow);
  assert.equal(blockedVisible.length, 2, 'filters should work locally');

  interactionState = setMainTab(interactionState, 'Exceptions');
  assert.equal(interactionState.activeMainTab, 'Exceptions', 'exceptions tab should be selectable');

  interactionState = pauseSelectedWorkOrder(createInitialWorkOrdersState());
  assert.equal(
    interactionState.workOrders.find((workOrder) => workOrder.id === interactionState.selectedWorkOrderId)?.status,
    'Paused',
    'quick action Pause WO should update selected order status',
  );

  interactionState = addCommentToSelectedWorkOrder(createInitialWorkOrdersState(), 'Planner note added locally');
  assert.equal(interactionState.auditEvents[0]?.eventType, 'PlannerCommentAdded', 'Add Comment should create an audit event');

  interactionState = changeSelectedWorkOrderPriority(createInitialWorkOrdersState(), 'Critical');
  assert.equal(
    interactionState.workOrders.find((workOrder) => workOrder.id === interactionState.selectedWorkOrderId)?.priority,
    'Critical',
    'Change Priority should update the priority badge data',
  );

  interactionState = reassignSelectedWorkOrderLine(createInitialWorkOrdersState(), 'line-20');
  assert.equal(
    interactionState.workOrders.find((workOrder) => workOrder.id === interactionState.selectedWorkOrderId)?.assignedLineName,
    'Line 20',
    'Reassign Line should update assigned line',
  );

  interactionState = markSelectedWorkOrderComplete(createInitialWorkOrdersState());
  assert.equal(
    interactionState.workOrders.find((workOrder) => workOrder.id === interactionState.selectedWorkOrderId)?.progressPercent,
    100,
    'Mark Complete should update status and progress',
  );

  interactionState = setDetailTab(createInitialWorkOrdersState(), 'Execution');
  assert.equal(interactionState.selectedDetailTab, 'Execution', 'detail panel tabs should switch correctly');

  console.log('Work Orders tests passed: 22');
}

runTests();
