import React from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Avatar,
  Button,
  Divider,
  Popover,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  InputAdornment,
  Chip,
  Switch,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Apps as AppsIcon,
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  AutoAwesome as SparkleIcon,
  Description as DocumentIcon,
  Home as HomeIcon,
  LocationOn as LocationOnIcon,
  ExpandMore as ExpandMoreIcon,
  NoteAdd as NoteAddIcon,
  CheckCircleOutline as SuccessIcon,
  ErrorOutline as CriticalIcon,
  InfoOutlined as InfoIcon,
  WarningAmber as WarningIcon,
  LocalShipping as LocalShippingIcon,
  PhoneAndroid as PhoneAndroidIcon,
  QrCodeScanner as QrCodeScannerIcon,
  FactCheck as FactCheckIcon,
  RocketLaunch as RocketLaunchIcon,
} from '@mui/icons-material';
import { type AppScreen, type AppNavigationKey } from './navigationConfig';
import { useShiftManagementContext } from '../shiftManagement/contexts/ShiftManagementContext';
import HeaderHierarchyPicker from './HeaderHierarchyPicker';
import {DEFAULT_HEADER_HIERARCHY_SELECTION_ID, findHeaderHierarchyPath} from './headerHierarchy';
import { useNotificationContext } from '../shopfloor/contexts/NotificationContext';
import { useThemeMode } from '../common/contexts/ThemeModeContext';
import { APP_EDITION_META, useEditionContext } from '../common/contexts/EditionContext';
import { useAuthContext } from '../auth/contexts/AuthContext';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

export interface MainLayoutProps {
  children: React.ReactNode;
  // Navigation State
  currentScreen: AppScreen;
  activeNavigationKey: AppNavigationKey;
  isSideNavExpanded: boolean;
  setIsSideNavExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  isMobileSideNavOpen: boolean;
  setIsMobileSideNavOpen: React.Dispatch<React.SetStateAction<boolean>>;

  // User Info
  currentUserInitials: string;
  currentUserName: string;

  // Handlers
  onItemClick: (item: any) => void;
  onItemHover: (item: any) => void;
  openSmartSearch: () => void;
  setIsAppLibraryOpen: (open: boolean) => void;
  setIsAiDrawerOpen: (open: boolean) => void;
  onOpenAiAssistant?: () => void;
  setCurrentScreen: (screen: any) => void;
  goToLastWorkstation: () => void;

  // Header Hierarchy
  siteMenuAnchorEl: HTMLElement | null;
  openSiteMenu: (event: React.MouseEvent<HTMLElement>) => void;
  closeSiteMenu: () => void;
  selectedHeaderHierarchyId: string;
  favoriteHeaderHierarchyIds: string[];
  selectHeaderHierarchy: (nodeId: string) => void;
  toggleFavoriteHeaderHierarchy: (nodeId: string) => void;

  // User Menu
  userMenuAnchorEl: HTMLElement | null;
  openUserMenu: (event: React.MouseEvent<HTMLElement>) => void;
  closeUserMenu: () => void;

  // Alerts
  alertsPreviewCount: number;
  openAlertsPreview: (event: React.MouseEvent<HTMLElement>) => void;

  // Workstation Specific
  showWorkstationSubMenu: boolean;
  workstationSubMenu?: React.ReactNode;

