import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals } from '../theme';
import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  Paper,
  Chip,
  Alert,
} from '@mui/material';
import {
  Apps as AppsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Search as SearchIcon,
  Description as DescriptionIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AccountBox as AccountBoxIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  CalendarToday as CalendarTodayIcon,
  BuildCircle as BuildCircleIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Close as CloseIcon,
  Add as AddIcon,
  ChevronRight as ChevronRightIcon,
  Dashboard as DashboardIcon,
  AccountTree as AccountTreeIcon,
  Build as BuildIcon,
  BarChart as BarChartIcon,
  Inventory2 as InventoryIcon,
  AccountTree as AssetExplorerIcon,
  Timeline as TimelineIcon,
  SyncAlt as SyncAltIcon,
  Edit as EditIcon,
  Groups as GroupsIcon,
  GridOn as GridIcon,
  LocalShipping as LocalShippingIcon,
  PhoneAndroid as PhoneAndroidIcon,
  QrCodeScanner as QrCodeScannerIcon,
  FactCheck as FactCheckIcon,
  RocketLaunch as RocketLaunchIcon,
} from '@mui/icons-material';
import { readPublishedWorkstations } from '../publishedWorkstations';
import { useWorkstationContext } from '../contexts/WorkstationContext';
import { useShiftManagementContext } from '../../shiftManagement/contexts/ShiftManagementContext';
import { useEditionContext } from '../../common/contexts/EditionContext';
import { type AppScreen } from '../../navigation/navigationConfig';

interface AppLibraryDrawerProps {
  activeTheme: any;
}

