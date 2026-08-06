import { maintenanceLaneData } from '../../data';
import type { MaintenanceCard } from '../../types';
import type { PlannerAiSourceKind, PlannerAiWorkItem } from '../types';

function parseDurationLabel(detail: string, fallbackHours = 1): { durationLabel: string; durationHours: number } {
  if (detail.toLowerCase().includes('immediate')) {
    return { durationLabel: '2h', durationHours: 2 };
  }

  if (detail.toLowerCase().includes('inspection')) {
    return { durationLabel: '1h', durationHours: 1 };
  }

  return { durationLabel: `${fallbackHours}h`, durationHours: fallbackHours };
}

function toWorkItem(
  card: MaintenanceCard,
  sourceKind: PlannerAiSourceKind,
  statusLabel: string,
  tags: string[] = [],
): PlannerAiWorkItem {
  const { durationLabel, durationHours } = parseDurationLabel(card.detail, card.priority === 'Emergency' ? 2 : 1);
  return {
    id: card.id,
    sourceKind,
    asset: card.title,
    title: card.title,
    workOrderLabel: sourceKind === 'follow-up-request' ? `REQ-${card.id.toUpperCase()}` : `WO-${card.id.toUpperCase()}`,
    workType: sourceKind === 'follow-up-request' ? 'Corrective' : 'Preventive',
    priorityLabel: card.priority,
    durationLabel,
    durationHours,
    statusLabel,
    summary: card.detail,
    assigneeName: card.assignee,
    tags: [...(card.tags ?? []), ...tags],
    equipmentCriticality: card.equipmentCriticality,
  };
}

export type FollowUpPlanningSnapshot = {
  requests: PlannerAiWorkItem[];
  planning: PlannerAiWorkItem[];
  scheduled: PlannerAiWorkItem[];
  inProgress: PlannerAiWorkItem[];
  blockedScheduled: PlannerAiWorkItem[];
};

export function getFollowUpPlanningSnapshot(): FollowUpPlanningSnapshot {
  const requests = maintenanceLaneData.requests.map((card) => toWorkItem(card, 'follow-up-request', 'Request'));
  const planning = maintenanceLaneData.team.scheduling.map((card) => toWorkItem(card, 'follow-up-planning', 'Planning'));
  const scheduled = maintenanceLaneData.team.scheduled.map((card) => toWorkItem(card, 'follow-up-scheduled', 'Scheduled'));
  const inProgress = maintenanceLaneData.team.progress.map((card) => toWorkItem(card, 'follow-up-progress', 'In Progress'));
  const blockedScheduled = scheduled.filter((item) => item.tags.some((tag) => tag.toLowerCase().includes('missing parts')));

  return {
    requests,
    planning,
    scheduled,
    inProgress,
    blockedScheduled,
  };
}
