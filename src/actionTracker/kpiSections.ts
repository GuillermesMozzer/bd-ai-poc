export type ActionTrackerSummaryFilter =
  | 'all'
  | 'pendingMyAction'
  | 'related'
  | 'open'
  | 'inProgress'
  | 'pendingApprovals'
  | 'completed'
  | 'overdue'
  | 'reopened'
  | 'canceled'
  | null;

export type ActionTrackerKpi = {
  id: Exclude<ActionTrackerSummaryFilter, null>;
  label: string;
  value: number;
  tone: string;
  urgent: boolean;
  active: boolean;
};

type ActionTrackerKpiSectionDefinition = {
  id: 'myActions' | 'siteFactoryActions';
  title: string;
  description: string;
  kpiIds: ActionTrackerKpi['id'][];
};

export const actionTrackerKpiSectionDefinitions: ActionTrackerKpiSectionDefinition[] = [
  {
    id: 'myActions',
    title: 'My Actions',
    description: 'Personal workload for the logged-in user.',
    kpiIds: ['pendingMyAction', 'related'],
  },
  {
    id: 'siteFactoryActions',
    title: 'Action Overview',
    description: 'Status-based view of the current action queue.',
    kpiIds: ['all', 'open', 'inProgress', 'pendingApprovals', 'completed', 'overdue', 'reopened', 'canceled'],
  },
];

export function buildActionTrackerKpiSections(kpis: readonly ActionTrackerKpi[]) {
  return actionTrackerKpiSectionDefinitions.map((section) => ({
    ...section,
    kpis: section.kpiIds
      .map((kpiId) => kpis.find((kpi) => kpi.id === kpiId))
      .filter((kpi): kpi is ActionTrackerKpi => Boolean(kpi)),
  }));
}

export function toggleActionTrackerSummaryFilter(
  currentFilter: ActionTrackerSummaryFilter,
  nextFilter: ActionTrackerSummaryFilter,
) {
  if (nextFilter === 'all') return null;
  return currentFilter === nextFilter ? null : nextFilter;
}
