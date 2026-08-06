export type PlannerAiCompareDialogTab = 'compare' | 'changes' | 'details';

export function getCompareDialogTabLabel(tab: PlannerAiCompareDialogTab) {
  switch (tab) {
    case 'changes':
      return 'What changes';
    case 'details':
      return 'Agent & long-term';
    default:
      return 'Scorecard';
  }
}
