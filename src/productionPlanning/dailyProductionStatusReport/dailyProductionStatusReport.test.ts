import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import DailyProductionStatusReportPage from './DailyProductionStatusReportPage';
import {createDailyProductionStatusDemoBundle} from './mocks';
import {
  buildDowntimeSummary,
  buildProductionTrendData,
  calculateDailyProductionKpis,
  calculateLineAchievementPercent,
  calculateTotalsRow,
  calculateVarianceUnits,
  deriveAchievementStatus,
  deriveOnTimeStatus,
  deriveOeeStatus,
  deriveQualityYieldStatus,
  enrichProductionLine,
  filterProductionLines,
} from './utils';

function runTests() {
  const bundle = createDailyProductionStatusDemoBundle();

  assert.equal(calculateLineAchievementPercent(220000, 210500), 95.7, 'achievement percent should be calculated correctly');
  assert.equal(calculateVarianceUnits(220000, 210500), -9500, 'variance should be calculated correctly');

  const kpis = calculateDailyProductionKpis(bundle.productionLineStatuses, bundle.safetyIncidents);
  assert.equal(kpis.totalPlanUnits, 928500, 'total plan units should be calculated correctly');
  assert.equal(kpis.totalActualUnits, 855300, 'total actual units should be calculated correctly');
  assert.equal(kpis.totalVarianceUnits, -73200, 'total variance units should be calculated correctly');
  assert.equal(kpis.planAchievementPercent, 92.1, 'plan achievement should be calculated correctly');

  assert.equal(deriveAchievementStatus(90), 'green', 'achievement status should be green at target');
  assert.equal(deriveAchievementStatus(85), 'orange', 'achievement status should be orange in warning band');
  assert.equal(deriveAchievementStatus(70), 'red', 'achievement status should be red below threshold');

  assert.equal(deriveOeeStatus(90), 'green', 'oee status should be green at target');
  assert.equal(deriveOeeStatus(87), 'orange', 'oee status should be orange in warning band');
  assert.equal(deriveOeeStatus(70), 'red', 'oee status should be red below threshold');

  assert.equal(deriveQualityYieldStatus(95), 'green', 'quality yield status should be green at target');
  assert.equal(deriveQualityYieldStatus(92), 'orange', 'quality yield status should be orange in warning band');
  assert.equal(deriveQualityYieldStatus(88), 'red', 'quality yield status should be red below threshold');

  assert.equal(deriveOnTimeStatus(85), 'green', 'on-time status should be green at target');
  assert.equal(deriveOnTimeStatus(80), 'orange', 'on-time status should be orange in warning band');
  assert.equal(deriveOnTimeStatus(70), 'red', 'on-time status should be red below threshold');

  const downtimeSummary = buildDowntimeSummary(bundle.downtimeEvents);
  assert.equal(downtimeSummary[0]?.lineName, 'Line 30', 'downtime summary should sort by duration descending');
  assert.equal(downtimeSummary[1]?.lineName, 'Line 20', 'downtime summary should keep second longest event next');

  assert.equal(kpis.activeLines, 5, 'KPI calculation should ignore idle line for active lines');
  assert.equal(kpis.idleLines, 1, 'KPI calculation should count idle lines separately');

  const filteredStopped = filterProductionLines(bundle.productionLineStatuses, {
    status: 'All',
    lineId: 'All',
    productSearch: '',
    showOnlyGaps: false,
    showStoppedLinesOnly: true,
  });
  assert.equal(filteredStopped.length, 1, 'filter should show only stopped lines when requested');

  const line10 = bundle.productionLineStatuses.find((line) => line.lineId === 'line-10');
  assert.ok(line10, 'line 10 should exist in demo data');
  const editedLine10 = enrichProductionLine({...line10!, actualUnits: 220000});
  const editedKpis = calculateDailyProductionKpis(
    bundle.productionLineStatuses.map((line) => (line.lineId === 'line-10' ? editedLine10 : line)),
    bundle.safetyIncidents,
  );
  assert.ok(editedKpis.totalActualUnits > kpis.totalActualUnits, 'editing actual units should recalculate KPI totals');

  const totals = calculateTotalsRow(bundle.productionLineStatuses);
  assert.equal(totals.totalPlanUnits, 928500, 'totals row should include plan total');
  assert.equal(totals.totalActualUnits, 855300, 'totals row should include actual total');

  const trendData = buildProductionTrendData(bundle.productionLineStatuses);
  assert.equal(trendData.length, 8, 'trend data should include all demo lines');

  const html = renderToStaticMarkup(React.createElement(DailyProductionStatusReportPage));
  assert.ok(html.includes('Daily Production Status Report'), 'page should render title');
  assert.ok(html.includes('Track daily plan vs actual production'), 'page should render subtitle');
  assert.ok(html.includes('Production Status by Line'), 'page should render main table section');
  assert.ok(html.includes('Line 10'), 'page should render demo line rows');
  assert.ok(html.includes('TOTAL'), 'page should render total row');
  assert.ok(html.includes('Downtime Summary (Top 5)'), 'page should render downtime section');
  assert.ok(html.includes('Key Notes'), 'page should render key notes section');
  assert.ok(html.includes('Plan vs Actual Trend'), 'page should render trend section');
  assert.ok(html.includes('Save Report'), 'page should render save action');
  assert.ok(html.includes('Submit Report'), 'page should render submit action');

  console.log('Daily Production Status Report tests passed: 23');
}

runTests();
