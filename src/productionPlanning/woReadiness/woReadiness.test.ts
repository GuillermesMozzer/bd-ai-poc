import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import WoReadinessPage from './WoReadinessPage';
import {createWoReadinessDemoBundle} from './mocks';
import {
  acknowledgeException,
  addCommentToSelectedWorkOrder,
  createInitialWoReadinessState,
  resolveException,
  runSelectedReadinessCheck,
  selectWorkOrder,
  setFilters,
} from './state';
import {
  calculateLaborCapacitySupportedPercent,
  calculateOverallReadinessStatus,
  calculateQuantityRemaining,
  calculateReleaseRecommendation,
  filterWorkOrders,
} from './utils';

function runTests() {
  const bundle = createWoReadinessDemoBundle();

  assert.equal(
    calculateOverallReadinessStatus(bundle.readinessChecks.filter((item) => item.workOrderId === 'wo-100248')),
    'Ready',
    'overall readiness should be Ready when all checks are Ready',
  );
  assert.equal(
    calculateOverallReadinessStatus(bundle.readinessChecks.filter((item) => item.workOrderId === 'wo-100245')),
    'Warning',
    'overall readiness should be Warning when warnings exist and no blockers exist',
  );
  assert.equal(
    calculateOverallReadinessStatus(bundle.readinessChecks.filter((item) => item.workOrderId === 'wo-100246')),
    'Blocked',
    'overall readiness should be Blocked when any blocker exists',
  );
  assert.equal(
    calculateOverallReadinessStatus(bundle.readinessChecks.filter((item) => item.workOrderId === 'wo-100254')),
    'NotChecked',
    'overall readiness should be NotChecked when checks have not been run',
  );

  assert.equal(calculateReleaseRecommendation('Ready'), 'Ready to Release', 'release recommendation should be Ready to Release for Ready');
  assert.equal(calculateReleaseRecommendation('Warning'), 'Ready with Warnings', 'release recommendation should be Ready with Warnings for Warning');
  assert.equal(calculateReleaseRecommendation('Blocked'), 'Do Not Release', 'release recommendation should be Do Not Release for Blocked');

  const physicallyMissing = bundle.materialItems.find((item) => item.workOrderId === 'wo-100253');
  assert.equal(physicallyMissing?.issue.includes('physically found'), true, 'material available in system but physically not found should exist in mock data');

  const laborItem = bundle.laborItems.find((item) => item.workOrderId === 'wo-100250');
  assert.equal(laborItem?.capacitySupportedPercent, 60, 'labor capacity supported percent should be calculated correctly');
  assert.equal(calculateLaborCapacitySupportedPercent(laborItem!), 60, 'labor capacity utility should calculate 60 percent');

  const workOrder246 = bundle.workOrders.find((item) => item.id === 'wo-100246');
  assert.equal(workOrder246?.exceptionCount, 1, 'exception count should come from open exceptions');

  const filtered = filterWorkOrders(
    bundle.workOrders,
    {
      line: 'Line 20',
      readinessStatus: 'All',
      priority: 'High',
      search: 'FG-5001',
      dueDateFrom: '',
      dueDateTo: '',
      issueCategory: 'All',
      showOnlyBlockers: false,
      showOnlyWarnings: false,
    },
    bundle.exceptions,
  );
  assert.equal(filtered.length, 1, 'filters should reduce visible work orders correctly');

  let state = createInitialWoReadinessState();
  state = selectWorkOrder(state, 'wo-100247');
  assert.equal(state.selectedWorkOrderId, 'wo-100247', 'selected WO detail data should update correctly');

  state = resolveException(createInitialWoReadinessState(), 'exc-246-1');
  const afterResolve246 = state.workOrders.find((item) => item.id === 'wo-100246');
  assert.equal(afterResolve246?.readinessStatus, 'Ready', 'resolving the only blocker should update readiness');

  state = runSelectedReadinessCheck(createInitialWoReadinessState());
  assert.equal(state.auditEvents[0]?.eventType, 'ReadinessCheckRun', 'audit event should be created when readiness check runs');

  state = acknowledgeException(createInitialWoReadinessState(), 'exc-245-1');
  assert.equal(state.exceptions.find((item) => item.id === 'exc-245-1')?.status, 'Acknowledged', 'acknowledge warning should update exception status');

  state = addCommentToSelectedWorkOrder(createInitialWoReadinessState(), 'Planner note');
  assert.equal(state.auditEvents[0]?.eventType, 'CommentAdded', 'adding comment should create audit event');

  state = setFilters(createInitialWoReadinessState(), {showOnlyBlockers: true});
  const blockersOnly = filterWorkOrders(state.workOrders, state.filters, state.exceptions);
  assert.equal(blockersOnly.every((item) => item.readinessStatus === 'Blocked'), true, 'show only blockers should keep blocked rows only');

  assert.equal(calculateQuantityRemaining(100, 40), 60, 'quantity remaining should be calculated correctly');

  const html = renderToStaticMarkup(React.createElement(WoReadinessPage));
  assert.ok(html.includes('WO Readiness'), 'page should render title');
  assert.ok(html.includes('Check materials, machine, labor, quality, documentation, and schedule readiness before release.'), 'page should render subtitle');
  assert.ok(html.includes('WO-100245'), 'demo WO list should render automatically');
  assert.ok(html.includes('Ready to Release') || html.includes('Ready with Warnings'), 'default selected WO details should render recommendation');
  assert.ok(html.includes('Material Readiness') || html.includes('Readiness Checklist'), 'page should render readiness sections');

  console.log('WO Readiness tests passed: 17');
}

runTests();
