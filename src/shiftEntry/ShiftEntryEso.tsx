import {useState, useEffect} from 'react';
import type {ReactNode} from 'react';
import {Box, Button, Checkbox, Dialog, FormControl, IconButton, List, ListItemButton, ListItemIcon, ListItemText, MenuItem, Paper, Select, Slider, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography} from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome as AutoAwesomeIcon,
  ArrowBack as ExplorerBackIcon,
  ArrowUpward as ArrowUpwardIcon,
  Autorenew as HousekeepingIcon,
  CalendarMonth as CalendarIcon,
  Campaign as SpeakUpIcon,
  Check as CheckIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteIcon,
  Description as DescriptionIcon,
  DirectionsWalk as WalkIcon,
  EditOutlined as EditOutlinedIcon,
  ErrorOutline as ErrorIcon,
  PhotoCamera as CameraIcon,
  Folder as FolderIcon,
  UploadFile as UploadFileIcon,
  Flag as FlagIcon,
  FitnessCenter as ErgonomicsIcon,
  KeyboardArrowRight as ArrowRightIcon,
  KeyboardArrowLeft as ArrowLeftIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Lock as LockIcon,
  LocalOffer as TagIcon,
  MicNone as MicIcon,
  RemoveCircle as RemoveCircleIcon,
  RadioButtonChecked as NearMissIcon,
  QrCodeScanner as ScannerIcon,
  Search as SearchIcon,
  Shield as ShieldIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
  AccessibilityNew as BodyPositionIcon,
  Build as ToolsIcon,
  Commute as MobileEquipmentIcon,
  Groups as PpeIcon,
  DeleteOutlineOutlined as ScrapIcon,
  InfoOutlined as InfoIcon,
  Science as ChemicalHandlingIcon,
  VerticalAlignTop as FallProtectionIcon,
  WaterDrop as EnvironmentalIcon,
} from '@mui/icons-material';

// Types and constants
export type ShiftEntryEsoSavedPayload = {
  createdAt: string;
  esoType: 'BBS' | 'Condition Report' | 'Near Miss';
  line: 'Line 1' | 'Line 2' | 'Line 3' | 'Line 4';
  recordId: string;
  reporter: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  shift: 'Morning' | 'Night';
  summary: string;
  title: string;
  zone: 'Zone 1' | 'Zone 2' | 'Zone 3' | 'Zone 4';
};

type AssistantStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type BbsStep = 1 | 2 | 3 | 4 | 'ppe' | 'confirmation';
type BbsDescriptionState = 'empty' | 'typing' | 'filled';
type ConditionView = 'form' | 'cameraIntro' | 'cameraScan' | 'categories' | 'status' | 'review' | 'confirmation';
type ConditionDescriptionState = 'empty' | 'typing' | 'filled';
type ConditionClassification = 'Safe Condition' | 'Unsafe Condition' | null;
type NearMissView = 'form' | 'cameraIntro' | 'cameraScan' | 'categories' | 'status' | 'review' | 'confirmation';
type NearMissDescriptionState = 'empty' | 'typing' | 'filled';

const buildCurrentTimeLabel = () => new Intl.DateTimeFormat('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
}).format(new Date());

const defaultBbsCommitmentText = `I agree to always check the positioning of my hands before engaging the press brake and will report any guard malfunctions immediately.`;
const defaultResolutionCategory = 'Contractors / Visitors';
const defaultResolutionRecommendation = `Immediately secure the affected area using appropriate barriers and clearly visible warning signage to prevent access.

Perform a thorough inspection to identify any slip or trip hazards, and address the root cause (e.g., damaged flooring, inadequate drainage, spills, or poor housekeeping conditions).

Implement corrective actions promptly and verify that the area is safe before reopening.

Follow up with the team lead to ensure all actions are completed, documented, and validated within 24 hours.`;

const defaultRecommendationItems = [
  'Immediately barricade the identified area and post warning signage.',
  'Conduct a slip/trip hazard inspection and remediate root cause (e.g., floor coating, drainage, housekeeping).',
  'Follow up with team lead to confirm corrective action is completed within 24 hours.',
];

const mockExplorerFiles = [
  {name: 'Annual_Financial_Report_2024.pdf', modified: 'Oct 12, 2024', type: 'PDF', size: '2.4 MB'},
  {name: 'Global_Security_Protocols_v3.docx', modified: 'Nov 05, 2024', type: 'Manual', size: '850 KB'},
  {name: 'Site_Safety_SOP_v2.pdf', modified: 'Yesterday', type: 'SOP', size: '1.2 MB'},
  {name: 'Employee_Onboarding_Handbook.pdf', modified: 'Today', type: 'Manual', size: '3.1 MB'},
];

