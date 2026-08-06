import assert from 'node:assert/strict';
import {
  buildTimelineRows,
  calculateLineMachineCount,
  calculateMachineUtilization,
  collapseAllLines,
  detectMachineOverlaps,
  expandAllLines,
  getMachineWorkOrders,
  toggleExpandedLine,
} from './schedulingMachineDrilldownUtils';
import {defaultTimelineDateRange} from './mock';
import {schedulingMachinesMock} from './schedulingMachinesMock';
import {schedulingMachineWorkOrdersMock} from './schedulingMachineWorkOrdersMock';
import {demoTimelineLines} from './mock';

function runTests() {
  {
    const rows = buildTimelineRows(demoTimelineLines, schedulingMachinesMock, [], true);
    assert.equal(rows.filter((row) => row.rowType === 'Line').length, 7, 'Test 1: no expanded lines keeps only line rows visible');
    assert.equal(rows.filter((row) => row.rowType === 'Machine').length, 0, 'Test 1: machine rows are hidden by default');
  }
  console.log('✔ Machine Test 1: buildTimelineRows keeps default line-only view');

  {
    const rows = buildTimelineRows(demoTimelineLines, schedulingMachinesMock, ['line-10'], true);
    assert.equal(rows.slice(0, 4).map((row) => row.id).join(','), 'line-10,machine-10a,machine-10b,machine-10c', 'Test 2: expanded line includes nested machines');
  }
  console.log('✔ Machine Test 2: expanded line returns machine rows in order');

  {
    assert.equal(calculateLineMachineCount('line-10', schedulingMachinesMock), 3, 'Test 3: Line 10 has 3 machines');
    assert.equal(calculateLineMachineCount('line-20', schedulingMachinesMock), 2, 'Test 4: Line 20 has 2 machines');
    assert.equal(calculateLineMachineCount('line-30', schedulingMachinesMock), 4, 'Test 5: Line 30 has 4 machines');
    assert.equal(calculateLineMachineCount('line-40', schedulingMachinesMock), 1, 'Test 6: Line 40 has 1 machine');
    assert.equal(calculateLineMachineCount('line-50', schedulingMachinesMock), 5, 'Test 7: Line 50 has 5 machines');
    assert.equal(calculateLineMachineCount('line-60', schedulingMachinesMock), 2, 'Test 8: Line 60 has 2 machines');
    assert.equal(calculateLineMachineCount('line-70', schedulingMachinesMock), 3, 'Test 9: Line 70 has 3 machines');
  }
  console.log('✔ Machine Test 3-9: machine counts per line are correct');

  {
    for (const machine of schedulingMachinesMock) {
      assert.ok(getMachineWorkOrders(machine.id, schedulingMachineWorkOrdersMock).length >= 3, `Test 10: ${machine.name} has at least 3 WOs`);
    }
  }
  console.log('✔ Machine Test 10: every machine has at least 3 work orders');

  {
    const expanded = toggleExpandedLine([], 'line-10');
    assert.ok(expanded.includes('line-10'), 'Test 11a: toggleExpandedLine expands a line');
    const collapsed = toggleExpandedLine(expanded, 'line-10');
    assert.ok(!collapsed.includes('line-10'), 'Test 11b: toggleExpandedLine collapses a line');
  }
  console.log('✔ Machine Test 11: toggleExpandedLine expands and collapses');

  {
    const allExpanded = expandAllLines(demoTimelineLines);
    assert.equal(allExpanded.length, demoTimelineLines.length, 'Test 12: expandAllLines expands every line');
    assert.equal(collapseAllLines().length, 0, 'Test 13: collapseAllLines clears expansion state');
  }
  console.log('✔ Machine Test 12-13: global expand/collapse utilities work');

  {
    const machineOrders = getMachineWorkOrders('machine-10a', schedulingMachineWorkOrdersMock);
    assert.equal(machineOrders.length, 3, 'Test 14: getMachineWorkOrders returns machine-specific items');
    assert.ok(machineOrders.every((item) => item.machineId === 'machine-10a'), 'Test 14: every returned item belongs to selected machine');
  }
  console.log('✔ Machine Test 14: machine work-order lookup works');

  {
    const overlaps = detectMachineOverlaps(schedulingMachineWorkOrdersMock);
    assert.ok(Object.keys(overlaps).length >= 3, 'Test 15: overlapping machine work orders are detected');
  }
  console.log('✔ Machine Test 15: overlap detection finds machine conflicts');

  {
    const utilization = calculateMachineUtilization('machine-10a', schedulingMachineWorkOrdersMock, defaultTimelineDateRange);
    assert.ok(utilization >= 0 && utilization <= 100, 'Test 16: machine utilization returns a valid percentage');
  }
  console.log('✔ Machine Test 16: machine utilization stays within valid range');
}

runTests();
