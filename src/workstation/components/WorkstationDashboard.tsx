import {PersonalWorkstationDashboard} from './PersonalWorkstationDashboard';
import type {
  MaintenanceOpenTarget,
  WorkstationContextualAiAssistantPayload,
  WorkstationContextualizationTarget,
  WorkstationDashboardData,
  WorkstationMeetingTopic,
} from '../types';

type WorkstationDashboardProps = {
  data: WorkstationDashboardData;
  layoutStorageKey?: string;
  initialSnapshot?: any;
  chartFilters?: {
    shift: 'All' | 'Shift A' | 'Shift B' | 'Shift C';
    timeframe: 'Today' | 'Yesterday' | 'Last 7 days' | 'Last 30 days';
  };
  hideDeliveryCurrentOrderCard?: boolean;
  useTierSqdcCarousel?: boolean;
  tierOverviewLabel?: string;
  tierOverviewItemPrefix?: string;
  tier1SeriousInjuryIncidentActive?: boolean;
  currentUserName?: string;
  personalMode?: boolean;
  startEmpty?: boolean;
  isEditMode?: boolean;
  setIsEditMode?: (value: boolean) => void;
  tierBoardManualEditMode?: boolean;
  onEditTierWidget?: (widgetId: string) => void;
  tierBoardCostData?: {
    totalScrapProduced: number;
    target: number;
    scrapValues: number[];
  };
  onOpenActionTracker: () => void;
  onOpenSafetyAiReport?: () => void;
  onOpenLineLog: () => void;
  onOpenMaintenance: (target?: MaintenanceOpenTarget) => void;
  onOpenAiAssistant?: (payload: WorkstationContextualAiAssistantPayload) => void;
  onOpenContextualization?: (target: WorkstationContextualizationTarget) => void;
  onOpenEsoEntry?: () => void;
  selectedHeaderHierarchyId?: string;
  onPublish?: () => void;
  onOpenTierMeeting: () => void;
  meetingTopics?: WorkstationMeetingTopic[];
};

export default function WorkstationDashboard({
  data,
  layoutStorageKey = 'workstation-layout',
  initialSnapshot,
  chartFilters,
  hideDeliveryCurrentOrderCard,
  useTierSqdcCarousel,
  tierOverviewLabel,
  tierOverviewItemPrefix,
  tier1SeriousInjuryIncidentActive,
  currentUserName,
  personalMode = false,
  startEmpty = false,
  isEditMode,
  setIsEditMode,
  tierBoardManualEditMode,
  onEditTierWidget,
  tierBoardCostData,
  onOpenActionTracker,
  onOpenSafetyAiReport,
  onOpenLineLog,
  onOpenMaintenance,
  onOpenAiAssistant,
  onOpenContextualization,
  onOpenEsoEntry,
  selectedHeaderHierarchyId,
  onPublish,
  onOpenTierMeeting,
  meetingTopics,
}: WorkstationDashboardProps) {
  // We are now using PersonalWorkstationDashboard for both personal and predefined (standard) modes
  // to ensure a unified user experience with rich features (like AI assistant and widget customization)
  // across all workstation types.
  return (
    <PersonalWorkstationDashboard
      data={data}
      layoutStorageKey={layoutStorageKey}
      initialSnapshot={initialSnapshot}
      chartFilters={chartFilters}
      hideDeliveryCurrentOrderCard={hideDeliveryCurrentOrderCard}
      useTierSqdcCarousel={useTierSqdcCarousel}
      tierOverviewLabel={tierOverviewLabel}
      tierOverviewItemPrefix={tierOverviewItemPrefix}
      tier1SeriousInjuryIncidentActive={tier1SeriousInjuryIncidentActive}
      currentUserName={currentUserName}
      startEmpty={startEmpty}
      isEditMode={isEditMode}
      setIsEditMode={setIsEditMode}
      tierBoardManualEditMode={tierBoardManualEditMode}
      onEditTierWidget={onEditTierWidget}
      tierBoardCostData={tierBoardCostData}
      onOpenActionTracker={onOpenActionTracker}
      onOpenSafetyAiReport={onOpenSafetyAiReport}
      onOpenLineLog={onOpenLineLog}
      onOpenMaintenance={onOpenMaintenance}
      onOpenAiAssistant={onOpenAiAssistant}
      onOpenContextualization={onOpenContextualization}
      onOpenEsoEntry={onOpenEsoEntry}
      selectedHeaderHierarchyId={selectedHeaderHierarchyId}
      onPublish={onPublish}
      onOpenTierMeeting={onOpenTierMeeting}
      meetingTopics={meetingTopics}
    />
  );
}
