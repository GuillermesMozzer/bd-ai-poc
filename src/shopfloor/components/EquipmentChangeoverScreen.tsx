import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
} from '@mui/material';
import {
  AutoAwesome as InsightsIcon,
  ErrorOutline as AlertIcon,
  InfoOutlined as InfoOutlinedIcon,
  TaskAltOutlined as TaskAltOutlinedIcon,
} from '@mui/icons-material';
import {
  tokenBrand,
  tokenCommon,
  tokenDivider,
  tokenError,
  tokenInfo,
  tokenNeutral,
  tokenSuccess,
  tokenText,
  tokenWarning,
} from '../../workstation/theme';
import WorkstationEquipmentChangeoverWidget from '../../workstation/components/WorkstationEquipmentChangeoverWidget';
import { useShiftManagementContext } from '../../shiftManagement/contexts/ShiftManagementContext';

type PeriodFilter = 'today' | 'actualWeek' | 'lastWeek' | 'mtd' | 'lastMonth' | 'ytd' | 'date';
type ShiftType = 'Shift 1 (Day)' | 'Shift 2 (Day)' | 'Shift 3 (Night)';
type LineType = 'Line A' | 'Line B' | 'Line C';
type ListType = 'activities' | 'abnormalities';
type ListMode = 'overview' | 'weekly';

type ActivityStatus = 'Done' | 'Running' | 'Pending' | 'Waiting Review' | 'Overdue';
type AbnormalityStatus = 'Pending' | 'Scheduled' | 'In Progress' | 'Done';

type ChangeoverActivityRow = {
  activityId: string;
  type: 'Changeover';
  status: ActivityStatus;
  shift: ShiftType;
  line: LineType;
  area: 'Area A' | 'Area B';
  equipment: string;
  description: string;
  estimatedTime: string;
  actualTime: string;
  responsible: string;
  createdAt: string;
  replayId?: string;
  replayElapsedSeconds?: number;
  replayComment?: string;
};

type ChangeoverAbnormalityRow = {
  activityId: string;
  type: 'Abnormality';
  status: AbnormalityStatus;
  shift: ShiftType;
  line: LineType;
  area: 'Area A' | 'Area B';
  equipment: string;
  description: string;
  estimatedTime: string;
  actualTime: string;
  responsible: string;
  createdAt: string;
};

type WeeklyPlanTask = {
  id: string;
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
  title: string;
  equipment: string;
  line: LineType;
  shift: ShiftType;
  responsible: string;
  status: ActivityStatus;
};

type ShiftPerformanceRow = {
  shift: ShiftType;
  avgDuration: number;
  vsTarget: number;
  events: number;
};

type QualityIssueType =
  | 'Parameter out of spec'
  | 'Dimension out of spec'
  | 'Defect on first pieces'
  | 'Material contamination'
  | 'Other';

type FirstPassShiftRate = {
  shift: ShiftType;
  rate: number;
};

type ActivityStatusBreakdown = {
  label: string;
  value: number;
  color: string;
};

type InsightRow = {
  key: string;
  tone: 'critical' | 'attention' | 'positive';
  title: string;
  subtitle: string;
};

type ChangeoverEventPoint = {
  id: string;
  changeoverType: string;
  fromSku: string;
  toSku: string;
  time: string;
  shift: ShiftType;
  line: LineType;
  equipment: string;
  actual: number;
  target: number;
  issue?: boolean;
  issueType?: QualityIssueType;
  majorIssues?: number;
  minorIssues?: number;
};

type PeriodScenario = {
  insights: InsightRow[];
  avgDuration: {
    value: number;
    target: number;
    trendPct: number;
    spark: number[];
  };
  eventsVsTarget: {
    below: number;
    near: number;
    above: number;
  };
  shiftPerformance: ShiftPerformanceRow[];
  adjustmentTime: {
    value: number;
    target: number;
    sharePct: number;
    spark: number[];
  };
  firstPass: {
    rate: number;
    target: number;
    byShift: FirstPassShiftRate[];
  };
  rampUp: {
    deviations: number;
    total: number;
    target: number;
    openIssues: number;
  };
  activityStatus: ActivityStatusBreakdown[];
};

const pageCardSx = {
  borderRadius: '12px',
  border: `1px solid ${tokenDivider}`,
  bgcolor: 'background.paper',
  boxShadow: 'none',
} as const;

const assistantPanelSx = {
  width: '100%',
  p: 2,
  borderRadius: '12px',
  border: 'none',
  bgcolor: tokenNeutral.lightest,
  mb: 2.25,
} as const;

const metricCardSx = {
  p: 1.45,
  borderRadius: '12px',
  border: `1px solid ${tokenDivider}`,
  bgcolor: 'background.paper',
  minHeight: 248,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: 'none',
} as const;

const analyticsCardSx = {
  minHeight: 300,
  height: '100%',
  width: '100%',
  p: 1.65,
  borderRadius: '12px',
  border: `1px solid ${tokenDivider}`,
  bgcolor: 'background.paper',
  boxShadow: 'none',
} as const;

const analyticsTitleSx = {
  color: tokenBrand.main,
  fontWeight: 700,
  textTransform: 'uppercase',
  lineHeight: 1.4,
  letterSpacing: 0,
} as const;

const ACTIVITY_ROWS: ChangeoverActivityRow[] = [
  {
    activityId: 'ACT-100240',
    type: 'Changeover',
    status: 'Waiting Review',
    shift: 'Shift 1 (Day)',
    line: 'Line A',
    area: 'Area A',
    equipment: 'Z1 Cutter',
    description: 'Changeover SKU A -> SKU C',
    estimatedTime: '29 min',
    actualTime: '31 min',
    responsible: 'Delila Bran',
    createdAt: 'May 6, 2026 07:45',
    replayId: 'changeover-review-mock-replay-1',
    replayElapsedSeconds: 1860,
    replayComment: 'Operator executed all stages and logged comments for each checkpoint. Awaiting line leader validation for closure.',
  },
  {
    activityId: 'ACT-100245',
    type: 'Changeover',
    status: 'Done',
    shift: 'Shift 2 (Day)',
    line: 'Line A',
    area: 'Area A',
    equipment: 'Z1 Cutter',
    description: 'Changeover SKU B -> SKU D',
    estimatedTime: '30 min',
    actualTime: '33 min',
    responsible: 'John Smith',
    createdAt: 'May 6, 2026 08:15',
    replayId: 'changeover-done-mock-replay-1',
    replayElapsedSeconds: 1980,
    replayComment: 'Completed with all verifications and evidence captured. No pending actions.',
  },
  {
    activityId: 'ACT-100246',
    type: 'Changeover',
    status: 'Running',
    shift: 'Shift 3 (Night)',
    line: 'Line B',
    area: 'Area A',
    equipment: 'Z3 Press',
    description: 'Changeover SKU C -> SKU A',
    estimatedTime: '45 min',
    actualTime: '-',
    responsible: 'Maria Garcia',
    createdAt: 'May 6, 2026 08:42',
  },
  {
    activityId: 'ACT-100247',
    type: 'Changeover',
    status: 'Pending',
    shift: 'Shift 3 (Night)',
    line: 'Line C',
    area: 'Area B',
    equipment: 'Z2 Assembly Station',
    description: 'Changeover SKU A -> SKU B',
    estimatedTime: '25 min',
    actualTime: '-',
    responsible: 'David Lee',
    createdAt: 'May 6, 2026 09:05',
  },
  {
    activityId: 'ACT-100248',
    type: 'Changeover',
    status: 'Done',
    shift: 'Shift 1 (Day)',
    line: 'Line A',
    area: 'Area A',
    equipment: 'Z1 Feeder',
    description: 'Changeover SKU C -> SKU D',
    estimatedTime: '28 min',
    actualTime: '24 min',
    responsible: 'Amanda Torres',
    createdAt: 'May 6, 2026 09:22',
  },
  {
    activityId: 'ACT-100249',
    type: 'Changeover',
    status: 'Pending',
    shift: 'Shift 3 (Night)',
    line: 'Line B',
    area: 'Area B',
    equipment: 'Z5 Sub Assembly',
    description: 'Changeover SKU D -> SKU C',
    estimatedTime: '50 min',
    actualTime: '-',
    responsible: 'Kevin Brown',
    createdAt: 'May 6, 2026 09:58',
  },
  {
    activityId: 'ACT-100250',
    type: 'Changeover',
    status: 'Done',
    shift: 'Shift 2 (Day)',
    line: 'Line C',
    area: 'Area B',
    equipment: 'Z4 Needle Station',
    description: 'Changeover SKU E -> SKU A',
    estimatedTime: '30 min',
    actualTime: '27 min',
    responsible: 'Sarah Johnson',
    createdAt: 'May 6, 2026 10:05',
  },
  {
    activityId: 'ACT-100251',
    type: 'Changeover',
    status: 'Done',
    shift: 'Shift 1 (Day)',
    line: 'Line B',
    area: 'Area A',
    equipment: 'Z1 Cutter',
    description: 'Changeover SKU B -> SKU C',
    estimatedTime: '34 min',
    actualTime: '36 min',
    responsible: 'Mike Wilson',
    createdAt: 'May 6, 2026 11:10',
  },
  {
    activityId: 'ACT-100252',
    type: 'Changeover',
    status: 'Done',
    shift: 'Shift 2 (Day)',
    line: 'Line A',
    area: 'Area A',
    equipment: 'Z3 Press',
    description: 'Changeover SKU A -> SKU D',
    estimatedTime: '26 min',
    actualTime: '25 min',
    responsible: 'Julia Costa',
    createdAt: 'May 6, 2026 12:35',
  },
];

const ABNORMALITY_ROWS: ChangeoverAbnormalityRow[] = [
  {
    activityId: 'ABN-300201',
    type: 'Abnormality',
    status: 'In Progress',
    shift: 'Shift 3 (Night)',
    line: 'Line A',
    area: 'Area A',
    equipment: 'Z1 Cutter',
    description: 'Material staging incomplete before changeover',
    estimatedTime: '22 min',
    actualTime: '14 min',
    responsible: 'Carlos Mendez',
    createdAt: 'May 6, 2026 07:58',
  },
  {
    activityId: 'ABN-300202',
    type: 'Abnormality',
    status: 'Done',
    shift: 'Shift 2 (Day)',
    line: 'Line B',
    area: 'Area A',
    equipment: 'Z3 Press',
    description: 'Tooling calibration planned for next run',
    estimatedTime: '18 min',
    actualTime: '21 min',
    responsible: 'Maria Garcia',
    createdAt: 'May 6, 2026 08:22',
  },
  {
    activityId: 'ABN-300203',
    type: 'Abnormality',
    status: 'In Progress',
    shift: 'Shift 3 (Night)',
    line: 'Line C',
    area: 'Area B',
    equipment: 'Z2 Assembly Station',
    description: 'Waiting for QA approval to release line',
    estimatedTime: '20 min',
    actualTime: '11 min',
    responsible: 'David Lee',
    createdAt: 'May 6, 2026 09:04',
  },
  {
    activityId: 'ABN-300204',
    type: 'Abnormality',
    status: 'Pending',
    shift: 'Shift 1 (Day)',
    line: 'Line A',
    area: 'Area B',
    equipment: 'Z4 Needle Station',
    description: 'Incorrect SKU kit identified and corrected',
    estimatedTime: '16 min',
    actualTime: '03 min',
    responsible: 'Amanda Torres',
    createdAt: 'May 6, 2026 09:48',
  },
];

const WEEKLY_PLAN: WeeklyPlanTask[] = [
  { id: 'wk-1', day: 'Mon', title: 'SKU B -> SKU D', equipment: 'Z1 Cutter', line: 'Line A', shift: 'Shift 3 (Night)', responsible: 'John Smith', status: 'Done' },
  { id: 'wk-2', day: 'Mon', title: 'SKU C -> SKU A', equipment: 'Z3 Press', line: 'Line B', shift: 'Shift 2 (Day)', responsible: 'Maria Garcia', status: 'Done' },
  { id: 'wk-3', day: 'Tue', title: 'SKU A -> SKU B', equipment: 'Z2 Assembly Station', line: 'Line C', shift: 'Shift 3 (Night)', responsible: 'David Lee', status: 'Running' },
  { id: 'wk-4', day: 'Wed', title: 'SKU D -> SKU C', equipment: 'Z5 Sub Assembly', line: 'Line B', shift: 'Shift 3 (Night)', responsible: 'Kevin Brown', status: 'Pending' },
  { id: 'wk-5', day: 'Thu', title: 'SKU E -> SKU A', equipment: 'Z4 Needle Station', line: 'Line C', shift: 'Shift 1 (Day)', responsible: 'Sarah Johnson', status: 'Done' },
  { id: 'wk-6', day: 'Fri', title: 'SKU B -> SKU C', equipment: 'Z1 Cutter', line: 'Line B', shift: 'Shift 1 (Day)', responsible: 'Mike Wilson', status: 'Pending' },
  { id: 'wk-7', day: 'Sat', title: 'SKU A -> SKU D', equipment: 'Z3 Press', line: 'Line A', shift: 'Shift 2 (Day)', responsible: 'Julia Costa', status: 'Pending' },
];

