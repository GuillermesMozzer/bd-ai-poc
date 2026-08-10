import React, { Suspense } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getMuiTheme } from './theme';
import { NotificationProvider } from './shopfloor/contexts/NotificationContext';
import { ActionTrackerProvider } from './actionTracker/contexts/ActionTrackerContext';
import { WorkstationProvider } from './workstation/contexts/WorkstationContext';
import { ShiftManagementProvider } from './shiftManagement/contexts/ShiftManagementContext';
import { AuthProvider, useAuthContext } from './auth/contexts/AuthContext';
import AuthNavSync from './auth/components/AuthNavSync';
import { AiProvider } from './aiHome/contexts/AiContext';
import { ThemeModeProvider, useThemeMode } from './common/contexts/ThemeModeContext';
import { EditionProvider, useEditionContext } from './common/contexts/EditionContext';
import AppErrorBoundary from './common/components/AppErrorBoundary';
import AppContent from './AppContent';
import LoginScreen from './auth/LoginScreen';
import EditionSelectScreen from './auth/EditionSelectScreen';

function AuthenticatedTree() {
  const { currentUserName } = useAuthContext();

  return (
    <WorkstationProvider loggedInUserName={currentUserName}>
      <AuthNavSync />
      <ActionTrackerProvider currentUserName={currentUserName}>
        <ShiftManagementProvider>
          <AiProvider currentUserName={currentUserName}>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </AiProvider>
        </ShiftManagementProvider>
      </ActionTrackerProvider>
    </WorkstationProvider>
  );
}

function AppRoot() {
  const { hasSelectedEdition } = useEditionContext();
  const {
    isAuthenticated,
    handleLogin,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginError,
    isLoginLoading,
  } = useAuthContext();

  if (!hasSelectedEdition) {
    return <EditionSelectScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Suspense fallback={null}>
        <LoginScreen
          handleLogin={handleLogin}
          loginEmail={loginEmail}
          setLoginEmail={setLoginEmail}
          loginPassword={loginPassword}
          setLoginPassword={setLoginPassword}
          loginError={loginError}
          isLoginLoading={isLoginLoading}
        />
      </Suspense>
    );
  }

  return <AuthenticatedTree />;
}

function ThemedApp() {
  const { themeMode } = useThemeMode();
  const theme = React.useMemo(() => getMuiTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <EditionProvider>
        <AuthProvider>
          <AppRoot />
        </AuthProvider>
      </EditionProvider>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppErrorBoundary>
      <ThemeModeProvider>
        <ThemedApp />
      </ThemeModeProvider>
    </AppErrorBoundary>
  );
}
