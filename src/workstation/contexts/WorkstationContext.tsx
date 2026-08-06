import * as React from 'react';
import { createContext, useContext, ReactNode } from 'react';
import { useWorkstationActions } from '../hooks/useWorkstationActions';
import { type AppScreen } from '../../navigation/navigationConfig';

type WorkstationContextType = ReturnType<typeof useWorkstationActions>;

const WorkstationContext = createContext<WorkstationContextType | undefined>(undefined);

export const WorkstationProvider = ({
  children,
  setCurrentScreen,
  loggedInUserName,
}: {
  children: ReactNode;
  setCurrentScreen?: (screen: AppScreen) => void;
  loggedInUserName: string;
}) => {
  const actions = useWorkstationActions({ setCurrentScreen, loggedInUserName });

  return (
    <WorkstationContext.Provider value={actions}>
      {children}
    </WorkstationContext.Provider>
  );
};

export const useWorkstationContext = () => {
  const context = useContext(WorkstationContext);
  if (context === undefined) {
    throw new Error('useWorkstationContext must be used within a WorkstationProvider');
  }
  return context;
};