const ACTIVITY_ROWS_MTD_EXTRA: ChangeoverActivityRow[] = [
  {
    activityId: 'ACT-100253',
    type: 'Changeover',
    status: 'Done',
    shift: 'Shift 2 (Day)',
    line: 'Line A',
    area: 'Area A',
    equipment: 'Z1 Cutter',
    description: 'Changeover SKU C -> SKU E',
    estimatedTime: '29 min',
    actualTime: '31 min',
    responsible: 'Liam Carter',
    createdAt: 'May 11, 2026 07:54',
  },
  {
    activityId: 'ACT-100254',
    type: 'Changeover',
    status: 'Done',
    shift: 'Shift 1 (Day)',
    line: 'Line C',
    area: 'Area B',
    equipment: 'Z2 Assembly Station',
    description: 'Changeover SKU D -> SKU B',
    estimatedTime: '34 min',
    actualTime: '32 min',
    responsible: 'Nina Patel',
    createdAt: 'May 12, 2026 09:08',
  },
  {
    activityId: 'ACT-100255',
    type: 'Changeover',
    status: 'Pending',
    shift: 'Shift 3 (Night)',
    line: 'Line B',
    area: 'Area A',
    equipment: 'Z3 Press',
    description: 'Changeover SKU E -> SKU C',
    estimatedTime: '42 min',
    actualTime: '-',
    responsible: 'Ricardo Silva',
    createdAt: 'May 12, 2026 08:36',
  },
  {
    activityId: 'ACT-100256',
    type: 'Changeover',
    status: 'Running',
    shift: 'Shift 2 (Day)',
    line: 'Line C',
    area: 'Area B',
    equipment: 'Z4 Needle Station',
    description: 'Changeover SKU B -> SKU A',
    estimatedTime: '31 min',
    actualTime: '-',
    responsible: 'Elena Wood',
    createdAt: 'May 12, 2026 09:42',
  },
];

const ABNORMALITY_ROWS_MTD_EXTRA: ChangeoverAbnormalityRow[] = [
  {
    activityId: 'ABN-300205',
    type: 'Abnormality',
    status: 'Pending',
    shift: 'Shift 3 (Night)',
    line: 'Line B',
    area: 'Area A',
    equipment: 'Z1 Cutter',
    description: 'Adjustment window exceeded planned duration',
    estimatedTime: '24 min',
    actualTime: '05 min',
    responsible: 'Ricardo Silva',
    createdAt: 'May 11, 2026 08:32',
  },
  {
    activityId: 'ABN-300206',
    type: 'Abnormality',
    status: 'In Progress',
    shift: 'Shift 2 (Day)',
    line: 'Line C',
    area: 'Area B',
    equipment: 'Z4 Needle Station',
    description: 'Gauge setup variation detected during first-pass checks',
    estimatedTime: '26 min',
    actualTime: '17 min',
    responsible: 'Sarah Johnson',
    createdAt: 'May 12, 2026 10:11',
  },
];

const PERIOD_ROWS: Record<PeriodFilter, { activities: ChangeoverActivityRow[]; abnormalities: ChangeoverAbnormalityRow[]; weekly: WeeklyPlanTask[] }> = {
  today: {
    activities: ACTIVITY_ROWS.slice(0, 6),
    abnormalities: ABNORMALITY_ROWS.slice(0, 2),
    weekly: WEEKLY_PLAN.slice(0, 4),
  },
  actualWeek: {
    activities: [...ACTIVITY_ROWS.slice(0, 6), ...ACTIVITY_ROWS_MTD_EXTRA.slice(0, 2)],
    abnormalities: [...ABNORMALITY_ROWS.slice(0, 3), ...ABNORMALITY_ROWS_MTD_EXTRA],
    weekly: WEEKLY_PLAN.slice(0, 6),
  },
  lastWeek: {
    activities: [...ACTIVITY_ROWS.slice(2, 8), ...ACTIVITY_ROWS_MTD_EXTRA.slice(1, 4)],
    abnormalities: [...ABNORMALITY_ROWS.slice(1), ...ABNORMALITY_ROWS_MTD_EXTRA.slice(0, 1)],
    weekly: WEEKLY_PLAN.slice(1, 7),
  },
  mtd: {
    activities: [...ACTIVITY_ROWS, ...ACTIVITY_ROWS_MTD_EXTRA],
    abnormalities: [...ABNORMALITY_ROWS, ...ABNORMALITY_ROWS_MTD_EXTRA],
    weekly: WEEKLY_PLAN,
  },
  lastMonth: {
    activities: [...ACTIVITY_ROWS.slice(1), ...ACTIVITY_ROWS_MTD_EXTRA.slice().reverse()],
    abnormalities: [...ABNORMALITY_ROWS.slice(1), ...ABNORMALITY_ROWS_MTD_EXTRA.slice().reverse()],
    weekly: WEEKLY_PLAN.slice().reverse(),
  },
  ytd: {
    activities: [...ACTIVITY_ROWS, ...ACTIVITY_ROWS_MTD_EXTRA],
    abnormalities: [...ABNORMALITY_ROWS, ...ABNORMALITY_ROWS_MTD_EXTRA],
    weekly: WEEKLY_PLAN,
  },
  date: {
    activities: ACTIVITY_ROWS.slice(1, 6),
    abnormalities: ABNORMALITY_ROWS.slice(1, 3),
    weekly: WEEKLY_PLAN.slice(1, 4),
  },
};

const PERIOD_SCENARIOS: Record<PeriodFilter, PeriodScenario> = {
  today: {
    insights: [
      {
        key: 'critical',
        tone: 'critical',
        title: 'SKU B -> SKU D changeovers on Z1 Cutter exceeded target duration by 22% during night shift over the last 3 executions.',
        subtitle: 'Consider reviewing workload balance and process constraints on this line.',
      },
      {
        key: 'attention',
        tone: 'attention',
        title: 'Adjustment time was the main contributor for delay in 4 of 5 changeovers today.',
        subtitle: 'Investigate adjustment process and machine conditions.',
      },
      {
        key: 'positive',
        tone: 'positive',
        title: 'Shift 2 had the highest first-pass rate in parameter checks today: 92%.',
        subtitle: 'Great performance. Consider sharing best practices across other shifts.',
      },
    ],
    avgDuration: {
      value: 32,
      target: 27,
      trendPct: 18,
      spark: [30, 25, 28, 26, 27, 25, 29, 24, 35, 31, 33],
    },
    eventsVsTarget: {
      below: 7,
      near: 3,
      above: 2,
    },
    shiftPerformance: [
      { shift: 'Shift 1 (Day)', avgDuration: 38, vsTarget: 6, events: 5 },
      { shift: 'Shift 2 (Day)', avgDuration: 31, vsTarget: -1, events: 4 },
      { shift: 'Shift 3 (Night)', avgDuration: 44, vsTarget: 12, events: 3 },
    ],
    adjustmentTime: {
      value: 18,
      target: 10,
      sharePct: 45,
      spark: [15, 17, 16, 18, 15, 19, 14, 16, 15, 16, 15, 18],
    },
    firstPass: {
      rate: 75,
      target: 90,
      byShift: [
        { shift: 'Shift 1 (Day)', rate: 62 },
        { shift: 'Shift 2 (Day)', rate: 92 },
        { shift: 'Shift 3 (Night)', rate: 68 },
      ],
    },
    rampUp: {
      deviations: 2,
      total: 12,
      target: 0,
      openIssues: 3,
    },
    activityStatus: [
      { label: 'Completed', value: 6, color: tokenSuccess.main },
      { label: 'Running', value: 2, color: tokenBrand.main },
      { label: 'Upcoming', value: 3, color: tokenWarning.main },
      { label: 'Delayed', value: 1, color: tokenError.main },
    ],
  },
  actualWeek: {
    insights: [
      {
        key: 'critical',
        tone: 'critical',
        title: 'SKU B -> SKU D remained above target in night shift during the current week.',
        subtitle: 'Reinforce setup checklist before Shift 3 starts.',
      },
      {
        key: 'attention',
        tone: 'attention',
        title: 'Most weekly delay minutes came from parameter adjustment after restart.',
        subtitle: 'Prioritize pre-adjustment validation and tooling readiness.',
      },
      {
        key: 'positive',
        tone: 'positive',
        title: 'Shift 2 kept the best weekly average for changeover duration.',
        subtitle: 'Replicate Shift 2 setup sequence on parallel lines.',
      },
    ],
    avgDuration: {
      value: 31,
      target: 27,
      trendPct: 13,
      spark: [30, 31, 29, 32, 30, 31, 32, 30, 29, 31, 30, 32],
    },
    eventsVsTarget: {
      below: 18,
      near: 7,
      above: 5,
    },
    shiftPerformance: [
      { shift: 'Shift 1 (Day)', avgDuration: 33, vsTarget: 6, events: 9 },
      { shift: 'Shift 2 (Day)', avgDuration: 29, vsTarget: 2, events: 11 },
      { shift: 'Shift 3 (Night)', avgDuration: 36, vsTarget: 9, events: 8 },
    ],
    adjustmentTime: {
      value: 15,
      target: 10,
      sharePct: 39,
      spark: [14, 15, 16, 15, 14, 16, 15, 14, 15, 16, 15, 16],
    },
    firstPass: {
      rate: 84,
      target: 90,
      byShift: [
        { shift: 'Shift 1 (Day)', rate: 80 },
        { shift: 'Shift 2 (Day)', rate: 90 },
        { shift: 'Shift 3 (Night)', rate: 78 },
      ],
    },
    rampUp: {
      deviations: 4,
      total: 30,
      target: 0,
      openIssues: 4,
    },
    activityStatus: [
      { label: 'Completed', value: 18, color: tokenSuccess.main },
      { label: 'Running', value: 4, color: tokenBrand.main },
      { label: 'Upcoming', value: 5, color: tokenWarning.main },
      { label: 'Delayed', value: 3, color: tokenError.main },
    ],
  },
  lastWeek: {
    insights: [
      {
        key: 'critical',
        tone: 'critical',
        title: 'Last week had recurring overruns on SKU D -> SKU B transitions.',
        subtitle: 'Review offline setup preparation and line handoff timing.',
      },
      {
        key: 'attention',
        tone: 'attention',
        title: 'Night shift concentrated most quality-related changeover deviations last week.',
        subtitle: 'Set an early escalation checkpoint for Shift 3.',
      },
      {
        key: 'positive',
        tone: 'positive',
        title: 'Shift 1 kept stable execution under 32 min in most events.',
        subtitle: 'Use this routine as baseline for standard work updates.',
      },
    ],
    avgDuration: {
      value: 33,
      target: 27,
      trendPct: 19,
      spark: [34, 33, 35, 34, 33, 32, 34, 35, 33, 34, 35, 33],
    },
    eventsVsTarget: {
      below: 14,
      near: 6,
      above: 8,
    },
    shiftPerformance: [
      { shift: 'Shift 1 (Day)', avgDuration: 32, vsTarget: 5, events: 8 },
      { shift: 'Shift 2 (Day)', avgDuration: 31, vsTarget: 4, events: 9 },
      { shift: 'Shift 3 (Night)', avgDuration: 38, vsTarget: 11, events: 7 },
    ],
    adjustmentTime: {
      value: 17,
      target: 10,
      sharePct: 43,
      spark: [16, 17, 18, 16, 17, 18, 17, 18, 17, 16, 18, 17],
    },
    firstPass: {
      rate: 79,
      target: 90,
      byShift: [
        { shift: 'Shift 1 (Day)', rate: 81 },
        { shift: 'Shift 2 (Day)', rate: 84 },
        { shift: 'Shift 3 (Night)', rate: 70 },
      ],
    },
    rampUp: {
      deviations: 7,
      total: 28,
      target: 0,
      openIssues: 6,
    },
    activityStatus: [
      { label: 'Completed', value: 14, color: tokenSuccess.main },
      { label: 'Running', value: 3, color: tokenBrand.main },
      { label: 'Upcoming', value: 4, color: tokenWarning.main },
      { label: 'Delayed', value: 5, color: tokenError.main },
    ],
  },
  mtd: {
    insights: [
      {
        key: 'critical',
        tone: 'critical',
        title: 'Night shift on Line B accumulated 7 above-target changeovers in the month, mostly on SKU E -> SKU C.',
        subtitle: 'Prioritize setup standardization and escalation before night starts.',
      },
      {
        key: 'attention',
        tone: 'attention',
        title: 'Adjustment-related delays appeared in 14 of 18 delayed starts month to date.',
        subtitle: 'Review change parts readiness and pre-check sequence adherence.',
      },
      {
        key: 'positive',
        tone: 'positive',
        title: 'Shift 2 maintained the best first-pass consistency month to date at 88%.',
        subtitle: 'Use Shift 2 routines as baseline for cross-shift coaching.',
      },
    ],
    avgDuration: {
      value: 30,
      target: 27,
      trendPct: 11,
      spark: [29, 28, 31, 30, 29, 28, 32, 30, 29, 30, 31, 29],
    },
    eventsVsTarget: {
      below: 22,
      near: 11,
      above: 7,
    },
    shiftPerformance: [
      { shift: 'Shift 1 (Day)', avgDuration: 34, vsTarget: 2, events: 14 },
      { shift: 'Shift 2 (Day)', avgDuration: 30, vsTarget: -2, events: 16 },
      { shift: 'Shift 3 (Night)', avgDuration: 37, vsTarget: 5, events: 10 },
    ],
    adjustmentTime: {
      value: 16,
      target: 10,
      sharePct: 40,
      spark: [14, 15, 16, 15, 17, 15, 14, 16, 15, 17, 16, 16],
    },
    firstPass: {
      rate: 82,
      target: 90,
      byShift: [
        { shift: 'Shift 1 (Day)', rate: 79 },
        { shift: 'Shift 2 (Day)', rate: 88 },
        { shift: 'Shift 3 (Night)', rate: 76 },
      ],
    },
    rampUp: {
      deviations: 6,
      total: 40,
      target: 0,
      openIssues: 5,
    },
    activityStatus: [
      { label: 'Completed', value: 24, color: tokenSuccess.main },
      { label: 'Running', value: 5, color: tokenBrand.main },
      { label: 'Upcoming', value: 7, color: tokenWarning.main },
      { label: 'Delayed', value: 4, color: tokenError.main },
    ],
  },
  lastMonth: {
    insights: [
      {
        key: 'critical',
        tone: 'critical',
        title: 'Last month concentrated the largest changeover overruns on Line B night shift.',
        subtitle: 'Use the closed-month pattern to prioritize setup validation and line readiness actions.',
      },
      {
        key: 'attention',
        tone: 'attention',
        title: 'Adjustment-related delays represented the main duration driver last month.',
        subtitle: 'Review change parts readiness and repeatability before the next monthly cycle.',
      },
      {
        key: 'positive',
        tone: 'positive',
        title: 'Shift 2 kept the strongest first-pass performance across the closed month.',
        subtitle: 'Reuse the same setup sequence as a baseline for cross-shift coaching.',
      },
    ],
    avgDuration: {
      value: 32,
      target: 27,
      trendPct: 18,
      spark: [31, 33, 32, 34, 31, 30, 33, 32, 34, 31, 32, 33],
    },
    eventsVsTarget: {
      below: 19,
      near: 9,
      above: 10,
    },
    shiftPerformance: [
      { shift: 'Shift 1 (Day)', avgDuration: 35, vsTarget: 8, events: 13 },
      { shift: 'Shift 2 (Day)', avgDuration: 31, vsTarget: 4, events: 14 },
      { shift: 'Shift 3 (Night)', avgDuration: 39, vsTarget: 12, events: 11 },
    ],
    adjustmentTime: {
      value: 18,
      target: 10,
      sharePct: 44,
      spark: [17, 18, 19, 17, 18, 19, 18, 17, 19, 18, 17, 18],
    },
    firstPass: {
      rate: 79,
      target: 90,
      byShift: [
        { shift: 'Shift 1 (Day)', rate: 77 },
        { shift: 'Shift 2 (Day)', rate: 84 },
        { shift: 'Shift 3 (Night)', rate: 72 },
      ],
    },
    rampUp: {
      deviations: 9,
      total: 38,
      target: 0,
      openIssues: 7,
    },
    activityStatus: [
      { label: 'Completed', value: 21, color: tokenSuccess.main },
      { label: 'Running', value: 4, color: tokenBrand.main },
      { label: 'Upcoming', value: 6, color: tokenWarning.main },
      { label: 'Delayed', value: 7, color: tokenError.main },
    ],
  },
  ytd: {
    insights: [
      {
        key: 'critical',
        tone: 'critical',
        title: 'SKU B -> SKU D remains the top yearly duration outlier with repeated overruns on Z1 Cutter.',
        subtitle: 'Keep dedicated recovery actions open until variance is controlled.',
      },
      {
        key: 'attention',
        tone: 'attention',
        title: 'Parameter drift spikes recur after unplanned tool replacements on Line C.',
        subtitle: 'Add mandatory verification checkpoints before restart.',
      },
      {
        key: 'positive',
        tone: 'positive',
        title: 'Average first-pass performance improved 5 pp compared to last year baseline.',
        subtitle: 'Sustain with periodic audits on high-volume SKUs.',
      },
    ],
    avgDuration: {
      value: 31,
      target: 27,
      trendPct: 15,
      spark: [32, 31, 30, 29, 31, 32, 30, 31, 33, 30, 31, 30],
    },
    eventsVsTarget: {
      below: 176,
      near: 84,
      above: 58,
    },
    shiftPerformance: [
      { shift: 'Shift 1 (Day)', avgDuration: 35, vsTarget: 3, events: 109 },
      { shift: 'Shift 2 (Day)', avgDuration: 31, vsTarget: -1, events: 122 },
      { shift: 'Shift 3 (Night)', avgDuration: 38, vsTarget: 6, events: 87 },
    ],
    adjustmentTime: {
      value: 17,
      target: 10,
      sharePct: 42,
      spark: [16, 17, 16, 18, 17, 16, 17, 18, 16, 17, 18, 17],
    },
    firstPass: {
      rate: 80,
      target: 90,
      byShift: [
        { shift: 'Shift 1 (Day)', rate: 78 },
        { shift: 'Shift 2 (Day)', rate: 85 },
        { shift: 'Shift 3 (Night)', rate: 74 },
      ],
    },
    rampUp: {
      deviations: 58,
      total: 318,
      target: 0,
      openIssues: 17,
    },
    activityStatus: [
      { label: 'Completed', value: 176, color: tokenSuccess.main },
      { label: 'Running', value: 46, color: tokenBrand.main },
      { label: 'Upcoming', value: 58, color: tokenWarning.main },
      { label: 'Delayed', value: 38, color: tokenError.main },
    ],
  },
  date: {
    insights: [
      {
        key: 'critical',
        tone: 'critical',
        title: 'Two changeovers on the selected date missed target due to extended tooling setup.',
        subtitle: 'Review setup handoff and tooling readiness checklist.',
      },
      {
        key: 'attention',
        tone: 'attention',
        title: 'Adjustment time represented 41% of total downtime on that date.',
        subtitle: 'Cross-check machine condition log and adjustment sequence.',
      },
      {
        key: 'positive',
        tone: 'positive',
        title: 'One line maintained stable first-pass performance above 90% on the selected date.',
        subtitle: 'Replicate the same pre-check routine on parallel lines.',
      },
    ],
    avgDuration: {
      value: 29,
      target: 27,
      trendPct: 7,
      spark: [27, 28, 29, 27, 30, 29, 28, 30, 29, 28, 29, 30],
    },
    eventsVsTarget: {
      below: 4,
      near: 2,
      above: 2,
    },
    shiftPerformance: [
      { shift: 'Shift 1 (Day)', avgDuration: 30, vsTarget: 1, events: 3 },
      { shift: 'Shift 2 (Day)', avgDuration: 29, vsTarget: 0, events: 3 },
      { shift: 'Shift 3 (Night)', avgDuration: 33, vsTarget: 4, events: 2 },
    ],
    adjustmentTime: {
      value: 14,
      target: 10,
      sharePct: 41,
      spark: [12, 13, 14, 15, 13, 14, 15, 14, 13, 14, 15, 14],
    },
    firstPass: {
      rate: 78,
      target: 90,
      byShift: [
        { shift: 'Shift 1 (Day)', rate: 82 },
        { shift: 'Shift 2 (Day)', rate: 90 },
        { shift: 'Shift 3 (Night)', rate: 65 },
      ],
    },
    rampUp: {
      deviations: 2,
      total: 8,
      target: 0,
      openIssues: 2,
    },
    activityStatus: [
      { label: 'Completed', value: 4, color: tokenSuccess.main },
      { label: 'Running', value: 1, color: tokenBrand.main },
      { label: 'Upcoming', value: 2, color: tokenWarning.main },
      { label: 'Delayed', value: 1, color: tokenError.main },
    ],
  },
};

