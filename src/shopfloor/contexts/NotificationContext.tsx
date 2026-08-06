import React, { createContext, useContext, ReactNode } from 'react';
import { useNotificationActions } from '../hooks/useNotificationActions';
import { type AppScreen } from '../../navigation/navigationConfig';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';
import { useAuthContext } from '../../auth/contexts/AuthContext';

type NotificationContextType = ReturnType<typeof useNotificationActions>;

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({
  children,
  setCurrentScreen: externalSetCurrentScreen,
}: {
  children: ReactNode;
  setCurrentScreen?: (screen: AppScreen) => void;
}) => {
  const workstation = useWorkstationContext();
  const { currentUserName, currentUserRole } = useAuthContext();
  const setCurrentScreen = externalSetCurrentScreen || workstation.setCurrentScreen;
  const actions = useNotificationActions({ currentUserName, currentUserRole, setCurrentScreen });

  return (
    <NotificationContext.Provider value={actions}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
