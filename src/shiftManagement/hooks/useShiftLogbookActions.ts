import { useState } from 'react';
import { type ShiftLogbookCategory } from '../constants';
import { type ShiftEntryEsoSavedPayload } from '../../shiftEntry/ShiftEntryEso';
import { type ShiftEntryMode } from '../../shiftEntry/ShiftEntry';
import { type ShiftEntryMaintenancePrefill } from '../../shiftEntry/ShiftEntryMaintenance';

interface UseShiftLogbookActionsProps {
  setCurrentScreen: (screen: any) => void;
}

type ShiftLogbookRcaMethod = '5 Whys' | 'Fishbone Diagram' | 'Fault Tree Analysis';
type PendingDashboardRecordAction = {
  category: string;
  targetLabel: string;
};

export const useShiftLogbookActions = ({
  setCurrentScreen,
}: UseShiftLogbookActionsProps) => {
  const [shiftLogbookCategory, setShiftLogbookCategory] = useState<ShiftLogbookCategory>('Dashboard');
  const [shiftLogbookScope, setShiftLogbookScope] = useState<'Last Shift' | 'Current Shift' | 'Custom Date'>('Current Shift');
  const [shiftLogbookSearch, setShiftLogbookSearch] = useState('');
  const [shiftLogbookFilters, setShiftLogbookFilters] = useState({
    zone: 'All',
    riskLevel: 'All',
    dateRange: 'All',
    shift: 'All',
    type: 'All',
    assignee: 'All',
    area: 'All',
    status: 'All',
  });
  const [isShiftLogbookRcaDrawerOpen, setIsShiftLogbookRcaDrawerOpen] = useState(false);
  const [isShiftLogbookFiveWhysDrawerOpen, setIsShiftLogbookFiveWhysDrawerOpen] = useState(false);
  const [shiftLogbookRcaMethod, setShiftLogbookRcaMethod] = useState<ShiftLogbookRcaMethod | null>('5 Whys');
  const [shiftLogbookRcaSource, setShiftLogbookRcaSource] = useState<'Maintenance Work Order' | 'ESO' | 'Incident'>('Maintenance Work Order');
  const [isShiftLogbookFishboneOpen, setIsShiftLogbookFishboneOpen] = useState(false);
  const [isShiftLogbookFaultTreeOpen, setIsShiftLogbookFaultTreeOpen] = useState(false);
  const [isShiftLogbookSourceDrawerOpen, setIsShiftLogbookSourceDrawerOpen] = useState(false);
  const [isShiftLogbookMaintenanceReviewOpen, setIsShiftLogbookMaintenanceReviewOpen] = useState(false);
  const [isShiftLogbookCreateActionOpen, setIsShiftLogbookCreateActionOpen] = useState(false);
  const [isShiftLogbookActionRecording, setIsShiftLogbookActionRecording] = useState(false);
  const [shiftLogbookSubmittedEsoEntries, setShiftLogbookSubmittedEsoEntries] = useState<any[]>([]);
  const [shiftLogbookSubmittedRcaEntries, setShiftLogbookSubmittedRcaEntries] = useState<any[]>([]);
  const [shiftLogbookRcaNumber, setShiftLogbookRcaNumber] = useState<string | null>(null);
  const [shiftLogbookFiveWhysSteps, setShiftLogbookFiveWhysSteps] = useState<any[]>([]);
  const [shiftLogbookFiveWhysProblem, setShiftLogbookFiveWhysProblem] = useState('');
  const [shiftLogbookMaintenanceReviewDetails, setShiftLogbookMaintenanceReviewDetails] = useState<any>(null);
  const [pendingDashboardRecordAction, setPendingDashboardRecordAction] = useState<PendingDashboardRecordAction | null>(null);

  const closeShiftLogbookRcaFlow = () => {
    setIsShiftLogbookRcaDrawerOpen(false);
    setIsShiftLogbookFiveWhysDrawerOpen(false);
    setIsShiftLogbookFishboneOpen(false);
    setIsShiftLogbookFaultTreeOpen(false);
  };

  const openShiftLogbookCreateActionDrawer = () => {
    setIsShiftLogbookActionRecording(false);
    setIsShiftLogbookCreateActionOpen(true);
  };

  const closeShiftLogbookCreateActionDrawer = () => {
    setIsShiftLogbookActionRecording(false);
    setIsShiftLogbookCreateActionOpen(false);
  };

  const openShiftLogbookRcaDrawer = () => {
    setShiftLogbookRcaMethod('5 Whys');
    setIsShiftLogbookFishboneOpen(false);
    setIsShiftLogbookFaultTreeOpen(false);
    setIsShiftLogbookFiveWhysDrawerOpen(false);
    setIsShiftLogbookRcaDrawerOpen(true);
  };

  const openShiftLogbookFiveWhysDrawer = () => {
    setShiftLogbookRcaMethod('5 Whys');
    setIsShiftLogbookRcaDrawerOpen(false);
    setIsShiftLogbookFiveWhysDrawerOpen(true);
  };

  const returnToShiftLogbookRcaMethodDrawer = () => {
    setIsShiftLogbookFiveWhysDrawerOpen(false);
    setIsShiftLogbookRcaDrawerOpen(true);
  };

  const openShiftLogbookFishboneWorkspace = () => {
    setShiftLogbookRcaMethod('Fishbone Diagram');
    setIsShiftLogbookRcaDrawerOpen(false);
    setIsShiftLogbookFiveWhysDrawerOpen(false);
    setIsShiftLogbookFaultTreeOpen(false);
    setIsShiftLogbookFishboneOpen(true);
  };

  const closeShiftLogbookFishboneWorkspace = () => {
    setIsShiftLogbookFishboneOpen(false);
  };

  const openShiftLogbookFaultTreeWorkspace = () => {
    setShiftLogbookRcaMethod('Fault Tree Analysis');
    setIsShiftLogbookRcaDrawerOpen(false);
    setIsShiftLogbookFiveWhysDrawerOpen(false);
    setIsShiftLogbookFishboneOpen(false);
    setIsShiftLogbookFaultTreeOpen(true);
  };

  const closeShiftLogbookFaultTreeWorkspace = () => {
    setIsShiftLogbookFaultTreeOpen(false);
  };

  const openShiftLogbookMaintenanceReview = () => {
    setIsShiftLogbookMaintenanceReviewOpen(true);
  };

  const closeShiftLogbookMaintenanceReview = () => {
    setIsShiftLogbookMaintenanceReviewOpen(false);
  };

  const handleShiftLogbookCategorySelect = (category: ShiftLogbookCategory) => {
    setShiftLogbookCategory(category);
    if (category === 'Maintenance Request' || category === 'Maintenance Work Order') {
      openShiftLogbookMaintenanceReview();
    }
  };

  const handleShiftLogbookTicketSelect = (ticket: any) => {
    if (!ticket) return;

    const ticketTypeText = String(ticket.ticketType ?? '').toLowerCase();
    const isIncident = ticketTypeText === 'incident';
    const isEso = ticket?.category === 'ESO';
    const isMaintenanceRequest = ticket?.category === 'Maintenance Request';
    const isWorkOrder = ticket?.category === 'Maintenance Work Order';

    if (isMaintenanceRequest) {
      setShiftLogbookMaintenanceReviewDetails(ticket);
      openShiftLogbookMaintenanceReview();
      setShiftLogbookRcaNumber(ticket.number ?? ticket.workOrder ?? ticket.id ?? null);
      return;
    }

    if (isWorkOrder) {
      setShiftLogbookMaintenanceReviewDetails(ticket);
      openShiftLogbookMaintenanceReview();
      setShiftLogbookRcaSource('Maintenance Work Order');
      setShiftLogbookRcaNumber(ticket.number ?? ticket.workOrder ?? ticket.id ?? null);
      return;
    }

    if (isEso || isIncident) {
      setShiftLogbookMaintenanceReviewDetails(ticket);
      setShiftLogbookRcaSource(isIncident ? 'Incident' : 'ESO');
      setShiftLogbookRcaNumber(ticket.number ?? ticket.workOrder ?? ticket.id ?? null);
      openShiftLogbookRcaDrawer();
    }
  };

  const [isShiftEntryOpen, setIsShiftEntryOpen] = useState(false);
  const [shiftEntryMode, setShiftEntryMode] = useState<ShiftEntryMode>('maintenance');
  const [shiftEntryMaintenancePrefill, setShiftEntryMaintenancePrefill] = useState<ShiftEntryMaintenancePrefill | null>(null);

  const handleShiftLogbookEsoSaved = (payload: ShiftEntryEsoSavedPayload) => {
    const tone = payload.esoType === 'Near Miss'
      ? '#F04E4E'
      : payload.esoType === 'Condition Report'
        ? '#FF8A00'
        : '#3D7BFF';
    const ticketType = payload.esoType === 'Near Miss' ? 'Incident' : 'Observation';

    setShiftLogbookSubmittedEsoEntries((prev) => [
      {
        id: payload.recordId,
        title: payload.title,
        category: 'ESO',
        ticketType,
        line: payload.line,
        zone: payload.zone,
        riskLevel: payload.riskLevel,
        shift: payload.shift,
        status: 'Open',
        reporter: payload.reporter,
        reporterType: 'Human',
        createdAt: payload.createdAt,
        dateScope: 'Current Shift',
        tone,
      },
      ...prev,
    ]);
  };

  const saveShiftLogbookRca = (payload?: { method?: ShiftLogbookRcaMethod; status?: 'Draft' | 'Submitted' }) => {
    const method = payload?.method ?? shiftLogbookRcaMethod ?? '5 Whys';
    const savedState = payload?.status ?? 'Draft';
    const methodLabel = method === '5 Whys' ? '5 Whys' : method === 'Fishbone Diagram' ? 'Fishbone' : 'Fault Tree';
    const sourceNumber = shiftLogbookRcaNumber ?? shiftLogbookMaintenanceReviewDetails?.number ?? shiftLogbookMaintenanceReviewDetails?.workOrder ?? 'RCA Draft';
    const equipment = shiftLogbookMaintenanceReviewDetails?.equipment
      ?? shiftLogbookMaintenanceReviewDetails?.title
      ?? shiftLogbookMaintenanceReviewDetails?.area
      ?? 'Current equipment';
    const problem = shiftLogbookFiveWhysProblem
      || shiftLogbookMaintenanceReviewDetails?.description
      || shiftLogbookMaintenanceReviewDetails?.problemDescription
      || shiftLogbookMaintenanceReviewDetails?.title
      || 'Root cause analysis opened from Logbook context.';

    setShiftLogbookSubmittedRcaEntries((prev) => [
      {
        id: `RCA-${Date.now()}`,
        title: `${methodLabel} ${savedState.toLowerCase()} for ${equipment}`,
        category: 'RCA',
        ticketType: methodLabel,
        line: shiftLogbookMaintenanceReviewDetails?.line ?? 'Line 10',
        zone: shiftLogbookMaintenanceReviewDetails?.zone ?? 'Zone 01',
        riskLevel: shiftLogbookMaintenanceReviewDetails?.riskLevel ?? 'Medium',
        shift: shiftLogbookMaintenanceReviewDetails?.shift ?? 'Current Shift',
        status: savedState === 'Submitted' ? 'Closed' : 'In Progress',
        reporter: 'BLU.AI',
        reporterType: 'AI',
        createdAt: 'Live now',
        dateScope: 'Current Shift',
        tone: savedState === 'Submitted' ? '#16A34A' : '#2563EB',
        number: sourceNumber,
        workOrder: sourceNumber,
        equipment,
        description: problem,
      },
      ...prev,
    ]);
    setShiftLogbookCategory('RCA');
    setShiftLogbookSearch('');
    setIsShiftLogbookRcaDrawerOpen(false);
    setIsShiftLogbookFiveWhysDrawerOpen(false);
    setIsShiftLogbookFishboneOpen(false);
    setIsShiftLogbookFaultTreeOpen(false);
    setCurrentScreen('shift_logbook');
  };

  return {
    shiftLogbookCategory,
    setShiftLogbookCategory,
    shiftLogbookScope,
    setShiftLogbookScope,
    shiftLogbookSearch,
    setShiftLogbookSearch,
    shiftLogbookFilters,
    setShiftLogbookFilters,
    isShiftLogbookRcaDrawerOpen,
    setIsShiftLogbookRcaDrawerOpen,
    isShiftLogbookFiveWhysDrawerOpen,
    setIsShiftLogbookFiveWhysDrawerOpen,
    shiftLogbookRcaMethod,
    setShiftLogbookRcaMethod,
    shiftLogbookRcaSource,
    setShiftLogbookRcaSource,
    isShiftLogbookFishboneOpen,
    setIsShiftLogbookFishboneOpen,
    isShiftLogbookFaultTreeOpen,
    setIsShiftLogbookFaultTreeOpen,
    isShiftLogbookSourceDrawerOpen,
    setIsShiftLogbookSourceDrawerOpen,
    isShiftLogbookMaintenanceReviewOpen,
    setIsShiftLogbookMaintenanceReviewOpen,
    isShiftLogbookCreateActionOpen,
    setIsShiftLogbookCreateActionOpen,
    isShiftLogbookActionRecording,
    setIsShiftLogbookActionRecording,
    shiftLogbookSubmittedEsoEntries,
    setShiftLogbookSubmittedEsoEntries,
    shiftLogbookSubmittedRcaEntries,
    setShiftLogbookSubmittedRcaEntries,
    shiftLogbookRcaNumber,
    setShiftLogbookRcaNumber,
    shiftLogbookFiveWhysSteps,
    setShiftLogbookFiveWhysSteps,
    shiftLogbookFiveWhysProblem,
    setShiftLogbookFiveWhysProblem,
    shiftLogbookMaintenanceReviewDetails,
    setShiftLogbookMaintenanceReviewDetails,
    pendingDashboardRecordAction,
    setPendingDashboardRecordAction,
    closeShiftLogbookRcaFlow,
    openShiftLogbookRcaDrawer,
    openShiftLogbookFiveWhysDrawer,
    returnToShiftLogbookRcaMethodDrawer,
    openShiftLogbookFishboneWorkspace,
    closeShiftLogbookFishboneWorkspace,
    openShiftLogbookFaultTreeWorkspace,
    closeShiftLogbookFaultTreeWorkspace,
    openShiftLogbookMaintenanceReview,
    closeShiftLogbookMaintenanceReview,
    openShiftLogbookCreateActionDrawer,
    closeShiftLogbookCreateActionDrawer,
    handleShiftLogbookCategorySelect,
    handleShiftLogbookTicketSelect,
    isShiftEntryOpen,
    setIsShiftEntryOpen,
    shiftEntryMode,
    setShiftEntryMode,
    shiftEntryMaintenancePrefill,
    setShiftEntryMaintenancePrefill,
    handleShiftLogbookEsoSaved,
    saveShiftLogbookRca,
  };
};