const MATRIX_SKUS = ['SKU A', 'SKU B', 'SKU C', 'SKU D', 'SKU E'] as const;
const DURATION_MATRIX_TARGET: Record<string, number> = {
  'SKU A -> SKU B': 25,
  'SKU A -> SKU C': 22,
  'SKU A -> SKU D': 28,
  'SKU A -> SKU E': 24,
  'SKU B -> SKU A': 25,
  'SKU B -> SKU C': 23,
  'SKU B -> SKU D': 40,
  'SKU B -> SKU E': 27,
  'SKU C -> SKU A': 20,
  'SKU C -> SKU B': 20,
  'SKU C -> SKU D': 25,
  'SKU C -> SKU E': 22,
  'SKU D -> SKU A': 28,
  'SKU D -> SKU B': 35,
  'SKU D -> SKU C': 24,
  'SKU D -> SKU E': 25,
  'SKU E -> SKU A': 24,
  'SKU E -> SKU B': 23,
  'SKU E -> SKU C': 20,
  'SKU E -> SKU D': 26,
};
const SPECIFIC_DATE_LABELS: Record<string, string> = {
  '2026-05-06': 'May 6, 2026',
  '2026-05-05': 'May 5, 2026',
  '2026-05-04': 'May 4, 2026',
};

const buildChangeoverEvent = ({
  id,
  changeoverType,
  time,
  shift,
  line,
  equipment,
  actual,
  issueType,
  majorIssues = 0,
  minorIssues = 0,
}: {
  id: string;
  changeoverType: string;
  time: string;
  shift: ShiftType;
  line: LineType;
  equipment: string;
  actual: number;
  issueType?: QualityIssueType;
  majorIssues?: number;
  minorIssues?: number;
}): ChangeoverEventPoint => {
  const [fromSku, toSku] = changeoverType.split(' -> ');
  return {
    id,
    changeoverType,
    fromSku,
    toSku,
    time,
    shift,
    line,
    equipment,
    actual,
    target: DURATION_MATRIX_TARGET[changeoverType] ?? actual,
    issue: Boolean(issueType),
    issueType,
    majorIssues: issueType ? majorIssues : 0,
    minorIssues: issueType ? minorIssues : 0,
  };
};