const parseRecommendationItems = (text: string) => {
  const normalized = text
    .split(/\n\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
  return normalized.length ? normalized : [''];
};

const serializeRecommendationItems = (items: string[]) =>
  items
    .map((item) => item.trim())
    .filter(Boolean)
    .join('\n\n');

const esoMicButtonSx = {
  width: 20,
  height: 20,
  p: 0,
  borderRadius: 0.5,
  bgcolor: 'transparent',
  color: '#246BFE',
  boxShadow: 'none',
  '&:hover': {
    bgcolor: 'transparent',
    boxShadow: 'none',
  },
};

const formatUserName = (name: string) => {
  if (!name) return 'Guest name';
  if (name.includes('@')) {
    const part = name.split('@')[0];
    return part.split(/[\._]/).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  }
  return name;
};

type ShiftEntryEsoProps = {
  currentUserName?: string;
  onEsoSaved?: (payload: ShiftEntryEsoSavedPayload) => void;
  onOpenDashboard?: () => void;
  onClose?: () => void;
  onAssistantToggle?: (open: boolean) => void;
};

export default function ShiftEntryEso({
  currentUserName = 'Jose Rodriguez',
  onEsoSaved,
  onClose,
  onAssistantToggle
}: ShiftEntryEsoProps) {
  const [esoMode, setEsoMode] = useState<'home' | 'bbs' | 'condition' | 'nearMiss'>('home');
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  
  useEffect(() => {
    onAssistantToggle?.(isAssistantOpen);
  }, [isAssistantOpen, onAssistantToggle]);
  const [assistantStep, setAssistantStep] = useState<AssistantStep>(0);
  
  // BBS States
  const [bbsFillStep, setBbsFillStep] = useState(4);
  const [bbsStep, setBbsStep] = useState<BbsStep>(1);
  const [bbsDescriptionState, setBbsDescriptionState] = useState<BbsDescriptionState>('empty');
  const [bbsCommitmentText, setBbsCommitmentText] = useState(defaultBbsCommitmentText);
  const [bbsHasUnsafeBehaviors, setBbsHasUnsafeBehaviors] = useState(true);
  const [bbsPpeUnsafeCount, setBbsPpeUnsafeCount] = useState(2);
  const [counts, setCounts] = useState({employees: 1, contractors: 0, visitors: 0});

  // Condition States
  const [conditionView, setConditionView] = useState<ConditionView>('form');
  const [conditionFillStep, setConditionFillStep] = useState(4);
  const [conditionDescriptionState, setConditionDescriptionState] = useState<ConditionDescriptionState>('filled');
  const [conditionClassification, setConditionClassification] = useState<ConditionClassification>(null);
  const [conditionResolutionStatus, setConditionResolutionStatus] = useState<'Resolved' | 'Not Resolved' | null>(null);
  const [conditionMediaAttached, setConditionMediaAttached] = useState(false);
  const [conditionResolutionCategory, setConditionResolutionCategory] = useState(defaultResolutionCategory);
  const [conditionRecommendation, setConditionRecommendation] = useState('');

  // Near Miss States
  const [nearMissView, setNearMissView] = useState<NearMissView>('form');
  const [nearMissFillStep, setNearMissFillStep] = useState(4);
  const [nearMissDescriptionState, setNearMissDescriptionState] = useState<NearMissDescriptionState>('filled');
  const [nearMissResolutionStatus, setNearMissResolutionStatus] = useState<'Resolved' | 'Not Resolved' | null>(null);
  const [nearMissMediaAttached, setNearMissMediaAttached] = useState(false);
  const [nearMissResolutionCategory, setNearMissResolutionCategory] = useState(defaultResolutionCategory);
  const [nearMissRecommendation, setNearMissRecommendation] = useState('');

  useEffect(() => {
    if (!isAssistantOpen) return;
    setAssistantStep(0);
    const timers = [
      window.setTimeout(() => setAssistantStep(1), 450),
      window.setTimeout(() => setAssistantStep(2), 900),
      window.setTimeout(() => setAssistantStep(3), 1500),
    ];
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [isAssistantOpen]);

  const startAssistant = () => {
    setEsoMode('home');
    setIsAssistantOpen(true);
  };

  const openBbsWithAssistant = () => {
    setEsoMode('bbs');
    setAssistantStep(4);
    setBbsFillStep(0);
    setBbsStep(1);
    setBbsDescriptionState('empty');
    setBbsCommitmentText(defaultBbsCommitmentText);
    setBbsHasUnsafeBehaviors(true);
    setBbsPpeUnsafeCount(2);
    const timers = [
      window.setTimeout(() => {
        setAssistantStep(5);
        setBbsFillStep(1);
      }, 450),
      window.setTimeout(() => setBbsFillStep(2), 950),
      window.setTimeout(() => {
        setAssistantStep(6);
        setBbsFillStep(3);
      }, 1450),
      window.setTimeout(() => {
        setAssistantStep(7);
        setBbsFillStep(4);
      }, 2100),
    ];
    timers.forEach((timer) => window.setTimeout(() => window.clearTimeout(timer), 2600));
  };

  const openConditionWithAssistant = () => {
    setEsoMode('condition');
    setConditionView('form');
    setConditionFillStep(0);
    setConditionDescriptionState('empty');
    setConditionClassification(null);
    setConditionResolutionCategory(defaultResolutionCategory);
    setConditionRecommendation('');
    setConditionResolutionStatus(null);
    setConditionMediaAttached(false);
    setAssistantStep(4);
    window.setTimeout(() => setAssistantStep(5), 420);
    window.setTimeout(() => setConditionFillStep(1), 350);
    window.setTimeout(() => setConditionFillStep(2), 780);
    window.setTimeout(() => setConditionFillStep(3), 1150);
    window.setTimeout(() => setConditionDescriptionState('typing'), 1450);
    window.setTimeout(() => {
      setConditionFillStep(4);
      setConditionDescriptionState('filled');
    }, 2100);
  };

  const openNearMissWithAssistant = () => {
    setEsoMode('nearMiss');
    setNearMissView('form');
    setNearMissFillStep(0);
    setNearMissDescriptionState('empty');
    setNearMissResolutionCategory(defaultResolutionCategory);
    setNearMissRecommendation('');
    setNearMissResolutionStatus(null);
    setNearMissMediaAttached(false);
    setAssistantStep(4);
    window.setTimeout(() => setAssistantStep(5), 420);
    window.setTimeout(() => setNearMissFillStep(1), 350);
    window.setTimeout(() => setNearMissFillStep(2), 780);
    window.setTimeout(() => setNearMissFillStep(3), 1150);
    window.setTimeout(() => setNearMissDescriptionState('typing'), 1450);
    window.setTimeout(() => {
      setNearMissFillStep(4);
      setNearMissDescriptionState('filled');
    }, 2100);
  };

  const fillBbsDescriptionWithAi = () => {
    if (bbsDescriptionState !== 'empty') return;
    setBbsDescriptionState('typing');
    window.setTimeout(() => setBbsDescriptionState('filled'), 520);
  };

  const emitEsoSaved = (payload: Omit<ShiftEntryEsoSavedPayload, 'createdAt' | 'reporter'> & Partial<Pick<ShiftEntryEsoSavedPayload, 'createdAt'>>) => {
    onEsoSaved?.({
      ...payload,
      createdAt: payload.createdAt ?? buildCurrentTimeLabel(),
      reporter: formatUserName(currentUserName),
    });
  };

  const renderFlow = () => {
    switch (esoMode) {
      case 'home':
        return (
          <EsoHome
            assistantActive={isAssistantOpen}
            onDismissAssistant={() => setIsAssistantOpen(false)}
            onOpenAssistant={startAssistant}
            onOpenBbs={() => {
              setIsAssistantOpen(false);
              setEsoMode('bbs');
              setBbsStep(1);
              setBbsHasUnsafeBehaviors(true);
              setBbsPpeUnsafeCount(2);
            }}
            onOpenCondition={() => {
              setIsAssistantOpen(false);
              setEsoMode('condition');
              setConditionView('form');
              setConditionFillStep(4);
              setConditionDescriptionState('filled');
              setConditionClassification(null);
              setConditionResolutionCategory(defaultResolutionCategory);
              setConditionRecommendation('');
              setConditionResolutionStatus(null);
              setConditionMediaAttached(false);
            }}
            onOpenNearMiss={() => {
              setIsAssistantOpen(false);
              setEsoMode('nearMiss');
              setNearMissView('form');
              setNearMissFillStep(4);
              setNearMissDescriptionState('filled');
              setNearMissResolutionCategory(defaultResolutionCategory);
              setNearMissRecommendation('');
              setNearMissResolutionStatus(null);
              setNearMissMediaAttached(false);
            }}
          />
        );
      case 'bbs':
        return (
          <BbsObservationForm
            bbsFillStep={bbsFillStep}
            bbsStep={bbsStep}
            descriptionState={bbsDescriptionState}
            counts={counts}
            currentUserName={currentUserName}
            commitmentText={bbsCommitmentText}
            onBack={() => {
              if (bbsStep === 'ppe') { setBbsStep(2); return; }
              if (bbsStep === 'confirmation') { setBbsStep(4); return; }
              if (bbsStep === 4) { setBbsStep(3); return; }
              if (bbsStep === 3) { setBbsStep(2); return; }
              if (bbsStep === 2) { setBbsStep(1); return; }
              setEsoMode('home');
            }}
            onDescriptionFocus={fillBbsDescriptionWithAi}
            onCommitmentChange={setBbsCommitmentText}
            onGoHome={() => {
              setEsoMode('home');
              setBbsStep(1);
              setBbsDescriptionState('empty');
              setBbsCommitmentText(defaultBbsCommitmentText);
              setBbsHasUnsafeBehaviors(true);
              setBbsPpeUnsafeCount(2);
            }}
            onGoToCategories={() => setBbsStep(2)}
            onGoToBarriers={() => setBbsStep(3)}
            onGoToReview={() => setBbsStep(4)}
            onEditInitial={() => setBbsStep(1)}
            onEditBehavior={() => setBbsStep(1)}
            onEditCategories={() => setBbsStep(2)}
            onEditBarriers={() => setBbsStep(3)}
            onSubmit={() => {
              emitEsoSaved({
                esoType: 'BBS',
                line: 'Line 2',
                recordId: 'ESO-2024-102',
                riskLevel: 'Low',
                shift: 'Morning',
                summary: 'BBS observation completed with PPE gaps, barriers, and commitment agreement captured for follow-up.',
                title: 'BBS Observation Completed',
                zone: 'Zone 2',
              });
              setBbsStep('confirmation');
            }}
            onOpenPpe={() => setBbsStep('ppe')}
            bbsHasUnsafeBehaviors={bbsHasUnsafeBehaviors}
            bbsPpeUnsafeCount={bbsPpeUnsafeCount}
            onSetBbsHasUnsafeBehaviors={setBbsHasUnsafeBehaviors}
            onSetBbsPpeUnsafeCount={setBbsPpeUnsafeCount}
            onUpdateCount={(key, nextValue) => setCounts((prev) => ({...prev, [key]: Math.max(0, nextValue)}))}
          />
        );
      case 'condition':
        return (
          <ConditionReportFlow
            currentUserName={currentUserName}
            descriptionState={conditionDescriptionState}
            fillStep={conditionFillStep}
            mediaAttached={conditionMediaAttached}
            view={conditionView}
            classification={conditionClassification}
            resolutionCategory={conditionResolutionCategory}
            recommendation={conditionRecommendation}
            resolutionStatus={conditionResolutionStatus}
            onBack={() => {
              if (conditionView === 'cameraScan') { setConditionView('cameraIntro'); return; }
              if (conditionView === 'confirmation') { setConditionView('review'); return; }
              if (conditionView === 'review') { setConditionView(conditionClassification === 'Unsafe Condition' ? 'status' : 'categories'); return; }
              if (conditionView === 'status') { setConditionView('categories'); return; }
              if (conditionView === 'categories') { setConditionView('form'); return; }
              if (conditionView === 'cameraIntro') { setConditionView('form'); return; }
              setEsoMode('home');
            }}
            onCancel={() => setEsoMode('home')}
            onGoHome={() => {
              setEsoMode('home');
              setConditionView('form');
              setConditionFillStep(4);
              setConditionDescriptionState('filled');
              setConditionResolutionCategory(defaultResolutionCategory);
              setConditionRecommendation('');
              setConditionResolutionStatus(null);
              setConditionMediaAttached(false);
            }}
            onOpenCamera={() => setConditionView('cameraIntro')}
            onNext={() => {
              if (conditionView === 'form') { setConditionView('categories'); return; }
              if (conditionView === 'categories') {
                setConditionView(conditionClassification === 'Unsafe Condition' ? 'status' : 'review');
                return;
              }
              if (conditionView === 'status') { setConditionView('review'); return; }
              setConditionView('categories');
            }}
            onReady={() => setConditionView('cameraScan')}
            onRetake={() => setConditionView('cameraIntro')}
            onSelectSafeCondition={() => {
              setConditionClassification('Safe Condition');
              setConditionResolutionCategory(defaultResolutionCategory);
              setConditionRecommendation('');
              setConditionResolutionStatus(null);
              setConditionMediaAttached(false);
            }}
            onSetRecommendation={setConditionRecommendation}
            onSetResolutionCategory={setConditionResolutionCategory}
            onSetMediaAttached={setConditionMediaAttached}
            onSetClassification={setConditionClassification}
            onSetResolutionStatus={setConditionResolutionStatus}
            onSubmit={() => {
              emitEsoSaved({
                esoType: 'Condition Report',
                line: 'Line 3',
                recordId: 'ESO-2024-102',
                riskLevel: conditionClassification === 'Unsafe Condition' ? 'High' : 'Medium',
                shift: 'Morning',
                summary: 'Condition report submitted for inspection and containment after lubrication and hazard observations were documented.',
                title: 'Condition Report Submitted',
                zone: 'Zone 2',
              });
              setConditionView('confirmation');
            }}
            onUseScan={() => {
              setConditionFillStep(4);
              setConditionDescriptionState('filled');
              setConditionView('form');
            }}
          />
        );
      case 'nearMiss':
        return (
          <NearMissFlow
            currentUserName={currentUserName}
            descriptionState={nearMissDescriptionState}
            fillStep={nearMissFillStep}
            mediaAttached={nearMissMediaAttached}
            recommendation={nearMissRecommendation}
            resolutionCategory={nearMissResolutionCategory}
            resolutionStatus={nearMissResolutionStatus}
            view={nearMissView}
            onBack={() => {
              if (nearMissView === 'cameraScan') { setNearMissView('cameraIntro'); return; }
              if (nearMissView === 'confirmation') { setNearMissView('review'); return; }
              if (nearMissView === 'review') { setNearMissView('status'); return; }
              if (nearMissView === 'status') { setNearMissView('categories'); return; }
              if (nearMissView === 'categories') { setNearMissView('form'); return; }
              if (nearMissView === 'cameraIntro') { setNearMissView('form'); return; }
              setEsoMode('home');
            }}
            onCancel={() => setEsoMode('home')}
            onGoHome={() => {
              setEsoMode('home');
              setNearMissView('form');
              setNearMissFillStep(4);
              setNearMissDescriptionState('filled');
              setNearMissResolutionCategory(defaultResolutionCategory);
              setNearMissRecommendation('');
              setNearMissResolutionStatus(null);
              setNearMissMediaAttached(false);
            }}
            onNext={() => {
              if (nearMissView === 'categories') { setNearMissView('status'); return; }
              if (nearMissView === 'status') { setNearMissView('review'); return; }
              setNearMissView('categories');
            }}
            onOpenCamera={() => setNearMissView('cameraIntro')}
            onReady={() => setNearMissView('cameraScan')}
            onRetake={() => setNearMissView('cameraIntro')}
            onSetRecommendation={setNearMissRecommendation}
            onSetResolutionCategory={setNearMissResolutionCategory}
            onSetMediaAttached={setNearMissMediaAttached}
            onSetResolutionStatus={setNearMissResolutionStatus}
            onSubmit={() => {
              emitEsoSaved({
                esoType: 'Near Miss',
                line: 'Line 3',
                recordId: 'ESO-2026-118',
                riskLevel: 'High',
                shift: 'Morning',
                summary: 'Near miss logged with hazard context and resolution path so the next shift can track corrective actions.',
                title: 'Near Miss Logged',
                zone: 'Zone 3',
              });
              setNearMissView('confirmation');
            }}
            onUseScan={() => {
              setNearMissFillStep(4);
              setNearMissDescriptionState('filled');
              setNearMissMediaAttached(true);
              setNearMissView('categories');
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{height: '100%', display: 'grid', gridTemplateColumns: {xs: '1fr', sm: isAssistantOpen ? '1fr 400px' : '1fr'}, overflow: 'hidden'}}>
      <Box sx={{height: '100%', overflowY: 'auto', px: 1.5, pb: 2, borderRight: isAssistantOpen ? '1px solid #DDE7F4' : 'none'}}>
        {renderFlow()}
      </Box>
      {isAssistantOpen && (
        <Box sx={{height: '100%', overflow: 'hidden'}}>
          <ShiftEntryAssistantChat
            assistantStep={assistantStep}
            bbsFillStep={bbsFillStep}
            mode={esoMode === 'home' ? 'eso' : (esoMode as any)}
            onAcceptPrefill={() => setIsAssistantOpen(false)}
            onClose={() => setIsAssistantOpen(false)}
            onOpenBbs={openBbsWithAssistant}
            onOpenCondition={openConditionWithAssistant}
            onOpenNearMiss={openNearMissWithAssistant}
          />
        </Box>
      )}
    </Box>
  );
}

// Sub-components (extracted from ShiftEntryPanel_New.tsx)

function EsoHome({
  assistantActive,
  onDismissAssistant,
  onOpenAssistant,
  onOpenBbs,
  onOpenCondition,
  onOpenNearMiss,
}: {
  assistantActive?: boolean;
  onDismissAssistant?: () => void;
  onOpenAssistant: () => void;
  onOpenBbs: () => void;
  onOpenCondition: () => void;
  onOpenNearMiss: () => void;
}) {
  const [view, setView] = useState<'home' | 'myEsos'>('home');
  const goalSlides = [
    {
      label: 'Monthly ESO Goal',
      target: 'Target 12/17',
      percent: 70,
      submitted: ['BBS: 7 Submitted', 'Conditions: 2 Submitted', 'Near Miss: 3 Submitted'],
    },
    {
      label: 'Annual ESO Goal',
      target: 'Target 112/130',
      percent: 86,
      submitted: ['BBS: 70 Submitted', 'Conditions: 20 Submitted', 'Near Miss: 22 Submitted'],
    },
  ] as const;
  const [activeGoalIndex, setActiveGoalIndex] = useState(0);
  const myEsoRows = [
    {id: 'ESO-2024-102923', type: 'BBS', date: '06 May, 2026', status: 'CLOSED'},
    {id: 'ESO-2024-102921', type: 'BBS', date: '01 May, 2026', status: 'CLOSED'},
    {id: 'ESO-2024-102918', type: 'Condition Report', date: '23 Apr, 2026', status: 'REVIEW'},
    {id: 'ESO-2024-102913', type: 'BBS', date: '19 Apr, 2026', status: 'CLOSED'},
    {id: 'ESO-2024-102911', type: 'Condition Report', date: '12 Apr, 2026', status: 'ACTION IN PROGRESS'},
    {id: 'ESO-2024-102907', type: 'Condition Report', date: '04 Apr, 2026', status: 'ACTION CREATED'},
    {id: 'ESO-2024-102904', type: 'BBS', date: '22 Mar, 2026', status: 'CLOSED'},
  ] as const;

  const statusChipSx = (status: (typeof myEsoRows)[number]['status']) => {
    if (status === 'CLOSED') return {color: '#368D43', borderColor: '#89D18A', bgcolor: '#EEF9EE'};
    if (status === 'REVIEW') return {color: '#C46A00', borderColor: '#FFAE4F', bgcolor: '#FFF3E3'};
    return {color: '#1F6FFF', borderColor: '#6AA8FF', bgcolor: '#EEF5FF'};
  };

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveGoalIndex((currentIndex) => (currentIndex + 1) % goalSlides.length);
    }, 3400);

    return () => window.clearInterval(intervalId);
  }, [goalSlides.length]);

  if (view === 'myEsos') {
    return (
      <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto'}}>
        <Box sx={{minHeight: 0, overflowY: 'auto', pb: 1.2}}>
          <Typography sx={{fontSize: 20, fontWeight: 900, color: '#202124', mb: 1.9}}>My ESOs</Typography>
          <Box sx={{display: 'flex', flexDirection: 'column', gap: 1.25}}>
            {myEsoRows.map((item) => (
              <Paper key={item.id} elevation={0} sx={{display: 'grid', gridTemplateColumns: '30px minmax(0, 1fr) 16px', alignItems: 'center', gap: 1.1, px: 1.4, py: 1.25, borderRadius: 1.1, bgcolor: '#F7F8FA', border: '1px solid #EEF2F5'}}>
                <Box sx={{display: 'grid', placeItems: 'center'}}>
                  {item.type === 'BBS' ? <ShieldIcon sx={{fontSize: 19, color: '#1098E5'}} /> : <ErrorIcon sx={{fontSize: 19, color: '#FF9800'}} />}
                </Box>
                <Box sx={{minWidth: 0}}>
                  <Typography sx={{fontSize: 15, fontWeight: 700, color: '#202124', lineHeight: 1.2}}>{item.id}</Typography>
                  <Typography sx={{fontSize: 12.8, color: '#626465', lineHeight: 1.35, mt: 0.35}}>{item.type} - {item.date}</Typography>
                  <Box sx={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', mt: 0.7, px: 1, height: 18, borderRadius: 999, border: '1px solid', fontSize: 10.2, fontWeight: 900, lineHeight: 1, ...statusChipSx(item.status)}}>{item.status}</Box>
                </Box>
                <ArrowRightIcon sx={{fontSize: 16, color: '#6B7280'}} />
              </Paper>
            ))}
          </Box>
        </Box>
        <Box sx={{pt: 1, pb: 1, bgcolor: '#FFFFFF', position: 'sticky', bottom: 0}}>
          <Button fullWidth variant="outlined" startIcon={<ArrowLeftIcon />} onClick={() => setView('home')} sx={{height: 40, borderRadius: 1.3, borderColor: '#7EA7FF', color: '#0B63E5', fontWeight: 900, bgcolor: '#FFFFFF'}}>Back</Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{minHeight: '100%', display: 'block'}}>
      <Box sx={{minHeight: 0, overflowY: 'auto', pb: 0.35}}>
        <Typography sx={{fontSize: 20, fontWeight: 900, color: '#246BFE', mb: 0.95}}>Environmental or Safety Observation</Typography>
        <Typography sx={{fontSize: 12.8, lineHeight: 1.6, color: '#626465', mb: 1.85}}>
          Environmental or Safety Observation. Select the type of report you want to submit to ensure factory floor safety.
        </Typography>

        <AssistantCard active={assistantActive} onDismiss={onDismissAssistant} subtitle="Let IA suggest the right ESO type and prefill your profile and context." onAccept={onOpenAssistant} />

        <Typography sx={{fontSize: 15, fontWeight: 900, color: '#202124', mb: 1.15}}>Submit Report</Typography>
        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.95}}>
          <ReportOption icon={<BbsSubmitIcon />} title="BBS" subtitle="Behavior Based Safety observation" onClick={onOpenBbs} />
          <ReportOption icon={<ConditionSubmitIcon />} title="Condition Report" subtitle="Report unsafe workplace conditions" onClick={onOpenCondition} />
          <ReportOption icon={<NearMissSubmitIcon />} title="Near Miss" subtitle="Incidents with potential harm" onClick={onOpenNearMiss} />
        </Box>
      </Box>
    </Box>
  );
}

