import assert from 'node:assert/strict';
import {createLTDemoBundle, createSTDemoBundle, LT_PERIODS, ST_PERIODS} from './mock';
import {
  buildBaselineImpactRows,
  buildPeriodSummaryRows,
  buildScenarioExceptions,
  buildSuggestedActions,
  calculateScenarioImpactSummary,
  calculateTopImpactedProducts,
  createScenarioAuditEvent,
  deriveCapacityStatus,
  deriveReadinessStatus,
  deriveStockStatus,
  applyScenarioToWorkingState,
  duplicateScenario,
  runScenarioSimulation,
} from './utils';
import type {ScenarioChange} from './types';

function runTests() {
  const ltBundle = createLTDemoBundle();
  const stBundle = createSTDemoBundle();

  // ── Test 1: Long-Term scenario applies demand increase to monthly periods ─────
  {
    const demandChange: ScenarioChange = {
      id: 'test-chg-1', scenarioId: 'test', category: 'DemandChange',
      title: 'Test Demand', description: 'Test', active: true, severity: 'Warning',
      startPeriod: 'Jul 2026', endPeriod: 'Dec 2026', valueType: 'Percentage',
      baselineValue: 0, scenarioValue: 20, deltaValue: 20,
    };
    const rows = buildBaselineImpactRows('test', [demandChange], LT_PERIODS, 'Month');
    const julRows = rows.filter((r) => r.period === 'Jul 2026');
    assert.ok(julRows.length > 0, 'Test 1: Jul 2026 rows exist');
    const junRows = rows.filter((r) => r.period === 'Jun 2026');
    const julFG1001 = julRows.find((r) => r.productCode === 'FG-1001');
    const junFG1001 = junRows.find((r) => r.productCode === 'FG-1001');
    assert.ok(julFG1001 && junFG1001, 'Test 1: FG-1001 rows found for both months');
    assert.ok(
      julFG1001!.scenarioRequestedQuantity > junFG1001!.scenarioRequestedQuantity,
      `Test 1: Jul scenario demand (${julFG1001!.scenarioRequestedQuantity}) > Jun baseline demand (${junFG1001!.scenarioRequestedQuantity})`,
    );
  }
  console.log('✔ Test 1: LT demand change applied to monthly periods');

  // ── Test 2: Short-Term scenario applies changes to weekly periods ─────────────
  {
    const rows = buildBaselineImpactRows(stBundle.scenario.id, stBundle.changes, ST_PERIODS, 'Week');
    const week3Rows = rows.filter((r) => r.period === 'Week 3');
    assert.ok(week3Rows.length > 0, 'Test 2: Week 3 rows exist in ST scenario');
    const fg1001W3 = week3Rows.find((r) => r.productCode === 'FG-1001');
    assert.ok(fg1001W3, 'Test 2: FG-1001 exists in Week 3');
    // ST change is +15% for FG-1001 in Week 3
    assert.ok(fg1001W3!.scenarioRequestedQuantity > fg1001W3!.baselineRequestedQuantity,
      `Test 2: FG-1001 Week 3 scenario qty (${fg1001W3!.scenarioRequestedQuantity}) > baseline (${fg1001W3!.baselineRequestedQuantity})`);
  }
  console.log('✔ Test 2: ST scenario applies changes to weekly periods');

  // ── Test 3: Capacity reduction increases utilization ──────────────────────────
  {
    const capChange: ScenarioChange = {
      id: 'test-chg-cap', scenarioId: 'test', category: 'CapacityChange',
      title: 'Cap Reduce', description: '', active: true, severity: 'Warning',
      lineId: 'Line 20', startPeriod: 'Aug 2026', endPeriod: 'Sep 2026',
      valueType: 'Percentage', baselineValue: 100, scenarioValue: 85, deltaValue: -15,
    };
    const rows = buildBaselineImpactRows('test', [capChange], LT_PERIODS, 'Month');
    const augRows = rows.filter((r) => r.period === 'Aug 2026' && r.productCode === 'FG-2001');
    assert.ok(augRows.length > 0, 'Test 3: Aug 2026 Line 20 product rows exist');
    const row = augRows[0];
    assert.ok(
      row.scenarioUtilizationPercent > row.baselineUtilizationPercent,
      `Test 3: Scenario util (${row.scenarioUtilizationPercent}%) > baseline (${row.baselineUtilizationPercent}%) when capacity reduced`,
    );
  }
  console.log('✔ Test 3: Capacity reduction increases utilization');

  // ── Test 4: Line downtime reduces available hours ─────────────────────────────
  {
    const downtimeChange: ScenarioChange = {
      id: 'test-chg-down', scenarioId: 'test', category: 'CalendarEvent',
      title: 'Line Down', description: '', active: true, severity: 'Blocker',
      lineId: 'Line 10', startPeriod: 'Jul 06', endPeriod: 'Jul 10, 2026',
      valueType: 'Days', baselineValue: 0, scenarioValue: 5, deltaValue: -5,
    };
    const rows = buildBaselineImpactRows('test', [downtimeChange], LT_PERIODS, 'Month');
    const julLine10 = rows.filter((r) => r.period === 'Jul 2026' && (r.productCode === 'FG-1001' || r.productCode === 'FG-1002'));
    assert.ok(julLine10.length > 0, 'Test 4: Jul 2026 Line 10 rows exist');
    assert.ok(
      julLine10[0].scenarioAvailableHours < julLine10[0].baselineAvailableHours,
      `Test 4: Scenario available hours (${julLine10[0].scenarioAvailableHours}) < baseline (${julLine10[0].baselineAvailableHours})`,
    );
  }
  console.log('✔ Test 4: Line downtime reduces available hours');

  // ── Test 5: Utilization above 100% creates Overloaded status ──────────────────
  {
    assert.equal(deriveCapacityStatus(100.1), 'Overloaded', 'Test 5a: 100.1% → Overloaded');
    assert.equal(deriveCapacityStatus(100), 'AtRisk', 'Test 5b: 100% → AtRisk (boundary)');
    assert.equal(deriveCapacityStatus(95), 'AtRisk', 'Test 5c: 95% → AtRisk');
    assert.equal(deriveCapacityStatus(89), 'Feasible', 'Test 5d: 89% → Feasible');
  }
  console.log('✔ Test 5: Utilization thresholds derive correct capacity status');

  // ── Test 6: Stock below minimum creates BelowMin status ───────────────────────
  {
    assert.equal(deriveStockStatus(1000, 2000, 5000), 'BelowMin', 'Test 6a: stock < min → BelowMin');
    assert.equal(deriveStockStatus(3000, 2000, 5000), 'OK', 'Test 6b: min ≤ stock ≤ max → OK');
    assert.equal(deriveStockStatus(6000, 2000, 5000), 'AboveMax', 'Test 6c: stock > max → AboveMax');
  }
  console.log('✔ Test 6: Stock below minimum creates BelowMin status');

  // ── Test 7: Any blocker creates MRP readiness NotReady ────────────────────────
  {
    assert.equal(deriveReadinessStatus('Overloaded', 'OK'), 'NotReady', 'Test 7a: Overloaded → NotReady');
    assert.equal(deriveReadinessStatus('Feasible', 'BelowMin'), 'NotReady', 'Test 7b: BelowMin → NotReady');
    assert.equal(deriveReadinessStatus('Feasible', 'OK'), 'Ready', 'Test 7c: Feasible + OK → Ready');
    assert.equal(deriveReadinessStatus('AtRisk', 'OK'), 'Ready', 'Test 7d: AtRisk alone → Ready');
  }
  console.log('✔ Test 7: Readiness status derivation');

  // ── Test 8: Impact summary calculates demand change units ─────────────────────
  {
    const summary = ltBundle.impactSummary;
    assert.ok(summary.demandChangeUnits > 0, `Test 8: Demand change units (${summary.demandChangeUnits}) > 0`);
    assert.ok(summary.demandChangePercent > 0, `Test 8: Demand change percent (${summary.demandChangePercent}) > 0`);
  }
  console.log('✔ Test 8: Impact summary demand change units calculated');

  // ── Test 9: Top impacted products sorted by uncovered delta ───────────────────
  {
    const rows = ltBundle.impactRows;
    const top = calculateTopImpactedProducts(rows);
    assert.ok(top.length > 0, 'Test 9: Top impacted products list is not empty');
    for (let i = 0; i < top.length - 1; i++) {
      assert.ok(
        Math.abs(top[i].uncoveredDelta) >= Math.abs(top[i + 1].uncoveredDelta),
        `Test 9: Products sorted by |uncoveredDelta| desc (${top[i].uncoveredDelta} >= ${top[i + 1].uncoveredDelta})`,
      );
    }
  }
  console.log('✔ Test 9: Top impacted products sorted by uncovered delta');

  // ── Test 10: Suggested actions generated for capacity overload ───────────────
  {
    const exceptions = ltBundle.exceptions;
    const actions = buildSuggestedActions(ltBundle.scenario.id, exceptions, ltBundle.impactRows);
    const hasCapacityAction = actions.some((a) => a.category === 'AddCapacity' || a.category === 'MoveDemand');
    assert.ok(hasCapacityAction, 'Test 10: Suggested actions include capacity-related action');
  }
  console.log('✔ Test 10: Suggested actions generated for capacity overload');

  // ── Test 11: Comparison shows baseline vs scenario deltas ────────────────────
  {
    const rows = ltBundle.impactRows;
    const changed = rows.filter((r) => r.scenarioRequestedQuantity !== r.baselineRequestedQuantity);
    assert.ok(changed.length > 0, 'Test 11: Some rows have baseline vs scenario difference');
    for (const row of changed.slice(0, 3)) {
      const delta = row.scenarioRequestedQuantity - row.baselineRequestedQuantity;
      assert.ok(delta !== 0, `Test 11: Row ${row.productCode} ${row.period} has non-zero delta`);
    }
  }
  console.log('✔ Test 11: Comparison rows show baseline vs scenario deltas');

  // ── Test 12: Applying scenario mutates only local working state ───────────────
  {
    const before = ltBundle.scenario.status;
    const {appliedScenario} = applyScenarioToWorkingState(ltBundle.scenario, ltBundle.impactRows);
    assert.equal(appliedScenario.status, 'Applied', 'Test 12: Applied scenario status is Applied');
    assert.ok(appliedScenario !== ltBundle.scenario, 'Test 12: Applied scenario is a new object');
    assert.ok(before !== 'Applied', 'Test 12: Original scenario was not Applied');
    assert.equal(ltBundle.scenario.status, before, 'Test 12: Original scenario status unchanged');
  }
  console.log('✔ Test 12: Applying scenario returns new objects without mutating originals');

  // ── Test 13: Duplicating scenario creates a new scenario id ──────────────────
  {
    const {scenario: dup, changes: dupChanges} = duplicateScenario(ltBundle.scenario, ltBundle.changes);
    assert.ok(dup.id !== ltBundle.scenario.id, `Test 13: Duplicate id (${dup.id}) differs from original (${ltBundle.scenario.id})`);
    assert.ok(dup.name.includes('Copy'), `Test 13: Duplicate name includes "Copy": ${dup.name}`);
    assert.equal(dup.status, 'Draft', 'Test 13: Duplicate status is Draft');
    assert.equal(dupChanges.length, ltBundle.changes.length, 'Test 13: Duplicate has same number of changes');
    for (const dc of dupChanges) {
      assert.equal(dc.scenarioId, dup.id, `Test 13: Duplicate change scenarioId matches new scenario id`);
    }
  }
  console.log('✔ Test 13: Duplicating scenario creates a new id and resets status');

  // ── Test 14: Audit event is created when scenario is simulated ───────────────
  {
    const event = createScenarioAuditEvent('test-id', 'ScenarioSimulated', 'Maya Planner', 'Draft', 'Simulated', 'Test run');
    assert.equal(event.scenarioId, 'test-id', 'Test 14: Audit event scenarioId set');
    assert.equal(event.eventType, 'ScenarioSimulated', 'Test 14: Audit event type is ScenarioSimulated');
    assert.equal(event.user, 'Maya Planner', 'Test 14: Audit event user set');
    assert.equal(event.previousValue, 'Draft', 'Test 14: Audit event previousValue set');
    assert.equal(event.newValue, 'Simulated', 'Test 14: Audit event newValue set');
    assert.ok(event.id.startsWith('ae-'), 'Test 14: Audit event id starts with ae-');
  }
  console.log('✔ Test 14: Audit event created with correct fields on simulation');

  // ── Test 15: LT scenario loads with default type LongTerm ────────────────────
  {
    assert.equal(ltBundle.scenario.type, 'LongTerm', 'Test 15: Default bundle type is LongTerm');
  }
  console.log('✔ Test 15: Default scenario type is LongTerm');

  // ── Test 16: ST scenario has weekly periods ───────────────────────────────────
  {
    const stRows = stBundle.impactRows;
    const allPeriods = new Set(stRows.map((r) => r.period));
    assert.ok(allPeriods.has('Week 1'), 'Test 16: ST rows include Week 1');
    assert.ok(allPeriods.has('Week 4'), 'Test 16: ST rows include Week 4');
    assert.ok(stRows.every((r) => r.bucketType === 'Week'), 'Test 16: All ST rows have bucketType Week');
  }
  console.log('✔ Test 16: Short-Term scenario uses weekly periods');

  // ── Test 17: runScenarioSimulation returns all required outputs ──────────────
  {
    const result = runScenarioSimulation(ltBundle.scenario, ltBundle.changes, LT_PERIODS, 'Month');
    assert.ok(result.impactRows.length > 0, 'Test 17: impactRows not empty');
    assert.ok(result.periodSummaryRows.length === LT_PERIODS.length, `Test 17: periodSummaryRows length (${result.periodSummaryRows.length}) matches period count`);
    assert.ok(result.impactSummary.demandChangeUnits > 0, 'Test 17: impactSummary.demandChangeUnits > 0');
    assert.ok(result.exceptions.length > 0, 'Test 17: exceptions not empty');
    assert.ok(result.suggestedActions.length > 0, 'Test 17: suggestedActions not empty');
    assert.ok(result.chartData.length === LT_PERIODS.length, 'Test 17: chartData length matches periods');
  }
  console.log('✔ Test 17: runScenarioSimulation returns all required outputs');

  // ── Test 18: Exceptions include MRP readiness blocker when overloaded ────────
  {
    const exceptions = ltBundle.exceptions;
    const mrpExc = exceptions.find((e) => e.category === 'MRPReadiness');
    assert.ok(mrpExc, 'Test 18: MRPReadiness exception exists when scenario has blockers');
    assert.equal(mrpExc!.severity, 'Blocker', 'Test 18: MRPReadiness exception is a Blocker');
  }
  console.log('✔ Test 18: Exceptions include MRP readiness blocker when overloaded');

  console.log('\n✅ All Scenario Planning tests passed.');
}

runTests();