const AppLibraryDrawer: React.FC<AppLibraryDrawerProps> = ({
  activeTheme,
}) => {
  const {
    currentScreen,
    setCurrentScreen,
    isAppLibraryOpen: open,
    setIsAppLibraryOpen,
    homeViewMode,
    setHomeViewMode,
    activePredefinedWorkstationTitle,
    activeWorkstationId,
    openPredefinedWorkstation,
    openPublishedWorkstation,
    openBlankWorkstationDraft,
    launchSmartSearch,
    setIsAiDrawerOpen,
  } = useWorkstationContext();

  const { setIsShiftEntryOpen, setShiftEntryMode } = useShiftManagementContext().logbook;
  const { isInsideLogistics } = useEditionContext();

  const onClose = () => setIsAppLibraryOpen(false);

  const openLogisticsScreen = (screen: AppScreen) => {
    setCurrentScreen(screen);
    onClose();
  };

  const insideLogisticsJourneys = [
    {
      label: '1. Lupita',
      caption: 'Dock Tablet',
      screen: 'logistics_mobile_ops' as AppScreen,
      icon: <PhoneAndroidIcon sx={{ fontSize: 22 }} />,
      color: '#044ED7',
    },
    {
      label: '2. Pepe',
      caption: 'Zebra RF Picking',
      screen: 'guided_tasks' as AppScreen,
      icon: <QrCodeScannerIcon sx={{ fontSize: 22 }} />,
      color: '#0B5CAB',
    },
    {
      label: '3. Alejandra',
      caption: 'QA E-Signature',
      screen: 'quality_release' as AppScreen,
      icon: <FactCheckIcon sx={{ fontSize: 22 }} />,
      color: '#0f766e',
    },
    {
      label: '4. Gaby',
      caption: 'SpaceX Cockpit',
      screen: 'shipment_readiness' as AppScreen,
      icon: <RocketLaunchIcon sx={{ fontSize: 22 }} />,
      color: '#FF5F00',
    },
  ];

  const openSmartSearch = () => {
    launchSmartSearch({
      draftQuery: 'Show me Columbus West site details with focus on Area A, Line 10, Zone 1.',
      focusHierarchyId: 'plant-columbus-west',
      hierarchySeedId: 'plant-columbus-west',
      preset: 'columbus-west-site',
    });
    onClose();
  };

  const lightHeaderIconButtonSx = {
    bgcolor: 'transparent',
    color: workstationVisuals.textSecondary,
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      bgcolor: tokenNeutral.lighter,
      color: workstationVisuals.tierTextHeading,
    },
  };

  const workstationDrawerCardSx = {
    transition: 'all 0.2s ease-in-out',
  };

  const workstationPresetOptions: string[] = [
    'Operator View',
    'Leader View',
    'Tier 1',
    'Tier 2',
    'Tier 3',
    'Maintenance Leader',
    'Maintenance Planner',
    'Spare Parts',
    'Maintenance Technician',
  ];

  const mainTabs = [
    {
      key: 'workstations',
      label: 'Workstation',
      icon: <AppsIcon sx={{ fontSize: 24 }} />,
      active: currentScreen === 'workstations' || currentScreen === 'my_workstation' || currentScreen === 'workstation',
      action: () => {
        openPublishedWorkstation('sample-maintenance-technician');
        onClose();
      },
    },
    {
      key: 'blu_ai',
      label: 'BD Atlas AI',
      icon: <AutoAwesomeIcon sx={{ fontSize: 24 }} />,
      active: currentScreen === 'ai_assistant',
      action: () => {
        setHomeViewMode('chatbot');
        setCurrentScreen('ai_assistant');
        onClose();
      },
    },
    {
      key: 'smart_search',
      label: 'Smart Search',
      icon: <SearchIcon sx={{ fontSize: 24 }} />,
      active: currentScreen === 'smart_search',
      action: () => {
        openSmartSearch();
      },
    },
    {
      key: 'document_manager',
      label: 'Documents',
      icon: <DescriptionIcon sx={{ fontSize: 24 }} />,
      active: currentScreen === 'document_management',
      action: () => {
        setCurrentScreen('document_management');
        onClose();
      },
    },
  ];

  const circularButtons = [
    {
      label: 'Operator',
      icon: <AccountBoxIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => {
        openPublishedWorkstation('sample-operator-view');
        onClose();
      },
    },
    {
      label: 'Tier 1',
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => {
        openPublishedWorkstation('sample-tier-1');
        onClose();
      },
    },
    {
      label: 'Tier 2',
      icon: <GroupsIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => {
        openPublishedWorkstation('sample-tier-2');
        onClose();
      },
    },
    {
      label: 'Tier 3',
      icon: <BarChartIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => {
        openPublishedWorkstation('sample-tier-3');
        onClose();
      },
    },
    {
      label: 'OEE',
      icon: <PieChartIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => {
        openPublishedWorkstation('sample-oee');
        onClose();
      },
    },
    {
      label: 'Leader',
      icon: <BuildCircleIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => {
        openPublishedWorkstation('sample-maintenance-leader');
        onClose();
      },
    },
    {
      label: 'Maint. Planner',
      icon: <DashboardIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => {
        openPublishedWorkstation('sample-maintenance-planner');
        onClose();
      },
    },
    {
      label: 'Spare Parts',
      icon: <InventoryIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => {
        openPublishedWorkstation('sample-spare-parts');
        onClose();
      },
    },
    {
      label: 'Technician',
      icon: <BuildIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => {
        openPublishedWorkstation('sample-maintenance-technician');
        onClose();
      },
    },
    {
      label: 'My Actions',
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => {
        setCurrentScreen('action_tracker');
        onClose();
      },
    },
  ];

  const moreSolutionsItems = [
    { label: 'Lupita Dock', icon: <PhoneAndroidIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'logistics_mobile_ops' },
    { label: 'Pepe Zebra RF', icon: <QrCodeScannerIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'guided_tasks' },
    { label: 'Alejandra QA', icon: <FactCheckIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'quality_release' },
    { label: 'Gaby Shipping', icon: <LocalShippingIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'shipment_readiness' },
    { label: 'Calendar', icon: <CalendarTodayIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'shift_schedule' },
    { label: 'Maintenance Analytics', icon: <BarChartIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'maintenance_performance' },
    { label: 'Production Planner', icon: <AccountTreeIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'production_planning' },
    { label: 'ASN Portal', icon: <SyncAltIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'external_transfer_portal' },
    { label: 'Equipment Ledger', icon: <DescriptionIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'equipment_ledger' },
    { label: 'Asset Explorer', icon: <AssetExplorerIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'asset_explorer' },
    { label: 'Spare Parts', icon: <BuildIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'tool_crib' },
    { label: 'Line Monitoring', icon: <TimelineIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'control_tower' },
    { label: 'Shift Trends', icon: <ShowChartIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'line_performance' },
    { label: 'Shift Handover', icon: <EditIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'shift_logbook' },
    { label: 'Centerline', icon: <DescriptionIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'centerline_kpis' },
    { label: 'Tier Meeting', icon: <GroupsIcon sx={{ fontSize: 18, color: tokenBrand.main }} />, screen: 'tier_meeting' },

  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 460 },
          p: 0,
          background: workstationVisuals.pageBackground,
          color: activeTheme.textPrimary,
          borderRight: `1px solid ${workstationVisuals.tierBorder}`,
          boxShadow: workstationVisuals.tierShadow,
        },
      }}
    >
      {/* Top Bar with Grid Icon and Close */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <IconButton size="small" sx={lightHeaderIconButtonSx}>
          <AppsIcon />
        </IconButton>
        <IconButton onClick={onClose} size="small" sx={lightHeaderIconButtonSx}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Main Drawer Scroll Area */}
      <Box sx={{ p: 3, pt: 1, overflowY: 'auto', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        
        {/* Navigation Tabs Card */}
        <Paper
          elevation={0}
          sx={{
            p: 1.25,
            borderRadius: 3.5,
            border: `1px solid ${workstationVisuals.tierBorder}`,
            background: 'rgba(29, 116, 255, 0.02)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 0.5,
          }}
        >
          {mainTabs.map((tab) => (
            <Box
              key={tab.key}
              component="button"
              onClick={tab.action}
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 0.8,
                py: 1.5,
                borderRadius: 2.5,
                border: 'none',
                cursor: 'pointer',
                bgcolor: tab.active ? tokenBrand.softBg : 'transparent',
                color: tab.active ? tokenBrand.main : workstationVisuals.textSecondary,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: tab.active ? tokenBrand.selectedBg : 'var(--surface-hover-bg)',
                },
              }}
            >
              <Box sx={{ color: tokenBrand.main }}>
                {tab.icon}
              </Box>
              <Typography sx={{ fontSize: 11.5, fontWeight: 700 }}>
                {tab.label}
              </Typography>
            </Box>
          ))}
        </Paper>

        {isInsideLogistics ? (
          <Paper
            elevation={0}
            sx={{
              p: 2.25,
              borderRadius: 3.5,
              border: '1px solid rgba(255,95,0,0.35)',
              background: 'linear-gradient(160deg, rgba(255,95,0,0.08), rgba(4,78,215,0.06))',
              boxShadow: workstationVisuals.tierShadow,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.25 }}>
              <Box>
                <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 900, fontSize: 17 }}>
                  Inside Logistics · Happy Path
                </Typography>
                <Typography sx={{ color: workstationVisuals.textSecondary, fontSize: 12, mt: 0.25 }}>
                  Open in this order: Lupita → Pepe → Alejandra → Gaby
                </Typography>
              </Box>
              <Chip label="V7" size="small" sx={{ fontWeight: 900, bgcolor: '#FF5F00', color: '#fff' }} />
            </Box>
            <Alert severity="info" sx={{ mb: 1.5, borderRadius: 2, py: 0 }}>
              Start with <strong>Lupita</strong> (Dock 3) to unlock Alejandra&apos;s lot and Gaby&apos;s GO.
            </Alert>
            <Grid container spacing={1.25}>
              {insideLogisticsJourneys.map((item) => (
                <Grid key={item.screen} size={{ xs: 6 }}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => openLogisticsScreen(item.screen)}
                    aria-label={`Open ${item.label}: ${item.caption}`}
                    sx={{
                      width: '100%',
                      textAlign: 'left',
                      border: `1px solid ${workstationVisuals.tierBorder}`,
                      borderRadius: 2.5,
                      bgcolor: workstationVisuals.tierSurface,
                      p: 1.25,
                      minHeight: 88,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      font: 'inherit',
                      '&:hover': {
                        borderColor: item.color,
                        transform: 'translateY(-1px)',
                        boxShadow: workstationVisuals.tierShadow,
                      },
                      '&:focus-visible': {
                        outline: '3px solid #044ED7',
                        outlineOffset: 2,
                      },
                      '@media (prefers-reduced-motion: reduce)': {
                        transition: 'none',
                        '&:hover': { transform: 'none' },
                      },
                    }}
                  >
                    <Box
                      aria-hidden
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: `${item.color}14`,
                        color: item.color,
                        mb: 0.8,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Typography sx={{ fontWeight: 850, fontSize: 13, color: workstationVisuals.textPrimary }}>
                      {item.label}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: workstationVisuals.textSecondary, fontWeight: 600 }}>
                      {item.caption}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        ) : null}

        {/* My Workstation Circular Menu Card */}
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: 3.5,
            border: `1px solid ${workstationVisuals.tierBorder}`,
            background: workstationVisuals.tierSurface,
            boxShadow: workstationVisuals.tierShadow,
          }}
        >
          <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 800, fontSize: 18, mb: 2.5 }}>
            Workstation
          </Typography>
          <Grid container spacing={2}>
            {circularButtons.map((btn) => (
              <Grid key={btn.label} size={{ xs: 4 }} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box
                  component="button"
                  onClick={btn.action}
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: tokenBrand.softBg,
                    border: `1px solid ${tokenBrand.selectedBg}`,
                    cursor: 'pointer',
                    transition: 'all 0.22s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      bgcolor: tokenBrand.selectedBg,
                      boxShadow: workstationVisuals.tierShadow,
                    },
                    '&:active': {
                      transform: 'scale(0.96)',
                    },
                  }}
                >
                  {btn.icon}
                </Box>
                <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: workstationVisuals.textSecondary, mt: 1, textAlign: 'center', lineHeight: 1.25, maxWidth: 85 }}>
                  {btn.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* My Workstations List (Chips with Add Workstation button) */}
        <Paper
          elevation={0}
          sx={{
            ...workstationDrawerCardSx,
            p: 2.5,
            borderRadius: 3.5,
            border: `1px solid ${workstationVisuals.tierBorder}`,
            background: workstationVisuals.tierSurface,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 2.5 }}>
            <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 800, fontSize: 18 }}>
              My Workstations
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                onClose();
                openBlankWorkstationDraft();
              }}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
                borderRadius: 2,
                px: 1.5,
                py: 0.5,
                fontSize: 12,
                boxShadow: 'none',
              }}
            >
              Add Workstation
            </Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.95 }}>
            {readPublishedWorkstations()
              .filter((workstation) =>
                workstation.title.trim().length > 0 &&
                !workstationPresetOptions.includes(workstation.title)
              )
              .slice(0, 12)
              .map((workstation) => {
                const selected = activeWorkstationId === workstation.id;
                return (
                  <Chip
                    key={`ws-saved-${workstation.id}`}
                    label={workstation.title}
                    clickable
                    onClick={() => {
                      onClose();
                      openPublishedWorkstation(workstation.id);
                    }}
                    sx={{
                      borderRadius: 999,
                      px: 0.5,
                      border: `1px solid ${selected ? tokenBrand.main : workstationVisuals.tierBorder}`,
                      bgcolor: selected ? tokenBrand.selectedBg : workstationVisuals.tierSurface,
                      color: selected ? tokenBrand.dark : workstationVisuals.tierTextHeading,
                      fontWeight: selected ? 800 : 700,
                    }}
                  />
                );
              })}
          </Box>
        </Paper>

        {/* New Report / Request Card */}
        <Paper
          elevation={0}
          component="button"
          onClick={() => {
            setShiftEntryMode('maintenance');
            setIsShiftEntryOpen(true);
            onClose();
          }}
          sx={{
            p: 2,
            borderRadius: 3.5,
            border: `1px solid ${workstationVisuals.tierBorder}`,
            background: workstationVisuals.tierSurface,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            textAlign: 'left',
            width: '100%',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: tokenBrand.main,
              transform: 'translateY(-2px)',
              boxShadow: workstationVisuals.tierShadow,
            },
          }}
        >
          <Box sx={{ pr: 2 }}>
            <Typography sx={{ fontWeight: 850, fontSize: 16, color: workstationVisuals.textPrimary, mb: 0.5 }}>
              New Report / Request
            </Typography>
            <Typography sx={{ fontSize: 12, color: workstationVisuals.textSecondary, lineHeight: 1.4 }}>
              Open and submit operational forms for safety, maintenance, quality, shift notes, scrap, and production output.
            </Typography>
          </Box>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: 'transparent', border: `1px solid ${tokenBrand.selectedBg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tokenBrand.main }}>
            <AddIcon />
          </Box>
        </Paper>

        {/* More Solutions Section */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 16, color: workstationVisuals.textPrimary }}>
              More Solutions
            </Typography>
            <Box
              component="button"
              onClick={() => {
                setCurrentScreen('workstations');
                onClose();
              }}
              sx={{
                bgcolor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: tokenBrand.main,
                fontWeight: 800,
                fontSize: 12.5,
                display: 'flex',
                alignItems: 'center',
                gap: 0.2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: tokenBrand.dark,
                  transform: 'translateX(2px)',
                },
              }}
            >
              SHOW ALL <ChevronRightIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
          <Grid container spacing={2}>
            {moreSolutionsItems.map((item) => (
              <Grid key={item.label} size={{ xs: 6 }}>
                <Box
                  component="button"
                  onClick={() => {
                    setCurrentScreen(item.screen as any);
                    onClose();
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: '100%',
                    bgcolor: 'transparent',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    py: 0.8,
                    borderRadius: 1.5,
                    transition: 'all 0.18s ease',
                    '&:hover': {
                      bgcolor: 'var(--surface-hover-bg)',
                      '& .sol-icon': {
                        transform: 'scale(1.1)',
                      },
                    },
                  }}
                >
                  <Box className="sol-icon" sx={{ display: 'flex', transition: 'all 0.18s ease' }}>
                    {item.icon}
                  </Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: workstationVisuals.textSecondary }}>
                    {item.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>

      </Box>
    </Drawer>
  );
};

export default AppLibraryDrawer;
