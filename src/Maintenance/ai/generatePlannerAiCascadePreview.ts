import {
  formatPlannerAiShiftLabel,
  inferPlannerLineFromAsset,
  inferPlannerZoneFromAsset,
} from './buildPlannerAiSnapshot';
import { buildMaintenanceBundles } from './buildMaintenanceBundles';
import { enrichCoverageSummary } from './buildCoverageGapAnalysis';
import type {
  PlannerAiApprovalRequest,
  PlannerAiApprovalStep,
  PlannerAiCascadeConflict,
  PlannerAiCascadeImpact,
  PlannerAiCascadeMetricDelta,
  PlannerAiCascadePreview,
  PlannerAiChangeSource,
  PlannerAiHorizonProjection,
  PlannerAiMaintenanceBundle,
  PlannerAiPlanAction,
  PlannerAiPlanVariant,
  PlannerAiPlannerSnapshot,
} from './types';

function getActionLine(action: PlannerAiPlanAction) {
  return 'line' in action && action.line ? action.line : inferPlannerLineFromAsset(action.asset);
}

function getActionZone(action: PlannerAiPlanAction) {
  return 'zone' in action && action.zone ? action.zone : inferPlannerZoneFromAsset(action.asset);
}

function getActionDay(action: PlannerAiPlanAction) {
  if ('recommendedDay' in action) {
    return action.recommendedDay;
  }
  return undefined;
}

function getActionShiftLabel(action: PlannerAiPlanAction) {
  if ('recommendedShift' in action) {
    return formatPlannerAiShiftLabel(action.recommendedShift);
  }
  return 'Planner review';
}

function buildMetricDelta(
  id: string,
  label: string,
  beforeLabel: string,
  afterLabel: string,
  deltaLabel: string,
  emphasis: 'positive' | 'negative' | 'neutral',
): PlannerAiCascadeMetricDelta {
  return {
    id,
    label,
    beforeLabel,
    afterLabel,
    deltaLabel,
    emphasis,
  };
}

function getPreventiveApprovalNeeded(snapshot: PlannerAiPlannerSnapshot, action: PlannerAiPlanAction) {
  if (action.kind !== 'reschedule-card') {
    return false;
  }

  const sourceCard = snapshot.cards.find((card) => card.id === action.sourceId);
  if (!sourceCard?.preventiveSchedule) {
    return false;
  }

  if (sourceCard.preventiveSchedule.kind === 'fixed') {
    return action.recommendedDay !== sourceCard.day;
  }

  const daysBefore = Math.floor((sourceCard.preventiveSchedule.windowDays - 1) / 2);
  const daysAfter = sourceCard.preventiveSchedule.windowDays - daysBefore - 1;
  const earliestDay = sourceCard.day - daysBefore;
  const latestDay = sourceCard.day + daysAfter;
  return action.recommendedDay < earliestDay || action.recommendedDay > latestDay;
}

function buildApprovalSteps(roles: string[], summary: string): PlannerAiApprovalStep[] {
  return roles.map((role, index) => ({
    id: `${role.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${index + 1}`,
    role,
    status: index === 0 ? 'pending' : 'pending',
    summary,
    escalationLabel: index === roles.length - 1 ? 'Escalate after 4h without action' : undefined,
  }));
}

