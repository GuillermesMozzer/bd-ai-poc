import type { PlannerAiAnalysis } from './agents/plannerAiAnalysis';
import type {
  PlannerAiAgentConflict,
  PlannerAiAgentEvaluation,
  PlannerAiAgentReasoning,
  PlannerAiFeasibilityItem,
  PlannerAiOrchestrationSummary,
  PlannerAiPlanAction,
  PlannerAiPlanStrategy,
  PlannerAiRiskSignal,
  PlannerAiVariantSummary,
} from './types';
import type { PlannerAiOrchestrationResult } from './agents/plannerAiOrchestrator';

function getTopSignal(analysis: PlannerAiAnalysis) {
  return analysis.criticalSignals[0] ?? null;
}

function getBlockedAsset(analysis: PlannerAiAnalysis) {
  return analysis.blockers[0]?.asset ?? analysis.partsReadiness.find((item) => item.status === 'blocked')?.asset ?? null;
}

function getPeakDayLoad(actions: PlannerAiPlanAction[]) {
  const byDay = actions.reduce<Record<number, number>>((acc, action) => {
    if (action.kind === 'promote-follow-up-request') {
      return acc;
    }
    acc[action.recommendedDay] = (acc[action.recommendedDay] ?? 0) + 1;
    return acc;
  }, {});

  const peakEntry = Object.entries(byDay).sort((left, right) => Number(right[1]) - Number(left[1]))[0];
  return {
    peakDay: peakEntry ? Number(peakEntry[0]) : null,
    peakLoad: peakEntry ? Number(peakEntry[1]) : 0,
  };
}

