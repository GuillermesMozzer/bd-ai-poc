import type { ReactNode } from 'react';
import {
  Apps as WorkstationIcon,
  AutoAwesome as BluAiIcon,
  Build as MaintenanceIcon,
  Description as DocumentManagerIcon,
  EventNote as ProductionPlanningIcon,
  Factory as ShopfloorIcon,
  HealthAndSafety as EhsIcon,
  LocalShipping as LogisticIcon,
  Notifications as NotificationIcon,
  Public as GlobalViewIcon,
  VerifiedUser as QualityIcon,
  BarChart as PerformanceIcon,
  Dashboard as FollowUpIcon,
  Groups as TeamIcon,
  Sensors as CbmIcon,
  Edit as LogbookIcon,
  Star as OverviewIcon,
  AssignmentTurnedIn as ActionTrackerIcon,
  Dashboard as ControlTowerLogisticsIcon,
  FactCheck as QualityReleaseIcon,
  LocalShippingOutlined as ShipmentIcon,
  Science as SterilizationIcon,
  SyncAlt as ExternalTransferIcon,
  QrCodeScanner as GuidedTasksIcon,
  Timeline as JobReadinessIcon,
  NotificationImportant as ProductionAlertsIcon,
  PrecisionManufacturing as MachineStatusIcon,
  Inventory2 as WipControlTowerIcon,
  ViewInAr as PalletVerificationIcon,
  PhoneAndroid as MobileOpsIcon,
} from '@mui/icons-material';

export type AppScreen =
  | 'global_view'
  | 'my_workstation'
  | 'workstations'
  | 'workstation'
  | 'dashboard'
  | 'document_management'
  | 'document_search_hierarchy'
  | 'approval_dashboard'
  | 'review_flow'
  | 'template_selection'
  | 'version_history'
  | 'audit_trail'
  | 'compliance'
  | 'esignature'
  | 'advanced_search'
  | 'workflow_engine'
  | 'document_operations'
  | 'ai_hub'
  | 'artifact_detail'
  | 'ai_home'
  | 'smart_search'
  | 'shift_logbook'
  | 'tier_meeting'
  | 'action_tracker'
  | 'notification_dashboard'
  | 'work_order_hub'
  | 'maintenance_hub'
  | 'equipment_changeover'
  | 'manage_tasks'
  | 'shift_schedule_overview'
  | 'shift_schedule'
  | 'shift_schedule_summary'
  | 'shift_schedule_settings'
  | 'team_management'
  | 'site_organogram'
  | 'control_tower'
  | 'tier_overview'
  | 'eso_hub'
  | 'line_performance'
  | 'cilt_kpis'
  | 'cil_kpis'
  | 'centerline_kpis'
  | 'all_workstations'
  | 'maintenance_calendar'
  | 'maintenance_followup'
  | 'tool_crib'
  | 'equipment_ledger'
  | 'asset_explorer'
  | 'ot_asset_type_wizard'
  | 'maintenance_request_log'
  | 'maintenance_cbm_pdm'
  | 'maintenance_performance'
  | 'maintenance_planner'
  | 'maintenance_my_team'
  | 'maintenance_plan'
  | 'shift_schedule_operator'
  | 'equipment_changeover_operator'
  | 'cil_operator'
  | 'centerline_operator'
  | 'cil_centerline_operator'
  | 'ai_assistant'
  | 'smart_hub_home'
  | 'logistics_mobile_ops'
  | 'logistics_control_tower'
  | 'receiving_control_tower'
  | 'quality_release'
  | 'shipment_readiness'
  | 'sterilization_tracker'
  | 'external_transfer_portal'
  | 'guided_tasks'
  | 'job_readiness'
  | 'production_alerts'
  | 'machine_status'
  | 'wip_control_tower'
  | 'sterilization_outbound_control_tower'
  | 'pallet_verification';

export type AppNavigationKey =
  | 'blu_ai'
  | 'smart_search'
  | 'document_manager'
  | 'notification'
  | 'global_view'
  | 'my_workstation'
  | 'workstations'
  | 'workstation'
  | 'shopfloor'
  | 'maintenance'
  | 'quality'
  | 'logistic'
  | 'production_planning'
  | 'ehs';

export type AppNavigationChildItem = {
  key: string;
  label: string;
  icon: ReactNode;
  screen?: AppScreen;
  maintenanceMenu?: 'performance' | 'followup' | 'planner' | 'team' | 'cbm';
  disabled?: boolean;
};

