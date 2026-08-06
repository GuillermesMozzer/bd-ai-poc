import { useEffect, useState } from 'react';
import {
  resolveDisplayNameFromLogin,
  DEFAULT_USER_NAME,
  type AppSignedInViewMode,
  type AppUserRole,
  resolveSignedInViewModeForRole,
  resolveUserRoleFromLogin,
  resolveWorkstationCreateStreamsForRole,
} from '../../utils/user';
import { type AppScreen } from '../../navigation/navigationConfig';

interface UseAppAuthProps {
  setWorkstationCreateStreams: (streams: string[]) => void;
  setAiMessages: (messages: any[]) => void;
  setHomeChatInput: (val: string) => void;
  setCurrentScreen: (screen: AppScreen) => void;
  setIsSideNavExpanded: (val: boolean) => void;
  setIsMobileSideNavOpen: (val: boolean) => void;
  setIsAiDrawerOpen: (val: boolean) => void;
  setAiDrawerWidth: (val: number) => void;
  setIsDrawerOpen: (val: boolean) => void;
}

export const useAppAuth = ({
  setWorkstationCreateStreams,
  setAiMessages,
  setHomeChatInput,
  setCurrentScreen,
  setIsSideNavExpanded,
  setIsMobileSideNavOpen,
  setIsAiDrawerOpen,
  setAiDrawerWidth,
  setIsDrawerOpen,
}: UseAppAuthProps) => {
  const [loggedInUserName, setLoggedInUserName] = useState('');
  const currentUserName = loggedInUserName || DEFAULT_USER_NAME;
  const currentUserFirstName = currentUserName.split(' ')[0] || DEFAULT_USER_NAME;
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginViewMode, setLoginViewMode] = useState<AppSignedInViewMode>('line');
  const [signedInViewMode, setSignedInViewMode] = useState<AppSignedInViewMode>('line');
  const [currentUserRole, setCurrentUserRole] = useState<AppUserRole>('director');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (import.meta.env.PROD) return;
    if (isAuthenticated) return;

    const {hostname, search} = window.location;
    const isLocalPreview = hostname === '127.0.0.1' || hostname === 'localhost';
    if (!isLocalPreview) return;

    const params = new URLSearchParams(search);
    const previewScreen = params.get('codexPreview');
    if (previewScreen !== 'production_planning') return;

    const previewUser = 'Codex Preview';
    setLoggedInUserName(previewUser);
    setCurrentUserRole('director');
    setSignedInViewMode('line');
    setWorkstationCreateStreams(resolveWorkstationCreateStreamsForRole('director'));
    setAiMessages([]);
    setHomeChatInput('');
    setCurrentScreen('production_planning');
    setIsSideNavExpanded(false);
    setIsMobileSideNavOpen(false);
    setIsAiDrawerOpen(false);
    setAiDrawerWidth(430);
    setIsDrawerOpen(false);
    setIsAuthenticated(true);
    setLoginError('');
    setIsLoginLoading(false);
  }, [
    isAuthenticated,
    setAiDrawerWidth,
    setAiMessages,
    setCurrentScreen,
    setHomeChatInput,
    setIsAiDrawerOpen,
    setIsDrawerOpen,
    setIsMobileSideNavOpen,
    setIsSideNavExpanded,
    setWorkstationCreateStreams,
  ]);

  const handleLogin = () => {
    if (isLoginLoading) return;
    const email = loginEmail.trim();
    const password = loginPassword.trim();

    if (!email || !password) {
      setLoginError('Enter email and password to continue.');
      return;
    }

    const nextUserName = resolveDisplayNameFromLogin(email);
    const nextUserRole = resolveUserRoleFromLogin(email);
    const nextViewMode = resolveSignedInViewModeForRole(nextUserRole);

    setLoginError('');
    setIsLoginLoading(true);
    window.setTimeout(() => {
      setLoggedInUserName(nextUserName);
      setCurrentUserRole(nextUserRole);
      setLoginViewMode(nextViewMode);
      setSignedInViewMode(nextViewMode);
      setWorkstationCreateStreams(resolveWorkstationCreateStreamsForRole(nextUserRole));
      setAiMessages([]);
      setHomeChatInput('');
      setCurrentScreen('ai_assistant');
      setIsSideNavExpanded(false);
      setIsMobileSideNavOpen(false);
      setIsAuthenticated(true);
      setIsLoginLoading(false);
    }, 750);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginPassword('');
    setLoginError('');
    setIsLoginLoading(false);
    setLoggedInUserName('');
    setCurrentUserRole('director');
    setLoginViewMode('line');
    setSignedInViewMode('line');
    setHomeChatInput('');
    setIsAiDrawerOpen(false);
    setAiDrawerWidth(430);
    setIsDrawerOpen(false);
  };

  return {
    isAuthenticated,
    setIsAuthenticated,
    currentUserName,
    currentUserFirstName,
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    loginError,
    setLoginError,
    isLoginLoading,
    setIsLoginLoading,
    loginViewMode,
    setLoginViewMode,
    signedInViewMode,
    setSignedInViewMode,
    currentUserRole,
    handleLogin,
    handleLogout,
  };
};