function buildStrategyFeasibilityChecklist(
  strategy: PlannerAiPlanStrategy,
  analysis: PlannerAiAnalysis,
  actions: PlannerAiPlanAction[],
): PlannerAiFeasibilityItem[] {
  const topSignal = getTopSignal(analysis);
  const blockedAsset = getBlockedAsset(analysis);
  const scheduledAssets = new Set(actions.map((action) => action.asset));
  const { peakDay, peakLoad } = getPeakDayLoad(actions);
  const permitActions = actions.filter((action) =>
    `${action.asset}`.toLowerCase().match(/molding|conveyor|boiler/),
  );

  if (strategy === 'min-downtime') {
    return [
      {
        id: 'reliability-coverage',
        label: 'Reliability signal coverage',
        status: 'warning',
        detail: topSignal
          ? `${topSignal.asset} is partially addressed, but the compressed plan leaves ${blockedAsset ?? 'lower-priority queue work'} unscheduled to protect uptime.`
          : 'Some condition-driven queue work stays deferred so production absorbs fewer stops.',
        resolutionHint: 'Accept higher residual risk, or move one deferred item back into the weekly board.',
        sourceLabel: 'Reliability agent',
        agentContributors: ['Reliability'],
      },
      {
        id: 'parts-readiness',
        label: 'Spare-parts readiness',
        status: blockedAsset ? 'pass' : 'warning',
        detail: blockedAsset
          ? `${blockedAsset} stays out of execution — the plan correctly avoids treating blocked material as ready.`
          : 'Only executable parts coverage is scheduled; blocked kits are intentionally excluded.',
        sourceLabel: 'Spare Parts agent',
        agentContributors: ['Spare Parts'],
      },
      {
        id: 'labor-envelope',
        label: 'Labor and slot fit',
        status: peakLoad > 1 ? 'warning' : 'pass',
        detail:
          peakLoad > 1
            ? `Day ${(peakDay ?? 0) + 1} carries ${peakLoad} actions in one stop cluster — crew density needs supervisor review.`
            : 'Work fits inside a single compressed execution window.',
        resolutionHint: peakLoad > 1 ? 'Confirm technician coverage on the peak day before applying all actions.' : undefined,
        sourceLabel: 'Labor agent',
        agentContributors: ['Labor'],
      },
      {
        id: 'production-window-fit',
        label: 'Production window alignment',
        status: 'pass',
        detail: 'Maintenance is bundled into the earliest open stop so production avoids a second interruption pocket later in the week.',
        sourceLabel: 'Production agent',
        agentContributors: ['Production'],
      },
      {
        id: 'safety-review',
        label: 'Safety review posture',
        status: permitActions.length ? 'warning' : 'pass',
        detail: permitActions.length
          ? `${permitActions.length} action${permitActions.length === 1 ? '' : 's'} run in a compressed window where simultaneous zone access needs permit review.`
          : 'No additional safety constraints beyond the standard weekly envelope.',
        resolutionHint: 'Keep permit checkpoints visible before crew dispatch on the compressed day.',
        sourceLabel: 'Safety agent',
        agentContributors: ['Safety'],
      },
    ];
  }

  if (strategy === 'max-reliability') {
    return [
      {
        id: 'reliability-coverage',
        label: 'Reliability signal coverage',
        status: 'pass',
        detail: topSignal
          ? `${topSignal.asset} and related high-risk work are pulled forward early in the week to suppress the failure curve.`
          : 'The plan front-loads the highest condition exposure in the current queue.',
        sourceLabel: 'Reliability agent',
        agentContributors: ['Reliability'],
      },
      {
        id: 'parts-readiness',
        label: 'Spare-parts readiness',
        status: blockedAsset && !scheduledAssets.has(blockedAsset) ? 'pass' : 'warning',
        detail: blockedAsset && !scheduledAssets.has(blockedAsset)
          ? `${blockedAsset} remains visible as blocked rather than forced into execution.`
          : 'Parts coverage is acceptable on the accelerated work set, but timing is tighter on early-week slots.',
        sourceLabel: 'Spare Parts agent',
        agentContributors: ['Spare Parts'],
      },
      {
        id: 'labor-envelope',
        label: 'Labor and slot fit',
        status: actions.length >= 3 ? 'warning' : 'pass',
        detail:
          actions.length >= 3
            ? `${actions.length} actions expand the weekly labor envelope — expect heavier Tue-Wed crew loading.`
            : 'Crew loading stays manageable despite earlier scheduling.',
        resolutionHint: actions.length >= 3 ? 'Verify backup technician availability on the front-loaded days.' : undefined,
        sourceLabel: 'Labor agent',
        agentContributors: ['Labor'],
      },
      {
        id: 'production-window-fit',
        label: 'Production window alignment',
        status: 'warning',
        detail: 'Planned downtime extends across Tue-Wed to accommodate accelerated reliability work — production accepts a short OEE dip.',
        resolutionHint: 'Confirm the extended window with production planning before apply.',
        sourceLabel: 'Production agent',
        agentContributors: ['Production'],
      },
      {
        id: 'safety-review',
        label: 'Safety review posture',
        status: permitActions.length ? 'warning' : 'pass',
        detail: permitActions.length
          ? 'Permit-style assets remain in the plan, but the wider execution window gives more time for safety review.'
          : 'No extra safety friction beyond the standard weekly review path.',
        sourceLabel: 'Safety agent',
        agentContributors: ['Safety'],
      },
    ];
  }

  if (strategy === 'production-sync') {
    return [
      {
        id: 'reliability-coverage',
        label: 'Reliability signal coverage',
        status: 'warning',
        detail: topSignal
          ? `${topSignal.asset} is scheduled inside the changeover window, but full PM scope may be deferred to keep the stop short.`
          : 'Condition work is bundled into production transitions, which can defer some full PM scope.',
        resolutionHint: 'Review whether deferred CBM work can wait until the next weekly cycle.',
        sourceLabel: 'Reliability agent',
        agentContributors: ['Reliability'],
      },
      {
        id: 'parts-readiness',
        label: 'Spare-parts readiness',
        status: 'warning',
        detail: 'Crib A kit must arrive before the Day 3 changeover closes — late parts would collapse the bundled window.',
        resolutionHint: 'Confirm kit ETA against the changeover start time before apply.',
        sourceLabel: 'Spare Parts agent',
        agentContributors: ['Spare Parts'],
      },
      {
        id: 'labor-envelope',
        label: 'Labor and slot fit',
        status: 'pass',
        detail: 'Lowest crew strain in the comparison — work rides one approved production transition instead of multiple standalone stops.',
        sourceLabel: 'Labor agent',
        agentContributors: ['Labor'],
      },
      {
        id: 'production-window-fit',
        label: 'Production window alignment',
        status: 'pass',
        detail: 'All proposed moves align with the Line 10 changeover / low-OEE window already approved for Day 3.',
        sourceLabel: 'Production agent',
        agentContributors: ['Production'],
      },
      {
        id: 'safety-review',
        label: 'Safety review posture',
        status: 'warning',
        detail: 'Maintenance during a live production transition requires a permit checkpoint and zone isolation review.',
        resolutionHint: 'Keep the safety review note visible until the changeover window is formally released.',
        sourceLabel: 'Safety agent',
        agentContributors: ['Safety'],
      },
    ];
  }

  return [
    {
      id: 'reliability-coverage',
      label: 'Reliability signal coverage',
      status: topSignal ? 'pass' : 'warning',
      detail: topSignal
        ? `${topSignal.asset} is scheduled with the strongest CBM signal in the current planning set.`
        : 'No single critical signal dominates — reliability pressure stays moderate.',
      sourceLabel: 'Reliability agent',
      agentContributors: ['Reliability'],
    },
    {
      id: 'parts-readiness',
      label: 'Spare-parts readiness',
      status: blockedAsset ? 'blocker' : 'pass',
      detail: blockedAsset
        ? `${blockedAsset} is materially blocked — the plan keeps it visible instead of treating it as execution-ready.`
        : 'Scheduled actions have executable parts coverage for the proposed windows.',
      resolutionHint: blockedAsset ? 'Do not pull blocked work into direct execution until material coverage is restored.' : undefined,
      sourceLabel: 'Spare Parts agent',
      agentContributors: ['Spare Parts'],
    },
    {
      id: 'labor-envelope',
      label: 'Labor and slot fit',
      status: peakLoad > 2 ? 'warning' : 'pass',
      detail:
        peakLoad > 2
          ? `Day ${(peakDay ?? 0) + 1} is crew-dense with ${peakLoad} actions — rebalance if assignment pressure tightens.`
          : 'Crew loading stays inside a manageable weekly envelope.',
      sourceLabel: 'Labor agent',
      agentContributors: ['Labor'],
    },
    {
      id: 'production-window-fit',
      label: 'Production window alignment',
      status: 'pass',
      detail: 'Production impact is acceptable because work stays close to existing stop windows rather than scattering late-week.',
      sourceLabel: 'Production agent',
      agentContributors: ['Production'],
    },
    {
      id: 'safety-review',
      label: 'Safety review posture',
      status: permitActions.length ? 'warning' : 'pass',
      detail: permitActions.length
        ? `${permitActions.length} proposed action${permitActions.length === 1 ? '' : 's'} touch assets that should keep a permit-style review note.`
        : 'No obvious hazardous overlap detected in the current action set.',
      resolutionHint: permitActions.length ? 'Preserve safety review notes before execution is treated as frictionless.' : undefined,
      sourceLabel: 'Safety agent',
      agentContributors: ['Safety'],
    },
  ];
}