const CHANGEOVER_EVENT_SERIES: Record<PeriodFilter, ChangeoverEventPoint[]> = {
  today: [
    buildChangeoverEvent({ id: 'T-01', changeoverType: 'SKU A -> SKU B', time: '08:15', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 27 }),
    buildChangeoverEvent({ id: 'T-02', changeoverType: 'SKU B -> SKU D', time: '08:45', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 52, issueType: 'Parameter out of spec', majorIssues: 1, minorIssues: 1 }),
    buildChangeoverEvent({ id: 'T-03', changeoverType: 'SKU C -> SKU D', time: '11:20', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z3 Press', actual: 24 }),
    buildChangeoverEvent({ id: 'T-04', changeoverType: 'SKU E -> SKU A', time: '13:50', shift: 'Shift 2 (Day)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 23 }),
    buildChangeoverEvent({ id: 'T-05', changeoverType: 'SKU D -> SKU B', time: '15:40', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 41, issueType: 'Dimension out of spec', majorIssues: 1 }),
    buildChangeoverEvent({ id: 'T-06', changeoverType: 'SKU B -> SKU C', time: '18:10', shift: 'Shift 2 (Day)', line: 'Line A', equipment: 'Z1 Feeder', actual: 22 }),
    buildChangeoverEvent({ id: 'T-07', changeoverType: 'SKU A -> SKU D', time: '20:35', shift: 'Shift 3 (Night)', line: 'Line A', equipment: 'Z3 Press', actual: 33 }),
    buildChangeoverEvent({ id: 'T-08', changeoverType: 'SKU C -> SKU A', time: '22:50', shift: 'Shift 3 (Night)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 19 }),
    buildChangeoverEvent({ id: 'T-09', changeoverType: 'SKU D -> SKU C', time: '01:15', shift: 'Shift 3 (Night)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 27 }),
    buildChangeoverEvent({ id: 'T-10', changeoverType: 'SKU E -> SKU D', time: '03:40', shift: 'Shift 3 (Night)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 31, issueType: 'Defect on first pieces', majorIssues: 1, minorIssues: 1 }),
    buildChangeoverEvent({ id: 'T-11', changeoverType: 'SKU A -> SKU E', time: '05:55', shift: 'Shift 1 (Day)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 24 }),
    buildChangeoverEvent({ id: 'T-12', changeoverType: 'SKU B -> SKU A', time: '07:30', shift: 'Shift 1 (Day)', line: 'Line B', equipment: 'Z1 Cutter', actual: 25 }),
  ],
  actualWeek: [
    buildChangeoverEvent({ id: 'AW-01', changeoverType: 'SKU A -> SKU B', time: 'Mon 06:40', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 26 }),
    buildChangeoverEvent({ id: 'AW-02', changeoverType: 'SKU B -> SKU D', time: 'Mon 11:10', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z3 Press', actual: 49, issueType: 'Parameter out of spec', majorIssues: 1 }),
    buildChangeoverEvent({ id: 'AW-03', changeoverType: 'SKU C -> SKU D', time: 'Tue 09:00', shift: 'Shift 1 (Day)', line: 'Line B', equipment: 'Z1 Feeder', actual: 25 }),
    buildChangeoverEvent({ id: 'AW-04', changeoverType: 'SKU D -> SKU B', time: 'Tue 16:45', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 37 }),
    buildChangeoverEvent({ id: 'AW-05', changeoverType: 'SKU E -> SKU C', time: 'Tue 21:20', shift: 'Shift 3 (Night)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 24 }),
    buildChangeoverEvent({ id: 'AW-06', changeoverType: 'SKU A -> SKU D', time: 'Wed 08:20', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z3 Press', actual: 30 }),
    buildChangeoverEvent({ id: 'AW-07', changeoverType: 'SKU C -> SKU A', time: 'Wed 14:35', shift: 'Shift 2 (Day)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 22 }),
    buildChangeoverEvent({ id: 'AW-08', changeoverType: 'SKU B -> SKU C', time: 'Thu 10:50', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 24 }),
    buildChangeoverEvent({ id: 'AW-09', changeoverType: 'SKU E -> SKU A', time: 'Thu 19:40', shift: 'Shift 3 (Night)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 26 }),
    buildChangeoverEvent({ id: 'AW-10', changeoverType: 'SKU D -> SKU C', time: 'Fri 00:10', shift: 'Shift 3 (Night)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 26 }),
    buildChangeoverEvent({ id: 'AW-11', changeoverType: 'SKU A -> SKU E', time: 'Fri 12:15', shift: 'Shift 2 (Day)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 23 }),
    buildChangeoverEvent({ id: 'AW-12', changeoverType: 'SKU B -> SKU A', time: 'Fri 17:55', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z1 Feeder', actual: 24 }),
    buildChangeoverEvent({ id: 'AW-13', changeoverType: 'SKU D -> SKU A', time: 'Sat 09:30', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z3 Press', actual: 29 }),
    buildChangeoverEvent({ id: 'AW-14', changeoverType: 'SKU C -> SKU B', time: 'Sat 23:10', shift: 'Shift 3 (Night)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 22, issueType: 'Other', minorIssues: 1 }),
  ],
  lastWeek: [
    buildChangeoverEvent({ id: 'LW-01', changeoverType: 'SKU A -> SKU C', time: 'Mon 07:05', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 25 }),
    buildChangeoverEvent({ id: 'LW-02', changeoverType: 'SKU B -> SKU D', time: 'Mon 13:45', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z3 Press', actual: 56, issueType: 'Parameter out of spec', majorIssues: 1, minorIssues: 1 }),
    buildChangeoverEvent({ id: 'LW-03', changeoverType: 'SKU E -> SKU D', time: 'Tue 18:10', shift: 'Shift 2 (Day)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 32 }),
    buildChangeoverEvent({ id: 'LW-04', changeoverType: 'SKU D -> SKU B', time: 'Tue 23:25', shift: 'Shift 3 (Night)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 43, issueType: 'Dimension out of spec', majorIssues: 1 }),
    buildChangeoverEvent({ id: 'LW-05', changeoverType: 'SKU C -> SKU E', time: 'Wed 06:50', shift: 'Shift 1 (Day)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 24 }),
    buildChangeoverEvent({ id: 'LW-06', changeoverType: 'SKU A -> SKU D', time: 'Wed 15:00', shift: 'Shift 2 (Day)', line: 'Line A', equipment: 'Z3 Press', actual: 34 }),
    buildChangeoverEvent({ id: 'LW-07', changeoverType: 'SKU B -> SKU C', time: 'Thu 20:20', shift: 'Shift 3 (Night)', line: 'Line A', equipment: 'Z1 Feeder', actual: 26 }),
    buildChangeoverEvent({ id: 'LW-08', changeoverType: 'SKU E -> SKU A', time: 'Fri 09:10', shift: 'Shift 1 (Day)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 27 }),
    buildChangeoverEvent({ id: 'LW-09', changeoverType: 'SKU D -> SKU A', time: 'Fri 17:40', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 33 }),
    buildChangeoverEvent({ id: 'LW-10', changeoverType: 'SKU C -> SKU D', time: 'Sat 01:30', shift: 'Shift 3 (Night)', line: 'Line B', equipment: 'Z3 Press', actual: 29 }),
    buildChangeoverEvent({ id: 'LW-11', changeoverType: 'SKU A -> SKU B', time: 'Sat 11:25', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 28 }),
    buildChangeoverEvent({ id: 'LW-12', changeoverType: 'SKU B -> SKU A', time: 'Sun 22:05', shift: 'Shift 3 (Night)', line: 'Line B', equipment: 'Z1 Feeder', actual: 29, issueType: 'Defect on first pieces', majorIssues: 1 }),
  ],
  lastMonth: [
    buildChangeoverEvent({ id: 'LM-01', changeoverType: 'SKU A -> SKU C', time: 'Apr 02', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 27 }),
    buildChangeoverEvent({ id: 'LM-02', changeoverType: 'SKU B -> SKU D', time: 'Apr 04', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z3 Press', actual: 55, issueType: 'Parameter out of spec', majorIssues: 1, minorIssues: 1 }),
    buildChangeoverEvent({ id: 'LM-03', changeoverType: 'SKU E -> SKU D', time: 'Apr 06', shift: 'Shift 2 (Day)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 34 }),
    buildChangeoverEvent({ id: 'LM-04', changeoverType: 'SKU D -> SKU B', time: 'Apr 08', shift: 'Shift 3 (Night)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 44, issueType: 'Dimension out of spec', majorIssues: 1 }),
    buildChangeoverEvent({ id: 'LM-05', changeoverType: 'SKU C -> SKU E', time: 'Apr 10', shift: 'Shift 1 (Day)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 25 }),
    buildChangeoverEvent({ id: 'LM-06', changeoverType: 'SKU A -> SKU D', time: 'Apr 12', shift: 'Shift 2 (Day)', line: 'Line A', equipment: 'Z3 Press', actual: 35 }),
    buildChangeoverEvent({ id: 'LM-07', changeoverType: 'SKU B -> SKU C', time: 'Apr 15', shift: 'Shift 3 (Night)', line: 'Line A', equipment: 'Z1 Feeder', actual: 27 }),
    buildChangeoverEvent({ id: 'LM-08', changeoverType: 'SKU E -> SKU A', time: 'Apr 17', shift: 'Shift 1 (Day)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 29 }),
    buildChangeoverEvent({ id: 'LM-09', changeoverType: 'SKU D -> SKU A', time: 'Apr 20', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 35 }),
    buildChangeoverEvent({ id: 'LM-10', changeoverType: 'SKU C -> SKU D', time: 'Apr 22', shift: 'Shift 3 (Night)', line: 'Line B', equipment: 'Z3 Press', actual: 30 }),
    buildChangeoverEvent({ id: 'LM-11', changeoverType: 'SKU A -> SKU B', time: 'Apr 25', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 29 }),
    buildChangeoverEvent({ id: 'LM-12', changeoverType: 'SKU B -> SKU A', time: 'Apr 28', shift: 'Shift 3 (Night)', line: 'Line B', equipment: 'Z1 Feeder', actual: 30, issueType: 'Defect on first pieces', majorIssues: 1 }),
  ],
  mtd: [
    buildChangeoverEvent({ id: 'MTD-01', changeoverType: 'SKU A -> SKU B', time: 'May 02', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 26 }),
    buildChangeoverEvent({ id: 'MTD-02', changeoverType: 'SKU B -> SKU D', time: 'May 03', shift: 'Shift 1 (Day)', line: 'Line B', equipment: 'Z3 Press', actual: 52, issueType: 'Parameter out of spec', majorIssues: 1 }),
    buildChangeoverEvent({ id: 'MTD-03', changeoverType: 'SKU C -> SKU D', time: 'May 04', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z1 Feeder', actual: 28 }),
    buildChangeoverEvent({ id: 'MTD-04', changeoverType: 'SKU D -> SKU B', time: 'May 05', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 39, issueType: 'Dimension out of spec', majorIssues: 1 }),
    buildChangeoverEvent({ id: 'MTD-05', changeoverType: 'SKU E -> SKU C', time: 'May 06', shift: 'Shift 2 (Day)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 24 }),
    buildChangeoverEvent({ id: 'MTD-06', changeoverType: 'SKU A -> SKU D', time: 'May 07', shift: 'Shift 2 (Day)', line: 'Line A', equipment: 'Z3 Press', actual: 32 }),
    buildChangeoverEvent({ id: 'MTD-07', changeoverType: 'SKU C -> SKU A', time: 'May 08', shift: 'Shift 1 (Day)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 21 }),
    buildChangeoverEvent({ id: 'MTD-08', changeoverType: 'SKU B -> SKU C', time: 'May 09', shift: 'Shift 3 (Night)', line: 'Line A', equipment: 'Z1 Cutter', actual: 24 }),
    buildChangeoverEvent({ id: 'MTD-09', changeoverType: 'SKU E -> SKU A', time: 'May 10', shift: 'Shift 3 (Night)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 27 }),
    buildChangeoverEvent({ id: 'MTD-10', changeoverType: 'SKU D -> SKU C', time: 'May 11', shift: 'Shift 3 (Night)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 30 }),
    buildChangeoverEvent({ id: 'MTD-11', changeoverType: 'SKU A -> SKU E', time: 'May 12', shift: 'Shift 2 (Day)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 24 }),
    buildChangeoverEvent({ id: 'MTD-12', changeoverType: 'SKU B -> SKU A', time: 'May 13', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z1 Feeder', actual: 26 }),
    buildChangeoverEvent({ id: 'MTD-13', changeoverType: 'SKU D -> SKU A', time: 'May 14', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z3 Press', actual: 31 }),
    buildChangeoverEvent({ id: 'MTD-14', changeoverType: 'SKU C -> SKU B', time: 'May 15', shift: 'Shift 3 (Night)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 23, issueType: 'Material contamination', minorIssues: 1 }),
    buildChangeoverEvent({ id: 'MTD-15', changeoverType: 'SKU E -> SKU D', time: 'May 16', shift: 'Shift 3 (Night)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 33 }),
    buildChangeoverEvent({ id: 'MTD-16', changeoverType: 'SKU A -> SKU C', time: 'May 17', shift: 'Shift 2 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 24 }),
  ],
  ytd: [
    buildChangeoverEvent({ id: 'YTD-01', changeoverType: 'SKU A -> SKU B', time: 'Jan / Wk 01', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 28 }),
    buildChangeoverEvent({ id: 'YTD-02', changeoverType: 'SKU B -> SKU D', time: 'Feb / Wk 05', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z3 Press', actual: 57, issueType: 'Parameter out of spec', majorIssues: 1 }),
    buildChangeoverEvent({ id: 'YTD-03', changeoverType: 'SKU C -> SKU D', time: 'Mar / Wk 09', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z1 Feeder', actual: 30 }),
    buildChangeoverEvent({ id: 'YTD-04', changeoverType: 'SKU D -> SKU B', time: 'Apr / Wk 13', shift: 'Shift 3 (Night)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 44, issueType: 'Dimension out of spec', majorIssues: 1 }),
    buildChangeoverEvent({ id: 'YTD-05', changeoverType: 'SKU E -> SKU C', time: 'May / Wk 17', shift: 'Shift 3 (Night)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 26 }),
    buildChangeoverEvent({ id: 'YTD-06', changeoverType: 'SKU A -> SKU D', time: 'Jun / Wk 21', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z3 Press', actual: 33 }),
    buildChangeoverEvent({ id: 'YTD-07', changeoverType: 'SKU C -> SKU A', time: 'Jul / Wk 25', shift: 'Shift 2 (Day)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 23 }),
    buildChangeoverEvent({ id: 'YTD-08', changeoverType: 'SKU B -> SKU C', time: 'Aug / Wk 29', shift: 'Shift 2 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 25 }),
    buildChangeoverEvent({ id: 'YTD-09', changeoverType: 'SKU E -> SKU A', time: 'Sep / Wk 33', shift: 'Shift 3 (Night)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 28 }),
    buildChangeoverEvent({ id: 'YTD-10', changeoverType: 'SKU D -> SKU C', time: 'Oct / Wk 37', shift: 'Shift 3 (Night)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 32 }),
    buildChangeoverEvent({ id: 'YTD-11', changeoverType: 'SKU A -> SKU E', time: 'Nov / Wk 41', shift: 'Shift 1 (Day)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 25 }),
    buildChangeoverEvent({ id: 'YTD-12', changeoverType: 'SKU B -> SKU A', time: 'Dec / Wk 45', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z1 Feeder', actual: 27, issueType: 'Other', minorIssues: 1 }),
  ],
  date: [
    buildChangeoverEvent({ id: 'D-01', changeoverType: 'SKU A -> SKU B', time: '07:35', shift: 'Shift 1 (Day)', line: 'Line A', equipment: 'Z1 Cutter', actual: 26 }),
    buildChangeoverEvent({ id: 'D-02', changeoverType: 'SKU B -> SKU D', time: '09:20', shift: 'Shift 1 (Day)', line: 'Line B', equipment: 'Z3 Press', actual: 50, issueType: 'Parameter out of spec', majorIssues: 1 }),
    buildChangeoverEvent({ id: 'D-03', changeoverType: 'SKU C -> SKU D', time: '10:50', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z1 Feeder', actual: 26 }),
    buildChangeoverEvent({ id: 'D-04', changeoverType: 'SKU D -> SKU B', time: '12:05', shift: 'Shift 2 (Day)', line: 'Line B', equipment: 'Z5 Sub Assembly', actual: 38 }),
    buildChangeoverEvent({ id: 'D-05', changeoverType: 'SKU E -> SKU C', time: '14:10', shift: 'Shift 2 (Day)', line: 'Line C', equipment: 'Z4 Needle Station', actual: 23 }),
    buildChangeoverEvent({ id: 'D-06', changeoverType: 'SKU A -> SKU D', time: '17:20', shift: 'Shift 3 (Night)', line: 'Line A', equipment: 'Z3 Press', actual: 31 }),
    buildChangeoverEvent({ id: 'D-07', changeoverType: 'SKU C -> SKU A', time: '19:55', shift: 'Shift 3 (Night)', line: 'Line C', equipment: 'Z2 Assembly Station', actual: 21 }),
    buildChangeoverEvent({ id: 'D-08', changeoverType: 'SKU B -> SKU C', time: '22:30', shift: 'Shift 3 (Night)', line: 'Line A', equipment: 'Z1 Cutter', actual: 24, issueType: 'Defect on first pieces', minorIssues: 1 }),
  ],
};

const activityStatusTone = (status: ActivityStatus) => {
  if (status === 'Done') return { bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenSuccess.lighter };
  if (status === 'Running') return { bg: tokenBrand.softBg, color: tokenBrand.main, border: tokenBrand.lighter };
  if (status === 'Waiting Review') return { bg: tokenBrand.selectedBg, color: tokenBrand.dark, border: tokenBrand.lightest };
  if (status === 'Overdue') return { bg: tokenError.softBg, color: tokenError.dark, border: tokenError.lighter };
  return { bg: tokenNeutral.lighter, color: tokenText.secondary, border: tokenDivider };
};

const abnormalityStatusTone = (status: AbnormalityStatus) => {
  if (status === 'Done') return { bg: tokenSuccess.softBg, color: tokenSuccess.darker, border: tokenSuccess.lighter };
  if (status === 'In Progress') return { bg: tokenBrand.softBg, color: tokenBrand.main, border: tokenBrand.lighter };
  return { bg: tokenNeutral.lighter, color: tokenText.secondary, border: tokenDivider };
};
const canOpenMaintenanceRequest = (status: AbnormalityStatus) => status === 'In Progress' || status === 'Done';

const extractChangeoverType = (value: string) => {
  const match = value.match(/SKU [A-E]\s*->\s*SKU [A-E]/);
  return match ? match[0].replace(/\s*->\s*/, ' -> ') : null;
};

const splitChangeoverType = (value: string | null) => {
  if (!value) return null;
  const [fromSku, toSku] = value.split(' -> ');
  return fromSku && toSku ? { fromSku, toSku } : null;
};

const matchesSkuFilters = (changeoverType: string | null, fromSkuFilter: string, toSkuFilter: string) => {
  const parsed = splitChangeoverType(changeoverType);
  if (!parsed) return false;
  return (fromSkuFilter === 'all' || parsed.fromSku === fromSkuFilter)
    && (toSkuFilter === 'all' || parsed.toSku === toSkuFilter);
};

const EquipmentChangeoverScreen: React.FC = () => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('today');
  const [specificDate, setSpecificDate] = useState('2026-05-06');
  const [shiftFilter, setShiftFilter] = useState<'all' | ShiftType>('all');
  const [lineFilter, setLineFilter] = useState<'all' | LineType>('all');
  const [equipmentFilter, setEquipmentFilter] = useState<string>('all');
  const [fromSkuFilter, setFromSkuFilter] = useState<string>('all');
  const [toSkuFilter, setToSkuFilter] = useState<string>('all');
  const [listType, setListType] = useState<ListType>('activities');
  const [mode, setMode] = useState<ListMode>('overview');
  const [selectedReplayActivity, setSelectedReplayActivity] = useState<ChangeoverActivityRow | null>(null);
  const [activityStatusOverrides, setActivityStatusOverrides] = useState<Record<string, ActivityStatus>>({});
  const { handleShiftLogbookTicketSelect } = useShiftManagementContext().logbook;

  const periodRows = PERIOD_ROWS[periodFilter];
  const periodScenario = PERIOD_SCENARIOS[periodFilter];
  const periodEventSeries = CHANGEOVER_EVENT_SERIES[periodFilter];

  const equipmentOptions = useMemo(
    () =>
      Array.from(
        new Set(
          Object.values(PERIOD_ROWS)
            .flatMap((rows) => [...rows.activities, ...rows.abnormalities])
            .map((row) => row.equipment),
        ),
      ),
    [],
  );

  const periodChangeoverTypes = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...periodRows.activities.map((row) => extractChangeoverType(row.description)),
            ...periodRows.weekly.map((task) => extractChangeoverType(task.title)),
            ...periodEventSeries.map((row) => row.changeoverType),
          ].filter((value): value is string => Boolean(value)),
        ),
      ),
    [periodRows.activities, periodRows.weekly, periodEventSeries],
  );

  const fromSkuOptions = useMemo(
    () =>
      Array.from(
        new Set(
          periodChangeoverTypes
            .map(splitChangeoverType)
            .filter((value): value is { fromSku: string; toSku: string } => Boolean(value))
            .filter(({ toSku }) => toSkuFilter === 'all' || toSku === toSkuFilter)
            .map(({ fromSku }) => fromSku),
        ),
      ),
    [periodChangeoverTypes, toSkuFilter],
  );

  const toSkuOptions = useMemo(
    () =>
      Array.from(
        new Set(
          periodChangeoverTypes
            .map(splitChangeoverType)
            .filter((value): value is { fromSku: string; toSku: string } => Boolean(value))
            .filter(({ fromSku }) => fromSkuFilter === 'all' || fromSku === fromSkuFilter)
            .map(({ toSku }) => toSku),
        ),
      ),
    [periodChangeoverTypes, fromSkuFilter],
  );

  useEffect(() => {
    if (fromSkuFilter !== 'all' && !fromSkuOptions.includes(fromSkuFilter)) {
      setFromSkuFilter('all');
    }
    if (toSkuFilter !== 'all' && !toSkuOptions.includes(toSkuFilter)) {
      setToSkuFilter('all');
    }
  }, [fromSkuFilter, fromSkuOptions, toSkuFilter, toSkuOptions]);

  const hasChangeoverRoute = (fromSku: string, toSku: string) =>
    periodChangeoverTypes.some((changeoverType) => {
      const parsed = splitChangeoverType(changeoverType);
      return parsed?.fromSku === fromSku && parsed.toSku === toSku;
    });

  const handleFromSkuFilterChange = (value: string) => {
    setFromSkuFilter(value);
    setToSkuFilter((previous) => (
      previous === 'all' || value === 'all' || hasChangeoverRoute(value, previous)
        ? previous
        : 'all'
    ));
  };

  const handleToSkuFilterChange = (value: string) => {
    setToSkuFilter(value);
    setFromSkuFilter((previous) => (
      previous === 'all' || value === 'all' || hasChangeoverRoute(previous, value)
        ? previous
        : 'all'
    ));
  };

  const filteredActivities = useMemo(
    () => {
      const rows = periodRows.activities
        .filter(
          (row) =>
            (shiftFilter === 'all' || row.shift === shiftFilter) &&
            (lineFilter === 'all' || row.line === lineFilter) &&
            (equipmentFilter === 'all' || row.equipment === equipmentFilter) &&
            matchesSkuFilters(extractChangeoverType(row.description), fromSkuFilter, toSkuFilter),
        )
        .map((row) => ({
          ...row,
          status: activityStatusOverrides[row.activityId] ?? row.status,
        }));
      return rows.sort((a, b) => (
        a.status === 'Waiting Review'
          ? -1
          : b.status === 'Waiting Review'
            ? 1
            : 0
      ));
    },
    [periodRows.activities, shiftFilter, lineFilter, equipmentFilter, fromSkuFilter, toSkuFilter, activityStatusOverrides],
  );

  const filteredAbnormalities = useMemo(
    () =>
      periodRows.abnormalities.filter(
        (row) =>
          (shiftFilter === 'all' || row.shift === shiftFilter) &&
          (lineFilter === 'all' || row.line === lineFilter) &&
          (equipmentFilter === 'all' || row.equipment === equipmentFilter),
      ),
    [periodRows.abnormalities, shiftFilter, lineFilter, equipmentFilter],
  );

  const filteredWeeklyTasks = useMemo(
    () =>
      periodRows.weekly.filter(
        (task) =>
          (shiftFilter === 'all' || task.shift === shiftFilter) &&
          (lineFilter === 'all' || task.line === lineFilter) &&
          (equipmentFilter === 'all' || task.equipment === equipmentFilter) &&
          matchesSkuFilters(task.title, fromSkuFilter, toSkuFilter),
      ),
    [periodRows.weekly, shiftFilter, lineFilter, equipmentFilter, fromSkuFilter, toSkuFilter],
  );

  const filteredEventSeries = useMemo(
    () =>
      periodEventSeries.filter(
        (row) =>
          (shiftFilter === 'all' || row.shift === shiftFilter) &&
          (lineFilter === 'all' || row.line === lineFilter) &&
          (equipmentFilter === 'all' || row.equipment === equipmentFilter) &&
          matchesSkuFilters(row.changeoverType, fromSkuFilter, toSkuFilter),
      ),
    [periodEventSeries, shiftFilter, lineFilter, equipmentFilter, fromSkuFilter, toSkuFilter],
  );

  const completeWaitingReview = () => {
    if (!selectedReplayActivity) return;
    setActivityStatusOverrides((prev) => ({
      ...prev,
      [selectedReplayActivity.activityId]: 'Done',
    }));
    setSelectedReplayActivity(null);
  };

  const returnWaitingReview = () => {
    if (!selectedReplayActivity) return;
    setActivityStatusOverrides((prev) => ({
      ...prev,
      [selectedReplayActivity.activityId]: 'Pending',
    }));
    setSelectedReplayActivity(null);
  };

  const periodDescriptor = periodFilter === 'today'
    ? 'today'
    : periodFilter === 'actualWeek'
      ? 'actual week'
      : periodFilter === 'lastWeek'
        ? 'last week'
    : periodFilter === 'mtd'
      ? 'month to date'
      : periodFilter === 'lastMonth'
        ? 'last month'
      : periodFilter === 'ytd'
        ? 'year to date'
        : 'on selected date';
  const insightToneByType = {
    critical: { accent: tokenError.main, icon: <AlertIcon sx={{ fontSize: 15 }} /> },
    attention: { accent: tokenWarning.dark, icon: <InfoOutlinedIcon sx={{ fontSize: 15 }} /> },
    positive: { accent: tokenSuccess.darker, icon: <TaskAltOutlinedIcon sx={{ fontSize: 15 }} /> },
  } as const;

  const insights = periodScenario.insights.map((insight) => ({
    ...insight,
    ...insightToneByType[insight.tone],
  }));

  const totalExecutions = filteredEventSeries.length;
  const avgDurationValue = totalExecutions
    ? Math.round(filteredEventSeries.reduce((sum, row) => sum + row.actual, 0) / totalExecutions)
    : periodScenario.avgDuration.value;
  const avgDurationTarget = totalExecutions
    ? Math.round(filteredEventSeries.reduce((sum, row) => sum + row.target, 0) / totalExecutions)
    : periodScenario.avgDuration.target;
  const avgDurationGap = avgDurationValue - avgDurationTarget;
  const avgDurationTrendPct = avgDurationTarget > 0 ? Math.round((avgDurationGap / avgDurationTarget) * 100) : 0;
  const eventsVsTarget = filteredEventSeries.reduce(
    (acc, row) => {
      const gap = row.actual - row.target;
      if (gap <= 0) {
        acc.below += 1;
      } else if (gap <= 3) {
        acc.near += 1;
      } else {
        acc.above += 1;
      }
      return acc;
    },
    { below: 0, near: 0, above: 0 },
  );
  const belowTargetPct = totalExecutions > 0 ? Math.round((eventsVsTarget.below / totalExecutions) * 100) : 0;
  const nearTargetPct = totalExecutions > 0 ? Math.round((eventsVsTarget.near / totalExecutions) * 100) : 0;
  const aboveTargetPct = Math.max(0, 100 - belowTargetPct - nearTargetPct);

  const buildSparklinePoints = (series: number[], width = 132, height = 46, padding = 5) => {
    if (!series.length) return '';
    const max = Math.max(...series, 1);
    const min = Math.min(...series);
    const plotWidth = width - padding * 2;
    const plotHeight = height - padding * 2;
    return series
      .map((value, index) => {
        const normalized = max === min ? 0.5 : (value - min) / (max - min);
        const x = padding + (series.length <= 1 ? 0 : (index / (series.length - 1)) * plotWidth);
        const y = height - padding - normalized * plotHeight;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const avgSparkSeries = totalExecutions >= 2
    ? filteredEventSeries.slice(-12).map((row) => row.actual)
    : periodScenario.avgDuration.spark;
  const avgSparkPoints = buildSparklinePoints(avgSparkSeries);

  const shiftOrder: ShiftType[] = ['Shift 1 (Day)', 'Shift 2 (Day)', 'Shift 3 (Night)'];
  const shiftPerformanceTarget = avgDurationTarget;
  const shiftPerformanceSeries = totalExecutions > 0
    ? shiftOrder.map((shift) => {
      const shiftRows = filteredEventSeries.filter((row) => row.shift === shift);
      const avgDuration = shiftRows.length
        ? Math.round(shiftRows.reduce((sum, row) => sum + row.actual, 0) / shiftRows.length)
        : 0;
      return {
        shift,
        avgDuration,
        target: shiftPerformanceTarget,
        events: shiftRows.length,
      };
    })
    : periodScenario.shiftPerformance.map((row) => ({
      shift: row.shift,
      avgDuration: row.avgDuration,
      target: periodScenario.avgDuration.target,
      events: row.events,
    }));
  const shiftPerformanceMax = Math.max(
    1,
    ...shiftPerformanceSeries.map((row) => Math.max(row.avgDuration, row.target)),
  );
  const shiftPerformanceTickMax = Math.ceil(shiftPerformanceMax / 10) * 10;
  const shiftChartSize = { width: 284, height: 144 };
  const shiftChartMargin = { top: 12, right: 8, bottom: 34, left: 28 };
  const shiftChartPlotWidth = shiftChartSize.width - shiftChartMargin.left - shiftChartMargin.right;
  const shiftChartPlotHeight = shiftChartSize.height - shiftChartMargin.top - shiftChartMargin.bottom;
  const shiftBandWidth = shiftPerformanceSeries.length ? shiftChartPlotWidth / shiftPerformanceSeries.length : 0;
  const shiftBarWidth = Math.max(10, Math.min(16, shiftBandWidth * 0.25));
  const shiftXForIndex = (index: number) => shiftChartMargin.left + shiftBandWidth * index + shiftBandWidth / 2;
  const shiftYForValue = (value: number) => shiftChartMargin.top + (1 - value / shiftPerformanceTickMax) * shiftChartPlotHeight;
  const shiftShortLabel = (shift: ShiftType) => shift.replace(' (Day)', '').replace(' (Night)', '');

  const issueTypeOrder: QualityIssueType[] = [
    'Parameter out of spec',
    'Dimension out of spec',
    'Defect on first pieces',
    'Material contamination',
    'Other',
  ];
  const issueEvents = filteredEventSeries.filter((row) => row.issue);
  const qualityIssueRows = issueEvents.map((row, index) => {
    const major = row.majorIssues ?? 0;
    const minor = row.minorIssues ?? 0;
    const issues = major + minor || 1;
    return {
      id: index + 1,
      fromTo: row.changeoverType,
      shift: row.shift,
      issues,
      major,
      minor,
      topIssue: row.issueType ?? 'Other',
    };
  });
  const qualityIssuesTotal = qualityIssueRows.reduce((sum, row) => sum + row.issues, 0);
  const qualityIssuesTarget = 0;
  const qualityGap = qualityIssuesTotal - qualityIssuesTarget;
  const issuesByType = issueTypeOrder.map((issueType) => ({
    type: issueType,
    value: qualityIssueRows
      .filter((row) => row.topIssue === issueType)
      .reduce((sum, row) => sum + row.issues, 0),
  }));
  const changeoversWithIssues = qualityIssueRows.length;

  const eventStepConfig = [
    { key: 'lineClearance', label: 'Line Clearance', color: tokenBrand.main },
    { key: 'preChangeover', label: 'Pre Changeover', color: tokenWarning.main },
    { key: 'lineDownChangeover', label: 'Line Down Changeover', color: tokenSuccess.main },
    { key: 'postChangeover', label: 'Centerline', color: tokenInfo.main },
    { key: 'parameterCheck', label: 'Ramp Up & Adjustments', color: tokenBrand.light },
  ] as const;
  const splitPatterns = [
    [0.22, 0.21, 0.18, 0.19, 0.2],
    [0.2, 0.24, 0.17, 0.19, 0.2],
    [0.23, 0.2, 0.18, 0.2, 0.19],
    [0.21, 0.22, 0.19, 0.18, 0.2],
    [0.22, 0.19, 0.2, 0.18, 0.21],
  ] as const;
  const splitByStep = (total: number, index: number) => {
    const pattern = splitPatterns[index % splitPatterns.length];
    const exact = pattern.map((ratio) => ratio * total);
    const base = exact.map((value) => Math.floor(value));
    let remainder = total - base.reduce((sum, value) => sum + value, 0);
    const indexesByFraction = exact
      .map((value, stepIndex) => ({ stepIndex, fraction: value - Math.floor(value) }))
      .sort((a, b) => b.fraction - a.fraction)
      .map((row) => row.stepIndex);
    let pointer = 0;
    while (remainder > 0) {
      const targetIndex = indexesByFraction[pointer % indexesByFraction.length];
      base[targetIndex] += 1;
      remainder -= 1;
      pointer += 1;
    }
    return {
      lineClearance: base[0],
      preChangeover: base[1],
      lineDownChangeover: base[2],
      postChangeover: base[3],
      parameterCheck: base[4],
    };
  };
  const eventSeriesWithSteps = filteredEventSeries.map((point, index) => ({ ...point, steps: splitByStep(point.actual, index) }));
  const eventMaxRaw = Math.max(80, ...filteredEventSeries.map((point) => Math.max(point.actual, point.target)));
  const eventYMax = Math.ceil(eventMaxRaw / 20) * 20;
  const chartSize = { width: Math.max(640, filteredEventSeries.length * 104), height: 270 };
  const chartMargin = { left: 46, right: 22, top: 22, bottom: 94 };
  const chartPlotWidth = chartSize.width - chartMargin.left - chartMargin.right;
  const chartPlotHeight = chartSize.height - chartMargin.top - chartMargin.bottom;
  const eventBandWidth = filteredEventSeries.length ? chartPlotWidth / filteredEventSeries.length : 0;
  const eventBarWidth = Math.max(24, Math.min(38, eventBandWidth * 0.68));
  const xForIndex = (index: number) => chartMargin.left + eventBandWidth * index + eventBandWidth / 2;
  const yForDuration = (value: number) => chartMargin.top + (1 - value / eventYMax) * chartPlotHeight;
  const yTicks = Array.from({ length: eventYMax / 20 + 1 }, (_, index) => index * 20);
  const eventDateShort = periodFilter === 'today'
    ? '05/06'
    : periodFilter === 'date'
      ? specificDate.slice(5).replace('-', '/')
      : '';

  const matrixCellStyle = (gap: number) => {
    if (gap > 0) {
      return { backgroundColor: tokenError.softBg };
    }
    return { backgroundColor: tokenSuccess.softBg };
  };

  const matrixByType = filteredEventSeries.reduce<Record<string, { averageActual: number; target: number; gap: number; count: number }>>((acc, row) => {
    if (!acc[row.changeoverType]) {
      acc[row.changeoverType] = { averageActual: row.actual, target: row.target, gap: row.actual - row.target, count: 1 };
      return acc;
    }
    const nextCount = acc[row.changeoverType].count + 1;
    const nextAverage = Math.round(((acc[row.changeoverType].averageActual * acc[row.changeoverType].count) + row.actual) / nextCount);
    acc[row.changeoverType] = {
      averageActual: nextAverage,
      target: row.target,
      gap: nextAverage - row.target,
      count: nextCount,
    };
    return acc;
  }, {});

  const issueTypeColorMap: Record<QualityIssueType, string> = {
    'Parameter out of spec': tokenError.main,
    'Dimension out of spec': tokenError.dark,
    'Defect on first pieces': tokenWarning.main,
    'Material contamination': tokenSuccess.main,
    Other: tokenBrand.main,
  };
  const periodLabel = periodFilter === 'today'
    ? 'TODAY'
    : periodFilter === 'actualWeek'
      ? 'ACTUAL WEEK'
      : periodFilter === 'lastWeek'
        ? 'LAST WEEK'
        : periodFilter === 'mtd'
          ? 'MONTH TO DATE'
          : periodFilter === 'lastMonth'
            ? 'LAST MONTH'
          : periodFilter === 'ytd'
            ? 'YEAR TO DATE'
            : 'CUSTOM DATE';

  const weeklyDays: Array<WeeklyPlanTask['day']> = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const selectedReplaySeed = selectedReplayActivity
    ? {
      replayId: selectedReplayActivity.replayId ?? `${selectedReplayActivity.activityId}-replay`,
      headerTitle: `Changeover Execution - ${selectedReplayActivity.equipment}`,
      elapsedSeconds: selectedReplayActivity.replayElapsedSeconds ?? 1800,
      comment: selectedReplayActivity.replayComment ?? `${selectedReplayActivity.description} executed and documented for review.`,
      responsible: selectedReplayActivity.responsible,
    }
    : undefined;
  const openMaintenanceRequestFromAbnormality = (row: ChangeoverAbnormalityRow) => {
    handleShiftLogbookTicketSelect({
      category: 'Maintenance Request',
      number: row.activityId.replace('ABN-', 'SL-'),
      workOrder: `WO-${row.activityId.replace(/[^0-9]/g, '')}`,
      oee: '91.6%',
      availability: '94.2%',
      performance: '93.1%',
      quality: '98.6%',
      location: `${row.area} - ${row.line}`,
      equipment: row.equipment,
      title: row.description,
      description: `During changeover on ${row.line} (${row.area}), I noticed ${row.description.toLowerCase()} on ${row.equipment}. I paused the activity, informed the line leader, and opened this maintenance request for follow-up.`,
      reportedBy: row.responsible,
      date: row.createdAt,
    });
  };

  return (
    <Box sx={{ flexGrow: 1, overflowY: 'auto', bgcolor: 'background.default', p: { xs: 2, md: 4 } }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) auto' }, gap: 1.5, alignItems: 'center' }}>
          <Box sx={{ maxWidth: 720 }}>
            <Typography variant="h5" sx={{ color: tokenText.primary, fontWeight: 700, fontSize: '1.5rem', lineHeight: 1.334, letterSpacing: 0 }}>
              Equipment Setup Changeover Monitoring
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: periodFilter === 'date' ? 'repeat(7, minmax(108px, 1fr))' : 'repeat(6, minmax(116px, 1fr))' }, gap: 0.9, alignItems: 'end', justifyContent: 'end', width: { xs: '100%', md: 'fit-content' }, ml: 'auto' }}>
            <FormControl size="small" sx={{ minWidth: 165 }}>
              <InputLabel id="co-period-filter-label">Period</InputLabel>
              <Select labelId="co-period-filter-label" value={periodFilter} label="Period" onChange={(event) => setPeriodFilter(event.target.value as PeriodFilter)}>
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="actualWeek">Actual Week</MenuItem>
                <MenuItem value="lastWeek">Last Week</MenuItem>
                <MenuItem value="mtd">Month to Date</MenuItem>
                <MenuItem value="lastMonth">Last Month</MenuItem>
                <MenuItem value="ytd">Year to Date</MenuItem>
                <MenuItem value="date">Custom Date</MenuItem>
              </Select>
            </FormControl>
            {periodFilter === 'date' ? (
              <FormControl size="small" sx={{ minWidth: 165 }}>
                <InputLabel id="co-specific-date-label">Date</InputLabel>
                <Select labelId="co-specific-date-label" value={specificDate} label="Date" onChange={(event) => setSpecificDate(event.target.value)}>
                  <MenuItem value="2026-05-06">May 6, 2026</MenuItem>
                  <MenuItem value="2026-05-05">May 5, 2026</MenuItem>
                  <MenuItem value="2026-05-04">May 4, 2026</MenuItem>
                </Select>
              </FormControl>
            ) : null}
            <FormControl size="small" sx={{ minWidth: 135 }}>
              <InputLabel id="co-shift-filter-label">Shift</InputLabel>
              <Select labelId="co-shift-filter-label" value={shiftFilter} label="Shift" onChange={(event) => setShiftFilter(event.target.value as 'all' | ShiftType)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Shift 1 (Day)">Shift 1 (Day)</MenuItem>
                <MenuItem value="Shift 2 (Day)">Shift 2 (Day)</MenuItem>
                <MenuItem value="Shift 3 (Night)">Shift 3 (Night)</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="co-line-filter-label">Line</InputLabel>
              <Select labelId="co-line-filter-label" value={lineFilter} label="Line" onChange={(event) => setLineFilter(event.target.value as 'all' | LineType)}>
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="Line A">Line A</MenuItem>
                <MenuItem value="Line B">Line B</MenuItem>
                <MenuItem value="Line C">Line C</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="co-equipment-filter-label">Equipment</InputLabel>
              <Select labelId="co-equipment-filter-label" value={equipmentFilter} label="Equipment" onChange={(event) => setEquipmentFilter(event.target.value)}>
                <MenuItem value="all">All</MenuItem>
                {equipmentOptions.map((equipment) => (
                  <MenuItem key={`co-equipment-${equipment}`} value={equipment}>{equipment}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 132 }}>
              <InputLabel id="co-from-filter-label">From</InputLabel>
              <Select labelId="co-from-filter-label" value={fromSkuFilter} label="From" onChange={(event) => handleFromSkuFilterChange(event.target.value)}>
                <MenuItem value="all">All</MenuItem>
                {fromSkuOptions.map((fromSku) => (
                  <MenuItem key={`co-from-${fromSku}`} value={fromSku}>{fromSku}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 132 }}>
              <InputLabel id="co-to-filter-label">To</InputLabel>
              <Select labelId="co-to-filter-label" value={toSkuFilter} label="To" onChange={(event) => handleToSkuFilterChange(event.target.value)}>
                <MenuItem value="all">All</MenuItem>
                {toSkuOptions.map((toSku) => (
                  <MenuItem key={`co-to-${toSku}`} value={toSku}>{toSku}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <Paper elevation={0} sx={assistantPanelSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
            <InsightsIcon sx={{ fontSize: 16, color: tokenBrand.main }} />
            <Typography variant="caption" sx={{ color: tokenBrand.main, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              BLU.AI Insights
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'grid', gap: 0.5 }}>
          {insights.map((insight, index) => (
            <Box key={insight.key} sx={{ px: index === 0 ? 2 : 1, py: index === 0 ? 1.5 : 0.5, borderRadius: '6px', border: index === 0 ? `1px solid ${tokenDivider}` : '1px solid transparent', bgcolor: index === 0 ? 'rgba(0,0,0,0.03)' : 'transparent' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                <Box sx={{ color: insight.accent, display: 'flex', flexShrink: 0 }}>
                  {insight.icon}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontSize: '0.75rem', color: tokenText.secondary, fontWeight: 400, lineHeight: 1.3 }}>
                    <Box component="span" sx={{ color: tokenText.primary, fontWeight: 700 }}>
                      {insight.title}
                    </Box>
                    {' - '}
                    {insight.subtitle}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Paper>

      <Grid container spacing={1.4} sx={{ mb: 2.15 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <Paper elevation={0} sx={metricCardSx}>
            <Typography sx={{ fontSize: '0.78rem', ...analyticsTitleSx }}>AVG CHANGEOVER DURATION</Typography>
            <Typography sx={{ fontSize: '0.74rem', color: tokenText.secondary, mt: 0.25, fontWeight: 500 }}>vs target</Typography>
            <Box sx={{ mt: 0.95, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box sx={{ pt: 0.35 }}>
                <Typography sx={{ fontSize: '2.35rem', lineHeight: 1, fontWeight: 700, color: tokenBrand.main }}>{avgDurationValue} min</Typography>
                <Typography sx={{ mt: 0.48, fontSize: '0.76rem', color: tokenText.primary, fontWeight: 500 }}>Target: {avgDurationTarget} min</Typography>
                <Typography sx={{ mt: 0.32, fontSize: '0.75rem', color: avgDurationGap > 0 ? tokenError.dark : tokenSuccess.darker, fontWeight: 700 }}>
                  {avgDurationTrendPct >= 0 ? '+' : ''}{avgDurationTrendPct}% vs target
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 0.2 }}>
                <svg width="132" height="46" viewBox="0 0 132 46" aria-label="Average changeover duration trend">
                  <polyline fill="none" stroke={tokenBrand.main} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={avgSparkPoints} />
                </svg>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <Paper elevation={0} sx={metricCardSx}>
            <Typography sx={{ fontSize: '0.78rem', ...analyticsTitleSx }}>CHANGEOVER EVENTS VS TARGET</Typography>
            <Typography sx={{ fontSize: '0.74rem', color: tokenText.secondary, mt: 0.25, fontWeight: 500 }}>{totalExecutions} changeovers {periodDescriptor}</Typography>
            <Box sx={{ mt: 0.9, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 0.7 }}>
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.45 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '2.1rem', lineHeight: 1, fontWeight: 700, color: tokenSuccess.darker, whiteSpace: 'nowrap' }}>{eventsVsTarget.below}</Typography>
                  <Typography sx={{ mt: 0.16, fontSize: '0.72rem', color: tokenText.primary, fontWeight: 500, whiteSpace: 'nowrap' }}>Below Target</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '2.1rem', lineHeight: 1, fontWeight: 700, color: tokenWarning.dark, whiteSpace: 'nowrap' }}>{eventsVsTarget.near}</Typography>
                  <Typography sx={{ mt: 0.16, fontSize: '0.72rem', color: tokenText.primary, fontWeight: 500, whiteSpace: 'nowrap' }}>Near Target</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography sx={{ fontSize: '2.1rem', lineHeight: 1, fontWeight: 700, color: tokenError.dark, whiteSpace: 'nowrap' }}>{eventsVsTarget.above}</Typography>
                  <Typography sx={{ mt: 0.16, fontSize: '0.72rem', color: tokenText.primary, fontWeight: 500, whiteSpace: 'nowrap' }}>Above Target</Typography>
                </Box>
              </Box>
              <Box>
                <Box sx={{ mt: 1, height: 12, borderRadius: 999, border: `1px solid ${tokenDivider}`, overflow: 'hidden', display: 'flex' }}>
                  <Box sx={{ width: `${belowTargetPct}%`, bgcolor: tokenSuccess.main }} />
                  <Box sx={{ width: `${nearTargetPct}%`, bgcolor: tokenWarning.main }} />
                  <Box sx={{ width: `${aboveTargetPct}%`, bgcolor: tokenError.main }} />
                </Box>
                <Box sx={{ mt: 0.6, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 0.6 }}>
                  <Typography sx={{ fontSize: '0.72rem', color: tokenSuccess.darker, fontWeight: 700, textAlign: 'center' }}>{belowTargetPct}%</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: tokenWarning.dark, fontWeight: 700, textAlign: 'center' }}>{nearTargetPct}%</Typography>
                  <Typography sx={{ fontSize: '0.72rem', color: tokenError.dark, fontWeight: 700, textAlign: 'center' }}>{aboveTargetPct}%</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 2 }}>
          <Paper elevation={0} sx={metricCardSx}>
            <Typography sx={{ fontSize: '0.78rem', ...analyticsTitleSx }}>SHIFT PERFORMANCE TREND</Typography>
            <Typography sx={{ fontSize: '0.74rem', color: tokenText.secondary, mt: 0.25, fontWeight: 500 }}>3 shifts: actual vs same target</Typography>
            <Box sx={{ mt: 0.75, display: 'flex', alignItems: 'center', gap: 1.1, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 0.4, bgcolor: tokenBrand.main }} />
                <Typography sx={{ fontSize: '0.67rem', color: tokenText.primary, fontWeight: 500 }}>Actual</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: 0.4, bgcolor: tokenWarning.main }} />
                <Typography sx={{ fontSize: '0.67rem', color: tokenText.primary, fontWeight: 500 }}>Target ({shiftPerformanceTarget} min)</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 0.5, flex: 1, minHeight: 136, overflow: 'hidden' }}>
              <Box
                component="svg"
                viewBox={`0 0 ${shiftChartSize.width} ${shiftChartSize.height}`}
                preserveAspectRatio="xMidYMid meet"
                aria-label="Shift performance chart"
                sx={{ width: '100%', height: '100%', display: 'block', maxWidth: '100%' }}
              >
                <line x1={shiftChartMargin.left} y1={shiftYForValue(0)} x2={shiftChartSize.width - shiftChartMargin.right} y2={shiftYForValue(0)} stroke={tokenDivider} strokeWidth="1.1" />
                {[0, Math.round(shiftPerformanceTickMax / 2), shiftPerformanceTickMax].map((tick) => {
                  const y = shiftYForValue(tick);
                  return (
                    <g key={`shift-tick-${tick}`}>
                      <line x1={shiftChartMargin.left} y1={y} x2={shiftChartSize.width - shiftChartMargin.right} y2={y} stroke={tokenDivider} strokeWidth="1" />
                      <text x={shiftChartMargin.left - 6} y={y + 3} textAnchor="end" fontSize="9" fill={tokenText.secondary}>{tick}</text>
                    </g>
                  );
                })}
                {shiftPerformanceSeries.map((row, index) => {
                  const centerX = shiftXForIndex(index);
                  const actualY = shiftYForValue(row.avgDuration);
                  const targetY = shiftYForValue(row.target);
                  return (
                    <g key={`shift-bar-${row.shift}`}>
                      <rect
                        x={centerX - shiftBarWidth - 2}
                        y={actualY}
                        width={shiftBarWidth}
                        height={Math.max(1, shiftYForValue(0) - actualY)}
                        fill={tokenBrand.main}
                        rx="2"
                      />
                      <rect
                        x={centerX + 2}
                        y={targetY}
                        width={shiftBarWidth}
                        height={Math.max(1, shiftYForValue(0) - targetY)}
                        fill={tokenWarning.main}
                        rx="2"
                      />
                      <text x={centerX} y={shiftChartSize.height - 10} textAnchor="middle" fontSize="9.5" fill={tokenText.primary} fontWeight="700">
                        {shiftShortLabel(row.shift)}
                      </text>
                    </g>
                  );
                })}
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper elevation={0} sx={{ ...metricCardSx, display: 'block' }}>
            <Typography sx={{ fontSize: '0.78rem', ...analyticsTitleSx }}>QUALITY ISSUES REPORTED</Typography>
            <Typography sx={{ fontSize: '0.74rem', color: tokenText.secondary, mt: 0.22, fontWeight: 500 }}>
              Issues found during parameter checks until line reaches nominal speed.
            </Typography>
            <Box sx={{ mt: 0.9, display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.22fr 1.25fr 0.53fr' }, gap: 0.85 }}>
              <Box sx={{ pr: 0.4 }}>
                <Typography sx={{ fontSize: '2.2rem', lineHeight: 1, color: tokenBrand.main, fontWeight: 700 }}>{qualityIssuesTotal}</Typography>
                <Typography sx={{ mt: 0.15, fontSize: '0.72rem', color: tokenText.primary, fontWeight: 500 }}>Total issues {periodFilter === 'today' ? 'today' : periodDescriptor}</Typography>
                <Typography sx={{ mt: 0.56, fontSize: '0.72rem', color: tokenText.primary, fontWeight: 500 }}>Target: {qualityIssuesTarget}</Typography>
                <Typography sx={{ mt: 0.15, fontSize: '0.73rem', color: qualityGap > 0 ? tokenError.dark : tokenSuccess.darker, fontWeight: 700 }}>
                  {qualityGap >= 0 ? '+' : ''}{qualityGap} vs target
                </Typography>
                <Paper elevation={0} sx={{ mt: 1.1, p: 0.7, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest }}>
                  <Typography sx={{ fontSize: '1rem', lineHeight: 1, color: tokenBrand.main, fontWeight: 700 }}>{changeoversWithIssues}</Typography>
                  <Typography sx={{ mt: 0.22, fontSize: '0.67rem', color: tokenText.secondary, fontWeight: 500 }}>changeovers with issues</Typography>
                </Paper>
              </Box>
              <TableContainer sx={{ borderRadius: '8px', border: `1px solid ${tokenDivider}`, overflowX: 'hidden' }}>
                <Table
                  size="small"
                  sx={{
                    tableLayout: 'fixed',
                    width: '100%',
                    '& th, & td': {
                      borderBottom: `1px solid ${tokenDivider}`,
                      px: 0.5,
                    },
                  }}
                >
                  <TableHead>
                    <TableRow sx={{ '& th': { bgcolor: tokenNeutral.lightest, color: tokenText.secondary, fontWeight: 700, fontSize: '0.66rem', py: 0.8 } }}>
                      <TableCell sx={{ width: '6%' }}>#</TableCell>
                      <TableCell sx={{ width: '26%' }}>From + To</TableCell>
                      <TableCell sx={{ width: '13%' }}>Shift</TableCell>
                      <TableCell sx={{ width: '9%' }}>Issues</TableCell>
                      <TableCell sx={{ width: '9%' }}>Major</TableCell>
                      <TableCell sx={{ width: '9%' }}>Minor</TableCell>
                      <TableCell sx={{ width: '28%' }}>Top issue</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {qualityIssueRows.slice(0, 5).map((row) => (
                      <TableRow key={`quality-row-${row.id}`} sx={{ '& td': { fontSize: '0.68rem', py: 0.62, color: tokenText.primary, fontWeight: 500 } }}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.15 }}>{row.fromTo}</TableCell>
                        <TableCell sx={{ whiteSpace: 'normal', lineHeight: 1.15 }}>{shiftShortLabel(row.shift)}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{row.issues}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{row.major}</TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>{row.minor}</TableCell>
                        <TableCell sx={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.15 }}>{row.topIssue}</TableCell>
                      </TableRow>
                    ))}
                    {!qualityIssueRows.length ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ textAlign: 'center', fontSize: '0.7rem', color: tokenText.disabled, py: 1.4 }}>
                          No issues for selected filters.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </TableContainer>
              <Box sx={{ pl: { xs: 0, lg: 0.25 } }}>
                <Typography sx={{ fontSize: '0.72rem', ...analyticsTitleSx }}>Issues By Type</Typography>
                <Box sx={{ mt: 0.5, display: 'grid', gap: 0.5 }}>
                  {issuesByType.map((issueType) => (
                    <Box key={`issue-type-${issueType.type}`} sx={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr) auto', alignItems: 'center', gap: 0.35 }}>
                      <Box sx={{ width: 9, height: 9, borderRadius: '50%', bgcolor: issueTypeColorMap[issueType.type] }} />
                      <Typography sx={{ fontSize: '0.68rem', color: tokenText.primary, fontWeight: 500, lineHeight: 1.1 }}>{issueType.type}</Typography>
                      <Typography sx={{ fontSize: '0.72rem', color: tokenText.primary, fontWeight: 700 }}>{issueType.value}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2.25, alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex' }}>
          <Paper elevation={0} sx={analyticsCardSx}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.85 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
                <Typography variant="caption" sx={analyticsTitleSx}>
                  CHANGEOVER EVENTS ({periodLabel}) - DURATION BY STEP
                </Typography>
                <InfoOutlinedIcon sx={{ fontSize: 14, color: tokenText.secondary }} />
              </Box>
              <Typography sx={{ fontSize: '0.72rem', color: tokenBrand.main, fontWeight: 500 }}>View full screen</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.35, px: 0.1, mb: 0.35, flexWrap: 'wrap' }}>
              {eventStepConfig.map((step, index) => (
                <Box key={`event-step-${step.key}`} sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                  <Box sx={{ width: 13, height: 13, borderRadius: 0.4, bgcolor: step.color, color: tokenCommon.white, fontSize: '0.54rem', fontWeight: 900, display: 'grid', placeItems: 'center', lineHeight: 1 }}>
                    {index + 1}
                  </Box>
                  <Typography sx={{ fontSize: '0.7rem', color: tokenText.primary, fontWeight: 500 }}>{step.label}</Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tokenError.main }} />
                <Typography sx={{ fontSize: '0.7rem', color: tokenText.primary, fontWeight: 500 }}>Deviation / Issue</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.35 }}>
                <Box sx={{ width: 14, height: 0, borderTop: `2px dashed ${tokenBrand.dark}` }} />
                <Typography sx={{ fontSize: '0.7rem', color: tokenText.primary, fontWeight: 500 }}>Target by changeover type</Typography>
              </Box>
            </Box>
            <Box sx={{ mt: 0.15, overflowX: 'auto', pb: 0.2 }}>
              <svg width={chartSize.width} height={chartSize.height} viewBox={`0 0 ${chartSize.width} ${chartSize.height}`} aria-label="Changeover events chart">
                <text x={10} y={chartMargin.top - 3} fontSize="10" fill={tokenText.secondary} fontWeight="700">Minutes</text>
                {yTicks.map((tick) => {
                  const y = yForDuration(tick);
                  return (
                    <g key={`tick-${tick}`}>
                      <line x1={chartMargin.left} y1={y} x2={chartSize.width - chartMargin.right} y2={y} stroke={tokenDivider} strokeWidth="1" />
                      <text x={chartMargin.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill={tokenText.secondary}>{tick}</text>
                    </g>
                  );
                })}
                <line x1={chartMargin.left} y1={yForDuration(0)} x2={chartSize.width - chartMargin.right} y2={yForDuration(0)} stroke={tokenDivider} strokeWidth="1.1" />
                {eventSeriesWithSteps.map((point, index) => {
                  const x = xForIndex(index);
                  const yBase = chartSize.height - chartMargin.bottom + 15;
                  const actualY = yForDuration(point.actual);
                  const targetY = yForDuration(point.target);
                  const placeTargetLabelRight = x + eventBarWidth / 2 + 44 <= chartSize.width - chartMargin.right + 6;
                  const targetLabelX = placeTargetLabelRight ? x + eventBarWidth / 2 + 6 : x - eventBarWidth / 2 - 6;
                  const targetLabelAnchor: 'start' | 'end' = placeTargetLabelRight ? 'start' : 'end';
                  const deviationIconY = Math.max(chartMargin.top + 6, actualY - 32);
                  let stacked = 0;
                  const segmentRects = eventStepConfig.map((step) => {
                    const value = point.steps[step.key];
                    const yTop = yForDuration(stacked + value);
                    const yBottom = yForDuration(stacked);
                    stacked += value;
                    return (
                      <rect
                        key={`stack-${point.id}-${step.key}`}
                        x={x - eventBarWidth / 2}
                        y={yTop}
                        width={eventBarWidth}
                        height={Math.max(1, yBottom - yTop)}
                        fill={step.color}
                        rx="1.5"
                      />
                    );
                  });
                  return (
                    <g key={`label-${point.id}-${index}`}>
                      {segmentRects}
                      <line
                        x1={x - eventBarWidth / 2 - 2}
                        y1={targetY}
                        x2={x + eventBarWidth / 2 + 2}
                        y2={targetY}
                        stroke={tokenBrand.dark}
                        strokeWidth="1.8"
                        strokeDasharray="3 2"
                      />
                      <text x={x} y={actualY - 7} textAnchor="middle" fontSize="10" fill={tokenText.primary} fontWeight="700">{point.actual}</text>
                      <text x={targetLabelX} y={targetY + 3} textAnchor={targetLabelAnchor} fontSize="8.5" fill={tokenBrand.dark} fontWeight="700">Tgt {point.target}</text>
                      {point.issue ? (
                        <g>
                          <circle cx={x} cy={deviationIconY} r={5.4} fill={tokenError.main} />
                          <text x={x} y={deviationIconY + 2.1} textAnchor="middle" fontSize="7.4" fill={tokenCommon.white} fontWeight="900">!</text>
                        </g>
                      ) : null}
                      <text x={x} y={yBase} textAnchor="middle" fontSize="9" fill={tokenText.primary} fontWeight="700">{point.changeoverType}</text>
                      <text x={x} y={yBase + 12} textAnchor="middle" fontSize="8.8" fill={tokenText.secondary}>
                        {eventDateShort ? `${eventDateShort} ${point.time}` : point.time}
                      </text>
                      <text x={x} y={yBase + 24} textAnchor="middle" fontSize="8.4" fill={tokenText.secondary}>{point.shift}</text>
                    </g>
                  );
                })}
              </svg>
            </Box>
            <Box sx={{ mt: 0.35, display: 'flex', alignItems: 'center', gap: 0.45, pl: 0.12 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: tokenError.main }} />
              <Typography sx={{ fontSize: '0.67rem', color: tokenText.secondary, fontWeight: 500 }}>
                Red marker indicates deviation recorded by operator or issue report opened.
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex' }}>
          <Paper elevation={0} sx={{ ...analyticsCardSx, p: 1.55, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'grid', gap: 0.45, mb: 0.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.55 }}>
                <Typography variant="caption" sx={analyticsTitleSx}>CHANGEOVER DURATION MATRIX</Typography>
                <InfoOutlinedIcon sx={{ fontSize: 14, color: tokenText.secondary }} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flexWrap: 'wrap', justifyContent: 'flex-end', width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: tokenError.softBg, border: `1px solid ${tokenDivider}` }} />
                  <Typography sx={{ fontSize: '0.68rem', color: tokenText.secondary, fontWeight: 500 }}>Beyond target</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: 0.5, bgcolor: tokenSuccess.softBg, border: `1px solid ${tokenDivider}` }} />
                  <Typography sx={{ fontSize: '0.68rem', color: tokenText.secondary, fontWeight: 500 }}>Within target</Typography>
                </Box>
              </Box>
            </Box>
            <TableContainer sx={{ borderRadius: 1.45, maxHeight: 232 }}>
              <Table size="small" stickyHeader sx={{ '& th, & td': { borderBottom: 'none', px: 0.7, py: 0.5 } }}>
                <TableHead>
                  <TableRow sx={{ '& th': { bgcolor: tokenNeutral.lightest, color: tokenText.primary, fontWeight: 700, fontSize: '0.71rem', borderBottom: 'none' } }}>
                    <TableCell sx={{ minWidth: 74 }}>From \ To</TableCell>
                    {MATRIX_SKUS.map((sku) => (
                      <TableCell key={`matrix-head-${sku}`} align="center">{sku}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {MATRIX_SKUS.map((fromSku) => (
                    <TableRow key={`matrix-row-${fromSku}`}>
                      <TableCell sx={{ fontSize: '0.74rem', color: tokenText.primary, fontWeight: 700 }}>{fromSku}</TableCell>
                      {MATRIX_SKUS.map((toSku) => {
                        if (fromSku === toSku) {
                          return (
                            <TableCell key={`matrix-${fromSku}-${toSku}`} align="center" sx={{ fontSize: '0.74rem', color: tokenText.secondary, fontWeight: 500 }}>
                              -
                            </TableCell>
                          );
                        }
                        const changeoverType = `${fromSku} -> ${toSku}`;
                        const filteredOutByType = !matchesSkuFilters(changeoverType, fromSkuFilter, toSkuFilter);
                        const matrixStats = matrixByType[changeoverType];
                        if (filteredOutByType || !matrixStats) {
                          return (
                            <TableCell key={`matrix-${fromSku}-${toSku}`} align="center" sx={{ fontSize: '0.72rem', color: tokenText.disabled, fontWeight: 500 }}>
                              -
                            </TableCell>
                          );
                        }
                        const actual = matrixStats.averageActual;
                        const expected = matrixStats.target;
                        const gap = actual - expected;
                        const isWithinTarget = gap <= 0;
                        return (
                          <TableCell key={`matrix-${fromSku}-${toSku}`} align="center" sx={{ ...matrixCellStyle(gap), fontSize: '0.71rem', py: 0.55 }}>
                            <Typography sx={{ fontSize: '0.76rem', color: isWithinTarget ? tokenSuccess.darker : tokenError.dark, fontWeight: 700, lineHeight: 1.2 }}>
                              {actual} min
                            </Typography>
                            <Typography sx={{ fontSize: '0.68rem', color: tokenText.primary, fontWeight: 500, lineHeight: 1.2 }}>
                              Target: {expected} min
                            </Typography>
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ ...pageCardSx, overflow: 'hidden' }}>
        <Box sx={{ px: 2.25, py: 0, borderBottom: `1px solid ${tokenDivider}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
          <Tabs
            value={listType}
            onChange={(_, value) => setListType(value)}
            sx={{
              minHeight: 44,
              '& .MuiTabs-indicator': { bgcolor: tokenBrand.main, height: 2 },
              '& .MuiTab-root': {
                minHeight: 44,
                py: 1.5,
                color: tokenText.secondary,
                fontSize: '0.875rem',
                fontWeight: 500,
                letterSpacing: '0.1px',
                textTransform: 'uppercase',
              },
              '& .Mui-selected': { color: tokenText.primary, fontWeight: 700 },
            }}
          >
            <Tab value="activities" label={`Activities (${filteredActivities.length})`} />
            <Tab value="abnormalities" label={`Abnormalities (${filteredAbnormalities.length})`} />
          </Tabs>

        </Box>

        {mode === 'overview' ? (
          <TableContainer>
            <Table size="small" sx={{ minWidth: 1260 }}>
                <TableHead>
                  <TableRow sx={{ '& th': { color: tokenText.secondary, fontSize: '0.875rem', fontWeight: 500, textTransform: 'none', borderBottom: `1px solid ${tokenDivider}`, py: 1.2 } }}>
                    <TableCell sx={{ pl: 2.25 }}>Activity ID</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Shift</TableCell>
                    <TableCell>Line</TableCell>
                    <TableCell>Area</TableCell>
                    <TableCell>Equipment / Machine</TableCell>
                    <TableCell>Estimated Time</TableCell>
                    <TableCell>Actual Time</TableCell>
                    <TableCell>Responsible</TableCell>
                    <TableCell>Created At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {listType === 'activities'
                    ? filteredActivities.map((row) => {
                      const tone = activityStatusTone(row.status);
                      const clickable = row.status === 'Done' || row.status === 'Waiting Review';
                      return (
                        <TableRow
                          key={row.activityId}
                          onClick={() => (clickable ? setSelectedReplayActivity(row) : undefined)}
                          sx={{
                            '& td': { borderBottom: `1px solid ${tokenDivider}`, py: 1.05 },
                            cursor: clickable ? 'pointer' : 'default',
                          }}
                        >
                          <TableCell sx={{ pl: 2.25, fontSize: '0.8rem', color: tokenBrand.main, fontWeight: 700 }}>{row.activityId}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.type}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.primary, fontWeight: 700 }}>{row.description}</TableCell>
                          <TableCell>
                            <Chip size="small" label={row.status} sx={{ height: 22, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontWeight: 800 }} />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.shift}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.line}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.area}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.equipment}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.estimatedTime}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.status === 'Done' || row.status === 'Waiting Review' ? row.actualTime : '-'}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.responsible}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.createdAt}</TableCell>
                        </TableRow>
                      );
                    })
                    : filteredAbnormalities.map((row) => {
                      const tone = abnormalityStatusTone(row.status);
                      const clickable = canOpenMaintenanceRequest(row.status);
                      return (
                        <TableRow
                          key={row.activityId}
                          onClick={() => (clickable ? openMaintenanceRequestFromAbnormality(row) : undefined)}
                          sx={{
                            '& td': { borderBottom: `1px solid ${tokenDivider}`, py: 1.05 },
                            cursor: clickable ? 'pointer' : 'default',
                          }}
                        >
                          <TableCell sx={{ pl: 2.25, fontSize: '0.8rem', color: tokenBrand.main, fontWeight: 700 }}>{row.activityId}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.type}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.primary, fontWeight: 700 }}>{row.description}</TableCell>
                          <TableCell>
                            <Chip size="small" label={row.status} sx={{ height: 22, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontWeight: 800 }} />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.shift}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.line}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.area}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.equipment}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.estimatedTime}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.actualTime}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.responsible}</TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', color: tokenText.secondary }}>{row.createdAt}</TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 1.5, overflowX: 'auto' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(165px, 1fr))', gap: 1, width: '100%' }}>
              {weeklyDays.map((day) => {
                const tasks = filteredWeeklyTasks.filter((task) => task.day === day);
                const done = tasks.filter((task) => task.status === 'Done').length;
                return (
                  <Paper key={`weekly-${day}`} elevation={0} sx={{ minHeight: 250, borderRadius: '12px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ px: 1.1, py: 0.85, borderBottom: `1px solid ${tokenDivider}`, bgcolor: tokenNeutral.lightest, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: tokenText.primary }}>{day}</Typography>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: tokenSuccess.darker }}>{done}/{tasks.length}</Typography>
                    </Box>
                    <Box sx={{ p: 0.85, display: 'grid', gap: 0.7 }}>
                      {tasks.map((task) => {
                        const tone = activityStatusTone(task.status);
                        return (
                          <Paper key={task.id} elevation={0} sx={{ p: 0.7, borderRadius: '8px', border: `1px solid ${tokenDivider}`, bgcolor: 'background.paper' }}>
                            <Typography sx={{ fontSize: '0.77rem', color: tokenText.primary, fontWeight: 700, lineHeight: 1.2 }}>{task.title}</Typography>
                            <Typography sx={{ fontSize: '0.72rem', color: tokenText.secondary, mt: 0.2 }}>{task.equipment}</Typography>
                            <Typography sx={{ fontSize: '0.71rem', color: tokenText.secondary }}>{task.shift}</Typography>
                            <Box sx={{ mt: 0.45 }}>
                              <Chip size="small" label={task.status} sx={{ height: 20, bgcolor: tone.bg, color: tone.color, border: `1px solid ${tone.border}`, fontWeight: 800 }} />
                            </Box>
                          </Paper>
                        );
                      })}
                      {!tasks.length ? <Typography sx={{ fontSize: '0.72rem', color: tokenText.disabled, textAlign: 'center', mt: 0.8 }}>No tasks</Typography> : null}
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          </Box>
        )}
      </Paper>
      {selectedReplayActivity ? (
        <Box aria-hidden sx={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}>
          <WorkstationEquipmentChangeoverWidget
            completedFlowSeed={selectedReplaySeed}
            reviewMode={selectedReplayActivity.status === 'Waiting Review' ? 'line-leader' : undefined}
            onCompleteReview={completeWaitingReview}
            onReturnReview={returnWaitingReview}
            onExecutionClose={() => setSelectedReplayActivity(null)}
          />
        </Box>
      ) : null}
    </Box>
  );
};

export default EquipmentChangeoverScreen;
