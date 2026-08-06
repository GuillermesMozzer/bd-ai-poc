import { type AiMessage, type AiPriorityCard } from '../types';
import {
  MY_AI_ASSISTANT_INTRO_COPY,
  MY_AI_ASSISTANT_TECHNICIAN_CARD_CONTENT,
  buildMyAiAssistantGreeting,
  buildMyAiAssistantTechnicianPriorityHeading,
} from './myAiAssistantContent';

const MAINTENANCE_REQUEST_INTENT_PATTERNS = [
  /\b(create|open|start|log|submit|raise|file)\b.*\bmaintenance request\b/i,
  /\bmaintenance request\b.*\b(create|open|start|log|submit|raise|file|help)\b/i,
  /\bhelp\b.*\b(maintenance request|report.{0,12}issue|log.{0,12}issue)\b/i,
  /\b(report|log).{0,20}\b(issue|breakdown|equipment problem)\b/i,
  /\bneed\b.*\b(maintenance request|support).{0,30}\b(issue|breakdown|equipment)\b/i,
  /\bguide\b.*\bmaintenance request\b/i,
];

export function isMaintenanceRequestIntent(message: string) {
  const normalized = message.trim();
  if (!normalized) return false;
  return MAINTENANCE_REQUEST_INTENT_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function buildTechnicianMaintenanceRequestAckMessage(): AiMessage {
  return {
    role: 'assistant',
    text:
      'I can guide you step-by-step to open a maintenance request. I will ask each question in order and only open Operations Entry after we have everything captured.',
    badge: 'Technician assistant',
  };
}

export function buildTechnicianDrawerIntroMessages(firstName: string): AiMessage[] {
  return [
    {
      role: 'assistant',
      text: buildMyAiAssistantGreeting('Good afternoon', firstName),
    },
    {
      role: 'assistant',
      text: MY_AI_ASSISTANT_INTRO_COPY.technicianSummary,
    },
    {
      role: 'assistant',
      text: MY_AI_ASSISTANT_INTRO_COPY.technicianPriorityPrompt,
      heading: buildMyAiAssistantTechnicianPriorityHeading(),
      variant: 'priority_cards',
    },
  ];
}

export function buildTechnicianDrawerPriorityCards(
  onOpenMaintenanceRequestGuide: () => void,
): AiPriorityCard[] {
  const maintenanceRequestCard: AiPriorityCard = {
    id: 'technician-open-maintenance-request',
    title: 'Open Maintenance Request',
    signal: 'Maintenance',
    detail: 'Guide me step-by-step to create and submit a maintenance request.',
    rank: 1,
    priority: 'Guided flow',
    accent: '#044ED7',
    action: onOpenMaintenanceRequestGuide,
  };

  return [
    maintenanceRequestCard,
    ...MY_AI_ASSISTANT_TECHNICIAN_CARD_CONTENT.map((card, index) => ({
      id: card.id,
      title: card.title,
      signal: card.owner,
      detail: card.detail,
      rank: index + 2,
      priority: card.severity,
      accent: card.color,
    })),
  ];
}
