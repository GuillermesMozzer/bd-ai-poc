import { ShiftRow, ShiftMember, ShiftAiInsight, InsightCard, ShiftMemberProfile } from '../types';
import { shiftScheduleWeekDays, shiftScheduleEventStyles } from '../../data/mockData';
export { shiftScheduleWeekDays, shiftScheduleEventStyles };

export const shiftScheduleShiftRows = [
    { id: 'morning', label: 'Morning', hours: '06:00 - 14:00' },
    { id: 'afternoon', label: 'Afternoon', hours: '14:00 - 22:00' },
    { id: 'night', label: 'Night', hours: '22:00 - 06:00' },
  ] as const;

export const shiftScheduleEntries : Record<
    'morning' | 'afternoon' | 'night',
    Partial<Record<(typeof shiftScheduleWeekDays)[number]['key'], Array<{ name: string; status?: keyof typeof shiftScheduleEventStyles; aiSignal?: boolean }>>>
  > = {
    morning: {
      mon: [
        { name: "Ronie D'elano" },
        { name: 'Daniel Brooks' },
        { name: 'William Parker', status: 'overtime' },
        { name: 'Ethan Collins', status: 'absence' },
      ],
      tue: [
        { name: "Ronie D'elano" },
        { name: 'Daniel Brooks' },
        { name: 'William Parker', status: 'overtime' },
        { name: 'Ethan Collins', status: 'absence' },
      ],
      wed: [
        { name: "Ronie D'elano" },
        { name: 'Daniel Brooks' },
        { name: 'William Parker', status: 'overtime' },
        { name: 'Ethan Collins', status: 'absence' },
      ],
      thu: [
        { name: "Ronie D'elano" },
        { name: 'Daniel Brooks' },
        { name: 'William Parker', status: 'overtime' },
        { name: 'Ethan Collins', status: 'absence' },
      ],
      fri: [
        { name: "Ronie D'elano" },
        { name: 'Daniel Brooks' },
        { name: 'William Parker', status: 'overtime' },
        { name: 'Ethan Collins', status: 'absence' },
      ],
    },
    afternoon: {
      mon: [
        { name: 'Maria Pinna' },
        { name: 'Emily Carter' },
        { name: 'Michael Thompson' },
        { name: 'James Walker' },
      ],
      tue: [
        { name: 'Maria Pinna' },
        { name: 'Emily Carter' },
        { name: 'Michael Thompson' },
        { name: 'James Walker', status: 'absence', aiSignal: true },
      ],
      wed: [
        { name: 'Maria Pinna', status: 'swap' },
        { name: 'Emily Carter', status: 'dayoff' },
        { name: 'Michael Thompson' },
        { name: 'James Walker' },
      ],
      thu: [
        { name: 'Maria Pinna', status: 'swap' },
        { name: 'Emily Carter' },
        { name: 'Michael Thompson' },
        { name: 'James Walker' },
      ],
      fri: [
        { name: 'Maria Pinna', status: 'swap' },
        { name: 'Emily Carter' },
        { name: 'Michael Thompson' },
        { name: 'James Walker' },
      ],
    },
    night: {
      mon: [
        { name: 'Lucas Hayes' },
        { name: 'Sophia Mitchell' },
        { name: 'Olivia Bennett' },
        { name: 'Ava Richardson' },
      ],
      tue: [
        { name: 'Lucas Hayes' },
        { name: 'Sophia Mitchell' },
        { name: 'Olivia Bennett' },
        { name: 'Ava Richardson' },
      ],
      wed: [
        { name: 'Lucas Hayes' },
        { name: 'Sophia Mitchell' },
        { name: 'Olivia Bennett' },
        { name: 'Ava Richardson' },
      ],
      thu: [
        { name: 'Lucas Hayes' },
        { name: 'Sophia Mitchell' },
        { name: 'Olivia Bennett' },
        { name: 'Ava Richardson' },
      ],
      fri: [
        { name: 'Lucas Hayes' },
        { name: 'Sophia Mitchell' },
        { name: 'Olivia Bennett' },
        { name: 'Ava Richardson' },
      ],
    },
  };

export const shiftScheduleAiInsights : Record<string, { title: string; detail: string; candidates: string[] }> = {
    'afternoon-tue': {
      title: 'James Walker is absent',
      detail: 'James Walker called sick on March 17. BLU.AI recommends a shift swap to protect afternoon throughput and avoid handoff risk.',
      candidates: ['Carlos Mendez', 'Noah Philis', 'Maria Noladim'],
    },
    'afternoon-wed': {
      title: 'Swap still pending confirmation',
      detail: 'Coverage for the afternoon swap has not been fully confirmed yet. Finalize replacement before 13:30.',
      candidates: ['Maria Noladim', 'Carlos Mendez', 'Sergio Roswell'],
    },
  };

export const shiftScheduleInsightCards = [
    {
      id: 'critical-absence',
      title: 'Critical now',
      detail: '1 absence was reported 5 minutes before shift start. BLU.AI recommends assigning James Walker backup coverage to protect afternoon throughput.',
      action: 'Take action now',
      tone: '#E43B46',
      bg: '#FFF5F5',
      iconBg: '#FEE2E2',
    },
    {
      id: 'overtime-risk',
      title: 'Overtime risk',
      detail: 'Coverage pressure is climbing on Line B. Reallocate 1 operator from Line B to reduce overtime exposure and stabilize output.',
      action: 'Reallocate now',
      tone: '#64748B',
      bg: '#F8FAFC',
      iconBg: '#EEF2FF',
    },
  ] as const;

export const shiftSchedulePendingSwap = {
    title: 'Pending swap needs approval',
    from: 'Daniel Brooks',
    to: 'Michael Thompson',
    note: 'Scheduled for tomorrow morning',
  } as const;

export const shiftMemberProfiles : Record<string, { role: string; location: string; upcomingVacation: string; workingHours: number; overtimeHours: number; absenceDays: number }> = {
    'James Walker': { role: 'Operator', location: 'Z6', upcomingVacation: '10 Apr - 18 Apr 2026 (8 days)', workingHours: 152, overtimeHours: 0, absenceDays: 4 },
    'Maria Pinna': { role: 'Technician', location: 'Z2', upcomingVacation: '22 May - 27 May 2026 (5 days)', workingHours: 164, overtimeHours: 3, absenceDays: 0 },
    'Emily Carter': { role: 'Operator', location: 'Z4', upcomingVacation: 'No vacation planned', workingHours: 158, overtimeHours: 2, absenceDays: 1 },
    'Michael Thompson': { role: 'Process Engineer', location: 'Z3', upcomingVacation: '03 Jun - 07 Jun 2026 (4 days)', workingHours: 149, overtimeHours: 1, absenceDays: 0 },
    'Carlos Mendez': { role: 'Operator', location: 'Z6', upcomingVacation: 'No vacation planned', workingHours: 161, overtimeHours: 4, absenceDays: 0 },
  };

export const orgChartInitial = { siteDirector: 'Robert Chen', operationsManager: 'Elena Rodriguez', qualityLead: 'Sarah Johnson', maintenanceLead: 'Mike Wilson', shiftLeads: ['Crew Lead A', 'Crew Lead B', 'Crew Lead C'], };