function buildApprovalRequests(
  snapshot: PlannerAiPlannerSnapshot,
  actions: PlannerAiPlanAction[],
  bundles: PlannerAiMaintenanceBundle[],
): PlannerAiApprovalRequest[] {
  const requests: PlannerAiApprovalRequest[] = [];

  actions.forEach((action, index) => {
    if (getPreventiveApprovalNeeded(snapshot, action)) {
      requests.push({
        id: `approval-pm-window-${index + 1}`,
        title: `${action.asset} moves outside its PM compliance window`,
        summary: `The proposed reschedule for ${action.workOrderLabel} requires quality and maintenance sign-off before execution.`,
        status: 'pending',
        riskLevel: 'high',
        relatedActionIds: [action.id],
        requiredBy: 'Before apply',
        steps: buildApprovalSteps(
          ['Maintenance Lead', 'Manufacturing Unit Leader', 'Quality Engineer'],
          'Approve the PM extension and document the compliance justification.',
        ),
      });
    }

    if (action.executionReadiness === 'warning' && action.partsNote?.toLowerCase().includes('below buffer')) {
      requests.push({
        id: `approval-parts-${index + 1}`,
        title: `${action.asset} needs parts-risk review`,
        summary: `${action.workOrderLabel} is executable, but parts are below buffer and should be acknowledged before release.`,
        status: 'pending',
        riskLevel: 'medium',
        relatedActionIds: [action.id],
        requiredBy: 'Before kit staging',
        steps: buildApprovalSteps(['Parts Manager', 'Shift Supervisor'], 'Confirm parts risk and release timing.'),
      });
    }

    if ('recommendedShift' in action && action.recommendedShift === 'night') {
      requests.push({
        id: `approval-night-shift-${index + 1}`,
        title: `${action.workOrderLabel} adds night-shift maintenance load`,
        summary: `Night-shift work on ${action.asset} should be acknowledged for staffing and safety coverage.`,
        status: 'pending',
        riskLevel: 'medium',
        relatedActionIds: [action.id],
        requiredBy: 'Before schedule commit',
        steps: buildApprovalSteps(['Shift Supervisor', 'Safety Supervisor'], 'Approve the night-shift execution envelope.'),
      });
    }
  });

  bundles
    .filter((bundle) => bundle.riskLevel === 'high')
    .forEach((bundle, index) => {
      requests.push({
        id: `approval-bundle-${index + 1}`,
        title: `${bundle.name} needs bundle coordination approval`,
        summary: `${bundle.workOrderLabels.join(', ')} are grouped into one package and need confirmation that the combined risk is acceptable.`,
        status: 'pending',
        riskLevel: 'medium',
        relatedActionIds: bundle.actionIds,
        requiredBy: 'Before bundled execution',
        steps: buildApprovalSteps(['Production Supervisor', 'Maintenance Lead'], 'Approve the bundled shutdown package.'),
      });
    });

  return requests;
}