  // Miscellaneous
  isControlTowerScreen: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  currentScreen,
  activeNavigationKey,
  isSideNavExpanded,
  setIsSideNavExpanded,
  isMobileSideNavOpen,
  setIsMobileSideNavOpen,
  currentUserInitials,
  currentUserName,
  onItemClick,
  onItemHover,
  openSmartSearch,
  setIsAppLibraryOpen,
  setIsAiDrawerOpen,
  onOpenAiAssistant,
  setCurrentScreen,
  goToLastWorkstation,
  siteMenuAnchorEl,
  openSiteMenu,
  closeSiteMenu,
  selectedHeaderHierarchyId,
  favoriteHeaderHierarchyIds,
  selectHeaderHierarchy,
  toggleFavoriteHeaderHierarchy,
  userMenuAnchorEl,
  openUserMenu,
  closeUserMenu,
  alertsPreviewCount,
  openAlertsPreview,
  showWorkstationSubMenu,
  workstationSubMenu,
  isControlTowerScreen,
}) => {
  const { setIsShiftEntryOpen, setShiftEntryMode } = useShiftManagementContext().logbook;
  const {
    alertsPreviewCount: inboxAlertsPreviewCount,
    alertsPreviewRows,
    dismissAlert,
    expandAlertsDashboard,
    formatAlertTime,
    openAlertFromPreview,
  } = useNotificationContext();
  const [alertsAnchorEl, setAlertsAnchorEl] = React.useState<HTMLElement | null>(null);
  const [logisticsMenuAnchor, setLogisticsMenuAnchor] = React.useState<HTMLElement | null>(null);
  const { themeMode, setThemeMode, toggleThemeMode } = useThemeMode();
  const { edition, clearEdition, isInsideLogistics } = useEditionContext();
  const { handleLogout } = useAuthContext();
  const editionMeta = edition ? APP_EDITION_META[edition] : null;

  const switchAppVersion = () => {
    closeUserMenu();
    handleLogout();
    clearEdition();
  };

  const openLogisticsJourney = (screen: AppScreen) => {
    setLogisticsMenuAnchor(null);
    setCurrentScreen(screen);
  };

  const handleShiftEntryClick = () => {
    setShiftEntryMode('maintenance');
    setIsShiftEntryOpen(true);
  };

  const previewIconBySeverity = {
    success: <SuccessIcon sx={{ color: 'var(--token-success-main)', fontSize: 19 }} />,
    warning: <WarningIcon sx={{ color: 'var(--token-warning-main)', fontSize: 19 }} />,
    critical: <CriticalIcon sx={{ color: 'var(--token-error-main)', fontSize: 19 }} />,
    info: <InfoIcon sx={{ color: 'var(--token-info-main)', fontSize: 19 }} />,
  } as const;

  const selectedHierarchyPath = findHeaderHierarchyPath(selectedHeaderHierarchyId)
    ?? findHeaderHierarchyPath(DEFAULT_HEADER_HIERARCHY_SELECTION_ID)
    ?? [];
  const selectedHierarchyLabels = selectedHierarchyPath.map((node) => node.label);
  const selectedHierarchyBadge = selectedHierarchyLabels[selectedHierarchyLabels.length - 1] ?? 'BD Global';
  const selectedHierarchyTrail = selectedHierarchyLabels.length > 1
    ? `${selectedHierarchyLabels.slice(0, -1).join(' / ')} /`
    : '';
  const isGlobalViewScreen = currentScreen === 'global_view';
  const isMobileOpsScreen = currentScreen === 'logistics_mobile_ops';
  const usesTrueViewportScale = isGlobalViewScreen || isMobileOpsScreen;

  React.useLayoutEffect(() => {
    if (typeof document === 'undefined') return undefined;

    const root = document.documentElement;
    if (isMobileOpsScreen) {
      root.dataset.logisticsMobileOps = 'true';
    } else {
      delete root.dataset.logisticsMobileOps;
    }

    return () => {
      delete root.dataset.logisticsMobileOps;
    };
  }, [isMobileOpsScreen]);

  return (
    <Box
      sx={{
        minHeight: usesTrueViewportScale ? '100dvh' : '100vh',
        height: isGlobalViewScreen ? '100dvh' : undefined,
        overflow: isGlobalViewScreen ? 'hidden' : undefined,
        '@media screen and (max-width: 1280px)': {
          minHeight: usesTrueViewportScale ? '100dvh' : '133.33vh',
        },
        '@media screen and (min-width: 1281px) and (max-width: 1366px)': {
          minHeight: usesTrueViewportScale ? '100dvh' : '128.2vh',
        },
        '@media screen and (min-width: 1367px) and (max-width: 1440px)': {
          minHeight: usesTrueViewportScale ? '100dvh' : '120.5vh',
        },
        '@media screen and (min-width: 1441px) and (max-width: 1600px)': {
          minHeight: usesTrueViewportScale ? '100dvh' : '111.1vh',
        },
        '@media screen and (min-width: 1601px) and (max-width: 1920px)': {
          minHeight: usesTrueViewportScale ? '100dvh' : '105.3vh',
        },
        '@media screen and (min-width: 1921px)': {
          minHeight: '100vh',
        },
        display: 'flex',
        bgcolor: isControlTowerScreen ? 'var(--control-tower-bg)' : 'background.default',
      }}
    >
      <Box component="a" href="#main-content" data-skip-link sx={{ position: 'absolute', top: -100, left: 0, '&:focus': { top: 0, zIndex: 9999 } }}>
        Skip to main content
      </Box>

      {/* Side Navigation hidden as per user request */}

      <Box sx={{ minWidth: 0, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: isMobileOpsScreen ? '100dvh' : '100vh' }}>
        {/* App Bar */}
        {!isControlTowerScreen && !isMobileOpsScreen && (
          <AppBar
            position="sticky"
            sx={{
              top: 0,
              zIndex: 1100,
              bgcolor: '#060A3D',
              backgroundImage: 'none',
              boxShadow: 'none',
              borderBottom: '1px solid var(--appbar-border-bottom)',
              borderRadius: 0, // Ensure header is square
            }}
          >
            <Toolbar variant="dense" sx={{ minHeight: 52, px: 2, pl: 0, gap: 1 }}>
              {/* Left Section: Apps Menu, Brand, and Location Display */}
              <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {/* Apps Menu Block */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 52,
                    height: 52,
                    bgcolor: 'var(--appbar-control-bg)',
                    borderRight: '1px solid var(--appbar-control-border)',
                    mr: 2,
                    flexShrink: 0,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setIsAppLibraryOpen(true)}
                    sx={{
                      color: 'var(--appbar-on-color)',
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'var(--appbar-control-hover-bg)' },
                    }}
                  >
                    <AppsIcon sx={{ fontSize: 20 }} />
                  </IconButton>
                </Box>

                {/* Brand Logo and Text */}
                <Box
                  onClick={() => setCurrentScreen('ai_assistant')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    component="img"
                    src="/images/bd-symbol-rgb.png"
                    alt="BD"
                    sx={{
                      height: 24,
                      width: 'auto',
                      filter: 'brightness(0) invert(1)',
                    }}
                  />
                  <Typography variant="h6" sx={{ color: 'var(--appbar-on-color)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: 0 }}>
                    BD
                  </Typography>
                </Box>

                {/* Location Display */}
                <Box
                  onClick={openSiteMenu}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    ml: 2,
                    px: 1,
                    py: 0.5,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    color: 'var(--appbar-on-color-subtle)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: 'var(--appbar-control-hover-bg)',
                      color: 'var(--appbar-on-color)',
                    },
                  }}
                >
                  <LocationOnIcon sx={{ fontSize: 14, color: 'var(--appbar-on-color-subtle)' }} />
                  <Typography
                    sx={{
                      fontSize: '0.72rem',
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {selectedHierarchyTrail} {selectedHierarchyBadge === 'BD Global' ? 'Sandy, USA' : selectedHierarchyBadge}
                  </Typography>
                  <ExpandMoreIcon sx={{ fontSize: 14, color: 'var(--appbar-on-color-subtle)' }} />
                </Box>
              </Box>

              {/* Spacer */}
              <Box sx={{ flexGrow: 1 }} />

              {/* Right Section: Search Bar, Actions, and Profile */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, md: 1, lg: 1.5 }, flexShrink: 0 }}>
                {/* Search Bar */}
                <TextField
                  size="small"
                  placeholder="Search (Ctrl + K)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      openSmartSearch();
                    }
                  }}
                  sx={{
                    width: { sm: 140, md: 180, lg: 220 },
                    '& .MuiOutlinedInput-root': {
                      height: 32,
                      borderRadius: '12px',
                      px: 1.5,
                      backgroundColor: 'var(--appbar-control-bg) !important',
                      '& fieldset': { border: 'none' },
                      '&:hover': {
                        backgroundColor: 'var(--appbar-control-hover-bg) !important',
                      },
                      '&.Mui-focused': {
                        backgroundColor: 'var(--appbar-control-hover-bg) !important',
                        border: '1px solid var(--appbar-control-border)',
                      },
                    },
                    '& .MuiInputBase-input': {
                      color: 'white !important',
                      fontSize: '0.75rem',
                      p: 0,
                      '&::placeholder': {
                        color: 'var(--appbar-on-color-subtle) !important',
                        opacity: 1,
                      },
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end" sx={{ cursor: 'pointer' }} onClick={openSmartSearch}>
                        <SearchIcon sx={{ fontSize: 16, color: 'var(--appbar-on-color-subtle)' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <Divider orientation="vertical" flexItem sx={{ bgcolor: 'var(--appbar-control-border)', mx: 0.5, my: 1.5 }} />

                {/* Quick actions button */}
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleShiftEntryClick}
                  startIcon={<NoteAddIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: 'var(--active-theme-primary-light)',
                    borderRadius: '8px',
                    px: 1.8,
                    height: 32,
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: 0,
                    whiteSpace: 'nowrap',
                    '&:hover': { bgcolor: 'var(--active-theme-primary)' },
                  }}
                >
                  QUICK ACTIONS
                </Button>

                {/* Home Button - returns to the last opened workstation */}
                <IconButton
                  size="small"
                  onClick={goToLastWorkstation}
                  aria-label="Go to my workstation"
                  title="My workstation"
                  sx={{
                    color: 'var(--appbar-on-color-muted)',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      color: 'var(--appbar-on-color)',
                      bgcolor: 'var(--appbar-control-hover-bg)',
                    },
                  }}
                >
                  <HomeIcon sx={{ fontSize: 18 }} />
                </IconButton>

                {/* Sparkle Icon */}
                <IconButton
                  size="small"
                  onClick={() => (onOpenAiAssistant ? onOpenAiAssistant() : setIsAiDrawerOpen(true))}
                  sx={{
                    color: 'var(--appbar-on-color-muted)',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      color: 'var(--appbar-on-color)',
                      bgcolor: 'var(--appbar-control-hover-bg)',
                    },
                  }}
                >
                  <SparkleIcon sx={{ fontSize: 18 }} />
                </IconButton>

                {/* Notification Bell */}
                <IconButton
                  size="small"
                  onClick={(event) => setAlertsAnchorEl(event.currentTarget)}
                  sx={{
                    color: 'var(--appbar-on-color-muted)',
                    width: 32,
                    height: 32,
                    '&:hover': {
                      color: 'var(--appbar-on-color)',
                      bgcolor: 'var(--appbar-control-hover-bg)',
                    },
                  }}
                >
                  <Badge
                    variant="dot"
                    invisible={inboxAlertsPreviewCount === 0}
                    sx={{
                      '& .MuiBadge-badge': {
                        bgcolor: 'var(--token-error-main)',
                        minWidth: 8,
                        width: 8,
                        height: 8,
                        top: 2,
                        right: 2,
                      }
                    }}
                  >
                    <NotificationsIcon sx={{ fontSize: 18 }} />
                  </Badge>
                </IconButton>

                {/* Edition badge / Inside Logistics launcher */}
                {editionMeta ? (
                  isInsideLogistics ? (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<LocalShippingIcon sx={{ fontSize: 16 }} />}
                        endIcon={<ExpandMoreIcon sx={{ fontSize: 16 }} />}
                        onClick={(event) => setLogisticsMenuAnchor(event.currentTarget)}
                        sx={{
                          display: { xs: 'none', sm: 'inline-flex' },
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '0.72rem',
                          bgcolor: '#FF5F00',
                          color: '#fff',
                          mr: 0.5,
                          '&:hover': { bgcolor: '#e05500' },
                        }}
                      >
                        Inside Logistics
                      </Button>
                      <Menu
                        anchorEl={logisticsMenuAnchor}
                        open={Boolean(logisticsMenuAnchor)}
                        onClose={() => setLogisticsMenuAnchor(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem onClick={() => openLogisticsJourney('logistics_mobile_ops')}>
                          <ListItemIcon><PhoneAndroidIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="1. Lupita — Dock Tablet" secondary="Logistics Mobile Ops" />
                        </MenuItem>
                        <MenuItem onClick={() => openLogisticsJourney('guided_tasks')}>
                          <ListItemIcon><QrCodeScannerIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="2. Pepe — Zebra RF" secondary="Guided Tasks" />
                        </MenuItem>
                        <MenuItem onClick={() => openLogisticsJourney('quality_release')}>
                          <ListItemIcon><FactCheckIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="3. Alejandra — QA Release" secondary="Quality Release" />
                        </MenuItem>
                        <MenuItem onClick={() => openLogisticsJourney('shipment_readiness')}>
                          <ListItemIcon><RocketLaunchIcon fontSize="small" /></ListItemIcon>
                          <ListItemText primary="4. Gaby — SpaceX Cockpit" secondary="Shipment Readiness" />
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Chip
                      size="small"
                      label="Smart Factory"
                      sx={{
                        display: { xs: 'none', md: 'inline-flex' },
                        height: 26,
                        fontWeight: 800,
                        fontSize: '0.68rem',
                        bgcolor: 'rgba(4,78,215,0.16)',
                        color: 'var(--appbar-on-color)',
                        border: '1px solid var(--appbar-control-border)',
                        mr: 0.5,
                      }}
                    />
                  )
                ) : null}

                {/* User Avatar */}
                <IconButton onClick={openUserMenu} sx={{ p: 0, ml: 0.5 }}>
                  <Avatar
                    src="https://i.pravatar.cc/150?u=danilo"
                    sx={{
                      width: 32,
                      height: 32,
                      border: '1px solid var(--appbar-control-border)',
                    }}
                  >
                    {currentUserInitials}
                  </Avatar>
                </IconButton>
              </Box>
            </Toolbar>
          </AppBar>
        ) // End of !isControlTowerScreen check
}

        {/* Site Menu Popover */}
        <Popover
          open={Boolean(siteMenuAnchorEl)}
          anchorEl={siteMenuAnchorEl}
          onClose={closeSiteMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: 'fit-content',
              mt: 1,
              borderRadius: '12px',
              border: '1px solid var(--menu-border-color)',
              boxShadow: 'var(--paper-shadow)',
              overflow: 'hidden',
              bgcolor: 'var(--menu-surface-bg)',
            },
          }}
        >
          <HeaderHierarchyPicker
            selectedId={selectedHeaderHierarchyId}
            favoriteIds={favoriteHeaderHierarchyIds}
            onToggleFavorite={toggleFavoriteHeaderHierarchy}
            onSelect={(nodeId) => {
              selectHeaderHierarchy(nodeId);
              closeSiteMenu();
            }}
          />
        </Popover>

        <Popover
          open={Boolean(alertsAnchorEl)}
          anchorEl={alertsAnchorEl}
          onClose={() => setAlertsAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: 420,
              maxWidth: 'calc(100vw - 24px)',
              mt: 1,
              borderRadius: '12px',
              border: '1px solid var(--menu-border-color)',
              boxShadow: 'none',
              overflow: 'hidden',
              bgcolor: 'var(--menu-surface-bg)',
            },
          }}
        >
          <Box sx={{ px: 1.2, py: 1, borderBottom: '1px solid var(--menu-divider-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--active-theme-text-primary)' }}>
              Alerts <Box component="span" sx={{ color: 'var(--active-theme-text-secondary)' }}>({inboxAlertsPreviewCount})</Box>
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setAlertsAnchorEl(null);
                expandAlertsDashboard();
              }}
              sx={{
                minHeight: 26,
                px: 1,
                borderRadius: '999px',
                textTransform: 'none',
                fontSize: '0.68rem',
                fontWeight: 700,
                color: 'var(--active-theme-primary)',
                borderColor: 'var(--button-outlined-border)',
                boxShadow: 'none',
              }}
            >
              Show All Alerts
            </Button>
          </Box>
          <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 0.7, minHeight: 148 }}>
            {alertsPreviewRows.length ? alertsPreviewRows.map((alert) => (
              <Box
                key={alert.id}
                sx={{
                  border: '1px solid var(--menu-divider-color)',
                  borderLeft: `3px solid var(--alert-row-border-${alert.severity})`,
                  borderRadius: '10px',
                  px: 0.9,
                  py: 0.75,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 0.85,
                  bgcolor: 'var(--menu-surface-bg)',
                }}
              >
                <Box sx={{ flexShrink: 0, width: 24, height: 24, borderRadius: '8px', bgcolor: 'var(--appbar-control-hover-bg)', display: 'grid', placeItems: 'center' }}>
                  {previewIconBySeverity[alert.severity]}
                </Box>
                <Box
                  sx={{ minWidth: 0, flex: 1, cursor: 'pointer' }}
                  onClick={() => {
                    setAlertsAnchorEl(null);
                    openAlertFromPreview(alert);
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'var(--active-theme-text-secondary)', fontWeight: 600, fontSize: '0.66rem', lineHeight: 1.3 }}>
                    {alert.source} • {formatAlertTime(alert.createdAt)}
                  </Typography>
                  <Typography sx={{ color: 'var(--active-theme-text-primary)', fontWeight: 700, lineHeight: 1.28, fontSize: '0.76rem', mt: 0.22 }}>
                    {alert.message}
                  </Typography>
                  <Typography sx={{ color: 'var(--active-theme-text-secondary)', fontWeight: 600, lineHeight: 1.3, fontSize: '0.68rem', mt: 0.28 }}>
                    {alert.reference}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => dismissAlert(alert.id)}
                  sx={{ minHeight: 24, color: 'var(--active-theme-primary)', fontWeight: 700, minWidth: 0, fontSize: '0.66rem', px: 0.45, borderRadius: '999px', textTransform: 'none' }}
                >
                  Dismiss
                </Button>
              </Box>
            )) : (
              <Box sx={{ py: 3.5, textAlign: 'center' }}>
                <Typography sx={{ color: 'var(--active-theme-text-secondary)', fontWeight: 600, fontSize: '0.76rem' }}>No active alerts assigned to you.</Typography>
              </Box>
            )}
          </Box>
        </Popover>

        {/* User Menu Popover */}
        <Popover
          open={Boolean(userMenuAnchorEl)}
          anchorEl={userMenuAnchorEl}
          onClose={closeUserMenu}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: 240,
              mt: 1,
              borderRadius: '12px',
              border: '1px solid var(--menu-border-color)',
              boxShadow: 'var(--paper-shadow)',
              p: 0.8,
            },
          }}
        >
          <Box sx={{ p: 1.5, borderBottom: '1px solid var(--menu-divider-color)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'var(--active-theme-text-primary)' }}>{currentUserName}</Typography>
            <Typography variant="caption" sx={{ color: 'var(--active-theme-text-secondary)' }}>
              {editionMeta ? `${editionMeta.shortTitle} · ${editionMeta.badge}` : 'Operations Lead'}
            </Typography>
          </Box>
          <List disablePadding sx={{ py: 0.5 }}>
            <ListItemButton sx={{ borderRadius: 1.5, '&:hover': { bgcolor: 'var(--menu-hover-bg)' } }}>
              <ListItemText primary="Account Settings" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
            </ListItemButton>
            <ListItemButton sx={{ borderRadius: 1.5, '&:hover': { bgcolor: 'var(--menu-hover-bg)' } }}>
              <ListItemText primary="Notifications" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
            </ListItemButton>
            <ListItemButton onClick={toggleThemeMode} sx={{ borderRadius: 1.5, '&:hover': { bgcolor: 'var(--menu-hover-bg)' } }}>
              <ListItemText primary="Dark Mode" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
              <Switch
                size="small"
                checked={themeMode === 'dark'}
                onClick={(event) => event.stopPropagation()}
                onChange={(_, checked) => setThemeMode(checked ? 'dark' : 'light')}
                inputProps={{ 'aria-label': 'Dark mode' }}
              />
            </ListItemButton>
            <ListItemButton onClick={switchAppVersion} sx={{ borderRadius: 1.5, '&:hover': { bgcolor: 'var(--menu-hover-bg)' } }}>
              <SwapHorizIcon sx={{ fontSize: 18, mr: 1, color: 'var(--active-theme-text-secondary)' }} />
              <ListItemText
                primary="Switch app version"
                secondary={editionMeta ? `Current: ${editionMeta.shortTitle}` : undefined}
                primaryTypographyProps={{ fontSize: 13, fontWeight: 700 }}
                secondaryTypographyProps={{ fontSize: 11 }}
              />
            </ListItemButton>
            <Divider sx={{ my: 0.5, borderColor: 'var(--menu-divider-color)' }} />
            <ListItemButton
              onClick={() => {
                closeUserMenu();
                handleLogout();
              }}
              sx={{ borderRadius: 1.5, color: 'var(--danger-text)', '&:hover': { bgcolor: 'var(--menu-hover-bg)' } }}
            >
              <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: 13, fontWeight: 700 }} />
            </ListItemButton>
          </List>
        </Popover>

        {/* Main Content Area */}
        <Box id="main-content" component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default React.memo(MainLayout);
