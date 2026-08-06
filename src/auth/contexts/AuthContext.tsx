import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAppAuth } from '../hooks/useAppAuth';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';
import { type AppSignedInViewMode, type AppUserRole } from '../../utils/user';

interface AuthContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  currentUserName: string;
  currentUserFirstName: string;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  loginError: string;
  setLoginError: (val: string) => void;
  isLoginLoading: boolean;
  setIsLoginLoading: (val: boolean) => void;
  loginViewMode: AppSignedInViewMode;
  setLoginViewMode: (val: AppSignedInViewMode) => void;
  signedInViewMode: AppSignedInViewMode;
  setSignedInViewMode: (val: AppSignedInViewMode) => void;
  currentUserRole: AppUserRole;
  handleLogin: () => void;
  handleLogout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    setCurrentScreen,
    setIsSideNavExpanded,
    setIsMobileSideNavOpen,
    setIsAiDrawerOpen,
    setAiDrawerWidth,
    setIsAppLibraryOpen,
    setWorkstationCreateStreams,
  } = useWorkstationContext();

  // Note: Since we don't have the AiContext yet in useAppAuth, we pass dummy setters
  // This will be fixed by refactoring useAppAuth to not require them, or consume from context inside.
  // For now, let's keep it as is and just satisfy the interface.
  const auth = useAppAuth({
    setWorkstationCreateStreams,
    setAiMessages: () => {}, // Handled by handleLogin directly if needed or via effect
    setHomeChatInput: () => {},
    setCurrentScreen,
    setIsSideNavExpanded,
    setIsMobileSideNavOpen,
    setIsAiDrawerOpen,
    setAiDrawerWidth,
    setIsDrawerOpen: setIsAppLibraryOpen,
  });

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
