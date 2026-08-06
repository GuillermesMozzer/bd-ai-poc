import type { PublishedWorkstation } from '../publishedWorkstations';

export const OPERATOR_WORKSTATION_TOUR_START_EVENT = 'bd:operator-workstation-tour:start';
export const OPERATOR_WORKSTATION_TOUR_COMPLETE_EVENT = 'bd:operator-workstation-tour:complete';

export type OperatorWorkstationTourTarget =
  | 'safety'
  | 'quality'
  | 'line-status-overview'
  | 'operator-line-status'
  | 'operator-pending-tasks'
  | 'operator-alerts'
  | 'operator-ai-insights'
  | 'operator-shift-timeline'
  | 'operator-primary-kpis'
  | 'shift-schedule'
  | 'my-tasks'
  | 'shift-logbook';

export type OperatorWorkstationTourStep = {
  target: OperatorWorkstationTourTarget;
  title: string;
  body: string;
};

export const operatorWorkstationTourSteps: OperatorWorkstationTourStep[] = [
  {
    target: 'operator-line-status',
    title: 'Line 10 Status',
    body: 'Start here with the current Line 10 snapshot: zone, Autoguard context, product, work order, output progress, and estimated time remaining.',
  },
  {
    target: 'operator-pending-tasks',
    title: 'Pending Tasks',
    body: 'Then review the tasks the operator needs to perform next, including the upcoming CIL activity, changeover prep, open ESO, and OEE stop reason review.',
  },
  {
    target: 'operator-alerts',
    title: 'Alerts',
    body: 'Check active alerts after the task list so the operator can see what needs attention, what can be escalated, and what is already stable.',
  },
  {
    target: 'operator-ai-insights',
    title: 'AI Insights',
    body: 'Use the AI insights to understand why the line is below target and which action the assistant recommends before losses grow.',
  },
  {
    target: 'operator-shift-timeline',
    title: 'Shift Timeline',
    body: 'Move through the shift timeline to see the main events in order: shift start, changeover, quality inspection, micro-stop, and line recovery.',
  },
  {
    target: 'operator-primary-kpis',
    title: 'Primary KPIs',
    body: 'Finish with the main KPIs so the operator can quickly read OEE, scrap, downtime, throughput, and the next centerline activity.',
  },
];

export function isOperatorWorkstation(workstation: PublishedWorkstation | null | undefined) {
  if (!workstation) return false;
  const title = workstation.title.toLowerCase();
  const capabilitySignals = [...workstation.domains, ...(workstation.apps ?? [])]
    .join(' ')
    .toLowerCase();
  const isPersonalOperatorView = title.includes('operator view -');
  const hasGuidedRoutineCapabilities = /\b(cil|centerline|changeover|shift schedule|shift logbook)\b/.test(capabilitySignals);
  return title.includes('operator') && (isPersonalOperatorView || hasGuidedRoutineCapabilities);
}

export function startOperatorWorkstationTour() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPERATOR_WORKSTATION_TOUR_START_EVENT));
}

export function completeOperatorWorkstationTour() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(OPERATOR_WORKSTATION_TOUR_COMPLETE_EVENT));
}

export function getWorkstationTourTarget(widgetId: string): OperatorWorkstationTourTarget | undefined {
  if (widgetId === 'safety' || widgetId === 'safety-operator') return 'safety';
  if (widgetId === 'quality' || widgetId === 'quality-operator') return 'quality';
  if (widgetId === 'line-status-overview') return 'line-status-overview';
  if (widgetId === 'shift-schedule') return 'shift-schedule';
  if (widgetId === 'my-tasks') return 'my-tasks';
  if (widgetId === 'shift-logbook') return 'shift-logbook';
  return undefined;
}