function BbsObservationForm({
  bbsFillStep,
  bbsStep,
  bbsHasUnsafeBehaviors,
  bbsPpeUnsafeCount,
  commitmentText,
  counts,
  currentUserName,
  descriptionState,
  onBack,
  onCommitmentChange,
  onDescriptionFocus,
  onGoHome,
  onGoToCategories,
  onGoToBarriers,
  onGoToReview,
  onEditInitial,
  onEditBehavior,
  onEditCategories,
  onEditBarriers,
  onOpenPpe,
  onSetBbsHasUnsafeBehaviors,
  onSetBbsPpeUnsafeCount,
  onSubmit,
  onUpdateCount,
}: {
  bbsFillStep: number;
  bbsStep: BbsStep;
  bbsHasUnsafeBehaviors: boolean;
  bbsPpeUnsafeCount: number;
  commitmentText: string;
  counts: {employees: number; contractors: number; visitors: number};
  currentUserName: string;
  descriptionState: BbsDescriptionState;
  onBack: () => void;
  onCommitmentChange: (nextValue: string) => void;
  onDescriptionFocus: () => void;
  onGoHome: () => void;
  onGoToCategories: () => void;
  onGoToBarriers: () => void;
  onOpenPpe: () => void;
  onSetBbsHasUnsafeBehaviors: (hasUnsafe: boolean) => void;
  onSetBbsPpeUnsafeCount: (unsafeCount: number) => void;
  onGoToReview: () => void;
  onEditInitial: () => void;
  onEditBehavior: () => void;
  onEditCategories: () => void;
  onEditBarriers: () => void;
  onSubmit: () => void;
  onUpdateCount: (key: 'employees' | 'contractors' | 'visitors', nextValue: number) => void;
}) {
  const hasDescription = descriptionState === 'filled';
  const [showImprovedDescription, setShowImprovedDescription] = useState(false);
  const [suggestionPanelOpen, setSuggestionPanelOpen] = useState(false);
  const showImproveButton = hasDescription && !showImprovedDescription;
  const originalDescription = `While the technician has gloves and eye
protection, missing equipment creates
safety and contamination risks.
No hair protection: Hair can contaminate
samples.
No face mask: Breathing can introduce
moisture and microbes.
No safety vest: Lower visibility increases
accident risk.`;
  const improvedDescription = `While the technician is wearing gloves and eye protection, the absence of other essential equipment creates risks to both personal safety and lab integrity.

Missing hair protection: Exposed hair can contaminate samples, especially in sterile environments, compromising results.

Missing face mask: Breathing or speaking near equipment can introduce moisture and microbes, leading to contamination.

No safety vest: Reduced visibility increases the risk of accidents with other personnel or equipment.`;

  useEffect(() => {
    if (!hasDescription) {
      setShowImprovedDescription(false);
      setSuggestionPanelOpen(false);
    }
  }, [hasDescription]);

  if (bbsStep === 'ppe') return <BbsPpeStep hasUnsafeBehaviors={bbsHasUnsafeBehaviors} initialUnsafeCount={bbsPpeUnsafeCount} onBack={onBack} onUnsafeChange={onSetBbsHasUnsafeBehaviors} onUnsafeCountChange={onSetBbsPpeUnsafeCount} />;
  if (bbsStep === 'confirmation') return <BbsConfirmationStep onGoHome={onGoHome} currentUserName={currentUserName} />;
  if (bbsStep === 4) return <BbsReviewStep commitmentText={commitmentText} counts={counts} currentUserName={currentUserName} onBack={onBack} onEditBarriers={onEditBarriers} onEditBehavior={onEditBehavior} onEditCategories={onEditCategories} onEditInitial={onEditInitial} onSubmit={onSubmit} />;
  if (bbsStep === 3) return <BbsBarriersStep hasUnsafeBehaviors={bbsHasUnsafeBehaviors} onBack={onBack} onGoToReview={onGoToReview} />;
  if (bbsStep === 2) return <BbsCategoriesStep ppeUnsafeCount={bbsPpeUnsafeCount} onBack={onBack} onGoToBarriers={onGoToBarriers} onOpenPpe={onOpenPpe} />;

  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto'}}>
      <Box sx={{px: 0.7, minHeight: 0, overflowY: 'auto', pb: 1}}>
        <ProgressHeader step={1} width="25%" total={4} />
        <Paper elevation={0} sx={{p: 1.4, borderRadius: 1.2, bgcolor: '#EAF2FF', border: '1px solid #DDE7F4', mb: 1.2, boxShadow: '0 8px 20px rgba(15,23,42,0.08)'}}>
          <Typography sx={{fontSize: 20, fontWeight: 900, color: '#202124'}}>BBS Observation</Typography>
          <Typography sx={{fontSize: 12.5, color: '#626465', mt: 0.65, lineHeight: 1.5}}>Fill in the fields to get started and ensure operational excellence.</Typography>
        </Paper>

        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mb: 0.7}}>
          <InfoField filling={bbsFillStep < 1} label="Submitter" value={bbsFillStep >= 1 ? formatUserName(currentUserName) : 'Filling...'} />
          <InfoField filling={bbsFillStep < 2} label="Report Date" value={bbsFillStep >= 2 ? new Date().toLocaleDateString('en-US') : 'Filling...'} />
        </Box>
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mb: 0.7}}>
          <FieldShell label="Occurrence Date">
            <TextField 
              type="date" 
              fullWidth 
              size="small" 
              variant="standard"
              InputProps={{ disableUnderline: true }}
              defaultValue={new Date().toISOString().split('T')[0]}
              sx={{ height: 38, '& .MuiInputBase-root': { height: '100%', px: 1, fontSize: 14 } }}
            />
          </FieldShell>
          <FieldShell label="Shift">
            <Select value="B" size="small" fullWidth sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="A">A</MenuItem><MenuItem value="B">B</MenuItem><MenuItem value="C">C</MenuItem></Select>
          </FieldShell>
        </Box>
        <FieldShell label="Area">
          <Select value={bbsFillStep >= 3 ? 'Assembly Line B' : ''} displayEmpty size="small" fullWidth sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Assembly Line B">Assembly Line B</MenuItem></Select>
        </FieldShell>
        <FieldShell label="Unit">
          <Select value={bbsFillStep >= 3 ? 'Unit A' : ''} displayEmpty size="small" fullWidth sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Unit A">Unit A</MenuItem></Select>
        </FieldShell>
        <FieldShell label="Line">
          <Select value={bbsFillStep >= 3 ? 'Line 1' : ''} displayEmpty size="small" fullWidth sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Line 1">Line 1</MenuItem></Select>
        </FieldShell>

        <Typography sx={{fontSize: 15, fontWeight: 900, color: '#202124', mt: 1.4, mb: 0.9}}>Behavior & Commitment</Typography>
        <FieldShell label="Observed Behavior">
          <Box sx={{position: 'relative'}}>
          <Box onClick={onDescriptionFocus} sx={{minHeight: hasDescription ? 150 : 74, px: 1.05, py: 1.2, pr: 3.2, whiteSpace: 'pre-line', color: descriptionState === 'empty' ? '#A0A8B6' : '#202124', fontSize: 15, lineHeight: 1.45, cursor: 'text'}}>
            {descriptionState === 'typing' ? 'My AI Assistant is typing...' : hasDescription ? (showImprovedDescription ? improvedDescription : originalDescription) : 'Describe what you observed or tap the mic to speak.'}
          </Box>
          <IconButton onClick={onDescriptionFocus} sx={{...esoMicButtonSx, position: 'absolute', right: 8, bottom: 8}}><MicIcon sx={{fontSize: 18}} /></IconButton>
          </Box>
        </FieldShell>
        {hasDescription && showImprovedDescription && (
          <Box sx={{mt: 0.6}}>
            <Typography sx={{fontSize: 12.4, color: '#626465', mb: 0.6}}>
              Improved with <Typography component="span" sx={{fontSize: 12.4, color: '#246BFE'}}>ATLAS.AI</Typography>
            </Typography>
          </Box>
        )}
        <Box sx={{display: 'flex', mt: 0.7, mb: 1}}>
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon sx={{fontSize: 18, color: '#FF7A00'}} />}
            onClick={() => hasDescription ? setSuggestionPanelOpen(true) : onDescriptionFocus()}
            sx={{height: 39, borderRadius: 1.2, borderColor: '#7EA7FF', color: '#246BFE', fontWeight: 900, width: '100%'}}
          >
            Improve with ATLAS.AI
          </Button>
        </Box>
        {hasDescription && suggestionPanelOpen && !showImprovedDescription && (
          <Paper elevation={0} sx={{mt: 0.2, p: 1.25, borderRadius: 1.3, border: '1px solid #DDE7F4', bgcolor: '#FFFFFF', boxShadow: '0 10px 20px rgba(15,23,42,0.10)'}}>
            <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.55}}>
              <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.5}}>
                <AutoAwesomeIcon sx={{fontSize: 18, color: '#FF9A1F'}} />
                <Typography sx={{fontSize: 18, fontWeight: 900, color: '#246BFE'}}>ATLAS.AI</Typography>
                <Typography sx={{fontSize: 18, color: '#246BFE'}}>suggestion</Typography>
              </Box>
              <IconButton size="small" onClick={() => setSuggestionPanelOpen(false)} sx={{color: '#246BFE'}}>
                <CloseIcon sx={{fontSize: 20}} />
              </IconButton>
            </Box>
            <Typography sx={{whiteSpace: 'pre-line', color: '#202124', fontSize: 15, lineHeight: 1.5, mb: 1.1}}>
              {improvedDescription}
            </Typography>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setShowImprovedDescription(true);
                setSuggestionPanelOpen(false);
              }}
              sx={{height: 40, borderRadius: 1.2, borderColor: '#7EA7FF', color: '#246BFE', fontSize: 12.7, fontWeight: 900}}
            >
              Apply the changes
            </Button>
          </Paper>
        )}
        <FieldShell label="Commitment statement">
          <Box sx={{position: 'relative'}}>
          <TextField
            fullWidth
            multiline
            minRows={4}
            variant="standard"
            value={commitmentText}
            onChange={(event) => onCommitmentChange(event.target.value)}
            placeholder="e.g. Worker agreed to..."
            InputProps={{ disableUnderline: true }}
            sx={{'& .MuiInputBase-root': {px: 1.05, py: 1.2, pr: 3.2, fontSize: 15, lineHeight: 1.45, color: '#202124'}}}
          />
          <IconButton sx={{...esoMicButtonSx, position: 'absolute', right: 8, bottom: 8}}><MicIcon sx={{fontSize: 18}} /></IconButton>
          </Box>
        </FieldShell>
        <Box sx={{display: 'flex', mt: 0.7, mb: 1}}>
          <Button
            variant="outlined"
            startIcon={<AutoAwesomeIcon sx={{fontSize: 18, color: '#FF7A00'}} />}
            sx={{height: 39, borderRadius: 1.2, borderColor: '#7EA7FF', color: '#246BFE', fontWeight: 900, width: '100%'}}
          >
            Improve with ATLAS.AI
          </Button>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.55, mt: 1.4, mb: 1}}>
          <Typography sx={{fontSize: 15, fontWeight: 900, color: '#202124'}}>Personnel Count</Typography>
          <Tooltip
            title="People involved in the observation. Include BD employees, contractors, or visitors observed or involved in the behavior/situation."
            arrow
            placement="top"
          >
            <InfoIcon sx={{fontSize: 16, color: '#6B7280', cursor: 'help'}} />
          </Tooltip>
        </Box>
        <PersonnelCountRow label="BD Employees" subtitle="Full-time staff" value={counts.employees} onAdd={() => onUpdateCount('employees', counts.employees + 1)} onRemove={() => onUpdateCount('employees', counts.employees - 1)} />
        <PersonnelCountRow label="Contractors" subtitle="Temporary labor" value={counts.contractors} onAdd={() => onUpdateCount('contractors', counts.contractors + 1)} onRemove={() => onUpdateCount('contractors', counts.contractors - 1)} />
        <PersonnelCountRow label="Visitors" subtitle="Guests/External" value={counts.visitors} onAdd={() => onUpdateCount('visitors', counts.visitors + 1)} onRemove={() => onUpdateCount('visitors', counts.visitors - 1)} />
      </Box>
      <BbsFooter primaryLabel="Next" onBack={onBack} onPrimary={onGoToCategories} />
    </Box>
  );
}

function BbsCategoriesStep({
  ppeUnsafeCount,
  onBack,
  onGoToBarriers,
  onOpenPpe,
}: {
  ppeUnsafeCount: number;
  onBack: () => void;
  onGoToBarriers: () => void;
  onOpenPpe: () => void;
}) {
  const [othersExpanded, setOthersExpanded] = useState(false);
  const ppeSafeCount = Math.max(0, 6 - ppeUnsafeCount);
  const topCategoryRows = [
    {title: 'Body Position (Line of Fire)', icon: <BodyPositionIcon />},
    {title: 'Body Use (Ergonomics)', icon: <ErgonomicsIcon />},
    {title: 'PPE', icon: <PpeIcon />, positive: ppeSafeCount, negative: ppeUnsafeCount},
    {title: 'Safe Walking', icon: <WalkIcon />},
    {title: 'Tools & Equipment', icon: <ToolsIcon />},
  ].sort((a, b) => a.title.localeCompare(b.title));
  const otherCategoryRows = [
    {title: 'Fall Protection', icon: <FallProtectionIcon />},
    {title: 'Lockout Tagout (LOTO)', icon: <LockIcon />},
    {title: 'Machine Guarding', icon: <FlagIcon />},
    {title: 'Procedures & Standards', icon: <DescriptionIcon />},
    {title: 'Mobile Equipment (PIT)', icon: <MobileEquipmentIcon />},
    {title: 'Chemical Handing', icon: <ChemicalHandlingIcon />},
    {title: 'Environmental Stewardship', icon: <EnvironmentalIcon />},
    {title: 'Speak Up (Concern for Others)', icon: <SpeakUpIcon />},
    {title: '5S (Housekeeping)', icon: <HousekeepingIcon />},
  ].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.7}}><ProgressHeader step={2} width="50%" total={4} />
        <Paper elevation={0} sx={{p: 1.45, borderRadius: 1.3, bgcolor: '#EAF2FF', border: '1px solid #DDE7F4', mb: 1.35, boxShadow: '0 8px 18px rgba(15,23,42,0.08)'}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124'}}>Categories</Typography>
          <Typography sx={{fontSize: 12.3, color: '#626465', mt: 0.65, lineHeight: 1.45}}>Tap a category to begin and ensure operational excellence.</Typography>
          <Typography sx={{fontSize: 13, color: '#0B63E5', fontWeight: 900, mt: 1.65, display: 'flex', alignItems: 'center', gap: 0.45}}><AutoAwesomeIcon sx={{fontSize: 17, color: '#FF7A00'}} />Categories selected by ATLAS.AI<CheckIcon sx={{fontSize: 18, ml: 'auto'}} /></Typography>
        </Paper>
        <Box sx={{mt: 2.35}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.25, mb: 1.05}}><Typography sx={{fontSize: 14, fontWeight: 800, color: '#202124'}}>Top 5</Typography><ArrowDownIcon sx={{fontSize: 18, color: '#626465'}} /></Box>
          <Box sx={{display: 'grid', gap: 0.55}}>{topCategoryRows.map((row) => <CategoryRowCard key={row.title} row={row} onOpenPpe={onOpenPpe} />)}</Box>
          <Box onClick={() => setOthersExpanded(p => !p)} sx={{display: 'flex', alignItems: 'center', gap: 0.2, mt: 1.75, cursor: 'pointer'}}><Typography sx={{fontSize: 14, fontWeight: 800, color: '#202124'}}>Others</Typography>{othersExpanded ? <ArrowDownIcon sx={{fontSize: 18, color: '#626465'}} /> : <ArrowRightIcon sx={{fontSize: 18, color: '#626465'}} />}</Box>
          {othersExpanded && <Box sx={{display: 'grid', gap: 0.55, mt: 0.95}}>{otherCategoryRows.map((row) => <CategoryRowCard key={row.title} row={row} onOpenPpe={onOpenPpe} />)}</Box>}
        </Box>
      </Box>
      <BbsFooter primaryLabel="Next" onBack={onBack} onPrimary={onGoToBarriers} />
    </Box>
  );
}

function BbsPpeStep({
  hasUnsafeBehaviors,
  initialUnsafeCount,
  onBack,
  onUnsafeChange,
  onUnsafeCountChange,
}: {
  hasUnsafeBehaviors: boolean;
  initialUnsafeCount: number;
  onBack: () => void;
  onUnsafeChange: (hasUnsafe: boolean) => void;
  onUnsafeCountChange: (unsafeCount: number) => void;
}) {
  const defaultUnsafeItems = [
    'Respiratory protection',
    'Body protection',
    'Face and eyes protection',
    'Foot protection',
    'Hands and fingers protection',
    'Hearing protection',
  ];
  const [unsafeItems, setUnsafeItems] = useState(() => {
    if (!hasUnsafeBehaviors) return new Set<string>();
    return new Set(defaultUnsafeItems.slice(0, Math.min(defaultUnsafeItems.length, initialUnsafeCount)));
  });
  const ppeItems = [
    {title: 'Body protection', subtitle: 'Proper clothing for the task'},
    {title: 'Face and eyes protection', subtitle: 'Proper selection/good conditions/worn correctly'},
    {title: 'Foot protection', subtitle: 'Proper safety shoes'},
    {title: 'Hands and fingers protection', subtitle: 'Proper selection/good conditions/worn correctly'},
    {title: 'Hearing protection', subtitle: 'Proper for the hazard/worn correctly'},
    {title: 'Respiratory protection', subtitle: 'Proper for the hazard/worn correctly'},
  ];
  useEffect(() => {
    onUnsafeChange(unsafeItems.size > 0);
    onUnsafeCountChange(unsafeItems.size);
  }, [onUnsafeChange, onUnsafeCountChange, unsafeItems]);
  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.7, pt: 0.2, minHeight: 0, overflowY: 'auto', pb: 1}}>
        <Paper elevation={0} sx={{p: 1.45, borderRadius: 1.3, bgcolor: '#EAF2FF', border: '1px solid #DDE7F4', mb: 1.7, boxShadow: '0 8px 18px rgba(15,23,42,0.08)'}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124'}}>PPE</Typography>
          <Typography sx={{fontSize: 12.3, color: '#626465', mt: 0.65, lineHeight: 1.45}}>Personal Protective Equipment - 6 items to observe</Typography>
        </Paper>
        <Box sx={{display: 'grid', gap: 0.8}}>{ppeItems.map((item) => {
          const isUnsafe = unsafeItems.has(item.title);
          return (
            <Paper key={item.title} elevation={0} sx={{minHeight: 92, p: 1.15, borderRadius: 1.1, border: '1px solid #DDE7F4', boxShadow: '0 4px 10px rgba(15,23,42,0.05)', display: 'grid', gridTemplateRows: 'auto auto 1fr'}}>
              <Typography sx={{fontSize: 16, color: '#202124', lineHeight: 1.2}}>{item.title}</Typography>
              <Typography sx={{fontSize: 11.5, color: '#626465', mt: 0.55}}>{item.subtitle}</Typography>
              <Box sx={{display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: 0.75, mt: 1}}>
                <Button variant="outlined" onClick={() => setUnsafeItems(prev => { const n = new Set(prev); n.delete(item.title); return n; })} startIcon={!isUnsafe ? <ShieldIcon sx={{fontSize: 15}} /> : null} sx={{height: 28, borderRadius: 999, px: 1.25, borderColor: '#D5DCE7', bgcolor: !isUnsafe ? '#DDF4E2' : '#F1F3F6', color: !isUnsafe ? '#2F8A42' : '#606775', fontSize: 12, fontWeight: 900}}>Safe</Button>
                <Button variant="outlined" onClick={() => setUnsafeItems(prev => { const n = new Set(prev); n.add(item.title); return n; })} startIcon={isUnsafe ? <ShieldIcon sx={{fontSize: 15}} /> : null} sx={{height: 28, borderRadius: 999, px: 1.25, borderColor: '#D5DCE7', bgcolor: isUnsafe ? '#FFE2DE' : '#F1F3F6', color: isUnsafe ? '#E25A4A' : '#606775', fontSize: 12, fontWeight: 900}}>Unsafe</Button>
              </Box>
            </Paper>
          );
        })}</Box>
      </Box>
      <Box sx={{px: 2, py: 1, bgcolor: '#FFFFFF', borderTop: '1px solid #E5EAF3'}}><Button fullWidth variant="contained" startIcon={<ArrowLeftIcon />} onClick={onBack} sx={{height: 40, borderRadius: 1.2, bgcolor: '#246BFE', fontWeight: 900, boxShadow: 'none'}}>Save & Back</Button></Box>
    </Box>
  );
}