export type AppNavigationItem = {
  key: AppNavigationKey;
  label: string;
  icon: ReactNode;
  screen?: AppScreen;
  children?: AppNavigationChildItem[];
  disabled?: boolean;
};

export const applicationMenuItems: AppNavigationItem[] = [
  {
    key: 'blu_ai',
    label: 'AI Chatbot',
    icon: <BluAiIcon fontSize="small" />,
    screen: 'ai_assistant',
  },
  {
    key: 'document_manager',
    label: 'Document Managment',
    icon: <DocumentManagerIcon fontSize="small" />,
    screen: 'document_management',
  },
  {
    key: 'smart_search',
    label: 'Control Tower',
    icon: <GlobalViewIcon fontSize="small" />,
    screen: 'control_tower',
  },
  {
    key: 'global_view',
    label: 'Global View',
    icon: <GlobalViewIcon fontSize="small" />,
    screen: 'global_view',
  },
  {
    key: 'notification',
    label: 'Centralized Notification',
    icon: <NotificationIcon fontSize="small" />,
    screen: 'notification_dashboard',
  },
  {
    key: 'workstation',
    label: 'My Workstations',
    icon: <WorkstationIcon fontSize="small" />,
    screen: 'workstations',
  },
  {
    key: 'shopfloor',
    label: 'Shopfloor',
    icon: <ShopfloorIcon fontSize="small" />,
    screen: 'shift_logbook',
    children: [
      {
        key: 'shopfloor_logbook',
        label: 'Shift Logbook',
        icon: <LogbookIcon fontSize="small" />,
        screen: 'shift_logbook',
      },
      {
        key: 'shopfloor_tier_meeting',
        label: 'Tier 1 Meeting',
        icon: <TeamIcon fontSize="small" />,
        screen: 'tier_meeting',
      },
      {
        key: 'shopfloor_tier_overview',
        label: 'Tier 1 Overview',
        icon: <OverviewIcon fontSize="small" />,
        screen: 'tier_overview',
      },
      {
        key: 'shopfloor_action_tracker',
        label: 'Action Tracker',
        icon: <ActionTrackerIcon fontSize="small" />,
        screen: 'action_tracker',
      },
    ],
  },
  {
    key: 'maintenance',
    label: 'Maintenance',
    icon: <MaintenanceIcon fontSize="small" />,
    screen: 'maintenance_hub',
    children: [
      {
        key: 'maintenance_followup',
        label: 'Maintenance Follow Up Board',
        icon: <FollowUpIcon fontSize="small" />,
        screen: 'maintenance_hub',
        maintenanceMenu: 'followup',
      },
      {
        key: 'maintenance_planner',
        label: 'Planner Hub',
        icon: <ProductionPlanningIcon fontSize="small" />,
        screen: 'maintenance_hub',
        maintenanceMenu: 'planner',
      },
      {
        key: 'maintenance_team',
        label: 'My Team',
        icon: <TeamIcon fontSize="small" />,
        screen: 'maintenance_hub',
        maintenanceMenu: 'team',
      },
      {
        key: 'maintenance_cbm',
        label: 'CBM / PdM',
        icon: <CbmIcon fontSize="small" />,
        screen: 'maintenance_hub',
        maintenanceMenu: 'cbm',
      },
      {
        key: 'maintenance_performance',
        label: 'Maintenance Analytics',
        icon: <PerformanceIcon fontSize="small" />,
        screen: 'maintenance_hub',
        maintenanceMenu: 'performance',
      },
    ],
  },
  {
    key: 'quality',
    label: 'Quality',
    icon: <QualityIcon fontSize="small" />,
    disabled: true,
  },
  {
    key: 'logistic',
    label: 'Logistic',
    icon: <LogisticIcon fontSize="small" />,
    screen: 'logistics_control_tower',
    children: [
      {
        key: 'logistics_mobile_ops',
        label: 'Logistics Mobile Ops',
        icon: <MobileOpsIcon fontSize="small" />,
        screen: 'logistics_mobile_ops',
      },
      {
        key: 'logistics_control_tower',
        label: 'Logistics Control Tower',
        icon: <ControlTowerLogisticsIcon fontSize="small" />,
        screen: 'logistics_control_tower',
      },
      {
        key: 'quality_release',
        label: 'Quality Release',
        icon: <QualityReleaseIcon fontSize="small" />,
        screen: 'quality_release',
      },
      {
        key: 'shipment_readiness',
        label: 'Shipment Readiness',
        icon: <ShipmentIcon fontSize="small" />,
        screen: 'shipment_readiness',
      },
      {
        key: 'pallet_verification',
        label: 'Pallet Load Check',
        icon: <PalletVerificationIcon fontSize="small" />,
        screen: 'pallet_verification',
      },
      {
        key: 'sterilization_tracker',
        label: 'Sterilization Tracker',
        icon: <SterilizationIcon fontSize="small" />,
        screen: 'sterilization_tracker',
      },
      {
        key: 'external_transfer_portal',
        label: 'ASN Portal',
        icon: <ExternalTransferIcon fontSize="small" />,
        screen: 'external_transfer_portal',
      },
      {
        key: 'guided_tasks',
        label: 'Guided Tasks',
        icon: <GuidedTasksIcon fontSize="small" />,
        screen: 'guided_tasks',
      },
      {
        key: 'job_readiness',
        label: 'Job Readiness',
        icon: <JobReadinessIcon fontSize="small" />,
        screen: 'job_readiness',
      },
      {
        key: 'production_alerts',
        label: 'Production Alerts',
        icon: <ProductionAlertsIcon fontSize="small" />,
        screen: 'production_alerts',
      },
      {
        key: 'machine_status',
        label: 'Machine Material Status',
        icon: <MachineStatusIcon fontSize="small" />,
        screen: 'machine_status',
      },
      {
        key: 'wip_control_tower',
        label: 'WIP Control Tower',
        icon: <WipControlTowerIcon fontSize="small" />,
        screen: 'wip_control_tower',
      },
      {
        key: 'sterilization_outbound_control_tower',
        label: 'Sterilization / Outbound CT',
        icon: <SterilizationIcon fontSize="small" />,
        screen: 'sterilization_outbound_control_tower',
      },
    ],
  },
  {
    key: 'production_planning',
    label: 'Production Planning',
    icon: <ProductionPlanningIcon fontSize="small" />,
    screen: 'shift_schedule_overview',
  },
  {
    key: 'ehs',
    label: 'EHS',
    icon: <EhsIcon fontSize="small" />,
    screen: 'eso_hub',
  },
];

