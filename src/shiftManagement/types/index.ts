import { TeamManagementMember, TeamShiftDefinition, DayShiftSetup, TeamManagementDay } from './teamTypes';

export interface ShiftMember {
  name: string;
  status?: 'vacation' | 'overtime' | 'absence' | 'swap' | 'dayoff';
  aiSignal?: boolean;
}

export interface ShiftRow {
  id: 'morning' | 'afternoon' | 'night';
  label: string;
  hours: string;
}

export interface InsightCard {
  id: string;
  title: string;
  detail: string;
  action: string;
  bg: string;
  iconBg: string;
  tone: string;
}

export interface ShiftAiInsight {
  title: string;
  detail: string;
  candidates: string[];
}

export interface ShiftMemberProfile {
  role: string;
  location: string;
  upcomingVacation: string;
  workingHours: number;
  overtimeHours: number;
  absenceDays: number;
}
