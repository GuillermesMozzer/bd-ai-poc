import { tokenBrand, tokenError, tokenWarning, tokenSuccess, tokenInfo, tokenNeutral, tokenText, tokenCommon, workstationVisuals, workstationChartSemantic, workstationPriorityTone, workstationSqdcpTone } from '../theme';
import {useEffect, useMemo, useState} from 'react';
import {Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Portal, TextField, Typography} from '@mui/material';
import {
  Add as AddIcon,
  AccessTimeOutlined as ClockIcon,
  AutoAwesome as AutoAwesomeIcon,
  CampaignOutlined as CampaignIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  EditOutlined as EditOutlinedIcon,
  EmojiEventsOutlined as TrophyIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as TrendDownIcon,
  LightbulbOutlined as LightbulbOutlinedIcon,
  OpenInFull as OpenInFullIcon,
  PlayArrow as PlayArrowIcon,
  StarBorder as StarIcon,
  Stop as StopIcon,
  ToggleOff as ToggleOffIcon,
  WarningAmber as WarningIcon,
  Build as BuildIcon,
} from '@mui/icons-material';
import {useWorkstationContext} from '../contexts/WorkstationContext';
import {type LossFocusedMetricId} from './lossFocusedKpisData';
import {
  WidgetNotificationBell,
  WidgetNotificationsDialog,
  lossFocusedKpisNotificationConfig,
  useWidgetNotifications,
} from './WidgetNotifications';
import {type WorkstationMeetingTopic} from '../types';

type MyLossFocusedKpisWidgetProps = {
  activeMetricIds: LossFocusedMetricId[];
  chartType?: LossFocusedChartType;
  onChartTypeChange?: (chartType: LossFocusedChartType) => void;
  onExpand?: () => void;
  onToggleMetric?: (metricId: LossFocusedMetricId) => void;
  meetingTopics?: WorkstationMeetingTopic[];
};

type LossFocusedChartType = 'bars' | 'lines';
type LossKpiSlideId = 'changeover' | 'breakdown' | 'scrap' | 'downtime' | 'micro-stops' | 'speed-loss';
type MessageSlideId = 'recognition' | 'communication';
type GembaDeviationRecord = {
  process: string;
  description: string;
  location: string;
  date: string;
  deviationCount: number;
};

const gembaFieldSx = {
  mt: 0.4,
  '& .MuiInputLabel-root': {
    bgcolor: '#FFFFFF',
    px: 0.5,
    color: '#667085',
    lineHeight: 1.2,
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#0B63E5',
  },
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
  },
} as const;

const chartSlides: Array<{
  id: LossKpiSlideId;
  label: string;
  minutes: number;
  score: number;
  values: number[];
  markerTones: Array<'good' | 'bad'>;
}> = [
  {
    id: 'changeover',
    label: 'Changeover',
    minutes: 244,
    score: 244,
    values: [42, 58, 56, 49, 24, 57, 53],
    markerTones: ['good', 'bad', 'bad', 'good', 'good', 'bad', 'good'],
  },
  {
    id: 'breakdown',
    label: 'Breakdown',
    minutes: 82,
    score: 85,
    values: [40, 33, 27, 20, 31, 70, 21],
    markerTones: ['good', 'good', 'good', 'good', 'good', 'bad', 'good'],
  },
  {
    id: 'scrap',
    label: 'Scrap',
    minutes: 120,
    score: 15,
    values: [36, 44, 52, 47, 60, 42, 38],
    markerTones: ['good', 'good', 'bad', 'good', 'bad', 'good', 'good'],
  },
  {
    id: 'downtime',
    label: 'Downtime',
    minutes: 188,
    score: 188,
    values: [50, 43, 64, 58, 46, 72, 55],
    markerTones: ['good', 'good', 'bad', 'bad', 'good', 'bad', 'good'],
  },
  {
    id: 'micro-stops',
    label: 'Micro Stops',
    minutes: 96,
    score: 96,
    values: [30, 34, 31, 45, 38, 36, 29],
    markerTones: ['good', 'good', 'good', 'bad', 'good', 'good', 'good'],
  },
  {
    id: 'speed-loss',
    label: 'Speed Loss',
    minutes: 132,
    score: 132,
    values: [48, 41, 39, 44, 52, 49, 46],
    markerTones: ['bad', 'good', 'good', 'good', 'bad', 'bad', 'good'],
  },
];

const topLossRowsByChart: Record<LossKpiSlideId, string[]> = {
  changeover: [
    'Tooling not staged before planned stop',
    'Line clearance exceeded standard by 18 minutes',
    'Post-changeover quality checks repeated',
  ],
  breakdown: [
    'Filler station jammed during startup',
    'Conveyor sensor fault stopped transfer',
    'Labeler motor overheating alarm',
  ],
  scrap: [
    'High defect rate during startup',
    'Seal inspection rejects above target',
    'Printed label alignment out of spec',
  ],
  downtime: [
    'Running below standard cycle time',
    'Material waiting at staging area',
    'Extended sanitation hold before restart',
  ],
  'micro-stops': [
    'Short stops from infeed misalignment',
    'Operator reset needed at packer',
    'Photoeye nuisance trips on Line 10',
  ],
  'speed-loss': [
    'Reduced speed during tray loading',
    'Batch ramp-up below standard rate',
    'Air pressure variation slowed filler',
  ],
};

const lossMetricIds = ['breakdown', 'changeover', 'scrap', 'micro-stops', 'speed-loss'];

function getInitialVisibleCharts(activeMetricIds: LossFocusedMetricId[]) {
  const activeSet = new Set(activeMetricIds);
  const visible = Object.fromEntries(
    chartSlides.map((slide) => [slide.id, activeMetricIds.length === 0 ? ['changeover', 'breakdown'].includes(slide.id) : activeSet.has(slide.id as LossFocusedMetricId)]),
  ) as Record<LossKpiSlideId, boolean>;

  if (!Object.values(visible).some(Boolean)) {
    visible.changeover = true;
  }

  return visible;
}

const recognitionRows = [
  {
    id: 'carlos',
    icon: 'star',
    name: 'Carlos Mendez',
    initials: 'CM',
    avatarBg: tokenError.darker,
    message: 'Helped train 3 new operators',
  },
  {
    id: 'john',
    icon: 'trophy',
    name: 'John Joshua',
    initials: 'JJ',
    avatarBg: tokenWarning.darker,
    message: '30-day streak with zero defects',
  },
];

const communicationRows = [
  {
    id: 'focus',
    message: "Today's focus: reduce micro-stops on Line 3.",
  },
  {
    id: 'changeover',
    message: 'Planned changeover at 11:00. Ensure tools are ready.',
  },
];

type GembaDeviationStatus = 'Open' | 'In Progress' | 'Resolved';

type GembaDeviationItem = {
  process: string;
  tone: 'green' | 'green-check' | 'orange';
  date: string;
  status: GembaDeviationStatus;
  text: string;
  area: string;
  unit: string;
  line: string;
};

const gembaProcessNames = ['Tier 1 Board', 'TMS 1 Short-term Interval Control', '5S', 'Quality Scale', 'Quality GMP', 'People'] as const;

const gembaDeviationItems: GembaDeviationItem[] = [
  {
    process: 'Tier 1 Board',
    tone: 'green',
    date: 'Yesterday',
    status: 'In Progress',
    text: 'Line 3 electrical panel door left open and unlocked during operation.',
    area: 'Area A',
    unit: 'Unit A',
    line: 'Line 3',
  },
  {
    process: 'Tier 1 Board',
    tone: 'orange',
    date: 'Today',
    status: 'Open',
    text: 'Line leader board missing owner update for one overdue containment action.',
    area: 'Area C',
    unit: 'Unit E',
    line: 'Line 10',
  },
  {
    process: 'TMS 1 Short-term Interval Control',
    tone: 'orange',
    date: 'Today',
    status: 'Open',
    text: 'Line 1 conveyor visual buffer levels not updated on dry-erase board.',
    area: 'Area A',
    unit: 'Unit A',
    line: 'Line 1',
  },
  {
    process: 'TMS 1 Short-term Interval Control',
    tone: 'green',
    date: 'Yesterday',
    status: 'In Progress',
    text: 'Minor bottle-neck at capping station due to starwheel misalignment.',
    area: 'Area A',
    unit: 'Unit B',
    line: 'Pack Line 1',
  },
  {
    process: 'TMS 1 Short-term Interval Control',
    tone: 'orange',
    date: '05/17',
    status: 'Open',
    text: 'Staging area cluttered, blocking fork trucks access path.',
    area: 'Area B',
    unit: 'Unit D',
    line: 'Warehouse Dock',
  },
  {
    process: '5S',
    tone: 'orange',
    date: 'Today',
    status: 'Open',
    text: 'Calibration date expired on Micrometer #4 in packing cell.',
    area: 'Area A',
    unit: 'Unit B',
    line: 'Pack Line 2',
  },
  {
    process: '5S',
    tone: 'green-check',
    date: 'Today',
    status: 'Resolved',
    text: 'Scrap bin overflowing at Cell 12 due to visual sorting guidelines mismatch.',
    area: 'Area A',
    unit: 'Unit C',
    line: 'Quality Lab',
  },
  {
    process: 'Quality Scale',
    tone: 'orange',
    date: 'Yesterday',
    status: 'Open',
    text: 'Scale verification label not visible from the standard inspection position.',
    area: 'Area A',
    unit: 'Unit C',
    line: 'Quality Lab',
  },
  {
    process: 'Quality GMP',
    tone: 'orange',
    date: 'Yesterday',
    status: 'Open',
    text: 'Active compressed air leak near pneumatic manifold of palletizer.',
    area: 'Area B',
    unit: 'Unit D',
    line: 'Line 8',
  },
  {
    process: 'Quality GMP',
    tone: 'green',
    date: 'Yesterday',
    status: 'In Progress',
    text: 'Unnecessary conveyor zone 4 run-idle timer set too high.',
    area: 'Area A',
    unit: 'Unit A',
    line: 'Line 3',
  },
  {
    process: 'People',
    tone: 'green-check',
    date: '05/17',
    status: 'Resolved',
    text: 'Skill matrix visual display not updated for the current Q2 rotation.',
    area: 'Area C',
    unit: 'Unit E',
    line: 'Line 10',
  },
] as const;

const gembaTrendMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const gembaTrendSeries = [
  {label: 'Safety', color: '#4FBDEB', values: [46, 50, 51, 48, 44, 46, 39, 50, 53, 44, 50, 50]},
  {label: 'Quality', color: '#EA5A92', values: [49, 52, 52, 50, 47, 49, 42, 53, 55, 46, 52, 52]},
  {label: 'Delivery', color: '#92C84A', values: [48, 52, 53, 49, 47, 48, 41, 52, 54, 46, 52, 52]},
  {label: 'Cost', color: '#FF845F', values: [48, 52, 52, 50, 47, 49, 40, 52, 55, 46, 52, 52]},
  {label: 'People', color: '#8F72D0', values: [49, 51, 52, 49, 45, 48, 42, 53, 55, 45, 52, 52]},
] as const;