function BbsBarriersStep({
  hasUnsafeBehaviors,
  onBack,
  onGoToReview,
}: {
  hasUnsafeBehaviors: boolean;
  onBack: () => void;
  onGoToReview: () => void;
}) {
  const [selectedBarriers, setSelectedBarriers] = useState(() => new Set(['Lack of Training / Unfamiliar', 'Complacency']));
  const [observerComments, setObserverComments] = useState('');
  const [notApplicableSelected, setNotApplicableSelected] = useState(false);
  const barrierRows = ['Complacency', 'Culture / Peer pressure', 'Disagreement on Unsafe Practices', 'Equipment / Facility Condition', 'Fatigue', 'Frustration', 'Insignificant / Indifferent', 'Lack of Training / Unfamiliar', 'Management Pressure / System', 'Personal Factors', 'Rushing', 'Work Environment'];
  const canContinue = notApplicableSelected || observerComments.trim().length > 0;
  useEffect(() => {
    if (hasUnsafeBehaviors && notApplicableSelected) {
      setNotApplicableSelected(false);
    }
  }, [hasUnsafeBehaviors, notApplicableSelected]);
  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.7, minHeight: 0, overflowY: 'auto', pb: 1}}><ProgressHeader step={3} width="75%" total={4} />
        <Paper elevation={0} sx={{p: 1.45, borderRadius: 1.3, bgcolor: '#EAF2FF', border: '1px solid #DDE7F4', mb: 1.35, boxShadow: '0 8px 18px rgba(15,23,42,0.08)'}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124'}}>BBS Barriers</Typography>
          <Typography sx={{fontSize: 12.3, color: '#626465', mt: 0.65, lineHeight: 1.45}}>Select all barriers that contributed to what occurred.</Typography>
          <Typography sx={{fontSize: 13, color: '#0B63E5', fontWeight: 900, mt: 1.65, display: 'flex', alignItems: 'center', gap: 0.45}}><AutoAwesomeIcon sx={{fontSize: 17, color: '#FF7A00'}} />Barriers selected by ATLAS.AI<CheckIcon sx={{fontSize: 18, ml: 'auto'}} /></Typography>
        </Paper>
        <Box sx={{position: 'relative', mb: 1.75}}>
        <FieldShell label={`Observer Comments -- Why / Barrier Clarification${notApplicableSelected ? ' (Optional)' : ''}`}>
            <Box sx={{position: 'relative'}}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={observerComments}
              onChange={(event) => setObserverComments(event.target.value)}
              placeholder="Explain selected barriers. What context is important?"
              variant="standard"
              InputProps={{disableUnderline: true}}
              sx={{'& .MuiInputBase-root': {minHeight: 72, px: 1, py: 1.15, pr: 3.2, color: '#202124', fontSize: 15, lineHeight: 1.45}}}
            />
            <IconButton sx={{...esoMicButtonSx, position: 'absolute', right: 8, bottom: 8}}><MicIcon sx={{fontSize: 18}} /></IconButton>
            </Box>
          </FieldShell>
        </Box>
        <Box sx={{display: 'grid', gap: 0.75, mt: 3.8}}>
          <Paper
            elevation={0}
            onClick={() => {
              if (hasUnsafeBehaviors) return;
              setNotApplicableSelected((prev) => {
                const next = !prev;
                if (next) setSelectedBarriers(new Set());
                return next;
              });
            }}
            sx={{
              height: 44,
              px: 1,
              borderRadius: 1,
              bgcolor: notApplicableSelected ? '#DCE8FA' : '#F7F8FA',
              display: 'grid',
              gridTemplateColumns: '40px 1fr',
              alignItems: 'center',
              cursor: hasUnsafeBehaviors ? 'not-allowed' : 'pointer',
              opacity: hasUnsafeBehaviors ? 0.5 : 1,
            }}
          >
            <Box sx={{display: 'grid', placeItems: 'center'}}>
              <Checkbox checked={notApplicableSelected} disableRipple disabled={hasUnsafeBehaviors} sx={{p: 0, color: '#717784', '&.Mui-checked': {color: '#246BFE'}}} />
            </Box>
            <Typography sx={{fontSize: 15, color: '#202124'}}>Not Applicable</Typography>
          </Paper>
          {barrierRows.map((row) => {
          const selected = selectedBarriers.has(row);
          return (
            <Paper
              key={row}
              elevation={0}
              onClick={() => {
                if (notApplicableSelected) return;
                setSelectedBarriers((prev) => {
                  const n = new Set(prev);
                  if (n.has(row)) n.delete(row); else n.add(row);
                  return n;
                });
              }}
              sx={{
                height: 44,
                px: 1,
                borderRadius: 1,
                bgcolor: selected ? '#DCE8FA' : '#F7F8FA',
                display: 'grid',
                gridTemplateColumns: '40px 1fr',
                alignItems: 'center',
                cursor: notApplicableSelected ? 'not-allowed' : 'pointer',
                opacity: notApplicableSelected ? 0.5 : 1,
              }}
            >
              <Box sx={{display: 'grid', placeItems: 'center'}}>
                <Checkbox checked={selected} disableRipple disabled={notApplicableSelected} sx={{p: 0, color: '#717784', '&.Mui-checked': {color: '#246BFE'}}} />
              </Box>
              <Typography sx={{fontSize: 15, color: '#202124'}}>{row}</Typography>
            </Paper>
          );
        })}
        </Box>
      </Box>
      <BbsFooter disabled={!canContinue} primaryLabel="Next" onBack={onBack} onPrimary={onGoToReview} />
    </Box>
  );
}

function BbsReviewStep({commitmentText, counts, currentUserName, onBack, onEditBarriers, onEditBehavior, onEditCategories, onEditInitial, onSubmit}: {commitmentText: string; counts: {employees: number; contractors: number; visitors: number}; currentUserName: string; onBack: () => void; onEditBarriers: () => void; onEditBehavior: () => void; onEditCategories: () => void; onEditInitial: () => void; onSubmit: () => void}) {
  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.7, minHeight: 0, overflowY: 'auto', pb: 1.4}}><ProgressHeader step={4} width="100%" total={4} />
        <Paper elevation={0} sx={{p: 1.45, borderRadius: 1.3, bgcolor: '#EAF2FF', border: '1px solid #DDE7F4', mb: 1.5, boxShadow: '0 8px 18px rgba(15,23,42,0.08)'}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124'}}>Review & Submit</Typography>
          <Typography sx={{fontSize: 12.3, color: '#626465', mt: 0.65, lineHeight: 1.45}}>Review your entries before final submission.</Typography>
        </Paper>
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8, mb: 1.4}}><ReviewCount tone="safe" label="Safe" value="3" /><ReviewCount tone="unsafe" label="Unsafe" value="2" /></Box>
        <ReviewSection title="Initial Information" onEdit={onEditInitial}>
          <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7}}>
            <ReviewInfo label="Submitter" value={formatUserName(currentUserName)} />
            <ReviewInfo label="Report Date" value="02/02/2026" />
            <ReviewInfo label="Occurrence Date" value="02/02/2026" />
            <ReviewInfo label="Shift" value="B" />
            <ReviewInfo label="Area" value="Assembly Line B" />
            <ReviewInfo label="Unit" value="Unit A" />
            <ReviewInfo label="Line" value="Line 1" />
          </Box>
          <Box sx={{display: 'flex', gap: 0.45, mt: 0.7}}>
            <ReviewPill label={`${counts.employees} BD employees`} />
            <ReviewPill label={`${counts.contractors} Contractors`} />
            <ReviewPill label={`${counts.visitors} Visitors`} />
          </Box>
        </ReviewSection>
        <ReviewSection title="Behavior & Commitment" onEdit={onEditBehavior}>
          <Typography sx={{fontSize: 11.5, color: '#626465', mb: 0.25}}>Observed Behavior</Typography>
          <Typography sx={{fontSize: 15.5, color: '#626465', lineHeight: 1.45, mb: 0.9}}>While the technician has gloves and eye protection, missing equipment creates safety and contamination risks.</Typography>
          <Typography sx={{fontSize: 11.5, color: '#626465', mb: 0.25}}>Commitment statement</Typography>
          <Typography sx={{fontSize: 15.5, color: '#626465', lineHeight: 1.45, whiteSpace: 'pre-line'}}>{commitmentText}</Typography>
        </ReviewSection>
        <ReviewSection title="Categories" onEdit={onEditCategories}>
          <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
              <PpeIcon sx={{fontSize: 17, color: '#246BFE'}} />
              <Typography sx={{fontSize: 15.5, color: '#202124'}}>PPE</Typography>
            </Box>
            <CheckIcon sx={{fontSize: 18, color: '#246BFE'}} />
          </Box>
        </ReviewSection>
        <ReviewSection title="BBS Barriers" onEdit={onEditBarriers}>
          <Paper elevation={0} sx={{p: 1, borderRadius: 1, bgcolor: '#F0F1F3', mb: 0.85}}>
            <Typography sx={{fontSize: 11.5, color: '#626465'}}>Observer Comments -- Why / Barrier Clarification</Typography>
            <Typography sx={{fontSize: 15, color: '#202124'}}>Worker agreed to wear all required PPE and follow safety procedures at all times.</Typography>
          </Paper>
          <Box sx={{display: 'flex', gap: 0.55}}>
            <ReviewPill label="Rushing" />
            <ReviewPill label="Management Pressure" />
          </Box>
        </ReviewSection>
      </Box>
      <BbsFooter primaryLabel="Submit Report" onBack={onBack} onPrimary={onSubmit} />
    </Box>
  );
}