function buildCascadeConflicts(
  plan: PlannerAiPlanVariant,
  approvalRequests: PlannerAiApprovalRequest[],
  selectedActions: PlannerAiPlanAction[],
  snapshot: PlannerAiPlannerSnapshot,
): PlannerAiCascadeConflict[] {
  const conflicts: PlannerAiCascadeConflict[] = plan.agentConflicts.map((conflict) => ({
    id: conflict.id,
    horizon: 'weekly',
    severity: conflict.severity,
    title: conflict.title,
    summary: conflict.summary,
    resolution: conflict.resolution,
    relatedActionIds: conflict.actionId ? [conflict.actionId] : [],
  }));

  approvalRequests.forEach((request) => {
    conflicts.push({
      id: `${request.id}-pending`,
      horizon: 'monthly',
      severity: request.riskLevel === 'high' ? 'blocker' : 'warning',
      title: request.title,
      summary: request.summary,
      resolution: 'Route the approval chain before committing this propagated change.',
      relatedActionIds: request.relatedActionIds,
    });
  });

  const selectedZones = [...new Set(selectedActions.map((action) => getActionZone(action)))];
  selectedZones.forEach((zone) => {
    if (!snapshot.coverageSummary.constrainedZones.includes(zone)) {
      return;
    }

    conflicts.push({
      id: `coverage-${zone.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      horizon: 'quarterly',
      severity: 'warning',
      title: `${zone} skill coverage is thin for the proposed load`,
      summary: `${zone} already has constrained technician coverage in the current planner snapshot, so the propagated work should keep a recovery buffer.`,
      resolution: 'Reduce overlap in the constrained zone or pull in cross-trained support before execution.',
      relatedActionIds: selectedActions.filter((action) => getActionZone(action) === zone).map((action) => action.id),
    });
  });

  return conflicts;
}

function buildCascadeImpacts(
  snapshot: PlannerAiPlannerSnapshot,
  selectedActions: PlannerAiPlanAction[],
  conflicts: PlannerAiCascadeConflict[],
  approvalRequests: PlannerAiApprovalRequest[],
): PlannerAiCascadeImpact[] {
  const selectedPreventiveCount = selectedActions.filter((action) => action.workOrderLabel.startsWith('PM-')).length;
  const readyCount = selectedActions.filter((action) => action.executionReadiness === 'pass').length;
  const warningCount = selectedActions.filter((action) => action.executionReadiness === 'warning').length;
  const blockedCount = selectedActions.filter((action) => action.executionReadiness === 'blocker').length;
  const workOrderLabels = selectedActions.map((action) => action.workOrderLabel);
  const monthlyPmAfter = Math.min(98, snapshot.baseline.pmCompliance + selectedPreventiveCount * 4 + readyCount);
  const quarterlyDowntimeBefore = 220;
  const quarterlyDowntimeAfter = Math.max(194, quarterlyDowntimeBefore - readyCount * 3 - selectedPreventiveCount);
  const annualRiskBefore = 58;
  const annualRiskAfter = Math.max(24, annualRiskBefore - readyCount * 3 - selectedPreventiveCount);
  const annualCostBefore = 2.4;
  const annualCostAfter = Math.max(2.02, annualCostBefore - readyCount * 0.05);

  return [
    {
      horizon: 'weekly',
      title: 'Weekly execution impact',
      summary: `${selectedActions.length} selected recommendation${selectedActions.length === 1 ? '' : 's'} reshape the active weekly board with ${readyCount} execution-ready move${readyCount === 1 ? '' : 's'} and ${blockedCount} blocked action${blockedCount === 1 ? '' : 's'} still visible for review.`,
      badgeLabel: `${selectedActions.length} weekly changes`,
      metricDeltas: [
        buildMetricDelta('weekly-ready', 'Execution-ready actions', '0', `${readyCount}`, `+${readyCount}`, 'positive'),
        buildMetricDelta('weekly-warnings', 'Actions needing review', '0', `${warningCount + blockedCount}`, `+${warningCount + blockedCount}`, warningCount + blockedCount ? 'negative' : 'neutral'),
      ],
      conflictIds: conflicts.filter((conflict) => conflict.horizon === 'weekly').map((conflict) => conflict.id),
      affectedWorkOrders: workOrderLabels,
    },
    {
      horizon: 'monthly',
      title: 'Monthly compliance and backlog impact',
      summary: `${selectedPreventiveCount} preventive move${selectedPreventiveCount === 1 ? '' : 's'} improve PM route confidence, while ${approvalRequests.length} approval gate${approvalRequests.length === 1 ? '' : 's'} stay visible before the month-level plan is considered stable.`,
      badgeLabel: `${Math.max(0, monthlyPmAfter - snapshot.baseline.pmCompliance)} pts PM`,
      metricDeltas: [
        buildMetricDelta('monthly-pm', 'PM compliance', `${snapshot.baseline.pmCompliance}%`, `${monthlyPmAfter}%`, `+${monthlyPmAfter - snapshot.baseline.pmCompliance}%`, 'positive'),
        buildMetricDelta(
          'monthly-backlog',
          'Open backlog',
          `${snapshot.baseline.openBacklog}`,
          `${Math.max(0, snapshot.baseline.openBacklog - selectedActions.length)}`,
          `-${Math.min(snapshot.baseline.openBacklog, selectedActions.length)}`,
          'positive',
        ),
      ],
      conflictIds: conflicts.filter((conflict) => conflict.horizon === 'monthly').map((conflict) => conflict.id),
      affectedWorkOrders: workOrderLabels,
    },
    {
      horizon: 'quarterly',
      title: 'Quarterly capacity and downtime impact',
      summary: `The proposed package reduces recurring stop-start windows, but constrained zones still need recovery capacity across the quarter.`,
      badgeLabel: `${quarterlyDowntimeBefore - quarterlyDowntimeAfter}h less downtime`,
      metricDeltas: [
        buildMetricDelta('quarterly-downtime', 'Planned downtime', `${quarterlyDowntimeBefore}h`, `${quarterlyDowntimeAfter}h`, `-${quarterlyDowntimeBefore - quarterlyDowntimeAfter}h`, 'positive'),
        buildMetricDelta(
          'quarterly-coverage',
          'Coverage score',
          `${snapshot.coverageSummary.coverageScore}`,
          `${Math.max(0, snapshot.coverageSummary.coverageScore - warningCount * 2)}`,
          `${warningCount ? '-' : '+'}${warningCount ? warningCount * 2 : 0}`,
          warningCount ? 'negative' : 'neutral',
        ),
      ],
      conflictIds: conflicts.filter((conflict) => conflict.horizon === 'quarterly').map((conflict) => conflict.id),
      affectedWorkOrders: workOrderLabels,
    },
    {
      horizon: 'annual',
      title: 'Annual strategic impact',
      summary: `Risk and cost improve if the selected work is sustained, but unresolved approvals will continue to dampen the long-range benefit until cleared.`,
      badgeLabel: `${annualRiskBefore - annualRiskAfter} risk pts`,
      metricDeltas: [
        buildMetricDelta('annual-risk', 'Avg breakdown risk', `${annualRiskBefore}`, `${annualRiskAfter}`, `-${annualRiskBefore - annualRiskAfter}`, 'positive'),
        buildMetricDelta(
          'annual-cost',
          'Annual maintenance cost',
          `$${annualCostBefore.toFixed(2)}M`,
          `$${annualCostAfter.toFixed(2)}M`,
          `-$${(annualCostBefore - annualCostAfter).toFixed(2)}M`,
          'positive',
        ),
      ],
      conflictIds: conflicts.filter((conflict) => conflict.horizon === 'annual').map((conflict) => conflict.id),
      affectedWorkOrders: workOrderLabels,
    },
  ];
}

function buildHorizonProjections(
  impacts: PlannerAiCascadeImpact[],
  conflicts: PlannerAiCascadeConflict[],
): PlannerAiHorizonProjection[] {
  return impacts.map((impact) => ({
    horizon: impact.horizon,
    badgeLabel: impact.badgeLabel,
    conflictCount: conflicts.filter((conflict) => conflict.horizon === impact.horizon).length,
    hasBlocker: conflicts.some(
      (conflict) => conflict.horizon === impact.horizon && conflict.severity === 'blocker',
    ),
  }));
}

export function generatePlannerAiCascadePreview({
  snapshot,
  plan,
  selectedActionIds,
  changeSource,
}: {
  snapshot: PlannerAiPlannerSnapshot;
  plan: PlannerAiPlanVariant;
  selectedActionIds: string[];
  changeSource?: PlannerAiChangeSource;
}): PlannerAiCascadePreview {
  const selectedActions = plan.actions.filter((action) => selectedActionIds.includes(action.id));
  const bundles = buildMaintenanceBundles(selectedActions);
  const approvalRequests = buildApprovalRequests(snapshot, selectedActions, bundles);
  const conflicts = buildCascadeConflicts(plan, approvalRequests, selectedActions, snapshot);
  const impacts = buildCascadeImpacts(snapshot, selectedActions, conflicts, approvalRequests);

  return {
    id: `cascade-preview-${plan.id}-${selectedActionIds.length}`,
    generatedAt: new Date().toLocaleString(),
    strategyLabel: plan.strategyLabel,
    changeSource,
    selectedActionIds,
    impacts,
    conflicts,
    approvalRequests,
    bundles,
    coverageSummary: enrichCoverageSummary(snapshot.coverageSummary),
    horizonProjections: buildHorizonProjections(impacts, conflicts),
    recommendedApplySummary:
      approvalRequests.length > 0
        ? `${selectedActions.length} actions are ready for propagation review, but ${approvalRequests.length} approval gate${approvalRequests.length === 1 ? '' : 's'} should be acknowledged before commit.`
        : `${selectedActions.length} actions are ready to propagate across horizons with the current snapshot assumptions.`,
  };
}

export { buildMaintenanceBundles } from './buildMaintenanceBundles';
