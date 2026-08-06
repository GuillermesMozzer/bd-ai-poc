import assert from 'node:assert/strict';
import {
  acknowledgeMpsAssistantRisk,
  applyMpsAssistantRecommendation,
  approveAllRecommendations,
  approveRecommendation,
  calculateAssistantProgress,
  calculateFinalMpsReadiness,
  createScenarioFromRecommendation,
  getActiveStepRecommendation,
  initializeMpsAssistantSteps,
  rejectAllRecommendations,
  rejectRecommendation,
} from './assistantUtils';
import {createMpsPlanningMockData} from './mock';
import {calculateMpsCapacity, canReleaseMps} from './utils';
import {
  approveSelectedWorkOrderProposals,
  approveWorkOrderProposal,
  calculateProposalSelectionSummary,
  calculateWorkOrderProposalKpis,
  filterWorkOrderProposals,
  generateWorkOrderProposalsFromMps,
  rejectWorkOrderProposal,
  rejectSelectedWorkOrderProposals,
} from './workOrderProposalUtils';
import {
  buildMpsMatrixGridTemplate,
  buildMpsMatrixLeafColumns,
  getMpsMatrixGridWidth,
  getMpsMatrixGroupSpans,
  getMpsMatrixLeafColumnIds,
} from './components/MpsDemandSignalWorkspace';
import {
  buildCapacityGridTemplate,
  buildCapacityLeafColumns,
  getCapacityGridWidth,
  getCapacityGroupSpans,
  getCapacityLeafColumnIds,
} from './components/CapacityPlanningView';