function BbsConfirmationStep({onGoHome, currentUserName}: {onGoHome: () => void; currentUserName: string}) {
  return (
    <Box sx={{height: '100%', display: 'grid', gridTemplateRows: '1fr auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{display: 'grid', placeItems: 'center', textAlign: 'center', px: 3}}>
        <Box><Box sx={{width: 92, height: 92, borderRadius: '50%', bgcolor: '#EAF6EB', display: 'grid', placeItems: 'center', mx: 'auto', mb: 3.1}}><Box sx={{width: 46, height: 46, borderRadius: '50%', bgcolor: '#64C46D', color: '#FFFFFF', display: 'grid', placeItems: 'center'}}><CheckIcon sx={{fontSize: 30}} /></Box></Box><Typography sx={{fontSize: 19, fontWeight: 900, color: '#202124', mb: 0.8}}>Well done, {formatUserName(currentUserName)}!</Typography><Typography sx={{fontSize: 12.5, color: '#626465', lineHeight: 1.45, mb: 3.4}}>Your BBS observation has been recorded successfully.<br />Thank you for making our workspace safer.</Typography><Typography sx={{fontSize: 12, color: '#626465', letterSpacing: 1.2}}>RECORD ID: ESO - 2024 -102<br />{new Date().toLocaleDateString('en-GB')}</Typography></Box>
      </Box>
      <Box sx={{px: 2, py: 1.1, borderTop: '1px solid #E5EAF3'}}><Button fullWidth variant="contained" onClick={onGoHome} sx={{height: 40, borderRadius: 1.2, bgcolor: '#246BFE', fontWeight: 900, boxShadow: 'none'}}>ESO Home</Button></Box>
    </Box>
  );
}

function ConditionReportFlow({
  classification,
  mediaAttached,
  currentUserName,
  descriptionState,
  fillStep,
  onBack,
  onCancel,
  onGoHome,
  onNext,
  onOpenCamera,
  onReady,
  onRetake,
  onSelectSafeCondition,
  onSetRecommendation,
  onSetResolutionCategory,
  onSetMediaAttached,
  onSetClassification,
  onSetResolutionStatus,
  onSubmit,
  onUseScan,
  recommendation,
  resolutionCategory,
  resolutionStatus,
  view,
}: {
  classification: ConditionClassification;
  mediaAttached: boolean;
  currentUserName: string;
  descriptionState: ConditionDescriptionState;
  fillStep: number;
  onBack: () => void;
  onCancel: () => void;
  onGoHome: () => void;
  onNext: () => void;
  onOpenCamera: () => void;
  onReady: () => void;
  onRetake: () => void;
  onSelectSafeCondition: () => void;
  onSetRecommendation: (recommendation: string) => void;
  onSetResolutionCategory: (category: string) => void;
  onSetMediaAttached: (attached: boolean) => void;
  onSetClassification: (classification: ConditionClassification) => void;
  onSetResolutionStatus: (status: 'Resolved' | 'Not Resolved' | null) => void;
  onSubmit: () => void;
  onUseScan: () => void;
  recommendation: string;
  resolutionCategory: string;
  resolutionStatus: 'Resolved' | 'Not Resolved' | null;
  view: ConditionView;
}) {
  if (view === 'cameraIntro') return <ConditionCameraIntro onBack={onBack} onReady={onReady} />;
  if (view === 'cameraScan') return <ConditionCameraScan onCancel={onCancel} onRetake={onRetake} onUseScan={onUseScan} />;
  if (view === 'categories') return (
    <ConditionResolutionCategoriesStep
      category={resolutionCategory}
      descriptionEntity="condition"
      onBack={onBack}
      onNext={onNext}
      onSelectCategory={onSetResolutionCategory}
      totalSteps={classification === 'Safe Condition' ? 3 : 4}
      nextLabel="Next"
    />
  );
  if (view === 'status') return <ConditionResolutionStatusStep mediaAttached={mediaAttached} onAddMedia={() => onSetMediaAttached(true)} onBack={onBack} onNext={onNext} onRecommendationChange={onSetRecommendation} onSetStatus={onSetResolutionStatus} recommendation={recommendation} showLikelihood status={resolutionStatus} />;
  if (view === 'review') return <ConditionReviewStep classification={classification} currentUserName={currentUserName} mediaAttached={mediaAttached} onBack={onBack} onSubmit={onSubmit} recommendation={recommendation} resolutionCategory={resolutionCategory} resolutionStatus={resolutionStatus} />;
  if (view === 'confirmation') return <ConditionConfirmationStep currentUserName={currentUserName} onGoHome={onGoHome} />;

  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.7, minHeight: 0, overflowY: 'auto', pb: 1.2}}>
        <ProgressHeader step={1} width={classification === 'Safe Condition' ? '33.3%' : '25%'} total={classification === 'Safe Condition' ? 3 : 4} />
        <Paper elevation={0} sx={{p: 1.25, borderRadius: 1.3, bgcolor: '#EAF2FF', border: '1px solid #DDE7F4', mb: 1.35, boxShadow: '0 8px 18px rgba(15,23,42,0.08)'}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124'}}>Condition Report</Typography>
          <Typography sx={{fontSize: 12.3, color: '#626465', mt: 0.65, lineHeight: 1.45}}>Fill in the fields to report the observed condition and help drive operational excellence.</Typography>
        </Paper>
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mb: 0.7}}><InfoField filling={fillStep < 1} label="Submitter" value={fillStep >= 1 ? formatUserName(currentUserName) : 'Filling...'} /><InfoField filling={fillStep < 2} label="Report Date" value={fillStep >= 2 ? new Date().toLocaleDateString('en-US') : 'Filling...'} /></Box>
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mb: 0.7}}>
          <FieldShell label="Occurrence Date">
            <TextField 
              type="date" 
              fullWidth 
              size="small" 
              variant="standard"
              InputProps={{ disableUnderline: true }}
              defaultValue={new Date().toISOString().split('T')[0]}
              sx={{ height: 38, '& .MuiInputBase-root': { height: '100%', px: 1, fontSize: 14 } }}
            />
          </FieldShell>
          <FieldShell label="Shift"><Select value={fillStep >= 3 ? 'Morning' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Morning">Morning</MenuItem><MenuItem value="Night">Night</MenuItem></Select></FieldShell></Box>
        <FieldShell label="Area"><Select value={fillStep >= 3 ? 'Nexiva' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Nexiva">Nexiva</MenuItem></Select></FieldShell>
        <FieldShell label="Unit"><Select value={fillStep >= 3 ? 'Unit A' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Unit A">Unit A</MenuItem></Select></FieldShell>
        <FieldShell label="Line"><Select value={fillStep >= 3 ? 'Line 1' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Line 1">Line 1</MenuItem></Select></FieldShell>
        <FieldShell label="Observation Location"><Select value={fillStep >= 3 ? 'Product elevator' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Product elevator">Product elevator</MenuItem></Select></FieldShell>
        <FieldShell label="Machine"><Select value={fillStep >= 3 ? 'Industrial Z-54667' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Industrial Z-54667">Industrial Z-54667</MenuItem></Select></FieldShell>
        <FieldShell label="Description of Observation"><Box sx={{position: 'relative'}}><Box sx={{minHeight: 70, px: 1.05, py: 1.05, pr: 3.2, color: '#202124', fontSize: 14.5}}>{descriptionState === 'typing' ? 'My AI Assistant is typing...' : descriptionState === 'filled' ? 'Oil leak on Hydraulic Pump B. Inspection and containment required.' : ''}</Box><IconButton sx={{...esoMicButtonSx, position: 'absolute', right: 8, bottom: 8}}><MicIcon sx={{fontSize: 18}} /></IconButton></Box></FieldShell>
        <Typography sx={{fontSize: 14, fontWeight: 900, color: '#202124', mb: 0.95}}>Classification</Typography>
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1}}><ConditionClassificationCard selected={classification === 'Safe Condition'} label="Safe Condition" onClick={onSelectSafeCondition} /><ConditionClassificationCard selected={classification === 'Unsafe Condition'} label="Unsafe Condition" onClick={() => onSetClassification('Unsafe Condition')} /></Box>
      </Box>
      <BbsFooter disabled={!classification} primaryLabel="Next" onBack={onCancel} onPrimary={onNext} />
    </Box>
  );
}

function NearMissFlow({
  currentUserName,
  descriptionState,
  fillStep,
  mediaAttached,
  onBack,
  onCancel,
  onGoHome,
  onNext,
  onOpenCamera,
  onReady,
  onRetake,
  onSetRecommendation,
  onSetResolutionCategory,
  onSetMediaAttached,
  onSetResolutionStatus,
  onSubmit,
  onUseScan,
  recommendation,
  resolutionCategory,
  resolutionStatus,
  view,
}: {
  currentUserName: string;
  descriptionState: NearMissDescriptionState;
  fillStep: number;
  mediaAttached: boolean;
  onBack: () => void;
  onCancel: () => void;
  onGoHome: () => void;
  onNext: () => void;
  onOpenCamera: () => void;
  onReady: () => void;
  onRetake: () => void;
  onSetRecommendation: (recommendation: string) => void;
  onSetResolutionCategory: (category: string) => void;
  onSetMediaAttached: (attached: boolean) => void;
  onSetResolutionStatus: (status: 'Resolved' | 'Not Resolved' | null) => void;
  onSubmit: () => void;
  onUseScan: () => void;
  recommendation: string;
  resolutionCategory: string;
  resolutionStatus: 'Resolved' | 'Not Resolved' | null;
  view: NearMissView;
}) {
  if (view === 'cameraIntro') return <NearMissCameraIntro onBack={onBack} onReady={onReady} />;
  if (view === 'cameraScan') return <NearMissCameraScan onCancel={onCancel} onRetake={onRetake} onUseScan={onUseScan} />;
  if (view === 'categories') return (
    <ConditionResolutionCategoriesStep
      category={resolutionCategory}
      onBack={onBack}
      onNext={onNext}
      onSelectCategory={onSetResolutionCategory}
      totalSteps={4}
      nextLabel="Next"
    />
  );
  if (view === 'status') return <ConditionResolutionStatusStep mediaAttached={mediaAttached} onAddMedia={() => onSetMediaAttached(true)} onBack={onBack} onNext={onNext} onRecommendationChange={onSetRecommendation} onSetStatus={onSetResolutionStatus} recommendation={recommendation} showLikelihood={false} status={resolutionStatus} />;
  if (view === 'review') return <NearMissReviewStep currentUserName={currentUserName} mediaAttached={mediaAttached} onBack={onBack} onSubmit={onSubmit} recommendation={recommendation} resolutionCategory={resolutionCategory} resolutionStatus={resolutionStatus} />;
  if (view === 'confirmation') return <NearMissConfirmationStep currentUserName={currentUserName} onGoHome={onGoHome} />;

  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.7, minHeight: 0, overflowY: 'auto', pb: 1.2}}>
        <ProgressHeader step={1} width="25%" total={4} />
        <Paper elevation={0} sx={{p: 1.25, borderRadius: 1.3, bgcolor: '#EAF2FF', border: '1px solid #DDE7F4', mb: 1.35, boxShadow: '0 8px 18px rgba(15,23,42,0.08)'}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124'}}>Near Miss</Typography>
          <Typography sx={{fontSize: 12.3, color: '#626465', mt: 0.65, lineHeight: 1.45}}>Fill in the fields to report the near miss and help prevent future incidents.</Typography>
        </Paper>
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mb: 0.7}}><InfoField filling={fillStep < 1} label="Submitter" value={fillStep >= 1 ? formatUserName(currentUserName) : 'Filling...'} /><InfoField filling={fillStep < 2} label="Report Date" value={fillStep >= 2 ? new Date().toLocaleDateString('en-US') : 'Filling...'} /></Box>
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mb: 0.7}}>
          <FieldShell label="Occurrence Date">
            <TextField 
              type="date" 
              fullWidth 
              size="small" 
              variant="standard"
              InputProps={{ disableUnderline: true }}
              defaultValue={new Date().toISOString().split('T')[0]}
              sx={{ height: 38, '& .MuiInputBase-root': { height: '100%', px: 1, fontSize: 14 } }}
            />
          </FieldShell>
          <FieldShell label="Shift"><Select value={fillStep >= 3 ? 'Morning' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Morning">Morning</MenuItem><MenuItem value="Night">Night</MenuItem></Select></FieldShell></Box>
        <FieldShell label="Area"><Select value={fillStep >= 3 ? 'Nexiva' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Nexiva">Nexiva</MenuItem></Select></FieldShell>
        <FieldShell label="Unit"><Select value={fillStep >= 3 ? 'Unit A' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Unit A">Unit A</MenuItem></Select></FieldShell>
        <FieldShell label="Line"><Select value={fillStep >= 3 ? 'Line 1' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Line 1">Line 1</MenuItem></Select></FieldShell>
        <FieldShell label="Observation Location"><Select value={fillStep >= 3 ? 'Product elevator' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Product elevator">Product elevator</MenuItem></Select></FieldShell>
        <FieldShell label="Machine"><Select value={fillStep >= 3 ? 'Industrial Z-54667' : ''} displayEmpty size="small" sx={{height: 38, '& fieldset': {border: 'none'}, fontSize: 14}}><MenuItem value="">Filling...</MenuItem><MenuItem value="Industrial Z-54667">Industrial Z-54667</MenuItem></Select></FieldShell>
        <FieldShell label="Description of Observation"><Box sx={{position: 'relative'}}><Box sx={{minHeight: 76, px: 1.05, py: 1.05, pr: 3.2, color: '#202124', fontSize: 14.5}}>{descriptionState === 'typing' ? 'My AI Assistant is typing...' : descriptionState === 'filled' ? 'Stack of trays leaning slightly off the edge of the workstation. Potential for falling material and injury if bumped during movement.' : ''}</Box><IconButton sx={{...esoMicButtonSx, position: 'absolute', right: 8, bottom: 8}}><MicIcon sx={{fontSize: 18}} /></IconButton></Box></FieldShell>
        {mediaAttached && <CapturedNearMissPreview />}
      </Box>
      <BbsFooter primaryLabel="Next" onBack={onCancel} onPrimary={onNext} />
    </Box>
  );
}

// Utility Components

function ConditionSubmitIcon() {
  return (
    <Box component="span" sx={{display: 'inline-flex', width: 21, height: 21}}>
      <svg viewBox="0 0 20 20" width="21" height="21" aria-hidden="true">
        <path d="M6.75 2.3h6.5l4.2 4.15v6.1l-4.2 4.15h-6.5l-4.2-4.15v-6.1l4.2-4.15Z" fill="none" stroke="#FF9800" strokeWidth="1.55" strokeLinejoin="round"/>
        <path d="M10 5.75v5.3" fill="none" stroke="#FF9800" strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="10" cy="13.65" r="1.08" fill="#FF9800"/>
      </svg>
    </Box>
  );
}

function NearMissSubmitIcon() {
  return (
    <Box component="span" sx={{display: 'inline-flex', width: 21, height: 21}}>
      <svg viewBox="0 0 20 20" width="21" height="21" aria-hidden="true">
        <path d="M8.8 1.95c.42-.75 1.98-.75 2.4 0l.75 1.35c.16.28.46.48.8.53l1.52.22c.84.12 1.33 1.12.8 1.79l-.97 1.21c-.21.26-.29.6-.22.92l.31 1.48c.17.83-.7 1.53-1.46 1.15l-1.39-.69a1.31 1.31 0 0 0-1.16 0l-1.39.69c-.76.38-1.63-.32-1.46-1.15l.31-1.48c.07-.32-.01-.66-.22-.92L4.93 5.84c-.53-.67-.04-1.67.8-1.79l1.52-.22c.34-.05.64-.25.8-.53l.75-1.35Z" fill="#FCE7EA"/>
        <circle cx="10" cy="11.25" r="5.7" fill="none" stroke="#F36A74" strokeWidth="1.6"/>
        <circle cx="10" cy="11.25" r="3.1" fill="none" stroke="#F36A74" strokeWidth="1.45"/>
        <circle cx="10" cy="11.25" r="1.18" fill="#F36A74"/>
      </svg>
    </Box>
  );
}

function BbsSubmitIcon() {
  return (
    <Box component="span" sx={{display: 'inline-flex', width: 21, height: 21}}>
      <svg viewBox="0 0 20 20" width="21" height="21" aria-hidden="true">
        <path d="M10 1.45 15.95 3.8c.4.16.67.55.67.98v4.58c0 3.63-2.56 6.93-6.02 7.79a1.8 1.8 0 0 1-.88 0C6.26 16.29 3.7 12.99 3.7 9.36V4.78c0-.43.27-.82.67-.98L10 1.45Z" fill="#18A7F0"/>
        <path d="m7.35 10.08 1.76 1.78 3.58-4.08" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </Box>
  );
}

function AssistantCard({active, onAccept, onDismiss, subtitle}: {active?: boolean; onAccept: () => void; onDismiss?: () => void; subtitle?: string}) {
  const helperText = subtitle ?? (active ? 'Chat is open on the right.' : 'Would you like assistance here?');
  return (
    <Paper elevation={0} onClick={onAccept} sx={{p: 1.2, borderRadius: 1.7, bgcolor: active ? '#F8FBFF' : '#EEF4FF', border: '1px solid #D7E5FF', mb: 1.35, cursor: 'pointer', '&:hover': {bgcolor: active ? '#F3F8FF' : '#EAF2FF'}}}>
      <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2}}>
        <Box>
          <Typography sx={{fontSize: 13, fontWeight: 900, color: '#044ED7', display: 'flex', alignItems: 'center', gap: 0.45}}><AutoAwesomeIcon sx={{fontSize: 15, color: '#FF6E00'}} />My AI Assistant</Typography>
          <Typography sx={{fontSize: 12, color: '#1F4AA8', mt: 0.4}}>{helperText}</Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0}}><IconButton onClick={(e) => { e.stopPropagation(); onDismiss?.(); }} size="small"><CloseIcon sx={{fontSize: 18}} /></IconButton><IconButton onClick={(e) => { e.stopPropagation(); onAccept(); }} size="small"><CheckCircleOutlineIcon sx={{fontSize: 20}} /></IconButton></Box>
      </Box>
    </Paper>
  );
}

function ShiftEntryAssistantChat({
  assistantStep,
  bbsFillStep,
  mode,
  onAcceptPrefill,
  onClose,
  onOpenBbs,
  onOpenCondition,
  onOpenNearMiss,
}: {
  assistantStep: AssistantStep;
  bbsFillStep: number;
  mode: 'eso' | 'bbs' | 'condition' | 'nearMiss';
  onAcceptPrefill: () => void;
  onClose: () => void;
  onOpenBbs: () => void;
  onOpenCondition: () => void;
  onOpenNearMiss: () => void;
}) {
  return (
    <Box sx={{height: '100%', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', bgcolor: '#F8FBFF'}}>
      <Box sx={{p: 1.6, borderBottom: '1px solid #DDE7F4', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'space-between'}}>
        <Box><Typography sx={{fontSize: 17, fontWeight: 900, color: '#044ED7', display: 'flex', alignItems: 'center', gap: 0.55}}><AutoAwesomeIcon sx={{fontSize: 18, color: '#FF7A00'}} />My AI Assistant</Typography><Typography sx={{fontSize: 12, color: '#667085'}}>Operations Entry support</Typography></Box>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{fontSize: 18}} /></IconButton>
      </Box>
      <Box sx={{p: 1.4, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 1}}>
        {assistantStep === 0 && <AssistantTypingBubble align="flex-end" label="You" />}
        {assistantStep >= 1 && <ChatBubble align="flex-end" label="You">{mode === 'eso' ? 'There was a stack of trays leaning near the edge of the workstation. Nobody got hurt, but it could have fallen if someone bumped the table.' : 'Help me open an ESO and fill the right report for my shift.'}</ChatBubble>}
        {assistantStep === 2 && <AssistantTypingBubble label="My AI Assistant" />}
        {assistantStep >= 3 && <ChatBubble label="My AI Assistant">{mode === 'eso' ? 'Based on your description, I recommend creating a Near Miss. There was potential harm, but no injury occurred. I can start that report and prefill the hazard details for you.' : 'Sure. Which ESO report do you want to open? I can prepare the form and prefill the first fields from your workstation context.'}</ChatBubble>}
        {assistantStep >= 3 && mode === 'eso' && (
          <Paper elevation={0} sx={{p: 1.1, border: '1px solid #DDE7F4', borderRadius: 1.4, bgcolor: '#FFFFFF'}}>
            <Typography sx={{fontSize: 12, color: '#667085', fontWeight: 900, mb: 0.8}}>Recommended report</Typography>
            <Button fullWidth variant="contained" startIcon={<NearMissIcon />} onClick={onOpenNearMiss} sx={{height: 36, mb: 0.8}}>Create Near Miss</Button>
            <Typography sx={{fontSize: 11.5, color: '#667085', fontWeight: 900, mb: 0.65}}>Choose another type</Typography>
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.6}}><Button variant="outlined" startIcon={<ShieldIcon />} onClick={onOpenBbs}>BBS</Button><Button variant="outlined" startIcon={<ErrorIcon />} onClick={onOpenCondition}>Condition</Button></Box>
          </Paper>
        )}
        {assistantStep >= 4 && <AssistantTypingBubble label="My AI Assistant" />}
        {assistantStep >= 5 && <ChatBubble label="My AI Assistant">{mode === 'condition' ? 'Opening Condition Report. I prefilled details from context.' : mode === 'nearMiss' ? 'Opening Near Miss. Ready for verification.' : 'Opening BBS Observation. Prefilling context.'}</ChatBubble>}
        {mode === 'bbs' && (
          <Paper elevation={0} sx={{p: 1.1, borderRadius: 1.4, border: '1px solid #DDE7F4', bgcolor: '#FFFFFF'}}>
            <Typography sx={{fontSize: 12, color: '#044ED7', fontWeight: 900, mb: 0.8}}>Prefill progress</Typography>
            <PrefillRow done={bbsFillStep >= 1} label="Observer profile" /><PrefillRow done={bbsFillStep >= 2} label="Report dates" /><PrefillRow done={bbsFillStep >= 3} label="Area context" /><PrefillRow done={bbsFillStep >= 4} label="Personnel count" />
          </Paper>
        )}
        {assistantStep >= 5 && (mode === 'condition' || mode === 'nearMiss') && <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7}}><Button variant="contained" onClick={onAcceptPrefill}>Accept prefill</Button><Button variant="outlined" onClick={onAcceptPrefill}>Adjust fields</Button></Box>}
      </Box>
      <Box sx={{p: 1.2, borderTop: '1px solid #DDE7F4', bgcolor: '#FFFFFF'}}><Typography sx={{fontSize: 11.5, color: '#667085'}}>Continue editing while assistant suggests next steps.</Typography></Box>
    </Box>
  );
}

function ChatBubble({align = 'flex-start', children, label}: {align?: 'flex-start' | 'flex-end'; children: ReactNode; label: string}) {
  const isUser = align === 'flex-end';
  return (
    <Box sx={{alignSelf: align, maxWidth: '88%', px: 1.25, py: 1, borderRadius: 1.8, bgcolor: isUser ? '#0B63E5' : '#FFFFFF', color: isUser ? '#FFFFFF' : '#1F2937', border: isUser ? 'none' : '1px solid #DDE7F4'}}>
      <Typography sx={{fontSize: 11.5, fontWeight: 900, color: isUser ? 'rgba(255,255,255,0.78)' : '#044ED7', mb: 0.35}}>{label}</Typography>
      <Typography sx={{fontSize: 12.5, lineHeight: 1.45}}>{children}</Typography>
    </Box>
  );
}

