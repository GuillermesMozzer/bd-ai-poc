import React, { createContext, useContext, ReactNode } from 'react';
import { useAppAuth } from '../hooks/useAppAuth';
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
  const auth = useAppAuth();

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
