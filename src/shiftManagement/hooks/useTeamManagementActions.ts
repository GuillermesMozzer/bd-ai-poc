import { useState } from 'react';
import { type AppScreen } from '../../navigation/navigationConfig';
import { 
  TeamManagementDay, 
  TeamManagementShift, 
  TeamShiftDefinition, 
  DayShiftSetup 
} from '../types/teamTypes';

export const teamConfigDays: TeamManagementDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const defaultShiftDefinitions: TeamShiftDefinition[] = [
  { id: 'Morning', label: 'Morning', start: '06:00', end: '14:00' },
  { id: 'Afternoon', label: 'Afternoon', start: '14:00', end: '22:00' },
  { id: 'Night', label: 'Night', start: '22:00', end: '06:00' },
];

export const defaultDayShiftSetup: Record<TeamManagementDay, Record<string, DayShiftSetup>> = {
  Monday: { Morning: { operators: 9, technicians: 3, qaInspectors: 2 }, Afternoon: { operators: 8, technicians: 3, qaInspectors: 2 }, Night: { operators: 7, technicians: 2, qaInspectors: 1 } },
  Tuesday: { Morning: { operators: 9, technicians: 3, qaInspectors: 2 }, Afternoon: { operators: 8, technicians: 3, qaInspectors: 2 }, Night: { operators: 7, technicians: 2, qaInspectors: 1 } },
  Wednesday: { Morning: { operators: 9, technicians: 3, qaInspectors: 2 }, Afternoon: { operators: 8, technicians: 3, qaInspectors: 2 }, Night: { operators: 7, technicians: 2, qaInspectors: 1 } },
  Thursday: { Morning: { operators: 9, technicians: 3, qaInspectors: 2 }, Afternoon: { operators: 8, technicians: 3, qaInspectors: 2 }, Night: { operators: 7, technicians: 2, qaInspectors: 1 } },
  Friday: { Morning: { operators: 9, technicians: 3, qaInspectors: 2 }, Afternoon: { operators: 8, technicians: 3, qaInspectors: 2 }, Night: { operators: 7, technicians: 2, qaInspectors: 1 } },
  Saturday: { Morning: { operators: 7, technicians: 2, qaInspectors: 1 }, Afternoon: { operators: 7, technicians: 2, qaInspectors: 1 }, Night: { operators: 6, technicians: 2, qaInspectors: 1 } },
  Sunday: { Morning: { operators: 7, technicians: 2, qaInspectors: 1 }, Afternoon: { operators: 7, technicians: 2, qaInspectors: 1 }, Night: { operators: 6, technicians: 2, qaInspectors: 1 } },
};

export const useTeamManagementActions = ({
  setCurrentScreen,
}: any) => {
  const [isTeamAiInsightsOpen, setIsTeamAiInsightsOpen] = useState(true);
  const [teamManagementLineView, setTeamManagementLineView] = useState<'Combined' | 'Line A' | 'Line B'>('Combined');
  const [teamManagementDayView, setTeamManagementDayView] = useState<TeamManagementDay>('Monday');
  const [teamManagementSearch, setTeamManagementSearch] = useState('');
  const [teamManagementFilters, setTeamManagementFilters] = useState({
    zone: 'All',
    equipment: 'All',
    certification: 'All',
    role: 'All',
  });
  const [selectedTeamManagementMemberName, setSelectedTeamManagementMemberName] = useState<string | null>(null);
  const [isTeamDraftDialogOpen, setIsTeamDraftDialogOpen] = useState(false);
  const [isOrgChartDialogOpen, setIsOrgChartDialogOpen] = useState(false);
  const [teamDraftForm, setTeamDraftForm] = useState({
    name: 'Weekend',
    shift: 'Morning' as TeamManagementShift,
    line: 'Line A' as 'Line A' | 'Line B',
    notes: 'Cross-train the new team against packaging and QA support coverage.',
    operators: ['Maria Pinna', 'Carlos Mendez', 'Emily Carter'],
  });

  return {
    isTeamAiInsightsOpen,
    setIsTeamAiInsightsOpen,
    teamManagementLineView,
    setTeamManagementLineView,
    teamManagementDayView,
    setTeamManagementDayView,
    teamManagementSearch,
    setTeamManagementSearch,
    teamManagementFilters,
    setTeamManagementFilters,
    selectedTeamManagementMemberName,
    setSelectedTeamManagementMemberName,
    isTeamDraftDialogOpen,
    setIsTeamDraftDialogOpen,
    isOrgChartDialogOpen,
    setIsOrgChartDialogOpen,
    teamDraftForm,
    setTeamDraftForm,
  };
};
