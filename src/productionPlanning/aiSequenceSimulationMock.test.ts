import * as assert from 'node:assert/strict';
import {
  aiSequenceSimulationMock,
  createAiSequenceSimulationMock,
  createAiSimulationSchedulingWorkOrders,
  createAiSimulationTimelineWorkOrders,
} from './aiSequenceSimulationMock';
import {validateNoGapsInLineSequence} from './aiSequenceSimulationUtils';
import {initialApprovedSequence} from './schedulingWorkspaceMock';
import {initialTimelineApprovedWorkOrders} from './schedulingWorkspaceTimeline/mock';

function runTests() {
  const simulation = createAiSequenceSimulationMock();

  assert.ok(simulation.id, 'Test 1: AI simulation mock data exists');
  assert.equal(simulation.id, 'AISIM-2026-05-001', 'Test 1: simulation id matches expected value');

  const aiTimelineSnapshot = createAiSimulationTimelineWorkOrders(simulation).map((item) => ({
    woNumber: item.woNumber,
    lineId: item.lineId,
    plannedStartDateTime: item.plannedStartDateTime,
  }));
  const currentTimelineSnapshot = initialTimelineApprovedWorkOrders.map((item) => ({
    woNumber: item.woNumber,
    lineId: item.lineId,
    plannedStartDateTime: item.plannedStartDateTime,
  }));
  assert.notDeepEqual(aiTimelineSnapshot, currentTimelineSnapshot, 'Test 2: AI simulation is different from current schedule data');

  const aiScheduleIds = createAiSimulationSchedulingWorkOrders(simulation).map((item) => item.id);
  assert.notDeepEqual(aiScheduleIds, initialApprovedSequence.map((item) => item.id), 'Test 2: AI sequence cards differ from current schedule cards');

  assert.deepEqual(
    simulation.lineSequences.map((line) => line.lineName),
    ['Line 10', 'Line 20', 'Line 30', 'Line 40', 'Line 50'],
    'Test 3: required line sequences are present',
  );

  assert.ok(simulation.lineSequences.every((line) => line.sequenceItems.length >= 4), 'Test 4: each line contains at least 4 proposed WOs');

  assert.ok(
    simulation.lineSequences.every((line) =>
      line.sequenceItems.every((item, index, items) => index === 0 || items[index - 1].proposedEndDateTime === item.proposedStartDateTime),
    ),
    'Test 5: each line sequence has no gaps',
  );

  assert.ok(simulation.lineSequences.every((line) => validateNoGapsInLineSequence(line.sequenceItems)), 'Test 6: no-gap validator returns true for all line sequences');
  assert.ok(simulation.lineSequences.every((line) => line.gapFreeSequence), 'Test 6: gapFreeSequence is true on all proposed lines');

  assert.ok(simulation.metricsBefore && simulation.metricsAfter, 'Test 7: metrics before and after are present');
  assert.equal(simulation.metricsBefore.totalIdleHours, 21, 'Test 7: metrics before match expected values');
  assert.equal(simulation.metricsAfter.totalIdleHours, 4, 'Test 7: metrics after match expected values');

  assert.equal(simulation.reasoning.length, 5, 'Test 8: AI reasoning entries are present');
  assert.ok(simulation.reasoning.some((entry) => entry.category === 'Readiness' && entry.severity === 'Critical'), 'Test 8: critical readiness reasoning exists');

  assert.ok(simulation.risks.length >= 5, 'Test 9: risks are present');
  assert.ok(simulation.assumptions.length >= 5, 'Test 9: assumptions are present');

  const blockedItem = simulation.lineSequences
    .flatMap((line) => line.sequenceItems)
    .find((item) => item.workOrderId === 'WO-300125');
  assert.ok(blockedItem, 'Test 10: blocked WO exists in simulation');
  assert.equal(blockedItem?.readinessStatus, 'Blocked', 'Test 10: blocked WO remains marked Blocked');
  assert.equal(blockedItem?.status, 'Blocked', 'Test 10: blocked WO is not treated as resolved');
  assert.equal(blockedItem?.changeType, 'BlockedAtEnd', 'Test 10: blocked WO remains at the end as planner-owned');

  const reviewItem = simulation.lineSequences
    .flatMap((line) => line.sequenceItems)
    .find((item) => item.changeType === 'NeedsReview');
  assert.ok(reviewItem, 'Test 10: a needs-review WO remains visible in the proposal');

  const mappedTimeline = createAiSimulationTimelineWorkOrders(aiSequenceSimulationMock);
  assert.equal(mappedTimeline.length, 20, 'Test 11: timeline mapping creates all proposed WOs');
  assert.ok(mappedTimeline.some((item) => item.lineId === 'line-50' && item.priority === 'High'), 'Test 11: mapped timeline keeps per-line priority details');

  console.log('AI Sequence Simulation mock tests passed: 11');
}

runTests();
