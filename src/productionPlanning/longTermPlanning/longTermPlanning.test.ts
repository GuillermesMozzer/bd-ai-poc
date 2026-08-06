import assert from 'node:assert/strict';
import {createLongTermPlanningMockData} from './mock';
import {
  buildExceptions,
  buildRowViews,
  buildScenarioComparison,
  calculateCalendarSeverity,
  calculateCapacity,
  canReleasePlan,
  filterRows,
  getCalendarEventsForDate,
  getLongTermPlanningDaySummary,
  getLongTermPlanningMonthSummary,
  getLongTermPlanningYearSummary,
  isPlanEditable,
  mapPlanningRowsToCalendarEvents,
  validateLongTermPlan,
} from './utils';

function runTests() {
  const bundle = createLongTermPlanningMockData(new Date('2026-05-13T12:00:00Z'));
  const cleanCapabilities = bundle.capabilities.map((item) =>
    item.productCode === 'FG-4001' ? {...item, productionRateUnitsPerHour: 80} : item,
  );
  const cleanLines = bundle.planLines
    .filter((line) => line.productCode !== 'FG-5001')
    .map((line) =>
      line.id === 'ltp-line-002'
        ? {...line, committedQuantity: line.requestedQuantity, assignedLineId: 'line-10'}
        : line.id === 'ltp-line-008'
          ? {...line, committedQuantity: line.requestedQuantity}
          : line,
    );

  const validSummary = validateLongTermPlan(
    {...bundle.plan, sourceTimestamp: new Date().toISOString()},
    cleanLines,
    bundle.productionLines,
    cleanCapabilities,
  );
  assert.equal(validSummary.errors.length, 0, 'Valid plan should not return blocking errors');

  const missingProductSummary = validateLongTermPlan(
    bundle.plan,
    [{...bundle.planLines[0], id: 'missing-product', productCode: ''}],
    bundle.productionLines,
    cleanCapabilities,
  );
  assert.ok(
    missingProductSummary.errors.some((item) => item.code === 'MISSING_PRODUCT'),
    'Missing product code should return blocking validation error',
  );

  const capacity = calculateCapacity(bundle.planLines, bundle.productionLines, bundle.capabilities);
  const missingRateResult = capacity.find((item) => item.productCode === 'FG-4001');
  assert.equal(missingRateResult?.status, 'PendingData', 'Missing production rate should return PendingData');

  const noLineResult = capacity.find((item) => item.productCode === 'FG-5001');
  assert.equal(noLineResult?.status, 'NotProducible', 'Product without eligible line should return NotProducible');

  const standardTubeResult = capacity.find((item) => item.planLineId === 'ltp-line-001');
  assert.equal(standardTubeResult?.requiredHours, Number((32000 / 220).toFixed(2)), 'Capacity calculation should return correct required hours');

  const overloadResult = capacity.find((item) => item.planLineId === 'ltp-line-002');
  assert.equal(overloadResult?.status, 'Constrained', 'Overload should return Constrained');

  const riskResult = capacity.find((item) => item.planLineId === 'ltp-line-005');
  assert.equal(riskResult?.status, 'AtRisk', 'Utilization above 90% should return AtRisk');

  assert.equal(isPlanEditable({...bundle.plan, status: 'Released'}), false, 'Released plan should prevent editing');

  const baselineSnapshot = bundle.planLines.map((line) => ({...line}));
  const comparison = buildScenarioComparison(
    bundle.planLines,
    {
      id: 'scenario-1',
      planId: bundle.plan.id,
      name: 'Line rebalance',
      description: '',
      createdBy: 'Maya Planner',
      createdAt: new Date().toISOString(),
      assumptions: '',
      status: 'Draft',
      changedLines: [{planLineId: 'ltp-line-001', committedQuantity: 30000, assignedLineId: 'line-20'}],
    },
    bundle.productionLines,
    cleanCapabilities,
    [],
  );
  assert.equal(bundle.planLines[0].committedQuantity, baselineSnapshot[0].committedQuantity, 'Scenario comparison should not mutate baseline');
  assert.ok(comparison.comparison.length > 0, 'Scenario comparison should produce comparison rows');

  const noAssignedLineCapacity = calculateCapacity(
    [{...bundle.planLines[0], assignedLineId: null}],
    bundle.productionLines,
    bundle.capabilities,
  );
  assert.equal(noAssignedLineCapacity[0]?.status, 'PendingData', 'Missing assigned line should return PendingData');

  const partialCommitCapacity = calculateCapacity(
    [{...bundle.planLines[0], committedQuantity: 10000, requestedQuantity: 32000}],
    bundle.productionLines,
    bundle.capabilities,
  );
  assert.ok((partialCommitCapacity[0]?.uncoveredQuantity ?? 0) > 0, 'Committed quantity lower than requested should produce uncovered quantity');

  const validationSummary = validateLongTermPlan(bundle.plan, bundle.planLines, bundle.productionLines, bundle.capabilities);
  const exceptions = buildExceptions(bundle.plan, [...validationSummary.errors, ...validationSummary.warnings], capacity, bundle.productionLines);
  assert.equal(canReleasePlan(bundle.plan, true, exceptions), false, 'Blocker exception should disable release');

  const rowViews = buildRowViews(bundle.planLines, bundle.productionLines, [], capacity, new Set(), false);
  const planningEvents = mapPlanningRowsToCalendarEvents(rowViews, capacity);
  const allEvents = [...bundle.calendarEvents, ...planningEvents];

  const yearSummary = getLongTermPlanningYearSummary(rowViews, capacity, allEvents, 2026);
  const totalRequested2026 = rowViews
    .filter((row) => row.month.startsWith('2026-'))
    .reduce((sum, row) => sum + row.requestedQuantity, 0);
  assert.equal(
    yearSummary.reduce((sum, month) => sum + month.requestedQuantity, 0),
    totalRequested2026,
    'Year summary should aggregate requested quantity correctly',
  );

  const juneSummary = getLongTermPlanningMonthSummary(rowViews, capacity, allEvents, '2026-06');
  assert.equal(juneSummary.committedQuantity, 95500, 'Month summary should aggregate committed quantity correctly');
  assert.equal(juneSummary.uncoveredQuantity, 13000, 'Uncovered quantity should aggregate correctly');

  assert.ok(
    planningEvents.some((event) => event.type === 'ConstrainedDemand' && event.productCode === 'FG-1001'),
    'Constrained rows should create ConstrainedDemand events',
  );
  assert.ok(
    planningEvents.some((event) => event.type === 'UncoveredDemand' && event.productCode === 'FG-1001'),
    'Rows with uncovered quantity should create UncoveredDemand events',
  );
  assert.ok(
    planningEvents.some((event) => event.type === 'CapacityOverload' && event.productCode === 'FG-1001'),
    'Capacity overload should create CapacityOverload event',
  );

  const shutdownDates = getCalendarEventsForDate(allEvents, '2026-07-07');
  assert.ok(
    shutdownDates.some((event) => event.type === 'AnnualShutdown'),
    'Multi-day events should appear on each date in the range',
  );
  assert.equal(
    getCalendarEventsForDate(allEvents, '2026-07-11').some((event) => event.type === 'AnnualShutdown'),
    false,
    'Multi-day events should stop after the range ends',
  );

  assert.equal(
    calculateCalendarSeverity({blockerCount: 1, warningCount: 4}),
    'Blocker',
    'Highest severity should be Blocker when blocker events exist',
  );

  const filteredRows = filterRows(rowViews, {
    productFamily: 'Standard Tubes',
    search: '',
    productionLine: '',
    status: '',
    demandSource: '',
    monthStart: bundle.plan.horizonStartMonth,
    monthEnd: bundle.plan.horizonEndMonth,
    onlyExceptions: false,
  });
  const filteredJuneSummary = getLongTermPlanningMonthSummary(filteredRows, capacity, allEvents, '2026-06');
  assert.equal(filteredJuneSummary.totalPlanningRows, 2, 'Filters should affect calendar summaries');

  const daySummary = getLongTermPlanningDaySummary(rowViews, capacity, allEvents, '2026-06-15');
  assert.equal(
    daySummary.fallbackMessage,
    'Demand Forecast is maintained at monthly level. This day view shows calendar events and the monthly planning summary for the selected period.',
    'Day summary should return monthly fallback message when no day-level planning exists',
  );
  assert.equal(daySummary.committedQuantity, 95500, 'Day summary should reuse monthly planning totals for the selected period');

  console.log('Demand Forecast tests passed: 22');
}

runTests();
