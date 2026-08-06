import React, { createContext, useContext, ReactNode } from 'react';
import { useActionTrackerActions } from '../hooks/useActionTrackerActions';
import { type AppScreen } from '../../navigation/navigationConfig';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';

type ActionTrackerContextType = ReturnType<typeof useActionTrackerActions>;

const ActionTrackerContext = createContext<ActionTrackerContextType | undefined>(undefined);

export const ActionTrackerProvider = ({
  children,
  setCurrentScreen: externalSetCurrentScreen,
  currentUserName,
}: {
  children: ReactNode;
  setCurrentScreen?: (screen: AppScreen) => void;
  currentUserName: string;
}) => {
  const workstation = useWorkstationContext();
  const setCurrentScreen = externalSetCurrentScreen || workstation.setCurrentScreen;
  const actions = useActionTrackerActions({ setCurrentScreen, currentUserName });

  return (
    <ActionTrackerContext.Provider value={actions}>
      {children}
    </ActionTrackerContext.Provider>
  );
};

export const useActionTrackerContext = () => {
  const context = useContext(ActionTrackerContext);
  if (context === undefined) {
    throw new Error('useActionTrackerContext must be used within a ActionTrackerProvider');
  }
  return context;
};