function buildStrategyAgentConflicts(
  strategy: PlannerAiPlanStrategy,
  analysis: PlannerAiAnalysis,
  actions: PlannerAiPlanAction[],
): PlannerAiAgentConflict[] {
  const topSignal = getTopSignal(analysis);
  const blockedAsset = getBlockedAsset(analysis);
  const conveyorAction = actions.find((action) => action.asset.toLowerCase().includes('conveyor'));
  const assemblyAction = actions.find((action) => action.asset.toLowerCase().includes('assembly'));

  if (strategy === 'min-downtime') {
    const conflicts: PlannerAiAgentConflict[] = [];
    if (topSignal && !actions.some((action) => action.asset === topSignal.asset)) {
      conflicts.push({
        id: 'conflict-min-downtime-deferred-risk',
        title: `${topSignal.asset} condition work stays deferred`,
        summary:
          'Reliability wanted this work earlier, but Production and Planner prioritized a single short stop. Residual failure exposure stays higher than the Recommended path.',
        severity: 'warning',
        resolution: 'Accept the uptime trade-off, or add one deferred item back before apply.',
        agents: ['Reliability', 'Production', 'Planner'],
        asset: topSignal.asset,
      });
    }
    if (conveyorAction) {
      conflicts.push({
        id: 'conflict-min-downtime-compressed-crew',
        title: `${conveyorAction.asset} shares a compressed crew window`,
        summary:
          'Labor flagged peak-day density because conveyor PM is bundled with queue work in the same stop cluster.',
        severity: 'warning',
        resolution: 'Confirm supervisor coverage on the compressed day before dispatch.',
        agents: ['Labor', 'Production'],
        actionId: conveyorAction.id,
        asset: conveyorAction.asset,
      });
    }
    return conflicts;
  }

  if (strategy === 'max-reliability') {
    const conflicts: PlannerAiAgentConflict[] = [];
    conflicts.push({
      id: 'conflict-max-reliability-production-dip',
      title: 'Extended Tue-Wed window affects OEE',
      summary:
        'Production accepts a short output dip because Reliability is front-loading critical work to suppress failure exposure faster.',
      severity: 'warning',
      resolution: 'Confirm the extended window with production planning before apply.',
      agents: ['Production', 'Reliability'],
    });
    if (assemblyAction) {
      conflicts.push({
        id: 'conflict-max-reliability-early-slot',
        title: `${assemblyAction.asset} pulled into an early high-control window`,
        summary:
          'Labor noted heavier front-week loading, but Reliability supports the move because the CBM signal is critical.',
        severity: 'warning',
        resolution: 'Verify technician availability on the accelerated day.',
        agents: ['Labor', 'Reliability'],
        actionId: assemblyAction.id,
        asset: assemblyAction.asset,
      });
    }
    return conflicts;
  }

  if (strategy === 'production-sync') {
    return [
      {
        id: 'conflict-production-sync-parts-timing',
        title: 'Crib A kit must land before changeover closes',
        summary:
          'Spare Parts supports the bundle, but the Day 3 changeover window collapses if the crib kit arrives late.',
        severity: 'warning',
        resolution: 'Confirm kit ETA against the changeover start before apply.',
        agents: ['Spare Parts', 'Production'],
      },
      {
        id: 'conflict-production-sync-deferred-pm',
        title: topSignal ? `${topSignal.asset} PM scope may be shortened` : 'PM scope may be shortened in the bundle',
        summary:
          'Reliability accepts a shorter intervention inside the changeover, which leaves some condition work for a later cycle.',
        severity: 'warning',
        resolution: 'Review deferred CBM follow-up before closing the weekly plan.',
        agents: ['Reliability', 'Production'],
        asset: topSignal?.asset,
      },
    ];
  }

  const conflicts: PlannerAiAgentConflict[] = [];
  if (blockedAsset) {
    conflicts.push({
      id: 'conflict-recommended-blocked-parts',
      title: `${blockedAsset} remains blocked by parts coverage`,
      summary:
        'Spare Parts blocked direct execution on this asset, so the planner keeps it visible rather than over-committing the weekly board.',
      severity: 'blocker',
      resolution: 'Keep blocked work in planning until material coverage is restored.',
      agents: ['Spare Parts', 'Planner'],
      asset: blockedAsset,
    });
  }
  if (assemblyAction && analysis.partsReadiness.some((item) => item.asset === assemblyAction.asset && item.status === 'risk')) {
    conflicts.push({
      id: 'conflict-recommended-thin-parts',
      title: `${assemblyAction.asset} has thin spare-parts coverage`,
      summary:
        'The action is still viable, but supply readiness is tight enough that timing should be reviewed before execution.',
      severity: 'warning',
      resolution: 'Confirm crib availability before pulling this work into the peak day.',
      agents: ['Spare Parts', 'Reliability'],
      actionId: assemblyAction.id,
      asset: assemblyAction.asset,
    });
  }
  return conflicts;
}