function AssistantTypingBubble({align = 'flex-start', label}: {align?: 'flex-start' | 'flex-end'; label: string}) {
  const isUser = align === 'flex-end';
  return (
    <Box sx={{alignSelf: align, maxWidth: '80%', px: 1.25, py: 1, borderRadius: 1.8, bgcolor: isUser ? '#0B63E5' : '#FFFFFF', border: isUser ? 'none' : '1px solid #DDE7F4'}}>
      <Typography sx={{fontSize: 11.5, fontWeight: 900, color: isUser ? 'rgba(255,255,255,0.78)' : '#044ED7', mb: 0.35}}>{label}</Typography>
      <Box sx={{display: 'flex', gap: 0.45, height: 18, alignItems: 'center'}}>{[0, 1, 2].map((i) => <Box key={i} sx={{width: 6, height: 6, borderRadius: '50%', bgcolor: isUser ? '#FFFFFF' : '#0B63E5'}} />)}</Box>
    </Box>
  );
}

function PrefillRow({done, label}: {done: boolean; label: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, py: 0.35}}>
      <Box sx={{width: 15, height: 15, borderRadius: '50%', bgcolor: done ? '#22C55E' : '#DDE7F4', color: '#FFFFFF', display: 'grid', placeItems: 'center'}}>{done && <CheckIcon sx={{fontSize: 11}} />}</Box>
      <Typography sx={{fontSize: 12, color: done ? '#1F2937' : '#8A93A6'}}>{label}</Typography>
    </Box>
  );
}

function CategoryRowCard({row, onOpenPpe}: {row: any; onOpenPpe: () => void}) {
  const isPpe = row.title === 'PPE';
  return (
    <Paper elevation={0} onClick={isPpe ? onOpenPpe : undefined} sx={{height: 37, px: 1, borderRadius: 1, bgcolor: '#F7F8FA', display: 'grid', gridTemplateColumns: '28px 1fr auto auto auto', alignItems: 'center', gap: 0.6, cursor: isPpe ? 'pointer' : 'default'}}>
      <Box sx={{color: '#246BFE', display: 'grid', placeItems: 'center'}}>{row.icon}</Box>
      <Typography sx={{fontSize: 15, color: '#202124'}}>{row.title}</Typography>
      {row.positive && <CategoryCount tone="good" value={row.positive} />}
      {row.negative && <CategoryCount tone="bad" value={row.negative} />}
      <ArrowRightIcon sx={{fontSize: 20, color: '#626465'}} />
    </Paper>
  );
}

function ProgressHeader({step, total = 6, width}: {step: number; total?: number; width: string}) {
  return (
    <>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5}}>
        <Typography sx={{fontSize: 11, color: '#626465', letterSpacing: 1.4}}>PROGRESS</Typography>
        <Typography sx={{fontSize: 12, color: '#0B63E5'}}>{step} OF {total}</Typography>
      </Box>
      <Box sx={{height: 4, borderRadius: 999, bgcolor: '#BFD2F4', mb: 0.8, overflow: 'hidden'}}><Box sx={{width, height: '100%', bgcolor: '#246BFE'}} /></Box>
    </>
  );
}

function CategoryCount({tone, value}: {tone: 'good' | 'bad'; value: number}) {
  const good = tone === 'good';
  return (
    <Box sx={{minWidth: 50, height: 28, px: 1, borderRadius: 999, bgcolor: good ? '#D7F3DD' : '#FFD9DE', color: good ? '#16843A' : '#E43B46', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.35, fontWeight: 900}}>
      {good ? <CheckIcon sx={{fontSize: 15}} /> : <CloseIcon sx={{fontSize: 15}} />}
      <Typography sx={{fontSize: 14, fontWeight: 900}}>{value}</Typography>
    </Box>
  );
}

function BbsFooter({disabled = false, onBack, onPrimary, primaryLabel}: {disabled?: boolean; onBack: () => void; onPrimary: () => void; primaryLabel: string}) {
  return (
    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 0.8, px: 0.7, py: 1, bgcolor: '#FFFFFF', borderTop: '1px solid #E5EAF3'}}>
      <Button variant="outlined" startIcon={<ArrowLeftIcon />} onClick={onBack} sx={{height: 40, borderRadius: 1.2, borderColor: '#7EA7FF', color: '#0B63E5', fontWeight: 900}}>Back</Button>
      <Button disabled={disabled} variant="contained" endIcon={<ArrowRightIcon />} onClick={onPrimary} sx={{height: 40, borderRadius: 1.2, bgcolor: '#246BFE', fontWeight: 900, boxShadow: 'none'}}> {primaryLabel} </Button>
    </Box>
  );
}

function ReviewCount({label, tone, value}: {label: string; tone: 'safe' | 'unsafe'; value: string}) {
  const safe = tone === 'safe';
  return (
    <Paper elevation={0} sx={{height: 60, p: 0.9, borderRadius: 1, bgcolor: '#F7F8FA', borderLeft: `5px solid ${safe ? '#35B65F' : '#F04438'}`}}>
      <Typography sx={{fontSize: 12, color: '#626465'}}>{label}</Typography>
      <Typography sx={{fontSize: 23, fontWeight: 900, color: '#202124', lineHeight: 1.2}}>{value}</Typography>
    </Paper>
  );
}

function ReviewSection({children, icon, onEdit, title}: {children: ReactNode; icon?: ReactNode; onEdit: () => void; title: string}) {
  return (
    <Box sx={{mb: 1.35}}>
      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.65, mb: 0.8}}>
        {icon && <Box sx={{color: '#246BFE', display: 'grid', placeItems: 'center'}}>{icon}</Box>}
        <Typography sx={{fontSize: 19, fontWeight: 900, color: '#202124', flex: 1}}>{title}</Typography>
        <IconButton onClick={onEdit} size="small" sx={{p: 0.2, color: '#246BFE'}}>
          <EditOutlinedIcon sx={{fontSize: 16}} />
        </IconButton>
      </Box>
      {children}
    </Box>
  );
}

function ReviewInfo({label, value}: {label: string; value: string}) {
  return (
    <Paper elevation={0} sx={{height: 52, px: 1.05, py: 0.8, borderRadius: 1, bgcolor: '#F0F1F3'}}>
      <Typography sx={{fontSize: 11.5, color: '#626465', mb: 0.25}}>{label}</Typography>
      <Typography sx={{fontSize: 15, color: '#202124'}}>{value}</Typography>
    </Paper>
  );
}

function ReviewPill({label}: {label: string}) {
  return (
    <Box sx={{height: 25, px: 1, borderRadius: 999, bgcolor: '#EEF0F2', color: '#202124', display: 'inline-flex', alignItems: 'center', fontSize: 12.5}}>
      {label}
    </Box>
  );
}

function StatusPill({status}: {status: 'SAFE' | 'UNSAFE'}) {
  const safe = status === 'SAFE';
  return (
    <Box sx={{height: 30, px: 1.2, borderRadius: 999, bgcolor: safe ? '#CDEECD' : '#FFD9DE', color: safe ? '#1F7A35' : '#E43B46', display: 'inline-flex', alignItems: 'center', fontSize: 12, fontWeight: 900}}>
      {status}
    </Box>
  );
}

function ReportOption({active = false, icon, onClick, subtitle, title}: {active?: boolean; icon: ReactNode; onClick?: () => void; subtitle?: string; title: string}) {
  return (
    <Paper elevation={0} onClick={onClick} sx={{minHeight: subtitle ? 56 : 39, px: 1.5, py: subtitle ? 1.1 : 0.8, borderRadius: 1.2, bgcolor: active ? '#E5EEFF' : '#F8FAFC', border: '1px solid #F1F4F8', display: 'grid', gridTemplateColumns: '48px minmax(0, 1fr) auto', alignItems: 'center', cursor: onClick ? 'pointer' : 'default', boxShadow: '0 2px 8px rgba(15,23,42,0.04)'}}>
      <Box sx={{display: 'grid', placeItems: 'center'}}>{icon}</Box>
      <Box><Typography sx={{fontSize: 15, fontWeight: 900, color: '#202124', lineHeight: 1.15}}>{title}</Typography>{subtitle && <Typography sx={{fontSize: 11.8, color: '#626465', mt: 0.45, lineHeight: 1.25}}>{subtitle}</Typography>}</Box>
      <ArrowRightIcon sx={{fontSize: 20, color: '#626465'}} />
    </Paper>
  );
}

function PersonnelCountRow({label, onAdd, onRemove, subtitle, value}: {label: string; onAdd: () => void; onRemove: () => void; subtitle: string; value: number}) {
  const showDelete = value === 1;
  const showSubtract = value >= 2;
  return (
    <Paper elevation={0} sx={{height: 51, px: 1.2, mb: 0.8, borderRadius: 1, border: '1px solid #DDE7F4', display: 'grid', gridTemplateColumns: '1fr auto auto auto', alignItems: 'center', gap: 0.8, boxShadow: '0 3px 12px rgba(15,23,42,0.05)'}}>
      <Box><Typography sx={{fontSize: 13, fontWeight: 900, color: '#202124'}}>{label}</Typography><Typography sx={{fontSize: 11, color: '#626465', mt: 0.1}}>{subtitle}</Typography></Box>
      {showDelete && <IconButton size="small" onClick={onRemove} sx={{width: 25, height: 25, color: '#FF2E2E'}}><DeleteIcon sx={{fontSize: 18}} /></IconButton>}
      {showSubtract && <IconButton size="small" onClick={onRemove} sx={{width: 24, height: 24, color: '#246BFE'}}><RemoveCircleIcon sx={{fontSize: 18}} /></IconButton>}
      {!showDelete && !showSubtract && <Box sx={{width: 25, height: 25}} />}
      <Typography sx={{fontSize: 16, color: '#626465'}}>{value}</Typography>
      <IconButton size="small" onClick={onAdd} sx={{width: 24, height: 24, bgcolor: '#246BFE', color: '#FFFFFF'}}><AddIcon sx={{fontSize: 17}} /></IconButton>
    </Paper>
  );
}

