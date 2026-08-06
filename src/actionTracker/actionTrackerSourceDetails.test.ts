import assert from 'node:assert/strict';
import {getActionTrackerSourceDetails} from './utils.ts';

function runTests() {
  const sourceOnlyDetails = getActionTrackerSourceDetails({
    source: 'TMS 1',
    tierLevel: '1',
    originRecordId: '',
    originRecordLabel: '',
    meetingDate: '',
    originScreen: '',
  });

  assert.equal(sourceOnlyDetails.source, 'TMS 1', 'Source TMS 1 should be preserved');
  assert.equal(sourceOnlyDetails.showTierLevel, false, 'Tier Level should stay hidden when Source already contains the tier context');
  assert.equal(sourceOnlyDetails.reference, null, 'Empty Reference should not be displayed');
  assert.equal(sourceOnlyDetails.meetingDate, null, 'Empty Meeting Date should not be displayed');
  assert.equal(sourceOnlyDetails.showBackReference, false, 'Back Reference should stay hidden when no valid source record link exists');
  assert.equal(sourceOnlyDetails.hasAdditionalDetails, false, 'Source Details section should stay hidden when Source is the only populated value');

  const richSourceDetails = getActionTrackerSourceDetails({
    source: 'TMS 1',
    tierLevel: '1',
    originRecordLabel: 'KPI Deviation #12345',
    meetingDate: 'May 16, 2026',
    originScreen: 'tier-meeting',
  });

  assert.equal(richSourceDetails.source, 'TMS 1', 'Source should still be visible when additional source details exist');
  assert.equal(richSourceDetails.reference, 'KPI Deviation #12345', 'Reference should display when populated');
  assert.equal(richSourceDetails.meetingDate, 'May 16, 2026', 'Meeting Date should display when populated');
  assert.equal(richSourceDetails.showTierLevel, false, 'Tier Level should remain hidden for TMS 1 even when the raw tier value exists');
  assert.equal(richSourceDetails.showBackReference, true, 'Back Reference should display when a valid source record link exists');
  assert.equal(richSourceDetails.hasAdditionalDetails, true, 'Source Details section should display when populated source metadata exists');

  const genericSourceDetails = getActionTrackerSourceDetails({
    source: 'Tier Meeting',
    tierLevel: 'Level 1',
  });

  assert.equal(genericSourceDetails.showTierLevel, true, 'Tier Level should display separately when Source does not already include the tier context');

  console.log('Action Tracker source details tests passed: 13');
}

runTests();