const meetingTopicRows = [
  {
    id: 'line-3-setup',
    text: 'Line 3 setup exceeded target by 18 minutes.',
    owner: 'Carlos Mendez',
    initials: 'CM',
    avatarBg: '#A96741',
  },
  {
    id: 'line-5-bypass',
    text: 'Line 5 bypass issue reviewed; interlock audit must be scheduled.',
    owner: 'John Joshua',
    initials: 'JJ',
    avatarBg: '#7C4428',
  },
  {
    id: 'syringe-seal',
    text: 'Syringe seal variation detected; containment actions initiated.',
    owner: 'Maria Pinna',
    initials: 'MP',
    avatarBg: '#C9886B',
  },
  {
    id: 'alignment',
    text: 'Alignment issue confirmed after 4.5% scrap spike.',
    owner: 'Maria Pinna',
    initials: 'MP',
    avatarBg: '#C9886B',
  },
  {
    id: 'film-stock',
    text: 'Packaging film stock below minimum for Unit 1.',
    owner: 'Maria Pinna',
    initials: 'MP',
    avatarBg: '#C9886B',
  },
];

type MeetingTopicRow = (typeof meetingTopicRows)[number] | WorkstationMeetingTopic;

const aiSuggestedTopics = [
  'Line 4 micro-stop indicates high downtime risk.',
  'Temperature variation may increase defect on Molding Unit 2.',
  'Line 7 current pace below shift target.',
  'Repeated feeder interruptions after changeovers on Line 3.',
  'Syringe Line 5 scrap trend above normal.',
];

const aiSuggestedActions = [
  'Inspect Conveyor Motor B12 during next planned stop.',
  'Rebalance operators across Lines 3 and 4.',
  'Adjust temperature controls on Molding Unit 2.',
];

const endMeetingGroups = [
  {
    label: '3 Actions Created',
    rows: [
      {tone: '#FF8A00', text: 'Unexpected temperature fluctuations observed in the molding unit during production.'},
      {tone: '#FF4438', text: 'Component alignment out of specification noted in recent assembly checks.'},
      {tone: '#34A853', text: 'Noise levels higher than acceptable thresholds in the packaging area.'},
    ],
  },
  {
    label: '2 Actions Completed',
    rows: [
      {tone: '#FF8A00', text: 'Temperature fluctuations observed in the molding unit during production.'},
      {tone: '#34A853', text: 'Component alignment out of specification noted in recent assembly checks.'},
    ],
  },
  {
    label: '1 Actions Escalated',
    rows: [
      {tone: '#FF8A00', text: 'Component alignment out of specification noted in recent production run.'},
    ],
  },
];

export default function MyLossFocusedKpisWidget({
  activeMetricIds,
  chartType = 'lines',
  meetingTopics = [],
  onExpand,
  onToggleMetric,
}: MyLossFocusedKpisWidgetProps) {
  const {activePredefinedWorkstationTitle} = useWorkstationContext();
  const [activeChartIndex, setActiveChartIndex] = useState(0);
  const [activeMessageIndex, setActiveMessageIndex] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [visibleCharts, setVisibleCharts] = useState<Record<LossKpiSlideId, boolean>>(() => getInitialVisibleCharts(activeMetricIds));
  const [showTopLosses, setShowTopLosses] = useState(true);
  const [isStartMeetingOpen, setIsStartMeetingOpen] = useState(false);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isMeetingPanelOpen, setIsMeetingPanelOpen] = useState(false);
  const [isEndMeetingOpen, setIsEndMeetingOpen] = useState(false);
  const [showMeetingEndedToast, setShowMeetingEndedToast] = useState(false);
  const [isGembaDrilldownOpen, setIsGembaDrilldownOpen] = useState(false);
  const [isGembaDeviationFormOpen, setIsGembaDeviationFormOpen] = useState(false);
  const [latestGembaDeviation, setLatestGembaDeviation] = useState<GembaDeviationRecord | null>(null);
  const [gembaProcessDeviationCounts, setGembaProcessDeviationCounts] = useState<Record<string, number>>({
    'TMS 1 Short-term Interval Control': 23,
    'Tier 1 Board': 12,
    '5S': 9,
  });
  const [activeGembaTab, setActiveGembaTab] = useState<'deviations' | 'trends'>('deviations');
  const notifications = useWidgetNotifications(lossFocusedKpisNotificationConfig);
  const enabledChartSlides = useMemo(
    () => chartSlides.filter((slide) => visibleCharts[slide.id]),
    [visibleCharts],
  );
  const activeChart = enabledChartSlides[Math.min(activeChartIndex, enabledChartSlides.length - 1)] ?? chartSlides[0];
  const activeMessageSlide: MessageSlideId = activeMessageIndex === 0 ? 'recognition' : 'communication';
  const isTierBoard = activePredefinedWorkstationTitle === 'Tier 1'
    || activePredefinedWorkstationTitle === 'Tier 2'
    || activePredefinedWorkstationTitle === 'Tier 3';
  const isTier3Board = activePredefinedWorkstationTitle === 'Tier 3';
  const meetingTopicAgendaRows = useMemo(
    () => [...meetingTopics, ...meetingTopicRows],
    [meetingTopics],
  );

  useEffect(() => {
    if (activeChartIndex > enabledChartSlides.length - 1) {
      setActiveChartIndex(0);
    }
  }, [activeChartIndex, enabledChartSlides.length]);

  const toggleChart = (chartId: LossKpiSlideId) => {
    const selectedCount = Object.values(visibleCharts).filter(Boolean).length;
    if (visibleCharts[chartId] && selectedCount === 1) return;

    setVisibleCharts((current) => ({...current, [chartId]: !current[chartId]}));
    if (lossMetricIds.includes(chartId)) {
      onToggleMetric?.(chartId as LossFocusedMetricId);
    }
    setActiveChartIndex(0);
  };

  const handleStartMeeting = () => {
    setIsStartMeetingOpen(false);
    setIsMeetingActive(true);
    setIsMeetingPanelOpen(false);
    setShowMeetingEndedToast(false);
  };

  const handleEndMeeting = () => {
    setIsEndMeetingOpen(false);
    setIsMeetingPanelOpen(false);
    setIsMeetingActive(false);
    setShowMeetingEndedToast(true);
  };

  const handleSaveGembaDeviation = (deviation: GembaDeviationRecord) => {
    setLatestGembaDeviation(deviation);
    setGembaProcessDeviationCounts((current) => ({
      ...current,
      [deviation.process]: (current[deviation.process] ?? 0) + deviation.deviationCount,
    }));
  };

  useEffect(() => {
    if (!showMeetingEndedToast) return undefined;

    const toastTimer = window.setTimeout(() => {
      setShowMeetingEndedToast(false);
    }, 3000);

    return () => window.clearTimeout(toastTimer);
  }, [showMeetingEndedToast]);

  return (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        minHeight: 0,
        p: 'clamp(10px, 1.4cqw, 12px)',
        borderRadius: '12px',
        bgcolor: tokenCommon.white,
        border: `1px solid ${tokenNeutral.dark}`,
        boxShadow: 'none',
        overflow: 'hidden',
        containerType: 'inline-size',
        position: 'relative',
      }}
    >
      <Box sx={{display: 'grid', gridTemplateRows: 'auto minmax(0, auto) auto minmax(0, 1fr) 42px', gap: '8px', height: '100%', minHeight: 0}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
          <Typography sx={{ fontSize: 'clamp(16px, 3.4cqw, 20px)', color: workstationVisuals.textPrimary, fontWeight: 800, fontFamily: workstationVisuals.fontFamily, lineHeight: 1 }}>
            Loss Focused KPIs
          </Typography>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
            <WidgetNotificationBell active={notifications.active} onClick={notifications.openDialog} size={26} />
            <IconButton
              size="small"
              aria-label="Edit loss focused KPIs"
              onClick={() => setIsEditOpen((current) => !current)}
              sx={{width: 24, height: 24, color: tokenBrand.main, bgcolor: isEditOpen ? tokenNeutral.lighter : 'transparent'}}
            >
              <EditOutlinedIcon sx={{fontSize: 17}} />
            </IconButton>
            <IconButton size="small" aria-label="Expand loss focused KPIs" onClick={onExpand} sx={{width: 24, height: 24, color: tokenBrand.main, bgcolor: 'transparent'}}>
              <OpenInFullIcon sx={{fontSize: 17}} />
            </IconButton>
          </Box>
        </Box>

        {isEditOpen ? (
          <LossFocusedConfigPanel
            hideTopLossesOption={isTier3Board}
            showTopLosses={showTopLosses}
            visibleCharts={visibleCharts}
            onClose={() => setIsEditOpen(false)}
            onToggleChart={toggleChart}
            onToggleTopLosses={() => setShowTopLosses((current) => !current)}
          />
        ) : null}

        <Box>
          <LossFocusedChartCard chartType={chartType} slide={activeChart} />
          {enabledChartSlides.length > 1 ? (
            <CarouselDots
              count={enabledChartSlides.length}
              activeIndex={activeChartIndex}
              onSelect={setActiveChartIndex}
            />
          ) : null}
        </Box>

        {!isTier3Board && showTopLosses ? <TopLossesSection chartId={activeChart.id} /> : null}

        <Box sx={{minHeight: 0, overflow: 'hidden'}}>
          {isTier3Board ? (
            <GembaWalkDeviationsWidget
              latestDeviation={latestGembaDeviation}
              processDeviationCounts={gembaProcessDeviationCounts}
              onAdd={() => setIsGembaDeviationFormOpen(true)}
              onOpen={() => setIsGembaDrilldownOpen(true)}
            />
          ) : null}
          {activeMessageSlide === 'recognition' ? <RecognitionSection /> : <CommunicationSection />}
          <CarouselDots
            count={2}
            activeIndex={activeMessageIndex}
            onSelect={setActiveMessageIndex}
            variant="pause-dots"
          />
        </Box>

        {isTierBoard ? (
          <MeetingActionArea
            isMeetingPanelOpen={isMeetingPanelOpen}
            isMeetingActive={isMeetingActive}
            onEnd={() => setIsEndMeetingOpen(true)}
            onStart={() => setIsStartMeetingOpen(true)}
            onTogglePanel={() => setIsMeetingPanelOpen((current) => !current)}
          />
        ) : null}
      </Box>
      <TierMeetingStartDialog
        meetingTopics={meetingTopicAgendaRows}
        onClose={() => setIsStartMeetingOpen(false)}
        onStart={handleStartMeeting}
        open={isStartMeetingOpen}
      />
      <TierMeetingPanel
        meetingTopics={meetingTopicAgendaRows}
        onEnd={() => setIsEndMeetingOpen(true)}
        onToggle={() => setIsMeetingPanelOpen((current) => !current)}
        open={isMeetingActive && isMeetingPanelOpen}
      />
      <EndTierMeetingDialog
        onClose={() => setIsEndMeetingOpen(false)}
        onEnd={handleEndMeeting}
        open={isEndMeetingOpen}
      />
      <GembaWalkDrilldownDialog
        activeTab={activeGembaTab}
        onClose={() => setIsGembaDrilldownOpen(false)}
        onTabChange={setActiveGembaTab}
        open={isGembaDrilldownOpen}
      />
      <AddGembaWalkDeviationDialog
        open={isGembaDeviationFormOpen}
        onClose={() => setIsGembaDeviationFormOpen(false)}
        onSave={handleSaveGembaDeviation}
      />
      {showMeetingEndedToast ? (
        <Portal>
        <Paper
          elevation={0}
          sx={{
            position: 'fixed',
            top: 88,
            right: 32,
            zIndex: 6000,
            width: 390,
            maxWidth: 'calc(100vw - 32px)',
            p: '14px 16px',
            borderRadius: '4px',
            bgcolor: '#2E7D32',
            color: '#FFFFFF',
            border: '1px solid #4FA85A',
            boxShadow: '0 10px 24px rgba(15,23,42,0.22)',
            display: 'grid',
            gridTemplateColumns: '24px minmax(0, 1fr)',
            gap: 1.2,
          }}
        >
          <CheckCircleOutlineIcon sx={{fontSize: 20, mt: 0.1}} />
          <Box>
            <Typography sx={{fontSize: 20, fontWeight: 900, lineHeight: 1.1}}>
              Tier Meeting Ended
            </Typography>
            <Typography sx={{fontSize: 16, fontWeight: 700, lineHeight: 1.45, mt: 1}}>
              AI-generated meeting minutes shared with the leadership.
            </Typography>
          </Box>
        </Paper>
        </Portal>
      ) : null}
      <WidgetNotificationsDialog
        active={notifications.active}
        config={lossFocusedKpisNotificationConfig}
        draftState={notifications.draftState}
        onApplySuggestion={notifications.applySuggestion}
        onClose={notifications.closeDialog}
        onSave={notifications.saveDialog}
        onStateChange={notifications.setDraftState}
        open={notifications.open}
      />
    </Paper>
  );
}

