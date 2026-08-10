import React, { Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { type AppScreen } from '../navigation/navigationConfig';

const LogisticsMobileOpsPage = lazy(() => import('./pages/LogisticsMobileOpsPage'));
const LogisticsControlTowerPage = lazy(() => import('./pages/LogisticsControlTowerPage'));
const QualityReleasePage = lazy(() => import('./pages/QualityReleasePage'));
const ShipmentReadinessPage = lazy(() => import('./pages/ShipmentReadinessPage'));
const SterilizationTrackerPage = lazy(() => import('./pages/SterilizationTrackerPage'));
const ExternalTransferPortalPage = lazy(() => import('./pages/ExternalTransferPortalPage'));
const GuidedTasksPage = lazy(() => import('./pages/GuidedTasksPage'));
const JobReadinessPage = lazy(() => import('./pages/JobReadinessPage'));
const ProductionAlertsPage = lazy(() => import('./pages/ProductionAlertsPage'));
const MachineStatusPage = lazy(() => import('./pages/MachineStatusPage'));
const WipControlTowerPage = lazy(() => import('./pages/WipControlTowerPage'));
const SterilizationOutboundControlTowerPage = lazy(
  () => import('./pages/SterilizationOutboundControlTowerPage'),
);
const PalletVerificationPage = lazy(() => import('./pages/PalletVerificationPage'));

const LOGISTICS_SCREENS: AppScreen[] = [
  'logistics_mobile_ops',
  'logistics_control_tower',
  'receiving_control_tower',
  'quality_release',
  'shipment_readiness',
  'sterilization_tracker',
  'external_transfer_portal',
  'guided_tasks',
  'job_readiness',
  'production_alerts',
  'machine_status',
  'wip_control_tower',
  'sterilization_outbound_control_tower',
  'pallet_verification',
];

export function isLogisticsScreen(screen: AppScreen): boolean {
  return LOGISTICS_SCREENS.includes(screen);
}

function LogisticsFallback() {
  return (
    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 320 }}>
      <CircularProgress />
    </Box>
  );
}

export default function AppRoutesLogistics({ currentScreen }: { currentScreen: AppScreen }) {
  let page: React.ReactNode = null;

  switch (currentScreen) {
    case 'logistics_mobile_ops':
      page = <LogisticsMobileOpsPage />;
      break;
    case 'logistics_control_tower':
    case 'receiving_control_tower':
      page = <LogisticsControlTowerPage />;
      break;
    case 'quality_release':
      page = <QualityReleasePage />;
      break;
    case 'shipment_readiness':
      page = <ShipmentReadinessPage />;
      break;
    case 'sterilization_tracker':
      page = <SterilizationTrackerPage />;
      break;
    case 'external_transfer_portal':
      page = <ExternalTransferPortalPage />;
      break;
    case 'guided_tasks':
      page = <GuidedTasksPage />;
      break;
    case 'job_readiness':
      page = <JobReadinessPage />;
      break;
    case 'production_alerts':
      page = <ProductionAlertsPage />;
      break;
    case 'machine_status':
      page = <MachineStatusPage />;
      break;
    case 'wip_control_tower':
      page = <WipControlTowerPage />;
      break;
    case 'sterilization_outbound_control_tower':
      page = <SterilizationOutboundControlTowerPage />;
      break;
    case 'pallet_verification':
      page = <PalletVerificationPage />;
      break;
    default:
      page = null;
  }

  return <Suspense fallback={<LogisticsFallback />}>{page}</Suspense>;
}
