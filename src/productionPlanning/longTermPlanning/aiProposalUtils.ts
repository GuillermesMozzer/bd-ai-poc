import type {
  CommitmentRecommendation,
  LongTermAiAuditEvent,
  LongTermAiAuditEventType,
  LongTermPlanningAiProposal,
  AiProposalSummary,
} from './aiProposalTypes';

export function calculateForecastVariancePercent(currentForecast: number, priorForecast: number): number {
  if (priorForecast === 0) return 0;
  return Number((((currentForecast - priorForecast) / priorForecast) * 100).toFixed(1));
}

export function calculateRequiredHours(forecastDemand: number, productionRateUnitsPerHour: number): number {
  if (productionRateUnitsPerHour === 0) return 0;
  return Number((forecastDemand / productionRateUnitsPerHour).toFixed(1));
}

export function calculateUtilizationPercent(requiredHours: number, availableHours: number): number {
  if (availableHours === 0) return 0;
  return Number(((requiredHours / availableHours) * 100).toFixed(1));
}

export function calculateCommitmentPercent(recommendedCommitment: number, forecastDemand: number): number {
  if (forecastDemand === 0) return 0;
  return Number(((recommendedCommitment / forecastDemand) * 100).toFixed(1));
}

export function calculateUncoveredDemand(forecastDemand: number, recommendedCommitment: number): number {
  return forecastDemand - recommendedCommitment;
}

export function calculateAiProposalSummary(proposal: LongTermPlanningAiProposal): AiProposalSummary {
  const productsWithIssues = new Set(proposal.forecastQualityIssues.map((i) => i.productCode)).size;
  const overloadedMonths = proposal.demandCapacityRows.filter((r) => r.capacityStatus === 'Overloaded').length;
  const totalForecast = proposal.commitmentRecommendations.reduce((sum, r) => sum + r.forecastDemand, 0);
  const totalCommitment = proposal.commitmentRecommendations.reduce((sum, r) => sum + r.recommendedCommitment, 0);
  const recommendedCommitmentPercent = totalForecast > 0
    ? Number(((totalCommitment / totalForecast) * 100).toFixed(0))
    : 0;
  const uncoveredDemandUnits = proposal.commitmentRecommendations
    .filter((r) => r.uncoveredDemand > 0)
    .reduce((sum, r) => sum + r.uncoveredDemand, 0);
  const highRiskProducts = new Set(
    proposal.risks.filter((r) => r.severity === 'Blocker' || r.severity === 'Warning').map((r) => r.productCode),
  ).size;
  const materialRiskItems = proposal.risks.filter((r) => r.riskType === 'MaterialShortageRisk').length;
  const plannerActionsRequired = proposal.commitmentRecommendations.filter(
    (r) => r.plannerDecision === 'Pending',
  ).length + proposal.risks.filter((r) => r.status === 'Open').length;

  return {
    forecastRowsChecked: proposal.summary.forecastRowsChecked,
    productsWithForecastIssues: productsWithIssues,
    capacityOverloadedMonths: overloadedMonths,
    recommendedCommitmentPercent,
    uncoveredDemandUnits,
    highRiskProducts,
    materialRiskItems,
    plannerActionsRequired,
  };
}

export function acceptCommitmentRecommendation(
  proposal: LongTermPlanningAiProposal,
  id: string,
): LongTermPlanningAiProposal {
  return {
    ...proposal,
    commitmentRecommendations: proposal.commitmentRecommendations.map(
      (rec): CommitmentRecommendation =>
        rec.id === id ? {...rec, plannerDecision: 'Accepted'} : rec,
    ),
  };
}

export function rejectCommitmentRecommendation(
  proposal: LongTermPlanningAiProposal,
  id: string,
  reason: string,
): LongTermPlanningAiProposal {
  return {
    ...proposal,
    commitmentRecommendations: proposal.commitmentRecommendations.map(
      (rec): CommitmentRecommendation =>
        rec.id === id ? {...rec, plannerDecision: 'Rejected', rejectionReason: reason} : rec,
    ),
  };
}

export function acceptSelectedCommitmentRecommendations(
  proposal: LongTermPlanningAiProposal,
): LongTermPlanningAiProposal {
  return {
    ...proposal,
    commitmentRecommendations: proposal.commitmentRecommendations.map(
      (rec): CommitmentRecommendation =>
        rec.selected && rec.plannerDecision !== 'Rejected'
          ? {...rec, plannerDecision: 'Accepted'}
          : rec,
    ),
  };
}

export function selectLongTermScenario(
  proposal: LongTermPlanningAiProposal,
  id: string,
): LongTermPlanningAiProposal {
  return {
    ...proposal,
    scenarios: proposal.scenarios.map((scenario) => ({
      ...scenario,
      selected: scenario.id === id,
    })),
  };
}

export function acknowledgeLongTermRisk(
  proposal: LongTermPlanningAiProposal,
  id: string,
): LongTermPlanningAiProposal {
  return {
    ...proposal,
    risks: proposal.risks.map((risk) =>
      risk.id === id && risk.status === 'Open' ? {...risk, status: 'Acknowledged'} : risk,
    ),
  };
}

export function resolveLongTermRisk(
  proposal: LongTermPlanningAiProposal,
  id: string,
): LongTermPlanningAiProposal {
  return {
    ...proposal,
    risks: proposal.risks.map((risk) =>
      risk.id === id ? {...risk, status: 'Resolved'} : risk,
    ),
  };
}

export function createLongTermAiAuditEvent(
  eventType: LongTermAiAuditEventType,
  user: string,
  comment?: string,
  previousValue?: string,
  newValue?: string,
): LongTermAiAuditEvent {
  return {
    id: `ltai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    user,
    eventType,
    previousValue,
    newValue,
    comment,
  };
}

export function acceptAiProposalLocally(
  proposal: LongTermPlanningAiProposal,
  user: string,
): {proposal: LongTermPlanningAiProposal; auditEvent: LongTermAiAuditEvent} {
  const auditEvent = createLongTermAiAuditEvent(
    'ProposalAccepted',
    user,
    'AI proposal accepted for local preview.',
    proposal.status,
    'Accepted',
  );
  return {
    proposal: {
      ...proposal,
      status: 'Accepted',
      auditEvents: [auditEvent, ...proposal.auditEvents],
    },
    auditEvent,
  };
}

export function rejectAiProposalLocally(
  proposal: LongTermPlanningAiProposal,
  user: string,
  reason: string,
): {proposal: LongTermPlanningAiProposal; auditEvent: LongTermAiAuditEvent} {
  const auditEvent = createLongTermAiAuditEvent(
    'ProposalRejected',
    user,
    reason,
    proposal.status,
    'Rejected',
  );
  return {
    proposal: {
      ...proposal,
      status: 'Rejected',
      auditEvents: [auditEvent, ...proposal.auditEvents],
    },
    auditEvent,
  };
}