function MeetingActionArea({
  isMeetingPanelOpen,
  isMeetingActive,
  onEnd,
  onStart,
  onTogglePanel,
}: {
  isMeetingPanelOpen: boolean;
  isMeetingActive: boolean;
  onEnd: () => void;
  onStart: () => void;
  onTogglePanel: () => void;
}) {
  if (isMeetingActive && isMeetingPanelOpen) {
    return null;
  }

  if (isMeetingActive) {
    return (
      <Paper
        elevation={0}
        sx={{
          position: 'relative',
          zIndex: 12,
          mx: '-16px',
          mt: -5.5,
          mb: '-16px',
          p: '10px 14px 14px',
          borderRadius: '12px 12px 0 0',
          borderTop: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
          boxShadow: '0 -14px 30px rgba(15,23,42,0.2)',
        }}
      >
        <IconButton
          aria-label="Expand meeting topics"
          onClick={onTogglePanel}
          sx={{
            display: 'flex',
            width: 34,
            height: 24,
            mx: 'auto',
            mb: 0.8,
            color: '#0B63FF',
            borderRadius: 999,
          }}
        >
          <ExpandLessIcon sx={{fontSize: 21}} />
        </IconButton>
        <Button
          fullWidth
          onClick={onEnd}
          variant="contained"
          startIcon={<StopIcon sx={{fontSize: 16}} />}
          sx={{
            height: 42,
            borderRadius: '8px',
            bgcolor: '#FF3B30',
            color: '#FFFFFF',
            fontSize: 14,
            fontWeight: 900,
            textTransform: 'uppercase',
            boxShadow: 'none',
            '&:hover': {bgcolor: '#E7352C', boxShadow: 'none'},
          }}
        >
          End Meeting
        </Button>
      </Paper>
    );
  }

  return (
    <Button
      fullWidth
      onClick={onStart}
      variant="contained"
      startIcon={<PlayArrowIcon sx={{fontSize: 18}} />}
      sx={{
        height: 42,
        borderRadius: '8px',
        bgcolor: '#2463E8',
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 900,
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 18px rgba(37, 99, 235, 0.24)',
        '& .MuiButton-startIcon': {mr: 0.7, flexShrink: 0},
        '&:hover': {bgcolor: '#1556D8', boxShadow: '0 8px 18px rgba(37, 99, 235, 0.28)'},
      }}
    >
      Start Meeting
    </Button>
  );
}

function TierMeetingStartDialog({
  meetingTopics,
  onClose,
  onStart,
  open,
}: {
  meetingTopics: MeetingTopicRow[];
  onClose: () => void;
  onStart: () => void;
  open: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 800,
          maxWidth: 'calc(100vw - 32px)',
          borderRadius: '8px',
          boxShadow: '0 22px 54px rgba(15,23,42,0.28)',
        },
      }}
    >
      <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, pt: 3.5, pb: 1}}>
        <Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124'}}>
          Tier Meeting
        </Typography>
        <IconButton aria-label="Close tier meeting agenda" onClick={onClose} sx={{width: 28, height: 28, color: '#202124'}}>
          <CloseIcon sx={{fontSize: 20}} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{px: 4, pt: 2, pb: 1}}>
        <Typography sx={{fontSize: 16, color: '#202124', lineHeight: 1.25, mb: 3}}>
          Good morning Team!
          <br />
          Here's the suggested agenda for today:
        </Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr'}, gap: 3}}>
          <Box>
            <Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124', mb: 1.2}}>
              Meeting Topics
            </Typography>
            <Box sx={{display: 'grid', gap: 1}}>
              {meetingTopics.map((topic) => (
                <MeetingTopicCard key={topic.id} topic={topic} />
              ))}
            </Box>
          </Box>
          <Box sx={{display: 'grid', gap: 4, alignContent: 'start'}}>
            <SuggestedList title="Suggested Topics" items={aiSuggestedTopics} icon="topic" />
            <SuggestedList title="Suggested Actions" items={aiSuggestedActions} icon="action" />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{px: 4, pb: 3, pt: 2}}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            height: 36,
            px: 2.6,
            borderRadius: '10px',
            borderColor: '#8CB4FF',
            color: '#0B63FF',
            fontSize: 14,
            fontWeight: 800,
            textTransform: 'uppercase',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onStart}
          variant="contained"
          startIcon={<PlayArrowIcon sx={{fontSize: 18}} />}
          sx={{
            height: 40,
            px: 3,
            borderRadius: '10px',
            bgcolor: '#2463E8',
            boxShadow: 'none',
            fontSize: 14,
            fontWeight: 900,
            textTransform: 'uppercase',
            '&:hover': {bgcolor: '#1556D8', boxShadow: 'none'},
          }}
        >
          Start Meeting
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function TierMeetingPanel({
  meetingTopics,
  onEnd,
  onToggle,
  open,
}: {
  meetingTopics: MeetingTopicRow[];
  onEnd: () => void;
  onToggle: () => void;
  open: boolean;
}) {
  if (!open) return null;

  return (
    <Portal>
    <Paper
      elevation={0}
      sx={{
        position: 'fixed',
        right: {xs: 12, md: 32},
        bottom: 0,
        zIndex: 5500,
        width: 292,
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100vh - 118px)',
        p: '10px 14px 18px',
        borderRadius: '12px 12px 0 0',
        bgcolor: '#FFFFFF',
        border: '1px solid #E6EAF0',
        boxShadow: '0 -10px 36px rgba(15,23,42,0.28)',
        display: 'grid',
        gridTemplateRows: 'auto minmax(0, 1fr) auto',
        gap: 1.5,
      }}
    >
      <IconButton
        aria-label="Collapse meeting topics"
        onClick={onToggle}
        sx={{width: 30, height: 24, mx: 'auto', color: '#0B63FF'}}
      >
        <ExpandLessIcon sx={{fontSize: 22, transform: 'rotate(180deg)'}} />
      </IconButton>
      <Box sx={{minHeight: 0, overflowY: 'auto', pr: 0.2}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mb: 1.2}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124', borderBottom: '2px solid #0B63FF', lineHeight: 1.45}}>
            Meeting Topics
          </Typography>
          <Typography sx={{display: 'flex', alignItems: 'center', gap: 0.2, fontSize: 18, fontWeight: 900, color: '#A0A0A0'}}>
            <AutoAwesomeIcon sx={{fontSize: 18, color: '#FF7A00'}} />
            Topics
          </Typography>
        </Box>
        <Box sx={{display: 'grid', gap: 1.1}}>
          {meetingTopics.map((topic) => (
            <MeetingTopicCard key={topic.id} compact topic={topic} />
          ))}
        </Box>
      </Box>
      <Button
        fullWidth
        onClick={onEnd}
        variant="contained"
        startIcon={<StopIcon sx={{fontSize: 16}} />}
        sx={{
          height: 42,
          borderRadius: '8px',
          bgcolor: '#FF3B30',
          color: '#FFFFFF',
          fontSize: 14,
          fontWeight: 900,
          textTransform: 'uppercase',
          boxShadow: 'none',
          '&:hover': {bgcolor: '#E7352C', boxShadow: 'none'},
        }}
      >
        End Meeting
      </Button>
    </Paper>
    </Portal>
  );
}

