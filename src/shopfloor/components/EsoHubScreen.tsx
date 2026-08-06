import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Chip,
  Collapse,
  Dialog,
  Drawer,
  InputBase,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Switch,
  Tooltip,
  Typography,
  Grid,
} from '@mui/material';
import { activeTheme } from '../../theme';
import {
  ArrowBack as ArrowBackIcon,
  AutoAwesome as AutoAwesomeIcon,
  Apartment as ApartmentIcon,
  BarChartOutlined as BarChartOutlinedIcon,
  CheckroomOutlined as PpeIcon,
  CalendarToday as CalendarTodayIcon,
  CheckCircle as CheckCircleIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
  EditOutlined as EditOutlinedIcon,
  ExpandMore as ExpandMoreIcon,
  Download as DownloadIcon,
  InsertDriveFileOutlined as InsertDriveFileOutlinedIcon,
  LocationOnOutlined as LocationOnOutlinedIcon,
  MicNone as MicIcon,
  OpenInNew as OpenInNewIcon,
  History as HistoryIcon,
  InfoOutlined as InfoOutlinedIcon,
  ReportProblemOutlined as ConditionIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  ShieldOutlined as NearMissIcon,
  Tune as TuneIcon,
  DragIndicator as DragIndicatorIcon,
  LockOutlined as LockOutlinedIcon,
  MapOutlined as MapOutlinedIcon,
  PersonOutline as PersonOutlineIcon,
  OutlinedFlag as OutlinedFlagIcon,
  PrecisionManufacturingOutlined as PrecisionManufacturingOutlinedIcon,
  TableRowsOutlined as TableRowsOutlinedIcon,
  VisibilityOutlined as VisibilityOutlinedIcon,
  VisibilityOffOutlined as VisibilityOffOutlinedIcon,
  WarningAmberOutlined as WarningAmberOutlinedIcon,
  WbSunnyOutlined as WbSunnyOutlinedIcon,
} from '@mui/icons-material';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import type { ShiftEntryEsoSavedPayload } from '../../shiftEntry/ShiftEntryEso';
import {findHeaderHierarchyPath} from '../../navigation/headerHierarchy';
import { useActionTrackerContext } from '../../actionTracker/contexts/ActionTrackerContext';
import {
  tokenBrand,
  tokenDivider,
  tokenError,
  tokenNeutral,
  tokenText,
} from '../../workstation/theme';

type EsoHubScreenProps = {
  onOpenDashboard: () => void;
  onOpenEntry: (mode: 'bbs' | 'condition' | 'nearMiss') => void;
  selectedHeaderHierarchyId?: string;
  submittedEntries?: ShiftEntryEsoSavedPayload[];
};

type EsoTab = 'reports' | 'dashboard';
type ReportStatusTab = 'open' | 'awaitingReview' | 'closed';
export type ReportPanelMode = 'view' | 'edit';
type DashboardView = 'Site' | 'BDX' | 'Business Unit';
type SiteHeatmapType = 'BBS' | 'Condition Report' | 'Near Miss';
type SiteHeatmapTone = 'safe' | 'unsafe';
type SiteHeatmapReport = {
  id: string;
  date: string;
  tags: string[];
};
type SiteHeatmapDetail =
  | {
    kind: 'BBS';
    badge: string;
    title: string;
    location: string;
    safePercent: number;
    unsafePercent: number;
    reports: SiteHeatmapReport[];
  }
  | {
    kind: 'Condition Report' | 'Near Miss';
    badge: string;
    title: string;
    location: string;
    severity: {
      low: number;
      medium: number;
      high: number;
    };
    reports: SiteHeatmapReport[];
  };
type SiteHeatmapMarker = {
  id: string;
  x: string;
  y: string;
  count: number;
  tone: SiteHeatmapTone;
  detail: SiteHeatmapDetail;
};

const esoInitialReportStatusTabStorageKey = 'bd-eso-initial-report-status-tab';

function readInitialReportStatusTabFromSession(): ReportStatusTab | null {
  if (typeof window === 'undefined') return null;

  const storedTab = window.sessionStorage.getItem(esoInitialReportStatusTabStorageKey);
  window.sessionStorage.removeItem(esoInitialReportStatusTabStorageKey);

  return storedTab === 'awaitingReview' || storedTab === 'closed' || storedTab === 'open'
    ? storedTab
    : null;
}
export type ReportRow = {
  id: string;
  type: 'BBS' | 'Condition Report' | 'Near Miss';
  classification: 'SAFE' | 'UNSAFE';
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
  status: string;
  observer: string;
  area: string;
  line: string;
  supervisor: string;
  reportDate: string;
  occurrenceDate: string;
  closedDate: string;
  lastUpdate: string;
  duplicated?: boolean;
};

const reportSummaryCards = [
  {
    primary: '86',
    suffix: '%',
    label: 'Annual ESO Goal',
    counter: '112/130',
    accent: '#8B9097',
    background: '#EEF3F8',
    progress: '86%',
    progressTrack: '#BED3FF',
  },
  {
    primary: '70',
    suffix: '%',
    label: 'Monthly ESO Goal',
    counter: '12/17',
    accent: '#2F6CF4',
    background: '#EEF3F8',
    progress: '60%',
    progressTrack: '#BED3FF',
  },
  {
    primary: '10',
    suffix: ' Reports',
    label: 'My ESOs',
    counter: '',
    accent: '#8B9097',
    background: '#EEF3F8',
  },
  {
    primary: '2',
    suffix: ' Reports',
    label: 'My tasks',
    counter: '',
    accent: '#8B9097',
    background: '#EEF3F8',
  },
  {
    primary: '1',
    suffix: ' Reports',
    label: 'Review On Track',
    counter: '',
    accent: '#8B9097',
    background: '#EEF3F8',
  },
  {
    primary: '1',
    suffix: ' Reports',
    label: 'Review Overdue',
    counter: '',
    accent: '#FF4343',
    background: '#EEF3F8',
  },
] as const;

const reportAssistantInsights = [
  {
    severity: 'greeting',
    title: 'Good morning, Cristian',
    detail: 'Here are the ESO priorities for your shift.',
  },
  {
    severity: 'high',
    title: 'Overdue ESO review',
    detail: '1 unsafe condition report in Assembly Line B needs review before new observations are opened.',
  },
  {
    severity: 'info',
    title: 'Duplicate review ready',
    detail: '2 potential duplicate reports are ready to analyze and merge so the review queue stays clean.',
  },
  {
    severity: 'info',
    title: 'Unsafe condition focus',
    detail: '3 open unsafe reports are clustered near Bay 3. Review classifications, risk rank, and owner follow-up together.',
  },
] as const;

const reportRows = [
  {
    id: 'ESO-2024-102923',
    type: 'BBS',
    classification: 'SAFE',
    risk: 'LOW',
    status: 'CLOSED',
    observer: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    occurrenceDate: 'May 05, 2026 11:40 PM',
    closedDate: 'May 06, 2026 08:09 PM',
    lastUpdate: 'May 06, 2026 08:09 PM',
  },
  {
    id: 'ESO-2024-102921',
    type: 'BBS',
    classification: 'SAFE',
    risk: 'LOW',
    status: 'CLOSED',
    observer: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    occurrenceDate: 'May 05, 2026 11:40 PM',
    closedDate: 'May 06, 2026 08:09 PM',
    lastUpdate: 'May 06, 2026 08:09 PM',
  },
  {
    id: 'ESO-2024-102918',
    type: 'Condition Report',
    classification: 'UNSAFE',
    risk: 'MEDIUM',
    status: 'REVIEW',
    observer: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    occurrenceDate: 'May 05, 2026 11:40 PM',
    closedDate: '',
    lastUpdate: 'May 06, 2026 08:09 PM',
  },
  {
    id: 'ESO-2024-102913',
    type: 'BBS',
    classification: 'SAFE',
    risk: 'LOW',
    status: 'CLOSED',
    observer: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    occurrenceDate: 'May 05, 2026 11:40 PM',
    closedDate: 'May 06, 2026 08:09 PM',
    lastUpdate: 'May 06, 2026 08:09 PM',
  },
  {
    id: 'ESO-2024-102911',
    type: 'Condition Report',
    classification: 'UNSAFE',
    risk: 'LOW',
    status: 'UNDER FOLLOW-UP',
    observer: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    occurrenceDate: 'May 05, 2026 11:40 PM',
    closedDate: '',
    lastUpdate: 'May 06, 2026 08:09 PM',
  },
  {
    id: 'ESO-2024-102907',
    type: 'Condition Report',
    classification: 'UNSAFE',
    risk: 'HIGH',
    status: 'UNDER FOLLOW-UP',
    observer: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    occurrenceDate: 'May 05, 2026 11:40 PM',
    closedDate: '',
    lastUpdate: 'May 06, 2026 08:09 PM',
  },
  {
    id: 'ESO-2024-102904',
    type: 'BBS',
    classification: 'SAFE',
    risk: 'LOW',
    status: 'CLOSED',
    observer: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    occurrenceDate: 'May 05, 2026 11:40 PM',
    closedDate: 'May 06, 2026 08:09 PM',
    lastUpdate: 'May 06, 2026 08:09 PM',
  },
  {
    id: 'ESO-2024-102903',
    type: 'BBS',
    classification: 'SAFE',
    risk: 'LOW',
    status: 'CLOSED',
    observer: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    occurrenceDate: 'May 05, 2026 11:40 PM',
    closedDate: 'May 06, 2026 08:09 PM',
    lastUpdate: 'May 06, 2026 08:09 PM',
  },
  {
    id: 'ESO-2024-102902',
    type: 'BBS',
    classification: 'SAFE',
    risk: 'LOW',
    status: 'CLOSED',
    observer: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    occurrenceDate: 'May 05, 2026 11:40 PM',
    closedDate: 'May 06, 2026 08:09 PM',
    lastUpdate: 'May 06, 2026 08:09 PM',
  },
  {
    id: 'ESO-2024-102892',
    type: 'Near Miss',
    classification: 'UNSAFE',
    risk: 'MEDIUM',
    status: 'REVIEW',
    observer: 'John Smith',
    area: 'Assembly Line B',
    line: 'Bay 3, near conveyor belt',
    supervisor: 'Maddison Brooks',
    reportDate: 'May 05, 2026 11:42 PM',
    occurrenceDate: 'May 05, 2026 11:40 PM',
    closedDate: '',
    lastUpdate: 'May 06, 2026 08:09 PM',
    duplicated: true,
  },
  {
    id: 'ESO-2024-102889',
    type: 'BBS',
    classification: 'SAFE',
    risk: 'LOW',
    status: 'UNDER FOLLOW-UP',
    observer: 'Alicia Turner',
    area: 'Packaging Hall',
    line: 'Cell 4, end of sealing line',
    supervisor: 'Marcus Lee',
    reportDate: 'May 07, 2026 07:18 AM',
    occurrenceDate: 'May 07, 2026 07:04 AM',
    closedDate: '',
    lastUpdate: 'May 07, 2026 02:31 PM',
  },
  {
    id: 'ESO-2024-102881',
    type: 'Condition Report',
    classification: 'UNSAFE',
    risk: 'MEDIUM',
    status: 'CLOSED',
    observer: 'Diana Costa',
    area: 'Warehouse South',
    line: 'Dock 2 pedestrian lane',
    supervisor: 'Rafael Gomez',
    reportDate: 'May 08, 2026 01:26 PM',
    occurrenceDate: 'May 08, 2026 12:58 PM',
    closedDate: 'May 08, 2026 04:15 PM',
    lastUpdate: 'May 08, 2026 04:15 PM',
  },
] as const;

const dashboardBdxKpis = [
  {
    value: '1.32',
    suffix: '',
    label: 'ESO Contact Rate',
    delta: '+1.05',
    deltaColor: '#4CAF70',
    stackedSegments: [{ width: '100%', color: '#58C36C' }],
    sparkline: [10, 10, 11, 11, 10, 10, 11, 11, 12, 12, 24, 24, 22, 48],
  },
  {
    value: '2,450',
    suffix: '',
    label: 'Total ESO Submitted',
    delta: '+15%',
    deltaColor: '#4CAF70',
    stackedSegments: [],
  },
  {
    value: '42',
    suffix: '',
    label: 'Open ESO',
    targetLabel: '',
    delta: '- 5',
    deltaColor: '#FF5A5A',
    stackedSegments: [
      { width: '86%', color: '#FFA227' },
      { width: '14%', color: '#E67777' },
    ],
    footerLegend: [
      { label: 'Condition:30', color: '#FFA227' },
      { label: 'Near Miss:12', color: '#E67777' },
    ],
  },
  {
    value: '94',
    suffix: '%',
    label: 'Total ESO Closure Rate',
    targetLabel: 'TARGET 95%',
    delta: '+2.4%',
    deltaColor: '#4CAF70',
    stackedSegments: [{ width: '96%', color: '#2F6CF4' }],
  },
] as const;

const dashboardSiteKpis = [
  dashboardBdxKpis[0],
  {
    value: '32',
    suffix: '%',
    label: 'Unique Users Record',
    delta: '+8%',
    deltaColor: '#4CAF70',
    stackedSegments: [],
  },
  dashboardBdxKpis[1],
  {
    value: '',
    label: 'Critical Lines',
    stackedSegments: [],
    calloutLines: ['Line 7  -  4 reports in 15 min', 'Line 2  -  6 reports in 23 min'],
    accentColor: '#FF4B4B',
  },
  {
    value: '3',
    label: 'High Priority Open ESO',
    stackedSegments: [],
    accentColor: '#FF4B4B',
    chevron: true,
  },
  dashboardBdxKpis[2],
  dashboardBdxKpis[3],
] as const;

const unsafeSiteReports = [
  { id: 'ESO-102923', type: 'Condition Report', area: 'Secondary Pack', line: 'Line 1', risk: 'HIGH', status: 'REVIEW', reportDate: 'May 05, 2026 11:42 PM' },
  { id: 'ESO-102919', type: 'Condition Report', area: 'Prod. Line A', line: 'Line 1', risk: 'HIGH', status: 'REVIEW', reportDate: 'May 05, 2026 11:40 PM' },
  { id: 'ESO-102914', type: 'Condition Report', area: 'Maintenance Hub', line: '-', risk: 'MEDIUM', status: 'REVIEW', reportDate: 'May 05, 2026 11:23 PM' },
  { id: 'ESO-102908', type: 'Near Miss', area: 'Secondary Pack', line: 'Line 1', risk: 'MEDIUM', status: 'REVIEW', reportDate: 'May 05, 2026 11:18 PM' },
  { id: 'ESO-102813', type: 'Condition Report', area: 'Prod. Line A', line: 'Line 1', risk: 'MEDIUM', status: 'UNDER FOLLOW-UP', reportDate: 'May 05, 2026 11:03 PM' },
] as const;

const dashboardViewOptions = ['BDX', 'Business Unit', 'Site'] as const satisfies readonly DashboardView[];
const siteHeatmapTypeOptions = ['BBS', 'Condition Report', 'Near Miss'] as const satisfies readonly SiteHeatmapType[];

const siteHeatmapMarkers: Record<SiteHeatmapType, readonly SiteHeatmapMarker[]> = {
  'BBS': [
    {
      id: 'bbs-1',
      x: '28%',
      y: '39%',
      count: 3,
      tone: 'safe',
      detail: {
        kind: 'BBS',
        badge: 'BBS',
        title: 'Maintenance Hub',
        location: 'Line 4-B  •  3 Reports',
        safePercent: 68,
        unsafePercent: 32,
        reports: [
          { id: 'ESO-102919', date: 'May 01, 2026', tags: ['PPE', 'BODY POSITION'] },
          { id: 'ESO-102921', date: 'May 01, 2026', tags: ['PPE', 'BODY USE'] },
          { id: 'ESO-102922', date: 'May 01, 2026', tags: ['BODY POSITION', 'BODY USE'] },
        ],
      },
    },
    {
      id: 'bbs-2',
      x: '43%',
      y: '53%',
      count: 2,
      tone: 'safe',
      detail: {
        kind: 'BBS',
        badge: 'BBS',
        title: 'Assembly Cell',
        location: 'Line 2-C  •  2 Reports',
        safePercent: 74,
        unsafePercent: 26,
        reports: [
          { id: 'ESO-102871', date: 'Apr 29, 2026', tags: ['SAFE WALKING'] },
          { id: 'ESO-102874', date: 'Apr 29, 2026', tags: ['TOOLS & EQUIPMENT'] },
        ],
      },
    },
    {
      id: 'bbs-3',
      x: '58%',
      y: '35%',
      count: 1,
      tone: 'unsafe',
      detail: {
        kind: 'BBS',
        badge: 'BBS',
        title: 'Packout Staging',
        location: 'Line 5-A  •  1 Report',
        safePercent: 41,
        unsafePercent: 59,
        reports: [
          { id: 'ESO-102948', date: 'May 03, 2026', tags: ['BODY POSITION', '5S HOUSEKEEPING'] },
        ],
      },
    },
    {
      id: 'bbs-4',
      x: '71%',
      y: '26%',
      count: 3,
      tone: 'safe',
      detail: {
        kind: 'BBS',
        badge: 'BBS',
        title: 'Receiving Dock',
        location: 'Line 1-D  •  3 Reports',
        safePercent: 71,
        unsafePercent: 29,
        reports: [
          { id: 'ESO-102887', date: 'Apr 30, 2026', tags: ['PPE'] },
          { id: 'ESO-102889', date: 'Apr 30, 2026', tags: ['SAFE WALKING'] },
          { id: 'ESO-102891', date: 'Apr 30, 2026', tags: ['TOOLS & EQUIPMENT'] },
        ],
      },
    },
    {
      id: 'bbs-5',
      x: '84%',
      y: '60%',
      count: 1,
      tone: 'unsafe',
      detail: {
        kind: 'BBS',
        badge: 'BBS',
        title: 'Labeling Zone',
        location: 'Line 6-E  •  1 Report',
        safePercent: 35,
        unsafePercent: 65,
        reports: [
          { id: 'ESO-102955', date: 'May 02, 2026', tags: ['BODY USE'] },
        ],
      },
    },
    {
      id: 'bbs-6',
      x: '50%',
      y: '16%',
      count: 19,
      tone: 'unsafe',
      detail: {
        kind: 'BBS',
        badge: 'BBS',
        title: 'Central Corridor',
        location: 'Line 3-B  •  19 Reports',
        safePercent: 52,
        unsafePercent: 48,
        reports: [
          { id: 'ESO-102960', date: 'May 04, 2026', tags: ['PPE', 'SAFE WALKING'] },
          { id: 'ESO-102961', date: 'May 04, 2026', tags: ['BODY POSITION'] },
          { id: 'ESO-102964', date: 'May 04, 2026', tags: ['TOOLS & EQUIPMENT'] },
        ],
      },
    },
  ],
  'Condition Report': [
    {
      id: 'condition-1',
      x: '31%',
      y: '42%',
      count: 4,
      tone: 'unsafe',
      detail: {
        kind: 'Condition Report',
        badge: 'CONDITION',
        title: 'Secondary Pack',
        location: 'Line 4-B  •  6 Reports',
        severity: { low: 2, medium: 3, high: 1 },
        reports: [
          { id: 'ESO-102923', date: 'May 01, 2026', tags: ['FALL PROTECTION'] },
          { id: 'ESO-102924', date: 'May 01, 2026', tags: ['CONTRACTORS / VISITORS'] },
          { id: 'ESO-102926', date: 'May 01, 2026', tags: ['ERGONOMICS'] },
          { id: 'ESO-102927', date: 'May 01, 2026', tags: ['ERGONOMICS'] },
        ],
      },
    },
    {
      id: 'condition-2',
      x: '46%',
      y: '56%',
      count: 3,
      tone: 'safe',
      detail: {
        kind: 'Condition Report',
        badge: 'CONDITION',
        title: 'Kitting Island',
        location: 'Line 2-C  •  3 Reports',
        severity: { low: 1, medium: 1, high: 1 },
        reports: [
          { id: 'ESO-102901', date: 'May 02, 2026', tags: ['PPE'] },
          { id: 'ESO-102903', date: 'May 02, 2026', tags: ['ERGONOMICS'] },
          { id: 'ESO-102904', date: 'May 02, 2026', tags: ['ELECTRICAL SAFETY'] },
        ],
      },
    },
    {
      id: 'condition-3',
      x: '60%',
      y: '37%',
      count: 2,
      tone: 'unsafe',
      detail: {
        kind: 'Condition Report',
        badge: 'CONDITION',
        title: 'Inspection Bay',
        location: 'Line 5-A  •  2 Reports',
        severity: { low: 0, medium: 1, high: 1 },
        reports: [
          { id: 'ESO-102944', date: 'May 03, 2026', tags: ['5S / HOUSEKEEPING'] },
          { id: 'ESO-102945', date: 'May 03, 2026', tags: ['FACILITIES / BUILDING'] },
        ],
      },
    },
    {
      id: 'condition-4',
      x: '73%',
      y: '28%',
      count: 5,
      tone: 'safe',
      detail: {
        kind: 'Condition Report',
        badge: 'CONDITION',
        title: 'Dock Entrance',
        location: 'Line 1-D  •  5 Reports',
        severity: { low: 3, medium: 1, high: 1 },
        reports: [
          { id: 'ESO-102880', date: 'Apr 30, 2026', tags: ['CONTRACTORS / VISITORS'] },
          { id: 'ESO-102881', date: 'Apr 30, 2026', tags: ['PPE'] },
          { id: 'ESO-102882', date: 'Apr 30, 2026', tags: ['5S / HOUSEKEEPING'] },
        ],
      },
    },
    {
      id: 'condition-5',
      x: '82%',
      y: '58%',
      count: 2,
      tone: 'unsafe',
      detail: {
        kind: 'Condition Report',
        badge: 'CONDITION',
        title: 'Labeling Zone',
        location: 'Line 6-E  •  2 Reports',
        severity: { low: 0, medium: 1, high: 1 },
        reports: [
          { id: 'ESO-102952', date: 'May 02, 2026', tags: ['ERGONOMICS'] },
          { id: 'ESO-102953', date: 'May 02, 2026', tags: ['FALL PROTECTION'] },
        ],
      },
    },
    {
      id: 'condition-6',
      x: '54%',
      y: '18%',
      count: 11,
      tone: 'unsafe',
      detail: {
        kind: 'Condition Report',
        badge: 'CONDITION',
        title: 'Utility Spine',
        location: 'Line 3-B  •  11 Reports',
        severity: { low: 4, medium: 4, high: 3 },
        reports: [
          { id: 'ESO-102969', date: 'May 04, 2026', tags: ['ELECTRICAL SAFETY'] },
          { id: 'ESO-102970', date: 'May 04, 2026', tags: ['PPE'] },
          { id: 'ESO-102971', date: 'May 04, 2026', tags: ['FACILITIES / BUILDING'] },
        ],
      },
    },
  ],
  'Near Miss': [
    {
      id: 'near-miss-1',
      x: '26%',
      y: '40%',
      count: 2,
      tone: 'safe',
      detail: {
        kind: 'Near Miss',
        badge: 'NEAR MISS',
        title: 'Conveyor Merge',
        location: 'Line 4-A  •  2 Reports',
        severity: { low: 1, medium: 1, high: 0 },
        reports: [
          { id: 'ESO-102932', date: 'May 01, 2026', tags: ['SAFE WALKING'] },
          { id: 'ESO-102933', date: 'May 01, 2026', tags: ['BODY POSITION'] },
        ],
      },
    },
    {
      id: 'near-miss-2',
      x: '45%',
      y: '54%',
      count: 1,
      tone: 'unsafe',
      detail: {
        kind: 'Near Miss',
        badge: 'NEAR MISS',
        title: 'Pallet Staging',
        location: 'Line 2-C  •  1 Report',
        severity: { low: 0, medium: 1, high: 0 },
        reports: [
          { id: 'ESO-102936', date: 'May 02, 2026', tags: ['MOBILE EQUIPMENT'] },
        ],
      },
    },
    {
      id: 'near-miss-3',
      x: '57%',
      y: '33%',
      count: 3,
      tone: 'unsafe',
      detail: {
        kind: 'Near Miss',
        badge: 'NEAR MISS',
        title: 'Upper Catwalk',
        location: 'Line 5-A  •  3 Reports',
        severity: { low: 0, medium: 2, high: 1 },
        reports: [
          { id: 'ESO-102941', date: 'May 03, 2026', tags: ['FALL PROTECTION'] },
          { id: 'ESO-102942', date: 'May 03, 2026', tags: ['SAFE WALKING'] },
          { id: 'ESO-102943', date: 'May 03, 2026', tags: ['BODY USE'] },
        ],
      },
    },
    {
      id: 'near-miss-4',
      x: '70%',
      y: '27%',
      count: 4,
      tone: 'safe',
      detail: {
        kind: 'Near Miss',
        badge: 'NEAR MISS',
        title: 'Receiving Dock',
        location: 'Line 1-D  •  4 Reports',
        severity: { low: 1, medium: 2, high: 1 },
        reports: [
          { id: 'ESO-102884', date: 'Apr 30, 2026', tags: ['MOBILE EQUIPMENT'] },
          { id: 'ESO-102885', date: 'Apr 30, 2026', tags: ['CONTRACTORS / VISITORS'] },
          { id: 'ESO-102886', date: 'Apr 30, 2026', tags: ['SAFE WALKING'] },
        ],
      },
    },
    {
      id: 'near-miss-5',
      x: '83%',
      y: '61%',
      count: 1,
      tone: 'unsafe',
      detail: {
        kind: 'Near Miss',
        badge: 'NEAR MISS',
        title: 'Labeling Zone',
        location: 'Line 6-E  •  1 Report',
        severity: { low: 0, medium: 0, high: 1 },
        reports: [
          { id: 'ESO-102956', date: 'May 02, 2026', tags: ['BODY POSITION'] },
        ],
      },
    },
    {
      id: 'near-miss-6',
      x: '49%',
      y: '17%',
      count: 7,
      tone: 'unsafe',
      detail: {
        kind: 'Near Miss',
        badge: 'NEAR MISS',
        title: 'Central Corridor',
        location: 'Line 3-B  •  7 Reports',
        severity: { low: 2, medium: 3, high: 2 },
        reports: [
          { id: 'ESO-102965', date: 'May 04, 2026', tags: ['SAFE WALKING'] },
          { id: 'ESO-102966', date: 'May 04, 2026', tags: ['BODY POSITION'] },
          { id: 'ESO-102967', date: 'May 04, 2026', tags: ['MOBILE EQUIPMENT'] },
        ],
      },
    },
  ],
} as const;

const businessUnitBars = [
  { label: 'MDS', value: 2.1, target: 1.65, tone: '#81C784' },
  { label: 'PS', value: 1.9, target: 1.82, tone: '#81C784' },
  { label: 'Surgery', value: 1.1, target: 1.32, tone: '#F34F4F' },
  { label: 'MMS', value: 1.6, target: 1.92, tone: '#F34F4F' },
  { label: 'APM', value: 0.4, target: 1.74, tone: '#F34F4F' },
  { label: 'PI', value: 1.1, target: 1.42, tone: '#F34F4F' },
  { label: 'UCC', value: 0.19, target: 1.28, tone: '#F34F4F' },
  { label: 'SM', value: 1.6, target: 1.9, tone: '#F34F4F' },
  { label: 'GSC', value: 0.4, target: 0.62, tone: '#F34F4F' },
] as const;

const siteBars = [
  { label: 'Canaan', value: 2.1, target: 1.65, tone: '#81C784' },
  { label: 'Columbus West', value: 1.9, target: 1.82, tone: '#81C784' },
  { label: 'Fraga', value: 1.4, target: 1.32, tone: '#81C784' },
  { label: 'Juiz de Fora', value: 2.0, target: 1.92, tone: '#81C784' },
  { label: 'NAMc', value: 1.5, target: 0.92, tone: '#81C784' },
  { label: 'Nogales', value: 1.1, target: 1.42, tone: '#F34F4F' },
  { label: 'Sandy', value: 0.4, target: 1.28, tone: '#F34F4F' },
  { label: 'Tijuana 1', value: 1.6, target: 1.9, tone: '#F34F4F' },
  { label: 'Tuas', value: 0.4, target: 1.4, tone: '#F34F4F' },
] as const;

const areaBars = [
  { label: 'Poliflush', value: 1.8, target: 1.45, tone: '#81C784' },
  { label: 'Cannula', value: 1.6, target: 1.5, tone: '#81C784' },
  { label: 'Hypo', value: 1.25, target: 1.3, tone: '#F34F4F' },
  { label: 'Service', value: 1.35, target: 1.2, tone: '#81C784' },
  { label: 'Sterilization', value: 1.05, target: 1.15, tone: '#F34F4F' },
  { label: 'EHS', value: 1.7, target: 1.4, tone: '#81C784' },
  { label: 'Warehouse', value: 0.95, target: 1.1, tone: '#F34F4F' },
  { label: 'Quality', value: 1.5, target: 1.35, tone: '#81C784' },
  { label: 'HR', value: 0.88, target: 0.95, tone: '#F34F4F' },
] as const;

const bbsCategoryRows = [
  { label: 'PPE', safe: 91, unsafe: 18, safeDisplay: 88, unsafeDisplay: 17 },
  { label: 'Body Position', safe: 84, unsafe: 15, safeDisplay: 81, unsafeDisplay: 14 },
  { label: 'Body Use', safe: 88, unsafe: 13, safeDisplay: 84, unsafeDisplay: 12 },
  { label: 'Safe Walking', safe: 93, unsafe: 12, safeDisplay: 88, unsafeDisplay: 11 },
  { label: 'Tools & Equipment', safe: 86, unsafe: 8, safeDisplay: 76, unsafeDisplay: 9 },
  { label: 'Fall Protection', safe: 83, unsafe: 7, safeDisplay: 73, unsafeDisplay: 8 },
  { label: 'Lockout Tagout', safe: 80, unsafe: 6, safeDisplay: 69, unsafeDisplay: 7 },
  { label: 'Machine Guarding', safe: 77, unsafe: 5, safeDisplay: 64, unsafeDisplay: 6 },
  { label: 'Procedures & Standards', safe: 75, unsafe: 5, safeDisplay: 61, unsafeDisplay: 5 },
  { label: 'Mobile Equipment', safe: 78, unsafe: 4, safeDisplay: 68, unsafeDisplay: 4 },
  { label: 'Chemical Handling', safe: 71, unsafe: 3, safeDisplay: 56, unsafeDisplay: 3 },
  { label: 'Environmental Stewardship', safe: 90, unsafe: 2, safeDisplay: 89, unsafeDisplay: 2 },
  { label: 'Speak Up', safe: 88, unsafe: 2, safeDisplay: 86, unsafeDisplay: 2 },
  { label: '5S Housekeeping', safe: 86, unsafe: 1, safeDisplay: 84, unsafeDisplay: 1 },
] as const;

const bbsPpeDetailRows = [
  { label: 'Face and eyes protection', safe: 90, unsafe: 23, safeDisplay: 86, unsafeDisplay: 12 },
  { label: 'Hands and fingers protection', safe: 85, unsafe: 21, safeDisplay: 81, unsafeDisplay: 11 },
  { label: 'Hearing protection', safe: 88, unsafe: 20, safeDisplay: 84, unsafeDisplay: 10 },
  { label: 'Respiratory protection', safe: 98, unsafe: 18, safeDisplay: 92, unsafeDisplay: 8 },
  { label: 'Body protection', safe: 94, unsafe: 18, safeDisplay: 90, unsafeDisplay: 8 },
] as const;

const conditionCategoryRows = [
  { label: 'PPE', value: 19 },
  { label: 'Ergonomics', value: 16 },
  { label: 'Electrical Safety', value: 15 },
  { label: '5S / Housekeeping', value: 13 },
  { label: 'Facilities / Building', value: 11 },
  { label: 'Contractors / Visitors', value: 9 },
  { label: 'Bloodborne Pathogens', value: 8 },
  { label: 'Cranes / Lifts / Hoists', value: 6 },
  { label: 'Confined Spaces', value: 4 },
] as const;

const conditionCategorySafeRows = [
  { label: 'Environmental Stewardship', value: 94 },
  { label: 'Speak Up', value: 92 },
  { label: 'Safe Walking', value: 90 },
  { label: 'Tools & Equipment', value: 88 },
  { label: '5S / Housekeeping', value: 86 },
  { label: 'Facilities / Building', value: 84 },
  { label: 'Electrical Safety', value: 81 },
  { label: 'Ergonomics', value: 79 },
  { label: 'PPE', value: 77 },
] as const;

const nearMissCategoryRows = [
  { label: 'PPE', value: 28 },
  { label: 'Ergonomics', value: 22 },
  { label: 'Electrical Safety', value: 16 },
  { label: '5S / Housekeeping', value: 14 },
  { label: 'Facilities / Building', value: 10 },
  { label: 'Contractors / Visitors', value: 4 },
  { label: 'Bloodborne Pathogens', value: 3 },
  { label: 'Cranes / Lifts / Hoists', value: 2 },
  { label: 'Confined Spaces', value: 1 },
] as const;

const barrierRows = [
  { label: 'Rushing', count: 4700, cumulative: 18 },
  { label: 'Habit', count: 4100, cumulative: 36 },
  { label: 'Complacency', count: 3300, cumulative: 55 },
  { label: 'Lack of Training', count: 2800, cumulative: 68 },
  { label: 'Follow Procedures', count: 2400, cumulative: 79 },
  { label: 'Frustration', count: 1500, cumulative: 84 },
  { label: 'Peer Pressure', count: 800, cumulative: 87 },
  { label: 'Work Environment', count: 700, cumulative: 89 },
  { label: 'Equipment Condition', count: 620, cumulative: 91 },
  { label: 'Personal Factors', count: 560, cumulative: 92 },
  { label: 'Management Pressure', count: 450, cumulative: 93 },
  { label: 'Disagreement', count: 330, cumulative: 93 },
  { label: 'Insignificant', count: 220, cumulative: 93 },
] as const;

const monthLabels = ['Apr/25', 'May/25', 'Jun/25', 'Jul/25', 'Aug/25', 'Sep/25', 'Oct/25', 'Nov/25', 'Dec/25', 'Jan/26', 'Feb/26', 'Mar/26', 'Apr/26'] as const;

const contactRateCurrent = [6900, 7200, 6700, 6500, 6600, 7050, 7350, 7600, 7200, 6300, 6200, 6650, 7100];
const contactRateLastYear = [6100, 6150, 5700, 5550, 5700, 6050, 6350, 6500, 6750, 5600, 5550, 5900, 5950];
const contactRateChange = [17.2, 18.8, 17.1, 17.2, 17.4, 18.2, 19.0, 18.0, 19.8, 12.6, 12.5, 12.8, 20.1];

const esoCountCurrent = [18500, 19600, 17800, 17100, 17600, 18900, 20100, 19800, 19200, 16400, 16200, 17600, 18600];
const esoCountLastYear = [17000, 17600, 16500, 16100, 16600, 17400, 18300, 18000, 17100, 15000, 14500, 14900, 15200];
const esoCountChange = [17.4, 19.2, 17.2, 16.9, 17.3, 18.4, 17.9, 18.5, 18.2, 12.6, 12.7, 13.0, 19.8];

const businessUnitComparisonCurrent = [1.2, 1.15, 1.22, 0.95, 0.96, 0.78, 0.75, 0.68, 0.64];
const businessUnitComparisonLastYear = [1.18, 1.12, 1.15, 0.92, 0.93, 0.76, 0.74, 0.71, 0.63];
const businessUnitComparisonChange = [4.2, 4.4, 13.6, 7.1, 12.4, 7.8, 8.6, 9.0, 10.0];

const businessUnitLabels = ['MDS', 'PS', 'Surgery', 'MMS', 'APM', 'PI', 'UCC', 'SM', 'GSC'] as const;
const siteComparisonCurrent = [1.22, 1.16, 1.18, 1.09, 1.04, 0.92, 0.75, 0.68, 0.64];
const siteComparisonLastYear = [1.18, 1.12, 1.08, 1.03, 0.99, 0.88, 0.74, 0.71, 0.63];
const siteComparisonChange = [4.3, 3.6, 9.3, 5.8, 5.1, 4.5, 1.4, 4.2, 1.6];
const siteLabels = ['Canaan', 'Columbus West', 'Fraga', 'Juiz de Fora', 'NAMc', 'Nogales', 'Sandy', 'Tijuana 1', 'Tuas'] as const;
const areaComparisonCurrent = [1.32, 1.28, 1.16, 1.1, 0.98, 1.42, 1.05, 1.22, 0.9];
const areaComparisonLastYear = [1.24, 1.21, 1.1, 1.02, 0.94, 1.31, 0.98, 1.16, 0.86];
const areaComparisonChange = [6.5, 5.8, 5.5, 7.8, 4.3, 8.4, 7.1, 5.2, 4.7];
const areaLabels = ['Poliflush', 'Cannula', 'Hypo', 'Service', 'Sterilization', 'EHS', 'Warehouse', 'Quality', 'HR'] as const;

const personPhotos: Record<string, string> = {
  'John Smith': 'https://randomuser.me/api/portraits/men/45.jpg',
  'Maddison Brooks': 'https://randomuser.me/api/portraits/women/44.jpg',
};

const reportTableColumns = '1.4fr 1.25fr 0.9fr 1.15fr 0.8fr 1fr 1fr 0.65fr 1.1fr 1.28fr 1.28fr 0.5fr';
const closedReportTableColumns = '1.2fr 0.95fr 0.95fr 0.85fr 0.7fr 1fr 0.95fr 0.65fr 1.15fr 1.2fr 1.2fr 1.2fr 0.5fr';
const reportStatusTabs: Array<{ value: ReportStatusTab; label: string }> = [
  { value: 'open', label: 'OPEN' },
  { value: 'awaitingReview', label: 'AWAITING REVIEW' },
  { value: 'closed', label: 'CLOSED' },
];

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function statusStyles(status: string) {
  if (status === 'CLOSED') {
    return {
      color: '#1A8B3E',
      border: '#84D39D',
      background: '#E8F8EC',
    };
  }

  if (status === 'REVIEW') {
    return {
      color: '#DB7A00',
      border: '#FFC076',
      background: '#FFF1DE',
    };
  }

  return {
    color: '#0F6AE8',
    border: '#8BC2FF',
    background: '#ECF5FF',
  };
}

function classificationStyles(classification: ReportRow['classification']) {
  if (classification === 'SAFE') {
    return {
      color: '#1A8B3E',
      border: '#84D39D',
      background: '#ECFDF3',
    };
  }

  return {
    color: '#F04438',
    border: '#FDA29B',
    background: '#FFF1F0',
  };
}

function riskStyles(risk: ReportRow['risk']) {
  if (risk === 'LOW') {
    return {
      color: '#1A8B3E',
      border: '#84D39D',
      background: '#ECFDF3',
    };
  }

  if (risk === 'HIGH') {
    return {
      color: '#F04438',
      border: '#FDA29B',
      background: '#FFF1F0',
    };
  }

  return {
    color: '#DB7A00',
    border: '#FFC076',
    background: '#FFF5E8',
  };
}

function numberLabel(value: number) {
  return `${value}`;
}

function linePath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

function maxValue(values: number[]) {
  return values.reduce((highest, value) => Math.max(highest, value), 0);
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      <Typography sx={{ fontSize: 9.8, color: '#5A6472', lineHeight: 1 }}>{label}</Typography>
    </Box>
  );
}

function DashboardCard({
  title,
  subtitle,
  headerRight,
  children,
  minHeight,
}: {
  title: string;
  subtitle?: string;
  headerRight?: ReactNode;
  children: ReactNode;
  minHeight?: number;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 1,
        border: '1px solid #DDE4EC',
        bgcolor: '#FFFFFF',
        p: 1.12,
        minHeight,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, mb: 0.88 }}>
        <Box>
          <Typography sx={{ fontSize: 12.6, color: '#2E333B', fontWeight: 700, lineHeight: 1.2 }}>{title}</Typography>
          {subtitle ? (
            <Typography sx={{ fontSize: 9.4, color: '#7A828E', mt: 0.32, lineHeight: 1.2 }}>{subtitle}</Typography>
          ) : null}
        </Box>
        {headerRight}
      </Box>
      {children}
    </Paper>
  );
}


function PersonCell({ name }: { name: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0 }}>
      <Avatar
        src={personPhotos[name]}
        alt={name}
        sx={{
          width: 16,
          height: 16,
          fontSize: 8,
          bgcolor: '#E7ECF3',
          color: '#334155',
          border: '1px solid rgba(148, 163, 184, 0.35)',
        }}
      >
        {initials(name)}
      </Avatar>
      <Typography
        sx={{
          fontSize: 11,
          color: '#2C313A',
          lineHeight: 1.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {name}
      </Typography>
    </Box>
  );
}

type ReportSummaryCardProps = {
  primary: string;
  suffix: string;
  label: string;
  counter?: string;
  accent: string;
  background: string;
  progress?: string;
  progressTrack?: string;
};

function ReportSummaryCard({
  primary,
  suffix,
  label,
  counter,
  accent,
  background,
  progress,
  progressTrack,
}: ReportSummaryCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        minHeight: 56,
        borderRadius: 1,
        border: '1px solid #DDE4EC',
        bgcolor: background,
        px: 1.15,
        py: 0.85,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: accent }} />
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 0.75 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.2 }}>
          <Typography sx={{ fontSize: 19, lineHeight: 1, color: '#202124', fontWeight: 400 }}>{primary}</Typography>
          <Typography sx={{ fontSize: suffix === '%' ? 11 : 12, lineHeight: 1.35, color: '#4B5563' }}>{suffix}</Typography>
        </Box>
        {counter ? (
          <Box
            sx={{
              minWidth: 34,
              height: 14,
              px: 0.45,
              borderRadius: 999,
              bgcolor: '#E2E8F0',
              color: '#4B5563',
              fontSize: 9,
              lineHeight: '14px',
              textAlign: 'center',
            }}
          >
            {counter}
          </Box>
        ) : null}
      </Box>
      <Typography sx={{ fontSize: 10.5, color: '#3E4652', mt: 0.55, lineHeight: 1.15 }}>{label}</Typography>
      {progress && progressTrack ? (
        <Box sx={{ mt: 0.95, height: 3, borderRadius: 999, bgcolor: progressTrack, overflow: 'hidden' }}>
          <Box sx={{ width: progress, height: '100%', bgcolor: accent }} />
        </Box>
      ) : null}
    </Paper>
  );
}


function ReportsSearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ fontSize: 10, lineHeight: 1, color: '#6B7280', mb: 0.45, ml: 1 }}>Search</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) auto',
          alignItems: 'center',
          width: { xs: '100%', sm: 248 },
          height: 32,
          border: '1px solid #D3DAE6',
          borderRadius: 1.2,
          px: 1.15,
          bgcolor: '#FFFFFF',
        }}
      >
        <InputBase
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search ID"
          sx={{
            width: '100%',
            '& .MuiInputBase-input': {
              p: 0,
              fontSize: 11.5,
              lineHeight: 1.3,
              color: '#2C313A',
              '::placeholder': {
                color: '#A3AAB6',
                opacity: 1,
              },
            },
          }}
        />
        <SearchIcon sx={{ fontSize: 18, color: '#0B63E5' }} />
      </Box>
    </Box>
  );
}

function ReportsFilterSelect() {
  return (
    <Box
      sx={{
        width: 72,
        height: 30,
        border: '1px solid #D3DAE6',
        borderRadius: 1.2,
        px: 1,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        bgcolor: '#FFFFFF',
      }}
    >
      <Box>
        <Typography sx={{ fontSize: 8.5, lineHeight: 1, color: '#6B7280' }}>Report Type</Typography>
        <Typography sx={{ fontSize: 11, lineHeight: 1.3, color: '#2C313A' }}>All</Typography>
      </Box>
      <ExpandMoreIcon sx={{ fontSize: 16, color: '#6B7280' }} />
    </Box>
  );
}

function ReportsFilterModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [period] = useState('May 05, 2026 - May 30, 2026');
  const [reportType] = useState('All');
  const [status] = useState('All');
  const [risk] = useState('All');
  const [submitter] = useState('All');
  const [area] = useState('All');
  const [unit] = useState('All');
  const [line] = useState('All');

  const FilterField = ({
    label,
    value,
    calendar = false,
  }: {
    label: string;
    value: string;
    calendar?: boolean;
  }) => (
    <Box
      sx={{
        position: 'relative',
        height: 42,
        border: '1px solid #D3DAE6',
        borderRadius: 1.6,
        px: 1.2,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        bgcolor: '#FFFFFF',
      }}
    >
      <Typography
        sx={{
          position: 'absolute',
          top: -8,
          left: 11,
          px: 0.45,
          bgcolor: '#FFFFFF',
          fontSize: 10,
          lineHeight: 1,
          color: '#8A93A6',
        }}
      >
        {label}
      </Typography>
      <Typography sx={{ fontSize: 12, color: '#2C313A', lineHeight: 1.3 }}>{value}</Typography>
      {calendar ? (
        <CalendarTodayIcon sx={{ fontSize: 16, color: '#6B7280' }} />
      ) : (
        <ExpandMoreIcon sx={{ fontSize: 16, color: '#6B7280' }} />
      )}
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ bgcolor: '#FFFFFF', borderRadius: 2, overflow: 'hidden' }}>
        <Box
          sx={{
            px: 2.2,
            py: 1.5,
            borderBottom: '1px solid #E5EAF1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#202124' }}>Filters</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#2463EB' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ px: 2.2, pt: 1.9, pb: 2.2 }}>
          <Box sx={{ display: 'grid', gap: 1.7 }}>
            <FilterField label="Period" value={period} calendar />
            <FilterField label="Report Type" value={reportType} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <FilterField label="Status" value={status} />
              <FilterField label="Risk" value={risk} />
            </Box>
            <FilterField label="Submitter" value={submitter} />
            <FilterField label="Area" value={area} />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <FilterField label="Unit" value={unit} />
              <FilterField label="Line" value={line} />
            </Box>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.2, mt: 3.2 }}>
            <Button onClick={onClose} sx={{ minWidth: 0, p: 0, color: '#2463EB', fontSize: 12, fontWeight: 800 }}>
              CLEAN
            </Button>
            <Button
              variant="contained"
              onClick={onClose}
              sx={{
                minWidth: 58,
                height: 32,
                borderRadius: 1.4,
                bgcolor: '#2463EB',
                boxShadow: 'none',
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              APPLY
            </Button>
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 54,
        borderRadius: 1.1,
        bgcolor: '#EDF1F5',
        px: 1,
        py: 0.75,
      }}
    >
      <Typography sx={{ fontSize: 9.5, color: '#707783', mb: 0.35 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12.2, color: '#202124', lineHeight: 1.35 }}>{value}</Typography>
    </Paper>
  );
}

function CountCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 46,
        borderRadius: 1.1,
        border: '1px solid #D8E0EA',
        bgcolor: '#EDF1F5',
        px: 1,
        py: 0.65,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', left: 0, top: 7, bottom: 7, width: 4, borderRadius: 999, bgcolor: accent }} />
      <Typography sx={{ fontSize: 9.5, color: '#707783', ml: 0.5 }}>{label}</Typography>
      <Typography sx={{ fontSize: 24, lineHeight: 1, color: '#202124', fontWeight: 400, ml: 0.5, mt: 0.2 }}>{value}</Typography>
    </Paper>
  );
}

export function BbsReportDrawer({
  mode,
  report,
  onClose,
}: {
  mode: ReportPanelMode;
  report: ReportRow | null;
  onClose: () => void;
}) {
  if (!report) {
    return null;
  }

  const isConditionLike = report.type === 'Condition Report' || report.type === 'Near Miss';

  if (isConditionLike) {
    return <ConditionReportDrawer mode={mode} report={report} onClose={onClose} />;
  }

  return (
    <Drawer
      anchor="right"
      open={Boolean(report)}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 520 },
          maxWidth: '100vw',
          bgcolor: '#FFFFFF',
          borderLeft: '1px solid #DDE4EC',
          boxShadow: '-16px 0 36px rgba(15,23,42,0.16)',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)' }}>
        <Box sx={{ px: 1.3, py: 1.15, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E7ECF3' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 900, color: '#202124' }}>{report.type}</Typography>
            <Chip
              label={report.id}
              size="small"
              sx={{
                height: 20,
                borderRadius: 999,
                bgcolor: '#E7EBF0',
                color: '#5F6875',
                fontSize: 10.5,
              }}
            />
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#2463EB' }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ minHeight: 0, overflowY: 'auto', px: 1, py: 1 }}>
          {report.type === 'BBS' ? (
            <>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mb: 1.25 }}>
                <CountCard label="Safe" value="3" accent="#54B36E" />
                <CountCard label="Unsafe" value="2" accent="#F15B5B" />
              </Box>

              <ReviewSectionHeading title="Observer info" />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7, mb: 0.7 }}>
                <ReviewStaticField label="Observer Name" value="Jose Rodriguez" />
                <ReviewStaticField label="Occurrence Date" value="March 10, 2026" />
                <ReviewStaticField label="Shift" value="B" />
                <ReviewStaticField label="Area" value={report.area} />
              </Box>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 0.55, mb: 1.15 }}>
                {[
                  { n: 2, label: 'Employees' },
                  { n: 0, label: 'Contractors' },
                  { n: 0, label: 'Visitors' },
                ].map((item) => (
                  <Box key={item.label} sx={{ height: 20, borderRadius: 999, border: '1px solid #C9D2DE', bgcolor: '#F3F5F8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.35, fontSize: 12 }}>
                    <Typography sx={{ color: '#2463EB', fontSize: 12, fontWeight: 800 }}>{item.n}</Typography>
                    <Typography sx={{ color: '#3B414A', fontSize: 12 }}>{item.label}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mb: 0.8 }}>
                <ReviewSectionHeading title="Task Observed" />
                <ReviewStaticField label="Task Observed" value={reportReviewMeta(report).summaryText} />
              </Box>

              <ReviewSectionHeading title="Categories" />
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.05 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
                  <PpeIcon sx={{ fontSize: 16, color: '#2463EB' }} />
                  <Typography sx={{ fontSize: 15, color: '#4A5564' }}>PPE</Typography>
                </Box>
                <ExpandMoreIcon sx={{ fontSize: 18, color: '#2463EB' }} />
              </Box>

              <ReviewSectionHeading title="BBS Barriers" />
              <ReviewStaticField
                label="Observer Comments - Why / Barrier Clarification"
                value={reportReviewMeta(report).recommendation}
              />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, flexWrap: 'wrap', my: 0.7 }}>
                {reportReviewMeta(report).categories.map((label) => <ReviewPill key={label} label={label} />)}
              </Box>

              <ReviewStaticField
                label="Commitment Agreed"
                value={'"I agree to always check the positioning of my hands before engaging the press brake and will report any guard malfunctions immediately."'}
              />
            </>
          ) : null}
        </Box>
      </Box>
    </Drawer>
  );
}

function DashboardFilterSelect({
  label,
  value,
  wide = false,
  calendar = false,
  width,
  onClick,
}: {
  label: string;
  value: string;
  wide?: boolean;
  calendar?: boolean;
  width?: number;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        width: width ?? (wide ? 204 : 160),
        height: 30,
        border: '1px solid #D3DAE6',
        borderRadius: 1,
        px: 0.95,
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr) auto',
        alignItems: 'center',
        bgcolor: '#FFFFFF',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 8.5, lineHeight: 1, color: '#6B7280' }}>{label}</Typography>
        <Typography sx={{ fontSize: 11.2, lineHeight: 1.3, color: '#2C313A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {value}
        </Typography>
      </Box>
      {calendar ? <CalendarTodayIcon sx={{ fontSize: 14, color: '#6B7280' }} /> : <ExpandMoreIcon sx={{ fontSize: 16, color: '#6B7280' }} />}
    </Box>
  );
}

function SiteHeatMapCard({ onToggleView }: { onToggleView?: () => void }) {
  const [activeType, setActiveType] = useState<SiteHeatmapType>('BBS');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [behaviorFilter] = useState('All');
  const [statusFilter] = useState('All');
  const [categoryFilter] = useState('All');
  const [mapViewFilter] = useState('EHS');
  const markers = siteHeatmapMarkers[activeType];
  const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId) ?? null;
  const selectedMarkerX = selectedMarker ? Number.parseFloat(selectedMarker.x) : null;
  const selectedMarkerY = selectedMarker ? Number.parseFloat(selectedMarker.y) : null;

  const heatMapLegend = (() => {
    if (activeType === 'Condition Report') {
      return [
        { color: '#F05F5F', label: 'High' },
        { color: '#F39C4D', label: 'Medium' },
        { color: '#F6B85D', label: 'Low' },
      ];
    }

    if (activeType === 'Near Miss') {
      return [
        { color: '#FF7FA8', label: 'Near Miss' },
      ];
    }

    return [
      { color: '#7FD58C', label: 'Safe' },
      { color: '#FF7F7F', label: 'Unsafe' },
    ];
  })();
  const heatMapLegendTitle = activeType === 'Condition Report'
    ? 'RISK'
    : activeType === 'BBS'
      ? 'BEHAVIOR'
      : '';

  return (
    <DashboardCard
      title="Heat Map By Area"
      minHeight={590}
      headerRight={(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {activeType === 'BBS' ? (
            <>
              <DashboardFilterSelect label="Behavior" value={behaviorFilter} width={118} />
              <DashboardFilterSelect label="Map View Filter" value={mapViewFilter} width={142} />
            </>
          ) : (
            <>
              <DashboardFilterSelect label="Status" value={statusFilter} width={92} />
              <DashboardFilterSelect label="Category" value={categoryFilter} width={110} />
              <DashboardFilterSelect label="Map View Filter" value={mapViewFilter} width={142} />
            </>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {siteHeatmapTypeOptions.map((type) => {
              const active = activeType === type;
              return (
                <Button
                  key={type}
                  onClick={() => {
                    setActiveType(type);
                    setSelectedMarkerId(null);
                  }}
                  sx={{
                    minWidth: 0,
                    height: 28,
                    px: 1.2,
                    borderRadius: 0,
                    border: '1px solid #D3DAE6',
                    borderLeftWidth: type === 'BBS' ? 1 : 0,
                    bgcolor: active ? '#EDF3FF' : '#FFFFFF',
                    color: '#2E333B',
                    fontSize: 10.2,
                    fontWeight: active ? 700 : 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {type.toUpperCase()}
                </Button>
              );
            })}
          </Box>
          <Box sx={{ display: 'inline-flex', border: '1px solid #D3DAE6', borderRadius: 0.7, overflow: 'hidden' }}>
            <IconButton onClick={onToggleView} sx={{ width: 36, height: 36, borderRadius: 0, color: '#2463EB', bgcolor: '#EDF3FF' }}>
              <TableRowsOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton sx={{ width: 36, height: 36, borderRadius: 0, color: '#5B6470' }}>
              <MapOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      )}
    >
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: 470, md: 520 },
          borderRadius: 1,
          overflow: 'hidden',
          border: '1px solid #EEF2F7',
          bgcolor: '#F8F7F3',
          background: 'radial-gradient(circle at center, rgba(239, 236, 229, 0.95) 0%, rgba(246, 245, 241, 0.96) 42%, rgba(250, 250, 249, 1) 100%)',
          '@keyframes siteMarkerPulse': {
            '0%': {
              transform: 'translate(-50%, -50%) scale(0.92)',
              opacity: 0.72,
            },
            '70%': {
              transform: 'translate(-50%, -50%) scale(1.6)',
              opacity: 0,
            },
            '100%': {
              transform: 'translate(-50%, -50%) scale(1.7)',
              opacity: 0,
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: { xs: 430, sm: 510, md: 620, lg: 720 },
            maxWidth: '94%',
            aspectRatio: '1353 / 1163',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <Box
            component="img"
            src="/images/ESO image.png"
            alt="ESO heat map"
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              transform: 'scale(1.08)',
              transformOrigin: 'center center',
              userSelect: 'none',
              pointerEvents: 'none',
              filter: 'drop-shadow(0 24px 34px rgba(128, 120, 108, 0.16))',
            }}
          />

          {markers.map((marker) => {
            const isSafe = marker.tone === 'safe';
            const severityTone = marker.detail.kind === 'BBS'
              ? null
              : marker.detail.severity.high >= marker.detail.severity.medium && marker.detail.severity.high >= marker.detail.severity.low
                ? 'high'
                : marker.detail.severity.medium >= marker.detail.severity.low
                  ? 'medium'
                  : 'low';

            const palette = activeType === 'Condition Report'
              ? severityTone === 'high'
                ? { fill: '#F05F5F', border: '#E45145', glow: 'rgba(240, 95, 95, 0.34)' }
                : severityTone === 'medium'
                  ? { fill: '#F39C4D', border: '#E27E27', glow: 'rgba(243, 156, 77, 0.34)' }
                  : { fill: '#F6C343', border: '#E7A91D', glow: 'rgba(246, 195, 67, 0.34)' }
              : activeType === 'Near Miss'
                ? { fill: '#FF7FA8', border: '#F25B90', glow: 'rgba(255, 127, 168, 0.34)' }
                : isSafe
                  ? { fill: '#7FD58C', border: '#56B96B', glow: 'rgba(127, 213, 140, 0.34)' }
                  : { fill: '#FF7F7F', border: '#F05656', glow: 'rgba(255, 127, 127, 0.34)' };

            const shouldPulse = activeType === 'Near Miss' || activeType === 'Condition Report' || !isSafe;

            return (
              <Box
                key={marker.id}
                onClick={() => setSelectedMarkerId(marker.id)}
                sx={{
                  position: 'absolute',
                  left: marker.x,
                  top: marker.y,
                  width: 30,
                  height: 30,
                  transform: 'translate(-50%, -50%)',
                  cursor: 'pointer',
                  zIndex: 2,
                  transition: 'transform 140ms ease',
                  '&:hover': {
                    transform: 'translate(-50%, -50%) scale(1.08)',
                  },
                }}
              >
                {shouldPulse ? (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      bgcolor: palette.glow,
                      animation: 'siteMarkerPulse 2.15s ease-out infinite',
                    }}
                  />
                ) : null}
                <Box
                  sx={{
                    position: 'relative',
                    zIndex: 1,
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    bgcolor: '#FFFFFF',
                    border: `2px solid ${palette.border}`,
                    display: 'grid',
                    placeItems: 'center',
                    color: palette.border,
                    fontSize: 11,
                    fontWeight: 700,
                    boxShadow: `0 8px 20px ${palette.glow}`,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      inset: 4,
                      borderRadius: '50%',
                      bgcolor: palette.fill,
                      opacity: 0.28,
                    },
                  }}
                >
                  <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                    {marker.count}
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        {heatMapLegend.length ? (
          <Box
            sx={{
              position: 'absolute',
              right: 14,
              bottom: 14,
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              px: 1,
              py: 0.75,
              borderRadius: 1,
              bgcolor: 'rgba(255, 255, 255, 0.9)',
              border: '1px solid #E6EBF2',
            }}
          >
            {heatMapLegendTitle ? (
              <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#6E7785', letterSpacing: '0.12em', mb: 0.15 }}>
                {heatMapLegendTitle}
              </Typography>
            ) : null}
            {heatMapLegend.map((entry) => (
              <LegendDot key={entry.label} color={entry.color} label={entry.label} />
            ))}
          </Box>
        ) : null}

        {selectedMarker ? (
          <SiteHeatMapDetailsPanel
            detail={selectedMarker.detail}
            anchorX={selectedMarkerX ?? 50}
            anchorY={selectedMarkerY ?? 50}
            onClose={() => setSelectedMarkerId(null)}
          />
        ) : null}
      </Box>
    </DashboardCard>
  );
}

function SiteHeatMapDetailsPanel({
  detail,
  anchorX,
  anchorY,
  onClose,
}: {
  detail: SiteHeatmapDetail;
  anchorX: number;
  anchorY: number;
  onClose: () => void;
}) {
  const conditionTotal = detail.kind === 'BBS' ? 0 : detail.severity.low + detail.severity.medium + detail.severity.high;
  const isNearMiss = detail.kind === 'Near Miss';
  const placeLeft = anchorX <= 63;
  const placeAbove = anchorY >= 56;

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'absolute',
        left: placeLeft ? `calc(${anchorX}% + 24px)` : 'auto',
        right: placeLeft ? 'auto' : `calc(${100 - anchorX}% + 24px)`,
        top: placeAbove ? 'auto' : `calc(${anchorY}% + 18px)`,
        bottom: placeAbove ? `calc(${100 - anchorY}% + 18px)` : 'auto',
        zIndex: 4,
        width: isNearMiss ? 286 : 236,
        maxWidth: isNearMiss ? 'min(286px, calc(100% - 18px))' : 'min(236px, calc(100% - 18px))',
        borderRadius: 1.6,
        border: '1px solid #D9E0E8',
        bgcolor: isNearMiss ? '#ECEFF1' : '#F3F6F9',
        boxShadow: '0 16px 34px rgba(15, 23, 42, 0.12)',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 1.1, pt: 0.85, pb: 0.6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.6 }}>
          <Chip
            label={detail.badge}
            size="small"
            sx={{
              height: 18,
              borderRadius: 999,
              bgcolor: '#F1F3F5',
              border: '1px solid #D2D8DF',
              color: '#344253',
              fontSize: 9,
              fontWeight: 700,
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.1 }}>
            <IconButton size="small" sx={{ color: '#5B6572', p: 0.2 }}>
              <OpenInNewIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton onClick={onClose} size="small" sx={{ color: '#5B6572', p: 0.2 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        <Typography sx={{ fontSize: 19, lineHeight: 1.05, fontWeight: 700, color: '#21262D', mb: 0.5 }}>
          {detail.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.45, mb: 0.8 }}>
          <LocationOnOutlinedIcon sx={{ fontSize: 13, color: '#7C8794' }} />
          <Typography sx={{ fontSize: 11, color: '#707B88' }}>{detail.location}</Typography>
        </Box>

        {detail.kind === 'BBS' ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.35 }}>
              <Typography sx={{ fontSize: 11, color: '#5F6B77' }}>Safe - {detail.safePercent}%</Typography>
              <Typography sx={{ fontSize: 11, color: '#5F6B77' }}>Unsafe - {detail.unsafePercent}%</Typography>
            </Box>
            <Box sx={{ display: 'flex', height: 4, borderRadius: 999, overflow: 'hidden', bgcolor: '#E5EAF0', mb: 1 }}>
              <Box sx={{ width: `${detail.safePercent}%`, bgcolor: '#77BF7D' }} />
              <Box sx={{ width: `${detail.unsafePercent}%`, bgcolor: '#E97B7B' }} />
            </Box>
          </>
        ) : detail.kind === 'Condition Report' ? (
          <>
            <Box sx={{ display: 'flex', height: 4, borderRadius: 999, overflow: 'hidden', bgcolor: '#E5EAF0', mb: 0.55 }}>
              <Box sx={{ width: `${(detail.severity.low / conditionTotal) * 100}%`, bgcolor: '#F6B85D' }} />
              <Box sx={{ width: `${(detail.severity.medium / conditionTotal) * 100}%`, bgcolor: '#F39C4D' }} />
              <Box sx={{ width: `${(detail.severity.high / conditionTotal) * 100}%`, bgcolor: '#F05F5F' }} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.95, flexWrap: 'wrap', mb: 1 }}>
              {[
                { label: `Low - ${detail.severity.low}`, color: '#F6B85D' },
                { label: `Medium - ${detail.severity.medium}`, color: '#F39C4D' },
                { label: `High - ${detail.severity.high}`, color: '#F05F5F' },
              ].map((item) => (
                <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                  <Box sx={{ width: 7, height: 7, borderRadius: 1, bgcolor: item.color }} />
                  <Typography sx={{ fontSize: 10.5, color: '#7A8591' }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </>
        ) : null}

        <Typography sx={{ fontSize: 12.2, fontWeight: 700, color: '#2A3138', mb: 0.7 }}>Last Reports</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.55 }}>
          {detail.reports.map((report) => (
            <Box
              key={report.id}
              sx={{
                borderRadius: 1.2,
                border: '1px solid #D8E0E8',
                bgcolor: isNearMiss ? '#E2E6EA' : '#EEF2F5',
                px: 1,
                py: 0.7,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.5 }}>
                <Typography sx={{ fontSize: 12.3, fontWeight: 800, color: '#20262D' }}>{report.id}</Typography>
                <Typography sx={{ fontSize: 10.4, color: '#7A8591', whiteSpace: 'nowrap' }}>{report.date}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexWrap: 'wrap' }}>
                {report.tags.map((tag) => (
                  <Chip
                    key={`${report.id}-${tag}`}
                    label={tag}
                    size="small"
                    sx={{
                      height: 17,
                      borderRadius: 999,
                      bgcolor: '#DDE3E8',
                      color: '#3A434E',
                      fontSize: 8.2,
                      fontWeight: 700,
                      letterSpacing: '0.02em',
                    }}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Paper>
  );
}

function UnsafeReportsInSiteCard({ onToggleView, showMap = false }: { onToggleView?: () => void; showMap?: boolean }) {
  const [activeType, setActiveType] = useState<SiteHeatmapType>('BBS');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [behaviorFilter] = useState('All');
  const [statusFilter] = useState('All');
  const [categoryFilter] = useState('All');
  const [mapViewFilter] = useState('EHS');
  const markers = siteHeatmapMarkers[activeType];
  const selectedMarker = markers.find((marker) => marker.id === selectedMarkerId) ?? null;
  const selectedMarkerX = selectedMarker ? Number.parseFloat(selectedMarker.x) : null;
  const selectedMarkerY = selectedMarker ? Number.parseFloat(selectedMarker.y) : null;

  const heatMapLegend = (() => {
    if (activeType === 'Condition Report') return [{ color: '#F05F5F', label: 'High' }, { color: '#F39C4D', label: 'Medium' }, { color: '#F6B85D', label: 'Low' }];
    if (activeType === 'Near Miss') return [{ color: '#FF7FA8', label: 'Near Miss' }];
    return [{ color: '#7FD58C', label: 'Safe' }, { color: '#FF7F7F', label: 'Unsafe' }];
  })();
  const heatMapLegendTitle = activeType === 'Condition Report' ? 'RISK' : activeType === 'BBS' ? 'BEHAVIOR' : '';
  return (
    <DashboardCard
      title={showMap ? 'Heat Map By Area' : 'Unsafe Reports in Site'}
      minHeight={showMap ? 590 : 326}
      headerRight={(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {showMap ? (
            <>
              {activeType === 'BBS' ? (
                <>
                  <DashboardFilterSelect label="Behavior" value={behaviorFilter} width={118} />
                  <DashboardFilterSelect label="Map View Filter" value={mapViewFilter} width={142} />
                </>
              ) : (
                <>
                  <DashboardFilterSelect label="Status" value={statusFilter} width={92} />
                  <DashboardFilterSelect label="Category" value={categoryFilter} width={110} />
                  <DashboardFilterSelect label="Map View Filter" value={mapViewFilter} width={142} />
                </>
              )}
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {siteHeatmapTypeOptions.map((type) => {
                  const active = activeType === type;
                  return (
                    <Button
                      key={type}
                      onClick={() => {
                        setActiveType(type);
                        setSelectedMarkerId(null);
                      }}
                      sx={{ minWidth: 0, height: 28, px: 1.2, borderRadius: 0, border: '1px solid #D3DAE6', borderLeftWidth: type === 'BBS' ? 1 : 0, bgcolor: active ? '#EDF3FF' : '#FFFFFF', color: '#2E333B', fontSize: 10.2, fontWeight: active ? 700 : 500, whiteSpace: 'nowrap' }}
                    >
                      {type.toUpperCase()}
                    </Button>
                  );
                })}
              </Box>
            </>
          ) : null}
          <Box sx={{ display: 'inline-flex', border: '1px solid #D3DAE6', borderRadius: 0.7, overflow: 'hidden' }}>
            <IconButton onClick={showMap ? undefined : onToggleView} sx={{ width: 36, height: 36, borderRadius: 0, color: showMap ? '#2463EB' : '#5B6470', bgcolor: showMap ? '#EDF3FF' : 'transparent' }}>
              <MapOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton onClick={showMap ? onToggleView : undefined} sx={{ width: 36, height: 36, borderRadius: 0, color: !showMap ? '#2463EB' : '#5B6470', bgcolor: !showMap ? '#EDF3FF' : 'transparent' }}>
              <TableRowsOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
      )}
    >
      {showMap ? (
        <Box
          sx={{
            position: 'relative',
            minHeight: { xs: 470, md: 520 },
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid #EEF2F7',
            bgcolor: '#F8F7F3',
            background: 'radial-gradient(circle at center, rgba(239, 236, 229, 0.95) 0%, rgba(246, 245, 241, 0.96) 42%, rgba(250, 250, 249, 1) 100%)',
          }}
        >
          <Box sx={{ position: 'absolute', left: '50%', top: '50%', width: { xs: 430, sm: 510, md: 620, lg: 720 }, maxWidth: '94%', aspectRatio: '1353 / 1163', transform: 'translate(-50%, -50%)', zIndex: 1 }}>
            <Box component="img" src="/images/ESO image.png" alt="ESO heat map" sx={{ width: '100%', height: '100%', objectFit: 'contain', transform: 'scale(1.08)', transformOrigin: 'center center', userSelect: 'none', pointerEvents: 'none', filter: 'drop-shadow(0 24px 34px rgba(128, 120, 108, 0.16))' }} />
            {markers.map((marker) => {
              const isSafe = marker.tone === 'safe';
              const severityTone = marker.detail.kind === 'BBS' ? null : marker.detail.severity.high >= marker.detail.severity.medium && marker.detail.severity.high >= marker.detail.severity.low ? 'high' : marker.detail.severity.medium >= marker.detail.severity.low ? 'medium' : 'low';
              const palette = activeType === 'Condition Report'
                ? severityTone === 'high' ? { fill: '#F05F5F', border: '#E45145', glow: 'rgba(240, 95, 95, 0.34)' }
                : severityTone === 'medium' ? { fill: '#F39C4D', border: '#E27E27', glow: 'rgba(243, 156, 77, 0.34)' }
                : { fill: '#F6C343', border: '#E7A91D', glow: 'rgba(246, 195, 67, 0.34)' }
                : activeType === 'Near Miss'
                  ? { fill: '#FF7FA8', border: '#F25B90', glow: 'rgba(255, 127, 168, 0.34)' }
                  : isSafe
                    ? { fill: '#7FD58C', border: '#56B96B', glow: 'rgba(127, 213, 140, 0.34)' }
                    : { fill: '#FF7F7F', border: '#F05656', glow: 'rgba(255, 127, 127, 0.34)' };
              return (
                <Box key={marker.id} onClick={() => setSelectedMarkerId(marker.id)} sx={{ position: 'absolute', left: marker.x, top: marker.y, width: 30, height: 30, transform: 'translate(-50%, -50%)', cursor: 'pointer', zIndex: 2 }}>
                  <Box sx={{ position: 'relative', zIndex: 1, width: 30, height: 30, borderRadius: '50%', bgcolor: '#FFFFFF', border: `2px solid ${palette.border}`, display: 'grid', placeItems: 'center', color: palette.border, fontSize: 11, fontWeight: 700, boxShadow: `0 8px 20px ${palette.glow}`, '&::after': { content: '\"\"', position: 'absolute', inset: 4, borderRadius: '50%', bgcolor: palette.fill, opacity: 0.28 } }}>
                    <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>{marker.count}</Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
          {heatMapLegend.length ? (
            <Box sx={{ position: 'absolute', right: 14, bottom: 14, zIndex: 3, display: 'flex', flexDirection: 'column', gap: 0.5, px: 1, py: 0.75, borderRadius: 1, bgcolor: 'rgba(255, 255, 255, 0.9)', border: '1px solid #E6EBF2' }}>
              {heatMapLegendTitle ? <Typography sx={{ fontSize: 9.5, fontWeight: 800, color: '#6E7785', letterSpacing: '0.12em', mb: 0.15 }}>{heatMapLegendTitle}</Typography> : null}
              {heatMapLegend.map((entry) => <LegendDot key={entry.label} color={entry.color} label={entry.label} />)}
            </Box>
          ) : null}
          {selectedMarker ? <SiteHeatMapDetailsPanel detail={selectedMarker.detail} anchorX={selectedMarkerX ?? 50} anchorY={selectedMarkerY ?? 50} onClose={() => setSelectedMarkerId(null)} /> : null}
        </Box>
      ) : (
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0.8, border: '1px solid #DDE4EC', overflow: 'hidden', boxShadow: 'none' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#F7F9FC' }}>
              {['Report ID', 'Report Type', 'Area', 'Line', 'Risk', 'Status', 'Report Date'].map((header) => (
                <TableCell key={header} sx={{ fontSize: 10.5, fontWeight: 900, color: '#4C658B', py: 1.1 }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {unsafeSiteReports.map((row) => {
              const riskTone = riskStyles(row.risk as ReportRow['risk']);
              const statusTone = statusStyles(row.status);
              return (
                <TableRow key={row.id} sx={{ '& td': { borderColor: '#E7EDF5', py: 0.95 } }}>
                  <TableCell sx={{ fontSize: 11.5, color: '#2E3742' }}>{row.id}</TableCell>
                  <TableCell sx={{ fontSize: 11.5, color: '#2E3742' }}>{row.type}</TableCell>
                  <TableCell sx={{ fontSize: 11.5, color: '#2E3742' }}>{row.area}</TableCell>
                  <TableCell sx={{ fontSize: 11.5, color: '#2E3742' }}>{row.line}</TableCell>
                  <TableCell>
                    <Chip label={row.risk} size="small" sx={{ height: 20, fontSize: 9.4, fontWeight: 800, color: riskTone.color, border: `1px solid ${riskTone.border}`, bgcolor: riskTone.background }} />
                  </TableCell>
                  <TableCell>
                    <Chip label={row.status} size="small" sx={{ height: 20, fontSize: 9.2, fontWeight: 800, color: statusTone.color, border: `1px solid ${statusTone.border}`, bgcolor: statusTone.background }} />
                  </TableCell>
                  <TableCell sx={{ fontSize: 11.5, color: '#2E3742' }}>{row.reportDate}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      )}
      {!showMap ? <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.1 }}>
        <Button sx={{ color: '#2463EB', fontSize: 11.5, fontWeight: 800 }}>
          SHOW ALL <ChevronRightIcon sx={{ fontSize: 16, ml: 0.3 }} />
        </Button>
      </Box> : null}
    </DashboardCard>
  );
}

type DashboardKpiCardProps = {
  value: string;
  suffix?: string;
  label: string;
  targetLabel?: string;
  delta?: string;
  deltaColor?: string;
  stackedSegments: ReadonlyArray<{ width: string; color: string }>;
  footerLegend?: ReadonlyArray<{ label: string; color: string }>;
  markerLine?: boolean;
  sparkline?: number[];
  calloutLines?: readonly string[];
  accentColor?: string;
  chevron?: boolean;
};

function DashboardKpiCard({
  value,
  suffix,
  label,
  targetLabel,
  delta,
  deltaColor,
  stackedSegments,
  footerLegend,
  markerLine = false,
  sparkline,
  calloutLines,
  accentColor,
  chevron = false,
}: DashboardKpiCardProps) {
  const maxSparkline = sparkline ? Math.max(...sparkline, 1) : 1;
  const sparklinePoints = sparkline?.map((value, index) => {
    const x = (index / Math.max(1, sparkline.length - 1)) * 112;
    const y = 32 - ((value / maxSparkline) * 26);
    return `${x},${y}`;
  }).join(' ');
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        minHeight: 68,
        borderRadius: 1,
        border: '1px solid #DDE4EC',
        bgcolor: '#F4F8FC',
        px: 1.1,
        py: 0.85,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, bgcolor: accentColor ?? '#B3BDC8' }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 0.85 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.2 }}>
          <Typography sx={{ fontSize: 19, lineHeight: 1, color: '#30343A', fontWeight: 400 }}>{value}</Typography>
          {suffix ? <Typography sx={{ fontSize: 11.5, lineHeight: 1.25, color: '#59616D' }}>{suffix}</Typography> : null}
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          {targetLabel ? <Typography sx={{ fontSize: 8.2, color: '#4D5865', fontWeight: 700 }}>{targetLabel}</Typography> : null}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.25, mt: 0.1 }}>
            {delta ? <Typography sx={{ fontSize: 9.4, color: deltaColor }}>{delta}</Typography> : null}
            {!calloutLines ? <Tooltip title="Compared to the same period last year" arrow placement="top">
              <IconButton
                size="small"
                sx={{
                  p: 0.1,
                  color: '#738092',
                  '&:hover': { color: '#526072' },
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 13 }} />
              </IconButton>
            </Tooltip> : null}
            {chevron ? <ChevronRightIcon sx={{ fontSize: 16, color: '#6D7480', mt: 0.2 }} /> : null}
          </Box>
        </Box>
      </Box>
      <Typography sx={{ fontSize: 9.8, color: '#4B5563', mt: 0.55, lineHeight: 1.15 }}>{label}</Typography>
      {calloutLines ? (
        <Box sx={{ display: 'grid', gap: 0.45, mt: 0.6 }}>
          {calloutLines.map((line) => (
            <Paper key={line} elevation={0} sx={{ px: 0.75, py: 0.45, bgcolor: '#F4F7FB', border: '1px solid #D6DEE8', borderRadius: 0.6 }}>
              <Typography sx={{ fontSize: 9.8, color: '#5B6470' }}>{line}</Typography>
            </Paper>
          ))}
        </Box>
      ) : sparkline ? (
        <Box sx={{ mt: 0.5, height: 34 }}>
          <svg viewBox="0 0 112 32" width="100%" height="100%" preserveAspectRatio="none">
            <polyline fill="none" stroke="#58C36C" strokeWidth="1.8" points={sparklinePoints} />
          </svg>
        </Box>
      ) : stackedSegments.length ? (
      <Box sx={{ position: 'relative', mt: 0.6, height: 4, borderRadius: 999, bgcolor: '#E2E8F0', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', height: '100%', width: '100%' }}>
          {stackedSegments.map((segment) => (
            <Box key={`${segment.color}-${segment.width}`} sx={{ width: segment.width, bgcolor: segment.color }} />
          ))}
        </Box>
        {markerLine ? (
          <Box sx={{ position: 'absolute', top: -2, left: '83%', width: 1.5, height: 8, bgcolor: '#FF5A5A', borderRadius: 1 }} />
        ) : null}
      </Box>
      ) : null}
      {footerLegend ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.6, flexWrap: 'wrap' }}>
          {footerLegend.map((entry) => (
            <LegendDot key={entry.label} color={entry.color} label={entry.label} />
          ))}
        </Box>
      ) : null}
    </Paper>
  );
}

function OverallBusinessUnitChart({ view }: { view: DashboardView }) {
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const chartHeight = 198;
  const chartWidth = 1180;
  const topPadding = 12;
  const bottomPadding = 30;
  const leftPadding = 38;
  const rightPadding = 20;
  const innerWidth = chartWidth - leftPadding - rightPadding;
  const innerHeight = chartHeight - topPadding - bottomPadding;
  const maxValue = 2.2;
  const ticks = [0, 0.35, 0.7, 1.05, 1.4, 1.75, 2.1];
  const bars = view === 'Site' ? areaBars : view === 'Business Unit' ? siteBars : businessUnitBars;
  const slotWidth = innerWidth / bars.length;
  const barWidth = 74;
  const targetWidth = 52;
  const yForValue = (value: number) => topPadding + innerHeight - (value / maxValue) * innerHeight;
  const title = view === 'Site'
    ? 'Overall ESO Contact Rate By Area'
    : view === 'Business Unit'
      ? 'Overall ESO Contact Rate By Site'
      : 'Overall ESO Contact Rate By Business Unit';

  return (
    <>
      <DashboardCard
        title={title}
        headerRight={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
            <LegendDot color="#2F6CF4" label="Target" />
            <LegendDot color="#81C784" label="Above Target" />
            <LegendDot color="#F34F4F" label="Below Target" />
          </Box>
        )}
        minHeight={256}
      >
        <Box sx={{ width: '100%', height: 198 }}>
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none" width="100%" height="100%">
            {ticks.map((tick) => {
              const y = yForValue(tick);
              return (
                <g key={tick}>
                  <line x1={leftPadding} y1={y} x2={chartWidth - rightPadding} y2={y} stroke="#EEF2F7" strokeWidth="1" />
                  <text x={leftPadding - 8} y={y + 3} textAnchor="end" fontSize="9" fill="#7A828E">
                    {tick}
                  </text>
                </g>
              );
            })}

            <line
              x1={leftPadding}
              y1={chartHeight - bottomPadding}
              x2={chartWidth - rightPadding}
              y2={chartHeight - bottomPadding}
              stroke="#8A93A0"
              strokeWidth="1"
            />

            {bars.map((bar, index) => {
              const slotX = leftPadding + index * slotWidth;
              const centerX = slotX + slotWidth / 2;
              const barHeight = (bar.value / maxValue) * innerHeight;
              const barX = centerX - barWidth / 2;
              const barY = topPadding + innerHeight - barHeight;
              const targetY = yForValue(bar.target);
              const isSiteAreaView = view === 'Site';

              return (
                <g
                  key={bar.label}
                  onClick={isSiteAreaView ? () => setSelectedArea(bar.label) : undefined}
                  style={{ cursor: isSiteAreaView ? 'pointer' : 'default' }}
                >
                  <rect x={barX} y={barY} width={barWidth} height={barHeight} fill={bar.tone} />
                  <line
                    x1={centerX - targetWidth / 2}
                    y1={targetY}
                    x2={centerX + targetWidth / 2}
                    y2={targetY}
                    stroke="#2F6CF4"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <text x={centerX} y={barY - 5} textAnchor="middle" fontSize="9" fill="#2F3440">
                    {bar.value}
                  </text>
                  <text
                    x={centerX}
                    y={chartHeight - 12}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#626C79"
                  >
                    {bar.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </Box>
      </DashboardCard>
      {selectedArea ? (
        <AreaContactRateModal area={selectedArea} open={Boolean(selectedArea)} onClose={() => setSelectedArea(null)} />
      ) : null}
    </>
  );
}

function AreaContactRateModal({
  area,
  open,
  onClose,
}: {
  area: string;
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'EMPLOYEE CHART' | 'EMPLOYEE LIST' | 'CONTRACTORS / VISITORS'>('EMPLOYEE CHART');
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [reportType, setReportType] = useState('All');
  const [company, setCompany] = useState('All');

  const employeeRows = [
    { name: 'Nina Prescott', line: 'Line D', shift: 'A', submission: 0, kind: 'below' as const },
    { name: 'Lucas Monroe', line: 'Line C', shift: 'A', submission: 1, kind: 'below' as const },
    { name: 'Ethan Caldwell', line: 'Line C', shift: 'A', submission: 1, kind: 'below' as const },
    { name: 'Maya Sinclair', line: 'Line A', shift: 'A', submission: 1, kind: 'below' as const },
    { name: 'Jasper Langley', line: 'Line D', shift: 'C', submission: 1, kind: 'below' as const },
    { name: 'Noah Fletcher', line: 'Line B', shift: 'B', submission: 2, kind: 'above' as const },
    { name: 'Mia Thornton', line: 'Line A', shift: 'B', submission: 2, kind: 'above' as const },
    { name: 'Liam Bennett', line: 'Line A', shift: 'B', submission: 3, kind: 'above' as const },
    { name: 'Sophia Caldwell', line: 'Line B', shift: 'C', submission: 3, kind: 'above' as const },
    { name: 'Evelyn Harper', line: 'Line A', shift: 'B', submission: 4, kind: 'above' as const },
    { name: 'Contractors/Visitors', line: '', shift: '', submission: 4, kind: 'contractor' as const },
  ];
  const contractorRows = [
    { reportId: '1007823', reportType: 'BBS', line: 'Line A', status: 'CLOSED', submitter: 'Ava Langston', company: 'NexaCorp', email: 'ava@nexa.com' },
    { reportId: '1007842', reportType: 'BBS', line: 'Line C', status: 'CLOSED', submitter: 'Robert Wilson', company: 'VertoTech', email: 'robert.w@verto.com' },
    { reportId: '1007857', reportType: 'Condition', line: 'Line B', status: 'CLOSED', submitter: 'Owen Carlisle', company: 'VertoTech', email: 'owen.c@verto.com' },
    { reportId: '1007859', reportType: 'Near Miss', line: 'Line A', status: 'CLOSED', submitter: 'Zoe Whitman', company: 'Aquila Solutions', email: 'zoe.w@aquila.com' },
  ];

  const filteredEmployeeRows = employeeRows.filter((row) =>
    row.name.toLowerCase().includes(employeeSearch.trim().toLowerCase()),
  );
  const filteredContractorRows = contractorRows.filter((row) =>
    (reportType === 'All' || row.reportType === reportType)
    && (company === 'All' || row.company === company),
  );

  const tabButton = (label: 'EMPLOYEE CHART' | 'EMPLOYEE LIST' | 'CONTRACTORS / VISITORS', icon: ReactNode) => (
    <Button
      key={label}
      onClick={() => setActiveTab(label)}
      sx={{
        minWidth: 0,
        px: 1,
        py: 0.55,
        borderRadius: 0,
        border: '1px solid #DDE4EC',
        borderRightWidth: label === 'CONTRACTORS / VISITORS' ? '1px' : 0,
        bgcolor: activeTab === label ? '#EDF3FF' : '#FFFFFF',
        color: activeTab === label ? '#2463EB' : '#5B6470',
        fontSize: 10.5,
        fontWeight: activeTab === label ? 800 : 700,
        gap: 0.55,
      }}
    >
      {icon}
      {label}
    </Button>
  );

  const renderEmployeeChart = () => {
    const target = 1.4;
    const max = 4;
    const targetLeft = `${(target / max) * 100}%`;
    return (
      <Box sx={{ pt: 1.2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1.5, mb: 0.8 }}>
          <Box sx={{ position: 'relative', px: 1.1, py: 0.2, bgcolor: '#2463EB', borderRadius: 999 }}>
            <Typography sx={{ fontSize: 9.3, fontWeight: 800, color: '#FFFFFF' }}>TARGET: 1.4</Typography>
          </Box>
          <LegendDot color="#81C784" label="Above Target" />
          <LegendDot color="#E57373" label="Below Target" />
        </Box>
        <Box sx={{ position: 'relative', borderTop: '1px solid #EDF2F7', pt: 1.2, pb: 1.1 }}>
          <Box sx={{ position: 'absolute', left: `calc(112px + ${targetLeft})`, top: 14, bottom: 16, borderLeft: '2px dashed #7EA9FF' }} />
          <Box sx={{ position: 'absolute', left: `calc(112px + ${targetLeft} - 30px)`, top: 0, px: 0.9, py: 0.2, bgcolor: '#2463EB', borderRadius: 999 }}>
            <Typography sx={{ fontSize: 9.3, fontWeight: 800, color: '#FFFFFF' }}>TARGET: 1.4</Typography>
          </Box>
          <Box sx={{ display: 'grid', gap: 0.55 }}>
            {employeeRows.map((row) => {
              const width = `${(row.submission / max) * 100}%`;
              const color = row.kind === 'contractor' ? '#4BB6EA' : row.kind === 'above' ? '#81C784' : '#E57373';
              return (
                <Box key={row.name} sx={{ display: 'grid', gridTemplateColumns: '108px minmax(0, 1fr) 20px', alignItems: 'center', gap: 0.7 }}>
                  <Typography sx={{ fontSize: 10.2, color: '#2E3742', textAlign: 'right', lineHeight: 1.15, whiteSpace: 'pre-line' }}>
                    {row.line ? `${row.name}\n${row.line}` : row.name}
                  </Typography>
                  <Box sx={{ height: 24, borderRadius: 0.45, overflow: 'hidden', bgcolor: '#F5F7FA' }}>
                    <Box sx={{ width, height: '100%', bgcolor: color, borderRadius: 0.45 }} />
                  </Box>
                  <Typography sx={{ fontSize: 10.2, color: '#2E3742' }}>{row.submission}</Typography>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  };

  const renderEmployeeList = () => (
    <Box sx={{ pt: 1.2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.9 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <Box sx={{ width: 292, border: '1px solid #D5DBE4', borderRadius: 1, px: 1, py: 0.6, display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <InputBase value={employeeSearch} onChange={(event) => setEmployeeSearch(event.target.value)} placeholder="Search for employee" sx={{ flex: 1, fontSize: 13 }} />
            <SearchIcon sx={{ fontSize: 18, color: '#556070' }} />
          </Box>
          <IconButton sx={{ color: '#2463EB' }}>
            <DownloadIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <Box sx={{ px: 1.1, py: 0.2, bgcolor: '#2463EB', borderRadius: 999 }}>
            <Typography sx={{ fontSize: 9.3, fontWeight: 800, color: '#FFFFFF' }}>TARGET: 1.4</Typography>
          </Box>
          <LegendDot color="#81C784" label="Above Target" />
          <LegendDot color="#E57373" label="Below Target" />
        </Box>
      </Box>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0.8, border: '1px solid #DDE4EC', overflow: 'hidden', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#FFFFFF' }}>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Employee</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Line</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Shift</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Individual Submission</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEmployeeRows.filter((row) => row.kind !== 'contractor').map((row) => (
              <TableRow key={row.name} sx={{ '& td': { borderColor: '#E7EDF5', py: 1.25 } }}>
                <TableCell sx={{ fontSize: 11.5 }}>{row.name}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.line}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.shift}</TableCell>
                <TableCell sx={{ fontSize: 11.5, fontWeight: 800, color: row.kind === 'above' ? '#2E8B43' : '#E45145' }}>{row.submission}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const renderContractors = () => (
    <Box sx={{ pt: 1.2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.9 }}>
        <TextField
          select
          size="small"
          label="Report type"
          value={reportType}
          onChange={(event) => setReportType(event.target.value)}
          sx={{ width: 195, '& .MuiInputBase-root': { fontSize: 13.2, borderRadius: 1 } }}
        >
          {['All', 'BBS', 'Condition', 'Near Miss'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Company"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          sx={{ width: 195, '& .MuiInputBase-root': { fontSize: 13.2, borderRadius: 1 } }}
        >
          {['All', 'NexaCorp', 'VertoTech', 'Aquila Solutions'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        <IconButton sx={{ color: '#2463EB' }}>
          <DownloadIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0.8, border: '1px solid #DDE4EC', overflow: 'hidden', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#FFFFFF' }}>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Report ID</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Report Type</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Line</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Status</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Submitter</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Company</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>E-mail</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContractorRows.map((row) => (
              <TableRow key={row.reportId} sx={{ '& td': { borderColor: '#E7EDF5', py: 1.1 } }}>
                <TableCell sx={{ fontSize: 11.5 }}>{row.reportId}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.reportType}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.line}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>
                  <Chip label={row.status} size="small" sx={{ height: 18, fontSize: 9.5, fontWeight: 800, color: '#1A8B3E', border: '1px solid #84D39D', bgcolor: '#E8F8EC' }} />
                </TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.submitter}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.company}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.email}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth slotProps={{ paper: { sx: { width: 'min(915px, calc(100vw - 24px))', maxWidth: 'none', borderRadius: 0.8 } } }}>
      <Box sx={{ bgcolor: '#FFFFFF' }}>
        <Box sx={{ px: 1.6, py: 1.2, borderBottom: '1px solid #E0E6F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 900, color: '#20262D' }}>{`ESO Contact Rate - ${area}`}</Typography>
          <IconButton onClick={onClose} sx={{ color: '#7A8591' }}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ px: 1.4, py: 1, borderBottom: '1px solid #E8EDF4', display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: 'inline-flex' }}>
            {tabButton('EMPLOYEE CHART', <BarChartOutlinedIcon sx={{ fontSize: 16 }} />)}
            {tabButton('EMPLOYEE LIST', <PersonOutlineIcon sx={{ fontSize: 16 }} />)}
            {tabButton('CONTRACTORS / VISITORS', <ApartmentIcon sx={{ fontSize: 16 }} />)}
          </Box>
        </Box>
        <Box sx={{ p: 1.2 }}>
          {activeTab === 'EMPLOYEE CHART' ? renderEmployeeChart() : activeTab === 'EMPLOYEE LIST' ? renderEmployeeList() : renderContractors()}
        </Box>
      </Box>
    </Dialog>
  );
}





function EsosByCategoryCard({ view }: { view: DashboardView }) {
  const [modalOpen, setModalOpen] = useState(false);
  const bbsRows = [
    { label: 'Chemical Handling', safe: 71, unsafe: 29 },
    { label: 'Procedures & Standards', safe: 75, unsafe: 25 },
    { label: 'Machine Guarding', safe: 77, unsafe: 23 },
    { label: 'Mobile Equipment', safe: 78, unsafe: 22 },
    { label: 'Lockout Tagout', safe: 80, unsafe: 20 },
  ];
  const conditionRows = conditionCategoryRows.slice(0, 5);
  const nearMissRows = nearMissCategoryRows.slice(0, 5);

  return (
    <DashboardCard
      title="ESOs By Category"
      headerRight={(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
          <LegendDot color="#81C784" label="Safe" />
          <LegendDot color="#F45A5A" label="Unsafe" />
        </Box>
      )}
      minHeight={292}
    >
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0.8, border: '1px solid #DDE4EC', overflow: 'hidden', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F7F9FC' }}>
              <TableCell sx={{ fontSize: 10.5, fontWeight: 900, color: '#2E3742' }}>BBS categories</TableCell>
              <TableCell sx={{ fontSize: 10.5, fontWeight: 900, color: '#2E3742' }}>Condition categories</TableCell>
              <TableCell sx={{ fontSize: 10.5, fontWeight: 900, color: '#2E3742' }}>Near Miss categories</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bbsRows.map((row, index) => (
              <TableRow key={row.label} sx={{ '& td': { borderColor: '#E7EDF5', py: 0.6 } }}>
                <TableCell sx={{ fontSize: 10.6, color: '#2E3742' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8 }}>
                    <Typography sx={{ fontSize: 10.6 }}>{row.label}</Typography>
                    <Typography sx={{ fontSize: 10.2, color: '#6FBF73' }}>{row.safe}% - <Box component="span" sx={{ color: '#F45A5A' }}>{row.unsafe}%</Box></Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: 10.6, color: '#2E3742' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8 }}>
                    <Typography sx={{ fontSize: 10.6 }}>{conditionRows[index]?.label}</Typography>
                    <Typography sx={{ fontSize: 10.2, color: '#F45A5A' }}>{conditionRows[index]?.value}%</Typography>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontSize: 10.6, color: '#2E3742' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.8 }}>
                    <Typography sx={{ fontSize: 10.6 }}>{nearMissRows[index]?.label}</Typography>
                    <Typography sx={{ fontSize: 10.2, color: '#F45A5A' }}>{nearMissRows[index]?.value}%</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.1 }}>
        <Button onClick={() => setModalOpen(true)} sx={{ color: '#2463EB', fontSize: 11.5, fontWeight: 800 }}>
          ALL CATEGORIES <ChevronRightIcon sx={{ fontSize: 16, ml: 0.3 }} />
        </Button>
      </Box>
      <EsoByCategoryModal open={modalOpen} onClose={() => setModalOpen(false)} enableSiteBbsDrilldown={view === 'Site'} />
    </DashboardCard>
  );
}

function EsoByCategoryModal({
  open,
  onClose,
  enableSiteBbsDrilldown,
}: {
  open: boolean;
  onClose: () => void;
  enableSiteBbsDrilldown: boolean;
}) {
  const [activeTab, setActiveTab] = useState<'BBS' | 'CONDITION' | 'NEAR MISS'>('BBS');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [conditionMode, setConditionMode] = useState<'SAFE' | 'UNSAFE'>('UNSAFE');
  const [selectedBbsCategory, setSelectedBbsCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!enableSiteBbsDrilldown) {
      setSelectedBbsCategory(null);
    }
  }, [enableSiteBbsDrilldown]);

  const bbsChartRows = [
    { label: 'Chemical Handling', safe: 71, unsafe: 29 },
    { label: 'Procedures & Standards', safe: 75, unsafe: 25 },
    { label: 'Machine Guarding', safe: 77, unsafe: 23 },
    { label: 'Mobile Equipment', safe: 78, unsafe: 22 },
    { label: 'Lockout Tagout', safe: 80, unsafe: 20 },
    { label: 'Fall Protection', safe: 83, unsafe: 17 },
    { label: 'Body Position', safe: 84, unsafe: 16 },
    { label: '5S Housekeeping', safe: 86, unsafe: 14 },
    { label: 'Tools & Equipment', safe: 86, unsafe: 14 },
    { label: 'Body Use', safe: 88, unsafe: 12 },
    { label: 'Speak up', safe: 88, unsafe: 12 },
    { label: 'Environmental Stewardship', safe: 90, unsafe: 10 },
    { label: 'PPE', safe: 91, unsafe: 9 },
    { label: 'Safe Walking', safe: 91, unsafe: 9 },
  ];
  const conditionChartRows = [
    { label: 'PPE', unsafe: 19, safe: 17 },
    { label: 'Ergonomics', unsafe: 16, safe: 12 },
    { label: 'Electrical Safety', unsafe: 15, safe: 11 },
    { label: '5S / Housekeeping', unsafe: 13, safe: 11 },
    { label: 'Facilities / Building', unsafe: 11, safe: 10 },
    { label: 'Contractors / Visitors', unsafe: 9, safe: 8 },
    { label: 'BloodbornePathogens', unsafe: 8, safe: 7 },
    { label: 'Cranes / Lifts / Hoists', unsafe: 6, safe: 7 },
    { label: 'Confined Spaces', unsafe: 4, safe: 3 },
    { label: 'Tools & Equipment', unsafe: 4, safe: 3 },
    { label: 'Mobile Equipment', unsafe: 4, safe: 2 },
    { label: 'Machine Guarding', unsafe: 3, safe: 1 },
  ];
  const nearMissChartRows = [
    { label: 'Fall Protection', value: 27 },
    { label: 'Chemical Safety', value: 19 },
    { label: 'Lockout/Tagout', value: 19 },
    { label: 'Environmental Stewardship', value: 16 },
    { label: 'Machine Guarding', value: 15 },
    { label: 'Mobile Equipment', value: 9 },
    { label: 'Bloodborne Pathogens', value: 8 },
    { label: 'Cranes / Lifts / Hoists', value: 6 },
    { label: 'Confined Spaces', value: 4 },
    { label: 'Tools & Equipment', value: 4 },
    { label: '5S / Housekeeping', value: 4 },
    { label: 'PPE', value: 3 },
  ];
  const bbsTableRows = [
    { label: 'Fall Protection', count: 54, unsafe: '71%', safe: '29%' },
    { label: 'Chemical Safety', count: 38, unsafe: '75%', safe: '25%' },
    { label: 'Lockout/Tagout', count: 38, unsafe: '77%', safe: '23%' },
    { label: 'Environmental Stewardship', count: 32, unsafe: '78%', safe: '22%' },
    { label: 'Machine Guarding', count: 30, unsafe: '80%', safe: '20%' },
    { label: 'Mobile Equipment', count: 18, unsafe: '83%', safe: '17%' },
    { label: 'Bloodborne Pathogens', count: 16, unsafe: '84%', safe: '16%' },
    { label: 'Cranes / Lifts / Hoists', count: 12, unsafe: '86%', safe: '14%' },
    { label: 'Confined Spaces', count: 8, unsafe: '86%', safe: '14%' },
    { label: 'Tools & Equipment', count: 8, unsafe: '88%', safe: '12%' },
    { label: '5S / Housekeeping', count: 8, unsafe: '88%', safe: '12%' },
    { label: 'PPE', count: 6, unsafe: '91%', safe: '9%' },
  ];
  const conditionTableRows = [
    { label: 'Fall Protection', count: 54, unsafe: '19%', safe: '17%' },
    { label: 'Chemical Safety', count: 38, unsafe: '19%', safe: '12%' },
    { label: 'Lockout/Tagout', count: 38, unsafe: '19%', safe: '11%' },
    { label: 'Environmental Stewardship', count: 32, unsafe: '16%', safe: '11%' },
    { label: 'Machine Guarding', count: 30, unsafe: '15%', safe: '10%' },
    { label: 'Mobile Equipment', count: 18, unsafe: '9%', safe: '8%' },
    { label: 'Bloodborne Pathogens', count: 16, unsafe: '8%', safe: '7%' },
    { label: 'Cranes / Lifts / Hoists', count: 12, unsafe: '6%', safe: '7%' },
    { label: 'Confined Spaces', count: 8, unsafe: '4%', safe: '3%' },
    { label: 'Tools & Equipment', count: 8, unsafe: '4%', safe: '3%' },
    { label: '5S / Housekeeping', count: 8, unsafe: '4%', safe: '2%' },
    { label: 'PPE', count: 6, unsafe: '3%', safe: '1%' },
  ];
  const nearMissTableRows = [
    { label: 'Fall Protection', count: 54, percentage: '27%' },
    { label: 'Chemical Safety', count: 38, percentage: '19%' },
    { label: 'Lockout/Tagout', count: 38, percentage: '19%' },
    { label: 'Environmental Stewardship', count: 32, percentage: '16%' },
    { label: 'Machine Guarding', count: 30, percentage: '15%' },
    { label: 'Mobile Equipment', count: 18, percentage: '9%' },
    { label: 'Bloodborne Pathogens', count: 16, percentage: '8%' },
    { label: 'Cranes / Lifts / Hoists', count: 12, percentage: '6%' },
    { label: 'Confined Spaces', count: 8, percentage: '4%' },
    { label: 'Tools & Equipment', count: 8, percentage: '4%' },
    { label: '5S / Housekeeping', count: 8, percentage: '4%' },
    { label: 'PPE', count: 6, percentage: '3%' },
  ];
  const bbsSubcategoryRows: Record<string, Array<{ label: string; safe: number; unsafe: number }>> = {
    'PPE': [
      { label: 'Hands and fingers protection', safe: 85, unsafe: 15 },
      { label: 'Hearing protection', safe: 88, unsafe: 12 },
      { label: 'Face and eyes protection', safe: 90, unsafe: 10 },
      { label: 'Body protection', safe: 94, unsafe: 6 },
      { label: 'Respiratory protection', safe: 98, unsafe: 2 },
    ],
    'Body Position': [
      { label: 'Lifting posture', safe: 82, unsafe: 18 },
      { label: 'Reaching posture', safe: 84, unsafe: 16 },
      { label: 'Twisting posture', safe: 87, unsafe: 13 },
      { label: 'Seated posture', safe: 91, unsafe: 9 },
      { label: 'Standing posture', safe: 93, unsafe: 7 },
    ],
    'Body Use': [
      { label: 'Grip technique', safe: 84, unsafe: 16 },
      { label: 'Hand placement', safe: 87, unsafe: 13 },
      { label: 'Tool handling', safe: 89, unsafe: 11 },
      { label: 'Push and pull', safe: 91, unsafe: 9 },
      { label: 'Load carrying', safe: 93, unsafe: 7 },
    ],
    'Safe Walking': [
      { label: 'Walking path use', safe: 90, unsafe: 10 },
      { label: 'Stair use', safe: 92, unsafe: 8 },
      { label: 'Obstacle awareness', safe: 93, unsafe: 7 },
      { label: 'Floor condition response', safe: 95, unsafe: 5 },
      { label: 'Speed and attention', safe: 96, unsafe: 4 },
    ],
    'Tools & Equipment': [
      { label: 'Correct tool selection', safe: 81, unsafe: 19 },
      { label: 'Tool inspection', safe: 84, unsafe: 16 },
      { label: 'Machine startup', safe: 87, unsafe: 13 },
      { label: 'Guard use', safe: 90, unsafe: 10 },
      { label: 'Shutdown process', safe: 92, unsafe: 8 },
    ],
    'Fall Protection': [
      { label: 'Ladder use', safe: 80, unsafe: 20 },
      { label: 'Working at height', safe: 83, unsafe: 17 },
      { label: 'Harness inspection', safe: 86, unsafe: 14 },
      { label: 'Anchor point use', safe: 89, unsafe: 11 },
      { label: 'Platform access', safe: 91, unsafe: 9 },
    ],
    'Lockout Tagout': [
      { label: 'Energy isolation', safe: 78, unsafe: 22 },
      { label: 'Tag application', safe: 81, unsafe: 19 },
      { label: 'Verification step', safe: 83, unsafe: 17 },
      { label: 'Restart prevention', safe: 86, unsafe: 14 },
      { label: 'Procedure adherence', safe: 89, unsafe: 11 },
    ],
    'Machine Guarding': [
      { label: 'Fixed guards', safe: 79, unsafe: 21 },
      { label: 'Interlocks', safe: 82, unsafe: 18 },
      { label: 'Point-of-operation', safe: 85, unsafe: 15 },
      { label: 'Emergency stop access', safe: 88, unsafe: 12 },
      { label: 'Bypass prevention', safe: 90, unsafe: 10 },
    ],
    'Procedures & Standards': [
      { label: 'SOP adherence', safe: 80, unsafe: 20 },
      { label: 'Work instruction use', safe: 84, unsafe: 16 },
      { label: 'Pre-job checks', safe: 86, unsafe: 14 },
      { label: 'Permit compliance', safe: 89, unsafe: 11 },
      { label: 'Standard work sequence', safe: 91, unsafe: 9 },
    ],
    'Mobile Equipment': [
      { label: 'Pre-use inspection', safe: 81, unsafe: 19 },
      { label: 'Traffic awareness', safe: 84, unsafe: 16 },
      { label: 'Pedestrian separation', safe: 86, unsafe: 14 },
      { label: 'Parking and chocking', safe: 89, unsafe: 11 },
      { label: 'Speed control', safe: 92, unsafe: 8 },
    ],
    'Chemical Handling': [
      { label: 'Label verification', safe: 76, unsafe: 24 },
      { label: 'PPE selection', safe: 80, unsafe: 20 },
      { label: 'Storage practice', safe: 83, unsafe: 17 },
      { label: 'Transfer procedure', safe: 87, unsafe: 13 },
      { label: 'Spill response', safe: 90, unsafe: 10 },
    ],
    'Environmental Stewardship': [
      { label: 'Waste segregation', safe: 88, unsafe: 12 },
      { label: 'Leak prevention', safe: 90, unsafe: 10 },
      { label: 'Material disposal', safe: 92, unsafe: 8 },
      { label: 'Water use control', safe: 94, unsafe: 6 },
      { label: 'Emission awareness', safe: 96, unsafe: 4 },
    ],
    'Speak up': [
      { label: 'Hazard reporting', safe: 84, unsafe: 16 },
      { label: 'Stop work usage', safe: 87, unsafe: 13 },
      { label: 'Peer intervention', safe: 89, unsafe: 11 },
      { label: 'Escalation timing', safe: 91, unsafe: 9 },
      { label: 'Follow-up communication', safe: 93, unsafe: 7 },
    ],
    '5S Housekeeping': [
      { label: 'Sort', safe: 82, unsafe: 18 },
      { label: 'Set in order', safe: 85, unsafe: 15 },
      { label: 'Shine', safe: 88, unsafe: 12 },
      { label: 'Standardize', safe: 90, unsafe: 10 },
      { label: 'Sustain', safe: 92, unsafe: 8 },
    ],
  };

  const classificationDonut = (
    <Box sx={{ border: '1px solid #E0E6F0', borderRadius: 0.8, p: 1.2, minHeight: 470 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.6 }}>
        <Typography sx={{ fontSize: 12.8, fontWeight: 800, color: '#20262D' }}>Classification</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
          <LegendDot color="#81C784" label="Safe" />
          <LegendDot color="#F34F4F" label="Unsafe" />
        </Box>
      </Box>
      <Box sx={{ position: 'relative', width: 260, height: 260, mx: 'auto', mt: 7 }}>
        <Box sx={{ position: 'absolute', left: '50%', top: '50%', width: 204, height: 204, borderRadius: '50%', transform: 'translate(-50%, -50%)', background: 'conic-gradient(#81C784 0% 55.8%, #F34F4F 55.8% 100%)' }} />
        <Box sx={{ position: 'absolute', left: '50%', top: '50%', width: 100, height: 100, borderRadius: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#FFFFFF' }} />
        <Typography sx={{ position: 'absolute', top: 145, left: 8, fontSize: 11.5, color: '#4B5563' }}>44.2%</Typography>
        <Typography sx={{ position: 'absolute', top: 30, right: 4, fontSize: 11.5, color: '#4B5563' }}>55.8%</Typography>
      </Box>
    </Box>
  );

  const renderChartView = () => {
    if (activeTab === 'BBS') {
      if (enableSiteBbsDrilldown && selectedBbsCategory) {
        const rows = bbsSubcategoryRows[selectedBbsCategory] ?? [];
        return (
          <Box sx={{ border: '1px solid #E0E6F0', borderRadius: 0.8, p: 1.2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.7 }}>
                <Button onClick={() => setSelectedBbsCategory(null)} sx={{ minWidth: 0, px: 0.6, py: 0.15, color: '#2463EB', fontSize: 10.5, fontWeight: 800 }}>
                  <ArrowBackIcon sx={{ fontSize: 15, mr: 0.35 }} />
                  BACK
                </Button>
                <Typography sx={{ fontSize: 12.8, fontWeight: 800, color: '#20262D' }}>{`BBS By Category / ${selectedBbsCategory}`}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
                <LegendDot color="#81C784" label="Safe" />
                <LegendDot color="#F34F4F" label="Unsafe" />
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gap: 0.55 }}>
              {rows.map((row) => (
                <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '160px minmax(0, 1fr)', alignItems: 'center', gap: 0.65 }}>
                  <Typography sx={{ fontSize: 10.2, color: '#2E3742', textAlign: 'right', lineHeight: 1.15 }}>{row.label}</Typography>
                  <Box sx={{ display: 'flex', height: 24, borderRadius: 0.5, overflow: 'hidden' }}>
                    <Box sx={{ width: `${row.safe}%`, bgcolor: '#81C784', display: 'grid', placeItems: 'center' }}><Typography sx={{ fontSize: 10.2, color: '#20262D' }}>{row.safe}%</Typography></Box>
                    <Box sx={{ width: `${row.unsafe}%`, bgcolor: '#F34F4F', display: 'grid', placeItems: 'center' }}><Typography sx={{ fontSize: 10.2, color: '#FFFFFF' }}>{row.unsafe}%</Typography></Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        );
      }
      return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: 0.9 }}>
          <Box sx={{ border: '1px solid #E0E6F0', borderRadius: 0.8, p: 1.2 }}>
            <Typography sx={{ fontSize: 12.8, fontWeight: 800, color: '#20262D' }}>BBS By Category</Typography>
            <Typography sx={{ fontSize: 10.2, color: '#7A8591', mb: 1.05 }}>
              Top categories reflect the highest unsafe behavior reports.
              {enableSiteBbsDrilldown ? ' Click a category for details.' : ''}
            </Typography>
            <Box sx={{ display: 'grid', gap: 0.45 }}>
              {bbsChartRows.map((row) => (
                <Box
                  key={row.label}
                  onClick={enableSiteBbsDrilldown ? () => setSelectedBbsCategory(row.label) : undefined}
                  sx={{ display: 'grid', gridTemplateColumns: '128px minmax(0, 1fr)', alignItems: 'center', gap: 0.65, cursor: enableSiteBbsDrilldown ? 'pointer' : 'default' }}
                >
                  <Typography sx={{ fontSize: 10.2, color: '#2E3742', textAlign: 'right', textDecoration: enableSiteBbsDrilldown ? 'underline transparent' : 'none', '&:hover': enableSiteBbsDrilldown ? { textDecorationColor: '#2E3742' } : undefined }}>{row.label}</Typography>
                  <Box sx={{ display: 'flex', height: 24, borderRadius: 0.5, overflow: 'hidden' }}>
                    <Box sx={{ width: `${row.safe}%`, bgcolor: '#81C784', display: 'grid', placeItems: 'center' }}><Typography sx={{ fontSize: 10.2, color: '#20262D' }}>{row.safe}%</Typography></Box>
                    <Box sx={{ width: `${row.unsafe}%`, bgcolor: '#F34F4F', display: 'grid', placeItems: 'center' }}><Typography sx={{ fontSize: 10.2, color: '#FFFFFF' }}>{row.unsafe}%</Typography></Box>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
          {classificationDonut}
        </Box>
      );
    }
    if (activeTab === 'CONDITION') {
      const rows = conditionMode === 'UNSAFE' ? conditionChartRows : conditionChartRows.map((row) => ({ ...row, unsafe: row.safe }));
      const max = Math.max(...rows.map((row) => row.unsafe), 1);
      const barColor = conditionMode === 'SAFE' ? '#81C784' : '#F34F4F';
      return (
        <Box sx={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr', gap: 0.9 }}>
          <Box sx={{ border: '1px solid #E0E6F0', borderRadius: 0.8, p: 1.2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.9 }}>
              <Typography sx={{ fontSize: 12.8, fontWeight: 800, color: '#20262D' }}>Condition By Category</Typography>
              <Box sx={{ display: 'inline-flex', border: '1px solid #DDE4EC', borderRadius: 0.4, overflow: 'hidden' }}>
                {(['SAFE', 'UNSAFE'] as const).map((option) => (
                  <Button key={option} onClick={() => setConditionMode(option)} sx={{ minWidth: 0, px: 0.8, py: 0.2, borderRadius: 0, bgcolor: conditionMode === option ? (option === 'SAFE' ? '#ECFDF3' : '#FDECEC') : '#FFFFFF', color: conditionMode === option ? (option === 'SAFE' ? '#81C784' : '#F34F4F') : '#626C79', fontSize: 10, fontWeight: 800 }}>{option}</Button>
                ))}
              </Box>
            </Box>
            <Box sx={{ display: 'grid', gap: 0.62 }}>
              {rows.map((row) => (
                <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '128px minmax(0, 1fr) 32px', alignItems: 'center', gap: 0.7 }}>
                  <Typography sx={{ fontSize: 10.2, color: '#2E3742', textAlign: 'right' }}>{row.label}</Typography>
                  <Box sx={{ height: 24, bgcolor: '#F3F5F8', borderRadius: 0.5, overflow: 'hidden' }}>
                    <Box sx={{ width: `${(row.unsafe / max) * 100}%`, height: '100%', bgcolor: barColor, borderRadius: 0.5 }} />
                  </Box>
                  <Typography sx={{ fontSize: 10.2, color: '#2E3742' }}>{row.unsafe}%</Typography>
                </Box>
              ))}
            </Box>
          </Box>
          {classificationDonut}
        </Box>
      );
    }
    const max = Math.max(...nearMissChartRows.map((row) => row.value), 1);
    return (
      <Box sx={{ border: '1px solid #E0E6F0', borderRadius: 0.8, p: 1.2 }}>
        <Typography sx={{ fontSize: 12.8, fontWeight: 800, color: '#20262D', mb: 0.9 }}>Near Miss By Category</Typography>
        <Box sx={{ display: 'grid', gap: 0.62 }}>
          {nearMissChartRows.map((row) => (
            <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '128px minmax(0, 1fr) 32px', alignItems: 'center', gap: 0.7 }}>
              <Typography sx={{ fontSize: 10.2, color: '#2E3742', textAlign: 'right' }}>{row.label}</Typography>
              <Box sx={{ height: 24, bgcolor: '#F3F5F8', borderRadius: 0.5, overflow: 'hidden' }}>
                <Box sx={{ width: `${(row.value / max) * 100}%`, height: '100%', bgcolor: '#F34F4F', borderRadius: 0.5 }} />
              </Box>
              <Typography sx={{ fontSize: 10.2, color: '#2E3742' }}>{row.value}%</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderTableView = () => {
    if (activeTab === 'NEAR MISS') {
      return (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0.8, border: '1px solid #DDE4EC', overflow: 'hidden', boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F7F9FC' }}>
                <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Category</TableCell>
                <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Number of reports</TableCell>
                <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nearMissTableRows.map((row) => (
                <TableRow key={row.label} sx={{ '& td': { borderColor: '#E7EDF5', py: 1.1 } }}>
                  <TableCell sx={{ fontSize: 11.5 }}>{row.label}</TableCell>
                  <TableCell sx={{ fontSize: 11.5 }}>{row.count}</TableCell>
                  <TableCell sx={{ fontSize: 11.5 }}>{row.percentage}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    const rows = activeTab === 'BBS' ? bbsTableRows : conditionTableRows;
    return (
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0.8, border: '1px solid #DDE4EC', overflow: 'hidden', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F7F9FC' }}>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Category</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Number of reports</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Unsafe</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Safe</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label} sx={{ '& td': { borderColor: '#E7EDF5', py: 1.1 } }}>
                <TableCell sx={{ fontSize: 11.5 }}>{row.label}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.count}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.unsafe}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.safe}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth slotProps={{ paper: { sx: { width: 'min(910px, calc(100vw - 24px))', maxWidth: 'none', borderRadius: 0.8 } } }}>
      <Box sx={{ bgcolor: '#FFFFFF' }}>
        <Box sx={{ px: 1.6, py: 1.15, borderBottom: '1px solid #E0E6F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 900, color: '#20262D' }}>ESO By Category</Typography>
          <IconButton onClick={onClose} sx={{ color: '#7A8591' }}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ px: 1.4, py: 1, borderBottom: '1px solid #E8EDF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'inline-flex', border: '1px solid #DDE4EC', borderRadius: 0.4, overflow: 'hidden' }}>
            {(['BBS', 'CONDITION', 'NEAR MISS'] as const).map((tab) => (
              <Button key={tab} onClick={() => { setActiveTab(tab); if (tab !== 'BBS') { setSelectedBbsCategory(null); } }} sx={{ minWidth: 0, px: 1, py: 0.45, borderRadius: 0, bgcolor: activeTab === tab ? '#EDF3FF' : '#FFFFFF', color: activeTab === tab ? '#2463EB' : '#5B6470', fontSize: 10.5, fontWeight: activeTab === tab ? 800 : 600 }}>
                {tab}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: 'inline-flex', border: '1px solid #DDE4EC', borderRadius: 0.4, overflow: 'hidden' }}>
            <IconButton onClick={() => setViewMode('chart')} sx={{ width: 32, height: 32, borderRadius: 0, color: viewMode === 'chart' ? '#2463EB' : '#5B6470', bgcolor: viewMode === 'chart' ? '#EDF3FF' : '#FFFFFF' }}>
              <BarChartOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton onClick={() => setViewMode('table')} sx={{ width: 32, height: 32, borderRadius: 0, color: viewMode === 'table' ? '#2463EB' : '#5B6470', bgcolor: viewMode === 'table' ? '#EDF3FF' : '#FFFFFF' }}>
              <TableRowsOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ p: 1.2 }}>
          {viewMode === 'chart' ? renderChartView() : renderTableView()}
        </Box>
      </Box>
    </Dialog>
  );
}

function ParetoChartCard({ title }: { title: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const data = [
    { label: 'Mobile equipment', value: 210, cumulative: 62 },
    { label: 'Machine guarding', value: 170, cumulative: 81 },
    { label: 'Lockout/\nTagout', value: 158, cumulative: 88 },
    { label: 'Fall\nProtection', value: 122, cumulative: 91 },
    { label: 'Environment\nStewardship', value: 72, cumulative: 95 },
    { label: 'Chemical\nSafety', value: 63, cumulative: 100 },
  ];
  const chartData = data.map((item, index) => ({
    ...item,
    tone: ['#F34F4F', '#F15D5D', '#EE6A6A', '#E67878', '#E68686', '#E69292'][index],
  }));

  return (
    <>
      <DashboardCard
        title={title}
        headerRight={(
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
            <LegendDot color="#E45145" label="80% of categories" />
            <LegendDot color="#2F66E0" label="Cumulative %" />
          </Box>
        )}
        minHeight={292}
      >
        <Box sx={{ width: '100%', height: 210 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 12, right: 18, left: 2, bottom: 32 }}>
              <CartesianGrid vertical={false} stroke="#EEF2F7" />
              <XAxis dataKey="label" tick={{ fontSize: 8, fill: '#626C79' }} tickLine={false} axisLine={{ stroke: '#8A93A0' }} interval={0} />
              <YAxis yAxisId="left" domain={[0, 240]} ticks={[0, 40, 80, 120, 160, 200, 240]} tick={{ fontSize: 8.5, fill: '#7A828E' }} tickLine={false} axisLine={false} width={28} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tickFormatter={(value) => `${value}%`} tick={{ fontSize: 8.5, fill: '#7A828E' }} tickLine={false} axisLine={false} width={28} />
              <Bar yAxisId="left" dataKey="value" radius={[1, 1, 0, 0]} barSize={42}>
                {chartData.map((entry) => (
                  <Cell key={entry.label} fill={entry.tone} />
                ))}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="cumulative" stroke="#2F66E0" strokeWidth={1.8} dot={{ r: 2.6, fill: '#2F66E0', strokeWidth: 0 }} activeDot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.1 }}>
          <Button onClick={() => setModalOpen(true)} sx={{ color: '#2463EB', fontSize: 11.5, fontWeight: 800 }}>
            DETAILS <ChevronRightIcon sx={{ fontSize: 16, ml: 0.3 }} />
          </Button>
        </Box>
      </DashboardCard>
      <GoldenRulesModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function GoldenRulesModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [activeTab, setActiveTab] = useState<'BBS' | 'CONDITION' | 'NEAR MISS'>('BBS');
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const safeUnsafeRows = [
    { label: 'Machine Guarding', count: 30, unsafe: 58, safe: 42 },
    { label: 'Mobile Equipment', count: 18, unsafe: 57, safe: 43 },
    { label: 'Lockout/Tagout', count: 38, unsafe: 45, safe: 55 },
    { label: 'Chemical Safety', count: 38, unsafe: 34, safe: 66 },
    { label: 'Fall Protection', count: 54, unsafe: 33, safe: 67 },
    { label: 'Environmental\nStewardship', count: 32, unsafe: 31, safe: 69 },
  ];
  const nearMissRows = [
    { label: 'Fall Protection', count: 54, value: 27 },
    { label: 'Chemical Safety', count: 38, value: 19 },
    { label: 'Lockout/Tagout', count: 38, value: 19 },
    { label: 'Environmental\nStewardship', count: 32, value: 16 },
    { label: 'Machine Guarding', count: 30, value: 15 },
    { label: 'Mobile Equipment', count: 18, value: 5 },
  ];

  const renderSafeUnsafeChart = (chartTitle: string) => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
        <Typography sx={{ fontSize: 12.8, fontWeight: 800, color: '#20262D' }}>{chartTitle}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
          <LegendDot color="#68BB6B" label="Safe" />
          <LegendDot color="#F34F4F" label="Unsafe" />
        </Box>
      </Box>
      <Box sx={{ display: 'grid', gap: 1.3 }}>
        {safeUnsafeRows.map((row) => (
          <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '112px minmax(0, 1fr)', alignItems: 'center', gap: 1.05 }}>
            <Typography sx={{ fontSize: 10.6, color: '#2E3742', textAlign: 'right', whiteSpace: 'pre-line' }}>{row.label}</Typography>
            <Box sx={{ display: 'flex', height: 58, borderRadius: 1, overflow: 'hidden' }}>
              <Box sx={{ width: `${row.safe}%`, bgcolor: '#68BB6B', display: 'grid', placeItems: 'center' }}>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#111827' }}>{row.safe}%</Typography>
              </Box>
              <Box sx={{ width: `${row.unsafe}%`, bgcolor: '#F34F4F', display: 'grid', placeItems: 'center' }}>
                <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: '#FFFFFF' }}>{row.unsafe}%</Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const renderNearMissChart = () => {
    const max = Math.max(...nearMissRows.map((row) => row.value), 1);
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.2 }}>
          <Typography sx={{ fontSize: 12.8, fontWeight: 800, color: '#20262D' }}>Golden Rule: Near Miss</Typography>
          <LegendDot color="#F34F4F" label="Unsafe" />
        </Box>
        <Box sx={{ display: 'grid', gap: 1.65, pt: 0.2 }}>
          {nearMissRows.map((row) => (
            <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '118px minmax(0, 1fr) 42px', alignItems: 'center', gap: 1.2 }}>
              <Typography sx={{ fontSize: 10.9, color: '#2E3742', textAlign: 'right', whiteSpace: 'pre-line', lineHeight: 1.2 }}>{row.label}</Typography>
              <Box sx={{ height: 60, display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: `${(row.value / max) * 100}%`,
                    height: '100%',
                    bgcolor: '#F34F4F',
                    borderRadius: 1.2,
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: 10.9, color: '#2E3742', lineHeight: 1, whiteSpace: 'nowrap' }}>{row.value}%</Typography>
            </Box>
          ))}
        </Box>
      </Box>
    );
  };

  const renderTableView = () => {
    if (activeTab === 'NEAR MISS') {
      return (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0.8, border: '1px solid #DDE4EC', overflow: 'hidden', boxShadow: 'none' }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: '#F7F9FC' }}>
                <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Category</TableCell>
                <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Number of reports</TableCell>
                <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Percentage</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {nearMissRows.map((row) => (
                <TableRow key={row.label} sx={{ '& td': { borderColor: '#E7EDF5', py: 1.1 } }}>
                  <TableCell sx={{ fontSize: 11.5, whiteSpace: 'pre-line' }}>{row.label}</TableCell>
                  <TableCell sx={{ fontSize: 11.5 }}>{row.count}</TableCell>
                  <TableCell sx={{ fontSize: 11.5 }}>{row.value}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    return (
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 0.8, border: '1px solid #DDE4EC', overflow: 'hidden', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F7F9FC' }}>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Category</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Number of reports</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Unsafe</TableCell>
              <TableCell sx={{ fontSize: 11.5, fontWeight: 800 }}>Safe</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {safeUnsafeRows.map((row) => (
              <TableRow key={row.label} sx={{ '& td': { borderColor: '#E7EDF5', py: 1.1 } }}>
                <TableCell sx={{ fontSize: 11.5, whiteSpace: 'pre-line' }}>{row.label}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.count}</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.unsafe}%</TableCell>
                <TableCell sx={{ fontSize: 11.5 }}>{row.safe}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth={false} fullWidth slotProps={{ paper: { sx: { width: 'min(910px, calc(100vw - 24px))', maxWidth: 'none', borderRadius: 0.8 } } }}>
      <Box sx={{ bgcolor: '#FFFFFF' }}>
        <Box sx={{ px: 1.6, py: 1.15, borderBottom: '1px solid #E0E6F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 900, color: '#20262D' }}>Golden Rules</Typography>
          <IconButton onClick={onClose} sx={{ color: '#7A8591' }}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ px: 1.4, py: 1, borderBottom: '1px solid #E8EDF4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'inline-flex', border: '1px solid #DDE4EC', borderRadius: 0.4, overflow: 'hidden' }}>
            {(['BBS', 'CONDITION', 'NEAR MISS'] as const).map((tab) => (
              <Button key={tab} onClick={() => setActiveTab(tab)} sx={{ minWidth: 0, px: 1, py: 0.45, borderRadius: 0, bgcolor: activeTab === tab ? '#EDF3FF' : '#FFFFFF', color: activeTab === tab ? '#2463EB' : '#5B6470', fontSize: 10.5, fontWeight: activeTab === tab ? 800 : 600 }}>
                {tab}
              </Button>
            ))}
          </Box>
          <Box sx={{ display: 'inline-flex', border: '1px solid #DDE4EC', borderRadius: 0.4, overflow: 'hidden' }}>
            <IconButton onClick={() => setViewMode('chart')} sx={{ width: 32, height: 32, borderRadius: 0, color: viewMode === 'chart' ? '#2463EB' : '#5B6470', bgcolor: viewMode === 'chart' ? '#EDF3FF' : '#FFFFFF' }}>
              <BarChartOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton onClick={() => setViewMode('table')} sx={{ width: 32, height: 32, borderRadius: 0, color: viewMode === 'table' ? '#2463EB' : '#5B6470', bgcolor: viewMode === 'table' ? '#EDF3FF' : '#FFFFFF' }}>
              <TableRowsOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Box>
        <Box sx={{ p: 1.2 }}>
          {viewMode === 'chart'
            ? activeTab === 'NEAR MISS'
              ? renderNearMissChart()
              : renderSafeUnsafeChart(activeTab === 'BBS' ? 'Golden Rule: BBS' : 'Golden Rule: Condition Report')
            : renderTableView()}
        </Box>
      </Box>
    </Dialog>
  );
}

function HorizontalCategoryCard({
  title,
  rows,
}: {
  title: string;
  rows: ReadonlyArray<{ label: string; value: number }>;
}) {
  const max = maxValue(rows.map((row) => row.value));

  return (
    <DashboardCard title={title} minHeight={292}>
      <Box sx={{ display: 'grid', gap: 1.02, pt: 0.22 }}>
        {rows.map((row) => (
          <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '124px minmax(0, 1fr) 24px', alignItems: 'center', gap: 0.65 }}>
            <Typography sx={{ fontSize: 8.85, color: '#3E4652', textAlign: 'right', lineHeight: 1.1 }}>{row.label}</Typography>
            <Box sx={{ height: 11, bgcolor: '#F3F5F8', borderRadius: 999, overflow: 'hidden' }}>
              <Box sx={{ width: `${(row.value / max) * 100}%`, height: '100%', bgcolor: '#E45145', borderRadius: 999 }} />
            </Box>
            <Typography sx={{ fontSize: 8.85, color: '#3E4652', lineHeight: 1 }}>{row.value}%</Typography>
          </Box>
        ))}
      </Box>
    </DashboardCard>
  );
}

function ConditionByCategoryCard() {
  const [classification, setClassification] = useState<'SAFE' | 'UNSAFE'>('UNSAFE');
  const rows = classification === 'SAFE' ? conditionCategorySafeRows : conditionCategoryRows;
  const max = maxValue(rows.map((row) => row.value));
  const barColor = classification === 'SAFE' ? '#7FBF7F' : '#E45145';

  return (
    <DashboardCard
      title="Condition By Category"
      headerRight={(
        <Box sx={{display: 'inline-flex', border: '1px solid #DDE4EC', borderRadius: 0.4, overflow: 'hidden'}}>
          {(['SAFE', 'UNSAFE'] as const).map((option) => {
            const active = classification === option;
            return (
              <Button
                key={option}
                onClick={() => setClassification(option)}
                sx={{
                  minWidth: 0,
                  px: 0.9,
                  py: 0.45,
                  borderRadius: 0,
                  bgcolor: active ? '#FDECEC' : '#FFFFFF',
                  color: active ? '#E45145' : '#626C79',
                  fontSize: 10.2,
                  fontWeight: 800,
                  lineHeight: 1,
                  '&:hover': {bgcolor: active ? '#FDECEC' : '#F7FAFD'},
                }}
              >
                {option}
              </Button>
            );
          })}
        </Box>
      )}
      minHeight={292}
    >
      <Box sx={{ display: 'grid', gap: 1.02, pt: 0.22 }}>
        {rows.map((row) => (
          <Box key={row.label} sx={{ display: 'grid', gridTemplateColumns: '124px minmax(0, 1fr) 24px', alignItems: 'center', gap: 0.65 }}>
            <Typography sx={{ fontSize: 8.85, color: '#3E4652', textAlign: 'right', lineHeight: 1.1 }}>{row.label}</Typography>
            <Box sx={{ height: 11, bgcolor: '#F3F5F8', borderRadius: 999, overflow: 'hidden' }}>
              <Box sx={{ width: `${(row.value / max) * 100}%`, height: '100%', bgcolor: barColor, borderRadius: 999 }} />
            </Box>
            <Typography sx={{ fontSize: 8.85, color: '#3E4652', lineHeight: 1 }}>{row.value}%</Typography>
          </Box>
        ))}
      </Box>
    </DashboardCard>
  );
}

function BbsBarriersCard() {
  const chartData = barrierRows.map((row) => ({
    label: row.label,
    count: row.count,
    cumulative: row.cumulative,
    tone:
      ['Rushing', 'Habit', 'Complacency', 'Lack of Training', 'Follow Procedures', 'Frustration'].includes(row.label)
        ? '#F05A5A'
        : '#D9DDE3',
  }));

  return (
    <DashboardCard
      title="BBS Barriers"
      headerRight={(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.1 }}>
          <LegendDot color="#F05A5A" label="80%of categories" />
          <LegendDot color="#2F66E0" label="Cumulative %" />
        </Box>
      )}
      minHeight={196}
    >
      <Box sx={{ width: '100%', height: 176 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <ComposedChart data={chartData} margin={{ top: 12, right: 10, left: 2, bottom: 38 }} barCategoryGap="12%">
            <CartesianGrid vertical={false} stroke="#EEF2F7" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 8, fill: '#626C79' }}
              tickLine={false}
              axisLine={{ stroke: '#8A93A0' }}
              angle={-45}
              textAnchor="end"
              interval={0}
              height={48}
            />
            <YAxis
              yAxisId="left"
              domain={[0, 6000]}
              ticks={[0, 2000, 4000, 6000]}
              tickFormatter={(value) => (value === 0 ? '0' : `${value / 1000}k`)}
              tick={{ fontSize: 8.5, fill: '#7A828E' }}
              tickLine={false}
              axisLine={false}
              width={34}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 120]}
              ticks={[0, 40, 80, 120]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 8.5, fill: '#7A828E' }}
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Bar yAxisId="left" dataKey="count" radius={[1, 1, 0, 0]} barSize={13} isAnimationActive={false}>
              {chartData.map((entry) => (
                <Cell key={entry.label} fill={entry.tone} />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cumulative"
              stroke="#2F66E0"
              strokeWidth={1.6}
              dot={{ r: 2, fill: '#2F66E0', strokeWidth: 0 }}
              activeDot={{ r: 2.5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
}

function PieCard({
  title,
  segments,
  legend,
  labels,
  headerRight,
  showLegend = true,
}: {
  title: string;
  segments: Array<{ value: number; color: string }>;
  legend: Array<{ label: string; color: string }>;
  labels: Array<{ text: string; top: string; left?: string; right?: string }>;
  headerRight?: ReactNode;
  showLegend?: boolean;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  let offset = 0;
  const gradient = segments.map((segment) => {
    const start = (offset / total) * 100;
    offset += segment.value;
    const end = (offset / total) * 100;
    return `${segment.color} ${start}% ${end}%`;
  }).join(', ');

  return (
    <DashboardCard title={title} headerRight={headerRight} minHeight={196}>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', justifyItems: 'center', alignItems: 'center', minHeight: 144 }}>
        <Box sx={{ position: 'relative', width: 208, height: 144, mx: 'auto' }}>
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 158,
              height: 158,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              background: `conic-gradient(${gradient})`,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 92,
              height: 92,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: '#FFFFFF',
              boxShadow: 'inset 0 0 0 1px #F0F3F7',
            }}
          />
          {labels.map((label, index) => (
            <Typography
              key={`${label.text}-${index}`}
              sx={{
                position: 'absolute',
                top: label.top,
                left: label.left,
                right: label.right,
                fontSize: 9.2,
                color: '#4B5563',
              }}
            >
              {label.text}
            </Typography>
          ))}
        </Box>
        {showLegend ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.2, flexWrap: 'wrap', mt: 0.5 }}>
            {legend.map((entry) => (
              <Box key={entry.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                <Box sx={{ width: 13, height: 13, borderRadius: 0.5, bgcolor: entry.color }} />
                <Typography sx={{ fontSize: 9.1, color: '#3E4652' }}>{entry.label}</Typography>
              </Box>
            ))}
          </Box>
        ) : null}
      </Box>
    </DashboardCard>
  );
}

function TimeComparisonChart({
  title,
  leftLabel,
  leftTicks,
  rightTicks,
  current,
  lastYear,
  change,
  changeLabel = 'Change (%)',
}: {
  title: string;
  leftLabel: string;
  leftTicks: string[];
  rightTicks: string[];
  current: number[];
  lastYear: number[];
  change: number[];
  changeLabel?: string;
}) {
  const chartData = monthLabels.map((month, index) => ({
    label: month,
    current: current[index],
    lastYear: lastYear[index],
    change: change[index],
  }));
  const maxBar = Math.max(maxValue(current), maxValue(lastYear));
  const maxChange = Math.max(...change, 24);

  return (
    <DashboardCard
      title={title}
      subtitle="Rolling 12-Month Period"
      headerRight={(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.15 }}>
          <LegendDot color="#FF5B21" label="Change (%)" />
          <LegendDot color="#2F66E0" label="Current Year" />
          <LegendDot color="#5D94F1" label="Last Year" />
        </Box>
      )}
      minHeight={244}
    >
      <Box sx={{ width: '100%', height: 210 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 26, left: 6, bottom: 10 }} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke="#EEF2F7" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 8.2, fill: '#626C79' }}
              tickLine={false}
              axisLine={{ stroke: '#8A93A0' }}
            />
            <YAxis
              yAxisId="left"
              domain={[0, maxBar]}
              ticks={leftTicks.map((tick) => {
                if (tick.endsWith('k')) return Number.parseFloat(tick) * 1000;
                return Number.parseFloat(tick) || 0;
              })}
              tickFormatter={(value) => {
                if (value === 0) return '0';
                return `${value / 1000}k`;
              }}
              tick={{ fontSize: 8.5, fill: '#7A828E' }}
              tickLine={false}
              axisLine={false}
              width={42}
              label={{ value: leftLabel, angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 8.6, fill: '#6A7380' } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, maxChange]}
              ticks={rightTicks.map((tick) => Number.parseFloat(tick))}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 8.5, fill: '#7A828E' }}
              tickLine={false}
              axisLine={false}
              width={34}
              label={{ value: changeLabel, angle: 90, position: 'insideRight', offset: 4, style: { fontSize: 8.6, fill: '#6A7380' } }}
            />
            <Bar yAxisId="left" dataKey="current" fill="#2F66E0" radius={[3, 3, 0, 0]} barSize={20} />
            <Bar yAxisId="left" dataKey="lastYear" fill="#5D94F1" radius={[3, 3, 0, 0]} barSize={20} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="change"
              stroke="#FF5B21"
              strokeWidth={1.8}
              dot={{ r: 3, fill: '#FF5B21', stroke: '#FFFFFF', strokeWidth: 1.2 }}
              activeDot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
}

function BusinessUnitComparisonChart({ view }: { view: DashboardView }) {
  const labels = view === 'Site' ? areaLabels : view === 'Business Unit' ? siteLabels : businessUnitLabels;
  const currentValues = view === 'Site' ? areaComparisonCurrent : view === 'Business Unit' ? siteComparisonCurrent : businessUnitComparisonCurrent;
  const lastYearValues = view === 'Site' ? areaComparisonLastYear : view === 'Business Unit' ? siteComparisonLastYear : businessUnitComparisonLastYear;
  const changeValues = view === 'Site' ? areaComparisonChange : view === 'Business Unit' ? siteComparisonChange : businessUnitComparisonChange;
  const chartData = labels.map((label, index) => ({
    label,
    current: currentValues[index],
    lastYear: lastYearValues[index],
    change: changeValues[index],
  }));
  const maxBar = 1.6;
  const maxChange = 16;
  const title = view === 'Site'
    ? 'Area Contact Rate Comparison'
    : view === 'Business Unit'
      ? 'Site Contact Rate Comparison'
      : 'Business Unit Contact Rate Comparison';

  return (
    <DashboardCard
      title={title}
      subtitle="Rolling 12-Month Period"
      headerRight={(
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.15 }}>
          <LegendDot color="#FF5B21" label="Change (%)" />
          <LegendDot color="#2F66E0" label="Current Year" />
          <LegendDot color="#5D94F1" label="Last Year" />
        </Box>
      )}
      minHeight={244}
    >
      <Box sx={{ width: '100%', height: 210 }}>
        <ResponsiveContainer width="100%" height="100%" minHeight={0}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 24, left: 2, bottom: 10 }} barCategoryGap="18%">
            <CartesianGrid vertical={false} stroke="#EEF2F7" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 8.2, fill: '#626C79' }}
              tickLine={false}
              axisLine={{ stroke: '#8A93A0' }}
            />
            <YAxis
              yAxisId="left"
              domain={[0, maxBar]}
              ticks={[0, 0.4, 0.8, 1.2, 1.6]}
              tick={{ fontSize: 8.5, fill: '#7A828E' }}
              tickLine={false}
              axisLine={false}
              width={34}
              label={{ value: 'Contact Rate', angle: -90, position: 'insideLeft', offset: 0, style: { fontSize: 8.6, fill: '#6A7380' } }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, maxChange]}
              ticks={[0, 4, 8, 12, 16]}
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 8.5, fill: '#7A828E' }}
              tickLine={false}
              axisLine={false}
              width={30}
              label={{ value: '# Change %', angle: 90, position: 'insideRight', offset: 4, style: { fontSize: 8.6, fill: '#6A7380' } }}
            />
            <Bar yAxisId="left" dataKey="current" fill="#2F66E0" radius={[3, 3, 0, 0]} barSize={14} />
            <Bar yAxisId="left" dataKey="lastYear" fill="#5D94F1" radius={[3, 3, 0, 0]} barSize={14} />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="change"
              stroke="#FF5B21"
              strokeWidth={1.8}
              dot={{ r: 3, fill: '#FF5B21', stroke: '#FFFFFF', strokeWidth: 1.2 }}
              activeDot={{ r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </DashboardCard>
  );
}

function ReportsTab({
  onEditRow,
  onSelectRow,
  initialStatusTab = 'open',
}: {
  onEditRow: (row: ReportRow) => void;
  onSelectRow: (row: ReportRow) => void;
  initialStatusTab?: ReportStatusTab;
}) {
  const [activeStatusTab, setActiveStatusTab] = useState<ReportStatusTab>(initialStatusTab);
  const [reportSearch, setReportSearch] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isAssistantExpanded, setIsAssistantExpanded] = useState(true);
  const [visibleAssistantInsightCount, setVisibleAssistantInsightCount] = useState(0);
  const filteredRows = reportRows
    .filter((row) => matchesReportStatusTab(row, activeStatusTab))
    .filter((row) => row.type !== 'BBS' || row.status === 'CLOSED')
    .filter((row) => row.type !== 'Near Miss' || row.status === 'REVIEW')
    .filter((row) => row.id.toLowerCase().includes(reportSearch.trim().toLowerCase()));
  const isClosedTab = activeStatusTab === 'closed';
  const tableColumns = isClosedTab ? closedReportTableColumns : reportTableColumns;
  const reportHeadings = isClosedTab
    ? ['REPORT ID', 'REPORT TYPE', 'CLASSIFICATION', 'STATUS', 'RISK', 'SUBMITTER', 'AREA', 'LINE', 'AREA OWNER', 'REPORT DATE', 'CLOSED DATE', 'LAST UPDATE']
    : ['REPORT ID', 'REPORT TYPE', 'CLASSIFICATION', 'STATUS', 'RISK', 'SUBMITTER', 'AREA', 'LINE', 'AREA OWNER', 'REPORT DATE', 'LAST UPDATE'];

  useEffect(() => {
    if (!isAssistantExpanded) {
      setVisibleAssistantInsightCount(0);
      return undefined;
    }

    setVisibleAssistantInsightCount(0);
    const timers = reportAssistantInsights.map((_, index) => (
      window.setTimeout(() => setVisibleAssistantInsightCount(index + 1), 520 + (index * 620))
    ));

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [isAssistantExpanded]);

  const exportRowsToExcel = () => {
    const headers = isClosedTab
      ? ['Report ID', 'Report Type', 'Classification', 'Status', 'Risk', 'Submitter', 'Area', 'Line', 'Area Owner', 'Report Date', 'Closed Date', 'Last Update']
      : ['Report ID', 'Report Type', 'Status', 'Report Owner', 'Area', 'Line', 'Supervisor', 'Report Date', 'Occurrence Date', 'Last Update'];
    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const rows = filteredRows.map((row) => (
      isClosedTab
        ? [
          row.id,
          row.type,
          row.classification,
          row.status,
          row.risk,
          row.observer,
          row.area,
          row.line,
          row.supervisor,
          row.reportDate,
          row.closedDate,
          row.lastUpdate,
        ]
        : [
          row.id,
          row.type,
          row.status,
          row.observer,
          row.area,
          row.line,
          row.supervisor,
          row.reportDate,
          row.occurrenceDate,
          row.lastUpdate,
        ]
    ));
    const csv = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map((cell) => escapeCsv(String(cell ?? ''))).join(',')),
    ].join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = window.URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `eso-reports-${activeStatusTab}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    window.URL.revokeObjectURL(url);
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          mb: 1.45,
          p: 2,
          borderRadius: '12px',
          bgcolor: tokenNeutral.lightest,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1.5, px: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
            <AutoAwesomeIcon sx={{ fontSize: 16, color: '#F97316', flexShrink: 0 }} />
            <Typography sx={{ color: tokenBrand.main, fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.3 }}>
              ATLAS.AI Assistant
            </Typography>
          </Box>
          <Tooltip title={isAssistantExpanded ? 'Collapse insights' : 'Expand insights'}>
            <IconButton
              size="small"
              aria-label={isAssistantExpanded ? 'Collapse AI insights' : 'Expand AI insights'}
              onClick={() => setIsAssistantExpanded((current) => !current)}
              sx={{
                color: tokenBrand.main,
                width: 28,
                height: 28,
                borderRadius: '8px',
                '&:hover': { bgcolor: tokenBrand.softBg },
              }}
            >
              <ExpandMoreIcon
                sx={{
                  fontSize: 19,
                  transform: isAssistantExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 180ms ease',
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>

        <Collapse in={isAssistantExpanded} timeout="auto" unmountOnExit>
          <Box sx={{ display: 'grid', gap: 0.65 }}>
            {reportAssistantInsights.slice(0, visibleAssistantInsightCount).map((item, index) => {
              const highlighted = item.severity === 'high';
              const Icon = item.severity === 'greeting'
                ? WbSunnyOutlinedIcon
                : item.severity === 'high'
                  ? WarningAmberOutlinedIcon
                  : InfoOutlinedIcon;
              const iconColor = item.severity === 'greeting'
                ? '#F97316'
                : item.severity === 'high'
                  ? tokenError.main
                  : tokenBrand.main;

              return (
                <Box
                  key={item.title}
                  sx={{
                    px: highlighted ? 2 : 1,
                    py: highlighted ? 1.35 : 0.55,
                    borderRadius: '6px',
                    border: highlighted ? `1px solid ${tokenDivider}` : '1px solid transparent',
                    bgcolor: highlighted ? 'rgba(0,0,0,0.03)' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Icon sx={{ fontSize: 16, color: iconColor, flexShrink: 0 }} />
                  <Typography sx={{ color: tokenText.secondary, fontSize: '0.75rem', fontWeight: 400, lineHeight: 1.4, flex: 1 }}>
                    <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>{item.title}</Box>
                    {' - '}
                    {item.detail}
                  </Typography>
                </Box>
              );
            })}
            {visibleAssistantInsightCount < reportAssistantInsights.length ? (
              <Box
                role="status"
                aria-label="ATLAS.AI is typing insights"
                sx={{
                  minHeight: 30,
                  px: 1,
                  py: 0.55,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.55,
                  '@keyframes esoAssistantTypingBounce': {
                    '0%, 60%, 100%': { transform: 'translateY(0)', opacity: 0.45 },
                    '30%': { transform: 'translateY(-4px)', opacity: 1 },
                  },
                }}
              >
                {[0, 1, 2].map((index) => (
                  <Box
                    key={index}
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: tokenBrand.main,
                      animation: `esoAssistantTypingBounce 1s ease-in-out ${index * 140}ms infinite`,
                    }}
                  />
                ))}
              </Box>
            ) : null}
          </Box>
        </Collapse>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
            xl: 'repeat(6, minmax(0, 1fr))',
          },
          gap: 1.1,
          mb: 1.7,
        }}
      >
        {reportSummaryCards.map((card) => (
          <ReportSummaryCard key={`${card.label}-${card.primary}`} {...card} />
        ))}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.9, mb: 0.95, flexWrap: 'wrap' }}>
        {reportStatusTabs.map((tab) => {
          const active = activeStatusTab === tab.value;

          return (
            <Button
              key={tab.value}
              onClick={() => setActiveStatusTab(tab.value)}
              sx={{
                minWidth: 0,
                px: 1.45,
                height: 30,
                borderRadius: 999,
                bgcolor: active ? '#2569ED' : '#F1F3F5',
                color: active ? '#FFFFFF' : '#3F3F46',
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                lineHeight: 1,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: active ? '#2569ED' : '#E9ECEF',
                },
              }}
            >
              {tab.label}
            </Button>
          );
        })}
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap', mb: 1.15 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 0.6, flexWrap: 'wrap' }}>
          <ReportsSearchField value={reportSearch} onChange={setReportSearch} />
          <Button
            variant="outlined"
            startIcon={<TuneIcon sx={{ fontSize: 16 }} />}
            onClick={() => setIsFilterModalOpen(true)}
            sx={{
              height: 32,
              borderRadius: 1.2,
              borderColor: '#BFD4FF',
              color: '#2569ED',
              fontSize: 10.8,
              fontWeight: 800,
              px: 1.35,
              minWidth: 0,
            }}
          >
            FILTER
          </Button>
          <Tooltip title="Export as Excel file" arrow placement="top">
            <span>
              <IconButton
                size="small"
                onClick={exportRowsToExcel}
                sx={{width: 30, height: 30, color: '#2569ED', borderRadius: 0.8}}
              >
                <DownloadIcon sx={{fontSize: 17}} />
              </IconButton>
            </span>
          </Tooltip>
          <IconButton size="small" sx={{width: 30, height: 30, color: '#2569ED', borderRadius: 0.8}}>
            <DragIndicatorIcon sx={{fontSize: 17}} />
          </IconButton>
        </Box>
        <Typography sx={{ fontSize: 11, color: '#6B7280' }}>{filteredRows.length} total reports</Typography>
      </Box>

      <Box sx={{ border: '1px solid #D8E0EA', borderRadius: 1.2, overflow: 'hidden', bgcolor: '#FFFFFF' }}>
        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ minWidth: isClosedTab ? 1560 : 1410 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: tableColumns,
                alignItems: 'center',
                minHeight: 38,
                px: 1.25,
                bgcolor: '#F3F5F7',
                borderBottom: '1px solid #D8E0EA',
              }}
            >
              {reportHeadings.map((heading, index) => (
                <Typography
                  key={heading}
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: '#2C313A',
                    px: 0.5,
                    borderRight: index < reportHeadings.length - 1 ? '1px solid #E4E9EF' : 'none',
                  }}
                >
                  {heading}
                </Typography>
              ))}
              <Box />
            </Box>

              {filteredRows.map((row, index) => {
                const tone = statusStyles(row.status);
                const classificationTone = classificationStyles(row.classification);
                const riskTone = riskStyles(row.risk);
                return (
                  <Box
                    key={row.id}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: tableColumns,
                    alignItems: 'center',
                    minHeight: 36,
                    px: 1.25,
                    borderBottom: index === filteredRows.length - 1 ? 'none' : '1px solid #E8EDF3',
                  }}
                  >
                    {isClosedTab ? (
                      <>
                        <Box sx={{ px: 0.5 }}>
                          <Typography sx={{ fontSize: 11, color: '#3B414A' }}>{row.id}</Typography>
                        </Box>
                        <Typography sx={{ fontSize: 11, color: '#3B414A', px: 0.5 }}>{row.type}</Typography>
                        <Box sx={{ px: 0.5 }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 14,
                              px: 0.6,
                              borderRadius: 999,
                              border: `1px solid ${classificationTone.border}`,
                              bgcolor: classificationTone.background,
                              color: classificationTone.color,
                              fontSize: 8.2,
                              fontWeight: 800,
                              letterSpacing: '0.02em',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.classification}
                          </Box>
                        </Box>
                        <Box sx={{ px: 0.5 }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 14,
                              px: 0.6,
                              borderRadius: 999,
                              border: `1px solid ${tone.border}`,
                              bgcolor: tone.background,
                              color: tone.color,
                              fontSize: 8.2,
                              fontWeight: 800,
                              letterSpacing: '0.02em',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.status}
                          </Box>
                        </Box>
                        <Box sx={{ px: 0.5 }}>
                          {row.risk === 'LOW' ? (
                            <Typography sx={{ fontSize: 11, color: '#3B414A' }}>-</Typography>
                          ) : (
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minHeight: 14,
                                px: 0.6,
                                borderRadius: 999,
                                border: `1px solid ${riskTone.border}`,
                                bgcolor: riskTone.background,
                                color: riskTone.color,
                                fontSize: 8.2,
                                fontWeight: 800,
                                letterSpacing: '0.02em',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {row.risk}
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ px: 0.5 }}>
                          <PersonCell name={row.observer} />
                        </Box>
                        <Typography sx={{ fontSize: 11, color: '#3B414A', px: 0.5 }}>{row.area}</Typography>
                        <Typography sx={{ fontSize: 11, color: '#3B414A', px: 0.5 }}>{row.line}</Typography>
                        <Box sx={{ px: 0.5 }}>
                          <PersonCell name={row.supervisor} />
                        </Box>
                        <Typography sx={{ fontSize: 11, color: '#3B414A', px: 0.5 }}>{row.reportDate}</Typography>
                        <Typography sx={{ fontSize: 11, color: '#3B414A', px: 0.5 }}>{row.closedDate}</Typography>
                        <Typography sx={{ fontSize: 11, color: '#3B414A', px: 0.5 }}>{row.lastUpdate}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.15 }}>
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectRow(row);
                            }}
                            sx={{ width: 22, height: 22, color: '#2463EB' }}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 15.5 }} />
                          </IconButton>
                        </Box>
                      </>
                    ) : (
                      <>
                        <Box sx={{ px: 0.5 }}>
                          <Typography sx={{ fontSize: 11, color: '#3B414A' }}>{row.id}</Typography>
                          {row.duplicated ? (
                            <Box
                              sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mt: 0.35,
                                minHeight: 14,
                                px: 0.6,
                                borderRadius: 999,
                                border: '1px solid #FDBA74',
                                bgcolor: '#FFF7ED',
                                color: '#D97706',
                                fontSize: 8.2,
                                fontWeight: 800,
                                letterSpacing: '0.02em',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              DUPLICATED
                            </Box>
                          ) : null}
                        </Box>
                        <Typography sx={{ fontSize: 11, color: '#3B414A', px: 0.5 }}>{row.type}</Typography>
                        <Box sx={{ px: 0.5 }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 14,
                              px: 0.6,
                              borderRadius: 999,
                              border: `1px solid ${classificationTone.border}`,
                              bgcolor: classificationTone.background,
                              color: classificationTone.color,
                              fontSize: 8.2,
                              fontWeight: 800,
                              letterSpacing: '0.02em',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.classification}
                          </Box>
                        </Box>
                        <Box sx={{ px: 0.5 }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 14,
                              px: 0.6,
                              borderRadius: 999,
                              border: `1px solid ${tone.border}`,
                              bgcolor: tone.background,
                              color: tone.color,
                              fontSize: 8.2,
                              fontWeight: 800,
                              letterSpacing: '0.02em',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.status}
                          </Box>
                        </Box>
                        <Box sx={{ px: 0.5 }}>
                          <Box
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 14,
                              px: 0.6,
                              borderRadius: 999,
                              border: `1px solid ${riskTone.border}`,
                              bgcolor: riskTone.background,
                              color: riskTone.color,
                              fontSize: 8.2,
                              fontWeight: 800,
                              letterSpacing: '0.02em',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {row.risk}
                          </Box>
                        </Box>
                        <Box sx={{ px: 0.5 }}>
                          <PersonCell name={row.observer} />
                        </Box>
                        <Typography sx={{ fontSize: 11, color: '#3B414A', px: 0.5 }}>{row.area}</Typography>
                        <Typography sx={{ fontSize: 11, color: '#3B414A', px: 0.5 }}>{row.line}</Typography>
                        <Box sx={{ px: 0.5 }}>
                          <PersonCell name={row.supervisor} />
                        </Box>
                        <Typography sx={{ fontSize: 11, color: '#3B414A', px: 0.5 }}>{row.reportDate}</Typography>
                        <Typography sx={{ fontSize: 11, color: '#3B414A', px: 0.5 }}>{row.lastUpdate}</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.15 }}>
                          <IconButton
                            size="small"
                            disabled={!canEditReport(row)}
                            onClick={(event) => {
                              event.stopPropagation();
                              if (!canEditReport(row)) return;
                              onEditRow(row);
                            }}
                            sx={{ width: 22, height: 22, color: canEditReport(row) ? '#2463EB' : '#A8B1BF' }}
                          >
                            <EditOutlinedIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(event) => {
                              event.stopPropagation();
                              onSelectRow(row);
                            }}
                            sx={{ width: 22, height: 22, color: '#2463EB' }}
                          >
                            <VisibilityOutlinedIcon sx={{ fontSize: 15.5 }} />
                          </IconButton>
                        </Box>
                      </>
                    )}
                  </Box>
                );
              })}
          </Box>
        </Box>
      </Box>
      <ReportsFilterModal open={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} />
    </>
  );
}

function DashboardTab() {
  const [view, setView] = useState<DashboardView>('BDX');
  const [sitePanelView, setSitePanelView] = useState<'table' | 'map'>('table');
  const showSiteFilter = view === 'Business Unit' || view === 'Site';
  const showAreaFilter = view === 'Site';
  const dashboardKpis = view === 'Site' ? dashboardSiteKpis : dashboardBdxKpis;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.05, flexWrap: 'wrap', mb: 1.45 }}>
        <Box sx={{ display: 'inline-flex', border: '1px solid #D3DAE6', borderRadius: 0.7, overflow: 'hidden', bgcolor: '#FFFFFF' }}>
          {dashboardViewOptions.map((option) => {
            const active = option === view;
            return (
              <Button
                key={option}
                onClick={() => setView(option)}
                sx={{
                  minWidth: 0,
                  px: 1.15,
                  py: 0.8,
                  borderRadius: 0,
                  bgcolor: active ? '#EDF3FF' : '#FFFFFF',
                  color: active ? '#2463EB' : '#5B6470',
                  fontSize: 11.5,
                  fontWeight: active ? 800 : 600,
                  borderRight: option !== 'Site' ? '1px solid #D3DAE6' : 'none',
                }}
              >
                {option.toUpperCase()}
              </Button>
            );
          })}
        </Box>
        <DashboardFilterSelect label="Period" value="May 05, 2026 - May 30, 2026" wide calendar />
        <DashboardFilterSelect label="Business Unit" value={view === 'BDX' ? 'All' : 'MDS'} width={152} />
        {showSiteFilter ? (
          <>
            <DashboardFilterSelect label="Site" value={view === 'Business Unit' ? 'All' : 'Sandy'} width={152} />
            {showAreaFilter ? (
              <>
                <DashboardFilterSelect label="Area" value="All" width={152} />
                <DashboardFilterSelect label="Line" value="All" width={132} />
                <DashboardFilterSelect label="Shift" value="All" width={132} />
              </>
            ) : null}
          </>
        ) : null}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: view === 'Site' ? { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(7, minmax(0, 1fr))' } : { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(4, minmax(0, 1fr))' }, gap: 1.2, mb: 1.25 }}>
        {dashboardKpis.map((card) => (
          <DashboardKpiCard key={`${card.label}-${card.value}`} {...card} />
        ))}
      </Box>

      {view === 'Site' ? (
        <Box sx={{ mb: 1.2 }}>
          <UnsafeReportsInSiteCard showMap={sitePanelView === 'map'} onToggleView={() => setSitePanelView((current) => current === 'table' ? 'map' : 'table')} />
        </Box>
      ) : null}

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: '2.1fr 1fr' }, gap: 1.2, mb: 1.2 }}>
        <OverallBusinessUnitChart view={view} />
        <PieCard
          title="ESO By Type"
          headerRight={(
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <LegendDot color="#4BB6EA" label="BBS" />
              <LegendDot color="#FFC873" label="Condition" />
              <LegendDot color="#E57373" label="Near Miss" />
            </Box>
          )}
          segments={[
            { value: 34.6, color: '#4BB6EA' },
            { value: 30.8, color: '#FFC873' },
            { value: 34.6, color: '#E57373' },
          ]}
          legend={[
            { label: 'BBS', color: '#4BB6EA' },
            { label: 'Condition', color: '#FFC873' },
            { label: 'Near Miss', color: '#E57373' },
          ]}
          labels={[
            { text: '30.8%', top: '26px', left: '16px' },
            { text: '34.6%', top: '22px', right: '8px' },
            { text: '34.6%', top: '122px', left: '50px' },
          ]}
          showLegend={false}
        />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 1.2, mb: 1.2 }}>
        <EsosByCategoryCard view={view} />
        <ParetoChartCard title="Golden Rule: Unsafe ESO" />
        <BbsBarriersCard />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', xl: 'repeat(3, minmax(0, 1fr))' }, gap: 1.2, mb: 1.2 }}>
        <TimeComparisonChart
          title="ESO Count - Time comparison"
          leftLabel="Count Rate"
          leftTicks={['0', '5k', '11k', '16k', '22k']}
          rightTicks={['0%', '6%', '12%', '18%', '24%']}
          current={esoCountCurrent}
          lastYear={esoCountLastYear}
          change={esoCountChange}
        />
        <TimeComparisonChart
          title="ESO Contact Rate - Time comparison"
          leftLabel="Contact Rate"
          leftTicks={['0', '5k', '11k', '16k', '22k']}
          rightTicks={['0%', '6%', '12%', '18%', '24%']}
          current={contactRateCurrent}
          lastYear={contactRateLastYear}
          change={contactRateChange}
        />
        <BusinessUnitComparisonChart view={view} />
      </Box>
    </>
  );
}

function ReviewBanner() {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.45,
        borderRadius: 1.3,
        bgcolor: '#EAF2FF',
        border: '1px solid #DDE7F4',
        mb: 1.5,
      }}
    >
      <Typography sx={{ fontSize: 18, fontWeight: 900, color: '#202124' }}>Review & Submit</Typography>
      <Typography sx={{ fontSize: 12.3, color: '#626465', mt: 0.65, lineHeight: 1.45 }}>
        Review your report before submitting.
      </Typography>
    </Paper>
  );
}

function ReviewSectionHeading({ title }: { title: string }) {
  return <Typography sx={{ fontSize: 12.5, fontWeight: 900, color: '#202124', mb: 0.7 }}>{title}</Typography>;
}

function ReviewPill({ label }: { label: string }) {
  return (
    <Box
      sx={{
        px: 1.1,
        py: 0.45,
        borderRadius: 999,
        bgcolor: '#F0F1F3',
        fontSize: 12.2,
        color: '#202124',
      }}
    >
      {label}
    </Box>
  );
}

function ReviewStaticField({
  label,
  value,
  valueColor = '#202124',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        minHeight: 54,
        borderRadius: 1.1,
        bgcolor: '#EDF1F5',
        px: 1,
        py: 0.75,
      }}
    >
      <Typography sx={{ fontSize: 9.5, color: '#98A1AE', mb: 0.35 }}>{label}</Typography>
      <Typography sx={{ fontSize: 12.8, color: valueColor, lineHeight: 1.4, whiteSpace: 'pre-line' }}>{value}</Typography>
    </Paper>
  );
}

function RiskLevelStrip({ title, active }: { title: string; active: 'LOW' | 'MEDIUM' | 'HIGH' }) {
  return (
    <Paper elevation={0} sx={{ borderRadius: 1.1, border: '1px solid #DDE4EC', p: 1, bgcolor: '#FFFFFF' }}>
      <Typography sx={{ fontSize: 11, color: '#7B8492', mb: 0.7 }}>{title}</Typography>
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => {
          const selected = level === active;

          return (
            <Box
              key={level}
              sx={{
                minWidth: 54,
                height: 24,
                borderRadius: 0.9,
                border: '1px solid #AFC8F8',
                bgcolor: selected ? '#EAF2FF' : '#FFFFFF',
                color: level === 'MEDIUM' ? '#D97706' : '#2463EB',
                display: 'grid',
                placeItems: 'center',
                fontSize: 10.5,
                fontWeight: 800,
              }}
            >
              {level}
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
}

function MediaCapturedList() {
  const items = [
    { thumbnail: 'linear-gradient(135deg, #7C633D 0%, #A98A57 42%, #E0D5B2 42%, #4E4B44 100%)', duration: '' },
    { thumbnail: 'linear-gradient(135deg, #6F7277 0%, #26292E 38%, #8B5A3C 100%)', duration: '00:08' },
  ];

  return (
    <Box sx={{ mt: 0.2 }}>
      <ReviewSectionHeading title="Media Captured" />
      <Box sx={{ display: 'flex', gap: 0.8 }}>
        {items.map((item) => (
          <Box key={`${item.thumbnail}-${item.duration}`} sx={{ width: 120, height: 88, borderRadius: 1, overflow: 'hidden', position: 'relative', background: item.thumbnail }}>
            {item.duration ? (
              <Typography sx={{ position: 'absolute', right: 6, bottom: 4, fontSize: 9.8, fontWeight: 800, color: '#FFFFFF', textShadow: '0 1px 2px rgba(0,0,0,0.45)' }}>
                {item.duration}
              </Typography>
            ) : null}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function ConditionReportDrawer({
  mode,
  report,
  onClose,
}: {
  mode: ReportPanelMode;
  report: ReportRow;
  onClose: () => void;
}) {
  const content = conditionPanelContent(report);
  const isNearMiss = report.type === 'Near Miss';
  const isReadOnly = mode === 'view';
  const showEditActions = mode === 'edit';
  const showMediaCaptured = true;
  const { openIntegratedActionCreateDrawer } = useActionTrackerContext();
  const [seriousPotentialOutcome, setSeriousPotentialOutcome] = useState(false);
  const [likelihoodLevel, setLikelihoodLevel] = useState<number>(1);
  const [severityLevel, setSeverityLevel] = useState<number>(2);
  const [recommendationsExpanded, setRecommendationsExpanded] = useState(true);
  const [showAtlasAssistantCard, setShowAtlasAssistantCard] = useState(true);
  const [atlasAnalysisApplied, setAtlasAnalysisApplied] = useState(false);
  const [recommendedRisk, setRecommendedRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [actionSuggestionIndexes, setActionSuggestionIndexes] = useState<number[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([
    'Immediately barricade the identified area and post warning signage.',
    'Conduct a slip/trip hazard inspection and remediate root cause (e.g., floor coating, drainage, housekeeping).',
    'Follow up with team lead to confirm corrective action is completed within 24 hours.',
  ]);
  const atlasAssistantLegend = isNearMiss
    ? 'ATLAS.AI can assist your review by analyzing the submitted information, recommending a Risk Rank, and identifying whether the Near Miss may qualify as a Serious Potential Outcome (SPO)'
    : 'ATLAS.AI can assist your review by analyzing the submitted information, recommending a Risk Rank, and suggesting which recommendations should be converted into Actions';
  const handleCreateIntegratedAction = () => {
    const inferredType = report.type === 'BBS' ? 'BBS' : report.type === 'Near Miss' ? 'Near Miss' : 'Condition Report';
    openIntegratedActionCreateDrawer({
      source: 'ESO',
      category: 'SAFETY',
      type: inferredType,
      title: `${report.type} follow-up for ${report.area}`,
      problem: content.description,
      location: report.area,
      createdBy: report.observer,
      assignedTo: report.supervisor,
      priority: 'Medium',
      originRecordId: report.id,
      originRecordLabel: report.id,
      originScreen: 'eso_hub',
    });
  };
  const handleApplyAtlasAnalysis = () => {
    if (isNearMiss) {
      setRecommendedRisk('HIGH');
      setSeverityLevel(2);
      setSeriousPotentialOutcome(true);
    } else {
      setRecommendedRisk('HIGH');
      setLikelihoodLevel(2);
      setSeverityLevel(2);
      setActionSuggestionIndexes([0, 2]);
    }
    setAtlasAnalysisApplied(true);
    setShowAtlasAssistantCard(false);
  };
  const recommendedRiskColor = recommendedRisk === 'HIGH' ? '#E45145' : recommendedRisk === 'MEDIUM' ? '#F06400' : '#4F9D69';

  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 500 },
          maxWidth: '100vw',
          bgcolor: '#FFFFFF',
          borderLeft: '1px solid #DDE4EC',
          boxShadow: '-16px 0 36px rgba(15,23,42,0.16)',
          overflow: 'hidden',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'grid', gridTemplateRows: showEditActions ? 'auto minmax(0, 1fr) auto' : 'auto minmax(0, 1fr)' }}>
        <Box sx={{ px: 1.1, py: 0.95, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', borderBottom: '1px solid #E7ECF3' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, fontWeight: 900, color: '#202124' }}>{content.title}</Typography>
            <Chip
              label={content.id}
              size="small"
              sx={{
                height: 20,
                borderRadius: 999,
                bgcolor: '#E7EBF0',
                color: '#5F6875',
                fontSize: 10.5,
                flexShrink: 0,
              }}
            />
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: '#2463EB', mt: -0.2, mr: -0.4 }}>
            <CloseIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        <Box sx={{ minHeight: 0, overflowY: 'auto', px: 0.9, py: 0.9 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
            {showEditActions && showAtlasAssistantCard ? (
              <Paper
                elevation={0}
                sx={{
                  px: 1.1,
                  py: 1,
                  borderRadius: 1.35,
                  bgcolor: '#EEF4FF',
                  border: '1px solid #D9E6FF',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.8, minWidth: 0 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 14, color: '#F59E0B', mt: 0.2 }} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#2463EB' }}>ATLAS.AI Assistant</Typography>
                    <Typography sx={{ fontSize: 10.4, color: '#667085', lineHeight: 1.45, mt: 0.2 }}>
                      {atlasAssistantLegend}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2, flexShrink: 0 }}>
                  <IconButton onClick={() => setShowAtlasAssistantCard(false)} size="small" sx={{ color: '#7A8491', p: 0.15 }}>
                    <CloseIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                  <IconButton onClick={handleApplyAtlasAnalysis} size="small" sx={{ color: atlasAnalysisApplied ? '#2463EB' : '#7A8491', p: 0.15 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Paper>
            ) : null}

            {showMediaCaptured ? <MediaCapturedList /> : null}

            <Box sx={{ pt: 0.3 }}>
              <ReviewSectionHeading title="Summary" />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7 }}>
                <ReviewStaticField label="Submitter Name" value={content.observerName} />
                <ReviewStaticField label="Occurrence Date" value={content.occurrenceDate} />
              </Box>
              {!isNearMiss ? (
                <Box sx={{ mt: 0.7 }}>
                  <ReviewStaticField
                    label="Classification"
                    value={content.esoType}
                    valueColor={content.esoType === 'Unsafe Condition' ? '#FF4D37' : content.esoType === 'Safe Condition' ? '#43A35D' : '#202124'}
                  />
                </Box>
              ) : null}
              <Box sx={{ mt: 0.7, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.7 }}>
                <ReviewStaticField label="Area" value={content.area} />
                <ReviewStaticField label="Unit" value={content.unit} />
              </Box>
              <Box sx={{ mt: 0.7 }}>
                <ReviewStaticField label="Description of Observation" value={content.description} />
              </Box>
            </Box>

            <Box sx={{ pt: 0.2 }}>
              <ReviewSectionHeading title="Categories" />
              <Box sx={{ display: 'flex' }}>
                <ReviewPill label={content.category} />
              </Box>
            </Box>

            <Box sx={{ pt: 0.2 }}>
              <ReviewSectionHeading title={isNearMiss ? 'Resolution status' : 'Resolution Status'} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.7 }}>
                <ReviewStaticField label="Resolved" value={content.resolved} valueColor={content.resolvedColor} />
                {mode === 'view' ? <ReviewStaticField label="Risk" value={report.risk} valueColor={report.risk === 'HIGH' ? '#E45145' : report.risk === 'MEDIUM' ? '#F06400' : '#4F9D69'} /> : null}
                {mode === 'view' ? <ReviewStaticField label="Recommendation" value={content.recommendation} /> : null}
              </Box>
            </Box>

            {showEditActions ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, pt: 0.2 }}>
                {atlasAnalysisApplied && !isNearMiss ? (
                  <Paper elevation={0} sx={{ px: 1, py: 0.75, borderRadius: 1.1, bgcolor: '#EEF7EE', border: '1px solid #CFE6D1' }}>
                    <Typography sx={{ fontSize: 12.2, fontWeight: 700, color: '#2F7D32' }}>
                      ATLAS.AI analysis applied{isNearMiss ? '. Recommended Risk Rank and SPO were updated.' : '. Recommended Risk Rank and suggested Actions were updated.'}
                    </Typography>
                  </Paper>
                ) : null}
                <Paper elevation={0} sx={{ borderRadius: 1.1, border: '1px solid #DDE4EC', bgcolor: '#FFFFFF', overflow: 'hidden' }}>
                  <Box sx={{ px: 1, py: 0.85, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: recommendationsExpanded ? '1px solid #E8EDF4' : 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.65 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#202124' }}>Recommendations</Typography>
                      <Box sx={{ width: 22, height: 22, borderRadius: '50%', bgcolor: '#246BFE', color: '#FFFFFF', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800 }}>
                        {recommendations.length}
                      </Box>
                    </Box>
                    <IconButton onClick={() => setRecommendationsExpanded((current) => !current)} size="small" sx={{ color: '#6B7280' }}>
                      <ExpandMoreIcon sx={{ fontSize: 18, transform: recommendationsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.15s ease' }} />
                    </IconButton>
                  </Box>
                  {recommendationsExpanded ? (
                    <Box sx={{ p: 0.75, display: 'grid', gap: 0.7 }}>
                      {recommendations.map((item, index) => (
                        <Paper key={`${index}-${item.slice(0, 8)}`} elevation={0} sx={{ p: 0.85, borderRadius: 1, border: '1px solid #D5DBE4', bgcolor: '#FFFFFF' }}>
                          <Box sx={{ display: 'grid', gridTemplateColumns: isNearMiss ? 'minmax(0, 1fr)' : 'minmax(0, 1fr) auto', gap: 0.7, alignItems: 'center' }}>
                            <Typography sx={{ fontSize: 13.3, color: '#4A5564', lineHeight: 1.35 }}>{item}</Typography>
                            {!isNearMiss ? (
                              <Button sx={{ minWidth: 0, px: 0.2, color: '#2463EB', fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap' }}>
                                {actionSuggestionIndexes.includes(index) ? 'SUGGESTED ACTION' : 'OPEN ACTION'}
                              </Button>
                            ) : null}
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  ) : null}
                </Paper>
                {!isNearMiss ? (
                  <>
                    <Paper elevation={0} sx={{ minHeight: 54, borderRadius: 1.1, bgcolor: '#EDF1F5', px: 1, py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: 9.5, color: '#98A1AE', mb: 0.35 }}>Risk</Typography>
                        <Typography sx={{ fontSize: 12.8, color: recommendedRiskColor, lineHeight: 1.4 }}>{recommendedRisk.charAt(0) + recommendedRisk.slice(1).toLowerCase()}</Typography>
                      </Box>
                      <Button variant="contained" sx={{ borderRadius: 1.2, minWidth: 84, height: 40, boxShadow: 'none', fontSize: 12.5, fontWeight: 800 }}>
                        SAVE
                      </Button>
                    </Paper>
                    <IncidentRiskSliderCompact
                      level={likelihoodLevel}
                      labels={['Not Likely', 'Could happen', 'Will Happen']}
                      messageByLevel={[
                        'Exposure is infrequent and controls are in place',
                        'Harm may occur if the condition persists during normal use.',
                        'Harm may occur at any time without additional controls.',
                      ]}
                      subtitle="When could this cause harm?"
                      title="Likelihood of incident"
                      onChange={setLikelihoodLevel}
                    />
                  </>
                ) : null}
                {isNearMiss ? (
                  <>
                    {atlasAnalysisApplied ? (
                      <Paper elevation={0} sx={{ px: 1, py: 0.75, borderRadius: 1.1, bgcolor: '#EEF7EE', border: '1px solid #CFE6D1' }}>
                        <Typography sx={{ fontSize: 12.2, fontWeight: 700, color: '#2F7D32' }}>
                          ATLAS.AI analysis applied. Recommended Risk Rank and SPO were updated.
                        </Typography>
                      </Paper>
                    ) : null}
                    <Paper elevation={0} sx={{ minHeight: 54, borderRadius: 1.1, bgcolor: '#EDF1F5', px: 1, py: 0.75, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                      <Box>
                        <Typography sx={{ fontSize: 9.5, color: '#98A1AE', mb: 0.35 }}>Risk</Typography>
                        <Typography sx={{ fontSize: 12.8, color: recommendedRiskColor, lineHeight: 1.4 }}>{recommendedRisk.charAt(0) + recommendedRisk.slice(1).toLowerCase()}</Typography>
                      </Box>
                      <Button variant="contained" sx={{ borderRadius: 1.2, minWidth: 84, height: 40, boxShadow: 'none', fontSize: 12.5, fontWeight: 800 }}>
                        SAVE
                      </Button>
                    </Paper>
                  </>
                ) : null}
                <IncidentRiskSliderCompact
                  level={severityLevel}
                  labels={['Minor', 'Serious injury', 'Severe injury']}
                  messageByLevel={[
                    'No injury, or minor reversible injury',
                    'Harm may occur if the condition persists during normal use.',
                    'May result in serious of life-threatening injury',
                  ]}
                  subtitle="How bad could it be?"
                  title="Potential severity of incident"
                  onChange={setSeverityLevel}
                />
                {isNearMiss ? (
                  <Paper elevation={0} sx={{ borderRadius: 1.1, border: '1px solid #DDE4EC', p: 1, bgcolor: '#FFFFFF' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <Checkbox
                        checked={seriousPotentialOutcome}
                        onChange={(event) => setSeriousPotentialOutcome(event.target.checked)}
                        sx={{
                          p: 0.2,
                          color: '#7A8491',
                          '& .MuiSvgIcon-root': { fontSize: 26 },
                          '&.Mui-checked': { color: '#2463EB' },
                        }}
                      />
                      <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#202124' }}>Serious Potential Outcome</Typography>
                    </Box>
                  </Paper>
                ) : null}
              </Box>
            ) : null}
            {mode === 'view' && report.status === 'UNDER FOLLOW-UP' ? (
              <Paper
                elevation={0}
                sx={{
                  p: 0.9,
                  borderRadius: 0.8,
                  bgcolor: '#F7C77A',
                  border: '1px solid #E0B062',
                  display: 'grid',
                  gridTemplateColumns: '18px minmax(0, 1fr) 18px',
                  alignItems: 'start',
                  gap: 0.65,
                }}
              >
                <Typography sx={{ fontSize: 15, color: '#7A3E00', lineHeight: 1.1 }}>⚠</Typography>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#202124', mb: 0.35 }}>
                    Linked Action - A2026101219
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: '#202124' }}>
                    Slip &amp; Trip Hazard Response Procedure
                  </Typography>
                </Box>
                <OpenInNewIcon sx={{ fontSize: 15, color: '#4B5563', mt: 0.15 }} />
              </Paper>
            ) : null}
          </Box>
        </Box>

        {showEditActions ? (isNearMiss ? <NearMissEditFooter /> : <ConditionEditFooter onClose={onClose} onCreateAction={handleCreateIntegratedAction} />) : null}
      </Box>
    </Drawer>
  );
}

function CloseReportDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [closeReason, setCloseReason] = useState('Resolved');
  const [justification, setJustification] = useState('');

  useEffect(() => {
    if (!open) {
      setCloseReason('Resolved');
      setJustification('');
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 0.8 } } }}
    >
      <Box sx={{ px: 1.5, pt: 1.35, pb: 1.2 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#202124', mb: 1.1 }}>Close Report</Typography>
        <TextField
          fullWidth
          select
          label="Close reason"
          value={closeReason}
          onChange={(event) => setCloseReason(event.target.value)}
          sx={{
            mb: 0.8,
            '& .MuiOutlinedInput-root': { borderRadius: 1.2, fontSize: 13.5, height: 38 },
            '& .MuiInputLabel-root': { fontSize: 12 },
          }}
        >
          {['Resolved', 'No Action to be Taken'].map((option) => (
            <MenuItem key={option} value={option}>{option}</MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          multiline
          minRows={4}
          label="Justification"
          placeholder="Enter the Justification to close the report"
          value={justification}
          onChange={(event) => setJustification(event.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.2,
              alignItems: 'flex-start',
              pr: 4.5,
            },
            '& .MuiInputLabel-root': { fontSize: 12 },
          }}
          slotProps={{
            input: {
              endAdornment: (
                <MicIcon sx={{ fontSize: 18, color: '#2463EB', position: 'absolute', right: 12, top: 14 }} />
              ),
            },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8, mt: 1.25 }}>
          <Button variant="outlined" onClick={onClose} sx={{ height: 32, px: 1.5, borderRadius: 1, fontSize: 12, fontWeight: 800 }}>
            CANCEL
          </Button>
          <Button variant="contained" onClick={onClose} sx={{ height: 32, px: 1.5, borderRadius: 1, fontSize: 12, fontWeight: 800, boxShadow: 'none' }}>
            MARK AS COMPLETED
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

function MarkAsDuplicatedDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{ paper: { sx: { borderRadius: 0.8 } } }}
    >
      <Box sx={{ px: 1.5, pt: 1.35, pb: 1.2 }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#202124', mb: 1.2 }}>Mark as Duplicated</Typography>
        <Typography sx={{ fontSize: 13.5, color: '#313843', lineHeight: 1.45, mb: 1.35 }}>
          Search for ESOs to group as duplicates. Results are automatically filtered to reports with the same Site, Area, Unit, Line, and Report Type. Once grouped, the system will automatically designate the earliest created ESO as the Parent report, and all selected ESOs will follow its lifecycle.
        </Typography>
        <Box sx={{ border: '1px solid #D5DBE4', borderRadius: 1.2, px: 1, py: 0.7, display: 'flex', alignItems: 'center', gap: 0.8 }}>
          <InputBase
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search Similar ESOs"
            sx={{ flex: 1, fontSize: 13.5 }}
          />
          <SearchIcon sx={{ fontSize: 18, color: '#556070' }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.8, mt: 1.25 }}>
          <Button variant="outlined" onClick={onClose} sx={{ height: 32, px: 1.5, borderRadius: 1, fontSize: 12, fontWeight: 800 }}>
            CANCEL
          </Button>
          <Button variant="contained" onClick={onClose} sx={{ height: 32, px: 1.5, borderRadius: 1, fontSize: 12, fontWeight: 800, boxShadow: 'none' }}>
            MARK AS DUPLICATE
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

function ConditionEditFooter({ onClose, onCreateAction }: { onClose: () => void; onCreateAction: () => void }) {
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);

  return (
    <>
      <Box sx={{ px: 1, py: 0.9, borderTop: '1px solid #E5EAF3', display: 'flex', justifyContent: 'flex-end', gap: 0.75 }}>
        <Button
          variant="outlined"
          onClick={() => setDuplicateDialogOpen(true)}
          sx={{ height: 30, borderRadius: 1, px: 1.2, fontSize: 11.5, fontWeight: 800 }}
        >
          MARK AS DUPLICATED
        </Button>
        <Button
          variant="outlined"
          onClick={() => setCloseDialogOpen(true)}
          sx={{ height: 30, borderRadius: 1, px: 1.2, fontSize: 11.5, fontWeight: 800 }}
        >
          MARK AS CLOSED
        </Button>
        <Button
          variant="outlined"
          onClick={onCreateAction}
          sx={{ height: 30, borderRadius: 1, px: 1.2, fontSize: 11.5, fontWeight: 800 }}
        >
          CREATE ACTION
        </Button>
      </Box>
      <MarkAsDuplicatedDialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)} />
      <CloseReportDialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} />
    </>
  );
}

function IncidentRiskSliderCompact({
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
    <Paper elevation={0} sx={{ p: 1, borderRadius: 1, bgcolor: '#F3F4F6', border: '1px solid #E5E7EB' }}>
      <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: '#202124' }}>{title}</Typography>
      <Typography sx={{ fontSize: 12, color: '#626465' }}>{subtitle}</Typography>
      <Box sx={{ mt: 0.8, px: 1, py: 0.7, borderRadius: 0.7, bgcolor: '#F1D5A8' }}>
        <Typography sx={{ fontSize: 12.8, color: '#5C4A2F' }}>{messageByLevel[level]}</Typography>
      </Box>
      <Slider
        min={0}
        max={2}
        step={1}
        marks
        value={level}
        onChange={(_, value) => onChange(Array.isArray(value) ? value[0] : value)}
        sx={{
          mt: 0.4,
          color: sliderColor,
          '& .MuiSlider-rail': { opacity: 1, bgcolor: '#D9DDE3' },
          '& .MuiSlider-track': { bgcolor: sliderColor, border: 'none' },
          '& .MuiSlider-thumb': { bgcolor: sliderColor },
        }}
      />
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', mt: -0.2 }}>
        {labels.map((label, index) => (
          <Typography key={label} sx={{ textAlign: index === 0 ? 'left' : index === 1 ? 'center' : 'right', fontSize: 11.5, color: '#626465' }}>{label}</Typography>
        ))}
      </Box>
    </Paper>
  );
}

function CreateActionDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const fieldSx = {
    mb: 0.8,
    '& .MuiOutlinedInput-root': {
      borderRadius: 1.2,
      bgcolor: '#F7F9FC',
      height: 42,
      '& fieldset': { borderColor: '#D8E0EA' },
    },
    '& .MuiInputBase-input': { fontSize: 28 / 2, color: '#202124', py: 1.05 },
    '& .MuiInputLabel-root': { fontSize: 12, color: '#6B7280' },
  } as const;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{ hideBackdrop: true }}
      PaperProps={{ sx: { width: { xs: '100%', sm: 500 }, maxWidth: '100vw' } }}
    >
      <Box sx={{ height: '100%', display: 'grid', gridTemplateRows: 'auto minmax(0,1fr) auto', bgcolor: '#FFFFFF' }}>
        <Box sx={{ px: 1.1, py: 0.95, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E7ECF3' }}>
          <Typography sx={{ fontSize: 33/2, fontWeight: 700, color: '#202124' }}>New Action</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: '#2463EB' }}><CloseIcon sx={{ fontSize: 18 }} /></IconButton>
        </Box>
        <Box sx={{ minHeight: 0, overflowY: 'auto', px: 1, py: 1 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 1.1,
              border: '1px solid #D8E0EA',
              bgcolor: '#F7F9FC',
              px: 0.9,
              py: 0.75,
              mb: 0.9,
              minHeight: 58,
              display: 'grid',
              gridTemplateColumns: 'auto minmax(0, 1fr)',
              alignItems: 'center',
              columnGap: 0.75,
            }}
          >
            <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#EAF2FF', display: 'grid', placeItems: 'center' }}>
              <PersonOutlineIcon sx={{ fontSize: 18, color: '#2C6BFF' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 10.6, color: '#7A8493', fontWeight: 700, lineHeight: 1.1 }}>Created by</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55, mt: 0.35 }}>
                <Avatar sx={{ width: 18, height: 18, fontSize: 10, bgcolor: '#DDF4E2', color: '#2F8A42' }}>M</Avatar>
                <Typography sx={{ fontSize: 15, color: '#202124', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Maddison Brooks
                </Typography>
              </Box>
            </Box>
          </Paper>
          <Box sx={{ position: 'relative' }}>
            <TextField fullWidth label="Title" placeholder="Enter action title" sx={fieldSx} />
            <MicIcon sx={{ position: 'absolute', right: 10, top: 12, fontSize: 18, color: '#2463EB' }} />
          </Box>
          <Box sx={{ position: 'relative', mb: 0.8 }}>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label="What happened?"
              value="Immediately barricade the identified area and post warning signage. Conduct a slip/trip hazard inspection and remediate root cause (e.g.,floor coating, drainage, housekeeping). Follow up with team lead to confirm corr..."
              sx={{
                '& .MuiOutlinedInput-root': { borderRadius: 1.2, bgcolor: '#F7F9FC', '& fieldset': { borderColor: '#D8E0EA' } },
                '& .MuiInputBase-input': { fontSize: 14, color: '#202124', lineHeight: 1.4 },
                '& .MuiInputLabel-root': { fontSize: 12, color: '#6B7280' },
              }}
            />
            <MicIcon sx={{ position: 'absolute', right: 10, bottom: 10, fontSize: 18, color: '#2463EB' }} />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 0.8,
              mb: 1.2,
            }}
          >
            {[
              { label: 'Type', value: '', icon: <AutoAwesomeIcon sx={{ fontSize: 18, color: '#2C6BFF' }} /> },
              { label: 'Category', value: 'Safety', icon: <ApartmentIcon sx={{ fontSize: 18, color: '#2C6BFF' }} /> },
              { label: 'Priority', value: 'Medium', icon: <OutlinedFlagIcon sx={{ fontSize: 18, color: '#2C6BFF' }} /> },
              { label: 'Machine', value: '', icon: <PrecisionManufacturingOutlinedIcon sx={{ fontSize: 18, color: '#2C6BFF' }} /> },
              { label: 'Location', value: 'Warehouse South', icon: <LocationOnOutlinedIcon sx={{ fontSize: 18, color: '#2C6BFF' }} /> },
              { label: 'Due Date', value: 'May 17, 2026', icon: <CalendarTodayIcon sx={{ fontSize: 18, color: '#2C6BFF' }} /> },
              { label: 'Owner', value: '', icon: <PersonOutlineIcon sx={{ fontSize: 18, color: '#2C6BFF' }} /> },
              { label: 'Approvers', value: '', icon: <PersonOutlineIcon sx={{ fontSize: 18, color: '#2C6BFF' }} /> },
            ].map((field) => (
              <Paper
                key={field.label}
                elevation={0}
                sx={{
                  borderRadius: 1.2,
                  border: '1px solid #D8E0EA',
                  bgcolor: '#F7F9FC',
                  px: 0.9,
                  py: 0.75,
                  minHeight: 68,
                  display: 'grid',
                  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
                  alignItems: 'center',
                  columnGap: 0.75,
                }}
              >
                <Box sx={{ width: 34, height: 34, borderRadius: '50%', bgcolor: '#EAF2FF', display: 'grid', placeItems: 'center' }}>
                  {field.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: 10.6, color: '#7A8493', fontWeight: 700, lineHeight: 1.1 }}>{field.label}</Typography>
                  <Typography
                    sx={{
                      fontSize: 15,
                      color: field.value ? '#202124' : '#B0B7C4',
                      fontWeight: 700,
                      mt: 0.35,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {field.value || ' '}
                  </Typography>
                </Box>
                <ExpandMoreIcon sx={{ fontSize: 20, color: '#6D7684' }} />
              </Paper>
            ))}
          </Box>
          <Typography sx={{ fontSize: 12, fontWeight: 800, color: '#2463EB', mb: 0.7 }}>Attachments</Typography>
          <Box sx={{ display: 'flex', gap: 0.8 }}>
            <Box component="img" src="/images/ESO image.png" alt="attachment 1" sx={{ width: 92, height: 92, objectFit: 'cover', borderRadius: 0.7 }} />
            <Box sx={{ position: 'relative' }}>
              <Box component="img" src="/images/ESO image.png" alt="attachment 2" sx={{ width: 92, height: 92, objectFit: 'cover', borderRadius: 0.7 }} />
              <Box sx={{ position: 'absolute', right: 4, bottom: 4, bgcolor: 'rgba(0,0,0,0.75)', color: '#FFFFFF', borderRadius: 0.4, px: 0.35, fontSize: 9.5 }}>00:08</Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{ px: 1, py: 0.9, borderTop: '1px solid #E5EAF3', display: 'flex', justifyContent: 'flex-end', gap: 0.75, bgcolor: '#FFFFFF' }}>
          <Button variant="outlined" onClick={onClose} sx={{ borderRadius: 1.1, minWidth: 62, height: 32 }}>CANCEL</Button>
          <Button variant="contained" onClick={onClose} sx={{ borderRadius: 1.1, minWidth: 108, height: 32, boxShadow: 'none' }}>CREATE ACTION</Button>
        </Box>
      </Box>
    </Drawer>
  );
}

function NearMissEditFooter() {
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);
  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false);

  return (
    <>
      <Box sx={{ px: 1, py: 0.9, borderTop: '1px solid #E5EAF3', display: 'flex', justifyContent: 'flex-end', gap: 0.75 }}>
        <Button
          variant="outlined"
          onClick={() => setDuplicateDialogOpen(true)}
          sx={{ height: 30, borderRadius: 1, px: 1.2, fontSize: 11.5, fontWeight: 800 }}
        >
          MARK AS DUPLICATED
        </Button>
        <Button
          variant="outlined"
          onClick={() => setCloseDialogOpen(true)}
          sx={{ height: 30, borderRadius: 1, px: 1.2, fontSize: 11.5, fontWeight: 800 }}
        >
          MARK AS CLOSED
        </Button>
      </Box>
      <MarkAsDuplicatedDialog open={duplicateDialogOpen} onClose={() => setDuplicateDialogOpen(false)} />
      <CloseReportDialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} />
    </>
  );
}

function reportReviewMeta(report: ReportRow) {
  if (report.type === 'BBS') {
    return {
      summaryTitle: 'Task Observed',
      summaryText: 'Sheet metal cutting and bending on the press brake - worker preparing flanged brackets for conveyor system repair.',
      tags: ['2 Individuals', '0 Contractors', '0 Visitors'],
      categories: ['Rushing', 'Management Pressure'],
      categoryLabel: 'PPE',
      recommendation: 'Worker agreed to wear all required PPE and follow safety procedures at all times.',
    } as const;
  }

  if (report.type === 'Near Miss') {
    return {
      esoType: 'Near Miss',
      description: 'Stack of trays leaning slightly off the edge of the workstation. Potential for falling material and injury if bumped during movement.',
      category: 'Contractors / Visitors',
      recommendation: 'Immediately isolate the area, restack the trays safely, and review material staging controls with the team before restarting movement.',
    } as const;
  }

  return {
    esoType: report.status === 'CLOSED' ? 'Safe Condition' : 'Unsafe Condition',
    description: 'Oil leak on Hydraulic Pump B. Inspection and containment required.',
    category: 'Contractors / Visitors',
    recommendation: 'Immediately secure the affected area using appropriate barriers and clearly visible warning signage to prevent access.',
  } as const;
}

function conditionPanelContent(report: ReportRow) {
  return {
    id: report.id,
    title: report.type,
    observerName: 'Jose Rodriguez',
    occurrenceDate: 'March 10, 2026',
    esoType: report.type === 'Near Miss' ? 'Near Miss' : 'Unsafe Condition',
    area: 'Warehouse South',
    unit: 'Unit A',
    description: report.type === 'Near Miss'
      ? 'Stack of trays leaning slightly off the edge of the workstation. Potential for falling material and injury if bumped during movement.'
      : 'Oil leak on Hydraulic Pump B. Inspection and containment required.',
    category: 'Contractors / Visitors',
    resolved: report.status === 'CLOSED' ? 'Yes' : 'No',
    resolvedColor: report.status === 'CLOSED' ? '#43A35D' : '#E45145',
    recommendation: `Immediately secure the affected area using appropriate barriers and clearly visible warning signage to prevent access. Perform a thorough inspection to identify any slip or trip hazards, and address the root cause (e.g., damaged flooring, inadequate drainage, spills, or poor housekeeping conditions). Implement corrective actions promptly and verify that the area is safe before reopening. Follow up with the team lead to ensure all actions are completed, documented, and validated within 24 hours.`,
  } as const;
}

function matchesReportStatusTab(row: ReportRow, tab: ReportStatusTab) {
  if (tab === 'closed') {
    return row.status === 'CLOSED';
  }

  if (tab === 'awaitingReview') {
    return row.status === 'REVIEW';
  }

  return row.status !== 'CLOSED';
}

function canEditReport(row: ReportRow) {
  return (row.type === 'Condition Report' || row.type === 'Near Miss') && row.status === 'REVIEW';
}

function reportEntryMode(row: ReportRow): 'bbs' | 'condition' | 'nearMiss' {
  if (row.type === 'BBS') {
    return 'bbs';
  }

  if (row.type === 'Condition Report') {
    return 'condition';
  }

  return 'nearMiss';
}

type EsoAdministrativeScope = 'global' | 'site';

const esoAdministrativeHistoryRows = [
  {level: 'Global', site: '—', location: 'BBS / Initial Information', change: 'Modified "Shift" field to be site-editable', changedBy: 'John Smith', changedDate: 'May 10, 2024 14:22'},
  {level: 'Site → Columbus West', site: 'Columbus West', location: 'BBS / Categories', change: 'Selected "PPE" and "Safe Walking" as Top 5 Focus Areas', changedBy: 'John Smith', changedDate: 'May 10, 2024 14:22'},
  {level: 'Site → Canaan', site: 'Canaan', location: 'ESO Targets', change: 'Updated monthly site submission targets: 50 → 65', changedBy: 'John Smith', changedDate: 'May 10, 2024 14:22'},
  {level: 'Global', site: '—', location: 'Condition / Resolution Status', change: 'Added "Update local procedure" to Medium Risk recommendations', changedBy: 'John Smith', changedDate: 'May 10, 2024 14:22'},
  {level: 'Site → Sandy', site: 'Sandy', location: 'Near Miss / Initial Information', change: 'Overrode "Area" field label to "Manufacturing Cell"', changedBy: 'John Smith', changedDate: 'May 10, 2024 14:22'},
] as const;

function EsoAdministrativeCard({
  accent,
  description,
  icon,
  onClick,
  title,
}: {
  accent: string;
  description: string;
  icon: ReactNode;
  onClick?: () => void;
  title: string;
}) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        borderRadius: 1.5,
        border: '1px solid #D8E0EA',
        bgcolor: '#FFFFFF',
        px: {xs: 1.2, md: 1.55},
        py: {xs: 0.95, md: 1.1},
        display: 'grid',
        gridTemplateColumns: {xs: '48px minmax(0, 1fr) auto', md: '58px minmax(0, 1fr) auto'},
        alignItems: 'center',
        gap: {xs: 0.75, md: 1},
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Box sx={{width: {xs: 42, md: 50}, height: {xs: 42, md: 50}, borderRadius: 1.3, bgcolor: '#F3F6FB', display: 'grid', placeItems: 'center', color: accent}}>
        {icon}
      </Box>
      <Box>
        <Typography sx={{fontSize: {xs: 15, md: 16}, fontWeight: 900, lineHeight: 1.1, color: '#02153C', letterSpacing: '-0.01em'}}>{title}</Typography>
        <Typography sx={{fontSize: {xs: 11.2, md: 11.8}, color: '#49648D', mt: 0.25, lineHeight: 1.28}}>{description}</Typography>
      </Box>
      <Box sx={{width: {xs: 30, md: 36}, height: {xs: 30, md: 36}, borderRadius: '50%', bgcolor: '#F1F4F8', display: 'grid', placeItems: 'center'}}>
        <ChevronRightIcon sx={{fontSize: {xs: 20, md: 22}, color: '#1A2C49'}} />
      </Box>
    </Paper>
  );
}

function EsoAdministrativeNavItem({
  active = false,
  description,
  onClick,
  title,
}: {
  active?: boolean;
  description: string;
  onClick?: () => void;
  title: string;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        px: 1.2,
        py: 1.05,
        borderRadius: 0.6,
        bgcolor: active ? '#EAF1FF' : 'transparent',
        border: active ? '1px solid #DCE6F7' : '1px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <Typography sx={{fontSize: 13.2, fontWeight: 500, color: '#202124', mb: 0.35, lineHeight: 1.2}}>{title}</Typography>
      <Typography sx={{fontSize: 11.3, color: '#6B7280', lineHeight: 1.35}}>{description}</Typography>
    </Box>
  );
}

function getEsoAdministrativeNavItems({
  isGlobal,
  onOpenBbsConfiguration,
  onOpenConditionConfiguration,
  onOpenNearMissConfiguration,
  onOpenContactRateTargets,
  onOpenEsoTargetsConfiguration,
  onOpenTerminology,
  onOpenHistoryLog,
}: {
  isGlobal: boolean;
  onOpenBbsConfiguration: () => void;
  onOpenConditionConfiguration: () => void;
  onOpenNearMissConfiguration: () => void;
  onOpenContactRateTargets: () => void;
  onOpenEsoTargetsConfiguration: () => void;
  onOpenTerminology: () => void;
  onOpenHistoryLog: () => void;
}) {
  return isGlobal
    ? [
      { title: 'History Log', description: 'Log of all modifications in administrative configurations.', onClick: onOpenHistoryLog },
      { title: 'BBS', description: 'Manage safety observation workflows, barriers, and commitment settings.', onClick: onOpenBbsConfiguration },
      { title: 'Condition Report', description: 'Configure initial information forms, categories, and resolution tracking.', onClick: onOpenConditionConfiguration },
      { title: 'Near Miss', description: 'Defined as an unplanned event that did not result in injury, illness, or damage.', onClick: onOpenNearMissConfiguration },
      { title: 'Manage BDX Targets', description: 'Configure Global, Business Unit, and Site level targets for Contact Rates and Closure Rates at the start of the fiscal year.', onClick: onOpenContactRateTargets },
    ]
    : [
      { title: 'History Log', description: 'Log of all modifications in administrative configurations.', onClick: onOpenHistoryLog },
      { title: 'BBS', description: 'Manage safety observation workflows, barriers, and commitment settings.', onClick: onOpenBbsConfiguration },
      { title: 'Condition Report', description: 'Configure initial information forms, categories, and resolution tracking.', onClick: onOpenConditionConfiguration },
      { title: 'Near Miss', description: 'Defined as an unplanned event that did not result in injury, illness, or damage.', onClick: onOpenNearMissConfiguration },
      { title: 'ESO Submission Rate', description: 'Configure monthly and annual submission targets for this site.', onClick: onOpenEsoTargetsConfiguration },
      { title: 'Terminology', description: 'Customize labels that appear frequently in forms.', onClick: onOpenTerminology },
    ];
}

function EsoAdministrativeShell({
  activeTitle,
  children,
  isGlobal,
  onOpenBbsConfiguration,
  onOpenConditionConfiguration,
  onOpenNearMissConfiguration,
  onOpenContactRateTargets,
  onOpenEsoTargetsConfiguration,
  onOpenTerminology,
  onOpenHistoryLog,
  onOpenHub,
}: {
  activeTitle: string;
  children: ReactNode;
  isGlobal: boolean;
  onOpenBbsConfiguration: () => void;
  onOpenConditionConfiguration: () => void;
  onOpenNearMissConfiguration: () => void;
  onOpenContactRateTargets: () => void;
  onOpenEsoTargetsConfiguration: () => void;
  onOpenTerminology: () => void;
  onOpenHistoryLog: () => void;
  onOpenHub: () => void;
}) {
  const navItems = getEsoAdministrativeNavItems({
    isGlobal,
    onOpenBbsConfiguration,
    onOpenConditionConfiguration,
    onOpenNearMissConfiguration,
    onOpenContactRateTargets,
    onOpenEsoTargetsConfiguration,
    onOpenTerminology,
    onOpenHistoryLog,
  });

  return (
    <Box sx={{flexGrow: 1, overflowY: 'auto', bgcolor: '#FFFFFF', minHeight: 'calc(100vh - 112px)'}}>
      <Box sx={{px: {xs: 1.2, md: 2.4}, py: 1.25}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45, flexWrap: 'wrap'}}>
          <Button
            onClick={onOpenHub}
            sx={{minWidth: 0, p: 0, fontSize: 14, fontWeight: 700, color: '#2F2F2F', lineHeight: 1.1, textTransform: 'none', justifyContent: 'flex-start', '&:hover': {background: 'transparent', color: '#2569ED'}}}
          >
            ESO
          </Button>
          <Typography sx={{fontSize: 14, fontWeight: 700, color: '#2F2F2F', lineHeight: 1.1}}>/ Administrative</Typography>
        </Box>
      </Box>
      <Box sx={{mx: {xs: 1.2, md: 2.4}, mb: 1.2, border: '1px solid #D8E0EA', borderRadius: 1.2, bgcolor: '#FFFFFF', p: 0.9}}>
        <Box sx={{display: 'grid', gridTemplateColumns: { xs: '1fr', md: '260px minmax(0, 1fr)' }, gap: 1.4, minHeight: 680}}>
          <Paper elevation={0} sx={{border: '1px solid #D8E0EA', borderRadius: 0.9, p: 0.45, bgcolor: '#FBFCFD', alignSelf: 'stretch'}}>
            <Box sx={{display: 'grid', gap: 0.45}}>
              {navItems.map((item) => (
                <EsoAdministrativeNavItem
                  key={item.title}
                  active={item.title === activeTitle}
                  description={item.description}
                  onClick={item.onClick}
                  title={item.title}
                />
              ))}
            </Box>
          </Paper>
          <Box sx={{minWidth: 0}}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function EsoAdministrativePage({
  onOpenBbsConfiguration,
  onOpenContactRateTargets,
  onOpenConditionConfiguration,
  onOpenEsoTargetsConfiguration,
  onOpenHistoryLog,
  onOpenHub,
  onOpenNearMissConfiguration,
  onOpenTerminology,
  scope,
  scopeLabel,
  onBack,
}: {
  onOpenBbsConfiguration: () => void;
  onOpenContactRateTargets: () => void;
  onOpenConditionConfiguration: () => void;
  onOpenEsoTargetsConfiguration: () => void;
  onOpenHistoryLog: () => void;
  onOpenHub: () => void;
  onOpenNearMissConfiguration: () => void;
  onOpenTerminology: () => void;
  onBack: () => void;
  scope: EsoAdministrativeScope;
  scopeLabel: string;
}) {
  const isGlobal = scope === 'global';
  const historyRows = isGlobal
    ? esoAdministrativeHistoryRows
    : Array.from({ length: 15 }, (_, index) => {
      const base = esoAdministrativeHistoryRows[index % esoAdministrativeHistoryRows.length];
      return {
        ...base,
        level: `Site → ${scopeLabel}`,
        site: scopeLabel,
      };
    });

  return (
    <EsoAdministrativeShell
      activeTitle="History Log"
      isGlobal={isGlobal}
      onOpenBbsConfiguration={onOpenBbsConfiguration}
      onOpenConditionConfiguration={onOpenConditionConfiguration}
      onOpenNearMissConfiguration={onOpenNearMissConfiguration}
      onOpenContactRateTargets={onOpenContactRateTargets}
      onOpenEsoTargetsConfiguration={onOpenEsoTargetsConfiguration}
      onOpenTerminology={onOpenTerminology}
      onOpenHistoryLog={onOpenHistoryLog}
      onOpenHub={onOpenHub}
    >
      <Typography sx={{fontSize: 14, fontWeight: 700, color: '#2F2F2F', mb: 1.2, lineHeight: 1.1}}>History Log</Typography>
            <TableContainer component={Paper} elevation={0} sx={{borderRadius: 0.9, border: '1px solid #D8E0EA', overflow: 'hidden', boxShadow: 'none'}}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{bgcolor: '#FBFCFD'}}>
                    {['LEVEL', 'LOCATION', 'CHANGE', 'CHANGED BY', 'CHANGE DATE'].map((header) => (
                      <TableCell key={header} sx={{fontSize: 11.3, fontWeight: 800, color: '#202124', py: 1.2}}>{header}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyRows.map((row, index) => (
                    <TableRow key={`${row.level}-${row.location}-${index}`} sx={{'& td': {borderColor: '#E7EDF5', py: 1.1}}}>
                      <TableCell sx={{fontSize: 11.7, color: '#303844', whiteSpace: 'nowrap'}}>{row.level}</TableCell>
                      <TableCell sx={{fontSize: 11.7, color: '#303844'}}>{row.location}</TableCell>
                      <TableCell sx={{fontSize: 11.7, color: '#303844'}}>{row.change}</TableCell>
                      <TableCell sx={{fontSize: 11.7, color: '#303844', whiteSpace: 'nowrap'}}>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7}}>
                          <Avatar sx={{width: 18, height: 18, fontSize: 10}}>J</Avatar>
                          <Typography sx={{fontSize: 11.7, color: '#303844'}}>{row.changedBy}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{fontSize: 11.7, color: '#303844', whiteSpace: 'nowrap'}}>{row.changedDate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
    </EsoAdministrativeShell>
  );
}

function ManageBdxContactRateTargetsPage({onBack, embedded = false}: {onBack: () => void; embedded?: boolean}) {
  const businessUnitsSeed = [
    {
      id: 'mds',
      name: 'MDS',
      rate: '2.1',
      sites: ['Canaan', 'Columbus West', 'Fraga', 'Juiz de Fora', 'NAMC', 'Nogales', 'Sandy', 'Tijuana 1', 'Tuas'],
    },
    {id: 'ps', name: 'PS', rate: '2.1', sites: ['Sandy', 'Columbus West']},
    {id: 'surgery', name: 'Surgery', rate: '2.1', sites: ['Warsaw', 'Cork', 'Salt Lake City']},
    {id: 'mms', name: 'MMS', rate: '2.1', sites: ['Covington', 'Wilson', 'Alajuela']},
    {id: 'apm', name: 'APM', rate: '2.1', sites: ['Tempe', 'Singapore', 'Shanghai']},
    {id: 'pi', name: 'PI', rate: '2.1', sites: ['Heidelberg', 'Tijuana', 'Suzhou']},
    {id: 'ucc', name: 'UCC', rate: '2.1', sites: ['Draper', 'Brea', 'Plymouth']},
    {id: 'sm', name: 'SM', rate: '2.1', sites: ['San Diego', 'Galway', 'Kuala Lumpur']},
    {id: 'gsc', name: 'GSC', rate: '2.1', sites: ['Campinas', 'Bogota', 'San Jose']},
  ];
  const fiscalMonths = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'];
  const buMonthValues = ['2.1', '2.1', '2.1', '2.1', '2.1', '2.1', '2.1', '2.3', '2.5', '2.5', '2.7', '2.7'];
  const siteMonthValues = ['1.5', '1.5', '1.5', '1.5', '1.5', '1.5', '1.5', '2', '2', '2', '2.2', '2.2'];
  const [expandedBuId, setExpandedBuId] = useState<string | null>(null);
  const [buRates, setBuRates] = useState<Record<string, string>>(
    Object.fromEntries(businessUnitsSeed.map((bu) => [bu.id, bu.rate])),
  );
  const [siteRates, setSiteRates] = useState<Record<string, string>>(() => {
    const entries: Array<[string, string]> = [];
    businessUnitsSeed.forEach((bu) => {
      bu.sites.forEach((site) => entries.push([`${bu.id}-${site}`, '1.5']));
    });
    return Object.fromEntries(entries);
  });
  const [allowPastMonths, setAllowPastMonths] = useState<Record<string, boolean>>({});
  const [bdxContactRate, setBdxContactRate] = useState('4.0');

  return (
    <Box sx={{flexGrow: 1, overflowY: 'auto', bgcolor: embedded ? 'transparent' : '#F1F3F6', minHeight: embedded ? 'auto' : 'calc(100vh - 112px)', zoom: 0.92}}>
      {!embedded ? (
      <Box sx={{px: {xs: 1.2, md: 2.4}, py: 1, borderBottom: '1px solid #D4DBE7', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <IconButton onClick={onBack} sx={{width: 30, height: 30, color: '#34557F'}}>
            <ArrowBackIcon sx={{fontSize: 20}} />
          </IconButton>
          <Typography sx={{fontSize: 16, fontWeight: 900, color: '#001B49', textTransform: 'uppercase'}}>Manage BDX Contact Rate Targets</Typography>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Button onClick={onBack} sx={{height: 34, px: 1.5, color: '#4C658B', fontWeight: 800, fontSize: 11.5}}>CANCEL</Button>
          <Button variant="contained" onClick={onBack} sx={{height: 34, px: 2, borderRadius: 1.2, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>SAVE ALL TARGETS</Button>
        </Box>
      </Box>
      ) : null}

      <Box sx={{maxWidth: embedded ? '100%' : 1260, width: '100%', mx: embedded ? 0 : 'auto', px: embedded ? 0 : {xs: 1.2, md: 2.3}, py: embedded ? 0 : {xs: 1.4, md: 2.2}, display: 'grid', gap: 1.4}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2}}>
          <Box>
            <Typography sx={{fontSize: 18, fontWeight: 700, color: '#202124', lineHeight: 1.1}}>BDX Targets</Typography>
            <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.25}}>Global</Typography>
          </Box>
          <Button variant="contained" sx={{height: 30, minWidth: 82, borderRadius: 1.1, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>
            SAVE
          </Button>
        </Box>

        <Paper elevation={0} sx={{border: '1px solid #D8E0EA', borderRadius: 1.2, p: 1.2, maxWidth: 420}}>
          <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124', mb: 1}}>BDX Contact Rate (Ratio)</Typography>
          <TextField
            fullWidth
            value={bdxContactRate}
            onChange={(event) => setBdxContactRate(event.target.value)}
            sx={{'& .MuiOutlinedInput-root': {height: 36, borderRadius: 1.1}, '& .MuiOutlinedInput-input': {fontSize: 14, color: '#202124', py: 0.8}}}
          />
        </Paper>

        <Box>
          <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124', mb: 1}}>Business Units & Sites Contact Rate Targets</Typography>
        </Box>

        {businessUnitsSeed.map((bu) => {
          const expanded = expandedBuId === bu.id;
          return (
            <Paper key={bu.id} elevation={0} sx={{borderRadius: 0, border: '1px solid #D8E0EA', overflow: 'hidden', bgcolor: '#FFFFFF'}}>
              <Box sx={{px: 1.3, py: 1, display: 'grid', gridTemplateColumns: '34px 180px minmax(0,1fr)', alignItems: 'center', gap: 1}}>
                <IconButton onClick={() => setExpandedBuId((prev) => prev === bu.id ? null : bu.id)} sx={{color: '#8AA0BF'}}>
                  <ExpandMoreIcon sx={{fontSize: 21, transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s ease'}} />
                </IconButton>
                <Box>
                  <Typography sx={{fontSize: 14, fontWeight: 500, color: '#202124', lineHeight: 1.2}}>{bu.name}</Typography>
                  <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.2}}>Business Unit</Typography>
                </Box>
                <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(12, minmax(68px, 1fr))', gap: 0.7}}>
                  {fiscalMonths.map((month, index) => (
                    <Box key={`${bu.id}-${month}`}>
                      <Typography sx={{fontSize: 10, color: '#7C8593', textTransform: 'uppercase', mb: 0.35, textAlign: 'center', letterSpacing: '0.05em'}}>{month}</Typography>
                      <TextField
                        value={index >= 7 ? buMonthValues[index] : (index === 0 ? (buRates[bu.id] ?? buMonthValues[index]) : buMonthValues[index])}
                        onChange={(event) => {
                          if (index === 0) {
                            setBuRates((prev) => ({...prev, [bu.id]: event.target.value}));
                          }
                        }}
                        sx={{'& .MuiOutlinedInput-root': {height: 34, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiOutlinedInput-input': {fontSize: 12, color: '#202124', py: 0.75}}}
                      />
                    </Box>
                  ))}
                </Box>
              </Box>

              {expanded ? (
                <Box sx={{bgcolor: '#F5F8FB'}}>
                  <Paper elevation={0} sx={{borderRadius: 0, borderTop: '1px solid #E1E6EC', bgcolor: '#F5F8FB', p: 0, display: 'grid', gap: 0}}>
                    {bu.sites.map((site) => {
                      const siteId = `${bu.id}-${site}`;
                      return (
                        <Box key={siteId} sx={{px: 1.3, py: 1, borderTop: '1px solid #E1E6EC', display: 'grid', gridTemplateColumns: '180px minmax(0,1fr)', gap: 1, alignItems: 'start'}}>
                          <Box sx={{pt: 1.8}}>
                            <Typography sx={{fontSize: 14, color: '#202124'}}>{site}</Typography>
                          </Box>
                          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(12, minmax(68px, 1fr))', gap: 0.7, position: 'relative'}}>
                            <Box sx={{gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 0.8, mb: 0.2}}>
                              <Switch
                                checked={Boolean(allowPastMonths[siteId])}
                                onChange={(event) => setAllowPastMonths((prev) => ({...prev, [siteId]: event.target.checked}))}
                                size="small"
                              />
                              <Typography sx={{fontSize: 11.5, color: '#3C3F44'}}>Allow Past Months Editing</Typography>
                            </Box>
                            {fiscalMonths.map((month, index) => (
                              <Box key={`${siteId}-${month}`}>
                                <Typography sx={{fontSize: 10, color: '#7C8593', textTransform: 'uppercase', mb: 0.35, textAlign: 'center', letterSpacing: '0.05em'}}>{month}</Typography>
                                <TextField
                                  value={index >= 7 ? siteMonthValues[index] : (index === 0 ? (siteRates[siteId] ?? siteMonthValues[index]) : siteMonthValues[index])}
                                  onChange={(event) => {
                                    if (index === 0) {
                                      setSiteRates((prev) => ({...prev, [siteId]: event.target.value}));
                                    }
                                  }}
                                  sx={{'& .MuiOutlinedInput-root': {height: 34, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiOutlinedInput-input': {fontSize: 12, color: '#202124', py: 0.75}}}
                                />
                              </Box>
                            ))}
                          </Box>
                        </Box>
                      );
                    })}
                  </Paper>
                </Box>
              ) : null}
            </Paper>
          );
        })}
      </Box>

    </Box>
  );
}

function EsoTargetsConfigurationPage({onBack, siteLabel, embedded = false}: {onBack: () => void; siteLabel: string; embedded?: boolean}) {
  const [closureRate] = useState('90');
  const [annualTarget] = useState('1690');
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const monthYears = months.map((_, index) => (index < 3 ? '2025' : '2026'));
  const monthLabels = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'];
  const contactRateByMonth = ['1.2', '1.2', '1.2', '1.2', '1.2', '1.2', '1.3', '1.4', '1.5', '1.8', '2', '2'];
  const [monthlyTargets, setMonthlyTargets] = useState([150, 85, 200, 120, 140, 160, 130, 145, 170, 155, 125, 110]);
  const editableFromIndex = 0;
  const rows = [
    {area: 'Production Line A', hc: 45, owner: 'John Smith', values: [16, 9, 21, 12, 15, 17, 14, 15, 18, 16, 13, 11]},
    {area: 'Production Line B', hc: 120, owner: 'Olivia Martin', values: [16, 9, 21, 12, 15, 17, 14, 15, 18, 16, 13, 11]},
  ];
  const distributed = monthlyTargets.reduce((sum, value) => sum + value, 0);

  return (
    <Box sx={{flexGrow: 1, overflowY: 'auto', bgcolor: embedded ? 'transparent' : '#F1F3F6', minHeight: embedded ? 'auto' : 'calc(100vh - 112px)', zoom: 0.92}}>
      {!embedded ? (
      <Box sx={{px: {xs: 1.2, md: 2.4}, py: 1, borderBottom: '1px solid #D4DBE7', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <IconButton onClick={onBack} sx={{width: 30, height: 30, color: '#34557F'}}>
            <ArrowBackIcon sx={{fontSize: 20}} />
          </IconButton>
          <Box sx={{width: 28, height: 28, borderRadius: 1, bgcolor: '#EAF1FF', display: 'grid', placeItems: 'center'}}>
            <InsertDriveFileOutlinedIcon sx={{fontSize: 18, color: '#2569ED'}} />
          </Box>
          <Box>
            <Typography sx={{fontSize: 16, fontWeight: 900, color: '#001B49', textTransform: 'uppercase'}}>ESO Targets Configuration</Typography>
            <Typography sx={{fontSize: 11.5, color: '#4F6A90', fontWeight: 700, textTransform: 'uppercase'}}>{siteLabel} <Chip size="small" label={`TOTAL HC: ${rows.reduce((sum, row) => sum + row.hc, 0)}`} sx={{ml: 0.8, height: 18, fontSize: 10, bgcolor: '#EAF1FF', color: '#2569ED', fontWeight: 800}} /></Typography>
          </Box>
        </Box>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
          <Button onClick={onBack} sx={{height: 34, px: 1.5, color: '#4C658B', fontWeight: 800, fontSize: 11.5}}>CANCEL</Button>
          <Button variant="contained" sx={{height: 34, px: 2, borderRadius: 1.2, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>SAVE ALL TARGETS</Button>
        </Box>
      </Box>
      ) : null}

      <Box sx={{maxWidth: embedded ? '100%' : 1260, width: '100%', mx: embedded ? 0 : 'auto', px: embedded ? 0 : {xs: 1.2, md: 2.3}, py: embedded ? 0 : {xs: 1.4, md: 2.2}, display: 'grid', gap: 1.6}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2}}>
          <Box>
            <Typography sx={{fontSize: 18, fontWeight: 700, color: '#202124', lineHeight: 1.1}}>ESO Site Targets</Typography>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.6, mt: 0.2}}>
              <Typography sx={{fontSize: 11.5, color: '#6B7280'}}>{siteLabel}</Typography>
              <Chip size="small" label="HC: 438" sx={{height: 18, fontSize: 10, bgcolor: '#F3F4F6', color: '#4B5563', fontWeight: 700}} />
            </Box>
          </Box>
          <Button variant="contained" sx={{height: 30, minWidth: 82, borderRadius: 1.1, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>
            SAVE
          </Button>
        </Box>

        <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', lg: '1fr 1fr'}, gap: 1.2}}>
          {[
            {title: 'ESO Closure Rate (%)', value: `${closureRate}%`, helper: 'Minimum percentage of reports to be closed annually.'},
            {title: 'Annual Submission Target', value: annualTarget, helper: 'Total observations required for the current fiscal year.'},
          ].map((card) => (
            <Paper key={card.title} elevation={0} sx={{border: '1px solid #D8E0EA', borderRadius: 1.2, p: 1.2}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 1}}>
                <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>{card.title}</Typography>
                <InfoOutlinedIcon sx={{fontSize: 14, color: '#9CA3AF'}} />
              </Box>
              <TextField
                fullWidth
                value={card.value}
                sx={{'& .MuiOutlinedInput-root': {height: 36, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiOutlinedInput-input': {fontSize: 14, color: '#202124', py: 0.8}}}
              />
              <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.8}}>{card.helper}</Typography>
            </Paper>
          ))}
        </Box>

        <Paper elevation={0} sx={{border: '1px solid #D8E0EA', borderRadius: 1.2, overflow: 'hidden'}}>
          <Box sx={{px: 1.2, py: 1}}>
            <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5, mb: 1}}>
              <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>ESO Contact Rate (Ratio)</Typography>
              <InfoOutlinedIcon sx={{fontSize: 14, color: '#9CA3AF'}} />
            </Box>
            <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(12, minmax(68px, 1fr))', gap: 0.7}}>
              {monthLabels.map((month, index) => (
                <Box key={month}>
                  <Typography sx={{fontSize: 10, color: '#7C8593', textTransform: 'uppercase', mb: 0.35, textAlign: 'center', letterSpacing: '0.05em'}}>{month}</Typography>
                  <TextField
                    value={contactRateByMonth[index]}
                    sx={{'& .MuiOutlinedInput-root': {height: 34, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiOutlinedInput-input': {fontSize: 12, color: '#202124', py: 0.75}}}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={{border: '1px solid #D1D9E6', borderRadius: 1.8, overflow: 'hidden'}}>
          <Box sx={{px: 1.2, py: 1, borderBottom: '1px solid #E0E6F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
                <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>Monthly Site Submission Targets</Typography>
                <InfoOutlinedIcon sx={{fontSize: 14, color: '#9CA3AF'}} />
              </Box>
            </Box>
            <Chip label={`${distributed} / ${annualTarget}`} sx={{height: 28, bgcolor: '#67C26F', color: '#111827', fontWeight: 700}} />
          </Box>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(12, minmax(72px, 1fr))', gap: 0.8, px: 1.2, py: 1.2}}>
            {months.map((month, index) => {
              const editable = index >= editableFromIndex;
              return (
                <Box key={month}>
                  <Typography sx={{fontSize: 10, color: '#7C8593', textTransform: 'uppercase', mb: 0.35, textAlign: 'center', letterSpacing: '0.05em'}}>{`${month} ${monthYears[index]}`}</Typography>
                  <TextField
                    size="small"
                    type="number"
                    value={monthlyTargets[index]}
                    disabled={!editable}
                    onChange={(event) => {
                      const next = [...monthlyTargets];
                      next[index] = Number(event.target.value) || 0;
                      setMonthlyTargets(next);
                    }}
                    sx={{'& .MuiOutlinedInput-root': {height: 34, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiOutlinedInput-input': {fontSize: 12, color: '#202124', textAlign: 'left', p: 0.8}, '& .Mui-disabled': {WebkitTextFillColor: '#202124'}}}
                  />
                </Box>
              );
            })}
          </Box>
        </Paper>

        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
          <Box sx={{display: 'flex', alignItems: 'center', gap: 0.5}}>
            <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>Area Target Distribution</Typography>
            <InfoOutlinedIcon sx={{fontSize: 14, color: '#9CA3AF'}} />
          </Box>
          <Button variant="outlined" sx={{height: 32, borderRadius: 1.1, borderColor: '#9DB7FF', color: '#2569ED', fontSize: 11.5, fontWeight: 700}}>
            AUTO-DISTRIBUTION
          </Button>
        </Box>

        <Box sx={{display: 'grid', gap: 1}}>
          {rows.map((row) => (
            <Paper key={row.area} elevation={0} sx={{border: '1px solid #D8E0EA', borderRadius: 1.2, p: 1.2}}>
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
                <Box>
                  <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>{row.area}</Typography>
                  <Chip
                    avatar={<Avatar sx={{width: 18, height: 18, fontSize: 10}}>{row.owner.charAt(0)}</Avatar>}
                    label={row.owner}
                    sx={{mt: 0.5, height: 22, bgcolor: '#FFFFFF', border: '1px solid #D8E0EA', color: '#3F3F46', fontSize: 11.5}}
                  />
                </Box>
                <Chip label={`Headcount: ${row.hc}`} sx={{height: 24, bgcolor: '#FFFFFF', border: '1px solid #D8E0EA', color: '#3F3F46', fontSize: 11.5}} />
              </Box>
              <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(12, minmax(68px, 1fr))', gap: 0.7}}>
                {row.values.map((value, index) => (
                  <Box key={`${row.area}-${index}`}>
                    <Typography sx={{fontSize: 10, color: '#7C8593', textTransform: 'uppercase', mb: 0.35, textAlign: 'center', letterSpacing: '0.05em'}}>{monthLabels[index]}</Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={value}
                      sx={{'& .MuiOutlinedInput-root': {height: 34, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiOutlinedInput-input': {fontSize: 12, color: '#202124', p: 0.8}}}
                    />
                  </Box>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function EsoTerminologyConfigurationPage({ embedded = false }: { embedded?: boolean }) {
  const [rows, setRows] = useState([
    {
      id: 'area-owner',
      defaultTerm: 'Area Owner',
      customTerm: 'Leader',
      suggestions: ['Supervisor', 'Leader', 'Team Leader', 'Shift Coordinator', 'Line Captain', 'Area Owner'],
    },
    {
      id: 'area',
      defaultTerm: 'Area',
      customTerm: 'Cell',
      suggestions: ['Area', 'Cell', 'Work Cell', 'Production Cell', 'Module', 'Department Area', 'Sector'],
    },
    {
      id: 'line',
      defaultTerm: 'Line',
      customTerm: 'Station',
      suggestions: ['Line', 'Station', 'Work Unit', 'Bay', 'Assembly Line', 'Track', 'Equipment System'],
    },
    {
      id: 'shift',
      defaultTerm: 'Shift',
      customTerm: 'Shift',
      suggestions: ['Shift', 'Team', 'Rotation', 'Crew', 'Cohort', 'Shift turn', 'Schedule Group'],
    },
  ]);

  const updateRow = (id: string, value: string) => {
    setRows((prev) => prev.map((row) => row.id === id ? { ...row, customTerm: value } : row));
  };

  return (
    <Box sx={{flexGrow: 1, overflowY: 'auto', bgcolor: embedded ? 'transparent' : '#F1F3F6', minHeight: embedded ? 'auto' : 'calc(100vh - 112px)', zoom: 0.92}}>
      <Box sx={{maxWidth: embedded ? '100%' : 1260, width: '100%', mx: embedded ? 0 : 'auto', px: embedded ? 0 : {xs: 1.2, md: 2.3}, py: embedded ? 0 : {xs: 1.4, md: 2.2}}}>
        <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2, mb: 1.2}}>
          <Box>
            <Typography sx={{fontSize: 18, fontWeight: 700, color: '#202124', lineHeight: 1.1}}>Terminology</Typography>
            <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.25}}>Sandy</Typography>
          </Box>
          <Button variant="contained" sx={{height: 30, minWidth: 82, borderRadius: 1.1, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>
            SAVE
          </Button>
        </Box>

        <Box sx={{display: 'grid', gap: 1.1}}>
          {rows.map((row) => (
            <Paper key={row.id} elevation={0} sx={{border: '1px solid #D8E0EA', borderRadius: 1.2, px: 1.1, py: 0.95, bgcolor: '#FFFFFF'}}>
              <Typography sx={{fontSize: 14, color: '#5B6470', fontWeight: 600, mb: 0.7}}>{`Default Term - ${row.defaultTerm}`}</Typography>
              <Box sx={{border: '1px solid #D0D7E2', borderRadius: 1, px: 0.8, py: 0.32, bgcolor: '#FFFFFF', mb: 1}}>
                <Typography sx={{fontSize: 14, color: '#98A1AE', mb: 0.15}}>Custom term</Typography>
                <TextField
                  variant="standard"
                  value={row.customTerm}
                  onChange={(event) => updateRow(row.id, event.target.value)}
                  fullWidth
                  InputProps={{ disableUnderline: true, sx: { fontSize: 14, color: '#202124' } }}
                />
              </Box>
              <Typography sx={{fontSize: 14, color: '#6B7280', mb: 0.45}}>Suggestion</Typography>
              <Box sx={{display: 'flex', flexWrap: 'wrap', gap: 0.55}}>
                {row.suggestions.map((suggestion) => (
                  <Button
                    key={`${row.id}-${suggestion}`}
                    onClick={() => updateRow(row.id, suggestion)}
                    sx={{
                      px: 1,
                      py: 0.45,
                      borderRadius: 999,
                      bgcolor: '#E9ECEF',
                      fontSize: 14,
                      color: '#40464F',
                      lineHeight: 1,
                      textTransform: 'none',
                      minWidth: 0,
                      '&:hover': {
                        bgcolor: '#DCE3EB',
                      },
                    }}
                  >
                    {suggestion}
                  </Button>
                ))}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function CreateFieldModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {label: string; required: boolean; siteEditable: boolean}) => void;
}) {
  const [fieldLabel, setFieldLabel] = useState('');
  const [placeholder, setPlaceholder] = useState('');
  const [fieldType, setFieldType] = useState<'FREE_TEXT' | 'DATE_PICKER' | 'DROPDOWN'>('FREE_TEXT');
  const [required, setRequired] = useState(false);
  const [siteEditable, setSiteEditable] = useState(true);
  const [dateComponentType, setDateComponentType] = useState('Date');
  const [pastDatesOnly, setPastDatesOnly] = useState(false);
  const [dataSource, setDataSource] = useState('Global Users Model');
  const [view, setView] = useState('Users');
  const [displayColumn, setDisplayColumn] = useState('Username');

  useEffect(() => {
    if (!open) return;
    setFieldLabel('');
    setPlaceholder('');
    setFieldType('FREE_TEXT');
    setRequired(false);
    setSiteEditable(true);
    setDateComponentType('Date');
    setPastDatesOnly(false);
    setDataSource('Global Users Model');
    setView('Users');
    setDisplayColumn('Username');
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box sx={{display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', maxHeight: '88vh', bgcolor: '#F8FAFD', zoom: 1}}>
        <Box sx={{px: 1.6, py: 1.1, borderBottom: '1px solid #E0E6F0', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Typography sx={{fontSize: 18, fontWeight: 900, color: '#001B49', textTransform: 'uppercase'}}>Create New Field</Typography>
          <IconButton onClick={onClose} sx={{color: '#8AA0BF'}}><CloseIcon /></IconButton>
        </Box>

        <Box sx={{px: 1.6, py: 1.2, pb: 2.2, overflowY: 'auto'}}>
          <Typography sx={{fontSize: 11.5, color: '#6E86A9', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Field Label</Typography>
          <TextField
            fullWidth
            value={fieldLabel}
            onChange={(event) => setFieldLabel(event.target.value)}
            placeholder="e.g. Department, Shift Supervisor..."
            sx={{mt: 0.45, '& .MuiOutlinedInput-root': {height: 36, borderRadius: 1.1}, '& .MuiOutlinedInput-input': {fontWeight: 700, fontSize: 13}}}
          />

          <Typography sx={{fontSize: 11.5, color: '#6E86A9', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', mt: 1.1}}>Placeholder (Optional)</Typography>
          <TextField
            fullWidth
            value={placeholder}
            onChange={(event) => setPlaceholder(event.target.value)}
            placeholder="e.g. Enter shift supervisor details..."
            sx={{mt: 0.45, '& .MuiOutlinedInput-root': {height: 36, borderRadius: 1.1}, '& .MuiOutlinedInput-input': {fontWeight: 700, fontSize: 13}}}
          />

          <Typography sx={{fontSize: 11.5, color: '#6E86A9', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', mt: 1.1}}>Field Type</Typography>
          <Box sx={{display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.7, mt: 0.45}}>
            {[
              {id: 'FREE_TEXT', label: 'FREE TEXT'},
              {id: 'DATE_PICKER', label: 'DATE PICKER'},
              {id: 'DROPDOWN', label: 'DROPDOWN'},
            ].map((opt) => {
              const active = fieldType === opt.id;
              return (
                <Button
                  key={opt.id}
                  onClick={() => setFieldType(opt.id as typeof fieldType)}
                  sx={{
                    height: 36,
                    borderRadius: 1.1,
                    border: '1px solid',
                    borderColor: active ? '#2569ED' : '#D8E0EA',
                    bgcolor: active ? '#EEF4FF' : '#FFFFFF',
                    color: active ? '#2569ED' : '#4C5E7A',
                    fontWeight: 900,
                    fontSize: 11.5,
                  }}
                >
                  {opt.label}
                </Button>
              );
            })}
          </Box>

          <Paper elevation={0} sx={{mt: 1, border: '1px solid #E0E6F0', borderRadius: 1.2, bgcolor: '#F4F7FB', px: 1, py: 0.7}}>
            <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', alignItems: 'center', gap: 1}}>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
                <Checkbox checked={required} onChange={(event) => setRequired(event.target.checked)} sx={{p: 0.35}} />
                <Typography sx={{fontSize: 11, fontWeight: 800, color: '#4C658B', letterSpacing: '0.08em', textTransform: 'uppercase'}}>Required Field</Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 0.45}}>
                <Checkbox checked={siteEditable} onChange={(event) => setSiteEditable(event.target.checked)} sx={{p: 0.35}} />
                <Typography sx={{fontSize: 11, fontWeight: 800, color: '#4C658B', letterSpacing: '0.08em', textTransform: 'uppercase'}}>Site Editable</Typography>
              </Box>
            </Box>
          </Paper>

          {fieldType !== 'FREE_TEXT' ? (
            <>
              <Typography sx={{fontSize: 12, color: '#001B49', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', mt: 1.2, pb: 0.5, borderBottom: '1px solid #E0E6F0'}}>Rule</Typography>
              <Paper elevation={0} sx={{mt: 0.8, border: '1px solid #D8E0EA', borderRadius: 1.2, bgcolor: '#F4F7FB', px: 1.1, py: 1.2}}>
                {fieldType === 'DATE_PICKER' ? (
                  <>
                    <Typography sx={{fontSize: 11, lineHeight: 1.3, color: '#2569ED', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Component Type</Typography>
                    <Typography sx={{fontSize: 10.5, lineHeight: 1.35, color: '#6C86AC', mt: 0.25, mb: 0.55, textTransform: 'uppercase'}}>Define the specific component presentation mode or range.</Typography>
                    <TextField
                      select
                      fullWidth
                      value={dateComponentType}
                      onChange={(event) => setDateComponentType(event.target.value)}
                      sx={{
                        mt: 0.6,
                        '& .MuiOutlinedInput-root': {
                          height: 38,
                          borderRadius: 1.1,
                          bgcolor: '#FFFFFF',
                          alignItems: 'center',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {borderColor: '#CBD6E6'},
                        '& .MuiSelect-select': {
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: '#223C62',
                          lineHeight: 1.2,
                          minHeight: 'unset',
                          py: '9px',
                          display: 'flex',
                          alignItems: 'center',
                        },
                      }}
                    >
                      {['Date', 'Date and Time', 'Time', 'Time Range', 'Date Range'].map((opt) => (
                        <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                      ))}
                    </TextField>
                    <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, pt: 0.95, borderTop: '1px solid #D8E0EA'}}>
                      <Box>
                        <Typography sx={{fontSize: 11, lineHeight: 1.3, color: '#2569ED', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Past Dates Only</Typography>
                        <Typography sx={{fontSize: 10.5, lineHeight: 1.35, color: '#6C86AC', mt: 0.25, textTransform: 'uppercase'}}>If enabled, users can only select historical/past dates</Typography>
                      </Box>
                      <Checkbox checked={pastDatesOnly} onChange={(event) => setPastDatesOnly(event.target.checked)} />
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography sx={{fontSize: 11, lineHeight: 1.3, color: '#2569ED', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Data Model View Source</Typography>
                    <Typography sx={{fontSize: 10.5, lineHeight: 1.35, color: '#6C86AC', mt: 0.25, mb: 0.55, textTransform: 'uppercase'}}>Define the system data model view to populate the select dropdown options.</Typography>
                    <TextField
                      select
                      fullWidth
                      value={dataSource}
                      onChange={(event) => setDataSource(event.target.value)}
                      sx={{
                        mt: 0.6,
                        '& .MuiOutlinedInput-root': {
                          height: 38,
                          borderRadius: 1.1,
                          bgcolor: '#FFFFFF',
                          alignItems: 'center',
                        },
                        '& .MuiOutlinedInput-notchedOutline': {borderColor: '#CBD6E6'},
                        '& .MuiSelect-select': {
                          fontSize: 12.5,
                          fontWeight: 800,
                          color: '#223C62',
                          lineHeight: 1.2,
                          minHeight: 'unset',
                          py: '9px',
                          display: 'flex',
                          alignItems: 'center',
                        },
                      }}
                    >
                      {['Global Users Model', 'Workstation Model', 'Assets Model'].map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                    </TextField>
                    <Box sx={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.8, mt: 1.05}}>
                      <Box>
                        <Typography sx={{fontSize: 11, lineHeight: 1.3, color: '#4C658B', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>View</Typography>
                        <TextField
                          select
                          fullWidth
                          value={view}
                          onChange={(event) => setView(event.target.value)}
                          sx={{
                            mt: 0.45,
                            '& .MuiOutlinedInput-root': {
                              height: 38,
                              borderRadius: 1.1,
                              bgcolor: '#FFFFFF',
                              alignItems: 'center',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {borderColor: '#CBD6E6'},
                            '& .MuiSelect-select': {
                              fontSize: 12.5,
                              fontWeight: 800,
                              color: '#223C62',
                              lineHeight: 1.2,
                              minHeight: 'unset',
                              py: '9px',
                              display: 'flex',
                              alignItems: 'center',
                            },
                          }}
                        >
                          {['Users', 'Supervisors', 'Areas'].map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </TextField>
                      </Box>
                      <Box>
                        <Typography sx={{fontSize: 11, lineHeight: 1.3, color: '#4C658B', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Display Column</Typography>
                        <TextField
                          select
                          fullWidth
                          value={displayColumn}
                          onChange={(event) => setDisplayColumn(event.target.value)}
                          sx={{
                            mt: 0.45,
                            '& .MuiOutlinedInput-root': {
                              height: 38,
                              borderRadius: 1.1,
                              bgcolor: '#FFFFFF',
                              alignItems: 'center',
                            },
                            '& .MuiOutlinedInput-notchedOutline': {borderColor: '#CBD6E6'},
                            '& .MuiSelect-select': {
                              fontSize: 12.5,
                              fontWeight: 800,
                              color: '#223C62',
                              lineHeight: 1.2,
                              minHeight: 'unset',
                              py: '9px',
                              display: 'flex',
                              alignItems: 'center',
                            },
                          }}
                        >
                          {['Username', 'Full Name', 'Label'].map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                        </TextField>
                      </Box>
                    </Box>
                  </>
                )}
              </Paper>
            </>
          ) : null}
        </Box>

        <Box sx={{px: 1.6, py: 1, borderTop: '1px solid #E0E6F0', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'flex-end', gap: 0.8}}>
          <Button onClick={onClose} sx={{height: 32, px: 1.4, fontWeight: 800, fontSize: 11.5, color: '#4C658B'}}>CANCEL</Button>
          <Button
            variant="contained"
            onClick={() => onCreate({label: fieldLabel.trim(), required, siteEditable})}
            disabled={!fieldLabel.trim()}
            sx={{height: 32, px: 1.8, borderRadius: 1.1, bgcolor: '#001B49', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}
          >
            CREATE
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}

function EsoConditionNearMissSiteConfigurationPage({
  onCancel,
  onSave,
  embedded = false,
  mode = 'site',
  reportType,
  siteLabel,
}: {
  onCancel: () => void;
  onSave: () => void;
  embedded?: boolean;
  mode?: 'global' | 'site';
  reportType: 'Condition' | 'Near Miss';
  siteLabel: string;
}) {
  const isGlobalMode = mode === 'global';
  const tabs = isGlobalMode
    ? (['Initial Information', 'Categories', 'Resolution Status'] as const)
    : (['Initial Information', 'Resolution Status'] as const);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Initial Information');
  const [initialInfoRows, setInitialInfoRows] = useState([
    {id: 'observer-name', label: 'Observer Name', placeholder: '', status: 'Globally Managed', visible: true, required: true, siteEditable: false},
    {id: 'report-date', label: 'Report Date', placeholder: '', status: 'Globally Managed', visible: true, required: true, siteEditable: false},
    {id: 'contact', label: 'Contact', placeholder: '', status: 'Globally Managed', visible: true, required: true, siteEditable: false},
    {id: 'occurrence-date', label: 'Occurrence Date', placeholder: '', status: 'Globally Managed', visible: true, required: true, siteEditable: false},
    {id: 'area', label: 'Area', placeholder: 'Select an Area', status: 'Site Editable', visible: true, required: true, siteEditable: true},
    {id: 'line', label: 'Line', placeholder: 'Select a Line', status: 'Site Editable', visible: true, required: true, siteEditable: true},
    {id: 'unit', label: 'Unit', placeholder: 'Select an Unit', status: 'Site Editable', visible: true, required: true, siteEditable: true},
    {id: 'machine', label: 'Machine', placeholder: 'Select a Machine', status: 'Site Editable', visible: true, required: true, siteEditable: true},
    {id: 'observation-location', label: 'Observation Location', placeholder: 'Inform the observation location', status: 'Site Editable', visible: true, required: true, siteEditable: true},
    {id: 'description-of-observation', label: 'Description of Observation', placeholder: 'Enter a Description', status: 'Site Editable', visible: true, required: true, siteEditable: true},
  ]);
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const [resolutionFieldLabel, setResolutionFieldLabel] = useState('Recommended Actions');
  const [resolutionPlaceholder, setResolutionPlaceholder] = useState('Enter action');
  const [resolutionRequired, setResolutionRequired] = useState(true);
  const [unresolvedFieldLabel, setUnresolvedFieldLabel] = useState('Recommended Actions');
  const [unresolvedPlaceholder, setUnresolvedPlaceholder] = useState('Enter action');
  const [unresolvedRequired, setUnresolvedRequired] = useState(true);
  const [resolvedFieldLabel, setResolvedFieldLabel] = useState('Immediate Actions Taken');
  const [resolvedPlaceholder, setResolvedPlaceholder] = useState('Enter action');
  const [resolvedRequired, setResolvedRequired] = useState(true);
  const mediaEvidenceUnits = [
    {id: 'mds', name: 'MDS', sites: ['CANAAN', 'COLUMBUS WEST', 'FRAGA', 'JUIZ DE FORA', 'NAMC', 'NOGALES', 'SANDY', 'TIJUANA 1', 'TUAS']},
    {id: 'ps', name: 'PS', sites: ['PHOENIX', 'DALLAS']},
    {id: 'surgery', name: 'SURGERY', sites: ['WARSAW', 'CORK']},
    {id: 'mms', name: 'MMS', sites: ['COVINGTON', 'WILSON']},
    {id: 'apm', name: 'APM', sites: ['TEMPE', 'SINGAPORE']},
    {id: 'pi', name: 'PI', sites: ['HEIDELBERG', 'SUZHOU']},
    {id: 'ucc', name: 'UCC', sites: ['DRAPER', 'BREA']},
    {id: 'sm', name: 'SM', sites: ['SAN DIEGO', 'GALWAY']},
    {id: 'gsc', name: 'GSC', sites: ['CAMPINAS', 'BOGOTA']},
  ] as const;
  const [expandedMediaUnitId, setExpandedMediaUnitId] = useState<string | null>(null);
  const [siteMediaVisibility, setSiteMediaVisibility] = useState<Record<string, boolean>>(() => {
    const entries: Array<[string, boolean]> = [];
    mediaEvidenceUnits.forEach((unit) => unit.sites.forEach((site) => entries.push([`${unit.id}-${site}`, true])));
    return Object.fromEntries(entries);
  });
  const [categories, setCategories] = useState([
    {id: 'cat-1', name: 'PPE', visible: true},
    {id: 'cat-2', name: 'Ergonomics', visible: true},
    {id: 'cat-3', name: 'Electrical Safety', visible: true},
    {id: 'cat-4', name: '5S / Housekeeping', visible: true},
    {id: 'cat-5', name: 'Facilities / Building', visible: true},
    {id: 'cat-6', name: 'Contractors / Visitors', visible: true},
    {id: 'cat-7', name: 'Bloodborne Pathogens', visible: true},
    {id: 'cat-8', name: 'Cranes / Lifts / Hoists', visible: true},
    {id: 'cat-9', name: 'Confined Spaces', visible: true},
    {id: 'cat-10', name: 'Walking / Slip, Trip, Fall', visible: true},
    {id: 'cat-11', name: 'Security', visible: true},
    {id: 'cat-12', name: 'Work Environment (Light, Noise, etc.)', visible: true},
    {id: 'cat-13', name: 'Line of Fire', visible: true},
    {id: 'cat-14', name: 'Struck By / Against', visible: true},
    {id: 'cat-15', name: 'Caught In / Between', visible: true},
    {id: 'cat-16', name: 'Equipment Failure', visible: true},
    {id: 'cat-17', name: 'Chemical Safety', visible: true},
    {id: 'cat-18', name: 'Machine Guarding', visible: true},
  ]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState({name: ''});

  const toggleRowVisibility = (rowId: string) => {
    setInitialInfoRows((prev) => prev.map((row) => {
      if (row.id !== rowId || (!isGlobalMode && row.status !== 'Site Editable')) return row;
      return {...row, visible: !row.visible};
    }));
  };
  const toggleRowRequired = (rowId: string) => {
    setInitialInfoRows((prev) => prev.map((row) => row.id === rowId ? {...row, required: !row.required} : row));
  };
  const toggleRowSiteEditable = (rowId: string) => {
    setInitialInfoRows((prev) => prev.map((row) => row.id === rowId ? {...row, siteEditable: !row.siteEditable, status: !row.siteEditable ? 'Site Editable' : 'Globally Managed'} : row));
  };
  const updateRowLabel = (rowId: string, label: string) => {
    setInitialInfoRows((prev) => prev.map((row) => row.id === rowId ? {...row, label} : row));
  };
  const updateRowPlaceholder = (rowId: string, placeholder: string) => {
    setInitialInfoRows((prev) => prev.map((row) => row.id === rowId ? {...row, placeholder} : row));
  };
  const addField = () => setFieldModalOpen(true);
  const createField = ({label, required, siteEditable}: {label: string; required: boolean; siteEditable: boolean}) => {
    if (!label) return;
    const id = `field-${Date.now()}`;
    setInitialInfoRows((prev) => [...prev, {id, label, placeholder: '', status: siteEditable ? 'Site Editable' : 'Globally Managed', visible: true, required, siteEditable}]);
    setFieldModalOpen(false);
  };
  const openAddCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryDraft({name: ''});
    setCategoryModalOpen(true);
  };
  const openEditCategoryModal = (id: string) => {
    const current = categories.find((item) => item.id === id);
    if (!current) return;
    setEditingCategoryId(id);
    setCategoryDraft({name: current.name});
    setCategoryModalOpen(true);
  };
  const saveCategory = () => {
    const name = categoryDraft.name.trim();
    if (!name) return;
    if (editingCategoryId) {
      setCategories((prev) => prev.map((item) => item.id === editingCategoryId ? {...item, name} : item));
    } else {
      setCategories((prev) => [...prev, {id: `cat-${Date.now()}`, name, visible: true}]);
    }
    setCategoryModalOpen(false);
  };
  const toggleCategoryVisibility = (id: string) => {
    setCategories((prev) => prev.map((item) => item.id === id ? {...item, visible: !item.visible} : item));
  };

  const moveRow = (fromId: string, toId: string) => {
    setInitialInfoRows((prev) => {
      const fromIndex = prev.findIndex((row) => row.id === fromId);
      const toIndex = prev.findIndex((row) => row.id === toId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  return (
    <Box sx={{flexGrow: 1, overflowY: 'auto', bgcolor: embedded ? 'transparent' : '#F1F3F6', minHeight: embedded ? 'auto' : 'calc(100vh - 112px)', display: 'grid', gridTemplateRows: embedded ? 'auto 1fr auto' : 'auto auto 1fr auto', zoom: 0.92}}>
      {!embedded ? (
      <Box sx={{px: {xs: 1.2, md: 2.4}, py: 1, borderBottom: '1px solid #D4DBE7', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1}}>
        <IconButton onClick={onCancel} sx={{width: 30, height: 30, color: '#34557F'}}>
          <ArrowBackIcon sx={{fontSize: 20}} />
        </IconButton>
        <Typography sx={{fontSize: 16, fontWeight: 900, color: '#001B49', letterSpacing: '0.03em', textTransform: 'uppercase'}}>
          {reportType} SETTINGS - {siteLabel}
        </Typography>
      </Box>
      ) : null}

      <Box sx={{px: embedded ? 0 : {xs: 1.2, md: 2.4}, bgcolor: '#FFFFFF'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, overflowX: 'auto', py: 0.2}}>
          {tabs.map((tab) => {
            const active = tab === activeTab;
            return (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                sx={{
                  minWidth: 0,
                  px: 1.05,
                  py: 0.45,
                  borderRadius: 999,
                  bgcolor: active ? '#2569ED' : '#ECECEC',
                  color: active ? '#FFFFFF' : '#4C4C4C',
                  fontSize: 11.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab}
              </Button>
            );
          })}
        </Box>
      </Box>

      <Box sx={{maxWidth: embedded ? '100%' : 1260, width: '100%', mx: embedded ? 0 : 'auto', px: embedded ? 0 : {xs: 1.2, md: 2.3}, py: embedded ? 1.2 : {xs: 1.4, md: 2.2}}}>
        {activeTab === 'Initial Information' ? (
          <>
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2}}>
              <Box>
                <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>Initial Information</Typography>
                <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.25}}>Report specific behavior and validation</Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                {isGlobalMode ? (
                  <Button variant="outlined" onClick={addField} sx={{height: 30, minWidth: 94, borderRadius: 1.1, borderColor: '#8BB0FF', color: '#246BFE', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>+ ADD FIELD</Button>
                ) : null}
                <Button variant="contained" onClick={onSave} sx={{height: 30, minWidth: 82, borderRadius: 1.1, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>SAVE</Button>
              </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{mt: 1.4, borderRadius: 1, border: '1px solid #D1D9E6', overflow: 'hidden'}}>
              <Table>
                <TableHead>
                  <TableRow sx={{bgcolor: '#FFFFFF'}}>
                    <TableCell sx={{width: 60}} />
                    <TableCell sx={{fontSize: 11.5, color: '#6B7280', fontWeight: 700}}>FIELD LABEL</TableCell>
                    <TableCell sx={{fontSize: 11.5, color: '#6B7280', fontWeight: 700}}>PLACEHOLDER</TableCell>
                    <TableCell align="center" sx={{fontSize: 11.5, color: '#6B7280', fontWeight: 700}}>REQUIRED</TableCell>
                    <TableCell align="center" sx={{fontSize: 11.5, color: '#6B7280', fontWeight: 700}}>EDITABLE BY SITE</TableCell>
                    <TableCell align="center" sx={{fontSize: 11.5, color: '#6B7280', fontWeight: 700}}>VISIBLE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {initialInfoRows.map((row) => (
                    <TableRow
                      key={row.id}
                      draggable={isGlobalMode}
                      onDragStart={() => isGlobalMode && setDraggingRowId(row.id)}
                      onDragOver={(event) => isGlobalMode && event.preventDefault()}
                      onDrop={() => {
                        if (!isGlobalMode || !draggingRowId) return;
                        moveRow(draggingRowId, row.id);
                        setDraggingRowId(null);
                      }}
                      onDragEnd={() => isGlobalMode && setDraggingRowId(null)}
                      sx={{'& td': {borderColor: '#E0E6F0'}, opacity: draggingRowId === row.id ? 0.55 : 1}}
                    >
                      <TableCell>
                        <DragIndicatorIcon sx={{color: '#9AAAC2', cursor: isGlobalMode ? 'grab' : 'default'}} />
                      </TableCell>
                      <TableCell sx={{width: '34%'}}>
                        <TextField
                          fullWidth
                          value={row.label}
                          onChange={(event) => updateRowLabel(row.id, event.target.value)}
                          variant="outlined"
                          InputLabelProps={{shrink: true}}
                          label="Field Name"
                          sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                        />
                      </TableCell>
                      <TableCell sx={{width: '34%'}}>
                        {row.placeholder ? (
                          <TextField
                            fullWidth
                            value={row.placeholder}
                            onChange={(event) => updateRowPlaceholder(row.id, event.target.value)}
                            variant="outlined"
                            InputLabelProps={{shrink: true}}
                            label="Placeholder Name"
                            disabled={!isGlobalMode && !row.siteEditable}
                            sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={Boolean(row.required)}
                          disabled={!isGlobalMode}
                          onChange={() => isGlobalMode && toggleRowRequired(row.id)}
                          sx={{color: '#D4DBE8', '&.Mui-checked': {color: '#2569ED'}, '&.Mui-disabled': {color: '#D4DBE8'}, '&.Mui-checked.Mui-disabled': {color: '#B8C2CF'}}}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7}}>
                          {!row.siteEditable && !isGlobalMode ? (
                            <Chip
                              label="Globally Managed"
                              size="small"
                              sx={{
                                height: 21,
                                borderRadius: 999,
                                bgcolor: '#FFFFFF',
                                color: '#FF5A36',
                                border: '1px solid #FF8B72',
                                fontSize: 10.2,
                                fontWeight: 700,
                              }}
                            />
                          ) : (
                            <Checkbox
                              checked={Boolean(row.siteEditable)}
                              disabled={!isGlobalMode}
                              onChange={() => isGlobalMode && toggleRowSiteEditable(row.id)}
                              sx={{color: '#D4DBE8', '&.Mui-checked': {color: '#2569ED'}, '&.Mui-disabled': {color: '#D4DBE8'}, '&.Mui-checked.Mui-disabled': {color: '#B8C2CF'}}}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => isGlobalMode && toggleRowVisibility(row.id)}
                          disabled={!isGlobalMode}
                          sx={{p: 0.3}}
                        >
                          {row.visible ? (
                            <VisibilityOutlinedIcon sx={{fontSize: 20, color: isGlobalMode ? '#2569ED' : '#B8C5D8'}} />
                          ) : (
                            <VisibilityOffOutlinedIcon sx={{fontSize: 20, color: '#95A7C3'}} />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : activeTab === 'Categories' ? (
          <>
            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>Categories</Typography>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                <Button variant="outlined" onClick={openAddCategoryModal} sx={{height: 30, minWidth: 124, borderRadius: 1.1, borderColor: '#8BB0FF', color: '#246BFE', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>+ ADD CATEGORY</Button>
                <Button variant="contained" onClick={onSave} sx={{height: 30, minWidth: 82, borderRadius: 1.1, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>SAVE</Button>
              </Box>
            </Box>
            <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.25}}>Report specific behavior and validation</Typography>
            <TableContainer component={Paper} elevation={0} sx={{mt: 1.3, borderRadius: 1, border: '1px solid #D1D9E6', overflow: 'hidden'}}>
              <Table>
                <TableBody>
                  {categories.map((item) => (
                    <TableRow key={item.id} sx={{'& td': {borderColor: '#E0E6F0'}}}>
                      <TableCell sx={{fontSize: 13.5, fontWeight: 800, color: '#2A456D', textTransform: 'uppercase', py: 1.2}}>{item.name}</TableCell>
                      <TableCell align="right" sx={{width: 96}}>
                        <IconButton size="small" onClick={() => openEditCategoryModal(item.id)} sx={{mr: 0.3}}><EditOutlinedIcon sx={{fontSize: 18, color: '#8CA0BF'}} /></IconButton>
                        <IconButton size="small" onClick={() => toggleCategoryVisibility(item.id)}>
                          {item.visible ? <VisibilityOutlinedIcon sx={{fontSize: 18, color: '#2569ED'}} /> : <VisibilityOffOutlinedIcon sx={{fontSize: 18, color: '#95A7C3'}} />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <>
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2}}>
              <Box>
                <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>Resolution Status</Typography>
                <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.25}}>Report specific behavior and validation</Typography>
              </Box>
              <Button variant="contained" onClick={onSave} sx={{height: 30, minWidth: 82, borderRadius: 1.1, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>SAVE</Button>
            </Box>

            {isGlobalMode ? (
              <>
                <Box sx={{display: 'grid', gap: 1.35, mt: 1.3}}>
                  <Paper elevation={0} sx={{borderRadius: 1, border: '1px solid #D1D9E6', px: {xs: 1.2, md: 1.4}, py: {xs: 1.1, md: 1.2}}}>
                    <Chip label="Unresolved Issue" size="small" sx={{height: 22, bgcolor: '#F7F8FA', color: '#4C4C4C', fontWeight: 500, fontSize: 11.5, border: '1px solid #D9DEE7', borderRadius: '999px'}} />
                    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr auto'}, gap: 1.1, alignItems: 'center', mt: 0.85}}>
                      <TextField
                        fullWidth
                        value={unresolvedFieldLabel}
                        onChange={(event) => setUnresolvedFieldLabel(event.target.value)}
                        variant="outlined"
                        InputLabelProps={{shrink: true}}
                        label="Field Name"
                        sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                      />
                      <TextField
                        fullWidth
                        value={unresolvedPlaceholder}
                        onChange={(event) => setUnresolvedPlaceholder(event.target.value)}
                        variant="outlined"
                        InputLabelProps={{shrink: true}}
                        label="Placeholder Text"
                        sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                      />
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, justifySelf: 'end', pr: 0.4}}>
                        <Checkbox checked={unresolvedRequired} disabled={!isGlobalMode} onChange={(event) => isGlobalMode && setUnresolvedRequired(event.target.checked)} sx={{p: 0.35, color: '#D4DBE8', '&.Mui-checked': {color: '#1976D2'}, '&.Mui-disabled': {color: '#D4DBE8'}, '&.Mui-checked.Mui-disabled': {color: '#B8C2CF'}}} />
                        <Typography sx={{fontSize: 12.5, color: '#2E3742'}}>Required</Typography>
                      </Box>
                    </Box>
                  </Paper>

                  <Paper elevation={0} sx={{borderRadius: 1, border: '1px solid #D1D9E6', px: {xs: 1.2, md: 1.4}, py: {xs: 1.1, md: 1.2}}}>
                    <Chip label="Resolved Issue" size="small" sx={{height: 22, bgcolor: '#F7F8FA', color: '#4C4C4C', fontWeight: 500, fontSize: 11.5, border: '1px solid #D9DEE7', borderRadius: '999px'}} />
                    <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr auto'}, gap: 1.1, alignItems: 'center', mt: 0.85}}>
                      <TextField
                        fullWidth
                        value={resolvedFieldLabel}
                        onChange={(event) => setResolvedFieldLabel(event.target.value)}
                        variant="outlined"
                        InputLabelProps={{shrink: true}}
                        label="Field Name"
                        sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                      />
                      <TextField
                        fullWidth
                        value={resolvedPlaceholder}
                        onChange={(event) => setResolvedPlaceholder(event.target.value)}
                        variant="outlined"
                        InputLabelProps={{shrink: true}}
                        label="Placeholder Text"
                        sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                      />
                      <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, justifySelf: 'end', pr: 0.4}}>
                        <Checkbox checked={resolvedRequired} disabled={!isGlobalMode} onChange={(event) => isGlobalMode && setResolvedRequired(event.target.checked)} sx={{p: 0.35, color: '#D4DBE8', '&.Mui-checked': {color: '#1976D2'}, '&.Mui-disabled': {color: '#D4DBE8'}, '&.Mui-checked.Mui-disabled': {color: '#B8C2CF'}}} />
                        <Typography sx={{fontSize: 12.5, color: '#2E3742'}}>Required</Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Box>

                <Box sx={{mt: 1.6}}>
                  <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>Media Captured Evidence</Typography>
                  <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.25}}>Configure photo or video requirements per site</Typography>
                </Box>
              </>
            ) : (
              <Box sx={{display: 'grid', gap: 1.35, mt: 1.3}}>
                <Paper elevation={0} sx={{borderRadius: 1, border: '1px solid #D1D9E6', px: {xs: 1.2, md: 1.4}, py: {xs: 1.1, md: 1.2}}}>
                  <Chip label="Unresolved Issue" size="small" sx={{height: 22, bgcolor: '#F7F8FA', color: '#4C4C4C', fontWeight: 500, fontSize: 11.5, border: '1px solid #D9DEE7', borderRadius: '999px'}} />
                  <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr auto'}, gap: 1.1, alignItems: 'center', mt: 0.85}}>
                    <TextField
                      fullWidth
                      value={unresolvedFieldLabel}
                      onChange={(event) => setUnresolvedFieldLabel(event.target.value)}
                      variant="outlined"
                      InputLabelProps={{shrink: true}}
                      label="Field Name"
                      sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                    />
                    <TextField
                      fullWidth
                      value={unresolvedPlaceholder}
                      onChange={(event) => setUnresolvedPlaceholder(event.target.value)}
                      variant="outlined"
                      InputLabelProps={{shrink: true}}
                      label="Placeholder Text"
                      sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                    />
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, justifySelf: 'end', pr: 0.4}}>
                      <Checkbox checked={unresolvedRequired} disabled={!isGlobalMode} onChange={(event) => isGlobalMode && setUnresolvedRequired(event.target.checked)} sx={{p: 0.35, color: '#D4DBE8', '&.Mui-checked': {color: '#1976D2'}, '&.Mui-disabled': {color: '#D4DBE8'}, '&.Mui-checked.Mui-disabled': {color: '#B8C2CF'}}} />
                      <Typography sx={{fontSize: 12.5, color: '#2E3742'}}>Required</Typography>
                    </Box>
                  </Box>
                </Paper>

                <Paper elevation={0} sx={{borderRadius: 1, border: '1px solid #D1D9E6', px: {xs: 1.2, md: 1.4}, py: {xs: 1.1, md: 1.2}}}>
                  <Chip label="Resolved Issue" size="small" sx={{height: 22, bgcolor: '#F7F8FA', color: '#4C4C4C', fontWeight: 500, fontSize: 11.5, border: '1px solid #D9DEE7', borderRadius: '999px'}} />
                  <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr auto'}, gap: 1.1, alignItems: 'center', mt: 0.85}}>
                    <TextField
                      fullWidth
                      value={resolvedFieldLabel}
                      onChange={(event) => setResolvedFieldLabel(event.target.value)}
                      variant="outlined"
                      InputLabelProps={{shrink: true}}
                      label="Field Name"
                      sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                    />
                    <TextField
                      fullWidth
                      value={resolvedPlaceholder}
                      onChange={(event) => setResolvedPlaceholder(event.target.value)}
                      variant="outlined"
                      InputLabelProps={{shrink: true}}
                      label="Placeholder Text"
                      sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                    />
                    <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, justifySelf: 'end', pr: 0.4}}>
                      <Checkbox checked={resolvedRequired} disabled={!isGlobalMode} onChange={(event) => isGlobalMode && setResolvedRequired(event.target.checked)} sx={{p: 0.35, color: '#D4DBE8', '&.Mui-checked': {color: '#1976D2'}, '&.Mui-disabled': {color: '#D4DBE8'}, '&.Mui-checked.Mui-disabled': {color: '#B8C2CF'}}} />
                      <Typography sx={{fontSize: 12.5, color: '#2E3742'}}>Required</Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )}

            {isGlobalMode ? (
              <Paper elevation={0} sx={{mt: 1.2, borderRadius: 1, border: '1px solid #D1D9E6', overflow: 'hidden'}}>
                <Box sx={{display: 'grid', gap: 0}}>
                  {mediaEvidenceUnits.map((unit) => {
                    const expanded = expandedMediaUnitId === unit.id;
                    return (
                      <Box key={unit.id} sx={{borderTop: unit.id === mediaEvidenceUnits[0].id ? 'none' : '1px solid #E0E6F0'}}>
                        <Box sx={{px: 1, py: 0.8, display: 'grid', gridTemplateColumns: '26px 1fr auto', alignItems: 'center', bgcolor: '#FFFFFF'}}>
                          <IconButton size="small" onClick={() => setExpandedMediaUnitId((prev) => prev === unit.id ? null : unit.id)} sx={{color: '#8AA0BF', p: 0.2}}>
                            <ExpandMoreIcon sx={{fontSize: 18, transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform .2s ease'}} />
                          </IconButton>
                          <Box>
                            <Typography sx={{fontSize: 14, color: '#202124'}}>{unit.name}</Typography>
                            <Typography sx={{fontSize: 11, color: '#6B7280'}}>Business Unit</Typography>
                          </Box>
                          <Chip label={`${unit.sites.length} sites`} size="small" sx={{height: 22, bgcolor: '#F7F8FA', color: '#4C4C4C', fontWeight: 500, fontSize: 11}} />
                        </Box>

                        {expanded ? (
                          <Box sx={{display: 'grid', gap: 0, bgcolor: '#F8FBFF'}}>
                            {unit.sites.map((site) => {
                              const key = `${unit.id}-${site}`;
                              return (
                                <Box key={key} sx={{px: 2.7, py: 1, display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', borderTop: '1px solid #E8EEF6'}}>
                                  <Typography sx={{fontSize: 13, color: '#202124'}}>{site}</Typography>
                                  <IconButton size="small" onClick={() => setSiteMediaVisibility((prev) => ({...prev, [key]: !prev[key]}))} sx={{p: 0.2}}>
                                    {siteMediaVisibility[key] ? <VisibilityOutlinedIcon sx={{fontSize: 18, color: '#2569ED'}} /> : <VisibilityOffOutlinedIcon sx={{fontSize: 18, color: '#95A7C3'}} />}
                                  </IconButton>
                                </Box>
                              );
                            })}
                          </Box>
                        ) : null}
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            ) : null}
          </>
        )}
      </Box>

      <Dialog open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{display: 'grid', gridTemplateRows: 'auto 1fr auto', bgcolor: '#F8FAFD'}}>
          <Box sx={{px: 1.6, py: 1.1, borderBottom: '1px solid #E0E6F0', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography sx={{fontSize: 18, fontWeight: 900, color: '#001B49', textTransform: 'uppercase'}}>{editingCategoryId ? 'Edit Category' : 'Add Category'}</Typography>
            <IconButton onClick={() => setCategoryModalOpen(false)} sx={{color: '#8AA0BF'}}><CloseIcon /></IconButton>
          </Box>
          <Box sx={{px: 1.6, py: 1.2}}>
            <Typography sx={{fontSize: 11.5, color: '#6E86A9', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Category Name</Typography>
            <TextField fullWidth value={categoryDraft.name} onChange={(event) => setCategoryDraft((prev) => ({...prev, name: event.target.value}))} sx={{mt: 0.45, '& .MuiOutlinedInput-root': {height: 36, borderRadius: 1.1}, '& .MuiOutlinedInput-input': {fontWeight: 700, fontSize: 13}}} />
          </Box>
          <Box sx={{px: 1.6, py: 1, borderTop: '1px solid #E0E6F0', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'flex-end', gap: 0.8}}>
            <Button onClick={() => setCategoryModalOpen(false)} sx={{height: 32, px: 1.4, fontWeight: 800, fontSize: 11.5, color: '#4C658B'}}>CANCEL</Button>
            <Button variant="contained" onClick={saveCategory} sx={{height: 32, px: 1.8, borderRadius: 1.1, bgcolor: '#001B49', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>SAVE CHANGES</Button>
          </Box>
        </Box>
      </Dialog>
      <CreateFieldModal open={fieldModalOpen} onClose={() => setFieldModalOpen(false)} onCreate={createField} />
    </Box>
  );
}

function EsoBbsSiteConfigurationPage({
  embedded = false,
  mode = 'site',
  onCancel,
  onSave,
  siteLabel,
}: {
  embedded?: boolean;
  mode?: 'global' | 'site';
  onCancel: () => void;
  onSave: () => void;
  siteLabel: string;
}) {
  const isGlobalMode = mode === 'global';
  const tabs = ['Initial Information', 'Categories', 'BBS Barriers'] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Initial Information');
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>([]);
  const [descriptionFieldLabel, setDescriptionFieldLabel] = useState('Description');
  const [descriptionPlaceholder, setDescriptionPlaceholder] = useState('Describe what you observed or tap the mic to speak');
  const [descriptionRequired, setDescriptionRequired] = useState(true);
  const [bbsBarriersFieldLabel, setBbsBarriersFieldLabel] = useState('Observer Comments - Why / Barrier Clarification');
  const [bbsBarriersPlaceholder, setBbsBarriersPlaceholder] = useState('Explain selected barriers. What context is important?');
  const [bbsBarriersRequired, setBbsBarriersRequired] = useState(true);
  const [barriersList, setBarriersList] = useState([
    {id: 'lack-training', name: 'Lack of Training/Unfamiliar', visible: true},
    {id: 'insignificant', name: 'Insignificant/Indifferent', visible: true},
    {id: 'disagreement', name: 'Disagreement on Unsafe Practices', visible: true},
    {id: 'rushing', name: 'Rushing', visible: true},
    {id: 'fatigue', name: 'Fatigue', visible: true},
    {id: 'culture', name: 'Culture/Peer Pressure', visible: true},
    {id: 'management-pressure', name: 'Management Pressure/System', visible: true},
    {id: 'equipment-condition', name: 'Equipment/Facility Condition', visible: true},
    {id: 'personal-factors', name: 'Personal Factors', visible: true},
    {id: 'frustration', name: 'Frustration', visible: true},
    {id: 'complacency', name: 'Complacency', visible: true},
    {id: 'work-environment', name: 'Work Environment', visible: true},
  ]);
  const [editingBarrierId, setEditingBarrierId] = useState<string | null>(null);
  const [barrierModalOpen, setBarrierModalOpen] = useState(false);
  const [barrierDraftName, setBarrierDraftName] = useState('');
  const [globalCategoriesList, setGlobalCategoriesList] = useState([
    {id: 'ppe', name: 'PPE (Personal Protective Equipment)', description: '', visible: true, subCategories: [{id: 'ppe-sub-1', name: 'Face and Eyes protection', description: '', visible: true}]},
    {id: 'body-position', name: 'Body Position (Line of Fire)', description: '', visible: true, subCategories: []},
    {id: 'body-use', name: 'Body Use (Ergonomics)', description: '', visible: true, subCategories: []},
    {id: 'safe-walking', name: 'Safe Walking', description: '', visible: true, subCategories: []},
    {id: 'tools-equipment', name: 'Tools & Equipment', description: '', visible: true, subCategories: []},
    {id: 'fall-protection', name: 'Fall Protection', description: '', visible: true, subCategories: []},
    {id: 'loto', name: 'Lockout Tagout (LOTO)', description: '', visible: true, subCategories: []},
    {id: 'machine-guarding', name: 'Machine Guarding', description: '', visible: true, subCategories: []},
    {id: 'procedures-standards', name: 'Procedures & Standards (WI, SOP, EHS)', description: '', visible: true, subCategories: []},
    {id: 'mobile-equipment', name: 'Mobile Equipment', description: '', visible: true, subCategories: []},
    {id: 'chemical-handling', name: 'Chemical Handling', description: '', visible: true, subCategories: []},
    {id: 'environmental-stewardship', name: 'Environmental Stewardship', description: '', visible: true, subCategories: []},
    {id: 'speak-up', name: 'Speak Up (Concern for Others)', description: '', visible: true, subCategories: []},
    {id: 'five-s', name: '5S (Housekeeping)', description: '', visible: true, subCategories: []},
  ]);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<{
    name: string;
    description: string;
    subCategories: Array<{id: string; name: string; description: string; visible: boolean}>;
  }>({name: '', description: '', subCategories: []});
  const [commitmentFieldLabel, setCommitmentFieldLabel] = useState('Commitment statement');
  const [commitmentPlaceholder, setCommitmentPlaceholder] = useState('e.g. Worker agreed to...');
  const [commitmentRequired, setCommitmentRequired] = useState(true);
  const [initialInfoRows, setInitialInfoRows] = useState([
    {id: 'observer-name', label: 'Observer Name', placeholder: '', visible: true, required: true, siteEditable: false},
    {id: 'report-date', label: 'Report Date', placeholder: '', visible: true, required: true, siteEditable: false},
    {id: 'occurrence-date', label: 'Occurrence Date', placeholder: '', visible: true, required: true, siteEditable: false},
    {id: 'shift', label: 'Shift', placeholder: 'Select the shift', visible: true, required: true, siteEditable: true},
    {id: 'area', label: 'Area', placeholder: 'Select an Area', visible: true, required: true, siteEditable: true},
    {id: 'line', label: 'Line', placeholder: 'Select a Line', visible: true, required: true, siteEditable: true},
    {id: 'unit', label: 'Unit', placeholder: 'Select a Unit', visible: true, required: true, siteEditable: true},
    {id: 'observed-behavior', label: 'Observed Behavior', placeholder: 'Enter with Description', visible: true, required: true, siteEditable: true},
    {id: 'commitment-statement', label: 'Commitment statement', placeholder: 'Commitment statement', visible: true, required: true, siteEditable: true},
  ]);
  const [draggingRowId, setDraggingRowId] = useState<string | null>(null);
  const [fieldModalOpen, setFieldModalOpen] = useState(false);
  const bbsCategories = [
    'PPE (Personal Protective Equipment)',
    'Body Position (Line of Fire)',
    'Body Use (Ergonomics)',
    'Safe Walking',
    'Tools & Equipment',
    'Fall Protection',
    'Lockout Tagout (LOTO)',
    'Machine Guarding',
    'Procedures & Standards',
    'Mobile Equipment (PIT)',
    'Chemical Handing',
    'Environmental Stewardship',
    'Speak Up (Concern for Others)',
    '5S (Housekeeping)',
  ];

  const toggleFocusArea = (category: string) => {
    setSelectedFocusAreas((prev) => {
      if (prev.includes(category)) {
        return prev.filter((item) => item !== category);
      }
      if (prev.length >= 5) return prev;
      return [...prev, category];
    });
  };
  const toggleRowVisibility = (rowId: string) => {
    setInitialInfoRows((prev) => prev.map((row) => {
      if (row.id !== rowId) return row;
      return {...row, visible: !row.visible};
    }));
  };
  const toggleRowRequired = (rowId: string) => {
    setInitialInfoRows((prev) => prev.map((row) => row.id === rowId ? {...row, required: !row.required} : row));
  };
  const toggleRowSiteEditable = (rowId: string) => {
    setInitialInfoRows((prev) => prev.map((row) => row.id === rowId ? {...row, siteEditable: !row.siteEditable} : row));
  };
  const updateRowLabel = (rowId: string, label: string) => {
    setInitialInfoRows((prev) => prev.map((row) => row.id === rowId ? {...row, label} : row));
  };
  const updateRowPlaceholder = (rowId: string, placeholder: string) => {
    setInitialInfoRows((prev) => prev.map((row) => row.id === rowId ? {...row, placeholder} : row));
  };
  const addField = () => setFieldModalOpen(true);
  const createField = ({label, required, siteEditable}: {label: string; required: boolean; siteEditable: boolean}) => {
    if (!label) return;
    const nextId = `custom-field-${Date.now()}`;
    setInitialInfoRows((prev) => [...prev, {id: nextId, label, placeholder: '', visible: true, required, siteEditable}]);
    setFieldModalOpen(false);
  };
  const addBarrier = () => {
    setEditingBarrierId(null);
    setBarrierDraftName('');
    setBarrierModalOpen(true);
  };
  const openEditBarrierModal = (id: string) => {
    const current = barriersList.find((item) => item.id === id);
    if (!current) return;
    setEditingBarrierId(id);
    setBarrierDraftName(current.name);
    setBarrierModalOpen(true);
  };
  const toggleBarrierVisibility = (id: string) => {
    setBarriersList((prev) => prev.map((item) => item.id === id ? {...item, visible: !item.visible} : item));
  };
  const saveBarrierDraft = () => {
    const trimmedName = barrierDraftName.trim();
    if (!trimmedName) return;
    if (editingBarrierId) {
      setBarriersList((prev) => prev.map((item) => item.id === editingBarrierId ? {...item, name: trimmedName} : item));
    } else {
      const id = `barrier-${Date.now()}`;
      setBarriersList((prev) => [...prev, {id, name: trimmedName, visible: true}]);
    }
    setBarrierModalOpen(false);
  };
  const addCategory = () => {
    setEditingCategoryId(null);
    setCategoryDraft({
      name: '',
      description: '',
      subCategories: [{id: `sub-${Date.now()}`, name: '', description: '', visible: true}],
    });
    setCategoryModalOpen(true);
  };
  const openEditCategoryModal = (id: string) => {
    const current = globalCategoriesList.find((item) => item.id === id);
    if (!current) return;
    setEditingCategoryId(id);
    setCategoryDraft({
      name: current.name,
      description: current.description ?? '',
      subCategories: (current.subCategories ?? []).map((sub) => ({...sub, visible: sub.visible ?? true})),
    });
    setCategoryModalOpen(true);
  };
  const toggleCategoryVisibility = (id: string) => {
    setGlobalCategoriesList((prev) => prev.map((item) => item.id === id ? {...item, visible: !item.visible} : item));
  };
  const addSubCategoryToDraft = () => {
    setCategoryDraft((prev) => ({
      ...prev,
      subCategories: [...prev.subCategories, {id: `sub-${Date.now()}-${prev.subCategories.length}`, name: '', description: '', visible: true}],
    }));
  };
  const updateSubCategoryDraft = (subId: string, field: 'name' | 'description', value: string) => {
    setCategoryDraft((prev) => ({
      ...prev,
      subCategories: prev.subCategories.map((sub) => sub.id === subId ? {...sub, [field]: value} : sub),
    }));
  };
  const saveCategoryDraft = () => {
    const trimmedName = categoryDraft.name.trim();
    if (!trimmedName) return;
    if (editingCategoryId) {
      setGlobalCategoriesList((prev) => prev.map((item) => item.id === editingCategoryId ? {
        ...item,
        name: trimmedName,
        description: categoryDraft.description,
        subCategories: categoryDraft.subCategories,
      } : item));
    } else {
      const newId = `category-${Date.now()}`;
      setGlobalCategoriesList((prev) => [...prev, {
        id: newId,
        name: trimmedName,
        description: categoryDraft.description,
        visible: true,
        subCategories: categoryDraft.subCategories,
      }]);
    }
    setCategoryModalOpen(false);
  };
  const toggleSubCategoryVisibility = (subId: string) => {
    setCategoryDraft((prev) => ({
      ...prev,
      subCategories: prev.subCategories.map((sub) => sub.id === subId ? {...sub, visible: !sub.visible} : sub),
    }));
  };

  const moveRow = (fromId: string, toId: string) => {
    setInitialInfoRows((prev) => {
      const fromIndex = prev.findIndex((row) => row.id === fromId);
      const toIndex = prev.findIndex((row) => row.id === toId);
      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  return (
    <Box sx={{flexGrow: 1, overflowY: 'auto', bgcolor: embedded ? 'transparent' : '#F1F3F6', minHeight: embedded ? 'auto' : 'calc(100vh - 112px)', display: 'grid', gridTemplateRows: embedded ? 'auto 1fr auto' : 'auto auto 1fr auto', zoom: 0.92}}>
      {!embedded ? (
      <Box sx={{px: {xs: 1.2, md: 2.4}, py: 1, borderBottom: '1px solid #D4DBE7', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1}}>
        <IconButton onClick={onCancel} sx={{width: 30, height: 30, color: '#34557F'}}>
          <ArrowBackIcon sx={{fontSize: 20}} />
        </IconButton>
        <Typography sx={{fontSize: 16, fontWeight: 900, color: '#001B49', letterSpacing: '0.03em', textTransform: 'uppercase'}}>
          BBS SETTINGS - {isGlobalMode ? 'GLOBAL' : siteLabel}
        </Typography>
      </Box>
      ) : null}
      <Box sx={{px: embedded ? 0 : {xs: 1.2, md: 2.4}, bgcolor: '#FFFFFF'}}>
        <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, overflowX: 'auto', py: 0.2}}>
          {tabs.map((tab) => {
            const active = tab === activeTab;
            return (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                sx={{
                  minWidth: 0,
                  px: 1.05,
                  py: 0.45,
                  borderRadius: 999,
                  bgcolor: active ? '#2569ED' : '#ECECEC',
                  color: active ? '#FFFFFF' : '#4C4C4C',
                  fontSize: 11.5,
                  fontWeight: 500,
                  textTransform: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab === 'Categories' && !isGlobalMode ? 'Top 5 Categories' : tab}
              </Button>
            );
          })}
        </Box>
      </Box>

      <Box sx={{maxWidth: embedded ? '100%' : 1260, width: '100%', mx: embedded ? 0 : 'auto', px: embedded ? 0 : {xs: 1.2, md: 2.3}, py: embedded ? 1.2 : {xs: 1.4, md: 2.2}}}>
        {activeTab === 'Initial Information' ? (
          <>
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2}}>
              <Box>
                <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>Initial Information</Typography>
                <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.25}}>Report specific behavior and validation</Typography>
              </Box>
              <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                {isGlobalMode ? (
                  <Button variant="outlined" onClick={addField} sx={{height: 30, minWidth: 94, borderRadius: 1.1, borderColor: '#8BB0FF', color: '#246BFE', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>+ ADD FIELD</Button>
                ) : null}
                <Button variant="contained" onClick={onSave} sx={{height: 30, minWidth: 82, borderRadius: 1.1, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>SAVE</Button>
              </Box>
            </Box>

            <TableContainer component={Paper} elevation={0} sx={{mt: 1.4, borderRadius: 1, border: '1px solid #D1D9E6', overflow: 'hidden'}}>
              <Table>
                <TableHead>
                  <TableRow sx={{bgcolor: '#FFFFFF'}}>
                    <TableCell sx={{width: 60}} />
                    <TableCell sx={{fontSize: 11.5, color: '#6B7280', fontWeight: 700}}>FIELD LABEL</TableCell>
                    <TableCell sx={{fontSize: 11.5, color: '#6B7280', fontWeight: 700}}>PLACEHOLDER</TableCell>
                    <TableCell align="center" sx={{fontSize: 11.5, color: '#6B7280', fontWeight: 700}}>REQUIRED</TableCell>
                    <TableCell align="center" sx={{fontSize: 11.5, color: '#6B7280', fontWeight: 700}}>EDITABLE BY SITE</TableCell>
                    <TableCell align="center" sx={{fontSize: 11.5, color: '#6B7280', fontWeight: 700}}>VISIBLE</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {initialInfoRows.map((row) => (
                    <TableRow
                      key={row.id}
                      draggable
                      onDragStart={() => setDraggingRowId(row.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => {
                        if (!draggingRowId) return;
                        moveRow(draggingRowId, row.id);
                        setDraggingRowId(null);
                      }}
                      onDragEnd={() => setDraggingRowId(null)}
                      sx={{'& td': {borderColor: '#E0E6F0'}, opacity: draggingRowId === row.id ? 0.55 : 1}}
                    >
                      <TableCell><DragIndicatorIcon sx={{color: '#9AAAC2', cursor: 'grab'}} /></TableCell>
                      <TableCell sx={{fontSize: 14, fontWeight: 700, color: '#001B49', width: '34%'}}>
                        <TextField
                          fullWidth
                          value={row.label}
                          onChange={(event) => updateRowLabel(row.id, event.target.value)}
                          variant="outlined"
                          InputLabelProps={{shrink: true}}
                          label="Field Name"
                          sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                        />
                      </TableCell>
                      <TableCell sx={{width: '34%'}}>
                        {row.placeholder ? (
                          <TextField
                            fullWidth
                            value={row.placeholder}
                            onChange={(event) => updateRowPlaceholder(row.id, event.target.value)}
                            variant="outlined"
                            InputLabelProps={{shrink: true}}
                            label="Placeholder Name"
                            sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                          />
                        ) : null}
                      </TableCell>
                      <TableCell align="center">
                        <Checkbox
                          checked={Boolean(row.required)}
                          disabled={!isGlobalMode}
                          onChange={() => isGlobalMode && toggleRowRequired(row.id)}
                          sx={{
                            color: '#D4DBE8',
                            '&.Mui-checked': {color: '#1976D2'},
                            '&.Mui-disabled': {color: '#D4DBE8'},
                            '&.Mui-checked.Mui-disabled': {color: '#B8C2CF'},
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.7}}>
                          {!row.siteEditable && !isGlobalMode ? (
                            <Chip
                              label="Globally Managed"
                              size="small"
                              sx={{
                                height: 21,
                                borderRadius: 999,
                                bgcolor: '#FFFFFF',
                                color: '#FF5A36',
                                border: '1px solid #FF8B72',
                                fontSize: 10.2,
                                fontWeight: 700,
                              }}
                            />
                          ) : (
                            <Checkbox
                              checked={Boolean(row.siteEditable)}
                              disabled={!isGlobalMode}
                              onChange={() => isGlobalMode && toggleRowSiteEditable(row.id)}
                              sx={{color: '#D4DBE8', '&.Mui-checked': {color: '#1976D2'}, '&.Mui-disabled': {color: '#D4DBE8'}, '&.Mui-checked.Mui-disabled': {color: '#B8C2CF'}}}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => isGlobalMode && toggleRowVisibility(row.id)}
                          disabled={!isGlobalMode}
                          sx={{p: 0.3}}
                        >
                          {row.visible ? (
                            <VisibilityOutlinedIcon sx={{fontSize: 20, color: isGlobalMode ? '#2569ED' : '#B8C5D8'}} />
                          ) : (
                            <VisibilityOffOutlinedIcon sx={{fontSize: 20, color: '#95A7C3'}} />
                          )}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : activeTab === 'Task Description' ? (
          <>
            <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>Task Description</Typography>
            <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.25}}>Report specific behavior and validation</Typography>

            <Paper elevation={0} sx={{mt: 1.3, borderRadius: 1, border: '1px solid #D1D9E6', px: {xs: 1.2, md: 1.6}, py: {xs: 1.2, md: 1.4}}}>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 260px'}, gap: 1.2, alignItems: 'start'}}>
                <Box>
                  <Typography sx={{fontSize: 12.5, color: '#7A92B6', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Field Label</Typography>
                  <TextField
                    fullWidth
                    value={descriptionFieldLabel}
                    onChange={(event) => setDescriptionFieldLabel(event.target.value)}
                    variant="standard"
                    InputProps={{disableUnderline: true}}
                    sx={{mt: 0.3, '& .MuiInputBase-input': {fontSize: 16, fontWeight: 900, color: '#001B49', lineHeight: 1.2, p: 0}}}
                  />
                </Box>
                <Box sx={{justifySelf: {xs: 'start', md: 'end'}, textAlign: {xs: 'left', md: 'right'}}}>
                  <Typography sx={{fontSize: 12.5, color: '#7A92B6', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Requirement</Typography>
                  <Box sx={{display: 'inline-flex', alignItems: 'center', gap: 0.8, mt: 0.55}}>
                    <Typography sx={{fontSize: 12.5, color: '#4D668B', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Required</Typography>
                    <Checkbox
                      checked={descriptionRequired}
                      disabled={!isGlobalMode}
                      onChange={(event) => isGlobalMode && setDescriptionRequired(event.target.checked)}
                      sx={{
                        p: 0,
                        color: '#D4DBE8',
                        '&.Mui-checked': {color: '#1976D2'},
                        '&.Mui-disabled': {color: '#D4DBE8'},
                        '&.Mui-checked.Mui-disabled': {color: '#B8C2CF'},
                      }}
                    />
                  </Box>
                  {!isGlobalMode ? (
                    <Box sx={{mt: 0.55}}>
                      <Chip label="GLOBALLY MANAGED" size="small" sx={{bgcolor: '#F2EDFF', color: '#8A2BE2', fontWeight: 800, fontSize: 11.5}} />
                    </Box>
                  ) : null}
                </Box>
              </Box>

              <Box sx={{mt: 2.1}}>
                <Typography sx={{fontSize: 12.5, color: '#7A92B6', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Placeholder Text</Typography>
                <TextField
                  fullWidth
                  value={descriptionPlaceholder}
                  onChange={(event) => setDescriptionPlaceholder(event.target.value)}
                  variant="outlined"
                  sx={{mt: 0.75, '& .MuiOutlinedInput-root': {height: 42, borderRadius: 1.2}, '& .MuiOutlinedInput-input': {fontSize: 15, color: '#34557F', py: 0.6}}}
                />
              </Box>
            </Paper>
          </>
        ) : activeTab === 'Categories' ? (
          <>
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2}}>
              <Box>
                <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>{isGlobalMode ? 'Categories' : 'Top 5 Categories'}</Typography>
                <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.25}}>
                  {isGlobalMode ? 'Report specific behavior and validation' : "Select up to 5 categories to prioritize for this site's observations."}
                </Typography>
              </Box>
              {isGlobalMode ? (
                <Box sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                  <Button variant="outlined" onClick={addCategory} sx={{height: 30, minWidth: 124, borderRadius: 1.1, borderColor: '#8BB0FF', color: '#246BFE', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>+ ADD CATEGORY</Button>
                  <Button variant="contained" onClick={onSave} sx={{height: 30, px: 1.6, borderRadius: 1.1, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>SAVE</Button>
                </Box>
              ) : (
                <Button variant="contained" onClick={onSave} sx={{height: 30, px: 1.6, borderRadius: 1.1, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>SAVE</Button>
              )}
            </Box>

            {isGlobalMode ? (
              <TableContainer component={Paper} elevation={0} sx={{mt: 1.5, borderRadius: 1, border: '1px solid #D1D9E6', overflow: 'hidden'}}>
                <Table>
                  <TableBody>
                    {globalCategoriesList.map((category) => (
                      <TableRow key={category.id} sx={{'& td': {borderColor: '#E0E6F0'}}}>
                        <TableCell sx={{fontSize: 12.5, fontWeight: 500, color: category.visible ? '#2E3742' : '#A1A1AA', py: 1.25}}>
                          {category.name}
                        </TableCell>
                        <TableCell align="right" sx={{width: 104}}>
                          <IconButton size="small" onClick={() => openEditCategoryModal(category.id)} sx={{mr: 0.5}}>
                            <EditOutlinedIcon sx={{fontSize: 18, color: '#2569ED'}} />
                          </IconButton>
                          <IconButton size="small" onClick={() => toggleCategoryVisibility(category.id)}>
                            {category.visible ? (
                              <VisibilityOutlinedIcon sx={{fontSize: 18, color: '#2569ED'}} />
                            ) : (
                              <VisibilityOffOutlinedIcon sx={{fontSize: 18, color: '#6B7280'}} />
                            )}
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{mt: 1.5, borderRadius: 1, border: '1px solid #D1D9E6', overflow: 'hidden'}}>
                <Table>
                  <TableBody>
                    {bbsCategories.map((name) => (
                      <TableRow key={name} sx={{'& td': {borderColor: '#E0E6F0'}}}>
                        <TableCell sx={{width: 44, py: 0.95, pl: 1.4}}>
                          <Checkbox
                            checked={selectedFocusAreas.includes(name)}
                            onChange={() => toggleFocusArea(name)}
                            sx={{p: 0.25, color: '#98A7BD', '&.Mui-checked': {color: '#2569ED'}}}
                          />
                        </TableCell>
                        <TableCell sx={{fontSize: 12.5, fontWeight: 500, color: '#2E3742', py: 1.15, pl: 0}}>
                          {name}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        ) : activeTab === 'BBS Barriers' ? (
          <>
            <Box sx={{display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.2}}>
              <Box>
                <Typography sx={{fontSize: 14, fontWeight: 700, color: '#202124'}}>BBS Barriers</Typography>
                <Typography sx={{fontSize: 11.5, color: '#6B7280', mt: 0.25}}>Report specific behavior and validation</Typography>
              </Box>
              <Button variant="contained" onClick={onSave} sx={{height: 30, px: 1.6, borderRadius: 1.1, bgcolor: '#2569ED', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>SAVE</Button>
            </Box>

            <Paper elevation={0} sx={{mt: 1.5, borderRadius: 1, border: '1px solid #D1D9E6', px: {xs: 1.2, md: 1.8}, py: {xs: 1.2, md: 1.6}}}>
              <Box sx={{display: 'grid', gridTemplateColumns: {xs: '1fr', md: '1fr 1fr auto'}, gap: 1.1, alignItems: 'center'}}>
                <Box>
                  <TextField
                    fullWidth
                    value={bbsBarriersFieldLabel}
                    onChange={(event) => setBbsBarriersFieldLabel(event.target.value)}
                    variant="outlined"
                    InputLabelProps={{shrink: true}}
                    label="Field Name"
                    sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                  />
                </Box>
                <Box>
                  <TextField
                    fullWidth
                    value={bbsBarriersPlaceholder}
                    onChange={(event) => setBbsBarriersPlaceholder(event.target.value)}
                    variant="outlined"
                    InputLabelProps={{shrink: true}}
                    label="Placeholder Text"
                    sx={{'& .MuiOutlinedInput-root': {height: 30, borderRadius: 1.1, bgcolor: '#FFFFFF'}, '& .MuiInputBase-input': {fontSize: 12, color: '#202124', py: 0.7}, '& .MuiInputLabel-root': {fontSize: 16}}}
                  />
                </Box>
                <Box sx={{display: 'flex', alignItems: 'center', gap: 0.7, justifySelf: 'end', pr: 0.4}}>
                  <Checkbox
                    checked={bbsBarriersRequired}
                    disabled={!isGlobalMode}
                    onChange={(event) => isGlobalMode && setBbsBarriersRequired(event.target.checked)}
                    sx={{p: 0.35, color: '#D4DBE8', '&.Mui-checked': {color: '#1976D2'}, '&.Mui-disabled': {color: '#D4DBE8'}, '&.Mui-checked.Mui-disabled': {color: '#B8C2CF'}}}
                  />
                  <Typography sx={{fontSize: 12.5, color: '#2E3742'}}>Required</Typography>
                </Box>
              </Box>
            </Paper>
            {isGlobalMode ? (
              <Box sx={{mt: 1.8}}>
                <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.7}}>
                  <Typography sx={{fontSize: 12.5, fontWeight: 700, color: '#2E3742'}}>Barrier List</Typography>
                  <Button variant="outlined" onClick={addBarrier} sx={{height: 30, minWidth: 114, borderRadius: 1.1, borderColor: '#8BB0FF', color: '#246BFE', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>+ ADD BARRIER</Button>
                </Box>
                <TableContainer component={Paper} elevation={0} sx={{borderRadius: 1, border: '1px solid #D1D9E6', overflow: 'hidden'}}>
                  <Table>
                    <TableBody>
                      {barriersList.map((item) => (
                        <TableRow key={item.id} sx={{'& td': {borderColor: '#E0E6F0'}}}>
                          <TableCell sx={{fontSize: 12.5, fontWeight: 500, color: item.visible ? '#2E3742' : '#A1A1AA', py: 1.2}}>
                            {item.name}
                          </TableCell>
                          <TableCell align="right" sx={{width: 92}}>
                            <IconButton size="small" onClick={() => openEditBarrierModal(item.id)} sx={{mr: 0.3}}>
                              <EditOutlinedIcon sx={{fontSize: 18, color: '#2569ED'}} />
                            </IconButton>
                            <IconButton size="small" onClick={() => toggleBarrierVisibility(item.id)}>
                              {item.visible ? (
                                <VisibilityOutlinedIcon sx={{fontSize: 18, color: '#2569ED'}} />
                              ) : (
                                <VisibilityOffOutlinedIcon sx={{fontSize: 18, color: '#6B7280'}} />
                              )}
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            ) : null}
          </>
        ) : (
          <Box sx={{py: 4}}>
            <Typography sx={{fontSize: 22, fontWeight: 800, color: '#1D3B66'}}>{activeTab}</Typography>
            <Typography sx={{fontSize: 14, color: '#56739B', mt: 0.8}}>Layout placeholder ready for the next screen you will send.</Typography>
          </Box>
        )}
      </Box>

      <Dialog open={categoryModalOpen} onClose={() => setCategoryModalOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr) auto', maxHeight: '84vh', bgcolor: '#F8FAFD'}}>
          <Box sx={{px: 1.6, py: 1.1, borderBottom: '1px solid #E0E6F0', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography sx={{fontSize: 18, fontWeight: 900, color: '#001B49', textTransform: 'uppercase'}}>{editingCategoryId ? 'Edit Category' : 'Add Category'}</Typography>
            <IconButton onClick={() => setCategoryModalOpen(false)} sx={{color: '#8AA0BF'}}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{px: 1.6, py: 1.2, overflowY: 'auto'}}>
            <Typography sx={{fontSize: 12, color: '#6E86A9', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Category Name</Typography>
            <TextField
              fullWidth
              value={categoryDraft.name}
              onChange={(event) => setCategoryDraft((prev) => ({...prev, name: event.target.value}))}
              sx={{mt: 0.45, '& .MuiOutlinedInput-root': {height: 36, borderRadius: 1.1}, '& .MuiOutlinedInput-input': {fontWeight: 700, fontSize: 13}}}
            />

            <Box sx={{mt: 1.3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 0.5, borderBottom: '1px solid #E0E6F0'}}>
              <Typography sx={{fontSize: 12, color: '#2569ED', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Sub-Categories</Typography>
              <Button onClick={addSubCategoryToDraft} sx={{minWidth: 0, p: 0, fontSize: 12, color: '#2569ED', fontWeight: 900}}>+ ADD SUB</Button>
            </Box>

            <Box sx={{display: 'grid', gap: 0.8, mt: 0.85}}>
              {categoryDraft.subCategories.map((sub) => (
                <Paper key={sub.id} elevation={0} sx={{border: '1px solid #D8E0EA', borderRadius: 1.1, p: 0.9, bgcolor: '#F5F8FC', opacity: sub.visible ? 1 : 0.65}}>
                  <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.35}}>
                    <Typography sx={{fontSize: 10.5, color: '#7A92B6', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Sub-Category Name</Typography>
                    <IconButton size="small" onClick={() => toggleSubCategoryVisibility(sub.id)} sx={{p: 0.3}}>
                      {sub.visible ? <VisibilityOutlinedIcon sx={{fontSize: 16, color: '#2569ED'}} /> : <VisibilityOffOutlinedIcon sx={{fontSize: 16, color: '#95A7C3'}} />}
                    </IconButton>
                  </Box>
                  <TextField
                    fullWidth
                    value={sub.name}
                    onChange={(event) => updateSubCategoryDraft(sub.id, 'name', event.target.value)}
                    sx={{'& .MuiOutlinedInput-root': {height: 34, borderRadius: 1}, '& .MuiOutlinedInput-input': {fontWeight: 700, fontSize: 12.5}}}
                  />
                  <Typography sx={{fontSize: 10.5, color: '#7A92B6', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', mt: 0.75}}>Sub-Category Description</Typography>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={sub.description}
                    onChange={(event) => updateSubCategoryDraft(sub.id, 'description', event.target.value)}
                    placeholder="Sub-category description"
                    sx={{mt: 0.35, '& .MuiOutlinedInput-root': {borderRadius: 1}, '& .MuiInputBase-input': {fontSize: 12.5}}}
                  />
                </Paper>
              ))}
            </Box>
          </Box>

          <Box sx={{px: 1.6, py: 1, borderTop: '1px solid #E0E6F0', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'flex-end', gap: 0.8}}>
            <Button onClick={() => setCategoryModalOpen(false)} sx={{height: 32, px: 1.4, fontWeight: 800, fontSize: 11.5, color: '#4C658B'}}>CANCEL</Button>
            <Button variant="contained" onClick={saveCategoryDraft} sx={{height: 32, px: 1.8, borderRadius: 1.1, bgcolor: '#001B49', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>SAVE CHANGES</Button>
          </Box>
        </Box>
      </Dialog>

      <Dialog open={barrierModalOpen} onClose={() => setBarrierModalOpen(false)} maxWidth="sm" fullWidth>
        <Box sx={{display: 'grid', gridTemplateRows: 'auto 1fr auto', bgcolor: '#F8FAFD'}}>
          <Box sx={{px: 1.6, py: 1.1, borderBottom: '1px solid #E0E6F0', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Typography sx={{fontSize: 18, fontWeight: 900, color: '#001B49', textTransform: 'uppercase'}}>
              {editingBarrierId ? 'Edit Barrier' : 'Create New Barrier'}
            </Typography>
            <IconButton onClick={() => setBarrierModalOpen(false)} sx={{color: '#8AA0BF'}}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{px: 1.6, py: 1.2}}>
            <Typography sx={{fontSize: 11.5, color: '#6E86A9', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase'}}>Barrier Name</Typography>
            <TextField
              fullWidth
              value={barrierDraftName}
              onChange={(event) => setBarrierDraftName(event.target.value)}
              placeholder="e.g. Rushing, Fatigue..."
              sx={{mt: 0.45, '& .MuiOutlinedInput-root': {height: 36, borderRadius: 1.1}, '& .MuiOutlinedInput-input': {fontWeight: 700, fontSize: 13}}}
            />
          </Box>

          <Box sx={{px: 1.6, py: 1, borderTop: '1px solid #E0E6F0', bgcolor: '#FFFFFF', display: 'flex', justifyContent: 'flex-end', gap: 0.8}}>
            <Button onClick={() => setBarrierModalOpen(false)} sx={{height: 32, px: 1.4, fontWeight: 800, fontSize: 11.5, color: '#4C658B'}}>CANCEL</Button>
            <Button variant="contained" onClick={saveBarrierDraft} sx={{height: 32, px: 1.8, borderRadius: 1.1, bgcolor: '#001B49', boxShadow: 'none', fontWeight: 800, fontSize: 11.5}}>
              {editingBarrierId ? 'SAVE' : 'CREATE'}
            </Button>
          </Box>
        </Box>
      </Dialog>
      <CreateFieldModal open={fieldModalOpen} onClose={() => setFieldModalOpen(false)} onCreate={createField} />
    </Box>
  );
}

function EsoHistoryLogPage({onBack}: {onBack: () => void}) {
  const rows = [
    {level: 'GLOBAL', site: '—', changeType: 'BBS', section: 'INITIAL INFORMATION', change: 'Modified "Shift" field to be site-editable', target: '—', changedBy: 'John Smith', changedDate: '2024-05-10 14:22'},
    {level: 'SITE', site: 'Columbus West', changeType: 'BBS', section: 'CATEGORIES', change: 'Selected "PPE" and "Safe Walking" as Top 5 Focus Areas', target: '—', changedBy: 'Maddison Brooks', changedDate: '2024-05-10 15:45'},
    {level: 'SITE', site: 'Canaan', changeType: 'ESO', section: 'TARGETS', change: 'Updated site submission targets', target: 'Monthly: 50 -> 65', changedBy: 'Gracie Walker', changedDate: '2024-05-11 09:12'},
    {level: 'GLOBAL', site: '—', changeType: 'CONDITION', section: 'RESOLUTION STATUS', change: 'Added "Update local procedure" to Medium Risk recommendations', target: '—', changedBy: 'James Miller', changedDate: '2024-05-11 11:30'},
    {level: 'SITE', site: 'Sandy', changeType: 'NEAR MISS', section: 'INITIAL INFORMATION', change: 'Overrode "Area" field label to "Manufacturing Cell"', target: '—', changedBy: 'David Cooper', changedDate: '2024-05-11 13:05'},
    {level: 'SITE', site: 'Columbus West', changeType: 'ESO', section: 'TARGETS / ASSEMBLY LINE 1', change: 'Updated area-specific targets', target: 'Monthly: 12 -> 15', changedBy: 'Sarah Jenkins', changedDate: '2024-05-12 10:15'},
  ];

  return (
    <Box sx={{flexGrow: 1, overflowY: 'auto', bgcolor: '#F1F3F6', minHeight: 'calc(100vh - 112px)', zoom: 0.92}}>
      <Box sx={{px: {xs: 1.2, md: 2.4}, py: {xs: 1.1, md: 1.45}, borderBottom: '1px solid #D4DBE7', bgcolor: '#FFFFFF', display: 'flex', alignItems: 'flex-start', gap: 1.6}}>
        <IconButton onClick={onBack} sx={{width: 36, height: 36, border: '1px solid #D5DDEA', color: '#284B7A', bgcolor: '#FFFFFF'}}>
          <ArrowBackIcon sx={{fontSize: 19}} />
        </IconButton>
        <Box sx={{width: 48, height: 48, borderRadius: 1.6, bgcolor: '#EAF1FF', display: 'grid', placeItems: 'center'}}>
          <HistoryIcon sx={{fontSize: 26, color: '#2A6DF6'}} />
        </Box>
        <Box>
          <Typography sx={{fontSize: {xs: 17, md: 21}, fontWeight: 900, color: '#001B49', lineHeight: 1.1}}>HISTORY LOG</Typography>
          <Typography sx={{fontSize: {xs: 12.2, md: 14.2}, color: '#38557F', mt: 0.35, fontWeight: 600}}>CENTRALIZED RECORD OF CONFIGURATION CHANGES</Typography>
        </Box>
      </Box>

      <Box sx={{maxWidth: 1700, mx: 'auto', px: {xs: 1.2, md: 2.3}, py: {xs: 1.4, md: 2.2}}}>
        <TableContainer component={Paper} elevation={0} sx={{borderRadius: 2.2, border: '1px solid #D1D9E6', overflow: 'hidden'}}>
          <Table>
            <TableHead>
              <TableRow sx={{bgcolor: '#F7F9FC'}}>
                {['LEVEL', 'SITE', 'CHANGE', 'TARGET UPDATE', 'CHANGED BY', 'CHANGED DATE'].map((header) => (
                  <TableCell key={header} sx={{fontSize: 12.5, color: '#4D668B', fontWeight: 800, letterSpacing: '0.08em', py: 1.6}}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={`${row.changedBy}-${row.changedDate}`} sx={{'& td': {borderColor: '#E0E6F0'}}}>
                  <TableCell sx={{py: 1.9}}>
                    <Chip
                      label={row.level}
                      size="small"
                      sx={{
                        bgcolor: row.level === 'GLOBAL' ? '#F2EDFF' : '#EAF1FF',
                        color: row.level === 'GLOBAL' ? '#8A2BE2' : '#2569ED',
                        fontSize: 11.5,
                        fontWeight: 800,
                        borderRadius: 1,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{fontSize: 15, fontWeight: 600, color: '#26486F'}}>{row.site}</TableCell>
                  <TableCell>
                    <Typography sx={{fontSize: 15, fontWeight: 800, color: '#001B49'}}>
                      {row.changeType}
                      <Typography component="span" sx={{fontWeight: 700, color: '#5B77A0'}}> / {row.section}</Typography>
                    </Typography>
                    <Typography sx={{fontSize: 14, color: '#38557F', mt: 0.6}}>{row.change}</Typography>
                  </TableCell>
                  <TableCell sx={{fontSize: 14, color: '#2F7D41', fontWeight: 700}}>
                    {row.target === '—' ? '—' : <Chip label={row.target} size="small" sx={{bgcolor: '#E9F8ED', color: '#12763A', fontWeight: 800}} />}
                  </TableCell>
                  <TableCell sx={{fontSize: 15, fontWeight: 700, color: '#203B60'}}>{row.changedBy}</TableCell>
                  <TableCell sx={{fontSize: 14, color: '#4B668D'}}>{row.changedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

export default function EsoHubScreen({
  onOpenDashboard,
  onOpenEntry,
  selectedHeaderHierarchyId = 'header-hierarchy-bd-global',
  submittedEntries: _submittedEntries = [],
}: EsoHubScreenProps) {
  const [screenMode, setScreenMode] = useState<'hub' | 'administrative' | 'historyLog' | 'bbsSiteConfig' | 'bbsGlobalConfig' | 'conditionSiteConfig' | 'conditionGlobalConfig' | 'nearMissSiteConfig' | 'nearMissGlobalConfig' | 'esoTargetsConfig' | 'contactRateTargets' | 'terminologyConfig'>('hub');
  const [activeTab, setActiveTab] = useState<EsoTab>('reports');
  const [initialReportStatusTab] = useState<ReportStatusTab>(() => readInitialReportStatusTabFromSession() ?? 'open');
  const [activeReportPanel, setActiveReportPanel] = useState<{ mode: ReportPanelMode; report: ReportRow } | null>(null);
  const selectedHierarchyPath = findHeaderHierarchyPath(selectedHeaderHierarchyId) ?? [];
  const selectedHierarchyNode = selectedHierarchyPath[selectedHierarchyPath.length - 1];
  const administrativeScope: EsoAdministrativeScope = selectedHierarchyNode?.kind === 'global' ? 'global' : 'site';
  const siteScopeLabel = selectedHierarchyNode?.label ?? 'Site';
  const renderAdministrativeShell = (activeTitle: string, content: ReactNode) => (
    <EsoAdministrativeShell
      activeTitle={activeTitle}
      isGlobal={administrativeScope === 'global'}
      onOpenBbsConfiguration={() => setScreenMode(administrativeScope === 'global' ? 'bbsGlobalConfig' : 'bbsSiteConfig')}
      onOpenConditionConfiguration={() => setScreenMode(administrativeScope === 'global' ? 'conditionGlobalConfig' : 'conditionSiteConfig')}
      onOpenNearMissConfiguration={() => setScreenMode(administrativeScope === 'global' ? 'nearMissGlobalConfig' : 'nearMissSiteConfig')}
      onOpenContactRateTargets={() => setScreenMode('contactRateTargets')}
      onOpenEsoTargetsConfiguration={() => setScreenMode('esoTargetsConfig')}
      onOpenTerminology={() => setScreenMode('terminologyConfig')}
      onOpenHistoryLog={() => setScreenMode('administrative')}
      onOpenHub={() => setScreenMode('hub')}
    >
      {content}
    </EsoAdministrativeShell>
  );

  if (screenMode === 'administrative') {
    return (
      <EsoAdministrativePage
        onOpenBbsConfiguration={() => setScreenMode(administrativeScope === 'global' ? 'bbsGlobalConfig' : 'bbsSiteConfig')}
      onOpenContactRateTargets={() => setScreenMode('contactRateTargets')}
      onOpenConditionConfiguration={() => setScreenMode(administrativeScope === 'global' ? 'conditionGlobalConfig' : 'conditionSiteConfig')}
      onOpenEsoTargetsConfiguration={() => setScreenMode('esoTargetsConfig')}
      onOpenHistoryLog={() => setScreenMode('historyLog')}
      onOpenHub={() => setScreenMode('hub')}
      onOpenNearMissConfiguration={() => setScreenMode(administrativeScope === 'global' ? 'nearMissGlobalConfig' : 'nearMissSiteConfig')}
      onOpenTerminology={() => setScreenMode('terminologyConfig')}
      scope={administrativeScope}
        scopeLabel={siteScopeLabel}
        onBack={() => setScreenMode('hub')}
      />
    );
  }

  if (screenMode === 'historyLog') {
    return <EsoHistoryLogPage onBack={() => setScreenMode('administrative')} />;
  }

  if (screenMode === 'bbsSiteConfig') {
    return renderAdministrativeShell('BBS', <EsoBbsSiteConfigurationPage embedded mode="site" siteLabel={siteScopeLabel} onCancel={() => setScreenMode('administrative')} onSave={() => setScreenMode('administrative')} />);
  }

  if (screenMode === 'bbsGlobalConfig') {
    return renderAdministrativeShell('BBS', <EsoBbsSiteConfigurationPage embedded mode="global" siteLabel={siteScopeLabel} onCancel={() => setScreenMode('administrative')} onSave={() => setScreenMode('administrative')} />);
  }

  if (screenMode === 'conditionSiteConfig') {
    return renderAdministrativeShell('Condition Report', <EsoConditionNearMissSiteConfigurationPage embedded reportType="Condition" mode="site" siteLabel={siteScopeLabel} onCancel={() => setScreenMode('administrative')} onSave={() => setScreenMode('administrative')} />);
  }

  if (screenMode === 'conditionGlobalConfig') {
    return renderAdministrativeShell('Condition Report', <EsoConditionNearMissSiteConfigurationPage embedded reportType="Condition" mode="global" siteLabel={siteScopeLabel} onCancel={() => setScreenMode('administrative')} onSave={() => setScreenMode('administrative')} />);
  }

  if (screenMode === 'nearMissSiteConfig') {
    return renderAdministrativeShell('Near Miss', <EsoConditionNearMissSiteConfigurationPage embedded reportType="Near Miss" mode="site" siteLabel={siteScopeLabel} onCancel={() => setScreenMode('administrative')} onSave={() => setScreenMode('administrative')} />);
  }

  if (screenMode === 'nearMissGlobalConfig') {
    return renderAdministrativeShell('Near Miss', <EsoConditionNearMissSiteConfigurationPage embedded reportType="Near Miss" mode="global" siteLabel={siteScopeLabel} onCancel={() => setScreenMode('administrative')} onSave={() => setScreenMode('administrative')} />);
  }

  if (screenMode === 'esoTargetsConfig') {
    return renderAdministrativeShell('ESO Submission Rate', <EsoTargetsConfigurationPage embedded siteLabel={siteScopeLabel} onBack={() => setScreenMode('administrative')} />);
  }

  if (screenMode === 'contactRateTargets') {
    return renderAdministrativeShell('Manage BDX Targets', <ManageBdxContactRateTargetsPage embedded onBack={() => setScreenMode('administrative')} />);
  }

  if (screenMode === 'terminologyConfig') {
    return renderAdministrativeShell('Terminology', <EsoTerminologyConfigurationPage embedded />);
  }

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 3 } }}>
      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Paper
          elevation={0}
          sx={{
            mb: 1.8,
            px: { xs: 1.8, md: 2.2 },
            py: { xs: 1.5, md: 1.8 },
            borderRadius: 2.5,
            border: '1px solid #D8DEE8',
            bgcolor: '#FFFFFF',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 1.5,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ maxWidth: 920 }}>
            <Typography variant="caption" sx={{ color: activeTheme.primary, letterSpacing: '0.08em', fontWeight: 800, lineHeight: 1, textTransform: 'uppercase' }}>
              ESO
            </Typography>
            <Typography variant="h5" sx={{ color: activeTheme.textPrimary, fontWeight: 800, fontSize: { xs: '1.35rem', md: '1.6rem' }, lineHeight: 1.05, letterSpacing: '-0.03em', mt: 0.15 }}>
              Environmental or Safety Observation
            </Typography>
            <Typography variant="caption" sx={{ color: activeTheme.textSecondary, mt: 0.35, display: 'block', maxWidth: 760, lineHeight: 1.3, fontSize: '0.78rem' }}>
              Monitor safety performance, manage behavior-based observations, conditions, and near misses, and track issue resolution across the facility.
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
            <Button
              variant="outlined"
              onClick={() => {
                onOpenDashboard();
                setScreenMode('administrative');
              }}
              sx={{
                minWidth: 0,
                width: 32,
                height: 32,
                borderRadius: 1,
                borderColor: '#9EC0FF',
                color: '#2463EB',
                p: 0,
              }}
            >
              <SettingsIcon sx={{ fontSize: 18 }} />
            </Button>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: 2.5,
            border: '1px solid #D8E0EA',
            bgcolor: '#FFFFFF',
            px: { xs: 1.3, md: 1.55 },
            py: { xs: 1.2, md: 1.45 },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.2, flexWrap: 'wrap', mb: 1.45 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.7 }}>
              {(['reports', 'dashboard'] as const).map((tab) => {
                const active = activeTab === tab;
                return (
                  <Button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    sx={{
                      minWidth: 0,
                      p: 0,
                      pb: 0.55,
                      borderRadius: 0,
                      borderBottom: active ? '2px solid #2463EB' : '2px solid transparent',
                      color: active ? '#2463EB' : '#4B5563',
                      fontSize: 11.5,
                      fontWeight: active ? 700 : 500,
                      lineHeight: 1,
                    }}
                  >
                    {tab === 'reports' ? 'REPORTS' : 'DASHBOARD'}
                  </Button>
                );
              })}
            </Box>
          </Box>

          {activeTab === 'reports' ? (
            <ReportsTab
              initialStatusTab={initialReportStatusTab}
              onEditRow={(row) => {
                if (row.type === 'BBS') {
                  onOpenEntry(reportEntryMode(row));
                  return;
                }

                setActiveReportPanel({ mode: 'edit', report: row });
              }}
              onSelectRow={(row) => setActiveReportPanel({ mode: 'view', report: row })}
            />
          ) : <DashboardTab />}
        </Paper>
      </Paper>
      <BbsReportDrawer
        mode={activeReportPanel?.mode ?? 'view'}
        report={activeReportPanel?.report ?? null}
        onClose={() => setActiveReportPanel(null)}
      />
    </Box>
  );
}