export function getActiveNavigationKey(screen: AppScreen): AppNavigationKey {
  switch (screen) {
    case 'ai_home':
    case 'ai_assistant':
      return 'blu_ai';
    case 'smart_search':
      return 'smart_search';
    case 'document_management':
    case 'document_search_hierarchy':
    case 'approval_dashboard':
    case 'review_flow':
    case 'template_selection':
    case 'version_history':
    case 'audit_trail':
    case 'compliance':
    case 'esignature':
    case 'advanced_search':
    case 'workflow_engine':
    case 'document_operations':
    case 'ai_hub':
    case 'artifact_detail':
      return 'document_manager';
    case 'control_tower':
      return 'smart_search';
    case 'notification_dashboard':
      return 'notification';
    case 'global_view':
      return 'global_view';
    case 'my_workstation':
    case 'workstations':
      return 'workstation';
    case 'workstation':
    case 'smart_hub_home':
    case 'dashboard':
    case 'line_performance':
    case 'cilt_kpis':
    case 'cil_kpis':
    case 'centerline_kpis':
      return 'workstation';
    case 'logistics_mobile_ops':
    case 'logistics_control_tower':
    case 'receiving_control_tower':
    case 'quality_release':
    case 'shipment_readiness':
    case 'sterilization_tracker':
    case 'external_transfer_portal':
    case 'guided_tasks':
    case 'job_readiness':
    case 'production_alerts':
    case 'machine_status':
    case 'wip_control_tower':
    case 'sterilization_outbound_control_tower':
    case 'pallet_verification':
      return 'logistic';
    case 'shift_logbook':
    case 'tier_meeting':
    case 'action_tracker':
    case 'tier_overview':
    case 'maintenance_hub':
    case 'maintenance_plan':
    case 'equipment_changeover':
    case 'manage_tasks':
    case 'work_order_hub':
    case 'shift_schedule_overview':
    case 'shift_schedule':
    case 'shift_schedule_summary':
    case 'shift_schedule_settings':
    case 'team_management':
    case 'site_organogram':
    case 'eso_hub':
    case 'all_workstations':
    case 'shift_schedule_operator':
    case 'equipment_changeover_operator':
    case 'cil_operator':
    case 'centerline_operator':
    case 'cil_centerline_operator':
      return 'workstation';
    default:
      return 'workstation';
  }
}