function EndTierMeetingDialog({
  onClose,
  onEnd,
  open,
}: {
  onClose: () => void;
  onEnd: () => void;
  open: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          width: 728,
          maxWidth: 'calc(100vw - 32px)',
          borderRadius: '8px',
          boxShadow: '0 22px 54px rgba(15,23,42,0.28)',
        },
      }}
    >
      <DialogTitle sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3.5, pt: 3, pb: 1.5}}>
        <Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124'}}>
          End Tier Meeting
        </Typography>
        <IconButton aria-label="Close end meeting summary" onClick={onClose} sx={{width: 28, height: 28, color: '#202124'}}>
          <CloseIcon sx={{fontSize: 20}} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{px: 3.5, pt: 1, pb: 2}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2, mb: 2.8}}>
          <ToggleOffIcon sx={{fontSize: 38, color: '#CBD1D8'}} />
          <Typography sx={{fontSize: 18, color: '#202124'}}>
            All topics, Actions and Issues were dealt with without major issues.
          </Typography>
        </Box>
        <Box sx={{display: 'grid', gap: 1.4}}>
          {endMeetingGroups.map((group) => (
            <Box key={group.label}>
              <Typography sx={{fontSize: 14, color: '#202124', fontWeight: 400, mb: 0.25}}>
                <Box component="span" sx={{fontWeight: 900}}>{group.label.split(' ')[0]}</Box>
                {' '}
                {group.label.split(' ').slice(1).join(' ')}
              </Typography>
              <Box sx={{display: 'grid'}}>
                {group.rows.map((row) => (
                  <Box
                    key={row.text}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '4px minmax(0, 1fr)',
                      gap: 0.8,
                      alignItems: 'center',
                      borderTop: '1px solid #E0E0E0',
                      minHeight: 24,
                    }}
                  >
                    <Box sx={{width: 3, height: 16, borderRadius: 99, bgcolor: row.tone}} />
                    <Typography sx={{fontSize: 14, color: '#202124', lineHeight: 1.15}}>
                      {row.text}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
        <Typography sx={{fontSize: 14, color: '#202124', mt: 4.2}}>
          AI-generated meeting minutes shared with the leadership.
        </Typography>
      </DialogContent>
      <DialogActions sx={{px: 3.5, pb: 3, pt: 1}}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            height: 38,
            px: 2.8,
            borderRadius: '10px',
            borderColor: '#8CB4FF',
            color: '#0B63FF',
            fontSize: 14,
            fontWeight: 800,
            textTransform: 'uppercase',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={onEnd}
          variant="contained"
          startIcon={<StopIcon sx={{fontSize: 16}} />}
          sx={{
            height: 40,
            px: 3,
            borderRadius: '10px',
            bgcolor: '#FF3B30',
            boxShadow: 'none',
            fontSize: 14,
            fontWeight: 900,
            textTransform: 'uppercase',
            '&:hover': {bgcolor: '#E7352C', boxShadow: 'none'},
          }}
        >
          End Meeting
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function MeetingTopicCard({
  compact = false,
  topic,
}: {
  compact?: boolean;
  topic: MeetingTopicRow;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        minHeight: compact ? 78 : 60,
        px: compact ? 1.7 : 2,
        py: compact ? 1.25 : 1,
        borderRadius: '5px',
        border: '1px solid #FFD38A',
        bgcolor: '#FFF8E8',
        overflow: 'hidden',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: -1,
          right: -1,
          width: 16,
          height: 16,
          bgcolor: '#FFE6B7',
          borderLeft: '1px solid #FFD38A',
          borderBottom: '1px solid #FFD38A',
          clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
        },
      }}
    >
      <Typography sx={{fontSize: compact ? 14 : 14, color: '#202124', lineHeight: 1.25, pr: 1.2}}>
        {topic.text}
      </Typography>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mt: compact ? 1.1 : 0.75}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0}}>
          <Box
            sx={{
              width: 15,
              height: 15,
              borderRadius: '50%',
              bgcolor: topic.avatarBg,
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
              fontSize: 6,
              fontWeight: 900,
              flexShrink: 0,
            }}
          >
            {topic.initials}
          </Box>
          <Typography sx={{fontSize: 12, color: '#9A9A9A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            {topic.owner}
          </Typography>
        </Box>
        <Typography sx={{fontSize: 12, color: '#747474', flexShrink: 0}}>
          {'scheduledDate' in topic ? formatMeetingTopicDate(topic.scheduledDate) : 'Mar 18, 09:20'}
        </Typography>
      </Box>
    </Paper>
  );
}

