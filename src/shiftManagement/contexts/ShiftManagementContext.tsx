import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useShiftLogbookActions } from '../hooks/useShiftLogbookActions';
import { useShiftSettingsActions } from '../hooks/useShiftSettingsActions';
import { useShiftScheduleActions } from '../hooks/useShiftScheduleActions';
import { useTeamManagementActions, defaultShiftDefinitions as teamShiftDefinitionsImport } from '../hooks/useTeamManagementActions';
import { type AppScreen } from '../../navigation/navigationConfig';
import { type TeamShiftDefinition } from '../types/teamTypes';
import { 
  initialShiftConfigItems, 
  initialCrewPatternItems,
  initialLinePatternAssignmentItems,
  initialHolidayItems, 
  initialShiftRequestItems 
} from '../../shopfloor/data';

import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';

type ShiftManagementContextType = {
  logbook: ReturnType<typeof useShiftLogbookActions>;
  settings: ReturnType<typeof useShiftSettingsActions>;
  schedule: ReturnType<typeof useShiftScheduleActions>;
  teamManagement: ReturnType<typeof useTeamManagementActions>;
  teamShiftDefinitions: TeamShiftDefinition[];
  setTeamShiftDefinitions: React.Dispatch<React.SetStateAction<TeamShiftDefinition[]>>;
  renderShiftSchedulePersistentActions: () => React.ReactNode;
  setRenderShiftSchedulePersistentActions: (renderer: () => React.ReactNode) => void;
  setCurrentScreen: (screen: AppScreen) => void;
};

const ShiftManagementContext = createContext<ShiftManagementContextType | undefined>(undefined);

export const ShiftManagementProvider = ({
  children,
  setCurrentScreen: externalSetCurrentScreen,
}: {
  children: ReactNode;
  setCurrentScreen?: (screen: AppScreen) => void;
}) => {
  const workstation = useWorkstationContext();
  const setCurrentScreen = externalSetCurrentScreen || workstation.setCurrentScreen;
  const [teamShiftDefinitions, setTeamShiftDefinitions] = useState<TeamShiftDefinition[]>(teamShiftDefinitionsImport);
  const [renderShiftSchedulePersistentActions, setRenderShiftSchedulePersistentActions] = useState<() => React.ReactNode>(() => () => null);

  const logbook = useShiftLogbookActions({ setCurrentScreen });
  const teamManagement = useTeamManagementActions({ setCurrentScreen });
  const settings = useShiftSettingsActions({
    initialShiftConfigItems,
    initialCrewPatternItems,
    initialLinePatternAssignmentItems,
    initialHolidayItems,
    initialShiftRequestItems,
  });
  const schedule = useShiftScheduleActions({
    teamShiftDefinitions,
    setTeamShiftDefinitions,
  });

  return (
    <ShiftManagementContext.Provider value={{
      logbook,
      settings,
      schedule,
      teamManagement,
      teamShiftDefinitions,
      setTeamShiftDefinitions,
      renderShiftSchedulePersistentActions,
      setRenderShiftSchedulePersistentActions,
      setCurrentScreen,
    }}>
      {children}
    </ShiftManagementContext.Provider>
  );
};

export const useShiftManagementContext = () => {
  const context = useContext(ShiftManagementContext);
  if (context === undefined) {
    const stack = new Error().stack
      ?.split('\n')
      .slice(2, 6)
      .map((line) => line.trim())
      .join(' | ');
    throw new Error(`useShiftManagementContext must be used within a ShiftManagementProvider${stack ? ` :: ${stack}` : ''}`);
  }
  return context;
};

export const useOptionalShiftManagementContext = () => useContext(ShiftManagementContext);
