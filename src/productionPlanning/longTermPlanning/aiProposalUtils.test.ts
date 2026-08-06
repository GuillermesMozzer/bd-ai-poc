import * as assert from 'node:assert/strict';
import {generateLongTermAiProposalMock} from './aiProposalMock';
import {
  acceptAiProposalLocally,
  acceptCommitmentRecommendation,
  acceptSelectedCommitmentRecommendations,
  acknowledgeLongTermRisk,
  calculateCommitmentPercent,
  calculateForecastVariancePercent,
  calculateRequiredHours,
  calculateUncoveredDemand,
  calculateUtilizationPercent,
  rejectAiProposalLocally,
  rejectCommitmentRecommendation,
  resolveLongTermRisk,
  selectLongTermScenario,
} from './aiProposalUtils';

function runTests() {
  // --- Pure calculation utilities ---

  assert.equal(
    calculateForecastVariancePercent(145000, 119000),
    21.8,
    'Test 1: calculateForecastVariancePercent returns correct positive variance',
  );

  assert.equal(
    calculateForecastVariancePercent(73000, 92000),
    -20.7,
    'Test 1b: calculateForecastVariancePercent returns correct negative variance',
  );

  assert.equal(
    calculateRequiredHours(145000, 1700),
    85.3,
    'Test 2: calculateRequiredHours returns correct hours',
  );

  assert.equal(
    calculateRequiredHours(145000, 0),
    0,
    'Test 2b: calculateRequiredHours returns 0 when production rate is 0',
  );

  assert.equal(
    calculateUtilizationPercent(85.3, 92),
    92.7,
    'Test 3: calculateUtilizationPercent returns correct percentage',
  );

  assert.equal(
    calculateUtilizationPercent(0, 0),
    0,
    'Test 3b: calculateUtilizationPercent returns 0 when availableHours is 0',
  );

  assert.equal(
    calculateCommitmentPercent(80000, 92000),
    87.0,
    'Test 4: calculateCommitmentPercent returns correct percentage',
  );

  assert.equal(
    calculateCommitmentPercent(145000, 145000),
    100.0,
    'Test 4b: calculateCommitmentPercent returns 100 for full commitment',
  );

  assert.equal(
    calculateUncoveredDemand(92000, 80000),
    12000,
    'Test 5: calculateUncoveredDemand returns correct gap',
  );

  assert.equal(
    calculateUncoveredDemand(18000, 25000),
    -7000,
    'Test 5b: calculateUncoveredDemand returns negative when commitment exceeds demand',
  );

  // --- Mock data structure ---

  const proposal = generateLongTermAiProposalMock();

  assert.ok(
    proposal.forecastQualityIssues.length > 0,
    'Test 6: AI proposal mock contains forecast quality issues',
  );

  assert.ok(
    proposal.demandCapacityRows.length > 0,
    'Test 7: AI proposal mock contains demand capacity rows',
  );

  assert.ok(
    proposal.commitmentRecommendations.length > 0,
    'Test 8: AI proposal mock contains commitment recommendations',
  );

  assert.ok(
    proposal.scenarios.length > 0,
    'Test 9: AI proposal mock contains scenarios',
  );

  assert.ok(
    proposal.risks.length > 0,
    'Test 9b: AI proposal mock contains risks',
  );

  assert.ok(
    proposal.reasoning.length > 0,
    'Test 9c: AI proposal mock contains reasoning entries',
  );

  // --- Commitment recommendation state transitions ---

  const accepted = acceptCommitmentRecommendation(proposal, 'cr-001');
  assert.equal(
    accepted.commitmentRecommendations.find((r) => r.id === 'cr-001')?.plannerDecision,
    'Accepted',
    'Test 10: Accepting a recommendation sets plannerDecision to Accepted',
  );

  // Other recommendations remain unchanged
  assert.equal(
    accepted.commitmentRecommendations.find((r) => r.id === 'cr-002')?.plannerDecision,
    'Pending',
    'Test 10b: Accepting one recommendation does not affect others',
  );

  const rejected = rejectCommitmentRecommendation(proposal, 'cr-002', 'Capacity not available');
  assert.equal(
    rejected.commitmentRecommendations.find((r) => r.id === 'cr-002')?.plannerDecision,
    'Rejected',
    'Test 11: Rejecting a recommendation sets plannerDecision to Rejected',
  );
  assert.equal(
    rejected.commitmentRecommendations.find((r) => r.id === 'cr-002')?.rejectionReason,
    'Capacity not available',
    'Test 11b: Rejecting a recommendation stores the rejection reason',
  );

  // --- Accept selected ---

  const withSelected = {
    ...proposal,
    commitmentRecommendations: proposal.commitmentRecommendations.map((r) =>
      r.id === 'cr-001' || r.id === 'cr-003' ? {...r, selected: true} : r,
    ),
  };
  const afterAcceptSelected = acceptSelectedCommitmentRecommendations(withSelected);
  assert.equal(
    afterAcceptSelected.commitmentRecommendations.find((r) => r.id === 'cr-001')?.plannerDecision,
    'Accepted',
    'Test 12: Accept selected sets plannerDecision to Accepted for selected recommendations',
  );
  assert.equal(
    afterAcceptSelected.commitmentRecommendations.find((r) => r.id === 'cr-002')?.plannerDecision,
    'Pending',
    'Test 12b: Accept selected does not affect unselected recommendations',
  );

  // --- Scenario selection ---

  const withScenario = selectLongTermScenario(proposal, 'sc-003');
  assert.ok(
    withScenario.scenarios.find((s) => s.id === 'sc-003')?.selected,
    'Test 13: Selecting a scenario marks it as selected',
  );
  assert.ok(
    !withScenario.scenarios.find((s) => s.id === 'sc-002')?.selected,
    'Test 13b: Selecting a scenario deselects all others',
  );

  // --- Risk state transitions ---

  const withAcknowledged = acknowledgeLongTermRisk(proposal, 'rsk-001');
  assert.equal(
    withAcknowledged.risks.find((r) => r.id === 'rsk-001')?.status,
    'Acknowledged',
    'Test 14: Acknowledging a risk updates its status to Acknowledged',
  );
  assert.equal(
    withAcknowledged.risks.find((r) => r.id === 'rsk-002')?.status,
    'Open',
    'Test 14b: Acknowledging one risk does not affect others',
  );

  const withResolved = resolveLongTermRisk(proposal, 'rsk-002');
  assert.equal(
    withResolved.risks.find((r) => r.id === 'rsk-002')?.status,
    'Resolved',
    'Test 14c: Resolving a risk updates its status to Resolved',
  );

  // --- Proposal accept / reject ---

  const {proposal: acceptedProposal} = acceptAiProposalLocally(proposal, 'Maya Planner');
  assert.equal(
    acceptedProposal.status,
    'Accepted',
    'Test 15a: Accepting AI proposal sets status to Accepted',
  );
  assert.ok(
    acceptedProposal.auditEvents.some((e) => e.eventType === 'ProposalAccepted'),
    'Test 15b: Accepting AI proposal creates a ProposalAccepted audit event',
  );

  const {proposal: rejectedProposal} = rejectAiProposalLocally(proposal, 'Maya Planner', 'Insufficient capacity data');
  assert.equal(
    rejectedProposal.status,
    'Rejected',
    'Test 15c: Rejecting AI proposal sets status to Rejected',
  );
  assert.ok(
    rejectedProposal.auditEvents.some((e) => e.eventType === 'ProposalRejected'),
    'Test 15d: Rejecting AI proposal creates a ProposalRejected audit event',
  );
  assert.equal(
    rejectedProposal.auditEvents.find((e) => e.eventType === 'ProposalRejected')?.comment,
    'Insufficient capacity data',
    'Test 15e: Rejection audit event stores the rejection reason in comment',
  );

  console.log('AI Proposal Utils tests passed: 15 assertions');
}

runTests();
