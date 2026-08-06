import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

function readSource(relativePath: string) {
  return readFileSync(new URL(relativePath, import.meta.url), 'utf8');
}

function runTests() {
  const drawerSource = readSource('../workstation/components/ActionTrackerCreateDrawer.tsx');
  const storeSource = readSource('../workstation/components/actionTrackerStore.ts');
  const screenSource = readSource('./components/ActionTrackerScreen.tsx');
  const detailsSource = readSource('../workstation/components/ActionTrackerDetailsDialog.tsx');
  const widgetSource = readSource('../workstation/components/MyActionTrackerWidget.tsx');

  const whatHappenedIndex = drawerSource.indexOf('What happened?');
  const submitInfoIndex = drawerSource.indexOf('Submit info');
  const actionTitleIndex = drawerSource.indexOf('Action title');
  const aiSuggestionsIndex = drawerSource.indexOf('AI suggestions');
  const acceptSuggestionIndex = drawerSource.indexOf('Accept suggestion');
  const cancelIndex = drawerSource.lastIndexOf('Cancel');
  const sendIndex = drawerSource.lastIndexOf('Send');

  assert.notEqual(whatHappenedIndex, -1, 'What Happened / Description should be rendered in the New Action modal');
  assert.notEqual(submitInfoIndex, -1, 'Submit info should be rendered in the initial New Action step');
  assert.notEqual(actionTitleIndex, -1, 'Action Title should be rendered in the New Action modal');
  assert.notEqual(aiSuggestionsIndex, -1, 'AI suggestions should still render after the Action Title field');
  assert.notEqual(cancelIndex, -1, 'Cancel should remain visible in the modal footer');
  assert.notEqual(sendIndex, -1, 'Send should exist for the final detail step');

  assert.ok(
    whatHappenedIndex < submitInfoIndex && submitInfoIndex < actionTitleIndex && actionTitleIndex < aiSuggestionsIndex,
    'Action Title should appear after What Happened and Submit info, and before the AI suggestions grid',
  );
  assert.ok(
    submitInfoIndex < cancelIndex && cancelIndex < sendIndex,
    'Submit info should appear before the footer actions, and Send should remain part of the later detail-step flow',
  );

  assert.match(
    drawerSource,
    /Enter a short title that summarizes the action\./,
    'Action Title should show the required helper text copy',
  );
  assert.match(
    drawerSource,
    /Example: Replace damaged safety guard on Line 3/,
    'Action Title should show the required placeholder copy',
  );

  assert.equal(
    drawerSource.slice(aiSuggestionsIndex, acceptSuggestionIndex).includes('Action title'),
    false,
    'Action Title should not be rendered inside the AI suggestions grid',
  );
  assert.match(
    drawerSource,
    /const canSubmitProblem = !isTypingSuggestion && voiceDemoState === 'idle';/,
    'Submit info should stay clickable in the initial step so validation can run even when What Happened is empty',
  );
  assert.match(
    drawerSource,
    /const handleProblemSubmit = \(\) => \{[\s\S]*setHasSubmittedProblem\(true\);[\s\S]*if \(!normalizedProblem \|\| isTypingSuggestion\) return;/m,
    'Submitting the initial What Happened step should first mark the step as submitted, then stop and show validation when the description is empty',
  );
  assert.match(
    drawerSource,
    /const shouldShowActionDetails = suggestionAccepted \|\| \(\!\!actionCreateContext\) \|\| \(!assistantEnabled && hasSubmittedProblem\);/,
    'Valid Submit info should advance the flow into the manual action detail step',
  );
  assert.match(
    drawerSource,
    /\{shouldShowActionDetails \? \([\s\S]*Send[\s\S]*\) : null\}/m,
    'Send should only be rendered after the action detail entry step is displayed',
  );
  assert.equal(
    drawerSource.slice(whatHappenedIndex, sendIndex).includes('{shouldShowActionDetails ? ('),
    true,
    'The initial What Happened step should not render the footer Send button until the detail step condition is met',
  );

  assert.match(
    drawerSource,
    /draft\.title\.trim\(\)\.length > 0[\s\S]*draft\.problem\.trim\(\)\.length > 0/m,
    'Action Title and What Happened should both be required before Create Action is enabled',
  );

  assert.equal(
    drawerSource.includes('buildTitleFromProblem'),
    false,
    'No auto-generated title behavior should remain in the current implementation',
  );
  assert.equal(
    drawerSource.includes('const nextTitle'),
    false,
    'The drawer should not generate a transient AI title while drafting suggestions',
  );

  assert.match(
    storeSource,
    /title:\s*draft\.title\.trim\(\),[\s\S]*problem:\s*draft\.problem\.trim\(\),/m,
    'Action creation should store Action Title and What Happened separately',
  );

  assert.match(
    screenSource,
    /\{row\.title\}/,
    'Action Title should be used as the primary label in Action Tracker list renders',
  );
  assert.match(
    detailsSource,
    /detail:\s*currentItem\.problem,[\s\S]*title:\s*currentItem\.title,/m,
    'Action details should carry title as the primary label and problem as the detailed description',
  );
  assert.match(
    widgetSource,
    /\{row\.problem\}/,
    'Detailed What Happened text should remain available in configured table/problem displays',
  );

  console.log('Action Tracker create title flow tests passed: 19');
}

runTests();
