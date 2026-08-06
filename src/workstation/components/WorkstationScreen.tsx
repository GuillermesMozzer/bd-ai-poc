import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Paper,
  TextField,
  Typography,
  Checkbox,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  ChevronRight as ChevronRightIcon,
  ExpandMore as ExpandMoreIcon,
  FolderOpenOutlined as FolderIcon,
  AutoAwesome as AutoAwesomeIcon,
  UploadFile as UploadFileIcon,
  History as HistoryIcon,
  EditOutlined as EditSectionIcon,
} from '@mui/icons-material';
import { workstationLine10Data } from '../index';
import {
  publishCurrentWorkstation,
  readPublishedWorkstations,
  type PublishedWorkstation,
  getPresetSnapshotForWorkstationTitle,
} from '../publishedWorkstations';
import { accessSelectionTree } from '../allworkstation/data/workstation.mock';
import { AccessNode } from '../allworkstation/data/workstation.types';
import {
  getWorkstationTypeMeta,
  inferWorkstationType,
  workstationTypeOptions,
  type WorkstationType,
} from '../workstationTypes';
import {
  type MaintenanceOpenTarget,
  type WorkstationContextualAiAssistantPayload,
  type WorkstationContextualizationTarget,
  type WorkstationMeetingTopic,
} from '../types';
import ShiftEntry from '../../shiftEntry/ShiftEntry';
import { type ShiftEntryEsoSavedPayload } from '../../shiftEntry/ShiftEntryEso';
import WorkstationAlertBanner from './WorkstationAlertBanner';
import WorkstationDashboard from './WorkstationDashboard';
import WorkstationHeader from './WorkstationHeader';
import MaintenanceTechnicianAiInsights from './MaintenanceTechnicianAiInsights';
import OperatorCristianAiInsights from './OperatorCristianAiInsights';
import EquipmentContextDrawer from '../../aiHome/components/EquipmentContextDrawer';
import {maintenanceContextByAssetId, type MaintenanceContextRecord} from '../../aiHome/components/maintenanceSummaryData';
import OperatorWorkstationTour from '../onboarding/OperatorWorkstationTour';
import TierBoardImportExportDialog from '../../tierMeeting/components/TierBoardImportExportDialog';
import {
  ChangeHistoryModal,
  ReviewChangesModal,
  TierBoardEditWidgetModal,
  createDefaultTierBoardData,
  getTierBoardChanges,
  hasTierBoardChanges,
  validateTierBoardData,
  type TierBoardChangeEntry,
  type TierBoardManualData,
} from './TierBoardManualEdit';

type WorkstationScreenProps = {
  defaultPublishTitle?: string;
  description?: string;
  eyebrow?: string;
  layoutStorageKey?: string;
  openedWorkstationId?: string | null;
  activePredefinedWorkstationTitle?: string | null;
  personalMode?: boolean;
  startEmpty?: boolean;
  currentUserName?: string;
  onAskAi: () => void;
  onOpenActionTracker: () => void;
  onOpenSafetyAiReport?: () => void;
  onOpenLineLog: () => void;
  onOpenMaintenance: (target?: MaintenanceOpenTarget) => void;
  onOpenAiAssistant?: (payload: WorkstationContextualAiAssistantPayload) => void;
  onOpenTierMeeting: () => void;
  onEsoSaved?: (payload: ShiftEntryEsoSavedPayload) => void;
  onOpenWorkstations?: (publishedWorkstation?: PublishedWorkstation) => void;
  selectedHeaderHierarchyId?: string;
  workstationCreateStreams?: string[];
};

import { useWorkstationContext } from '../contexts/WorkstationContext';
import { useShiftManagementContext } from '../../shiftManagement/contexts/ShiftManagementContext';

type HeaderShiftFilter = 'All' | 'Shift A' | 'Shift B' | 'Shift C';
type HeaderTimeframeFilter = 'Today' | 'Yesterday' | 'Last 7 days' | 'Last 30 days';

const headerShiftFilters: HeaderShiftFilter[] = ['All', 'Shift A', 'Shift B', 'Shift C'];
const headerTimeframeFilters: HeaderTimeframeFilter[] = ['Today', 'Yesterday', 'Last 7 days', 'Last 30 days'];
const meetingTopicAvatarColors = ['#A96741', '#7C4428', '#C9886B', '#246BFE', '#00AF95'];

const tierWidgetSectionMap: Record<string, keyof TierBoardManualData> = {
  safety: 'safety',
  quality: 'quality',
  delivery: 'delivery',
  cost: 'cost',
  people: 'people',
  'three-p-tracking': 'threePTracking',
  'loss-focused-kpis': 'lossFocusedKpis',
  'action-tracker': 'actionTracker',
};