function buildStrategyAgentReasoning(
  strategy: PlannerAiPlanStrategy,
  evaluations: PlannerAiAgentEvaluation[],
  conflicts: PlannerAiAgentConflict[],
): PlannerAiAgentReasoning[] {
  const stanceByAgent = (agent: PlannerAiAgentEvaluation['agent']) => {
    const evaluation = evaluations.find((entry) => entry.agent === agent);
    if (!evaluation) {
      return 'supporting' as const;
    }
    if (evaluation.findings.some((finding) => finding.severity === 'blocker')) {
      return 'blocking' as const;
    }
    if (evaluation.findings.some((finding) => finding.severity === 'warning') || conflicts.some((conflict) => conflict.agents.includes(agent))) {
      return 'warning' as const;
    }
    return 'supporting' as const;
  };

  const summaries: Record<PlannerAiPlanStrategy, Partial<Record<PlannerAiAgentEvaluation['agent'], string>>> = {
    recommended: {
      Reliability: 'Supports scheduling the strongest CBM signal while keeping blocked work visible.',
      'Spare Parts': 'Flags thin coverage on blocked assets so the plan stays credible.',
      Labor: 'Weekly crew loading stays inside a manageable envelope.',
      Production: 'Work stays close to existing stop windows with acceptable output impact.',
      Safety: 'Permit-style assets keep a visible review checkpoint before execution.',
    },
    'min-downtime': {
      Reliability: 'Accepts higher residual risk because lower-priority condition work stays deferred.',
      'Spare Parts': 'Only executable kits enter the plan — blocked material stays out of the stop cluster.',
      Labor: 'Warns that the compressed day is crew-dense and needs supervisor review.',
      Production: 'Strongly supports a single short interruption instead of multiple stops.',
      Safety: 'Compressed simultaneous work needs permit review before dispatch.',
    },
    'max-reliability': {
      Reliability: 'Front-loads the highest-risk assets to suppress failure exposure fastest.',
      'Spare Parts': 'Parts coverage is acceptable on the accelerated set; blocked assets stay visible.',
      Labor: 'Front-week loading increases assignment pressure on Tue-Wed.',
      Production: 'Accepts a short OEE dip in exchange for faster reliability recovery.',
      Safety: 'Wider execution window gives more time for permit review on flagged assets.',
    },
    'production-sync': {
      Reliability: 'Supports the bundle but notes some full PM scope may move to a later cycle.',
      'Spare Parts': 'Kit timing is the main constraint — the changeover window closes quickly.',
      Labor: 'Lowest crew strain because work rides one approved production transition.',
      Production: 'Best production fit — maintenance aligns with the Line 10 changeover.',
      Safety: 'Live transition zones need isolation review before crew entry.',
    },
  };

  return evaluations.map((evaluation) => ({
    id: `reasoning-${evaluation.agent.toLowerCase().replace(/\s+/g, '-')}`,
    agent: evaluation.agent,
    title: evaluation.title,
    summary: summaries[strategy][evaluation.agent] ?? evaluation.summary,
    confidence: evaluation.confidence,
    stance: stanceByAgent(evaluation.agent),
    highlights: evaluation.findings.slice(0, 2).map((finding) => finding.summary),
  }));
}

