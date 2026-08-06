import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals } from '../theme';
import React, { useMemo, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Paper,
  TextField,
  Chip,
  Grid,
} from '@mui/material';
import {
  EditOutlined as EditIcon,
  Search as SearchIcon,
  Apps as AppsIcon,
  AutoAwesome as AutoAwesomeIcon,
  Description as DescriptionIcon,
  Notifications as NotificationsIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
  AccountBox as AccountBoxIcon,
  PieChart as PieChartIcon,
  ShowChart as ShowChartIcon,
  CalendarToday as CalendarTodayIcon,
  PrecisionManufacturing as PrecisionManufacturingIcon,
  Public as PublicIcon,
  Flag as FlagIcon,
  Groups as GroupsIcon,
  BuildCircle as BuildCircleIcon,
  Build as BuildIcon,
  ThumbUp as ThumbUpIcon,
  BarChart as BarChartIcon,
  Dashboard as DashboardIcon,
  Timeline as TimelineIcon,
  SyncAlt as SyncAltIcon,
  LocalShipping as LocalShippingIcon,
  FactCheck as FactCheckIcon,
  Science as ScienceIcon,
  QrCodeScanner as QrCodeScannerIcon,
  NotificationImportant as NotificationImportantIcon,
  Inventory2 as Inventory2Icon,
  ViewInAr as ViewInArIcon,
  PhoneAndroid as MobileOpsIcon,
} from '@mui/icons-material';
import { useWorkstationContext } from '../contexts/WorkstationContext';

type WorkstationsLibraryScreenProps = {
  onCreateNew: () => void;
  onOpenWorkstation: (workstationId?: string) => void;
  onOpenPredefined: (title: string) => void;
  onOpenApp: (appName: string) => void;
};

type CategoryName = 'Operations' | 'Maintenance' | 'Planning' | 'Quality' | 'ESO' | 'Logistic' | 'Tools';

interface ExploreAppItem {
  title: string;
  category: CategoryName;
  subheading: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  iconColor: string;
  screen: string;
}