function formatMeetingTopicDate(value: string) {
  const date = new Date(`${value}T09:20:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
}

function SuggestedList({
  icon,
  items,
  title,
}: {
  icon: 'topic' | 'action';
  items: string[];
  title: string;
}) {
  return (
    <Box>
      <Typography sx={{display: 'flex', alignItems: 'center', gap: 0.55, fontSize: 18, fontWeight: 900, color: '#202124', mb: 1}}>
        <AutoAwesomeIcon sx={{fontSize: 18, color: '#FF7A00'}} />
        <Box component="span" sx={{color: '#1976F3'}}>BLU.AI</Box>
        {title}
      </Typography>
      <Box sx={{display: 'grid'}}>
        {items.map((item) => (
          <Box
            key={item}
            sx={{
              display: 'grid',
              gridTemplateColumns: '26px minmax(0, 1fr)',
              alignItems: 'center',
              gap: 1,
              minHeight: 44,
              borderTop: '1px solid #E0E0E0',
            }}
          >
            {icon === 'topic' ? (
              <LightbulbOutlinedIcon sx={{fontSize: 22, color: '#5D9BFF'}} />
            ) : (
              <BuildIcon sx={{fontSize: 23, color: '#5D9BFF'}} />
            )}
            <Typography sx={{fontSize: 15, color: '#202124', lineHeight: 1.2}}>
              {item}
            </Typography>
          </Box>
        ))}
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 1}}>
        <Button sx={{minWidth: 0, p: 0, color: '#0B63FF', fontSize: 13, fontWeight: 900, textTransform: 'uppercase'}}>
          See More
        </Button>
      </Box>
    </Box>
  );
}

function LossFocusedChartCard({
  chartType,
  slide,
}: {
  chartType: LossFocusedChartType;
  slide: (typeof chartSlides)[number];
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: '9px 10px 7px 11px',
        borderRadius: '4px',
        border: '0',
        borderLeft: `5px solid ${tokenInfo.lightest}`,
        bgcolor: tokenNeutral.lightest,
      }}
    >
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1}}>
        <Box>
          <Typography sx={{fontSize: 30, lineHeight: 0.9, color: tokenSuccess.darkest, fontWeight: 400}}>
            {slide.minutes}
            <Box component="span" sx={{fontSize: 16, color: tokenNeutral.darkest, ml: 0.25, fontWeight: 400}}>Mins</Box>
          </Typography>
          <Typography sx={{fontSize: 13, color: workstationVisuals.tierTextHeading, mt: 0.35, fontWeight: 500, lineHeight: 1}}>
            {slide.label}
          </Typography>
        </Box>
        <Typography sx={{fontSize: 14, color: tokenBrand.light, fontWeight: 400, pt: 0.1}}>
          {slide.score}
        </Typography>
      </Box>
      <Box sx={{mt: 0.65}}>
        <MiniLossChart chartType={chartType} markerTones={slide.markerTones} values={slide.values} />
      </Box>
    </Paper>
  );
}

function TopLossesSection({chartId}: {chartId: LossKpiSlideId}) {
  const topLossRows = topLossRowsByChart[chartId];

  return (
    <Paper
      elevation={0}
      sx={{
        p: '11px 14px 9px',
        borderRadius: '12px',
        border: `1px solid ${tokenNeutral.dark}`,
        bgcolor: tokenNeutral.lightest,
      }}
    >
      <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading, fontWeight: 900, mb: 0.9, lineHeight: 1}}>
        Top Losses: {chartSlides.find((slide) => slide.id === chartId)?.label}
      </Typography>
      {topLossRows.map((loss) => (
        <Box key={loss} sx={{display: 'grid', gridTemplateColumns: '18px 1fr', alignItems: 'center', gap: 0.7, py: 0.75, borderBottom: `1px solid ${tokenNeutral.dark}`}}>
          <WarningIcon sx={{fontSize: 18, color: tokenWarning.dark}} />
          <Typography sx={{fontSize: 13.5, color: workstationVisuals.tierTextHeading, lineHeight: 1.05, fontWeight: 400}}>
            {loss}
          </Typography>
        </Box>
      ))}
      <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 0.8}}>
        <Button sx={{minWidth: 0, p: 0, color: tokenBrand.main, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.2}}>
          See More
        </Button>
      </Box>
    </Paper>
  );
}

function LossFocusedConfigPanel({
  hideTopLossesOption = false,
  onClose,
  onToggleChart,
  onToggleTopLosses,
  showTopLosses,
  visibleCharts,
}: {
  hideTopLossesOption?: boolean;
  onClose: () => void;
  onToggleChart: (chartId: LossKpiSlideId) => void;
  onToggleTopLosses: () => void;
  showTopLosses: boolean;
  visibleCharts: Record<LossKpiSlideId, boolean>;
}) {
  const selectedChartCount = Object.values(visibleCharts).filter(Boolean).length;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        top: 50,
        right: 14,
        zIndex: 4,
        width: 236,
        p: '10px',
        borderRadius: '10px',
        border: `1px solid ${tokenInfo.lightest}`,
        bgcolor: tokenCommon.white,
        boxShadow: '0 8px 24px rgba(15,23,42,0.14)',
      }}
    >
      <Typography sx={{fontSize: 13.5, color: workstationVisuals.tierTextHeading, fontWeight: 900, mb: 0.8, lineHeight: 1}}>
        KPI Library
      </Typography>
      <Typography sx={{fontSize: 11.3, color: workstationVisuals.textSecondary, mb: 0.7, lineHeight: 1.2}}>
        Select one KPI or create a carousel.
      </Typography>
      <Box sx={{display: 'grid', gap: 0.35}}>
        {chartSlides.map((slide) => {
          const checked = visibleCharts[slide.id];
          const disabled = checked && selectedChartCount === 1;
          return (
            <Button
              key={slide.id}
              onClick={() => onToggleChart(slide.id)}
              disabled={disabled}
              sx={{
                minWidth: 0,
                height: 32,
                px: 0.3,
                justifyContent: 'flex-start',
                borderRadius: 1.2,
                color: workstationVisuals.tierTextHeading,
                textTransform: 'none',
                fontSize: 13,
                fontWeight: 800,
                '&.Mui-disabled': {color: workstationVisuals.tierTextHeading, opacity: 0.75},
              }}
            >
              <Checkbox checked={checked} size="small" sx={{p: 0.35, mr: 0.45, color: tokenBrand.main, '&.Mui-checked': {color: tokenBrand.main}}} />
              {slide.label}
            </Button>
          );
        })}
        {!hideTopLossesOption ? (
          <Button
            onClick={onToggleTopLosses}
            sx={{
              minWidth: 0,
              height: 32,
              px: 0.3,
              justifyContent: 'flex-start',
              borderRadius: 1.2,
              color: workstationVisuals.tierTextHeading,
              textTransform: 'none',
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            <Checkbox checked={showTopLosses} size="small" sx={{p: 0.35, mr: 0.45, color: tokenBrand.main, '&.Mui-checked': {color: tokenBrand.main}}} />
            Top Losses
          </Button>
        ) : null}
      </Box>
      <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 0.8}}>
        <Button onClick={onClose} sx={{minWidth: 0, p: 0, color: tokenBrand.main, fontSize: 12.5, fontWeight: 900, textTransform: 'uppercase'}}>
          Done
        </Button>
      </Box>
    </Paper>
  );
}

function GembaWalkDeviationsWidget({
  latestDeviation,
  processDeviationCounts,
  onAdd,
  onOpen,
}: {
  latestDeviation: GembaDeviationRecord | null;
  processDeviationCounts: Record<string, number>;
  onAdd: () => void;
  onOpen: () => void;
}) {
  const topProcesses = Object.entries(processDeviationCounts)
    .sort(([, firstCount], [, secondCount]) => secondCount - firstCount)
    .slice(0, 3)
    .map(([process, count], index) => ({
      process,
      count,
      accent: ['#EF2118', '#FF8A00', '#FFD000'][index] ?? '#A8ABB0',
      trend: (index === 1 ? 'up' : 'down') as 'up' | 'down',
    }));

  return (
    <Paper
      elevation={0}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
      sx={{
        p: '10px 12px 11px',
        mb: 0.9,
        borderRadius: '10px',
        border: '1px solid #DDE3EA',
        bgcolor: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
        cursor: 'pointer',
        transition: 'border-color 0.16s ease, box-shadow 0.16s ease',
        '&:hover': {
          borderColor: '#8CB4FF',
          boxShadow: '0 6px 16px rgba(15,23,42,0.12)',
        },
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1}}>
        <Typography sx={{fontSize: 14, color: '#202124', fontWeight: 900, lineHeight: 1}}>
          Gemba Walks Deviations
        </Typography>
        <IconButton
          size="small"
          aria-label="Add Gemba Walk deviation"
          onClick={(event) => {
            event.stopPropagation();
            onAdd();
          }}
          sx={{
            width: 27,
            height: 27,
            border: '2px solid #0B63FF',
            color: '#0B63FF',
            bgcolor: '#FFFFFF',
            '&:hover': {bgcolor: '#EEF4FF'},
          }}
        >
          <AddIcon sx={{fontSize: 18, fontWeight: 900}} />
        </IconButton>
      </Box>
      <Typography sx={{fontSize: 11.5, color: '#667085', fontWeight: 750, mb: 0.9, lineHeight: 1.15}}>
        Top 3 processes with the most deviations
      </Typography>
      <Box sx={{display: 'grid', gap: 0.55}}>
        {topProcesses.map((process, index) => (
          <GembaProcessRankRow
            key={process.process}
            accent={process.accent}
            count={process.count}
            process={process.process}
            rank={index + 1}
            trend={process.trend}
          />
        ))}
      </Box>
      <Box sx={{borderTop: '1px solid #E5EAF0', mt: 0.85, pt: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 0}}>
          <ClockIcon sx={{fontSize: 15, color: '#0B63FF', flexShrink: 0}} />
          <Typography sx={{fontSize: 10.5, color: '#667085', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
            Last updated: {latestDeviation ? formatGembaLastUpdated(latestDeviation.date) : 'Mar 16, 2026 10:45 AM'}
          </Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.15, color: '#0B63FF', fontSize: 11, fontWeight: 900, whiteSpace: 'nowrap'}}>
          View all
          <ChevronRightIcon sx={{fontSize: 16}} />
        </Box>
      </Box>
    </Paper>
  );
}

function GembaProcessRankRow({
  accent,
  count,
  process,
  rank,
  trend,
}: {
  accent: string;
  count: number;
  process: string;
  rank: number;
  trend: 'up' | 'down';
}) {
  const isUp = trend === 'up';
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 38,
        p: '5px 7px 5px 9px',
        borderRadius: '7px',
        border: '1px solid #DFE5EC',
        borderLeft: `4px solid ${accent}`,
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
        display: 'grid',
        gridTemplateColumns: '28px minmax(0, 1fr) auto',
        alignItems: 'center',
        gap: 0.8,
      }}
    >
      <Box sx={{width: 24, height: 24, borderRadius: '6px', border: '1px solid #E1E6ED', display: 'grid', placeItems: 'center', color: '#111827', fontSize: 12, fontWeight: 900}}>
        {rank}
      </Box>
      <Typography sx={{fontSize: 12.2, color: '#111827', fontWeight: 850, lineHeight: 1.08, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
        {process}
      </Typography>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.25}}>
        <Typography sx={{fontSize: 19, color: '#111827', fontWeight: 500, lineHeight: 1}}>
          {count}
        </Typography>
        <Typography sx={{fontSize: 11, color: '#667085', fontWeight: 750, lineHeight: 1}}>
          dev.
        </Typography>
        {isUp ? (
          <ExpandLessIcon sx={{fontSize: 17, color: '#16A34A', ml: 0.25}} />
        ) : (
          <TrendDownIcon sx={{fontSize: 17, color: '#EF2118', ml: 0.25}} />
        )}
      </Box>
    </Paper>
  );
}

function AddGembaWalkDeviationDialog({
  onClose,
  onSave,
  open,
}: {
  onClose: () => void;
  onSave: (deviation: GembaDeviationRecord) => void;
  open: boolean;
}) {
  const [process, setProcess] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [deviationCount, setDeviationCount] = useState('');
  const [savedDeviation, setSavedDeviation] = useState<GembaDeviationRecord | null>(null);

  const canSave = Boolean(process && description.trim() && location && date && Number(deviationCount) > 0);

  const reset = () => {
    setProcess('');
    setDescription('');
    setLocation('');
    setDate('');
    setDeviationCount('');
    setSavedDeviation(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = () => {
    if (!canSave) return;
    const nextDeviation = {
      process,
      description: description.trim(),
      location,
      date,
      deviationCount: Number(deviationCount),
    };
    onSave(nextDeviation);
    setSavedDeviation(nextDeviation);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      BackdropProps={{sx: {backdropFilter: 'blur(3px)', bgcolor: 'rgba(15,23,42,0.46)'}}}
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: '0 24px 80px rgba(15,23,42,0.28)',
        },
      }}
    >
      {savedDeviation ? (
        <>
          <DialogContent sx={{px: 3.2, pt: 4.2, pb: 2.4, textAlign: 'center'}}>
            <Box sx={{width: 72, height: 72, mx: 'auto', borderRadius: '50%', border: '4px solid #38C35A', color: '#38C35A', display: 'grid', placeItems: 'center', mb: 2.4}}>
              <CheckCircleOutlineIcon sx={{fontSize: 46}} />
            </Box>
            <Typography sx={{fontSize: 20, fontWeight: 900, color: '#111827'}}>
              Deviation added successfully!
            </Typography>
            <Typography sx={{fontSize: 13, color: '#475467', mt: 1}}>
              The deviation has been recorded.
            </Typography>
            <Paper elevation={0} sx={{mt: 2.5, p: 1.8, border: '1px solid #E2E8F0', borderRadius: 1.4, textAlign: 'left'}}>
              {[
                ['Process', savedDeviation.process],
                ['Description', savedDeviation.description],
                ['Location', savedDeviation.location],
                ['Date', formatGembaDisplayDate(savedDeviation.date)],
                ['Number of Deviations', String(savedDeviation.deviationCount)],
              ].map(([label, value]) => (
                <Box key={label} sx={{display: 'flex', justifyContent: 'space-between', gap: 2, py: 0.8}}>
                  <Typography sx={{fontSize: 13, color: '#344054', fontWeight: 700}}>{label}</Typography>
                  <Typography sx={{fontSize: 13, color: '#111827', fontWeight: 800, textAlign: 'right'}}>{value}</Typography>
                </Box>
              ))}
            </Paper>
          </DialogContent>
          <DialogActions sx={{justifyContent: 'center', px: 3, pb: 3}}>
            <Button variant="contained" onClick={handleClose} sx={{minWidth: 112, height: 42, borderRadius: '6px', fontWeight: 900, textTransform: 'none', bgcolor: '#0B63E5'}}>
              Close
            </Button>
          </DialogActions>
        </>
      ) : (
        <>
          <DialogTitle sx={{px: 3, pt: 2.6, pb: 0.6}}>
            <Box sx={{display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: 2}}>
              <Box>
                <Typography sx={{fontSize: 20, fontWeight: 900, color: '#111827'}}>
                  Add Gemba Walk Deviation
                </Typography>
                <Typography sx={{fontSize: 12.5, color: '#475467', mt: 0.6}}>
                  Add a new deviation found during the Gemba Walk.
                </Typography>
              </Box>
              <IconButton size="small" onClick={handleClose} aria-label="Close Gemba deviation form">
                <CloseIcon sx={{fontSize: 18}} />
              </IconButton>
            </Box>
          </DialogTitle>
          <DialogContent sx={{px: 3, pt: 1.8, pb: 1}}>
            <Box sx={{display: 'grid', gap: 1.6}}>
              <GembaFormSelect
                label="Process"
                placeholder="Select a process"
                value={process}
                options={['Tier 1 Board', 'TMS 1 Short-term Interval Control', '5S', 'Quality Scale', 'Quality GMP', 'People']}
                onChange={setProcess}
              />
              <TextField
                label="Description"
                placeholder="Describe the deviation"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                InputLabelProps={{shrink: true}}
                required
                size="small"
                fullWidth
                multiline
                minRows={2}
                sx={gembaFieldSx}
              />
              <GembaFormSelect
                label="Location"
                placeholder="Select a location"
                value={location}
                options={['Pack Line 1', 'Pack Line 2', 'Assembly Line 3', 'Quality Lab', 'Warehouse Dock']}
                onChange={setLocation}
              />
              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                InputLabelProps={{shrink: true}}
                required
                size="small"
                fullWidth
                sx={gembaFieldSx}
              />
              <TextField
                label="Number of Deviations"
                placeholder="Enter number"
                type="number"
                value={deviationCount}
                onChange={(event) => setDeviationCount(event.target.value)}
                inputProps={{min: 1}}
                InputLabelProps={{shrink: true}}
                required
                size="small"
                fullWidth
                sx={gembaFieldSx}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{px: 3, pb: 3, pt: 1.1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.2}}>
            <Button variant="outlined" onClick={handleClose} sx={{height: 40, borderRadius: '6px', fontWeight: 900, textTransform: 'none'}}>
              Cancel
            </Button>
            <Button variant="contained" disabled={!canSave} onClick={handleSave} sx={{height: 40, borderRadius: '6px', fontWeight: 900, textTransform: 'none', bgcolor: '#0B63E5'}}>
              Save deviation
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

function GembaFormSelect({
  label,
  onChange,
  options,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  value: string;
}) {
  return (
    <TextField
      label={label}
      select
      required
      SelectProps={{native: true}}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      InputLabelProps={{shrink: true}}
      size="small"
      fullWidth
      sx={gembaFieldSx}
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>{option}</option>
      ))}
    </TextField>
  );
}

function formatGembaDisplayDate(value: string) {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
}

function formatGembaLastUpdated(value: string) {
  const date = new Date(`${value}T10:45:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function GembaWalkDrilldownDialog({
  activeTab,
  onClose,
  onTabChange,
  open,
}: {
  activeTab: 'deviations' | 'trends';
  onClose: () => void;
  onTabChange: (tab: 'deviations' | 'trends') => void;
  open: boolean;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      BackdropProps={{sx: {bgcolor: 'rgba(15,23,42,0.78)'}}}
      PaperProps={{
        sx: {
          width: 'min(1800px, calc(100vw - 120px))',
          height: 'min(715px, calc(100vh - 130px))',
          borderRadius: '8px',
          bgcolor: '#FFFFFF',
          boxShadow: '0 28px 80px rgba(15,23,42,0.38)',
        },
      }}
    >
      <DialogContent sx={{p: '20px 40px 40px', overflow: 'hidden', display: 'grid', gridTemplateRows: 'auto auto minmax(0, 1fr)'}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.4}}>
          <Typography sx={{fontSize: 20, fontWeight: 900, color: '#202124'}}>
            Gemba Walks Deviations
          </Typography>
          <IconButton onClick={onClose} aria-label="Close Gemba Walks Deviations" sx={{color: '#0B63FF'}}>
            <OpenInFullIcon sx={{fontSize: 21, transform: 'rotate(180deg)'}} />
          </IconButton>
        </Box>
        <Box sx={{borderBottom: '1px solid #D6D9DE', display: 'flex', gap: 3.5, mb: 2}}>
          <GembaTabButton active={activeTab === 'deviations'} label="DEVIATIONS" onClick={() => onTabChange('deviations')} />
          <GembaTabButton active={activeTab === 'trends'} label="TRENDS" onClick={() => onTabChange('trends')} />
        </Box>
        {activeTab === 'deviations' ? <GembaDeviationsView /> : <GembaTrendsView />}
      </DialogContent>
    </Dialog>
  );
}

function GembaTabButton({active, label, onClick}: {active: boolean; label: string; onClick: () => void}) {
  return (
    <Button
      onClick={onClick}
      sx={{
        minWidth: 138,
        height: 42,
        px: 0,
        borderRadius: 0,
        color: active ? '#202124' : '#A0A0A0',
        borderBottom: active ? '3px solid #246BFE' : '3px solid transparent',
        fontSize: 16,
        fontWeight: 900,
        textTransform: 'uppercase',
        '&:hover': {bgcolor: 'transparent', color: '#202124'},
      }}
    >
      {label}
    </Button>
  );
}

function GembaDeviationsView() {
  return (
    <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 220px', gap: 1.4}}>
      <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', gap: 1.2}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2}}>
          <Typography sx={{fontSize: 12.5, color: '#202124', lineHeight: 1.35}}>
            Overview of deviations identified during Gemba walks across Core Processes and Areas.
          </Typography>
          <Box sx={{display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0}}>
            {['Shift', 'Period'].map((label, index) => (
              <TextField
                key={label}
                label={label}
                select
                SelectProps={{native: true}}
                value={index === 0 ? 'All' : 'Today'}
                size="small"
                sx={{
                  width: index === 0 ? 116 : 126,
                  '& .MuiInputLabel-root': {bgcolor: '#FFFFFF', px: 0.45, color: '#475467', fontWeight: 800},
                  '& .MuiOutlinedInput-root': {height: 38, borderRadius: '6px', fontSize: 12, fontWeight: 800},
                }}
              >
                <option>{index === 0 ? 'All' : 'Today'}</option>
                <option>{index === 0 ? 'Shift A' : 'Yesterday'}</option>
                <option>{index === 0 ? 'Shift B' : 'Last 7 days'}</option>
              </TextField>
            ))}
            <Button variant="outlined" sx={{height: 38, borderRadius: '6px', px: 1.4, color: '#1D4ED8', fontWeight: 900, textTransform: 'none'}}>
              Export
            </Button>
          </Box>
        </Box>
        <GembaDeviationMatrix />
        <Box sx={{display: 'flex', alignItems: 'center', gap: 2.2, color: '#667085'}}>
          <GembaLegendItem color="#16A34A" label="Increase" symbol="up" />
          <GembaLegendItem color="#EF2118" label="Decrease" symbol="down" />
          <GembaLegendItem color="#64748B" label="No change" symbol="flat" />
          <Typography sx={{fontSize: 11, color: '#667085', ml: 1}}>
            * Comparison is made against the previous shift | Yesterday.
          </Typography>
        </Box>
      </Box>
      <GembaMatrixSidePanel />
    </Box>
  );
}

function GembaDeviationMatrix() {
  const areaKeys = ['zone1', 'zone2', 'zone3', 'packaging', 'warehouse', 'utilities', 'laboratory'] as const;
  const areas = ['Zone 1', 'Zone 2', 'Zone 3', 'Packaging', 'Warehouse', 'Utilities', 'Laboratory'];
  const rows = [
    {
      process: 'Centerline',
      sub: 'CL',
      owner: 'John Smith',
      avatar: 'JS',
      actions: ['2 open', '1 overdue'],
      values: {zone1: [3, 'up'], zone2: [1, 'down'], zone3: [0, 'flat'], packaging: [2, 'up'], warehouse: [0, 'flat'], utilities: [1, 'down'], laboratory: [0, 'flat']},
      total: [7, 'up'],
    },
    {
      process: 'Waste',
      sub: 'Waste Management',
      owner: 'Maria Rivas',
      avatar: 'MR',
      actions: ['1 open', '0 overdue'],
      values: {zone1: [2, 'up'], zone2: [0, 'flat'], zone3: [1, 'down'], packaging: [0, 'flat'], warehouse: [2, 'up'], utilities: [0, 'flat'], laboratory: [0, 'flat']},
      total: [5, 'up'],
    },
    {
      process: 'BBS',
      sub: 'Behavior Based Safety',
      owner: 'Alex Johnson',
      avatar: 'AJ',
      actions: ['0 open', '0 overdue'],
      values: {zone1: [1, 'down'], zone2: [1, 'down'], zone3: [0, 'flat'], packaging: [1, 'up'], warehouse: [0, 'flat'], utilities: [0, 'flat'], laboratory: [0, 'flat']},
      total: [3, 'flat'],
    },
    {
      process: 'Break Down',
      sub: 'Equipment Reliability',
      owner: 'David Lee',
      avatar: 'DL',
      actions: ['3 open', '1 overdue'],
      values: {zone1: [4, 'up'], zone2: [2, 'up'], zone3: [1, 'up'], packaging: [0, 'flat'], warehouse: [1, 'up'], utilities: [2, 'up'], laboratory: [0, 'flat']},
      total: [10, 'up'],
    },
  ] as const;
  const totals = {zone1: [10, 'up'], zone2: [4, 'up'], zone3: [2, 'up'], packaging: [3, 'up'], warehouse: [3, 'up'], utilities: [3, 'up'], laboratory: [0, 'flat']} as const;

  return (
    <Paper elevation={0} sx={{border: '1px solid #D8DDE3', borderRadius: '6px', overflow: 'hidden', minHeight: 0}}>
      <Box sx={{display: 'grid', gridTemplateColumns: '150px 158px 154px repeat(7, 1fr) 120px', bgcolor: '#F8FAFC', borderBottom: '1px solid #D8DDE3'}}>
        <GembaHeaderCell label="Core Process" />
        <GembaHeaderCell label="Owner" />
        <GembaHeaderCell label="Actions" />
        <Box sx={{gridColumn: 'span 7', py: 0.8, textAlign: 'left', borderLeft: '1px solid #D8DDE3', borderBottom: '1px solid #D8DDE3'}}>
          <Typography sx={{fontSize: 12, fontWeight: 900, color: '#202124', px: 1}}>Areas</Typography>
        </Box>
        <GembaHeaderCell label="Total Deviations" />
        <Box />
        <Box />
        <Box />
        {areas.map((area) => <GembaHeaderCell key={area} label={area} compact />)}
        <Box />
      </Box>
      {rows.map((row) => (
        <Box key={row.process} sx={{display: 'grid', gridTemplateColumns: '150px 158px 154px repeat(7, 1fr) 120px', minHeight: 98, borderBottom: '1px solid #E4E8EE'}}>
          <GembaProcessCell title={row.process} subtitle={row.sub} />
          <GembaOwnerCell avatar={row.avatar} name={row.owner} />
          <GembaActionCell rows={row.actions} />
          {areaKeys.map((areaKey) => {
            const [value, trend] = row.values[areaKey];
            return <GembaMetricCell key={areaKey} value={value} trend={trend} />;
          })}
          <GembaMetricCell value={row.total[0]} trend={row.total[1]} total />
        </Box>
      ))}
      <Box sx={{display: 'grid', gridTemplateColumns: '308px 154px repeat(7, 1fr) 120px', minHeight: 74, bgcolor: '#FCFCFD'}}>
        <Box sx={{p: 1.2, borderRight: '1px solid #E4E8EE'}}>
          <Typography sx={{fontSize: 13, fontWeight: 900, color: '#202124'}}>Total Deviations</Typography>
          <Typography sx={{fontSize: 11.5, color: '#475467'}}>vs yesterday</Typography>
        </Box>
        <GembaActionCell rows={['6 open', '2 overdue']} />
        {areaKeys.map((areaKey) => {
          const [value, trend] = totals[areaKey];
          return <GembaMetricCell key={areaKey} value={value} trend={trend} totalRow />;
        })}
        <GembaMetricCell value={25} trend="up" total totalRow />
      </Box>
    </Paper>
  );
}

function GembaHeaderCell({compact = false, label}: {compact?: boolean; label: string}) {
  return (
    <Box sx={{p: compact ? 0.9 : 1.25, borderRight: '1px solid #D8DDE3', display: 'grid', placeItems: compact ? 'center' : 'start'}}>
      <Typography sx={{fontSize: compact ? 11 : 12, fontWeight: 900, color: '#202124', textAlign: compact ? 'center' : 'left'}}>
        {label}
      </Typography>
    </Box>
  );
}

function GembaProcessCell({subtitle, title}: {subtitle: string; title: string}) {
  return (
    <Box sx={{p: 1.2, borderRight: '1px solid #E4E8EE', display: 'grid', alignContent: 'center'}}>
      <Typography sx={{fontSize: 14, fontWeight: 900, color: '#202124'}}>{title}</Typography>
      <Typography sx={{fontSize: 12, color: '#344054', mt: 0.3}}>{subtitle}</Typography>
    </Box>
  );
}

function GembaOwnerCell({avatar, name}: {avatar: string; name: string}) {
  return (
    <Box sx={{p: 1.1, borderRight: '1px solid #E4E8EE', display: 'flex', alignItems: 'center', gap: 0.85}}>
      <Box sx={{width: 32, height: 32, borderRadius: '50%', bgcolor: '#1D4ED8', color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 900}}>
        {avatar}
      </Box>
      <Box>
        <Typography sx={{fontSize: 12.2, fontWeight: 850, color: '#202124'}}>{name}</Typography>
        <Typography sx={{fontSize: 10.5, color: '#475467'}}>Process Owner</Typography>
      </Box>
    </Box>
  );
}

function GembaActionCell({rows}: {rows: readonly string[]}) {
  return (
    <Box sx={{p: 1.1, borderRight: '1px solid #E4E8EE', display: 'grid', alignContent: 'center', gap: 0.45}}>
      {rows.map((row, index) => (
        <Box key={row} sx={{display: 'flex', alignItems: 'center', gap: 0.6}}>
          <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: index === 0 ? '#1D6BFF' : '#EF2118'}} />
          <Typography sx={{fontSize: 11.5, color: '#202124', fontWeight: 750}}>{row}</Typography>
        </Box>
      ))}
      {rows.length < 3 ? (
        <Typography sx={{fontSize: 11.5, color: '#0B63FF', fontWeight: 900, mt: 0.3}}>View actions ›</Typography>
      ) : null}
    </Box>
  );
}

