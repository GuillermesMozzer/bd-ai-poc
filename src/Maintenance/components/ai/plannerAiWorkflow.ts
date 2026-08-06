import type { PlannerAiCascadePreview } from '../../ai/types';

export type PlannerAiWorkflowStep = 1 | 2 | 3;

export function resolvePlannerAiWorkflowStep(options: {
  hasGeneratedPlan: boolean;
  isPreviewOpen: boolean;
  isCompareOpen: boolean;
  isCascadePreviewOpen: boolean;
}): PlannerAiWorkflowStep {
  if (options.isCascadePreviewOpen) {
    return 3;
  }

  if (options.isPreviewOpen) {
    return 2;
  }

  if (options.hasGeneratedPlan || options.isCompareOpen) {
    return 1;
  }

  return 1;
}

export function buildCascadeApplySuccessMessage(
  appliedCount: number,
  preview: PlannerAiCascadePreview | null,
): string {
  const changeLabel = appliedCount === 1 ? '1 weekly change' : `${appliedCount} weekly changes`;

  if (!preview) {
    return `${changeLabel} applied to the board.`;
  }

  const propagatedHorizons = preview.impacts.map((impact) => impact.horizon);
  const uniqueHorizons = [...new Set(propagatedHorizons)];
  const horizonText =
    uniqueHorizons.length > 0
      ? uniqueHorizons.join(', ')
      : 'weekly';

  const conflictNote =
    preview.conflicts.filter((conflict) => conflict.severity === 'blocker').length > 0
      ? ' Blocker conflicts remain flagged on horizon tabs.'
      : preview.horizonProjections.some((projection) => projection.conflictCount > 0)
        ? ' Horizon tabs show propagated impact markers.'
        : ' Horizon impact markers updated.';

  return `${changeLabel} applied (${preview.recommendedApplySummary}). Mock impacts propagated to ${horizonText}.${conflictNote} Use Undo to revert.`;
}
