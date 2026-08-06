import { useState, useCallback, useMemo } from 'react';
import { 
  shiftMemberProfiles, 
  shiftScheduleWeekDays, 
  shiftScheduleShiftRows, 
  shiftScheduleEntries,
} from '../../data/mockData';
import { teamManagementMembers } from '../data/teamData';
import { defaultDayShiftSetup } from './useTeamManagementActions';
import { 
  type TeamManagementDay, 
  type TeamManagementLine, 
  type DayShiftSetup, 
  type TeamShiftDefinition,
  type TeamManagementStatus,
  type TeamManagementMember
} from '../types/teamTypes';

interface UseShiftScheduleActionsProps {
  teamShiftDefinitions: TeamShiftDefinition[];
  setTeamShiftDefinitions: React.Dispatch<React.SetStateAction<TeamShiftDefinition[]>>;
}

export const useShiftScheduleActions = ({
  teamShiftDefinitions,
  setTeamShiftDefinitions,
}: UseShiftScheduleActionsProps) => {
  const [openShiftAiInsightKey, setOpenShiftAiInsightKey] = useState<string | null>(null);
  const [shiftReplacementOverrides, setShiftReplacementOverrides] = useState<Record<string, string>>({});
  const [resolvedShiftInsights, setResolvedShiftInsights] = useState<Record<string, boolean>>({});
  const [isShiftSwapApprovalOpen, setIsShiftSwapApprovalOpen] = useState(false);
  const [selectedShiftMember, setSelectedShiftMember] = useState<{
    workerId?: string;
    shiftId?: string;
    teamLabel?: string;
    name: string;
    status?: any;
    shiftLabel: string;
    shiftHours: string;
    dayLabel: string;
  } | null>(null);

  const [orgChartDraft, setOrgChartDraft] = useState({
    siteDirector: 'Patricia Gomez',
    operationsManager: 'Andre Souza',
    shiftLeads: ['Line 10 Lead', 'Line 11 Lead', 'Line 12 Lead'],
    qualityLead: 'Marina Costa',
    maintenanceLead: 'Roberto Lima',
  });

  const [dayShiftSetupByLine, setDayShiftSetupByLine] = useState<Record<'Combined' | 'Line A' | 'Line B', Record<TeamManagementDay, Record<string, DayShiftSetup>>>>({
    Combined: defaultDayShiftSetup as any,
    'Line A': JSON.parse(JSON.stringify(defaultDayShiftSetup)),
    'Line B': JSON.parse(JSON.stringify(defaultDayShiftSetup)),
  });

  const updateDayShiftSetup = useCallback((
    lineView: 'Combined' | 'Line A' | 'Line B',
    day: TeamManagementDay,
    shift: string,
    key: keyof DayShiftSetup,
    value: number,
  ) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(99, Math.round(value))) : 0;
    setDayShiftSetupByLine((prev) => ({
      ...prev,
      [lineView]: {
        ...prev[lineView],
        [day]: {
          ...prev[lineView][day],
          [shift]: {
            ...prev[lineView][day][shift],
            [key]: safeValue,
          },
        },
      },
    }));
  }, []);

  const updateShiftDefinition = useCallback((shiftId: string, key: 'label' | 'start' | 'end', value: string) => {
    setTeamShiftDefinitions((prev) => prev.map((shift) => (
      shift.id === shiftId ? {...shift, [key]: value} : shift
    )));
  }, [setTeamShiftDefinitions]);

  const addTeamShiftDefinition = useCallback((teamConfigDays: TeamManagementDay[]) => {
    const nextId = `Custom-${Date.now()}`;
    setTeamShiftDefinitions((prev) => [...prev, {id: nextId, label: `Custom Shift ${prev.length + 1}`, start: '08:00', end: '16:00'}]);
    setDayShiftSetupByLine((prev) => {
      const next = {...prev};
      (['Combined', 'Line A', 'Line B'] as const).forEach((lineKey) => {
        teamConfigDays.forEach((day) => {
          next[lineKey][day] = {
            ...next[lineKey][day],
            [nextId]: {operators: 0, technicians: 0, qaInspectors: 0},
          };
        });
      });
      return next;
    });
  }, [setTeamShiftDefinitions]);

  const removeTeamShiftDefinition = useCallback((shiftId: string, teamConfigDays: TeamManagementDay[]) => {
    setTeamShiftDefinitions((prev) => prev.filter((shift) => shift.id !== shiftId));
    setDayShiftSetupByLine((prev) => {
      const next = {...prev};
      (['Combined', 'Line A', 'Line B'] as const).forEach((lineKey) => {
        teamConfigDays.forEach((day) => {
          const { [shiftId]: _removed, ...rest } = next[lineKey][day];
          next[lineKey][day] = rest;
        });
      });
      return next;
    });
  }, [setTeamShiftDefinitions]);

  const applyAiDraftSchedule = useCallback((teamDraftForm: any, setTeamDraftForm: any) => {
    const recommendedOperators = teamDraftForm.shift === 'Morning'
      ? ['Ronie D\'elano', 'Daniel Brooks', 'William Parker', 'Sarah Connor']
      : teamDraftForm.shift === 'Afternoon'
        ? ['Maria Pinna', 'Emily Carter', 'Michael Thompson', 'Carlos Mendez']
        : ['Lucas Hayes', 'Sophia Mitchell', 'Ava Richardson', 'Carlos Mendez'];
    setTeamDraftForm((prev: any) => ({
      ...prev,
      operators: recommendedOperators,
      notes: `BLU.AI generated a ${prev.shift.toLowerCase()} ${prev.line.toLowerCase()} team balancing coverage, quality, and backup depth.`,
    }));
  }, []);

  const getInitials = (value: string) =>
    value
      .split(' ')
      .map((part) => part[0] ?? '')
      .join('')
      .slice(0, 2)
      .toUpperCase();

  const createInlineAvatarSrc = (name: string, accent = '#DBEAFE') => {
    const initials = getInitials(name);
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${accent}" />
            <stop offset="100%" stop-color="#ffffff" />
          </linearGradient>
        </defs>
        <rect width="96" height="96" rx="48" fill="url(#bg)" />
        <circle cx="48" cy="35" r="18" fill="#f8fafc" />
        <path d="M20 82c5-14 16-21 28-21s23 7 28 21" fill="#f8fafc" />
        <circle cx="48" cy="48" r="46" fill="none" stroke="rgba(148,163,184,0.35)" stroke-width="2" />
        <text x="48" y="87" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="#1e3a8a">${initials}</text>
      </svg>
    `.replace(/\s+/g, ' ').trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const shiftMemberAvatarMeta = useMemo(() => teamManagementMembers.reduce<Record<string, { src: string; accent: string }>>((acc, member) => {
    acc[member.name] = {
      src: member.photo || createInlineAvatarSrc(member.name, member.avatarTone),
      accent: member.avatarTone,
    };
    return acc;
  }, {}), []);

  const getShiftMemberAvatar = useCallback((name: string) =>
    shiftMemberAvatarMeta[name] ?? {
      src: createInlineAvatarSrc(name),
      accent: '#DBEAFE',
    }, [shiftMemberAvatarMeta]);

  return {
    openShiftAiInsightKey,
    setOpenShiftAiInsightKey,
    shiftReplacementOverrides,
    setShiftReplacementOverrides,
    resolvedShiftInsights,
    setResolvedShiftInsights,
    isShiftSwapApprovalOpen,
    setIsShiftSwapApprovalOpen,
    selectedShiftMember,
    setSelectedShiftMember,
    orgChartDraft,
    setOrgChartDraft,
    dayShiftSetupByLine,
    setDayShiftSetupByLine,
    updateDayShiftSetup,
    updateShiftDefinition,
    addTeamShiftDefinition,
    removeTeamShiftDefinition,
    applyAiDraftSchedule,
    getShiftMemberAvatar,
  };
};