function InfoField({filling = false, label, value}: {filling?: boolean; label: string; value: string}) {
  return (
    <Box sx={{height: 44, px: 1, py: 0.55, mb: 0.2, borderRadius: 1, bgcolor: filling ? '#EEF4FF' : '#E8E8E8', border: filling ? '1px solid #BFD2F4' : '1px solid transparent', overflow: 'hidden'}}>
      <Typography sx={{fontSize: 9, color: '#8A93A6', lineHeight: 1.1}}>{label}</Typography>
      <Typography sx={{fontSize: 12, color: '#111827', mt: 0.35, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{value}</Typography>
    </Box>
  );
}

function FieldShell({children, label}: {children: ReactNode; label: string}) {
  return (
    <Box sx={{border: '1px solid #D9DEE8', borderRadius: 1.1, mb: 1.15, mt: 1.2, position: 'relative', bgcolor: '#FFFFFF'}}>
      <Typography sx={{position: 'absolute', top: -10, left: 9, zIndex: 2, px: 0.55, bgcolor: '#FFFFFF', fontSize: 9.5, color: '#8A93A6'}}>{label}</Typography>
      {children}
    </Box>
  );
}

function ConditionClassificationCard({label, onClick, selected}: {label: string; onClick: () => void; selected?: boolean}) {
  const unsafe = label === 'Unsafe Condition';
  const color = unsafe ? '#EF1F2D' : '#35A852';
  return (
    <Paper elevation={0} onClick={onClick} sx={{height: 82, borderRadius: 1.2, border: selected ? `1px solid ${color}` : '1px solid transparent', bgcolor: selected ? (unsafe ? '#FFF5F5' : '#F4FFF5') : '#F7F8FA', display: 'grid', placeItems: 'center', cursor: 'pointer'}}>
      <Box sx={{textAlign: 'center'}}><ShieldIcon sx={{fontSize: 20, color: selected ? color : '#7B818A', mb: 0.55}} /><Typography sx={{fontSize: 15, color: selected ? color : '#202124'}}>{label}</Typography></Box>
    </Paper>
  );
}

function ConditionResolutionCategoriesStep({
  category,
  descriptionEntity = 'issue',
  onBack,
  onNext,
  onSelectCategory,
  totalSteps = 4,
  nextLabel = 'Next',
}: {
  category: string;
  descriptionEntity?: 'issue' | 'condition';
  onBack: () => void;
  onNext: () => void;
  onSelectCategory: (category: string) => void;
  totalSteps?: 3 | 4;
  nextLabel?: string;
}) {
  const resolutionCategories = [
    '5S / Housekeeping / Zoning',
    'Bloodborne Pathogens / Biosafety',
    'Chemical Safety',
    'Confined Spaces',
    'Contractors / Visitors',
    'Cranes/ Lifts / Hoists',
    'Electrical Safety',
    'Environmental Stewardship',
    'Ergonomics',
    'Facilities / Building / Structure',
    'Fall Protection',
    'Lockout / Tagout',
    'Machine Guarding',
    'Mobile Equipment',
    'Personal Protective Equipment (PPE)',
    'Security',
    'Walking / Slip, Trip, Fall',
    'Work Environment (Light, Noise, etc.)',
  ];
  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.7}}><ProgressHeader step={2} width={totalSteps === 3 ? '66.6%' : '50%'} total={totalSteps} />
        <Paper elevation={0} sx={{p: 1.45, borderRadius: 1.3, bgcolor: '#EAF2FF', border: '1px solid #DDE7F4', mb: 1.55, boxShadow: '0 8px 18px rgba(15,23,42,0.08)'}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124'}}>Categories</Typography>
          <Typography sx={{fontSize: 12.3, color: '#626465', mt: 0.65, lineHeight: 1.45}}>Select the category that best describes the {descriptionEntity}.</Typography>
          <Typography sx={{fontSize: 13, color: '#0B63E5', fontWeight: 900, mt: 1.65, display: 'flex', alignItems: 'center', gap: 0.45}}><AutoAwesomeIcon sx={{fontSize: 17, color: '#FF7A00'}} />CATEGORY SELECT BY ATLAS.AI<CheckIcon sx={{fontSize: 18}} /></Typography>
        </Paper>
        <Typography sx={{fontSize: 12.5, fontWeight: 900, color: '#202124', mb: 0.7}}>Categories</Typography>
        <Box sx={{display: 'grid', gap: 0.65}}>
          {resolutionCategories.map((item) => {
            const selected = category === item;
            return (
              <Paper
                key={item}
                elevation={0}
                onClick={() => onSelectCategory(item)}
                sx={{minHeight: 39, px: 1.15, borderRadius: 0.7, bgcolor: '#F7F8FA', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 28px', alignItems: 'center', cursor: 'pointer'}}
              >
                <Typography sx={{fontSize: 14.5, color: '#202124'}}>{item}</Typography>
                <Box
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: `2px solid ${selected ? '#246BFE' : '#7B818A'}`,
                    bgcolor: '#FFFFFF',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  {selected && <Box sx={{width: 8, height: 8, borderRadius: '50%', bgcolor: '#246BFE'}} />}
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
      <BbsFooter primaryLabel={nextLabel} onBack={onBack} onPrimary={onNext} />
    </Box>
  );
}

function ConditionResolutionStatusStep({
  mediaAttached,
  onAddMedia,
  onBack,
  onNext,
  onRecommendationChange,
  onSetStatus,
  recommendation,
  showLikelihood = true,
  status,
}: {
  mediaAttached: boolean;
  onAddMedia: () => void;
  onBack: () => void;
  onNext: () => void;
  onRecommendationChange: (recommendation: string) => void;
  onSetStatus: (s: any) => void;
  recommendation: string;
  showLikelihood?: boolean;
  status: any;
}) {
  const resolved = status === 'Resolved';
  const unresolved = status === 'Not Resolved';
  const hasRecommendation = Boolean(recommendation.trim());
  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.7, minHeight: 0, overflowY: 'auto', pb: 1.2}}><ProgressHeader step={3} width="75%" total={4} />
        <Paper elevation={0} sx={{p: 1.45, borderRadius: 1.3, bgcolor: '#EAF2FF', border: '1px solid #DDE7F4', mb: 2.3, boxShadow: '0 8px 18px rgba(15,23,42,0.08)'}}><Typography sx={{fontSize: 18, fontWeight: 900, color: '#202124'}}>Resolution Status</Typography><Typography sx={{fontSize: 12.3, color: '#626465', mt: 0.65, lineHeight: 1.45}}>What is the current status of the issue?</Typography></Paper>
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.8, mb: 2}}><ResolutionStatusCard active={resolved} label="Resolved" onClick={() => onSetStatus('Resolved')} /><ResolutionStatusCard active={unresolved} label="Not Resolved" onClick={() => onSetStatus('Not Resolved')} /></Box>
        {resolved && <ResolvedDetails onRecommendationChange={onRecommendationChange} recommendation={recommendation} />}
        {unresolved && <NotResolvedDetails mediaAttached={mediaAttached} onAddMedia={onAddMedia} onRecommendationChange={onRecommendationChange} recommendation={recommendation} showLikelihood={showLikelihood} />}
      </Box>
      <BbsFooter disabled={!hasRecommendation || (!resolved && !unresolved)} primaryLabel="Next" onBack={onBack} onPrimary={onNext} />
    </Box>
  );
}

function ResolutionStatusCard({active, label, onClick}: {active: boolean; label: 'Resolved' | 'Not Resolved'; onClick: () => void}) {
  const resolved = label === 'Resolved';
  const color = resolved ? '#35A852' : '#EF1F2D';
  return (
    <Paper elevation={0} onClick={onClick} sx={{height: 82, borderRadius: 1.2, border: active ? `1px solid ${color}` : '1px solid transparent', bgcolor: active ? (resolved ? '#F4FFF5' : '#FFF5F5') : '#F7F8FA', color: active ? color : '#202124', display: 'grid', placeItems: 'center', cursor: 'pointer'}}>
      <Box sx={{textAlign: 'center'}}><Box sx={{width: 20, height: 20, borderRadius: '50%', mx: 'auto', mb: 0.75, bgcolor: active ? color : '#7B818A', color: '#FFFFFF', display: 'grid', placeItems: 'center'}}>{resolved ? <CheckIcon sx={{fontSize: 15}} /> : <CloseIcon sx={{fontSize: 14}} />}</Box><Typography sx={{fontSize: 15.5, color: active ? color : '#202124'}}>{label}</Typography></Box>
    </Paper>
  );
}

function NotResolvedDetails({
  mediaAttached,
  onAddMedia,
  onRecommendationChange,
  recommendation,
  showLikelihood = true,
}: {
  mediaAttached: boolean;
  onAddMedia: () => void;
  onRecommendationChange: (recommendation: string) => void;
  recommendation: string;
  showLikelihood?: boolean;
}) {
  const [likelihoodLevel, setLikelihoodLevel] = useState<number>(0);
  const [severityLevel, setSeverityLevel] = useState<number>(0);
  const [recommendationItems, setRecommendationItems] = useState<string[]>(() => parseRecommendationItems(recommendation));
  const [isExplorerOpen, setIsExplorerOpen] = useState(false);
  const [selectedMockFile, setSelectedMockFile] = useState<(typeof mockExplorerFiles)[number] | null>(null);

  useEffect(() => {
    setRecommendationItems(parseRecommendationItems(recommendation));
  }, [recommendation]);

  useEffect(() => {
    onRecommendationChange(serializeRecommendationItems(recommendationItems));
  }, [recommendationItems, onRecommendationChange]);

  const updateRecommendationItem = (index: number, value: string) => {
    setRecommendationItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const removeRecommendationItem = (index: number) => {
    setRecommendationItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const addRecommendationItem = () => {
    setRecommendationItems((prev) => [...prev, '']);
  };

  const applyVoiceRecommendation = (index: number) => {
    const voiceDraft = 'Identify and correct root cause, then confirm area is safe before restart.';
    setRecommendationItems((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? (item.trim() ? `${item.trim()} ${voiceDraft}` : voiceDraft) : item
    )));
  };

  const fillWithBluAi = () => {
    setRecommendationItems(defaultRecommendationItems);
  };

  const handleMockUpload = () => {
    if (!selectedMockFile) return;
    onAddMedia();
    setIsExplorerOpen(false);
  };

  return (
    <Box sx={{display: 'grid', gap: 1.25}}>
      {showLikelihood ? (
        <IncidentRiskSlider
          level={likelihoodLevel}
          labels={['Not Likely', 'Could happen', 'Will Happen']}
          messageByLevel={[
            'Exposure is infrequent and controls are in place',
            'Harm may occur if the condition persists during normal use',
            'Harm may occur at any time without additional controls',
          ]}
          subtitle="When could this cause harm?"
          title="Likelihood of incident"
          onChange={setLikelihoodLevel}
        />
      ) : null}
      <IncidentRiskSlider
        level={severityLevel}
        labels={['Minor', 'Serious injury', 'Severe injury']}
        messageByLevel={[
          'No injury, or minor reversible injury',
          'Reversible injury may require medical intervention',
          'May result in serious of life-threatening injury',
        ]}
        subtitle="How bad could it be?"
        title="Potential severity of incident"
        onChange={setSeverityLevel}
      />
      <Paper elevation={0} sx={{p: 1.1, borderRadius: 1.25, border: '1px solid #CDD4DE', bgcolor: '#ECEFF3'}}>
        <Typography sx={{fontSize: 14, fontWeight: 900, color: '#202124', mb: 0.95}}>Recommended Actions</Typography>
        <Box sx={{display: 'grid', gap: 0.8}}>
          {recommendationItems.map((item, index) => (
            <Paper key={`recommendation-${index}`} elevation={0} sx={{p: 0.7, borderRadius: 1.05, border: '1px solid #BDC5D0', bgcolor: '#F2F4F7'}}>
              <Box sx={{display: 'grid', gridTemplateColumns: '20px minmax(0, 1fr) 22px 22px', alignItems: 'center', gap: 0.7}}>
                <Box sx={{width: 20, height: 20, borderRadius: '50%', bgcolor: '#246BFE', color: '#FFFFFF', fontSize: 11, fontWeight: 900, display: 'grid', placeItems: 'center'}}>
                  {index + 1}
                </Box>
                <TextField
                  fullWidth
                  placeholder="Enter recommendation"
                  value={item}
                  onChange={(event) => updateRecommendationItem(index, event.target.value)}
                  variant="standard"
                  InputProps={{disableUnderline: true}}
                  sx={{
                    '& .MuiInputBase-root': {fontSize: 15, color: '#202124', lineHeight: 1.35},
                    '& .MuiInputBase-input::placeholder': {color: '#8B93A1', opacity: 1},
                  }}
                />
                <IconButton
                  onClick={() => removeRecommendationItem(index)}
                  sx={{width: 20, height: 20, color: item.trim() ? '#E53935' : '#C6CBD3'}}
                >
                  <DeleteIcon sx={{fontSize: 18}} />
                </IconButton>
                <IconButton onClick={() => applyVoiceRecommendation(index)} sx={esoMicButtonSx}>
                  <MicIcon sx={{fontSize: 18}} />
                </IconButton>
              </Box>
            </Paper>
          ))}
          <Button
            onClick={addRecommendationItem}
            sx={{height: 36, borderRadius: 1, color: '#246BFE', fontWeight: 900, justifyContent: 'center', px: 0.1, alignSelf: 'center'}}
          >
            ADD ANOTHER RECOMMENDATION
          </Button>
          <Button
            variant="outlined"
            onClick={fillWithBluAi}
            sx={{height: 40, borderRadius: 1.2, borderColor: '#8BB0FF', color: '#246BFE', fontWeight: 900}}
          >
            <AutoAwesomeIcon sx={{fontSize: 18, color: '#FF8A00', mr: 0.8}} />
            FILL WITH ATLAS.AI
          </Button>
        </Box>
      </Paper>
      <Typography sx={{fontSize: 14, fontWeight: 900, color: '#202124'}}>Media Capture <Box component="span" sx={{color: '#6B7280', fontWeight: 700}}>(optional)</Box></Typography>
      <Box>
        <Button variant="contained" startIcon={<UploadFileIcon />} onClick={() => setIsExplorerOpen(true)} sx={{height: 40, borderRadius: 1.2, bgcolor: '#246BFE', fontWeight: 900, color: '#FFFFFF'}}>
          {mediaAttached ? '1 FILE ATTACHED' : 'UPLOAD'}
        </Button>
        <Typography sx={{fontSize: 11.5, color: '#626465', mt: 1, lineHeight: 1.45}}>
          Supported formats: PNG, JPG, and MP4. Maximum allowed size: 50 MB combined across all attachments.
        </Typography>
      </Box>
      <Dialog
        open={isExplorerOpen}
        onClose={(_, reason) => {
          if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
          setIsExplorerOpen(false);
        }}
        maxWidth="md"
        fullWidth
        hideBackdrop
        disableEscapeKeyDown
        sx={{
          zIndex: 2000,
          '& .MuiDialog-container': {
            alignItems: 'center',
            justifyContent: 'center',
          },
          '& .MuiDialog-root': {
            zIndex: 2000,
          },
        }}
        PaperProps={{
          sx: {
            height: 600,
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 2001,
          },
        }}
      >
        <Box sx={{ bgcolor: '#f3f3f3', px: 2, py: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #e5e5e5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <CloudUploadIcon sx={{ color: '#0078d4', fontSize: 18 }} />
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 500, color: '#333' }}>Open File</Typography>
          </Box>
          <Box sx={{ display: 'flex' }}>
            <IconButton size="small" sx={{ borderRadius: 0, px: 1.5, '&:hover': { bgcolor: '#e5e5e5' } }}><Box sx={{ width: 10, height: 1, bgcolor: '#333' }} /></IconButton>
            <IconButton size="small" sx={{ borderRadius: 0, px: 1.5, '&:hover': { bgcolor: '#e5e5e5' } }}><Box sx={{ width: 10, height: 10, border: '1px solid #333' }} /></IconButton>
            <IconButton size="small" onClick={() => setIsExplorerOpen(false)} sx={{ borderRadius: 0, px: 1.5, '&:hover': { bgcolor: '#e81123', color: 'white' } }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#ffffff' }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" disabled><ExplorerBackIcon sx={{ fontSize: 16 }} /></IconButton>
            <IconButton size="small" disabled><ArrowUpwardIcon sx={{ fontSize: 16 }} /></IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, bgcolor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 1, px: 1.5, py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FolderIcon sx={{ color: '#0078d4', fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#666' }}>This PC &gt; Documents &gt; Corporate Cloud</Typography>
          </Box>
          <Box sx={{ width: 220, bgcolor: '#f9f9f9', border: '1px solid #e5e5e5', borderRadius: 1, px: 1, py: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchIcon sx={{ color: '#666', fontSize: 16 }} />
            <Typography sx={{ fontSize: '0.75rem', color: '#aaa' }}>Search Corp Documents</Typography>
          </Box>
        </Box>
        <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
          <Box sx={{ width: 180, bgcolor: '#f3f3f3', borderRight: '1px solid #e5e5e5', pt: 1 }}>
            <List dense disablePadding>
              {['Quick Access', 'Desktop', 'Downloads', 'Documents', 'Pictures'].map((folder) => (
                <ListItemButton key={folder} sx={{ py: 0.5, px: 2 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}><FolderIcon sx={{ color: '#0078d4', fontSize: 18 }} /></ListItemIcon>
                  <ListItemText primary={folder} primaryTypographyProps={{ fontSize: '0.75rem', fontWeight: folder === 'Documents' ? 700 : 500 }} />
                </ListItemButton>
              ))}
            </List>
          </Box>
          <Box sx={{ flexGrow: 1, p: 2, bgcolor: '#ffffff', overflowY: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { borderBottom: '1px solid #f0f0f0', fontWeight: 600, fontSize: '0.75rem', color: '#666', py: 0.5 } }}>
                  <TableCell>Name</TableCell>
                  <TableCell>Date Modified</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockExplorerFiles.map((file) => (
                  <TableRow
                    key={file.name}
                    hover
                    selected={selectedMockFile?.name === file.name}
                    onClick={() => setSelectedMockFile(file)}
                    sx={{ cursor: 'pointer', '&.Mui-selected': { bgcolor: '#e5f3ff', '&:hover': { bgcolor: '#cce8ff' } } }}
                  >
                    <TableCell sx={{ py: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DescriptionIcon sx={{ fontSize: 18, color: '#044ED7' }} />
                        <Typography sx={{ fontSize: '0.75rem' }}>{file.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: '#666' }}>{file.modified}</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: '#666' }}>{file.type} File</TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: '#666' }}>{file.size}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Box>
        <Box sx={{ p: 2, borderTop: '1px solid #e5e5e5', bgcolor: '#f3f3f3', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: '0.75rem', width: 80 }}>File name:</Typography>
            <TextField fullWidth size="small" value={selectedMockFile?.name || ''} sx={{ bgcolor: '#ffffff' }} InputProps={{ sx: { fontSize: '0.75rem', height: 28 } }} />
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
              <Typography sx={{ fontSize: '0.75rem', width: 80 }}>File type:</Typography>
              <FormControl size="small" sx={{ width: 220, bgcolor: '#ffffff' }}>
                <Select value="All files" disabled sx={{ height: 28, fontSize: '0.75rem' }}>
                  <MenuItem value="All files">All Enterprise Files (*.*)</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Button variant="contained" size="small" onClick={handleMockUpload} disabled={!selectedMockFile} sx={{ bgcolor: '#0078d4', borderRadius: 0.5, px: 4, textTransform: 'none', fontSize: '0.75rem', boxShadow: 'none', '&:hover': { bgcolor: '#005a9e', boxShadow: 'none' } }}>
                Open
              </Button>
              <Button variant="outlined" size="small" onClick={() => setIsExplorerOpen(false)} sx={{ border: '1px solid #bdbdbd', color: '#333', borderRadius: 0.5, px: 4, textTransform: 'none', fontSize: '0.75rem', '&:hover': { bgcolor: '#e5e5e5', borderColor: '#bdbdbd' } }}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}

function ResolvedDetails({
  onRecommendationChange,
  recommendation,
}: {
  onRecommendationChange: (recommendation: string) => void;
  recommendation: string;
}) {
  const [actionItems, setActionItems] = useState<string[]>(() => parseRecommendationItems(recommendation));

  useEffect(() => {
    setActionItems(parseRecommendationItems(recommendation));
  }, [recommendation]);

  useEffect(() => {
    onRecommendationChange(serializeRecommendationItems(actionItems));
  }, [actionItems, onRecommendationChange]);

  const updateActionItem = (index: number, value: string) => {
    setActionItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  const removeActionItem = (index: number) => {
    setActionItems((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const addActionItem = () => {
    setActionItems((prev) => [...prev, '']);
  };

  const applyVoiceAction = (index: number) => {
    const voiceDraft = 'Issue corrected, area checked, and safe conditions restored.';
    setActionItems((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? (item.trim() ? `${item.trim()} ${voiceDraft}` : voiceDraft) : item
    )));
  };

  return (
    <Paper elevation={0} sx={{p: 1.1, borderRadius: 1.25, border: '1px solid #CDD4DE', bgcolor: '#F7F8FA'}}>
      <Typography sx={{fontSize: 14, fontWeight: 900, color: '#202124', mb: 1}}>Immediate Actions Taken</Typography>
      <Box sx={{display: 'grid', gap: 0.8}}>
        {actionItems.map((item, index) => (
          <Paper key={`action-${index}`} elevation={0} sx={{p: 0.7, borderRadius: 1.05, border: '1px solid #BDC5D0', bgcolor: '#FFFFFF'}}>
            <Box sx={{display: 'grid', gridTemplateColumns: '20px minmax(0, 1fr) 22px 22px', alignItems: 'center', gap: 0.7}}>
              <Box sx={{width: 20, height: 20, borderRadius: '50%', bgcolor: '#246BFE', color: '#FFFFFF', fontSize: 11, fontWeight: 900, display: 'grid', placeItems: 'center'}}>
                {index + 1}
              </Box>
              <TextField
                fullWidth
                placeholder="Enter Action"
                value={item}
                onChange={(event) => updateActionItem(index, event.target.value)}
                variant="standard"
                InputProps={{disableUnderline: true}}
                sx={{
                  '& .MuiInputBase-root': {fontSize: 15, color: '#202124', lineHeight: 1.35},
                  '& .MuiInputBase-input::placeholder': {color: '#8B93A1', opacity: 1},
                }}
              />
              <IconButton onClick={() => removeActionItem(index)} sx={{width: 20, height: 20, color: item.trim() ? '#C6CBD3' : '#E0E4EA'}}>
                <DeleteIcon sx={{fontSize: 18}} />
              </IconButton>
              <IconButton onClick={() => applyVoiceAction(index)} sx={esoMicButtonSx}>
                <MicIcon sx={{fontSize: 18}} />
              </IconButton>
            </Box>
          </Paper>
        ))}
        <Button onClick={addActionItem} sx={{height: 36, borderRadius: 1, color: '#246BFE', fontWeight: 900}}>
          ADD ANOTHER ACTION
        </Button>
      </Box>
    </Paper>
  );
}

function IncidentRiskSlider({
  level,
  labels,
  messageByLevel,
  onChange,
  subtitle,
  title,
}: {
  level: number;
  labels: [string, string, string];
  messageByLevel: [string, string, string];
  onChange: (level: number) => void;
  subtitle: string;
  title: string;
}) {
  const sliderColor = level === 0 ? '#F59E0B' : level === 1 ? '#F97316' : '#E45145';
  return (
    <Paper elevation={0} sx={{p: 1.15, borderRadius: 1, bgcolor: '#F3F4F6', border: '1px solid #E5E7EB'}}>
      <Typography sx={{fontSize: 15.5, fontWeight: 900, color: '#202124'}}>{title}</Typography>
      <Typography sx={{fontSize: 12.6, color: '#626465', mt: 0.2}}>{subtitle}</Typography>
      <Box sx={{mt: 1, px: 1.1, py: 0.8, borderRadius: 0.7, bgcolor: '#F1D5A8'}}>
        <Typography sx={{fontSize: 13.2, color: '#5C4A2F'}}>{messageByLevel[level]}</Typography>
      </Box>
      <Box sx={{px: 0.8, pt: 0.7}}>
        <Slider
          min={0}
          max={2}
          step={1}
          marks
          value={level}
          onChange={(_, value) => onChange(Array.isArray(value) ? value[0] : value)}
          sx={{
            color: sliderColor,
            height: 6,
            '& .MuiSlider-rail': {opacity: 1, bgcolor: '#D9DDE3'},
            '& .MuiSlider-track': {bgcolor: sliderColor, border: 'none'},
            '& .MuiSlider-thumb': {width: 20, height: 20, bgcolor: sliderColor, boxShadow: 'none'},
          }}
        />
      </Box>
      <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', mt: -0.25}}>
        {labels.map((label, index) => (
          <Typography
            key={label}
            sx={{
              textAlign: index === 0 ? 'left' : index === 1 ? 'center' : 'right',
              fontSize: 12.3,
              color: '#626465',
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
}

function CapturedNearMissPreview() {
  return (
    <Paper elevation={0} sx={{height: 124, borderRadius: 1.2, overflow: 'hidden', position: 'relative', mb: 1.1, bgcolor: '#EEF2F7'}}><Box sx={{position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #D8DEE8 0 28%, #A9B4C3 29% 46%, #ECEFF4 47% 58%, #7B8797 59% 100%)'}} /><Box sx={{position: 'absolute', right: 24, top: 22, width: 130, height: 70, borderRadius: 1, border: '2px solid #F7B2A0', bgcolor: 'rgba(255,255,255,0.22)'}} /><Box sx={{position: 'absolute', left: 12, right: 12, bottom: 10, p: 0.9, borderRadius: 0.8, bgcolor: '#DF2F34', color: '#FFFFFF', display: 'grid', gridTemplateColumns: '24px 1fr auto', alignItems: 'center', gap: 0.7}}><ErrorIcon sx={{fontSize: 20}} /><Box><Typography sx={{fontSize: 13, fontWeight: 900}}>Hazard Detected</Typography><Typography sx={{fontSize: 11.5}}>Leaning tray stack</Typography></Box><Typography sx={{fontSize: 12, fontWeight: 900}}>98%</Typography></Box></Paper>
  );
}

function CapturedMediaPreview() {
  return (
    <Box sx={{mt: 2.4}}><Typography sx={{fontSize: 20, fontWeight: 900, color: '#202124', mb: 1}}>Captured Media</Typography><Box sx={{height: 172, borderRadius: 1.2, overflow: 'hidden', position: 'relative', background: 'linear-gradient(165deg, #101827 0%, #1F2937 32%, #7A5A1E 68%, #253241 100%)'}}><Box sx={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 20% 35%, #F97316 0 18%, transparent 19%), radial-gradient(circle at 18% 66%, #0E7490 0 22%, transparent 23%)', opacity: 0.9}} /></Box></Box>
  );
}

function ConditionCameraIntro({onBack, onReady}: {onBack: () => void; onReady: () => void}) {
  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.8, pb: 1}}><Box sx={{height: 238, borderRadius: 2, overflow: 'hidden', position: 'relative', mb: 2, background: 'linear-gradient(135deg, #D9EDF9 0%, #FFFFFF 48%, #A8B7C9 100%)'}} /><Typography sx={{fontSize: 21, fontWeight: 900, mb: 0.6}}>How to Use the AI Camera</Typography><Typography sx={{fontSize: 12.4, color: '#626465', mb: 1.7}}>AI detects issues and generates technical reports in seconds.</Typography></Box>
      <BbsFooter primaryLabel="Next" onBack={onBack} onPrimary={onReady} />
    </Box>
  );
}

function ConditionCameraScan({onCancel, onRetake, onUseScan}: {onCancel: () => void; onRetake: () => void; onUseScan: () => void}) {
  return (
    <Box sx={{height: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{position: 'relative', minHeight: 0, overflow: 'hidden', background: '#101827'}}><Paper elevation={0} sx={{position: 'absolute', left: 16, right: 16, bottom: 18, p: 1.35, bgcolor: '#DF2F34', color: '#FFFFFF'}}><Typography sx={{fontSize: 16, fontWeight: 900}}>Hazard Detected</Typography><Typography sx={{fontSize: 12.5}}>Oil leak detected. Verification successful.</Typography></Paper></Box>
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.7, px: 1.6, py: 1.05}}><Button variant="outlined" onClick={onCancel}>Cancel</Button><Button variant="outlined" onClick={onRetake}>Retake</Button><Button variant="contained" onClick={onUseScan}>OK</Button></Box>
    </Box>
  );
}

function buildReviewDateLabel() {
  return new Date().toLocaleDateString('en-US', {month: 'long', day: 'numeric', year: 'numeric'});
}

function ReviewSectionHeading({title}: {title: string}) {
  return (
    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.85}}>
      <Typography sx={{fontSize: 15, fontWeight: 900, color: '#202124'}}>{title}</Typography>
      <EditOutlinedIcon sx={{fontSize: 16, color: '#246BFE'}} />
    </Box>
  );
}

function ReviewAttachmentButton({label}: {label: string}) {
  return (
    <Button
      fullWidth
      variant="outlined"
      startIcon={<CameraIcon />}
      sx={{
        height: 40,
        borderRadius: 1.6,
        borderColor: '#8DB4FF',
        color: '#246BFE',
        fontWeight: 900,
        '&:hover': {borderColor: '#246BFE', bgcolor: '#F7FAFF'},
      }}
    >
      {label}
    </Button>
  );
}

function IssueReviewStep({
  area,
  currentUserName,
  description,
  esoType,
  mediaAttached,
  onBack,
  onSubmit,
  recommendation,
  resolutionCategory,
  resolutionStatus,
  totalSteps,
}: {
  area: string;
  currentUserName: string;
  description: string;
  esoType: string;
  mediaAttached: boolean;
  onBack: () => void;
  onSubmit: () => void;
  recommendation: string;
  resolutionCategory: string;
  resolutionStatus: 'Resolved' | 'Not Resolved' | null;
  totalSteps: 2 | 4;
}) {
  const isResolved = resolutionStatus === 'Resolved' || totalSteps === 2;
  const isNearMissType = esoType === 'Near Miss';
  const hasStatus = totalSteps === 4;
  const showNotResolvedDetails = resolutionStatus === 'Not Resolved';
  const resolvedValue = resolutionStatus === 'Not Resolved' ? 'No' : 'Yes';
  const resolvedColor = resolutionStatus === 'Not Resolved' ? '#E45145' : '#43A35D';
  const finalRecommendation = recommendation.trim() || defaultResolutionRecommendation;

  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.7, pb: 1.2}}>
        <ProgressHeader step={totalSteps} width="100%" total={totalSteps} />
        <Paper elevation={0} sx={{p: 1.45, borderRadius: 1.3, bgcolor: '#EAF2FF', mb: 2}}>
          <Typography sx={{fontSize: 18, fontWeight: 900}}>Review & Submit</Typography>
          <Typography sx={{fontSize: 12.3, color: '#626465', mt: 0.55, lineHeight: 1.45}}>
            Review your report before submitting.
          </Typography>
        </Paper>

        <ReviewSectionHeading title="Summary" />
        <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mb: 0.7}}>
          <SummaryField label="Submitter Name" value={formatUserName(currentUserName)} boxed />
          <SummaryField label="Occurrence Date" value={buildReviewDateLabel()} boxed />
        </Box>
        {showNotResolvedDetails ? (
          isNearMissType ? (
            <SummaryField boxed label="Risk" value="Medium" valueColor="#F59E0B" />
          ) : (
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7}}>
              <SummaryField boxed label="Risk" value="Medium" valueColor="#F59E0B" />
              <SummaryField
                boxed
                label="ESO Type"
                value={esoType}
                valueColor={esoType === 'Safe Condition' ? '#43A35D' : esoType === 'Unsafe Condition' ? '#E45145' : '#202124'}
              />
            </Box>
          )
        ) : (
          !isNearMissType ? (
            <SummaryField
              boxed
              label="ESO Type"
              value={esoType}
              valueColor={esoType === 'Safe Condition' ? '#43A35D' : esoType === 'Unsafe Condition' ? '#E45145' : '#202124'}
            />
          ) : null
        )}
        <Box sx={{mt: 0.7}}>
          <SummaryField boxed label="Area" value={area} />
        </Box>
        <Box sx={{mt: 0.7}}>
          <SummaryField boxed label="Description of Observation" value={description} />
        </Box>

        {hasStatus && (
          <Box sx={{mt: 2}}>
            {!isResolved && (
              <Box sx={{mb: 1.45}}>
                <ReviewSectionHeading title="Categories" />
                <Box sx={{display: 'flex', mb: 0.4}}>
                  <Box sx={{px: 1.1, py: 0.45, borderRadius: 999, bgcolor: '#F0F1F3'}}>
                    <Typography sx={{fontSize: 12.5, color: '#202124'}}>{resolutionCategory}</Typography>
                  </Box>
                </Box>
              </Box>
            )}

            <ReviewSectionHeading title="Resolution status" />
            <SummaryField boxed label="Resolved" value={resolvedValue} valueColor={resolvedColor} />

            {showNotResolvedDetails && (
              <>
                <Box sx={{mt: 0.7}}>
                  <SummaryField boxed label="Recommendation" value={finalRecommendation} />
                </Box>
                {mediaAttached && (
                  <Box sx={{mt: 1}}>
                    <ReviewAttachmentButton label="2 MEDIA ATTACHED" />
                    <Typography sx={{fontSize: 11.5, color: '#8A93A6', textAlign: 'center', mt: 0.85}}>
                      No images are stored on your device.
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        )}
      </Box>
      <BbsFooter primaryLabel="Submit Report" onBack={onBack} onPrimary={onSubmit} />
    </Box>
  );
}

function ConditionReviewStep({
  classification,
  currentUserName,
  mediaAttached,
  onBack,
  onSubmit,
  recommendation,
  resolutionCategory,
  resolutionStatus,
}: {
  classification: any;
  currentUserName: string;
  mediaAttached: boolean;
  onBack: () => void;
  onSubmit: () => void;
  recommendation: string;
  resolutionCategory: string;
  resolutionStatus: any;
}) {
  const isSafeFlow = classification === 'Safe Condition';
  return (
    <IssueReviewStep
      area="Warehouse South"
      currentUserName={currentUserName}
      description="Oil leak on Hydraulic Pump B. Inspection and containment required."
      esoType={classification ?? 'Condition Report'}
      mediaAttached={mediaAttached}
      onBack={onBack}
      onSubmit={onSubmit}
      recommendation={recommendation}
      resolutionCategory={resolutionCategory}
      resolutionStatus={resolutionStatus}
      totalSteps={isSafeFlow ? 3 : 4}
    />
  );
}

function ConditionConfirmationStep({currentUserName, onGoHome}: {currentUserName: string; onGoHome: () => void}) {
  return (
    <Box sx={{height: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 2, pt: 4.6, textAlign: 'center'}}><CheckCircleOutlineIcon sx={{fontSize: 60, color: '#64C46D', mb: 2}} /><Typography sx={{fontSize: 19, fontWeight: 900}}>Well done, {formatUserName(currentUserName)}!</Typography><Typography sx={{fontSize: 12.5, color: '#626465'}}>Condition report recorded.</Typography></Box>
      <Box sx={{px: 1.6, py: 1.05}}><Button fullWidth variant="contained" onClick={onGoHome}>ESO Home</Button></Box>
    </Box>
  );
}

function NearMissCameraIntro({onBack, onReady}: {onBack: () => void; onReady: () => void}) {
  return (
    <Box sx={{minHeight: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 0.8, pb: 1}}><Box sx={{height: 238, borderRadius: 2, bgcolor: '#EEF2F7', mb: 2}} /><Typography sx={{fontSize: 21, fontWeight: 900, mb: 0.6}}>How to Use the AI Camera</Typography></Box>
      <BbsFooter primaryLabel="Next" onBack={onBack} onPrimary={onReady} />
    </Box>
  );
}

function NearMissCameraScan({onCancel, onRetake, onUseScan}: {onCancel: () => void; onRetake: () => void; onUseScan: () => void}) {
  return (
    <Box sx={{height: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{position: 'relative', minHeight: 0, overflow: 'hidden', background: '#1F2937'}} />
      <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.7, px: 1.6, py: 1.05}}><Button variant="outlined" onClick={onCancel}>Cancel</Button><Button variant="outlined" onClick={onRetake}>Retake</Button><Button variant="contained" onClick={onUseScan}>OK</Button></Box>
    </Box>
  );
}

function NearMissReviewStep({
  currentUserName,
  mediaAttached,
  onBack,
  onSubmit,
  recommendation,
  resolutionCategory,
  resolutionStatus,
}: {
  currentUserName: string;
  mediaAttached: boolean;
  onBack: () => void;
  onSubmit: () => void;
  recommendation: string;
  resolutionCategory: string;
  resolutionStatus: any;
}) {
  return (
    <IssueReviewStep
      area="Loading Dock"
      currentUserName={currentUserName}
      description="Stack of trays leaning slightly off the edge of the workstation. Potential for falling material and injury if bumped during movement."
      esoType="Near Miss"
      mediaAttached={mediaAttached}
      onBack={onBack}
      onSubmit={onSubmit}
      recommendation={recommendation}
      resolutionCategory={resolutionCategory}
      resolutionStatus={resolutionStatus}
      totalSteps={4}
    />
  );
}

function NearMissConfirmationStep({currentUserName, onGoHome}: {currentUserName: string; onGoHome: () => void}) {
  return (
    <Box sx={{height: '100%', display: 'grid', gridTemplateRows: 'minmax(0, 1fr) auto', bgcolor: '#FFFFFF'}}>
      <Box sx={{px: 2, pt: 4.6, textAlign: 'center'}}><CheckCircleOutlineIcon sx={{fontSize: 60, color: '#64C46D', mb: 2}} /><Typography sx={{fontSize: 19, fontWeight: 900}}>Well done, {formatUserName(currentUserName)}!</Typography><Typography sx={{fontSize: 12.5, color: '#626465'}}>Near Miss report recorded.</Typography></Box>
      <Box sx={{px: 1.6, py: 1.05}}><Button fullWidth variant="contained" onClick={onGoHome}>ESO Home</Button></Box>
    </Box>
  );
}

function SummaryField({boxed = false, label, value, valueColor = '#202124'}: {boxed?: boolean; label: string; value: string; valueColor?: string}) {
  return (
    <Box sx={boxed ? {minHeight: 56, p: 1, borderRadius: 1, bgcolor: '#F3F4F6'} : {minHeight: 42}}><Typography sx={{fontSize: 12, color: '#8A93A6', mb: 0.25}}>{label}</Typography><Typography sx={{fontSize: 15.5, color: valueColor, lineHeight: 1.45, whiteSpace: 'pre-line'}}>{value}</Typography></Box>
  );
}
