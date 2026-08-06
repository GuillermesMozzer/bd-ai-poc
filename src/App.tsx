import React, { lazy, Suspense } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getMuiTheme } from './theme';
import { NotificationProvider } from './shopfloor/contexts/NotificationContext';
import { ActionTrackerProvider } from './actionTracker/contexts/ActionTrackerContext';
import { WorkstationProvider } from './workstation/contexts/WorkstationContext';
import { ShiftManagementProvider } from './shiftManagement/contexts/ShiftManagementContext';
import { AuthProvider, useAuthContext } from './auth/contexts/AuthContext';
import { ThemeModeProvider, useThemeMode } from './common/contexts/ThemeModeContext';
import AppErrorBoundary from './common/components/AppErrorBoundary';
import AppContent from './AppContent';
import LoginScreen from './auth/LoginScreen';

function AppRoot() {
  const {
    isAuthenticated,
    currentUserName,
    handleLogin,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginError,
    isLoginLoading,
  } = useAuthContext();

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

  return (
    <WorkstationProvider loggedInUserName={currentUserName}>
      <NotificationProvider>
        <ActionTrackerProvider currentUserName={currentUserName}>
          <ShiftManagementProvider>
            <AppContent />
          </ShiftManagementProvider>
        </ActionTrackerProvider>
      </NotificationProvider>
    </WorkstationProvider>
  );
}

function ThemedApp() {
  const { themeMode } = useThemeMode();
  const theme = React.useMemo(() => getMuiTheme(themeMode), [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WorkstationProvider loggedInUserName="">
        <AuthProvider>
          <AppRoot />
        </AuthProvider>
      </WorkstationProvider>
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