function buildStrategyOrchestrationSummary(
  strategy: PlannerAiPlanStrategy,
  actions: PlannerAiPlanAction[],
  conflicts: PlannerAiAgentConflict[],
  evaluations: PlannerAiAgentEvaluation[],
): PlannerAiOrchestrationSummary {
  const blockedActionCount = conflicts.filter((conflict) => conflict.severity === 'blocker').length;
  const warningActionCount = conflicts.filter((conflict) => conflict.severity === 'warning').length;

  const strategySummary: Record<PlannerAiPlanStrategy, string> = {
    recommended: `${evaluations.length} agents reviewed ${actions.length} balanced actions with blocked work kept visible.`,
    'min-downtime': `${evaluations.length} agents reviewed a production-first plan that trades higher residual risk for the lowest stop-time.`,
    'max-reliability': `${evaluations.length} agents reviewed a reliability-first plan that accepts longer maintenance windows.`,
    'production-sync': `${evaluations.length} agents reviewed a changeover-aligned plan with low crew strain but tighter kit timing.`,
  };

  return {
    strategy,
    headline: `${evaluations.length} agents reviewed ${actions.length} action${actions.length === 1 ? '' : 's'}`,
    summary:
      blockedActionCount > 0
        ? `${blockedActionCount} blocker${blockedActionCount === 1 ? '' : 's'} remain visible — treat this as guided planning, not auto-execution.`
        : warningActionCount > 0
          ? `${warningActionCount} cross-agent caution${warningActionCount === 1 ? '' : 's'} reflect the ${strategy.replace('-', ' ')} trade-off — review before apply.`
          : strategySummary[strategy],
    participatingAgents: evaluations.map((evaluation) => evaluation.agent),
    blockedActionCount,
    warningActionCount,
    conflictCount: conflicts.length,
  };
}

export function buildStrategyRiskCallouts(
  strategy: PlannerAiPlanStrategy,
  analysis: PlannerAiAnalysis,
  actions: PlannerAiPlanAction[],
): PlannerAiRiskSignal[] {
  const scheduledAssets = new Set(actions.map((action) => action.asset));

  if (strategy === 'min-downtime') {
    return analysis.criticalSignals.filter((signal) => !scheduledAssets.has(signal.asset));
  }

  if (strategy === 'production-sync') {
    return analysis.criticalSignals.filter((signal) => scheduledAssets.has(signal.asset)).slice(0, 2);
  }

  return analysis.criticalSignals.slice(0, strategy === 'max-reliability' ? 4 : 3);
}

export function enrichOrchestrationForStrategy(
  strategy: PlannerAiPlanStrategy,
  orchestration: PlannerAiOrchestrationResult,
  analysis: PlannerAiAnalysis,
  _summary: PlannerAiVariantSummary,
) {
  const agentConflicts = buildStrategyAgentConflicts(strategy, analysis, orchestration.actions);
  const feasibilityChecklist = buildStrategyFeasibilityChecklist(strategy, analysis, orchestration.actions);
  const agentReasoning = buildStrategyAgentReasoning(strategy, orchestration.agentEvaluations, agentConflicts);
  const orchestrationSummary = buildStrategyOrchestrationSummary(
    strategy,
    orchestration.actions,
    agentConflicts,
    orchestration.agentEvaluations,
  );

  return {
    feasibilityChecklist,
    agentConflicts,
    agentReasoning,
    orchestrationSummary,
  };
}
