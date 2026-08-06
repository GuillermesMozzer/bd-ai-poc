import { ReactNode } from 'react';

export type AiPriorityTone = 'critical' | 'warning' | 'info' | 'success';

export type AiPriorityProgressItem = {
  label: string;
  state: 'done' | 'active' | 'pending';
};

export type AiPriorityCard = {
  id: string;
  title: string;
  signal: string;
  detail: string;
  rank: number;
  dueDate?: string;
  assignedTo?: string;
  priority?: string;
  accent?: string;
  action?: () => void;
  inputStepId?: string;
  inputCode?: string;
  inputUnit?: string;
  inputPlaceholder?: string;
  inputLabel?: string;
  inputActionLabel?: string;
  rangeLabel?: string;
  evidenceLabel?: string;
};

export type AiMessage = {
  role: 'user' | 'assistant';
  text: string;
  variant?: 'message' | 'action' | 'priority_summary' | 'typing' | 'priority_progress' | 'priority_cards' | 'quick_actions';
  actionLabel?: string;
  accent?: string;
  action?: () => void;
  heading?: string;
  badge?: string;
  progressTitle?: string;
  progressDetail?: string;
  progressItems?: AiPriorityProgressItem[];
  priorityCards?: AiPriorityCard[];
  bulletItems?: Array<{
    label: string;
    value: string;
    detail?: string;
    accent?: string;
  }>;
  compactCards?: boolean;
  priorityReasons?: Array<{
    label: string;
    detail: string;
    tone: AiPriorityTone;
  }>;
  priorityChanges?: string[];
  quickActions?: Array<{
    label: string;
    icon?: ReactNode;
    action: () => void;
  }>;
};

export type UrgentAiTask = {
  title: string;
  detail: string;
  owner: string;
  severity: string;
  color: string;
  action: () => void;
};

export type AiEntryCard = {
  title: string;
  caption: string;
  icon: ReactNode;
  color: string;
  action: () => void;
};

export type SmartHubKpi = {
  label: string;
  value: string;
  tone: string;
  note: string;
};

export type SmartHubDeepInsight = {
  title: string;
  detail: string;
  tone: string;
};

export type HomeWidgetSize = 'small' | 'medium' | 'large';

export type HomeSiteScope = string;

export type SmartSearchCategory =
  | 'All'
  | 'Documents'
  | 'Tasks & Work Orders'
  | 'Notifications'
  | 'Trainings'
  | 'Assets'
  | 'Time Series'
  | '3D'
  | 'Action Tracking'
  | 'ESO'
  | 'Shift Notes';