function GembaMetricCell({total = false, totalRow = false, trend, value}: {total?: boolean; totalRow?: boolean; trend: string; value: number}) {
  const isZero = value === 0;
  const isUp = trend === 'up';
  const color = isZero ? '#64748B' : isUp ? '#FF3B00' : '#16A34A';
  return (
    <Box sx={{p: 0.9, borderRight: '1px solid #E4E8EE', display: 'grid', placeItems: 'center', minWidth: 0}}>
      <Typography sx={{fontSize: total || totalRow ? 22 : 20, fontWeight: 900, color, lineHeight: 1}}>
        {value}
      </Typography>
      <Box sx={{width: 42, height: 16, mt: 0.35}}>
        {isZero ? <Typography sx={{fontSize: 13, color: '#94A3B8', textAlign: 'center'}}>_</Typography> : <GembaTinySparkline color={color} />}
      </Box>
      <Typography sx={{fontSize: 10.2, color, fontWeight: 850, mt: 0.25, whiteSpace: 'nowrap'}}>
        {isZero ? '—' : `${isUp ? '↑' : '↓'} ${total ? (isUp ? '3' : '1') : '1'} vs yesterday`}
      </Typography>
    </Box>
  );
}

function GembaTinySparkline({color}: {color: string}) {
  return (
    <svg width="42" height="16" viewBox="0 0 42 16" aria-hidden="true">
      <path d="M1 11 L7 8 L13 10 L19 4 L25 7 L31 3 L41 6" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GembaLegendItem({color, label, symbol}: {color: string; label: string; symbol: 'up' | 'down' | 'flat'}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55}}>
      <Typography sx={{fontSize: 15, color, fontWeight: 900}}>{symbol === 'up' ? '↑' : symbol === 'down' ? '↓' : '—'}</Typography>
      <Typography sx={{fontSize: 11.5, color: '#667085', fontWeight: 750}}>{label}</Typography>
    </Box>
  );
}