export default function WorkstationScreen({
  defaultPublishTitle,
  description,
  eyebrow,
  layoutStorageKey,
  personalMode = false,
  startEmpty = false,
  currentUserName = 'Anonymous',
  onAskAi,
  onOpenActionTracker,
  onOpenSafetyAiReport,
  onOpenLineLog,
  onOpenMaintenance,
  onOpenAiAssistant,
  onOpenTierMeeting,
  onEsoSaved,
  onOpenWorkstations,
  selectedHeaderHierarchyId,
}: WorkstationScreenProps) {
  const { activeWorkstationId, activePredefinedWorkstationTitle } = useWorkstationContext();
  const { setIsShiftEntryOpen } = useShiftManagementContext().logbook;
  const { summary, alert } = workstationLine10Data;
  const [isEditMode, setIsEditMode] = useState(false);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [shiftEntryInitialMode, setShiftEntryInitialMode] = useState<'default' | 'eso'>('default');
  const [selectedEquipmentContext, setSelectedEquipmentContext] = useState<MaintenanceContextRecord | null>(null);
  const [publishTitle, setPublishTitle] = useState('Line 10 Shift Workstation');
  const [publishAuthor, setPublishAuthor] = useState(currentUserName || 'Anonymous');
  const [publishWorkstationType, setPublishWorkstationType] = useState<WorkstationType>('Tier Management');
  const [replaceCandidate, setReplaceCandidate] = useState<PublishedWorkstation | null>(null);
  const [selectedDestinationId, setSelectedDestinationId] = useState<string | null>('plant-columbus-west-area-assembly-unit-a-line-10');
  const [activeShiftFilter, setActiveShiftFilter] = useState<HeaderShiftFilter>('All');
  const [activeTimeframeFilter, setActiveTimeframeFilter] = useState<HeaderTimeframeFilter>('Today');
  const [tier1SeriousInjuryIncidentActive, setTier1SeriousInjuryIncidentActive] = useState(false);
  const [isMeetingTopicOpen, setIsMeetingTopicOpen] = useState(false);
  const [isTierManualEditMode, setIsTierManualEditMode] = useState(false);
  const [isTierEditOpen, setIsTierEditOpen] = useState(false);
  const [isTierReviewOpen, setIsTierReviewOpen] = useState(false);
  const [isTierHistoryOpen, setIsTierHistoryOpen] = useState(false);
  const [isTierImportExportOpen, setIsTierImportExportOpen] = useState(false);
  const [tierManualData, setTierManualData] = useState(() => createDefaultTierBoardData(activePredefinedWorkstationTitle ?? 'Tier'));
  const [tierManualDraft, setTierManualDraft] = useState(() => createDefaultTierBoardData(activePredefinedWorkstationTitle ?? 'Tier'));
  const [tierEditInitialSection, setTierEditInitialSection] = useState<keyof TierBoardManualData>('safety');
  const [tierChangeHistory, setTierChangeHistory] = useState<TierBoardChangeEntry[]>([]);
  const [meetingTopicDraft, setMeetingTopicDraft] = useState('');
  const [meetingTopicDate, setMeetingTopicDate] = useState(() => getTodayInputValue());
  const meetingTopicsStorageKey = `workstation-meeting-topics-${layoutStorageKey ?? activePredefinedWorkstationTitle ?? 'default'}`;
  const [meetingTopics, setMeetingTopics] = useState<WorkstationMeetingTopic[]>(() => readMeetingTopics(meetingTopicsStorageKey));
  const isMeetingTopicsHydratingRef = useRef(false);
  const hideDeliveryCurrentOrderCard = activePredefinedWorkstationTitle === 'Tier 2'
    || activePredefinedWorkstationTitle === 'Tier 3';
  const useTierSqdcCarousel = activePredefinedWorkstationTitle === 'Tier 2'
    || activePredefinedWorkstationTitle === 'Tier 3';
  const isTier1Workstation = activePredefinedWorkstationTitle === 'Tier 1';
  const isTierWorkstation = activePredefinedWorkstationTitle === 'Tier 1'
    || activePredefinedWorkstationTitle === 'Tier 2'
    || activePredefinedWorkstationTitle === 'Tier 3';
  const isMaintenanceTechnicianWorkstation = (eyebrow ?? activePredefinedWorkstationTitle)?.trim().toLowerCase() === 'maintenance technician';
  const operatorCristianIdentifier = `${activeWorkstationId ?? ''} ${eyebrow ?? ''} ${activePredefinedWorkstationTitle ?? ''} ${defaultPublishTitle ?? ''}`.toLowerCase();
  const isOperatorCristianWorkstation = operatorCristianIdentifier.includes('operator-view-cristian')
    || operatorCristianIdentifier.includes('operator view - cristian');
  const tierOverviewLabel = activePredefinedWorkstationTitle === 'Tier 3' ? 'Unit overview' : 'Line overview';
  const tierOverviewItemPrefix = activePredefinedWorkstationTitle === 'Tier 3' ? 'Unit' : 'Line';

  const selectedDestinationPath = useMemo(() => {
    if (!selectedDestinationId) return null;
    const result = findNodeAndPath(accessSelectionTree, selectedDestinationId);
    return result?.path ?? null;
  }, [selectedDestinationId]);

  const selectedDestinationScopeLabel = useMemo(
    () => getNodeScopeLabel(selectedDestinationId),
    [selectedDestinationId],
  );
  const selectedWorkstationTypeMeta = useMemo(
    () => getWorkstationTypeMeta(publishWorkstationType),
    [publishWorkstationType],
  );

  useEffect(() => {
    const openedWorkstation = activeWorkstationId
      ? readPublishedWorkstations().find((workstation) => workstation.id === activeWorkstationId)
      : null;
    const nextTitle = openedWorkstation?.title ?? activePredefinedWorkstationTitle ?? defaultPublishTitle ?? 'Line 10 Shift Workstation';

    setPublishTitle(nextTitle);
    setPublishAuthor(currentUserName || 'Anonymous');
    setPublishWorkstationType(
      openedWorkstation?.workstationType
      ?? inferWorkstationType({
        title: nextTitle,
        domains: openedWorkstation?.domains,
        apps: openedWorkstation?.apps,
      }),
    );
  }, [currentUserName, defaultPublishTitle, activeWorkstationId, activePredefinedWorkstationTitle]);

  useEffect(() => {
    isMeetingTopicsHydratingRef.current = true;
    setMeetingTopics(readMeetingTopics(meetingTopicsStorageKey));
  }, [meetingTopicsStorageKey]);

  useEffect(() => {
    if (isMeetingTopicsHydratingRef.current) {
      isMeetingTopicsHydratingRef.current = false;
      return;
    }
    writeMeetingTopics(meetingTopicsStorageKey, meetingTopics);
  }, [meetingTopics, meetingTopicsStorageKey]);

  useEffect(() => {
    if (!isTier1Workstation) {
      setTier1SeriousInjuryIncidentActive(false);
      return undefined;
    }

    setTier1SeriousInjuryIncidentActive(false);
    const incidentTimer = window.setTimeout(() => {
      setTier1SeriousInjuryIncidentActive(true);
    }, 5000);

    return () => window.clearTimeout(incidentTimer);
  }, [isTier1Workstation]);

  const publishWorkstation = (replaceId?: string) => {
    publishCurrentWorkstation({
      author: publishAuthor,
      layoutStorageKey: layoutStorageKey ?? 'my-workstation-dashboard-layout-v1',
      replaceId,
      title: publishTitle,
      nodeId: selectedDestinationId ?? undefined,
      assignmentSummary: selectedDestinationPath ? selectedDestinationPath.join(' / ') : undefined,
      workstationType: publishWorkstationType,
    });
    setIsPublishOpen(false);
    setReplaceCandidate(null);
  };

  const handlePublish = () => {
    const normalizedTitle = publishTitle.trim().toLowerCase();
    const matchingWorkstation = readPublishedWorkstations().find((workstation) => (
      workstation.title.trim().toLowerCase() === normalizedTitle && workstation.id !== activeWorkstationId
    ));

    if (matchingWorkstation) {
      setReplaceCandidate(matchingWorkstation);
      return;
    }

    publishWorkstation(activeWorkstationId ?? undefined);
  };

  const openOperationsEntry = (initialMode: 'default' | 'eso' = 'default') => {
    setShiftEntryInitialMode(initialMode);
    setIsShiftEntryOpen(true);
  };

  const openContextualization = (target: WorkstationContextualizationTarget) => {
    setSelectedEquipmentContext(maintenanceContextByAssetId[target]);
  };

  const tier1HeaderActions = isTier1Workstation ? (
    <>
      <Button
        variant="outlined"
        size="small"
        sx={{
          height: 36,
          borderRadius: '8px',
          px: 1.8,
          color: tokenBrand.main,
          borderColor: tokenBrand.light,
          bgcolor: 'background.paper',
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          '&:hover': {
            borderColor: tokenBrand.main,
            bgcolor: tokenBrand.softBg,
          },
        }}
      >
        Custom Date
      </Button>
      <Button
        variant="contained"
        size="small"
        startIcon={<AddIcon sx={{fontSize: 17}} />}
        onClick={onOpenActionTracker}
        sx={{
          height: 36,
          borderRadius: '8px',
          px: 1.8,
          bgcolor: tokenBrand.main,
          color: tokenCommon.white,
          boxShadow: 'none',
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          '&:hover': {
            bgcolor: tokenBrand.dark,
            boxShadow: 'none',
          },
        }}
      >
        Create action
      </Button>
      <Button
        variant="outlined"
        size="small"
        sx={{
          height: 36,
          borderRadius: '8px',
          px: 1.8,
          color: tokenBrand.main,
          borderColor: tokenBrand.light,
          bgcolor: 'background.paper',
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          '&:hover': {
            borderColor: tokenBrand.main,
            bgcolor: tokenBrand.softBg,
          },
        }}
      >
        Compare tool
      </Button>
    </>
  ) : null;

  const tierHeaderActions = isTierWorkstation ? (
    <>
      <Button
        variant={isTierManualEditMode ? 'contained' : 'outlined'}
        size="small"
        startIcon={<EditSectionIcon sx={{fontSize: 17}} />}
        onClick={() => {
          setIsTierManualEditMode((current) => !current);
          setIsEditMode(false);
        }}
        sx={{
          height: 36,
          borderRadius: '8px',
          px: 1.8,
          color: isTierManualEditMode ? tokenCommon.white : tokenBrand.main,
          borderColor: tokenBrand.light,
          bgcolor: isTierManualEditMode ? tokenBrand.main : 'background.paper',
          boxShadow: 'none',
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          '&:hover': {
            borderColor: tokenBrand.main,
            bgcolor: isTierManualEditMode ? tokenBrand.dark : tokenBrand.softBg,
            boxShadow: 'none',
          },
        }}
      >
        {isTierManualEditMode ? 'Done editing' : 'Edit sections'}
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<UploadFileIcon sx={{fontSize: 17}} />}
        onClick={() => setIsTierImportExportOpen(true)}
        sx={{
          height: 36,
          borderRadius: '8px',
          px: 1.8,
          color: tokenBrand.main,
          borderColor: tokenBrand.light,
          bgcolor: 'background.paper',
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          '&:hover': {
            borderColor: tokenBrand.main,
            bgcolor: tokenBrand.softBg,
          },
        }}
      >
        Import / Export Data
      </Button>
      <Button
        variant="outlined"
        size="small"
        startIcon={<HistoryIcon sx={{fontSize: 17}} />}
        onClick={() => setIsTierHistoryOpen(true)}
        sx={{
          height: 36,
          borderRadius: '8px',
          px: 1.8,
          color: tokenBrand.main,
          borderColor: tokenBrand.light,
          bgcolor: 'background.paper',
          fontSize: 12,
          fontWeight: 800,
          textTransform: 'none',
          whiteSpace: 'nowrap',
          '&:hover': {
            borderColor: tokenBrand.main,
            bgcolor: tokenBrand.softBg,
          },
        }}
      >
        Change history
      </Button>
      {tier1HeaderActions}
    </>
  ) : tier1HeaderActions;

  const pendingTierChanges = getTierBoardChanges(tierManualData, tierManualDraft, currentUserName || 'Anonymous');
  const openTierWidgetEditor = (widgetId?: string) => {
    setTierEditInitialSection(widgetId ? tierWidgetSectionMap[widgetId] ?? 'safety' : 'safety');
    setTierManualDraft(structuredClone(tierManualData));
    setIsTierEditOpen(true);
  };

  const reviewTierManualChanges = () => {
    const errors = validateTierBoardData(tierManualDraft);
    if (Object.keys(errors).length > 0) return;
    if (!hasTierBoardChanges(tierManualData, tierManualDraft)) {
      setIsTierEditOpen(false);
      return;
    }
    setIsTierEditOpen(false);
    setIsTierReviewOpen(true);
  };

  const confirmTierManualChanges = () => {
    const changes = getTierBoardChanges(tierManualData, tierManualDraft, currentUserName || 'Anonymous');
    setTierManualData(tierManualDraft);
    setTierChangeHistory((current) => [...changes, ...current]);
    setIsTierReviewOpen(false);
    setIsTierManualEditMode(false);
  };

  const handleSaveMeetingTopic = () => {
    const text = meetingTopicDraft.trim();
    if (!text) return;

    setMeetingTopics((currentTopics) => [
      {
        id: `meeting-topic-${Date.now()}`,
        text,
        owner: currentUserName || 'Anonymous',
        initials: getInitials(currentUserName || 'Anonymous'),
        avatarBg: meetingTopicAvatarColors[currentTopics.length % meetingTopicAvatarColors.length],
        scheduledDate: meetingTopicDate,
        createdAt: new Date().toISOString(),
      },
      ...currentTopics,
    ]);
    setMeetingTopicDraft('');
    setMeetingTopicDate(getTodayInputValue());
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        height: isTierWorkstation ? 'calc(100vh - 58px)' : undefined,
        maxHeight: isTierWorkstation ? 'calc(100vh - 58px)' : undefined,
        minHeight: 0,
        overflow: isTierWorkstation ? 'hidden' : undefined,
        overflowY: isTierWorkstation ? 'hidden' : 'auto',
        overflowX: 'hidden',
        bgcolor: 'background.default',
        p: isTierWorkstation ? { xs: 1.2, md: 1.5, xl: 2 } : { xs: 1.5, md: 2, xl: 3.5 },
      }}
    >
      <Box sx={{ height: isTierWorkstation ? '100%' : undefined, minHeight: 0, display: 'flex', flexDirection: 'column', gap: isTierWorkstation ? { xs: 1.2, xl: 1.5 } : { xs: 1.5, xl: 2.5 } }}>
        <WorkstationHeader
          compact={isTierWorkstation}
          eyebrow={isTierWorkstation ? (activePredefinedWorkstationTitle ?? 'Tier').toUpperCase() : eyebrow || publishTitle}
          filterControls={(
            <>
              <FilterDropdown<HeaderShiftFilter>
                label="Shift"
                options={headerShiftFilters}
                value={activeShiftFilter}
                onChange={setActiveShiftFilter}
              />
              <FilterDropdown<HeaderTimeframeFilter>
                label="Period"
                options={headerTimeframeFilters}
                value={activeTimeframeFilter}
                onChange={setActiveTimeframeFilter}
              />
            </>
          )}
          headerActions={tierHeaderActions}
          onOpenLineLog={onOpenLineLog}
          onOpenMeetingTopicDialog={isTierWorkstation ? () => setIsMeetingTopicOpen(true) : undefined}
          onToggleEdit={() => {
            if (isTierWorkstation) {
              setIsTierManualEditMode((current) => !current);
              setIsEditMode(false);
              return;
            }
            setIsEditMode(!isEditMode);
          }}
          isEditMode={isTierWorkstation ? isTierManualEditMode : isEditMode}
          summary={summary}
        />
        {isMaintenanceTechnicianWorkstation ? <MaintenanceTechnicianAiInsights onOpenContextualization={openContextualization} /> : null}
        {isOperatorCristianWorkstation ? <OperatorCristianAiInsights currentUserName={currentUserName} summary={summary} /> : null}
        {personalMode || isTierWorkstation ? null : (
          <WorkstationAlertBanner
            alert={alert}
            onAskAi={onAskAi}
            onOpenActionTracker={onOpenActionTracker}
          />
        )}
        <Box sx={{flex: isTierWorkstation ? '1 1 0' : undefined, minHeight: 0, overflow: isTierWorkstation ? 'hidden' : undefined}}>
          <WorkstationDashboard
            key={`${layoutStorageKey ?? 'default-workstation'}-${personalMode ? 'personal' : 'shared'}-${startEmpty ? 'empty' : 'hydrated'}`}
            data={workstationLine10Data}
            layoutStorageKey={layoutStorageKey}
            initialSnapshot={activePredefinedWorkstationTitle ? getPresetSnapshotForWorkstationTitle(activePredefinedWorkstationTitle) : undefined}
            chartFilters={{
              shift: activeShiftFilter,
              timeframe: activeTimeframeFilter,
            }}
            hideDeliveryCurrentOrderCard={hideDeliveryCurrentOrderCard}
            useTierSqdcCarousel={useTierSqdcCarousel}
            tierOverviewLabel={tierOverviewLabel}
            tierOverviewItemPrefix={tierOverviewItemPrefix}
            tier1SeriousInjuryIncidentActive={isTier1Workstation ? tier1SeriousInjuryIncidentActive : undefined}
            currentUserName={currentUserName}
            meetingTopics={meetingTopics}
            personalMode={personalMode}
            startEmpty={startEmpty}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            tierBoardManualEditMode={isTierWorkstation ? isTierManualEditMode : false}
            onEditTierWidget={isTierWorkstation ? openTierWidgetEditor : undefined}
            tierBoardCostData={{
              totalScrapProduced: tierManualData.cost.totalScrapProduced,
              target: tierManualData.cost.target,
              scrapValues: tierManualData.cost.chartData.map((item) => item.value),
            }}
            onOpenActionTracker={onOpenActionTracker}
            onOpenSafetyAiReport={onOpenSafetyAiReport}
            onOpenLineLog={onOpenLineLog}
            onOpenMaintenance={onOpenMaintenance}
            onOpenAiAssistant={onOpenAiAssistant}
            onOpenContextualization={openContextualization}
            onOpenEsoEntry={() => openOperationsEntry('eso')}
            selectedHeaderHierarchyId={selectedHeaderHierarchyId}
            onPublish={personalMode ? () => setIsPublishOpen(true) : undefined}
            onOpenTierMeeting={onOpenTierMeeting}
          />
        </Box>
      </Box>
      <TierBoardEditWidgetModal
        data={tierManualData}
        draft={tierManualDraft}
        initialSection={tierEditInitialSection}
        onClose={() => setIsTierEditOpen(false)}
        onDraftChange={setTierManualDraft}
        onReviewChanges={reviewTierManualChanges}
        open={isTierEditOpen}
        role="editor"
      />
      <ReviewChangesModal
        changes={pendingTierChanges}
        onBack={() => {
          setIsTierReviewOpen(false);
          setIsTierEditOpen(true);
        }}
        onCancel={() => setIsTierReviewOpen(false)}
        onConfirm={confirmTierManualChanges}
        open={isTierReviewOpen}
      />
      <ChangeHistoryModal
        history={tierChangeHistory}
        onClose={() => setIsTierHistoryOpen(false)}
        open={isTierHistoryOpen}
      />
      <TierBoardImportExportDialog
        open={isTierImportExportOpen}
        tierLevel={activePredefinedWorkstationTitle ?? 'Tier'}
        onClose={() => setIsTierImportExportOpen(false)}
      />
      <Dialog
        open={isMeetingTopicOpen}
        onClose={() => setIsMeetingTopicOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: workstationVisuals.tierShadow,
          },
        }}
      >
        <DialogTitle sx={{pb: 1, pt: 3}}>
          <Typography sx={{fontSize: 22, fontWeight: 900, color: workstationVisuals.textPrimary}}>
            Add meeting topic
          </Typography>
          <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary, mt: 0.5}}>
            Add a note for the next tier meeting or schedule it for a later date.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{pt: 2}}>
          <Box sx={{display: 'grid', gap: 2}}>
            <TextField
              label="Topic note"
              value={meetingTopicDraft}
              onChange={(event) => setMeetingTopicDraft(event.target.value)}
              multiline
              minRows={3}
              fullWidth
              placeholder="Describe the topic to discuss..."
              InputLabelProps={{shrink: true}}
              sx={{
                mt: 0.8,
                '& .MuiInputLabel-root': {
                  bgcolor: workstationVisuals.tierSurface,
                  px: 0.5,
                },
              }}
            />
            <TextField
              label="Schedule for"
              type="date"
              value={meetingTopicDate}
              onChange={(event) => setMeetingTopicDate(event.target.value)}
              InputLabelProps={{shrink: true}}
              fullWidth
            />
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: `1px solid ${workstationVisuals.tierBorder}`,
                bgcolor: workstationVisuals.tierSurfaceSoft,
              }}
            >
              <Typography sx={{fontSize: 14, fontWeight: 900, color: tokenBrand.main, mb: 1}}>
                Previously added topics
              </Typography>
              {meetingTopics.length ? (
                <Box sx={{display: 'grid', gap: 1}}>
                  {meetingTopics.map((topic) => (
                    <Box
                      key={topic.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(0, 1fr) auto',
                        gap: 1,
                        alignItems: 'start',
                        p: 1.2,
                        borderRadius: 1.5,
                        bgcolor: workstationVisuals.tierSurface,
                        border: `1px solid ${workstationVisuals.tierBorder}`,
                      }}
                    >
                      <Box sx={{minWidth: 0}}>
                        <Typography sx={{fontSize: 13, fontWeight: 800, color: workstationVisuals.textPrimary, lineHeight: 1.35}}>
                          {topic.text}
                        </Typography>
                        <Typography sx={{fontSize: 11.5, color: workstationVisuals.textSecondary, mt: 0.4}}>
                          Added by {topic.owner}
                        </Typography>
                      </Box>
                      <Chip
                        label={formatMeetingTopicSchedule(topic.scheduledDate)}
                        size="small"
                        sx={{height: 24, fontSize: 11, fontWeight: 800, bgcolor: tokenBrand.softBg, color: tokenBrand.main}}
                      />
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography sx={{fontSize: 13, color: workstationVisuals.textSecondary}}>
                  No topics have been added yet.
                </Typography>
              )}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{px: 3, pb: 3, pt: 1}}>
          <Button onClick={() => setIsMeetingTopicOpen(false)} variant="outlined" sx={{fontWeight: 800, textTransform: 'none'}}>
            Close
          </Button>
          <Button
            onClick={handleSaveMeetingTopic}
            disabled={!meetingTopicDraft.trim()}
            variant="contained"
            sx={{fontWeight: 900, textTransform: 'none', bgcolor: tokenBrand.main}}
          >
            Save topic
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={isPublishOpen}
        onClose={() => setIsPublishOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: workstationVisuals.tierShadow,
          }
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 3 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 900, color: workstationVisuals.textPrimary }}>Publish as workstation</Typography>
          <Typography sx={{ fontSize: 13, color: workstationVisuals.textSecondary, mt: 0.5 }}>
            Creates a snapshot others can open from Workstations.
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: workstationVisuals.textSecondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Workstation Name
            </Typography>
            <TextField
              value={publishTitle}
              onChange={(event) => setPublishTitle(event.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: tokenNeutral.lightest,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: workstationVisuals.textSecondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Author label
            </Typography>
            <TextField
              value={publishAuthor}
              onChange={(event) => setPublishAuthor(event.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2.5,
                  bgcolor: tokenNeutral.lightest,
                }
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: workstationVisuals.textSecondary, mb: 1, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              Workstation Type
            </Typography>
            <Typography sx={{ fontSize: 12, color: workstationVisuals.textSecondary, mb: 1.5, lineHeight: 1.5 }}>
              Choose the type that should organize this workstation inside Connection Path.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.2 }}>
              {workstationTypeOptions.map((option) => {
                const selected = publishWorkstationType === option.label;
                return (
                  <Paper
                    key={option.label}
                    elevation={0}
                    onClick={() => setPublishWorkstationType(option.label)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      border: `1px solid ${selected ? option.accent : tokenNeutral.main}`,
                      bgcolor: selected ? option.tint : workstationVisuals.tierSurface,
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: selected ? `0 10px 24px color-mix(in srgb, ${option.accent} 9%, transparent)` : 'none',
                      '&:hover': {
                        borderColor: option.accent,
                        bgcolor: option.tint,
                      },
                    }}
                  >
                    <Typography sx={{ fontSize: 13, fontWeight: 900, color: selected ? option.accent : workstationVisuals.tierTextHeading, mb: 0.5 }}>
                      {option.label}
                    </Typography>
                    <Typography sx={{ fontSize: 11.5, color: workstationVisuals.textSecondary, lineHeight: 1.45 }}>
                      {option.description}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: `1px solid ${tokenNeutral.main}`,
              bgcolor: workstationVisuals.tierSurface,
              mb: 3
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 800, color: tokenBrand.darker, mb: 1 }}>
              Destination hierarchy
            </Typography>
            <Typography sx={{ fontSize: 12, color: workstationVisuals.textSecondary, mb: 2, lineHeight: 1.4 }}>
              Select the node that should receive this workstation. Choosing an 'Area', 'Unit', or 'Line' applies to everything below that scope.
            </Typography>

            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1.5,
                py: 0.75,
                bgcolor: tokenNeutral.lightest,
                borderRadius: 2,
                border: `1px solid ${tokenNeutral.main}`,
                mb: 2
              }}
            >
              <SearchIcon sx={{ fontSize: 18, color: workstationVisuals.textMuted, mr: 1 }} />
              <InputBase
                placeholder="Search destination..."
                sx={{ fontSize: 13, flex: 1 }}
              />
              <IconButton size="small" sx={{ color: tokenBrand.light }}>
                <SearchIcon fontSize="small" />
              </IconButton>
            </Paper>

            <Box sx={{ maxHeight: 280, overflowY: 'auto', border: `1px solid ${tokenNeutral.lighter}`, borderRadius: 2 }}>
              {accessSelectionTree.map((node) => (
                <HierarchyItem
                  key={node.id}
                  node={node}
                  level={0}
                  selectedId={selectedDestinationId}
                  onSelect={setSelectedDestinationId}
                />
              ))}
            </Box>
          </Paper>

          {selectedDestinationPath && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: tokenNeutral.lightest,
                border: `1px solid ${tokenNeutral.main}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 800, color: tokenBrand.darker }}>
                  Destination preview
                </Typography>
                <Chip
                  label={`Applies to ${selectedDestinationScopeLabel}`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: 11,
                    fontWeight: 800,
                    bgcolor: tokenNeutral.main,
                    color: tokenBrand.main,
                    borderRadius: 1.5
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: 12, color: workstationVisuals.textSecondary }}>
                {selectedDestinationPath.join(' / ')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={publishWorkstationType}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: 11,
                    fontWeight: 900,
                    bgcolor: selectedWorkstationTypeMeta.tint,
                    color: selectedWorkstationTypeMeta.accent,
                    borderRadius: 1.5,
                    border: `1px solid ${selectedWorkstationTypeMeta.border}`,
                  }}
                />
                <Chip
                  label={`Publishes at ${selectedDestinationScopeLabel}`}
                  size="small"
                  sx={{
                    height: 24,
                    fontSize: 11,
                    fontWeight: 800,
                    bgcolor: workstationVisuals.tierSurface,
                    color: workstationVisuals.tierTextLabel,
                    borderRadius: 1.5,
                    border: `1px solid ${tokenNeutral.main}`,
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: workstationVisuals.tierTextHeading }}>
                {selectedDestinationPath.map((item, i) => (
                  <span key={i}>
                    {item}
                    {i < selectedDestinationPath.length - 1 && (
                      <ChevronRightIcon sx={{ fontSize: 14, verticalAlign: 'middle', mx: 0.5, color: workstationVisuals.textMuted }} />
                    )}
                  </span>
                ))}
              </Typography>
              <Typography sx={{ fontSize: 11, color: workstationVisuals.textSecondary, mt: 0.5, lineHeight: 1.4 }}>
                Choose whether this workstation should land at area, unit, line, or zone level before publishing.
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            onClick={() => setIsPublishOpen(false)}
            variant="outlined"
            sx={{
              fontWeight: 800,
              borderRadius: 2.5,
              px: 3,
              py: 1,
              textTransform: 'none',
              borderColor: tokenNeutral.main,
              color: workstationVisuals.tierTextLabel
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePublish}
            variant="contained"
            sx={{
              fontWeight: 900,
              borderRadius: 2.5,
              px: 4,
              py: 1,
              textTransform: 'none',
              bgcolor: tokenBrand.main,
              boxShadow: 'none',
              '&:hover': {
                bgcolor: tokenBrand.main,
                boxShadow: 'none',
              }
            }}
          >
            Publish
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={Boolean(replaceCandidate)} onClose={() => setReplaceCandidate(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: 22, fontWeight: 900, color: workstationVisuals.textPrimary }}>Replace workstation?</Typography>
          <Typography sx={{ fontSize: 13, color: workstationVisuals.textSecondary, mt: 0.8 }}>
            A workstation with this title already exists. Do you want to replace it with the current view?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: tokenNeutral.lightest, border: `1px solid ${tokenNeutral.main}` }}>
            <Typography sx={{ fontSize: 14, fontWeight: 900, color: workstationVisuals.tierTextHeading }}>
              {replaceCandidate?.title}
            </Typography>
            <Typography sx={{ fontSize: 12, color: workstationVisuals.textSecondary, mt: 0.45 }}>
              The saved widgets and layout will be overwritten.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setReplaceCandidate(null)} variant="outlined" sx={{ fontWeight: 800 }}>
            Cancel
          </Button>
          <Button onClick={() => replaceCandidate && publishWorkstation(replaceCandidate.id)} variant="contained" sx={{ fontWeight: 900 }}>
            Replace
          </Button>
        </DialogActions>
      </Dialog>
      <EquipmentContextDrawer
        context={selectedEquipmentContext}
        open={Boolean(selectedEquipmentContext)}
        onClose={() => setSelectedEquipmentContext(null)}
        onOpenEso={() => onOpenMaintenance('followup')}
        onOpenEsoDetails={() => onOpenMaintenance('followup')}
        onOpenMaintenanceRequest={() => onOpenMaintenance('followup')}
        onOpenMaintenanceRequestDetails={() => onOpenMaintenance('followup')}
        onOpenSmartSearch={onAskAi}
        onOpenWorkOrder={() => onOpenMaintenance('calendar')}
        onOpenWorkOrderDetails={() => onOpenMaintenance('calendar')}
      />
      <OperatorWorkstationTour />
    </Box>
  );
}

function FilterDropdown<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <TextField
      select
      label={label}
      size="small"
      value={value}
      onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value as T)}
      SelectProps={{ native: true }}
      sx={{
        minWidth: label === 'Shift' ? 148 : 176,
        '& .MuiInputLabel-root': {
          color: tokenBrand.main,
          fontSize: 12,
          fontWeight: 800,
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: tokenBrand.main,
        },
        '& .MuiOutlinedInput-root': {
          height: 36,
          borderRadius: 999,
          bgcolor: workstationVisuals.tierSurface,
          color: tokenBrand.main,
          fontSize: 12,
          fontWeight: 850,
          '& fieldset': {
            borderColor: tokenBrand.lighter,
          },
          '&:hover fieldset': {
            borderColor: tokenBrand.lighter,
          },
          '&.Mui-focused fieldset': {
            borderColor: tokenBrand.main,
            borderWidth: 1,
          },
        },
      }}
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </TextField>
  );
}

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getInitials(name: string) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
  return initials || 'U';
}

function readMeetingTopics(storageKey: string): WorkstationMeetingTopic[] {
  if (typeof window === 'undefined') return [];

  try {
    const rawTopics = window.localStorage.getItem(storageKey);
    if (!rawTopics) return [];
    const parsedTopics = JSON.parse(rawTopics);
    if (!Array.isArray(parsedTopics)) return [];
    return parsedTopics.filter((topic): topic is WorkstationMeetingTopic => (
      typeof topic?.id === 'string'
      && typeof topic?.text === 'string'
      && typeof topic?.owner === 'string'
      && typeof topic?.initials === 'string'
      && typeof topic?.avatarBg === 'string'
      && typeof topic?.scheduledDate === 'string'
      && typeof topic?.createdAt === 'string'
    ));
  } catch {
    return [];
  }
}

function writeMeetingTopics(storageKey: string, topics: WorkstationMeetingTopic[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(storageKey, JSON.stringify(topics));
}

function formatMeetingTopicSchedule(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

function findNodeAndPath(tree: AccessNode[], id: string, path: string[] = []): { node: AccessNode, path: string[] } | null {
  for (const node of tree) {
    const currentPath = [...path, node.label];
    if (node.id === id) {
      return { node, path: currentPath };
    }
    if (node.children) {
      const result = findNodeAndPath(node.children, id, currentPath);
      if (result) return result;
    }
  }
  return null;
}

function getNodeScopeLabel(nodeId: string | null) {
  if (!nodeId) return 'Line';
  const path = findNodeAndPath(accessSelectionTree, nodeId)?.path ?? [];
  if (path.length >= 5) return 'Zone';
  if (path.length === 4) return 'Line';
  if (path.length === 3) return 'Unit';
  if (path.length === 2) return 'Area';
  return 'Plant';
}

function HierarchyItem({
  node,
  level,
  selectedId,
  onSelect,
}: {
  node: AccessNode;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(level === 0);
  const isSelected = selectedId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <Box>
      <Box
        onClick={() => onSelect(node.id)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          py: 0.8,
          px: 1.5,
          pl: 1.5 + level * 2,
          cursor: 'pointer',
          bgcolor: isSelected ? tokenNeutral.lightest : 'transparent',
          '&:hover': { bgcolor: isSelected ? tokenNeutral.lightest : tokenNeutral.lightest },
          transition: 'all 0.15s ease',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            mr: 1,
            visibility: hasChildren ? 'visible' : 'hidden',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
        >
          {expanded ? <ExpandMoreIcon sx={{ fontSize: 16, color: workstationVisuals.textMuted }} /> : <ChevronRightIcon sx={{ fontSize: 16, color: workstationVisuals.textMuted }} />}
        </Box>

        <Checkbox
          size="small"
          checked={isSelected}
          sx={{ p: 0.5, mr: 1, color: tokenNeutral.dark, '&.Mui-checked': { color: tokenBrand.main } }}
        />

        <FolderIcon sx={{ fontSize: 18, mr: 1, color: isSelected ? tokenBrand.main : workstationVisuals.textMuted }} />

        <Typography
          sx={{
            fontSize: 13,
            fontWeight: isSelected ? 800 : 500,
            color: isSelected ? tokenBrand.darker : workstationVisuals.tierTextLabel,
            flex: 1,
          }}
        >
          {node.label}
        </Typography>
      </Box>
      {hasChildren && expanded && (
        <Box>
          {node.children?.map((child) => (
            <HierarchyItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
