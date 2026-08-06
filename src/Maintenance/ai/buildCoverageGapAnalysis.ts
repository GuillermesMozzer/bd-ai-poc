import type { PlannerAiCoverageRecommendation, PlannerAiCoverageSummary } from './types';

export function buildCoverageGapRecommendations(summary: PlannerAiCoverageSummary): PlannerAiCoverageRecommendation[] {
  const criticalCells = summary.cells.filter((cell) => cell.status === 'critical');
  const thinCells = summary.cells.filter((cell) => cell.status === 'thin');

  const recommendations: PlannerAiCoverageRecommendation[] = [];

  criticalCells.forEach((cell, index) => {
    recommendations.push({
      id: `gap-critical-${cell.id}-${index}`,
      title: `${cell.zone} ${cell.category} (${cell.shift} shift) is critically thin`,
      summary: `Only ${cell.technicianCount} qualified technician${cell.technicianCount === 1 ? '' : 's'} cover ${cell.category} in ${cell.zone} on the ${cell.shift} shift. Prioritize cross-training, authorize overtime, or engage a contractor before adding overlapping work.`,
      priority: 'high',
      cellId: cell.id,
      actionType: 'cross-train',
    });
  });

  thinCells.slice(0, 4).forEach((cell, index) => {
    recommendations.push({
      id: `gap-thin-${cell.id}-${index}`,
      title: `${cell.zone} ${cell.category} (${cell.shift} shift) needs buffer`,
      summary: `${cell.technicianCount} technicians currently cover ${cell.category} in ${cell.zone}. Consider a shift swap or bundling work to protect the recovery buffer.`,
      priority: 'medium',
      cellId: cell.id,
      actionType: cell.shift === 'night' ? 'overtime' : 'shift-swap',
    });
  });

  if (!recommendations.length) {
    recommendations.push({
      id: 'gap-healthy',
      title: 'Coverage is adequate across visible zones',
      summary: 'No critical skill gaps are visible in the current planner snapshot. Continue bundling work in constrained zones to preserve buffer capacity.',
      priority: 'low',
    });
  }

  return recommendations;
}

export function enrichCoverageSummary(summary: PlannerAiCoverageSummary): PlannerAiCoverageSummary {
  const recommendations = buildCoverageGapRecommendations(summary);
  return {
    ...summary,
    recommendations,
  };
}