function GembaMatrixSidePanel() {
  return (
    <Box sx={{display: 'grid', gridTemplateRows: 'auto auto minmax(0, 1fr)', gap: 1, minHeight: 0}}>
      <Paper elevation={0} sx={{p: 1.2, borderRadius: '8px', border: '1px solid #D8DDE3', bgcolor: '#FFFFFF'}}>
        <Typography sx={{fontSize: 13, fontWeight: 900, color: '#202124', mb: 1}}>Insights Summary</Typography>
        {['25 total deviations', 'Break Down is the top contributor (10)', 'Zone 1 has the highest number of deviations (10)'].map((line, index) => (
          <Typography key={line} sx={{fontSize: 11.3, color: '#202124', lineHeight: 1.3, mb: 0.8}}>
            • {line}{index === 0 ? <Box component="span" sx={{display: 'block', color: '#EF2118', fontWeight: 900, ml: 1.2}}>↑ 6 vs yesterday</Box> : null}
          </Typography>
        ))}
      </Paper>
      <Paper elevation={0} sx={{p: 1.2, borderRadius: '8px', border: '1px solid #D8DDE3', bgcolor: '#FFFFFF'}}>
        <Typography sx={{fontSize: 13, fontWeight: 900, color: '#202124', mb: 1}}>Top Processes by Deviations</Typography>
        {[
          ['Break Down', 10, '#EF2118'],
          ['Centerline', 7, '#FF3B00'],
          ['Waste', 5, '#FF8A00'],
          ['BBS', 3, '#16A34A'],
        ].map(([name, value, color], index) => (
          <Box key={String(name)} sx={{display: 'grid', gridTemplateColumns: '22px minmax(0, 1fr) 34px', alignItems: 'center', gap: 0.5, mb: 0.65}}>
            <Box sx={{width: 18, height: 18, borderRadius: '50%', bgcolor: `${color}18`, color, display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 900}}>{index + 1}</Box>
            <Typography sx={{fontSize: 11.5, color, fontWeight: 900, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis'}}>{name}</Typography>
            <Box sx={{height: 23, borderRadius: '5px', border: `1px solid ${color}`, color, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 900}}>{value}</Box>
          </Box>
        ))}
      </Paper>
      <Paper elevation={0} sx={{p: 1.2, borderRadius: '8px', border: '1px solid #D8DDE3', bgcolor: '#FFFFFF'}}>
        <Typography sx={{fontSize: 13, fontWeight: 900, color: '#202124', mb: 1}}>Filters</Typography>
        {['Core Process', 'Area', 'Owner'].map((label) => (
          <TextField
            key={label}
            label={label}
            select
            SelectProps={{native: true}}
            value="All"
            size="small"
            fullWidth
            sx={{mb: 1, '& .MuiInputLabel-root': {bgcolor: '#FFFFFF', px: 0.45}, '& .MuiOutlinedInput-root': {height: 36, borderRadius: '6px', fontSize: 12, fontWeight: 800}}}
          >
            <option>All</option>
          </TextField>
        ))}
        <Button fullWidth variant="outlined" sx={{height: 34, borderRadius: '6px', color: '#0B63FF', fontWeight: 900, textTransform: 'none'}}>
          Clear filters
        </Button>
      </Paper>
    </Box>
  );
}

function GembaDeviationCard({
  date,
  status,
  text,
  tone,
}: {
  date: string;
  status: string;
  text: string;
  tone: 'green' | 'green-check' | 'orange';
}) {
  const isGreen = tone === 'green' || tone === 'green-check';
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 82,
        p: '10px 12px',
        borderRadius: '5px',
        border: '1px solid #D8DDE3',
        bgcolor: '#FFFFFF',
        boxShadow: '0 1px 2px rgba(15,23,42,0.12)',
        display: 'grid',
        gridTemplateColumns: '22px minmax(0, 1fr)',
        gap: 0.9,
        alignItems: 'center',
      }}
    >
      {tone === 'green-check' ? (
        <CheckCircleOutlineIcon sx={{fontSize: 22, color: '#4CAF50'}} />
      ) : (
        <WarningIcon sx={{fontSize: 22, color: isGreen ? '#4CAF50' : '#FF8A00'}} />
      )}
      <Box sx={{minWidth: 0}}>
        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
          <Typography sx={{fontSize: 12, color: '#747474', lineHeight: 1}}>
            {date}
          </Typography>
          <Typography sx={{fontSize: 14, color: isGreen ? '#4CAF50' : '#555555', lineHeight: 1}}>
            {status}
          </Typography>
        </Box>
        <Typography sx={{fontSize: 14, color: '#202124', lineHeight: 1.14, mt: 0.45}}>
          {text}
        </Typography>
      </Box>
    </Paper>
  );
}

function GembaSidePanel({includeInsights = true}: {includeInsights?: boolean}) {
  return (
    <Box sx={{display: 'grid', gridTemplateRows: includeInsights ? '278px minmax(0, 1fr)' : '278px', gap: 1.2, minHeight: 0}}>
      <Paper elevation={0} sx={{p: '17px 18px', borderRadius: '8px', border: '1px solid #D8DDE3', bgcolor: '#F4F7F8'}}>
        <Typography sx={{fontSize: 16, fontWeight: 900, color: '#202124', mb: 1.1}}>
          Comments
        </Typography>
        <GembaComment text="Please invite me to the next visit to line 3" owner="John Smith" time="Mar 18, 11:41" />
        <GembaComment text="Done" owner="Maria Pinna" time="Mar 18, 09:20" />
        <Box sx={{mt: 3.2, height: 40, borderRadius: '10px', border: '1px solid #3F5EA8', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.4}}>
          <Typography sx={{fontSize: 16, color: '#3F5EA8'}}>Leave a Comment</Typography>
          <Box sx={{width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: '22px solid #1E63FF'}} />
        </Box>
      </Paper>
      {includeInsights ? (
        <Paper elevation={0} sx={{p: '16px 18px', borderRadius: '8px', border: '1px solid #D8DDE3', bgcolor: '#F4F7F8', minHeight: 0}}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.3}}>
            <Typography sx={{fontSize: 16, color: '#0B63FF', fontWeight: 900}}>
              <AutoAwesomeIcon sx={{fontSize: 18, color: '#FF8A00', verticalAlign: 'text-bottom', mr: 0.5}} />
              BLU.AI INSIGHTS
            </Typography>
            <OpenInFullIcon sx={{fontSize: 18, color: '#0B63FF'}} />
          </Box>
          <GembaInsight title="Critical Bottleneck" text="Zone 5A is operating at 78.3 PPM (35% below Target). This is triggering a ..." />
          <GembaInsight title="Downtime Risk" text="Based on current trend, Line 8 has a high probability of unplanned stop before end o..." />
        </Paper>
      ) : null}
    </Box>
  );
}

function GembaComment({owner, text, time}: {owner: string; text: string; time: string}) {
  return (
    <Paper elevation={0} sx={{p: '10px 13px', mb: 1, borderRadius: '10px', border: '1px solid #D2D7DE', bgcolor: '#E9EEF1'}}>
      <Typography sx={{fontSize: 14, color: '#202124', lineHeight: 1.18, mb: 1.1}}>
        {text}
      </Typography>
      <Box sx={{display: 'flex', justifyContent: 'space-between', gap: 1}}>
        <Typography sx={{fontSize: 12, color: '#8B8F94'}}>{owner}</Typography>
        <Typography sx={{fontSize: 12, color: '#8B8F94'}}>{time}</Typography>
      </Box>
    </Paper>
  );
}

function GembaInsight({title, text}: {title: string; text: string}) {
  return (
    <Paper elevation={0} sx={{p: '11px 13px', mb: 1, borderRadius: '10px', border: '1px solid #D2D7DE', bgcolor: '#E9EEF1'}}>
      <Typography sx={{fontSize: 16, color: '#202124', fontWeight: 900, lineHeight: 1.1}}>
        <WarningIcon sx={{fontSize: 16, color: '#FF4438', verticalAlign: 'text-bottom', mr: 0.5}} />
        {title}
      </Typography>
      <Typography sx={{fontSize: 12, color: '#202124', lineHeight: 1.12, mt: 0.55}}>
        {text}
      </Typography>
    </Paper>
  );
}

function GembaTrendsView() {
  return (
    <Box sx={{minHeight: 0, display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 278px', gap: 1.2}}>
      <Box sx={{minHeight: 0, display: 'grid', gridTemplateRows: '72px minmax(0, 1fr)', gap: 1.2}}>
        <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1}}>
          <GembaTrendMetric value="49" label="YTD Deviations" accent="#A8ABB0" />
          <GembaTrendMetric value="4" label="MTD Deviations" accent="#A8ABB0" />
          <GembaTrendMetric value="2.8" label="Monthly Average" accent="#A8ABB0" />
          <GembaTrendMetric value="94" suffix="%" label="Resolution Efficiency" accent="#38C35A" target="90%" />
        </Box>
        <Paper elevation={0} sx={{p: '14px 20px 12px', borderRadius: '4px', bgcolor: '#EEF3F6', border: 0, minHeight: 0, overflow: 'hidden', display: 'grid', gridTemplateRows: '30px minmax(0, 1fr)'}}>
          <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 0.8, mb: 0.8}}>
            {['All', 'Safety', 'Quality', 'Delivery', 'Cost', 'People'].map((filter, index) => (
              <Button
                key={filter}
                sx={{
                  minWidth: 0,
                  height: 25,
                  px: 1.25,
                  borderRadius: 999,
                  border: '1px solid #5B8CFF',
                  bgcolor: index === 0 ? '#5B8CFF' : '#FFFFFF',
                  color: index === 0 ? '#FFFFFF' : '#246BFE',
                  fontSize: 12,
                  textTransform: 'none',
                }}
              >
                {filter}
              </Button>
            ))}
          </Box>
          <GembaStackedBarChart />
        </Paper>
      </Box>
      <GembaSidePanel includeInsights />
    </Box>
  );
}

