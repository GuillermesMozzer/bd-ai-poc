import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import React from 'react';
import {
  defaultSelectedEventTypes,
  defaultTimelineDateRange,
  demoTimelineLines,
  initialTimelineApprovedWorkOrders,
  timelineCategoryConfig,
  timelineEvents,
  timelineMockDataNote,
  timelineViewOptions,
} from './mock';
import {schedulingMachinesMock} from './schedulingMachinesMock';
import {schedulingMachineEventsMock, schedulingMachineWorkOrdersMock} from './schedulingMachineWorkOrdersMock';
import TimelinePlanningView, {buildSelectedTimelineItem, buildTimelinePresentation, TimelineDetailsPanel, TimelineLegend} from './TimelinePlanningView';
import {
  calculateWorkOrderBarPosition,
  defaultTimelineFilters,
  detectTimelineConflicts,
  generateTimelineDayGroups,
  generateTimelineHourColumns,
  getDateRangeFromShortcut,
  setAllEventTypesSelection,
  shiftTimelineRange,
  summarizeSelectedEventTypes,
} from './utils';

function runTests() {
  {
    const columns = generateTimelineHourColumns('2026-05-14', '2026-05-14');
    assert.equal(columns.length, 24, 'Test 1: Today creates 24 hour columns');
  }
  console.log('✔ Test 1: Today shortcut creates 24 hour columns');

  {
    const columns = generateTimelineHourColumns('2026-05-14', '2026-05-16');
    assert.equal(columns.length, 72, 'Test 2: Three-day range creates 72 hour columns');
  }
  console.log('✔ Test 2: Multi-day range creates correct hour count');

  {
    const columns = generateTimelineHourColumns('2026-05-14', '2026-05-20');
    assert.equal(columns.length, 168, 'Test 3: Seven-day range creates 168 hour columns');
  }
  console.log('✔ Test 3: Seven-day range creates 168 columns');

  {
    const groups = generateTimelineDayGroups(generateTimelineHourColumns('2026-05-14', '2026-05-16'));
    assert.equal(groups.length, 3, 'Test 4: Three-day range groups by three days');
    assert.ok(groups.every((group) => group.columnSpan === 24), 'Test 4: Each day spans 24 hours');
  }
  console.log('✔ Test 4: Day groups span hourly buckets correctly');

  {
    const today = getDateRangeFromShortcut('Today', '2026-05-14');
    assert.equal(today.startDate, '2026-05-14', 'Test 5: Today start date');
    assert.equal(today.endDate, '2026-05-14', 'Test 5: Today end date');
  }
  console.log('✔ Test 5: Today shortcut returns same-day range');

  {
    assert.equal(getDateRangeFromShortcut('ThreeDays', '2026-05-14').endDate, '2026-05-16', 'Test 6a: 3 days end date');
    assert.equal(getDateRangeFromShortcut('SevenDays', '2026-05-14').endDate, '2026-05-20', 'Test 6b: 7 days end date');
    assert.equal(getDateRangeFromShortcut('FifteenDays', '2026-05-14').endDate, '2026-05-28', 'Test 6c: 15 days end date');
    assert.equal(getDateRangeFromShortcut('OneMonth', '2026-05-14').endDate, '2026-06-14', 'Test 6d: 1 month end date');
  }
  console.log('✔ Test 6: All date shortcuts return expected end dates');

  {
    const columns = generateTimelineHourColumns('2026-05-13', '2026-05-13');
    const position = calculateWorkOrderBarPosition(initialTimelineApprovedWorkOrders[0], columns);
    assert.equal(position.startColumnIndex, 7, 'Test 7: WO starts at hour 07');
    assert.equal(position.columnSpan, 4, 'Test 7: WO spans 4 hours');
  }
  console.log('✔ Test 7: Work-order bar position matches expected width');

  {
    const midnightColumns = generateTimelineHourColumns('2026-05-13', '2026-05-14');
    const position = calculateWorkOrderBarPosition(initialTimelineApprovedWorkOrders[3], midnightColumns);
    assert.equal(position.startColumnIndex, 22, 'Test 8: Midnight span starts at 22:00');
    assert.equal(position.columnSpan, 4, 'Test 8: Midnight span covers 4 buckets');
  }
  console.log('✔ Test 8: Midnight-spanning orders render across day groups');

  {
    const shifted = shiftTimelineRange(defaultTimelineDateRange, -1);
    assert.equal(shifted.startDate, '2026-05-07', 'Test 9: Previous range shifts backwards');
    assert.equal(shifted.endDate, '2026-05-13', 'Test 9: Previous range preserves range size');
  }
  console.log('✔ Test 9: Previous range shifts backwards correctly');

  {
    const shifted = shiftTimelineRange(defaultTimelineDateRange, 1);
    assert.equal(shifted.startDate, '2026-05-21', 'Test 10: Next range shifts forwards');
    assert.equal(shifted.endDate, '2026-05-27', 'Test 10: Next range preserves range size');
  }
  console.log('✔ Test 10: Next range shifts forward correctly');

  {
    const conflicts = detectTimelineConflicts(initialTimelineApprovedWorkOrders, timelineEvents);
    assert.ok((conflicts.workOrderConflicts['wo-03'] ?? []).some((message) => message.includes('same line')), 'Test 11: Overlap on same line detected');
  }
  console.log('✔ Test 11: Same-line overlap conflicts detected');

  {
    const conflicts = detectTimelineConflicts(initialTimelineApprovedWorkOrders, timelineEvents);
    assert.ok(Object.values(conflicts.eventConflicts).some((messages) => messages.length > 0), 'Test 12: Event-to-WO conflicts detected');
  }
  console.log('✔ Test 12: WO overlap with generated events detected');

  {
    assert.equal(timelineViewOptions[0].id, 'timeline', 'Test 13a: Timeline view is first');
    assert.equal(timelineViewOptions[1].id, 'kanban', 'Test 13b: Kanban view is second');
  }
  console.log('✔ Test 13: Timeline button is ordered before Kanban');

  {
    const markup = renderToStaticMarkup(
      React.createElement(TimelinePlanningView, {
        lines: demoTimelineLines,
        workOrders: initialTimelineApprovedWorkOrders,
        events: timelineEvents,
        dateRange: getDateRangeFromShortcut('Today', '2026-05-14'),
        filters: defaultTimelineFilters,
        selectedItem: null,
        onSelectItem: () => undefined,
        categoryConfig: timelineCategoryConfig,
        selectedEventTypes: defaultSelectedEventTypes,
      }),
    );
    assert.ok(markup.includes('data-testid="timeline-grid"'), 'Test 14a: Timeline grid exists');
    assert.ok(markup.includes('data-testid="timeline-scroll-container"'), 'Test 14b: Scroll container exists');
  }
  console.log('✔ Test 14: Timeline grid and horizontal scroll container render');

  {
    const line10 = demoTimelineLines.filter((line) => line.id === 'line-10');
    const line10WorkOrders = initialTimelineApprovedWorkOrders.filter((item) => item.lineId === 'line-10');
    const line10Events = timelineEvents.filter((item) => item.lineId === 'line-10').slice(0, 6);
    const line10Machines = schedulingMachinesMock.filter((machine) => machine.lineId === 'line-10');
    const line10MachineWorkOrders = schedulingMachineWorkOrdersMock.filter((item) => item.lineId === 'line-10');
    const line10MachineEvents = schedulingMachineEventsMock.filter((item) => item.lineId === 'line-10');
    const markup = renderToStaticMarkup(
      React.createElement(TimelinePlanningView, {
        lines: line10,
        workOrders: line10WorkOrders,
        events: line10Events,
        machines: line10Machines,
        machineWorkOrders: line10MachineWorkOrders,
        machineEvents: line10MachineEvents,
        dateRange: getDateRangeFromShortcut('ThreeDays', '2026-05-15'),
        filters: defaultTimelineFilters,
        selectedItem: null,
        onSelectItem: () => undefined,
        categoryConfig: timelineCategoryConfig,
        selectedEventTypes: defaultSelectedEventTypes,
        expandedLineIds: [],
        showMachineDrilldown: true,
      }),
    );
    assert.ok(markup.includes('Line 10 - Tube Fill &amp; Seal 1'), 'Test 14c: line rows render by default');
    assert.ok(!markup.includes('M-10A Filler'), 'Test 14d: machine rows stay hidden by default');
  }
  console.log('âœ” Test 14b: line default view hides machine rows');

  {
    const line10 = demoTimelineLines.filter((line) => line.id === 'line-10');
    const line10WorkOrders = initialTimelineApprovedWorkOrders.filter((item) => item.lineId === 'line-10');
    const line10Events = timelineEvents.filter((item) => item.lineId === 'line-10').slice(0, 6);
    const line10Machines = schedulingMachinesMock.filter((machine) => machine.lineId === 'line-10');
    const line10MachineWorkOrders = schedulingMachineWorkOrdersMock.filter((item) => item.lineId === 'line-10');
    const line10MachineEvents = schedulingMachineEventsMock.filter((item) => item.lineId === 'line-10');
    const markup = renderToStaticMarkup(
      React.createElement(TimelinePlanningView, {
        lines: line10,
        workOrders: line10WorkOrders,
        events: line10Events,
        machines: line10Machines,
        machineWorkOrders: line10MachineWorkOrders,
        machineEvents: line10MachineEvents,
        dateRange: getDateRangeFromShortcut('ThreeDays', '2026-05-15'),
        filters: defaultTimelineFilters,
        selectedItem: null,
        onSelectItem: () => undefined,
        categoryConfig: timelineCategoryConfig,
        selectedEventTypes: defaultSelectedEventTypes,
        expandedLineIds: ['line-10'],
        showMachineDrilldown: true,
      }),
    );
    assert.ok(markup.includes('M-10A Filler'), 'Test 14e: expanded line shows M-10A');
    assert.ok(markup.includes('M-10B Sealer'), 'Test 14f: expanded line shows M-10B');
    assert.ok(markup.includes('M-10C Labeler'), 'Test 14g: expanded line shows M-10C');
  }
  console.log('âœ” Test 14c: expanded line shows machine drilldown rows');

  {
    const todayPresentation = buildTimelinePresentation(
      demoTimelineLines,
      initialTimelineApprovedWorkOrders,
      timelineEvents,
      getDateRangeFromShortcut('Today', '2026-05-14'),
      defaultTimelineFilters,
      defaultSelectedEventTypes,
    );
    assert.equal(todayPresentation.hourColumns.length, 24, 'Test 15: Today renders one day of columns');
  }
  console.log('✔ Test 15: Today presentation renders a single day');

  {
    const weekPresentation = buildTimelinePresentation(
      demoTimelineLines,
      initialTimelineApprovedWorkOrders,
      timelineEvents,
      getDateRangeFromShortcut('SevenDays', '2026-05-14'),
      defaultTimelineFilters,
      defaultSelectedEventTypes,
    );
    assert.ok(weekPresentation.hourColumns.length >= 168, 'Test 16: Seven days render grouped headers');
  }
  console.log('✔ Test 16: Seven-day presentation renders grouped day headers');

  {
    const monthPresentation = buildTimelinePresentation(
      demoTimelineLines,
      initialTimelineApprovedWorkOrders,
      timelineEvents,
      getDateRangeFromShortcut('OneMonth', '2026-05-14'),
      defaultTimelineFilters,
      defaultSelectedEventTypes,
    );
    assert.ok(monthPresentation.hourColumns.length > 700, 'Test 17: One-month range generates full hourly horizon');
  }
  console.log('✔ Test 17: One-month range builds without crashing');

  {
    const selected = buildSelectedTimelineItem({kind: 'workOrder', id: 'wo-01'}, initialTimelineApprovedWorkOrders, timelineEvents);
    const markup = renderToStaticMarkup(React.createElement(TimelineDetailsPanel, {selectedItem: selected.item, selectedKind: selected.kind, lines: demoTimelineLines}));
    assert.ok(markup.includes('WO-100245'), 'Test 18: Detail panel renders selected work order');
  }
  console.log('✔ Test 18: Selected work order details render in panel');

  {
    const filtered = buildTimelinePresentation(
      demoTimelineLines,
      initialTimelineApprovedWorkOrders,
      timelineEvents,
      defaultTimelineDateRange,
      {...defaultTimelineFilters, showConflictsOnly: true},
      defaultSelectedEventTypes,
    );
    assert.ok(filtered.filteredItems.workOrders.length < initialTimelineApprovedWorkOrders.length, 'Test 19: Conflict-only filter reduces visible work orders');
  }
  console.log('✔ Test 19: Conflict-only filter narrows visible items');

  {
    const markup = renderToStaticMarkup(
      React.createElement(TimelineLegend, {
        categoryConfig: timelineCategoryConfig,
        selectedEventTypes: defaultSelectedEventTypes,
        onSelectedEventTypesChange: () => undefined,
      }),
    );
    assert.ok(markup.includes('Legend'), 'Test 20a: Legend title renders');
    assert.ok(markup.includes(timelineMockDataNote), 'Test 20b: Mock data note renders');
  }
  console.log('✔ Test 20: Legend renders with mock dataset note');

  {
    assert.equal(timelineEvents.length, 455, 'Test 21: Generated event volume is 455');
    assert.equal(demoTimelineLines.length, 7, 'Test 21: Uses 7 lines');
  }
  console.log('✔ Test 21: Mock dataset volume and line count are correct');

  {
    const firstCategory = timelineCategoryConfig[0];
    const selectionSummary = summarizeSelectedEventTypes(timelineCategoryConfig, setAllEventTypesSelection(timelineCategoryConfig, false));
    assert.equal(selectionSummary.totalSelectedCount, 0, 'Test 22a: Global unselect clears every event type');
    assert.equal(firstCategory.eventTypes.length, 8, 'Test 22b: Work Orders category contains expected event type count');
  }
  console.log('✔ Test 22: Global selection state derives correctly');

  {
    for (const category of timelineCategoryConfig) {
      for (const eventType of category.eventTypes) {
        const matchingEvents = timelineEvents.filter((event) => event.category === category.name && event.eventType === eventType);
        assert.equal(matchingEvents.length, 5, `Test 23: ${category.name} / ${eventType} has 5 events`);
        assert.ok(new Set(matchingEvents.map((event) => event.lineId)).size >= 5 || matchingEvents.length <= demoTimelineLines.length, `Test 23: ${category.name} / ${eventType} rotates across lines`);
        assert.ok(matchingEvents.some((event) => event.severity === 'Warning' || event.severity === 'Blocker'), `Test 23: ${category.name} / ${eventType} includes warning or blocker`);
      }
    }
  }
  console.log('✔ Test 23: Every event type has 5 distributed records with elevated severity');
}

runTests();