function runTests() {
  const bundle = createMpsPlanningMockData(new Date('2026-06-01T08:00:00Z'));
  const initialAssistant = initializeMpsAssistantSteps({
    plan: bundle.plan,
    demandLines: bundle.demandLines,
    bucketLines: bundle.bucketLines,
    currentUser: 'Danilo Brooks',
  });

  // 1. assistant initializes with 10 steps.
  assert.equal(initialAssistant.steps.length, 10, 'Test 1: assistant initializes with 10 steps');

  // 2. assistant progress calculates completed steps correctly.
  const progressState = initialAssistant.steps.map((step, index) => index < 3 ? {...step, status: 'Complete' as const} : step);
  const progress = calculateAssistantProgress(progressState);
  assert.equal(progress.completed, 3, 'Test 2: completed step count is correct');

  // 3. Step 1 returns missing product-line capability evidence.
  const step1Evidence = initialAssistant.evidence.filter((item) => item.stepId === 'step-1');
  assert.ok(
    step1Evidence.some((item) => item.details.includes('FG-4001') && item.details.includes('FG-5001')),
    'Test 3: step 1 evidence includes missing product-line capability',
  );

  // 4. Step 2 priority recommendation updates FG-2001 to Critical.
  const step2Applied = applyMpsAssistantRecommendation(initialAssistant, bundle.demandLines, bundle.bucketLines, 'step-2', 'Danilo Brooks');
  assert.equal(
    step2Applied.demandLines.find((line) => line.productCode === 'FG-2001')?.priority,
    'Critical',
    'Test 4: step 2 sets FG-2001 priority to Critical',
  );

  // 5. Step 4 bucket split recommendation updates FG-1001 weeks.
  const afterStep4 = applyMpsAssistantRecommendation(initialAssistant, bundle.demandLines, bundle.bucketLines, 'step-4', 'Danilo Brooks');
  assert.deepEqual(
    afterStep4.bucketLines
      .filter((line) => line.productCode === 'FG-1001')
      .map((line) => ({bucket: line.bucketLabel, quantity: line.plannedQuantity})),
    [
      {bucket: 'Week 1', quantity: 40000},
      {bucket: 'Week 2', quantity: 40000},
      {bucket: 'Week 3', quantity: 35000},
      {bucket: 'Week 4', quantity: 0},
    ],
    'Test 5: step 4 updates FG-1001 weekly split',
  );

  // 6. Step 5 line assignment recommendation moves FG-2001 from Line 30 to Line 20.
  const afterStep5 = applyMpsAssistantRecommendation(initialAssistant, bundle.demandLines, bundle.bucketLines, 'step-5', 'Danilo Brooks');
  assert.equal(
    afterStep5.bucketLines.find((line) => line.productCode === 'FG-2001' && line.bucketLabel === 'Week 2')?.assignedLineId,
    'line-20',
    'Test 6: step 5 moves FG-2001 Week 2 to Line 20',
  );

  // 7. Step 6 capacity recommendation updates the proposed balancing move.
  const afterStep6 = applyMpsAssistantRecommendation(initialAssistant, bundle.demandLines, bundle.bucketLines, 'step-6', 'Danilo Brooks');
  assert.equal(
    afterStep6.bucketLines.find((line) => line.productCode === 'FG-1002' && line.bucketLabel === 'Week 2')?.plannedQuantity,
    15000,
    'Test 7: step 6 updates the FG-1002 balancing move into Week 2',
  );

  // 8. Step 7 inventory recommendation improves FG-3001 stock risk.
  const afterStep7 = applyMpsAssistantRecommendation(initialAssistant, bundle.demandLines, bundle.bucketLines, 'step-7', 'Danilo Brooks');
  assert.ok(
    (afterStep7.bucketLines.find((line) => line.productCode === 'FG-3001' && line.bucketLabel === 'Week 2')?.plannedQuantity ?? 0) > 0 &&
    (afterStep7.bucketLines.find((line) => line.productCode === 'FG-3001' && line.bucketLabel === 'Week 4')?.plannedQuantity ?? 1) === 0,
    'Test 8: step 7 pulls FG-3001 forward from Week 4 to Week 2',
  );

  // 9. Step 8 material risk recommendation creates material risk flag.
  const afterStep8 = applyMpsAssistantRecommendation(initialAssistant, bundle.demandLines, bundle.bucketLines, 'step-8', 'Danilo Brooks');
  assert.ok(
    (afterStep8.bucketLines.find((line) => line.productCode === 'FG-2001' && line.bucketLabel === 'Week 2')?.constraintReason ?? '').includes('CAP-204'),
    'Test 9: step 8 flags CAP-204 material risk',
  );

  // 10. Step 9 exception resolution changes blockers/warnings.
  const afterStep9 = applyMpsAssistantRecommendation(initialAssistant, bundle.demandLines, bundle.bucketLines, 'step-9', 'Danilo Brooks');
  assert.equal(
    afterStep9.steps.find((step) => step.id === 'step-9')?.status,
    'Warning',
    'Test 10: step 9 transitions to warning after blockers are handled locally',
  );

  // 11. Final readiness returns ReadyWithWarnings when no blockers remain.
  const readyWithWarnings = calculateFinalMpsReadiness([
    ...initialAssistant.steps.slice(0, 9).map((step) => ({...step, status: 'Complete' as const})),
    {...initialAssistant.steps[9], status: 'Warning' as const},
  ]);
  assert.equal(readyWithWarnings, 'ReadyWithWarnings', 'Test 11: final readiness returns ReadyWithWarnings');

  // 12. Skipping a blocker step keeps final readiness NotReady or Blocked.
  const skippedBlocker = calculateFinalMpsReadiness([
    ...initialAssistant.steps.map((step) =>
      step.id === 'step-5'
        ? {...step, status: 'Skipped' as const}
        : {...step, status: 'Complete' as const},
    ),
  ], ['step-5']);
  assert.equal(skippedBlocker, 'Blocked', 'Test 12: skipping a blocker step keeps readiness blocked');

  // 13. audit event is created when recommendation is applied.
  assert.equal(step2Applied.auditEvent.eventType, 'RecommendationApplied', 'Test 13: apply creates assistant audit event');

  // 14. acknowledge risk requires comment for Warning or Blocker.
  assert.throws(
    () => acknowledgeMpsAssistantRisk(initialAssistant, 'step-8', 'Danilo Brooks', ''),
    /comment is required/i,
    'Test 14: acknowledge risk requires a comment for warning/blocker recommendations',
  );

  // 15. create scenario creates local scenario placeholder.
  const activeRecommendation = getActiveStepRecommendation('step-6', initialAssistant.recommendations);
  assert.ok(activeRecommendation, 'Test 15 setup: step 6 recommendation exists');
  const scenario = createScenarioFromRecommendation(activeRecommendation!, 'step-6', 'Danilo Brooks');
  assert.equal(scenario.auditEvent.eventType, 'ScenarioCreated', 'Test 15: scenario creation logs local audit event');

  // Regression check: MPS capacity calculation still works after assistant changes exist.
  const withCapacity = calculateMpsCapacity(bundle.bucketLines, bundle.productionLines, bundle.capabilities);
  assert.ok(withCapacity.every((line) => line.requiredHours >= 0), 'Regression: capacity calculation still returns valid hours');

  // 16. approveRecommendation sets status to Applied and creates RecommendationApproved audit event.
  const afterApprove = approveRecommendation(initialAssistant, bundle.demandLines, bundle.bucketLines, 'step-2', 'Danilo Brooks');
  assert.equal(
    afterApprove.recommendations.find((r) => r.stepId === 'step-2')?.status,
    'Applied',
    'Test 16: approveRecommendation sets status to Applied',
  );
  assert.equal(afterApprove.auditEvent.eventType, 'RecommendationApproved', 'Test 16: approveRecommendation creates RecommendationApproved audit event');

  // 17. rejectRecommendation sets status to Rejected and stores reason.
  const afterReject = rejectRecommendation(initialAssistant, 'step-2', 'Manual override', 'Danilo Brooks');
  assert.equal(
    afterReject.recommendations.find((r) => r.stepId === 'step-2')?.status,
    'Rejected',
    'Test 17: rejectRecommendation sets status to Rejected',
  );
  assert.equal(
    afterReject.recommendations.find((r) => r.stepId === 'step-2')?.rejectionReason,
    'Manual override',
    'Test 17: rejectRecommendation stores rejection reason',
  );

  // 18. approveAllRecommendations approves all Proposed recommendations.
  const afterApproveAll = approveAllRecommendations(initialAssistant, bundle.demandLines, bundle.bucketLines, 'Danilo Brooks');
  const allDone = afterApproveAll.state.recommendations.every((r) => r.status !== 'Proposed');
  assert.ok(allDone, 'Test 18: approveAllRecommendations approves all Proposed recommendations');

  // 19. rejectAllRecommendations rejects all Proposed recommendations.
  const afterRejectAll = rejectAllRecommendations(initialAssistant, 'Batch rejection reason', 'Danilo Brooks');
  assert.ok(
    afterRejectAll.recommendations.every((r) => r.status === 'Rejected'),
    'Test 19: rejectAllRecommendations rejects all Proposed recommendations',
  );
  assert.equal(afterRejectAll.auditEvent.eventType, 'AllRecommendationsRejected', 'Test 19: rejectAllRecommendations creates AllRecommendationsRejected audit event');

  // 20. canReleaseMps returns true when assistantReadinessStatus is ReadyWithWarnings (no blockers).
  const canReleaseWithAssistant = canReleaseMps(bundle.plan, [], false, 'ReadyWithWarnings');
  assert.ok(canReleaseWithAssistant, 'Test 20: canReleaseMps returns true when assistantReadinessStatus is ReadyWithWarnings');

  // 21. canReleaseMps returns true even with blocker exceptions when assistant is ReadyWithWarnings
  //     (assistant step-9 already reviewed and resolved exceptions — its assessment takes priority).
  const blockerException = [{id: 'exc-test', severity: 'Blocker' as const, category: 'Capacity' as const, reason: 'Test blocker'}];
  const canReleaseWithBlockers = canReleaseMps(bundle.plan, blockerException, false, 'ReadyWithWarnings');
  assert.equal(canReleaseWithBlockers, true, 'Test 21: canReleaseMps returns true when assistant is ReadyWithWarnings even if computed blockers remain');
  // Without assistant readiness, blockers still block release.
  const cannotReleaseNoAssistant = canReleaseMps(bundle.plan, blockerException, false, undefined);
  assert.equal(cannotReleaseNoAssistant, false, 'Test 21b: canReleaseMps returns false when blockers exist and no assistant status');

  // 22. generateWorkOrderProposalsFromMps creates 12 proposals.
  const proposals = generateWorkOrderProposalsFromMps(bundle.plan, bundle.bucketLines, bundle.productionLines);
  assert.equal(proposals.length, 12, 'Test 22: generateWorkOrderProposalsFromMps creates 12 proposals');

  // 23. calculateWorkOrderProposalKpis counts statuses correctly.
  const kpis = calculateWorkOrderProposalKpis(proposals);
  assert.equal(kpis.total, 12, 'Test 23: kpis total is 12');
  assert.ok(kpis.approvedForCreation >= 1, 'Test 23: kpis has at least 1 approved (WOP-0012)');
  assert.ok(kpis.blocked >= 1, 'Test 23: kpis has at least 1 blocked (WOP-0007)');
  assert.ok(kpis.needsReview >= 1, 'Test 23: kpis has at least 1 needs review');

  // 24. approveWorkOrderProposal sets status to ApprovedForCreation.
  const {proposals: afterApproveProposal} = approveWorkOrderProposal(proposals, [], proposals[0].id, 'Danilo Brooks');
  assert.equal(
    afterApproveProposal.find((p) => p.id === proposals[0].id)?.status,
    'ApprovedForCreation',
    'Test 24: approveWorkOrderProposal sets status to ApprovedForCreation',
  );

  // 25. rejectWorkOrderProposal sets status to Rejected and stores reason.
  const {proposals: afterRejectProposal} = rejectWorkOrderProposal(proposals, [], proposals[0].id, 'Test rejection', 'Danilo Brooks');
  assert.equal(
    afterRejectProposal.find((p) => p.id === proposals[0].id)?.status,
    'Rejected',
    'Test 25: rejectWorkOrderProposal sets status to Rejected',
  );
  assert.equal(
    afterRejectProposal.find((p) => p.id === proposals[0].id)?.rejectionReason,
    'Test rejection',
    'Test 25: rejectWorkOrderProposal stores rejection reason',
  );

  // 26. approveSelectedWorkOrderProposals skips Blocked proposals.
  const blockedProposal = proposals.find((p) => p.status === 'Blocked');
  assert.ok(blockedProposal, 'Test 26 setup: blocked proposal exists');
  const allIds = proposals.map((p) => p.id);
  const {proposals: afterBatchApprove} = approveSelectedWorkOrderProposals(proposals, [], allIds, 'Danilo Brooks');
  assert.equal(
    afterBatchApprove.find((p) => p.id === blockedProposal!.id)?.status,
    'Blocked',
    'Test 26: approveSelectedWorkOrderProposals does not approve Blocked proposals',
  );

  // 27. rejectSelectedWorkOrderProposals rejects selected proposals with reason.
  const pendingIds = proposals.filter((p) => p.status === 'PendingReview').map((p) => p.id);
  const {proposals: afterBatchReject} = rejectSelectedWorkOrderProposals(proposals, [], pendingIds, 'Batch reason', 'Danilo Brooks');
  assert.ok(
    pendingIds.every((id) => afterBatchReject.find((p) => p.id === id)?.status === 'Rejected'),
    'Test 27: rejectSelectedWorkOrderProposals rejects all selected proposals',
  );

  // 28. filterWorkOrderProposals by status works.
  const pendingOnly = filterWorkOrderProposals(proposals, {status: 'PendingReview', product: '', line: '', priority: '', readinessPreview: '', capacityStatus: '', materialRisk: '', aiConfidence: '', showNeedsReview: false, showBlocked: false});
  assert.ok(pendingOnly.every((p) => p.status === 'PendingReview'), 'Test 28: filterWorkOrderProposals by status returns only matching proposals');

  // 29. calculateProposalSelectionSummary counts selected rows.
  const withSelection = proposals.map((p, i) => ({...p, selected: i < 3}));
  const summary = calculateProposalSelectionSummary(withSelection);
  assert.equal(summary.selected, 3, 'Test 29: calculateProposalSelectionSummary counts selected rows');

  // 30. weekly MPS matrix leaf columns stay in the reference order.
  const weeklyTimeColumns = [
    {id: 'wk23', label: 'Wk 23'},
    {id: 'wk24', label: 'Wk 24'},
    {id: 'wk25', label: 'Wk 25'},
    {id: 'wk26', label: 'Wk 26'},
  ];
  assert.deepEqual(
    getMpsMatrixLeafColumnIds(weeklyTimeColumns),
    [
      'productSku',
      'uom',
      'total',
      'dayBeforeStart',
      'wk23',
      'wk24',
      'wk25',
      'wk26',
      'totalJuneRequiredDemand',
      'totalJuneDistributedMps',
      'futureJul',
      'futureAug',
      'futureSep',
      'totalPeriodFuture',
    ],
    'Test 30: weekly MPS matrix column order matches the visual reference',
  );

  // 31. header groups span the exact number of leaf columns.
  const groupSpans = getMpsMatrixGroupSpans(weeklyTimeColumns.length);
  assert.deepEqual(
    groupSpans.map((group) => group.span),
    [1, 1, 1, 1, 4, 2, 3, 1],
    'Test 31: MPS matrix header group spans match leaf column groups',
  );
  assert.equal(
    groupSpans.reduce((sum, group) => sum + group.span, 0),
    14,
    'Test 31b: header span total equals leaf column count',
  );

  // 32. body rows reserve one grid cell per leaf column, including expanded product detail rows.
  const leafColumns = buildMpsMatrixLeafColumns(weeklyTimeColumns);
  const bodyCellCount = 4 + weeklyTimeColumns.length + 2 + 3 + 1;
  assert.equal(leafColumns.length, bodyCellCount, 'Test 32: body row cell count equals leaf column count');

  // 33. the shared CSS grid template uses one width per leaf column.
  const template = buildMpsMatrixGridTemplate(leafColumns);
  assert.equal(template.split(' ').length, leafColumns.length, 'Test 33: grid template has one segment per leaf column');
  assert.equal(getMpsMatrixGridWidth(leafColumns), 1880, 'Test 33b: weekly grid width matches canonical column widths');

  // 34. Capacity view day-mode leaf columns stay in canonical order.
  const dayColumnIds = getCapacityLeafColumnIds('day');
  const expectedDayIds = [
    'resourceWorkCenter', 'uom', 'dayBeforeStart',
    ...Array.from({length: 30}, (_, i) => `day${String(i + 1).padStart(2, '0')}`),
    'subtotalJun2025', 'futureJul2025', 'futureAug2025', 'futureSep2025', 'totalPeriodFuture',
  ];
  assert.deepEqual(dayColumnIds, expectedDayIds, 'Test 34: capacity day-mode column order matches canonical spec');

  // 35. Capacity header group spans total 38 in day mode (30 daily columns).
  const dayGroupSpans = getCapacityGroupSpans(30);
  assert.deepEqual(
    dayGroupSpans.map((g) => g.span),
    [1, 1, 1, 30, 1, 3, 1],
    'Test 35: capacity header group spans match leaf column groups in day mode',
  );
  assert.equal(
    dayGroupSpans.reduce((s, g) => s + g.span, 0),
    38,
    'Test 35b: capacity day-mode group span total equals leaf column count',
  );

  // 36. Body row cell count equals 38 leaf columns in day mode.
  const dayCols = buildCapacityLeafColumns('day');
  assert.equal(dayCols.length, 38, 'Test 36: capacity day mode has 38 leaf columns');

  // 37. Week mode has 12 leaf columns and group spans sum to 12.
  const weekCols = buildCapacityLeafColumns('week');
  assert.equal(weekCols.length, 12, 'Test 37: capacity week mode has 12 leaf columns');
  const weekGroupSpans = getCapacityGroupSpans(4);
  assert.equal(
    weekGroupSpans.reduce((s, g) => s + g.span, 0),
    12,
    'Test 37b: capacity week-mode group span total equals leaf column count',
  );
  assert.deepEqual(
    weekGroupSpans.map((g) => g.span),
    [1, 1, 1, 4, 1, 3, 1],
    'Test 37c: capacity week-mode group spans match expected structure',
  );

  // Smoke-check grid template and width for capacity view.
  const dayGridTemplate = buildCapacityGridTemplate(dayCols);
  assert.equal(dayGridTemplate.split(' ').length, 38, 'Test 37d: capacity day grid template has 38 segments');
  assert.equal(getCapacityGridWidth(dayCols), 190 + 52 + 68 + 30 * 52 + 72 + 72 + 72 + 72 + 90, 'Test 37e: capacity day grid width matches canonical column widths');

  console.log('All 37 MPS planning + capacity column model tests passed.');
}

runTests();