function GembaTrendMetric({accent, label, suffix, target, value}: {accent: string; label: string; suffix?: string; target?: string; value: string}) {
  return (
    <Paper elevation={0} sx={{p: '10px 14px', borderRadius: '5px', border: '1px solid #D8DDE3', borderLeft: `6px solid ${accent}`, bgcolor: '#EEF3F6', boxShadow: '0 1px 4px rgba(15,23,42,0.12)', position: 'relative'}}>
      <Typography sx={{fontSize: 32, color: '#202124', lineHeight: 0.9, fontWeight: 400}}>
        {value}
        {suffix ? <Box component="span" sx={{fontSize: 14, ml: 0.4}}>{suffix}</Box> : null}
      </Typography>
      <Typography sx={{fontSize: 12, color: '#202124', mt: 0.35}}>
        {label}
      </Typography>
      {target ? (
        <Box sx={{position: 'absolute', right: 10, top: 17, display: 'grid', justifyItems: 'center', gap: 0.25}}>
          <Typography sx={{fontSize: 9, color: '#6B7280', fontWeight: 900}}>TARGET</Typography>
          <Box sx={{width: 27, height: 20, borderRadius: 999, bgcolor: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 9, fontWeight: 900}}>
            {target}
          </Box>
        </Box>
      ) : null}
    </Paper>
  );
}

function GembaStackedBarChart() {
  const maxTotal = 300;
  const chartHeight = 318;
  const barWidth = 30;
  const gap = 61;
  return (
    <Box sx={{height: '100%', minHeight: 0}}>
      <svg width="100%" height="100%" viewBox="0 0 1260 430" preserveAspectRatio="none" role="img" aria-label="Gemba walk deviations stacked bar trend">
        {[0, 50, 100, 150, 200, 250, 300].map((tick) => {
          const y = chartHeight - (tick / maxTotal) * 285 + 18;
          return <text key={tick} x="0" y={y + 4} fontSize="12" fill="#202124">{tick}</text>;
        })}
        {gembaTrendMonths.map((month, monthIndex) => {
          const x = 72 + monthIndex * (barWidth + gap);
          let yCursor = chartHeight + 18;
          return (
            <g key={month}>
              {gembaTrendSeries.map((series) => {
                const value = series.values[monthIndex];
                const height = (value / maxTotal) * 285;
                yCursor -= height;
                return <rect key={series.label} x={x} y={yCursor} width={barWidth} height={height} fill={series.color} />;
              })}
              <text x={x + barWidth / 2} y="374" textAnchor="middle" fontSize="12" fill="#202124">{month}</text>
            </g>
          );
        })}
        {gembaTrendSeries.map((series, index) => (
          <g key={series.label}>
            <circle cx={455 + index * 78} cy="405" r="4" fill={series.color} />
            <text x={465 + index * 78} y="409" fontSize="12" fill="#202124">{series.label}</text>
          </g>
        ))}
      </svg>
    </Box>
  );
}

function RecognitionSection() {
  const visibleRecognitionRows = recognitionRows.slice(0, 1);

  return (
    <Paper
      elevation={0}
      sx={{
        p: '9px 12px 7px',
        borderRadius: '12px',
        border: `1px solid ${tokenNeutral.dark}`,
        bgcolor: tokenNeutral.lightest,
      }}
    >
      <SectionHeader title="Recognition" label="Add recognition" />
      <Box sx={{display: 'grid', gap: 0.55, mt: 0.65}}>
        {visibleRecognitionRows.map((item) => {
          const Icon = item.icon === 'trophy' ? TrophyIcon : StarIcon;
          return (
            <Paper
              key={item.id}
              elevation={0}
              sx={{
                minHeight: 44,
                px: 1,
                py: 0.65,
                borderRadius: '10px',
                border: `1px solid ${tokenNeutral.dark}`,
                bgcolor: tokenNeutral.lightest,
                display: 'grid',
                gridTemplateColumns: '22px minmax(0, 1fr)',
                alignItems: 'center',
                gap: 0.65,
              }}
            >
              <Icon sx={{fontSize: 20, color: tokenWarning.light}} />
              <Box sx={{minWidth: 0}}>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, minWidth: 0}}>
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      bgcolor: item.avatarBg,
                      color: tokenCommon.white,
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 7,
                      fontWeight: 900,
                      flexShrink: 0,
                    }}
                  >
                    {item.initials}
                  </Box>
                  <Typography sx={{fontSize: 12, color: workstationVisuals.tierTextMeta, lineHeight: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                    {item.name}
                  </Typography>
                </Box>
                <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading, lineHeight: 1.05, fontWeight: 400, mt: 0.25}}>
                  {item.message}
                </Typography>
              </Box>
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );
}

function CommunicationSection() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: '9px 12px 7px',
        borderRadius: '12px',
        border: `1px solid ${tokenNeutral.dark}`,
        bgcolor: tokenNeutral.lightest,
      }}
    >
      <SectionHeader title="Communication" label="Add communication" />
      <Box sx={{display: 'grid', gap: 0.55, mt: 0.65}}>
        {communicationRows.map((item) => (
          <Paper
            key={item.id}
            elevation={0}
            sx={{
              minHeight: 42,
              px: 1,
              py: 0.65,
              borderRadius: '10px',
              border: `1px solid ${tokenNeutral.dark}`,
              bgcolor: tokenNeutral.lightest,
              display: 'grid',
              gridTemplateColumns: '24px minmax(0, 1fr)',
              alignItems: 'center',
              gap: 0.6,
            }}
          >
            <CampaignIcon sx={{fontSize: 21, color: tokenNeutral.darker}} />
            <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading, lineHeight: 1.08, fontWeight: 400}}>
              {item.message}
            </Typography>
          </Paper>
        ))}
      </Box>
      <SeeMoreButton />
    </Paper>
  );
}

function SectionHeader({title, label}: {title: string; label: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
      <Typography sx={{fontSize: 14, color: workstationVisuals.tierTextHeading, fontWeight: 900, lineHeight: 1}}>
        {title}
      </Typography>
      <IconButton aria-label={label} size="small" sx={{width: 20, height: 20, color: tokenBrand.main, bgcolor: 'transparent'}}>
        <AddIcon sx={{fontSize: 22}} />
      </IconButton>
    </Box>
  );
}

function SeeMoreButton() {
  return (
    <Box sx={{display: 'flex', justifyContent: 'flex-end', mt: 0.9}}>
      <Button sx={{minWidth: 0, p: 0, color: tokenBrand.main, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', lineHeight: 1.2}}>
        See More
      </Button>
    </Box>
  );
}

function CarouselDots({
  activeIndex,
  count,
  onSelect,
  variant = 'dots',
}: {
  activeIndex: number;
  count: number;
  onSelect: (index: number) => void;
  variant?: 'dots' | 'pause-dots';
}) {
  if (variant === 'pause-dots') {
    return (
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', mt: 0.45}}>
        <Box
          component="button"
          onClick={() => onSelect(0)}
          aria-label="Show recognition"
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            p: 0,
            border: 0,
            bgcolor: 'transparent',
            cursor: 'pointer',
          }}
        >
          <Box sx={{width: 3, height: 8, borderRadius: 999, bgcolor: tokenBrand.main}} />
          <Box sx={{width: 3, height: 8, borderRadius: 999, bgcolor: tokenBrand.main}} />
        </Box>
        {Array.from({length: count}).map((_, index) => (
          <Box
            key={index}
            component="button"
            onClick={() => onSelect(index)}
            aria-label={`Show message slide ${index + 1}`}
            sx={{
              width: 6,
              height: 6,
              p: 0,
              border: 0,
              borderRadius: 999,
              bgcolor: activeIndex === index ? tokenBrand.lightest : tokenInfo.lightest,
              cursor: 'pointer',
            }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.35, mt: 0.45}}>
      {Array.from({length: count}).map((_, index) => (
        <Box
          key={index}
          component="button"
          onClick={() => onSelect(index)}
          aria-label={`Show slide ${index + 1}`}
          sx={{
            width: activeIndex === index ? 4 : 6,
            height: activeIndex === index ? 12 : 6,
            p: 0,
            border: 0,
            borderRadius: 999,
            bgcolor: activeIndex === index ? tokenBrand.main : tokenInfo.lightest,
            cursor: 'pointer',
          }}
        />
      ))}
    </Box>
  );
}

function MiniLossChart({
  chartType,
  markerTones,
  values,
}: {
  chartType: LossFocusedChartType;
  markerTones: Array<'good' | 'bad'>;
  values: number[];
}) {
  const labels = ['00', '03', '06', '09', '12', '03', '06', '09', '00'];
  const width = 300;
  const height = 112;
  const left = 12;
  const top = 8;
  const innerWidth = width - 24;
  const innerHeight = 72;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const points = values.map((value, index) => {
    const x = left + (index / Math.max(values.length - 1, 1)) * innerWidth;
    const y = top + innerHeight - ((value - min) / range) * innerHeight;
    return {x, y, tone: markerTones[index] ?? 'good'};
  });
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={112} aria-hidden="true">
      <rect x={left} y={top} width={innerWidth} height={innerHeight} fill={tokenNeutral.lighter} stroke="transparent" />
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <line
          key={`h-${ratio}`}
          x1={left}
          x2={left + innerWidth}
          y1={top + innerHeight * ratio}
          y2={top + innerHeight * ratio}
          stroke={tokenNeutral.main}
          strokeWidth="1"
        />
      ))}
      {labels.map((_, index) => {
        const x = left + (index / Math.max(labels.length - 1, 1)) * innerWidth;
        return (
          <line
            key={`v-${index}`}
            x1={x}
            x2={x}
            y1={top}
            y2={top + innerHeight}
            stroke={tokenNeutral.main}
            strokeWidth="1"
          />
        );
      })}
      <line
        x1={left}
        x2={left + innerWidth}
        y1={top + innerHeight * 0.57}
        y2={top + innerHeight * 0.57}
        stroke={tokenBrand.lighter}
        strokeWidth="1.3"
        strokeDasharray="3 3"
      />
      {chartType === 'bars' ? points.map((point, index) => {
        const barWidth = 18;
        return (
          <rect
            key={`bar-${index}`}
            x={point.x - barWidth / 2}
            y={point.y}
            width={barWidth}
            height={top + innerHeight - point.y}
            rx="2"
            fill={point.tone === 'bad' ? tokenError.main : tokenSuccess.darkest}
          />
        );
      }) : points.slice(1).map((point, index) => {
        const previousPoint = points[index];
        const segmentTone = point.tone === 'bad' || previousPoint.tone === 'bad' ? tokenError.main : tokenSuccess.darkest;
        return (
          <line
            key={`segment-${index}`}
            x1={previousPoint.x}
            y1={previousPoint.y}
            x2={point.x}
            y2={point.y}
            stroke={segmentTone}
            strokeWidth="4.2"
            strokeLinecap="round"
          />
        );
      })}
      {points.map((point, index) => (
        <circle
          key={`dot-${index}`}
          cx={point.x}
          cy={point.y}
          r="4"
          fill={tokenNeutral.lighter}
          stroke={point.tone === 'bad' ? tokenError.main : tokenSuccess.darkest}
          strokeWidth="3"
        />
      ))}
      {labels.map((label, index) => {
        const x = left + (index / Math.max(labels.length - 1, 1)) * innerWidth;
        return (
          <text key={`${label}-${index}`} x={x} y={height - 12} textAnchor="middle" fontSize="12" fill={workstationVisuals.textMuted}>
            {label}
          </text>
        );
      })}
    </svg>
  );
}