export default function WorkstationsLibraryScreen({
  onCreateNew,
  onOpenWorkstation,
  onOpenPredefined,
  onOpenApp,
}: WorkstationsLibraryScreenProps) {
  const {
    setCurrentScreen,
    setHomeViewMode,
    launchSmartSearch,
  } = useWorkstationContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryName>('Operations');

  const openSmartSearch = () => {
    launchSmartSearch({
      draftQuery: 'Show me Columbus West site details with focus on Area A, Line 10, Zone 1.',
      focusHierarchyId: 'plant-columbus-west',
      hierarchySeedId: 'plant-columbus-west',
      preset: 'columbus-west-site',
    });
  };

  const keyWorkstationShortcuts = [
    {
      label: 'Tier 1',
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => onOpenWorkstation('sample-tier-1'),
    },
    {
      label: 'Tier 2',
      icon: <GroupsIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => onOpenWorkstation('sample-tier-2'),
    },
    {
      label: 'Tier 3',
      icon: <BarChartIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => onOpenWorkstation('sample-tier-3'),
    },
    {
      label: 'OEE',
      icon: <PieChartIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => onOpenWorkstation('sample-oee'),
    },
    {
      label: 'Leader',
      icon: <BuildCircleIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => onOpenWorkstation('sample-maintenance-leader'),
    },
    {
      label: 'Planner',
      icon: <DashboardIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => onOpenWorkstation('sample-maintenance-planner'),
    },
    {
      label: 'Technician',
      icon: <BuildIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => onOpenWorkstation('sample-maintenance-technician'),
    },
    {
      label: 'My Actions',
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 26, color: tokenBrand.main }} />,
      action: () => setCurrentScreen('action_tracker'),
    },
  ];

  const mainTools = [
    {
      label: 'Smart Search',
      icon: <SearchIcon sx={{ fontSize: 22, color: tokenBrand.main }} />,
      action: () => openSmartSearch(),
    },
    {
      label: 'BD Atlas AI',
      icon: <AutoAwesomeIcon sx={{ fontSize: 22, color: tokenBrand.main }} />,
      action: () => {
        setHomeViewMode('chatbot');
        setCurrentScreen('ai_assistant');
      },
    },
    {
      label: 'Document Management',
      icon: <DescriptionIcon sx={{ fontSize: 22, color: tokenBrand.main }} />,
      action: () => setCurrentScreen('document_management'),
    },
    {
      label: 'Notification',
      icon: <NotificationsIcon sx={{ fontSize: 22, color: tokenBrand.main }} />,
      action: () => setCurrentScreen('notification_dashboard'),
    },
  ];

  const categories: CategoryName[] = [
    'Operations',
    'Maintenance',
    'Planning',
    'Quality',
    'ESO',
    'Logistic',
    'Tools',
  ];

  const exploreApps: ExploreAppItem[] = [
    // Operations
    {
      title: 'Global View',
      category: 'Operations',
      subheading: 'Live Operations & Performance',
      description: 'See coverage, absences and handoff timing.',
      icon: <PublicIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'global_view',
    },
    {
      title: 'Control Tower – Site View',
      category: 'Operations',
      subheading: 'Live Operations & Performance',
      description: 'See coverage, absences and handoff timing.',
      icon: <FlagIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'control_tower',
    },
    {
      title: 'Tier Management (Tier 1–3)',
      category: 'Operations',
      subheading: 'Daily Management',
      description: 'See coverage, absences and handoff timing.',
      icon: <GroupsIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'tier_meeting',
    },
    {
      title: 'Shift Schedule',
      category: 'Operations',
      subheading: 'Daily Management',
      description: 'See coverage, absences and handoff timing.',
      icon: <CalendarTodayIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'shift_schedule',
    },
    {
      title: 'Shift Handover',
      category: 'Operations',
      subheading: 'Daily Management',
      description: 'See coverage, absences and handoff timing.',
      icon: <EditIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'shift_logbook',
    },
    {
      title: 'Centerline',
      category: 'Operations',
      subheading: 'Shopfloor Execution',
      description: 'See coverage, absences and handoff timing.',
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'centerline_kpis',
    },
    {
      title: 'CIL',
      category: 'Operations',
      subheading: 'Shopfloor Execution',
      description: 'See coverage, absences and handoff timing.',
      icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'cil_kpis',
    },
    {
      title: 'Equipment Setup Changeover',
      category: 'Operations',
      subheading: 'Shopfloor Execution',
      description: 'See coverage, absences and handoff timing.',
      icon: <BuildCircleIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'equipment_changeover',
    },
    {
      title: 'Centerline Operator',
      category: 'Operations',
      subheading: 'Shopfloor Execution',
      description: 'Execute centerline checks and record operator readings.',
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'centerline_operator',
    },
    {
      title: 'CIL Operator',
      category: 'Operations',
      subheading: 'Shopfloor Execution',
      description: 'Execute CIL routines and submit operator task status.',
      icon: <AccountBoxIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'cil_operator',
    },
    {
      title: 'Equipment Setup Changeover Operator',
      category: 'Operations',
      subheading: 'Shopfloor Execution',
      description: 'Run changeover execution steps from the operator view.',
      icon: <BuildCircleIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'equipment_changeover_operator',
    },
    {
      title: 'Manage Activities',
      category: 'Operations',
      subheading: 'Shopfloor Execution',
      description: 'See coverage, absences and handoff timing.',
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'manage_tasks',
    },

    // Maintenance
    {
      title: 'Follow-up Board',
      category: 'Maintenance',
      subheading: 'Work Management',
      description: 'See coverage, absences and handoff timing.',
      icon: <AssignmentTurnedInIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(15, 118, 110, 0.08)',
      iconColor: '#0f766e',
      screen: 'maintenance_followup',
    },
    {
      title: 'Calendar',
      category: 'Maintenance',
      subheading: 'Work Management',
      description: 'See coverage, absences and handoff timing.',
      icon: <CalendarTodayIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(15, 118, 110, 0.08)',
      iconColor: '#0f766e',
      screen: 'maintenance_calendar',
    },
    {
      title: 'Maintenance Planner Calendar',
      category: 'Maintenance',
      subheading: 'Planning & Scheduling',
      description: 'See coverage, absences and handoff timing.',
      icon: <CalendarTodayIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(15, 118, 110, 0.08)',
      iconColor: '#0f766e',
      screen: 'maintenance_planner',
    },
    {
      title: 'Maintenance Plan',
      category: 'Maintenance',
      subheading: 'Planning & Scheduling',
      description: 'See coverage, absences and handoff timing.',
      icon: <CalendarTodayIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(15, 118, 110, 0.08)',
      iconColor: '#0f766e',
      screen: 'maintenance_plan',
    },
    {
      title: 'CBM & PdM',
      category: 'Maintenance',
      subheading: 'Reliability & Assets',
      description: 'See coverage, absences and handoff timing.',
      icon: <BuildCircleIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(15, 118, 110, 0.08)',
      iconColor: '#0f766e',
      screen: 'maintenance_cbm_pdm',
    },
    {
      title: 'Equipment Ledger',
      category: 'Maintenance',
      subheading: 'Reliability & Assets',
      description: 'See coverage, absences and handoff timing.',
      icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(15, 118, 110, 0.08)',
      iconColor: '#0f766e',
      screen: 'equipment_ledger',
    },
    {
      title: 'Maintenance Analytics',
      category: 'Maintenance',
      subheading: 'Reliability & Assets',
      description: 'See coverage, absences and handoff timing.',
      icon: <BarChartIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(15, 118, 110, 0.08)',
      iconColor: '#0f766e',
      screen: 'maintenance_performance',
    },
    {
      title: 'Spare Parts Management',
      category: 'Maintenance',
      subheading: 'Materials & Resources',
      description: 'See coverage, absences and handoff timing.',
      icon: <BuildIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(15, 118, 110, 0.08)',
      iconColor: '#0f766e',
      screen: 'tool_crib',
    },

    // Planning
    {
      title: 'Shift Schedule',
      category: 'Planning',
      subheading: 'Daily Schedule',
      description: 'See coverage, absences and handoff timing.',
      icon: <CalendarTodayIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(14, 165, 233, 0.08)',
      iconColor: '#0ea5e9',
      screen: 'shift_schedule',
    },
    {
      title: 'Production Planning',
      category: 'Planning',
      subheading: 'Long Term & Sequencing',
      description: 'See coverage, absences and handoff timing.',
      icon: <DashboardIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(124, 58, 237, 0.08)',
      iconColor: '#7C3AED',
      screen: 'production_planning',
    },

    // Quality
    {
      title: 'CIL',
      category: 'Quality',
      subheading: 'Quality Audits',
      description: 'See coverage, absences and handoff timing.',
      icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(6, 182, 212, 0.08)',
      iconColor: '#06b6d4',
      screen: 'cil_kpis',
    },
    {
      title: 'Centerline',
      category: 'Quality',
      subheading: 'Quality Audits',
      description: 'See coverage, absences and handoff timing.',
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(8, 145, 178, 0.08)',
      iconColor: '#0891b2',
      screen: 'centerline_kpis',
    },
    {
      title: 'Doc Manager',
      category: 'Quality',
      subheading: 'Quality Audits',
      description: 'See coverage, absences and handoff timing.',
      icon: <DescriptionIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(4, 78, 215, 0.08)',
      iconColor: '#044ED7',
      screen: 'document_management',
    },

    // ESO
    {
      title: 'ESO',
      category: 'ESO',
      subheading: 'EHS & Safety',
      description: 'Capture and manage safety observations to identify risks, reinforce safe practices, and drive operational excellence.',
      icon: <ThumbUpIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(255, 110, 0, 0.08)',
      iconColor: '#FF6E00',
      screen: 'eso_hub',
    },

    // Logistic
    {
      title: 'Logistics Mobile Ops',
      category: 'Logistic',
      subheading: 'Mobile Operations',
      description: 'Mobile-first area selection for inside logistics operator execution.',
      icon: <MobileOpsIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.10)',
      iconColor: '#0B5CAB',
      screen: 'logistics_mobile_ops',
    },
    {
      title: 'Logistics Control Tower',
      category: 'Logistic',
      subheading: 'End-to-End Visibility',
      description: 'Plant-wide executive cockpit: IN01–OB03 macroflow KPIs, carousel lenses, and progressive drill-down.',
      icon: <DashboardIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.08)',
      iconColor: '#0B5CAB',
      screen: 'logistics_control_tower',
    },
    {
      title: 'ASN Portal',
      category: 'Logistic',
      subheading: 'External Partners',
      description: 'Track inbound ASNs, dock appointments, carrier confirmations, and exception handling in one logistics portal.',
      icon: <SyncAltIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.08)',
      iconColor: '#0B5CAB',
      screen: 'external_transfer_portal',
    },
    {
      title: 'Quality Release',
      category: 'Logistic',
      subheading: 'Inbound / Post-Steril',
      description: 'QA queues, SQE notifications, hold cage, and shipping urgency requests.',
      icon: <FactCheckIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.08)',
      iconColor: '#0B5CAB',
      screen: 'quality_release',
    },
    {
      title: 'Shipment Readiness',
      category: 'Logistic',
      subheading: 'Outbound',
      description: 'Pledge, 48h, and backorder readiness with hazmat and pallet configuration gates.',
      icon: <LocalShippingIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.08)',
      iconColor: '#0B5CAB',
      screen: 'shipment_readiness',
    },
    {
      title: 'Pallet Load Check',
      category: 'Logistic',
      subheading: 'Outbound / FG',
      description: '3D guided pallet verification with checklist, photo capture, exceptions, and supervisor queue.',
      icon: <ViewInArIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.08)',
      iconColor: '#0B5CAB',
      screen: 'pallet_verification',
    },
    {
      title: 'Sterilization Tracker',
      category: 'Logistic',
      subheading: 'Outbound',
      description: 'External sterilization loads, documentation gaps, and 7-day QA TAT.',
      icon: <ScienceIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.08)',
      iconColor: '#0B5CAB',
      screen: 'sterilization_tracker',
    },
    {
      title: 'Guided Tasks',
      category: 'Logistic',
      subheading: 'Warehouse Execution',
      description: 'Operator task inbox with RF scan simulation for RM and FG movements.',
      icon: <QrCodeScannerIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.08)',
      iconColor: '#0B5CAB',
      screen: 'guided_tasks',
    },
    {
      title: 'Job Readiness',
      category: 'Logistic',
      subheading: 'Production Supply',
      description: '10-stage picking readiness timeline and blockers for production jobs.',
      icon: <TimelineIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.08)',
      iconColor: '#0B5CAB',
      screen: 'job_readiness',
    },
    {
      title: 'Production Alerts',
      category: 'Logistic',
      subheading: 'Production Supply',
      description: 'Change alerts with shift-change escalation and resolve cascades.',
      icon: <NotificationImportantIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.08)',
      iconColor: '#0B5CAB',
      screen: 'production_alerts',
    },
    {
      title: 'Machine Material Status',
      category: 'Logistic',
      subheading: 'Production Supply',
      description: 'Line run state versus material readiness with pause/continue guidance.',
      icon: <PrecisionManufacturingIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.08)',
      iconColor: '#0B5CAB',
      screen: 'machine_status',
    },
    {
      title: 'WIP Control Tower',
      category: 'Logistic',
      subheading: 'WIP Traceability',
      description: 'Traceable WIP objects, genealogy, scan moves, aging, and exception actions.',
      icon: <Inventory2Icon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(11, 92, 171, 0.08)',
      iconColor: '#0B5CAB',
      screen: 'wip_control_tower',
    },

    // Tools
    {
      title: 'BD Atlas AI',
      category: 'Tools',
      subheading: 'BD Atlas AI',
      description: 'See coverage, absences and handoff timing.',
      icon: <AutoAwesomeIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'ai_assistant',
    },
    {
      title: 'Smart Search',
      category: 'Tools',
      subheading: 'BD Atlas AI',
      description: 'See coverage, absences and handoff timing.',
      icon: <SearchIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(255, 110, 0, 0.08)',
      iconColor: '#FF6E00',
      screen: 'smart_search',
    },
    {
      title: 'Notification',
      category: 'Tools',
      subheading: 'BD Atlas AI',
      description: 'See coverage, absences and handoff timing.',
      icon: <NotificationsIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(29, 116, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'notification_dashboard',
    },
    {
      title: 'All Workstations',
      category: 'Tools',
      subheading: 'BD Atlas AI',
      description: 'See coverage, absences and handoff timing.',
      icon: <AppsIcon sx={{ fontSize: 20 }} />,
      iconBgColor: 'rgba(22, 99, 255, 0.08)',
      iconColor: tokenBrand.main,
      screen: 'all_workstations',
    },
  ];

  const filteredExploreApps = useMemo(() => {
    let result = exploreApps.filter((app) => app.category === selectedCategory);
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.trim().toLowerCase();
      // If there is search text, we can search across all categories to be helpful
      result = exploreApps.filter(
        (app) =>
          app.title.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query)
      );
    }
    return result;
  }, [selectedCategory, searchQuery]);

  const groupedExploreApps = useMemo(() => {
    const groups: Record<string, ExploreAppItem[]> = {};
    filteredExploreApps.forEach((app) => {
      if (!groups[app.subheading]) {
        groups[app.subheading] = [];
      }
      groups[app.subheading].push(app);
    });
    return groups;
  }, [filteredExploreApps]);

  const handleCardClick = (screen: string) => {
    if (screen === 'smart_search') {
      openSmartSearch();
    } else if (screen === 'ai_assistant') {
      setHomeViewMode('chatbot');
      setCurrentScreen('ai_assistant');
    } else {
      setCurrentScreen(screen as any);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, minHeight: 0, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2.5, md: 4 } }}>
      <Box sx={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
        
        {/* Workstation circular menu card (Image 2 style) */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3.5,
            border: `1px solid ${workstationVisuals.tierBorder}`,
            background: workstationVisuals.tierSurface,
            boxShadow: workstationVisuals.tierShadow,
            maxWidth: 600,
          }}
        >
          <Typography sx={{ color: workstationVisuals.textPrimary, fontWeight: 800, fontSize: 18, mb: 2.5 }}>
            Workstation
          </Typography>
          <Grid container spacing={2}>
            {keyWorkstationShortcuts.map((btn) => (
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
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: workstationVisuals.textSecondary, mt: 1, textAlign: 'center', lineHeight: 1.25 }}>
                  {btn.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Main Tools Section */}
        <Box>
          <Typography variant="h6" sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, mb: 2 }}>
            Main Tools
          </Typography>
          <Grid container spacing={2}>
            {mainTools.map((tool) => (
              <Grid size={{ xs: 12, sm: 6, md: 3 }} key={tool.label}>
                <Paper
                  elevation={0}
                  component="button"
                  onClick={tool.action}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    width: '100%',
                    bgcolor: workstationVisuals.tierSurfaceSoft,
                    border: `1px solid ${workstationVisuals.tierBorder}`,
                    borderRadius: 3.2,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: tokenBrand.main,
                      bgcolor: workstationVisuals.tierSurface,
                      boxShadow: workstationVisuals.tierShadow,
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2.2,
                      bgcolor: tokenBrand.softBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {tool.icon}
                  </Box>
                  <Typography sx={{ fontWeight: 800, color: workstationVisuals.textSecondary, fontSize: 14.5 }}>
                    {tool.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Explore all applications by category section */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" sx={{ color: workstationVisuals.textPrimary, fontWeight: 850, mb: 1 }}>
            Explore all applications by category
          </Typography>

          {/* Search bar */}
          <Box sx={{ my: 2 }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for solutions"
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ color: workstationVisuals.textMuted, mr: 1, fontSize: 22 }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: workstationVisuals.tierSurfaceSoft,
                  '& fieldset': {
                    borderColor: workstationVisuals.tierBorder,
                  },
                  '&:hover fieldset': {
                    borderColor: tokenBrand.main,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: tokenBrand.main,
                  },
                },
              }}
            />
          </Box>

          {/* Category filter pills */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
            {categories.map((cat) => {
              const selected = selectedCategory === cat && searchQuery.trim().length === 0;
              return (
                <Chip
                  key={cat}
                  label={cat}
                  clickable
                  onClick={() => {
                    setSelectedCategory(cat);
                    setSearchQuery('');
                  }}
                  sx={{
                    borderRadius: 999,
                    px: 1,
                    py: 2,
                    fontSize: 13,
                    fontWeight: selected ? 800 : 700,
                    bgcolor: selected ? tokenBrand.main : workstationVisuals.tierSurfaceMuted,
                    color: selected ? tokenBrand.contrast : workstationVisuals.textSecondary,
                    border: '1px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: selected ? tokenBrand.main : workstationVisuals.tierBorder,
                    },
                  }}
                />
              );
            })}
          </Box>

          {/* Solutions Category Subsections and Lists */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
            {Object.keys(groupedExploreApps).map((subheading) => (
              <Box key={subheading}>
                <Typography sx={{ fontSize: 13, fontWeight: 900, color: workstationVisuals.textSecondary, textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
                  {subheading}
                </Typography>
                <Grid container spacing={2}>
                  {groupedExploreApps[subheading].map((app) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={app.title}>
                      <Paper
                        elevation={0}
                        component="button"
                        onClick={() => handleCardClick(app.screen)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2.2,
                          p: 2.2,
                          width: '100%',
                          bgcolor: workstationVisuals.tierSurface,
                          border: `1px solid ${workstationVisuals.tierBorder}`,
                          borderRadius: 3.5,
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            borderColor: app.iconColor,
                            boxShadow: `0 10px 25px color-mix(in srgb, ${app.iconColor} 5%, transparent)`,
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2.5,
                            bgcolor: app.iconBgColor,
                            color: app.iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {app.icon}
                        </Box>
                        <Box>
                          <Typography sx={{ fontWeight: 850, color: workstationVisuals.textPrimary, fontSize: 15, mb: 0.35 }}>
                            {app.title}
                          </Typography>
                          <Typography sx={{ fontSize: 12, color: workstationVisuals.textSecondary, lineHeight: 1.4 }}>
                            {app.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}

            {Object.keys(groupedExploreApps).length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography sx={{ color: workstationVisuals.textSecondary, fontWeight: 700 }}>
                  No matching solutions found.
                </Typography>
              </Box>
            )}
          </Box>

        </Box>

      </Box>
    </Box>
  );
}
