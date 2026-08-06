import assert from 'node:assert/strict';
import {createActionTrackerItem} from '../workstation/components/actionTrackerStore';
import {
  buildDueDateExtensionChange,
  buildReassignmentChange,
  defaultActionTrackerWorkflowConfig,
} from './workflow';
import {
  getActionTrackerAttachmentKind,
  getActionTrackerVisibleStatus,
  isImplementedSolutionPresent,
} from './utils';
import type {ActionTrackerAttachment} from './types';

function runTests() {
  const attachment: ActionTrackerAttachment = {
    id: 'att-1',
    name: 'evidence-photo.png',
    mimeType: 'image/png',
    size: 2048,
    dataUrl: 'data:image/png;base64,abc',
  };

  const created = createActionTrackerItem(
    {
      title: 'Investigate recurring leak',
      problem: 'Water leak continues near the palletizer.',
      type: 'Corrective',
      category: 'PEOPLE',
      plant: 'TJ1',
      area: 'Packaging',
      unit: 'Packaging Unit 1',
      line: 'Line 3',
      zone: 'Zone 1',
      machine: 'Palletizer PL-22',
      priority: 'High',
      location: 'Packaging Area',
      dueDate: 'Jun 08, 2026',
      createdBy: 'Bruno Ramos',
      assignedTo: 'James Miller',
      approver: 'Madison Brooks',
      supportNeeded: false,
      supportOwner: '',
      aiAssisted: false,
      attachments: [attachment],
    },
    [],
    'Bruno Ramos',
  );

  assert.equal(created.status, 'Open', 'newly created actions should still start as Open');
  assert.equal(created.attachments?.length, 1, 'attachments should persist on newly created actions');
  assert.equal(created.implementedSolution, '', 'implemented solution should default to empty');
  assert.equal(created.dueDateExtensionCount, 0, 'newly created actions should start with no due date extensions');
  assert.equal(created.reassignmentCount, 0, 'newly created actions should start with no reassignments');
  assert.deepEqual(created.dueDateExtensionHistory, [], 'newly created actions should start with empty due date extension history');
  assert.deepEqual(created.reassignmentHistory, [], 'newly created actions should start with empty reassignment history');

  const reassignment = buildReassignmentChange(
    created,
    'James Miller',
    'Olivia Martin',
    'Balancing ownership across shifts.',
    defaultActionTrackerWorkflowConfig.reassignment,
    1717526400000,
  );
  assert.equal(reassignment.ok, true, 'authorized reassignment should not require Created By approval');
  if (reassignment.ok) {
    assert.equal(reassignment.updates.assignedTo, 'Olivia Martin', 'authorized reassignment should update the owner directly');
    assert.equal(reassignment.updates.reassignmentCount, 1, 'authorized reassignment should increment the reassignment counter');
    assert.equal(reassignment.historyEntry.previousOwner, 'James Miller', 'reassignment history should preserve the previous owner');
    assert.equal(reassignment.historyEntry.newOwner, 'Olivia Martin', 'reassignment history should preserve the new owner');
    assert.equal(reassignment.historyEntry.changedBy, 'James Miller', 'reassignment history should preserve who made the change');
    assert.equal(reassignment.historyEntry.justification, 'Balancing ownership across shifts.', 'reassignment history should preserve justification');
    assert.equal(reassignment.historyEntry.eventStatus, 'Completed', 'reassignment history should preserve completed status');
  }

  const blockedReassignment = buildReassignmentChange(
    created,
    'Unauthorized User',
    'Olivia Martin',
    'Trying without permission.',
    defaultActionTrackerWorkflowConfig.reassignment,
  );
  assert.equal(blockedReassignment.ok, false, 'unauthorized reassignment should be blocked');
  if (!blockedReassignment.ok) {
    assert.equal(blockedReassignment.reason, 'unauthorized', 'unauthorized reassignment should fail with unauthorized reason');
  }

  const dueDateExtension = buildDueDateExtensionChange(
    created,
    'James Miller',
    'Jun 12, 2026',
    'Supplier validation moved out by two days.',
    defaultActionTrackerWorkflowConfig.dueDateExtension,
    1717612800000,
  );
  assert.equal(dueDateExtension.ok, true, 'authorized due date extension should not require Created By approval');
  if (dueDateExtension.ok) {
    assert.equal(dueDateExtension.updates.dueDate, 'Jun 12, 2026', 'authorized due date extension should update the due date directly');
    assert.equal(dueDateExtension.updates.dueDateExtensionCount, 1, 'authorized due date extension should increment the extension counter');
    assert.equal(dueDateExtension.historyEntry.originalDueDate, 'Jun 08, 2026', 'due date history should preserve original due date');
    assert.equal(dueDateExtension.historyEntry.newDueDate, 'Jun 12, 2026', 'due date history should preserve new due date');
    assert.equal(dueDateExtension.historyEntry.changedBy, 'James Miller', 'due date history should preserve who made the change');
    assert.equal(dueDateExtension.historyEntry.justification, 'Supplier validation moved out by two days.', 'due date history should preserve justification');
    assert.equal(dueDateExtension.historyEntry.eventStatus, 'Completed', 'due date history should preserve completed status');
  }

  const blockedDueDateExtension = buildDueDateExtensionChange(
    created,
    'Unauthorized User',
    'Jun 12, 2026',
    'Trying without permission.',
    defaultActionTrackerWorkflowConfig.dueDateExtension,
  );
  assert.equal(blockedDueDateExtension.ok, false, 'unauthorized due date extension should be blocked');
  if (!blockedDueDateExtension.ok) {
    assert.equal(blockedDueDateExtension.reason, 'unauthorized', 'unauthorized due date extension should fail with unauthorized reason');
  }

  const optionalJustificationConfig = {
    ...defaultActionTrackerWorkflowConfig.reassignment,
    requireJustification: false,
  };
  const reassignmentWithoutJustification = buildReassignmentChange(
    created,
    'James Miller',
    'Olivia Martin',
    '',
    optionalJustificationConfig,
  );
  assert.equal(reassignmentWithoutJustification.ok, true, 'justification should be optional only where configured');

  const requiredJustificationConfig = {
    ...defaultActionTrackerWorkflowConfig.dueDateExtension,
    requireJustification: true,
  };
  const defaultRequiredReassignment = buildReassignmentChange(
    created,
    'James Miller',
    'Olivia Martin',
    '',
    defaultActionTrackerWorkflowConfig.reassignment,
  );
  assert.equal(defaultRequiredReassignment.ok, false, 'reassignment justification should be required by default');
  if (!defaultRequiredReassignment.ok) {
    assert.equal(defaultRequiredReassignment.reason, 'missing_justification', 'default reassignment flow should require justification');
  }
  const requiredJustificationFailure = buildDueDateExtensionChange(
    created,
    'James Miller',
    'Jun 12, 2026',
    '',
    requiredJustificationConfig,
  );
  assert.equal(requiredJustificationFailure.ok, false, 'justification should be required where configured');
  if (!requiredJustificationFailure.ok) {
    assert.equal(requiredJustificationFailure.reason, 'missing_justification', 'required justification should fail with missing_justification');
  }

  assert.equal(
    getActionTrackerVisibleStatus({status: 'Reopened', dueDate: 'Apr 01, 2026'}),
    'Reopened',
    'Reopened should remain visible as its own status instead of being converted to Overdue',
  );
  assert.equal(
    getActionTrackerVisibleStatus({status: 'Open', dueDate: 'Apr 01, 2026'}),
    'Overdue',
    'Open actions past the reference date should still surface as Overdue',
  );
  assert.equal(
    getActionTrackerVisibleStatus({status: 'In Progress', dueDate: 'Apr 01, 2026'}),
    'Overdue',
    'In Progress actions past the reference date should still surface as Overdue',
  );

  assert.equal(isImplementedSolutionPresent('   '), false, 'blank implemented solutions should not pass validation');
  assert.equal(isImplementedSolutionPresent('Containment verified and seal replaced.'), true, 'non-empty implemented solutions should pass validation');

  assert.equal(getActionTrackerAttachmentKind(attachment), 'image', 'image attachments should render as previews');
  assert.equal(
    getActionTrackerAttachmentKind({name: 'investigation.pdf', mimeType: 'application/pdf'}),
    'pdf',
    'pdf attachments should render in preview mode when supported',
  );
  assert.equal(
    getActionTrackerAttachmentKind({name: 'notes.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'}),
    'download',
    'non-previewable file types should remain downloadable only',
  );

  console.log('Action Tracker enhancement tests passed: 25');
}

runTests();
