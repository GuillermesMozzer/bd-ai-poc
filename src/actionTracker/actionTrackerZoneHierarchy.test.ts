import assert from 'node:assert/strict';
import {createActionTrackerItem} from '../workstation/components/actionTrackerStore';
import {
  getActionTrackerZoneOptionsByLine,
  resolveActionTrackerScope,
} from './utils';

function runTests() {
  assert.deepEqual(
    getActionTrackerZoneOptionsByLine('TJ1', 'Facilities', 'Infrastructure', 'Line Support'),
    [],
    'line support should not expose area values as zone options',
  );

  assert.equal(
    resolveActionTrackerScope({
      plant: 'TJ1',
      area: 'Facilities',
      unit: 'Infrastructure',
      line: 'Line Support',
      zone: 'Facilities',
    }).zone,
    '',
    'zone should be cleared when it duplicates an invalid parent value',
  );

  assert.equal(
    resolveActionTrackerScope({
      location: 'Building A, 2nd Floor',
    }).zone,
    '',
    'legacy location fallback should not invent a zone',
  );

  assert.equal(
    resolveActionTrackerScope({
      plant: 'TJ1',
      area: 'Packaging',
      unit: 'Packaging Unit 1',
      line: 'Line 3',
      zone: 'Zone 1',
    }).zone,
    'Zone 1',
    'valid zone values should still be preserved under the selected line',
  );

  const created = createActionTrackerItem(
    {
      title: 'Validate line support airflow',
      problem: 'Air handler needs inspection after pressure drift.',
      type: 'Corrective',
      category: 'PEOPLE',
      plant: 'TJ1',
      area: 'Facilities',
      unit: 'Infrastructure',
      line: 'Line Support',
      zone: 'Facilities',
      machine: 'Air Handler AH-03',
      priority: 'Medium',
      location: 'Building A, 2nd Floor',
      dueDate: 'Jun 20, 2026',
      createdBy: 'Bruno Ramos',
      assignedTo: 'James Miller',
      approver: 'Madison Brooks',
      supportNeeded: false,
      supportOwner: '',
      aiAssisted: false,
      attachments: [],
    },
    [],
    'Bruno Ramos',
  );

  assert.equal(created.zone, undefined, 'created actions should not persist invalid zone values');
  assert.equal(created.line, 'Line Support', 'line should remain mapped correctly for facilities records');

  console.log('Action Tracker zone hierarchy tests passed: 6');
}

runTests();
