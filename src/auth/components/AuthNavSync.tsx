import { useEffect, useRef } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useWorkstationContext } from '../../workstation/contexts/WorkstationContext';
import { resolveWorkstationCreateStreamsForRole } from '../../utils/user';
import { type AppScreen } from '../../navigation/navigationConfig';
import { useEditionContext } from '../../common/contexts/EditionContext';

/**
 * Bridges auth identity into the single WorkstationProvider after login.
 * Replaces the previous nested-provider pattern where Auth called workstation setters directly.
 */
export default function AuthNavSync() {
  const { currentUserRole, isAuthenticated } = useAuthContext();
  const { isInsideLogistics } = useEditionContext();
  const {
    setWorkstationCreateStreams,
    setCurrentScreen,
    setIsSideNavExpanded,
    setIsMobileSideNavOpen,
    setIsAiDrawerOpen,
    setAiDrawerWidth,
    setIsAppLibraryOpen,
  } = useWorkstationContext();
  const didSyncRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || didSyncRef.current) return;
    didSyncRef.current = true;

    setWorkstationCreateStreams(resolveWorkstationCreateStreamsForRole(currentUserRole));
    setIsSideNavExpanded(false);
    setIsMobileSideNavOpen(false);
    setIsAiDrawerOpen(false);
    setAiDrawerWidth(430);

    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const previewScreen = params.get('codexPreview');
    if (previewScreen === 'production_planning') {
      setCurrentScreen('production_planning' as AppScreen);
      setIsAppLibraryOpen(false);
      return;
    }

    const screenParam = params.get('screen');
    if (screenParam) {
      setCurrentScreen(screenParam as AppScreen);
      setIsAppLibraryOpen(false);
      return;
    }

    // Inside Logistics demos: open App Library so the Happy Path cards are visible immediately.
    if (isInsideLogistics) {
      setCurrentScreen('ai_assistant');
      setIsAppLibraryOpen(true);
      return;
    }

    setIsAppLibraryOpen(false);
  }, [
    currentUserRole,
    isAuthenticated,
    isInsideLogistics,
    setAiDrawerWidth,
    setCurrentScreen,
    setIsAiDrawerOpen,
    setIsAppLibraryOpen,
    setIsMobileSideNavOpen,
    setIsSideNavExpanded,
    setWorkstationCreateStreams,
  ]);

  return null;
}
