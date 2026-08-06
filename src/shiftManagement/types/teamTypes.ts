import { ActionTrackerRow } from '../../actionTracker/types';

export type TeamManagementShift = string;
export type TeamManagementDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type TeamManagementLine = 'A' | 'B';
export type TeamManagementStatus = 'available' | 'lunch' | 'break' | 'out';

export type TeamManagementMember = {
  name: string;
  role: string;
  photo: string;
  shift: TeamManagementShift;
  line: TeamManagementLine;
  zone: string;
  equipment: string;
  certification: string;
  status: TeamManagementStatus;
  statusDetail: string;
  timeWindow: string;
  avatarTone: string;
  utilization: number;
  workedDays: number;
  sickLeave: number;
  attendance: number;
  overtimeHours: number;
  upcomingVacation: string;
  supervisorInsight: string;
  skills: string[];
  certifications: Array<{ name: string; expires: string }>;
  weeklySchedule: Array<{ day: string; hours: string; note: string }>;
};

export type DayShiftSetup = {
  operators: number;
  technicians: number;
  qaInspectors: number;
};

export type TeamShiftDefinition = {
  id: string;
  label: string;
  start: string;
  end: string;
};
