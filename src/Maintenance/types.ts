import type { ReactNode } from 'react';

export type MaintenancePriority = 'Emergency' | 'Immediate' | 'High' | 'Medium' | 'Low' | 'Very Low';

export type MaintenanceCard = {
  id: string;
  title: string;
  detail: string;
  assignee: string;
  due: string;
  priority: MaintenancePriority;
  executionState?: 'active' | 'paused';
  equipmentCriticality?: 'A' | 'B' | 'C';
  tags?: string[];
  rejection?: {
    reason: string;
    comment: string;
    user: string;
    rejectedAt: string;
  };
};

export type PlannerCalendarRow = 'Planned & Unscheduled' | 'Day Shift' | 'Night Shift';

export type MaintenanceTeamMember = {
  name: string;
  role: string;
  team: 'Team A' | 'Team B' | 'Team C' | 'Morning';
  status: 'Available' | 'Vacation' | 'On Shift';
};

export type CbmAlertCard = {
  asset: string;
  parameter: string;
  grade: 'A' | 'B' | 'C';
  daysToFailure: number;
  healthScore: number;
  scheduled: string;
  recommended: string;
  urgent: boolean;
};

export type MaintenanceMenuId = 'performance' | 'followup' | 'planner' | 'team' | 'cbm';

export type MaintenanceMenuItem = {
  id: MaintenanceMenuId;
  label: string;
  icon: ReactNode;
  isChild?: boolean;
};

export type MaintenancePriorityStyle = {
  bg: string;
  fg: string;
  border: string;
  rank: number;
};
